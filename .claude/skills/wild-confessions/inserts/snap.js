// Look at a scene before rendering it: node snap.js <scene.js> <out.png> t1 t2 ...  (frames side by side, 360×640 each)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process');
const [, , scene, outPng, ...ts] = process.argv;
(async () => {
  const src = fs.readFileSync(path.join(__dirname, 'render.js'), 'utf8');
  const LIB = path.join(__dirname, 'lib.js');
  const html = path.join(path.dirname(path.resolve(scene)), `.snap-${path.basename(scene)}.html`);
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Kufi+Arabic:wght@700&display=swap" rel="stylesheet"><style>html,body{margin:0;background:#121010}svg{display:block;width:360px;height:640px}</style></head><body><svg id="s" viewBox="0 0 360 640"></svg><script>const SHOW=${JSON.stringify(process.env.SHOW || 'اعترافات برّية')};const NEXT=${JSON.stringify(process.env.NEXT || 'مين ضيف الحلقة الجاية؟ قولولنا')};</script><script src="file://${LIB}"></script><script src="file://${path.resolve(scene)}"></script></body></html>`);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const files = []; for (const [i, t] of ts.entries()) { await p.evaluate(t => render(t), +t); const f = `${outPng}.${i}.png`; await p.screenshot({ path: f }); files.push(f); }
  await b.close(); fs.unlinkSync(html); if (errs.length) console.log('ERRORS', errs);
  if (files.length > 1) execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', `hstack=${files.length}`, outPng]); else fs.renameSync(files[0], outPng);
  files.forEach(f => fs.existsSync(f) && fs.unlinkSync(f)); console.log(outPng);
})();
