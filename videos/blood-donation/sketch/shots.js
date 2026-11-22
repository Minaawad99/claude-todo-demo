// ── «التبرع بالدم» — drawings. The donation arm follows the user's source video (forearm resting flat on the armrest,
// the open hand with five fingers, a cut window over the vein with the needle in it, the tube down to the bag) and is
// drawn in the «اسكتش» hand; the hand itself is the shared person kit's hand (PERSON.hand). Real shapes: refs/SOURCES.md.

var PS = PERSON.colors, BLOOD = "#a8283a", BLOOD_D = "#7a1a29", PLASMA = "#ecd78f", CELL = "#efe2d2", CELLN = "#cdb9a2", VEINW = "#c97c7c",
    BONE = "#e6dcc0", MARROW = "#c4573f", KID = "#b8634e", KID_D = "#8e4535";

// a red blood cell seen from the side-ish: a disc with a pale dimple
function rbc(x, y, r, rot, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')"><ellipse rx="' + f(r) + '" ry="' + f(r * .62) + '" fill="' + (col || "#c4364a") + '" stroke="' + INK + '" stroke-width="1.2"/><ellipse rx="' + f(r * .45) + '" ry="' + f(r * .22) + '" fill="#e0707e" opacity=".8"/></g>'; }

// ── the donation arm (side-on, after the source video): forearm from the left edge to the wrist at (wx, wy) ──
// o: {k: bag fill 0..1, t, win: show the vein window, flow: blood running in the tube, bag: draw the bag, ml: the counter}
function donorArm(o) {
  var t = o.t || 0, wx = 300, wy = 330, s = "", k = clamp(o.k == null ? 1 : o.k);
  // armrest and its leg
  s += R(-120, wy + 52, 520, 20, "#d6cdb6", 2, 6) + R(-120, wy + 72, 520, 7, "#b9ae94", 1.4) + R(20, wy + 79, 24, 170, "#cfc6b0", 2);
  // the forearm and the hand: the person kit's close-up (PERSON.forearm), after the source video's arm
  s += PERSON.forearm({ x: wx, y: wy, s: 1.3, len: 440, curl: .06 + .04 * Math.sin(t * 1.3), spread: .5 });
  // rolled sleeve
  s += '<path d="M-150 ' + (wy - 84) + ' C-120 ' + (wy - 88) + ' -92 ' + (wy - 80) + ' -84 ' + (wy - 66) + ' L-82 ' + (wy + 58) + ' C-100 ' + (wy + 70) + ' -130 ' + (wy + 70) + ' -150 ' + (wy + 66) + ' Z" fill="#6f7f5a" stroke="' + INK + '" stroke-width="2.2"/><path d="M-96 ' + (wy - 78) + ' L-94 ' + (wy + 62) + '" stroke="#55643f" stroke-width="3"/>';
  // the tube: from the needle hub, down in a loop to the bag; blood runs along it
  var tube = "M256 " + (wy - 6) + " C340 " + (wy - 8) + " 320 " + (wy + 150) + " 400 " + (wy + 170) + " S470 " + (wy + 150) + " 480 " + (wy + 190);
  s += '<path d="' + tube + '" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="' + tube + '" stroke="#efe9e0" stroke-width="6" fill="none" stroke-linecap="round"/>';
  if (o.flow !== false && k > 0) s += '<path d="' + tube + '" stroke="' + BLOOD + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="14 6" stroke-dashoffset="' + f(-t * 40) + '"/>';
  // the needle hub taped to the skin
  s += R(206, wy - 18, 52, 22, "#f4f1ea", 2, 5) + R(194, wy - 26, 30, 36, "#ece4cf", 1.6, 3) + '<path d="M199 ' + (wy - 20) + ' h20 M199 ' + (wy - 12) + ' h20 M199 ' + (wy - 4) + ' h20" stroke="#cbbf9f" stroke-width="1.4"/>';
  // the cut window through the skin over the vein: skin, fat, the vein with cells flowing, the needle inside it
  if (o.win !== false) {
    var X0 = 10, X1 = 184, Y0 = wy - 40, Y1 = wy + 30, id = "aw" + (++CLIPN);
    s += '<clipPath id="' + id + '"><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '"/></clipPath><g clip-path="url(#' + id + ')">';
    s += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="#f1dea4"/><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="9" fill="' + PS.skin + '"/>';
    for (var i = 0; i < 9; i++) s += '<circle cx="' + f(X0 + 10 + i * 21) + '" cy="' + f(Y0 + 15 + (i % 2) * 44) + '" r="6" fill="none" stroke="#dcc380" stroke-width="1.2"/>';
    s += R(X0 - 4, wy - 22, X1 - X0 + 8, 34, VEINW, 1.6) + '<rect x="' + (X0 - 4) + '" y="' + (wy - 17) + '" width="' + (X1 - X0 + 8) + '" height="24" fill="' + BLOOD_D + '"/>';
    for (i = 0; i < 9; i++) { var cx = X1 + 10 - ((i * 23 + t * 34) % (X1 - X0 + 20)); s += rbc(cx, wy - 5 + (i % 3 - 1) * 5, 6.5, 10 + i * 30); }
    s += '<path d="M202 ' + (wy - 7) + ' L82 ' + (wy - 4) + ' L72 ' + (wy - 1) + ' L82 ' + (wy - 1) + ' L202 ' + (wy - 3) + ' Z" fill="#d9dde0" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '</g><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + X0 + ' ' + (Y0 - 6) + ' v' + (Y1 - Y0 + 12) + ' M' + X1 + ' ' + (Y0 - 6) + ' v' + (Y1 - Y0 + 12) + '" stroke="' + BLUE + '" stroke-width="2.4"/>';
  }
  if (o.bag !== false) s += bloodBag(480, 500, k, t);
  return s;
}
// the blood bag: a soft rectangle with a port on top, graduations, the level rising with k (0..1 of 450 ml)
function bloodBag(cx, top, k, t, sc) {
  sc = sc || 1; var w = 140 * sc, h = 190 * sc, x = cx - w / 2, y = top + 14 * sc, lv = y + h - 10 * sc - (h - 30 * sc) * clamp(k), s = "", id = "bg" + (++CLIPN);
  var body = 'M' + f(x + 14 * sc) + ' ' + f(y) + ' H' + f(x + w - 14 * sc) + ' Q' + f(x + w) + ' ' + f(y) + ' ' + f(x + w) + ' ' + f(y + 18 * sc) + ' V' + f(y + h - 16 * sc) + ' Q' + f(x + w) + ' ' + f(y + h) + ' ' + f(x + w - 16 * sc) + ' ' + f(y + h) + ' H' + f(x + 16 * sc) + ' Q' + f(x) + ' ' + f(y + h) + ' ' + f(x) + ' ' + f(y + h - 16 * sc) + ' V' + f(y + 18 * sc) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x + 14 * sc) + ' ' + f(y) + ' Z';
  s += R(cx - 8 * sc, top, 16 * sc, 16 * sc, "#efe9e0", 1.6) + '<path d="' + body + '" fill="#f7f3ec"/><clipPath id="' + id + '"><path d="' + body + '"/></clipPath>';
  if (k > 0) s += '<g clip-path="url(#' + id + ')"><path d="M' + f(x - 5) + ' ' + f(lv) + ' Q' + f(cx - w / 4) + ' ' + f(lv - 3 * Math.sin(t * 3)) + ' ' + f(cx) + ' ' + f(lv) + ' T' + f(x + w + 5) + ' ' + f(lv) + ' V' + f(y + h + 5) + ' H' + f(x - 5) + ' Z" fill="' + BLOOD + '"/><rect x="' + f(x) + '" y="' + f(lv) + '" width="' + f(w) + '" height="' + f(5 * sc) + '" fill="#c8485a"/></g>';
  s += '<path d="' + body + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.4 * sc) + '"/>';
  for (var i = 1; i <= 4; i++) { var gy = y + h - 10 * sc - (h - 30 * sc) * i / 4; s += '<path d="M' + f(x + 12 * sc) + ' ' + f(gy) + ' h' + f((i % 2 ? 14 : 22) * sc) + '" stroke="' + INK + '" stroke-width="' + f(1.6 * sc) + '"/>'; }
  s += '<path d="M' + f(x + w - 22 * sc) + ' ' + f(y + 16 * sc) + ' v' + f(h * .35) + '" stroke="#fff" stroke-width="' + f(4 * sc) + '" opacity=".6" stroke-linecap="round"/>';
  return s;
}
// a millilitre counter in a dark tag, with the clock under it (reference: the source's «450 ml / 10:00»)
function mlBox(x, y, k, kc) { k = clamp(k); return numBox(count(450, k) + " ml", x, y, kc == null ? 1 : kc, 38, true) + T(("0" + Math.floor(10 * ease(k))).slice(-2) + ":00 دقيقة", x, y + 46, 18, MUTE, 700); }

