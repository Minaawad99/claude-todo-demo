window.CHUNKS = [[0.0, 0.375, 0.6719], [0.0, 0.4815], [0.0, 0.4918], [0.0, 0.439], [0.0, 0.4444], [0.0, 0.3333, 0.6], [0.0, 0.3514, 0.6757], [0.0, 0.625], [0.0], [0.0, 0.2625, 0.6125], [0.0, 0.3733, 0.4933, 0.6667], [0.0, 0.6296], [0.0, 0.46], [0.0, 0.3448], [0.0], [0.0, 0.1954, 0.5862, 0.7126], [0.0, 0.3026, 0.5658], [0.0, 0.2542, 0.6949], [0.0, 0.55], [0.0, 0.2963, 0.5926]];
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

// ── «اتبرع لمصابي حريق الوراق» — shots. Panel world 640 × 786. People: the shared person kit; the road and the fire
// come from ../../warraq-fire/sketch/draw.js (copied as draw.js). Donation numbers only on screen, all from the
// hospitals' own official pages (refs/SOURCES.md).
function LS(i) { return LN[i].start; }
function pf(o) { return PERSON.front(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function ps(o) { return PERSON.side(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function blink(t, s) { var p = (t + (s || 0)) % 3.7; return p < .12 ? .05 : 1; }
function place(x, y, s, inner) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", inner); }
function floorL(y) { return R(-600, y, 1840, 600, "#e3d7bd", 0) + '<path d="M-600 ' + y + ' H1240" stroke="' + INK + '" stroke-width="2.4"/>'; }
var WHITE = "#f4f2ec", GAUZE = "#f7f4ea", GREEN = "#5e8a4e", RED = "#b8402f";

// a phone in a hand (the kit's hand), screen content drawn in a 120×220 box at (0,0)
function handPhone(x, y, sc, screen, t) {
  var s = R(-70, -120, 140, 250, "#2f2b27", 3, 18) + '<rect x="-60" y="-104" width="120" height="212" rx="6" fill="#dfe7e2" stroke="' + INK + '" stroke-width="1.6"/>';
  s += '<clipPath id="scr' + (++CLIPN) + '"><rect x="-60" y="-104" width="120" height="212" rx="6"/></clipPath><g clip-path="url(#scr' + CLIPN + ')">' + (screen || "") + '</g>';
  s = PERSON.hand([-18, 205], -1.5, "relaxed", -1, 3.2, PERSON.colors, true) + s;   // the hand holds the phone from below, behind it
  return place(x, y, sc, s);
}
// the fire on a phone screen (yesterday, watching)
function screenFire(t) { return '<rect x="-60" y="-104" width="120" height="212" fill="#2b3340"/>' + R(-60, 40, 120, 70, ASPH, 0) + fireRow(-60, 60, 40, 46, t, 1) + smoke(0, -10, 100, 80, t, 1, 6, 6) + C(-40, -88, 5, RED, 0) + T("مباشر", -10, -84, 11, "#fff", 700); }
// a heart with a plus, for «تنقذ روح»
function heart(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", P("M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30 Z", col || ORANGE, 3) + '<path d="M0 -22 V6 M-14 -8 H14" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'); }

// ── 0–1 · the hook card ──
SCENE.intro = function (svg, t, li) {
  var s = '<rect width="608" height="660" fill="' + PAPER + '"/>';
  if (li === 0) s += '<rect width="608" height="660" fill="' + NIGHT + '" opacity=".55"/>' + handPhone(304, 330, 1.25, screenFire(t), t);
  else { var k = ease((t - LS(1)) / .6); s += '<rect width="608" height="660" fill="' + NIGHT + '" opacity="' + f(.55 * (1 - k)) + '"/>' + handPhone(304, 330, 1.25, '<rect x="-60" y="-104" width="120" height="212" fill="#f4ecdb"/>' + heart(0, 0, .9 * pop(k) + .01, ORANGE), t); }
  return s + '<rect x="1" y="1" width="606" height="658" fill="none" stroke="' + INK + '" stroke-width="2"/>';
};

// ── 2 · «لسه فيه مصابين في المستشفيات…»: a hospital bed, the patient with bandaged arms, a drip, a monitor ──
function monitor(x, y, t) { var s = R(x - 70, y - 50, 140, 100, "#2f2b27", 2.4, 6) + R(x - 60, y - 40, 120, 70, "#203028", 1.2), d = "M" + (x - 58) + " " + (y - 5); for (var i = 0; i <= 116; i += 4) { var ph = ((i + t * 60) % 58) / 58, v = ph > .4 && ph < .46 ? -22 : ph > .46 && ph < .5 ? 12 : 0; d += " L" + (x - 58 + i) + " " + f(y - 5 + v); } return s + '<path d="' + d + '" stroke="#7fd08a" stroke-width="2" fill="none"/>' + R(x - 6, y + 50, 12, 120, "#8d887e", 1.6); }
function bedScene(t, o) {
  o = o || {}; var s = paper() + floorL(640);
  s += R(120, 500, 460, 30, "#c6c3bb", 2.4) + R(130, 530, 14, 110, "#8d887e", 1.8) + R(556, 530, 14, 110, "#8d887e", 1.8) + R(110, 430, 16, 210, "#8d887e", 1.8) + R(128, 470, 440, 32, WHITE, 2.2, 10);
  s += R(140, 452, 90, 24, WHITE, 2, 12);   // pillow
  var po = { x: 330, y: 470, s: .95, dir: 1, rot: -90, legs: [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms: [{ sh: 6, el: 8, hand: "relaxed" }, { sh: -6, el: 8, hand: "relaxed" }], face: { eyes: .15, brows: "worried", mouth: "neutral" }, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } } };
  s += ps(po);
  s += P("M240 440 Q380 420 560 450 L560 476 L240 476 Z", "#cfe0ee", 2.2);   // the sheet over the legs
  for (var i = 0; i < 5; i++) s += R(210 + i * 18, 446, 12, 26, GAUZE, 1.2, 3);   // gauze bands on the arm
  s += R(60, 230, 8, 410, "#8d887e", 1.8) + P("M40 230 L88 230 L84 300 L44 300 Z", "#d7e6ec", 2) + '<path d="M64 300 Q70 400 200 450" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' + C(64, 280 + 14 * ((t * .8) % 1), 3, "#9fbfd0", 0);
  return s + monitor(560, 300, t);
}
shot(2, still(340, 440, 1.35), function (u, d, t) { return bedScene(t); });
// «وفيهم حروق وصلت لسبعين في المية من الجسم.»: a standing figure, 70 % of the body shaded orange
shot([2, 1], still(320, 400, 1), function (u, d, t) {
  var k = at(u, .1, 1.2), body = pf({ x: 230, y: 650 - 210 * 1.1, s: 1.1, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } }, face: { eyes: blink(t), brows: "worried" }, arms: [{ rel: [-30, 150], hand: "relaxed" }, { rel: [30, 150], hand: "relaxed" }] });
  var top = lerp(650, 650 - 400 * 1.1 * .74, k);
  return paper() + floorL(650) + body + '<clipPath id="b70"><rect x="0" y="' + f(top) + '" width="460" height="' + f(650 - top) + '"/></clipPath><g clip-path="url(#b70)" opacity=".55">' + body.replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="' + ORANGE + '"') + '</g>' + bigNum(count(70, k) + "%", "من الجسم", 500, 380, at(u, .2, .4), ORANGE, 90);
});
// 3 · «والحرق الكبير ده… علاجه مش يوم ولا يومين.»: calendar pages flying off
function calendar(x, y, n, k) { var s = R(x - 110, y - 120, 220, 240, WHITE, 2.6, 8) + R(x - 110, y - 120, 220, 56, RED, 2.6, 8) + C(x - 60, y - 124, 8, "#8d887e", 2) + C(x + 60, y - 124, 8, "#8d887e", 2) + N(String(n), x, y + 60, 90, INK) + T("يوم", x, y + 100, 22, MUTE, 700); return s; }
shot(3, still(320, 400, 1), function (u, d, t) { var n = Math.min(60, Math.floor(1 + u * 18)), s = paper() + calendar(320, 400, n); for (var i = 0; i < 3; i++) { var p = (u * 1.8 + i / 3) % 1; s += G("translate(" + f(320 + p * 260) + " " + f(330 - p * 220) + ") rotate(" + f(p * 70) + ")", R(-90, -50, 180, 110, WHITE, 2, 6), 1 - p); } return s + tag("مش يوم ولا يومين", 320, 620, at(u, .4, .4), 30, ORANGE); });
// 4 · «طب ليه علاج الحروق صعب كده؟»
// the skin in a cut: epidermis, dermis with a hair and vessels, the fat under it; microbes outside
function skinCut(t, burn, o) {
  o = o || {}; var s = paper(), X0 = -40, X1 = 680;
  s += R(X0, 520, X1 - X0, 300, "#f0d79a", 2.4); for (var i = 0; i < 14; i++) s += C(X0 + 30 + i * 52, 580 + (i % 2) * 40, 22, "#f6e2ad", 1.4);   // fat
  s += R(X0, 380, X1 - X0, 140, "#e7a98f", 2.4) + '<path d="M40 470 Q160 430 280 470 T520 470 T760 470" stroke="#b8402f" stroke-width="5" fill="none"/><path d="M40 490 Q160 460 280 490 T520 490" stroke="#4a6f8a" stroke-width="5" fill="none"/>';   // dermis, vessels
  s += P("M300 380 L300 470 Q310 500 320 470 L320 380", "#3a2a20", 1.4) + '<ellipse cx="310" cy="480" rx="16" ry="22" fill="#d98a6a" stroke="' + INK + '" stroke-width="1.6"/>';   // hair follicle
  s += R(X0, 350, X1 - X0, 30, "#f3c8b0", 2.4);   // epidermis
  for (var j = 0; j < 30; j++) s += '<path d="M' + (X0 + j * 26) + ' 352 l12 0" stroke="#e0a98a" stroke-width="2"/>';
  if (burn > 0) { var bx = 120, bw = 400 * burn; s += P("M" + bx + " 350 Q" + (bx + bw * .2) + " 395 " + (bx + bw * .5) + " 400 Q" + (bx + bw * .8) + " 395 " + (bx + bw) + " 350 Z", CHAR, 2.2) + '<path d="M' + bx + ' 350 Q' + (bx + bw * .5) + ' 410 ' + (bx + bw) + ' 350" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity=".7"/>'; }
  // microbes: green capsules; they bounce off the skin, or slip in through the burn
  for (var m = 0; m < 9; m++) { var p = (t * .35 + hash(m)) % 1, mx = 40 + hash(m + 5) * 560, enter = burn > .5 && mx > 140 && mx < 500, my = enter ? 150 + p * 320 : 150 + 190 * Math.abs(Math.sin(p * Math.PI)); s += G("translate(" + f(mx) + " " + f(my) + ") rotate(" + f(m * 40 + t * 30) + ")", '<rect x="-14" y="-7" width="28" height="14" rx="7" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-5" cy="0" r="2" fill="#2f3a20"/><circle cx="5" cy="0" r="2" fill="#2f3a20"/>'); }
  return s;
}
shot(4, still(320, 420, 1), function (u, d, t) { return skinCut(t, 0) + T("؟", 320, 250, 150 * (pop(at(u, .1, .5)) || .01), ORANGE, 900); });
// 5 · «عشان الجلد هو اللي بيحمي جسمك من الميكروبات…»
shot(5, still(320, 420, 1), function (u, d, t) { return skinCut(t, 0) + label(560, 365, 520, 270, "الجلد", OLIVE, at(u, .2, .5), 26) + label(100, 190, 140, 120, "ميكروبات", GREEN, at(u, .8, .5), 22) + check(560, 180, 1.2, at(u, 1.2, .4), OLIVE); });
// «ولما يتحرق، الجسم بيبقى مفتوح.»
shot([5, 2], fly([320, 420, 1], [320, 400, 1.2], 1.8), function (u, d, t) { return skinCut(t, at(u, 0, .8)) + label(320, 395, 470, 250, "مفتوح", ORANGE, at(u, .8, .5), 30); });
// 6 · «فالمريض محتاج أوضة معقمة،»: a clean room: the bed behind glass, filtered air
function cleanRoom(t, k) { var s = bedScene(t); s += '<rect x="20" y="180" width="600" height="460" fill="#d7e6ec" opacity=".25" stroke="' + BLUE + '" stroke-width="4" stroke-dasharray="14 8"/>'; for (var i = 0; i < 4; i++) { var p = (t * .4 + i / 4) % 1; s += arrow(120 + i * 130, 190 + p * 120, 120 + i * 130, 220 + p * 120, BLUE, 3, 1); } return s + R(250, 150, 140, 30, "#c6c3bb", 2) + tag("معقمة", 320, 120, k, 32, BLUE); }
shot(6, still(330, 420, 1), function (u, d, t) { return cleanRoom(t, at(u, .2, .4)); });
// «وغيار على الجرح كل يوم،»: gauze winding round a forearm
function forearmD(k, t) {
  var sk = PERSON.colors.skin, s = paper() + R(-120, 380, 80, 140, "#cfe0ee", 2.4) + '<path d="M-44 392 C40 388 200 398 334 399 L334 461 C200 470 40 500 -44 506 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.6"/>' + PERSON.hand([326, 430], 0, "relaxed", 1, 4.6, PERSON.colors, false);
  var n = Math.floor(k * 9); for (var i = 0; i < n; i++) s += P("M" + (20 + i * 30) + " 392 L" + (46 + i * 30) + " 390 L" + (52 + i * 30) + " 500 L" + (26 + i * 30) + " 504 Z", GAUZE, 1.6);
  if (k > 0 && k < 1) { var rx = 30 + k * 270; s += G("translate(" + f(rx) + " 360)", C(0, 0, 34, GAUZE, 2.4) + C(0, 0, 12, "#d6d2c6", 1.6)); }
  return s;
}
shot([6, 1], still(200, 430, 1.1), function (u, d, t) { return forearmD(clamp(u / 1.8), t) + tag("كل يوم", 220, 250, at(u, .3, .4), 30, ORANGE); });
// «وساعات عمليات ترقيع جلد.»: a patch of healthy skin moved from the thigh onto the burn
shot([6, 2], still(320, 400, 1), function (u, d, t) {
  var body = pf({ x: 320, y: 650 - 210 * 1.1, s: 1.1, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } }, face: { eyes: blink(t), brows: "worried" }, arms: [{ rel: [-30, 150], hand: "relaxed" }, { rel: [40, 140], hand: "relaxed" }] });
  var k = at(u, .3, 1.2), px = lerp(290, 400, k), py = lerp(520, 330, k);
  return paper() + floorL(650) + body + '<ellipse cx="400" cy="330" rx="22" ry="14" fill="' + CHAR + '" opacity=".75"/>' + R(px - 16, py - 10, 32, 20, "#e7a98f", 2, 4) + '<path d="M290 520 Q380 470 400 330" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="8 6" fill="none" opacity="' + f(at(u, 0, .3)) + '"/>' + label(290, 520, 150, 600, "جلد سليم", OLIVE, at(u, .1, .4), 22) + label(400, 330, 520, 230, "الحرق", ORANGE, at(u, .1, .4), 22);
});
// 7 · «وكل ده بيتكلف كتير… وبياخد شهور.»: coins piling up, the months turning
function coinStack(x, y, n) { var s = ""; for (var i = 0; i < n; i++) s += '<ellipse cx="' + x + '" cy="' + f(y - i * 12) + '" rx="46" ry="14" fill="#e2b93a" stroke="' + INK + '" stroke-width="2"/>'; return s; }
shot(7, still(320, 420, 1), function (u, d, t) { var k = clamp(u / 2.2), s = paper() + floorL(600); [180, 300, 420].forEach(function (x, i) { s += coinStack(x, 600, Math.floor(k * (8 + i * 6))); }); return s + G("", calendar(520, 260, Math.max(1, Math.floor(k * 6)), 1).replace(">يوم<", ">شهور<"), at(u, 1.4, .4)) + T("كتير", 300, 280, 44, ORANGE, 900); });
// 8 · «طب أتبرع فين؟»: your phone, a question mark
shot(8, still(320, 400, 1), function (u, d, t) { return paper() + handPhone(320, 420, 1.3, '<rect x="-60" y="-104" width="120" height="212" fill="#f4ecdb"/>' + T("؟", 0, 40, 110 * (pop(at(u, .1, .5)) || .01), ORANGE, 900), t); });
// 9 · «أول مكان: مستشفى 185 قصر العيني للحوادث والحروق…»: the hospital, the «185» on its front
function hospital(x, y, name, sign, o) {
  o = o || {}; var s = R(x - 220, y - 300, 440, 300, "#e9e3d4", 2.6) + R(x - 220, y - 320, 440, 26, "#c6c3bb", 2.4);
  for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) s += R(x - 196 + c * 66, y - 280 + r * 62, 44, 40, GLASS2, 1.6);
  s += R(x - 60, y - 70, 120, 70, GLASS2, 2.2) + '<path d="M' + x + ' ' + (y - 70) + ' V' + y + '" stroke="' + INK + '" stroke-width="1.6"/>';
  s += R(x - 150, y - 380, 300, 64, o.signCol || BLUE, 2.4, 6) + T(sign, x, y - 336, 36, "#fff", 900);
  s += R(x + 150, y - 382, 50, 50, "#fff", 2, 4) + '<path d="M' + (x + 175) + ' ' + (y - 372) + ' V' + (y - 342) + ' M' + (x + 160) + ' ' + (y - 357) + ' H' + (x + 190) + '" stroke="' + RED + '" stroke-width="9"/>';
  return s + T(name, x, y + 50, 26, INK, 800);
}
shot(9, still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "قصر العيني · جامعة القاهرة", "مستشفى 185", { signCol: "#8a2f5c" }) + T("للحوادث والحروق", 320, 200, 28, "#8a2f5c", 800); });
shot([9, 2], still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "قصر العيني · جامعة القاهرة", "مستشفى 185", { signCol: "#8a2f5c" }) + T("للحوادث والحروق", 320, 200, 28, "#8a2f5c", 800) + tag("حكومي", 320, 130, at(u, .2, .4), 40, OLIVE) + check(450, 120, 1.1, at(u, .5, .4), OLIVE); });
// 10 · the three ways, each number on its own card (from the committee's official post)
function payCard(y, k, head, col, big, small) { k = pop(k); if (k <= 0) return ""; return G("translate(320 " + f(y) + ") scale(" + f(k) + ")", R(-280, -70, 560, 140, "#f4ecdb", 2.4, 10) + R(-280, -70, 150, 140, col, 2.4, 10) + T(head, -205, 8, 22, "#fff", 900) + N(big, 70, -2, big.length > 12 ? 30 : 40, INK) + T(small, 70, 44, 17, MUTE, 700)); }
function payCards(u, n) { return paper() + payCard(180, n > 0 ? 1 : 0, "فودافون كاش", "#c93c2a", "*9*155#", "من موبايلك") + payCard(360, n > 1 ? 1 : 0, "فوري", "#e2a33a", "لجنة زكاة 185", "ابحث عن: القصر العيني") + payCard(540, n > 2 ? 1 : 0, "إنستاباي", "#5b3c8f", "01115010062322", "بنك القاهرة · لجنة زكاة مستشفى 185"); }
shot(10, still(320, 393, 1), function (u, d, t) { return payCards(u, 1); });
shot([10, 1], still(320, 393, 1), function (u, d, t) { return payCards(u, 2); });
shot([10, 2], still(320, 393, 1), function (u, d, t) { return payCards(u, 3); });
shot([10, 3], fly([320, 393, 1], [320, 393, .92], 1.6), function (u, d, t) { return payCards(u, 3) + T("بنك مصر: 1430001000008742", 320, 680, 22, INK, 800); });
// 11 · «تاني مكان: مستشفى أهل مصر للحروق… بيعالج الحروق ببلاش.»
shot(11, still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "مستشفى أهل مصر لعلاج الحروق", "أهل مصر", { signCol: "#3f8aa8" }); });
shot([11, 1], still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "مستشفى أهل مصر لعلاج الحروق", "أهل مصر", { signCol: "#3f8aa8" }) + tag("ببلاش", 320, 130, at(u, .1, .4), 44, OLIVE); });
// 12 · «كلمهم على الخط الساخن…»: 16863 · «ومندوب يوصلك لحد باب البيت.»: the courier at your door
shot(12, still(320, 400, 1), function (u, d, t) { var s = paper(); s += handPhone(320, 440, 1.2, '<rect x="-60" y="-104" width="120" height="212" fill="#dfe7e2"/>' + N("16863", 0, -30, 30, INK) + T("أهل مصر", 0, 0, 14, "#3f8aa8", 800) + C(0, 60, 22 + 2 * Math.sin(t * 8), GREEN, 2), t); return s + numBox("16863", 320, 150, at(u, .2, .4), 46, true); });
function door(x, y) { return R(x - 80, y - 260, 160, 260, "#a9784d", 2.6) + R(x - 64, y - 244, 128, 110, "#b98a5e", 1.6) + R(x - 64, y - 120, 128, 110, "#b98a5e", 1.6) + C(x + 58, y - 130, 7, "#e2b93a", 1.6) + R(x - 100, y - 280, 200, 20, "#c6c3bb", 2); }
shot([12, 1], still(330, 410, 1), function (u, d, t) {
  var w = PERSON.walkPose(t * 5, clamp(1 - u / 1.2)), po = { x: lerp(560, 400, ease(clamp(u / 1.2))), s: .95, dir: -1, legs: w.legs, arms: [{ sh: 40, el: 60, hand: "fist" }, w.arms[1]], face: { eyes: blink(t), mouth: "smile" }, outfit: { base: "casual", colors: { shirt: "#3f8aa8", shirtD: "#2f6a84" } } }; po.y = PERSON.sideHipY(po, 640);
  return paper() + floorL(640) + R(-200, 280, 400, 360, "#e9e3d4", 2.4) + door(180, 640) + ps(po) + R(po.x - 70, 520, 56, 40, "#c9a77c", 2, 4) + tag("لحد باب البيت", 320, 170, at(u, .6, .4), 30, "#3f8aa8");
});
// 13 · «وأي مبلغ… حتى لو صغير… بيفرق.»: one small coin drops into a jar that fills
shot(13, still(320, 420, 1), function (u, d, t) {
  var k = clamp(u / 2.4), s = paper() + floorL(640) + P("M200 300 L200 600 Q200 640 240 640 L400 640 Q440 640 440 600 L440 300 Z", "#d7e6ec", 3) + R(190, 280, 260, 26, "#c6c3bb", 2.4, 6);
  for (var i = 0; i < Math.floor(k * 24); i++) s += '<ellipse cx="' + f(240 + (i % 5) * 40) + '" cy="' + f(620 - Math.floor(i / 5) * 18) + '" rx="20" ry="7" fill="#e2b93a" stroke="' + INK + '" stroke-width="1.6"/>';
  var p = (u * 1.2) % 1; s += '<ellipse cx="320" cy="' + f(160 + p * 400) + '" rx="22" ry="22" fill="#e2b93a" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - p * .5) + '"/>';
  return s + tag("بيفرق", 320, 180, at(u, 1.6, .4), 40, ORANGE);
});
// 14 · «طب والدم؟»: a blood bag
function bloodBag(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", P("M-50 -80 L50 -80 Q60 -80 60 -70 L60 60 Q60 80 40 80 L-40 80 Q-60 80 -60 60 L-60 -70 Q-60 -80 -50 -80 Z", "#b8402f", 2.6) + R(-34, -50, 68, 40, "#f4ecdb", 1.6) + T("O+", 0, -22, 18, INK, 800) + R(-6, -110, 12, 30, "#c6c3bb", 1.6)); }
shot(14, still(320, 400, 1), function (u, d, t) { return paper() + bloodBag(320, 430, 1.6) + T("؟", 480, 300, 120 * (pop(at(u, .1, .5)) || .01), ORANGE, 900); });
// 15 · «وزارة الصحة قالت إن الدم موجود ومكفّي كل المصابين…»: a full fridge of bags, a check
shot(15, still(320, 400, 1), function (u, d, t) { var s = paper() + R(120, 180, 400, 460, "#e9e3d4", 3, 8) + R(140, 200, 360, 420, "#dfe7e2", 2); for (var r = 0; r < 3; r++) { s += R(140, 330 + r * 130, 360, 8, "#8d887e", 1.4); for (var c = 0; c < 4; c++) s += bloodBag(185 + c * 90, 270 + r * 130, .5); } return s + tag("وزارة الصحة", 320, 130, at(u, .1, .4), 30, BLUE) + check(540, 160, 1.3, at(u, .6, .4), OLIVE); });
shot([15, 2], still(320, 400, 1), function (u, d, t) { var s = paper() + bloodBag(320, 420, 1.4) + tag("حملات تبرع بالدم", 320, 160, 1, 30) + cross(320, 160, 2.4, at(u, .3, .5)); return s + tag("مش محتاجين دلوقتي", 320, 640, at(u, .6, .4), 30, OLIVE); });
// 16 · «وخلي بالك من النصابين…»: two pages, a fake one ✗ and the official one ✓
function page(x, y, title, official) { var s = R(x - 120, y - 170, 240, 340, "#fff", 2.4, 10) + R(x - 120, y - 170, 240, 50, official ? "#3f6ab0" : "#8d887e", 2.4, 10) + T(title, x, y - 138, 18, "#fff", 800); for (var i = 0; i < 5; i++) s += R(x - 96, y - 90 + i * 40, 192 - (i % 2) * 50, 12, "#d6d2c6", 0, 4); if (official) s += C(x + 92, y - 145, 14, "#3f9ae0", 2) + '<path d="M' + (x + 85) + ' ' + (y - 145) + ' l5 6 l9 -11" stroke="#fff" stroke-width="3" fill="none"/>'; return s; }
shot(16, still(320, 400, 1), function (u, d, t) { return paper() + page(180, 420, "تبرع هنا!!", false) + page(460, 420, "الصفحة الرسمية", true) + cross(180, 420, 2.4, at(u, .6, .5)) + check(460, 640, 1.4, at(u, 1.4, .4), OLIVE); });
// 17 · «يعني من الآخر…»: the two hospitals side by side
function miniHosp(x, y, sign, col, line1, line2, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", R(-140, -200, 280, 400, "#f4ecdb", 2.6, 10) + R(-110, -170, 220, 50, col, 2, 6) + T(sign, 0, -136, 24, "#fff", 900) + R(-90, -100, 180, 120, "#e9e3d4", 2) + R(-70, -80, 40, 30, GLASS2, 1.4) + R(30, -80, 40, 30, GLASS2, 1.4) + R(-20, -40, 40, 60, GLASS2, 1.6) + N(line1, 0, 80, 28, INK) + T(line2, 0, 130, 18, MUTE, 700)); }
shot(17, still(320, 400, 1), function (u, d, t) { return paper() + miniHosp(170, 400, "مستشفى 185", "#8a2f5c", "*9*155#", "فودافون كاش · فوري · إنستاباي", at(u, .2, .4)) + miniHosp(470, 400, "أهل مصر", "#3f8aa8", "16863", "مندوب لحد البيت", at(u, 1.2, .4)); });

// ── the end card: a hand on the hospital's heart, quiet ──
SCENE.outro = function (svg, u, t) { return '<rect width="600" height="280" fill="' + PAPER + '"/>' + G("translate(300 150) scale(1.5)", P("M0 40 C-80 -14 -54 -80 0 -40 C54 -80 80 -14 0 40 Z", ORANGE, 3)) + '<path d="M300 100 V180 M260 140 H340" stroke="#fff" stroke-width="12" stroke-linecap="round"/>' + T("مستشفى 185", 120, 250, 22, "#8a2f5c", 900) + T("أهل مصر", 480, 250, 22, "#3f8aa8", 900); };
