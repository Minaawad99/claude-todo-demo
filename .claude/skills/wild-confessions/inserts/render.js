// Render one motion-graphic scene to a silent 1080×1920 MP4.
//   node render.js <scene.js> [out dir (default: <scene dir>/out)] [fps (default 30)]
// A scene file defines DURATION and render(t); it can use everything in lib.js. SHOW (the show name) comes from the
// SHOW environment variable and is visible to scenes as the global SHOW.
// Also: node render.js --still <scene.js> <out.png> [t]   renders one frame with a transparent background (watermark).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const LIB = path.join(__dirname, 'lib.js');
function page(scene, transparent) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Kufi+Arabic:wght@700&display=swap" rel="stylesheet">
<style>html,body{margin:0;background:${transparent ? 'transparent' : '#121010'}}svg{display:block;width:360px;height:640px}</style>
</head><body><svg id="s" viewBox="0 0 360 640"></svg>
<script>const SHOW = ${JSON.stringify(process.env.SHOW || 'اعترافات برّية')}; const NEXT = ${JSON.stringify(process.env.NEXT || 'مين ضيف الحلقة الجاية؟ قولولنا')};</script>
<script src="file://${LIB}"></script><script src="file://${path.resolve(scene)}"></script></body></html>`;
}
(async () => {
  const still = process.argv[2] === '--still';
  const scene = still ? process.argv[3] : process.argv[2];
  const html = path.join(path.dirname(path.resolve(scene)), `.render-${path.basename(scene)}.html`);
  fs.writeFileSync(html, page(scene, still));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  if (errs.length) { console.error(errs); process.exit(1); }
  if (still) {
    await p.evaluate(t => render(t), +(process.argv[5] || 1)); await p.screenshot({ path: process.argv[4], omitBackground: true });
  } else {
    const outDir = process.argv[3] || path.join(path.dirname(path.resolve(scene)), 'out'); const FPS = +(process.argv[4] || 30);
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, path.basename(scene, '.js') + '.mp4');
    const D = await p.evaluate(() => DURATION); const N = Math.round(D * FPS);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < N; i++) { await p.evaluate(t => render(t), i / FPS); ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 92 })); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(out, D + 's');
  }
  await b.close(); fs.unlinkSync(html);
})();
