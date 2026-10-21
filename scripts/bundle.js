/**
 * CycleSideChick — Bundler Script
 * Compiles modular CSS and JS into the standalone portable CycleSideChick.html
 * Zero external runtime dependencies.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const tokens = fs.readFileSync(path.join(root, "src/css/tokens.css"), "utf8");
const base = fs.readFileSync(path.join(root, "src/css/base.css"), "utf8");
const comp = fs.readFileSync(path.join(root, "src/css/components.css"), "utf8");
const views = fs.readFileSync(path.join(root, "src/css/views.css"), "utf8");

const engine = fs.readFileSync(path.join(root, "src/js/engine.js"), "utf8");
const storage = fs.readFileSync(path.join(root, "src/js/storage.js"), "utf8");
const content = fs.readFileSync(path.join(root, "src/js/content.js"), "utf8");
const assistant = fs.readFileSync(path.join(root, "src/js/assistant.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "src/js/ui.js"), "utf8");
const app = fs.readFileSync(path.join(root, "src/js/app.js"), "utf8");

// Embedded assets for 100% self-contained standalone distribution
const favicon = fs.readFileSync(path.join(root, "public/favicon.svg"), "utf8");
const faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(favicon).toString("base64")}`;

const infographic = fs.readFileSync(path.join(root, "public/cyclesidechick-infographic.svg"), "utf8");
const infographicDataUri = `data:image/svg+xml;base64,${Buffer.from(infographic).toString("base64")}`;

// Inline asset paths in bundled app script
const bundledApp = app
  .replace(/\.\/public\/cyclesidechick-infographic\.svg/g, infographicDataUri)
  .replace(/\.\/public\/favicon\.svg/g, faviconDataUri);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FAF5F7" id="meta-theme">
<title>CycleSideChick — Cycle &amp; Wellness Companion</title>
<link rel="icon" id="fv" type="image/svg+xml" href="${faviconDataUri}">
<link rel="manifest" href="./manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<style>
${tokens}

${base}

${comp}

${views}
</style>
</head>
<body>
<div id="app"></div>
<div id="toast" role="status" aria-live="polite"></div>
<script>
${engine}

${storage}

${content}

${assistant}

${ui}

${bundledApp}

// PWA Service Worker Registration with automatic update checking
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(reg => {
      reg.update().catch(() => {});
    }).catch(err => {
      console.warn("ServiceWorker skipped:", err);
    });
  });
}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "CycleSideChick.html"), html, "utf8");
console.log(`[CycleSideChick] Standalone bundle generated: CycleSideChick.html (${(html.length / 1024).toFixed(1)} KB)`);
