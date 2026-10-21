/**
 * CycleSideChick — 4-Phase Cycle Tour Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function PhaseTourModal() {
  const { ui } = useStore();
  if (!ui.tourModal) return null;

  const currentTab = ui.tourTab || 0;

  const PHASES = [
    {
      title: "1. Menstrual Phase",
      timing: "Days 1 to 5–7",
      color: "var(--tint-rose-text)",
      bg: "var(--tint-rose-bg)",
      hormones: "Estrogen & progesterone at lowest baseline",
      energy: "Reflective, restorative, inward focus",
      care: "Warm teas, cozy clothing, pelvic heat, permission to rest without guilt."
    },
    {
      title: "2. Follicular Phase",
      timing: "Days 6 to 12",
      color: "var(--tint-sage-text)",
      bg: "var(--tint-sage-bg)",
      hormones: "FSH recruits follicles; estradiol climbs steadily",
      energy: "Rising mental stamina, creativity, physical vigor",
      care: "New projects, dynamic movement, fresh nourishing meals."
    },
    {
      title: "3. Ovulatory Phase",
      timing: "Days 13 to 16",
      color: "var(--tint-lavender-text)",
      bg: "var(--tint-lavender-bg)",
      hormones: "LH surge triggers egg release; estrogen peaks",
      energy: "Peak sociability, communication, vitality",
      care: "Social connection, high-intensity workouts, fertile window awareness."
    },
    {
      title: "4. Luteal Phase",
      timing: "Days 17 to 28+",
      color: "var(--tint-peach-text)",
      bg: "var(--tint-peach-bg)",
      hormones: "Progesterone dominates, stabilizes uterine lining",
      energy: "Nesting, detail orientation, gradual slow-down",
      care: "Magnesium, regular sleep routines, boundary setting, gentle stretching."
    }
  ];

  const phase = PHASES[currentTab] || PHASES[0];

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={() => actions.closeTour()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <span className="pill-tag" style={{ background: "var(--pink-light)", color: "var(--pink)" }}>
              Interactive Tour
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "19px" }}>The 4 Hormonal Phases</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeTour()}
            aria-label="Close tour"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Phase selector tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {PHASES.map((p, idx) => {
            const isSelected = currentTab === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setTourTab(idx)}
                style={{ flex: 1, padding: "6px 4px", fontSize: "11.5px", fontWeight: isSelected ? "700" : "500" }}
              >
                P{idx + 1}
              </button>
            );
          })}
        </div>

        {/* Phase Content Card */}
        <div className="card" style={{ padding: "16px", background: phase.bg, color: phase.color, marginBottom: "16px" }}>
          <b style={{ fontSize: "16px", display: "block" }}>{phase.title}</b>
          <span style={{ fontSize: "12px", opacity: 0.9 }}>{phase.timing}</span>
          <div style={{ marginTop: "12px", fontSize: "13px", lineHeight: "1.5" }}>
            <div><b>Endocrine:</b> {phase.hormones}</div>
            <div style={{ marginTop: "6px" }}><b>Energy & Sensation:</b> {phase.energy}</div>
            <div style={{ marginTop: "6px" }}><b>Gentle Care:</b> {phase.care}</div>
          </div>
        </div>

        <button
          type="button"
          className="btn"
          style={{ width: "100%" }}
          onClick={() => {
            if (currentTab < 3) actions.setTourTab(currentTab + 1);
            else actions.closeTour();
          }}
        >
          {currentTab < 3 ? "Next Phase →" : "Got it!"}
        </button>
      </div>
    </div>
  );
}
