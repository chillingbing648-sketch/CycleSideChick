/**
 * CycleSideChick — Home View Component
 * Mode-adaptive hero, dynamic cycle ring with smooth draw-in,
 * week strip, daily reassurance, and floating "Log today" pill.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { CycleRing } from "./CycleRing.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { WaterCup } from "../../components/ui/WaterCup.jsx";
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
    const hasLog = Boolean(S.logs && S.logs[dateStr]);
    const isPeriod = Boolean(stats.pdset && stats.pdset.has(d));
    const isToday = offset === 0;
    const isSelected = ui.selDay === dateStr;
    weekDays.push({ d, dateStr, isPeriod, hasLog, isToday, isSelected });
  }

  const feelings = ["calm", "grounded", "tender", "sensitive", "tired", "energized"];
  const todayFeeling = S.careCheckin && S.careCheckin[I(todayDn)] ? S.careCheckin[I(todayDn)].feeling : null;

  return (
    <div className="home-view" style={{ paddingBottom: "80px" }}>
      {/* 1. Greeting Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <span className="subtle" style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {fmt(todayDn, { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", margin: "2px 0 0" }}>
            Hello, friend
          </h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon="sparkle"
          onClick={() => actions.openTour()}
          aria-label="Open 4-phase cycle tour"
        >
          Cycle Tour
        </Button>
      </div>

      {/* 2. Mode Hero */}
      {mode === "pregnancy" && preg ? (
        <Card variant="tinted" tint="butter" className="v-home-hero">
          <span className="pill-tag" style={{ background: "var(--tint-butter-border)", color: "var(--tint-butter-text)" }}>
            Pregnancy Companion
          </span>
          <div style={{ fontFamily: "var(--font-display)", margin: "14px 0 6px", fontSize: "32px", fontWeight: "800", color: "var(--plum)" }}>
            {preg.weeks} weeks, {preg.days} days
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            {preg.trimester} · Estimated Due Date: {preg.edd ? fmt(N(preg.edd)) : "Set in Settings"}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
            {preg.milestone}
          </p>
        </Card>
      ) : mode === "perimenopause" ? (
        <Card variant="tinted" tint="sage" className="v-home-hero">
          <span className="pill-tag" style={{ background: "var(--tint-sage-border)", color: "var(--tint-sage-text)" }}>
            Perimenopause Mode
          </span>
          <div style={{ fontFamily: "var(--font-display)", margin: "14px 0 6px", fontSize: "28px", fontWeight: "800", color: "var(--plum)" }}>
            Cycle Day {stats.cur ? stats.cur.cd : "—"}
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            Tracking shifts with kindness · Variability: {stats.variability ? stats.variability.level : "Baseline"}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
            Hormonal fluctuations are completely natural during this transition. Prioritize deep rest and hydration.
          </p>
        </Card>
      ) : mode === "contraception" ? (
        <Card variant="tinted" tint="sky" className="v-home-hero">
          <span className="pill-tag" style={{ background: "var(--tint-sky-border)", color: "var(--tint-sky-text)" }}>
            Hormonal Contraception
          </span>
          <div style={{ fontFamily: "var(--font-display)", margin: "14px 0 6px", fontSize: "28px", fontWeight: "800", color: "var(--plum)" }}>
            Active Routine
          </div>
          <p className="mut" style={{ margin: "0 0 12px", fontSize: "14px" }}>
            Natural ovulation suppressed · Monitoring withdrawal bleeds and daily wellness
          </p>
          <Button variant="primary" size="sm" onClick={() => actions.goLog(I(todayDn))}>
            Log Today's Pill & Symptoms
          </Button>
        </Card>
      ) : (
        /* Natural / TTC / Irregular Cycle Ring Hero */
        <div className="v-home-hero">
          <div className="v-home-ring-wrap" onClick={() => actions.openTour()} title="Tap to learn about your current phase">
            <CycleRing stats={stats} day={cur ? cur.cd : 1} S={S} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            <span className="pill-tag" style={{ background: "var(--tint-rose-bg)", color: "var(--tint-rose-text)", border: "1px solid var(--tint-rose-border)" }}>
              {guidance.phase || "Natural Phase"}
            </span>
            {stats.nextPred && (
              <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                Next: ~{fmt(stats.nextPred)}
              </span>
            )}
          </div>

          <div style={{ marginTop: "14px" }}>
            <Button
              variant="secondary"
              size="sm"
              icon="droplet"
              onClick={() => actions.startPeriodToday()}
            >
              Period started today
            </Button>
          </div>
        </div>
      )}

      {/* 3. Week Strip */}
      <Card variant="base" style={{ padding: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {weekDays.map(w => (
            <button
              key={w.dateStr}
              type="button"
              onClick={() => actions.goLog(w.dateStr)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 6px",
                borderRadius: "12px",
                border: w.isToday ? "2px solid var(--berry)" : "1px solid transparent",
                background: w.isPeriod ? "var(--tint-rose-bg)" : "transparent",
                color: w.isPeriod ? "var(--tint-rose-text)" : "inherit",
                cursor: "pointer",
                minWidth: "40px"
              }}
              aria-label={`${w.dateStr}${w.isToday ? ", Today" : ""}`}
            >
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                {fmt(w.d, { weekday: "narrow" })}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "700", marginTop: "2px" }}>
                {fmt(w.d, { day: "numeric" })}
              </span>
              {w.hasLog && <span className="v-cal-dot" />}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Daily Guidance Tip */}
      <Card variant="tinted" tint="lavender" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Icon name="sparkle" size={18} />
          <b style={{ fontSize: "14px" }}>Daily Hormone Insight</b>
        </div>
        <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
          {guidance.summary || "Listen to your body's signals today. Fluctuations in energy reflect natural endocrine rhythm shifts."}
        </p>
      </Card>

      {/* 5. Hydration Tracker */}
      {S.waterGoal !== 0 && (
        <div style={{ marginBottom: "16px" }}>
          <WaterCup
            count={S.water && S.water[I(todayDn)] ? S.water[I(todayDn)] : 0}
            goal={8}
            onAdd={() => actions.addWater(I(todayDn))}
            onReset={() => actions.resetWater(I(todayDn))}
          />
        </div>
      )}

      {/* 6. Care Corner Reassurance & Quick Check-in */}
      <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
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

        <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
          HOW ARE YOU FEELING RIGHT NOW?
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {feelings.map(f => {
            const isSelected = todayFeeling === f;
            return (
              <ToggleChip
                key={f}
                label={f.charAt(0).toUpperCase() + f.slice(1)}
                selected={isSelected}
                onClick={() => actions.careCheckin(f)}
              />
            );
          })}
        </div>
      </Card>

      {/* 7. Floating "Log today" pill button */}
      <button
        type="button"
        className="v-home-fab"
        onClick={() => actions.goLog(I(todayDn))}
        aria-label="Log today's symptoms and flow"
      >
        <Icon name="edit" size={18} />
        <span>Log today</span>
      </button>
    </div>
  );
}
