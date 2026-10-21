# CycleSideChick — Google OAuth 2.0 & Identity Services Setup Guide

This guide provides step-by-step instructions for creating and configuring an authorized **OAuth 2.0 Web Client ID** in Google Cloud Console for CycleSideChick.

---

## 1. Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with the Google account that will manage the deployment.
3. In the project drop-down menu at the top of the page, click **New Project**.
4. Name the project (e.g. `CycleSideChick-Auth`) and click **Create**.

---

## 2. Configure the OAuth Consent Screen
1. In the Google Cloud navigation menu (☰), go to **APIs & Services** > **OAuth consent screen**.
2. Select user type:
   - **External** (standard for open public web applications).
   - Click **Create**.
3. Fill in the App Information:
   - **App name:** `CycleSideChick`
   - **User support email:** Your contact or support email.
   - **App logo:** (Optional) Use `public/favicon.svg` or brand mark.
   - **Application home page:** `https://chillingbing648-sketch.github.io/CycleSideChick/`
   - **Privacy Policy link:** `https://chillingbing648-sketch.github.io/CycleSideChick/docs/PRIVACY.md`
   - **Developer contact information:** Your email address.
4. Scopes:
   - Click **Add or Remove Scopes**.
   - Select only basic identity scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - **IMPORTANT:** Do NOT request sensitive or restricted scopes (such as Google Drive, Gmail, Google Fit, Calendar, or Contacts). CycleSideChick strictly enforces data minimization and requires only identity proof.
5. Publishing status:
   - In "Testing" mode, add your test Google email addresses under **Test users**.
   - When ready for general public use, click **Publish App** to switch to "In production".

---

## 3. Create an OAuth 2.0 Web Application Client ID
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top of the page and select **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Set the **Name** (e.g., `CycleSideChick Web Client`).

---

## 4. Configure Authorized JavaScript Origins
Google Identity Services (GIS) requires exact origin matching for security. Add the following origins under **Authorized JavaScript origins**:

### Production Origin:
```
https://chillingbing648-sketch.github.io
```
*(Note: Do not include trailing slashes or subpaths like `/CycleSideChick/` in the origin field; Google requires the origin scheme + host + port only).*

### Development / Local Origins:
Add any local development ports you use (never use wildcards like `*`):
```
http://localhost:8080
http://127.0.0.1:8080
http://localhost:3000
http://localhost:5000
http://127.0.0.1:5500
```

---

## 5. Authorized Redirect URIs
- For the Google Identity Services popup/button flow (`google.accounts.id.renderButton` / `ux_mode: "popup"`), **Authorized redirect URIs are not required**.
- Leave Authorized redirect URIs empty unless you specifically deploy a server-side redirect authorization flow.

---

## 6. Where and How to Configure the Client ID in CycleSideChick
Once created, Google Cloud Console provides your OAuth 2.0 Web Client ID (ending in `.apps.googleusercontent.com`).

You can configure your Client ID in **any** of the following four locations (in priority order):

### Option A: `src/js/config.js` (Recommended for custom fork deployments)
Open `src/js/config.js` and set your Client ID in the placeholder:
```javascript
const DEFAULT_CLIENT_ID = "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com";
```
Then re-bundle the application:
```bash
npm run build
```

### Option B: HTML `<meta>` tag (Zero rebuild)
Add the following meta tag in `index.html` (inside `<head>`):
```html
<meta name="google-signin-client_id" content="YOUR_CLIENT_ID_HERE.apps.googleusercontent.com">
```

### Option C: In-App Development Override
When opening CycleSideChick in a browser while unconfigured, the Authentication Gate displays a direct input field:
1. Paste your `YOUR_CLIENT_ID.apps.googleusercontent.com`.
2. Click **Save Client ID & Launch GIS**.
3. CycleSideChick stores this in `localStorage["csc.oauth_client_id"]` for your local browser session and initializes Google Identity Services immediately.

---

## 7. Public Identifiers vs. Secret Credentials
| Credential | Public or Secret? | Safe to commit to Git? | Purpose |
| :--- | :--- | :--- | :--- |
| **OAuth Web Client ID** (`...apps.googleusercontent.com`) | **Public Identifier** | **Yes** | Identifies your application origin to Google in frontend JavaScript. |
| **OAuth Client Secret** | **CONFIDENTIAL SECRET** | **NO (NEVER COMMIT)** | Used ONLY by confidential backend servers. **Web application GIS frontend flows never use or store client secrets.** |
| **Service Account Keys (`.json`)** | **CONFIDENTIAL SECRET** | **NO (NEVER COMMIT)** | Provides programmatic administrative access to Google Cloud resources. Never put in client code. |

---

## 8. HTTPS and Security Architecture
- Google Identity Services requires an **HTTPS** origin in production. GitHub Pages automatically serves over HTTPS at `https://chillingbing648-sketch.github.io`.
- During local testing, `http://localhost` and `http://127.0.0.1` are permitted by Google without SSL certificates.
- **Static Frontend Architecture Notice:** Static GitHub Pages hosting executes in the client browser. CycleSideChick validates tokens using:
  1. Strict structural JWT validation (issuer, audience matching client ID, expiration).
  2. Direct verification via Google's token verification API (`https://oauth2.googleapis.com/tokeninfo?id_token=...`).
  3. Optional custom backend verification endpoint (`CSC_CONFIG.BACKEND_VERIFY_URL`) if attached to a Cloudflare Worker, Vercel Serverless Function, or Node.js server.
- **Data Privacy Guarantee:** Under all circumstances, menstrual cycle logs, fertility records, and health data remain strictly on-device in `localStorage["csc.v1"]` and are **never** transmitted to Google, the backend, or any remote server.
