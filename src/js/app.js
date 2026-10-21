/**
 * CycleSideChick — Main Application Controller & View Orchestrator
 * High-performance, accessible, state-preserving mobile PWA.
 */

// Application State & Globals
let S;
let G = {};
const scrollPositions = { home: 0, calendar: 0, log: 0, insights: 0, care: 0 };

const ui = {
  tab: "home",
  cm: { y: new Date().getFullYear(), m: new Date().getMonth() },
  sel: typeof TD === "function" ? TD() : Math.floor(Date.now() / 864e5),
  prof: 0,
  cf: "",
  breath: 0,
  corrupt: false,
  conflict: null,
  clinicianModal: false,
  partnerModal: false,
  activeArticle: null,
  articleSearch: "",
  articleCategory: "All",
  assistantQuery: "",
  assistantResult: null,
  importPreview: null,
  infoTopic: null,
  tourModal: false,
  pinLocked: false,
  pinEntered: "",
  pinSettingUp: false,
  pinSetupFirst: "",
  // Care, Comfort & Journal State
  careTab: "care", // "care" | "journal" | "guide"
  journalDate: typeof TD === "function" && typeof I === "function" ? I(TD()) : "",
  journalSearch: "",
  journalMoodFilter: "",
  journalTagFilter: "",
  journalNotice: "",
  journalDraftTags: [],
  journalDraftMood: "",
  careReassuranceIdx: 0,
  careKitFilter: "all", // "all" | "fav"
  careCustomModal: false,
  customCareTitle: "",
  customCareDesc: "",
  customCareIcon: "heart",
  deleteJournalConfirm: null
};

/* Setup and State Migration */
const loaded = loadState();
S = loaded.state;
ui.corrupt = loaded.corrupt;
ui.pinLocked = PinLock.isEnabled();

G.S = S;
G.ui = ui;
G.ob = { step: 0, last: "", cl: S.cl || 28, pl: S.pl || 5, reg: S.reg || "unknown", mode: S.mode || "natural", goals: S.goals || [], rem: S.rem || 0 };

// Draft record for daily logging
const loadDraft = d => {
  const L = (S.logs && S.logs[d]) || {};
  G.dr = {
    d,
    f: L.f || "",
    m: L.m ?? null,
    p: L.p ?? null,
    en: L.en || "",
    sl: L.sl ?? null,
    sq: L.sq || "",
    water: L.water || 0,
    cm: L.cm || "",
    med: Array.isArray(L.med) ? [...L.med] : (L.med ? [L.med] : []),
    bbt: L.bbt || "",
    lh: L.lh || "",
    sy: { ...(L.sy || {}) },
    note: L.note || ""
  };
};
loadDraft(I(TD()));

function haptic(pattern = 15) {
  if (S && S.haptics === 0) return;
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

function toast(m) {
  const t = document.querySelector("#toast");
  if (!t) return;
  t.innerHTML = `${svgi("check", 18)} <span>${m}</span>`;
  t.className = "on";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.className = ""), 2600);
}

/* 10-Day Period Conflict Protection */
function ensurePeriod(dn) {
  if (dn > TD() || pdset(S).has(dn)) return;
  const prev = S.periods.filter(p => N(p.s) <= dn).sort((a, b) => N(a.s) - N(b.s)).pop();
  const nx = S.periods.find(p => N(p.s) > dn && N(p.s) - dn <= 3);

  if (nx) {
    nx.s = I(dn);
  } else if (prev && dn - N(prev.s) <= 10) {
    // Flag conflict modal if user attempts separate start within 10 days
    ui.conflict = { dn, existing: prev };
    return;
  } else {
    S.periods.push({ s: I(dn), e: null });
  }
  S.periods.sort((a, b) => N(a.s) - N(b.s));
}

/* Scroll & Caret Preservation Across Re-renders */
function beforeRender() {
  if (ui.tab) scrollPositions[ui.tab] = window.scrollY;
  const active = document.activeElement;
  return {
    id: active && active.id ? active.id : null,
    start: active && typeof active.selectionStart === "number" ? active.selectionStart : null,
    end: active && typeof active.selectionEnd === "number" ? active.selectionEnd : null,
    prevTab: ui.tab
  };
}

function hasOpenModal() {
  return Boolean(
    ui.prof ||
    ui.activeArticle ||
    ui.partnerModal ||
    ui.clinicianModal ||
    ui.conflict ||
    ui.infoTopic ||
    ui.tourModal ||
    ui.careCustomModal ||
    ui.deleteJournalConfirm
  );
}

function updateScrollLock() {
  const isLocked = hasOpenModal();
  document.body.classList.toggle("modal-open", isLocked);
  document.documentElement.classList.toggle("modal-open", isLocked);
}

function afterRender(ctx) {
  updateScrollLock();
  if (ctx && ctx.prevTab === ui.tab && scrollPositions[ui.tab] != null) {
    window.scrollTo({ top: scrollPositions[ui.tab], behavior: "instant" });
  }
  if (ctx && ctx.id) {
    const el = document.getElementById(ctx.id);
    if (el) {
      el.focus();
      if (ctx.start !== null && ctx.end !== null && typeof el.setSelectionRange === "function") {
        try { el.setSelectionRange(ctx.start, ctx.end); } catch (e) {}
      }
    }
  }
}

/* ==========================================================================
   Screen Views & Component Rendering
   ========================================================================== */

/* 1. Onboarding Flow */
function onb() {
  const o = G.ob;
  const s = o.step;
  const skip = `<button class="btn g" style="margin-top:8px" data-a="skip">Skip for now</button>`;

  if (s == 0) {
    return `
      <div class="ob view-enter" style="text-align:center;padding:32px 20px;max-width:440px;margin:0 auto">
        <div style="margin-bottom:14px">${bunny(72)}</div>
        <h1 class="wm" style="font-size:28px;margin-bottom:4px">CycleSideChick</h1>
        <p class="mut" style="font-size:15.5px;font-weight:600;color:var(--plum);margin:4px 0 16px">Your private, evidence-based cycle and wellness companion.</p>
        <div class="card tint-mint" style="text-align:left;margin-bottom:20px;padding:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            ${svgi("shield", 22)}
            <b>100% On-Device Privacy</b>
          </div>
          <p class="mut" style="margin:0;font-size:13px;line-height:1.5">
            Your records stay strictly in this browser. Zero cloud tracking, zero accounts, and zero advertising beacons.
          </p>
        </div>
        <div class="step-indicator">
          <div class="step-dot active"></div>
          <div class="step-dot"></div>
          <div class="step-dot"></div>
        </div>
        <button class="btn" data-a="next">Get started</button>
      </div>`;
  }

  if (s == 1) {
    return `
      <div class="ob view-enter" style="max-width:440px;margin:0 auto;padding:24px 20px">
        <h2>Your Cycle Baseline</h2>
        <p class="mut" style="margin-bottom:16px">If you're not sure, leave defaults. You can adjust anytime in Profile.</p>
        <div class="step-indicator" style="justify-content:flex-start">
          <div class="step-dot"></div>
          <div class="step-dot active"></div>
          <div class="step-dot"></div>
        </div>
        <div class="card">
          <label for="ol">First day of last period</label>
          <input id="ol" type="date" max="${I(TD())}" value="${o.last}" data-k="ob.last">

          <label for="oc" style="margin-top:14px">Usual cycle length (days)</label>
          <input id="oc" type="number" min="15" max="90" value="${o.cl}" data-k="ob.cl">

          <label for="op" style="margin-top:14px">Usual period bleeding duration (days)</label>
          <input id="op" type="number" min="1" max="14" value="${o.pl}" data-k="ob.pl">
        </div>
        <button class="btn" data-a="next">Continue</button>
        ${skip}
      </div>`;
  }

  return `
    <div class="ob view-enter" style="max-width:440px;margin:0 auto;padding:24px 20px">
      <h2>Select Your Tracking Mode</h2>
      <p class="mut" style="margin-bottom:16px">Tailor calculations to your unique physiology. Fertility predictions can be disabled anytime.</p>
      <div class="step-indicator" style="justify-content:flex-start">
        <div class="step-dot"></div>
        <div class="step-dot"></div>
        <div class="step-dot active"></div>
      </div>
      <div class="chips" style="display:grid;gap:8px;margin-bottom:20px">
        ${[
          ["natural", "Natural Cycle", "Predicts periods & estimated fertile window based on past history."],
          ["irregular", "Irregular Cycle", "Turns off fixed fertile windows to prevent false assurance."],
          ["contra", "Hormonal Contraception", "Hides ovulation; tracks withdrawal bleeds & pill adherence."],
          ["ttc", "Trying to Conceive", "Elevates fertile window, LH test strips & BBT tracking."],
          ["pregnancy", "Pregnancy Mode", "Calculates gestational weeks and due date via Naegele's rule."],
          ["perimenopause", "Perimenopause Mode", "STRAW+10 aligned tracking for transition rhythms."],
          ["none", "No Predictions", "Simple health diary without mathematical forecasting."]
        ].map(([v, title, desc]) => `
          <button class="card card-interactive" style="text-align:left;padding:14px;border:1.5px solid ${o.mode === v ? "var(--pink)" : "var(--border)"};background:${o.mode === v ? "var(--tint-rose-bg)" : "var(--surface)"}" data-a="setObMode" data-v="${v}">
            <b style="color:${o.mode === v ? "var(--tint-rose-text)" : "var(--plum)"}">${title}</b>
            <p class="mut" style="margin:2px 0 0;font-size:12.5px">${desc}</p>
          </button>`
        ).join("")}
      </div>
      <button class="btn" data-a="finishOb">Enter CycleSideChick</button>
      ${skip}
    </div>`;
}

