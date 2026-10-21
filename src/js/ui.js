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
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v6l4 2",
  trendUp: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  droplet: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  sun: "M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  help: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M18 15l-6-6-6 6",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  laptop: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  feather: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9",
  cup: "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
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
 * Smooth circular progress visualization with distinct physiological phases:
 * - Menstrual flow arc (Rose)
 * - Follicular phase arc (Sage)
 * - Fertile window arc (Lavender) with ovulation star/marker
 * - Luteal phase arc (Peach)
 */
function ring(x, day, S) {
  const R = 66;
  const C = 2 * Math.PI * R;
  const A = x.avg || 28;
  const safeDay = Math.max(1, day);
  const frac = Math.min(1, Math.max(0, (safeDay - 1) / A));
  const ang = (frac * 2 * Math.PI) - Math.PI / 2;
  const dotX = (85 + R * Math.cos(ang)).toFixed(1);
  const dotY = (85 + R * Math.sin(ang)).toFixed(1);

  const arc = (fromFrac, toFrac, color, width = 12, dash = "") => {
    const len = Math.max(0, toFrac - fromFrac) * C;
    const off = -fromFrac * C;
    return `<circle cx="85" cy="85" r="${R}" fill="none" stroke="${color}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : `stroke-dasharray="${len} ${C}"`} stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 85 85)" class="ring-track-arc"/>`;
  };

  const periodFrac = Math.min(1, (S.pl || 5) / A);
  const showFertile = (S.mode === "natural" || S.mode === "ttc") && x.fertileStart && x.fertileEnd;
  const fertileStartFrac = showFertile ? Math.max(0, (x.fertileStart - (x.nextPred - A)) / A) : 0;
  const fertileEndFrac = showFertile ? Math.min(1, (x.fertileEnd - (x.nextPred - A)) / A) : 0;
  const ovFrac = showFertile ? Math.max(0, Math.min(1, (A - (x.ll || 14)) / A)) : 0;
  const ovAng = (ovFrac * 2 * Math.PI) - Math.PI / 2;
  const ovX = (85 + R * Math.cos(ovAng)).toFixed(1);
  const ovY = (85 + R * Math.sin(ovAng)).toFixed(1);

  // Follicular and Luteal background segments
  const follEnd = showFertile ? fertileStartFrac : 0.5;
  const lutStart = showFertile ? fertileEndFrac : 0.5;

  return `
    <div class="ring-wrap" role="img" aria-label="Cycle day ${safeDay} of estimated ${A} days">
      <svg viewBox="0 0 170 170" class="ring">
        <!-- Background Track -->
        <circle cx="85" cy="85" r="${R}" fill="none" stroke="var(--border-subtle)" stroke-width="12"/>

        <!-- Follicular Phase Arc -->
        ${S.mode !== "none" ? arc(periodFrac, follEnd, "var(--tint-sage-border)", 8) : ""}

        <!-- Luteal Phase Arc -->
        ${S.mode !== "none" ? arc(lutStart, 1, "var(--tint-peach-border)", 8) : ""}

        <!-- Fertile Window Arc -->
        ${showFertile ? arc(fertileStartFrac, fertileEndFrac, "var(--tint-lavender-border)", 12) : ""}

        <!-- Period Flow Arc -->
        ${S.mode !== "none" ? arc(0, periodFrac, "var(--pink)", 12) : ""}

        <!-- Ovulation Indicator Star on ring -->
        ${showFertile ? `
          <g transform="translate(${ovX - 5}, ${ovY - 5})" aria-label="Estimated ovulation point">
            <circle cx="5" cy="5" r="5" fill="var(--tint-lavender-bg)" stroke="var(--tint-lavender-text)" stroke-width="1.2"/>
            <path d="M5 2.5l.8 1.8 1.9.3-1.4 1.3.3 1.9L5 6.9 3.4 7.8l.3-1.9L2.3 4.6l1.9-.3z" fill="var(--tint-lavender-text)"/>
          </g>
        ` : ""}

        <!-- Current Cycle Day Indicator Pulse -->
        <circle cx="${dotX}" cy="${dotY}" r="12" fill="var(--pink-glow)" class="ring-pulse-halo"/>
        <circle cx="${dotX}" cy="${dotY}" r="8" fill="var(--surface-elevated)" stroke="var(--plum)" stroke-width="3.5" class="ring-tracker-head"/>
      </svg>
      <div class="ring-center">
        <span class="ring-cap">Cycle Day</span>
        <span class="ring-num">${safeDay}</span>
        <span class="ring-sub">${S.mode === "none" ? "Logged Day" : "of ~" + A + " days"}</span>
      </div>
    </div>`;
}

