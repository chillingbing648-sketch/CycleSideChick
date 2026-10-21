/**
 * CycleSideChick — Slider Primitive
 * Gradient-filled track, live floating value bubble, accessible range input.
 */

import React, { useState } from "react";

export function Slider({
  min = 0,
  max = 10,
  step = 1,
  value = 0,
  onChange,
  label = "",
  valueFormat = (v) => v,
  className = "",
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={`c-slider ${className}`.trim()}>
      <div className="c-slider__header">
        {label && <label className="c-slider__label">{label}</label>}
        <span className="c-slider__val">{valueFormat(value)}</span>
      </div>

      <div className="c-slider__track-wrap">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          className="c-slider__input"
          aria-label={label || "Slider input"}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={String(valueFormat(value))}
          {...props}
        />

        <div className="c-slider__rail">
          <div className="c-slider__fill" style={{ width: `${percentage}%` }} />
        </div>

        <div
          className="c-slider__thumb-visual"
          style={{ left: `${percentage}%` }}
        />

        {(isFocused || isDragging) && (
          <div
            className="c-slider__bubble"
            style={{ left: `${percentage}%` }}
            aria-hidden="true"
          >
            {valueFormat(value)}
          </div>
        )}
      </div>
    </div>
  );
}
