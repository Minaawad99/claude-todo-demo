window.CHUNKS = [[0.0], [0.0], [0.0, 0.4194], [0.0, 0.25, 0.7692], [0.0, 0.7556], [0.0, 0.5455], [0.0], [0.0, 0.2909], [0.0, 0.4533, 0.8533], [0.0], [0.0], [0.0, 0.25, 0.75], [0.0], [0.0, 0.1705, 0.5, 0.7955], [0.0, 0.7925], [0.0, 0.4714, 0.6571], [0.0], [0.0, 0.4314], [0.0], [0.0, 0.4407], [0.0], [0.0, 0.5854, 0.8171], [0.0, 0.4848], [0.0, 0.439], [0.0, 0.122, 0.3171, 0.5854, 0.8049], [0.0, 0.4, 0.7524], [0.0], [0.0]];
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

// ── «ليه في ناس شعرها كيرلي وناس شعرها ناعم؟» — drawings.
// The skin is a side cut like the «طب إزاي؟» reference (sheet v20: salmon epidermis, pink dermis, a red vessel, cream fat
// cells). The follicle is a pink sheath with a bulb and a red papilla at its foot, the hair shaft dark inside it (real
// histology references in refs/SOURCES.md). The two women are the shared person kit (hairStyle "curly" / "straight").

// ── the two women ──
var CURLY = { hairStyle: "curly", female: true, outfit: { base: "casual", colors: { shirt: "#d9a48f", shirtD: "#b9826d", pants: "#4a5a6c", pantsD: "#36445a", hair: "#5e3923", hairM: "#6e4529", hairL: "#b88555", hairD: "#2e1b10", skin: "#d8a07c", skinD: "#b77d5c", lip: "#c0685c", lipD: "#9e4f47", iris: "#5a361e", brow: "#2a1a10" } } };
var STRAIGHT = { hairStyle: "straight", female: true, outfit: { base: "home", colors: { shirt: "#a9c3dc", shirtD: "#7f9bb6", pants: "#3d4656", pantsD: "#2b3240", hair: "#241b17", hairL: "#5e4c42", hairD: "#16110e", lip: "#c4746a", lipD: "#a4594f", iris: "#4a2e1c", brow: "#1e1612" } } };
function blink(t, seed) { var p = (t + seed) % 3.7; return p < .12 ? .05 : p < .2 ? .5 : 1; }
// a woman from the front: head centre at (x, y), scale s; o: face, head, arms…
function woman(who, x, y, s, t, o) {
  o = o || {}; var b = who === "curly" ? CURLY : STRAIGHT, seed = who === "curly" ? 1.3 : 0;
  var face = Object.assign({ eyes: blink(t, seed), mouth: "smile" }, o.face || {});
  var head = Object.assign({ tilt: 2.5 * Math.sin(t * .9 + seed), turn: 0 }, o.head || {});
  return PERSON.front(Object.assign({}, b, { x: x, y: y + 166 * s, s: s, breath: (Math.sin(t * 1.6 + seed) + 1) / 2, hairT: t, face: face, head: head, arms: o.arms })).svg;
}
// a round portrait chip of one woman (top corner during her part)
function chip(who, x, y, r, t, k) {
  if (k <= 0) return ""; var id = "chip" + who;
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(pop(k)) + ")", '<clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="#f4ecdb"/>' +
    '<g clip-path="url(#' + id + ')">' + woman(who, 0, r * .15, r / 48, t) + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>');
}

