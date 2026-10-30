/**
 * CycleSideChick — Test Runner
 * Executes:
 * 1. Cycle Engine unit tests
 * 2. Cycle Care Companion Security & E2E tests
 * 3. Local-only authentication and backend isolation tests
 */
const { spawnSync } = require("child_process");

console.log("Starting CycleSideChick Complete Test Suite...\n");

// 1. Run Core Cycle Engine Unit Tests
const engineTest = spawnSync("node", ["tests/cycle_engine.test.js"], { stdio: "inherit" });
if (engineTest.status !== 0) {
  console.error("\nCycle engine tests failed with status:", engineTest.status);
  process.exit(engineTest.status);
}

console.log("\n");

// 2. Run Cycle Care Companion Security & E2E Tests
const securityTest = spawnSync("node", ["tests/companion_security.test.js"], { stdio: "inherit" });
if (securityTest.status !== 0) {
  console.error("\nCompanion security tests failed with status:", securityTest.status);
  process.exit(securityTest.status);
}

console.log("\n");

// 3. Run Local-only Auth & Backend Isolation Tests
const liveTest = spawnSync("node", ["tests/supabase_live_integration.test.js"], { stdio: "inherit" });
if (liveTest.status !== 0) {
  console.error("\nSupabase live integration tests failed with status:", liveTest.status);
  process.exit(liveTest.status);
}

console.log("\n");

// 4. Run QR Code Scanning & Companion Flow Tests
const qrFlowTest = spawnSync("node", ["tests/qr_and_flow.test.js"], { stdio: "inherit" });
if (qrFlowTest.status !== 0) {
  console.error("\nQR and Flow tests failed with status:", qrFlowTest.status);
  process.exit(qrFlowTest.status);
}

console.log("\nAll local-only test suites passed cleanly.");
