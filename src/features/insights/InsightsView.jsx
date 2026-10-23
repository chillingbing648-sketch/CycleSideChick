/**
 * CycleSideChick — Insights View Component
 * 
 * Features:
 * - ACOG Clinician Summary trigger.
 * - Primary physiological metrics grid (Cycle Length, Bleed Duration, FIGO Regularity, Cycles Tracked).
 * - Component 06: Four-Phase Cycle Timeline (connected 4 segments with interactive hormonal breakdown).
 * - Component 08: Personal Cycle Trends Chart (responsive trends with date-range selection and FIGO benchmark).
 * - Component 07: Expandable Insight Cards (smooth CSS grid layout animations and sensible empty states).
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { CyclePhaseTimeline } from "../../components/insights/CyclePhaseTimeline.jsx";
import { PersonalCycleTrendsChart } from "../../components/insights/PersonalCycleTrendsChart.jsx";
import { ExpandableInsightCard } from "../../components/insights/ExpandableInsightCard.jsx";
import {
  calculateStats,
  calculatePeriodDurations,
  calculateVariability,
  aggregateSymptoms,
  aggregateMoods,
  TD,
  I
} from "../../core/engine.js";

export function InsightsView() {
  const { S } = useStore();
  const stats = calculateStats(S);
  const durations = calculatePeriodDurations(S);
  const variability = calculateVariability(S);
  const symptomsAgg = aggregateSymptoms(S, 90);
  const moodsAgg = aggregateMoods(S, 90);

  const rawLens = stats.lens || [];
  const hasHistory = Boolean(stats && stats.n > 0 && stats.cur);

  return (
    <div className="insights-view" style={{ paddingBottom: "110px" }}>
      {/* 1. Clinician Summary Export Card */}
      <Card variant="tinted" tint="mint" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <Icon name="shield" size={18} />
              <b style={{ fontSize: "14px" }}>ACOG Clinician Summary</b>
            </div>
            <p className="mut" style={{ margin: 0, fontSize: "12.5px" }}>
              Generate an objective reproductive health report ready for gynecologist or physician visits.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => actions.openClinician()}>
            View Report
          </Button>
        </div>
      </Card>

      {/* 2. Primary Physiological Metrics Grid */}
      <div className="v-insights-grid" style={{ marginBottom: "16px" }}>
        <Card variant="base" className="v-insights-metric">
          <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>AVG CYCLE LENGTH</span>
          <div className="v-insights-metric__val">
            {stats.avg || S.cl || 28} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>days</span>
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
          <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "var(--plum)", margin: "8px 0 4px" }}>
            {variability.figoCategory || "Regular"}
          </div>
          <span className="mut" style={{ fontSize: "12px" }}>
            Spread: {variability.spread || 0} days
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

      {/* 3. Component 06: Four-Phase Cycle Timeline */}
      <div style={{ marginBottom: "16px" }}>
        <CyclePhaseTimeline stats={stats} S={S} />
      </div>

      {/* 4. Component 08: Personal Cycle Trends Chart */}
      <div style={{ marginBottom: "20px" }}>
        <PersonalCycleTrendsChart stats={stats} S={S} />
      </div>

      {/* 5. Component 07: Expandable Insight Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ margin: "4px 0 8px", fontSize: "16px", color: "var(--plum)" }}>
          Clinical Insights & Body Science
        </h3>

        {/* Card 1: FIGO Regularity & Cycle Health */}
        <ExpandableInsightCard
          id="regularity"
          title="Cycle Regularity & FIGO Benchmark"
          subtitle="International Federation of Gynecology and Obstetrics"
          badge="Classification"
          icon="shield"
          tint="mint"
          summary={`Your cycle variability spread is ${variability.spread || 0} days, categorized as ${variability.figoCategory || "Regular"} under clinical criteria.`}
          initiallyExpanded={true}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}>
              The International Federation of Gynecology and Obstetrics (FIGO) defines a normal adult cycle length as between <b>24 and 38 days</b>, with variation of <b>7 to 9 days or fewer</b> between your shortest and longest cycles.
            </p>
            <div style={{ background: "var(--surface-alt)", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
              <b>Your Clinical Metrics:</b>
              <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                <li>Median Cycle Length: <b>{stats.med || stats.avg || 28} days</b></li>
                <li>Standard Deviation: <b>±{variability.stdDev || 1} days</b></li>
                <li>Longest vs. Shortest Cycle Spread: <b>{variability.spread || 0} days</b></li>
              </ul>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Natural variation occurs with acute stress, circadian shifts, travel, or illness. If your cycle regularly varies by more than 10 days, discussing it with your clinician is recommended.
            </p>
          </div>
        </ExpandableInsightCard>

        {/* Card 2: Hormone Dynamics Across Phases */}
        <ExpandableInsightCard
          id="hormones"
          title="The Endocrine Wave: Estrogen & Progesterone"
          subtitle="Hormone Receptor Fluctuations"
          badge="Endocrine"
          icon="flower"
          tint="lavender"
          summary="Estrogen promotes tissue proliferation and mental vitality; progesterone calms the nervous system and prepares the endometrium."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}>
              Throughout your natural cycle, estrogen and progesterone rise and fall in a tightly orchestrated sequence guided by the hypothalamic-pituitary-ovarian (HPO) axis:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ background: "#FCEEF2", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                <b style={{ color: "var(--primary)" }}>Estrogen (Estradiol)</b>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--plum)" }}>
                  Peaks right before ovulation. Enhances serotonin production, boosts cognitive focus, and improves insulin sensitivity.
                </p>
              </div>
              <div style={{ background: "#F3EFFC", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                <b style={{ color: "#7D61BD" }}>Progesterone</b>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--plum)" }}>
                  Secreted by the corpus luteum post-ovulation. Converts into allopregnanolone, acting on GABA-A brain receptors with calming properties.
                </p>
              </div>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Rapid premenstrual declines in progesterone can cause sensory sensitivity, sleep changes, and fluid retention. Tracking helps anticipate these natural biological rhythms.
            </p>
          </div>
        </ExpandableInsightCard>

        {/* Card 3: Reported Symptom Patterns */}
        <ExpandableInsightCard
          id="patterns"
          title="Recorded Symptom Patterns & Frequencies"
          subtitle="Past 90 Days Aggregation"
          badge="Patterns"
          icon="sparkles"
          tint="rose"
          summary={
            symptomsAgg.totalLogged > 0
              ? `${symptomsAgg.totalLogged} symptoms logged over the past 90 days. Top sensation: ${((symptomsAgg?.symptoms || [])[0]?.name || "cramps").replace(/_/g, " ")}.`
              : "Track daily sensations to reveal which symptoms peak during specific cycle phases."
          }
          emptyState={
            symptomsAgg.totalLogged === 0
              ? {
                  isEmpty: true,
                  message: "No symptoms recorded in the past 90 days. Log daily symptoms to visualize phase correlations.",
                  actionLabel: "Log Today",
                  onAction: () => actions.goLog(I(TD()))
                }
              : null
          }
        >
          {symptomsAgg.totalLogged > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <p style={{ margin: 0 }}>
                Here are your most commonly recorded sensations across all logged entries:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(symptomsAgg?.symptoms || []).slice(0, 5).map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "var(--surface-alt)",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <b>{s.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</b>
                    <span style={{ color: "var(--primary)", fontWeight: "700" }}>{s.count} times</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                Symptoms that recur consistently in the luteal phase (5–7 days before menses) are characteristic of physiological premenstrual response.
              </p>
            </div>
          )}
        </ExpandableInsightCard>

        {/* Card 4: Rest & Nourishment Alignment */}
        <ExpandableInsightCard
          id="wellness"
          title="Cycle-Synced Nourishment & Rest Guidance"
          subtitle="Physiological Care Principles"
          badge="Self-Care"
          icon="tea"
          tint="peach"
          summary="Nutritional and lifestyle adaptations tailored to basal metabolic shifts throughout your cycle."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}>
              During the luteal phase, basal body temperature rises by approximately 0.5°F and resting metabolic rate increases by 100–300 calories per day.
            </p>
            <div style={{ background: "var(--surface-alt)", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
              <b>Evidence-Based Recommendations:</b>
              <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                <li><b>Menstrual Phase:</b> Replenish iron with dark leafy greens and warm stews; favor gentle restorative yoga over high-intensity strain.</li>
                <li><b>Follicular Phase:</b> Benefit from peak insulin sensitivity with balanced complex carbs; progressive strength training.</li>
                <li><b>Ovulatory Phase:</b> Peak cardiovascular endurance; prioritize hydration with electrolytes.</li>
                <li><b>Luteal Phase:</b> Support progesterone synthesis with vitamin B6, magnesium, and healthy fats; prioritize an extra 30 minutes of sleep.</li>
              </ul>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Always honor what feels restorative to your body over rigid rules.
            </p>
          </div>
        </ExpandableInsightCard>
      </div>
    </div>
  );
}