/* 2. Dashboard View */
function renderHome() {
  const x = calculateStats(S);
  const T = TD();
  const L = (S.logs && S.logs[I(T)]) || {};
  const careAlerts = checkCareAlerts(S);

  // Pregnancy Hero
  if (S.mode === "pregnancy") {
    const preg = calculatePregnancy(S);
    const guidance = getDailyPhaseGuidance("pregnancy");
    return `
      <div class="pregnancy-hero card tint-butter" style="text-align:center;padding:24px 20px">
        <div class="phase-art-wrap" style="margin-bottom:10px">${phaseArt("pregnancy", 64)}</div>
        <span class="phase-pill tint-butter">✦ Pregnancy Tracking Mode</span>
        <h2 style="margin:10px 0 4px">${preg ? `Week ${preg.weeks}, Day ${preg.days}` : "Gestational Tracking"}</h2>
        <p class="mut" style="font-weight:700;color:var(--plum);margin-bottom:8px">${preg ? preg.trimester : "Estimated Milestones"}</p>
        <p class="mut" style="max-width:360px;margin:0 auto 16px">Estimated Due Date: <b>${preg ? preg.eddFormatted : "LMP needed"}</b>. Cycle forecasts are calmly paused.</p>

        <div class="guidance-metric-row">
          <div class="guidance-metric">
            <b>Nutrition Focus</b>
            <span>${guidance.nutrition}</span>
          </div>
          <div class="guidance-metric">
            <b>Gentle Movement</b>
            <span>${guidance.movement}</span>
          </div>
        </div>

        <div class="chips" style="justify-content:center;margin-top:16px">
          <button class="btn" style="max-width:240px" data-a="goLog" data-v="${I(T)}">Log daily pregnancy signs</button>
        </div>
      </div>
      ${renderCareCorner(T, "pregnancy", S)}
      ${renderMoodCard(L)}`;
  }

  // Perimenopause Hero
  if (S.mode === "perimenopause") {
    const guidance = getDailyPhaseGuidance("perimenopause");
    return `
      <div class="perimenopause-hero card tint-sage" style="text-align:center;padding:24px 20px">
        <div class="phase-art-wrap" style="margin-bottom:10px">${phaseArt("perimenopause", 64)}</div>
        <span class="phase-pill tint-sage">✦ Perimenopause Mode</span>
        <h2 style="margin:10px 0 4px">Hormonal Transition Rhythm</h2>
        <p class="mut" style="max-width:360px;margin:0 auto 16px">Cycles naturally fluctuate as ovarian activity shifts. Rigid ovulation estimates are turned off.</p>

        <div class="guidance-metric-row">
          <div class="guidance-metric">
            <b>Transition Comfort</b>
            <span>${guidance.selfCareTip}</span>
          </div>
          <div class="guidance-metric">
            <b>Active Strength</b>
            <span>${guidance.movement}</span>
          </div>
        </div>

        <div class="chips" style="justify-content:center;margin-top:16px">
          <button class="btn" style="max-width:240px" data-a="goLog" data-v="${I(T)}">Log symptoms &amp; hot flashes</button>
        </div>
      </div>
      ${renderCareCorner(T, "perimenopause", S)}
      ${renderMoodCard(L)}`;
  }

  // Clinical Red Flag Alert
  const clinicalPrompt = careAlerts.length ? `
    <div class="card tint-amber">
      <div class="row">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("alert", 20)}
          <b>Pattern to Mention to a Healthcare Provider</b>
        </div>
      </div>
      <p class="mut" style="margin-top:6px">${careAlerts[0]}</p>
      <button class="btn g" style="margin-top:10px;min-height:40px;font-size:13px" data-a="openClinician">View clinician report</button>
    </div>` : "";

  // Week Strip
  let weekDaysHTML = "";
  for (let i = -3; i <= 3; i++) {
    const dNum = ui.sel + i;
    const isToday = dNum === T;
    const isSel = dNum === ui.sel;
    const hasPeriod = pdset(S).has(dNum);
    const hasLog = !!(S.logs && S.logs[I(dNum)]);
    const isFertile = (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && dNum >= x.fertileStart && dNum <= x.fertileEnd;
    const dotColor = hasPeriod ? "var(--pink)" : isFertile ? "var(--tint-lavender-text)" : hasLog ? "var(--plum)" : "transparent";

    weekDaysHTML += `
      <div class="week-day ${isSel ? "active" : ""} ${isToday ? "today" : ""}" data-a="selDay" data-v="${dNum}">
        <span class="wd-lbl">${fmt(dNum, { weekday: "narrow" })}</span>
        <span class="wd-num">${new Date(dNum * DAY).getUTCDate()}</span>
        <span class="wd-dot" style="background:${dotColor}"></span>
      </div>`;
  }

  // Missing data empty state
  if (x.last == null) {
    return `
      ${renderGreeting(T, "uncertain")}
      ${clinicalPrompt}
      <div class="card" style="text-align:center;padding:28px 20px">
        <div class="phase-art-wrap" style="margin-bottom:12px">${bunny(64)}</div>
        <span class="phase-pill tint-sage">Setup Your History</span>
        <h2 style="margin:10px 0 6px">Begin your cycle record</h2>
        <p class="mut" style="max-width:340px;margin:0 auto 20px">Log the first day of your last period or set your known average cycle in Profile to enable personalized estimates.</p>
        <button class="btn" data-a="startToday">My period started today</button>
        <button class="btn g" style="margin-top:10px" data-a="tab" data-v="calendar">Pick past date on calendar</button>
      </div>
      ${renderCareCorner(T, "uncertain", S)}
      ${renderMoodCard(L)}`;
  }

  const day = T - x.last + 1;
  const nx = x.pred[0];
  const until = nx - T;
  const late = -until;

  let est = "";
  let note = "";
  let phaseKey = "follicular";
  let phasePill = "";

  if (pdset(S).has(T)) {
    phaseKey = "menstrual";
    phasePill = `<span class="phase-pill tint-rose">🌸 Recorded Period Day</span>`;
  } else if (S.showFertile !== 0 && (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && T >= x.fertileStart && T <= x.fertileEnd) {
    phaseKey = "fertile";
    phasePill = `<span class="phase-pill tint-lavender">✨ Estimated Fertile Window</span>`;
  } else if (day < x.avg - x.ll) {
    phaseKey = "follicular";
    phasePill = `<span class="phase-pill tint-sage">🌱 Follicular Phase</span>`;
  } else {
    phaseKey = "luteal";
    phasePill = `<span class="phase-pill tint-peach">🌙 Luteal Phase</span>`;
  }

  if (S.mode === "none") {
    est = `Cycle day <b>${day}</b> recorded`;
    note = "Predictions are turned off in your Profile settings.";
  } else if (S.mode === "contra") {
    est = `Day <b>${day}</b> of current cycle record`;
    note = "Hormonal contraception active; predictions and fertile window are hidden.";
  } else if (until >= 0) {
    est = `Next estimated period in about <b>${until} day${until == 1 ? "" : "s"}</b>`;
    note = `Estimated between ${fmt(nx - x.pm)} and ${fmt(nx + x.pm)} (±${x.pm}d · ${x.confLevel} confidence).`;
  } else {
    est = `Period is <b>${late} day${late == 1 ? "" : "s"}</b> past estimate`;
    note = `A late period has many common causes including stress, travel, illness, sleep changes, or natural variation.`;
  }

  const guidance = getDailyPhaseGuidance(phaseKey, day);

  // Compare to your usual insight
  const comp = compareToUsual(S);
  const compCard = comp.ready ? `
    <div class="card tint-sky" style="padding:16px">
      <div class="row">
        <b>Compare to Your Usual</b>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11.5px">Cycle Day ${comp.curCycleDay}</span>
      </div>
      <p class="mut" style="margin-top:4px;font-size:13px">
        Your current cycle is ${comp.cycleDiff === 0 ? "on track with your baseline" : comp.cycleDiff > 0 ? `${comp.cycleDiff} days longer than average` : `${Math.abs(comp.cycleDiff)} days shorter than average`}.
        ${comp.avgCurPain ? `Average recorded pain this cycle: ${comp.avgCurPain}/10.` : ""}
      </p>
    </div>` : "";

  return `
    ${renderGreeting(T, phaseKey)}
    ${clinicalPrompt}

    <div class="week-strip" role="region" aria-label="Current Week">
      ${weekDaysHTML}
    </div>

    <!-- Cycle Ring Dashboard Card -->
    <div class="card" style="text-align:center;padding:20px 16px">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px">
        ${phasePill}
        <button class="info-btn" data-a="openInfo" data-v="${phaseKey}" aria-label="About ${guidance.name}">${svgi("info", 16)}</button>
      </div>
      ${ring(x, day, S)}
      <p class="big" style="margin:4px 0 6px">${est}</p>
      <p class="mut" style="max-width:380px;margin:0 auto;font-size:13px">${note}</p>
      <div style="margin-top:8px">
        <button class="chip" style="min-height:28px;padding:2px 10px;font-size:11.5px" data-a="openInfo" data-v="confidence">
          ${svgi("sparkle", 12)} Confidence: ${x.confLevel} (±${x.pm}d)
        </button>
      </div>
    </div>

    <!-- Daily Phase & Wellness Guidance Card -->
    <div class="card tint-mint phase-guidance-card">
      <div class="phase-art-wrap">${phaseArt(phaseKey, 54)}</div>
      <div>
        <h4 style="margin:0 0 2px;color:var(--plum)">${guidance.name}</h4>
        <p style="margin:0;font-size:12.5px;line-height:1.45;color:var(--plum)">${guidance.hormones}</p>
        <div style="margin-top:8px;font-size:12px;font-weight:600">
          💡 ${guidance.selfCareTip}
        </div>
      </div>
    </div>

    ${renderCareCorner(T, phaseKey, S)}
    ${compCard}
    ${renderMoodCard(L)}

    <div class="chips" style="display:flex;gap:10px;margin-top:4px">
      ${until <= 2
        ? `<button class="btn" style="flex:1" data-a="startToday">Period started today</button>
           <button class="btn g" style="flex:1" data-a="goLog" data-v="${I(T)}">Log symptoms</button>`
        : `<button class="btn" style="flex:1" data-a="goLog" data-v="${I(T)}">Log mood &amp; symptoms</button>`
      }
    </div>`;
}

function renderGreeting(T, phaseKey = "follicular") {
  const h = new Date().getHours();
  const timeGreeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  let gentleWish = "Take a slow breath and move at your own pace today.";
  if (phaseKey === "menstrual") {
    gentleWish = "May today bring you warmth, gentleness, and rest without guilt.";
  } else if (phaseKey === "fertile") {
    gentleWish = "Staying gently tuned into your body's natural vitality.";
  } else if (phaseKey === "luteal") {
    gentleWish = "You deserve quiet space and gentle boundaries today.";
  } else if (phaseKey === "pregnancy") {
    gentleWish = "Nourishing yourself and your growing little one.";
  } else if (phaseKey === "perimenopause") {
    gentleWish = "Honoring your body's unique transition with grace.";
  }

  return `
    <div style="margin-bottom:14px">
      <p class="mut" style="margin:0;font-weight:600;font-size:13px">${fmt(T, { weekday: "long", month: "long", day: "numeric" })}</p>
      <h2 style="margin:2px 0 4px">${timeGreeting}</h2>
      <p class="mut" style="margin:0;font-size:13.5px;color:var(--plum);font-weight:500">${gentleWish}</p>
    </div>`;
}

function renderCareCorner(T, phaseKey, S) {
  const dStr = I(T);
  const reassurance = getReassuranceMessage(ui.careReassuranceIdx + (T % 16));
  const suggestions = getCareSuggestions(S, dStr);
  const checkin = (S.careCheckin && S.careCheckin[dStr]) || {};
  const currentFeeling = checkin.feeling || "";

  // Calculate pressure-free care moments today
  let careMoments = 0;
  if (currentFeeling) careMoments++;
  if (S.logs && S.logs[dStr] && (S.logs[dStr].water || S.logs[dStr].m != null)) careMoments++;
  if (S.journal && S.journal[dStr] && S.journal[dStr].text) careMoments++;
  if (Object.keys(S.careSaved || {}).length > 0) careMoments++;

  const feelings = [
    ["grounded", "🌿 Grounded"],
    ["tired", "☁️ Low Energy"],
    ["sensitive", "🌸 Sensitive"],
    ["energized", "☀️ Energized"],
    ["peaceful", "🕊️ Peaceful"],
    ["stressed", "🌧️ Stressed"]
  ];

  const topSuggestion = suggestions[0];

  return `
    <div class="care-corner-card">
      <div class="row" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("heart", 18, "tint-rose-text")}
          <b style="color:var(--plum);font-size:15px">Your Little Care Corner</b>
        </div>
        ${careMoments > 0 ? `
          <span class="gentle-progress-badge">
            ${svgi("sparkle", 12)} ${careMoments} moment${careMoments > 1 ? "s" : ""} of care today
          </span>` : ""
        }
      </div>

      <div class="reassurance-box">
        <p class="reassurance-quote">“${reassurance}”</p>
        <button class="reassurance-refresh-btn" data-a="nextReassurance" aria-label="Next gentle thought">
          ${svgi("refresh", 14)}
        </button>
      </div>

      <div style="margin:8px 0 4px">
        <label style="margin:0 0 6px;font-size:12.5px;font-weight:700">How are you feeling today?</label>
        <div class="checkin-row">
          ${feelings.map(([k, label]) => `
            <button class="checkin-btn ${currentFeeling === k ? "active" : ""}" data-a="careCheckin" data-v="${k}">
              ${label}
            </button>
          `).join("")}
        </div>
      </div>

      ${topSuggestion ? `
        <div class="care-suggestion-card" style="margin-top:10px">
          <div class="care-suggestion-header">
            <span class="article-tag tint-${topSuggestion.categoryColor}">${topSuggestion.category}</span>
            <span class="mut" style="font-size:11.5px">💡 Gentle Idea</span>
          </div>
          <b style="font-size:14px;color:var(--plum);display:block;margin-bottom:4px">${topSuggestion.title}</b>
          <p style="margin:0;font-size:13px;line-height:1.45">${topSuggestion.desc}</p>
          <div class="care-suggestion-actions">
            <button class="chip" data-a="saveCareSuggestion" data-v="${topSuggestion.id}">
              ${svgi("star", 12)} ${S.careSaved && S.careSaved[topSuggestion.id] ? "Saved" : "Save Idea"}
            </button>
            <button class="chip" data-a="dismissCareSuggestion" data-v="${topSuggestion.id}" style="color:var(--muted)">
              ${svgi("x", 12)} Dismiss
            </button>
          </div>
        </div>` : ""
      }

      <div class="chips" style="display:flex;gap:8px;margin-top:10px">
        <button class="btn g" style="flex:1;min-height:38px;font-size:13px" data-a="openJournal" data-v="${dStr}">
          ${svgi("feather", 14)} Open My Journal
        </button>
        <button class="btn g" style="flex:1;min-height:38px;font-size:13px" data-a="tab" data-v="care">
          ${svgi("heart", 14)} Care &amp; Comfort Hub
        </button>
      </div>
    </div>`;
}

function renderMoodCard(L) {
  const k = I(TD());
  if (L.m != null) {
    return `
      <div class="card tint-peach">
        <div class="row">
          <div style="display:flex;align-items:center;gap:12px">
            ${face(L.m, 42)}
            <div>
              <p style="margin:0;font-size:11px;text-transform:uppercase;font-weight:700">Today's Mood</p>
              <h3 style="margin:0">${MOODS[L.m].name}</h3>
              <p class="mut" style="margin:0;font-size:12px">${MOODS[L.m].sub}</p>
            </div>
          </div>
          <button class="chip" data-a="goLog" data-v="${k}">Edit entry</button>
        </div>
      </div>`;
  }
  return `
    <div class="card">
      <div class="row">
        <h3>How are you feeling today?</h3>
      </div>
      ${moods(null, "qm")}
    </div>`;
}

/* 3. Calendar View */
function renderCalendar() {
  const x = calculateStats(S);
  const T = TD();
  const { y, m } = ui.cm;
  const ps = pdset(S);
  const pr = new Set();
  const fe = new Set();

  if (S.mode !== "none" && S.mode !== "contra" && S.mode !== "pregnancy") {
    // Current ongoing cycle fertile window if active and enabled
    if (S.showFertile !== 0 && x.fertileStart && x.fertileEnd) {
      for (let d = x.fertileStart; d <= x.fertileEnd; d++) fe.add(d);
    }
    // Future cycles with individual fertile windows
    if (Array.isArray(x.predictedCycles)) {
      x.predictedCycles.forEach(pc => {
        for (let d = pc.periodStart; d <= pc.periodEnd; d++) {
          if (d >= T) pr.add(d);
        }
        if (S.showFertile !== 0 && S.mode !== "irregular" && pc.fertileStart && pc.fertileEnd) {
          for (let d = pc.fertileStart; d <= pc.fertileEnd; d++) {
            fe.add(d);
          }
        }
      });
    } else {
      x.pred.forEach(p => {
        for (let d = p; d < p + (S.pl || 5); d++) if (d >= T) pr.add(d);
      });
    }
  }

  const curDate = new Date();
  const isCurMonth = y === curDate.getFullYear() && m === curDate.getMonth();

  const firstDay = new Date(Date.UTC(y, m, 1));
  const off = (firstDay.getUTCDay() + 6) % 7;
  const numDays = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  let cells = "<i></i>".repeat(off);
  for (let d = 1; d <= numDays; d++) {
    const n = Date.UTC(y, m, d) / DAY;
    const k = ps.has(n) ? "c" : pr.has(n) ? "p" : fe.has(n) ? "f" : "";
    const label = fmt(n, { weekday: "long", month: "long", day: "numeric" });

    cells += `
      <button class="day ${k} ${n == T ? "t" : ""} ${n == ui.sel ? "s" : ""} ${(S.logs && S.logs[I(n)]) ? "l" : ""}"
        data-a="day" data-v="${n}" aria-label="${label}">
        ${d}
      </button>`;
  }

  const sel = ui.sel;
  const rec = vp(S).find(p => N(p.s) <= sel && sel <= pEnd(p, S));
  const fut = sel > T;

  let st = "No period recorded.";
  if (rec) st = `Period day ${sel - N(rec.s) + 1}. Confirmed record.`;
  else if (pr.has(sel)) st = "Estimated period day (mathematical prediction).";
  else if (fe.has(sel)) st = "Estimated fertile window (approximation only).";

  const btns = rec
    ? `${sel > N(rec.s) && !fut ? `<button class="btn g" data-a="pend">Period ended this day</button>` : ""}
       <button class="btn g" data-a="prem">${ui.cf == "rm" ? "Tap again to remove period" : "Remove this period"}</button>`
    : `<button class="btn" data-a="pstart" ${fut ? "disabled" : ""}>Period started this day</button>`;

  const selLog = S.logs && S.logs[I(sel)];
  const logSnippet = selLog ? `
    <div style="margin:10px 0;padding:12px;background:var(--surface-alt);border-radius:var(--radius-sm);font-size:13px;line-height:1.5">
      ${selLog.m != null ? `<b>Mood:</b> ${MOODS[selLog.m].name} · ` : ""}
      ${selLog.f ? `<b>Flow:</b> ${selLog.f} · ` : ""}
      ${selLog.p != null ? `<b>Pain:</b> ${selLog.p}/10 · ` : ""}
      ${selLog.en ? `<b>Energy:</b> ${selLog.en} · ` : ""}
      ${selLog.water ? `<b>Hydration:</b> ${selLog.water} glasses · ` : ""}
      ${selLog.cm ? `<b>Cervical Fluid:</b> ${selLog.cm} · ` : ""}
      ${selLog.sl != null ? `<b>Sleep:</b> ${selLog.sl}h · ` : ""}
      ${Object.keys(selLog.sy || {}).length ? `<b>Symptoms:</b> ${Object.keys(selLog.sy).join(", ")}` : ""}
    </div>` : "";

  return `
    <div class="view-enter">
      <div class="card">
        <div class="row">
          <button class="icon" data-a="mo" data-v="-1" aria-label="Previous month">${svgi("arrowLeft", 18)}</button>
          <div style="text-align:center">
            <h2 style="margin:0">${fmt(Date.UTC(y, m, 1) / DAY, { month: "long", year: "numeric" })}</h2>
            ${!isCurMonth ? `<button class="chip" data-a="jumpToday" style="min-height:24px;padding:2px 8px;font-size:11px;margin-top:4px">${svgi("sun", 12)} Jump to Today</button>` : ""}
          </div>
          <button class="icon" data-a="mo" data-v="1" aria-label="Next month">${svgi("arrowRight", 18)}</button>
        </div>

        <div class="grid7" style="margin-top:14px">
          ${["M", "T", "W", "T", "F", "S", "S"].map(d => `<b>${d}</b>`).join("")}
          ${cells}
        </div>

        <div class="leg">
          <span><i style="background:var(--pink)"></i> Confirmed period</span>
          <span><i style="border:2px dashed var(--pink);background:var(--tint-rose-bg)"></i> Predicted</span>
          <span><i style="background:var(--tint-lavender-bg);border:1px solid var(--tint-lavender-border)"></i> Estimated fertile</span>
          <span><i style="background:var(--plum);width:6px;height:6px"></i> Logged entry</span>
        </div>
      </div>

      <div class="card">
        <div class="row" style="margin-bottom:6px">
          <h3>${fmt(sel, { weekday: "long", month: "long", day: "numeric" })}</h3>
          ${sel == T ? `<span class="chip" style="min-height:30px;padding:4px 10px;font-size:12px">Today</span>` : ""}
        </div>
        <p class="mut">${st}${fut ? " Future dates cannot be logged." : ""}</p>
        ${logSnippet}
        <div class="chips" style="display:grid;gap:8px;margin-top:14px">
          ${btns}
          ${fut ? "" : `<button class="btn g" data-a="goLog" data-v="${I(sel)}">${svgi("log", 16)} Log symptoms &amp; health signs</button>`}
        </div>
      </div>
    </div>`;
}

/* 4. Daily Logging View */
function renderLog() {
  const d = G.dr;
  const symptomCategories = [
    { cat: "Pelvic & Body", items: ["Cramps", "Backache", "Breast tenderness"] },
    { cat: "Head & Energy", items: ["Headache", "Fatigue", "Brain fog"] },
    { cat: "Digestion & Belly", items: ["Bloating", "Nausea", "Cravings"] },
    { cat: "Skin & Mood", items: ["Acne", "Mood swings"] }
  ];
  const customItems = S.custom || [];

  return `
    <div class="view-enter">
      <div class="row" style="margin-bottom:14px">
        <h2>Log Daily Wellness</h2>
        <div class="chips" style="margin:0">
          <button class="chip" data-a="quickDate" data-v="${I(TD())}" ${d.d == I(TD()) ? 'aria-pressed="true"' : ""}>Today</button>
          <button class="chip" data-a="quickDate" data-v="${I(TD() - 1)}" ${d.d == I(TD() - 1) ? 'aria-pressed="true"' : ""}>Yesterday</button>
        </div>
      </div>

      <div class="card">
        <label for="ld">Entry date</label>
        <input id="ld" type="date" max="${I(TD())}" value="${d.d}" data-a="ldate">

        <label style="margin-top:16px">Bleeding flow</label>
        <div class="chips">
          ${[["none", "None"], ["spotting", "Spotting"], ["light", "Light"], ["medium", "Medium"], ["heavy", "Heavy"]]
            .map(([f, l]) => chip(l, d.f == f, `data-a="flow" data-v="${f}"`)).join("")}
        </div>

        <label style="margin-top:16px">Mood</label>
        ${moods(d.m, "dm")}
      </div>

      <div class="card">
        <div class="row">
          <label for="lp" style="margin:0">Pain rating (0–10)</label>
          <span id="lpv" style="font-weight:700;color:var(--plum);font-size:14px">
            ${d.p != null ? d.p + "/10 · " + (d.p === 0 ? "No pain" : d.p <= 3 ? "Mild" : d.p <= 6 ? "Moderate" : d.p <= 8 ? "Severe" : "Very severe") : "Not logged"}
          </span>
        </div>
        <input id="lp" type="range" min="0" max="10" step="1" value="${d.p ?? 0}" data-k="dr.p" data-out="lpv">

        <label style="margin-top:16px">Energy level</label>
        <div class="chips">
          ${[["low", "Low"], ["balanced", "Balanced"], ["high", "High"]]
            .map(([v, l]) => chip(l, d.en === v, `data-a="energy" data-v="${v}"`)).join("")}
        </div>

        ${S.waterGoal !== 0 ? `
          <div class="row" style="margin-top:16px">
            <label style="margin:0">Hydration (8 glasses goal)</label>
            <span style="font-size:13px;font-weight:700;color:var(--tint-sky-text)">${d.water || 0} / 8 glasses</span>
          </div>
          <div class="water-cups-row">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `
              <button class="water-cup-btn ${n <= (d.water || 0) ? "filled" : ""}" data-a="setWater" data-v="${n}" aria-label="${n} glasses of water">
                ${svgi("water", 16)}
                <span style="font-size:11px">${n}</span>
              </button>`
            ).join("")}
          </div>
        ` : ""}

        <div class="row" style="margin-top:16px">
          <label for="sl" style="margin:0">Sleep duration</label>
          <span id="slv" style="font-weight:700;color:var(--plum);font-size:14px">${d.sl == null ? "Not logged" : d.sl + " h"}</span>
        </div>
        <input id="sl" type="range" min="3" max="12" step="0.5" value="${d.sl ?? 7}" data-k="dr.sl" data-out="slv">
      </div>

      <div class="card">
        <label>Cervical fluid consistency</label>
        <div class="chips">
          ${[["dry", "Dry"], ["sticky", "Sticky"], ["creamy", "Creamy"], ["watery", "Watery"], ["eggwhite", "Egg-white"]]
            .map(([v, l]) => chip(l, d.cm === v, `data-a="cm" data-v="${v}"`)).join("")}
        </div>

        <label style="margin-top:16px">Medication &amp; supplements</label>
        <div class="chips">
          ${["Contraceptive pill", "Pain reliever", "Vitamins", "Iron", "Magnesium"]
            .map(m => chip(m, d.med.includes(m), `data-a="med" data-v="${m}"`)).join("")}
        </div>

        ${(S.mode === "natural" || S.mode === "ttc") ? `
          <label style="margin-top:16px">LH ovulation test</label>
          <div class="chips">
            ${[["none", "Not tested"], ["neg", "Negative"], ["faint", "Faint / Low"], ["pos", "Positive / Peak"]]
              .map(([v, l]) => chip(l, d.lh === v, `data-a="lh" data-v="${v}"`)).join("")}
          </div>

          <label for="bbt" style="margin-top:16px">Basal body temperature (BBT)</label>
          <input id="bbt" type="text" placeholder="e.g. 98.2 °F or 36.7 °C" value="${esc(d.bbt)}" data-k="dr.bbt">
        ` : ""}
      </div>

      <div class="card">
        <div class="row" style="margin-bottom:4px">
          <h3 style="margin:0">Symptom Journal</h3>
          <span class="chip" style="min-height:24px;padding:1px 8px;font-size:11px">Tap: Mild · Mod · Severe</span>
        </div>
        <p class="mut" style="font-size:12.5px;margin:0 0 12px">Track physical and emotional patterns to uncover cycle-linked trends.</p>

        ${symptomCategories.map(c => `
          <div style="margin-bottom:10px">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:0.04em">${c.cat}</span>
            <div class="chips" style="margin:6px 0 0">
              ${c.items.map(s => {
                const v = d.sy[s] || 0;
                const dots = [1, 2, 3].map(i => `<i class="${i <= v ? "on" : ""}"></i>`).join("");
                return `
                  <button class="chip chip-sym" data-level="${v}" aria-pressed="${v > 0}" data-a="sym" data-v="${esc(s)}"
                    aria-label="${esc(s)}: ${["not logged", "mild", "moderate", "strong"][v]}">
                    <span>${esc(s)}</span>
                    <span class="dots" aria-hidden="true">${dots}</span>
                  </button>`;
              }).join("")}
            </div>
          </div>
        `).join("")}

        ${customItems.length ? `
          <div style="margin-bottom:10px">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:0.04em">Personal Symptoms</span>
            <div class="chips" style="margin:6px 0 0">
              ${customItems.map(s => {
                const v = d.sy[s] || 0;
                const dots = [1, 2, 3].map(i => `<i class="${i <= v ? "on" : ""}"></i>`).join("");
                return `
                  <button class="chip chip-sym" data-level="${v}" aria-pressed="${v > 0}" data-a="sym" data-v="${esc(s)}"
                    aria-label="${esc(s)}: ${["not logged", "mild", "moderate", "strong"][v]}">
                    <span>${esc(s)}</span>
                    <span class="dots" aria-hidden="true">${dots}</span>
                  </button>`;
              }).join("")}
            </div>
          </div>
        ` : ""}

        <div class="row" style="margin-top:12px">
          <input id="cs" placeholder="Add custom symptom..." maxlength="30" aria-label="Custom symptom name">
          <button class="chip" data-a="addc" style="flex:none;min-height:48px">+ Add</button>
        </div>
      </div>

      <div class="card">
        <label for="nt" style="margin:0 0 6px">Personal notes</label>
        <textarea id="nt" rows="3" data-k="dr.note" maxlength="500" placeholder="Feelings, cravings, or health observations...">${esc(d.note)}</textarea>
      </div>

      <button class="btn" style="margin-top:8px" data-a="save">${svgi("check", 18)} Save entry</button>
    </div>`;
}

