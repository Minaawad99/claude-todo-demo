window.CHUNKS = [[0.0], [0.0], [0.0, 0.5532], [0.0, 0.4194], [0.0, 0.4857], [0.0, 0.5469], [0.0, 0.3889], [0.0, 0.7273], [0.0, 0.5538, 0.7538], [0.0, 0.4429, 0.7571], [0.0, 0.3548, 0.6935], [0.0, 0.549], [0.0], [0.0, 0.3056, 0.625], [0.0], [0.0, 0.4507, 0.8169], [0.0], [0.0, 0.2078, 0.5455, 0.7403], [0.0, 0.3871, 0.7581], [0.0, 0.5806], [0.0, 0.44], [0.0, 0.1456, 0.5728, 0.699], [0.0, 0.3333, 0.5729, 0.7604], [0.0, 0.587], [0.0]];
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

// ── «لو سبت السخان الكهربا شغال» — drawings. The heater is the common wall-mounted vertical storage heater (50 L):
// an outer enamel casing, a foam insulation layer, an inner steel tank, a U-shaped sheathed element and the thermostat
// pocket on the bottom flange, a magnesium anode rod, the cold inlet (short dip tube) and the hot outlet drawn from the
// top. Drawn as a front cut-away in the hand of the «طب إزاي؟» reference (v09 dishwasher heater, v02 air-fryer element).
// People follow videos/choking (real body proportions, flat side views).

var CASE = "#ece7da", FOAM = "#e3c98c", STEEL = "#8f8d86", COLD = "#a9c4d0", HOT = "#d7a185", SCALE = "#f2efe6", COPPER = "#b06a3c",
    TILE = "#dfe3dc", SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", WOOD_D = "#7c5434";
function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, k) { k = clamp(k); var p = hx(a), q = hx(b); return "rgb(" + Math.round(lerp(p[0], q[0], k)) + "," + Math.round(lerp(p[1], q[1], k)) + "," + Math.round(lerp(p[2], q[2], k)) + ")"; }
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// seconds into line l at caption chunk c / at a fraction of the line
function ch(l, c) { var L = LN[l], cs = window.CHUNKS[l]; return (L.end - L.start) * (cs[Math.min(c, cs.length - 1)] || 0); }
function lf(l, x) { return (LN[l].end - LN[l].start) * x; }

