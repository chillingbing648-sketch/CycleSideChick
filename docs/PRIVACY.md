# CycleSideChick — Privacy Policy

**Effective Date:** October 20, 2026  
**Status:** Canonical & Binding Open-Source Policy  

---

## 1. Core Commitment: Zero Cloud Health Data, Privacy-First Architecture
CycleSideChick is designed from the ground up as a **100% on-device health application**. We believe reproductive and menstrual health data is deeply personal and should never be commodified, collected, analyzed, or shared by third-party intermediaries.

- **No Remote Health Databases:** CycleSideChick does not maintain, communicate with, or operate any user health database or remote cloud storage for your medical data.
- **Mandatory Google Identity Gate:** Google Sign-In (via Google Identity Services) is used strictly as an identity verification access gate for opening the application in your browser. Basic profile information (name, email) is used solely to confirm authentication.
- **Zero Health Data Transmission to Google:** Menstrual dates, symptom logs, fertility notes, BBT measurements, sexual activity, pain ratings, and pregnancy records are **NEVER** sent to Google, cloud servers, or third-party intermediaries.
- **No Third-Party Analytics or Advertising SDKs:** There are zero telemetry libraries, tracking scripts, conversion pixels, advertising identifiers, or analytics trackers embedded in our code.
- **No Remote Health Telemetry:** It is architecturally impossible for us or Google to access, sell, or disclose your reproductive records because health data is never transmitted across the network.

---

## 2. Where and How Your Data Is Stored
All data you enter into CycleSideChick is stored exclusively in your local device's browser memory:
1. **`localStorage["csc.v1"]`**: Contains your period start and end dates, daily wellness logs (flow, mood, pain, symptoms, sleep, hydration, medications, BBT, LH test), and user configuration.
2. **`localStorage["csc.v1.backup"]`**: A local safety copy created prior to schema migrations to prevent data loss.
3. **`localStorage["csc.pin.salt"]` & `localStorage["csc.pin.hash"]`**: When the optional App PIN Lock is enabled, this stores a random 16-byte salt and the SHA-256 hash of your passcode. Your raw PIN is never stored.
4. **`localStorage["csc.oauth_client_id"]`**: (Optional) Stores a custom OAuth Client ID override if entered for local development.
5. **`sessionStorage["csc.auth_session"]`**: Ephemeral authentication session state (Google user ID, email, token expiration timestamp). This is cleared when the browser tab is closed and is completely isolated from health records.
6. **CacheStorage (`cyclesidechick-v2.1.0`)**: Stores static HTML, CSS, JavaScript, and SVG assets so CycleSideChick can operate offline as a Progressive Web App (PWA). Google authentication scripts are never cached in CacheStorage.

You can inspect the exact size and contents of every stored key at any time using the in-app **Privacy Ledger** in Profile & Settings.

---

## 2.1 Shared Device Notice
Because CycleSideChick preserves your reproductive health records locally on your device in your browser profile, anyone with physical access to your device and browser profile can view existing records after signing into Google. For enhanced multi-user physical device protection, you can activate the optional **4-Digit PIN Lock** in Profile & Settings.

---

## 3. Data Portability & Deletion
You retain complete, sovereign ownership of your data at all times:
- **Exporting Data:** You can export your complete records as a standardized `.csv` file (for spreadsheets or clinician review) or as a structured `.json` backup file.
- **Importing Data:** You can restore or migrate records between devices using the local Import tool with duplicate preview.
- **Cryptographic Wipe:** Tapping "Delete All Records" in Settings immediately deletes all local storage keys and cache partitions, wiping your records from the browser.

---

## 4. Notifications & Reminders
- In-app reminders run locally inside your browser tab.
- When browser notifications are enabled, alerts are generated locally by your browser or the local Service Worker.
- CycleSideChick offers an optional **Discreet Notification** mode that replaces period and symptom reminder text with gentle, neutral wording (e.g. *"Gentle update from Bun"*) to safeguard your privacy on lock screens.

---

## 5. Partner Share
The optional Partner Share feature generates a local, read-only summary on your device. It does not create cloud accounts, does not relay data through remote servers, and can be revoked or regenerated at any time.

---

## 6. Regulatory Stance & Questions
CycleSideChick complies with the highest international privacy principles, including the European Union General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), by practicing complete data minimization: we collect zero personal data.

For questions, audit inquiries, or open-source verification, review our source code on GitHub.
