/**
 * CycleSideChick — Care Custom Item Modal Component
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
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
      onClick={() => actions.closeCustomCareModal()}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "19px" }}>Add Custom Comfort Item</h2>
            <span className="subtle" style={{ fontSize: "12px" }}>Personal ritual or supportive activity</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeCustomCareModal()}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Title</label>
            <input
              type="text"
              placeholder="e.g. Lavender bath, Cat cuddling"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 10px", fontSize: "13.5px" }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. 15 minutes of quiet soaking"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13.5px" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Choose an Icon</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ICONS.map(ic => {
                const isSelected = (ui.careCustomIcon || "flame") === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    className="icon-btn"
                    onClick={() => actions.selectCustomCareIcon(ic)}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid var(--pink)" : "1px solid var(--border)",
                      background: isSelected ? "var(--pink-light)" : "var(--surface)",
                      color: isSelected ? "var(--pink)" : "inherit",
                      cursor: "pointer"
                    }}
                  >
                    <Icon name={ic} size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: "100%" }}>
            Save to Care Kit
          </button>
        </form>
      </div>
    </div>
  );
}
