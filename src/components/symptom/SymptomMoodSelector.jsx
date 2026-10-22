/**
 * CycleSideChick — Component 03: Symptom & Mood Selector (Daily Logging)
 * 
 * Features:
 * - Beautiful selectable SVG icon chips for cramps, mood, energy, bloating, headaches, etc.
 * - Selection, deselection, editing, and immediate reactive storage.
 * - Categorized: Physical Sensations, Emotional Moods, Energy Levels.
 * - Supports custom user symptoms.
 * - Haptics, accessible keyboard navigation, and subtle 150-250ms motion.
 */

import React from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "../ui/Icon.jsx";

export function SymptomMoodSelector({
  activeDate,
  selectedSymptoms = {},
  selectedMood = null,
  selectedEnergy = "",
  customSymptoms = []
}) {
  const CORE_SYMPTOMS = [
    { id: "cramps", label: "Cramps", icon: "cramps" },
    { id: "bloating", label: "Bloating", icon: "bloating" },
    { id: "headache", label: "Headache", icon: "headache" },
    { id: "breast_tender", label: "Tender Breasts", icon: "breast" },
    { id: "backache", label: "Lower Back", icon: "backache" },
    { id: "fatigue", label: "Fatigue", icon: "fatigue" },
    { id: "acne", label: "Acne Breakout", icon: "acne" },
    { id: "ovulation_pain", label: "Ovulation Tinge", icon: "ovulation" },
    { id: "sleep_trouble", label: "Sleep Issues", icon: "sleep" },
    { id: "cravings", label: "Cravings", icon: "cravings" },
    { id: "anxiety", label: "Anxious Rhythm", icon: "moodAnxious" },
    { id: "hot_flashes", label: "Hot Flashes", icon: "flame" }
  ];

  const MOOD_ITEMS = [
    { val: 4, label: "Great", icon: "moodHappy", tint: "rose" },
    { val: 3, label: "Calm", icon: "moodCalm", tint: "lavender" },
    { val: 2, label: "Neutral", icon: "moodNeutral", tint: "butter" },
    { val: 1, label: "Low", icon: "moodLow", tint: "sky" },
    { val: 0, label: "Sensitive", icon: "moodIrritable", tint: "peach" }
  ];

  const ENERGY_ITEMS = [
    { id: "high", label: "High Energy", icon: "energyHigh" },
    { id: "balanced", label: "Balanced", icon: "energyBalanced" },
    { id: "low", label: "Low Energy", icon: "energyLow" }
  ];

  const handleSymptomToggle = (id) => {
    actions.toggleSymptom(id);
  };

  const handleMoodSelect = (val) => {
    actions.setDailyMood(selectedMood === val ? null : val);
  };

  const handleEnergySelect = (id) => {
    actions.setEnergy(selectedEnergy === id ? "" : id);
  };

  return (
    <div className="v-symptom-selector-wrap">
      {/* 1. Mood Spectrum */}
      <div className="v-selector-section">
        <div className="v-selector-header">
          <span className="v-selector-title">Emotional Mood</span>
          <span className="v-selector-sub">Select how you felt today</span>
        </div>
        <div className="v-chips-row v-chips-row--moods" role="radiogroup" aria-label="Emotional mood">
          {MOOD_ITEMS.map((m) => {
            const isSelected = selectedMood === m.val;
            return (
              <button
                key={m.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`v-svg-chip v-svg-chip--mood ${isSelected ? "selected" : ""} v-chip-tint--${m.tint}`}
                onClick={() => handleMoodSelect(m.val)}
                aria-label={`Mood: ${m.label}`}
              >
                <div className="v-chip-icon">
                  <Icon name={m.icon} size={22} />
                </div>
                <span className="v-chip-label">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Energy Levels */}
      <div className="v-selector-section">
        <div className="v-selector-header">
          <span className="v-selector-title">Energy Rhythm</span>
          <span className="v-selector-sub">Vitality and stamina level</span>
        </div>
        <div className="v-chips-row v-chips-row--energy" role="radiogroup" aria-label="Energy levels">
          {ENERGY_ITEMS.map((en) => {
            const isSelected = selectedEnergy === en.id;
            return (
              <button
                key={en.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`v-svg-chip v-svg-chip--energy ${isSelected ? "selected" : ""}`}
                onClick={() => handleEnergySelect(en.id)}
                aria-label={`Energy: ${en.label}`}
              >
                <div className="v-chip-icon">
                  <Icon name={en.icon} size={18} />
                </div>
                <span className="v-chip-label">{en.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Physical Symptoms Chips */}
      <div className="v-selector-section">
        <div className="v-selector-header">
          <span className="v-selector-title">Physical Symptoms</span>
          <span className="v-selector-sub">Tap to select or deselect sensations</span>
        </div>
        <div className="v-chips-grid" role="group" aria-label="Physical symptoms">
          {CORE_SYMPTOMS.map((sym) => {
            const isSelected = Boolean(selectedSymptoms[sym.id]);
            return (
              <button
                key={sym.id}
                type="button"
                className={`v-svg-chip v-svg-chip--symptom ${isSelected ? "selected" : ""}`}
                onClick={() => handleSymptomToggle(sym.id)}
                aria-pressed={isSelected}
                aria-label={sym.label}
              >
                <div className="v-chip-icon">
                  <Icon name={sym.icon} size={18} />
                </div>
                <span className="v-chip-label">{sym.label}</span>
                {isSelected && (
                  <span className="v-chip-check-dot" aria-hidden="true">
                    <Icon name="check" size={10} />
                  </span>
                )}
              </button>
            );
          })}

          {/* User's custom symptoms */}
          {customSymptoms.map((cs) => {
            const key = cs.trim().toLowerCase().replace(/\s+/g, "_");
            const isSelected = Boolean(selectedSymptoms[key] || selectedSymptoms[cs]);
            return (
              <button
                key={cs}
                type="button"
                className={`v-svg-chip v-svg-chip--symptom ${isSelected ? "selected" : ""}`}
                onClick={() => handleSymptomToggle(key)}
                aria-pressed={isSelected}
                aria-label={cs}
              >
                <div className="v-chip-icon">
                  <Icon name="sparkle" size={17} />
                </div>
                <span className="v-chip-label">{cs}</span>
                {isSelected && (
                  <span className="v-chip-check-dot" aria-hidden="true">
                    <Icon name="check" size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
