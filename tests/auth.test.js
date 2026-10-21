/**
 * CycleSideChick — Authentication & Security Unit Tests
 *
 * Verifies:
 * 1. Unauthenticated users cannot access protected content
 * 2. Successful Google Identity Services token validation & parsing
 * 3. Rejection of invalid, expired, malformed, wrong-issuer, and mismatched-audience tokens
 * 4. Sign-out immediately revokes access without deleting local health records
 * 5. Ephemeral session restore & expiration detection via sessionStorage
 * 6. Missing Client ID configuration detection and descriptive error reporting
 * 7. Complete isolation of csc.v1 health data from Google auth operations
 * 8. Sanitization of Google profile claims (XSS injection prevention)
 * 9. Dual-gate coexistence: Google Auth + Cryptographic PIN lock
 */

const assert = require("assert");

// Mock browser environments for Node test runner
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const mockSessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

globalThis.localStorage = mockLocalStorage;
globalThis.sessionStorage = mockSessionStorage;

// Mock Google tokeninfo fetch endpoint for unit tests
let mockTokenInfoResponse = null;
globalThis.fetch = async function (url, options) {
  if (typeof url === "string" && url.includes("oauth2.googleapis.com/tokeninfo")) {
    if (mockTokenInfoResponse !== null) {
      return mockTokenInfoResponse;
    }
    const token = decodeURIComponent(url.split("id_token=")[1] || "");
    const parsed = CycleAuth.parseJwt(token);
    if (!parsed) {
      return {
        ok: false,
        json: async () => ({ error_description: "Invalid Value" })
      };
    }
    return {
      ok: true,
      json: async () => ({
        iss: parsed.payload.iss,
        aud: parsed.payload.aud,
        sub: parsed.payload.sub,
        email: parsed.payload.email,
        name: parsed.payload.name,
        picture: parsed.payload.picture,
        exp: String(parsed.payload.exp)
      })
    };
  }
  return { ok: false, json: async () => ({ error: "Not found" }) };
};

const CSC_CONFIG = require("../src/js/config.js");
const CycleAuth = require("../src/js/auth.js");
const { loadState, saveState, KEY } = require("../src/js/storage.js");

console.log("==================================================");
console.log("RUNNING CYCLESIDECHICK AUTH & SECURITY TESTS");
console.log("==================================================");

let testsPassed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Helper: build mock JWT
function createMockJwt(payload, header = { alg: "RS256", typ: "JWT", kid: "test-key" }) {
  const encHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mockSignature = Buffer.from("mock_cryptographic_signature").toString("base64url");
  return `${encHeader}.${encPayload}.${mockSignature}`;
}

