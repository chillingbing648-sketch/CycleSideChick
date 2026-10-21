/**
 * CycleSideChick — Authentication Configuration
 * OAuth 2.0 Web Client Configuration for Google Identity Services (GIS).
 *
 * Privacy Guarantees:
 * - Basic profile scopes only (openid, email, profile).
 * - No access to Google Drive, Gmail, Contacts, Calendar, or Fitness APIs.
 * - Zero health records or cycle data are ever sent to Google or remote servers.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.CSC_CONFIG = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Production Client ID placeholder.
  // Deployers can configure their OAuth 2.0 Client ID via:
  // 1. Injected window.CSC_GOOGLE_CLIENT_ID
  // 2. <meta name="google-signin-client_id" content="..."> in index.html
  // 3. Local browser override in localStorage["csc.oauth_client_id"] (useful for local development)
  // 4. Default fallback below
  const DEFAULT_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  function getMetaClientId() {
    if (typeof document !== "undefined" && document.querySelector) {
      const meta = document.querySelector('meta[name="google-signin-client_id"]');
      if (meta && meta.content && meta.content.trim()) {
        return meta.content.trim();
      }
    }
    return null;
  }

  function getStoredCustomClientId() {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem("csc.oauth_client_id");
        if (stored && stored.trim()) {
          return stored.trim();
        }
      }
    } catch (e) {}
    return null;
  }

  function resolveClientId() {
    // 1. Runtime window global
    if (typeof window !== "undefined" && window.CSC_GOOGLE_CLIENT_ID && typeof window.CSC_GOOGLE_CLIENT_ID === "string") {
      const id = window.CSC_GOOGLE_CLIENT_ID.trim();
      if (id && !id.startsWith("YOUR_GOOGLE_CLIENT_ID")) return id;
    }

    // 2. Meta tag
    const metaId = getMetaClientId();
    if (metaId && !metaId.startsWith("YOUR_GOOGLE_CLIENT_ID")) return metaId;

    // 3. Stored override for dev testing
    const customId = getStoredCustomClientId();
    if (customId && !customId.startsWith("YOUR_GOOGLE_CLIENT_ID")) return customId;

    // 4. Default placeholder
    return DEFAULT_CLIENT_ID;
  }

  const config = {
    // Current active client ID
    get GOOGLE_CLIENT_ID() {
      return resolveClientId();
    },

    // Default placeholder reference
    DEFAULT_CLIENT_ID,

    // Optional backend verification endpoint (null for 100% static GitHub Pages hosting)
    BACKEND_VERIFY_URL: (typeof window !== "undefined" && window.CSC_BACKEND_VERIFY_URL) || null,

    // Authorized Origins Reference for Google Cloud Console Setup
    AUTHORIZED_ORIGINS: [
      "https://chillingbing648-sketch.github.io",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://localhost:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5500"
    ],

    /**
     * Checks if a valid, non-placeholder Client ID is configured
     */
    isClientIdConfigured() {
      const id = this.GOOGLE_CLIENT_ID;
      return Boolean(id && typeof id === "string" && !id.startsWith("YOUR_GOOGLE_CLIENT_ID") && id.includes(".apps.googleusercontent.com"));
    },

    /**
     * Set a custom Client ID in local browser storage (for quick dev/staging setup)
     */
    setCustomClientId(newId) {
      if (!newId || typeof newId !== "string") return false;
      const clean = newId.trim();
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("csc.oauth_client_id", clean);
          return true;
        }
      } catch (e) {}
      return false;
    },

    /**
     * Clears custom local override
     */
    clearCustomClientId() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("csc.oauth_client_id");
          return true;
        }
      } catch (e) {}
      return false;
    }
  };

  return config;
});
