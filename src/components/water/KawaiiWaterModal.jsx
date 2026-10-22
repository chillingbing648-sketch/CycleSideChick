/**
 * CycleSideChick — Kawaii Interactive Water Intake & Appreciation System
 * 
 * Features:
 * - Animated liquid wave fill with dual sine-wave motion & rising micro-bubbles
 * - Adorable floating kawaii water droplet mascot with blushing cheeks & glossy shine
 * - Instant tap-to-log drink containers (Glass 250ml, Mug 350ml, Bottle 500ml, Tumbler 750ml, Carafe 1000ml)
 * - Fine-tune steppers (-100ml / +100ml)
 * - Rich appreciation & reward section celebrating the user's hydration self-care
 * - Cycle-phase tailored physiological hydration insights
 * - Milestone checkpoints (25%, 50%, 75%, 100%)
 * - Tactile haptics & joyful micro-animations
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../ui/SheetModal.jsx";
import { Icon } from "../ui/Icon.jsx";
import { TD, I, calculateStats } from "../../core/engine.js";

// Kawaii Mascot Droplet Component
export function KawaiiWaterMascot({ fillPct = 50, isBobbing = true, size = 64 }) {
  const isHappy = fillPct >= 50;
  const isEcstatic = fillPct >= 100;

  return (
    <div
      className={`v-kawaii-mascot-wrap ${isBobbing ? "is-bobbing" : ""}`}
      style={{
        width: `${size}px`,
        height: `${size * 1.15}px`,
        position: "relative",
        display: "inline-block"
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 115"
        width={size}
        height={size * 1.15}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 6px 14px rgba(43, 140, 238, 0.35))" }}
      >
        <defs>
          <linearGradient id="kawaiiWaterGrad" x1="50" y1="8" x2="50" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#70D6FF" />
            <stop offset="50%" stopColor="#38B6FF" />
            <stop offset="100%" stopColor="#0077FE" />
          </linearGradient>
          <radialGradient id="kawaiiBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Droplet Body */}
        <path
          d="M 50 10 C 50 10 16 58 16 84 C 16 102 31.2 114 50 114 C 68.8 114 84 102 84 84 C 84 58 50 10 50 10 Z"
          fill="url(#kawaiiWaterGrad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />

        {/* Specular Highlight Arc */}
        <path
          d="M 32 38 C 24 54 24 72 30 80"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="38" cy="30" r="2.5" fill="#FFFFFF" opacity="0.9" />

        {/* Rosy Blushing Cheeks */}
        <ellipse cx="32" cy="84" rx="6" ry="4" fill="url(#kawaiiBlush)" />
        <ellipse cx="68" cy="84" rx="6" ry="4" fill="url(#kawaiiBlush)" />

        {/* Facial Expression (Eyes) */}
        {isEcstatic ? (
          // Joyful squinting arch eyes (> < or smiling arcs)
          <g stroke="#0A2540" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 34 76 Q 40 70 46 76" />
            <path d="M 54 76 Q 60 70 66 76" />
          </g>
        ) : isHappy ? (
          // Sweet curved smiling eyes
          <g stroke="#0A2540" strokeWidth="2.4" strokeLinecap="round">
            <path d="M 36 74 Q 41 69 46 74" />
            <path d="M 54 74 Q 59 69 64 74" />
          </g>
        ) : (
          // Gentle round curious eyes with sparkle reflections
          <g fill="#0A2540">
            <ellipse cx="40" cy="72" rx="3.5" ry="4.5" />
            <circle cx="39" cy="70" r="1.5" fill="#FFFFFF" />
            <ellipse cx="60" cy="72" rx="3.5" ry="4.5" />
            <circle cx="59" cy="70" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Smiling Mouth */}
        {isEcstatic ? (
          <path
            d="M 44 82 Q 50 92 56 82 Z"
            fill="#FF4D6D"
            stroke="#0A2540"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M 46 82 Q 50 87 54 82"
            fill="none"
            stroke="#0A2540"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}

export function KawaiiWaterModal({ isOpen = true, onClose }) {
  const { S } = useStore();
  const todayStr = I(TD());
  const todayLog = (S.logs && S.logs[todayStr]) || {};

  const stats = calculateStats(S);
  const curPhase = stats.phase || "follicular";

  // Hydration state
  const waterGoal = S.waterGoalMl || 2000;
  const currentWaterMl = todayLog.waterMl !== undefined
    ? todayLog.waterMl
    : (todayLog.water ? todayLog.water * 250 : 0);

  const fillPct = Math.min(100, Math.round((currentWaterMl / waterGoal) * 100));
  const remainingMl = Math.max(0, waterGoal - currentWaterMl);

  // Animation trigger on logging
  const [justLogged, setJustLogged] = useState(null); // amount logged for badge burst

  // Quick preset options
  const PRESETS = [
    { id: "glass", name: "Glass", amount: 250, icon: "cup", hint: "Small Sip" },
    { id: "mug", name: "Mug / Tea", amount: 350, icon: "cup", hint: "Warm Cup" },
    { id: "bottle", name: "Bottle", amount: 500, icon: "droplet", hint: "Standard" },
    { id: "tumbler", name: "Tumbler", amount: 750, icon: "droplet", hint: "Hydration Plus" },
    { id: "carafe", name: "Carafe", amount: 1000, icon: "droplet", hint: "Deep Hydration" }
  ];

  const handleLogAmount = (amount) => {
    setJustLogged(amount);
    actions.logWaterIntake(amount, todayStr);
    setTimeout(() => setJustLogged(null), 1800);
  };

  const handleAdjust = (delta) => {
    const newTotal = Math.max(0, currentWaterMl + delta);
    actions.setWaterTotal(newTotal, todayStr);
  };

  const handleReset = () => {
    actions.setWaterTotal(0, todayStr);
    actions.toast("Water log reset for today");
  };

  // Determine Appreciation Level
  const getAppreciationData = () => {
    if (currentWaterMl >= waterGoal) {
      return {
        level: 5,
        badge: "Hydration Champion 👑",
        title: "Daily Goal Smashed!",
        compliment: "Outstanding self-care! Your cells are thoroughly replenished, your metabolism is energized, and your skin is radiating natural health.",
        phaseTip: getPhaseHydrationTip(curPhase)
      };
    }
    if (currentWaterMl >= 1500) {
      return {
        level: 4,
        badge: "Vitality Flow 🌸",
        title: "Incredible Hydration Dedication!",
        compliment: "Over 1.5 liters recorded today! You're supporting optimal blood volume, joint lubrication, and steady hormonal delivery.",
        phaseTip: getPhaseHydrationTip(curPhase)
      };
    }
    if (currentWaterMl >= 1000) {
      return {
        level: 3,
        badge: "Halfway Star 🌟",
        title: "Halfway There! Look At You Glow!",
        compliment: "1,000+ ml down! Regular sips prevent midday brain fog, soothe muscle tension, and assist kidney filtration.",
        phaseTip: getPhaseHydrationTip(curPhase)
      };
    }
    if (currentWaterMl >= 500) {
      return {
        level: 2,
        badge: "Cellular Glow ✨",
        title: "Building Great Hydration Momentum!",
        compliment: "Wonderful rhythm! Hydrating consistently helps soothe pelvic sensitivity, reduces headaches, and curbs energy crashes.",
        phaseTip: getPhaseHydrationTip(curPhase)
      };
    }
    if (currentWaterMl > 0) {
      return {
        level: 1,
        badge: "First Sip 💧",
        title: "Loving Start To Your Day!",
        compliment: "Every single glass makes a physiological difference. You're giving your body the gentle care it deserves.",
        phaseTip: getPhaseHydrationTip(curPhase)
      };
    }
    return {
      level: 0,
      badge: "Ready To Hydrate 🌱",
      title: "Time For A Refreshing Sip!",
      compliment: "Your body is over 60% water. Take a peaceful moment right now to nourish yourself with a fresh glass.",
      phaseTip: getPhaseHydrationTip(curPhase)
    };
  };

  function getPhaseHydrationTip(phase) {
    switch (phase) {
      case "menstrual":
        return "Warm fluids help soothe pelvic smooth muscle contractions and ease cramping.";
      case "follicular":
        return "Rising estrogen boosts collagen synthesis; consistent water intake enhances natural skin radiance.";
      case "ovulatory":
        return "High hydration supports the clarity and elasticity of fertile cervical fluid.";
      case "luteal":
      default:
        return "Adequate water counterintuitively signals your kidneys to flush excess sodium, reducing luteal bloating.";
    }
  }

  const appreciation = getAppreciationData();

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Hydration Care"
      maxWidth="500px"
      className="v-water-modal-sheet"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
        
        {/* 1. ANIMATED KAWAII WATER FILL VESSEL */}
        <div className="v-water-vessel-container">
          {/* Glass Vessel Outline */}
          <div className="v-water-glass">
            {/* Liquid Fill Element with Wave Header */}
            <div
              className="v-water-liquid"
              style={{
                height: `${Math.max(6, fillPct)}%`,
                transition: "height 0.8s cubic-bezier(0.34, 1.35, 0.64, 1)"
              }}
            >
              {/* Dual Surface Waves */}
              <div className="v-water-wave v-water-wave-front" />
              <div className="v-water-wave v-water-wave-back" />

              {/* Rising Micro-Bubbles */}
              <div className="v-bubble v-bubble-1" />
              <div className="v-bubble v-bubble-2" />
              <div className="v-bubble v-bubble-3" />
              <div className="v-bubble v-bubble-4" />
              <div className="v-bubble v-bubble-5" />

              {/* Floating Kawaii Mascot Bobbing on Wave Surface */}
              <div className="v-water-mascot-surface-anchor">
                <KawaiiWaterMascot fillPct={fillPct} size={54} />
              </div>
            </div>

            {/* Percentage Badge */}
            <div className="v-water-percent-badge">
              <span>{fillPct}%</span>
            </div>

            {/* Specular Glass Highlight Curves */}
            <div className="v-water-glass-shine" />
          </div>

          {/* Just Logged Celebration Burst Indicator */}
          {justLogged && (
            <div className="v-water-burst-pill">
              <Icon name="sparkles" size={14} />
              <span>+{justLogged} ml logged!</span>
            </div>
          )}
        </div>

        {/* 2. NUMERIC VOLUME READOUT */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "38px", fontWeight: "900", fontFamily: "var(--font-heading)", color: "var(--text)", lineHeight: 1.1 }}>
            {currentWaterMl.toLocaleString()} <span style={{ fontSize: "18px", color: "var(--text-muted)", fontWeight: "600" }}>ml</span>
          </div>
          <div style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "6px", fontWeight: "600" }}>
            Daily Goal: <b>{waterGoal.toLocaleString()} ml</b>
            {remainingMl > 0 ? ` · ${remainingMl.toLocaleString()} ml remaining` : " · Goal Accomplished! 🎉"}
          </div>

          {/* Progress Bar with Milestones */}
          <div style={{ width: "240px", margin: "14px auto 0" }}>
            <div style={{ width: "100%", height: "8px", background: "var(--surface-soft)", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${fillPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #38B6FF 0%, #0077FE 100%)",
                  borderRadius: "999px",
                  transition: "width 0.8s cubic-bezier(0.34, 1.35, 0.64, 1)"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "var(--text-muted)", fontWeight: "700" }}>
              <span>0 ml</span>
              <span>1,000 ml</span>
              <span>2,000 ml</span>
            </div>
          </div>
        </div>

        {/* 3. LOG INTAKE CONTAINERS SECTION (Quick Tap-to-Log) */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0 4px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Log A Drink
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleAdjust(-100)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--text-muted)",
                  cursor: "pointer"
                }}
                title="Subtract 100 ml"
              >
                -100 ml
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(100)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--primary)",
                  cursor: "pointer"
                }}
                title="Add 100 ml"
              >
                +100 ml
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
            {PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                className="v-water-preset-btn"
                onClick={() => handleLogAmount(p.amount)}
              >
                <div className="v-water-preset-icon-circle">
                  <Icon name={p.icon} size={15} />
                </div>
                <b className="v-water-preset-amount">+{p.amount}</b>
                <span className="v-water-preset-name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. ANIMATED HYDRATION APPRECIATION & REWARD CARD */}
        <div className="v-hydration-reward-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="v-hydration-reward-badge">
              {appreciation.badge}
            </span>
          </div>

          <h3 className="v-hydration-reward-title">
            {appreciation.title}
          </h3>

          <p className="v-hydration-reward-compliment">
            {appreciation.compliment}
          </p>

          <div className="v-hydration-phase-note">
            <Icon name="heart" size={14} />
            <span>
              <b>Cycle Care ({curPhase}):</b> {appreciation.phaseTip}
            </span>
          </div>
        </div>

        {/* 5. FOOTER CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "6px"
            }}
          >
            Reset today's water
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 22px",
              borderRadius: "999px",
              border: "none",
              background: "var(--primary)",
              color: "#FFFFFF",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255, 91, 153, 0.3)"
            }}
          >
            Keep Glowing
          </button>
        </div>

      </div>
    </SheetModal>
  );
}
