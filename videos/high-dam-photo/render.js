const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
const have = fs.readdirSync(path.join(dir, 'img')).filter(f => /^[a-z0-9]+\.jpg$/.test(f) && fs.statSync(path.join(dir, 'img', f)).size > 10000).map(f => f.replace('.jpg', ''));
global.HAVE = have;
const src = fs.readFileSync(path.join(dir, 'scenes.js'), 'utf8');
const used = [...new Set(eval(src + ';SCENES').filter(s => s.img).map(s => s.img))];
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const credits = used.map(k => `${meta[k].title.replace(/^File:/, '')} — ${strip(meta[k].artist)} (${meta[k].lic}), Wikimedia Commons`);
fs.writeFileSync(path.join(dir, 'have.js'), `const HAVE = ${JSON.stringify(have)};\nconst CREDITS = ${JSON.stringify(credits)};\n`);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('file://' + path.join(dir, 'film.html'));
  await page.evaluate(() => window.ready);
  if (errs.length) { console.error(errs); process.exit(1); }
  const dur = await page.evaluate(() => window.DURATION);
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const fps = 30, out = path.join(dir, only ? 'preview' : 'frames');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const times = only || [...Array(Math.round(dur * fps)).keys()].map(i => i / fps);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate(t => render(t), times[i]);
    await page.screenshot({ path: path.join(out, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  }
  console.log('duration', dur, 'frames', times.length, 'scenes', await page.evaluate(() => SCENES.map(s => s.key + '@' + s.t0.toFixed(1)).join(' ')));
  await browser.close();
})();
