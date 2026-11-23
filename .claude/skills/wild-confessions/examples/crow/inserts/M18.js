// Line 18: a small brain packed with neurons.
const DURATION = 8;
backdrop(240, 220); const dustG = dust(30, 5);
const lab = label('RAVEN · PALLIUM NEURON COUNT');
const bird = crow(); bird.rim(C.amber);
const brain = el('g', {}, bird.head);
const outline = el('ellipse', { cx: 43.5, cy: 26, rx: 8.6, ry: 8, fill: '#1a120a', stroke: C.amber, 'stroke-width': .35 }, brain);
const R = rng(21), N = 320, pts = [];
for (let i = 0; pts.length < N; i++) { const x = (R() * 2 - 1), y = (R() * 2 - 1); if (x * x + y * y > 1) continue; pts.push({ x: 43.5 + x * 8.1, y: 26 + y * 7.5, t: R() }); }
pts.sort((a, b) => a.t - b.t);
const links = el('g', { stroke: C.amberHi, 'stroke-width': .12 }, brain), dots = el('g', { fill: C.amberHi }, brain);
pts.forEach(p => p.e = el('circle', { cx: p.x, cy: p.y, r: 0 }, dots));
const pairs = []; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y); if (d < 1.6 && pairs.length < 700) pairs.push([i, j, el('line', { x1: pts[i].x, y1: pts[i].y, x2: pts[j].x, y2: pts[j].y, opacity: 0 }, links)]); }
const num = el('text', { x: 180, y: 150, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 26, fill: C.amberHi, filter: 'url(#bloom)' });
const sub = el('text', { x: 180, y: 172, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 9.5, 'letter-spacing': 1.5, fill: C.cream });
const cmp = el('text', { x: 180, y: 196, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 10, 'letter-spacing': 1.5, fill: C.amber });
bird.head.appendChild(bird.eye); const cap = caption();
finish();
function render(t) {
  dustUpdate(t); lab(t);
  const z = lerp(3.7, 4.3, ease(seg(t, 0, 8)));
  bird.g.setAttribute('transform', `translate(${180 + 23 * z - 14} ${370 + 68 * z}) scale(${z})`);
  bird.turn(-4); bird.beak(0);
  const fill = ease(seg(t, .8, 5.2)), shown = Math.floor(fill * N);
  pts.forEach((p, i) => { const on = i < shown; p.e.setAttribute('r', on ? .32 + .12 * Math.sin(t * 7 + i) : 0); p.e.setAttribute('opacity', on ? .6 + .4 * Math.sin(t * 5 + i * 1.7) ** 2 : 0); });
  pairs.forEach(([i, j, e], k) => e.setAttribute('opacity', (i < shown && j < shown) ? .25 + .55 * Math.max(0, Math.sin(t * 6 + k * .9)) ** 6 : 0));
  outline.setAttribute('stroke-opacity', .4 + .6 * seg(t, .3, 1));
  num.textContent = Math.round(1204e6 * fill).toLocaleString('en-US');
  num.setAttribute('opacity', seg(t, .6, 1));
  sub.textContent = 'NEURONS · FOREBRAIN'; sub.setAttribute('opacity', seg(t, 1, 1.5));
  cmp.textContent = '≈ MONKEY CORTEX'; cmp.setAttribute('opacity', seg(t, 5.5, 6.1));
  cap.textContent = 'دماغ صغير… وخلايا مرصوصة'; cap.setAttribute('y', 600); cap.setAttribute('opacity', seg(t, 1.2, 1.8));
}
