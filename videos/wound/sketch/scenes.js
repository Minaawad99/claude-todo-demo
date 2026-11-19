window.CHUNKS = [[0.0], [0.0, 0.4697], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.1867, 0.5467, 0.7467], [0.0, 0.5], [0.0, 0.3382, 0.7941], [0.0, 0.5, 0.85], [0.0, 0.3214, 0.7262], [0.0, 0.7317], [0.0, 0.463], [0.0], [0.0, 0.2439], [0.0, 0.3735, 0.6867], [0.0, 0.5], [0.0], [0.0, 0.7], [0.0], [0.0, 0.4444, 0.7654], [0.0, 0.5735], [0.0, 0.6327, 0.8367], [0.0, 0.5357], [0.0, 0.5714], [0.0, 0.1875, 0.35, 0.5125, 0.7], [0.0, 0.5059, 0.7647], [0.0, 0.7755], [0.0]];
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

// ── «الجرح بيقفل لوحده إزاي؟» — drawings. Shapes follow the «طب إزاي؟» skin block (reference sheet v20) and the real
// layer anatomy in refs/SOURCES.md: a thin epidermis with a wavy base (dermal papillae), a thick dermis with a superficial
// vessel plexus and capillary loops up into the papillae, a deep artery + vein pair at the fat border, fat lobules under it,
// hair follicles and coiled sweat glands. The cut is a U-shaped wound through the epidermis into the dermis.
// Cells are drawn from their real shapes: red cells as biconcave discs, platelets as small discs that grow spikes when
// they stick, neutrophils with a lobed nucleus, a big macrophage with arms, spindle fibroblasts, rod bacteria.

var EPI_C = "#e2967c", EPI_T = "#cf8068", DER_C = "#f0c4ae", DER_D = "#e9b39c", FAT_C = "#efe0b2", FAT_L = "#f7eed0",
    VES = "#b8432f", VES_L = "#d8735c", VEIN = "#4a6f8a", BLOOD = "#a6382a", RBC = "#c24a36", RBC_L = "#de7a62",
    PLT = "#9c9a52", FIB = "#f2dc9a", SCAB = "#6b3323", GRAN = "#d06e5b", SCAR = "#eccfbf", WBC = "#e3e6e2", NUC = "#5d5d8c",
    MAC = "#e6dbbd", FIBRO = "#e7a088", BACT = "#56612c", TOPF = "#eab49c";
