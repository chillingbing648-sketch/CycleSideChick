import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('dist/screenshots_sidebar_premium');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting preview server on port 4180...');
  const server = await preview({
    preview: { port: 4180 }
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

    console.log('Setting localStorage to skip onboarding...');
    await page.goto('http://localhost:4180/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const state = {
        ob: 1,
        userName: 'Isabella',
        cl: 28,
        pl: 5,
        ll: 14,
        periods: [
          { s: '2026-10-01', e: '2026-10-05', id: 'p1' },
          { s: '2026-09-03', e: '2026-09-07', id: 'p2' }
        ],
        logs: {},
        mode: 'natural',
        premium: false
      };
      localStorage.setItem('csc.v1', JSON.stringify(state));
    });

    await page.goto('http://localhost:4180/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Home Header
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_header.png') });
    console.log('✓ Captured: 01_home_header.png');

    // 2. Open Sidebar Drawer via hamburger button
    console.log('Clicking hamburger button...');
    const hamburgerBtn = await page.$('.v-sidebar-toggle-btn');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '02_sidebar_drawer_open.png') });
      console.log('✓ Captured: 02_sidebar_drawer_open.png');
    } else {
      console.error('Sidebar toggle button not found!');
    }

    // 3. Open Pro Sandbox / Premium modal from sidebar
    console.log('Clicking Pro Sandbox Evaluation from sidebar...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.v-sidebar-nav-item'));
      const proBtn = btns.find(b => b.textContent.includes('Pro Sandbox Evaluation'));
      if (proBtn) proBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '03_premium_gateway_modal_top.png') });
    console.log('✓ Captured: 03_premium_gateway_modal_top.png');

    // Scroll down the premium modal to show the payment gateway inputs
    await page.evaluate(() => {
      const sheet = document.querySelector('.v-premium-sheet .c-sheet__content') || document.querySelector('.c-sheet__content');
      if (sheet) sheet.scrollTop = 600;
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '03b_premium_gateway_inputs.png') });
    console.log('✓ Captured: 03b_premium_gateway_inputs.png');

    // Close premium modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.c-sheet-header button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 4. Open Profile Settings and capture Separable Tabs
    console.log('Opening Profile Settings...');
    await page.evaluate(() => {
      const avatarBtn = document.querySelector('.v-home-avatar-btn');
      if (avatarBtn) avatarBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, '04_profile_settings_health_tab.png') });
    console.log('✓ Captured: 04_profile_settings_health_tab.png');

    // Click Preferences tab
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('.v-profile-tabs-bar button'));
      const prefTab = tabBtns.find(b => b.textContent.includes('Preferences'));
      if (prefTab) prefTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '04b_profile_settings_preferences_tab.png') });
    console.log('✓ Captured: 04b_profile_settings_preferences_tab.png');

    // Click Privacy & Vault tab
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('.v-profile-tabs-bar button'));
      const privTab = tabBtns.find(b => b.textContent.includes('Privacy & Vault'));
      if (privTab) privTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '05_profile_settings_privacy_tab.png') });
    console.log('✓ Captured: 05_profile_settings_privacy_tab.png');

    // Click About & Care tab
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('.v-profile-tabs-bar button'));
      const aboutTab = tabBtns.find(b => b.textContent.includes('About & Care'));
      if (aboutTab) aboutTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, '06_profile_settings_about_tab.png') });
    console.log('✓ Captured: 06_profile_settings_about_tab.png');

    await browser.close();
  } finally {
    await server.close();
  }

  if (errors.length > 0) {
    console.error('Encountered errors during test:', errors);
    process.exit(1);
  } else {
    console.log('All visual validations completed with 0 errors!');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
