/**
 * CycleSideChick — UI Rendering, Vector Art & Icon System
 * Mobile-first, accessible, Manrope typography, soft semantic tints.
 * Professional SVG Vector Architecture (consistent 24x24 grid, 1.8px stroke).
 */

/* Visual & Text Sanitization */
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Cohesive 24x24 Line Iconography */
const ic = {
  home: "M3.5 10.5L12 3.5l8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-4.5a1 1 0 0 1-1-1v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4a1 1 0 0 1-1 1H5A1.5 1.5 0 0 1 3.5 20v-9.5z",
  calendar: "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm0 5h16M8 3v4M16 3v4 M8 14h.01 M12 14h.01 M16 14h.01 M8 17h.01 M12 17h.01 M16 17h.01",
  log: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v8m-4-4h8",
  insights: "M3 20h18 M6 16l4-5 4 3 5-7 M19 7h-4v4",
  care: "M19.5 12.572l-7.5 7.428l-7.5-7.428a5 5 0 1 1 7.5-6.566a5 5 0 1 1 7.5 6.572",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c0-4 4-6 8-6s8 2 8 6",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  sparkle: "M12 2l1.8 5.4L19 9.5l-5.2 2.1L12 17l-1.8-5.4L5 9.5l5.2-2.1L12 2z",
  arrowLeft: "M15 19l-7-7 7-7",
  arrowRight: "M9 5l7 7-7 7",
  alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-11v6m0-8h.01",
  copy: "M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.24a2 2 0 0 0-.59-1.41l-3.24-3.24A2 2 0 0 0 14.76 2H10a2 2 0 0 0-2 2z M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7 6v-2m-4-4V7a4 4 0 0 1 8 0v4",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  water: "M12 2.7l5.3 6.6a7 7 0 1 1-10.6 0L12 2.7z M8 13.5q4 2 8 0",
  pill: "M10.5 4.5l-6 6a5 5 0 0 0 7.1 7.1l6-6a5 5 0 0 0-7.1-7.1zm-1.5 7.5l7-7",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  thermometer: "M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z M12 11v6",
  flame: "M8.5 14.5A4.5 4.5 0 0 0 13 19a4.5 4.5 0 0 0 4.5-4.5c0-3-2.5-5-3.5-7.5-.5 1-1 2-2.5 2.5 0-2-1-4-3-4.5 0 2.5-1 4.5 0 5z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 22z",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v6l4 2"
};

const svgi = (k, sz = 22, cls = "") =>
  `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" class="${cls}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ic[k] || ''}"/></svg>`;

/**
 * Refined Brand Mascot — Subtle Bunny Vector Mark
 * Designed to scale cleanly from 20px header mark to 72px onboarding emblem.
 */
const bunny = (z = 32, lbl = 1) =>
  `<svg viewBox="0 0 100 100" width="${z}" height="${z}" ${lbl ? 'role="img" aria-label="CycleSideChick bunny brand logo"' : 'aria-hidden="true"'} style="flex-shrink:0;">
    <defs>
      <radialGradient id="bunnyGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--pink-light)" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="var(--surface)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#bunnyGlow)"/>
    <g stroke="var(--plum)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <!-- Left Ear -->
      <path d="M40 45 C35 24 30 14 36 10 C42 6 47 18 45 42" fill="var(--surface)"/>
      <path d="M38 38 C36 26 34 18 37 14 C40 12 43 20 42 36" fill="var(--tint-rose-bg)" stroke="none"/>
      <!-- Right Ear -->
      <path d="M60 45 C65 24 70 14 64 10 C58 6 53 18 55 42" fill="var(--surface)"/>
      <path d="M62 38 C64 26 66 18 63 14 C60 12 57 20 58 36" fill="var(--tint-rose-bg)" stroke="none"/>
      <!-- Head / Face -->
      <ellipse cx="50" cy="62" rx="30" ry="24" fill="var(--surface)"/>
      <!-- Cheeks Blush -->
      <circle cx="34" cy="65" r="5" fill="var(--tint-rose-bg)" stroke="none" opacity="0.85"/>
      <circle cx="66" cy="65" r="5" fill="var(--tint-rose-bg)" stroke="none" opacity="0.85"/>
      <!-- Eyes (calm, smiling crescent curve) -->
      <path d="M37 58 Q41 55 45 58" fill="none" stroke="var(--plum)" stroke-width="2.6"/>
      <path d="M55 58 Q59 55 63 58" fill="none" stroke="var(--plum)" stroke-width="2.6"/>
      <!-- Cute Nose & Mouth -->
      <path d="M48 64 Q50 62 52 64 L50 67 Z" fill="var(--pink)" stroke="none"/>
      <path d="M47 69 Q50 71 53 69" fill="none" stroke="var(--plum)" stroke-width="2"/>
    </g>
  </svg>`;

/**
 * Five Refined Mood Personalities
 */
