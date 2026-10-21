/**
 * CycleSideChick — Reference Cycle Wheel Component
 * Faithfully matches the soft, neomorphic, coral-and-berry reference design.
 * Features:
 * - Recessed neomorphic circular trough with dual embossed bevels
 * - Smooth gradient rounded arcs (Coral Salmon & Berry Magenta)
 * - Tactile floating pink "+" pill button riding the current cycle day angle
 * - Center white elevated disk with crisp typography ("Day", number, phase name)
 */

import React, { useEffect, useState } from "react";
import { actions } from "../../app/actions.js";
import { TD, I } from "../../core/engine.js";

export function CycleRing({ stats, day, S, phaseName = "Luteal Phase" }) {
  const R = 78; // Radius of mid-track
  const C = 2 * Math.PI * R;
  const A = stats.avg || 28;
  const safeDay = Math.max(1, day);
  const frac = Math.min(1, Math.max(0, (safeDay - 1) / A));
  const ang = frac * 2 * Math.PI - Math.PI / 2;
  const dotX = (110 + R * Math.cos(ang)).toFixed(1);
  const dotY = (110 + R * Math.sin(ang)).toFixed(1);

  // Animated count-up effect on mount
  const [displayDay, setDisplayDay] = useState(1);
  useEffect(() => {
    let start = 1;
    const duration = 500;
    const stepTime = Math.max(16, duration / Math.max(1, safeDay));
    const timer = setInterval(() => {
      start++;
      if (start >= safeDay) {
        setDisplayDay(safeDay);
        clearInterval(timer);
      } else {
        setDisplayDay(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [safeDay]);

  const arc = (fromFrac, toFrac, strokeUrl, width = 18) => {
    const len = Math.max(0, toFrac - fromFrac) * C;
    const off = -fromFrac * C;
    return (
      <circle
        cx="110"
        cy="110"
        r={R}
        fill="none"
        stroke={strokeUrl}
        strokeWidth={width}
        strokeDasharray={`${len} ${C}`}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 110 110)"
        style={{
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
    );
  };

  const periodFrac = Math.min(1, (S.pl || 5) / A);
  const showFertile = (S.mode === "natural" || S.mode === "ttc") && stats.fertileStart && stats.fertileEnd && S.showFertile !== 0;
  const fertileStartFrac = showFertile ? Math.max(0, (stats.fertileStart - (stats.nextPred - A)) / A) : 0.38;
  const fertileEndFrac = showFertile ? Math.min(1, (stats.fertileEnd - (stats.nextPred - A)) / A) : 0.62;

  return (
    <div
      className="v-reference-ring-wrap"
      role="img"
      aria-label={`Cycle day ${safeDay} of ~${A} days, currently in ${phaseName}`}
    >
      <svg viewBox="0 0 220 220" className="v-reference-ring-svg">
        <defs>
          {/* Coral / Salmon Gradient (Top Arc) */}
          <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A8B" />
            <stop offset="100%" stopColor="#FF5774" />
          </linearGradient>

          {/* Berry / Magenta Gradient (Bottom / Fertile Arc & Button) */}
          <linearGradient id="berryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5C9A" />
            <stop offset="100%" stopColor="#E22A71" />
          </linearGradient>

          {/* Soft outer glow for the plus button */}
          <filter id="plusGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF3377" floodOpacity="0.4" />
          </filter>

          {/* Recessed bevel filter for outer circular groove */}
          <filter id="grooveBevel" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2D232C" floodOpacity="0.08" />
          </filter>

          {/* Soft elevation for central disk */}
          <filter id="centerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2D232C" floodOpacity="0.07" />
          </filter>
        </defs>

        {/* Outer Circular Dish (White Rim) */}
        <circle cx="110" cy="110" r="102" fill="#FFFFFF" filter="url(#grooveBevel)" />

        {/* Recessed Circular Trough Groove */}
        <circle cx="110" cy="110" r={R} fill="none" stroke="#EFECEF" strokeWidth="22" />
        <circle cx="110" cy="110" r={R + 11} fill="none" stroke="rgba(45,35,44,0.04)" strokeWidth="1" />
        <circle cx="110" cy="110" r={R - 11} fill="none" stroke="rgba(45,35,44,0.04)" strokeWidth="1" />

        {/* Top Arc (Period / Coral Flow Arc) */}
        {S.mode !== "none" && arc(0, periodFrac, "url(#coralGrad)", 18)}

        {/* Bottom Arc (Fertile / Ovulation / Berry Window Arc) */}
        {showFertile && arc(fertileStartFrac, fertileEndFrac, "url(#berryGrad)", 18)}

        {/* Secondary Phase Arc if not overlapping */}
        {!showFertile && arc(0.45, 0.75, "url(#berryGrad)", 18)}

        {/* Center White Elevated Disk */}
        <circle cx="110" cy="110" r="58" fill="#FFFFFF" filter="url(#centerShadow)" />

        {/* Center Content Typography */}
        <text
          x="110"
          y="88"
          textAnchor="middle"
          fill="#847683"
          fontSize="12.5"
          fontWeight="500"
          fontFamily="var(--font-body)"
        >
          Day
        </text>

        <text
          x="110"
          y="126"
          textAnchor="middle"
          fill="#2D232C"
          fontSize="40"
          fontWeight="800"
          fontFamily="var(--font-body)"
        >
          {displayDay}
        </text>

        <text
          x="110"
          y="145"
          textAnchor="middle"
          fill="#2D232C"
          fontSize="13"
          fontWeight="600"
          fontFamily="var(--font-body)"
        >
          {phaseName}
        </text>

        {/* Floating Interactive Pink "+" Pill Button at Current Day Angle */}
        <g
          transform={`translate(${dotX}, ${dotY})`}
          onClick={() => actions.goLog(I(TD()))}
          style={{ cursor: "pointer" }}
          aria-label="Tap to quick log symptoms for today"
        >
          <circle cx="0" cy="0" r="16" fill="url(#berryGrad)" filter="url(#plusGlow)" />
          {/* Inner white plus icon */}
          <path
            d="M-5 0h10M0 -5v10"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
