window.CHUNKS = [[0.0, 0.5], [0.0, 0.4595], [0.0], [0.0, 0.5185], [0.0, 0.5227], [0.0, 0.0947, 0.3474, 0.6632], [0.0, 0.43, 0.7], [0.0, 0.2727], [0.0, 0.5147], [0.0, 0.5593], [0.0, 0.4545], [0.0, 0.3418, 0.7342], [0.0, 0.4651, 0.7791], [0.0, 0.2113, 0.6338], [0.0, 0.3594], [0.0, 0.3846], [0.0, 0.2048, 0.6024], [0.0, 0.6984], [0.0, 0.3261, 0.6848], [0.0, 0.5714], [0.0, 0.3014, 0.6849], [0.0, 0.3077, 0.6026], [0.0, 0.1932, 0.3636, 0.5227, 0.7727], [0.0, 0.3171, 0.7195], [0.0], [0.0], [0.0, 0.5]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the camera never parks (a slow push / pan per shot plus a small drift added here);
   - a thing appears grey and faint first, then takes its colour (appear); the part being talked about takes the accent
     colour, often swept along its length (sweep), while the rest dims (dim). */
var LN = window.TIMING.lines;
// English episodes (CFG "lang": "en" in episode.py) are built left-to-right with Noto Sans; Arabic stays the default
var LTR = document.documentElement.dir === "ltr", FONT = LTR ? "Noto Sans" : "Noto Sans Arabic";
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
function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px ' + FONT + ';fill:' + (col || INK) + '">' + text + '</text>'; }
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
  if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, (left !== LTR) ? "start" : "end") + '</g>';   // RTL: "start" is the right-hand end
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

// ── «ليه قلب الست بيدق أسرع؟» / "Why does a woman's heart beat faster?" — drawings, shared by the Arabic episode
// (videos/heart) and the American English one (videos/heart-us, built with CFG "shots": "../../heart/sketch/shots.js").
// The heart is the real anterior view (Gray's Anatomy / Wikimedia references in refs/SOURCES.md): the apex points down
// to the body's left (viewer's right), the aortic arch with its three branches, the pulmonary trunk in front of it, the
// superior vena cava on the right atrium, the coronary arteries in their grooves. Cut views show the four chambers.
// People come from the shared person kit (videos/_templates/people/person.js): the woman uses its "woman" outfit.

var TX = LTR ? {
  her: "Her", him: "Him", girl: "Girl", boy: "Boy", before: "Before puberty", after: "After puberty", rule: "The rule", perMin: "liters every minute",
  liters: "5 L", perBeat: "per beat", cup: "cup", bucket: "bucket", pacer: "Pacemaker", nerves: "nerves", extra: "extra beats a minute",
  bpm: "BPM", period: "period", ovul: "ovulation", sleepPulse: "sleeping pulse", progest: "progesterone", empties: "empties more",
  stress: "stress?", normal: "normal", perDay: "extra beats a day", perYear: "extra beats a year", smaller: "smaller heart", smallBeat: "smaller beat", faster: "faster beat", day: "day"
} : {
  her: "هي", him: "هو", girl: "بنت", boy: "ولد", before: "قبل البلوغ", after: "بعد البلوغ", rule: "القاعدة", perMin: "لتر كل دقيقة",
  liters: "5 لتر", perBeat: "كل دقة", cup: "كوباية", bucket: "جردل", pacer: "منظّم ضربات القلب", nerves: "أعصاب", extra: "دقات زيادة في الدقيقة",
  bpm: "نبضة/د", period: "الدورة", ovul: "التبويض", sleepPulse: "النبض وإنتي نايمة", progest: "بروجستيرون", empties: "بتفضّي أكتر",
  stress: "قلق؟", normal: "طبيعي", perDay: "دقة زيادة في اليوم", perYear: "دقة زيادة في السنة", smaller: "قلب أصغر", smallBeat: "دقة أصغر", faster: "دقة أسرع", day: "يوم"
};