const MOODS = [
  { name: "Radiant", sub: "Energized & glowing", color: "var(--tint-butter-text)" },
  { name: "Calm", sub: "Peaceful & centered", color: "var(--tint-sage-text)" },
  { name: "Okay", sub: "Steady & balanced", color: "var(--tint-sky-text)" },
  { name: "Anxious", sub: "Restless or tense", color: "var(--tint-lavender-text)" },
  { name: "Low", sub: "Tired or tender", color: "var(--tint-rose-text)" }
];

const face = (k, sz = 36) => {
  const faces = [
    // 0: Radiant (Joyful curved eyes, gentle smile, glowing blush)
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/>
     <path d="M6.5 10.5q2-2 4 0 M13.5 10.5q2-2 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>
     <path d="M8 14.5q4 3.5 8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>
     <circle cx="6.5" cy="13" r="1.4" fill="var(--pink)" opacity="0.75" stroke="none"/>
     <circle cx="17.5" cy="13" r="1.4" fill="var(--pink)" opacity="0.75" stroke="none"/>`,

    // 1: Calm (Serene resting curved eyes, centered gentle breath)
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/>
     <path d="M7 11q2.5-1.5 5 0 M12 11q2.5-1.5 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
     <path d="M9 15.2q3 2 6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
     <circle cx="6.8" cy="13.2" r="1.2" fill="var(--rose)" opacity="0.5" stroke="none"/>
     <circle cx="17.2" cy="13.2" r="1.2" fill="var(--rose)" opacity="0.5" stroke="none"/>`,

    // 2: Okay (Neutral steady eyes, relaxed straight mouth)
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/>
     <circle cx="8.5" cy="10.5" r="1.3" fill="currentColor"/>
     <circle cx="15.5" cy="10.5" r="1.3" fill="currentColor"/>
     <path d="M9.5 15h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,

    // 3: Anxious (Slightly furrowed eyebrows, wavy mouth, caring look)
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/>
     <path d="M7 9l3 1.2 M17 9l-3 1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
     <circle cx="9" cy="12.5" r="1.3" fill="currentColor"/>
     <circle cx="15" cy="12.5" r="1.3" fill="currentColor"/>
     <path d="M8.5 16q1.8-1.5 3.5 0t3.5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,

    // 4: Low (Tender down-turned curved eyes, soft comforting pout)
    `<circle cx="12" cy="12" r="10" fill="var(--surface-alt)" stroke="currentColor" stroke-width="1.6"/>
     <path d="M7 11.5q2.5 1.5 5 0 M12 11.5q2.5 1.5 5 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
     <path d="M8.5 16.2q3.5-2.2 7 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
     <circle cx="6.5" cy="13.5" r="1.2" fill="var(--pink)" opacity="0.5" stroke="none"/>
     <circle cx="17.5" cy="13.5" r="1.2" fill="var(--pink)" opacity="0.5" stroke="none"/>`
  ];
  return `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" class="mood-face-svg" aria-hidden="true">${faces[k] || ''}</svg>`;
};

const moods = (sel, a) =>
  `<div class="moods" role="group" aria-label="Mood Selector">
    ${MOODS.map((m, i) =>
      `<button class="mood" aria-pressed="${sel === i}" data-a="${a}" data-v="${i}">
        ${face(i, 36)}
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

/**
 * Tasteful Phase Illustrations (Vector Artwork)
 */
