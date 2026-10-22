/**
 * CycleSideChick — Period Conflict Modal Component
 * Wrapped in SheetModal with clinical clarity options.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";

export function ConflictModal() {
  const { ui } = useStore();
  const conflict = ui.conflict;
  if (!conflict) return null;

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.conflictClose()}
      title="Overlapping Period Detected"
      maxWidth="460px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p className="mut" style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0 }}>
          The date you logged overlaps with an existing recorded cycle. How would you like to reconcile this entry?
        </p>

        <Button variant="secondary" onClick={() => actions.conflictSpotting()}>
          Mark as Spotting (Mid-Cycle Bleed)
        </Button>
        <Button variant="secondary" onClick={() => actions.conflictExtend()}>
          Extend Existing Period
        </Button>
        <Button variant="danger" onClick={() => actions.conflictReplace()}>
          Replace Existing Period Record
        </Button>
        <Button variant="ghost" onClick={() => actions.conflictClose()}>
          Cancel
        </Button>
      </div>
    </SheetModal>
  );
}
