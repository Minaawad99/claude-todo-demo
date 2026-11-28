window.CHUNKS = [[0.0, 0.4839], [0.0, 0.4068, 0.7797], [0.0, 0.2, 0.6222], [0.0, 0.4194], [0.0, 0.4792], [0.0], [0.0, 0.5152], [0.0, 0.1733, 0.4267, 0.7733], [0.0, 0.3607, 0.623], [0.0], [0.0, 0.4242, 0.7727], [0.0, 0.2388, 0.4478, 0.6716], [0.0, 0.4878], [0.0, 0.3594, 0.6094], [0.0, 0.3478, 0.6522], [0.0, 0.7209], [0.0, 0.6486], [0.0, 0.3265, 0.6939], [0.0, 0.1912, 0.4559, 0.6324], [0.0, 0.2941, 0.4853, 0.7353], [0.0, 0.4444, 0.7593], [0.0, 0.4242], [0.0, 0.1829, 0.4268, 0.5732, 0.7561], [0.0, 0.42, 0.8], [0.0, 0.25, 0.4688, 0.6354, 0.8125], [0.0, 0.6304]];
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

// ── «المسواك» — shots. Drawings in draw.js (MW.*), people from the Gemini kit (PERSON.sprite), real clips from the partner's
// video in ../clips (played frame by frame inside a taped photo frame). The frame holds still; the camera only flies (~1.8 s)
// in onto a detail and back out. Life comes from the drawing: fibres sway, the host breathes, bristle tips move.
var Z = MW, FULL = [320, 393, 1], LOGO = "../refs/product/logo.png", CLIPN2 = 0;
var CLIPS = { green: 81, bend: 87, pouch: 69, pocket: 84, bag: 72, box: 90, finger: 60, clear: 90 };

