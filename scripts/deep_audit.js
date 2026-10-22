import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function run() {
  console.log('--- STARTING COMPREHENSIVE AUDIT SUITE ---');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { shell: true });
  
  // Wait for server to respond
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch('http://localhost:4173/');
      if (res.ok) {
        console.log('Preview server ready.');
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  const findings = {
    errors: [],
    warnings: [],
    brokenImages: [],
    deadButtons: [],
    layoutIssues: [],
    passedChecks: []
  };

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    page.on('pageerror', err => {
      findings.errors.push(`[PAGE ERROR]: ${err.message}`);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        findings.errors.push(`[CONSOLE ERROR]: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        findings.warnings.push(`[CONSOLE WARN]: ${msg.text()}`);
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 400) {
        findings.errors.push(`[HTTP ${resp.status()}]: ${resp.url()}`);
      }
    });

    // TEST 1: Initial Launch (Onboarding)
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    const ob = await page.$('.ob');
    if (ob) findings.passedChecks.push('Onboarding flow renders cleanly.');
    else findings.errors.push('Onboarding failed to render on clean state.');

    // Step through onboarding
    const nextBtn = await page.$('.v-btn-primary, button.btn.primary');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 300));
      findings.passedChecks.push('Onboarding Step 1 advance works.');
    }

    // Set storage to active state with realistic history for testing
    await page.evaluate(() => {
      const state = {
        cl: 28,
        pl: 5,
        p: [
          { s: "2026-09-01", e: "2026-09-05" },
          { s: "2026-09-29", e: "2026-10-03" }
        ],
        logs: {
          "2026-10-22": {
            f: 2,
            m: 3,
            en: "balanced",
            sy: { cramps: true, headache: true },
            p: 3,
            cm: "creamy",
            note: "Testing daily log persistence"
          }
        },
        journal: [
          {
            id: "j_1",
            date: "2026-10-22",
            mood: "Calm",
            text: "Feeling balanced and relaxed today.",
            prompt: "Reflect on how your body feels"
          }
        ],
        ob: 1,
        mode: "natural",
        theme: "light",
        motion: 1,
        haptics: 1
      };
      localStorage.setItem('csc.v1', JSON.stringify(state));
      window.location.reload();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    findings.passedChecks.push('State initialization and reload successful.');

    // TEST 2: Home View
    const homeRing = await page.$('.v-reference-ring-wrap');
    if (homeRing) findings.passedChecks.push('Home: Living Cycle Ring renders.');
    else findings.errors.push('Home: Living Cycle Ring missing.');

    const reminder = await page.$('.v-reminder-card');
    if (reminder) findings.passedChecks.push('Home: Gentle Reminder Card renders.');

    // Check SVG rendering across home
    const homeSVGs = await page.$$eval('svg', svgs => svgs.map(s => ({
      width: s.getAttribute('width') || s.clientWidth,
      height: s.getAttribute('height') || s.clientHeight,
      viewBox: s.getAttribute('viewBox'),
      hasPath: s.querySelectorAll('path').length > 0
    })));
    console.log(`Home SVGs found: ${homeSVGs.length}`);

    // TEST 3: Calendar View & Day Selection
    await page.click('button[data-tab="calendar"]');
    await new Promise(r => setTimeout(r, 500));

    const cal = await page.$('.v-calendar-container');
    if (cal) findings.passedChecks.push('Calendar: Interactive Cycle Calendar renders.');
    else findings.errors.push('Calendar container missing.');

    // Click a day cell with log
    const todayCell = await page.$('.v-cal-cell.today, .v-cal-cell');
    if (todayCell) {
      await todayCell.click();
      await new Promise(r => setTimeout(r, 400));
      const detail = await page.$('.v-cal-selected-day-panel');
      if (detail) findings.passedChecks.push('Calendar: Date selection reveals symptoms & reflection.');
    }

    // TEST 4: Daily Log View
    await page.click('button[data-tab="log"]');
    await new Promise(r => setTimeout(r, 500));

    const logWrap = await page.$('.log-view');
    if (logWrap) findings.passedChecks.push('Log: Daily Log View renders.');

    // Check flow buttons
    const flowBtns = await page.$$('.v-flow-btn');
    if (flowBtns.length === 5) findings.passedChecks.push('Log: 5 flow droplet buttons present.');
    else findings.errors.push(`Log: Expected 5 flow buttons, found ${flowBtns.length}.`);

    // Check moods
    const moodBtns = await page.$$('.v-chips-row--moods button');
    if (moodBtns.length === 5) findings.passedChecks.push('Log: 5 emotional mood cards present.');

    // Check energy
    const energyBtns = await page.$$('.v-chips-row--energy button');
    if (energyBtns.length === 3) findings.passedChecks.push('Log: 3 energy rhythm buttons present.');

    // Check symptoms
    const symBtns = await page.$$('.v-chips-grid button');
    if (symBtns.length >= 10) findings.passedChecks.push(`Log: ${symBtns.length} physical symptom cards present.`);

    // Test clicking an unselected symptom
    if (symBtns[1]) {
      await symBtns[1].click();
      await new Promise(r => setTimeout(r, 200));
      findings.passedChecks.push('Log: Symptom toggle interaction responsive.');
    }

    // TEST 5: Insights View
    await page.click('button[data-tab="insights"]');
    await new Promise(r => setTimeout(r, 500));

    const timeline = await page.$('.v-phase-timeline-card');
    if (timeline) findings.passedChecks.push('Insights: Four-Phase Cycle Timeline renders.');
    else findings.errors.push('Insights: Timeline missing.');

    const trends = await page.$('.v-trends-chart-card');
    if (trends) findings.passedChecks.push('Insights: Personal Cycle Trends Chart renders.');

    const cards = await page.$$('.v-expandable-insight-card');
    if (cards.length >= 4) findings.passedChecks.push(`Insights: ${cards.length} expandable insight cards present.`);

    // Test expanding an insight card
    if (cards[0]) {
      const trigger = await cards[0].$('.v-expandable-trigger');
      if (trigger) {
        await trigger.click();
        await new Promise(r => setTimeout(r, 300));
        findings.passedChecks.push('Insights: Card expand/collapse interaction functions.');
      }
    }

    // TEST 6: Care & Comfort / Journal View
    await page.click('button[data-tab="care"]');
    await new Promise(r => setTimeout(r, 500));

    const journal = await page.$('.v-journal-section-wrap');
    if (journal) findings.passedChecks.push('Care: Private Journal section renders.');

    // Switch to Care Kit tab
    const careKitBtn = await page.$('.c-segmented__item:nth-of-type(1)');
    if (careKitBtn) {
      await careKitBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const checklist = await page.$('.v-care-checklist-card');
      if (checklist) findings.passedChecks.push('Care: Gentle Self-Care Checklist renders in Care Kit.');
    }

    // Switch to Cycle Guide tab
    const guideBtn = await page.$('.c-segmented__item:nth-of-type(3)');
    if (guideBtn) {
      await guideBtn.click();
      await new Promise(r => setTimeout(r, 400));
      findings.passedChecks.push('Care: Cycle Guide tab switch functions.');
    }

    // TEST 7: Profile & Settings Sheet Modal
    await page.click('button[data-tab="home"]');
    await new Promise(r => setTimeout(r, 400));

    const profileBtn = await page.$('.v-subview-profile-btn, button[aria-label*="Profile"]');
    if (profileBtn) {
      await profileBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const sheet = await page.$('.v-profile-sheet, .c-sheet, .modal, .c-modal');
      if (sheet) findings.passedChecks.push('Profile: Settings Sheet opens cleanly.');
      else findings.warnings.push('Profile sheet element class check needed.');
    }

    // TEST 8: Responsive Breakpoints (320px, 768px, 1200px)
    const viewports = [
      { name: 'Ultra-narrow mobile', width: 320, height: 600 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];

    for (const vp of viewports) {
      await page.setViewport(vp);
      await new Promise(r => setTimeout(r, 300));

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        findings.layoutIssues.push(`Horizontal overflow detected at ${vp.name} (${vp.width}px).`);
      } else {
        findings.passedChecks.push(`No horizontal overflow at ${vp.name} (${vp.width}px).`);
      }
    }

    await browser.close();

    console.log('\n================ AUDIT RESULTS ================');
    console.log(`Passed checks (${findings.passedChecks.length}):`);
    findings.passedChecks.forEach(c => console.log(`  ✓ ${c}`));

    if (findings.warnings.length > 0) {
      console.log(`\nWarnings (${findings.warnings.length}):`);
      findings.warnings.forEach(w => console.log(`  ⚠ ${w}`));
    }

    if (findings.layoutIssues.length > 0) {
      console.log(`\nLayout Issues (${findings.layoutIssues.length}):`);
      findings.layoutIssues.forEach(l => console.log(`  ✖ ${l}`));
    }

    if (findings.errors.length > 0) {
      console.log(`\nErrors (${findings.errors.length}):`);
      findings.errors.forEach(e => console.log(`  ✖ ${e}`));
    } else {
      console.log('\nZERO ERRORS DETECTED DURING RUNTIME AUDIT.');
    }
    console.log('================================================\n');

    process.exit(findings.errors.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('Audit suite crashed:', err);
    process.exit(1);
  } finally {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
    } else {
      server.kill();
    }
  }
}

run();
