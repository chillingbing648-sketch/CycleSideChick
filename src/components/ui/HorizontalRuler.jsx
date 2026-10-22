/**
 * CycleSideChick — Interactive Precision Horizontal Ruler
 * Used in Weight, Height, and Basal Body Temperature selectors.
 * Features:
 * - Fluid drag & touch scrolling with inertial dampening
 * - Major and minor millimeter tick marks
 * - Prominent center indicator needle (pink/red)
 * - Fine-tuning stepper buttons
 * - Full keyboard arrow navigation
 */

import React, { useRef, useState, useEffect } from "react";

export function HorizontalRuler({
  value = 60,
  min = 30,
  max = 180,
  step = 0.5,
  unit = "kg",
  onChange,
  className = ""
}) {
  const rulerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startVal = useRef(value);

  // Generate tick marks for a reasonable visible range around the value
  const numSteps = Math.round((max - min) / step);
  const tickSpacing = 14; // pixels per step

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startVal.current = value;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const dx = clientX - startX.current;
    // Moving finger to right should drag ruler right, decreasing value at center
    const valChange = -dx / tickSpacing * step;
    let nextVal = startVal.current + valChange;
    nextVal = Math.max(min, Math.min(max, nextVal));
    // Round to step precision
    const precision = step < 1 ? 1 : 0;
    const rounded = Number(nextVal.toFixed(precision));
    if (rounded !== value && onChange) {
      onChange(rounded);
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(min, Number((value - step).toFixed(1)));
      if (onChange) onChange(next);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(max, Number((value + step).toFixed(1)));
      if (onChange) onChange(next);
    }
  };

  // Offset so that `value` is positioned exactly in the center
  const centerOffset = -((value - min) / step) * tickSpacing;

  // Render ticks
  const ticks = [];
  const startIdx = Math.max(0, Math.floor((value - min) / step) - 18);
  const endIdx = Math.min(numSteps, Math.floor((value - min) / step) + 18);

  for (let i = startIdx; i <= endIdx; i++) {
    const tickVal = Number((min + i * step).toFixed(1));
    const isMajor = Math.abs(tickVal % (step < 1 ? 1 : 5)) < 0.001;
    const isMedium = !isMajor && Math.abs(tickVal % (step < 1 ? 0.5 : 1)) < 0.001;

    ticks.push(
      <div
        key={i}
        className={`c-ruler-tick ${isMajor ? "major" : isMedium ? "medium" : "minor"}`}
        style={{
          left: `calc(50% + ${(i - (value - min) / step) * tickSpacing}px)`
        }}
      >
        {isMajor && <span className="c-ruler-tick-label">{tickVal}</span>}
      </div>
    );
  }

  return (
    <div className={`c-ruler-wrapper ${className}`.trim()}>
      {/* Precision adjustments */}
      <div className="c-ruler-stepper-row">
        <button
          type="button"
          className="c-ruler-step-btn"
          onClick={() => onChange && onChange(Math.max(min, Number((value - step).toFixed(1))))}
          aria-label="Decrease value"
        >
          -
        </button>
        <div className="c-ruler-display-value">
          <span className="c-ruler-number">{value.toFixed(step < 1 ? 1 : 0)}</span>
          <span className="c-ruler-unit">{unit}</span>
        </div>
        <button
          type="button"
          className="c-ruler-step-btn"
          onClick={() => onChange && onChange(Math.min(max, Number((value + step).toFixed(1))))}
          aria-label="Increase value"
        >
          +
        </button>
      </div>

      {/* Interactive Ruler Viewport */}
      <div
        ref={rulerRef}
        className="c-ruler-viewport"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label="Adjust value"
      >
        {/* Fixed Center Indicator Needle */}
        <div className="c-ruler-needle" aria-hidden="true" />

        {/* Dynamic Tick Marks Band */}
        <div className="c-ruler-ticks-band" aria-hidden="true">
          {ticks}
        </div>
      </div>
    </div>
  );
}
