/**
 * CycleSideChick — Clinician Summary Modal Component
 * Wrapped in SheetModal with print styles and export actions.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { generateClinicianSummary } from "../../core/engine.js";

export function ClinicianModal() {
  const { S, ui } = useStore();
  if (!ui.clinicianModal) return null;

  const summary = generateClinicianSummary(S);

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeClinician()}
      title="ACOG Clinician Summary"
      maxWidth="620px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
          This report compiles objective menstrual health data, variability metrics, and reported symptoms according to ACOG and FIGO guidelines.
        </p>

        <Card variant="raised" style={{ padding: "16px", fontSize: "13px", lineHeight: "1.6" }}>
          <div><b>Report Date:</b> {new Date().toLocaleDateString()}</div>
          <div><b>Tracking Mode:</b> {S.mode || "natural"}</div>
          <div><b>Cycles Evaluated:</b> {summary.cycleCount || 0}</div>
          <div><b>Median Cycle Length:</b> {summary.medianLength || 28} days</div>
          <div><b>Mean Bleed Duration:</b> {summary.avgDuration || S.pl || 5} days</div>
          <div><b>FIGO Classification:</b> {summary.figoClassification || "Regular"}</div>
          <div><b>Reported Pain Range:</b> {summary.painRange || "None reported"}</div>
        </Card>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" icon="share" onClick={() => actions.copyClinicianSummary()}>
            Copy Summary
          </Button>
          <Button variant="primary" size="sm" icon="download" onClick={() => actions.printClinicianSummary()}>
            Print / PDF
          </Button>
        </div>
      </div>
    </SheetModal>
  );
}
