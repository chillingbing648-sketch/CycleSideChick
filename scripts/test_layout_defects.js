import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('dist/screenshots/layout_audit');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '320px_narrow_mobile', width: 320, height: 740 },
  { name: '375px_standard_mobile', width: 375, height: 812 },
  { name: '390px_modern_mobile', width: 390, height: 844 },
  { name: '430px_large_mobile', width: 430, height: 932 },
  { name: '768px_tablet', width: 768, height: 1024 },
  { name: '1024px_desktop', width: 1024, height: 800 }
];

async function run() {
  console.log('Starting preview server on port 4173...');
  const server = await preview({
    preview: { port: 4173 }
  });

  const errors = [];

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

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

    console.log('Navigating to app and bypassing onboarding...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Mark onboarding complete in localStorage so we can test the views directly
    await page.evaluate(() => {
      const raw = localStorage.getItem('csc.v1');
      let data = {};
      if (raw) {
        try { data = JSON.parse(raw); } catch (e) {}
      }
      data.ob = 1;
      data.userName = "Maya";
      if (!data.periods || data.periods.length === 0) {
        data.periods = [{ s: "2026-10-18", e: "2026-10-22" }];
      }
      localStorage.setItem('csc.v1', JSON.stringify(data));
      window.location.reload();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Reloaded with active cycle state.');

    // Audit each viewport
    for (const vp of VIEWPORTS) {
      console.log(`\n========================================`);
      console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`========================================`);

      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await new Promise(r => setTimeout(r, 200));

      // 1. Audit Component A: Four-Phase Cycle Timeline (Insights Tab)
      const navButtons = await page.$$('.v-sliding-nav-item');
      if (navButtons.length >= 4) {
        await navButtons[3].click(); // Insights Tab
        await new Promise(r => setTimeout(r, 400));
      }

      // Check overflow in timeline
      const timelineOverflow = await page.evaluate(() => {
        const track = document.querySelector('.v-timeline-segments-track');
        const card = document.querySelector('.v-phase-timeline-card');
        return {
          trackScrollWidth: track ? track.scrollWidth : 0,
          trackClientWidth: track ? track.clientWidth : 0,
          cardScrollWidth: card ? card.scrollWidth : 0,
          cardClientWidth: card ? card.clientWidth : 0
        };
      });
      console.log(`[${vp.name}] Timeline width metrics:`, timelineOverflow);

      const timelineFile = `${vp.name}_A_cycle_timeline.png`;
      const timelineElem = await page.$('.v-phase-timeline-card');
      if (timelineElem) {
        await timelineElem.screenshot({ path: path.join(OUT_DIR, timelineFile) });
        console.log(`✓ Saved: ${timelineFile}`);
      }

      // 2. Audit Component C: Personal Care Kit / Filters (Care > Care Kit Tab)
      if (navButtons.length >= 5) {
        await navButtons[4].click(); // Care tab
        await new Promise(r => setTimeout(r, 400));
      }

      // Ensure we are on Care Kit subtab (index 0)
      const subtabCare = await page.$$('.c-segmented__item');
      if (subtabCare.length >= 1) {
        await subtabCare[0].click(); // Care Kit
        await new Promise(r => setTimeout(r, 400));
      }

      const careKitFile = `${vp.name}_C_care_kit_filters.png`;
      const careKitElem = await page.$('.v-care-kit-section');
      if (careKitElem) {
        await careKitElem.screenshot({ path: path.join(OUT_DIR, careKitFile) });
        console.log(`✓ Saved: ${careKitFile}`);
      }

      // 3. Audit Component B: Private Reflection / Mood Journal (Care > Journal Tab)
      if (subtabCare.length >= 2) {
        await subtabCare[1].click(); // Private Journal
        await new Promise(r => setTimeout(r, 400));
      }

      const journalFile = `${vp.name}_B_private_reflection.png`;
      const journalElem = await page.$('.v-journal-editor-card');
      if (journalElem) {
        await journalElem.screenshot({ path: path.join(OUT_DIR, journalFile) });
        console.log(`✓ Saved: ${journalFile}`);
      }

      // Check for horizontal overflow of page
      const pageHorizontalScroll = await page.evaluate(() => {
        return {
          windowInnerWidth: window.innerWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          appScrollWidth: document.getElementById('app') ? document.getElementById('app').scrollWidth : 0,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 2
        };
      });

      console.log(`[${vp.name}] Horizontal page overflow check:`, pageHorizontalScroll);
      if (pageHorizontalScroll.hasHorizontalScroll) {
        console.warn(`⚠️ Warning: horizontal overflow detected at ${vp.name}!`);
      } else {
        console.log(`✓ No horizontal page overflow at ${vp.name}`);
      }
    }

    // 4. Test Dark Mode at 375px
    console.log(`\n========================================`);
    console.log(`Testing Dark Mode at 375px`);
    console.log(`========================================`);
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    await new Promise(r => setTimeout(r, 400));

    // Navigate to Care tab for Dark Care Kit
    const navCareDark = await page.$$('.v-sliding-nav-item');
    if (navCareDark.length >= 5) {
      await navCareDark[4].click();
      await new Promise(r => setTimeout(r, 400));
    }

    const subtabCareDark = await page.$$('.c-segmented__item');
    if (subtabCareDark.length >= 1) {
      await subtabCareDark[0].click(); // Care Kit subtab
      await new Promise(r => setTimeout(r, 400));
    }

    // Dark Care Kit
    const darkCareKit = await page.$('.v-care-kit-section');
    if (darkCareKit) {
      await darkCareKit.screenshot({ path: path.join(OUT_DIR, 'dark_375px_C_care_kit.png') });
      console.log(`✓ Saved: dark_375px_C_care_kit.png`);
    }

    // Dark Journal
    if (subtabCareDark.length >= 2) {
      await subtabCareDark[1].click(); // Journal subtab
      await new Promise(r => setTimeout(r, 400));
      const darkJournal = await page.$('.v-journal-editor-card');
      if (darkJournal) {
        await darkJournal.screenshot({ path: path.join(OUT_DIR, 'dark_375px_B_journal.png') });
        console.log(`✓ Saved: dark_375px_B_journal.png`);
      }
    }

    // Dark Timeline (Insights tab)
    if (navCareDark.length >= 4) {
      await navCareDark[3].click();
      await new Promise(r => setTimeout(r, 400));
      const darkTimeline = await page.$('.v-phase-timeline-card');
      if (darkTimeline) {
        await darkTimeline.screenshot({ path: path.join(OUT_DIR, 'dark_375px_A_timeline.png') });
        console.log(`✓ Saved: dark_375px_A_timeline.png`);
      }
    }

    await browser.close();

    console.log('\n============================================');
    console.log(`LAYOUT DEFECT AUDIT COMPLETED WITH ${errors.length} ERRORS.`);
    console.log('============================================');
  } finally {
    if (server && server.httpServer) {
      server.httpServer.close();
    }
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});