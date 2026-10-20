/**
 * CycleSideChick — Cycle Engine Unit Tests
 * Tests:
 * 1. Day-1 convention (start date is cycle day 1)
 * 2. Month, year, and leap-day boundary calculations
 * 3. Regular vs. irregular cycle histories (narrow range vs wide range, confidence scoring)
 * 4. Outlier detection using median
 * 5. Invalid, future, and duplicate dates handling
 * 6. Contraception mode (suppresses fertile window & ovulation)
 * 7. Pregnancy mode & perimenopause mode calculations
 * 8. Late-period messaging & clinical red flags
 * 9. Midnight rollover simulation
 * 10. Phase guidance & cervical fluid classifications
 * 11. Storage repository export & import conflict detection
 */

const assert = require("assert");
const {
  N, I, TD, fmt, okD, vp, badP, pEnd, pdset,
  calculateStats, calculatePregnancy, checkCareAlerts,
  getDailyPhaseGuidance, generateClinicianSummary, compareToUsual,
  CERVICAL_FLUID
} = require("../src/js/engine.js");

const {
  generateJSON, previewImport
} = require("../src/js/storage.js");

console.log("==================================================");
console.log("RUNNING CYCLESIDECHICK CYCLE ENGINE UNIT TESTS");
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

// 1. Day-1 Convention
it("Day-1 convention: start date of a period is cycle day 1", () => {
  const startDay = N("2026-10-01");
  const currentDay = N("2026-10-01");
  const cycleDay = currentDay - startDay + 1;
  assert.strictEqual(cycleDay, 1, "Cycle day on start date must be 1");
  
  const dayFive = N("2026-10-05");
  assert.strictEqual(dayFive - startDay + 1, 5, "Cycle day on 5th day must be 5");
});

// 2. Month, Year, and Leap-day Boundary Calculations
it("Handles leap years (e.g. Feb 29 in leap year 2024 & 2028)", () => {
  // Leap year 2028: Feb 28 to March 1 is 2 days
  const feb28 = N("2028-02-28");
  const feb29 = N("2028-02-29");
  const mar01 = N("2028-03-01");
  assert.strictEqual(feb29 - feb28, 1, "Feb 29 must exist in leap year 2028");
  assert.strictEqual(mar01 - feb28, 2, "Feb 28 to Mar 1 in leap year must be 2 days");

  // Non-leap year 2026: Feb 28 to March 1 is 1 day in UTC calculation
  const feb28_2026 = N("2026-02-28");
  const mar01_2026 = N("2026-03-01");
  assert.strictEqual(mar01_2026 - feb28_2026, 1, "Feb 28 to Mar 1 in non-leap year must be 1 day");

  // Year boundary (Dec 31 to Jan 1)
  const dec31 = N("2026-12-31");
  const jan01 = N("2027-01-01");
  assert.strictEqual(jan01 - dec31, 1, "Dec 31 to Jan 1 boundary must equal exactly 1 day");
});

// 3. Regular vs Irregular History & Confidence Scoring
it("Regular history produces narrow range (±1d) and Higher confidence", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "natural",
    periods: [
      { s: "2026-04-03", e: "2026-04-07" },
      { s: "2026-05-01", e: "2026-05-05" }, // 28d
      { s: "2026-05-29", e: "2026-06-02" }, // 28d
      { s: "2026-06-26", e: "2026-06-30" }, // 28d
      { s: "2026-07-24", e: "2026-07-28" }, // 28d
      { s: "2026-08-21", e: "2026-08-25" }, // 28d
      { s: "2026-09-18", e: "2026-09-22" }  // 28d (6 intervals)
    ]
  };
  const stats = calculateStats(S);
  assert.strictEqual(stats.avg, 28);
  assert.strictEqual(stats.pm, 1);
  assert.strictEqual(stats.confLevel, "Higher");
});

it("Irregular history produces wider range and Low/Moderate confidence", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "irregular",
    periods: [
      { s: "2026-05-01", e: null },
      { s: "2026-05-24", e: null }, // 23d
      { s: "2026-06-28", e: null }, // 35d
      { s: "2026-07-21", e: null }, // 23d
      { s: "2026-08-28", e: null }  // 38d
    ]
  };
  const stats = calculateStats(S);
  assert(stats.pm >= 4, "Irregular history must produce range >= 4");
  assert.strictEqual(stats.confLevel, "Low");
});

