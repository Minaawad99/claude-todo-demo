window.CHUNKS = [[0.0, 0.625], [0.0], [0.0, 0.5938], [0.0, 0.4194], [0.0, 0.4545], [0.0, 0.2561, 0.622], [0.0, 0.5306], [0.0, 0.2597, 0.5325, 0.8312], [0.0, 0.55], [0.0, 0.1594, 0.5942], [0.0, 0.4068, 0.6271], [0.0, 0.3125, 0.7], [0.0, 0.4167, 0.65], [0.0, 0.3472, 0.5278], [0.0, 0.575], [0.0, 0.6333], [0.0, 0.4235, 0.6588], [0.0], [0.0, 0.2623, 0.623], [0.0, 0.4], [0.0, 0.5319], [0.0, 0.525], [0.0, 0.2542, 0.4237, 0.678], [0.0, 0.2754, 0.6304, 0.7754], [0.0], [0.0]];
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

/* «إيه الحكاية؟» «اسكتش» — PEOPLE (locked by the user after «الناصور العصعصي»). build.py puts this file after _helpers.js and
   before the episode's shots.js, so every sketch episode draws people the same way. Don't copy fig() into an episode and
   don't hand-pick elbow sides: call fig() and give it hands / legs; the joints work themselves out.
   THE RULES (the user's):
   - real body proportions (table below) and real sizes for everything a person touches or sits in: furniture, cars,
     tools are drawn in metres at the person's scale, 1 m = PX_PER_M(s) = 400·s / 1.75 units (see the jeep in
     videos/pilonidal/sketch/shots.js: a Willys MB at its real 3.36 m, the driver's feet on its floor, hidden by its side);
   - the ELBOW always sits below / behind the shoulder→hand line (never up at the face, never into the chest);
   - the KNEE only bends one way: the shank swings back, the knee points to the front;
   - a face, always: profile with brow, nose, lips, chin, ear; an eye with its brow; an expression (expr) that fits the
     moment: "neutral" | "pain" | "smile" | "focus"; blink: 1 for a blink every 4 s;
   - hair, always: hs "short" (default, with volume), "long" (+ female: 1), "helmet", "none" for a bald or anatomy figure;
   - clothes: shirt with short sleeves (sleeves: "long" for a jacket or uniform), trousers to the waist, shoes; nude: 1 for
     an anatomy figure (skin only, bones drawn on top);
   - draw order fig().far, then anything between (a seat, a car body: put it here to hide the legs), fig().body, then
     anything in front, then fig().near (the near arm, over the steering wheel or the table).
   Facing left (front = −x). Check every person at full size (tools/frame.js) before rendering. */
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function PX_PER_M(s) { return 400 * (s || 1) / 1.75; }
// ── people: side-view figures facing left, real proportions (Drillis & Contini segment lengths as fractions of the
//    standing height H; H = 400 units at s = 1):
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.075H
// Joints bend the way real ones do, whatever the target: the ELBOW always sits below / behind the line from shoulder to
// hand (never up into the face, never into the chest), the KNEE always points to the front. Legs: [thigh angle, knee angle] in degrees from straight down, + to the
// front; the knee angle is clamped so the shank never folds forward of the thigh line. Hands go to a point or rel(h, side).
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function shadeC(c, k) { var p = function (i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, r = []; for (var i = 0; i < 3; i++) r.push(Math.round(p(i) * (1 - k))); return "rgb(" + r.join(",") + ")"; }
function capD(a, b, wa, wb) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return '<path d="M' + f(a[0] + nx * wa / 2) + ' ' + f(a[1] + ny * wa / 2) + ' L' + f(b[0] + nx * wb / 2) + ' ' + f(b[1] + ny * wb / 2) + ' L' + f(b[0] - nx * wb / 2) + ' ' + f(b[1] - ny * wb / 2) + ' L' + f(a[0] - nx * wa / 2) + ' ' + f(a[1] - ny * wa / 2) + ' Z"/>' +
    '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(wa / 2) + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(wb / 2) + '"/>';
}
// tapered capsules [a, b, wa, wb, colour]: all ink outlines first, then all fills, so the joints stay clean
function limbSet(segs) { var ink = "", fill = ""; segs.forEach(function (q) { ink += '<g fill="' + INK + '">' + capD(q[0], q[1], q[2] + 3.6, q[3] + 3.6) + '</g>'; fill += '<g fill="' + q[4] + '">' + capD(q[0], q[1], q[2], q[3]) + '</g>'; }); return ink + fill; }
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function smoothClosed(pts) {
  var d = "M" + f((pts[0][0] + pts[pts.length - 1][0]) / 2) + " " + f((pts[0][1] + pts[pts.length - 1][1]) / 2);
  for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
  return d + " Z";
}
// the head in profile, facing left, 52 units tall (0.13H) and 46 deep; origin at the middle of the skull
// expr: "neutral" | "pain" | "smile" | "focus" ; hs (hair style): "short" | "long" | "helmet" | "none"
function headD(o, t) {
  var sk = o.skin || SKIN, hc = o.hair || HAIR, s = "", ex = o.expr || "neutral";
  var face = "M14 20 C24 12 28 -6 22 -18 C16 -28 2 -31 -10 -28 C-18 -26 -22 -20 -23 -12 L-23 -6 C-22 -4 -21 -2 -22 0 L-29 9 C-29 11 -27 12 -24 12 L-23 13 C-24 15 -23 16 -22 16.5 C-23 18 -22.5 19.5 -21 20 C-21 23 -19 26 -14 26.5 C-8 27 -2 25 3 21 C6 19 10 19 14 20 Z";
  if (o.hs === "long") s += '<path d="M14 -16 C30 -10 32 14 28 34 C26 44 18 46 14 40 C18 26 18 6 10 -8 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="' + face + '" fill="' + sk + '" stroke="' + INK + '" stroke-width="2"/>';
  // ear, then the eye, brow and mouth for the expression
  s += '<path d="M3 -5 C9 -9 13 -4 12 2 C11 8 7 10 4 8" fill="' + sk + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M6 -2 C9 -2 9 3 6 4" fill="none" stroke="' + SKIN2 + '" stroke-width="1.3"/>';
  var squint = ex === "pain" ? .45 : ex === "focus" ? .75 : 1, blink = (o.blink && ((t || 0) % 4) < .12) ? .1 : 1;
  s += '<path d="M-19 -3 Q-15.5 ' + f(-3 - 3.2 * squint * blink) + ' -11 -2.5 Q-15 ' + f(-3 + 1.6 * squint * blink) + ' -19 -3 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.3"/>' + (blink > .5 ? '<circle cx="-16.5" cy="-3" r="' + f(1.5 * Math.max(.6, squint)) + '" fill="' + INK + '"/>' : "");
  if (o.female) s += '<path d="M-19.5 -3.5 l-2.5 -1.6 M-18.6 -4.4 l-2 -2" stroke="' + INK + '" stroke-width="1.1"/>';
  var brow = ex === "pain" ? "M-21 -11 Q-16 -10 -10 -7.5" : ex === "focus" ? "M-21 -8.5 Q-15 -9.5 -9.5 -8.5" : "M-21 -9 Q-15 -11.5 -9.5 -9.5";
  s += '<path d="' + brow + '" fill="none" stroke="' + (o.hs === "none" ? SKIN2 : hc) + '" stroke-width="2.4" stroke-linecap="round"/>';
  if (ex === "pain") s += '<path d="M-14 -11.5 l-1.5 -3 M-11 -10 l0 -3" stroke="' + SKIN2 + '" stroke-width="1"/>';
  var mouth = ex === "smile" ? "M-22.5 17 Q-19 19.5 -15.5 15.5" : ex === "pain" ? "M-22.5 17 Q-19 15.3 -15.5 18.6" : "M-22.5 17 Q-19 17.6 -16 16.6";
  s += '<path d="' + mouth + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  if (ex === "smile") s += '<path d="M-14 10 q3 2 5 0" fill="none" stroke="' + SKIN2 + '" stroke-width="1.2"/>';
  s += '<path d="M-24 12.5 q2 1 2.5 -.5" fill="none" stroke="' + SKIN2 + '" stroke-width="1.2"/>';   // nostril
  // hair
  if (o.hs === "helmet") s += '<path d="M-27 -10 C-26 -34 26 -38 28 -8 L30 -4 L-29 -6 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="2"/><path d="M-26 -12 C-10 -16 14 -16 27 -10" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><path d="M-6 -6 L-16 22" stroke="' + INK + '" stroke-width="1.6"/>';
  else if (o.hs !== "none") {
    s += '<path d="M-22 -14 C-24 -26 -12 -34 2 -33 C18 -32 28 -22 26 -6 C25 4 22 12 16 16 C14 10 13 4 12 -2 C11 -7 8 -9 2 -9 L1 2 C-1 4 -3 3 -3 1 L-3 -11 C-9 -14 -16 -16 -22 -14 Z" fill="' + hc + '" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<path d="M-14 -24 C-4 -29 8 -28 16 -21 M2 -16 C10 -18 18 -12 20 -4" fill="none" stroke="#fff" stroke-width="1.1" opacity=".18"/>';
    if (o.hs === "long") s += '<path d="M24 -14 C30 -12 32 -6 30 -2" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  }
  return s;
}
// o: {x, y (hip joint), s, lean, legs, hands: [near, far], grip: [bool, bool], shirt, pants, shoes, sleeves: "short" | "long",
//     skin, hair, hs, expr, female, belly, nude, tilt, blink}. Returns {far, body, near, sh, hd, hip, at, up, fw}.
function fig(o) {
  var s = o.s || 1, t = window.__t || 0, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sk = o.skin || SKIN, shirt = o.nude ? sk : (o.shirt || SHIRT_V), pants = o.nude ? sk : (o.pants || PANTS), shoe = o.shoes || "#2f2a24";
  var legs = o.legs || [[6, -4], [-6, 4]], arms = o.hands || [null, null], out = {};
  function leg(i, far) {
    var th = legs[i][0], kn = Math.min(0, legs[i][1]);   // the knee only bends backward (the shank never swings in front of the thigh line)
    var a = dirv(th), b = dirv(th + kn), K = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], A = [K[0] + b[0] * HB.shin * s, K[1] + b[1] * HB.shin * s];
    var pc = far ? shadeC(pants.charAt(0) === "#" ? pants : "#5b5145", .14) : pants, w = o.nude ? [32, 22, 21, 12] : [36, 27, 26, 20];
    var hipP = [hip[0] - fw[0] * 4 * s, hip[1] - fw[1] * 4 * s];
    var str = limbSet([[hipP, K, w[0] * s, w[1] * s, pc], [K, A, w[2] * s, w[3] * s, pc]]);
    // foot: flat on the sole, toes to the front
    var sole = A[1] + HB.ankle * s, heel = A[0] + 10 * s, toe = A[0] - HB.foot * .86 * s, fc = o.nude ? (far ? shadeC("#d9a186", .1) : sk) : (far ? shadeC("#2f2a24", -.0) : shoe);
    str += '<path d="M' + f(heel) + ' ' + f(A[1] - 6 * s) + ' C' + f(heel + 4 * s) + ' ' + f(sole - 6 * s) + ' ' + f(heel + 2 * s) + ' ' + f(sole) + ' ' + f(heel - 4 * s) + ' ' + f(sole) + ' L' + f(toe + 4 * s) + ' ' + f(sole) + ' C' + f(toe - 4 * s) + ' ' + f(sole) + ' ' + f(toe - 4 * s) + ' ' + f(sole - 9 * s) + ' ' + f(toe + 6 * s) + ' ' + f(sole - 11 * s) + ' L' + f(A[0] - 8 * s) + ' ' + f(A[1] - 4 * s) + ' Z" fill="' + fc + '" stroke="' + INK + '" stroke-width="2"/>';
    if (!o.nude) str += '<path d="M' + f(heel - 2 * s) + ' ' + f(sole - 2.5 * s) + ' L' + f(toe + 2 * s) + ' ' + f(sole - 2.5 * s) + '" stroke="#6b6157" stroke-width="' + f(2.4 * s) + '"/>';
    return str;
  }
  function arm(i, far) {
    var sp = atF(HB.sh - 6, far ? 1 : -3), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || atF(HB.sh - HB.ua - HB.fa - 22, 6);
    var l1 = HB.ua * s, l2 = HB.fa * s, dx = tg[0] - sp[0], dy = tg[1] - sp[1], d = clamp2(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - .5), ang = Math.atan2(dy, dx);
    var c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), e1 = [sp[0] + Math.cos(ang + c) * l1, sp[1] + Math.sin(ang + c) * l1], e2 = [sp[0] + Math.cos(ang - c) * l1, sp[1] + Math.sin(ang - c) * l1];
    // the elbow goes to the BACK of the body (smaller "front" coordinate)
    // reach v in the body's own frame (F front, U up); the elbow sits on the side n = (vU, -vF): reaching forward it hangs
    // below the arm, hanging down it points back, behind the back it points back and up, as a real elbow does
    var vF = dx * fw[0] + dy * fw[1], vU = dx * up[0] + dy * up[1], n = [vU * fw[0] - vF * up[0], vU * fw[1] - vF * up[1]];
    var el = ((e1[0] - e2[0]) * n[0] + (e1[1] - e2[1]) * n[1]) >= 0 ? e1 : e2;
    var ux = (tg[0] - el[0]), uy = (tg[1] - el[1]), ul = Math.hypot(ux, uy) || 1, wr = [el[0] + ux / ul * l2, el[1] + uy / ul * l2];
    var skc = far ? shadeC(sk, .12) : sk, shc = far ? shadeC(shirt.charAt(0) === "#" ? shirt : "#7f97a6", .14) : shirt;
    var segs, sleeve = o.nude ? 0 : o.sleeves === "long" ? 1 : .62;
    if (sleeve >= 1) segs = [[sp, el, 21 * s, 18 * s, shc], [el, L2(el, wr, .9), 18 * s, 15 * s, shc]];
    else if (sleeve > 0) { var m = L2(sp, el, sleeve); segs = [[m, el, 15 * s, 13 * s, skc], [el, wr, 13 * s, 10 * s, skc], [sp, m, 22 * s, 20 * s, shc]]; }
    else segs = [[sp, el, 17 * s, 13 * s, skc], [el, wr, 13 * s, 10 * s, skc]];
    var str = limbSet(segs);
    // the hand: along the forearm, thumb on top; a fist when gripping
    var ha = Math.atan2(uy, ux) * 180 / Math.PI, hs = s * HB.hand / 30, flip = (Math.cos(ha * Math.PI / 180) * fw[0] + Math.sin(ha * Math.PI / 180) * fw[1]) >= 0 ? -1 : 1;
    var hand = o.grip && o.grip[i] ? '<rect x="-2" y="-8" width="18" height="16" rx="6" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M6 -8 v16 M11 -8 v16" stroke="' + SKIN2 + '" stroke-width="1"/>'
      : '<path d="M-2 -6.5 C6 -8.5 16 -8 22 -5 C27 -2.5 28 2.5 23 4.5 L6 7 C1 7.5 -3 5 -2 -6.5 Z" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M4 -6 C8 -12 15 -12 15 -7" fill="' + skc + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M12 -1 L22 -1.5 M11 2.5 L21 2" stroke="' + SKIN2 + '" stroke-width="1"/>';
    str += G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ha) + ") scale(" + f(hs) + " " + f(hs * flip) + ")", hand);
    if (!o.nude && sleeve < 1 && sleeve > 0) { var m2 = L2(sp, el, sleeve), n = [-(el[1] - sp[1]), el[0] - sp[0]], nl = Math.hypot(n[0], n[1]) || 1; str += '<path d="M' + f(m2[0] + n[0] / nl * 11 * s) + ' ' + f(m2[1] + n[1] / nl * 11 * s) + ' L' + f(m2[0] - n[0] / nl * 11 * s) + ' ' + f(m2[1] - n[1] / nl * 11 * s) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    out["el" + i] = el; out["wr" + i] = wr;
    return str;
  }
  // trunk outline from measured depths (h up from the hip joint, side + to the front)
  var fr = [[-8, 18], [4, 23], [16, 24], [34, 24], [56, 22], [76, 25], [92, 28], [104, 27], [114, 20], [122, 12]];
  if (o.belly) fr = [[-8, 18], [4, 26], [18, 36], [36, 40], [58, 34], [78, 28], [92, 28], [104, 27], [114, 20], [122, 12]];
  if (o.female) fr = [[-8, 18], [4, 23], [16, 23], [34, 22], [56, 20], [74, 24], [86, 33], [98, 31], [108, 23], [118, 16], [122, 12]];
  var bk = [[122, -8], [114, -16], [100, -22], [82, -22], [64, -17], [46, -15], [30, -22], [14, -30], [0, -31], [-10, -24]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), tdD = smoothClosed(pts);
  var tor = '<path d="' + tdD + '" fill="' + shirt + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  if (!o.nude) {
    // trousers up to the waist (h 14), a belt line, a shirt fold
    var pf = fr.filter(function (q) { return q[0] <= 14; }), pb = bk.filter(function (q) { return q[0] <= 14; });
    var pp = [atF(16, fr[2][1])].concat(pf.slice().reverse().map(function (q) { return atF(q[0], q[1]); })).reverse();
    var id = "tc" + (++CLIPN);
    tor += '<clipPath id="' + id + '"><path d="' + tdD + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="M' + f(atF(16, 60)[0]) + ' ' + f(atF(16, 60)[1]) + ' L' + f(atF(16, -60)[0]) + ' ' + f(atF(16, -60)[1]) + ' L' + f(atF(-60, -60)[0]) + ' ' + f(atF(-60, -60)[1]) + ' L' + f(atF(-60, 60)[0]) + ' ' + f(atF(-60, 60)[1]) + ' Z" fill="' + pants + '"/>' +
      '<path d="M' + f(atF(16, 60)[0]) + ' ' + f(atF(16, 60)[1]) + ' L' + f(atF(16, -60)[0]) + ' ' + f(atF(16, -60)[1]) + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(atF(19, 60)[0]) + ' ' + f(atF(19, 60)[1]) + ' L' + f(atF(19, -60)[0]) + ' ' + f(atF(19, -60)[1]) + '" stroke="' + shadeC(shirt.charAt(0) === "#" ? shirt : "#7f97a6", .2) + '" stroke-width="1.2" opacity=".6"/></g>';
    tor += '<path d="' + tdD + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  }
  // neck and head
  var n0 = atF(HB.sh - 4, 3), n1 = atF(HB.chin + 4, 2), neck = limbSet([[n0, n1, 26 * s, 22 * s, sk]]);
  if (!o.nude) { var c0 = atF(HB.sh + 2, 12), c1 = atF(HB.sh + 4, -6); neck += '<path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' Q' + f((c0[0] + c1[0]) / 2) + ' ' + f((c0[1] + c1[1]) / 2 + 6 * s) + ' ' + f(c1[0]) + ' ' + f(c1[1]) + '" fill="none" stroke="' + INK + '" stroke-width="1.8"/>'; }
  var hd = atF(HB.head, 4), hang = -(o.lean || 0) + (o.tilt || 0);
  var head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(hang) + ") scale(" + f(s) + ")", headD(o, t));
  out.far = arm(1, true) + leg(1, true);
  out.body = tor + leg(0, false) + neck + head;
  out.near = arm(0, false);
  out.sh = atF(HB.sh, 0); out.hd = hd; out.hip = hip; out.up = up; out.fw = fw; out.at = atF;
  return out;
}
function clamp2(x, a, b) { return x < a ? a : x > b ? b : x; }
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// a wooden chair to scale: seat top 0.25H above the floor (y = seat top), back 0.3H tall
function chair(x, y, s) { s = s || 1; return R(x - 54 * s, y, 108 * s, 14 * s, WOOD, 2.2) + R(x + 40 * s, y - 120 * s, 14 * s, 134 * s, WOOD_D, 2) + R(x - 50 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2) + R(x + 40 * s, y + 14 * s, 12 * s, 86 * s, WOOD_D, 2); }
// a person seated (k 0) or standing (k 1) on the floor floorY at scale s; hips over the seat, feet flat
function sitter(x, floorY, k, o) {
  o = o || {}; k = clamp(k); var s = o.s || 1;
  var hipY = lerp(floorY - 120 * s, floorY - 212 * s, k), legs = [[lerp(82, 8, k), lerp(-82, -4, k)], [lerp(78, -8, k), lerp(-78, 4, k)]];
  return fig(Object.assign({}, o, { x: x - 10 * k * s, y: hipY, s: s, lean: lerp(o.lean == null ? 4 : o.lean, 2, k), hands: k > .5 ? [null, null] : (o.hands || [null, null]), legs: legs, blink: o.blink == null ? 1 : o.blink }));
}

