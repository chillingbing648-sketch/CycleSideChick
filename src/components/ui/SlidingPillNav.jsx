/**
 * CycleSideChick — Component 09: Soft Sliding-Pill Navigation
 * Inspired by React Bits & modern iOS fluid navigations.
 * 
 * Features:
 * - Fluid sliding active pill indicator moving horizontally between tabs.
 * - Rounded custom SVG icons for Home, Calendar, Log, Insights, Journal.
 * - Dynamic tab measurement via refs.
 * - Haptic feedback on item selection.
 * - Accessible keyboard navigation & ARIA roles.
 * - Respects prefers-reduced-motion.
 */

import React, { useRef, useEffect, useState } from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "./Icon.jsx";

export function SlidingPillNav({ activeTab = "home", motionPref = 1 }) {
  const containerRef = useRef(null);
  const itemsRef = useRef({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const NAV_ITEMS = [
    { key: "home", label: "Home", icon: "home" },
    { key: "calendar", label: "Calendar", icon: "calendar" },
    { key: "log", label: "Log", icon: "plus", isAction: true },
    { key: "insights", label: "Insights", icon: "insights" },
    { key: "care", label: "Journal", icon: "book" }
  ];

  // Measure and align sliding pill to active tab
  const updatePill = () => {
    const activeKey = activeTab === "styleguide" ? "home" : activeTab;
    const activeEl = itemsRef.current[activeKey];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const left = elRect.left - containerRect.left;
      const width = elRect.width;
      setPillStyle({
        left,
        width,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [activeTab]);

  const handleNavClick = (item) => {
    if (item.key === "care") {
      actions.setCareTab("journal");
      actions.setTab("care");
    } else {
      actions.setTab(item.key);
    }
  };

  const prefersReduced = motionPref === 0 ||
    (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  return (
    <nav
      ref={containerRef}
      className="v-sliding-nav-bar"
      aria-label="Main Navigation"
    >
      {/* Gliding Active Pill Background */}
      <div
        className="v-sliding-pill-indicator"
        style={{
          transform: `translateX(${pillStyle.left}px)`,
          width: `${pillStyle.width}px`,
          opacity: pillStyle.opacity,
          transition: prefersReduced
            ? "none"
            : "transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1), width 0.22s ease, opacity 0.15s ease"
        }}
        aria-hidden="true"
      />

      {/* Nav Buttons */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            ref={(el) => (itemsRef.current[item.key] = el)}
            type="button"
            data-tab={item.key}
            className={`v-sliding-nav-item ${isActive ? "active" : ""} ${item.isAction ? "action-btn" : ""}`}
            onClick={() => handleNavClick(item)}
            aria-current={isActive ? "page" : "false"}
            aria-label={item.label}
          >
            <div className="v-sliding-icon-wrap">
              <Icon name={item.icon} size={item.isAction ? 20 : 21} />
            </div>
            <span className="v-sliding-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