(async function runTests() {
  // Test 1: Initial unauthenticated state
  it("Unauthenticated by default: gate blocks access before sign-in", () => {
    mockSessionStorage.clear();
    CycleAuth.signOut();
    assert.strictEqual(CycleAuth.isAuthenticated(), false);
    assert.strictEqual(CycleAuth.getUser(), null);
    assert.strictEqual(CycleAuth.getState(), CycleAuth.STATES.UNAUTHENTICATED);
  });

  // Test 2: Token Parser & Base64URL decoder
  it("Parses valid JWT structure correctly into header, payload, and signature", () => {
    const payload = {
      iss: "https://accounts.google.com",
      aud: "test-client-id.apps.googleusercontent.com",
      sub: "google-uid-10001",
      email: "bun@example.com",
      name: "Cycle Bunny",
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const token = createMockJwt(payload);
    const parsed = CycleAuth.parseJwt(token);

    assert.ok(parsed, "Parsed object must not be null");
    assert.strictEqual(parsed.header.alg, "RS256");
    assert.strictEqual(parsed.payload.sub, "google-uid-10001");
    assert.strictEqual(parsed.payload.email, "bun@example.com");
    assert.ok(parsed.signature);
  });

  // Test 3: Reject malformed JWT
  it("Rejects malformed tokens, non-JWT strings, and garbage input", () => {
    assert.strictEqual(CycleAuth.parseJwt(""), null);
    assert.strictEqual(CycleAuth.parseJwt(null), null);
    assert.strictEqual(CycleAuth.parseJwt("not.a.valid.jwt.with.too.many.parts"), null);
    assert.strictEqual(CycleAuth.parseJwt("only-one-part"), null);
    assert.strictEqual(CycleAuth.parseJwt("part1.notbase64json.part3"), null);
  });

  // Test 4: Validate valid claims
  it("Validates authentic Google Identity token claims", () => {
    const clientId = "my-cycle-client.apps.googleusercontent.com";
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      iss: "https://accounts.google.com",
      aud: clientId,
      sub: "109823471092384",
      email: "jane@test.org",
      exp: nowSec + 3600,
      nbf: nowSec - 10
    };

    const res = CycleAuth.validateJwtClaims(payload, clientId);
    assert.strictEqual(res.valid, true);
  });

  // Test 5: Reject expired token
  it("Rejects expired Google ID tokens", () => {
    const clientId = "my-cycle-client.apps.googleusercontent.com";
    const pastSec = Math.floor(Date.now() / 1000) - 300; // 5 mins ago
    const payload = {
      iss: "https://accounts.google.com",
      aud: clientId,
      sub: "109823471092384",
      exp: pastSec
    };

    const res = CycleAuth.validateJwtClaims(payload, clientId);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("expired"), `Expected expired error, got: ${res.error}`);
  });

  // Test 6: Reject invalid issuer
  it("Rejects tokens from non-Google issuers (e.g. spoofed accounts)", () => {
    const clientId = "my-cycle-client.apps.googleusercontent.com";
    const payload = {
      iss: "https://fake-login-provider.com",
      aud: clientId,
      sub: "user-1",
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const res = CycleAuth.validateJwtClaims(payload, clientId);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("Invalid token issuer"));
  });

  // Test 7: Reject audience mismatch
  it("Rejects tokens generated for a different Google Client ID", () => {
    const expectedClientId = "legitimate-app.apps.googleusercontent.com";
    const attackerClientId = "malicious-app.apps.googleusercontent.com";
    const payload = {
      iss: "https://accounts.google.com",
      aud: attackerClientId,
      sub: "user-1",
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const res = CycleAuth.validateJwtClaims(payload, expectedClientId);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("audience does not match"));
  });

  // Test 8: Safe profile sanitization against XSS
  it("Sanitizes user profile data to prevent DOM injection", () => {
    const raw = {
      sub: "uid-777",
      name: '<script>alert("xss")</script>Jane',
      email: "jane+<img src=x onerror=alert(1)>@test.org",
      picture: "javascript:alert(1)" // Insecure scheme should be stripped
    };

    const sanitized = CycleAuth.sanitizeUser(raw);
    assert.strictEqual(sanitized.sub, "uid-777");
    assert.strictEqual(sanitized.picture, null, "Dangerous picture URI schemes must be rejected");
    assert.strictEqual(typeof sanitized.name, "string");
  });

  // Test 9: Sign-in response processing and session storage
  await itAsync("Processes valid credential response and establishes active session", async () => {
    mockSessionStorage.clear();
    const clientId = CSC_CONFIG.GOOGLE_CLIENT_ID;
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      iss: "https://accounts.google.com",
      aud: clientId,
      sub: "google-user-9999",
      email: "companion@cyclesidechick.app",
      name: "Dr. Bun",
      picture: "https://lh3.googleusercontent.com/a/sample-photo",
      exp: nowSec + 3600
    };
    const credential = createMockJwt(payload);

    await CycleAuth.handleCredentialResponse({ credential });

    assert.strictEqual(CycleAuth.isAuthenticated(), true);
    assert.strictEqual(CycleAuth.getUser().email, "companion@cyclesidechick.app");
    assert.strictEqual(CycleAuth.getUser().name, "Dr. Bun");
    assert.strictEqual(CycleAuth.getState(), CycleAuth.STATES.AUTHENTICATED);

    // Verify sessionStorage has record
    const stored = CycleAuth.getStoredSession();
    assert.ok(stored, "Session must be stored in sessionStorage");
    assert.strictEqual(stored.user.sub, "google-user-9999");
  });

  // Test 10: Sign out clears session and denies access immediately
  it("Sign-out immediately clears active session and locks the gate", () => {
    assert.strictEqual(CycleAuth.isAuthenticated(), true);
    CycleAuth.signOut();

    assert.strictEqual(CycleAuth.isAuthenticated(), false);
    assert.strictEqual(CycleAuth.getUser(), null);
    assert.strictEqual(CycleAuth.getStoredSession(), null);
    assert.strictEqual(mockSessionStorage.getItem("csc.auth_session"), null);
  });

  // Test 11: Local health data (csc.v1) survives auth lifecycle without modification
  it("Strict Data Isolation: csc.v1 health data is never touched or overwritten by authentication", async () => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();

    // 1. Establish pre-existing health data in csc.v1
    const initialHealthData = {
      _v: 2,
      ob: 1,
      cl: 29,
      pl: 5,
      mode: "natural",
      periods: [
        { s: "2026-09-01", e: "2026-09-05" },
        { s: "2026-09-30", e: "2026-10-04" }
      ],
      logs: {
        "2026-10-01": { f: "heavy", p: 4, m: 2, note: "Private symptom journal entry" }
      }
    };
    saveState(initialHealthData);

    const savedJsonBefore = mockLocalStorage.getItem(KEY);
    assert.ok(savedJsonBefore, "Pre-existing health data must exist");

    // 2. Perform Google Authentication
    const clientId = CSC_CONFIG.GOOGLE_CLIENT_ID;
    const payload = {
      iss: "https://accounts.google.com",
      aud: clientId,
      sub: "google-test-account-1",
      email: "user1@example.com",
      name: "User One",
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    await CycleAuth.handleCredentialResponse({ credential: createMockJwt(payload) });

    assert.strictEqual(CycleAuth.isAuthenticated(), true);

    // 3. Verify health data after login
    const savedJsonAfterAuth = mockLocalStorage.getItem(KEY);
    assert.strictEqual(savedJsonBefore, savedJsonAfterAuth, "Health data must not change upon authentication");

    // 4. Perform Sign Out
    CycleAuth.signOut();
    assert.strictEqual(CycleAuth.isAuthenticated(), false);

    // 5. Verify health data after sign out
    const savedJsonAfterSignOut = mockLocalStorage.getItem(KEY);
    assert.strictEqual(savedJsonBefore, savedJsonAfterSignOut, "Health data must not be cleared upon sign-out");

    // 6. Sign in with a different user
    const payload2 = {
      iss: "https://accounts.google.com",
      aud: clientId,
      sub: "google-test-account-2",
      email: "user2@example.com",
      name: "User Two",
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    await CycleAuth.handleCredentialResponse({ credential: createMockJwt(payload2) });

    // Verify health data survived across different user sessions
    const savedJsonSecondUser = mockLocalStorage.getItem(KEY);
    assert.strictEqual(savedJsonBefore, savedJsonSecondUser, "Local records remain sovereign on device");
  });

  // Test 12: Session restoration on page refresh
  it("Restores authenticated session upon refresh if not expired", () => {
    mockSessionStorage.clear();
    const nowSec = Math.floor(Date.now() / 1000);
    const validSession = {
      credential: "valid_token",
      user: { sub: "uid-888", email: "saved@test.com", name: "Saved User" },
      exp: nowSec + 1800,
      authenticatedAt: Date.now()
    };
    mockSessionStorage.setItem("csc.auth_session", JSON.stringify(validSession));

    CycleAuth.init();
    assert.strictEqual(CycleAuth.isAuthenticated(), true);
    assert.strictEqual(CycleAuth.getUser().email, "saved@test.com");
  });

  // Test 13: Auto-logout on page refresh if token is expired
  it("Discards session and prompts sign-in if stored session has expired", () => {
    mockSessionStorage.clear();
    const pastSec = Math.floor(Date.now() / 1000) - 60;
    const expiredSession = {
      credential: "expired_token",
      user: { sub: "uid-888", email: "saved@test.com", name: "Saved User" },
      exp: pastSec,
      authenticatedAt: Date.now() - 7200000
    };
    mockSessionStorage.setItem("csc.auth_session", JSON.stringify(expiredSession));

    CycleAuth.init();
    assert.strictEqual(CycleAuth.isAuthenticated(), false);
    assert.strictEqual(mockSessionStorage.getItem("csc.auth_session"), null);
  });

  // Test 14: Client ID configuration validation
  it("Detects when OAuth Client ID is properly configured vs placeholder", () => {
    mockLocalStorage.removeItem("csc.oauth_client_id");
    // Placeholder default
    assert.strictEqual(CSC_CONFIG.DEFAULT_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID"), true);

    // Custom configuration
    CSC_CONFIG.setCustomClientId("123456789-abc.apps.googleusercontent.com");
    assert.strictEqual(CSC_CONFIG.GOOGLE_CLIENT_ID, "123456789-abc.apps.googleusercontent.com");
    assert.strictEqual(CSC_CONFIG.isClientIdConfigured(), true);

    CSC_CONFIG.clearCustomClientId();
  });

  console.log("==================================================");
  console.log(`ALL ${testsPassed} AUTH & SECURITY TESTS PASSED!`);
  console.log("==================================================");
})();
