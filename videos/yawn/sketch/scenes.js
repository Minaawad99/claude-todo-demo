window.CHUNKS = [[0.0, 0.4524], [0.0, 0.4651], [0.0, 0.4727], [0.0, 0.4194], [0.0, 0.4306, 0.7083, 0.8611], [0.0, 0.3103], [0.0, 0.5], [0.0, 0.4239, 0.5978], [0.0, 0.7647], [0.0, 0.2639, 0.7222], [0.0], [0.0], [0.0, 0.4615], [0.0, 0.2535, 0.5493], [0.0, 0.3731, 0.6716], [0.0, 0.1919, 0.5051, 0.8283], [0.0, 0.3232, 0.4747, 0.7879], [0.0], [0.0, 0.4667], [0.0, 0.4789], [0.0, 0.3725], [0.0, 0.5441], [0.0, 0.1579, 0.4737, 0.7684], [0.0, 0.56], [0.0], [0.0]];
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

// ── «ليه بنتاوب؟» — drawings in the hand of the «طب إزاي؟» reference (sheets v04, v17, v20).
// Real shapes (refs/SOURCES.md): the head is a side profile with the skull and the mandible after the Commons side-skull
// diagram and Gray's Anatomy plate 176: the jaw is one bone (body + ramus) hinged at the condyle just in front of the ear,
// with the coronoid process under the cheekbone. A yawn: the jaw drops about 25°, the condyle slides forward, the eyes
// squeeze, a long breath goes in. Every drawing moves inside itself, not only the camera: jaws open and close, air and
// blood run, fans and gears turn, the scan sweeps.

var SKIN_L = "#e2b096", HAIR = "#4a3a2e", BONE = "#efe6cf", BONE_D = "#cdbf9c", BRAIN_W = "#e08a6a", BRAIN_C = "#9cc0d4", MOUTH = "#5a1f18", TONGUE = "#d27a74";
var BLOOD = "#b8402c", COOL = "#4a7fa8";
function rotP(px, py, cx, cy, a) { var r = a * Math.PI / 180, dx = px - cx, dy = py - cy; return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)]; }
// how open a yawn is at u: rises (breath in), holds, falls. u0 start, dur length (a real yawn ≈ 6 s; shorter here when the line is short)
function yawnK(u, u0, dur) { var x = clamp((u - u0) / (dur || 4)); if (x <= 0 || x >= 1) return 0; return clamp(1.25 * Math.pow(Math.sin(Math.PI * x), .8)); }
function loopYawn(t, per, ph) { var x = ((t + (ph || 0)) % per) / per; return yawnK(x * per, per * .1, per * .7); }

