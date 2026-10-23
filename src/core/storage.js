/**
 * CycleSideChick — Storage, Privacy Ledger & Cryptographic Security
 * Zero cloud. 100% on-device storage. Salted PIN lock. Safe migrations.
 * Architectural layer: StorageRepository (decoupled from UI)
 */

const KEY = "csc.v1";
const PIN_SALT_KEY = "csc.pin.salt";
const PIN_HASH_KEY = "csc.pin.hash";
const SCHEMA_VERSION = 2;

const DEFAULT_CARE_KIT = [
  { id: "heat", title: "Warm compress or heating pad", icon: "flame", desc: "Soothing warmth for pelvis or lower back used safely", isFav: 1, isDefault: 1 },
  { id: "tea", title: "Soothing warm tea or drink", icon: "cup", desc: "Chamomile, peppermint, ginger, or nourishing warm water", isFav: 1, isDefault: 1 },
  { id: "rest", title: "Rest & permission to slow down", icon: "moon", desc: "A cozy horizontal pause without guilt or pressure", isFav: 1, isDefault: 1 },
  { id: "clothes", title: "Loose, comfortable clothing", icon: "heart", desc: "Soft breathable layers and gentle non-binding waistbands", isFav: 1, isDefault: 1 },
  { id: "stretch", title: "Gentle stretching or restorative yoga", icon: "activity", desc: "Child's pose, cat-cow, or slow mindful breathing", isFav: 0, isDefault: 1 },
  { id: "music", title: "Calming playlist or soundscape", icon: "sparkle", desc: "Lo-fi beats, gentle ambient rainfall, or comfort songs", isFav: 0, isDefault: 1 },
  { id: "talk", title: "Connect with a trusted friend", icon: "user", desc: "Texting or sharing space with someone who validates you", isFav: 0, isDefault: 1 },
  { id: "fresh-air", title: "Step outside for natural light & fresh air", icon: "sun", desc: "A few slow, deep breaths in the open air", isFav: 0, isDefault: 1 }
];

const defState = () => ({
  _v: SCHEMA_VERSION,
  ob: 0,
  cl: 28,
  pl: 5,
  ll: 14,
  reg: "unknown",
  mode: "natural", // natural | irregular | contra | ttc | pregnancy | perimenopause | none
  pregnancyLmp: null,
  goals: [],
  rem: 0,
  periods: [],
  logs: {},
  custom: [],
  theme: "system",
  motion: 1, // 1: fluid spring motion enabled, 0: reduced motion
  haptics: 1, // 1: tactile haptics enabled, 0: disabled
  showFertile: 1, // 1: show fertile window approximations, 0: hidden
  careAlerts: 1, // 1: show clinical alerts, 0: hidden
  waterGoal: 1, // 1: show hydration tracker, 0: hidden
  rp: 2,
  rt: "20:00",
  rk: { prep: 1, log: 1 },
  dis: {},
  sent: {},
  discreetNotif: 0,
  // Care, Comfort & Journal State
  journal: {},
  careKit: [...DEFAULT_CARE_KIT],
  careDismissed: {},
  careSaved: {},
  careCheckin: {},
  careReminders: {
    period: 1,
    checkin: 1,
    prep: 1,
    journal: 0,
    routine: 0
  }
});

/**
 * Migration function for older schema versions
 */
function migrateState(data) {
  if (!data || typeof data !== "object") return defState();
  if (!data._v || data._v < 2) {
    data._v = SCHEMA_VERSION;
    if (!data.mode) {
      if (data.contra) data.mode = "contra";
      else if (data.reg === "irregular") data.mode = "irregular";
      else data.mode = "natural";
    }
    if (!data.ll) data.ll = 14;
    data.periods = Array.isArray(data.periods) ? data.periods : [];
    data.logs = (data.logs && typeof data.logs === "object") ? data.logs : {};
    data.custom = Array.isArray(data.custom) ? data.custom : [];
  }
  if (!data.journal || typeof data.journal !== "object") data.journal = {};
  if (!Array.isArray(data.careKit) || data.careKit.length === 0) data.careKit = [...DEFAULT_CARE_KIT];
  if (!data.careDismissed || typeof data.careDismissed !== "object") data.careDismissed = {};
  if (!data.careSaved || typeof data.careSaved !== "object") data.careSaved = {};
  if (!data.careCheckin || typeof data.careCheckin !== "object") data.careCheckin = {};
  if (!data.careReminders || typeof data.careReminders !== "object") {
    data.careReminders = { period: 1, checkin: 1, prep: 1, journal: 0, routine: 0 };
  }
  return { ...defState(), ...data };
}

