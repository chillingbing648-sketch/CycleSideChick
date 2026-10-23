import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('C:/Users/PRATEEK DUBEY/.gemini/antigravity/brain/a626a610-b2d2-4195-8529-48ae64f558fd/screenshots_mood_meds_ui');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4192...');
  const server = await preview({
    preview: { port: 4192 }
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

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(msg.text());
      }
    });

    console.log('Navigating to app...');
    await page.goto('http://localhost:4192/', { waitUntil: 'domcontentloaded' });
    
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

    await page.goto('http://localhost:4192/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Home Screen showing softer navigation icons
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_screen_softer_icons.png') });
    console.log('✓ Captured: 01_home_screen_softer_icons.png');

    // 2. Navigate to Log View
    console.log('Navigating to Log View...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('.v-nav-item, nav button, [data-view="log"]'));
      const logNav = navButtons.find(b => b.textContent.includes('Log'));
      if (logNav) logNav.click();
      else if (window.actions && window.actions.setView) window.actions.setView('log');
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Capture Initial Log view with soft facial moods and emotional feelings
    await page.screenshot({ path: path.join(OUT_DIR, '02_log_view_soft_moods_and_feelings.png') });
    console.log('✓ Captured: 02_log_view_soft_moods_and_feelings.png');

    // 4. Select Mood "Great" and Nuanced Feelings: "Joyful", "In The Flow", "Affectionate"
    console.log('Selecting Mood Great and Nuanced Feelings...');
    await page.evaluate(() => {
      const greatMood = Array.from(document.querySelectorAll('.v-svg-chip--mood')).find(b => b.textContent.includes('Great'));
      if (greatMood) greatMood.click();

      const feelings = Array.from(document.querySelectorAll('.v-svg-chip--emotion'));
      const toPick = ['Joyful', 'In The Flow', 'Affectionate'];
      feelings.forEach(f => {
        if (toPick.some(name => f.textContent.includes(name))) {
          f.click();
        }
      });
      
      const feelingsHeader = Array.from(document.querySelectorAll('.v-selector-title')).find(t => t.textContent.includes('Feelings'));
      if (feelingsHeader) {
        feelingsHeader.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '03_selected_mood_and_emotional_nuances.png') });
    console.log('✓ Captured: 03_selected_mood_and_emotional_nuances.png');

    // 5. Scroll down to Medications & Care Suite
    console.log('Scrolling down to Medications & Care Suite...');
    await page.evaluate(() => {
      const medHeader = Array.from(document.querySelectorAll('b')).find(b => b.textContent.includes('Medications & Supplements'));
      if (medHeader) {
        medHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollBy({ top: 900, behavior: 'instant' });
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture All Medications grid
    await page.screenshot({ path: path.join(OUT_DIR, '04_medications_suite_all_care.png') });
    console.log('✓ Captured: 04_medications_suite_all_care.png');

    // 6. Filter by "Pain Relief" and select "Ibuprofen"
    console.log('Filtering by Pain Relief and selecting Ibuprofen & Naproxen...');
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('.v-med-cat-pill'));
      const painPill = pills.find(p => p.textContent.includes('Pain Relief'));
      if (painPill) painPill.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const medCards = Array.from(document.querySelectorAll('.v-med-card'));
      const ibu = medCards.find(c => c.textContent.includes('Ibuprofen'));
      if (ibu) ibu.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '05_medications_pain_relief_filtered.png') });
    console.log('✓ Captured: 05_medications_pain_relief_filtered.png');

    // 7. Switch to "Holistic Care" and select "Red Raspberry Leaf Tea" & "Heat Patch"
    console.log('Switching to Holistic Care and selecting Tea & Heat Patch...');
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('.v-med-cat-pill'));
      const holisticPill = pills.find(p => p.textContent.includes('Holistic Care'));
      if (holisticPill) holisticPill.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const medCards = Array.from(document.querySelectorAll('.v-med-card'));
      const tea = medCards.find(c => c.textContent.includes('Raspberry Leaf'));
      if (tea) tea.click();
      const patch = medCards.find(c => c.textContent.includes('Heat Patch'));
      if (patch) patch.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '06_medications_holistic_care_selected.png') });
    console.log('✓ Captured: 06_medications_holistic_care_selected.png');

    // 8. Add a custom medication (e.g. "Levothyroxine / Thyroid Care")
    console.log('Adding custom medication...');
    await page.evaluate(() => {
      const medInput = Array.from(document.querySelectorAll('input[type="text"]')).find(i => i.placeholder.includes('custom medicine'));
      if (medInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(medInput, 'Levothyroxine / Thyroid Care');
        medInput.dispatchEvent(new Event('input', { bubbles: true }));
        medInput.dispatchEvent(new Event('change', { bubbles: true }));
        const form = medInput.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '07_custom_medication_added.png') });
    console.log('✓ Captured: 07_custom_medication_added.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All Mood, Medications, Icons & Scrollbar UI tests completed cleanly!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
