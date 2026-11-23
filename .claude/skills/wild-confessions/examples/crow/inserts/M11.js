// Line 11: crows gather around a dead crow, call, and study the scene to learn the danger.
const DURATION = 8;
backdrop(180, 330); dust(30, 23);
const lab = label('CROW "FUNERALS" · DANGER LEARNING');
const pulses = el('g');
const dead = crow(); dead.g.setAttribute('opacity', .55);
const R = rng(8), ring = [];
for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .3, r = 118 + (i % 2) * 22; const b = crow(); b.rim(C.amber); ring.push({ b, a, r, t0: .5 + i * .22 + R() * .2, ph: R() * 6 }); }
const scan = el('g'); const qs = [[-70, -60], [80, -40], [-30, 70], [60, 80]].map(([x, y]) => { const g = el('g', {}, scan); el('circle', { r: 11, fill: 'none', stroke: C.amber, 'stroke-width': 1.2 }, g); mono(g, 0, 4, 12, C.amberHi, 'middle').textContent = '?'; return { g, x, y }; });
const cap = caption(); finish();
function render(t) {
  lab(t); dustUpdate(t);
  dead.g.setAttribute('transform', 'translate(180 300) rotate(180) scale(.6)'); dead.turn(0); dead.eye.setAttribute('opacity', 0);
  pulses.innerHTML = '';
  ring.forEach((o, i) => {
    const a = easeOut(seg(t, o.t0, o.t0 + .8)), r = o.r + (1 - a) * 220;
    const x = 180 + Math.cos(o.a) * r, y = 340 + Math.sin(o.a) * r * 1.05;
    const caw = t > 2.5 && t < 5 ? Math.max(0, Math.sin(t * 5 + o.ph)) ** 4 : 0;
    const face = x > 180 ? 1 : -1;
    o.b.g.setAttribute('transform', `translate(${x} ${y + 20}) scale(${.36 * face} .36)`); o.b.g.setAttribute('opacity', a);
    o.b.turn(6 - 10 * caw + (t > 5 ? 8 * Math.sin(t * 3 + o.ph) : 0)); o.b.beak(caw);
    if (caw > .4) el('circle', { cx: x - face * 22, cy: y - 18, r: 8 + 30 * (1 - caw), fill: 'none', stroke: C.amber, 'stroke-width': 1, opacity: caw * .7 }, pulses);
  });
  qs.forEach((q, i) => { const a = easeOut(seg(t, 5 + i * .3, 5.4 + i * .3)); q.g.setAttribute('transform', `translate(${180 + q.x} ${340 + q.y}) scale(${a})`); q.g.setAttribute('opacity', a * (.6 + .4 * Math.sin(t * 6 + i))); });
  cap.textContent = t < 5 ? 'نجتمعُ حولَه… ونصرخ' : 'نحن نحقّق: ما الذي قتلَه؟'; cap.setAttribute('y', 600);
  cap.setAttribute('opacity', t < 5 ? seg(t, 2.4, 2.9) : seg(t, 5, 5.4));
}