// ── the human head in profile, facing right. op 0..1 how open; o: {skull, brain (0 cool … 1 warm), air, blood, hair, shirt, cold}
var PIV = [14, 48];   // the jaw hinge (condyle), just in front of the ear
function headP(x, y, s, op, t, o) {
  o = o || {}; op = clamp(op); var a = op * 26, sh = op * 6, s1 = "";
  function J(px, py) { var p = rotP(px, py, PIV[0], PIV[1], a); return f(p[0] + sh) + " " + f(p[1] + sh * .3); }
  var skinOp = o.skull ? .42 : 1;
  // shoulders and neck (fixed)
  s1 += P("M-150 300 C-140 236 -90 214 -46 210 L60 210 C110 214 170 236 180 300 Z", o.shirt || "#8f9a7a", 2);
  s1 += '<g opacity="' + skinOp + '">' + P("M-52 214 L-62 118 L34 104 C42 150 52 186 62 214 Z", o.skin || SKIN, 2) + '<path d="M-40 150 C-20 170 20 172 40 150" stroke="' + SKIN2 + '" stroke-width="3" fill="none"/>' + '</g>';
  // the mouth inside: dark cavity between the upper lip and the turned jaw, the tongue, the teeth
  if (op > .02) {
    s1 += '<path d="M128 80 L64 80 L' + J(64, 84) + ' L' + J(126, 84) + ' Z" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="1.6"/>';
    s1 += '<ellipse cx="0" cy="0" rx="26" ry="9" fill="' + TONGUE + '" transform="translate(' + J(96, 96).replace(" ", " ") + ') rotate(' + f(a) + ')"/>';
  }
  // the head: cranium + face down to the upper lip (fixed) …
  var up = "M-62 118 C-112 84 -128 14 -122 -40 C-116 -120 -50 -165 25 -158 C90 -150 122 -100 120 -45 C119 -25 116 -8 126 8 L156 52 C160 60 152 66 140 64 L132 66 C134 72 132 78 126 80 L64 80 L" + PIV[0] + " " + PIV[1] + " Z";
  // … and the jaw with the lower lip and chin, turned about the hinge
  var jaw = "M" + J(126, 84) + " C" + J(130, 94) + " " + J(126, 102) + " " + J(120, 106) + " C" + J(126, 114) + " " + J(124, 124) + " " + J(116, 130) + " C" + J(106, 148) + " " + J(86, 156) + " " + J(64, 154) + " C" + J(42, 152) + " " + J(24, 142) + " " + J(10, 122) + " L" + J(PIV[0], PIV[1]) + " L" + J(64, 84) + " Z";
  s1 += '<g opacity="' + skinOp + '">' + P(jaw, o.skin || SKIN, 2.2) + P(up, o.skin || SKIN, 2.2) + '</g>';
  if (op > .02) s1 += '<path d="M120 80 H84 V85 H120 Z" fill="#fff" stroke="' + INK + '" stroke-width="1"/>' + '<path d="M' + J(118, 84) + ' L' + J(84, 84) + ' L' + J(84, 89) + ' L' + J(118, 89) + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
  // the skeleton inside (skull mode): cranium, upper jaw with teeth, the mandible turning with the jaw, the brain
  if (o.skull) {
    s1 += P("M-104 30 C-118 -20 -110 -110 -40 -140 C20 -160 90 -140 106 -70 C110 -40 108 -10 116 10 L134 46 L126 62 L70 66 L30 52 L-10 60 C-40 64 -80 60 -104 30 Z", BONE, 2);
    s1 += hatch("M-104 30 C-118 -20 -110 -110 -40 -140 C20 -160 90 -140 106 -70 C110 -40 108 -10 116 10 L134 46 L126 62 L70 66 L30 52 L-10 60 C-40 64 -80 60 -104 30 Z");
    s1 += P("M66 66 L124 64 L124 80 L68 80 Z", BONE, 1.6); for (var k = 0; k < 5; k++) s1 += R(70 + k * 11, 74, 10, 8, "#fff", 1, 2);
    s1 += C(-6, 30, 7, BONE_D, 1.6);   // the ear hole
    var mand = "M" + J(PIV[0], PIV[1] - 4) + " C" + J(8, 70) + " " + J(6, 104) + " " + J(14, 124) + " C" + J(34, 144) + " " + J(70, 150) + " " + J(96, 144) + " C" + J(110, 140) + " " + J(116, 128) + " " + J(116, 116) + " L" + J(112, 92) + " L" + J(66, 92) + " C" + J(46, 90) + " " + J(38, 80) + " " + J(40, 64) + " L" + J(48, 52) + " L" + J(32, 66) + " Z";
    s1 += P(mand, BONE, 2) + '<circle cx="' + J(PIV[0], PIV[1]).split(" ")[0] + '" cy="' + J(PIV[0], PIV[1]).split(" ")[1] + '" r="7" fill="' + BONE_D + '" stroke="' + INK + '" stroke-width="1.6"/>';
    for (k = 0; k < 5; k++) { var p0 = J(72 + k * 10, 92); s1 += '<rect x="0" y="0" width="9" height="8" rx="2" fill="#fff" stroke="' + INK + '" stroke-width="1" transform="translate(' + p0 + ') rotate(' + f(a) + ') translate(0 -8)"/>'; }
  }
  if (o.brain != null) {
    var bc = lerpC(BRAIN_C, BRAIN_W, clamp(o.brain)), br = "M-96 -30 C-104 -110 -30 -144 34 -134 C88 -124 104 -84 98 -40 C94 -8 60 4 22 -2 C-14 4 -60 14 -88 -6 Z";
    s1 += P(br, bc, 2.2);
    s1 += '<path d="M-70 -70 q14 -16 28 0 t28 0 t28 0 M-60 -40 q12 -14 26 0 t26 0 t26 0 M-30 -104 q14 -12 26 0 t26 0 M10 -20 q10 -10 22 0 t22 0" stroke="' + INK + '" stroke-width="1.6" fill="none" opacity=".55"/>';
    if (o.brain > .55) for (k = 0; k < 3; k++) { var hy = ((t * 30 + k * 22) % 60); s1 += '<path d="M' + f(-30 + k * 40) + ' ' + f(-150 - hy) + ' q6 -8 0 -16 t0 -16" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity="' + f(1 - hy / 60) + '"/>'; }
  }
  // eye (squeezed shut in a yawn, otherwise open and blinking), brow, ear, hair
  var blink = ((t * .5 + x * .01) % 1) < .05;
  s1 += op > .35 || blink ? '<path d="M78 -12 q10 6 20 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<ellipse cx="88" cy="-12" rx="7" ry="6" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="91" cy="-12" r="3.2" fill="' + INK + '"/>';
  s1 += '<path d="M76 ' + f(-28 - op * 4) + ' q12 -6 24 0" stroke="' + HAIR + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
  if (!o.skull) s1 += P("M-14 10 C-30 6 -36 30 -24 46 C-18 54 -6 52 -4 44", SKIN2, 2) + (o.hair === false ? "" : P("M-122 -40 C-120 -120 -50 -168 30 -160 C86 -152 116 -110 118 -70 C96 -96 50 -106 0 -100 C-40 -96 -60 -60 -70 -20 C-80 6 -100 20 -110 30 C-124 10 -124 -10 -122 -40 Z", o.hairCol || HAIR, 2));
  if (o.cold) s1 += G("", R(60, -78, 70, 34, "#bcd6e6", 2, 10) + '<path d="M70 -70 l8 8 M90 -66 l6 -8 M108 -72 l8 8" stroke="#fff" stroke-width="2.4"/>', 1);
  // air: blue chevrons streaming into the open mouth while it opens
  if (o.air && op > .15) for (k = 0; k < 6; k++) { var q = ((t * 1.4 + k / 6) % 1), ax = lerp(260, 132, q), ay = lerp(70 + (k % 3 - 1) * 26, 86, q); s1 += '<path d="M' + f(ax + 10) + ' ' + f(ay - 9) + ' L' + f(ax) + ' ' + f(ay) + ' L' + f(ax + 10) + ' ' + f(ay + 9) + '" stroke="' + BLUE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(op * (1 - q * .4)) + '"/>'; }
  // blood: the artery up the neck to the brain (warm red), faster while the jaw stretches; and the cooler return (blue)
  if (o.blood) {
    var sp = 40 + 160 * op;
    s1 += '<path d="M40 214 C34 160 30 110 24 70 C20 30 10 -10 -10 -40" stroke="' + BLOOD + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M40 214 C34 160 30 110 24 70 C20 30 10 -10 -10 -40" stroke="#f2b8a8" stroke-width="3" fill="none" stroke-dasharray="8 12" stroke-dashoffset="' + f(t * sp) + '"/>';
    if (o.blood > 1) s1 += '<path d="M-30 -40 C-40 0 -44 60 -40 120 C-38 160 -30 190 -24 214" stroke="' + COOL + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-30 -40 C-40 0 -44 60 -40 120 C-38 160 -30 190 -24 214" stroke="#cfe2ee" stroke-width="3" fill="none" stroke-dasharray="8 12" stroke-dashoffset="' + f(-t * sp) + '"/>';
  }
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(o.flip ? -s : s) + ' ' + f(s) + ')', s1);
}
function lerpC(c1, c2, k) { var a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16), r = Math.round(lerp(a >> 16, b >> 16, k)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, k)), bl = Math.round(lerp(a & 255, b & 255, k)); return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1); }
// a stopwatch that runs
function stopwatch(x, y, r, secs, k) {
  var a = -Math.PI / 2 + (secs % 60) / 60 * Math.PI * 2, s = C(x, y, r, "#f4ecdb", 2.4) + R(x - 7, y - r - 14, 14, 12, INK, 0);
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * r * .82) + ' ' + f(y + Math.sin(b) * r * .82) + ' L' + f(x + Math.cos(b) * r * .95) + ' ' + f(y + Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(-Math.PI / 2) * r * .85) + ' ' + f(y + Math.sin(-Math.PI / 2) * r * .85) + ' A' + f(r * .85) + ' ' + f(r * .85) + ' 0 ' + (secs % 60 > 30 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * r * .85) + ' ' + f(y + Math.sin(a) * r * .85) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y + Math.sin(a) * r * .8) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
}
// a thermometer whose level moves (k 0..1), red when warm
function thermo(x, y, h, k) {
  var lv = lerp(h * .15, h * .85, clamp(k)), col = lerpC(BLUE, ORANGE, clamp(k));
  return R(x - 9, y - h, 18, h, "#fff", 2, 9) + '<rect x="' + f(x - 4) + '" y="' + f(y - lv) + '" width="8" height="' + f(lv) + '" fill="' + col + '"/>' + C(x, y + 6, 15, col, 2);
}
// a gear that turns (speed set by the caller)
function gear(x, y, r, ang, col) {
  var d = "", n = 10; for (var i = 0; i < n * 2; i++) { var a0 = (i / (n * 2)) * Math.PI * 2 + ang, rr = i % 2 ? r : r * 1.22; d += (i ? " L" : "M") + f(x + Math.cos(a0 - .12) * rr) + " " + f(y + Math.sin(a0 - .12) * rr) + " L" + f(x + Math.cos(a0 + .12) * rr) + " " + f(y + Math.sin(a0 + .12) * rr); }
  return P(d + " Z", col || "#b9b4a4", 2) + C(x, y, r * .35, PAPER, 2);
}
// a fan: four blades spinning
function fan(x, y, r, ang) { var s = C(x, y, r * 1.12, "#f4ecdb", 2.4); for (var i = 0; i < 4; i++) { var a = ang + i * Math.PI / 2; s += G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a * 57.3) + ')', P("M0 0 C" + f(r * .3) + " " + f(-r * .5) + " " + f(r * .9) + " " + f(-r * .4) + " " + f(r * .9) + " 0 C" + f(r * .6) + " " + f(r * .18) + " " + f(r * .2) + " " + f(r * .12) + " 0 0 Z", "#9cb7c8", 1.6)); } return s + C(x, y, r * .14, INK, 0); }
// the dog in profile facing left (a short-coated tan dog): the lower jaw drops about its hinge, the tongue curls
function dog(x, y, s, op, t) {
  op = clamp(op); var a = -op * 30, pv = [-10, 30], r = "";
  function J(px, py) { var p = rotP(px, py, pv[0], pv[1], a); return f(p[0]) + " " + f(p[1]); }
  r += P("M40 60 C70 90 90 150 100 220 L-30 220 C-20 160 -10 110 0 70 Z", "#c79a5e", 2);   // neck and chest
  if (op > .02) r += '<path d="M-96 20 L-10 26 L' + J(-10, 32) + ' L' + J(-92, 32) + ' Z" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + J(-70, 30) + ' C' + J(-84, 20) + ' ' + J(-96, 22) + ' ' + J(-92, 34) + '" stroke="' + TONGUE + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
  r += P("M" + J(-10, 30) + " L" + J(-92, 30) + " C" + J(-98, 36) + " " + J(-92, 46) + " " + J(-80, 46) + " L" + J(-20, 50) + " Z", "#b8894e", 2);   // lower jaw
  r += P("M-10 30 L-96 20 C-110 18 -114 4 -104 -4 L-60 -14 C-40 -40 -10 -60 30 -56 C70 -52 86 -20 80 20 C76 50 50 70 20 66 C6 62 -4 46 -10 30 Z", "#c79a5e", 2.2);   // head and upper muzzle
  r += '<ellipse cx="-108" cy="2" rx="9" ry="7" fill="' + INK + '"/>';   // nose
  if (op > .02) r += '<path d="M-90 20 l4 9 l4 -8 M-30 25 l3 8 l3 -7" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
  r += op > .35 ? '<path d="M-36 -24 q8 4 16 0" stroke="' + INK + '" stroke-width="3" fill="none"/>' : C(-28, -24, 5, INK, 0) + '<circle cx="-26" cy="-26" r="1.6" fill="#fff"/>';
  r += G('rotate(' + f(4 * Math.sin(t * 2)) + ' 30 -40)', P("M20 -50 C40 -70 66 -60 64 -30 C62 0 50 30 40 40 C30 20 24 -10 20 -50 Z", "#8a6234", 2));   // floppy ear
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
}
// a macaque head (pink face, brown fur, big canines when it yawns) and a mouse, both facing right
function monkey(x, y, s, op, t) {
  op = clamp(op); var a = op * 30, pv = [10, 20], r = "";
  function J(px, py) { var p = rotP(px, py, pv[0], pv[1], a); return f(p[0]) + " " + f(p[1]); }
  r += C(0, 0, 62, "#9a7a5a", 2.2) + hatch("M-62 0 a62 62 0 1 0 124 0 a62 62 0 1 0 -124 0");
  if (op > .02) r += '<path d="M62 22 L20 22 L' + J(20, 26) + ' L' + J(60, 26) + ' Z" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M52 22 l3 12 l3 -12 M' + J(52, 26) + ' l3 -10 l3 10" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
  r += P("M" + J(10, 20) + " L" + J(62, 26) + " C" + J(64, 40) + " " + J(50, 50) + " " + J(30, 48) + " Z", "#d9a08a", 2);
  r += P("M0 -40 C30 -44 56 -24 60 0 C66 10 66 20 62 22 L10 20 C-6 10 -10 -20 0 -40 Z", "#e3b4a0", 2);
  r += op > .35 ? '<path d="M28 -14 q8 4 16 0" stroke="' + INK + '" stroke-width="2.6" fill="none"/>' : C(36, -14, 4, INK, 0);
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
}
function mouse(x, y, s, op, t) {
  op = clamp(op); var a = op * 30, r = "";
  function J(px, py) { var p = rotP(px, py, 0, 10, a); return f(p[0]) + " " + f(p[1]); }
  r += P("M-60 30 C-70 -10 -30 -30 10 -24 C40 -20 60 0 70 10 L0 10 Z", "#b9b4ac", 2) + C(-14, -30, 16, "#d9c0bc", 2);
  if (op > .02) r += '<path d="M66 10 L10 10 L' + J(10, 14) + ' L' + J(62, 14) + ' Z" fill="' + MOUTH + '"/>';
  r += P("M" + J(0, 10) + " L" + J(62, 12) + " C" + J(56, 26) + " " + J(30, 30) + " " + J(0, 28) + " Z", "#b9b4ac", 2) + C(70, 8, 4, "#d48a8a", 1.4);
  r += '<path d="M66 8 l24 -8 M66 10 l26 2 M66 12 l22 10" stroke="' + INK + '" stroke-width="1"/>' + (op > .35 ? '<path d="M22 -6 q5 3 10 0" stroke="' + INK + '" stroke-width="2" fill="none"/>' : C(28, -6, 3, INK, 0));
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', r);
}
// the ultrasound scan: a grey fan, the sweep line moving, the fetus in profile opening its mouth
function scan(cx, cy, r, op, t) {
  var id = "sc" + (++CLIPN), s = "", a0 = Math.PI / 2 + .7, a1 = Math.PI / 2 - .7;
  var fanD = "M" + cx + " " + cy + " L" + f(cx + Math.cos(a0) * r) + " " + f(cy + Math.sin(a0) * r) + " A" + r + " " + r + " 0 0 0 " + f(cx + Math.cos(a1) * r) + " " + f(cy + Math.sin(a1) * r) + " Z";
  s += '<clipPath id="' + id + '"><path d="' + fanD + '"/></clipPath>' + P(fanD, "#2a2826", 2.4);
  var g = ""; for (var i = 0; i < 70; i++) g += '<circle cx="' + f(cx + (hash(i) - .5) * r * 1.3) + '" cy="' + f(cy + hash(i + 9) * r) + '" r="' + f(1 + hash(i + 3) * 2.4) + '" fill="#8a8680" opacity="' + f(.25 + .4 * hash(i + 5)) + '"/>';
  // the womb wall and the fetus: big head, curled body, the jaw opening
  g += '<ellipse cx="' + cx + '" cy="' + f(cy + r * .55) + '" rx="' + f(r * .5) + '" ry="' + f(r * .36) + '" fill="none" stroke="#d8d4cc" stroke-width="6" opacity=".55"/>';
  // the fetus in profile (week 11: a big round head, the face to the right, the body curled under it)
  var fj = op * 22, fb = '<ellipse cx="-30" cy="70" rx="70" ry="52" fill="#cfcac0" opacity=".8" transform="rotate(-20 -30 70)"/>' + '<circle cx="0" cy="0" r="62" fill="#e2ded6" opacity=".92"/>' +
    '<path d="M52 -6 C64 0 66 14 58 22" stroke="#e2ded6" stroke-width="14" fill="none" stroke-linecap="round"/>' + G('rotate(' + f(fj) + ' 30 30)', '<path d="M30 30 C46 38 58 40 64 30" stroke="#e2ded6" stroke-width="12" fill="none" stroke-linecap="round"/>') +
    '<path d="M54 26 L' + f(60 + 4 * op) + ' ' + f(30 + 8 * op) + '" stroke="#2a2826" stroke-width="' + f(2 + op * 6) + '" stroke-linecap="round"/>' + '<circle cx="34" cy="-10" r="6" fill="#2a2826" opacity=".7"/>' + '<path d="M-60 90 C-40 110 0 120 20 110" stroke="#e2ded6" stroke-width="10" fill="none" stroke-linecap="round"/>';
  g += G('translate(' + f(cx - 10 + 3 * Math.sin(t * 1.3)) + ' ' + f(cy + r * .5) + ') scale(.95)', fb);
  var sw = cx + Math.sin(t * 1.6) * r * .6; g += '<path d="M' + cx + ' ' + cy + ' L' + f(sw) + ' ' + f(cy + r) + '" stroke="#fff" stroke-width="2" opacity=".35"/>';
  return s + '<g clip-path="url(#' + id + ')">' + g + '</g>' + P(fanD, "none", 2.4);
}
// an O₂ molecule (two balls) drifting
function o2(x, y, sc, col) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')', C(-9, 0, 12, col || "#bcd6e6", 1.6) + C(9, 0, 12, col || "#bcd6e6", 1.6) + T("O₂", 0, 34, 14, BLUE, 800)); }
// a gas cylinder with a tube to a mask; bubbles run along the tube
function tank(x, y, label, col, t) {
  var s = R(x - 30, y - 140, 60, 150, col, 2.4, 22) + R(x - 10, y - 160, 20, 22, "#888", 2) + T(label, x, y - 60, 20, "#fff", 800);
  s += '<path d="M' + x + ' ' + (y - 160) + ' C' + x + ' ' + (y - 220) + ' ' + (x + 80) + ' ' + (y - 220) + ' ' + (x + 120) + ' ' + (y - 170) + '" stroke="' + INK + '" stroke-width="5" fill="none"/>';
  for (var i = 0; i < 4; i++) { var q = (t * .8 + i / 4) % 1, bx = lerp(x, x + 120, q), by = lerp(y - 160, y - 170, q) - Math.sin(q * Math.PI) * 45; s += C(bx, by, 4, "#fff", 1); }
  return s;
}
function counter(x, y, n, k) { return R(x - 50, y - 30, 100, 56, "#f4ecdb", 2) + N(String(Math.round(n * clamp(k))), x, y + 12, 34, INK); }

