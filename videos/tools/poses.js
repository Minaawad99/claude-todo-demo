// A pose sheet for the shared human() figure: every pose, side by side, on the episode's own helpers.
// Usage: node poses.js <abs path to an episode's cartoon/index.html> <out.png>   (look at it before a render)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    const svg = document.getElementById('panel'); if (typeof window.__human !== 'function') throw new Error('window.__human missing: rebuild scenes.js');
    let s = '<rect width="640" height="360" fill="#e6d6bb"/><path d="M0 330 H640" stroke="#1c1c1c" stroke-width="2"/>';
    const P = [['stand', 'n'], ['walk', 'happy'], ['reach', 'curious'], ['wave', 'n'], ['worry', 'worry'], ['crawl', 'worry']];
    P.forEach(([pose, mood], i) => { s += window.__human(50 + i * 98, 330, 1.3, mood, { s: 1.1, col: ['#c23a26', '#2f6fae', '#3cae6a', '#e2b035', '#8a5cc2', '#c23a26'][i], pose, cloth: pose === 'wave' }); s += '<text x="' + (50 + i * 98) + '" y="352" text-anchor="middle" style="font:700 12px sans-serif">' + pose + '</text>'; });
    svg.innerHTML = s; });
  await p.locator('#panel').screenshot({ path: process.argv[3] }); await b.close(); })();
