window.CHUNKS = [[0.0], [0.0, 0.5682], [0.0], [0.0, 0.4194], [0.0, 0.5909], [0.0, 0.4468], [0.0, 0.3774], [0.0, 0.3115, 0.6721], [0.0], [0.0, 0.4776], [0.0], [0.0], [0.0, 0.4516], [0.0, 0.5], [0.0, 0.3902], [0.0, 0.6341], [0.0], [0.0, 0.25], [0.0, 0.4727], [0.0], [0.0, 0.549], [0.0, 0.5319], [0.0, 0.6349], [0.0, 0.1875, 0.5, 0.725], [0.0, 0.4898], [0.0, 0.5616], [0.0], [0.0]];
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

// ── «ليه رجلك بتنمّل على التواليت؟» — drawings. Shapes follow the «طب إزاي؟» reference (v20: salmon body, the nerve as a
// pale tube with ink edges, nerve fibres in close-up) and real anatomy (refs/SOURCES.md, Gray's Anatomy fig. 832): the sciatic
// nerve leaves the pelvis under the buttock between the sit bone and the hip, runs down the back of the thigh between the
// hamstrings, and splits just above the back of the knee into the tibial nerve (down the back of the calf to the sole) and
// the common peroneal nerve (round the head of the fibula to the front of the shin and the top of the foot). The femoral
// artery runs down the front / inner thigh and only passes to the back at the knee, so a toilet seat does not press it.
// People: the shared person kit (videos/_templates/people/person.js), at home, in the side view.

var NERVE = "#e9cf7c", NERVE_D = "#c9a94e", BONE = "#ece2c8", BLOOD = "#b8443a", BLOOD_P = "#d8c2b8", PORC = "#f6f3ec", PORC_D = "#d8d4ca",
    MUSCLE = "#c98a72", SKINL = "#e4b49c", FLOORC = "#e3d7bd", TILE = "#d9ccb0";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
