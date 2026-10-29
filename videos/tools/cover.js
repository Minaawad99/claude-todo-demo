// screenshot a reel cover page at 540x960 @2x: node cover.js <abs html> <out.png>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2000); await p.screenshot({ path: process.argv[3] }); await b.close(); })();
