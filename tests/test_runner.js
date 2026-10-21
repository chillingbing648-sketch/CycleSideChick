/**
 * CycleSideChick — Test Runner
 */
const { spawnSync } = require("child_process");

console.log("Starting CycleSideChick Test Suite...\n");

const suites = [
  "tests/cycle_engine.test.js",
  "tests/auth.test.js"
];

for (const suite of suites) {
  const result = spawnSync("node", [suite], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\nTest suite ${suite} failed with status: ${result.status}`);
    process.exit(result.status);
  }
}

console.log("\nAll test suites passed cleanly.");
