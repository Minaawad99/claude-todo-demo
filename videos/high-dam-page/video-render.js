const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
const src = fs.readFileSync(path.join(dir, 'high-dam-power.html'), 'utf8');
const scene = src.match(/<svg id="scene"[\s\S]*?<\/svg>/)[0];
fs.writeFileSync(path.join(dir, 'video.html'), fs.readFileSync(path.join(dir, 'video-template.html'), 'utf8').replace('<!--SCENE-->', scene));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.join(dir, 'video.html'));
  await page.evaluate(() => document.fonts.ready);
  if (errs.length) { console.error(errs); process.exit(1); }
  const dur = await page.evaluate(() => window.DURATION);
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const fps = 30, out = path.join(dir, only ? 'preview' : 'frames');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const times = only || [...Array(Math.round(dur * fps)).keys()].map(i => i / fps);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate(t => render(t), times[i]);
    await page.screenshot({ path: path.join(out, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  console.log('duration', dur, 'frames', times.length);
  await browser.close();
})();
