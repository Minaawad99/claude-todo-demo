window.CHUNKS = [[0.0], [0.0], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.5102], [0.0, 0.234, 0.4894, 0.766], [0.0, 0.2836, 0.6567], [0.0, 0.5849], [0.0, 0.1493, 0.6119], [0.0, 0.4603], [0.0, 0.1852, 0.6111], [0.0, 0.2951, 0.5738], [0.0, 0.44], [0.0, 0.4627], [0.0, 0.4], [0.0, 0.4186, 0.6395], [0.0, 0.3607, 0.7213], [0.0, 0.3472, 0.6528], [0.0, 0.4189], [0.0, 0.5185], [0.0, 0.4154], [0.0, 0.1316, 0.2807, 0.4123, 0.5351, 0.6579], [0.0, 0.3366, 0.7327], [0.0], [0.0]];
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

// ── «الطيارة بتطير إزاي؟» / «How Planes Fly» — one drawing file for both editions. plane-en/sketch/shots.js is this
// file with `window.EN_ED = true;` on top (made by plane-en/sketch/make.sh); only the label text changes.
// Shapes: a twin-engine narrow-body airliner from the side; the wing section is the NACA 4412 profile (4% camber at 40%,
// 12% thick), drawn from its published formula. Quick mode, see refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var BODY = "#f4f1ea", BODY_D = "#d9d4c8", SKYB = "#cfe0e8", CLOUD = "#fbf8f0", WINGC = "#c9c4b4", TARMAC = "#6f6a62";

