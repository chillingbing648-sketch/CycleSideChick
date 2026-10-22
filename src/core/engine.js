/**
 * CycleSideChick — Cycle Engine v2
 * High-accuracy, evidence-based, on-device cycle calculations.
 * Supports: natural, irregular, hormonal contraception, TTC, pregnancy, and perimenopause modes.
 */

const DAY = 864e5;

const N = s => {
  if (typeof s !== "string" || !s) return 0;
  const [a, b, c] = s.split("-");
  return Date.UTC(+a, +b - 1, +c) / DAY;
};

const I = n => new Date(n * DAY).toISOString().slice(0, 10);

const TD = () => {
  const t = new Date();
  return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY;
};

const fmt = (n, o = { month: "short", day: "numeric" }) =>
  new Date(n * DAY).toLocaleDateString(undefined, { ...o, timeZone: "UTC" });

const okD = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && I(N(s)) === s;

const vp = S => (S.periods || S.p || []).filter(p => okD(p.s) && N(p.s) <= TD());
const badP = S => (S.periods || S.p || []).filter(p => !(okD(p.s) && N(p.s) <= TD()));
const pEnd = (p, S) => (okD(p.e) && N(p.e) >= N(p.s) && N(p.e) <= TD()) ? N(p.e) : Math.min(N(p.s) + (S.pl || 5) - 1, Math.max(TD(), N(p.s)));

const pdset = S => {
  const s = new Set();
  vp(S).forEach(p => {
    for (let d = N(p.s); d <= pEnd(p, S); d++) s.add(d);
  });
  return s;
};

/**
 * Synchronizes period records (S.periods) with logged daily flow.
 * - Flow >= 2 (Light, Medium, Heavy): Bleeding days that constitute menstruation.
 *   - Automatically creates, extends, or bridges period spans.
 * - Flow == 0 (None) or Flow == 1 (Spotting): Non-menstrual flow.
 *   - Per FIGO & ACOG standards, spotting is intermenstrual and does not count as Day 1.
 *   - If previously marked as bleeding, adjusts or trims period boundaries.
 */
function syncPeriodWithFlow(periods = [], dateStr, flowLevel, pl = 5) {
  if (!okD(dateStr)) return periods || [];
  const dn = N(dateStr);
  const updated = (periods || []).map(p => ({ ...p }));
  const isBleeding = flowLevel >= 2; // Light, Medium, Heavy

  if (isBleeding) {
    // Check if date is already inside an existing period
    const existing = updated.find(p => {
      const sDn = N(p.s);
      const eDn = p.e ? N(p.e) : sDn + pl - 1;
      return dn >= sDn && dn <= eDn;
    });

    if (existing) {
      if (existing.e && N(existing.e) < dn) {
        existing.e = dateStr;
      }
      return updated.sort((a, b) => N(a.s) - N(b.s));
    }

    // Check if adjacent to an existing period (day before start or day after end)
    const adjacentBefore = updated.find(p => N(p.s) === dn + 1);
    const adjacentAfter = updated.find(p => {
      const eDn = p.e ? N(p.e) : N(p.s) + pl - 1;
      return eDn === dn - 1;
    });

    if (adjacentBefore && adjacentAfter) {
      adjacentAfter.e = adjacentBefore.e || I(N(adjacentBefore.s) + pl - 1);
      const filtered = updated.filter(p => p !== adjacentBefore);
      return filtered.sort((a, b) => N(a.s) - N(b.s));
    } else if (adjacentBefore) {
      adjacentBefore.s = dateStr;
      return updated.sort((a, b) => N(a.s) - N(b.s));
    } else if (adjacentAfter) {
      adjacentAfter.e = dateStr;
      return updated.sort((a, b) => N(a.s) - N(b.s));
    } else {
      updated.push({
        s: dateStr,
        e: I(dn + pl - 1),
        id: 'p_' + dn
      });
      return updated.sort((a, b) => N(a.s) - N(b.s));
    }
  } else {
    // Non-bleeding (None or Spotting)
    const exactStart = updated.find(p => p.s === dateStr);
    const exactEnd = updated.find(p => p.e === dateStr);

    if (exactStart && exactStart.e === dateStr) {
      return updated.filter(p => p !== exactStart);
    } else if (exactStart) {
      exactStart.s = I(N(exactStart.s) + 1);
      if (N(exactStart.s) > N(exactStart.e || exactStart.s)) {
        return updated.filter(p => p !== exactStart);
      }
    } else if (exactEnd) {
      exactEnd.e = I(N(exactEnd.e) - 1);
      if (N(exactEnd.e) < N(exactEnd.s)) {
        return updated.filter(p => p !== exactEnd);
      }
    }
    return updated.sort((a, b) => N(a.s) - N(b.s));
  }
}

