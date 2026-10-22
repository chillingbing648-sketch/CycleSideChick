/**
 * CycleSideChick — Component 06: Four-Phase Cycle Timeline (Cycle Insights)
 * 
 * Features:
 * - Connected four-segment timeline for menstrual, follicular, ovulatory, and luteal phases.
 * - Highlights current phase based on real cycle calculations.
 * - Distinguishes confirmed logged events from estimated predictions.
 * - Suppresses fertile/ovulatory arcs in contraception mode.
 * - Tapping a phase smoothly expands evidence-based hormonal and care guidance.
 */

import React, { useState } from "react";
import { Icon } from "../ui/Icon.jsx";
import { TD, I, fmt } from "../../core/engine.js";

export function CyclePhaseTimeline({ stats = {}, S = {} }) {
  const [selectedPhaseKey, setSelectedPhaseKey] = useState(null);

  const hasHistory = Boolean(stats && stats.n > 0 && stats.cur);
  const cycleDay = stats.cur ? stats.cur.cd : 1;
  const cycleAvg = stats.avg || S.cl || 28;
  const periodLen = S.pl || 5;
  const mode = S.mode || "natural";
  const isContraception = mode === "contraception";

  // Determine active phase key
  let activePhaseKey = "luteal";
  if (cycleDay <= periodLen) {
    activePhaseKey = "menstrual";
  } else if (stats.ovulationDate && Math.abs(TD() - stats.ovulationDate) <= 1) {
    activePhaseKey = "ovulatory";
  } else if (stats.fertileStart && TD() >= stats.fertileStart && TD() <= stats.fertileEnd) {
    activePhaseKey = "ovulatory";
  } else if (cycleDay <= Math.max(6, cycleAvg - 14 - 1)) {
    activePhaseKey = "follicular";
  } else {
    activePhaseKey = "luteal";
  }

  // Date estimates
  const cycleStartDn = stats.cur ? stats.cur.s : TD() - cycleDay + 1;
  const menstrualEndDn = cycleStartDn + periodLen - 1;
  const ovulationDn = stats.ovulationDate || cycleStartDn + cycleAvg - (S.ll || 14);
  const follicularEndDn = ovulationDn - 3;
  const lutealStartDn = ovulationDn + 2;
  const nextPeriodDn = stats.nextPred || cycleStartDn + cycleAvg;

  const PHASES = [
    {
      key: "menstrual",
      name: "Menstrual Phase",
      shortName: "Menstrual",
      daysRange: `Days 1–${periodLen}`,
      dateLabel: stats.cur ? `${fmt(cycleStartDn, { month: "short", day: "numeric" })} – ${fmt(menstrualEndDn, { month: "short", day: "numeric" })}` : `Est. ~${periodLen} days`,
      isConfirmed: Boolean(stats.cur && cycleDay <= periodLen),
      color: "var(--phase-period, #C9708C)",
      tintBg: "#FCEEF2",
      icon: "phaseMenstrual",
      estrogen: "Lowest baseline",
      progesterone: "Lowest baseline",
      energy: "Reflective, restorative",
      signals: "Menstrual flow, uterine cramping (prostaglandins), need for rest.",
      care: "Warm heat packs, gentle pelvic stretching, magnesium-rich foods, early bedtime."
    },
    {
      key: "follicular",
      name: "Follicular Phase",
      shortName: "Follicular",
      daysRange: `Days ${periodLen + 1}–${Math.max(periodLen + 1, Math.round(cycleAvg / 2) - 2)}`,
      dateLabel: hasHistory ? `Est. ${fmt(menstrualEndDn + 1, { month: "short", day: "numeric" })} – ${fmt(follicularEndDn, { month: "short", day: "numeric" })}` : "Estimated next",
      isConfirmed: false,
      color: "var(--phase-follicular, #E8A07A)",
      tintBg: "#FFF4ED",
      icon: "phaseFollicular",
      estrogen: "Steadily rising",
      progesterone: "Low and quiet",
      energy: "Rising vitality & focus",
      signals: "Follicle development, creamy to watery fluid, higher physical stamina.",
      care: "Energizing movement, social connection, starting new creative projects, fresh vegetables."
    },
    {
      key: "ovulatory",
      name: "Ovulatory Phase",
      shortName: "Ovulatory",
      daysRange: isContraception ? "Suppressed" : `Days ~${Math.round(cycleAvg / 2) - 1}–${Math.round(cycleAvg / 2) + 1}`,
      dateLabel: isContraception ? "Inactive (Pill Mode)" : hasHistory ? `Est. ~${fmt(ovulationDn, { month: "short", day: "numeric" })}` : "Estimated peak",
      isConfirmed: false,
      color: "var(--phase-ovulatory, #9A84DC)",
      tintBg: "#F3EFFC",
      icon: "phaseOvulatory",
      estrogen: isContraception ? "Suppressed" : "Peak pre-ovulatory surge",
      progesterone: isContraception ? "Suppressed" : "Beginning initial rise",
      energy: "Peak communicative power",
      signals: isContraception
        ? "Ovulation is medically suppressed by hormonal contraception."
        : "Clear slippery egg-white fluid (EWCM), subtle mittelschmerz twinge, heightened sensory awareness.",
      care: "Challenging workouts, important meetings, balanced electrolyte hydration."
    },
    {
      key: "luteal",
      name: "Luteal Phase",
      shortName: "Luteal",
      daysRange: `Days ~${Math.round(cycleAvg / 2) + 2}–${cycleAvg}`,
      dateLabel: hasHistory ? `Est. ${fmt(lutealStartDn, { month: "short", day: "numeric" })} – ${fmt(nextPeriodDn - 1, { month: "short", day: "numeric" })}` : "Estimated phase",
      isConfirmed: false,
      color: "var(--phase-luteal, #A8D5BA)",
      tintBg: "#EEF8F2",
      icon: "phaseLuteal",
      estrogen: "Moderate secondary rise",
      progesterone: "Peak dominance",
      energy: "Inward, protective, nesting",
      signals: "Corpus luteum activity, digestive changes (progesterone slowing motility), nesting instincts, tender breasts.",
      care: "Pilates, yoga, warm herbal infusions, complex grains, firm personal boundaries."
    }
  ];

  const activePhaseObj = PHASES.find((p) => p.key === activePhaseKey) || PHASES[0];
  const displayedPhase = selectedPhaseKey
    ? PHASES.find((p) => p.key === selectedPhaseKey)
    : activePhaseObj;

  return (
    <div className="v-phase-timeline-card">
      <div className="v-timeline-header">
        <div>
          <span className="v-timeline-subtle-tag">CYCLE DYNAMICS</span>
          <h3 className="v-timeline-title">Four-Phase Cycle Timeline</h3>
        </div>
        <div className="v-timeline-current-badge">
          Current: <b>{activePhaseObj.shortName}</b>
        </div>
      </div>

      <p className="v-timeline-instruction">
        Tap any segment to inspect hormonal patterns and educational guidance:
      </p>

      {/* Connected 4-Segment Interactive Bar */}
      <div className="v-timeline-segments-track" role="tablist" aria-label="Cycle Phases Timeline">
        {PHASES.map((phase) => {
          const isCurrent = activePhaseKey === phase.key;
          const isSelected = displayedPhase.key === phase.key;
          return (
            <button
              key={phase.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`v-timeline-segment ${isCurrent ? "is-current" : ""} ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelectedPhaseKey(phase.key)}
              style={{
                "--phase-color": phase.color,
                "--phase-tint": phase.tintBg
              }}
            >
              <div className="v-segment-bar-fill" />
              <div className="v-segment-label-col">
                <span className="v-segment-name">{phase.shortName}</span>
                <span className="v-segment-days">{phase.daysRange}</span>
              </div>
              <div className="v-segment-now-marker" aria-hidden="true">
                {isCurrent && <span className="v-marker-dot" title="Current Phase" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Educational Phase Guidance */}
      {displayedPhase && (
        <div className="v-timeline-details-pane" style={{ borderColor: displayedPhase.color }}>
          <div className="v-phase-detail-top">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                className="v-phase-icon-bubble"
                style={{ background: displayedPhase.tintBg, color: displayedPhase.color }}
              >
                <Icon name={displayedPhase.icon} size={18} />
              </div>
              <div>
                <h4 className="v-phase-detail-name" style={{ color: displayedPhase.color }}>
                  {displayedPhase.name}
                </h4>
                <div className="v-phase-detail-badge-row">
                  <span className="v-phase-days-pill">{displayedPhase.daysRange}</span>
                  <span className={`v-phase-status-pill ${displayedPhase.isConfirmed ? "confirmed" : "estimated"}`}>
                    {displayedPhase.isConfirmed ? "Confirmed Log" : "Estimated Dates"}
                  </span>
                  <span className="v-phase-date-string">{displayedPhase.dateLabel}</span>
                </div>
              </div>
            </div>

            {selectedPhaseKey && selectedPhaseKey !== activePhaseKey && (
              <button
                type="button"
                className="v-phase-reset-btn"
                onClick={() => setSelectedPhaseKey(null)}
              >
                Reset to current
              </button>
            )}
          </div>

          {/* Hormonal & Bodily Indicators Grid */}
          <div className="v-phase-info-grid">
            <div className="v-phase-info-item">
              <span className="v-phase-info-label">Estrogen Level</span>
              <b className="v-phase-info-value">{displayedPhase.estrogen}</b>
            </div>

            <div className="v-phase-info-item">
              <span className="v-phase-info-label">Progesterone Level</span>
              <b className="v-phase-info-value">{displayedPhase.progesterone}</b>
            </div>

            <div className="v-phase-info-item">
              <span className="v-phase-info-label">Energy State</span>
              <b className="v-phase-info-value">{displayedPhase.energy}</b>
            </div>
          </div>

          {/* Signals & Supportive Care */}
          <div className="v-phase-text-block">
            <b className="v-phase-block-title">Bodily Signals & Biomarkers:</b>
            <p className="v-phase-block-content">{displayedPhase.signals}</p>
          </div>

          <div className="v-phase-text-block">
            <b className="v-phase-block-title">Supportive Self-Care Focus:</b>
            <p className="v-phase-block-content">{displayedPhase.care}</p>
          </div>
        </div>
      )}
    </div>
  );
}
