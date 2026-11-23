window.CHUNKS = [[0.0, 0.3438, 0.5938], [0.0, 0.6216], [0.0, 0.4194], [0.0, 0.4394], [0.0, 0.4255], [0.0], [0.0, 0.5333], [0.0, 0.3235, 0.75], [0.0, 0.619], [0.0, 0.2542], [0.0, 0.2174, 0.7391], [0.0, 0.375, 0.7812], [0.0, 0.3966], [0.0, 0.5968], [0.0], [0.0], [0.0, 0.2308, 0.7051], [0.0, 0.3922, 0.7843], [0.0, 0.3824, 0.5441, 0.7206], [0.0, 0.4727], [0.0, 0.2842, 0.6421], [0.0, 0.2295, 0.8361], [0.0, 0.1613, 0.4086, 0.6129, 0.8172], [0.0, 0.411, 0.6849], [0.0], [0.0]];
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

// ── «ليه الحبوب بتطلع في وشك وصاحبك لأ؟» — drawings. Skin follows the «طب إزاي؟» skin cut (sheet v20: a block of
// skin seen three-quarter, salmon epidermis with a wavy top, a paler dermis with a red vessel, round fat cells under it)
// and real histology (refs/SOURCES.md): a hair follicle with its sebaceous gland opening into the canal, sebum, a plug of
// sebum and dead cells (comedo), C. acnes in the closed canal, neutrophils leaving the vessel, a red swollen papule with pus.
// People: the shared person kit (videos/_templates/people/person.js), T-shirts as in the hook the user sent.

var EPI = "#d98f78", EPI_D = "#c27660", DERM = "#efcab2", DERM_D = "#e2b49a", FAT = "#e9dfba", FAT_D = "#cfc394",
    SEBUM = "#e7c860", SEBUM_L = "#f3e1a0", CANAL = "#f7eedb", HAIRC = "#4a3426", VESSEL = "#b9483a", BAC = "#6f7a3c", BAC_L = "#a3ad6a",
    PUS = "#f1e4b0", RED = "#c4553f", WBC = "#fbf8f1", WBC_N = "#9aa3b8", FLAKE = "#cfae86";