/**
 * Calculates cycle statistics using recency-weighted mean or median when outliers exist.
 */
function calculateStats(S) {
  const validPeriods = vp(S);
  const st = [...new Set(validPeriods.map(p => N(p.s)))].sort((a, b) => a - b);
  const lens = [];
  const gaps = [];

  for (let i = 1; i < st.length; i++) {
    const l = st[i] - st[i - 1];
    if (l >= 15 && l <= 90) {
      lens.push(l);
    } else if (l > 90) {
      gaps.push({ from: I(st[i - 1]), to: I(st[i]), days: l });
    }
  }

  const r = lens.slice(-6); // Up to last 6 valid cycles
  const n = r.length;
  let A = S.cl || 28;
  let median = A;
  let sd = 2;
  let outlierDetected = false;

  if (n > 0) {
    const sorted = [...r].sort((a, b) => a - b);
    median = n % 2 === 1 ? sorted[Math.floor(n / 2)] : Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];

    // Outlier detection: cycle differing from median by >= 10 days or wide spread (>= 12 days)
    const hasOutlier = sorted.some(v => Math.abs(v - median) >= 10) || (maxVal - minVal >= 12);
    if (n >= 3 && hasOutlier) {
      outlierDetected = true;
      A = median;
    } else {
      // Recency-weighted mean
      let totalW = 0;
      let weightedSum = 0;
      for (let i = 0; i < n; i++) {
        const w = 1 + (i / Math.max(1, n - 1)) * 0.8;
        totalW += w;
        weightedSum += r[i] * w;
      }
      A = Math.round(weightedSum / totalW);
    }

    if (n > 1) {
      sd = Math.sqrt(r.reduce((acc, val) => acc + (val - A) ** 2, 0) / n);
    } else {
      sd = S.mode === "irregular" ? 5 : 2;
    }
  } else {
    sd = S.mode === "irregular" ? 5 : 2;
  }

  if (S.mode === "irregular") sd = Math.max(sd, 4);

  // Prediction range: ±max(1, round(SD)), capped at ±7 days
  const pm = Math.min(7, Math.max(1, Math.round(sd)));

  // Clinical confidence evaluation
  let confLevel = "Low";
  let confReason = "";
  if (n < 3) {
    confLevel = "Low";
    confReason = n === 0 ? "No recorded cycles yet; using profile setting." : `Based on only ${n} recorded cycle${n > 1 ? "s" : ""}.`;
  } else if (sd > 5) {
    confLevel = "Low";
    confReason = `Cycle lengths vary noticeably (SD ±${Math.round(sd)}d).`;
  } else if (n >= 6 && sd <= 3) {
    confLevel = "Higher";
    confReason = `Steady pattern across ${n} cycles (SD ±${Math.round(sd)}d).`;
  } else {
    confLevel = "Moderate";
    confReason = `Based on ${n} cycles (${outlierDetected ? "median used due to outlier" : "recency-weighted"}).`;
  }

  const last = st.length ? st[st.length - 1] : null;
  const pred = [];
  if (last != null) {
    for (let k = 1; k <= 6; k++) pred.push(last + A * k);
  }

  // Adjustable luteal length (10-16d, default 14d)
  const ll = Math.max(10, Math.min(16, S.ll || 14));
  const nextPred = pred[0] || null;
  const estOvulation = nextPred ? nextPred - ll : null;
  const fertileStart = estOvulation ? estOvulation - 5 : null;
  const fertileEnd = estOvulation ? estOvulation + 1 : null;

  // Multi-cycle predictions with corresponding fertile windows & ovulation dates (forecast 6 cycles)
  const predictedCycles = pred.map(p => {
    const ov = p - ll;
    return {
      start: p,
      periodStart: p,
      end: p + (S.pl || 5) - 1,
      periodEnd: p + (S.pl || 5) - 1,
      ovulation: ov,
      ovulationDate: ov,
      fertileStart: ov - 5,
      fertileEnd: ov + 1
    };
  });

  // Complete period dates for rendering
  const activePdSet = pdset(S);

  // Current cycle details
  const cur = last != null ? {
    s: last,
    startDate: I(last),
    cd: Math.max(1, TD() - last + 1),
    day: Math.max(1, TD() - last + 1),
    len: A,
    end: last + A - 1,
    isPeriod: activePdSet.has(TD())
  } : null;

  // Predicted bleeding dates
  const predictedDates = [];
  predictedCycles.forEach(pc => {
    for (let d = pc.periodStart; d <= pc.periodEnd; d++) {
      predictedDates.push(d);
    }
  });

  // Historical completed cycles
  const history = [];
  for (let i = 1; i < validPeriods.length; i++) {
    const prev = validPeriods[i - 1];
    const curr = validPeriods[i];
    const prevStart = N(prev.s);
    const currStart = N(curr.s);
    const cycleLength = currStart - prevStart;
    const periodDuration = pEnd(prev, S) - prevStart + 1;
    history.push({
      start: prevStart,
      end: currStart - 1,
      length: cycleLength,
      duration: periodDuration
    });
  }

  return {
    st,
    lens,
    gaps,
    avg: A,
    med: median,
    pm,
    sd,
    confLevel,
    confReason,
    last,
    pred,
    nextPred,
    predictedCycles,
    predictedDates,
    ll,
    estOvulation,
    ovulationDate: estOvulation,
    fertileStart,
    fertileEnd,
    n,
    outlierDetected,
    cur,
    pdset: activePdSet,
    history
  };
}