// ── shots (line numbers from script.txt) ──
// 4 · a yawn: about 6 seconds — mouth wide open, a long breath in, the jaw stretching (skull inside), a stopwatch runs
shot(4, push(330, 420, 1.0, 1.06), function (u, d, t) {
  var op = yawnK(u, .2, 5.2);
  return paper() + headP(280, 380, 1.55, op, t, { skull: true, air: true }) + stopwatch(530, 130, 60, Math.min(6, u * 1.1) * 10, 1) + N(f(Math.min(6, u * 1.1)) + " s", 530, 230, 30, ORANGE) +
    label(450, 520, 480, 640, "الفك بيتمط", OLIVE, at(u, 3.6, .5), 24) + label(500, 500, 540, 400, "نفس طويل", BLUE, at(u, 2.4, .5), 22) + label(470, 470, 380, 690, "", INK, 0);
});
// 5 · it starts early: an ultrasound fan, the fetus opening its mouth, week 11
shot(5, push(320, 400, 1.04, 1.0), function (u, d, t) {
  return paper() + R(70, 120, 500, 520, "#d9d4c8", 2.4, 14) + scan(320, 140, 470, yawnK(u, .6, 3), t) + numBox("11", 500, 590, at(u, 2.4, .3), 40) + G("", T("أسبوع", 500, 650, 22, INK, 800), at(u, 2.6, .3)) +
    tag("الجنين", 170, 600, at(u, .6, .3), 28, OLIVE);
}, { tr: "out" });
// 6 · the myth: «we yawn for oxygen» — O₂ balls float to the yawning head, then ✗
shot(6, push(300, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + headP(240, 400, 1.4, yawnK(u, .2, 2.6), t, { air: true });
  for (var i = 0; i < 6; i++) { var q = (t * .35 + i / 6) % 1; s += o2(lerp(600, 440, q) + 10 * Math.sin(t * 2 + i), 200 + i * 60 + 8 * Math.cos(t * 2 + i), 1.2); }
  return s + tag("محتاج أكسجين؟", 330, 120, at(u, .4, .3), 28) + cross(330, 112, 1.4, at(u, d - .8, .45));
});
// 7 · the test: pure oxygen, then air full of CO₂ — the yawn count does not change
shot(7, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var k2 = at(u, 3.4, .4), s = paper();
  s += tank(90, 640, "O₂", BLUE, t) + headP(330, 430, .9, loopYawn(t, 3.2), t, {}) + '<path d="M210 470 L330 520" stroke="' + INK + '" stroke-width="5"/>' + R(400, 470, 40, 30, "#cfe0ea", 2, 8);
  s += counter(520, 160, 24, at(u, .4, 1.6)) + T("تاوبات", 520, 220, 20, INK, 700);
  if (k2 > 0) s += G("", tank(90, 640, "CO₂", "#7a7a72", t) + counter(520, 300, 24, at(u, 3.6, 1.6)) + T("=", 520, 250, 40, ORANGE, 800), k2);
  return s;
});
// 8 · «قاعدة صغيرة»: a pinned card with a brain and a thermometer
shot(8, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", '<rect x="120" y="200" width="400" height="340" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 370)"/>' + C(320, 208, 10, ORANGE, 2) + T("القاعدة", 320, 270, 40, INK, 800), at(u, .2, .4)) +
    appear(at(u, .6, .4), G("translate(280 430) scale(.65)", headP(0, 0, 1, 0, t, { brain: .5 + .5 * Math.sin(t * 2), hair: false, skull: false }).replace(/<path d="M-150 300[^>]*>/, "")) + thermo(440, 480, 120, .5 + .5 * Math.sin(t * 2)));
});
// 9 · the brain works best at its temperature: as it warms, the gear inside slows; thumbnail: a laptop with its fan
shot(9, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var k = clamp((u - 1) / 3), spd = lerp(2.4, .4, k), ang = (u < 1 ? u * 2.4 : 2.4 + (u - 1) * lerp(2.4, 1.4, k * .5)) ;
  var s = paper() + headP(260, 440, 1.6, 0, t, { brain: k, skull: true });
  s += G("translate(262 360)", gear(-40, -60, 26, ang, "#c9b98f") + gear(8, -46, 18, -ang * 1.4, "#c9b98f"));
  s += thermo(520, 420, 220, k) + label(520, 300, 600, 220, "أسخن", ORANGE, at(u, 3, .5), 22);
  return s + iconBox(100, 110, 140, R(-50, -10, 100, 50, "#9aa3ad", 2, 4) + R(-44, -50, 88, 42, "#2b3a44", 2, 3) + fan(30, 15, 14, t * 8), at(u, .4, .3));
});
// 10 · «طب التاوباية مالها بالحرارة؟»
shot(10, push(320, 420, 1.0, 1.08), function (u, d, t) { return paper() + headP(260, 420, 1.4, loopYawn(t, 2.6), t, { brain: .7 }) + thermo(500, 420, 160, .7 + .1 * Math.sin(t * 3)) + T("؟", 500, 200, 110, ORANGE, 800); });
// 11 · the strongest idea: a yawn is a fan for the brain
shot(11, push(300, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + headP(280, 440, 1.5, yawnK(u, .1, 3), t, { brain: lerp(.8, .3, clamp(u / 3)), skull: true, air: true }) + fan(250, 290, 60, t * 7) + tag("مروحة للمخ", 320, 660, at(u, 1, .3), 32, BLUE);
}, { tr: "in" });
// 12 · the long breath brings cooler air; the stretching jaw pushes more blood up to the head
shot(12, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var op = yawnK(u, .2, 5.4);
  return paper() + headP(270, 400, 1.5, op, t, { skull: true, air: true, blood: 1, brain: lerp(.8, .4, clamp(u / 5)) }) +
    label(470, 520, 520, 660, "هوا أبرد", BLUE, at(u, .8, .5), 24) + label(310, 580, 160, 700, "دم أكتر", ORANGE, at(u, 3, .5), 24);
});
// 13 · warm blood leaves, cooler blood comes in, like opening a window in a stuffy room (thumbnail: the window swings open)
shot(13, push(300, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper() + headP(260, 420, 1.5, yawnK(u, .3, 4.4), t, { skull: true, blood: 2, brain: lerp(.75, .25, clamp(u / 4.5)) });
  s += label(220, 650, 380, 720, "السخن بيمشي", ORANGE, at(u, .4, .5), 22) + label(200, 600, 120, 120, "", INK, 0);
  var w = clamp((u - 2.2) / .8);
  return s + iconBox(520, 130, 170, R(-60, -60, 120, 120, "#cfe0ea", 2) + '<path d="M0 -60 V60 M-60 0 H60" stroke="' + INK + '" stroke-width="2"/>' + G("", '<path d="M0 -60 L' + f(-60 * Math.cos(w * 1.2)) + ' ' + f(-60 + 14 * w) + ' L' + f(-60 * Math.cos(w * 1.2)) + ' ' + f(60 - 14 * w) + ' L0 60 Z" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2"/>') + (w > .3 ? wave(-50, -20 + 10 * Math.sin(t), 50, -20, t, BLUE, 4, 20, 1, 2) + wave(-50, 25, 50, 25, t + 1, BLUE, 4, 20, 1, 2) : ""), at(u, 2, .3));
}, { tr: "out" });
// 14 · we yawn more before sleep and after waking, when the brain's temperature shifts: moon side, sun side
shot(14, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper() + R(-40, -40, 360, 900, "#d8d6d0", 0) + R(320, -40, 360, 900, "#f3e6c4", 0) + '<path d="M320 -40 V900" stroke="' + INK + '" stroke-width="2"/>';
  s += G("translate(120 140)", '<circle r="40" fill="#eae6d8" stroke="' + INK + '" stroke-width="2"/><circle cx="18" cy="-10" r="36" fill="#d8d6d0"/>') + G("translate(520 140)", '<circle r="40" fill="#e8b45a" stroke="' + INK + '" stroke-width="2"/>' + (function () { var r = ""; for (var i = 0; i < 8; i++) { var a = i / 8 * 6.28 + t * .5; r += '<path d="M' + f(Math.cos(a) * 50) + ' ' + f(Math.sin(a) * 50) + ' L' + f(Math.cos(a) * 66) + ' ' + f(Math.sin(a) * 66) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return r; })());
  s += headP(150, 440, .95, loopYawn(t, 3.4), t, { brain: .55 + .2 * Math.sin(t) }) + headP(490, 440, .95, loopYawn(t, 3.4, 1.7), t, { brain: .55 + .2 * Math.cos(t) });
  return s + T("قبل النوم", 150, 240, 26, BLUE, 800) + T("بعد ما نصحى", 490, 240, 26, ORANGE, 800);
});
// 15 · the cold-pack test: a cold pack on the forehead while watching yawns → far fewer yawns (bars grow)
shot(15, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper() + headP(170, 380, 1.05, 0, t, { cold: true }) + R(320, 140, 170, 120, "#2b3a44", 2.4, 6) + G("translate(400 205) scale(.42)", headP(0, 0, 1, loopYawn(t, 2.2), t, { hair: true }).replace(/<path d="M-150 300[^>]*>/, ""));
  s += '<path d="M380 260 v30 M430 260 v30 M360 290 H450" stroke="' + INK + '" stroke-width="3"/>';
  var k = at(u, 1.6, 2.2);
  s += R(390, 690 - 60 * k, 70, 60 * k, BLUE, 2) + R(500, 690 - 260 * k, 70, 260 * k, ORANGE, 2) + '<path d="M370 690 H590" stroke="' + INK + '" stroke-width="3"/>';
  return s + G("", T("ساقع", 425, 730, 22, BLUE, 800) + T("دافي", 535, 730, 22, ORANGE, 800), clamp(k * 2)) + label(250, 330, 240, 110, "كمادة ساقعة", BLUE, at(u, .4, .5), 22);
}, { tr: "out" });
// 16 · bigger brains, longer yawns: human > monkey > mouse, each yawning with its time bar
shot(16, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), rows = [[180, "human", 6.5, 1.8], [380, "monkey", 4.5, 3.0], [570, "mouse", 1.5, 4.2]];
  rows.forEach(function (r) {
    var k = at(u, r[3] - 1.2, .4), y = r[0], op = loopYawn(t, r[2] * .6 + .8, r[0] * .01);
    var who = r[1] === "human" ? G("translate(120 " + (y + 10) + ") scale(.42)", headP(0, 0, 1, op, t, {}).replace(/<path d="M-150 300[^>]*>/, "")) : r[1] === "monkey" ? monkey(120, y, .8, op, t) : mouse(110, y + 10, .9, op, t);
    s += appear(k, who) + R(220, y - 20, 50 * r[2] * at(u, r[3] - .8, 1), 40, r[1] === "human" ? ORANGE : "#d9b88c", 2) + (r[1] === "human" ? G("", N("~6 s", 240 + 50 * r[2], y + 12, 26, INK, "start"), at(u, r[3] - .2, .3)) : "");
  });
  return s;
});
// 17 · «طب ليه التاوباية بتتعدي؟»: one yawns, the next catches it
shot(17, push(320, 420, 1.0, 1.08), function (u, d, t) { return paper() + headP(160, 430, 1.0, yawnK(u, 0, 1.4), t, {}) + headP(470, 430, 1.0, yawnK(u, .6, 1.4), t, { flip: true, shirt: "#9a8a6a", hairCol: "#2a2016" }) + T("؟", 320, 220, 120, ORANGE, 800); });
// 18 · the answer is still a mystery: a magnifier over the chain, a question mark in it
shot(18, push(320, 420, 1.04, .98), function (u, d, t) {
  var mx = 320 + 120 * Math.sin(t * 1.2), my = 380 + 60 * Math.cos(t * 1.5);
  return paper() + headP(150, 430, .8, loopYawn(t, 2.4), t, {}) + headP(490, 430, .8, loopYawn(t, 2.4, 1.2), t, { flip: true, hairCol: "#2a2016" }) + draw("M230 350 Q320 290 410 350", 1, ORANGE, 3, ' stroke-dasharray="8 6"') +
    C(mx, my, 90, "#f4ecdb", 4) + '<path d="M' + f(mx + 64) + ' ' + f(my + 64) + ' l70 70" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/>' + T("؟", mx, my + 36, 110, ORANGE, 800) + tag("لغز", 320, 680, at(u, .6, .3), 36, ORANGE);
});
// 19 · it spreads faster between family and friends than strangers: yawns travel along the links
shot(19, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), c = [320, 400], ppl = [[150, 230, 1, "قرايب"], [490, 230, 1, "صحاب"], [140, 640, 0, "غريب"], [500, 640, 0, ""]], i;
  ppl.forEach(function (p) { s += p[2] ? '<path d="M' + c[0] + ' ' + c[1] + ' L' + p[0] + ' ' + p[1] + '" stroke="' + ORANGE + '" stroke-width="6"/>' : '<path d="M' + c[0] + ' ' + c[1] + ' L' + p[0] + ' ' + p[1] + '" stroke="' + MUTE + '" stroke-width="2" stroke-dasharray="8 8"/>'; });
  ppl.forEach(function (p, i) { var per = p[2] ? 1.6 : 3.6, q = ((t + i * .3) % per) / per; s += C(lerp(c[0], p[0], q), lerp(c[1], p[1], q), p[2] ? 9 : 6, p[2] ? ORANGE : MUTE, 1.4); });
  s += G("translate(320 420) scale(.4)", headP(0, 0, 1, loopYawn(t, 2), t, {}).replace(/<path d="M-150 300[^>]*>/, ""));
  ppl.forEach(function (p, i) { s += G("translate(" + p[0] + " " + (p[1] + 20) + ") scale(.32)", headP(0, 0, 1, p[2] ? loopYawn(t, 2, -.6) : (i === 2 ? loopYawn(t, 4.4, -2) : 0), t, { hairCol: ["#2a2016", "#6a4a2e", "#8a8070", "#3a2a1e"][i] }).replace(/<path d="M-150 300[^>]*>/, "")) + (p[3] ? T(p[3], p[0], p[1] + 110, 22, p[2] ? ORANGE : MUTE, 800) : ""); });
  return s;
});
// 20 · small children (under about 4) don't catch it: the adult yawns, the child doesn't
shot(20, push(320, 430, 1.04, 1.0), function (u, d, t) {
  return paper() + headP(200, 400, 1.15, loopYawn(t, 2.4), t, {}) + G("translate(480 520) scale(.7)", headP(0, 0, 1, 0, t, { flip: true, shirt: "#d9a088", hairCol: "#8a5a34" })) + numBox("< 4", 480, 230, at(u, .8, .3), 40) + T("سنين", 480, 295, 22, INK, 800) + cross(480, 420, .9, at(u, 2.2, .4));
});
// 21 · maybe an old way for a group to wake up together: a yawn runs along five people round a fire
shot(21, push(320, 430, 1.0, 1.05), function (u, d, t) {
  var s = paper(), i, fl = 1 + .15 * Math.sin(t * 9) + .1 * Math.sin(t * 17);
  s += G("translate(320 640) scale(" + f(fl) + " 1)", '<path d="M0 0 C-30 -20 -20 -60 0 -90 C4 -60 30 -40 20 -10 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 C-12 -10 -8 -30 2 -44 C4 -30 14 -20 8 -4 Z" fill="#e8b45a"/>') + '<path d="M260 650 L380 640 M270 640 L370 652" stroke="' + WOOD_D + '" stroke-width="10" stroke-linecap="round"/>';
  for (i = 0; i < 5; i++) { var x = 70 + i * 125, y = 380 + Math.abs(i - 2) * 40, op = yawnK(((t - .3 * i) % 3.5 + 3.5) % 3.5, .2, 2.2); s += G("translate(" + x + " " + y + ") scale(.38)", headP(0, 0, 1, op, t, { flip: i > 2, hairCol: ["#2a2016", "#6a4a2e", "#4a3a2e", "#3a2a1e", "#5a4030"][i], shirt: ["#8f9a7a", "#a98a6a", "#7a8a9a", "#9a7a6a", "#8a8a6a"][i] })); }
  return s + tag("كلنا نفوق", 320, 170, at(u, 1.4, .3), 32, ORANGE);
}, { tr: "out" });
// 22 · «يعني من الآخر»: three framed points
shot(22, push(320, 400, 0.98, 1.03), function (u, d, t) {
  var s = paper(), rows = [[.3, 0], [2.2, 1], [4.4, 2]];
  rows.forEach(function (r) { var k = at(u, r[0], .4), y = 150 + r[1] * 220; s += appear(k, R(60, y - 80, 520, 180, "#f4ecdb", 2) + callout(String(r[1] + 1), 90, y - 70, k)); });
  s += appear(at(u, .3, .4), G("translate(230 170) scale(.4)", headP(0, 0, 1, loopYawn(t, 2.6), t, { brain: .4, skull: true }).replace(/<path d="M-150 300[^>]*>/, "")) + fan(430, 150, 46, t * 7));
  s += appear(at(u, 2.2, .4), G("translate(200 390) scale(.34)", headP(0, 0, 1, loopYawn(t, 2.2), t, {}).replace(/<path d="M-150 300[^>]*>/, "")) + arrow(270, 370, 360, 370, ORANGE, 5, 1) + G("translate(440 390) scale(.34)", headP(0, 0, 1, loopYawn(t, 2.2, -.5), t, { flip: true }).replace(/<path d="M-150 300[^>]*>/, "")));
  s += appear(at(u, 4.4, .4), T("؟", 320, 640, 110, ORANGE, 800));
  return s;
}, { tr: "out" });
// 23 · the oddest: a dog yawns when it sees its owner yawn
shot(23, push(320, 430, 1.0, 1.06), function (u, d, t) {
  return paper() + headP(170, 360, 1.1, yawnK(u, .1, 2), t, {}) + dog(470, 470, 1.25, yawnK(u, 1.2, 2.2), t) + draw("M260 280 Q380 220 450 380", at(u, .8, .5), ORANGE, 3, ' stroke-dasharray="8 6"') + label(470, 470, 380, 700, "الكلب", OLIVE, at(u, .4, .5), 24);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: one person yawns, the one facing them catches it. line 1: the word itself. line 2: scientists don't agree (two crossed notes)
  var u0 = t - LN[0].start, s = "";
  s += headP(150, 330, .95, yawnK(u0, .3, 3), t, {}) + headP(460, 330, .95, yawnK(u0, 1.6, 3), t, { flip: true, shirt: "#9a8a6a", hairCol: "#2a2016" });
  if (li >= 1) { var u1 = t - LN[1].start; s += tag("تاوباية", 300, 590, ease(u1 / .3), 34, ORANGE); }
  if (li >= 2) { var u2 = t - LN[2].start; s += G("translate(300 70)", T("؟", 0, 40, 100, ORANGE, 800), ease(u2 / .3)); }
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(70 140) scale(.42)", headP(0, 0, 1, loopYawn(t, 2.6), t, {}).replace(/<path d="M-150 300[^>]*>/, "")); };
SCENE.outro = function (svg, u, t) {
  return G("translate(250 150) scale(.62)", headP(0, 0, 1, loopYawn(t, 3), t, { skull: true, air: true, blood: 1, brain: .4 }).replace(/<path d="M-150 300[^>]*>/, "")) +
    callout("1", 300, 230, ease(u / .3)) + callout("2", 400, 110, ease(u / .3 - .5)) + callout("3", 240, 260, ease(u / .3 - 1)) + callout("4", 230, 80, ease(u / .3 - 1.5));
};
