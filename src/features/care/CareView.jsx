/**
 * CycleSideChick — Care View Component
 * Houses 3 sub-tabs: Care Kit & Comfort, Private Journal, and Evidence-based Guide.
 * Utilizes SegmentedControl, Card, ToggleChip, Button primitives.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SegmentedControl } from "../../components/ui/SegmentedControl.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";
import { ARTICLES, getReassuranceMessage, getCareSuggestions } from "../../core/content.js";

export function CareView() {
  const { S, ui } = useStore();
  const subTab = ui.careTab || "careComfort";

  const [journalInput, setJournalInput] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = I(TD());
  const activeJournalDate = ui.journalDate || todayStr;
  const currentJournalEntry = (S.journal && S.journal[activeJournalDate]) || { text: "", tags: [], mood: null };

  const reassurance = getReassuranceMessage(ui.careReassuranceIdx || 0);
  const careSuggestions = getCareSuggestions(S);

  const careKit = S.careKit || [];
  const careKitFiltered = ui.careKitFilter === "fav" ? careKit.filter(k => k.isFav) : careKit;

  const JOURNAL_MOODS = ["calm", "reflective", "vulnerable", "grounded", "heavy"];
  const JOURNAL_PROMPTS = [
    "What sensation or emotion is asking for kindness today?",
    "One thing my body did for me today that I appreciate:",
    "Permission slip: today I release the expectation to..."
  ];

  const handleSaveJournal = e => {
    e.preventDefault();
    actions.saveJournalEntry(journalInput || currentJournalEntry.text);
    setJournalInput("");
  };

  const filteredArticles = ARTICLES.filter(a => {
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || a.category.toLowerCase().includes(selectedTag) || a.tags.some(t => t.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="care-view" style={{ paddingBottom: "40px" }}>
      {/* 1. Sub-Tab Header using SegmentedControl */}
      <div style={{ marginBottom: "16px" }}>
        <SegmentedControl
          value={subTab}
          onChange={val => actions.setCareTab(val)}
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
        <div>
          {/* Compassionate Reassurance Card */}
          <Card variant="tinted" tint="rose" style={{ padding: "16px", marginBottom: "16px" }}>
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

          {/* Phase-Tailored Care Suggestions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Phase Suggestions</h3>
            <span className="subtle" style={{ fontSize: "12px" }}>Non-prescriptive ideas</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
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
                    Add to My Care Kit
                  </Button>
                </Card>
              ))
            ) : (
              <p className="mut" style={{ fontSize: "13px" }}>No specific phase suggestions right now.</p>
            )}
          </div>

          {/* Personal Care Kit List */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>My Personal Care Kit</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              <Button
                variant={ui.careKitFilter === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => actions.setCareKitFilter("all")}
              >
                All
              </Button>
              <Button
                variant={ui.careKitFilter === "fav" ? "primary" : "secondary"}
                size="sm"
                onClick={() => actions.setCareKitFilter("fav")}
              >
                Favorites
              </Button>
              <Button variant="secondary" size="sm" icon="plus" onClick={() => actions.openCustomCareModal()}>
                Custom
              </Button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {careKitFiltered.map(item => (
              <Card key={item.id} variant={item.isFav ? "raised" : "base"} style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <b style={{ fontSize: "13.5px" }}>{item.title}</b>
                  <button
                    type="button"
                    onClick={() => actions.toggleCareKitFav(item.id)}
                    aria-label={item.isFav ? "Unfavorite item" : "Favorite item"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: item.isFav ? "var(--berry)" : "var(--text-muted)", padding: "2px" }}
                  >
                    <Icon name="star" size={16} />
                  </button>
                </div>
                <span className="subtle" style={{ fontSize: "11px", marginTop: "2px", display: "block" }}>
                  {item.category}
                </span>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
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
      )}

      {/* 3. TAB: Private Journal */}
      {subTab === "journal" && (
        <div>
          <Card variant="base" style={{ padding: "16px", marginBottom: "16px" }}>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>DATE</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "18px" }}>
                {fmt(N(activeJournalDate), { weekday: "short", month: "short", day: "numeric" })}
              </h3>
              <input
                type="date"
                value={activeJournalDate}
                max={I(TD())}
                onChange={e => actions.setJournalDate(e.target.value)}
                style={{ fontSize: "13px", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </div>

            {/* Prompt Inspirations */}
            <div style={{ marginBottom: "12px" }}>
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                INSPIRATION PROMPT
              </span>
              <p style={{ margin: 0, fontSize: "13px", fontStyle: "italic", color: "var(--plum)" }}>
                "{JOURNAL_PROMPTS[ui.journalPromptIdx || 0]}"
              </p>
            </div>

            {/* Mood selector for journal */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
              {JOURNAL_MOODS.map(m => (
                <ToggleChip
                  key={m}
                  label={m.charAt(0).toUpperCase() + m.slice(1)}
                  selected={currentJournalEntry.mood === m}
                  onClick={() => actions.setJournalMood(m)}
                />
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="Reflect privately on sensations, emotional currents, or personal boundaries..."
              value={journalInput !== "" ? journalInput : currentJournalEntry.text}
              onChange={e => setJournalInput(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", fontFamily: "var(--font-body)", resize: "vertical" }}
            />

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button variant="danger" size="sm" icon="trash" onClick={() => actions.confirmDeleteJournal(activeJournalDate)}>
                Delete Entry
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveJournal}>
                Save Reflection
              </Button>
            </div>
          </Card>

          {/* Past Journal Timeline Entries */}
          <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Past Reflections</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {S.journal && Object.keys(S.journal).length > 0 ? (
              Object.entries(S.journal)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([dt, entry]) => (
                  <Card key={dt} variant="base" style={{ padding: "14px", cursor: "pointer" }} onClick={() => actions.setJournalDate(dt)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <b style={{ fontSize: "14px" }}>{fmt(N(dt), { month: "short", day: "numeric", year: "numeric" })}</b>
                      {entry.mood && (
                        <span className="pill-tag" style={{ background: "var(--tint-lavender-bg)", color: "var(--tint-lavender-text)", fontSize: "11px" }}>
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.45", color: "var(--plum)" }}>
                      {entry.text}
                    </p>
                  </Card>
                ))
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: "13px" }}>No reflections saved yet. Start with today's prompt above.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB: Evidence-Based Cycle Guide & Assistant */}
      {subTab === "guide" && (
        <div>
          {/* Search & Tag Filter */}
          <div style={{ marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Search 22 evidence-based reproductive health articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "100px", border: "1px solid var(--border)", fontSize: "13.5px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px", marginBottom: "12px", scrollbarWidth: "none" }}>
            {["all", "cycle", "fertility", "hormones", "nutrition", "pain"].map(t => (
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
            {filteredArticles.map(art => (
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
                    {art.readTime || "3 min read"}
                  </span>
                </div>
                <p className="mut" style={{ margin: "4px 0 8px", fontSize: "13px", lineHeight: "1.45" }}>
                  {art.summary}
                </p>
                <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>
                  Category: {art.category}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