// ── the NACA 4412 section, chord c, leading edge at (x,y), tilted nose-up by aoa degrees; flap 0..1 extends a flap
function foilPts(n) { var m = .04, p = .4, th = .12, up = [], lo = []; for (var i = 0; i <= n; i++) { var b = i / n * Math.PI, x = (1 - Math.cos(b)) / 2, yt = 5 * th * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x * x * x - .1015 * x * x * x * x), yc = x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) * (1 - p)) * (1 - 2 * p + 2 * p * x - x * x); up.push([x, yc + yt]); lo.push([x, yc - yt]); } return [up, lo]; }
var FOIL = foilPts(40);
function foil(x, y, c, aoa, flap, fill) {
  var d = "M" + FOIL[0].map(function (q) { return f(q[0] * c) + " " + f(-q[1] * c); }).join(" L") + " L" + FOIL[1].slice().reverse().map(function (q) { return f(q[0] * c) + " " + f(-q[1] * c); }).join(" L") + " Z";
  var s = '<path d="' + d + '" fill="' + (fill || WINGC) + '" stroke="' + INK + '" stroke-width="2.4"/>' + hatch(d);
  if (flap) { var k = ease(flap); s += G("translate(" + f(c * (.86 + .14 * k)) + " " + f(c * .02 * k) + ") rotate(" + f(28 * k) + ")", '<path d="M0 -' + f(c * .03) + ' C' + f(c * .1) + ' -' + f(c * .035) + ' ' + f(c * .22) + ' -' + f(c * .01) + ' ' + f(c * .26) + ' 0 C' + f(c * .2) + ' ' + f(c * .01) + ' ' + f(c * .08) + ' ' + f(c * .02) + ' 0 ' + f(c * .02) + ' Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>'); }
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(-aoa) + ")", s);
}
// ── air lines round the section: dashes run with t (faster over the top), bend down behind the wing (dw 0..1)
function flow(x, y, c, t, dw, n, opts) {
  opts = opts || {}; var s = "", N = n || 9;
  for (var i = 0; i < N; i++) {
    var y0 = (i - (N - 1) / 2) * c * .16; if (Math.abs(y0) < c * .12) y0 += (y0 < 0 ? -1 : 1) * c * .1;
    var top = y0 < 0, P = Math.exp(-Math.abs(y0) / (c * .45)), Q = Math.exp(-Math.abs(y0) / (c * 1.3)), d = "";
    for (var px = -40; px <= 680; px += 10) {
      var u = (px - x) / c, bell = Math.exp(-Math.pow((u - .3) / .42, 2)), ss = clamp((u - .1) / 1.3); ss = ss * ss * (3 - 2 * ss);
      var py = y + y0 - (top ? c * .17 : -c * .02) * P * bell + dw * c * .34 * Q * ss;
      d += (px > -40 ? " L" : "M") + f(px) + " " + f(py);
    }
    var sp = top ? (opts.fast || 120) : 70;
    s += '<path d="' + d + '" stroke="' + (opts.col || BLUE) + '" stroke-width="2.4" fill="none" stroke-dasharray="18 12" stroke-dashoffset="' + f(-t * sp) + '" opacity="' + f(opts.op || .85) + '"/>';
  }
  return s;
}
// ── an airliner from the side, facing right: fuselage, cockpit, windows, wing root with the engine under it, tail
function plane(x, y, s, t, op) {
  op = op || {}; var b = "";
  b += '<path d="M-250 -10 L-300 -96 L-262 -96 L-200 -26 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>';   // fin
  b += '<path d="M-250 -6 L-312 -2 L-300 8 L-230 6 Z" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2"/>';             // tailplane
  b += '<path d="M-300 -18 C-260 -34 -150 -38 150 -38 C230 -38 270 -20 290 0 C270 22 230 34 150 34 L-200 34 C-250 34 -290 14 -300 -18 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
  b += '<path d="M-280 14 C-230 26 -150 30 150 30 C220 30 250 22 270 14" stroke="' + BLUE + '" stroke-width="5" fill="none"/>';
  for (var i = 0; i < 16; i++) b += '<rect x="' + (-200 + i * 22) + '" y="-20" width="9" height="12" rx="4" fill="#9fb7c3" stroke="' + INK + '" stroke-width="1.2"/>';
  b += '<path d="M244 -20 L268 -14 L262 -4 L238 -8 Z" fill="#2f2a24"/>';
  b += '<rect x="-60" y="-26" width="18" height="44" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/>';
  b += '<path d="M-70 14 L60 6 L70 18 L-60 30 Z" fill="' + WINGC + '" stroke="' + INK + '" stroke-width="2.2"/>';                // wing root (far side hidden)
  b += '<rect x="-10" y="28" width="86" height="34" rx="16" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="74" cy="45" rx="7" ry="15" fill="#3d3a34" stroke="' + INK + '" stroke-width="1.6"/>';   // engine
  if (op.gear) b += '<path d="M180 34 V64 M-40 34 V64" stroke="' + INK + '" stroke-width="5"/>' + C(180, 70, 9, "#3d3a34", 2) + C(-40, 70, 9, "#3d3a34", 2) + C(-58, 70, 9, "#3d3a34", 2);
  if (op.flap) b += '<path d="M-68 26 L-96 40 L-60 34 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(op.flap) + '"/>';
  if (op.thrust) for (var k = 0; k < 3; k++) { var u = (t * 2 + k / 3) % 1; b += '<path d="M' + f(-20 - u * 160) + ' ' + (38 + k * 7) + ' h' + f(-30) + '" stroke="' + MUTE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(op.thrust * (1 - u)) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(op.rot || 0) + ")", b);
}
// a small aerobatic propeller plane (for the upside-down fact)
function stunt(x, y, s, t, inv) {
  var b = '<path d="M-110 -6 L-130 -44 L-112 -44 L-90 -8 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-120 -2 C-60 -20 60 -22 96 -8 C104 0 104 8 96 14 C60 22 -60 20 -120 6 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M10 -16 C24 -34 50 -34 60 -16" fill="#9fb7c3" stroke="' + INK + '" stroke-width="2"/>' + C(102, 3, 6, INK, 0);
  var pr = Math.sin(t * 40); b += '<ellipse cx="106" cy="3" rx="4" ry="' + f(34 * Math.abs(pr) + 4) + '" fill="' + MUTE + '" opacity=".5"/>';
  b += '<path d="M-30 2 L40 0 L44 8 L-26 10 Z" fill="' + WINGC + '" stroke="' + INK + '" stroke-width="2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") scale(1 " + (inv ? -1 : 1) + ")", b);
}
function cloud(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", '<path d="M-60 20 C-80 20 -84 -6 -60 -8 C-58 -30 -26 -36 -14 -18 C-4 -40 34 -38 38 -12 C62 -16 72 18 50 20 Z" fill="' + CLOUD + '" stroke="' + INK + '" stroke-width="2"/>'); }
function clouds(t, y0) { var s = ""; for (var k = 0; k < 6; k++) { var x = ((hash(k) * 900 - t * (30 + hash(k + 2) * 20)) % 900 + 900) % 900 - 130; s += cloud(x, y0 + hash(k + 5) * 120, .9 + hash(k + 7) * .8); } return s; }
// a flat hand (a mitten) seen from the side, tilted by a degrees
function hand(x, y, s, a) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(-a) + ")", '<path d="M-120 -8 L-20 -12 C10 -14 40 -16 70 -12 C96 -8 100 6 74 10 C40 14 10 14 -20 12 L-120 12 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -12 C-16 -24 4 -26 14 -14" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'); }
function speedo(x, y, r, v, max, k) { var a = Math.PI * (1 - clamp(v * ease(k) / max)); var s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i <= 6; i++) { var b = Math.PI * (1 - i / 6); s += '<path d="M' + f(x + Math.cos(b) * r * .8) + ' ' + f(y - Math.sin(b) * r * .8) + ' L' + f(x + Math.cos(b) * r * .95) + ' ' + f(y - Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="3"/>'; } return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y - Math.sin(a) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="6" stroke-linecap="round"/>' + C(x, y, 9, INK, 0); }
function sky() { return R(-40, -40, 720, 860, SKYB, 0); }

// ── the four forces on a plane drawn at (x,y) scale s: o = {l, w, t, d} arrow lengths 0..1+, k = {l, w, t, d} appear 0..1, lab = show names
var F_COL = { l: OLIVE, w: "#3d3a34", t: ORANGE, d: BLUE };
function forces(x, y, s, o, k, lab, t) {
  k = k || { l: 1, w: 1, t: 1, d: 1 }; var out = "", pulse = 4 * Math.sin((t || 0) * 3);
  var A = { l: [x, y - 20 * s, x, y - 20 * s - (60 + 150 * o.l) - pulse], w: [x, y + 40 * s, x, y + 40 * s + 60 + 150 * o.w + pulse],
            t: [x + 290 * s, y, x + 290 * s + 30 + 110 * o.t + pulse, y], d: [x - 300 * s, y, x - 300 * s - 30 - 110 * o.d - pulse, y] };
  var N = { l: TX("الرفع", "LIFT"), w: TX("الوزن", "WEIGHT"), t: TX("الدفع", "THRUST"), d: TX("السحب", "DRAG") };
  ["l", "w", "t", "d"].forEach(function (q) {
    var kk = clamp(k[q] == null ? 0 : k[q]); if (kk <= 0) return; var a = A[q];
    out += arrow(a[0], a[1], a[2], a[3], F_COL[q], 10, kk);
    if (lab) { var tx = q === "t" || q === "d" ? a[2] + (q === "t" ? -40 : 40) : a[2] + 70, ty = q === "l" ? a[3] + 10 : q === "w" ? a[3] - 10 : a[3] + 44; out += G("", T(N[q], tx, ty, 26, F_COL[q], 800), clamp(kk * 2 - 1)); }
  });
  return out;
}
// a turbofan cut open along its axis, facing right: fan at the front, core, flame, nozzle; air in slow, out fast
function engineCut(x, y, s, t) {
  var b = "";
  for (var k = 0; k < 6; k++) { var u = (t * .5 + k / 6) % 1; b += C(lerp(300, 170, u), -50 + k * 20, 6, "#9fb7c3", 1.4); }   // air drawn in, slow
  b += '<path d="M-170 -96 C-60 -110 100 -112 170 -96 L170 -78 C100 -92 -60 -90 -150 -76 Z" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2.4"/>' + '<path d="M-170 96 C-60 110 100 112 170 96 L170 78 C100 92 -60 90 -150 76 Z" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2.4"/>';
  b += R(-130, -36, 230, 72, "#d9d4c8", 2.2, 10) + '<path d="M-130 -30 L-200 0 L-130 30 Z" fill="#8f8576" stroke="' + INK + '" stroke-width="2"/>';
  for (k = 0; k < 9; k++) b += '<path d="M' + (20 + k * 9) + ' -34 V34" stroke="' + INK + '" stroke-width="1.6" opacity=".6"/>';   // compressor stages
  b += R(-40, -26, 50, 52, "#f2c230", 1.6, 6) + '<path d="M-36 0 C-26 ' + f(-16 - 4 * Math.sin(t * 20)) + ' -6 ' + f(-16 + 4 * Math.sin(t * 17)) + ' 6 0 C-6 ' + f(16 + 3 * Math.sin(t * 15)) + ' -26 16 -36 0 Z" fill="' + ORANGE + '"/>';   // combustor
  for (k = 0; k < 4; k++) b += '<path d="M' + (-110 + k * 14) + ' -34 V34" stroke="' + INK + '" stroke-width="2" opacity=".7"/>';  // turbine
  for (k = 0; k < 9; k++) { var ph = t * 9 + k * .7, yy = Math.sin(ph) * 74, w = 8 * Math.abs(Math.cos(ph)) + 2; b += '<ellipse cx="135" cy="' + f(yy) + '" rx="' + f(w) + '" ry="10" fill="' + MUTE + '" stroke="' + INK + '" stroke-width="1.2"/>'; }   // fan blades turning
  b += C(140, 0, 16, "#3d3a34", 2);
  for (k = 0; k < 8; k++) { var v = (t * 2.2 + k / 8) % 1; b += '<path d="M' + f(-180 - v * 260) + ' ' + (-60 + k * 17) + ' h-46" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - v) + '"/>'; }   // air out, fast
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// a party balloon flying right, letting its air out to the left
function balloon(x, y, s, t) { var b = '<path d="M-70 0 C-70 -60 60 -70 80 0 C60 70 -70 60 -70 0 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M-70 -8 L-88 -12 L-88 12 L-70 8 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M30 -30 C44 -24 54 -12 56 0" stroke="#fff" stroke-width="7" fill="none" opacity=".6" stroke-linecap="round"/>'; for (var k = 0; k < 5; k++) { var u = (t * 1.6 + k / 5) % 1; b += C(-100 - u * 140, (k - 2) * 10 * u, 6 + 10 * u, "#e9e4d8", 1.2); } return G("translate(" + f(x) + " " + f(y + 6 * Math.sin(t * 5)) + ") scale(" + s + ") rotate(" + f(3 * Math.sin(t * 7)) + ")", b); }
// air lines going past a body of half-height h at (x,y): they part round the nose and curl behind (wake 0..1)
function airPast(x, y, h, t, wake, n) {
  var s = "";
  for (var i = 0; i < (n || 9); i++) {
    var y0 = (i - ((n || 9) - 1) / 2) * 34, d = "";
    for (var px = -40; px <= 680; px += 10) { var u = (px - x) / 260, bump = Math.exp(-u * u * 3) * h * Math.exp(-Math.abs(y0) / (h * 2.2)); d += (px > -40 ? " L" : "M") + f(px) + " " + f(y + y0 + (y0 < 0 ? -bump : bump)); }
    s += '<path d="' + d + '" stroke="' + BLUE + '" stroke-width="2.4" fill="none" stroke-dasharray="18 12" stroke-dashoffset="' + f(t * 110) + '" opacity=".75"/>';
  }
  for (var k = 0; k < 6 * (wake || 0); k++) { var cx = x - 300 - k * 34 - ((t * 60) % 34), cy = y + (k % 2 ? -14 : 14), a0 = t * 6 + k; s += '<path d="M' + f(cx + Math.cos(a0) * 16) + ' ' + f(cy + Math.sin(a0) * 16) + ' A16 16 0 1 1 ' + f(cx + Math.cos(a0 + 4) * 16) + ' ' + f(cy + Math.sin(a0 + 4) * 16) + '" stroke="' + BLUE + '" stroke-width="3" fill="none"/>'; }
  return s;
}
// the load inside the plane: heads in the cabin, bags in the hold, fuel in the wing
function load(x, y, s, k) { var b = R(-200, -30, 400, 26, "#f4ecdb", 1.6, 4); for (var i = 0; i < 12; i++) b += C(-186 + i * 33, -18, 9, SKIN, 1.4); b += R(-200, 2, 400, 26, "#e6dccb", 1.6, 4); for (i = 0; i < 9; i++) b += R(-190 + i * 44, 6, 34, 18, [ORANGE, OLIVE, BLUE][i % 3], 1.4, 3); return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b, k); }
function glidePath(t, k) { var s = R(-40, 640, 720, 200, "#c9c09a", 2.4); for (var i = 0; i < 9; i++) s += '<path d="M' + f(((i * 90 - t * 90) % 720 + 720) % 720 - 40) + ' 660 l18 -26 l18 26 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.4"/>'; return s + '<path d="M60 120 L600 600" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="10 10" opacity=".5"/>'; }

// ── shots (same line numbers in both editions)
// 4 · one small rule, remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(110, 150, 420, 460, "#f4ecdb", 2.4, 8) + T(TX("قاعدة", "THE RULE"), 320, 220, 34, OLIVE, 800) + plane(320, 400, .3, t, {}) + forces(320, 400, .3, { l: .2, w: .2, t: .1, d: .1 }, { l: at(u, .4, .3), w: at(u, .6, .3), t: at(u, .8, .3), d: at(u, 1, .3) }, false, t); });
// 5 · four forces pulling every plane four ways
shot(5, push(320, 400, 1.0, 1.04), function (u, d, t) { return paper() + sky() + clouds(t, 600) + plane(320, 390, .55, t, { thrust: 1 }) + forces(320, 390, .55, { l: .6, w: .6, t: .5, d: .5 }, { l: at(u, .5, .4), w: at(u, 1, .4), t: at(u, 1.5, .4), d: at(u, 2, .4) }, false, t); });
// 6 · down weight, up lift, forward thrust, backward drag (each lights up as it is named)
shot(6, push(320, 400, 1.04, 1.0), function (u, d, t) { var q = d / 4.2; return paper() + sky() + clouds(t, 600) + plane(320, 390, .55, t, { thrust: 1 }) + forces(320, 390, .55, { l: .6, w: .6, t: .5, d: .5 }, { w: at(u, .1, .4), l: at(u, q, .4), t: at(u, 2 * q, .4), d: at(u, 3 * q, .4) }, true, t); });
// 7 · weight: the Earth pulls the plane down, passengers, bags and fuel
shot(7, push(320, 400, 1.0, 1.06), function (u, d, t) { return paper() + sky() + '<path d="M-60 760 Q320 640 700 760 V840 H-60 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2.4"/>' + plane(320, 330, .9, t, {}) + load(330, 330, .62, at(u, .8, .5)) + forces(320, 330, .9, { w: .9 + .1 * Math.sin(t * 2) }, { w: at(u, .3, .6) }, true, t); }, { tr: "in" });
// 8 · pilots work out every flight's weight before takeoff
shot(8, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper() + R(150, 130, 340, 520, "#f7f3ea", 2.6, 6) + R(270, 112, 100, 34, "#8f8576", 2.2, 6);
  var rows = [[TX("ركاب", "passengers"), "15,000"], [TX("شنط", "bags"), "3,000"], [TX("وقود", "fuel"), "18,000"], [TX("الطيارة", "plane"), "42,000"]];
  rows.forEach(function (r, i) { var k = at(u, .3 + i * .45, .3); s += G("", T(r[0], 450, 230 + i * 70, 26, INK, 700, "start") + N(r[1], 200, 232 + i * 70, 28, INK, "start"), k); });
  return s + G("", '<path d="M180 500 H460" stroke="' + INK + '" stroke-width="2.4"/>' + N("78,000 kg", 320, 560, 36, ORANGE), at(u, 2.2, .4)) + check(430, 600, .8, at(u, d * .8, .4));
});
// 9 · thrust: the engine sucks in lots of air at the front and throws it out the back very fast
shot(9, push(330, 400, 1.0, 1.06), function (u, d, t) { return paper() + engineCut(330, 400, 1.15, t) + label(490, 400, 560, 600, TX("مروحة", "fan"), OLIVE, at(u, .6, .5), 24) + label(320, 400, 380, 220, TX("احتراق", "burner"), ORANGE, at(u, 1.6, .5), 24); }, { tr: "in" });
// 10 · the thrown air shoves the engine forward, like a balloon letting its air out
shot(10, push(320, 400, 1.0, 1.05), function (u, d, t) { var bg = ""; for (var k = 0; k < 6; k++) bg += '<path d="M' + f(((700 - t * 260 - k * 120) % 760 + 760) % 760 - 60) + ' ' + (150 + k * 90) + ' h60" stroke="' + MUTE + '" stroke-width="3" opacity=".5"/>'; return paper() + bg + G("", engineCut(220, 220, .55, t), dim(1, "")) + arrow(330, 220, 470, 220, ORANGE, 9, at(u, .3, .5)) + balloon(380, 520, 1.3, t) + arrow(500, 520, 600, 520, ORANGE, 8, at(u, 1.4, .5)); });
// 11 · drag: the air rubs on the plane and stands in its way
shot(11, push(320, 400, 1.0, 1.05), function (u, d, t) { return paper() + sky() + airPast(500, 400, 46, t, 1, 11) + plane(320, 400, .55, t, { thrust: 1 }) + forces(320, 400, .55, { d: .7 }, { d: at(u, .6, .5) }, true, t); });
// 12 · the faster it goes the bigger the drag, so the body is smooth and pointed
shot(12, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var box = R(180, 210, 60, 130, BODY_D, 2.4, 4), drop = '<path d="M380 590 C440 560 500 556 540 576 C552 584 552 596 540 604 C500 624 440 620 380 590 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.4"/>';
  var sw = ""; for (var k = 0; k < 5; k++) { var a0 = t * 7 + k; sw += '<path d="M' + f(160 - k * 26 + Math.cos(a0) * 14) + ' ' + f(290 + (k % 2 ? -26 : 26) + Math.sin(a0) * 14) + ' a14 14 0 1 1 6 6" stroke="' + BLUE + '" stroke-width="3" fill="none"/>'; }
  var ln = ""; for (k = 0; k < 4; k++) ln += '<path d="M' + f(660 - ((t * 200 + k * 80) % 240)) + ' ' + (560 + k * 20) + ' h-40" stroke="' + BLUE + '" stroke-width="3" opacity=".7"/>' + '<path d="M' + f(420 - ((t * 200 + k * 80) % 240)) + ' ' + (250 + k * 24) + ' h-40" stroke="' + BLUE + '" stroke-width="3" opacity=".7"/>';
  return paper() + ln + box + sw + cross(210, 420, 1, at(u, d * .4, .4)) + drop + check(470, 680, 1, at(u, d * .7, .4));
});
// 13 · lift? that's the wing's job — the camera flies into the wing
shot(13, push(330, 410, 1.0, 1.9), function (u, d, t) { return paper() + sky() + plane(320, 390, .8, t, {}) + G("", '<circle cx="320" cy="400" r="70" fill="none" stroke="' + OLIVE + '" stroke-width="5" stroke-dasharray="12 9"/>', at(u, .3, .4)); });
// 14 · curved on top and tilted, the wing bends the air down
shot(14, push(330, 420, 1.0, .94), function (u, d, t) { var k = at(u, .3, 2); return paper() + sky() + flow(120, 380, 300, t, k, 11) + foil(120, 380, 300, 7, 0) + arrow(520, 470, 560, 470 + 120 * k, ORANGE, 6, k) + label(260, 336, 340, 200, TX("مقوّس", "curved"), OLIVE, at(u, .6, .5), 24); }, { tr: "in" });
// 15 · the air pushes the wing up, like your hand out of a car window
shot(15, push(320, 420, 1.0, 1.05), function (u, d, t) { var k = at(u, .4, .8); return paper() + sky() + flow(120, 420, 300, t, 1, 11) + foil(120, 420, 300, 7, 0) + arrow(250, 360, 250, 360 - 200 * k - 6 * Math.sin(t * 3), OLIVE, 12, k) + iconBox(470, 160, 160, G("translate(-30 20) scale(.5)", P("M-60 220 V60 C-60 -10 0 -40 80 -40 H140 V220 Z", "#b98a5e", 3) + hand(150, 40, .9, 14) + arrow(170, 0, 170, -90, OLIVE, 8, 1)), at(u, d * .45, .3)); });
// 16 · above: faster air, lower pressure; below: higher pressure. same story, another angle
shot(16, push(320, 430, 1.04, 1.0), function (u, d, t) { var s = paper() + sky() + flow(120, 410, 380, t, .6, 11, { fast: 190 }) + foil(120, 410, 380, 6, 0); for (var k = 0; k < 5; k++) s += G("", T("−", 170 + k * 70, 300 + (k % 2) * 16, 46, ORANGE, 800), at(u, .3 + k * .12, .3)) + G("", T("+", 170 + k * 70, 520 + (k % 2) * 16, 50, BLUE, 800), at(u, d * .4 + k * .12, .3)); return s + arrow(310, 600, 310, 470 - 8 * Math.sin(t * 3), BLUE, 9, at(u, d * .55, .5)); });
// 17 · take-off: thrust beats drag, faster and faster
shot(17, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .2, d), s = paper() + sky() + R(-40, 560, 720, 260, TARMAC, 2.4);
  for (var i = 0; i < 6; i++) s += R(((i * 150 - t * 500 * (.2 + k)) % 900 + 900) % 900 - 120, 640, 80, 10, "#f4f1ea", 0);
  return s + plane(330, 470, .55, t, { gear: 1, thrust: 1 }) + forces(330, 470, .55, { t: 1, d: .25 + .25 * k }, { t: at(u, .3, .4), d: at(u, .7, .4) }, true, t);
});
// 18 · the speed grows the lift until it beats the weight, at about 300 km/h (180 mph)
shot(18, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .2, d - .4), up = clamp((k - .7) / .3), s = paper() + sky() + R(-40, 600 + 120 * up, 720, 260, TARMAC, 2.4);
  for (var i = 0; i < 6; i++) s += R(((i * 150 - t * 700) % 900 + 900) % 900 - 120, 670 + 120 * up, 80, 10, "#f4f1ea", 0);
  s += plane(320, 470 - 60 * up, .5, t, { gear: 1, thrust: 1, rot: -8 * up }) + forces(320, 470 - 60 * up, .5, { l: .3 + .9 * k, w: .7 }, { l: 1, w: 1 }, true, t);
  return s + numBox(count(EN ? 180 : 300, k), 150, 140, 1, 34) + T(TX("كم/س", "mph"), 150, 200, 24, INK, 700);
});
// 19 · up high, the four forces balance: steady speed, steady height
shot(19, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + sky() + clouds(t, 600) + plane(320, 390, .55, t, { thrust: 1 }) + forces(320, 390, .55, { l: .6, w: .6, t: .5, d: .5 }, { l: 1, w: 1, t: 1, d: 1 }, true, t) + G("", T("=", 470, 260, 60, INK, 800) + T("=", 170, 540, 60, INK, 800), at(u, d * .4, .4)); });
// 20 · the myth: the engines lift the plane. no.
shot(20, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + sky() + plane(320, 420, .9, t, { thrust: 1 }) + arrow(355, 450, 355, 160, ORANGE, 12, at(u, .4, .6)) + cross(355, 250, 1.4, at(u, d * .8, .4)); });
// 21 · the engines only give speed; the wing turns that speed into lift
shot(21, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + sky() + plane(320, 420, .9, t, { thrust: 1 }) + arrow(390, 470, 560, 470, ORANGE, 10, at(u, .3, .5)) + draw("M560 500 C620 600 380 640 330 440", at(u, d * .4, .8), MUTE, 4) + arrow(320, 420, 320, 180, OLIVE, 12, at(u, d * .6, .5)); });
// 22 · recap: all four forces, named
shot(22, push(320, 400, .96, 1.02), function (u, d, t) { return paper() + sky() + clouds(t, 600) + plane(320, 390, .55, t, { thrust: 1 }) + forces(320, 390, .55, { l: .8, w: .6, t: .7, d: .4 }, { w: at(u, .3, .4), l: at(u, 1.2, .4), t: at(u, 2.2, .4), d: at(u, 3.2, .4) }, true, t); }, { tr: "out" });
// 23 · the odd fact: both engines off, it glides down like a paper plane, more than 100 km (60 miles)
shot(23, push(320, 400, 1.0, 1.04), function (u, d, t) { var k = clamp(u / d); return paper() + sky() + clouds(t * 1.6, 260) + glidePath(t, k) + plane(lerp(140, 460, k), lerp(210, 500, k) + 6 * Math.sin(t * 2.5), .32, t, { rot: 18 + 2 * Math.sin(t * 2) }) + numBox(TX("+100 كم", "60+ mi"), 470, 160, at(u, d * .5, .3), 34) + iconBox(130, 600, 120, '<path d="M-40 10 L44 -20 L-10 30 Z M-10 30 L-4 6 L44 -20" fill="#fff" stroke="' + INK + '" stroke-width="2"/>', at(u, d * .3, .3)); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = sky() + clouds(t, 470) + plane(300, 260, .9, t, { thrust: 1, rot: Math.sin(t * .9) * 1.5 });
  if (li === 0) s += G("", numBox(TX("+70 طن", "70+ tons"), 300, 120, 1, 36), ease((t - LN[0].start) / .4));
  if (li >= 1) { var k = ease((t - LN[1].start) / .4); s += G("", '<ellipse cx="300" cy="150" rx="170" ry="16" fill="none" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 8"/><path d="M300 150 V206" stroke="' + INK + '" stroke-width="4" stroke-dasharray="6 5"/>', k * .8) + cross(300, 150, .9, ease((t - LN[1].start - .6) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) { return plane(90, 112, .24, t, { thrust: 1 }); };
SCENE.outro = function (svg, u, t) {
  return plane(300, 140, .4, t, { thrust: 1 }) + G("translate(300 140) scale(.55) translate(-300 -140)", forces(300, 140, .4, { l: .3, w: .3, t: .2, d: .2 }, null, false, t)) +
    callout("1", 330, 40, ease(u / .3)) + callout("2", 330, 245, ease(u / .3 - .5)) + callout("3", 520, 165, ease(u / .3 - 1)) + callout("4", 80, 165, ease(u / .3 - 1.5));
};
