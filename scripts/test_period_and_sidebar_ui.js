import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('C:/Users/PRATEEK DUBEY/.gemini/antigravity/brain/a626a610-b2d2-4195-8529-48ae64f558fd/screenshots_period_and_ui');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4186...');
  const server = await preview({
    preview: { port: 4186 }
  });

  const errors = [];

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2 });

    page.on('pageerror', err => {
      console.error('PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(msg.text());
      }
    });

    console.log('Navigating to app...');
    await page.goto('http://localhost:4186/', { waitUntil: 'domcontentloaded' });
    
    // Set standard state with 1 period
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

    await page.goto('http://localhost:4186/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Verify Title
    const title = await page.title();
    console.log('Page Title:', title);
    if (title.includes('🩸')) {
      errors.push('Title still contains blood drop emoji!');
    }

    // 1. Capture Home Screen with Quicksand Heading and Living Cycle Ring (showing Cycle Day 23)
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_quicksand_and_cyclering.png') });
    console.log('✓ Captured: 01_home_quicksand_and_cyclering.png');

    // 2. Open Sidebar Drawer to check animated icon bubbles
    console.log('Opening Sidebar Drawer...');
    const menuBtn = await page.$('.v-sidebar-toggle-btn');
    if (menuBtn) await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '02_sidebar_animated_icons.png') });
    console.log('✓ Captured: 02_sidebar_animated_icons.png');

    // 3. Click "Period & Cycle Flow" in Sidebar
    console.log('Tapping Period & Cycle Flow item...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.v-sidebar-nav-item'));
      const periodItem = items.find(i => i.textContent.includes('Period & Cycle Flow'));
      if (periodItem) periodItem.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '03_period_log_modal_opened.png') });
    console.log('✓ Captured: 03_period_log_modal_opened.png');

    // 4. Tap "Start Period" in modal to start period today
    console.log('Tapping Start Period in modal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.trim() === 'Start Period');
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Select "Medium" flow
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const medBtn = btns.find(b => b.textContent.includes('Medium'));
      if (medBtn) medBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '04_period_logged_medium_flow.png') });
    console.log('✓ Captured: 04_period_logged_medium_flow.png');

    // 5. Close modal to verify Home screen live update to Cycle Day 1
    console.log('Closing modal and verifying Home screen live update...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const doneBtn = btns.find(b => b.textContent.trim() === 'Done');
      if (doneBtn) doneBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '05_home_updated_to_cycle_day_1.png') });
    console.log('✓ Captured: 05_home_updated_to_cycle_day_1.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All Period Logging & Sidebar UI tests completed with 0 errors!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
