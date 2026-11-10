// one frame of a page at time t: node frame.js <abs html> <out.png> <t>
const { chromium } = require('playwright');
(async () => { const [, , html, out, t] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(1000);
  await p.evaluate(t => renderAt(t), +t); await p.screenshot({ path: out }); await b.close(); })();