/**
 * Safe local storage load with corruption fallback
 */
function loadState() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return { state: defState(), corrupt: false };
    const parsed = JSON.parse(raw);
    return { state: migrateState(parsed), corrupt: false };
  } catch (err) {
    console.error("Storage read exception:", err);
    try {
      if (typeof localStorage !== "undefined") {
        const rawCorrupt = localStorage.getItem(KEY);
        if (rawCorrupt) localStorage.setItem(KEY + ".corrupt_backup", rawCorrupt);
      }
    } catch (e) {}
    return { state: defState(), corrupt: true };
  }
}

function saveState(state) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
}

/**
 * Privacy Ledger: Audits all client-side storage keys and byte counts
 */
function getPrivacyLedger() {
  const items = [];
  try {
    if (typeof localStorage !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("csc")) {
          const val = localStorage.getItem(k) || "";
          const bytes = new Blob([val]).size;
          let desc = "Application data";
          if (k === KEY) desc = "Cycle history, symptom logs, personal settings (Schema v2)";
          else if (k.includes("backup")) desc = "Local recovery safety backup";
          else if (k.includes("pin")) desc = "Salted cryptographic PIN hash for app lock";

          items.push({
            key: k,
            sizeBytes: bytes,
            sizeKB: (bytes / 1024).toFixed(2),
            description: desc
          });
        }
      }
    }
  } catch (e) {}
  return items;
}

/**
 * Salted PIN Hash verification & storage (Web Crypto API)
 */
