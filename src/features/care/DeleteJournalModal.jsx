/**
 * CycleSideChick — Delete Journal Entry Confirmation Modal
 * Wrapped in SheetModal primitive with danger action.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function DeleteJournalModal() {
  const { ui } = useStore();
  const dateToDelete = ui.deleteJournalConfirm;
  if (!dateToDelete) return null;

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.cancelDeleteJournal()}
      title="Delete Reflection?"
      maxWidth="420px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0 }}>
          Are you sure you want to delete your journal reflection for <b>{dateToDelete}</b>? This cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" onClick={() => actions.cancelDeleteJournal()}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" icon="trash" onClick={() => actions.executeDeleteJournal(dateToDelete)}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </SheetModal>
  );
}
