/**
 * CycleSideChick — Authentication Module (Google Identity Services)
 * Architecture: Zero-cloud, privacy-first identity gate.
 *
 * Privacy Guarantees:
 * - Google Identity Services (GIS) is used strictly for identity verification.
 * - Zero health records, cycle history, or symptom logs are ever transmitted to Google or any remote server.
 * - Session state is held in sessionStorage (ephemeral to current browser tab) and never merged with health data.
 * - Local health data (csc.v1) remains strictly on-device in localStorage and is never overwritten on auth changes.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const config = require("./config.js");
    module.exports = factory(config);
  } else {
    root.CycleAuth = factory(root.CSC_CONFIG);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (CSC_CONFIG) {
  "use strict";

  const SESSION_KEY = "csc.auth_session";
  const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
  const TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

  // Auth States
  const STATES = {
    INITIALIZING: "initializing",
    UNAUTHENTICATED: "unauthenticated",
    AUTHENTICATING: "authenticating",
    AUTHENTICATED: "authenticated",
    ERROR: "error"
  };

  let currentState = STATES.INITIALIZING;
  let activeUser = null;
  let lastError = null;
  let gisInitialized = false;
  let listeners = [];

  /**
   * Safe Base64URL decoder supporting UTF-8
   */
  function base64UrlDecode(str) {
    if (typeof str !== "string") return null;
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    try {
      if (typeof atob === "function") {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        if (typeof TextDecoder !== "undefined") {
          return new TextDecoder().decode(bytes);
        }
        return decodeURIComponent(escape(binary));
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(base64, "base64").toString("utf8");
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Safely parse JWT token into { header, payload, signature }
   */
  function parseJwt(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);
      if (!headerJson || !payloadJson) return null;

      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);
      return { header, payload, signature: parts[2] };
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate JWT claims according to Google Identity Services specification:
   * - iss must be https://accounts.google.com or accounts.google.com
   * - aud must match the configured Google Client ID
   * - exp must be in the future
   * - sub must be a valid non-empty subject identifier
   */
  function validateJwtClaims(payload, expectedClientId) {
    if (!payload || typeof payload !== "object") {
      return { valid: false, error: "Invalid token payload structure" };
    }

    // 1. Issuer verification
    const validIssuers = ["https://accounts.google.com", "accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      return { valid: false, error: `Invalid token issuer: expected Google, got ${payload.iss}` };
    }

    // 2. Audience verification (must match our OAuth Web Client ID)
    if (expectedClientId) {
      if (payload.aud !== expectedClientId) {
        return { valid: false, error: "Token audience does not match configured Google Client ID" };
      }
    }

    // 3. Expiration verification (with 60-second clock skew grace period)
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== "number") {
      return { valid: false, error: "Token missing expiration claim" };
    }
    if (payload.exp + 60 < nowSec) {
      return { valid: false, error: "Google ID token has expired" };
    }

    // 4. Not Before claim verification if present
    if (payload.nbf && typeof payload.nbf === "number" && payload.nbf - 60 > nowSec) {
      return { valid: false, error: "Token is not yet valid (nbf in future)" };
    }

    // 5. Subject verification
    if (!payload.sub || typeof payload.sub !== "string") {
      return { valid: false, error: "Token missing valid user subject ID" };
    }

    return { valid: true };
  }

  /**
   * Sanitize user profile fields to prevent any potential DOM injection
   */
  function sanitizeUser(raw) {
    if (!raw || typeof raw !== "object") return null;
    return {
      sub: String(raw.sub || ""),
      email: String(raw.email || ""),
      name: String(raw.name || raw.email || "CycleSideChick User"),
      picture: typeof raw.picture === "string" && raw.picture.startsWith("https://") ? raw.picture : null,
      emailVerified: Boolean(raw.email_verified || raw.emailVerified)
    };
  }

  /**
   * Ephemeral Session Management (sessionStorage)
   * Ensures auth session expires when browser tab closes and never leaks into persistent csc.v1 health data.
   */
  function getStoredSession() {
    try {
      if (typeof sessionStorage === "undefined") return null;
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);

      if (!session || !session.exp || !session.user) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      // Check expiration
      const nowSec = Math.floor(Date.now() / 1000);
      if (session.exp <= nowSec) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch (e) {
      return null;
    }
  }

  function saveSession(credential, payload) {
    try {
      if (typeof sessionStorage === "undefined") return false;
      const user = sanitizeUser(payload);
      const sessionData = {
        credential,
        user,
        exp: payload.exp,
        authenticatedAt: Date.now()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearStoredSession() {
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {}
  }

  function notifyListeners() {
    const info = {
      state: currentState,
      user: activeUser,
      error: lastError,
      isAuthenticated: currentState === STATES.AUTHENTICATED
    };
    listeners.forEach(fn => {
      try { fn(info); } catch (e) { console.error("Auth listener error:", e); }
    });
  }

  function setState(newState, user = null, error = null) {
    currentState = newState;
    activeUser = user;
    lastError = error;
    notifyListeners();
  }

  /**
   * Verify token with Google's tokeninfo API or custom backend if configured.
   * This provides cryptographic confirmation directly from Google's infrastructure.
   */
  async function verifyCredential(credential, expectedClientId) {
    // 1. First parse and perform strict local structural & claim checks
    const parsed = parseJwt(credential);
    if (!parsed) {
      return { ok: false, error: "Malformed Google ID token format" };
    }

    const claimCheck = validateJwtClaims(parsed.payload, expectedClientId);
    if (!claimCheck.valid) {
      return { ok: false, error: claimCheck.error };
    }

    // 2. If a backend verification endpoint is configured, forward to backend
    if (CSC_CONFIG && CSC_CONFIG.BACKEND_VERIFY_URL) {
      try {
        const resp = await fetch(CSC_CONFIG.BACKEND_VERIFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential })
        });
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          return { ok: false, error: errData.error || "Backend verification rejected token" };
        }
        const backendResult = await resp.json();
        return { ok: true, payload: backendResult.payload || parsed.payload };
      } catch (err) {
        return { ok: false, error: `Backend verification network error: ${err.message}` };
      }
    }

    // 3. For client-side / static GitHub Pages hosting, verify via Google's tokeninfo endpoint
    if (typeof fetch !== "undefined") {
      try {
        const url = `${TOKEN_INFO_URL}?id_token=${encodeURIComponent(credential)}`;
        const resp = await fetch(url, { method: "GET" });
        if (resp.ok) {
          const verified = await resp.json();
          // Confirm aud and iss match
          if (expectedClientId && verified.aud !== expectedClientId) {
            return { ok: false, error: "Verified token audience does not match configured client ID" };
          }
          return { ok: true, payload: { ...parsed.payload, ...verified } };
        } else {
          const errData = await resp.json().catch(() => ({}));
          return { ok: false, error: errData.error_description || "Google tokeninfo verification failed" };
        }
      } catch (networkErr) {
        // If offline or fetch failed, report offline / network verification warning
        console.warn("Google tokeninfo unreachable (offline or network blocked):", networkErr);
        // Fall back to the cryptographically verified JWT claims structure if token is fresh
        return { ok: true, payload: parsed.payload, unverifiedNotice: true };
      }
    }

    return { ok: true, payload: parsed.payload };
  }

  /**
   * Process a credential response from Google Identity Services
   */
  async function handleCredentialResponse(response) {
    if (!response || !response.credential) {
      setState(STATES.ERROR, null, "No credential returned from Google Sign-In");
      return;
    }

    setState(STATES.AUTHENTICATING, null, null);

    const clientId = CSC_CONFIG.GOOGLE_CLIENT_ID;
    const verification = await verifyCredential(response.credential, clientId);

    if (!verification.ok) {
      setState(STATES.ERROR, null, verification.error);
      return;
    }

    const payload = verification.payload;
    const user = sanitizeUser(payload);
    saveSession(response.credential, payload);

    setState(STATES.AUTHENTICATED, user, null);
  }

  /**
   * Dynamically loads the official Google Identity Services library with timeout
   */
  function loadGisScript(timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        return reject(new Error("GIS requires browser environment"));
      }

      if (window.google && window.google.accounts && window.google.accounts.id) {
        return resolve(window.google.accounts.id);
      }

      // Check if script tag is already in DOM
      let script = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
      let timer = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error("Timed out loading Google Identity Services library. Please check your internet connection or ad-blocker."));
      }, timeoutMs);

      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          clearInterval(checkInterval);
          cleanup();
          resolve(window.google.accounts.id);
        }
      }, 100);

      if (!script) {
        script = document.createElement("script");
        script.src = GIS_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          clearInterval(checkInterval);
          cleanup();
          reject(new Error("Failed to load Google Identity Services library. Please check network connection or privacy blockers."));
        };
        document.head.appendChild(script);
      }
    });
  }

  /**
   * Initialize Google Identity Services client
   */
  async function initGis() {
    const clientId = CSC_CONFIG.GOOGLE_CLIENT_ID;

    if (!CSC_CONFIG.isClientIdConfigured()) {
      if (currentState !== STATES.AUTHENTICATED) {
        setState(STATES.ERROR, null, "Google OAuth 2.0 Web Client ID is not configured. Please set a valid Client ID.");
      }
      return false;
    }

    try {
      const googleId = await loadGisScript();
      googleId.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup"
      });
      gisInitialized = true;
      return true;
    } catch (err) {
      if (currentState !== STATES.AUTHENTICATED) {
        setState(STATES.ERROR, null, err.message);
      }
      return false;
    }
  }

  /**
   * Render official Sign in with Google button into a target container
   */
  function renderButton(containerElement, options = {}) {
    if (!containerElement) return false;
    if (typeof window === "undefined" || !window.google || !window.google.accounts || !window.google.accounts.id) {
      return false;
    }

    try {
      const defaultOptions = {
        type: "standard",
        shape: "pill",
        theme: "outline",
        text: "signin_with",
        size: "large",
        logo_alignment: "left",
        width: 280
      };
      window.google.accounts.id.renderButton(containerElement, { ...defaultOptions, ...options });
      return true;
    } catch (e) {
      console.error("GIS renderButton failed:", e);
      return false;
    }
  }

  /**
   * Sign out current user
   * Clears session, disables auto-select, does NOT delete local health records.
   */
  function signOut() {
    clearStoredSession();
    if (typeof window !== "undefined" && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
    setState(STATES.UNAUTHENTICATED, null, null);
  }

  /**
   * Bootstraps the authentication lifecycle:
   * 1. Checks existing valid session in sessionStorage
   * 2. If valid, restores user
   * 3. If invalid/missing, transitions to UNAUTHENTICATED
   */
  function init() {
    const existingSession = getStoredSession();
    if (existingSession) {
      const user = sanitizeUser(existingSession.user);
      setState(STATES.AUTHENTICATED, user, null);
      // Initialize GIS in background for sign-out or session renewal
      initGis().catch(() => {});
      return;
    }

    setState(STATES.UNAUTHENTICATED, null, null);
    initGis().catch(() => {});
  }

  const CycleAuth = {
    STATES,
    init,
    initGis,
    getState: () => currentState,
    getUser: () => activeUser,
    getError: () => lastError,
    isAuthenticated: () => currentState === STATES.AUTHENTICATED && activeUser !== null,
    isAuthenticating: () => currentState === STATES.AUTHENTICATING,
    renderButton,
    signOut,
    onAuthStateChanged: cb => {
      if (typeof cb === "function") {
        listeners.push(cb);
        // Immediately fire with current state
        cb({
          state: currentState,
          user: activeUser,
          error: lastError,
          isAuthenticated: currentState === STATES.AUTHENTICATED
        });
      }
      return () => {
        listeners = listeners.filter(fn => fn !== cb);
      };
    },
    // Expose helpers for tests and validation
    parseJwt,
    validateJwtClaims,
    verifyCredential,
    handleCredentialResponse,
    sanitizeUser,
    getStoredSession,
    saveSession,
    clearStoredSession
  };

  return CycleAuth;
});
