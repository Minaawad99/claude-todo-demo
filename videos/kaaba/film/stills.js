// node stills.js <out.png> <t1> <t2> ... — renders the film page at those times and tiles them (for review)
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const path = require('path');
(async () => {
  const [, , out, ...ts] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('err', e.message)); p.on('console', m => { if (!/GPU stall/.test(m.text())) console.log('log', m.text()); });
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 300000 });
  const files = [];
  for (const t of ts) { await p.evaluate(t => renderAt(t), +t); const f = out.replace(/\.png$/, '') + '-' + t + '.png'; await p.screenshot({ path: f }); files.push(f); }
  await b.close();
  if (files.length > 1) execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', `hstack=${files.length}`, out]);
})();