/* 5. Insights View */
function renderInsights() {
  const x = calculateStats(S);
  const ls = x.lens.slice(-8);
  const durations = calculatePeriodDurations(S);
  const variability = calculateVariability(S);
  const symptomsAgg = aggregateSymptoms(S, 60);
  const moodsAgg = aggregateMoods(S, 60);

  const avgPeriodDays = durations.length
    ? (durations.reduce((a, b) => a + b.duration, 0) / durations.length).toFixed(1)
    : S.pl;

  return `
    <div class="view-enter">
      <div class="row" style="margin-bottom:14px">
        <div>
          <h2 style="margin:0 0 2px">Cycle Insights &amp; Analytics</h2>
          <p class="mut" style="margin:0;font-size:13px">Clinical trends, biometric patterns &amp; cycle variability</p>
        </div>
        <button class="chip" data-a="openClinician" style="min-height:34px;padding:4px 12px;font-size:12px">
          ${svgi("copy", 14)} Clinician Summary
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card tint-rose" style="padding:16px;text-align:center;margin:0">
          <span style="font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:0.04em">Recency Mean Cycle</span>
          <div style="font-size:26px;font-weight:800;color:var(--plum);margin-top:2px">
            ${x.avg} <span style="font-size:14px;font-weight:600">days</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">Spread: ±${x.pm}d · ${x.confLevel}</div>
        </div>

        <div class="card tint-sage" style="padding:16px;text-align:center;margin:0">
          <span style="font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:0.04em">Avg Period Bleeding</span>
          <div style="font-size:26px;font-weight:800;color:var(--plum);margin-top:2px">
            ${avgPeriodDays} <span style="font-size:14px;font-weight:600">days</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${durations.length} recorded periods</div>
        </div>
      </div>

      <!-- Prediction Confidence Status -->
      <div class="card tint-lavender" style="margin-bottom:14px">
        <div class="row">
          <div style="display:flex;align-items:center;gap:8px">
            ${svgi("sparkle", 18)}
            <b>Prediction Confidence: ${x.confLevel}</b>
            <button class="info-btn" data-a="openInfo" data-v="confidence" aria-label="Prediction confidence info">${svgi("info", 16)}</button>
          </div>
          <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11.5px">${MODE_NAMES[S.mode] || S.mode}</span>
        </div>
        <p class="mut" style="margin:6px 0 0;font-size:13px;line-height:1.45">
          ${x.confReason} Luteal length configured to ${x.ll} days.
        </p>
      </div>

      <!-- Estimated Phase Distribution -->
      <div class="card" style="margin-bottom:14px">
        <div class="row" style="margin-bottom:6px">
          <h3 style="margin:0">Estimated Phase Distribution</h3>
          <button class="info-btn" data-a="openTour" aria-label="Open 4-phase architecture tour">${svgi("layers", 16)}</button>
        </div>
        <p class="mut" style="font-size:13px;margin:0 0 10px">Based on your personalized ${x.avg}-day cycle and ${x.ll}-day luteal phase.</p>
        <div style="display:flex;gap:4px;height:26px;border-radius:var(--radius-pill);overflow:hidden">
          <div style="flex:${Math.max(1, S.pl || 5)};background:var(--phase-menstrual);display:grid;place-items:center;font-size:11px;font-weight:700;color:#FFFFFF" title="Menstrual: ${S.pl || 5} days">
            Menstrual (${S.pl || 5}d)
          </div>
          <div style="flex:${Math.max(1, x.avg - x.ll - (S.pl || 5))};background:var(--phase-follicular);display:grid;place-items:center;font-size:11px;font-weight:700;color:#FFFFFF" title="Follicular: ${Math.max(1, x.avg - x.ll - (S.pl || 5))} days">
            Follicular (~${Math.max(1, x.avg - x.ll - (S.pl || 5))}d)
          </div>
          <div style="flex:${x.ll};background:var(--phase-luteal);display:grid;place-items:center;font-size:11px;font-weight:700;color:#FFFFFF" title="Luteal: ${x.ll} days">
            Luteal (${x.ll}d)
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--muted);font-weight:600">
          <span>Day 1 (Period Start)</span>
          <span>Ovulation (~Day ${Math.max(1, x.avg - x.ll)})</span>
          <span>Day ${x.avg}</span>
        </div>
      </div>

      <!-- Historical Cycle Lengths Chart -->
      <div class="card chart-card" style="margin-bottom:14px">
        ${renderCycleLengthChart(x, ls)}
      </div>

      <!-- Historical Period Duration Chart -->
      <div class="card chart-card" style="margin-bottom:14px">
        ${renderPeriodDurationChart(durations, S.pl)}
      </div>

      <!-- FIGO Clinical Variability Gauge -->
      <div class="card" style="margin-bottom:14px">
        ${renderVariabilityGauge(variability)}
      </div>

      <!-- 60-Day Symptom Heatmap -->
      <div class="card" style="margin-bottom:14px">
        ${renderSymptomHeatmap(symptomsAgg)}
      </div>

      <!-- 60-Day Mood Distribution -->
      <div class="card" style="margin-bottom:14px">
        ${renderMoodDistribution(moodsAgg)}
      </div>
    </div>`;
}

