/**
 * CycleSideChick — Typed Actions Dispatcher (88 Actions)
 * Fully preserving side effects, storage persistence, haptics, and toasts.
 */

import { S, ui, dr, loadDraft, persistState, notify, toast, haptic, applyThemeToDOM } from "./store.js";
import { TD, I, N, okD, calculateStats, generateClinicianSummary } from "../core/engine.js";
import { generateCSV, generateJSON, PinLock, CycleStorage, defState } from "../core/storage.js";
import { ARTICLES } from "../core/content.js";
import { answerQuestion } from "../core/assistant.js";

export const actions = {
  // 1-13: Care Kit & Comfort
  setCareTab(tab) {
    ui.careTab = tab;
    haptic(10);
    notify();
  },

  careCheckin(feeling) {
    const today = I(TD());
    if (!S.careCheckin) S.careCheckin = {};
    S.careCheckin[today] = { feeling, time: Date.now() };
    persistState();
    haptic(15);
    toast(`Checked in: ${feeling.charAt(0).toUpperCase() + feeling.slice(1)}`);
  },

  nextReassurance() {
    ui.careReassuranceIdx = (ui.careReassuranceIdx || 0) + 1;
    haptic(10);
    notify();
  },

  saveCareSuggestion(id) {
    if (!S.careSaved) S.careSaved = {};
    if (S.careSaved[id]) {
      delete S.careSaved[id];
      toast("Suggestion unsaved");
    } else {
      S.careSaved[id] = 1;
      toast("Saved to your favorites");
    }
    persistState();
    haptic(15);
  },

  dismissCareSuggestion(id) {
    if (!S.careDismissed) S.careDismissed = {};
    S.careDismissed[id] = 1;
    persistState();
    haptic(10);
  },

  addCareKitSuggestion(id) {
    if (!S.careKit) S.careKit = [];
    if (!S.careKit.some(k => k.id === id)) {
      S.careKit.push({ id, title: id, isFav: 1, isDefault: 0 });
      persistState();
      toast("Added to your Personal Care Kit");
      haptic(15);
    }
  },

  setCareKitFilter(filter) {
    ui.careKitFilter = filter;
    haptic(10);
    notify();
  },

  toggleCareKitFav(id) {
    const item = (S.careKit || []).find(k => k.id === id);
    if (item) {
      item.isFav = item.isFav ? 0 : 1;
      persistState();
      haptic(15);
    }
  },

  openCustomCareModal() {
    ui.careCustomModal = true;
    ui.careCustomIcon = "flame";
    notify();
  },

  closeCustomCareModal() {
    ui.careCustomModal = false;
    notify();
  },

  selectCustomCareIcon(icon) {
    ui.careCustomIcon = icon;
    haptic(10);
    notify();
  },

  saveCustomCareItem(title, desc = "") {
    if (!title || !title.trim()) {
      toast("Please enter a title for your comfort item");
      return;
    }
    const id = "custom-" + Date.now();
    if (!S.careKit) S.careKit = [];
    S.careKit.push({
      id,
      title: title.trim(),
      desc: desc ? desc.trim() : "",
      icon: ui.careCustomIcon || "heart",
      isFav: 1,
      isDefault: 0
    });
    ui.careCustomModal = false;
    persistState();
    toast("Added to Care Kit");
    haptic(20);
  },

  deleteCustomCareItem(id) {
    if (!S.careKit) return;
    S.careKit = S.careKit.filter(k => k.id !== id);
    persistState();
    toast("Item removed from Care Kit");
    haptic(10);
  },

  // 14-30: Private Journal
  openJournal() {
    ui.tab = "care";
    ui.careTab = "journal";
    haptic(10);
    notify();
  },

  openJournalWithPrompt(prompt) {
    ui.tab = "care";
    ui.careTab = "journal";
    this.insertJournalPrompt(prompt);
    haptic(10);
    notify();
  },

  setJournalDate(date) {
    ui.journalDate = date;
    notify();
  },

  stepJournalDate(delta) {
    const current = N(ui.journalDate || I(TD()));
    ui.journalDate = I(current + delta);
    haptic(10);
    notify();
  },

  jumpJournalToday() {
    ui.journalDate = I(TD());
    haptic(10);
    notify();
  },

  setJournalMood(mood) {
    const date = ui.journalDate || I(TD());
    if (!S.journal) S.journal = {};
    if (!S.journal[date]) S.journal[date] = { id: "j-" + date, date, tags: [] };
    S.journal[date].mood = mood;
    S.journal[date].updatedAt = Date.now();
    persistState();
    haptic(15);
  },

  toggleJournalTag(tag) {
    const date = ui.journalDate || I(TD());
    if (!S.journal) S.journal = {};
    if (!S.journal[date]) S.journal[date] = { id: "j-" + date, date, tags: [] };
    const tags = S.journal[date].tags || [];
    const idx = tags.indexOf(tag);
    if (idx >= 0) tags.splice(idx, 1);
    else tags.push(tag);
    S.journal[date].tags = tags;
    S.journal[date].updatedAt = Date.now();
    persistState();
    haptic(10);
  },

  insertJournalPrompt(prompt) {
    const date = ui.journalDate || I(TD());
    if (!S.journal) S.journal = {};
    if (!S.journal[date]) S.journal[date] = { id: "j-" + date, date, tags: [] };
    const cur = S.journal[date].text || "";
    S.journal[date].text = cur ? `${cur}\n\n${prompt} ` : `${prompt} `;
    persistState();
    haptic(10);
  },

  saveJournalEntry(text) {
    const date = ui.journalDate || I(TD());
    if (!S.journal) S.journal = {};
    if (!S.journal[date]) S.journal[date] = { id: "j-" + date, date, tags: [] };
    S.journal[date].text = text;
    S.journal[date].updatedAt = Date.now();
    persistState();
    toast("Journal entry saved");
    haptic(20);
  },

  editJournalEntry(date) {
    ui.journalDate = date;
    ui.careTab = "journal";
    haptic(10);
    notify();
  },

  promptDeleteJournal(date) {
    ui.deleteJournalConfirm = date;
    notify();
  },

  cancelDeleteJournal() {
    ui.deleteJournalConfirm = null;
    notify();
  },

  deleteJournalEntry() {
    const date = ui.deleteJournalConfirm;
    if (date && S.journal && S.journal[date]) {
      delete S.journal[date];
      persistState();
      toast("Journal entry deleted");
      haptic(15);
    }
    ui.deleteJournalConfirm = null;
    notify();
  },

  filterJournalMood(mood) {
    ui.journalFilterMood = ui.journalFilterMood === mood ? null : mood;
    haptic(10);
    notify();
  },

  filterJournalTag(tag) {
    ui.journalFilterTag = ui.journalFilterTag === tag ? null : tag;
    haptic(10);
    notify();
  },

  exportJournal(format = "json") {
    const entries = S.journal || {};
    let blob, ext, mime;
    if (format === "csv") {
      let csv = "Date,Mood,Tags,Text,Updated\n";
      Object.entries(entries).forEach(([d, e]) => {
        const text = `"${(e.text || "").replace(/"/g, '""')}"`;
        const tags = `"${(e.tags || []).join(", ")}"`;
        csv += `${d},${e.mood ?? ""},${tags},${text},${e.updatedAt || ""}\n`;
      });
      blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      ext = "csv";
      mime = "text/csv";
    } else {
      blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json;charset=utf-8;" });
      ext = "json";
      mime = "application/json";
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CycleSideChick_Journal_${I(TD())}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Journal exported as ${ext.toUpperCase()}`);
  },

  toggleCareReminder(key) {
    if (!S.careReminders) S.careReminders = {};
    S.careReminders[key] = S.careReminders[key] ? 0 : 1;
    persistState();
    haptic(15);
  },

  // 31-40: Navigation & Modals
  setTab(tab) {
    if (ui.tab === tab) return;
    const update = () => {
      ui.tab = tab;
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
      haptic(10);
      notify();
    };

    if (
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function" &&
      S.motion !== 0 &&
      (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      document.startViewTransition(update);
    } else {
      update();
    }
  },

  selectCalendarDay(date) {
    ui.selDay = date;
    haptic(10);
    notify();
  },

  openProfile() {
    ui.prof = 1;
    haptic(10);
    notify();
  },

  closeProfile() {
    ui.prof = 0;
    ui.cf = "";
    notify();
  },

  openSidebar() {
    ui.sidebarOpen = true;
    haptic(10);
    notify();
  },

  closeSidebar() {
    ui.sidebarOpen = false;
    haptic(10);
    notify();
  },

  toggleSidebar() {
    ui.sidebarOpen = !ui.sidebarOpen;
    haptic(10);
    notify();
  },

  openHealthModal(tab = "water") {
    ui.healthModalTab = tab;
    haptic(10);
    notify();
  },

  closeHealthModal() {
    ui.healthModalTab = null;
    notify();
  },

  openPhaseModal(phase = "menstrual") {
    ui.phaseModalTab = phase;
    haptic(10);
    notify();
  },

  closePhaseModal() {
    ui.phaseModalTab = null;
    notify();
  },

  openPremiumModal() {
    ui.premiumModalOpen = true;
    haptic(10);
    notify();
  },

  closePremiumModal() {
    ui.premiumModalOpen = false;
    notify();
  },

  openWellnessNotice() {
    ui.wellnessNoticeModal = true;
    haptic(10);
    notify();
  },

  closeWellnessNotice() {
    ui.wellnessNoticeModal = false;
    notify();
  },

  openInfo(topic) {
    ui.infoTopic = topic;
    notify();
  },

  closeInfo() {
    ui.infoTopic = null;
    notify();
  },

  stepCycleParam(key, delta) {
    const limits = { cl: [18, 45], pl: [2, 10], ll: [10, 16] };
    const [min, max] = limits[key] || [1, 100];
    const cur = S[key] || (key === "cl" ? 28 : key === "pl" ? 5 : 14);
    S[key] = Math.max(min, Math.min(max, cur + delta));
    persistState();
    haptic(15);
  },

  openTour() {
    ui.tourModal = true;
    ui.tourTab = 0;
    notify();
  },

  setTourTab(idx) {
    ui.tourTab = idx;
    haptic(10);
    notify();
  },

  closeTour() {
    ui.tourModal = false;
    notify();
  },

  // 41-54: Clinician, Partner, Articles, Assistant
  openClinician() {
    ui.clinicianModal = true;
    notify();
  },

  closeClinician() {
    ui.clinicianModal = false;
    notify();
  },

  copyClinician() {
    const text = generateClinicianSummary(S);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast("Clinician summary copied to clipboard");
        haptic(20);
      });
    }
  },

  copyClinicianSummary() {
    this.copyClinician();
  },

  printClinicianSummary() {
    if (typeof window !== "undefined") {
      window.print();
    }
  },

  conflictClose() {
    ui.conflict = null;
    notify();
  },

  conflictSpotting() {
    const conf = ui.conflict;
    if (conf && conf.date) {
      if (!S.logs) S.logs = {};
      if (!S.logs[conf.date]) S.logs[conf.date] = {};
      S.logs[conf.date].f = 1; // Spotting
      persistState();
      toast("Recorded as spotting");
      haptic(20);
    }
    ui.conflict = null;
    notify();
  },

  conflictExtend() {
    const conf = ui.conflict;
    if (conf && conf.overlap && conf.date) {
      conf.overlap.e = conf.date;
      persistState();
      toast("Period extended");
      haptic(20);
    }
    ui.conflict = null;
    notify();
  },

  openPartner() {
    ui.partnerModal = true;
    notify();
  },

  closePartner() {
    ui.partnerModal = false;
    notify();
  },

  copyPartnerLink() {
    const stats = calculateStats(S);
    const text = `CycleSideChick Partner Summary:\nTypical cycle: ${stats.avg} days\nNext expected period: ${stats.nextEstimated || "Estimated soon"}\nShared privately with care.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast("Partner summary copied");
        haptic(20);
      });
    }
  },

  readArticle(id) {
    const art = ARTICLES.find(a => a.id === id);
    if (art) {
      ui.activeArticle = art;
      haptic(10);
      notify();
    }
  },

  openArticle(id) {
    this.readArticle(id);
  },

  closeArticle() {
    ui.activeArticle = null;
    notify();
  },

  searchLibrary(query) {
    ui.searchLibQuery = query;
    notify();
  },

  askAssistant(prompt) {
    ui.assistantPrompt = prompt;
    this.submitAssistant(prompt);
  },

  submitAssistant(query) {
    if (!query || !query.trim()) return;
    const stats = calculateStats(S);
    const ans = answerQuestion(query.trim(), S, stats);
    ui.assistantAnswer = ans;
    ui.infoTopic = "assistant_qa";
    haptic(15);
    notify();
  },

  // 55-64: Tracking Modes & Calendar
  setMode(mode) {
    S.mode = mode;
    persistState();
    toast(`Mode set to ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    haptic(20);
  },

  startPeriodToday() {
    const today = I(TD());
    this.startPeriod(today);
  },

  openQuickDayMenu(date) {
    ui.quickDayMenu = date;
    notify();
  },

  selectDay(date) {
    this.selectCalendarDay(date);
  },

  navigateMonth(delta) {
    let m = ui.cMonth + delta;
    let y = ui.cYear;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    ui.cMonth = m;
    ui.cYear = y;
    haptic(10);
    notify();
  },

  jumpCalendarToday() {
    const d = new Date();
    ui.cYear = d.getFullYear();
    ui.cMonth = d.getMonth();
    ui.selDay = I(TD());
    haptic(10);
    notify();
  },

  startPeriod(date) {
    if (!S.periods) S.periods = [];
    // Check if period already starts on this date
    const exists = S.periods.find(p => p.s === date);
    if (exists) {
      toast("Period already recorded for this date");
      return;
    }
    S.periods.push({ s: date, e: I(N(date) + (S.pl || 5) - 1) });
    S.periods.sort((a, b) => N(a.s) - N(b.s));
    persistState();
    toast(`Period started on ${date}`);
    haptic(20);
  },

  endPeriod(date) {
    if (!S.periods || !S.periods.length) return;
    const last = S.periods[S.periods.length - 1];
    if (last && N(date) >= N(last.s)) {
      last.e = date;
      persistState();
      toast(`Period ended on ${date}`);
      haptic(20);
    }
  },

  removePeriod(date) {
    if (!S.periods) return;
    const dn = N(date);
    S.periods = S.periods.filter(p => !(dn >= N(p.s) && dn <= N(p.e || p.s)));
    persistState();
    toast("Period record removed");
    haptic(15);
  },

  goLog(date) {
    loadDraft(date);
    this.setTab("log");
  },

  // 65-76: Logging Symptoms & Draft
  selectLogDate(date) {
    loadDraft(date);
    haptic(10);
    notify();
  },

  changeLogDate(date) {
    loadDraft(date);
    notify();
  },

  setFlow(level) {
    dr.f = dr.f === level ? "" : level;
    haptic(15);
    notify();
  },

  setDailyMood(mood) {
    dr.m = dr.m === mood ? null : mood;
    haptic(15);
    notify();
  },

  quickSetMood(mood) {
    const today = I(TD());
    if (!S.logs) S.logs = {};
    if (!S.logs[today]) S.logs[today] = {};
    S.logs[today].m = mood;
    dr.m = mood;
    persistState();
    haptic(20);
    const moodNames = ["Distressed", "Sensitive", "Neutral", "Good", "Great"];
    toast(`Mood logged: ${moodNames[mood] || "Updated"}`);
  },

  setEnergy(level) {
    dr.en = dr.en === level ? "" : level;
    haptic(15);
    notify();
  },

  setWater(cups) {
    dr.water = Math.max(0, cups);
    haptic(10);
    notify();
  },

  quickSetWater(cups) {
    const today = I(TD());
    if (!S.logs) S.logs = {};
    if (!S.logs[today]) S.logs[today] = {};
    const newCount = Math.max(0, cups);
    S.logs[today].water = newCount;
    dr.water = newCount;
    persistState();
    haptic(15);
    notify();
  },

  setCervicalMucus(type) {
    dr.cm = dr.cm === type ? "" : type;
    haptic(15);
    notify();
  },

  toggleMedication(med) {
    const idx = dr.med.indexOf(med);
    if (idx >= 0) dr.med.splice(idx, 1);
    else dr.med.push(med);
    haptic(10);
    notify();
  },

  setLhStatus(status) {
    dr.lh = dr.lh === status ? "" : status;
    haptic(15);
    notify();
  },

  setMood(mood) {
    this.setDailyMood(mood);
  },

  setPain(level) {
    dr.p = level;
    if (!S.logs) S.logs = {};
    if (!S.logs[dr.d]) S.logs[dr.d] = {};
    S.logs[dr.d].p = level;
    persistState();
    haptic(10);
    notify();
  },

  setNote(text) {
    dr.note = text;
    if (!S.logs) S.logs = {};
    if (!S.logs[dr.d]) S.logs[dr.d] = {};
    S.logs[dr.d].note = text;
    persistState();
    notify();
  },

  setCervicalFluid(type) {
    this.setCervicalMucus(type);
  },

  toggleSymptom(symptom) {
    if (dr.sy[symptom]) delete dr.sy[symptom];
    else dr.sy[symptom] = 1;
    if (!S.logs) S.logs = {};
    if (!S.logs[dr.d]) S.logs[dr.d] = {};
    S.logs[dr.d].sy = { ...dr.sy };
    persistState();
    haptic(10);
    notify();
  },

  addCustomSymptom(name) {
    if (!name || !name.trim()) return;
    const key = name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!S.custom) S.custom = [];
    if (!S.custom.includes(key)) S.custom.push(key);
    if (!S.customSymptoms) S.customSymptoms = [];
    if (!S.customSymptoms.includes(name.trim())) S.customSymptoms.push(name.trim());
    dr.sy[key] = 1;
    if (!S.logs) S.logs = {};
    if (!S.logs[dr.d]) S.logs[dr.d] = {};
    S.logs[dr.d].sy = { ...dr.sy };
    persistState();
    toast(`Added "${name}"`);
    haptic(15);
  },

  // Care Checklist Actions
  toggleCareChecklistTask(dateStr, taskId) {
    if (!S.careChecklist) S.careChecklist = {};
    if (!S.careChecklist[dateStr]) S.careChecklist[dateStr] = {};
    const current = Boolean(S.careChecklist[dateStr][taskId]);
    S.careChecklist[dateStr][taskId] = !current;
    persistState();
    haptic(!current ? 20 : 10);
  },

  addCustomCareChecklistTask(title) {
    if (!title || !title.trim()) return;
    if (!S.customCareTasks) S.customCareTasks = [];
    const id = "custom-task-" + Date.now();
    S.customCareTasks.push({ id, title: title.trim(), icon: "sparkle" });
    persistState();
    toast(`Added "${title.trim()}"`);
    haptic(15);
  },

  // Reminder Dismissal
  dismissReminder(key) {
    if (!S.dismissedReminders) S.dismissedReminders = {};
    S.dismissedReminders[key] = Date.now();
    persistState();
    haptic(10);
  },

  addCareKitItem(title, category = "General") {
    if (!title || !title.trim()) return;
    const id = "kit-" + Date.now();
    if (!S.careKit) S.careKit = [];
    S.careKit.push({
      id,
      title: title.trim(),
      category,
      icon: "heart",
      isFav: 1,
      isDefault: 0
    });
    persistState();
    toast("Added to Care Kit");
    haptic(15);
  },

  removeCareKitItem(id) {
    this.deleteCustomCareItem(id);
  },

  confirmDeleteJournal(date) {
    this.promptDeleteJournal(date);
  },

  saveDailyLog() {
    const date = dr.d;
    if (!S.logs) S.logs = {};
    S.logs[date] = {
      f: dr.f !== "" ? dr.f : undefined,
      m: dr.m,
      p: dr.p,
      en: dr.en || undefined,
      sl: dr.sl,
      sq: dr.sq || undefined,
      water: dr.water || undefined,
      cm: dr.cm || undefined,
      med: dr.med.length ? [...dr.med] : undefined,
      bbt: dr.bbt ? String(dr.bbt).trim() : undefined,
      lh: dr.lh || undefined,
      sy: { ...dr.sy },
      note: dr.note ? dr.note.trim() : undefined
    };
    persistState();
    toast("Entry saved");
    haptic([20, 40]);
  },

  // 77-84: Preferences, Security, Export, Wipe
  setTheme(theme) {
    S.theme = theme;
    persistState();
    applyThemeToDOM();
    haptic(15);
  },

  togglePref(key) {
    if (key in S) {
      S[key] = S[key] ? 0 : 1;
      persistState();
      applyThemeToDOM();
      haptic(15);
    }
  },

  async togglePinLock() {
    if (PinLock.isEnabled()) {
      PinLock.remove();
      ui.pinLocked = false;
      toast("PIN Lock disabled");
      haptic(20);
      notify();
    } else {
      ui.pinSetup = true;
      notify();
    }
  },

  async enterPinKey(digit) {
    if (ui.pinInput.length < 4) {
      ui.pinInput += String(digit);
      haptic(15);
      notify();

      if (ui.pinInput.length === 4) {
        const ok = await PinLock.verify(ui.pinInput);
        if (ok) {
          ui.pinLocked = false;
          ui.pinInput = "";
          ui.pinError = false;
          haptic([20, 50]);
          toast("Unlocked");
        } else {
          ui.pinError = true;
          haptic([40, 80, 40]);
          toast("Incorrect PIN");
          setTimeout(() => {
            ui.pinInput = "";
            ui.pinError = false;
            notify();
          }, 400);
        }
        notify();
      }
    }
  },

  deletePinKey() {
    ui.pinInput = ui.pinInput.slice(0, -1);
    haptic(10);
    notify();
  },

  clearPin() {
    ui.pinInput = "";
    haptic(10);
    notify();
  },

  exportCSV() {
    const csv = generateCSV(S);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CycleSideChick_Export_${I(TD())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("CSV export downloaded");
  },

  exportJSON() {
    const json = generateJSON(S);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CycleSideChick_Backup_${I(TD())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("JSON backup downloaded");
  },

  wipeAllData() {
    CycleStorage.wipe();
    Object.keys(S).forEach(k => delete S[k]);
    Object.assign(S, defState());
    applyThemeToDOM();
    ui.prof = 0;
    ui.obStep = 0;
    loadDraft(I(TD()));
    haptic([30, 60, 30]);
    toast("All on-device data has been erased");
    notify();
  },

  // 85-88: Onboarding
  onboardingNext() {
    ui.obStep = (ui.obStep || 0) + 1;
    haptic(15);
    notify();
  },

  onboardingSkip() {
    this.finishOnboarding();
  },

  setOnboardingMode(mode) {
    S.mode = mode;
    haptic(15);
    notify();
  },

  finishOnboarding() {
    S.ob = 1;
    persistState();
    ui.tab = "home";
    haptic(25);
    toast("Welcome to CycleSideChick!");
    notify();
  },

  haptic(pattern = 10) {
    haptic(pattern);
  },

  toast(msg) {
    toast(msg);
  },

  persistState() {
    persistState();
  }
};