// ── the skin, cut from the side (y0 = the surface); reference v20 ──
var EPI = "#d68b77", DERM = "#efc6b3", DERM_D = "#e3ad98", VESSEL = "#b8443a", FAT = "#ece0c4", FAT_D = "#cbbd98";
function skinY(x, y0) { return y0 + 5 * Math.sin(x * .018) + 2 * Math.sin(x * .05); }
function skin(y0, opt) {
  opt = opt || {}; var s = "", x, k, top = "M-200 " + f(skinY(-200, y0));
  for (x = -180; x <= 840; x += 20) top += " L" + x + " " + f(skinY(x, y0));
  var under = function (dy) { var d = ""; for (x = 840; x >= -200; x -= 20) d += " L" + x + " " + f(skinY(x, y0) + dy); return d; };
  s += '<path d="' + top + ' L840 1200 L-200 1200 Z" fill="' + DERM + '" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="' + top + under(34) + ' Z" fill="' + EPI + '" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="' + top.replace(/L/g, "L").replace("M-200", "M-200") + '" stroke="#e7a592" stroke-width="3" fill="none" transform="translate(0 6)" opacity=".6"/>';
  for (k = 0; k < 18; k++) { var fx = hash(k) * 640, fy = y0 + 70 + hash(k + 7) * 190; s += '<path d="M' + f(fx) + ' ' + f(fy) + ' q14 -6 28 0 t28 0" stroke="' + DERM_D + '" stroke-width="2" fill="none"/>'; }
  var vy = y0 + 300, vd = "M-200 " + f(vy); for (x = -180; x <= 840; x += 20) vd += " L" + x + " " + f(vy + 6 * Math.sin(x * .02));
  s += '<path d="' + vd + '" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="' + vd + '" stroke="' + VESSEL + '" stroke-width="6" fill="none"/>';
  s += '<path d="M-200 ' + f(vy + 14) + ' L840 ' + f(vy + 14) + ' L840 1200 L-200 1200 Z" fill="' + FAT + '" stroke="' + INK + '" stroke-width="2"/>';
  for (k = 0; k < 40; k++) { var cx = (k % 10) * 72 - 20 + (Math.floor(k / 10) % 2) * 36, cy = vy + 52 + Math.floor(k / 10) * 62; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="30" ry="24" fill="#f6eedb" stroke="' + FAT_D + '" stroke-width="2"/>'; }
  return s;
}
// ── a follicle: bulb at the foot (x0+40c, yb), up to the surface at (x0, ys); c = curvature (0 straight, 1 hooked)
function bez(a, b, c, u) { var v = 1 - u; return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]; }
function fPts(x0, yb, ys, c) { var a = [x0 + 46 * c, yb], b = [x0 + 108 * c, (yb + ys) / 2 + 30], e = [x0, ys], p = []; for (var i = 0; i <= 24; i++) p.push(bez(a, b, e, i / 24)); return p; }
function poly(p) { return "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L"); }
function follicle(x0, yb, ys, c, opt) {
  opt = opt || {}; var p = fPts(x0, yb, ys, c), d = poly(p), s = "", hc = opt.hair || "#3b2a20";
  s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="38" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#f6d8c9" stroke-width="33" fill="none" stroke-linecap="round"/>';
  s += '<path d="' + d + '" stroke="#ecbca8" stroke-width="18" fill="none" stroke-linecap="round"/>';
  var b = p[0], a = Math.atan2(p[2][1] - b[1], p[2][0] - b[0]) * 180 / Math.PI + 90;
  s += G("translate(" + f(b[0]) + " " + f(b[1]) + ") rotate(" + f(a) + ")", '<ellipse cx="0" cy="0" rx="30" ry="27" fill="#e9a28c" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M-14 27 Q-14 4 0 3 Q14 4 14 27 Z" fill="' + VESSEL + '" stroke="' + INK + '" stroke-width="2"/>');
  var hp = p.slice(2); s += '<path d="' + poly(hp) + '" stroke="' + INK + '" stroke-width="11" fill="none" stroke-linecap="round"/><path d="' + poly(hp) + '" stroke="' + hc + '" stroke-width="7.5" fill="none" stroke-linecap="round"/>';
  return s;
}
// cells born in the bulb and pushed up the follicle; asym > 0: the outer side of the curve builds faster and bigger
function cells(x0, yb, ys, c, t, asym, kc) {
  var p = fPts(x0, yb, ys, c), s = "", N = 9;
  [-1, 1].forEach(function (sd) {
    var sp = .1 * (1 + (asym || 0) * sd * .8);
    for (var i = 0; i < N; i++) { var u = ((t * sp + i / N) % 1) * .55, j = Math.min(23, Math.floor(u * 24)), q = p[j], q2 = p[j + 1], dx = q2[0] - q[0], dy = q2[1] - q[1], dl = Math.hypot(dx, dy) || 1;
      var x = q[0] - dy / dl * 9 * sd, y = q[1] + dx / dl * 9 * sd, r = (5.6 - u * 4) * (1 + (asym || 0) * sd * .25), col = u > .25 && kc ? ORANGE : "#f2b8a5";
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(1.6, r)) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  });
  return s;
}
// the shaft above the skin. kind: "straight" | "wave" | "curl" | "coil"; len px; k grows it 0..1
var SHAFT = { straight: [0, 0, 1], wave: [16, 0, 70], curl: [20, 9, 46], coil: [17, 15, 30] };
function shaft(x, ys, kind, len, t, k, col) {
  var P = SHAFT[kind] || SHAFT.straight, A = P[0], B = P[1], lam = P[2], H = len * clamp(k == null ? 1 : k), pts = [];
  if (H < 2) return "";
  if (!A) { for (var i = 0; i <= 12; i++) { var h = H * i / 12; pts.push([x + 4 * Math.sin(t * 1.4) * (h / len) * (h / len), ys - h]); } }
  else { var th = 0, tmax = H / lam * Math.PI * 2; for (th = 0; th <= tmax; th += .18) { var hh = th * lam / (Math.PI * 2); pts.push([x + A * Math.sin(th) * Math.min(1, th / 2) + 3 * Math.sin(t * 1.4) * hh / len, ys - hh + B * (Math.cos(th) - 1) * Math.min(1, th / 2)]); } }
  var d = poly(pts);
  return '<path d="' + d + '" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + (col || "#3b2a20") + '" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    (A ? '<path d="' + d + '" stroke="#8a6248" stroke-width="1.6" fill="none" transform="translate(-1.5 -1.5)" opacity=".7"/>' : '<path d="' + d + '" stroke="#6a5040" stroke-width="1.6" fill="none" transform="translate(-1.5 0)" opacity=".7"/>');
}
// a hair cut across: cuticle ring, cortex, medulla. rx/ry: round or flat
function section(x, y, rx, ry, col, k) {
  return appear(k, '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="#e9d9b8" stroke="' + INK + '" stroke-width="3"/>' +
    '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx - 9) + '" ry="' + f(ry - 9) + '" fill="' + (col || "#5b3a26") + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f((rx - 9) * .28) + '" ry="' + f((ry - 9) * .28) + '" fill="#2b1a12"/>' +
    '<path d="M' + f(x - rx * .55) + ' ' + f(y - ry * .5) + ' Q' + f(x) + ' ' + f(y - ry * .85) + ' ' + f(x + rx * .5) + ' ' + f(y - ry * .55) + '" stroke="#8a6248" stroke-width="3" fill="none" opacity=".8"/>');
}
function clipBox(x, y, w, h, inner) { var id = "cb" + x + "_" + y; return '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="none" stroke="' + INK + '" stroke-width="2.4"/>'; }
// ── small icons for the analogy boxes (drawn round 0,0, about 100 wide) ──
function icToothpaste(t) {
  var r = '<path d="M-48 -18 L10 -26 L10 4 L-48 -4 Z" fill="#e8eef0" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-48 -18 L-48 -4" stroke="' + ORANGE + '" stroke-width="6"/>' +
    '<rect x="10" y="-19" width="10" height="16" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/>';
  var L = 18 + 16 * ((t * .6) % 1);
  return r + '<path d="M20 -11 h' + f(L) + ' q10 0 10 10 t-10 14 h-14" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M20 -11 h' + f(L) + ' q10 0 10 10 t-10 14 h-14" stroke="#f7f5ef" stroke-width="6" fill="none" stroke-linecap="round"/>';
}
function icRibbon(t) {
  var s = '<path d="M-46 -30 L10 6" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M-40 30 L10 6" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="-52" cy="-34" r="9" fill="none" stroke="' + ORANGE + '" stroke-width="5"/><circle cx="-46" cy="34" r="9" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>';
  var d = "M10 6"; for (var th = 0; th < 12; th += .3) d += " L" + f(14 + th * 3.4) + " " + f(6 + 12 * Math.sin(th + t * 2) - th * .8);
  return s + '<path d="' + d + '" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="' + d + '" stroke="#c94f6d" stroke-width="4.5" fill="none"/>';
}
function icMicroscope() {
  return '<rect x="-34" y="34" width="62" height="10" rx="3" fill="#7d8a93" stroke="' + INK + '" stroke-width="2"/><path d="M14 34 Q30 6 6 -22" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<rect x="-18" y="8" width="40" height="7" fill="#7d8a93" stroke="' + INK + '" stroke-width="2"/><g transform="rotate(-25 -6 -14)"><rect x="-14" y="-42" width="16" height="46" fill="#cfd6da" stroke="' + INK + '" stroke-width="2"/><rect x="-16" y="-50" width="20" height="10" fill="' + INK + '"/></g>';
}
function icDNA(t, w, h) {
  w = w || 60; h = h || 100; var s = "", a = "", b = "";
  for (var i = 0; i <= 40; i++) { var y = -h / 2 + h * i / 40, ph = i / 40 * Math.PI * 3 + t * 1.6, x1 = Math.sin(ph) * w / 2, x2 = -x1;
    a += (i ? " L" : "M") + f(x1) + " " + f(y); b += (i ? " L" : "M") + f(x2) + " " + f(y);
    if (i % 3 === 0) s += '<path d="M' + f(x1) + ' ' + f(y) + ' L' + f(x2) + ' ' + f(y) + '" stroke="' + (i % 2 ? ORANGE : BLUE) + '" stroke-width="3"/>'; }
  return s + '<path d="' + a + '" stroke="' + OLIVE + '" stroke-width="5" fill="none"/><path d="' + b + '" stroke="' + INK + '" stroke-width="5" fill="none"/>';
}
function icBottle(col) {
  return '<path d="M-22 -20 Q-26 -24 -18 -28 L18 -28 Q26 -24 22 -20 L24 46 Q24 54 16 54 L-16 54 Q-24 54 -24 46 Z" fill="' + (col || "#7fa6b8") + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<rect x="-10" y="-44" width="20" height="16" fill="#e8eef0" stroke="' + INK + '" stroke-width="2"/><rect x="-16" y="0" width="32" height="26" rx="3" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.6"/>';
}
function icRazor() {
  return '<rect x="-40" y="-18" width="80" height="18" rx="4" fill="#cfd6da" stroke="' + INK + '" stroke-width="2.4"/><path d="M-36 -1 H36" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="0" width="12" height="54" rx="5" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/>';
}
function icDrip(t) {
  var dy = (t * 40) % 30;
  return '<path d="M-26 -50 H26 V0 Q26 10 0 14 Q-26 10 -26 0 Z" fill="#dfe9ec" stroke="' + INK + '" stroke-width="2.4"/><path d="M-26 -14 H26 V0 Q26 10 0 14 Q-26 10 -26 0 Z" fill="#e9c46a" opacity=".8"/>' +
    '<path d="M0 14 V60" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="' + f(22 + dy) + '" r="3.5" fill="#e9c46a" stroke="' + INK + '" stroke-width="1"/>';
}

