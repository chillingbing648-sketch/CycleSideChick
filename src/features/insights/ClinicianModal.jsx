/**
 * CycleSideChick — Clinician Summary Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { generateClinicianSummary } from "../../core/engine.js";

export function ClinicianModal() {
  const { S, ui } = useStore();
  if (!ui.clinicianModal) return null;

  const summary = generateClinicianSummary(S);

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
      onClick={() => actions.closeClinician()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <span className="pill-tag" style={{ background: "var(--tint-mint-bg)", color: "var(--tint-mint-text)" }}>
              Clinical Report
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "20px" }}>ACOG Clinician Summary</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeClinician()}
            aria-label="Close summary"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <pre
          style={{
            background: "var(--surface-alt)",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "12.5px",
            lineHeight: "1.6",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            marginBottom: "16px",
            maxHeight: "360px",
            overflowY: "auto"
          }}
        >
          {summary}
        </pre>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn"
            style={{ flex: 1 }}
            onClick={() => actions.copyClinician()}
          >
            <Icon name="copy" size={16} />
            <span>Copy Text</span>
          </button>
          <button
            type="button"
            className="btn g"
            style={{ flex: 1 }}
            onClick={() => window.print()}
          >
            <Icon name="download" size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