// a blood vessel in cross-section: wall ring, lumen with cells; sq 0..1 = how much it narrows
function vesselX(cx, cy, r, sq, t) {
  var rr = r * (1 - .22 * sq), s = C(cx, cy, rr + 16, VEINW, 2.2) + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(rr + 7) + '" fill="#dc9a96"/>' + C(cx, cy, rr, BLOOD_D, 2);
  for (var i = 0; i < 7; i++) { var a = i * 2.4 + t * .6, d = rr * (.25 + .45 * hash(i)); s += rbc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr * .17, i * 40 + t * 30); }
  return s;
}
// the heart (front, anatomical outline simplified): ventricles, the aorta arch and the big veins; beat 0..1
function heart(cx, cy, sc, beat) {
  var b = 1 + .06 * beat; return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc * b) + ')',
    '<path d="M-8 -52 C-8 -78 30 -80 32 -58 L30 -40" fill="none" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M-8 -52 C-8 -78 30 -80 32 -58 L30 -40" fill="none" stroke="#c4574a" stroke-width="11" stroke-linecap="round"/>' +
    '<path d="M-30 -46 V-70" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/><path d="M-30 -46 V-70" stroke="#6b7fa8" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M-6 -46 C-40 -60 -62 -30 -54 0 C-46 30 -12 50 6 66 C18 44 52 22 54 -8 C56 -40 30 -56 -6 -46 Z" fill="#c4574a" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M-2 -40 C10 -10 4 30 6 64" stroke="#8e3a32" stroke-width="2.4" fill="none"/><path d="M-40 -30 C-30 -36 -16 -36 -8 -30" stroke="#e08a7a" stroke-width="4" fill="none" stroke-linecap="round"/>');
}
// a needle gauge (blood pressure): a dial and a needle at angle a (0..1)
function gauge(cx, cy, r, a, lab) {
  var s = '<path d="M' + f(cx - r) + ' ' + f(cy) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(cx + r) + ' ' + f(cy) + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var i = 0; i <= 10; i++) { var b = Math.PI + i / 10 * Math.PI; s += '<path d="M' + f(cx + Math.cos(b) * r * .82) + ' ' + f(cy + Math.sin(b) * r * .82) + ' L' + f(cx + Math.cos(b) * r * .95) + ' ' + f(cy + Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 1.4 : 3) + '"/>'; }
  var g = Math.PI + a * Math.PI; s += '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(cx + Math.cos(g) * r * .78) + ' ' + f(cy + Math.sin(g) * r * .78) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + C(cx, cy, 6, INK, 0);
  return s + (lab ? T(lab, cx, cy + 30, 20, INK, 700) : "");
}
// tissue cut: cells above and below a capillary band; water drops drifting into the vessel (k 0..1)
function tissue(t, k, cells) {
  var s = R(30, 120, 580, 560, "#f3e3d6", 2.4), i, j;
  for (j = 0; j < 2; j++) for (i = 0; i < 6; i++) { var x = 80 + i * 96 + (j % 2) * 30, y = j ? 590 : 210; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="40" ry="34" fill="' + CELL + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x + 6) + '" cy="' + (y - 4) + '" r="9" fill="' + CELLN + '" stroke="' + INK + '" stroke-width="1"/>'; }
  for (j = 0; j < 2; j++) for (i = 0; i < 5; i++) { x = 130 + i * 96 + (j % 2) * 30; y = j ? 505 : 295; s += '<ellipse cx="' + x + '" cy="' + y + '" rx="36" ry="28" fill="' + CELL + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x - 6) + '" cy="' + (y + 2) + '" r="8" fill="' + CELLN + '" stroke="' + INK + '" stroke-width="1"/>'; }
  s += '<rect x="30" y="360" width="580" height="80" fill="#e6a1a0"/><path d="M30 360 H610 M30 440 H610" stroke="' + INK + '" stroke-width="2" stroke-dasharray="10 6"/>';
  var nc = cells == null ? 12 : cells; for (i = 0; i < nc; i++) s += rbc(640 - ((i * 53 + t * 46) % 660), 380 + (i * 37 % 44), 9, i * 50);
  for (i = 0; i < 14; i++) {   // drops: from between the cells into the vessel, as k grows
    var sx = 60 + hash(i) * 520, sy = i % 2 ? 250 + hash(i + 3) * 60 : 480 + hash(i + 5) * 70, ty = 375 + hash(i + 9) * 50, p = clamp(k * 1.6 - hash(i + 7) * .6), loop = (t * .5 + hash(i + 2)) % 1;
    var yy = lerp(sy, ty, clamp(p + loop * .3 * (p > 0 && p < 1 ? 1 : 0))), xx = sx - p * 40;
    s += '<path d="M' + f(xx) + ' ' + f(yy - 11) + ' C' + f(xx + 7) + ' ' + f(yy - 2) + ' ' + f(xx + 7) + ' ' + f(yy + 6) + ' ' + f(xx) + ' ' + f(yy + 6) + ' C' + f(xx - 7) + ' ' + f(yy + 6) + ' ' + f(xx - 7) + ' ' + f(yy - 2) + ' ' + f(xx) + ' ' + f(yy - 11) + ' Z" fill="#7fa6c4" stroke="' + INK + '" stroke-width="1.2"/>';
  }
  return s;
}
// a tall measuring tube of blood: level lv litres out of 5 (with 0.5 steps), a dark tag with the reading
function bloodTube(cx, top, h, lv, t, tagK) {
  var w = 70, y1 = top + h, ly = y1 - h * .92 * lv / 5, s = '<path d="M' + (cx - w / 2) + ' ' + top + ' V' + f(y1 - 30) + ' A35 35 0 0 0 ' + (cx + w / 2) + ' ' + f(y1 - 30) + ' V' + top + '" fill="#f7f3ec" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + (cx - w / 2 + 3) + ' ' + f(ly) + ' Q' + cx + ' ' + f(ly - 4 * Math.sin(t * 2.5)) + ' ' + (cx + w / 2 - 3) + ' ' + f(ly) + ' V' + f(y1 - 30) + ' A32 32 0 0 1 ' + (cx - w / 2 + 3) + ' ' + f(y1 - 30) + ' Z" fill="' + BLOOD + '"/>';
  for (var i = 1; i <= 10; i++) { var gy = y1 - h * .92 * i / 10; s += '<path d="M' + (cx - w / 2) + ' ' + f(gy) + ' h' + (i % 2 ? 12 : 22) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return s + numBox(lv.toFixed(1) + " L", cx + 100, f(ly + 10), tagK == null ? 1 : tagK, 26, true);
}
// a blood sample magnified: plasma with cells; n cells
function sample(cx, cy, r, n, t) { var s = "", i; for (i = 0; i < n; i++) { var a = hash(i) * 6.283 + t * .15, d = r * .82 * Math.sqrt(hash(i + 20)); s += rbc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * .13, hash(i + 4) * 180 + t * 20); } return inset(cx, cy, r, '<circle r="' + r + '" fill="' + PLASMA + '"/>' + s.replace(/translate\(([-\d.]+) ([-\d.]+)\)/g, function (m, a, b) { return "translate(" + f(a - cx) + " " + f(b - cy) + ")"; })); }
// the kidney (right kidney, front, cut lengthwise): cortex, medulla pyramids, pelvis, the renal artery and vein, the ureter
function kidney(cx, cy, sc) {
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')',
    '<path d="M30 -10 C70 -14 96 -6 120 -2" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M30 -10 C70 -14 96 -6 120 -2" stroke="#c4574a" stroke-width="8" fill="none"/>' +
    '<path d="M30 14 C70 14 96 22 120 26" stroke="' + INK + '" stroke-width="13" fill="none"/><path d="M30 14 C70 14 96 22 120 26" stroke="#6b7fa8" stroke-width="8" fill="none"/>' +
    '<path d="M22 30 C40 60 30 120 36 180" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="M22 30 C40 60 30 120 36 180" stroke="#e8d7a8" stroke-width="5" fill="none"/>' +
    '<path d="M0 -92 C-50 -96 -76 -50 -74 2 C-72 56 -46 96 2 92 C30 90 40 66 28 40 C18 22 18 -20 28 -40 C40 -64 30 -90 0 -92 Z" fill="' + KID + '" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M-2 -76 C-40 -78 -58 -42 -58 2 C-58 46 -38 78 0 76 C14 70 14 50 8 36 C2 14 2 -16 10 -34 C16 -52 14 -72 -2 -76 Z" fill="#cf8a72" stroke="' + INK + '" stroke-width="1.4"/>' +
    [[-40, -44, -10], [-50, 0, 0], [-40, 44, 12]].map(function (p) { return '<path d="M' + p[0] + ' ' + (p[1] - 16) + ' L' + (p[0] + 34) + ' ' + (p[1] + p[2] * .2 - 6) + ' L' + (p[0] + 34) + ' ' + (p[1] + p[2] * .2 + 6) + ' L' + p[0] + ' ' + (p[1] + 16) + ' Z" fill="' + KID_D + '" stroke="' + INK + '" stroke-width="1.2"/>'; }).join("") +
    '<path d="M-6 -36 C10 -30 22 -12 22 0 C22 14 10 32 -6 38 C2 20 2 -18 -6 -36 Z" fill="#e8d7a8" stroke="' + INK + '" stroke-width="1.4"/>');
}
// a long bone (femur) with a cut window in the shaft showing the red marrow; cells leave through a vessel when out>0
function boneCut(cx, cy, sc, t, out) {
  var s = '<path d="M-40 -230 C-70 -260 -60 -300 -20 -300 C0 -320 40 -310 44 -280 C70 -270 70 -232 40 -220 C30 -150 30 150 40 220 C70 232 70 270 44 280 C40 310 0 320 -20 300 C-60 300 -70 260 -40 230 C-30 150 -30 -150 -40 -230 Z" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<rect x="-30" y="-150" width="60" height="300" rx="10" fill="#d9c9a0" stroke="' + INK + '" stroke-width="1.6"/><rect x="-20" y="-144" width="40" height="288" rx="8" fill="' + MARROW + '"/>';
  for (var i = 0; i < 18; i++) { var y = -130 + i * 15.5, x = (i % 3 - 1) * 9; s += rbc(x, y + 3 * Math.sin(t * 2 + i), 5.5, i * 33); }
  s += hatch("M-40 -230 C-60 -240 -56 -290 -20 -292 C0 -300 30 -296 36 -280 L30 -220 C24 -150 -30 -160 -40 -230 Z");
  s = G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(sc) + ')', s);
  if (out) { var vp = "M" + f(cx + 22 * sc) + " " + f(cy) + " C" + f(cx + 120) + " " + f(cy - 10) + " " + f(cx + 160) + " " + f(cy - 120) + " " + f(cx + 260) + " " + f(cy - 160);
    s += '<path d="' + vp + '" stroke="' + INK + '" stroke-width="30" fill="none"/><path d="' + vp + '" stroke="#e6a1a0" stroke-width="25" fill="none"/>';
    for (i = 0; i < 10; i++) { var u = ((i / 10 + t * .35 * out) % 1), bx = Math.pow(1 - u, 3) * (cx + 22 * sc) + 3 * Math.pow(1 - u, 2) * u * (cx + 120) + 3 * (1 - u) * u * u * (cx + 160) + u * u * u * (cx + 260),
      by = Math.pow(1 - u, 3) * cy + 3 * Math.pow(1 - u, 2) * u * (cy - 10) + 3 * (1 - u) * u * u * (cy - 120) + u * u * u * (cy - 160); s += rbc(bx, by, 8, i * 40); } }
  return s;
}
// a progress bar with its name (the source's «كريات الدم الحمر / الحديد» bars, drawn in the sketch hand)
function bar(x, y, w, k, col, name) { return T(name, x + w, y - 14, 22, INK, 700, "start") + R(x, y, w, 30, "#f7f3ec", 2.2, 15) + (k > .02 ? '<rect x="' + f(x + 3) + '" y="' + (y + 3) + '" width="' + f((w - 6) * clamp(k)) + '" height="24" rx="12" fill="' + col + '"/>' : ""); }
// a wall calendar page with a word
function calPage(x, y, w, word, k) { return appear(k, R(x - w / 2, y - w * .45, w, w * .9, "#f7f3ec", 2.4, 8) + R(x - w / 2, y - w * .45, w, w * .22, BLUE, 2.4, 8) + [-.25, 0, .25].map(function (p) { return R(x + p * w - 4, y - w * .52, 8, 18, INK, 0, 3); }).join("") + T(word, x, y + w * .2, w * .2, INK, 800)); }
// a water drop
function drop(x, y, r, col) { return '<path d="M' + f(x) + ' ' + f(y - r * 1.6) + ' C' + f(x + r * .7) + ' ' + f(y - r * .6) + ' ' + f(x + r) + ' ' + f(y) + ' ' + f(x + r) + ' ' + f(y + r * .25) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x - r) + ' ' + f(y + r * .25) + ' C' + f(x - r) + ' ' + f(y) + ' ' + f(x - r * .7) + ' ' + f(y - r * .6) + ' ' + f(x) + ' ' + f(y - r * 1.6) + ' Z" fill="' + (col || "#7fa6c4") + '" stroke="' + INK + '" stroke-width="2"/>'; }
// the donor, standing (person kit, casual clothes)
function donor(x, y, s, t, face, arms) { return PERSON.front({ x: x, y: y, s: s, outfit: "casual", breath: (Math.sin(t * 2) + 1) / 2, head: { tilt: 2 * Math.sin(t * .9) }, face: Object.assign({ eyes: (t % 3.7) < .12 ? .05 : 1 }, face || {}), arms: arms }).svg; }

