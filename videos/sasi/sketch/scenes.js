window.CHUNKS = [[0.0, 0.5556], [0.0, 0.4468], [0.0], [0.0, 0.4194], [0.0, 0.3279], [0.0, 0.2727, 0.6753], [0.0, 0.6531], [0.0, 0.1392, 0.5823], [0.0, 0.6923], [0.0, 0.2329, 0.6712], [0.0, 0.5106], [0.0, 0.2742], [0.0, 0.5306], [0.0, 0.2955], [0.0, 0.3896, 0.6494], [0.0, 0.3934], [0.0], [0.0, 0.2667, 0.68], [0.0], [0.0, 0.1833, 0.4333], [0.0, 0.6182], [0.0, 0.4524], [0.0, 0.4583], [0.0], [0.0, 0.2542, 0.6271], [0.0, 0.4, 0.7474], [0.0], [0.0]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the camera never parks (a slow push / pan per shot plus a small drift added here);
   - a thing appears grey and faint first, then takes its colour (appear); the part being talked about takes the accent
     colour, often swept along its length (sweep), while the rest dims (dim). */
var LN = window.TIMING.lines;
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, k) { return a + (b - a) * k; }
function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.1 * ease(u / 0.22); if (u < 0.36) return lerp(1.1, 1, (u - 0.22) / 0.14); return 1; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function f(n) { return (+n).toFixed(1); }
// k ramps 0→1 over dur seconds starting at u0 (u = seconds into the shot)
function at(u, u0, dur) { return ease((u - u0) / (dur || 0.4)); }

// palette measured from the reference videos
var INK = "#2a2016", PAPER = "#eee5d0", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a",
    SKIN = "#d9a186", SKIN2 = "#b77a5c", BROWN = "#8f4f34", BEIGE = "#d8ccae", GREY = "#c6c6c0", KHAKI = "#c0b49c", TAN = "#ddd2b8", MUTE = "#8f8576";

// ── primitives ──
function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
function C(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
function N(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:800 ' + sz + 'px Noto Serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
function paper() { return '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + PAPER + '"/><rect x="-2000" y="-2000" width="4640" height="4800" fill="url(#grid)"/>'; }
function hatch(d) { return '<path d="' + d + '" fill="url(#hatch)" stroke="none"/>'; }
function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + op.toFixed(3) + '"' : "") + '>' + inner + '</g>'; }

// ── the motion vocabulary ──
// appear: grey and faint first, then full colour (reference: every new thing). k 0..1
function appear(k, inner) { k = clamp(k); if (k <= 0) return ""; return '<g opacity="' + (0.3 + 0.7 * k).toFixed(3) + '" style="filter:saturate(' + k.toFixed(3) + ')">' + inner + '</g>'; }
// dim: the parts not being talked about fade back to a ghost. k 0..1 (1 = dimmed)
function dim(k, inner) { k = clamp(k); return '<g opacity="' + (1 - 0.65 * k).toFixed(3) + '" style="filter:saturate(' + (1 - 0.8 * k).toFixed(3) + ')">' + inner + '</g>'; }
// sweep: show `inner` only inside a box that grows from one side (a colour running along a shaft, a fill rising). dir: "r" "l" "u" "d"
var CLIPN = 0;
function sweep(x, y, w, h, k, dir, inner) {
  k = clamp(k); if (k <= 0) return ""; var id = "sw" + (++CLIPN), cx = x, cy = y, cw = w, ch = h;
  if (dir === "l") { cx = x + w * (1 - k); cw = w * k; } else if (dir === "u") { cy = y + h * (1 - k); ch = h * k; } else if (dir === "d") ch = h * k; else cw = w * k;
  return '<clipPath id="' + id + '"><rect x="' + f(cx) + '" y="' + f(cy) + '" width="' + f(cw) + '" height="' + f(ch) + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>';
}
// draw: a line drawing itself along its path. k 0..1
function draw(d, k, col, w, ex) { k = clamp(k); if (k <= 0) return ""; return '<path d="' + d + '" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + (1 - k).toFixed(4) + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
// leader-line label: dot on the part, the line draws out, then the name fades in. Name coloured like the caption key word.
function label(px, py, lx, ly, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 20;
  var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tx = lx + (left ? -7 : 7), ty = ly + sz * 0.35;
  var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="3.5" fill="' + INK + '"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.3"/>';
  if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, left ? "start" : "end") + '</g>';   // RTL: "start" is the right-hand end
  return s;
}
function callout(n, x, y, k, r) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; r = r || 15; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<circle r="' + r + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(n, 0, r * 0.38, r * 1.05, INK)); }
// ✗ for the wrong idea, ✓ for the right one: both write themselves in
function cross(x, y, s, k) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; s = s || 1; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', draw("M-26 -26 L26 26", k * 2, ORANGE, 9) + draw("M26 -26 L-26 26", k * 2 - 1, ORANGE, 9)); }
function check(x, y, s, k, col) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; s = s || 1; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', draw("M-24 2 L-8 18 L26 -20", k, col || INK, 7)); }
// a number counting up, formatted with thousands commas: count(24000000000, k)
function count(to, k, dec) { var v = to * ease(k); return v.toFixed(dec || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
// a big serif number with its unit under it (reference: «100 / كيلو في الساعة», «0 / موجة زيادة في الثانية»)
function bigNum(text, unit, x, y, k, col, sz) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 56; return appear(k, N(text, x, y, sz, col || INK) + (unit ? T(unit, x, y + sz * 0.5, sz * 0.32, INK, 600) : "")); }
// a number in a framed box (reference: «0 / موجة في الثانية» in a thin box, «100,000 V» dark tag when dark=true)
function numBox(text, x, y, k, sz, dark) {
  k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 26; var w = text.length * sz * 0.6 + 28;
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" fill="' + (dark ? INK : PAPER) + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(text, 0, sz * 0.36, sz, dark ? "#fff" : INK));
}
// a small framed thumbnail in a top corner for the analogy (reference: the iron, the water heater, the bottle)
function iconBox(x, y, s, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-s / 2) + '" y="' + f(-s / 2) + '" width="' + s + '" height="' + s + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + inner); }
// a magnified inset circle showing `inner` (drawn around 0,0)
function inset(cx, cy, r, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var id = "in" + (++CLIPN); return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(k) + ')', '<clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="' + PAPER + '"/><g clip-path="url(#' + id + ')">' + inner + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>'); }
function arrow(x1, y1, x2, y2, col, w, p) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = (w || 3) * 3.2;
  return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.6) + ' ' + f(ye - Math.sin(a) * h * 0.6) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe) + ' ' + f(ye) + ' L' + f(xe - Math.cos(a - 0.45) * h) + ' ' + f(ye - Math.sin(a - 0.45) * h) + ' L' + f(xe - Math.cos(a + 0.45) * h) + ' ' + f(ye - Math.sin(a + 0.45) * h) + ' Z" fill="' + (col || INK) + '" stroke="' + INK + '" stroke-width="1"/>';
}
// a wave travelling from (x1,y1) to (x2,y2); phase moves with t; p = how far it has got
function wave(x1, y1, x2, y2, t, col, a, wl, p, sw) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, d = "";
  for (var s = 0; s <= len * p; s += 4) { var o = Math.sin(s / (wl || 22) * Math.PI * 2 - t * 9) * (a || 7); d += (s ? " L" : "M") + f(x1 + ux * s - uy * o) + " " + f(y1 + uy * s + ux * o); }
  return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 3) + '" fill="none" stroke-linecap="round"/>';
}

