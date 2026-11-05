// Line 19: ravens pick the right tool and keep it for later — better than 4-year-olds.
const DURATION = 8;
backdrop(260, 160); dust(26, 51);
const lab = label('LUND UNIVERSITY · PLANNING AHEAD');
const tray = el('g'); el('rect', { x: 40, y: 470, width: 200, height: 12, rx: 4, fill: '#5a4026' }, tray);
const objs = [{ x: 70, d: 'M-8 0 L8 0 L4 -14 L-4 -14 Z', c: '#6b6f74' }, { x: 120, d: 'M-9 0 A9 9 0 1 1 9 0 Z', c: '#7a3b2e' }, { x: 170, d: 'M-3 0 L-3 -22 L3 -22 L3 0 Z M-7 -22 L7 -22 L7 -26 L-7 -26 Z', c: '#d9a868' }, { x: 214, d: 'M-8 0 L-8 -14 L8 -14 L8 0 Z', c: '#4e5a46' }];
objs.forEach(o => { o.g = el('g'); el('path', { d: o.d, fill: o.c }, o.g); });
const sel = el('circle', { r: 20, fill: 'none', stroke: C.amber, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
const bird = crow(); bird.rim(C.amber);
// clock
const clk = el('g', { transform: 'translate(270 200)' }); el('circle', { r: 46, fill: '#0e0b09', stroke: C.dim, 'stroke-width': 1.5 }, clk);
for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -40, x2: 0, y2: -34, stroke: C.dim, transform: `rotate(${i * 30})` }, clk);
const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: C.cream, 'stroke-width': 3, 'stroke-linecap': 'round' }, clk), mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: C.amber, 'stroke-width': 2, 'stroke-linecap': 'round' }, clk);
const hrs = mono(null, 270, 272, 12, C.amberHi, 'middle');
// comparison bars
const bars = el('g'); const b1 = el('rect', { x: 120, y: 540, height: 12, rx: 3, fill: C.amber }, bars), b2 = el('rect', { x: 120, y: 564, height: 12, rx: 3, fill: C.dim }, bars);
mono(bars, 110, 550, 9, C.cream, 'end').textContent = 'RAVENS'; mono(bars, 110, 574, 9, C.cream, 'end').textContent = 'CHILDREN 4Y';
const cap = caption(); finish();
function render(t) {
  lab(t); dustUpdate(t);
  const pick = ease(seg(t, .9, 1.6));
  bird.g.setAttribute('transform', 'translate(140 455) scale(1.15)'); bird.turn(-6 + 30 * Math.sin(Math.PI * pick)); bird.beak(pick > .5 && pick < 1 ? .4 : 0);
  objs.forEach((o, i) => { const held = i === 2 && t > 1.3; o.g.setAttribute('transform', held ? `translate(${140 - 62 * 1.15 + 6} ${455 - 62 * 1.15}) rotate(-80) scale(.8)` : `translate(${o.x} 470)`); });
  sel.setAttribute('transform', `translate(170 458)`); sel.setAttribute('opacity', seg(t, .2, .6) * (1 - seg(t, 1.2, 1.4)));
  const h = 17 * ease(seg(t, 2, 5.2)); hh.setAttribute('transform', `rotate(${h * 30})`); mh.setAttribute('transform', `rotate(${h * 360})`);
  hrs.textContent = `+${Math.floor(h)} H`; clk.setAttribute('opacity', seg(t, 1.8, 2.2)); hrs.setAttribute('opacity', seg(t, 1.8, 2.2));
  const g = ease(seg(t, 5.6, 6.8)); b1.setAttribute('width', 170 * g); b2.setAttribute('width', 140 * g); bars.setAttribute('opacity', seg(t, 5.4, 5.8));
  cap.textContent = t < 5.4 ? 'اختارَ الأداة… واحتفظ بها' : 'وتفوّق على أطفالٍ في الرابعة'; cap.setAttribute('y', 618); cap.setAttribute('font-size', 17);
  cap.setAttribute('opacity', t < 5.4 ? seg(t, 1.6, 2.1) : seg(t, 5.4, 5.9));
}
