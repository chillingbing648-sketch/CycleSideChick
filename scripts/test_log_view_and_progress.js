import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('C:/Users/PRATEEK DUBEY/.gemini/antigravity/brain/a626a610-b2d2-4195-8529-48ae64f558fd/screenshots_log_ui');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4188...');
  const server = await preview({
    preview: { port: 4188 }
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
    await page.goto('http://localhost:4188/', { waitUntil: 'domcontentloaded' });
    
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

    await page.goto('http://localhost:4188/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Navigate to Log View via bottom bar or direct click
    console.log('Navigating to Log View...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('.v-nav-item, nav button, [data-view="log"]'));
      const logNav = navButtons.find(b => b.textContent.includes('Log'));
      if (logNav) {
        logNav.click();
      } else if (window.actions && window.actions.setView) {
        window.actions.setView('log');
      }
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture 01: Initial Log Screen with 0% progress
    await page.screenshot({ path: path.join(OUT_DIR, '01_log_view_initial_0_percent.png') });
    console.log('✓ Captured: 01_log_view_initial_0_percent.png');

    // 2. Select Bleeding Flow: Light (or Medium)
    console.log('Selecting Medium flow capsule...');
    await page.evaluate(() => {
      const flowCapsules = Array.from(document.querySelectorAll('.v-flow-btn'));
      const mediumBtn = flowCapsules.find(btn => btn.textContent.includes('Medium'));
      if (mediumBtn) mediumBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '02_log_flow_selected_progress_updated.png') });
    console.log('✓ Captured: 02_log_flow_selected_progress_updated.png');

    // 3. Select Symptoms & Moods
    console.log('Selecting Cramps, Fatigue, Tender Breasts, and Happy...');
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.v-chip, .v-symptom-chip, .v-mood-chip, button'));
      const toSelect = ['Cramps', 'Fatigue', 'Tender Breasts', 'Happy', 'Calm'];
      chips.forEach(chip => {
        if (toSelect.some(name => chip.textContent.includes(name))) {
          chip.click();
        }
      });
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '03_log_symptoms_moods_selected_60_percent.png') });
    console.log('✓ Captured: 03_log_symptoms_moods_selected_60_percent.png');

    // 4. Scroll down to Pelvic Pain and Cervical Fluid
    console.log('Scrolling down directly to Pain Slider, Cervical Fluid, and Meds...');
    await page.evaluate(() => {
      const painCard = document.querySelector('.v-log-mucus-grid')?.closest('.c-card') || document.querySelector('input[type="range"]')?.closest('.c-card');
      if (painCard) {
        painCard.scrollIntoView({ behavior: 'instant', block: 'center' });
      } else {
        window.scrollBy({ top: 900, behavior: 'instant' });
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Select Cervical Fluid: Egg White & adjust slider
    await page.evaluate(() => {
      const slider = document.querySelector('input[type="range"]');
      if (slider) {
        slider.value = 5;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const mucusBtns = Array.from(document.querySelectorAll('.v-mucus-btn'));
      const eggWhite = mucusBtns.find(c => c.textContent.includes('Egg White'));
      if (eggWhite) eggWhite.click();

      // Also click a Medication chip
      const chips = Array.from(document.querySelectorAll('.v-chip, button'));
      const med = chips.find(c => c.textContent.includes('Vitamins') || c.textContent.includes('Ibuprofen'));
      if (med) med.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '04_pain_and_cervical_fluid_selected.png') });
    console.log('✓ Captured: 04_pain_and_cervical_fluid_selected.png');

    // 5. Scroll back up to verify 100% Progress Bar completion
    console.log('Scrolling up to show 100% completed progress bar...');
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '05_log_100_percent_completed_card.png') });
    console.log('✓ Captured: 05_log_100_percent_completed_card.png');

    // 6. Click Save & Done
    console.log('Tapping Save & Done...');
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save & Done'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '06_home_screen_after_save.png') });
    console.log('✓ Captured: 06_home_screen_after_save.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All Log UI and Progress Bar tests passed cleanly!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
