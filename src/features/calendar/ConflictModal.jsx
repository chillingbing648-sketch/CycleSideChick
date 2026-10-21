/**
 * CycleSideChick — Period Conflict Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function ConflictModal() {
  const { ui } = useStore();
  const conflict = ui.conflict;
  if (!conflict) return null;

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
      onClick={() => actions.conflictClose()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "var(--tint-amber-text)" }}>
          <Icon name="alert" size={24} />
          <h2 style={{ margin: 0, fontSize: "18px" }}>Overlapping Period Detected</h2>
        </div>

        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: "0 0 16px" }}>
          The date you logged overlaps with an existing period. How would you like to record this?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            type="button"
            className="btn"
            onClick={() => actions.conflictSpotting()}
          >
            Mark as Spotting (Non-Period Bleed)
          </button>
          <button
            type="button"
            className="btn g"
            onClick={() => actions.conflictExtend()}
          >
            Extend Existing Period
          </button>
          <button
            type="button"
            className="btn g"
            onClick={() => actions.conflictClose()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
