/**
 * CycleSideChick — Home View Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { CycleRing } from "./CycleRing.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt, calculateStats, calculatePregnancy, getDailyPhaseGuidance } from "../../core/engine.js";
import { getReassuranceMessage } from "../../core/content.js";

export function HomeView() {
  const { S, ui } = useStore();
  const todayDn = TD();
  const stats = calculateStats(S);
  const cur = stats.cur;
  const mode = S.mode || "natural";

  // Mode calculations
  const preg = mode === "pregnancy" ? calculatePregnancy(S) : null;
  const guidance = getDailyPhaseGuidance(stats, todayDn, S);
  const reassurance = getReassuranceMessage(ui.careReassuranceIdx || 0);

  // Week strip calculation (today - 3 to today + 3)
  const weekDays = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = todayDn + offset;
    const dateStr = I(d);
    const hasLog = S.logs && S.logs[dateStr];
    const isPeriod = stats.pdset && stats.pdset.has(d);
    const isToday = offset === 0;
    const isSelected = ui.selDay === dateStr;
    weekDays.push({ d, dateStr, isPeriod, hasLog, isToday, isSelected });
  }

  const feelings = ["calm", "grounded", "tender", "sensitive", "tired", "energized"];
  const todayFeeling = S.careCheckin && S.careCheckin[I(todayDn)] ? S.careCheckin[I(todayDn)].feeling : null;

  return (
    <div className="home-view">
      {/* 1. Greeting Header */}
      <div className="home-greeting" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <span className="subtle" style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {fmt(todayDn, { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h2 style={{ margin: "2px 0 0", fontSize: "22px" }}>
            Hello, friend
          </h2>
        </div>
        <button
          type="button"
          className="btn g sm"
          onClick={() => actions.openTour()}
          aria-label="Open 4-phase cycle tour"
        >
          <Icon name="sparkle" size={16} />
          <span>Cycle Tour</span>
        </button>
      </div>

      {/* 2. Mode Hero */}
      {mode === "pregnancy" && preg ? (
        <div className="card tint-butter hero-card" style={{ padding: "20px", marginBottom: "16px", textAlign: "center" }}>
          <span className="pill-tag" style={{ background: "var(--tint-butter-border)", color: "var(--tint-butter-text)" }}>
            Pregnancy Companion
          </span>
          <div style={{ margin: "14px 0 6px", fontSize: "32px", fontWeight: "800", color: "var(--plum)" }}>
            {preg.weeks} weeks, {preg.days} days
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            {preg.trimester} · Estimated Due Date: {preg.edd ? fmt(N(preg.edd)) : "Set in Settings"}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
            {preg.milestone}
          </p>
        </div>
      ) : mode === "perimenopause" ? (
        <div className="card tint-sage hero-card" style={{ padding: "20px", marginBottom: "16px", textAlign: "center" }}>
          <span className="pill-tag" style={{ background: "var(--tint-sage-border)", color: "var(--tint-sage-text)" }}>
            Perimenopause Mode
          </span>
          <div style={{ margin: "14px 0 6px", fontSize: "28px", fontWeight: "800", color: "var(--plum)" }}>
            Cycle Day {stats.cur ? stats.cur.cd : "—"}
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            Tracking shifts with kindness · Variability: {stats.variability ? stats.variability.level : "Baseline"}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
            Hormonal fluctuations are completely natural during this transition. Prioritize deep rest and hydration.
          </p>
        </div>
      ) : mode === "contraception" ? (
        <div className="card tint-sky hero-card" style={{ padding: "20px", marginBottom: "16px", textAlign: "center" }}>
          <span className="pill-tag" style={{ background: "var(--tint-sky-border)", color: "var(--tint-sky-text)" }}>
            Hormonal Contraception
          </span>
          <div style={{ margin: "14px 0 6px", fontSize: "28px", fontWeight: "800", color: "var(--plum)" }}>
            Active Routine
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            Natural ovulation suppressed · Monitoring withdrawal bleeds and daily wellness
          </p>
          <button type="button" className="btn sm" onClick={() => actions.goLog(I(todayDn))}>
            Log Today's Pill & Symptoms
          </button>
        </div>
      ) : (
        /* Natural / TTC / Irregular Cycle Ring Hero */
        <div className="hero-ring-container" style={{ textAlign: "center", marginBottom: "16px" }}>
          <div onClick={() => actions.openTour()} style={{ cursor: "pointer", display: "inline-block" }}>
            <CycleRing stats={stats} day={cur ? cur.cd : 1} S={S} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
            <span className="phase-pill" style={{ background: "var(--tint-rose-bg)", color: "var(--tint-rose-text)", padding: "4px 12px", borderRadius: "100px", fontSize: "12.5px", fontWeight: "700" }}>
              {guidance.phase || "Natural Phase"}
            </span>
            {stats.nextPred && (
              <span className="subtle-pill" style={{ background: "var(--surface-alt)", color: "var(--muted)", padding: "4px 12px", borderRadius: "100px", fontSize: "12.5px" }}>
                Next: ~{fmt(stats.nextPred)}
              </span>
            )}
          </div>

          <div style={{ marginTop: "14px" }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => actions.startPeriodToday()}
            >
              <Icon name="droplet" size={16} />
              <span>Period started today</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Week Strip */}
      <div className="card" style={{ padding: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {weekDays.map(w => (
            <button
              key={w.dateStr}
              type="button"
              className={`week-day-cell ${w.isToday ? "today" : ""} ${w.isPeriod ? "period" : ""}`}
              onClick={() => actions.goLog(w.dateStr)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 6px",
                borderRadius: "12px",
                border: w.isToday ? "2px solid var(--pink)" : "1px solid transparent",
                background: w.isPeriod ? "var(--tint-rose-bg)" : "transparent",
                cursor: "pointer",
                minWidth: "40px"
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>
                {fmt(w.d, { weekday: "narrow" })}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "700", marginTop: "2px", color: w.isPeriod ? "var(--pink)" : "inherit" }}>
                {fmt(w.d, { day: "numeric" })}
              </span>
              {w.hasLog && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--pink)", marginTop: "4px" }} />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Daily Guidance Tip */}
      <div className="card tint-lavender" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Icon name="sparkle" size={18} />
          <b style={{ fontSize: "14px" }}>Daily Hormone Insight</b>
        </div>
        <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
          {guidance.summary || "Listen to your body's signals today. Fluctuations in energy reflect natural endocrine rhythm shifts."}
        </p>
      </div>

      {/* 5. Care Corner Reassurance & Quick Check-in */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="heart" size={18} />
            <b style={{ fontSize: "14px" }}>Daily Reassurance</b>
          </div>
          <button
            type="button"
            className="icon-btn sm"
            onClick={() => actions.nextReassurance()}
            aria-label="New gentle reminder"
            style={{ border: "none", background: "none", cursor: "pointer", padding: "4px" }}
          >
            <Icon name="refresh" size={16} />
          </button>
        </div>
        <p style={{ margin: "0 0 14px", fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5", color: "var(--plum)" }}>
          "{reassurance}"
        </p>

        <span className="subtle" style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
          HOW ARE YOU FEELING RIGHT NOW?
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {feelings.map(f => {
            const isSelected = todayFeeling === f;
            return (
              <button
                key={f}
                type="button"
                className={`chip ${isSelected ? "active" : ""}`}
                onClick={() => actions.careCheckin(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontSize: "12.5px",
                  border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pink-light)" : "var(--surface)",
                  cursor: "pointer"
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
