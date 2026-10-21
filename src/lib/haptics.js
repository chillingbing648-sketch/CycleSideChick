/**
 * CycleSideChick — Centralized Haptics Library
 * Provides calm, tactile tactile feedback patterns.
 * Automatically no-ops when unsupported or when reduced motion / haptics toggle is disabled.
 */

export function triggerHaptic(pattern = 15, options = {}) {
  // Check browser support
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  // Check state toggles if provided or check root dataset
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (root.dataset.motion === "reduced" && !options.force) return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (err) {
    // Graceful no-op on non-compliant user agents
  }
}

export const haptic = {
  selection: () => triggerHaptic(10),
  light: () => triggerHaptic(15),
  medium: () => triggerHaptic(25),
  success: () => triggerHaptic([20, 50, 30]),
  error: () => triggerHaptic([40, 60, 40, 60, 50]),
  tick: () => triggerHaptic(8)
};
