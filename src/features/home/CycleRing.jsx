/**
 * CycleSideChick — Cycle Ring SVG Component
 * Smooth draw-in animation, phase ambient glow, accessible SVG ring.
 */

import React, { useEffect, useState } from "react";

export function CycleRing({ stats, day, S }) {
  const R = 66;
  const C = 2 * Math.PI * R;
  const A = stats.avg || 28;
  const safeDay = Math.max(1, day);
  const frac = Math.min(1, Math.max(0, (safeDay - 1) / A));
  const ang = frac * 2 * Math.PI - Math.PI / 2;
  const dotX = (85 + R * Math.cos(ang)).toFixed(1);
  const dotY = (85 + R * Math.sin(ang)).toFixed(1);

  // Animated count-up effect on mount
  const [displayDay, setDisplayDay] = useState(1);
  useEffect(() => {
    let start = 1;
    const duration = 600;
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

  const arc = (fromFrac, toFrac, color, width = 12, dash = "") => {
    const len = Math.max(0, toFrac - fromFrac) * C;
    const off = -fromFrac * C;
    return (
      <circle
        cx="85"
        cy="85"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash || `${len} ${C}`}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 85 85)"
        style={{
          transition: "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1), stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
    );
  };

  const periodFrac = Math.min(1, (S.pl || 5) / A);
  const showFertile = (S.mode === "natural" || S.mode === "ttc") && stats.fertileStart && stats.fertileEnd && S.showFertile !== 0;
  const fertileStartFrac = showFertile ? Math.max(0, (stats.fertileStart - (stats.nextPred - A)) / A) : 0;
  const fertileEndFrac = showFertile ? Math.min(1, (stats.fertileEnd - (stats.nextPred - A)) / A) : 0;
  const ovFrac = showFertile ? Math.max(0, Math.min(1, (A - (stats.ll || 14)) / A)) : 0;
  const ovAng = ovFrac * 2 * Math.PI - Math.PI / 2;
  const ovX = (85 + R * Math.cos(ovAng)).toFixed(1);
  const ovY = (85 + R * Math.sin(ovAng)).toFixed(1);

  const follEnd = showFertile ? fertileStartFrac : 0.5;
  const lutStart = showFertile ? fertileEndFrac : 0.5;

  return (
    <div className="ring-wrap" role="img" aria-label={`Cycle day ${safeDay} of estimated ${A} days`}>
      <svg viewBox="0 0 170 170" className="ring">
        {/* Background Track */}
        <circle cx="85" cy="85" r={R} fill="none" stroke="var(--border-subtle)" strokeWidth="12" />

        {/* Follicular Phase Arc */}
        {S.mode !== "none" && arc(periodFrac, follEnd, "var(--tint-sage-border)", 8)}

        {/* Luteal Phase Arc */}
        {S.mode !== "none" && arc(lutStart, 1, "var(--tint-peach-border)", 8)}

        {/* Fertile Window Arc */}
        {showFertile && arc(fertileStartFrac, fertileEndFrac, "var(--tint-lavender-border)", 12)}

        {/* Period Flow Arc */}
        {S.mode !== "none" && arc(0, periodFrac, "var(--berry)", 12)}

        {/* Ovulation Indicator Point on ring */}
        {showFertile && (
          <g transform={`translate(${ovX - 5}, ${ovY - 5})`} aria-label="Estimated ovulation point">
            <circle cx="5" cy="5" r="5" fill="var(--tint-lavender-bg)" stroke="var(--tint-lavender-text)" strokeWidth="1.2" />
            <path d="M5 2.5l.8 1.8 1.9.3-1.4 1.3.3 1.9L5 6.9 3.4 7.8l.3-1.9L2.3 4.6l1.9-.3z" fill="var(--tint-lavender-text)" />
          </g>
        )}

        {/* Current Cycle Day Indicator Pulse */}
        <circle cx={dotX} cy={dotY} r="12" fill="var(--berry-glow)" opacity="0.3" />
        <circle cx={dotX} cy={dotY} r="8" fill="var(--surface)" stroke="var(--plum)" strokeWidth="3.5" />
      </svg>
      <div className="ring-center">
        <span className="ring-cap">Cycle Day</span>
        <span className="ring-num">{displayDay}</span>
        <span className="ring-sub">{S.mode === "none" ? "Logged Day" : `of ~${A} days`}</span>
      </div>
    </div>
  );
}
