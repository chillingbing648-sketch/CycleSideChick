/**
 * CycleSideChick — Partner Sharing Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { calculateStats } from "../../core/engine.js";

export function PartnerModal() {
  const { S, ui } = useStore();
  if (!ui.partnerModal) return null;

  const stats = calculateStats(S);

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={() => actions.closePartner()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "19px" }}>Partner Summary</h2>
            <span className="subtle" style={{ fontSize: "12px" }}>Consent-based private cycle view</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closePartner()}
            aria-label="Close modal"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: "0 0 16px" }}>
          Share cycle timing and reassurance insights with a trusted partner without exposing your private symptom logs or daily reflections.
        </p>

        <div className="card tint-rose" style={{ padding: "16px", marginBottom: "18px" }}>
          <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
            <div><b>Typical cycle length:</b> {stats.avg || 28} days</div>
            <div><b>Current phase:</b> {stats.cur ? `Day ${stats.cur.cd}` : "Logged"}</div>
            <div><b>Next expected period:</b> ~{stats.nextPred || "Soon"}</div>
          </div>
        </div>

        <button
          type="button"
          className="btn"
          style={{ width: "100%" }}
          onClick={() => actions.copyPartnerLink()}
        >
          <Icon name="copy" size={16} />
          <span>Copy Partner Summary</span>
        </button>
      </div>
    </div>
  );
}
