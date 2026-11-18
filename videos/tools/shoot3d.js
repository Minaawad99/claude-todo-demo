// node shoot3d.js <abs html> <out.png> — 360×640 page at 3x with software WebGL
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000); await p.screenshot({ path: process.argv[3] }); await b.close(); })();
