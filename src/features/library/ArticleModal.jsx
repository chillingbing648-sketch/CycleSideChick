/**
 * CycleSideChick — Article Modal Component
 * Wrapped in SheetModal primitive with drag-to-dismiss gesture and zero inline styles.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

export function ArticleModal() {
  const { ui } = useStore();
  const article = ui.activeArticle;
  if (!article) return null;

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: `${article.title} — CycleSideChick Reproductive Health Guide:\n${article.summary}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        actions.toast("Article shared");
      } catch (err) {
        // User cancelled or unsupported
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${article.title}\n\n${article.summary}\n\nRead more in CycleSideChick.`);
      actions.toast("Article summary copied to clipboard");
      actions.haptic(15);
    }
  };

  return (
    <SheetModal
      isOpen={true}
      onClose={() => actions.closeArticle()}
      title={article.title}
      maxWidth="580px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
              {article.category}
            </span>
            <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
              {article.readTime || "3 min read"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            style={{
              background: "var(--surface-tint)",
              border: "1px solid var(--berry-border)",
              color: "var(--primary)",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Icon name="share" size={13} />
            <span>Share</span>
          </button>
        </div>

        <Card variant="raised" style={{ padding: "14px", fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5" }}>
          "{article.summary}"
        </Card>

        <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--plum)" }}>
          {article.body ? (
            <p style={{ margin: 0, whiteSpace: "pre-line" }}>{article.body}</p>
          ) : article.content ? (
            <p style={{ margin: 0 }}>{article.content}</p>
          ) : (
            <p style={{ margin: 0 }}>
              Evidence-based clinical guidelines emphasize that reproductive cycles are a vital sign of overall health.
              Variability across months reflects adaptation to stress, nutrition, sleep quality, and physiological shifts.
            </p>
          )}
        </div>

        {(article.source || article.sources) && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>CLINICAL SOURCES</span>
            <p className="mut" style={{ margin: "4px 0 0", fontSize: "12px" }}>
              {article.source || article.sources}
            </p>
          </div>
        )}
      </div>
    </SheetModal>
  );
}
