/**
 * CycleSideChick — Article Modal Component
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function ArticleModal() {
  const { ui } = useStore();
  const article = ui.activeArticle;
  if (!article) return null;

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
      onClick={() => actions.closeArticle()}
    >
      <div
        className="modal-panel view-enter card"
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px",
          background: "var(--surface-elevated)",
          borderRadius: "20px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <span className="pill-tag" style={{ background: "var(--surface-alt)", fontSize: "11px" }}>
              {article.category} · {article.readTime}
            </span>
            <h2 style={{ margin: "6px 0 0", fontSize: "20px", color: "var(--plum)" }}>
              {article.title}
            </h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => actions.closeArticle()}
            aria-label="Close article"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--plum)", whiteSpace: "pre-line", marginBottom: "20px" }}>
          {article.body}
        </div>

        <div className="card tint-mint" style={{ padding: "12px", fontSize: "12px", color: "var(--tint-mint-text)" }}>
          <b>Clinical Source:</b> {article.source}
        </div>
      </div>
    </div>
  );
}
