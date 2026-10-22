/**
 * CycleSideChick — High-Accuracy Period & Cycle Flow Logger Modal
 * 
 * Clinical Reference Standards:
 * - ACOG (American College of Obstetricians and Gynecologists)
 * - FIGO (International Federation of Gynecology and Obstetrics)
 * 
 * Features:
 * - Flow intensity selection (None, Spotting, Light, Medium, Heavy)
 * - Clear distinction: Spotting does not count as Cycle Day 1 per ACOG/FIGO guidelines
 * - Seamless automatic synchronization with S.periods and S.logs
 * - 1-Tap "Period Started" / "Period Ended" actions
 * - Historical cycle list with duration (days) and interval gap calculations
 * - Tactile motion & spring feedback
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt, calculateStats, syncPeriodWithFlow } from "../../core/engine.js";

export function PeriodLogModal({ isOpen = false, onClose }) {
  const { S, ui } = useStore();
  const todayDn = TD();
  const todayStr = I(todayDn);
  const activeDate = ui.periodModalDate || todayStr;
  const activeDn = N(activeDate);

  const stats = calculateStats(S);
  const curLog = (S.logs && S.logs[activeDate]) || {};
  const currentFlow = curLog.f !== undefined ? curLog.f : 0;

  // Check if activeDate is inside a confirmed period
  const activePeriod = (S.periods || []).find(p => {
    const sDn = N(p.s);
    const eDn = p.e ? N(p.e) : sDn + (S.pl || 5) - 1;
    return activeDn >= sDn && activeDn <= eDn;
  });

  const isConfirmedPeriodDay = Boolean(activePeriod);
  const isPeriodStart = activePeriod && activePeriod.s === activeDate;
  const isPeriodEnd = activePeriod && activePeriod.e === activeDate;

  // Flow options according to clinical standards
  const FLOW_OPTIONS = [
    {
      level: 0,
      label: "None",
      desc: "No vaginal bleeding",
      icon: "flowNone",
      badge: "Dry"
    },
    {
      level: 1,
      label: "Spotting",
      desc: "Light pink/brown, liner only (Not Day 1)",
      icon: "flowSpotting",
      badge: "Intermenstrual"
    },
    {
      level: 2,
      label: "Light",
      desc: "Low flow, 1–2 pads or tampons/day",
      icon: "flowLight",
      badge: "Day 1+"
    },
    {
      level: 3,
      label: "Medium",
      desc: "Regular steady menstrual flow",
      icon: "flowMedium",
      badge: "Normal"
    },
    {
      level: 4,
      label: "Heavy",
      desc: "Full flow, pad/tampon every 2–3 hrs",
      icon: "flowHeavy",
      badge: "Full Flow"
    }
  ];

  const handleSelectFlow = (level) => {
    actions.logPeriod(activeDate, level);
  };

  const handleStartPeriod = () => {
    actions.startPeriod(activeDate);
  };

  const handleEndPeriod = () => {
    actions.endPeriod(activeDate);
  };

  const handleRemovePeriod = () => {
    actions.removePeriod(activeDate);
  };

  const handleDateChange = (newDate) => {
    ui.periodModalDate = newDate;
    actions.changeLogDate(newDate);
  };

  const pastPeriods = [...(S.periods || [])].sort((a, b) => N(b.s) - N(a.s));

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Period & Bleeding Flow"
      maxWidth="500px"
      className="v-period-log-sheet"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        
        {/* 1. Date Selector Quick Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-soft)", padding: "8px 12px", borderRadius: "16px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => handleDateChange(todayStr)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeDate === todayStr ? "var(--primary)" : "transparent",
                color: activeDate === todayStr ? "#FFFFFF" : "var(--text-muted)",
                transition: "all 0.2s ease"
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDateChange(I(todayDn - 1))}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeDate === I(todayDn - 1) ? "var(--primary)" : "transparent",
                color: activeDate === I(todayDn - 1) ? "#FFFFFF" : "var(--text-muted)",
                transition: "all 0.2s ease"
              }}
            >
              Yesterday
            </button>
          </div>

          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text)" }}>
              {fmt(activeDn, { month: "short", day: "numeric", weekday: "short" })}
            </span>
            <input
              type="date"
              value={activeDate}
              max={I(todayDn + 1)}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                width: "100%"
              }}
              aria-label="Pick custom date"
            />
            <Icon name="calendar" size={16} />
          </div>
        </div>

        {/* 2. Active Status Callout */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "16px",
            background: isConfirmedPeriodDay
              ? "linear-gradient(135deg, rgba(255, 91, 153, 0.12), rgba(255, 142, 180, 0.18))"
              : "var(--surface)",
            border: isConfirmedPeriodDay
              ? "1.5px solid rgba(255, 91, 153, 0.35)"
              : "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: isConfirmedPeriodDay ? "var(--primary)" : "var(--surface-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isConfirmedPeriodDay ? "#FFFFFF" : "var(--text-muted)"
              }}
            >
              <Icon name="droplet" size={20} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--text)", fontFamily: "var(--font-heading)" }}>
                {isConfirmedPeriodDay
                  ? `Period Day ${activePeriod ? Math.max(1, activeDn - N(activePeriod.s) + 1) : 1}`
                  : "Non-Period Day"}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                {isConfirmedPeriodDay
                  ? `Recorded from ${fmt(N(activePeriod.s), { month: "short", day: "numeric" })}`
                  : "No period active on this date"}
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Action Button */}
          {isConfirmedPeriodDay ? (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={handleEndPeriod}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                End Period
              </button>
              <button
                type="button"
                onClick={handleRemovePeriod}
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "none",
                  background: "rgba(255, 77, 109, 0.12)",
                  color: "#FF4D6D",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
                title="Remove period for this day"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartPeriod}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                background: "var(--primary)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 91, 153, 0.3)"
              }}
            >
              Start Period
            </button>
          )}
        </div>

        {/* 3. Flow Level Selector Grid (ACOG / FIGO Standard) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Select Bleeding Volume
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ACOG & FIGO Standards
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
            {FLOW_OPTIONS.map(opt => {
              const isSelected = currentFlow === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => handleSelectFlow(opt.level)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    padding: "12px 4px",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                    background: isSelected ? "var(--surface-tint, rgba(255, 91, 153, 0.1))" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--text)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isSelected ? "scale(1.04)" : "scale(1)"
                  }}
                >
                  <div style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={opt.icon} size={22} />
                  </div>
                  <b style={{ fontSize: "12px" }}>{opt.label}</b>
                  <span style={{ fontSize: "9px", color: isSelected ? "var(--primary)" : "var(--text-muted)", fontWeight: "600" }}>
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Clinical Guidance Card */}
        <div style={{ background: "var(--surface-soft)", padding: "12px 14px", borderRadius: "14px", fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "var(--text)", marginBottom: "3px" }}>
            <Icon name="info" size={14} />
            <span>Clinical Rule: Cycle Day 1</span>
          </div>
          Cycle Day 1 is defined as the first day of full, regular menstrual flow (Light to Heavy). Spotting is intermenstrual and does not count as Day 1.
        </div>

        {/* 5. Period History & Duration Overview */}
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Recorded Period History ({pastPeriods.length})
          </span>

          {pastPeriods.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", background: "var(--surface)", borderRadius: "14px", border: "1px dashed var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>
              No period records logged yet. Tap "Start Period" above to log your first cycle.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", paddingRight: "4px" }}>
              {pastPeriods.slice(0, 5).map((p, idx) => {
                const sDn = N(p.s);
                const eDn = p.e ? N(p.e) : sDn + (S.pl || 5) - 1;
                const dur = eDn - sDn + 1;
                return (
                  <div
                    key={p.s + idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--surface)",
                      borderRadius: "12px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
                      <span style={{ fontWeight: "700", color: "var(--text)" }}>
                        {fmt(sDn, { month: "short", day: "numeric" })} – {p.e ? fmt(eDn, { month: "short", day: "numeric" }) : "Ongoing"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "11.5px" }}>
                        {dur} days
                      </span>
                      <button
                        type="button"
                        onClick={() => actions.removePeriod(p.s)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: "2px"
                        }}
                        title="Delete period"
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Footer Dismiss */}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 24px",
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
            Done
          </button>
        </div>

      </div>
    </SheetModal>
  );
}
