// ── «إزاي الطفل بيتنفس في بطن أمه؟» — drawings. The hand follows the «طب إزاي؟» reference (sheet v17: the fetus in a
// thick red uterus ring, pale amniotic fluid, a twisted cord); the shapes follow real references (refs/SOURCES.md):
// the uterus in section with the placenta on its upper wall (Wikimedia «Placenta.svg»), and the placenta in section
// with villous trees hanging from the chorionic plate into the intervillous lakes fed by spiral arteries (Gray's fig. 39).
// Colour rule for blood: orange = rich in oxygen, slate blue = poor in oxygen / carrying CO2.

var FLUID = "#c9d6d4", FLUID2 = "#b6c7c6", WALL = "#c8664a", WALL2 = "#a9503a", PLAC = "#8e4636", PLAC2 = "#743426",
    MBLOOD = "#c0604a", VILLUS = "#e4c2ad", JELLY = "#efe6d2", LUNG = "#e2b3a3", OXY = ORANGE, POOR = BLUE;

// a limb or any thick outlined stroke (ink outline + fill colour), like the reference's soft capsules
function limb(d, w, col) { return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + (col || SKIN) + '" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }

// ── the fetus, curled, head down, facing left. Local box about 260 × 330 around (0, 0). breath = 0..1 chest swell
function fetus(x, y, s, t, opt) {
  opt = opt || {}; var b = opt.breath || 0, beat = 1 + 0.012 * Math.sin(t * 7), q = "";
  // far arm and leg (darker), trunk, head, near limbs
  q += limb("M40 -40 Q-10 -70 -55 -40 Q-70 -20 -50 0", 26, SKIN2);
  q += '<g transform="translate(15 -45) scale(' + f(1 + .05 * b) + ' ' + f(1 + .03 * b) + ') translate(-15 45)"><path d="M70 -130 C110 -60 105 30 60 75 C25 108 -35 95 -55 50 C-75 0 -60 -100 -20 -140 C5 -165 50 -160 70 -130 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M64 -110 C92 -50 88 20 56 60" fill="none" stroke="' + SKIN2 + '" stroke-width="2" opacity=".7"/></g>';
  q += '<path d="M-50 -10 C-75 -20 -100 -8 -105 10" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5"/>';
  // head (down), ear, closed eye, nose and mouth on the left
  q += '<path d="M-5 70 C55 70 80 120 70 165 C60 210 15 235 -30 228 C-80 220 -108 180 -102 135 C-96 92 -55 70 -5 70 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
  q += '<path d="M10 140 C22 128 36 138 30 152 C26 162 14 162 12 154" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  q += '<path d="M-62 150 q10 6 20 0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M-98 168 q-10 8 -2 16" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
       '<path d="M-90 198 q8 4 14 -2" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
  // near leg folded up the front, near arm to the face
  q += limb("M45 -95 Q-10 -130 -60 -95 Q-85 -70 -60 -40", 34, SKIN) + '<ellipse cx="-58" cy="-30" rx="18" ry="11" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2" transform="rotate(70 -58 -30)"/>';
  q += limb("M15 40 Q-40 30 -62 70 Q-72 92 -66 110", 22, SKIN) + C(-66, 116, 11, SKIN, 2);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * beat) + ")", q);
}
var NAVEL = [-58, 0];   // where the cord meets the belly, fetus-local

// ── a twisted cord along a quadratic curve (x1,y1)→(x2,y2) via (qx,qy): pale jelly, the vein (orange) and two arteries (blue) winding round
function qpt(x1, y1, qx, qy, x2, y2, u) { var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; return [a * x1 + b * qx + c * x2, a * y1 + b * qy + c * y2]; }
function cord(x1, y1, qx, qy, x2, y2, w, t, k) {
  k = k == null ? 1 : clamp(k); if (k <= 0) return ""; var tw = Math.max(10, Math.hypot(x2 - x1, y2 - y1) / (w * 1.6)), n = 90, d = "", dv = "", da = "", db = "", i, ph = t * 3;
  for (i = 0; i <= n * k; i++) {
    var u = i / n, p = qpt(x1, y1, qx, qy, x2, y2, u), p2 = qpt(x1, y1, qx, qy, x2, y2, Math.min(1, u + .01)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]), nx = -Math.sin(a), ny = Math.cos(a);
    d += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]);
    var o1 = Math.sin(u * tw + ph) * w * .28, o2 = Math.sin(u * tw + ph + 2.1) * w * .28, o3 = Math.sin(u * tw + ph + 4.2) * w * .28;
    dv += (i ? " L" : "M") + f(p[0] + nx * o1) + " " + f(p[1] + ny * o1); da += (i ? " L" : "M") + f(p[0] + nx * o2) + " " + f(p[1] + ny * o2); db += (i ? " L" : "M") + f(p[0] + nx * o3) + " " + f(p[1] + ny * o3);
  }
  return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + JELLY + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
    '<path d="' + da + '" fill="none" stroke="' + POOR + '" stroke-width="' + f(w * .2) + '" stroke-linecap="round"/><path d="' + db + '" fill="none" stroke="' + POOR + '" stroke-width="' + f(w * .2) + '" stroke-linecap="round"/>' +
    '<path d="' + dv + '" fill="none" stroke="' + OXY + '" stroke-width="' + f(w * .3) + '" stroke-linecap="round"/>';
}

