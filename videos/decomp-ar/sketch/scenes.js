window.CHUNKS = [[0.0], [0.0], [0.0], [0.0, 0.4194], [0.0, 0.7647], [0.0, 0.5676, 0.8108], [0.0, 0.4865], [0.0, 0.5658], [0.0, 0.5806], [0.0, 0.3261], [0.0, 0.2034, 0.6102], [0.0, 0.3295, 0.6591], [0.0], [0.0, 0.6438], [0.0, 0.4722], [0.0, 0.4762], [0.0, 0.2, 0.3647, 0.5412, 0.7294], [0.0, 0.4051, 0.6709], [0.0, 0.4074, 0.5926, 0.7654], [0.0, 0.6081], [0.0, 0.5397], [0.0, 0.6829], [0.0, 0.1724, 0.4023, 0.6782, 0.8621], [0.0, 0.301, 0.6019], [0.0], [0.0]];
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

// ── «تحلل جسم الإنسان» / How a Body Decomposes — one drawing file for both editions (decomp-en/sketch/make.sh adds
// `window.EN_ED = true;`). Calm forensic-science drawings: cells, a body always covered by a sheet, a soil cut, a skeleton.
// Nothing gory. Quick mode, see refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var CELL = "#f2d6c8", CELL_D = "#d9a186", NUC = "#b77a5c", LYS = "#e8c46a", SHEET = "#f7f3ea", SHEET_D = "#ddd6c6", PURPLE = "#8f6a8a",
    SOIL = "#a9845c", SOIL_D = "#8a6a46", SOIL_L = "#c9a97a", BONE = "#efe6d0", BACT = OLIVE, FLY = "#3d3a34";