var TOP = 300, EPI = 348, DER = 596, V1 = 432, CX = 320, AY = 505, HW = 58;
function cu(line, c) { var l = LN[line], ch = window.CHUNKS[line]; return (l.end - l.start) * (ch[c] == null ? 1 : ch[c]); }   // seconds from a line's start to its chunk c
function smooth(a, b, x) { return clamp((x - a) / (b - a)); }
function hwAt(y, k) { k = k == null ? 1 : k; var ay = TOP + (AY - TOP) * k; if (y >= ay) return 0; return HW * Math.min(1, k * 1.6) * Math.sqrt((ay - y) / (ay - TOP)); }
function gapPath(k) {
  var L = [], Rr = [], y, ay = TOP + (AY - TOP) * k;
  for (y = TOP; y <= ay; y += 6) { var h = hwAt(y, k), j = 2.2 * Math.sin(y * .31); L.push([CX - h + j, y]); Rr.push([CX + h + j * .7, y]); }
  L.push([CX, ay]); var pts = L.concat(Rr.reverse());
  return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" ") + " Z";
}
function epiBase(x) { return EPI + 9 * Math.sin(x * .068) + 3 * Math.sin(x * .17); }
// a blood vessel as a tube along y = yc from x0 to x1; th(x) gives its half thickness; flow dashes move with t
function tube(x0, x1, yc, th, col, t, flow) {
  var top = "", bot = "", x, n = Math.max(4, Math.round((x1 - x0) / 10));
  for (var i = 0; i <= n; i++) { x = x0 + (x1 - x0) * i / n; top += (i ? " L" : "M") + f(x) + " " + f(yc - th(x)); }
  for (i = n; i >= 0; i--) { x = x0 + (x1 - x0) * i / n; bot += " L" + f(x) + " " + f(yc + th(x)); }
  var s = '<path d="' + top + bot + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  if (flow) s += '<path d="M' + f(x0 + 4) + ' ' + f(yc) + ' L' + f(x1 - 4) + ' ' + f(yc) + '" stroke="' + (col === VEIN ? "#7d9ab0" : VES_L) + '" stroke-width="3" stroke-dasharray="7 9" stroke-dashoffset="' + f(-t * 40 * flow) + '" stroke-linecap="round"/>';
  return s;
}
// the cells
function rbc(x, y, r, a) {   // a red cell: face-on disc with its pale middle, or (a = 1) edge-on like a capsule
  if (a) return '<rect x="' + f(x - r) + '" y="' + f(y - r * .38) + '" width="' + f(2 * r) + '" height="' + f(r * .76) + '" rx="' + f(r * .38) + '" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.3"/><path d="M' + f(x - r * .5) + ' ' + f(y) + ' h' + f(r) + '" stroke="' + RBC_L + '" stroke-width="' + f(r * .22) + '" stroke-linecap="round"/>';
  return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.3"/><circle cx="' + f(x + r * .08) + '" cy="' + f(y + r * .08) + '" r="' + f(r * .45) + '" fill="' + RBC_L + '"/>';
}
function platelet(x, y, r, spk, i) {   // a small disc; when it sticks (spk 0..1) it grows spikes
  var s = "";
  if (spk > 0) for (var k = 0; k < 7; k++) { var a = k / 7 * 6.283 + hash(i + k) * .6, l = r * (1 + .9 * spk * (.6 + .4 * hash(i * 3 + k))); s += '<path d="M' + f(x + Math.cos(a) * r * .6) + ' ' + f(y + Math.sin(a) * r * .6) + ' L' + f(x + Math.cos(a) * l) + ' ' + f(y + Math.sin(a) * l) + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1, r * .28)) + '" stroke-linecap="round"/>'; }
  return s + '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * .78) + '" fill="' + PLT + '" stroke="' + INK + '" stroke-width="' + f(Math.max(.9, r * .2)) + '"/><circle cx="' + f(x - r * .2) + '" cy="' + f(y - r * .1) + '" r="' + f(r * .22) + '" fill="#6e6c34"/>';
}
function neutro(x, y, r, t, i) {   // a white cell: round, wobbling edge, a nucleus in three lobes
  var d = ""; for (var k = 0; k <= 16; k++) { var a = k / 16 * 6.283, rr = r * (1 + .08 * Math.sin(a * 3 + t * 4 + i)); d += (k ? "L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  return '<path d="' + d + 'Z" fill="' + WBC + '" stroke="' + INK + '" stroke-width="1.6"/>' + [[-.32, -.12], [.05, .18], [.34, -.1]].map(function (p) { return '<circle cx="' + f(x + p[0] * r) + '" cy="' + f(y + p[1] * r) + '" r="' + f(r * .24) + '" fill="' + NUC + '"/>'; }).join("") + '<path d="M' + f(x - .3 * r) + ' ' + f(y - .1 * r) + ' Q' + f(x) + ' ' + f(y + .3 * r) + ' ' + f(x + .32 * r) + ' ' + f(y - .1 * r) + '" stroke="' + NUC + '" stroke-width="' + f(r * .1) + '" fill="none"/>';
}
function macro(x, y, r, t, arms) {   // a macrophage: big irregular cell with reaching arms and a kidney nucleus
  var d = "", n = 28; for (var k = 0; k <= n; k++) { var a = k / n * 6.283, rr = r * (1 + .12 * Math.sin(a * 5 + t * 2.4) + (arms || 0) * .55 * Math.pow(Math.max(0, Math.cos(a * 3 - t * .8)), 8)); d += (k ? "L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  return '<path d="' + d + 'Z" fill="' + MAC + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x - r * .35) + ' ' + f(y - r * .2) + ' C' + f(x - r * .4) + ' ' + f(y + r * .4) + ' ' + f(x + r * .35) + ' ' + f(y + r * .4) + ' ' + f(x + r * .35) + ' ' + f(y - r * .1) + ' C' + f(x + r * .2) + ' ' + f(y + r * .1) + ' ' + f(x - r * .15) + ' ' + f(y + r * .05) + ' ' + f(x - r * .35) + ' ' + f(y - r * .2) + ' Z" fill="' + NUC + '"/>' +
    [[-.1, -.45], [.4, -.4], [-.5, .1]].map(function (p) { return '<circle cx="' + f(x + p[0] * r) + '" cy="' + f(y + p[1] * r) + '" r="' + f(r * .1) + '" fill="#b9ad8a" stroke="' + INK + '" stroke-width="1"/>'; }).join("");
}
function fibro(x, y, l, ang, k) {   // a spindle fibroblast with an oval nucleus
  k = k == null ? 1 : k; if (k <= 0) return "";
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + f(k) + ")", '<path d="M' + f(-l) + ' 0 C' + f(-l * .4) + ' ' + f(-l * .32) + ' ' + f(l * .4) + ' ' + f(-l * .32) + ' ' + f(l) + ' 0 C' + f(l * .4) + ' ' + f(l * .3) + ' ' + f(-l * .4) + ' ' + f(l * .3) + ' ' + f(-l) + ' 0 Z" fill="' + FIBRO + '" stroke="' + INK + '" stroke-width="1.5"/><ellipse rx="' + f(l * .3) + '" ry="' + f(l * .13) + '" fill="#9b4e3e"/>');
}
function bact(x, y, s, a) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ")", '<rect x="' + f(-9 * s) + '" y="' + f(-3.6 * s) + '" width="' + f(18 * s) + '" height="' + f(7.2 * s) + '" rx="' + f(3.6 * s) + '" fill="' + BACT + '" stroke="' + INK + '" stroke-width="1.2"/>'); }
var BAC = [[-24, 330, 20], [14, 322, -30], [30, 352, 60], [-8, 366, -10], [-36, 312, 75], [6, 392, 35]];   // where the germs sit in the wound (dx from CX, y, angle)

// ── the skin block, cut from the side. S: the state of the wound, every field 0..1 ──
// cut, blood, plt (plug), fib, scab, bact, eat (germs eaten), neu (white cells in), mac, red (inflamed), gran, epi, off (scab falls), scar, adnexa
function skin(t, S) {
  S = S || {}; var s = "", x, k, cut = S.cut == null ? 1 : S.cut, red = S.red || 0, id = "gp" + (++CLIPN);
  // top face, a band of the surface seen a little from above
  s += '<path d="M-140 ' + TOP + ' L780 ' + TOP + ' L820 ' + (TOP - 44) + ' L-100 ' + (TOP - 44) + ' Z" fill="' + TOPF + '" stroke="' + INK + '" stroke-width="2"/>';
  for (k = 0; k < 9; k++) s += '<path d="M' + (-80 + k * 110) + ' ' + (TOP - 8) + ' l40 -26" stroke="' + EPI_T + '" stroke-width="1.2" opacity=".6"/>';
  // epidermis with its wavy base, stratum corneum on top
  var base = ""; for (x = -140; x <= 780; x += 10) base += " L" + f(x) + " " + f(epiBase(x));
  s += '<path d="M-140 ' + TOP + ' L780 ' + TOP + ' L780 ' + f(epiBase(780)) + base.split(" L").slice(1).reverse().map(function (p) { return " L" + p; }).join("") + ' Z" fill="' + EPI_C + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M-140 ' + (TOP + 5) + ' H780" stroke="' + EPI_T + '" stroke-width="3"/>';
  // dermis: papillary (light) and reticular (a little darker), fat lobules under it
  s += '<path d="M-140 ' + f(epiBase(-140)) + base + ' L780 ' + DER + ' L-140 ' + DER + ' Z" fill="' + DER_C + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M-140 476 Q160 466 320 478 T780 472 L780 ' + DER + ' L-140 ' + DER + ' Z" fill="' + DER_D + '"/><path d="M-140 476 Q160 466 320 478 T780 472" stroke="' + EPI_T + '" stroke-width="1.4" stroke-dasharray="6 6" fill="none"/>';
  s += R(-140, DER, 920, 300, FAT_C, 2);
  for (k = 0; k < 22; k++) { var fx = -120 + (k % 11) * 86 + (Math.floor(k / 11) % 2) * 43, fy = DER + 36 + Math.floor(k / 11) * 62; s += '<ellipse cx="' + fx + '" cy="' + fy + '" rx="38" ry="26" fill="' + FAT_L + '" stroke="#cdb880" stroke-width="1.6"/>'; }
  // hair follicles and coiled sweat glands (in normal skin, on both sides of the wound)
  if (S.adnexa !== 0) [[70, 1], [575, -1]].forEach(function (h) {
    var hx = h[0], dir = h[1];
    s += '<path d="M' + hx + ' ' + TOP + ' Q' + (hx + dir * 18) + ' 430 ' + (hx + dir * 46) + ' 560" stroke="' + INK + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M' + hx + ' ' + TOP + ' Q' + (hx + dir * 18) + ' 430 ' + (hx + dir * 46) + ' 560" stroke="#e8c9a8" stroke-width="11" fill="none" stroke-linecap="round"/>' +
         '<path d="M' + (hx + dir * 46) + ' 560 Q' + (hx + dir * 4) + ' ' + (TOP + 20) + ' ' + (hx - dir * 14) + ' ' + (TOP - 46) + '" stroke="#4a2b1d" stroke-width="4" fill="none" stroke-linecap="round"/>' + C(hx + dir * 46, 562, 9, "#8a5a3c", 1.6);
    var gx = hx + dir * 120, d = "M" + gx + " " + (TOP + 2); for (var q = 0; q <= 20; q++) d += " L" + f(gx + 3 * Math.sin(q * .9)) + " " + f(TOP + 2 + q * 11);
    s += '<path d="' + d + '" stroke="#c9b26a" stroke-width="3" fill="none"/><path d="M' + (gx - 18) + ' 540 c0 -18 36 -18 36 0 c0 18 -30 18 -30 0 c0 -12 24 -12 24 0 c0 10 -18 12 -18 2" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="M' + (gx - 18) + ' 540 c0 -18 36 -18 36 0 c0 18 -30 18 -30 0 c0 -12 24 -12 24 0 c0 10 -18 12 -18 2" stroke="#e3cf86" stroke-width="4" fill="none"/>';
  });
  // vessels: deep artery + vein along the fat border, risers, the superficial vessel, capillary loops into the papillae
  var thick = 1 + .55 * red;
  s += tube(-140, 780, 572, function () { return 8 * thick; }, VES, t, 1) + tube(-140, 780, 590, function () { return 8 * thick; }, VEIN, t, -1);
  [140, 500].forEach(function (rx) { s += '<path d="M' + rx + ' 566 C' + (rx + 10) + ' 520 ' + (rx - 10) + ' 470 ' + rx + ' ' + V1 + '" stroke="' + INK + '" stroke-width="' + f(9 * thick) + '" fill="none"/><path d="M' + rx + ' 566 C' + (rx + 10) + ' 520 ' + (rx - 10) + ' 470 ' + rx + ' ' + V1 + '" stroke="' + VES + '" stroke-width="' + f(5.5 * thick) + '" fill="none"/>'; });
  for (x = -100; x <= 760; x += 67) { var px = x + 8, py = epiBase(px) - 2; if (Math.abs(px - CX) < 80 && cut > 0) continue;
    s += '<path d="M' + f(px - 9) + ' ' + V1 + ' C' + f(px - 9) + ' ' + f(py + 20) + ' ' + f(px - 6) + ' ' + f(py) + ' ' + f(px) + ' ' + f(py) + ' C' + f(px + 6) + ' ' + f(py) + ' ' + f(px + 9) + ' ' + f(py + 20) + ' ' + f(px + 9) + ' ' + V1 + '" stroke="' + VES + '" stroke-width="' + f(2.4 * thick) + '" fill="none"/>'; }
  var hv = hwAt(V1, cut), con = S.con || 0, th = function (side) { return function (x) { var e = side < 0 ? smooth(CX - hv - 80, CX - hv, x) : smooth(CX + hv + 80, CX + hv, x); return 9 * thick * (1 - .55 * con * e); }; };
  s += tube(-140, CX - hv + 1, V1, th(-1), VES, t, 1) + tube(CX + hv - 1, 780, V1, th(1), VES, t, 1);
  // inflammation: a warm flush around the wound
  if (red > 0) s += '<ellipse cx="' + CX + '" cy="' + (TOP + 70) + '" rx="' + f(170 + 8 * Math.sin(t * 3)) + '" ry="120" fill="' + ORANGE + '" opacity="' + f(.2 * red) + '"/>';
  if (cut <= 0) return s;
  // ── the wound itself, clipped to the cut ──
  var inner = '<rect x="' + (CX - 90) + '" y="' + (TOP - 40) + '" width="180" height="260" fill="' + PAPER + '"/>';
  var bl = S.blood || 0, yb = AY + 6 - (AY + 6 - TOP) * bl;
  if (bl > 0) { inner += '<path d="M' + (CX - 90) + ' ' + f(yb) + ' Q' + CX + ' ' + f(yb - 6 * Math.sin(t * 3)) + ' ' + (CX + 90) + ' ' + f(yb) + ' V' + (AY + 20) + ' H' + (CX - 90) + ' Z" fill="' + BLOOD + '"/>';
    for (k = 0; k < 26; k++) { var bx = CX - 60 + hash(k) * 120, by = TOP + 6 + hash(k + 50) * (AY - TOP - 20); if (by > yb + 4) inner += rbc(bx, by, 5.5, hash(k + 9) > .7 ? 1 : 0); } }
  var fb = S.fib || 0;
  if (fb > 0) for (k = 0; k < 10; k++) { var fy = TOP + 10 + hash(k + 70) * (AY - TOP - 40), fa = (hash(k + 31) - .5) * 1.6;
    inner += draw("M" + f(CX - 70) + " " + f(fy - 40 * fa) + " L" + f(CX + 70) + " " + f(fy + 40 * fa), clamp(fb * 1.8 - k * .05), FIB, 1.1); }
  var pl = S.plt || 0;
  if (pl > 0) [-1, 1].forEach(function (sd) { for (k = 0; k < 7; k++) { var q = clamp(pl * 2 - k * .14); if (q <= 0) continue;
    inner += platelet(CX + sd * (hv - 3 - (k % 3) * 6), V1 - 10 + (k % 4) * 7, 3.6, q, k + sd * 10); } });
  // granulation: new tissue rising from the floor of the wound: collagen, fibroblasts, capillary loops
  var gr = S.gran || 0, sc = S.scar || 0;
  if (gr > 0) { var yg = AY + 8 - (AY + 8 - (TOP + 28)) * gr, gcol = sc > 0 ? lerpCol(GRAN, SCAR, sc) : GRAN;
    inner += '<path d="M' + (CX - 90) + ' ' + f(yg) + ' Q' + CX + ' ' + f(yg - 8) + ' ' + (CX + 90) + ' ' + f(yg) + ' V' + (AY + 20) + ' H' + (CX - 90) + ' Z" fill="' + gcol + '"/>';
    for (k = 0; k < 9; k++) { var cy = AY - 6 - k * 20; if (cy < yg + 4) break; var wv = 5 * (1 - sc);
      inner += '<path d="M' + (CX - 80) + ' ' + cy + ' q20 ' + f(-wv) + ' 40 0 t40 0 t40 0 t40 0" stroke="' + (sc > .5 ? "#d9b2a0" : "#f1d8c4") + '" stroke-width="2.2" fill="none"/>'; }
    if (sc < .8) { for (k = 0; k < 6; k++) { var lx = CX - 40 + k * 16, ly = AY - 30 - hash(k + 3) * 60, top = Math.max(yg + 12, ly - 70 * gr); if (top < ly)
        inner += G("", '<path d="M' + f(lx - 4) + ' ' + f(ly + 40) + ' V' + f(top + 4) + ' a4 4 0 0 1 8 0 V' + f(ly + 40) + '" stroke="' + VES + '" stroke-width="2.4" fill="none"/>', 1 - sc); }
      for (k = 0; k < 7; k++) { var fx2 = CX - 42 + hash(k + 11) * 84, fy2 = AY - 18 - hash(k + 23) * 150; if (fy2 > yg + 10) inner += G("", fibro(fx2, fy2, 13, -14 + hash(k) * 28 + 4 * Math.sin(t * 2 + k)), 1 - sc); } } }
  // new epidermis creeping in from both edges under the scab
  var ep = S.epi || 0;
  if (ep > 0) { var ey0 = TOP + 8 + 8 * (1 - (S.lift || 0)), ey1 = ey0 + 20, ex = CX - HW - 10;
    inner += '<path d="M' + ex + ' ' + ey0 + ' L' + f(lerp(ex, CX + 1, ep)) + ' ' + f(ey0 + 6) + ' L' + f(lerp(ex, CX + 1, ep) - 6) + ' ' + ey1 + ' L' + ex + ' ' + ey1 + ' Z" fill="' + EPI_C + '" stroke="' + INK + '" stroke-width="1.6"/>' +
             '<path d="M' + (CX + HW + 10) + ' ' + ey0 + ' L' + f(lerp(CX + HW + 10, CX - 1, ep)) + ' ' + f(ey0 + 6) + ' L' + f(lerp(CX + HW + 10, CX - 1, ep) + 6) + ' ' + ey1 + ' L' + (CX + HW + 10) + ' ' + ey1 + ' Z" fill="' + EPI_C + '" stroke="' + INK + '" stroke-width="1.6"/>';
    if (ep >= 1) inner += R(CX - HW - 10, ey0 + 1, 2 * HW + 20, 19, EPI_C, 0); }
  s += '<clipPath id="' + id + '"><path d="' + gapPath(cut) + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>';
  if ((S.scab || 0) < 1 || (S.off || 0) > 0) s += '<path d="' + gapPath(cut) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  // the cut seen on the top face, running back into the skin
  var hw0 = hwAt(TOP, cut), slit = (S.scar || 0) > 0 ? lerpCol("#e7a28c", TOPF, S.scar) : (S.off || 0) > .5 ? "#e7a28c" : (S.scab || 0) > .5 ? SCAB : bl > 0 ? BLOOD : "#9c5a48";
  s += '<path d="M' + f(CX - hw0) + ' ' + TOP + ' L' + f(CX + hw0) + ' ' + TOP + ' L' + f(CX + hw0 * .3 + 34) + ' ' + (TOP - 44) + ' L' + f(CX - hw0 * .3 + 34) + ' ' + (TOP - 44) + ' Z" fill="' + slit + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // blood spilling over the top before the plug holds
  if (bl > 1) s += '<path d="M' + f(CX - HW - 6) + ' ' + TOP + ' Q' + CX + ' ' + f(TOP - 26 * (bl - 1) * 4 - 3 * Math.sin(t * 4)) + ' ' + f(CX + HW + 6) + ' ' + TOP + ' Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // germs that came in with the knife; white cells and a macrophage after them
  var ba = S.bact || 0, eat = S.eat || 0;
  if (ba > 0) BAC.forEach(function (b, i) { var gone = clamp(eat * 1.6 - i * .12); if (gone < 1) s += G("", bact(CX + b[0] + 2 * Math.sin(t * 3 + i), b[1], 1.1, b[2]), ba * (1 - gone)); });
  var ne = S.neu || 0;
  if (ne > 0) BAC.forEach(function (b, i) { var q = clamp(ne * 1.5 - i * .1), sx = i % 2 ? CX + hv + 60 : CX - hv - 60, x = lerp(sx, CX + b[0] + 10, ease(q)), y = lerp(V1 + 8, b[1] + 6, ease(q)); if (q > 0) s += neutro(x, y, 11, t, i); });
  var mc = S.mac || 0;
  if (mc > 0) { for (k = 0; k < 6; k++) { var gq = clamp(mc * 1.4 - .3 - k * .1); if (gq < 1) s += G("", '<path d="M' + f(CX - 30 + k * 12) + ' ' + f(TOP + 40 + hash(k) * 70) + ' l6 -4 l4 6 l-7 3 Z" fill="' + MUTE + '" stroke="' + INK + '" stroke-width="1"/>', 1 - gq); }
    var mx = lerp(CX + 150, CX + 4, ease(mc * 1.4)), my = lerp(V1 + 10, TOP + 80, ease(mc * 1.4)) + 4 * Math.sin(t * 2); s += macro(mx, my, 26, t, .6); }
  // the scab: the top of the clot dries dark brown; later it lifts off and falls
  var sb = S.scab || 0, off = S.off || 0;
  if (sb > 0 && off < 1) {
    var crust = '<path d="M' + f(CX - HW - 8) + ' ' + (TOP + 2) + ' Q' + f(CX - HW) + ' ' + (TOP - 16) + ' ' + CX + ' ' + (TOP - 18) + ' Q' + f(CX + HW) + ' ' + (TOP - 16) + ' ' + f(CX + HW + 8) + ' ' + (TOP + 2) + ' L' + f(CX + HW * .7) + ' ' + (TOP + 14) + ' Q' + CX + ' ' + (TOP + 24) + ' ' + f(CX - HW * .7) + ' ' + (TOP + 14) + ' Z" fill="' + SCAB + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + (CX - 30) + ' ' + (TOP - 10) + ' l10 8 l-4 8 M' + (CX + 12) + ' ' + (TOP - 14) + ' l-6 10 l10 6 M' + (CX + 40) + ' ' + (TOP - 6) + ' l-8 6" stroke="#3e1d14" stroke-width="1.6" fill="none"/>';
    s += G("translate(" + f(90 * off) + " " + f(-160 * off * off) + ") rotate(" + f(28 * off) + " " + CX + " " + TOP + ")", crust, sb * (1 - off));
  }
  // remodelled scar: a flat new epidermis bridge with no papillae, no hair and no gland
  if (sc > 0) s += G("", '<path d="M' + f(CX - HW - 10) + ' ' + TOP + ' H' + f(CX + HW + 10) + ' V' + (TOP + 28) + ' H' + f(CX - HW - 10) + ' Z" fill="' + EPI_C + '" stroke="' + INK + '" stroke-width="1.6"/>', sc);
  return s;
}
function lerpCol(a, b, k) { var p = function (c, i) { return parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); }; return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(lerp(p(a, i), p(b, i), clamp(k))); }).join(",") + ")"; }

