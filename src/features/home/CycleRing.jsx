/**
 * CycleSideChick — Component 01: Living Cycle Ring (Dashboard)
 * 
 * Features:
 * - Animated circular progress ring showing cycle day, phase, and relevant dates.
 * - Uses actual cycle data and accurate calculations.
 * - Robust handling for unknown/incomplete history without fabricating predictions.
 * - Suppresses fertile/ovulation arcs when contraception mode is active.
 * - Tactile floating pink "+" pill button riding the current cycle day angle.
 * - Elevated center disk with crisp typography, phase badge, and context dates.
 * - Respects prefers-reduced-motion and S.motion settings.
 */

import React, { useEffect, useState } from "react";
import { actions } from "../../app/actions.js";
import { TD, I, fmt } from "../../core/engine.js";

export function CycleRing({ stats = {}, day = 1, S = {}, phaseName = "Natural Cycle" }) {
  const hasHistory = Boolean(stats && stats.n > 0 && stats.cur);
  const R = 78; // Radius of mid-track
  const C = 2 * Math.PI * R;
  const A = stats.avg || S.cl || 28;
  const todayDn = TD();
  const safeDay = hasHistory ? Math.max(1, Math.min(day, A + 14)) : 1;
  const frac = hasHistory ? Math.min(1, Math.max(0, (safeDay - 1) / A)) : 0;
  const ang = frac * 2 * Math.PI - Math.PI / 2;
  const dotX = (110 + R * Math.cos(ang)).toFixed(1);
  const dotY = (110 + R * Math.sin(ang)).toFixed(1);

  // Motion preference check
  const prefersReducedMotion =
    S.motion === 0 ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Animated count-up effect on mount (bypassed if reduced motion)
  const [displayDay, setDisplayDay] = useState(prefersReducedMotion ? safeDay : 1);

  useEffect(() => {
    if (prefersReducedMotion || !hasHistory) {
      setDisplayDay(safeDay);
      return;
    }
    let start = 1;
    const duration = 450;
    const stepTime = Math.max(16, Math.floor(duration / Math.max(1, safeDay)));
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
  }, [safeDay, hasHistory, prefersReducedMotion]);

  const arc = (fromFrac, toFrac, strokeUrl, width = 16, opacity = 1, strokeDash = "") => {
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
        strokeOpacity={opacity}
        strokeDasharray={strokeDash || `${len} ${C}`}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 110 110)"
        style={{
          transition: prefersReducedMotion
            ? "none"
            : "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
    );
  };

  // Calculations for real cycle arcs
  const periodFrac = hasHistory ? Math.min(1, (S.pl || 5) / A) : 0;
  const showFertile =
    hasHistory &&
    (S.mode === "natural" || S.mode === "ttc") &&
    stats.fertileStart &&
    stats.fertileEnd &&
    S.showFertile !== 0 &&
    stats.nextPred;

  let fertileStartFrac = 0.38;
  let fertileEndFrac = 0.62;
  if (showFertile) {
    const cycleStartDn = stats.cur ? stats.cur.s : todayDn - safeDay + 1;
    fertileStartFrac = Math.max(0, Math.min(1, (stats.fertileStart - cycleStartDn) / A));
    fertileEndFrac = Math.max(fertileStartFrac, Math.min(1, (stats.fertileEnd - cycleStartDn) / A));
  }

  // Relevant dates label calculation without fabricating
  let dateContext = "Tap + to log period";
  if (hasHistory) {
    if (stats.nextPred) {
      const diff = stats.nextPred - todayDn;
      if (diff === 0) dateContext = "Period due today";
      else if (diff > 0 && diff <= 14) dateContext = `Next period: ~${diff}d`;
      else if (diff < 0) dateContext = `~${Math.abs(diff)}d past est.`;
      else dateContext = `Est. ~${fmt(stats.nextPred, { month: "short", day: "numeric" })}`;
    } else if (stats.cur && stats.cur.s) {
      dateContext = `Started ${fmt(stats.cur.s, { month: "short", day: "numeric" })}`;
    } else {
      dateContext = `Day ${safeDay} of ~${A}d`;
    }
  }

  const phaseLabel = hasHistory ? phaseName : "Cycle Setup";
  const dayLabel = hasHistory ? displayDay : "—";

  return (
    <div
      className="v-reference-ring-wrap"
      role="region"
      aria-label={`Living Cycle Ring: Cycle day ${hasHistory ? safeDay : "unset"}, ${phaseLabel}. ${dateContext}`}
    >
      <svg viewBox="0 0 220 220" className="v-reference-ring-svg">
        <defs>
          {/* Vivid Rose Pink Gradient for Period Arc */}
          <linearGradient id="rosePeriodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF72A7" />
            <stop offset="100%" stopColor="#FF5B99" />
          </linearGradient>

          {/* Fertile / Ovulation Teal Gradient */}
          <linearGradient id="lavenderFertileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38E1B0" />
            <stop offset="100%" stopColor="#20C997" />
          </linearGradient>

          {/* Follicular Amber Gradient */}
          <linearGradient id="peachFollicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB74D" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>

          {/* Luteal Purple Gradient */}
          <linearGradient id="mintLutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BA68C8" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>

          {/* Primary Gradient for FAB Plus Button */}
          <linearGradient id="fabPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF72A7" />
            <stop offset="100%" stopColor="#FF5B99" />
          </linearGradient>

          {/* Active cycle day ring glow */}
          <filter id="activeTrackGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF5B99" floodOpacity="0.35" />
          </filter>

          {/* Soft outer glow for the plus button */}
          <filter id="plusGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF5B99" floodOpacity="0.4" />
          </filter>

          {/* Recessed bevel filter for outer circular groove */}
          <filter id="grooveBevel" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2E2433" floodOpacity="0.05" />
          </filter>

          {/* Soft elevation for central disk */}
          <filter id="centerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2E2433" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Outer Circular Dish (Themed Surface) */}
        <circle cx="110" cy="110" r="102" fill="var(--surface-raised, #FFFFFF)" filter="url(#grooveBevel)" />

        {/* Recessed Circular Trough Groove */}
        <circle cx="110" cy="110" r={R} fill="none" stroke="var(--surface-groove, #F0E8EE)" strokeWidth="20" />
        <circle cx="110" cy="110" r={R + 10} fill="none" stroke="var(--border-subtle, rgba(46,36,51,0.04))" strokeWidth="1" />
        <circle cx="110" cy="110" r={R - 10} fill="none" stroke="var(--border-subtle, rgba(46,36,51,0.04))" strokeWidth="1" />

        {/* --- Phase Arcs (Rendered if history exists) --- */}
        {hasHistory && S.mode !== "none" && (
          <>
            {/* 1. Menstrual Flow Arc */}
            {periodFrac > 0 && arc(0, periodFrac, "url(#rosePeriodGrad)", 16)}

            {/* 2. Fertile / Ovulation Arc (Suppressed in contraception mode) */}
            {showFertile && arc(fertileStartFrac, fertileEndFrac, "url(#lavenderFertileGrad)", 16)}

            {/* 3. Follicular bridge if space exists */}
            {showFertile && fertileStartFrac > periodFrac + 0.05 && (
              arc(periodFrac + 0.02, fertileStartFrac - 0.02, "url(#peachFollicularGrad)", 10, 0.45)
            )}

            {/* 4. Luteal bridge following fertile window */}
            {showFertile && fertileEndFrac < 0.95 && (
              arc(fertileEndFrac + 0.02, 0.98, "url(#mintLutealGrad)", 10, 0.45)
            )}
          </>
        )}

        {/* If no history yet: subtle welcoming dotted guide */}
        {!hasHistory && (
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="var(--border-strong, #E2D5DF)"
            strokeWidth="3"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
          />
        )}

        {/* Active Progress Overlay Arc (from day 1 up to current day) */}
        {hasHistory && frac > 0 && (
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="var(--primary, #C9708C)"
            strokeWidth="3.5"
            strokeDasharray={`${frac * C} ${C}`}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            filter="url(#activeTrackGlow)"
            style={{
              transition: prefersReducedMotion
                ? "none"
                : "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          />
        )}

        {/* Center Themed Elevated Disk */}
        <circle cx="110" cy="110" r="58" fill="var(--surface-raised, #FFFFFF)" filter="url(#centerShadow)" />

        {/* Center Content Typography */}
        <text
          x="110"
          y="82"
          textAnchor="middle"
          fill="var(--text-muted, #7A6E80)"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-body)"
          letterSpacing="0.06em"
        >
          {hasHistory ? "CYCLE DAY" : "WELCOME"}
        </text>

        <text
          x="110"
          y="118"
          textAnchor="middle"
          fill="var(--text, #2E2433)"
          fontSize="36"
          fontWeight="800"
          fontFamily="var(--font-heading, 'Outfit', 'Montserrat', sans-serif)"
        >
          {dayLabel}
        </text>

        <text
          x="110"
          y="138"
          textAnchor="middle"
          fill="var(--primary, #C9708C)"
          fontSize="12.5"
          fontWeight="650"
          fontFamily="var(--font-body)"
        >
          {phaseLabel}
        </text>

        {/* Relevant Dates or Guidance Subtitle */}
        <text
          x="110"
          y="153"
          textAnchor="middle"
          fill="var(--text-muted, #7A6E80)"
          fontSize="10"
          fontWeight="500"
          fontFamily="var(--font-body)"
          letterSpacing="0.01em"
        >
          {dateContext}
        </text>

        {/* Floating Interactive Soft Rose "+" Pill Button at Current Day Angle */}
        <g
          transform={`translate(${dotX}, ${dotY})`}
          onClick={() => actions.goLog(I(TD()))}
          style={{ cursor: "pointer" }}
          aria-label="Tap to quick log symptoms for today"
        >
          <circle cx="0" cy="0" r="16" fill="url(#fabPrimaryGrad)" filter="url(#plusGlow)" />
          {/* Inner white plus icon */}
          <path
            d="M-5 0h10M0 -5v10"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
