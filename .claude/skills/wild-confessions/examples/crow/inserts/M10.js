// Line 10: the grudge is passed down — parents teach their young which face to hate.
const DURATION = 6;
backdrop(180, 160); dust(26, 17);
const lab = label('SOCIAL LEARNING · NEVER CAPTURED');
const nodes = [{ x: 180, y: 230, s: .62, t: .3 }, { x: 90, y: 400, s: .42, t: 1.6 }, { x: 180, y: 400, s: .42, t: 1.8 }, { x: 270, y: 400, s: .42, t: 2.0 }, { x: 60, y: 540, s: .3, t: 3.2 }, { x: 120, y: 540, s: .3, t: 3.35 }, { x: 240, y: 540, s: .3, t: 3.5 }, { x: 300, y: 540, s: .3, t: 3.65 }];
const edges = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [3, 6], [3, 7]];
const lines = edges.map(([a, b]) => el('line', { x1: nodes[a].x, y1: nodes[a].y + 6, x2: nodes[b].x, y2: nodes[b].y - 70 * nodes[b].s, stroke: C.amber, 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }));
nodes.forEach(n => { n.b = crow(); n.b.rim(C.amber); n.bub = el('g'); el('circle', { r: 20, fill: '#1b1410', stroke: C.amber, 'stroke-width': 1 }, n.bub); mask(n.bub, .42); });
const cap = caption(); finish();
function render(t) {
  lab(t); dustUpdate(t);
  nodes.forEach((n, i) => {
    const a = easeOut(seg(t, n.t, n.t + .5));
    n.b.g.setAttribute('transform', `translate(${n.x + 28 * n.s} ${n.y}) scale(${n.s * a})`); n.b.turn(-6 + 6 * Math.sin(t * 2 + i));
    const m = easeOut(seg(t, n.t + .45, n.t + .8));
    n.bub.setAttribute('transform', `translate(${n.x + 30 * n.s} ${n.y - 128 * n.s}) scale(${n.s * 1.6 * m})`); n.bub.setAttribute('opacity', m);
  });
  edges.forEach(([a, b], k) => { const p = seg(t, nodes[b].t - .5, nodes[b].t); lines[k].setAttribute('opacity', p); lines[k].setAttribute('stroke-dashoffset', -t * 12); });
  cap.textContent = 'الثأرُ عندنا يُورَّث'; cap.setAttribute('y', 612); cap.setAttribute('opacity', seg(t, 2.4, 2.9));
}