/**
 * Responsive Cycle Lengths Historical Chart
 * Visualizes past cycle lengths with average line and normal physiological zone (21-35 days).
 */
function renderCycleLengthChart(x, ls) {
  if (!ls || ls.length < 2) return "";
  const W = 320;
  const H = 140;
  const padBottom = 26;
  const padTop = 18;
  const plotH = H - padBottom - padTop;
  const maxVal = Math.max(...ls, 38);
  const minVal = Math.min(...ls, 20);
  const range = Math.max(15, maxVal - minVal + 4);
  const scaleY = val => H - padBottom - ((val - minVal + 2) / range) * plotH;

  const y21 = Math.round(scaleY(21));
  const y35 = Math.round(scaleY(35));
  const yAvg = Math.round(scaleY(x.avg));

  const barW = Math.min(36, Math.max(18, (W - 30) / ls.length - 10));
  const step = (W - 20) / ls.length;

  return `
    <div class="chart-card card" role="region" aria-label="Cycle lengths historical bar chart">
      <div class="row" style="margin-bottom:6px">
        <div>
          <h3 style="margin:0;font-size:15px;color:var(--plum)">Historical Cycle Lengths</h3>
          <p class="mut" style="margin:2px 0 0;font-size:12px">Last ${ls.length} recorded cycles · Recency average ${x.avg} days</p>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">ACOG 21–35d</span>
      </div>

      <svg viewBox="0 0 ${W} ${H}" width="100%" class="chart-svg" style="overflow:visible">
        <!-- Normal Physiological Range Band (21-35 days) -->
        <rect x="0" y="${Math.min(y21, y35)}" width="${W}" height="${Math.abs(y21 - y35)}" fill="var(--tint-sage-bg)" opacity="0.45" rx="4"/>
        <text x="${W - 6}" y="${y35 - 3}" text-anchor="end" font-size="9" font-weight="600" fill="var(--tint-sage-text)">Typical upper: 35d</text>
        <text x="${W - 6}" y="${y21 + 10}" text-anchor="end" font-size="9" font-weight="600" fill="var(--tint-sage-text)">Typical lower: 21d</text>

        <!-- Average Benchmark Line -->
        <line x1="0" y1="${yAvg}" x2="${W}" y2="${yAvg}" stroke="var(--plum)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
        <text x="6" y="${yAvg - 4}" font-size="9.5" font-weight="700" fill="var(--plum)">Your Avg: ${x.avg}d</text>

        <!-- Base axis line -->
        <line x1="0" y1="${H - padBottom}" x2="${W}" y2="${H - padBottom}" stroke="var(--border)" stroke-width="1"/>

        <!-- Cycle Bars -->
        ${ls.map((l, i) => {
          const xPos = 14 + i * step;
          const yPos = Math.round(scaleY(l));
          const barH = Math.max(6, H - padBottom - yPos);
          const isOutlier = x.outlierDetected && Math.abs(l - x.avg) >= 10;
          const barColor = isOutlier ? "var(--tint-amber-text)" : "var(--pink)";

          return `
            <g class="chart-bar-group" tabindex="0" role="graphics-symbol" aria-label="Cycle ${i + 1}: ${l} days">
              <rect x="${xPos}" y="${yPos}" width="${barW}" height="${barH}" rx="5" fill="${barColor}" class="chart-bar" style="animation: barRise 0.45s var(--ease-out-expo) ${i * 45}ms both; transform-origin: bottom;"/>
              <text x="${xPos + barW / 2}" y="${yPos - 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--plum)">${l}</text>
              <text x="${xPos + barW / 2}" y="${H - 10}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--muted)">C${i + 1}</text>
              ${isOutlier ? `<circle cx="${xPos + barW / 2}" cy="${yPos - 13}" r="2.5" fill="var(--tint-amber-text)"/>` : ""}
            </g>`;
        }).join("")}
      </svg>

      <div class="chart-legend" style="margin-top:8px">
        <span><i style="background:var(--pink)"></i> Recorded length</span>
        <span><i style="background:var(--tint-sage-bg);border:1px solid var(--tint-sage-border)"></i> Normal range (21–35d)</span>
        <span><i style="border-top:1.5px dashed var(--plum);height:0;width:12px"></i> Your recency mean</span>
      </div>
    </div>`;
}

