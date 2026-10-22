/**
 * CycleSideChick — Refined Brand Mascot
 * Tactile animated SVG bunny with natural blinking (randomized interval),
 * ear tilt on hover/active, soft blush, and warm brand tones.
 */

import React from "react";

export function BunnyMascot({ size = 32, showLabel = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`c-bunny ${className}`.trim()}
      role={showLabel ? "img" : undefined}
      aria-label={showLabel ? "CycleSideChick bunny brand logo" : undefined}
      aria-hidden={!showLabel}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="bunnyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF0F5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--surface, #FFFFFF)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="50" cy="50" r="47" fill="url(#bunnyGlow)" stroke="#FFE4EE" strokeWidth="1.5" />

      <g stroke="#3D343B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Left Ear with soft tilt */}
        <g className="c-bunny__ear-left">
          <path d="M40 45 C35 24 30 14 36 10 C42 6 47 18 45 42" fill="#FFFFFF" />
          <path d="M38 38 C36 26 34 18 37 14 C40 12 43 20 42 36" fill="#FFD1E3" stroke="none" />
        </g>

        {/* Right Ear with soft tilt */}
        <g className="c-bunny__ear-right">
          <path d="M60 45 C65 24 70 14 64 10 C58 6 53 18 55 42" fill="#FFFFFF" />
          <path d="M62 38 C64 26 66 18 63 14 C60 12 57 20 58 36" fill="#FFD1E3" stroke="none" />
        </g>

        {/* Head / Face */}
        <ellipse cx="50" cy="62" rx="30" ry="24" fill="#FFFFFF" />

        {/* Soft Cheeks Blush */}
        <circle cx="33" cy="65" r="5.5" fill="#FFAEC9" stroke="none" opacity="0.85" />
        <circle cx="67" cy="65" r="5.5" fill="#FFAEC9" stroke="none" opacity="0.85" />

        {/* Eyes with natural joyful blink */}
        <g className="c-bunny__eye" style={{ transformOrigin: "50px 58px" }}>
          <path d="M37 58 Q41 54.5 45 58" fill="none" stroke="#3D343B" strokeWidth="2.4" />
          <path d="M55 58 Q59 54.5 63 58" fill="none" stroke="#3D343B" strokeWidth="2.4" />
        </g>

        {/* Nose & Mouth */}
        <path d="M48 64 Q50 62 52 64 L50 66.5 Z" fill="#FF5B99" stroke="none" />
        <path d="M47 69 Q50 71.5 53 69" fill="none" stroke="#3D343B" strokeWidth="2" />
      </g>
    </svg>
  );
}
