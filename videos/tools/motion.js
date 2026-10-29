// screenshot a time range at 30fps (low res) and print the per-frame change, same metric as qa.py
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
(async () => {
  const [html, a, b] = [process.argv[2], +process.argv[3], +process.argv[4]];
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 360, height: 640 } });
  await p.goto('file://' + html); await p.waitForTimeout(400);
  let prev = null, run = 0, worst = 0, at = 0;
  for (let t = a; t <= b; t += 1 / 30) {
    await p.evaluate(t => window.renderAt(t), t);
    const buf = await p.screenshot({ type: 'png' });
    const g = execFileSync('ffmpeg', ['-v', 'error', '-i', '-', '-vf', 'scale=135:240,format=gray', '-f', 'rawvideo', '-'], { input: buf });
    if (prev) { let s = 0; for (let i = 0; i < g.length; i++) s += Math.abs(g[i] - prev[i]); const d = s / g.length; run = d < 0.25 ? run + 1 : 0; if (run > worst) { worst = run; at = t; } }
    prev = g;
  }
  console.log(`${a}-${b}: longest still ${(worst / 30).toFixed(2)}s ending at ${at.toFixed(2)}`); await br.close();
})();
