window.CHUNKS = [[0.0, 0.6098], [0.0, 0.5349], [0.0, 0.5283], [0.0, 0.4194], [0.0, 0.3488, 0.6744], [0.0, 0.6522], [0.0, 0.4464, 0.7143], [0.0, 0.6829], [0.0], [0.0, 0.2], [0.0, 0.7241], [0.0, 0.6136], [0.0], [0.0, 0.5135], [0.0, 0.4561, 0.7018], [0.0, 0.431, 0.8621], [0.0, 0.6], [0.0, 0.41, 0.73], [0.0, 0.4912], [0.0, 0.5946], [0.0, 0.5833], [0.0, 0.5], [0.0, 0.6216, 0.9054], [0.0, 0.1829, 0.3415, 0.5488, 0.8049], [0.0, 0.3299, 0.567, 0.8144], [0.0], [0.0]];
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

// ── «إزاي الطفل بيتنفس في بطن أمه؟» — drawings. The hand follows the «طب إزاي؟» reference (sheet v17: the fetus in a
// thick red uterus ring, pale amniotic fluid, a twisted cord); the shapes follow real references (refs/SOURCES.md):
// the uterus in section with the placenta on its upper wall (Wikimedia «Placenta.svg»), and the placenta in section
// with villous trees hanging from the chorionic plate into the intervillous lakes fed by spiral arteries (Gray's fig. 39).
// Colour rule for blood: orange = rich in oxygen, slate blue = poor in oxygen / carrying CO2.

var FLUID = "#c9d6d4", FLUID2 = "#b6c7c6", WALL = "#c8664a", WALL2 = "#a9503a", PLAC = "#8e4636", PLAC2 = "#743426",
    MBLOOD = "#c0604a", VILLUS = "#e4c2ad", JELLY = "#efe6d2", LUNG = "#e2b3a3", OXY = ORANGE, POOR = BLUE;

// a limb or any thick outlined stroke (ink outline + fill colour), like the reference's soft capsules
function limb(d, w, col) { return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + (col || SKIN) + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }

// ── the fetus, curled, head down, facing left. Local box about 260 × 330 around (0, 0). breath = 0..1 chest swell
function fetus(x, y, s, t, opt) {
  opt = opt || {}; var b = opt.breath || 0, beat = 1 + 0.012 * Math.sin(t * 7), q = "";
  // far arm and leg (darker), trunk, head, near limbs
  q += limb("M40 -40 Q-10 -70 -55 -40 Q-70 -20 -50 0", 26, SKIN2);
  q += '<g transform="translate(15 -45) scale(' + f(1 + .05 * b) + ' ' + f(1 + .03 * b) + ') translate(-15 45)"><path d="M70 -130 C110 -60 105 30 60 75 C25 108 -35 95 -55 50 C-75 0 -60 -100 -20 -140 C5 -165 50 -160 70 -130 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M64 -110 C92 -50 88 20 56 60" fill="none" stroke="' + SKIN2 + '" stroke-width="2" opacity=".7"/></g>';
  q += '<path d="M-50 -10 C-75 -20 -100 -8 -105 10" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5"/>';
  // head (down), ear, closed eye, nose and mouth on the left
  q += '<path d="M-5 70 C55 70 80 120 70 165 C60 210 15 235 -30 228 C-80 220 -108 180 -102 135 C-96 92 -55 70 -5 70 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
  q += '<path d="M10 140 C22 128 36 138 30 152 C26 162 14 162 12 154" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  q += '<path d="M-62 150 q10 6 20 0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M-98 168 q-10 8 -2 16" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
       '<path d="M-90 198 q8 4 14 -2" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
  // near leg folded up the front, near arm to the face
  q += limb("M45 -95 Q-10 -130 -60 -95 Q-85 -70 -60 -40", 34, SKIN) + '<ellipse cx="-58" cy="-30" rx="18" ry="11" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2" transform="rotate(70 -58 -30)"/>';
  q += limb("M15 40 Q-40 30 -62 70 Q-72 92 -66 110", 22, SKIN) + C(-66, 116, 11, SKIN, 2);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * beat) + ")", q);
}
var NAVEL = [-58, 0];   // where the cord meets the belly, fetus-local

// ── a twisted cord along a quadratic curve (x1,y1)→(x2,y2) via (qx,qy): pale jelly, the vein (orange) and two arteries (blue) winding round
function qpt(x1, y1, qx, qy, x2, y2, u) { var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; return [a * x1 + b * qx + c * x2, a * y1 + b * qy + c * y2]; }
function cord(x1, y1, qx, qy, x2, y2, w, t, k) {
  k = k == null ? 1 : clamp(k); if (k <= 0) return ""; var tw = Math.max(10, Math.hypot(x2 - x1, y2 - y1) / (w * 1.6)), n = 90, d = "", dv = "", da = "", db = "", i, ph = t * 3;
  for (i = 0; i <= n * k; i++) {
    var u = i / n, p = qpt(x1, y1, qx, qy, x2, y2, u), p2 = qpt(x1, y1, qx, qy, x2, y2, Math.min(1, u + .01)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]), nx = -Math.sin(a), ny = Math.cos(a);
    d += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]);
    var o1 = Math.sin(u * tw + ph) * w * .28, o2 = Math.sin(u * tw + ph + 2.1) * w * .28, o3 = Math.sin(u * tw + ph + 4.2) * w * .28;
    dv += (i ? " L" : "M") + f(p[0] + nx * o1) + " " + f(p[1] + ny * o1); da += (i ? " L" : "M") + f(p[0] + nx * o2) + " " + f(p[1] + ny * o2); db += (i ? " L" : "M") + f(p[0] + nx * o3) + " " + f(p[1] + ny * o3);
  }
  return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + JELLY + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
    '<path d="' + da + '" fill="none" stroke="' + POOR + '" stroke-width="' + f(w * .2) + '" stroke-linecap="round"/><path d="' + db + '" fill="none" stroke="' + POOR + '" stroke-width="' + f(w * .2) + '" stroke-linecap="round"/>' +
    '<path d="' + dv + '" fill="none" stroke="' + OXY + '" stroke-width="' + f(w * .3) + '" stroke-linecap="round"/>';
}

// ── the uterus in section: thick muscular wall, amniotic fluid, the placenta on the upper right wall, the fetus, the cord.
// (cx, cy) centre, s scale (1 → about 400 × 480). opt: {fetus:false, cord:false, plHi: 0..1 placenta highlight, motes}
function womb(cx, cy, s, t, opt) {
  opt = opt || {}; var q = "", i;
  q += '<ellipse cx="0" cy="0" rx="205" ry="245" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<ellipse cx="0" cy="0" rx="205" ry="245" fill="url(#hatch)" opacity=".8"/>';
  q += '<ellipse cx="0" cy="0" rx="180" ry="220" fill="' + FLUID + '" stroke="' + INK + '" stroke-width="2.2"/>';
  q += '<ellipse cx="0" cy="0" rx="172" ry="212" fill="none" stroke="' + FLUID2 + '" stroke-width="1.4" stroke-dasharray="10 8"/>';
  // floating motes in the fluid (they drift: life for calm shots)
  for (i = 0; i < 14; i++) { var a = hash(i) * 6.28 + t * (.15 + hash(i + 7) * .2), r = 60 + hash(i + 3) * 100; q += '<circle cx="' + f(Math.cos(a) * r * .9) + '" cy="' + f(Math.sin(a) * r * 1.1) + '" r="' + f(1.6 + hash(i + 11) * 2) + '" fill="#eef3f1" opacity=".9"/>'; }
  // placenta: a thick disc on the upper right inner wall
  var pl = '<path d="M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z" fill="' + PLAC + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M45 -190 C90 -180 130 -150 150 -100 M70 -200 C110 -185 145 -150 162 -110" fill="none" stroke="' + PLAC2 + '" stroke-width="3"/>';
  q += pl + (opt.plHi ? '<path d="M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z" fill="' + ORANGE + '" opacity="' + f(.45 * opt.plHi * (0.75 + .25 * Math.sin(t * 4))) + '" stroke="none"/>' : "");
  // fetus and cord
  var fx = -20, fy = 0, fs = 0.82;
  if (opt.fetus !== false) q += fetus(fx, fy, fs, t, { breath: opt.breath || 0 });
  if (opt.cord !== false) q += cord(112, -128, -140 + 14 * Math.sin(t * .8), -240, fx + NAVEL[0] * fs, fy + NAVEL[1] * fs, 15, t, opt.cordK);
  // cervix at the bottom
  q += '<path d="M-26 238 Q0 262 26 238 L22 275 Q0 285 -22 275 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.2"/>';
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(s) + ")", q);
}
// the placenta's point in world coords for womb(cx, cy, s)
function placAt(cx, cy, s) { return [cx + 120 * s, cy - 150 * s]; }

