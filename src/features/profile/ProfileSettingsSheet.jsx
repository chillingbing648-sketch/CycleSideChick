/**
 * CycleSideChick — Profile & Settings Sheet Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { PinLock, getPrivacyLedger } from "../../core/storage.js";

export function ProfileSettingsSheet() {
  const { S, ui } = useStore();
  const isPinActive = PinLock.isEnabled();
  const ledger = getPrivacyLedger(S);

  const MODES = [
    ["natural", "Natural Cycle", "Predicts periods & fertile windows"],
    ["irregular", "Irregular Cycle", "Adapts with wider confidence ranges"],
    ["contraception", "Hormonal Contraception", "Hides ovulation; tracks withdrawal bleeds"],
    ["ttc", "Trying to Conceive", "Elevates fertile window & BBT tracking"],
    ["pregnancy", "Pregnancy", "Tracks gestational age & milestones"],
    ["perimenopause", "Perimenopause", "Focuses on cycle variability & comfort"]
  ];

  return (
    <div
      className="sheet-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      }}
      onClick={() => actions.closeProfile()}
    >
      <div
        className="sheet-panel view-enter"
        style={{
          background: "var(--surface-elevated)",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Profile & Settings</h2>
            <span className="subtle" style={{ fontSize: "12px" }}>100% On-Device · No Cloud</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeProfile()}
            aria-label="Close settings"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* 1. Tracker Mode Selection */}
        <div style={{ marginBottom: "20px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Tracker Mode</b>
          <div style={{ display: "grid", gap: "6px" }}>
            {MODES.map(([id, title, desc]) => {
              const isSelected = (S.mode || "natural") === id;
              return (
                <div
                  key={id}
                  className={`card ${isSelected ? "tint-rose" : ""}`}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--pink)" : "1px solid var(--border)"
                  }}
                  onClick={() => actions.setMode(id)}
                >
                  <b style={{ fontSize: "13.5px" }}>{title}</b>
                  <p className="mut" style={{ margin: "2px 0 0", fontSize: "12px" }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Physiological Parameters */}
        <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Cycle Parameters</b>

          {/* Cycle Length */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Typical Cycle Length</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>18 to 45 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("cl", -1)}>-</button>
              <span style={{ fontWeight: "700", minWidth: "32px", textAlign: "center" }}>{S.cl || 28} d</span>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("cl", 1)}>+</button>
            </div>
          </div>

          {/* Period Duration */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Bleeding Duration</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>2 to 10 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("pl", -1)}>-</button>
              <span style={{ fontWeight: "700", minWidth: "32px", textAlign: "center" }}>{S.pl || 5} d</span>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("pl", 1)}>+</button>
            </div>
          </div>

          {/* Luteal Phase Length */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Luteal Phase Length</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>10 to 16 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("ll", -1)}>-</button>
              <span style={{ fontWeight: "700", minWidth: "32px", textAlign: "center" }}>{S.ll || 14} d</span>
              <button type="button" className="icon-btn sm" onClick={() => actions.stepCycleParam("ll", 1)}>+</button>
            </div>
          </div>
        </div>

        {/* 3. Theme & Preferences */}
        <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Appearance & Experience</b>

          {/* Theme Selector */}
          <div style={{ marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Theme</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                ["system", "System"],
                ["light", "Light"],
                ["dark", "Dark"]
              ].map(([th, label]) => {
                const isSelected = (S.theme || "system") === th;
                return (
                  <button
                    key={th}
                    type="button"
                    className={`chip ${isSelected ? "active" : ""}`}
                    onClick={() => actions.setTheme(th)}
                    style={{ flex: 1, padding: "6px", fontSize: "12.5px" }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          {[
            ["motion", "Fluid Animations", "Tactile spring motion & transitions"],
            ["haptics", "Haptic Feedback", "Subtle vibrations on interaction"],
            ["showFertile", "Fertility Indicators", "Display fertile window estimates on calendar"],
            ["careAlerts", "Clinical Alerts", "Gentle prompts for prolonged cycles or high pain"],
            ["waterGoal", "Hydration Target", "Enable daily water cup tracker"]
          ].map(([key, title, subtitle]) => {
            const isActive = S[key] !== 0;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderTop: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "600", display: "block" }}>{title}</span>
                  <span className="subtle" style={{ fontSize: "11px" }}>{subtitle}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => actions.togglePref(key)}
                  role="switch"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
              </div>
            );
          })}
        </div>

        {/* 4. PIN Security */}
        <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="lock" size={18} />
                <b style={{ fontSize: "14px" }}>PIN Passcode Protection</b>
              </div>
              <span className="subtle" style={{ fontSize: "12px", display: "block", marginTop: "2px" }}>
                {isPinActive ? "PIN lock is enabled and active" : "Protect your health journal with a 4-digit code"}
              </span>
            </div>
            <button
              type="button"
              className="btn g sm"
              onClick={() => actions.togglePinLock()}
            >
              {isPinActive ? "Disable PIN" : "Enable PIN"}
            </button>
          </div>
        </div>

        {/* 5. Privacy Ledger */}
        <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>Transparent Privacy Ledger</b>
          <p className="mut" style={{ margin: "0 0 10px", fontSize: "12px" }}>
            Exact overview of every piece of data stored locally in your browser:
          </p>
          <div style={{ fontSize: "12px", maxHeight: "140px", overflowY: "auto", background: "var(--surface-alt)", padding: "8px", borderRadius: "8px" }}>
            {ledger && ledger.items ? (
              ledger.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontWeight: "600" }}>{it.key}</span>
                  <span className="subtle">{it.desc}</span>
                </div>
              ))
            ) : (
              <div>Records: {S.periods ? S.periods.length : 0} cycles, {Object.keys(S.logs || {}).length} daily logs</div>
            )}
          </div>
        </div>

        {/* 6. Data Backup & Erase */}
        <div className="card" style={{ padding: "16px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Data Management & Erase</b>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" className="btn g" onClick={() => actions.exportCSV()}>
              <Icon name="download" size={16} />
              <span>Export CSV (Spreadsheet)</span>
            </button>
            <button type="button" className="btn g" onClick={() => actions.exportJSON()}>
              <Icon name="download" size={16} />
              <span>Export JSON Backup</span>
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: "var(--phase-menstrual)", color: "#FFFFFF", marginTop: "8px" }}
              onClick={() => {
                if (window.confirm("Are you sure you want to completely erase all logged health data from this device? This action cannot be undone.")) {
                  actions.wipeAllData();
                }
              }}
            >
              <Icon name="trash" size={16} />
              <span>Erase All Data from Device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