// ── colours of the heart (muted, like the reference's body drawings) ──
var MUS = "#c4705a", MUS_D = "#a2533f", MUS_L = "#d68f78", VEIN = "#7891a6", VEIN_D = "#5d758a", BLOOD = "#a8402f", FAT = "#e2c98f", CHAMB = "#efd6c4";
var HER_BPM = 84, HIM_BPM = 66;   // drawn tempo (a little exaggerated so the difference shows)
// squeeze 0..1 at time t for a heart beating at bpm: a quick contraction, a slower release
function beat(t, bpm) { var p = (t * bpm / 60) % 1; return p < 0.12 ? ease(p / 0.12) : p < 0.4 ? 1 - ease((p - 0.12) / 0.28) : 0; }
function tube(d, w, col) { return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w + 4.4) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>'; }
var HEART_D = "M-40 -45 C-80 -55 -105 -25 -98 15 C-92 55 -60 95 -10 130 C20 152 50 168 72 178 C90 160 105 120 106 70 C108 20 92 -20 60 -38 C35 -50 0 -42 -40 -45 Z";
// great vessels behind the heart: superior vena cava, aortic arch with its three branches, pulmonary trunk in front
function vessels() {
  return tube("M-60 -40 L-62 -160", 30, VEIN) + tube("M5 -128 L-2 -182", 12, MUS) + tube("M32 -146 L32 -196", 12, MUS) + tube("M62 -142 L72 -190", 12, MUS) +
    tube("M-8 -30 C-14 -95 -6 -140 34 -146 C78 -150 100 -118 98 -70 L98 -10", 30, MUS) +
    tube("M28 -20 C30 -55 34 -78 44 -92", 28, VEIN) + tube("M44 -92 C20 -104 -4 -104 -30 -100", 18, VEIN) + tube("M44 -92 C66 -104 92 -100 118 -96", 18, VEIN);
}
// the heart from the front. sq: squeeze 0..1 (it shrinks a little and the muscle darkens)
function heartFront(cx, cy, s, sq, op) {
  op = op || {}; sq = sq || 0; var k = 1 - 0.06 * sq, g = "";
  g += vessels();
  // auricles (atrial appendages)
  g += '<path d="M-92 -20 C-110 -40 -92 -62 -66 -52 C-60 -40 -70 -26 -92 -20 Z" fill="' + MUS_L + '" stroke="' + INK + '" stroke-width="2"/>';
  g += '<path d="M92 -32 C112 -40 118 -16 104 -2 C96 -8 88 -18 92 -32 Z" fill="' + MUS_L + '" stroke="' + INK + '" stroke-width="2"/>';
  // the body: ventricles and the right atrium
  g += '<path d="' + HEART_D + '" fill="' + (sq > .5 ? MUS_D : MUS) + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  g += '<path d="M60 -30 C92 -10 104 40 100 90 C96 130 84 158 72 172 C80 120 82 60 60 -30 Z" fill="url(#hatch)"/>';
  // fat and coronary arteries in the grooves: the anterior interventricular groove and the right coronary
  g += '<path d="M34 -36 C28 30 44 110 70 172" fill="none" stroke="' + FAT + '" stroke-width="9" stroke-linecap="round"/><path d="M34 -36 C28 30 44 110 70 172" fill="none" stroke="' + BLOOD + '" stroke-width="3" stroke-linecap="round"/>';
  g += '<path d="M-58 -30 C-80 20 -60 90 -8 126" fill="none" stroke="' + FAT + '" stroke-width="8" stroke-linecap="round"/><path d="M-58 -30 C-80 20 -60 90 -8 126" fill="none" stroke="' + BLOOD + '" stroke-width="2.6" stroke-linecap="round"/>';
  g += '<path d="M40 30 C55 40 70 42 86 38 M44 80 C30 92 14 96 -2 94" fill="none" stroke="' + BLOOD + '" stroke-width="1.8"/>';
  // the pacemaker (sinoatrial node) at the top of the right atrium, where the vena cava joins
  if (op.node) { var nk = op.node; g += '<circle cx="-64" cy="-38" r="' + f(6 + 16 * nk) + '" fill="' + ORANGE + '" opacity="' + f(0.35 * (1 - nk) + .05) + '"/><circle cx="-64" cy="-38" r="7" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + (s * k).toFixed(4) + ")", g);
}
// the heart cut open (four chambers). lv: how full the ventricles are 0..1
function heartCut(cx, cy, s, lv, sq) {
  sq = sq || 0; var k = 1 - 0.05 * sq, g = "", id = "hc" + (++CLIPN);
  g += vessels() + '<path d="' + HEART_D + '" fill="' + MUS + '" stroke="' + INK + '" stroke-width="2.6"/>';
  var RA = "M-82 -8 C-86 -40 -40 -44 -30 -14 C-28 10 -70 18 -82 -8 Z", LA = "M20 -26 C30 -46 82 -40 84 -14 C84 4 30 8 20 -26 Z",
      RV = "M-74 30 C-76 80 -44 110 -4 122 C-8 88 -4 52 -12 28 C-34 20 -60 20 -74 30 Z", LV = "M12 22 C6 70 30 118 64 158 C86 120 92 60 80 22 C60 12 30 12 12 22 Z";
  [RA, LA, RV, LV].forEach(function (d) { g += '<path d="' + d + '" fill="' + CHAMB + '" stroke="' + INK + '" stroke-width="1.8"/>'; });
  // blood in the ventricles: a level falling as they empty (blue right side, red left side)
  var top = lerp(160, 16, clamp(lv));
  g += '<clipPath id="' + id + 'a"><path d="' + RV + '"/></clipPath><clipPath id="' + id + 'b"><path d="' + LV + '"/></clipPath>';
  g += '<g clip-path="url(#' + id + 'a)"><rect x="-90" y="' + f(top - 6) + '" width="100" height="200" fill="' + VEIN + '"/></g><g clip-path="url(#' + id + 'b)"><rect x="0" y="' + f(top) + '" width="100" height="200" fill="' + BLOOD + '"/></g>';
  g += '<path d="M-62 24 L-50 34 M-30 22 L-40 34 M28 18 L38 32 M70 18 L60 32" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';   // valve leaflets
  g += '<path d="M-6 14 C-2 60 4 100 0 126" stroke="' + MUS_D + '" stroke-width="3" fill="none"/>';   // septum shade
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + (s * k).toFixed(4) + ")", g);
}
// an ECG trace from x1 to x2 at baseline y, scrolling with t at bpm (wb = px per beat)
function ecg(x1, x2, y, t, bpm, col, amp, wb) {
  amp = amp || 40; wb = wb || 120; var d = "", speed = wb * bpm / 60;
  for (var x = x1; x <= x2; x += 2) {
    var p = (((x - x1 - t * speed) / wb) % 1 + 1) % 1, v = 0;
    if (p > .08 && p < .16) v = -.12 * Math.sin((p - .08) / .08 * Math.PI);
    else if (p > .22 && p < .25) v = .18 * (p - .22) / .03;
    else if (p >= .25 && p < .29) v = lerp(.18, -1, (p - .25) / .04);
    else if (p >= .29 && p < .33) v = lerp(-1, .3, (p - .29) / .04);
    else if (p >= .33 && p < .36) v = lerp(.3, 0, (p - .33) / .03);
    else if (p > .46 && p < .62) v = -.25 * Math.sin((p - .46) / .16 * Math.PI);
    d += (x === x1 ? "M" : " L") + f(x) + " " + f(y + v * amp);
  }
  return '<path d="' + d + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="3" stroke-linejoin="round"/>';
}
// a clawfoot bathtub from the side, water level k 0..1
function tub(cx, cy, w, k, t) {
  var h = w * .42, x0 = cx - w / 2, g = "", id = "tb" + (++CLIPN), body = "M" + f(x0) + " " + f(cy - h) + " L" + f(x0 + w) + " " + f(cy - h) + " C" + f(x0 + w) + " " + f(cy + h * .2) + " " + f(x0 + w * .86) + " " + f(cy) + " " + f(x0 + w * .72) + " " + f(cy) + " L" + f(x0 + w * .28) + " " + f(cy) + " C" + f(x0 + w * .14) + " " + f(cy) + " " + f(x0) + " " + f(cy + h * .2) + " " + f(x0) + " " + f(cy - h) + " Z";
  [.2, .8].forEach(function (u) { g += '<path d="M' + f(x0 + w * u - 8) + ' ' + f(cy - 4) + ' l-6 26 h20 l-2 -26 Z" fill="#b99a58" stroke="' + INK + '" stroke-width="1.8"/>'; });
  g += '<path d="' + body + '" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2.4"/>';
  var wy = lerp(cy - 6, cy - h + 10, clamp(k)), wv = "M" + f(x0 - 5) + " " + f(wy);
  for (var x = 0; x <= w + 10; x += 10) wv += " L" + f(x0 - 5 + x) + " " + f(wy + 2.5 * Math.sin(x * .09 + t * 5));
  g += '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + wv + ' L' + f(x0 + w + 5) + ' ' + f(cy + 40) + ' L' + f(x0 - 5) + ' ' + f(cy + 40) + ' Z" fill="#9fb7c3" stroke="' + INK + '" stroke-width="1.6"/></g>';
  return g + '<path d="M' + f(x0 - 6) + ' ' + f(cy - h) + ' H' + f(x0 + w + 6) + '" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M' + f(x0 - 6) + ' ' + f(cy - h) + ' H' + f(x0 + w + 6) + '" stroke="#f4f1ea" stroke-width="2.4" stroke-linecap="round"/>';
}
// a cup and a bucket (drawn around their rim centre), tilted by ang degrees, pouring when pour > 0
function cup(x, y, s, ang, pour) {
  var g = '<path d="M-22 0 L-17 44 H17 L22 0 Z" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2.2"/><path d="M21 10 C36 10 36 32 18 32" fill="none" stroke="' + INK + '" stroke-width="3"/>' + (pour ? '' : '<path d="M-20 6 H20" stroke="#9fb7c3" stroke-width="5"/>');
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + s + ")", g);
}
function bucket(x, y, s, ang) {
  var g = '<path d="M-40 0 L-32 62 H32 L40 0 Z" fill="#9aa3a6" stroke="' + INK + '" stroke-width="2.4"/><path d="M-36 20 H36 M-34 42 H34" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/><path d="M-40 0 C-40 -40 40 -40 40 0" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M-38 6 H38" stroke="#9fb7c3" stroke-width="7"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ") scale(" + s + ")", g);
}
function stream(x1, y1, x2, y2, w, t) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' Q' + f(x1 + (x2 - x1) * .2) + ' ' + f(y2 - (y2 - y1) * .3) + ' ' + f(x2) + ' ' + f(y2) + '" stroke="#7fa0b2" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-dasharray="14 4" stroke-dashoffset="' + f(-t * 120) + '"/>'; }
// a smartwatch face with a heart and the pulse
function watch(cx, cy, s, num, t, bpm) {
  var g = '<rect x="-34" y="-110" width="68" height="220" rx="16" fill="#b58a6a" stroke="' + INK + '" stroke-width="2.4"/>' + '<rect x="-62" y="-66" width="124" height="132" rx="26" fill="#2f2b28" stroke="' + INK + '" stroke-width="3"/><rect x="-52" y="-56" width="104" height="112" rx="18" fill="#1c1a19"/>' + '<rect x="62" y="-20" width="9" height="26" rx="3" fill="#4a4440" stroke="' + INK + '" stroke-width="1.6"/>';
  var b = beat(t, bpm || HER_BPM);
  g += G("translate(0 -22) scale(" + f(1 + .18 * b) + ")", '<path d="M0 12 C-22 -2 -18 -22 -8 -22 C-3 -22 0 -18 0 -14 C0 -18 3 -22 8 -22 C18 -22 22 -2 0 12 Z" fill="#e0594a"/>');
  g += '<text x="0" y="34" text-anchor="middle" style="font:800 38px Noto Serif;fill:#fff;direction:ltr">' + num + '</text><text x="0" y="50" text-anchor="middle" style="font:700 11px Noto Sans;fill:#aaa">BPM</text>';
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + s + ")", g);
}
// a bed seen from the side (head at the left), mattress top at y
function bedSide(x, y, w) { return R(x - 18, y - 120, 18, 190, "#a9784d", 2) + R(x, y, w, 34, "#e9e1cc", 2.2, 8) + R(x, y + 34, w, 18, "#a9784d", 2) + R(x + w - 14, y - 40, 14, 110, "#a9784d", 2) + '<path d="M' + f(x + 8) + ' ' + f(y - 2) + ' q20 -30 70 -24 q10 14 0 26 Z" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2"/>'; }
function tagBox(text, x, y, k, sz, col, fill) { return tag(text, x, y, k, sz, col); }
var WOMAN = "woman", MAN = { base: "casual", colors: { shirt: "#7f97a6", shirtD: "#61798a" } };
function breathe(t) { return .5 + .5 * Math.sin(t * 2.2); }

