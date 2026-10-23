const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.resolve(__dirname, '..', 'public', 'fonts');
fs.mkdirSync(FONTS_DIR, { recursive: true });

const cssUrl = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Fraunces:opsz,wght@9..144,400..700&display=swap';

function fetchText(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location, headers));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadBinary(res.headers.location, dest));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching Google Fonts CSS with Chrome User-Agent...');
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const css = await fetchText(cssUrl, { 'User-Agent': ua });

  // Extract Manrope latin woff2
  // Look for /* latin */ blocks
  const blocks = css.split('/* ');
  let manropeUrl = null;
  let frauncesUrl = null;

  for (const block of blocks) {
    if (block.startsWith('latin */') || block.startsWith('latin-ext */')) {
      if (block.includes("font-family: 'Manrope'") && !manropeUrl) {
        const m = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
        if (m) manropeUrl = m[1];
      }
      if (block.includes("font-family: 'Fraunces'") && !frauncesUrl) {
        const m = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
        if (m) frauncesUrl = m[1];
      }
    }
  }

  // Fallbacks if not caught by latin split
  if (!manropeUrl) {
    const m = css.match(/font-family:\s*'Manrope'[\s\S]*?url\((https:\/\/[^)]+\.woff2)\)/);
    if (m) manropeUrl = m[1];
  }
  if (!frauncesUrl) {
    const m = css.match(/font-family:\s*'Fraunces'[\s\S]*?url\((https:\/\/[^)]+\.woff2)\)/);
    if (m) frauncesUrl = m[1];
  }

  console.log('Found Manrope WOFF2 URL:', manropeUrl);
  console.log('Found Fraunces WOFF2 URL:', frauncesUrl);

  if (manropeUrl) {
    const dest = path.join(FONTS_DIR, 'manrope-variable.woff2');
    await downloadBinary(manropeUrl, dest);
    console.log('Downloaded manrope-variable.woff2 (', fs.statSync(dest).size, 'bytes)');
  }
  if (frauncesUrl) {
    const dest = path.join(FONTS_DIR, 'fraunces-variable.woff2');
    await downloadBinary(frauncesUrl, dest);
    console.log('Downloaded fraunces-variable.woff2 (', fs.statSync(dest).size, 'bytes)');
  }
  console.log('Fonts self-hosting complete!');
}

main().catch(console.error);
