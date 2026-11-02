// Prints title+body line counts for every card: node lines.js $PWD/videos/<slug>/list/index.html (bodies must be 2).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => [...document.querySelectorAll('.card')].map(c => { const h=c.querySelector('h2'), q=c.querySelector('p');
    const lh = el => el ? Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)) : 0;
    return lh(h) + '+' + lh(q) + '  ' + h.textContent.trim(); }));
  console.log(r.join('\n')); await b.close(); })();