// ═════════ the panel shots ═════════
// 4 · the rule: the heart pumps the blood round and round
shot(4, push(320, 400, 1.04, .96), function (u, d, t) {
  var a = t * 1.6, s = "";
  for (var k = 0; k < 8; k++) { var q = a + k * Math.PI / 4; s += arrow(320 + 230 * Math.cos(q), 410 + 230 * Math.sin(q), 320 + 230 * Math.cos(q + .45), 410 + 230 * Math.sin(q + .45), k % 2 ? VEIN : BLOOD, 5, at(u, .2 + k * .06, .3)); }
  return paper() + s + heartFront(320, 430, .95, beat(t, 70)) + tag(TX.rule, 320, 110, at(u, .3, .3), 40, ORANGE);
});
// 5 · about five liters of blood every minute: a measuring jug fills, the clock hand goes round
shot(5, push(330, 400, .98, 1.05), function (u, d, t) {
  var k = at(u, .3, d - .5), jy = 560, lv = lerp(jy, jy - 250, k);
  var jug = '<path d="M380 ' + (jy - 290) + ' H560 L548 ' + jy + ' H392 Z" fill="#f4f1ea" opacity=".6" stroke="' + INK + '" stroke-width="2.4"/>';
  var fill = '<clipPath id="jg"><path d="M380 ' + (jy - 290) + ' H560 L548 ' + jy + ' H392 Z"/></clipPath><g clip-path="url(#jg)"><rect x="370" y="' + f(lv) + '" width="200" height="400" fill="' + BLOOD + '"/></g>';
  var ticks = ""; for (var q = 1; q <= 5; q++) ticks += '<path d="M392 ' + f(jy - q * 50) + ' h22" stroke="' + INK + '" stroke-width="2"/>' + N(q, 430, jy - q * 50 + 8, 20, INK, "start");
  var clk = '<circle cx="520" cy="150" r="58" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/><path d="M520 150 L' + f(520 + 46 * Math.sin(k * 6.283)) + ' ' + f(150 - 46 * Math.cos(k * 6.283)) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/><circle cx="520" cy="150" r="5" fill="' + INK + '"/>';
  return paper() + heartFront(180, 420, .78, beat(t, 70)) + tube("M260 330 C330 250 400 230 470 236", 14, BLOOD) + fill + jug + ticks + clk + bigNum("5", TX.perMin, 470, 680, at(u, .8, .4), ORANGE, 60);
}, { tr: "out" });
// 6 · until puberty a girl's and a boy's heart are about the same size
shot(6, push(320, 400, 1.0, 1.04), function (u, d, t) {
  return paper() + tag(TX.before, 320, 110, at(u, .1, .3), 34, BLUE) +
    appear(at(u, .2, .4), heartFront(180, 420, .72, beat(t, 80))) + appear(at(u, .5, .4), heartFront(470, 420, .72, beat(t + .3, 80))) +
    T(TX.girl, 180, 640, 34, ORANGE, 800) + T(TX.boy, 470, 640, 34, BLUE, 800) + measure(110, 690, 260, 690, at(u, 1, .5), "") + measure(400, 690, 550, 690, at(u, 1.2, .5), "") + '<g opacity="' + f(at(u, 1.6, .3)) + '">' + N("=", 325, 708, 60, INK) + '</g>';
});
// 7 · after puberty his heart grows about a quarter heavier: it swells, the balance tips
shot(7, push(320, 400, .98, 1.04), function (u, d, t) {
  var k = at(u, .3, 1.2), tilt = 9 * k, ca = Math.cos(tilt * Math.PI / 180), sa = Math.sin(tilt * Math.PI / 180);
  var L = [320 - 200 * ca, 470 - 200 * sa], Rr = [320 + 200 * ca, 470 + 200 * sa];
  var scale = '<path d="M320 470 L300 700 H340 Z" fill="' + KHAKI + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(250, 700, 140, 20, KHAKI, 2.4) +
    '<path d="M' + f(L[0]) + ' ' + f(L[1]) + ' L' + f(Rr[0]) + ' ' + f(Rr[1]) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' + C(320, 470, 9, INK, 0);
  [L, Rr].forEach(function (p) { scale += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(p[0] - 70) + ' ' + f(p[1] + 110) + ' M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(p[0] + 70) + ' ' + f(p[1] + 110) + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(p[0] - 86) + ' ' + f(p[1] + 110) + ' H' + f(p[0] + 86) + ' Q' + f(p[0]) + ' ' + f(p[1] + 150) + ' ' + f(p[0] - 86) + ' ' + f(p[1] + 110) + ' Z" fill="' + TAN + '" stroke="' + INK + '" stroke-width="2.2"/>'; });
  return paper() + tag(TX.after, 320, 100, at(u, .1, .3), 34, BLUE) + scale +
    heartFront(L[0], L[1] + 40, .38, beat(t, HER_BPM)) + heartFront(Rr[0], Rr[1] + 30, lerp(.38, .46, k), beat(t, HIM_BPM)) +
    T(TX.her, L[0], L[1] + 190, 30, ORANGE, 800) + T(TX.him, Rr[0], Rr[1] + 190, 30, BLUE, 800) + numBox("+25%", 470, 230, at(u, 1.3, .3), 44);
}, { tr: "in" });
// 8 · a smaller heart pushes out less blood with every squeeze
shot(8, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var bh = beat(t, HER_BPM), bm = beat(t, HIM_BPM);
  function spurt(x, y, b, r) { return b > .05 ? '<circle cx="' + f(x + 30 * b) + '" cy="' + f(y - 60 * b) + '" r="' + f(r * b) + '" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.6"/>' : ""; }
  return paper() + heartFront(170, 450, .62, bh) + heartFront(470, 440, .74, bm) + spurt(180, 300, bh, 16) + spurt(490, 270, bm, 26) +
    T(TX.her, 170, 640, 32, ORANGE, 800) + T(TX.him, 470, 660, 32, BLUE, 800) + label(205, 300, 260, 150, TX.perBeat, ORANGE, at(u, 1, .5), 26);
});
// 9 · like filling a bathtub with a cup instead of a bucket
shot(9, push(320, 420, 1.02, .96), function (u, d, t) {
  return paper() + tub(320, 560, 460, .25 + .1 * at(u, 0, d), t) + appear(at(u, .2, .4), cup(190, 250, 1.6, 10 * Math.sin(t * 3)) + T(TX.cup, 190, 360, 28, ORANGE, 800)) +
    appear(at(u, .9, .4), bucket(450, 230, 1.4, 6 * Math.sin(t * 1.5)) + T(TX.bucket, 450, 360, 28, BLUE, 800)) + cross(450, 230, 1.4, at(u, 1.6, .4));
}, { tr: "out" });
// 10 · the cup has to scoop faster to keep up: the cup flips fast, the bucket slowly
shot(10, push(320, 430, .98, 1.04), function (u, d, t) {
  var pc = (t * 2.4) % 1, ac = pc < .5 ? lerp(0, 120, ease(pc * 2)) : lerp(120, 0, ease((pc - .5) * 2)), pb = (t * .9) % 1, ab = pb < .5 ? lerp(0, 100, ease(pb * 2)) : lerp(100, 0, ease((pb - .5) * 2));
  return paper() + tub(320, 600, 520, .3 + .25 * at(u, 0, d), t) + cup(170, 300, 1.4, -ac, ac > 80) + (ac > 80 ? stream(150, 300, 200, 520, 6, t) : "") +
    bucket(470, 280, 1.2, ab, ab > 70) + (ab > 70 ? stream(500, 290, 450, 530, 16, t) : "") + T(TX.her, 170, 170, 32, ORANGE, 800) + T(TX.him, 470, 150, 32, BLUE, 800) +
    arrow(110, 210, 230, 210, ORANGE, 4, at(u, .4, .3)) + arrow(230, 230, 110, 230, ORANGE, 4, at(u, .6, .3));
});
// 11 · a tiny spark inside the heart: the pacemaker (sinoatrial node), with the beat spreading from it
shot(11, push(320, 400, 1.0, 1.1), function (u, d, t) {
  var p = (t * 70 / 60) % 1, ring = '<circle cx="' + f(320 - 64 * 1.5) + '' + '" cy="' + f(400 - 38 * 1.5) + '" r="' + f(10 + 120 * p) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f(1 - p) + '"/>';
  return paper() + heartFront(320, 400, 1.5, beat(t, 70), { node: 1 - p }) + ring + draw("M224 343 L170 680", at(u, .8, .4), INK, 2) + C(224, 343, 4, INK, 0) + tag(TX.pacer, 230, 712, at(u, 1.1, .3), 30, ORANGE);
}, { tr: "in" });
// 12 · her pacemaker runs a little faster even with the nerves taken away: the nerve is cut, both sparks keep firing
shot(12, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var ph = (t * HER_BPM / 60) % 1, pm = (t * HIM_BPM / 60) % 1, cutK = at(u, 1.2, .4);
  function nerve(x, y) { return '<path d="M' + f(x) + ' 120 C' + f(x + 30) + ' 180 ' + f(x - 30) + ' 230 ' + f(x) + ' ' + f(y) + '" stroke="#d9b55a" stroke-width="5" fill="none" stroke-dasharray="' + (cutK > .5 ? "70 22 400" : "none") + '"/>'; }
  return paper() + nerve(130, 330) + nerve(420, 320) + heartFront(190, 450, .72, beat(t, HER_BPM), { node: 1 - ph }) + heartFront(480, 450, .8, beat(t, HIM_BPM), { node: 1 - pm }) +
    label(150, 170, 240, 130, TX.nerves, "#9a7a2a", at(u, .3, .5), 24) + cross(130, 200, .8, cutK) + cross(420, 200, .8, cutK) +
    T(TX.her, 190, 660, 32, ORANGE, 800) + T(TX.him, 480, 680, 32, BLUE, 800);
});
// 13 · on average three to seven extra beats a minute: two ECG strips, hers busier
shot(13, push(320, 400, 1.0, 1.03), function (u, d, t) {
  return paper() + R(40, 180, 560, 150, "#f4ecdb", 2) + R(40, 380, 560, 150, "#f4ecdb", 2) + ecg(50, 590, 270, t, HER_BPM, ORANGE, 60, 110) + ecg(50, 590, 470, t, HIM_BPM, BLUE, 60, 110) +
    T(TX.her, 70, 215, 26, ORANGE, 800, LTR ? "start" : "end") + T(TX.him, 70, 415, 26, BLUE, 800, LTR ? "start" : "end") + bigNum("+3–7", TX.extra, 320, 660, at(u, .6, .4), ORANGE, 70);
}, { tr: "out" });
// 14 · check your smartwatch: she raises her wrist, the watch shows the pulse
shot(14, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .1, .6), p = PERSON.front({ x: 250, y: 600, s: 1.05, outfit: WOMAN, breath: breathe(t), head: { tilt: 6, turn: .2 }, face: { look: [.6, .3], mouth: "smile" },
    arms: [{ rel: [-26, 110], hand: "relaxed" }, { to: [lerp(330, 370, k), lerp(600, 470, k)], bend: -1, hand: "relaxed" }] });
  var w = p.joints.wr[1];
  return paper() + p.svg + (w ? '<rect x="' + f(w[0] - 12) + '" y="' + f(w[1] - 14) + '" width="22" height="24" rx="5" fill="#2f2b28" stroke="' + INK + '" stroke-width="1.6"/>' : "") +
    inset(480, 300, 120, watch(0, 0, .95, Math.round(lerp(60, 79, at(u, .6, 1.2))), t), at(u, .4, .3));
});
// 15 · the cycle moves the number too: a 28-day ring with today's dot going round
shot(15, push(320, 400, 1.02, .98), function (u, d, t) {
  var s = "", k;
  for (k = 0; k < 28; k++) { var a = -Math.PI / 2 + k / 28 * Math.PI * 2, x = 320 + 210 * Math.cos(a), y = 400 + 210 * Math.sin(a); s += C(x, y, 14, k < 5 ? "#c97a84" : k === 13 ? ORANGE : k > 13 ? "#e7c9a4" : "#f4ecdb", 2); }
  var dk = (u * 6) % 28, da = -Math.PI / 2 + dk / 28 * Math.PI * 2;
  return paper() + s + C(320 + 210 * Math.cos(da), 400 + 210 * Math.sin(da), 22, "none", 4) + label(320 + 210 * Math.cos(-Math.PI / 2 + 2 / 28 * 6.283), 400 + 210 * Math.sin(-Math.PI / 2 + 2 / 28 * 6.283), 560, 120, TX.period, "#a45a64", at(u, .4, .5), 24) +
    label(320 + 210 * Math.cos(-Math.PI / 2 + 13 / 28 * 6.283), 400 + 210 * Math.sin(-Math.PI / 2 + 13 / 28 * 6.283), 470, 700, TX.ovul, ORANGE, at(u, .9, .5), 24) + heartFront(320, 410, .55, beat(t, HER_BPM));
});
// 16 · after ovulation her sleeping pulse sits about three beats higher: a graph across the cycle, and her asleep
shot(16, push(320, 430, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, d * .6), g = '<path d="M80 640 H590 M80 640 V330" stroke="' + INK + '" stroke-width="2.4"/>', pts = "";
  for (var x = 0; x <= 500 * k; x += 6) { var day = x / 500 * 28, v = day < 14 ? 0 : day < 17 ? (day - 14) / 3 : 1; pts += (x ? " L" : "M") + f(90 + x) + " " + f(580 - v * 120 + 4 * Math.sin(x * .4)); }
  g += '<path d="' + pts + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linejoin="round"/>' + R(90, 640, 90, 14, "#c97a84", 0) + '<path d="M340 330 V640" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 6"/>';
  g += T(TX.period, 135, 690, 22, "#a45a64", 700) + T(TX.ovul, 340, 690, 22, ORANGE, 700) + T(TX.sleepPulse, 90, 320, 22, INK, 700, LTR ? "start" : "end");
  var bed = bedSide(140, 170, 330) + PERSON.side({ x: 300, y: 165, s: .55, rot: -90, outfit: WOMAN, breath: breathe(t), face: { eyes: 0 } }).svg + '<path d="M460 90 a26 26 0 1 0 22 40 a20 20 0 1 1 -22 -40 Z" fill="#e2c98f" stroke="' + INK + '" stroke-width="2"/>';
  return paper() + G("translate(0 30)", bed) + g + numBox("+3", 480, 400, at(u, d * .65, .3), 40);
});
// 17 · progesterone rises and warms the body a tiny bit: the hormone tag and a thermometer creeping up
shot(17, push(320, 400, 1.02, .97), function (u, d, t) {
  var k = at(u, .4, d - .6), th = '<rect x="410" y="150" width="44" height="380" rx="22" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2.6"/>' + C(432, 560, 42, BLOOD, 2.6) + '<rect x="422" y="' + f(lerp(400, 330, k)) + '" width="20" height="' + f(lerp(160, 230, k)) + '" fill="' + BLOOD + '"/>';
  for (var q = 0; q < 8; q++) th += '<path d="M456 ' + (190 + q * 40) + ' h20" stroke="' + INK + '" stroke-width="2"/>';
  var hex = ""; [[150, 300], [210, 335], [150, 370], [210, 405]].forEach(function (p, i) { var r = 32; var d2 = ""; for (var j = 0; j < 6; j++) { var a = j / 6 * 6.283 + .52; d2 += (j ? "L" : "M") + f(p[0] + r * Math.cos(a)) + " " + f(p[1] + r * Math.sin(a)); } hex += appear(at(u, .1 + i * .15, .3), '<path d="' + d2 + 'Z" fill="#e7c9a4" stroke="' + INK + '" stroke-width="2.4"/>'); });
  return paper() + hex + tag(TX.progest, 180, 530, at(u, .7, .3), 30, "#a45a64") + arrow(180, 240, 180, 160 - 10 * Math.sin(t * 4), ORANGE, 5, at(u, .9, .3)) + th + arrow(520, 420, 520, 320, ORANGE, 5, at(u, 1.2, .4));
});
// 18 · is her heart weaker? No: it empties a bigger share of its blood with every beat (cut-open hearts)
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var bh = beat(t, HER_BPM), bm = beat(t, HIM_BPM);
  return paper() + heartCut(180, 420, .82, 1 - .66 * bh, bh) + heartCut(480, 420, .9, 1 - .56 * bm, bm) + T(TX.her, 180, 640, 32, ORANGE, 800) + T(TX.him, 480, 660, 32, BLUE, 800) +
    label(220, 520, 300, 210, TX.empties, ORANGE, at(u, 1.4, .5), 26);
}, { tr: "in" });
// 19 · like a cup poured out to the last drop
shot(19, push(320, 400, 1.04, .98), function (u, d, t) {
  var k = at(u, .2, d * .7), drop = (t * 1.4) % 1;
  return paper() + tub(320, 640, 420, .5, t) + cup(300, 260, 2.2, -lerp(20, 150, k), k > .4) + (k > .4 && k < .95 ? stream(300, 260, 330, 560, 10 * (1 - k) + 3, t) : "") +
    (k >= .95 ? C(330, lerp(330, 560, drop), 8, "#7fa0b2", 1.6) : "") + check(500, 220, 1.3, at(u, d * .75, .4));
}, { tr: "out" });
// 20 · the myth: a fast pulse means anxiety or a tired heart. No.
shot(20, push(300, 400, 1.0, 1.06), function (u, d, t) {
  var p = PERSON.front({ x: 260, y: 640, s: 1.1, outfit: WOMAN, breath: breathe(t), head: { tilt: -4 }, face: { brows: "worried", mouth: "frown", look: [.4, -.2] },
    arms: [{ rel: [-26, 110], hand: "relaxed" }, { to: [282, 525], bend: 1, hand: "flat", rot: 170 }] });
  return paper() + p.svg + '<path d="M420 140 C380 140 370 210 420 214 L430 240 L446 212 C510 214 520 140 470 140 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + T(TX.stress, 446, 190, 30, INK, 800) + cross(450, 180, 1.4, at(u, d * .7, .4));
});
// 21 · normal for adults is 60 to 100 a minute: a ruler with the normal band, her and him both inside it
shot(21, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var x0 = 70, x1 = 570, X = function (v) { return x0 + (v - 40) / 80 * (x1 - x0); }, g = R(x0, 380, x1 - x0, 60, "#f4ecdb", 2.4);
  g += sweep(X(60), 380, X(100) - X(60), 60, at(u, .3, .8), "r", R(X(60), 380, X(100) - X(60), 60, "#b9c08a", 2.4));
  for (var v = 40; v <= 120; v += 10) g += '<path d="M' + f(X(v)) + ' 440 v16" stroke="' + INK + '" stroke-width="2"/>' + N(v, X(v), 486, 22, INK);
  g += '<path d="M' + f(X(79)) + ' 300 L' + f(X(79)) + ' 376" stroke="' + ORANGE + '" stroke-width="4"/>' + T(TX.her, X(79), 290, 26, ORANGE, 800) + '<path d="M' + f(X(74)) + ' 520 L' + f(X(74)) + ' 444" stroke="' + BLUE + '" stroke-width="4"/>' + T(TX.him, X(74), 556, 26, BLUE, 800);
  return paper() + g + tag(TX.normal, 320, 200, at(u, 1, .3), 36, OLIVE) + check(470, 190, 1.1, at(u, 1.4, .4));
});
// 22 · bottom line: smaller heart → smaller beat → faster beat
shot(22, push(320, 400, .98, 1.03), function (u, d, t) {
  return paper() + appear(at(u, .1, .4), heartFront(140, 300, .42, beat(t, HER_BPM)) + T(TX.smaller, 140, 450, 24, ORANGE, 800)) + arrow(220, 300, 270, 300, INK, 4, at(u, .6, .3)) +
    appear(at(u, .8, .4), cup(330, 260, 1.4, 0) + T(TX.smallBeat, 330, 450, 24, ORANGE, 800)) + arrow(400, 300, 450, 300, INK, 4, at(u, 1.3, .3)) +
    appear(at(u, 1.5, .4), ecg(460, 610, 300, t, HER_BPM, ORANGE, 40, 50) + T(TX.faster, 535, 450, 24, ORANGE, 800)) + tub(320, 680, 380, .4 + .3 * at(u, 0, d), t);
}, { tr: "out" });
// 23 · just five extra beats a minute add up to over seven thousand a day
shot(23, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .3, d - .8), clk = '<circle cx="320" cy="270" r="120" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>';
  for (var q = 0; q < 12; q++) clk += '<path d="M' + f(320 + 104 * Math.sin(q / 12 * 6.283)) + ' ' + f(270 - 104 * Math.cos(q / 12 * 6.283)) + ' L' + f(320 + 116 * Math.sin(q / 12 * 6.283)) + ' ' + f(270 - 116 * Math.cos(q / 12 * 6.283)) + '" stroke="' + INK + '" stroke-width="3"/>';
  clk += '<path d="M320 270 L' + f(320 + 90 * Math.sin(k * 12.566)) + ' ' + f(270 - 90 * Math.cos(k * 12.566)) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/><path d="M320 270 L' + f(320 + 60 * Math.sin(k * 6.283)) + ' ' + f(270 - 60 * Math.cos(k * 6.283)) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' + C(320, 270, 8, INK, 0);
  return paper() + clk + T("24h", 320, 430, 26, MUTE, 700) + bigNum("+" + count(7200, k), TX.perDay, 320, 580, 1, ORANGE, 80) + heartFront(540, 150, .3, beat(t, HER_BPM));
}, { tr: "in" });
// 24 · about two and a half million extra beats a year: a year of calendar pages
shot(24, push(320, 400, 1.04, .98), function (u, d, t) {
  var k = at(u, .3, d - .8), s = "";
  for (var m = 0; m < 12; m++) { var x = 90 + (m % 4) * 150, y = 140 + Math.floor(m / 4) * 120; s += appear(at(u, .1 + m * .08, .25), R(x - 55, y - 40, 110, 90, "#f4ecdb", 2) + R(x - 55, y - 40, 110, 20, m < 12 * k ? ORANGE : "#c97a84", 2) + check(x, y + 18, .5, m < 12 * k ? 1 : 0, OLIVE)); }
  return paper() + s + bigNum("+" + count(2628000, k), TX.perYear, 320, 600, 1, ORANGE, 74);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: her and him side by side, a heart beating on each chest, hers faster. line 1: stress and nerves crossed out.
  // line 2: their two hearts, hers smaller
  var u = t - LN[li].start, s = "";
  if (li < 2) {
    var w = PERSON.front({ x: 175, y: 600, s: 1.2, outfit: WOMAN, breath: breathe(t), face: { mouth: li ? "smile" : "neutral", look: [.3, 0] }, arms: [{ rel: [-26, 110], hand: "relaxed" }, { rel: [26, 110], hand: "relaxed" }] });
    var m = PERSON.front({ x: 435, y: 600, s: 1.28, outfit: MAN, breath: breathe(t + 1), face: { look: [-.3, 0] }, arms: [{ rel: [-26, 110], hand: "relaxed" }, { rel: [26, 110], hand: "relaxed" }] });
    s += w.svg + m.svg + heartFront(175 + 14, 600 - 108, .15, beat(t, HER_BPM)) + heartFront(435 + 15, 600 - 116, .16, beat(t, HIM_BPM));
    s += ecg(60, 290, 70, t, HER_BPM, ORANGE, 26, 50) + ecg(330, 560, 70, t, HIM_BPM, BLUE, 26, 50);
    if (li === 1) { s += G("translate(70 190)", '<path d="M0 -30 L-14 4 H4 L-8 36 L22 -6 H4 L14 -30 Z" fill="#e2c98f" stroke="' + INK + '" stroke-width="2.4"/>', ease(u / .3)) + cross(70, 190, .9, ease((u - .4) / .4)) +
      G("translate(305 200)", '<path d="M-30 0 C-20 -20 -10 20 0 0 C10 -20 20 20 30 0" stroke="#d9b55a" stroke-width="5" fill="none"/>', ease((u - .5) / .3)) + cross(305, 200, .9, ease((u - .9) / .4)); }
  } else {
    s += heartFront(180, 360, lerp(.5, .62, ease(u / .6)), beat(t, HER_BPM)) + heartFront(440, 350, .76, beat(t, HIM_BPM)) + T(TX.her, 180, 590, 34, ORANGE, 800) + T(TX.him, 440, 610, 34, BLUE, 800) +
      measure(110, 640, 255, 640, ease((u - .5) / .5), "") + measure(355, 660, 540, 660, ease((u - .7) / .5), "");
  }
  return s;
};
SCENE.bumper = function (u, t) { return heartFront(90, 120, .36, beat(t, HER_BPM)) + ecg(10, 170, 180, t, HER_BPM, ORANGE, 12, 40); };
SCENE.outro = function (svg, u, t) {
  return heartFront(170, 150, .42, beat(t, HER_BPM), { node: 1 - (t * HER_BPM / 60) % 1 }) + heartCut(420, 150, .42, 1 - .66 * beat(t, HER_BPM)) +
    callout("1", 90, 60, ease(u / .3)) + callout("2", 120, 120, ease(u / .3 - .5)) + callout("3", 450, 220, ease(u / .3 - 1)) + callout("4", 540, 90, ease(u / .3 - 1.5));
};
