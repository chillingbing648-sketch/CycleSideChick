/**
 * CycleSideChick — Calendar View Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt, calculateStats } from "../../core/engine.js";

export function CalendarView() {
  const { S, ui } = useStore();
  const stats = calculateStats(S);
  const todayDn = TD();

  const year = ui.cYear;
  const month = ui.cMonth;

  // Month navigation calculations
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const startDayOfWeek = firstDayOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Grid cells
  const cells = [];
  // Leading empty days
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
    const hasLog = S.logs && S.logs[dateStr];

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
      hasLog
    });
  }

  // Selected Day summary info
  const selectedDateStr = ui.selDay || I(todayDn);
  const selectedDn = N(selectedDateStr);
  const selectedLog = (S.logs && S.logs[selectedDateStr]) || null;
  const isSelectedPeriod = stats.pdset && stats.pdset.has(selectedDn);

  return (
    <div className="calendar-view">
      {/* Month Header */}
      <div className="cal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>
          {new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" })}
        </h2>
        <div style={{ display: "flex", gap: "6px" }}>
          <button type="button" className="btn g sm" onClick={() => actions.jumpCalendarToday()}>
            Today
          </button>
          <button type="button" className="icon-btn" onClick={() => actions.navigateMonth(-1)} aria-label="Previous month">
            <Icon name="arrowLeft" size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => actions.navigateMonth(1)} aria-label="Next month">
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="cal-weekdays" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "8px" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => (
          <span key={w} className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>{w}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "20px" }}>
        {cells.map(c => {
          if (c.empty) return <div key={c.id} style={{ height: "44px" }} />;

          let bg = "transparent";
          let color = "inherit";
          let border = "1px solid transparent";

          if (c.isPeriod) {
            bg = "var(--tint-rose-bg)";
            color = "var(--tint-rose-text)";
          } else if (c.isFertile) {
            bg = "var(--tint-lavender-bg)";
            color = "var(--tint-lavender-text)";
          } else if (c.isPredicted) {
            bg = "var(--surface-alt)";
          }

          if (c.isToday) {
            border = "2px solid var(--pink)";
          }
          if (c.isSelected) {
            border = "2px solid var(--plum)";
          }

          return (
            <button
              key={c.id}
              type="button"
              className={`cal-day-cell ${c.isToday ? "today" : ""} ${c.isPeriod ? "period" : ""}`}
              onClick={() => actions.selectCalendarDay(c.dateStr)}
              style={{
                height: "44px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                background: bg,
                color,
                border,
                cursor: "pointer",
                position: "relative"
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: c.isToday || c.isPeriod ? "700" : "500" }}>
                {c.dayNum}
              </span>
              {c.isOvulation && (
                <div style={{ position: "absolute", top: "2px", right: "2px", width: "6px", height: "6px", borderRadius: "50%", background: "var(--tint-lavender-text)" }} />
              )}
              {c.hasLog && (
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--pink)", marginTop: "2px" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Card */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "12px", fontWeight: "600" }}>SELECTED DAY</span>
            <h3 style={{ margin: "2px 0 0", fontSize: "18px" }}>
              {fmt(selectedDn, { weekday: "short", month: "short", day: "numeric" })}
            </h3>
          </div>
          <button
            type="button"
            className="btn sm"
            onClick={() => actions.goLog(selectedDateStr)}
          >
            <Icon name="edit" size={16} />
            <span>Log Symptoms</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {!isSelectedPeriod ? (
            <button type="button" className="btn g sm" onClick={() => actions.startPeriod(selectedDateStr)}>
              <Icon name="droplet" size={14} />
              <span>Period Started</span>
            </button>
          ) : (
            <>
              <button type="button" className="btn g sm" onClick={() => actions.endPeriod(selectedDateStr)}>
                <span>Period Ended</span>
              </button>
              <button type="button" className="btn g sm" onClick={() => actions.removePeriod(selectedDateStr)}>
                <Icon name="trash" size={14} />
                <span>Remove</span>
              </button>
            </>
          )}
        </div>

        {selectedLog ? (
          <div style={{ fontSize: "13px", color: "var(--plum)", lineHeight: "1.6" }}>
            {selectedLog.f !== undefined && <div>Flow: {selectedLog.f === 1 ? "Spotting" : selectedLog.f === 2 ? "Light" : selectedLog.f === 3 ? "Medium" : "Heavy"}</div>}
            {selectedLog.m !== undefined && <div>Mood: {["Great", "Calm", "Sensitive", "Low", "Irritable"][selectedLog.m]}</div>}
            {selectedLog.p !== undefined && <div>Pain: {selectedLog.p}/10</div>}
            {selectedLog.cm && <div>Fluid: {selectedLog.cm}</div>}
            {selectedLog.note && <div style={{ fontStyle: "italic", marginTop: "4px" }}>"{selectedLog.note}"</div>}
          </div>
        ) : (
          <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
            No symptoms or notes logged for this day. Tap "Log Symptoms" to add records.
          </p>
        )}
      </div>
    </div>
  );
}