// a smooth outline through points (quadratic midpoints, like the person kit)
function smooth(pts, close) {
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1]));
}
function polyLen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}
// a nerve as a tube: ink edge, pale yellow body, a thin fibre line inside. k = how far it has drawn (0..1)
function nerveTube(d, w, k, col) {
  k = k == null ? 1 : k; if (k <= 0) return "";
  var dash = ' pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + (1 - clamp(k)).toFixed(4) + '"';
  return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>' +
    '<path d="' + d + '" fill="none" stroke="' + (col || NERVE) + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>' +
    '<path d="' + d + '" fill="none" stroke="' + NERVE_D + '" stroke-width="1.2" stroke-linecap="round"' + dash + ' opacity=".8"/>';
}
// signals: glowing dots running along a polyline (dir -1 = from the far end back to the start, i.e. from the foot up)
function pulses(pts, t, n, speed, col, r, dir, from, to) {
  var s = "", L = polyLen(pts); from = from == null ? 0 : from; to = to == null ? 1 : to;
  for (var i = 0; i < n; i++) { var p = ((t * speed / L + i / n) % 1); if (dir === -1) p = 1 - p; if (p < from || p > to) continue; var q = along(pts, p);
    s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f((r || 5) * 1.9) + '" fill="' + (col || BLUE) + '" opacity=".25"/><circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(r || 5) + '" fill="' + (col || BLUE) + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return s;
}
// pins-and-needles: little sparks that flick on and off at random spots near the given points
function needles(pts, t, n, sc, col) {
  var s = ""; sc = sc || 1;
  for (var i = 0; i < n; i++) {
    var ph = (t * (2.2 + hash(i) * 2) + hash(i + 7)) % 1, on = Math.sin(ph * Math.PI); if (on < .1) continue;
    var b = pts[i % pts.length], cyc = Math.floor(t * (2.2 + hash(i) * 2) + hash(i + 7)), x = b[0] + (hash(i * 3 + cyc) - .5) * 60 * sc, y = b[1] + (hash(i * 5 + cyc + 1) - .5) * 60 * sc, r = (6 + 7 * on) * sc, a = hash(i + cyc) * 3;
    s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a * 60) + ')" opacity="' + f(on) + '"><path d="M0 ' + f(-r) + ' L' + f(r * .22) + ' ' + f(-r * .22) + ' L' + f(r) + ' 0 L' + f(r * .22) + ' ' + f(r * .22) + ' L0 ' + f(r) + ' L' + f(-r * .22) + ' ' + f(r * .22) + ' L' + f(-r) + ' 0 L' + f(-r * .22) + ' ' + f(-r * .22) + ' Z" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="1"/></g>';
  }
  return s;
}
function floor(y, x0, x1) { x0 = x0 == null ? -400 : x0; x1 = x1 == null ? 1040 : x1; var s = R(x0, y, x1 - x0, 400, FLOORC, 0) + '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="400" fill="url(#hatch)" opacity=".3"/>'; for (var x = Math.ceil(x0 / 80) * 80; x < x1; x += 80) s += '<path d="M' + x + ' ' + y + ' l-30 60" stroke="' + TILE + '" stroke-width="1.6"/>'; return s + '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
function wallTiles(x0, x1, y0, y1) { var s = ""; for (var y = y0; y < y1; y += 46) s += '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + TILE + '" stroke-width="1.2"/>'; for (var x = x0; x < x1; x += 46) s += '<path d="M' + x + ' ' + y0 + ' V' + y1 + '" stroke="' + TILE + '" stroke-width="1.2"/>'; return s; }

// ── the toilet, side view, facing right (the cistern behind on the left). hx = the sitter's hip x, seatY = top of the seat,
//    fl = floor, s = the person's scale (real sizes: seat 40 cm high, bowl 70 cm deep, cistern top 80 cm; H = 400 = 175 cm)
function toiletSide(hx, seatY, fl, s, opt) {
  opt = opt || {}; var x0 = hx - 64 * s, x1 = hx + 46 * s, g = "";
  // cistern and the lid leaning back on it
  g += R(hx - 116 * s, fl - 192 * s, 50 * s, 96 * s, PORC, 2.2, 6 * s) + R(hx - 120 * s, fl - 200 * s, 58 * s, 12 * s, PORC, 2.2, 4 * s) + R(hx - 96 * s, fl - 210 * s, 18 * s, 10 * s, PORC_D, 1.6, 3);
  g += P(smooth([[x0 + 4 * s, seatY - 2 * s], [x0 - 6 * s, seatY - 60 * s], [x0 - 10 * s, seatY - 104 * s], [x0 - 22 * s, seatY - 102 * s], [x0 - 16 * s, seatY - 50 * s], [x0 - 8 * s, seatY]], false), PORC, 2);
  // bowl and pedestal: rim under the seat, the front rounding down and in to a narrow foot
  g += P(smooth([[x0 - 6 * s, seatY + 10 * s], [x1 + 2 * s, seatY + 10 * s], [x1 + 4 * s, seatY + 34 * s], [x1 - 14 * s, seatY + 58 * s], [hx + 8 * s, fl - 28 * s], [hx + 14 * s, fl], [hx - 46 * s, fl], [hx - 44 * s, fl - 30 * s], [x0 - 8 * s, seatY + 40 * s]], true), PORC, 2.4);
  g += '<path d="' + smooth([[x1 - 6 * s, seatY + 30 * s], [x1 - 20 * s, seatY + 52 * s], [hx + 4 * s, fl - 30 * s]], false) + '" stroke="' + PORC_D + '" stroke-width="' + f(6 * s) + '" fill="none" stroke-linecap="round"/>';
  g += '<path d="M' + f(hx - 38 * s) + ' ' + f(fl - 34 * s) + ' q' + f(10 * s) + ' ' + f(-10 * s) + ' ' + f(28 * s) + ' ' + f(-4 * s) + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';   // the trap's bend
  // the seat ring (a thin slab), its front edge = the edge that presses
  g += R(x0, seatY, x1 - x0, 9 * s, opt.seatCol || "#f2efe6", 2.2, 4 * s);
  if (opt.edge) g += '<path d="M' + f(x0 + 20 * s) + ' ' + f(seatY) + ' H' + f(x1 - 2 * s) + '" stroke="' + ORANGE + '" stroke-width="' + f(5 * s) + '" stroke-linecap="round" opacity="' + f(opt.edge) + '"/>';
  return g;
}
// the toilet-roll holder on the wall behind
function roll(x, y, s) { return R(x - 14 * s, y - 4 * s, 28 * s, 8 * s, PORC_D, 1.6, 3) + '<circle cx="' + f(x) + '" cy="' + f(y + 16 * s) + '" r="' + f(17 * s) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y + 16 * s) + '" r="' + f(6 * s) + '" fill="' + KHAKI + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(x + 17 * s) + ' ' + f(y + 16 * s) + ' v' + f(30 * s) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }

// ── people (the shared person kit). LASTP = joints of the last person drawn, for props and the nerve overlay
var LASTP = null;
function blink(t, seed) { return ((t + (seed || 0)) * 1000) % 3900 < 140 ? .05 : 1; }
// sitting on the toilet in profile, facing right, looking down at the phone in both hands
function sitter(hx, fl, s, t, opt) {
  opt = opt || {}; var br = (Math.sin(t * 1.7) + 1) / 2, sleep = opt.sleep || 0;
  var o = { x: hx, s: s, dir: 1, outfit: "home", lean: lerp(10, 26, sleep), breath: br, head: { tilt: lerp(16 + 2 * Math.sin(t * .9), 34 + 3 * Math.sin(t * 1.1), sleep) },
    legs: [{ hip: 86, knee: 84, ankle: 4 }, { hip: 82, knee: 80, ankle: 4 }],
    arms: sleep > .5 ? [{ sh: 6, el: 8, hand: "relaxed" }, { sh: 2, el: 6, hand: "relaxed" }] : [{ sh: 30, el: 82, hand: "relaxed" }, { sh: 26, el: 86, hand: "relaxed" }],
    face: { eyes: sleep > .5 ? 0 : (opt.eyes == null ? blink(t) : opt.eyes), brows: opt.brows || "neutral", mouth: opt.mouth || "neutral" } };
  o.y = PERSON.sideHipY(o, fl);
  var P = PERSON.side(o); LASTP = P.joints; LASTP.hip = [hx, o.y]; LASTP.s = s;
  var ph = "";
  if (sleep <= .5) { var w = P.joints.wrist; ph = G("translate(" + f(w[0] + 8 * s) + " " + f(w[1] - 14 * s) + ") rotate(-58)", R(-9 * s, -16 * s, 18 * s, 32 * s, "#33383f", 1.8, 3 * s) + R(-7 * s, -13 * s, 14 * s, 25 * s, "#9fc0d0", 0, 2 * s) + '<rect x="' + f(-7 * s) + '" y="' + f(-13 * s) + '" width="' + f(14 * s) + '" height="' + f(25 * s) + '" fill="#fff" opacity="' + f(.15 + .15 * Math.sin(t * 3)) + '"/>'); }
  if (sleep > .5) { var w2 = P.joints.wrist; ph = G("translate(" + f(w2[0] + 30 * s) + " " + f(fl - 4 * s) + ") rotate(90)", R(-4 * s, -16 * s, 8 * s, 32 * s, "#33383f", 1.8, 2 * s)); }
  return { svg: P.svg, phone: ph, seatY: o.y + 22 * s, hipY: o.y };
}
// a whole bathroom moment: toilet + the man; returns svg
function onToilet(hx, fl, s, t, opt) {
  opt = opt || {}; var p = sitter(hx, fl, s, t, opt);
  return toiletSide(hx, p.seatY, fl, s, opt) + p.svg + p.phone;
}
// standing in profile facing right; drop: 0..1 the near foot hangs (foot drop); wince: the pins-and-needles face
function stander(x, fl, s, t, opt) {
  opt = opt || {}; var dr = opt.drop || 0;
  var o = { x: x, s: s, dir: 1, outfit: "home", lean: opt.lean || 2, breath: (Math.sin(t * 1.7) + 1) / 2, head: { tilt: opt.tilt == null ? 6 : opt.tilt },
    legs: [{ hip: opt.lift ? 46 : 0, knee: opt.lift ? 60 : 0, ankle: opt.lift ? (opt.ank == null ? 40 : opt.ank) * dr : 0 }, { hip: -2, knee: 2, ankle: 0 }],
    arms: opt.arms || [{ sh: 4, el: 14, hand: "relaxed" }, { sh: -4, el: 12, hand: "relaxed" }],
    face: { eyes: opt.eyes == null ? blink(t, 1.3) : opt.eyes, brows: opt.brows || "neutral", mouth: opt.mouth || "neutral" } };
  o.y = PERSON.sideHipY(o, fl); if (opt.lift) o.y = PERSON.sideHipY(Object.assign({}, o, { legs: [o.legs[1], o.legs[1]] }), fl);
  var P = PERSON.side(o); LASTP = P.joints; LASTP.hip = [x, o.y]; LASTP.s = s; return P.svg;
}
// rising from the seat: k 0 sitting … 1 standing (the feet stay on the floor, the hips swing forward and up)
function rising(hx, fl, s, t, k, opt) {
  opt = opt || {}; k = ease(k); var hipA = lerp(86, 0, k), kneeA = lerp(84, 0, k);
  var o = { x: hx + 62 * s * k, s: s, dir: 1, outfit: "home", lean: lerp(10, 2, k) + 28 * Math.sin(k * Math.PI), breath: (Math.sin(t * 1.7) + 1) / 2, head: { tilt: lerp(16, 4, k) },
    legs: [{ hip: hipA, knee: kneeA, ankle: lerp(4, 0, k) }, { hip: hipA - 4 * (1 - k), knee: kneeA - 4 * (1 - k), ankle: 0 }],
    arms: [{ sh: lerp(30, 6, k), el: lerp(82, 16, k), hand: "relaxed" }, { sh: lerp(26, -2, k), el: lerp(86, 14, k), hand: "relaxed" }],
    face: { eyes: blink(t, .7), brows: opt.brows || "neutral", mouth: opt.mouth || "neutral" } };
  o.y = PERSON.sideHipY(o, fl);
  var P = PERSON.side(o); LASTP = P.joints; LASTP.hip = [o.x, o.y]; LASTP.s = s; return P.svg;
}
// the sciatic nerve laid over the last person drawn (seen through the trousers), from the lower back to the toes
function nervePath(J) {
  var s = J.s, hp = J.hip, kn = J.knee, an = J.ankle, u = [kn[0] - hp[0], kn[1] - hp[1]], ul = Math.hypot(u[0], u[1]); u = [u[0] / ul, u[1] / ul];
  var n = [-u[1], u[0]], v = [an[0] - kn[0], an[1] - kn[1]], vl = Math.hypot(v[0], v[1]); v = [v[0] / vl, v[1] / vl]; var m = [-v[1], v[0]];
  var back = [hp[0] - 2 * s, hp[1] - 44 * s], seat = [hp[0] - 10 * s, hp[1] + 8 * s];
  var th = [0.25, 0.55, 0.85].map(function (k) { return [hp[0] + u[0] * 98 * s * k + n[0] * 13 * s, hp[1] + u[1] * 98 * s * k + n[1] * 13 * s]; });
  var kb = [kn[0] + n[0] * 12 * s + m[0] * 4 * s, kn[1] + n[1] * 12 * s + m[1] * 4 * s];
  var ca = [0.35, 0.75].map(function (k) { return [kn[0] + v[0] * 98 * s * k + m[0] * 10 * s, kn[1] + v[1] * 98 * s * k + m[1] * 10 * s]; });
  var hl = [J.heel[0] + 6 * s, J.heel[1] - 8 * s], to = [J.toe[0] - 8 * s, J.toe[1] - 2 * s], mid = L2(hl, to, .5);
  return [back, seat].concat(th, [kb], ca, [[an[0] + m[0] * 6 * s, an[1] + m[1] * 6 * s], hl, [mid[0], mid[1] - 2 * s], to]);
}
function nerveOver(J, k, glow, t, sig) {
  var pts = nervePath(J), d = smooth(pts, false), s = J.s;
  var g = glow ? '<path d="' + d + '" fill="none" stroke="' + NERVE + '" stroke-width="' + f(16 * s) + '" stroke-linecap="round" opacity="' + f(.35 * glow) + '"/>' : "";
  return g + nerveTube(d, 6 * s, k) + (sig ? pulses(pts, t, 5, 140 * s, sig === true ? BLUE : sig, 3.4 * s, -1) : "");
}

// ── the leg cut open (close-up), seated on the seat ring, facing right. Real anatomy: femur, kneecap, tibia and fibula,
//    the sciatic nerve along the back of the thigh splitting above the knee; the femoral artery down the front / inner thigh.
var LEG = [[-160, 300], [-20, 306], [100, 316], [250, 326], [380, 340], [440, 354], [470, 390], [462, 432], [452, 474], [448, 560], [446, 636], [452, 670], [500, 684], [570, 698], [604, 712], [602, 724],
           [440, 724], [404, 718], [398, 690], [406, 650], [394, 572], [374, 508], [378, 466], [390, 448], [330, 456], [230, 462], [150, 466], [60, 470], [-60, 474], [-160, 478]];
var SCI = [[-150, 340], [-60, 372], [20, 420], [110, 440], [230, 442], [330, 440], [372, 438]];
var TIB = [[372, 438], [396, 470], [404, 560], [414, 646], [424, 690], [470, 708], [560, 708]];
var PER = [[372, 438], [406, 454], [438, 476], [442, 560], [448, 650], [482, 690], [530, 698], [584, 708]];
var ART = [[-150, 334], [-40, 338], [80, 346], [200, 354], [300, 372], [356, 410], [384, 446], [392, 520], [404, 620], [420, 680]];
var SEAT_Y = 470, SEAT_X0 = -200, SEAT_X1 = 262, LFL = 730;
function seatCut(press, opt) {
  // the seat ring and the bowl rim under the thigh, cut through; press 0..1 shows the pressure on its front half
  opt = opt || {}; var g = "";
  g += P(smooth([[SEAT_X0, SEAT_Y + 26], [SEAT_X1 - 4, SEAT_Y + 26], [SEAT_X1 + 4, SEAT_Y + 60], [SEAT_X1 - 20, SEAT_Y + 120], [180, LFL - 60], [190, LFL], [-60, LFL], [-60, SEAT_Y + 200], [SEAT_X0, SEAT_Y + 120]], true), PORC, 2.4);
  g += '<path d="' + smooth([[SEAT_X1 - 12, SEAT_Y + 60], [SEAT_X1 - 30, SEAT_Y + 118], [176, LFL - 70]], false) + '" stroke="' + PORC_D + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
  g += R(SEAT_X0, SEAT_Y - 4, SEAT_X1 - SEAT_X0, 30, opt.col || "#f2efe6", 2.4, 10);
  if (press) { g += '<path d="M' + (SEAT_X1 - 170) + ' ' + (SEAT_Y - 4) + ' H' + (SEAT_X1 - 8) + '" stroke="' + ORANGE + '" stroke-width="7" stroke-linecap="round" opacity="' + f(press) + '"/>';
    for (var i = 0; i < 4; i++) { var x = SEAT_X1 - 150 + i * 42, b = 6 * Math.sin(window.__t * 6 + i); g += arrow(x, SEAT_Y + 46 + b, x, SEAT_Y + 8 + b, ORANGE, 3.4, press); } }
  return g;
}
// o: {nerve: 0..1 drawn, hl: highlight the nerve, pinch: 0..1 squashed under the seat edge, starve: 0..1 nerve greys at the pinch,
//     sig: signals running up, block: signals stop at the pinch, art: artery 0..1, bone: show the bones, fade: dim the leg}
function legCut(t, o) {
  o = o || {}; var g = "", d = smooth(LEG, true), pin = o.pinch || 0;
  g += P(d, SKIN, 2.6) + '<path d="' + d + '" fill="url(#hatch)" opacity=".16"/>';
  // the hamstrings at the back of the thigh and the calf muscle, as soft shapes
  g += '<path d="' + smooth([[-60, 400], [100, 420], [250, 428], [370, 432], [250, 452], [100, 456], [-60, 452]], true) + '" fill="' + MUSCLE + '" opacity=".45"/>';
  g += '<path d="' + smooth([[388, 470], [380, 520], [398, 600], [412, 650], [420, 600], [418, 520], [404, 476]], true) + '" fill="' + MUSCLE + '" opacity=".45"/>';
  if (o.bone !== false) {
    g += P(smooth([[-40, 372], [60, 380], [200, 384], [330, 388], [404, 376], [432, 392], [420, 414], [380, 410], [330, 404], [200, 400], [60, 398], [-40, 396]], true), BONE, 2);   // femur
    g += '<ellipse cx="456" cy="392" rx="13" ry="22" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';   // kneecap
    g += P(smooth([[416, 420], [446, 424], [442, 470], [440, 580], [442, 656], [446, 672], [420, 674], [424, 650], [424, 560], [420, 470]], true), BONE, 2);   // tibia
    g += P(smooth([[400, 440], [410, 444], [412, 520], [414, 640], [408, 664], [402, 640], [400, 520]], true), "#e2d6b8", 1.6);   // fibula
  }
  if (o.art) { g += nerveTube(smooth(ART, false), 8, o.art, BLOOD).replace(new RegExp(NERVE_D, "g"), "#8e2f28"); if (o.artFlow) g += pulses(ART, t, 8, 120, "#e06a5a", 3.5, 1); }
  // the nerve: the trunk and its two branches; at the pinch it narrows and (starve) greys
  var nk = o.nerve == null ? 1 : o.nerve;
  if (nk > 0) {
    var cs = o.hl ? (o.hlCol || NERVE) : NERVE;
    g += nerveTube(smooth(SCI, false), 16, clamp(nk * 1.6), cs) + nerveTube(smooth(TIB, false), 10, clamp(nk * 1.6 - .6), cs) + nerveTube(smooth(PER, false), 8, clamp(nk * 1.6 - .6), cs);
    if (pin) g += '<ellipse cx="190" cy="442" rx="' + f(70 * pin) + '" ry="' + f(9 * pin) + '" fill="' + (o.starve ? "#bdb6a6" : ORANGE) + '" opacity="' + f(.75 * pin) + '"/>';
    if (o.sig) {
      var up = SCI.concat().reverse(), path = TIB.concat().reverse().concat(up.slice(1));
      g += pulses(path, t, 7, 170, o.sigCol || BLUE, 5, 1, 0, o.block ? .58 : 1);
    }
  }
  if (o.fade) g = '<g opacity="' + f(1 - .55 * o.fade) + '">' + g + '</g>';
  return seatCut(o.press || 0, o) + g;
}
// ── a nerve close-up: a length of nerve lying across the panel with the left end cut open (real structure: fascicles of
//    fibres wrapped in a sheath, tiny blood vessels — the vasa nervorum — running on and inside it).
//    o: {pinch 0..1 squeezed at PX by the seat block, starve 0..1 vessels empty at the pinch, flow: blood moving, o2: oxygen bubbles,
//        sig: signals right → left, block: they stop at the pinch, spark: 0..1 random firing, rush: blood rushing back 0..1}
var NY = 400, NH = 92, PX = 380;
function nh(x, pin) { return NH * (1 - .55 * pin * Math.exp(-Math.pow((x - PX) / 78, 2))); }
function nerveBand(t, o) {
  o = o || {}; var pin = o.pinch || 0, g = "", x, top = [], bot = [];
  for (x = 70; x <= 760; x += 10) { var h = nh(x, pin); top.push([x, NY - h]); bot.push([x, NY + h]); }
  var outline = "M" + top.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " L" + bot.concat().reverse().map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  g += '<path d="' + outline + '" fill="#efe0b0" stroke="' + INK + '" stroke-width="2.6"/>';
  // fascicles: 4 bundles following the squeeze
  var fo = [-.62, -.2, .22, .62], fw = [.26, .3, .3, .26];
  fo.forEach(function (c, i) {
    var a = [], b = []; for (x = 70; x <= 760; x += 10) { var h = nh(x, pin); a.push([x, NY + (c - fw[i] / 2) * h * .92]); b.push([x, NY + (c + fw[i] / 2) * h * .92]); }
    var d = "M" + a.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " L" + b.reverse().map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
    g += '<path d="' + d + '" fill="' + NERVE + '" stroke="' + NERVE_D + '" stroke-width="1.6"/>';
    for (var k = 0; k < 3; k++) { var yy = []; for (x = 80; x <= 760; x += 20) { var h2 = nh(x, pin); yy.push([x, NY + (c + fw[i] * (k - 1) / 3.2) * h2 * .92]); } g += '<path d="M' + yy.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="' + NERVE_D + '" stroke-width=".8" fill="none" opacity=".7"/>'; }
  });
  // the tiny blood vessels: wavy red lines between and over the bundles, emptying at the pinch when starved
  var vo = [-.86, -.41, .0, .41, .86];
  vo.forEach(function (c, i) {
    var pts = []; for (x = 70; x <= 760; x += 6) { var h = nh(x, pin); pts.push([x, NY + c * h * .92 + Math.sin(x / 26 + i * 1.7) * 4]); }
    var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L");
    g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="4.6" fill="none"/><path d="' + d + '" stroke="' + BLOOD + '" stroke-width="2.6" fill="none"/>';
    if (o.starve) { var id = "st" + (++CLIPN), w = 150 * o.starve; g += '<clipPath id="' + id + '"><rect x="' + f(PX - w) + '" y="0" width="' + f(2 * w) + '" height="800"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + d + '" stroke="' + INK + '" stroke-width="4.6" fill="none"/><path d="' + d + '" stroke="' + BLOOD_P + '" stroke-width="2.6" fill="none"/></g>'; }
    if (o.flow) { var sp = o.starve ? 0 : 1; for (var j = 0; j < 7; j++) { var p = ((t * .16 * (o.rush ? 3 : 1) + j / 7 + i * .13) % 1), q = pts[Math.floor(p * (pts.length - 1))]; if (o.starve && Math.abs(q[0] - PX) < 150 * o.starve) continue; g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="2.6" fill="#e5735f"/>'; } }
    if (o.o2 && i % 2 === 0) { for (var j2 = 0; j2 < 3; j2++) { var p2 = ((t * .1 + j2 / 3 + i * .2) % 1), q2 = pts[Math.floor(p2 * (pts.length - 1))]; if (o.starve && Math.abs(q2[0] - PX) < 160 * o.starve) continue; g += '<g opacity="' + f(o.o2) + '"><circle cx="' + f(q2[0]) + '" cy="' + f(q2[1] - 12) + '" r="10" fill="#d5e2e6" stroke="' + BLUE + '" stroke-width="1.6"/>' + T("O₂", q2[0], q2[1] - 8, 10, BLUE, 800) + '</g>'; } }
  });
  // the cut face at the left end: sheath, bundles, vessel dots
  var cf = '<ellipse cx="70" cy="' + NY + '" rx="40" ry="' + NH + '" fill="#efe0b0" stroke="' + INK + '" stroke-width="2.6"/>';
  [[62, -48, 20, 24], [80, -4, 22, 28], [58, 42, 22, 26], [86, 56, 14, 18], [86, -56, 14, 18]].forEach(function (c) { cf += '<ellipse cx="' + c[0] + '" cy="' + (NY + c[1]) + '" rx="' + c[2] * .62 + '" ry="' + c[3] + '" fill="' + NERVE + '" stroke="' + NERVE_D + '" stroke-width="1.6"/>'; for (var k = 0; k < 4; k++) cf += '<circle cx="' + f(c[0] + (hash(k + c[1]) - .5) * c[2] * .7) + '" cy="' + f(NY + c[1] + (hash(k * 3 + c[1]) - .5) * c[3] * 1.1) + '" r="2.2" fill="#fbf1cf" stroke="' + NERVE_D + '" stroke-width=".8"/>'; });
  [[44, -20], [96, 26], [50, 76], [40, 10], [100, -30]].forEach(function (c) { cf += '<circle cx="' + c[0] + '" cy="' + (NY + c[1]) + '" r="4" fill="' + (o.starve && 0 ? BLOOD_P : BLOOD) + '" stroke="' + INK + '" stroke-width="1"/>'; });
  g += cf;
  // signals: running from the foot (right) to the brain (left)
  if (o.sig) for (var s2 = 0; s2 < 5; s2++) {
    var lane = [-.41, 0, .41][s2 % 3], p3 = 1 - ((t * .32 + s2 / 5) % 1), xx = 120 + p3 * 640;
    if (o.block && xx < PX + 40) continue; var hh = nh(xx, pin);
    g += '<g opacity="' + f(o.sig) + '"><ellipse cx="' + f(xx) + '" cy="' + f(NY + lane * hh * .92) + '" rx="26" ry="9" fill="' + BLUE + '" opacity=".25"/><ellipse cx="' + f(xx) + '" cy="' + f(NY + lane * hh * .92) + '" rx="14" ry="5" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.2"/></g>';
  }
  // random firing: bursts in both directions at random spots, little zigzags
  if (o.spark) for (var z = 0; z < 9; z++) {
    var cyc = Math.floor(t * 3.4 + hash(z) * 5), ph = (t * 3.4 + hash(z) * 5) % 1, on = Math.sin(ph * Math.PI); if (hash(cyc * 13 + z) < .35) continue;
    var zx = 130 + hash(cyc * 7 + z) * 600, zy = NY + (hash(cyc * 11 + z) - .5) * nh(zx, pin) * 1.5, dirn = hash(cyc + z * 3) > .5 ? 1 : -1, zz = "M" + f(zx) + " " + f(zy);
    for (var q4 = 1; q4 <= 5; q4++) zz += " L" + f(zx + dirn * q4 * 12) + " " + f(zy + (q4 % 2 ? -9 : 9));
    g += '<g opacity="' + f(on * o.spark) + '"><path d="' + zz + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/><circle cx="' + f(zx) + '" cy="' + f(zy) + '" r="7" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/></g>';
  }
  return g;
}
// the seat edge pushing up into the nerve from below (k 0 away … 1 pressing)
function seatBlock(k, x) {
  x = x == null ? PX : x; var y = NY + nh(x, k) + 4 + (1 - k) * 220;
  return P("M" + (x - 150) + " 900 L" + (x - 150) + " " + f(y + 40) + " Q" + (x - 150) + " " + f(y) + " " + (x - 90) + " " + f(y) + " L" + (x + 90) + " " + f(y) + " Q" + (x + 150) + " " + f(y) + " " + (x + 150) + " " + f(y + 40) + " L" + (x + 150) + " 900 Z", "#f2efe6", 2.6) +
    '<path d="M' + (x - 130) + ' ' + f(y + 24) + ' H' + (x + 130) + '" stroke="' + PORC_D + '" stroke-width="5" stroke-linecap="round"/>';
}
// the brain (a side view: lobes, stem), as in the reference's flat green brain
function brainIcon(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#9aa86e") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }
function clock(x, y, r, t, speed) {
  var a1 = t * (speed || 1) * 2 * Math.PI / 12, a2 = t * (speed || 1) * 2 * Math.PI, s = C(x, y, r, "#fbf8f1", 2.6) + C(x, y, r * .88, "none", 1);
  for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<path d="M' + f(x + Math.sin(a) * r * .74) + ' ' + f(y - Math.cos(a) * r * .74) + ' L' + f(x + Math.sin(a) * r * .86) + ' ' + f(y - Math.cos(a) * r * .86) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.4 : 3) + '"/>'; }
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(a1) * r * .5) + ' ' + f(y - Math.cos(a1) * r * .5) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.sin(a2) * r * .74) + ' ' + f(y - Math.cos(a2) * r * .74) + '" stroke="' + ORANGE + '" stroke-width="2.6" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
function calendar(x, y, s, word, k) {
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-60, -56, 120, 116, "#fbf8f1", 2.2, 6) + R(-60, -56, 120, 30, ORANGE, 2.2, 6) + '<circle cx="-30" cy="-60" r="5" fill="' + INK + '"/><circle cx="30" cy="-60" r="5" fill="' + INK + '"/>' +
    (function () { var g = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) g += '<rect x="' + (-50 + c * 21) + '" y="' + (-18 + r * 17) + '" width="14" height="11" fill="' + (r * 5 + c < (k || 0) * 20 ? KHAKI : "#ece4d2") + '" stroke="' + INK + '" stroke-width=".8"/>'; return g; })() +
    T(word || "", 0, -34, 18, "#fff", 800));
}
function zzz(x, y, t, sz) { var s = ""; for (var i = 0; i < 3; i++) { var p = (t * .45 + i / 3) % 1; s += '<g opacity="' + f(Math.sin(p * Math.PI)) + '">' + N("z", x + p * 40, y - p * 70, (sz || 30) * (.6 + p * .6), BLUE) + '</g>'; } return s; }
// a garden hose on the ground from a tap (left) to an open end (right); a shoe can press it at px (k 0..1)
function hose(t, k, px) {
  var y = 600, s = R(20, 360, 50, 22, "#9aa3a6", 2) + R(52, 352, 22, 38, "#7f888b", 2) + '<path d="M56 390 v20" stroke="' + INK + '" stroke-width="2"/>';
  var sq = k > .6, d = "M60 410 C 90 470 70 " + (y - 10) + " 140 " + y + " L" + (px - 40) + " " + y + " L" + (px + 40) + " " + y + " L480 " + y + " C 510 " + y + " 520 " + (y - 6) + " 532 " + (y - 20);
  s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="22" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#5e8a4e" stroke-width="16" fill="none" stroke-linecap="round"/>';
  s += '<path d="' + d + '" stroke="' + BLUE + '" stroke-width="4" fill="none" stroke-dasharray="6 14" stroke-dashoffset="' + f(-t * 60) + '" opacity="' + (sq ? 0 : .8) + '"/>';
  if (sq) s += '<path d="M60 410 C 90 470 70 ' + (y - 10) + ' 140 ' + y + ' L' + (px - 40) + ' ' + y + '" stroke="' + BLUE + '" stroke-width="4" fill="none" stroke-dasharray="6 14" stroke-dashoffset="' + f(-t * 60) + '" opacity=".8"/>';
  var spray = 1 - clamp((k - .6) / .3); for (var i = 0; i < 7; i++) { var p = (t * 1.2 + i / 7) % 1; s += '<circle cx="' + f(534 + p * 70 * spray) + '" cy="' + f(y - 24 - p * 30 * spray + p * p * 90 * spray) + '" r="' + f(5 * spray) + '" fill="' + BLUE + '" opacity="' + f((1 - p) * spray) + '"/>'; }
  return s;
}
// a fluorescent (neon) tube in its fitting; on = 0..1 brightness this frame
function neon(x, y, w, on) {
  var s = R(x - w / 2 - 20, y - 34, w + 40, 26, "#e7e2d6", 2.2, 4) + R(x - w / 2 - 14, y - 10, 16, 30, "#bcb6a8", 2) + R(x + w / 2 - 2, y - 10, 16, 30, "#bcb6a8", 2);
  if (on > .05) s += '<rect x="' + f(x - w / 2) + '" y="' + f(y - 26) + '" width="' + f(w) + '" height="' + 80 + '" rx="40" fill="#fff6c8" opacity="' + f(.45 * on) + '"/>';
  s += R(x - w / 2, y - 4, w, 18, on > .5 ? "#fffbe6" : "#d9d6cc", 2, 9);
  if (on > .5) for (var i = 0; i < 9; i++) { var a = Math.PI * (.15 + .7 * i / 8); s += '<path d="M' + f(x + Math.cos(a) * w * .55) + ' ' + f(y + 30 + Math.sin(a) * 40) + ' l' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 26) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(on) + '"/>'; }
  return s;
}
function flicker(t, u0, u) { var x = u - u0; if (x < 0) return 0; if (x > 2.2) return 1; var c = Math.floor(x * 9); return hash(c * 3.1) > .5 ? 1 : .15 + .2 * hash(c); }

// ── shots (one per idea; line numbers from script.txt) ──
var FL = 690;
// 4 · «الحكاية كلها في عصب واحد»: the man on the toilet, the nerve shows through, drawing itself from the lower back to the toes
shot(4, push(330, 430, 1.05, 1.12), function (u, d, t) {
  var s = paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + roll(560, 360, 1.3) + onToilet(250, FL, 1.25, t);
  return s + nerveOver(LASTP, at(u, .6, 1.6), at(u, 2, .5), t) + label(lerp(LASTP.hip[0], LASTP.knee[0], .5), LASTP.knee[1] + 18, 520, 250, "العصب الوركي", OLIVE, at(u, 2.0, .5), 30);
});
// 5 · the thickest nerve in the body, about as thick as your thumb (~2 cm): the cut nerve next to a thumb
shot(5, push(330, 400, 1.0, 1.08), function (u, d, t) {
  var hand = PERSON.hand([520, 240], -Math.PI / 2, "thumb", 1, 2.6, null, false);
  return paper() + nerveBand(t, {}) + G("", hand, at(u, 1.6, .5)) + tag("أتخن عصب", 250, 200, at(u, .4, .3), 34, ORANGE) +
    measure(30, 520, 110, 520, at(u, 2.4, .6), "2 سم", 34);
}, { tr: "in" });
// 6 · where it runs: from the lower back, down the back of the thigh, to the toes
shot(6, push(300, 470, .96, 1.02), function (u, d, t) {
  var k = at(u, .3, 3.0);
  return paper() + floor(LFL) + legCut(t, { nerve: k, bone: true }) + label(-10, 384, 60, 220, "أسفل الضهر", OLIVE, at(u, .4, .4), 26) + label(230, 442, 150, 610, "ورا الفخد", OLIVE, at(u, 1.4, .4), 26) + label(540, 712, 520, 790, "صوابع الرجل", OLIVE, at(u, 2.6, .4), 26);
}, { tr: "out" });
// 7 · touch, heat, cold: every feeling in the foot runs up this nerve to the brain
shot(7, push(300, 460, 1.0, .94), function (u, d, t) {
  var w = Math.floor(clamp((u - .6) / 1.0) * 3 - .001), icons = [
    '<path d="M-26 20 C-10 -20 20 -30 30 -26 C20 -10 0 10 -26 20 Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><path d="M-26 20 L20 -20" stroke="' + INK + '" stroke-width="1.4"/>',
    '<path d="M0 30 C-26 20 -24 -6 -6 -30 C-6 -10 8 -10 6 -24 C24 -6 26 22 0 30 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>',
    (function () { var g = ""; for (var i = 0; i < 3; i++) g += '<path d="M0 0 L' + f(Math.cos(i * Math.PI / 3) * 30) + ' ' + f(Math.sin(i * Math.PI / 3) * 30) + ' M0 0 L' + f(-Math.cos(i * Math.PI / 3) * 30) + ' ' + f(-Math.sin(i * Math.PI / 3) * 30) + '" stroke="' + BLUE + '" stroke-width="5" stroke-linecap="round"/>'; return g; })()];
  var ic = ""; for (var i = 0; i <= Math.max(0, w); i++) ic += G("translate(" + (520 - i * 0) + " " + (590 - i * 0) + ")", "", 1);
  var cur = w >= 0 ? icons[w] : icons[0];
  return paper() + floor(LFL) + legCut(t, { sig: at(u, .4, .4) > 0, bone: true }) + iconBox(560, 600, 110, cur, at(u, .4, .3)) +
    brainIcon(80, 150, 1.2) + arrow(40, 330, 60, 220, BLUE, 5, at(u, 1.0, .6)) + G("", T("للمخ", 130, 280, 30, BLUE, 800), at(u, 1.2, .3));
});
// 8 · «طب التواليت دخله إيه؟»
shot(8, push(300, 440, 1.0, 1.14), function (u, d, t) {
  return paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + roll(560, 360, 1.3) + onToilet(250, FL, 1.25, t) + G("", T("؟", 520, 260, 150, ORANGE, 800), at(u, .2, .3));
}, { tr: "out" });
// 9 · the seat edge presses the back of the thigh, right where the nerve runs
shot(9, push(260, 460, .96, 1.06), function (u, d, t) {
  var k = at(u, .4, .6), pk = at(u, 1.8, .6);
  return paper() + floor(LFL) + legCut(t, { press: k, pinch: pk, hl: true, hlCol: pk > .5 ? "#e8a37c" : NERVE }) + label(150, SEAT_Y + 10, 300, 640, "حرف القاعدة", ORANGE, at(u, .6, .4), 28) + label(240, 440, 360, 240, "العصب", OLIVE, at(u, 2.2, .4), 28);
});
// 10 · like a garden hose someone steps on: water runs and sprays, he walks in and stands on it, the spray dies
shot(10, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .05, .75), x = lerp(170, 300, k), o = Object.assign({ x: x, s: .95, dir: 1, lean: 3, outfit: "home", breath: (Math.sin(t * 1.7) + 1) / 2,
    face: { eyes: blink(t), brows: "neutral", mouth: "neutral" } }, PERSON.walkPose(u * 8, 1 - clamp((u - .75) / .15)));
  o.y = PERSON.sideHipY(o, 600);
  return paper() + floor(612) + hose(t, at(u, .75, .3), 330) + PERSON.side(o).svg + cross(560, 470, .7, at(u, 1.0, .3)) +
    iconBox(110, 130, 130, '<g transform="scale(.15) translate(-222 -520)">' + legCut(t, { press: 1, pinch: 1 }) + '</g>', at(u, .2, .3));
});
// 11 · «طب ليه الضغط يقفل العصب؟»: the nerve close-up with a question mark
shot(11, push(380, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + nerveBand(t, { flow: 1 }) + G("", T("؟", 520, 230, 130, ORANGE, 800), at(u, .2, .3));
}, { tr: "in" });
// 12 · the nerve is living cells, fed by tiny blood vessels inside it
shot(12, push(300, 400, 1.08, 1.2), function (u, d, t) {
  return paper() + nerveBand(t, { flow: 1, o2: at(u, 2.2, .5) }) + label(230, NY - NH * .86, 300, 220, "أوعية دم صغيرة", ORANGE, at(u, 1.0, .5), 30) + label(70, NY + 40, 120, 640, "ألياف العصب", OLIVE, at(u, .3, .5), 28);
});
// 13 · the pressure shuts those vessels: no oxygen reaches the nerve
shot(13, push(360, 430, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, .8), st = at(u, 1.2, .8);
  return paper() + nerveBand(t, { pinch: k, starve: st, flow: 1, o2: 1 }) + seatBlock(k) + cross(PX, 200, .8, at(u, 2.0, .4)) + G("", T("مفيش O₂", PX, 290, 30, BLUE, 800), at(u, 2.3, .3));
});
// 14 · without oxygen the nerve stops sending signals: the signals stop at the pinch
shot(14, push(360, 420, 1.06, 1.0), function (u, d, t) {
  return paper() + nerveBand(t, { pinch: 1, starve: 1, flow: 1, sig: 1, block: 1 }) + seatBlock(1) + G("", T("للمخ", 170, 230, 26, BLUE, 700) + T("من الرجل", 580, 230, 26, BLUE, 700), at(u, .2, .3)) + arrow(250, 222, 120, 222, BLUE, 3, at(u, .3, .4)) + arrow(640, 260, 500, 260, BLUE, 3, at(u, .3, .4)) + tag("مفيش إشارات", PX - 160, 650, at(u, 1.4, .3), 30, ORANGE);
});
// 15 · the brain loses touch with the leg: it "falls asleep"
shot(15, push(300, 450, .96, 1.0), function (u, d, t) {
  var k = at(u, .5, .6);
  return paper() + floor(LFL) + legCut(t, { press: 1, pinch: 1, starve: 1, fade: k * .6 }) + brainIcon(80, 150, 1.2) +
    '<path d="M70 210 C40 290 40 360 60 420" stroke="' + BLUE + '" stroke-width="4" fill="none" stroke-dasharray="10 10"/>' + cross(46, 320, .7, at(u, .9, .4)) + zzz(520, 580, t, 40) + tag("نامت", 520, 470, at(u, 1.6, .3), 34, BLUE);
}, { tr: "out" });
// 16 · «طب ليه التنميل بيزيد لما تقوم؟»: he gets up
shot(16, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, 1.2);
  var p = sitter(250, FL, 1.25, t), tl = toiletSide(250, p.seatY, FL, 1.25);
  return paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + roll(560, 360, 1.3) + tl + rising(250, FL, 1.25, t, k) + G("", T("؟", 520, 250, 130, ORANGE, 800), at(u, 1.0, .3));
});
// 17 · standing up: the blood comes back to the nerve all at once
shot(17, push(360, 420, 1.0, 1.08), function (u, d, t) {
  var k = 1 - at(u, .2, .7), st = 1 - at(u, .6, .9);
  return paper() + nerveBand(t, { pinch: k, starve: st, flow: 1, rush: 1 }) + seatBlock(k) + arrow(PX - 260, 230, PX - 60, 230, ORANGE, 6, at(u, .7, .5)) + arrow(PX + 260, 230, PX + 60, 230, ORANGE, 6, at(u, .7, .5)) + tag("الدم رجع", PX, 650, at(u, 1.2, .3), 30, ORANGE);
}, { tr: "in" });
// 18 · the nerve doesn't restart calmly: random, jumbled bursts
shot(18, push(360, 420, 1.08, 1.0), function (u, d, t) {
  return paper() + nerveBand(t, { flow: 1, spark: at(u, .3, .4) }) + tag("إشارات عشوائية", PX, 650, at(u, 1.0, .3), 30, ORANGE);
});
// 19 · like a fluorescent tube flickering before it lights
shot(19, push(320, 380, 1.0, 1.08), function (u, d, t) {
  var on = flicker(t, LN[19].start + .3, t - LN[19].start + LN[19].start - LN[19].start);
  on = flicker(t, .3, u);
  return paper() + wallTiles(-400, 1040, -400, 1200) + neon(320, 300, 420, on) + R(270, 120, 100, 150, "none", 0) + '<path d="M320 120 V292" stroke="' + INK + '" stroke-width="2"/>' + G("", T("تتتت…", 320, 520, 40, ORANGE, 800), on < .5 && u > .3 ? 1 : 0);
});
// 20 · the brain reads that jumble as needles
shot(20, push(320, 440, 1.04, 1.12), function (u, d, t) {
  var m = stander(300, FL, 1.25, t, { brows: "worried", mouth: "frown", tilt: 18 });
  var J = LASTP, pts = [J.knee, J.ankle, J.toe, L2(J.knee, J.ankle, .5), L2(J.hip, J.knee, .6)];
  return paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + m + nerveOver(J, 1, .6, t, ORANGE) + needles(pts, t, 18, 1.2) + brainIcon(520, 170, 1.1) + needles([[520, 170]], t, 5, .7) + tag("إبر", 520, 300, at(u, .8, .3), 40, ORANGE);
});
// 21 · the myth: "you cut the blood off the whole leg" — no
shot(21, push(300, 470, .96, 1.0), function (u, d, t) {
  var k = at(u, .2, .5);
  return paper() + floor(LFL) + legCut(t, { press: 1, art: 0 }) + '<path d="' + smooth(LEG, true) + '" fill="#b8c2c4" opacity="' + f(.45 * k) + '"/>' + G("", T("الدم اتقطع؟", 230, 220, 40, INK, 800), k) + cross(230, 300, 1.2, at(u, LN[21].end - LN[21].start - 1.0, .5));
}, { tr: "out" });
// 22 · the big artery (front / inner thigh) carries on; only the nerve at the back is squeezed
shot(22, push(300, 460, .96, 1.02), function (u, d, t) {
  return paper() + floor(LFL) + legCut(t, { press: 1, pinch: at(u, 1.6, .5), art: at(u, .2, 1.0), artFlow: 1, hl: true, hlCol: "#e8a37c" }) + label(140, 350, 120, 200, "الشريان", BLOOD, at(u, .6, .4), 30) + check(310, 230, 1, at(u, 1.2, .4), OLIVE) +
    label(220, 442, 170, 650, "العصب اتخنق", ORANGE, at(u, 2.0, .4), 28);
});
// 23 · recap: the seat presses → the nerve starves and goes quiet → you stand, it wakes up jumbled
shot(23, push(320, 400, .92, .95), function (u, d, t) {
  function tile(i, inner, k) { var y = 40 + i * 245, id = 'tl' + i; return appear(k, R(50, y, 540, 220, PAPER, 2.2) + '<clipPath id="' + id + '"><rect x="52" y="' + (y + 2) + '" width="536" height="216"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(330 ' + (y + 110) + ') scale(.5) translate(-420 -400)">' + inner + '</g></g>' + R(50, y, 540, 220, 'none', 2.2) + callout(String(i + 1), 82, y + 32, k)); }
  return paper() + tile(0, nerveBand(t, { pinch: 1, flow: 1 }) + seatBlock(1), at(u, .3, .4)) + tile(1, nerveBand(t, { pinch: 1, starve: 1, flow: 1, sig: 1, block: 1 }) + seatBlock(1), at(u, 2.0, .4)) + tile(2, nerveBand(t, { flow: 1, spark: 1 }), at(u, 4.0, .4));
}, { tr: "out" });
// 24 · the odd fact: people who passed out on the toilet for hours
shot(24, push(300, 440, 1.0, 1.08), function (u, d, t) {
  return paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + roll(560, 360, 1.3) + onToilet(230, FL, 1.25, t, { sleep: 1 }) + zzz(380, 200, t, 36) + G("translate(520 170)", clock(0, 0, 70, t, 6)) + G("", T("ساعات", 520, 290, 34, ORANGE, 800), at(u, .6, .3));
});
// 25 · woke up unable to lift the front of the foot for months: "toilet seat palsy"
shot(25, push(330, 420, 1.0, 1.12), function (u, d, t) {
  var tryUp = (Math.sin(t * 2.4) + 1) / 2;
  var m = stander(260, FL, 1.25, t, { lift: 1, drop: 1, brows: "worried", mouth: "frown", tilt: 16, lean: 4 });
  var J = LASTP;
  return paper() + wallTiles(-400, 1040, -400, FL) + floor(FL) + m + arrow(J.toe[0] + 30, J.toe[1] + 10, J.toe[0] + 30, J.toe[1] - 50 - 10 * tryUp, OLIVE, 4, at(u, .4, .4)) + cross(J.toe[0] + 30, J.toe[1] - 30, .5, at(u, 1.2, .4)) +
    calendar(520, 170, 1.1, "شهور", at(u, .8, 2.5)) + tag("شلل التواليت", 330, 120, at(u, LN[25].end - LN[25].start - 2.2, .3), 34, ORANGE);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: on the toilet with the phone, the clock running. line 1: up, a thousand needles. line 2: standing, the tingling grows
  var fl = 600, s = wallTiles(-60, 700, -60, fl) + floor(fl, -60, 700);
  if (li === 0) { s += roll(500, 300, 1.1) + onToilet(220, fl, 1.08, t) + G("translate(500 140)", clock(0, 0, 56, t, 3)); return s; }
  var u = t - LN[li].start;
  if (li === 1) { var k = clamp(u / 1.0), p = sitter(220, fl, 1.08, t); s += toiletSide(220, p.seatY, fl, 1.08) + rising(220, fl, 1.08, t, k, { brows: k > .8 ? "worried" : "neutral", mouth: k > .8 ? "o" : "neutral" }); var J = LASTP;
    if (k > .7) s += needles([J.ankle, J.toe, L2(J.knee, J.ankle, .5)], t, 12, 1); s += G("", N("1000", 500, 170, 60, ORANGE) + T("إبرة", 500, 214, 28, INK, 800), at(u, .8, .3)); return s; }
  var p2 = sitter(220, fl, 1.08, t); s += toiletSide(220, p2.seatY, fl, 1.08) + stander(287, fl, 1.08, t, { brows: "worried", mouth: "frown", tilt: 18 }); var J2 = LASTP;
  s += needles([J2.ankle, J2.toe, L2(J2.knee, J2.ankle, .5), J2.knee, L2(J2.hip, J2.knee, .5)], t, 10 + Math.floor(clamp(u / 1.5) * 16), 1.1) + arrow(500, 300, 500, 150, ORANGE, 7, at(u, .3, .6)) + G("", T("بيزيد", 500, 340, 30, ORANGE, 800), at(u, .6, .3));
  return s;
};
SCENE.bumper = function (u, t) {
  // a tiny toilet with a leg sparkling
  return G("translate(30 40) scale(.42)", toiletSide(140, 220, 330, 1) + needles([[220, 300], [250, 320]], t, 6, 1));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(30 5) scale(.62) translate(200 -300)", legCut(t, { press: 1, pinch: 1 }) + needles([[540, 706], [470, 690]], t, 6, 1)) +
    callout("1", 216, 70, ease(u / .3)) + callout("2", 303, 140, ease(u / .3 - .5)) + callout("3", 378, 66, ease(u / .3 - 1)) + callout("4", 540, 220, ease(u / .3 - 1.5));
};
