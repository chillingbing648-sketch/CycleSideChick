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

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { CycleRing } from "./CycleRing.jsx";
import { GentleReminderCard } from "../../components/home/GentleReminderCard.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { WaterCup } from "../../components/ui/WaterCup.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { TD, I, N, fmt, calculateStats, calculatePregnancy, getDailyPhaseGuidance } from "../../core/engine.js";
import { getReassuranceMessage } from "../../core/content.js";

export function HomeView() {
  const { S, ui } = useStore();
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
  const pregnancyChance = (mode === "contraception") ? "Suppressed" : (isFertileNow ? "High" : (Math.abs(todayDn - (stats.fertileStart || 0)) <= 2 ? "Moderate" : "Low"));

  const daysUntilNextPeriod = stats.nextPred ? Math.max(0, stats.nextPred - todayDn) : 26;
  const daysUntilPeriodText = daysUntilNextPeriod === 0 ? "Today" : `In ${daysUntilNextPeriod} days`;

  let fertileWindowText = "In 8 days";
  if (mode === "contraception") {
    fertileWindowText = "Inactive (Pill Mode)";
  } else if (isFertileNow) {
    fertileWindowText = "This week (Active)";
  } else if (stats.fertileStart && stats.fertileStart > todayDn) {
    const diff = stats.fertileStart - todayDn;
    fertileWindowText = diff <= 7 ? "This week" : `In ${diff} days`;
  } else {
    fertileWindowText = "In 20 days";
  }

  // Cycle History list (real or baseline populated from history)
  const historyCycles = (stats.history && stats.history.length > 0)
    ? stats.history.slice(-3).reverse().map((h, i) => ({
        id: `hist-${i}`,
        days: h.length || 28,
        range: `${fmt(h.start, { month: "short", day: "numeric" })} - ${fmt(h.end, { month: "short", day: "numeric" })}`,
        periodLen: h.duration || 5,
        fertileLen: 6
      }))
    : [
        { id: "h1", days: 28, range: "Jul 19 - Aug 15", periodLen: 5, fertileLen: 6 },
        { id: "h2", days: 28, range: "Jun 21 - Jul 18", periodLen: 5, fertileLen: 6 },
        { id: "h3", days: 26, range: "May 26 - Jun 20", periodLen: 4, fertileLen: 6 }
      ];

  return (
    <div className="v-home-container">
      {/* 1. Header Greeting & Avatar */}
      <div className="v-home-header">
        <div>
          <span className="v-home-greeting">
            {greetingText}, {userName}
          </span>
          <h1 className="v-home-title">Today</h1>
        </div>
        <button
          type="button"
          className="v-home-avatar-btn"
          onClick={() => actions.openProfile()}
          aria-label="Profile and settings"
        >
          <BunnyMascot size={32} />
        </button>
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

      {/* 5. Cycle History Section */}
      <div className="v-history-section">
        <div className="v-history-header">
          <h2 className="v-history-title">Cycle history</h2>
          <span className="v-history-subtitle">January–July</span>
        </div>

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
      </div>

      {/* 6. Daily Hydration Target */}
      {S.waterGoal !== 0 && (
        <Card variant="base" className="v-hydration-card" style={{ padding: "16px" }}>
          <WaterCup
            count={todayWater}
            goal={8}
            onAdd={() => actions.quickSetWater(Math.min(8, todayWater + 1))}
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
    </div>
  );
}
