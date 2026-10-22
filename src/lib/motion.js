/**
 * CycleSideChick — Motion System Utilities
 * Implements subtle, calm spring physics with <= 6% overshoot.
 */

// CSS linear() spring approximation fallback
export const SPRING_LINEAR = "linear(0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%, 0.932 38.4%, 0.978 45.3%, 0.997 53.5%, 1.003 62.3%, 1)";

export const EASINGS = {
  spring: "var(--ease-spring, cubic-bezier(0.34, 1.3, 0.64, 1))",
  outExpo: "var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1))",
  inOut: "var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1))"
};

export const DURATIONS = {
  instant: 90,
  fast: 160,
  base: 260,
  slow: 360,
  hero: 900
};

export function withViewTransition(fn) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    return document.startViewTransition(fn);
  }
  return Promise.resolve(fn());
}
