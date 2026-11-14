// ── «الدهون بتروح فين لما بنخس؟» — drawings. Shapes follow real references (refs/SOURCES.md): fat tissue is a packed
// honeycomb of polygonal cells with the nucleus pressed flat against the wall (paraffin section, Blausen 0012); the lungs
// have three lobes on the body's right and two with the cardiac notch on its left, under a ringed trachea (Gray 972/973,
// Illu bronchi lungs); the torso places lungs, heart, kidneys and bladder as in «Surface projections of the organs of
// the trunk»; the muscle is a spindle of striped fibres in bundles (Blausen 0801); the mitochondrion is a bean with
// folded inner membrane. The drawing hand follows the «طب إزاي؟» sheets v17 (lungs) and v20 (body, skin cut).

var FAT = "#e6c877", FAT_L = "#f0dc9c", FAT_D = "#c9a653", WALL = "#d6a48c", LUNG = "#e4b8a8", LUNG_D = "#d29c8a", AIR = "#c3c79a",
    BLOOD = "#b8432f", BLOOD_L = "#d9735c", MUSC = "#b9563f", MUSC_L = "#cf7a60", TENDON = "#eee3cf", CARB = "#4d433a", HYD = "#f6f1e6", OXY = BLUE, WATER = "#8fb0c4";
function TAU(a) { return a * Math.PI / 180; }
// seconds from the start of line `l` to its caption chunk `j`
function cu(l, j) { return startOf([l, j]) - startOf(l); }

