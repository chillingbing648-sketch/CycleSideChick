/**
 * CycleSideChick — Test Runner
 */
const { spawnSync } = require("child_process");

console.log("Starting CycleSideChick Test Suite...\n");

const result = spawnSync("node", ["tests/cycle_engine.test.js"], { stdio: "inherit" });

if (result.status !== 0) {
  console.error("\nTests failed with status:", result.status);
  process.exit(result.status);
}

console.log("\nAll test suites passed cleanly.");
