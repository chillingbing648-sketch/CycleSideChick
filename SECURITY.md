# Security Policy & Vulnerability Disclosure

CycleSideChick is designed as an open-source, privacy-first reproductive health application. The security and confidentiality of reproductive health biometrics are core design criteria.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

---

## Security Architecture & Invariants

1. **Zero Network Transmission:** CycleSideChick executes 100% on-device in the user's browser. It has no remote backend API, no tracking beacons, no analytics SDKs, and makes zero network requests for health logging.
2. **Local Storage Isolation:** All period logs, symptoms, medications, and settings are stored locally in the browser's `localStorage["csc.v1"]`.
3. **Application PIN Protection:** If enabled, the app PIN is hashed using a browser-native Web Crypto API salted SHA-256 digest (`crypto.subtle.digest("SHA-256", ...)`). The plaintext PIN is never stored.
4. **Zero Runtime Dependencies:** Production code uses vanilla HTML5, CSS3, and ES6+ JavaScript. No third-party runtime npm packages are imported or executed.

---

## Threat Model & Boundaries

Please read our full threat analysis in [`docs/THREAT_MODEL.md`](./docs/THREAT_MODEL.md).

### In-Scope Threats
- Algorithmic leaks or potential unintended cross-origin leaks.
- Cross-Site Scripting (XSS) vectors that could permit unauthorized access to `localStorage`.
- Storage corruption leading to unrecoverable data loss.
- Improper data parsing during CSV/JSON import routines.

### Out-of-Scope Threats
- Physical extraction from an unlocked device or an unencrypted filesystem.
- Malicious browser extensions possessing unrestricted storage read permissions.
- Operating system keyloggers or compromised device kernels.

---

## Reporting a Vulnerability

If you discover a security vulnerability or privacy leak within CycleSideChick, please **do not open a public GitHub issue**.

Instead, please report the vulnerability privately:
1. Open a **Private Security Advisory** via GitHub's "Report a vulnerability" button in the **Security** tab of the repository.
2. Alternatively, email the maintainers with the prefix `[SECURITY VULNERABILITY]` in the subject line.

### Please include in your report:
- A description of the vulnerability and its potential impact.
- Step-by-step instructions or proof-of-concept code to reproduce the issue.
- Details regarding browser version and environment.

### Our Commitment:
- We acknowledge receipt of vulnerability reports within 48 hours.
- We will provide a timeline for remediation and coordinate disclosure following a verified fix.
- Security fixes will be released as patch updates with accompanying release notes.
