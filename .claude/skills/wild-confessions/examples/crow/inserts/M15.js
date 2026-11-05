// Line 15: drop the walnut on the road, let the car crack it, eat at the red light.
const DURATION = 7;
backdrop(80, 120); dust(24, 41);
const lab = label('SENDAI, JAPAN · NUT CRACKING');
const road = el('g'); el('rect', { x: 0, y: 470, width: 360, height: 90, fill: '#1c1a19' }, road);
for (let i = 0; i < 8; i++) el('rect', { x: 20 + i * 44, y: 476, width: 26, height: 4, fill: '#d8d2c4', opacity: .5 }, road);
el('rect', { x: 0, y: 560, width: 360, height: 6, fill: '#3a3632' }, road);
// traffic light
const tl = el('g'); el('rect', { x: 298, y: 300, width: 4, height: 170, fill: '#2b2724' }, tl); el('rect', { x: 286, y: 270, width: 28, height: 64, rx: 6, fill: '#0c0a09', stroke: '#3a3632' }, tl);
const red = el('circle', { cx: 300, cy: 288, r: 8 }, tl), green = el('circle', { cx: 300, cy: 316, r: 8 }, tl);
const bird = crow(); bird.rim(C.amber);
const nut = el('g'); el('circle', { r: 7, fill: '#9a6a3a', stroke: '#4a2f17', 'stroke-width': 1.2 }, nut); el('path', { d: 'M0 -7 Q3 0 0 7', stroke: '#4a2f17', fill: 'none' }, nut);
const bits = [0, 1, 2, 3, 4].map(i => el('circle', { r: 2.4, fill: i % 2 ? '#e6c08a' : '#9a6a3a' }));
const car = el('g'); el('path', { d: 'M0 0 L0 -18 Q4 -24 20 -26 L38 -40 Q48 -44 74 -44 L96 -44 Q110 -42 120 -26 L136 -22 Q144 -20 144 -10 L144 0 Z', fill: '#2a2f36', stroke: '#5c6672', 'stroke-width': 1.2 }, car);
el('path', { d: 'M42 -36 L52 -40 L72 -40 L72 -28 L36 -28 Z M78 -40 L96 -40 Q104 -38 110 -28 L78 -28 Z', fill: '#7fa3b8', opacity: .5 }, car);
const wheels = [26, 118].map(x => el('circle', { cx: x, cy: 0, r: 11, fill: '#0b0b0b', stroke: '#6a6a6a', 'stroke-width': 2 }, car));
el('circle', { cx: 144, cy: -14, r: 3, fill: C.amberHi }, car);
const cap = caption(); finish();
function render(t) {
  lab(t); dustUpdate(t);
  // crow flies over and drops the nut, then lands at the curb
  const fly = ease(seg(t, 0, 1.4)), land = ease(seg(t, 4.8, 5.6));
  const bx = t < 4.8 ? lerp(-40, 150, fly) + (t > 1.4 ? lerp(0, 110, ease(seg(t, 1.6, 2.6))) : 0) : lerp(300, 236, land);
  const by = t < 4.8 ? 200 + Math.sin(t * 8) * 4 : lerp(200, 520, land);
  bird.g.setAttribute('transform', `translate(${bx} ${by}) scale(${t < 4.8 ? -.7 : .7} .7)`); bird.turn(t > 5.6 ? -20 - 10 * Math.max(0, Math.sin(t * 9)) : -4); bird.beak(t < 1.3 ? .3 : 0);
  const fall = seg(t, 1.3, 1.9);
  const nx = 196, ny = lerp(150, 512, fall * fall);
  const crack = t > 3.35;
  nut.setAttribute('transform', `translate(${t < 1.3 ? bx + 44 : nx} ${t < 1.3 ? by - 52 : ny})`); nut.setAttribute('opacity', crack ? 0 : 1);
  bits.forEach((b, i) => { const s = easeOut(seg(t, 3.35, 3.8)); b.setAttribute('cx', nx - 10 + i * 5 + (i - 2) * 6 * s); b.setAttribute('cy', 515 - 6 * Math.sin(Math.PI * s) * (i % 2 + 1)); b.setAttribute('opacity', crack && !(t > 6 && i === 2) ? 1 : 0); });
  const cx = lerp(-160, 420, seg(t, 2.6, 4.1));
  car.setAttribute('transform', `translate(${t < 4.1 ? cx : 999} 520)`);
  const isRed = t > 4.2; red.setAttribute('fill', isRed ? '#ff4a3a' : '#3a1210'); green.setAttribute('fill', isRed ? '#0f2a14' : '#4aff7a');
  red.style.filter = isRed ? 'drop-shadow(0 0 6px #ff4a3a)' : ''; green.style.filter = isRed ? '' : 'drop-shadow(0 0 6px #4aff7a)';
  cap.textContent = t < 4.4 ? 'أضعُ الجوزَ على الطريق' : 'وأتركُ سيّاراتِكم تكسرُه لي'; cap.setAttribute('y', 612);
  cap.setAttribute('opacity', t < 4.4 ? seg(t, 1, 1.5) : seg(t, 4.4, 4.9));
}
