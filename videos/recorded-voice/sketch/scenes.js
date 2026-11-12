window.CHUNKS = [[0.0, 0.6327], [0.0, 0.6667], [0.0, 0.4571], [0.0, 0.4194], [0.0, 0.24, 0.56], [0.0, 0.5584], [0.0, 0.4889], [0.0, 0.4255, 0.766], [0.0, 0.2], [0.0, 0.4583, 0.75], [0.0, 0.6429], [0.0, 0.3288], [0.0, 0.4314], [0.0, 0.169, 0.5915], [0.0, 0.5484, 0.8226], [0.0, 0.3676, 0.7059], [0.0, 0.2456, 0.7193], [0.0, 0.25, 0.7763], [0.0, 0.5283], [0.0], [0.0, 0.2989, 0.5172, 0.8276], [0.0, 0.2466, 0.6301], [0.0, 0.1648, 0.5385, 0.8462], [0.0, 0.3241, 0.7222], [0.0], [0.0]];
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

// ── pictures: the «اسكتش» illustrations (ink-and-wash technical cutaways made in Google AI Studio from the series prompts,
// keyed to alpha by img_prep.py → <episode>/sketch/img/NN.webp). pics({n: [w, h]}) registers them once in the page's
// <defs>; the panel, rebuilt every frame, only points at them with <use>, so they never reload or flicker.
var SZ = {};
function pics(sizes) {
  Object.keys(sizes).forEach(function (n) { SZ[n] = sizes[n]; });
  var defs = document.querySelector("svg defs"), NS = "http://www.w3.org/2000/svg";
  Object.keys(SZ).forEach(function (n) {
    var id = "pic" + n; if (document.getElementById(id)) return;
    var im = document.createElementNS(NS, "image"); im.setAttribute("id", id); im.setAttribute("href", "img/" + (n < 10 ? "0" : "") + n + ".webp");
    im.setAttribute("width", SZ[n][0]); im.setAttribute("height", SZ[n][1]); defs.appendChild(im);
  });
}
function PL(n, cx, cy, w) { var k = w / SZ[n][0], h = SZ[n][1] * k, x = cx - w / 2, y = cy - h / 2; return { n: n, x: x, y: y, w: w, h: h, k: k, p: function (px, py) { return [x + px * k, y + py * k]; } }; }
function pic(L, op) { return '<use href="#pic' + L.n + '" transform="translate(' + f(L.x) + ' ' + f(L.y) + ') scale(' + L.k.toFixed(4) + ')"' + (op != null && op < 1 ? ' opacity="' + f(op) + '"' : "") + '/>'; }
// a boxed callout with a curved arrow to the part, like the reference's engine labels. (px,py) the part, (bx,by) the box centre
function box(pt, bx, by, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 24; var w = text.length * sz * .56 + 28, h = sz * 1.7, px = pt[0], py = pt[1];
  var ex = bx + (px > bx ? w / 2 : px < bx - w / 2 ? -w / 2 : 0), ey = by + (Math.abs(px - bx) < w / 2 ? (py > by ? h / 2 : -h / 2) : 0);
  var mx = (ex + px) / 2 + (py - ey) * .25, my = (ey + py) / 2 - (px - ex) * .25, d = "M" + f(ex) + " " + f(ey) + " Q" + f(mx) + " " + f(my) + " " + f(px) + " " + f(py);
  var a = Math.atan2(py - my, px - mx), hs = 11, s = draw(d, clamp(k * 1.7 - .2), INK, 2);
  if (k > .6) s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(px - Math.cos(a - .45) * hs) + ' ' + f(py - Math.sin(a - .45) * hs) + ' L' + f(px - Math.cos(a + .45) * hs) + ' ' + f(py - Math.sin(a + .45) * hs) + ' Z" fill="' + INK + '"/>';
  return G("", '<rect x="' + f(bx - w / 2) + '" y="' + f(by - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="6" fill="#f6efdf" stroke="' + INK + '" stroke-width="2"/>' + T(text, bx, by + sz * .36, sz, col || INK, 800), Math.min(1, k * 2.5)) + s;
}
// dots running along a polyline of world points (blood or gas moving)
function runDots(pts, t, col, r, n, speed) {
  var L = [0], i, s = ""; for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  var tot = L[L.length - 1]; n = n || 8;
  for (var j = 0; j < n; j++) { var d = ((j / n) * tot + t * (speed || 60)) % tot, q = 1; while (q < L.length - 1 && L[q] < d) q++; var u = (d - L[q - 1]) / Math.max(1e-6, L[q] - L[q - 1]), x = lerp(pts[q - 1][0], pts[q][0], u), y = lerp(pts[q - 1][1], pts[q][1], u);
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (r || 6) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  return s;
}
function mapPts(L, a) { return a.map(function (q) { return L.p(q[0], q[1]); }); }

// ── living pictures: parts of an illustration cut out (clip paths in the picture's own pixels) and moved on their own:
// lungs breathe, the heart beats, the baby sways in its fluid, blood runs in the vessels, the nail is pulled, the flag flies.
function ell(cx, cy, rx, ry) { return "M" + (cx - rx) + " " + cy + " a" + rx + " " + ry + " 0 1 0 " + 2 * rx + " 0 a" + rx + " " + ry + " 0 1 0 " + -2 * rx + " 0 Z"; }
function poly(a) { return "M" + a.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + " Z"; }
function about(L, px, py, sc, rot, dx, dy) { var c = L.p(px, py); return "translate(" + f(c[0] + (dx || 0)) + " " + f(c[1] + (dy || 0)) + ") rotate(" + f(rot || 0) + ") scale(" + (sc || 1).toFixed(4) + ") translate(" + f(-c[0]) + " " + f(-c[1]) + ")"; }
function clipOf(L, d, inv) { var id = "pt" + (++CLIPN); return { id: id, def: '<clipPath id="' + id + '"><path ' + (inv ? 'clip-rule="evenodd" ' : "") + 'd="' + (inv ? "M-4000 -4000 H6000 V6000 H-4000 Z " : "") + d + '" transform="translate(' + f(L.x) + ' ' + f(L.y) + ') scale(' + L.k.toFixed(4) + ')"/></clipPath>' }; }
// part: the region d of picture L, moved by transform tr. fixed = the cut stays put and only the content inside moves
function part(L, d, tr, fixed) { var c = clipOf(L, d); return fixed ? c.def + '<g clip-path="url(#' + c.id + ')"><g transform="' + tr + '">' + pic(L) + '</g></g>' : '<g transform="' + tr + '">' + c.def + '<g clip-path="url(#' + c.id + ')">' + pic(L) + '</g></g>'; }
// partSoft: the region inside ellipse (cx, cy, rx, ry) of picture L moved by tr, its edge fading into the still picture
// (a soft mask), so a bigger movement shows no seam
function partSoft(L, cx, cy, rx, ry, tr) {
  var id = "ps" + (++CLIPN), c = L.p(cx, cy);
  return '<radialGradient id="' + id + 'g"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(rx * L.k) + '" ry="' + f(ry * L.k) + '" fill="url(#' + id + 'g)"/></mask>' +
    '<g mask="url(#' + id + ')"><g transform="' + tr + '">' + pic(L) + '</g></g>';
}
function picBut(L, d) { var c = clipOf(L, d, true); return c.def + '<g clip-path="url(#' + c.id + ')">' + pic(L) + '</g>'; }   // the picture without region d
function ip(L, a) { return L.p(a[0], a[1]); }
function breath(t) { return .5 + .5 * Math.sin(t * 1.7); }
function beat(t) { return Math.pow(Math.max(0, Math.sin(t * 7.2)), 3); }
function cellSprite(x, y, r, col, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", '<ellipse rx="' + f(r) + '" ry="' + f(r * .78) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.1"/><ellipse rx="' + f(r * .5) + '" ry="' + f(r * .36) + '" fill="#000" opacity=".16"/>'); }

// ── «ليه صوتك غريب لما تسمعه متسجّل؟» — shots over the channel's ink-and-wash cutaways (img/NN.webp, refs/SOURCES.md).
// Colours: slate blue = sound through the air, orange = sound through bone (the inside path).
pics({ 1: [728, 1008], 2: [531, 962], 3: [696, 668], 4: [768, 783], 5: [687, 882], 6: [721, 755], 7: [757, 1033], 8: [728, 939], 9: [722, 812], 10: [730, 908] });
var AIR = BLUE, BONE = ORANGE;

// sound as rings opening from (x, y) toward angle ang (deg), moving with t
function rings(x, y, ang, t, col, n, spread, sz) {
  var s = "", i; n = n || 5; sz = sz || 120;
  for (i = 0; i < n; i++) { var ph = (t * .9 + i / n) % 1, r = 12 + ph * sz; s += '<path d="M' + f(x + r * Math.cos((ang - (spread || 35)) * Math.PI / 180)) + ' ' + f(y + r * Math.sin((ang - (spread || 35)) * Math.PI / 180)) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * Math.cos((ang + (spread || 35)) * Math.PI / 180)) + ' ' + f(y + r * Math.sin((ang + (spread || 35)) * Math.PI / 180)) + '" fill="none" stroke="' + (col || AIR) + '" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - ph) + '"/>'; }
  return s;
}
// a framed strip with the two parts of a voice: a thick low wave and a thin high one (k* = how much of each is heard)
function waveBox(x, y, w, t, kThick, kThin, title) {
  var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="150" rx="6" fill="#f6efdf" stroke="' + INK + '" stroke-width="2"/>';
  s += G("", wave(x + 20, y + 52, x + w - 90, y + 52, t * .5, BONE, 18, 90, 1, 6) + T("تخين", x + w - 46, y + 60, 20, BONE, 800), clamp(kThick));
  s += G("", wave(x + 20, y + 112, x + w - 90, y + 112, t * 1.4, AIR, 7, 22, 1, 2.4) + T("رفيع", x + w - 46, y + 120, 20, AIR, 800), clamp(kThin));
  return s + (title ? T(title, x + w / 2, y - 12, 22, INK, 800) : "");
}
var MOUTH1 = [470, 560], COCH1 = [292, 262], EAR1 = [190, 330], LARYNX1 = [292, 720];
var AIRPATH1 = [[470, 560], [640, 520], [740, 330], [650, 60], [380, -40], [120, 40], [60, 220], [150, 320], [240, 300], [292, 262]];
var BONEPATH1 = [[292, 720], [300, 600], [330, 470], [300, 360], [292, 262]];

// the pictures, alive
function live(L, t, o) {
  o = o || {}; var n = L.n, s = "", i, k = L.k;
  if (n === 1) {   // the head: the throat buzzes while he talks, the cochlea answers
    s = G(about(L, 360, 1000, 1, .8 * Math.sin(t * .7)), pic(L) + part(L, ell(292, 720, 60, 90), about(L, 292, 720, 1 + .02 * Math.abs(Math.sin(t * 24)))) + part(L, ell(292, 262, 34, 30), about(L, 292, 262, 1 + .05 * Math.abs(Math.sin(t * 9)))));
    return s;
  }
  if (n === 2) {   // the vocal folds vibrate, air rising between them
    s = pic(L);
    s += part(L, poly([[175, 380], [258, 380], [258, 690], [175, 690]]), "translate(" + f(3 * Math.sin(t * 30) * k) + " 0)");
    s += part(L, poly([[262, 380], [345, 380], [345, 690], [262, 690]]), "translate(" + f(-3 * Math.sin(t * 30) * k) + " 0)");
    s += runDots(mapPts(L, [[262, 900], [262, 700], [262, 560], [262, 300], [262, 120]]), t, "#dfe9ef", 4, 10, 120);
    return s;
  }
  if (n === 3) {   // the ear: the eardrum trembles; the stapedius pulls when o.muscle
    s = pic(L) + part(L, ell(360, 330, 30, 50), about(L, 360, 330, 1 + .04 * Math.abs(Math.sin(t * 14))));
    if (o.muscle) s += part(L, ell(600, 320, 50, 22), about(L, 560, 330, 1 - .0 + .1 * (.5 + .5 * Math.sin(t * 3)), 4 * Math.sin(t * 3)));
    s += part(L, ell(555, 375, 75, 75), about(L, 555, 375, 1 + .025 * Math.abs(Math.sin(t * 9))));
    return s;
  }
  if (n === 4) return pic(L) + part(L, poly([[0, 0], [215, 0], [215, 520], [0, 520]]), about(L, 120, 520, 1, 1.4 * Math.sin(t * 1.3), 0, 2 * Math.sin(t * 2.6)));
  if (n === 5) {   // the skull talks: the jaw opens and closes
    var jaw = poly([[100, 640], [330, 560], [470, 470], [520, 560], [430, 880], [100, 882]]);
    return picBut(L, jaw) + part(L, jaw, about(L, 470, 480, 1, 3.5 * (.5 + .5 * Math.sin(t * 5))));
  }
  if (n === 6) return G("translate(0 " + f(4 * Math.sin(t * 1.1)) + ")", pic(L));
  if (n === 7) {   // chewing: the jaw bites, crumbs fly
    var jw = poly([[200, 470], [480, 450], [535, 560], [380, 625], [200, 590]]), b = Math.pow(Math.abs(Math.sin(t * 4)), 2);
    s = picBut(L, jw) + part(L, jw, about(L, 480, 400, 1, 2.5 * b));
    for (i = 0; i < 8; i++) { var ph = (t * .8 + hash(i)) % 1, c = L.p(245, 500); s += '<path d="M' + f(c[0] - ph * 60 * hash(i + 2)) + ' ' + f(c[1] + ph * 40 - 20 + 30 * hash(i + 5) * ph * ph) + ' l4 -3 l3 4 z" fill="#d9b25f" stroke="' + INK + '" stroke-width=".8" opacity="' + f(1 - ph) + '"/>'; }
    return s;
  }
  if (n === 8) return G(about(L, 360, 900, 1, 1 * Math.sin(t * .9)), pic(L));
  if (n === 9) return pic(L) + part(L, poly([[100, 80], [330, 80], [330, 800], [100, 800]]), about(L, 220, 800, 1, .9 * Math.sin(t * .8)));
  if (n === 10) {   // the rod trembles against the piano
    var rod = poly([[160, 180], [310, 220], [310, 250], [160, 215]]);
    return picBut(L, rod) + part(L, rod, "translate(0 " + f(1.6 * Math.sin(t * 40) * k) + ")") + part(L, poly([[200, 380], [320, 380], [320, 460], [200, 460]]), "translate(" + f(2 * Math.sin(t * 6)) + " 0)");
  }
  return pic(L);
}

// layouts (world 640 × 786)
var HEAD = PL(1, 320, 400, 470), LAR = PL(2, 320, 390, 330), EAR = PL(3, 320, 380, 600), DUO = PL(4, 320, 380, 520), SKL = PL(5, 320, 400, 520),
    PHN = PL(6, 320, 330, 560), CHP = PL(7, 300, 400, 500), FNG = PL(8, 320, 400, 560), MIR = PL(9, 320, 390, 600), BTH = PL(10, 320, 400, 560);
var DUO_MOUTH = [190, 390], DUO_EAR = [470, 370], DUO_COCH = [615, 335];

// ════ shots ════
// 4 · sound is a tremble: the vocal cords shake, the air carries it
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), live(LAR, t)) + box(LAR.p(220, 560), 110, 140, "الأحبال الصوتية", OLIVE, at(u, .6, .5), 22) + box(LAR.p(262, 250), 520, 120, "الهوا", AIR, at(u, 2.4, .5), 24);
});
// 5 · in the ear, the snail-shaped cochlea turns the tremble into a signal for the brain
shot(5, push(330, 400, 1.0, 1.1), function (u, d, t) {
  return paper() + live(EAR, t) + runDots(mapPts(EAR, [[60, 330], [200, 330], [360, 330], [430, 330], [520, 360]]), t, AIR, 5, 7, 90) + box(EAR.p(555, 375), 500, 640, "القوقعة", OLIVE, at(u, .5, .5), 26) +
    G("", draw("M" + f(EAR.p(620, 400)[0]) + " " + f(EAR.p(620, 400)[1]) + " q60 -40 120 -120", at(u, 2, .8), ORANGE, 3) + T("للمخ", 600, 160, 24, ORANGE, 800), at(u, 2, .3));
}, { tr: "in" });
// 6–7 · your friend hears you one way only: through the air, mouth to ear
shot(6, push(320, 380, .98, 1.05), function (u, d, t) {
  return paper() + live(DUO, t) + G("", rings(DUO.p(DUO_MOUTH[0], DUO_MOUTH[1])[0], DUO.p(DUO_MOUTH[0], DUO_MOUTH[1])[1], 0, t, AIR, 6, 30, 150), at(u, .3, .4)) + tag("طريق واحد", 320, 100, at(u, 1.6, .3), 26, AIR);
});
shot(7, push(420, 360, 1.3, 1.45), function (u, d, t) {
  var P = mapPts(DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR, [540, 360], DUO_COCH]);
  return paper() + live(DUO, t) + runDots(P, t, AIR, 6, 9, 110) + box(DUO.p(DUO_EAR[0], DUO_EAR[1]), 470, 180, "ودنه", OLIVE, at(u, 1, .5), 22) + box(P[1], 260, 560, "الهوا", AIR, at(u, .4, .5), 22);
});
// 8–9 · you hear yourself two ways at once: from outside like him, and from inside through your skull
shot(8, push(320, 400, .95, 1.0), function (u, d, t) {
  return paper() + live(HEAD, t) + G("", runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120), at(u, .3, .5)) + G("", runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70), at(u, 1.6, .5)) + tag("طريقين", 320, 740, at(u, 1, .3), 30, ORANGE);
}, { tr: "out" });
shot(9, push(330, 410, 1.0, 1.08), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) +
    box(HEAD.p(700, 330), 540, 330, "من بره", AIR, at(u, .3, .5), 24) + box(HEAD.p(320, 470), 520, 640, "من جوه", BONE, at(u, 1.5, .5), 24);
});
// 10 · the tremble runs through the bone straight to the cochlea (the skull talking)
shot(10, push(330, 410, 1.0, 1.1), function (u, d, t) {
  return paper() + live(SKL, t) + runDots(mapPts(SKL, [[200, 690], [330, 610], [420, 500], [470, 400]]), t, BONE, 6, 8, 80) + box(SKL.p(300, 150), 140, 100, "العضم", BONE, at(u, .4, .5), 26) + box(SKL.p(470, 390), 520, 700, "القوقعة", OLIVE, at(u, 1.2, .5), 24);
}, { tr: "in" });
// 11 · why it changes the sound: bone carries the thick (low) part better than the thin (high) part
shot(11, push(320, 380, 1.0, 1.04), function (u, d, t) {
  return paper() + G("translate(0 -60)", live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70)) + waveBox(80, 600, 480, t, at(u, .5, .5), lerp(1, .25, at(u, 2, 1)), "اللي بيعدّي من العضم");
});
// 12 · so from inside your voice reaches you deeper than it is
shot(12, push(310, 380, 1.15, 1.25), function (u, d, t) {
  var c = HEAD.p(COCH1[0], COCH1[1]);
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 7, 9, 80) + '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(40 + 6 * Math.sin(t * 5)) + '" fill="' + ORANGE + '" opacity=".15"/>' + tag("أتقل", c[0] + 150, c[1] - 60, at(u, .6, .3), 30, ORANGE);
}, { tr: "in" });
// 13 · like crisps: the crunch is loud inside your head and your friend barely hears it
shot(13, push(320, 400, 1.02, .96), function (u, d, t) {
  var P = mapPts(CHP, [[330, 470], [430, 470], [480, 400], [515, 320]]), c = CHP.p(515, 320);
  return paper() + live(CHP, t) + runDots(P, t, BONE, 6, 6, 90) + rings(c[0], c[1], 0, t * 1.4, BONE, 4, 180, 60) + box(CHP.p(245, 500), 120, 700, "القرمشة", ORANGE, at(u, .4, .5), 24) +
    iconBox(540, 110, 140, '<circle cx="-10" cy="-20" r="20" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-36 40 Q-10 0 16 40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>' + T("…؟", 34, -12, 26, AIR, 800), at(u, 2.4, .3));
});
// 14 · try it: fingers in your ears and talk — you still hear yourself, deeper
shot(14, push(330, 400, 1.0, 1.08), function (u, d, t) {
  var P = mapPts(FNG, [[600, 560], [560, 470], [560, 380], [555, 330]]), e = FNG.p(240, 430);
  return paper() + live(FNG, t) + cross(e[0] - 60, e[1] - 30, .8, at(u, .5, .5)) + runDots(P, t, BONE, 6, 6, 70) + box(FNG.p(555, 330), 540, 120, "من جوه", BONE, at(u, 1.4, .5), 24) + tag("أتقل", 520, 690, at(u, 2.6, .3), 28, ORANGE);
});
// 15 · a tiny muscle in your ear pulls while you talk so your own voice doesn't startle you
var STAP = [600, 320];
shot(15, push(EAR.p(STAP[0], STAP[1])[0] - 30, EAR.p(STAP[0], STAP[1])[1] + 10, 1.8, 1.95), function (u, d, t) {
  return paper() + live(EAR, t, { muscle: true }) + box(EAR.p(STAP[0], STAP[1]), EAR.p(STAP[0], STAP[1])[0] - 60, EAR.p(STAP[0], STAP[1])[1] - 110, "عضلة", OLIVE, at(u, .5, .5), 18);
}, { tr: "in" });
// 16 · and the phone? its mic hears you through the air only, just like your friend
shot(16, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var m = PHN.p(370, 490), P = mapPts(PHN, [[700, 740], [600, 650], [470, 560], [370, 490]]);
  return paper() + live(PHN, t) + runDots(P, t, AIR, 6, 8, 100) + box(m, 160, 640, "المايك", OLIVE, at(u, .5, .5), 24) + tag("الهوا بس", 470, 700, at(u, 1.6, .3), 26, AIR);
}, { tr: "out" });
// 17 · so the recording loses the thick part you're used to and sounds thinner
shot(17, push(320, 380, 1.0, 1.04), function (u, d, t) {
  return paper() + G("translate(0 -90) scale(.95)", live(PHN, t)) + waveBox(80, 590, 480, t, lerp(1, .12, at(u, .6, 1.4)), 1, "اللي في التسجيل") + tag("أرفع", 520, 520, at(u, 2.2, .3), 28, AIR);
});
// 18 · many think the phone spoils the voice. No.
shot(18, push(330, 380, 1.04, .98), function (u, d, t) {
  return paper() + live(PHN, t) + cross(320, 380, 2, at(u, d - 1.1, .5));
});
// 19 · that's the voice people hear from you every day
shot(19, push(320, 380, .98, 1.04), function (u, d, t) {
  var P = mapPts(DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR]);
  return paper() + live(DUO, t) + runDots(P, t, AIR, 6, 8, 110) + check(520, 160, 1.4, at(u, .6, .5), OLIVE) + tag("ده صوتك", 330, 120, at(u, .9, .3), 28, OLIVE);
});
// 20 · and the brain has been used to the inside version for years, so any other copy sounds strange
shot(20, push(320, 400, 1.02, .96), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) + tag("متعود عليه", 330, 110, at(u, .4, .3), 28, ORANGE);
}, { tr: "out" });
// 21 · like your face in a photo: not the one you see in the mirror
shot(21, push(380, 300, 1.05, 1.15), function (u, d, t) {
  return paper() + live(MIR, t) + box(MIR.p(470, 170), 330, 80, "المراية", OLIVE, at(u, .3, .5), 22) + box(MIR.p(650, 170), 560, 470, "الصورة", OLIVE, at(u, 1, .5), 22);
});
// 22 · in short: you hear yourself through air and bone, people and the recording through air only
shot(22, push(320, 400, .95, 1.02), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) +
    box(HEAD.p(700, 330), 540, 300, "الهوا", AIR, at(u, .3, .5), 22) + box(HEAD.p(320, 470), 530, 620, "العضم", BONE, at(u, 1, .5), 22) +
    iconBox(110, 110, 150, G("translate(-150 -270) scale(.38)", pic(PL(6, 400, 400, 400))) + T("الهوا بس", 0, 62, 16, AIR, 800), at(u, 2.6, .3));
}, { tr: "out" });
// 23 · the odd fact: Beethoven, going deaf, is said to have bitten a rod resting on the piano to hear through his jawbone
shot(23, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var P = mapPts(BTH, [[330, 245], [250, 225], [175, 205], [110, 140]]);
  return paper() + live(BTH, t) + runDots(P, t, BONE, 6, 6, 70) + box(BTH.p(250, 225), 470, 110, "عصاية", ORANGE, at(u, 1.2, .5), 24) + box(BTH.p(100, 130), 120, 640, "عضم راسه", BONE, at(u, 2.6, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
var IN_HEAD = PL(1, 304, 330, 440), IN_PHN = PL(6, 304, 300, 520), IN_DUO = PL(4, 304, 330, 380);
SCENE.intro = function (svg, t, li) {
  var s = "";
  if (li === 0) { var m = IN_HEAD.p(MOUTH1[0], MOUTH1[1]); s += live(IN_HEAD, t) + rings(m[0] + 10, m[1], 0, t, AIR, 5, 35, 120); }
  else if (li === 1) { var l1 = LN[1], c1 = window.CHUNKS[1], tq = l1.start + (l1.end - l1.start) * (c1[c1.length - 1] || .6); s += live(IN_PHN, t) + tag("ده مش أنا!", 304, 600, ease((t - tq) / .3), 34, ORANGE); }
  else { var u2 = t - LN[2].start, P = mapPts(IN_DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR]); s += live(IN_DUO, t) + runDots(P, t, AIR, 5, 8, 100) + check(470, 600, 1.2, ease((u2 - .6) / .4), OLIVE); }
  return s;
};
SCENE.bumper = function (u, t) { return live(PL(1, 90, 100, 120), t); };
var OUT_HEAD = PL(1, 300, 140, 190);
SCENE.outro = function (svg, u, t) {
  return live(OUT_HEAD, t) + runDots(mapPts(OUT_HEAD, AIRPATH1), t, AIR, 3, 12, 50) + runDots(mapPts(OUT_HEAD, BONEPATH1), t, BONE, 3, 6, 30) +
    callout("1", OUT_HEAD.p(LARYNX1[0], LARYNX1[1])[0] - 30, OUT_HEAD.p(LARYNX1[0], LARYNX1[1])[1], ease(u / .3)) + callout("2", OUT_HEAD.p(700, 300)[0], OUT_HEAD.p(700, 300)[1], ease(u / .3 - .5)) +
    callout("3", OUT_HEAD.p(330, 470)[0] + 22, OUT_HEAD.p(330, 470)[1], ease(u / .3 - 1)) + callout("4", OUT_HEAD.p(COCH1[0], COCH1[1])[0] - 24, OUT_HEAD.p(COCH1[0], COCH1[1])[1] - 10, ease(u / .3 - 1.5));
};
