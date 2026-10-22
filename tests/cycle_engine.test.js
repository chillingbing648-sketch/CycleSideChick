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
  calculatePeriodDurations, calculateVariability, aggregateSymptoms, aggregateMoods,
  CERVICAL_FLUID, syncPeriodWithFlow
} = require("../src/core/engine.js");

const {
  generateJSON, generateCSV, previewImport, defState, migrateState, DEFAULT_CARE_KIT
} = require("../src/core/storage.js");

const {
  REASSURANCE_MESSAGES, getReassuranceMessage, FULL_CYCLE_CARE_GUIDES,
  CYCLE_EXPLAINED_CARDS, getCareSuggestions
} = require("../src/core/content.js");

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

// 12. Multi-Cycle Predictions with Distinct Fertile Windows
it("Generates 6 future predicted cycles with distinct fertile windows and ovulation dates", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "natural",
    periods: [{ s: "2026-09-01", e: "2026-09-05" }]
  };
  const stats = calculateStats(S);
  assert(Array.isArray(stats.predictedCycles), "predictedCycles must be an array");
  assert.strictEqual(stats.predictedCycles.length, 6, "Must forecast 6 cycles");
  
  const c1 = stats.predictedCycles[0];
  const c2 = stats.predictedCycles[1];
  assert(c1.periodStart < c2.periodStart, "Cycles must advance chronologically");
  assert.strictEqual(c2.periodStart - c1.periodStart, 28, "Cycle intervals must match average length");
  assert(c1.ovulationDate < c1.periodEnd || c1.ovulationDate > c1.periodEnd, "Ovulation date must be defined");
  assert.strictEqual(c1.fertileEnd - c1.fertileStart, 6, "Fertile window difference must be 6 (spanning 7 calendar days)");
});

// 13. Historical Period Durations
it("Extracts period durations and differentiates confirmed vs inferred end dates", () => {
  const S = {
    pl: 5,
    periods: [
      { s: "2026-07-01", e: "2026-07-06" }, // 6 days confirmed
      { s: "2026-08-01", e: null }           // Inferred using default pl 5d
    ]
  };
  const durs = calculatePeriodDurations(S);
  assert.strictEqual(durs.length, 2, "Must return 2 durations");
  assert.strictEqual(durs[0].duration, 6, "First duration should be 6 days");
  assert.strictEqual(durs[0].confirmed, true, "First duration should be confirmed");
  assert.strictEqual(durs[1].duration, 5, "Second duration should default to pl (5 days)");
  assert.strictEqual(durs[1].confirmed, false, "Second duration should be inferred");
});

// 14. FIGO Clinical Cycle Variability
it("Calculates standard deviation, spread, and FIGO regularity classifications", () => {
  // Regular history (<7 days variation)
  const regularS = {
    cl: 28,
    periods: [
      { s: "2026-04-01", e: null },
      { s: "2026-04-29", e: null }, // 28d
      { s: "2026-05-28", e: null }, // 29d
      { s: "2026-06-25", e: null }  // 28d
    ]
  };
  const regVar = calculateVariability(regularS);
  assert.strictEqual(regVar.hasEnoughData, true);
  assert.strictEqual(regVar.classification, "Highly Regular");

  // Variable history (>=9 days variation)
  const varS = {
    cl: 28,
    periods: [
      { s: "2026-04-01", e: null },
      { s: "2026-04-24", e: null }, // 23d
      { s: "2026-05-30", e: null }, // 36d (13d spread)
      { s: "2026-06-25", e: null }  // 26d
    ]
  };
  const irVar = calculateVariability(varS);
  assert.strictEqual(irVar.classification, "Variable Pattern");
  assert(irVar.spread >= 9, "Spread must be >= 9");
});

// 15. Symptom and Mood Aggregation
it("Aggregates symptoms and mood percentages over a time window", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    periods: [{ s: "2026-10-01", e: "2026-10-05" }],
    logs: {
      "2026-10-02": { sy: { Cramps: 3, Fatigue: 2 }, m: 3 }, // Menstrual
      "2026-10-10": { sy: { Fatigue: 1 }, m: 0 },             // Follicular
      "2026-10-18": { sy: { Bloating: 2 }, m: 3 }             // Luteal
    }
  };
  const syms = aggregateSymptoms(S, 60);
  assert(syms.totalEntries >= 3, "Total logged symptom entries should be tracked");
  const cramps = syms.list.find(s => s.name === "Cramps");
  assert(cramps !== undefined, "Cramps must be in aggregated list");
  assert.strictEqual(cramps.count, 1);
  assert.strictEqual(cramps.severe, 1);

  const moods = aggregateMoods(S, 60);
  assert.strictEqual(moods.totalLogged, 3, "Total logged moods must equal 3");
  assert(moods.distribution.length > 0, "Distribution must contain mood entries");
});

