/**
 * CycleSideChick — Formatting Utilities
 */

import { fmt, TD, N } from "../core/engine.js";

export function formatCycleDay(dayNum) {
  if (!dayNum || dayNum < 1) return "Day —";
  return `Day ${dayNum}`;
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  const diff = N(dateStr) - TD();
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return fmt(dateStr);
}

export function formatPainLevel(level) {
  if (level === null || level === undefined || level === "") return "Not logged";
  const num = Number(level);
  if (num === 0) return "0/10 · No pain";
  if (num <= 3) return `${num}/10 · Mild`;
  if (num <= 6) return `${num}/10 · Moderate`;
  if (num <= 8) return `${num}/10 · Severe`;
  return `${num}/10 · Very severe`;
}

export function formatFlowName(flowVal) {
  const map = {
    0: "None",
    1: "Spotting",
    2: "Light",
    3: "Medium",
    4: "Heavy"
  };
  return map[flowVal] || "None";
}
