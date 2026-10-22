import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const svgPath = path.resolve('public/favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const targets = [
  { file: 'public/favicon-32x32.png', size: 32 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 }
];

async function generate() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.size, height: t.size });
    
    // Set SVG as body content with transparent background
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: transparent; overflow: hidden; }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.screenshot({ omitBackground: true, type: 'png' });
    fs.writeFileSync(path.resolve(t.file), buffer);
    console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
    await page.close();
  }

  // Also create a copy of 32x32 as favicon.ico
  fs.copyFileSync(path.resolve('public/favicon-32x32.png'), path.resolve('public/favicon.ico'));
  console.log('Copied favicon-32x32.png -> public/favicon.ico');

  await browser.close();
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
