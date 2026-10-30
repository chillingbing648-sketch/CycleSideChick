/**
 * CycleSideChick — Local-only backend isolation tests.
 * Confirms that application runtime cannot initialize or call Supabase.
 */
const assert = require("assert");

async function runLocalOnlyTests() {
  console.log("==================================================");
  console.log("RUNNING LOCAL-ONLY AUTH & BACKEND ISOLATION TESTS");
  console.log("==================================================");

  const api = await import("../src/features/companion/api.js");
  assert.strictEqual(api.isLiveBackendConfigured, false, "Supabase must remain disconnected");
  assert.strictEqual(api.supabase, null, "No Supabase client may be initialized");
  assert.strictEqual(api.SUPABASE_URL, "", "No project URL may be configured in the client");
  assert.strictEqual(api.SUPABASE_ANON_KEY, "", "No Supabase key may be exposed in the client");
  console.log("  ✓ Runtime Supabase connection and credentials are disabled");

  const packageJson = require("../package.json");
  assert.ok(!packageJson.dependencies || !packageJson.dependencies["@supabase/supabase-js"], "Supabase SDK must not be a runtime dependency");
  console.log("  ✓ Supabase SDK removed from runtime dependencies");

  const { normalizeSupabaseUrl } = api;
  assert.strictEqual(normalizeSupabaseUrl("https://example.supabase.co/rest/v1/"), "https://example.supabase.co");
  console.log("  ✓ Legacy URL helper remains backward-compatible without connecting to cloud");

  assert.strictEqual(typeof api.signUpWithPassword, "function");
  assert.strictEqual(typeof api.signInWithPassword, "function");
  assert.strictEqual(typeof api.signOutCompanion, "function");
  console.log("  ✓ Local account lifecycle methods are available");

  console.log("\nLocal-only backend isolation tests passed.");
}

runLocalOnlyTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
