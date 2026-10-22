/**
 * CycleSideChick — SegmentedControl Primitive
 * Tactile sliding tab selector with real CSS transform animation & keyboard navigation.
 */

import React, { useRef, useEffect, useState } from "react";
import { Icon } from "./Icon.jsx";

export function SegmentedControl({
  items = [],
  value,
  onChange,
  ariaLabel = "Options",
  className = "",
  ...props
}) {
  const containerRef = useRef(null);
  const [thumbStyle, setThumbStyle] = useState({ transform: "translateX(0)", width: "0px" });

  const activeIndex = items.findIndex(item => item.id === value);

  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;
    const buttons = containerRef.current.querySelectorAll(".c-segmented__item");
    const target = buttons[activeIndex];
    if (target) {
      const left = target.offsetLeft;
      const width = target.offsetWidth;
      setThumbStyle({
        transform: `translateX(${left - 3}px)`,
        width: `${width}px`
      });
    }
  }, [activeIndex, items]);

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % items.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + items.length) % items.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onChange(items[nextIndex].id);
      const buttons = containerRef.current.querySelectorAll(".c-segmented__item");
      if (buttons[nextIndex]) buttons[nextIndex].focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`c-segmented ${className}`.trim()}
      role="radiogroup"
      aria-label={ariaLabel}
      {...props}
    >
      <div className="c-segmented__thumb" style={thumbStyle} aria-hidden="true" />
      {items.map((item, idx) => {
        const isActive = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`c-segmented__item ${isActive ? "c-segmented__item--active" : ""}`}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {item.icon && <Icon name={item.icon} size={16} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