// ── shots ──
// shot(start, cam, draw, opt): start = a script line index, or [line, chunk] to start on a caption chunk inside a line.
// cam(u, d) → [cx, cy, zoom]; draw(u, d, t) → SVG. u = seconds into the shot, d = its length.
// opt.tr = "fade" (default) | "in" (fly into the old shot's centre while crossfading) | "out" (the new shot starts tight and pulls back).
var SH = [], HUD = [];
function startOf(s) { if (typeof s === "number") return s >= LN.length ? window.TIMING.duration + 2 : LN[s].start; var l = LN[s[0]], c = window.CHUNKS[s[0]]; return l.start + (l.end - l.start) * (c[s[1]] || 0); }
function shot(start, cam, draw, opt) { SH.push({ a: startOf(start), cam: cam, draw: draw, tr: (opt && opt.tr) || "fade" }); SH.sort(function (p, q) { return p.a - q.a; }); }
// hud(from, to, draw): something that stays put on top of the panel across shots (rule chips, status pills, a checklist).
// draw(u, t) in panel units, not moved by the camera. from / to like shot starts; to is exclusive.
function hud(from, to, draw) { HUD.push({ a: startOf(from), b: startOf(to), draw: draw }); }
// camera helpers: push from zoom z1 to z2 around (x,y); pan from (x1,y1) to (x2,y2) at zoom z
function push(x, y, z1, z2) { return function (u, d) { var k = ease(u / d); return [x, y, lerp(z1, z2, k)]; }; }
function pan(x1, y1, x2, y2, z) { return function (u, d) { var k = ease(u / d); return [lerp(x1, x2, k), lerp(y1, y2, k), z || 1]; }; }
var XF = 0.45;   // crossfade length (s)
window.SCENE = window.SCENE || {};
window.__t = 0;
window.SCENE.panel = function (A, B, t) {
  window.__t = t; CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 15 * Math.sin(t * 2.3), cy = c[1] + 12 * Math.cos(t * 1.9), z = c[2] * (1 + 0.035 * Math.sin(t * 1.5)) * extraZ;   // drift strong enough that qa.py never sees a parked frame
    return '<g opacity="' + op.toFixed(3) + '"><g transform="translate(320 393) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g></g>';
  }
  var cur = SH[i], u = t - cur.a, x = i > 0 && u < XF ? ease(u / XF) : 1;
  if (x < 1) {   // crossfade: the old shot under, the new one fading in on top
    var zo = cur.tr === "in" ? 1 + 0.9 * x : cur.tr === "out" ? 1 - 0.3 * x : 1, zi = cur.tr === "in" ? lerp(0.7, 1, x) : cur.tr === "out" ? lerp(1.6, 1, x) : 1;
    A.innerHTML = render(i - 1, zo, 1); B.innerHTML = render(i, zi, x);
  } else { A.innerHTML = render(i, 1, 1); B.innerHTML = ""; }
  var h = ""; HUD.forEach(function (q) { if (t >= q.a && t < q.b) { var k = Math.min(ease((t - q.a) / 0.35), ease((q.b - t) / 0.35)); h += '<g opacity="' + k.toFixed(3) + '">' + q.draw(t - q.a, t) + '</g>'; } });
  B.innerHTML += h + '<rect x="0" y="0" width="640" height="786" filter="url(#paperN)" pointer-events="none"/>';
};

// ── shared drawings from the reference episode «المد والجزر» (videos/tides/sketch) ──
// materials: sand bed, timber, sea (side + top), globe ocean / land, moon
var SAND_TOP = "#e6d3a3", SAND_SIDE = "#d2b77e", STRATA = "#bfa168", WET = "#cbb58a", WOOD = "#a9784d", WOOD_D = "#7c5434",
    SEA_TOP = "#9fb7c3", SEA_SIDE = "#6f8ea2", OCEAN = "#b9c9cc", LAND = "#a7ad6c", MOONC = "#d3cdbf";
// a globe with REAL coastlines (Natural Earth via ../../lib/geo.min.js, loaded by default): globe(cx, cy, r, lon, lat, {dot: [lon, lat], land}).
// Ocean + graticule + olive land + hatched night side + a thin atmosphere ring, like the reference. lat 72 ≈ seen from above the North Pole.
function globe(cx, cy, r, lon, lat, op) {
  op = op || {}; var g = GEO.globe(cx, cy, r, lon, lat), id = "gc" + (++CLIPN);
  var s = '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r + 6) + '" fill="#cdd8d6" stroke="' + INK + '" stroke-width="1.2"/>';
  s += '<path d="' + g.sphere + '" fill="' + OCEAN + '"/><path d="' + g.grat + '" fill="none" stroke="#eef2ec" stroke-width="1.3" opacity=".85"/>';
  s += '<path d="' + g.land + '" fill="' + (op.land || LAND) + '" stroke="' + INK + '" stroke-width="1.7" stroke-linejoin="round"/>';
  // shade: hatching on the night side (lower right), like the reference
  s += '<g clip-path="url(#' + id + ')"><path fill-rule="evenodd" d="M' + f(cx - r - 10) + ' ' + f(cy - r - 10) + ' h' + f(2 * r + 20) + ' v' + f(2 * r + 20) + ' h' + f(-2 * r - 20) + ' Z M' + f(cx - r * .28 + r * 1.06) + ' ' + f(cy - r * .2) + ' a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(-2 * r * 1.06) + ' 0 a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(2 * r * 1.06) + ' 0 Z" fill="url(#hatch)"/>' +
       '<path fill-rule="evenodd" d="M' + f(cx - r - 10) + ' ' + f(cy - r - 10) + ' h' + f(2 * r + 20) + ' v' + f(2 * r + 20) + ' h' + f(-2 * r - 20) + ' Z M' + f(cx - r * .28 + r * 1.06) + ' ' + f(cy - r * .2) + ' a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(-2 * r * 1.06) + ' 0 a' + f(r * 1.06) + ' ' + f(r * 1.06) + ' 0 1 0 ' + f(2 * r * 1.06) + ' 0 Z" fill="' + INK + '" opacity=".07"/></g>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  if (op.dot) { var p = g.project(op.dot); var vis = GEO_visible(op.dot, lon, lat); if (p && vis) s += C(p[0], p[1], 8, INK, 2) + C(p[0], p[1], 3, "#fff", 0); }
  return s;
}
function GEO_visible(ll, lon, lat) {   // is (lon,lat) on the near side of a globe centred on (lon0,lat0)?
  var r = Math.PI / 180, a = ll[0] * r, b = ll[1] * r, a0 = lon * r, b0 = lat * r;
  return Math.sin(b0) * Math.sin(b) + Math.cos(b0) * Math.cos(b) * Math.cos(a - a0) > 0.05;
}
// the Moon: grey disc, craters, hatched shadow side
function moon(x, y, r) {
  var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + MOONC + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1.4, r * .06)) + '"/>';
  [[-.35, -.3, .2], [.25, -.1, .14], [-.05, .35, .17], [.4, .38, .1], [-.45, .2, .09]].forEach(function (c) { s += '<circle cx="' + f(x + c[0] * r) + '" cy="' + f(y + c[1] * r) + '" r="' + f(c[2] * r) + '" fill="#bfb8a8" stroke="' + INK + '" stroke-width="' + f(Math.max(.8, r * .03)) + '"/>'; });
  return s + '<path d="M' + f(x + r * .2) + ' ' + f(y - r * .98) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * .2) + ' ' + f(y + r * .98) + ' A' + f(r * .8) + ' ' + f(r) + ' 0 0 0 ' + f(x + r * .2) + ' ' + f(y - r * .98) + ' Z" fill="url(#hatch)"/>';
}
// the Sun (the reference shows it partly off-panel): rays turn slowly with t
function sun(x, y, r, t) {
  var s = "", k; for (k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2 + t * .15, r1 = r * 1.12, r2 = r * (k % 2 ? 1.3 : 1.45); s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>'; }
  return s + C(x, y, r, "#d98a4a", 2.4) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .78) + '" fill="#e2a062"/>';
}
// a water bulge round a globe: an ellipse stretched along angle ang (deg); k 0..1 how much; it breathes a little with the panel time
function bulge(cx, cy, r, k, ang, col) { k = k * (1 + .04 * Math.sin(window.__t * 2.2)); return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * (1.04 + .42 * k)) + '" ry="' + f(r * (1.04 + .03 * k)) + '" transform="rotate(' + f(ang || 0) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + (col || "#5f7f97") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
// a dimension line with end ticks that draws itself, and its value in serif under it
function measure(x1, y1, x2, y2, k, text, sz) {
  k = clamp(k); if (k <= 0) return ""; var a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 9, ny = Math.cos(a) * 9;
  var s = draw("M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2), k, INK, 2.2) + '<path d="M' + f(x1 - nx) + ' ' + f(y1 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  if (k > .95) s += '<path d="M' + f(x2 - nx) + ' ' + f(y2 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  return s + (text ? '<g opacity="' + f(clamp(k * 2 - 1)) + '">' + N(text, (x1 + x2) / 2, (y1 + y2) / 2 + (sz || 40) * 1.2, sz || 40) + '</g>' : "");
}
// an Arabic word in a framed box (numBox is for digits in serif; tag is for words like «أعلى مد»)
function tag(text, x, y, k, sz, col) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 30; var w = text.length * sz * .55 + 34; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * 1.05) + '" width="' + f(w) + '" height="' + f(sz * 1.65) + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(text, 0, sz * .3, sz, col || INK, 800)); }

// ── «ساسي» — drawings (helpers from videos/bypass/sketch/shots.js), traced from real anatomy plates (refs/SOURCES.md):
// the stomach from the NCI plate (refs/stomach-nci.jpg), the organs' places in the belly from Gray's Anatomy plate 1223
// (refs/abdomen-gray1223.png: liver over the right upper belly, stomach under the left ribs, the colon framing the coils
// of small bowel), and the new route from the NIDDK Roux-en-Y drawing (refs/rygb-niddk.png: a small pouch stapled off the
// top of the stomach, a limb of small bowel brought up to it in front of the stomach, the duodenum's limb rejoined lower).
// Front view as the surgeon sees it: the patient's left is on the viewer's right.
var WALL = "#e39a82", WALLD = "#b85a44", LUMEN = "#f0c9b6", FOLD = "#c8735c", GUT = "#e8b08f", GHREL = "#bd552f",
    SHIRT = "#7f97a6", SHIRT2 = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", DRAPE = "#9fb7a8", STEEL = "#b9bcb8";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a smooth curve through points (Catmull-Rom → cubic). cont = no leading M (to join onto a path)
