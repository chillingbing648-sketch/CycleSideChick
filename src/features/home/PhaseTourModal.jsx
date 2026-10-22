/**
 * CycleSideChick — 4-Phase Cycle Tour Modal Component
 * Wrapped in SheetModal primitive with SegmentedControl for switching phases.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { SegmentedControl } from "../../components/ui/SegmentedControl.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function PhaseTourModal() {
  const { ui } = useStore();
  if (!ui.tourModal) return null;

  const currentTab = ui.tourTab || 0;

  const PHASES = [
    {
      id: "0",
      label: "Menstrual",
      title: "1. Menstrual Phase",
      timing: "Days 1 to 5–7",
      hormones: "Estrogen & progesterone at baseline",
      energy: "Reflective, restorative, inward focus",
      care: "Warm teas, cozy clothing, pelvic heat, permission to rest without guilt."
    },
    {
      id: "1",
      label: "Follicular",
      title: "2. Follicular Phase",
      timing: "Days 6 to 12",
      hormones: "FSH recruits follicles; estradiol climbs steadily",
      energy: "Rising mental stamina, creativity, physical vigor",
      care: "New projects, dynamic movement, fresh nourishing meals."
    },
    {
      id: "2",
      label: "Ovulatory",
      title: "3. Ovulatory Phase",
      timing: "Days 13 to 16",
      hormones: "LH surge triggers egg release; estrogen peaks",
      energy: "Peak sociability, communication, vitality",
      care: "Social connection, higher energy workouts, fertile window awareness."
    },
    {
      id: "3",
      label: "Luteal",
      title: "4. Luteal Phase",
      timing: "Days 17 to 28+",
      hormones: "Progesterone dominates, stabilizes uterine lining",
      energy: "Nesting, detail orientation, gradual slow-down",
      care: "Magnesium, regular sleep routines, boundary setting, gentle stretching."
    }
  ];

  const phase = PHASES[currentTab] || PHASES[0];

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeTour()}
      title="The Four Cycle Phases"
      maxWidth="560px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <SegmentedControl
          value={String(currentTab)}
          onChange={val => actions.setTourTab(Number(val))}
          ariaLabel="Cycle Phase Switcher"
          items={PHASES.map(p => ({ id: p.id, label: p.label }))}
        />

        <Card variant="raised" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "18px" }}>{phase.title}</h3>
            <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11.5px" }}>
              {phase.timing}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px", lineHeight: "1.55" }}>
            <div>
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block" }}>HORMONAL SHIFT</span>
              <span>{phase.hormones}</span>
            </div>
            <div>
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block" }}>NATURAL ENERGY & MOOD</span>
              <span>{phase.energy}</span>
            </div>
            <div>
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block" }}>NURTURING CARE TIPS</span>
              <span>{phase.care}</span>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentTab === 0}
            onClick={() => actions.setTourTab(Math.max(0, currentTab - 1))}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (currentTab < 3) actions.setTourTab(currentTab + 1);
              else actions.closeTour();
            }}
          >
            {currentTab < 3 ? "Next Phase" : "Got it"}
          </Button>
        </div>
      </div>
    </SheetModal>
  );
}
