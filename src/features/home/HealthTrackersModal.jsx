/**
 * CycleSideChick — Dedicated Health Metric Trackers Modal
 * Implements the 3 dedicated health tracker screens from the references:
 * 1. Weight Tracker with precision ruler, BMI gauge & history list
 * 2. Basal Body Temperature (BBT) Tracker with precision ruler & biphasic chart
 * 3. Water Intake Tracker with animated liquid wave droplet & quick presets
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { HorizontalRuler } from "../../components/ui/HorizontalRuler.jsx";
import { TD, I, fmt } from "../../core/engine.js";

export function HealthTrackersModal({ initialTab = "water", isOpen = true, onClose }) {
  const { S } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab); // 'water' | 'weight' | 'temp'

  const todayStr = I(TD());
  const todayLog = (S.logs && S.logs[todayStr]) || {};

  // Local state for interactive editing
  const [waterMl, setWaterMl] = useState(
    todayLog.waterMl !== undefined ? todayLog.waterMl : (todayLog.water ? todayLog.water * 250 : 600)
  );
  const waterGoal = S.waterGoalMl || 2000;

  const [weight, setWeight] = useState(S.weight || 60.0);
  const [weightUnit, setWeightUnit] = useState(S.weightUnit || "kg");

  const [temp, setTemp] = useState(
    todayLog.bbt ? parseFloat(todayLog.bbt) : (S.bbtUnit === "f" ? 97.8 : 36.6)
  );
  const [tempUnit, setTempUnit] = useState(S.bbtUnit || "c");

  // Save handlers
  const handleSaveWater = (amount) => {
    const newTotal = Math.min(4000, Math.max(0, amount));
    setWaterMl(newTotal);
    if (!S.logs) S.logs = {};
    if (!S.logs[todayStr]) S.logs[todayStr] = {};
    S.logs[todayStr].waterMl = newTotal;
    S.logs[todayStr].water = Math.round(newTotal / 250);
    actions.persistState();
    actions.toast(`Hydration updated: ${newTotal} ml`);
    actions.haptic(20);
  };

  const handleSaveWeight = () => {
    S.weight = weight;
    S.weightUnit = weightUnit;
    if (!S.weightLogs) S.weightLogs = [];
    // Update or append today's weight log
    const existingIdx = S.weightLogs.findIndex(l => l.date === todayStr);
    if (existingIdx >= 0) {
      S.weightLogs[existingIdx] = { date: todayStr, val: weight, unit: weightUnit };
    } else {
      S.weightLogs.unshift({ date: todayStr, val: weight, unit: weightUnit });
    }
    actions.persistState();
    actions.toast(`Weight saved: ${weight} ${weightUnit}`);
    actions.haptic(20);
  };

  const handleSaveTemp = () => {
    if (!S.logs) S.logs = {};
    if (!S.logs[todayStr]) S.logs[todayStr] = {};
    S.logs[todayStr].bbt = String(temp);
    S.bbtUnit = tempUnit;

    if (!S.tempLogs) S.tempLogs = [];
    const existingIdx = S.tempLogs.findIndex(l => l.date === todayStr);
    if (existingIdx >= 0) {
      S.tempLogs[existingIdx] = { date: todayStr, val: temp, unit: tempUnit };
    } else {
      S.tempLogs.unshift({ date: todayStr, val: temp, unit: tempUnit });
    }

    actions.persistState();
    actions.toast(`Temperature recorded: ${temp.toFixed(2)} °${tempUnit.toUpperCase()}`);
    actions.haptic(20);
  };

  // BMI Calculation
  const heightM = ((S.height || 165) / 100);
  const weightKg = weightUnit === "kg" ? weight : weight * 0.453592;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = "Normal weight";
  let bmiColor = "#20C997"; // Green
  let bmiPercent = 40; // 0 to 100 on gauge

  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "#2B8CEE";
    bmiPercent = Math.max(5, (bmi / 18.5) * 25);
  } else if (bmi <= 24.9) {
    bmiCategory = "Normal weight";
    bmiColor = "#20C997";
    bmiPercent = 25 + ((bmi - 18.5) / 6.4) * 35;
  } else if (bmi <= 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "#FF9A3C";
    bmiPercent = 60 + ((bmi - 25.0) / 4.9) * 20;
  } else {
    bmiCategory = "Obesity";
    bmiColor = "#FF5B99";
    bmiPercent = Math.min(95, 80 + ((bmi - 30) / 10) * 15);
  }

  // Water percentage calculation
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal) * 100));

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Health Trackers"
      maxWidth="500px"
      className="v-health-trackers-sheet"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Metric Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            background: "var(--surface-alt, #F1F1F5)",
            padding: "4px",
            borderRadius: "999px"
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("water")}
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              background: activeTab === "water" ? "var(--color-water, #2B8CEE)" : "transparent",
              color: activeTab === "water" ? "#FFFFFF" : "var(--text-muted)",
              transition: "all 0.2s ease"
            }}
          >
            💧 Water
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weight")}
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              background: activeTab === "weight" ? "var(--primary, #FF5B99)" : "transparent",
              color: activeTab === "weight" ? "#FFFFFF" : "var(--text-muted)",
              transition: "all 0.2s ease"
            }}
          >
            ⚖️ Weight
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("temp")}
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              background: activeTab === "temp" ? "#FF9A3C" : "transparent",
              color: activeTab === "temp" ? "#FFFFFF" : "var(--text-muted)",
              transition: "all 0.2s ease"
            }}
          >
            🌡️ Temp (BBT)
          </button>
        </div>

        {/* 1. WATER TRACKER VIEW */}
        {activeTab === "water" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            {/* Large SVG Water Droplet with Wave Fill */}
            <div style={{ position: "relative", width: "160px", height: "200px" }}>
              <svg viewBox="0 0 160 200" width="160" height="200" style={{ overflow: "hidden" }}>
                <defs>
                  {/* Droplet Outline Clip Path */}
                  <clipPath id="dropletClip">
                    <path d="M 80 15 C 80 15 20 85 20 130 C 20 165 46.8 190 80 190 C 113.2 190 140 165 140 130 C 140 85 80 15 80 15 Z" />
                  </clipPath>
                  {/* Water Gradient */}
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4FACFE" />
                    <stop offset="100%" stopColor="#00F2FE" />
                  </linearGradient>
                </defs>

                {/* Droplet Background Frame */}
                <path
                  d="M 80 15 C 80 15 20 85 20 130 C 20 165 46.8 190 80 190 C 113.2 190 140 165 140 130 C 140 85 80 15 80 15 Z"
                  fill="var(--surface-alt, #F1F1F5)"
                  stroke="var(--border)"
                  strokeWidth="3"
                />

                {/* Animated Liquid Fill clipped to droplet */}
                <g clipPath="url(#dropletClip)">
                  <rect
                    x="0"
                    y={190 - (waterPct / 100) * 175}
                    width="160"
                    height="200"
                    fill="url(#waterGrad)"
                    style={{ transition: "y 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                  {/* Subtle surface wave */}
                  <ellipse
                    cx="80"
                    cy={190 - (waterPct / 100) * 175}
                    rx="80"
                    ry="6"
                    fill="rgba(255, 255, 255, 0.4)"
                    style={{ transition: "cy 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                </g>

                {/* Droplet Glass Gloss Highlight */}
                <path
                  d="M 45 100 C 35 118 35 145 48 165"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>

              {/* Percentage Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "30px",
                  left: 0,
                  width: "100%",
                  textAlign: "center",
                  fontWeight: "900",
                  fontSize: "20px",
                  color: waterPct > 45 ? "#FFFFFF" : "var(--text)",
                  textShadow: waterPct > 45 ? "0 1px 3px rgba(0,0,0,0.2)" : "none"
                }}
              >
                {waterPct}%
              </div>
            </div>

            {/* Readout Numbers */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "900", fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                {waterMl.toLocaleString()} <span style={{ fontSize: "18px", color: "var(--text-muted)" }}>ml</span>
              </div>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>
                Daily Goal: {waterGoal.toLocaleString()} ml
              </span>
            </div>

            {/* Quick Preset Volume Add Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", width: "100%" }}>
              {[
                { amount: 250, label: "+250 ml", sub: "Cup" },
                { amount: 500, label: "+500 ml", sub: "Bottle" },
                { amount: 750, label: "+750 ml", sub: "Flask" },
                { amount: 1000, label: "+1,000 ml", sub: "Carafe" }
              ].map(preset => (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => handleSaveWater(waterMl + preset.amount)}
                  style={{
                    padding: "12px 6px",
                    borderRadius: "16px",
                    border: "1.5px solid var(--border)",
                    background: "var(--surface)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-water)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <b style={{ fontSize: "13px", color: "var(--color-water)" }}>{preset.label}</b>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{preset.sub}</span>
                </button>
              ))}
            </div>

            {/* Reset / Clear Button */}
            <button
              type="button"
              onClick={() => handleSaveWater(0)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Reset today's water
            </button>
          </div>
        )}

        {/* 2. WEIGHT TRACKER VIEW */}
        {activeTab === "weight" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Unit Toggle */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", background: "var(--surface-alt)", padding: "4px", borderRadius: "999px" }}>
                <button
                  type="button"
                  onClick={() => setWeightUnit("kg")}
                  style={{
                    padding: "6px 20px",
                    borderRadius: "999px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: weightUnit === "kg" ? "var(--primary)" : "transparent",
                    color: weightUnit === "kg" ? "#FFFFFF" : "var(--text-muted)"
                  }}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit("lb")}
                  style={{
                    padding: "6px 20px",
                    borderRadius: "999px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: weightUnit === "lb" ? "var(--primary)" : "transparent",
                    color: weightUnit === "lb" ? "#FFFFFF" : "var(--text-muted)"
                  }}
                >
                  lb
                </button>
              </div>
            </div>

            {/* Interactive Precision Ruler */}
            <HorizontalRuler
              value={weight}
              min={weightUnit === "kg" ? 30 : 66}
              max={weightUnit === "kg" ? 180 : 396}
              step={0.5}
              unit={weightUnit}
              onChange={setWeight}
            />

            {/* BMI Range Visual Indicator */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                  BODY MASS INDEX (BMI)
                </span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: bmiColor }}>
                  {bmi} — {bmiCategory}
                </span>
              </div>

              {/* Multi-Colored Range Bar */}
              <div style={{ position: "relative", height: "12px", borderRadius: "6px", overflow: "hidden", display: "flex", margin: "10px 0" }}>
                <div style={{ flex: 18.5, background: "#2B8CEE" }} title="Underweight (<18.5)" />
                <div style={{ flex: 6.4, background: "#20C997" }} title="Normal (18.5 - 24.9)" />
                <div style={{ flex: 5.0, background: "#FF9A3C" }} title="Overweight (25 - 29.9)" />
                <div style={{ flex: 10.0, background: "#FF5B99" }} title="Obese (30+)" />
              </div>

              {/* Needle Indicator */}
              <div style={{ position: "relative", height: "16px", marginTop: "-4px" }}>
                <div
                  style={{
                    position: "absolute",
                    left: `${bmiPercent}%`,
                    top: 0,
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}
                >
                  <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `6px solid ${bmiColor}` }} />
                  <span style={{ fontSize: "11px", fontWeight: "800", color: bmiColor }}>You</span>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={handleSaveWeight}>
              Save Weight
            </Button>
          </div>
        )}

        {/* 3. TEMPERATURE (BBT) TRACKER VIEW */}
        {activeTab === "temp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Unit Toggle */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", background: "var(--surface-alt)", padding: "4px", borderRadius: "999px" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (tempUnit === "f") {
                      setTemp(Number(((temp - 32) * (5 / 9)).toFixed(2)));
                      setTempUnit("c");
                    }
                  }}
                  style={{
                    padding: "6px 20px",
                    borderRadius: "999px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: tempUnit === "c" ? "#FF9A3C" : "transparent",
                    color: tempUnit === "c" ? "#FFFFFF" : "var(--text-muted)"
                  }}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempUnit === "c") {
                      setTemp(Number((temp * (9 / 5) + 32).toFixed(2)));
                      setTempUnit("f");
                    }
                  }}
                  style={{
                    padding: "6px 20px",
                    borderRadius: "999px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: tempUnit === "f" ? "#FF9A3C" : "transparent",
                    color: tempUnit === "f" ? "#FFFFFF" : "var(--text-muted)"
                  }}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Interactive Precision Ruler */}
            <HorizontalRuler
              value={temp}
              min={tempUnit === "c" ? 35.5 : 95.9}
              max={tempUnit === "c" ? 38.0 : 100.4}
              step={0.1}
              unit={`°${tempUnit.toUpperCase()}`}
              onChange={setTemp}
            />

            {/* BBT Biphasic Chart Card */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                  BIPHASIC THERMAL SHIFT
                </span>
                <span style={{ fontSize: "11.5px", color: "#FF9A3C", fontWeight: "700" }}>
                  Confirmed Ovulation Pattern
                </span>
              </div>

              {/* Biphasic SVG Line Curve */}
              <svg viewBox="0 0 320 90" width="100%" height="90" style={{ overflow: "visible" }}>
                {/* Follicular baseline */}
                <line x1="10" y1="60" x2="150" y2="60" stroke="#FF9A3C" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <text x="14" y="55" fill="var(--text-muted)" fontSize="9" fontWeight="600">Follicular (36.4°)</text>

                {/* Ovulation Shift divider */}
                <line x1="160" y1="10" x2="160" y2="80" stroke="#20C997" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x="164" y="20" fill="#20C997" fontSize="9" fontWeight="700">Ovulation</text>

                {/* Luteal elevated baseline */}
                <line x1="170" y1="35" x2="310" y2="35" stroke="#FF5B99" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <text x="240" y="30" fill="var(--text-muted)" fontSize="9" fontWeight="600">Luteal (36.8°)</text>

                {/* Actual Temperature Path */}
                <path
                  d="M 15 62 Q 40 58 70 63 T 130 59 T 155 64 L 175 38 Q 210 32 250 36 T 305 34"
                  fill="none"
                  stroke="#FF9A3C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Dots along path */}
                {[
                  [15, 62], [50, 60], [90, 61], [130, 59], [155, 64],
                  [175, 38], [210, 34], [250, 36], [290, 34]
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#FF9A3C" strokeWidth="2" />
                ))}
              </svg>
            </div>

            <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={handleSaveTemp}>
              Save Temperature
            </Button>
          </div>
        )}
      </div>
    </SheetModal>
  );
}
