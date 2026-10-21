/**
 * CycleSideChick — Profile & Settings Sheet Component
 * Wrapped in SheetModal with drag-to-dismiss gesture, grouped settings cards,
 * steppers, theme switchers, PIN security, and data ledger.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { PinLock, getPrivacyLedger } from "../../core/storage.js";

export function ProfileSettingsSheet() {
  const { S } = useStore();
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
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeProfile()}
      title="Settings & Health Privacy"
      maxWidth="540px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 1. Mode Selector */}
        <Card variant="base" style={{ padding: "16px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Tracking Mode</b>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "12.5px" }}>
            Adapts predictions and medical language to your physiological situation.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
            {MODES.map(([modeKey, title, desc]) => {
              const isSelected = (S.mode || "natural") === modeKey;
              return (
                <div
                  key={modeKey}
                  onClick={() => actions.setMode(modeKey)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: isSelected ? "1.5px solid var(--berry)" : "1px solid var(--border)",
                    background: isSelected ? "var(--pink-light)" : "var(--surface)",
                    color: isSelected ? "var(--berry)" : "inherit",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <b style={{ fontSize: "13.5px", display: "block" }}>{title}</b>
                    <span className="mut" style={{ fontSize: "11.5px" }}>{desc}</span>
                  </div>
                  {isSelected && <Icon name="check" size={18} />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2. Physiological Baseline Steppers */}
        <Card variant="base" style={{ padding: "16px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Cycle Baseline Parameters</b>

          {/* Cycle Length */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Usual Cycle Length</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>21 to 45 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("cl", -1)}>-</Button>
              <span style={{ fontWeight: "700", minWidth: "36px", textAlign: "center" }}>{S.cl || 28} d</span>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("cl", 1)}>+</Button>
            </div>
          </div>

          {/* Bleeding Duration */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Bleeding Duration</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>2 to 10 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("pl", -1)}>-</Button>
              <span style={{ fontWeight: "700", minWidth: "36px", textAlign: "center" }}>{S.pl || 5} d</span>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("pl", 1)}>+</Button>
            </div>
          </div>

          {/* Luteal Phase Length */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>Luteal Phase Length</span>
              <span className="subtle" style={{ fontSize: "11px", display: "block" }}>10 to 16 days</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("ll", -1)}>-</Button>
              <span style={{ fontWeight: "700", minWidth: "36px", textAlign: "center" }}>{S.ll || 14} d</span>
              <Button variant="secondary" size="sm" onClick={() => actions.stepCycleParam("ll", 1)}>+</Button>
            </div>
          </div>
        </Card>

        {/* 3. Appearance & Experience */}
        <Card variant="base" style={{ padding: "16px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Appearance & Experience</b>

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
                  <Button
                    key={th}
                    variant={isSelected ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => actions.setTheme(th)}
                    style={{ flex: 1 }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

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
                  padding: "10px 0",
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
                  style={{ width: "22px", height: "22px", cursor: "pointer" }}
                />
              </div>
            );
          })}

          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
            <Button
              variant="secondary"
              size="sm"
              style={{ width: "100%" }}
              onClick={() => {
                actions.closeProfile();
                actions.setTab("styleguide");
              }}
            >
              View Design System v3 Styleguide
            </Button>
          </div>
        </Card>

        {/* 4. PIN Security */}
        <Card variant="base" style={{ padding: "16px" }}>
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
            <Button
              variant={isPinActive ? "danger" : "secondary"}
              size="sm"
              onClick={() => actions.togglePinLock()}
            >
              {isPinActive ? "Disable PIN" : "Enable PIN"}
            </Button>
          </div>
        </Card>

        {/* 5. Data Privacy & Local Ledger */}
        <Card variant="base" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Icon name="shield" size={18} />
            <b style={{ fontSize: "14px" }}>Privacy Ledger</b>
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "12.5px" }}>
            100% on-device storage. No telemetry, no accounts, and zero cloud backups.
          </p>

          <div style={{ fontSize: "12.5px", lineHeight: "1.6", marginBottom: "14px" }}>
            <div>Stored Periods: <b>{ledger.periodCount}</b></div>
            <div>Daily Check-in Logs: <b>{ledger.logCount}</b></div>
            <div>Journal Entries: <b>{ledger.journalCount}</b></div>
            <div>Storage Footprint: <b>{ledger.storageBytes} bytes</b></div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <Button variant="secondary" size="sm" icon="download" onClick={() => actions.exportJSON()}>
              Export JSON
            </Button>
            <Button variant="secondary" size="sm" icon="download" onClick={() => actions.exportCSV()}>
              Export CSV
            </Button>
            <label style={{ display: "inline-flex" }}>
              <input
                type="file"
                accept=".json,.csv"
                style={{ display: "none" }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    actions.importFile(e.target.files[0]);
                  }
                }}
              />
              <span className="c-btn c-btn--secondary c-btn--sm" style={{ cursor: "pointer" }}>
                <Icon name="share" size={16} />
                <span>Import Backup</span>
              </span>
            </label>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            <Button variant="danger" size="sm" icon="trash" onClick={() => actions.eraseAllData()}>
              Erase All Data Locally
            </Button>
          </div>
        </Card>
      </div>
    </SheetModal>
  );
}
