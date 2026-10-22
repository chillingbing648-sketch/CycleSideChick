import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function run() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { shell: true });
  await new Promise(r => setTimeout(r, 2000));

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    const outDir = 'C:\\Users\\PRATEEK DUBEY\\.gemini\\antigravity\\brain\\ff9e1534-ba9c-4c4c-a343-2c4dbbcf47ad';

    // 1. Capture Light Mode
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('csc.v1') || '{}');
      state.ob = 1;
      state.theme = 'light';
      localStorage.setItem('csc.v1', JSON.stringify(state));
      window.location.reload();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.click('button[data-tab="log"]');
    await new Promise(r => setTimeout(r, 800));

    // Select some items to preview active states: Mood (Great), Energy (Balanced), Symptom (Cramps, Headache)
    await page.evaluate(() => {
      // Click Calm mood
      const moodBtn = document.querySelector('.v-chips-row--moods button:nth-child(2)');
      if (moodBtn) moodBtn.click();
      // Click Balanced energy
      const energyBtn = document.querySelector('.v-chips-row--energy button:nth-child(2)');
      if (energyBtn) energyBtn.click();
      // Click Cramps & Headache symptoms
      const symptomBtns = document.querySelectorAll('.v-chips-grid button');
      if (symptomBtns[0]) symptomBtns[0].click();
      if (symptomBtns[2]) symptomBtns[2].click();
    });
    await new Promise(r => setTimeout(r, 400));

    const lightPath = path.join(outDir, 'log_view_light_refined.png');
    await page.screenshot({ path: lightPath, fullPage: true });
    console.log('Saved light screenshot to:', lightPath);

    // 2. Capture Dark Mode
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('csc.v1') || '{}');
      state.theme = 'dark';
      localStorage.setItem('csc.v1', JSON.stringify(state));
      window.location.reload();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.click('button[data-tab="log"]');
    await new Promise(r => setTimeout(r, 800));

    const darkPath = path.join(outDir, 'log_view_dark_refined.png');
    await page.screenshot({ path: darkPath, fullPage: true });
    console.log('Saved dark screenshot to:', darkPath);

    await browser.close();
  } finally {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
    } else {
      server.kill();
    }
  }
}

run();
