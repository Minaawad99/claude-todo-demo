// Render a طب إزاي؟ video page to MP4, frame by frame.
// Usage: node render.js <page.html> <audio.wav> <out.mp4>
// Env: FPS (default 60), SCALE (default 3 → 1080×1920 from the 360×640 canvas), TAIL (s after the voice, default 2.3)
// Output follows Facebook/Instagram Reels specs: H.264 High, yuv420p, 1080×1920, AAC 48 kHz.
const { chromium } = require('playwright');
const { spawn } = require('child_process');

const [, , html, audio, out] = process.argv;
const FPS = +(process.env.FPS || 60);
const SCALE = +(process.env.SCALE || 3);
const TAIL = +(process.env.TAIL || 2.3);

(async () => {
  // Software WebGL (SwiftShader) only for real-3D pages (three.js): it makes plain SVG pages ~3× slower.
  const gl = /<canvas id="gl"/.test(require('fs').readFileSync(html, 'utf8'));
  const b = await chromium.launch(gl ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } : {});
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: SCALE });
  await p.goto('file://' + html);
  await p.waitForTimeout(3000); // fonts
  const end = (await p.evaluate(() => window.VIDEO_END)) + TAIL;
  const N = Math.ceil(end * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', audio,
    '-map', '0:v', '-map', '1:a', '-t', String(N / FPS),
    '-vf', `fade=t=out:st=${end - 0.6}:d=0.6`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.2', '-preset', 'slow', '-crf', '15',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', String(FPS * 2),
    '-af', `apad,afade=t=out:st=${end - 0.8}:d=0.8,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.8:level=false`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => renderAt(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 100 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 600 === 0) console.log('frame', i, '/', N);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('done', N, 'frames at', FPS, 'fps,', 360 * SCALE + 'x' + 640 * SCALE);
  await b.close();
})();
