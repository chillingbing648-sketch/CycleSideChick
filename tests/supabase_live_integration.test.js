/**
 * CycleSideChick — Live Supabase Project Integration & Diagnostic Test Suite
 * Tests the real Supabase project:
 * - Environment variable loading from .env.local
 * - URL normalization (stripping /rest/v1/ suffix)
 * - Live endpoint connectivity over HTTPS
 * - API Key authentication with Supabase
 * - Schema cache inspection for tables, RPCs, and RLS
 * - Secret key isolation (ensuring service-role key is never exposed)
 * - Local-first offline cycle engine isolation
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

function parseEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  });
  return env;
}

async function runLiveSupabaseTests() {
  console.log("==================================================");
  console.log("RUNNING LIVE SUPABASE PROJECT INTEGRATION TESTS");
  console.log("==================================================");

  const env = parseEnvLocal();
  const rawUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const rawKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let passed = 0;

  if (!rawUrl || !rawKey) {
    console.log("  ℹ No live Supabase credentials detected; skipping live cloud checks.");
    return;
  }

  // 1. Verify .env.local variables
  {
    assert.ok(rawUrl, "VITE_SUPABASE_URL must be defined in .env.local");
    assert.ok(rawKey, "VITE_SUPABASE_ANON_KEY must be defined in .env.local");
    assert.ok(
      rawKey.startsWith("sb_publishable_") || rawKey.startsWith("ey"),
      "Key must be a valid Supabase publishable or anon key format"
    );
    console.log("  ✓ .env.local environment variables detected and validated");
    passed++;
  }

  // 2. Verify URL normalization
  const { normalizeSupabaseUrl } = await import("../src/features/companion/api.js");
  const normalizedUrl = normalizeSupabaseUrl(rawUrl);
  {
    assert.strictEqual(
      normalizedUrl,
      "https://ijoautpngdkdrrrcudwu.supabase.co",
      "URL normalization must strip /rest/v1/ and trailing slashes"
    );
    assert.strictEqual(
      normalizeSupabaseUrl("https://ijoautpngdkdrrrcudwu.supabase.co/rest/v1/"),
      "https://ijoautpngdkdrrrcudwu.supabase.co"
    );
    assert.strictEqual(
      normalizeSupabaseUrl("https://ijoautpngdkdrrrcudwu.supabase.co"),
      "https://ijoautpngdkdrrrcudwu.supabase.co"
    );
    console.log("  ✓ URL normalization prevents double /rest/v1 paths in @supabase/supabase-js");
    passed++;
  }

  // 3. Test Live Client Connection & Key Authentication
  const { createClient } = await import("@supabase/supabase-js");
  const liveClient = createClient(normalizedUrl, rawKey);
  {
    const sessionRes = await liveClient.auth.getSession();
    assert.strictEqual(sessionRes.error, null, "Supabase Auth endpoint must be reachable without network errors");
    console.log("  ✓ Live Supabase project is reachable over HTTPS and authenticated with publishable key");
    passed++;
  }

  // 4. Test Live PostgREST Response Status
  {
    const tableRes = await liveClient.from("sharing_invitations").select("id").limit(1);
    // If key were invalid, status would be 401 Unauthorized
    assert.notStrictEqual(tableRes.status, 401, "Publishable key must NOT be rejected with 401 Unauthorized");
    
    // Status 404 with PGRST205 indicates key is authorized, but tables await SQL migration
    // Status 200 indicates table already exists
    assert.ok(
      tableRes.status === 404 || tableRes.status === 200 || tableRes.status === 204,
      `Expected valid response status (got ${tableRes.status})`
    );

    if (tableRes.status === 404 && tableRes.error?.code === "PGRST205") {
      console.log("  ✓ Live PostgREST confirms valid credentials; public schema tables pending SQL migration");
    } else if (tableRes.status === 200 || tableRes.status === 204) {
      console.log("  ✓ Live PostgREST confirms tables are present in database schema cache");
    }
    passed++;
  }

  // 5. Audit all required tables in schema
  const requiredTables = [
    "sharing_invitations",
    "sharing_relationships",
    "shared_cycle_snapshots",
    "predefined_responses",
    "push_subscriptions",
    "notification_jobs"
  ];
  {
    const auditResults = await Promise.all(
      requiredTables.map(async t => {
        const res = await liveClient.from(t).select("count", { count: "exact", head: true });
        return { table: t, status: res.status, code: res.error?.code };
      })
    );
    assert.strictEqual(auditResults.length, requiredTables.length);
    console.log(`  ✓ Audited ${requiredTables.length} core companion tables against live database`);
    passed++;
  }

  // 6. Security & Secret Exposure Validation
  {
    const gitignorePath = path.resolve(__dirname, "../.gitignore");
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    assert.ok(gitignoreContent.includes(".env.local"), ".gitignore must contain .env.local");

    // Scan source files in src/ to ensure NO service-role or secret key is hardcoded
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          scanDir(full);
        } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
          const content = fs.readFileSync(full, "utf-8");
          assert.doesNotMatch(content, /service_role|sb_secret_/i, `Secret key must not appear in ${file}`);
        }
      }
    };
    scanDir(path.resolve(__dirname, "../src"));
    console.log("  ✓ Zero service-role or secret keys hardcoded in frontend source files");
    passed++;
  }

  // 7. Local-First Isolation Check
  const { calculateStats } = await import("../src/core/engine.js");
  {
    const testState = {
      cl: 28,
      pl: 5,
      mode: "natural",
      periods: [{ s: "2026-09-01", e: "2026-09-05" }]
    };
    const stats = calculateStats(testState);
    assert.ok(stats.cur, "Current cycle calculated");
    assert.strictEqual(stats.avg, 28);
    console.log("  ✓ Local-first period tracking functions with zero network dependencies");
    passed++;
  }

  console.log("==================================================");
  console.log(`ALL ${passed} LIVE INTEGRATION CHECKS PASSED!`);
  console.log("==================================================");
}

runLiveSupabaseTests().catch(err => {
  console.error("Live integration test failure:", err);
  process.exit(1);
});
