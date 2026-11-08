// every still run longer than 0.5 s in a page, full frame, same metric and threshold as qa.py (catch them before a 20-minute render):
// node stills.js <abs index.html> <from s> <to s>
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const { execFileSync } = require('child_process');
(async () => {
  const [html, a, b] = [process.argv[2], +process.argv[3], +process.argv[4]];
  const br = await pw.chromium.launch(); const p = await br.newPage({ viewport: { width: 360, height: 640 } });
  await p.goto('file://' + html); await p.waitForTimeout(800);
  let prev = null, run = 0, n = 0;
  for (let t = a; t <= b; t += 1 / 30) {
    await p.evaluate(t => window.renderAt(t), t);
    const g = execFileSync('ffmpeg', ['-v', 'error', '-i', '-', '-vf', 'scale=135:240,format=gray', '-f', 'rawvideo', '-'], { input: await p.screenshot({ type: 'png' }) });
    if (prev) { let s = 0; for (let i = 0; i < g.length; i++) s += Math.abs(g[i] - prev[i]); if (s / g.length < 0.25) run++; else { if (run > 15) { console.log('still', (t - run / 30).toFixed(2) + 's', (run / 30).toFixed(2) + 's'); n++; } run = 0; } }
    prev = g;
  }
  console.log(n ? n + ' still runs over 0.5 s (qa.py fails over 0.75 s)' : 'no still runs over 0.5 s'); await br.close();
})();
