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
    { val: 0, label: "None", icon: "flowNone" },
    { val: 1, label: "Spotting", icon: "flowSpotting" },
    { val: 2, label: "Light", icon: "flowLight" },
    { val: 3, label: "Medium", icon: "flowMedium" },
    { val: 4, label: "Heavy", icon: "flowHeavy" }
  ];

  const CERVICAL_FLUIDS = [
    { val: "dry", label: "Dry", desc: "Minimal or no moisture" },
    { val: "sticky", label: "Sticky", desc: "Thick or tacky" },
    { val: "creamy", label: "Creamy", desc: "Lotion-like white" },
    { val: "watery", label: "Watery", desc: "Thin, clear & wet" },
    { val: "ewcm", label: "Egg White", desc: "Clear, stretchy (fertile)" }
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

  return (
    <div className="log-view" style={{ paddingBottom: "140px" }}>
      {/* 1. Horizontal Date Scrubber */}
      <Card variant="base" style={{ padding: "14px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>LOGGING DATE</span>
            <h2 style={{ fontFamily: "var(--font-display)", margin: "2px 0 0", fontSize: "18px" }}>
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

      {/* 2. Flow Intensity Selector */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "3px" }}>Bleeding & Flow Intensity</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12px" }}>
          Select today's volume to calculate period duration & cycle stage.
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
                <Icon name={fl.icon} size={20} />
                <span className="v-flow-btn-label">{fl.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Symptom & Mood Selector Component */}
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

      {/* 4. Pain Intensity Slider */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <Slider
          label="Pelvic Pain / Discomfort Intensity"
          min={0}
          max={10}
          step={1}
          value={currentPain}
          onChange={(val) => actions.setPain(val)}
          valueFormat={(v) => `${v} / 10 ${v === 0 ? "(None)" : v <= 3 ? "(Mild)" : v <= 6 ? "(Moderate)" : "(Severe)"}`}
        />
      </Card>

      {/* 5. Cervical Fluid Consistency */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "3px" }}>Cervical Fluid / Mucus</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12px" }}>
          Natural indicator of estrogen levels and fertile window.
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
                <span className="v-mucus-btn-title">{cf.label}</span>
                <span className="v-mucus-btn-desc">{cf.desc}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 6. Medications & Care Support */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Medications & Supplements</b>
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

      {/* 7. Personal Private Note */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "14px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Private Day Notes</b>
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

      {/* 8. Sticky Bottom Feedback Bar */}
      <div className="v-log-sticky-bar">
        <div className="v-log-privacy-status">
          <span className="v-log-privacy-dot" />
          <span className="v-log-privacy-text">
            100% On-Device · Private
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => { actions.saveDailyLog(); actions.setTab("home"); }}>
          Save & Done
        </Button>
      </div>
    </div>
  );
}
