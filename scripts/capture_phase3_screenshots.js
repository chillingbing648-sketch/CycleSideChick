const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 8879;
const REPO_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const PROJECT_OUT = path.join(REPO_ROOT, 'docs', 'screenshots', 'phase3');
const ARTIFACT_OUT = 'C:\\Users\\PRATEEK DUBEY\\.gemini\\antigravity\\brain\\7e9f3b3a-058f-4ecb-b32a-3f82164e6f3d\\screenshots\\phase3';

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

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.startsWith('/CycleSideChick/')) {
    reqPath = reqPath.slice('/CycleSideChick/'.length);
  }
  if (reqPath === '/' || reqPath === '') reqPath = 'index.html';
  const filePath = path.join(DIST_DIR, reqPath.replace(/^\//, ''));

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
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
    p: [
      { s: '2026-10-01', e: '2026-10-05', id: 1 },
      { s: '2026-09-03', e: '2026-09-07', id: 2 },
      { s: '2026-08-06', e: '2026-08-10', id: 3 }
    ],
    logs: {
      '2026-10-21': { flow: 'spotting', mood: ['calm', 'focused'], sym: ['cramps_mild'], note: 'Restful evening' }
    },
    jrn: [
      { id: 1, dt: '2026-10-21', mood: 'Peaceful', text: 'Practicing mindful rest and tea rituals today.', tags: ['reflection', 'calm'] }
    ]
  };
}

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Phase 3 server running at http://localhost:${PORT}/CycleSideChick/`);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const targets = [
    { name: 'phase3-mobile-light-375x812', w: 375, h: 812, theme: 'light', tab: 'home' },
    { name: 'phase3-mobile-dark-375x812', w: 375, h: 812, theme: 'dark', tab: 'home' },
    { name: 'phase3-tablet-light-768x1024', w: 768, h: 1024, theme: 'light', tab: 'home' },
    { name: 'phase3-tablet-dark-768x1024', w: 768, h: 1024, theme: 'dark', tab: 'home' },
    { name: 'phase3-desktop-light-1280x800', w: 1280, h: 800, theme: 'light', tab: 'home' },
    { name: 'phase3-desktop-dark-1280x800', w: 1280, h: 800, theme: 'dark', tab: 'home' },
    { name: 'phase3-styleguide-primitives-light-768x1024', w: 768, h: 1024, theme: 'light', tab: 'styleguide' },
    { name: 'phase3-styleguide-primitives-dark-768x1024', w: 768, h: 1024, theme: 'dark', tab: 'styleguide' }
  ];

  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.w, height: t.h, deviceScaleFactor: 2 });

    await page.goto(`http://localhost:${PORT}/CycleSideChick/`, { waitUntil: 'domcontentloaded' });
    const seed = getRichState(t.theme);

    await page.evaluate((seedData, tab) => {
      localStorage.setItem('csc.v1', JSON.stringify(seedData));
      window.location.hash = tab === 'styleguide' ? '#styleguide' : '';
      window.location.reload();
    }, seed, t.tab);

    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    await new Promise(r => setTimeout(r, 650));

    const projPath = path.join(PROJECT_OUT, `${t.name}.png`);
    const artPath = path.join(ARTIFACT_OUT, `${t.name}.png`);

    await page.screenshot({ path: projPath, fullPage: false });
    fs.copyFileSync(projPath, artPath);
    console.log(`Saved screenshot: ${t.name}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('Phase 3 screenshot capture complete!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
