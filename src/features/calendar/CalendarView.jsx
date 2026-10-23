/**
 * CycleSideChick — Component 02: Interactive Cycle Calendar (Calendar Page)
 * Inspired by shadcn/ui Calendar, Flo, and Apple Health.
 * 
 * Features:
 * - Rounded day cells with visually distinct:
 *   - Confirmed period days (solid soft rose)
 *   - Predictions (dashed/soft tinted borders)
 *   - Fertile-window estimates (soft lavender tint)
 *   - Ovulation estimates (lavender ring with sparkle marker)
 * - Date selection reveals that day's:
 *   - Recorded symptoms (SVG chips)
 *   - Emotional mood & energy
 *   - Private journal reflections
 *   - Period status actions (Start / End / Remove Period)
 * - Reference: https://ui.shadcn.com/docs/components/base/calendar
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { TD, I, N, fmt, calculateStats } from "../../core/engine.js";

export function CalendarView() {
  const { S, ui } = useStore();
  const stats = calculateStats(S);
  const todayDn = TD();

  const year = ui.cYear !== undefined ? ui.cYear : new Date().getFullYear();
  const month = ui.cMonth !== undefined ? ui.cMonth : new Date().getMonth();

  const [showDaySheet, setShowDaySheet] = useState(false);

  // Month navigation calculations
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const startDayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7; // Monday start (0: Mon, 6: Sun)
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Grid cells
  const cells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ empty: true, id: `pre-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dn = Date.UTC(year, month, d) / 864e5;
    const dateStr = I(dn);
    const isToday = dn === todayDn;
    const isSelected = ui.selDay === dateStr;
    const isPeriod = Boolean(stats.pdset && stats.pdset.has(dn));
    const isPredicted = Boolean(stats.predictedDates && stats.predictedDates.includes(dn));
    const isFertile =
      (S.mode === "natural" || S.mode === "ttc") &&
      S.showFertile !== 0 &&
      stats.predictedCycles &&
      stats.predictedCycles.some(pc => dn >= pc.fertileStart && dn <= pc.fertileEnd);
    const isOvulation =
      (S.mode === "natural" || S.mode === "ttc") &&
      S.showFertile !== 0 &&
      stats.predictedCycles &&
      stats.predictedCycles.some(pc => dn === pc.ovulation);

    const logEntry = S.logs && S.logs[dateStr];
    const journalEntry = S.journal && S.journal[dateStr];
    const hasLog = Boolean(logEntry && (logEntry.f || logEntry.m !== undefined || (logEntry.sy && Object.keys(logEntry.sy).length > 0) || logEntry.note));
    const hasJournal = Boolean(journalEntry && journalEntry.text);

    cells.push({
      empty: false,
      id: dateStr,
      dayNum: d,
      dn,
      dateStr,
      isToday,
      isSelected,
      isPeriod,
      isPredicted,
      isFertile,
      isOvulation,
      hasLog: hasLog || hasJournal
    });
  }

  // Selected Day data
  const selectedDateStr = ui.selDay || I(todayDn);
  const selectedDn = N(selectedDateStr);
  const selectedLog = (S.logs && S.logs[selectedDateStr]) || null;
  const selectedJournal = (S.journal && S.journal[selectedDateStr]) || null;
  const isSelectedPeriod = stats.pdset && stats.pdset.has(selectedDn);
  const isSelectedPredicted = stats.predictedDates && stats.predictedDates.includes(selectedDn);

  // Symptoms list for selected day
  const rawSymptoms = (selectedLog && (selectedLog.sy || selectedLog.s)) || {};
  const loggedSymptomKeys = Array.isArray(rawSymptoms)
    ? rawSymptoms
    : typeof rawSymptoms === "object"
    ? Object.keys(rawSymptoms)
    : [];

  const MOOD_NAMES = ["Sensitive", "Low", "Neutral", "Good", "Great"];
  const MOOD_ICONS = ["moodIrritable", "moodLow", "moodNeutral", "moodCalm", "moodHappy"];

  const handleCellClick = (dateStr) => {
    actions.selectCalendarDay(dateStr);
  };

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  return (
    <div className="v-calendar-container">
      {/* 1. Header with Month Navigator */}
      <div className="v-cal-nav-header">
        <div>
          <h1 className="v-cal-month-title">{monthLabel}</h1>
          <span className="v-cal-status-sub">
            {stats.avg ? `~${stats.avg}-day average cycle` : "Natural cycle tracking"}
          </span>
        </div>

        <div className="v-cal-nav-controls">
          <button
            type="button"
            className="v-cal-btn-today"
            onClick={() => actions.jumpCalendarToday()}
            aria-label="Jump to today"
          >
            Today
          </button>
          <button
            type="button"
            className="v-cal-nav-arrow"
            onClick={() => actions.navigateMonth(-1)}
            aria-label="Previous month"
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <button
            type="button"
            className="v-cal-nav-arrow"
            onClick={() => actions.navigateMonth(1)}
            aria-label="Next month"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* 2. Calendar Card Container */}
      <div className="v-cal-sheet-card">
        {/* Weekday Row (Mon to Sun) */}
        <div className="v-cal-weekday-row" aria-hidden="true">
          {["M", "T", "W", "T", "F", "S", "S"].map((w, idx) => (
            <span key={idx} className="v-cal-weekday-label">
              {w}
            </span>
          ))}
        </div>

        {/* Days Matrix with Shadcn-Inspired Rounded Shapes */}
        <div className="v-cal-matrix-grid">
          {cells.map((c) => {
            if (c.empty) return <div key={c.id} className="v-cal-cell-empty" />;

            const cellClasses = [
              "v-cal-day-cell",
              c.isPeriod ? "v-cal-day-cell--period" : "",
              c.isPredicted ? "v-cal-day-cell--predicted" : "",
              c.isFertile ? "v-cal-day-cell--fertile" : "",
              c.isOvulation ? "v-cal-day-cell--ovulation" : "",
              c.isToday ? "v-cal-day-cell--today" : "",
              c.isSelected ? "v-cal-day-cell--selected" : ""
            ].filter(Boolean).join(" ");

            return (
              <button
                key={c.id}
                type="button"
                className={cellClasses}
                onClick={() => handleCellClick(c.dateStr)}
                aria-label={`${c.dateStr}${c.isPeriod ? ", Confirmed period" : ""}${c.isPredicted ? ", Predicted period" : ""}${c.isFertile ? ", Fertile window" : ""}${c.isToday ? ", Today" : ""}`}
              >
                <span className="v-cal-day-circle">
                  <span className="v-cal-day-number">{c.dayNum}</span>
                  {c.isOvulation && (
                    <span className="v-cal-ovulation-marker" title="Estimated ovulation peak">
                      <Icon name="sparkle" size={8} />
                    </span>
                  )}
                  {c.isPeriod && (
                    <span className="v-cal-period-marker" aria-hidden="true" />
                  )}
                </span>
                {c.hasLog && <span className="v-cal-dot-marker" title="Has logged symptoms or journal" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Refined Period App Legend */}
      <div className="v-cal-legend-bar">
        <div className="v-legend-pill">
          <span className="v-legend-dot v-legend-dot--period" />
          <span>Period</span>
        </div>
        <div className="v-legend-pill">
          <span className="v-legend-dot v-legend-dot--predicted" />
          <span>Predicted</span>
        </div>
        <div className="v-legend-pill">
          <span className="v-legend-dot v-legend-dot--fertile" />
          <span>Fertile</span>
        </div>
        <div className="v-legend-pill">
          <span className="v-legend-dot v-legend-dot--ovulation" />
          <span>Ovulation</span>
        </div>
      </div>

      {/* 4. Date Selection Detail Reveal Card (Symptoms & Journal Entries) */}
      <Card variant="base" className="v-cal-selected-day-panel">
        <div className="v-cal-panel-top">
          <div>
            <span className="v-cal-panel-date">
              {fmt(selectedDn, { weekday: "long", month: "short", day: "numeric" })}
            </span>
            <div className="v-cal-panel-status">
              <span className={`v-status-pill ${isSelectedPeriod ? "status-period" : isSelectedPredicted ? "status-pred" : ""}`}>
                {isSelectedPeriod
                  ? "Period Confirmed"
                  : isSelectedPredicted
                  ? "Estimated Period Day"
                  : selectedDn === todayDn
                  ? "Today"
                  : "Logged History"}
              </span>
            </div>
          </div>

          <div className="v-cal-panel-actions">
            <Button
              variant="secondary"
              size="sm"
              icon="droplet"
              onClick={() => actions.openPeriodModal(selectedDateStr)}
            >
              {isSelectedPeriod ? "Edit Period Flow" : "Log Period"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="edit"
              onClick={() => actions.goLog(selectedDateStr)}
            >
              Log Day
            </Button>
          </div>
        </div>

        {/* Revealed Day Symptoms Section */}
        <div className="v-cal-detail-section">
          <div className="v-cal-section-header">
            <span className="v-cal-section-title">
              <Icon name="sparkle" size={14} />
              <span>Recorded Symptoms & Sensations</span>
            </span>
            <button
              type="button"
              className="v-cal-quick-add-link"
              onClick={() => actions.goLog(selectedDateStr)}
            >
              + Edit
            </button>
          </div>

          {loggedSymptomKeys.length > 0 ? (
            <div className="v-cal-symptoms-chips">
              {loggedSymptomKeys.map((symKey) => (
                <span key={symKey} className="v-cal-symptom-tag">
                  <Icon name={symKey in { cramps: 1, bloating: 1, headache: 1, fatigue: 1, acne: 1 } ? symKey : "sparkle"} size={14} />
                  <span>{symKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="v-cal-empty-hint">
              No physical symptoms logged for this date.
            </p>
          )}

          {/* Flow, Mood, Pain quick indicators if present */}
          {selectedLog && (selectedLog.m !== undefined || selectedLog.p || selectedLog.cm) && (
            <div className="v-cal-metrics-row">
              {selectedLog.m !== undefined && (
                <span className="v-cal-metric-badge">
                  <Icon name={MOOD_ICONS[selectedLog.m] || "moodCalm"} size={14} />
                  <span>Mood: {MOOD_NAMES[selectedLog.m] || "Logged"}</span>
                </span>
              )}
              {selectedLog.p > 0 && (
                <span className="v-cal-metric-badge">
                  <Icon name="alert" size={13} />
                  <span>Pain: {selectedLog.p}/10</span>
                </span>
              )}
              {selectedLog.cm && (
                <span className="v-cal-metric-badge">
                  <Icon name="droplet" size={13} />
                  <span>Fluid: {selectedLog.cm.toUpperCase()}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Revealed Day Journal Entry Section */}
        <div className="v-cal-detail-section v-cal-detail-section--journal">
          <div className="v-cal-section-header">
            <span className="v-cal-section-title">
              <Icon name="book" size={14} />
              <span>Private Journal Reflection</span>
            </span>
            <button
              type="button"
              className="v-cal-quick-add-link"
              onClick={() => {
                actions.setJournalDate(selectedDateStr);
                actions.setCareTab("journal");
                actions.setTab("care");
              }}
            >
              {selectedJournal && selectedJournal.text ? "Edit" : "+ Write"}
            </button>
          </div>

          {selectedJournal && selectedJournal.text ? (
            <div className="v-cal-journal-snippet">
              {selectedJournal.mood && (
                <span className="v-cal-journal-mood-tag">
                  Mood: {selectedJournal.mood}
                </span>
              )}
              <p className="v-cal-journal-quote">
                "{selectedJournal.text}"
              </p>
            </div>
          ) : (
            <p className="v-cal-empty-hint">
              No private reflection entry for this date.
            </p>
          )}
        </div>
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
          Predicted period dates and fertile window estimates are mathematical models derived from past logs. Never use predictions as medical advice or natural contraception.
        </span>
      </div>

      {/* 5. Interactive Full Day Details Bottom Sheet Modal */}
      <SheetModal
        isOpen={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={fmt(selectedDn, { weekday: "long", month: "short", day: "numeric" })}
      >
        <div className="v-sheet-day-content">
          <div className="v-sheet-period-controls">
            <Button
              variant="secondary"
              size="md"
              icon="droplet"
              onClick={() => {
                actions.openPeriodModal(selectedDateStr);
                setShowDaySheet(false);
              }}
            >
              {isSelectedPeriod ? "Edit Period & Bleeding Flow" : "Log Period for this Day"}
            </Button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon="edit"
            onClick={() => {
              setShowDaySheet(false);
              actions.goLog(selectedDateStr);
            }}
          >
            Edit Full Day Log
          </Button>
        </div>
      </SheetModal>
    </div>
  );
}
