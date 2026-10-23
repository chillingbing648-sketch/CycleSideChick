/**
 * CycleSideChick — Care View Component
 * Houses 3 sub-tabs:
 * 1. Care Kit & Comfort (Features Gentle Self-Care Checklist & Personal Care Kit)
 * 2. Private Journal (Features Mood Check-In & Journal Section)
 * 3. Evidence-based Cycle Guide & Educational Library
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SegmentedControl } from "../../components/ui/SegmentedControl.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { SelfCareChecklist } from "../../components/care/SelfCareChecklist.jsx";
import { MoodJournalSection } from "../../components/journal/MoodJournalSection.jsx";
import { CompanionCard } from "../companion/CompanionCard.jsx";
import { ARTICLES, getReassuranceMessage, getCareSuggestions } from "../../core/content.js";

export function CareView() {
  const { S, ui } = useStore();
  const subTab = ui.careTab || "careComfort";

  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const reassurance = getReassuranceMessage(ui.careReassuranceIdx || 0);
  const careSuggestions = getCareSuggestions(S);

  const careKit = S.careKit || [];
  const careKitFiltered = ui.careKitFilter === "fav" ? careKit.filter((k) => k.isFav) : careKit;

  const filteredArticles = ARTICLES.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === "all" ||
      a.category.toLowerCase().includes(selectedTag) ||
      a.tags.some((t) => t.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="care-view" style={{ paddingBottom: "110px" }}>
      {/* 1. Sub-Tab Header using SegmentedControl */}
      <div style={{ marginBottom: "16px" }}>
        <SegmentedControl
          value={subTab}
          onChange={(val) => actions.setCareTab(val)}
          ariaLabel="Care Subtabs"
          items={[
            { id: "careComfort", label: "Care Kit", icon: "care" },
            { id: "journal", label: "Private Journal", icon: "book" },
            { id: "guide", label: "Cycle Guide", icon: "star" }
          ]}
        />
      </div>

      {/* 2. TAB: Care Kit & Comfort */}
      {subTab === "careComfort" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Compassionate Reassurance Card */}
          <Card variant="tinted" tint="rose" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="heart" size={18} />
                <b style={{ fontSize: "14px" }}>Comfort & Permission</b>
              </div>
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => actions.nextReassurance()}
                aria-label="Rotate comforting thought"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <Icon name="refresh" size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5", color: "var(--plum)" }}>
              "{reassurance}"
            </p>
          </Card>

          {/* Cycle Care Companion Integration */}
          <CompanionCard />

          {/* Component 04: Gentle Self-Care Checklist */}
          <SelfCareChecklist S={S} />

          {/* Phase-Tailored Care Suggestions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Phase Suggestions</h3>
              <span className="subtle" style={{ fontSize: "12px" }}>Non-prescriptive guidance</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
              {careSuggestions && careSuggestions.length > 0 ? (
                careSuggestions.map((sug, i) => (
                  <Card key={i} variant="base" style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <b style={{ fontSize: "14px" }}>{sug.title}</b>
                      <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
                        {sug.category}
                      </span>
                    </div>
                    <p className="mut" style={{ margin: "0 0 10px", fontSize: "13px", lineHeight: "1.45" }}>
                      {sug.desc}
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => actions.addCareKitItem(sug.title, sug.category)}>
                      Add to Care Kit
                    </Button>
                  </Card>
                ))
              ) : (
                <p className="mut" style={{ fontSize: "13px" }}>No specific phase suggestions right now.</p>
              )}
            </div>
          </div>

          {/* Personal Care Kit Items */}
          <div className="v-care-kit-section">
            <div className="v-care-kit-header">
              <h3 className="v-care-kit-title">My Personal Care Kit</h3>
              <div className="v-care-kit-filters" role="group" aria-label="Care Kit Filters">
                <button
                  type="button"
                  className={`v-care-filter-pill ${ui.careKitFilter === "all" ? "active" : ""}`}
                  onClick={() => actions.setCareKitFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`v-care-filter-pill ${ui.careKitFilter === "fav" ? "active" : ""}`}
                  onClick={() => actions.setCareKitFilter("fav")}
                >
                  Favorites
                </button>
                <button
                  type="button"
                  className="v-care-filter-pill v-care-filter-pill--action"
                  onClick={() => actions.openCustomCareModal()}
                >
                  <Icon name="plus" size={13} />
                  Custom
                </button>
              </div>
            </div>

            <div className="v-care-kit-grid">
              {careKitFiltered.map((item) => (
                <Card key={item.id} variant={item.isFav ? "raised" : "base"} className="v-care-kit-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <b style={{ fontSize: "13.5px", color: "var(--text)" }}>{item.title}</b>
                    <button
                      type="button"
                      onClick={() => actions.toggleCareKitFav(item.id)}
                      aria-label={item.isFav ? "Unfavorite item" : "Favorite item"}
                      style={{ background: "none", border: "none", cursor: "pointer", color: item.isFav ? "var(--primary)" : "var(--text-muted)", padding: "2px" }}
                    >
                      <Icon name="star" size={16} />
                    </button>
                  </div>
                  <span className="subtle" style={{ fontSize: "11px", marginTop: "3px", display: "block" }}>
                    {item.category || "Comfort Item"}
                  </span>
                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => actions.removeCareKitItem(item.id)}
                      aria-label="Remove item"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Component 05 Mood Check-In & Journal */}
      {subTab === "journal" && (
        <MoodJournalSection S={S} ui={ui} />
      )}

      {/* 4. TAB: Evidence-Based Cycle Guide */}
      {subTab === "guide" && (
        <div>
          {/* Search & Tag Filter */}
          <div style={{ marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Search 22 evidence-based reproductive health articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border)", fontSize: "13.5px", background: "var(--surface)" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px", marginBottom: "12px", scrollbarWidth: "none" }}>
            {["all", "cycle", "fertility", "hormones", "nutrition", "pain"].map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${selectedTag === t ? "active" : ""}`}
                onClick={() => setSelectedTag(t)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "100px",
                  border: selectedTag === t ? "1.5px solid var(--berry)" : "1px solid var(--border)",
                  background: selectedTag === t ? "var(--pink-light)" : "var(--surface)",
                  color: selectedTag === t ? "var(--berry)" : "inherit",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredArticles.map((art) => (
              <Card
                key={art.id}
                variant="base"
                interactive
                style={{ padding: "16px" }}
                onClick={() => actions.openArticle(art.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <b style={{ fontSize: "15px", color: "var(--plum)" }}>{art.title}</b>
                  <span className="pill-tag" style={{ background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: "11px" }}>
                    {art.readTime || "3 min"}
                  </span>
                </div>
                <p className="mut" style={{ margin: "4px 0 8px", fontSize: "13px", lineHeight: "1.45" }}>
                  {art.summary}
                </p>
                <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>
                  Source: {art.source || "ACOG Clinical Guidelines"}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