/**
 * Period Durations Historical Chart
 * Visualizes duration of bleeding days per cycle with standard 3-7 day physiological benchmark.
 */
function renderPeriodDurationChart(durations, defaultPl = 5) {
  if (!durations || durations.length < 2) return "";
  const W = 320;
  const H = 120;
  const padBottom = 24;
  const padTop = 16;
  const plotH = H - padBottom - padTop;
  const durs = durations.map(d => d.duration);
  const maxD = Math.max(...durs, 9);
  const scaleY = val => H - padBottom - (val / maxD) * plotH;

  const y3 = Math.round(scaleY(3));
  const y7 = Math.round(scaleY(7));
  const avgDur = (durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(1);
  const yAvg = Math.round(scaleY(avgDur));
  const step = (W - 20) / durs.length;
  const barW = Math.min(28, Math.max(14, step - 8));

  return `
    <div class="chart-card card" role="region" aria-label="Period duration history chart">
      <div class="row" style="margin-bottom:6px">
        <div>
          <h3 style="margin:0;font-size:15px;color:var(--plum)">Period Bleeding Duration</h3>
          <p class="mut" style="margin:2px 0 0;font-size:12px">Average duration: <b>${avgDur} days</b> · ${durations.length} periods recorded</p>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">Normal 3–7d</span>
      </div>

      <svg viewBox="0 0 ${W} ${H}" width="100%" class="chart-svg" style="overflow:visible">
        <!-- Normal Duration Band (3-7 days) -->
        <rect x="0" y="${y7}" width="${W}" height="${Math.abs(y3 - y7)}" fill="var(--tint-rose-bg)" opacity="0.4" rx="4"/>
        <text x="${W - 6}" y="${y7 - 2}" text-anchor="end" font-size="8.5" font-weight="600" fill="var(--tint-rose-text)">Typical max: 7d</text>

        <!-- Average Line -->
        <line x1="0" y1="${yAvg}" x2="${W}" y2="${yAvg}" stroke="var(--pink)" stroke-width="1.2" stroke-dasharray="3 3"/>

        <!-- Base line -->
        <line x1="0" y1="${H - padBottom}" x2="${W}" y2="${H - padBottom}" stroke="var(--border)" stroke-width="1"/>

        <!-- Duration Bars -->
        ${durations.map((d, i) => {
          const xPos = 12 + i * step;
          const yPos = Math.round(scaleY(d.duration));
          const h = Math.max(4, H - padBottom - yPos);
          const isExtended = d.duration > 7;
          return `
            <g class="chart-bar-group" tabindex="0" role="graphics-symbol" aria-label="Period ${i + 1}: ${d.duration} days">
              <rect x="${xPos}" y="${yPos}" width="${barW}" height="${h}" rx="4" fill="${isExtended ? 'var(--tint-amber-text)' : 'var(--tint-rose-text)'}" class="chart-bar" style="animation: barRise 0.45s var(--ease-out-expo) ${i * 45}ms both; transform-origin: bottom;"/>
              <text x="${xPos + barW / 2}" y="${yPos - 3}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--plum)">${d.duration}d</text>
              <text x="${xPos + barW / 2}" y="${H - 8}" text-anchor="middle" font-size="9" fill="var(--muted)">#${i + 1}</text>
            </g>`;
        }).join("")}
      </svg>

      <div class="chart-legend" style="margin-top:6px">
        <span><i style="background:var(--tint-rose-text)"></i> Bleeding days</span>
        <span><i style="background:var(--tint-rose-bg);border:1px solid var(--tint-rose-border)"></i> Normal bleeding span (3–7d)</span>
      </div>
    </div>`;
}

/**
 * Clinical Cycle Variability Gauge (FIGO Standard)
 */
function renderVariabilityGauge(varData) {
  if (!varData || !varData.ready) return "";

  const isRegular = varData.classification === "Highly Regular";
  const isNormal = varData.classification === "Normal Variation";
  const tintClass = isRegular ? "tint-sage" : isNormal ? "tint-butter" : "tint-amber";
  const color = isRegular ? "var(--tint-sage-text)" : isNormal ? "var(--tint-butter-text)" : "var(--tint-amber-text)";

  return `
    <div class="card ${tintClass}" style="padding:16px">
      <div class="row">
        <div style="display:flex;align-items:center;gap:8px">
          ${svgi("activity", 20)}
          <b style="font-size:14.5px;color:${color}">Cycle Regularity: ${varData.classification}</b>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">FIGO Metric</span>
      </div>
      <p class="mut" style="margin:6px 0 10px;font-size:13px;line-height:1.5">${varData.explanation}</p>

      <!-- 3-Segment Visual Gauge -->
      <div style="display:flex;gap:4px;height:10px;border-radius:var(--radius-pill);overflow:hidden;background:var(--border-subtle)">
        <div style="flex:1;background:var(--tint-sage-border);${isRegular ? 'border:1.5px solid var(--tint-sage-text);' : ''}"></div>
        <div style="flex:1;background:var(--tint-butter-border);${isNormal ? 'border:1.5px solid var(--tint-butter-text);' : ''}"></div>
        <div style="flex:1;background:var(--tint-amber-border);${!isRegular && !isNormal ? 'border:1.5px solid var(--tint-amber-text);' : ''}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10.5px;font-weight:600;color:var(--muted)">
        <span>≤3d (Steady)</span>
        <span>4–7d (Natural)</span>
        <span>≥8d (Variable)</span>
      </div>
    </div>`;
}

/**
 * Symptom Frequencies & Severity Distribution
 */
function renderSymptomHeatmap(symData) {
  if (!symData || !symData.symptoms || !symData.symptoms.length) {
    return `
      <div class="card tint-mint" style="text-align:center;padding:20px 16px">
        ${svgi("droplet", 28)}
        <h3 style="margin:8px 0 4px">No Symptoms Logged Yet</h3>
        <p class="mut" style="font-size:13px;margin:0">Log cramps, headache, energy or mood on the Log tab to reveal symptom patterns.</p>
      </div>`;
  }

  const top = symData.symptoms.slice(0, 5);
  const maxCount = Math.max(...top.map(s => s.count), 1);

  return `
    <div class="card">
      <div class="row" style="margin-bottom:8px">
        <div>
          <h3 style="margin:0;font-size:15px;color:var(--plum)">Frequent Symptoms</h3>
          <p class="mut" style="margin:2px 0 0;font-size:12px">Top recorded symptoms &amp; intensity breakdown</p>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">${symData.totalLogged} logs</span>
      </div>

      <div style="display:grid;gap:10px;margin-top:12px">
        ${top.map(s => {
          const mildPct = Math.round((s.levels.mild / s.count) * 100);
          const modPct = Math.round((s.levels.moderate / s.count) * 100);
          const sevPct = Math.round((s.levels.severe / s.count) * 100);
          const barWidthPct = Math.round((s.count / maxCount) * 100);

          return `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:3px;color:var(--plum)">
                <span>${esc(s.name)}</span>
                <span class="mut" style="font-weight:600">${s.count} time${s.count === 1 ? '' : 's'}</span>
              </div>
              <div style="height:12px;width:${barWidthPct}%;min-width:40px;display:flex;border-radius:var(--radius-pill);overflow:hidden;background:var(--border-subtle)">
                ${mildPct > 0 ? `<div style="width:${mildPct}%;background:var(--tint-rose-border)" title="Mild: ${s.levels.mild}"></div>` : ""}
                ${modPct > 0 ? `<div style="width:${modPct}%;background:var(--pink)" title="Moderate: ${s.levels.moderate}"></div>` : ""}
                ${sevPct > 0 ? `<div style="width:${sevPct}%;background:var(--tint-rose-text)" title="Severe: ${s.levels.severe}"></div>` : ""}
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="chart-legend" style="margin-top:12px">
        <span><i style="background:var(--tint-rose-border)"></i> Mild</span>
        <span><i style="background:var(--pink)"></i> Moderate</span>
        <span><i style="background:var(--tint-rose-text)"></i> Severe</span>
      </div>
    </div>`;
}

/**
 * Mood Balance & Emotional Pattern Distribution
 */
function renderMoodDistribution(moodData) {
  if (!moodData || !moodData.total) return "";

  return `
    <div class="card">
      <div class="row" style="margin-bottom:8px">
        <div>
          <h3 style="margin:0;font-size:15px;color:var(--plum)">Mood Distribution (Last 60 Days)</h3>
          <p class="mut" style="margin:2px 0 0;font-size:12px">${moodData.total} mood check-ins recorded</p>
        </div>
      </div>

      <!-- Segmented Bar -->
      <div style="display:flex;height:14px;border-radius:var(--radius-pill);overflow:hidden;margin:10px 0 12px;background:var(--border-subtle)">
        ${moodData.percentages.map((pct, i) => {
          if (pct === 0) return "";
          const colors = ["var(--tint-butter-border)", "var(--tint-sage-border)", "var(--tint-sky-border)", "var(--tint-lavender-border)", "var(--tint-rose-border)"];
          return `<div style="width:${pct}%;background:${colors[i]}" title="${MOODS[i].name}: ${pct}%"></div>`;
        }).join("")}
      </div>

      <!-- Mood Chips -->
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${MOODS.map((m, i) => {
          const count = moodData.counts[i];
          const pct = moodData.percentages[i];
          return `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-pill);border:1px solid var(--border);font-size:11.5px;background:var(--surface)">
              ${face(i, 18)}
              <span style="font-weight:700;color:var(--plum)">${m.name}</span>
              <span class="mut">${pct}%</span>
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

/**
 * Interactive 4-Phase Educational Visualizer
 * Beautiful, accessible guide to Menstrual, Follicular, Ovulatory, and Luteal phases.
 */
function renderInteractivePhaseTour(x, day, S) {
  const currentDay = Math.max(1, day || 1);
  const A = x.avg || 28;
  const ll = x.ll || 14;
  const pLen = S.pl || 5;

  const phases = [
    {
      key: "menstrual",
      name: "1. Menstrual Phase",
      days: `Days 1–${pLen}`,
      badge: "Winter • Rest",
      color: "var(--phase-menstrual)",
      bg: "var(--phase-menstrual-bg)",
      text: "var(--phase-menstrual-text)",
      hormones: "Estrogen & progesterone drop to baseline levels; endometrium sheds.",
      sensations: "Cramps, lower energy, desire to turn inward and recharge.",
      tips: "Iron-rich foods, warm ginger tea, heating pads, and restorative sleep."
    },
    {
      key: "follicular",
      name: "2. Follicular Phase",
      days: `Days ${pLen + 1}–${A - ll - 5}`,
      badge: "Spring • Renewal",
      color: "var(--phase-follicular)",
      bg: "var(--phase-follicular-bg)",
      text: "var(--phase-follicular-text)",
      hormones: "FSH prompts ovarian follicle growth; estrogen steadily climbs.",
      sensations: "Rising physical stamina, sharp mental clarity, and elevated optimism.",
      tips: "Fresh vibrant meals, creative planning, social events, and brisk workouts."
    },
    {
      key: "fertile",
      name: "3. Ovulatory Window",
      days: `Days ${A - ll - 4}–${A - ll + 1}`,
      badge: "Summer • Peak Vitality",
      color: "var(--phase-ovulatory)",
      bg: "var(--phase-ovulatory-bg)",
      text: "var(--phase-ovulatory-text)",
      hormones: "Estrogen peaks triggering an LH surge; egg is released from dominant follicle.",
      sensations: "Peak sociability, heightened libido, and slippery/egg-white cervical mucus.",
      tips: "Antioxidant berries, joyful dance or resistance training, and hydration."
    },
    {
      key: "luteal",
      name: "4. Luteal Phase",
      days: `Days ${A - ll + 2}–${A}`,
      badge: "Autumn • Nesting",
      color: "var(--phase-luteal)",
      bg: "var(--phase-luteal-bg)",
      text: "var(--phase-luteal-text)",
      hormones: "Corpus luteum secretes progesterone; basal body temperature rises slightly.",
      sensations: "Calm groundedness, nesting focus, followed by potential PMS sensitivity.",
      tips: "Magnesium (dark chocolate, pumpkin seeds), roasted root veg, and soothing boundaries."
    }
  ];

  return `
    <div class="interactive-phase-guide" role="region" aria-label="Interactive 4-Phase Cycle Architecture">
      <div class="row" style="margin-bottom:10px">
        <div>
          <h3 style="margin:0;font-size:16px;color:var(--plum)">The Four Cycle Phases</h3>
          <p class="mut" style="margin:2px 0 0;font-size:12.5px">Hormonal rhythms, physiological shifts, and evidence-based self-care</p>
        </div>
        <span class="chip" style="min-height:26px;padding:2px 8px;font-size:11px">ACOG Clinical Guide</span>
      </div>

      <!-- Responsive Phase Hormone SVG Curve -->
      <div style="background:var(--surface);border-radius:var(--radius-md);border:1px solid var(--border);padding:12px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:11px;font-weight:700">
          <span style="color:var(--phase-menstrual-text)">Menstrual</span>
          <span style="color:var(--phase-follicular-text)">Follicular</span>
          <span style="color:var(--phase-ovulatory-text)">Ovulation</span>
          <span style="color:var(--phase-luteal-text)">Luteal</span>
        </div>
        <svg viewBox="0 0 300 70" width="100%" height="70" aria-label="Hormone levels curve through cycle">
          <!-- Baseline -->
          <line x1="0" y1="60" x2="300" y2="60" stroke="var(--border)" stroke-width="1"/>

          <!-- Estrogen Curve (Teal/Green) -->
          <path d="M0 56 Q50 56 100 40 T150 15 Q180 50 230 35 T300 58" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/>

          <!-- Progesterone Curve (Amber/Coral) -->
          <path d="M0 58 Q140 58 160 52 Q210 18 240 22 T300 58" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round"/>

          <!-- Ovulation Marker Dot -->
          <circle cx="150" cy="15" r="3.5" fill="#7C3AED"/>
          <text x="150" y="10" text-anchor="middle" font-size="8" font-weight="700" fill="#7C3AED">LH Surge</text>
        </svg>
        <div style="display:flex;justify-content:center;gap:14px;margin-top:4px;font-size:10px;font-weight:600">
          <span style="color:#059669">• Estrogen</span>
          <span style="color:#D97706">• Progesterone</span>
          <span style="color:#7C3AED">✦ Ovulation Peak</span>
        </div>
      </div>

      <!-- Phase Cards List -->
      <div style="display:grid;gap:10px">
        ${phases.map((p, idx) => `
          <div class="card card-interactive" style="padding:14px;border-left:4px solid ${p.color};background:var(--surface)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <div style="display:flex;align-items:center;gap:6px">
                <b style="color:var(--plum);font-size:14px">${p.name}</b>
                <span class="chip" style="min-height:22px;padding:1px 6px;font-size:10px">${p.days}</span>
              </div>
              <span style="font-size:10.5px;font-weight:700;color:${p.color}">${p.badge}</span>
            </div>
            <p style="margin:4px 0;font-size:12.5px;line-height:1.45;color:var(--ink)">
              <b>Hormones:</b> ${p.hormones}
            </p>
            <p style="margin:4px 0;font-size:12px;line-height:1.45;color:var(--muted)">
              <b>Body &amp; Energy:</b> ${p.sensations}
            </p>
            <div style="margin-top:6px;font-size:11.5px;color:var(--plum);background:var(--surface-alt);padding:6px 10px;border-radius:var(--radius-sm)">
              💡 <b>Self-Care Tip:</b> ${p.tips}
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    esc, ic, svgi, bunny, MOODS, face, moods, chip, MODE_NAMES, phaseArt, ring,
    renderCycleLengthChart, renderPeriodDurationChart, renderVariabilityGauge,
    renderSymptomHeatmap, renderMoodDistribution, renderInteractivePhaseTour
  };
}