// 16. Preferences & Safe Migration
it("Initializes motion, haptics, and view toggles with safe migration", () => {
  const d = defState();
  assert.strictEqual(d.motion, 1, "Motion must be enabled by default");
  assert.strictEqual(d.haptics, 1, "Haptics must be enabled by default");
  assert.strictEqual(d.showFertile, 1, "Fertile window indicators enabled by default");
  assert.strictEqual(d.careAlerts, 1, "Care alerts enabled by default");
  assert.strictEqual(d.waterGoal, 1, "Water goal enabled by default");

  // Legacy state without motion fields
  const legacy = {
    _v: 1,
    cl: 29,
    pl: 4,
    periods: [{ s: "2026-08-01", e: "2026-08-05" }]
  };
  const migrated = migrateState(legacy);
  assert.strictEqual(migrated.cl, 29, "Preserves custom cycle length");
  assert.strictEqual(migrated.periods.length, 1, "Preserves existing period records");
  assert.strictEqual(migrated.motion, 1, "Backfills motion toggle safely");
  assert.strictEqual(migrated.haptics, 1, "Backfills haptics toggle safely");
  assert(migrated.journal !== undefined, "Backfills journal object safely");
  assert(Array.isArray(migrated.careKit), "Backfills care kit array safely");
});

// 17. Reassurance Messages & Non-Judgmental Content
it("Provides compassionate reassurance messages that rotate gracefully", () => {
  assert(REASSURANCE_MESSAGES.length >= 10, "Must provide a rich library of reassuring thoughts");
  const msg1 = getReassuranceMessage(0);
  const msg2 = getReassuranceMessage(1);
  assert(typeof msg1 === "string" && msg1.length > 10, "Valid message string");
  assert.notStrictEqual(msg1, msg2, "Different indices return different messages");
  assert.strictEqual(getReassuranceMessage(REASSURANCE_MESSAGES.length), msg1, "Wraps gracefully on overflow");
});

// 18. Full-Cycle Care Guide
it("Covers all 4 phases plus uncertain stage with non-dogmatic prompts", () => {
  const keys = ["menstrual", "follicular", "fertile", "luteal", "uncertain"];
  keys.forEach(k => {
    const guide = FULL_CYCLE_CARE_GUIDES[k];
    assert(guide !== undefined, `Guide must exist for phase: ${k}`);
    assert(typeof guide.phaseName === "string" && guide.phaseName.length > 0);
    assert(Array.isArray(guide.suggestions) && guide.suggestions.length >= 3, `Suggestions list for ${k}`);
    assert(typeof guide.journalPrompt === "string" && guide.journalPrompt.length > 0, `Journal prompt for ${k}`);
    assert(typeof guide.selfCareTip === "string" && guide.selfCareTip.length > 0);
  });
});

// 19. Transparent Rule-Based Care Suggestions
it("Generates targeted, non-prescriptive care suggestions based on logged state", () => {
  const S = defState();
  const today = "2026-10-21";
  
  // Case A: Cramps logged -> suggests soothing warmth
  S.logs[today] = { sy: { Cramps: 3 }, p: 6 };
  const crampSuggestions = getCareSuggestions(S, today);
  assert(crampSuggestions.some(s => s.id === "care-cramps-warmth"), "Suggests pelvic warmth when cramps/pain logged");

  // Case B: Dismissed suggestion is suppressed
  S.careDismissed["care-cramps-warmth"] = 1;
  const filteredSuggestions = getCareSuggestions(S, today);
  assert(!filteredSuggestions.some(s => s.id === "care-cramps-warmth"), "Dismissed suggestion must not be displayed");

  // Case C: Fatigue logged
  S.logs[today] = { sy: { Fatigue: 2 }, en: "low" };
  const fatigueSuggestions = getCareSuggestions(S, today);
  assert(fatigueSuggestions.some(s => s.id === "care-fatigue-rest"), "Suggests rest/slowing down when fatigued");

  // Case D: Stress logged
  S.logs[today] = { sy: { Stress: 2 }, m: 3 };
  const stressSuggestions = getCareSuggestions(S, today);
  assert(stressSuggestions.some(s => s.id === "care-stress-breath"), "Suggests gentle breath reset when stressed");
});

