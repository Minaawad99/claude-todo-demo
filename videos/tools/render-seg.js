// Render a page in segments, so a long render survives a container restart and uses every core:
//   node tools/render-seg.js <abs page.html> <segments dir> [seconds per segment = 15] [workers = 3]
// Each segment is a video-only MP4 (same encode as render.js) written as seg-NNN.mp4; finished ones are skipped on a
// re-run. When all are there it prints the ffmpeg line that joins them (-c copy) for the audio mux.
// Env: FPS (60), SCALE (3), TAIL (seconds after VIDEO_END, default 1.5).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const [, , html, dir, segS, nW] = process.argv; const FPS = +(process.env.FPS || 60), SCALE = +(process.env.SCALE || 3), TAIL = +(process.env.TAIL || 1.5), SEG = +(segS || 15), W = +(nW || 3);
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(); let p = await b.newPage({ viewport: { width: 360, height: 640 } }); await p.goto('file://' + html); await p.waitForTimeout(1500);
  const end = (await p.evaluate(() => window.VIDEO_END)) + TAIL, N = Math.ceil(end * FPS), per = SEG * FPS, n = Math.ceil(N / per); await p.close();
  const todo = []; for (let k = 0; k < n; k++) if (!fs.existsSync(path.join(dir, 'seg-' + String(k).padStart(3, '0') + '.mp4'))) todo.push(k);
  console.log(N, 'frames,', n, 'segments,', todo.length, 'to render');
  async function work() {
    const pg = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: SCALE }); await pg.goto('file://' + html); await pg.waitForTimeout(3000);
    for (;;) { const k = todo.shift(); if (k == null) break;
      const out = path.join(dir, 'seg-' + String(k).padStart(3, '0') + '.mp4'), tmp = out + '.part.mp4', a = k * per, z = Math.min(N, a + per);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.2', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', String(FPS * 2), tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let i = a; i < z; i++) { await pg.evaluate(t => renderAt(t), i / FPS); const buf = await pg.screenshot({ type: 'jpeg', quality: 100 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(tmp, out); console.log('segment', k, 'done'); }
    await pg.close();
  }
  await Promise.all(Array.from({ length: Math.min(W, Math.max(1, todo.length)) }, work)); await b.close();
  fs.writeFileSync(path.join(dir, 'list.txt'), Array.from({ length: n }, (_, k) => "file 'seg-" + String(k).padStart(3, '0') + ".mp4'").join('\n') + '\n');
  console.log('all segments done. join: ffmpeg -f concat -safe 0 -i ' + path.join(dir, 'list.txt') + ' -c copy video.mp4 ; duration', (N / FPS).toFixed(3));
})();
