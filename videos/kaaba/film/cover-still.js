// node cover-still.js <out-prefix> <t1> [t2 ...] — clean 1080×1920 stills of the 3D world (no captions, cards, chips, labels or brand) for the reel cover
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [, , out, ...ts] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 300000 });
  await p.addStyleTag({ content: '#labs,#card,#hud,#capbox,#ask,.brand,.vig{display:none!important} #gl{filter:none!important;transform:none!important}' });
  for (const t of ts) { await p.evaluate(t => renderAt(t), +t); await p.screenshot({ path: out + '-' + t + '.png' }); console.log(t); }
  await b.close();
})();
