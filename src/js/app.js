/**
 * CycleSideChick — Main Application Controller & View Orchestrator
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
  pinLocked: false,
  pinEntered: ""
};

/* Setup and State Migration */
const loaded = loadState();
S = loaded.state;
ui.corrupt = loaded.corrupt;
G.S = S;
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
    med: Array.isArray(L.med) ? [...L.med] : (L.med ? [L.med] : []),
    bbt: L.bbt || "",
    lh: L.lh || "",
    sy: { ...(L.sy || {}) },
    water: L.water || 0, // 0 to 8 glasses
    note: L.note || ""
  };
};
loadDraft(I(TD()));

function haptic(pattern = 15) {
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

/* Scroll & Caret Preservation */
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

function afterRender(ctx) {
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
   Views
   ========================================================================== */

function renderHome() {
  const x = calculateStats(S);
  const T = TD();
  const L = (S.logs && S.logs[I(T)]) || {};
  const careAlerts = checkCareAlerts(S);

  // 1. Pregnancy Mode Hero
  if (S.mode === "pregnancy") {
    const preg = calculatePregnancy(S);
    return `
      <div class="pregnancy-hero">
        <span class="phase-pill tint-butter">✦ Pregnancy Tracking Mode</span>
        <h2 style="margin:8px 0 4px">${preg ? `Week ${preg.weeks}, Day ${preg.days}` : "Gestational Tracking"}</h2>
        <p class="mut" style="font-weight:600;color:var(--plum);margin-bottom:12px">${preg ? preg.trimester : "Estimated Milestones"}</p>
        <p class="mut" style="max-width:360px;margin:0 auto">Estimated Due Date: <b>${preg ? preg.eddFormatted : "LMP needed"}</b>. Cycle and fertile window predictions are calmly paused.</p>
        <div class="chips" style="justify-content:center;margin-top:14px">
          <button class="btn" style="max-width:240px" data-a="goLog" data-v="${I(T)}">Log daily pregnancy signs</button>
        </div>
      </div>
      ${renderMoodCard(L)}`;
  }

  // 2. Perimenopause Mode Hero
  if (S.mode === "perimenopause") {
    return `
      <div class="perimenopause-hero">
        <span class="phase-pill tint-sage">✦ Perimenopause Mode</span>
        <h2 style="margin:8px 0 4px">Hormonal Transition Rhythm</h2>
        <p class="mut" style="max-width:360px;margin:0 auto">Cycle lengths naturally fluctuate as ovarian activity shifts. Rigid ovulation estimates are turned off to reflect biological variability.</p>
        <div class="chips" style="justify-content:center;margin-top:14px">
          <button class="btn" style="max-width:240px" data-a="goLog" data-v="${I(T)}">Log symptoms &amp; hot flashes</button>
        </div>
      </div>
      ${renderMoodCard(L)}`;
  }

  // 3. Clinical Alerts Prompt
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

  // 4. Week Strip
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

  // Missing data empty state (no defaults)
  if (x.last == null) {
    return `
      ${renderGreeting(T)}
      ${clinicalPrompt}
      <div class="card" style="text-align:center;padding:26px 20px">
        <span class="phase-pill tint-sage">Setup Your History</span>
        <h2 style="margin:10px 0 6px">Begin your cycle record</h2>
        <p class="mut" style="max-width:340px;margin:0 auto 18px">Log the first day of your last period or set your known average cycle in Profile to enable personalized estimates.</p>
        <button class="btn" data-a="startToday">My period started today</button>
        <button class="btn g" style="margin-top:10px" data-a="tab" data-v="calendar">Pick past date on calendar</button>
      </div>
      ${renderMoodCard(L)}`;
  }

  const day = T - x.last + 1;
  const nx = x.pred[0];
  const until = nx - T;
  const late = -until;

  let est = "";
  let note = "";
  if (S.mode === "none") {
    est = `Cycle day <b>${day}</b> recorded`;
    note = "Predictions are disabled in your settings.";
  } else if (S.mode === "contra") {
    est = `Day <b>${day}</b> of current cycle record`;
    note = "Hormonal contraception active; predictions and fertile window are hidden.";
  } else if (until >= 0) {
    est = `Next estimated period in about <b>${until} day${until == 1 ? "" : "s"}</b>`;
    note = `Estimated between ${fmt(nx - x.pm)} and ${fmt(nx + x.pm)} (±${x.pm}d · ${x.confLevel} confidence). ${x.confReason}`;
  } else {
    est = `Period is <b>${late} day${late == 1 ? "" : "s"}</b> past estimate`;
    note = `A late period has many common causes including stress, travel, illness, sleep disruption, or natural cycle variations.`;
  }

  let phasePill = "";
  let phaseDesc = "";
  if (pdset(S).has(T)) {
    phasePill = `<span class="phase-pill tint-rose">🌸 Recorded Period Day</span>`;
    phaseDesc = "A confirmed period day. Listen to your body and rest when you need to.";
  } else if ((S.mode === "natural" || S.mode === "ttc") && x.fertileStart && T >= x.fertileStart && T <= x.fertileEnd) {
    phasePill = `<span class="phase-pill tint-lavender">✨ Estimated Fertile Window</span>`;
    phaseDesc = "Estimated window based on past cycle history. Mathematical approximation only; do not rely on for contraception.";
  } else if (day < x.avg - x.ll) {
    phasePill = `<span class="phase-pill tint-sage">🌱 Follicular Phase</span>`;
    phaseDesc = "Estrogen is gradually rising. Energy and focus often feel lighter.";
  } else {
    phasePill = `<span class="phase-pill tint-peach">🌙 Luteal Phase</span>`;
    phaseDesc = "Progesterone dominant. Prioritize warmth, steady nourishment, and restful boundaries.";
  }

  // Compare to your usual insight
  const comp = compareToUsual(S);
  const compCard = comp.ready ? `
    <div class="card tint-sky" style="padding:16px">
      <div class="row">
        <b>Compare to Your Usual</b>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11.5px">Cycle Day ${comp.curCycleDay}</span>
      </div>
      <p class="mut" style="margin-top:4px">
        Your current cycle is ${comp.cycleDiff === 0 ? "on track with your baseline" : comp.cycleDiff > 0 ? `${comp.cycleDiff} days longer than average` : `${Math.abs(comp.cycleDiff)} days shorter than average`}.
        ${comp.avgCurPain ? `Average recorded pain this cycle: ${comp.avgCurPain}/10.` : ""}
      </p>
    </div>` : "";

  return `
    ${renderGreeting(T)}
    ${clinicalPrompt}

    <div class="week-strip" role="region" aria-label="Current Week">
      ${weekDaysHTML}
    </div>

    <div class="card" style="text-align:center;padding:20px 16px">
      ${phasePill}
      ${ring(x, day, S)}
      <p class="big" style="margin:4px 0 6px">${est}</p>
      <p class="mut" style="max-width:380px;margin:0 auto">${note}</p>
    </div>

    <div class="card tint-mint">
      <p style="margin:0;font-size:14px;font-weight:600">${esc(phaseDesc)}</p>
    </div>

    ${compCard}
    ${renderMoodCard(L)}

    <div class="chips" style="display:flex;gap:10px">
      ${until <= 2
        ? `<button class="btn" style="flex:1" data-a="startToday">Period started today</button>
           <button class="btn g" style="flex:1" data-a="goLog" data-v="${I(T)}">Log symptoms</button>`
        : `<button class="btn" style="flex:1" data-a="goLog" data-v="${I(T)}">Log mood &amp; symptoms</button>`
      }
    </div>`;
}

function renderGreeting(T) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `
    <div style="margin-bottom:12px">
      <p class="mut" style="margin:0;font-weight:600">${fmt(T, { weekday: "long", month: "long", day: "numeric" })}</p>
      <h2>${greeting}</h2>
    </div>`;
}

function renderMoodCard(L) {
  const k = I(TD());
  if (L.m != null) {
    return `
      <div class="card tint-peach">
        <div class="row">
          <div style="display:flex;align-items:center;gap:12px">
            ${face(L.m, 40)}
            <div>
              <p style="margin:0;font-size:12px;text-transform:uppercase;font-weight:700">Today's Mood</p>
              <h3 style="margin:0">${MOODS[L.m].name}</h3>
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

function renderCalendar() {
  const x = calculateStats(S);
  const T = TD();
  const { y, m } = ui.cm;
  const ps = pdset(S);
  const pr = new Set();
  const fe = new Set();

  if (S.mode !== "none" && S.mode !== "contra" && S.mode !== "pregnancy") {
    x.pred.forEach(p => {
      for (let d = p; d < p + (S.pl || 5); d++) if (d >= T) pr.add(d);
      if (S.mode !== "irregular" && x.fertileStart && x.fertileEnd) {
        for (let d = x.fertileStart; d <= x.fertileEnd; d++) fe.add(d);
      }
    });
  }

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
  else if (pr.has(sel)) st = "Estimated period day (prediction only).";
  else if (fe.has(sel)) st = "Estimated fertile window (approximation only).";

  const btns = rec
    ? `${sel > N(rec.s) && !fut ? `<button class="btn g" data-a="pend">Period ended this day</button>` : ""}
       <button class="btn g" data-a="prem">${ui.cf == "rm" ? "Tap again to remove period" : "Remove this period"}</button>`
    : `<button class="btn" data-a="pstart" ${fut ? "disabled" : ""}>Period started this day</button>`;

  const selLog = S.logs && S.logs[I(sel)];
  const logSnippet = selLog ? `
    <div style="margin:10px 0;padding:12px;background:var(--surface-alt);border-radius:var(--radius-sm);font-size:13.5px">
      ${selLog.m != null ? `<b>Mood:</b> ${MOODS[selLog.m].name} · ` : ""}
      ${selLog.f ? `<b>Flow:</b> ${selLog.f} · ` : ""}
      ${selLog.p != null ? `<b>Pain:</b> ${selLog.p}/10 · ` : ""}
      ${selLog.en ? `<b>Energy:</b> ${selLog.en} · ` : ""}
      ${selLog.sl != null ? `<b>Sleep:</b> ${selLog.sl}h · ` : ""}
      ${Object.keys(selLog.sy || {}).length ? `<b>Symptoms:</b> ${Object.keys(selLog.sy).join(", ")}` : ""}
    </div>` : "";

  return `
    <div class="view-enter">
      <div class="card">
        <div class="row">
          <button class="icon" data-a="mo" data-v="-1" aria-label="Previous month">${svgi("arrowLeft", 18)}</button>
          <div style="text-align:center">
            <h2>${fmt(Date.UTC(y, m, 1) / DAY, { month: "long", year: "numeric" })}</h2>
          </div>
          <button class="icon" data-a="mo" data-v="1" aria-label="Next month">${svgi("arrowRight", 18)}</button>
        </div>

        <div class="grid7" style="margin-top:14px">
          ${["M", "T", "W", "T", "F", "S", "S"].map(d => `<b>${d}</b>`).join("")}
          ${cells}
        </div>

        <div class="leg">
          <span><i style="background:var(--pink)"></i> Recorded period</span>
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
          ${fut ? "" : `<button class="btn g" data-a="goLog" data-v="${I(sel)}">Log symptoms &amp; health signs</button>`}
        </div>
      </div>
    </div>`;
}

function renderLog() {
  const d = G.dr;
  const all = ["Cramps", "Headache", "Bloating", "Fatigue", "Breast tenderness", "Backache", ...(S.custom || [])];

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

        <label style="margin-top:16px">Hydration (glasses of water)</label>
        <div class="chips" style="gap:6px">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(n =>
            `<button class="chip ${n <= (d.water || 0) ? "tint-sky" : ""}" style="min-height:36px;padding:4px 10px;font-size:13px" data-a="setWater" data-v="${n}">💧 ${n}</button>`
          ).join("")}
        </div>

        <div class="row" style="margin-top:16px">
          <label for="sl" style="margin:0">Sleep duration</label>
          <span id="slv" style="font-weight:700;color:var(--plum);font-size:14px">${d.sl == null ? "Not logged" : d.sl + " h"}</span>
        </div>
        <input id="sl" type="range" min="3" max="12" step="0.5" value="${d.sl ?? 7}" data-k="dr.sl" data-out="slv">
      </div>

      <div class="card">
        <label>Medication &amp; supplements</label>
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
        <h3>Symptoms</h3>
        <p class="mut">Tap to cycle: Mild → Moderate → Strong → Clear</p>
        <div class="chips">
          ${all.map(s => {
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

        <div class="row" style="margin-top:12px">
          <input id="cs" placeholder="Add custom symptom..." maxlength="30" aria-label="Custom symptom name">
          <button class="chip" data-a="addc" style="flex:none;min-height:48px">+ Add</button>
        </div>
      </div>

      <div class="card">
        <label for="nt" style="margin:0 0 6px">Personal notes</label>
        <textarea id="nt" rows="3" data-k="dr.note" maxlength="500" placeholder="Feelings, cravings, or health observations...">${esc(d.note)}</textarea>
      </div>

      <button class="btn" style="margin-top:8px" data-a="save">Save entry</button>
    </div>`;
}

function renderInsights() {
  const x = calculateStats(S);
  const ls = x.lens.slice(-8);
  const durs = vp(S).filter(p => okD(p.e) && N(p.e) >= N(p.s)).map(p => N(p.e) - N(p.s) + 1);

  return `
    <div class="view-enter">
      <h2 style="margin-bottom:14px">Cycle Insights &amp; Health Patterns</h2>

      <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">
        <div class="tint-rose" style="padding:14px;border-radius:var(--radius-md);text-align:center">
          <span style="font-size:12px;text-transform:uppercase;font-weight:700">Recency Mean</span>
          <div style="font-size:24px;font-weight:800;margin-top:2px">${x.avg} <span style="font-size:14px;font-weight:600">days</span></div>
          <div style="font-size:12px;margin-top:2px">Range: ±${x.pm}d</div>
        </div>
        <div class="tint-sage" style="padding:14px;border-radius:var(--radius-md);text-align:center">
          <span style="font-size:12px;text-transform:uppercase;font-weight:700">Average Period</span>
          <div style="font-size:24px;font-weight:800;margin-top:2px">${durs.length ? (durs.reduce((a, b) => a + b) / durs.length).toFixed(1) : S.pl} <span style="font-size:14px;font-weight:600">days</span></div>
          <div style="font-size:12px;margin-top:2px">${durs.length} periods logged</div>
        </div>
      </div>

      <div class="card tint-lavender">
        <div class="row">
          <b>Prediction Confidence: ${x.confLevel}</b>
          <span class="chip" style="min-height:28px;padding:2px 8px;font-size:12px">${MODE_NAMES[S.mode] || S.mode}</span>
        </div>
        <p class="mut" style="margin-top:4px">${x.confReason} Luteal length configured to ${x.ll} days.</p>
      </div>

      ${ls.length >= 2 ? `
        <div class="card">
          <h3>Recent cycle lengths</h3>
          <p class="mut">Last ${ls.length} recorded cycles. ${x.outlierDetected ? "Outliers detected; median applied for safety." : "Calculated with recency weighting."}</p>
          <svg viewBox="0 0 300 130" role="img" aria-label="Cycle lengths chart" width="100%" style="margin-top:12px">
            <line x1="0" y1="105" x2="300" y2="105" stroke="var(--border)" stroke-width="1"/>
            ${ls.map((l, i) => {
              const mx = Math.max(...ls, 35);
              const barW = 300 / ls.length;
              const bh = Math.max(10, (l / mx) * 85);
              const xPos = i * barW + 8;
              const w = barW - 16;
              return `
                <rect x="${xPos}" y="${105 - bh}" width="${w}" height="${bh}" rx="6" fill="var(--pink)"/>
                <text x="${xPos + w / 2}" y="${98 - bh}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--plum)">${l}</text>
                <text x="${xPos + w / 2}" y="122" text-anchor="middle" font-size="11" fill="var(--muted)">#${i + 1}</text>`;
            }).join("")}
          </svg>
        </div>` : `
        <div class="card tint-mint" style="text-align:center;padding:20px">
          <h3>History Unlocks After 2 Cycles</h3>
          <p class="mut">Currently ${ls.length} of 2 cycles logged. Predictions personalize automatically as your records grow.</p>
        </div>`
      }
    </div>`;
}

function renderCare() {
  const x = calculateStats(S);
  const careAlerts = checkCareAlerts(S);
  const recArticles = getRecommendedArticles((S.logs && S.logs[I(TD())]) ? S.logs[I(TD())].sy : {}, S.mode);
  const searchResults = searchArticles(ui.articleSearch);

  return `
    <div class="view-enter">
      <h2 style="margin-bottom:14px">Care, Insights &amp; Guidance</h2>

      ${careAlerts.length ? `
        <div class="card tint-amber">
          <div class="row">
            <div style="display:flex;align-items:center;gap:8px">
              ${svgi("alert", 20)}
              <b>Clinical Red Flags to Discuss</b>
            </div>
          </div>
          <div style="margin-top:8px;font-size:14px;line-height:1.5">
            ${careAlerts.map(a => `<div style="margin-bottom:6px">• ${a}</div>`).join("")}
          </div>
          <button class="btn" style="margin-top:10px;background:var(--plum)" data-a="openClinician">Open Clinician Report</button>
        </div>` : ""
      }

      <!-- Local Health Assistant -->
      <div class="card tint-lavender assistant-box">
        <div class="row">
          <div style="display:flex;align-items:center;gap:8px">
            ${svgi("sparkle", 20)}
            <b>Local Health Assistant</b>
          </div>
          <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">100% On-Device</span>
        </div>
        <p class="mut" style="margin:2px 0 8px">Ask questions about your cycle, symptoms, or health patterns. All data stays strictly on your device.</p>

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

      <!-- Educational Content Library -->
      <div class="card">
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

      <!-- Partner Share Feature -->
      <div class="card tint-mint">
        <div class="row">
          <div>
            <b>Partner Share</b>
            <p class="mut" style="margin:2px 0 0">Opt-in, read-only partner card generated locally without server accounts.</p>
          </div>
          <button class="chip" data-a="openPartner">Share</button>
        </div>
      </div>
    </div>`;
}

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

      <div class="partner-preview-card">
        <span class="phase-pill tint-peach">Cycle Phase Snapshot</span>
        <h3 style="margin:8px 0 4px">Cycle Day ${day}</h3>
        <p class="mut" style="margin-bottom:10px">Next estimated period in about <b>${x.nextPred ? Math.max(0, x.nextPred - T) : S.cl} days</b>.</p>
        <div class="tint-mint" style="padding:12px;border-radius:var(--radius-sm);font-size:13.5px">
          <b>How to support me today:</b> Extra patience, steady warmth, gentle movement, and restorative evenings are deeply appreciated.
        </div>
      </div>

      <div class="chips" style="display:grid;gap:8px">
        <button class="btn" data-a="copyPartnerLink">${svgi("copy", 18)} Copy Read-Only Partner Summary</button>
        <button class="btn g" data-a="closePartner">Done</button>
      </div>
    </section>`;
}

function renderProfile() {
  const ledger = getPrivacyLedger();
  return `
    <div class="scrim" data-a="close"></div>
    <section class="sheet" role="dialog" aria-label="Profile and Settings">
      <div class="sheet-handle"></div>
      <div class="row" style="margin-bottom:12px">
        <h2>Profile &amp; Settings</h2>
        <button class="icon" data-a="close" aria-label="Close settings">${svgi("x", 18)}</button>
      </div>

      <label>Tracking mode</label>
      <div class="chips">
        ${[
          ["natural", "Natural cycle"],
          ["irregular", "Irregular cycle"],
          ["contra", "Hormonal contraception"],
          ["ttc", "Trying to conceive"],
          ["pregnancy", "Pregnancy"],
          ["perimenopause", "Perimenopause"],
          ["none", "No predictions"]
        ].map(([v, t]) => chip(t, S.mode === v, `data-a="setMode" data-v="${v}"`)).join("")}
      </div>

      <label for="pc" style="margin-top:14px">Usual cycle length (days)</label>
      <input id="pc" type="number" min="15" max="90" value="${S.cl}" data-k="S.cl">

      <label for="pp">Usual period duration (days)</label>
      <input id="pp" type="number" min="1" max="14" value="${S.pl}" data-k="S.pl">

      <label for="pll">Adjustable luteal length (10–16 days)</label>
      <input id="pll" type="number" min="10" max="16" value="${S.ll || 14}" data-k="S.ll">

      <label style="margin-top:18px">Appearance</label>
      <div class="chips">
        ${[["system", "System"], ["light", "Light"], ["dark", "Dark"]]
          .map(([v, t]) => chip(t, S.theme == v, `data-a="th" data-v="${v}"`)).join("")}
      </div>

      <!-- Privacy Ledger -->
      <h3 style="margin-top:22px">Privacy Ledger (On-Device Storage)</h3>
      <p class="mut">Everything is stored strictly in your browser. Below is an audit of all active keys and byte counts.</p>
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

      <!-- Export & Import -->
      <h3 style="margin-top:20px">Data Export &amp; Backup</h3>
      <div class="chips" style="display:grid;gap:8px">
        <button class="btn g" data-a="exportCSV">${svgi("download", 18)} Download CSV Export</button>
        <button class="btn g" data-a="openClinician">${svgi("copy", 18)} Clinician Summary</button>
      </div>

      <div class="chips" style="display:grid;gap:8px;margin-top:12px">
        <button class="btn g" style="color:var(--tint-rose-text);border-color:var(--tint-rose-border)" data-a="wipe">${ui.cf == "wipe" ? "Tap again to confirm deleting all data" : "Delete all records"}</button>
      </div>
    </section>`;
}

/* Master Render Loop */
function render() {
  const ctx = beforeRender();
  const a = document.querySelector("#app");
  if (!a) return;

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
    ${ui.clinicianModal ? clinicianModal() : ""}`;

  afterRender(ctx);
}

/* Event Delegation & Actions */
const A = {
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
      toast("Select and copy summary text");
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
    const text = `CycleSideChick Partner Snapshot: Current Cycle Day ${calculateStats(S).last ? TD() - calculateStats(S).last + 1 : 0}. Support tips: Warmth and gentle rest appreciated today.`;
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
    G.dr.water = +v;
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
  wipe: () => {
    if (ui.cf != "wipe") {
      ui.cf = "wipe";
      haptic(20);
      return;
    }
    Object.keys(S).forEach(k => delete S[k]);
    Object.assign(S, defState());
    applyTheme();
    try { localStorage.removeItem(KEY); } catch (e) {}
    ui.prof = 0;
    ui.cf = "";
    G.ob.step = 0;
    loadDraft(I(TD()));
    haptic([30, 60, 30]);
    toast("All data wiped");
  }
};

/* Event Listeners */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a]");
  if (!b || b.tagName == "INPUT") return;
  const f = A[b.dataset.a];
  if (f) {
    f(b.dataset.v, b);
    if (!S.ob || b.dataset.a !== "exportCSV") render();
  }
});

document.addEventListener("input", e => {
  const el = e.target;
  const k = el.dataset.k;
  if (!k) return;
  let v = el.value;
  if (el.type === "number" || el.type === "range") v = +v;
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
  }
});

function applyTheme() {
  const r = document.documentElement;
  const isDark = S.theme === "dark" || (S.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (S.theme == "light" || S.theme == "dark") r.dataset.theme = S.theme;
  else r.removeAttribute("data-theme");
  const meta = document.querySelector("#meta-theme");
  if (meta) meta.content = isDark ? "#17151B" : "#FAF5F7";
}

/* Initialization */
applyTheme();
render();
