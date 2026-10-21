/**
 * CycleSideChick — Daily Log View Component
 * Features horizontal date scrubber, discrete flow capsules,
 * tactile ToggleChips, Slider for pain, and sticky bottom save bar.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { Slider } from "../../components/ui/Slider.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
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

  const MOODS = [
    { val: 0, label: "Great", icon: "moodHappy" },
    { val: 1, label: "Calm", icon: "moodCalm" },
    { val: 2, label: "Sensitive", icon: "moodAnxious" },
    { val: 3, label: "Low", icon: "moodLow" },
    { val: 4, label: "Irritable", icon: "moodIrritable" }
  ];

  const CERVICAL_FLUIDS = [
    { val: "dry", label: "Dry", desc: "Minimal or no moisture" },
    { val: "sticky", label: "Sticky", desc: "Thick or tacky" },
    { val: "creamy", label: "Creamy", desc: "Lotion-like white" },
    { val: "watery", label: "Watery", desc: "Thin, clear & wet" },
    { val: "ewcm", label: "Egg White", desc: "Clear, stretchy (fertile)" }
  ];

  const SYMPTOMS = [
    { id: "cramps_mild", label: "Mild Cramps" },
    { id: "cramps_moderate", label: "Moderate Cramps" },
    { id: "bloating", label: "Bloating" },
    { id: "headache", label: "Headache" },
    { id: "tender_breasts", label: "Tender Breasts" },
    { id: "fatigue", label: "Fatigue" },
    { id: "acne", label: "Acne Breakout" },
    { id: "lower_back", label: "Lower Back Pain" },
    { id: "ovulation_pain", label: "Ovulation Pain" },
    { id: "libido_high", label: "High Libido" },
    { id: "insomnia", label: "Sleep Issues" }
  ];

  const MEDICATIONS = [
    { id: "ibuprofen", label: "Ibuprofen / NSAID" },
    { id: "paracetamol", label: "Paracetamol" },
    { id: "magnesium", label: "Magnesium" },
    { id: "vitd", label: "Vitamin D" },
    { id: "bcomplex", label: "B-Complex" }
  ];

  const currentLog = (S.logs && S.logs[activeDate]) || {};
  const currentSymptoms = currentLog.s || [];
  const currentMedications = currentLog.med || [];

  const handleAddCustom = e => {
    e.preventDefault();
    if (customSymptomInput.trim()) {
      actions.addCustomSymptom(customSymptomInput.trim());
      setCustomSymptomInput("");
    }
  };

  return (
    <div className="log-view" style={{ paddingBottom: "100px" }}>
      {/* 1. Horizontal Date Scrubber */}
      <Card variant="base" style={{ padding: "14px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>LOGGING DATE</span>
            <h2 style={{ fontFamily: "var(--font-display)", margin: "2px 0 0", fontSize: "18px" }}>
              {fmt(activeDn, { weekday: "short", month: "short", day: "numeric" })}
            </h2>
          </div>
          <input
            type="date"
            value={activeDate}
            max={I(todayDn + 1)}
            onChange={e => actions.changeLogDate(e.target.value)}
            style={{ fontSize: "13px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
          />
        </div>

        <div className="v-log-scrubber">
          {scrubDates.map(sd => (
            <div
              key={sd.dateStr}
              className={`v-log-scrub-item ${sd.isSelected ? "active" : ""}`}
              onClick={() => actions.changeLogDate(sd.dateStr)}
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
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Bleeding & Flow Intensity</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12.5px" }}>
          Select today's bleeding volume for cycle calculation.
        </p>
        <div className="v-log-flow-grid">
          {FLOW_LEVELS.map(fl => {
            const isSelected = (currentLog.f ?? 0) === fl.val;
            return (
              <button
                key={fl.val}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setFlow(fl.val)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 4px",
                  borderRadius: "12px",
                  border: isSelected ? "1.5px solid var(--berry)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  color: isSelected ? "var(--berry)" : "inherit",
                  cursor: "pointer",
                  minHeight: "56px"
                }}
              >
                <Icon name={fl.icon} size={20} />
                <span style={{ fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>{fl.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Mood Tracking */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Emotional Landscape</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12.5px" }}>
          How are you feeling emotionally today?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {MOODS.map(m => {
            const isSelected = currentLog.m === m.val;
            return (
              <ToggleChip
                key={m.val}
                label={m.label}
                icon={m.icon}
                selected={isSelected}
                onClick={() => actions.setMood(m.val)}
              />
            );
          })}
        </div>
      </Card>

      {/* 4. Pain Intensity Slider */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <Slider
          label="Pelvic Pain / Discomfort Intensity"
          min={0}
          max={10}
          step={1}
          value={currentLog.p ?? 0}
          onChange={val => actions.setPain(val)}
          valueFormat={v => `${v} / 10 ${v === 0 ? "(None)" : v <= 3 ? "(Mild)" : v <= 6 ? "(Moderate)" : "(Severe)"}`}
        />
      </Card>

      {/* 5. Physical Symptoms */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Physical Symptoms</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12.5px" }}>
          Tap to toggle recorded physical sensations.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
          {SYMPTOMS.map(sym => {
            const isSelected = currentSymptoms.includes(sym.id);
            return (
              <ToggleChip
                key={sym.id}
                label={sym.label}
                selected={isSelected}
                onClick={() => actions.toggleSymptom(sym.id)}
              />
            );
          })}
          {(S.customSymptoms || []).map(cs => {
            const isSelected = currentSymptoms.includes(cs);
            return (
              <ToggleChip
                key={cs}
                label={cs}
                selected={isSelected}
                onClick={() => actions.toggleSymptom(cs)}
              />
            );
          })}
        </div>

        {/* Custom Symptom Form */}
        <form onSubmit={handleAddCustom} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Add custom symptom..."
            value={customSymptomInput}
            onChange={e => setCustomSymptomInput(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
          />
          <Button variant="secondary" size="sm" type="submit">
            Add
          </Button>
        </form>
      </Card>

      {/* 6. Cervical Fluid Consistency */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Cervical Fluid / Mucus</b>
        <p className="mut" style={{ margin: "0 0 10px", fontSize: "12.5px" }}>
          Natural indicator of hormonal estrogen peaks.
        </p>
        <div className="v-log-mucus-grid">
          {CERVICAL_FLUIDS.map(cf => {
            const isSelected = currentLog.cm === cf.val;
            return (
              <button
                key={cf.val}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setCervicalFluid(cf.val)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "10px",
                  borderRadius: "10px",
                  border: isSelected ? "1.5px solid var(--berry)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  color: isSelected ? "var(--berry)" : "inherit",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <b style={{ fontSize: "12.5px" }}>{cf.label}</b>
                <span style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>{cf.desc}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 7. Medications & Care Support */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Medications & Supplements</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {MEDICATIONS.map(med => {
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
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Private Day Notes</b>
        <textarea
          rows={3}
          placeholder="Any physical sensations, energy shifts, or personal thoughts..."
          value={currentLog.note || ""}
          onChange={e => actions.setNote(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13.5px", fontFamily: "var(--font-body)", resize: "vertical" }}
        />
      </Card>

      {/* 9. Sticky Bottom Feedback Bar */}
      <div className="v-log-sticky-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--phase-follicular)" }} />
          <span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-muted)" }}>
            Changes saved locally
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => actions.setTab("home")}>
          Done
        </Button>
      </div>
    </div>
  );
}
