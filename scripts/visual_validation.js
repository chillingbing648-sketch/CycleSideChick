import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.resolve('dist/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Starting programmatic preview server on port 4173...');
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
    await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2 }); // Pixel 7 / iPhone Pro viewport

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

    console.log('Navigating to http://localhost:4173/ ...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Step 0: Splash Screen
    await page.screenshot({ path: path.join(OUT_DIR, '01_onboarding_splash.png') });
    console.log('✓ Captured: 01_onboarding_splash.png');

    // Click splash to advance to Carousel Slide 1
    await page.click('.v-splash-screen');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '02_onboarding_slide1.png') });
    console.log('✓ Captured: 02_onboarding_slide1.png');

    // Advance to Slide 2
    const nextBtn = await page.$('button.c-btn--primary');
    if (nextBtn) await nextBtn.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '03_onboarding_slide2.png') });
    console.log('✓ Captured: 03_onboarding_slide2.png');

    // Advance to Slide 3
    const nextBtn2 = await page.$('button.c-btn--primary');
    if (nextBtn2) await nextBtn2.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '04_onboarding_slide3.png') });
    console.log('✓ Captured: 04_onboarding_slide3.png');

    // Click "Get Started" to go to Name step (Step 4)
    const getStartedBtn = await page.$('button.c-btn--primary');
    if (getStartedBtn) await getStartedBtn.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '05_onboarding_name.png') });
    console.log('✓ Captured: 05_onboarding_name.png');

    // Continue to Birthday step (Step 5)
    const contBtn = await page.$('button.c-btn--primary');
    if (contBtn) await contBtn.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '06_onboarding_birthday.png') });
    console.log('✓ Captured: 06_onboarding_birthday.png');

    // Continue to Weight step (Step 6)
    const contBtn2 = await page.$('button.c-btn--primary');
    if (contBtn2) await contBtn2.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '07_onboarding_weight_ruler.png') });
    console.log('✓ Captured: 07_onboarding_weight_ruler.png');

    // Continue to Height step (Step 7)
    const contBtn3 = await page.$('button.c-btn--primary');
    if (contBtn3) await contBtn3.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '08_onboarding_height_ruler.png') });
    console.log('✓ Captured: 08_onboarding_height_ruler.png');

    // Continue to Period Duration step (Step 8)
    const contBtn4 = await page.$('button.c-btn--primary');
    if (contBtn4) await contBtn4.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '09_onboarding_period_duration.png') });
    console.log('✓ Captured: 09_onboarding_period_duration.png');

    // Continue to Cycle Length step (Step 9)
    const contBtn5 = await page.$('button.c-btn--primary');
    if (contBtn5) await contBtn5.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '10_onboarding_cycle_length.png') });
    console.log('✓ Captured: 10_onboarding_cycle_length.png');

    // Continue to Last Period Start step (Step 10)
    const contBtn6 = await page.$('button.c-btn--primary');
    if (contBtn6) await contBtn6.click();
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(OUT_DIR, '11_onboarding_last_period_calendar.png') });
    console.log('✓ Captured: 11_onboarding_last_period_calendar.png');

    // Continue to Setup calculation progress (Step 11)
    const contBtn7 = await page.$('button.c-btn--primary');
    if (contBtn7) await contBtn7.click();
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(OUT_DIR, '12_onboarding_setup_progress.png') });
    console.log('✓ Captured: 12_onboarding_setup_progress.png');

    // Wait for progress to finish and reach "You're All Set!" (Step 12)
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUT_DIR, '13_onboarding_you_are_all_set.png') });
    console.log('✓ Captured: 13_onboarding_you_are_all_set.png');

    // Click "Go to Dashboard"
    const dashBtn = await page.$('button.c-btn--primary');
    if (dashBtn) await dashBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Helper to dismiss any open sheet/modal cleanly
    async function dismissOpenModal() {
      const closeBtn = await page.$('.c-sheet__close');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 350));
      }
    }

    // Dashboard Screen (Light Mode)
    await page.screenshot({ path: path.join(OUT_DIR, '14_dashboard_light.png') });
    console.log('✓ Captured: 14_dashboard_light.png');

    // Click on Menstrual Phase card to open Phase Education Modal
    const phaseCards = await page.$$('.v-phase-carousel-section > div > div');
    if (phaseCards.length > 0) {
      await phaseCards[0].click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '15_phase_education_modal.png') });
      console.log('✓ Captured: 15_phase_education_modal.png');
      // Close sheet
      await dismissOpenModal();
    }

    // Click on Health Trackers: Water
    const healthTrackersBtn = await page.$('.v-health-metrics-section button');
    if (healthTrackersBtn) {
      await healthTrackersBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '16_health_tracker_water.png') });
      console.log('✓ Captured: 16_health_tracker_water.png');

      // Click Weight tab
      const metricTabs = await page.$$('.v-health-trackers-sheet button');
      if (metricTabs.length >= 2) {
        await metricTabs[1].click();
        await new Promise(r => setTimeout(r, 300));
        await page.screenshot({ path: path.join(OUT_DIR, '17_health_tracker_weight.png') });
        console.log('✓ Captured: 17_health_tracker_weight.png');
      }

      // Click Temp tab
      if (metricTabs.length >= 3) {
        await metricTabs[2].click();
        await new Promise(r => setTimeout(r, 300));
        await page.screenshot({ path: path.join(OUT_DIR, '18_health_tracker_temp.png') });
        console.log('✓ Captured: 18_health_tracker_temp.png');
      }

      // Close modal
      await dismissOpenModal();
    }

    // Ensure all modals closed
    await dismissOpenModal();

    // Click Calendar Nav Tab
    const navItems = await page.$$('.v-sliding-nav-item');
    if (navItems.length >= 2) {
      await navItems[1].click(); // Calendar
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '19_calendar_view.png') });
      console.log('✓ Captured: 19_calendar_view.png');
    }

    // Click Log Nav Tab
    if (navItems.length >= 3) {
      await navItems[2].click(); // Log
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '20_daily_log_view.png') });
      console.log('✓ Captured: 20_daily_log_view.png');
    }

    // Click Insights Nav Tab
    if (navItems.length >= 4) {
      await navItems[3].click(); // Insights
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '21_insights_view.png') });
      console.log('✓ Captured: 21_insights_view.png');
    }

    // Click Care / Journal Tab
    if (navItems.length >= 5) {
      await navItems[4].click(); // Care
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '22_care_view.png') });
      console.log('✓ Captured: 22_care_view.png');
    }

    // Open Profile & Settings Sheet
    const profileBtn = await page.$('.v-subview-profile-btn');
    if (profileBtn) {
      await profileBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '23_settings_sheet.png') });
      console.log('✓ Captured: 23_settings_sheet.png');

      // Click "Upgrade" to test Premium Modal
      const upgradeBtn = await page.$('.v-profile-sheet button.c-btn--primary');
      if (upgradeBtn) {
        await upgradeBtn.click();
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(OUT_DIR, '24_premium_modal.png') });
        console.log('✓ Captured: 24_premium_modal.png');
      }

      // Close premium modal
      await dismissOpenModal();
      // Close settings sheet
      await dismissOpenModal();
    }

    // TEST DARK THEME! (Reference Sheet 2)
    console.log('Switching to Dark Theme...');
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    await new Promise(r => setTimeout(r, 400));

    // Return to Home tab in Dark Mode
    const navItemsDark = await page.$$('.v-sliding-nav-item');
    if (navItemsDark.length >= 1) {
      await navItemsDark[0].click(); // Home
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '25_dark_dashboard.png') });
      console.log('✓ Captured: 25_dark_dashboard.png');
    }

    // Dark Mode Calendar
    if (navItemsDark.length >= 2) {
      await navItemsDark[1].click(); // Calendar
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '26_dark_calendar.png') });
      console.log('✓ Captured: 26_dark_calendar.png');
    }

    // Dark Mode Daily Log
    if (navItemsDark.length >= 3) {
      await navItemsDark[2].click(); // Log
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, '27_dark_log.png') });
      console.log('✓ Captured: 27_dark_log.png');
    }

    await browser.close();

    console.log('============================================');
    console.log(`VALIDATION FINISHED WITH ${errors.length} ERRORS.`);
    console.log('============================================');
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
    }
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
