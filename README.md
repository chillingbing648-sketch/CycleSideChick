# CycleSideChick 🌸

> **A credible, evidence-based, privacy-first alternative to commercial cycle trackers. 100% on-device, zero trackers, zero telemetry, zero accounts required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI Tests](https://img.shields.io/badge/tests-22%20passing-brightgreen.svg)](./tests/)
[![Telemetry](https://img.shields.io/badge/telemetry-zero%20external%20calls-success.svg)](./docs/PRIVACY.md)
[![Bundle Size](https://img.shields.io/badge/bundle-98%20KB%20gzipped-success.svg)](./dist/)
[![PWA](https://img.shields.io/badge/PWA-offline%20ready-ff69b4.svg)](./public/manifest.webmanifest)
[![Clinical Grounding](https://img.shields.io/badge/clinical-ACOG%20%7C%20NICE%20%7C%20WHO-purple.svg)](./docs/CLINICAL_SOURCES.md)

---

![CycleSideChick Architecture & Core Capabilities](./public/cyclesidechick-infographic.svg)

---

## Why CycleSideChick?

Mainstream cycle and reproductive health tracking apps have repeatedly compromised user trust by selling biometric datasets, sharing sensitive period logs with third-party advertisers, and locking basic health insights behind exorbitant subscription paywalls.

**CycleSideChick** is built on a fundamentally different premise:
- **Your body biometrics stay on your device.** No remote database, no server syncing, no tracking pixels, and no ad networks.
- **Scientific humility.** Every prediction is an estimate, never a diagnosis. We never label any day as "safe" for contraception or infer pregnancy from a late period.
- **World-Class Editorial UI/UX.** Rebuilt in React 18+ and Vite with Design System v3: fluid typography (`Fraunces` + `Manrope`), plum-layered elevations, tactile spring motion, and responsive layouts across mobile, tablet dock, and desktop two-pane rails.
- **Complete, uncompromised feature parity.** Rich cycle engine, multi-mode tracking, interactive insights, on-device health assistant, clinical alerts, and clinician-ready exports—all free, open-source, and offline.

---

## Key Features

### 1. Cycle Engine v2
- **Recency-Weighted Mean:** Calculates period predictions using a decaying weight over the last 6 valid cycles (15–90 days).
- **Outlier Median Fallback:** Automatically switches to statistical median when cycles differ by $\ge 10$ days or when spread exceeds 12 days, preventing illness or travel disruptions from skewing predictions.
- **Confidence Scoring:** High, Moderate, or Low confidence labels with transparent explanations based on sample size and standard deviation.
- **Realistic Variability Ranges:** Displays period estimates as $\pm \max(1, \text{round}(SD))$, capped at $\pm 7$ days to prevent false precision.
- **Configurable Luteal Phase:** User-adjustable from 10 to 16 days (default 14).
- **Conflict Protection:** Prevents or flags double-logged period starts within 10 days of an existing period.

### 2. Six Tailored Tracking Modes
- **Natural Cycling:** Full cycle predictions, phase tracking, and estimated fertile windows.
- **Irregular Cycles:** Deactivates misleading fertile windows and focuses on cycle intervals and symptom patterns.
- **Hormonal Contraception:** Suppresses ovulation predictions and fertile windows; tracks withdrawal bleeds, spotting, pill intake adherence, and progestogenic side effects.
- **Trying to Conceive (TTC):** Elevates fertile window visibility, LH surge tracking, cervical mucus patterns, and basal body temperature (BBT).
- **Pregnancy:** Naegele's rule gestational age calculations, estimated due dates (EDD), trimester milestones, and prenatal check-in guidance.
- **Perimenopause:** STRAW+10 aligned tracking for cycle variability, vasomotor symptoms (hot flashes, night sweats), and sleep disruptions.

### 3. Granular Health & Symptom Logging
- **Flow & Spotting:** None, Spotting, Light, Medium, Heavy with liquid-fill visual cues.
- **Pain Slider:** Custom 0–10 rating scale with floating value bubble.
- **Discharge Consistency:** Dry, Sticky, Creamy, Watery, Egg-white.
- **Daily Factors:** Energy levels, sleep quality, medication & contraceptive pill logs, and 8-cup animated hydration tracker.

### 4. Interactive Insights & Trends
- **Cycle History Visualization:** Interactive SVG charts with touch/hover crosshair tooltips and ACOG physiological benchmark bands (21–35 days).
- **Symptom Correlation Matrix:** Horizontal percentage bars with rounded caps and 90-day aggregation.
- **FIGO Regularity Scoring:** Evidence-based classification of cycle length variation.

### 5. On-Device Local Health Assistant
- **100% Client-Side:** Rule-based health conversational interface operating strictly on the user's logged data.
- **Evidence-Based Answers:** Covers late cycles, PMS vs. pregnancy symptoms, fertile windows, cramps, heavy bleeding, and emergency contraception.
- **Clinician Escalation:** Always provides clear, non-alarmist paths to seek professional medical advice.

### 6. Evidence-Based Care Alerts & Clinician Reports
- **Clinical Red Flag Prompts:** Automatic alerts for secondary amenorrhea ($>90$ days), short cycle frequency ($<21$ days), prolonged bleeding ($>7$ days), heavy bleeding (soaking $\ge 1$ pad/hr for $2+$ hours), and severe dysmenorrhea ($\ge 8/10$).
- **Clinician Summary:** One-click copyable and `@media print` formatted summary designed for OB/GYN, midwife, or primary care triage.

### 7. Zero-Trust Privacy & Security
- **Salted SHA-256 PIN Lock:** Client-side biometric app lock powered by the browser's native Web Crypto API.
- **Privacy Ledger:** Transparent, local audit log recording every storage read, write, export, and migration.
- **Complete Data Sovereignty:** Instant JSON/CSV export, duplicate-safe import preview, and permanent one-click data erasure.
- **Offline PWA:** Installable Progressive Web App with service worker caching for 100% offline functionality.

---

## Comparison: CycleSideChick vs. Market Leaders

| Feature | Commercial Tracker (Flo) | Commercial Tracker (Clue) | CycleSideChick |
| :--- | :---: | :---: | :---: |
| **Pricing** | Free tier + \$40–\$60/yr paywall | Free tier + \$40/yr paywall | **100% Free & Open-Source** |
| **Data Storage** | Remote Cloud Database | Remote Cloud Database | **100% Local Hardware Storage** |
| **Account Required** | Mandatory | Mandatory | **No Account / Zero Sign-in** |
| **External Analytics & Ads** | Present (Adjust, AppsFlyer, etc.) | Present (Braze, Amplitude, etc.) | **Zero / None** |
| **Cycle Engine v2 (Median/Weighted)** | Proprietary Cloud Blackbox | Proprietary Cloud Algorithm | **Open-Source Transparent Math** |
| **Irregular & Contraceptive Modes** | Limited in free tier | Paid tier | **Included Out-of-the-Box** |
| **Local Health Assistant** | Cloud AI / Server Chat | N/A | **100% On-Device Rule Engine** |
| **Clinician Export** | Premium paywall | Premium paywall | **Free One-Click Printable / Copyable** |
| **Data Portability** | Manual request / CSV dump | CSV export | **Full JSON & CSV Export / Import** |

*For our full 4-column feature analysis, see [`docs/FEATURE_MATRIX.md`](./docs/FEATURE_MATRIX.md).*

---

## Quick Start / Local Development

CycleSideChick is built with **React 18+ and Vite** for fast HMR and minimal production bundle size ($\le 100\text{ KB}$ gzipped).

### Prerequisites
- Modern web browser (Chrome, Safari, Firefox, Edge) supporting ES6 modules and Web Crypto.
- Node.js ($\ge 18.0$) and npm.

### Installation & Development
1. Clone the repository:
   ```bash
   git clone https://github.com/chillingbing648-sketch/CycleSideChick.git
   cd CycleSideChick
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Build the production PWA bundle:
   ```bash
   npm run build
   ```
5. Preview the production build:
   ```bash
   npm run preview
   ```

### Running Tests
Execute the unit test suite verifying cycle math, leap-year rollovers, outlier detection, and clinical alerts:
```bash
npm test
```
All 22 unit tests run against `src/core/` and pass cleanly.

---

## Project Structure

```
CycleSideChick/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Automated test runner across Node 18, 20, 22
│       └── deploy.yml           # GitHub Pages deployment workflow (Vite build)
├── docs/
│   ├── CLINICAL_SOURCES.md      # ACOG, NICE, WHO, FSRH, NAMS citations
│   ├── DESIGN_SYSTEM.md         # Design System v3 specification & component guide
│   ├── FEATURE_MATRIX.md        # Comprehensive competitor gap analysis
│   ├── PARITY_REPORT.md         # 88-action parity verification report
│   ├── PRIVACY.md               # Privacy architecture and zero-telemetry guarantee
│   ├── THREAT_MODEL.md          # Formal threat modeling and security boundaries
│   └── screenshots/             # Baseline before, phase, and responsive screenshots
├── public/
│   ├── fonts/                   # Self-hosted Fraunces & Manrope variable fonts
│   ├── apple-touch-icon.png     # 180x180 iOS touch icon
│   ├── favicon.svg              # Vector bunny emblem favicon
│   ├── icon-192.png             # 192x192 PWA icon
│   ├── icon-512.png             # 512x512 PWA icon
│   ├── icon-maskable-512.png    # Maskable PWA icon with safe padding
│   └── manifest.webmanifest     # Standalone PWA webmanifest
├── src/
│   ├── app/
│   │   ├── actions.js           # 88 typed action handlers with View Transitions
│   │   ├── App.jsx              # Root app component & keyboard shortcuts
│   │   ├── AppShell.jsx         # Responsive desktop sidebar rail + mobile dock
│   │   └── store.js             # Reactive store via useSyncExternalStore
│   ├── components/ui/
│   │   ├── BunnyMascot.jsx      # Animated SVG brand mascot (blinks & ear tilts)
│   │   ├── Button.jsx           # Accessible button (loading spinner, success morph)
│   │   ├── Card.jsx             # Base, raised, hero ambient, glass, tinted cards
│   │   ├── Icon.jsx             # Complete 24x24 vector icon system
│   │   ├── primitives.css       # Design System v3 component primitives stylesheet
│   │   ├── SegmentedControl.jsx # Tactile sliding thumb selector (transform translateX)
│   │   ├── SheetModal.jsx       # Bottom sheet with pointer drag-to-dismiss & focus trap
│   │   ├── Slider.jsx           # Gradient track slider with live value bubble
│   │   ├── Toast.jsx            # Floating glass status pill with swipe-down dismiss
│   │   ├── ToggleChip.jsx       # Multi-select chip with tactile spring bounce
│   │   └── WaterCup.jsx         # Interactive liquid-rise SVG hydration tracker
│   ├── core/                    # Core clinical logic (frozen, tested, ES exported)
│   │   ├── assistant.js         # On-device rule-based health guidance assistant
│   │   ├── content.js           # 22 peer-reviewed health articles with sources
│   │   ├── engine.js            # Cycle calculations, statistical models, red flags
│   │   └── storage.js           # LocalStorage csc.v1 migration, crypto PIN, CSV I/O
│   ├── css/
│   │   ├── tokens.css           # OKLCH ramps, fluid type, plum elevations, glass tokens
│   │   ├── base.css             # Resets, touch targets, view transitions
│   │   ├── components.css       # Legacy & utility component classes
│   │   └── views.css            # Responsive layouts, desktop two-pane views, print styles
│   ├── features/                # Domain views & modals
│   │   ├── calendar/            # CalendarView, ConflictModal
│   │   ├── care/                # CareView, CareCustomModal, DeleteJournalModal
│   │   ├── home/                # HomeView, CycleRing, PartnerModal, PhaseTourModal
│   │   ├── insights/            # InsightsView, ClinicianModal
│   │   ├── library/             # ArticleModal
│   │   ├── lock/                # PinLockScreen
│   │   ├── log/                 # LogView
│   │   ├── onboarding/          # OnboardingFlow
│   │   ├── profile/             # ProfileSettingsSheet
│   │   └── styleguide/          # StyleguideView
│   ├── hooks/                   # Custom hooks (useDragToDismiss)
│   ├── index.html               # Vite HTML entry point with font preloads
│   └── main.jsx                 # React root mount & PWA service worker registration
├── tests/
│   ├── cycle_engine.test.js     # Comprehensive unit tests (22 tests)
│   └── test_runner.js           # Automated test harness
├── package.json                 # Project dependencies & npm scripts
├── vite.config.mjs              # Vite configuration (PWA, React, base path)
├── LICENSE                      # MIT License
├── SECURITY.md                  # Security policies and vulnerability disclosure
└── README.md                    # Project documentation
```

---

## Clinical Disclaimer

CycleSideChick is an educational and personal health logging tool. **It is not a medical device, diagnostic system, or contraceptive method.**
- Mathematical predictions of cycle phases, ovulation dates, and fertile windows are estimates with inherent statistical variance.
- Never rely on calendar calculations or fertility estimates to prevent pregnancy.
- If you experience acute pelvic pain, abnormally heavy bleeding, or medical concerns, please consult a qualified healthcare professional immediately.

---

## License

CycleSideChick is released under the [MIT License](./LICENSE).  
Copyright © 2026 CycleSideChick Contributors.
