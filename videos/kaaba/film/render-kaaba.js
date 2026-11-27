// node render-kaaba.js <audio.wav> <out.mp4> [from] [to] — renders the film page frame by frame (waits for the 3D world and the sprites)
// Env: FPS (default 60), SCALE (3 → 1080×1920)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
const [, , audio, out, from, to] = process.argv; const FPS = +(process.env.FPS || 60), SCALE = +(process.env.SCALE || 3);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: SCALE });
  p.on('pageerror', e => console.log('err', e.message));
  if (process.env.GL_RATIO) await p.addInitScript(r => { window.GL_RATIO = r; }, +process.env.GL_RATIO);
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 600000 });
  const end = await p.evaluate(() => window.VIDEO_END), t0 = from ? +from : 0, t1 = to ? +to : end, N = Math.ceil((t1 - t0) * FPS);
  const args = ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (audio !== '-') args.push('-ss', String(t0), '-i', audio, '-map', '0:v', '-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
  args.push('-t', String(N / FPS), '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] }); const st = Date.now();
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => renderAt(t), t0 + i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log('frame', i, '/', N, ((Date.now() - st) / 1000 / (i + 1)).toFixed(2) + 's/frame');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', N, ((Date.now() - st) / 1000 / N).toFixed(2) + 's/frame'); await b.close();
})();
