window.CHUNKS = [[0.0, 0.5789], [0.0], [0.0, 0.6429], [0.0, 0.4194], [0.0, 0.2353, 0.7647], [0.0, 0.22, 0.58, 0.78], [0.0], [0.0], [0.0, 0.2892, 0.4578, 0.6627, 0.7831], [0.0, 0.2031, 0.3906, 0.7188], [0.0], [0.0, 0.2586, 0.569, 0.8103], [0.0, 0.4, 0.72], [0.0, 0.3611, 0.75], [0.0, 0.2162, 0.3514, 0.6892, 0.8243], [0.0, 0.2, 0.3579, 0.4842, 0.6737, 0.8211], [0.0], [0.0, 0.2308, 0.4872, 0.6795, 0.9231], [0.0, 0.25, 0.5938, 0.9531], [0.0, 0.1818, 0.4182, 0.5818], [0.0, 0.3585, 0.6792, 0.8113], [0.0, 0.1685, 0.3371, 0.4607, 0.7416], [0.0, 0.125, 0.4167, 0.5556, 0.8056], [0.0], [0.0, 0.6304]];
/* «إيه الحكاية؟» — «الرسم الهندسي» drawing helpers. build.py puts this file in front of the episode's shots.js, so every
   name here is in scope for the shots. The panel world is 640×786 (portrait, the panel's own aspect); a shot's camera
   [cx, cy, zoom] picks what is in view. Everything is redrawn every frame from t, so the render is deterministic.
   Rules from the reference (videos/_reference/tabizzay/STYLE.md):
   - no hard cuts: a shot crossfades into the next (tr: "fade"), or the camera flies into a detail ("in") or back out ("out");
   - the frame never shakes (user's rule after viewers complained): the camera holds still and moves only in eased ~1.8 s flies in or out (fly / still); motion comes from the drawing (pulses, flows, things appearing);
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
// fly(from, to, dur): the «طب إزاي؟» camera move, measured frame by frame in the bypass video: the frame holds dead still,
// then flies in one eased (slow-fast-slow) move of about 1.8 s to a new [cx, cy, zoom] (×1.2–2.4 in onto the part being
// talked about, or back out ×0.4–0.8), then holds still again. No drift, no wobble. from / to are [cx, cy, zoom].
function fly(a, b, dur) { dur = dur || 1.8; return function (u) { var k = ease(u / dur); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), a[2] * Math.pow(b[2] / a[2], k)]; }; }
function still(x, y, z) { return function () { return [x, y, z || 1]; }; }
var XF = 0.45;   // crossfade length (s)
window.SCENE = window.SCENE || {};
window.__t = 0;
window.SCENE.panel = function (A, B, t) {
  window.__t = t; CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0], cy = c[1], z = c[2] * extraZ;   // dead-still frame between moves, as measured in «طب إزاي؟» (the user's rule: no shake, it tired viewers' eyes). The life qa.py needs comes from the drawing itself
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

// ── «ليه الشراب بيخليك تنام أسرع؟» — shots. Drawings in draw.js (SK.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (eased, ~1.8 s) in onto the part being
// talked about and later back out. The life is in the drawing: heat squiggles rise, blood runs round the loop, he breathes.
var WIDE = [320, 393, 1], BEDV = [320, 345, 1.12], FEETV = [150, 420, 2.1], LOOPV = [300, 330, 1.9], SURF = [300, 300, 1.45];
// seq(keys): the camera holds still and flies (1.8 s, eased) to each [fraction of the shot, [cx, cy, z]] in turn
function seq(keys) { return function (u, d) { var c = keys[0][1]; for (var i = 1; i < keys.length; i++) { var a = keys[i][0] * d; if (u >= a) c = fly(c, keys[i][1], 1.8)(u - a); } return c; }; }
function seqAt(keys) { return function (u, d, t) { var c = keys[0][1]; for (var i = 1; i < keys.length; i++) { var a = keys[i][0] - (window.__shotA || 0); if (u >= a) c = fly(c, keys[i][1], 1.8)(u - a); } return c; }; }
function chunkT(l, j) { return LN[l].start + (LN[l].end - LN[l].start) * window.CHUNKS[l][j]; }
// 15: the camera rides from card to card as each number lands, then pulls back to all three
function seq15() { return function (u) { var s0 = LN[15].start, k = [[0, [320, 150, 1.5]], [chunkT(15, 2) - s0, [320, 370, 1.5]], [chunkT(15, 4) - s0, [320, 590, 1.5]], [LN[15].end - s0 - .6, [320, 393, 1]]], c = k[0][1]; for (var i = 1; i < k.length; i++) if (u >= k[i][0]) c = fly(c, k[i][1], 1.8)(u - k[i][0]); return c; }; }
// 21: in on the thermometer (1), over to the feet (2), back out for the sock (3)
function seq21() { return function (u) { var s0 = LN[21].start, k = [[0, BEDV], [chunkT(21, 1) - s0, [300, 250, 1.5]], [chunkT(21, 3) - s0, [170, 430, 1.6]], [chunkT(21, 4) - s0 + .6, BEDV]], c = k[0][1]; for (var i = 1; i < k.length; i++) if (u >= k[i][0]) c = fly(c, k[i][1], 1.8)(u - k[i][0]); return c; }; }
var BX = 50, BT = 470, BW = 540, HX = 300;   // the bed scene: bed left edge, mattress top, width; the sleeper's hip
function zzz(x, y, t, sz) { sz = sz || 30; var s = ""; for (var i = 0; i < 3; i++) { var p = (t * .45 + i / 3) % 1; s += G("", N("z", x + p * 40 + i * 4, y - p * 90, sz * (.6 + .5 * p), BLUE), Math.sin(p * Math.PI)); } return s; }
function chip(txt, x, y, col, k, sz) { k = pop(k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .95) + '" width="' + f(w) + '" height="' + f(sz * 1.85) + '" rx="8" fill="' + col + '"/>' + T(txt, 0, sz * .4, sz, "#fbf8f1", 800)); }
function room(t, o) {   // the bedroom at night: floor line, a window with the moon, a wall thermometer (o.cold)
  o = o || {}; var s = '<path d="M-400 566 H1040" stroke="' + INK + '" stroke-width="2.4"/>' + hatch("M-400 566 H1040 V1200 H-400 Z");
  s += R(400, 110, 170, 150, "#33405a", 2.4) + SK.moonIcon(470, 160, 26) + '<path d="M485 110 V260 M400 185 H570" stroke="' + INK + '" stroke-width="3"/>';
  for (var i = 0; i < 4; i++) s += C(420 + i * 37 + 10 * Math.sin(i * 7), 228 - (i % 2) * 16, 1.8, "#fbf8f1", 0);
  if (o.cold) s += SK.thermo(130, 110, 150, .25 + .03 * Math.sin(t * 1.3), BLUE) + G("", N("17°", 175, 205, 30, BLUE, "start"), o.cold);
  return s;
}
function bedScene(t, o) { o = o || {}; var b = SK.bed(BX, BT, BW, 1), sl = SK.sleeper(HX, BT, 1, o); return { svg: b.svg + sl.svg + (o.eyes > .2 ? '' : zzz(sl.head[0] + 10, sl.head[1] - 40, t + 1, 40)) + (o.socks !== false ? SK.heat(sl.foot[0] - 6, sl.foot[1] - 34, 44, 4, .9, 1.1) : ''), sl: sl }; }
var FT = [300, 420, 1.0];   // the big foot: ankle point and scale
function bigFoot(o) { return SK.foot(FT[0], FT[1], FT[2], o); }
var SKX = 40, SKY = 300, SKW = 520;
function skinB(o) { return SK.skin(SKX, SKY, SKW, o); }

// 4 · «قبل ما نشرح… قاعدة صغيرة… خليك فاكرها» — him standing, his core warm
shot(4, still(320, 420, 1), function (u, d, t) { return paper() + appear(at(u, 0, .6), SK.standing(320, 440, 1.2, { core: at(u, .4, 1) }).svg); });
shot([4, 1], still(320, 420, 1), function (u, d, t) { return paper() + SK.standing(320, 440, 1.2, { core: 1 }).svg + tag("قاعدة", 320, 150, at(u, .1, .3), 30, ORANGE); });
// 5 · to sleep, the core temperature must drop about a degree — the thermometer drops, «−1°»
shot(5, still(320, 420, 1), function (u, d, t) { return paper() + SK.standing(260, 440, 1.2, { core: 1, eyes: .7, tired: true }).svg + label(260, 380, 430, 300, "من جوه", ORANGE, at(u, .6, .5), 22); });
shot([5, 2], fly([320, 420, 1], [420, 430, 1.35], 1.8), function (u, d, t) {
  var k = at(u, .1, 1.6); return paper() + SK.standing(260, 440, 1.2, { core: 1 - .55 * k, eyes: .55, tired: true }).svg + SK.thermo(500, 220, 260, .78 - .22 * k, k > .5 ? BLUE : ORANGE) + arrow(560, 300, 560, 420, BLUE, 5, at(u, .3, .8)) +
    numBox("−1°", 500, 620, at(u, LN[5].end - LN[5].start > 3 ? 1.0 : .7, .3), 34);
});
// 6 · so where does that heat go? — a big question mark over the warm trunk
shot(6, still(320, 420, 1), function (u, d, t) { return paper() + SK.standing(320, 440, 1.2, { core: .8 }).svg + G("rotate(" + f(10 * Math.sin(t * 2.4)) + " 480 200)", T("؟", 480, 250, 140, ORANGE, 800), at(u, .3, .3)); });
// 7 · out through your hands and feet
shot(7, seq([[0, [320, 420, 1]], [.25, [300, 560, 1.5]], [.75, [320, 420, 1]]]), function (u, d, t) {
  var l = LN[7], h = at(u, .1, .5), fe = at(u, (l.end - l.start) * .45, .5);
  return paper() + SK.standing(320, 440, 1.2, { core: .6, hands: h, feet: fe }).svg + label(222, 480, 120, 380, "إيديك", OLIVE, at(u, .2, .5), 24) + label(290, 676, 140, 720, "رجليك", OLIVE, at(u, (l.end - l.start) * .5, .5), 24);
});
// 8 · special vessels in them: once they open, the warm blood passes right under the skin and leaves its heat outside
shot(8, still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: 0 }); return paper() + appear(at(u, 0, .5), sb.svg) + label(sb.cx - 70, sb.e1 + 90, 120, 150, "أوعية مخصوص", OLIVE, at(u, .5, .5), 24) + label(560, sb.d1 + 40, 600, 700, "تحت الجلد", INK, at(u, .9, .5), 18); }, { tr: "in" });
shot([8, 1], still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: at(u, .1, 1.2) }); return paper() + sb.svg + tag("تتفتح", 320, 140, at(u, .2, .3), 28, ORANGE); });
shot([8, 2], fly(WIDE, LOOPV, 1.8), function (u, d, t) { return paper() + skinB({ open: 1 }).svg; });
shot([8, 3], still(LOOPV[0], LOOPV[1], LOOPV[2]), function (u, d, t) { var sb = skinB({ open: 1 }); return paper() + sb.svg + label(sb.cx - 30, sb.loop[1], 160, 260, "جنب الجلد", ORANGE, at(u, .1, .5), 14); });
shot([8, 4], fly(LOOPV, SURF, 1.8), function (u, d, t) { var sb = skinB({ open: 1 }); return paper() + sb.svg + G("", T("برّه", 320, 160, 30, ORANGE, 800), at(u, .6, .3)); });
// 9 · like a car's radiator: it takes the engine's heat and puts it into the air
shot(9, still(320, 400, 1), function (u, d, t) { return paper() + appear(at(u, 0, .5), SK.car(330, 420, 1.05, { air: false })) + label(527, 360, 470, 220, "الردياتير", OLIVE, at(u, .4, .5), 24); });
shot([9, 2], still(320, 400, 1), function (u, d, t) {
  return paper() + SK.car(330, 420, 1.05, {}) + label(527, 360, 470, 220, "الردياتير", OLIVE, 1, 24) + label(150, 330, 80, 230, "الموتور", ORANGE, at(u, .1, .5), 24);
});
shot([9, 3], still(320, 400, 1), function (u, d, t) {
  return paper() + SK.car(330, 420, 1.05, {}) + label(527, 360, 470, 220, "الردياتير", OLIVE, 1, 24) + label(150, 330, 80, 230, "الموتور", ORANGE, 1, 24) +
    chip("= جسمك", 150, 640, ORANGE, at(u, .3, .3), 22) + chip("= رجليك", 510, 640, OLIVE, at(u, .7, .3), 22);
});
// 10 · so what has the sock got to do with it? — the bare foot, the sock beside it, a question mark
shot(10, still(380, 360, 1), function (u, d, t) { return paper() + bigFoot({}) + G("translate(510 190) rotate(-20) scale(.32)", SK.foot(0, 0, 1, { sock: 1 }), at(u, .1, .4)) + G("rotate(" + f(10 * Math.sin(t * 2.4)) + " 160 180)", T("؟", 160, 230, 130, ORANGE, 800), at(u, .4, .3)); });
// 11 · if your foot is cold, those vessels close… and the heat stays locked inside
shot(11, still(380, 360, 1), function (u, d, t) { return paper() + bigFoot({ tint: "cold", vessels: 1 - at(u, .2, 1) }) + SK.cold(420, 470, 110, at(u, .2, .5)) + tag("ساقعة", 160, 200, at(u, .3, .3), 28, BLUE); });
shot([11, 1], still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: 1 - at(u, .1, 1.1) }); return paper() + sb.svg + tag("بتقفل", 320, 140, at(u, .6, .3), 28, ORANGE); });
shot([11, 2], still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: 0, trap: at(u, .1, .8) }); return paper() + sb.svg + label(140, sb.art[1] + 26, 250, 720, "محبوسة جوه", ORANGE, at(u, .4, .5), 24) + cross(320, 210, .8, at(u, .9, .4)); });
// 12 · the sock warms your foot, so the vessels open… and the heat gets out
shot(12, still(380, 360, 1), function (u, d, t) { var k = at(u, .1, 1.6); return paper() + bigFoot({ tint: k > .6 ? "warm" : "cold", sock: k }) + SK.cold(420, 470, 110, 1 - k); });
shot([12, 1], still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: at(u, .1, 1.2) }); return paper() + sb.svg + tag("تتفتح", 320, 140, at(u, .3, .3), 28, ORANGE); });
shot([12, 2], still(380, 360, 1), function (u, d, t) { return paper() + bigFoot({ tint: "warm", sock: 1 }) + SK.heat(420, 400, 300, 7, at(u, .1, .5), 1.3) + check(560, 150, 1, at(u, .5, .4), OLIVE); });
// 13 · then your body gets the message: time to sleep
shot(13, still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: true, eyes: .6 - .6 * at(u, .2, 1.2) }); return paper() + room(t) + bs.svg + SK.heat(bs.sl.foot[0] - 10, bs.sl.foot[1] - 30, 30, 3, 1, .7); });
shot([13, 2], still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: true }); return paper() + room(t) + bs.svg + zzz(bs.sl.head[0] + 10, bs.sl.head[1] - 40, t, 34) + chip("يلا ننام", 320, 620, BLUE, at(u, .1, .3), 26); });
// 14 · a small study in Korea: young men slept in a cold room, once with socks and once without
shot(14, still(320, 380, 1), function (u, d, t) { return paper() + globe(320, 380, 220, 127 + t * 1.6, 30, { dot: [127, 37.5] }); });
shot([14, 1], fly([320, 380, 1], [380, 300, 1.8], 1.8), function (u, d, t) { return paper() + globe(320, 380, 220, 127 + t * 1.6, 30, { dot: [127, 37.5] }) + G("", T("كوريا", 450, 240, 18, OLIVE, 800), at(u, 1.2, .3)); });
shot([14, 2], still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: false }); return paper() + room(t, { cold: at(u, .2, .4) }) + bs.svg + SK.cold(bs.sl.foot[0], bs.sl.foot[1] - 30, 50, .8); });
shot([14, 3], still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: true }); return paper() + room(t, { cold: 1 }) + bs.svg + chip("بشراب", 320, 620, SK.C.SOCK, at(u, .1, .3), 26) + SK.heat(bs.sl.foot[0] - 10, bs.sl.foot[1] - 30, 30, 3, 1, .7); });
shot([14, 4], still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: false }); return paper() + room(t, { cold: 1 }) + bs.svg + chip("من غير", 320, 620, "#6d6a64", at(u, .1, .3), 26) + SK.cold(bs.sl.foot[0], bs.sl.foot[1] - 30, 50, .8); });
// 15 · with socks: 7.5 min faster, about half an hour more sleep, about 7 fewer wake-ups — three cards
function stat(i, big, unit, icon, k, cnt) {
  if (k <= 0) return ""; var y = 150 + i * 220;
  return appear(k, R(70, y - 80, 500, 180, "#f4ecdb", 2.2) + icon + (cnt > 0 ? N(big, 330, y + 30, 84, ORANGE) : "") + T(unit, 330, y + 76, 22, INK, 700));
}
shot(15, seq15(), function (u, d, t) {
  var c = window.CHUNKS[15], l = LN[15], at2 = function (j) { return at(t - (l.start + (l.end - l.start) * c[j]), 0, .4); };
  var k1 = at2(1), k2 = at2(3), k3 = at2(5), s = paper();
  s += stat(0, (7.5 * clamp(k1 * 1.3)).toFixed(1), "دقايق أسرع عشان تنام", SK.clock(490, 150, 50, 11), at2(0), k1);
  s += stat(1, String(Math.round(32 * clamp(k2 * 1.3))), "دقيقة نوم زيادة", G('rotate(' + f(8 * Math.sin(t * 1.3)) + ' 480 360)', SK.moonIcon(480, 360, 40)), at2(2), k2);
  s += stat(2, String(Math.round(7 * clamp(k3 * 1.3))), "مرات صحيان أقل", zzz(470, 620, t, 40), at2(4), k3);
  return s;
});
// 16 · so how does that save your life? — the sleeper, a question mark
shot(16, still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: true }); return paper() + room(t) + bs.svg + zzz(bs.sl.head[0] + 10, bs.sl.head[1] - 40, t, 30) + G("rotate(" + f(10 * Math.sin(t * 2.4)) + " 160 210)", T("؟", 160, 260, 140, ORANGE, 800), at(u, .2, .3)); });
// 17 · short sleep, night after night, is tied to heart disease, blood pressure and diabetes… so every extra hour counts
shot(17, still(WIDE[0], WIDE[1], 1), function (u, d, t) {
  var c = window.CHUNKS[17], l = LN[17], k = function (j) { return at(t - (l.start + (l.end - l.start) * c[j]), 0, .4); }, beat = Math.max(0, Math.sin(t * 7)) * (Math.sin(t * 3.5) > 0 ? 1 : 0);
  var s = paper() + G("", '<g transform="translate(320 150)">' + SK.clock(0, 0, 60, 3) + '</g>' + T("نوم قليل", 320, 260, 26, INK, 800), k(0));
  s += iconBox(150, 450, 150, SK.heart(0, 4, 1.2, beat) , k(1)) + G("", T("القلب", 150, 560, 22, ORANGE, 800), k(1));
  s += iconBox(320, 450, 150, SK.dial(0, 0, 1.25, .55 + .3 * k(2) + .03 * Math.sin(t * 4)), k(2)) + G("", T("الضغط", 320, 560, 22, ORANGE, 800), k(2));
  s += iconBox(490, 450, 150, SK.sugar(-6, 10, 1.3), k(2)) + G("", T("السكر", 490, 560, 22, ORANGE, 800), clamp(k(2) * 1.5 - .5));
  return s + numBox("+1", 300, 680, k(3), 44) + G("", T("ساعة نوم", 420, 694, 28, INK, 800), k(3)) + check(170, 670, 1.2, k(4), OLIVE);
});
// 18 · many think socks work because warmth is cosy… No.
shot(18, still(BEDV[0], BEDV[1], BEDV[2]), function (u, d, t) { var bs = bedScene(t, { socks: true, mouth: "smile" }); return paper() + room(t) + bs.svg + zzz(bs.sl.head[0] + 10, bs.sl.head[1] - 40, t, 30); });
shot([18, 2], fly(BEDV, [240, 470, 1.6], 1.8), function (u, d, t) { var bs = bedScene(t, { socks: true, mouth: "smile" }); return paper() + room(t) + bs.svg + chip("الدفا مريح", 320, 620, "#8f6a4a", at(u, .1, .3), 28); });
shot([18, 3], still(240, 470, 1.6), function (u, d, t) { var bs = bedScene(t, { socks: true, mouth: "smile" }); return paper() + room(t) + bs.svg + chip("الدفا مريح", 320, 620, "#8f6a4a", 1, 28) + cross(320, 620, 1.1, at(u, .05, .4)); });
// 19 · the warmth isn't the goal… it's the door the heat goes out through
shot(19, still(WIDE[0], WIDE[1], 1), function (u, d, t) { return paper() + bigFoot({ tint: "warm", sock: 1 }) + SK.heat(420, 400, 300, 7, .8, 1.3) + chip("مش الهدف", 170, 180, "#6d6a64", at(u, .1, .3), 24); });
shot([19, 2], still(WIDE[0], WIDE[1], 1), function (u, d, t) { var sb = skinB({ open: 1 }); return paper() + sb.svg + SK.door(sb.cx, sb.surface - 30, 140, at(u, .1, .8)) + label(sb.cx + 40, sb.surface - 100, 520, 120, "الباب", ORANGE, at(u, .4, .5), 28); }, { tr: "in" });
// 20 · so it must be a loose, light sock… not a tight one that squeezes the blood
shot(20, still(WIDE[0], WIDE[1], 1), function (u, d, t) {
  var tk = at(u, LN[20].end - LN[20].start > 2 ? 1.4 : 1, .4);
  return paper() + SK.foot(130, 400, .68, { sock: 1, tint: "warm" }) + SK.heat(200, 360, 140, 4, 1, .9) + check(190, 640, 1, at(u, .5, .4), OLIVE) + T("واسع", 190, 720, 26, OLIVE, 800) +
    G("", SK.foot(420, 400, .68, { sock: 1, tight: true }) + T("ضيق", 470, 720, 26, ORANGE, 800), tk);
});
shot([20, 3], fly(WIDE, [420, 380, 1.45], 1.8), function (u, d, t) {
  return paper() + G("", SK.foot(130, 400, .68, { sock: 1, tint: "warm" }) + check(190, 640, 1, 1, OLIVE) + T("واسع", 190, 720, 26, OLIVE, 800), .55) +
    SK.foot(420, 400, .68, { sock: 1, tight: true }) + T("ضيق", 470, 720, 26, ORANGE, 800) + label(420, 318, 560, 220, "يخنق الدم", ORANGE, at(u, .1, .5), 20) + cross(470, 640, 1, at(u, .5, .4));
});
// 21 · bottom line: the body must cool to sleep… the heat goes out through the feet… the sock opens the door
shot(21, seq21(), function (u, d, t) {
  var c = window.CHUNKS[21], l = LN[21], k = function (j) { return at(t - (l.start + (l.end - l.start) * c[j]), 0, .4); }, bs = bedScene(t, { socks: true });
  var core = k(1);
  return paper() + room(t) + bs.svg + G("", SK.thermo(300, 130, 160, .55 - .2 * k(1), BLUE), k(1)) + callout("1", 300, 90, k(1), 22) +
    SK.heat(bs.sl.foot[0] - 10, bs.sl.foot[1] - 30, 30, 3, k(3), .8) + callout("2", bs.sl.foot[0] + 60, bs.sl.foot[1] - 130, k(3), 22) +
    callout("3", bs.sl.foot[0] - 10, bs.sl.foot[1] + 120, k(4), 22) + label(bs.sl.foot[0] - 10, bs.sl.foot[1] + 30, bs.sl.foot[0] + 10, bs.sl.foot[1] + 96, "", INK, k(4));
}, { tr: "out" });
// 22 · the oddest: the coldest moment of your whole day comes about two hours before you wake up — a 24-hour line
var GX = 80, GW = 480, GY = 220, GH = 360;
function tempAt(h) { return 36.6 - .35 * Math.cos((h - 5) / 24 * Math.PI * 2); }   // core temperature by clock hour, lowest about 5 am
function gPt(h) { var hh = (h - 18 + 24) % 24; return [GX + GW * hh / 15, GY + GH - (tempAt(h) - 36.1) / 1.0 * GH]; }
function graph(k, t, mark) {
  var s = '<path d="M' + GX + ' ' + GY + ' V' + (GY + GH) + ' H' + (GX + GW) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>', d = "";
  for (var h = 18; h <= 33; h += .25) { var p = gPt(h % 24); d += (d ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
  s += draw(d, k, ORANGE, 5);
  [[18, "6م"], [22, "10م"], [2, "2ص"], [5, "5ص"], [7, "7ص"]].forEach(function (q) { var p = gPt(q[0]); s += T(q[1], p[0], GY + GH + 32, 18, INK, 700) + '<path d="M' + f(p[0]) + ' ' + (GY + GH) + ' v8" stroke="' + INK + '" stroke-width="2"/>'; });
  s += T("حرارة الجسم", GX + 10, GY - 20, 20, INK, 800, "end");
  var hh = 18 + ((t * 1.6) % 15), pp = gPt(hh % 24); if (k >= 1) s += C(pp[0], pp[1], 8, ORANGE, 2);
  if (mark > 0) { var m = gPt(5), w = gPt(7); s += G("", C(m[0], m[1], 9, BLUE, 2), mark) + label(m[0], m[1], m[0] - 60, m[1] - 140, "أبرد لحظة", BLUE, mark, 24); }
  return s;
}
shot(22, still(WIDE[0], WIDE[1], 1), function (u, d, t) { return paper() + graph(at(u, .1, 2.2), t, 0) + G("", SK.moonIcon(GX + 40, GY + 40, 22), at(u, .2, .3)); });
shot([22, 1], still(WIDE[0], WIDE[1], 1), function (u, d, t) { return paper() + graph(1, t, at(u, .2, .5)) + SK.moonIcon(GX + 40, GY + 40, 22); });
shot([22, 3], fly(WIDE, [380, 470, 1.5], 1.8), function (u, d, t) {
  var m = gPt(5), w = gPt(7);
  return paper() + graph(1, t, 1) + SK.moonIcon(GX + 40, GY + 40, 22) + SK.clock(w[0] + 20, GY + 30, 34, 7) + T("بتصحى", w[0] + 20, GY + 96, 20, INK, 800) +
    measure(m[0], GY + GH + 80, w[0], GY + GH + 80, at(u, .2, .8), "") + G("", T("ساعتين", (m[0] + w[0]) / 2, GY + GH + 122, 26, ORANGE, 800), at(u, .9, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: asleep with socks on. line 1: the question mark. line 2: warm feet, cooling body (thermometer drops)
  var b = SK.bed(24, 400, 560, 1.02), sl = SK.sleeper(290, 400, 1.02, { socks: true });
  var s = b.svg + sl.svg + zzz(sl.head[0] + 10, sl.head[1] - 50, t, 56) + SK.heat(sl.foot[0] - 10, sl.foot[1] - 40, 50, 4, 1, 1.3);
  if (li >= 1) s += G("rotate(" + f(10 * Math.sin(t * 2.4)) + " 200 150)", T("؟", 200, 200, 150, ORANGE, 800), ease((t - LN[1].start) / .3));
  if (li >= 2) { var k = ease((t - LN[2].start - .3) / 1.6); s += SK.thermo(470, 80, 150, .8 - .35 * k, k > .5 ? BLUE : ORANGE) + arrow(520, 120, 520, 220, BLUE, 5, k); }
  return s;
};
SCENE.bumper = function (u, t) { return '<g transform="translate(70 92) scale(.3)">' + SK.foot(0, 0, 1, { sock: 1 }) + '</g>' + SK.heat(110, 110, 60, 3, 1, .5); };
SCENE.outro = function (svg, u, t) {
  var sl = SK.sleeper(250, 210, .62, { socks: true });
  return SK.bed(70, 210, 400, .62).svg + sl.svg +
    callout("1", 300, 90, ease(u / .3)) + callout("2", 150, 90, ease(u / .3 - .5)) + callout("3", 100, 150, ease(u / .3 - 1)) + callout("4", 60, 220, ease(u / .3 - 1.5)) + SK.heat(sl.foot[0] - 6, sl.foot[1] - 20, 20, 3, 1, .5);
};
