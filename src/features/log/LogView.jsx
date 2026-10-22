/**
 * CycleSideChick — Component 03 Integration: Daily Log View Component
 * Features horizontal date scrubber, discrete flow capsules,
 * Symptom & Mood Selector with SVG chips, pain slider, and sticky bottom save bar.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Slider } from "../../components/ui/Slider.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { SymptomMoodSelector } from "../../components/symptom/SymptomMoodSelector.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";

export function LogView() {
  const { dr, S } = useStore();
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const todayDn = TD();
  const todayDateStr = I(todayDn);
  const activeDate = dr.d || todayDateStr;

  // Generate 7-day scrubber centered around active date
  const activeDn = N(activeDate);
  const scrubDates = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = activeDn + offset;
    scrubDates.push({
      d,
      dateStr: I(d),
      isToday: d === todayDn,
      isSelected: d === activeDn
    });
  }

  const FLOW_LEVELS = [
    { val: 0, label: "None", icon: "flowNone", hint: "Dry" },
    { val: 1, label: "Spotting", icon: "flowSpotting", hint: "Liner only" },
    { val: 2, label: "Light", icon: "flowLight", hint: "Low flow" },
    { val: 3, label: "Medium", icon: "flowMedium", hint: "Regular" },
    { val: 4, label: "Heavy", icon: "flowHeavy", hint: "Full flow" }
  ];

  const CERVICAL_FLUIDS = [
    { val: "dry", label: "Dry", desc: "Minimal or no moisture sensation", badge: "Low Estrogen" },
    { val: "sticky", label: "Sticky", desc: "Thick, tacky or pasty texture", badge: "Post-Period" },
    { val: "creamy", label: "Creamy", desc: "Lotion-like smooth white moisture", badge: "Transitional" },
    { val: "watery", label: "Watery", desc: "Thin, clear, highly wet sensation", badge: "Fertile Window" },
    { val: "ewcm", label: "Egg White", desc: "Clear, stretchy, lubricative peak", badge: "Peak Ovulation" }
  ];

  const MEDICATIONS = [
    { id: "ibuprofen", label: "Ibuprofen / NSAID" },
    { id: "paracetamol", label: "Paracetamol" },
    { id: "magnesium", label: "Magnesium" },
    { id: "vitd", label: "Vitamin D" },
    { id: "bcomplex", label: "B-Complex" }
  ];

  const currentLog = (S.logs && S.logs[activeDate]) || {};
  const currentMedications = dr.med || currentLog.med || [];
  const currentSymptoms = dr.sy || currentLog.sy || {};
  const currentMood = dr.m !== null ? dr.m : currentLog.m;
  const currentEnergy = dr.en || currentLog.en || "";
  const currentPain = dr.p !== null && dr.p !== undefined ? dr.p : (currentLog.p ?? 0);

  // Calculate Daily Check-in Completion Progress (0 to 100%)
  const checkinCategories = [
    {
      id: "flow",
      name: "Bleeding Flow",
      isComplete: (dr.f !== "" && dr.f !== undefined) || (currentLog.f !== undefined && currentLog.f !== null)
    },
    {
      id: "mood",
      name: "Mood & Energy",
      isComplete: (dr.m !== null && dr.m !== undefined) || (currentLog.m !== null && currentLog.m !== undefined) || Boolean(dr.en || currentLog.en)
    },
    {
      id: "symptoms",
      name: "Physical Sensations",
      isComplete: Object.keys(currentSymptoms).length > 0 || (currentPain > 0)
    },
    {
      id: "cervical",
      name: "Cervical Fluid",
      isComplete: Boolean(dr.cm || currentLog.cm)
    },
    {
      id: "wellness",
      name: "Meds & Notes",
      isComplete: currentMedications.length > 0 || Boolean((dr.note || currentLog.note || "").trim())
    }
  ];

  const completedCount = checkinCategories.filter(c => c.isComplete).length;
  const totalCategories = checkinCategories.length;
  const progressPct = Math.round((completedCount / totalCategories) * 100);

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customSymptomInput.trim()) {
      actions.addCustomSymptom(customSymptomInput.trim());
      setCustomSymptomInput("");
    }
  };

  const handleDateChange = (newDateStr) => {
    actions.changeLogDate(newDateStr);
  };

  const handleSaveAndDone = () => {
    actions.saveDailyLog();
    actions.toast("Daily check-in saved! Keep shining ✨");
    actions.setTab("home");
  };

  return (
    <div className="log-view" style={{ paddingBottom: "140px" }}>
      {/* 1. Horizontal Date Scrubber */}
      <Card variant="base" style={{ padding: "14px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>LOGGING DATE</span>
            <h2 style={{ fontFamily: "var(--font-heading)", margin: "2px 0 0", fontSize: "18px" }}>
              {fmt(activeDn, { weekday: "short", month: "short", day: "numeric" })}
            </h2>
          </div>
          <div className="v-log-date-pill-wrap" title="Change date">
            <Icon name="calendar" size={14} />
            <span>{fmt(activeDn, { month: "short", day: "numeric" })}</span>
            <input
              type="date"
              className="v-log-date-native"
              value={activeDate}
              max={I(todayDn + 1)}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-label="Change logging date"
            />
          </div>
        </div>

        <div className="v-log-scrubber">
          {scrubDates.map((sd) => (
            <div
              key={sd.dateStr}
              className={`v-log-scrub-item ${sd.isSelected ? "active" : ""}`}
              onClick={() => handleDateChange(sd.dateStr)}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", opacity: 0.8 }}>
                {sd.isToday ? "Today" : fmt(sd.d, { weekday: "narrow" })}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "700", marginTop: "2px" }}>
                {fmt(sd.d, { day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Interactive Daily Check-In Progress Bar */}
      <Card variant="base" className="v-log-progress-card" style={{ padding: "16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="v-log-progress-icon-circle">
              <Icon name="sparkles" size={17} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Daily Check-In Progress
              </span>
              <h3 style={{ margin: "1px 0 0", fontSize: "15px", fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                {completedCount === totalCategories
                  ? "Check-In Complete! 👑"
                  : `${completedCount} of ${totalCategories} Areas Recorded`}
              </h3>
            </div>
          </div>
          <div className="v-log-progress-pill">
            <span>{progressPct}%</span>
          </div>
        </div>

        {/* Animated Progress Track */}
        <div className="v-log-progress-track">
          <div
            className="v-log-progress-fill"
            style={{ width: `${Math.max(4, progressPct)}%` }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "500" }}>
            {completedCount === 0
              ? "Tap any category below to begin today's check-in 🌱"
              : completedCount <= 2
              ? "Great start! Tuning into your body's rhythm ✨"
              : completedCount < totalCategories
              ? "Wonderful self-care! Almost thorough 🌸"
              : "Thorough self-care! Body and mind are in sync 👑"}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {checkinCategories.map(cat => (
              <span
                key={cat.id}
                title={cat.name}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: cat.isComplete ? "var(--primary)" : "var(--border)",
                  transition: "background 0.3s ease, transform 0.3s ease",
                  transform: cat.isComplete ? "scale(1.2)" : "scale(1)"
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Flow Intensity Selector */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
          <b style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>Bleeding & Flow Intensity</b>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>ACOG & FIGO Standards</span>
        </div>
        <p className="mut" style={{ margin: "0 0 12px", fontSize: "12px" }}>
          Select today's volume. Spotting is intermenstrual and does not reset Cycle Day 1.
        </p>
        <div className="v-log-flow-grid" role="radiogroup" aria-label="Bleeding flow volume">
          {FLOW_LEVELS.map((fl) => {
            const isSelected = (dr.f !== "" ? dr.f : (currentLog.f ?? 0)) === fl.val;
            return (
              <button
                key={fl.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`v-flow-btn ${isSelected ? "active" : ""}`}
                onClick={() => actions.setFlow(fl.val)}
                aria-label={`Flow: ${fl.label}`}
              >
                <div className="v-flow-icon-wrap">
                  <Icon name={fl.icon} size={22} />
                </div>
                <span className="v-flow-btn-label">{fl.label}</span>
                <span className="v-flow-badge-sub">{fl.hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Symptom & Mood Selector Component */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <SymptomMoodSelector
          activeDate={activeDate}
          selectedSymptoms={currentSymptoms}
          selectedMood={currentMood}
          selectedEnergy={currentEnergy}
          customSymptoms={S.customSymptoms || []}
        />

        {/* Custom Symptom Input Form */}
        <div style={{ marginTop: "14px", borderTop: "1px dashed var(--border)", paddingTop: "12px" }}>
          <form onSubmit={handleAddCustom} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Add custom sensation..."
              value={customSymptomInput}
              onChange={(e) => setCustomSymptomInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid var(--border)",
                fontSize: "13px",
                background: "var(--surface)",
                fontFamily: "var(--font-body)"
              }}
            />
            <Button variant="secondary" size="sm" type="submit">
              Add
            </Button>
          </form>
        </div>
      </Card>

      {/* 5. Pain Intensity Slider with Dynamic Sensation Feedback */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <b style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>Pelvic Pain & Cramping</b>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "999px",
              background: currentPain === 0
                ? "rgba(32, 201, 151, 0.12)"
                : currentPain <= 3
                ? "rgba(56, 182, 255, 0.12)"
                : currentPain <= 6
                ? "rgba(255, 154, 60, 0.12)"
                : "rgba(255, 77, 109, 0.15)",
              color: currentPain === 0
                ? "#20C997"
                : currentPain <= 3
                ? "#0077FE"
                : currentPain <= 6
                ? "#FF9A3C"
                : "#FF4D6D"
            }}
          >
            {currentPain === 0 ? "0/10 (None)" : currentPain <= 3 ? `${currentPain}/10 (Mild)` : currentPain <= 6 ? `${currentPain}/10 (Moderate)` : `${currentPain}/10 (Severe)`}
          </span>
        </div>
        <Slider
          min={0}
          max={10}
          step={1}
          value={currentPain}
          onChange={(val) => actions.setPain(val)}
          valueFormat={(v) => `${v} / 10`}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
          <span>0 (Calm)</span>
          <span>3 (Mild)</span>
          <span>6 (Moderate)</span>
          <span>10 (Severe)</span>
        </div>
      </Card>

      {/* 6. Cervical Fluid Consistency */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
          <b style={{ fontSize: "14px", fontFamily: "var(--font-heading)" }}>Cervical Fluid / Mucus</b>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Estrogen Biomarker</span>
        </div>
        <p className="mut" style={{ margin: "0 0 12px", fontSize: "12px" }}>
          Natural indicator of hormonal fluctuations and fertile window peak.
        </p>
        <div className="v-log-mucus-grid" role="radiogroup" aria-label="Cervical fluid consistency">
          {CERVICAL_FLUIDS.map((cf) => {
            const isSelected = (dr.cm || currentLog.cm) === cf.val;
            return (
              <button
                key={cf.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`v-mucus-btn ${isSelected ? "active" : ""}`}
                onClick={() => actions.setCervicalFluid(cf.val)}
                aria-label={`Mucus: ${cf.label}`}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="v-mucus-icon-circle">
                      <Icon name="droplet" size={15} />
                    </div>
                    <span className="v-mucus-btn-title">{cf.label}</span>
                  </div>
                  {cf.badge && (
                    <span className="v-mucus-badge">{cf.badge}</span>
                  )}
                </div>
                <span className="v-mucus-btn-desc">{cf.desc}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 7. Medications & Care Support */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px", fontFamily: "var(--font-heading)" }}>Medications & Supplements</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {MEDICATIONS.map((med) => {
            const isSelected = currentMedications.includes(med.id);
            return (
              <ToggleChip
                key={med.id}
                label={med.label}
                selected={isSelected}
                onClick={() => actions.toggleMedication(med.id)}
              />
            );
          })}
        </div>
      </Card>

      {/* 8. Personal Private Note */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px", fontFamily: "var(--font-heading)" }}>Private Day Notes</b>
        <textarea
          rows={3}
          placeholder="Any physical sensations, energy shifts, or personal thoughts..."
          value={dr.note !== undefined ? dr.note : (currentLog.note || "")}
          onChange={(e) => actions.setNote(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--border)",
            fontSize: "13.5px",
            fontFamily: "var(--font-body)",
            resize: "vertical",
            background: "var(--surface)"
          }}
        />
      </Card>

      {/* 9. Sticky Bottom Feedback Bar */}
      <div className="v-log-sticky-bar">
        <div className="v-log-privacy-status">
          <span className="v-log-privacy-dot" />
          <span className="v-log-privacy-text">
            100% On-Device · Private Local Vault
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={handleSaveAndDone}>
          Save & Done
        </Button>
      </div>
    </div>
  );
}