// ── the heater, front cut-away ──
// o: temp 0..1 (cold→hot water colour), on 0..1 (element glowing), leak 0..1 (heat leaving the shell), scale 0..1 (limescale on
// the element), hl: "el" | "th" | "tank" | "foam" | null (what to bring forward), lamp (0/1), noCut (closed casing)
var HX = 320, HT = 120, HB2 = 640, HW = 150;
function shell(x, y, w, h, r) { return "M" + f(x) + " " + f(y + r) + " Q" + f(x) + " " + f(y) + " " + f(x + r) + " " + f(y) + " H" + f(x + w - r) + " Q" + f(x + w) + " " + f(y) + " " + f(x + w) + " " + f(y + r) + " V" + f(y + h - r) + " Q" + f(x + w) + " " + f(y + h) + " " + f(x + w - r) + " " + f(y + h) + " H" + f(x + r) + " Q" + f(x) + " " + f(y + h) + " " + f(x) + " " + f(y + h - r) + " Z"; }
function element(t, on, sc, col) {
  var d = "M300 625 V400 A20 20 0 0 1 340 400 V625", glow = mix("#7d776c", ORANGE, on), s = "";
  if (on > 0.05) s += '<path d="' + d + '" stroke="#e9874f" stroke-opacity="' + f(on * (.35 + .1 * Math.sin(t * 9))) + '" stroke-width="22" fill="none"/>';
  s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="' + d + '" stroke="' + (col || glow) + '" stroke-width="8" fill="none"/>';
  if (sc > 0) {   // limescale crust: knobbly white layer round the rod, thicker as sc grows
    var w = 8 + 14 * sc; s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" fill="none" opacity="' + f(clamp(sc * 3)) + '"/><path d="' + d + '" stroke="' + SCALE + '" stroke-width="' + f(w) + '" fill="none" opacity="' + f(clamp(sc * 3)) + '"/>';
    for (var i = 0; i < 26; i++) { var yy = 420 + (i % 13) * 16, xx = i < 13 ? 300 : 340; s += '<circle cx="' + f(xx + (hash(i) - .5) * w * .9) + '" cy="' + f(yy + hash(i + 7) * 8) + '" r="' + f(2 + 3 * sc * hash(i + 3)) + '" fill="' + SCALE + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(clamp(sc * 3)) + '"/>'; }
    if (sc > .15) s += '<path d="' + d + '" stroke="' + glow + '" stroke-width="4" fill="none"/>';
  }
  return s;
}
function heater(t, o) {
  o = o || {}; var temp = o.temp == null ? .8 : o.temp, on = o.on || 0, x0 = HX - HW, w = 2 * HW, s = "";
  // wall bracket and pipes outside, under the casing
  s += R(HX - 70, HT - 26, 140, 14, "#bdb6a6", 2);
  s += '<path d="M230 650 V760" stroke="' + INK + '" stroke-width="14"/><path d="M230 650 V760" stroke="' + BLUE + '" stroke-width="9"/>';
  s += '<path d="M410 650 V760" stroke="' + INK + '" stroke-width="14"/><path d="M410 650 V760" stroke="' + ORANGE + '" stroke-width="9"/>';
  s += R(214, 700, 32, 16, "#9a9488", 2) + '<path d="M230 700 v-10" stroke="' + INK + '" stroke-width="3"/>';   // safety valve on the cold inlet
  // casing + foam + inner tank
  s += '<path d="' + shell(x0, HT, w, HB2 - HT + 30, 70) + '" fill="' + CASE + '" stroke="' + INK + '" stroke-width="2.6"/>';
  if (!o.noCut) {
    var fk = o.hl === "foam" ? 1 : 0;
    s += '<path d="' + shell(x0 + 8, HT + 8, w - 16, HB2 - HT + 14, 64) + '" fill="' + mix(FOAM, "#e7b46a", fk * (.5 + .5 * Math.sin(t * 4))) + '" stroke="' + INK + '" stroke-width="1.4"/>' + '<path d="' + shell(x0 + 8, HT + 8, w - 16, HB2 - HT + 14, 64) + '" fill="url(#hatch)" opacity=".5"/>';
    var ix = x0 + 30, iw = w - 60, iy = HT + 30, ih = HB2 - HT - 26;
    s += '<path d="' + shell(ix, iy, iw, ih, 50) + '" fill="' + mix(COLD, HOT, temp) + '" stroke="' + STEEL + '" stroke-width="6"/>';
    s += '<path d="' + shell(ix, iy, iw, ih, 50) + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>';
    // the top of the water is a little hotter: a faint warmer band
    s += '<path d="M' + (ix + 6) + ' ' + (iy + 60) + ' H' + (ix + iw - 6) + '" stroke="' + mix(COLD, HOT, temp + .15) + '" stroke-width="40" opacity=".55"/>';
    // shimmer lines in the water
    for (var i = 0; i < 6; i++) { var yy = iy + 90 + i * 62 + 6 * Math.sin(t * 1.3 + i); s += '<path d="M' + f(ix + 30 + (i % 2) * 30) + ' ' + f(yy) + ' q20 -6 40 0 t40 0" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>'; }
    // hot outlet drawn from the top, cold dip tube with its deflector at the bottom
    s += '<path d="M410 640 V180" stroke="' + INK + '" stroke-width="10"/><path d="M410 640 V180" stroke="' + mix(STEEL, ORANGE, .5) + '" stroke-width="6"/>';
    s += '<path d="M230 640 V590" stroke="' + INK + '" stroke-width="10"/><path d="M230 640 V590" stroke="' + mix(STEEL, BLUE, .5) + '" stroke-width="6"/><path d="M218 588 h24" stroke="' + INK + '" stroke-width="3"/>';
    // magnesium anode
    s += '<path d="M262 630 V330" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M262 630 V330" stroke="#b9b6ad" stroke-width="7" stroke-linecap="round"/>';
    // bubbles off the element while it heats
    if (on > .1) for (var b = 0; b < 12; b++) { var p = (t * .35 + hash(b)) % 1, bx = (b % 2 ? 300 : 340) + 10 * Math.sin(t * 3 + b) + (hash(b + 5) - .5) * 30, by = 600 - p * 320; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(2 + 3 * hash(b + 2)) + '" fill="none" stroke="#fff" stroke-width="1.6" opacity="' + f(on * (1 - p)) + '"/>'; }
    var el = element(t, on, o.scale || 0), th = '<path d="M368 630 V470" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M368 630 V470" stroke="' + (o.hl === "th" ? OLIVE : "#9a9a7a") + '" stroke-width="7" stroke-linecap="round"/>';
    s += o.hl === "th" ? dim(.6, el) + th : o.hl === "tank" ? dim(.5, el + th) : el + th;
    // bottom flange
    s += R(276, 626, 108, 18, "#8a8a84", 2, 3);
  } else {
    s += '<path d="M' + (x0 + 22) + ' ' + (HT + 60) + ' V' + (HB2 - 40) + '" stroke="#fff" stroke-width="8" opacity=".7"/>';
  }
  // control cover with the pilot lamp and the thermostat knob
  var lamp = o.lamp == null ? (on > .5 ? 1 : 0) : o.lamp;
  s += R(266, 652, 108, 34, "#e1dbcc", 2, 6) + C(296, 669, 7, lamp ? "#e2543a" : "#7a6f66", 1.6) + (lamp ? '<circle cx="296" cy="669" r="13" fill="#e2543a" opacity=".25"/>' : "") + C(344, 669, 11, "#cfc8b8", 1.8) + '<path d="M344 669 l6 -7" stroke="' + INK + '" stroke-width="2.4"/>';
  // heat leaking out through the shell: short wavy lines drifting outward
  if (o.leak > 0) for (var j = 0; j < 10; j++) {
    var side = j % 2 ? 1 : -1, yy2 = 190 + (j >> 1) * 95, p2 = (t * .55 + hash(j)) % 1, xx2 = HX + side * (HW + 14 + p2 * 70), dd = "";
    for (var q = 0; q <= 24; q += 3) dd += (q ? " L" : "M") + f(xx2 + side * q) + " " + f(yy2 + 5 * Math.sin(q / 4 + t * 6));
    s += '<path d="' + dd + '" stroke="' + ORANGE + '" stroke-width="' + f(3 * (o.leakW || 1)) + '" fill="none" stroke-linecap="round" opacity="' + f(o.leak * Math.sin(p2 * Math.PI)) + '"/>';
  }
  return s;
}
// a thermometer: tube and bulb, red column at v 0..1, value text above
function thermo(x, y, h, v, txt, col) {
  var top = y - h, lv = y - 18 - (h - 30) * clamp(v);
  return R(x - 34, top - 40, 68, h + 64, "#f4ecdb", 1.6) + '<path d="M' + (x - 7) + ' ' + (y - 14) + ' V' + (top + 6) + ' a7 7 0 0 1 14 0 V' + (y - 14) + '" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + x + ' ' + (y - 10) + ' V' + f(lv) + '" stroke="' + (col || ORANGE) + '" stroke-width="7"/>' + C(x, y, 13, col || ORANGE, 2) + (txt ? N(txt, x, top - 12, 24, col || ORANGE) : "");
}
function lampTag(x, y, on, k) { return G("", R(x - 62, y - 22, 124, 44, "#f4ecdb", 2, 8) + C(x - 34, y, 10, on ? "#e2543a" : "#7a6f66", 2) + (on ? '<circle cx="' + (x - 34) + '" cy="' + y + '" r="18" fill="#e2543a" opacity=".25"/>' : "") + T(on ? "شغال" : "فاصل", x + 14, y + 8, 22, on ? ORANGE : MUTE, 800), k == null ? 1 : k); }
function clockFace(x, y, r, hrs, col) {
  var s = C(x, y, r, "#f4ecdb", 2.4), a;
  for (var i = 0; i < 12; i++) { a = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.sin(a) * r * .8) + ' ' + f(y - Math.cos(a) * r * .8) + ' L' + f(x + Math.sin(a) * r * .92) + ' ' + f(y - Math.cos(a) * r * .92) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  var ah = hrs / 12 * Math.PI * 2, am = hrs * Math.PI * 2;
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(ah) * r * .5) + ' ' + f(y - Math.cos(ah) * r * .5) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(am) * r * .75) + ' ' + f(y - Math.cos(am) * r * .75) + '" stroke="' + (col || ORANGE) + '" stroke-width="3" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
function moonIcon(x, y, r) { return '<path d="M' + f(x + r * .3) + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 1 0 ' + f(x + r) + ' ' + f(y + r * .3) + ' A' + f(r * .8) + ' ' + f(r * .8) + ' 0 0 1 ' + f(x + r * .3) + ' ' + f(y - r) + ' Z" fill="#e6dcb0" stroke="' + INK + '" stroke-width="2"/>'; }
function sunIcon(x, y, r, t) { var s = ""; for (var k = 0; k < 10; k++) { var a = k / 10 * Math.PI * 2 + t * .3; s += '<path d="M' + f(x + Math.cos(a) * r * 1.25) + ' ' + f(y + Math.sin(a) * r * 1.25) + ' L' + f(x + Math.cos(a) * r * 1.6) + ' ' + f(y + Math.sin(a) * r * 1.6) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return s + C(x, y, r, "#e2a062", 2); }
function bolt(x, y, sc, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M6 -30 L-14 4 L0 4 L-6 30 L16 -6 L2 -6 Z" fill="' + (col || "#f0c040") + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'); }
// a teapot («براد») on a gas ring
function teapot(x, y, t) {
  var s = R(x - 90, y + 64, 180, 20, "#9a9488", 2) + '<path d="M' + (x - 60) + ' ' + (y + 64) + ' h120" stroke="' + INK + '" stroke-width="4"/>';
  for (var i = 0; i < 7; i++) { var fx = x - 42 + i * 14, fh = 18 + 7 * Math.sin(t * 11 + i * 1.7); s += '<path d="M' + (fx - 6) + ' ' + (y + 62) + ' Q' + fx + ' ' + f(y + 62 - fh) + ' ' + (fx + 6) + ' ' + (y + 62) + ' Z" fill="#6f9ec8" stroke="' + INK + '" stroke-width="1.2"/>'; }
  s += '<path d="M' + (x - 50) + ' ' + (y + 40) + ' Q' + (x - 56) + ' ' + (y - 20) + ' ' + (x - 24) + ' ' + (y - 34) + ' H' + (x + 24) + ' Q' + (x + 56) + ' ' + (y - 20) + ' ' + (x + 50) + ' ' + (y + 40) + ' Z" fill="#c9c6bd" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + (x - 50) + ' ' + (y + 10) + ' Q' + (x - 90) + ' ' + (y - 4) + ' ' + (x - 96) + ' ' + (y - 34) + '" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M' + (x - 50) + ' ' + (y + 10) + ' Q' + (x - 90) + ' ' + (y - 4) + ' ' + (x - 96) + ' ' + (y - 34) + '" stroke="#c9c6bd" stroke-width="5" fill="none" stroke-linecap="round"/>';
  s += R(x - 22, y - 44, 44, 12, "#b8b4aa", 2, 4) + C(x, y - 50, 6, "#8a857a", 2) + '<path d="M' + (x + 48) + ' ' + (y - 16) + ' q30 10 4 44" stroke="' + INK + '" stroke-width="5" fill="none"/>';
  for (var j = 0; j < 3; j++) { var p = (t * .5 + j / 3) % 1; s += '<path d="M' + f(x - 98 + 8 * Math.sin(p * 6 + j)) + ' ' + f(y - 44 - p * 70) + ' q8 -10 0 -20" stroke="' + MUTE + '" stroke-width="3" fill="none" opacity="' + f(1 - p) + '"/>'; }
  return s;
}
function cup(x, y) { return '<path d="M' + (x - 22) + ' ' + (y - 26) + ' h44 l-6 46 h-32 Z" fill="#f4f0e4" stroke="' + INK + '" stroke-width="2.2"/><path d="M' + (x - 18) + ' ' + (y - 18) + ' h36" stroke="#9a5a2c" stroke-width="6"/><path d="M' + (x + 22) + ' ' + (y - 16) + ' q16 4 4 22" stroke="' + INK + '" stroke-width="3" fill="none"/>'; }
// an electric kettle, cut to show the white crust on its plate
function kettle(x, y, t, sc) {
  var s = '<path d="M' + (x - 80) + ' ' + (y + 90) + ' L' + (x - 66) + ' ' + (y - 70) + ' Q' + x + ' ' + (y - 96) + ' ' + (x + 66) + ' ' + (y - 70) + ' L' + (x + 80) + ' ' + (y + 90) + ' Z" fill="#dfe0dc" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + (x - 66) + ' ' + (y + 80) + ' L' + (x - 56) + ' ' + (y - 30) + ' H' + (x + 56) + ' L' + (x + 66) + ' ' + (y + 80) + ' Z" fill="' + COLD + '" stroke="' + INK + '" stroke-width="1.4"/>';
  s += R(x - 66, y + 72, 132, 10, "#8f8d86", 1.6);
  for (var i = 0; i < 22; i++) s += '<circle cx="' + f(x - 60 + hash(i) * 120) + '" cy="' + f(y + 70 - hash(i + 9) * 6 * sc) + '" r="' + f(3 + 4 * hash(i + 4)) + '" fill="' + SCALE + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(sc) + '"/>';
  for (var k = 0; k < 6; k++) s += '<circle cx="' + f(x - 50 + k * 20 + (hash(k + 30) - .5) * 30) + '" cy="' + f(y - 20 + hash(k + 40) * 80) + '" r="2.5" fill="' + SCALE + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(sc * .8) + '"/>';
  s += '<path d="M' + (x + 72) + ' ' + (y - 50) + ' q50 10 46 70 q-4 40 -38 50" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M' + (x + 72) + ' ' + (y - 50) + ' q50 10 46 70 q-4 40 -38 50" stroke="#dfe0dc" stroke-width="7" fill="none"/>';
  return s + R(x - 92, y + 90, 184, 18, "#5b5650", 2, 6);
}
// people (videos/choking, Drillis & Contini proportions)
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) { var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))); return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1]; }
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3), legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = {};
  var shirt = o.shirt || SHIRT_V, pants = o.pants || PANTS;
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/><path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var toe = [an[0] - HB.foot * .78 * s, an[1]], heel = [an[0] + 12 * s, an[1]];
    var foot = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + (o.bare ? SKIN : INK) + '" stroke="' + INK + '" stroke-width="1.6"/>';
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, pants, o.bare ? SKIN : pants) + foot;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.bare ? SKIN : shirt, SKIN) + hand;
  }
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var tor = '<path d="' + d + '" fill="' + (o.bare ? SKIN : shirt) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + pants + '" stroke="' + INK + '" stroke-width="2"/>';
  var neck = limb([atF(HB.sh - 4, 2), atF(HB.chin + 6, 4)], 24 * s, SKIN);
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>');
  out.far = arm(1) + leg(1); out.body = leg(0) + tor + neck + head; out.near = arm(0); out.hd = hd; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
