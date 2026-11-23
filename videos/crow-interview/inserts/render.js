// node render.js <scene> [fps]  →  out/<scene>.mp4 (1080×1920, silent)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const [, , scene, fpsArg] = process.argv; const FPS = +(fpsArg || 30);
(async () => {
  const dir = __dirname, html = path.join(dir, `.${scene}.html`);
  fs.writeFileSync(html, fs.readFileSync(path.join(dir, 'page.html'), 'utf8').replace('SCENE', scene));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const D = await p.evaluate(() => DURATION); const N = Math.round(D * FPS);
  fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', path.join(dir, 'out', scene + '.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { await p.evaluate(t => render(t), i / FPS); ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 92 })); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); fs.unlinkSync(html); console.log(scene, D + 's', N, 'frames');
})();
