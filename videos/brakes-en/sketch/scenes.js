window.CHUNKS = [[0.0, 0.3382, 0.75], [0.0, 0.4833], [0.0, 0.4889], [0.0, 0.3913], [0.0, 0.2982, 0.7193], [0.0, 0.2632, 0.4947, 0.7579], [0.0, 0.4426], [0.0, 0.119, 0.4643], [0.0, 0.2059, 0.4608, 0.7353], [0.0, 0.4691], [0.0, 0.2941, 0.6824], [0.0, 0.3611, 0.6019, 0.8148], [0.0, 0.4884, 0.814], [0.0, 0.5079], [0.0, 0.4674], [0.0, 0.4634, 0.7561], [0.0, 0.4935], [0.0, 0.5484], [0.0, 0.3421, 0.6447], [0.0, 0.5], [0.0, 0.2963, 0.7037], [0.0, 0.5316], [0.0, 0.114, 0.2719, 0.5526, 0.7895], [0.0, 0.2701, 0.4818, 0.6715, 0.8613], [0.0], [0.0, 0.2143]];
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

window.EN_ED = true;
// ── «الفرامل» / How Brakes Stop a Car — one drawing file for both editions (brakes-en/sketch/make.sh adds
// `window.EN_ED = true;`). Realistic drawings: a sedan in profile, the pedal + booster + master cylinder in section,
// the hydraulic circuit from above, a floating caliper in section on a vented disc, the tyre on asphalt. See refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var CARC = "#7d9aa8", CARD = "#5f7c8a", GLASS = "#cfe0e8", TIRE = "#3d3a34", STEELC = "#c9cdd0", STEELD = "#9aa0a4", FLUID = "#d9a441", PADC = "#6b4a34",
    ASPH = "#6f6a62", ASPH_L = "#8a857c", HOTC = "#e8502a", RUBBER = "#2f2c28", BATT = "#5e653a", SKYB = "#cfe0e8";
function mixc(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, o = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), k)); o += (v < 16 ? "0" : "") + v.toString(16); } return o; }

