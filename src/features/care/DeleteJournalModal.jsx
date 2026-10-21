/**
 * CycleSideChick — Delete Journal Entry Confirmation Modal
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function DeleteJournalModal() {
  const { ui } = useStore();
  const dateToDelete = ui.deleteJournalConfirm;
  if (!dateToDelete) return null;

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
      onClick={() => actions.cancelDeleteJournal()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "var(--phase-menstrual)" }}>
          <Icon name="trash" size={22} />
          <h2 style={{ margin: 0, fontSize: "18px" }}>Delete Reflection?</h2>
        </div>

        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: "0 0 18px" }}>
          Are you sure you want to delete your journal reflection for <b>{dateToDelete}</b>? This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn g"
            style={{ flex: 1 }}
            onClick={() => actions.cancelDeleteJournal()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, background: "var(--phase-menstrual)", color: "#FFFFFF" }}
            onClick={() => actions.deleteJournalEntry()}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
