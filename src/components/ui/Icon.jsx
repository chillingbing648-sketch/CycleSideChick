/**
 * CycleSideChick — Premium Vector Icon System
 * Standard 24x24 grid, 1.8px stroke, soft rounded curves, accessible SVG.
 * Replaces basic sharp SVGs with organic, boutique mobile wellness iconography.
 */

import React from "react";

export const ICONS = {
  // Navigation & Shell (Soft, organic, rounded)
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h12" />
      <path d="M4 17h16" />
    </>
  ),
  creditCard: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h3.5" />
      <circle cx="17.5" cy="14.5" r="1" fill="currentColor" fillOpacity="0.25" />
    </>
  ),
  home: (
    <>
      <path d="M3.8 11.2a1.5 1.5 0 0 1 .4-1l6.4-5.4a2.2 2.2 0 0 1 2.8 0l6.4 5.4a1.5 1.5 0 0 1 .4 1V19a2 2 0 0 1-2 2h-3.5a1 1 0 0 1-1-1v-3.5a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5V20a1 1 0 0 1-1 1H5.8a2 2 0 0 1-2-2v-7.8z" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16" rx="3.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 2.5v3.5" />
      <path d="M16 2.5v3.5" />
      <circle cx="8" cy="13.5" r="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1" fill="currentColor" />
      <circle cx="8" cy="16.5" r="1" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      <circle cx="16" cy="16.5" r="1" fill="currentColor" />
    </>
  ),
  log: (
    <>
      <path d="M6 3.5h10a3 3 0 0 1 3 3v12a2 2 0 0 1-2 2H6a2.5 2.5 0 0 1-2.5-2.5v-12A2.5 2.5 0 0 1 6 3.5z" />
      <path d="M8.5 8h7" />
      <path d="M8.5 12h5" />
      <path d="M12 16h3.5" />
      <circle cx="8.5" cy="16" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </>
  ),
  insights: (
    <>
      <path d="M3.5 17.5c3.5-3 5-7.5 8.5-7.5s4 5.5 8-4.5" />
      <circle cx="3.5" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="10" r="1.8" fill="currentColor" />
      <circle cx="20" cy="5.5" r="1.8" fill="currentColor" />
      <path d="M17 5.5h3v3" />
    </>
  ),
  care: (
    <>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <path d="M8.5 8.5c0-1.5 1-2.5 2.5-2.5" strokeLinecap="round" strokeOpacity="0.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 20c0-3.8 3.4-6.5 7.5-6.5s7.5 2.7 7.5 6.5" />
      <circle cx="12" cy="7.5" r="1.5" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.15" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),

  // Core Actions
  x: <path d="M18 6L6 18M6 6l12 12" />,
  check: <path d="M20 6L9 17l-5-5" />,
  sparkle: (
    <>
      <path d="M12 2.5c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z" />
      <circle cx="19" cy="5" r="1" fill="currentColor" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 7.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5zm0 9a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 0-5zm-4.5-4.5a2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 0 5 0zm9 0a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0-5 0z" />
    </>
  ),
  arrowLeft: <path d="M15 19l-7-7 7-7" />,
  arrowRight: <path d="M9 5l7 7-7 7" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronUp: <path d="M18 15l-6-6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  trash: (
    <>
      <path d="M3.5 6h17" />
      <path d="M8.5 6V4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      <path d="M5.5 6l1 13.5a2.5 2.5 0 0 0 2.5 2.5h6a2.5 2.5 0 0 0 2.5-2.5l1-13.5" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H5.5A2.5 2.5 0 0 0 3 6.5v12A2.5 2.5 0 0 0 5.5 21h12a2.5 2.5 0 0 0 2.5-2.5V13" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  refresh: (
    <>
      <path d="M22 4v6h-6" />
      <path d="M2 20v-6h6" />
      <path d="M3.5 9a9 9 0 0 1 15-3.3L22 10" />
      <path d="M1.5 14l3.5 4.3A9 9 0 0 0 20.5 15" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M5 15.5H4.5A2.5 2.5 0 0 1 2 13V4.5A2.5 2.5 0 0 1 4.5 2H13a2.5 2.5 0 0 1 2.5 2.5v.5" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </>
  ),
  lock: (
    <>
      <rect x="3.5" y="11" width="17" height="10" rx="3" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),

  // Fluid & Clinical
  droplet: (
    <>
      <path d="M12 2.6c3.8 4.2 6.5 7.8 6.5 11.4a6.5 6.5 0 0 1-13 0C5.5 10.4 8.2 6.8 12 2.6z" />
      <path d="M8.5 12.5a3.5 3.5 0 0 1 3.5-3.5" strokeOpacity="0.5" />
    </>
  ),
  water: (
    <>
      <path d="M12 2.8c3.5 4 6.2 7.4 6.2 11.2a6.2 6.2 0 1 1-12.4 0C5.8 10.2 8.5 6.8 12 2.8z" />
      <path d="M8 14.5c1.2 1 2.4 1.5 4 1.5s2.8-.5 4-1.5" strokeOpacity="0.6" />
    </>
  ),
  thermometer: (
    <>
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z" />
      <path d="M12 11v6" strokeWidth="2.4" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </>
  ),
  flame: (
    <>
      <path d="M8.5 14.5A4.5 4.5 0 0 0 13 19a4.5 4.5 0 0 0 4.5-4.5c0-3-2.5-5-3.5-7.5-.5 1-1 2-2.5 2.5 0-2-1-4-3-4.5 0 2.5-1 4.5 0 5z" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </>
  ),
  pill: (
    <>
      <rect x="4.5" y="4.5" width="8" height="16" rx="4" transform="rotate(-45 8.5 12.5)" />
      <line x1="6.8" y1="17.2" x2="17.2" y2="6.8" />
      <path d="M7 11.5a2.5 2.5 0 0 1 2.5-2.5" strokeOpacity="0.5" />
    </>
  ),
  cup: (
    <>
      <path d="M3.5 8h13v8a4 4 0 0 1-4 4h-5a4 4 0 0 1-4-4V8z" />
      <path d="M16.5 10h1.5a3 3 0 0 1 0 6h-1.5" />
      <path d="M7 2.5c0 2-1.5 2.5-1.5 4" strokeOpacity="0.6" />
      <path d="M11 2.5c0 2-1.5 2.5-1.5 4" strokeOpacity="0.6" />
      <path d="M15 2.5c0 2-1.5 2.5-1.5 4" strokeOpacity="0.6" />
    </>
  ),
  heart: (
    <>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <circle cx="7.5" cy="8" r="1.5" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" strokeWidth="2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 8.5h.01M12 11.5v5" strokeWidth="2" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 22z" />
      <path d="M8 7h8M8 11h5" />
    </>
  ),
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  moon: (
    <>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <circle cx="16" cy="8" r="1" fill="currentColor" fillOpacity="0.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 1v2.5M12 20.5v2.5M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M1 12h2.5M20.5 12h2.5M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77" />
    </>
  ),
  zap: <path d="M13 2.5L5.5 13.5h5L9.5 21.5 18.5 10.5h-5.5L14.5 2.5z" />,

  // Flow Levels
  flowNone: (
    <>
      <path d="M12 3.5C8.8 7.8 6.5 11 6.5 14a5.5 5.5 0 0 0 11 0c0-3-2.3-6.2-5.5-10.5z" strokeOpacity="0.5" />
      <path d="M6 6l12 12" strokeWidth="2" />
    </>
  ),
  flowSpotting: (
    <>
      <path d="M12 5.5c-2.2 2.8-3.5 5-3.5 7a3.5 3.5 0 0 0 7 0c0-2-1.3-4.2-3.5-7z" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </>
  ),
  flowLight: (
    <>
      <path d="M12 3.5C8.5 8 6 11.5 6 15a6 6 0 0 0 12 0c0-3.5-2.5-7-6-11.5z" />
      <path d="M9.5 13.5a3.5 3.5 0 0 0 3.5 3.5" strokeOpacity="0.5" />
    </>
  ),
  flowMedium: (
    <>
      <path d="M9 5C6.5 8.2 4.5 11 4.5 13.8a4.5 4.5 0 0 0 9 0c0-2.8-2-5.6-4.5-8.8z" />
      <path d="M15.5 9c-1.8 2.3-3 4.2-3 6a3 3 0 0 0 6 0c0-1.8-1.2-3.7-3-6z" />
    </>
  ),
  flowHeavy: (
    <>
      <path d="M12 3.5c-2.5 3.2-4.5 5.8-4.5 8.5a4.5 4.5 0 0 0 9 0c0-2.7-2-5.3-4.5-8.5z" />
      <path d="M6 11.5c-1.6 2-2.5 3.6-2.5 5a2.5 2.5 0 0 0 5 0c0-1.4-.9-3-2.5-5z" />
      <path d="M18 11.5c-1.6 2-2.5 3.6-2.5 5a2.5 2.5 0 0 0 5 0c0-1.4-.9-3-2.5-5z" />
    </>
  ),

  // Emotional Moods (Kawaii, Expressive, Soft, Professional!)
  moodHappy: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 10.5c.5-.9 1.5-.9 2 0M14 10.5c.5-.9 1.5-.9 2 0" strokeWidth="2" />
      <circle cx="7" cy="13" r="1.2" fill="currentColor" fillOpacity="0.3" stroke="none" />
      <circle cx="17" cy="13" r="1.2" fill="currentColor" fillOpacity="0.3" stroke="none" />
      <path d="M8.5 14.5c1 1.8 2.5 2.3 3.5 2.3s2.5-.5 3.5-2.3" strokeWidth="1.8" />
    </>
  ),
  moodCalm: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.8 11c.7.4 1.5.4 2.2 0M14 11c.7.4 1.5.4 2.2 0" strokeWidth="2" />
      <path d="M9.5 15c1 .8 1.8 1 2.5 1s1.5-.2 2.5-1" strokeWidth="1.8" />
      <circle cx="6.8" cy="13.2" r="1" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <circle cx="17.2" cy="13.2" r="1" fill="currentColor" fillOpacity="0.25" stroke="none" />
    </>
  ),
  moodNeutral: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="M9.5 15h5" strokeWidth="2" />
    </>
  ),
  moodLow: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 9.5l2 1.2M16 9.5l-2 1.2" strokeWidth="1.8" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9 16.5c1-1 2-1.5 3-1.5s2 .5 3 1.5" strokeWidth="1.8" />
    </>
  ),
  moodIrritable: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 9.5l2.5 1.5M16 9.5l-2.5 1.5" strokeWidth="2" />
      <circle cx="9.2" cy="12.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12.2" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9 16c1.2-.8 2.2-.4 3-.4s1.8-.4 3 .4" strokeWidth="1.8" />
      <circle cx="7" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.35" stroke="none" />
      <circle cx="17" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.35" stroke="none" />
    </>
  ),
  moodAnxious: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 9c1-.5 2 0 2 0M16 9c-1-.5-2 0-2 0" strokeWidth="1.8" />
      <circle cx="9" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8.5 16c1-.8 2 .8 3.5 0s2.5 .8 3.5 0" strokeWidth="1.8" />
    </>
  ),
  moodJoyful: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 9v3m-1.5-1.5h3M15.5 9v3m-1.5-1.5h3" strokeWidth="1.8" />
      <circle cx="6.5" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.4" stroke="none" />
      <circle cx="17.5" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.4" stroke="none" />
      <path d="M8 14.5c1 2 2.5 2.5 4 2.5s3-.5 4-2.5" strokeWidth="2" />
    </>
  ),
  moodPeaceful: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.5 11c.8.5 1.7.5 2.5 0M14 11c.8.5 1.7.5 2.5 0" strokeWidth="2" />
      <path d="M9.5 15.2c1 .7 1.7.8 2.5.8s1.5-.1 2.5-.8" strokeWidth="1.8" />
      <path d="M12 5.5v2.5M10.8 6.8l2.4 0" strokeWidth="1.5" />
    </>
  ),
  moodOverwhelmed: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9 10a1.5 1.5 0 1 0 1.5 1.5M15 10a1.5 1.5 0 1 0 1.5 1.5" strokeWidth="1.8" />
      <path d="M8.5 16.2c1.2-1 2.4 1 3.5 0s2.3 1 3.5 0" strokeWidth="1.8" />
    </>
  ),
  moodTearful: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <path d="M16.5 13.5c-.8 1-1.2 1.8-1.2 2.4a1.2 1.2 0 0 0 2.4 0c0-.6-.4-1.4-1.2-2.4z" fill="currentColor" stroke="none" />
      <path d="M9.5 16.5c1-.8 1.8-1 2.5-1s1.5.2 2.5 1" strokeWidth="1.8" />
    </>
  ),
  moodBrainFog: (
    <>
      <path d="M6.5 17.5h11a3.5 3.5 0 0 0 .5-6.9 4.5 4.5 0 0 0-8.5-2.1A3.5 3.5 0 0 0 6.5 17.5z" />
      <path d="M9 13.5h.01M15 13.5h.01" strokeWidth="2.5" />
      <path d="M11 15.5c.5.4 1.5.4 2 0" />
    </>
  ),
  moodAffectionate: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 9.5a1.2 1.2 0 0 0-1.7 0c-.5.5-.5 1.2 0 1.7l1.7 1.7 1.7-1.7c.5-.5.5-1.2 0-1.7a1.2 1.2 0 0 0-1.7 0z" fill="currentColor" stroke="none" />
      <path d="M15.5 9.5a1.2 1.2 0 0 0-1.7 0c-.5.5-.5 1.2 0 1.7l1.7 1.7 1.7-1.7c.5-.5.5-1.2 0-1.7a1.2 1.2 0 0 0-1.7 0z" fill="currentColor" stroke="none" />
      <path d="M9 15c1 1.5 2 2 3 2s2-.5 3-2" strokeWidth="1.8" />
    </>
  ),
  moodGrounded: (
    <>
      <path d="M12 21v-7" strokeWidth="2" />
      <path d="M12 14c-3-4-7-3-7 1 3 0 6-2 7-1z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 11c3-4 7-3 7 1-3 0-6-2-7-1z" fill="currentColor" fillOpacity="0.2" />
      <path d="M5 21h14" strokeWidth="1.8" />
    </>
  ),

  // Energy
  energyHigh: (
    <>
      <path d="M13 2.5L5.5 13.5h5L9.5 21.5 18.5 10.5h-5.5L14.5 2.5z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </>
  ),
  energyBalanced: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18c2.5 0 4.5-2 4.5-4.5S14.5 12 12 12s-4.5-2-4.5-4.5S9.5 3 12 3z" fill="currentColor" fillOpacity="0.15" />
    </>
  ),
  energyLow: (
    <>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <path d="M15 8h3l-2.5 3.5h3" strokeWidth="1.5" />
    </>
  ),

  // Symptoms
  cramps: (
    <>
      <path d="M3.5 8c2.5-2 5.5-2 8.5 0s6 2 8.5 0" />
      <path d="M3.5 13c2.5-2 5.5-2 8.5 0s6 2 8.5 0" />
      <path d="M3.5 18c2.5-2 5.5-2 8.5 0s6 2 8.5 0" />
    </>
  ),
  bloating: (
    <>
      <path d="M4 12c0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8-8-3.5-8-8z" strokeDasharray="3 3" />
      <path d="M12 7.5v9M8.5 13.5l3.5 3.5 3.5-3.5" />
    </>
  ),
  headache: (
    <>
      <path d="M12 3a7 7 0 0 0-7 7c0 3.2 2 6 5 6.8V19a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2.2c3-.8 5-3.6 5-6.8a7 7 0 0 0-7-7z" />
      <path d="M2.5 10h2M19.5 10h2M4.8 5.5l1.4 1.4M17.8 6.9l1.4-1.4" />
      <circle cx="12" cy="10" r="2" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  breast: (
    <>
      <path d="M3.5 15.5c1.8-4 4.5-6 8.5-6s6.7 2 8.5 6" />
      <circle cx="7.8" cy="11.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="16.2" cy="11.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 3.5v3M7.5 5.5l1.2 1.5M16.5 5.5l-1.2 1.5" />
    </>
  ),
  backache: (
    <>
      <path d="M12 3v18" strokeWidth="2" />
      <rect x="9.5" y="5.5" width="5" height="2.5" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect x="9" y="10" width="6" height="2.5" rx="1" fill="currentColor" fillOpacity="0.2" />
      <rect x="9" y="14.5" width="6" height="2.5" rx="1" fill="currentColor" fillOpacity="0.2" />
      <path d="M6 11c1.5-1 3.5-1 6 0M18 11c-1.5-1-3.5-1-6 0" />
    </>
  ),
  fatigue: (
    <>
      <path d="M3 11c3 4 6 5.5 9 5.5s6-1.5 9-5.5" />
      <path d="M6.5 13.5l-1.5 2M10 15.5l-.8 2.2M14 15.5l.8 2.2M17.5 13.5l1.5 2" />
    </>
  ),
  acne: (
    <>
      <path d="M12 3.5c-3 4-5.5 7-5.5 10a5.5 5.5 0 0 0 11 0c0-3-2.5-6-5.5-10z" />
      <circle cx="12" cy="13.5" r="2" fill="currentColor" fillOpacity="0.3" />
    </>
  ),
  ovulation: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.25" />
      <circle cx="12" cy="2.5" r="1" fill="currentColor" />
      <circle cx="12" cy="21.5" r="1" fill="currentColor" />
      <circle cx="2.5" cy="12" r="1" fill="currentColor" />
      <circle cx="21.5" cy="12" r="1" fill="currentColor" />
    </>
  ),
  sleep: (
    <>
      <path d="M18 11.5A7 7 0 0 1 10 4a7.5 7.5 0 1 0 8 7.5z" />
      <path d="M5 19.5h14a3 3 0 0 0 0-6 3.5 3.5 0 0 0-5.5-3 4 4 0 0 0-7 3.5A3 3 0 0 0 5 19.5z" fill="currentColor" fillOpacity="0.15" />
    </>
  ),
  stretch: <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-7 8c3-1 5-4 5-8 M19 12c-3-1-5-4-5-8 M5 19c4-1 7-4 7-8 M19 19c-4-1-7-4-7-8" />,
  tea: (
    <>
      <path d="M3.5 8h13v8a4 4 0 0 1-4 4h-5a4 4 0 0 1-4-4V8z" />
      <path d="M16.5 10h1.5a3 3 0 0 1 0 6h-1.5" />
      <path d="M7 2.5c0 2-1.5 2.5-1.5 4M11 2.5c0 2-1.5 2.5-1.5 4" />
    </>
  ),
  cravings: (
    <>
      <path d="M12 21c-4.5 0-7.5-3.5-7.5-8.5 0-3.5 2.5-6.5 5.5-7 .6 0 1.2.3 2 .3s1.4-.3 2-.3c3 .5 5.5 3.5 5.5 7 0 5-3 8.5-7.5 8.5z" />
      <path d="M12 5.5V2.5" />
      <circle cx="9.5" cy="12" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" />
    </>
  ),

  // Medications & Care Suite (Softer, High-Fidelity Professional)
  medPill: (
    <>
      <rect x="4.5" y="4.5" width="8" height="16" rx="4" transform="rotate(-45 8.5 12.5)" />
      <line x1="6.8" y1="17.2" x2="17.2" y2="6.8" strokeWidth="2" />
      <path d="M7 11.5a2.5 2.5 0 0 1 2.5-2.5" strokeOpacity="0.5" />
    </>
  ),
  medTablet: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="3.5" x2="12" y2="20.5" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="8.5" strokeDasharray="1 3" strokeOpacity="0.4" />
    </>
  ),
  medHerbal: (
    <>
      <path d="M19.5 4.5c-7.5 0-14 5-14 14 0 .5.5 1 1 1 9 0 14-6.5 14-14 0-.5-.5-1-1-1z" />
      <path d="M6.5 18.5c4-4 8-6 12-8" strokeWidth="1.6" />
    </>
  ),
  medTea: (
    <>
      <path d="M4 8.5h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M7.5 3c0 2-1.5 2.5-1.5 4M11.5 3c0 2-1.5 2.5-1.5 4" strokeLinecap="round" />
    </>
  ),
  medPatch: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="3" />
      <path d="M8 10c1-1 2-1 3 0s2 1 3 0M8 14c1-1 2-1 3 0s2 1 3 0" strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" fillOpacity="0.25" />
    </>
  ),
  medSupplement: (
    <>
      <ellipse cx="12" cy="12" rx="5" ry="8" transform="rotate(-30 12 12)" />
      <path d="M18.5 4.5v3m-1.5-1.5h3" strokeWidth="1.6" />
      <path d="M4.5 16.5v2.5m-1.2-1.2h2.5" strokeWidth="1.4" />
    </>
  ),
  medDropper: (
    <>
      <path d="M10.5 4.5l-6 6a3 3 0 0 0 4.2 4.2l6-6" />
      <path d="M14 8l2-2a2 2 0 0 1 2.8 2.8l-2 2" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </>
  ),

  // Phases & Helpers
  phaseMenstrual: (
    <>
      <path d="M12 2.6c3.8 4.2 6.5 7.8 6.5 11.4a6.5 6.5 0 0 1-13 0C5.5 10.4 8.2 6.8 12 2.6z" />
      <circle cx="12" cy="14" r="2.5" fill="currentColor" fillOpacity="0.25" />
    </>
  ),
  phaseFollicular: (
    <>
      <path d="M12 2a7 7 0 0 1 7 7c0 4-3.5 7.5-7 12-3.5-4.5-7-8-7-12a7 7 0 0 1 7-7z" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" fillOpacity="0.25" />
    </>
  ),
  phaseOvulatory: (
    <>
      <path d="M12 2l2.4 5.3 5.6.8-4 4.1 1 5.8-5-2.8-5 2.8 1-5.8-4-4.1 5.6-.8L12 2z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  phaseLuteal: (
    <>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <circle cx="15" cy="8.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </>
  ),

  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" strokeWidth="2" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="9.5" />,
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  trendingUp: (
    <>
      <path d="M22 6l-9.5 9.5-5-5L2 16" />
      <path d="M16 6h6v6" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 2.5v3m0 13v3m8.5-8.5h-3m-13 0h-3" />
      <path d="M18 6l-2.1 2.1M8.1 15.9L6 18m12 0l-2.1-2.1M8.1 8.1L6 6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.25" />
    </>
  )
};

export function Icon({ name, size = 20, className = "", color, ...props }) {
  const iconDef = ICONS[name];
  if (!iconDef) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`c-icon ${className}`}
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {typeof iconDef === "string" ? <path d={iconDef} /> : iconDef}
    </svg>
  );
}