// ── the mother in profile (facing right): head, neck, torso with the belly, lungs, the uterus inside. Box about 330 × 720 from (x, y) top-left.
// opt: {lungHi, uterus: true, fetus, path: 0..1 oxygen path lungs → uterus}
function bodyPath(flat) { return 'M150 18 C205 18 232 58 228 100 C226 120 238 128 244 140 C248 148 236 150 232 156 C236 168 228 176 222 184 C216 200 196 204 182 202 L180 230 C230 240 262 270 268 320 C276 360 268 380 260 400 ' + (flat ? 'C266 470 262 560 250 620 C246 640 236 655 230 660' : 'C310 440 330 520 300 590 C282 630 250 650 230 660') + ' L232 720 L96 720 L102 640 C80 590 84 520 92 470 C96 420 86 360 92 300 C96 250 110 228 122 212 C100 196 92 170 92 130 C92 62 112 18 150 18 Z'; }
function mother(x, y, s, t, opt) {
  opt = opt || {}; var q = "", br = 1 + .03 * Math.sin(t * 1.8), BODY = bodyPath(opt.flat);
  if (!opt.noBody) q += '<path d="' + BODY + '" fill="' + TAN + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  if (!opt.noBody) q += '<path d="' + BODY + '" fill="url(#hatch)" opacity=".35"/>';
  q += '<path d="M170 92 q8 -5 16 0" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + '<path d="M120 70 C132 50 150 78 136 96" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  // airway and lungs (they breathe)
  var lh = opt.lungHi || 0, lc = lh ? LUNG : "#ddc8b8";
  q += '<path d="M186 196 L176 262" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M186 196 L176 262" stroke="#d9cdb8" stroke-width="6" stroke-linecap="round"/>';
  q += G("translate(180 320) scale(" + f(br) + ") translate(-180 -320)", '<path d="M172 262 C140 262 118 300 116 350 C114 392 130 410 160 404 C176 400 178 380 176 350 Z" fill="' + lc + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M184 262 C220 262 246 300 248 350 C250 388 232 402 208 398 C192 395 188 380 188 350 Z" fill="' + lc + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M174 270 L150 320 M150 320 L140 360 M150 320 L162 356 M186 270 L214 318 M214 318 L226 356 M214 318 L202 352" stroke="' + MUTE + '" stroke-width="2" fill="none"/>');
  if (lh) q += G("translate(180 320) scale(" + f(br) + ") translate(-180 -320)", '<path d="M172 262 C140 262 118 300 116 350 C114 392 130 410 160 404 C176 400 178 380 176 350 Z M184 262 C220 262 246 300 248 350 C250 388 232 402 208 398 C192 395 188 380 188 350 Z" fill="' + BLUE + '" opacity="' + f(.25 * lh) + '"/>');
  // heart
  q += '<path d="M196 368 C186 352 204 342 210 356 C216 342 236 350 226 368 L212 386 Z" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width="1.8"/>';
  // the uterus in the belly
  if (opt.uterus !== false) q += womb(222, 520, .36, t, { fetus: opt.fetus !== false, plHi: opt.plHi || 0 });
  // the oxygen path: lungs → heart → down the aorta → the uterus
  if (opt.path) { var pd = "M176 330 C190 360 205 366 212 372 C200 410 188 440 200 470 C210 486 236 470 262 470"; q += draw(pd, opt.path, OXY, 6) + (opt.path >= 1 ? flowDots(pd, t, OXY, 5) : ""); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", q);
}
// dots running along a path (a path string through an <animateMotion>-free trick: dashes that move with t)
function flowDots(d, t, col, w) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + f(w * .6) + '" stroke-linecap="round" stroke-dasharray="0.1 18" stroke-dashoffset="' + f(-t * 40) + '" opacity=".9"/>'; }

// ── the placenta in section (after Gray's fig. 39): chorionic plate at the top (the cord leaves it), villous trees hanging
// into the intervillous space, the basal plate at the bottom with spiral arteries. Box 640 wide, plate y≈150, base y≈640.
// opt: {lake: 0..1 mother's blood fills the space, hi: 0..1 villi highlighted, spurt}
function villusTree(x, y, len, ang, depth, w, seed, t, col) {
  var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, bx = (x + x2) / 2 - Math.sin(ang) * len * .18 * (seed % 2 ? 1 : -1), by = (y + y2) / 2 + Math.cos(ang) * len * .18 * (seed % 2 ? 1 : -1), pd = "M" + f(x) + " " + f(y) + " Q" + f(bx) + " " + f(by) + " " + f(x2) + " " + f(y2), q = limb(pd, w, col || VILLUS);
  // the baby's capillary inside (orange near the tips, as the blood takes up oxygen)
  q += '<path d="' + pd + '" fill="none" stroke="' + (depth > 1 ? POOR : OXY) + '" stroke-width="' + f(Math.max(1.2, w * .22)) + '" stroke-linecap="round" opacity=".85"/>';
  if (depth > 0) {
    var sw = .05 * Math.sin(t * 1.3 + seed);
    q += villusTree(x2, y2, len * .72, ang - .42 - hash(seed) * .25 + sw, depth - 1, w * .72, seed * 2 + 1, t, col);
    q += villusTree(x2, y2, len * .72, ang + .42 + hash(seed + 5) * .25 + sw, depth - 1, w * .72, seed * 2 + 2, t, col);
  } else q += C(x2, y2, w * .62, col || VILLUS, 1.6);
  return q;
}
function placentaSection(t, opt) {
  opt = opt || {}; var q = "", lake = opt.lake == null ? 1 : opt.lake, i;
  // the intervillous space: mother's blood rising from the basal plate
  q += R(-40, 150, 720, 500, "#efe2cf", 0);
  if (lake > 0) q += sweep(-40, 150, 720, 500, lake, "u", '<rect x="-40" y="150" width="720" height="500" fill="' + MBLOOD + '" opacity=".55"/>' + (function () { var s = ""; for (i = 0; i < 40; i++) { var px = -20 + ((hash(i) * 700 + t * (14 + hash(i + 3) * 10)) % 700), py = 180 + hash(i + 9) * 450; s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="5" ry="3" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; })());
  // basal plate (mother's side) with spiral arteries bringing blood in, a vein taking it out
  q += '<path d="M-40 640 Q320 600 680 640 L680 760 L-40 760 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 640 Q320 600 680 640 L680 760 L-40 760 Z" fill="url(#hatch)" opacity=".7"/>';
  [90, 330, 560].forEach(function (x, j) {
    var d = "M" + x + " 760"; for (var yy = 740; yy >= 625; yy -= 10) d += " L" + f(x + 9 * Math.sin(yy * .12)) + " " + yy;
    q += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + OXY + '" stroke-width="8" stroke-linecap="round"/>';
    if (opt.spurt) { var k = (t * .8 + j * .33) % 1; q += '<path d="M' + f(x - 20 - 40 * k) + ' ' + f(615 - 120 * k) + ' Q' + x + ' ' + f(560 - 180 * k) + ' ' + f(x + 20 + 40 * k) + ' ' + f(615 - 120 * k) + '" fill="none" stroke="' + OXY + '" stroke-width="3" opacity="' + f(1 - k) + '"/>'; }
  });
  q += '<path d="M210 760 C214 700 200 660 206 625" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M210 760 C214 700 200 660 206 625" fill="none" stroke="' + POOR + '" stroke-width="8" stroke-linecap="round"/>';
  // septa between the lobes
  [210, 450].forEach(function (x) { q += '<path d="M' + (x - 22) + ' 640 L' + x + ' 470 L' + (x + 22) + ' 640 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2"/>'; });
  // the villous trees hanging from the chorionic plate
  var hi = opt.hi || 0, col = hi ? "#e8c7a0" : VILLUS;
  [[40, 2], [130, 3], [300, 3], [395, 2], [530, 3], [630, 2]].forEach(function (v, j) { q += villusTree(v[0], 182, 95 + v[1] * 14, Math.PI / 2 + (j % 2 ? .1 : -.1), v[1], 22, j + 1, t, col); });
  // chorionic plate (the baby's side) with the cord vessels in it
  q += '<path d="M-40 110 L680 110 L680 186 Q320 200 -40 186 Z" fill="' + VILLUS + '" stroke="' + INK + '" stroke-width="2.4"/>';
  q += '<path d="M-40 140 L680 140" stroke="' + OXY + '" stroke-width="5"/><path d="M-40 158 L680 158" stroke="' + POOR + '" stroke-width="4"/>';
  q += '<path d="M-40 110 L680 110 L680 40 L-40 40 Z" fill="' + FLUID + '" stroke="' + INK + '" stroke-width="2"/>';
  return q;
}

// ── the barrier close-up: mother's blood above, a thin wall, the baby's capillary below. Gas dots cross with t.
function barrier(t, opt) {
  opt = opt || {}; var q = "", i, kO = opt.o2 || 0, kC = opt.co2 || 0;
  q += R(-40, 60, 720, 300, "#e9c3b4", 0) + '<rect x="-40" y="60" width="720" height="300" fill="' + MBLOOD + '" opacity=".35"/>';
  for (i = 0; i < 9; i++) { var x = -40 + ((i * 90 + t * 30) % 760), y = 120 + (i % 3) * 70; q += G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(i * 37 + t * 20) + ")", '<ellipse rx="34" ry="14" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width="2"/><ellipse rx="18" ry="6" fill="#a84a38"/>'); }
  // the wall: two thin layers (olive), the gap is tiny
  q += R(-40, 364, 720, 6, OLIVE, 1.2);
  q += R(-40, 370, 720, 264, "#dfe5e0", 0) + '<rect x="-40" y="370" width="720" height="260" fill="' + FLUID2 + '" opacity=".4"/>';
  q += R(-40, 634, 720, 14, OLIVE, 2);
  for (i = 0; i < 7; i++) { var x2 = -40 + ((i * 110 + t * 45) % 760), y2 = 440 + (i % 2) * 90; q += G("translate(" + f(x2) + " " + f(y2) + ") rotate(" + f(-i * 23 - t * 15) + ")", '<ellipse rx="32" ry="13" fill="' + (kO > .5 ? "#d07a52" : "#9a7a86") + '" stroke="' + INK + '" stroke-width="2"/>'); }
  // gas crossing: O2 down (orange), CO2 up (blue)
  for (i = 0; i < 10; i++) {
    var ph = (t * .45 + hash(i)) % 1, gx = 30 + i * 62;
    if (kO > 0) q += G("", '<circle cx="' + f(gx) + '" cy="' + f(250 + ph * 260) + '" r="11" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("O₂", gx, 250 + ph * 260 - 16, 15, OXY), kO * (ph < .1 ? ph * 10 : ph > .9 ? (1 - ph) * 10 : 1));
    var ph2 = (t * .4 + hash(i + 20)) % 1, cx2 = 60 + i * 62;
    if (kC > 0) q += G("", '<circle cx="' + f(cx2) + '" cy="' + f(520 - ph2 * 260) + '" r="9" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("CO₂", cx2, 520 - ph2 * 260 + 28, 13, POOR), kC * (ph2 < .1 ? ph2 * 10 : ph2 > .9 ? (1 - ph2) * 10 : 1));
  }
  return q;
}
function rbc(x, y, r, col, tilt) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(tilt || 0) + ")", '<ellipse rx="' + f(r) + '" ry="' + f(r * .82) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="' + f(r * .5) + '" ry="' + f(r * .38) + '" fill="#000" opacity=".12"/>'); }
function o2dot(x, y, r) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r || 10) + '" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
function stopwatch(x, y, r, k, t) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = '<rect x="' + f(x - 10) + '" y="' + f(y - r - 22) + '" width="20" height="14" fill="' + INK + '"/>' + C(x, y, r, "#f4ecdb", 3);
  if (k > 0) s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r + 8) + ' A' + f(r - 8) + ' ' + f(r - 8) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 8)) + ' ' + f(y + Math.sin(a) * (r - 8)) + ' Z" fill="' + ORANGE + '" opacity=".35"/>';
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 4)) + ' ' + f(y + Math.sin(b) * (r - 4)) + ' L' + f(x + Math.cos(b) * (r - 14)) + ' ' + f(y + Math.sin(b) * (r - 14)) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  return s + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 14)) + ' ' + f(y + Math.sin(a) * (r - 14)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
}
// a vertical gauge (oxygen level): label under, fill k
function gauge(x, y, h, k, col, name, kk) {
  return appear(kk == null ? 1 : kk, R(x - 30, y - h, 60, h, "#f4ecdb", 2.4) + sweep(x - 30, y - h, 60, h, k, "u", R(x - 30, y - h, 60, h, col, 0)) + R(x - 30, y - h, 60, h, "none", 2.4) + T(name, x, y + 36, 26, INK, 800));
}

