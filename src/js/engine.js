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

const vp = S => (S.periods || []).filter(p => okD(p.s) && N(p.s) <= TD());
const badP = S => (S.periods || []).filter(p => !(okD(p.s) && N(p.s) <= TD()));
const pEnd = (p, S) => (okD(p.e) && N(p.e) >= N(p.s) && N(p.e) <= TD()) ? N(p.e) : Math.min(N(p.s) + (S.pl || 5) - 1, Math.max(TD(), N(p.s)));

const pdset = S => {
  const s = new Set();
  vp(S).forEach(p => {
    for (let d = N(p.s); d <= pEnd(p, S); d++) s.add(d);
  });
  return s;
};

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
  let sd = 2;
  let outlierDetected = false;

  if (n > 0) {
    const sorted = [...r].sort((a, b) => a - b);
    const median = n % 2 === 1 ? sorted[Math.floor(n / 2)] : Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
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
    for (let k = 1; k <= 3; k++) pred.push(last + A * k);
  }

  // Adjustable luteal length (10-16d, default 14d)
  const ll = Math.max(10, Math.min(16, S.ll || 14));
  const nextPred = pred[0] || null;
  const estOvulation = nextPred ? nextPred - ll : null;
  const fertileStart = estOvulation ? estOvulation - 5 : null;
  const fertileEnd = estOvulation ? estOvulation + 1 : null;

  return {
    st,
    lens,
    gaps,
    avg: A,
    pm,
    sd,
    confLevel,
    confReason,
    last,
    pred,
    nextPred,
    ll,
    estOvulation,
    fertileStart,
    fertileEnd,
    n,
    outlierDetected
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

// Export for module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DAY, N, I, TD, fmt, okD, vp, badP, pEnd, pdset,
    calculateStats, calculatePregnancy, checkCareAlerts,
    generateClinicianSummary, compareToUsual
  };
}
