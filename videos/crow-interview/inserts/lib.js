// Shared look for «اعترافات برّية» inserts: 360×640 SVG, render(t) is called per frame.
const NS = 'http://www.w3.org/2000/svg';
const C = { bg: '#121010', amber: '#E8A33D', amberHi: '#FFD27A', cream: '#F3E6CF', dim: '#6b5a44', glass: '#d9e6ea', water: '#3d6f7a' };
function el(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg()).appendChild(e); return e; }
function svg() { return document.getElementById('s'); }
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, x) => a + (b - a) * x;
const seg = (t, a, b) => clamp((t - a) / (b - a));

// Background: charcoal, amber rim glow, vignette, drifting dust, film grain.
function backdrop(glowX = 300, glowY = 120) {
  const d = el('defs');
  d.innerHTML = `
  <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.amber}" stop-opacity=".28"/><stop offset=".5" stop-color="${C.amber}" stop-opacity=".06"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="180" cy="320" r="420" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="1" result="n"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".08"/></feComponentTransfer></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
  <filter id="bloom"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  el('rect', { width: 360, height: 640, fill: C.bg });
  el('rect', { width: 360, height: 640, fill: 'url(#glow)' });
  return d;
}
let _dust;
function dust(n = 40, seed = 7) { const r = rng(seed); const g = el('g', { opacity: .7 }); _dust = []; for (let i = 0; i < n; i++) _dust.push({ x: r() * 360, y: r() * 640, s: .4 + r() * 1.2, v: 3 + r() * 8, ph: r() * 6, e: el('circle', { r: 0, fill: C.amberHi }, g) }); return g; }
function dustUpdate(t) { for (const p of _dust) { const y = (p.y - p.v * t + 640) % 640; p.e.setAttribute('cx', p.x + Math.sin(t * .5 + p.ph) * 6); p.e.setAttribute('cy', y); p.e.setAttribute('r', p.s); p.e.setAttribute('opacity', .25 + .35 * Math.sin(t * 1.3 + p.ph) ** 2); } }
function finish() { el('rect', { width: 360, height: 640, fill: 'url(#vig)' }); el('rect', { width: 360, height: 640, filter: 'url(#grain)', opacity: 1 }); }

// Museum-style mono label, top-left, with corner brackets. Types in.
function label(text, x = 22, y = 40) {
  const g = el('g', { 'font-family': 'IBM Plex Mono', 'font-size': 9.5, 'letter-spacing': 1.2, fill: C.cream });
  const t = el('text', { x: x + 8, y: y + 12 }, g);
  const br = el('path', { d: `M${x} ${y + 6}V${y}H${x + 6} M${x} ${y + 14}V${y + 20}H${x + 6}`, stroke: C.amber, fill: 'none', 'stroke-width': 1 }, g);
  return t2 => { const n = Math.floor(clamp(t2 * 30 / text.length) * text.length); t.textContent = text.slice(0, n) + (n < text.length && Math.floor(t2 * 6) % 2 ? '▌' : ''); g.setAttribute('opacity', clamp(t2 * 4)); };
}
// Big Arabic caption at the bottom (optional).
function caption(parent) { return el('text', { x: 180, y: 590, 'text-anchor': 'middle', 'font-family': 'Noto Kufi Arabic', 'font-weight': 700, 'font-size': 19, fill: C.cream, direction: 'rtl' }, parent); }

// Crow silhouette (side view, facing left). Origin at the feet; ~92 units tall. beak(0..1) opens it; head turns around the neck.
function crow(parent, fill = '#060606') {
  const g = el('g', {}, parent), body = el('g', { transform: 'translate(-54 -92)' }, g);
  el('path', { d: 'M48 40 C62 38 84 46 108 60 L103 65 C90 63 80 63 71 67 C60 73 45 73 37 65 C31 58 31 48 36 42 Z', fill }, body);   // body + tail
  el('path', { d: 'M60 46 C72 47 86 53 99 61', stroke: '#2a241d', 'stroke-width': 1.2, fill: 'none' }, body);                     // wing edge
  el('path', { d: 'M49 69 L47 90 M43 92 L52 92 M58 68 L59 90 M55 92 L64 92', stroke: fill, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, body); // legs
  const head = el('g', {}, body);
  el('path', { d: 'M21 25 C26 17 38 12 48 18 C55 23 56 32 54 42 L38 48 C31 44 26 40 23 37 Z', fill }, head);                       // head + neck
  el('path', { d: 'M22 25 L0 30 L23 31 Z', fill }, head);                                                                           // upper beak
  const lo = el('path', { d: 'M23 31 L2 32 L24 37 Z', fill }, head);                                                                // lower beak
  const eye = el('circle', { cx: 31, cy: 24, r: 1.8, fill: C.amberHi }, head);
  return { g, head, eye,
    turn(deg) { head.setAttribute('transform', `rotate(${deg} 44 40)`); },
    beak(o) { lo.setAttribute('transform', `rotate(${-o * 14} 24 33)`); },
    rim(color) { g.style.filter = `drop-shadow(0 0 1.2px ${color}) drop-shadow(0 0 5px ${color}66)`; } };
}
window.addEventListener('load', () => { if (location.hash === '#play') { const t0 = performance.now(); const f = () => { render((performance.now() - t0) / 1000 % DURATION); requestAnimationFrame(f); }; f(); } else render(+(location.hash.slice(1)) || 2); });

// Caveman rubber mask (front view), centred at 0,0, ~60 wide.
function mask(parent, s = 1) {
  const g = el('g', { transform: `scale(${s})` }, parent);
  el('path', { d: 'M-28 -18 C-30 -42 30 -42 28 -18 L26 14 C24 34 12 44 0 44 C-12 44 -24 34 -26 14 Z', fill: '#c9a27a', stroke: '#5a3d22', 'stroke-width': 1.5 }, g);
  el('path', { d: 'M-30 -24 C-20 -40 20 -40 30 -24 C26 -30 18 -34 0 -34 C-18 -34 -26 -30 -30 -24 Z', fill: '#3b2a1c' }, g);          // hair
  el('path', { d: 'M-24 -12 Q-12 -20 -2 -12 L2 -12 Q12 -20 24 -12 L24 -6 Q12 -12 2 -6 L-2 -6 Q-12 -12 -24 -6 Z', fill: '#6e4a2c' }, g); // heavy brow
  el('ellipse', { cx: -11, cy: -1, rx: 5, ry: 3.5, fill: '#120d09' }, g); el('ellipse', { cx: 11, cy: -1, rx: 5, ry: 3.5, fill: '#120d09' }, g);
  el('path', { d: 'M-5 4 Q0 16 5 4 Q8 14 0 18 Q-8 14 -5 4 Z', fill: '#a9805a' }, g);                                                  // nose
  el('path', { d: 'M-22 18 C-18 40 18 40 22 18 C14 26 -14 26 -22 18 Z', fill: '#3b2a1c' }, g);                                       // beard
  el('path', { d: 'M-8 24 Q0 28 8 24', stroke: '#120d09', 'stroke-width': 2, fill: 'none' }, g);
  return g;
}
// Small mono text helper.
function mono(parent, x, y, size = 9.5, fill = C.cream, anchor = 'start') { return el('text', { x, y, 'font-family': 'IBM Plex Mono', 'font-size': size, 'letter-spacing': 1.2, fill, 'text-anchor': anchor }, parent); }
