// ── «إزاي الدكتور بيعرف ضغط دمك؟» — drawings. Shapes from real references (refs/SOURCES.md): the aneroid kit in
// «Blood pressure monitoring.jpg» (grey cuff, two black tubes, black bulb with a brass valve, square dial 0–300 mmHg with a
// white needle), the brachial artery from Gray's Anatomy («Brachial a.png»: one red artery on the inner side of the humerus,
// splitting below the elbow), a mercury column, an upper-arm digital monitor and Hales's 1733 horse. Drawn the «طب إزاي؟» way
// (sheet v17: salmon heart and red/blue vessels; sheet v07: the arm and its bone).
var BLOOD = "#b8432f", BLOOD_D = "#8a2e22", LUMEN = "#e7a08c", VEIN = "#4a6f8a", MUSCLE = "#d98f78", MUSCLE_D = "#c27560",
    FAT = "#ecd6a6", BONE = "#efe6cf", CUFF = "#c9ccc8", CUFF_D = "#9ea39f", RUBBER = "#2b2a28", GLASS = "#e1eaec", MERC = "#9aa4aa",
    BRASS = "#c8a35a", DIAL = "#2d2a26", HEART = "#d9806a", HEART_D = "#b4604c", WOOD_T = "#b88a5c", WOOD_TD = "#8c6440";
