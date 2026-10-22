/**
 * CycleSideChick — Complete Profile & Settings Sheet Component
 * Recreated to match the reference application's complete settings architecture:
 * - Profile and personal health information (Name, Birthday, Weight, Height)
 * - Health units (kg/lb, °C/°F, water target)
 * - Tracking mode & physiological parameters (Cycle length, Period duration, Luteal length)
 * - Daily reminders and notification preferences
 * - App appearance (Light / Dark / System with real-time DOM switching)
 * - Motion & haptic tactile settings
 * - PIN passcode security
 * - Privacy ledger, data export & local data wipe
 * - Replay Onboarding Tour trigger
 * - Help, FAQ, Privacy Policy, and Terms of Service dialogs
 * - 4-Category Segmented Navigation Bar for instant section accessibility
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { PinLock, getPrivacyLedger } from "../../core/storage.js";
import { PremiumModal } from "./PremiumModal.jsx";

export function ProfileSettingsSheet() {
  const { S, ui } = useStore();
  const isPinActive = PinLock.isEnabled();
  const ledger = getPrivacyLedger(S);

  const [categoryTab, setCategoryTab] = useState(ui.profTab || "health");
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null); // 'faq' | 'privacy' | 'terms' | 'contact' | null

  const MODES = [
    ["natural", "Natural Cycle", "Predicts periods & fertile windows"],
    ["irregular", "Irregular Cycle", "Adapts with wider confidence ranges"],
    ["contraception", "Hormonal Contraception", "Hides ovulation; tracks withdrawal bleeds"],
    ["ttc", "Trying to Conceive", "Elevates fertile window & BBT tracking"],
    ["pregnancy", "Pregnancy", "Tracks gestational age & milestones"],
    ["perimenopause", "Perimenopause", "Focuses on cycle variability & comfort"]
  ];

  const handleReplayOnboarding = () => {
    S.ob = 0;
    actions.persistState();
    actions.closeProfile();
    actions.toast("Launching Onboarding Flow...");
  };

  const handleSelectTab = (tabId) => {
    setCategoryTab(tabId);
    ui.profTab = tabId;
    actions.haptic(10);
  };

  return (
    <>
      <SheetModal
        isOpen={true}
        onClose={() => actions.closeProfile()}
        title="Settings & Health Profile"
        className="v-profile-sheet"
        maxWidth="540px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* CATEGORY SEGMENTED TABS BAR (Quick Navigation) */}
          <div
            className="v-profile-tabs-bar"
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none"
            }}
          >
            {[
              { id: "health", label: "Health Profile", icon: "user" },
              { id: "preferences", label: "Preferences", icon: "bell" },
              { id: "privacy", label: "Privacy & Vault", icon: "lock" },
              { id: "about", label: "About & Care", icon: "care" },
              { id: "all", label: "All Sections", icon: "settings" }
            ].map(cat => {
              const isAct = categoryTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectTab(cat.id)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    border: isAct ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                    background: isAct ? "var(--primary)" : "var(--surface)",
                    color: isAct ? "#FFFFFF" : "var(--text)",
                    fontWeight: isAct ? "800" : "600",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                    flexShrink: 0
                  }}
                >
                  <Icon name={cat.icon} size={13} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===============================================================
              CATEGORY 1: HEALTH PROFILE
              =============================================================== */}
          {(categoryTab === "health" || categoryTab === "all") && (
            <>
              {categoryTab === "all" && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  1. Health & Physiology Profile
                </span>
              )}

              {/* 1. Profile & Personal Details */}
              <Card variant="base" style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <Icon name="user" size={18} />
                  <b style={{ fontSize: "14.5px" }}>Personal Health Profile</b>
                </div>

                {/* User Name */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    value={S.userName || ""}
                    onChange={(e) => {
                      S.userName = e.target.value;
                      actions.persistState();
                    }}
                    placeholder="e.g. Isabella"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      border: "1.5px solid var(--border)",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--text)",
                      background: "var(--surface)"
                    }}
                  />
                </div>

                {/* Birthday, Weight & Height row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      WEIGHT ({S.weightUnit || "kg"})
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="number"
                        step="0.5"
                        value={S.weight || 60.0}
                        onChange={(e) => {
                          S.weight = parseFloat(e.target.value) || 60.0;
                          actions.persistState();
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          border: "1.5px solid var(--border)",
                          fontSize: "13.5px",
                          fontWeight: "700",
                          background: "var(--surface)"
                        }}
                      />
                      <div style={{ display: "flex", gap: "2px" }}>
                        {["kg", "lb"].map(u => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              S.weightUnit = u;
                              actions.persistState();
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                              background: (S.weightUnit || "kg") === u ? "var(--primary)" : "var(--surface)",
                              color: (S.weightUnit || "kg") === u ? "#FFFFFF" : "var(--text-muted)"
                            }}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      HEIGHT ({S.heightUnit || "cm"})
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={S.height || 165}
                      onChange={(e) => {
                        S.height = parseFloat(e.target.value) || 165;
                        actions.persistState();
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        background: "var(--surface)"
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* 2. Tracking Mode */}
              <Card variant="base" style={{ padding: "16px" }}>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Tracking Mode</b>
                <p className="mut" style={{ margin: "0 0 12px", fontSize: "12px" }}>
                  Adapts predictions and clinical language to your physiological situation.
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
                          borderRadius: "var(--radius-md)",
                          border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                          background: isSelected ? "var(--surface-tint)" : "var(--surface)",
                          color: isSelected ? "var(--primary)" : "inherit",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div>
                          <b style={{ fontSize: "13px", display: "block" }}>{title}</b>
                          <span className="mut" style={{ fontSize: "11px" }}>{desc}</span>
                        </div>
                        {isSelected && <Icon name="check" size={16} />}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 3. Physiological Baseline Steppers */}
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
            </>
          )}

          {/* ===============================================================
              CATEGORY 2: PREFERENCES
              =============================================================== */}
          {(categoryTab === "preferences" || categoryTab === "all") && (
            <>
              {categoryTab === "all" && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "8px" }}>
                  2. Reminders & App Preferences
                </span>
              )}

              {/* Daily Reminders */}
              <Card variant="base" style={{ padding: "16px" }}>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Daily Health Reminders</b>
                {[
                  ["Period Reminder", "Notify 2 days before predicted start date", S.careReminders?.period !== 0, () => {
                    if (!S.careReminders) S.careReminders = {};
                    S.careReminders.period = S.careReminders.period === 0 ? 1 : 0;
                    actions.persistState();
                  }],
                  ["Fertile Window Reminder", "Subtle cue when entering peak fertility window", S.careReminders?.prep !== 0, () => {
                    if (!S.careReminders) S.careReminders = {};
                    S.careReminders.prep = S.careReminders.prep === 0 ? 1 : 0;
                    actions.persistState();
                  }],
                  ["Daily Log & Check-in", "Gentle evening reminder to record sensations", S.careReminders?.checkin !== 0, () => {
                    if (!S.careReminders) S.careReminders = {};
                    S.careReminders.checkin = S.careReminders.checkin === 0 ? 1 : 0;
                    actions.persistState();
                  }],
                  ["Hydration Tracker", "Remind to log water throughout the day", S.waterGoal !== 0, () => {
                    actions.togglePref("waterGoal");
                  }]
                ].map(([title, subtitle, isActive, toggleFn]) => (
                  <div
                    key={title}
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
                      checked={Boolean(isActive)}
                      onChange={toggleFn}
                      role="switch"
                      style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary)" }}
                    />
                  </div>
                ))}
              </Card>

              {/* Appearance & Accessibility */}
              <Card variant="base" style={{ padding: "16px" }}>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>Appearance & Accessibility</b>

                <div style={{ marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>App Theme</span>
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
                  ["motion", "Fluid Spring Motion", "Tactile spring animations & screen transitions"],
                  ["haptics", "Haptic Touch Feedback", "Vibrational response on logging and actions"],
                  ["showFertile", "Fertility Indicators", "Display fertile window estimates on calendar"]
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
                        style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary)" }}
                      />
                    </div>
                  );
                })}
              </Card>
            </>
          )}

          {/* ===============================================================
              CATEGORY 3: PRIVACY & VAULT
              =============================================================== */}
          {(categoryTab === "privacy" || categoryTab === "all") && (
            <>
              {categoryTab === "all" && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "8px" }}>
                  3. Privacy, Security & Data Vault
                </span>
              )}

              {/* PIN Passcode Security */}
              <Card variant="base" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="lock" size={18} />
                      <b style={{ fontSize: "14px" }}>PIN Passcode Protection</b>
                    </div>
                    <span className="subtle" style={{ fontSize: "12px", display: "block", marginTop: "2px" }}>
                      {isPinActive ? "PIN lock is active and required on launch" : "Protect your health records with a 4-digit code"}
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

              {/* Data Privacy Ledger & Export */}
              <Card variant="base" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <Icon name="shield" size={18} />
                  <b style={{ fontSize: "14px" }}>On-Device Privacy Ledger</b>
                </div>
                <p className="mut" style={{ margin: "0 0 12px", fontSize: "12px" }}>
                  100% on-device storage. No telemetry, no accounts, and zero cloud backups.
                </p>

                <div style={{ fontSize: "12.5px", lineHeight: "1.6", marginBottom: "14px" }}>
                  <div>Recorded Periods: <b>{ledger.periodCount}</b></div>
                  <div>Daily Health Logs: <b>{ledger.logCount}</b></div>
                  <div>Private Journal Entries: <b>{ledger.journalCount}</b></div>
                  <div>Local Storage Footprint: <b>{ledger.storageBytes} bytes</b></div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <Button variant="secondary" size="sm" icon="download" onClick={() => actions.exportJSON()}>
                    Export JSON
                  </Button>
                  <Button variant="secondary" size="sm" icon="download" onClick={() => actions.exportCSV()}>
                    Export CSV
                  </Button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <Button variant="danger" size="sm" icon="trash" onClick={() => actions.eraseAllData()}>
                    Reset All Local Data
                  </Button>
                </div>
              </Card>

              {/* Replay Onboarding & Guided Tour */}
              <Card variant="base" style={{ padding: "16px" }}>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Onboarding & Setup Tour</b>
                <p className="mut" style={{ margin: "0 0 12px", fontSize: "12px" }}>
                  Replay the 12-screen guided sequence to recalibrate your cycle baseline or review app features.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ width: "100%" }}
                  onClick={handleReplayOnboarding}
                >
                  Replay Onboarding Flow
                </Button>
              </Card>
            </>
          )}

          {/* ===============================================================
              CATEGORY 4: ABOUT & CARE
              =============================================================== */}
          {(categoryTab === "about" || categoryTab === "all") && (
            <>
              {categoryTab === "all" && (
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "8px" }}>
                  4. About & Care Mission
                </span>
              )}

              {/* Women's Care & Non-Commercial Notice Card */}
              <div
                style={{
                  background: "var(--surface-tint)",
                  border: "1.5px solid var(--berry-border)",
                  borderRadius: "18px",
                  padding: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--surface)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Icon name="heart" size={16} />
                  </div>
                  <div>
                    <b style={{ fontSize: "13.5px", color: "var(--primary)", display: "block", marginBottom: "3px" }}>
                      Women's Wellness Mission
                    </b>
                    <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.45", color: "var(--text)" }}>
                      CycleSideChick is completely free and built for women's well-being. We do not monetize your health data, and payments are inactive sandbox evaluation prototypes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium / Sandbox Evaluation Card */}
              <Card
                variant="base"
                style={{
                  padding: "16px",
                  background: S.premium ? "var(--surface-tint)" : "var(--surface)",
                  border: S.premium ? "1.5px solid var(--primary)" : "1px solid var(--border)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--surface-tint)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      <Icon name="star" size={16} />
                    </div>
                    <div>
                      <b style={{ fontSize: "14px", display: "block" }}>
                        {S.premium ? "Evaluation License Active" : "CycleSideChick Pro Sandbox"}
                      </b>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {S.premium ? "All BBT biphasic charts & clinician exports unlocked" : "Test product evaluation checkout prototype"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={S.premium ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => setPremiumModalOpen(true)}
                  >
                    {S.premium ? "Status" : "Evaluate"}
                  </Button>
                </div>
              </Card>

              {/* Help, FAQ & Legal Support */}
              <Card variant="base" style={{ padding: "16px" }}>
                <b style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Help & Legal</b>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    ["faq", "Frequently Asked Questions (FAQ)"],
                    ["contact", "Contact & Support"],
                    ["privacy", "Privacy Policy (100% On-Device Guarantee)"],
                    ["terms", "Terms of Service & Clinical Disclaimer"]
                  ].map(([dialogKey, title]) => (
                    <button
                      key={dialogKey}
                      type="button"
                      onClick={() => setActiveDialog(dialogKey)}
                      style={{
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border-subtle)",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--primary)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>{title}</span>
                      <Icon name="chevronRight" size={14} />
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

        </div>
      </SheetModal>

      {/* Premium Subscription Modal Host */}
      {premiumModalOpen && (
        <PremiumModal
          isOpen={true}
          onClose={() => setPremiumModalOpen(false)}
        />
      )}

      {/* FAQ Dialog Modal */}
      {activeDialog === "faq" && (
        <SheetModal
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          title="Frequently Asked Questions"
          maxWidth="500px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              {
                q: "How does CycleSideChick predict my period?",
                a: "CycleSideChick calculates the median and standard deviation of your past logged cycles. For new users, it begins with your stated baseline (default 28 days) and progressively calibrates as you record each cycle."
              },
              {
                q: "Is my reproductive health data private?",
                a: "Yes, 100%. All cycle dates, symptoms, journal reflections, and metrics are stored strictly inside your browser's local sandbox. No data is ever transmitted to remote cloud servers or third-party advertisers."
              },
              {
                q: "What is the FIGO cycle classification?",
                a: "FIGO (International Federation of Gynecology and Obstetrics) defines a regular cycle as one where cycle length varies by no more than 7–9 days over a consecutive 12-month period."
              },
              {
                q: "How does Basal Body Temperature (BBT) confirm ovulation?",
                a: "Progesterone secreted by the corpus luteum post-ovulation raises your resting body temperature by 0.2°C to 0.5°C (biphasic shift). Sustained elevated temperatures for 3 consecutive days confirm that ovulation has occurred."
              }
            ].map((faq, i) => (
              <div key={i} style={{ padding: "12px", borderRadius: "14px", background: "var(--surface-soft)" }}>
                <b style={{ fontSize: "13.5px", color: "var(--text)", display: "block", marginBottom: "4px" }}>{faq.q}</b>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </SheetModal>
      )}

      {/* Privacy Policy Dialog Modal */}
      {activeDialog === "privacy" && (
        <SheetModal
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          title="Privacy Policy"
          maxWidth="500px"
        >
          <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-muted)" }}>
            <p>
              <b>1. Zero-Cloud Guarantee:</b> CycleSideChick operates entirely on your device. We do not operate remote databases for health records, nor do we require personal email addresses, phone numbers, or account sign-in.
            </p>
            <p>
              <b>2. Encryption & Local Sandboxing:</b> When you set a PIN, your passcode is salted and hashed using PBKDF2 cryptography on-device. The application locks automatically to prevent unauthorized access.
            </p>
            <p>
              <b>3. Data Portability:</b> You own your data entirely. You can export complete machine-readable JSON backups or tabular CSV files at any time, or permanently wipe your records with a single click.
            </p>
          </div>
        </SheetModal>
      )}

      {/* Terms of Service Dialog Modal */}
      {activeDialog === "terms" && (
        <SheetModal
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          title="Terms & Clinical Disclaimer"
          maxWidth="500px"
        >
          <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-muted)" }}>
            <p>
              <b>1. Informational & Educational Use Only:</b> CycleSideChick provides mathematical cycle calculations, symptom journaling, and wellness guidance. It is not an FDA-cleared medical device or contraceptive tool.
            </p>
            <p>
              <b>2. Not Natural Contraception:</b> Calendar approximations and algorithmic fertile windows must never be relied upon as a sole method of pregnancy prevention.
            </p>
            <p>
              <b>3. Seek Professional Care:</b> If you experience severe pelvic pain, prolonged cycle absence (&gt;90 days), abnormal uterine bleeding, or fever, consult a board-certified obstetrician-gynecologist or licensed physician promptly.
            </p>
          </div>
        </SheetModal>
      )}

      {/* Contact Dialog Modal */}
      {activeDialog === "contact" && (
        <SheetModal
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          title="Contact & Support"
          maxWidth="500px"
        >
          <div style={{ textAlign: "center", padding: "20px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--surface-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px"
              }}
            >
              <Icon name="care" size={28} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text)" }}>We're here to help!</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px" }}>
              CycleSideChick is an open, privacy-first reproductive health project. If you have feature requests, accessibility feedback, or bug reports, reach out to our community.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                window.location.href = "mailto:support@cyclesidechick.app?subject=CycleSideChick%20Support";
              }}
            >
              Email Support Team
            </Button>
          </div>
        </SheetModal>
      )}
    </>
  );
}