// ── the host as a puppet (gemini/rig.js): poses tween, he blinks, and his mouth follows the narrator ──
function voiceAt(t) { var i = Math.floor(t * 30); return (window.VENV && window.VENV[i]) || 0; }
var MISWAK_P = Z.stick(0, -150, 0, 110, 22, { fray: .9 });
var BRUSH_P = '<g transform="rotate(-90) scale(.9)">' + Z.brushSide(-150, 0, 215, { miswak: true, taper: true, h: 30, col: "#9cc79a" }) + '</g>';
function pose(name, extra) { var p = PERSON.rigPose(name); for (var k in (extra || {})) p[k] = extra[k]; return p; }
function withProp(p, prop) { p = JSON.parse(JSON.stringify(p)); p.armN = p.armN.slice(0, 4); while (p.armN.length < 4) p.armN.push(0); p.armN.push(prop); return p; }
// keys: [[u, pose], …] in seconds into the shot; each key eases in over 0.45 s. o.talk: lip-sync to the voice
function puppetPose(keys, u, t, o) {
  o = o || {}; var p = keys[0][1];
  for (var i = 1; i < keys.length; i++) if (u >= keys[i][0]) p = PERSON.rigMix(p, keys[i][1], ease((u - keys[i][0]) / .45));
  p = JSON.parse(JSON.stringify(p, function (k, v) { return typeof v === "string" && v.charAt(0) === "<" ? v : v; }));
  var sw = Math.sin(t * 1.3) * 2.5; p.armN[0] += sw; p.armF[0] -= sw * .7; p.head = (p.head || 0) + Math.sin(t * .9) * 1.5;
  if (o.talk) { var v = voiceAt(t); p.talk = v; p.mouthRest = p.mouth; }
  return p;
}
function puppet(keys, u, t, x, fy, h, o) { return PERSON.rig(puppetPose(keys, u, t, o), x, fy, h, t); }
function host(name, x, fy, h, t, o) { return PERSON.sprite(name, x, fy, h, Object.assign({ t: t }, o || {})); }
function brand(k) { return G("", Z.logo(LOGO, 510, 62, 220), k == null ? 1 : clamp(k)); }   // the brand corner, top right (the user's rule for the ad part)
// a real clip in a taped frame: plays from the shot's start, holds its last frame
function vid(name, u, x, y, w, h, rot, k) {
  k = pop(k == null ? 1 : k); if (k <= 0) return ""; var n = CLIPS[name], i = Math.min(n, 1 + Math.floor(Math.max(0, u) * 30)), id = "vd" + (++CLIPN2);
  var src = "../clips/" + name + "/" + ("00" + i).slice(-3) + ".jpg";
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + f(k) + ')',
    '<rect x="' + f(-w / 2 - 10) + '" y="' + f(-h / 2 - 10) + '" width="' + f(w + 20) + '" height="' + f(h + 20) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')"><image href="' + src + '" x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/></g>' +
    '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/><rect x="-34" y="' + f(-h / 2 - 22) + '" width="68" height="22" fill="#e9dcae" opacity=".85" transform="rotate(-4)"/>');
}
function ground() { return '<rect x="-400" y="560" width="1440" height="600" fill="#e2cf9f"/>' + Z.line([[-400, 560], [1040, 560]], INK, 2) + [[90, 610], [260, 660], [470, 620], [560, 700]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="18" ry="5" fill="#cdb682"/>'; }).join(""); }
function magFibres(k) {   // the inside of the stick, magnified: fibres with silica grains
  var g = ""; for (var i = 0; i < 14; i++) g += Z.line([[-150, -120 + i * 18], [150, -120 + i * 18 + 6 * Math.sin(i + window.__t * .8)]], i % 2 ? Z.C.FIB : "#d8c497", 9);
  for (i = 0; i < 40; i++) g += '<circle cx="' + f(-140 + 280 * Z.rnd(i)) + '" cy="' + f(-120 + 250 * Z.rnd(i + 40)) + '" r="' + f((2.5 + 3 * Z.rnd(i + 7)) * clamp(k * 1.5 - Z.rnd(i) * .5)) + '" fill="#fff" stroke="' + BLUE + '" stroke-width="1.4"/>';
  return '<clipPath id="mgc"><circle cx="400" cy="250" r="170"/></clipPath><circle cx="400" cy="250" r="170" fill="#f3e8cc"/><g clip-path="url(#mgc)"><g transform="translate(400 250) scale(1.25)">' + g + '</g></g><circle cx="400" cy="250" r="170" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>';
}
function jaw(stainK) { return Z.jawCut(-20, 660, 520, [150, 470], { w: 230, h: 210, r: 230, stain: 1, stainK: stainK }); }
function rub(t) { var x = 150 + 22 * Math.sin(t * 5), y = 300 + 8 * Math.cos(t * 5); return Z.stick(x, y, x - 210, y - 130, 34, { fray: 1 }); }   // the miswak rubbing the crown
function two(t, k, cut) { return Z.stick(110, 230, 470, 230, 30, { fray: 1 }) + Z.chip(560, 230, "النهاردة", OLIVE) + G("", Z.stick(110, 480, 470, 480, 30, { fray: 1, dry: 1, cut: cut || 0 }) + Z.chip(560, 480, "بعد يومين", ORANGE), k); }
var A11 = null; function arch11() { return A11 || (A11 = Z.arch(320, 170, 210, 330, { hot: 5 })); }
function bass(t) { var j = Math.sin(t * 6) * 4; return Z.jawCut(-20, 660, 520, [360], { w: 190, h: 230, r: 240 }) + Z.brushEnd(150 + j * .5, 330 + j, 262 + j * .3, 506, { miswak: true, taper: true }); }
function myth(t, kH, kS) {
  var j = Math.sin(t * 6) * 3;
  return Z.jawCut(-20, 660, 540, [190, 500], { w: 150, h: 190, r: 200 }) +
    G("", Z.brushEnd(40 + j, 380, 112 + j, 530, { hard: true, col: "#c9cdd1" }) + [0, 1, 2].map(function (q) { return Z.line([[96 + q * 8, 532 + q * 6], [110 + q * 8, 540 + q * 6]], "#a8322a", 4); }).join(""), kH) +
    G("", Z.brushEnd(350 + j, 380, 422 + j, 530, { taper: true, miswak: true, bend: .6 + .3 * Math.sin(t * 6) }), kS);
}
function cals(k) { return [0, 1, 2].map(function (q) { return G("", Z.calendar(160 + q * 160, 230, 1.4, ["شهر 1", "شهر 2", "شهر 3"][q]), clamp(k * 3 - q)); }).join(""); }

// 4 · the miswak is a twig of a tree called Arak
shot(4, still(320, 393, 1), function (u, d, t) { return paper() + ground() + appear(at(u, 0, .6), Z.shrub(320, 560, 1.05)) + label(470, 330, 540, 260, "الأراك", OLIVE, at(u, 1.4, .5), 22); });
shot([4, 1], fly([320, 393, 1], [200, 330, 1.7], 1.8), function (u, d, t) { return paper() + ground() + Z.shrub(320, 560, 1.05) + label(470, 330, 540, 260, "الأراك", OLIVE, 1, 22) + iconBox(130, 130, 200, '<g transform="translate(-100 -100)">' + Z.berries(90, 50, 9, 9) + Z.leaf(20, 140, 70, -10) + Z.leaf(100, 140, 70, 10) + '</g>' + T("ثمر الأراك", 0, 88, 16, MUTE), at(u, .4, .4)); });
// 5 · what's inside it?
shot(5, fly([200, 330, 1.7], FULL, 1.8), function (u, d, t) { return paper() + Z.stick(80, 640, 470, 520, 44, { fray: 1 }) + G("", T("؟", 420, 300, 150, ORANGE, 800), at(u, .8, .3)); });
// 6 · natural substances, best known: silica (the magnifier opens on the fibres)
shot(6, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.stick(80, 640, 470, 520, 44, { fray: 1 }) + draw("M150 600 L300 420", at(u, .1, .5), INK, 1.5, ' stroke-dasharray="6 5"') + G("", magFibres(at(u, .6, d)), at(u, .3, .4)) + label(440, 170, 520, 110, "ألياف", OLIVE, at(u, .9, .5), 20) + label(330, 300, 220, 360, "سيليكا", BLUE, at(u, d - .9, .5), 22); });
// 7 · silica: tiny grains that polish the tooth gently, like a polishing cloth (the stains fade as it rubs)
shot(7, fly(FULL, [320, 420, 1.15], 1.8), function (u, d, t) { return paper() + jaw(1) + label(560, 330, 600, 250, "المينا", OLIVE, at(u, 1.2, .5), 20); });
shot([7, 2], still(320, 420, 1.15), function (u, d, t) { return paper() + jaw(1 - at(u, .2, d + 2)) + rub(t) + label(560, 330, 600, 250, "المينا", OLIVE, 1, 20) + [0, 1, 2].map(function (q) { return G("", Z.line([[250 + q * 12, 330 + q * 22], [268 + q * 12, 318 + q * 22]], "#ffffff", 4), clamp(Math.sin(t * 3 + q) * .5 + .5)); }).join(""); });
shot([7, 3], still(320, 420, 1.15), function (u, d, t) { return paper() + jaw(.3 - .3 * at(u, 0, d)) + rub(t) + iconBox(130, 130, 190, '<rect x="-60" y="-20" width="120" height="44" fill="#c7d6e6" stroke="' + INK + '" stroke-width="2"/>' + G('translate(' + f(20 * Math.sin(t * 4)) + ' 0)', Z.blob([[-40, -40], [30, -50], [50, -10], [-10, 0], [-50, -10]], "#e9b949", 2)) + T("قماشة تلميع", 0, 66, 17), at(u, 0, .4)); });
// 8 · and the WHO itself encouraged its use, from the eighties
shot(8, fly([320, 420, 1.15], FULL, 1.8), function (u, d, t) {
  return paper() + appear(at(u, .2, .5), '<rect x="150" y="150" width="340" height="440" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (q) { return Z.line([[190, 300 + q * 34], [450 - (q % 3) * 40, 300 + q * 34]], "#cfc6b4", 6); }).join("") +
    T("منظمة الصحة العالمية", 320, 230, 26, BLUE, 800) + Z.stick(210, 540, 420, 520, 18, { fray: .6 })) + check(470, 560, 1.3, at(u, d * .5, .5), OLIVE) + G("", Z.chip(320, 680, "التمانينات", ORANGE), at(u, d * .6, .3));
});
// 9 · so why do we throw it away? (the host, thinking)
shot(9, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + puppet([[0, pose("think")], [d * .55, pose("shrug")]], u, t, 290, 775, 660, { talk: true }) + G("", T("؟", 520, 260, 140, ORANGE, 800), at(u, .3, .3)) + Z.bin(540, 760, 1.1); });
// 10 · the fibres go hard after two days; you cut the end and start again every day or so
shot(10, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + two(t, at(u, .6, .5), 0); });
shot([10, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var o = .5 + .5 * Math.abs(Math.sin(t * 5)); return paper() + two(t, 1, at(u, 0, .5)) + G("", Z.scissors(150, 620, .9, o, -70), at(u, .2, .3)) + label(170, 480, 300, 580, "ناشف", ORANGE, at(u, .3, .5), 20); });
// 11 · the fibres come out of the end of the stick: hard to reach the back teeth and the inside (the upper arch from below)
shot(11, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch11(), w = 6 * Math.sin(t * 3); return paper() + appear(at(u, 0, .5), a.svg) + Z.stick(300 + w, 160, 160 + w, 60, 24, { fray: .9 }); });
shot([11, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch11(), w = 6 * Math.sin(t * 3); return paper() + a.svg + Z.stick(300 + w, 160, 160 + w, 60, 24, { fray: .9 }) + cross(a.back[-1][0], a.back[-1][1], .85, at(u, .1, .5)) + cross(a.back[1][0], a.back[1][1], .85, at(u, .4, .5)) + label(320, 380, 400, 460, "جوه", BLUE, at(u, 1, .5), 22); });
// 12 · what if we took the miswak and made it a brush?
shot(12, fly(FULL, [320, 380, 1.05], 1.8), function (u, d, t) {
  var k = at(u, .8, 1.2); return paper() + puppet([[0, pose("think")], [d * .45, pose("pointUp", { armF: [100, 96, "relaxed"], armN: [-120, -95, "point"] })]], u, t, 100, 790, 430, { talk: true }) + G("", Z.stick(160, 250, 440, 250, 30, { fray: 1 }), 1 - .5 * k) + arrow(320, 330, 320, 430, ORANGE, 5, at(u, .5, .6)) + G("translate(120 560)", G("", Z.brushSide(0, 0, 400, { miswak: true, taper: true, h: 70 }), k)) + G("", T("؟", 560, 300, 120, ORANGE, 800), at(u, .2, .3));
});
// 13 · in Japan they made a brush whose bristles are kneaded with miswak powder and silica (the product photo + the real brush)
shot(13, fly([320, 380, 1.05], FULL, 1.8), function (u, d, t) { return paper() + G("", Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2), at(u, .2, .4)) + brand(at(u, .1, .4)) + G("", Z.chip(250, 640, "صنع اليابان", INK), at(u, 1, .3)); });
shot([13, 1], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2) + brand() + Z.chip(250, 640, "صنع اليابان", INK) + vid("green", u, 500, 520, 170, 302, 4, at(u, 0, .4)); });
shot([13, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2) + brand() + vid("green", u + 1.2, 500, 520, 170, 302, 4) + Z.tag(250, 300, "بودرة المسواك", ORANGE, 1, -90); });
// 14 · and it's now sold in Egypt by Smart Miswak (the real brush beside its box)
shot(14, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("box", u, 300, 420, 330, 586, -2, at(u, 0, .4)) + G("", Z.chip(320, 740, "متوفرة في مصر", ORANGE), at(u, 1.2, .3)); });
// 15 · the bristles are needle-fine at the tip, like a pencil point
shot(15, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var s = Math.sin(t * 2) * 2; return paper() + brand() + G("", Z.bristle(200, 640, 420, 70, false) + Z.chip(200, 700, "عادية", "#6d6a64"), at(u, 0, .4)) + G('translate(' + f(s) + ' 0)', G("", Z.bristle(440, 640, 420, 70, true) + Z.chip(440, 700, "مدبّبة", ORANGE), at(u, .5, .4))) + iconBox(110, 110, 170, Z.pencil(0, 0, .9, -30), at(u, 1.2, .4)); });
// 16 · so they get between the teeth and down to the gum line (one tooth cut from the side, the brush head across at 45°)
shot(16, fly(FULL, [300, 470, 1.25], 1.8), function (u, d, t) { return paper() + bass(t) + label(262, 512, 120, 600, "خط اللثة", OLIVE, at(u, 1.2, .5), 22); });
shot([16, 1], still(300, 470, 1.25), function (u, d, t) { return paper() + bass(t) + label(262, 512, 120, 600, "خط اللثة", OLIVE, 1, 22) + iconBox(150, 260, 190, G("scale(.6)", Z.frontTeeth(0, 70, 110, 190, true)) + T("بين السنان", 0, 82, 17, ORANGE), at(u, 0, .4)); });
// 17 · many think the hard brush cleans better. No. (it jabs the gum)
shot(17, fly([300, 470, 1.25], FULL, 1.8), function (u, d, t) { return paper() + myth(t, 1, 0) + G("", Z.chip(120, 730, "خشنة", "#6d6a64"), at(u, .4, .3)); });
shot([17, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + myth(t, 1, 0) + Z.chip(120, 730, "خشنة", "#6d6a64") + cross(110, 260, 1, at(u, 0, .5)); });
// 18 · dentists advise the soft one; a hard one can hurt the gum over time (the soft tips bow; then the real brush bends under a finger)
shot(18, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + myth(t, 1, at(u, 0, .5)) + Z.chip(120, 730, "خشنة", "#6d6a64") + cross(110, 260, 1, 1) + check(420, 260, 1.2, at(u, .6, .5), OLIVE) + G("", Z.chip(430, 730, "ناعمة", OLIVE), at(u, .6, .3)); });
shot([18, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("bend", u, 320, 400, 330, 586, -2, at(u, 0, .4)) + Z.chip(320, 740, "ناعمة", OLIVE); });
// 19 · and you can use it without paste when you're out: at work or travelling (the host shows the brush; then the bag)
shot(19, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + puppet([[0, withProp(pose("show"), BRUSH_P)], [d * .6, withProp(pose("show", { armN: [70, -70, "fist", 0], head: 4 }), BRUSH_P)]], u, t, 420, 775, 660, { talk: true }) + iconBox(110, 190, 160, '<rect x="-56" y="-30" width="112" height="76" rx="8" fill="#8d5d35" stroke="' + INK + '" stroke-width="2"/><rect x="-22" y="-44" width="44" height="16" rx="5" fill="none" stroke="' + INK + '" stroke-width="4"/>' + T("الشغل", 0, 70, 17), at(u, 1.6, .4)); });
shot([19, 3], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("bag", u, 320, 410, 330, 586, 2, at(u, 0, .4)); });
// 20 · a kids' size, and a small one with a cap for your pocket (the pouch, the pink pocket brush)
shot(20, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("pouch", u, 320, 410, 330, 586, -2, at(u, 0, .4)) + G("", Z.chip(320, 740, "مقاس أطفال", OLIVE), at(u, .4, .3)); });
shot([20, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("pocket", u, 320, 410, 330, 586, 2, at(u, 0, .4)) + G("", Z.chip(320, 740, "بغطا للجيب", ORANGE), at(u, .3, .3)); });
// 21 · like any brush, change it every three months
shot(21, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + cals(at(u, 0, d * .8)) + arrow(110, 340, 530, 340, ORANGE, 4, at(u, .4, d * .6)) + G("translate(110 560)", Z.brushSide(0, 0, 330, { miswak: true, taper: true, h: 60 })) + G("", Z.chip(320, 700, "3 شهور", ORANGE), at(u, d * .7, .3)); });
// 22 · bottom line: the miswak idea, in a brush that reaches everywhere, with nothing to cut
var A22 = null; function arch22() { return A22 || (A22 = Z.arch(320, 200, 190, 290, {})); }
shot(22, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch22(), q = (t * .25) % 1, ang = 30 + 60 * Math.sin(t * .8); return paper() + a.svg + G('translate(' + f(200 + 120 * Math.sin(t * .8)) + ' ' + f(150 + 260 * q) + ') rotate(' + f(ang) + ')', Z.brushSide(0, 0, 220, { miswak: true, taper: true, h: 36, down: true })); });
shot([22, 3], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch22(); return paper() + a.svg + check(a.back[-1][0], a.back[-1][1] + 70, .9, at(u, 0, .4), OLIVE) + check(a.back[1][0], a.back[1][1] + 70, .9, at(u, .3, .4), OLIVE) + check(320, 700, .9, at(u, .6, .4), OLIVE); });
shot([22, 4], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + puppet([[0, pose("explain")], [.5, pose("thumbs", { armN: [70, -60, "thumbs", -40] })]], u, t, 320, 775, 660, { talk: true }) + G("", Z.scissors(520, 200, .9, .6, -40) + cross(520, 200, 1.1, at(u, .3, .5)), at(u, 0, .3)); });
// 23 · the oddest: the word سواك comes from ساك, «to rub»
shot(23, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) {
  var w = 30 * Math.sin(t * 4);
  return paper() + appear(at(u, 0, .4), '<rect x="150" y="160" width="340" height="140" rx="10" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + T("سِواك", 320, 260, 76, INK, 800)) + arrow(320, 320, 320, 400, ORANGE, 5, at(u, .8, .5)) +
    G("", '<rect x="150" y="420" width="340" height="140" rx="10" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + T("ساكَ = دَلَكَ", 320, 520, 60, ORANGE, 800), at(u, 1.2, .4)) + G('translate(' + f(w) + ' 0)', Z.stick(170, 680, 470, 640, 20, { fray: .8 }));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a drooping Arak branch, one twig ends in a frayed brush. line 1: older than your bathroom brush. line 2: the host, let down
  var s = "", k1 = li >= 1 ? ease((t - LN[1].start) / .4) : 0, k2 = li >= 2 ? ease((t - LN[2].start) / .4) : 0;
  if (li === 0) s += Z.branch([[700, 40], [560, 70], [450, 130], [370, 220], [330, 320]], { w: 10, leaf: 58, berries: true }) + Z.branch([[700, 280], [600, 280], [520, 310], [470, 370]], { w: 8, leaf: 48, ph: 2 }) +
    Z.stick(140, 540, 350, 360, 26, { fray: 1 }) + Z.line([[350, 360], [362, 342], [378, 310]], "#d6cbb0", 9);
  if (li === 1) s += G("", Z.line([[40, 430], [570, 430]], INK, 3) + Z.stick(430, 320, 580, 260, 22, { fray: .8 }) + T("آلاف السنين", 500, 500, 28, ORANGE, 800) + Z.brushSide(50, 320, 210, { col: "#7fb2d6" }) + T("فرشاتك", 140, 500, 28, INK, 800) + arrow(400, 560, 210, 560, INK, 3, k1), k1);
  if (li >= 2) {
    var u2 = t - LN[2].start, d2 = LN[2].end - LN[2].start, tw = d2 * .5, thrown = u2 > tw + .25;
    var sad = withProp(pose("sad"), thrown ? "" : MISWAK_P), toss = pose("sad", { armN: [-10, -40, "palm", 0], eyes: "half", mouth: "frown" });
    var p = puppetPose([[0, sad], [tw, toss]], u2, t, { talk: true }), J2 = PERSON.rigJoints(p, 230, 650, 620, t), fl = clamp((u2 - tw - .25) / .55);
    var stickFly = thrown ? Z.stick(lerp(J2.wristN[0], 500, fl) - 30, lerp(J2.wristN[1], 560, fl) - 160 * Math.sin(fl * Math.PI) * (1 - fl * .2), lerp(J2.wristN[0], 500, fl) + 40, lerp(J2.wristN[1], 560, fl) - 160 * Math.sin(fl * Math.PI) + 10, 12, { dry: 1, fray: .6 }) : "";
    s += G("", Z.bin(500, 640, 1.1) + J2.svg + stickFly + Z.calendar(500, 120, 1.2, "يومين"), k2);
  }
  return s;
};
SCENE.bumper = function (u, t) { return Z.stick(30, 120, 170, 60, 18, { fray: 1 }); };
SCENE.outro = function (svg, u, t) {
  return G("translate(30 40) scale(.8)", Z.stick(20, 120, 260, 60, 22, { fray: 1 }) + G("translate(330 150)", Z.brushSide(0, 0, 330, { miswak: true, taper: true, h: 60 }))) +
    callout("1", 120, 40, ease(u / .3)) + callout("2", 210, 110, ease(u / .3 - .5)) + callout("3", 380, 70, ease(u / .3 - 1)) + callout("4", 470, 200, ease(u / .3 - 1.5));
};
