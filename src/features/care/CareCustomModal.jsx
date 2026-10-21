/**
 * CycleSideChick — Care Custom Item Modal Component
 * Wrapped in SheetModal primitive with zero inline styles.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

export function CareCustomModal() {
  const { ui } = useStore();
  if (!ui.careCustomModal) return null;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const ICONS = ["heart", "cup", "flame", "moon", "sun", "sparkle", "book", "activity"];

  const handleSave = e => {
    e.preventDefault();
    actions.saveCustomCareItem(title, desc);
  };

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeCustomCareModal()}
      title="Add Custom Care Item"
      maxWidth="460px"
    >
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
            ACTIVITY OR RITUAL NAME
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Magnesium soak, chamomile tea, walk"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13.5px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
            CATEGORY / NOTES
          </label>
          <input
            type="text"
            placeholder="e.g. Evening Rest, Nutrition, Gentle Movement"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13.5px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "6px" }}>
          <Button variant="secondary" size="sm" onClick={() => actions.closeCustomCareModal()}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Add to Kit
          </Button>
        </div>
      </form>
    </SheetModal>
  );
}
