const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 8877;
const REPO_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const PROJECT_OUT = path.join(REPO_ROOT, 'docs', 'screenshots', 'phase1');
const ARTIFACT_OUT = 'C:\\Users\\PRATEEK DUBEY\\.gemini\\antigravity\\brain\\7e9f3b3a-058f-4ecb-b32a-3f82164e6f3d\\screenshots\\phase1';

fs.mkdirSync(PROJECT_OUT, { recursive: true });
fs.mkdirSync(ARTIFACT_OUT, { recursive: true });

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
};

// Static server for dist
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.startsWith('/CycleSideChick/')) {
    reqPath = reqPath.slice('/CycleSideChick/'.length);
  }
  if (reqPath === '/' || reqPath === '') reqPath = 'index.html';
  const filePath = path.join(DIST_DIR, reqPath.replace(/^\//, ''));

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Fallback to index.html for SPA
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

// Seed data
function getRichState(theme = 'light') {
  return {
    _v: 2,
    ob: 1,
    cl: 28,
    pl: 5,
    ll: 14,
    reg: 'regular',
    mode: 'natural',
    goals: ['cycle', 'symptoms'],
    theme: theme,
    motion: 1,
    haptics: 1,
    showFertile: 1,
    careAlerts: 1,
    waterGoal: 1,
    periods: [
      { s: '2026-05-18', e: '2026-05-22' },
      { s: '2026-06-15', e: '2026-06-19' },
      { s: '2026-07-13', e: '2026-07-17' },
      { s: '2026-08-10', e: '2026-08-14' },
      { s: '2026-09-07', e: '2026-09-11' },
      { s: '2026-10-05', e: '2026-10-09' }
    ],
    logs: {
      '2026-10-21': { f: 0, m: 0, p: 0, water: 6, cm: 'ewcm', sym: ['libido_high'], note: 'Feeling great!' }
    },
    journal: {},
    careKit: []
  };
}

async function capture() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function takeScreenshot(name, { width, height, theme }) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/CycleSideChick/`, { waitUntil: 'networkidle0' });

    await page.evaluate((th, state) => {
      localStorage.setItem('csc.v1', JSON.stringify(state));
      document.documentElement.dataset.theme = th;
    }, theme, getRichState(theme));

    await page.goto(`http://localhost:${PORT}/CycleSideChick/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    const projPath = path.join(PROJECT_OUT, `${name}.png`);
    const artPath = path.join(ARTIFACT_OUT, `${name}.png`);
    const buf = await page.screenshot({ fullPage: false });
    fs.writeFileSync(projPath, buf);
    fs.writeFileSync(artPath, buf);
    console.log(`Saved screenshot: ${name}.png (${width}x${height})`);
  }

  // 1. Mobile (375x812)
  await takeScreenshot('phase1-mobile-light-375x812', { width: 375, height: 812, theme: 'light' });
  await takeScreenshot('phase1-mobile-dark-375x812', { width: 375, height: 812, theme: 'dark' });

  // 2. Tablet (768x1024)
  await takeScreenshot('phase1-tablet-light-768x1024', { width: 768, height: 1024, theme: 'light' });
  await takeScreenshot('phase1-tablet-dark-768x1024', { width: 768, height: 1024, theme: 'dark' });

  // 3. Desktop (1280x800)
  await takeScreenshot('phase1-desktop-light-1280x800', { width: 1280, height: 800, theme: 'light' });
  await takeScreenshot('phase1-desktop-dark-1280x800', { width: 1280, height: 800, theme: 'dark' });

  await browser.close();
  server.close();
  console.log('ALL PHASE 1 SCREENSHOTS CAPTURED CLEANLY!');
}

capture().catch(err => {
  console.error('Error during Phase 1 capture:', err);
  process.exit(1);
});