// ── molecules: C dark, H white, O slate blue ──
function atom(x, y, r, kind) { return C(x, y, r, kind === "C" ? CARB : kind === "H" ? HYD : OXY, Math.max(1, r * .13)) + '<circle cx="' + f(x - r * .3) + '" cy="' + f(y - r * .32) + '" r="' + f(r * .26) + '" fill="#fff" opacity="' + (kind === "H" ? .7 : .3) + '"/>'; }
function co2(x, y, s, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s || 1) + ")", '<path d="M-22 0 H22" stroke="' + INK + '" stroke-width="7"/>' + atom(-24, 0, 12, "O") + atom(24, 0, 12, "O") + atom(0, 0, 13, "C")); }
function h2o(x, y, s, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s || 1) + ")", '<path d="M-15 12 L0 0 L15 12" stroke="' + INK + '" stroke-width="5" fill="none"/>' + atom(-16, 13, 8, "H") + atom(16, 13, 8, "H") + atom(0, 0, 13, "O")); }
function o2(x, y, s, rot) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s || 1) + ")", '<path d="M-10 0 H10" stroke="' + INK + '" stroke-width="6"/>' + atom(-11, 0, 11, "O") + atom(11, 0, 11, "O")); }
// a fatty-acid token: a short zig-zag carbon chain with its acid head (what the cell releases into the blood)
function fa(x, y, s, rot, n) {
  n = n || 6; var d = "", a = "", i; for (i = 0; i < n; i++) { var px = -n * 5 + i * 10, py = i % 2 ? -4 : 4; d += (i ? " L" : "M") + px + " " + py; a += '<circle cx="' + px + '" cy="' + py + '" r="4.2" fill="' + CARB + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f(s || 1) + ")", '<path d="' + d + '" stroke="' + INK + '" stroke-width="3" fill="none"/>' + a + '<circle cx="' + (n * 5 + 3) + '" cy="0" r="5.4" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1"/>');
}
// a triglyceride: glycerol backbone (3 carbons) and three zig-zag tails with their hydrogens; k reveals it tail by tail
function trig(x, y, s, k, t) {
  var g = "", row, j;
  g += '<path d="M0 -92 V92" stroke="' + INK + '" stroke-width="6"/>';
  for (row = 0; row < 3; row++) {
    var y0 = (row - 1) * 92, kk = clamp(k * 3.4 - row * .7), n = Math.round(9 * kk), d = "M0 " + y0 + " L34 " + y0, hs = "", cs = "";
    for (j = 0; j < n; j++) { var px = 70 + j * 30, py = y0 + (j % 2 ? -11 : 11) + 1.6 * Math.sin(t * 2.4 + j * .8 + row); d += " L" + f(px) + " " + f(py);
      hs += '<path d="M' + f(px) + ' ' + f(py) + ' v' + (j % 2 ? -22 : 22) + '" stroke="' + INK + '" stroke-width="2.4"/>' + atom(px, py + (j % 2 ? -24 : 24), 6.5, "H"); cs += atom(px, py, 11, "C"); }
    g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linejoin="round"/>' + hs + cs + (kk > 0 ? atom(36, y0, 11, "O") : "") + atom(0, y0, 12, "C");
  }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", g);
}
function flame(x, y, s, t, ph) {
  var w = 1 + .07 * Math.sin(t * 9 + (ph || 0)), h = 1 + .1 * Math.sin(t * 12.3 + (ph || 0) * 2);
  var d = "M0 -42 C16 -20 28 -6 24 14 C21 31 9 40 0 40 C-9 40 -21 31 -24 14 C-27 -2 -12 -8 -10 -24 C-5 -17 -1 -24 0 -42 Z";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * w) + " " + f(s * h) + ")", '<path d="' + d + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><path d="' + d + '" fill="#e2a062" transform="translate(0 12) scale(.55)"/>');
}
function bolt(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M10 -34 L-16 4 L-3 4 L-10 34 L16 -6 L3 -6 Z" fill="' + (col || "#dfa23c") + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'); }
function drop(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M0 -18 C9 -4 13 3 13 9 A13 13 0 1 1 -13 9 C-13 3 -9 -4 0 -18 Z" fill="' + (col || WATER) + '" stroke="' + INK + '" stroke-width="2"/><path d="M-6 8 a7 7 0 0 0 5 8" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>'); }

// ── fat cells: rounded polygons packed like a honeycomb, nucleus flattened on the wall (real adipocyte shape) ──
function blob(cx, cy, r, seed, n) {
  n = n || 6; var p = [], i; for (i = 0; i < n; i++) { var a = (i + .5) / n * Math.PI * 2 + (hash(seed + i) - .5) * .35, rr = r * (1.0 + .16 * (hash(seed + i * 7 + 3) - .5)); p.push([cx + Math.cos(a) * rr * 1.12, cy + Math.sin(a) * rr * 1.12]); }
  var d = ""; for (i = 0; i < n; i++) { var a0 = p[i], b = p[(i + 1) % n], m = [(a0[0] + b[0]) / 2, (a0[1] + b[1]) / 2]; d += (i ? " Q" + f(a0[0]) + " " + f(a0[1]) + " " : "M" + f((p[n - 1][0] + a0[0]) / 2) + " " + f((p[n - 1][1] + a0[1]) / 2) + " Q" + f(a0[0]) + " " + f(a0[1]) + " ") + f(m[0]) + " " + f(m[1]); }
  return d + " Z";
}
// k = how full (1 full … 0 empty): the cell shrinks, it does not vanish
function fatCell(cx, cy, r, seed, k, sw) {
  k = k == null ? 1 : k; var rr = r * (.5 + .5 * k), na = hash(seed + 91) * Math.PI * 2, nx = cx + Math.cos(na) * rr * .82, ny = cy + Math.sin(na) * rr * .82;
  return '<path d="' + blob(cx, cy, rr, seed) + '" fill="' + FAT_L + '" stroke="' + INK + '" stroke-width="' + (sw || 2) + '" stroke-linejoin="round"/>' +
    '<path d="' + blob(cx, cy, rr * (.6 + .27 * k), seed) + '" fill="' + FAT + '"/>' +
    '<ellipse cx="' + f(cx - rr * .3) + '" cy="' + f(cy - rr * .34) + '" rx="' + f(rr * .2) + '" ry="' + f(rr * .1) + '" fill="#fff" opacity=".5" transform="rotate(-35 ' + f(cx - rr * .3) + ' ' + f(cy - rr * .34) + ')"/>' +
    '<ellipse cx="' + f(nx) + '" cy="' + f(ny) + '" rx="' + f(Math.max(3, rr * .2)) + '" ry="' + f(Math.max(1.6, rr * .085)) + '" fill="#6a4a5c" stroke="' + INK + '" stroke-width="1" transform="rotate(' + f(na * 180 / Math.PI + 90) + ' ' + f(nx) + ' ' + f(ny) + ')"/>';
}
// a field of packed cells inside the box x0..x1, y0..y1. kf(i) → fullness of cell i
function fatField(x0, y0, x1, y1, r, t, kf, seed) {
  var s = "", row = 0, i = 0, y, x; seed = seed || 0;
  for (y = y0 + r * .9; y < y1 + r * .4; y += r * 1.72, row++) for (x = x0 + (row % 2 ? r : 0); x < x1 + r; x += r * 2) { i++;
    var jx = (hash(seed + i * 3) - .5) * r * .22, jy = (hash(seed + i * 5) - .5) * r * .22 + 1.2 * Math.sin(t * 1.7 + i);
    s += fatCell(x + jx, y + jy, r * .98, seed + i * 13, kf ? kf(i) : 1, 1.6); }
  return s;
}

// ── the body, front view (torso proportions and organ places from the trunk surface-projection reference) ──
var TORSO = "M290 180 L290 214 C250 232 200 240 168 258 C150 270 160 300 178 340 C190 420 205 500 208 560 C205 640 185 700 180 830 L460 830 C455 700 435 640 432 560 C435 500 450 420 462 340 C480 300 490 270 472 258 C440 240 390 232 350 214 L350 180 Z";
var ARM = "M170 257 C130 262 112 300 110 360 C104 460 100 560 96 830 L150 830 C156 640 170 480 180 344 Z";
function lungs(t, rate, tint) {
  var b = 1 + .035 * Math.sin(t * (rate || 2.2)), s = "";
  var rl = "M306 262 C270 250 232 300 222 380 C214 440 216 480 224 500 C260 512 292 500 308 484 C312 420 312 320 306 262 Z",
      ll = "M334 262 C370 250 408 300 418 380 C426 440 424 480 416 500 C388 512 362 506 350 492 C340 470 358 440 352 410 C338 380 332 320 334 262 Z";
  s += P(rl, tint || LUNG, 2.2) + hatch(rl) + P(ll, tint || LUNG, 2.2) + hatch(ll);
  s += '<path d="M224 404 Q268 392 309 424 M244 322 Q280 356 310 366 M352 318 Q392 396 416 470" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".7"/>';
  // bronchial tree
  s += '<path d="M320 300 L282 348 L258 396 M282 348 L262 340 M282 348 L290 410 M270 372 L246 368 M320 300 L358 348 L382 398 M358 348 L380 338 M366 366 L392 372 M374 384 L372 430" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
       '<path d="M320 300 L282 348 L258 396 M282 348 L262 340 M282 348 L290 410 M270 372 L246 368 M320 300 L358 348 L382 398 M358 348 L380 338 M366 366 L392 372 M374 384 L372 430" stroke="' + AIR + '" stroke-width="5.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  return G("translate(320 380) scale(" + f(b) + ") translate(-320 -380)", s);
}
function trachea() {
  var s = '<path d="M320 172 V302" stroke="' + INK + '" stroke-width="24" stroke-linecap="round"/><path d="M320 172 V302" stroke="' + AIR + '" stroke-width="19.5" stroke-linecap="round"/>';
  for (var y = 196; y < 300; y += 14) s += '<path d="M310 ' + y + ' q10 5 20 0" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
  return s;
}
function heart(t) { var b = 1 + .05 * Math.max(0, Math.sin(t * 7)); return G("translate(338 440) scale(" + f(b) + ")", '<path d="M-22 -36 C-40 -30 -44 0 -30 22 C-18 40 4 50 20 44 C36 36 34 8 24 -12 C16 -28 4 -38 -4 -34 C-10 -40 -16 -40 -22 -36 Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -34 C-14 -52 -4 -62 8 -58 M4 -34 C8 -46 18 -48 26 -44" stroke="' + INK + '" stroke-width="2" fill="none"/><path d="M-12 -34 C-14 -52 -4 -62 8 -58" stroke="' + BLOOD + '" stroke-width="7" fill="none" opacity=".9"/>'); }
// op: {lungs, rate, organs, belly, sweat, head:false}
function body(t, op) {
  op = op || {}; var s = "";
  s += P(ARM, SKIN, 2.2) + G("translate(640 0) scale(-1 1)", P(ARM, SKIN, 2.2));
  s += P(TORSO, SKIN, 2.4);
  s += '<ellipse cx="320" cy="112" rx="56" ry="70" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' + '<path d="M264 100 q-10 4 -8 22 q2 10 9 12 M376 100 q10 4 8 22 q-2 10 -9 12" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M300 232 Q250 238 204 254 M340 232 Q390 238 436 254 M210 560 q4 30 -4 60 M430 560 q-4 30 4 60" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>' + '<ellipse cx="320" cy="646" rx="4" ry="6" fill="' + SKIN2 + '"/>';
  if (op.lungs !== false) {
    s += '<path d="M320 150 V176" stroke="' + INK + '" stroke-width="24" stroke-linecap="round" opacity=".18"/>' + trachea() + lungs(t, op.rate, op.tint) + (op.heart === false ? "" : heart(t));
    s += '<path d="M222 512 Q320 478 418 512" stroke="' + SKIN2 + '" stroke-width="3" fill="none"/>';
  }
  if (op.organs) {   // kidneys, ureters, bladder
    var kd = "M-14 -30 C8 -34 20 -14 16 6 C13 24 -2 34 -14 28 C-6 14 -6 -12 -14 -30 Z";
    s += '<path d="M286 600 C292 660 304 700 312 742 M354 600 C348 660 336 700 328 742" stroke="' + INK + '" stroke-width="6" fill="none"/><path d="M286 600 C292 660 304 700 312 742 M354 600 C348 660 336 700 328 742" stroke="' + WATER + '" stroke-width="3" fill="none"/>';
    s += G("translate(268 580) scale(-1 1)", P(kd, "#a8553f", 2)) + G("translate(372 580)", P(kd, "#a8553f", 2));
    s += '<path d="M320 730 C346 730 354 752 348 772 C342 790 298 790 292 772 C286 752 294 730 320 730 Z" fill="' + WATER + '" stroke="' + INK + '" stroke-width="2.2"/>';
  }
  return s;
}
// breath leaving the nose and mouth: CO2 tokens fanning up and out
function breath(x, y, t, n, k, sc) {
  var s = ""; for (var i = 0; i < (n || 6); i++) { var p = ((t * .42 + i / (n || 6)) % 1), side = i % 2 ? 1 : -1, px = x + side * (18 + p * 150) + 8 * Math.sin(t * 3 + i), py = y + 10 - p * 130 - 40 * p * p;
    s += G("", co2(px, py, (sc || .8) * (.6 + .5 * p), side * 30 + t * 40 + i * 50), clamp(p * 5) * clamp((1 - p) * 3) * (k == null ? 1 : k)); }
  return s;
}

// ── skin cut from the side (eye level): epidermis, dermis, the fat layer, muscle under it ──
function skinCut(t, kf) {
  var s = "", x, top = "M-40 232"; for (x = -40; x <= 700; x += 20) top += " L" + x + " " + f(232 + 5 * Math.sin(x * .03) + 2 * Math.sin(x * .11));
  s += '<path d="' + top + ' L700 800 L-40 800 Z" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M-40 262 Q160 252 320 264 T700 258 L700 800 L-40 800 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.4"/>';
  s += R(-40, 350, 740, 250, WALL, 1.6) + '<clipPath id="ff"><rect x="-40" y="350" width="740" height="250"/></clipPath><g clip-path="url(#ff)">' + fatField(-50, 348, 700, 600, 35, t, kf, 400) + '</g><path d="M-40 350 H700 M-40 600 H700" stroke="' + INK + '" stroke-width="2.2"/>';
  // connective septa between the fat lobules, a vessel through the dermis
  s += '<path d="M-40 322 C120 300 220 338 360 314 S600 300 700 320" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="M-40 322 C120 300 220 338 360 314 S600 300 700 320" stroke="' + BLOOD + '" stroke-width="6" fill="none"/><path d="M-40 322 C120 300 220 338 360 314 S600 300 700 320" stroke="' + BLOOD_L + '" stroke-width="2.4" fill="none" stroke-dasharray="8 22" stroke-dashoffset="' + f(-t * 50) + '"/>';
  s += R(-40, 600, 740, 220, MUSC, 2.2);
  for (var y = 622; y < 800; y += 22) s += '<path d="M-40 ' + y + ' Q320 ' + (y + 10) + ' 700 ' + y + '" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".55"/>';
  // hairs
  [[120, 0], [400, 6], [560, -4]].forEach(function (h, i) { s += '<path d="M' + h[0] + ' 300 Q' + (h[0] - 8) + ' 240 ' + (h[0] + 26 + 3 * Math.sin(t * 1.3 + i)) + ' 150" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>'; });
  return s;
}

// ── blood vessel along a path, with a moving stream ──
function vessel(d, t, w, sp) {
  w = w || 34; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 5) + '" fill="none" stroke-linecap="butt"/><path d="' + d + '" stroke="' + BLOOD + '" stroke-width="' + w + '" fill="none"/>' +
    '<path d="' + d + '" stroke="' + BLOOD_L + '" stroke-width="' + f(w * .2) + '" fill="none" stroke-linecap="round" stroke-dasharray="12 30" stroke-dashoffset="' + f(-t * (sp || 70)) + '"/>';
}
// ── a muscle: a spindle of striped fibres between two tendons, with the cut end showing its bundles ──
function muscle(cx, cy, w, h, t) {
  var x0 = cx - w / 2, x1 = cx + w / 2, tw = 1 + .025 * Math.sin(t * 2.6), hh = h * tw, s = "";
  var d = "M" + f(x0) + " " + f(cy) + " C" + f(x0 + w * .2) + " " + f(cy - hh * .62) + " " + f(x1 - w * .28) + " " + f(cy - hh * .62) + " " + f(x1 - w * .08) + " " + f(cy - hh * .3) + " L" + f(x1 - w * .08) + " " + f(cy + hh * .3) + " C" + f(x1 - w * .28) + " " + f(cy + hh * .62) + " " + f(x0 + w * .2) + " " + f(cy + hh * .62) + " " + f(x0) + " " + f(cy) + " Z";
  s += '<path d="M' + f(x0 - 90) + ' ' + f(cy - 9) + ' L' + f(x0 + 16) + ' ' + f(cy - 14) + ' L' + f(x0 + 16) + ' ' + f(cy + 14) + ' L' + f(x0 - 90) + ' ' + f(cy + 9) + ' Z" fill="' + TENDON + '" stroke="' + INK + '" stroke-width="2"/>';
  s += P(d, MUSC, 2.4);
  for (var i = -3; i <= 3; i++) s += '<path d="M' + f(x0 + 10) + ' ' + f(cy + i * 3) + ' C' + f(x0 + w * .25) + ' ' + f(cy + i * hh * .17) + ' ' + f(x1 - w * .3) + ' ' + f(cy + i * hh * .17) + ' ' + f(x1 - w * .08) + ' ' + f(cy + i * hh * .085) + '" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".6"/>';
  for (var k = 1; k < 16; k++) { var xx = x0 + w * .92 * k / 16, e = Math.sin(Math.PI * Math.min(1, k / 13)) * hh * .44; s += '<path d="M' + f(xx) + ' ' + f(cy - e) + ' V' + f(cy + e) + '" stroke="' + MUSC_L + '" stroke-width="2" opacity=".55"/>'; }
  // cut end: bundles
  var ex = x1 - w * .08; s += '<ellipse cx="' + f(ex) + '" cy="' + f(cy) + '" rx="' + f(hh * .13) + '" ry="' + f(hh * .3) + '" fill="' + MUSC_L + '" stroke="' + INK + '" stroke-width="2.2"/>';
  [[0, -.19], [.03, -.06], [-.03, .07], [.01, .19], [-.05, -.12], [.05, .12]].forEach(function (q) { s += '<circle cx="' + f(ex + q[0] * hh) + '" cy="' + f(cy + q[1] * hh) + '" r="' + f(hh * .045) + '" fill="' + MUSC + '" stroke="' + INK + '" stroke-width="1"/>'; });
  return s;
}
// a mitochondrion: outer bean, the folded inner membrane; glows a little when burning
function mito(x, y, s, t, hot) {
  var d = "M-70 0 C-70 -34 -30 -40 0 -36 C34 -32 72 -34 72 0 C72 34 34 34 0 36 C-30 40 -70 34 -70 0 Z", cr = "M-58 0";
  for (var i = 0; i < 8; i++) cr += " L" + (-50 + i * 14) + " " + (i % 2 ? 22 : -22) + " L" + (-43 + i * 14) + " " + (i % 2 ? 22 : -22);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="' + d + '" fill="' + (hot ? "#e8a377" : "#dba98c") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="1.2" transform="scale(.9)"/><path d="' + cr + ' L58 0" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="' + cr + ' L58 0" fill="none" stroke="' + (hot ? ORANGE : "#c98a70") + '" stroke-width="2.4" stroke-linejoin="round"/>');
}