/**
 * Pregnancy Calculations
 * Uses Naegele's rule (LMP + 280 days) or Conception date + 266 days.
 */
function calculatePregnancy(S) {
  const lmpStr = S.pregnancyLmp || (S.periods && S.periods.length ? S.periods[S.periods.length - 1].s : null);
  if (!lmpStr) return null;

  const lmpDays = N(lmpStr);
  const nowDays = TD();
  const daysAlong = Math.max(0, nowDays - lmpDays);
  const weeks = Math.floor(daysAlong / 7);
  const days = daysAlong % 7;
  const edd = lmpDays + 280; // Estimated due date

  let trimester = "First trimester";
  if (weeks >= 13 && weeks <= 27) trimester = "Second trimester";
  else if (weeks >= 28) trimester = "Third trimester";

  return {
    lmp: lmpStr,
    daysAlong,
    weeks,
    days,
    edd: I(edd),
    eddFormatted: fmt(edd, { month: "long", day: "numeric", year: "numeric" }),
    trimester
  };
}

/**
 * Plain-language "When to seek care" prompts triggered by the user's actual records.
 */
function checkCareAlerts(S) {
  const alerts = [];
  const x = calculateStats(S);
  const T = TD();

  // 1. Regular cycles < 21 or > 35 days
  if (x.n >= 2 && (x.avg < 21 || x.avg > 35)) {
    alerts.push(`Average cycle length is ${x.avg} days (typical physiological range is 21–35 days).`);
  }

  // 2. No period for 90+ days
  if (x.last != null && T - x.last > 90 && S.mode !== "pregnancy") {
    alerts.push(`No period start recorded for ${T - x.last} days (90+ days clinical threshold).`);
  }

  // 3. Bleeding > 7 days
  const longPeriod = vp(S).find(p => {
    const dur = pEnd(p, S) - N(p.s) + 1;
    return dur > 7;
  });
  if (longPeriod) {
    const dur = pEnd(longPeriod, S) - N(longPeriod.s) + 1;
    alerts.push(`Bleeding recorded for ${dur} consecutive days (longer than the typical 7-day duration).`);
  }

  // 4. Heavy flow on 3+ days
  let heavyDays = 0;
  Object.values(S.logs || {}).forEach(l => {
    if (l.f === "heavy") heavyDays++;
  });
  if (heavyDays >= 3) {
    alerts.push(`Heavy bleeding recorded on ${heavyDays} days. If soaking a pad or tampon hourly for 2+ consecutive hours, consult a clinician.`);
  }

  // 5. Severe pelvic pain (>= 8/10)
  let maxPain = 0;
  Object.values(S.logs || {}).forEach(l => {
    if (l.p != null && l.p > maxPain) maxPain = l.p;
  });
  if (maxPain >= 8) {
    alerts.push(`Severe pelvic pain (${maxPain}/10) recorded. Pain that stops daily activities warrants clinical evaluation.`);
  }

  return alerts;
}

/**
 * Daily Phase Guidance: Contextual wellness, hormones, and gentle suggestions
 */
