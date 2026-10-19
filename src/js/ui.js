/**
 * CycleSideChick — UI Rendering & View Engine
 * Mobile-first, accessible, Manrope typography, soft semantic tints.
 */

/* Visual helpers */
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ic = {
  home: "M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-4.5a1 1 0 0 1-1-1v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 20v-9.5z",
  calendar: "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm0 5h16M8 3v4M16 3v4",
  log: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v8m-4-4h8",
  insights: "M18 20V10M12 20V4M6 20v-6",
  care: "M19.5 12.572l-7.5 7.428l-7.5-7.428a5 5 0 1 1 7.5-6.566a5 5 0 1 1 7.5 6.572",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c0-4 4-6 8-6s8 2 8 6",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  sparkle: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  arrowLeft: "M15 19l-7-7 7-7",
  arrowRight: "M9 5l7 7-7 7",
  alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  copy: "M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.24a2 2 0 0 0-.59-1.41l-3.24-3.24A2 2 0 0 0 14.76 2H10a2 2 0 0 0-2 2z M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7 6v-2m-4-4V7a4 4 0 0 1 8 0v4",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
};

const svgi = (k, sz = 22) =>
  `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ic[k] || ''}"/></svg>`;

const bunny = (z = 32, lbl = 1) =>
  `<svg viewBox="0 0 100 100" width="${z}" height="${z}" ${lbl ? 'role="img" aria-label="CycleSideChick bunny brand logo"' : 'aria-hidden="true"'} style="flex-shrink:0;">
    <g stroke="var(--plum)" stroke-width="2.5" stroke-linejoin="round">
      <ellipse cx="36" cy="26" rx="9" ry="22" fill="var(--surface-alt)" transform="rotate(-8 36 26)"/>
      <ellipse cx="64" cy="28" rx="9" ry="20" fill="var(--surface-alt)" transform="rotate(14 64 28)"/>
      <ellipse cx="50" cy="68" rx="31" ry="26" fill="var(--surface-alt)"/>
    </g>
    <ellipse cx="36" cy="28" rx="4" ry="14" fill="var(--rose)" transform="rotate(-8 36 28)"/>
    <ellipse cx="64" cy="30" rx="4" ry="12" fill="var(--rose)" transform="rotate(14 64 30)"/>
    <circle cx="40" cy="66" r="3" fill="var(--plum)"/>
    <circle cx="60" cy="66" r="3" fill="var(--plum)"/>
    <path d="M50 86c-9-5-11-10-7-12 2-1 5 0 7 2 2-2 5-3 7-2 4 2 2 7-7 12z" fill="var(--pink)"/>
  </svg>`;

const MOODS = [
  { name: "Radiant", sub: "Energized & glowing" },
  { name: "Calm", sub: "Peaceful & centered" },
  { name: "Okay", sub: "Steady & balanced" },
  { name: "Anxious", sub: "Restless or tense" },
  { name: "Low", sub: "Tired or tender" }
];

const face = (k, sz = 34) => {
  const faces = [
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/><path d="M7 10c.8-.9 1.7-.9 2.5 0M14.5 10c.8-.9 1.7-.9 2.5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7.5 14q4.5 4.5 9 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="6.5" cy="13" r="1.3" fill="var(--pink)" opacity="0.6"/><circle cx="17.5" cy="13" r="1.3" fill="var(--pink)" opacity="0.6"/>`,
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/><path d="M7 10.5q2.5-1.5 5 0M12 10.5q2.5-1.5 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M8.5 15q3.5 2.5 7 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="10.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1.3" fill="currentColor"/><path d="M9 15h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/><path d="M7 9l3 1.2M17 9l-3 1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M8 15.5q2-2 4 0t4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/><path d="M7 11.5q2.5 1.5 5 0M12 11.5q2.5 1.5 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M8.5 16q3.5-2.5 7 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>`
  ];
  return `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true">${faces[k] || ''}</svg>`;
};

const moods = (sel, a) =>
  `<div class="moods" role="group" aria-label="Mood Selector">
    ${MOODS.map((m, i) =>
      `<button class="mood" aria-pressed="${sel === i}" data-a="${a}" data-v="${i}">
        ${face(i)}
        <span>${m.name}</span>
      </button>`
    ).join("")}
  </div>`;

const chip = (t, on, at = "") => `<button class="chip" aria-pressed="${!!on}" ${at}>${t}</button>`;

const MODE_NAMES = {
  natural: "Natural cycle",
  irregular: "Irregular cycle",
  contra: "Hormonal contraception",
  ttc: "Trying to conceive",
  pregnancy: "Pregnancy mode",
  perimenopause: "Perimenopause",
  none: "No predictions"
};

/* Interactive Cycle Ring */
function ring(x, day, S) {
  const R = 62;
  const C = 2 * Math.PI * R;
  const A = x.avg || 28;
  const safeDay = Math.max(1, day);
  const ang = (Math.min(1, Math.max(0, (safeDay - 1) / A)) * 2 * Math.PI) - Math.PI / 2;
  const dotX = (80 + R * Math.cos(ang)).toFixed(1);
  const dotY = (80 + R * Math.sin(ang)).toFixed(1);

  const arc = (fromFrac, toFrac, color, width = 11) => {
    const len = Math.max(0, toFrac - fromFrac) * C;
    const off = -fromFrac * C;
    return `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="${len} ${C}" stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 80 80)"/>`;
  };

  const periodFrac = Math.min(1, (S.pl || 5) / A);
  const showFertile = (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && x.fertileEnd;
  const fertileStartFrac = showFertile ? Math.max(0, (x.fertileStart - (x.nextPred - A)) / A) : 0;
  const fertileEndFrac = showFertile ? Math.min(1, (x.fertileEnd - (x.nextPred - A)) / A) : 0;

  return `
    <div class="ring-wrap" role="img" aria-label="Cycle day ${safeDay} of estimated ${A} days">
      <svg viewBox="0 0 160 160" class="ring">
        <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border-subtle)" stroke-width="11"/>
        ${showFertile ? arc(fertileStartFrac, fertileEndFrac, "var(--tint-lavender-text)", 11) : ""}
        ${S.mode !== "none" ? arc(0, periodFrac, "var(--pink)", 11) : ""}
        <circle cx="${dotX}" cy="${dotY}" r="7.5" fill="var(--surface)" stroke="var(--plum)" stroke-width="3.5"/>
      </svg>
      <div class="ring-center">
        <span class="ring-cap">Cycle Day</span>
        <span class="ring-num">${safeDay}</span>
        <span class="ring-sub">${S.mode === "none" ? "Logged Day" : "of ~" + A + " days"}</span>
      </div>
    </div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { esc, ic, svgi, bunny, MOODS, face, moods, chip, MODE_NAMES, ring };
}
