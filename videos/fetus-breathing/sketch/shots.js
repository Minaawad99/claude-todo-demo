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
function bodyPath(flat) { return 'M150 18 C205 18 232 58 228 100 C226 120 238 128 244 140 C248 148 236 150 232 156 C236 168 228 176 222 184 C216 200 196 204 182 202 L180 230 C230 240 262 270 268 320 C276 360 268 380 260 400 ' + (flat ? 'C266 470 262 560 250 620 C246 640 236 655 230 660' : 'C310 440 330 520 300 590 C282 630 250 650 230 660') + ' L232 720 L96 720 L102 640 C80 590 84 520 92 470 C96 420 86 360 92 300 C96 250 110 228 122 212 C100 196 92 170 92 130 C92 62 112 18 150 18 Z'; }
function mother(x, y, s, t, opt) {
  opt = opt || {}; var q = "", br = 1 + .03 * Math.sin(t * 1.8), BODY = bodyPath(opt.flat);
  if (!opt.noBody) q += '<path d="' + BODY + '" fill="' + TAN + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  if (!opt.noBody) q += '<path d="' + BODY + '" fill="url(#hatch)" opacity=".35"/>';
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

// ════ isometric toolkit («اسكتش» isometric, like the reference's cut-away rooms and machines) ════
// world axes: x → down-right, y → down-left, z → up. The visible faces are +x (right), +y (left/front) and +z (top).
var CI = 0.866, SI = 0.5;
// projection: "front" = the drawing faces you square-on and its depth runs back up-right (what the user picked over the
// 30° isometric, which made the anatomy look tilted); "iso" = true isometric
var PROJ = window.PROJ || "front";
var AX = PROJ === "iso" ? [CI, SI] : [1, 0], AY = PROJ === "iso" ? [-CI, SI] : [-.42, .3], AZ = [0, -1];
function IP(o, x, y, z) { return [o.ox + (x * AX[0] + y * AY[0] + z * AZ[0]) * o.s, o.oy + (x * AX[1] + y * AY[1] + z * AZ[1]) * o.s]; }
function mtx(a, b, c, d, e, g) { return "matrix(" + [a, b, c, d, e, g].map(function (v) { return (+v).toFixed(4); }).join(" ") + ")"; }
// put a 2D drawing (u right, v down, origin at the given point) onto a face plane
function onL(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(AX[0] * s, AX[1] * s, -AZ[0] * s, -AZ[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }   // plane y = y0 (the front): u → +x, v → −z
function onR(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(-AY[0] * s, -AY[1] * s, -AZ[0] * s, -AZ[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }  // plane x = x0 (the right side): u → −y, v → −z
function onT(o, x0, y0, z0, inner) { var P = IP(o, x0, y0, z0), s = o.s; return '<g transform="' + mtx(AX[0] * s, AX[1] * s, AY[0] * s, AY[1] * s, P[0], P[1]) + '">' + inner + '</g>'; }   // plane z = z0 (the top): u → +x, v → +y
function ipoly(o, pts, fill, sw, ex) { return '<path d="' + pts.map(function (p, i) { var q = IP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.8 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
// an upright box from (x, y, z) of size w × d × h, three visible faces
function ibox(o, x, y, z, w, d, h, top, left, right, sw) {
  return ipoly(o, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left, sw) + ipoly(o, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, sw) + ipoly(o, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, sw);
}
// a 2D shape d drawn on the front plane y = y0 (origin x0, z0), extruded back by depth: a solid with an ink silhouette.
// part: "all" | "sides" (only the extrusion) | "front" (only the cut face)
function slabL(o, x0, y0, z0, depth, d, front, side, inner, part, sw) {
  var n = Math.max(6, Math.round(depth / 6)), s = "", k; sw = sw || 2.2; part = part || "all";
  if (part !== "front") {
    for (k = n; k >= 0; k--) s += onL(o, x0, y0 - depth * k / n, z0, '<path d="' + d + '" fill="none" fill-rule="evenodd" stroke="' + INK + '" stroke-width="' + f(sw * 2.2) + '" stroke-linejoin="round"/>');
    for (k = n; k >= 1; k--) s += onL(o, x0, y0 - depth * k / n, z0, '<path d="' + d + '" fill="' + side + '" fill-rule="evenodd"/>');
  }
  if (part !== "sides") s += onL(o, x0, y0, z0, '<path d="' + d + '" fill="' + front + '" fill-rule="evenodd" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linejoin="round"/>' + (inner || ""));
  return s;
}
// a vertical cylinder: base centre (x, y, z), radius r, height h. cap: SVG drawn on the top face
function ringPts(o, x, y, z, r, n) { var p = [], i; for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push(IP(o, x + r * Math.cos(a), y + r * Math.sin(a), z)); } return p; }
function cylZ(o, x, y, z, r, h, col, cap, sw, glass) {
  var n = 72, B = ringPts(o, x, y, z, r, n), Tp = ringPts(o, x, y, z + h, r, n), iL = 0, iR = 0, i; sw = sw || 2.2;
  for (i = 0; i < n; i++) { if (B[i][0] < B[iL][0]) iL = i; if (B[i][0] > B[iR][0]) iR = i; }
  // the lower arc of the base, from the left extreme to the right extreme
  var arcA = [], arcB = [];
  for (i = iL; ; i = (i + 1) % n) { arcA.push(B[i]); if (i === iR) break; }
  for (i = iL; ; i = (i - 1 + n) % n) { arcB.push(B[i]); if (i === iR) break; }
  var mid = function (a) { return a[Math.floor(a.length / 2)][1]; }, arc = mid(arcA) > mid(arcB) ? arcA : arcB;
  var d = "M" + f(Tp[iL][0]) + " " + f(Tp[iL][1]) + arc.map(function (p) { return " L" + f(p[0]) + " " + f(p[1]); }).join("") + " L" + f(Tp[iR][0]) + " " + f(Tp[iR][1]) + " Z";
  var top = "M" + Tp.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  return '<path d="' + d + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"' + (glass ? ' fill-opacity=".45"' : "") + ' stroke-linejoin="round"/>' +
    '<path d="' + top + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"' + (glass ? ' fill-opacity=".35"' : "") + '/>' + (cap ? onT(o, x, y, z + h, cap) : "");
}
// a cylinder lying along x from x0 to x1 at (y, z), radius r. Its +x end is cut: cap = SVG on that end (centred at 0,0).
// stripes: [{col, w, ph}] wind round it as a helix (the far half faint), turns = how many turns over the length
function cylX(o, x0, x1, y, z, r, col, cap, stripes, turns, t, sw) {
  var A = IP(o, x0, y, z), Bp = IP(o, x1, y, z), s = "", sc = o.s, i; sw = sw || 2.4;
  function pe(a) { var u = r * Math.cos(a), v = r * Math.sin(a); return [(-AY[0] * u - AZ[0] * v) * sc, (-AY[1] * u - AZ[1] * v) * sc]; }
  var ax = Bp[0] - A[0], ay = Bp[1] - A[1], L = Math.hypot(ax, ay) || 1, nx = -ay / L, ny = ax / L, best = -1e9, worst = 1e9, a1 = 0, a2 = 0;
  for (i = 0; i < 180; i++) { var a = i / 180 * Math.PI * 2, p = pe(a), q = p[0] * nx + p[1] * ny; if (q > best) { best = q; a1 = a; } if (q < worst) { worst = q; a2 = a; } }
  var p1 = pe(a1), p2 = pe(a2);
  s += onR(o, x0, y, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>');
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + ' L' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' Z" fill="' + col + '"/>';
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' M' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + '" stroke="' + INK + '" stroke-width="' + sw + '"/>';
  // which half faces you: world normal (0, −cos a, −sin a) against the view direction
  var V = PROJ === "iso" ? [1, 1] : [1, .75];
  (stripes || []).forEach(function (st) {
    var d = "", dh = "", on = false, onh = false, n = 200;
    for (i = 0; i <= n; i++) {
      var u = i / n, a = u * turns * Math.PI * 2 + st.ph + (t || 0) * 1.2, vis = -V[0] * Math.cos(a) - V[1] * Math.sin(a) > -.05, p = pe(a), X = lerp(A[0], Bp[0], u) + p[0] * .8, Y = lerp(A[1], Bp[1], u) + p[1] * .8;
      if (vis) { d += (on ? " L" : " M") + f(X) + " " + f(Y); on = true; onh = false; } else { dh += (onh ? " L" : " M") + f(X) + " " + f(Y); onh = true; on = false; }
    }
    s += '<path d="' + dh + '" fill="none" stroke="' + st.col + '" stroke-width="' + f(st.w * .7) + '" stroke-linecap="round" opacity=".35"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(st.w + 3) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + st.col + '" stroke-width="' + st.w + '" stroke-linecap="round"/>';
  });
  return s + onR(o, x1, y, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>' + (cap || ""));
}

// a cylinder pointing at you along y, from y0 (far) to y1 (near) at (x, z), radius r: the near end is the cut face (cap, a full circle)
function cylY(o, x, z, y0, y1, r, col, cap, stripes, turns, t, sw) {
  var A = IP(o, x, y0, z), Bp = IP(o, x, y1, z), s = "", sc = o.s, i; sw = sw || 2.4;
  function pe(a) { var u = r * Math.cos(a), v = r * Math.sin(a); return [(AX[0] * u - AZ[0] * v) * sc, (AX[1] * u - AZ[1] * v) * sc]; }
  var ax = Bp[0] - A[0], ay = Bp[1] - A[1], L = Math.hypot(ax, ay) || 1, nx = -ay / L, ny = ax / L, best = -1e9, worst = 1e9, a1 = 0, a2 = 0;
  for (i = 0; i < 180; i++) { var a = i / 180 * Math.PI * 2, p = pe(a), q = p[0] * nx + p[1] * ny; if (q > best) { best = q; a1 = a; } if (q < worst) { worst = q; a2 = a; } }
  var p1 = pe(a1), p2 = pe(a2);
  s += onL(o, x, y0, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>');
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + ' L' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' Z" fill="' + col + '"/>';
  s += '<path d="M' + f(A[0] + p1[0]) + ' ' + f(A[1] + p1[1]) + ' L' + f(Bp[0] + p1[0]) + ' ' + f(Bp[1] + p1[1]) + ' M' + f(A[0] + p2[0]) + ' ' + f(A[1] + p2[1]) + ' L' + f(Bp[0] + p2[0]) + ' ' + f(Bp[1] + p2[1]) + '" stroke="' + INK + '" stroke-width="' + sw + '"/>';
  var back = [A[0] - Bp[0], A[1] - Bp[1]];   // the body shows on the side the far end lies toward
  (stripes || []).forEach(function (st) {
    var d = "", on = false, n = 240;
    for (i = 0; i <= n; i++) {
      var u = i / n, a = u * turns * Math.PI * 2 + st.ph + (t || 0) * 1.2, p = pe(a), vis = p[0] * back[0] + p[1] * back[1] > 0, X = lerp(A[0], Bp[0], u) + p[0] * .8, Y = lerp(A[1], Bp[1], u) + p[1] * .8;
      if (vis) { d += (on ? " L" : " M") + f(X) + " " + f(Y); on = true; } else on = false;
    }
    s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(st.w + 3) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + st.col + '" stroke-width="' + st.w + '" stroke-linecap="round"/>';
  });
  return s + onL(o, x, y1, z, '<circle r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw + '"/>' + (cap || ""));
}

// ── the uterus cut open, isometric: the wall as a thick shell sliced through, the fluid inside, the placenta on the upper wall,
// the fetus and cord on the middle plane. o: origin of the cut face centre. opt like womb() + {cutHi}
var RING = "M-205 0 A205 245 0 1 0 205 0 A205 245 0 1 0 -205 0 Z M-180 0 A180 220 0 1 0 180 0 A180 220 0 1 0 -180 0 Z";
var PLACD = "M30 -216 C100 -210 160 -160 178 -80 C150 -70 120 -90 108 -112 C92 -150 60 -170 22 -176 C10 -186 12 -210 30 -216 Z";
function wombIso(o, t, opt) {
  opt = opt || {}; var D = 130, s = "", i, mid = -D * .5;
  s += onL(o, 0, -D, 0, '<ellipse rx="180" ry="220" fill="#a9bdbd" stroke="' + INK + '" stroke-width="2"/><ellipse rx="180" ry="220" fill="url(#hatch)" opacity=".35"/>');
  s += slabL(o, 0, 0, 0, D, RING, WALL, WALL2, "", "sides");
  // the placenta: a thick cake on the upper wall, from the back to near the cut
  var ph = opt.plHi ? '<path d="' + PLACD + '" fill="' + ORANGE + '" opacity="' + f(.45 * opt.plHi * (0.75 + .25 * Math.sin(t * 4))) + '"/>' : "";
  s += slabL(o, 0, -14, 0, 56, PLACD, PLAC, "#a85a48", '<path d="M45 -190 C90 -180 130 -150 150 -100 M70 -200 C110 -185 145 -150 162 -110" fill="none" stroke="' + PLAC2 + '" stroke-width="3"/>' + ph);
  // the middle plane: motes, fetus, cord
  var m = "";
  for (i = 0; i < 14; i++) { var a = hash(i) * 6.28 + t * (.15 + hash(i + 7) * .2), r = 60 + hash(i + 3) * 100; m += '<circle cx="' + f(Math.cos(a) * r * .9) + '" cy="' + f(Math.sin(a) * r * 1.1) + '" r="' + f(1.6 + hash(i + 11) * 2) + '" fill="#eef3f1" opacity=".9"/>'; }
  var fx = -20, fy = 10, fs = .8;
  if (opt.fetus !== false) m += fetus(fx, fy, fs, t, { breath: opt.breath || 0 });
  if (opt.cord !== false) m += cord(112, -128, -140 + 14 * Math.sin(t * .8), -240, fx + NAVEL[0] * fs, fy + NAVEL[1] * fs, 15, t, opt.cordK);
  if (opt.mid) m += opt.mid;
  s += onL(o, 0, mid, 0, m);
  // the fluid's near surface (a faint tint) and the cut face of the wall
  s += onL(o, 0, 0, 0, '<ellipse rx="180" ry="220" fill="' + FLUID + '" opacity=".22"/>');
  s += slabL(o, 0, 0, 0, D, RING, WALL, WALL2, '<path d="' + RING + '" fill="url(#hatch)" fill-rule="evenodd" opacity=".8"/>', "front");
  s += slabL(o, 0, 0, 0, D * .6, "M-26 236 Q0 258 26 236 L22 275 Q0 285 -22 275 Z", WALL, WALL2, "");
  return s;
}
// the mother as a solid cut through the middle (isometric slab), organs on the cut face. o = origin of her 2D box's top-left
function motherIso(o, t, opt) {
  opt = opt || {};
  return slabL(o, 0, 0, 0, 110, bodyPath(opt.flat), TAN, KHAKI, '<path d="' + bodyPath(opt.flat) + '" fill="url(#hatch)" opacity=".3"/>' + mother(0, 0, 1, t, Object.assign({ noBody: true }, opt)));
}
function stopwatchIso(o, k, t) {
  return slabL(o, 0, 0, 0, 34, "M-120 0 A120 120 0 1 0 120 0 A120 120 0 1 0 -120 0 Z M-12 -122 L-12 -146 L12 -146 L12 -122 Z", "#f4ecdb", KHAKI, stopwatch(0, 0, 112, k, t));
}

// ════ shots (one per idea; line numbers from script.txt) ════
// 4 · every cell burns oxygen and gives off CO2; breathing swaps the two. The cell is a thick cut disc.
shot(4, push(320, 400, 1.05, .97), function (u, d, t) {
  var o = { ox: 250, oy: 430, s: 1 }, i, s = paper();
  var org = '<circle cx="20" cy="-10" r="52" fill="#c98e7a" stroke="' + INK + '" stroke-width="2.4"/><circle cx="34" cy="-22" r="16" fill="#a8705e"/>';
  for (i = 0; i < 4; i++) org += G("translate(" + (-100 + i * 60) + " " + (90 - (i % 2) * 170) + ") rotate(" + (i * 40 + 6 * Math.sin(t * 1.5 + i)) + ")", '<ellipse rx="28" ry="13" fill="#d7a35a" stroke="' + INK + '" stroke-width="1.8"/><path d="M-20 0 q6 -8 12 0 t12 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>');
  s += appear(at(u, 0, .4), slabL(o, 0, 0, 0, 70, "M-190 0 A190 150 0 1 0 190 0 A190 150 0 1 0 -190 0 Z", "#ead2c2", "#cfae9b", '<ellipse rx="190" ry="150" fill="url(#hatch)" opacity=".35"/>' + org));
  for (i = 0; i < 5; i++) { var ph = (t * .5 + i / 5) % 1; s += G("", o2dot(10 + ph * 190, 300 + i * 40, 11) + N("O₂", 10 + ph * 190, 285 + i * 40, 14, OXY), at(u, .5, .4) * (ph > .85 ? (1 - ph) * 6 : 1)); }
  for (i = 0; i < 4; i++) { var p2 = (t * .45 + i / 4) % 1; s += G("", '<circle cx="' + f(430 + p2 * 200) + '" cy="' + f(420 + i * 45) + '" r="9" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.6"/>' + N("CO₂", 430 + p2 * 200, 450 + i * 45, 13, POOR), at(u, 1.6, .4) * (p2 < .15 ? p2 * 6 : 1)); }
  s += label(250, 300, 200, 180, "خلية", OLIVE, at(u, .3, .5), 26);
  return s + G("", T("النفس", 320, 700, 34, INK, 800) + arrow(200, 720, 120, 720, OXY, 5) + arrow(440, 720, 520, 720, POOR, 5), at(u, 3.2, .4));
});
// 5 · where does the baby get it? from its mother's breath: the mother as a cut solid, lungs breathing
shot(5, push(330, 420, .9, .98), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), motherIso({ ox: 110, oy: -10, s: .95 }, t, { lungHi: at(u, 1.4, .5) })) + T("؟", 540, 200, 120, ORANGE, 800) +
    label(300, 400, 470, 360, "رئة الأم", OLIVE, at(u, 1.6, .5), 26);
});
// 6 · into the mother's lungs, into her blood, down to the uterus
shot(6, push(380, 520, 1.1, 1.24), function (u, d, t) {
  return paper() + motherIso({ ox: 110, oy: -10, s: .95 }, t, { lungHi: 1, path: at(u, .4, 2.6), plHi: at(u, 3, .5) }) + label(380, 660, 520, 720, "الرحم", OLIVE, at(u, 3.1, .5), 26) + label(330, 470, 520, 430, "الدم", ORANGE, at(u, 1.6, .5), 24);
});
// 7 · an organ the size of a dinner plate: the placenta (the uterus cut open; thumbnail: a plate, about 22 cm)
shot(7, push(320, 400, 1.04, .96), function (u, d, t) {
  return paper() + wombIso({ ox: 270, oy: 430, s: 1.02 }, t, { plHi: at(u, 1.2, .5) }) + label(470, 240, 540, 110, "المشيمة", OLIVE, at(u, 1.3, .5), 28) +
    iconBox(110, 100, 150, '<ellipse cx="0" cy="8" rx="58" ry="20" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="5" rx="38" ry="12" fill="none" stroke="' + INK + '" stroke-width="1.2"/>' + N("~22 cm", 0, 56, 18, INK), at(u, .5, .3));
}, { tr: "in" });
// 8 · the placenta is the baby's lung for the whole pregnancy (closer on it)
shot(8, push(440, 280, 1.45, 1.58), function (u, d, t) {
  return paper() + wombIso({ ox: 270, oy: 430, s: 1.02 }, t, { plHi: 1 }) + tag("رئة الطفل", 470, 120, at(u, .4, .3), 30, ORANGE) +
    iconBox(300, 170, 100, G("scale(" + f(1 + .04 * Math.sin(t * 2)) + ")", '<path d="M-6 -40 C-30 -40 -44 -10 -44 18 C-44 40 -30 44 -12 38 C-6 30 -6 10 -6 -40 Z M6 -40 C30 -40 44 -10 44 18 C44 40 30 44 12 38 C6 30 6 10 6 -40 Z" fill="' + LUNG + '" stroke="' + INK + '" stroke-width="2"/>'), at(u, .9, .3));
});
// 9 · how, if the two bloods never mix? two vessels side by side, cut open at the end, never joined
function cellsCap(r, col, t) { var q = '<circle r="' + r + '" fill="#e8c3b3"/>'; for (var i = 0; i < 6; i++) { var a = i / 6 * 6.28 + t * .3, rr = r * .55; q += rbc(Math.cos(a) * rr, Math.sin(a) * rr, r * .22, col, i * 30); } return q + rbc(0, 0, r * .22, col, 0); }
shot(9, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), o = { ox: 0, oy: 150, s: 1 };
  o = { ox: 320, oy: 420, s: 1 };
  s += cylY(o, -150, 120, -700, 0, 95, MBLOOD, cellsCap(95, "#d27a5e", t), [], 0, t);
  s += cylY(o, 150, -140, -700, 0, 95, "#8fa3b0", cellsCap(95, "#c48a72", -t), [], 0, t);
  s += label(170, 300, 120, 180, "دم الأم", ORANGE, at(u, .3, .5), 26) + label(470, 560, 450, 700, "دم الطفل", BLUE, at(u, .7, .5), 26);
  return s + appear(at(u, 1.2, .3), C(320, 420, 44, PAPER, 2.4) + T("؟", 320, 444, 58, ORANGE, 800)) + cross(320, 420, 1.15, at(u, 2, .5));
});
// 10–11 · the placenta as a cut block (after Gray's fig. 39): the section on the front face, the chorionic plate with the
// cord vessels on top, the cord rising out of it. lake: the mother's blood filling the spaces
function placentaBlock(o, t, opt) {
  opt = opt || {}; var W = 520, Dp = 200, H = 520, k = W / 720, s = "", id = "pb" + (++CLIPN), i;
  // right face: the same layers seen from the side
  var side = '<rect x="0" y="0" width="' + Dp + '" height="' + H + '" fill="#efe2cf"/>' + (opt.lake ? '<rect x="0" y="' + f(H * .15) + '" width="' + Dp + '" height="' + f(H * .7) + '" fill="' + MBLOOD + '" opacity="' + f(.55 * opt.lake) + '"/>' : "") +
    '<rect x="0" y="0" width="' + Dp + '" height="' + f(H * .14) + '" fill="' + VILLUS + '"/><rect x="0" y="' + f(H * .84) + '" width="' + Dp + '" height="' + f(H * .16) + '" fill="' + WALL + '"/><rect x="0" y="' + f(H * .84) + '" width="' + Dp + '" height="' + f(H * .16) + '" fill="url(#hatch)"/>';
  for (i = 0; i < 5; i++) side += villusTree(20 + i * 40, H * .14, 60, Math.PI / 2, 1, 14, i + 3, t);
  s += onR(o, W, Dp, 0, '<g transform="translate(0 ' + (-H) + ')">' + side + '<rect width="' + Dp + '" height="' + H + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>');
  // front face: the section
  s += onL(o, 0, Dp, H, '<clipPath id="' + id + '"><rect width="' + W + '" height="' + H + '"/></clipPath><g clip-path="url(#' + id + ')"><g transform="scale(' + f(k) + ' ' + f(H / 650) + ') translate(40 -110)">' + placentaSection(t, opt) + '</g></g><rect width="' + W + '" height="' + H + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>');
  // top: the chorionic plate (baby's side) with the cord vessels branching from the cord
  var top = '<rect width="' + W + '" height="' + Dp + '" fill="' + VILLUS + '" stroke="' + INK + '" stroke-width="2.4"/>', cx = W * .5, cy = Dp * .5;
  for (i = 0; i < 7; i++) { var a = i / 7 * 6.28 + .3, L1 = 150 + 60 * hash(i), ex = cx + Math.cos(a) * L1, ey = cy + Math.sin(a) * L1 * .5;
    top += '<path d="M' + cx + ' ' + cy + ' Q' + f(cx + Math.cos(a + .3) * L1 * .5) + ' ' + f(cy + Math.sin(a + .3) * L1 * .3) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + (i % 2 ? POOR : OXY) + '" stroke-width="' + (i % 2 ? 5 : 7) + '" fill="none" stroke-linecap="round"/>'; }
  var cid = "pt" + (++CLIPN);
  s += onT(o, 0, 0, H, '<clipPath id="' + cid + '"><rect width="' + W + '" height="' + Dp + '"/></clipPath><g clip-path="url(#' + cid + ')">' + top + '</g><rect width="' + W + '" height="' + Dp + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>');
  // the cord rising from the middle of the plate
  s += cylZ(o, W * .5, Dp * .5, H, 34, 230, JELLY, '<circle cx="-8" cy="4" r="14" fill="' + OXY + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="14" cy="-10" r="8" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="12" cy="16" r="8" fill="' + POOR + '" stroke="' + INK + '" stroke-width="1.4"/>');
  return s;
}
var PBO = { ox: 90, oy: 640, s: .72 };
shot(10, push(320, 393, .98, 1.04), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), placentaBlock(PBO, t, { lake: 0, hi: at(u, .8, .6) })) +
    label(IP(PBO, 120, 200, 380)[0], IP(PBO, 120, 200, 380)[1], 120, 300, "فروع", OLIVE, at(u, 1, .5), 26) + label(IP(PBO, 260, 100, 700)[0] + 20, IP(PBO, 260, 100, 700)[1], 470, 60, "الحبل السري", OLIVE, at(u, 1.2, .5), 20) +
    iconBox(560, 300, 110, '<path d="M0 -50 V0 M0 0 Q-20 20 -38 48 M0 0 Q20 20 38 48 M0 10 Q-4 30 0 52 M-20 24 Q-34 26 -46 20 M22 22 Q34 26 44 16" stroke="#6f5a3e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-60 -10 H60" stroke="' + INK + '" stroke-width="2"/>', at(u, 1.8, .3));
}, { tr: "in" });
shot(11, push(300, 450, 1.05, 1.14), function (u, d, t) {
  return paper() + placentaBlock(PBO, t, { lake: at(u, .2, 1.6), spurt: u > .4 }) + label(IP(PBO, 200, 200, 150)[0], IP(PBO, 200, 200, 150)[1], 130, 720, "دم الأم", ORANGE, at(u, 1.4, .5), 26);
});
// 12–13 · the barrier as a cut block: mother's blood above, the thin wall, the baby's blood below; a hair lying beside it (20× thicker)
function barrierBlock(o, t, opt) {
  opt = opt || {}; var W = 470, Dp = 230, H = 420, s = "", id = "bb" + (++CLIPN), i;
  var side = '<rect width="' + Dp + '" height="' + H + '" fill="#d99c88"/><rect y="' + f(H * .5) + '" width="' + Dp + '" height="' + f(H * .5) + '" fill="#cfd8d6"/><rect y="' + f(H * .5 - 3) + '" width="' + Dp + '" height="5" fill="' + OLIVE + '"/>';
  s += onR(o, W, Dp, 0, '<g transform="translate(0 ' + (-H) + ')">' + side + '<rect width="' + Dp + '" height="' + H + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>');
  s += onL(o, 0, Dp, H, '<clipPath id="' + id + '"><rect width="' + W + '" height="' + H + '"/></clipPath><g clip-path="url(#' + id + ')"><g transform="scale(' + f(W / 720) + ' ' + f(H / 620) + ') translate(40 -50)">' + barrier(t, opt) + '</g></g><rect width="' + W + '" height="' + H + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>');
  var top = '<rect width="' + W + '" height="' + Dp + '" fill="#d99c88" stroke="' + INK + '" stroke-width="2.4"/>';
  for (i = 0; i < 8; i++) top += G("translate(" + f((i * 70 + t * 25) % W) + " " + f(30 + (i % 3) * 70) + ") rotate(" + (i * 40) + ")", '<ellipse rx="26" ry="11" fill="' + MBLOOD + '" stroke="' + INK + '" stroke-width="1.6"/>');
  var cid = "bt" + (++CLIPN);
  s += onT(o, 0, 0, H, '<clipPath id="' + cid + '"><rect width="' + W + '" height="' + Dp + '"/></clipPath><g clip-path="url(#' + cid + ')">' + top + '</g><rect width="' + W + '" height="' + Dp + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>');
  return s;
}
var BBO = { ox: 95, oy: 480, s: .8 };
shot(12, push(320, 400, .98, 1.05), function (u, d, t) {
  var o = BBO, k = at(u, .6, .6);
  var s = paper() + barrierBlock(o, t, {});
  // the hair: a dark cylinder lying in front, its cut end 20× the wall
  s += G("", cylY(BBO, 300, -120, 0, 330, 40, "#3d3229", '<circle r="40" fill="#5a4a3c" stroke="' + INK + '" stroke-width="2"/><circle r="18" fill="#2f261f"/>', [], 0, t), k);
  return s + label(IP(BBO, 120, 230, 212)[0], IP(BBO, 120, 230, 212)[1], 130, 330, "الجدار", OLIVE, at(u, .3, .5), 26) + G("", T("شعرة", 470, 640, 28, INK, 800), k) + numBox("÷20", 140, 660, at(u, 1.2, .3), 40);
}, { tr: "in" });
shot(13, push(300, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + barrierBlock(BBO, t, { o2: at(u, .2, .5), co2: at(u, 2.2, .5) }) +
    label(IP(BBO, 150, 230, 330)[0], IP(BBO, 150, 230, 330)[1], 120, 200, "دم الأم", ORANGE, at(u, .2, .5), 24) + label(IP(BBO, 200, 230, 90)[0], IP(BBO, 200, 230, 90)[1], 100, 720, "دم الطفل", BLUE, at(u, .6, .5), 24);
});
// 14 · like a tea bag in a glass: the taste comes out, the leaves stay in (an isometric glass)
shot(14, push(320, 430, 1.04, .97), function (u, d, t) {
  var o = { ox: 320, oy: 450, s: 1 }, s = paper(), k = at(u, .2, 3), i, r = 150;
  s += cylZ(o, 0, 0, -200, r, 420, "#dfe8e8", "", 2.6, true);
  var W = IP(o, 0, 0, 150), B = IP(o, 0, 0, -200);
  s += cylZ(o, 0, 0, -200, r - 3, 350, "#c9d8d8", "", 1, true);
  for (i = 0; i < 9; i++) { var a = i / 9 * 6.28 + t * .3, rr = 20 + k * (60 + 25 * Math.sin(t + i)); s += '<ellipse cx="' + f(W[0] + Math.cos(a) * rr * 1.2) + '" cy="' + f(W[1] + 120 + Math.sin(a) * rr * .8) + '" rx="' + f(30 + k * 45) + '" ry="' + f(20 + k * 30) + '" fill="#a66a3a" opacity="' + f(.1 + .06 * k) + '"/>'; }

  var bob = 6 * Math.sin(t * 1.6);
  s += '<path d="M' + f(W[0]) + ' ' + f(W[1] - 300) + ' L' + f(W[0]) + ' ' + f(W[1] + 60 + bob) + '" stroke="' + INK + '" stroke-width="1.6"/>' + R(W[0] - 20, W[1] - 320, 40, 28, "#e6d0a0", 1.6);
  s += slabL({ ox: W[0] - 20, oy: W[1] + 120 + bob, s: 1 }, -55, 0, 60, 26, "M0 0 L110 0 L110 124 L0 124 Z", "#f2e8d4", "#d8cbb0", (function () { var m = ""; for (var j = 0; j < 26; j++) m += '<path d="M' + f(12 + hash(j) * 86) + ' ' + f(12 + hash(j + 5) * 100) + ' l8 -3" stroke="#4f3a22" stroke-width="4" stroke-linecap="round"/>'; return m; })());
  return s + label(W[0] + 120, W[1] + 220, 560, 690, "الطعم", ORANGE, at(u, 1, .5), 26) + label(W[0] + 30, W[1] + 130, 560, 300, "الورق", OLIVE, at(u, 2.2, .5), 26);
}, { tr: "out" });
// 15 · unfold all the villi: about 12 m², a room's floor. An isometric room with thick cut walls; the floor tiles fill in
shot(15, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper(), k = at(u, .4, 2.6), o = { ox: 230, oy: 400, s: .95 }, i, j, n = 0;
  s += ibox(o, -20, -20, -20, 360, 280, 20, "#e3d8c0", "#cdbf9f", "#c2b392");
  s += ibox(o, -20, -20, 0, 20, 280, 180, "#d8ccae", "#e6dcc5", "#cfc2a2") + ibox(o, 0, -20, 0, 340, 20, 180, "#d8ccae", "#d9ccb0", "#cfc2a2");
  s += ipoly(o, [[60, 0, 120], [140, 0, 120], [140, 0, 60], [60, 0, 60]], "#b9c9cc", 1.6);   // a window in the back wall
  for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) { var on = n++ / 12 < k, wv = on ? 2 * Math.sin(t * 3 + i + j) : 0; s += ipoly(o, [[i * 80 + 4, j * 80 + 4, wv], [i * 80 + 76, j * 80 + 4, wv], [i * 80 + 76, j * 80 + 76, wv], [i * 80 + 4, j * 80 + 76, wv]], on ? VILLUS : "#ece2cc", 1.2) +
      (on ? (function () { var c = IP(o, i * 80 + 40, j * 80 + 40, wv); return '<path d="M' + f(c[0] - 26) + ' ' + f(c[1]) + ' q13 -10 26 0 t26 0" stroke="' + OXY + '" stroke-width="2" fill="none"/>'; })() : ""); }
  return s + G("", N(count(12, k), 320, 640, 84, ORANGE) + T("متر مربع", 320, 690, 32, INK, 800), at(u, .4, .4));
});
// 16 · the oxygen reaches the baby through the umbilical cord
shot(16, push(300, 400, .98, 1.08), function (u, d, t) {
  return paper() + wombIso({ ox: 270, oy: 430, s: 1.02 }, t, { cordK: lerp(.2, 1, at(u, .3, 1.4)), plHi: .4 }) + label(150, 150, 70, 90, "الحبل السري", OLIVE, at(u, 1.6, .5), 28);
}, { tr: "out" });
// 17 · one vein brings blood rich in oxygen, two arteries take the CO2 blood back: a length of cord cut across
function cordCap(r) { return '<circle r="' + r + '" fill="' + JELLY + '"/><circle r="' + r + '" fill="url(#hatch)" opacity=".25"/>' + C(-r * .2, r * .08, r * .36, OXY, 2.6) + C(-r * .2, r * .08, r * .18, "#e7b39a", 1.6) + C(r * .45, -r * .36, r * .2, POOR, 2.4) + C(r * .45, -r * .36, r * .09, "#b9c8d0", 1.2) + C(r * .48, r * .46, r * .2, POOR, 2.4) + C(r * .48, r * .46, r * .09, "#b9c8d0", 1.2); }
shot(17, push(320, 400, 1.04, .97), function (u, d, t) {
  var o = { ox: 230, oy: 540, s: 1 }, s = paper(), r = 150;
  s += cylY(o, 0, 0, -620, 0, r, JELLY, cordCap(r), [{ col: OXY, w: 20, ph: 0 }, { col: POOR, w: 12, ph: 2.1 }, { col: POOR, w: 12, ph: 4.2 }], 2.2, t);
  s += G("", arrow(160, 690, 70, 750, OXY, 6) + T("للطفل", 160, 770, 24, OXY, 800) + arrow(470, 600, 560, 530, POOR, 6) + T("للمشيمة", 520, 640, 24, POOR, 800), at(u, 1, .4));
  s += label(230 - r * .2, 540 + r * .08, 120, 400, "وريد", ORANGE, at(u, .6, .5), 28) + label(230 + r * .45, 540 - r * .36, 460, 400, "شريانين", BLUE, at(u, 2.6, .5), 26) + label(230 + r * .48, 540 + r * .46, 460, 400, "", BLUE, at(u, 2.8, .5), 26);
  return s;
});
// 18 · the mother's blood holds more oxygen: how does the baby get its share? two glass gauges
function tube(o, x, y, h, k, col, name, kk) {
  var r = 46, s = cylZ(o, x, y, 0, r, h * clamp(k), col, "", 2) + cylZ(o, x, y, 0, r, h, "#e8eeee", "", 2.4, true);
  var B = IP(o, x, y, 0); return appear(kk == null ? 1 : kk, s + T(name, B[0], B[1] + 60, 26, INK, 800));
}
shot(18, push(320, 420, 1.04, .98), function (u, d, t) {
  var w = .03 * Math.sin(t * 2.5), o = { ox: 320, oy: 560, s: 1 };
  return paper() + tube(o, -140, 60, 330, .95 + w, OXY, "الأم", at(u, .1, .4)) + tube(o, 120, -60, 330, .62 + w, "#d6875f", "الطفل", at(u, .5, .4)) +
    T("أكسجين", 320, 120, 30, INK, 800) + G("", T("؟", 540, 260, 110, ORANGE, 800), at(u, 1.6, .3));
}, { tr: "out" });
// 19 · fetal haemoglobin grabs oxygen harder: oxygen hops from the mother's red cell to the baby's (thick iso discs)
function rbcIso(o, x, y, r, col) { return cylZ(o, x, y, 0, r, 26, col, '<circle r="' + f(r * .55) + '" fill="#000" opacity=".14"/>', 2.4); }
shot(19, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var o = { ox: 270, oy: 470, s: 1.1 }, s = paper() + rbcIso(o, -120, 60, 105, "#d27a5e") + rbcIso(o, 110, -110, 105, "#c9694c"), i;
  var A = IP(o, -120, 60, 26), Bp = IP(o, 110, -110, 26);
  for (i = 0; i < 6; i++) { var ph = (t * .5 + i / 6) % 1, x = lerp(A[0] + 30, Bp[0] - 10, ease(ph)), y = lerp(A[1], Bp[1], ease(ph)) - Math.sin(ph * Math.PI) * 90 + i * 6; s += G("", o2dot(x, y, 12), at(u, .6, .4)); }
  for (i = 0; i < 5; i++) s += o2dot(Bp[0] - 30 + (i % 3) * 30, Bp[1] - 6 + Math.floor(i / 3) * 30, 12);
  return s + label(A[0] - 40, A[1] + 60, 110, 640, "دم الأم", ORANGE, at(u, .3, .5), 26) + label(Bp[0] + 60, Bp[1] + 60, 420, 600, "هيموجلوبين الطفل", OLIVE, at(u, 1, .5), 24) + tag("أقوى", 480, 170, at(u, 2.6, .3), 32, ORANGE);
});
// 20 · like a stronger magnet pulling the nail away from a weaker one (extruded horseshoes)
var HSHOE = "M-60 -70 L-60 20 A60 60 0 0 0 60 20 L60 -70 L28 -70 L28 20 A28 28 0 0 1 -28 20 L-28 -70 Z";
shot(20, push(320, 420, 1.02, .97), function (u, d, t) {
  var k = at(u, .6, 1.2), nx = lerp(150, 330, k) + 3 * Math.sin(t * 9) * (1 - k), o = { ox: 140, oy: 300, s: 1 };
  var s = paper() + slabL({ ox: 150, oy: 410, s: .8 }, 0, 0, 0, 40, HSHOE, "#8fa3b0", "#6f8594", '<rect x="-60" y="-90" width="32" height="22" fill="#e9e3d6" stroke="' + INK + '" stroke-width="2"/><rect x="28" y="-90" width="32" height="22" fill="#e9e3d6" stroke="' + INK + '" stroke-width="2"/>');
  s += cylX({ ox: nx, oy: 410, s: 1 }, -60, 60, 0, 0, 7, "#b8b8b0", "", [], 0, t);
  s += slabL({ ox: 480, oy: 520, s: 1.25 }, 0, 0, 0, 44, HSHOE, ORANGE, "#8f3f22", '<rect x="-60" y="-90" width="32" height="22" fill="#e9e3d6" stroke="' + INK + '" stroke-width="2"/><rect x="28" y="-90" width="32" height="22" fill="#e9e3d6" stroke="' + INK + '" stroke-width="2"/>');
  return s + label(150, 450, 120, 600, "أضعف", BLUE, at(u, .3, .5), 26) + label(480, 560, 500, 700, "أقوى", ORANGE, at(u, .3, .5), 26);
});
// 21 · the myth: the baby breathes the fluid like a fish — no (a fish with gills, crossed out)
shot(21, push(320, 420, 1.06, .98), function (u, d, t) {
  return paper() + wombIso({ ox: 300, oy: 460, s: .9 }, t, {}) +
    iconBox(510, 110, 170, '<path d="M-60 0 Q-20 -40 30 -10 L60 -34 L56 0 L60 34 L30 10 Q-20 40 -60 0 Z" fill="#9ab0b8" stroke="' + INK + '" stroke-width="2"/><circle cx="-38" cy="-6" r="4" fill="' + INK + '"/><path d="M-20 -14 Q-12 0 -20 14 M-12 -16 Q-4 0 -12 16" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' +
      (function () { var m = ""; for (var j = 0; j < 3; j++) { var ph = (t * .6 + j / 3) % 1; m += '<circle cx="' + f(-70 - 8 * j) + '" cy="' + f(-10 - ph * 60) + '" r="5" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; } return m; })(), at(u, .2, .3)) +
    cross(510, 110, 1.4, at(u, d - 1.3, .5));
});
// 22 · he does move his chest and pull fluid in and out: practice for the muscles, not breathing (close on the fetus)
shot(22, push(250, 470, 1.5, 1.65), function (u, d, t) {
  var b = (Math.sin(t * 3.2) + 1) / 2, m = "", i;
  for (i = 0; i < 3; i++) { var ph = (t * .53 + i / 3) % 1, mx = -20 - 95 * .8, my = 10 + 195 * .8; m += '<path d="M' + f(mx - 10 - ph * 40) + ' ' + f(my - 8 + i * 8) + ' q-8 -6 -16 0" stroke="' + BLUE + '" stroke-width="2.4" fill="none" opacity="' + f(1 - ph) + '"/>'; }
  return paper() + wombIso({ ox: 300, oy: 460, s: .9 }, t, { breath: b, mid: m }) + tag("تمرين", 190, 300, at(u, 2.2, .3), 30, ORANGE) + label(270, 420, 360, 330, "الصدر", OLIVE, at(u, .4, .5), 22);
}, { tr: "in" });
// 23 · in short: mother breathes, placenta swaps, cord delivers, baby's blood grabs
shot(23, push(330, 420, .9, .97), function (u, d, t) {
  return paper() + motherIso({ ox: 90, oy: -10, s: .95 }, t, { lungHi: 1, path: 1, plHi: at(u, 1.3, .4) }) +
    callout("1", 300, 420, at(u, .3, .3), 20) + callout("2", 380, 560, at(u, 1.3, .3), 20) + callout("3", 330, 650, at(u, 2.3, .3), 20) + callout("4", 270, 700, at(u, 3.4, .3), 20) +
    G("", T("بتتنفس", 520, 300, 26, BLUE, 800), at(u, .4, .3)) + G("", T("بتبدّل", 560, 470, 26, OLIVE, 800), at(u, 1.4, .3)) + G("", T("بيوصّل", 560, 590, 26, OLIVE, 800), at(u, 2.4, .3)) + G("", T("بيمسك", 560, 710, 26, ORANGE, 800), at(u, 3.5, .3));
}, { tr: "out" });
// 24 · the odd fact: the baby's blood oxygen is close to yours on top of Everest (8,849 m). An isometric mountain block
var EVEREST = "M0 380 L80 250 L130 280 L210 150 L250 175 L290 60 L330 120 L380 95 L440 210 L500 190 L560 380 Z", SNOW = "M210 150 L250 175 L290 60 L330 120 L380 95 L402 136 L370 140 L330 160 L290 120 L250 210 Z";
shot(24, push(320, 420, 1.04, .97), function (u, d, t) {
  var s = paper(), k = at(u, .3, 1.2), fl = 4 * Math.sin(t * 4), o = { ox: 40, oy: 140, s: 1 };
  s += slabL(o, 0, 0, 0, 160, EVEREST, "#b9b2a2", "#9a927f", '<path d="' + SNOW + '" fill="#f6f3ea" stroke="' + INK + '" stroke-width="2"/><path d="M0 380 L560 380" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M290 60 L290 0" stroke="' + INK + '" stroke-width="3"/><path d="M290 2 L' + f(330 + fl) + ' 14 L290 26 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>');
  s += N("8,849 m", 170, 130, 30, INK) + tag("إفرست", 470, 130, at(u, .2, .3), 30, ORANGE);
  var g = { ox: 320, oy: 680, s: .85 };
  s += tube(g, -150, 60, 130, .45 + .02 * Math.sin(t * 2), "#d6875f", "الطفل", k) + tube(g, 110, -90, 130, .42 + .02 * Math.cos(t * 2), "#d6875f", "فوق إفرست", at(u, .8, .4));
  return s + G("", T("≈", 320, 620, 70, ORANGE, 800), at(u, 1.6, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: hold your breath two minutes — you, and a stopwatch running. line 1: the baby in the cut-open womb, 9 months. line 2: no air (✗)
  var s = "";
  if (li === 0) {
    var k = clamp((t - LN[0].start) / Math.max(1, LN[0].end - LN[0].start));
    s += motherIso({ ox: 10, oy: 40, s: .78 }, t, { uterus: false, flat: true }) + stopwatchIso({ ox: 440, oy: 230, s: .9 }, k, t) + N(Math.floor(k * 2) + ":" + ("0" + Math.floor((k * 120) % 60)).slice(-2), 470, 440, 44, ORANGE);
  } else {
    s += wombIso({ ox: 270, oy: 360, s: 1.0 }, t, {});
    if (li >= 1) s += tag("9 شهور", 510, 60, ease((t - LN[1].start) / .4), 30, ORANGE);
    if (li >= 2) { var u = t - LN[2].start, M = IP({ ox: 270, oy: 360, s: 1 }, -96, -65, -166);
      s += G("", '<path d="M' + f(M[0] - 90) + ' ' + f(M[1] - 20) + ' l40 20 l-40 20 M' + f(M[0] - 120) + ' ' + f(M[1] - 20) + ' l40 20 l-40 20" stroke="' + BLUE + '" stroke-width="5" fill="none" stroke-linecap="round"/>', ease(u / .3)) + cross(M[0] - 80, M[1], 1, ease((u - .4) / .4)); }
  }
  return s;
};
SCENE.bumper = function (u, t) { return wombIso({ ox: 80, oy: 105, s: .3 }, t, {}); };
SCENE.outro = function (svg, u, t) {
  var o = { ox: 270, oy: 150, s: .5 };
  return wombIso(o, t, {}) + callout("1", 360, 40, ease(u / .3)) + callout("2", 330, 85, ease(u / .3 - .5)) + callout("3", 230, 70, ease(u / .3 - 1)) + callout("4", 240, 175, ease(u / .3 - 1.5));
};
