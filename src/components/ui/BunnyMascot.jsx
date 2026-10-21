/**
 * CycleSideChick — Refined Brand Mascot
 */

import React from "react";

export function BunnyMascot({ size = 32, showLabel = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={showLabel ? "img" : undefined}
      aria-label={showLabel ? "CycleSideChick bunny brand logo" : undefined}
      aria-hidden={!showLabel}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="bunnyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--pink-light, #FDEBF2)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--surface, #FDF9FA)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#bunnyGlow)" />
      <g stroke="var(--plum, #481930)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Left Ear */}
        <path d="M40 45 C35 24 30 14 36 10 C42 6 47 18 45 42" fill="var(--surface, #FDF9FA)" />
        <path d="M38 38 C36 26 34 18 37 14 C40 12 43 20 42 36" fill="var(--tint-rose-bg, #FBE3EA)" stroke="none" />
        {/* Right Ear */}
        <path d="M60 45 C65 24 70 14 64 10 C58 6 53 18 55 42" fill="var(--surface, #FDF9FA)" />
        <path d="M62 38 C64 26 66 18 63 14 C60 12 57 20 58 36" fill="var(--tint-rose-bg, #FBE3EA)" stroke="none" />
        {/* Head / Face */}
        <ellipse cx="50" cy="62" rx="30" ry="24" fill="var(--surface, #FDF9FA)" />
        {/* Cheeks Blush */}
        <circle cx="34" cy="65" r="5" fill="var(--tint-rose-bg, #FBE3EA)" stroke="none" opacity="0.85" />
        <circle cx="66" cy="65" r="5" fill="var(--tint-rose-bg, #FBE3EA)" stroke="none" opacity="0.85" />
        {/* Eyes */}
        <path d="M37 58 Q41 55 45 58" fill="none" stroke="var(--plum, #481930)" strokeWidth="2.6" />
        <path d="M55 58 Q59 55 63 58" fill="none" stroke="var(--plum, #481930)" strokeWidth="2.6" />
        {/* Nose & Mouth */}
        <path d="M48 64 Q50 62 52 64 L50 67 Z" fill="var(--pink, #D9447E)" stroke="none" />
        <path d="M47 69 Q50 71 53 69" fill="none" stroke="var(--plum, #481930)" strokeWidth="2" />
      </g>
    </svg>
  );
}
