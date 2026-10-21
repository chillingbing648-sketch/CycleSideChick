# CycleSideChick 🌸

> **A credible, evidence-based, privacy-first alternative to commercial cycle trackers. 100% on-device, zero trackers, zero telemetry, zero accounts required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen.svg)](./tests/)
[![Auth](https://img.shields.io/badge/auth-Google%20GIS%20verified-4285F4.svg)](./docs/GOOGLE_OAUTH_SETUP.md)
[![Privacy](https://img.shields.io/badge/health%20data-100%25%20on--device-success.svg)](./docs/PRIVACY.md)
[![PWA](https://img.shields.io/badge/PWA-offline%20ready-ff69b4.svg)](./manifest.webmanifest)
[![Clinical Grounding](https://img.shields.io/badge/clinical-ACOG%20%7C%20NICE%20%7C%20WHO-purple.svg)](./docs/CLINICAL_SOURCES.md)

---

![CycleSideChick Architecture & Core Capabilities](./public/cyclesidechick-infographic.svg)

---

## Why CycleSideChick?

Mainstream cycle and reproductive health tracking apps have repeatedly compromised user trust by selling biometric datasets, sharing sensitive period logs with third-party advertisers, and locking basic health insights behind exorbitant subscription paywalls.

**CycleSideChick** is built on a fundamentally different premise:
- **Your body biometrics stay on your device.** No remote database, no server syncing, no tracking pixels, and no ad networks.
- **Scientific humility.** Every prediction is an estimate, never a diagnosis. We never label any day as "safe" for contraception or infer pregnancy from a late period.
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
- **Flow & Spotting:** None, Spotting, Light, Medium, Heavy, and Very Heavy.
- **Pain Slider:** 0–10 numeric rating scale with cramping location tags.
- **Discharge Consistency:** Dry, Sticky, Creamy, Watery, Egg-white.
- **Vitals & Labs:** Basal Body Temperature (°F/°C), LH test strips (+/-), Pregnancy tests (+/-).
- **Daily Factors:** Energy levels, sleep quality, medication & contraceptive pill logs, and 8-level semantic hydration tracker.

### 4. Interactive Insights & Trends
- **Cycle History Visualization:** Bar charts depicting recent cycle lengths against typical benchmarks (21–35 days).
- **Symptom Frequency Heatmap:** Breakdowns of logged symptoms by cycle day and follicular vs. luteal phases.
- **"Compare to Your Usual":** Real-time baseline comparison contextualizing current symptoms against historical norms.

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

CycleSideChick has **zero production dependencies** and requires no build pipeline.

### Prerequisites
- Modern web browser (Chrome, Safari, Firefox, Edge) supporting ES6 modules and Web Crypto.
- Node.js ($\ge 18.0$) for running automated tests.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cyclesidechick.git
   cd cyclesidechick
   ```
2. Serve the static files with any local HTTP server:
   ```bash
   # Using npx serve:
   npx serve .

   # Or using Python:
   python3 -m http.server 8080
   ```
3. Open your browser to `http://localhost:8080`.

### Running Tests
Execute the automated test suite verifying cycle math, leap-year rollovers, outlier detection, and clinical alerts:
```bash
npm test
```

---

## Project Structure

```
cyclesidechick/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       ├── ci.yml               # Automated test runner across Node 18, 20, 22
│       └── deploy.yml           # GitHub Pages deployment workflow
├── docs/
│   ├── CLINICAL_SOURCES.md      # ACOG, NICE, WHO, FSRH, NAMS citations
│   ├── FEATURE_MATRIX.md        # Comprehensive competitor gap analysis
│   ├── GOOGLE_OAUTH_SETUP.md    # Google Cloud OAuth 2.0 Web Client configuration guide
│   ├── PRIVACY.md               # Privacy architecture and zero-telemetry guarantee
│   └── THREAT_MODEL.md          # Formal threat modeling and security boundaries
├── public/
│   └── favicon.svg              # Vector bunny emblem favicon
├── src/
│   ├── css/
│   │   ├── tokens.css           # 8 semantic tints, dark theme, typography tokens
│   │   ├── base.css             # Resets, accessibility focus, touch targets
│   │   ├── components.css       # Cards, cycle ring SVG, week strip, buttons
│   │   └── views.css            # Auth gate, assistant, library, PIN keypad, print styles
│   └── js/
│       ├── config.js            # OAuth 2.0 client configuration & authorized origins
│       ├── auth.js              # Google Identity Services (GIS) auth controller & session
│       ├── engine.js            # Cycle calculations, statistical models, red flags
│       ├── storage.js           # LocalStorage v2 migration, crypto PIN, CSV I/O
│       ├── content.js           # 22 peer-reviewed health articles with sources
│       ├── assistant.js         # On-device rule-based health guidance assistant
│       ├── ui.js                # Shared DOM components, avatars, icons
│       └── app.js               # Main tab controller & state-preserving DOM router
├── tests/
│   ├── auth.test.js             # GIS token validation, session isolation & security tests
│   ├── cycle_engine.test.js     # Comprehensive cycle calculation unit tests
│   └── test_runner.js           # Automated test harness
├── index.html                   # Modern modular PWA entry point
├── manifest.webmanifest         # Standalone PWA manifest
├── sw.js                        # Offline service worker
├── package.json                 # Project metadata & test scripts
├── LICENSE                      # MIT License
├── SECURITY.md                  # Security policies and vulnerability disclosure
├── CONTRIBUTING.md              # Contributor guidelines and standards
├── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
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