// ── a bathroom scale seen from above at an angle, with its dial window ──
function scale(x, y, s, val) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M-150 -78 Q0 -96 150 -78 L176 96 Q0 122 -176 96 Z" fill="#8e8a80" stroke="' + INK + '" stroke-width="2.4"/><path d="M-150 -90 Q0 -108 150 -90 L176 84 Q0 110 -176 84 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M-150 -90 Q0 -108 150 -90 L176 84 Q0 110 -176 84 Z" fill="url(#hatch)"/><path d="M-78 -74 Q0 -84 78 -74 L84 -18 Q0 -8 -84 -18 Z" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/>' + N(val, 0, -30, 40, ORANGE) +
    '<path d="M-120 16 q34 -8 62 0 l6 62 q-38 8 -76 0 Z M58 16 q34 -8 62 0 l8 62 q-38 8 -76 0 Z" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".5" stroke-dasharray="5 5"/>');
}
// a 10-kilo iron weight
function kettle(x, y, s, txt, ghost) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M-26 -52 a26 22 0 0 1 52 0" fill="none" stroke="' + INK + '" stroke-width="13"' + (ghost ? ' stroke-dasharray="7 7"' : "") + '/>' + (ghost ? "" : '<path d="M-26 -52 a26 22 0 0 1 52 0" fill="none" stroke="#6f6a62" stroke-width="8"/>') +
    '<path d="M-52 -50 H52 L74 56 Q0 70 -74 56 Z" fill="' + (ghost ? "none" : "#6f6a62") + '" stroke="' + INK + '" stroke-width="2.6"' + (ghost ? ' stroke-dasharray="8 7"' : "") + '/>' + (ghost ? "" : '<path d="M-52 -50 H52 L74 56 Q0 70 -74 56 Z" fill="url(#hatch)"/>') + N(txt, 0, 22, 44, ghost ? INK : "#f4efe3"));
}
// the torso from the side (after the «abdominal obesity» profile photo): b = how far the belly stands out (110 big … 25 lean)
function sidePath(b) { return "M150 -20 C140 60 120 110 118 180 C116 280 130 360 140 430 C146 480 150 520 150 566 L" + f(304 + b * .2) + " 566 C" + f(300 + b * .9) + " 530 " + f(318 + b) + " 480 " + f(318 + b) + " 410 C" + f(318 + b) + " 335 " + f(300 + b * .45) + " 275 302 244 C320 224 324 192 310 166 C295 120 270 50 252 -20 Z"; }
function sideBody(b, ghost) {
  var d = sidePath(b), s = "";
  if (ghost != null) s += '<path d="' + sidePath(ghost) + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 7" opacity=".7"/>';
  s += P(d, SKIN, 2.6) + '<clipPath id="sb"><path d="' + d + '"/></clipPath><g clip-path="url(#sb)"><rect x="100" y="-20" width="70" height="600" fill="url(#hatch)"/><rect x="100" y="-20" width="70" height="600" fill="' + INK + '" opacity=".06"/></g>';
  s += '<path d="M178 40 C152 120 160 260 172 332 C184 356 216 354 224 326 C234 240 242 130 230 46 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M190 300 q16 14 30 2" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>';
  s += '<circle cx="311" cy="196" r="4" fill="' + SKIN2 + '"/><path d="M' + f(316 + b) + ' 418 h-7" stroke="' + SKIN2 + '" stroke-width="3" stroke-linecap="round"/>';
  s += '<path d="M146 560 L' + f(308 + b * .25) + ' 560 L' + f(306 + b * .2) + ' 640 L146 640 Z" fill="#3d3a34" stroke="' + INK + '" stroke-width="2.4"/>';
  return s;
}
// pictograms: sitting and running
function sitMan(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M-14 -16 V34 M-14 12 H20 V34" stroke="' + WOOD_D + '" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="-36" r="10" fill="' + INK + '"/><path d="M0 -24 V6 H22 V32 M0 -14 L16 0" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); }
function runMan(x, y, s, t) { var a = 14 * Math.sin(t * 9); return G("translate(" + f(x) + " " + f(y + 2 * Math.abs(Math.sin(t * 9))) + ") scale(" + f(s) + ")", '<circle cx="10" cy="-36" r="10" fill="' + INK + '"/><path d="M6 -24 L-4 4" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>' +
  G("rotate(" + f(a) + " -4 4)", '<path d="M-4 4 L16 14 L10 34" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>') + G("rotate(" + f(-a) + " -4 4)", '<path d="M-4 4 L-18 18 L-34 14" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>') +
  G("rotate(" + f(-a) + " 4 -20)", '<path d="M4 -20 L20 -12 L28 -24" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>') + G("rotate(" + f(a) + " 4 -20)", '<path d="M4 -20 L-12 -12 L-18 2" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')); }

// ── scenes reused by the recap (drawn in the 640×786 panel world, without the paper) ──
// eaten vs spent: two bars, the gap is what the body takes from the store
function sBars(u, t) {
  var k = at(u, .3, .8), k2 = at(u, 1.2, .6), s = "", base = 620, h1 = 220 * k, h2 = 360 * k;
  s += '<path d="M90 ' + base + ' H550" stroke="' + INK + '" stroke-width="3"/>';
  s += R(150, base - h1, 120, h1, OLIVE, 2.2) + R(370, base - h2, 120, h2, ORANGE, 2.2) + '<rect x="370" y="' + f(base - h2) + '" width="120" height="' + f(h2) + '" fill="url(#hatch)"/>';
  s += G("", T("اللي بتاكله", 210, 668, 26, OLIVE, 800) + T("اللي بتصرفه", 430, 668, 26, ORANGE, 800), k);
  if (k2 > 0) { var gy0 = base - 360, gy1 = base - 220; s += G("", '<rect x="150" y="' + gy0 + '" width="120" height="' + (gy1 - gy0) + '" fill="' + FAT + '" opacity=".55" stroke="' + INK + '" stroke-width="2" stroke-dasharray="7 6"/>' + fatCell(210, (gy0 + gy1) / 2 + 3 * Math.sin(t * 3), 38, 5, 1) + draw("M270 " + gy0 + " H370", 1, INK, 1.6, ' stroke-dasharray="5 5"'), k2) + label(250, gy0 + 20, 330, gy0 - 70, "من المخزون", ORANGE, at(u, 1.6, .5), 24); }
  return s;
}
// the cell lets its fat go into the blood
function sRelease(u, t, kk) {
  var k = kk == null ? at(u, .4, Math.max(1.5, 3)) : kk, s = "", vd = "M-60 610 C160 560 420 640 700 580";
  s += vessel(vd, t, 96, 90);
  s += fatCell(300, 300, 170, 21, 1 - .55 * k, 2.6);
  for (var i = 0; i < 9; i++) { var p = (t * .32 + i / 9) % 1, ang = TAU(60 + i * 8), r0 = 170 * (.5 + .5 * (1 - .55 * k)) * .7, px, py;
    if (p < .55) { var q = p / .55; px = 300 + Math.cos(ang) * r0 * (1 - q) + (190 + i * 26) * q * .0 + (lerp(300, 200 + i * 40, q) - 300); py = lerp(300 + Math.sin(ang) * r0, 590 + (i % 3) * 14, q * q); }
    else { var q2 = (p - .55) / .45; px = 200 + i * 40 + q2 * 260; py = 590 + (i % 3) * 14 - 22 * q2; }
    s += G("", fa(px, py, 1.25, p < .55 ? 70 - p * 120 : -6, 5), clamp(k * 3) * clamp(p * 8) * clamp((1 - p) * 5)); }
  return s;
}
// the muscle burns it with oxygen
function sBurn(u, t) {
  var s = vessel("M-60 250 C120 300 200 420 250 470", t, 60, 80) + muscle(360, 520, 500, 250, t), i;
  for (i = 0; i < 4; i++) { var p = (t * .4 + i / 4) % 1; s += G("", fa(lerp(20, 300, p), lerp(270, 500, p), 1.1, 45, 5), clamp(p * 6) * clamp((1 - p) * 4)); }
  for (i = 0; i < 5; i++) { var p2 = (t * .36 + i / 5) % 1; s += G("", o2(lerp(560, 400, p2) + 10 * Math.sin(t * 2 + i), lerp(190, 470, p2), .95, t * 50 + i * 40), clamp(p2 * 6) * clamp((1 - p2) * 4) * at(u, .8, .4)); }
  s += G("", flame(350, 500, 1.5, t, 0) + flame(300, 520, .9, t, 2) + flame(402, 524, .8, t, 4), at(u, 1.1, .4));
  return s;
}
// out: CO2 through the lungs and the mouth, water down to the bladder
function sOut(u, t, water) {
  var s = body(t, { organs: water }), i;
  for (i = 0; i < 5; i++) { var p = (t * .3 + i / 5) % 1, x = p < .5 ? lerp(120, 300, p * 2) : lerp(300, 320, (p - .5) * 2), y = p < .5 ? lerp(700, 420, p * 2) : lerp(420, 190, (p - .5) * 2); s += G("", co2(x, y, .62, t * 60 + i * 70), clamp(p * 6) * clamp((1 - p) * 6)); }
  s += breath(320, 150, t, 6, 1, .8);
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · most of the fat leaves through the nose and mouth, with the breath
shot(4, push(320, 330, 1.02, 1.16), function (u, d, t) {
  return paper() + body(t) + breath(320, 150, t, 7, at(u, .5, .6), .9) + label(215, 70, 160, 46, "النفَس", BLUE, at(u, 1.6, .5), 26) + label(250, 420, 185, 640, "الرئة", OLIVE, at(u, 2.4, .5), 24);
});
// 5 · «قاعدة صغيرة»: a pinned rule card over the scale
shot(5, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", scale(320, 560, 1.25, "70.0"), .55) + G("rotate(" + f(-3 + .8 * Math.sin(t * 1.6)) + " 320 240)", '<rect x="130" y="160" width="380" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' +
    T("المادة", 320, 232, 44, ORANGE, 800) + T("ما بتختفيش", 320, 290, 38, INK, 700) + C(320, 170, 9, ORANGE, 2), at(u, .3, .4));
});
// 6 · every gram that leaves the body leaves through an exit: the scale counts down as tokens walk out
shot(6, push(320, 400, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .4, d - .8), s = paper(), i;
  s += G("translate(-40 60) scale(.72)", body(t, { lungs: false })) + label(262, 190, 330, 120, "جسمك", INK, at(u, .2, .4), 26);
  for (i = 0; i < 12; i++) s += C(138 + (i % 4) * 36 + 4 * Math.sin(t * 2 + i), 430 + Math.floor(i / 4) * 40 + 4 * Math.cos(t * 2.3 + i), 13, i === 5 ? ORANGE : FAT, 1.6);
  for (i = 0; i < 4; i++) { var p = (t * .35 + i / 4) % 1; s += G("", C(lerp(250, 600, p), 470 + 8 * Math.sin(p * 9), 13, ORANGE, 1.6), clamp(p * 5) * clamp((1 - p) * 4) * k * 3); }
  s += arrow(330, 470, 560 + 8 * Math.sin(t * 4), 470, ORANGE, 6, at(u, cu(6, 2) + .1, .5)) + tag("مخرج", 460, 410, at(u, cu(6, 2) + .4, .3), 30, ORANGE);
  return s + scale(450, 640, .7, f(80 - 10 * k));
});
// 7 · where the fat is stored: under the skin, a layer of packed fat cells
shot(7, pan(300, 400, 340, 440, 1.0), function (u, d, t) {
  return paper() + skinCut(t) + label(250, 246, 150, 130, "الجلد", INK, at(u, .6, .5), 26) + label(470, 470, 400, 165, "خلايا دهنية", OLIVE, at(u, 1.2, .5), 28) + label(160, 690, 110, 760, "عضل", BROWN, at(u, 1.8, .5), 22);
});
// 7b · one cell: a balloon full of oil
shot([7, 2], push(320, 400, 1.12, 1.0), function (u, d, t) {
  var s = paper() + '<rect x="-200" y="-200" width="1100" height="1300" fill="' + WALL + '" opacity=".5"/>' + fatCell(100, 120, 150, 61, 1, 2) + fatCell(560, 140, 160, 62, 1, 2) + fatCell(60, 680, 170, 63, 1, 2) + fatCell(590, 690, 150, 64, 1, 2);
  s += fatCell(320, 400 + 4 * Math.sin(t * 2), 215, 21, 1, 3) + label(330, 420, 470, 250, "زيت", ORANGE, at(u, .5, .5), 32) + label(320 + Math.cos(hash(112) * 6.283) * 190, 400 + Math.sin(hash(112) * 6.283) * 190, 150, 640, "النواة", INK, at(u, 1.1, .5), 24);
  return s + iconBox(100, 110, 130, '<path d="M0 -42 C30 -42 36 -4 22 16 C14 28 6 30 0 32 C-6 30 -14 28 -22 16 C-36 -4 -30 -42 0 -42 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-5 32 h10 l3 7 h-16 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M0 39 q' + f(6 * Math.sin(t * 3)) + ' 8 0 16" stroke="' + INK + '" stroke-width="1.6" fill="none"/>', at(u, .2, .3));
}, { tr: "in" });
// 8 · the oil is made of carbon, hydrogen and oxygen only: one fat molecule, atom by atom
shot(8, pan(280, 400, 340, 400, 1.0), function (u, d, t) {
  var k = at(u, .2, 1.8), s = paper() + trig(150, 330, 1.02, k, t), ly = 640;
  [["C", "كربون", CARB, 520], ["H", "هيدروجين", MUTE, 320], ["O", "أكسجين", BLUE, 120]].forEach(function (a, i) { var kk = at(u, .9 + i * .55, .3); s += G("", atom(a[3], ly, 26, a[0]) + N(a[0], a[3], ly + 9, 26, a[0] === "H" ? INK : "#fff") + T(a[1], a[3], ly + 66, 26, a[2], 800), kk); });
  return s;
}, { tr: "in" });
// 9 · when does the body open the store? A full cell and a question mark
shot(9, push(320, 400, 1.0, 1.1), function (u, d, t) {
  return paper() + '<rect x="-200" y="-200" width="1100" height="1300" fill="' + WALL + '" opacity=".4"/>' + fatField(-40, 60, 680, 760, 82, t, null, 900) + G("translate(" + f(320 + 6 * Math.sin(t * 2.4)) + " 430) scale(" + f(pop(u / .5) * (1 + .04 * Math.sin(t * 4))) + ")", '<circle r="120" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.6"/>' + T("؟", 0, 60, 170, ORANGE, 800));
}, { tr: "out" });
// 10 · when you eat less than you spend; thumbnail: the savings jar
shot(10, push(320, 420, 1.04, 0.97), function (u, d, t) {
  var c = cu(10, 1), jar = '<path d="M-30 -30 h60 v8 q14 6 14 22 v36 q0 10 -10 10 h-68 q-10 0 -10 -10 v-36 q0 -16 14 -22 Z" fill="#dfe9ea" stroke="' + INK + '" stroke-width="2" opacity=".95"/><rect x="-34" y="-40" width="68" height="12" rx="3" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 4; i++) jar += '<ellipse cx="' + (-14 + (i % 2) * 26) + '" cy="' + (38 - Math.floor(i / 2) * 11) + '" rx="15" ry="5" fill="#dfa23c" stroke="' + INK + '" stroke-width="1.4"/>';
  var up = (t * .7) % 1; jar += G("translate(0 " + f(-10 - up * 60) + ")", '<ellipse cx="0" cy="20" rx="13" ry="13" fill="#dfa23c" stroke="' + INK + '" stroke-width="1.4"/>', 1 - up);
  return paper() + sBars(u, t) + iconBox(110, 130, 150, jar, at(u, c + .1, .3));
});
// 11 · the cell breaks its fat up and drops it into the blood
shot(11, push(320, 430, 1.0, 1.06), function (u, d, t) {
  return paper() + sRelease(u, t, at(u, .4, d - .9)) + label(400, 180, 350, 70, "الخلية بتفضى", OLIVE, at(u, .7, .5), 24) + label(120, 620, 110, 740, "الدم", ORANGE, at(u, 1.5, .5), 26);
}, { tr: "in" });
// 12 · the blood carries it to the muscles, where it burns with the oxygen you breathe
shot(12, push(330, 440, 0.96, 1.05), function (u, d, t) {
  var c = cu(12, 1); return paper() + sBurn(Math.max(0, u - c + .6), t) + label(470, 600, 540, 720, "عضلة", BROWN, at(u, .6, .5), 26) + label(520, 250, 470, 120, "أكسجين", BLUE, at(u, c + .5, .5), 26);
});
// 13 · what burning gives: energy to move with, plus carbon dioxide and water; thumbnail: a car exhaust
shot(13, push(320, 400, 1.03, 0.97), function (u, d, t) {
  var c1 = cu(13, 1), c2 = cu(13, 2), c3 = cu(13, 3), s = paper(), k2 = at(u, c2, .5), i;
  s += mito(320, 380, 2.1, t, true) + flame(320, 372, 1.5, t, 0) + flame(250, 392, .9, t, 2) + flame(392, 392, .9, t, 5);
  s += G("", fa(150, 180 + 5 * Math.sin(t * 3), 1.6, 20, 6) + T("دهون", 150, 136, 24, INK, 800) + T("+", 320, 200, 44, INK, 800) + o2(470, 178 + 5 * Math.cos(t * 3), 1.3, 0) + o2(540, 196 + 5 * Math.sin(t * 2.6), 1.3, 40) + T("أكسجين", 505, 136, 24, BLUE, 800), at(u, .2, .4));
  s += arrow(150, 215, 240, 300, INK, 4, at(u, .5, .3)) + arrow(500, 225, 410, 300, INK, 4, at(u, .6, .3));
  s += G("translate(" + f(320 + 4 * Math.sin(t * 5)) + " 0)", bolt(0, 560, 1.7 * pop((u - c1) / .5)) + G("", T("طاقة", 0, 650, 30, ORANGE, 800), at(u, c1 + .2, .3)));
  for (i = 0; i < 3; i++) s += G("", co2(110 + 8 * Math.sin(t * 2 + i), 520 + i * 56 - 10 * ((t * .8 + i * .3) % 1), 1.0, i * 25 - 20 + 8 * Math.sin(t * 2 + i)), k2);
  s += G("", T("تاني أكسيد الكربون", 130, 700, 22, BLUE, 800), k2);
  for (i = 0; i < 3; i++) s += G("", h2o(530 + 8 * Math.cos(t * 2.2 + i), 520 + i * 56 + 6 * Math.sin(t * 3 + i), 1.0, i * 20 - 15), at(u, c2 + .5, .5));
  s += G("", T("مية", 530, 700, 24, BLUE, 800), at(u, c2 + .5, .5));
  var car = '<path d="M-52 20 V-6 q0 -10 10 -12 l10 -22 q4 -8 14 -8 h28 q8 0 12 8 l8 22 v38 Z" fill="' + KHAKI + '" stroke="' + INK + '" stroke-width="2"/><rect x="-22" y="-38" width="38" height="20" fill="#dfe9ea" stroke="' + INK + '" stroke-width="1.6"/><rect x="-44" y="20" width="18" height="14" rx="3" fill="' + INK + '"/><rect x="4" y="20" width="18" height="14" rx="3" fill="' + INK + '"/><rect x="-62" y="10" width="14" height="6" fill="#6f6a62" stroke="' + INK + '" stroke-width="1.2"/>';
  for (i = 0; i < 3; i++) { var p = (t * .8 + i / 3) % 1; car += '<circle cx="' + f(-66 - p * 4) + '" cy="' + f(8 - p * 34) + '" r="' + f(4 + p * 9) + '" fill="' + GREY + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - p) + '"/>'; }
  return s + iconBox(320, 90, 130, G("translate(14 6)", car), at(u, c3 + .1, .3));
}, { tr: "in" });
// 14 · the CO2 rides the blood back to the lungs and leaves with the breath out
shot(14, push(320, 340, 0.98, 1.12), function (u, d, t) {
  return paper() + sOut(u, t) + label(390, 420, 540, 600, "الرئة", OLIVE, at(u, .8, .5), 26) + label(420, 60, 530, 40, "زفير", BLUE, at(u, cu(14, 1) + .3, .5), 28);
}, { tr: "out" });
// 15 · the water leaves as urine and sweat: kidneys to the bladder, beads on the skin
shot(15, pan(320, 520, 320, 600, 1.12), function (u, d, t) {
  var s = paper() + body(t, { organs: true }), i;
  for (i = 0; i < 4; i++) { var p = (t * .5 + i / 4) % 1, l = i % 2; s += G("", drop(lerp(l ? 354 : 286, l ? 330 : 310, p), lerp(610, 735, p), .5), clamp(p * 6) * clamp((1 - p) * 6)); }
  [[150, 420], [128, 560], [498, 440], [512, 600], [236, 520], [410, 640]].forEach(function (q, j) { var p2 = (t * .35 + j * .17) % 1; s += G("", drop(q[0], q[1] + p2 * 46, .62), clamp(p2 * 6) * clamp((1 - p2) * 3)); });
  return s + label(340, 765, 470, 740, "بول", BLUE, at(u, .5, .5), 28) + tag("عرق", 96, 470, at(u, 1.1, .3), 28, BLUE);
});
// 16 · of every 10 kilos of fat, 8.4 leave as breath and 1.6 as water
shot(16, push(320, 410, 1.04, 0.97), function (u, d, t) {
  var s = paper(), k = at(u, cu(16, 1), 1.2), kw = at(u, cu(16, 2), .8), x0 = 250, w = 140, y0 = 150, hh = 50, i;
  for (i = 0; i < 10; i++) { var yy = y0 + i * hh, air = i < 8.4;
    s += R(x0, yy, w, hh, FAT, 2);
    if (i < 8) s += '<rect x="' + x0 + '" y="' + yy + '" width="' + w + '" height="' + hh + '" fill="' + WATER + '" opacity="' + f(clamp(k * 9 - (7 - i)) * .0) + '"/>'; }
  s += sweep(x0, y0, w, hh * 8.4, k, "u", '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + f(hh * 8.4) + '" fill="#b9c9cc" stroke="' + INK + '" stroke-width="2"/><rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + f(hh * 8.4) + '" fill="url(#hatch)"/>');
  s += sweep(x0, y0 + hh * 8.4, w, hh * 1.6, kw, "d", '<rect x="' + x0 + '" y="' + f(y0 + hh * 8.4) + '" width="' + w + '" height="' + f(hh * 1.6) + '" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/>');
  for (i = 1; i < 10; i++) s += '<path d="M' + x0 + ' ' + (y0 + i * hh) + ' h' + w + '" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + (hh * 10) + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' + G("", N("10", x0 + w / 2, y0 - 46, 44, ORANGE) + T("كيلو دهون", x0 + w / 2, y0 - 14, 22, INK, 800), at(u, .1, .3));
  for (i = 0; i < 4; i++) { var p = (t * .4 + i / 4) % 1; s += G("", co2(80 + i * 34, 290 - p * 130 + 8 * Math.sin(t * 2 + i), .6, t * 40 + i * 60), k * clamp(p * 5) * clamp((1 - p) * 3)); }
  for (i = 0; i < 2; i++) { var p3 = (t * .6 + i / 2) % 1; s += G("", drop(x0 + w + 30 + i * 26, y0 + hh * 9 + p3 * 60, .6), kw * clamp(p3 * 5) * clamp((1 - p3) * 3)); }
  s += '<path d="M' + (x0 - 14) + ' ' + y0 + ' h-14 v' + f(hh * 8.4) + ' h14" stroke="' + INK + '" stroke-width="2" fill="none" opacity="' + f(k) + '"/>' + G("", N(count(8.4, k, 1), 125, 380, 62, BLUE) + T("كيلو نفَس", 125, 424, 26, INK, 800), clamp(k * 3));
  s += '<path d="M' + (x0 + w + 14) + ' ' + f(y0 + hh * 8.4) + ' h14 v' + f(hh * 1.6) + ' h-14" stroke="' + INK + '" stroke-width="2" fill="none" opacity="' + f(kw) + '"/>' + G("", N(count(1.6, kw, 1), 510, 590, 62, BLUE) + T("كيلو مية", 510, 634, 26, INK, 800), clamp(kw * 3));
  return s;
});
// 17 · breathing faster while sitting does not burn anything: fast lungs, the cell unchanged, crossed out
shot(17, push(320, 380, 1.0, 1.1), function (u, d, t) {
  var c = cu(17, 1) + .5, s = paper() + body(t, { rate: 13 }) + breath(320, 150, t * 2.4, 8, 1, .8);
  s += iconBox(520, 600, 170, fatCell(0, 4, 52, 21, 1, 2) + T("زي ما هي", 0, 76, 18, INK, 700), at(u, 1.0, .3));
  return s + cross(320, 380, 3.2, at(u, c, .5));
}, { tr: "out" });
// 18 · movement raises the burn: running is about 7 times sitting
shot(18, push(320, 410, 1.03, 0.97), function (u, d, t) {
  var c = cu(18, 1), k = at(u, c + .3, 1.4), s = paper(), n = Math.round(1 + 6 * k), i;
  s += '<path d="M70 640 H570" stroke="' + INK + '" stroke-width="3"/>';
  s += iconBox(170, 560, 130, sitMan(0, 4, 1.3), at(u, .2, .3)) + flame(170, 430, 1.0, t, 0) + G("", N("×1", 170, 350, 40, INK), at(u, .5, .3)) + T("قاعد", 170, 690, 26, INK, 800);
  s += iconBox(450, 560, 130, runMan(0, 4, 1.3, t), at(u, c, .3)) + G("", T("جري", 450, 690, 26, ORANGE, 800), at(u, c, .3));
  for (i = 0; i < n; i++) s += G("", flame(360 + (i % 4) * 60 + (i >= 4 ? 30 : 0), 430 - Math.floor(i / 4) * 86, 1.0, t, i * 1.7), at(u, c, .3));
  s += G("", N("×" + n, 450, 250, 64, ORANGE), at(u, c + .3, .3));
  return s;
});
// 19 · the myth: «the fat turns into energy and vanishes» — crossed out
shot(19, push(320, 400, 1.08, 0.98), function (u, d, t) {
  var k = at(u, .5, 1.2), s = paper();
  s += G("", fatCell(180, 390 + 4 * Math.sin(t * 2), 120, 21, 1, 2.6), 1 - .75 * k) + '<path d="' + blob(180, 390, 120, 21) + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 7" opacity="' + f(k) + '"/>';
  s += arrow(320, 390, 400 + 8 * Math.sin(t * 4), 390, INK, 5, at(u, .4, .4)) + G("translate(500 390) scale(" + f(pop((u - .7) / .5) * (1 + .05 * Math.sin(t * 6))) + ")", bolt(0, 0, 2.6)) + G("", T("طاقة وبس", 500, 520, 28, INK, 800), at(u, .9, .3));
  return s + cross(330, 400, 3.4, at(u, d * .62, .5));
});
// 20 · the energy comes out, but the atoms themselves stay and have to leave
shot(20, push(320, 410, 1.0, 1.07), function (u, d, t) {
  var c = cu(20, 1), k = at(u, c, 1.0), s = paper(), i;
  s += G("translate(" + f(110 + 3 * Math.sin(t * 5)) + " 170)", bolt(0, 0, 1.5)) + T("الطاقة", 110, 250, 26, ORANGE, 800) + flame(260, 180, 1.3, t, 0) + arrow(200, 176, 150, 176, INK, 4, at(u, .3, .3));
  for (i = 0; i < 12; i++) { var kind = i % 3 === 0 ? "C" : i % 3 === 1 ? "H" : "O", r = kind === "H" ? 13 : 20, bx = 150 + (i % 6) * 68, by = 420 + Math.floor(i / 6) * 80;
    s += G("", atom(bx + 5 * Math.sin(t * 2.2 + i) + 190 * k * ((t * .25 + i / 12) % 1), by + 5 * Math.cos(t * 2.6 + i), r, kind), at(u, .3 + i * .05, .3)); }
  s += '<rect x="100" y="370" width="440" height="180" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="9 7"/>' + G("", T("الذرات لسه موجودة", 320, 350, 26, OLIVE, 800), at(u, c + .1, .4));
  return s + arrow(480, 620, 590 + 8 * Math.sin(t * 4), 620, ORANGE, 7, at(u, c + 1.2, .4)) + tag("لازم تخرج", 360, 630, at(u, c + 1.4, .3), 28, ORANGE);
});
// 21 · the cells do not go away: the same count, emptier and smaller, waiting to fill again
shot(21, push(320, 400, 1.05, 0.98), function (u, d, t) {
  var c = cu(21, 1), k = at(u, c, 1.6), s = paper(), i;
  s += T("قبل", 560, 150, 28, INK, 800) + T("بعد", 560, 470, 28, ORANGE, 800);
  for (i = 0; i < 6; i++) { var x = 80 + (i % 3) * 150, y = 190 + Math.floor(i / 3) * 110;
    s += fatCell(x + 3 * Math.sin(t * 2 + i), y, 58, 30 + i * 7, 1, 2) + fatCell(x + 3 * Math.sin(t * 2.2 + i), y + 330 + 3 * Math.cos(t * 2.4 + i), 58, 30 + i * 7, 1 - .8 * k, 2); }
  s += numBox("6", 560, 220, at(u, .5, .3), 40) + numBox("6", 560, 540, at(u, c + .3, .3), 40) + '<path d="M60 395 H600" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 7"/>';
  return s;
});
// 22 · «يعني من الآخر»: the four steps side by side
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var cells = [[sBars, 0, 0], [sRelease, 1, 0], [sBurn, 0, 1], [sOut, 1, 1]], s = paper();
  cells.forEach(function (c, i) {
    var k = at(u, cu(22, i + 1), .35), ox = 330 - c[1] * 306, oy = 30 + c[2] * 372, id = "rc" + i;   // RTL: step 1 on the right
    s += G("", '<clipPath id="' + id + '"><rect x="' + ox + '" y="' + oy + '" width="290" height="354"/></clipPath><rect x="' + ox + '" y="' + oy + '" width="290" height="354" fill="#f4ecdb"/><g clip-path="url(#' + id + ')">' + G("translate(" + ox + " " + oy + ") scale(.453)", c[0](9, t, i === 1 ? .6 + .3 * Math.sin(t * 1.3) : undefined)) + '</g><rect x="' + ox + '" y="' + oy + '" width="290" height="354" fill="none" stroke="' + INK + '" stroke-width="2.2"/>', lerp(.22, 1, k)) + callout(String(i + 1), ox + 262, oy + 28, 1, 18 + 2 * k);
  });
  return s;
}, { tr: "out" });
// 23 · the odd fact: you lose weight asleep — about 200 g of carbon breathed out a day, a third of it in bed
shot(23, push(320, 420, 1.06, 0.98), function (u, d, t) {
  var c1 = cu(23, 1) + .4, k = at(u, c1, 1.4), s = paper(), i, br = 5 * Math.sin(t * 1.7);
  // window with the moon, the bed from the side, the sleeper under a blanket
  s += R(60, 110, 190, 210, "#3d4656", 2.4) + moon(170, 190, 34) + '<path d="M155 110 V320 M60 215 H250" stroke="' + INK + '" stroke-width="4"/>';
  [[90, 150], [220, 250], [100, 280], [225, 140]].forEach(function (q, j) { s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f(2 + Math.sin(t * 3 + j)) + '" fill="#f4efe3"/>'; });
  s += R(40, 590, 560, 40, WOOD, 2.4) + R(40, 470, 26, 200, WOOD_D, 2.4) + R(574, 540, 26, 130, WOOD_D, 2.4) + R(66, 548, 508, 44, "#efe6d2", 2.2);
  s += '<path d="M86 548 q4 -34 50 -34 h44 q30 0 30 34 Z" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2.2"/>' + '<ellipse cx="170" cy="506" rx="40" ry="34" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M134 494 q30 -40 74 -8 q-36 -10 -74 8 Z" fill="' + INK + '"/>';
  s += '<path d="M206 548 C220 ' + f(480 - br) + ' 300 ' + f(462 - br) + ' 380 ' + f(486 - br * .6) + ' C450 500 520 510 566 548 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M206 548 C220 ' + f(480 - br) + ' 300 ' + f(462 - br) + ' 380 ' + f(486 - br * .6) + ' C450 500 520 510 566 548 Z" fill="url(#hatch)"/>';
  for (i = 0; i < 5; i++) { var p = (t * .3 + i / 5) % 1; s += G("", co2(215 + p * 90 + 10 * Math.sin(t * 2 + i), 490 - p * 190, .5 + .4 * p, t * 40 + i * 60), clamp(p * 5) * clamp((1 - p) * 3)); }
  s += T("z", 250, 440 - 6 * Math.sin(t * 2), 30, INK, 800) + T("z", 276, 410 - 6 * Math.sin(t * 2 + 1), 40, INK, 800);
  s += G("", N(count(200, k), 440, 230, 78, ORANGE) + T("جرام كربون في اليوم", 440, 278, 24, INK, 800), clamp(k * 3)) + tag("⅓ وإنت نايم", 440, 370, at(u, cu(23, 3), .3), 30, BLUE);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the scale drops ten kilos. line 1: where did the 10-kilo weight go? line 2: not sweat, not muscle (both crossed out)
  var l0 = LN[0], k0 = ease((t - l0.start - .3) / Math.max(1, l0.end - l0.start + .6)), s = "";
  s += '<clipPath id="ib"><rect x="0" y="40" width="608" height="620"/></clipPath><g clip-path="url(#ib)">' + G("translate(" + f(-30 + 3 * Math.sin(t * 1.5)) + " 96) scale(.92)", sideBody(lerp(112, 40, k0), 112)) + '</g>';
  s += G("translate(0 " + f(3 * Math.sin(t * 1.8)) + ")", scale(470, 560, .62, f(80 - 10 * k0)));
  if (li === 1) { var u1 = t - LN[1].start; s += G("translate(470 " + f(300 + 6 * Math.sin(t * 2.4)) + ")", G("scale(" + f(pop(u1 / .5)) + ")", kettle(0, 0, 1.05, "10", true))) + G("", T("؟", 470, 190, 110, ORANGE, 800), ease((u1 - .4) / .3)); }
  if (li >= 2) { var u2 = t - LN[2].start; s = G("", s, .55);
    s += iconBox(170, 150, 190, drop(-34, -10, 1.3) + drop(22, 8, 1.7) + drop(-14, 44, 1.0) + T("عرق", 0, 84, 22, INK, 800), ease(u2 / .3)) + cross(170, 140, 1.9, ease((u2 - .5) / .4));
    var arm = '<path d="M-66 30 C-40 36 -10 36 8 30 C20 4 40 -20 46 -52 L20 -60 C16 -40 6 -22 -8 -14 C-30 -24 -52 -14 -66 2 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-50 2 C-36 -16 -12 -14 -4 2" fill="none" stroke="' + INK + '" stroke-width="1.8"/><path d="M14 -70 q14 -14 30 -4 q8 8 2 22 l-26 -8 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>';
    s += iconBox(440, 150, 190, G("translate(8 0)", arm) + T("عضلات", 0, 84, 22, INK, 800), ease((u2 - LN[2].end + LN[2].start + 1.1) / .3 + 1)) + cross(440, 140, 1.9, ease((u2 - (LN[2].end - LN[2].start) * .62) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  var s = '<rect x="0" y="0" width="180" height="200" fill="' + WALL + '" opacity=".55"/>';
  s += fatCell(52 + 2 * Math.sin(t * 1.6), 70, 40, 3, 1, 2) + fatCell(128, 62 + 2 * Math.cos(t * 1.4), 38, 8, 1, 2) + fatCell(94 + 2 * Math.sin(t * 1.9), 132, 44, 21, .55 + .45 * Math.sin(t * 1.2), 2) + fatCell(26, 150, 34, 14, 1, 2) + fatCell(160, 138, 34, 18, 1, 2);
  return s;
};
SCENE.outro = function (svg, u, t) {
  var s = "";
  s += fatCell(520, 140, 62, 21, .7 + .25 * Math.sin(t * 1.4), 2.2) + vessel("M450 150 C410 190 370 100 330 140", t, 26, 60) + G("translate(96 -74) scale(.62)", muscle(250, 340, 220, 150, t)) + flame(248, 132, .6, t, 0);
  s += G("translate(-70 12) scale(.5)", P("M306 262 C270 250 232 300 222 380 C214 440 216 480 224 500 C260 512 292 500 308 484 C312 420 312 320 306 262 Z", LUNG, 3) + P("M334 262 C370 250 408 300 418 380 C426 440 424 480 416 500 C388 512 362 506 350 492 C340 470 358 440 352 410 C338 380 332 320 334 262 Z", LUNG, 3) + '<path d="M320 180 V300 L282 348 M320 300 L358 348" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M320 180 V300 L282 348 M320 300 L358 348" stroke="' + AIR + '" stroke-width="10" fill="none" stroke-linecap="round"/>');
  for (var i = 0; i < 3; i++) { var p = (t * .4 + i / 3) % 1; s += G("", co2(90 + (i - 1) * 26, 96 - p * 60, .42, t * 40 + i * 50), clamp(p * 5) * clamp((1 - p) * 3)); }
  s += arrow(196, 140, 150, 160, INK, 3);
  return s + callout("1", 560, 60, ease(u / .3)) + callout("2", 400, 96, ease(u / .3 - .5)) + callout("3", 300, 60, ease(u / .3 - 1)) + callout("4", 40, 130, ease(u / .3 - 1.5));
};
