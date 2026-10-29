const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('file://' + path.join(dir, 'episode.html'));
  await page.evaluate(() => window.ready);
  const dur = await page.evaluate(() => window.DURATION);
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const fps = 30, out = path.join(dir, only ? 'preview' : 'frames');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const times = only || [...Array(Math.round(dur * fps)).keys()].map(i => i / fps);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate(t => render(t), times[i]);
    await page.screenshot({ path: path.join(out, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  if (errs.length) console.error('ERRORS', errs);
  console.log('duration', dur, 'frames', times.length);
  await browser.close();
})();
