/**
 * CycleSideChick — Insights View Component
 * Features interactive SVG scrub chart with floating crosshair tooltip,
 * FIGO regularity breakdown, horizontal correlation bars, and clinician summary card.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { calculateStats, calculatePeriodDurations, calculateVariability, aggregateSymptoms, aggregateMoods } from "../../core/engine.js";

export function InsightsView() {
  const { S } = useStore();
  const stats = calculateStats(S);
  const durations = calculatePeriodDurations(S);
  const variability = calculateVariability(S);
  const symptoms = aggregateSymptoms(S, 90);
  const moods = aggregateMoods(S, 90);

  const [activeScrubIdx, setActiveScrubIdx] = useState(null);

  const MOOD_LABELS = ["Great", "Calm", "Sensitive", "Low", "Irritable"];
  const lens = stats.lens || [];

  return (
    <div className="insights-view" style={{ paddingBottom: "40px" }}>
      <div className="v-insights-layout">
        <div className="v-insights-left-pane">
          {/* 1. Clinician Summary Export Card */}
          <Card variant="tinted" tint="mint" style={{ padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <Icon name="shield" size={18} />
                  <b style={{ fontSize: "14px" }}>ACOG Clinician Summary</b>
                </div>
                <p className="mut" style={{ margin: 0, fontSize: "12.5px" }}>
                  Export an objective reproductive health summary for doctor visits.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => actions.openClinician()}>
                View Report
              </Button>
            </div>
          </Card>

          {/* 2. Primary Metrics Grid */}
          <div className="v-insights-grid">
            <Card variant="base" className="v-insights-metric">
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>AVG CYCLE LENGTH</span>
              <div className="v-insights-metric__val">
                {stats.avg || 28} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>days</span>
              </div>
              <span className="mut" style={{ fontSize: "12px" }}>
                Range: ±{stats.pm || 1} d · {stats.confLevel || "Moderate"}
              </span>
            </Card>

            <Card variant="base" className="v-insights-metric">
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>AVG BLEED DURATION</span>
              <div className="v-insights-metric__val">
                {durations.average || S.pl || 5} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>days</span>
              </div>
              <span className="mut" style={{ fontSize: "12px" }}>
                {durations.totalBleedDays || 0} bleed days logged
              </span>
            </Card>

            <Card variant="base" className="v-insights-metric">
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>FIGO REGULARITY</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: "700", color: "var(--plum)", margin: "8px 0 4px" }}>
                {variability.figoCategory || "Regular"}
              </div>
              <span className="mut" style={{ fontSize: "12px" }}>
                Variation: {variability.spread || 0} days
              </span>
            </Card>

            <Card variant="base" className="v-insights-metric">
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>CYCLES TRACKED</span>
              <div className="v-insights-metric__val">
                {stats.n || (S.periods ? S.periods.length : 0)}
              </div>
              <span className="mut" style={{ fontSize: "12px" }}>
                {stats.outlierDetected ? "Outlier filtered" : "Baseline steady"}
              </span>
            </Card>
          </div>
        </div>

        <div className="v-insights-right-pane">
          {/* 3. Interactive Cycle Length History Chart with Scrub Tooltip */}
          <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
            <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Cycle Length Trends & Benchmark</b>
            <p className="mut" style={{ margin: "0 0 16px", fontSize: "12.5px" }}>
              Standard physiological benchmark: 21–35 days (FIGO / ACOG guidelines)
            </p>

            {lens.length > 0 ? (
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "130px", padding: "10px 0", position: "relative" }}>
                  {/* Benchmark zone indicator */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: "35%",
                      height: "35%",
                      background: "var(--tint-mint-bg)",
                      opacity: 0.45,
                      borderRadius: "4px",
                      pointerEvents: "none"
                    }}
                    title="Normal range: 21–35 days"
                  />

                  {lens.slice(-8).map((len, idx) => {
                    const heightPercent = Math.min(100, Math.max(25, (len / 45) * 100));
                    const isNormal = len >= 21 && len <= 35;
                    const isHovered = activeScrubIdx === idx;

                    return (
                      <div
                        key={idx}
                        onPointerEnter={() => setActiveScrubIdx(idx)}
                        onPointerLeave={() => setActiveScrubIdx(null)}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "100%",
                          justifyContent: "flex-end",
                          cursor: "pointer",
                          position: "relative"
                        }}
                      >
                        {isHovered && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "105%",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: "var(--plum)",
                              color: "#FFFFFF",
                              fontSize: "11px",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                              zIndex: 2
                            }}
                          >
                            Cycle {idx + 1}: {len} days {isNormal ? "(Normal)" : "(Shift)"}
                          </div>
                        )}
                        <span style={{ fontSize: "11px", fontWeight: "700", marginBottom: "4px", color: isHovered ? "var(--berry)" : "inherit" }}>
                          {len}d
                        </span>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "36px",
                            height: `${heightPercent}%`,
                            borderRadius: "6px 6px 0 0",
                            background: isHovered
                              ? "var(--plum)"
                              : isNormal
                              ? "var(--phase-follicular)"
                              : "var(--phase-luteal)",
                            transition: "background 0.15s ease, height 0.3s ease"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                  <span>Older</span>
                  <span>Most Recent</span>
                </div>
              </div>
            ) : (
              <p className="mut" style={{ margin: "10px 0", fontSize: "13px" }}>
                Log at least 2 consecutive periods to unlock trend charts and variability statistics.
              </p>
            )}
          </Card>

          {/* 4. 90-Day Symptom Correlation Breakdown */}
          <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
            <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Reported Symptom Frequency</b>
            <p className="mut" style={{ margin: "0 0 14px", fontSize: "12.5px" }}>
              Aggregated over the past 90 days.
            </p>

            {symptoms && symptoms.length > 0 ? (
              <div>
                {symptoms.slice(0, 6).map(sym => (
                  <div key={sym.id} className="v-insights-bar-row">
                    <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "120px" }}>
                      {sym.label || sym.id}
                    </span>
                    <div className="v-insights-bar-track">
                      <div className="v-insights-bar-fill" style={{ width: `${Math.min(100, sym.pct)}%` }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", minWidth: "40px", textAlign: "right" }}>
                      {sym.pct}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
                No symptoms recorded in the past 90 days. Log daily symptoms to visualize patterns.
              </p>
            )}
          </Card>

          {/* 5. 90-Day Mood Breakdown */}
          <Card variant="base" style={{ padding: "16px" }}>
            <b style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Emotional Wellness Distribution</b>
            <p className="mut" style={{ margin: "0 0 14px", fontSize: "12.5px" }}>
              Frequency of recorded mood states.
            </p>

            {moods && moods.length > 0 ? (
              <div>
                {moods.map(m => (
                  <div key={m.mood} className="v-insights-bar-row">
                    <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "100px" }}>
                      {MOOD_LABELS[m.mood] || "Calm"}
                    </span>
                    <div className="v-insights-bar-track">
                      <div
                        className="v-insights-bar-fill"
                        style={{
                          width: `${Math.min(100, m.pct)}%`,
                          background: "linear-gradient(90deg, var(--tint-lavender-border) 0%, var(--berry) 100%)"
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", minWidth: "40px", textAlign: "right" }}>
                      {m.pct}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
                No mood entries logged yet in the past 90 days.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
