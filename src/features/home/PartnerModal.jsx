/**
 * CycleSideChick — Partner Sharing Modal Component
 * Wrapped in SheetModal with zero inline styles.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { calculateStats } from "../../core/engine.js";

export function PartnerModal() {
  const { S, ui } = useStore();
  if (!ui.partnerModal) return null;

  const stats = calculateStats(S);

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closePartner()}
      title="Partner Summary"
      maxWidth="480px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0 }}>
          Share cycle timing and reassurance insights with a trusted partner without exposing your private symptom logs or daily reflections.
        </p>

        <Card variant="tinted" tint="lavender" style={{ padding: "16px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Current Cycle Status</b>
          <div style={{ fontSize: "13.5px", lineHeight: "1.6" }}>
            <div>Cycle Phase: <b>{stats.cur ? `Day ${stats.cur.cd}` : "Natural Cycle"}</b></div>
            <div>Estimated Next Period: <b>~{stats.nextPred ? new Date(stats.nextPred * 864e5).toLocaleDateString() : "Calculating"}</b></div>
            <div style={{ marginTop: "6px", fontStyle: "italic", color: "var(--plum)" }}>
              "A gentle reminder: emotional and energy levels naturally fluctuate across cycle phases. Supportive presence is deeply valued."
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" onClick={() => actions.copyPartnerLink()}>
            Copy Summary Link
          </Button>
          <Button variant="primary" size="sm" onClick={() => actions.closePartner()}>
            Done
          </Button>
        </div>
      </div>
    </SheetModal>
  );
}