// ── the uterus in section: thick muscular wall, amniotic fluid, the placenta on the upper right wall, the fetus, the cord.
// (cx, cy) centre, s scale (1 → about 400 × 480). opt: {fetus:false, cord:false, plHi: 0..1 placenta highlight, motes}
function womb(cx, cy, s, t, opt) {
  opt = opt || {}; var q = "", i;
  q += '<ellipse cx="0" cy="0" rx="205" ry="245" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<ellipse cx="0" cy="0" rx="205" ry="245" fill="url(#hatch)" opacity=".8"/>';
  q += '<ellipse cx="0" cy="0" rx="180" ry="220" fill="' + FLUID + '" stroke="' + INK + '" stroke-width="2.2"/>';
  q += '<ellipse cx="0" cy="0" rx="172" ry="212" fill="none" stroke="' + FLUID2 + '" stroke-width="1.4" stroke-dasharray="10 8"/>';
  // floating motes in the fluid (they drift: life for calm shots)
  for (i = 0; i < 14; i++) { var a = hash(i) * 6.28 + t * (.15 + hash(i + 7) * .2), r = 60 + hash(i + 3) * 100; q += '<circle cx="' + f(Math.cos(a) * r * .9) + '" cy="' + f(Math.sin(a) * r * 1.1) + '" r="' + f(1.6 + hash(i + 11) * 2) + '" fill="#eef3f1" opacity=".9"/>'; }
  // placenta: a thick disc on the upper right inner wall
  var pl = '<path d="M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z" fill="' + PLAC + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M45 -190 C90 -180 130 -150 150 -100 M70 -200 C110 -185 145 -150 162 -110" fill="none" stroke="' + PLAC2 + '" stroke-width="3"/>';
  q += pl + (opt.plHi ? '<path d="M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z" fill="' + ORANGE + '" opacity="' + f(.45 * opt.plHi * (0.75 + .25 * Math.sin(t * 4))) + '" stroke="none"/>' : "");
  // fetus and cord
  var fx = -20, fy = 0, fs = 0.82;
  if (opt.fetus !== false) q += fetus(fx, fy, fs, t, { breath: opt.breath || 0 });
  if (opt.cord !== false) q += cord(112, -128, -140 + 14 * Math.sin(t * .8), -240, fx + NAVEL[0] * fs, fy + NAVEL[1] * fs, 15, t, opt.cordK);
  // cervix at the bottom
  q += '<path d="M-26 238 Q0 262 26 238 L22 275 Q0 285 -22 275 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.2"/>';
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(s) + ")", q);
}
// the placenta's point in world coords for womb(cx, cy, s)
function placAt(cx, cy, s) { return [cx + 120 * s, cy - 150 * s]; }

// ── the mother in profile (facing right): head, neck, torso with the belly, lungs, the uterus inside. Box about 330 × 720 from (x, y) top-left.
// opt: {lungHi, uterus: true, fetus, path: 0..1 oxygen path lungs → uterus}
function mother(x, y, s, t, opt) {
  opt = opt || {}; var q = "", br = 1 + .03 * Math.sin(t * 1.8), BODY = 'M150 18 C205 18 232 58 228 100 C226 120 238 128 244 140 C248 148 236 150 232 156 C236 168 228 176 222 184 C216 200 196 204 182 202 L180 230 C230 240 262 270 268 320 C276 360 268 380 260 400 ' + (opt.flat ? 'C266 470 262 560 250 620 C246 640 236 655 230 660' : 'C310 440 330 520 300 590 C282 630 250 650 230 660') + ' L232 720 L96 720 L102 640 C80 590 84 520 92 470 C96 420 86 360 92 300 C96 250 110 228 122 212 C100 196 92 170 92 130 C92 62 112 18 150 18 Z';
  q += '<path d="' + BODY + '" fill="' + TAN + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  q += '<path d="' + BODY + '" fill="url(#hatch)" opacity=".35"/>';
  q += '<path d="M170 92 q8 -5 16 0" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + '<path d="M120 70 C132 50 150 78 136 96" fill="none" stroke="' + INK + '" stroke-width="2"/>';
  // airway and lungs (they breathe)
  var lh = opt.lungHi || 0, lc = lh ? LUNG : "#ddc8b8";
  q += '<path d="M186 196 L176 262" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M186 196 L176 262" stroke="#d9cdb8" stroke-width="6" stroke-linecap="round"/>';
  q += G("translate(180 320) scale(" + f(br) + ") translate(-180 -320)", '<path d="M172 262 C140 262 118 300 116 350 C114 392 130 410 160 404 C176 400 178 380 176 350 Z" fill="' + lc + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M184 262 C220 262 246 300 248 350 C250 388 232 402 208 398 C192 395 188 380 188 350 Z" fill="' + lc + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M174 270 L150 320 M150 320 L140 360 M150 320 L162 356 M186 270 L214 318 M214 318 L226 356 M214 318 L202 352" stroke="' + MUTE + '" stroke-width="2" fill="none"/>');
  if (lh) q += G("translate(180 320) scale(" + f(br) + ") translate(-180 -320)", '<path d="M172 262 C140 262 118 300 116 350 C114 392 130 410 160 404 C176 400 178 380 176 350 Z M184 262 C220 262 246 300 248 350 C250 388 232 402 208 398 C192 395 188 380 188 350 Z" fill="' + BLUE + '" opacity="' + f(.25 * lh) + '"/>');
  // heart
  q += '<path d="M196 368 C186 352 204 342 210 356 C216 342 236 350 226 368 L212 386 Z" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width="1.8"/>';
  // the uterus in the belly
  if (opt.uterus !== false) q += womb(222, 520, .36, t, { fetus: opt.fetus !== false, plHi: opt.plHi || 0 });
  // the oxygen path: lungs → heart → down the aorta → the uterus
  if (opt.path) { var pd = "M176 330 C190 360 205 366 212 372 C200 410 188 440 200 470 C210 486 236 470 262 470"; q += draw(pd, opt.path, OXY, 6) + (opt.path >= 1 ? flowDots(pd, t, OXY, 5) : ""); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", q);
}
// dots running along a path (a path string through an <animateMotion>-free trick: dashes that move with t)
function flowDots(d, t, col, w) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + f(w * .6) + '" stroke-linecap="round" stroke-dasharray="0.1 18" stroke-dashoffset="' + f(-t * 40) + '" opacity=".9"/>'; }