function getDailyPhaseGuidance(phaseKey, cycleDay = 1) {
  const guides = {
    menstrual: {
      key: "menstrual",
      name: "Menstrual Phase",
      hormones: "Estrogen & progesterone are at baseline levels as the uterine lining sheds.",
      energy: "Reflective, restorative energy. Natural slowing down.",
      nutrition: "Iron-rich foods (leafy greens, lentils), warming broths, and ginger tea for comfort.",
      movement: "Restorative stretching, gentle walking, or cozy rest. Avoid intense HIIT if cramping.",
      selfCareTip: "Keep a warm heating pad nearby and honor your body's request for deeper sleep."
    },
    follicular: {
      key: "follicular",
      name: "Follicular Phase",
      hormones: "FSH triggers follicle maturation; estrogen steadily rises.",
      energy: "Rising physical stamina, sharper focus, and renewed curiosity.",
      nutrition: "Light, fresh meals, fermented foods (kimchi, kefir), and complex carbohydrates.",
      movement: "Cardio, brisk trail walks, swimming, and creative brainstorming sessions.",
      selfCareTip: "Great time to start a new project, plan goals, or socialize with loved ones."
    },
    fertile: {
      key: "fertile",
      name: "Estimated Fertile Window",
      hormones: "Estrogen peaks, triggering an LH surge that prompts the release of an egg.",
      energy: "Peak sociability, confidence, and vibrant connection.",
      nutrition: "Antioxidant-dense berries, pumpkin/sunflower seeds, and ample hydration.",
      movement: "Higher intensity workouts, dance, or resistance training feeling fluid.",
      selfCareTip: "Cervical fluid may be watery or egg-white. Note: calendar dates are mathematical approximations."
    },
    luteal: {
      key: "luteal",
      name: "Luteal Phase",
      hormones: "Progesterone rises to support the endometrium; basal body temperature shifts slightly higher.",
      energy: "Grounded, nesting energy turning inward. Sensitivity to blood sugar drops.",
      nutrition: "Magnesium-rich dark chocolate, roasted root vegetables, and complex grains to curb cravings.",
      movement: "Pilates, steady-state movement, and calming yin yoga.",
      selfCareTip: "Set gentle personal boundaries, minimize evening screens, and prioritize soothing rituals."
    },
    pregnancy: {
      key: "pregnancy",
      name: "Gestational Journey",
      hormones: "Progesterone and hCG support placental development.",
      energy: "Fluctuating stamina; honor your fatigue without judgment.",
      nutrition: "Folate, choline, small frequent meals, and plentiful clean hydration.",
      movement: "Prenatal yoga, pelvic tilts, and leisurely walks in fresh air.",
      selfCareTip: "Stay closely connected with your prenatal care team and record bodily sensations gently."
    },
    perimenopause: {
      key: "perimenopause",
      name: "Rhythmic Transition",
      hormones: "Ovarian follicular supply naturally shifts, causing cycle variance.",
      energy: "Dynamic rhythm; adaptability and body listening are paramount.",
      nutrition: "Phytoestrogens (flaxseed, edamame), calcium, and vitamin D3.",
      movement: "Strength training for bone density and joint-friendly mobility work.",
      selfCareTip: "Wear layered breathable clothing to stay comfortable through temperature shifts."
    }
  };
  return guides[phaseKey] || guides.follicular;
}

/**
 * Formats a comprehensive, printable, and copyable Clinician Summary report.
 */
