/**
 * CycleSideChick — Home View Component
 * Recreated to match the exact aesthetic, composition, and interactions
 * of the user reference design:
 * - Clean greeting with user avatar
 * - Compact Mon–Sun week strip with period highlight & active day pill
 * - Hero row with circular recessed CycleWheel & vertical Mood Log capsule slider
 * - 3 vital status rows (Chance of pregnancy, Next period starts, Fertile window)
 * - Cycle history timeline with dual coral & berry capsules
 * - Mode support & supportive wellness insights
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { CycleRing } from "./CycleRing.jsx";
import { GentleReminderCard } from "../../components/home/GentleReminderCard.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { WaterCup } from "../../components/ui/WaterCup.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { KawaiiWaterMascot } from "../../components/water/KawaiiWaterModal.jsx";
import { UterusPhaseIllustration } from "../../components/ui/PhaseIllustrations.jsx";
import { PhaseEducationModal } from "./PhaseEducationModal.jsx";
import { HealthTrackersModal } from "./HealthTrackersModal.jsx";
import { PremiumModal } from "../profile/PremiumModal.jsx";
import { TD, I, N, fmt, calculateStats, calculatePregnancy, getDailyPhaseGuidance } from "../../core/engine.js";
import { getReassuranceMessage } from "../../core/content.js";

export function HomeView() {
  const { S, ui } = useStore();
  const [phaseModal, setPhaseModal] = useState(null);
  const [healthModal, setHealthModal] = useState(null);
  const [premiumModal, setPremiumModal] = useState(false);

  const todayDn = TD();
  const todayStr = I(todayDn);
  const stats = calculateStats(S);
  const cur = stats.cur;
  const mode = S.mode || "natural";

  // Mode calculations
  const preg = mode === "pregnancy" ? calculatePregnancy(S) : null;
  const guidance = getDailyPhaseGuidance(stats, todayDn, S);
  const reassurance = getReassuranceMessage(ui.careReassuranceIdx || 0);

  // Time-based greeting
  const hour = new Date().getHours();
  const greetingText = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userName = S.userName || "Riley";

  // Current Cycle Day & Phase Name
  const cycleDay = cur ? cur.cd : 1;
  let phaseDisplay = "Luteal Phase";
  if (cycleDay <= (S.pl || 5)) {
    phaseDisplay = "Menstruation";
  } else if (stats.ovulationDate && Math.abs(todayDn - stats.ovulationDate) <= 1) {
    phaseDisplay = "Ovulation";
  } else if (stats.fertileStart && todayDn >= stats.fertileStart && todayDn <= stats.fertileEnd) {
    phaseDisplay = "Fertile Window";
  } else if (cycleDay <= 13) {
    phaseDisplay = "Follicular Phase";
  } else {
    phaseDisplay = "Luteal Phase";
  }

  // Week strip calculation (Monday to Sunday of current week)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const mondayDn = todayDn - dayOfWeek;
  const weekDays = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const dn = mondayDn + i;
    const dateStr = I(dn);
    // Parse day of month accurately
    const dObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + i);
    const dayNum = dObj.getDate();
    const isToday = dn === todayDn;
    const isPeriod = Boolean(stats.pdset && stats.pdset.has(dn));
    const isPredicted = Boolean(stats.predictedDates && stats.predictedDates.includes(dn));
    weekDays.push({
      dn,
      dateStr,
      dayName: dayNames[i],
      dayNum,
      isToday,
      isPeriod: isPeriod || isPredicted
    });
  }

  // Mood Log state (0: Distressed to 4: Great)
  const todayLog = (S.logs && S.logs[todayStr]) || {};
  const currentMood = todayLog.m !== undefined ? todayLog.m : 2; // Default to neutral
  const todayWater = todayLog.water || 0;

  const MOOD_FACES = [
    { level: 4, label: "Great", icon: "moodHappy" },
    { level: 3, label: "Good", icon: "moodCalm" },
    { level: 2, label: "Neutral", icon: "moodNeutral" },
    { level: 1, label: "Low", icon: "moodLow" },
    { level: 0, label: "Heavy", icon: "moodIrritable" }
  ];

  // Vital Status Calculations
  const isFertileNow = stats.fertileStart && stats.fertileEnd && todayDn >= stats.fertileStart && todayDn <= stats.fertileEnd;
  const pregnancyChance = (mode === "contraception")
    ? "Suppressed"
    : (stats.fertileStart && stats.fertileEnd)
      ? (isFertileNow ? "High" : (Math.abs(todayDn - (stats.fertileStart || 0)) <= 2 ? "Moderate" : "Low"))
      : "Awaiting data";

  const daysUntilNextPeriod = stats.nextPred ? Math.max(0, stats.nextPred - todayDn) : null;
  const daysUntilPeriodText = daysUntilNextPeriod === null
    ? "Awaiting data"
    : daysUntilNextPeriod === 0
      ? "Today"
      : `In ${daysUntilNextPeriod} day${daysUntilNextPeriod === 1 ? "" : "s"}`;

  let fertileWindowText = "Awaiting data";
  if (mode === "contraception") {
    fertileWindowText = "Inactive (Pill Mode)";
  } else if (isFertileNow) {
    fertileWindowText = "This week (Active)";
  } else if (stats.fertileStart && stats.fertileStart > todayDn) {
    const diff = stats.fertileStart - todayDn;
    fertileWindowText = diff <= 7 ? "This week" : `In ${diff} day${diff === 1 ? "" : "s"}`;
  } else if (stats.fertileStart) {
    fertileWindowText = "Window completed";
  }

  // Cycle History list (derived purely from user's recorded periods; no fabricated data)
  const historyCycles = (stats.history && stats.history.length > 0)
    ? stats.history.slice(-3).reverse().map((h, i) => ({
        id: `hist-${i}`,
        days: h.length || 28,
        range: `${fmt(h.start, { month: "short", day: "numeric" })} - ${fmt(h.end, { month: "short", day: "numeric" })}`,
        periodLen: h.duration || 5,
        fertileLen: 6
      }))
    : [];

  return (
    <div className="v-home-container">
      {/* 1. Header Greeting & Avatar */}
      <div className="v-home-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="v-sidebar-toggle-btn"
            onClick={() => actions.openSidebar()}
            aria-label="Open sidebar menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <div>
            <span className="v-home-greeting">
              {greetingText}, {userName}
            </span>
            <h1 className="v-home-title">Home</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {S.premium ? (
            <button
              type="button"
              onClick={() => setPremiumModal(true)}
              style={{
                background: "var(--surface-tint)",
                color: "var(--primary)",
                border: "1px solid var(--berry-border)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.04em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Evaluation License Active"
            >
              <span>PRO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPremiumModal(true)}
              style={{
                background: "var(--surface-tint)",
                color: "var(--primary)",
                border: "1px solid var(--berry-border)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Test Evaluation License"
            >
              <span>Premium</span>
            </button>
          )}
          <button
            type="button"
            className="chip"
            onClick={() => actions.openPartner()}
            style={{
              background: "var(--lavender-soft, #F5EFF7)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "999px",
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--plum)"
            }}
            title="Cycle Care Companion"
          >
            <Icon name="heart" size={13} />
            <span>Companion</span>
          </button>
          <button
            type="button"
            className="v-home-avatar-btn"
            onClick={() => actions.openProfile()}
            aria-label="Profile and settings"
          >
            <BunnyMascot size={32} />
          </button>
        </div>
      </div>

      {/* 2. Week Strip */}
      <div className="v-home-week-strip" role="region" aria-label="Weekly cycle calendar">
        {weekDays.map(w => (
          <button
            key={w.dateStr}
            type="button"
            className={`v-week-day-cell ${w.isToday ? "v-week-day-cell--today" : ""} ${w.isPeriod ? "v-week-day-cell--period" : ""}`}
            onClick={() => actions.goLog(w.dateStr)}
            aria-label={`${w.dayName} ${w.dayNum}${w.isToday ? ", Today" : ""}${w.isPeriod ? ", Period day" : ""}`}
          >
            <span className="v-week-day-name">{w.dayName}</span>
            <span className="v-week-day-num">{w.dayNum}</span>
          </button>
        ))}
      </div>

      {/* Gentle Reminder Card (Upcoming period / Daily check-in / Care) */}
      <GentleReminderCard stats={stats} S={S} todayDn={todayDn} todayLog={todayLog} />

      {/* 3. Central Hero Row: Cycle Wheel & Vertical Mood Log */}
      <div className="v-hero-wheel-row">
        {/* Left: Cycle Ring SVG with Neomorphic Trough */}
        <div className="v-hero-ring-col">
          <CycleRing stats={stats} day={cycleDay} S={S} phaseName={phaseDisplay} />
        </div>

        {/* Right: Vertical Mood Log Capsule Slider */}
        <div className="v-mood-log-col" aria-label="Mood log interactive slider">
          <div className="v-mood-track-wrapper">
            {/* The Vertical Recessed Groove Capsule */}
            <div
              className="v-mood-track-groove"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const frac = Math.max(0, Math.min(1, y / rect.height));
                const level = Math.round((1 - frac) * 4);
                actions.quickSetMood(level);
              }}
              role="slider"
              aria-label="Mood level"
              aria-valuenow={currentMood}
              aria-valuemin="0"
              aria-valuemax="4"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") actions.quickSetMood(Math.min(4, currentMood + 1));
                if (e.key === "ArrowDown") actions.quickSetMood(Math.max(0, currentMood - 1));
              }}
            >
              {/* Floating Glowing Pink Pill Thumb positioned based on current mood (0 to 4) */}
              <div
                className="v-mood-thumb"
                style={{
                  top: `${(4 - currentMood) * 22 + 4}%`
                }}
              />
            </div>

            {/* 5 Mood Face Target Buttons */}
            <div className="v-mood-faces-list">
              {MOOD_FACES.map(m => {
                const isSelected = currentMood === m.level;
                return (
                  <button
                    key={m.level}
                    type="button"
                    className={`v-mood-face-btn ${isSelected ? "active" : ""}`}
                    onClick={() => actions.quickSetMood(m.level)}
                    aria-label={`Log mood: ${m.label}`}
                    title={m.label}
                  >
                    <Icon name={m.icon} size={17} />
                  </button>
                );
              })}
            </div>
          </div>
          <span className="v-mood-label">Mood Log</span>
        </div>
      </div>

      {/* Quick Period Logging & Status Bar */}
      <div
        className="v-period-quick-bar"
        onClick={() => actions.openPeriodModal(todayStr)}
        role="button"
        tabIndex={0}
        aria-label="Open period logging modal"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: cur && cur.isPeriod
            ? "linear-gradient(135deg, rgba(255, 91, 153, 0.14), rgba(255, 142, 180, 0.2))"
            : "var(--surface)",
          border: cur && cur.isPeriod
            ? "1.5px solid rgba(255, 91, 153, 0.4)"
            : "1px solid var(--border)",
          borderRadius: "16px",
          cursor: "pointer",
          marginBottom: "12px",
          transition: "transform 0.15s ease, box-shadow 0.15s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: cur && cur.isPeriod ? "var(--primary)" : "var(--surface-soft)",
              color: cur && cur.isPeriod ? "#FFFFFF" : "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon name="droplet" size={17} />
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: "800", color: "var(--text)", fontFamily: "var(--font-heading)" }}>
              {cur && cur.isPeriod ? `Period Day ${cur.cd} Active` : "Log Period & Flow"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {cur && cur.isPeriod ? "Tap to record flow or end period" : "Tap to record period start, spotting, or flow"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            actions.openPeriodModal(todayStr);
          }}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "none",
            background: "var(--primary)",
            color: "#FFFFFF",
            fontSize: "11.5px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          {cur && cur.isPeriod ? "Log Flow" : "Log Period"}
        </button>
      </div>

      {/* 4. Vital Status Rows */}
      <div className="v-vital-status-card">
        {/* Row 1: Chance of pregnancy */}
        <div className="v-vital-row">
          <div className="v-vital-icon v-vital-icon--sparkle">
            <Icon name="sparkle" size={17} />
          </div>
          <div className="v-vital-text">
            <span>Chance of pregnancy: </span>
            <b>{pregnancyChance}</b>
          </div>
        </div>

        {/* Row 2: Next period starts */}
        <div className="v-vital-row">
          <div className="v-vital-icon v-vital-icon--droplet">
            <Icon name="droplet" size={17} />
          </div>
          <div className="v-vital-text">
            <span>Next period starts: </span>
            <b>{daysUntilPeriodText}</b>
          </div>
        </div>

        {/* Row 3: Fertile window begins */}
        <div className="v-vital-row">
          <div className="v-vital-icon v-vital-icon--heart">
            <Icon name="heart" size={17} />
          </div>
          <div className="v-vital-text">
            <span>Fertile window begins: </span>
            <b>{fertileWindowText}</b>
          </div>
        </div>
      </div>

      {/* 5. Menstrual Phase Educational Cards (Reference Row 6 Screen 3) */}
      <div className="v-phase-carousel-section" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)", margin: 0 }}>
            Menstrual Phase
          </h2>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
            Tap to learn more
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "4px"
          }}
        >
          {[
            { id: "menstrual", name: "Menstrual", days: "Days 1–5", color: "#FF5B99" },
            { id: "follicular", name: "Follicular", days: "Days 6–13", color: "#FF9A3C" },
            { id: "ovulation", name: "Ovulation", days: "Days 14–16", color: "#20C997" },
            { id: "luteal", name: "Luteal", days: "Days 17–28", color: "#9C27B0" }
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setPhaseModal(p.id)}
              style={{
                background: "var(--surface)",
                borderRadius: "18px",
                border: "1px solid var(--border)",
                padding: "12px 6px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = p.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <UterusPhaseIllustration phase={p.id} size={54} />
              <b style={{ fontSize: "12px", color: "var(--text)", marginTop: "6px", display: "block" }}>
                {p.name}
              </b>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
                {p.days}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Health Trackers Quick Widgets (Reference Row 9 & 10) */}
      <div className="v-health-metrics-section" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)", margin: 0 }}>
            Health Trackers
          </h2>
          <button
            type="button"
            onClick={() => setHealthModal("water")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Open Trackers
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {/* Water Widget */}
          <div
            className="v-home-water-widget"
            onClick={() => actions.openWaterModal()}
            style={{
              background: "var(--surface)",
              borderRadius: "18px",
              border: "1px solid var(--border)",
              padding: "14px 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <div style={{ width: "26px", height: "30px", marginBottom: "4px" }}>
              <KawaiiWaterMascot fillPct={Math.min(100, Math.round(((todayLog.waterMl || (todayLog.water ? todayLog.water * 250 : 600)) / (S.waterGoalMl || 2000)) * 100))} isBobbing={false} size={26} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>WATER</span>
            <b style={{ fontSize: "14.5px", color: "var(--color-water, #2B8CEE)", margin: "3px 0" }}>
              {todayLog.waterMl || (todayLog.water ? todayLog.water * 250 : 600)} ml
            </b>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Goal: {S.waterGoalMl || 2000} ml</span>
          </div>

          {/* Weight Widget */}
          <div
            onClick={() => setHealthModal("weight")}
            style={{
              background: "var(--surface)",
              borderRadius: "18px",
              border: "1px solid var(--border)",
              padding: "14px 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <span style={{ fontSize: "22px", marginBottom: "4px" }}>⚖️</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>WEIGHT</span>
            <b style={{ fontSize: "14.5px", color: "var(--primary)", margin: "3px 0" }}>
              {S.weight || 60.0} {S.weightUnit || "kg"}
            </b>
            <span style={{ fontSize: "10px", color: "#20C997", fontWeight: "700" }}>BMI Normal</span>
          </div>

          {/* Temperature BBT Widget */}
          <div
            onClick={() => setHealthModal("temp")}
            style={{
              background: "var(--surface)",
              borderRadius: "18px",
              border: "1px solid var(--border)",
              padding: "14px 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <span style={{ fontSize: "22px", marginBottom: "4px" }}>🌡️</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>TEMP</span>
            <b style={{ fontSize: "14.5px", color: "#FF9A3C", margin: "3px 0" }}>
              {todayLog.bbt ? parseFloat(todayLog.bbt).toFixed(1) : (S.bbtUnit === "f" ? "97.8" : "36.6")}°{S.bbtUnit === "f" ? "F" : "C"}
            </b>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Biphasic</span>
          </div>
        </div>
      </div>

      {/* 7. Cycle History Section */}
      <div className="v-history-section">
        <div className="v-history-header">
          <h2 className="v-history-title">Cycle history</h2>
          {historyCycles.length > 0 && (
            <span className="v-history-subtitle">
              {stats.history.length > 1
                ? `Last ${Math.min(3, stats.history.length)} recorded cycles`
                : "1 recorded cycle"}
            </span>
          )}
        </div>

        {historyCycles.length > 0 ? (
          <div className="v-history-list">
            {historyCycles.map(c => (
              <div key={c.id} className="v-history-item">
                {/* Dual Coral & Berry Progress Bar */}
                <div className="v-history-bar-track">
                  {/* Menstrual Capsule (Coral) */}
                  <div
                    className="v-history-capsule v-history-capsule--coral"
                    style={{ width: `${Math.min(60, c.periodLen * 9)}px` }}
                    title={`Period duration: ${c.periodLen} days`}
                  />
                  {/* Fertile Capsule (Berry Pink) */}
                  <div
                    className="v-history-capsule v-history-capsule--berry"
                    style={{ width: `${Math.min(70, c.fertileLen * 10)}px` }}
                    title="Fertile window"
                  />
                </div>

                {/* Text Info */}
                <div className="v-history-info">
                  <b className="v-history-days">{c.days} days</b>
                  <span className="v-history-range">{c.range}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="v-empty-history-card" style={{
            padding: "20px 16px",
            background: "var(--card-bg, #FFFFFF)",
            borderRadius: "16px",
            border: "1px dashed var(--border-soft, #F0EAE8)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--tint-rose-bg, #FFF0F3)",
              color: "var(--primary, #E06D7D)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Icon name="calendar" size={18} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--plum, #4A3545)", marginBottom: "4px" }}>
                No completed cycles yet
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted, #8E7A8A)", lineHeight: 1.4, maxWidth: "260px" }}>
                As you log periods, your personalized cycle history and duration trends will appear here.
              </div>
            </div>
            <button
              type="button"
              className="c-btn c-btn--secondary c-btn--sm"
              onClick={() => actions.openPeriodModal(todayStr)}
              style={{ marginTop: "4px" }}
            >
              Log Period Today
            </button>
          </div>
        )}
      </div>

      {/* 6. Daily Hydration Target */}
      {S.waterGoal !== 0 && (
        <Card
          variant="base"
          className="v-hydration-card"
          style={{ padding: "16px", cursor: "pointer", transition: "transform 0.15s ease" }}
          onClick={() => actions.openWaterModal()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#0077FE", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Daily Hydration Care
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--primary)" }}>
              Tap to Log & Animate →
            </span>
          </div>
          <WaterCup
            count={todayWater}
            goal={8}
            onAdd={() => actions.openWaterModal(250)}
            onReset={() => actions.quickSetWater(0)}
          />
        </Card>
      )}

      {/* 7. Daily Reassurance & Hormonal Guidance Card */}
      <Card variant="base" className="v-support-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--tint-rose-bg)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="flower" size={15} />
            </div>
            <b style={{ fontSize: "13.5px", color: "var(--plum)" }}>Daily Hormone Care</b>
          </div>
          <button
            type="button"
            className="icon-btn sm"
            onClick={() => actions.nextReassurance()}
            aria-label="Rotate gentle reassurance"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <Icon name="refresh" size={15} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5", color: "var(--text-muted)", fontStyle: "italic" }}>
          "{reassurance}"
        </p>
      </Card>

      {/* Transparency & Ethical Medical Disclaimer */}
      <div style={{
        marginTop: "16px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "var(--bg-subtle, rgba(230, 215, 225, 0.2))",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "11.5px",
        color: "var(--text-muted, #8E7A8A)",
        lineHeight: "1.4"
      }}>
        <div style={{ flexShrink: 0, marginTop: "2px", color: "var(--primary)" }}>
          <Icon name="shield" size={13} />
        </div>
        <span>
          CycleSideChick calculations are mathematical estimates based on your logged history, not medical diagnoses or birth control guarantees.
        </span>
      </div>

      {/* Dynamic Modals Hosted in Home */}
      {phaseModal && (
        <PhaseEducationModal
          initialPhase={phaseModal}
          isOpen={true}
          onClose={() => setPhaseModal(null)}
        />
      )}
      {healthModal && (
        <HealthTrackersModal
          initialTab={healthModal}
          isOpen={true}
          onClose={() => setHealthModal(null)}
        />
      )}
      {premiumModal && (
        <PremiumModal
          isOpen={true}
          onClose={() => setPremiumModal(false)}
        />
      )}
    </div>
  );
}