function curve(p, cont) {
  var d = cont ? "" : "M" + f(p[0][0]) + " " + f(p[0][1]);
  for (var i = 0; i < p.length - 1; i++) {
    var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += " C" + f(b[0] + (c[0] - a[0]) / 6) + " " + f(b[1] + (c[1] - a[1]) / 6) + " " + f(c[0] - (e[0] - b[0]) / 6) + " " + f(c[1] - (e[1] - b[1]) / 6) + " " + f(c[0]) + " " + f(c[1]);
  }
  return d;
}
function rev(p) { return p.slice().reverse(); }
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the stomach, front view, world units (it fills about 380×560 around 330,380) ──
// traced from the NCI stomach plate (refs/SOURCES.md, refs/stomach-nci.jpg): world = 30 + 1.75 × plate px
var GC = [[315, 166], [324, 119], [350, 75], [398, 54], [450, 61], [490, 96], [518, 148], [534, 224], [538, 302], [529, 390], [510, 464], [478, 523], [436, 565], [385, 593], [328, 604], [275, 595], [230, 572], [194, 548], [177, 534]],   // greater curve, angle of His → pylorus (bottom)
    LC = [[180, 411], [205, 397], [231, 404], [254, 432], [278, 427], [292, 386], [294, 334], [291, 285], [282, 250]],   // pylorus (top) → angular notch → lesser curve → cardia
    SL = [[315, 166], [331, 215], [340, 285], [340, 355], [331, 416], [319, 469], [306, 521], [292, 565], [275, 595]],   // the staple line: His → about 5 cm before the pylorus (ends on GC[15])
    OES_L = [[282, 250], [254, 206], [226, 148], [205, 84], [191, -12], [186, -90]], OES_R = [[315, 166], [292, 145], [268, 110], [247, 58], [236, -12], [232, -90]],
    DUO = [[184, 472], [138, 470], [100, 464], [65, 481], [51, 539], [62, 640]];
var PY = [180, 411], P_FULL = curve(GC) + " L180 411" + curve(LC, 1) + " Z",
    P_SLEEVE = curve(SL) + curve(GC.slice(15), 1) + " L180 411" + curve(LC, 1) + " Z",
    P_CUT = curve(GC.slice(0, 16)) + curve(rev(SL), 1) + " Z";
