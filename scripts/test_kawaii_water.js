import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('dist/screenshots_kawaii_water');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4185...');
  const server = await preview({
    preview: { port: 4185 }
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

    console.log('Setting localStorage for water test...');
    await page.goto('http://localhost:4185/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const state = {
        ob: 1,
        userName: 'Isabella',
        cl: 28,
        pl: 5,
        ll: 14,
        waterGoalMl: 2000,
        periods: [
          { s: '2026-10-01', e: '2026-10-05', id: 'p1' }
        ],
        logs: {
          '2026-10-22': {
            waterMl: 500,
            water: 2
          }
        },
        mode: 'natural'
      };
      localStorage.setItem('csc.v1', JSON.stringify(state));
    });

    await page.goto('http://localhost:4185/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Home view scrolled to the new Kawaii Water widget
    await page.evaluate(() => {
      const widget = document.querySelector('.v-home-water-widget');
      if (widget) widget.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_water_widget.png') });
    console.log('✓ Captured: 01_home_water_widget.png');

    // 2. Click the Water widget to open KawaiiWaterModal
    console.log('Clicking Water Widget to open KawaiiWaterModal...');
    const widget = await page.$('.v-home-water-widget');
    if (widget) {
      await widget.click();
    } else {
      console.error('v-home-water-widget not found!');
    }
    await new Promise(r => setTimeout(r, 600));

    // Capture initial modal state
    await page.screenshot({ path: path.join(OUT_DIR, '02_kawaii_water_initial_500ml.png') });
    console.log('✓ Captured: 02_kawaii_water_initial_500ml.png');

    // 3. Click "+500 Bottle" button to animate water fill up
    console.log('Tapping +500 Bottle...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.v-water-preset-btn'));
      const bottleBtn = btns.find(b => b.textContent.includes('+500'));
      if (bottleBtn) bottleBtn.click();
    });
    // Wait for wave animation and spring transition
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT_DIR, '03_water_fill_animated_1000ml.png') });
    console.log('✓ Captured: 03_water_fill_animated_1000ml.png');

    // 4. Click "+1000 Carafe" to reach 2,000ml (Goal Smashed!)
    console.log('Tapping +1000 Carafe to reach goal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.v-water-preset-btn'));
      const carafeBtn = btns.find(b => b.textContent.includes('Carafe') || b.textContent.includes('1000') || b.textContent.includes('1k'));
      if (carafeBtn) carafeBtn.click();
    });
    // Tap bottle again (+500) to exceed 2000ml
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.v-water-preset-btn'));
      const bottleBtn = btns.find(b => b.textContent.includes('Bottle') || b.textContent.includes('500'));
      if (bottleBtn) bottleBtn.click();
    });
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT_DIR, '04_water_goal_smashed_champion.png') });
    console.log('✓ Captured: 04_water_goal_smashed_champion.png');

    // 5. Scroll down to capture the appreciation and reward details
    await page.evaluate(() => {
      const sheet = document.querySelector('.v-water-modal-sheet .c-sheet__content') || document.querySelector('.c-sheet__content');
      if (sheet) sheet.scrollTop = 500;
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '05_appreciation_reward_card_details.png') });
    console.log('✓ Captured: 05_appreciation_reward_card_details.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All Kawaii Water visual tests completed with 0 errors!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
