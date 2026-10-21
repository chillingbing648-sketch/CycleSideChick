/**
 * CycleSideChick — Care View Component
 * Houses 3 sub-tabs: Comfort (Care Kit), Journal, and Guide (Library & Assistant).
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";
import { ARTICLES, getReassuranceMessage, getCareSuggestions } from "../../core/content.js";

export function CareView() {
  const { S, ui } = useStore();
  const subTab = ui.careTab || "careComfort";

  const [journalInput, setJournalInput] = useState("");
  const [assistantInput, setAssistantInput] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

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
  };

  const filteredArticles = selectedTag === "all"
    ? ARTICLES
    : ARTICLES.filter(a => a.category.toLowerCase().includes(selectedTag) || a.tags.some(t => t.includes(selectedTag)));

  return (
    <div className="care-view" style={{ paddingBottom: "32px" }}>
      {/* 1. Sub-Tab Header Switcher */}
      <div
        className="care-tabs-header"
        style={{
          display: "flex",
          background: "var(--surface-alt)",
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "16px"
        }}
      >
        {[
          ["careComfort", "Care Kit"],
          ["journal", "Private Journal"],
          ["guide", "Cycle Guide"]
        ].map(([key, label]) => {
          const isActive = subTab === key;
          return (
            <button
              key={key}
              type="button"
              className={`care-subtab-btn ${isActive ? "active" : ""}`}
              onClick={() => actions.setCareTab(key)}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: "8px",
                background: isActive ? "var(--surface-elevated)" : "transparent",
                color: isActive ? "var(--plum)" : "var(--muted)",
                fontWeight: isActive ? "700" : "500",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. TAB: Care Kit & Comfort */}
      {subTab === "careComfort" && (
        <div className="tab-pane">
          {/* Compassionate Reassurance */}
          <div className="card tint-rose" style={{ padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="heart" size={18} />
                <b style={{ fontSize: "14px" }}>Comfort & Permission</b>
              </div>
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => actions.nextReassurance()}
                aria-label="Refresh reassurance"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <Icon name="refresh" size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5" }}>
              "{reassurance}"
            </p>
          </div>

          {/* Targeted Care Suggestions */}
          {careSuggestions.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
                SUGGESTIONS FOR YOUR LOGGED STATE
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {careSuggestions.map(sug => (
                  <div key={sug.id} className="card" style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <b style={{ fontSize: "14px" }}>{sug.title}</b>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="icon-btn sm"
                          onClick={() => actions.saveCareSuggestion(sug.id)}
                          aria-label="Save suggestion"
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn sm"
                          onClick={() => actions.dismissCareSuggestion(sug.id)}
                          aria-label="Dismiss suggestion"
                        >
                          <Icon name="x" size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="mut" style={{ margin: "0 0 10px", fontSize: "13px", lineHeight: "1.4" }}>
                      {sug.desc}
                    </p>
                    <button
                      type="button"
                      className="btn g sm"
                      onClick={() => actions.addCareKitSuggestion(sug.id)}
                    >
                      + Add to My Care Kit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Care Kit Grid */}
          <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <b style={{ fontSize: "15px" }}>Personal Care Kit</b>
                <span className="subtle" style={{ fontSize: "12px", display: "block" }}>
                  Items and rituals that support you
                </span>
              </div>
              <button
                type="button"
                className="btn sm"
                onClick={() => actions.openCustomCareModal()}
              >
                + Add Custom
              </button>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
              <button
                type="button"
                className={`chip ${ui.careKitFilter !== "fav" ? "active" : ""}`}
                onClick={() => actions.setCareKitFilter("all")}
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                All Items ({careKit.length})
              </button>
              <button
                type="button"
                className={`chip ${ui.careKitFilter === "fav" ? "active" : ""}`}
                onClick={() => actions.setCareKitFilter("fav")}
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                Favorites ({careKit.filter(k => k.isFav).length})
              </button>
            </div>

            {/* Care Kit Tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {careKitFiltered.map(item => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: "12px",
                    background: item.isFav ? "var(--pink-light)" : "var(--surface)",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <Icon name={item.icon || "heart"} size={20} />
                    <button
                      type="button"
                      className="icon-btn sm"
                      onClick={() => actions.toggleCareKitFav(item.id)}
                      aria-label="Toggle favorite"
                      style={{ border: "none", background: "none", cursor: "pointer", color: item.isFav ? "var(--pink)" : "var(--muted)" }}
                    >
                      <Icon name="heart" size={16} />
                    </button>
                  </div>
                  <b style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>{item.title}</b>
                  {item.desc && <span className="mut" style={{ fontSize: "11.5px", lineHeight: "1.3", display: "block" }}>{item.desc}</span>}
                  {!item.isDefault && (
                    <button
                      type="button"
                      onClick={() => actions.deleteCustomCareItem(item.id)}
                      style={{ border: "none", background: "none", color: "var(--muted)", cursor: "pointer", padding: "4px 0", fontSize: "11px", marginTop: "6px" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Private Journal */}
      {subTab === "journal" && (
        <div className="tab-pane">
          {/* Date Header Stepper */}
          <div className="card" style={{ padding: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>JOURNAL ENTRY FOR</span>
                <h3 style={{ margin: "2px 0 0", fontSize: "17px" }}>{fmt(N(activeJournalDate))}</h3>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" className="btn g sm" onClick={() => actions.jumpJournalToday()}>Today</button>
                <button type="button" className="icon-btn sm" onClick={() => actions.stepJournalDate(-1)}><Icon name="arrowLeft" size={16} /></button>
                <button type="button" className="icon-btn sm" onClick={() => actions.stepJournalDate(1)}><Icon name="arrowRight" size={16} /></button>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div style={{ marginBottom: "14px" }}>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              REFLECTIVE PROMPTS
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {JOURNAL_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="card"
                  onClick={() => actions.insertJournalPrompt(p)}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    background: "var(--surface)",
                    border: "1px solid var(--border)"
                  }}
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Journal Editor */}
          <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
            <form onSubmit={handleSaveJournal}>
              <textarea
                rows={5}
                placeholder="Write freely. Your thoughts stay 100% private and on-device..."
                value={journalInput || currentJournalEntry.text || ""}
                onChange={e => setJournalInput(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "12px" }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mut" style={{ fontSize: "12px" }}>
                  {currentJournalEntry.updatedAt ? `Saved at ${new Date(currentJournalEntry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Unsaved"}
                </span>
                <button type="submit" className="btn sm">
                  Save Reflection
                </button>
              </div>
            </form>
          </div>

          {/* Journal History & Export */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <b style={{ fontSize: "14px" }}>Past Reflections</b>
              <button type="button" className="btn g sm" onClick={() => actions.exportJournal("json")}>
                <Icon name="download" size={14} />
                <span>Export Journal</span>
              </button>
            </div>

            {Object.keys(S.journal || {}).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.entries(S.journal).sort((a, b) => N(b[0]) - N(a[0])).map(([d, entry]) => (
                  <div
                    key={d}
                    className="card"
                    style={{ padding: "10px 12px", background: "var(--surface-alt)", cursor: "pointer" }}
                    onClick={() => actions.editJournalEntry(d)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <b style={{ fontSize: "13px" }}>{fmt(N(d))}</b>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          actions.promptDeleteJournal(d);
                        }}
                        style={{ border: "none", background: "none", color: "var(--muted)", cursor: "pointer" }}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--plum)", lineHeight: "1.4" }}>
                      {(entry.text || "").slice(0, 100)}{(entry.text || "").length > 100 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: "13px" }}>
                No past reflections saved yet. Start writing today!
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB: Cycle Guide & Library */}
      {subTab === "guide" && (
        <div className="tab-pane">
          {/* On-device Assistant Promo */}
          <div className="card tint-mint" style={{ padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="sparkle" size={18} />
              <b style={{ fontSize: "14px" }}>Ask the On-Device Health Guide</b>
            </div>
            <p className="mut" style={{ margin: "0 0 10px", fontSize: "12.5px" }}>
              100% private, rule-based clinical wellness guidance powered by ACOG & NHS guidelines.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                actions.submitAssistant(assistantInput);
              }}
              style={{ display: "flex", gap: "6px" }}
            >
              <input
                type="text"
                placeholder="Ask about cramps, fertile days, BBT..."
                value={assistantInput}
                onChange={e => setAssistantInput(e.target.value)}
                style={{ flex: 1, padding: "8px 10px", fontSize: "13px" }}
              />
              <button type="submit" className="btn sm">
                Ask
              </button>
            </form>
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {[
              ["all", "All Articles"],
              ["phases", "Phases"],
              ["hormones", "Hormones"],
              ["fertility", "Fertility"],
              ["nutrition", "Nutrition"]
            ].map(([id, label]) => {
              const isSelected = selectedTag === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`chip ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedTag(id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "100px",
                    border: isSelected ? "1.5px solid var(--pink)" : "1px solid var(--border)",
                    background: isSelected ? "var(--pink-light)" : "var(--surface)",
                    fontSize: "12.5px"
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Article List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredArticles.map(art => (
              <div
                key={art.id}
                className="card"
                style={{ padding: "14px", cursor: "pointer" }}
                onClick={() => actions.readArticle(art.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span className="pill-tag" style={{ background: "var(--surface-alt)", fontSize: "11px" }}>
                    {art.category}
                  </span>
                  <span className="subtle" style={{ fontSize: "11px" }}>{art.readTime}</span>
                </div>
                <b style={{ fontSize: "14.5px", display: "block", margin: "4px 0" }}>{art.title}</b>
                <p className="mut" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>
                  {art.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