// ── shots (line numbers from script.txt) ──
var SK = 330;   // the skin surface in the cut-away shots
// 3 · the rule: «خليك فاكرها» — a pinned card over a ghost of the skin
shot(3, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(1, skin(SK) + follicle(320, 590, SK, 0) + shaft(320, SK, "straight", 230, t)) +
    G("", '<rect x="120" y="150" width="400" height="180" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 240)"/>' + C(320, 156, 9, ORANGE, 2) +
      T("شكل الشعرة", 320, 222, 40, ORANGE, 800) + T("بيتحدد تحت الجلد", 320, 280, 34, INK, 700), at(u, .3, .4));
});
// 4 · what you see is dead cells: the shaft above the skin goes grey, labelled
shot(4, push(320, 330, 1.12, 1.0), function (u, d, t) {
  var k = at(u, .8, .8);
  return paper() + skin(SK) + follicle(320, 590, SK, 0) + dim(k * .8, shaft(320, SK, "straight", 280, t)) +
    label(324, 150, 450, 110, "خلايا ميتة", ORANGE, at(u, 1.2, .5), 28) + label(140, SK + 4, 90, 230, "الجلد", OLIVE, at(u, .3, .5), 24);
});
// 5 · its shape is set before it leaves the skin: an arrow down into the skin, the follicle lights up
shot(5, push(320, 450, 1.0, 1.1), function (u, d, t) {
  var k = at(u, .5, .6);
  return paper() + skin(SK) + G("", '<ellipse cx="350" cy="480" rx="' + f(90 + 6 * Math.sin(t * 3)) + '" ry="170" fill="' + ORANGE + '" opacity=".16"/>', k) + follicle(320, 590, SK, 0) + dim(.8, shaft(320, SK, "straight", 280, t)) +
    arrow(470, 140, 400, 430, ORANGE, 6, at(u, .2, .6)) + tag("تحت الجلد", 500, 690, at(u, 1, .3), 30, ORANGE);
});
// 6 · «طب بيتحدد فين؟»: the curly woman, a magnified circle on her scalp
shot(6, push(320, 360, 1.0, 1.1), function (u, d, t) {
  return paper() + woman("curly", 300, 400, 3.3, t, { face: { mouth: "neutral", look: [0, -.6] }, head: { tilt: -4 } }) +
    inset(470, 170, 120, skin(-40).replace(/stroke-width="2.4"/g, 'stroke-width="3"') + follicle(-10, 200, -40, .6) + shaft(-10, -40, "curl", 150, t, 1, "#5b3a26"), at(u, .4, .4)) +
    T("؟", 70, 150, 100, ORANGE, 800);
}, { tr: "fade" });
// 7 · under the scalp, every hair grows from a small sac: the follicle
shot(7, push(320, 470, 1.08, 0.98), function (u, d, t) {
  var k = at(u, .2, 1);
  return paper() + skin(SK) + sweep(0, 300, 640, 500, k, "d", follicle(320, 600, SK, 0)) + shaft(320, SK, "straight", 240, t) +
    label(358, 600, 520, 690, "البصيلة", OLIVE, at(u, 1.2, .5), 30) + label(296, 470, 140, 470, "الكيس", INK, at(u, 1.8, .5), 22);
}, { tr: "in" });
// 8 · inside it: new cells are born, fill with keratin and are pushed up
shot(8, push(320, 500, 1.12, 1.2), function (u, d, t) {
  return paper() + skin(SK) + follicle(320, 600, SK, 0) + cells(320, 600, SK, 0, t, 0, at(u, 2.4, .5) > .5) + shaft(320, SK, "straight", 240, t) +
    label(306, 600, 170, 660, "خلايا جديدة", OLIVE, at(u, .4, .5), 24) + label(308, 470, 170, 420, "الكيراتين", ORANGE, at(u, 2.6, .5), 26) + arrow(390, 560, 390, 420, ORANGE, 5, at(u, 3.4, .6));
}, { tr: "in" });
// 9 · like toothpaste squeezed out of the tube
shot(9, push(320, 440, 1.04, 1.0), function (u, d, t) {
  return paper() + skin(SK) + follicle(320, 600, SK, 0) + cells(320, 600, SK, 0, t * 1.6, 0, true) + shaft(320, SK, "straight", 240, t) + arrow(390, 560, 390, 420, ORANGE, 5) +
    iconBox(490, 170, 180, G("scale(1.5)", icToothpaste(t)), at(u, .2, .3));
});
// 10 · «طب الشعر الناعم ليه ناعم؟»: the straight-haired woman
shot(10, push(320, 380, 1.08, 1.0), function (u, d, t) {
  return paper() + woman("straight", 320, 370, 3.4, t, { head: { turn: .15 } }) + T("؟", 560, 170, 100, BLUE, 800);
});
// 11 · a straight follicle: the cells grow equally on both sides, the hair comes out straight
hud(11, 12, function (u, t) { return chip("straight", 70, 80, 54, t, at(u, .1, .3)); });
shot(11, push(320, 430, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .4, d - 1);
  return paper() + skin(SK + 40) + follicle(320, 640, SK + 40, 0) + cells(320, 640, SK + 40, 0, t, 0, true) + shaft(320, SK + 40, "straight", 300, t, .3 + .7 * k) +
    arrow(270, 560, 270, 470, BLUE, 5, at(u, 1.4, .4)) + arrow(370, 560, 370, 470, BLUE, 5, at(u, 1.4, .4)) + T("=", 320, 520, 44, BLUE, 800) +
    label(305, 520, 140, 600, "مستقيمة", BLUE, at(u, .6, .5), 26) + tag("دُغري", 470, 150, at(u, d - 1.4, .3), 30, BLUE);
});
// 12 · «طب والكيرلي؟»: the curly woman
shot(12, push(320, 380, 1.0, 1.08), function (u, d, t) {
  return paper() + woman("curly", 320, 380, 3.3, t, { head: { turn: -.15 } }) + T("؟", 70, 150, 100, ORANGE, 800);
});
// 13 · a curved follicle: one side builds faster than the other, so the hair turns round as it grows
hud(13, 16, function (u, t) { return chip("curly", 70, 80, 54, t, at(u, .1, .3)); });
shot(13, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.5, d - 1.8);
  return paper() + skin(SK + 40) + follicle(300, 650, SK + 40, .9, { hair: "#5b3a26" }) + cells(300, 650, SK + 40, .9, t, .9, true) + shaft(300, SK + 40, "curl", 300, t, .15 + .85 * k, "#5b3a26") +
    label(318, 520, 160, 580, "معووجة", ORANGE, at(u, .4, .5), 28) + arrow(430, 640, 420, 520, ORANGE, 7, at(u, 1.6, .4)) + arrow(330, 650, 330, 600, BLUE, 4, at(u, 1.6, .4));
});
// 14 · like gift ribbon pulled over a scissor blade, it curls by itself
shot(14, push(320, 420, 1.06, 1.0), function (u, d, t) {
  return paper() + skin(SK + 40) + follicle(300, 650, SK + 40, .9, { hair: "#5b3a26" }) + cells(300, 650, SK + 40, .9, t, .9, true) + shaft(300, SK + 40, "curl", 300, t, 1, "#5b3a26") +
    iconBox(490, 170, 180, G("scale(1.4)", icRibbon(t)), at(u, .2, .3));
});
// 15 · the more the follicle bends, the tighter the curl: from a soft wave to a spring
shot(15, push(320, 420, 0.96, 1.04), function (u, d, t) {
  var s = paper() + skin(SK + 60);
  [[110, .25, "wave", "موجة"], [320, .6, "curl", "كيرلي"], [530, 1, "coil", "سوستة"]].forEach(function (q, i) {
    var k = at(u, .3 + i * 1.1, 1);
    s += appear(k * 3, follicle(q[0] - 20 * q[1], 640, SK + 60, q[1], { hair: "#5b3a26" }) + shaft(q[0] - 20 * q[1], SK + 60, q[2], 280, t, k, "#5b3a26") + tag(q[3], q[0], 740, at(u, .6 + i * 1.1, .3), 26, i === 2 ? ORANGE : INK));
  });
  return s;
}, { tr: "out" });
// 16 · cut the hair across and look at it under the microscope
shot(16, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, .6);
  return paper() + shaft(220, 760, "straight", 640, t, 1) + shaft(440, 760, "curl", 640, t, 1, "#5b3a26") +
    draw("M150 " + f(400) + " L520 " + f(400), k, ORANGE, 3, ' stroke-dasharray="10 7"') + G("translate(" + f(lerp(130, 540, k)) + " 400) rotate(-90)", icRibbon(0).split("<path d=\"M10 6")[0], k > 0 && k < 1 ? 1 : 0) +
    iconBox(500, 170, 170, G("scale(1.3)", icMicroscope()), at(u, 1, .3));
});
// 17 · straight: round; curly: flat oval
shot(17, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + '<circle cx="320" cy="390" r="290" fill="#f7f1e2" stroke="' + INK + '" stroke-width="4"/>' + '<circle cx="320" cy="390" r="276" fill="none" stroke="' + INK + '" stroke-width="1.2"/>' +
    section(190, 390, 80 + 2 * Math.sin(t * 2), 80 + 2 * Math.sin(t * 2), "#2a211c", at(u, .3, .5)) + T("ناعم", 190, 520, 30, BLUE, 800) +
    section(455, 390, 100 + 2 * Math.sin(t * 2 + 1), 50 + 2 * Math.sin(t * 2 + 1), "#5b3a26", at(u, 1.8, .5)) + G("", T("كيرلي", 455, 520, 30, ORANGE, 800), at(u, 1.8, .4)) +
    tag("دايرة", 190, 720, at(u, .9, .3), 28, BLUE) + tag("بيضاوي", 455, 720, at(u, 2.4, .3), 28, ORANGE);
});
// 18 · like spaghetti and ribbon pasta
shot(18, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k1 = at(u, .2, .5), k2 = at(u, 1, .5);
  for (var i = 0; i < 4; i++) s += G("", '<path d="M' + (110 + i * 22) + ' 640 Q' + f(100 + i * 22 + 10 * Math.sin(t + i)) + ' 420 ' + (130 + i * 18) + ' 230" stroke="' + INK + '" stroke-width="10" fill="none"/><path d="M' + (110 + i * 22) + ' 640 Q' + f(100 + i * 22 + 10 * Math.sin(t + i)) + ' 420 ' + (130 + i * 18) + ' 230" stroke="#ecc66a" stroke-width="7" fill="none"/><circle cx="' + (130 + i * 18) + '" cy="230" r="6" fill="#ecc66a" stroke="' + INK + '" stroke-width="2"/>', k1);
  for (i = 0; i < 3; i++) s += G("", '<path d="M' + (400 + i * 44) + ' 640 Q' + f(390 + i * 44 + 12 * Math.sin(t + i)) + ' 420 ' + (410 + i * 40) + ' 230" stroke="' + INK + '" stroke-width="26" fill="none"/><path d="M' + (400 + i * 44) + ' 640 Q' + f(390 + i * 44 + 12 * Math.sin(t + i)) + ' 420 ' + (410 + i * 40) + ' 230" stroke="#ecc66a" stroke-width="22" fill="none"/><rect x="' + (398 + i * 40) + '" y="225" width="24" height="9" fill="#ecc66a" stroke="' + INK + '" stroke-width="2"/>', k2);
  return s + tag("إسباجيتي", 160, 720, at(u, .5, .3), 26, BLUE) + tag("مكرونة شريط", 450, 720, at(u, 1.3, .3), 26, ORANGE) +
    inset(160, 150, 60, C(0, 0, 26, "#ecc66a", 3), at(u, .6, .3)) + inset(460, 150, 60, '<rect x="-44" y="-12" width="88" height="24" rx="8" fill="#ecc66a" stroke="' + INK + '" stroke-width="3"/>', at(u, 1.4, .3));
});
// 19 · who decides the follicle's shape? the genes
shot(19, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", '<path d="M-200 600 L840 600 L840 1200 L-200 1200 Z" fill="none"/>') + appear(at(u, .2, .5), G("translate(170 400) scale(2.3)", icDNA(t, 70, 200))) +
    appear(at(u, 1.6, .5), clipBox(330, 250, 260, 330, G("scale(.6) translate(260 160)", skin(SK) + follicle(320, 600, SK, 0) + shaft(320, SK, "straight", 200, t) + follicle(560, 600, SK, .9, { hair: "#5b3a26" }) + shaft(560, SK, "curl", 200, t, 1, "#5b3a26")))) +
    tag("الوراثة", 170, 690, at(u, d - 1.6, .3), 32, OLIVE);
});
// 20 · genes from the father and the mother
shot(20, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var dad = PERSON.front({ x: 150, y: 300 + 166 * 1.5, s: 1.5, outfit: "casual", breath: (Math.sin(t * 1.6) + 1) / 2, face: { mouth: "smile", eyes: blink(t, .4) } }).svg;
  var mom = woman("straight", 490, 300, 1.5, t);
  return paper() + appear(at(u, .1, .4), dad) + appear(at(u, .4, .4), mom) + T("الأب", 150, 150, 30, OLIVE, 800) + T("الأم", 490, 150, 30, OLIVE, 800) +
    arrow(190, 520, 290, 640, OLIVE, 5, at(u, .6, .4)) + arrow(450, 520, 350, 640, OLIVE, 5, at(u, .6, .4)) + G("translate(320 700) rotate(90)", icDNA(t, 46, 120));
}, { tr: "fade" });
// 21 · the same shampoo, the same oil: one stays straight, the other curly
shot(21, push(320, 380, 1.04, 0.98), function (u, d, t) {
  return paper() + woman("straight", 170, 330, 1.75, t, { head: { turn: .2 } }) + woman("curly", 470, 330, 1.75, t, { head: { turn: -.2 } }) +
    iconBox(320, 130, 130, G("scale(.9)", icBottle()), at(u, .2, .3)) + check(60, 470, 1.3, at(u, d * .6, .4), BLUE) + check(590, 470, 1.3, at(u, d * .8, .4), ORANGE);
});
// 22 · the myth: shave it to zero and it comes back different — no
shot(22, push(320, 440, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .4, 1), cut = 1 - k;
  return paper() + skin(SK + 40) + follicle(320, 650, SK + 40, .9, { hair: "#5b3a26" }) + shaft(320, SK + 40, "curl", 280, t, Math.max(.03, cut), "#5b3a26") +
    G("translate(" + f(lerp(560, 330, k)) + " " + f(SK - 10) + ") rotate(-12)", icRazor(), at(u, .2, .3) * (1 - at(u, 1.6, .3))) +
    G("", shaft(470, SK + 40, "straight", 220, t, 1, "#5b3a26"), at(u, 2.2, .4)) + T("؟", 520, 200, 70, INK, 800) + cross(480, 250, 1.4, at(u, d - 1.2, .5));
});
// 23 · the follicle is unchanged: the hair grows back as it was
shot(23, push(320, 440, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .4, d - .8);
  return paper() + skin(SK + 40) + follicle(320, 650, SK + 40, .9, { hair: "#5b3a26" }) + cells(320, 650, SK + 40, .9, t, .9, true) + shaft(320, SK + 40, "curl", 300, t, .05 + .95 * k, "#5b3a26") +
    label(392, 560, 500, 640, "زي ما هي", OLIVE, at(u, .3, .5), 26) + check(520, 200, 1.4, at(u, d - 1, .4), OLIVE);
});
// 24 · «يعني من الآخر»: both follicles side by side, labelled, the genes above
shot(24, push(320, 420, 0.94, 1.02), function (u, d, t) {
  return paper() + skin(SK + 40) + follicle(170, 640, SK + 40, 0) + shaft(170, SK + 40, "straight", 260, t) + follicle(440, 650, SK + 40, .9, { hair: "#5b3a26" }) + shaft(440, SK + 40, "curl", 260, t, 1, "#5b3a26") +
    tag("تحت الجلد", 320, 740, at(u, .3, .3), 28, INK) + label(184, 520, 290, 580, "مستقيمة", BLUE, at(u, 1.6, .5), 24) + label(512, 560, 520, 640, "معووجة", ORANGE, at(u, 2.6, .5), 24) +
    iconBox(320, 130, 120, G("scale(.8)", icDNA(t, 50, 100)), at(u, 4.8, .3));
}, { tr: "out" });
// 25 · the odd fact: after chemotherapy the follicle can change and straight hair grows back curly
shot(25, push(320, 440, 1.0, 1.08), function (u, d, t) {
  var k = at(u, 2, 2), c = lerp(0, .7, k);
  return paper() + skin(SK + 40) + follicle(320, 650, SK + 40, c, { hair: "#2a211c" }) + cells(320, 650, SK + 40, c, t, c, true) +
    shaft(320, SK + 40, k < .5 ? "straight" : "curl", 280, t, k < .5 ? 1 - k * 2 : (k - .5) * 2, "#2a211c") +
    iconBox(500, 170, 160, G("scale(1.15)", icDrip(t)), at(u, .3, .3)) + label(330, 600, 200, 700, "البصيلة اتغيرت", ORANGE, at(u, 3, .5), 24);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: the curly-haired woman. line 1: the straight-haired woman beside her
  var l1 = LN[1], k1 = li >= 1 ? ease((t - l1.start) / .5) : 0, s = "";
  s += G("translate(" + f(lerp(304, 448, k1)) + " 0)", woman("curly", 0, 260, lerp(2.2, 1.75, k1), t, { head: { turn: -.2 * k1 } }));
  if (li >= 1) s += G("", woman("straight", 160, 260, 1.75, t, { head: { turn: .2 } }), k1);
  return s;
};
SCENE.bumper = function (u, t) {
  return '<g transform="translate(0 6)">' + shaft(60, 180, "straight", 150, t, 1, "#2a211c").replace(/stroke-width="10"/, 'stroke-width="9"') + shaft(118, 180, "curl", 150, t, 1, "#5b3a26") + '</g>';
};
SCENE.outro = function (svg, u, t) {
  return G("scale(.55) translate(-20 -140)", skin(SK) + follicle(260, 600, SK, 0) + shaft(260, SK, "straight", 230, t) + follicle(560, 610, SK, .9, { hair: "#5b3a26" }) + shaft(560, SK, "curl", 230, t, 1, "#5b3a26")) +
    G("", section(470, 150, 34, 34, "#2a211c", 1) + section(555, 150, 44, 22, "#5b3a26", 1)) +
    callout("1", 175, 230, ease(u / .3)) + callout("2", 380, 230, ease(u / .3 - .5)) + callout("3", 470, 96, ease(u / .3 - 1)) + callout("4", 555, 106, ease(u / .3 - 1.5));
};