// ── «الناصور العصعصي» — drawings. People: real body proportions, copied from videos/choking/sketch/shots.js (Drillis & Contini).
// Anatomy from real references (refs/SOURCES.md): a transverse cut through the buttocks at the sacrococcygeal level, back up
// (patient lying face down): skin, subcutaneous fat, gluteus maximus on both sides, the sacrum below; the natal cleft in the
// midline with its pit, the tract running into a pocket in the fat (never into bone or bowel).

var TISSUE = "#c98a72", CAV = "#f1e5d2", TONGUE = "#c97566", BONE = "#e6dcc4", FOOD = "#8a5a3c", AIRC = "#d5e2e6",
    SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a point along a polyline, k 0..1 by length
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 10 + 26 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
// a beat 0..1 repeating n times over dur seconds starting at u0: 0 rest, peaks at mid-beat
function beat(u, u0, dur, n) { var x = (u - u0) / dur * n; if (x < 0 || x >= n) return { k: 0, i: x < 0 ? 0 : n }; var p = x - Math.floor(x); return { k: Math.sin(p * Math.PI), i: Math.floor(x) + (p > .5 ? 1 : 0), p: p }; }
function chips(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 44) + '" cy="' + y + '" r="17" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 44, y + 7, 18, c ? "#fff" : INK); } return s; }

