window.CHUNKS = [[0.0, 0.5122], [0.0, 0.5], [0.0], [0.0, 0.4194], [0.0, 0.5636], [0.0, 0.7647], [0.0, 0.4154], [0.0, 0.3684], [0.0, 0.5846], [0.0, 0.5606], [0.0, 0.2759, 0.7241], [0.0, 0.5926], [0.0], [0.0, 0.5185], [0.0, 0.4545, 0.5909, 0.8636], [0.0], [0.0, 0.619], [0.0, 0.4928], [0.0, 0.1864, 0.5254], [0.0, 0.4684, 0.7975], [0.0, 0.5676], [0.0, 0.5208], [0.0, 0.3704], [0.0, 0.1705, 0.5568, 0.7955], [0.0, 0.4815, 0.8272], [0.0], [0.0]];
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
window.SCENE.panel = function (A, B, t) {
  CLIPN = 0; var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++;
  function render(k, extraZ, op) {
    var sh = SH[k], next = k + 1 < SH.length ? SH[k + 1].a : window.TIMING.duration + 2, u = t - sh.a, d = Math.max(0.6, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 7 * Math.sin(t * 0.9), cy = c[1] + 6 * Math.cos(t * 0.8), z = c[2] * (1 + 0.015 * Math.sin(t * 0.7)) * extraZ;
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

// ── «إزاي بيحصل المد والجزر؟» — drawings. Shapes follow the «طب إزاي؟» reference (sheet v14) and real references
// (refs/SOURCES.md): globes are projected from real coastlines (Natural Earth 110m via ../../lib/geo.min.js);
// the beach is an isometric cut-away block with a sloping sand bed, a wooden pier on posts and a tide staff.

// ── isometric beach ──
var SAND_TOP = "#e6d3a3", SAND_SIDE = "#d2b77e", STRATA = "#bfa168", WET = "#cbb58a", WOOD = "#a9784d", WOOD_D = "#7c5434",
    SEA_TOP = "#9fb7c3", SEA_SIDE = "#6f8ea2", OCEAN = "#b9c9cc", LAND = "#a7ad6c", MOONC = "#d3cdbf";
function zs(x) { return 48 - 0.23 * x; }   // sand surface height along the shore normal (x: land 0 → sea 620)
function isoP(o, x, y, z) { return [o.ox + (x - y) * 0.866 * o.s, o.oy + (x + y) * 0.5 * o.s - z * o.s]; }
function ipoly(o, pts, fill, sw, ex) { return '<path d="' + pts.map(function (p, i) { var q = isoP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.6 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function iline(o, a, b, col, w, ex) { var p = isoP(o, a[0], a[1], a[2]), q = isoP(o, b[0], b[1], b[2]); return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 1.4) + '" fill="none"' + (ex || "") + '/>'; }
function ibox(o, x, y, z0, z1, w, d, fillT, fillL, fillR) {   // an upright box (post) footprint w×d at (x,y) from z0 to z1
  if (z1 <= z0) return "";
  return ipoly(o, [[x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1]], fillL || WOOD_D, 1.2) +
         ipoly(o, [[x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x + w, y, z1]], fillR || WOOD, 1.2) +
         ipoly(o, [[x, y, z1], [x + w, y, z1], [x + w, y + d, z1], [x, y + d, z1]], fillT || "#c69a6c", 1.2);
}
var PX = [150, 220, 290, 360, 430, 500, 570], PY = [118, 158];
// the whole beach. zw = water level (-48 low … +18 high), t = time (waves), o = {ox, oy, s}, opt: {boat, staffHi, umbrella}
function beach(o, zw, t, opt) {
  opt = opt || {}; var s = "", B = -150, X1 = 620, Y1 = 280, xw = Math.max(0, Math.min(X1, (48 - zw) / 0.23));
  // sand block: top, front cut face with strata, sea-side face
  s += ipoly(o, [[0, 0, zs(0)], [X1, 0, zs(X1)], [X1, Y1, zs(X1)], [0, Y1, zs(0)]], SAND_TOP, 1.8);
  var hiX = (48 - 18) / 0.23;   // the high-water line: wet, darker sand below it
  if (xw > hiX) s += ipoly(o, [[hiX, 0, zs(hiX)], [xw, 0, zs(xw)], [xw, Y1, zs(xw)], [hiX, Y1, zs(hiX)]], WET, 0);
  var front = [], k; for (k = 0; k <= 12; k++) front.push([X1 * k / 12, 0, zs(X1 * k / 12)]);
  s += ipoly(o, front.concat([[X1, 0, B], [0, 0, B]]), SAND_SIDE, 1.8);
  [-26, -58, -96].forEach(function (dz, j) { var pts = []; for (k = 0; k <= 12; k++) pts.push([X1 * k / 12, 0, Math.max(B + 8, zs(X1 * k / 12) + dz)]);
    s += '<path d="' + pts.map(function (p, i) { var q = isoP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + '" stroke="' + STRATA + '" stroke-width="' + (2.2 - j * .4) + '" fill="none" stroke-dasharray="' + (j ? "6 5" : "none") + '"/>'; });
  s += ipoly(o, [[X1, 0, zs(X1)], [X1, Y1, zs(X1)], [X1, Y1, B], [X1, 0, B]], STRATA, 1.8) + G("", ipoly(o, [[X1, 0, zs(X1)], [X1, Y1, zs(X1)], [X1, Y1, B], [X1, 0, B]], "url(#hatch)", 0), 1);
  // umbrella and towel on the dry sand
  if (opt.umbrella !== false) {
    s += ipoly(o, [[40, 150, zs(40) + .5], [100, 150, zs(100) + .5], [100, 190, zs(100) + .5], [40, 190, zs(40) + .5]], "#c96a4a", 1.2);
    var u0 = isoP(o, 70, 90, zs(70)), u1 = isoP(o, 70, 90, zs(70) + 80);
    s += '<path d="M' + f(u0[0]) + ' ' + f(u0[1]) + ' L' + f(u1[0]) + ' ' + f(u1[1]) + '" stroke="' + INK + '" stroke-width="' + f(2.4 * o.s) + '"/>';
    s += '<path d="M' + f(u1[0] - 46 * o.s) + ' ' + f(u1[1] + 18 * o.s) + ' Q' + f(u1[0]) + ' ' + f(u1[1] - 26 * o.s) + ' ' + f(u1[0] + 46 * o.s) + ' ' + f(u1[1] + 18 * o.s) + ' Z" fill="#e9e1cc" stroke="' + INK + '" stroke-width="1.6"/>' +
         '<path d="M' + f(u1[0] - 15 * o.s) + ' ' + f(u1[1] + 16 * o.s) + ' Q' + f(u1[0]) + ' ' + f(u1[1] - 22 * o.s) + ' ' + f(u1[0] + 15 * o.s) + ' ' + f(u1[1] + 16 * o.s) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2"/>';
  }
  // pier posts: the part under water first (the sea is drawn over it)
  var posts = function (under) { var r = ""; PY.forEach(function (py) { PX.forEach(function (px) { var z0 = zs(px) - 10, top = 58;
    r += under ? ibox(o, px, py, z0, Math.min(top, zw), 9, 9) : ibox(o, px, py, Math.max(z0, zw), top, 9, 9); }); }); return r; };
  s += posts(true);
  // the sea: top, front cut face, sea-side face, waves running to the shore and a foam line
  if (xw < X1) {
    var wf = [[xw, 0, zw], [X1, 0, zw], [X1, 0, zs(X1)]]; for (k = 12; k >= 0; k--) { var xx = xw + (X1 - xw) * k / 12; wf.push([xx, 0, zs(xx)]); }
    s += '<g opacity=".93">' + ipoly(o, wf, SEA_SIDE, 1.8) + ipoly(o, [[X1, 0, zw], [X1, Y1, zw], [X1, Y1, zs(X1)], [X1, 0, zs(X1)]], "#5d7c90", 1.8) +
         ipoly(o, [[xw, 0, zw], [X1, 0, zw], [X1, Y1, zw], [xw, Y1, zw]], SEA_TOP, 1.8) + '</g>';
    if (!opt.calm) for (k = 0; k < 6; k++) { var wx = X1 - ((k * 64 + t * 22) % Math.max(60, X1 - xw - 10)); if (wx < xw + 8) continue;
      for (var yy = 18; yy < Y1 - 30; yy += 64) s += iline(o, [wx, yy + (k % 2) * 30, zw], [wx, yy + 30 + (k % 2) * 30, zw], "#e8eef0", 2.2, ' stroke-linecap="round"'); }
    s += iline(o, [xw + 3, 4, zw], [xw + 3, Y1 - 4, zw], "#f6f3ea", 3, ' stroke-linecap="round"');
  }
  s += posts(false);
  // deck: planks across the posts
  s += ipoly(o, [[130, 110, 58], [X1 - 10, 110, 58], [X1 - 10, 176, 58], [130, 176, 58]], "#c69a6c", 1.8) + ipoly(o, [[130, 176, 58], [X1 - 10, 176, 58], [X1 - 10, 176, 50], [130, 176, 50]], WOOD_D, 1.4);
  for (k = 150; k < X1 - 10; k += 22) s += iline(o, [k, 110, 58], [k, 176, 58], WOOD_D, 1);
  // tide staff on the sea-end post: white board, red marks every 10, the waterline crossing it
  var sx = 545, sy = 178;
  s += ipoly(o, [[sx, sy, -60], [sx + 16, sy, -60], [sx + 16, sy, 52], [sx, sy, 52]], "#f4efe3", 1.4);
  for (k = -60; k < 50; k += 10) s += ipoly(o, [[sx, sy, k], [sx + (k % 20 ? 8 : 16), sy, k], [sx + (k % 20 ? 8 : 16), sy, k + 3], [sx, sy, k + 3]], k >= -10 && opt.staffHi ? ORANGE : INK, 0);
  // the boat: sits on the sand at low water, floats at high water
  if (opt.boat !== false) {
    var bx = 300, bz = Math.max(zs(bx + 40) + 6, zw + 4), tilt = zw + 4 < zs(bx + 40) + 6 ? 0.18 : 0.04 * Math.sin(t * 1.6);
    var hull = [[bx, 40, bz + 10], [bx + 90, 40, bz + 10 + tilt * 40], [bx + 76, 40, bz - 4 + tilt * 30], [bx + 10, 40, bz - 4]];
    s += ipoly(o, [[bx, 40, bz + 10], [bx + 90, 40, bz + 10 + tilt * 40], [bx + 90, 78, bz + 10 + tilt * 40], [bx, 78, bz + 10]], "#5a4636", 1.6) +
         ipoly(o, [[bx + 8, 46, bz + 10], [bx + 82, 46, bz + 10 + tilt * 36], [bx + 82, 72, bz + 10 + tilt * 36], [bx + 8, 72, bz + 10]], "#8a6a4c", 1) +
         ipoly(o, hull.map(function (p) { return [p[0], 78, p[2]]; }), "#3f6a7e", 1.6) + ipoly(o, [[bx + 10, 78, bz + 4], [bx + 80, 78, bz + 4 + tilt * 34], [bx + 80, 78, bz + 7 + tilt * 36], [bx + 10, 78, bz + 7]], "#e7e1d1", 0);
  }
  return s;
}
// the water level that a beach at angle a (radians from the Earth–Moon line) sees: high on both bulges, low at the sides
function levelAt(a) { return lerp(-46, 16, (Math.cos(2 * a) + 1) / 2); }

// ── globes, moon, sun, bulges ──
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
function moon(x, y, r) {
  var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + MOONC + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1.4, r * .06)) + '"/>';
  [[-.35, -.3, .2], [.25, -.1, .14], [-.05, .35, .17], [.4, .38, .1], [-.45, .2, .09]].forEach(function (c) { s += '<circle cx="' + f(x + c[0] * r) + '" cy="' + f(y + c[1] * r) + '" r="' + f(c[2] * r) + '" fill="#bfb8a8" stroke="' + INK + '" stroke-width="' + f(Math.max(.8, r * .03)) + '"/>'; });
  return s + '<path d="M' + f(x + r * .2) + ' ' + f(y - r * .98) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * .2) + ' ' + f(y + r * .98) + ' A' + f(r * .8) + ' ' + f(r) + ' 0 0 0 ' + f(x + r * .2) + ' ' + f(y - r * .98) + ' Z" fill="url(#hatch)"/>';
}
function sun(x, y, r, t) {
  var s = "", k; for (k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2 + t * .15, r1 = r * 1.12, r2 = r * (k % 2 ? 1.3 : 1.45); s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>'; }
  return s + C(x, y, r, "#d98a4a", 2.4) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .78) + '" fill="#e2a062"/>';
}
// the water bulge: an ellipse round the globe stretched along angle ang (deg); k 0..1 how much
function bulge(cx, cy, r, k, ang, col) { return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * (1.04 + .42 * k)) + '" ry="' + f(r * (1.04 + .03 * k)) + '" transform="rotate(' + f(ang || 0) + ' ' + f(cx) + ' ' + f(cy) + ')" fill="' + (col || "#5f7f97") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
// a dimension line with end ticks that draws itself, and its value in serif under it
function measure(x1, y1, x2, y2, k, text, sz) {
  k = clamp(k); if (k <= 0) return ""; var a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 9, ny = Math.cos(a) * 9;
  var s = draw("M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2), k, INK, 2.2) + '<path d="M' + f(x1 - nx) + ' ' + f(y1 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  if (k > .95) s += '<path d="M' + f(x2 - nx) + ' ' + f(y2 - ny) + ' l' + f(2 * nx) + ' ' + f(2 * ny) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  return s + (text ? '<g opacity="' + f(clamp(k * 2 - 1)) + '">' + N(text, (x1 + x2) / 2, (y1 + y2) / 2 + (sz || 40) * 1.2, sz || 40) + '</g>' : "");
}
// three balls on an isometric strip toward the Moon (reference v14): positions p[] (0..1 along), colours, pull arrows
function track(t, k, cols, offs, arrows, labels) {
  var x0 = 70, y0 = 520, x1 = 470, y1 = 330, s = "";
  s += '<path d="M' + (x0 - 40) + ' ' + (y0 + 40) + ' L' + (x1 + 40) + ' ' + (y1 + 10) + ' L' + (x1 + 70) + ' ' + (y1 + 50) + ' L' + (x0 - 10) + ' ' + (y0 + 80) + ' Z" fill="#e6dcc5" stroke="' + INK + '" stroke-width="1.2" opacity=".9"/>';
  for (var g = 0; g <= 10; g++) { var u = g / 10; s += '<path d="M' + f(lerp(x0 - 40, x1 + 40, u)) + ' ' + f(lerp(y0 + 40, y1 + 10, u)) + ' l30 40" stroke="#cdbf9f" stroke-width="1"/>'; }
  s += moon(565, 260, 38);
  [0.12, 0.4, 0.68].forEach(function (p, i) {
    var q = clamp(p + (offs ? offs[i] : 0)), x = lerp(x0, x1, q), y = lerp(y0, y1, q) - 6;
    s += appear(at(k, i * .25, .3), '<ellipse cx="' + f(x + 6) + '" cy="' + f(y + 26) + '" rx="36" ry="11" fill="' + INK + '" opacity=".15"/>' + C(x, y, 36, cols[i], 2.4) + '<circle cx="' + f(x - 11) + '" cy="' + f(y - 12) + '" r="9" fill="#fff" opacity=".45"/>');
    if (arrows) s += arrow(x + 30, y - 22, x + 30 + arrows[i] * .8, y - 22 - arrows[i] * .48, ORANGE, 5, at(k, .8 + i * .2, .4));
    if (labels && labels[i]) s += label(x, y + 30, x + 50, y + 110, labels[i], cols[i] === OCEAN ? BLUE : OLIVE, at(k, 1 + i * .3, .5), 22);
  });
  return s;
}
var ALEX = [29.9, 31.2];   // the viewer's beach (Alexandria)
function tag(text, x, y, k, sz, col) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 30; var w = text.length * sz * .55 + 34; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * 1.05) + '" width="' + f(w) + '" height="' + f(sz * 1.65) + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(text, 0, sz * .3, sz, col || INK, 800)); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · the Moon, 384,000 km away: Africa-facing globe on the left, the Moon on the right, the distance draws itself
shot(4, push(330, 400, 1.08, 0.96), function (u, d, t) {
  var k = at(u, .6, 1.4);
  return paper() + appear(at(u, 0, .4), globe(120, 400, 190, 12 + t * .35, 8)) + appear(at(u, .3, .4), moon(560, 400, 44)) +
    measure(320, 470, 515, 470, k, "", 0) + G("", N(count(384000, k), 420, 540, 44) + T("كيلو", 420, 582, 26, INK, 700), clamp(k * 3)) + label(560, 360, 520, 280, "القمر", OLIVE, at(u, .4, .5), 24);
});
// 5 · «قاعدة صغيرة»: a pinned rule card over the Moon and an empty strip
shot(5, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + track(t, -1, [GREY, GREY, GREY]) + G("", '<rect x="150" y="150" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 225)"/>' +
    T("القريب", 320, 212, 40, ORANGE, 800) + T("بيتشد أكتر", 320, 262, 34, INK, 700) + C(320, 158, 9, ORANGE, 2), at(u, .3, .4));
});
// 6 · gravity weakens with distance: three balls, the pull arrows get shorter the farther they are
shot(6, push(320, 430, 1.05, 0.98), function (u, d, t) { return paper() + track(t, u, [GREY, GREY, GREY], null, [60, 95, 140]); });
// 7 · the Earth is big: 12,742 km across
shot(7, push(320, 380, 0.95, 1.05), function (u, d, t) {
  var k = at(u, .4, 1.2);
  return paper() + globe(320, 360, 215, 12 + t * .35, 8) + measure(105, 640, 535, 640, k, "") + G("", N(count(12742, k), 320, 712, 46) + T("كيلو", 320, 750, 24, INK, 700), clamp(k * 3));
});
// 8 · near water (blue) is closer → pulled more than the Earth (green)
shot(8, push(330, 420, 1.0, 1.08), function (u, d, t) { return paper() + track(t, u + 1, [OCEAN, LAND, GREY], null, [140, 95, 0], ["البحر اللي قدام", "الأرض", ""]); }, { tr: "in" });
// 9 · far water is pulled least and lags: the three drift apart
shot(9, push(330, 420, 1.08, 1.0), function (u, d, t) {
  var k = at(u, .3, d - .6); return paper() + track(t, 9, [OCEAN, LAND, OCEAN], [.08 * k, .03 * k, -.02 * k], [140, 95, 60], ["", "", "البحر اللي ورا"]);
});
// 10 · the result: the water stretches both ways (a bulge round the globe); thumbnail: a long watermelon
shot(10, push(330, 400, 0.9, 1.02), function (u, d, t) {
  var k = at(u, .3, 1.4); return paper() + bulge(300, 400, 200, k, 0) + globe(300, 400, 200, 12 + t * .35, 8) + moon(600, 400, 30) +
    iconBox(80, 90, 120, '<ellipse rx="44" ry="26" fill="#6f8a4a" stroke="' + INK + '" stroke-width="2"/><path d="M-40 -6 Q0 -22 40 -6 M-42 6 Q0 -6 42 6" stroke="#3f5a2a" stroke-width="4" fill="none"/>', at(u, 1, .3));
}, { tr: "out" });
// 11 · two bulges: one facing the Moon, one on the back
shot(11, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + bulge(300, 400, 200, 1, 0) + globe(300, 400, 200, 12 + t * .35, 8) + moon(605, 400, 30) +
    label(530, 330, 470, 190, "انتفاخ", BLUE, at(u, .3, .5), 26) + label(40, 420, 90, 620, "انتفاخ تاني", BLUE, at(u, 1.1, .5), 26);
});
// 12 · «طب ليه البحر عندك بيعلى وينزل؟»: back to the beach, the staff, a question mark
shot(12, push(330, 430, 1.1, 1.0), function (u, d, t) { return paper() + beach({ ox: 250, oy: 300, s: .62 }, lerp(-30, 12, (Math.sin(t * 1.4) + 1) / 2), t, { staffHi: true }) + T("؟", 500, 250, 130, ORANGE, 800); }, { tr: "out" });
// 13–15 · seen from above the North Pole: the Earth turns inside the two bulges; the dot is your beach
function polar(u, t, op) {
  op = op || {}; var spin = op.spin == null ? t * 22 : op.spin, cx = op.cx || 290, cy = op.cy || 400, r = op.r || 175;
  var s = bulge(cx, cy, r, op.k == null ? 1 : op.k, op.ang || 0) + globe(cx, cy, r, -spin, 72, { dot: op.noDot ? null : ALEX }) + (op.noMoon ? "" : moon(op.mx || 600, op.my || cy, 30));
  return s;
}
function beachAngle(spin) { var p = GEO.globe(290, 400, 175, -spin, 72).project(ALEX); return p ? Math.atan2(p[1] - 400, p[0] - 290) : 0; }
shot(13, push(300, 400, 0.95, 1.05), function (u, d, t) {
  return paper() + polar(u, t) + draw("M150 170 A190 190 0 0 1 430 170", at(u, .3, .8), ORANGE, 5) + arrow(420, 160, 440, 185, ORANGE, 5, at(u, 1, .2));
});
shot(14, push(300, 420, 1.05, 1.0), function (u, d, t) {
  var a = beachAngle(t * 22), lv = levelAt(a), hi = lv > -15;
  return paper() + polar(u, t) + iconBox(450, 190, 250, G("translate(-125 -125)", beach({ ox: 82, oy: 48, s: .29 }, lv, t, { umbrella: false })), at(u, .2, .3)) +
    tag(hi ? "مد" : "جزر", 450, 360, at(u, .4, .3), 36, hi ? BLUE : ORANGE);
});
// 15 · twice a day each: a 24-hour dial with the four tides round it
hud(15, 16, function (u, t) {
  var s = '<circle cx="530" cy="110" r="78" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  ["مد", "جزر", "مد", "جزر"].forEach(function (w, i) { var a = -Math.PI / 2 + i * Math.PI / 2, x = 530 + Math.cos(a) * 52, y = 110 + Math.sin(a) * 52; s += G("", T(w, x, y + 9, 22, i % 2 ? ORANGE : BLUE, 800), at(u, .2 + i * .25, .25)); });
  var h = u * 1.4; return s + '<path d="M530 110 L' + f(530 + Math.cos(h - Math.PI / 2) * 34) + ' ' + f(110 + Math.sin(h - Math.PI / 2) * 34) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(530, 110, 5, INK, 0) + T("24 ساعة", 530, 222, 22, INK, 700);
});
shot(15, push(300, 420, 1.0, 0.95), function (u, d, t) { return paper() + polar(u, t, { cx: 260 }); });
// 16 · every day the tide comes about 50 minutes later: a clock whose hand runs on past the hour
shot(16, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var k = at(u, .5, 1.6), a = -Math.PI / 2 + k * (50 / 60) * Math.PI * 2, s = paper();
  s += C(320, 380, 190, "#f4ecdb", 3) + C(320, 380, 176, "none", 1.2);
  for (var i = 0; i < 60; i++) { var b = i / 60 * Math.PI * 2, r1 = i % 5 ? 166 : 154; s += '<path d="M' + f(320 + Math.cos(b) * r1) + ' ' + f(380 + Math.sin(b) * r1) + ' L' + f(320 + Math.cos(b) * 174) + ' ' + f(380 + Math.sin(b) * 174) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 1.4 : 3) + '"/>'; }
  s += '<path d="M320 380 L' + f(320 + 160 * Math.cos(-Math.PI / 2)) + ' ' + f(380 + 160 * Math.sin(-Math.PI / 2)) + ' A160 160 0 ' + (k * 50 / 60 > .5 ? 1 : 0) + ' 1 ' + f(320 + 160 * Math.cos(a)) + ' ' + f(380 + 160 * Math.sin(a)) + ' Z" fill="' + ORANGE + '" opacity=".25"/>';
  s += '<path d="M320 380 L' + f(320 + Math.cos(a) * 150) + ' ' + f(380 + Math.sin(a) * 150) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M320 380 L' + f(320 + Math.cos(-Math.PI / 2 + k * .44) * 95) + ' ' + f(380 + Math.sin(-Math.PI / 2 + k * .44) * 95) + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>' + C(320, 380, 9, INK, 0);
  return s + numBox("+" + count(50, k), 320, 640, at(u, .3, .3), 44) + G("", T("دقيقة", 320, 712, 30, INK, 800), at(u, .5, .3));
});
// 17 · because the Moon moves along its orbit, the Earth must turn a bit more to catch it (top view)
shot(17, push(320, 400, 0.92, 1.02), function (u, d, t) {
  var k = at(u, .3, d - .8), ma = -k * 0.42, s = paper();
  s += '<circle cx="250" cy="400" r="300" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>';
  s += G("", moon(250 + 300 * Math.cos(0), 400, 30), .35) + moon(250 + 300 * Math.cos(ma), 400 + 300 * Math.sin(ma), 30);
  s += polar(u, t, { cx: 250, r: 120, k: .6, ang: ma * 180 / Math.PI, noMoon: true, spin: k * 380 });
  s += draw("M" + f(250 + 150) + " 400 A150 150 0 0 0 " + f(250 + 150 * Math.cos(ma)) + " " + f(400 + 150 * Math.sin(ma)), k, ORANGE, 6);
  return s + label(250 + 300 * Math.cos(ma), 370 + 300 * Math.sin(ma), 460, 120, "القمر بيتحرك", OLIVE, at(u, .6, .5), 24);
});
// 18 · the Sun pulls too, about half as strongly
shot(18, push(330, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + sun(-40, 400, 170, t) + bulge(380, 400, 120, .45, 0, "#7a96aa") + globe(380, 400, 120, -t * 22, 72) + moon(600, 400, 24) +
    arrow(170, 400, 230, 400, ORANGE, 6, at(u, .5, .4)) + arrow(560, 400, 450, 400, ORANGE, 10, at(u, .3, .4)) + numBox("½", 250, 270, at(u, 1.1, .3), 54);
}, { tr: "out" });
// 19 · Sun, Earth and Moon in a line (new moon / full moon): the bulges add up, the tide is highest
shot(19, push(320, 400, 1.02, 0.96), function (u, d, t) {
  var k = at(u, .3, 1); return paper() + sun(-60, 400, 150, t) + bulge(360, 400, 120, lerp(.6, 1.35, k), 0) + globe(360, 400, 120, -t * 22, 72) + moon(590, 400, 26) +
    draw("M90 400 L620 400", at(u, .1, .6), ORANGE, 2.4, ' stroke-dasharray="10 8"') + iconBox(470, 130, 200, '<circle cx="-45" cy="-18" r="30" fill="#3d3a34" stroke="' + INK + '" stroke-width="2"/>' + moon(45, -18, 30) + T("محاق", -45, 50, 22, INK, 700) + T("بدر", 45, 50, 22, INK, 700) + T("أول الشهر · نصه", 0, 84, 18, MUTE, 600), at(u, .8, .3)) + tag("أعلى مد", 360, 650, at(u, 1.2, .3), 34, BLUE);
});
// 20 · at right angles: the Sun's pull fills the Moon's low tide, the bulge is weakest
shot(20, push(320, 420, 0.96, 1.04), function (u, d, t) {
  var k = at(u, .3, 1); return paper() + sun(-60, 420, 150, t) + bulge(360, 420, 120, .45, 0, "#7a96aa") + bulge(360, 420, 120, lerp(1, .55, k), 90) + globe(360, 420, 120, -t * 22, 72) + moon(360, 140, 26) +
    draw("M360 280 V170", at(u, .1, .5), ORANGE, 2.4, ' stroke-dasharray="10 8"') + draw("M220 420 H100", at(u, .1, .5), ORANGE, 2.4, ' stroke-dasharray="10 8"') + '<path d="M360 250 h-26 v26" stroke="' + ORANGE + '" stroke-width="2.4" fill="none" transform="translate(-150 144)"/>' + tag("أضعف مد", 360, 680, at(u, 1, .3), 34, BLUE);
});
// 21 · the myth: the Moon lifting only the water under it — crossed out
shot(21, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var k = at(u, .2, .7); return paper() + globe(280, 420, 180, 12 + t * .35, 8) + moon(590, 420, 30) + '<path d="M455 ' + f(420 - 70 * k) + ' Q' + f(500 + 30 * k) + ' 420 455 ' + f(420 + 70 * k) + ' Z" fill="#5f7f97" stroke="' + INK + '" stroke-width="2.2"/>' +
    arrow(470, 420, 545, 420, ORANGE, 6, k) + cross(500, 330, 1.5, at(u, d * .55, .5));
});
// 22 · it stretches the whole Earth; the water just shows it because it flows
shot(22, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.2); return paper() + bulge(300, 400, 190, k, 0) + '<ellipse cx="300" cy="400" rx="' + f(190 * (1 + .06 * k)) + '" ry="190" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 7"/>' + globe(300, 400, 190, 12 + t * .35, 8) + moon(605, 400, 28) +
    label(300 + 190 * (1 + .06 * k), 470, 470, 650, "الأرض نفسها", ORANGE, at(u, .8, .5), 24) + label(560, 360, 500, 210, "المية", BLUE, at(u, 1.3, .5), 24);
}, { tr: "in" });
// 23 · «يعني من الآخر»: everything at once, labelled
shot(23, push(300, 400, 0.94, 1.02), function (u, d, t) {
  return paper() + polar(u, t) + label(600, 370, 560, 250, "القمر", OLIVE, at(u, .2, .4), 24) + label(500, 420, 470, 600, "انتفاخ", BLUE, at(u, .8, .4), 24) + label(80, 420, 120, 620, "انتفاخ", BLUE, at(u, 1.3, .4), 24);
}, { tr: "out" });
// 24 · the odd fact: the bulge runs ahead, brakes the Earth and nudges the Moon away (about 4 cm a year)
shot(24, push(320, 400, 1.0, 0.94), function (u, d, t) {
  var k = at(u, .3, d - .6), mx = 520 + 70 * k;
  return paper() + bulge(260, 400, 160, 1, -14) + globe(260, 400, 160, -t * 22, 72) + moon(mx, 400, 28) + draw("M130 210 A190 190 0 0 1 390 210", 1, INK, 4) + arrow(380, 200, 400, 225, INK, 4) +
    measure(520, 470, mx, 470, k, "") + G("", N("~4 cm", (520 + mx) / 2, 530, 34, ORANGE) + T("كل سنة", (520 + mx) / 2, 570, 22, INK, 700), at(u, 1, .4)) + iconBox(110, 120, 110, '<rect x="-30" y="-20" width="60" height="40" rx="6" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + T("فرامل", 0, 8, 18, "#fff", 800), at(u, .6, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a calm beach. line 1: the sea comes in over the sand, then goes out again. line 2: no wind (a crossed-out wind sign)
  var l1 = LN[1], k = clamp((t - l1.start) / Math.max(1, l1.end - l1.start)), lv = li === 0 ? -30 : li === 1 ? lerp(-30, 16, Math.sin(k * Math.PI)) : -30;
  var s = beach({ ox: 196, oy: 150, s: .76 }, lv, t, { staffHi: true });
  if (li >= 1) s += iconBox(530, 70, 110, '<circle r="34" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 V-24 M0 0 L16 10" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + T("6 ساعات", 0, 52, 15, INK, 700), ease((t - l1.start) / .4));
  if (li >= 2) { var u = t - LN[2].start; s += G("translate(90 90)", '<path d="M-56 -22 H14 C34 -22 38 -46 22 -48 C10 -50 6 -40 10 -34 M-56 0 H34 C58 0 60 -28 40 -30 M-56 22 H4 C24 22 26 44 12 46 C2 47 -2 38 2 33" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>', ease(u / .3)) + cross(90, 90, 1.1, ease((u - .4) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  var s = '<rect x="0" y="120" width="180" height="80" fill="' + SEA_TOP + '"/>';
  for (var k = 0; k < 4; k++) s += '<path d="M' + f(-40 + ((k * 50 + t * 20) % 220)) + ' ' + (140 + k * 12) + ' q10 -6 20 0 t20 0" stroke="#e8eef0" stroke-width="2.5" fill="none"/>';
  return s + moon(110, 80, 26);
};
SCENE.outro = function (svg, u, t) {
  var p = GEO.globe(230, 140, 92, -t * 22, 72).project(ALEX);
  return bulge(230, 140, 92, 1, 0) + globe(230, 140, 92, -t * 22, 72, { dot: ALEX }) + moon(530, 140, 26) +
    callout("1", 530, 90, ease(u / .3)) + callout("2", 370, 110, ease(u / .3 - .5)) + callout("3", 80, 110, ease(u / .3 - 1)) + (p ? callout("4", p[0] + 22, p[1] - 22, ease(u / .3 - 1.5)) : "");
};