async function hashPin(pin, saltHex) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // Basic fallback for environments without web crypto (e.g. older headless)
    return { saltHex: saltHex || "salt00", hashHex: "mock_hash_" + pin };
  }
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const pinData = enc.encode(pin);
  const combined = new Uint8Array(salt.length + pinData.length);
  combined.set(salt);
  combined.set(pinData, salt.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return {
    saltHex: bytesToHex(salt),
    hashHex
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function verifyPin(pin, storedSaltHex, storedHashHex) {
  const { hashHex } = await hashPin(pin, storedSaltHex);
  return hashHex === storedHashHex;
}

/**
 * High-level PIN Lock Management
 */
const PinLock = {
  isEnabled() {
    try {
      return !!(typeof localStorage !== "undefined" && localStorage.getItem(PIN_HASH_KEY));
    } catch (e) {
      return false;
    }
  },
  async set(pin) {
    const { saltHex, hashHex } = await hashPin(pin);
    try {
      localStorage.setItem(PIN_SALT_KEY, saltHex);
      localStorage.setItem(PIN_HASH_KEY, hashHex);
      return true;
    } catch (e) {
      return false;
    }
  },
  async verify(pin) {
    try {
      const salt = localStorage.getItem(PIN_SALT_KEY);
      const hash = localStorage.getItem(PIN_HASH_KEY);
      if (!salt || !hash) return false;
      return await verifyPin(pin, salt, hash);
    } catch (e) {
      return false;
    }
  },
  remove() {
    try {
      localStorage.removeItem(PIN_SALT_KEY);
      localStorage.removeItem(PIN_HASH_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * CSV Export Generator
 */
function generateCSV(S) {
  const headers = [
    "Date", "Entry_Type", "Bleeding_Flow", "Mood", "Pain_0_10",
    "Energy", "Sleep_Hours", "Sleep_Quality", "Hydration_Glasses", "Cervical_Mucus", "Medications",
    "BBT", "LH_Test", "Symptoms", "Notes", "Journal_Reflection", "Journal_Gratitude", "Journal_Helped"
  ];
  const rows = [];
  const dates = new Set([...Object.keys(S.logs || {}), ...Object.keys(S.journal || {})]);

  (S.periods || []).forEach(p => {
    if (p.s) dates.add(p.s);
    if (p.e) dates.add(p.e);
  });

  const sortedDates = [...dates].sort();

  sortedDates.forEach(d => {
    const l = (S.logs && S.logs[d]) || {};
    const j = (S.journal && S.journal[d]) || {};
    const symList = Object.entries(l.sy || {}).map(([k, v]) => `${k}:${["mild", "mod", "sev"][v - 1] || v}`).join("; ");
    const medsList = Array.isArray(l.med) ? l.med.join("; ") : (l.med || "");

    const row = [
      d,
      l.f && l.f !== "none" ? "Bleeding / Period" : (j.text ? "Journal & Health" : "Daily Log"),
      l.f || "",
      l.m != null ? l.m : (j.mood || ""),
      l.p != null ? l.p : "",
      l.en || (j.energy ? String(j.energy) : ""),
      l.sl != null ? l.sl : "",
      l.sq || "",
      l.water || 0,
      l.cm || "",
      `"${medsList.replace(/"/g, '""')}"`,
      l.bbt || "",
      l.lh || "",
      `"${symList.replace(/"/g, '""')}"`,
      `"${(l.note || "").replace(/"/g, '""')}"`,
      `"${(j.text || "").replace(/"/g, '""')}"`,
      `"${(j.gratitude || "").replace(/"/g, '""')}"`,
      `"${(j.helped || "").replace(/"/g, '""')}"`
    ];
    rows.push(row.join(","));
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * JSON Export Generator
 */
function generateJSON(S) {
  const exported = {
    app: "CycleSideChick",
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: S
  };
  return JSON.stringify(exported, null, 2);
}

/**
 * Import validation & conflict detection
 */
function previewImport(jsonOrCsvString, currentState) {
  try {
    let parsed = JSON.parse(jsonOrCsvString);
    if (parsed.data && parsed.app === "CycleSideChick") {
      parsed = parsed.data;
    }
    const incomingPeriods = Array.isArray(parsed.periods) ? parsed.periods : [];
    const incomingLogs = (parsed.logs && typeof parsed.logs === "object") ? parsed.logs : {};

    const existingStartDates = new Set((currentState.periods || []).map(p => p.s));
    let newPeriods = 0;
    let dupPeriods = 0;

    incomingPeriods.forEach(p => {
      if (existingStartDates.has(p.s)) dupPeriods++;
      else newPeriods++;
    });

    let newLogs = 0;
    let mergedLogs = 0;
    Object.keys(incomingLogs).forEach(d => {
      if ((currentState.logs || {})[d]) mergedLogs++;
      else newLogs++;
    });

    return {
      valid: true,
      newPeriods,
      dupPeriods,
      newLogs,
      mergedLogs,
      parsedData: parsed
    };
  } catch (e) {
    return { valid: false, error: "Invalid JSON format: please upload a valid CycleSideChick backup file." };
  }
}

/**
 * CycleStorage Repository — Abstract Data Access Layer
 * Enables decoupling the UI and easily substituting IndexedDB or encrypted storage.
 */
const CycleStorage = {
  load: loadState,
  save: saveState,
  getLedger: getPrivacyLedger,
  pin: PinLock,
  exportCSV: generateCSV,
  exportJSON: generateJSON,
  previewImport: previewImport,
  wipe() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(PIN_SALT_KEY);
      localStorage.removeItem(PIN_HASH_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    KEY, SCHEMA_VERSION, DEFAULT_CARE_KIT, defState, migrateState, loadState, saveState,
    getPrivacyLedger, hashPin, verifyPin, PinLock, generateCSV, generateJSON,
    previewImport, CycleStorage
  };
}

export {
  KEY, SCHEMA_VERSION, DEFAULT_CARE_KIT, defState, migrateState, loadState, saveState,
  getPrivacyLedger, hashPin, verifyPin, PinLock, generateCSV, generateJSON,
  previewImport, CycleStorage
};
