/**
 * CycleSideChick — Component 10: Gentle Reminder Card (Dashboard)
 * 
 * Features:
 * - Dismissible reminders for estimated upcoming periods, daily check-ins, or hydration.
 * - Respects user preferences, permissions, and dismissal state (stored on-device).
 * - Never claims browser notifications are active unless properly permitted.
 * - Non-urgent, compassionate tone with quick actions.
 */

import React, { useState } from "react";
import { actions } from "../../app/actions.js";
import { Icon } from "../ui/Icon.jsx";
import { Button } from "../ui/Button.jsx";
import { TD, I, fmt } from "../../core/engine.js";

export function GentleReminderCard({ stats = {}, S = {}, todayDn = TD(), todayLog = {} }) {
  const [dismissedLocal, setDismissedLocal] = useState({});
  const dismissedStore = S.dismissedReminders || {};
  const isDismissed = (key) => {
    if (dismissedLocal[key]) return true;
    const ts = dismissedStore[key];
    if (!ts) return false;
    // Dismissal lasts for 18 hours
    return Date.now() - ts < 18 * 60 * 60 * 1000;
  };

  const handleDismiss = (key) => {
    setDismissedLocal(prev => ({ ...prev, [key]: true }));
    actions.dismissReminder(key);
  };

  // 1. Check for upcoming period reminder (1–3 days ahead)
  let reminder = null;
  const daysUntilNext = stats.nextPred ? stats.nextPred - todayDn : null;
  const isPeriodUpcoming = daysUntilNext !== null && daysUntilNext >= 1 && daysUntilNext <= 3;

  if (isPeriodUpcoming && !isDismissed("upcoming-period")) {
    reminder = {
      key: "upcoming-period",
      title: "Estimated Period Approaching",
      text: `Your next cycle is estimated in ~${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"} (~${fmt(stats.nextPred, { month: "short", day: "numeric" })}). Keep your preferred comfort items and warm layers close.`,
      icon: "droplet",
      badge: "Cycle Alert",
      tintClass: "v-reminder-card--rose",
      actionLabel: "View Calendar",
      onAction: () => actions.setTab("calendar")
    };
  } else if (!isDismissed("daily-checkin") && !todayLog.m && (!todayLog.sy || Object.keys(todayLog.sy).length === 0) && !todayLog.f) {
    // 2. Daily Check-in reminder if no logs yet today
    reminder = {
      key: "daily-checkin",
      title: "Gentle Body Check-In",
      text: "Take a quiet moment for yourself. How are your physical sensations, emotional currents, or energy levels feeling today?",
      icon: "heart",
      badge: "Self-Care",
      tintClass: "v-reminder-card--lavender",
      actionLabel: "Log Today",
      onAction: () => actions.goLog(I(todayDn))
    };
  } else if (!isDismissed("hydration-reminder") && S.waterGoal !== 0 && (todayLog.water || 0) < 4) {
    // 3. Hydration reminder
    const cups = todayLog.water || 0;
    reminder = {
      key: "hydration-reminder",
      title: "Mindful Hydration",
      text: `You've logged ${cups} of 8 glasses of water today. A warm cup of herbal tea or tall glass of water can ease tension.`,
      icon: "tea",
      badge: "Wellness",
      tintClass: "v-reminder-card--peach",
      actionLabel: "Log +1 Cup",
      onAction: () => actions.quickSetWater(cups + 1)
    };
  }

  if (!reminder) return null;

  return (
    <div className={`v-reminder-card ${reminder.tintClass}`} role="region" aria-label={reminder.title}>
      <div className="v-reminder-header">
        <div className="v-reminder-title-wrap">
          <div className="v-reminder-icon-box">
            <Icon name={reminder.icon} size={16} />
          </div>
          <div>
            <span className="v-reminder-badge">{reminder.badge}</span>
            <h3 className="v-reminder-title">{reminder.title}</h3>
          </div>
        </div>

        <button
          type="button"
          className="v-reminder-dismiss-btn"
          onClick={() => handleDismiss(reminder.key)}
          aria-label={`Dismiss ${reminder.title} reminder`}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <p className="v-reminder-text">{reminder.text}</p>

      <div className="v-reminder-footer">
        <span className="v-reminder-privacy-note">
          <Icon name="shield" size={11} />
          <span>In-app companion note</span>
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={reminder.onAction}
          style={{ minHeight: "32px", padding: "4px 14px", fontSize: "12.5px" }}
        >
          {reminder.actionLabel}
        </Button>
      </div>
    </div>
  );
}
