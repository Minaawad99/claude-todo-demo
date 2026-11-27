// node render-chunks.js <outdir> <worker> <workers> [chunkSec] — resumable render: the film in short chunks (chunk-NNN.mp4, video only),
// each worker takes every <workers>-th chunk and skips chunks already done, so a stopped run picks up where it left off.
// Env: FPS (default 30), SCALE (3 → 1080×1920). Join with ffmpeg concat (-c copy) in chunk order.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const [, , outdir, W, WN, CS] = process.argv; const FPS = +(process.env.FPS || 30), SCALE = +(process.env.SCALE || 3), csec = +(CS || 5);
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: SCALE });
  p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 600000 });
  const end = await p.evaluate(() => window.VIDEO_END), total = Math.ceil(end * FPS), per = Math.round(csec * FPS), nC = Math.ceil(total / per);
  for (let c = +W; c < nC; c += +WN) {
    const name = path.join(outdir, 'chunk-' + String(c).padStart(3, '0') + '.mp4'); if (fs.existsSync(name)) continue;
    if (c !== +W) { await p.reload(); await p.waitForFunction(() => document.title === 'ready', null, { timeout: 600000 }); } // fresh WebGL state per chunk: a long-lived page once rendered whole chunks as a flat dark panel
    const f0 = c * per, n = Math.min(per, total - f0), part = name + '.part.mp4', st = Date.now();
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-profile:v', 'high',
      '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => renderAt(t), (f0 + i) / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(part, name);
    console.log('chunk', c, '/', nC, ((Date.now() - st) / 1000 / n).toFixed(2) + 's/frame');
  }
  await b.close(); console.log('worker done');
})();
