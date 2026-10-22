/**
 * CycleSideChick — Article Modal Component
 * Wrapped in SheetModal primitive with drag-to-dismiss gesture and zero inline styles.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";

export function ArticleModal() {
  const { ui } = useStore();
  const article = ui.activeArticle;
  if (!article) return null;

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeArticle()}
      title={article.title}
      maxWidth="580px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
            {article.category}
          </span>
          <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
            {article.readTime || "3 min read"}
          </span>
        </div>

        <Card variant="raised" style={{ padding: "14px", fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5" }}>
          "{article.summary}"
        </Card>

        <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--plum)" }}>
          {article.content ? (
            <p style={{ margin: 0 }}>{article.content}</p>
          ) : (
            <p style={{ margin: 0 }}>
              Evidence-based clinical guidelines emphasize that reproductive cycles are a vital sign of overall health.
              Variability across months reflects adaptation to stress, nutrition, sleep quality, and physiological shifts.
            </p>
          )}
        </div>

        {article.sources && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>CLINICAL SOURCES</span>
            <p className="mut" style={{ margin: "4px 0 0", fontSize: "12px" }}>
              {article.sources}
            </p>
          </div>
        )}
      </div>
    </SheetModal>
  );
}
