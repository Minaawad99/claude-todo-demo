// Width of each card body's last line: node lastline.js $PWD/videos/<slug>/list/index.html. Under ~120 px = a lone word; rewrite.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => [...document.querySelectorAll('.card p')].map(el => {
    const rg = document.createRange(); rg.selectNodeContents(el); const rects = [...rg.getClientRects()];
    const lines = {}; rects.forEach(r => { const k = Math.round(r.top); lines[k] = (lines[k] || 0) + r.width; });
    const ws = Object.values(lines); return Math.round(ws[ws.length - 1]) + 'px last line / ' + ws.length + ' lines  ' + el.closest('.card').querySelector('h2').textContent.trim(); }));
  console.log(r.join('\n')); await b.close(); })();
