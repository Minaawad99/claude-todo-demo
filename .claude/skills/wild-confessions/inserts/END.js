// End card: show title + "who's next?"
const DURATION = 3.5;
backdrop(180, 300); dust(30, 71);
const bird = crow(); bird.rim(C.amber);
const t1 = el('text', { x: 180, y: 440, 'text-anchor': 'middle', 'font-family': 'Noto Kufi Arabic', 'font-weight': 700, 'font-size': 38, fill: C.cream });
t1.textContent = SHOW;
const line = el('line', { x1: 120, x2: 240, y1: 462, y2: 462, stroke: C.amber, 'stroke-width': 1.5 });
const t2 = el('text', { x: 180, y: 495, 'text-anchor': 'middle', 'font-family': 'Noto Kufi Arabic', 'font-weight': 700, 'font-size': 17, fill: C.amber });
t2.textContent = NEXT;
finish();
function render(t) {
  dustUpdate(t);
  const a = easeOut(seg(t, 0, .8));
  bird.g.setAttribute('transform', `translate(212 ${360 + 20 * (1 - a)}) scale(1.4)`); bird.g.setAttribute('opacity', a); bird.turn(-4 + 10 * Math.sin(Math.PI * seg(t, 1.6, 2.4)));
  t1.setAttribute('opacity', seg(t, .4, 1)); line.setAttribute('opacity', seg(t, .8, 1.2)); t2.setAttribute('opacity', seg(t, 1.2, 1.7));
}
