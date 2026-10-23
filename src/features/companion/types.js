/**
/**
 * CycleSideChick — Cycle Care Companion Types & Constants
 */

export const COMPANION_PERMISSIONS = {
  sharePhase: { id: "sharePhase", label: "Cycle Phase & Day", desc: "Current menstrual phase (e.g. Follicular, Luteal) and cycle day count", default: true },
  sharePeriodStatus: { id: "sharePeriodStatus", label: "Period Bleeding Status", desc: "Whether your period is currently active or logged today", default: true },
  shareEstimatedDates: { id: "shareEstimatedDates", label: "Estimated Future Dates", desc: "Estimated window for next expected period and fertile window", default: true },
  shareFeelings: { id: "shareFeelings", label: "Logged Feelings", desc: "Selected emotions explicitly logged today", default: true },
  shareSymptoms: { id: "shareSymptoms", label: "Logged Physical Symptoms", desc: "Symptoms (e.g. cramps, headache) logged today", default: true },
  shareEnergy: { id: "shareEnergy", label: "Energy Level", desc: "High, medium, or low energy explicitly logged today", default: true },
  shareMood: { id: "shareMood", label: "General Mood", desc: "Overall mood score explicitly logged today", default: true },
  shareNotes: { id: "shareNotes", label: "Shared Personal Notes", desc: "Only notes you explicitly choose to share (private journals are NEVER shared)", default: false },
  shareSupportPreferences: { id: "shareSupportPreferences", label: "Support Preferences", desc: "Contextual guidance on what supportive actions help most today", default: true }
};

export const DEFAULT_PERMISSIONS = Object.fromEntries(
  Object.entries(COMPANION_PERMISSIONS).map(([k, v]) => [k, v.default])
);

export const PREDEFINED_RESPONSES = [
  { key: "here_for_you", text: "I'm here for you.", icon: "heart", default: true },
  { key: "would_you_like_help", text: "Would you like some help?", icon: "help", default: true },
  { key: "take_care_of_task", text: "I'll take care of a task.", icon: "check", default: true },
  { key: "prefer_some_space", text: "Would you prefer some space?", icon: "shield", default: true },
  { key: "extra_love", text: "Sending you extra love.", icon: "sparkles", default: true },
  { key: "check_in_later", text: "I'll check in later, if that's okay.", icon: "bell", default: true }
];

export const DEFAULT_ALLOWED_RESPONSES = PREDEFINED_RESPONSES.map(r => r.key);

export const EVENT_CATEGORIES = {
  PERIOD_LOGGED: "period_logged",
  PHASE_CHANGE: "phase_change",
  STATUS_SYNCED: "status_synced",
  SYMPTOM_SHARED: "symptom_shared",
  SUPPORT_REQUESTED: "support_requested"
};
