const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
(async () => {
  const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.text()));
  await page.goto('file://' + path.join(dir, 'pump.html'));
  await page.evaluate(() => window.ready);
  const dur = await page.evaluate(() => window.DURATION);
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const fps = 30, out = path.join(dir, only ? 'preview' : 'frames');
  if (only) fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const all = [...Array(Math.round(dur * fps)).keys()];
  const [wk, nw] = (process.env.WORKER || '0/1').split('/').map(Number);
  const R = (process.env.RANGE || '').split('-').map(Number);
  const idx = only ? only.map((_, i) => i) : all.filter(i => i % nw === wk && (!process.env.RANGE || (i >= R[0] && i <= R[1])));
  const times = only || idx.map(i => i / fps);
  const t0 = Date.now();
  for (let i = 0; i < times.length; i++) {
        await page.evaluate(t => render(t), times[i]);
    const data = await page.evaluate(() => frameData()); fs.writeFileSync(path.join(out, String(only ? i : idx[i]).padStart(5, '0') + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    if (!only && i % 300 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  if (errs.length) console.error('ERRORS', [...new Set(errs)].slice(0, 10));
  console.log('duration', dur, 'frames', times.length, 'time', ((Date.now() - t0) / 1000).toFixed(0) + 's');
  await browser.close();
})();
