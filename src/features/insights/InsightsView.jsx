/**
 * CycleSideChick — Insights View Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { calculateStats, calculatePeriodDurations, calculateVariability, aggregateSymptoms, aggregateMoods } from "../../core/engine.js";

export function InsightsView() {
  const { S } = useStore();
  const stats = calculateStats(S);
  const durations = calculatePeriodDurations(S);
  const variability = calculateVariability(S);
  const symptoms = aggregateSymptoms(S, 90);
  const moods = aggregateMoods(S, 90);

  const MOOD_LABELS = ["Great", "Calm", "Sensitive", "Low", "Irritable"];

  return (
    <div className="insights-view" style={{ paddingBottom: "32px" }}>
      {/* Clinician Summary Banner */}
      <div className="card tint-mint" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <Icon name="shieldCheck" size={18} />
              <b style={{ fontSize: "14px" }}>ACOG Clinician Summary</b>
            </div>
            <p className="mut" style={{ margin: 0, fontSize: "12.5px" }}>
              Export an objective reproductive health summary for doctor visits.
            </p>
          </div>
          <button type="button" className="btn sm" onClick={() => actions.openClinician()}>
            View Report
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>AVG CYCLE LENGTH</span>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--plum)", margin: "4px 0" }}>
            {stats.avg || 28} <span style={{ fontSize: "14px", fontWeight: "500" }}>days</span>
          </div>
          <span className="mut" style={{ fontSize: "12px" }}>
            Range: ±{stats.pm || 1} d · {stats.confLevel || "Moderate"}
          </span>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>AVG PERIOD LENGTH</span>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--plum)", margin: "4px 0" }}>
            {durations.average || S.pl || 5} <span style={{ fontSize: "14px", fontWeight: "500" }}>days</span>
          </div>
          <span className="mut" style={{ fontSize: "12px" }}>
            {durations.totalBleedDays || 0} bleed days logged
          </span>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>FIGO REGULARITY</span>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--plum)", margin: "8px 0 4px" }}>
            {variability.figoCategory || "Regular"}
          </div>
          <span className="mut" style={{ fontSize: "12px" }}>
            Variation: {variability.spread || 0} days
          </span>
        </div>

        <div className="card" style={{ padding: "14px", textAlign: "center" }}>
          <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>CYCLES TRACKED</span>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--plum)", margin: "4px 0" }}>
            {stats.n || (S.periods ? S.periods.length : 0)}
          </div>
          <span className="mut" style={{ fontSize: "12px" }}>
            {stats.outlierDetected ? "Outlier filtered" : "Baseline steady"}
          </span>
        </div>
      </div>

      {/* Cycle Trend History */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Cycle Length History</b>
        <p className="mut" style={{ margin: "0 0 14px", fontSize: "12.5px" }}>
          Normal physiological benchmark: 21–35 days (FIGO / ACOG)
        </p>

        {stats.lens && stats.lens.length > 0 ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "120px", padding: "10px 0" }}>
            {stats.lens.slice(-6).map((len, idx) => {
              const heightPercent = Math.min(100, Math.max(20, (len / 45) * 100));
              const isNormal = len >= 21 && len <= 35;
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", marginBottom: "4px" }}>{len}d</span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "28px",
                      height: `${heightPercent}%`,
                      background: isNormal ? "var(--pink)" : "var(--tint-amber-text)",
                      borderRadius: "6px 6px 0 0"
                    }}
                  />
                  <span className="subtle" style={{ fontSize: "10px", marginTop: "4px" }}>C{idx + 1}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
            Log at least 2 consecutive periods to view your cycle length trend chart.
          </p>
        )}
      </div>

      {/* Symptoms Distribution */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Common Symptoms (Past 90 Days)</b>
        <p className="mut" style={{ margin: "0 0 12px", fontSize: "12.5px" }}>
          Total logged instances: {symptoms.totalLogged || 0}
        </p>

        {symptoms.topSymptoms && symptoms.topSymptoms.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {symptoms.topSymptoms.slice(0, 5).map(s => (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "2px" }}>
                  <span>{s.label || s.id.replace(/_/g, " ")}</span>
                  <span style={{ fontWeight: "700" }}>{s.percentage}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "var(--surface-alt)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${s.percentage}%`, height: "100%", background: "var(--pink)", borderRadius: "100px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
            No symptoms logged in the past 90 days.
          </p>
        )}
      </div>

      {/* Mood Distribution */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Mood Distribution</b>
        <p className="mut" style={{ margin: "0 0 12px", fontSize: "12.5px" }}>
          Total days with logged mood: {moods.totalLogged || 0}
        </p>

        {moods.totalLogged > 0 ? (
          <div style={{ display: "flex", gap: "6px", height: "16px", borderRadius: "100px", overflow: "hidden", marginBottom: "10px" }}>
            {moods.distribution.map(m => {
              if (!m.percentage) return null;
              const colors = ["#059669", "#0284C7", "#7C3AED", "#E11D48", "#D97706"];
              return (
                <div
                  key={m.moodIndex}
                  style={{
                    width: `${m.percentage}%`,
                    height: "100%",
                    background: colors[m.moodIndex] || "var(--pink)"
                  }}
                  title={`${MOOD_LABELS[m.moodIndex]}: ${m.percentage}%`}
                />
              );
            })}
          </div>
        ) : (
          <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
            No daily mood logs recorded yet.
          </p>
        )}
      </div>

      {/* Data Management Actions */}
      <div className="card" style={{ padding: "16px" }}>
        <b style={{ fontSize: "14px", display: "block", marginBottom: "10px" }}>Data & Privacy Actions</b>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button type="button" className="btn g sm" onClick={() => actions.exportCSV()}>
            <Icon name="download" size={16} />
            <span>Export CSV</span>
          </button>
          <button type="button" className="btn g sm" onClick={() => actions.exportJSON()}>
            <Icon name="download" size={16} />
            <span>Export JSON Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