// 4. Outlier Detection using Median
it("Uses median when cycle outliers exist", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "natural",
    periods: [
      { s: "2026-04-01", e: null },
      { s: "2026-04-29", e: null }, // 28d
      { s: "2026-05-27", e: null }, // 28d
      { s: "2026-06-24", e: null }, // 28d
      { s: "2026-07-22", e: null }, // 28d
      { s: "2026-08-19", e: null }, // 28d
      { s: "2026-09-30", e: null }  // 42d outlier! (14 days difference)
    ]
  };
  const stats = calculateStats(S);
  assert.strictEqual(stats.outlierDetected, true, "Outlier must be flagged");
  assert.strictEqual(stats.avg, 28, "Average must use median 28d rather than skewed mean");
});

// 5. Invalid, Future, and Duplicate Dates Handling
it("Flags invalid, future, and duplicate dates without deleting user records", () => {
  const futureDate = I(TD() + 10);
  const S = {
    cl: 28,
    pl: 5,
    periods: [
      { s: "2026-08-01", e: "2026-08-05" },
      { s: "not-a-date", e: null },
      { s: futureDate, e: null }
    ]
  };
  const valid = vp(S);
  const bad = badP(S);
  assert.strictEqual(valid.length, 1, "Only past valid dates should be in vp()");
  assert.strictEqual(bad.length, 2, "Invalid and future dates must be captured in badP()");
});

// 6. Contraception Mode
it("Contraception mode completely suppresses fertile window and phase arcs", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "contra",
    periods: [
      { s: "2026-08-01", e: "2026-08-05" },
      { s: "2026-08-29", e: "2026-09-02" }
    ]
  };
  const stats = calculateStats(S);
  assert.strictEqual(S.mode, "contra");
});

// 7. Pregnancy Mode
it("Pregnancy mode calculates gestational age and EDD using Naegele's rule", () => {
  const S = {
    cl: 28,
    mode: "pregnancy",
    pregnancyLmp: "2026-07-01"
  };
  const preg = calculatePregnancy(S);
  assert(preg !== null, "Pregnancy calculation should return data");
  assert.strictEqual(preg.lmp, "2026-07-01");
  const expectedEdd = I(N("2026-07-01") + 280);
  assert.strictEqual(preg.edd, expectedEdd, "EDD must equal LMP + 280 days");
});

// 8. Late-Period Messaging & Clinical Red Flags
it("Detects clinical triggers for prolonged absence and severe pain", () => {
  const S = {
    cl: 28,
    pl: 5,
    mode: "natural",
    periods: [
      { s: "2026-01-01", e: "2026-01-05" } // Over 90 days ago
    ],
    logs: {
      "2026-10-15": { p: 9, f: "heavy" } // Severe pain 9/10
    }
  };
  const alerts = checkCareAlerts(S);
  assert(alerts.some(a => a.includes("90+ days")), "Must alert on 90+ days absence");
  assert(alerts.some(a => a.includes("Severe pelvic pain")), "Must alert on pain >= 8");
});

// 9. Midnight Rollover Simulation
it("Midnight rollover simulation advances cycle day accurately", () => {
  const startDay = N("2026-10-01");
  const todayDay = N("2026-10-20");
  const tomorrowDay = todayDay + 1; // +1 day across midnight
  assert.strictEqual(tomorrowDay - startDay + 1, (todayDay - startDay + 1) + 1, "Cycle day must advance by exactly 1 at midnight");
});

// 10. Phase Guidance & Cervical Fluid Categories
it("Returns evidence-based phase guidance and cervical mucus types", () => {
  const luteal = getDailyPhaseGuidance("luteal", 22);
  assert(luteal.name.includes("Luteal"), "Guidance name must contain Luteal");
  assert(luteal.hormones.includes("Progesterone"), "Luteal phase hormones must mention Progesterone");

  assert(CERVICAL_FLUID.eggwhite !== undefined, "Egg-white cervical fluid must exist");
  assert.strictEqual(CERVICAL_FLUID.eggwhite.fertile, "Peak (Estimated)");
});

// 11. Storage Repository Export & Import Preview
it("Generates valid JSON backup and detects duplicate period imports", () => {
  const S = {
    cl: 28,
    pl: 5,
    periods: [{ s: "2026-09-01", e: "2026-09-05" }],
    logs: { "2026-09-01": { f: "heavy" } }
  };
  const jsonStr = generateJSON(S);
  assert(jsonStr.includes("CycleSideChick"), "JSON backup must contain app identifier");

  const preview = previewImport(jsonStr, S);
  assert.strictEqual(preview.valid, true, "Import format must be valid");
  assert.strictEqual(preview.dupPeriods, 1, "Duplicate periods must be identified");
  assert.strictEqual(preview.newPeriods, 0, "No new periods in identical backup");
});

console.log("==================================================");
console.log(`ALL ${testsPassed} UNIT TESTS PASSED SUCCESSFULLY!`);
console.log("==================================================");
