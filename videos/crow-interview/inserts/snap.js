// node snap.js <scene> t1 t2 ...  → /tmp/snap_<scene>.png (frames side by side)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process');
const [, , scene, ...ts] = process.argv;
(async () => {
  const html = path.join(__dirname, `.${scene}.html`); fs.writeFileSync(html, fs.readFileSync(path.join(__dirname, 'page.html'), 'utf8').replace('SCENE', scene));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const files = []; for (const t of ts) { await p.evaluate(t => render(t), +t); const f = `/tmp/snap_${scene}_${t}.png`; await p.screenshot({ path: f }); files.push(f); }
  await b.close(); fs.unlinkSync(html); if (errs.length) console.log('ERR', errs);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', `hstack=${files.length}`, `/tmp/snap_${scene}.png`]);
  console.log(`/tmp/snap_${scene}.png`);
})();
