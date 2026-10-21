# CycleSideChick — Threat Model & Security Posture

## 1. Overview & Context
Following post-Dobbs legal developments in the United States and increasing digital surveillance of reproductive choices worldwide, menstrual and cycle tracking applications face an unprecedented threat landscape. Traditional period apps that store user logs on centralized cloud databases expose users to:
1. State-level legal subpoenas and warrants for reproductive data.
2. Data breaches and unauthorized disclosures.
3. Secret selling or sharing of health intent data with advertising networks and data brokers.

CycleSideChick was engineered to provide **structural immunity** against these threats through an offline, on-device architecture.

---

## 2. Threat Vector Analysis & Mitigations

### Threat 1: Government Subpoenas & Cloud Data Seizure
- **Attack Vector:** Law enforcement or civil litigants serve legal process on app developers demanding user period dates, pregnancy test logs, or cycle histories.
- **Risk Level:** Critical.
- **CycleSideChick Mitigation:** **Architectural Impossibility.** CycleSideChick has no user accounts, no backend database, and no server logs. There is no remote data repository to subpoena. We cannot provide records we do not possess.

### Threat 2: Commercial Tracking & Ad Broker Profiling
- **Attack Vector:** In-app advertising SDKs, analytics trackers (e.g. Meta Pixel, Google Analytics, AppsFlyer), or diagnostic loggers correlate user IP addresses and device IDs with fertility status.
- **Risk Level:** High.
- **CycleSideChick Mitigation:** **Zero External Scripts.** CycleSideChick contains zero analytics packages, zero advertising frameworks, and zero external tracking calls. The PWA operates completely offline once installed.

### Threat 3: Physical Device Access & Shoulder Surfing
- **Attack Vector:** An abusive partner, family member, roommate, or unauthorized party accesses the user's unlocked device.
- **Risk Level:** High.
- **CycleSideChick Mitigation:**
  - **App PIN Lock:** An optional 4-digit PIN locks the interface. The PIN is verified client-side using a salted SHA-256 cryptographic hash (`crypto.subtle.digest`).
  - **Memory Erasure:** Plaintext PIN entries are never persisted in storage.

### Threat 4: Lock Screen Notification Leakage
- **Attack Vector:** Push notifications display sensitive cycle details (e.g., *"Period starts tomorrow"*, *"Ovulation window active"*) visible on locked device screens.
- **Risk Level:** Medium.
- **CycleSideChick Mitigation:**
  - **Discreet Notifications Toggle:** When enabled, notifications replace reproductive text with neutral, non-revealing phrasing (e.g., *"Gentle update from Bun"*).

### Threat 5: Coerced Partner Monitoring
- **Attack Vector:** A user is pressured to share their fertility or cycle status with a partner.
- **Risk Level:** Medium.
- **CycleSideChick Mitigation:**
  - **Local & Revocable Sharing:** CycleSideChick avoids shared cloud accounts. Partner sharing is strictly opt-in, generates a read-only snapshot excluding intimate journal notes, and can be revoked or regenerated at any time.

### Threat 6: Data Loss from Browser Cache Eviction
- **Attack Vector:** Browser updates, aggressive storage management, or private browsing modes clear `localStorage`.
- **Risk Level:** Medium.
- **CycleSideChick Mitigation:**
  - **Data Sovereign Portability:** Built-in one-tap CSV and JSON export tools encourage routine user-held backups.
  - **Corrupted Storage Recovery:** Automatic fallback to backup storage partitions prevents white-screen crashes if local storage is malformed.

### Threat 7: Software Supply Chain Compromise
- **Attack Vector:** Malicious dependencies in `node_modules` inject code to exfiltrate browser data.
- **Risk Level:** High.
- **CycleSideChick Mitigation:**
  - **Zero Runtime Dependencies:** CycleSideChick runs pure vanilla HTML, modern CSS, and ES JavaScript. There are zero runtime npm dependencies in production.

### Threat 8: Authentication Provider Surveillance
- **Attack Vector:** The OAuth identity provider (Google) attempts to link authentication events to reproductive health logs or search queries.
- **Risk Level:** High.
- **CycleSideChick Mitigation:**
  - **Strict Architectural Separation:** Google Identity Services (GIS) is used strictly for identity confirmation before granting browser access.
  - **Scope Minimization:** Only basic identity claims (`openid`, `email`, `profile`) are requested. No access is requested to Gmail, Drive, Calendar, or Google Fit.
  - **Zero Health Telemetry:** All cycle records, symptom logs, notes, and wellness data reside strictly in `localStorage["csc.v1"]`. Health data is never transmitted to Google, attached to OAuth state, or written to tokens.

### Threat 9: Static Client-Side Execution Boundaries
- **Attack Vector:** A user or attacker with access to browser developer tools modifies client-side JavaScript to bypass the authentication gate.
- **Risk Level:** Low / Technical Limitation of Static Hosting.
- **CycleSideChick Mitigation & Transparent Disclosure:**
  - On static GitHub Pages hosting, all code executes client-side. The client validates JWT signatures and claims via Google's official `tokeninfo` verification endpoint.
  - Static frontends cannot securely store server-side secrets or enforce zero-trust backend authorization without a backend. Deployers requiring server-grade access verification can configure a private backend endpoint (`CSC_CONFIG.BACKEND_VERIFY_URL`).
  - To protect physical device access, CycleSideChick supports an independent salted SHA-256 PIN Lock.

---

## 3. Residual Risks & User Guidance
- **Operating System Backups:** If your browser data is synced to an unencrypted cloud account (such as browser account cloud sync), that browser sync might contain local storage snapshots. Users concerned about cloud sync should disable browser profile sync or use private device profiles.
- **Device Malware:** A compromised device infected with keyloggers or screen recorders can capture on-screen information. Users should maintain strong device-level screen locks and operating system security updates.