// ── a cell with its nucleus and lysosomes (enzyme sacs); burst 0..1 opens the sacs and spills enzyme dots, crumble breaks the wall
function cell(x, y, r, t, burst, crumble) {
  burst = burst || 0; crumble = crumble || 0; var s = "", n = 40, d = "";
  for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * (1 + .05 * Math.sin(a * 5 + t * 1.5) - crumble * .25 * Math.max(0, Math.sin(a * 7 + 1))); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr * .85); }
  s += '<path d="' + d + ' Z" fill="' + CELL + '" stroke="' + INK + '" stroke-width="2.6"' + (crumble > .3 ? ' stroke-dasharray="' + f(30 - 20 * crumble) + ' ' + f(6 + 14 * crumble) + '"' : "") + '/>';
  s += '<ellipse cx="' + f(x - r * .1) + '" cy="' + f(y) + '" rx="' + f(r * .3) + '" ry="' + f(r * .26) + '" fill="' + NUC + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - .6 * crumble) + '"/>';
  for (var k = 0; k < 7; k++) {
    var a2 = k * .9 + 1, px = x + Math.cos(a2) * r * .62, py = y + Math.sin(a2) * r * .5;
    if (burst < .5) s += C(px, py, r * .09, LYS, 1.6) + C(px, py, r * .03, ORANGE, 0);
    else s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r * .09) + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="4 4"/>';
    for (var j = 0; j < 4 * burst; j++) { var b = j * 1.6 + k + t * .8, rr2 = r * .12 + burst * r * .25 * (1 + .3 * Math.sin(t * 2 + j)); s += C(px + Math.cos(b) * rr2, py + Math.sin(b) * rr2, r * .025 + 1.5, ORANGE, 0); }
  }
  return s;
}
// oxygen dots arriving through a small vessel on the left; flow 0..1
function o2in(x, y, t, flow) { var s = R(x - 220, y - 22, 170, 44, "#f0d2c4", 2.2, 20); for (var k = 0; k < 5; k++) { var u = (t * .7 + k / 5) % 1; s += G("", C(x - 210 + u * 210, y + (k % 2 ? -8 : 8), 8, BLUE, 1.4), flow * (1 - u * .3)); } return s; }
// ── a body lying on its back, covered with a sheet, seen from the side (head to the left). swell 0..1 bulges the belly
function sheet(x, y, s, t, swell, sink) {
  swell = swell || 0; sink = sink || 0; var b = 30 * swell + 2 * Math.sin(t * 1.4) * swell;
  var top = "M-250 0 C-250 -44 -214 -60 -180 -50 C-150 -40 -130 -40 -110 -44 C-40 -54 0 " + f(-52 - b) + " 60 " + f(-56 - b * 1.2) + " C120 " + f(-58 - b) + " 150 -40 200 -32 C240 -26 260 -18 262 0 Z";
  return G("translate(" + f(x) + " " + f(y + sink * 20) + ") scale(" + s + " " + f(s * (1 - .55 * sink)) + ")", '<path d="' + top + '" fill="' + SHEET + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<path d="M-150 -38 C-120 -20 -60 -26 -20 -40 M40 -40 C80 -20 140 -26 180 -24" stroke="' + SHEET_D + '" stroke-width="3" fill="none"/>');
}
function table(x, y, w) { return R(x - w / 2, y, w, 16, "#b9b4a6", 2.2, 4) + '<path d="M' + f(x - w / 2 + 30) + ' ' + f(y + 16) + ' v80 M' + f(x + w / 2 - 30) + ' ' + f(y + 16) + ' v80" stroke="' + INK + '" stroke-width="5"/>'; }
// muscle fibres: rows of filaments; lock 0..1 pulls them together and pins them, loose relaxes them
function fibres(x, y, t, lock, loose) {
  var s = R(x - 220, y - 120, 440, 240, "#e7b7a6", 2.4, 30), sh = 30 * (lock || 0) * (1 - (loose || 0));
  for (var r = 0; r < 5; r++) { var yy = y - 90 + r * 45; s += R(x - 200, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x + 40 - sh, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x - 130, yy + 10, 260, 8, "#c98a74", 1.2, 4); if (lock > .5 && !(loose > .5)) s += '<path d="M' + f(x - 40 + sh - 8) + ' ' + f(yy - 12) + ' l16 24 M' + f(x - 40 + sh + 8) + ' ' + f(yy - 12) + ' l-16 24" stroke="' + ORANGE + '" stroke-width="2.6" opacity=".8"/>'; }
  return s + '<path d="M' + f(x + 14 * Math.sin(t * 3) * (1 - (lock || 0))) + ' ' + (y - 120) + ' v240" stroke="none"/>';
}
function battery(x, y, v) { return R(x - 40, y - 70, 80, 140, PAPER, 2.4, 8) + R(x - 16, y - 82, 32, 12, INK, 0, 3) + R(x - 32, y + 62 - 124 * clamp(v), 64, 124 * clamp(v), v < .3 ? ORANGE : OLIVE, 0, 4); }
// a rod bacterium
function bact(x, y, a, s) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + (s || 1) + ")", '<rect x="-16" y="-7" width="32" height="14" rx="7" fill="' + BACT + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M16 0 q8 -6 14 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'); }
function fly(x, y, t, s) { var w = 6 * Math.abs(Math.sin(t * 40)); return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", '<ellipse cx="-6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="10" ry="6" fill="' + FLY + '"/><circle cx="10" cy="-1" r="4" fill="' + FLY + '"/>'); }
// a soil cut with grass on top, layers, stones
function soil(y, t) { var s = R(-40, y, 720, 860 - y, SOIL, 2.4); s += R(-40, y + 120, 720, 860 - y - 120, SOIL_D, 0) + '<path d="M-40 ' + (y + 120) + ' H680" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>'; for (var k = 0; k < 18; k++) s += '<path d="M' + f(k * 38 - 20) + ' ' + y + ' l6 -16 l6 16" stroke="' + OLIVE + '" stroke-width="3" fill="none"/>'; for (k = 0; k < 10; k++) s += '<ellipse cx="' + f(hash(k) * 640) + '" cy="' + f(y + 30 + hash(k + 3) * 220) + '" rx="' + f(8 + hash(k + 5) * 10) + '" ry="6" fill="' + SOIL_L + '" stroke="' + INK + '" stroke-width="1.2"/>'; return s; }
// a skeleton lying down (side), simple bones
function skeleton(x, y, s) {
  var b = '<ellipse cx="-200" cy="-10" rx="30" ry="24" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="-210" cy="-14" r="5" fill="' + INK + '"/>';
  b += '<path d="M-168 -6 H130" stroke="' + INK + '" stroke-width="8"/><path d="M-168 -6 H130" stroke="' + BONE + '" stroke-width="5"/>';
  for (var k = 0; k < 8; k++) b += '<path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + BONE + '" stroke-width="2.6" fill="none"/>';
  b += '<ellipse cx="120" cy="-4" rx="26" ry="18" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  ["M140 0 L250 4", "M140 6 L250 14", "M-110 0 L0 14", "M-110 4 L0 22"].forEach(function (d) { b += '<path d="' + d + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" stroke="' + BONE + '" stroke-width="6" stroke-linecap="round"/>'; });
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
function thermo(x, y, v, lab) { var h = 220 * clamp(v); return R(x - 16, y - 240, 32, 250, "#f6f1e6", 2.4, 16) + R(x - 8, y - h, 16, h, ORANGE, 0) + C(x, y + 16, 24, ORANGE, 2.4) + (lab ? T(lab, x + 70, y - h + 8, 28, INK, 800) : ""); }
function stageTag(n, txt, k) { return G("", numBox(String(n), 120, 190, k, 40, true) + T(txt, 180, 202, 34, INK, 800, "end"), clamp(k)); }
// the four-stage strip on top (HUD): which one is on
function strip(on) { var L = [TX("هضم ذاتي", "self-digestion"), TX("انتفاخ", "bloat"), TX("تحلل", "decay"), TX("عضم", "bones")], s = ""; for (var i = 0; i < 4; i++) { var x = 110 + i * 140, a = i + 1 === on; s += '<rect x="' + (x - 62) + '" y="34" width="124" height="40" rx="6" fill="' + (a ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="1.8"/>' + T((i + 1) + " · " + L[i], x, 61, 17, a ? "#fff" : INK, 700); } return s; }

// ── shots (same line numbers in both editions)
// 4 · one small rule, remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 150, 340, 460, "#f4ecdb", 2.4, 8) + T(TX("قاعدة", "THE RULE"), 320, 220, 34, OLIVE, 800) + cell(340, 420, 90, t, 0, 0) + o2in(250, 420, t, 1); });
// 5 · a cell lives while the blood brings oxygen; cut it and the cell falls apart
shot(5, push(330, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, d * .45, d * .5); return paper() + cell(360, 420, 150, t, 0, k) + o2in(210, 420, t, 1 - at(u, d * .3, .6)) + cross(110, 300, .9, at(u, d * .35, .4)); }, { tr: "in" });
// 6 · first stage: self-digestion
shot(6, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(1, TX("الهضم الذاتي", "autolysis"), at(u, .2, .3)) + cell(320, 440, 170, t, 0, 0); });
// 7 · enzymes locked in tiny sacs; without oxygen the sacs burst
shot(7, push(330, 430, 1.0, 1.25), function (u, d, t) { return paper() + cell(320, 440, 200, t, at(u, d * .55, .8), 0) + label(320 + Math.cos(1) * 124, 440 + Math.sin(1) * 100, 470, 680, TX("أكياس إنزيمات", "enzyme sacs"), ORANGE, at(u, .6, .5), 24); });
// 8 · the enzymes spill out and digest the cell itself, like a stomach digesting food
shot(8, push(320, 420, 1.06, 1.0), function (u, d, t) { return paper() + cell(300, 450, 190, t, 1, at(u, .3, d - .5)) + iconBox(520, 150, 160, '<path d="M-30 -50 C-60 -40 -60 20 -20 40 C20 60 60 30 50 0 C40 -20 10 -10 0 -30 C-6 -44 -16 -54 -30 -50 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>', at(u, d * .5, .3)); });
// 9 · meanwhile the body cools about one degree an hour (1.5 °F)
shot(9, push(320, 420, 1.0, 1.05), function (u, d, t) { var k = at(u, .2, d - .3); return paper() + thermo(220, 600, .95 - .5 * k, EN ? count(98.6 - 6 * k, 1, 1) + "°F" : count(37 - 4 * k, 1, 1) + "°") + numBox(TX("−1° / ساعة", "−1.5°F / hr"), 430, 300, at(u, .8, .3), 34); });
// 10 · the blood settles with gravity, purple patches on the lower side
shot(10, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + table(320, 470, 560) + sheet(320, 470, 1.05, t, 0) + arrow(560, 250, 560, 380, MUTE, 6, at(u, .3, .5)) + inset(330, 620, 110, R(-120, -110, 240, 220, SKIN, 0) + R(-120, 110 - 80 * k, 240, 80 * k, PURPLE, 0, 0) + '<path d="M-120 110 H120" stroke="' + INK + '" stroke-width="3"/>', at(u, .6, .3)); });
// 11 · muscles stiffen as their energy runs out, then loosen a day or two later
shot(11, push(320, 420, 1.0, 1.04), function (u, d, t) { var lock = at(u, .3, 1.2), loose = at(u, d * .65, 1); return paper() + fibres(300, 470, t, lock, loose) + battery(540, 200, 1 - lock) + G("", T(TX("يوم أو اتنين", "1–2 days"), 300, 700, 30, OLIVE, 800), loose); });
// 12 · second stage: bloat
shot(12, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(2, TX("الانتفاخ", "bloat"), at(u, .2, .3)) + table(320, 520, 560) + sheet(320, 520, 1.05, t, .3); });
hud(12, 18, function (u, t) { var on = t < LN[16].start ? 2 : t < LN[17].start ? 3 : 4; return strip(on); });
hud(6, 12, function (u, t) { return strip(1); });
// 13 · trillions of gut bacteria, no immune system to stop them now
shot(13, push(320, 430, 1.0, 1.1), function (u, d, t) { var n = Math.round(6 + 34 * at(u, .3, d - .4)), s = paper() + '<path d="M60 300 C160 200 300 360 420 260 C520 180 600 300 600 420 C600 560 440 520 360 620 C280 720 120 640 80 540 C40 440 120 400 60 300 Z" fill="#e7b7a6" stroke="' + INK + '" stroke-width="3"/>'; for (var k = 0; k < n; k++) s += bact(140 + hash(k) * 380 + 6 * Math.sin(t * 2 + k), 320 + hash(k + 9) * 260 + 6 * Math.cos(t * 2 + k), hash(k + 4) * 180 + t * 20, .9); return s + G("", '<rect x="230" y="660" width="180" height="40" rx="6" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(TX("مناعة: ✗", "immune: ✗"), 320, 688, 22, ORANGE, 800), at(u, d * .55, .3)); }, { tr: "in" });
// 14 · they make gas and the body swells like a balloon in a few days
shot(14, push(320, 430, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5), s = paper() + table(320, 520, 560) + sheet(320, 520, 1.05, t, k); for (var j = 0; j < 6; j++) { var v = (t * .5 + j / 6) % 1; s += C(260 + j * 30, 470 - v * 60 * k, 6 + 6 * v, "#d8e6c8", 1.2); } return s + numBox(TX("أيام", "days"), 500, 250, at(u, d * .6, .3), 32); });
// 15 · the gases smell awful and call in flies from far away
shot(15, push(320, 430, 1.06, 1.0), function (u, d, t) { var s = paper() + table(320, 560, 560) + sheet(320, 560, 1.05, t, 1); for (var i = 0; i < 4; i++) s += '<path d="M' + (220 + i * 60) + ' 480 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" stroke="' + OLIVE + '" stroke-width="4" fill="none" opacity="' + f(.4 + .3 * Math.sin(t * 3 + i)) + '"/>'; for (var k = 0; k < 5; k++) { var q = clamp(u / d * 1.3 - k * .12); s += fly(lerp(680 + k * 40, 330 + k * 30, q) + 8 * Math.sin(t * 6 + k), lerp(120 + k * 40, 360 + (k % 2) * 30, q), t, 1.2); } return s; });
// 16 · stage three, active decay: tissue liquefies, larvae feed, most of the mass is lost (bar drops; the sheet sinks)
shot(16, push(320, 430, 1.04, 1.0), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + stageTag(3, TX("التحلل النشط", "active decay"), at(u, .2, .3)) + soil(560, t) + sheet(320, 560, 1.05, t, 0, k) + R(470, 200, 140, 26, PAPER, 2) + R(472, 202, 136 * (1 - .75 * k), 22, OLIVE, 0) + T(TX("الوزن", "mass"), 540, 260, 22, INK, 700); });
// 17 · in the end only the skeleton stays, for hundreds of years
shot(17, push(320, 460, 1.0, 1.06), function (u, d, t) { return paper() + stageTag(4, TX("الهيكل العضمي", "skeleton"), at(u, .2, .3)) + soil(380, t) + skeleton(320, 560, 1.05) + G("", numBox(TX("مئات السنين", "centuries"), 440, 250, 1, 30), at(u, d * .55, .3)); }, { tr: "out" });
// 18 · temperature first: warm speeds it up, cold slows it right down
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + G("translate(180 260)", '<circle r="54" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * .785 + t; return '<path d="M' + f(Math.cos(a) * 66) + ' ' + f(Math.sin(a) * 66) + ' l' + f(Math.cos(a) * 18) + ' ' + f(Math.sin(a) * 18) + '" stroke="' + INK + '" stroke-width="4"/>'; }).join("")) + arrow(120, 420, 260, 420, ORANGE, 9, at(u, .5, .4)) + G("translate(460 260) rotate(" + f(t * 20) + ")", [0, 1, 2].map(function (i) { return '<path d="M0 -60 V60" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round" transform="rotate(' + (i * 60) + ')"/>'; }).join("")) + arrow(420, 420, 470, 420, BLUE, 9, at(u, d * .5, .4)) + G("", T("×", 500, 432, 40, BLUE, 800), at(u, d * .6, .3)); });
// 19 · in air twice as fast as in water, eight times faster than buried in soil
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var rows = [[TX("هوا", "air"), 1, "#cfe0e8", TX("أسبوع", "1 week")], [TX("مية", "water"), 2, "#9fb7c3", TX("أسبوعين", "2 weeks")], [TX("تربة", "soil"), 8, SOIL, TX("8 أسابيع", "8 weeks")]], s = paper();
  rows.forEach(function (r, i) { var k = at(u, .3 + i * .7, .5), y = 260 + i * 150; s += R(80, y - 50, 120, 100, r[2], 2.2, 8) + T(r[0], 140, y + 10, 28, INK, 800) + R(230, y - 10, (44 * r[1] + 6 * Math.sin(t * 3 + i)) * k, 40, i ? MUTE : ORANGE, 2, 4) + G("", T(r[3], 236, y - 24, 26, INK, 800, "end"), k); });
  return s;
});
// 20 · the myth: hair and nails keep growing after death. no.
shot(20, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 250, 220, 420, SKIN, 2.6, 90) + R(180, 230, 160, 120, "#f4ecdb", 2.4, 60) + arrow(400, 300, 400, 180 - 6 * Math.sin(t * 3), ORANGE, 8, at(u, .4, .5)) + T("؟", 480, 260, 90, ORANGE, 800) + cross(420, 520, 1.3, at(u, d * .8, .4)); });
// 21 · the skin dries and shrinks back, so they look longer
shot(21, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5); return paper() + R(180, 230, 160, 160 + 40 * k, "#f4ecdb", 2.4, 50) + R(150, 290 + 50 * k, 220, 420, SKIN, 2.6, 90) + measure(400, 230, 400, 290 + 50 * k, 1, "") + label(260, 300 + 50 * k, 470, 560, TX("الجلد بينكمش", "skin shrinks"), OLIVE, at(u, d * .5, .5), 24); });
// 22 · recap: cells digest themselves, bacteria bloat, insects finish, bones remain
shot(22, push(320, 420, .88, 1.06), function (u, d, t) { var s = paper(), q = d / 4.4; var bb = function (i) { return f(16 * Math.sin(t * 2.4 + i * 1.3)); };
  s += G("translate(170 " + (300 + +bb(0)) + ") scale(.8)", cell(0, 0, 160, t, 1, .4), at(u, .1, .3)) + G("translate(470 " + (320 + +bb(1)) + ") scale(.55)", sheet(0, 0, 1, t, 1), at(u, q, .3)) + G("", fly(170 + 30 * Math.sin(t * 1.7), 600 + +bb(2), t, 4), at(u, 2 * q, .3)) + G("translate(470 " + (600 + +bb(3)) + ") scale(.62)", skeleton(0, 0, 1), at(u, 3 * q, .3)); for (var i = 0; i < 4; i++) s += callout(String(i + 1), [60, 360, 60, 360][i], [150, 150, 470, 470][i], at(u, .1 + i * q, .3), 20); return s; }, { tr: "out" });