// ── materials ──
var SKC = "#d98f7c", DERM = "#e4a891", FATC = "#e8ddb0", MUSC = "#b86a5c", GRAN = "#e2a493", PUS = "#d9c46a", WOUND = "#9c4a40", REDH = "#cf5a3c", GAUZE = "#f6f1e4";
var H_COL = "#3e3128";
function fatDefs() {
  return '<defs><pattern id="fatp" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="9" cy="8" r="7.5" fill="#f4edd0" stroke="#c9bb88" stroke-width="1.1"/><circle cx="26" cy="23" r="7.5" fill="#f4edd0" stroke="#c9bb88" stroke-width="1.1"/></pattern>' +
    '<pattern id="musp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 6 H12" stroke="#93483d" stroke-width="1.4"/></pattern></defs>';
}
// a hair: a thin dark curve from (x,y) at angle a (deg, 0 = right), length L, bend b
function hair(x, y, a, L, b, w, col) {
  a = a * Math.PI / 180; var ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, mx = (x + ex) / 2 - Math.sin(a) * (b || 0), my = (y + ey) / 2 + Math.cos(a) * (b || 0);
  return '<path d="M' + f(x) + ' ' + f(y) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + (col || H_COL) + '" stroke-width="' + (w || 2.4) + '" fill="none" stroke-linecap="round"/>';
}