// ── the placenta in section (after Gray's fig. 39): chorionic plate at the top (the cord leaves it), villous trees hanging
// into the intervillous space, the basal plate at the bottom with spiral arteries. Box 640 wide, plate y≈150, base y≈640.
// opt: {lake: 0..1 mother's blood fills the space, hi: 0..1 villi highlighted, spurt}
function villusTree(x, y, len, ang, depth, w, seed, t, col) {
  var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, bx = (x + x2) / 2 - Math.sin(ang) * len * .18 * (seed % 2 ? 1 : -1), by = (y + y2) / 2 + Math.cos(ang) * len * .18 * (seed % 2 ? 1 : -1), pd = "M" + f(x) + " " + f(y) + " Q" + f(bx) + " " + f(by) + " " + f(x2) + " " + f(y2), q = limb(pd, w, col || VILLUS);
  // the baby's capillary inside (orange near the tips, as the blood takes up oxygen)
  q += '<path d="' + pd + '" fill="none" stroke="' + (depth > 1 ? POOR : OXY) + '" stroke-width="' + f(Math.max(1.2, w * .22)) + '" stroke-linecap="round" opacity=".85"/>';
  if (depth > 0) {
    var sw = .05 * Math.sin(t * 1.3 + seed);
    q += villusTree(x2, y2, len * .72, ang - .42 - hash(seed) * .25 + sw, depth - 1, w * .72, seed * 2 + 1, t, col);
    q += villusTree(x2, y2, len * .72, ang + .42 + hash(seed + 5) * .25 + sw, depth - 1, w * .72, seed * 2 + 2, t, col);
  } else q += C(x2, y2, w * .62, col || VILLUS, 1.6);
  return q;
}
function placentaSection(t, opt) {
  opt = opt || {}; var q = "", lake = opt.lake == null ? 1 : opt.lake, i;
  // the intervillous space: mother's blood rising from the basal plate
  q += R(-40, 150, 720, 500, "#efe2cf", 0);
  if (lake > 0) q += sweep(-40, 150, 720, 500, lake, "u", '<rect x="-40" y="150" width="720" height="500" fill="' + MBLOOD + '" opacity=".55"/>' + (function () { var s = ""; for (i = 0; i < 40; i++) { var px = -20 + ((hash(i) * 700 + t * (14 + hash(i + 3) * 10)) % 700), py = 180 + hash(i + 9) * 450; s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="5" ry="3" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; })());
  // basal plate (mother's side) with spiral arteries bringing blood in, a vein taking it out
  q += '<path d="M-40 640 Q320 600 680 640 L680 760 L-40 760 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 640 Q320 600 680 640 L680 760 L-40 760 Z" fill="url(#hatch)" opacity=".7"/>';
  [90, 330, 560].forEach(function (x, j) {
    var d = "M" + x + " 760"; for (var yy = 740; yy >= 625; yy -= 10) d += " L" + f(x + 9 * Math.sin(yy * .12)) + " " + yy;
    q += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + OXY + '" stroke-width="8" stroke-linecap="round"/>';
    if (opt.spurt) { var k = (t * .8 + j * .33) % 1; q += '<path d="M' + f(x - 20 - 40 * k) + ' ' + f(615 - 120 * k) + ' Q' + x + ' ' + f(560 - 180 * k) + ' ' + f(x + 20 + 40 * k) + ' ' + f(615 - 120 * k) + '" fill="none" stroke="' + OXY + '" stroke-width="3" opacity="' + f(1 - k) + '"/>'; }
  });
  q += '<path d="M210 760 C214 700 200 660 206 625" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M210 760 C214 700 200 660 206 625" fill="none" stroke="' + POOR + '" stroke-width="8" stroke-linecap="round"/>';
  // septa between the lobes
  [210, 450].forEach(function (x) { q += '<path d="M' + (x - 22) + ' 640 L' + x + ' 470 L' + (x + 22) + ' 640 Z" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2"/>'; });
  // the villous trees hanging from the chorionic plate
  var hi = opt.hi || 0, col = hi ? "#e8c7a0" : VILLUS;
  [[40, 2], [130, 3], [300, 3], [395, 2], [530, 3], [630, 2]].forEach(function (v, j) { q += villusTree(v[0], 182, 95 + v[1] * 14, Math.PI / 2 + (j % 2 ? .1 : -.1), v[1], 22, j + 1, t, col); });
  // chorionic plate (the baby's side) with the cord vessels in it
  q += '<path d="M-40 110 L680 110 L680 186 Q320 200 -40 186 Z" fill="' + VILLUS + '" stroke="' + INK + '" stroke-width="2.4"/>';
  q += '<path d="M-40 140 L680 140" stroke="' + OXY + '" stroke-width="5"/><path d="M-40 158 L680 158" stroke="' + POOR + '" stroke-width="4"/>';
  q += '<path d="M-40 110 L680 110 L680 40 L-40 40 Z" fill="' + FLUID + '" stroke="' + INK + '" stroke-width="2"/>';
  return q;
}

// ── the barrier close-up: mother's blood above, a thin wall, the baby's capillary below. Gas dots cross with t.
function barrier(t, opt) {
  opt = opt || {}; var q = "", i, kO = opt.o2 || 0, kC = opt.co2 || 0;
  q += R(-40, 60, 720, 300, "#e9c3b4", 0) + '<rect x="-40" y="60" width="720" height="300" fill="' + MBLOOD + '" opacity=".35"/>';
  for (i = 0; i < 9; i++) { var x = -40 + ((i * 90 + t * 30) % 760), y = 120 + (i % 3) * 70; q += G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(i * 37 + t * 20) + ")", '<ellipse rx="34" ry="14" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width="2"/><ellipse rx="18" ry="6" fill="#a84a38"/>'); }
  // the wall: two thin layers (olive), the gap is tiny
  q += R(-40, 364, 720, 6, OLIVE, 1.2);
  q += R(-40, 370, 720, 264, "#dfe5e0", 0) + '<rect x="-40" y="370" width="720" height="260" fill="' + FLUID2 + '" opacity=".4"/>';
  q += R(-40, 634, 720, 14, OLIVE, 2);
  for (i = 0; i < 7; i++) { var x2 = -40 + ((i * 110 + t * 45) % 760), y2 = 440 + (i % 2) * 90; q += G("translate(" + f(x2) + " " + f(y2) + ") rotate(" + f(-i * 23 - t * 15) + ")", '<ellipse rx="32" ry="13" fill="' + (kO > .5 ? "#d07a52" : "#9a7a86") + '" stroke="' + INK + '" stroke-width="2"/>'); }
  // gas crossing: O2 down (orange), CO2 up (blue)
  for (i = 0; i < 10; i++) {
    var ph = (t * .45 + hash(i)) % 1, gx = 30 + i * 62;
    if (kO > 0) q += G("", '<circle cx="' + f(gx) + '" cy="' + f(250 + ph * 260) + '" r="11" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("O₂", gx, 250 + ph * 260 - 16, 15, OXY), kO * (ph < .1 ? ph * 10 : ph > .9 ? (1 - ph) * 10 : 1));
    var ph2 = (t * .4 + hash(i + 20)) % 1, cx2 = 60 + i * 62;
    if (kC > 0) q += G("", '<circle cx="' + f(cx2) + '" cy="' + f(520 - ph2 * 260) + '" r="9" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("CO₂", cx2, 520 - ph2 * 260 + 28, 13, POOR), kC * (ph2 < .1 ? ph2 * 10 : ph2 > .9 ? (1 - ph2) * 10 : 1));
  }
  return q;
}
function rbc(x, y, r, col, tilt) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(tilt || 0) + ")", '<ellipse rx="' + f(r) + '" ry="' + f(r * .82) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="' + f(r * .5) + '" ry="' + f(r * .38) + '" fill="#000" opacity=".12"/>'); }
function o2dot(x, y, r) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r || 10) + '" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
function stopwatch(x, y, r, k, t) {
  var a = -Math.PI / 2 + k * Math.PI * 2, s = '<rect x="' + f(x - 10) + '" y="' + f(y - r - 22) + '" width="20" height="14" fill="' + INK + '"/>' + C(x, y, r, "#f4ecdb", 3);
  if (k > 0) s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r + 8) + ' A' + f(r - 8) + ' ' + f(r - 8) + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.cos(a) * (r - 8)) + ' ' + f(y + Math.sin(a) * (r - 8)) + ' Z" fill="' + ORANGE + '" opacity=".35"/>';
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * (r - 4)) + ' ' + f(y + Math.sin(b) * (r - 4)) + ' L' + f(x + Math.cos(b) * (r - 14)) + ' ' + f(y + Math.sin(b) * (r - 14)) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  return s + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 14)) + ' ' + f(y + Math.sin(a) * (r - 14)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 5, INK, 0);
}
// a vertical gauge (oxygen level): label under, fill k
function gauge(x, y, h, k, col, name, kk) {
  return appear(kk == null ? 1 : kk, R(x - 30, y - h, 60, h, "#f4ecdb", 2.4) + sweep(x - 30, y - h, 60, h, k, "u", R(x - 30, y - h, 60, h, col, 0)) + R(x - 30, y - h, 60, h, "none", 2.4) + T(name, x, y + 36, 26, INK, 800));
}

