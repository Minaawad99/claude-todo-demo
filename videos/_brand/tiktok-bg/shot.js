// node shot.js out.png [page.html W H] → PNG (default index.html 1080×1920; wide: wide.html 1920 1080)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +(process.argv[4]||1080), height: +(process.argv[5]||1920) } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log(m.text()));
  await p.goto('file://' + __dirname + '/' + (process.argv[3]||'index.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.screenshot({ path: process.argv[2] }); await b.close(); })();
