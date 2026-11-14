// Line 14: stones into a water tube until the food floats up to the crow.
const DURATION = 8;
backdrop(290, 90); const dustG = dust(36, 3);
const lab = label('AESOP TEST · WATER DISPLACEMENT');
const TX = 150, TW = 64, TTOP = 210, TBOT = 560;           // tube
const tube = el('g');
const waterClip = el('clipPath', { id: 'tc' }, el('defs')); el('rect', { x: TX + 3, y: TTOP, width: TW - 6, height: TBOT - TTOP - 3, rx: 6 }, waterClip);
const inner = el('g', { 'clip-path': 'url(#tc)' }, tube);
const water = el('rect', { x: TX, width: TW, fill: C.water, opacity: .75 }, inner);
const surf = el('path', { fill: 'none', stroke: '#9fd3df', 'stroke-width': 1.4, opacity: .9 }, inner);
const R = rng(11), stones = [];
for (let i = 0; i < 7; i++) stones.push({ t0: .9 + i * .78, x: TX + 14 + R() * (TW - 28), r: 7 + R() * 3, rest: 0, e: el('ellipse', { fill: '#7b6a58', stroke: '#2a231c', 'stroke-width': 1 }, inner) });
// stones settle in a pile at the bottom
stones.forEach((s, i) => { s.restY = TBOT - 10 - Math.floor(i / 3) * 13 - (i % 3 === 1 ? 2 : 0); s.restX = TX + 14 + (i % 3) * 18 + (Math.floor(i / 3) % 2) * 6; });
const food = el('g', {}, inner); el('rect', { x: -9, y: -7, width: 18, height: 12, rx: 3, fill: C.amber }, food); el('rect', { x: -9, y: -7, width: 18, height: 4, rx: 2, fill: C.amberHi }, food);
const splashG = el('g', {}, inner);
// glass on top of the water
el('rect', { x: TX, y: TTOP, width: TW, height: TBOT - TTOP, rx: 9, fill: 'none', stroke: C.glass, 'stroke-width': 2, opacity: .8 }, tube);
el('rect', { x: TX + 7, y: TTOP + 10, width: 5, height: TBOT - TTOP - 30, rx: 2.5, fill: '#fff', opacity: .18 }, tube);
el('ellipse', { cx: TX + TW / 2, cy: TTOP, rx: TW / 2, ry: 5, fill: 'none', stroke: C.glass, 'stroke-width': 1.6, opacity: .8 }, tube);
// level ticks
for (let i = 0; i <= 10; i++) el('line', { x1: TX + TW + 6, x2: TX + TW + (i % 5 ? 11 : 17), y1: TBOT - 10 - i * 32, y2: TBOT - 10 - i * 32, stroke: C.dim, 'stroke-width': 1 });
const lvlTxt = el('text', { x: TX + TW + 22, 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: C.amber });
const cnt = el('text', { x: 338, y: 52, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: C.cream, 'letter-spacing': 1 });
const bird = crow(); bird.rim(C.amber); const held = el('rect', { x: -2, y: 29, width: 12, height: 8, rx: 2, fill: C.amber }, bird.head);
const cap = caption(); 
dustG.parentNode.appendChild(dustG); finish();

function level(t) { // water top y
  let n = 0; for (const s of stones) n += easeOut(seg(t, s.t0 + .35, s.t0 + .8));
  return lerp(400, 236, n / stones.length);
}
function render(t) {
  dustUpdate(t); lab(t);
  const L = level(t), wob = Math.sin(t * 9) * 1.2 * Math.exp(-((t - .9) % .78) * 3);
  water.setAttribute('y', L); water.setAttribute('height', TBOT - L);
  surf.setAttribute('d', `M${TX} ${L} Q${TX + TW / 2} ${L + wob * 2} ${TX + TW} ${L}`);
  food.setAttribute('transform', `translate(${TX + TW / 2 + Math.sin(t * 2) * 3} ${L - 3 + Math.sin(t * 3) * 1}) rotate(${Math.sin(t * 2.4) * 6})`);
  splashG.innerHTML = '';
  let dropped = 0;
  for (const s of stones) {
    const a = seg(t, s.t0, s.t0 + .35), b = easeOut(seg(t, s.t0 + .35, s.t0 + 1.1));
    if (t < s.t0) { s.e.setAttribute('opacity', 0); continue; }
    dropped++;
    s.e.setAttribute('opacity', 1); s.e.setAttribute('rx', s.r); s.e.setAttribute('ry', s.r * .8);
    const yAir = lerp(TTOP - 14, L, a * a), y = a < 1 ? yAir : lerp(L, s.restY, b);
    s.e.setAttribute('cx', a < 1 ? lerp(TX + TW / 2 - 12, s.x, a) : lerp(s.x, s.restX, b)); s.e.setAttribute('cy', y);
    const sp = seg(t, s.t0 + .35, s.t0 + .75);
    if (sp > 0 && sp < 1) for (let k = 0; k < 6; k++) { const ang = Math.PI * (1.15 + k * .14); el('circle', { cx: s.x + Math.cos(ang) * 22 * sp, cy: L + Math.sin(ang) * 26 * sp + 30 * sp * sp, r: 2 * (1 - sp), fill: '#bfe6ee' }, splashG); }
  }
  // crow on the rim; pecks after each stone, dips in and takes the food at the end
  bird.g.setAttribute('transform', `translate(${TX + TW - 4} ${TTOP - 3}) scale(1.25)`);
  let look = 0, open = 0; for (const s of stones) { const k = seg(t, s.t0 - .35, s.t0 + .25); look = Math.max(look, Math.sin(Math.PI * k) * 22); if (t > s.t0 - .05 && t < s.t0 + .15) open = .6; }
  const grab = ease(seg(t, 6.3, 6.9)) * (1 - ease(seg(t, 7.2, 7.8)));
  bird.turn(-14 - look - 38 * grab);
  bird.beak(Math.max(open, grab > .8 ? .5 : 0)); held.setAttribute('opacity', t > 7.0 ? 1 : 0);
  food.setAttribute('opacity', t > 7.0 ? 0 : 1);
  lvlTxt.setAttribute('y', L + 3); lvlTxt.textContent = '▲ ' + Math.round((400 - L) / 164 * 100) + '%';
  cnt.textContent = `PEBBLES  ${String(dropped).padStart(2, '0')}`;
  cap.textContent = t < 6.3 ? 'حجرًا… حجرًا' : 'حتى يرتفع الماء إليّ';
  cap.setAttribute('opacity', t < 6.3 ? clamp((t - .8) * 2) : clamp((t - 6.3) * 3));
}
