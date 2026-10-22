import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('C:/Users/PRATEEK DUBEY/.gemini/antigravity/brain/a626a610-b2d2-4195-8529-48ae64f558fd/screenshots_home_replacement');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4195...');
  const server = await preview({
    preview: { port: 4195 }
  });

  const errors = [];

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

    page.on('pageerror', err => {
      console.error('PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    await page.goto('http://localhost:4195/', { waitUntil: 'domcontentloaded' });
    
    // Set standard state
    await page.evaluate(() => {
      const state = {
        ob: 1,
        userName: 'Sophia',
        cl: 28,
        pl: 5,
        ll: 14,
        periods: [
          { s: '2026-10-01', e: '2026-10-05', id: 'p1' }
        ],
        logs: {},
        mode: 'natural'
      };
      localStorage.setItem('csc.v1', JSON.stringify(state));
    });

    await page.goto('http://localhost:4195/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Home Screen showing "Home" title & "Home" bottom nav pill
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_screen_with_home_title_and_nav.png') });
    console.log('✓ Captured: 01_home_screen_with_home_title_and_nav.png');

    // 2. Open Sidebar Drawer to verify "Home" label
    const menuBtn = await page.$('.v-sidebar-toggle-btn');
    if (menuBtn) await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '02_sidebar_with_home_nav.png') });
    console.log('✓ Captured: 02_sidebar_with_home_nav.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All Home replacement tests completed cleanly!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
