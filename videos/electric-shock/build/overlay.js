// Renders every overlay state (events.json) to a transparent 1080×1920 PNG and writes an ffmpeg concat list.
// node overlay.js <events.json> <outdir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [, , evf, outdir] = process.argv;
const ev = JSON.parse(fs.readFileSync(evf, 'utf8'));
fs.mkdirSync(outdir, { recursive: true });

const page = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@600;800;900&display=swap" rel="stylesheet">
<style>
html,body{margin:0;background:transparent}
#c{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:"Noto Sans Arabic",sans-serif}
#shade{position:absolute;left:0;right:0;top:0;height:640px;background:linear-gradient(#0b0f16e6,#0b0f1699 55%,#0b0f1600)}
#cap{position:absolute;left:70px;right:70px;top:230px;text-align:center;font:800 70px/1.45 "Noto Sans Arabic";color:#fff;text-shadow:0 4px 18px #000c}
#cap span{opacity:.32;margin:0 .12em}
#cap span.on{opacity:1}
.r{color:#ff5a48}.b{color:#5cc8ff}.g{color:#ffc94d}
#chip{position:absolute;left:0;right:0;top:1560px;text-align:center}
#chip div{display:inline-block;padding:18px 44px;border-radius:60px;background:#0d131cdd;border:4px solid #ffc94d;font:800 58px "Noto Sans Arabic";color:#fff;box-shadow:0 0 40px #ffc94d55}
#x{position:absolute;left:340px;top:820px;width:400px;height:400px}
#stamp{position:absolute;left:40px;right:40px;top:300px;text-align:center;font:900 112px "Noto Sans Arabic";color:#ff4d3a;text-shadow:0 0 30px #ff2a1a,0 6px 20px #000}
.ic{position:absolute;border-radius:48px;border:7px solid #ffffff22;box-sizing:border-box}
.ic.on{border-color:#4cd97b;box-shadow:0 0 30px #4cd97b88}
.ic.cur{border-color:#ffc94d;box-shadow:0 0 50px #ffc94dcc}
</style></head><body><div id="c"></div></body></html>`;

function html(s) {
  let h = '';
  if (s.cap || s.stamp) h += '<div id="shade"></div>';
  if (s.cap) h += '<div id="cap">' + s.cap.map(([w, on, c]) => `<span class="${c} ${on ? 'on' : ''}">${w}</span>`).join(' ') + '</div>';
  if (s.stamp) h += `<div id="stamp">${s.stamp}</div>`;
  if (s.chips.length) h += `<div id="chip"><div>${s.chips[0].replace(/([0-9][0-9–]*)/g, '<span class="g" dir="ltr" style="unicode-bidi:isolate">$1</span>')}</div></div>`;
  if (s.x) h += `<svg id="x" viewBox="0 0 400 400"><circle cx="200" cy="200" r="170" fill="#0d131c99" stroke="#ff4d3a" stroke-width="22"/><path d="M125 125 L275 275 M275 125 L125 275" stroke="#ff4d3a" stroke-width="30" stroke-linecap="round"/></svg>`;
  if (s.recap) h += s.recap.map(r => `<div class="ic ${r.on ? 'on' : ''} ${r.cur ? 'cur' : ''}" style="left:${r.x - r.s / 2}px;top:${r.y - r.s / 2}px;width:${r.s}px;height:${r.s}px"></div>`).join('');
  return h;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(page); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const list = [];
  for (let i = 0; i < ev.length; i++) {
    await p.evaluate(h => { document.getElementById('c').innerHTML = h; return document.fonts.ready; }, html(ev[i].s));
    const f = path.join(outdir, `o${String(i).padStart(4, '0')}.png`);
    await p.locator('#c').screenshot({ path: f, omitBackground: true });
    list.push(`file '${f}'\nduration ${(ev[i].b - ev[i].a).toFixed(4)}`);
  }
  list.push(`file '${path.join(outdir, `o${String(ev.length - 1).padStart(4, '0')}.png`)}'`);
  fs.writeFileSync(path.join(outdir, 'list.txt'), list.join('\n') + '\n');
  console.log(ev.length, 'overlays');
  await b.close();
})();
