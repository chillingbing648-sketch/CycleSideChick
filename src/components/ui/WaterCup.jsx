/**
 * CycleSideChick — WaterCup Primitive
 * Interactive SVG cup with liquid-rise fill animation.
 * Tap to fill 1 cup; long-press (600ms) to empty/reset.
 */

import React, { useRef } from "react";

export function WaterCup({
  count = 0,
  goal = 8,
  onAdd,
  onReset,
  className = ""
}) {
  const timerRef = useRef(null);
  const fillPct = Math.min(100, Math.round((count / goal) * 100));
  // SVG liquid level in viewBox 0 0 36 40: cup bottom is ~y=36, top is ~y=8 (height 28)
  const liquidHeight = (fillPct / 100) * 28;
  const liquidY = 36 - liquidHeight;

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => {
      if (onReset) onReset();
      if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
      timerRef.current = null;
    }, 650);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (onAdd) onAdd();
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handlePointerCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className={`c-water ${className}`.trim()}>
      <button
        type="button"
        className="c-water__cup-btn"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-label={`Hydration tracker: ${count} of ${goal} cups logged. Tap to add cup, press and hold to reset.`}
      >
        <svg
          viewBox="0 0 36 40"
          width="36"
          height="40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="cupInnerClip">
              <path d="M7 8 L10 33 C10.5 35.5 12.5 37 15 37 L21 37 C23.5 37 25.5 35.5 26 33 L29 8 Z" />
            </clipPath>
          </defs>

          {/* Liquid fill clipped to cup interior */}
          <g clipPath="url(#cupInnerClip)">
            <rect
              x="0"
              y={liquidY}
              width="36"
              height={liquidHeight + 4}
              fill="var(--tint-sky-text, #0284C7)"
              className="c-water__liquid"
              opacity="0.85"
            />
          </g>

          {/* Glass cup outline */}
          <path
            d="M7 8 L10 33 C10.5 35.5 12.5 37 15 37 L21 37 C23.5 37 25.5 35.5 26 33 L29 8 Z"
            stroke="var(--tint-sky-text, #0284C7)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Rim highlight */}
          <path
            d="M6 8 H30"
            stroke="var(--tint-sky-text, #0284C7)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="c-water__info">
        <div className="c-water__title">Hydration Target</div>
        <div className="c-water__sub">Tap to log cup · Hold to reset</div>
      </div>

      <div className="c-water__count">
        {count} <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>/ {goal}</span>
      </div>
    </div>
  );
}
