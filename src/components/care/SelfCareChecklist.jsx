/**
 * CycleSideChick — Component 04: Gentle Self-Care Checklist (Wellness Section)
 * 
 * Features:
 * - Soft task cards for rest, hydration, gentle stretching, nourishment, and personal sanctuary.
 * - Satisfying completion animations with micro-interactions.
 * - Compassionate progress updates without guilt-inducing messaging.
 * - Allows adding optional custom care items.
 * - Persisted in S.careChecklist.
 */

import React, { useState } from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "../ui/Icon.jsx";
import { Button } from "../ui/Button.jsx";
import { TD, I } from "../../core/engine.js";

export function SelfCareChecklist({ S = {} }) {
  const todayStr = I(TD());
  const [customTaskInput, setCustomTaskInput] = useState("");
  const checklistData = (S.careChecklist && S.careChecklist[todayStr]) || {};

  const DEFAULT_TASKS = [
    {
      id: "rest",
      title: "15-minute horizontal rest or phone-free pause",
      desc: "Give your nervous system permission to decelerate without expectation.",
      icon: "moon",
      category: "Rest"
    },
    {
      id: "hydration",
      title: "Sip warm water or soothing herbal tea",
      desc: "Gentle hydration supports blood volume and eases muscular tension.",
      icon: "tea",
      category: "Hydration"
    },
    {
      id: "stretch",
      title: "Gentle pelvic release or slow spinal stretch",
      desc: "A soft cat-cow or child's pose to release sacral and pelvic floor strain.",
      icon: "stretch",
      category: "Movement"
    },
    {
      id: "nourish",
      title: "Warm, grounding, or magnesium-rich snack",
      desc: "Nourish cellular repair with warm soup, dark cacao, or roasted seeds.",
      icon: "cravings",
      category: "Nourishment"
    },
    {
      id: "boundary",
      title: "Protect your peace — release an optional demand",
      desc: "Saying no to non-essential obligations is an act of bodily self-care.",
      icon: "heart",
      category: "Sanctuary"
    }
  ];

  const customTasks = (S.customCareTasks || []).map((t) => ({
    id: t.id,
    title: t.title,
    desc: "Personal care moment.",
    icon: t.icon || "sparkle",
    category: "Personal"
  }));

  const allTasks = [...DEFAULT_TASKS, ...customTasks];
  const completedCount = allTasks.filter((t) => checklistData[t.id]).length;
  const totalCount = allTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Compassionate non-guilt message
  let compassionMessage = "Take only what serves you today. Nothing here is mandatory.";
  if (completedCount === 1) {
    compassionMessage = "A mindful pause taken for your body. Remember: doing nothing is also valid care.";
  } else if (completedCount >= 2 && completedCount < totalCount) {
    compassionMessage = "Honoring your body's rhythm with gentle tenderness.";
  } else if (completedCount === totalCount) {
    compassionMessage = "You offered yourself abundant kindness today. Rest well.";
  }

  const handleToggle = (taskId) => {
    actions.toggleCareChecklistTask(todayStr, taskId);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customTaskInput.trim()) {
      actions.addCustomCareChecklistTask(customTaskInput.trim());
      setCustomTaskInput("");
    }
  };

  return (
    <div className="v-care-checklist-card">
      <div className="v-checklist-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="v-checklist-icon-wrap">
            <Icon name="flower" size={17} />
          </div>
          <div>
            <h3 className="v-checklist-title">Gentle Self-Care Invitations</h3>
            <span className="v-checklist-subtitle">Daily restorative moments</span>
          </div>
        </div>

        <span className="v-checklist-counter-badge">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Progress Bar & Compassion Message */}
      <div className="v-checklist-progress-wrap">
        <div className="v-checklist-progress-bar">
          <div
            className="v-checklist-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="v-checklist-compassion-note">{compassionMessage}</p>
      </div>

      {/* Task Cards List */}
      <div className="v-checklist-tasks-list" role="list">
        {allTasks.map((task) => {
          const isDone = Boolean(checklistData[task.id]);
          return (
            <div
              key={task.id}
              role="listitem"
              className={`v-task-card ${isDone ? "completed" : ""}`}
              onClick={() => handleToggle(task.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(task.id);
                }
              }}
              aria-checked={isDone}
            >
              {/* Animated Custom Checkbox */}
              <div className={`v-task-checkbox ${isDone ? "checked" : ""}`} aria-hidden="true">
                {isDone ? (
                  <Icon name="check" size={12} />
                ) : (
                  <span className="v-checkbox-hollow" />
                )}
              </div>

              {/* Task Content */}
              <div className="v-task-body">
                <div className="v-task-title-row">
                  <span className="v-task-title">{task.title}</span>
                  <span className="v-task-tag">{task.category}</span>
                </div>
                <p className="v-task-desc">{task.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Care Task Form */}
      <form onSubmit={handleAddCustom} className="v-checklist-add-form">
        <input
          type="text"
          placeholder="Add a custom gentle care moment..."
          value={customTaskInput}
          onChange={(e) => setCustomTaskInput(e.target.value)}
          className="v-checklist-add-input"
        />
        <Button variant="secondary" size="sm" type="submit">
          Add
        </Button>
      </form>
    </div>
  );
}
