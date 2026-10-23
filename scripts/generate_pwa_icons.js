const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const DIST_DIR = path.join(REPO_ROOT, 'dist');

const BUNNY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <radialGradient id="bunnyGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDEBF2" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#FAF5F7" stop-opacity="1" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#FAF5F7" />
  <circle cx="50" cy="50" r="46" fill="url(#bunnyGlow)" />
  <g stroke="#481930" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Ear -->
    <path d="M40 45 C35 24 30 14 36 10 C42 6 47 18 45 42" fill="#FDF9FA" />
    <path d="M38 38 C36 26 34 18 37 14 C40 12 43 20 42 36" fill="#FBE3EA" stroke="none" />
    <!-- Right Ear -->
    <path d="M60 45 C65 24 70 14 64 10 C58 6 53 18 55 42" fill="#FDF9FA" />
    <path d="M62 38 C64 26 66 18 63 14 C60 12 57 20 58 36" fill="#FBE3EA" stroke="none" />
    <!-- Head / Face -->
    <ellipse cx="50" cy="62" rx="30" ry="24" fill="#FDF9FA" />
    <!-- Cheeks Blush -->
    <circle cx="34" cy="65" r="5" fill="#FBE3EA" stroke="none" opacity="0.85" />
    <circle cx="66" cy="65" r="5" fill="#FBE3EA" stroke="none" opacity="0.85" />
    <!-- Eyes -->
    <path d="M37 58 Q41 55 45 58" fill="none" stroke="#481930" stroke-width="2.6" />
    <path d="M55 58 Q59 55 63 58" fill="none" stroke="#481930" stroke-width="2.6" />
    <!-- Nose & Mouth -->
    <path d="M48 64 Q50 62 52 64 L50 67 Z" fill="#D9447E" stroke="none" />
    <path d="M47 69 Q50 71 53 69" fill="none" stroke="#481930" stroke-width="2" />
  </g>
</svg>
`;

// Maskable icon has 10% safe zone padding
const BUNNY_SVG_MASKABLE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" fill="#FAF5F7" />
  <g transform="translate(10, 10) scale(0.8)">
    <circle cx="50" cy="50" r="46" fill="#FDEBF2" />
    <g stroke="#481930" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 45 C35 24 30 14 36 10 C42 6 47 18 45 42" fill="#FDF9FA" />
      <path d="M38 38 C36 26 34 18 37 14 C40 12 43 20 42 36" fill="#FBE3EA" stroke="none" />
      <path d="M60 45 C65 24 70 14 64 10 C58 6 53 18 55 42" fill="#FDF9FA" />
      <path d="M62 38 C64 26 66 18 63 14 C60 12 57 20 58 36" fill="#FBE3EA" stroke="none" />
      <ellipse cx="50" cy="62" rx="30" ry="24" fill="#FDF9FA" />
      <circle cx="34" cy="65" r="5" fill="#FBE3EA" stroke="none" opacity="0.85" />
      <circle cx="66" cy="65" r="5" fill="#FBE3EA" stroke="none" opacity="0.85" />
      <path d="M37 58 Q41 55 45 58" fill="none" stroke="#481930" stroke-width="2.6" />
      <path d="M55 58 Q59 55 63 58" fill="none" stroke="#481930" stroke-width="2.6" />
      <path d="M48 64 Q50 62 52 64 L50 67 Z" fill="#D9447E" stroke="none" />
      <path d="M47 69 Q50 71 53 69" fill="none" stroke="#481930" stroke-width="2" />
    </g>
  </g>
</svg>
`;

async function generate() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const icons = [
    { name: 'icon-192.png', size: 192, svg: BUNNY_SVG },
    { name: 'icon-512.png', size: 512, svg: BUNNY_SVG },
    { name: 'icon-maskable-512.png', size: 512, svg: BUNNY_SVG_MASKABLE },
    { name: 'apple-touch-icon.png', size: 180, svg: BUNNY_SVG }
  ];

  for (const item of icons) {
    const page = await browser.newPage();
    await page.setViewport({ width: item.size, height: item.size, deviceScaleFactor: 1 });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${item.svg}</body></html>`);

    const outPublic = path.join(PUBLIC_DIR, item.name);
    await page.screenshot({ path: outPublic, omitBackground: false });

    // Also copy to dist if dist exists
    if (fs.existsSync(DIST_DIR)) {
      const outDist = path.join(DIST_DIR, item.name);
      fs.copyFileSync(outPublic, outDist);
    }

    console.log(`Generated ${item.name} (${item.size}x${item.size})`);
    await page.close();
  }

  await browser.close();
  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