function hsh(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ── the skin block ──
// front face x 40..600; skin top y = SK.top; depth offset of the top face (DX, DY). o: {gland 1..1.7, sebum 0..1 (canal fill),
// flow (drops moving), plug 0..1, flakes 0..1, bac n (in the canal), surf n (bacteria on the top), wbc 0..1, red 0..1, pus 0..1,
// bump 0..1, sq 0..1 (fingers press), rupt 0..1, scar 0..1, soap 0..1, irrit 0..1}
var SK = { x0: 40, x1: 600, top: 250, fx: 300, dx: 56, dy: -62 };
function skin(o, t) {
  o = o || {}; t = t || 0;
  var x0 = SK.x0, x1 = SK.x1, T0 = SK.top, FX = SK.fx, DX = SK.dx, DY = SK.dy, E = T0 + 42, D1 = T0 + 330, B = T0 + 440;
  var bump = (o.bump || 0) * 34 + (o.sq || 0) * 10, scar = o.scar || 0;
  function sy(x) { var g = Math.exp(-Math.pow((x - FX) / 70, 2)); return T0 + 3 * Math.sin(x / 23) - bump * g + scar * 9 * Math.exp(-Math.pow((x - FX) / 30, 2)); }
  var front = "", s = "", i, x;
  for (x = x0; x <= x1; x += 8) front += (x === x0 ? "M" : " L") + f(x) + " " + f(sy(x));
  // top face (the surface seen from above), then the right side
  s += '<path d="' + front + ' L' + f(x1 + DX) + ' ' + f(T0 + DY) + ' L' + f(x0 + DX) + ' ' + f(T0 + DY) + ' Z" fill="' + (o.irrit ? "#e39a83" : EPI) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (i = 0; i < 9; i++) { var px = x0 + 50 + i * 60 + (i % 2) * 14, k = .25 + (i % 3) * .25; s += '<path d="M' + f(px + DX * k) + ' ' + f(T0 + DY * k + 2) + ' q6 -3 12 0" stroke="' + EPI_D + '" stroke-width="1.6" fill="none"/>'; }
  s += '<path d="M' + x1 + ' ' + f(sy(x1)) + ' L' + f(x1 + DX) + ' ' + f(T0 + DY) + ' L' + f(x1 + DX) + ' ' + f(B + DY) + ' L' + x1 + ' ' + B + ' Z" fill="' + DERM_D + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + x1 + ' ' + f(E) + ' L' + f(x1 + DX) + ' ' + f(E + DY) + ' M' + x1 + ' ' + D1 + ' L' + f(x1 + DX) + ' ' + f(D1 + DY) + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // front: fat, dermis, epidermis
  s += R(x0, D1, x1 - x0, B - D1, FAT, 2);
  for (i = 0; i < 12; i++) for (var j = 0; j < 2; j++) s += '<ellipse cx="' + f(x0 + 26 + i * 47 + j * 22) + '" cy="' + f(D1 + 32 + j * 52) + '" rx="21" ry="20" fill="#f4ecd0" stroke="' + FAT_D + '" stroke-width="1.6"/>';
  s += '<path d="' + front + ' L' + x1 + ' ' + D1 + ' L' + x0 + ' ' + D1 + ' Z" fill="' + DERM + '" stroke="' + INK + '" stroke-width="2"/>';
  s += hatch('M' + x0 + ' ' + (D1 - 60) + ' H' + x1 + ' V' + D1 + ' H' + x0 + ' Z').replace('fill="url(#hatch)"', 'fill="url(#hatch)" opacity=".25"');
  var ep = front; for (x = x1; x >= x0; x -= 8) ep += " L" + f(x) + " " + f(sy(x) + 40 + 4 * Math.sin(x / 31));
  s += '<path d="' + ep + ' Z" fill="' + (o.irrit ? "#df8f76" : EPI) + '" stroke="' + INK + '" stroke-width="2"/>';
  // the vessel along the bottom of the dermis (cut lengthwise), slightly pulsing
  var vy = D1 - 26, pul = 1 + .08 * Math.sin(t * 6);
  s += '<path d="M' + x0 + ' ' + vy + ' C200 ' + (vy - 18) + ' 420 ' + (vy + 18) + ' ' + x1 + ' ' + vy + '" stroke="' + INK + '" stroke-width="' + f(15 * pul) + '" fill="none"/><path d="M' + x0 + ' ' + vy + ' C200 ' + (vy - 18) + ' 420 ' + (vy + 18) + ' ' + x1 + ' ' + vy + '" stroke="' + VESSEL + '" stroke-width="' + f(11 * pul) + '" fill="none"/>';
  // inflammation glow behind the follicle
  if (o.red) { CLIPN++; var gid = "rg" + CLIPN; s += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="' + RED + '" stop-opacity=".55"/><stop offset="1" stop-color="' + RED + '" stop-opacity="0"/></radialGradient></defs><ellipse cx="' + FX + '" cy="' + (T0 + 140) + '" rx="' + f(230 * o.red * (1 + .03 * Math.sin(t * 3))) + '" ry="' + f(210 * o.red) + '" fill="url(#' + gid + ')"/>'; }
  // the follicle: funnel opening, canal down to the bulb
  var cb = T0 + 270, op = sy(FX), w0 = 26, w1 = 15;
  var canal = 'M' + f(FX - w0) + ' ' + f(op) + ' C' + f(FX - w1) + ' ' + f(op + 30) + ' ' + f(FX - w1) + ' ' + f(op + 40) + ' ' + f(FX - w1) + ' ' + f(op + 60) + ' L' + f(FX - w1 + 2) + ' ' + cb + ' Q' + FX + ' ' + (cb + 14) + ' ' + f(FX + w1 - 2) + ' ' + cb + ' L' + f(FX + w1) + ' ' + f(op + 60) + ' C' + f(FX + w1) + ' ' + f(op + 40) + ' ' + f(FX + w1) + ' ' + f(op + 30) + ' ' + f(FX + w0) + ' ' + f(op) + ' Z';
  var swell = Math.max(o.pus || 0, o.sq || 0);
  if (swell) s += '<ellipse cx="' + FX + '" cy="' + f(op + 100) + '" rx="' + f(16 + 34 * swell) + '" ry="' + f(70 + 30 * swell) + '" fill="' + PUS + '" stroke="' + INK + '" stroke-width="2"' + (o.rupt ? ' stroke-dasharray="6 5"' : '') + '/>';
  s += '<path d="' + canal + '" fill="' + CANAL + '" stroke="' + INK + '" stroke-width="2"/>';
  // sebum filling the canal from the bottom
  var sb = o.sebum || 0;
  if (sb > 0) { CLIPN++; var cid = "cc" + CLIPN, lvl = lerp(cb + 10, op - 4, sb); s += '<clipPath id="' + cid + '"><path d="' + canal + '"/></clipPath><g clip-path="url(#' + cid + ')">' + R(FX - 40, lvl, 80, cb + 20 - lvl, SEBUM, 0) + '<path d="M' + (FX - 40) + ' ' + f(lvl) + ' q10 ' + f(-3 * Math.sin(t * 3)) + ' 20 0 t20 0 t20 0 t20 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/></g>'; }
  if (swell) s += '<ellipse cx="' + FX + '" cy="' + f(op + 110) + '" rx="' + f(10 + 26 * swell) + '" ry="' + f(55 + 26 * swell) + '" fill="' + PUS + '" opacity=".85"/>';
  // the hair: bulb at the bottom, shaft up out of the skin
  s += '<ellipse cx="' + FX + '" cy="' + (cb + 2) + '" rx="13" ry="10" fill="' + BROWN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + FX + ' ' + cb + ' L' + (FX + 2) + ' ' + f(op + 20) + ' Q' + (FX + 4) + ' ' + f(op - 40) + ' ' + f(FX + 22 + 3 * Math.sin(t * 1.3)) + ' ' + f(op - 110) + '" stroke="' + HAIRC + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  // the gland: lobes beside the canal, a short duct into it
  var g = o.gland || 1, gx = FX + 40 + 30 * g, gy = T0 + 150, br = 1 + .03 * Math.sin(t * 2.2);
  s += '<path d="M' + (FX + w1 - 1) + ' ' + (gy - 22) + ' Q' + f(gx - 20 * g) + ' ' + (gy - 26) + ' ' + f(gx - 26 * g) + ' ' + (gy - 8) + '" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M' + (FX + w1 - 3) + ' ' + (gy - 22) + ' Q' + f(gx - 20 * g) + ' ' + (gy - 26) + ' ' + f(gx - 26 * g) + ' ' + (gy - 8) + '" stroke="' + SEBUM_L + '" stroke-width="8" fill="none"/>';
  var lobes = [[0, 0, 24], [20, -14, 18], [22, 14, 19], [-4, 22, 16], [-2, -20, 16]];
  var lb = lobes.map(function (q) { return C(gx + q[0] * g * br, gy + q[1] * g * br, q[2] * g * br, SEBUM_L, 2); }).join("");
  s += lb + lobes.map(function (q) { return '<circle cx="' + f(gx + q[0] * g * br) + '" cy="' + f(gy + q[1] * g * br) + '" r="' + f(q[2] * g * br - 1.5) + '" fill="' + SEBUM_L + '"/>'; }).join("");
  for (i = 0; i < 10; i++) s += '<circle cx="' + f(gx + (hsh(i) - .5) * 44 * g) + '" cy="' + f(gy + (hsh(i + 9) - .5) * 44 * g) + '" r="2.4" fill="' + SEBUM + '"/>';
  // sebum drops: from the gland, along the duct, up the canal and out over the skin
  if (o.flow) for (i = 0; i < 6; i++) {
    var p = (t * .35 + i / 6) % 1, dxp, dyp;
    if (p < .3) { dxp = lerp(gx - 20 * g, FX + 4, p / .3); dyp = gy - 20; } else if (p < .8) { dxp = FX + 6; dyp = lerp(gy - 20, op + 2, (p - .3) / .5); } else { dxp = lerp(FX + 6, FX + 6 + 120 * (i % 2 ? 1 : -1), (p - .8) / .2); dyp = sy(dxp) - 4; }
    s += G("", '<ellipse cx="' + f(dxp) + '" cy="' + f(dyp) + '" rx="6" ry="7.5" fill="' + SEBUM + '" stroke="' + INK + '" stroke-width="1.4"/>', o.flow * Math.min(1, Math.sin(p * Math.PI) * 3));
  }
  // dead skin cells: flat flakes along the canal walls, piling at the opening
  if (o.flakes) for (i = 0; i < 12; i++) { var fy = lerp(op + 70, op + 4, hsh(i + 30)), fx2 = FX + (i % 2 ? 1 : -1) * (6 + 5 * hsh(i + 40)), fk = clamp(o.flakes * 1.6 - i / 12); s += G("translate(" + f(fx2) + " " + f(fy) + ") rotate(" + f((hsh(i) - .5) * 60) + ")", '<path d="M-9 -3 L7 -4 L10 2 L-6 4 Z" fill="' + FLAKE + '" stroke="' + INK + '" stroke-width="1.2"/>', fk); }
  // the plug at the opening
  if (o.plug) s += G("", '<path d="M' + f(FX - w0 - 2) + ' ' + f(op - 3) + ' Q' + FX + ' ' + f(op - 14) + ' ' + f(FX + w0 + 2) + ' ' + f(op - 3) + ' C' + f(FX + w1 + 2) + ' ' + f(op + 26) + ' ' + f(FX + w1) + ' ' + f(op + 36) + ' ' + f(FX + w1 - 2) + ' ' + f(op + 44) + ' Q' + FX + ' ' + f(op + 50) + ' ' + f(FX - w1 + 2) + ' ' + f(op + 44) + ' C' + f(FX - w1) + ' ' + f(op + 36) + ' ' + f(FX - w1 - 2) + ' ' + f(op + 26) + ' ' + f(FX - w0 - 2) + ' ' + f(op - 3) + ' Z" fill="#c9a865" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + (FX - 10) + ' ' + f(op + 10) + ' l8 -3 M' + (FX + 2) + ' ' + f(op + 24) + ' l9 -2 M' + (FX - 8) + ' ' + f(op + 34) + ' l7 2" stroke="' + INK + '" stroke-width="1.3"/>', o.plug);
  // bacteria: rods in the canal (in the sebum) and on the surface
  function rod(x, y, a, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + f(sc || 1) + ")", '<rect x="-7" y="-3" width="14" height="6" rx="3" fill="' + BAC_L + '" stroke="' + BAC + '" stroke-width="1.6"/>'); }
  var nb = Math.round(o.bac || 0);
  for (i = 0; i < nb; i++) { var by = lerp(op + 50, cb - 8, hsh(i + 70)), bx = FX + (hsh(i + 80) - .5) * 20 + 1.5 * Math.sin(t * 3 + i); if (swell) { bx = FX + (hsh(i + 80) - .5) * (20 + 40 * swell); by = lerp(op + 40, op + 170, hsh(i + 70)); } s += rod(bx, by + 1.5 * Math.cos(t * 2.6 + i), hsh(i + 90) * 180 + 10 * Math.sin(t + i), .8); }
  var ns = Math.round(o.surf || 0);
  for (i = 0; i < ns; i++) { var kx = hsh(i + 200), ky = hsh(i + 210), sx = x0 + 30 + kx * (x1 - x0 - 60), syy = lerp(sy(sx), T0 + DY, ky) - 4; s += rod(sx + ky * DX + 2 * Math.sin(t * 2 + i), syy, hsh(i + 220) * 180, .8); }
  // white blood cells: out of the vessel, gathering round the canal
  if (o.wbc) for (i = 0; i < 9; i++) {
    var k2 = clamp(o.wbc * 1.5 - i * .06), ax = 120 + i * 45, ay = vy, ang = i * .7, tx = FX + Math.cos(ang) * (36 + 12 * (i % 3)), ty = op + 110 + Math.sin(ang) * 70;
    var wx = lerp(ax, tx, ease(k2)) + 2 * Math.sin(t * 2 + i), wy = lerp(ay, ty, ease(k2)) + 2 * Math.cos(t * 2.4 + i);
    s += G("", C(wx, wy, 11, WBC, 1.8) + '<path d="M' + f(wx - 5) + ' ' + f(wy) + ' q2 -5 5 0 q3 5 5 0" stroke="' + WBC_N + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>', Math.min(1, k2 * 4));
  }
  // pus leaking deeper after a squeeze
  if (o.rupt) for (i = 0; i < 9; i++) { var rk = clamp(o.rupt * 1.4 - i * .05), ra = Math.PI * (.15 + .7 * i / 8); s += G("", C(FX + Math.cos(ra) * (60 + 110 * rk), op + 150 + Math.sin(ra) * (30 + 90 * rk), 7, PUS, 1.6), rk); }
  if (scar) s += G("", '<path d="M' + (FX - 60) + ' ' + f(T0 + 46) + ' Q' + FX + ' ' + f(T0 + 90) + ' ' + (FX + 60) + ' ' + f(T0 + 46) + '" stroke="#b46a58" stroke-width="5" fill="none" stroke-linecap="round"/>', scar);
  // soap foam on top
  if (o.soap) for (i = 0; i < 16; i++) { var bk = hsh(i + 300), bx2 = x0 + 20 + bk * (x1 - x0 - 20), by2 = lerp(sy(bx2), T0 + DY, hsh(i + 310)) - 8 - 4 * Math.sin(t * 2 + i); s += G("", C(bx2 + hsh(i + 310) * DX, by2, 7 + 9 * hsh(i + 320), "#fbf8f1", 1.4), clamp(o.soap * 2 - i / 16)); }
  // fingers pressing from both sides
  if (o.sq) { var pz = o.sq * 45; [-1, 1].forEach(function (sd) {
    var fxp = FX + sd * (230 - pz), fyp = T0 - 26;
    s += G("translate(" + f(fxp) + " " + f(fyp) + ") scale(" + (-sd) + " 1)", '<path d="M-170 -34 L-10 -34 C26 -34 40 -14 40 4 C40 24 24 34 -10 34 L-170 34 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M8 -26 C26 -24 30 -6 28 4 C26 14 18 20 8 20 C0 14 -2 -18 8 -26 Z" fill="#f2d2c0" stroke="' + INK + '" stroke-width="1.6"/><path d="M-60 -10 q-6 10 0 20 M-80 -10 q-6 10 0 20" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>');
  }); }
  return s;
}
function skinMini(x, y, sc, o, t) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", skin(o, t)); }
var OP = function () { return SK.top; };   // the pore opening height

// ── people (shared person kit), T-shirts ──
var SPOTS = [[-10, 9], [11, 7], [-7, 16], [9, 17], [-13, 1], [13, 0], [2, 21], [-3, -13], [6, -15], [-15, 11], [15, 12], [-1, 15]];
var MATE = { shirt: "#9fb38a", shirtD: "#7d9168" };
function pimples(hc, s, n, t, scale, hand) {
  var out = "", m = Math.floor(n), fr = n - m;
  for (var i = 0; i < Math.min(Math.ceil(n), SPOTS.length); i++) {
    if (hand && SPOTS[i][1] < -5) continue;
    var p = SPOTS[i], k = i < m ? 1 : fr, x = hc[0] + p[0] * s, y = hc[1] + p[1] * s, r = (2.2 + 1 * hsh(i)) * s * (scale || 1) * (1 + .06 * Math.sin(t * 2 + i));
    out += G("", '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.9) + '" fill="' + RED + '" opacity=".28"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + RED + '"/>' + (i % 3 === 0 ? '<circle cx="' + f(x - r * .25) + '" cy="' + f(y - r * .3) + '" r="' + f(r * .4) + '" fill="' + PUS + '"/>' : ""), k);
  }
  return out;
}
var LASTHEAD = [0, 0];
// o: {spots, hand (on the forehead), brows, mouth, mate (the friend's shirt), turn, outfit}
function boy(x, y, s, t, o) {
  o = o || {};
  var q = { x: x, y: y, s: s, legs: "stand", outfit: o.outfit || { base: "casual", colors: o.mate ? MATE : {} }, breath: (Math.sin(t * 1.7 + x) + 1) / 2,
    head: { tilt: (o.tilt || 0) + 1.6 * Math.sin(t * .9 + x * .01), turn: o.turn || 0 },
    face: { eyes: ((t + x * .003) * 1000) % 3900 < 130 ? .05 : (o.eyes == null ? 1 : o.eyes), brows: o.brows || "neutral", mouth: o.mouth || "neutral", look: o.look || [0, 0] } };
  if (o.hand) { var gh = PERSON.front(q).joints.head; q.arms = [{}, { to: [gh[0] + 23 * s, gh[1] - 13 * s], bend: 1, hand: "flat", front: true, rot: -168, palm: true }]; }
  if (o.arms) q.arms = o.arms;
  var P = PERSON.front(q); LASTHEAD = P.joints.head;
  return P.svg + pimples(P.joints.head, s, o.spots || 0, t, 1, o.hand);
}
// a bust in a clipped frame (for the grid of faces and photo frames)
function bust(cx, cy, w, h, s, t, o, frame) {
  CLIPN++; var id = "bc" + CLIPN;
  return '<clipPath id="' + id + '"><rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath>' + R(cx - w / 2, cy - h / 2, w, h, frame || "#f4ecdb", 2) +
    '<g clip-path="url(#' + id + ')">' + boy(cx, cy - h / 2 + 14 * s + 192 * s, s, t, o) + '</g>' + R(cx - w / 2, cy - h / 2, w, h, "none", 2.4);
}

// ── props ──
function burger(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-40 -2 C-40 -30 40 -30 40 -2 Z" fill="#d79b52" stroke="' + INK + '" stroke-width="2.2"/><path d="M-28 -16 l3 -2 M-8 -20 l3 -2 M14 -17 l3 -2" stroke="#f4ecdb" stroke-width="2.4" stroke-linecap="round"/>' + R(-44, -2, 88, 8, "#7d9a52", 2, 3) + R(-42, 6, 84, 10, "#7a4a32", 2, 4) + '<path d="M-40 16 L40 16 C40 30 -40 30 -40 16 Z" fill="#d79b52" stroke="' + INK + '" stroke-width="2.2"/>'); }
function soapBar(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-46 -6 L-30 -24 L50 -24 L34 -6 Z" fill="#cfe3e8" stroke="' + INK + '" stroke-width="2.2"/>' + R(-46, -6, 80, 28, "#a9cdd6", 2.2, 3) + '<path d="M34 -6 L50 -24 L50 4 L34 22 Z" fill="#8fb7c2" stroke="' + INK + '" stroke-width="2.2"/>' + C(-30, -32, 8, "#fbf8f1", 1.6) + C(-14, -40, 6, "#fbf8f1", 1.6) + C(4, -34, 9, "#fbf8f1", 1.6)); }
function chocolate(x, y, sc) { var s = '<path d="M-50 -30 L30 -30 L50 -14 L50 34 L-30 34 L-50 18 Z" fill="#5a3826" stroke="' + INK + '" stroke-width="2.2"/>'; for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) s += R(-44 + i * 26, -24 + j * 26, 22, 22, "#6e4630", 1.6, 2); return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s + '<path d="M-50 18 L-50 34 L30 34 L50 18" fill="#c9c3b6" stroke="' + INK + '" stroke-width="2"/>'); }
function dna(x, y, h, t, sc) { var s = ""; for (var i = 0; i <= 12; i++) { var yy = y - h / 2 + i * h / 12, a = t * 1.6 + i * .55, xa = x + Math.sin(a) * 22 * (sc || 1), xb = x - Math.sin(a) * 22 * (sc || 1); s += '<path d="M' + f(xa) + ' ' + f(yy) + ' L' + f(xb) + ' ' + f(yy) + '" stroke="' + (i % 2 ? OLIVE : ORANGE) + '" stroke-width="3"/>' + C(xa, yy, 4.5, BLUE, 1.4) + C(xb, yy, 4.5, "#c9a865", 1.4); } return s; }
function gauge(x, y, r, v, label2) { var a = Math.PI * (1 + v); return P("M" + f(x - r) + " " + f(y) + " A" + r + " " + r + " 0 0 1 " + f(x + r) + " " + f(y), "#f4ecdb", 2.4) + '<path d="M' + f(x - r + 6) + ' ' + y + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + f(x) + ' ' + f(y - r + 6) + '" stroke="' + OLIVE + '" stroke-width="6" fill="none"/><path d="M' + f(x) + ' ' + f(y - r + 6) + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + f(x + r - 6) + ' ' + y + '" stroke="' + ORANGE + '" stroke-width="6" fill="none"/>' +
  '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 14)) + ' ' + f(y + Math.sin(a) * (r - 14)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 6, INK, 0) + (label2 ? T(label2, x, y + 34, 22, INK, 700) : ""); }
function moonIcon(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M10 -30 A32 32 0 1 0 30 18 A26 26 0 1 1 10 -30 Z" fill="#f0c66a" stroke="' + INK + '" stroke-width="2.4"/>' + T("z", 34, -26, 22, BLUE, 800) + T("z", 46, -44, 16, BLUE, 800)); }
function calendar(x, y, sc, t) { var s = R(-40, -34, 80, 74, "#f4ecdb", 2.4, 4) + R(-40, -34, 80, 18, ORANGE, 2.4, 4) + '<path d="M-24 -42 v14 M24 -42 v14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) s += C(-27 + i * 18, -2 + j * 16, 4.5, i === 2 && j === 1 ? RED : "#d8ccae", 1); return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }
function stressIcon(x, y, sc, t) { var s = ""; for (var i = 0; i < 3; i++) s += '<path d="M' + f(-30 + i * 22) + ' ' + f(-30 + 3 * Math.sin(t * 8 + i)) + ' l8 -14 l-4 12 l10 -4" stroke="' + ORANGE + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s + P("M-34 0 C-40 -20 -10 -24 0 -12 C10 -26 40 -20 34 0 C40 20 10 30 0 18 C-14 30 -40 18 -34 0 Z", "#f4ecdb", 2.4) + '<path d="M-20 0 q6 -8 12 0 t12 0 t12 0" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'); }
function plate(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<ellipse cx="0" cy="0" rx="60" ry="18" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="0" cy="-2" rx="38" ry="10" fill="#e8dcc0" stroke="' + INK + '" stroke-width="1.4"/>' + burger(0, -18, .55)); }
// the kitchen sink and its trap, cut open from the side
function sink(t, k) {
  var s = '<path d="M60 150 L580 150 L520 330 L120 330 Z" fill="#c9cdd0" stroke="' + INK + '" stroke-width="2.6"/><path d="M84 162 L556 162 L504 318 L136 318 Z" fill="#e3e6e6" stroke="' + INK + '" stroke-width="1.6"/>';
  var wl = lerp(316, 230, k); s += '<path d="M' + f(lerp(136, 104, (316 - wl) / 154)) + ' ' + f(wl) + ' L' + f(lerp(504, 536, (316 - wl) / 154)) + ' ' + f(wl) + ' L504 318 L136 318 Z" fill="#9fc0cf" opacity=".85"/>' + wave(lerp(136, 110, (316 - wl) / 154), wl, lerp(504, 530, (316 - wl) / 154), wl, t, BLUE, 3, 40, 1, 2);
  // pipe down, U-trap, out to the wall
  var pipe = "M300 330 L300 470 Q300 560 380 560 Q460 560 460 470 L460 430 L600 430";
  s += '<path d="' + pipe + '" stroke="' + INK + '" stroke-width="52" fill="none"/><path d="' + pipe + '" stroke="#e3e6e6" stroke-width="46" fill="none"/>';
  s += '<path d="M300 330 L300 470 Q300 556 380 556" stroke="#9fc0cf" stroke-width="40" fill="none" opacity=".8"/>';
  s += '<path d="' + pipe + '" stroke="' + SEBUM + '" stroke-width="46" fill="none" stroke-dasharray="1 0" opacity=".0"/>';
  // grease coating and the clump in the bend
  s += '<path d="M277 360 L277 470 Q277 578 380 582 Q483 578 483 470 L483 430 L600 430" stroke="' + SEBUM + '" stroke-width="10" fill="none" opacity=".95"/>';
  s += '<path d="M323 360 L323 470 Q323 535 380 536 Q437 535 437 470 L437 452 L600 452" stroke="' + SEBUM + '" stroke-width="8" fill="none"/>';
  s += G("", '<ellipse cx="380" cy="556" rx="64" ry="22" fill="' + SEBUM + '" stroke="' + INK + '" stroke-width="2"/>' + C(356, 552, 7, BROWN, 1.4) + C(384, 562, 6, "#7d9a52", 1.4) + C(404, 550, 7, BROWN, 1.4) + C(372, 566, 5, "#c06a3a", 1.4), k);
  s += R(270, 322, 60, 12, "#9a9e9f", 2, 3);
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
var BY = 800, BS = 2.1;   // the waist-up boys
// 3 · under the skin of your face: start on his face, magnify a patch
shot(3, push(320, 420, 1.0, 1.25), function (u, d, t) {
  var s = paper() + boy(320, BY + 40, 2.5, t, { spots: 0 }), h = LASTHEAD, k = at(u, .8, .6);
  return s + G("", '<circle cx="' + f(h[0] + 24) + '" cy="' + f(h[1] + 20) + '" r="18" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>', k) +
    G("", '<path d="M' + f(h[0] + 36) + ' ' + f(h[1] + 32) + ' L520 560" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="6 5"/>' + inset(520, 620, 110, skinMini(-SK.fx * .55, -(OP() + 70) * .55, .55, {}, t), at(u, 1.2, .6)), k);
});
shot([3, 1], push(330, 380, .92, 1.0), function (u, d, t) {
  return paper() + skin({}, t) + label(SK.fx - 18, OP() + 4, 120, 140, "المسام", INK, at(u, .2, .5), 26) +
    label(SK.fx + 22, OP() - 90, 470, 110, "شعرة", INK, at(u, .6, .5), 26) + label(SK.fx + 100, OP() + 150, 520, 330, "غدة دهنية", OLIVE, at(u, 1.1, .5), 28) +
    label(80, OP() + 20, 110, 640, "الجلد", INK, at(u, 1.5, .5), 22);
}, { tr: "in" });
// 4 · the gland makes oil that keeps the skin soft
shot(4, push(340, 380, 1.05, 1.15), function (u, d, t) {
  return paper() + skin({ flow: at(u, .3, .5), sebum: .1 }, t) + label(SK.fx + 96, OP() + 150, 500, 190, "دهن", ORANGE, at(u, .6, .5), 30) +
    G("", tag("بيحمي الجلد", 330, 110, 1, 26, OLIVE), at(u, 1.8, .4));
});
// 5 · so how does a pimple start?
shot(5, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + dim(.55, skin({ flow: 1, sebum: .1 }, t)) + G("", N("؟", 320 + 6 * Math.sin(t * 2), 200, 170, ORANGE), at(u, .1, .4));
}, { tr: "out" });
// 6 · puberty hormones: the gland grows and makes more oil
hud(6, 7, function (u, t) { return tag("هرمونات المراهقة", 320, 70, at(u, .2, .3), 28, ORANGE); });
shot(6, push(390, 400, 1.12, 1.2), function (u, d, t) {
  var g = lerp(1, 1.6, at(u, .8, 1.6)), hs = "";
  for (var i = 0; i < 8; i++) { var p = (t * .3 + i / 8) % 1, hx = 120 + i * 55, hy = lerp(SK.top + 304, SK.top + 150, p); hs += G("translate(" + f(hx + 12 * Math.sin(t + i)) + " " + f(hy) + ")", '<path d="M0 -8 L7 -4 L7 4 L0 8 L-7 4 L-7 -4 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.4"/>', Math.sin(p * Math.PI) * at(u, .2, .4)); }
  return paper() + skin({ gland: g, flow: 1, sebum: lerp(.1, .45, at(u, 1, 2.4)) }, t) + hs + label(SK.fx + 110, OP() + 170, 470, 560, "الغدة بتكبر", OLIVE, at(u, 1.6, .5), 26);
});
// 7 · about 8 in 10 teenagers get spots, not equally
var FACES = [3, 0, 6, 2, 9, 1, 4, 0, 5, 2];
shot(7, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + numBox("8 / 10", 320, 110, at(u, .2, .4), 42);
  for (var i = 0; i < 10; i++) { var cx = 82 + (i % 5) * 119, cy = 300 + Math.floor(i / 5) * 230, k = at(u, .3 + i * .12, .3), n = i === 1 || i === 7 ? 0 : FACES[i] * at(u, .8 + i * .08, .8);
    s += G("", bust(cx, cy, 108, 200, 1.45, t + i, { spots: n, mate: i % 2, brows: n > 3 ? "worried" : "neutral", mouth: n > 3 ? "frown" : "smile" }), k); if (i === 1 || i === 7) s += check(cx + 34, cy - 80, .6, at(u, 2.6, .4), OLIVE); }
  return s;
});
// 8 · extra oil mixes with dead skin cells and plugs the pore
shot(8, push(SK.fx, OP() + 60, 1.7, 1.95), function (u, d, t) {
  return paper() + skin({ gland: 1.6, flow: 1, sebum: .55, flakes: at(u, .3, 1.6), plug: at(u, 2.2, .8) }, t) +
    label(SK.fx - 16, OP() + 40, 200, OP() + 150, "جلد ميت", INK, at(u, .9, .4), 20) + label(SK.fx + 14, OP() + 4, 400, OP() - 60, "سدادة", ORANGE, at(u, 2.6, .4), 26);
}, { tr: "in" });
// 9 · like the kitchen sink: grease and scraps block the pipe
shot(9, push(330, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + sink(t, at(u, .4, 2.4)) + label(380, 556, 220, 660, "زيت + بواقي أكل", ORANGE, at(u, 1.4, .5), 24) +
    inset(100, 100, 80, skinMini(-SK.fx * .4, -(OP() + 30) * .4, .4, { plug: 1, sebum: .6, gland: 1.6 }, t), at(u, .3, .4));
});
// 10 · bacteria live on everyone's skin and eat the oil
shot(10, push(330, 360, 1.0, 1.12), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .55, plug: 0, surf: 22 * at(u, .2, 1), bac: 6 * at(u, 2, 1), flow: 1 }, t) +
    label(150, OP() - 30, 200, 120, "بكتيريا", OLIVE, at(u, .6, .5), 28) + G("", tag("على جلد كل الناس", 400, 110, 1, 24, INK), at(u, 1.3, .4));
}, { tr: "out" });
// 11 · the door shuts: lots of food, no air, they multiply
hud(11, 12, function (u, t) { var k = at(u, .8, 2.6); return numBox(Math.round(lerp(6, 320, k * k)) + "", 520, 90, at(u, .2, .3), 38) + T("بكتيريا", 520, 140, 20, OLIVE, 700); });
shot(11, push(SK.fx, OP() + 120, 1.55, 1.75), function (u, d, t) {
  var k = at(u, .8, 2.6);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: lerp(6, 46, k * k) }, t) + G("", C(SK.fx - 120, OP() - 40, 22, "#e6eef2", 2) + T("هوا", SK.fx - 120, OP() - 32, 18, BLUE, 800), at(u, .4, .3)) + cross(SK.fx - 120, OP() - 40, .7, at(u, .9, .4));
}, { tr: "in" });
// 12 · the immune system sends an army of white cells
shot(12, push(330, 420, 1.05, 1.15), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 46, wbc: at(u, .6, 2.6) }, t) +
    label(150, SK.top + 300, 240, 650, "كرات الدم البيضا", BLUE, at(u, 1, .5), 24) + G("", tag("جهاز المناعة", 320, 110, 1, 28, BLUE), at(u, .2, .4));
});
// 13 · red, swollen, pus = the pimple; then back out to the face
shot(13, push(SK.fx, OP() + 60, 1.1, 1.3), function (u, d, t) {
  var k = at(u, .2, 1.6);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 46, wbc: 1, red: k, bump: k, pus: at(u, .9, 1.2) }, t) +
    label(SK.fx + 30, OP() + 100, 420, 580, "صديد", ORANGE, at(u, 1.5, .4), 26) + label(SK.fx + 120, OP() - 10, 440, 150, "بيحمر", RED, at(u, .7, .4), 26);
});
shot([13, 1], push(320, 460, 1.4, 1.2), function (u, d, t) {
  var s = paper() + boy(320, BY + 80, 2.6, t, { spots: 4, brows: "worried", mouth: "frown" }), h = LASTHEAD;
  return s + G("", '<circle cx="' + f(h[0] - 10 * 2.6) + '" cy="' + f(h[1] + 9 * 2.6) + '" r="22" fill="none" stroke="' + ORANGE + '" stroke-width="3.5"/>', at(u, .5, .4));
}, { tr: "out" });
// 14 · so why not your friend?
shot(14, push(320, 430, 1.0, 1.05), function (u, d, t) {
  return paper() + boy(185, BY, BS, t, { spots: 10, hand: true, brows: "worried", mouth: "frown" }) + boy(470, BY, BS, t + 1, { mate: 1, mouth: "smile" }) +
    numBox("10", 185, 690, 1, 30, true) + numBox("0", 470, 690, 1, 30, true) + G("", N("؟", 470, 200, 110, ORANGE), at(u, .2, .3));
});
// 15 · the same bacteria are on his face right now
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + boy(185, BY, BS, t, { spots: 10, hand: true, brows: "worried", mouth: "frown" }), h1 = LASTHEAD;
  s += boy(470, BY, BS, t + 1, { mate: 1, mouth: "smile" }); var h2 = LASTHEAD;
  function bugs(n) { var r = ""; for (var i = 0; i < n; i++) r += G("translate(" + f((hsh(i) - .5) * 90 + 3 * Math.sin(t * 2 + i)) + " " + f((hsh(i + 5) - .5) * 90) + ") rotate(" + f(hsh(i + 9) * 180) + ")", '<rect x="-9" y="-4" width="18" height="8" rx="4" fill="' + BAC_L + '" stroke="' + BAC + '" stroke-width="1.8"/>'); return R(-80, -80, 160, 160, "#efcab2", 0) + r; }
  [h1, h2].forEach(function (h, j) { var cx = j ? 520 : 140, k = at(u, .3 + j * .5, .5);
    s += G("", '<path d="M' + f(h[0] + (j ? 20 : -20)) + ' ' + f(h[1] + 20) + ' L' + cx + ' 210" stroke="' + OLIVE + '" stroke-width="2.4" stroke-dasharray="6 5"/>' + inset(cx, 170, 70, bugs(12), 1) + check(cx + 50, 110, .55, at(u, 1 + j * .5, .4), OLIVE), k); });
  return s + G("", tag("نفس البكتيريا", 330, 330, 1, 26, OLIVE), at(u, 1.6, .4));
});
// 16 · the difference is genes: how much oil, whether the plug forms
shot(16, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, 1.6);
  return paper() + G("", dna(170, 190, 200, t) + dna(470, 190, 200, t + .7), at(u, .1, .4)) + G("", tag("الجينات", 320, 70, 1, 30, ORANGE), at(u, .3, .3)) +
    G("", skinMini(170 - SK.fx * .38, 330 - OP() * .38, .38, { gland: lerp(1, 1.7, k), sebum: lerp(.2, .7, k), plug: at(u, 2.4, .6), flow: 1 }, t) + skinMini(470 - SK.fx * .38, 330 - OP() * .38, .38, { gland: 1, sebum: .2, flow: 1 }, t + .5), at(u, .5, .4)) +
    gauge(170, 640, 60, lerp(.3, .85, k), "غددك") + gauge(470, 640, 60, .3, "غدد صاحبك");
});
// 17 · if your dad or mum had spots, your chances are higher
shot(17, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + G("", bust(320, 200, 190, 230, 1.15, t, { spots: 7, outfit: "office", brows: "worried", mouth: "frown" }, "#e7dcc4") + T("أبوك زمان", 320, 345, 22, INK, 700) + T("(أو أمك)", 320, 375, 20, MUTE, 700), at(u, .1, .4)) +
    G("", dna(320, 470, 120, t, .7) + arrow(320, 420, 320, 535, ORANGE, 4, 1), at(u, .9, .4)) +
    G("", bust(320, 650, 190, 200, 1.1, t + 2, { spots: 6, brows: "worried" }) + numBox("↑", 470, 650, 1, 44), at(u, 1.6, .4));
});
// 18 · more triggers: stress, little sleep, the period
shot(18, push(320, 400, .9, .95), function (u, d, t) {
  var k1 = at(u, .9, .3), k2 = at(u, 1.9, .3), k3 = at(u, 3.0, .3);
  return paper() + boy(320, BY + 20, BS, t, { spots: 3 + k1 + k2 + k3, brows: "worried", mouth: "frown" }) +
    iconBox(95, 210, 120, stressIcon(0, 4, 1.2, t), k1) + G("", T("توتر", 95, 310, 26, ORANGE, 800), k1) +
    iconBox(320, 110, 120, moonIcon(-8, 8, 1.1), k2) + G("", T("قلة نوم", 320, 210, 26, BLUE, 800), k2) +
    iconBox(545, 210, 120, calendar(0, 4, 1.1, t), k3) + G("", T("الدورة", 545, 310, 26, RED, 800), k3);
});
// 19 · the myth: dirt or chocolate. No.
shot(19, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + soapBar(180, 330 + 4 * Math.sin(t * 2), 1.6) + chocolate(460, 330 + 4 * Math.cos(t * 2), 1.6) + G("", T("الوساخة", 180, 460, 30, INK, 800) + T("الشوكولاتة", 460, 460, 30, INK, 800), at(u, .3, .4)) +
    cross(180, 330, 1.2, at(u, 2.2, .4)) + cross(460, 330, 1.2, at(u, 2.6, .4)) + G("", tag("لأ", 320, 600, 1, 48, ORANGE), at(u, 2.9, .3));
});
// 20 · the plug forms inside the pore; scrubbing irritates; food matters little
shot(20, push(SK.fx, OP() + 50, 1.3, 1.45), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .6, plug: 1, soap: at(u, .2, 1), flow: 1 }, t) + label(SK.fx + 14, OP() + 30, 420, OP() + 220, "جوه", ORANGE, at(u, .8, .4), 30);
});
shot([20, 1], push(330, 360, 1.05, 1.12), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .6, plug: 1, soap: 1, irrit: 1, red: .5 * at(u, .3, 1) }, t) + G("", tag("بيهيّج الجلد", 320, 110, 1, 28, RED), at(u, .5, .4));
});
shot([20, 2], push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + plate(320, 380, 2.2) + G("", T("تأثير صغير", 320, 560, 34, OLIVE, 800), at(u, .4, .4)) + measure(150, 620, 220, 620, at(u, .6, .5), "");
});
// 21 · don't squeeze: the pressure pushes pus deeper and leaves a mark
shot(21, push(SK.fx, OP() + 90, 1.05, 1.2), function (u, d, t) {
  var sq = at(u, .2, .9), r = at(u, 1.3, 1.4);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 30, red: .8, bump: 1, pus: 1, sq: sq * (1 - at(u, 3.2, .5)), rupt: r, scar: at(u, 3.4, .8) }, t) +
    arrow(SK.fx, OP() + 120, SK.fx, OP() + 230, ORANGE, 5, r) + label(SK.fx + 60, OP() + 50, 520, OP() + 360, "أثر", RED, at(u, 3.6, .4), 28) + cross(SK.fx, OP() - 140, 1, at(u, .7, .4));
});
// 22 · recap: hormones → oil → plug → bacteria → immune fire
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var cells = [{ gland: 1.6, flow: 1, sebum: .3 }, { gland: 1.6, sebum: .6, plug: 1 }, { gland: 1.6, sebum: .7, plug: 1, bac: 40 }, { gland: 1.6, plug: 1, bac: 40, wbc: 1, red: 1, bump: 1, pus: 1 }], s = paper();
  cells.forEach(function (o, i) { var cx = i % 2 ? 470 : 170, cy = i < 2 ? 230 : 560, k = at(u, .2 + i * 1.3, .5);
    s += G("", R(cx - 150, cy - 150, 300, 300, "#f4ecdb", 2) + skinMini(cx - SK.fx * .44, cy - OP() * .44 - 10, .44, o, t) + callout(i + 1 + "", cx - 128, cy - 128, 1), k); });
  return s;
});
// 23 · twin studies: about 80% genetic
shot(23, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.2, 1.6);
  return paper() + boy(180, BY - 40, 1.8, t, { spots: 6, brows: "worried" }) + boy(460, BY - 40, 1.8, t + .3, { spots: 6, brows: "worried" }) + G("", tag("توائم", 320, 90, 1, 28, OLIVE), at(u, .3, .3)) +
    G("", R(170, 560, 300, 150, "#f4ecdb", 2.4) + N(Math.round(80 * k) + "%", 320, 660, 90, ORANGE) + T("وراثة", 320, 700, 24, INK, 800), at(u, 1, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var l = LN[li], u = t - l.start, s = "";
  var k0 = li === 0 ? at(u, 1.2, 1.6) : 1, dimK = li === 1 ? at(u, .1, .4) : 0;
  var ppl = boy(160, 800, 2.3, t, { spots: 10 * k0, hand: k0 > .5, brows: k0 > .3 ? "worried" : "neutral", mouth: k0 > .3 ? "frown" : "neutral" }) + boy(450, 800, 2.3, t + 1, { mate: 1, mouth: "smile" }) +
    numBox(Math.round(10 * k0) + "", 160, 610, 1, 34, true) + numBox("0", 450, 610, 1, 34, true) + T("حبوب", 160, 560, 24, RED, 800) + T("صافي", 450, 560, 24, OLIVE, 800);
  s += li === 1 ? dim(.6 * dimK, ppl) : ppl;
  if (li === 0) s += G("", plate(160, 120, 1.5) + plate(450, 120, 1.5) + T("نفس الأكل", 305, 40, 28, INK, 800), at(u, 2.2, .4));
  if (li === 1) { s += soapBar(160, 140, 2) + cross(160, 130, 1.4, at(u, .7, .4)) + plate(450, 150, 1.6) + cross(450, 130, 1.4, at(u, 1.8, .4)) + T("نظافة", 160, 240, 26, INK, 800) + T("أكل", 450, 240, 26, INK, 800); }
  return s;
};
SCENE.bumper = function (u, t) {
  return '<circle cx="92" cy="112" r="56" fill="' + DERM + '"/>' + G("translate(" + f(92 - SK.fx * .2) + " " + f(112 - (OP() + 60) * .2) + ") scale(.2)", skin({ gland: 1.6, sebum: .6, plug: 1, bac: 20, red: .6 + .3 * Math.sin(t * 2), bump: .8 }, t));
};
SCENE.outro = function (svg, u, t) {
  return skinMini(300 - SK.fx * .5, 150 - OP() * .5, .5, { gland: 1.6, plug: 1, bac: 30, wbc: 1, red: 1, bump: 1, pus: 1 }, t) +
    callout("1", 300 + 70, 92, ease(u / .3)) + callout("2", 300 - 30, 110, ease(u / .3 - .5)) + callout("3", 300 + 40, 195, ease(u / .3 - 1)) + callout("4", 300 - 110, 190, ease(u / .3 - 1.5));
};