// ── stage chip (HUD): which of the three stages we are in ──
function stageChip(n, word) { return function (u, t) { return '<rect x="420" y="26" width="196" height="52" rx="26" fill="' + INK + '"/>' + T("المرحلة " + n, 560, 60, 20, "#fff", 800) + T(word, 470, 60, 18, "#f2c76a", 700); }; }
hud(7, 9, stageChip("1", "دقايق"));
hud(10, 13, stageChip("2", "ساعات"));
hud(14, 20, stageChip("3", "أسابيع"));

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · about 5 litres in the body; the bag is a tenth of it
shot(4, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.6, 1.2);
  return paper() + donor(170, 520, 1.05, t) + bloodTube(440, 150, 440, 5 - .5 * k, t, at(u, .5, .3)) +
    G("", bloodBag(440, 620, k, t, .55), at(u, 1.4, .3)) + G("", N("1/10", 560, 700, 40, ORANGE), at(u, 2.2, .4));
});
// 5 · a three-stage emergency plan: ① minutes ② a day or two ③ weeks
shot(5, push(320, 400, 1.06, 0.98), function (u, d, t) {
  var s = paper() + draw("M70 400 H570", at(u, .1, .8), INK, 3);
  [["دقايق", heart(0, 0, .7, Math.max(0, Math.sin(t * 7)))], ["يوم أو يومين", drop(0, 6, 30)], ["أسابيع", G("rotate(90) scale(.32)", boneCut(0, 0, 1, t, 0))]].forEach(function (p, i) {
    var x = 520 - i * 200, k = at(u, .5 + i * .5, .35);
    s += callout(String(i + 1), x, 400, k, 22) + appear(k, G("translate(" + x + " 260)", p[1])) + G("", T(p[0], x, 480, 26, i === 2 ? ORANGE : INK, 800), k);
  });
  return s + tag("خطة طوارئ", 320, 640, at(u, 2.2, .3), 36, ORANGE);
});
// 6 · «أول ما الدم يقل؟»: the arm with a full bag, the camera flies to the vein
shot(6, push(300, 400, 0.92, 1.0), function (u, d, t) { return paper() + donorArm({ k: 1, t: t }) + mlBox(470, 110, 1) + T("؟", 120, 200, 110, ORANGE, 800); });
// 7 · vessels narrow, the heart beats a little faster, the pressure stays put
shot(7, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var sq = at(u, .4, 1.2), bpm = Math.round(lerp(72, 85, at(u, 1.6, 1.2))), beat = Math.max(0, Math.sin(t * lerp(7.5, 9, sq)));
  return paper() + vesselX(170, 300, 110, sq, t) + arrow(170, 120, 170, 165, BLUE, 4, sq) + arrow(170, 480, 170, 435, BLUE, 4, sq) + arrow(-10, 300, 35, 300, BLUE, 4, sq) + arrow(350, 300, 305, 300, BLUE, 4, sq) +
    label(170, 190, 300, 120, "العروق", OLIVE, at(u, .3, .4), 24) + heart(470, 300, 1.2, beat) + numBox(String(bpm), 470, 440, at(u, 1.2, .3), 34, true) + T("نبضة/دقيقة", 470, 480, 18, MUTE, 700) +
    gauge(320, 650, 110, .5 + .02 * Math.sin(t * 3), "الضغط ثابت");
});
// 8 · like pinching the nozzle of a garden hose so the water reaches the end of the garden
shot(8, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .6, 1), reach = lerp(180, 380, k), s = paper();
  s += '<path d="M-40 520 C40 540 60 380 140 380" stroke="' + INK + '" stroke-width="30" fill="none"/><path d="M-40 520 C40 540 60 380 140 380" stroke="#4f8a5a" stroke-width="24" fill="none"/>';
  s += R(140, 366, 30, 28, "#c9a44a", 2) + '<path d="M170 ' + f(372 + 6 * k) + ' L170 ' + f(388 - 6 * k) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 26; i++) { var p = ((i / 26) + t * .9) % 1, x = 172 + p * reach, y = 380 - Math.sin(p * Math.PI) * (110 * (1 - .3 * k)) + p * p * 260 * (1 - k * .35); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(4 - 2 * p) + '" fill="#7fa6c4"/>'; }
  s += PERSON.hand([110, 410], -0.25, "fist", -1, 2.2, null, false);
  s += R(0, 600, 640, 200, "#b8b77a", 2) + G("", '<path d="M' + f(172 + reach) + ' 600 v-40" stroke="' + ORANGE + '" stroke-width="4"/>' + T("لآخر الجنينة", 172 + reach - 10, 548, 22, ORANGE, 800, "end"), at(u, 1.4, .4));
  return s + iconBox(100, 110, 140, vesselX(0, 0, 40, .3 + .3 * Math.sin(t * 2), t), at(u, .3, .3));
});
// 9 · «الكمية نفسها بترجع إمتى؟»: the tube down to 4.5 L, a question mark
shot(9, push(320, 400, 1.06, 1.0), function (u, d, t) { return paper() + bloodTube(250, 140, 470, 4.5, t, 1) + T("؟", 470, 330, 140, ORANGE, 800); });
// 10 · the water between the cells is drawn into the vessels, like a sponge dripping
shot(10, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + tissue(t, at(u, .4, d - .6)) + label(270, 210, 210, 90, "خلايا", OLIVE, at(u, .3, .4), 24) + label(560, 400, 620, 720, "عرق دم", OLIVE, at(u, .8, .4), 24) + label(330, 300, 410, 92, "مية", BLUE, at(u, 1.2, .4), 24) +
    iconBox(80, 70, 110, '<rect x="-36" y="-30" width="72" height="34" rx="6" fill="#e9cf62" stroke="' + INK + '" stroke-width="2"/><circle cx="-14" cy="-14" r="5" fill="#c9ac3e"/><circle cx="12" cy="-18" r="4" fill="#c9ac3e"/><circle cx="20" cy="-6" r="3" fill="#c9ac3e"/>' + drop(0, 18 + ((t * 30) % 22), 6), at(u, 1.6, .3));
}, { tr: "in" });
// 11 · the volume is back within a day or two; drink lots of water
shot(11, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.6), gl = at(u, 1.6, 1.2);
  return paper() + bloodTube(220, 140, 470, 4.5 + .5 * k, t, 1) + calPage(470, 230, 170, "يومين", at(u, .3, .3)) +
    '<path d="M420 430 L436 600 H504 L520 430 Z" fill="#f7f3ec" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(lerp(434, 422, gl)) + ' ' + f(lerp(598, 450, gl)) + ' H' + f(lerp(506, 518, gl)) + ' L504 598 H436 Z" fill="#9fc0d6"/>' + T("اشرب مية", 470, 650, 24, BLUE, 800);
});
// 12 · but the blood is thinner now: fewer red cells in the same plasma
shot(12, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + sample(470, 360, 130, 34, t) + G("", sample(170, 360, 130, 20, t), at(u, .5, .3)) + T("قبل", 470, 540, 26, INK, 800) + G("", T("دلوقتي", 170, 540, 26, BLUE, 800) + tag("مخفّف", 170, 640, at(u, 1, .3), 32, BLUE), at(u, .5, .3));
});
// 13 · «مين اللي بياخد باله؟»: the thinned sample, a question mark
shot(13, push(320, 400, 1.0, 1.08), function (u, d, t) { return paper() + sample(260, 400, 170, 20, t) + T("؟", 500, 440, 160, ORANGE, 800); });
// 14 · the kidney feels the oxygen it gets has dropped
shot(14, push(300, 400, 0.98, 1.06), function (u, d, t) {
  var k = at(u, .8, 1.2);
  return paper() + appear(at(u, 0, .4), kidney(250, 400, 1.9)) + label(150, 300, 70, 140, "الكلية", OLIVE, at(u, .3, .5), 28) +
    T("أكسجين O₂", 520, 150, 22, INK, 700) + R(440, 170, 160, 30, "#f7f3ec", 2.2, 15) + '<rect x="443" y="173" width="' + f(154 * lerp(.9, .55, k)) + '" height="24" rx="12" fill="' + BLUE + '"/>' + arrow(520, 230, 520, 290, ORANGE, 5, k);
});
// 15 · it sends a hormone to the bone marrow: «اشتغل زيادة»
shot(15, push(320, 420, 1.0, 0.95), function (u, d, t) {
  var s = paper() + kidney(130, 230, 1.1) + G("", boneCut(470, 470, .9, t, 0), 1), vp = "M200 230 C320 200 360 380 440 400";
  s += '<path d="' + vp + '" stroke="' + INK + '" stroke-width="20" fill="none"/><path d="' + vp + '" stroke="#e6a1a0" stroke-width="15" fill="none"/>';
  for (var i = 0; i < 6; i++) { var p = ((i / 6) + u * .45) % 1, q = Math.pow(1 - p, 3), x = q * 200 + 3 * Math.pow(1 - p, 2) * p * 320 + 3 * (1 - p) * p * p * 360 + p * p * p * 440, y = q * 230 + 3 * Math.pow(1 - p, 2) * p * 200 + 3 * (1 - p) * p * p * 380 + p * p * p * 400; if (u > .4) s += C(x, y, 6, ORANGE, 1.4); }
  return s + label(300, 228, 300, 120, "هرمون", ORANGE, at(u, .6, .4), 26) + label(470, 560, 330, 700, "نخاع العضم", OLIVE, at(u, 1.2, .5), 26) + G("", '<path d="M520 170 H630 V240 H560 L540 262 L544 240 H520 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T("اشتغل زيادة!", 575, 214, 18, ORANGE, 800), at(u, 2, .3));
});
// 16 · the marrow already makes about 2 million red cells a second; it turns production up
shot(16, push(300, 420, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .6, 2.2); return paper() + boneCut(170, 470, 1.05, t, .6 + 1.2 * k) + numBox(count(2000000, k), 430, 120, at(u, .3, .3), 36, true) + T("كرة حمرا كل ثانية", 430, 168, 22, INK, 700);
});
// 17 · within 4 to 6 weeks the red cells are back
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + bar(80, 200, 480, lerp(.55, 1, at(u, .5, d - 1)), "#c4364a", "كرات حمرا") + calPage(320, 480, 220, "أسابيع", at(u, .2, .3)) + G("", N("4–6", 320, 680, 56, ORANGE), at(u, .6, .3)) + rbc(560 + 4 * Math.sin(t * 2), 140, 18, t * 20);
});
// 18 · each cell needs iron, and the iron is slower to come back
shot(18, push(320, 400, 1.05, 1.0), function (u, d, t) {
  return paper() + bar(80, 200, 480, 1, "#c4364a", "كرات حمرا") + bar(80, 320, 480, lerp(.12, .5, at(u, .6, d - .8)), "#8a5a3c", "حديد Fe") + calPage(320, 560, 200, "أطول", at(u, 1, .3)) +
    G("translate(110 560)", '<rect x="-46" y="-30" width="92" height="60" rx="6" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2"/>' + N("Fe", 0, 12, 32, "#f4ecdb"), at(u, .3, .3));
});
// 19 · so you can't donate again for about 3 months
shot(19, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(); [0, 1, 2].forEach(function (i) { s += calPage(520 - i * 200, 260, 160, "شهر " + (i + 1), at(u, .2 + i * .35, .3)); });
  return s + bloodBag(320, 450, .9, t, .9) + cross(320, 560, 1.6, at(u, 1.6, .5)) + numBox("3", 140, 620, at(u, 1.1, .3), 50) + T("شهور", 140, 690, 26, INK, 800);
});
// 20 · the myth: «donating weakens the blood for good» — crossed out
shot(20, push(320, 400, 1.02, 1.1), function (u, d, t) {
  return paper() + donor(320, 560, 1.1, t, { brows: "worried", mouth: "frown", eyes: .8 }) + sample(140, 200, 90, 10, t) + T("للأبد؟", 140, 340, 28, INK, 800) + cross(320, 320, 2.4, at(u, d * .6, .5));
});
// 21 · the volume in two days, the cells in a few weeks, the body makes it up alone
shot(21, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(); [["الحجم", "يومين", BLUE], ["الكرات", "كام أسبوع", ORANGE]].forEach(function (r, i) { var y = 220 + i * 170, k = at(u, .3 + i * 1.1, .4);
    s += G("", R(70, y - 60, 500, 120, "#f4ecdb", 2.2, 10) + T(r[0], 540, y + 10, 34, INK, 800, "start") + T(r[1], 260, y + 10, 32, r[2], 800), k) + check(130, y, 1.2, at(u, .8 + i * 1.1, .4), OLIVE); });
  return s + donor(320, 640, .55, t, { mouth: "smile" }) ;
});
// 22 · «يعني من الآخر»: the four steps in a chain
shot(22, push(320, 400, 0.96, 1.04), function (u, d, t) {
  var s = paper(), items = [[480, 210, vesselX(0, 0, 55, .4 + .2 * Math.sin(t * 3), t)], [180, 210, drop(0, 10, 44)], [480, 540, kidney(0, 0, .8)], [180, 540, G("rotate(90) scale(.38)", boneCut(0, 0, 1, t, 0))]];
  items.forEach(function (p, i) { var k = at(u, .3 + i * .9, .4); s += appear(k, G("translate(" + p[0] + " " + f(p[1] + 8 * Math.sin(t * 2.4 + i)) + ")", p[2])) + callout(String(i + 1), p[0] + 90, p[1] - 90, k, 20); });
  return s + arrow(400, 210, 260, 210, INK, 3, at(u, 1, .3)) + arrow(200, 290, 420, 460, INK, 3, at(u, 1.9, .3)) + arrow(400, 540, 260, 540, INK, 3, at(u, 2.8, .3));
});
// 23 · the odd fact: the body already swaps about 1% of its blood a day (a red cell lives about 120 days)
shot(23, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var s = paper(), n = Math.floor(t * 1.5) % 100;
  for (var i = 0; i < 100; i++) { var x = 120 + (i % 10) * 44, y = 180 + Math.floor(i / 10) * 44; s += i === n ? C(x, y, 22, "none", 2.4).replace('stroke="' + INK + '"', 'stroke="' + ORANGE + '"') + rbc(x, y, 15 * (.6 + .4 * ((t * 1.5) % 1)), i * 17, "#e2a062") : rbc(x, y, 15, i * 17); }
  return s + bigNum("1%", "كل يوم", 320, 690, at(u, .5, .4), ORANGE, 70);
});
// 24 · one bag can save up to three people: red cells, plasma, platelets
shot(24, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + bloodBag(320, 90, 1, t, .8), parts = [["كرات حمرا", BLOOD], ["بلازما", PLASMA], ["صفايح", "#e7b46a"]];
  parts.forEach(function (p, i) { var x = 520 - i * 200, k = at(u, .4 + i * .4, .4);
    s += arrow(320, 300, x, 360, INK, 3, k) + appear(k, '<rect x="' + (x - 28) + '" y="370" width="56" height="70" rx="8" fill="' + p[1] + '" stroke="' + INK + '" stroke-width="2"/>') + G("", T(p[0], x, 470, 20, INK, 700), k) +
      appear(at(u, 1.6 + i * .3, .4), donor(x, 720, .55, t + i, { mouth: "smile" })); });
  return s + numBox("3", 560, 140, at(u, 2.6, .3), 46);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: the arm, the bag fills, the counter runs to 450 ml in «10 minutes». line 1: he gets up and walks. line 2: the bag and «؟»
  if (li === 0) { var l0 = LN[0], k = clamp((t - l0.start) / Math.max(1, l0.end - l0.start)); return G("translate(-30 -40) scale(.95)", donorArm({ k: k, t: t })) + mlBox(440, 60, k); }
  if (li === 1) { var u = Math.max(0, t - LN[1].start), x = 60 + u * 70, ph = u * Math.PI * 2 * .9, o = Object.assign({ x: x, s: 1.15, dir: 1, outfit: "casual", lean: 3, breath: (Math.sin(t * 2) + 1) / 2, face: { mouth: "smile" } }, PERSON.walkPose(ph, 1));
    o.y = PERSON.sideHipY(o, 610); return R(-10, 610, 640, 10, "#d6cdb6", 2) + G("", bloodBag(520, 330, 1, t, .9), 1) + PERSON.side(o).svg + G("translate(470 120)", '<rect x="-60" y="-36" width="120" height="56" rx="10" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T("عادي", 0, 2, 26, BLUE, 800)); }
  return G("rotate(" + f(5 * Math.sin(t * 1.8)) + " 300 120)", bloodBag(300, 120, 1, t, 1.4)) + T("؟", 300 + 10 * Math.sin(t * 2.2), 520 + 14 * Math.sin(t * 3), 120, ORANGE, 800);
};
SCENE.bumper = function (u, t) { return bloodBag(90, 40, .5 + .4 * ((Math.sin(t * 1.4) + 1) / 2), t, .62) + drop(150 + 3 * Math.sin(t * 2), 70, 12, BLOOD); };
SCENE.outro = function (svg, u, t) {
  return G("translate(520 140)", vesselX(0, 0, 40, .4, t)) + G("translate(380 150)", drop(0, 6, 36)) + G("translate(240 150)", kidney(0, 0, .55)) + G("translate(90 140) rotate(90) scale(.3)", boneCut(0, 0, 1, t, 0)) +
    callout("1", 560, 70, ease(u / .3)) + callout("2", 410, 80, ease(u / .3 - .5)) + callout("3", 280, 70, ease(u / .3 - 1)) + callout("4", 130, 70, ease(u / .3 - 1.5));
};