// ════ shots (one per idea; line numbers from script.txt) ════
// 4 · every cell burns oxygen and gives off CO2; breathing swaps the two
shot(4, push(320, 400, 1.05, .97), function (u, d, t) {
  var s = paper(), i;
  s += appear(at(u, 0, .4), '<ellipse cx="320" cy="400" rx="190" ry="160" fill="#ead2c2" stroke="' + INK + '" stroke-width="3"/><ellipse cx="320" cy="400" rx="190" ry="160" fill="url(#hatch)" opacity=".4"/>' +
    '<circle cx="340" cy="390" r="52" fill="#c98e7a" stroke="' + INK + '" stroke-width="2.4"/>' + (function () { var m = ""; for (var j = 0; j < 4; j++) m += G("translate(" + (230 + j * 50) + " " + (480 - (j % 2) * 150) + ") rotate(" + (j * 40) + ")", '<ellipse rx="26" ry="12" fill="#d7a35a" stroke="' + INK + '" stroke-width="1.8"/><path d="M-18 0 q6 -8 12 0 t12 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'); return m; })());
  for (i = 0; i < 5; i++) { var ph = (t * .5 + i / 5) % 1; s += G("", o2dot(40 + ph * 200, 300 + i * 40, 11) + N("O₂", 40 + ph * 200, 285 + i * 40, 14, OXY), at(u, .5, .4) * (ph > .85 ? (1 - ph) * 6 : 1)); }
  for (i = 0; i < 4; i++) { var p2 = (t * .45 + i / 4) % 1; s += G("", '<circle cx="' + f(440 + p2 * 200) + '" cy="' + f(330 + i * 45) + '" r="9" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("CO₂", 440 + p2 * 200, 360 + i * 45, 13, POOR), at(u, 1.6, .4) * (p2 < .15 ? p2 * 6 : 1)); }
  s += label(320, 250, 250, 150, "خلية", OLIVE, at(u, .3, .5), 26);
  s += G("", T("النفس", 320, 680, 34, INK, 800) + arrow(200, 700, 120, 700, OXY, 5) + arrow(440, 700, 520, 700, POOR, 5), at(u, 3.2, .4));
  return s;
});
// 5 · where does the baby get it? from its mother's breath: the mother in profile, lungs breathing
shot(5, push(330, 400, .96, 1.04), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), mother(150, 40, 1.0, t, { lungHi: at(u, 1.4, .5) })) + T("؟", 520, 220, 120, ORANGE, 800) +
    label(330, 360, 470, 330, "رئة الأم", OLIVE, at(u, 1.6, .5), 26);
});
// 6 · into the mother's lungs, into her blood, down to the uterus
shot(6, push(380, 470, 1.15, 1.3), function (u, d, t) {
  return paper() + mother(150, 40, 1.0, t, { lungHi: 1, path: at(u, .4, 2.6), plHi: at(u, 3, .5) }) + label(372, 560, 520, 650, "الرحم", OLIVE, at(u, 3.1, .5), 26) + label(355, 405, 520, 400, "الدم", ORANGE, at(u, 1.6, .5), 24);
});
// 7 · there is an organ the size of a dinner plate: the placenta (uterus in section, thumbnail: a plate, about 22 cm)
shot(7, push(330, 400, 1.08, .98), function (u, d, t) {
  return paper() + womb(300, 420, 1.15, t, { plHi: at(u, 1.2, .5) }) + label(440, 230, 520, 120, "المشيمة", OLIVE, at(u, 1.3, .5), 28) +
    iconBox(120, 110, 150, '<ellipse cx="0" cy="8" rx="58" ry="20" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="5" rx="38" ry="12" fill="none" stroke="' + INK + '" stroke-width="1.2"/>' + N("~22 cm", 0, 56, 18, INK), at(u, .5, .3));
}, { tr: "in" });
// 8 · the placenta is the baby's lung for the whole pregnancy
shot(8, push(420, 260, 1.5, 1.62), function (u, d, t) {
  return paper() + womb(300, 420, 1.15, t, { plHi: 1 }) + tag("رئة الطفل", 470, 110, at(u, .4, .3), 30, ORANGE) +
    iconBox(170, 140, 120, G("scale(" + f(1 + .04 * Math.sin(t * 2)) + ")", '<path d="M-6 -40 C-30 -40 -44 -10 -44 18 C-44 40 -30 44 -12 38 C-6 30 -6 10 -6 -40 Z M6 -40 C30 -40 44 -10 44 18 C44 40 30 44 12 38 C6 30 6 10 6 -40 Z" fill="' + LUNG + '" stroke="' + INK + '" stroke-width="2"/>'), at(u, .9, .3));
});
// 9 · how, if the two bloods never mix? two streams side by side, a question mark
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + R(-40, 230, 720, 120, MBLOOD, 2.4) + R(-40, 450, 720, 120, "#8fa3b0", 2.4), i;
  for (i = 0; i < 8; i++) { s += rbc(-40 + ((i * 100 + t * 50) % 780), 290 + (i % 2 ? 18 : -18), 22, "#d27a5e", i * 30); s += rbc(680 - ((i * 100 + t * 40) % 780), 510 + (i % 2 ? 18 : -18), 22, "#c48a72", -i * 30); }
  s += label(80, 290, 140, 170, "دم الأم", ORANGE, at(u, .3, .5), 26) + label(560, 510, 500, 650, "دم الطفل", BLUE, at(u, .7, .5), 26);
  return s + appear(at(u, 1.2, .3), C(320, 400, 46, PAPER, 2.4) + T("؟", 320, 424, 60, ORANGE, 800)) + cross(320, 400, 1.2, at(u, 2, .5));
});
// 10 · inside the placenta: villous trees like roots, the baby's blood in them (Gray's fig. 39). Thumbnail: tree roots
shot(10, push(320, 380, .92, 1.0), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), placentaSection(t, { lake: 0, hi: at(u, .8, .6) })) + cord(320, 30, 320, -40, 320, -140, 40, t) +
    label(150, 330, 250, 255, "فروع", OLIVE, at(u, 1, .5), 26) +
    iconBox(530, 80, 130, '<path d="M0 -50 V0 M0 0 Q-20 20 -38 48 M0 0 Q20 20 38 48 M0 10 Q-4 30 0 52 M-20 24 Q-34 26 -46 20 M22 22 Q34 26 44 16" stroke="#6f5a3e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-60 -10 H60" stroke="' + INK + '" stroke-width="2"/>', at(u, 1.8, .3));
}, { tr: "in" });
// 11 · the villi sit in little lakes of the mother's blood, fed by spiral arteries
shot(11, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + placentaSection(t, { lake: at(u, .2, 1.6), spurt: u > .4 }) + label(260, 520, 330, 700, "دم الأم", ORANGE, at(u, 1.4, .5), 26);
});
// 12 · between them a wall 20 times thinner than a hair: the close-up, a hair beside it
shot(12, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .6, .6);
  return paper() + barrier(t, {}) + label(560, 367, 520, 300, "الجدار", OLIVE, at(u, .3, .5), 26) +
    G("", R(520, 380, 120, 260, "#3d3229", 2) + T("شعرة", 580, 690, 26, INK, 800), k) + numBox("÷20", 300, 700, at(u, 1.2, .3), 40);
}, { tr: "in" });
// 13 · oxygen crosses down into the baby's blood, CO2 crosses back up
shot(13, push(320, 380, 1.06, 1.0), function (u, d, t) {
  return paper() + barrier(t, { o2: at(u, .2, .5), co2: at(u, 2.2, .5) }) + label(600, 200, 520, 100, "دم الأم", ORANGE, at(u, .2, .5), 24) + label(600, 520, 520, 700, "دم الطفل", BLUE, at(u, .6, .5), 24);
});
// 14 · like a tea bag in a glass: the taste comes out, the leaves stay in
shot(14, push(320, 420, 1.05, .98), function (u, d, t) {
  var s = paper(), k = at(u, .2, 3), i;
  s += '<path d="M150 240 L490 240 L455 680 L185 680 Z" fill="#e7eeee" stroke="' + INK + '" stroke-width="3"/>';
  s += '<path d="M156 300 L484 300 L455 676 L188 676 Z" fill="#cfdcdc"/>';
  for (i = 0; i < 9; i++) { var a = i / 9 * 6.28 + t * .3, r = 30 + k * (70 + 30 * Math.sin(t + i)); s += '<ellipse cx="' + f(320 + Math.cos(a) * r * 1.1) + '" cy="' + f(510 + Math.sin(a) * r * .9) + '" rx="' + f(30 + k * 40) + '" ry="' + f(22 + k * 30) + '" fill="#a66a3a" opacity="' + f(.1 + .06 * k) + '"/>'; }
  s += '<path d="M320 120 L320 450" stroke="' + INK + '" stroke-width="1.6"/>' + R(300, 100, 40, 28, "#e6d0a0", 1.6);
  s += G("translate(320 " + f(510 + 6 * Math.sin(t * 1.6)) + ") rotate(" + f(3 * Math.sin(t * 1.2)) + ")", '<rect x="-55" y="-62" width="110" height="124" rx="8" fill="#f2e8d4" stroke="' + INK + '" stroke-width="2.2" opacity=".9"/>' + (function () { var m = ""; for (var j = 0; j < 26; j++) m += '<path d="M' + f(-42 + hash(j) * 84) + ' ' + f(-48 + hash(j + 5) * 96) + ' l8 -3" stroke="#4f3a22" stroke-width="4" stroke-linecap="round"/>'; return m; })());
  s += '<path d="M150 300 L490 300" stroke="' + INK + '" stroke-width="1.6"/>';
  return s + label(410, 600, 540, 660, "الطعم", ORANGE, at(u, 1, .5), 26) + label(330, 470, 520, 420, "الورق", OLIVE, at(u, 2.2, .5), 26);
}, { tr: "out" });
// 15 · unfold all the villi: about 12 m², a room's floor (isometric room, tiles filling in)
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, .4, 2.6), o = { ox: 320, oy: 200, s: .95 }, i, j, n = 0;
  s += ipoly(o, [[0, 0, 0], [0, 0, 160], [0, 240, 160], [0, 240, 0]], "#e2d6bd", 2) + ipoly(o, [[0, 0, 0], [320, 0, 0], [320, 0, 160], [0, 0, 160]], "#d6c9ab", 2);
  s += ipoly(o, [[0, 0, 0], [320, 0, 0], [320, 240, 0], [0, 240, 0]], "#ece2cc", 2);
  for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) { var on = n++ / 12 < k; s += ipoly(o, [[i * 80 + 4, j * 80 + 4, 0], [i * 80 + 76, j * 80 + 4, 0], [i * 80 + 76, j * 80 + 76, 0], [i * 80 + 4, j * 80 + 76, 0]], on ? VILLUS : "#ece2cc", 1.2) + (on ? G("", (function () { var c = isoP(o, i * 80 + 40, j * 80 + 40, 0); return '<path d="M' + f(c[0] - 26) + ' ' + f(c[1]) + ' q13 -10 26 0 t26 0" stroke="' + OXY + '" stroke-width="2" fill="none"/>'; })(), 1) : ""); }
  s += ipoly(o, [[0, 240, 0], [0, 240, 160], [0, 240, 0]], "none", 1.6);
  return s + G("", N(count(12, k), 320, 640, 84, ORANGE) + T("متر مربع", 320, 690, 32, INK, 800), at(u, .4, .4));
});
function isoP(o, x, y, z) { return [o.ox + (x - y) * 0.866 * o.s, o.oy + (x + y) * 0.5 * o.s - z * o.s]; }
function ipoly(o, pts, fill, sw) { return '<path d="' + pts.map(function (p, i) { var q = isoP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.6 : sw) + '" stroke-linejoin="round"/>'; }
// 16 · the oxygen reaches the baby through the umbilical cord
shot(16, push(300, 400, .98, 1.08), function (u, d, t) {
  return paper() + womb(300, 420, 1.15, t, { cordK: lerp(.2, 1, at(u, .3, 1.4)), plHi: .4 }) + label(250, 300, 120, 140, "الحبل السري", OLIVE, at(u, 1.6, .5), 28);
}, { tr: "out" });
// 17 · one vein brings blood rich in oxygen, two arteries take the CO2 blood back (a length of cord + its cross-section)
shot(17, push(320, 400, 1.04, .98), function (u, d, t) {
  var s = paper() + cord(-60, 560, 320, 520, 700, 560, 110, t);
  s += G("", arrow(150, 640, 260, 640, OXY, 6) + T("للطفل", 205, 680, 22, OXY, 800) + arrow(500, 470, 390, 470, POOR, 6) + T("للمشيمة", 445, 455, 22, POOR, 800), at(u, 1, .4));
  s += inset(320, 250, 160, '<circle r="150" fill="' + JELLY + '"/><circle r="150" fill="url(#hatch)" opacity=".25"/>' + C(-30, 10, 58, OXY, 2.6) + C(-30, 10, 30, "#e7b39a", 1.6) +
    C(70, -55, 32, POOR, 2.6) + C(70, -55, 14, "#b9c8d0", 1.4) + C(75, 70, 32, POOR, 2.6) + C(75, 70, 14, "#b9c8d0", 1.4), at(u, .2, .4));
  s += label(250, 300, 150, 430, "وريد", ORANGE, at(u, .6, .5), 28) + label(395, 195, 520, 100, "شريان", BLUE, at(u, 2.6, .5), 24) + label(395, 320, 520, 410, "شريان", BLUE, at(u, 3, .5), 24);
  return s;
});
// 18 · the mother's blood holds more oxygen: how does the baby get its share? two gauges
shot(18, push(320, 420, 1.04, .98), function (u, d, t) {
  var w = .03 * Math.sin(t * 2.5);
  return paper() + gauge(200, 560, 340, .95 + w, OXY, "الأم", at(u, .1, .4)) + gauge(440, 560, 340, .62 + w, "#d6875f", "الطفل", at(u, .5, .4)) +
    T("أكسجين", 320, 150, 30, INK, 800) + G("", T("؟", 520, 260, 110, ORANGE, 800), at(u, 1.6, .3));
}, { tr: "out" });
// 19 · fetal haemoglobin grabs oxygen harder: oxygen dots hop from the mother's red cell to the baby's
shot(19, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + rbc(170, 400, 105, "#d27a5e", -8) + rbc(470, 400, 105, "#c9694c", 8), i;
  for (i = 0; i < 6; i++) { var ph = (t * .5 + i / 6) % 1, x = lerp(200, 450, ease(ph)), y = 360 + i * 16 - Math.sin(ph * Math.PI) * 80; s += G("", o2dot(x, y, 12), at(u, .6, .4)); }
  for (i = 0; i < 5; i++) s += o2dot(440 + (i % 3) * 30, 380 + Math.floor(i / 3) * 34, 12);
  return s + label(170, 490, 160, 640, "دم الأم", ORANGE, at(u, .3, .5), 26) + label(470, 490, 400, 640, "هيموجلوبين الطفل", OLIVE, at(u, 1, .5), 24) + tag("أقوى", 470, 210, at(u, 2.6, .3), 32, ORANGE);
});
// 20 · like a stronger magnet pulling the nail away from a weaker one
function magnet(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", '<path d="M-60 -70 L-60 20 A60 60 0 0 0 60 20 L60 -70 L28 -70 L28 20 A28 28 0 0 1 -28 20 L-28 -70 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.6"/>' + R(-60, -90, 32, 22, "#e9e3d6", 2) + R(28, -90, 32, 22, "#e9e3d6", 2)); }
shot(20, push(320, 400, 1.02, .97), function (u, d, t) {
  var k = at(u, .6, 1.2), nx = lerp(250, 390, k) + 3 * Math.sin(t * 9) * (1 - k);
  return paper() + G("rotate(-90 160 420)", magnet(160, 420, .8, "#8fa3b0")) + G("rotate(90 500 420)", magnet(500, 420, 1.25, ORANGE)) +
    G("translate(" + f(nx) + " 420) rotate(" + f(-3 + 6 * k) + ")", '<path d="M-48 -4 L40 -4 L52 0 L40 4 L-48 4 Z" fill="#b8b8b0" stroke="' + INK + '" stroke-width="2"/>' + R(-54, -10, 8, 20, "#9a9a92", 2)) +
    label(140, 470, 120, 600, "أضعف", BLUE, at(u, .3, .5), 26) + label(520, 500, 520, 640, "أقوى", ORANGE, at(u, .3, .5), 26) + T("مسمار", 320, 360, 22, MUTE, 700);
});
// 21 · the myth: the baby breathes the fluid like a fish — no (a fish with gills, crossed out)
shot(21, push(320, 400, 1.08, .98), function (u, d, t) {
  return paper() + womb(320, 440, .95, t, {}) +
    iconBox(500, 110, 170, '<path d="M-60 0 Q-20 -40 30 -10 L60 -34 L56 0 L60 34 L30 10 Q-20 40 -60 0 Z" fill="#9ab0b8" stroke="' + INK + '" stroke-width="2"/><circle cx="-38" cy="-6" r="4" fill="' + INK + '"/><path d="M-20 -14 Q-12 0 -20 14 M-12 -16 Q-4 0 -12 16" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' +
      (function () { var m = ""; for (var j = 0; j < 3; j++) { var ph = (t * .6 + j / 3) % 1; m += '<circle cx="' + f(-70 - 8 * j) + '" cy="' + f(-10 - ph * 60) + '" r="5" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; } return m; })(), at(u, .2, .3)) +
    cross(500, 110, 1.4, at(u, d - 1.3, .5));
});
// 22 · he does move his chest and pull fluid in and out: practice for the muscles, not breathing
shot(22, push(260, 430, 1.55, 1.7), function (u, d, t) {
  var b = (Math.sin(t * 3.2) + 1) / 2, s = paper() + womb(320, 440, .95, t, { breath: b }), i;
  for (i = 0; i < 3; i++) { var ph = (t * .53 + i / 3) % 1, mx = 320 + (-20 - 95) * .95 * .82, my = 440 + 195 * .95 * .82; s += '<path d="M' + f(mx - 10 - ph * 40) + ' ' + f(my - 8 + i * 8) + ' q-8 -6 -16 0" stroke="' + BLUE + '" stroke-width="2.4" fill="none" opacity="' + f(1 - ph) + '"/>'; }
  return s + tag("تمرين", 170, 260, at(u, 2.2, .3), 30, ORANGE) + label(300, 420, 400, 300, "الصدر", OLIVE, at(u, .4, .5), 22);
}, { tr: "in" });
// 23 · in short: mother breathes, placenta swaps, cord delivers, baby's blood grabs
shot(23, push(320, 400, .95, 1.02), function (u, d, t) {
  return paper() + mother(130, 30, 1.03, t, { lungHi: 1, path: 1, plHi: at(u, 1.3, .4) }) +
    callout("1", 320, 340, at(u, .3, .3), 20) + callout("2", 380, 440, at(u, 1.3, .3), 20) + callout("3", 290, 560, at(u, 2.3, .3), 20) + callout("4", 230, 610, at(u, 3.4, .3), 20) +
    G("", T("بتتنفس", 470, 220, 26, BLUE, 800), at(u, .4, .3)) + G("", T("بتبدّل", 520, 420, 26, OLIVE, 800), at(u, 1.4, .3)) + G("", T("بيوصّل", 520, 560, 26, OLIVE, 800), at(u, 2.4, .3)) + G("", T("بيمسك", 520, 680, 26, ORANGE, 800), at(u, 3.5, .3));
}, { tr: "out" });
// 24 · the odd fact: the baby's blood oxygen is close to yours on top of Everest (8,849 m)
shot(24, push(320, 420, 1.04, .97), function (u, d, t) {
  var s = paper(), k = at(u, .3, 1.2), fl = 4 * Math.sin(t * 4);
  s += '<path d="M-40 700 L90 520 L150 560 L250 380 L300 410 L340 300 L380 360 L440 330 L520 470 L600 440 L700 700 Z" fill="#b9b2a2" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  s += '<path d="M250 380 L300 410 L340 300 L380 360 L440 330 L462 372 L420 380 L380 400 L340 360 L300 450 Z" fill="#f6f3ea" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M340 300 L340 240" stroke="' + INK + '" stroke-width="3"/><path d="M340 242 L' + f(380 + fl) + ' 254 L340 266 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>';
  s += N("8,849 m", 200, 300, 32, INK) + tag("إفرست", 470, 220, at(u, .2, .3), 30, ORANGE);
  s += gauge(130, 640, 140, .45 + .02 * Math.sin(t * 2), "#d6875f", "الطفل", k) + gauge(510, 640, 140, .42 + .02 * Math.cos(t * 2), "#d6875f", "فوق إفرست", at(u, .8, .4));
  s += G("", T("≈", 320, 600, 70, ORANGE, 800), at(u, 1.6, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: hold your breath two minutes — a stopwatch running. line 1: the baby in the womb, 9 months in fluid. line 2: no air at all (✗)
  var s = "";
  if (li === 0) {
    var k = clamp((t - LN[0].start) / Math.max(1, LN[0].end - LN[0].start));
    s += G("translate(0 40)", mother(60, 30, .8, t, { uterus: false, flat: true })) + stopwatch(440, 200, 110, k, t) + N(Math.floor(k * 2) + ":" + ("0" + Math.floor((k * 120) % 60)).slice(-2), 440, 380, 44, ORANGE);
  } else {
    s += womb(300, 340, 1.12, t, {});
    if (li >= 1) s += tag("9 شهور", 500, 60, ease((t - LN[1].start) / .4), 30, ORANGE);
    if (li >= 2) { var u = t - LN[2].start, mx = 300 + (-20 - 95) * 1.12 * .82, my = 340 + 195 * 1.12 * .82;
      s += G("", '<path d="M' + f(mx - 90) + ' ' + f(my - 20) + ' l40 20 l-40 20 M' + f(mx - 120) + ' ' + f(my - 20) + ' l40 20 l-40 20" stroke="' + BLUE + '" stroke-width="5" fill="none" stroke-linecap="round"/>', ease(u / .3)) + cross(mx - 80, my, 1, ease((u - .4) / .4)); }
  }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 100) scale(.36) translate(-300 -340)", womb(300, 340, 1, t, {}));
};
SCENE.outro = function (svg, u, t) {
  var s = G("rotate(-90 300 140)", womb(300, 140, .52, t, {}));
  return s + callout("1", 170, 70, ease(u / .3)) + callout("2", 210, 110, ease(u / .3 - .5)) + callout("3", 280, 110, ease(u / .3 - 1)) + callout("4", 330, 175, ease(u / .3 - 1.5));
};
