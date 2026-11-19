const { chromium } = require('playwright');
(async () => { const [, , html, outdir] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('LOG', m.text()));
  await p.goto('file://' + html); await p.waitForTimeout(2500);
  const n = await p.evaluate(() => BOARDS.length);
  for (let i = 0; i < n; i++) { await (await p.$('#b' + i)).screenshot({ path: outdir + '/board' + (i + 1) + '.png' }); }
  await b.close(); console.log('boards', n); })();