// ════ isometric toolkit («اسكتش» isometric, like the reference's cut-away rooms and machines) ════
// world axes: x → down-right, y → down-left, z → up. The visible faces are +x (right), +y (left/front) and +z (top).
var CI = 0.866, SI = 0.5;
// projection: "front" = the drawing faces you square-on and its depth runs back up-right (what the user picked over the
// 30° isometric, which made the anatomy look tilted); "iso" = true isometric
var PROJ = window.PROJ || "front";
var AX = PROJ === "iso" ? [CI, SI] : [1, 0], AY = PROJ === "iso" ? [-CI, SI] : [-.42, .3], AZ = [0, -1];
function IP(o, x, y, z) { return [o.ox + (x * AX[0] + y * AY[0] + z * AZ[0]) * o.s, o.oy + (x * AX[1] + y * AY[1] + z * AZ[1]) * o.s]; }
function mtx(a, b, c, d, e, g) { return "matrix(" + [a, b, c, d, e, g].map(function (v) { return (+v).toFixed(4); }).join(" ") + ")"; }
// put a 2D drawing (u right, v down, origin at the given point) onto a face plane
function onL(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(AX[0] * s, AX[1] * s, -AZ[0] * s, -AZ[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }   // plane y = y0 (the front): u → +x, v → −z
function onR(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(-AY[0] * s, -AY[1] * s, -AZ[0] * s, -AZ[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }  // plane x = x0 (the right side): u → −y, v → −z
function onT(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(AX[0] * s, AX[1] * s, AY[0] * s, AY[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }   // plane z = z0 (the top): u → +x, v → +y
function ipoly(o, pts, fill, sw, ex) { return '<path d="' + pts.map(function (p, i) { var q = IP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.8 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
// an upright box from (x, y, z) of size w × d × h, three visible faces
function ibox(o, x, y, z, w, d, h, top, left, right, sw) {
  return ipoly(o, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left, sw) + ipoly(o, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, sw) + ipoly(o, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, sw);
}
// a 2D shape d drawn on the front plane y = y0 (origin x0, z0), extruded back by depth: a solid with an ink silhouette.
// part: "all" | "sides" (only the extrusion) | "front" (only the cut face)
function slabL(o, x0, y0, z0, depth, d, front, side, inner, part, sw) {
  var n = Math.max(6, Math.round(depth / 6)), s = "", k; sw = sw || 2.2; part = part || "all";
  if (part !== "front") {
    for (k = n; k >= 0; k--) s += onL(o, x0, y0 - depth * k / n, z0, '<path d="' + d + '" fill="none" fill-rule="evenodd" stroke="' + INK + '" stroke-width="' + f(sw * 2.2) + '" stroke-linejoin="round"/>');
    for (k = n; k >= 1; k--) s += onL(o, x0, y0 - depth * k / n, z0, '<path d="' + d + '" fill="' + side + '" fill-rule="evenodd"/>');
  }
  if (part !== "sides") s += onL(o, x0, y0, z0, '<path d="' + d + '" fill="' + front + '" fill-rule="evenodd" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linejoin="round"/>' + (inner || ""));
  return s;
}
// a vertical cylinder: base centre (x, y, z), radius r, height h. cap: SVG drawn on the top face
function ringPts(o, x, y, z, r, n) { var p = [], i; for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push(IP(o, x + r * Math.cos(a), y + r * Math.sin(a), z)); } return p; }
function cylZ(o, x, y, z, r, h, col, cap, sw, glass) {
  var n = 72, B = ringPts(o, x, y, z, r, n), Tp = ringPts(o, x, y, z + h, r, n), iL = 0, iR = 0, i; sw = sw || 2.2;
  for (i = 0; i < n; i++) { if (B[i][0] < B[iL][0]) iL = i; if (B[i][0] > B[iR][0]) iR = i; }
  // the lower arc of the base, from the left extreme to the right extreme
  var arcA = [], arcB = [];
  for (i = iL; ; i = (i + 1) % n) { arcA.push(B[i]); if (i === iR) break; }
  for (i = iL; ; i = (i - 1 + n) % n) { arcB.push(B[i]); if (i === iR) break; }
  var mid = function (a) { return a[Math.floor(a.length / 2)][1]; }, arc = mid(arcA) > mid(arcB) ? arcA : arcB;
  var d = "M" + f(Tp[iL][0]) + " " + f(Tp[iL][1]) + arc.map(function (p) { return " L" + f(p[0]) + " " + f(p[1]); }).join("") + " L" + f(Tp[iR][0]) + " " + f(Tp[iR][1]) + " Z";
  var top = "M" + Tp.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  return '<path d="' + d + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"' + (glass ? ' fill-opacity=".45"' : "") + ' stroke-linejoin="round"/>' +
    '<path d="' + top + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"' + (glass ? ' fill-opacity=".35"' : "") + '/>' + (cap ? onT(o, x, y, z + h, cap) : "");
}
// a cylinder lying along x from x0 to x1 at (y, z), radius r. Its +x end is cut: cap = SVG on that end (centred at 0,0).
// stripes: [{col, w, ph}] wind round it as a helix (the far half faint), turns = how many turns over the length
function cylX(o, x0, x1, y, z, r, col, cap, stripes, turns, t, sw) {
  var A = IP(o, x0, y, z), Bp = IP(o, x1, y, z), s = "", sc = o.s, i; sw = sw || 2.4;
  function pe(a) { var u = r * Math.cos(a), v = r * Math.sin(a); return [(-AY[0] * u - AZ[0] * v) * sc, (-AY[1] * u - AZ[1] * v) * sc]; }
  var ax = Bp[0] - A[0], ay = Bp[1] - A[1], L = Math.hypot(ax, ay) || 1, nx = -ay / L, ny = ax / L, best = -1e9, worst = 1e9, a1 = 0, a2 = 0;
  for (i = 0; i < 180; i++) { var a = i / 180 * Math.PI * 2, p = pe(a), q = p[0] * nx + p[1] * ny; if (q > best) { best = q; a1 = a; } if (q < worst) { worst = q; a2 = a; } }
  var p1 = pe(a1), p2 = pe(a2);
  s += onR(o, x0, y, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>');
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + ' L' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' Z" fill="' + col + '"/>';
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' M' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + '" stroke="' + INK + '" stroke-width="' + sw + '"/>';
  // which half faces you: world normal (0, −cos a, −sin a) against the view direction
  var V = PROJ === "iso" ? [1, 1] : [1, .75];
  (stripes || []).forEach(function (st) {
    var d = "", dh = "", on = false, onh = false, n = 200;
    for (i = 0; i <= n; i++) {
      var u = i / n, a = u * turns * Math.PI * 2 + st.ph + (t || 0) * 1.2, vis = -V[0] * Math.cos(a) - V[1] * Math.sin(a) > -.05, p = pe(a), X = lerp(A[0], Bp[0], u) + p[0] * .8, Y = lerp(A[1], Bp[1], u) + p[1] * .8;
      if (vis) { d += (on ? " L" : " M") + f(X) + " " + f(Y); on = true; onh = false; } else { dh += (onh ? " L" : " M") + f(X) + " " + f(Y); onh = true; on = false; }
    }
    s += '<path d="' + dh + '" fill="none" stroke="' + st.col + '" stroke-width="' + f(st.w * .7) + '" stroke-linecap="round" opacity=".35"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(st.w + 3) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + st.col + '" stroke-width="' + st.w + '" stroke-linecap="round"/>';
  });
  return s + onR(o, x1, y, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>' + (cap || ""));
}

// a cylinder pointing at you along y, from y0 (far) to y1 (near) at (x, z), radius r: the near end is the cut face (cap, a full circle)
function cylY(o, x, z, y0, y1, r, col, cap, stripes, turns, t, sw) {
  var A = IP(o, x, y0, z), Bp = IP(o, x, y1, z), s = "", sc = o.s, i; sw = sw || 2.4;
  function pe(a) { var u = r * Math.cos(a), v = r * Math.sin(a); return [(AX[0] * u - AZ[0] * v) * sc, (AX[1] * u - AZ[1] * v) * sc]; }
  var ax = Bp[0] - A[0], ay = Bp[1] - A[1], L = Math.hypot(ax, ay) || 1, nx = -ay / L, ny = ax / L, best = -1e9, worst = 1e9, a1 = 0, a2 = 0;
  for (i = 0; i < 180; i++) { var a = i / 180 * Math.PI * 2, p = pe(a), q = p[0] * nx + p[1] * ny; if (q > best) { best = q; a1 = a; } if (q < worst) { worst = q; a2 = a; } }
  var p1 = pe(a1), p2 = pe(a2);
  s += onL(o, x, y0, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>');
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + ' L' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' Z" fill="' + col + '"/>';
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' M' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + '" stroke="' + INK + '" stroke-width="' + sw + '"/>';
  var back = [A[0] - Bp[0], A[1] - Bp[1]];   // the body shows on the side the far end lies toward
  (stripes || []).forEach(function (st) {
    var d = "", on = false, n = 240;
    for (i = 0; i <= n; i++) {
      var u = i / n, a = u * turns * Math.PI * 2 + st.ph + (t || 0) * 1.2, p = pe(a), vis = p[0] * back[0] + p[1] * back[1] > 0, X = lerp(A[0], Bp[0], u) + p[0] * .8, Y = lerp(A[1], Bp[1], u) + p[1] * .8;
      if (vis) { d += (on ? " L" : " M") + f(X) + " " + f(Y); on = true; } else on = false;
    }
    s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(st.w + 3) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + st.col + '" stroke-width="' + st.w + '" stroke-linecap="round"/>';
  });
  return s + onL(o, x, y1, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>' + (cap || ""));
}

// ── the uterus cut open, isometric: the wall as a thick shell sliced through, the fluid inside, the placenta on the upper wall,
// the fetus and cord on the middle plane. o: origin of the cut face centre. opt like womb() + {cutHi}
var RING = "M-205 0 A205 245 0 1 0 205 0 A205 245 0 1 0 -205 0 Z M-180 0 A180 220 0 1 0 180 0 A180 220 0 1 0 -180 0 Z";
var PLACD = "M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z";
function wombIso(o, t, opt) {
  opt = opt || {}; var D = 130, s = "", i, mid = -D * .5;
  s += onL(o, 0, -D, 0, '<ellipse rx="180" ry="220" fill="#a9bdbd" stroke="' + INK + '" stroke-width="2"/><ellipse rx="180" ry="220" fill="url(#hatch)" opacity=".35"/>');
  s += slabL(o, 0, 0, 0, D, RING, WALL, WALL2, "", "sides");
  // the placenta: a thick cake on the upper wall, from the back to near the cut
  var ph = opt.plHi ? '<path d="' + PLACD + '" fill="' + ORANGE + '" opacity="' + f(.45 * opt.plHi * (0.75 + .25 * Math.sin(t * 4))) + '"/>' : "";
  s += slabL(o, 0, -14, 0, 56, PLACD, PLAC, "#a85a48", '<path d="M45 -190 C90 -180 130 -150 150 -100 M70 -200 C110 -185 145 -150 162 -110" fill="none" stroke="' + PLAC2 + '" stroke-width="3"/>' + ph);
  // the middle plane: motes, fetus, cord
  var m = "";
  for (i = 0; i < 14; i++) { var a = hash(i) * 6.28 + t * (.15 + hash(i + 7) * .2), r = 60 + hash(i + 3) * 100; m += '<circle cx="' + f(Math.cos(a) * r * .9) + '" cy="' + f(Math.sin(a) * r * 1.1) + '" r="' + f(1.6 + hash(i + 11) * 2) + '" fill="#eef3f1" opacity=".9"/>'; }
  var fx = -20, fy = 10, fs = .8;
  if (opt.fetus !== false) m += fetus(fx, fy, fs, t, { breath: opt.breath || 0 });
  if (opt.cord !== false) m += cord(112, -128, -140 + 14 * Math.sin(t * .8), -240, fx + NAVEL[0] * fs, fy + NAVEL[1] * fs, 15, t, opt.cordK);
  if (opt.mid) m += opt.mid;
  s += onL(o, 0, mid, 0, m);
  // the fluid's near surface (a faint tint) and the cut face of the wall
  s += onL(o, 0, 0, 0, '<ellipse rx="180" ry="220" fill="' + FLUID + '" opacity=".22"/>');
  s += slabL(o, 0, 0, 0, D, RING, WALL, WALL2, '<path d="' + RING + '" fill="url(#hatch)" fill-rule="evenodd" opacity=".8"/>', "front");
  s += slabL(o, 0, 0, 0, D * .6, "M-26 236 Q0 258 26 236 L22 275 Q0 285 -22 275 Z", WALL, WALL2, "");
  return s;
}
// the mother as a solid cut through the middle (isometric slab), organs on the cut face. o = origin of her 2D box's top-left
function motherIso(o, t, opt) {
  opt = opt || {};
  return slabL(o, 0, 0, 0, 110, bodyPath(opt.flat), TAN, KHAKI, '<path d="' + bodyPath(opt.flat) + '" fill="url(#hatch)" opacity=".3"/>' + mother(0, 0, 1, t, Object.assign({ noBody: true }, opt)));
}
function stopwatchIso(o, k, t) {
  return slabL(o, 0, 0, 0, 34, "M-120 0 A120 120 0 1 0 120 0 A120 120 0 1 0 -120 0 Z M-12 -122 L-12 -146 L12 -146 L12 -122 Z", "#f4ecdb", KHAKI, stopwatch(0, 0, 112, k, t));
}

// ════ the channel's illustrations (img/NN.webp); the picture helpers (PL, pic, box, part, partSoft…) are in the template
pics({ 1: [669, 1158], 2: [693, 933], 3: [693, 1138], 4: [654, 1067], 5: [718, 1233], 6: [661, 782], 7: [728, 491], 8: [662, 693], 9: [533, 1063], 10: [702, 649], 11: [620, 729], 12: [706, 1108], 13: [568, 981], 14: [710, 717] });
var VESSEL = [[440, 120], [420, 300], [385, 480], [355, 640], [365, 800], [410, 960], [460, 1130]], LAKES = [[[90, 600], [270, 600], [270, 1040], [90, 1040]], [[430, 520], [660, 520], [660, 960], [430, 960]]];
function live(L, t, o) {
  o = o || {}; var n = L.n, s = "", b = breath(t), i, k = L.k;
  if (n === 1) {   // the mother: lungs breathe, heart beats, the baby sways
    s = pic(L) + partSoft(L, 200, 760, 150, 180, about(L, 200, 760, 1, 2.6 * Math.sin(t * .9), 2.5 * Math.sin(t * .7), 3 * Math.cos(t * .8)));
    s += part(L, ell(212, 315, 92, 135), about(L, 230, 300, 1 + .03 * b)) + part(L, ell(432, 315, 82, 135), about(L, 415, 300, 1 + .03 * b));
    s += part(L, ell(318, 360, 70, 72), about(L, 318, 360, 1 + .045 * beat(t)));
    return s;
  }
  if (n === 2) return pic(L) + partSoft(L, 395, 430, 260, 315, about(L, 395, 430, 1, 2.6 * Math.sin(t * .8), 5 * Math.sin(t * .6), 6 * Math.cos(t * .7)));
  if (n === 3) {
    s = pic(L) + partSoft(L, 300, 450, 285, 400, about(L, 300, 450, 1, 2.4 * Math.sin(t * .8), 4 * Math.cos(t * .5), 7 * Math.sin(t * .6)));
    if (o.chest) s += partSoft(L, 190, 480, 120, 110, about(L, 190, 480, 1 + .08 * (.5 + .5 * Math.sin(t * 3.2)), 0, 0, 7 * Math.sin(t * .6)));
    return s;
  }
  if (n === 4) {   // the placenta block: the lakes shimmer, the cord twists a little
    s = pic(L) + part(L, poly([[230, 0], [370, 0], [360, 200], [240, 200]]), about(L, 300, 200, 1, 1.2 * Math.sin(t * 1.1)));
    for (i = 0; i < 9; i++) { var ph = (t * .25 + hash(i)) % 1, x = 40 + hash(i + 4) * 560, y = 600 + hash(i + 8) * 150; var p0 = L.p(x, y); s += '<path d="M' + f(p0[0] - 14 + ph * 18) + ' ' + f(p0[1]) + ' q6 -3 12 0" stroke="#f3c7b4" stroke-width="2" fill="none" opacity="' + f(Math.sin(ph * Math.PI) * .8) + '"/>'; }
    return s;
  }
  if (n === 5) {   // the villus: the baby's red cells run down the vessel, the mother's drift in the lakes
    s = pic(L); var P = mapPts(L, VESSEL), Ls = [0]; for (i = 1; i < P.length; i++) Ls.push(Ls[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    for (i = 0; i < 14; i++) { var d = ((i / 14) * Ls[Ls.length - 1] + t * 45) % Ls[Ls.length - 1], q = 1; while (q < P.length - 1 && Ls[q] < d) q++; var u = (d - Ls[q - 1]) / (Ls[q] - Ls[q - 1]), off = (hash(i) - .5) * 40 * k;
      s += cellSprite(lerp(P[q - 1][0], P[q][0], u) + off, lerp(P[q - 1][1], P[q][1], u), 14 * k, "#c9483a", i * 47 + t * 40); }
    LAKES.forEach(function (lk, j) { for (i = 0; i < 4; i++) { var a = t * .3 + i * 1.7 + j, x = lerp(lk[0][0], lk[1][0], .5 + .32 * Math.sin(a + hash(i + j * 5) * 6)), y = lerp(lk[0][1], lk[2][1], .5 + .35 * Math.cos(a * .8 + hash(i + 9) * 6)), pp = L.p(x, y); s += cellSprite(pp[0], pp[1], 22 * k, "#8e2b2b", a * 30); } });
    return s;
  }
  if (n === 6) {   // the cord: blood swirls in the vein and the two arteries
    s = G("translate(0 " + f(2 * Math.sin(t)) + ")", pic(L));
    [[150, 640, 50, "#9c2f22", 1], [100, 515, 22, "#2e4357", -1], [265, 690, 22, "#2e4357", -1]].forEach(function (v) {
      var c = L.p(v[0], v[1] + 2 * Math.sin(t) / k), r = v[2] * k, a = t * 2.4 * v[4];
      for (i = 0; i < 3; i++) { var aa = a + i * 2.1; s += '<path d="M' + f(c[0] + Math.cos(aa) * r * .55) + ' ' + f(c[1] + Math.sin(aa) * r * .55) + ' A' + f(r * .55) + ' ' + f(r * .55) + ' 0 0 1 ' + f(c[0] + Math.cos(aa + 1) * r * .55) + ' ' + f(c[1] + Math.sin(aa + 1) * r * .55) + '" stroke="' + v[3] + '" stroke-width="' + f(r * .18) + '" fill="none" stroke-linecap="round" opacity=".55"/>'; }
    });
    return s;
  }
  if (n === 7) return part(L, poly([[0, 0], [364, 0], [364, 491], [0, 491]]), about(L, 180, 250, 1, 2 * Math.sin(t * .9), 0, 5 * Math.sin(t * 1.1))) + part(L, poly([[364, 0], [728, 0], [728, 491], [364, 491]]), about(L, 550, 250, 1, -2 * Math.sin(t * .8 + 1), 0, 5 * Math.sin(t * 1.2 + 2)));
  if (n === 8) return G(about(L, 330, 350, 1, 1.5 * Math.sin(t * .7), 0, 4 * Math.sin(t)), pic(L));
  if (n === 9) {   // the tea bag bobs on its string
    var bag = poly([[300, 0], [360, 0], [430, 330], [430, 660], [220, 660], [220, 330]]);
    return picBut(L, bag) + part(L, bag, about(L, 320, 0, 1, .8 * Math.sin(t * 1.3), 0, 5 * Math.sin(t * 1.6)));
  }
  if (n === 10) {   // the nail is pulled toward the big magnet
    var nail = poly([[190, 480], [215, 492], [490, 290], [470, 250], [440, 260]]), pull = o.u == null ? 0 : ease(o.u / 1.6), j = (1 - pull) * 2 * Math.sin(t * 24);
    return picBut(L, nail) + part(L, nail, "translate(" + f((-55 * pull + j) * k) + " " + f((40 * pull) * k) + ")");
  }
  if (n === 11) {   // Everest: the flag flies, snow blows off the summit
    var flag = poly([[330, 0], [372, 0], [372, 50], [330, 50]]), fc = L.p(338, 30);
    s = picBut(L, flag) + part(L, flag, "translate(" + f(fc[0]) + " " + f(fc[1]) + ") skewY(" + f(8 * Math.sin(t * 6)) + ") scale(" + f(1 + .05 * Math.sin(t * 5)) + " 1) translate(" + f(-fc[0]) + " " + f(-fc[1]) + ")");
    for (i = 0; i < 18; i++) { var ph2 = (t * .4 + hash(i)) % 1, sp = L.p(345, 40); s += '<circle cx="' + f(sp[0] + ph2 * 160 + hash(i + 2) * 20) + '" cy="' + f(sp[1] + 20 + ph2 * 50 - Math.sin(ph2 * 6 + i) * 10) + '" r="' + f(1.2 + hash(i + 7) * 1.8) + '" fill="#fff" opacity="' + f((1 - ph2) * .9) + '"/>'; }
    return s;
  }
  if (n === 13) {   // bubbles rising in the two liquids
    s = pic(L);
    [[130, 210, 840], [440, 390, 840]].forEach(function (c) { for (i = 0; i < 6; i++) { var ph3 = (t * .3 + hash(i + c[0])) % 1, y = lerp(c[2], c[1] + 20, ph3), x = c[0] - 40 + hash(i + 3) * 80 + 4 * Math.sin(t * 3 + i), pp = L.p(x, y); s += '<circle cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" r="' + f((3 + hash(i) * 4) * k) + '" fill="none" stroke="#f8e3da" stroke-width="1.2" opacity=".8"/>'; } });
    return s;
  }
  return pic(L);
}

// layouts (world 640 × 786)
var MOM = PL(1, 320, 400, 430), MOMZ = PL(1, 330, 430, 560), WMB = PL(2, 320, 420, 560), FET = PL(3, 320, 410, 480), PBK = PL(4, 320, 400, 470),
    VIL = PL(5, 320, 400, 470), CRD = PL(6, 320, 400, 560), RBC = PL(7, 320, 380, 600), CEL = PL(8, 320, 400, 500), TEA = PL(9, 320, 410, 380),
    MAG = PL(10, 320, 400, 560), EVR = PL(11, 320, 290, 400), CYL = PL(13, 320, 370, 330), ROOM = PL(14, 320, 330, 560);

// ════ shots (one per idea; line numbers from script.txt) ════
// 4 · every cell burns oxygen and gives off CO2; breathing swaps the two
shot(4, push(320, 400, 1.05, .97), function (u, d, t) {
  var s = paper() + appear(at(u, 0, .4), live(CEL, t)), i;
  for (i = 0; i < 5; i++) { var ph = (t * .5 + i / 5) % 1; s += G("", o2dot(10 + ph * 190, 300 + i * 40, 11) + N("O₂", 10 + ph * 190, 285 + i * 40, 14, OXY), at(u, .5, .4) * (ph > .85 ? (1 - ph) * 6 : 1)); }
  for (i = 0; i < 4; i++) { var p2 = (t * .45 + i / 4) % 1; s += G("", '<circle cx="' + f(440 + p2 * 200) + '" cy="' + f(420 + i * 45) + '" r="9" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("CO₂", 440 + p2 * 200, 450 + i * 45, 13, POOR), at(u, 1.6, .4) * (p2 < .15 ? p2 * 6 : 1)); }
  s += box(CEL.p(330, 330), 470, 120, "خلية", OLIVE, at(u, .3, .5), 26);
  return s + G("", T("النفس", 320, 720, 34, INK, 800) + arrow(200, 740, 120, 740, OXY, 5) + arrow(440, 740, 520, 740, POOR, 5), at(u, 3.2, .4));
});
// 5 · from its mother's breath: the mother, her lungs
shot(5, push(330, 400, .96, 1.04), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), live(MOM, t)) + T("؟", 560, 200, 120, ORANGE, 800) + box(MOM.p(430, 320), 520, 330, "رئة الأم", OLIVE, at(u, 1.4, .5), 26);
});
// 6 · into her lungs, into her blood (heart, down the aorta), down to the uterus
var O2PATH = [[440, 330], [360, 300], [320, 330], [335, 430], [333, 560], [325, 660], [300, 720], [250, 700]];
shot(6, push(330, 470, 1.0, 1.12), function (u, d, t) {
  var P = mapPts(MOMZ, O2PATH), dd = "M" + P.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L");
  return paper() + live(MOMZ, t) + draw(dd, at(u, .4, 2.4), OXY, 7, ' opacity=".85"') + (u > 2.8 ? runDots(P, t, OXY, 6, 9, 90) : "") +
    box(MOMZ.p(430, 320), 540, 250, "الرئة", OLIVE, at(u, .3, .5), 24) + box(MOMZ.p(334, 500), 545, 470, "الدم", ORANGE, at(u, 1.6, .5), 24) + box(MOMZ.p(120, 700), 110, 760, "الرحم", OLIVE, at(u, 3, .5), 24);
});
// 7 · an organ the size of a dinner plate: the placenta (thumbnail: a plate, about 22 cm)
shot(7, push(320, 410, 1.04, .97), function (u, d, t) {
  return paper() + live(WMB, t) + box(WMB.p(200, 210), 470, 80, "المشيمة", OLIVE, at(u, 1.2, .5), 28) +
    iconBox(95, 90, 140, '<ellipse cx="0" cy="8" rx="54" ry="19" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="5" rx="36" ry="11" fill="none" stroke="' + INK + '" stroke-width="1.2"/>' + N("~22 cm", 0, 52, 17, INK), at(u, .5, .3));
}, { tr: "in" });
// 8 · the placenta is the baby's lung for the whole pregnancy: close on it, a soft glow
var PLC = WMB.p(200, 210);
shot(8, push(PLC[0] + 50, PLC[1] + 30, 1.4, 1.52), function (u, d, t) {
  return paper() + live(WMB, t) + '<ellipse cx="' + f(PLC[0]) + '" cy="' + f(PLC[1]) + '" rx="120" ry="70" transform="rotate(-25 ' + f(PLC[0]) + ' ' + f(PLC[1]) + ')" fill="' + ORANGE + '" opacity="' + f(.12 + .08 * Math.sin(t * 4)) + '"/>' +
    tag("رئة الطفل", PLC[0] + 70, PLC[1] - 110, at(u, .4, .3), 26, ORANGE);
});
// 9 · how, if the two bloods never mix? a villus: the baby's vessel inside, the mother's blood all round it, a wall between
shot(9, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + live(VIL, t) + box(VIL.p(360, 820), 520, 120, "دم الطفل", BLUE, at(u, .4, .5), 26) + box(VIL.p(140, 900), 120, 120, "دم الأم", ORANGE, at(u, .9, .5), 26) +
    appear(at(u, 1.4, .3), C(560, 640, 40, PAPER, 2.4) + T("؟", 560, 662, 52, ORANGE, 800)) + cross(560, 640, 1, at(u, 2.1, .5));
});
// 10 · the placenta as a cut block: villous trees like roots, the baby's blood inside them, the cord on top
shot(10, push(320, 400, .98, 1.04), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), live(PBK, t)) + box(PBK.p(140, 430), 110, 250, "فروع", OLIVE, at(u, .8, .5), 26) + box(PBK.p(300, 60), 480, 50, "الحبل السري", OLIVE, at(u, 1.3, .5), 22) +
    iconBox(560, 300, 110, '<path d="M0 -50 V0 M0 0 Q-20 20 -38 48 M0 0 Q20 20 38 48 M0 10 Q-4 30 0 52 M-20 24 Q-34 26 -46 20 M22 22 Q34 26 44 16" stroke="#6f5a3e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-60 -10 H60" stroke="' + INK + '" stroke-width="2"/>', at(u, 1.8, .3));
}, { tr: "in" });
// 11 · the villi sit in little lakes of the mother's blood, fed by the spiral arteries (blood rising)
var SPIRALS = [[[85, 820], [90, 700], [110, 640]], [[215, 830], [215, 700], [240, 640]], [[355, 900], [385, 760], [400, 690]], [[505, 830], [500, 700], [520, 650]], [[595, 800], [600, 680], [590, 630]]];
shot(11, push(320, 480, 1.1, 1.22), function (u, d, t) {
  var s = paper() + live(PBK, t);
  SPIRALS.forEach(function (sp, j) { s += G("", runDots(mapPts(PBK, sp), t + j * .3, OXY, 4, 4, 40), at(u, .3, .5)); });
  return s + box(PBK.p(300, 640), 150, 740, "دم الأم", ORANGE, at(u, 1.2, .5), 26);
});
// 12 · between them a wall 20 times thinner than a hair: close on the vessel wall, a hair laid beside it
var WALLPT = VIL.p(293, 640);
shot(12, push(WALLPT[0] + 50, WALLPT[1] + 20, 1.6, 1.75), function (u, d, t) {
  var k = at(u, .6, .6), hx = WALLPT[0] + 120, hy = WALLPT[1] - 110;
  return paper() + live(VIL, t) + box(WALLPT, WALLPT[0] - 60, WALLPT[1] - 130, "الحيطة", OLIVE, at(u, .3, .5), 20) +
    G("", (function () { var hd = 'M' + f(hx) + ' ' + f(hy) + ' C' + f(hx + 20) + ' ' + f(hy + 60) + ' ' + f(hx - 10) + ' ' + f(hy + 130) + ' ' + f(hx + 15) + ' ' + f(hy + 220); return '<path d="' + hd + '" stroke="' + INK + '" stroke-width="42" fill="none" stroke-linecap="round"/><path d="' + hd + '" stroke="#6b5240" stroke-width="38" fill="none" stroke-linecap="round"/><path d="' + hd + '" stroke="#8d6e55" stroke-width="12" fill="none" stroke-linecap="round" transform="translate(-8 0)"/><path d="' + hd + '" stroke="#a88a70" stroke-width="3" fill="none" transform="translate(-12 0)"/>'; })() + T("شعرة", hx - 70, hy + 10, 22, INK, 800), k) +
    numBox("÷20", WALLPT[0] - 50, WALLPT[1] + 130, at(u, 1.2, .3), 24);
}, { tr: "in" });
// 13 · oxygen crosses from the mother's blood into the baby's, CO2 back the other way
shot(13, push(320, 460, 1.3, 1.22), function (u, d, t) {
  var s = paper() + live(VIL, t), i, kO = at(u, .2, .5), kC = at(u, 2.2, .5);
  for (i = 0; i < 7; i++) {
    var ph = (t * .4 + i / 7) % 1, y0 = 600 + i * 50, a = VIL.p(150 + (i % 2) * 30, y0), b = VIL.p(330, y0 + 10), x = lerp(a[0], b[0], ph), y = lerp(a[1], b[1], ph), fo = ph < .1 ? ph * 10 : ph > .9 ? (1 - ph) * 10 : 1;
    s += G("", o2dot(x, y, 7) + N("O₂", x, y - 10, 10, OXY), kO * fo);
    var ph2 = (t * .35 + i / 7 + .5) % 1, c = VIL.p(330, y0 + 30), e = VIL.p(500 + (i % 2) * 30, y0 + 20), x2 = lerp(c[0], e[0], ph2), y2 = lerp(c[1], e[1], ph2), fo2 = ph2 < .1 ? ph2 * 10 : ph2 > .9 ? (1 - ph2) * 10 : 1;
    s += G("", '<circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="6" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.2"/>' + N("CO₂", x2, y2 + 18, 9, POOR), kC * fo2);
  }
  return s + box(VIL.p(150, 760), 150, 280, "دم الأم", ORANGE, at(u, .2, .5), 18) + box(VIL.p(345, 900), 470, 760, "دم الطفل", BLUE, at(u, .6, .5), 18);
});
// 14 · like a tea bag in a glass: the taste comes out, the leaves stay in
shot(14, push(320, 430, 1.05, .98), function (u, d, t) {
  var s = paper() + live(TEA, t), i, c = TEA.p(280, 820);
  for (i = 0; i < 6; i++) { var a = i / 6 * 6.28 + t * .4; s += '<ellipse cx="' + f(c[0] + Math.cos(a) * 30) + '" cy="' + f(c[1] + Math.sin(a) * 20) + '" rx="40" ry="26" fill="#c46a4a" opacity="' + f(.05 + .04 * Math.sin(t * 1.5 + i)) + '"/>'; }
  return s + box(TEA.p(300, 800), 540, 640, "الطعم", ORANGE, at(u, 1, .5), 26) + box(TEA.p(270, 560), 540, 400, "الورق", OLIVE, at(u, 2.2, .5), 26);
}, { tr: "out" });
// 15 · unfold all the villi: about 12 m², a room's floor (the channel's room; the floor fills in with villus pink)
var FLOOR = [[405, 275], [590, 425], [380, 640], [115, 500]];
shot(15, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 2.6), P = mapPts(ROOM, FLOOR), id = "fl" + (++CLIPN), xs = P.map(function (q) { return q[0]; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  var poly = '<path d="M' + P.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="#d9846a" opacity="' + f(.32 + .05 * Math.sin(t * 3)) + '"/>';
  return paper() + pic(ROOM) + '<clipPath id="' + id + '"><rect x="' + f(x0) + '" y="0" width="' + f((x1 - x0) * k) + '" height="786"/></clipPath><g clip-path="url(#' + id + ')">' + poly + '</g>' +
    G("", N(count(12, k), 320, 660, 84, ORANGE) + T("متر مربع", 320, 712, 32, INK, 800), at(u, .4, .4));
});
// 16 · the oxygen reaches the baby through the umbilical cord: oxygen running down the cord to the belly
var CORDPATH = [[590, 380], [510, 410], [450, 340], [425, 380], [440, 470], [515, 525], [470, 580], [370, 555], [305, 600]];
shot(16, push(330, 420, .98, 1.08), function (u, d, t) {
  return paper() + live(FET, t) + G("", runDots(mapPts(FET, CORDPATH), t, OXY, 5, 10, 70), at(u, .4, .5)) + box(FET.p(470, 560), 520, 690, "الحبل السري", OLIVE, at(u, 1.4, .5), 26);
}, { tr: "out" });
// 17 · one vein brings blood rich in oxygen, two arteries take the CO2 blood back: the cord cut across
shot(17, push(320, 400, 1.04, .97), function (u, d, t) {
  var s = paper() + live(CRD, t);
  s += box(CRD.p(150, 640), 150, 720, "وريد", ORANGE, at(u, .5, .5), 28) + box(CRD.p(100, 515), 120, 160, "شريان", BLUE, at(u, 2.4, .5), 24) + box(CRD.p(265, 690), 470, 740, "شريان", BLUE, at(u, 2.8, .5), 24);
  return s + G("", arrow(CRD.p(330, 450)[0], CRD.p(330, 450)[1], CRD.p(130, 640)[0] - 10, CRD.p(130, 640)[1] + 40, OXY, 5) + tag("للطفل", 90, 440, 1, 20, OXY) +
    arrow(CRD.p(380, 330)[0] + 30, CRD.p(380, 330)[1] - 10, CRD.p(560, 120)[0], CRD.p(560, 120)[1], POOR, 5) + tag("للمشيمة", 560, 330, 1, 20, POOR), at(u, 1.2, .4));
});
// 18 · the mother's blood holds more oxygen: how does the baby get its share? two glass gauges
function tube(o, x, y, h, k, col, name, kk) {
  var r = 46, s = cylZ(o, x, y, 0, r, h * clamp(k), col, "", 2) + cylZ(o, x, y, 0, r, h, "#e8eeee", "", 2.4, true);
  var B = IP(o, x, y, 0); return appear(kk == null ? 1 : kk, s + T(name, B[0], B[1] + 60, 26, INK, 800));
}
shot(18, push(320, 410, 1.04, .98), function (u, d, t) {
  return paper() + live(CYL, t) + box(CYL.p(130, 600), 150, 720, "الأم", ORANGE, at(u, .2, .5), 26) + box(CYL.p(440, 600), 490, 720, "الطفل", ORANGE, at(u, .6, .5), 26) +
    T("أكسجين", 320, 60, 30, INK, 800) + G("", T("؟", 560, 300, 110, ORANGE, 800), at(u, 1.6, .3));
}, { tr: "out" });
// 19 · fetal haemoglobin grabs oxygen harder: oxygen hops from the mother's red cell to the baby's
shot(19, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + live(RBC, t), i, A = RBC.p(200, 220), B = RBC.p(560, 220);
  for (i = 0; i < 6; i++) { var ph = (t * .5 + i / 6) % 1, x = lerp(A[0], B[0], ease(ph)), y = lerp(A[1], B[1], ease(ph)) - Math.sin(ph * Math.PI) * 110 + i * 8; s += G("", o2dot(x, y, 11), at(u, .6, .4)); }
  return s + box(RBC.p(120, 380), 150, 640, "دم الأم", ORANGE, at(u, .3, .5), 26) + box(RBC.p(500, 400), 450, 690, "هيموجلوبين الطفل", OLIVE, at(u, 1, .5), 24) + tag("أقوى", 470, 130, at(u, 2.6, .3), 32, ORANGE);
});
// 20 · like a stronger magnet pulling the nail away from a weaker one
shot(20, push(320, 410, 1.02, .97), function (u, d, t) {
  var a = MAG.p(330, 380), b = MAG.p(200, 300), k = (t * .8) % 1;
  return paper() + live(MAG, t, { u: u }) + G("", arrow(lerp(a[0], b[0], k * .3) + 40, lerp(a[1], b[1], k * .3) + 60, lerp(a[0], b[0], .5 + k * .3), lerp(a[1], b[1], .5 + k * .3) + 50, ORANGE, 5), at(u, .8, .3)) +
    box(MAG.p(120, 200), 140, 110, "أقوى", ORANGE, at(u, .3, .5), 28) + box(MAG.p(560, 460), 500, 700, "أضعف", BLUE, at(u, .6, .5), 26) + box(MAG.p(380, 330), 520, 230, "مسمار", INK, at(u, 1, .5), 20);
});
// 21 · the myth: the baby breathes the fluid like a fish — no
shot(21, push(320, 430, 1.04, .98), function (u, d, t) {
  return paper() + live(WMB, t) + iconBox(520, 110, 170, '<path d="M-60 0 Q-20 -40 30 -10 L60 -34 L56 0 L60 34 L30 10 Q-20 40 -60 0 Z" fill="#9ab0b8" stroke="' + INK + '" stroke-width="2"/><circle cx="-38" cy="-6" r="4" fill="' + INK + '"/><path d="M-20 -14 Q-12 0 -20 14 M-12 -16 Q-4 0 -12 16" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' +
      (function () { var m = ""; for (var j = 0; j < 3; j++) { var ph = (t * .6 + j / 3) % 1; m += '<circle cx="' + f(-70 - 8 * j) + '" cy="' + f(-10 - ph * 60) + '" r="5" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; } return m; })(), at(u, .2, .3)) +
    cross(520, 110, 1.4, at(u, d - 1.3, .5));
});
// 22 · he does move his chest and pull fluid in and out: practice for the muscles, not breathing (close on the baby)
var MOUTH = FET.p(352, 382), CHEST = FET.p(190, 470);
shot(22, push(260, 400, 1.45, 1.6), function (u, d, t) {
  var m = "", i;
  for (i = 0; i < 4; i++) { var ph = (t * .5 + i / 4) % 1, dir = Math.sin(t * 1.6) > 0 ? 1 : -1; m += '<path d="M' + f(MOUTH[0] + 14 + ph * 50 * dir) + ' ' + f(MOUTH[1] - 6 + i * 6) + ' q8 -6 16 0" stroke="' + BLUE + '" stroke-width="2.4" fill="none" opacity="' + f(1 - ph) + '"/>'; }
  var sw = (Math.sin(t * 3.2) + 1) / 2;
  m += '<ellipse cx="' + f(CHEST[0]) + '" cy="' + f(CHEST[1]) + '" rx="' + f(40 + 8 * sw) + '" ry="' + f(30 + 6 * sw) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2" stroke-dasharray="6 5" opacity=".8"/>';
  return paper() + live(FET, t, { chest: true }) + m + tag("تمرين", 170, 200, at(u, 2.2, .3), 26, ORANGE) + box(CHEST, 120, 600, "الصدر", OLIVE, at(u, .4, .5), 20);
}, { tr: "in" });
// 23 · in short: mother breathes, placenta swaps, cord delivers, baby's blood grabs
shot(23, push(320, 400, .95, 1.02), function (u, d, t) {
  return paper() + live(MOM, t) + box(MOM.p(430, 300), 530, 180, "الأم بتتنفس", BLUE, at(u, .3, .5), 22) + box(MOM.p(260, 560), 530, 380, "المشيمة بتبدّل", OLIVE, at(u, 1.3, .5), 22) +
    box(MOM.p(200, 690), 520, 560, "الحبل السري بيوصّل", OLIVE, at(u, 2.3, .5), 20) + box(MOM.p(250, 820), 470, 740, "دم الطفل بيمسك", ORANGE, at(u, 3.4, .5), 22);
}, { tr: "out" });
// 24 · the odd fact: the baby's blood oxygen is close to yours on top of Everest (8,849 m)
shot(24, push(320, 420, 1.04, .97), function (u, d, t) {
  var s = paper() + live(EVR, t), k = at(u, .3, 1.2), fl = EVR.p(345, 30);
  s += N("8,849 m", 130, 110, 30, INK) + box(fl, 520, 80, "إفرست", ORANGE, at(u, .2, .5), 26);
  // the baby's cylinder from the gauge drawing, twice: the same level (crop of its right-hand cylinder)
  [[150, "الطفل", k], [490, "فوق إفرست", at(u, .8, .4)]].forEach(function (g) {
    var L = PL(13, g[0] - 66, 600, 120), id = "cy" + (++CLIPN), a0 = L.p(284, 0), a1 = L.p(568, 981);
    s += appear(g[2], '<clipPath id="' + id + '"><rect x="' + f(a0[0]) + '" y="' + f(a0[1]) + '" width="' + f(a1[0] - a0[0]) + '" height="' + f(a1[1] - a0[1]) + '"/></clipPath><g clip-path="url(#' + id + ')">' + pic(L) + '</g>' + T(g[1], g[0], 760, 24, INK, 800));
  });
  return s + G("", T("≈", 320, 620, 70, ORANGE, 800), at(u, 1.6, .3));
});

// two lungs seen through the baby's chest, filled with water: translucent outline, blue water up to level lv (0..1), bubbles
function lungsFull(t, lv) {
  var L = "M-6 -46 C-30 -46 -48 -14 -48 18 C-48 44 -32 50 -12 44 C-6 34 -6 12 -6 -46 Z", Rr = "M6 -46 C30 -46 48 -14 48 18 C48 44 32 50 12 44 C6 34 6 12 6 -46 Z", id = "lg" + (++CLIPN), top = 50 - 96 * lv, q = "", i;
  q += '<clipPath id="' + id + '"><path d="' + L + ' ' + Rr + '"/></clipPath>';
  q += '<path d="' + L + ' ' + Rr + '" fill="#f3e1d6" opacity=".55"/>';
  q += '<g clip-path="url(#' + id + ')"><path d="M-60 ' + f(top) + ' Q-30 ' + f(top - 4 + 3 * Math.sin(t * 3)) + ' 0 ' + f(top) + ' T60 ' + f(top) + ' V60 H-60 Z" fill="#7fa6bf" opacity=".75"/>';
  for (i = 0; i < 8; i++) { var ph = (t * .35 + hash(i)) % 1, x = (i % 2 ? 1 : -1) * (14 + hash(i + 3) * 22), y = 44 - ph * 80; if (y > top) q += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(2 + hash(i + 5) * 2.5) + '" fill="none" stroke="#eef4f6" stroke-width="1.4"/>'; }
  q += '</g><path d="' + L + ' ' + Rr + '" fill="none" stroke="' + INK + '" stroke-width="2"/><path d="M0 -62 V-40 M0 -40 L-10 -26 M0 -40 L10 -26" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  return q;
}
// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
var IN_CHEST = PL(1, 260, 470, 560), IN_WMB = PL(2, 304, 330, 470);
SCENE.intro = function (svg, t, li) {
  var s = "";
  if (li === 0) {   // hold your breath two minutes: a chest (lungs, heart), a stopwatch running
    var k = clamp((t - LN[0].start) / Math.max(1, LN[0].end - LN[0].start)), id = "ic" + (++CLIPN);
    s += '<clipPath id="' + id + '"><rect x="0" y="0" width="608" height="' + f(IN_CHEST.p(0, 440)[1]) + '"/></clipPath><g clip-path="url(#' + id + ')">' + live(IN_CHEST, t) + '</g>';
    s += G("translate(490 110) scale(.75)", stopwatch(0, 0, 112, k, t)) + N(Math.floor(k * 2) + ":" + ("0" + Math.floor((k * 120) % 60)).slice(-2), 490, 250, 40, ORANGE);
  } else {
    s += live(IN_WMB, t);
    if (li >= 1) s += tag("9 شهور", 510, 50, ease((t - LN[1].start) / .4), 28, ORANGE);
    if (li >= 2) {
      var u = t - LN[2].start, l2 = LN[2], c2 = window.CHUNKS[2], tl = l2.start + (l2.end - l2.start) * (c2[1] || .5);
      if (t < tl) { var M = IN_WMB.p(285, 505);
        s += G("", '<path d="M' + f(M[0] - 90) + ' ' + f(M[1] - 20) + ' l40 20 l-40 20 M' + f(M[0] - 120) + ' ' + f(M[1] - 20) + ' l40 20 l-40 20" stroke="' + BLUE + '" stroke-width="5" fill="none" stroke-linecap="round"/>', ease(u / .3)) + cross(M[0] - 85, M[1], 1, ease((u - .4) / .4));
      } else {   // «ده حتى رئتيه مليانين مية!»: the baby, its two lungs seen through the chest, full of water
        var v = t - tl, F = PL(3, 304, 330, 400), C0 = F.p(205, 470), k = ease(v / .4), lv = 1 - .06 * Math.sin(t * 2.4);
        s = live(F, t) + G("translate(" + f(C0[0] + 4) + " " + f(C0[1] - 4) + ") scale(.85)", lungsFull(t, lv), k) + tag("مية", C0[0] - 150, C0[1] - 40, ease((v - .5) / .3), 26, BLUE) +
          G("", draw("M" + f(C0[0] - 110) + " " + f(C0[1] - 40) + " L" + f(C0[0] - 40) + " " + f(C0[1] - 10), 1, INK, 2), ease((v - .5) / .3));
      }
    }
  }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(" + f(4 * Math.sin(t * 1.3)) + " " + f(3 * Math.cos(t * 1.1)) + ")", live(PL(2, 90, 100, 130), t)); };
var OUT_WMB = PL(2, 300, 140, 200);
SCENE.outro = function (svg, u, t) {
  return live(OUT_WMB, t) + callout("1", OUT_WMB.p(40, 450)[0] - 14, OUT_WMB.p(40, 450)[1], ease(u / .3)) + callout("2", OUT_WMB.p(200, 200)[0], OUT_WMB.p(200, 200)[1], ease(u / .3 - .5)) +
    callout("3", OUT_WMB.p(240, 420)[0], OUT_WMB.p(240, 420)[1], ease(u / .3 - 1)) + callout("4", OUT_WMB.p(450, 400)[0], OUT_WMB.p(450, 400)[1], ease(u / .3 - 1.5));
};
