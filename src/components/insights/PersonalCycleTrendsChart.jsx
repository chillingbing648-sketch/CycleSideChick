/**
 * CycleSideChick — Component 08: Personal Cycle Trends Chart (Insights Page)
 * 
 * Features:
 * - Responsive SVG and bar charts for cycle lengths, recorded symptoms, and mood distribution.
 * - Date-range filter selection: 30d, 60d, 90d, All.
 * - Physiological FIGO benchmark band (21–35 days).
 * - Interactive hover tooltips.
 * - Clear, encouraging empty states when data is insufficient.
 * - Ethical non-diagnostic medical disclaimer.
 */

import React, { useState } from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "../ui/Icon.jsx";
import { Button } from "../ui/Button.jsx";
import { aggregateSymptoms, aggregateMoods, TD, I, fmt } from "../../core/engine.js";

export function PersonalCycleTrendsChart({ stats = {}, S = {} }) {
  const [rangeDays, setRangeDays] = useState(90); // 30, 60, 90, 365
  const [activeTab, setActiveTab] = useState("lengths"); // "lengths", "symptoms", "moods"
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const rawLens = stats.lens || [];
  const daysWindow = rangeDays === "all" ? 365 : rangeDays;

  // Real aggregations from engine
  const symptomsAgg = aggregateSymptoms(S, daysWindow);
  const moodsAgg = aggregateMoods(S, daysWindow);

  const symptomsList = symptomsAgg.symptoms || symptomsAgg.list || [];
  const moodDistribution = moodsAgg.distribution || [];

  const MOOD_NAMES = ["Sensitive", "Low", "Neutral", "Calm", "Great"];
  const MOOD_COLORS = ["#F0A584", "#A9CEF6", "#E2CA7F", "#B9A7E8", "#C9708C"];

  return (
    <div className="v-trends-chart-card">
      {/* Header with Title and Range Filters */}
      <div className="v-trends-header">
        <div>
          <span className="v-trends-subtle-tag">HISTORICAL DATA</span>
          <h3 className="v-trends-title">Personal Cycle Trends</h3>
        </div>

        {/* Date Range Selector Pills */}
        <div className="v-range-pills" role="radiogroup" aria-label="Date range selection">
          {[
            { val: 30, label: "30d" },
            { val: 60, label: "60d" },
            { val: 90, label: "90d" },
            { val: "all", label: "All" }
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              role="radio"
              aria-checked={rangeDays === r.val}
              className={`v-range-pill ${rangeDays === r.val ? "active" : ""}`}
              onClick={() => setRangeDays(r.val)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs: Lengths, Symptoms, Moods */}
      <div className="v-trends-subtabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "lengths"}
          className={`v-trend-subtab ${activeTab === "lengths" ? "active" : ""}`}
          onClick={() => setActiveTab("lengths")}
        >
          Cycle Lengths
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "symptoms"}
          className={`v-trend-subtab ${activeTab === "symptoms" ? "active" : ""}`}
          onClick={() => setActiveTab("symptoms")}
        >
          Symptoms ({symptomsList.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "moods"}
          className={`v-trend-subtab ${activeTab === "moods" ? "active" : ""}`}
          onClick={() => setActiveTab("moods")}
        >
          Mood Wellness
        </button>
      </div>

      {/* --- TAB 1: Cycle Lengths Chart --- */}
      {activeTab === "lengths" && (
        <div className="v-trends-body">
          <div className="v-benchmark-legend">
            <span className="v-benchmark-swatch" />
            <span className="v-benchmark-text">Normal FIGO physiological range: 21–35 days</span>
          </div>

          {rawLens.length >= 2 ? (
            <div className="v-chart-bars-wrap">
              {/* FIGO Benchmark shaded background zone (between 21d and 35d out of max 45d) */}
              <div
                className="v-benchmark-zone"
                style={{
                  bottom: `${(21 / 45) * 100}%`,
                  height: `${((35 - 21) / 45) * 100}%`
                }}
                title="Normal clinical range: 21–35 days"
              />

              <div className="v-chart-bars-container">
                {rawLens.slice(-8).map((len, idx) => {
                  const heightPercent = Math.min(100, Math.max(20, (len / 45) * 100));
                  const isNormal = len >= 21 && len <= 35;
                  const isHovered = hoveredIdx === idx;

                  return (
                    <div
                      key={idx}
                      className={`v-chart-col ${isHovered ? "hovered" : ""}`}
                      onPointerEnter={() => setHoveredIdx(idx)}
                      onPointerLeave={() => setHoveredIdx(null)}
                      tabIndex={0}
                      onFocus={() => setHoveredIdx(idx)}
                      onBlur={() => setHoveredIdx(null)}
                      aria-label={`Cycle ${idx + 1}: ${len} days ${isNormal ? "(Typical)" : "(Shift)"}`}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="v-chart-tooltip" role="tooltip">
                          <b>Cycle #{idx + 1}: {len} days</b>
                          <span>{isNormal ? "Within typical range" : "Natural variation"}</span>
                        </div>
                      )}

                      <span className="v-bar-val">{len}d</span>
                      <div
                        className={`v-bar-pillar ${isNormal ? "normal" : "shift"}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="v-bar-lbl">#{idx + 1}</span>
                    </div>
                  );
                })}
              </div>

              <div className="v-chart-footer-axis">
                <span>Older Cycles</span>
                <span>Most Recent</span>
              </div>
            </div>
          ) : (
            <div className="v-trends-empty">
              <Icon name="insights" size={24} />
              <p>Log at least 2 consecutive periods to unlock cycle length trend tracking.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.setTab("calendar")}
              >
                Go to Calendar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: Symptoms Frequency --- */}
      {activeTab === "symptoms" && (
        <div className="v-trends-body">
          {symptomsList.length > 0 ? (
            <div className="v-symptoms-breakdown-list">
              {symptomsList.slice(0, 7).map((sym) => {
                const totalLogged = symptomsAgg.totalLogged || 1;
                const pct = Math.round((sym.count / totalLogged) * 100);
                return (
                  <div key={sym.name} className="v-symptom-row">
                    <div className="v-symptom-row-labels">
                      <span className="v-sym-name">
                        {sym.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="v-sym-count">
                        {sym.count} logged ({pct}%)
                      </span>
                    </div>

                    <div className="v-sym-bar-track">
                      <div
                        className="v-sym-bar-fill"
                        style={{ width: `${Math.min(100, Math.max(10, pct * 2))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="v-trends-empty">
              <Icon name="sparkle" size={24} />
              <p>No symptoms recorded during this {rangeDays === "all" ? "entire" : `${rangeDays}-day`} period.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.goLog(I(TD()))}
              >
                Log Today's Symptoms
              </Button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: Mood Distribution --- */}
      {activeTab === "moods" && (
        <div className="v-trends-body">
          {moodsAgg.total > 0 ? (
            <div className="v-mood-distribution-list">
              {moodDistribution.map((m) => (
                <div key={m.moodIndex} className="v-mood-row">
                  <div className="v-mood-row-labels">
                    <span className="v-mood-name">
                      {MOOD_NAMES[m.moodIndex] || `Mood ${m.moodIndex}`}
                    </span>
                    <span className="v-mood-count">
                      {m.count} logs ({m.percentage}%)
                    </span>
                  </div>

                  <div className="v-mood-bar-track">
                    <div
                      className="v-mood-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(6, m.percentage))}%`,
                        background: MOOD_COLORS[m.moodIndex] || "var(--primary)"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="v-trends-empty">
              <Icon name="heart" size={24} />
              <p>No emotional mood check-ins logged during this timeframe.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.goLog(I(TD()))}
              >
                Log Today's Mood
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Ethical Medical Disclaimer */}
      <div className="v-trends-disclaimer">
        <Icon name="shield" size={13} />
        <span>
          CycleSideChick tracks wellness trends for personal awareness. Patterns reflect recorded logs and are not clinical or medical diagnoses.
        </span>
      </div>
    </div>
  );
}
