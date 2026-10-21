/**
 * CycleSideChick — Daily Log View Component
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";
import { formatPainLevel } from "../../lib/format.js";

export function LogView() {
  const { dr, S } = useStore();
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const todayDateStr = I(TD());
  const activeDate = dr.d || todayDateStr;

  const quickDates = [
    { label: "Yesterday", dateStr: I(TD() - 1) },
    { label: "Today", dateStr: todayDateStr },
    { label: "Tomorrow", dateStr: I(TD() + 1) }
  ];

  const FLOW_LEVELS = [
    { val: 0, label: "None" },
    { val: 1, label: "Spotting" },
    { val: 2, label: "Light" },
    { val: 3, label: "Medium" },
    { val: 4, label: "Heavy" }
  ];

  const MOODS = [
    { val: 0, label: "Great" },
    { val: 1, label: "Calm" },
    { val: 2, label: "Sensitive" },
    { val: 3, label: "Low" },
    { val: 4, label: "Irritable" }
  ];

  const CERVICAL_FLUIDS = [
    { val: "dry", label: "Dry" },
    { val: "sticky", label: "Sticky" },
    { val: "creamy", label: "Creamy" },
    { val: "watery", label: "Watery" },
    { val: "ewcm", label: "Egg White" }
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

  const handleAddCustom = e => {
    e.preventDefault();
    if (customSymptomInput.trim()) {
      actions.addCustomSymptom(customSymptomInput.trim());
      setCustomSymptomInput("");
    }
  };

  return (
    <div className="log-view" style={{ paddingBottom: "80px" }}>
      {/* Date Header Scrubber */}
      <div className="card" style={{ padding: "14px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>LOGGING DATE</span>
            <h3 style={{ margin: "2px 0 0", fontSize: "17px" }}>{fmt(N(activeDate))}</h3>
          </div>
          <input
            type="date"
            value={activeDate}
            max={I(TD() + 1)}
            onChange={e => actions.changeLogDate(e.target.value)}
            style={{ fontSize: "13px", padding: "4px 8px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {quickDates.map(qd => {
            const isSelected = activeDate === qd.dateStr;
            return (
              <button
                key={qd.dateStr}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.selectLogDate(qd.dateStr)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "transparent",
                  cursor: "pointer"
                }}
              >
                {qd.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Menstrual Flow */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Menstrual Flow</b>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FLOW_LEVELS.map(f => {
            const isSelected = dr.f === f.val;
            return (
              <button
                key={f.val}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setFlow(f.val)}
                style={{
                  flex: 1,
                  minWidth: "60px",
                  padding: "8px 6px",
                  borderRadius: "10px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--tint-rose-bg)" : "var(--surface)",
                  color: isSelected ? "var(--tint-rose-text)" : "inherit",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: isSelected ? "700" : "500"
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mood */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Daily Mood</b>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {MOODS.map(m => {
            const isSelected = dr.m === m.val;
            return (
              <button
                key={m.val}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setDailyMood(m.val)}
                style={{
                  flex: 1,
                  minWidth: "55px",
                  padding: "8px 4px",
                  borderRadius: "10px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isSelected ? "700" : "500"
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pain Level Slider */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <b style={{ fontSize: "14px" }}>Pelvic & Cramp Discomfort</b>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--pink)" }}>
            {formatPainLevel(dr.p)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={dr.p !== null && dr.p !== undefined ? dr.p : 0}
          onChange={e => {
            dr.p = Number(e.target.value);
            actions.setFlow(dr.f); // trigger reactive notify
          }}
          style={{ width: "100%", margin: "10px 0" }}
        />
      </div>

      {/* 4. Hydration Water Tracker */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <b style={{ fontSize: "14px" }}>Hydration</b>
            <span className="subtle" style={{ fontSize: "12px", display: "block" }}>
              {dr.water || 0} cups of water logged today
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="icon-btn sm"
              onClick={() => actions.setWater((dr.water || 0) - 1)}
              aria-label="Decrease water"
            >
              <Icon name="minus" size={16} />
            </button>
            <span style={{ fontSize: "16px", fontWeight: "700", minWidth: "24px", textAlign: "center" }}>
              {dr.water || 0}
            </span>
            <button
              type="button"
              className="icon-btn sm"
              onClick={() => actions.setWater((dr.water || 0) + 1)}
              aria-label="Increase water"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Cervical Fluid */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Cervical Fluid</b>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CERVICAL_FLUIDS.map(c => {
            const isSelected = dr.cm === c.val;
            return (
              <button
                key={c.val}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.setCervicalMucus(c.val)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--tint-lavender-bg)" : "var(--surface)",
                  color: isSelected ? "var(--tint-lavender-text)" : "inherit",
                  cursor: "pointer",
                  fontSize: "12.5px"
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Physical Symptoms */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Symptoms & Sensations</b>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
          {SYMPTOMS.map(s => {
            const isSelected = !!(dr.sy && dr.sy[s.id]);
            return (
              <button
                key={s.id}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.toggleSymptom(s.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  color: isSelected ? "var(--pink)" : "inherit",
                  cursor: "pointer",
                  fontSize: "12.5px"
                }}
              >
                {s.label}
              </button>
            );
          })}
          {/* Custom Symptoms */}
          {(S.custom || []).map(cs => {
            const isSelected = !!(dr.sy && dr.sy[cs]);
            return (
              <button
                key={cs}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.toggleSymptom(cs)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  cursor: "pointer",
                  fontSize: "12.5px"
                }}
              >
                {cs.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>

        {/* Add Custom Symptom Input */}
        <form onSubmit={handleAddCustom} style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Add custom symptom..."
            value={customSymptomInput}
            onChange={e => setCustomSymptomInput(e.target.value)}
            style={{ flex: 1, padding: "6px 10px", fontSize: "13px" }}
          />
          <button type="submit" className="btn g sm">
            + Add
          </button>
        </form>
      </div>

      {/* 7. Medications */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Medications & Supplements</b>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {MEDICATIONS.map(med => {
            const isSelected = (dr.med || []).includes(med.id);
            return (
              <button
                key={med.id}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.toggleMedication(med.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  cursor: "pointer",
                  fontSize: "12.5px"
                }}
              >
                {med.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Biomarkers: BBT & LH */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Fertility Biomarkers (BBT & LH)</b>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Basal Temp (°F / °C)</label>
            <input
              type="text"
              placeholder="e.g. 97.8"
              value={dr.bbt || ""}
              onChange={e => {
                dr.bbt = e.target.value;
                actions.setFlow(dr.f);
              }}
              style={{ width: "100%", padding: "6px 8px" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>LH Surge Test</label>
            <select
              value={dr.lh || ""}
              onChange={e => actions.setLhStatus(e.target.value)}
              style={{ width: "100%", padding: "6px 8px" }}
            >
              <option value="">Not tested</option>
              <option value="negative">Negative</option>
              <option value="positive">LH Surge (+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 9. Daily Note */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>Private Daily Note</b>
        <textarea
          rows={3}
          placeholder="Thoughts, physical observations, or personal notes..."
          value={dr.note || ""}
          onChange={e => {
            dr.note = e.target.value;
            actions.setFlow(dr.f);
          }}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)" }}
        />
      </div>

      {/* 10. Sticky Save Bar */}
      <div
        className="sticky-save-bar"
        style={{
          position: "fixed",
          bottom: "64px",
          left: 0,
          right: 0,
          padding: "10px 16px",
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "center",
          zIndex: 10
        }}
      >
        <button
          type="button"
          className="btn"
          style={{ maxWidth: "440px", width: "100%" }}
          onClick={() => actions.saveDailyLog()}
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}
