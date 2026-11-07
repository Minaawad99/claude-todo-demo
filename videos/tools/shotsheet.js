// one full-frame screenshot per script line at start + frac*(length): node shotsheet.js <abs html> <out dir> [frac=0.6]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [, , html, out, frac] = process.argv; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1.5 });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(1500);
  const L = await p.evaluate(() => TIMING.lines.map(l => [l.start, l.end]));
  for (let i = 0; i < L.length; i++) { const t = L[i][0] + (+(frac || 0.6)) * (L[i][1] - L[i][0]); await p.evaluate(t => renderAt(t), t); await p.screenshot({ path: out + '/' + String(i).padStart(2, '0') + '.png' }); }
  await b.close(); })();
