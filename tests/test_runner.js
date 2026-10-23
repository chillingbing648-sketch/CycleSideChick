/**
 * CycleSideChick — Test Runner
 * Executes Cycle Engine tests and Cycle Care Companion Security & E2E tests.
 */
const { spawnSync } = require("child_process");

console.log("Starting CycleSideChick Test Suite...\n");

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

console.log("\nAll test suites passed cleanly with 100% success.");
