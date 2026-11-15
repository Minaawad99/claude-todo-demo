// renders the YouTube channel art next to this file: node render.js [outDir] [guide]
// profile-*.png 800×800, banner-*.png 2560×1440. With "guide" as the 2nd argument the crop guides are drawn in.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || __dirname, guide = process.argv[3] === 'guide';
  const b = await chromium.launch();
  for (const [v, w, h] of [['profile1', 800, 800], ['profile2', 800, 800], ['profile3', 800, 800], ['profile4', 800, 800], ['banner1', 2560, 1440], ['banner2', 2560, 1440]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    p.on('pageerror', e => console.log('ERR', v, e.message));
    await p.goto('file://' + path.join(__dirname, 'youtube.html') + '?v=' + v + (guide ? '&guide=1' : ''));
    await p.waitForFunction('window.READY', null, { timeout: 20000 });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, v.replace(/(\d)$/, '-$1') + (guide ? '-guide' : '') + '.png') });
    await p.close();
  }
  await b.close();
})();
