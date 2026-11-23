// node lab.js <abs index.html> <out.png> <viewBox "x y w h"> <js expr returning svg, may use t> [W H]
const { chromium } = require('playwright');
(async () => { const [, , html, out, vb, expr, W, H] = process.argv; const w = +(W || 800), h = +(H || 800);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('file://' + html); await p.waitForTimeout(800);
  await p.evaluate(([vb, expr, w, h]) => { renderAt(20); window.__t = 1.3; const t = 1.3; const s = eval(expr);
    const d = document.createElement('div'); d.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;z-index:99;background:#eee5d0`;
    d.innerHTML = `<svg viewBox="${vb}" width="${w}" height="${h}">${s}</svg>`; document.body.appendChild(d); }, [vb, expr, w, h]);
  await p.screenshot({ path: out }); await b.close(); })();
