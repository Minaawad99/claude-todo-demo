// Line 13: New Caledonian crow bends a twig into a hook and fishes a grub out of a log.
const DURATION = 8;
backdrop(110, 300); dust(30, 31);
const lab = label('NEW CALEDONIAN CROW · HOOK TOOL');
// log with a hole on the left
const log = el('g'); el('rect', { x: -70, y: 290, width: 150, height: 130, rx: 18, fill: '#3a2618', stroke: '#6b4a2e', 'stroke-width': 2 }, log);
for (let i = 0; i < 4; i++) el('path', { d: `M-70 ${306 + i * 30} Q5 ${300 + i * 30} 80 ${308 + i * 30}`, stroke: '#4d3320', 'stroke-width': 1.2, fill: 'none' }, log);
el('ellipse', { cx: 70, cy: 352, rx: 8, ry: 20, fill: '#0b0705' }, log);
const grub = el('path', { d: 'M0 0 q6 -6 12 0 q6 6 12 0 q4 -4 8 0', stroke: C.amber, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' });
const bird = crow(); bird.rim(C.amber);
const twig = el('path', { stroke: '#b88a55', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, bird.head);
const zoom = el('g'); el('circle', { cx: 270, cy: 170, r: 52, fill: '#120d09', stroke: C.amber, 'stroke-width': 1.2 }, zoom); const zt = el('path', { stroke: '#d9a868', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, zoom);
const zl = mono(zoom, 270, 240, 9, C.cream, 'middle'); zl.textContent = 'HOOK';
const cap = caption(); finish();
function render(t) {
  lab(t); dustUpdate(t);
  const bend = ease(seg(t, .8, 3)), reach = ease(seg(t, 3.4, 4.6)) * (1 - ease(seg(t, 5.6, 6.8)));
  const BX = 300 - 42 * reach; bird.g.setAttribute('transform', `translate(${BX} 470) scale(1.9)`); bird.turn(-6 + 4 * reach); bird.beak(.15);
  // twig held in the beak, pointing left; its tip curls into a hook
  const hx = -46, hy = 30, L = 34, hk = 6 * bend;
  twig.setAttribute('d', `M2 31 L${hx + 6} ${hy} Q${hx} ${hy - .5} ${hx - 1} ${hy - hk} `);
  zt.setAttribute('d', `M310 170 L240 170 Q228 170 228 ${170 - 26 * bend}`); zoom.setAttribute('opacity', seg(t, .8, 1.2) * (1 - seg(t, 3.2, 3.6)));
  const got = t > 5.3, tipX = BX + (hx - 1 - 54) * 1.9, tipY = 470 + (hy - hk - 92) * 1.9;
  grub.setAttribute('transform', got ? `translate(${tipX + 2} ${tipY + 4}) rotate(95)` : `translate(${66} ${336}) rotate(${90 + 10 * Math.sin(t * 6)})`);
  grub.setAttribute('opacity', got ? 1 : seg(t, 4.2, 4.5));
  cap.textContent = t < 3.3 ? 'أنحتُ في طرفِه خطّافًا' : 'وأصطادُ به الدود'; cap.setAttribute('y', 590);
  cap.setAttribute('opacity', t < 3.3 ? seg(t, .9, 1.4) : seg(t, 3.4, 3.9));
}
