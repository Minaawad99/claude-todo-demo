// node cover-cutaway.js <out.png> [json view] — shoot the cutaway reel cover (1080×1920) from cover-cutaway.html
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2], view = JSON.parse(process.argv[3] || '{}');
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('err', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto('file://' + path.join(__dirname, 'cover-cutaway.html'));
  await p.waitForFunction(() => document.title === 'ready', null, { timeout: 600000 });
  const v = Object.assign({ p: [36, 15, 36], l: [.4, 5.4, -.4], f: 41, t: 30,
    vessels: [2.4, 3.4, 3],
    people: [['wipe-bisht', 3.15, .55, { flip: true }], ['floor-saudi', .6, 1.4, {}]] }, view);
  await p.evaluate(v => { COVER.people(v.people); COVER.vessels(v.vessels[0], v.vessels[1], v.vessels[2]); COVER.set(v); }, v);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 540, height: 960 } });
  await b.close();
})();
