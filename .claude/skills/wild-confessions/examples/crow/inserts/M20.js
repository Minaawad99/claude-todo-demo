// Line 20: crows count out loud, one to four.
const DURATION = 8;
backdrop(110, 420); const dustG = dust(30, 9);
const lab = label('CARRION CROW · VOCAL COUNTING');
const starts = [.6, 1.7, 3.1, 4.8], GAP = .34;
const caws = []; starts.forEach((s, n) => { for (let k = 0; k <= n; k++) caws.push(s + .45 + k * GAP); });
// screen with the number
const scr = el('g'); el('rect', { x: 110, y: 110, width: 140, height: 120, rx: 10, fill: '#0b0908', stroke: C.dim, 'stroke-width': 1.2 }, scr);
const digit = el('text', { x: 180, y: 202, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 84, fill: C.amberHi, filter: 'url(#bloom)' }, scr);
// four slots
const slots = [1, 2, 3, 4].map(i => { const g = el('g'); const r = el('rect', { x: 58 + (i - 1) * 64, y: 262, width: 52, height: 30, rx: 6, fill: 'none', stroke: C.dim }, g); const tx = el('text', { x: 84 + (i - 1) * 64, y: 282, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 13, fill: C.dim }, g); tx.textContent = '●'.repeat(i); return { r, tx }; });
// waveform
const wave = el('path', { fill: 'none', stroke: C.amber, 'stroke-width': 1.6, 'stroke-linecap': 'round', filter: 'url(#bloom)' });
const bird = crow(); bird.rim(C.amber);
const cap = caption(); finish();
function cawAmp(t) { let a = 0; for (const c of caws) { const x = (t - c) / .22; if (x > 0 && x < 1) a = Math.max(a, Math.sin(Math.PI * x)); } return a; }
function render(t) {
  dustUpdate(t); lab(t);
  let n = -1; starts.forEach((s, i) => { if (t >= s) n = i; });
  digit.textContent = n < 0 ? '' : String(n + 1); digit.setAttribute('opacity', n < 0 ? 0 : clamp((t - starts[n]) * 5));
  slots.forEach((s, i) => { const done = i < n || (i === n && t > starts[n] + .45 + i * GAP + .25); s.r.setAttribute('stroke', i <= n ? C.amber : C.dim); s.r.setAttribute('fill', done ? C.amber + '33' : 'none'); s.tx.setAttribute('fill', i <= n ? C.amberHi : C.dim); });
  const a = cawAmp(t);
  bird.g.setAttribute('transform', 'translate(258 560) scale(2.3)'); bird.turn(-6 - a * 10); bird.beak(a);
  let d = ''; for (let x = 0; x <= 150; x += 2) { const env = Math.exp(-(((x - 120) / 40) ** 2)); const y = 420 - Math.sin(x * .55 + t * 30) * 26 * a * env * (.6 + .4 * Math.sin(x * .13)); d += (x ? 'L' : 'M') + (40 + x) + ' ' + y.toFixed(1); }
  wave.setAttribute('d', d); wave.setAttribute('opacity', .25 + .75 * a);
  cap.textContent = 'من واحد… إلى أربعة'; cap.setAttribute('y', 610); cap.setAttribute('opacity', seg(t, 5.9, 6.4));
}
