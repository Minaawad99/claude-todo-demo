// Lines 07–08: the mask experiment. Crows that were never caught still scold the mask, years later.
const DURATION = 8;
backdrop(180, 250); const dustG = dust(30, 13);
const lab = label('UNIV. OF WASHINGTON · MASK STUDY');
const mk = el('g'); mask(mk, 1.5);
const ring = el('circle', { cx: 0, cy: 0, r: 70, fill: 'none', stroke: '#d94a3a', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, mk);
const R = rng(3), birds = [];
for (let i = 0; i < 14; i++) { const a = -Math.PI * (.08 + .84 * (i / 13)), r = 120 + (i % 2) * 34; const b = crow(); b.rim(C.amber); const bang = mono(b.g, -40, -112, 14, '#ff5a45'); bang.textContent = '!'; birds.push({ b, bang, x: 180 + Math.cos(a) * r * .95, y: 330 + Math.sin(a) * r * .9 + 40, t0: i < 4 ? 2.2 + i * .15 : 3.4 + (i - 4) * .3, caught: i < 4, ph: R() * 6 }); }
const years = el('g'); const bar = el('line', { x1: 40, x2: 320, y1: 520, y2: 520, stroke: C.dim, 'stroke-width': 1.4 }, years);
const prog = el('line', { x1: 40, y1: 520, y2: 520, stroke: C.amber, 'stroke-width': 2.4 }, years);
for (let y = 0; y <= 5; y++) { el('line', { x1: 40 + y * 56, x2: 40 + y * 56, y1: 514, y2: 526, stroke: C.dim }, years); mono(years, 40 + y * 56, 542, 9, C.dim, 'middle').textContent = 2006 + y; }
const stat = mono(null, 180, 476, 10, C.cream, 'middle');
const cap = caption(); finish();
function render(t) {
  dustUpdate(t); lab(t);
  const sIn = easeOut(seg(t, .2, 1));
  mk.setAttribute('transform', `translate(180 ${400}) scale(${.6 + .4 * sIn})`); mk.setAttribute('opacity', sIn);
  ring.setAttribute('opacity', seg(t, 3.2, 3.6)); ring.setAttribute('r', 62 + 3 * Math.sin(t * 6));
  const yr = ease(seg(t, 2.6, 7.2)); prog.setAttribute('x2', 40 + 280 * yr);
  let scolding = 0;
  birds.forEach((o, i) => {
    const a = easeOut(seg(t, o.t0, o.t0 + .6)); if (a <= 0) { o.b.g.setAttribute('opacity', 0); return; }
    const caw = Math.max(0, Math.sin((t - o.t0) * 7 + o.ph)) ** 3; scolding++;
    o.b.g.setAttribute('opacity', a);
    o.b.g.setAttribute('transform', `translate(${o.x + (1 - a) * (o.x < 180 ? -60 : 60)} ${o.y - (1 - a) * 80}) scale(${o.x < 180 ? -.42 : .42} .42)`);
    o.b.turn(16 - caw * 8); o.b.beak(caw); o.bang.setAttribute('opacity', caw > .5 ? 1 : 0);
  });
  stat.textContent = t < 2.2 ? '' : t < 3.3 ? 'CAUGHT & RELEASED: 7 CROWS' : 'MOBBING THE MASK ▲ YEAR AFTER YEAR';
  cap.textContent = t < 3.3 ? 'لبسوا القناع… وأمسكوا الغربان' : 'حتى التي لم تُمسَك أبدًا';
  cap.setAttribute('opacity', t < 3.3 ? seg(t, .6, 1.1) : seg(t, 3.4, 3.9));
}
