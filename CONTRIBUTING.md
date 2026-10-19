# Contributing to CycleSideChick

Thank you for your interest in contributing to CycleSideChick! We welcome contributions that improve reproductive health tracking accuracy, privacy guarantees, accessibility, and user experience.

---

## 1. Core Principles & Non-Negotiables

Before submitting code, ensure your changes adhere to our core design invariants:

1. **Zero External Tracking:** No telemetry, analytics SDKs, advertising beacons, or external health APIs. Everything must execute locally on the user's client hardware.
2. **Zero Runtime Dependencies:** Production code uses clean, native Web APIs (Vanilla HTML5, modern CSS with tokens, and ES6+ JavaScript modules). Node is used only for development testing (`npm test`).
3. **Clinical Humility:** All cycle, ovulation, and fertility calculations are mathematical estimates, never diagnoses. The UI must explicitly state this. Never label any calendar day as "safe" or infer pregnancy from a late period.
4. **Data Continuity:** Backward compatibility for `localStorage["csc.v1"]` must be preserved. Any schema change must include an automatic migration step in `src/js/storage.js`.
5. **Design System Integrity:** Maintain the **Manrope** typography hierarchy, the soft blush/berry palette with accessible semantic tints ($\ge 4.5:1$ contrast ratio), and the subtle bunny brand emblem.

---

## 2. Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cyclesidechick.git
   cd cyclesidechick
   ```

2. **Run locally:**
   Because CycleSideChick is a static client application, you can serve it with any local static HTTP server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
   Open `http://localhost:8080` in your web browser.

3. **Run the test suite:**
   Ensure Node.js ($\ge 18$) is installed:
   ```bash
   npm test
   ```
   All 10 unit tests in `tests/cycle_engine.test.js` must pass before opening a PR.

---

## 3. Adding New Features or Health Insights

- **Mathematical Engine Changes:** Modify `src/js/engine.js`. If you add new cycle calculation methods, include unit tests covering standard cases, edge cases (leap years, month rollovers), and clinical red flags in `tests/cycle_engine.test.js`.
- **Clinical Validation:** Any new health recommendation, symptom alert, or educational piece must cite peer-reviewed clinical guidelines (ACOG, NICE, WHO, FSRH, NAMS, etc.) and be added to [`docs/CLINICAL_SOURCES.md`](./docs/CLINICAL_SOURCES.md).
- **CSS Styling:** Follow the CSS custom properties in `src/css/tokens.css`. Never use `!important` on fonts or hardcode theme colors directly into element selectors. Verify contrast in both light and dark themes.

---

## 4. Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new user-facing feature or calculation mode (e.g., `feat: add basal body temperature biphasic trend detection`)
- `fix:` A bug fix (e.g., `fix: correct leap day cycle calculation across Feb 29`)
- `docs:` Documentation only changes (e.g., `docs: cite NICE NG88 in clinical sources`)
- `style:` Changes that do not affect the meaning of the code (formatting, tokens)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Maintenance tasks, build tooling, or workflow updates

---

## 5. Pull Request Checklist

Before submitting a Pull Request, please ensure:

- [ ] `npm test` passes with zero errors.
- [ ] Browser console produces zero unhandled exceptions or warnings.
- [ ] Network tab in browser DevTools confirms zero outbound requests to external servers during user logging.
- [ ] Accessibility: Interactive elements have $\ge 44 \times 44\text{px}$ touch targets, focus visible outlines, and $\ge 4.5:1$ contrast.
- [ ] No personal health data is exposed in test fixtures or pull request screenshots.
- [ ] Documentation has been updated to reflect new features or clinical parameters.
