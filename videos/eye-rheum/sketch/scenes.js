window.CHUNKS = [[0.0, 0.4516], [0.0, 0.7347], [0.0, 0.5], [0.0, 0.4194], [0.0], [0.0, 0.75], [0.0, 0.3125, 0.7188], [0.0, 0.4706], [0.0, 0.3115, 0.5246], [0.0], [0.0], [0.0, 0.4815], [0.0, 0.5], [0.0], [0.0], [0.0, 0.3125], [0.0, 0.7593], [0.0, 0.2979, 0.5, 0.734], [0.0, 0.5417], [0.0, 0.6415], [0.0, 0.2872, 0.6489, 0.8723], [0.0, 0.5469], [0.0, 0.4306], [0.0, 0.15, 0.42, 0.58, 0.79], [0.0, 0.2581, 0.4839, 0.7823], [0.0], [0.0]];
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

// ── people: flat side-view figures facing left, real body proportions, joints that only bend the way real ones do ──
// Shared by every «اسكتش» episode (moved here from videos/choking after «العماص», so no episode copies an old version).
// JOINT RULES, enforced in fig(), whatever an episode passes:
//   · elbows: ik() always takes the anatomical solution (bend -1 for a left-facing figure): the elbow sits behind/below
//     the shoulder→hand line, the forearm folds toward the front. o.bend is ignored.
//   · knees: the shin's angle relative to the thigh is clamped to 0…-150°: the knee points forward, the foot folds back,
//     never a knee bent backwards.
//   · a figure lying on its back: lean -90 (head to the right, face up); legs [[90,0],[90,0]]; hands on the body
//     (e.g. rel(20, 6)), never in the air.
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
var SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128";
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {   // elbow for a two-bone arm reaching tg; bend +1 / -1 picks the side
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
// Proportions from real body measurements (Drillis & Contini segment lengths as fractions of the standing height H,
// side-view depths from adult anthropometry). H = 400 units at s = 1:
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.06H
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
// o: {x, y (hip joint), s, lean, shirt, hair, legs: [[thigh, shin], [thigh, shin]], hands: [[x,y] | rel(), …], bend: [±1, ±1], belly, mouth, tilt}
// returns {far, body, near}: draw far, then whatever goes between, then body, then near. at(h, side): a point h above the hip
// along the trunk and side units to the front (+) or back (−).
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {   // two tapered segments: ink outlines first, then fills, so the joint stays clean
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var kneeA = Math.max(-150, Math.min(0, legs[i][1])), a = dirv(legs[i][0]), b = dirv(legs[i][0] + kneeA), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]];   // the foot points to the front, square to the shank
    var toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1] + b[1] * 0 + 0], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    if (o.kneel) shoe = "";
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  // trunk outline: front then back, measured depths (chest 0.13H, waist 0.115H, seat 0.14H)
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  if (o.belly) fr = [[-6, 18], [14, 34], [34, 46], [56, 40], [76, 30], [92, 28], [110, 22], [120, 10]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var belt = atF(10, 0), tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  // head: 0.115H deep, 0.13H tall, face to the front; nose, ear, hair at the back and top
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.mouth ? '<ellipse cx="' + f(-rx * .82) + '" cy="' + f(ry * .48) + '" rx="' + f(rx * .13) + '" ry="' + f(ry * .08 + ry * .08 * o.mouth) + '" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// ── «ليه بنصحى بعماص؟» — drawings. Shapes follow real anatomy references (refs/SOURCES.md): the eye from the front
// (almond opening, iris, the pink caruncle at the inner corner, the two puncta on the lid margins near it), the tear
// film as three layers on the cornea (mucin, water, lipid), the meibomian glands as vertical rows of grape-like lobes
// in the lid opening at the margin, and the tear drain (puncta → canaliculi → lacrimal sac → nasolacrimal duct → nose).
// People use the shared fig() in videos/_templates/sketch/_helpers.js (real proportions, joints that bend the right way).

var CRUST = "#e2cf8f", CRUST_D = "#c9b06a", SCLERA = "#f4f0e6", IRIS = "#7a6440", TEARC = "#9fc0d2", OILC = "#e3b64f", MUCC = "#a9ad78", CORNEA = "#e8d6c2";

// ── the eye from the front: the person's left eye, outer corner on the left, inner corner (nose side) on the right ──
// o: {open 0..1, crust 0..1, wet 0..1, green, red 0..1, dots: [[x,y,col,r]], puncta 0..1 (highlight), tearLine, lashes, t}
function bz(p0, p1, p2, p3, k) { var m = 1 - k; return [m * m * m * p0[0] + 3 * m * m * k * p1[0] + 3 * m * k * k * p2[0] + k * k * k * p3[0], m * m * m * p0[1] + 3 * m * m * k * p1[1] + 3 * m * k * k * p2[1] + k * k * k * p3[1]]; }
var EO = [-220, 0], EI = [214, 20];
function lids(open) {
  var u1 = [-110, lerp(52, -168, open)], u2 = [118, lerp(60, -160, open)], l1 = [-100, 92], l2 = [128, 84];
  return { up: [EO, u1, u2, EI], lo: [EO, l1, l2, EI] };
}
function bzd(c) { return "M" + f(c[0][0]) + " " + f(c[0][1]) + " C" + f(c[1][0]) + " " + f(c[1][1]) + " " + f(c[2][0]) + " " + f(c[2][1]) + " " + f(c[3][0]) + " " + f(c[3][1]); }
function upAt(open, k) { var L = lids(open).up; return bz(L[0], L[1], L[2], L[3], k); }
function loAt(k) { var L = lids(1).lo; return bz(L[0], L[1], L[2], L[3], k); }
function crustBlob(x, y, k, o) {
  k = clamp(k); if (k <= 0) return ""; o = o || {}; var s = "", col = o.green ? "#c4c25a" : o.wet ? "#ebe3c3" : CRUST, n = 7;
  for (var i = 0; i < n; i++) { var a = i * 2.4, r = (8 + 9 * hash(i + 3)) * k * (o.big || 1), d = 14 * k * (o.big || 1) * hash(i + 11);
    s += '<ellipse cx="' + f(x + Math.cos(a) * d) + '" cy="' + f(y + Math.sin(a) * d * .7) + '" rx="' + f(r * 1.25) + '" ry="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  for (i = 0; i < 9; i++) s += '<circle cx="' + f(x + (hash(i + 30) - .5) * 30 * k * (o.big || 1)) + '" cy="' + f(y + (hash(i + 50) - .5) * 20 * k * (o.big || 1)) + '" r="1.6" fill="' + (o.green ? "#7b7a2a" : CRUST_D) + '"/>';
  if (o.wet) s += '<ellipse cx="' + f(x - 6 * k) + '" cy="' + f(y - 6 * k) + '" rx="' + f(6 * k) + '" ry="' + f(3 * k) + '" fill="#fff" opacity=".8"/>';
  return s;
}
function eyeFront(o) {
  o = o || {}; var open = o.open == null ? 1 : o.open, L = lids(open), t = o.t || 0, s = "", id = "ey" + (++CLIPN), i;
  // skin, brow, the lid crease, the side of the nose
  s += R(-520, -420, 1100, 900, SKIN, 0) + '<path d="M-520 -420 H580 V480 H-520 Z" fill="url(#hatch)" opacity=".12"/>';
  s += '<path d="M-250 -250 C-150 -300 80 -305 230 -232" stroke="' + HAIR + '" stroke-width="34" fill="none" stroke-linecap="round"/>';
  for (i = 0; i < 22; i++) { var bp = bz([-250, -250], [-150, -300], [80, -305], [230, -232], i / 21); s += '<path d="M' + f(bp[0]) + ' ' + f(bp[1] + 12) + ' l' + f(10 + 6 * hash(i)) + ' -22" stroke="#2a2016" stroke-width="2" opacity=".6"/>'; }
  var cr = lerp(-40, -210, open); s += '<path d="M-200 ' + f(cr * .35 - 10) + ' C-110 ' + f(cr - 10) + ' 110 ' + f(cr - 6) + ' 200 ' + f(cr * .3 - 4) + '" stroke="' + SKIN2 + '" stroke-width="3" fill="none"/>';
  s += '<path d="M330 -200 C318 -80 330 60 360 200 C376 260 420 300 470 310" stroke="' + SKIN2 + '" stroke-width="4" fill="none"/><path d="M340 -150 C334 -40 346 80 380 200" stroke="' + SKIN2 + '" stroke-width="22" fill="none" opacity=".25"/>';
  s += '<path d="M-200 110 C-100 170 100 168 200 104" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none" opacity=".7"/>';
  // the opening: white, iris, pupil, caruncle, tear meniscus, all clipped to the lids
  var hole = bzd(L.up) + " C" + f(L.lo[2][0]) + " " + f(L.lo[2][1]) + " " + f(L.lo[1][0]) + " " + f(L.lo[1][1]) + " " + f(EO[0]) + " " + f(EO[1]) + " Z";
  if (open > .02) {
    var red = o.red || 0, inner = R(-260, -220, 520, 360, red ? "#efc8bd" : SCLERA, 0);
    if (red) for (i = 0; i < 12; i++) { var vy = -40 + hash(i) * 110, vx = i % 2 ? -200 : 200; inner += '<path d="M' + vx + ' ' + f(vy) + ' q' + f((i % 2 ? 50 : -50)) + ' ' + f(-20 + 40 * hash(i + 7)) + ' ' + f(i % 2 ? 100 : -100) + ' ' + f(-10 + 20 * hash(i + 4)) + '" stroke="#c24a3a" stroke-width="' + f(1.4 + red * 1.6) + '" fill="none" opacity="' + f(red) + '"/>'; }
    var ix = 4 + (o.look || 0), iy = -22;
    inner += C(ix, iy, 96, IRIS, 2.4);
    for (i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2; inner += '<path d="M' + f(ix + Math.cos(a) * 42) + ' ' + f(iy + Math.sin(a) * 42) + ' L' + f(ix + Math.cos(a) * 90) + ' ' + f(iy + Math.sin(a) * 90) + '" stroke="#5a4930" stroke-width="2"/>'; }
    inner += C(ix, iy, 96, "none", 5) + C(ix, iy, 40, INK, 0) + '<ellipse cx="' + f(ix - 26) + '" cy="' + f(iy - 30) + '" rx="16" ry="11" fill="#fff" opacity=".9"/>';
    inner += '<ellipse cx="200" cy="22" rx="30" ry="26" fill="#d98f86" stroke="' + INK + '" stroke-width="1.6"/><path d="M178 6 q18 6 34 -2" stroke="#b8665e" stroke-width="1.5" fill="none"/>';
    if (o.tearLine) inner += '<path d="' + bzd([[-210, 2], [-100, 82], [128, 74], [210, 18]]) + '" stroke="' + BLUE + '" stroke-width="' + f(4 + 3 * o.tearLine) + '" fill="none" opacity="' + f(.4 + .5 * o.tearLine) + '"/>';
    (o.dots || []).forEach(function (d) { inner += '<circle cx="' + f(d[0]) + '" cy="' + f(d[1]) + '" r="' + f(d[3] || 4) + '" fill="' + (d[2] || "#8a7a5a") + '" stroke="' + INK + '" stroke-width="1"/>'; });
    s += '<clipPath id="' + id + '"><path d="' + hole + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>';
  }
  // lid margins: upper thick with lashes, lower thin with short lashes; puncta near the inner corner
  s += '<path d="' + bzd(L.lo) + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  for (i = 2; i < 18; i++) { var lp = loAt(i / 22); s += '<path d="M' + f(lp[0]) + ' ' + f(lp[1] + 2) + ' l' + f(-4 - (1 - i / 22) * 6) + ' ' + f(12 + 6 * hash(i)) + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'; }
  s += '<path d="' + bzd(L.up) + '" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
  for (i = 1; i < 26; i++) { var k = i / 28, up = upAt(open, k), len = 28 + 14 * Math.sin(k * Math.PI), dir = lerp(-1.1, -.2, k), down = 1 - open;
    var ex = up[0] + Math.cos(-Math.PI / 2 + dir * .55 - .4) * len, ey = up[1] + lerp(-len * .9, len * .8, down);
    s += '<path d="M' + f(up[0]) + ' ' + f(up[1]) + ' Q' + f(up[0] - 10) + ' ' + f((up[1] + ey) / 2) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
  var pu = upAt(open, .9), pl = loAt(.9), ph = o.puncta || 0;
  s += C(pu[0], pu[1] + 3, 4.5, INK, 0) + C(pl[0], pl[1] - 2, 4.5, INK, 0);
  if (ph) s += G("", C(pu[0], pu[1] + 3, 14, "none", 3).replace(INK, ORANGE) + C(pl[0], pl[1] - 2, 14, "none", 3).replace(INK, ORANGE), ph);
  // the crust in the inner corner (and along the lashes when it's a lot)
  if (o.crust) { s += crustBlob(206, 30, o.crust, o); if (o.lashCrust) for (i = 0; i < 6; i++) { var cp = upAt(open, .3 + i * .1); s += crustBlob(cp[0], cp[1] + 4, o.crust * .45, o); } }
  if (o.lidGlue) for (i = 0; i < 5; i++) { var gp = loAt(.2 + i * .14); s += crustBlob(gp[0], gp[1] - 6, .5, o); }
  return s;
}

// ── the tear film, magnified: cornea cells at the bottom, mucin, water, oil, air on top. 640 wide, y0 = top of oil ──
function film(t, o) {
  o = o || {}; var s = "", y0 = 230, i;
  var wv = function (y, a, ph) { var d = "M-60 " + f(y + a * Math.sin(ph)); for (var x = -40; x <= 700; x += 20) d += " L" + x + " " + f(y + a * Math.sin(x * .02 + ph)); return d; };
  s += '<path d="' + wv(y0 + 330, 3, t) + ' L700 900 L-60 900 Z" fill="' + CORNEA + '" stroke="' + INK + '" stroke-width="2.4"/>';
  for (i = 0; i < 9; i++) s += R(-40 + i * 84, y0 + 352, 78, 42, "#ead9c5", 1.6, 10) + R(-20 + i * 84 + 30, y0 + 404, 78, 42, "#e2cdb6", 1.6, 10) + C(i * 84 + 2, y0 + 373, 7, "#b99a7c", 1.2);
  s += G("", '<path d="' + wv(y0 + 290, 7, t * 1.3) + ' L700 ' + (y0 + 336) + ' L-60 ' + (y0 + 336) + ' Z" fill="' + MUCC + '" stroke="' + INK + '" stroke-width="1.8"/>', o.k3 == null ? 1 : o.k3);
  s += G("", '<path d="' + wv(y0 + 40, 6, t * 1.7 + 1) + ' L700 ' + (y0 + 290) + ' L-60 ' + (y0 + 290) + ' Z" fill="' + TEARC + '" stroke="' + INK + '" stroke-width="1.8"/>', o.k2 == null ? 1 : o.k2);
  if ((o.k2 == null ? 1 : o.k2) > 0) for (i = 0; i < 8; i++) s += '<path d="M' + f(((i * 97 + t * 50) % 760) - 60) + ' ' + f(y0 + 90 + (i % 4) * 46) + ' q14 -6 28 0" stroke="#e8f0f2" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="' + f(o.k2 == null ? 1 : o.k2) + '"/>';
  s += G("", '<path d="' + wv(y0, 5, t * 2) + ' L700 ' + (y0 + 40) + ' L-60 ' + (y0 + 40) + ' Z" fill="' + OILC + '" stroke="' + INK + '" stroke-width="1.8"/>', o.k1 == null ? 1 : o.k1);
  (o.junk || []).forEach(function (j) { s += j; });
  return s;
}
function dust(x, y, r, i) { return '<path d="M' + f(x - r) + ' ' + f(y) + ' L' + f(x - r * .3) + ' ' + f(y - r * .9) + ' L' + f(x + r) + ' ' + f(y - r * .4) + ' L' + f(x + r * .6) + ' ' + f(y + r * .8) + ' L' + f(x - r * .5) + ' ' + f(y + r * .7) + ' Z" fill="#8a7458" stroke="' + INK + '" stroke-width="1.4" transform="rotate(' + f(hash(i) * 90) + ' ' + f(x) + ' ' + f(y) + ')"/>'; }
function cell(x, y, r, i) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(hash(i + 5) * 60 - 30) + ")", '<path d="M' + f(-r * 1.4) + ' 0 Q' + f(-r) + ' ' + f(-r * .7) + ' 0 ' + f(-r * .6) + ' Q' + f(r * 1.2) + ' ' + f(-r * .5) + ' ' + f(r * 1.4) + ' 0 Q' + f(r) + ' ' + f(r * .7) + ' 0 ' + f(r * .6) + ' Q' + f(-r) + ' ' + f(r * .6) + ' ' + f(-r * 1.4) + ' 0 Z" fill="#e9dcc4" stroke="' + INK + '" stroke-width="1.4"/>' + C(0, 0, r * .25, "#b9a58a", 1)); }

// ── the eyelid margin seen from behind (everted): rows of meibomian glands opening at the margin ──
function glands(t, k, oil) {
  var s = R(-40, 120, 720, 520, "#e8b4a4", 2.4, 30) + '<rect x="-40" y="120" width="720" height="520" fill="url(#hatch)" opacity=".15"/>', i, j;
  for (i = 0; i < 9; i++) { var x = 30 + i * 72, h = 300 + 60 * Math.sin(i * .5 + .4), top = 600 - h;
    var g = '<path d="M' + x + ' 600 V' + f(top) + '" stroke="' + CRUST_D + '" stroke-width="10" stroke-linecap="round"/>';
    for (j = 0; j < 9; j++) { var gy = top + 20 + j * (h - 40) / 9; g += C(x - 14, gy, 12, OILC, 1.4) + C(x + 14, gy + 14, 12, OILC, 1.4); }
    s += appear(at(k, i * .07, .3), g);
  }
  s += R(-40, 600, 720, 40, "#d78f7b", 2.4) + '<path d="M-40 640 H680" stroke="' + INK + '" stroke-width="3"/>';
  for (i = 0; i < 26; i++) s += '<path d="M' + f(-30 + i * 28) + ' 640 q-6 40 6 70" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  for (i = 0; i < 9; i++) { var ox = 30 + i * 72, b = clamp(oil) * (.7 + .3 * Math.sin(t * 3 + i)); s += C(ox, 604, 5, INK, 0); if (b > .05) s += '<ellipse cx="' + ox + '" cy="' + f(612 + 10 * b) + '" rx="' + f(10 * b) + '" ry="' + f(12 * b) + '" fill="' + OILC + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  return s;
}

// ── the tear drain on a face crop: eye, puncta, canaliculi, lacrimal sac, duct down to the nose ──
function drain(t, k, o) {
  o = o || {}; var s = G("translate(200 300) scale(.62)", eyeFront({ open: 1 - blinkK(t, 1.4, .25), t: t, puncta: o.punc ? o.punc * (.7 + .3 * Math.sin(t * 6)) : 0, tearLine: o.tear, look: 10 * Math.sin(t * 1.5) }));
  s += '<path d="M420 120 C440 250 450 420 470 560 C480 640 520 690 600 700" stroke="' + SKIN2 + '" stroke-width="4" fill="none"/>';   // side of the nose
  s += '<path d="M470 640 C430 690 470 740 540 735 C600 740 640 700 620 660" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="530" cy="712" rx="26" ry="11" fill="#5a3a2c"/>';
  var up = [200 + 214 * .62 - 6, 300 + 20 * .62 - 16], lo = [200 + 214 * .62 - 8, 300 + 20 * .62 + 14];
  var path = "M" + f(up[0]) + " " + f(up[1]) + " L346 288 L376 300 M" + f(lo[0]) + " " + f(lo[1]) + " L346 324 L376 312";
  s += draw(path, k, BLUE, 7) + G("", R(368, 248, 40, 90, "#b9d0dc", 2.2, 18), clamp(k * 2 - .4));
  s += draw("M388 338 C392 420 400 520 452 640", clamp(k * 1.6 - .5), BLUE, 12);
  var fl = clamp(k * 1.6 - .5); if (fl > .3) s += '<path d="M' + f(up[0]) + ' ' + f(up[1]) + ' L346 288 L376 300 L388 338 C392 420 400 520 452 640" fill="none" stroke="#e8f0f2" stroke-width="4" stroke-dasharray="4 18" stroke-dashoffset="' + f(-t * 60 * (o.flow || 1)) + '" stroke-linecap="round"/>';
  if (o.drip) for (var i = 0; i < 3; i++) { var p = (t * .9 + i / 3) % 1; s += '<path d="M530 ' + f(728 + p * 70) + ' q-8 12 0 18 q8 -6 0 -18 Z" fill="' + TEARC + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(1 - p) + '"/>'; }
  return s;
}
function drop(x, y, sc, col) { return '<path d="M' + f(x) + ' ' + f(y - 22 * sc) + ' C' + f(x + 16 * sc) + ' ' + f(y) + ' ' + f(x + 14 * sc) + ' ' + f(y + 16 * sc) + ' ' + f(x) + ' ' + f(y + 16 * sc) + ' C' + f(x - 14 * sc) + ' ' + f(y + 16 * sc) + ' ' + f(x - 16 * sc) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - 22 * sc) + ' Z" fill="' + (col || TEARC) + '" stroke="' + INK + '" stroke-width="2"/>'; }

// ── a sleeper in bed: real proportions, lying on the back, head on the pillow (head to the right) ──
function bed(t, o) {
  o = o || {}; var s = "", y = o.y || 520, bx = o.x || 80;
  s += R(bx - 20, y + 30, 560, 60, "#a9784d", 2.4) + R(bx - 40, y - 120, 30, 260, "#7c5434", 2.4, 6) + R(bx + 540, y - 60, 30, 200, "#7c5434", 2.4, 6);
  s += R(bx - 10, y - 4, 550, 38, "#efe6d2", 2.2, 8) + '<ellipse cx="' + (bx + 470) + '" cy="' + (y - 10) + '" rx="74" ry="26" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/>';
  var br = Math.sin(t * 1.6) * 2, p = fig({ x: bx + 300, y: y - 30 + br * .2, lean: -90, s: .95, shirt: o.shirt || SHIRT_V, hair: o.hair, legs: [[90, 0], [92, 0]], hands: [rel(20, 6), rel(22, 4)], tilt: 0 });
  s += p.far + p.body + p.near;
  s += '<path d="M' + (bx) + ' ' + (y - 6) + ' C' + (bx + 80) + ' ' + f(y - 66 + br) + ' ' + (bx + 300) + ' ' + f(y - 70 + br) + ' ' + (bx + 380) + ' ' + f(y - 42 + br) + ' L' + (bx + 392) + ' ' + (y + 20) + ' L' + bx + ' ' + (y + 20) + ' Z" fill="#8fa38a" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i < 6; i++) s += '<path d="M' + (bx + 30 + i * 60) + ' ' + f(y - 40 + br) + ' l20 50" stroke="#6f8468" stroke-width="2"/>';
  bed.head = p.hd;
  return s;
}
function zzz(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var p = (t * .5 + i / 3) % 1; s += G("", T("z", x + p * 50 + i * 4, y - p * 90, 22 + p * 22, MUTE, 800), Math.sin(p * Math.PI)); } return s; }
function moonIcon(x, y, r) { return '<path d="M' + f(x + r * .3) + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 1 0 ' + f(x + r) + ' ' + f(y + r * .3) + ' A' + f(r * .78) + ' ' + f(r * .78) + ' 0 0 1 ' + f(x + r * .3) + ' ' + f(y - r) + ' Z" fill="#e9dfb8" stroke="' + INK + '" stroke-width="2.2"/>'; }
function sunIcon(x, y, r, t) { var s = ""; for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2 + t * .4; s += '<path d="M' + f(x + Math.cos(a) * r * 1.25) + ' ' + f(y + Math.sin(a) * r * 1.25) + ' L' + f(x + Math.cos(a) * r * 1.6) + ' ' + f(y + Math.sin(a) * r * 1.6) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>'; } return s + C(x, y, r, "#e9b44c", 2.4); }
function blinkK(t, per, dur) { var p = (t % per) / dur; return p < 1 ? Math.sin(p * Math.PI) : 0; }
function stopwatch(x, y, r, k) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = R(x - 14, y - r - 26, 28, 18, INK, 0, 3) + C(x, y, r, "#f4ecdb", 3) + C(x, y, r - 10, "none", 1.2);
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r + 12) + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 ' + ((k % 1) > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
}
function gauge(x, y, lvl, k) {   // a tear "tap" level bar: lvl 0..1
  var h = 220; return G("", R(x - 30, y - h, 60, h, "#f4ecdb", 2.4, 8) + R(x - 30, y - h * lvl, 60, h * lvl, TEARC, 0, 8) + R(x - 30, y - h, 60, h, "none", 2.4, 8) + drop(x, y - h - 40, 1.2), k);
}
// the face at 0,0 is eyeFront space; a group helper for the big eye on the panel
function EYE(o, x, y, sc) { return G("translate(" + (x || 320) + " " + (y || 400) + ") scale(" + (sc || 1.2) + ")", eyeFront(o)); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · what is it made of? the crust in the corner, a magnifier ring and a question mark
shot(4, push(470, 420, 1.0, 1.35), function (u, d, t) {
  return paper() + EYE({ open: .55 + .05 * Math.sin(t * 2), crust: 1, t: t }, 300, 400, 1.25) + G("", C(560, 432, 70, "none", 6) + '<path d="M610 482 L670 560" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/>', at(u, .2, .3)) + G("", T("؟", 560, 330 + 6 * Math.sin(t * 4), 70, ORANGE, 900), at(u, .4, .3));
});
// 5 · the eye is always covered by a thin film of tears: side cut of the front of the eye, a blue film over the cornea
shot(5, push(300, 400, 1.05, 0.95), function (u, d, t) {
  var k = at(u, .3, 1.2), s = paper();
  s += C(430, 400, 250, SCLERA, 2.6) + '<path d="M232 252 C140 300 140 500 232 548" fill="#eef3f2" stroke="' + INK + '" stroke-width="2.6"/>' + '<path d="M240 300 C215 360 215 440 240 500" stroke="' + IRIS + '" stroke-width="18" fill="none"/>' + C(470, 400, 60, "#e6d8c6", 1.6);
  s += P("M60 120 C150 100 240 160 250 250 C210 262 160 250 140 230 C110 200 80 180 40 180 Z", SKIN, 2.4) + P("M60 680 C150 700 240 640 250 552 C210 540 160 552 140 572 C110 600 80 620 40 620 Z", SKIN, 2.4);
  s += draw("M232 252 C140 300 140 500 232 548", k, BLUE, 7 + 2 * Math.sin(t * 3));
  return s + label(162, 400, 70, 320, "طبقة دموع", BLUE, at(u, 1, .5), 26) + label(560, 480, 560, 620, "العين", OLIVE, at(u, 1.4, .5), 24) + G("", '<path d="M150 420 q-30 30 -60 20" stroke="' + BLUE + '" stroke-width="3" fill="none"/>', 0);
}, { tr: "in" });
// 6 · three layers: water, mucus that holds it on the eye, oil that stops it drying
shot(6, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + film(t, { k2: at(u, .2, .4), k3: at(u, d * .35, .4), k1: at(u, d * .65, .4) });
  return s + T("هوا", 320, 180, 26, MUTE, 700) + label(560, 400, 500, 120, "مية", BLUE, at(u, .4, .5), 28) + label(150, 520, 120, 690, "مخاط", OLIVE, at(u, d * .4, .5), 28) + label(420, 232, 470, 140, "زيت", ORANGE, at(u, d * .7, .5), 28) + label(250, 600, 300, 720, "سطح العين", INK, at(u, .2, .5), 22);
}, { tr: "in" });
// 7 · the oil comes from tens of tiny glands in the edge of the lid
shot(7, push(320, 520, 1.1, 0.96), function (u, d, t) {
  return paper() + glands(t, at(u, .1, 1.4), at(u, 1.6, .8)) + label(102, 360, 140, 70, "غدد الزيت", ORANGE, at(u, .9, .5), 28) + label(102, 620, 60, 740, "طرف الجفن", OLIVE, at(u, 1.6, .5), 24);
}, { tr: "fade" });
// 8 · dust, dead cells and whatever got in collect on the film
shot(8, push(320, 400, 1.05, 0.98), function (u, d, t) {
  var j = [], i; for (i = 0; i < 9; i++) { var k = at(u, .1 + i * .18, 1.1), x = 40 + hash(i + 20) * 560, y = lerp(-60, 250 + hash(i + 8) * 30, ease(k)) + 4 * Math.sin(t * 3 + i);
    j.push(i % 3 === 1 ? cell(x, y, 22, i) : dust(x, y, 10 + hash(i) * 8, i)); }
  return paper() + film(t, { junk: j }) + tag("تراب", 160, 110, at(u, .5, .3), 30, ORANGE) + tag("خلايا ميتة", 450, 110, at(u, 1.4, .3), 30, ORANGE);
});
// 9 · why don't we see it in the day? the sun, a clean open eye
shot(9, push(320, 420, 1.06, 0.98), function (u, d, t) {
  return paper() + EYE({ open: 1 - blinkK(t, 2.6, .25), t: t, look: 10 * Math.sin(t * 1.3) }, 320, 440, 1.15) + sunIcon(540, 130, 48, t) + G("", T("؟", 560, 560 + 6 * Math.sin(t * 4), 80, ORANGE, 900), at(u, .4, .3));
}, { tr: "fade" });
// 10 · you blink about 15 times a minute
shot(10, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var n = Math.min(15, Math.floor(u / Math.max(.6, d - .5) * 15) + 1);
  return paper() + EYE({ open: 1 - blinkK(u, .62, .22), t: t }, 320, 330, .95) + stopwatch(150, 610, 70, u / 4) + numBox(String(n), 420, 590, at(u, .1, .3), 80) + tag("مرة في الدقيقة", 420, 700, at(u, .3, .3), 24);
});
// 11 · each blink wipes the eye like a windscreen wiper and pushes the waste to the corner by the nose
shot(11, push(380, 420, 1.0, 1.1), function (u, d, t) {
  var cyc = (u % 2.2) / 2.2, op = cyc < .5 ? 1 - ease(cyc * 2) : ease((cyc - .5) * 2), push_ = clamp(u / (d - .5)), dots = [];
  for (var i = 0; i < 10; i++) { var x0 = -170 + hash(i + 2) * 300; dots.push([lerp(x0, 196, ease(clamp(push_ * 1.3 - hash(i) * .3))), lerp(-60 + hash(i + 9) * 110, 34, ease(clamp(push_ * 1.3 - hash(i) * .3))), "#8a7458", 4 + 3 * hash(i)]); }
  return paper() + EYE({ open: op, t: t, dots: dots, crust: .2 + .3 * push_ }, 320, 430, 1.1) + arrow(120, 560, 520, 500, ORANGE, 6, at(u, .6, .6)) +
    iconBox(130, 130, 170, '<path d="M-70 40 L-60 -30 Q0 -50 60 -30 L70 40 Z" fill="#cfe0e6" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M0 46 L' + f(70 * Math.cos(Math.PI + Math.PI * (.5 + .45 * Math.sin(t * 3)))) + ' ' + f(46 + 70 * Math.sin(Math.PI + Math.PI * (.5 + .45 * Math.sin(t * 3)))) + '" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>', at(u, .3, .3)) +
    label(560, 470, 560, 640, "الركن", OLIVE, at(u, 1.2, .5), 26);
});
// 12 · a tiny hole in each lid drinks the tears and drains them down to the nose
shot(12, push(330, 460, 1.02, 0.96), function (u, d, t) {
  return paper() + R(-300, -300, 1300, 1400, SKIN, 0) + drain(t, at(u, .8, 1.6), { punc: at(u, .2, .4) }) + label(330, 302, 470, 200, "فتحة صغيرة", ORANGE, at(u, .4, .5), 26) + label(440, 560, 560, 470, "للأنف", BLUE, at(u, 2.2, .5), 26);
}, { tr: "out" });
// 13 · that's why your nose runs when you cry
shot(13, push(340, 480, 1.0, 1.06), function (u, d, t) {
  var s = paper() + R(-300, -300, 1300, 1400, SKIN, 0) + drain(t, 1, { tear: 1, flow: 2.4, drip: 1 });
  for (var i = 0; i < 2; i++) { var p = (t * .7 + i * .5) % 1; s += drop(250 + i * 60, 360 + p * 220, .9); }
  return s + tag("بتسيل", 520, 560, at(u, .4, .3), 34, BLUE);
});
// 14 · and when you sleep? a sleeper in bed at night
shot(14, push(440, 470, 0.95, 1.2), function (u, d, t) {
  return paper() + R(60, 80, 160, 190, "#3d4a5e", 2.4) + '<path d="M140 80 V270 M60 175 H220" stroke="' + INK + '" stroke-width="3"/>' + moonIcon(110, 130, 24) + bed(t, { y: 560 }) + zzz(560, 380, t);
}, { tr: "fade" });
// 15 · no blinking at all, and the eye makes fewer tears
shot(15, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var lv = lerp(.85, .3, at(u, 1.2, 1.4));
  return paper() + EYE({ open: 0, t: t }, 320, 400, 1.0) + G("", numBox("0", 150, 190, 1, 64) + T("رمشة", 150, 280, 26, INK, 700), at(u, .1, .3)) + cross(150, 190, 1.1, at(u, .6, .4)) + gauge(520, 720, lv, at(u, 1, .3)) + arrow(600, 520, 600, 660, BLUE, 5, at(u, 1.3, .4));
}, { tr: "in" });
// 16 · mucus, oil and dust gather in the corner with nobody to wipe them
shot(16, push(340, 430, 1.0, 1.15), function (u, d, t) {
  var k = clamp(u / (d - .3)), dots = [], s = paper(), i;
  s += EYE({ open: 0, t: t, crust: .25 + .65 * k }, 290, 430, 1.2);
  for (i = 0; i < 12; i++) { var p = clamp(k * 1.4 - hash(i) * .4), x = lerp(-200 + hash(i + 3) * 280, 210, ease(p)), y = lerp(60 + hash(i + 6) * 40, 30, p);
    if (p < 1) s += G("translate(290 430) scale(1.2)", '<circle cx="' + f(x) + '" cy="' + f(y + 6 * Math.sin(t * 3 + i)) + '" r="' + f(4 + 3 * hash(i)) + '" fill="' + [OILC, MUCC, "#8a7458"][i % 3] + '" stroke="' + INK + '" stroke-width="1"/>'); }
  return s + label(545, 470, 430, 660, "بيتجمعوا هنا", ORANGE, at(u, 1.2, .5), 24) + stopwatch(110, 140, 60, u / 3);
});
// 17 · through the night the water dries and leaves the rest stuck, like a puddle drying and leaving its dirt
shot(17, push(320, 440, 1.12, 0.98), function (u, d, t) {
  var k = at(u, .4, d - 1), s = paper() + EYE({ open: 0, t: t, crust: 1.5, wet: k < .5 }, -10, 400, 1.6);
  for (var i = 0; i < 4; i++) { var p = (t * .6 + i / 4) % 1; s += G("", '<path d="M' + f(270 + i * 30) + ' ' + f(380 - p * 140) + ' q10 -14 0 -28 q-10 -14 0 -28" stroke="' + BLUE + '" stroke-width="4" fill="none"/>', Math.sin(p * Math.PI) * (1 - k * .7)); }
  var pk = at(u, d * .45, d * .5);
  s += iconBox(480, 620, 220, '<ellipse cx="0" cy="0" rx="' + f(80 - 50 * pk) + '" ry="' + f(36 - 22 * pk) + '" fill="' + TEARC + '" stroke="' + INK + '" stroke-width="2"/>' + '<ellipse cx="0" cy="0" rx="80" ry="36" fill="none" stroke="#8a7458" stroke-width="' + f(1 + 7 * pk) + '" stroke-dasharray="3 5"/>' + T("بقعة مية", 0, 84, 20, MUTE, 700), at(u, d * .4, .3));
  return s + tag("تنشف", 200, 160, at(u, .8, .3), 34, ORANGE);
});
// 18 · soft crust in the morning: the water hasn't dried yet
shot(18, push(320, 420, 1.0, 1.12), function (u, d, t) {
  return paper() + EYE({ open: .4 + .05 * Math.sin(t * 2), t: t, crust: 1, wet: 1 }, 260, 420, 1.2) + inset(470, 210, 120, G("scale(2.6) translate(-206 -30)", crustBlob(206, 30, 1, { wet: 1 })) + drop(40 + 4 * Math.sin(t * 3), -40, .8), at(u, .5, .4)) + tag("طري = لسه فيه مية", 320, 680, at(u, 1.2, .3), 28, BLUE);
}, { tr: "fade" });
// 19 · more with cold, allergy, or sleeping in contact lenses
shot(19, push(320, 430, 1.04, 0.98), function (u, d, t) {
  var s = paper() + EYE({ open: .7, t: t, crust: .6 + .4 * at(u, .3, 2.6), red: .15 }, 320, 520, .95), b = [[130, "برد"], [320, "حساسية"], [510, "عدسات"]];
  var icons = [
    '<path d="M0 -40 V40 M-35 -20 L35 20 M-35 20 L35 -20" stroke="' + BLUE + '" stroke-width="6" stroke-linecap="round"/>',
    C(0, -4, 14, "#e9b44c", 2) + [0, 1, 2, 3, 4, 5].map(function (i) { var a = i * Math.PI / 3 + t; return C(Math.cos(a) * 26, -4 + Math.sin(a) * 26, 12, "#f4ecdb", 1.6); }).join("") + '<path d="M0 22 V48" stroke="' + OLIVE + '" stroke-width="4"/>',
    '<ellipse cx="0" cy="0" rx="40" ry="34" fill="#cfe0e6" opacity=".7" stroke="' + INK + '" stroke-width="2"/><path d="M-30 6 Q0 -22 30 6" stroke="#fff" stroke-width="3" fill="none"/>'];
  b.forEach(function (q, i) { s += iconBox(q[0], 170, 140, icons[i] + T(q[1], 0, 62, 20, INK, 800), at(u, .3 + i * d * .22, .3)); });
  return s + arrow(320, 290, 320, 360, ORANGE, 6, at(u, 1, .4));
});
// 20 · a lot of it, yellow or green, a red eye, lids stuck together → an infection, see a doctor
shot(20, push(320, 440, 1.0, 1.08), function (u, d, t) {
  return paper() + EYE({ open: .18, t: t, crust: 1.3, green: 1, red: at(u, .6, 1), lashCrust: 1, lidGlue: 1 }, 320, 450, 1.1) +
    label(560, 470, 470, 650, "أصفر / أخضر", ORANGE, at(u, .3, .5), 24) + label(200, 470, 150, 650, "لازقة", ORANGE, at(u, 2.4, .5), 24) +
    tag("التهاب", 220, 130, at(u, d * .55, .3), 38, ORANGE) + iconBox(510, 140, 160, '<path d="M-30 -50 V-10 Q-30 20 0 20 Q30 20 30 -10 V-50" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M0 20 V40 Q0 60 26 56" stroke="' + INK + '" stroke-width="5" fill="none"/>' + C(30, 54, 12, GREY, 2.4) + T("دكتور", 0, 74, 18, INK, 800), at(u, d * .7, .3));
}, { tr: "fade" });
// 21 · the myth: tears pouring while asleep — crossed out
shot(21, push(320, 430, 1.04, 0.98), function (u, d, t) {
  var s = paper() + EYE({ open: 0, t: t }, 320, 400, 1.1);
  for (var i = 0; i < 3; i++) { var p = (t * .8 + i / 3) % 1; s += drop(470 - i * 30, 460 + p * 260, 1.1); }
  return s + tag("بنعيط؟", 320, 140, at(u, .3, .3), 40, BLUE) + cross(320, 430, 2.2, at(u, d * .8, .4));
}, { tr: "fade" });
// 22 · the opposite: fewer tears while you sleep; the crust is the eye's waste that never got wiped
shot(22, push(320, 430, 1.0, 1.06), function (u, d, t) {
  return paper() + EYE({ open: 0, t: t, crust: 1 }, 400, 360, .8) + gauge(140, 640, lerp(.8, .25, at(u, .2, 1.2)), 1) + arrow(230, 440, 230, 560, BLUE, 6, at(u, .4, .4)) + T("دموع", 140, 690, 26, BLUE, 800) + label(565, 384, 470, 600, "فضلات", ORANGE, at(u, d * .5, .5), 28) + check(560, 220, 1.2, at(u, d * .6, .4));
}, { tr: "fade" });
// 23 · «يعني من الآخر»: four tiles, numbered
shot(23, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var tiles = [[170, 230, function () { return film(t, {}); }], [470, 230, function () { return G("translate(320 400)", eyeFront({ open: 1 - blinkK(t, 1.2, .3), t: t })); }],
               [170, 560, function () { return G("translate(320 400)", eyeFront({ open: 0, t: t })) + moonIcon(560, 160, 60); }], [470, 560, function () { return G("translate(320 400)", eyeFront({ open: .5, t: t, crust: 1 })); }]], s = paper();
  tiles.forEach(function (q, i) { var k = at(u, i * d * .22, .4); s += G("translate(" + q[0] + " " + q[1] + ") scale(" + f(.42 * pop(k)) + ") translate(-320 -400)", '<clipPath id="tl' + i + '"><rect x="0" y="80" width="640" height="640"/></clipPath><g clip-path="url(#tl' + i + ')">' + R(0, 80, 640, 640, PAPER, 0) + q[2]() + '</g>' + R(0, 80, 640, 640, "none", 5)) + callout(String(i + 1), q[0] - 120, q[1] - 120, k); });
  return s;
}, { tr: "out" });
// 24 · the Sandman: a man sprinkling sand into a sleeping child's eyes
shot(24, push(330, 440, 1.0, 1.08), function (u, d, t) {
  var s = paper() + R(-200, 60, 1100, 330, "#3d4a5e", 0) + moonIcon(520, 150, 34);
  for (var i = 0; i < 18; i++) s += C(hash(i) * 640, 80 + hash(i + 40) * 280, 2, "#e9dfb8", 0);
  s += floor(690, -200, 900) + bed(t, { y: 600, x: 40, shirt: "#c9a35e", hair: "#5a4636" });
  var hd = bed.head, hand = [hd[0] - 20, hd[1] - 150 + 6 * Math.sin(t * 3)];
  var m = fig({ x: 560, y: 478, lean: 18, s: 1, shirt: "#5e653a", hair: "#9a9488", hands: [hand, rel(64, 30)], legs: [[12, -6], [-6, -2]] });
  s += m.far + m.body + m.near + '<path d="M' + f(m.at(60, 30)[0] - 26) + ' ' + f(m.at(60, 30)[1]) + ' q-10 60 26 66 q40 -4 30 -66 Z" fill="#c69a6c" stroke="' + INK + '" stroke-width="2.2"/>';
  for (i = 0; i < 14; i++) { var p = (t * .7 + i / 14) % 1; s += C(hand[0] - 10 + (hash(i) - .5) * 30 * p, hand[1] + 14 + p * (hd[1] - hand[1] - 14), 2.6, "#e2c27a", 0); }
  return s + tag("رجل الرمل", 200, 140, at(u, .4, .3), 32, ORANGE) + inset(130, 470, 90, G("scale(1.9) translate(-200 -30)", R(100, -60, 200, 160, SKIN, 0) + '<path d="' + bzd(lids(0).up) + '" stroke="' + INK + '" stroke-width="5" fill="none"/>' + crustBlob(206, 30, 1)), at(u, d * .65, .4));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: an eye opening in the morning. line 1: the crust in the corner, named. line 2: shut all night (moon)
  var s, l1 = LN[1];
  if (li === 0) { var k = clamp((t - LN[0].start) / 1.6); s = G("translate(304 360) scale(1.05)", eyeFront({ open: .1 + .5 * ease(k) - .1 * blinkK(t, 1.4, .3), t: t, crust: 1 })) + sunIcon(520, 90, 40, t); }
  else if (li === 1) { var u = t - l1.start; s = G("translate(304 360) scale(1.05)", eyeFront({ open: .6, t: t, crust: 1 })) + inset(440, 160, 100, G("scale(2.4) translate(-206 -30)", R(80, -80, 300, 200, SKIN, 0) + crustBlob(206, 30, 1)), ease(u / .4)) + label(520, 395, 330, 600, "العماص", ORANGE, ease((u - .5) / .5), 30); }
  else { var v = t - LN[2].start; s = G("translate(304 380) scale(1.05)", eyeFront({ open: 0, t: t })) + moonIcon(100, 110, 40) + zzz(470, 180, t) + iconBox(510, 110, 130, stopwatch(0, 6, 44, v / 2), ease(v / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 110) scale(.33)", '<clipPath id="bmc"><circle r="230"/></clipPath><g clip-path="url(#bmc)">' + eyeFront({ open: 1 - blinkK(t, 1.1, .25), t: t, crust: .8, look: 14 * Math.sin(t * 1.7) }) + '</g>');
};
SCENE.outro = function (svg, u, t) {
  return G("translate(300 150) scale(.5)", '<clipPath id="ouc"><rect x="-560" y="-260" width="1120" height="520" rx="20"/></clipPath><g clip-path="url(#ouc)">' + eyeFront({ open: .8 - .8 * blinkK(t, 2.4, .25), t: t, crust: 1, tearLine: 1 }) + '</g>') +
    callout("1", 250, 92, ease(u / .3)) + callout("2", 230, 205, ease(u / .3 - .5)) + callout("3", 395, 120, ease(u / .3 - 1)) + callout("4", 440, 185, ease(u / .3 - 1.5));
};