function beat(t) { var p = (t * 1.2) % 1; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; }      // one heartbeat pulse, 72 a minute
// the arterial pressure wave, 0 at the trough (80) and 1 at the peak (120): a steep rise, a slow fall with the dicrotic notch
function pw(ph) { ph = ((ph % 1) + 1) % 1; return ph < .15 ? Math.sin(ph / .15 * Math.PI / 2) : Math.pow(1 - (ph - .15) / .85, 1.6) + .08 * Math.exp(-Math.pow((ph - .4) / .04, 2)); }
function tube(d, w) { w = w || 7; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + RUBBER + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#5a5854" stroke-width="' + (w * .25) + '" fill="none" stroke-linecap="round" transform="translate(-1 -1.5)"/>'; }

// ── the aneroid gauge (reference photo: white square case, black face, white ticks every 2, numbers every 20, 0 at the top) ──
function gauge(cx, cy, r, val, k) {
  var s = '<rect x="' + f(cx - r * 1.16) + '" y="' + f(cy - r * 1.16) + '" width="' + f(r * 2.32) + '" height="' + f(r * 2.32) + '" rx="' + f(r * .22) + '" fill="#f1efe8" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<rect x="' + f(cx - r * 1.16 + 5) + '" y="' + f(cy + r * .9) + '" width="' + f(r * 2.32 - 10) + '" height="' + f(r * .2) + '" fill="#d9d5ca"/>' + C(cx, cy, r, DIAL, 2.4);
  for (var v = 0; v <= 300; v += 2) {
    var a = (-90 + v / 320 * 360) * Math.PI / 180, big = v % 10 === 0, r1 = r * (big ? .78 : .86), r2 = r * .93;
    s += '<path d="M' + f(cx + Math.cos(a) * r1) + ' ' + f(cy + Math.sin(a) * r1) + ' L' + f(cx + Math.cos(a) * r2) + ' ' + f(cy + Math.sin(a) * r2) + '" stroke="#f1efe8" stroke-width="' + (big ? r * .025 : r * .011) + '"/>';
    if (v % 20 === 0 && r > 40) s += N(v, cx + Math.cos(a) * r * .63, cy + Math.sin(a) * r * .63 + r * .05, r * .13, "#f1efe8");
  }
  if (r > 40) s += T("mmHg", cx, cy + r * .36, r * .1, "#f1efe8", 700);
  var na = (-90 + clamp(val / 320) * 360) * Math.PI / 180;
  s += '<path d="M' + f(cx - Math.cos(na) * r * .15) + ' ' + f(cy - Math.sin(na) * r * .15) + ' L' + f(cx + Math.cos(na) * r * .86) + ' ' + f(cy + Math.sin(na) * r * .86) + '" stroke="#fbf8f1" stroke-width="' + f(Math.max(2, r * .035)) + '" stroke-linecap="round"/>' + C(cx, cy, r * .06, "#d0cbbf", 1.2);
  return k == null ? s : appear(k, s);
}
function needleAt(v, cx, cy, r) { var a = (-90 + v / 320 * 360) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
// the rubber bulb with its brass valve and thumb screw; sq 0..1 squeezes it
function bulb(x, y, s, sq) {
  var rx = 34 * s * (1 - .25 * sq), ry = 46 * s * (1 + .06 * sq);
  return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + RUBBER + '" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="' + f(x - rx * .4) + '" cy="' + f(y - ry * .35) + '" rx="' + f(rx * .18) + '" ry="' + f(ry * .3) + '" fill="#6b6964" opacity=".7"/>' +
    R(x - 9 * s, y - ry - 22 * s, 18 * s, 24 * s, BRASS, 1.8) + R(x - 15 * s, y - ry - 16 * s, 6 * s, 10 * s, "#a8873f", 1.4);
}
// ── the arm palm-up on the table, from above (as in the reference photo), drawn to real adult measures (cm):
// upper arm 33 (shoulder → elbow) · forearm 26 · hand 19 (palm 10.5, middle finger 8) · widths: upper arm 9.5, elbow 7.5,
// forearm 8.5 at its belly, wrist 5.5, palm 8.5, a finger 1.8. 1 cm = 6.5 units × sc. Left = shoulder, right = fingertips,
// the thumb on the lower side. cuffK: the cuff's swell 0..1 (null: no cuff).
function smoothOutline(pts) {   // [[x, y]…] → a smooth path through the points
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length - 1; i++) d += " Q" + f(pts[i][0]) + " " + f(pts[i][1]) + " " + f((pts[i][0] + pts[i + 1][0]) / 2) + " " + f((pts[i][1] + pts[i + 1][1]) / 2);
  return d + " L" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]);
}
function armSide(x0, y0, sc, cuffK, op) {
  op = op || {}; var c = PERSON.colors, cm = 6.5 * sc, s = "";
  var X = function (v) { return x0 + v * cm; };
  // half-widths along the arm (cm from the shoulder): deltoid, biceps, above the elbow, elbow, forearm belly, wrist
  var prof = [[-6, 5.0], [0, 4.9], [8, 4.75], [16, 4.5], [26, 3.9], [33, 3.75], [37, 4.1], [42, 4.25], [50, 3.6], [56, 2.95], [59, 2.75]];
  var top = prof.map(function (q) { return [X(q[0]), y0 - q[1] * cm]; }), bot = prof.slice().reverse().map(function (q) { return [X(q[0]), y0 + q[1] * cm * (q[0] > 34 ? .96 : 1)]; });
  var arm = smoothOutline(top) + " L" + smoothOutline(bot).slice(1) + " Z";
  s += '<path d="' + arm + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="' + smoothOutline(prof.slice(1, 9).map(function (q) { return [X(q[0]), y0 + q[1] * cm * .62]; })) + '" stroke="' + c.skinD + '" stroke-width="' + f(1.6 * cm) + '" fill="none" opacity=".35" stroke-linecap="round"/>';   // shade on the lower side
  s += '<path d="M' + f(X(32)) + ' ' + f(y0 - .6 * cm) + ' q' + f(1.2 * cm) + ' ' + f(.9 * cm) + ' ' + f(2.6 * cm) + ' ' + f(.5 * cm) + '" stroke="' + c.skinD + '" stroke-width="1.6" fill="none"/>';   // the elbow crease (where the stethoscope goes)
  s += '<path d="M' + f(X(40)) + ' ' + f(y0 + .4 * cm) + ' C' + f(X(46)) + ' ' + f(y0 + .1 * cm) + ' ' + f(X(52)) + ' ' + f(y0 - .5 * cm) + ' ' + f(X(57)) + ' ' + f(y0 - .2 * cm) + '" stroke="#8aa0b4" stroke-width="1.6" fill="none" opacity=".7"/>';   // a vein under the skin
  if (op.ghost) s += op.ghost;
  s += palmUp(X(59), y0, cm);
  if (op.sleeve !== false) s += '<path d="M' + f(X(-12)) + ' ' + f(y0 - 6.4 * cm) + ' L' + f(X(-1)) + ' ' + f(y0 - 6.1 * cm) + ' Q' + f(X(.6)) + ' ' + f(y0) + ' ' + f(X(-1)) + ' ' + f(y0 + 6.3 * cm) + ' L' + f(X(-12)) + ' ' + f(y0 + 6.5 * cm) + ' Z" fill="' + (op.sleeveCol || "#c9a77c") + '" stroke="' + INK + '" stroke-width="2.2"/>';
  if (cuffK != null) s += cuffBand(X(5), y0, 14 * cm, 5.4 * cm, cuffK);
  return s;
}
// the hand palm up, fingers loosely curled (reference photo); wx, wy = the wrist crease centre, cm = units per cm
function palmUp(wx, wy, cm) {
  var c = PERSON.colors, s = "";
  var P = function (x, y) { return [wx + x * cm, wy + y * cm]; }, pt = function (q) { return f(q[0]) + " " + f(q[1]); };
  // fingers: base on the knuckle line, length (cm), spread (deg); each bends 12°, 38°, 62° toward the viewer, so the
  // segments shorten (cos) as a real relaxed hand's do seen from above
  var F = [[[9.3, -3.0], 6.2, -9, .82], [[10.3, -1.0], 7.5, -3, .9], [[10.6, 1.1], 8.0, 2, .95], [[10.2, 3.1], 7.3, 7, .92]];
  F.forEach(function (fi) {
    var a = fi[2] * Math.PI / 180, x = fi[0][0], y = fi[0][1], pts = [P(x, y)], segs = [.45, .3, .25], bend = [12, 38, 62], w = 1.75 * fi[3] * cm;
    segs.forEach(function (sg, k) { var L = fi[1] * sg * Math.cos(bend[k] * Math.PI / 180); x += Math.cos(a) * L; y += Math.sin(a) * L; pts.push(P(x, y)); });
    var d = "M" + pts.map(pt).join(" L");
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + c.skin + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    for (var k = 1; k < 3; k++) { var q = pts[k], nx = -Math.sin(a) * w * .42, ny = Math.cos(a) * w * .42; s += '<path d="M' + f(q[0] - nx) + ' ' + f(q[1] - ny) + ' L' + f(q[0] + nx) + ' ' + f(q[1] + ny) + '" stroke="' + c.skinD + '" stroke-width="1.4"/>'; }   // joint creases
    var tip = pts[3]; s += '<ellipse cx="' + f(tip[0] - Math.cos(a) * w * .15) + '" cy="' + f(tip[1]) + '" rx="' + f(w * .34) + '" ry="' + f(w * .3) + '" fill="' + c.skinL + '"/>';   // the finger pad
  });
  // thumb: from the thenar pad toward the fingers, lying on the lower side
  var th = [P(2.4, 2.6), P(4.8, 3.9), P(7.4, 4.6), P(9.2, 4.4)], td = "M" + th.map(pt).join(" L");
  s += '<path d="' + td + '" stroke="' + INK + '" stroke-width="' + f(2.1 * cm + 4.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + td + '" stroke="' + c.skin + '" stroke-width="' + f(2.1 * cm) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  s += '<path d="M' + pt(P(7.2, 3.9)) + ' L' + pt(P(7.5, 5.1)) + '" stroke="' + c.skinD + '" stroke-width="1.4"/><ellipse cx="' + f(P(8.6, 4.4)[0]) + '" cy="' + f(P(8.6, 4.4)[1]) + '" rx="' + f(.7 * cm) + '" ry="' + f(.6 * cm) + '" fill="' + c.skinL + '"/>';
  // the palm: narrow at the wrist, widest across the knuckles, the thenar bulge at the thumb, the hypothenar on the other side
  var palm = smoothOutline([P(0, -2.6), P(3, -3.6), P(7, -4.2), P(9.6, -4.0), P(10.6, -2.0), P(11.0, .2), P(10.8, 2.4), P(10.0, 4.0), P(7.4, 3.6), P(4.6, 3.6), P(1.6, 3.0), P(0, 2.7)]) + " Z";
  s += '<path d="' + palm + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="' + smoothOutline([P(.8, 2.2), P(3.4, 3.0), P(5.6, 2.6)]) + '" stroke="' + c.skinD + '" stroke-width="' + f(.9 * cm) + '" fill="none" opacity=".35" stroke-linecap="round"/>';   // thenar shade
  // the palm lines: heart line, head line, life line round the thumb pad; two wrist creases
  s += '<path d="' + smoothOutline([P(9.4, -3.3), P(7.4, -2.2), P(5.6, -2.0), P(4.4, -2.6)]) + '" stroke="' + c.skinD + '" stroke-width="1.5" fill="none"/>' +
       '<path d="' + smoothOutline([P(9.6, 2.6), P(7.0, .2), P(4.4, -.6), P(2.6, -.2)]) + '" stroke="' + c.skinD + '" stroke-width="1.5" fill="none"/>' +
       '<path d="' + smoothOutline([P(9.4, 3.2), P(6.2, 2.0), P(3.6, 1.6), P(1.4, 2.0)]) + '" stroke="' + c.skinD + '" stroke-width="1.5" fill="none"/>' +
       '<path d="M' + pt(P(.3, -2.2)) + ' Q' + pt(P(.9, 0)) + ' ' + pt(P(.3, 2.3)) + ' M' + pt(P(-.5, -2.3)) + ' Q' + pt(P(.1, 0)) + ' ' + pt(P(-.5, 2.4)) + '" stroke="' + c.skinD + '" stroke-width="1.3" fill="none"/>';
  return s;
}
// the grey cuff seen from the side: a band round the upper arm that swells when pumped
function cuffBand(x, cy, w, h, k) {
  var sw = 8 * k, s = '<path d="M' + f(x) + ' ' + f(cy - h - sw) + ' Q' + f(x + w / 2) + ' ' + f(cy - h - sw * 2.2) + ' ' + f(x + w) + ' ' + f(cy - h - sw) + ' L' + f(x + w) + ' ' + f(cy + h + sw) + ' Q' + f(x + w / 2) + ' ' + f(cy + h + sw * 2.2) + ' ' + f(x) + ' ' + f(cy + h + sw) + ' Z" fill="' + CUFF + '" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + f(x + 5) + ' ' + f(cy - h - sw + 4) + ' L' + f(x + 5) + ' ' + f(cy + h + sw - 4) + ' M' + f(x + w - 5) + ' ' + f(cy - h - sw + 4) + ' L' + f(x + w - 5) + ' ' + f(cy + h + sw - 4) + '" stroke="#5f6461" stroke-width="3"/>';
  for (var i = 1; i < 6; i++) s += '<path d="M' + f(x + 12) + ' ' + f(cy - h + i * h / 3) + ' L' + f(x + w - 12) + ' ' + f(cy - h + i * h / 3) + '" stroke="' + CUFF_D + '" stroke-width="1" opacity=".6"/>';
  return s;
}

// ── the arm cut open along its length under the cuff: skin, fat, muscle, the humerus and the brachial artery ──
// sq: how hard the cuff squeezes (0 open … 1 shut); mode: "smooth" | "burst" | "none"; t: time
function armCut(sq, mode, t, op) {
  op = op || {}; var s = "", cy = 400, ay = 352, ar = 15, cx0 = 200, cx1 = 440, k;
  s += R(-40, cy - 150, 720, 300, MUSCLE, 2.4) + '<rect x="-40" y="' + (cy - 150) + '" width="720" height="300" fill="url(#hatch)" opacity=".35"/>';
  s += R(-40, cy - 150, 720, 18, FAT, 0) + R(-40, cy + 132, 720, 18, FAT, 0) + '<path d="M-40 ' + (cy - 132) + ' H680 M-40 ' + (cy + 132) + ' H680" stroke="' + INK + '" stroke-width="1.2"/>';
  for (k = 0; k < 9; k++) s += '<path d="M' + (k * 80 - 30) + ' ' + (cy - 110) + ' q40 ' + (20 + 10 * (k % 2)) + ' 80 0" stroke="' + MUSCLE_D + '" stroke-width="1.4" fill="none" opacity=".7"/>';
  s += R(-40, cy + 30, 720, 52, BONE, 2.2, 26) + '<path d="M-40 ' + (cy + 46) + ' H680" stroke="#d8ccae" stroke-width="5"/>';   // the humerus
  s += '<path d="M-40 ' + (cy - 60) + ' H680" stroke="' + VEIN + '" stroke-width="16" stroke-linecap="round"/><path d="M-40 ' + (cy - 60) + ' H680" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  // the artery: its half-height under the cuff shrinks with the squeeze, with soft shoulders either side
  function hh(x) { var e = Math.min(clamp((x - cx0 + 50) / 50), clamp((cx1 + 50 - x) / 50)); return ar * (1 - sq * ease(e)); }
  var up = "", dn = "";
  for (k = -40; k <= 680; k += 10) { up += (k === -40 ? "M" : " L") + k + " " + f(ay - hh(k) - 6); dn = " L" + k + " " + f(ay + hh(k) + 6) + dn; }
  s += '<path d="' + up + dn + ' Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/>';
  var iu = "", idn = "";
  for (k = -40; k <= 680; k += 10) { iu += (k === -40 ? "M" : " L") + k + " " + f(ay - hh(k)); idn = " L" + k + " " + f(ay + hh(k)) + idn; }
  s += '<path d="' + iu + idn + ' Z" fill="' + LUMEN + '"/>';
  // red cells: they stream (smooth), go through in spurts with each beat (burst), or pile up against the shut part (none)
  for (k = 0; k < 26; k++) {
    var x, ph = (t * 1.2) % 1, n = Math.floor(t * 1.2);
    if (mode === "smooth") x = ((k * 29 + t * 120) % 760) - 40;
    else if (mode === "burst") { var base = ((k * 29) % 760) - 40; x = base < cx0 ? base + (base > cx0 - 90 ? 18 * beat(t) : 0) : base + (ease(ph / .3) + n) * 60 % 300; if (x > 680) continue; }
    else { x = ((k * 29) % 760) - 40; if (x > cx0 - 20 && x < cx1 + 40) x = cx0 - 30 - (k % 4) * 14; if (x > cx1) continue; x += 6 * beat(t); }
    var h = hh(x); if (h < 4) continue;
    s += '<ellipse cx="' + f(x) + '" cy="' + f(ay + ((k * 7) % 3 - 1) * h * .45) + '" rx="7" ry="' + f(Math.min(5, h * .45)) + '" fill="' + BLOOD_D + '" stroke="' + INK + '" stroke-width=".8"/>';
  }
  // the cuff pressing from above and below (shaded bands on the skin), as thick as the squeeze
  if (op.cuff !== false) { var cw = 10 + 24 * sq; s += R(cx0, cy - 150 - 24 - cw * .2, cx1 - cx0, 24 + cw * .2, CUFF, 2.2) + R(cx0, cy + 150, cx1 - cx0, 24 + cw * .2, CUFF, 2.2);
    for (k = 0; k < 4; k++) { var ax = cx0 + 30 + k * 60; s += arrow(ax, cy - 220, ax, cy - 180 + 20 * sq, ORANGE, 4, clamp(sq * 1.5)) ; } }
  // the knock: when blood spurts under the cuff, orange arcs on the far side
  if (mode === "burst") { var bk = beat(t); if (bk > .05) for (k = 0; k < 3; k++) s += '<path d="M' + f(cx1 + 30 + k * 16) + ' ' + f(ay - 26 - k * 8) + ' q' + f(12 + k * 4) + ' ' + f(26 + k * 8) + ' 0 ' + f(52 + k * 16) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" opacity="' + f(bk) + '"/>'; }
  return s;
}
// ── the heart (sheet v17 look: salmon muscle, red aorta arching up, blue vein), beating with t ──
function heart(x, y, sc, t) {
  var b = 1 + .05 * beat(t), s = "";
  s += G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc * b) + ")",
    '<path d="M-10 -70 C-12 -120 40 -150 70 -128 C92 -112 94 -88 90 -76" stroke="' + INK + '" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M-10 -70 C-12 -120 40 -150 70 -128 C92 -112 94 -88 90 -76" stroke="' + BLOOD + '" stroke-width="28" fill="none" stroke-linecap="round"/>' +
    '<path d="M-44 -66 C-48 -110 -70 -120 -86 -118" stroke="' + INK + '" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M-44 -66 C-48 -110 -70 -120 -86 -118" stroke="' + VEIN + '" stroke-width="22" fill="none" stroke-linecap="round"/>' +
    '<path d="M-6 -66 C40 -96 104 -70 98 -8 C92 54 34 96 6 122 C-30 96 -100 52 -98 -8 C-96 -62 -46 -90 -6 -66 Z" fill="' + HEART + '" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M-6 -66 C40 -96 104 -70 98 -8 C92 54 34 96 6 122 C-30 96 -100 52 -98 -8 C-96 -62 -46 -90 -6 -66 Z" fill="url(#hatch)" opacity=".35"/>' +
    '<path d="M10 -58 C0 -10 20 50 8 110" stroke="' + HEART_D + '" stroke-width="3" fill="none"/><path d="M-60 -30 C-40 -40 -20 -36 -6 -30" stroke="' + HEART_D + '" stroke-width="2" fill="none"/>');
  return s;
}
// a length of artery cut open: wall, lumen, cells flowing, the pressure pushing on the wall (arrows pulse with the beat)
function arteryCut(x0, y0, w, r, t, k) {
  var p = .4 + .6 * pw(t * 1.2), rr = r * (1 + .08 * p), s = "";
  s += R(x0, y0 - rr - 10, w, 2 * rr + 20, BLOOD, 2.4, rr) + R(x0 + 2, y0 - rr, w - 4, 2 * rr, LUMEN, 0, rr * .8);
  for (var i = 0; i < 14; i++) { var x = x0 + 10 + ((i * 37 + t * 140 * (.4 + p)) % (w - 20)); s += '<ellipse cx="' + f(x) + '" cy="' + f(y0 + ((i * 5) % 3 - 1) * rr * .45) + '" rx="9" ry="6" fill="' + BLOOD_D + '" stroke="' + INK + '" stroke-width=".8"/>'; }
  for (i = 0; i < 4; i++) { var ax = x0 + 40 + i * (w - 80) / 3, L = 14 + 22 * p; s += arrow(ax, y0 - rr + 6, ax, y0 - rr - L, ORANGE, 4, k) + arrow(ax, y0 + rr - 6, ax, y0 + rr + L, ORANGE, 4, k); }
  return s;
}
// ── the mercury column: a glass tube with a mm scale, the reservoir at the bottom, the level in mm ──
function mercury(x, y0, hpx, mm, k) {
  var ppm = hpx / 300, top = y0 - hpx, lv = y0 - mm * ppm, s = "";
  s += R(x - 70, top - 30, 140, hpx + 90, "#e8dcc0", 2.4, 8);
  for (var v = 0; v <= 300; v += 5) { var yy = y0 - v * ppm, big = v % 10 === 0; s += '<path d="M' + f(x + 16) + ' ' + f(yy) + ' h' + (big ? 22 : 12) + '" stroke="' + INK + '" stroke-width="' + (big ? 1.6 : .9) + '"/>'; if (v % 20 === 0) s += N(v, x + 48, yy + 6, 16, INK, "start"); }
  s += R(x - 10, top - 10, 20, hpx + 20, GLASS, 2) + R(x - 5, lv, 10, y0 + 10 - lv, MERC, 0) + '<path d="M' + f(x - 5) + ' ' + f(lv) + ' q5 -5 10 0" stroke="' + INK + '" stroke-width="1.4" fill="' + MERC + '"/>' + '<path d="M' + f(x + 3) + ' ' + f(top) + ' V' + f(y0) + '" stroke="#fff" stroke-width="2" opacity=".6"/>';
  s += '<ellipse cx="' + x + '" cy="' + f(y0 + 30) + '" rx="34" ry="22" fill="' + MERC + '" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="' + f(x - 10) + '" cy="' + f(y0 + 24) + '" rx="9" ry="5" fill="#fff" opacity=".5"/>';
  return k == null ? s : appear(k, s);
}
// ── the stethoscope's chest piece, tubes and ear tips ──
function stetho(x, y, sc, earX, earY) {
  return tube("M" + f(x) + " " + f(y - 20 * sc) + " C" + f(x) + " " + f(y - 120 * sc) + " " + f(earX + 40) + " " + f(earY + 160) + " " + f(earX + 20) + " " + f(earY + 60), 6) +
    '<path d="M' + f(earX + 20) + ' ' + f(earY + 60) + ' l-30 -60 M' + f(earX + 20) + ' ' + f(earY + 60) + ' l30 -60" stroke="#b9bcbd" stroke-width="6" stroke-linecap="round"/>' + C(earX - 10, earY, 7, RUBBER, 1.4) + C(earX + 50, earY, 7, RUBBER, 1.4) +
    '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(34 * sc) + '" ry="' + f(12 * sc) + '" fill="#b9bcbd" stroke="' + INK + '" stroke-width="2.2"/>' + R(x - 10 * sc, y - 28 * sc, 20 * sc, 18 * sc, "#d5d8d9", 1.8);
}
// ── the upper-arm digital monitor: white case, LCD with SYS/DIA, a start button; osc = the cuff wiggle trace ──
function monitor(x, y, sc, sys, dia, t, op) {
  op = op || {}; var s = G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")",
    '<path d="M-110 -80 Q-110 -96 -94 -96 H94 Q110 -96 110 -80 V86 Q110 100 94 100 H-94 Q-110 100 -110 86 Z" fill="#f3f1ec" stroke="' + INK + '" stroke-width="2.6"/>' +
    R(-86, -76, 172, 112, "#b9c7a6", 2.2, 6) + T("SYS", 64, -50, 14, INK, 800) + T("DIA", 64, 0, 14, INK, 800) +
    N(sys, 30, -26, 46, INK, "end") + N(dia, 30, 24, 40, INK, "end") + C(0, 70, 18, BLUE, 2.2) + T("START", 0, 76, 10, "#fff", 800));
  return s;
}
// the oscillation trace the monitor reads: wiggles that grow then shrink as the cuff empties
function oscTrace(x0, y0, w, h, k, t) {
  var d = "M" + f(x0) + " " + f(y0), n = 120;
  for (var i = 1; i <= n * clamp(k); i++) { var u = i / n, env = Math.exp(-Math.pow((u - .45) / .2, 2)); d += " L" + f(x0 + u * w) + " " + f(y0 - h * u * .0 + Math.sin(u * 70) * h * env); }
  return '<path d="' + d + '" stroke="' + ORANGE + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
}
// ── the pressure wave chart (mmHg against time), scrolling with t ──
function waveChart(x0, y0, w, h, t, k, op) {
  op = op || {}; var s = "", lo = 60, hi = 140, Y = function (v) { return y0 + h - (v - lo) / (hi - lo) * h; };
  s += '<path d="M' + x0 + ' ' + y0 + ' V' + (y0 + h) + ' H' + (x0 + w) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
  [80, 100, 120].forEach(function (v) { s += '<path d="M' + x0 + ' ' + f(Y(v)) + ' H' + (x0 + w) + '" stroke="' + MUTE + '" stroke-width="1" stroke-dasharray="5 6"/>' + N(v, x0 - 10, Y(v) + 6, 18, INK, "end"); });
  var d = "", n = 140;
  for (var i = 0; i <= n * clamp(k); i++) { var u = i / n, v = 80 + 40 * pw(u * 3.2 - t * 1.2); d += (i ? " L" : "M") + f(x0 + u * w) + " " + f(Y(v)); }
  s += '<path d="' + d + '" stroke="' + BLOOD + '" stroke-width="4.5" fill="none" stroke-linejoin="round"/>';
  if (op.hi) s += '<path d="M' + x0 + ' ' + f(Y(120)) + ' H' + (x0 + w) + '" stroke="' + ORANGE + '" stroke-width="3"/>' + tag(op.hiText || "الكبير", x0 + w - 70, Y(120) - 22, op.hi, 24, ORANGE);
  if (op.lo) s += '<path d="M' + x0 + ' ' + f(Y(80)) + ' H' + (x0 + w) + '" stroke="' + BLUE + '" stroke-width="3"/>' + tag(op.loText || "الصغير", x0 + w - 70, Y(80) + 46, op.lo, 24, BLUE);
  return s + T("الضغط", x0 + 6, y0 - 16, 18, MUTE, 700, "end") + T("الوقت ←", x0 + w, y0 + h + 30, 18, MUTE, 700, "start");
}
// ── small icons for analogy boxes ──
function tapHose(t, open) {   // a garden tap and a hose: the spray throbs as the tap opens and shuts
  var s = R(-52, -40, 30, 20, "#a7a9a6", 1.6) + R(-46, -54, 16, 16, "#a7a9a6", 1.4) + '<path d="M-60 -60 h34" stroke="' + ORANGE + '" stroke-width="6" stroke-linecap="round"/>' + tube("M-24 -30 C10 -30 0 20 30 20", 9);
  var k = open == null ? .5 + .5 * Math.sin(t * 7.5) : open;
  for (var i = 0; i < 4; i++) s += '<path d="M34 ' + (20 + (i - 1.5) * 5) + ' q' + f(16 * k + 6) + ' ' + f((i - 1.5) * 6) + ' ' + f(30 * k + 8) + ' ' + f((i - 1.5) * 12) + '" stroke="' + BLUE + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return s;
}
function footHose(t) {   // a shoe pressing on a hose: no water comes out
  return tube("M-60 20 H60", 10) + '<path d="M-30 -60 h50 q22 0 26 26 l4 30 h-80 Z" fill="#5a4636" stroke="' + INK + '" stroke-width="2"/>' + R(-30, -4, 80, 10, RUBBER, 1.4) + C(66, 20, 4, BLUE, 0);
}
// ── furniture for the sitting scenes (same scale as the person kit: table 0.43H, chair seat 0.26H) ──
function chairSide(x, fl, s) {   // a plain wooden chair in profile, seat at fl-104s, back on the left
  return R(x - 60 * s, fl - 110 * s, 120 * s, 12 * s, WOOD_T, 1.8) + R(x - 60 * s, fl - 230 * s, 12 * s, 230 * s, WOOD_T, 1.8) + R(x + 46 * s, fl - 100 * s, 10 * s, 100 * s, WOOD_TD, 1.6);
}
function tableSide(x, fl, s, w) { return R(x, fl - 176 * s, w, 14 * s, WOOD_T, 2) + R(x + w - 26 * s, fl - 162 * s, 12 * s, 162 * s, WOOD_TD, 1.6); }
// a person sitting in profile on a chair, facing right; opt.arm: "table" (forearm on the table at heart level) | "hang"
function sitter(x, fl, s, t, opt) {
  opt = opt || {};
  var arm = opt.arm === "hang" ? { sh: 4, el: 4, hand: "relaxed" } : opt.arm === "lap" ? { sh: 20, el: 60, hand: "relaxed" } : { sh: 34, el: 64, hand: "flat" };
  var o = { x: x, y: fl - 120 * s, s: s, dir: 1, lean: opt.lean == null ? -4 : opt.lean, outfit: opt.outfit || "casual", breath: (Math.sin(t * 1.6) + 1) / 2,
    head: { tilt: opt.tilt || 2 * Math.sin(t * .7) }, legs: [{ hip: 86, knee: 84, ankle: 0 }, { hip: 82, knee: 80, ankle: 2 }],
    arms: [arm, { sh: 22, el: 58, hand: "relaxed" }],
    face: { eyes: (t * 1000) % 3900 < 140 ? .05 : opt.eyes == null ? 1 : opt.eyes, brows: opt.brows || "neutral", mouth: opt.mouth || "neutral" } };
  return PERSON.side(o);
}
// ── the ambulance (a white box van in profile, a red stripe, the blue light, «إسعاف» and 123) ──
function ambulance(x, y, sc, t) {
  var fl = Math.sin(t * 12) > 0;
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")",
    '<path d="M-150 -110 H70 L110 -60 L130 -50 V10 H-150 Z" fill="#f3f1ec" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M74 -102 L104 -62 H74 Z" fill="#9fb4c2" stroke="' + INK + '" stroke-width="2"/>' + R(-150, -40, 280, 16, "#c8402e", 0) + '<path d="M-150 -40 H130 M-150 -24 H130" stroke="' + INK + '" stroke-width="1.4"/>' +
    R(-30, -124, 50, 14, fl ? "#3f7fbf" : "#9fb4c2", 2) + (fl ? '<path d="M-5 -130 l-40 -24 M-5 -130 l40 -24 M-5 -130 v-30" stroke="#3f7fbf" stroke-width="3" opacity=".7"/>' : "") +
    R(-60, -96, 26, 26, "#c8402e", 0) + R(-73, -89, 52, 12, "#c8402e", 0) + T("إسعاف", -20, 0 - 54, 22, "#c8402e", 800, "middle") + N("123", 56, -6, 22, INK) +
    C(-90, 12, 24, RUBBER, 2.4) + C(-90, 12, 10, "#b9bcbd", 1.6) + C(70, 12, 24, RUBBER, 2.4) + C(70, 12, 10, "#b9bcbd", 1.6));
}
// ── a horse in profile (Hales, 1733), standing, head to the right; ground at y, withers about 160 units high ──
function horse(x, y, sc) {
  var body = "M-118 -150 C-110 -164 -90 -166 -60 -158 C-30 -150 10 -152 40 -158 C62 -164 74 -170 92 -176 C118 -196 136 -224 150 -238 C156 -250 166 -252 168 -240 C186 -222 204 -200 214 -184 C218 -176 212 -168 202 -170 C190 -172 178 -178 168 -178 C150 -160 130 -138 118 -118 C114 -104 112 -94 100 -84 C70 -72 20 -70 -40 -74 C-80 -76 -100 -84 -112 -98 C-128 -112 -128 -136 -118 -150 Z";
  function leg(d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="#8f603e" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  var g = leg("M-96 -96 C-104 -60 -84 -46 -96 -6", 16) + leg("M78 -84 C80 -50 72 -30 76 -6", 14) +
    '<path d="M-118 -148 C-140 -130 -146 -90 -134 -56" stroke="#3a2a20" stroke-width="12" fill="none" stroke-linecap="round"/>' +
    '<path d="' + body + '" fill="#9a6a46" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="' + body + '" fill="url(#hatch)" opacity=".25"/>' +
    leg("M-70 -90 C-78 -60 -58 -46 -70 -6", 18) + leg("M100 -88 C104 -50 96 -30 100 -6", 16) +
    R(-108, -8, 22, 10, "#3a2a20", 1.6) + R(-82, -8, 22, 10, "#3a2a20", 1.6) + R(66, -8, 22, 10, "#3a2a20", 1.6) + R(90, -8, 22, 10, "#3a2a20", 1.6) +
    '<path d="M92 -176 C118 -196 136 -224 150 -238" stroke="#3a2a20" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<path d="M152 -244 l2 -18 l10 16" fill="#9a6a46" stroke="' + INK + '" stroke-width="2"/>' + C(176, -214, 4, INK, 0) + '<path d="M204 -178 q4 -4 2 -8" stroke="' + INK + '" stroke-width="2" fill="none"/><path d="M170 -178 C160 -196 150 -200 140 -196" stroke="#7d5234" stroke-width="2" fill="none"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", g);
}

// ══ shots (one per idea; line numbers from script.txt) ══
// 4 · the heart is a pump: each beat pushes blood into the arteries, and the blood presses on their walls
shot(4, push(330, 380, 1.0, 1.08), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), heart(170, 380, 1.05, t)) + appear(at(u, .4, .5), arteryCut(250, 260, 420, 34, t, at(u, .8, .5))) +
    label(150, 470, 110, 640, "القلب", OLIVE, at(u, .3, .5), 26) + label(560, 230, 520, 140, "الشريان", OLIVE, at(u, 1.2, .5), 26) + label(400, 214, 360, 110, "الضغط على الجدار", ORANGE, at(u, d * .6, .5), 24);
});
// 5 · «قاعدة صغيرة»: a pinned card «مم زئبق», a little mercury column beside it
shot(5, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", mercury(500, 620, 320, 40 + 20 * Math.sin(t * 2)), .35) + G("", '<rect x="90" y="230" width="340" height="170" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 260 315)"/>' +
    T("الضغط بيتقاس", 260, 300, 32, INK, 700) + T("بالـ «مم زئبق»", 260, 356, 38, BLUE, 800) + C(260, 238, 9, ORANGE, 2), at(u, .3, .4));
});
// 6 · the column of mercury the pressure can lift: it climbs to 120 mm
shot(6, push(320, 380, 0.95, 1.05), function (u, d, t) {
  var k = at(u, .6, d - 1.2), mm = 120 * k + 2 * beat(t);
  return paper() + mercury(300, 640, 480, mm) + arrow(160, 700, 262, 676, BLOOD, 8, at(u, .3, .4)) + T("ضغط الدم", 140, 740, 22, BLOOD, 800) +
    measure(200, 640, 200, 640 - mm * 1.6, k, "") + G("", N(count(120, k), 140, 640 - mm * .8, 42, ORANGE) + T("مم", 140, 640 - mm * .8 + 34, 22, INK, 800), at(u, .8, .3)) +
    label(300, 640 - 120 * 1.6, 470, 260, "زئبق", BLUE, at(u, d * .7, .5), 26);
}, { tr: "out" });
// 7 · two numbers: the big one is the push of each beat (the peaks of the pressure wave)
shot(7, push(330, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + waveChart(110, 250, 480, 300, t, at(u, .2, 1.2), { hi: at(u, 1.4, .4), hiText: "120 · الكبير" }) + iconBox(520, 150, 130, heart(0, 10, .38, t), at(u, .6, .3));
});
// 8 · the small one is the pressure while the heart rests between beats; a hose with the tap opening and shutting
shot(8, push(330, 400, 1.05, 1.0), function (u, d, t) {
  return paper() + waveChart(110, 250, 480, 300, t, 1, { hi: 1, hiText: "120 · الكبير", lo: at(u, .3, .4), loText: "80 · الصغير" }) + iconBox(520, 150, 150, tapHose(t), at(u, 1.6, .3));
});
// 9 · the cuff is pumped until it shuts the artery: the arm cut open, cells piled up against the squeeze; the gauge climbs
hud(9, 12, function (u, t) {
  var v = u < LN[10].start - LN[9].start ? Math.min(180, 30 + u * 60) : LN[11].start > LN[9].start + u ? lerp(180, 120, clamp((u - (LN[10].start - LN[9].start)) / 1.6)) : lerp(120, 80, clamp((u - (LN[11].start - LN[9].start)) / 1.6));
  if (t >= LN[10].start && t < LN[11].start && v <= 121) v = 120 + 3 * beat(t);
  if (t >= LN[11].start) v += 2 * beat(t);
  return gauge(540, 110, 80, v);
});
shot(9, push(330, 420, 0.9, 1.0), function (u, d, t) {
  var sq = clamp(u / 2.2); return paper() + armCut(sq, "none", t) + label(300, 352, 250, 640, "الشريان", OLIVE, at(u, .4, .5), 26) + label(560, 240, 480, 170, "الشريط بيتنفخ", ORANGE, at(u, .2, .5), 22) +
    iconBox(90, 130, 130, footHose(t), at(u, d * .55, .3));
}, { tr: "in" });
// 10 · it lets the air out slowly; the first blood that gets through knocks: that's the big number
shot(10, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var k = clamp(u / 1.6), sq = lerp(1, .55, k); return paper() + armCut(sq, k >= 1 ? "burst" : "none", t) + G("", tag("طَق!", 560, 300, 1, 30, ORANGE), k >= 1 ? beat(t) * 1.4 : 0) +
    numBox("120", 150, 660, at(u, 1.7, .3), 44) + T("الرقم الكبير", 150, 730, 24, ORANGE, 800);
});
// 11 · when the knocking stops and the blood runs smoothly: the small number
shot(11, push(330, 400, 1.06, 1.0), function (u, d, t) {
  var k = clamp(u / 1.6), sq = lerp(.55, .05, k); return paper() + armCut(sq, k >= 1 ? "smooth" : "burst", t) + numBox("80", 150, 660, at(u, 1.7, .3), 44) + T("الرقم الصغير", 150, 730, 24, BLUE, 800);
});
// 12 · the doctor hears the knock with the stethoscope at the elbow; the digital monitor feels the artery's quiver
shot(12, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var b = beat(t), s = paper() + '<path d="M-200 530 H840" stroke="' + INK + '" stroke-width="2"/>' + armSide(40, 470, 1.15, .4) + tube("M120 432 C120 330 330 300 660 250", 7) + stetho(300, 466, 1, 470, 130);
  for (var i = 0; i < 3; i++) s += '<path d="M' + (350 + i * 18) + ' ' + (430 - i * 10) + ' q' + (14 + i * 6) + ' ' + (30 + i * 10) + ' 0 ' + (60 + i * 20) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" opacity="' + f(b) + '"/>';
  return s + label(300, 476, 230, 640, "السماعة", OLIVE, at(u, .3, .5), 26);
});
shot([12, 1], push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .2, 1.6), sy = Math.round(lerp(180, 120, k)), dy = Math.round(lerp(0, 80, k));
  return paper() + monitor(320, 300, 1.4, k < .02 ? "---" : k < 1 ? "" + sy : "120", k < 1 ? "--" : "80", t) + '<path d="M120 640 H520" stroke="' + INK + '" stroke-width="1.6"/>' + oscTrace(120, 560, 400, 50, k, t) +
    label(440, 560, 330, 690, "رعشة الشريان", ORANGE, at(u, 1, .5), 24);
});
// 13–15 · what it should be, by age: floating bars from the small number to the big one
function ageChart(u, t, stage) {
  var x0 = 110, y0 = 160, h = 480, w = 480, lo = 40, hi = 160, Y = function (v) { return y0 + h - (v - lo) / (hi - lo) * h; }, s = "";
  s += '<path d="M' + x0 + ' ' + y0 + ' V' + (y0 + h) + ' H' + (x0 + w) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
  [60, 80, 100, 120, 140].forEach(function (v) { s += '<path d="M' + x0 + ' ' + f(Y(v)) + ' H' + (x0 + w) + '" stroke="' + MUTE + '" stroke-width="1" stroke-dasharray="5 6"/>' + N(v, x0 - 10, Y(v) + 6, 18, INK, "end"); });
  var bars = [["طفل صغير", 60, 90, OLIVE], ["من المراهقة", 80, 120, BLUE], ["مع السن", 80, 135, ORANGE]];
  bars.forEach(function (b, i) {
    if (i > stage) return; var k = i === stage ? at(u, .5, .8) : 1, bx = x0 + 50 + i * 150, top = lerp(b[1], b[2], k);
    s += appear(i === stage ? at(u, .3, .3) : 1, R(bx, Y(top), 90, Y(b[1]) - Y(top), b[3], 2.2, 6, ' opacity=".85"') + T(b[0], bx + 45, y0 + h + 34, 20, INK, 800) +
      N(Math.round(top), bx + 45, Y(top) - 12, 26, INK) + N(b[1], bx + 45, Y(b[1]) + 28, 22, MUTE));
  });
  return s;
}
shot(13, push(340, 400, 1.0, 1.05), function (u, d, t) { return paper() + ageChart(u, t, 0); }, { tr: "out" });
shot(14, push(340, 400, 1.05, 1.0), function (u, d, t) { return paper() + ageChart(u, t, 1) + G("", '<path d="M110 ' + f(160 + 480 - (120 - 40) / 120 * 480) + ' H590" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 6"/>', at(u, 1.2, .4)); });
shot(15, push(360, 400, 1.0, 1.05), function (u, d, t) {
  var stiff = at(u, .3, 1), p = pw(t * 1.2);
  return paper() + ageChart(u, t, 2) + iconBox(200, 175, 130, R(-60, -14 - 10 * p * (1 - stiff), 120, 28 + 20 * p * (1 - stiff), lerp(0, 1, stiff) > .5 ? "#a8574a" : BLOOD, 2.2, 12) + T(stiff > .5 ? "ناشف" : "مرن", 0, 56, 18, INK, 800), at(u, .2, .3)) +
    G("", '<path d="M110 ' + f(160 + 480 - (130 - 40) / 120 * 480) + ' H590" stroke="' + ORANGE + '" stroke-width="3"/>' + tag("روح لدكتور", 500, 290, 1, 22, ORANGE), at(u, d * .6, .4));
});
// 16 · below 90 over 60 is low pressure: the zones ruler, the marker drops into the blue zone
function zones(u, t, v, hl) {
  var x0 = 60, x1 = 600, lo = 60, hi = 200, X = function (q) { return x0 + (q - lo) / (hi - lo) * (x1 - x0); }, s = "";
  var Z = [[60, 90, "#8fb0c6", "واطي"], [90, 120, "#a9b27a", "طبيعي"], [120, 130, "#e0c27a", ""], [130, 180, "#d9946e", "عالي"], [180, 200, "#b8432f", "خطر"]];
  Z.forEach(function (z, i) { s += G("", R(X(z[0]), 380, X(z[1]) - X(z[0]), 70, z[2], 2) + (z[3] ? T(z[3], (X(z[0]) + X(z[1])) / 2, 424, 22, INK, 800) : ""), hl == null || hl === i ? 1 : .35); });
  [60, 90, 120, 130, 180, 200].forEach(function (q) { s += '<path d="M' + f(X(q)) + ' 450 v14" stroke="' + INK + '" stroke-width="2"/>' + N(q, X(q), 488, 18, INK); });
  var mx = X(v); s += '<path d="M' + f(mx) + ' 370 l-14 -26 h28 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>';
  return s + T("الرقم الكبير", 330, 530, 20, MUTE, 700);
}
shot(16, push(330, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .4, 1.4); return paper() + zones(u, t, lerp(115, 84, k), 0) + numBox("90/60", 170, 260, at(u, .3, .3), 40) + tag("ضغط واطي", 470, 260, at(u, 1.6, .3), 30, BLUE); });
// 17 · low and dizzy: lie flat, legs up on a pillow, drink water, get up slowly
shot(17, push(330, 470, 1.28, 1.36), function (u, d, t) {
  var fl = 560, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + R(-200, fl, 1040, 300, TAN, 0);
  s += R(360, fl - 70, 150, 70, "#c9b48a", 2.2, 18);   // cushions under the legs
  var P = PERSON.side({ x: 330, y: fl - 34, s: .9, dir: 1, rot: -90, outfit: "casual", breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: 0 },
    legs: [{ hip: 38, knee: 38, ankle: 0 }, { hip: 42, knee: 40, ankle: 4 }], arms: [{ sh: 10, el: 10, hand: "relaxed" }, { sh: 6, el: 10, hand: "relaxed" }],
    face: { eyes: .55 + .2 * Math.sin(t * 1.3), brows: "worried", mouth: "neutral", tired: true } });
  s += P.svg;
  var hx = P.joints.head[0], hy = P.joints.head[1];
  for (var i = 0; i < 3; i++) { var a = t * 2.4 + i * 2.1; s += G("", T("✦", hx + Math.cos(a) * 40, hy - 70 + Math.sin(a) * 12, 18, ORANGE, 800), .8); }
  s += iconBox(170, 360, 100, '<path d="M-26 -40 L26 -40 L20 44 L-20 44 Z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-23 -6 L23 -6 L20 44 L-20 44 Z" fill="#8fb0c6" opacity=".8"/>', at(u, d * .5, .3));
  return s + label(440, fl - 100, 330, 390, "ارفع رجليك", BLUE, at(u, .6, .5), 24);
});
// 18 · high: sit quietly for five minutes, measure again; no extra pills on your own
shot(18, push(320, 430, 1.0, 1.05), function (u, d, t) {
  var fl = 640, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + chairSide(170, fl, 1) + tableSide(300, fl, 1, 300);
  var P = sitter(170, fl, 1, t, { mouth: "neutral", eyes: .8 }); s += P.svg;
  s += monitor(470, 424, .42, "158", "96", t);
  var k = at(u, .2, d * .5); s += iconBox(520, 140, 140, C(0, 0, 44, "#f4ecdb", 2.2) + '<path d="M0 0 L' + f(Math.sin(k * 2.1) * 34) + ' ' + f(-Math.cos(k * 2.1) * 34) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + '<path d="M0 -44 A44 44 0 0 1 ' + f(Math.sin(k * 2.1) * 44) + ' ' + f(-Math.cos(k * 2.1) * 44) + ' L0 0 Z" fill="' + ORANGE + '" opacity=".3"/>' + T("5 دقايق", 0, 66, 16, INK, 800), at(u, .2, .3));
  var pk = at(u, d * .62, .3); s += iconBox(110, 140, 130, R(-22, -30, 44, 60, "#f3f1ec", 2, 6) + R(-24, -44, 48, 16, ORANGE, 2, 4) + C(30, 30, 10, "#f3f1ec", 1.6) + C(14, 40, 9, "#f3f1ec", 1.6), pk) + cross(110, 140, 1.1, at(u, d * .7, .5));
  return s;
});
// 19 · above 180 over 120 with chest pain, breathlessness or slurred speech: call the ambulance (123 in Egypt)
shot(19, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + numBox("180/120", 320, 110, at(u, .2, .3), 50) + zones(u, t, 186, 4);
  var ic = [["وجع في الصدر", heart(0, 0, .25, t)], ["نهجان", '<path d="M-30 -10 q30 -20 60 0 M-26 6 q26 -16 52 0 M-20 22 q20 -12 40 0" stroke="' + BLUE + '" stroke-width="4" fill="none" stroke-linecap="round"/>'], ["تقل في الكلام", '<path d="M-36 -24 h72 v40 h-40 l-14 14 v-14 h-18 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/>' + T("...", 0, 2, 26, ORANGE, 800)]];
  ic.forEach(function (q, i) { s += G("", G("translate(" + (130 + i * 190) + " 220)", q[1]) + T(q[0], 130 + i * 190, 280, 20, INK, 800), at(u, .8 + i * .5, .3)); });
  var ak = at(u, d * .55, 1.2); return s + G("translate(0 0)", ambulance(lerp(900, 330, ak), 672, .9, t), ak > 0 ? 1 : 0);
});
// 20 · measure it right: back against the chair, feet on the floor, arm on the table at heart level
shot(20, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var fl = 680, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + chairSide(200, fl, 1.08) + tableSide(330, fl, 1.08, 300);
  var P = sitter(200, fl, 1.08, t, { mouth: "smile" }); s += P.svg;
  var sh = P.joints.shoulder || P.joints.sh0 || [230, 390];
  s += draw("M220 468 H520", at(u, 1.6, .6), ORANGE, 2.4, ' stroke-dasharray="8 6"') + G("", T("مستوى القلب", 470, 455, 20, ORANGE, 800), at(u, 2, .3));
  s += check(110, 300, .9, at(u, .3, .4), OLIVE) + check(250, 720, .9, at(u, .8, .4), OLIVE) + check(470, 400, .9, at(u, 1.3, .4), OLIVE);
  return s;
});
// 21 · an arm hanging down can add about 10
shot(21, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var fl = 680, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + chairSide(200, fl, 1.08);
  var P = sitter(200, fl, 1.08, t, { arm: "hang" }); s += P.svg + cross(250, 560, .9, at(u, .5, .5));
  return s + numBox("+10", 480, 300, at(u, 1, .3), 56) + T("على الرقم", 480, 380, 24, INK, 800);
});
// 22 · the myth: high pressure always gives a headache — no; usually nothing at all, «the silent killer»
shot(22, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var fl = 680, y = fl - 120 * 1.1, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + chairSide(250, fl, 1.08);
  var o = { x: 250, y: fl - 120 * 1.08, s: 1.08, legs: "sit", outfit: "casual", breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: 6, turn: .2 }, face: { eyes: .6, brows: "worried", mouth: "frown" } };
  var gh = PERSON.front(o).joints.head; o.arms = [{ to: [210, fl - 110], hand: "relaxed", bend: 1 }, { to: [gh[0] + 22, gh[1] - 18], bend: 1, hand: "flat", front: true, rot: -168, palm: true }];
  s += PERSON.front(o).svg;
  for (var i = 0; i < 3; i++) s += '<path d="M' + f(gh[0] - 60 - i * 12) + ' ' + f(gh[1] - 40 + i * 14) + ' l-14 -6" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(.5 + .5 * Math.sin(t * 6 + i)) + '"/>';
  return s + cross(gh[0] + 90, gh[1] - 40, 1.4, at(u, d - .55, .4)) + iconBox(500, 160, 110, T("صداع؟", 0, 10, 26, ORANGE, 800), at(u, .3, .3));
});
shot([22, 2], push(320, 420, 1.04, 1.0), function (u, d, t) {
  var fl = 680, s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>' + chairSide(200, fl, 1.08) + tableSide(330, fl, 1.08, 300);
  s += sitter(200, fl, 1.08, t, { mouth: "smile" }).svg + gauge(500, 220, 90, 165 + 3 * beat(t), at(u, .2, .3));
  return s + tag("القاتل الصامت", 320, 120, at(u, d * .45, .3), 36, ORANGE);
});
// 23 · «يعني من الآخر»: the wave with both numbers, and the gauge
shot(23, push(330, 410, 0.96, 1.04), function (u, d, t) {
  return paper() + waveChart(110, 300, 480, 280, t, 1, { hi: at(u, .3, .4), hiText: "الكبير · وقت الدقة", lo: at(u, 1.6, .4), loText: "الصغير · وقت الراحة" }) +
    numBox("120/80", 330, 180, at(u, d * .65, .3), 46);
}, { tr: "out" });
// 24 · the odd fact: Hales, 1733 — a glass tube in a horse's neck artery, the blood rising about 2.5 m; a man for scale
shot(24, push(330, 430, 0.92, 1.02), function (u, d, t) {
  var fl = 660, m = 140, k = at(u, 2.2, d - 3.2), top = fl - 2.5 * m, base = fl - 190, lv = lerp(base, top, k) + 3 * beat(t), s = paper() + '<path d="M-200 ' + fl + ' H840" stroke="' + INK + '" stroke-width="2.4"/>';
  s += horse(200, fl, 1.3, t);
  s += '<path d="M352 ' + (fl - 196) + ' C372 ' + (fl - 196) + ' 386 ' + (fl - 196) + ' 388 ' + (base) + '" stroke="' + BRASS + '" stroke-width="8" fill="none"/>' + R(382, top - 12, 14, base - top + 12, GLASS, 2) + R(385, lv, 8, base - lv, BLOOD, 0);
  s += measure(420, fl, 420, top, at(u, 1.6, 1), "") + G("", N("2.5", 470, top + 120, 44, ORANGE) + T("متر", 470, top + 156, 24, INK, 800), at(u, d * .7, .4));
  var o = { s: 1.75 * m / 400, dir: -1, lean: -3, outfit: { base: "office", colors: { shirt: "#ece4cf", shirtD: "#cfc6ad", pants: "#5a4636", pantsD: "#463626", tie: "#ece4cf" } }, breath: (Math.sin(t * 1.4) + 1) / 2, head: { tilt: -12 }, face: { eyes: 1.2, brows: "raised", mouth: "o" } };
  Object.assign(o, PERSON.walkPose(0, 0)); o.x = 560; o.y = PERSON.sideHipY(o, fl);
  s += PERSON.side(o).svg + T("1733", 120, 150, 44, ORANGE, 800) + label(270, fl - 210, 190, 260, "شريان الرقبة", OLIVE, at(u, .8, .5), 22);
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the cuff on the arm, the bulb pumping, the gauge climbing. line 1: the artery is hidden inside (an eye crossed out).
  // line 2: the needle settles, «120/80».
  var k0 = clamp((t - LN[0].start) / 2.6), v = li === 0 ? 20 + 160 * k0 : li === 1 ? 180 - 30 * clamp((t - LN[1].start) / 2.5) : lerp(150, 120, clamp((t - LN[2].start) / 1.2)) + 2 * beat(t);
  var sq = li === 0 ? (Math.sin(t * 6) + 1) / 2 : 0;
  var ghost = li === 1 ? G("", '<path d="M0 388 C160 384 360 386 500 382" stroke="' + BLOOD + '" stroke-width="10" fill="none" stroke-dasharray="14 10" stroke-linecap="round"/>', .4 + .3 * Math.sin(t * 4)) : "";
  var s = '<path d="M-40 ' + 428 + ' H660" stroke="' + INK + '" stroke-width="2"/>' + G("", armSide(-20, 380, 1.25, li === 0 ? .4 + .6 * k0 : 1, { ghost: ghost }));
  s += tube("M60 334 C60 230 330 250 420 236", 7) + tube("M100 426 C100 520 220 560 300 560", 7) + bulb(320, 580, 1, sq) + gauge(470, 140, 92, v);
  if (li >= 1) s += iconBox(90, 110, 110, '<path d="M-36 0 Q0 -30 36 0 Q0 30 -36 0 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + C(0, 0, 11, INK, 0) + cross(0, 0, .8, clamp((t - LN[1].start - .3) / .5)), clamp((t - LN[1].start) / .3));
  if (li >= 2) s += numBox("120/80", 470, 300, clamp((t - LN[2].start - .6) / .3), 40);
  return s;
};
SCENE.bumper = function (u, t) { return gauge(90, 120, 62, 120 + 40 * Math.sin(t * 2.4)); };
SCENE.outro = function (svg, u, t) {
  return G("translate(-20 -60) scale(.62)", armSide(40, 380, .95, .6) + tube("M110 345 C110 260 600 300 760 300", 7) + stetho(250, 378, .8, 380, 190)) + gauge(470, 120, 70, 120 + 2 * beat(t)) +
    callout("1", 50, 140, ease(u / .3)) + callout("2", 215, 205, ease(u / .3 - .5)) + callout("3", 470, 22, ease(u / .3 - 1)) + callout("4", 170, 120, ease(u / .3 - 1.5));
};