function generateClinicianSummary(S) {
  const x = calculateStats(S);
  const alerts = checkCareAlerts(S);
  const recentPeriods = vp(S).slice(-6).reverse();

  let text = `=== CycleSideChick Health Summary ===\n`;
  text += `Generated: ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}\n`;
  text += `Tracking Mode: ${S.mode || "natural"}\n`;
  text += `Cycle Regularity: ${S.reg || "unknown"}\n\n`;

  text += `--- CYCLE PARAMETERS ---\n`;
  text += `• Estimated Average Cycle: ${x.avg} days (Recency-weighted mean)\n`;
  text += `• Cycle Variation: ±${x.pm} days (SD: ${x.sd.toFixed(1)}d · ${x.confLevel} confidence)\n`;
  text += `• Adjustable Luteal Length: ${x.ll} days\n`;
  text += `• Total Valid Cycles Tracked: ${x.n}\n\n`;

  text += `--- RECENT PERIOD START DATES & DURATIONS ---\n`;
  if (recentPeriods.length) {
    recentPeriods.forEach(p => {
      const dur = pEnd(p, S) - N(p.s) + 1;
      text += `• ${p.s} to ${p.e || I(pEnd(p, S))} (${dur} days)\n`;
    });
  } else {
    text += `• No completed period dates recorded yet.\n`;
  }
  text += `\n`;

  text += `--- SYMPTOM FREQUENCIES & PAIN ---\n`;
  const symCounts = {};
  let totalPain = 0;
  let painEntries = 0;
  Object.values(S.logs || {}).forEach(l => {
    Object.keys(l.sy || {}).forEach(k => {
      symCounts[k] = (symCounts[k] || 0) + 1;
    });
    if (l.p != null) {
      totalPain += l.p;
      painEntries++;
    }
  });
  const topSym = Object.entries(symCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topSym.length) {
    topSym.forEach(([k, count]) => {
      text += `• ${k}: logged ${count} time(s)\n`;
    });
  } else {
    text += `• No symptoms logged yet.\n`;
  }
  if (painEntries > 0) {
    text += `• Average Pain Rating: ${(totalPain / painEntries).toFixed(1)} / 10\n`;
  }
  text += `\n`;

  text += `--- CLINICAL PATTERNS & ALERTS ---\n`;
  if (alerts.length) {
    alerts.forEach(a => { text += `• ATTENTION: ${a}\n`; });
  } else {
    text += `• No red-flag criteria currently flagged in logs.\n`;
  }
  text += `\n(This summary is prepared for consultation with a licensed healthcare provider.)\n`;
  return text;
}

/**
 * Compare to your usual: compares current cycle days, pain, symptoms against baseline.
 */
function compareToUsual(S) {
  const x = calculateStats(S);
  if (x.n < 3) {
    return {
      ready: false,
      needed: 3,
      current: x.n,
      message: `Compare to your usual unlocks after 3 recorded cycles (currently ${x.n} of 3 logged).`
    };
  }

  const T = TD();
  const curCycleDay = x.last != null ? T - x.last + 1 : 0;
  let curPeriodPainTotal = 0;
  let curPeriodPainCount = 0;

  // Recent logs in current cycle
  if (x.last != null) {
    for (let d = x.last; d <= T; d++) {
      const l = (S.logs || {})[I(d)];
      if (l && l.p != null) {
        curPeriodPainTotal += l.p;
        curPeriodPainCount++;
      }
    }
  }

  const avgCurPain = curPeriodPainCount ? (curPeriodPainTotal / curPeriodPainCount).toFixed(1) : null;

  return {
    ready: true,
    avgCycle: x.avg,
    curCycleDay,
    cycleDiff: curCycleDay - x.avg,
    avgCurPain,
    confidence: x.confLevel
  };
}

/**
 * Cervical Fluid Classification (Creighton / Billings natural fertility model)
 */
const CERVICAL_FLUID = {
  dry: { label: "Dry / None", desc: "Little or no sensation; typical right after menses.", fertile: "Low" },
  sticky: { label: "Sticky / Thick", desc: "Paste-like, white or yellowish, holds shape.", fertile: "Low" },
  creamy: { label: "Creamy / Smooth", desc: "Like lotion or yogurt, wet feeling.", fertile: "Transitional" },
  watery: { label: "Watery / Slippery", desc: "Clear, thin, liquid, very wet sensation.", fertile: "High" },
  eggwhite: { label: "Egg-white / Spinnbarkeit", desc: "Clear, highly stretchy between fingers.", fertile: "Peak (Estimated)" }
};

/**
 * Period Duration History
 * Extracts duration in days for each recorded period.
 */
function calculatePeriodDurations(S) {
  const valid = vp(S);
  return valid.map(p => {
    const start = N(p.s);
    const end = pEnd(p, S);
    const duration = Math.max(1, end - start + 1);
    const isConfirmedEnd = okD(p.e) && N(p.e) >= start && N(p.e) <= TD();
    return {
      startDate: p.s,
      endDate: p.e || I(end),
      duration,
      isConfirmedEnd,
      confirmed: isConfirmedEnd
    };
  });
}

/**
 * Cycle Variability & Regularity (FIGO Standard)
 * Normal: length 24-38 days, variation <= 7-9 days.
 */
