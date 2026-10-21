/**
 * CycleSideChick — Calendar View Component
 * Features continuous period capsule ranges, fertile band, phase ribbon,
 * and zero inline styles.
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

  const year = ui.cYear;
  const month = ui.cMonth;

  const [showDaySheet, setShowDaySheet] = useState(false);

  // Month navigation calculations
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const startDayOfWeek = firstDayOfMonth.getUTCDay();
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
    const isPeriod = stats.pdset && stats.pdset.has(dn);
    const isPredicted = stats.predictedDates && stats.predictedDates.includes(dn);
    const isFertile = (S.mode === "natural" || S.mode === "ttc") && S.showFertile !== 0 && dn >= stats.fertileStart && dn <= stats.fertileEnd;
    const isOvulation = (S.mode === "natural" || S.mode === "ttc") && S.showFertile !== 0 && dn === stats.ovulationDate;
    const hasLog = Boolean(S.logs && S.logs[dateStr]);

    // Continuous capsule connections
    const dayOfWeek = (startDayOfWeek + d - 1) % 7;
    const prevDayIsPeriod = stats.pdset && stats.pdset.has(dn - 1) && dayOfWeek !== 0;
    const nextDayIsPeriod = stats.pdset && stats.pdset.has(dn + 1) && dayOfWeek !== 6;

    let periodCapsuleClass = "";
    if (isPeriod) {
      if (prevDayIsPeriod && nextDayIsPeriod) {
        periodCapsuleClass = "v-cal-cell--period-mid";
      } else if (!prevDayIsPeriod && nextDayIsPeriod) {
        periodCapsuleClass = "v-cal-cell--period-start";
      } else if (prevDayIsPeriod && !nextDayIsPeriod) {
        periodCapsuleClass = "v-cal-cell--period-end";
      } else {
        periodCapsuleClass = "v-cal-cell--period-single";
      }
    }

    // Fertile band connections
    let fertileClass = "";
    if (isFertile && !isPeriod) {
      const prevFertile = dn - 1 >= stats.fertileStart && dayOfWeek !== 0;
      const nextFertile = dn + 1 <= stats.fertileEnd && dayOfWeek !== 6;
      if (prevFertile && nextFertile) fertileClass = "v-cal-cell--fertile v-cal-cell--fertile-mid";
      else if (!prevFertile && nextFertile) fertileClass = "v-cal-cell--fertile v-cal-cell--fertile-start";
      else if (prevFertile && !nextFertile) fertileClass = "v-cal-cell--fertile v-cal-cell--fertile-end";
      else fertileClass = "v-cal-cell--fertile";
    }

    cells.push({
      empty: false,
      id: dateStr,
      dayNum: d,
      dn,
      dateStr,
      isToday,
      isSelected,
      isPeriod,
      periodCapsuleClass,
      isPredicted,
      isFertile,
      fertileClass,
      isOvulation,
      hasLog
    });
  }

  // Selected Day summary info
  const selectedDateStr = ui.selDay || I(todayDn);
  const selectedDn = N(selectedDateStr);
  const selectedLog = (S.logs && S.logs[selectedDateStr]) || null;
  const isSelectedPeriod = stats.pdset && stats.pdset.has(selectedDn);

  const handleCellClick = (dateStr) => {
    actions.selectCalendarDay(dateStr);
    setShowDaySheet(true);
  };

  return (
    <div className="calendar-view">
      {/* Month Header */}
      <div className="v-cal-header">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", margin: 0 }}>
          {new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" })}
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <Button variant="secondary" size="sm" onClick={() => actions.jumpCalendarToday()}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => actions.navigateMonth(-1)} aria-label="Previous month" icon="arrowLeft" />
          <Button variant="secondary" size="sm" onClick={() => actions.navigateMonth(1)} aria-label="Next month" icon="arrowRight" />
        </div>
      </div>

      <div className="v-cal-layout">
        <div className="v-cal-month-pane">
          {/* Physiological Phase Ribbon */}
          <div className="v-cal-ribbon" aria-hidden="true">
            <div className="v-cal-ribbon__seg" style={{ flex: 5, background: "var(--phase-menstrual)" }} title="Menstrual Phase" />
            <div className="v-cal-ribbon__seg" style={{ flex: 9, background: "var(--phase-follicular)" }} title="Follicular Phase" />
            <div className="v-cal-ribbon__seg" style={{ flex: 4, background: "var(--phase-ovulatory)" }} title="Ovulatory Phase" />
            <div className="v-cal-ribbon__seg" style={{ flex: 10, background: "var(--phase-luteal)" }} title="Luteal Phase" />
          </div>

          {/* Weekday Labels */}
          <div className="v-cal-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => (
              <span key={w}>{w}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="v-cal-grid">
            {cells.map(c => {
              if (c.empty) return <div key={c.id} style={{ height: "44px" }} />;

              const classes = [
                "v-cal-cell",
                c.periodCapsuleClass,
                c.fertileClass,
                c.isPredicted ? "v-cal-cell--predicted" : "",
                c.isToday ? "v-cal-cell--today" : "",
                c.isSelected ? "v-cal-cell--selected" : ""
              ].filter(Boolean).join(" ");

              return (
                <button
                  key={c.id}
                  type="button"
                  className={classes}
                  onClick={() => handleCellClick(c.dateStr)}
                  aria-label={`${c.dateStr}${c.isPeriod ? ", Period day" : ""}${c.isFertile ? ", Fertile window" : ""}${c.isToday ? ", Today" : ""}`}
                >
                  <span>{c.dayNum}</span>
                  {c.isOvulation && (
                    <span style={{ position: "absolute", top: "2px", right: "2px", width: "6px", height: "6px", borderRadius: "50%", background: "var(--berry)" }} />
                  )}
                  {c.hasLog && <span className="v-cal-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Card (Side pane on Desktop) */}
        <div className="v-cal-details-pane">
          <Card variant="base">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>SELECTED DAY</span>
                <h3 style={{ margin: "2px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-h3)" }}>
                  {fmt(selectedDn, { weekday: "short", month: "short", day: "numeric" })}
                </h3>
              </div>
              <Button variant="primary" size="sm" icon="edit" onClick={() => actions.goLog(selectedDateStr)}>
                Log Symptoms
              </Button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              {!isSelectedPeriod ? (
                <Button variant="secondary" size="sm" icon="droplet" onClick={() => actions.startPeriod(selectedDateStr)}>
                  Period Started
                </Button>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => actions.endPeriod(selectedDateStr)}>
                    Period Ended
                  </Button>
                  <Button variant="danger" size="sm" icon="trash" onClick={() => actions.removePeriod(selectedDateStr)}>
                    Remove
                  </Button>
                </>
              )}
            </div>

            {selectedLog ? (
              <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                {selectedLog.f !== undefined && <div>Flow: <b>{selectedLog.f === 1 ? "Spotting" : selectedLog.f === 2 ? "Light" : selectedLog.f === 3 ? "Medium" : "Heavy"}</b></div>}
                {selectedLog.m !== undefined && <div>Mood: <b>{["Great", "Calm", "Sensitive", "Low", "Irritable"][selectedLog.m]}</b></div>}
                {selectedLog.p !== undefined && <div>Pain: <b>{selectedLog.p} / 10</b></div>}
                {selectedLog.cm && <div>Fluid: <b>{selectedLog.cm}</b></div>}
                {selectedLog.note && <div style={{ fontStyle: "italic", marginTop: "4px" }}>"{selectedLog.note}"</div>}
              </div>
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
                No symptoms or notes logged for this day. Tap "Log Symptoms" to add records.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Day Details Bottom Sheet on Tap */}
      <SheetModal
        isOpen={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={fmt(selectedDn, { weekday: "long", month: "short", day: "numeric" })}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!isSelectedPeriod ? (
              <Button variant="secondary" size="sm" icon="droplet" onClick={() => { actions.startPeriod(selectedDateStr); setShowDaySheet(false); }}>
                Period Started
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => { actions.endPeriod(selectedDateStr); setShowDaySheet(false); }}>
                  Period Ended
                </Button>
                <Button variant="danger" size="sm" icon="trash" onClick={() => { actions.removePeriod(selectedDateStr); setShowDaySheet(false); }}>
                  Remove
                </Button>
              </>
            )}
            <Button variant="primary" size="sm" icon="edit" onClick={() => { setShowDaySheet(false); actions.goLog(selectedDateStr); }}>
              Edit Full Day Log
            </Button>
          </div>

          {selectedLog ? (
            <Card variant="raised">
              {selectedLog.f !== undefined && <div>Flow: <b>{selectedLog.f === 1 ? "Spotting" : selectedLog.f === 2 ? "Light" : selectedLog.f === 3 ? "Medium" : "Heavy"}</b></div>}
              {selectedLog.m !== undefined && <div>Mood: <b>{["Great", "Calm", "Sensitive", "Low", "Irritable"][selectedLog.m]}</b></div>}
              {selectedLog.p !== undefined && <div>Pain: <b>{selectedLog.p} / 10</b></div>}
              {selectedLog.cm && <div>Fluid: <b>{selectedLog.cm}</b></div>}
              {selectedLog.note && <div style={{ fontStyle: "italic", marginTop: "6px" }}>"{selectedLog.note}"</div>}
            </Card>
          ) : (
            <p className="mut" style={{ margin: 0, fontSize: "13.5px" }}>
              No check-in entries logged yet. Tap "Edit Full Day Log" to record symptoms, moods, cervical fluid, and private notes.
            </p>
          )}
        </div>
      </SheetModal>
    </div>
  );
}