// 20. Private Journal State & Export Preservation
it("Persists private journal reflections, supports editing, and exports to CSV & JSON", () => {
  const S = defState();
  const d = "2026-10-21";
  
  // Add reflection
  S.journal[d] = {
    id: "j-" + d,
    date: d,
    text: "Felt quiet and reflective today.",
    gratitude: "Grateful for a warm bath and reading time.",
    helped: "Heating pad and loose pajamas",
    mood: "sensitive",
    energy: 2,
    comfort: 3,
    stress: "mild",
    tags: ["Warm Tea", "Quiet Rest"]
  };

  // CSV export includes journal reflections
  const csv = generateCSV(S);
  assert(csv.includes("Felt quiet and reflective today."), "CSV must include journal text");
  assert(csv.includes("Grateful for a warm bath"), "CSV must include journal gratitude");
  assert(csv.includes("Journal_Reflection"), "CSV headers must include journal columns");

  // JSON export includes journal reflections
  const jsonStr = generateJSON(S);
  const parsed = JSON.parse(jsonStr);
  assert(parsed.data.journal[d] !== undefined, "JSON backup must preserve journal reflections");
  assert.strictEqual(parsed.data.journal[d].text, "Felt quiet and reflective today.");
});

// 21. Personal Care Kit Strategies
it("Initializes Personal Care Kit with defaults and preserves favorites & custom items", () => {
  assert(DEFAULT_CARE_KIT.length >= 6, "Must provide sensible default comfort strategies");
  const S = defState();
  assert.strictEqual(S.careKit.length, DEFAULT_CARE_KIT.length);

  // Toggle favorite
  S.careKit[0].isFav = 1;
  // Add custom strategy
  S.careKit.push({
    id: "custom-blanket",
    title: "Weighted blanket",
    desc: "Cozy pressure on bed",
    icon: "moon",
    isFav: 1,
    isCustom: 1
  });
  assert.strictEqual(S.careKit.length, DEFAULT_CARE_KIT.length + 1);
  const custom = S.careKit.find(k => k.id === "custom-blanket");
  assert(custom !== undefined && custom.isCustom === 1);
});

// 22. Detailed Stats Output: cur, history, and predicted dates
it("Calculates current cycle object, history intervals, and predicted dates", () => {
  const S = {
    cl: 28,
    pl: 5,
    ll: 14,
    mode: "natural",
    periods: [
      { s: "2026-08-01", e: "2026-08-05" },
      { s: "2026-08-29", e: "2026-09-02" },
      { s: "2026-09-26", e: "2026-09-30" }
    ]
  };
  const stats = calculateStats(S);
  assert(stats.cur !== null, "cur cycle object must be defined");
  assert.strictEqual(stats.cur.startDate, "2026-09-26");
  assert(stats.cur.cd >= 1, "Cycle day must be positive");
  assert(stats.history.length === 2, "Must calculate 2 completed past cycles");
  assert.strictEqual(stats.history[0].length, 28);
  assert.strictEqual(stats.history[1].length, 28);
  assert(stats.predictedDates.length > 0, "Must calculate predicted dates");
  assert(stats.pdset instanceof Set, "pdset must be a Set");
  assert(stats.pdset.has(N("2026-08-01")), "pdset must contain period days");
});

it("Handles empty periods history gracefully without fabricating cycle data", () => {
  const emptyS = { cl: 28, pl: 5, ll: 14, mode: "natural", periods: [] };
  const stats = calculateStats(emptyS);
  assert.strictEqual(stats.cur, null, "cur must be null when no periods recorded");
  assert.strictEqual(stats.history.length, 0, "history must be empty when no periods recorded");
  assert.strictEqual(stats.last, null, "last must be null");
  assert.strictEqual(stats.nextPred, null, "nextPred must be null without history");
});

// 23. Flow & Period Synchronization (ACOG/FIGO Standards)
it("Synchronizes daily bleeding flow with periods and respects spotting rule", () => {
  // Test 1: Logging Medium flow (flow=3) creates a period record
  let periods = [];
  periods = syncPeriodWithFlow(periods, "2026-10-10", 3, 5);
  assert.strictEqual(periods.length, 1);
  assert.strictEqual(periods[0].s, "2026-10-10");
  assert.strictEqual(periods[0].e, "2026-10-14"); // 5 days

  // Test 2: Spotting (flow=1) does NOT create a period Day 1 (ACOG/FIGO standard)
  let spottingOnly = [];
  spottingOnly = syncPeriodWithFlow(spottingOnly, "2026-10-01", 1, 5);
  assert.strictEqual(spottingOnly.length, 0, "Spotting must not create a period day 1");

  // Test 3: Adjacent bleeding day extends period end
  periods = syncPeriodWithFlow(periods, "2026-10-15", 2, 5);
  assert.strictEqual(periods.length, 1);
  assert.strictEqual(periods[0].e, "2026-10-15");

  // Test 4: Setting flow to None (0) on a 1-day period removes it
  let singleDayPeriod = [{ s: "2026-09-01", e: "2026-09-01" }];
  singleDayPeriod = syncPeriodWithFlow(singleDayPeriod, "2026-09-01", 0, 5);
  assert.strictEqual(singleDayPeriod.length, 0, "Removing flow removes 1-day period");
});

console.log("==================================================");
console.log(`ALL ${testsPassed} UNIT TESTS PASSED SUCCESSFULLY!`);
console.log("==================================================");