/* 6. Care, Comfort & Companion Hub */
function getPhaseForDate(dStr, S, x) {
  if (!x || x.last == null) return "uncertain";
  const dNum = N(dStr);
  if (pdset(S).has(dNum)) return "menstrual";
  if (S.showFertile !== 0 && (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && dNum >= x.fertileStart && dNum <= x.fertileEnd) return "fertile";
  const dayInCycle = dNum - x.last + 1;
  if (dayInCycle >= (x.avg - x.ll)) return "luteal";
  return "follicular";
}

function renderCare() {
  const T = TD();
  const x = calculateStats(S);
  const phaseKey = getPhaseForDate(I(T), S, x);

  return `
    <div class="view-enter">
      <div class="row" style="margin-bottom:12px">
        <div>
          <span class="article-tag tint-lavender">Gentle Companion</span>
          <h2 style="margin:4px 0 0">Care, Comfort &amp; Journal</h2>
        </div>
      </div>

      <!-- Segmented Hub Navigation -->
      <div class="care-hub-nav" role="tablist" aria-label="Care Sections">
        <button class="care-tab-btn ${ui.careTab === "care" ? "active" : ""}" data-a="setCareTab" data-v="care" role="tab" aria-selected="${ui.careTab === "care"}">
          ${svgi("heart", 14)} Care &amp; Comfort
        </button>
        <button class="care-tab-btn ${ui.careTab === "journal" ? "active" : ""}" data-a="setCareTab" data-v="journal" role="tab" aria-selected="${ui.careTab === "journal"}">
          ${svgi("feather", 14)} My Journal
        </button>
        <button class="care-tab-btn ${ui.careTab === "guide" ? "active" : ""}" data-a="setCareTab" data-v="guide" role="tab" aria-selected="${ui.careTab === "guide"}">
          ${svgi("book", 14)} Cycle Guide &amp; Library
        </button>
      </div>

      ${ui.careTab === "journal"
        ? renderJournalTab(T, phaseKey, S, x)
        : ui.careTab === "guide"
        ? renderCycleGuideTab(T, phaseKey, S, x)
        : renderCareComfortTab(T, phaseKey, S, x)
      }
    </div>`;
}

/* Sub-View: Care & Comfort Dashboard (Pillars 1 & 2) */
function renderCareComfortTab(T, phaseKey, S, x) {
  const dStr = I(T);
  const reassurance = getReassuranceMessage(ui.careReassuranceIdx + (T % 16));
  const suggestions = getCareSuggestions(S, dStr);
  const checkin = (S.careCheckin && S.careCheckin[dStr]) || {};
  const currentFeeling = checkin.feeling || "";

  // Pressure-free care counter
  let careMoments = 0;
  if (currentFeeling) careMoments++;
  if (S.logs && S.logs[dStr] && (S.logs[dStr].water || S.logs[dStr].m != null)) careMoments++;
  if (S.journal && S.journal[dStr] && S.journal[dStr].text) careMoments++;
  if (Object.keys(S.careSaved || {}).length > 0) careMoments++;

  const feelings = [
    ["grounded", "🌿 Grounded"],
    ["tired", "☁️ Low Energy"],
    ["sensitive", "🌸 Sensitive"],
    ["energized", "☀️ Energized"],
    ["peaceful", "🕊️ Peaceful"],
    ["stressed", "🌧️ Stressed"]
  ];

  // Personal Care Kit items & filtering
  const allKit = S.careKit || DEFAULT_CARE_KIT;
  const favCount = allKit.filter(k => k.isFav).length;
  const displayedKit = ui.careKitFilter === "fav" ? allKit.filter(k => k.isFav) : allKit;

  // Active guide for current phase
  const curGuide = FULL_CYCLE_CARE_GUIDES[phaseKey] || FULL_CYCLE_CARE_GUIDES.uncertain;

  return `
    <!-- 1. Warm Reassurance & Daily Check-in Hero -->
    <div class="care-corner-card">
      <div class="row" style="margin-bottom:8px">
        <span class="article-tag tint-rose">${curGuide.phaseName}</span>
        ${careMoments > 0 ? `
          <span class="gentle-progress-badge">
            ${svgi("sparkle", 12)} ${careMoments} moment${careMoments > 1 ? "s" : ""} of care today
          </span>` : ""
        }
      </div>

      <div class="reassurance-box">
        <p class="reassurance-quote">“${reassurance}”</p>
        <button class="reassurance-refresh-btn" data-a="nextReassurance" aria-label="Next gentle thought">
          ${svgi("refresh", 14)}
        </button>
      </div>

      <div style="margin:10px 0 4px">
        <label style="margin:0 0 6px;font-size:12.5px;font-weight:700">How are you feeling today?</label>
        <div class="checkin-row">
          ${feelings.map(([k, label]) => `
            <button class="checkin-btn ${currentFeeling === k ? "active" : ""}" data-a="careCheckin" data-v="${k}">
              ${label}
            </button>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 2. What Might Help Me Today? Care Tool -->
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("sparkle", 18, "tint-lavender-text")}
          <h3 style="margin:0">What Might Help Me Today?</h3>
        </div>
        <span class="mut" style="font-size:12px">Personalized Ideas</span>
      </div>
      <p class="mut" style="font-size:12.5px;margin:0 0 12px">Transparent, rule-based ideas tailored to what you logged today. Tap save or add directly to your Care Kit.</p>

      ${suggestions.length ? suggestions.map(s => `
        <div class="care-suggestion-card">
          <div class="care-suggestion-header">
            <span class="article-tag tint-${s.categoryColor}">${s.category}</span>
            <span class="mut" style="font-size:11.5px">💡 Gentle Idea</span>
          </div>
          <b style="font-size:14px;color:var(--plum);display:block;margin-bottom:4px">${s.title}</b>
          <p style="margin:0;font-size:13px;line-height:1.45">${s.desc}</p>
          <div class="care-suggestion-actions">
            <button class="chip" data-a="saveCareSuggestion" data-v="${s.id}">
              ${svgi("star", 12)} ${S.careSaved && S.careSaved[s.id] ? "Saved in Ideas" : "Save Idea"}
            </button>
            <button class="chip" data-a="addCareKitSuggestion" data-v="${s.kitId}">
              ${svgi("heart", 12)} Add to Care Kit
            </button>
            <button class="chip" data-a="dismissCareSuggestion" data-v="${s.id}" style="color:var(--muted)">
              ${svgi("x", 12)} Dismiss
            </button>
          </div>
        </div>
      `).join("") : `
        <div style="text-align:center;padding:16px;background:var(--surface-alt);border-radius:var(--radius-md)">
          <p class="mut" style="margin:0;font-size:13px">You've reviewed your suggestions for today. Feel free to explore your Personal Care Kit below!</p>
        </div>`
      }
    </div>

    <!-- 3. What Helps Me — Personal Care Kit -->
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("heart", 18, "tint-rose-text")}
          <h3 style="margin:0">“What Helps Me” Personal Care Kit</h3>
        </div>
        <button class="chip" data-a="openCustomCareModal">${svgi("plus", 14)} Add Item</button>
      </div>
      <p class="mut" style="font-size:12.5px;margin:0 0 12px">Your personal collection of comfort strategies, rituals, and soothing tools.</p>

      <!-- Filter Tabs -->
      <div class="chips" style="gap:8px;margin-bottom:10px">
        <button class="chip ${ui.careKitFilter !== "fav" ? "active" : ""}" data-a="setCareKitFilter" data-v="all">
          All Strategies (${allKit.length})
        </button>
        <button class="chip ${ui.careKitFilter === "fav" ? "active" : ""}" data-a="setCareKitFilter" data-v="fav">
          ⭐ Favorites (${favCount})
        </button>
      </div>

      <div class="care-kit-grid">
        ${displayedKit.map(item => `
          <div class="care-kit-item ${item.isFav ? "favorited" : ""}">
            <div class="care-kit-top">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="color:var(--pink)">${svgi(item.icon || "heart", 16)}</span>
                <b style="font-size:13.5px;color:var(--plum)">${esc(item.title)}</b>
              </div>
              <button class="care-kit-fav-btn ${item.isFav ? "active" : ""}" data-a="toggleCareKitFav" data-v="${item.id}" aria-label="Toggle favorite">
                ${svgi("star", 15)}
              </button>
            </div>
            <p class="mut" style="margin:0;font-size:12px;line-height:1.4">${esc(item.desc)}</p>
            ${item.isCustom ? `
              <div style="display:flex;justify-content:flex-end;margin-top:4px">
                <button class="chip" style="min-height:24px;padding:2px 6px;font-size:11px;color:var(--muted)" data-a="deleteCustomCareItem" data-v="${item.id}">
                  ${svgi("trash", 11)} Remove
                </button>
              </div>` : ""
            }
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 4. Full-Cycle Care Guide -->
    <div class="card">
      <div class="row" style="margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("layers", 18)}
          <h3 style="margin:0">Full-Cycle Care Guide</h3>
        </div>
      </div>
      <p class="mut" style="font-size:12.5px;margin:0 0 14px">Compassionate guidance for every stage of your cycle—not just when bleeding.</p>

      ${Object.values(FULL_CYCLE_CARE_GUIDES).map(g => `
        <div class="cycle-guide-card" style="margin-bottom:12px;border-left:4px solid var(--border)">
          <div class="row" style="margin-bottom:4px">
            <span class="article-tag ${g.badgeColor}">${g.phaseName}</span>
            <span class="mut" style="font-size:12px;font-weight:700">${g.theme}</span>
          </div>
          <b style="display:block;margin:6px 0 2px;color:var(--plum);font-size:14px">Focus: ${g.focus}</b>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.45">${g.biology}</p>
          <ul style="margin:0 0 10px;padding-left:18px;font-size:12.5px;line-height:1.5;color:var(--muted)">
            ${g.suggestions.map(s => `<li>${s}</li>`).join("")}
          </ul>
          <div style="background:var(--surface-alt);padding:8px 12px;border-radius:var(--radius-sm);font-size:12px;margin-bottom:8px">
            💡 <b>Self-Care Tip:</b> ${g.selfCareTip}
          </div>
          <button class="chip" data-a="openJournalWithPrompt" data-v="${esc(g.journalPrompt)}">
            ${svgi("feather", 12)} Reflection Prompt: “${g.journalPrompt}”
          </button>
        </div>
      `).join("")}
    </div>`;
}

/* Sub-View: My Journal (Pillar 3) */
function renderJournalTab(T, phaseKey, S, x) {
  const d = ui.journalDate || I(T);
  const curEntry = (S.journal && S.journal[d]) || {};
  const phaseForD = getPhaseForDate(d, S, x);
  const guideForD = FULL_CYCLE_CARE_GUIDES[phaseForD] || FULL_CYCLE_CARE_GUIDES.uncertain;
  const phasePrompt = guideForD.journalPrompt;

  const activeMood = ui.journalDraftMood || curEntry.mood || "";
  const activeTags = ui.journalDraftTags && ui.journalDraftTags.length ? ui.journalDraftTags : (curEntry.tags || []);

  const feelings = [
    ["grounded", "🌿 Grounded"],
    ["tired", "☁️ Low Energy"],
    ["sensitive", "🌸 Sensitive"],
    ["energized", "☀️ Energized"],
    ["peaceful", "🕊️ Peaceful"],
    ["stressed", "🌧️ Stressed"]
  ];

  const availableTags = [
    "Cramps", "Headache", "Fatigue", "Bloating", "Brain Fog",
    "Cravings", "Sensitive Skin", "Backache", "Tender Breasts",
    "Quiet Rest", "Warm Tea", "Fresh Air", "Gentle Walk"
  ];

  // Journal history entries with filtering
  const allEntries = Object.values(S.journal || {}).sort((a, b) => (b.date > a.date ? 1 : -1));
  const filteredEntries = allEntries.filter(e => {
    if (ui.journalMoodFilter && e.mood !== ui.journalMoodFilter) return false;
    if (ui.journalTagFilter && !(e.tags || []).includes(ui.journalTagFilter)) return false;
    if (ui.journalSearch && ui.journalSearch.trim()) {
      const q = ui.journalSearch.toLowerCase().trim();
      const matchText = (e.text || "").toLowerCase().includes(q);
      const matchGrat = (e.gratitude || "").toLowerCase().includes(q);
      const matchHelped = (e.helped || "").toLowerCase().includes(q);
      const matchTag = (e.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchText && !matchGrat && !matchHelped && !matchTag) return false;
    }
    return true;
  });

  return `
    <!-- Privacy Safeguard Banner -->
    <div class="card tint-mint" style="padding:12px 16px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px">
        ${svgi("lock", 16)}
        <b style="font-size:13px;color:var(--plum)">100% On-Device &amp; Private Journal</b>
      </div>
      <p class="mut" style="margin:2px 0 0;font-size:12px">Your reflections are stored strictly in your browser's private local storage. Never uploaded to the cloud or AI.</p>
    </div>

    <!-- Date Navigation Toolbar -->
    <div class="card" style="padding:12px 16px;margin-bottom:14px">
      <div class="row">
        <button class="chip" data-a="stepJournalDate" data-v="-1">${svgi("arrowLeft", 12)} Previous</button>
        <div style="text-align:center">
          <b style="color:var(--plum);font-size:14.5px">${fmt(N(d), { weekday: "short", month: "short", day: "numeric" })}</b>
          <span class="mut" style="font-size:11.5px;display:block">${d === I(T) ? "Today" : ""}</span>
        </div>
        <div style="display:flex;gap:6px">
          ${d !== I(T) ? `<button class="chip" data-a="jumpJournalToday" style="font-size:11px">Today</button>` : ""}
          <button class="chip" data-a="stepJournalDate" data-v="1">Next ${svgi("arrowRight", 12)}</button>
        </div>
      </div>
    </div>

    <!-- Distraction-Free Journal Editor -->
    <div class="journal-editor-card">
      <div class="row" style="margin-bottom:6px">
        <h3 style="margin:0">Daily Reflection</h3>
        ${ui.journalNotice ? `<span class="journal-saved-badge">${svgi("check", 14)} ${ui.journalNotice}</span>` : ""}
      </div>

      <!-- Compassionate Phase Prompt Pill -->
      <div class="journal-prompt-box">
        <div>
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted)">${guideForD.phaseName} Prompt</span>
          <p class="journal-prompt-text">“${phasePrompt}”</p>
        </div>
        <button class="journal-insert-btn" data-a="insertJournalPrompt" data-v="${esc(phasePrompt)}">
          ${svgi("edit", 12)} Insert Prompt
        </button>
      </div>

      <!-- Feeling Selector -->
      <label class="journal-field-title">Feeling / Mood State</label>
      <div class="checkin-row">
        ${feelings.map(([k, label]) => `
          <button class="checkin-btn ${activeMood === k ? "active" : ""}" data-a="setJournalMood" data-v="${k}">
            ${label}
          </button>
        `).join("")}
      </div>

      <!-- Ratings: Energy, Comfort, Stress -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin:12px 0">
        <div>
          <label style="font-size:12px;font-weight:700;margin-bottom:4px">Energy Level (1–5)</label>
          <select id="journalEnergy" style="width:100%;height:38px;padding:0 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface)">
            ${[1, 2, 3, 4, 5].map(v => `<option value="${v}" ${(curEntry.energy || 3) == v ? "selected" : ""}>${v} — ${v === 1 ? "Very Low" : v === 2 ? "Gentle" : v === 3 ? "Balanced" : v === 4 ? "Energized" : "Peak"}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;margin-bottom:4px">Physical Comfort (1–5)</label>
          <select id="journalComfort" style="width:100%;height:38px;padding:0 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface)">
            ${[1, 2, 3, 4, 5].map(v => `<option value="${v}" ${(curEntry.comfort || 3) == v ? "selected" : ""}>${v} — ${v === 1 ? "Discomfort" : v === 2 ? "Tender" : v === 3 ? "Comfortable" : v === 4 ? "Cozy" : "Optimal"}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;margin-bottom:4px">Stress Level</label>
          <select id="journalStress" style="width:100%;height:38px;padding:0 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface)">
            ${[["low", "Calm & Low"], ["mild", "Mild"], ["moderate", "Moderate"], ["high", "High"]].map(([k, label]) => `
              <option value="${k}" ${(curEntry.stress || "mild") === k ? "selected" : ""}>${label}</option>
            `).join("")}
          </select>
        </div>
      </div>

      <!-- Reflection Textarea -->
      <label class="journal-field-title">Free-Text Reflections</label>
      <textarea id="journalText" class="journal-textarea" placeholder="How are you feeling today? Feelings, thoughts, or physical observations you'd like to remember...">${esc(curEntry.text || "")}</textarea>

      <!-- Optional Gratitude / Self-Kindness -->
      <label class="journal-field-title">Daily Gratitude or Self-Kindness (Optional)</label>
      <input id="journalGratitude" placeholder="One thing I appreciate or a kind word to myself today..." value="${esc(curEntry.gratitude || "")}" style="width:100%;margin-bottom:12px">

      <!-- Optional What Helped Today -->
      <label class="journal-field-title">What Helped Me Feel Better Today? (Optional)</label>
      <input id="journalHelped" placeholder="e.g. Peppermint tea, loose waistband, 20-min horizontal pause..." value="${esc(curEntry.helped || "")}" style="width:100%;margin-bottom:12px">

      <!-- Common Tags -->
      <label class="journal-field-title">Symptom &amp; Care Tags</label>
      <div class="journal-tag-grid">
        ${availableTags.map(t => `
          <button class="journal-tag-chip ${activeTags.includes(t) ? "active" : ""}" data-a="toggleJournalTag" data-v="${t}">
            ${t}
          </button>
        `).join("")}
      </div>

      <!-- Action Buttons -->
      <div class="chips" style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn" style="flex:2" data-a="saveJournalEntry">${svgi("check", 16)} Save Reflection</button>
        ${curEntry.text || curEntry.mood ? `
          <button class="btn g" style="flex:1;color:var(--tint-rose-text);border-color:var(--tint-rose-border)" data-a="promptDeleteJournal" data-v="${d}">
            ${svgi("trash", 16)} Delete
          </button>` : ""
        }
        <button class="btn g" style="flex:1" data-a="exportJournal">
          ${svgi("download", 16)} Export
        </button>
      </div>
    </div>

    <!-- Journal History List & Search -->
    <div class="card">
      <div class="row" style="margin-bottom:10px">
        <h3 style="margin:0">Journal History</h3>
        <span class="mut" style="font-size:12px">${allEntries.length} reflection${allEntries.length === 1 ? "" : "s"}</span>
      </div>

      <!-- Search & Filter Controls -->
      <input id="journalSearchInput" placeholder="Search entries by word or tag..." value="${esc(ui.journalSearch)}" data-k="ui.journalSearch" data-r="1" style="width:100%;margin-bottom:10px">

      <!-- Mood Filters -->
      <div class="chips" style="gap:6px;margin-bottom:12px;overflow-x:auto">
        <button class="chip ${!ui.journalMoodFilter ? "active" : ""}" data-a="filterJournalMood" data-v="">All</button>
        ${feelings.map(([k, label]) => `
          <button class="chip ${ui.journalMoodFilter === k ? "active" : ""}" data-a="filterJournalMood" data-v="${k}">
            ${label}
          </button>
        `).join("")}
      </div>

      ${filteredEntries.length ? filteredEntries.map(e => `
        <div class="journal-entry-card">
          <div class="row" style="margin-bottom:4px">
            <b style="color:var(--plum);font-size:14px">${fmt(N(e.date), { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</b>
            ${e.mood ? `<span class="article-tag tint-rose">${e.mood}</span>` : ""}
          </div>
          ${e.energy || e.comfort ? `
            <div class="mut" style="font-size:11.5px;margin-bottom:6px">
              Energy: ${e.energy || 3}/5 · Comfort: ${e.comfort || 3}/5 · Stress: ${e.stress || "mild"}
            </div>` : ""
          }
          <p style="margin:4px 0 8px;font-size:13.5px;line-height:1.5">${esc(e.text || "No text written.")}</p>
          ${e.gratitude ? `
            <div style="background:var(--pastel-ivory);border-left:3px solid var(--pastel-berry);padding:6px 10px;border-radius:4px;font-size:12.5px;margin-bottom:6px;font-style:italic">
              ❤️ Gratitude: ${esc(e.gratitude)}
            </div>` : ""
          }
          ${e.helped ? `
            <div style="font-size:12px;color:var(--phase-follicular);margin-bottom:6px;font-weight:600">
              💡 What helped: ${esc(e.helped)}
            </div>` : ""
          }
          ${(e.tags && e.tags.length) ? `
            <div class="chips" style="gap:4px;margin-bottom:8px">
              ${e.tags.map(t => `<span class="chip" style="min-height:22px;padding:2px 8px;font-size:11px">${esc(t)}</span>`).join("")}
            </div>` : ""
          }
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
            <button class="chip" data-a="editJournalEntry" data-v="${e.date}">${svgi("edit", 12)} Edit</button>
            <button class="chip" style="color:var(--muted)" data-a="promptDeleteJournal" data-v="${e.date}">${svgi("trash", 12)} Delete</button>
          </div>
        </div>
      `).join("") : `
        <div style="text-align:center;padding:28px 20px;background:var(--surface-alt);border-radius:var(--radius-md)">
          <div style="margin-bottom:10px">${bunny(48)}</div>
          <b style="color:var(--plum);display:block;margin-bottom:4px">No reflections found</b>
          <p class="mut" style="max-width:280px;margin:0 auto 12px;font-size:13px">Your private journal is a safe, quiet space to record whatever you feel today.</p>
          <button class="btn" data-a="jumpJournalToday">Write today's reflection</button>
        </div>`
      }
    </div>`;
}

/* Sub-View: Cycle Guide, Education & Library */
function renderCycleGuideTab(T, phaseKey, S, x) {
  const careAlerts = checkCareAlerts(S);
  const searchResults = searchArticles(ui.articleSearch);
  const reminders = S.careReminders || { period: 1, checkin: 1, prep: 1, journal: 0 };

  return `
    <!-- 1. "Your Cycle, Explained" Short Educational Cards -->
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("book", 18)}
          <h3 style="margin:0">“Your Cycle, Explained”</h3>
        </div>
      </div>
      <p class="mut" style="font-size:12.5px;margin:0 0 14px">Readable, evidence-based cards explaining your biology, bodily changes, and health safety.</p>

      ${CYCLE_EXPLAINED_CARDS.map(card => `
        <div class="cycle-guide-card">
          <span class="article-tag ${card.badgeColor}">${card.category}</span>
          <h3>${card.title}</h3>
          <p class="mut" style="font-weight:600;font-size:12.5px;margin-bottom:6px">${card.summary}</p>
          <p>${card.content}</p>
          <div class="cycle-guide-source">
            ${svgi("book", 12)} ${card.source}
          </div>
        </div>
      `).join("")}
    </div>

    <!-- 2. Gentle In-App Reminders Settings -->
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("bell", 18)}
          <h3 style="margin:0">Gentle In-App Reminders</h3>
        </div>
      </div>
      <p class="mut" style="font-size:12.5px;margin:0 0 12px">Soft prompts to help you plan without pressure. Handled locally on your device.</p>

      <div class="switch-row">
        <div class="switch-info">
          <div class="switch-title">Approaching Period Notice</div>
          <p class="switch-desc">Gentle heads-up 2 days before your next estimated period start date.</p>
        </div>
        <label class="switch">
          <input type="checkbox" data-a="toggleCareReminder" data-v="period" ${reminders.period !== 0 ? "checked" : ""} role="switch" aria-label="Toggle period reminder">
          <span class="switch-slider"></span>
        </label>
      </div>

      <div class="switch-row">
        <div class="switch-info">
          <div class="switch-title">Daily Gentle Check-In</div>
          <p class="switch-desc">Evening invitation to pause, rate your mood, and check in with your body.</p>
        </div>
        <label class="switch">
          <input type="checkbox" data-a="toggleCareReminder" data-v="checkin" ${reminders.checkin !== 0 ? "checked" : ""} role="switch" aria-label="Toggle check-in reminder">
          <span class="switch-slider"></span>
        </label>
      </div>

      <div class="switch-row">
        <div class="switch-info">
          <div class="switch-title">Period Preparation Checklist</div>
          <p class="switch-desc">Checklist reminder during the late luteal phase to prepare comfort items.</p>
        </div>
        <label class="switch">
          <input type="checkbox" data-a="toggleCareReminder" data-v="prep" ${reminders.prep !== 0 ? "checked" : ""} role="switch" aria-label="Toggle prep checklist">
          <span class="switch-slider"></span>
        </label>
      </div>

      <div class="switch-row">
        <div class="switch-info">
          <div class="switch-title">Private Journal Reminder</div>
          <p class="switch-desc">Friendly nudge to capture today's thoughts and gratitude in My Journal.</p>
        </div>
        <label class="switch">
          <input type="checkbox" data-a="toggleCareReminder" data-v="journal" ${reminders.journal ? "checked" : ""} role="switch" aria-label="Toggle journal reminder">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <!-- 3. Clinical Red Flags Alert -->
    ${careAlerts.length && S.careAlerts !== 0 ? `
      <div class="card tint-amber" style="margin-bottom:16px">
        <div class="row">
          <div style="display:flex;align-items:center;gap:8px">
            ${svgi("alert", 20)}
            <b>Clinical Red Flags to Discuss</b>
          </div>
        </div>
        <div style="margin-top:8px;font-size:13.5px;line-height:1.5">
          ${careAlerts.map(a => `<div style="margin-bottom:6px">• ${a}</div>`).join("")}
        </div>
        <button class="btn" style="margin-top:10px;background:var(--plum)" data-a="openClinician">Open Clinician Report</button>
      </div>` : ""
    }

    <!-- 4. Local Health Assistant -->
    <div class="card tint-lavender assistant-box" style="margin-bottom:16px">
      <div class="row">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("sparkle", 20)}
          <b>Local Health Assistant</b>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">100% On-Device</span>
      </div>
      <p class="mut" style="margin:2px 0 8px;font-size:13px">Ask questions about your cycle, symptoms, or health patterns. All data stays strictly on your device.</p>

      <div class="assistant-prompt-list">
        ${ASSISTANT_TOPICS.map(t =>
          `<button class="assistant-prompt-chip" data-a="askAssistant" data-v="${t.id}">${t.question}</button>`
        ).join("")}
      </div>

      <div class="row">
        <input id="assistantQueryInput" placeholder="Type a symptom or question..." value="${esc(ui.assistantQuery)}">
        <button class="chip" style="flex:none;min-height:48px" data-a="submitAssistant">Ask</button>
      </div>

      ${ui.assistantResult ? `
        <div class="assistant-response-card">
          <h4 style="margin:0;color:var(--plum)">${esc(ui.assistantResult.title)}</h4>
          ${ui.assistantResult.context ? `<p style="margin:0;font-size:13px;font-weight:600;color:var(--plum)">${esc(ui.assistantResult.context)}</p>` : ""}
          <p style="margin:0;font-size:14px;line-height:1.55">${esc(ui.assistantResult.body)}</p>
          <div class="assistant-source-badge">Source: ${esc(ui.assistantResult.source)}</div>
          <div class="tint-amber" style="padding:10px;border-radius:var(--radius-sm);font-size:12.5px;margin-top:4px">
            <b>Clinician Guidance:</b> ${esc(ui.assistantResult.clinicianAdvice)}
          </div>
          <button class="btn g" style="min-height:36px;font-size:13px;margin-top:6px" data-a="openClinician">View Clinician Report</button>
        </div>` : ""
      }
    </div>

    <!-- 5. Educational Content Library -->
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:8px">
        <h3>Evidence-Based Library</h3>
        <span class="mut" style="font-size:12px">${ARTICLES.length} articles</span>
      </div>
      <input class="library-search" id="libSearch" placeholder="Search articles by keyword or symptom..." value="${esc(ui.articleSearch)}" data-a="searchLib">

      <div style="margin-top:12px">
        ${searchResults.slice(0, 6).map(a => `
          <div class="article-card" data-a="readArticle" data-v="${a.id}">
            <h3>${esc(a.title)}</h3>
            <p class="mut" style="margin:0">${esc(a.summary)}</p>
            <div class="article-meta">
              <span class="article-tag tint-sage">${esc(a.category)}</span>
              <span>${esc(a.readTime)}</span>
              <span style="margin-left:auto">${svgi("arrowRight", 14)}</span>
            </div>
          </div>`
        ).join("")}
      </div>
    </div>

    <!-- 6. Architecture & Capabilities Infographic -->
    <div class="card tint-sky" style="padding:16px;margin-bottom:16px">
      <div class="row" style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px">
          ${svgi("insights", 22)}
          <div>
            <b style="color:var(--plum);font-size:15px">Architecture &amp; Features</b>
            <p class="mut" style="margin:2px 0 0;font-size:12px">Visual guide to on-device algorithms &amp; privacy</p>
          </div>
        </div>
        <button class="chip" data-a="openTour">Full Infographic</button>
      </div>
      <div style="border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border);cursor:pointer;margin-top:10px;background:var(--surface)" data-a="openTour" role="button" aria-label="Expand Architecture Infographic">
        <img src="./public/cyclesidechick-infographic.svg" alt="CycleSideChick Architecture and Core Capabilities" style="width:100%;height:auto;display:block;">
      </div>
    </div>

    <!-- 7. Partner Share Feature -->
    <div class="card tint-mint">
      <div class="row">
        <div>
          <b>Partner Share</b>
          <p class="mut" style="margin:2px 0 0">Opt-in, read-only partner snapshot generated locally without server accounts.</p>
        </div>
        <button class="chip" data-a="openPartner">Share</button>
      </div>
    </div>`;
}

function renderCareCustomModal() {
  return `
    <div class="scrim" data-a="closeCustomCareModal"></div>
    <section class="sheet" role="dialog" aria-label="Add Comfort Strategy">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <h3 style="margin:0">Add Personal Comfort Strategy</h3>
        <button class="icon" data-a="closeCustomCareModal" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <p class="mut" style="font-size:13px;margin:0 0 14px">Save an item, ritual, or comfort practice that brings you personal relief.</p>

      <label for="customCareTitle">Title</label>
      <input id="customCareTitle" placeholder="e.g. Weighted blanket & cozy wool socks" style="width:100%;margin-bottom:12px">

      <label for="customCareDesc">Description (optional)</label>
      <input id="customCareDesc" placeholder="e.g. Dim the bedroom lights and rest horizontally" style="width:100%;margin-bottom:12px">

      <label>Icon</label>
      <div class="chips" style="gap:8px;margin-bottom:18px">
        ${[
          ["heart", "Heart"],
          ["cup", "Drink / Tea"],
          ["flame", "Warmth"],
          ["moon", "Rest"],
          ["sparkle", "Music / Art"],
          ["sun", "Fresh Air"],
          ["user", "Connection"]
        ].map(([icName, label]) => `
          <button class="chip ${ui.customCareIcon === icName ? "active" : ""}" data-a="selectCustomCareIcon" data-v="${icName}">
            ${svgi(icName, 14)} ${label}
          </button>
        `).join("")}
      </div>

      <div class="chips" style="display:grid;gap:8px">
        <button class="btn" data-a="saveCustomCareItem">Save to Care Kit</button>
        <button class="btn g" data-a="closeCustomCareModal">Cancel</button>
      </div>
    </section>`;
}

function renderDeleteJournalModal() {
  const d = ui.deleteJournalConfirm;
  return `
    <div class="scrim" data-a="cancelDeleteJournal"></div>
    <section class="sheet" role="dialog" aria-label="Confirm Delete Reflection">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <h3 style="margin:0">Delete Reflection?</h3>
        <button class="icon" data-a="cancelDeleteJournal" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <p class="mut" style="line-height:1.5">Are you sure you want to delete your private journal reflection for <b>${fmt(N(d), { dateStyle: "long" })}</b>? This cannot be undone.</p>
      <div class="chips" style="display:grid;gap:8px;margin-top:16px">
        <button class="btn" style="background:var(--pink)" data-a="deleteJournalEntry" data-v="${d}">Delete Reflection</button>
        <button class="btn g" data-a="cancelDeleteJournal">Keep Reflection</button>
      </div>
    </section>`;
}

/* 7. Clinician Summary Modal */
function clinicianModal() {
  const summary = generateClinicianSummary(S);
  return `
    <div class="scrim" data-a="closeClinician"></div>
    <section class="sheet" role="dialog" aria-label="Clinician Summary">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <h2>Clinician Summary</h2>
        <button class="icon" data-a="closeClinician" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <p class="mut">A plain-text overview of your cycle lengths, symptoms, and pain ratings designed for sharing with your healthcare provider.</p>
      <textarea id="clinicianText" readonly rows="12" style="font-family:monospace;font-size:12px;margin:12px 0;width:100%">${esc(summary)}</textarea>
      <div class="chips" style="display:grid;gap:8px">
        <button class="btn" data-a="copyClinician">${svgi("copy", 18)} Copy to clipboard</button>
        <button class="btn g" data-a="closeClinician">Done</button>
      </div>
    </section>`;
}

/* 8. Period 10-Day Conflict Resolution Modal */
function conflictModal() {
  const { dn, existing } = ui.conflict;
  const daysDiff = Math.abs(dn - N(existing.s));
  return `
    <div class="scrim" data-a="conflictClose"></div>
    <section class="sheet" role="dialog" aria-label="Resolve Period Timing">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:10px">
        <h2>Period Timing Conflict</h2>
        <button class="icon" data-a="conflictClose" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <div class="card tint-amber" style="margin-bottom:14px">
        <b>Recorded Period on ${fmt(N(existing.s))}</b>
        <p class="mut" style="margin-top:4px">
          A period start is already recorded on ${fmt(N(existing.s))} (${daysDiff} day${daysDiff > 1 ? "s" : ""} ${dn < N(existing.s) ? "earlier" : "apart"}).
          In menstrual physiology, a new follicular cycle cannot begin within 10 days of another. Bleeding within this window is typically spotting or part of the same flow.
        </p>
      </div>
      <div class="chips" style="display:grid;gap:10px">
        <button class="btn" data-a="conflictSpotting">Log as Spotting on ${fmt(dn)}</button>
        <button class="btn g" data-a="conflictExtend">Extend existing period to ${fmt(dn)}</button>
        <button class="btn g" data-a="conflictClose">Cancel</button>
      </div>
    </section>`;
}

/* 9. Article Reader Modal */
function renderArticleModal() {
  const a = ARTICLES.find(x => x.id === ui.activeArticle);
  if (!a) return "";
  return `
    <div class="scrim" data-a="closeArticle"></div>
    <section class="sheet" role="dialog" aria-label="${esc(a.title)}">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <span class="article-tag tint-sage">${esc(a.category)}</span>
        <button class="icon" data-a="closeArticle" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <h2>${esc(a.title)}</h2>
      <div class="mut" style="margin:4px 0 16px">Clinical Reading · ${esc(a.readTime)}</div>
      <div style="font-size:14.5px;line-height:1.65;white-space:pre-line">
        ${esc(a.body)}
      </div>
      <div class="tint-lavender" style="padding:12px;border-radius:var(--radius-sm);margin:18px 0;font-size:13px">
        <b>Evidence Source:</b> ${esc(a.source)}
      </div>
      <button class="btn" data-a="closeArticle">Done reading</button>
    </section>`;
}

/* 10. Partner Share Modal */
function renderPartnerModal() {
  const x = calculateStats(S);
  const T = TD();
  const day = x.last ? T - x.last + 1 : 0;
  return `
    <div class="scrim" data-a="closePartner"></div>
    <section class="sheet" role="dialog" aria-label="Partner Share">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:10px">
        <h2>Partner Share (Local &amp; Private)</h2>
        <button class="icon" data-a="closePartner" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <p class="mut">Generate a read-only partner snapshot. It contains no intimate notes and requires zero account registration.</p>

      <div class="partner-preview-card card tint-rose" style="padding:16px;margin:14px 0">
        <span class="phase-pill tint-peach">Cycle Phase Snapshot</span>
        <h3 style="margin:8px 0 4px">Cycle Day ${day}</h3>
        <p class="mut" style="margin-bottom:10px">Next estimated period in about <b>${x.nextPred ? Math.max(0, x.nextPred - T) : S.cl} days</b>.</p>
        <div class="tint-mint" style="padding:12px;border-radius:var(--radius-sm);font-size:13px">
          <b>How to support me today:</b> Extra patience, steady warmth, gentle movement, and restorative evenings are deeply appreciated.
        </div>
      </div>

      <div class="chips" style="display:grid;gap:8px">
        <button class="btn" data-a="copyPartnerLink">${svgi("copy", 18)} Copy Read-Only Partner Summary</button>
        <button class="btn g" data-a="closePartner">Done</button>
      </div>
    </section>`;
}

/* 10b. Architecture & Features Infographic Modal */
function renderTourModal() {
  ui.tourTab = ui.tourTab || "interactive";
  const x = calculateStats(S);
  const T = TD();
  const day = x.last ? Math.max(1, T - x.last + 1) : 1;

  return `
    <div class="scrim" data-a="closeTour"></div>
    <section class="sheet" role="dialog" aria-label="Cycle Architecture and Hormone Science Guide" style="max-height:92vh;max-height:92dvh;overflow-y:auto">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:10px">
        <div>
          <span class="article-tag tint-sky">Body Literacy &amp; Architecture</span>
          <h2 style="margin:4px 0 0">Cycle Science &amp; Overview</h2>
        </div>
        <button class="icon" data-a="closeTour" aria-label="Close">${svgi("x", 18)}</button>
      </div>

      <div class="chips" style="display:flex;gap:8px;margin-bottom:14px">
        <button class="chip" style="flex:1;justify-content:center;${ui.tourTab === "interactive" ? "background:var(--pink);border-color:var(--pink);color:#FFFFFF;" : ""}" data-a="setTourTab" data-v="interactive">
          ${svgi("sparkle", 14)} 4-Phase Science
        </button>
        <button class="chip" style="flex:1;justify-content:center;${ui.tourTab === "infographic" ? "background:var(--pink);border-color:var(--pink);color:#FFFFFF;" : ""}" data-a="setTourTab" data-v="infographic">
          ${svgi("insights", 14)} System Infographic
        </button>
      </div>

      ${ui.tourTab === "interactive" ? `
        <p class="mut" style="margin-bottom:12px;font-size:13px">
          Explore the hormonal shifts, physiological changes, and clinical guidance across each phase of your cycle.
        </p>
        ${renderInteractivePhaseTour(x, day, S)}
      ` : `
        <p class="mut" style="margin-bottom:12px;font-size:13px">
          A visual infographic detailing our on-device algorithmic calculations, clinical safety boundaries, and privacy architecture.
        </p>
        <div style="border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border);background:var(--surface);margin-bottom:16px">
          <img src="./public/cyclesidechick-infographic.svg" alt="CycleSideChick Architecture and Core Capabilities Infographic" style="width:100%;height:auto;display:block;">
        </div>
      `}

      <button class="btn" style="margin-top:14px" data-a="closeTour">Done Exploring</button>
    </section>`;
}

/* 11. Clinical Terminology & Educational Info Sheet Modal */
function renderInfoModal() {
  const t = ui.infoTopic;
  if (!t) return "";

  const topics = {
    confidence: {
      title: "How Prediction Confidence Works",
      tag: "Statistical Modeling",
      body: `CycleSideChick calculates predictions using a recency-weighted mean over your last 6 completed cycles (15–90 days).
      
      • Higher Confidence: 6+ completed cycles with a narrow standard deviation (SD ≤ 3 days).
      • Moderate Confidence: 3 to 5 completed cycles or normal variability.
      • Low Confidence: Fewer than 3 recorded cycles or standard deviation > 5 days.
      
      When cycle outliers exist (e.g., a cycle differing from your median by 10+ days), the engine automatically switches to the statistical median to prevent a single unusual cycle from distorting future predictions.`
    },
    luteal: {
      title: "Understanding the Luteal Phase",
      tag: "Hormonal Rhythm",
      body: `The luteal phase begins right after ovulation and lasts until the first day of your next period.
      
      During this phase, the corpus luteum produces progesterone to support the uterine lining. While clinical textbooks often cite 14 days, normal luteal lengths range from 10 to 16 days. You can customize this in Profile settings to personalize your estimated ovulation timing.`
    },
    fertile: {
      title: "Estimated Fertile Window",
      tag: "Fertility Awareness",
      body: `Biologically, sperm can survive in fertile cervical mucus for up to 5 days, while an unfertilized ovum remains viable for approximately 12–24 hours.
      
      The estimated fertile window covers the 5 days prior to ovulation through 1 day post-ovulation. In CycleSideChick, this is always labeled 'Estimated' because calendar-only calculations have natural biological variation and should never be used as a contraceptive method.`
    },
    menstrual: {
      title: "The Menstrual Phase",
      tag: "Cycle Phase",
      body: `The menstrual phase marks the beginning of each cycle (Day 1). Estrogen and progesterone are at baseline levels. Rest, warmth, hydration, and iron replenishment are especially restorative now.`
    },
    follicular: {
      title: "The Follicular Phase",
      tag: "Cycle Phase",
      body: `Follicle-stimulating hormone (FSH) prompts ovarian follicles to mature, leading to steadily rising estrogen. Physical energy, mental clarity, and focus naturally build during this phase.`
    }
  };

  const item = topics[t] || topics.confidence;
  return `
    <div class="scrim" data-a="closeInfo"></div>
    <section class="sheet" role="dialog" aria-label="${esc(item.title)}">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <span class="article-tag tint-lavender">${esc(item.tag)}</span>
        <button class="icon" data-a="closeInfo" aria-label="Close">${svgi("x", 18)}</button>
      </div>
      <h2>${esc(item.title)}</h2>
      <p style="font-size:14px;line-height:1.6;white-space:pre-line;margin-top:12px">${esc(item.body)}</p>
      <button class="btn" style="margin-top:16px" data-a="closeInfo">Got it</button>
    </section>`;
}

/* 12. PIN Lock Screen Overlay */
function renderPinLock() {
  const dots = [0, 1, 2, 3].map(i => `<div class="pin-bubble ${i < ui.pinEntered.length ? "filled" : ""}"></div>`).join("");
  return `
    <div class="pin-overlay" role="dialog" aria-label="App Lock">
      <div style="margin-bottom:12px">${bunny(64)}</div>
      <h2 style="margin:0">CycleSideChick</h2>
      <p class="mut" style="margin:4px 0 0">Enter your 4-digit PIN</p>
      <div class="pin-bubbles">${dots}</div>
      <div class="pin-keypad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="pin-key" data-a="pinKey" data-v="${n}">${n}</button>`).join("")}
        <button class="pin-key" data-a="pinDel" style="font-size:16px">${svgi("x", 20)}</button>
        <button class="pin-key" data-a="pinKey" data-v="0">0</button>
        <button class="pin-key" data-a="pinClear" style="font-size:13px;font-weight:700">Clear</button>
      </div>
    </div>`;
}

/* 13. Profile & Settings View */
function renderProfile() {
  const ledger = getPrivacyLedger();
  const pinActive = PinLock.isEnabled();

  const motionActive = S.motion !== 0;
  const hapticsActive = S.haptics !== 0;
  const showFertileActive = S.showFertile !== 0;
  const careAlertsActive = S.careAlerts !== 0;
  const waterGoalActive = S.waterGoal !== 0;

  return `
    <div class="scrim" data-a="close"></div>
    <section class="sheet sheet-settings" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <div class="sheet-header-row">
          <div class="sheet-title-group">
            <span class="sheet-badge">${svgi("sparkle", 12)} Preferences &amp; Calibration</span>
            <h2 id="settingsTitle" class="sheet-title">Profile &amp; Settings</h2>
          </div>
          <button class="sheet-close-btn" data-a="close" aria-label="Close settings">
            ${svgi("x", 18)}
          </button>
        </div>
      </div>

      <div class="sheet-body custom-scroll">
        <!-- Group 1: Cycle Calibration -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("layers", 16)} 1. Reproductive Calibration</span>
            <span class="settings-group-pill pill-calibration">Calibration</span>
          </div>

          <label style="margin-top:0">Tracking Mode</label>
          <div class="chips" style="gap:8px">
            ${[
              ["natural", "Natural cycle"],
              ["irregular", "Irregular cycle"],
              ["contra", "Hormonal contraception"],
              ["ttc", "Trying to conceive"],
              ["pregnancy", "Pregnancy"],
              ["perimenopause", "Perimenopause"],
              ["none", "No predictions"]
            ].map(([v, t]) => {
              const active = S.mode === v;
              return `<button class="chip-mode${active ? " active" : ""}" aria-pressed="${active}" data-a="setMode" data-v="${v}">
                <span class="chip-check">${svgi("check", 12)}</span>
                <span>${t}</span>
              </button>`;
            }).join("")}
          </div>

          <div class="stepper-wrap" style="margin-top:14px">
            <div>
              <b>Usual Cycle Length</b>
              <p class="mut" style="margin:0;font-size:12px">ACOG normal: 21–35 days</p>
            </div>
            <div class="stepper">
              <button class="stepper-btn" data-a="step" data-k="S.cl" data-v="-1" aria-label="Decrease cycle length">−</button>
              <input class="stepper-val" type="number" min="15" max="90" value="${S.cl}" data-k="S.cl" aria-label="Cycle length in days">
              <button class="stepper-btn" data-a="step" data-k="S.cl" data-v="1" aria-label="Increase cycle length">+</button>
            </div>
          </div>

          <div class="stepper-wrap">
            <div>
              <b>Period Bleeding Duration</b>
              <p class="mut" style="margin:0;font-size:12px">Typical: 3–7 days</p>
            </div>
            <div class="stepper">
              <button class="stepper-btn" data-a="step" data-k="S.pl" data-v="-1" aria-label="Decrease period duration">−</button>
              <input class="stepper-val" type="number" min="1" max="14" value="${S.pl}" data-k="S.pl" aria-label="Period duration in days">
              <button class="stepper-btn" data-a="step" data-k="S.pl" data-v="1" aria-label="Increase period duration">+</button>
            </div>
          </div>

          <div class="stepper-wrap">
            <div>
              <b>Luteal Phase Length</b>
              <p class="mut" style="margin:0;font-size:12px">Post-ovulation span (10–16d, baseline 14d)</p>
            </div>
            <div class="stepper">
              <button class="stepper-btn" data-a="step" data-k="S.ll" data-v="-1" aria-label="Decrease luteal length">−</button>
              <input class="stepper-val" type="number" min="10" max="16" value="${Math.max(10, Math.min(16, S.ll || 14))}" data-k="S.ll" aria-label="Luteal phase length in days">
              <button class="stepper-btn" data-a="step" data-k="S.ll" data-v="1" aria-label="Increase luteal length">+</button>
            </div>
          </div>
        </div>

        <!-- Group 2: Tactile Motion & Interactive Toggles -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("sparkle", 16)} 2. Motion &amp; Interaction Toggles</span>
            <span class="settings-group-pill pill-toggles">Tactile</span>
          </div>

          <!-- Toggle: Fluid Spring Motion -->
          <div class="switch-row">
            <div class="switch-info">
              <div class="switch-title">Fluid Motion &amp; Animations</div>
              <p class="switch-desc">Enable smooth view transitions, staggered card reveals, and dynamic SVG chart growth.</p>
            </div>
            <label class="switch">
              <input type="checkbox" data-a="togglePref" data-k="motion" ${motionActive ? "checked" : ""} role="switch" aria-checked="${motionActive ? "true" : "false"}" aria-label="Toggle fluid animations">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Toggle: Tactile Haptic Pulses -->
          <div class="switch-row">
            <div class="switch-info">
              <div class="switch-title">Tactile Haptic Feedback</div>
              <p class="switch-desc">Physical vibration pulses when logging periods, rating moods, and navigating tabs.</p>
            </div>
            <label class="switch">
              <input type="checkbox" data-a="togglePref" data-k="haptics" ${hapticsActive ? "checked" : ""} role="switch" aria-checked="${hapticsActive ? "true" : "false"}" aria-label="Toggle haptic feedback">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Toggle: Fertility & Ovulation Windows -->
          <div class="switch-row">
            <div class="switch-info">
              <div class="switch-title">Fertility &amp; Ovulation Indicators</div>
              <p class="switch-desc">Display estimated fertile window and ovulation peak markers on calendar and cycle ring.</p>
            </div>
            <label class="switch">
              <input type="checkbox" data-a="togglePref" data-k="showFertile" ${showFertileActive ? "checked" : ""} role="switch" aria-checked="${showFertileActive ? "true" : "false"}" aria-label="Toggle fertility indicators">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Toggle: Physiological Red Flags -->
          <div class="switch-row">
            <div class="switch-info">
              <div class="switch-title">Clinical Red Flag Alerts</div>
              <p class="switch-desc">Prompt consultation guidance if period is absent 90+ days or severe pain (8+/10) is logged.</p>
            </div>
            <label class="switch">
              <input type="checkbox" data-a="togglePref" data-k="careAlerts" ${careAlertsActive ? "checked" : ""} role="switch" aria-checked="${careAlertsActive ? "true" : "false"}" aria-label="Toggle clinical alerts">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Toggle: Hydration Target -->
          <div class="switch-row">
            <div class="switch-info">
              <div class="switch-title">Daily Hydration Cups Goal</div>
              <p class="switch-desc">Show 8-cup hydration tracker in the daily wellness logging interface.</p>
            </div>
            <label class="switch">
              <input type="checkbox" data-a="togglePref" data-k="waterGoal" ${waterGoalActive ? "checked" : ""} role="switch" aria-checked="${waterGoalActive ? "true" : "false"}" aria-label="Toggle hydration target">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Group 3: Appearance & Theme -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("sun", 16)} 3. Theme &amp; Visual Mode</span>
            <span class="settings-group-pill pill-theme">Theme</span>
          </div>
          <div class="segmented-picker">
            ${[["system", "System", "laptop"], ["light", "Light", "sun"], ["dark", "Dark", "moon"]].map(([v, t, icon]) => `
              <button class="segmented-btn ${S.theme === v ? "active" : ""}" data-a="th" data-v="${v}">
                ${svgi(icon, 14)} ${t}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Group 4: Security & PIN -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("shieldCheck", 16)} 4. Application Security Lock</span>
            <span class="settings-group-pill pill-security">Security</span>
          </div>
          <div class="row">
            <div>
              <b>4-Digit App PIN Lock</b>
              <p class="mut" style="margin:2px 0 0;font-size:12px">
                ${pinActive ? "Active · Protected with Salted SHA-256 Web Crypto hash" : "Inactive · Instant access on open"}
              </p>
            </div>
            <button class="chip" data-a="togglePin">${pinActive ? "Disable PIN" : "Set PIN"}</button>
          </div>
        </div>

        <!-- Group 5: On-Device Storage & Privacy Ledger -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("activity", 16)} 5. Privacy Ledger (100% On-Device)</span>
            <span class="settings-group-pill pill-ledger">Privacy</span>
          </div>
          <p class="mut" style="font-size:12.5px;margin:0 0 10px">Zero cloud servers. Below is an audit of all active keys and byte allocations in your browser's private storage.</p>
          <div class="ledger-wrap">
            <table class="ledger-table">
              <thead>
                <tr><th>Storage Key</th><th>Size</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                ${ledger.map(item => `
                  <tr>
                    <td><code>${esc(item.key)}</code></td>
                    <td>${item.sizeKB} KB</td>
                    <td>${esc(item.description)}</td>
                  </tr>`
                ).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Group 6: Data Sovereignty & Backup -->
        <div class="settings-group">
          <div class="settings-group-title">
            <span>${svgi("download", 16)} 6. Data Sovereignty &amp; Exports</span>
            <span class="settings-group-pill pill-sovereignty">Export</span>
          </div>
          <div class="chips" style="display:grid;gap:8px">
            <button class="btn g" data-a="exportCSV">${svgi("download", 18)} Download CSV Spreadsheet</button>
            <button class="btn g" data-a="exportJSON">${svgi("download", 18)} Download JSON Backup File</button>
            <button class="btn g" data-a="openClinician">${svgi("copy", 18)} Clinician Consultation Report</button>
          </div>

          <div style="margin-top:14px;border-top:1px solid var(--border-subtle);padding-top:12px">
            <button class="btn g" style="color:var(--tint-rose-text);border-color:var(--tint-rose-border)" data-a="wipe">
              ${ui.cf == "wipe" ? "⚠️ Tap again to confirm wiping all records" : "Wipe all local data"}
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

/* Master Render Loop */
function render() {
  const ctx = beforeRender();
  const a = document.querySelector("#app");
  if (!a) return;

  if (ui.pinLocked) {
    a.innerHTML = renderPinLock();
    afterRender(ctx);
    return;
  }

  if (!S.ob) {
    a.innerHTML = onb();
    afterRender(ctx);
    return;
  }

  const views = {
    home: renderHome,
    calendar: renderCalendar,
    log: renderLog,
    insights: renderInsights,
    care: renderCare
  };

  const mainHTML = (views[ui.tab] || renderHome)();

  const NAVS = [
    ["home", "Home", "home"],
    ["calendar", "Calendar", "calendar"],
    ["log", "Log", "log"],
    ["insights", "Insights", "insights"],
    ["care", "Care", "care"]
  ];

  a.innerHTML = `
    <header class="top">
      <span class="brand">
        ${bunny(32, 0)}
        <b class="wm2">CycleSideChick</b>
      </span>
      <button class="icon" data-a="prof" aria-label="Profile and settings">${svgi("user", 20)}</button>
    </header>

    <main class="view-enter" key="${ui.tab}">
      ${mainHTML}
    </main>

    <nav class="nav" aria-label="Main Navigation">
      ${NAVS.map(([k, t, icon]) => {
        const isCenter = k === "log";
        const isActive = ui.tab === k;
        return `
          <button class="nav-btn ${isCenter ? "nav-btn-center" : ""}" data-a="tab" data-v="${k}" aria-current="${isActive ? "page" : "false"}">
            ${isCenter ? `<div class="nav-center-icon">${svgi(icon, 20)}</div>` : svgi(icon, 20)}
            <span>${t}</span>
          </button>`;
      }).join("")}
    </nav>

    ${ui.prof ? renderProfile() : ""}
    ${ui.activeArticle ? renderArticleModal() : ""}
    ${ui.partnerModal ? renderPartnerModal() : ""}
    ${ui.clinicianModal ? clinicianModal() : ""}
    ${ui.conflict ? conflictModal() : ""}
    ${ui.infoTopic ? renderInfoModal() : ""}
    ${ui.tourModal ? renderTourModal() : ""}
    ${ui.careCustomModal ? renderCareCustomModal() : ""}
    ${ui.deleteJournalConfirm ? renderDeleteJournalModal() : ""}`;

  afterRender(ctx);
}

/* Event Delegation & Actions */
const A = {
  setCareTab: v => {
    ui.careTab = v;
    haptic(10);
  },
  careCheckin: v => {
    const today = I(TD());
    if (!S.careCheckin) S.careCheckin = {};
    S.careCheckin[today] = { feeling: v, time: Date.now() };
    saveState(S);
    haptic(15);
    toast(`Checked in: ${v.charAt(0).toUpperCase() + v.slice(1)}`);
  },
  nextReassurance: () => {
    ui.careReassuranceIdx = (ui.careReassuranceIdx + 1) % 16;
    haptic(10);
  },
  saveCareSuggestion: id => {
    if (!S.careSaved) S.careSaved = {};
    S.careSaved[id] = 1;
    saveState(S);
    haptic(15);
    toast("Idea saved to your helpful collection");
  },
  dismissCareSuggestion: id => {
    if (!S.careDismissed) S.careDismissed = {};
    S.careDismissed[id] = 1;
    saveState(S);
    haptic(10);
    toast("Idea dismissed");
  },
  addCareKitSuggestion: kitId => {
    if (!S.careKit) S.careKit = [...DEFAULT_CARE_KIT];
    const existing = S.careKit.find(k => k.id === kitId);
    if (existing) {
      existing.isFav = 1;
      toast("Favorited in your Personal Care Kit");
    } else {
      const match = DEFAULT_CARE_KIT.find(k => k.id === kitId);
      if (match) S.careKit.push({ ...match, isFav: 1 });
      toast("Added to your Personal Care Kit");
    }
    saveState(S);
    haptic(15);
  },
  setCareKitFilter: v => {
    ui.careKitFilter = v;
    haptic(10);
  },
  toggleCareKitFav: id => {
    if (!S.careKit) S.careKit = [...DEFAULT_CARE_KIT];
    const item = S.careKit.find(k => k.id === id);
    if (item) {
      item.isFav = item.isFav ? 0 : 1;
      saveState(S);
      haptic(12);
      toast(item.isFav ? "Favorited" : "Removed from favorites");
    }
  },
  openCustomCareModal: () => {
    ui.careCustomModal = true;
    ui.customCareTitle = "";
    ui.customCareDesc = "";
    ui.customCareIcon = "heart";
    haptic(10);
  },
  closeCustomCareModal: () => {
    ui.careCustomModal = false;
    haptic(10);
  },
  selectCustomCareIcon: v => {
    ui.customCareIcon = v;
    haptic(10);
  },
  saveCustomCareItem: () => {
    const titleEl = document.getElementById("customCareTitle");
    const descEl = document.getElementById("customCareDesc");
    const title = titleEl ? titleEl.value.trim() : ui.customCareTitle.trim();
    const desc = descEl ? descEl.value.trim() : ui.customCareDesc.trim();
    if (!title) {
      toast("Please enter a title");
      return;
    }
    if (!S.careKit) S.careKit = [...DEFAULT_CARE_KIT];
    const newItem = {
      id: "custom-" + Date.now(),
      title,
      desc,
      icon: ui.customCareIcon || "heart",
      isFav: 1,
      isCustom: 1
    };
    S.careKit.unshift(newItem);
    saveState(S);
    ui.careCustomModal = false;
    haptic(20);
    toast("Added to Personal Care Kit");
  },
  deleteCustomCareItem: id => {
    if (!S.careKit) return;
    S.careKit = S.careKit.filter(k => k.id !== id);
    saveState(S);
    haptic(10);
    toast("Strategy removed");
  },
  openJournal: d => {
    ui.tab = "care";
    ui.careTab = "journal";
    if (d) ui.journalDate = d;
    haptic(10);
  },
  openJournalWithPrompt: prompt => {
    ui.tab = "care";
    ui.careTab = "journal";
    ui.journalPromptToInsert = prompt;
    haptic(10);
  },
  setJournalDate: d => {
    ui.journalDate = d;
    ui.journalNotice = "";
    haptic(10);
  },
  stepJournalDate: delta => {
    const curN = N(ui.journalDate || I(TD()));
    ui.journalDate = I(curN + (+delta || 0));
    ui.journalNotice = "";
    haptic(10);
  },
  jumpJournalToday: () => {
    ui.journalDate = I(TD());
    ui.journalNotice = "";
    haptic(10);
  },
  setJournalMood: m => {
    ui.journalDraftMood = m;
    haptic(10);
  },
  toggleJournalTag: tag => {
    if (!ui.journalDraftTags) ui.journalDraftTags = [];
    const idx = ui.journalDraftTags.indexOf(tag);
    if (idx >= 0) ui.journalDraftTags.splice(idx, 1);
    else ui.journalDraftTags.push(tag);
    haptic(10);
  },
  insertJournalPrompt: prompt => {
    const textEl = document.getElementById("journalText");
    if (textEl) {
      if (textEl.value.trim()) {
        textEl.value += "\n\n" + prompt + "\n";
      } else {
        textEl.value = prompt + "\n";
      }
      textEl.focus();
      haptic(10);
      toast("Prompt added to reflection");
    }
  },
  saveJournalEntry: () => {
    const d = ui.journalDate || I(TD());
    const textEl = document.getElementById("journalText");
    const gratEl = document.getElementById("journalGratitude");
    const helpedEl = document.getElementById("journalHelped");
    const energyEl = document.getElementById("journalEnergy");
    const comfortEl = document.getElementById("journalComfort");
    const stressEl = document.getElementById("journalStress");

    const text = textEl ? textEl.value.trim() : "";
    const gratitude = gratEl ? gratEl.value.trim() : "";
    const helped = helpedEl ? helpedEl.value.trim() : "";
    const energy = energyEl ? +energyEl.value : 3;
    const comfort = comfortEl ? +comfortEl.value : 3;
    const stress = stressEl ? stressEl.value : "mild";

    if (!text && !gratitude && !helped && !ui.journalDraftMood) {
      toast("Please write a reflection or pick a feeling");
      return;
    }

    if (!S.journal) S.journal = {};
    const existing = S.journal[d] || {};
    S.journal[d] = {
      ...existing,
      id: existing.id || ("j-" + d),
      date: d,
      text,
      gratitude,
      helped,
      mood: ui.journalDraftMood || existing.mood || "",
      energy,
      comfort,
      stress,
      tags: ui.journalDraftTags && ui.journalDraftTags.length ? [...ui.journalDraftTags] : (existing.tags || []),
      updatedAt: Date.now(),
      createdAt: existing.createdAt || Date.now()
    };
    saveState(S);
    haptic(20);
    ui.journalNotice = `Saved · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    toast("Reflection saved on your device");
  },
  editJournalEntry: d => {
    ui.journalDate = d;
    const e = (S.journal && S.journal[d]) || {};
    ui.journalDraftMood = e.mood || "";
    ui.journalDraftTags = e.tags ? [...e.tags] : [];
    window.scrollTo({ top: 0, behavior: "smooth" });
    haptic(10);
  },
  promptDeleteJournal: d => {
    ui.deleteJournalConfirm = d;
    haptic(10);
  },
  cancelDeleteJournal: () => {
    ui.deleteJournalConfirm = null;
    haptic(10);
  },
  deleteJournalEntry: d => {
    if (S.journal && S.journal[d]) {
      delete S.journal[d];
      saveState(S);
      toast("Reflection deleted");
    }
    ui.deleteJournalConfirm = null;
    ui.journalNotice = "";
    ui.journalDraftTags = [];
    ui.journalDraftMood = "";
    haptic(15);
  },
  filterJournalMood: m => {
    ui.journalMoodFilter = (ui.journalMoodFilter === m ? "" : m);
    haptic(10);
  },
  filterJournalTag: t => {
    ui.journalTagFilter = (ui.journalTagFilter === t ? "" : t);
    haptic(10);
  },
  exportJournal: () => {
    const entries = Object.values(S.journal || {}).sort((a, b) => (b.date > a.date ? 1 : -1));
    if (entries.length === 0) {
      toast("No journal entries to export yet");
      return;
    }
    let md = `# CycleSideChick — Private Journal Reflections\n`;
    md += `Exported: ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}\n\n`;
    entries.forEach(e => {
      md += `## ${fmt(N(e.date), { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n`;
      if (e.mood) md += `- **Feeling / Mood:** ${e.mood}\n`;
      if (e.energy) md += `- **Energy:** ${e.energy}/5 | **Physical Comfort:** ${e.comfort}/5 | **Stress:** ${e.stress}\n`;
      if (e.tags && e.tags.length) md += `- **Tags:** ${e.tags.join(", ")}\n`;
      if (e.text) md += `\n### Reflection\n${e.text}\n`;
      if (e.gratitude) md += `\n### Daily Gratitude / Self-Kindness\n${e.gratitude}\n`;
      if (e.helped) md += `\n### What Helped\n${e.helped}\n`;
      md += `\n---\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CycleSideChick-Journal-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    haptic([20, 40]);
    toast("Journal exported as Markdown");
  },
  toggleCareReminder: key => {
    if (!S.careReminders) S.careReminders = { period: 1, checkin: 1, prep: 1, journal: 0, routine: 0 };
    S.careReminders[key] = S.careReminders[key] ? 0 : 1;
    saveState(S);
    haptic(12);
    toast("Reminder preference updated");
  },
  tab: v => {
    if (ui.tab === v) return;
    scrollPositions[ui.tab] = window.scrollY;
    ui.tab = v;
    ui.cf = "";
    haptic(10);
  },
  selDay: v => {
    ui.sel = +v;
    haptic(10);
  },
  prof: () => {
    ui.prof = 1;
    haptic(10);
  },
  close: () => {
    ui.prof = 0;
    ui.cf = "";
    haptic(10);
  },
  openInfo: topic => {
    ui.infoTopic = topic;
    haptic(10);
  },
  closeInfo: () => {
    ui.infoTopic = null;
    haptic(10);
  },
  step: (v, el) => {
    const delta = +el.dataset.v || 0;
    const key = el.dataset.k;
    if (key === "S.cl") {
      S.cl = Math.max(15, Math.min(90, (S.cl || 28) + delta));
    } else if (key === "S.pl") {
      S.pl = Math.max(1, Math.min(14, (S.pl || 5) + delta));
    } else if (key === "S.ll") {
      S.ll = Math.max(10, Math.min(16, (S.ll || 14) + delta));
    }
    saveState(S);
    haptic(12);
    render();
  },
  openTour: () => {
    ui.tourModal = true;
    haptic(15);
  },
  setTourTab: v => {
    ui.tourTab = v;
    haptic(10);
  },
  closeTour: () => {
    ui.tourModal = false;
    haptic(10);
  },
  openClinician: () => {
    ui.clinicianModal = true;
    haptic(15);
  },
  closeClinician: () => {
    ui.clinicianModal = false;
    haptic(10);
  },
  copyClinician: async () => {
    const text = generateClinicianSummary(S);
    try {
      await navigator.clipboard.writeText(text);
      haptic([20, 40]);
      toast("Clinician summary copied");
    } catch (e) {
      toast("Summary ready to copy");
    }
  },
  conflictClose: () => {
    ui.conflict = null;
    haptic(10);
  },
  conflictSpotting: () => {
    if (ui.conflict) {
      const dn = ui.conflict.dn;
      const key = I(dn);
      S.logs[key] = { ...(S.logs[key] || {}), f: "spotting" };
      saveState(S);
      ui.conflict = null;
      haptic(20);
      toast("Logged as spotting on " + fmt(dn));
    }
  },
  conflictExtend: () => {
    if (ui.conflict) {
      const { dn, existing } = ui.conflict;
      existing.e = I(Math.max(dn, existing.e ? N(existing.e) : dn));
      saveState(S);
      ui.conflict = null;
      haptic([20, 40]);
      toast("Extended period to " + fmt(dn));
    }
  },
  openPartner: () => {
    ui.partnerModal = true;
    haptic(15);
  },
  closePartner: () => {
    ui.partnerModal = false;
    haptic(10);
  },
  copyPartnerLink: async () => {
    const x = calculateStats(S);
    const day = x.last ? TD() - x.last + 1 : 0;
    const text = `CycleSideChick Partner Snapshot: Current Cycle Day ${day}. Estimated next period in ~${x.nextPred ? Math.max(0, x.nextPred - TD()) : S.cl} days. Extra warmth and gentle rest appreciated today.`;
    try {
      await navigator.clipboard.writeText(text);
      haptic([20, 40]);
      toast("Partner snapshot copied");
    } catch (e) {}
  },
  readArticle: id => {
    ui.activeArticle = id;
    haptic(15);
  },
  closeArticle: () => {
    ui.activeArticle = null;
    haptic(10);
  },
  searchLib: (v, el) => {
    ui.articleSearch = el.value;
  },
  askAssistant: id => {
    const topic = ASSISTANT_TOPICS.find(t => t.id === id);
    if (topic) {
      ui.assistantResult = topic.answer(S, calculateStats(S));
      haptic(15);
    }
  },
  submitAssistant: () => {
    const input = document.querySelector("#assistantQueryInput");
    const q = input ? input.value : "";
    if (q) {
      ui.assistantResult = answerQuestion(q, S, calculateStats(S));
      haptic(15);
    }
  },
  setMode: v => {
    S.mode = v;
    saveState(S);
    haptic(15);
  },
  startToday: () => {
    const T = TD();
    ensurePeriod(T);
    saveState(S);
    haptic([20, 50, 20]);
    toast("Period start recorded");
  },
  qm: v => {
    const k = I(TD());
    S.logs[k] = { ...(S.logs[k] || {}), m: +v };
    saveState(S);
    haptic(20);
    toast("Mood saved: " + MOODS[v].name);
  },
  day: v => {
    ui.sel = +v;
    ui.cf = "";
    haptic(10);
  },
  mo: v => {
    let { y, m } = ui.cm;
    m += +v;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    ui.cm = { y, m };
    haptic(10);
  },
  jumpToday: () => {
    const now = new Date();
    ui.cm = { y: now.getFullYear(), m: now.getMonth() };
    ui.sel = TD();
    haptic(15);
  },
  pstart: () => {
    ensurePeriod(ui.sel);
    saveState(S);
    haptic([20, 40]);
    toast("Period start recorded");
  },
  pend: () => {
    const r = vp(S).find(p => N(p.s) <= ui.sel && ui.sel <= pEnd(p, S));
    if (r) {
      r.e = I(ui.sel);
      saveState(S);
      haptic([20, 40]);
      toast("Period end recorded");
    }
  },
  prem: () => {
    if (ui.cf != "rm") {
      ui.cf = "rm";
      haptic(15);
      return;
    }
    const r = vp(S).find(p => N(p.s) <= ui.sel && ui.sel <= pEnd(p, S));
    S.periods = S.periods.filter(p => p !== r);
    ui.cf = "";
    saveState(S);
    haptic([20, 40]);
    toast("Period removed");
  },
  goLog: v => {
    loadDraft(v);
    scrollPositions[ui.tab] = window.scrollY;
    ui.tab = "log";
    haptic(10);
  },
  quickDate: v => {
    loadDraft(v);
    haptic(10);
  },
  ldate: (v, b) => {
    loadDraft(b.value || I(TD()));
    haptic(10);
  },
  flow: v => {
    G.dr.f = G.dr.f == v ? "" : v;
    haptic(15);
  },
  dm: v => {
    G.dr.m = G.dr.m === +v ? null : +v;
    haptic(15);
  },
  energy: v => {
    G.dr.en = G.dr.en === v ? "" : v;
    haptic(15);
  },
  setWater: v => {
    G.dr.water = G.dr.water === +v ? 0 : +v;
    haptic(15);
  },
  cm: v => {
    G.dr.cm = G.dr.cm === v ? "" : v;
    haptic(15);
  },
  med: v => {
    const arr = G.dr.med;
    const i = arr.indexOf(v);
    i < 0 ? arr.push(v) : arr.splice(i, 1);
    haptic(15);
  },
  lh: v => {
    G.dr.lh = G.dr.lh === v ? "" : v;
    haptic(15);
  },
  sym: v => {
    const s = G.dr.sy;
    const n = ((s[v] || 0) + 1) % 4;
    n ? (s[v] = n) : delete s[v];
    haptic(15);
  },
  addc: () => {
    const e = document.querySelector("#cs");
    const v = e.value.trim().slice(0, 30);
    if (v && !["Cramps", "Headache", "Bloating", "Fatigue", "Breast tenderness", "Backache", ...S.custom].includes(v)) {
      S.custom.push(v);
      G.dr.sy[v] = 1;
      e.value = "";
      saveState(S);
      haptic([15, 30]);
      toast("Added: " + v);
    }
  },
  save: () => {
    const d = G.dr;
    const o = {
      m: d.m,
      p: d.p,
      en: d.en,
      sl: d.sl,
      sq: d.sq,
      water: d.water,
      cm: d.cm,
      med: d.med.length ? [...d.med] : undefined,
      bbt: d.bbt ? d.bbt.trim() : undefined,
      lh: d.lh || undefined,
      sy: { ...d.sy },
      note: d.note.trim(),
      f: d.f
    };
    S.logs[d.d] = o;
    if (o.f && o.f !== "none" && o.f !== "spotting") {
      ensurePeriod(N(d.d));
    }
    saveState(S);
    haptic([20, 60, 20]);
    toast("Entry saved for " + fmt(N(d.d)));
    ui.tab = "home";
  },
  th: v => {
    S.theme = v;
    saveState(S);
    applyTheme();
    haptic(15);
  },
  togglePin: async () => {
    if (PinLock.isEnabled()) {
      PinLock.remove();
      toast("App PIN lock removed");
    } else {
      const pin = prompt("Enter a 4-digit PIN for app lock:");
      if (pin && /^\d{4}$/.test(pin)) {
        await PinLock.set(pin);
        toast("4-Digit PIN lock enabled");
      } else if (pin) {
        alert("PIN must be exactly 4 numeric digits.");
      }
    }
    haptic(20);
  },
  pinKey: async v => {
    if (ui.pinEntered.length < 4) {
      ui.pinEntered += String(v);
      haptic(15);
      if (ui.pinEntered.length === 4) {
        const ok = await PinLock.verify(ui.pinEntered);
        if (ok) {
          ui.pinLocked = false;
          ui.pinEntered = "";
          haptic([20, 50]);
          toast("Unlocked");
        } else {
          haptic([40, 80, 40]);
          toast("Incorrect PIN");
          setTimeout(() => { ui.pinEntered = ""; render(); }, 300);
        }
      }
    }
  },
  pinDel: () => {
    ui.pinEntered = ui.pinEntered.slice(0, -1);
    haptic(10);
  },
  pinClear: () => {
    ui.pinEntered = "";
    haptic(10);
  },
  exportCSV: () => {
    const csv = generateCSV(S);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CycleSideChick_Export_${I(TD())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("CSV export downloaded");
  },
  exportJSON: () => {
    const json = generateJSON(S);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CycleSideChick_Backup_${I(TD())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("JSON backup downloaded");
  },
  wipe: () => {
    if (ui.cf != "wipe") {
      ui.cf = "wipe";
      haptic(20);
      return;
    }
    CycleStorage.wipe();
    Object.keys(S).forEach(k => delete S[k]);
    Object.assign(S, defState());
    applyTheme();
    ui.prof = 0;
    ui.cf = "";
    G.ob.step = 0;
    loadDraft(I(TD()));
    haptic([30, 60, 30]);
    toast("All data wiped");
  },
  next: () => {
    const o = G.ob;
    if (o.step == 1 && o.last) {
      ensurePeriod(N(o.last));
      S.cl = +o.cl || 28;
      S.pl = +o.pl || 5;
    }
    o.step++;
    haptic(15);
  },
  skip: () => {
    S.ob = 1;
    saveState(S);
    haptic(15);
    render();
  },
  setObMode: v => {
    G.ob.mode = v;
    haptic(15);
  },
  finishOb: () => {
    S.mode = G.ob.mode || "natural";
    S.ob = 1;
    saveState(S);
    haptic([20, 50, 20]);
    toast("Welcome to CycleSideChick");
    render();
  }
};

/* Event Listeners */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a]");
  if (!b || b.tagName == "INPUT") return;
  const f = A[b.dataset.a];
  if (f) {
    f(b.dataset.v, b);
    if (!S.ob || (b.dataset.a !== "exportCSV" && b.dataset.a !== "exportJSON")) render();
  }
});

document.addEventListener("input", e => {
  const el = e.target;
  const k = el.dataset.k;
  if (!k) return;
  let v = el.value;
  if (el.type === "number" || el.type === "range") v = +v;
  if (k === "S.cl") v = Math.max(15, Math.min(90, v || 28));
  if (k === "S.pl") v = Math.max(1, Math.min(14, v || 5));
  if (k === "S.ll") v = Math.max(10, Math.min(16, v || 14));
  const p = k.split(".");
  let o = G;
  while (p.length > 1) o = o[p.shift()];
  o[p[0]] = v;
  if (el.dataset.out) {
    const target = document.getElementById(el.dataset.out);
    if (target) {
      if (k === "dr.p") target.textContent = v + "/10 · " + (v === 0 ? "No pain" : v <= 3 ? "Mild" : v <= 6 ? "Moderate" : v <= 8 ? "Severe" : "Very severe");
      else target.textContent = v + " h";
    }
  }
  if (k.startsWith("S.")) saveState(S);
  if (el.dataset.r) render();
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.a === "ldate") {
    loadDraft(el.value || I(TD()));
    render();
  } else if (el.dataset.a === "togglePref") {
    const key = el.dataset.k;
    if (key && (key in S)) {
      S[key] = el.checked ? 1 : 0;
      saveState(S);
      applyTheme();
      haptic(20);
      render();
    }
  } else if (el.dataset.k && el.dataset.k.startsWith("S.")) {
    const k = el.dataset.k;
    if (k === "S.cl") el.value = S.cl;
    else if (k === "S.pl") el.value = S.pl;
    else if (k === "S.ll") el.value = S.ll;
  }
});

/* Keyboard Accessibility: Dismiss Topmost Open Modal on Escape */
document.addEventListener("keydown", e => {
  if (e.key === "Escape" || e.key === "Esc") {
    if (ui.deleteJournalConfirm) {
      ui.deleteJournalConfirm = null;
      render();
    } else if (ui.careCustomModal) {
      ui.careCustomModal = false;
      render();
    } else if (ui.conflict) {
      ui.conflict = null;
      render();
    } else if (ui.tourModal) {
      ui.tourModal = false;
      render();
    } else if (ui.infoTopic) {
      ui.infoTopic = null;
      render();
    } else if (ui.clinicianModal) {
      ui.clinicianModal = false;
      render();
    } else if (ui.partnerModal) {
      ui.partnerModal = false;
      render();
    } else if (ui.activeArticle) {
      ui.activeArticle = null;
      render();
    } else if (ui.prof) {
      ui.prof = 0;
      ui.cf = "";
      render();
    }
  }
});

function applyTheme() {
  const r = document.documentElement;
  const isDark = S.theme === "dark" || (S.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (S.theme == "light" || S.theme == "dark") r.dataset.theme = S.theme;
  else r.removeAttribute("data-theme");

  if (S.motion === 0) r.dataset.motion = "reduced";
  else r.removeAttribute("data-motion");

  const meta = document.querySelector("#meta-theme");
  if (meta) meta.content = isDark ? "#17151B" : "#FAF5F7";
}

/* Initialization */
applyTheme();
render();
