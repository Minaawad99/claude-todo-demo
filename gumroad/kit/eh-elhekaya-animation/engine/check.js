// يفحص الرسم: أخطاء JavaScript، أرقام بايظة (NaN) في الرسم، ولقطة من نص كل مشهد في صورة واحدة.
// node check.js <index.html> <sheet.png>
const { chromium } = require('playwright');
const [, , html, sheet] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 360, height: 640 } });
  const errs = [];
  p.on('pageerror', e => errs.push('خطأ في الكود: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto('file://' + html);
  await p.evaluate(() => document.fonts.ready);
  const T = await p.evaluate(() => window.TIMING.lines.map(l => [l.start, l.end]));
  const shots = []; let bad = 0;
  for (let i = 0; i < T.length; i++) {
    for (const k of [0.15, 0.5, 0.9]) {
      const t = T[i][0] + (T[i][1] - T[i][0]) * k;
      const r = await p.evaluate(t => { try { renderAt(t); const s = document.getElementById('panel').innerHTML; return /NaN|undefined/.test(s) ? 'bad' : (s.length < 200 ? 'empty' : 'ok'); } catch (e) { return 'err:' + e.message; } }, t);
      if (r !== 'ok') { bad++; errs.push(`السطر ${i} عند ${t.toFixed(1)}ث: ${r === 'bad' ? 'فيه NaN أو undefined في الرسم' : r === 'empty' ? 'المشهد فاضي' : r}`); }
      if (k === 0.5) shots.push('data:image/jpeg;base64,' + (await p.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
    }
  }
  const cols = 6, W = 180, H = 320;
  const g = await b.newPage({ viewport: { width: cols * W, height: Math.ceil(shots.length / cols) * (H + 22) } });
  await g.setContent('<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(' + cols + ',' + W + 'px);font:700 13px sans-serif;color:#fff">' +
    shots.map((s, i) => '<div><img src="' + s + '" width="' + W + '" height="' + H + '" style="display:block"><div style="height:22px;text-align:center">' + i + '</div></div>').join('') + '</body>');
  await g.screenshot({ path: sheet, fullPage: true });
  await b.close();
  if (errs.length) { console.log('✗ فيه مشاكل:'); [...new Set(errs)].slice(0, 30).forEach(e => console.log('  - ' + e)); }
  else console.log('✓ مفيش أخطاء في الرسم');
  console.log('✓ صورة المشاهد:', sheet);
  process.exit(errs.length ? 2 : 0);
})();