function calculateVariability(S) {
  const x = calculateStats(S);
  if (x.n < 2) {
    return {
      ready: false,
      hasEnoughData: false,
      count: x.n,
      stdDev: x.sd,
      classification: "Awaiting History",
      explanation: "Variability and regularity metrics personalize after at least 2 recorded cycles."
    };
  }

  const lens = x.lens.slice(-6);
  const minLen = Math.min(...lens);
  const maxLen = Math.max(...lens);
  const spread = maxLen - minLen;
  const sd = x.sd;

  let classification = "Regular";
  let explanation = "";

  if (sd <= 3 && spread <= 6) {
    classification = "Highly Regular";
    explanation = `Your cycle is very consistent, varying by only ±${Math.round(sd)} days (range: ${minLen}–${maxLen}d).`;
  } else if (sd <= 6 && spread <= 9) {
    classification = "Normal Variation";
    explanation = `Normal physiological variation of ${spread} days across recorded cycles (typical healthy range is ≤7–9 days).`;
  } else {
    classification = "Variable Pattern";
    explanation = `Cycles vary by ${spread} days (${minLen}–${maxLen}d). Occasional variation is common due to stress, travel, illness, or hormonal shifts.`;
  }

  return {
    ready: true,
    hasEnoughData: true,
    count: lens.length,
    stdDev: sd,
    minLen,
    maxLen,
    spread,
    classification,
    explanation
  };
}

/**
 * Aggregates symptoms across logged history with severity breakdown and phase correlation.
 */
function aggregateSymptoms(S, daysWindow = 90) {
  const counts = {};
  const severities = {};
  const phaseDistribution = { follicular: 0, luteal: 0, menstrual: 0 };
  const T = TD();
  const cutoff = T - daysWindow;
  const x = calculateStats(S);

  Object.entries(S.logs || {}).forEach(([dateStr, log]) => {
    const dn = N(dateStr);
    if (dn < cutoff || !log.sy) return;

    // Estimate phase for this date if possible
    let datePhase = "follicular";
    if (pdset(S).has(dn)) {
      datePhase = "menstrual";
    } else if (x.last != null) {
      const cycleDay = ((dn - x.last) % x.avg + x.avg) % x.avg + 1;
      if (cycleDay > x.avg - x.ll) datePhase = "luteal";
    }

    Object.entries(log.sy).forEach(([sym, level]) => {
      counts[sym] = (counts[sym] || 0) + 1;
      if (!severities[sym]) severities[sym] = { mild: 0, moderate: 0, severe: 0, total: 0 };
      severities[sym].total++;
      if (level === 1) severities[sym].mild++;
      else if (level === 2) severities[sym].moderate++;
      else if (level >= 3) severities[sym].severe++;

      if (datePhase in phaseDistribution) {
        phaseDistribution[datePhase]++;
      }
    });
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => {
      const lev = severities[name] || { mild: 0, moderate: 0, severe: 0 };
      return {
        name,
        count,
        levels: lev,
        mild: lev.mild,
        moderate: lev.moderate,
        severe: lev.severe
      };
    });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    symptoms: sorted,
    list: sorted,
    totalLogged: total,
    totalEntries: total,
    phaseDistribution
  };
}

/**
 * Aggregates mood frequencies over the last 60 days.
 */
function aggregateMoods(S, daysWindow = 60) {
  const counts = [0, 0, 0, 0, 0];
  let total = 0;
  const cutoff = TD() - daysWindow;

  Object.entries(S.logs || {}).forEach(([dateStr, log]) => {
    const dn = N(dateStr);
    if (dn >= cutoff && log.m != null && log.m >= 0 && log.m < 5) {
      counts[log.m]++;
      total++;
    }
  });

  return {
    counts,
    total,
    totalLogged: total,
    percentages: counts.map(c => total ? Math.round((c / total) * 100) : 0),
    distribution: counts.map((c, i) => ({ moodIndex: i, count: c, percentage: total ? Math.round((c / total) * 100) : 0 })),
    predominant: total ? counts.indexOf(Math.max(...counts)) : null
  };
}

// Export for module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DAY, N, I, TD, fmt, okD, vp, badP, pEnd, pdset,
    calculateStats, calculatePregnancy, checkCareAlerts,
    getDailyPhaseGuidance, generateClinicianSummary, compareToUsual,
    CERVICAL_FLUID, calculatePeriodDurations, calculateVariability,
    aggregateSymptoms, aggregateMoods, syncPeriodWithFlow
  };
}

export {
  DAY, N, I, TD, fmt, okD, vp, badP, pEnd, pdset,
  calculateStats, calculatePregnancy, checkCareAlerts,
  getDailyPhaseGuidance, generateClinicianSummary, compareToUsual,
  CERVICAL_FLUID, calculatePeriodDurations, calculateVariability,
  aggregateSymptoms, aggregateMoods, syncPeriodWithFlow
};