// ── a wheel from the side: tyre with tread ticks, alloy rim with 5 spokes turning by ang, the disc and caliper behind
function wheel(x, y, R, ang, heat) {
  var s = C(x, y, R, RUBBER, 2.4) + C(x, y, R * .72, "#55504a", 1.6);
  for (var k = 0; k < 24; k++) { var a = ang + k * .2618; s += '<path d="M' + f(x + Math.cos(a) * R * .9) + ' ' + f(y + Math.sin(a) * R * .9) + ' L' + f(x + Math.cos(a) * R) + ' ' + f(y + Math.sin(a) * R) + '" stroke="' + INK + '" stroke-width="1.6" opacity=".6"/>'; }
  s += C(x, y, R * .56, mixc(STEELC, HOTC, heat || 0), 1.6) + C(x, y, R * .3, STEELD, 1.4);
  s += '<path d="M' + f(x + R * .3) + ' ' + f(y - R * .56) + ' A' + f(R * .64) + ' ' + f(R * .64) + ' 0 0 1 ' + f(x + R * .62) + ' ' + f(y - R * .12) + ' L' + f(x + R * .42) + ' ' + f(y - R * .06) + ' A' + f(R * .42) + ' ' + f(R * .42) + ' 0 0 0 ' + f(x + R * .2) + ' ' + f(y - R * .38) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (k = 0; k < 5; k++) { var b = ang + k * 1.2566; s += '<path d="M' + f(x + Math.cos(b - .16) * R * .14) + ' ' + f(y + Math.sin(b - .16) * R * .14) + ' L' + f(x + Math.cos(b - .07) * R * .7) + ' ' + f(y + Math.sin(b - .07) * R * .7) + ' L' + f(x + Math.cos(b + .07) * R * .7) + ' ' + f(y + Math.sin(b + .07) * R * .7) + ' L' + f(x + Math.cos(b + .16) * R * .14) + ' ' + f(y + Math.sin(b + .16) * R * .14) + ' Z" fill="#e6e8ea" stroke="' + INK + '" stroke-width="1.4"/>'; }
  return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(R * .72) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>' + C(x, y, R * .12, "#e6e8ea", 1.4);
}
// ── a sedan in profile, facing right. op: ang (wheel angle), dive (nose-down degrees), heat, glass
function car(x, y, s, op) {
  op = op || {}; var b = "", a = op.ang || 0;
  b += '<ellipse cx="0" cy="74" rx="230" ry="9" fill="#000" opacity=".16"/>';
  var body = '<path d="M-226 22 C-228 -2 -216 -20 -192 -24 L-150 -30 C-122 -62 -92 -80 -40 -82 L44 -82 C84 -80 112 -62 138 -34 L190 -24 C214 -18 226 -2 224 22 L224 36 L-226 36 Z" fill="' + CARC + '" stroke="' + INK + '" stroke-width="2.6"/>';
  body += '<path d="M-226 22 H224" stroke="' + CARD + '" stroke-width="10" opacity=".55"/>';
  body += '<path d="M-136 -32 C-112 -58 -88 -70 -44 -72 L-8 -72 L-8 -32 Z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M4 -72 L40 -72 C74 -70 98 -56 120 -32 L4 -32 Z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1.8"/>';
  body += '<path d="M-2 -30 V32 M-140 -28 C-146 -6 -146 14 -140 32" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".5"/><rect x="-36" y="-16" width="20" height="5" rx="2" fill="' + INK + '" opacity=".6"/><rect x="78" y="-16" width="20" height="5" rx="2" fill="' + INK + '" opacity=".6"/>';
  body += '<path d="M206 -14 C218 -10 222 -2 222 6 L204 6 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.4"/><path d="M-222 -8 L-208 -12 L-206 6 L-224 6 Z" fill="' + (op.brake ? HOTC : "#a8463a") + '" stroke="' + INK + '" stroke-width="1.4"/>';
  body += '<path d="M118 -40 l10 -6 l6 8 l-10 4 Z" fill="' + CARD + '" stroke="' + INK + '" stroke-width="1.2"/>';
  body += '<path d="M-176 36 A46 46 0 0 1 -84 36 Z" fill="#2a2620"/><path d="M84 36 A46 46 0 0 1 176 36 Z" fill="#2a2620"/>';
  b += G("rotate(" + f(op.dive || 0) + " 0 36)", body) + wheel(-130, 38, 38, a, op.heat) + wheel(130, 38, 38, a, op.heat);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
function road(y, t, speed) { var s = R(-40, y, 720, 860 - y, ASPH, 2.4); for (var i = 0; i < 7; i++) s += R(((i * 130 - t * (speed || 0)) % 910 + 910) % 910 - 130, y + 70, 70, 8, "#f4f1ea", 0); return s; }
// ── the pedal, the booster and the master cylinder in section (the driver's foot comes from the left). k = pedal travel
function pedalUnit(x, y, k, t, show) {
  show = show || {}; var a = 14 * k, s = "";
  s += '<path d="M' + (x - 60) + ' ' + (y - 210) + ' V' + (y + 130) + '" stroke="' + INK + '" stroke-width="6"/>' + hatch("M" + (x - 60) + " " + (y - 210) + " h14 v340 h-14 Z");                           // firewall
  // master cylinder + reservoir (right of the booster)
  s += R(x + 150, y - 22, 190, 44, STEELC, 2.4, 6) + R(x + 160, y - 14, 170, 28, FLUID, 0) + R(x + 164 + 26 * k, y - 16, 22, 32, STEELD, 1.8, 3) + '<path d="M' + (x + 150) + ' ' + y + ' H' + f(x + 164 + 26 * k) + '" stroke="' + INK + '" stroke-width="5"/>';
  s += R(x + 200, y - 78, 90, 56, "#f4f1ea", 2.2, 8) + R(x + 206, y - 54, 78, 28, FLUID, 0, 4) + R(x + 226, y - 90, 38, 14, TIRE, 1.6, 4);
  s += '<path d="M' + (x + 340) + ' ' + (y + 4) + ' h30 v70" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="M' + (x + 340) + ' ' + (y + 4) + ' h30 v70" stroke="' + FLUID + '" stroke-width="4" fill="none"/>';
  // booster: a round can, its diaphragm and spring
  s += '<ellipse cx="' + (x + 60) + '" cy="' + y + '" rx="92" ry="112" fill="#4a4640" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="' + (x + 60) + '" cy="' + y + '" rx="80" ry="100" fill="#5f5a52"/>';
  s += '<path d="M' + f(x + 40 + 16 * k) + ' ' + (y - 96) + ' V' + (y + 96) + '" stroke="#e6dccb" stroke-width="6"/><path d="M' + f(x + 46 + 16 * k) + ' ' + (y - 30) + ' l14 10 l-14 10 l14 10 l-14 10 l14 10 l-14 10" stroke="' + STEELC + '" stroke-width="2.4" fill="none"/>';
  if (show.vac) s += G("", T(TX("شفط", "vacuum"), x + 96, y - 52, 20, "#fff", 700) + arrow(x + 120, y - 30, x + 76, y - 30, "#cfe0e8", 4, 1), show.vac);
  s += '<path d="M' + f(x - 64 + 14 * k) + ' ' + y + ' H' + f(x + 40 + 16 * k) + '" stroke="' + INK + '" stroke-width="6"/>';                                              // pushrod
  // the pedal arm: pivot at the top, pad at the bottom, pushrod a quarter of the way down
  var arm = '<path d="M0 0 L-30 250" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M0 0 L-30 250" stroke="' + STEELC + '" stroke-width="11" stroke-linecap="round"/><rect x="-64" y="238" width="60" height="22" rx="6" fill="' + TIRE + '" stroke="' + INK + '" stroke-width="2" transform="rotate(-12 -34 250)"/>';
  s += G("translate(" + (x - 110) + " " + (y - 62) + ") rotate(" + f(-a) + ")", arm) + C(x - 110, y - 62, 9, STEELD, 2.2);
  return s;
}
// a shoe pressing the pedal
function shoe(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", '<path d="M-150 -30 L-40 -34 C0 -34 40 -20 70 -4 C84 4 84 20 70 22 L-150 24 Z" fill="#8f4f34" stroke="' + INK + '" stroke-width="2.4"/><path d="M-150 24 H70" stroke="' + INK + '" stroke-width="7"/><path d="M-150 -30 V-110 H-70 L-40 -34" fill="#4a6f8a" stroke="' + INK + '" stroke-width="2.4"/>'); }
// ── the hydraulic circuit from above: body outline, four wheels, master cylinder, lines; p = pressure pulse 0..1
function circuit(t, p) {
  var s = '<path d="M150 150 C150 110 180 96 230 96 H410 C460 96 490 110 490 150 V650 C490 690 460 704 410 704 H230 C180 704 150 690 150 650 Z" fill="#e6dccb" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="10 8"/>';
  var W = [[130, 230], [510, 230], [130, 570], [510, 570]];
  var ln = ["M250 190 H170 V230", "M270 190 H470 V230", "M250 210 V570 H170", "M270 210 H390 V570 H470"];
  ln.forEach(function (d) { s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="' + mixc(FLUID, HOTC, p * .6) + '" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 26" stroke-dashoffset="' + f(-t * 90) + '" opacity="' + f(.7 * p) + '"/>'; });
  W.forEach(function (w) { s += R(w[0] - 26, w[1] - 54, 52, 108, RUBBER, 2.2, 12) + R(w[0] - (w[0] < 320 ? -30 : 40), w[1] - 34, 10, 68, STEELC, 1.6, 3) + R(w[0] - (w[0] < 320 ? -28 : 46), w[1] - 16, 18, 32, mixc(ORANGE, HOTC, p), 1.6, 4); });
  return s + R(232, 172, 56, 56, STEELC, 2.4, 8) + C(260, 200, 14, FLUID, 2);
}
// ── two pistons joined by a pipe (Pascal): a small one pushed by k, a big one that moves less but pushes harder
function pascal(x, y, k, t) {
  var s = R(x - 220, y - 30, 150, 60, STEELC, 2.4, 6) + R(x - 212, y - 22, 140, 44, FLUID, 0) + R(x - 214 + 50 * k, y - 26, 20, 52, STEELD, 2, 3) + '<path d="M' + (x - 260) + ' ' + y + ' H' + f(x - 214 + 50 * k) + '" stroke="' + INK + '" stroke-width="6"/>';
  s += '<path d="M' + (x - 70) + ' ' + y + ' H' + (x + 40) + '" stroke="' + INK + '" stroke-width="12"/><path d="M' + (x - 72) + ' ' + y + ' H' + (x + 42) + '" stroke="' + FLUID + '" stroke-width="7"/>';
  s += R(x + 40, y - 90, 170, 180, STEELC, 2.4, 8) + R(x + 48, y - 82, 154, 164, FLUID, 0) + R(x + 150 + 14 * k, y - 86, 26, 172, STEELD, 2, 3) + '<path d="M' + f(x + 176 + 14 * k) + ' ' + y + ' H' + (x + 260) + '" stroke="' + INK + '" stroke-width="10"/>';
  return s;
}
// ── a floating caliper in section, seen from above: the vented disc edge-on in the middle, a pad each side, the piston
// and its fluid on the left, the bridge over the top carrying the outer pad. k = squeeze 0..1, spin = disc speed 0..1
function caliperCut(x, y, s, k, t, spin, heat) {
  var g = 16 * (1 - k), b = "", hc = mixc(STEELC, HOTC, heat || 0);
  // the disc: two plates with cooling vanes between, running through the page (stripes move when it turns)
  b += R(-22, -260, 14, 520, hc, 2.2) + R(8, -260, 14, 520, hc, 2.2);
  for (var i = 0; i < 14; i++) { var yy = ((i * 40 + t * 260 * (spin == null ? 1 : spin)) % 520) - 260; b += R(-8, yy, 16, 14, STEELD, 1.2, 2); }
  // pads with their backing plates
  b += R(-48 - g, -92, 26, 184, PADC, 2, 3) + R(-56 - g, -100, 8, 200, STEELD, 1.6) + R(22 + g, -92, 26, 184, PADC, 2, 3) + R(48 + g, -100, 8, 200, STEELD, 1.6);
  // caliper body: cylinder on the left, bridge, fingers on the right (the whole body slides as it squeezes)
  var sl = -g * .5;
  b += G("translate(" + f(sl) + " 0)", '<path d="M-200 -120 H-70 V-150 H86 V110 H60 V-110 H-70 V120 H-200 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.6"/>' + R(-186, -70, 80, 140, FLUID, 1.6, 4));
  b += R(-126 - g, -62, 70, 124, STEELC, 2.2, 6) + '<path d="M-90 -62 v124" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  b += '<path d="M-260 -40 H-200" stroke="' + INK + '" stroke-width="9"/><path d="M-262 -40 H-198" stroke="' + FLUID + '" stroke-width="5"/>';
  if ((heat || 0) > .2) for (i = 0; i < 6; i++) { var u = (t * 1.2 + i / 6) % 1; b += '<path d="M' + (-30 + (i % 2) * 60) + ' ' + f(-120 - u * 90 + (i % 3) * 110) + ' q-8 -12 0 -24" stroke="' + HOTC + '" stroke-width="3" fill="none" opacity="' + f((1 - u) * heat) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── the disc face-on with its caliper (for heat): hub, bolt holes, drilled face; heat 0..1 turns it orange
function discFace(x, y, R0, ang, heat) {
  var hc = mixc(STEELC, HOTC, heat), s = C(x, y, R0, hc, 2.6) + C(x, y, R0 * .52, STEELD, 2) + C(x, y, R0 * .2, "#3d3a34", 2);
  for (var k = 0; k < 5; k++) { var a = ang + k * 1.2566; s += C(x + Math.cos(a) * R0 * .36, y + Math.sin(a) * R0 * .36, R0 * .05, "#3d3a34", 1); }
  for (k = 0; k < 18; k++) { var b = ang + k * .349; s += C(x + Math.cos(b) * R0 * (.66 + (k % 3) * .1), y + Math.sin(b) * R0 * (.66 + (k % 3) * .1), R0 * .022, INK, 0); }
  if (heat > .3) s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(R0 * 1.06) + '" fill="none" stroke="' + HOTC + '" stroke-width="' + f(8 * heat) + '" opacity="' + f(.35 * heat) + '"/>';
  return s + '<path d="M' + f(x + R0 * .3) + ' ' + f(y - R0 * 1.04) + ' A' + f(R0 * 1.1) + ' ' + f(R0 * 1.1) + ' 0 0 1 ' + f(x + R0 * 1.02) + ' ' + f(y - R0 * .2) + ' L' + f(x + R0 * .62) + ' ' + f(y - R0 * .1) + ' A' + f(R0 * .64) + ' ' + f(R0 * .64) + ' 0 0 0 ' + f(x + R0 * .16) + ' ' + f(y - R0 * .6) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>';
}
// ── the tyre on the road, close: a big arc of tread on asphalt, the contact patch; slide = skid (0 rolling, 1 locked)
function tyreRoad(t, slide, ang) {
  var s = R(-40, 560, 720, 300, ASPH, 2.4), cx = 320, cy = 250, R0 = 320;
  for (var i = 0; i < 40; i++) s += C(hash(i) * 640, 580 + hash(i + 7) * 180, 2 + hash(i + 3) * 3, ASPH_L, 0);
  s += C(cx, cy, R0, RUBBER, 3) + C(cx, cy, R0 * .7, "#55504a", 2) + C(cx, cy, R0 * .56, STEELC, 2);
  for (var k = 0; k < 44; k++) { var a = ang + k * .1428; s += '<path d="M' + f(cx + Math.cos(a) * R0 * .9) + ' ' + f(cy + Math.sin(a) * R0 * .9) + ' L' + f(cx + Math.cos(a + .03) * R0) + ' ' + f(cy + Math.sin(a + .03) * R0) + '" stroke="' + INK + '" stroke-width="4" opacity=".7"/>'; }
  if (slide > 0) for (k = 0; k < 6; k++) { var u = (t * 2 + k / 6) % 1; s += '<path d="M' + f(250 - u * 260) + ' ' + (566 + (k % 3) * 5) + ' h-50" stroke="#2a2620" stroke-width="5" opacity="' + f(slide * (1 - u)) + '"/>' + C(300 - u * 200, 556 - u * 40, 8 + 14 * u, "#d9d4c8", 0).replace("/>", ' opacity="' + f(.5 * slide * (1 - u)) + '"/>'); }
  return s;
}
function battery(x, y, v, w) { w = w || 200; return R(x - w / 2, y - 26, w, 52, PAPER, 2.4, 8) + R(x + w / 2, y - 10, 10, 20, INK, 0, 3) + R(x - w / 2 + 6, y - 20, (w - 12) * clamp(v), 40, BATT, 0, 4); }

// ── shots (same line numbers in both editions)
// 4 · one small rule, remember it: energy changes form
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(110, 150, 420, 460, "#f4ecdb", 2.4, 8) + T(TX("قاعدة", "THE RULE"), 320, 220, 34, OLIVE, 800) + car(320, 380, .62, { ang: t * 6 }) + arrow(250, 520, 390, 520, INK, 5, at(u, .5, .5)) + T(TX("حركة", "motion"), 190, 530, 26, BLUE, 800) + G("", T(TX("حرارة", "heat"), 450, 530, 26, HOTC, 800), at(u, 1, .3)); });
// 5 · energy never disappears; a moving car carries a lot of motion energy
shot(5, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + R(-40, -40, 720, 560, SKYB, 0) + road(520, t, 520) + car(320, 480, 1.0, { ang: t * 14 }) + G("", numBox(TX("طاقة حركة", "motion energy"), 320, 200, 1, 34), at(u, d * .5, .3)) + arrow(120, 300, 520, 300, BLUE, 9, at(u, d * .55, .5)); });
// 6 · brakes turn that motion energy into heat
shot(6, push(320, 400, 1.0, 1.1), function (u, d, t) { var k = at(u, .3, d - .6); return paper() + discFace(320, 400, 190, t * 10 * (1 - .8 * k), k) + G("", T(TX("حرارة", "HEAT"), 320, 720, 44, HOTC, 800), at(u, d * .55, .3)); }, { tr: "in" });
// 7 · step one: the pedal is a lever, about four times the push
shot(7, push(300, 420, 1.0, 1.04), function (u, d, t) { var k = at(u, .4, 1.2); return paper() + pedalUnit(300, 380, k, t) + shoe(150 + 24 * k, 560 - 2 * k, .8) + arrow(40, 600, 110 + 20 * k, 590, ORANGE, 7, at(u, .3, .4)) + label(190, 318, 250, 130, TX("محور الرافعة", "pivot"), OLIVE, at(u, .8, .5), 22) + numBox("×4", 500, 620, at(u, d * .6, .3), 44); });
// 8 · the booster uses the engine's vacuum to multiply the push again
shot(8, push(340, 390, 1.1, 1.22), function (u, d, t) { var k = .5 + .5 * Math.sin(t * 2.2); return paper() + pedalUnit(300, 380, k, t, { vac: at(u, .8, .4) }) + label(360, 290, 470, 150, TX("الباكم", "booster"), OLIVE, at(u, .4, .5), 24); });
// 9 · the push reaches a small piston that squeezes brake fluid into thin pipes
shot(9, push(520, 400, 1.3, 1.45), function (u, d, t) { var k = .5 + .5 * Math.sin(t * 2.2); return paper() + pedalUnit(300, 380, k, t) + label(500, 380, 420, 560, TX("مكبس", "piston"), OLIVE, at(u, .5, .5), 22) + label(545, 330, 600, 200, TX("زيت الفرامل", "brake fluid"), ORANGE, at(u, 1.3, .5), 20); });
// 10 · fluid can't be squashed: the pressure reaches all four wheels at the same instant
shot(10, push(320, 400, .96, 1.02), function (u, d, t) { var p = at(u, .6, .6); return paper() + circuit(t, p) + G("", numBox(TX("في نفس اللحظة", "same instant"), 320, 740, 1, 26), at(u, d * .55, .3)); }, { tr: "out" });
// 11 · a bigger piston at each wheel: the force grows again, like a jack lifting a car with one hand
shot(11, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = .5 + .5 * Math.sin(t * 2), jack = '<rect x="-34" y="10" width="68" height="14" rx="3" fill="' + STEELD + '" stroke="' + INK + '" stroke-width="2"/><rect x="-20" y="-40" width="40" height="52" rx="4" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="-8" y="' + f(-62 - 8 * k) + '" width="16" height="26" fill="' + STEELC + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M20 -6 L58 ' + f(-30 + 16 * k) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><rect x="-40" y="' + f(-74 - 8 * k) + '" width="80" height="12" rx="3" fill="' + CARC + '" stroke="' + INK + '" stroke-width="1.6"/>';
  return paper() + pascal(320, 430, k, t) + arrow(40, 430, 96, 430, ORANGE, 6, 1) + arrow(590, 430, 590 + 0, 430, ORANGE, 6, 0) + arrow(560, 520, 620, 520, ORANGE, 14, at(u, 1, .5)) + label(180, 400, 230, 250, TX("مكبس صغير", "small piston"), OLIVE, at(u, .4, .5), 22) + label(440, 350, 420, 240, TX("مكبس أكبر", "bigger piston"), OLIVE, at(u, 1.2, .5), 22) + iconBox(520, 130, 150, jack, at(u, d * .55, .3));
});
// 12 · thirty kilos from your foot, more than a ton at the brakes
shot(12, push(320, 420, 1.04, 1.0), function (u, d, t) { var k = at(u, d * .45, 1); return paper() + shoe(210, 300, .9) + numBox(EN ? "70" : "30", 200, 420, at(u, .3, .3), 40) + T(TX("كيلو", "pounds"), 330, 432, 28, INK, 800) + arrow(200, 470, 200, 540, INK, 6, at(u, .8, .4)) + R(120, 560 - 0, 400 * k + 40, 46, ORANGE, 2.4, 6) + G("", numBox("1+", 400, 680, 1, 44, true) + T(TX("طن", "ton"), 500, 694, 34, INK, 800), k); });
// 13 · and what do they clamp? a steel disc that spins with the wheel — the camera flies from the car into the wheel
shot(13, push(320, 420, 1.0, 1.0), function (u, d, t) { var k = ease(clamp((u - .1) / (d * .7))), Z = Math.exp(Math.log(6.2) * k); return paper() + G("translate(320 430) scale(" + f(Z) + ") translate(-130 -38)", car(0, 0, 1, { ang: t * 8 })) + G("", label(360, 400, 500, 220, TX("الطارة", "the disc"), OLIVE, 1, 26), clamp((k - .8) / .2)); });
// 14 · two pads squeeze the disc from both sides, like pinching a spinning plate with your fingers
shot(14, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .5, 1.4), plate = '<ellipse cx="0" cy="0" rx="50" ry="14" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="0" rx="30" ry="8" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/><path d="M-66 -10 C-56 -14 -50 -8 -48 -2 M-66 12 C-56 14 -50 8 -48 2" stroke="' + SKIN2 + '" stroke-width="10" stroke-linecap="round" fill="none"/>';
  return paper() + caliperCut(330, 430, 1.05, k, t, 1 - .85 * k, 0) + label(290 - 16 * (1 - k), 430, 150, 660, TX("تيل", "pad"), OLIVE, at(u, .4, .5), 24) + label(382 + 16 * (1 - k), 430, 520, 660, TX("تيل", "pad"), OLIVE, at(u, .8, .5), 24) + label(240, 380, 130, 230, TX("مكبس", "piston"), ORANGE, at(u, 1.4, .5), 22) + iconBox(520, 130, 150, plate, at(u, d * .6, .3));
}, { tr: "in" });
// 15 · friction turns motion into heat: in hard braking the disc can pass 500 °C (900 °F)
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .6); return paper() + discFace(300, 420, 210, t * 12 * (1 - .9 * k), k) + numBox(count(EN ? 900 : 500, k) + (EN ? "°F" : "°"), 520, 170, 1, 40); });
// 16 · that's why the disc is hollow inside: air flows through and cools it
shot(16, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper() + caliperCut(320, 430, 1.25, 0, t, 1, 1 - at(u, .5, d - .8));
  for (var i = 0; i < 4; i++) { var v = (t * .9 + i / 4) % 1; s += arrow(320, 700 - v * 520, 320, 660 - v * 520, BLUE, 5, 1); }
  return s + label(320, 300, 500, 180, TX("فتحات تهوية", "cooling vanes"), BLUE, at(u, .6, .5), 22);
});
// 17 · but what finally stops the car is the tyres' grip on the road
shot(17, push(320, 440, 1.0, 1.08), function (u, d, t) { return paper() + R(-40, -40, 720, 640, SKYB, 0) + tyreRoad(t, 0, t * .8) + arrow(380, 590, 240, 590, ORANGE, 12, at(u, .6, .5)) + label(320, 566, 360, 700, TX("مسكة الكاوتش", "tire grip"), "#fff", at(u, 1, .5), 26); }, { tr: "in" });
// 18 · the myth: if the wheels lock, the car stops faster. no.
shot(18, push(320, 420, 1.0, 1.04), function (u, d, t) { return paper() + R(-40, -40, 720, 560, SKYB, 0) + road(520, t, 300) + car(320 + 30 * Math.sin(t * .8), 480, 1.0, { ang: 0, dive: 2.5, brake: 1 }) + '<path d="M-40 560 H' + f(190 + 30 * Math.sin(t * .8)) + ' M-40 572 H' + f(190 + 30 * Math.sin(t * .8)) + '" stroke="#2a2620" stroke-width="6" opacity=".7"/>' + cross(320, 250, 1.5, at(u, d * .78, .4)); }, { tr: "out" });
// 19 · a locked wheel just slides, and you can't steer
shot(19, push(320, 440, 1.02, 1.08), function (u, d, t) { return paper() + R(-40, -40, 720, 640, SKYB, 0) + tyreRoad(t, 1, .4) + iconBox(520, 140, 150, '<circle r="46" fill="none" stroke="' + INK + '" stroke-width="9"/><circle r="12" fill="' + INK + '"/><path d="M-44 0 H44 M0 0 V44" stroke="' + INK + '" stroke-width="7"/>', at(u, d * .45, .3)) + cross(520, 140, 1.1, at(u, d * .65, .4)); });
// 20 · ABS releases and grabs the brakes up to fifteen times a second
shot(20, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var pulse = Math.sin(t * 28) > 0 ? 1 : .35, s = paper() + caliperCut(320, 330, .8, pulse, t, .5, 0), g = "M80 690";
  for (var i = 0; i < 12; i++) g += " h20 v" + (i % 2 ? 50 : -50); s += R(60, 610, 520, 110, "#f4ecdb", 2, 6) + '<path d="' + g + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-dasharray="1000" stroke-dashoffset="' + f(1000 - 1000 * clamp(u / (d * .8))) + '"/>';
  return s + tag("ABS", 130, 150, at(u, .2, .3), 34, ORANGE) + numBox(count(15, at(u, .5, 1.5)), 480, 150, at(u, .5, .3), 34) + T(TX("مرة / ثانية", "times / sec"), 480, 210, 20, INK, 700);
});
// 21 · the wheels keep turning a little and the tyres keep gripping
shot(21, push(320, 420, 1.0, 1.04), function (u, d, t) { var k = clamp(u / d); return paper() + R(-40, -40, 720, 560, SKYB, 0) + road(520, t, 200) + '<path d="M470 520 l24 -60 l24 60 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="462" y="516" width="64" height="10" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>' + car(lerp(120, 300, k), 480 - 60 * Math.sin(k * 3.14), .8, { ang: t * 5, dive: 2, brake: 1 }) + check(320, 230, 1.4, at(u, d * .6, .4)); });
// 22 · recap: foot pushes, fluid multiplies, pads squeeze, motion becomes heat
shot(22, push(320, 420, .88, 1.06), function (u, d, t) {
  var q = d / 5, bb = function (i) { return 16 * Math.sin(t * 2.6 + i * 1.3); }, s = paper();
  s += G("translate(" + f(190 + 14 * Math.sin(t * 1.9)) + " " + f(300 + bb(0)) + ")", shoe(0, 0, 1.05), at(u, .05, .3)) + G("translate(470 " + f(300 + bb(1)) + ") scale(.62)", pascal(0, 0, .5 + .5 * Math.sin(t * 3), t), at(u, q, .3));
  s += G("", caliperCut(180, 610 + bb(2), .56, .5 + .5 * Math.sin(t * 3), t, 1, 0), at(u, 2 * q, .3)) + G("", discFace(470, 610 + bb(3), 125, t * 5, .6 + .4 * Math.sin(t * 2)), at(u, 3 * q, .3));
  for (var i = 0; i < 4; i++) s += callout(String(i + 1), [50, 330, 50, 330][i], [170, 170, 470, 470][i], at(u, .05 + i * q, .3), 20);
  return s;
}, { tr: "out" });
// 23 · the odd fact: electric cars brake with the motor and send the energy back to the battery
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, d - .8), s = paper() + R(-40, -40, 720, 560, SKYB, 0) + road(520, t, 300 * (1 - .7 * k)) + car(320, 480, 1.0, { ang: t * 10 * (1 - .7 * k) });
  s += R(230, 494, 180, 20, BATT, 1.6, 4) + C(450, 518, 16, ORANGE, 2);
  for (var i = 0; i < 4; i++) { var v = (t * 1.2 + i / 4) % 1; s += C(lerp(450, 330, v), 504, 6, "#f2c230", 1.2); }
  return s + battery(320, 220, .35 + .5 * k, 240) + label(450, 518, 560, 330, TX("الموتور", "motor"), ORANGE, at(u, .5, .5), 22);
});

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var k1 = li >= 1 ? ease((t - LN[1].start) / 2.6) : 0, sp = 520 * (1 - k1), s = R(-40, -40, 720, 520, SKYB, 0) + road(430, t, sp);
  s += car(lerp(200, 380, k1) + 6 * Math.sin(t * 2), 392, .82, { ang: t * 14 * (1 - k1) + k1 * 3, dive: 3 * Math.sin(k1 * 3.14), brake: li >= 1 });
  if (li === 0) s += G("", numBox("1.5", 270, 150, 1, 36) + T(TX("طن", "tons"), 370, 162, 30, INK, 800), ease((t - LN[0].start) / .4));
  if (li >= 1) s += measure(200, 560, 200 + 300 * k1, 560, 1, "") + G("", N(EN ? "130" : "40", 320, 620, 40, ORANGE) + T(TX("متر", "feet"), 410, 618, 28, ORANGE, 800), k1);
  if (li >= 2) s += G("translate(120 200) rotate(-8)", shoe(0, 0, .5), ease((t - LN[2].start) / .4));
  return s;
};
SCENE.bumper = function (u, t) { return discFace(84, 116, 52, t * 3, 0); };
SCENE.outro = function (svg, u, t) {
  return G("translate(40 230) scale(.34)", shoe(0, 0, 1)) + G("translate(150 150) scale(.3)", pascal(0, 0, .5 + .5 * Math.sin(t * 2), t)) + caliperCut(330, 140, .3, .5 + .5 * Math.sin(t * 2), t, 1, 0) + discFace(460, 140, 60, t * 3, .8) + G("translate(520 216)", '<rect x="-40" y="0" width="100" height="14" fill="' + ASPH + '" stroke="' + INK + '" stroke-width="1.4"/>') +
    callout("1", 60, 70, ease(u / .3)) + callout("2", 190, 70, ease(u / .3 - .5)) + callout("3", 330, 40, ease(u / .3 - 1)) + callout("4", 540, 70, ease(u / .3 - 1.5));
};