// the bathroom, side view: tiled wall on the left, the heater hung high, its hot pipe to the shower, a person under it
function bathroom(t, o) {
  o = o || {}; var s = R(-300, -200, 1240, 1200, TILE, 0), fl = 700;
  for (var y = -200; y < fl; y += 46) s += '<path d="M-300 ' + y + ' H940" stroke="#c8cec6" stroke-width="1.4"/>';
  for (var x = -300; x < 940; x += 46) s += '<path d="M' + x + ' -200 V' + fl + '" stroke="#c8cec6" stroke-width="1.4"/>';
  s += '<path d="M-300 ' + fl + ' H940" stroke="' + INK + '" stroke-width="2.6"/>' + R(-300, fl, 1240, 300, "#cfc6b2", 0) + '<rect x="-300" y="' + fl + '" width="1240" height="300" fill="url(#hatch)" opacity=".3"/>';
  // the heater, closed, small, high on the wall
  s += G("translate(30 20) scale(.42)", heater(t, { noCut: 1, lamp: o.lamp == null ? 1 : o.lamp }));
  // hot pipe from the heater down and across to the shower arm
  var pipe = "M202 340 V380 H460 V150 H430";
  s += '<path d="' + pipe + '" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="' + pipe + '" stroke="#b9b6ad" stroke-width="7" fill="none"/>';
  s += '<path d="M430 140 h-50 l-16 18 h66 Z" fill="#b9b6ad" stroke="' + INK + '" stroke-width="2.2"/>';
  if (o.water !== 0) for (var i = 0; i < 16; i++) { var p = (t * 1.3 + hash(i)) % 1; s += '<path d="M' + f(370 + hash(i + 3) * 60) + ' ' + f(166 + p * 300) + ' v12" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(.8 * (1 - p * .6)) + '"/>'; }
  var man = fig({ x: 420, y: fl - 212, lean: 4, bare: 1, pants: "#7f97a6", hands: [rel(150, 12), null], bend: [-1, -1], tilt: -8 });
  s += whole(man);
  if (o.current > 0) {   // current: orange dashes running heater → pipe → water → person → floor
    var c = o.current, dash = '" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-dasharray="10 14" stroke-dashoffset="' + f(-t * 60) + '" opacity="' + f(c) + '"';
    s += '<path d="' + pipe + dash + '/>' + '<path d="M400 170 V300' + dash + '/>' + '<path d="M420 330 V' + (fl - 4) + dash + '/>';
    s += bolt(400, 260, .9 * c, ORANGE) + bolt(450, 520, .8 * c, ORANGE);
  }
  return s;
}
// earth symbol (⏚) with or without a ✗
function earth(x, y, k) { return G("", '<path d="M' + x + ' ' + (y - 40) + ' V' + y + ' M' + (x - 28) + ' ' + y + ' H' + (x + 28) + ' M' + (x - 18) + ' ' + (y + 10) + ' H' + (x + 18) + ' M' + (x - 8) + ' ' + (y + 20) + ' H' + (x + 8) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>', k); }
// double-pole wall switch with its red lamp; on 0/1 (the rocker flips)
function wallSwitch(x, y, on) {
  return R(x - 70, y - 90, 140, 180, "#f4f1e8", 2.4, 10) + R(x - 40, y - 60, 80, 120, "#e8e3d6", 2, 6) +
    '<path d="M' + (x - 40) + ' ' + (y + (on ? -60 : 0)) + ' h80 v60 h-80 Z" fill="' + (on ? "#d9d3c4" : "#c8c1b0") + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    C(x, y - 72, 7, on ? "#e2543a" : "#7a6f66", 1.6) + (on ? '<circle cx="' + x + '" cy="' + (y - 72) + '" r="14" fill="#e2543a" opacity=".3"/>' : "") + T(on ? "I" : "O", x, y + (on ? 40 : -20), 22, MUTE, 800);
}
// the sheathed element, cut across: coil, magnesium-oxide powder, steel sheath, limescale, water
function rodCut(t, sc, hotK) {
  var s = C(320, 400, 250, mix(COLD, HOT, .6), 0);
  if (sc > 0) s += '<circle cx="320" cy="400" r="' + f(150 + 60 * sc) + '" fill="' + SCALE + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 30 && sc > 0; i++) { var a = hash(i) * 6.28, r = 150 + 60 * sc; s += '<circle cx="' + f(320 + Math.cos(a) * r) + '" cy="' + f(400 + Math.sin(a) * r) + '" r="' + f(4 + 7 * hash(i + 2)) + '" fill="' + SCALE + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  s += C(320, 400, 150, "#a3a19a", 3) + C(320, 400, 128, "#efe7d2", 2) + '<circle cx="320" cy="400" r="128" fill="url(#hatch)" opacity=".5"/>';
  s += C(320, 400, 40, mix("#a86a40", "#f0703a", hotK * (.8 + .2 * Math.sin(t * 8))), 2.4) + '<circle cx="320" cy="400" r="22" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>';
  return s;
}
// a chart frame: x from x0 to x1, y from y0 (bottom) to y1 (top)
function axes(x0, y0, x1, y1, xl, yl) { return '<path d="M' + x0 + ' ' + y1 + ' V' + y0 + ' H' + x1 + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>' + T(xl || "", x1 - 4, y0 + 34, 20, INK, 700, "start") + T(yl || "", x0 - 8, y1 - 12, 20, INK, 700, "end"); }

// ── shots ──
// 4 · inside: a 50-litre tank, the element under it, the thermostat beside it
shot(4, push(320, 400, 0.86, 0.92), function (u, d, t) {
  var k0 = at(u, 0, .6), k1 = at(u, ch(4, 1), .5), k2 = at(u, ch(4, 2) + .3, .5), k3 = at(u, ch(4, 3), .5);
  return paper() + appear(k0, heater(t, { temp: .2, on: k1 > 0 ? .25 : 0, hl: k3 > 0 ? "th" : null })) +
    label(190, 260, 70, 200, "خزان", BLUE, at(u, .5, .5), 28) + G("", numBox("50 L", 120, 280, 1, 24), at(u, ch(4, 0) + 1.2, .3)) +
    label(300, 450, 150, 470, "سلك التسخين", ORANGE, k2, 26) + label(368, 520, 480, 580, "الترموستات", OLIVE, k3, 26);
});
// 5 · the thermostat cuts the power when the water reaches the set temperature
shot(5, push(330, 470, 1.25, 1.4), function (u, d, t) {
  var v = clamp(u / (d * .7)), cut = v >= 1, temp = lerp(.25, .9, v);
  return paper() + heater(t, { temp: temp, on: cut ? 0 : 1, hl: "th" }) + label(368, 600, 240, 730, "الترموستات", OLIVE, at(u, .2, .5), 24) +
    thermo(150, 560, 210, v * .82, Math.round(lerp(25, 60, v)) + "°") + G("", lampTag(480, 300, !cut), at(u, .3, .3)) + (cut ? G("", tag("60°", 480, 230, 1, 26, ORANGE), at(u, d * .7, .3)) : "");
}, { tr: "in" });
// 6 · then why does it come back on by itself? the lamp lights with no tap open
shot(6, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var on = u > d * .55;
  return paper() + heater(t, { noCut: 1, lamp: on ? 1 : 0 }) + G("", T("؟", 470, 300, 170, ORANGE, 800), at(u, .3, .3)) +
    (on ? G("", '<circle cx="296" cy="669" r="' + f(20 + 14 * Math.abs(Math.sin(t * 5))) + '" fill="none" stroke="#e2543a" stroke-width="3"/>', 1) : "") + G("", lampTag(150, 250, on), at(u, .2, .3));
}, { tr: "out" });
// 7 · heat leaks out through the shell all the time, however well it is insulated
shot(7, push(320, 400, 0.84, 0.9), function (u, d, t) {
  var kf = at(u, ch(7, 1), .5);
  return paper() + heater(t, { temp: .85, leak: at(u, .4, .8), hl: kf > 0 ? "foam" : null }) + label(178, 300, 60, 240, "العزل", OLIVE, kf, 26) +
    inset(520, 170, 100, G("translate(0 0)", R(-120, -120, 70, 240, mix(COLD, HOT, .85), 0) + R(-50, -120, 10, 240, STEEL, 1.4) + R(-40, -120, 50, 240, FOAM, 1.4) + '<rect x="-40" y="-120" width="50" height="240" fill="url(#hatch)" opacity=".5"/>' + R(10, -120, 10, 240, CASE, 1.4) +
      arrow(-90, -30 + 8 * Math.sin(t * 3), 80 + 10 * Math.sin(t * 2), -30, ORANGE, 5, 1) + arrow(-90, 40, 70 + 10 * Math.sin(t * 2 + 1), 40, ORANGE, 3, 1)), at(u, 1.2, .4));
});
// 8 · the thermostat feels it cooled, heats again, all day: a saw-tooth temperature line and the heating bursts under it
shot(8, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + axes(80, 520, 580, 200, "الساعة", "الحرارة") + G("", R(80, 560, 500, 50, "none", 0), 1), p = clamp(u / (d * .9)), xe = 80 + 500 * p, path = "", bars = "", n = 7;
  for (var x = 80; x <= xe; x += 3) { var ph = ((x - 80) / 500 * n) % 1, y = ph < .82 ? 250 + 80 * (ph / .82) : 330 - 80 * ((ph - .82) / .18); path += (x === 80 ? "M" : " L") + f(x) + " " + f(y); }
  for (var c = 0; c < n; c++) { var bx = 80 + (c + .82) / n * 500; if (bx < xe) bars += R(bx, 566, 500 / n * .18, 34, ORANGE, 1.6); }
  s += '<path d="' + path + '" stroke="' + ORANGE + '" stroke-width="4" fill="none"/>' + '<path d="M80 250 H580" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="6 6"/>' + N("60°", 596, 238, 20, ORANGE) + bars + T("شغال", 72, 592, 18, ORANGE, 700, "start");
  var sun = 1 - clamp(p * 2 - .6); s += G("", sunIcon(130, 140, 24, t), sun) + G("", moonIcon(530, 140, 26), clamp(p * 2 - .6));
  return s + iconBox(320, 120, 110, G("translate(0 6) scale(.16) translate(-320 -400)", heater(t, { temp: .8, on: Math.sin(t * 2) > .3 ? 1 : 0 })), at(u, .2, .3));
});
// 9 · about 1.5 kWh a day, so 45 a month: a month of days filling in
shot(9, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + bigNum(count(1.5, at(u, .3, 1.2), 1), "كيلووات في اليوم", 320, 200, at(u, .2, .4), ORANGE, 90) + bolt(160 + 6 * Math.sin(t * 5), 160 + 10 * Math.sin(t * 3.4), 1.4 + .15 * Math.sin(t * 6), "#f0c040") + bolt(490 - 6 * Math.sin(t * 4.4), 150 + 10 * Math.cos(t * 3), 1.0, "#f0c040"), kc = at(u, ch(9, 1) + .2, .4);
  var filled = Math.floor(clamp((u - ch(9, 1)) / (d - ch(9, 1) - .6)) * 30);
  for (var i = 0; i < 30; i++) { var cx = 125 + (i % 6) * 65, cy = 330 + Math.floor(i / 6) * 56; s += G("", R(cx - 28, cy - 22, 56, 44, i < filled ? "#f2d9a8" : "#f4ecdb", 1.6) + N(String(i + 1), cx, cy + 7, 18, i < filled ? ORANGE : MUTE), kc); }
  return s + G("", numBox(count(45, clamp(filled / 30)), 320, 650, 1, 44) + T("كيلووات في الشهر", 320, 720, 26, ORANGE, 800), kc);
});
// 10 · like leaving the teapot on the flame all day for one cup at night
shot(10, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var hrs = 6 + u * 2.4;
  return paper() + teapot(280, 420, t) + G("", clockFace(500, 200, 64, hrs), at(u, .5, .3)) + G("", cup(500, 470) + T("كوباية", 500, 540, 22, BLUE, 800), at(u, ch(10, 1), .4)) +
    G("", moonIcon(500, 320, 18), at(u, ch(10, 1), .4)) + iconBox(110, 120, 110, G("scale(.16) translate(-320 -400)", heater(t, { temp: .8, on: 1 })), at(u, .2, .3));
});
// 11 · that alone can push you into a dearer tier: a staircase of tiers, the meter climbs one step
shot(11, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), up = at(u, 1.0, .9);
  for (var i = 0; i < 5; i++) s += R(80 + i * 100, 600 - i * 70, 100, 70 + i * 70, i === 3 ? mix("#e8dcc2", "#ecc19e", up) : "#e8dcc2", 2) + N(String(i + 1), 130 + i * 100, 640 - i * 70, 26, i === 3 ? mix("#2a2016", "#bd552f", up) : INK);
  var bx = lerp(230, 330, up), by = lerp(530 - 70 * 1, 530 - 70 * 2, up) - 30 - 10 * Math.abs(Math.sin(t * 4));
  s += C(bx, by, 22, ORANGE, 2.2) + N("+45", bx, by - 40, 26, ORANGE);
  return s + T("شرايح الكهربا", 320, 160, 32, INK, 800) + G("", tag("أغلى", 480, 260, 1, 30, ORANGE), at(u, 1.6, .3));
});
// 12 · and the heater itself? the camera on the element
shot(12, push(320, 470, 1.3, 1.45), function (u, d, t) {
  return paper() + heater(t, { temp: .85, on: 1, hl: null }) + G("", T("؟", 470, 330, 120, ORANGE, 800), at(u, .3, .3));
}, { tr: "in" });
// 13 · our water carries lime; the longer it stays hot, the faster it settles on the element
shot(13, push(320, 500, 1.45, 1.55), function (u, d, t) {
  var sc = clamp((u - ch(13, 1)) / (d - ch(13, 1))), s = paper() + heater(t, { temp: .85, on: 1, scale: sc * .7 });
  for (var i = 0; i < 26; i++) { var p = (t * .18 + hash(i)) % 1, x = 240 + hash(i + 11) * 160, y = 260 + p * 320; s += '<circle cx="' + f(x + 6 * Math.sin(t + i)) + '" cy="' + f(y) + '" r="2.6" fill="' + SCALE + '" stroke="' + INK + '" stroke-width=".9" opacity="' + f(Math.sin(p * Math.PI)) + '"/>'; }
  return s + label(300, 470, 230, 400, "جير", OLIVE, at(u, .6, .4), 28) + G("", thermo(480, 710, 130, .85, "60°"), at(u, ch(13, 1), .4));
});
// 14 · like the white layer inside the kettle
shot(14, push(330, 440, 1.4, 1.5), function (u, d, t) {
  return paper() + kettle(320, 420, t, at(u, .3, 1.2)) + label(300, 486, 290, 590, "الطبقة البيضا", OLIVE, at(u, ch(14, 1), .5), 26);
}, { tr: "out" });
// 15 · the crust insulates the rod: heat stays in, the rod runs hotter, uses more, then burns out
shot(15, push(320, 400, 0.95, 1.02), function (u, d, t) {
  var sc = at(u, .2, 1), hot = clamp((u - ch(15, 1)) / 2.5), burn = u > ch(15, 3) + .3, s = paper() + rodCut(t, sc, burn ? 0 : hot);
  s += arrow(320, 400, 320 + 140 * (1 - sc * .7), 400, ORANGE, 6, 1) + arrow(320, 400, 320, 400 - 140 * (1 - sc * .7), ORANGE, 6, 1) + arrow(320, 400, 220, 500, ORANGE, 5, 1 - sc * .7);
  s += label(320 + 180, 400 + 60, 560, 600, "جير", OLIVE, at(u, .6, .4), 24) + label(320, 400, 120, 160, "السلك", ORANGE, at(u, .4, .4), 24);
  s += G("", thermo(560, 300, 160, burn ? .2 : .4 + .55 * hot, burn ? "" : Math.round(lerp(400, 800, hot)) + "°"), at(u, ch(15, 1), .3));
  if (burn) s += G("", '<path d="M300 380 l14 10 l-8 8 l18 12" stroke="' + INK + '" stroke-width="4" fill="none"/>' + cross(320, 400, 1.2, at(u, ch(15, 3) + .4, .4)), 1);
  return s;
});
// 16 · the worst part: the electricity itself
shot(16, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + dim(.5, heater(t, { temp: .85, on: 1 })) + bolt(320, 400, 3.2 + .2 * Math.sin(t * 9), ORANGE);
});
// 17a · a cracked sheath lets the current into the water
shot(17, push(320, 450, 1.5, 1.6), function (u, d, t) {
  var cr = at(u, .3, .4), lk = at(u, ch(17, 1), .5), s = paper() + heater(t, { temp: .85, on: 1 });
  s += G("", '<path d="M332 470 l12 8 l-8 10 l14 12" stroke="' + INK + '" stroke-width="3.4" fill="none"/>', cr);
  for (var i = 0; i < 8 && lk > 0; i++) { var a = i / 8 * 6.28 + t, r = 20 + ((t * 40 + i * 12) % 90); s += '<path d="M' + f(345 + Math.cos(a) * r) + ' ' + f(488 + Math.sin(a) * r) + ' l6 -8 l-4 0 l6 -8" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(lk * (1 - r / 110)) + '"/>'; }
  return s + label(340, 480, 250, 410, "شرخ", ORANGE, cr, 26);
}, { tr: "in" });
// 17b · no earth wire: it reaches you under the shower
shot([17, 2], push(300, 380, 0.92, 0.98), function (u, d, t) {
  return paper() + bathroom(t, { current: at(u, .9, .5) }) + G("", R(40, 520, 120, 120, "#f4ecdb", 1.6) + earth(100, 590, 1) + cross(100, 580, .9, at(u, .3, .4)) + T("أرضي", 100, 670, 22, INK, 800), at(u, 0, .3));
}, { tr: "out" });
// 18 · switch it off at the wall before you shower
shot(18, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var off = u > ch(18, 1) + .3;
  return paper() + wallSwitch(200, 380, !off) + G("translate(330 150) scale(.48)", heater(t, { noCut: 1, lamp: off ? 0 : 1 })) + check(200, 600, 1.3, at(u, ch(18, 1) + .7, .5), OLIVE) +
    G("", tag("قبل الدش", 470, 620, 1, 28, BLUE), at(u, ch(18, 2), .3)) + G("", tag("خصوصاً القديم", 330, 120, 1, 24, INK), at(u, ch(18, 3), .3));
});
// 19 · many think switching it off and on costs more. No.
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper();
  s += G("translate(60 160) scale(.42)", heater(t, { noCut: 1, lamp: 1 })) + G("translate(330 160) scale(.42)", heater(t, { noCut: 1, lamp: Math.sin(t * 1.5) > 0 ? 1 : 0 }));
  s += T("شغال على طول", 190, 520, 24, INK, 800) + T("اقفل وافتح", 460, 520, 24, INK, 800);
  s += G("", R(400, 560, 120, lerp(0, 120, at(u, .6, .6)), ORANGE, 2) + T("أكتر؟", 460, 720, 26, ORANGE, 800), at(u, .4, .3));
  return s + cross(460, 600, 1.4, at(u, lf(19, .92), .4)) + G("", tag("لأ", 460, 420, 1, 40, ORANGE), at(u, lf(19, .92), .3));
}, { tr: "fade" });
// 20 · cooler water loses heat more slowly: the off heater's loss arrows thin out, so reheating costs less than the leak it saved
shot(20, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var cool = clamp(u / (d * .6)), s = paper();
  s += G("translate(30 150) scale(.42)", heater(t, { temp: .9, leak: 1, leakW: 1.4 })) + G("translate(330 150) scale(.42)", heater(t, { temp: .9 - .5 * cool, leak: 1 - .6 * cool, leakW: 1 - .6 * cool }));
  s += N("60°", 165, 140, 30, ORANGE) + N(Math.round(60 - 20 * cool) + "°", 465, 140, 30, mix("#bd552f", "#4a6f8a", cool));
  var a = 200, b = 200 * (1 - .45 * cool);
  s += R(110, 700 - a * .5, 110, a * .5, ORANGE, 2) + R(410, 700 - b * .5, 110, b * .5, BLUE, 2) + '<path d="M60 700 H580" stroke="' + INK + '" stroke-width="2.4"/>' + T("الحرارة اللي بتضيع", 320, 750, 22, INK, 700);
  return s + check(465, 560, 1.1, at(u, ch(20, 1) + .4, .5), OLIVE);
});
// 21 · recap: it warms the bathroom on your money, scales up faster, and leaves you under the shower with the power on
shot(21, pan(300, 300, 330, 470, 1.12), function (u, d, t) {
  var s = paper(), k1 = at(u, .1, .4), k2 = at(u, lf(21, .55), .4), k3 = at(u, lf(21, .72), .4);
  s += G("", R(60, 110, 520, 170, "#f4ecdb", 1.6) + G("translate(80 120) scale(.26)", heater(t, { noCut: 1, leak: 1, lamp: 1 })) + C(440 - 60 * ((t * .6) % 1), 195 - 14 * Math.sin(((t * .6) % 1) * Math.PI), 30, "#e6c35a", 2.2) + N("£", 440 - 60 * ((t * .6) % 1), 205 - 14 * Math.sin(((t * .6) % 1) * Math.PI), 28, INK) + arrow(380, 195, 230, 195, ORANGE, 4, 1), k1);
  s += G("", R(60, 310, 520, 170, "#f4ecdb", 1.6) + G("translate(120 350)", '<path d="M0 40 H260" stroke="' + INK + '" stroke-width="22" stroke-linecap="round"/><path d="M0 40 H260" stroke="' + SCALE + '" stroke-width="17" stroke-linecap="round"/><path d="M0 40 H260" stroke="' + ORANGE + '" stroke-width="5"/>' + T("جير", 340, 50, 30, OLIVE, 800)), k2);
  s += G("", R(60, 510, 520, 170, "#f4ecdb", 1.6) + G("translate(130 520) scale(.16)", '<path d="M0 0 h300 v40 h-300 Z" fill="#b9b6ad" stroke="' + INK + '" stroke-width="10"/>') + bolt(300 + 5 * Math.sin(t * 13), 595, 1.4 + .2 * Math.abs(Math.sin(t * 5)), ORANGE) + T("الدش", 440, 605, 30, BLUE, 800) + (function () { var d = ""; for (var i = 0; i < 8; i++) { var q = (t * 1.2 + hash(i)) % 1; d += '<path d="M' + f(150 + hash(i + 2) * 60) + ' ' + f(560 + q * 100) + ' v10" stroke="' + BLUE + '" stroke-width="3" opacity="' + f(1 - q) + '"/>'; } return d; })(), k3);
  for (var i = 0; i < 3; i++) s += callout(String(i + 1), 40, 195 + i * 200, [k1, k2, k3][i]);
  return s;
});
// 22 · odd fact: a well-insulated tank loses about one degree an hour, so off at night it is still hot in the morning
shot(22, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var p = clamp((u - lf(22, .45)) / (d * .5)), hrs = 23 + 8 * p, s = paper();
  s += G("translate(10 140) scale(.62)", heater(t, { temp: .9 - .15 * p, noCut: 0, on: 0 })) + thermo(470, 600, 300, .82 - .12 * p, Math.round(60 - 8 * p) + "°") + clockFace(470, 160, 58, hrs, BLUE);
  s += G("", moonIcon(560, 90, 20), 1 - p) + G("", sunIcon(570, 90, 18, t), p);
  return s + G("", tag("1° كل ساعة", 200, 120, 1, 28, ORANGE), at(u, lf(22, .2), .4)) + G("", tag("لسه سخنة", 200, 680, 1, 28, ORANGE), at(u, lf(22, .85), .4));
});

