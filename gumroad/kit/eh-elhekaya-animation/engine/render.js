// يطلع الفيديو: يصوّر الصفحة فريم فريم ويركّب الصوت.
// node render.js <index.html> <mix.wav> <out.mp4>     (FPS=30 افتراضي، SCALE=3 → 1080×1920)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const [, , html, audio, out] = process.argv;
const FPS = +(process.env.FPS || 30), SCALE = +(process.env.SCALE || 3), TAIL = +(process.env.TAIL || 1.5);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: SCALE });
  await p.goto('file://' + html);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const end = (await p.evaluate(() => window.VIDEO_END)) + TAIL, N = Math.ceil(end * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
    '-map', '0:v', '-map', '1:a', '-t', String(N / FPS), '-vf', `fade=t=out:st=${end - 0.6}:d=0.6`,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', String(FPS * 2),
    '-af', `apad,afade=t=out:st=${end - 0.8}:d=0.8,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.7:level=false`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => renderAt(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (FPS * 10) === 0) { const el = (Date.now() - t0) / 1000, left = i ? el / i * (N - i) : 0; console.log(`فريم ${i}/${N}` + (i ? ` — فاضل حوالي ${Math.ceil(left / 60)} دقيقة` : '')); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log(`✓ ${N} فريم، ${360 * SCALE}×${640 * SCALE}، ${FPS} فريم/ثانية`);
})();
