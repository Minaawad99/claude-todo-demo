// full-frame contact sheet for a «لو» episode (9:16, no panel): node videos/tools/fsheet.js <abs index.html> <out dir> [offset s]; one PNG per script line
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [, , html, out, offs] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(1500);
  const L = await p.evaluate(() => TIMING.lines.map(l => [l.start, l.end])); fs.mkdirSync(out, { recursive: true });
  for (let i = 0; i < L.length; i++) { const t = Math.min(L[i][1], L[i][0] + (+offs || 2)); await p.evaluate(t => renderAt(t), t); await p.screenshot({ path: out + '/' + String(i).padStart(2, '0') + '.png' }); }
  await b.close(); })();
