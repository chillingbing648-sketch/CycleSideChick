/**
 * CycleSideChick — Central Reactive Store
 * Built around useSyncExternalStore (zero Redux/Zustand overhead).
 * Provides atomic reactive subscriptions for S, ui, and dr.
 */

import { useSyncExternalStore } from "react";
import { loadState, saveState, PinLock } from "../core/storage.js";
import { TD, I } from "../core/engine.js";
import { triggerHaptic } from "../lib/haptics.js";

// Initialize persistent state
const loaded = loadState();
export const S = loaded.state;

// Initialize ephemeral UI state
export const ui = {
  tab: "home",
  sidebarOpen: false,
  waterModalOpen: false,
  lastWaterLoggedAmount: 0,
  periodModalOpen: false,
  periodModalDate: null,
  profTab: "health",
  corrupt: loaded.corrupt,
  pinLocked: PinLock.isEnabled(),
  prof: 0,
  careTab: "careComfort",
  careReassuranceIdx: 0,
  careKitFilter: "all",
  careCustomModal: false,
  careCustomIcon: "flame",
  activeArticle: null,
  partnerModal: false,
  clinicianModal: false,
  conflict: null,
  infoTopic: null,
  tourModal: false,
  tourTab: 0,
  deleteJournalConfirm: null,
  journalDate: I(TD()),
  cYear: new Date().getFullYear(),
  cMonth: new Date().getMonth(),
  selDay: I(TD()),
  obStep: 0,
  pinInput: "",
  pinError: false,
  toasts: []
};

// Draft log for active editing
export const dr = {
  d: I(TD()),
  f: "",
  m: null,
  p: null,
  en: "",
  sl: null,
  sq: "",
  water: 0,
  cm: "",
  med: [],
  emotions: [],
  bbt: "",
  lh: "",
  sy: {},
  note: ""
};

export function loadDraft(dateStr) {
  const L = (S.logs && S.logs[dateStr]) || {};
  dr.d = dateStr;
  dr.f = L.f ?? "";
  dr.m = L.m ?? null;
  dr.p = L.p ?? null;
  dr.en = L.en || "";
  dr.sl = L.sl ?? null;
  dr.sq = L.sq || "";
  dr.water = L.water || 0;
  dr.cm = L.cm || "";
  dr.med = Array.isArray(L.med) ? [...L.med] : (L.med ? [L.med] : []);
  dr.emotions = Array.isArray(L.emotions) ? [...L.emotions] : [];
  dr.bbt = L.bbt || "";
  dr.lh = L.lh || "";
  dr.sy = { ...(L.sy || {}) };
  dr.note = L.note || L.n || "";
}

// Initial draft load
loadDraft(I(TD()));

// Listeners and notification system
const listeners = new Set();
let version = 0;

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notify() {
  version++;
  listeners.forEach(fn => fn());
}

export function getSnapshot() {
  return version;
}

export function useStore(selector = s => s) {
  useSyncExternalStore(subscribe, getSnapshot);
  return selector({ S, ui, dr });
}

export function persistState() {
  saveState(S);
  notify();
}

export function toast(message, duration = 2800) {
  const id = Date.now() + Math.random().toString(36).slice(2, 6);
  ui.toasts = [...ui.toasts, { id, message }];
  notify();

  setTimeout(() => {
    ui.toasts = ui.toasts.filter(t => t.id !== id);
    notify();
  }, duration);
}

export function haptic(pattern = 15) {
  if (S && S.haptics === 0) return;
  triggerHaptic(pattern);
}

export function applyThemeToDOM() {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  const systemDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = S.theme === "dark" || (S.theme !== "light" && systemDark);

  if (S.theme === "dark") {
    r.dataset.theme = "dark";
  } else if (S.theme === "light") {
    r.dataset.theme = "light";
  } else {
    // System preference mode
    if (systemDark) r.dataset.theme = "dark";
    else r.removeAttribute("data-theme");
  }

  if (S.motion === 0) r.dataset.motion = "reduced";
  else r.removeAttribute("data-motion");

  const meta = document.querySelector("#meta-theme");
  if (meta) meta.content = isDark ? "#1B1620" : "#FAF5F7";
}
