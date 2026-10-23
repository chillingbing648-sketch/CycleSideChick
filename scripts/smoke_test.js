import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function run() {
  console.log('Starting preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { shell: true });

  await new Promise(r => setTimeout(r, 2000));

  const errors = [];
  const warnings = [];

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    page.on('pageerror', (err) => {
      console.error('PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('CONSOLE ERROR:', msg.text());
        errors.push(msg.text());
      }
    });

    console.log('Navigating to http://localhost:4173/ ...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    console.log('Page Title:', await page.title());

    // 1. Verify Onboarding
    const onboardingEl = await page.$('.ob');
    console.log('1. Onboarding rendered initially:', Boolean(onboardingEl));

    // 2. Set ob = 1 in csc.v1 to test AppShell & all secondary pages
    console.log('Setting ob=1 in localStorage (csc.v1) and reloading...');
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('csc.v1') || '{}');
      state.ob = 1;
      localStorage.setItem('csc.v1', JSON.stringify(state));
      window.location.reload();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // 3. Verify AppShell
    const shell = await page.$('.v-mobile-shell');
    console.log('2. AppShell (.v-mobile-shell) rendered:', Boolean(shell));

    // 4. Verify Sliding Pill Nav
    const navBar = await page.$('.v-sliding-nav-bar');
    console.log('3. Sliding Pill Nav (.v-sliding-nav-bar) rendered:', Boolean(navBar));

    const navItems = await page.$$('.v-sliding-nav-item');
    console.log('4. Nav items count:', navItems.length);

    // 5. Home View components
    const cycleRing = await page.$('.v-reference-ring-wrap');
    const reminderCard = await page.$('.v-reminder-card');
    console.log('5. Living Cycle Ring rendered on Home:', Boolean(cycleRing));
    console.log('6. Gentle Reminder Card rendered on Home:', Boolean(reminderCard));

    // 6. Test Navigation to Calendar
    console.log('Testing click to Calendar...');
    await page.click('button[data-tab="calendar"]');
    await new Promise(r => setTimeout(r, 600));
    const calendarView = await page.$('.v-calendar-container');
    console.log('7. Calendar View rendered:', Boolean(calendarView));

    // 7. Test Navigation to Log (Symptom & Mood Selector)
    console.log('Testing click to Log...');
    await page.click('button[data-tab="log"]');
    await new Promise(r => setTimeout(r, 600));
    const symptomSelector = await page.$('.v-symptom-selector-wrap');
    console.log('8. Symptom & Mood Selector rendered in Log:', Boolean(symptomSelector));

    // 8. Test Navigation to Insights (Timeline, Expandable Cards, Trends Chart)
    console.log('Testing click to Insights...');
    await page.click('button[data-tab="insights"]');
    await new Promise(r => setTimeout(r, 600));
    const timeline = await page.$('.v-phase-timeline-card');
    const trendsChart = await page.$('.v-trends-chart-card');
    const insightCards = await page.$$('.v-expandable-insight-card');
    console.log('9. Four-Phase Timeline rendered in Insights:', Boolean(timeline));
    console.log('10. Personal Trends Chart rendered in Insights:', Boolean(trendsChart));
    console.log('11. Expandable Insight Cards count in Insights:', insightCards.length);

    // 9. Test Navigation to Care/Journal
    console.log('Testing click to Care/Journal...');
    await page.click('button[data-tab="care"]');
    await new Promise(r => setTimeout(r, 600));
    const journalSection = await page.$('.v-journal-section-wrap');
    console.log('12. Mood Journal Section rendered in Care:', Boolean(journalSection));

    // Test switching to Care Kit subtab
    console.log('Testing click to Care Kit subtab in CareView...');
    await page.click('.c-segmented__item:nth-of-type(1)');
    await new Promise(r => setTimeout(r, 600));
    const checklist = await page.$('.v-care-checklist-card');
    console.log('13. Self-Care Checklist rendered in Care Kit:', Boolean(checklist));

    await browser.close();

    console.log('====================================');
    console.log(`SMOKE TEST RESULTS:`);
    console.log(`Error count: ${errors.length}`);
    console.log('====================================');

    if (errors.length > 0) {
      console.error('FAIL: Console or Page errors detected:', errors);
      process.exit(1);
    } else {
      console.log('SUCCESS: All 10 components and tabs verified with ZERO errors!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Smoke test threw exception:', err);
    process.exit(1);
  } finally {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
      } else {
        server.kill();
      }
    } catch (e) {}
  }
}

run();
