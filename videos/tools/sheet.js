// contact sheet: one frame of the 16:9 panel per script line at start+off: node sheet.js <abs html> <out prefix> [off]; frames land in <out prefix>.d/
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [, , html, out, offs] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(1200);
  const L = await p.evaluate(() => TIMING.lines.map(l => [l.start, l.end])); const shots = [];
  for (let i = 0; i < L.length; i++) { const t = Math.min(L[i][1], L[i][0] + (+offs || 1.6)); await p.evaluate(t => renderAt(t), t); shots.push(await p.screenshot({ clip: { x: 0, y: 196, width: 360, height: 203 } })); }
  await b.close(); const dir = out + '.d'; fs.mkdirSync(dir, { recursive: true }); shots.forEach((s, i) => fs.writeFileSync(dir + '/' + String(i).padStart(2, '0') + '.png', s)); })();
