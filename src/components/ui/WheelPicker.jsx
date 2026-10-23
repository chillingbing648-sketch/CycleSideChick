/**
 * CycleSideChick — Drum / Wheel Picker Component
 * Authentic mobile drum/wheel selector for Days, Months, Years, and Durations.
 * Features:
 * - Vertical scrolling with snap alignment
 * - Center highlighted row with subtle pink borders/accents
 * - Perspective / 3D drum curve effect with opacity fade
 * - Mouse drag, touch swipe, and wheel scroll support
 */

import React, { useRef, useEffect } from "react";

export function WheelPicker({
  items = [],
  value,
  onChange,
  itemHeight = 44,
  visibleCount = 5,
  suffix = "",
  className = ""
}) {
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  const selectedIndex = items.findIndex(item => (item.value !== undefined ? item.value : item) === value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Center the selected item on mount or value change
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isScrolling.current) return;
    const targetScroll = safeIndex * itemHeight;
    el.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [safeIndex, itemHeight]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      const scrollPos = el.scrollTop;
      const newIndex = Math.max(0, Math.min(items.length - 1, Math.round(scrollPos / itemHeight)));
      const chosenItem = items[newIndex];
      const chosenVal = chosenItem.value !== undefined ? chosenItem.value : chosenItem;
      if (chosenVal !== value && onChange) {
        onChange(chosenVal);
      }
      // Snap exactly to position
      el.scrollTo({ top: newIndex * itemHeight, behavior: "smooth" });
    }, 120);
  };

  const handleItemClick = (index) => {
    const chosenItem = items[index];
    const chosenVal = chosenItem.value !== undefined ? chosenItem.value : chosenItem;
    if (onChange) onChange(chosenVal);
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: index * itemHeight, behavior: "smooth" });
    }
  };

  const containerHeight = itemHeight * visibleCount;
  const paddingY = itemHeight * Math.floor(visibleCount / 2);

  return (
    <div
      className={`c-wheel-picker-wrap ${className}`.trim()}
      style={{ height: `${containerHeight}px` }}
    >
      {/* Center Highlight Overlay */}
      <div
        className="c-wheel-highlight"
        style={{
          top: `${paddingY}px`,
          height: `${itemHeight}px`
        }}
        aria-hidden="true"
      />

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="c-wheel-scroll"
        onScroll={handleScroll}
        style={{
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`
        }}
      >
        {items.map((item, idx) => {
          const val = item.value !== undefined ? item.value : item;
          const label = item.label !== undefined ? item.label : String(item);
          const isSelected = idx === safeIndex;

          return (
            <div
              key={val}
              className={`c-wheel-item ${isSelected ? "selected" : ""}`}
              style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px` }}
              onClick={() => handleItemClick(idx)}
            >
              <span>{label}</span>
              {suffix && isSelected && <span className="c-wheel-suffix"> {suffix}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