// ── the cut vessel, close up (reference: the camera flying into a detail). o: con (narrowing), plt (plug), fib (net), bleed
var VY = 393, VRw = 130, VEND = 380;
function vR(x, con) { return VRw * (1 - .45 * (con || 0) * smooth(120, VEND, x)); }
function vesselClose(t, o) {
  o = o || {}; var s = "", con = o.con || 0, id = "vl" + (++CLIPN), k, x;
  s += '<rect x="-200" y="-200" width="1040" height="1200" fill="' + DER_C + '"/>';
  for (k = 0; k < 14; k++) s += '<path d="M' + (-160 + k * 70) + ' -100 q30 200 -10 420 t20 520" stroke="' + DER_D + '" stroke-width="10" fill="none" opacity=".7"/>';
  // the wound space on the right: open, with blood running out of the vessel into it
  s += '<path d="M' + (VEND + 10) + ' -200 Q' + (VEND - 20) + ' 393 ' + (VEND + 10) + ' 1000 H900 V-200 Z" fill="#e7d6c0" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (VEND + 10) + ' -200 Q' + (VEND - 20) + ' 393 ' + (VEND + 10) + ' 1000 H900 V-200 Z" fill="url(#hatch)" opacity=".5"/>';
  var outflow = clamp(1 - .55 * con - 1.2 * (o.plt || 0)) * (o.bleed == null ? 1 : o.bleed);
  // the vessel wall (outer layer, muscle layer) and the lumen
  var top = "", bot = "", lt = "", lb = "";
  for (x = -200; x <= VEND; x += 10) { var r = vR(x, con); top += (x > -200 ? " L" : "M") + f(x) + " " + f(VY - r); lt += (x > -200 ? " L" : "M") + f(x) + " " + f(VY - r * .74); }
  for (x = VEND; x >= -200; x -= 10) { r = vR(x, con); bot += " L" + f(x) + " " + f(VY + r); lb += " L" + f(x) + " " + f(VY + r * .74); }
  s += '<path d="' + top + bot + ' Z" fill="' + VES + '" stroke="' + INK + '" stroke-width="2.6"/>';
  for (x = -180; x < VEND - 20; x += 26) { r = vR(x, con); s += '<path d="M' + x + ' ' + f(VY - r * .96) + ' l10 ' + f(r * .16) + ' M' + x + ' ' + f(VY + r * .96) + ' l10 ' + f(-r * .16) + '" stroke="#8e2f22" stroke-width="3"/>'; }
  s += '<path d="' + lt + lb + ' Z" fill="#ecc0ab" stroke="' + INK + '" stroke-width="2"/>';
  // cells flowing along the lumen (clipped)
  var cells = "";
  for (k = 0; k < 26; k++) { var sp = 110 * (1 - .4 * con), cx = -220 + ((k * 61 + t * sp) % 620), lr = vR(Math.min(cx, VEND), con) * .7, cy = VY + (hash(k) - .5) * 1.5 * lr;
    cells += hash(k + 7) > .78 ? platelet(cx, cy, 9, 0, k) : rbc(cx, cy, 20, hash(k + 3) > .7 ? 1 : 0); }
  s += '<clipPath id="' + id + '"><path d="' + lt + lb + ' Z"/></clipPath><g clip-path="url(#' + id + ')">' + cells + '</g>';
  // blood leaving through the open end
  if (outflow > 0) for (k = 0; k < 14; k++) { var q = ((k * .37 + t * .55) % 1), ex = VEND + q * 300, ey = VY + (hash(k + 5) - .5) * (vR(VEND, con) * 1.3 + q * 260);
    s += G("", rbc(ex, ey, 20, hash(k + 2) > .6 ? 1 : 0), outflow * (1 - q * .6)); }
  // the platelet plug in the mouth of the vessel: platelets stick to the torn edge, then to each other
  var pl = o.plt || 0, rEnd = vR(VEND, con) * .74;
  if (pl > 0) { var n = 0;
    for (var col = 0; col < 4; col++) for (k = 0; k < 9; k++) { var fill = clamp(pl * 1.25 - (col * 9 + Math.abs(k - 4) * 2) / 50); if (fill <= 0) continue; n++;
      var py = VY + (k - 4) / 4 * rEnd * .95, ppx = VEND - 10 + col * 18 - Math.abs(k - 4) * (3 - col) * 1.5; py += (hash(k + col * 9) - .5) * 8;
      s += G("translate(" + f(ppx) + " " + f(py) + ") scale(" + f(pop(fill)) + ")", platelet(0, 0, 10, clamp(fill * 1.5), k + col * 9)); } }
  // fibrin threads woven over the plug, holding red cells
  var fb = o.fib || 0;
  if (fb > 0) { [[VEND + 30, VY - 70], [VEND + 70, VY + 40], [VEND + 20, VY + 90], [VEND + 90, VY - 20], [VEND + 50, VY - 110], [VEND + 110, VY + 100]].forEach(function (p, i) { s += G("", rbc(p[0], p[1], 19, i % 3 === 1 ? 1 : 0), clamp(fb * 2 - .4 - i * .1)); });
    for (k = 0; k < 34; k++) { var a = hash(k + 40) * Math.PI, cxk = VEND + 30 + (hash(k + 13) - .4) * 170, cyk = VY + (hash(k + 17) - .5) * 300, L2 = 50 + hash(k) * 60, bnd = (hash(k + 5) - .5) * 60,
        dk = "M" + f(cxk - Math.cos(a) * L2) + " " + f(cyk - Math.sin(a) * L2) + " Q" + f(cxk - Math.sin(a) * bnd) + " " + f(cyk + Math.cos(a) * bnd) + " " + f(cxk + Math.cos(a) * L2) + " " + f(cyk + Math.sin(a) * L2), q = clamp(fb * 1.6 - k * .02);
      s += draw(dk, q, "#3a2a18", 3.6) + draw(dk, q, FIB, 2); } }
  return s;
}

// the kitchen and the finger (hook card, 608 × 660): a hand steadying a cucumber on a board, a knife rocking down
function finger(x, y, w, len, cutK, healK, t) {   // a finger seen from the side, nail at the tip on the right
  var s = '<path d="M' + f(x) + ' ' + f(y - w / 2) + ' H' + f(x + len - w / 2) + ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + len - w / 2) + ' ' + f(y + w / 2) + ' H' + f(x) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + f(x + len - w * .9) + ' ' + f(y - w / 2 + 2) + ' q' + f(w * .45) + ' -2 ' + f(w * .62) + ' ' + f(w * .2) + ' l0 ' + f(w * .12) + ' q' + f(-w * .3) + ' -' + f(w * .06) + ' ' + f(-w * .62) + ' -' + f(w * .02) + ' Z" fill="#f0d7c6" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="M' + f(x + len * .42) + ' ' + f(y - w * .48) + ' q-6 ' + f(w * .2) + ' 0 ' + f(w * .36) + ' M' + f(x + len * .16) + ' ' + f(y - w * .48) + ' q-6 ' + f(w * .2) + ' 0 ' + f(w * .34) + '" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>';
  if (cutK > 0) { var cx = x + len * .66, h = clamp(healK || 0);
    s += '<path d="M' + f(cx) + ' ' + f(y - w / 2 - 1) + ' l' + f(-6) + ' ' + f(w * .3) + '" stroke="' + lerpCol(BLOOD, "#e3b9a5", h) + '" stroke-width="' + f(lerp(6, 2, h)) + '" stroke-linecap="round"/>';
    var drop = cutK * (1 - h); if (drop > 0) s += '<path d="M' + f(cx - 3) + ' ' + f(y - w / 2 - 2) + ' q' + f(-14 * drop) + ' ' + f(-20 * drop) + ' 0 ' + f(-34 * drop) + ' q' + f(14 * drop) + ' ' + f(14 * drop) + ' 0 ' + f(34 * drop) + ' Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return s;
}
function kitchen(t, knife, nick) {
  var s = R(20, 470, 570, 36, "#c69a6c", 2.4) + R(20, 506, 570, 10, WOOD_D, 1.6);
  s += '<path d="M120 412 H470 A30 30 0 0 1 470 470 H120 A30 30 0 0 1 120 412 Z" fill="#6f8a4a" stroke="' + INK + '" stroke-width="2.4"/><path d="M130 428 H460" stroke="#93ab6a" stroke-width="5" stroke-linecap="round"/>';
  for (var k = 0; k < 4; k++) s += G("translate(" + (500 + k * 20) + " " + (468 - k * 2) + ") rotate(" + (k * 8) + ")", '<ellipse rx="10" ry="27" fill="#d9e2b4" stroke="' + INK + '" stroke-width="2"/><ellipse rx="5" ry="16" fill="#eef2d4"/>');
  // the hand: forearm, back of the hand, the fingers bent over the cucumber
  s += '<path d="M-60 300 L150 352 L170 400 L-60 380 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  s += '<path d="M140 340 C190 330 250 340 290 362 C300 372 300 392 290 404 L180 410 C160 404 150 380 140 340 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += finger(200, 402, 26, 120, nick, 0, t) + '<path d="M222 390 h70 M218 410 h60" stroke="' + SKIN2 + '" stroke-width="1.6"/>';
  // the knife, rocking down onto the board
  var ky = 250 + 120 * knife;
  s += G("rotate(" + f(-8 + 8 * knife) + " 560 " + f(ky) + ")", '<path d="M330 ' + f(ky + 40) + ' Q320 ' + f(ky + 8) + ' 360 ' + f(ky) + ' H470 V' + f(ky + 40) + ' Z" fill="#c9cfd2" stroke="' + INK + '" stroke-width="2.4"/><path d="M350 ' + f(ky + 14) + ' H462" stroke="#eef2f3" stroke-width="3"/>' + R(470, ky + 4, 110, 26, "#3d2a1c", 2.4, 8) + C(500, ky + 17, 3, "#c9cfd2", 1) + C(545, ky + 17, 3, "#c9cfd2", 1));
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a pinned rule card over a faint block of skin
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(.75, skin(t, { cut: 0 })) + G("", '<rect x="150" y="120" width="340" height="160" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 200)"/>' +
    T("الجلد", 320, 186, 40, ORANGE, 800) + T("طبقتين", 320, 238, 36, INK, 700) + C(320, 128, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · the two layers: epidermis on top with no blood, the dermis full of vessels
shot(5, push(320, 430, 0.92, 1.02), function (u, d, t) {
  var k1 = at(u, cu(5, 1), .5), k2 = at(u, cu(5, 2), .5), k3 = at(u, cu(5, 3), .8);
  return paper() + sweep(-200, 200, 1040, 800, at(u, 0, .9), "d", skin(t, { cut: 0 })) +
    label(560, 322, 520, 190, "البشرة", OLIVE, k1, 26) + G("", tag("مفيهاش دم", 200, 200, k1, 22), clamp(k1 * 2 - 1)) +
    label(400, 520, 470, 700, "الأدمة", ORANGE, k2, 26) + label(250, V1, 160, 690, "أوعية دموية", ORANGE, k3, 24);
});
// 6 · the knife reaches the dermis: the vessels are cut and blood comes out
shot(6, push(320, 400, 1.0, 1.14), function (u, d, t) {
  var c = at(u, .2, 1.2), b = c >= 1 ? lerp(0, 1.15, at(u, 1.5, d - 1.7)) : 0, ky = lerp(-80, 180, c) - (u > 1.6 ? 300 * at(u, 1.6, .8) : 0);
  return paper() + skin(t, { cut: c, blood: b }) + G("translate(" + CX + " " + f(ky) + ")", '<path d="M-8 0 L0 120 L10 0 Z M-8 0 V-260 H24 V0 Z" fill="#c9cfd2" stroke="' + INK + '" stroke-width="2.4"/>' + R(-14, -380, 44, 120, "#3d2a1c", 2.4, 6), clamp(1 - at(u, 1.6, .8))) +
    label(CX + 40, V1, 470, 240, "الوعاء اتقطع", ORANGE, at(u, 1.4, .5), 22);
});
// 7 · first, in seconds, the cut vessel narrows (we fly into its end)
shot(7, push(300, 393, 1.0, 1.06), function (u, d, t) {
  var k = at(u, cu(7, 1) + .2, 1.6);
  return paper() + vesselClose(t, { con: k }) + arrow(150, 140, 150, 220 + 30 * k, INK, 5, at(u, cu(7, 1), .4)) + arrow(150, 646, 150, 566 - 30 * k, INK, 5, at(u, cu(7, 1), .4)) +
    tag("بيضيق", 160, 90, at(u, cu(7, 1) + .3, .3), 30, ORANGE) + numBox("ثواني", 520, 120, at(u, cu(7, 2), .3), 26);
}, { tr: "in" });
// 8 · platelets stick to the torn edge and to each other: a plug
shot(8, push(330, 393, 1.06, 1.14), function (u, d, t) {
  var k = at(u, cu(8, 1), d - cu(8, 1) - .3);
  return paper() + vesselClose(t, { con: 1, plt: k }) + label(VEND + 6, VY - 60, 520, 120, "الصفايح", OLIVE, at(u, cu(8, 0) + .6, .5), 28) +
    G("", tag("سدادة", 500, 690, 1, 30, ORANGE), at(u, cu(8, 2), .3));
});
// 9 · how does the plug hold? fibrin threads weave over it and catch red cells
shot(9, push(380, 393, 1.14, 1.0), function (u, d, t) {
  var k = at(u, cu(9, 1), 2.4);
  return paper() + vesselClose(t, { con: 1, plt: 1, fib: k }) + G("", T("؟", 520, 200, 140, ORANGE, 800), 1 - at(u, cu(9, 1), .4)) +
    label(VEND + 120, VY + 150, 420, 650, "الفيبرين", OLIVE, at(u, cu(9, 1) + .8, .5), 28) + label(VEND + 70, VY + 40, 300, 120, "كرات الدم الحمرا", ORANGE, at(u, cu(9, 2), .5), 22);
});
// 10 · like a fishing net full of fish: that is the clot
shot(10, push(400, 393, 1.0, 1.08), function (u, d, t) {
  var net = '<path d="M-48 -40 L48 40 M-48 -10 L28 50 M-30 -48 L48 10 M48 -40 L-48 40 M48 -10 L-28 50 M30 -48 L-48 10" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var k = 0; k < 5; k++) net += G("translate(" + (-30 + k * 15) + " " + (-10 + (k % 2) * 22) + ") rotate(" + (k * 30) + ")", '<path d="M-12 0 Q0 -8 10 0 Q0 8 -12 0 Z M10 0 l7 -6 v12 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.2"/>');
  return paper() + vesselClose(t, { con: 1, plt: 1, fib: 1 }) + iconBox(190, 170, 170, G('scale(1.4)', net), at(u, .2, .3)) + tag("الجلطة", 470, 690, at(u, cu(10, 1), .3), 36, ORANGE);
});
// 11 · back out: the clot fills the wound and its top dries into the scab
shot(11, push(320, 360, 1.9, 1.6), function (u, d, t) {
  var k = at(u, .4, 1.6);
  return paper() + skin(t, { blood: 1, plt: 1, fib: 1, con: 1, scab: k }) + label(CX + 30, TOP - 12, 400, 200, "القشرة", OLIVE, at(u, cu(11, 1), .5), 26);
}, { tr: "out" });
// 12 · and the germs that came in on the knife?
shot(12, push(320, 360, 1.6, 1.7), function (u, d, t) {
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, bact: at(u, .2, .8) }) + label(CX + 30, 352, 400, 210, "ميكروبات", BACT, at(u, .7, .5), 22) + G("", T("؟", 200, 250, 100, ORANGE, 800), at(u, 1, .3));
});
// 13 · within hours, white cells leave the vessels and eat them
shot(13, push(320, 380, 1.5, 1.65), function (u, d, t) {
  var k = at(u, .2, d - .6);
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, bact: 1, neu: k, eat: at(u, d * .55, d * .45) }) + label(CX - 24, 336, 340, 215, "كرات الدم البيضا", BLUE, at(u, .8, .5), 18) +
    numBox("ساعات", 205, 215, at(u, .1, .3), 22);
});
// 14 · two or three days later, the macrophage cleans up what is left; like the cleaners after a wedding
shot(14, push(330, 370, 1.6, 1.75), function (u, d, t) {
  var k = at(u, .3, d * .8), broom = '<path d="M-30 30 L22 -26" stroke="' + WOOD_D + '" stroke-width="5" stroke-linecap="round"/><path d="M-44 22 L-22 44 L-12 34 L-34 12 Z" fill="#d6b45c" stroke="' + INK + '" stroke-width="1.8"/><path d="M-40 28 l-8 6 M-34 34 l-6 8 M-28 40 l-4 8" stroke="' + INK + '" stroke-width="1.4"/>';
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, mac: k, neu: 1, bact: 0 }) + numBox("2-3 أيام", 215, 215, at(u, .1, .3), 18) +
    label(CX + 4, TOP + 80, 360, 215, "الماكروفاج", BLUE, at(u, 1.2, .5), 18) + iconBox(455, 495, 90, broom, at(u, cu(14, 2), .3));
});
// 15 · that is why it goes red and warm: the vessels widen to let the cells through
shot(15, push(320, 410, 1.08, 0.98), function (u, d, t) {
  var k = at(u, .3, 1.4), heat = "";
  for (var i = 0; i < 3; i++) heat += wave(CX - 40 + i * 40, TOP - 50, CX - 40 + i * 40, TOP - 150, t, ORANGE, 5, 30, k, 3);
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, neu: 1, red: k }) + heat + label(560, V1, 450, 665, "الأوعية بتوسّع", BLUE, at(u, cu(15, 1), .5), 22) +
    iconBox(530, 150, 100, '<rect x="-7" y="-34" width="14" height="52" rx="7" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="-3" y="' + f(10 - 36 * k) + '" width="6" height="' + f(36 * k + 10) + '" fill="' + ORANGE + '"/>' + C(0, 24, 11, ORANGE, 2), at(u, .5, .3));
});
// 16 · and the opening itself, how does it close?
shot(16, push(320, 380, 1.5, 1.6), function (u, d, t) {
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1 }) + measure(CX - 60, TOP + 60, CX + 60, TOP + 60, at(u, .2, .6), "") + G("", T("؟", 440, 240, 100, ORANGE, 800), at(u, .5, .3));
});
// 17 · fibroblasts lay down collagen; small new vessels grow into it
shot(17, push(320, 420, 1.6, 1.75), function (u, d, t) {
  var k = lerp(0, .7, at(u, .2, d - .4));
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, gran: k }) + label(CX - 30, AY - 50, 270, 575, "الفايبروبلاست", OLIVE, at(u, .6, .5), 16) +
    label(CX + 30, AY - 26, 380, 565, "الكولاجين", ORANGE, at(u, 1.8, .5), 18) + label(CX + 8, AY - 90, 390, 250, "أوعية جديدة", ORANGE, at(u, cu(17, 1), .5), 16);
});
// 18 · like scaffolding going up from the bottom
shot(18, push(320, 410, 1.6, 1.5), function (u, d, t) {
  var k = lerp(.7, .9, at(u, 0, d)), sc = '<path d="M-36 40 V-40 M0 40 V-40 M36 40 V-40 M-40 20 H40 M-40 -6 H40 M-40 -32 H40 M-36 40 L0 20 M0 20 L36 -6 M-36 -6 L0 -32" stroke="' + WOOD_D + '" stroke-width="3"/>';
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, gran: k }) + iconBox(200, 230, 110, G("", sc, 1), at(u, .2, .3)) + arrow(CX + 80, AY - 10, CX + 80, AY - 140, ORANGE, 5, at(u, .5, .8));
});
// 19 · skin cells crawl in from both edges under the scab, meet in the middle; the scab falls off
shot(19, push(320, 330, 1.9, 1.75), function (u, d, t) {
  var e = at(u, .2, cu(19, 2) - .2), off = at(u, cu(19, 2), d - cu(19, 2) - .1);
  return paper() + skin(t, { blood: 1, fib: 1, con: 1, scab: 1, gran: 1, epi: e, off: off }) + arrow(CX - 70, TOP + 52, CX - 22, TOP + 52, ORANGE, 4, e) + arrow(CX + 70, TOP + 52, CX + 22, TOP + 52, ORANGE, 4, e) +
    label(CX - 70, TOP + 20, 300, 200, "خلايا الجلد", OLIVE, at(u, .4, .5), 16);
});
// 20 · over months the collagen is laid straight; the red line fades into a scar
shot(20, push(320, 390, 1.25, 1.1), function (u, d, t) {
  var k = at(u, .3, d - .5), cal = '<rect x="-34" y="-30" width="68" height="62" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="-34" y="-30" width="68" height="16" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + T("شهور", 0, 18, 18, INK, 800);
  return paper() + skin(t, { con: 1, gran: 1, epi: 1, off: 1, scar: k, lift: k }) + iconBox(190, 230, 100, cal, at(u, .2, .3)) + label(CX + 20, TOP + 14, 470, 210, "ندبة", OLIVE, at(u, cu(20, 1), .5), 26);
}, { tr: "out" });
// 21 · it heals slower with high sugar, smoking, or dirt
shot(21, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var tiles = [["سكر", '<path d="M0 -26 C14 -6 22 4 22 14 A22 22 0 0 1 -22 14 C-22 4 -14 -6 0 -26 Z" fill="' + RBC + '" stroke="' + INK + '" stroke-width="2"/>' + T("+", 0, 20, 22, "#fff", 800)],
    ["تدخين", '<rect x="-38" y="-6" width="64" height="14" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="26" y="-6" width="14" height="14" fill="#d38a4a" stroke="' + INK + '" stroke-width="2"/>' + wave(40, -12, 40, -50, t, MUTE, 4, 20, 1, 2.4)],
    ["تلوث", bact(-12, -8, 1.2, 20) + bact(12, 8, 1.2, -30) + bact(10, -18, 1, 60)]], s = paper() + dim(.55, skin(t, { con: 1, gran: .4, scab: 1, blood: 1, fib: 1 }));
  tiles.forEach(function (q, i) { var k = at(u, cu(21, i) + .1, .3); s += iconBox(130 + i * 190, 150, 120, G("translate(0 -12)", q[1]), k) + G("", T(q[0], 130 + i * 190, 250, 24, ORANGE, 800), k); });
  return s + tag("بيطوّل", 320, 690, at(u, .3, .3), 30, ORANGE);
});
// 22 · the myth: leave it open so it dries — no
shot(22, push(320, 360, 1.25, 1.12), function (u, d, t) {
  return paper() + skin(t, { con: 1, gran: .5, scab: 1, blood: 1, fib: 1 }) + sun(560, 100, 50, t) + wave(80, 160, 240, 160, t, BLUE, 6, 30, 1, 3) + wave(90, 190, 230, 190, t, BLUE, 6, 30, 1, 3) +
    tag("مكشوف", 150, 250, at(u, .5, .3), 26) + cross(CX, TOP - 40, 1.6, at(u, d - .9, .5));
});
// 23 · a clean, covered wound stays moist and the cells crawl faster
shot(23, push(320, 340, 1.25, 1.35), function (u, d, t) {
  var e = at(u, .5, d - 1), drops = "";
  for (var i = 0; i < 4; i++) drops += '<path d="M' + (CX - 60 + i * 40) + ' ' + f(TOP + 2 - 4 * Math.sin(t * 3 + i)) + ' q-6 8 0 12 q6 -4 0 -12 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1"/>';
  var plaster = R(CX - 150, TOP - 34, 300, 30, "#d9b48c", 2.2, 10) + R(CX - 60, TOP - 32, 120, 26, "#f4efe3", 1.6, 4);
  for (i = 0; i < 12; i++) plaster += C(CX - 140 + i * 24 + (i > 3 && i < 8 ? 300 : 0), TOP - 19, 1.6, "#b08a62", 0);
  return paper() + skin(t, { con: 1, gran: 1, blood: 1, fib: 1, epi: e }) + drops + appear(at(u, .1, .4), plaster) +
    label(CX, TOP + 20, 190, 180, "رطب", BLUE, at(u, cu(23, 0) + .8, .5), 24) + arrow(CX - 90, TOP + 120, CX + 90, TOP + 120, ORANGE, 6, at(u, cu(23, 1), .5)) + check(500, 180, 1.4, at(u, d - 1, .5));
});
// 24 · «يعني من الآخر»: the four steps, one panel each, lit in turn
shot(24, push(320, 393, 0.98, 1.03), function (u, d, t) {
  var cells = [function () { return tube(-120, 30, 0, function (x) { return 34 * (1 - .5 * smooth(-60, 30, x)); }, VES, t, 1) + arrow(0, -70, 0, -34, INK, 4) + arrow(0, 70, 0, 34, INK, 4); },
    function () { var s = ""; for (var k = 0; k < 14; k++) s += platelet(-36 + (k % 4) * 22 + (k % 2) * 5, -48 + Math.floor(k / 4) * 28, 10, 1, k); return s; },
    function () { var s = rbc(-30, -20, 20) + rbc(28, 24, 20, 1) + rbc(20, -40, 18); for (var k = 0; k < 7; k++) { var a = k * .45; s += '<path d="M' + f(-80 * Math.cos(a)) + ' ' + f(-80 * Math.sin(a)) + ' L' + f(80 * Math.cos(a)) + ' ' + f(80 * Math.sin(a)) + '" stroke="#3a2a18" stroke-width="4"/><path d="M' + f(-80 * Math.cos(a)) + ' ' + f(-80 * Math.sin(a)) + ' L' + f(80 * Math.cos(a)) + ' ' + f(80 * Math.sin(a)) + '" stroke="' + FIB + '" stroke-width="2"/>'; } return s; },
    function () { var s = ""; for (var k = 0; k < 5; k++) s += '<path d="M-80 ' + (-50 + k * 25) + ' q20 -6 40 0 t40 0 t40 0 t40 0" stroke="' + GRAN + '" stroke-width="5" fill="none"/>'; return s + fibro(-10, -6, 30, -10 + 6 * Math.sin(t * 2)) + fibro(40, 34, 24, 14); }];
  var names = ["الوعاء يضيق", "الصفايح تسد", "الفيبرين يشبك", "الكولاجين يبني"], s = paper(), on = -1;
  for (var i = 0; i < 4; i++) if (u >= cu(24, i + 1) - .1) on = i;
  for (i = 0; i < 4; i++) { var x = 170 + (i % 2) * 300, y = 220 + Math.floor(i / 2) * 330, id = "rc" + (++CLIPN), lit = on === i, k = at(u, cu(24, i + 1) - .1, .35);
    var tile = '<clipPath id="' + id + '"><rect x="-130" y="-120" width="260" height="240"/></clipPath><rect x="-130" y="-120" width="260" height="240" fill="' + DER_C + '"/><g clip-path="url(#' + id + ')">' + cells[i]() + '</g><rect x="-130" y="-120" width="260" height="240" fill="none" stroke="' + (lit ? ORANGE : INK) + '" stroke-width="' + (lit ? 5 : 2.4) + '"/>';
    s += G("translate(" + x + " " + y + ") scale(" + f(1 + .04 * (lit ? Math.sin(t * 3) * .5 + .5 : 0)) + ")", on >= i ? tile : dim(1, tile)) + callout(String(i + 1), x - 130, y - 120, k, 20) + G("", T(names[i], x, y + 160, 24, lit ? ORANGE : INK, 800), clamp(k + .3)); }
  return s;
});
// 25 · the odd fact: a scar never gets back to the old skin — about 80% of its strength, no hair, no sweat gland
shot(25, push(320, 400, 1.05, 0.96), function (u, d, t) {
  var k = at(u, cu(25, 1), 1.2);
  return paper() + skin(t, { con: 1, gran: 1, epi: 1, off: 1, scar: 1, lift: 1 }) + label(CX, TOP + 14, 400, 160, "الندبة", OLIVE, at(u, .4, .5), 26) +
    G("", N(count(80, k) + "%", 470, 700, 64, ORANGE) + T("من قوة الجلد", 470, 744, 22, INK, 700), clamp(k * 3)) + label(60, TOP - 30, 140, 170, "شعر", INK, at(u, cu(25, 2), .5), 22) +
    label(190, 540, 150, 700, "غدة عرق", INK, at(u, cu(25, 2) + .3, .5), 22) + cross(CX, 440, 1, at(u, cu(25, 2) + .7, .5));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: slicing a cucumber, the knife nicks the finger. line 1: the finger close up, a drop, then a thin line after two weeks. line 2: it fades by itself
  if (li === 0) { var l0 = LN[0], u = t - l0.start, end = l0.end - l0.start, nick = clamp((u - end + .5) / .3), kn = u < end - .5 ? Math.abs(Math.sin(u * 4.2)) : 1;
    return G("translate(0 40)", kitchen(t, kn, nick)) + (nick > 0 ? G("", '<path d="M290 386 l10 -24 M300 392 l22 -12 M276 388 l-4 -24" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>', nick) : ""); }
  var l1 = LN[1], k = clamp((t - l1.start) / Math.max(1, l1.end - l1.start)), heal = li === 1 ? clamp((k - .5) * 2) : 1, s = "";
  s += G("translate(304 330) scale(" + f(1 + .1 * k) + ") translate(-304 -330) translate(0 " + f(9 * Math.sin(t * 2.6)) + ")", finger(-40, 330, 150, 560, li === 1 ? clamp(k * 2.2) : 1, heal * (li === 2 ? 1 : .85), t));
  if (li >= 1) s += iconBox(500, 120, 120, '<rect x="-36" y="-30" width="72" height="64" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="-36" y="-30" width="72" height="16" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + N("14", 0, 26, 30, INK), clamp((k - .5) * 4)) + G("", T("يوم", 500, 210, 22, INK, 800), clamp((k - .55) * 4));
  if (li === 1) { var fade = clamp(k * 4) * (1 - clamp((k - .45) * 6)), ha = t * 4; s += G("", T("دقايق", 120, 150, 26, ORANGE, 800) + C(120, 200, 26, "#f4efe3", 2) + '<path d="M120 200 L' + f(120 + 18 * Math.sin(ha)) + ' ' + f(200 - 18 * Math.cos(ha)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>', fade); }
  if (li >= 2) { var v = t - LN[2].start; s += check(300, 560, 1.6, ease((v - .3) / .5)); }
  return s;
};
SCENE.bumper = function (u, t) {
  // a little block of skin with a closing cut and a drop above it
  var s = '<rect x="0" y="128" width="180" height="20" fill="' + EPI_C + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="0" y="148" width="180" height="60" fill="' + DER_C + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M0 176 H180" stroke="' + VES + '" stroke-width="6"/><path d="M80 128 Q90 168 100 128 Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.6"/>';
  var y = 70 + 18 * Math.sin(t * 2.4);
  return s + '<path d="M90 ' + f(y - 22) + ' C100 ' + f(y - 6) + ' 106 ' + f(y + 2) + ' 106 ' + f(y + 10) + ' A16 16 0 0 1 74 ' + f(y + 10) + ' C74 ' + f(y + 2) + ' 80 ' + f(y - 6) + ' 90 ' + f(y - 22) + ' Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/>';
};
SCENE.outro = function (svg, u, t) {
  return G("translate(-30 -200) scale(1)", skin(t, { con: 1, plt: 1, fib: 1, blood: 1, scab: 1, gran: .55 })) +
    callout("1", 200, V1 - 200 - 30, ease(u / .3)) + callout("2", 270, V1 - 200 + 10, ease(u / .3 - .5)) + callout("3", 330, 150, ease(u / .3 - 1)) + callout("4", 380, 250, ease(u / .3 - 1.5));
};
