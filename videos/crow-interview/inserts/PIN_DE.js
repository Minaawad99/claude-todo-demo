const PLACE = { lon: 9.05, lat: 48.52, ar: 'ألمانيا', en: 'TÜBINGEN, GERMANY · 48.5°N' };
// Location stamp: a wireframe globe turns to the place and drops a pin. Needs PLACE = { lon, lat, ar, en } before this file.
const DURATION = 2.6;
backdrop(180, 300); dust(20, 61);
const G = el('g', { transform: 'translate(180 300)' }), Rg = 118;
el('circle', { r: Rg, fill: '#0e0b09', stroke: C.amber, 'stroke-width': 1.2, 'stroke-opacity': .7 }, G);
const grid = el('g', { stroke: C.amber, 'stroke-width': .6, fill: 'none', opacity: .45 }, G);
const pinG = el('g', {}, G); el('path', { d: 'M0 0 C-10 -14 -12 -22 -12 -28 A12 12 0 1 1 12 -28 C12 -22 10 -14 0 0 Z', fill: C.amberHi, filter: 'url(#bloom)' }, pinG); el('circle', { cx: 0, cy: -28, r: 4.5, fill: '#120d09' }, pinG);
const pulse = el('circle', { fill: 'none', stroke: C.amberHi, 'stroke-width': 1.4 }, G);
const ar = el('text', { x: 180, y: 480, 'text-anchor': 'middle', 'font-family': 'Noto Kufi Arabic', 'font-weight': 700, 'font-size': 30, fill: C.cream });
const en = mono(null, 180, 506, 10, C.amber, 'middle');
finish();
const D2R = Math.PI / 180;
function proj(lon, lat, lon0, lat0) { const l = (lon - lon0) * D2R, p = lat * D2R, p0 = lat0 * D2R; const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l); return [Rg * Math.cos(p) * Math.sin(l), -Rg * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)), cosc > 0]; }
function line(pts, lon0, lat0) { let d = '', pen = false; for (const [lo, la] of pts) { const [x, y, v] = proj(lo, la, lon0, lat0); if (v) { d += (pen ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); pen = true; } else pen = false; } return d; }
function render(t) {
  dustUpdate(t);
  const k = ease(seg(t, 0, 1.3)), lon0 = PLACE.lon - 120 * (1 - k), lat0 = PLACE.lat * .7 * k;
  let d = ''; for (let lo = -180; lo < 180; lo += 20) { const pts = []; for (let la = -90; la <= 90; la += 5) pts.push([lo, la]); d += line(pts, lon0, lat0); }
  for (let la = -60; la <= 60; la += 20) { const pts = []; for (let lo = -180; lo <= 180; lo += 5) pts.push([lo, la]); d += line(pts, lon0, lat0); }
  grid.innerHTML = ''; el('path', { d }, grid);
  const [x, y] = proj(PLACE.lon, PLACE.lat, lon0, lat0), drop = easeOut(seg(t, 1.3, 1.7));
  pinG.setAttribute('transform', `translate(${x} ${y - 40 * (1 - drop)})`); pinG.setAttribute('opacity', drop);
  const pp = seg(t, 1.6, 2.4); pulse.setAttribute('cx', x); pulse.setAttribute('cy', y); pulse.setAttribute('r', 4 + 30 * pp); pulse.setAttribute('opacity', pp > 0 ? 1 - pp : 0);
  ar.textContent = PLACE.ar; ar.setAttribute('opacity', seg(t, 1.5, 1.9));
  en.textContent = PLACE.en; en.setAttribute('opacity', seg(t, 1.7, 2.1));
}
