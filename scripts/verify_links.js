const fs = require("fs");
const path = require("path");

const distHtml = fs.readFileSync(path.join("dist", "index.html"), "utf8");
console.log("--- DIST INDEX.HTML ---\n" + distHtml + "\n-----------------------");

// Extract all href and src
const regex = /(?:href|src)=["']([^"']+)["']/g;
let match;
let errors = 0;
while ((match = regex.exec(distHtml)) !== null) {
  const url = match[1];
  if (url.startsWith("http")) continue;
  const cleaned = url.replace(/^\.\//, "");
  const filePath = path.join("dist", cleaned);
  if (!fs.existsSync(filePath)) {
    console.error("✗ MISSING FILE:", url, "-> looked for", filePath);
    errors++;
  } else {
    console.log("✓ Found asset:", url, "->", filePath);
  }
}

// Check CSS fonts
const distAssets = fs.readdirSync(path.join("dist", "assets"));
const cssFile = distAssets.find(f => f.endsWith(".css"));
if (cssFile) {
  const css = fs.readFileSync(path.join("dist", "assets", cssFile), "utf8");
  const fontRegex = /url\(([^)]+)\)/g;
  let fontMatch;
  while ((fontMatch = fontRegex.exec(css)) !== null) {
    let fontUrl = fontMatch[1].replace(/['"]/g, "").trim();
    if (fontUrl.startsWith("data:") || fontUrl.startsWith("http")) continue;
    const cleanedFont = fontUrl.replace(/^\.\//, "");
    const fontPath = path.join("dist", "assets", cleanedFont);
    if (!fs.existsSync(fontPath)) {
      console.error("✗ MISSING FONT IN CSS:", fontUrl, "-> looked for", fontPath);
      errors++;
    } else {
      console.log("✓ Found CSS font:", fontUrl);
    }
  }
}

if (errors === 0) {
  console.log("\nALL ASSET LINKS AND FONTS IN DIST RESOLVE ACCURATELY!");
} else {
  console.error("\nFOUND " + errors + " BROKEN LINKS!");
  process.exit(1);
}