// 23 · the odd fact: a research farm in the US studies donated bodies to pin down time of death
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) { var s = paper() + R(-40, 520, 720, 300, "#c9c09a", 2.4); for (var k = 0; k < 6; k++) s += '<path d="M' + (40 + k * 110) + ' 520 V380 M' + (20 + k * 110) + ' 420 H' + (150 + k * 110) + ' M' + (20 + k * 110) + ' 460 H' + (150 + k * 110) + '" stroke="' + INK + '" stroke-width="3"/>'; for (k = 0; k < 3; k++) s += C(120 + k * 200, 300, 50, OLIVE, 2.4) + R(114 + k * 200, 340, 12, 60, WOOD_D || "#7c5434", 2); return s + G("translate(470 640) rotate(" + f(-6 + 3 * Math.sin(t * 1.5)) + ")", R(-90, -60, 180, 120, "#f7f3ea", 2.4, 4) + '<path d="M-70 -30 H70 M-70 0 H40 M-70 30 H60" stroke="' + INK + '" stroke-width="2" opacity=".5"/>' + C(60, 30, 26, "none", 4) + '<path d="M78 48 l26 26" stroke="' + INK + '" stroke-width="6"/>') + G("", numBox(TX("وقت الوفاة؟", "time of death?"), 320, 160, 1, 30), at(u, d * .55, .3)); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = '<path d="M60 300 H160 l20 -60 l30 120 l20 -60 H260" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-linejoin="round"/>';
  var k = clamp((t - LN[0].start) / 2.2); s += '<path d="M260 300 H' + f(260 + 290 * k) + '" stroke="' + INK + '" stroke-width="5"/>' + C(260 + 290 * k, 300, 9, ORANGE, 2);
  s += G("translate(" + f(300 + 14 * Math.sin(t * 2.2)) + " " + f(460 + 10 * Math.cos(t * 1.8)) + ") scale(" + f(1 + .06 * Math.sin(t * 2.6)) + ")", cell(0, 0, 110, t, li >= 1 ? ease((t - LN[1].start) / 1.2) : 0, 0), li >= 1 ? 1 : .35 + .1 * Math.sin(t * 3));
  if (li >= 2) s += G("", '<path d="M80 600 H520" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 8"/>' + [0, 1, 2, 3].map(function (i) { return callout(String(i + 1), 100 + i * 135, 600, 1, 18); }).join(""), ease((t - LN[2].start) / .5));
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 112) scale(.32)", cell(0, 0, 120, t, 0, 0)); };
SCENE.outro = function (svg, u, t) {
  return G("translate(70 140) scale(.3)", cell(0, 0, 160, t, 1, .3)) + G("translate(220 150) scale(.32)", sheet(0, 0, 1, t, 1)) + fly(370, 140, t, 1.6) + G("translate(500 150) scale(.3)", skeleton(0, 0, 1)) +
    callout("1", 70, 60, ease(u / .3)) + callout("2", 220, 60, ease(u / .3 - .5)) + callout("3", 370, 60, ease(u / .3 - 1)) + callout("4", 500, 60, ease(u / .3 - 1.5));
};