// ── intro, bumper, summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: the heater on the bathroom wall, its lamp on, a clock racing round the day. line 1: a 24-h ring with a thin
  // 15-minute blue slice. line 2: night, nobody at the tap, the lamp still lighting up.
  var s = R(0, 0, 608, 660, TILE, 0); for (var y = 0; y < 660; y += 44) s += '<path d="M0 ' + y + ' H608" stroke="#c8cec6" stroke-width="1.3"/>'; for (var x = 0; x < 608; x += 44) s += '<path d="M' + x + ' 0 V660" stroke="#c8cec6" stroke-width="1.3"/>';
  var night = li >= 2, lamp = night ? (Math.sin(t * 2) > -.3 ? 1 : 0) : 1;
  s += G("translate(-30 40) scale(.78)", heater(t, { noCut: 1, lamp: lamp, leak: .6 }));
  if (li === 0) s += clockFace(480, 140, 70, t * 3, ORANGE) + N("24", 480, 250, 34, ORANGE);
  if (li >= 1) { var u = t - LN[1].start, sl = .25 / 24 * 360 * 6; s += G("", C(480, 150, 72, "#f4ecdb", 2.4) + '<circle cx="480" cy="150" r="56" fill="none" stroke="' + ORANGE + '" stroke-width="22"/>' + '<path d="M480 150 L480 70 A80 80 0 0 1 ' + f(480 + 80 * Math.sin(sl * Math.PI / 180)) + ' ' + f(150 - 80 * Math.cos(sl * Math.PI / 180)) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>' + T("ربع ساعة", 480, 260, 24, BLUE, 800), ease(u / .4)); }
  if (night) { var v = t - LN[2].start; s += G("", '<rect x="0" y="0" width="608" height="660" fill="#1d2430" opacity=".18"/>' + moonIcon(90, 80, 30) + G("translate(480 440)", '<path d="M-60 0 H10 V40" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M-60 0 H10 V40" stroke="#b9b6ad" stroke-width="7" fill="none"/>' + R(-20, -24, 40, 20, "#b9b6ad", 2)) + cross(480, 470, .8, ease((v - .5) / .4)), ease(v / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(7 -9) scale(.26)", heater(t, { temp: .85, on: Math.sin(t * 3) > 0 ? 1 : .3, leak: .8 }));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(170 -6) scale(.4)", heater(t, { temp: .85, on: 1 })) + G("translate(400 40) scale(.6)", wallSwitch(120, 160, 1)) +
    callout("1", 272, 175, ease(u / .3)) + callout("2", 345, 215, ease(u / .3 - .5)) + callout("3", 236, 96, ease(u / .3 - 1)) + callout("4", 470, 70, ease(u / .3 - 1.5));
};