function phaseArt(phase, sz = 54) {
  const arts = {
    // Menstrual: soothing crimson droplet embracing a botanical blossom
    menstrual: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-rose-bg)"/>
        <path d="M32 14 C25 24 20 30 20 37 a12 12 0 0 0 24 0 c0-7-5-13-12-23 z" fill="var(--pink)" opacity="0.25"/>
        <path d="M32 18 C26 27 22 32 22 38 a10 10 0 0 0 20 0 c0-6-4-11-10-20 z" fill="var(--pink)"/>
        <!-- Soft White Petal Accent -->
        <path d="M28 36 Q32 32 36 36 Q32 40 28 36 Z" fill="#FFFFFF" opacity="0.75"/>
      </svg>`,

    // Follicular: fresh rising sprout reaching toward morning warmth
    follicular: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-sage-bg)"/>
        <path d="M32 46 V24" stroke="var(--tint-sage-text)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M32 34 C24 34 20 28 20 22 C26 22 32 26 32 34 Z" fill="var(--tint-sage-text)"/>
        <path d="M32 28 C40 28 44 22 44 16 C38 16 32 20 32 28 Z" fill="var(--tint-sage-text)"/>
        <circle cx="44" cy="16" r="2.5" fill="var(--tint-butter-border)"/>
      </svg>`,

    // Fertile / Ovulation: radiant blooming flower with luminous glow
    fertile: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-lavender-bg)"/>
        <!-- Petals -->
        <circle cx="32" cy="22" r="7" fill="var(--tint-lavender-border)"/>
        <circle cx="32" cy="42" r="7" fill="var(--tint-lavender-border)"/>
        <circle cx="22" cy="32" r="7" fill="var(--tint-lavender-border)"/>
        <circle cx="42" cy="32" r="7" fill="var(--tint-lavender-border)"/>
        <!-- Center Core -->
        <circle cx="32" cy="32" r="8" fill="var(--pink)"/>
        <!-- Radiant Star Sparks -->
        <path d="M32 10 L33.5 15 L36 12 Z M32 54 L33.5 49 L36 52 Z M10 32 L15 33.5 L12 36 Z M54 32 L49 33.5 L52 36 Z" fill="var(--tint-lavender-text)"/>
      </svg>`,

    // Luteal: peaceful crescent moon cradled in quiet evening stars
    luteal: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-peach-bg)"/>
        <path d="M38 18 A15 15 0 1 1 23 44 A18 18 0 0 0 38 18 Z" fill="var(--tint-peach-text)"/>
        <circle cx="44" cy="22" r="2" fill="var(--tint-amber-text)"/>
        <circle cx="42" cy="38" r="1.5" fill="var(--tint-amber-text)"/>
        <circle cx="20" cy="20" r="1.5" fill="var(--tint-amber-text)"/>
      </svg>`,

    // Pregnancy: tender nested protective circle cradling life
    pregnancy: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-butter-bg)"/>
        <path d="M22 38 C20 26 30 18 40 22 C48 26 48 38 40 44 C34 48 24 46 22 38 Z" stroke="var(--tint-butter-text)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="34" cy="33" r="6" fill="var(--pink)"/>
        <path d="M31 29 Q34 26 37 29" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,

    // Perimenopause: harmonious ocean rhythm of balancing transition
    perimenopause: `
      <svg viewBox="0 0 64 64" width="${sz}" height="${sz}" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="var(--tint-mint-bg)"/>
        <path d="M16 28 Q24 20 32 28 T48 28" stroke="var(--tint-mint-text)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M16 36 Q24 28 32 36 T48 36" stroke="var(--tint-mint-text)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="18" r="3.5" fill="var(--tint-amber-text)"/>
      </svg>`
  };
  return arts[phase] || arts.menstrual;
}

/**
 * Interactive SVG Cycle Ring
 * Smooth circular progress visualization with distinct period and fertile phases.
 */
function ring(x, day, S) {
  const R = 62;
  const C = 2 * Math.PI * R;
  const A = x.avg || 28;
  const safeDay = Math.max(1, day);
  const ang = (Math.min(1, Math.max(0, (safeDay - 1) / A)) * 2 * Math.PI) - Math.PI / 2;
  const dotX = (80 + R * Math.cos(ang)).toFixed(1);
  const dotY = (80 + R * Math.sin(ang)).toFixed(1);

  const arc = (fromFrac, toFrac, color, width = 11, dash = "") => {
    const len = Math.max(0, toFrac - fromFrac) * C;
    const off = -fromFrac * C;
    return `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${color}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : `stroke-dasharray="${len} ${C}"`} stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 80 80)" class="ring-track-arc"/>`;
  };

  const periodFrac = Math.min(1, (S.pl || 5) / A);
  const showFertile = (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && x.fertileEnd;
  const fertileStartFrac = showFertile ? Math.max(0, (x.fertileStart - (x.nextPred - A)) / A) : 0;
  const fertileEndFrac = showFertile ? Math.min(1, (x.fertileEnd - (x.nextPred - A)) / A) : 0;

  return `
    <div class="ring-wrap" role="img" aria-label="Cycle day ${safeDay} of estimated ${A} days">
      <svg viewBox="0 0 160 160" class="ring">
        <!-- Background Track -->
        <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border-subtle)" stroke-width="11"/>
        <!-- Fertile Window Arc -->
        ${showFertile ? arc(fertileStartFrac, fertileEndFrac, "var(--tint-lavender-border)", 11) : ""}
        <!-- Period Flow Arc -->
        ${S.mode !== "none" ? arc(0, periodFrac, "var(--pink)", 11) : ""}
        <!-- Current Cycle Day Indicator Pulse -->
        <circle cx="${dotX}" cy="${dotY}" r="11" fill="var(--pink-glow)" class="ring-pulse-halo"/>
        <circle cx="${dotX}" cy="${dotY}" r="7.5" fill="var(--surface)" stroke="var(--plum)" stroke-width="3.5" class="ring-tracker-head"/>
      </svg>
      <div class="ring-center">
        <span class="ring-cap">Cycle Day</span>
        <span class="ring-num">${safeDay}</span>
        <span class="ring-sub">${S.mode === "none" ? "Logged Day" : "of ~" + A + " days"}</span>
      </div>
    </div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    esc, ic, svgi, bunny, MOODS, face, moods, chip, MODE_NAMES, phaseArt, ring
  };
}