// an organ: flat fill, a darker band just inside the outline (the wall), light hatching, ink outline
function organ(d, fill, band, sw) {
  var id = "og" + (++CLIPN);
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + fill + '"/>' +
    '<g clip-path="url(#' + id + ')"><path d="' + d + '" fill="none" stroke="' + (band || WALLD) + '" stroke-width="16"/><path d="' + d + '" fill="url(#hatch)" opacity=".22"/></g>' +
    '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (sw || 2.6) + '" stroke-linejoin="round"/>';
}
// soft folds (rugae) inside the stomach, clipped to a shape
function rugae(d, op) {
  var id = "rg" + (++CLIPN), sx = "";
  for (var i = 0; i < 9; i++) { var x0 = 250 + i * 32, q = ""; for (var y = 40; y <= 640; y += 20) { var x = x0 + 12 * Math.sin(y / 36 + i * 1.7) - (y > 420 ? (y - 420) * .45 : 0); q += (y === 40 ? "M" : " L") + f(x) + " " + y; } sx += '<path d="' + q + '" stroke="' + FOLD + '" stroke-width="2.4" fill="none" stroke-linejoin="round" opacity="' + (op || .55) + '"/>'; }
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' + sx + '</g>';
}
// a liquid filling a shape from the bottom: lvl 0..1 of the box y0..y1, the surface wobbles with t
function fillIn(d, lvl, t, y0, y1, col) {
  if (lvl <= 0) return ""; var id = "fl" + (++CLIPN), y = lerp(y1, y0, clamp(lvl)), w = "";
  for (var x = 60; x <= 600; x += 20) w += (x === 60 ? "M" : " L") + x + " " + f(y + 4 * Math.sin(x / 40 + t * 3));
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + w + ' L600 900 L60 900 Z" fill="' + (col || "#9fbccb") + '" opacity=".85"/><path d="' + w + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
}
function gullet(hl) { return organ(curve(OES_L) + " L" + OES_R[OES_R.length - 1].join(" ") + curve(rev(OES_R), 1) + " Z", hl ? "#e7a58f" : GUT, WALLD, 2.4); }
function duodenum() { var d = curve(DUO); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="74" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + GUT + '" stroke-width="68" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + WALLD + '" stroke-width="2" fill="none" opacity=".4" stroke-dasharray="4 10"/>'; }
function pylorus() { return '<path d="M180 414 Q166 472 178 531" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M180 414 Q166 472 178 531" stroke="' + WALLD + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
// ── people (copied from videos/choking/sketch/shots.js: real body proportions, Drillis & Contini) ──
// ── people: flat side-view figures facing left. Joints by angle (deg from straight down, + toward the front) or hands by IK.
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {   // elbow for a two-bone arm reaching tg; bend +1 / -1 picks the side
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
// Proportions from real body measurements (Drillis & Contini segment lengths as fractions of the standing height H,
// side-view depths from adult anthropometry). H = 400 units at s = 1:
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.06H
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
// o: {x, y (hip joint), s, lean, shirt, hair, legs: [[thigh, shin], [thigh, shin]], hands: [[x,y] | rel(), …], bend: [±1, ±1], belly, mouth, tilt}
// returns {far, body, near}: draw far, then whatever goes between, then body, then near. at(h, side): a point h above the hip
// along the trunk and side units to the front (+) or back (−).
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {   // two tapered segments: ink outlines first, then fills, so the joint stays clean
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]];   // the foot points to the front, square to the shank
    var toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1] + b[1] * 0 + 0], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    if (o.kneel) shoe = "";
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  // trunk outline: front then back, measured depths (chest 0.13H, waist 0.115H, seat 0.14H)
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  if (o.belly) fr = [[-6, 18], [14, 34], [34, 46], [56, 40], [76, 30], [92, 28], [110, 22], [120, 10]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var belt = atF(10, 0), tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  // head: 0.115H deep, 0.13H tall, face to the front; nose, ear, hair at the back and top
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.mouth ? '<ellipse cx="' + f(-rx * .82) + '" cy="' + f(ry * .48) + '" rx="' + f(rx * .13) + '" ry="' + f(ry * .08 + ry * .08 * o.mouth) + '" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// ══SHOTS══
// seconds from the start of line l to its caption chunk c
function cf(l, c) { return (LN[l].end - LN[l].start) * (window.CHUNKS[l][c] || 0); }
function bell(x, y, s, t, ring) {
  var sw = ring * 14 * Math.sin(t * 16), w = "";
  for (var i = 1; i <= 3; i++) { var r = 40 + i * 16; w += '<path d="M' + f(-r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 0 ' + f(-r * .7) + ' ' + f(r * .5) + ' M' + f(r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(r * .7) + ' ' + f(r * .5) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(clamp(ring * 1.4 - (i - 1) * .3)) + '"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", w + G("rotate(" + f(sw) + " 0 -40)", '<path d="M-34 20 C-34 -10 -30 -36 0 -38 C30 -36 34 -10 34 20 L44 30 L-44 30 Z" fill="#d9a441" stroke="' + INK + '" stroke-width="2.4"/><circle cy="38" r="8" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="-48" width="12" height="12" rx="3" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/>'));
}
function brain(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#d9a0a0") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }
function heart(x, y, sc, beatK) { var b = 1 + .06 * (beatK || 0); return G("translate(" + x + " " + y + ") scale(" + f(sc * b) + ")", '<path d="M0 34 C-60 -4 -50 -46 -18 -44 C-6 -44 0 -34 0 -28 C0 -34 6 -44 18 -44 C50 -46 60 -4 0 34 Z" fill="#c9533f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-8 -40 v-16 M8 -40 c0 -14 10 -18 20 -18" stroke="#4a6f8a" stroke-width="7" fill="none" stroke-linecap="round"/>'); }
function drop(x, y, s, col) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M0 -30 C14 -10 22 2 22 12 A22 22 0 0 1 -22 12 C-22 2 -14 -10 0 -30 Z" fill="' + (col || "#b8402f") + '" stroke="' + INK + '" stroke-width="2"/>'); }
function gauge(x, y, s, v) { var a = (-150 + 120 * v) * Math.PI / 180; return G("translate(" + x + " " + y + ") scale(" + s + ")", '<circle r="34" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 14 A28 28 0 1 1 24 14" stroke="' + ORANGE + '" stroke-width="5" fill="none" opacity=".5"/><path d="M0 0 L' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 26) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/><path d="M34 0 C60 0 60 40 30 46" stroke="' + INK + '" stroke-width="5" fill="none"/>'); }
function sleeper(x, y, s, t) { var z = ""; for (var i = 0; i < 3; i++) { var p = (t * .6 + i / 3) % 1; z += G("", T("z", 36 + p * 40 + i * 6, -20 - p * 50, 16 + 10 * p, BLUE, 800), 1 - p); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<rect x="-60" y="10" width="120" height="22" rx="6" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-6" rx="26" ry="23" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-26 -8 C-26 -36 24 -36 26 -10 C10 -22 -10 -22 -26 -8 Z" fill="' + HAIR + '"/><path d="M-12 -2 q5 4 10 0" stroke="' + INK + '" stroke-width="2" fill="none"/>' + z); }
function scale(x, y, txt, col) { return G("translate(" + x + " " + y + ") scale(1.5)", '<rect x="-74" y="-14" width="148" height="28" rx="8" fill="#e8e3d6" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-10" width="60" height="18" rx="3" fill="#f6f2e8" stroke="' + INK + '" stroke-width="1.4"/>' + N(txt, 0, 5, 13, col || INK)); }
function pills(x, y, s, t) { var p = ""; for (var i = 0; i < 5; i++) { var a = i * 1.3 + Math.sin(t * 1.5 + i) * .2; p += G("translate(" + (i * 34 - 70) + " " + (110 + 6 * Math.sin(t * 2 + i)) + ") rotate(" + f(a * 30) + ")", '<rect x="-20" y="-9" width="40" height="18" rx="9" fill="' + (i % 2 ? "#e2c25b" : "#c96a4a") + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -9 V9" stroke="' + INK + '" stroke-width="1.4"/>'); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-56, -80, 112, 150, "#f4efe3", 2.6, 12) + R(-62, -110, 124, 36, OLIVE, 2.4, 6) + R(-46, -40, 92, 64, "#e9dfc6", 1.6) + T("فيتامين", 0, -8, 18, OLIVE, 800) + T("حديد", 0, 16, 16, INK, 700) + p); }
function head(x, y, s, hair, t) {   // a side-view head (face to the left) with the hair cap; hair 0..1 how much is left
  var hs = "", N0 = 30; for (var i = 0; i < N0; i++) { if (hash(i * 3.1) > hair) continue; var a0 = (-150 + i * 5.2) * Math.PI / 180, a1 = a0 + .42, r = 63 + 3 * hash(i);
    hs += '<path d="M' + f(Math.cos(a0) * r) + ' ' + f(Math.sin(a0) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(Math.cos(a1) * r) + ' ' + f(Math.sin(a1) * r) + '" stroke="' + HAIR + '" stroke-width="9" fill="none" stroke-linecap="round"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M-16 60 L-14 110 L36 110 L36 56 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="60" ry="68" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>' + hs +
    '<path d="M-60 -6 l-16 24 l16 4" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="12" cy="4" rx="9" ry="14" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-40 -16 h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
}

// ── tubes, routes, particles ──
var LIVER = "#9c4a3a", LIVERD = "#6f2f25", GALL = "#6f8a4a", PANC = "#e3c27a", PANCD = "#b08f45", BOWEL = "#e8a98c", BOWELD = "#b9644c",
    COLON = "#d9b49a", COLOND = "#a67b62", BILE = "#7d9a3a", FOODC = "#8a5a3c", HORM = "#4a6f8a", STEEL = "#b9bcb8", POUCHC = "#f0b9a0";
// dense points on the smooth curve through pts
function cr(pts, n) {
  n = n || 10; var o = [];
  for (var i = 0; i < pts.length - 1; i++) { var a = pts[i - 1] || pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] || c;
    for (var j = 0; j < n; j++) { var u = j / n, u2 = u * u, u3 = u2 * u;
      o.push([.5 * (2 * b[0] + (-a[0] + c[0]) * u + (2 * a[0] - 5 * b[0] + 4 * c[0] - e[0]) * u2 + (-a[0] + 3 * b[0] - 3 * c[0] + e[0]) * u3),
              .5 * (2 * b[1] + (-a[1] + c[1]) * u + (2 * a[1] - 5 * b[1] + 4 * c[1] - e[1]) * u2 + (-a[1] + 3 * b[1] - 3 * c[1] + e[1]) * u3)]); } }
  o.push(pts[pts.length - 1]); return o;
}
function part(pts, k0, k1) { var n = pts.length - 1, a = Math.round(clamp(k0) * n), b = Math.round(clamp(k1) * n); return pts.slice(a, Math.max(a + 2, b + 1)); }
// a length of bowel: ink outline, flat fill, a lit strip, and the ring folds across it. o: {fill, dark, ticks, cap}
function tube(pts, w, o) {
  o = o || {}; if (pts.length < 2) return ""; var d = pathPts(pts), cap = o.cap || "round";
  return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 5) + '" fill="none" stroke-linecap="' + cap + '" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="' + (o.fill || BOWEL) + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="' + cap + '" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="' + (o.dark || BOWELD) + '" stroke-width="' + f(w * .78) + '" fill="none" stroke-dasharray="2.2 ' + (o.ticks || 11) + '" opacity=".5"/>' +
    '<path d="' + d + '" stroke="#fff" stroke-width="' + f(w * .16) + '" fill="none" stroke-linecap="round" opacity=".28" transform="translate(' + f(-w * .2) + ' ' + f(-w * .2) + ')"/>';
}
// dots running along a route: n dots, speed in route-lengths per second, k = how far the route is open (0..1)
function flow(pts, t, n, sp, col, r, k, sq) {
  var s = ""; k = k == null ? 1 : clamp(k); if (k <= 0) return "";
  for (var i = 0; i < n; i++) { var q = ((t * sp + i / n) % 1); if (q > k) continue; var p = along(pts, q), a = Math.min(1, q * 12, (k - q) * 12 + .2);
    s += sq ? '<rect x="' + f(p[0] - r) + '" y="' + f(p[1] - r) + '" width="' + f(2 * r) + '" height="' + f(2 * r) + '" rx="' + f(r * .5) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.3" opacity="' + f(a) + '" transform="rotate(' + f(q * 700 + i * 40) + ' ' + f(p[0]) + ' ' + f(p[1]) + ')"/>'
            : '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(a) + '"/>'; }
  return s;
}

// ── the close-up: stomach, duodenum, the first loops of jejunum; before and after the bypass ──
var CUT = [404, 830], YP = [470, 985], JOIN = [348, 268],
    DUOJ = cr([[184, 472], [138, 470], [100, 464], [65, 481], [51, 539], [62, 620], [100, 680], [170, 708], [260, 704], [340, 690], [392, 712], [410, 770], CUT]),   // duodenum and the first jejunum, down to the cut
    LOWER = cr([CUT, [400, 880], [425, 940], YP]),   // the piece just below the cut (before); it becomes the limb brought up
    ROUX = cr([YP, [548, 930], [612, 810], [630, 640], [614, 470], [562, 352], [470, 292], [392, 270], JOIN]),   // Y → pouch, in front of the stomach
    STUB = cr([CUT, [414, 895], [440, 950], [462, 978]]),   // the duodenum's limb rejoined to the side of the other, lower down
    COMMON = cr([YP, [502, 1040], [482, 1110], [400, 1150], [300, 1165], [200, 1195], [110, 1260]]),
    OESC = cr([[210, -80], [214, 0], [226, 90], [250, 160], [290, 215], [318, 250]]),
    POUCH = "M282 250 L291 285 Q292 300 300 303 L344 298 Q352 296 351 286 L346 215 Q344 196 315 166 Z",
    PSTAPLE = [[293, 304], [320, 301], [350, 297], [349, 250], [346, 212], [332, 184], [315, 166]];
var FOOD_OLD = OESC.concat(cr([[318, 250], [380, 215], [440, 240], [470, 330], [440, 450], [360, 520], [260, 520], [184, 472]]), DUOJ, LOWER, COMMON),
    FOOD_NEW = OESC.concat(rev(ROUX), COMMON), JUICE = cr([[450, 330], [430, 450], [350, 520], [260, 520], [184, 472]]).concat(DUOJ, STUB, COMMON);
// lerp two point lists of any length
function morph(a, b, k) { var n = 40, o = []; for (var i = 0; i <= n; i++) o.push(L2(along(a, i / n), along(b, i / n), k)); return o; }
function liverUp() {   // the liver's left lobe and the gallbladder at the top left (lifted clear of the stomach, as in surgery)
  var d = curve([[-80, 150], [-10, 70], [90, 40], [170, 60], [205, 120], [190, 200], [120, 290], [30, 360], [-80, 380]]) + " Z";
  return organ(d, LIVER, LIVERD) + '<path d="M40 90 C70 160 60 250 10 330" stroke="' + LIVERD + '" stroke-width="3" fill="none"/>' +
    '<path d="M70 318 C92 372 96 430 88 482" stroke="' + INK + '" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M70 318 C92 372 96 430 88 482" stroke="' + BILE + '" stroke-width="6.5" fill="none" stroke-linecap="round"/>' +
    P("M52 300 C28 318 22 372 46 392 C70 398 86 356 76 318 C72 304 62 296 52 300 Z", GALL, 2.2);
}
function pancreas() { var d = curve([[96, 560], [120, 520], [180, 540], [250, 572], [340, 590], [440, 580], [520, 560], [548, 580], [520, 618], [430, 640], [330, 648], [240, 640], [160, 640], [110, 620]]) + " Z";
  var s = organ(d, PANC, PANCD); for (var i = 0; i < 9; i++) s += '<path d="M' + (140 + i * 44) + ' ' + (566 + (i % 2) * 6) + ' q14 22 0 52" stroke="' + PANCD + '" stroke-width="1.8" fill="none" opacity=".7"/>'; return s; }
// o: {after: 0|1, pouch: 0..1 staple line drawn, cut: 0..1 scissors gap, up: 0..1 lower piece brought up to the pouch, stub: 0..1,
//     hlPouch, hlRem, dimRem, fill: pouch fill, common: 0|1 show common channel, mini}
function gutCloseup(t, o) {
  o = o || {}; var s = "", up = o.after ? 1 : clamp(o.up || 0), cut = o.after ? 1 : clamp(o.cut || 0), stub = o.after ? 1 : clamp(o.stub || 0), pk = o.after ? 1 : clamp(o.pouch || 0);
  s += liverUp() + pancreas();
  s += tube(COMMON, 50) + tube(DUOJ, 54);
  // the lower piece: in place (before), or swung up to the pouch (after)
  var low = up > 0 ? morph(rev(LOWER), ROUX, ease(up)) : rev(LOWER);
  if (stub > 0) s += tube(part(STUB, 0, stub), 50);
  if (cut > 0 && up < 1) s += '<circle cx="' + CUT[0] + '" cy="' + CUT[1] + '" r="' + f(8 + 26 * cut) + '" fill="' + PAPER + '" opacity="' + f(.9 * cut) + '"/>';
  var rem = gullet() + organ(P_FULL, o.hlRem ? "#eaa890" : WALL) + rugae(P_FULL) + pylorus();
  s += o.dimRem ? dim(o.dimRem, rem) : rem;
  if (o.remFill) s += fillIn(P_FULL, o.remFill, t, 100, 610, "#c9c46a");
  if (pk > 0) { s += G("", organ(POUCH, o.hlPouch ? "#f6c9a4" : POUCHC, o.hlPouch ? ORANGE : WALLD), pk) + (o.fill ? fillIn(POUCH, o.fill, t, 170, 304, "#c79a63") : "");
    var pp = part(cr(PSTAPLE, 6), 0, pk); s += '<path d="' + pathPts(pp) + '" stroke="' + PAPER + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + pathPts(pp) + '" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-dasharray="7 5"/>'; }
  if (up > 0 || !o.after) s += tube(low, 50, { fill: o.hlRoux ? "#f3c0a0" : BOWEL });
  if (up >= 1) s += '<ellipse cx="' + JOIN[0] + '" cy="' + JOIN[1] + '" rx="10" ry="24" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="4 4"/>';
  if (stub >= 1) s += '<ellipse cx="464" cy="980" rx="22" ry="10" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="4 4" transform="rotate(50 464 980)"/>';
  return s;
}

// ── the whole belly (Gray's plate 1223): liver top left, stomach under the left ribs, colon framing the coils of small bowel ──
var TRUNK = "M150 40 C150 20 490 20 490 40 L520 300 C540 420 520 560 500 800 L140 800 C120 560 100 420 120 300 Z";
var COLONP = cr([[214, 668], [196, 640], [190, 560], [192, 500], [206, 452], [250, 448], [320, 466], [390, 452], [440, 420], [458, 440], [462, 520], [456, 610], [420, 668], [360, 700], [324, 740], [320, 790]], 8),
    COILS = (function () { var p = [[262, 452], [300, 470], [350, 462], [400, 476], [420, 500], [396, 520], [340, 512], [280, 520], [240, 506], [228, 532], [262, 552], [320, 548], [380, 556], [420, 546], [428, 576], [390, 592], [330, 584], [270, 592], [234, 580], [228, 610], [266, 628], [330, 620], [392, 630], [410, 656], [360, 664], [300, 656], [250, 662], [222, 650]]; return cr(p, 6); })();
var MINI = "translate(226 177) scale(.42)", ROUTE_ALL = cr([[262, -40], [300, 40], [316, 150], [330, 260], [372, 290], [410, 320], [398, 372], [330, 400], [296, 378], [262, 372], [248, 400], [262, 452]], 6).concat(COILS);
function abdomen(t, o) {
  o = o || {}; var s = P(TRUNK, SKIN, 2.6) + '<path d="' + TRUNK + '" fill="url(#hatch)" opacity=".12"/>';
  s += '<path d="M180 60 C230 200 300 260 320 280 C340 260 410 200 460 60" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none"/>';
  for (var i = 0; i < 4; i++) s += '<path d="M' + (200 + i * 10) + ' ' + (80 + i * 40) + ' Q260 ' + (110 + i * 40) + ' 310 ' + (100 + i * 40) + ' M' + (440 - i * 10) + ' ' + (80 + i * 40) + ' Q380 ' + (110 + i * 40) + ' 330 ' + (100 + i * 40) + '" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none" opacity=".7"/>';
  s += tube(COLONP, 36, { fill: COLON, dark: COLOND, ticks: 17 });
  s += P("M214 668 C196 690 206 716 226 706", "none", 5);   // the appendix end
  s += tube(COILS, 21, { ticks: 7 });
  var body = G(MINI, pancreas() + tube(DUOJ.slice(0, 96), 54) + gullet() + organ(P_FULL, o.hlSt ? "#eaa890" : WALL) + pylorus());
  s += body;
  // the liver: big right lobe on the viewer's left, thinning across the midline over the stomach's edge
  var lv = curve([[150, 262], [156, 214], [196, 184], [262, 176], [330, 190], [392, 214], [410, 236], [372, 262], [318, 286], [262, 318], [206, 344], [166, 330]]) + " Z";
  s += organ(lv, LIVER, LIVERD) + '<path d="M300 186 C296 230 286 270 268 314" stroke="' + LIVERD + '" stroke-width="2.4" fill="none"/>';
  s += P("M236 318 C222 328 220 356 234 364 C248 364 254 340 250 324 C246 316 240 314 236 318 Z", GALL, 1.8);
  s += '<ellipse cx="320" cy="600" rx="6" ry="8" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>';
  return s;
}
// small icons
function egg(s) { return G("scale(" + (s || 1) + ")", '<path d="M0 -38 C22 -38 32 -4 32 12 A32 30 0 0 1 -32 12 C-32 -4 -22 -38 0 -38 Z" fill="#f4ead6" stroke="' + INK + '" stroke-width="2.4"/><path d="M-16 -8 q4 -16 14 -20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'); }
function spoon(x, y, r) { return G("translate(" + x + " " + y + ") rotate(" + r + ")", '<ellipse cx="0" cy="-22" rx="14" ry="20" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-22" rx="9" ry="14" fill="' + FOODC + '" opacity=".8"/><rect x="-3.5" y="-4" width="7" height="46" rx="3" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>'); }
function scissors(x, y, rot, open) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", [1, -1].map(function (q) { return G("rotate(" + f(q * (6 + 16 * open)) + ")", '<path d="M0 0 L70 -5 L74 0 L70 5 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 L-34 ' + (q * 10) + '" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><circle cx="-46" cy="' + (q * 14) + '" r="13" fill="none" stroke="' + ORANGE + '" stroke-width="6"/>'); }).join("") + '<circle r="4" fill="' + INK + '"/>'); }
function stapler2(pts, k, t) { var p = along(pts, clamp(k)), p2 = along(pts, clamp(k + .03)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180 / Math.PI, o = 3 + 3 * Math.abs(Math.sin(t * 9));
  return G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a - 180) + ")", '<rect x="-6" y="' + f(-o - 11) + '" width="96" height="11" rx="3" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="' + f(o) + '" width="96" height="11" rx="3" fill="#9ea3a0" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-13" width="110" height="26" rx="6" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>'); }
function detour(s) { return G("scale(" + (s || 1) + ")", '<rect x="-46" y="-34" width="92" height="68" rx="6" fill="#e2a23a" stroke="' + INK + '" stroke-width="2.6"/><path d="M-26 14 V-2 Q-26 -14 -14 -14 H16" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M12 -26 L32 -14 L12 -2 Z" fill="' + INK + '"/><rect x="-5" y="34" width="10" height="26" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>'); }
function chipsN(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 48) + '" cy="' + y + '" r="18" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 48, y + 7, 19, c ? "#fff" : INK); } return s; }
function cig(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ") rotate(-20)", '<rect x="-40" y="-7" width="62" height="14" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="-40" y="-7" width="22" height="14" fill="#d9a441" stroke="' + INK + '" stroke-width="2"/><rect x="22" y="-7" width="8" height="14" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M34 -10 q8 -12 0 -22 q-8 -10 2 -22" stroke="' + MUTE + '" stroke-width="3" fill="none" stroke-linecap="round"/>'); }
function tablet(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<circle r="22" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/><path d="M-22 0 H22" stroke="' + INK + '" stroke-width="1.8"/>'); }
function cake(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M-40 30 L40 30 L40 -6 L-40 -6 Z" fill="#e8d2a6" stroke="' + INK + '" stroke-width="2.2"/><path d="M-40 -6 Q-30 -26 0 -24 Q30 -26 40 -6 Z" fill="#c96a8a" stroke="' + INK + '" stroke-width="2"/><circle cy="-30" r="8" fill="#c9533f" stroke="' + INK + '" stroke-width="1.6"/>'); }
var Z_ALL = .6, C_ALL = [340, 570];
function sweat(x, y, t, n) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .9 + i / n) % 1; s += G("", drop(x + (i - n / 2) * 16 + 6 * Math.sin(i * 9), y + p * 46, .22, "#7fa7bd"), 1 - p); } return s; }


// staples along the staple line, drawn up to k
function staples(k, col) {
  k = clamp(k); if (k <= 0) return ""; var s = draw(curve(SL), k, col || INK, 3);
  for (var i = 0; i <= 26; i++) { var q = i / 26; if (q > k) break; var p = along(SL, q), p2 = along(SL, Math.min(1, q + .01)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    s += G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a * 180 / Math.PI) + ")", '<path d="M-4 -7 h8 M-4 7 h8" stroke="' + (col || INK) + '" stroke-width="2.6" stroke-linecap="round"/>'); }
  return s;
}

// ── SASI: the sleeve, the pylorus and duodenum left as they are, and one loop of the last small bowel (ileum) brought up
// to the antrum. Places from Gray's plate 1223 (the caecum and the end of the ileum low on the viewer's left), the stomach
// from the NCI plate, the bowel look from the NIDDK drawing (refs/SOURCES.md). No published SASI plate could be fetched;
// the join follows the technique papers: a side-to-side gastro-ileal join on the antrum, about 2.5 m before the caecum.
var AN = [252, 592],
    JEJ = cr([CUT, [470, 852], [556, 832], [610, 880], [560, 926], [480, 920], [470, 960], [540, 990], [590, 1000]], 8),
    ILIN = cr([[590, 1000], [612, 900], [570, 780], [450, 690], [270, 612]], 8),
    ILOUT = cr([[238, 612], [160, 690], [116, 800], [118, 920], [160, 1010]], 8),
    LOOP = ILIN.concat(ILOUT), LOOP_DOWN = cr([[590, 1000], [560, 1050], [450, 1080], [320, 1080], [210, 1060], [160, 1010]], 10),
    SLV_A = cr([[318, 250], [316, 330], [312, 400], [292, 468], [236, 500], [184, 472]], 8),
    SLV_B = cr([[318, 250], [316, 330], [312, 400], [300, 480], [266, 552], [248, 600]], 8),
    PATH_A = OESC.concat(SLV_A, DUOJ, JEJ, ILIN, ILOUT), PATH_B = OESC.concat(SLV_B, ILOUT);
function caecum() { return G("translate(0 -170)", P("M100 1170 C70 1180 70 1260 110 1280 C150 1296 220 1290 240 1250 C256 1214 230 1170 190 1166 Z", COLON, 2.6) + '<path d="M120 1200 q40 10 90 0 M110 1240 q50 12 110 0" stroke="' + COLOND + '" stroke-width="2" fill="none"/>' + tube(cr([[230, 1250], [300, 1290], [330, 1360]]), 40, { fill: COLON, dark: COLOND, ticks: 17 }) + tube(cr([[110, 1180], [100, 1100], [96, 1000]]), 44, { fill: COLON, dark: COLOND, ticks: 17 })); }
// o: {cut: 0..1 the sleeve's removed part drifting off (1 = gone), sl: staple line 0..1, loop: 0..1 brought up, an: 0..1 join,
//     hlLoop, hlDuo, hlSleeve, dim: 0..1 everything but the two routes, full: the whole stomach before the sleeve}
function sasiCloseup(t, o) {
  o = o || {}; var s = "", cut = o.cut == null ? 1 : clamp(o.cut), lp = o.loop == null ? 1 : clamp(o.loop), an = o.an == null ? lp : clamp(o.an);
  var bg = liverUp() + pancreas() + caecum() + tube(JEJ, 50) + tube(DUOJ, 54, { fill: o.hlDuo ? "#f3c0a0" : BOWEL, dark: o.hlDuo ? ORANGE : BOWELD });
  s += o.dim ? dim(o.dim, bg) : bg;
  var lpts = lp >= 1 ? LOOP : lp <= 0 ? LOOP_DOWN : morph(LOOP_DOWN, LOOP, ease(lp));
  s += tube(lpts, 50, { fill: o.hlLoop ? "#f3c0a0" : BOWEL, dark: o.hlLoop ? ORANGE : BOWELD });
  var st = gullet() + (o.full ? organ(P_FULL, WALL) + rugae(P_FULL) : organ(P_SLEEVE, o.hlSleeve ? "#f2b39a" : WALL) + rugae(P_SLEEVE)) + pylorus();
  s += o.dim ? dim(o.dim * .6, st) : st;
  if (!o.full && cut < 1) s += G("translate(" + f(170 * ease(cut)) + " " + f(-50 * ease(cut)) + ") rotate(" + f(16 * ease(cut)) + " 420 380)", organ(P_CUT, "#e9a07a") + rugae(P_CUT) + '<path d="' + P_CUT + '" fill="' + ORANGE + '" opacity=".22"/>', 1 - .6 * cut);
  if (o.sl != null || !o.full) s += staples(o.sl == null ? 1 : o.sl, OLIVE);
  if (an > 0) s += G("", '<ellipse cx="' + AN[0] + '" cy="' + AN[1] + '" rx="26" ry="11" fill="' + (o.hlAn ? "#f6c9a4" : "none") + '" stroke="' + INK + '" stroke-width="2.6" stroke-dasharray="5 4"/>', an);
  return s;
}
function flowA(t, k, n) { return flow(PATH_A, t, n || 16, .07, FOODC, 10, k, 1); }
function flowB(t, k, n) { return flow(PATH_B, t, n || 7, .18, "#c7743c", 10, k, 1); }
function egyptFlag(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-45, -30, 90, 20, "#c9533f", 1.6) + R(-45, -10, 90, 20, "#f4efe3", 1.6) + R(-45, 10, 90, 20, INK, 1.6) + '<circle cy="0" r="6" fill="#d9a441" stroke="' + INK + '" stroke-width="1"/><rect x="-47" y="-30" width="4" height="96" fill="#5f6b70"/>'); }
function pipe(t, tap, k) {   // a water pipe with a side tap: dots run along it, and some leave through the tap when it opens
  var s = R(20, 360, 600, 56, "#c9d3d4", 2.6, 8) + '<path d="M20 372 H620" stroke="#fff" stroke-width="5" opacity=".5"/>' + R(300, 416, 44, 120, "#c9d3d4", 2.6) + R(286, 410, 72, 18, "#9ea3a0", 2.2, 4);
  s += G("translate(322 470) rotate(" + f(90 * tap) + ")", R(-6, -40, 12, 40, ORANGE, 2) + '<circle cy="-44" r="12" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>');
  for (var i = 0; i < 14; i++) { var q = (t * .22 + i / 14) % 1, x = 30 + q * 580, side = tap > .5 && i % 3 === 0 && x > 320; if (side) { var qq = (x - 320) / 290; s += C(322, 430 + qq * 200, 7, BLUE, 1.2); } else s += C(x, 388, 7, BLUE, 1.2); }
  return s;
}

// ── shots ──
// 4 · the name: S A S I = sleeve, one join, the last bowel
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), L = ["S", "A", "S", "I"], W = ["تكميم", "توصيلة", "واحدة", "آخر الأمعاء"], c1 = cf(4, 1);
  for (var i = 0; i < 4; i++) { var x = 110 + i * 140; s += G("translate(0 " + f(4 * Math.sin(t * 3 + i)) + ")", N(L[i], x, 330, 120, i % 2 ? ORANGE : INK), at(u, .2 + i * .15, .3)); s += G("", T(W[i], x, 420, 22, i === 1 || i === 2 ? ORANGE : OLIVE, 800), at(u, c1 + i * .35, .3)); }
  return s + G("", tag("ساسي", 320, 160, 1, 44, ORANGE), at(u, .1, .3));
});
// 5 · step one: an ordinary sleeve; the big outer part is removed, a banana-shaped tube is left
shot(5, push(330, 360, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .2, 1.6), cut = at(u, 2.0, 1.4);
  return paper() + G("translate(0 0)", gullet() + organ(P_SLEEVE, WALL) + rugae(P_SLEEVE) + (cut < 1 ? G("translate(" + f(170 * ease(cut)) + " " + f(-50 * ease(cut)) + ") rotate(" + f(16 * ease(cut)) + " 420 380)", organ(P_CUT, "#e9a07a") + rugae(P_CUT) + '<path d="' + P_CUT + '" fill="' + ORANGE + '" opacity="' + f(.25 * k) + '"/>', 1 - .6 * cut) : "") + pylorus() + staples(k, OLIVE)) +
    tube(DUOJ.slice(0, 40), 54) + G("", tag("1", 90, 100, 1, 34, ORANGE), at(u, .1, .3)) + label(440, 300, 470, 120, "بيتشال", ORANGE, at(u, 1.0, .4), 24) + iconBox(510, 620, 130, banana(), at(u, cf(5, 2), .3));
});
// 6 · but the pylorus and the duodenum keep working
shot(6, push(250, 470, 1.1, 1.2), function (u, d, t) {
  return paper() + sasiCloseup(t, { loop: 0, an: 0, hlDuo: 1 }) + flow(SLV_A.concat(DUOJ), t, 7, .2, FOODC, 10, at(u, .4, 1.2), 1) +
    label(176, 440, 330, 330, "البواب", OLIVE, at(u, .3, .4), 24) + label(80, 560, 230, 740, "الاتناشر", OLIVE, at(u, .8, .4), 24) + check(470, 480, 1.4, at(u, cf(6, 1), .4), OLIVE);
});
// 7 · step two: the last part of the small bowel, about 2.5 m before its end
shot(7, push(340, 760, .7, .66), function (u, d, t) {
  var hk = at(u, .3, .5), seg = part(LOOP_DOWN, 0, 1);
  return paper() + sasiCloseup(t, { loop: 0, an: 0, dim: .4 }) + G("", '<path d="' + pathPts(seg) + '" stroke="' + ORANGE + '" stroke-width="64" fill="none" opacity=".25" stroke-linecap="round"/>', hk) +
    G("", tag("2", 90, 120, 1, 50, ORANGE), at(u, .1, .3)) + label(160, 1010, 330, 1180, "نهاية الأمعاء الدقيقة", OLIVE, at(u, .8, .4), 32) + G("", numBox("2.5 m", 470, 1110, 1, 40, true), at(u, cf(7, 2), .3)) + draw(pathPts(part(LOOP_DOWN, .4, 1)), at(u, cf(7, 2), 1.0), ORANGE, 6, ' stroke-dasharray="10 8"');
}, { tr: "out" });
// 8 · it is brought up and opened onto the end of the tube: one join only
shot(8, push(340, 620, .66, .7), function (u, d, t) {
  var up = at(u, .1, 2.0), c1 = cf(8, 1);
  return paper() + sasiCloseup(t, { loop: up, an: at(u, 2.0, .4), hlLoop: 1, hlAn: 1 }) + (up < 1 ? arrow(330, 900, 300, 720, ORANGE, 8, 1) : "") +
    label(AN[0], AN[1] + 8, 470, 470, "توصيلة واحدة", ORANGE, at(u, c1, .4), 32) + G("", numBox("1", 120, 470, 1, 44, true), at(u, c1 + .4, .3));
});
// 9 · the food splits: some goes on the usual road through the pylorus, some takes the shortcut through the join
shot(9, push(340, 500, .64, .67), function (u, d, t) {
  var c1 = cf(9, 1);
  return paper() + sasiCloseup(t, { dim: .35 }) + flowA(t, at(u, .1, 1.4)) + flowB(t, at(u, c1, 1.2)) +
    G("", tag("الطريق العادي", 520, 980, 1, 32, OLIVE), at(u, .6, .3)) + G("", tag("المختصر", 130, 980, 1, 36, ORANGE), at(u, c1 + .2, .3));
});
// 10 · like water in a pipe with a side tap opened
shot(10, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var tap = at(u, .8, .6);
  return paper() + pipe(t, tap) + G("", tag("حنفية جانبية", 470, 640, 1, 30, BLUE), at(u, 1.0, .3)) + G("", T("ماسورة", 120, 330, 26, INK, 800), at(u, .2, .3));
});
// 11 · the shortcut food reaches the end of the bowel early
shot(11, push(240, 760, .8, .86), function (u, d, t) {
  return paper() + sasiCloseup(t, { dim: .4, hlLoop: 1 }) + flowB(t, 1, 8) + G("", tag("بدري", 300, 1000, 1, 40, ORANGE), at(u, cf(11, 1) + .3, .3)) + label(118, 900, 340, 900, "آخر الأمعاء", OLIVE, at(u, .4, .4), 30);
});
// 12 · there it releases satiety hormones that close the appetite and steady the sugar
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), coil = cr([[120, 560], [200, 510], [290, 560], [380, 510], [470, 560], [540, 640], [470, 700], [380, 660], [290, 710], [200, 660], [120, 710]], 8), hk = at(u, .3, .6), c1 = cf(12, 1), i;
  s += tube(coil, 46) + flow(coil, t, 8, .2, "#c7743c", 9, 1, 1) + G("", T("آخر الأمعاء", 320, 790, 26, OLIVE, 800), 1);
  for (i = 0; i < 10; i++) { var q = ((t * .45 + i / 10) % 1), x0 = 150 + i * 36, tx = i % 2 ? 470 : 170; s += G("", C(lerp(x0, tx, q), lerp(580, 260, q) + 14 * Math.sin(q * 9 + i), 7, HORM, 1.4), hk * Math.sin(q * Math.PI)); }
  s += G("", brain(170, 180, 1.5, "#d9a0a0") + T("شبع", 170, 290, 30, HORM, 800), at(u, .2, .3)) + G("", drop(470, 180, 1.7) + T("السكر", 470, 290, 30, HORM, 800) + check(560, 170, .9, at(u, c1 + .6, .4), OLIVE), at(u, c1, .3));
  return s + G("", tag("هرمونات", 320, 420, 1, 26, HORM), hk);
});
// 13 · and with the sleeve, a small stomach and little hunger hormone
shot(13, push(330, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + gullet() + organ(P_SLEEVE, WALL) + rugae(P_SLEEVE) + pylorus() + staples(1, OLIVE) + tube(DUOJ.slice(0, 40), 54) + '<path d="' + P_FULL + '" fill="none" stroke="' + MUTE + '" stroke-width="2" stroke-dasharray="7 7"/>' +
    G("", tag("معدة صغيرة", 470, 140, 1, 28, OLIVE), at(u, .3, .3)) + iconBox(480, 470, 150, bell(0, 6, .9, t, .15), at(u, cf(13, 1), .3)) + G("", T("جوع أقل", 480, 580, 24, ORANGE, 800), at(u, cf(13, 1) + .2, .3));
});
// 14 · versus the bypass: no closed-off pouch and no bowel left out
shot(14, push(320, 420, 1.0, 1.0), function (u, d, t) {
  var c1 = cf(14, 1), c2 = cf(14, 2), s = paper();
  s += G("translate(-12 110) scale(.33)", sasiCloseup(t, {}) + flowA(t, 1, 12) + flowB(t, 1, 5)) + G("translate(305 110) scale(.33)", gutCloseup(t, { after: 1 }) + flow(FOOD_NEW, t, 9, .15, FOODC, 11, 1, 1));
  s += T("ساسي", 160, 110, 30, ORANGE, 800) + T("تحويل المسار", 480, 110, 30, MUTE, 800) + '<path d="M320 90 V560" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>';
  s += G("", T("جيب مقفول", 480, 610, 24, INK, 800) + check(480, 660, .8, 1, MUTE) + T("مفيش", 160, 610, 24, INK, 800) + cross(160, 660, .7, at(u, c1 + .3, .4)), at(u, c1, .3));
  s += G("", T("أمعاء متسابة", 480, 730, 24, INK, 800) + check(480, 780, .8, 1, MUTE) + T("مفيش", 160, 730, 24, INK, 800) + cross(160, 780, .7, at(u, c2 + .3, .4)), at(u, c2, .3));
  return s;
});
// 15 · the duodenum still sees food: iron and calcium are absorbed better
shot(15, push(270, 560, 1.0, 1.05), function (u, d, t) {
  return paper() + sasiCloseup(t, { hlDuo: 1, dim: .2 }) + flow(SLV_A.concat(DUOJ), t, 8, .2, FOODC, 10, 1, 1) + numBox("Fe", 360, 760, at(u, cf(15, 1), .3), 34, true) + numBox("Ca", 460, 760, at(u, cf(15, 1) + .3, .3), 34, true) + check(560, 750, 1.0, at(u, cf(15, 1) + .9, .4), OLIVE) + label(80, 560, 160, 700, "الاتناشر", OLIVE, at(u, .2, .4), 26);
});
// 16 · and a doctor can still look at it with an endoscope
shot(16, push(250, 360, .9, .96), function (u, d, t) {
  var sc = OESC.concat(SLV_A, DUOJ.slice(0, 30)), k = at(u, .2, 1.8), pts = part(sc, 0, k), tip = along(sc, k);
  return paper() + sasiCloseup(t, { dim: .25 }) + '<path d="' + pathPts(pts) + '" stroke="' + INK + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="' + pathPts(pts) + '" stroke="#3a3f42" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="' + f(16 + 4 * Math.sin(t * 8)) + '" fill="#fff3c8" opacity=".75"/>' + C(tip[0], tip[1], 7, "#fff3c8", 2) + label(240, 120, 420, 60, "منظار", OLIVE, at(u, .6, .4), 26) + check(470, 560, 1.3, at(u, 2.0, .4), OLIVE);
});
// 17 · in one study: about 73% of the extra weight in a year
shot(17, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + floor(690), k = at(u, .3, 1.8), p = fig({ x: 200, y: 666 - 212, lean: 0, shirt: "#7f97a6", hands: [null, null], bend: [-1, -1] }), bl = p.at(48, 24);
  s += scale(200, 678, "kg") + p.far + '<ellipse cx="' + f(bl[0]) + '" cy="' + f(bl[1]) + '" rx="' + f(46 - 26 * k) + '" ry="' + f(62 - 22 * k) + '" fill="#7f97a6" stroke="' + INK + '" stroke-width="2.2" opacity="' + f(1 - .8 * k) + '"/>' + p.body + p.near;
  return s + bigNum(count(73, k) + "%", "من الوزن الزيادة", 450, 330, at(u, .2, .3), ORANGE, 84) + G("", tag("في سنة", 450, 480, 1, 26, INK), at(u, 1.6, .3));
});
// 18 · more than a sleeve alone
shot(18, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper(), k = at(u, .1, .9), B = 560;
  s += '<path d="M100 ' + B + ' H540" stroke="' + INK + '" stroke-width="2.6"/>';
  s += R(170, B - 300 * .604 * k, 110, 300 * .604 * k, "#c0b49c", 2.2) + R(360, B - 300 * .726 * k, 110, 300 * .726 * k, ORANGE, 2.2);
  s += G("", N("60%", 225, B - 300 * .604 - 20, 30, MUTE) + N("73%", 415, B - 300 * .726 - 20, 34, ORANGE), at(u, .7, .3)) + T("تكميم", 225, B + 40, 24, MUTE, 800) + T("ساسي", 415, B + 40, 26, ORANGE, 800);
  return s;
});
// 19 · the price: it is new, and long studies are still few
shot(19, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), X0 = 90, i, k = at(u, .2, 1.2);
  s += '<path d="M' + X0 + ' 520 H560" stroke="' + INK + '" stroke-width="2.6"/>' + T("سنين المتابعة", 325, 600, 24, INK, 800);
  for (i = 0; i < 10; i++) { var x = X0 + 25 + i * 46, h = i < 3 ? (120 - i * 30) * k : 0; s += '<path d="M' + x + ' 520 v10" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x, 556, 15, INK); if (h > 0) s += R(x - 14, 520 - h, 28, h, OLIVE, 2); }
  s += G("translate(" + f(400 + 6 * Math.sin(t * 3)) + " 420)", T("؟", 0, 0, 120, ORANGE, 800), at(u, cf(19, 1) + .3, .3)) + G("", tag("جديدة", 200, 240, 1, 32, ORANGE), at(u, .1, .3));
  return s;
});
// 20 · protein and vitamin shortage can happen: follow-up and supplements
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + G("", pills(200, 400, 1.4, t), at(u, .4, .3) * (.35 + .65 * at(u, cf(20, 1), .3))) + G("translate(470 " + f(300 + 8 * Math.sin(t * 3)) + ") rotate(" + f(6 * Math.sin(t * 2)) + ")", egg(1.5), at(u, .1, .3)) + G("", T("بروتين", 470, 400, 28, ORANGE, 800), at(u, .3, .3)) +
    G("", T("فيتامينات", 470, 470, 28, ORANGE, 800), at(u, .7, .3)) + G("", tag("متابعة", 470, 600, 1, 30, OLIVE), at(u, cf(20, 1) + .4, .3));
});
// 21 · reflux can happen, as with any operation that includes a sleeve
shot(21, push(300, 240, 1.15, 1.05), function (u, d, t) {
  var k = at(u, .5, .6), up = rev(OESC.concat(SLV_A.slice(0, 20)));
  return paper() + sasiCloseup(t, { dim: .3 }) + G("", '<path d="' + pathPts(up) + '" stroke="' + ORANGE + '" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="4 18" stroke-dashoffset="' + f(t * 50) + '"/>', k) + label(232, 100, 420, 40, "ارتجاع", ORANGE, at(u, .9, .4), 26);
});
// 22 · the myth: newer means better. No.
shot(22, push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + G("", tag("الأجدد = الأحسن؟", 320, 300, 1, 34, INK), at(u, .2, .3)) + G("translate(0 " + f(4 * Math.sin(t * 3)) + ")", G("translate(236 398) scale(.25)", sasiCloseup(t, {})), at(u, .3, .3)) +
    cross(320, 300, 2.6, at(u, 1.9, .5)) + G("", T("لأ", 320, 720, 70, ORANGE, 800), at(u, 2.2, .3));
});
// 23 · the doctor chooses: your weight, your sugar, your case
shot(23, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var doc = fig({ x: 150, y: 690 - 212, lean: 0, shirt: "#f2f0ea", hands: [rel(110, 34), null], bend: [-1, -1] }), s = paper() + floor(690) + whole(doc);
  [["وزنك", 220], ["سكرك", 360], ["حالتك", 500]].forEach(function (q, i) { s += G("", tag(q[0], 440, q[1], 1, 30, i === 1 ? BLUE : INK) + check(560, q[1] - 10, .8, at(u, 1.0 + i * .5, .4), OLIVE), at(u, .4 + i * .4, .3)); });
  return s + G("", T("دكتور", 150, 740, 24, INK, 800), at(u, .1, .3));
});
// 24 · from the end: a sleeve, one join, food on two roads
shot(24, push(340, 500, .64, .67), function (u, d, t) {
  var c = [cf(24, 1), cf(24, 2), cf(24, 3)];
  return paper() + sasiCloseup(t, { hlSleeve: at(u, c[0], .3), hlAn: u > c[1] ? 1 : 0, dim: .3 }) + G("translate(330 640) scale(" + f(1 + .05 * Math.sin(t * 4)) + ") translate(-330 -640)", tag("من الآخر", 330, 640, at(u, .05, .3), 70, ORANGE), 1 - at(u, c[0] - .1, .3)) +
    G("", tag("تكميم", 560, 220, 1, 40, OLIVE), at(u, c[0], .3)) + G("", tag("توصيلة واحدة", 470, 640, 1, 40, ORANGE), at(u, c[1], .3)) + flowA(t, at(u, c[2], 1.0)) + flowB(t, at(u, c[2], 1.0)) + G("", tag("طريقين", 340, 990, 1, 44, ORANGE), at(u, c[2] + .3, .3));
});
// 25 · the odd fact: published by Dr Tarek Mahdy in 2016, now done in many countries
shot(25, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c2 = cf(25, 2) || 2.8, s = paper(), lon = 31 - 10 * at(u, c2, 2.5) + 4 * Math.sin(t * .6);
  s += G("", egyptFlag(140, 170, 1.3) + T("جراح مصري", 150, 270, 26, INK, 800), at(u, .2, .3)) + G("", numBox("2016", 450, 180, 1, 44, true), at(u, cf(25, 1), .3));
  s += G("", globe(320, 520, 170, lon, 22, { dot: [31.4, 31] }), at(u, .6, .4));
  var pl = [[31.4, 31], [46.7, 24.7], [55.3, 25.3], [35.9, 31.9], [10.2, 36.8], [-7.6, 33.6], [44.4, 33.3], [29, 41], [12.5, 41.9]];
  pl.forEach(function (q, i) { var g = GEO.globe(320, 520, 170, lon, 22), p = g.project(q); if (p && GEO_visible(q, lon, 22)) s += G("", C(p[0], p[1], 7 + 2 * Math.sin(t * 4 + i), ORANGE, 1.6), at(u, c2 + i * .25, .3)); });
  return s + G("", tag("بلاد كتير", 470, 760, 1, 30, ORANGE), at(u, c2 + 1.2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = "", TR = "translate(132 54) scale(.52)", u = t - LN[li].start;
  if (li === 0) s += G(TR, sasiCloseup(t, { dim: .25 }) + flowA(t, ease(u / 1.4)) + flowB(t, ease((u - 1.4) / 1.2)));
  if (li === 1) s += G(TR, sasiCloseup(t, { dim: .35 }) + flowA(t, 1) + flowB(t, 1)) + G("", tag("عادي", 90, 420, 1, 34, OLIVE), ease(u / .3)) + G("", tag("مختصر", 520, 160, 1, 34, ORANGE), ease((u - 1.2) / .3));
  if (li >= 2) s += G(TR, dim(.6, sasiCloseup(t, {}))) + G("", egyptFlag(300, 300, 2.4), ease(u / .3)) + G("", tag("جراح مصري", 300, 470, 1, 40, ORANGE), ease((u - .3) / .3));
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(48 16) scale(.15)", sasiCloseup(t, {}) + flowA(t, 1, 10) + flowB(t, 1, 5)); };
SCENE.outro = function (svg, u, t) {
  return G("translate(176 18) scale(.23)", sasiCloseup(t, {}) + flowA(t, 1, 12) + flowB(t, 1, 6)) +
    callout("1", 222, 64, ease(u / .3)) + callout("2", 200, 112, ease(u / .3 - .5)) + callout("3", 236, 150, ease(u / .3 - 1)) + callout("4", 196, 210, ease(u / .3 - 1.5));
};
function banana() { return '<path d="M-44 -18 C-30 30 30 36 48 -8 C36 4 0 14 -32 -22 Z" fill="#e8c95a" stroke="' + INK + '" stroke-width="2"/><path d="M-44 -18 l-6 -8" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M-30 -6 C-10 14 20 16 40 -2" stroke="#b99a35" stroke-width="1.6" fill="none"/>'; }