// ── the transverse cut (back up). o: {cx, depth, w, bump: [x, h, r], pocket 0..1, pus 0..1, inflame 0..1, hairs: n inside,
//    tract 0..1, surf: [[x, a]] hairs lying on the skin, excise 0..1 (outline), lift 0..1 (block lifted out), open 0..1 (wound
//    left open), gauze 0..1, heal 0..1, scar: x (stitched line), hl: "fat" | "bone" | "pocket"} ──
var CUT_TOP = 236, SKT = 24;
function surfY(x, o) {
  var cx = o.cx == null ? 320 : o.cx, dx = Math.abs(x - cx), d = o.depth == null ? 120 : o.depth, w = o.w || 78;
  var y = CUT_TOP + 0.0016 * (Math.abs(x - 320) - 170) * (Math.abs(x - 320) - 170) + d * Math.pow(Math.max(0, 1 - dx / w), 1.7);
  if (o.bump) y -= o.bump[1] * Math.exp(-Math.pow((x - o.bump[0]) / o.bump[2], 2));
  return y;
}
function cleftBottom(o) { var cx = o.cx == null ? 320 : o.cx; return [cx, surfY(cx, o)]; }
function pocketAt(o) { var b = cleftBottom(o); return [b[0] + 26, b[1] + 92]; }
function cut(t, o) {
  o = o || {}; var s = fatDefs(), x, top = [], bot = [];
  for (x = -260; x <= 900; x += 6) { var y = surfY(x, o); top.push([x, y]); bot.push([x, y + SKT]); }
  var tp = top.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" ");
  var bp = bot.slice().reverse().map(function (p) { return "L" + f(p[0]) + " " + f(p[1]); }).join(" ");
  // fat under the skin, all the way down
  var fatD = tp + " L900 1100 L-260 1100 Z";
  s += P(fatD, FATC, 2.4) + '<path d="' + fatD + '" fill="url(#fatp)" opacity="' + (o.hl === "fat" ? 1 : .85) + '"/>';
  if (o.hl === "fat") s += '<path d="' + fatD + '" fill="' + ORANGE + '" opacity=".08"/>';
  // gluteus maximus on both sides, from the edges of the sacrum out and up under the fat
  var cx0 = 320;
  [1, -1].forEach(function (sd) {
    var X = function (v) { return f(cx0 + sd * v); };
    var d = "M" + X(120) + " 640 C" + X(150) + " 560 " + X(250) + " 470 " + X(420) + " 440 L" + X(620) + " 430 L" + X(620) + " 1100 L" + X(150) + " 1100 C" + X(120) + " 900 " + X(110) + " 760 " + X(120) + " 640 Z";
    s += P(d, MUSC, 2.2) + '<path d="' + d + '" fill="url(#musp)" opacity=".55"/>';
  });
  // the sacrum (cut across): a wide bean with the median crest toward the skin; the sacral canal inside
  var bh = o.hl === "bone";
  s += P("M190 680 C200 630 270 610 300 606 L320 586 L340 606 C370 610 440 630 450 680 C452 728 380 748 320 748 C260 748 188 728 190 680 Z", bh ? "#efe2b8" : BONE, 2.6);
  s += '<path d="M200 680 C210 640 280 624 320 620 C360 624 430 640 440 680" fill="none" stroke="#cdbf9e" stroke-width="1.4"/>';
  for (var i = 0; i < 18; i++) s += '<circle cx="' + f(214 + hash(i) * 212) + '" cy="' + f(650 + hash(i + 40) * 80) + '" r="' + f(2 + hash(i + 9) * 3) + '" fill="none" stroke="#c4b48f" stroke-width="1.1"/>';
  s += '<path d="M300 652 Q320 640 340 652 Q346 672 320 678 Q294 672 300 652 Z" fill="#f2e9d5" stroke="' + INK + '" stroke-width="1.8"/>';
  // skin: epidermis line over the dermis
  s += P(tp + " " + bp + " Z", SKC, 2.4);
  var mid = top.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1] + 7); }).join(" ");
  s += '<path d="' + mid + '" fill="none" stroke="#b9705e" stroke-width="1.3"/>';
  // body hair on the skin (short strokes leaning one way)
  for (x = -240; x <= 880; x += 22) { var yy = surfY(x, o), dd = Math.abs(x - (o.cx == null ? 320 : o.cx)); if (dd < 40) continue; s += hair(x, yy, -120 + (x < 320 ? 0 : 60), 9 + 6 * hash(x), 1, 1.3, "#6a5444"); }
  // the pit, the tract and the pocket
  var b = cleftBottom(o), pc = pocketAt(o), pk = clamp(o.pocket || 0), tr = clamp(o.tract == null ? (pk > 0 ? 1 : 0) : o.tract);
  if (o.inflame) s += '<ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="' + f(90 + 8 * Math.sin(t * 4)) + '" ry="' + f(66 + 6 * Math.sin(t * 4)) + '" fill="' + REDH + '" opacity="' + f(.22 * o.inflame) + '"/><ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="62" ry="44" fill="' + REDH + '" opacity="' + f(.2 * o.inflame) + '"/>';
  if (tr > 0) { var tx = lerp(b[0], pc[0] - 10, tr), ty = lerp(b[1] + 4, pc[1] - 16, tr);
    s += '<path d="M' + f(b[0]) + ' ' + f(b[1] + 2) + ' Q' + f(b[0] + 2) + ' ' + f((b[1] + ty) / 2 + 6) + ' ' + f(tx) + ' ' + f(ty) + '" stroke="' + INK + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M' + f(b[0]) + ' ' + f(b[1] + 2) + ' Q' + f(b[0] + 2) + ' ' + f((b[1] + ty) / 2 + 6) + ' ' + f(tx) + ' ' + f(ty) + '" stroke="' + GRAN + '" stroke-width="8.5" fill="none" stroke-linecap="round"/>'; }
  if (pk > 0) {
    var rx = 58 * pk, ry = 36 * pk, col = o.pus ? mixC(GRAN, PUS, o.pus) : GRAN;
    s += '<ellipse cx="' + f(pc[0]) + '" cy="' + f(pc[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + col + '" stroke="' + (o.hl === "pocket" ? ORANGE : INK) + '" stroke-width="' + (o.hl === "pocket" ? 3.4 : 2.4) + '"/>';
    if (o.pus) for (i = 0; i < 6; i++) s += '<circle cx="' + f(pc[0] - rx * .6 + hash(i + 3) * rx * 1.2) + '" cy="' + f(pc[1] - ry * .4 + hash(i + 7) * ry * .8 + 2 * Math.sin(t * 2 + i)) + '" r="' + f(3 + 3 * hash(i)) + '" fill="#efe0a0" opacity="' + f(o.pus) + '"/>';
  }
  var nh = Math.floor(o.hairs || 0);
  for (i = 0; i < nh; i++) s += hair(pc[0] - 40 * pk + hash(i + 21) * 70 * pk, pc[1] - 16 * pk + hash(i + 5) * 26 * pk, -30 + hash(i + 2) * 70, 30 + hash(i + 11) * 22, 6 - 12 * hash(i), 2.6);
  // excision: a dashed ellipse round pit and pocket; the block lifts out, the wound stays
  var ex = [b[0] + 14, b[1] + 46, 76, 108];
  if (o.excise || o.lift || o.open) {
    var el = '<ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"';
    if (o.lift || o.open) {
      var inner = s, id = "ex" + (++CLIPN), fill = o.gauze ? GAUZE : WOUND;
      var hole = el + ' fill="' + WOUND + '" stroke="' + INK + '" stroke-width="2.4"/>';
      // the open wound fills up from the bottom as it heals
      if (o.heal) hole += '<clipPath id="' + id + 'h"><ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"/></clipPath><g clip-path="url(#' + id + 'h)"><rect x="' + f(ex[0] - 90) + '" y="' + f(ex[1] + ex[3] - 2 * ex[3] * o.heal) + '" width="180" height="300" fill="' + GRAN + '" stroke="' + INK + '" stroke-width="2"/></g>';
      if (o.gauze) hole += G("", el + ' fill="' + GAUZE + '" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M' + f(ex[0] - 60) + ' ' + f(ex[1] - 60) + ' l120 120 M' + f(ex[0] + 60) + ' ' + f(ex[1] - 60) + ' l-120 120 M' + f(ex[0] - 70) + ' ' + f(ex[1]) + ' h140 M' + f(ex[0]) + ' ' + f(ex[1] - 100) + ' v200" stroke="#cfc6b0" stroke-width="1.6"/>', o.gauze * (1 - (o.heal || 0) * .9));
      s += '<clipPath id="' + id + 't"><path d="' + fatD + '"/></clipPath><g clip-path="url(#' + id + 't)">' + hole + '</g>';
      if (o.lift) s += '<clipPath id="' + id + '"><ellipse cx="' + f(ex[0]) + '" cy="' + f(ex[1]) + '" rx="' + ex[2] + '" ry="' + ex[3] + '"/></clipPath>' + G("translate(" + f(o.lift * 150) + " " + f(-o.lift * 330) + ") rotate(" + f(o.lift * 14) + " " + f(ex[0]) + " " + f(ex[1]) + ")", '<g clip-path="url(#' + id + ')">' + inner + '</g>' + el + ' fill="none" stroke="' + INK + '" stroke-width="2.4"/>', 1);
    } else s += el + ' fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(clamp(o.excise)) + '"/>';
  }
  if (o.scar != null) for (i = -2; i <= 2; i++) { var sx = o.scar + i * 4, sy = surfY(o.scar + i * 14, o); s += '<path d="M' + f(o.scar + i * 14 - 7) + ' ' + f(sy - 8) + ' L' + f(o.scar + i * 14 + 7) + ' ' + f(sy + 8) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>'; }
  if (o.surf) o.surf.forEach(function (h) { s += hair(h[0], surfY(h[0], o) - 3, h[1], h[2] || 46, h[3] || 4, 2.6); });
  return s;
}
function mixC(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, r = []; for (var i = 0; i < 3; i++) r.push(Math.round(lerp(p(a, i), p(b, i), k))); return "rgb(" + r.join(",") + ")"; }

// ── the body from the side with its bones (real proportions: fig() in the figure's own frame, h above the hip joint, side
//    + to the front). Sacrum from the promontory (h 40) curving back and down; coccyx tip about level with the hip joint; the
//    rectum in front of the sacrum down to the anus; the cleft starts on the skin over the end of the sacrum (h ≈ 18). ──
var ANAT = { x: 330, y: 520, s: 1.7 };
function anatFig() { return fig({ x: ANAT.x, y: ANAT.y, s: ANAT.s, lean: 0, shirt: SKIN, pants: SKIN, nude: 1, hair: HAIR, legs: [[4, -2], [-4, 2]], hands: [null, null], expr: "neutral" }); }
function anat(t, o) {
  o = o || {}; var g = anatFig(), A = function (h, sd) { return g.at(h, sd); }, pt = function (q) { return f(q[0]) + " " + f(q[1]); };
  var poly = function (pts) { return "M" + pts.map(function (q) { return pt(A(q[0], q[1])); }).join(" L") + " Z"; };
  var smooth = function (pts) { var d = "M" + pt(A(pts[0][0], pts[0][1])); for (var i = 1; i < pts.length; i++) d += " L" + pt(A(pts[i][0], pts[i][1])); return d; };
  var s = g.far + g.body, k = o.bones == null ? 1 : o.bones, sk = "";
  // hip bone (faint): the iliac wing from the crest down to the hip socket
  sk += '<path d="' + poly([[74, -14], [80, 2], [72, 16], [40, 18], [8, 10], [-6, 2], [-10, -8], [10, -14], [36, -18]]) + '" fill="' + BONE + '" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>';
  var fh = A(0, 0); sk += C(fh[0], fh[1], 8 * ANAT.s, BONE, 1.8);
  var kn = A(-98, 4); sk += '<path d="M' + pt(fh) + ' L' + pt(kn) + '" stroke="' + INK + '" stroke-width="' + f(13 * ANAT.s) + '" stroke-linecap="round" opacity=".5"/><path d="M' + pt(fh) + ' L' + pt(kn) + '" stroke="' + BONE + '" stroke-width="' + f(10 * ANAT.s) + '" stroke-linecap="round" opacity=".6"/>';
  // the rectum, in front of the sacrum, down to the anus
  var rc = smooth([[44, 6], [30, 4], [16, -2], [4, -6], [-8, -8], [-16, -12]]);
  sk += '<path d="' + rc + '" stroke="' + INK + '" stroke-width="' + f(11 * ANAT.s) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + rc + '" stroke="' + (o.hl === "bowel" ? "#d9a06a" : "#c98a72") + '" stroke-width="' + f(8 * ANAT.s) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  // lumbar vertebrae (lordosis) with their spines to the back
  [86, 76, 66, 56, 46].forEach(function (h) { var sd = -4 + 3 * Math.sin((h - 40) / 50 * Math.PI), c = A(h, sd);
    sk += G("translate(" + pt(c) + ") scale(" + f(ANAT.s * .62) + ")", R(-9, -6, 18, 12, BONE, 1.2, 2) + R(9, -2.5, 7, 5, BONE, 1, 1.5) + R(-8, 6, 16, 3, "#d7a48a", .8, 1)); });
  // sacrum and coccyx
  var bc = o.hl === "bone" ? "#f0dc9c" : BONE;
  sk += '<path d="' + poly([[44, 0], [44, -12], [34, -19], [20, -22], [8, -21], [-2, -17], [2, -12], [12, -12], [24, -8], [36, -4]]) + '" fill="' + bc + '" stroke="' + INK + '" stroke-width="2"/>';
  [[-3, -16], [-8, -14], [-12, -11]].forEach(function (q, i) { var c = A(q[0], q[1]); sk += C(c[0], c[1], (3.4 - i * .5) * ANAT.s, bc, 1.6); });
  s += G("", sk, .35 + .65 * k);
  return s;
}
function spot() { return anatFig().at(18, -29); }
function coccyxTip() { return anatFig().at(-12, -11); }
function anus() { return anatFig().at(-16, -12); }

// ── icons ──
function wheat(x, y, sc, rot) {
  var s = '<path d="M0 0 L0 200" stroke="#b49a52" stroke-width="5" stroke-linecap="round"/>';
  for (var i = 0; i < 7; i++) { var yy = -6 + i * 20; [1, -1].forEach(function (sd) {
    s += '<ellipse cx="' + (sd * 10) + '" cy="' + yy + '" rx="9" ry="15" transform="rotate(' + (sd * 22) + ' ' + (sd * 10) + ' ' + yy + ')" fill="#d9b765" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M' + (sd * 14) + ' ' + (yy + 10) + ' L' + (sd * 30) + ' ' + (yy + 62) + '" stroke="#8a7438" stroke-width="1.6"/>'; }); }
  s += '<ellipse cx="0" cy="-26" rx="8" ry="14" fill="#d9b765" stroke="' + INK + '" stroke-width="1.6"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + (sc || 1) + ")", s);
}
function scalpel(x, y, rot, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ") scale(" + (sc || 1) + ")", '<path d="M0 0 C10 -20 30 -34 40 -40 L50 -30 C40 -14 22 -4 0 0 Z" fill="#dfe3e4" stroke="' + INK + '" stroke-width="2"/>' + R(44, -48, 120, 16, "#9aa4a8", 2, 4) + '<path d="M60 -40 h90" stroke="#c4cbce" stroke-width="2"/>'); }
function tweezers(x, y, rot, op) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", '<path d="M0 0 L-6 -150 L4 -152 L6 -4 Z M8 0 L22 -150 L32 -148 L14 -2 Z" fill="#c4cbce" stroke="' + INK + '" stroke-width="2"/>'); }
function clock(x, y, r, hrs) {
  var s = C(x, y, r, "#f4ecdb", 3);
  for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.sin(a) * (r - 4)) + ' ' + f(y - Math.cos(a) * (r - 4)) + ' L' + f(x + Math.sin(a) * (r - 11)) + ' ' + f(y - Math.cos(a) * (r - 11)) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3) + '"/>'; }
  var am = hrs * Math.PI * 2, ah = hrs / 12 * Math.PI * 2;
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(am) * r * .75) + ' ' + f(y - Math.cos(am) * r * .75) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(ah) * r * .5) + ' ' + f(y - Math.cos(ah) * r * .5) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
// a WWII jeep (Willys MB) from the side, front to the left, at its real size next to a person of height H = 400·sp units:
// length 3.36 m, wheelbase 2.03 m, tyres 0.74 m, body top 0.95 m, driver cut-out 0.79 m, floor 0.35 m, windshield to 1.5 m.
// m = pixels per metre; x0 = front bumper; G = ground line. Returns {back, front}: draw the driver between them.
function jeep(x0, GY, m, t) {
  var JC = "#6b7046", JD = "#565a38", X = function (v) { return f(x0 + v * m); }, Y = function (v) { return f(GY - v * m); }, back = "", front = "";
  // windshield (behind the body line) and the spare wheel at the back
  back += '<path d="M' + X(1.18) + ' ' + Y(0.95) + ' L' + X(1.08) + ' ' + Y(1.5) + ' L' + X(1.16) + ' ' + Y(1.5) + ' L' + X(1.26) + ' ' + Y(0.95) + ' Z" fill="#9fb2b8" stroke="' + INK + '" stroke-width="2.2" opacity=".75"/>';
  back += C(x0 + 3.3 * m, GY - 0.62 * m, 0.34 * m, "#3a342c", 2.4) + C(x0 + 3.3 * m, GY - 0.62 * m, 0.15 * m, "#8f8576", 1.6);
  // the body tub: hood, cut-out for the driver, rear; flat fenders over the wheels
  front += '<path d="M' + X(0.04) + ' ' + Y(0.28) + ' L' + X(0.04) + ' ' + Y(0.9) + ' L' + X(1.25) + ' ' + Y(0.95) + ' L' + X(1.62) + ' ' + Y(0.95) + ' C' + X(1.72) + ' ' + Y(0.78) + ' ' + X(2.12) + ' ' + Y(0.76) + ' ' + X(2.2) + ' ' + Y(0.95) + ' L' + X(3.2) + ' ' + Y(0.95) + ' L' + X(3.2) + ' ' + Y(0.28) + ' Z" fill="' + JC + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  front += '<path d="M' + X(0.04) + ' ' + Y(0.78) + ' L' + X(1.0) + ' ' + Y(0.8) + '" stroke="' + JD + '" stroke-width="2"/><path d="M' + X(0.16) + ' ' + Y(0.6) + ' h' + f(0.2 * m) + '" stroke="' + INK + '" stroke-width="1.6"/>';
  front += C(x0 + 0.14 * m, GY - 0.74 * m, 0.08 * m, "#f1e2a4", 1.8) + star(x0 + 2.05 * m, GY - 0.66 * m, 0.13 * m);
  [0.62, 2.65].forEach(function (wx) { var cx = x0 + wx * m, cy = GY - 0.37 * m;
    front += '<path d="M' + f(cx - 0.48 * m) + ' ' + Y(0.42) + ' A' + f(0.48 * m) + ' ' + f(0.42 * m) + ' 0 0 1 ' + f(cx + 0.48 * m) + ' ' + Y(0.42) + '" fill="' + JD + '" stroke="' + INK + '" stroke-width="2.2"/>';
    front += C(cx, cy, 0.37 * m, "#3a342c", 2.6) + C(cx, cy, 0.17 * m, "#8f8576", 2) + '<path d="M' + f(cx) + ' ' + f(cy) + ' l' + f(0.15 * m * Math.cos(t * 9)) + ' ' + f(0.15 * m * Math.sin(t * 9)) + '" stroke="' + INK + '" stroke-width="3"/>'; });
  return { back: back, front: front, wheel: [x0 + 1.45 * m, GY - 1.12 * m], dash: [x0 + 1.3 * m, GY - 0.92 * m], seat: GY - 0.55 * m, floor: GY - 0.35 * m };
}
function star(x, y, r) { var d = ""; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .42 : r; d += (i ? "L" : "M") + f(x + Math.cos(a) * q) + " " + f(y + Math.sin(a) * q) + " "; } return '<path d="' + d + 'Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.2"/>'; }
function nest(x, y, sc) { var s = ""; for (var i = 0; i < 16; i++) { var a = i * 23; s += hair(x - 34 + hash(i) * 20, y - 6 + hash(i + 3) * 18, a, 50, 10, 2.2, "#5a4636"); } return G("", s); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «الناصور العصعصي»: the whole body from the side, then into the lower back: bones, the spot over the end of the spine; «عش الشعر»
shot(4, function (u, d) { var k = ease(u / d); return [lerp(330, 345, k), lerp(400, 500, k), lerp(.82, 1.75, k)]; }, function (u, d, t) {
  var sp = spot(), cc = coccyxTip();
  return paper() + floor(ANAT.y + 212 * ANAT.s) + anat(t, { hl: at(u, 1.4, .4) > 0 ? "bone" : "", bones: at(u, .3, .8) }) + label(cc[0], cc[1], 300, 640, "العصعص", OLIVE, at(u, 1.4, .5), 22) +
    '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(9 + 3 * Math.sin(t * 5)) + '" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 4, ORANGE, 1.4) +
    label(sp[0], sp[1], 430, 330, "الناصور", ORANGE, at(u, 1.9, .5), 22) +
    iconBox(230, 390, 100, G("scale(.75)", nest(0, -8)) + T("عش الشعر", 0, 44, 15, ORANGE, 800), at(u, d - 1.6, .4));
});
// 5 · cut hair falls from the head and back and gathers in the cleft (transverse cut, back up)
shot(5, push(320, 360, 1.0, 1.12), function (u, d, t) {
  var o = { depth: 120 }, b = cleftBottom(o), s = paper() + cut(t, o), fl = "";
  for (var i = 0; i < 14; i++) {
    var st = .6 + i * .32, k = clamp((u - st) / 2.4), tx = lerp(-60 + hash(i) * 760, b[0] - 22 + hash(i + 8) * 44, ease(k)), ty = lerp(-120 - hash(i + 2) * 200, b[1] - 6 - hash(i + 4) * 22, ease(k) * ease(k));
    if (u > st) fl += hair(tx, ty, (1 - k) * (t * 120 + i * 40) + k * (hash(i) * 40 - 20), 44, 5, 3);
  }
  return s + fl + label(b[0] + 8, b[1] - 40, 440, 170, "الشق", OLIVE, at(u, d - 2.2, .5), 26) + G("", T("شعر مقصوص", 140, 120, 24, ORANGE, 800), at(u, .4, .3));
});
// 6 · a hair magnified: overlapping scales, all pointing to the tip; it slides only toward the root
shot(6, push(320, 400, 1.0, 1.1), function (u, d, t) {
  var s = paper(), off = -((t * 26) % 38), y = 400;
  var sh = P("M40 " + (y - 34) + " L640 " + (y - 30) + " L640 " + (y + 30) + " L40 " + (y + 34) + " Z", "#7a5a40", 2.6);
  var sc = ""; for (var x = 60 + off; x < 660; x += 38) sc += '<path d="M' + f(x) + ' ' + (y - 33) + ' Q' + f(x + 22) + ' ' + y + ' ' + f(x) + ' ' + (y + 33) + '" stroke="' + INK + '" stroke-width="2.2" fill="#8e6a4c"/>';
  s += G("", '<clipPath id="hc"><path d="M40 ' + (y - 34) + ' L640 ' + (y - 30) + ' L640 ' + (y + 30) + ' L40 ' + (y + 34) + ' Z"/></clipPath>') + sh + '<g clip-path="url(#hc)">' + sc + '</g>';
  // the root bulb at the left
  s += '<ellipse cx="34" cy="' + y + '" rx="36" ry="46" fill="#6b4a32" stroke="' + INK + '" stroke-width="2.6"/>';
  s += label(250, y - 20, 330, 230, "قشور", OLIVE, at(u, .5, .5), 28);
  s += arrow(500, 560, 200, 560, ORANGE, 7, at(u, 1.6, .6)) + G("", T("تدخل", 350, 610, 26, ORANGE, 800), at(u, 1.9, .3));
  s += arrow(200, 250, 470, 250, INK, 5, at(u, 2.4, .5)) + cross(335, 250, .8, at(u, 2.8, .4));
  s += iconBox(540, 120, 130, G("translate(-50 -10)", hair(0, 0, 0, 100, 0, 3)) + C(-50, -10, 6, H_COL, 1) + T("شعرة", 0, 44, 18, INK, 700), at(u, .2, .3));
  return s;
}, { tr: "in" });
// 7 · sitting and moving: the buttocks press together, the hair is pushed into the skin step by step and can't come back
shot(7, push(320, 400, 1.15, 1.28), function (u, d, t) {
  var sq = .5 + .5 * Math.sin(t * 4.2), st = clamp((u - .8) / (d - 1.6)), stepK = Math.floor(st * 5) / 5 + ease((st * 5) % 1) / 5;
  var o = { depth: 120, w: 78 - 22 * sq, tract: 1 }, b = cleftBottom(o), pc = pocketAt(o);
  var hx = lerp(b[0], pc[0] - 4, stepK), hy = lerp(b[1] - 30, pc[1] - 4, stepK);
  return paper() + cut(t, o) + hair(hx, hy, -60, 48, 3, 3) + arrow(80, 300, 80 + 70 * sq + 40, 300, ORANGE, 6, at(u, .3, .3)) + arrow(560, 300, 560 - 70 * sq - 40, 300, ORANGE, 6, at(u, .3, .3)) +
    G("", T("حك", 320, 150, 30, ORANGE, 800), at(u, .5, .3)) + G("", arrow(hx + 40, hy + 30, hx + 40, hy - 40, INK, 4, 1) + cross(hx + 40, hy - 6, .6, 1), at(u, d - 1.4, .4));
});
// 8 · like an ear of wheat up a sleeve: every move takes it higher
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var sw = Math.sin(t * 5), climb = Math.floor(u * 1.25) * 34 + 34 * ease((u * 1.25) % 1), s = paper();
  s += G("rotate(" + f(sw * 4) + " 320 60)", R(220, 60, 200, 700, "#8fa5b1", 2.6, 20) + R(244, 60, 152, 700, "#b9c9cf", 1.6, 14) + '<path d="M230 300 h180 M230 520 h180" stroke="#7c919c" stroke-width="2" stroke-dasharray="8 8"/>' +
    wheat(320, 620 - climb, .9, 180) + arrow(420 + 40, 600 - climb, 460, 470 - climb, ORANGE, 6, at(u, .8, .4)));
  s += inset(520, 170, 85, G("scale(.36) translate(-346 -470)", cut(t, { depth: 120, pocket: .6, hairs: 3 })), at(u, .3, .3)) + label(300, 560 - climb, 190, 700, "سنبلة القمح", OLIVE, at(u, .6, .5), 24);
  return s;
});
// 9 · the body treats the hair as foreign: inflammation, and a pocket forms under the skin
shot(9, push(330, 430, 1.25, 1.4), function (u, d, t) {
  var k = at(u, 2.0, 2.0), o = { depth: 120, pocket: .25 + .75 * k, hairs: 1, inflame: at(u, .9, .8) }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] - 8, pc[1] + 4, 230, 330, "جسم غريب", ORANGE, at(u, .6, .5), 24) + label(pc[0] + 40, pc[1] + 10, 450, 350, "جيب", OLIVE, at(u, 2.6, .5), 28);
}, { tr: "in" });
// 10 · more hair gathers, pus fills it, the skin swells: the abscess
shot(10, push(330, 400, 1.3, 1.18), function (u, d, t) {
  var k = at(u, .4, d * .6), o = { depth: 120, pocket: 1 + .15 * k, hairs: 1 + 7 * k, pus: at(u, 1.6, 1.2), inflame: 1, bump: [346, 34 * at(u, 2.0, 1.2) * (1 + .04 * Math.sin(t * 6)), 60] }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] + 30, pc[1] + 20, 450, 350, "خراج", ORANGE, at(u, d - 1.6, .5), 32) + G("", T("صديد", 210, 370, 26, "#a08a2a", 800), at(u, 1.8, .3));
}, { tr: "out" });
// 11 · who: men about three times women, mostly 15 to 30
shot(11, push(320, 560, 1.22, 1.3), function (u, d, t) {
  var a = fig({ x: 220, y: 600, s: .95, lean: 2 + Math.sin(t * 2), shirt: SHIRT_V, expr: "smile", blink: 1 }), b = fig({ x: 440, y: 612, s: .89, lean: 2 + Math.sin(t * 2 + 1), shirt: "#a38aa0", pants: "#4a5363", hair: "#5a4636", hs: "long", female: 1, expr: "smile", blink: 1 });
  var D = LN[11].end - LN[11].start, c = window.CHUNKS[11], kAge = at(u, D * (c[c.length - 1] || .6), .6);
  return paper() + floor(612 + 212 * .89) + whole(a) + G("", whole(b), 1 - .45 * at(u, 1.6, .4)) + numBox("×3", 120, 430, at(u, 1.8, .3), 40, true) +
    measure(200, 330, 440, 330, kAge, "") + G("", N("15", 200, 310, 28, ORANGE) + N("30", 440, 310, 28, ORANGE) + T("سنة", 320, 312, 22, INK, 700), kAge);
});
// 12 · hairy, heavy, sitting for hours (desk work)
shot(12, push(320, 430, 1.02, 1.1), function (u, d, t) {
  var p = sitter(300, 700, 0, { belly: true, hands: [[206, 520], [216, 522]], lean: 10, expr: "focus" }), s = paper() + floor(700);
  s += R(30, 528, 220, 14, WOOD, 2.2) + R(44, 542, 12, 158, WOOD_D, 2) + R(224, 542, 12, 158, WOOD_D, 2) + R(50, 410, 120, 90, "#3a342c", 2.4, 6) + R(60, 420, 100, 70, "#b9c9cf", 1.4, 4) + R(98, 500, 24, 28, "#3a342c", 2) + R(184, 520, 66, 8, "#cfc6b0", 1.6, 2);
  s += chair(330, 590) + p.far + p.body + p.near + G("", clock(510, 170, 64, t * .55), 1);
  var D = LN[12].end - LN[12].start, c = window.CHUNKS[12];
  s += tag("شعر كتير", 500, 340, at(u, .2, .3), 22) + tag("وزن زيادة", 500, 420, at(u, D * (c[1] || .35), .3), 22) + tag("قعدة طويلة", 500, 500, at(u, D * (c[2] || .65), .3), 22, ORANGE);
  return s;
});
// 13 · the abscess first: a cut to the side of the swelling, the pus drains
shot(13, push(340, 380, 1.15, 1.3), function (u, d, t) {
  var cutK = at(u, 1.6, .6), drain = at(u, 2.4, 2.2), o = { depth: 120, pocket: 1.1 - .45 * drain, hairs: 6, pus: 1 - drain * .8, inflame: 1 - drain * .6, bump: [346, 34 * (1 - drain), 60] };
  var sx = 392, sy = surfY(sx, o), s = paper() + cut(t, o);
  if (cutK > 0) s += '<path d="M' + (sx - 4) + ' ' + f(sy - 2) + ' l' + f(10 * cutK) + ' ' + f(30 * cutK) + '" stroke="' + WOUND + '" stroke-width="6" stroke-linecap="round"/>';
  for (var i = 0; i < 5; i++) { var p = (t * .9 + i / 5) % 1; if (drain > 0 && drain < 1) s += '<ellipse cx="' + f(sx + 14 + p * 40) + '" cy="' + f(sy + p * 60) + '" rx="7" ry="9" fill="' + PUS + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f((1 - p) * (1 - drain * .6)) + '"/>'; }
  s += scalpel(lerp(560, sx + 4, at(u, .6, 1.0)), lerp(160, sy - 4, at(u, .6, 1.0)), -60, 1.1) + G("", T("الخراج الأول", 160, 150, 26, ORANGE, 800), at(u, .2, .3));
  return s;
});
// 14 · then the whole pocket, with its hair, comes out in one block
shot(14, push(340, 380, 1.08, 1.0), function (u, d, t) {
  var o = { depth: 120, pocket: .9, hairs: 7, excise: at(u, .3, .6), lift: at(u, 1.6, 1.4) };
  return paper() + cut(t, o) + label(470, 110, 430, 170, "الجيب كله", OLIVE, at(u, 2.6, .5), 24);
});
// 15 · the old way: left open to heal by itself, packed with gauze, weeks of dressings
shot(15, push(340, 420, 1.15, 1.25), function (u, d, t) {
  var heal = at(u, 1.6, d - 2.0), o = { depth: 120, open: 1, gauze: at(u, .6, .5), heal: heal * .8 };
  var wk = 1 + Math.floor(heal * 5.99);
  return paper() + cut(t, o) + iconBox(480, 170, 120, R(-56, -50, 112, 104, "#f4ecdb", 2) + R(-56, -50, 112, 24, ORANGE, 2) + N(String(wk), 0, 36, 46, INK), at(u, 1.2, .3)) + G("", T("أسابيع", 480, 260, 22, ORANGE, 800), at(u, 1.4, .3)) +
    label(330, 360, 200, 200, "مفتوح", INK, at(u, .3, .5), 24) + G("", T("زمان", 200, 150, 22, MUTE, 700), at(u, .2, .3));
});
// 16 · today: the closure is moved off the middle and the cleft is made shallow, so hair has nowhere to gather
shot(16, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, 1.0, 2.6), o = { depth: lerp(120, 26, k), cx: lerp(320, 352, k), scar: k > .5 ? 400 : null };
  var b = cleftBottom({ depth: 120 }), b2 = cleftBottom(o), s = paper() + cut(t, o);
  s += measure(530, CUT_TOP + 60, 530, CUT_TOP + 60 + lerp(120, 26, k), 1, "") + G("", T("عمق", 530, CUT_TOP + 30, 22, BLUE, 800), at(u, .4, .3));
  // a hair slides over the shallow cleft and off
  var hp = (t * .5) % 1; if (k >= 1) s += hair(lerp(180, 520, hp), surfY(lerp(180, 520, hp), o) - 6, -4, 40, 3, 2.6);
  s += label(400, surfY(400, o) + 2, 400, 150, "الجرح على جنب", ORANGE, at(u, 3.0, .5), 22) + check(560, 520, 1.1, at(u, d - 1.2, .5), BLUE);
  return s;
});
// 17 · small cases: a scope or a laser fibre goes in through the pit and seals the tract from inside
shot(17, push(330, 400, 1.2, 1.32), function (u, d, t) {
  var o = { depth: 120, pocket: .55 * (1 - .5 * at(u, 2.0, 1.4)), hairs: 2 * (1 - at(u, 1.4, .6)), tract: 1 }, b = cleftBottom(o), pc = pocketAt(o), ins = at(u, .4, 1.0);
  var tipx = lerp(b[0] - 100, pc[0] - 6, ins), tipy = lerp(b[1] - 200, pc[1] - 8, ins), s = paper() + cut(t, o);
  s += '<path d="M' + f(tipx - 180) + ' ' + f(tipy - 330) + ' L' + f(tipx) + ' ' + f(tipy) + '" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M' + f(tipx - 180) + ' ' + f(tipy - 330) + ' L' + f(tipx) + ' ' + f(tipy) + '" stroke="#9aa4a8" stroke-width="8" stroke-linecap="round"/>';
  var gl = at(u, 1.8, .4); if (gl > 0) s += '<circle cx="' + f(tipx) + '" cy="' + f(tipy) + '" r="' + f(16 + 6 * Math.sin(t * 14)) + '" fill="' + ORANGE + '" opacity="' + f(.55 * gl) + '"/>' + C(tipx, tipy, 6, "#f6d58a", 1.4);
  return s + label(tipx - 90, tipy - 165, 260, 140, "منظار / ليزر", BLUE, at(u, 1.0, .5), 24);
});
// 18 · prevention: remove the hair; laser lowers the chance it comes back
shot(18, push(320, 380, 1.05, 1.15), function (u, d, t) {
  var o = { depth: 70 }, hx = lerp(80, 560, (u * .22) % 1), s = paper(), hs = [];
  for (var i = 0; i < 16; i++) { var x = 60 + i * 34; if (x > hx || u < 1.2) hs.push([x, -110 + hash(i) * 40, 30]); }
  o.surf = hs; s += cut(t, o);
  var sy = surfY(hx, o);
  if (u > 1.2) s += G("", R(hx - 40, sy - 210, 80, 120, "#dfe3e4", 2.4, 10) + R(hx - 20, sy - 90, 40, 30, "#9aa4a8", 2) + '<path d="M' + f(hx) + ' ' + f(sy - 60) + ' L' + f(hx) + ' ' + f(sy - 6) + '" stroke="' + ORANGE + '" stroke-width="' + f(6 + 4 * Math.abs(Math.sin(t * 12))) + '" opacity=".75"/>', at(u, 1.2, .3));
  var D = LN[18].end - LN[18].start, c = window.CHUNKS[18];
  s += tag("ليزر", 140, 120, at(u, D * (c[1] || .5), .3), 28, BLUE) + G("", arrow(470, 90, 470, 170, ORANGE, 6, 1) + T("يرجع أقل", 470, 210, 22, ORANGE, 800), at(u, D * (c[1] || .5) + .8, .4));
  return s;
});
// 19 · clean and dry; don't sit more than an hour without getting up
shot(19, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var D = LN[19].end - LN[19].start, c = window.CHUNKS[19], k2 = D * (c[1] || .4), cyc = Math.max(0, u - k2), standK = clamp(Math.sin(clamp((cyc - 1.0) / 2.0) * Math.PI) * 1.4);
  var p = sitter(330, 700, standK, { hands: [rel(22, 56), rel(22, 50)], expr: standK > .5 ? "smile" : "neutral" }), s = paper() + floor(700) + chair(352, 590) + p.far + p.body + p.near;
  s += G("", clock(520, 180, 66, clamp(cyc / 1.0) * 1) + T("ساعة", 520, 290, 26, ORANGE, 800), at(u, k2, .3));
  s += G("", tag("نضيف", 140, 140, 1, 26, BLUE) + tag("ناشف", 140, 220, 1, 26, BLUE) + check(250, 140, .8, at(u, .6, .4), BLUE) + check(250, 220, .8, at(u, 1.0, .4), BLUE), at(u, .2, .3));
  if (standK > .4) s += arrow(250, 520, 250, 420, ORANGE, 6, standK);
  return s;
});
// 20 · the myth: it reaches the bone or the bowel? No
shot(20, push(345, 500, 1.7, 1.85), function (u, d, t) {
  var sp = spot(), cc = coccyxTip(), an = anus(), s = paper() + anat(t, { hl: u > 1.8 ? "bowel" : "bone" });
  s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="10" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 4, ORANGE, 1.4);
  s += draw("M" + f(sp[0]) + " " + f(sp[1]) + " Q" + f(sp[0] - 4) + " " + f(cc[1] - 10) + " " + f(cc[0] + 4) + " " + f(cc[1]), at(u, .5, .8), ORANGE, 3, ' stroke-dasharray="6 5"') +
       draw("M" + f(sp[0]) + " " + f(sp[1]) + " Q" + f(sp[0] + 4) + " " + f(an[1] - 10) + " " + f(an[0] + 6) + " " + f(an[1]), at(u, 1.8, .8), ORANGE, 3, ' stroke-dasharray="6 5"');
  s += label(cc[0], cc[1], 300, 400, "العضمة؟", INK, at(u, 1.0, .5), 18) + label(an[0], an[1], 330, 560, "المصران؟", INK, at(u, 2.2, .5), 18) + cross(sp[0] - 22, sp[1] + 34, .55, at(u, d - .9, .4));
  return s;
});
// 21 · just a pocket under the skin; the coccyx is only its address
shot(21, push(330, 470, 1.0, 1.08), function (u, d, t) {
  var o = { depth: 120, pocket: 1, hairs: 5, hl: u < 1.6 ? "pocket" : "bone" }, pc = pocketAt(o);
  return paper() + cut(t, o) + label(pc[0] + 40, pc[1], 440, 380, "تحت الجلد", OLIVE, at(u, .3, .5), 24) + measure(400, pc[1] + 40, 400, 590, at(u, 1.0, .6), "") + check(470, 470, .8, at(u, 1.4, .4), BLUE) +
    label(330, 740, 420, 790, "العصعص", INK, at(u, 1.8, .5), 22) + tag("عنوان", 220, 600, at(u, 2.4, .3), 26, ORANGE);
});
// 22 · «يعني من الآخر»: loose hair + rubbing + a deep cleft → the skin swallows the hair
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var D = LN[22].end - LN[22].start, c = window.CHUNKS[22], k1 = at(u, D * (c[1] || .2), .3), k2 = at(u, D * (c[1] || .2) + .8, .3), k3 = at(u, D * (c[1] || .2) + 1.6, .3), k4 = at(u, D * (c[2] || .7), .4);
  var s = paper();
  s += iconBox(110, 150, 140, hair(-40, 10 + 6 * Math.sin(t * 3), -20 + 8 * Math.sin(t * 2), 80, 8, 3) + hair(-30, 30, -10 + 8 * Math.cos(t * 2.4), 70, -6, 3), k1) + G("", T("+", 220, 164, 50, INK, 800), k2);
  s += iconBox(320, 150, 140, arrow(-60 + 10 * Math.sin(t * 6), 0, -10 + 10 * Math.sin(t * 6), 0, ORANGE, 6, 1) + arrow(60 - 10 * Math.sin(t * 6), 0, 10 - 10 * Math.sin(t * 6), 0, ORANGE, 6, 1), k2) + G("", T("+", 430, 164, 50, INK, 800), k3);
  s += iconBox(530, 150, 140, '<path d="M-60 -20 Q-20 -20 0 ' + f(36 + 8 * Math.sin(t * 3)) + ' Q20 -20 60 -20" stroke="' + INK + '" stroke-width="4" fill="none"/>', k3);
  s += G("", arrow(320, 250, 320, 330, ORANGE, 7, 1), k4) + G("translate(320 560) scale(.62) translate(-330 -440)", cut(t, { depth: 120, pocket: 1, hairs: 6, w: 78 - 16 * Math.abs(Math.sin(t * 3)), inflame: .5 + .5 * Math.sin(t * 4) }) + hair(330 + 30 * Math.sin(t * 2), lerp(100, 380, (t * .7) % 1), t * 160, 50, 5, 3.4), 1);
  return s;
}, { tr: "out" });
// 23 · the odd fact: WWII, «jeep disease», more than 70,000 US soldiers in hospital
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  // real scale: the soldier H = 400·0.72 units ≈ 1.75 m, so 1 m = 164.6 units; the jeep is drawn in metres at the same scale
  var sp = 0.72, m = 400 * sp / 1.75, GY = 650, bb = 3 * Math.abs(Math.sin(t * 7)), J = jeep(24, GY, m, t);
  var hipX = 24 + 1.9 * m, hipY = J.seat - 6 - bb, wh = [J.wheel[0], J.wheel[1] - bb];
  var sol = fig({ x: hipX, y: hipY, s: sp, lean: 8, shirt: "#7d7a52", pants: "#6b6a48", hair: "#5b5f3a", hs: "helmet", sleeves: "long", grip: [1, 1],
    legs: [[96, -34], [92, -32]], hands: [[wh[0] + 4, wh[1] + 6], [wh[0] + 10, wh[1] + 10]], expr: "focus" });
  var s = paper() + floor(GY) + '<path d="M-400 ' + GY + ' H1040" stroke="' + INK + '" stroke-width="2" stroke-dasharray="30 20" stroke-dashoffset="' + f(t * 200) + '"/>';
  s += G("translate(0 " + f(-bb) + ")", J.back) + sol.far + sol.body + G("translate(0 " + f(-bb) + ")", J.front + '<path d="M' + f(J.dash[0]) + ' ' + f(J.dash[1]) + ' L' + f(J.wheel[0]) + ' ' + f(J.wheel[1]) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>') +
    '<ellipse cx="' + f(wh[0]) + '" cy="' + f(wh[1]) + '" rx="5" ry="22" transform="rotate(22 ' + f(wh[0]) + ' ' + f(wh[1]) + ')" fill="none" stroke="' + INK + '" stroke-width="4"/>' + sol.near;
  s += bigNum(count(70000, at(u, .8, 1.6)), "جندي", 320, 150, at(u, .6, .3), ORANGE, 64) + tag("مرض الجيب", 320, 290, at(u, 3.4, .3), 30, ORANGE);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: someone seated on a chair; a sore spot pulses over the end of the spine. 1: inset — the swelling, pus. 2: inset — hair pulled out of it
  var s = '<path d="M-20 600 H640" stroke="' + INK + '" stroke-width="2.4"/>' + R(-20, 600, 660, 80, "#e3d7bd", 0);
  var wince = 4 * Math.sin(t * 3.4), sh = 2.5 * Math.sin(t * 13), p = fig({ x: 260 + sh, y: 478, lean: 6 + wince, shirt: SHIRT_V, legs: [[84, -84], [80, -80]], hands: [rel(26, -31), rel(20, 58)], expr: "pain", tilt: -6 });
  s += chair(285, 492) + p.far + p.body + p.near;
  var sp = p.at(22, -30); s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(20 + 12 * Math.sin(t * 6)) + '" fill="' + ORANGE + '" opacity=".4"/>' + C(sp[0], sp[1], 7, ORANGE, 1.6);
  if (li >= 1) { var u = t - LN[1].start, k = ease(u / .4);
    var o = { depth: 110, pocket: 1, pus: 1, hairs: li >= 2 ? 3 : 6, inflame: 1, bump: [346, 30 + 3 * Math.sin(t * 6), 60] };
    s += inset(470, 200, 130, G("scale(.7) translate(-336 -360)", cut(t, o)), k) + draw("M" + f(sp[0] + 10) + " " + f(sp[1] - 6) + " L380 280", k, INK, 1.6);
    if (li < 2) for (var i = 0; i < 3; i++) { var q = (t * .8 + i / 3) % 1; s += '<ellipse cx="' + f(470 + 2) + '" cy="' + f(160 - 30 * q) + '" rx="7" ry="9" fill="' + PUS + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f((1 - q) * k) + '"/>'; }
  }
  if (li >= 2) { var v = t - LN[2].start, pull = ease(v / 1.2);
    s += G("", tweezers(470, 150 - 60 * pull, 8) + hair(468, 150 - 60 * pull, 80, 60, 6, 3) + hair(476, 150 - 60 * pull, 100, 54, -6, 3), ease(v / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 110) scale(.36) translate(-330 -420)", cut(t, { depth: 110, pocket: 1, hairs: 4 + Math.floor(u * 3) % 3, inflame: .6 + .4 * Math.sin(t * 4) }));
};
SCENE.outro = function (svg, u, t) {
  var o = { depth: 120, pocket: 1, hairs: 6, w: 78 - 14 * Math.abs(Math.sin(t * 3)) };
  return G("translate(300 150) scale(.5) translate(-330 -400)", cut(t, o)) + hair(220 + 20 * Math.sin(t * 2), 30, 40, 40, 4, 2.6) +
    callout("1", 236, 30, ease(u / .3)) + callout("2", 140, 70, ease(u / .3 - .5)) + callout("3", 300, 110, ease(u / .3 - 1)) + callout("4", 340, 190, ease(u / .3 - 1.5));
};
