// full frames at given times, tiled into one PNG (motion / transition check):
// node strip.js <abs html> <out.png> <cols> <t1> <t2> ...   (prints page errors)
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
(async () => { const [, , html, out, cols, ...ts] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(1500);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'strip')); const files = [];
  for (let i = 0; i < ts.length; i++) { await p.evaluate(t => renderAt(t), +ts[i]); const f = path.join(dir, String(i).padStart(3, '0') + '.png'); await p.screenshot({ path: f }); files.push(f); }
  await b.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.png'), '-vf', `scale=240:-1,tile=${cols}x${Math.ceil(ts.length / cols)}:padding=4:color=white`, '-frames:v', '1', out]);
  fs.rmSync(dir, { recursive: true }); })();
