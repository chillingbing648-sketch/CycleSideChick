/**
 * CycleSideChick — Component 05: Mood Check-In & Journal (Journal Section)
 * 
 * Features:
 * - Expandable mood selector with rich emotion descriptors.
 * - Private journal editor with prompt suggestions, word count, and save feedback.
 * - Previous-entry access, mood filtering, search, and editing.
 * - Strict on-device privacy guarantee (zero external network requests).
 * - Local backup export (JSON / CSV).
 */

import React, { useState, useEffect } from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "../ui/Icon.jsx";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";

export function MoodJournalSection({ S = {}, ui = {} }) {
  const todayStr = I(TD());
  const activeDate = ui.journalDate || todayStr;
  const activeDn = N(activeDate);

  const currentEntry = (S.journal && S.journal[activeDate]) || { text: "", tags: [], mood: null };
  const [text, setText] = useState(currentEntry.text || "");
  const [isMoodExpanded, setIsMoodExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState("all");
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    setText(currentEntry.text || "");
  }, [activeDate, currentEntry.text]);

  const MOOD_OPTIONS = [
    { id: "peaceful", label: "Peaceful", icon: "moodCalm", desc: "Settled and at ease" },
    { id: "joyful", label: "Joyful", icon: "moodHappy", desc: "Lighthearted and radiant" },
    { id: "reflective", label: "Reflective", icon: "moodNeutral", desc: "Thoughtful and introspective" },
    { id: "grounded", label: "Grounded", icon: "flower", desc: "Centered in your body" },
    { id: "sensitive", label: "Sensitive", icon: "heart", desc: "Tender and receptive" },
    { id: "vulnerable", label: "Vulnerable", icon: "moodAnxious", desc: "Needing soft boundaries" },
    { id: "heavy", label: "Heavy", icon: "moodLow", desc: "Tired or low energy" },
    { id: "overwhelmed", label: "Overwhelmed", icon: "moodIrritable", desc: "Mental overstimulation" }
  ];

  const PROMPT_SUGGESTIONS = [
    "What sensation or emotion is asking for kindness today?",
    "One thing my body did for me today that I appreciate:",
    "Permission slip: today I release the expectation to...",
    "What boundary would protect my energy over the next 48 hours?",
    "Where in my body am I holding tension, and what would ease it?"
  ];

  const [promptIdx, setPromptIdx] = useState(0);
  const currentPrompt = PROMPT_SUGGESTIONS[promptIdx];

  const handleNextPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
  };

  const handleInsertPrompt = () => {
    const newText = text ? `${text}\n\n${currentPrompt}\n` : `${currentPrompt}\n`;
    setText(newText);
  };

  const handleMoodSelect = (moodId) => {
    actions.setJournalMood(currentEntry.mood === moodId ? null : moodId);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    actions.saveJournalEntry(text);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2200);
  };

  // Word & Char Count
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;

  // Filtered past entries
  const allEntries = S.journal ? Object.entries(S.journal) : [];
  const filteredEntries = allEntries
    .filter(([dateStr, entry]) => {
      if (!entry.text && !entry.mood) return false;
      const matchesSearch =
        !searchQuery ||
        (entry.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.mood || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMood = filterMood === "all" || entry.mood === filterMood;
      return matchesSearch && matchesMood;
    })
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="v-journal-section-wrap">
      {/* 1. Date Switcher Header */}
      <Card variant="base" className="v-journal-editor-card">
        <div className="v-journal-card-header">
          <div className="v-journal-heading-group">
            <span className="v-journal-subtle-label">PRIVATE REFLECTION</span>
            <h2 className="v-journal-date-title">
              {fmt(activeDn, { weekday: "long", month: "short", day: "numeric" })}
            </h2>
          </div>

          <div className="v-journal-date-controls">
            <input
              type="date"
              value={activeDate}
              max={todayStr}
              onChange={(e) => actions.setJournalDate(e.target.value)}
              className="v-journal-date-input"
              aria-label="Select reflection date"
            />
            {activeDate !== todayStr && (
              <button
                type="button"
                className="v-journal-today-btn"
                onClick={() => actions.jumpJournalToday()}
                title="Jump to Today"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* 2. Expandable Mood Selector */}
        <div className="v-journal-mood-container">
          <div
            className="v-journal-mood-toggle-row"
            onClick={() => setIsMoodExpanded(!isMoodExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsMoodExpanded(!isMoodExpanded);
              }
            }}
            aria-expanded={isMoodExpanded}
          >
            <div className="v-journal-mood-toggle-info">
              <div className="v-journal-mood-dot">
                <Icon name={currentEntry.mood ? "heart" : "sparkle"} size={14} />
              </div>
              <span className="v-journal-mood-current">
                {currentEntry.mood ? (
                  <>Current Mood: <b>{currentEntry.mood.toUpperCase()}</b></>
                ) : (
                  "How are you feeling emotionally?"
                )}
              </span>
            </div>

            <span className="v-journal-mood-chevron" aria-hidden="true">
              <Icon name={isMoodExpanded ? "chevronUp" : "chevronDown"} size={16} />
            </span>
          </div>

          {/* Smoothly Expanded Mood Grid */}
          {isMoodExpanded && (
            <div className="v-journal-mood-grid" role="group" aria-label="Mood Selector">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = currentEntry.mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`v-journal-mood-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleMoodSelect(m.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="v-chip-icon">
                      <Icon name={m.icon} size={18} />
                    </div>
                    <div style={{ textAlign: "left", minWidth: 0 }}>
                      <b className="v-mood-title">{m.label}</b>
                      <span className="v-mood-desc">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Cycle Prompt Inspiration */}
        <div className="v-journal-prompt-box">
          <div className="v-prompt-header">
            <span className="v-prompt-badge">
              <Icon name="sparkle" size={12} />
              Cycle Inspiration Prompt
            </span>
            <div className="v-prompt-actions">
              <button
                type="button"
                className="v-prompt-tool-btn"
                onClick={handleInsertPrompt}
                title="Insert prompt into note"
              >
                <Icon name="plus" size={12} />
                Insert
              </button>
              <button
                type="button"
                className="v-prompt-tool-btn v-prompt-tool-btn--icon"
                onClick={handleNextPrompt}
                title="Rotate prompt"
                aria-label="Rotate prompt"
              >
                <Icon name="refresh" size={13} />
              </button>
            </div>
          </div>
          <p className="v-prompt-text">"{currentPrompt}"</p>
        </div>

        {/* 4. Textarea Editor */}
        <textarea
          rows={5}
          className="v-journal-textarea"
          placeholder="Reflect freely on sensations, emotional currents, or personal boundaries... Saved strictly on this device."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 5. Editor Footer with Word Count & Save Button */}
        <div className="v-journal-editor-footer">
          <div className="v-journal-stats">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{charCount} characters</span>
            {isSavedFeedback && (
              <span className="v-saved-feedback">
                <Icon name="check" size={12} /> Saved locally
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {currentEntry.text && (
              <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={() => actions.promptDeleteJournal(activeDate)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={isSavedFeedback ? "check" : "edit"}
              onClick={handleSave}
            >
              {isSavedFeedback ? "Saved" : "Save Entry"}
            </Button>
          </div>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="v-journal-privacy-banner">
          <Icon name="shield" size={14} />
          <span>Private & On-Device · Never transmitted to external servers</span>
        </div>
      </Card>

      {/* 6. Past Journal Timeline with Search & Filter */}
      <div className="v-journal-history-section">
        <div className="v-journal-history-header">
          <div>
            <h3 className="v-history-heading">Previous Reflections</h3>
            <span className="v-history-sub">{filteredEntries.length} saved entries</span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <Button
              variant="secondary"
              size="sm"
              icon="download"
              onClick={() => actions.exportJournal("json")}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Search & Mood Filter Pills */}
        <div className="v-journal-filter-bar">
          <input
            type="text"
            placeholder="Search reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-journal-search-input"
          />

          <div className="v-journal-mood-pills">
            {["all", "peaceful", "joyful", "reflective", "grounded", "sensitive", "heavy"].map((m) => (
              <button
                key={m}
                type="button"
                className={`v-filter-pill ${filterMood === m ? "active" : ""}`}
                onClick={() => setFilterMood(m)}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="v-journal-entries-list">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(([dateKey, entry]) => (
              <Card
                key={dateKey}
                variant="base"
                className="v-journal-past-card"
                onClick={() => {
                  actions.setJournalDate(dateKey);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="v-past-card-header">
                  <b className="v-past-card-date">
                    {fmt(N(dateKey), { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </b>
                  {entry.mood && (
                    <span className="v-past-card-mood-pill">
                      {entry.mood}
                    </span>
                  )}
                </div>

                <p className="v-past-card-snippet">
                  {entry.text || "(No written text, mood logged)"}
                </p>

                <div className="v-past-card-footer">
                  <span className="v-past-card-edit-hint">Tap to review or edit</span>
                  <button
                    type="button"
                    className="v-past-card-delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.promptDeleteJournal(dateKey);
                    }}
                    title="Delete entry"
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="v-journal-empty-box">
              <Icon name="book" size={24} />
              <p>No journal entries match your search or filter. Start writing above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
