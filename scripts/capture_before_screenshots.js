const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 8899;
const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECT_OUT = path.join(REPO_ROOT, 'docs', 'screenshots', 'before');
const ARTIFACT_OUT = 'C:\\Users\\PRATEEK DUBEY\\.gemini\\antigravity\\brain\\7e9f3b3a-058f-4ecb-b32a-3f82164e6f3d\\screenshots\\before';

fs.mkdirSync(PROJECT_OUT, { recursive: true });
fs.mkdirSync(ARTIFACT_OUT, { recursive: true });

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

// Static server
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(REPO_ROOT, reqPath.replace(/^\//, ''));

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

// Seed data generator in Node
function getRichState(mode = 'natural', theme = 'light') {
  return {
    _v: 2,
    ob: 1,
    cl: 28,
    pl: 5,
    ll: 14,
    reg: 'regular',
    mode: mode,
    pregnancyLmp: mode === 'pregnancy' ? '2026-06-15' : null,
    goals: ['cycle', 'symptoms', 'mood'],
    rem: 0,
    theme: theme,
    motion: 1,
    haptics: 1,
    showFertile: 1,
    careAlerts: 1,
    waterGoal: 1,
    rp: 2,
    rt: '20:00',
    rk: { prep: 1, log: 1 },
    dis: {},
    sent: {},
    discreetNotif: 0,
    periods: [
      { s: '2026-05-18', e: '2026-05-22' },
      { s: '2026-06-15', e: '2026-06-19' },
      { s: '2026-07-13', e: '2026-07-17' },
      { s: '2026-08-10', e: '2026-08-14' },
      { s: '2026-09-07', e: '2026-09-11' },
      { s: '2026-10-05', e: '2026-10-09' }
    ],
    logs: {
      '2026-10-05': { f: 3, m: 3, p: 4, e: 2, w: 5, cm: 'dry', med: ['ibuprofen'], sym: ['cramps_moderate', 'fatigue', 'lower_back'] },
      '2026-10-06': { f: 3, m: 2, p: 3, e: 2, w: 6, cm: 'dry', med: ['ibuprofen'], sym: ['cramps_mild', 'bloating'] },
      '2026-10-07': { f: 2, m: 2, p: 2, e: 3, w: 7, cm: 'sticky', med: [], sym: ['tender_breasts'] },
      '2026-10-08': { f: 1, m: 1, p: 1, e: 4, w: 6, cm: 'sticky', med: [], sym: [] },
      '2026-10-09': { f: 0, m: 1, p: 0, e: 4, w: 8, cm: 'creamy', med: [], sym: [] },
      '2026-10-18': { f: 0, m: 1, p: 0, e: 4, w: 7, cm: 'creamy', med: [], sym: [] },
      '2026-10-19': { f: 0, m: 0, p: 0, e: 5, w: 8, cm: 'watery', med: [], sym: ['high_energy'] },
      '2026-10-20': { f: 0, m: 0, p: 0, e: 5, w: 8, cm: 'ewcm', med: [], sym: ['libido_high'] },
      '2026-10-21': { f: 0, m: 0, p: 0, e: 4, w: 6, cm: 'ewcm', med: [], sym: ['ovulation_pain', 'libido_high'], n: 'Mid-cycle vitality, mild twinge right side.' }
    },
    journal: {
      '2026-10-21': {
        id: 'j-today',
        date: '2026-10-21',
        mood: 0,
        text: 'Morning walk in crisp autumn air. Feeling exceptionally clear-headed and energized. Cycle day 17 reflection.',
        tags: ['energy', 'gratitude', 'mindfulness'],
        updatedAt: Date.now()
      },
      '2026-10-05': {
        id: 'j-day1',
        date: '2026-10-05',
        mood: 3,
        text: 'Period arrived this morning. Cozy blankets, hot chamomile tea, resting without guilt.',
        tags: ['rest', 'self-care'],
        updatedAt: Date.now() - 16 * 86400000
      }
    },
    careKit: [
      { id: 'heat', title: 'Warm compress or heating pad', icon: 'flame', desc: 'Soothing warmth for pelvis or lower back', isFav: 1, isDefault: 1 },
      { id: 'tea', title: 'Soothing chamomile tea', icon: 'cup', desc: 'Warm comforting herbal infusion', isFav: 1, isDefault: 1 },
      { id: 'rest', title: 'Cozy horizontal pause', icon: 'moon', desc: 'Permission to rest without guilt', isFav: 1, isDefault: 1 },
      { id: 'fresh-air', title: 'Step outside for natural light', icon: 'sun', desc: 'Fresh air and mindful deep breaths', isFav: 1, isDefault: 1 }
    ],
    careDismissed: {},
    careSaved: { 'water-reminder': 1, 'chamomile-routine': 1 },
    careCheckin: {
      '2026-10-21': { feeling: 'calm', time: Date.now() }
    },
    careReminders: { period: 1, checkin: 1, prep: 1, journal: 1, routine: 0 }
  };
}

async function capture() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  const page = await browser.newPage();

  async function takeScreenshot(name, { width = 375, height = 812, state, uiProps, customEval } = {}) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
    
    await page.evaluate((s, u, customCode) => {
      if (s) window.S = s;
      if (u) window.ui = Object.assign(window.ui || {}, u);
      
      if (customCode === 'setLogDraft') {
        const L = (window.S.logs && window.S.logs['2026-10-21']) || {};
        window.dr = {
          d: '2026-10-21',
          f: L.f || 0,
          m: L.m ?? null,
          p: L.p ?? null,
          en: L.en || '',
          sl: L.sl ?? null,
          sq: L.sq || '',
          water: L.water || 6,
          cm: L.cm || 'ewcm',
          med: Array.isArray(L.med) ? [...L.med] : [],
          bbt: L.bbt || '97.8',
          lh: L.lh || 'positive',
          sy: { cramps_mild: 1, ovulation_pain: 1, libido_high: 1 },
          note: L.n || ''
        };
      }

      if (window.applyTheme) window.applyTheme();
      if (window.render) window.render();

      if (customCode === 'setFirstArticle') {
        const art = document.querySelector('[data-a="readArticle"]');
        if (art) art.click();
      }
    }, state, uiProps, customEval);

    // Wait a brief tick for render
    await new Promise(r => setTimeout(r, 150));

    const projPath = path.join(PROJECT_OUT, `${name}.png`);
    const artPath = path.join(ARTIFACT_OUT, `${name}.png`);
    const buf = await page.screenshot({ fullPage: false });
    fs.writeFileSync(projPath, buf);
    fs.writeFileSync(artPath, buf);
    console.log(`Saved screenshot: ${name}.png (${width}x${height})`);
  }

  // 1. Onboarding
  await takeScreenshot('01-onboarding-light', {
    state: { ob: 0, theme: 'light', motion: 1, haptics: 1 },
    uiProps: { obStep: 0 }
  });

  await takeScreenshot('01-onboarding-dark', {
    state: { ob: 0, theme: 'dark', motion: 1, haptics: 1 },
    uiProps: { obStep: 0 }
  });

  // 2. PIN Lock
  await takeScreenshot('02-pin-lock-light', {
    state: { ob: 1, theme: 'light' },
    uiProps: { pinLocked: true, pinInput: '12' }
  });

  await takeScreenshot('02-pin-lock-dark', {
    state: { ob: 1, theme: 'dark' },
    uiProps: { pinLocked: true, pinInput: '12' }
  });

  // 3. Home - Natural mode
  await takeScreenshot('03-home-natural-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  await takeScreenshot('03-home-natural-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 4. Home - TTC mode
  await takeScreenshot('04-home-ttc-light', {
    state: getRichState('ttc', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 5. Home - Pregnancy mode
  await takeScreenshot('05-home-pregnancy-light', {
    state: getRichState('pregnancy', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  await takeScreenshot('05-home-pregnancy-dark', {
    state: getRichState('pregnancy', 'dark'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 6. Home - Perimenopause mode
  await takeScreenshot('06-home-perimenopause-light', {
    state: getRichState('perimenopause', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  await takeScreenshot('06-home-perimenopause-dark', {
    state: getRichState('perimenopause', 'dark'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 7. Home - Contraception mode
  await takeScreenshot('07-home-contraception-light', {
    state: getRichState('contraception', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 8. Home - Irregular mode
  await takeScreenshot('08-home-irregular-light', {
    state: getRichState('irregular', 'light'),
    uiProps: { tab: 'home', prof: 0 }
  });

  // 9. Calendar
  await takeScreenshot('09-calendar-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'calendar', cYear: 2026, cMonth: 9, selDay: '2026-10-21' }
  });

  await takeScreenshot('09-calendar-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'calendar', cYear: 2026, cMonth: 9, selDay: '2026-10-21' }
  });

  // 10. Log
  await takeScreenshot('10-log-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'log' },
    customEval: 'setLogDraft'
  });

  await takeScreenshot('10-log-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'log' },
    customEval: 'setLogDraft'
  });

  // 11. Insights
  await takeScreenshot('11-insights-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'insights' }
  });

  await takeScreenshot('11-insights-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'insights' }
  });

  // 12. Care - Comfort tab
  await takeScreenshot('12-care-comfort-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'careComfort' }
  });

  await takeScreenshot('12-care-comfort-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'care', careTab: 'careComfort' }
  });

  // 13. Care - Journal tab
  await takeScreenshot('13-care-journal-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'journal' }
  });

  await takeScreenshot('13-care-journal-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'care', careTab: 'journal' }
  });

  // 14. Care - Cycle Guide tab
  await takeScreenshot('14-care-guide-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'guide' }
  });

  await takeScreenshot('14-care-guide-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'care', careTab: 'guide' }
  });

  // 15. Profile / Settings sheet
  await takeScreenshot('15-profile-settings-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', prof: 1 }
  });

  await takeScreenshot('15-profile-settings-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'home', prof: 1 }
  });

  // 16. Article modal
  await takeScreenshot('16-modal-article-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'guide' },
    customEval: 'setFirstArticle'
  });

  await takeScreenshot('16-modal-article-dark', {
    state: getRichState('natural', 'dark'),
    uiProps: { tab: 'care', careTab: 'guide' },
    customEval: 'setFirstArticle'
  });

  // 17. Partner modal
  await takeScreenshot('17-modal-partner-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', partnerModal: true }
  });

  // 18. Clinician summary modal
  await takeScreenshot('18-modal-clinician-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', clinicianModal: true }
  });

  // 19. Conflict modal
  await takeScreenshot('19-modal-conflict-light', {
    state: getRichState('natural', 'light'),
    uiProps: {
      tab: 'home',
      conflict: {
        overlap: { s: '2026-10-05', e: '2026-10-09' },
        date: '2026-10-07'
      }
    }
  });

  // 20. Info / Assistant modal
  await takeScreenshot('20-modal-info-assistant-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', infoTopic: 'bbt' }
  });

  // 21. Phase Tour modal
  await takeScreenshot('21-modal-phase-tour-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home', tourModal: true, tourTab: 0 }
  });

  // 22. Custom Care modal
  await takeScreenshot('22-modal-custom-care-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'careComfort', careCustomModal: true, careCustomIcon: 'flame' }
  });

  // 23. Delete Journal modal
  await takeScreenshot('23-modal-delete-journal-light', {
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'care', careTab: 'journal', deleteJournalConfirm: '2026-10-21' }
  });

  // 24. Tablet breakpoint (768x1024)
  await takeScreenshot('24-tablet-home-before-768x1024', {
    width: 768,
    height: 1024,
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home' }
  });

  // 25. Desktop breakpoint (1280x800)
  await takeScreenshot('25-desktop-home-before-1280x800', {
    width: 1280,
    height: 800,
    state: getRichState('natural', 'light'),
    uiProps: { tab: 'home' }
  });

  await browser.close();
  server.close();
  console.log('ALL BEFORE SCREENSHOTS CAPTURED CLEANLY!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
