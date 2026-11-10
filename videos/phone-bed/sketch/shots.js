// ── «أوعى تمسك الموبايل في السرير» — drawings. Shapes follow real anatomy (refs/SOURCES.md: the schematic eye on
// Wikimedia Commons; the brain's mid-line cut) drawn in the hand of the «طب إزاي؟» sleep videos (sheets v04, v06, v11).
// Head facing right, cut down the middle: eye → optic nerve → the clock above the crossing (SCN) → the pineal gland
// behind the thalamus, which lets out melatonin (olive dots) in the dark.

var HEADC = "#e4c6a6", BRAIN = "#d29a80", BRAIN_D = "#a96f55", THAL = "#c98a72", WHITE = "#f6efe2", SCREEN = "#cfe0ec",
    GLOW = "#9cc0db", WOODC = "#b98a5e", WOODD = "#8a6040", SHEET = "#e9e1cc", BLANK = "#8fa3b5", BLANK_D = "#6f8599", NIGHT = "#2f3b4a";

// ── the melatonin level over the episode (0..1): rises at line 10, falls when the phone lights up (13), stays low
function melLevel(t) {
  var up = clamp((t - LN[10].start) / 3), down = clamp((t - LN[13].start - 0.8) / 2.2);
  return 0.12 + 0.76 * ease(up) - 0.66 * ease(down);
}
function melDots(x, y, t, n, spread, k) {   // olive melatonin dots drifting out of (x, y)
  var s = ""; for (var i = 0; i < n; i++) { var ph = (t * 0.35 + hash(i)) % 1, a = hash(i + 7) * Math.PI * 2, r = spread * ph;
    s += '<circle cx="' + f(x + Math.cos(a) * r) + '" cy="' + f(y + Math.sin(a) * r * 0.8 + ph * 30) + '" r="' + f(4.5 - ph * 1.5) + '" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(k * (1 - ph * .7)) + '"/>'; }
  return s;
}
function pulseAlong(d, t, col, n, k, speed) {   // dots running along a path (a signal)
  var s = ""; for (var i = 0; i < (n || 3); i++) { var off = ((t * (speed || .7) + i / (n || 3)) % 1);
    s += '<path d="' + d + '" pathLength="1" stroke-dasharray="0.001 1" stroke-dashoffset="' + f(-off) + '" stroke="' + (col || ORANGE) + '" stroke-width="11" stroke-linecap="round" fill="none" opacity="' + f(k) + '"/>'; }
  return s;
}

// ── the phone: rounded body, lit screen with feed rows; on = 0..1 how bright; tint = "blue" | "night"
function phone(x, y, s, on, t, tint) {
  var scr = tint === "night" ? "#ead6a8" : SCREEN, rows = "";
  for (var i = 0; i < 4; i++) { var yy = -58 + i * 30 - ((t * 22) % 30); if (yy > -66 && yy < 52) rows += R(-22, yy, 44, 20, i % 2 ? "#b4c9d8" : "#e9eef2", 0, 3) + R(-22, yy + 22, 30, 4, MUTE, 0); }
  var g = '<rect x="-36" y="-76" width="72" height="152" rx="12" fill="' + INK + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<rect x="-30" y="-66" width="60" height="130" rx="4" fill="' + (on > 0 ? scr : "#3b3a37") + '"/>';
  if (on > 0 && tint !== "night") g += '<g opacity="' + f(on) + '"><clipPath id="ph' + (++CLIPN) + '"><rect x="-30" y="-66" width="60" height="130"/></clipPath><g clip-path="url(#ph' + CLIPN + ')">' + rows + '</g></g>';
  g += '<rect x="-10" y="-72" width="20" height="3" rx="1.5" fill="#555"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", g);
}
// a cone of light from (x1,y1) to (x2,y2), width w at the far end
function beam(x1, y1, x2, y2, w, k, col) {
  if (k <= 0) return ""; var a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  return '<path d="M' + f(x1 + nx * w * .6) + ' ' + f(y1 + ny * w * .6) + ' L' + f(x2 + nx * 6) + ' ' + f(y2 + ny * 6) + ' L' + f(x2 - nx * 6) + ' ' + f(y2 - ny * 6) + ' L' + f(x1 - nx * w * .6) + ' ' + f(y1 - ny * w * .6) + ' Z" fill="' + (col || GLOW) + '" opacity="' + f(.45 * k) + '"/>';
}
function rays(x1, y1, x2, y2, t, k, col) {   // little light dashes flying from (x1,y1) to (x2,y2)
  var s = ""; for (var i = 0; i < 5; i++) { var p = (t * 1.1 + i / 5) % 1, x = lerp(x1, x2, p), y = lerp(y1, y2, p) + (i - 2) * 6 * (1 - p), a = Math.atan2(y2 - y1, x2 - x1);
    s += '<path d="M' + f(x) + ' ' + f(y) + ' l' + f(Math.cos(a) * 16) + ' ' + f(Math.sin(a) * 16) + '" stroke="' + (col || BLUE) + '" stroke-width="4" stroke-linecap="round" opacity="' + f(k * Math.sin(p * Math.PI)) + '"/>'; }
  return s;
}

// ── the head, cut down the middle, facing right (world units; fits a 640×786 panel at zoom 1)
var EYE = [478, 382], CHIASM = [392, 438], SCN = [384, 420], PINEAL = [258, 372], THALC = [318, 372];
function headCut(t, op) {
  op = op || {}; var s = "";
  // skin and neck
  s += P("M215 790 C210 700 120 610 118 450 C116 270 225 165 335 165 C450 165 512 245 515 335 L512 362 C528 372 532 386 522 400 L560 470 C566 480 556 488 540 488 L530 492 C538 500 536 512 526 516 C536 524 532 540 520 546 C522 576 506 606 470 610 C450 612 432 610 425 640 L420 790 Z", HEADC, 2.4);
  s += '<path d="M215 790 C210 700 120 610 118 450 C116 300 200 200 300 175" stroke="' + SKIN2 + '" stroke-width="9" fill="none" opacity=".35"/>';
  // skull band
  s += P("M150 452 C140 300 235 192 335 192 C436 192 492 262 494 336", "none", 7, ' stroke="#efe3cf" opacity=".9"');
  // brain
  var brain = "M165 440 C150 300 240 210 335 210 C430 210 484 272 482 340 C480 388 452 412 420 424 C400 432 392 446 372 448 C340 452 330 432 300 436 C262 442 228 470 196 466 C176 462 166 452 165 440 Z";
  var id = "br" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + brain + '"/></clipPath>' + P(brain, BRAIN, 2.4);
  var gy = ""; for (var i = 0; i < 9; i++) { var yy = 228 + i * 26; gy += '<path d="M150 ' + yy + ' q22 -14 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0" stroke="' + BRAIN_D + '" stroke-width="2" fill="none" transform="rotate(' + (i % 2 ? 4 : -3) + ' 320 ' + yy + ')"/>'; }
  s += '<g clip-path="url(#' + id + ')">' + gy + '</g>';
  // corpus callosum arc and the thalamus
  s += P("M232 360 C232 290 300 268 352 272 C410 276 436 312 420 352 C410 336 380 316 348 314 C300 312 264 330 258 366 Z", "#f0e2cf", 2);
  s += '<ellipse cx="' + THALC[0] + '" cy="' + THALC[1] + '" rx="44" ry="27" fill="' + THAL + '" stroke="' + INK + '" stroke-width="2"/>';
  // cerebellum (striped) and brain stem
  s += P("M190 470 C176 440 214 420 258 432 C292 442 300 470 286 492 C266 520 208 512 190 470 Z", "#c88d73", 2.2);
  for (var j = 0; j < 5; j++) s += '<path d="M' + (198 + j * 3) + ' ' + (448 + j * 11) + ' Q245 ' + (436 + j * 12) + ' ' + (284 - j * 3) + ' ' + (458 + j * 9) + '" stroke="' + BRAIN_D + '" stroke-width="1.6" fill="none"/>';
  s += P("M300 436 C318 470 318 520 306 600 L276 600 C286 530 284 480 270 446 Z", "#cf9a80", 2.2);
  // eye in its socket, the optic nerve to the crossing
  s += P("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1], "none", 9, ' stroke="#e8d27a" stroke-linecap="round"');
  s += P("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1], "none", 1.6);
  s += C(EYE[0], EYE[1], 20, WHITE, 2.2) + C(EYE[0] + 13, EYE[1], 7, op.pupil || BLUE, 1.4) + C(EYE[0] + 15, EYE[1], 3, INK, 0);
  s += P("M" + (EYE[0] - 6) + " " + (EYE[1] - 24) + " Q" + (EYE[0] + 24) + " " + (EYE[1] - 30) + " " + (EYE[0] + 30) + " " + (EYE[1] - 6), "none", 3);   // lid
  // the clock (SCN) and the pineal gland (a small pine cone behind the thalamus)
  if (!op.noClock) s += clockMark(SCN[0], SCN[1] - 14, 16, t, op.clockSun);
  s += pinecone(PINEAL[0], PINEAL[1], 1, op.pinealHi);
  return s;
}
function clockMark(x, y, r, t, sun) {
  var a = t * 1.3, s = C(x, y, r, sun ? "#f1c890" : "#f4ecdb", 2.2);
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * r * .75) + ' ' + f(y + Math.sin(a) * r * .75) + ' M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r * .55) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
  return s;
}
function pinecone(x, y, s, hi) {
  var g = '<path d="M0 -15 C12 -12 15 4 9 13 C5 18 -5 18 -9 13 C-15 4 -12 -12 0 -15 Z" fill="' + (hi ? OLIVE : "#9a8a5a") + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M-10 -2 L9 8 M-11 6 L5 15 M10 -2 L-8 8 M11 6 L-4 15 M-6 -10 L8 0 M6 -10 L-7 0" stroke="' + INK + '" stroke-width="1" opacity=".55"/>';
  return G("translate(" + f(x) + " " + f(y) + ") rotate(-30) scale(" + s + ")", g);
}

// ── the eye, cut through (the schematic eye on Commons): cornea and lens on the right, retina lining the back, nerve out at the back
function eyeCut(cx, cy, r, t, op) {
  op = op || {}; var s = "";
  s += P("M" + f(cx - r * .55) + " " + f(cy + r * .78) + " L" + f(cx - r * 1.05) + " " + f(cy + r * 1.35) + " L" + f(cx - r * .8) + " " + f(cy + r * 1.5) + " L" + f(cx - r * .3) + " " + f(cy + r * .92) + " Z", "#e8d27a", 2.2);   // optic nerve
  s += C(cx, cy, r, WHITE, 2.6);                                         // sclera
  s += C(cx, cy, r * .93, "#b5523c", 0) + C(cx, cy, r * .9, "#f0c860", 0);   // choroid, retina
  s += C(cx, cy, r * .86, "#f1e7d4", 1.4);                                // vitreous
  var rd = "", k; for (k = 0; k < 6; k++) { var a0 = 2.5 + k * .35; rd += '<path d="M' + f(cx - r * .5) + ' ' + f(cy + r * .62) + ' Q' + f(cx + Math.cos(a0) * r * .5) + ' ' + f(cy + Math.sin(a0) * r * .4) + ' ' + f(cx + Math.cos(a0 - 1.2) * r * .8) + ' ' + f(cy + Math.sin(a0 - 1.2) * r * .8) + '" stroke="#c4553e" stroke-width="2" fill="none" opacity=".55"/>'; }
  s += rd;
  s += P("M" + f(cx + r * .82) + " " + f(cy - r * .42) + " Q" + f(cx + r * 1.22) + " " + f(cy) + " " + f(cx + r * .82) + " " + f(cy + r * .42), "#cfe0ea", 2.4);   // cornea
  s += '<rect x="' + f(cx + r * .74) + '" y="' + f(cy - r * .5) + '" width="' + f(r * .08) + '" height="' + f(r * .3) + '" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + f(cx + r * .74) + '" y="' + f(cy + r * .2) + '" width="' + f(r * .08) + '" height="' + f(r * .3) + '" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.4"/>';   // iris
  s += '<ellipse cx="' + f(cx + r * .62) + '" cy="' + f(cy) + '" rx="' + f(r * .16) + '" ry="' + f(r * .34) + '" fill="#e6edf0" stroke="' + INK + '" stroke-width="2"/>';   // lens
  return s;
}
// the magnified retina: rods and cones (grey) and a few light-measuring cells (olive, with long branches)
function retinaInset(t, k, hi) {
  var s = '<rect x="-150" y="-150" width="300" height="300" fill="#f3d98a"/>' + '<rect x="-150" y="70" width="300" height="80" fill="#b5523c"/>';
  for (var i = 0; i < 16; i++) { var x = -140 + i * 18; s += R(x, -10, 9, 78, i % 3 ? GREY : "#d8d2c4", 1.2, 4); }
  [[-90, -60], [10, -70], [100, -55]].forEach(function (c, j) {
    var col = hi ? OLIVE : "#a7a58a", g = '<path d="M' + c[0] + ' ' + c[1] + ' l-40 -40 M' + c[0] + ' ' + c[1] + ' l36 -44 M' + c[0] + ' ' + c[1] + ' l0 -60 M' + c[0] + ' ' + c[1] + ' l-46 18 M' + c[0] + ' ' + c[1] + ' l50 14" stroke="' + col + '" stroke-width="3.4" stroke-linecap="round"/>';
    s += g + C(c[0], c[1], 13, col, 2);
    if (hi) s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + f(17 + 5 * Math.sin(t * 5 + j)) + '" fill="none" stroke="' + OLIVE + '" stroke-width="2" opacity=".6"/>';
  });
  return s;
}

// ── the bed from the side: person lying on the back, head on the pillow (left), blanket over the body
function bedSide(x, y, t, op) {
  op = op || {}; var s = "", br = 1 + 0.025 * Math.sin(t * (op.calm ? 1.4 : 2.6));
  s += R(x - 20, y + 60, 560, 30, WOODC, 2.4) + R(x - 30, y - 70, 26, 200, WOODD, 2.4) + R(x + 530, y + 10, 22, 120, WOODD, 2.4);
  s += R(x - 6, y + 22, 540, 40, SHEET, 2.2, 6);                                                   // mattress
  s += P("M" + (x + 4) + " " + (y + 22) + " C" + (x + 0) + " " + (y - 14) + " " + (x + 120) + " " + (y - 18) + " " + (x + 126) + " " + (y + 22) + " Z", "#f4efe3", 2.2);   // pillow
  // head in profile looking up (face to the top)
  var hx = x + 70, hy = y - 8;
  s += '<ellipse cx="' + hx + '" cy="' + hy + '" rx="42" ry="36" fill="' + HEADC + '" stroke="' + INK + '" stroke-width="2.2"/>';
  s += P("M" + (hx + 6) + " " + (hy - 36) + " l8 -12 l8 10", "none", 2.2) + P("M" + (hx - 44) + " " + (hy - 6) + " C" + (hx - 50) + " " + (hy - 40) + " " + (hx - 10) + " " + (hy - 50) + " " + (hx + 6) + " " + (hy - 36), "#5a4232", 2);
  var lid = op.eyesShut ? '<path d="M' + (hx + 18) + ' ' + (hy - 26) + ' q8 5 16 0" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' : C(hx + 26, hy - 26, 5, WHITE, 1.6) + C(hx + 27, hy - 28, 2.2, INK, 0);
  s += lid;
  // blanket with the body under it, breathing
  s += G("translate(" + (x + 120) + " " + (y + 30) + ") scale(1 " + f(br) + ") translate(" + -(x + 120) + " " + -(y + 30) + ")",
    P("M" + (x + 96) + " " + (y + 30) + " C" + (x + 110) + " " + (y - 40) + " " + (x + 250) + " " + (y - 46) + " " + (x + 330) + " " + (y - 24) + " C" + (x + 420) + " " + (y - 10) + " " + (x + 470) + " " + (y - 44) + " " + (x + 520) + " " + (y - 20) + " L" + (x + 534) + " " + (y + 34) + " Z", BLANK, 2.4) +
    '<path d="M' + (x + 110) + ' ' + (y - 6) + ' C' + (x + 160) + ' ' + (y - 30) + ' ' + (x + 220) + ' ' + (y - 34) + ' ' + (x + 300) + ' ' + (y - 18) + '" stroke="' + BLANK_D + '" stroke-width="2" fill="none"/>');
  if (op.phone) {   // the arm comes up out of the blanket and holds the phone over the face
    var px = hx + 38, py = y - 130 + 3 * Math.sin(t * 1.7);
    s += P("M" + (x + 150) + " " + (y - 20) + " C" + (x + 160) + " " + (y - 80) + " " + (px + 30) + " " + (py + 60) + " " + (px + 14) + " " + (py + 34), "none", 16, ' stroke="' + HEADC + '" stroke-linecap="round"');
    s += P("M" + (x + 150) + " " + (y - 20) + " C" + (x + 160) + " " + (y - 80) + " " + (px + 30) + " " + (py + 60) + " " + (px + 14) + " " + (py + 34), "none", 2, ' opacity=".5"');
    s += beam(px, py + 30, hx + 26, hy - 26, 60, op.phone, GLOW) + G("translate(" + px + " " + py + ") rotate(160)", phone(0, 0, .55, op.phone, t));
  }
  return s;
}
function windowNight(x, y, w, h, day) {
  var s = R(x, y, w, h, day ? "#bcd3df" : NIGHT, 3) + '<path d="M' + (x + w / 2) + ' ' + y + ' v' + h + ' M' + x + ' ' + (y + h / 2) + ' h' + w + '" stroke="' + WOODD + '" stroke-width="4"/>';
  if (day) s += C(x + w * .3, y + h * .3, 16, "#e2a062", 2); else s += '<path d="M' + (x + w * .3 + 12) + ' ' + (y + h * .2) + ' a14 14 0 1 0 10 22 a11 11 0 1 1 -10 -22 Z" fill="#f2e6b8"/>' + '<circle cx="' + (x + w * .75) + '" cy="' + (y + h * .3) + '" r="2" fill="#fff"/><circle cx="' + (x + w * .62) + '" cy="' + (y + h * .7) + '" r="1.6" fill="#fff"/>';
  return s;
}
function wallClock(x, y, r, hh, mm) {
  var s = C(x, y, r, "#f4ecdb", 3), k;
  for (k = 0; k < 12; k++) { var a = k / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(a) * r * .8) + ' ' + f(y + Math.sin(a) * r * .8) + ' L' + f(x + Math.cos(a) * r * .92) + ' ' + f(y + Math.sin(a) * r * .92) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  var am = mm / 60 * Math.PI * 2 - Math.PI / 2, ah = (hh % 12 + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(am) * r * .72) + ' ' + f(y + Math.sin(am) * r * .72) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(ah) * r * .48) + ' ' + f(y + Math.sin(ah) * r * .48) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 4, INK, 0);
}
// the melatonin gauge (a lab tube) that stays top-right while the hormone is the subject
function gauge(x, y, lv, t) {
  var h = 150, top = y + h * (1 - lv) + 2 * Math.sin(t * 3);
  var s = '<rect x="' + (x - 22) + '" y="' + y + '" width="44" height="' + h + '" rx="20" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<clipPath id="gz' + (++CLIPN) + '"><rect x="' + (x - 22) + '" y="' + y + '" width="44" height="' + h + '" rx="20"/></clipPath><g clip-path="url(#gz' + CLIPN + ')"><rect x="' + (x - 22) + '" y="' + f(top) + '" width="44" height="' + h + '" fill="' + OLIVE + '"/>' + melDots(x, top + 16, t, 5, 12, .8) + '</g>';
  for (var k = 1; k < 4; k++) s += '<path d="M' + (x - 22) + ' ' + (y + k * h / 4) + ' h10" stroke="' + INK + '" stroke-width="1.6"/>';
  return s + T("ميلاتونين", x, y + h + 26, 19, OLIVE, 800);
}
hud(10, 14, function (u, t) { return '<rect x="520" y="22" width="104" height="214" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6" opacity=".92"/>' + gauge(572, 40, melLevel(t), t); });

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a pinned rule card — light in the eye = the body's clock
shot(4, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", '<rect x="120" y="230" width="400" height="230" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 345)"/>' + C(320, 238, 9, ORANGE, 2) +
    T("النور في عينك", 320, 320, 40, ORANGE, 800) + T("هو ساعة جسمك", 320, 384, 36, INK, 700), at(u, .3, .4)) + G("translate(320 560)", '<circle r="34" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + rays(-120, 0, -30, 0, t, at(u, 1, .4), BLUE) + C(0, 0, 14, BLUE, 2) + C(3, 0, 6, INK, 0), at(u, .8, .4));
});
// 5 · not from the clock (crossed out), from the light coming into your eye (✓)
shot(5, push(320, 400, 1.05, 0.98), function (u, d, t) {
  var k1 = at(u, .2, .4), k2 = at(u, 2.2, .4);
  return paper() + appear(k1, wallClock(180, 300, 90, 10, (t * 40) % 60)) + cross(180, 300, 2.2, at(u, 1.3, .5)) +
    appear(k2, eyeCut(340, 560, 110, t)) + rays(560, 470, 460, 540, t, k2, ORANGE) + check(470, 720, 1.4, at(u, 3.4, .5), OLIVE) + label(180, 390, 330, 420, "الساعة", INK, k1, 24) + label(520, 500, 470, 420, "النور", ORANGE, at(u, 2.8, .5), 24);
});
// 6 · special cells in the eye that don't make pictures: they only measure light
shot(6, push(330, 380, 0.96, 1.06), function (u, d, t) {
  var k = at(u, 1.6, .5);
  return paper() + eyeCut(300, 330, 200, t) + rays(640, 280, 500, 330, t, 1, ORANGE) + label(150, 450, 250, 480, "الشبكية", ORANGE, at(u, .4, .5), 22) +
    inset(240, 640, 120, retinaInset(t, k, k > .5), k) + label(300, 560, 470, 560, "خلايا بتقيس النور", OLIVE, at(u, 2.4, .5), 22) +
    G("", iconBox(560, 110, 110, '<rect x="-36" y="-26" width="72" height="52" fill="#d8ccae" stroke="' + INK + '" stroke-width="2"/><path d="M-30 20 L-6 -6 L8 8 L18 -2 L30 20 Z" fill="' + OLIVE + '"/>' + C(16, -12, 6, ORANGE, 1)) + cross(560, 110, .9, at(u, 3.4, .4)), at(u, 3, .3));
});
// 7 · they feel blue light most — like the morning sky
var SPEC = ["#6b5b95", "#4a6f8a", "#3f8f9a", "#6f9a4a", "#c9b23e", "#d4813a", "#b5523c"];
shot(7, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .4, 1.2), s = paper(), x0 = 80, w = 480, y0 = 520;
  SPEC.forEach(function (c, i) { s += R(x0 + i * w / 7, y0, w / 7, 40, c, 1.4); });
  s += draw("M" + x0 + " " + (y0 - 20) + " C" + (x0 + 80) + " " + (y0 - 30) + " " + (x0 + 110) + " " + (y0 - 280) + " " + (x0 + 150) + " " + (y0 - 280) + " C" + (x0 + 200) + " " + (y0 - 280) + " " + (x0 + 250) + " " + (y0 - 60) + " " + (x0 + w) + " " + (y0 - 22), k, INK, 4);
  s += label(x0 + 150, y0 - 280, x0 + 300, y0 - 330, "النور الأزرق", BLUE, at(u, 1.6, .5), 26) + N("480 nm", x0 + 150, y0 + 82, 22, BLUE);
  s += T("بنفسجي", x0 + 30, y0 + 120, 17, MUTE, 600) + T("أحمر", x0 + w - 30, y0 + 120, 17, MUTE, 600);
  return s + iconBox(150, 140, 150, '<rect x="-75" y="-75" width="150" height="150" fill="#9fc0d6"/><rect x="-75" y="30" width="150" height="45" fill="#a7ad6c"/>' + C(30, -20, 18, "#f2d48a", 2) + '<rect x="-75" y="-75" width="150" height="150" fill="none" stroke="' + INK + '" stroke-width="1.6"/>', at(u, 2.4, .3));
});
// 8 · the cells signal a small clock in the middle of the brain (above where the optic nerves cross)
shot(8, push(360, 400, 0.98, 1.12), function (u, d, t) {
  var k = at(u, .5, .4); return paper() + headCut(t) + pulseAlong("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1] + " L" + SCN[0] + " " + (SCN[1] - 2), t, ORANGE, 3, k, .8) +
    label(SCN[0], SCN[1] - 28, 470, 200, "ساعة المخ", ORANGE, at(u, 1.6, .5), 24) + label(EYE[0], EYE[1] + 18, 560, 560, "العين", BLUE, at(u, .4, .5), 22);
}, { tr: "in" });
// 9 · when the light drops at night the clock tells the pineal gland
shot(9, push(320, 380, 1.05, 1.15), function (u, d, t) {
  var k = at(u, 2.4, .5); return paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '"/>', .12 * at(u, .8, 1)) + headCut(t) +
    pulseAlong("M" + SCN[0] + " " + (SCN[1] - 14) + " C360 330 300 330 " + PINEAL[0] + " " + PINEAL[1], t, ORANGE, 2, k, .6) +
    label(PINEAL[0], PINEAL[1], 300, 130, "الغدة الصنوبرية", OLIVE, at(u, 3.4, .5), 22) + G("translate(520 220)", '<path d="M14 -18 a22 22 0 1 0 16 30 a17 17 0 1 1 -16 -30 Z" fill="#f2e6b8" stroke="' + INK + '" stroke-width="2"/>', at(u, .6, .4));
});
// 10 · the gland lets out melatonin: «it's dark, get ready»
shot(10, push(320, 380, 1.15, 1.2), function (u, d, t) {
  return paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '" opacity=".12"/>') + headCut(t, { pinealHi: true }) + melDots(PINEAL[0], PINEAL[1], t, 14, 70, at(u, .4, .8)) +
    label(PINEAL[0] + 10, PINEAL[1] + 40, 330, 560, "ميلاتونين", OLIVE, at(u, 1, .5), 24);
});
// 11 · temperature down, breathing slows, eyes heavy (the bed, lights off)
shot(11, push(320, 420, 0.95, 1.02), function (u, d, t) {
  var k = at(u, .3, 2.6), s = paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '" opacity=".14"/>') + windowNight(70, 120, 150, 150) + bedSide(60, 520, t, { calm: true, eyesShut: u > 3.6 });
  s += G("translate(470 200)", R(-12, -90, 24, 150, "#f4ecdb", 2.2, 12) + R(-6, f(-80 + 60 * k), 12, f(124 - 60 * k), BLUE, 0, 6) + C(0, 76, 22, BLUE, 2.2) + arrow(40, -40, 40, 30, BLUE, 4, at(u, .6, .5)), at(u, .2, .4));
  s += wave(250, 330, 420, 330, t * .4, BLUE, lerp(10, 4, k), lerp(26, 60, k), at(u, 1.6, .5), 3);
  return s + label(130, 470, 150, 400, "عينك تتقل", BLUE, at(u, 3.2, .5), 22);
});
// 12 · the phone: its screen is right at your eye and full of blue light
shot(12, push(320, 380, 1.0, 1.12), function (u, d, t) {
  var k = at(u, .3, .4); return paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '" opacity=".2"/>') + bedSide(60, 520, t, { phone: k }) +
    measure(178, 310, 178, 476, at(u, 1.2, .6), "") + G("", N("30 cm", 250, 400, 26, ORANGE), at(u, 1.8, .3)) + label(150, 380, 300, 250, "نور أزرق", BLUE, at(u, 2.4, .5), 24);
}, { tr: "out" });
// 13 · the cells think the sun is still up; the clock switches melatonin off
shot(13, push(370, 390, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .3, .4), off = at(u, 1.6, .5);
  return paper() + headCut(t, { clockSun: off > .5 }) + beam(640, 350, EYE[0] + 20, EYE[1], 140, 1, GLOW) + phone(610, 370, .9, 1, t) + rays(590, 360, EYE[0] + 20, EYE[1], t, 1, BLUE) +
    pulseAlong("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1] + " L" + SCN[0] + " " + SCN[1], t, ORANGE, 3, k, 1) +
    melDots(PINEAL[0], PINEAL[1], t, 10, 60, 1 - off) + cross(PINEAL[0], PINEAL[1], .9, at(u, 2.2, .5)) + G("translate(" + SCN[0] + " 250)", C(0, 0, 24, "#e2a062", 2) + '<path d="M-34 0 h-10 M34 0 h10 M0 -34 v-10" stroke="' + ORANGE + '" stroke-width="4"/>', off);
});
// 14 · like switching the light off to sleep, and someone keeps switching it back on
shot(14, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var on = Math.floor(u * 1.6) % 2 === 1, s = paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '"/>', on ? 0 : .35);
  s += '<path d="M320 60 V200" stroke="' + INK + '" stroke-width="3"/>' + (on ? C(320, 250, 120, "#f4e1a0", 0) : "") + P("M290 200 h60 l-6 30 h-48 Z", "#8f8576", 2) + C(320, 262, 40, on ? "#f6e6a8" : "#d8d2c4", 2.4);
  s += G("translate(320 560)", R(-60, -90, 120, 180, "#f4ecdb", 2.4, 10) + R(-26, on ? -56 : 4, 52, 52, on ? ORANGE : GREY, 2.2, 6));
  return s + iconBox(540, 120, 120, '<path d="M-30 30 C-30 -10 30 -10 30 30" fill="' + INK + '" opacity=".8"/>' + C(0, -10, 14, HEADC, 2) + T("Z", 30, -20, 20, BLUE, 800), at(u, .3, .3));
});
// 15 · the Harvard trial: screen vs printed book, four hours before bed, five nights in a row
shot(15, push(320, 400, 1.02, 0.96), function (u, d, t) {
  var s = paper();
  s += G("translate(180 330)", phone(0, 0, 1.1, 1, t) + beam(0, 0, 0, 130, 160, .5, GLOW), at(u, .2, .4)) + G("translate(460 330)", P("M-80 -50 L0 -36 L80 -50 L80 60 L0 74 L-80 60 Z", "#f4ecdb", 2.4) + '<path d="M0 -36 V74" stroke="' + INK + '" stroke-width="2"/>' + [-30, -12, 6, 24].map(function (y) { return '<path d="M-66 ' + y + ' l54 7 M12 ' + (y + 7) + ' l54 -7" stroke="' + MUTE + '" stroke-width="2"/>'; }).join(""), at(u, .8, .4));
  s += T("شاشة", 180, 470, 26, ORANGE, 800) + T("كتاب ورق", 460, 470, 26, OLIVE, 800);
  s += numBox("4", 220, 600, at(u, 2.6, .3), 44) + G("", T("ساعات", 220, 670, 24, INK, 700), at(u, 2.8, .3));
  for (var i = 0; i < 5; i++) s += G("translate(" + (360 + i * 46) + " 590)", '<path d="M8 -18 a18 18 0 1 0 14 24 a14 14 0 1 1 -14 -24 Z" fill="' + NIGHT + '"/>', at(u, 3.6 + i * .15, .2));
  return s + G("", T("5 ليالي", 452, 670, 24, INK, 700), at(u, 4.2, .3)) + G("", T("Harvard", 320, 160, 30, MUTE, 800), at(u, .4, .4));
});
// 16 · melatonin came about 1.5 h later on the screen (a graph through the evening)
shot(16, push(320, 410, 1.0, 1.05), function (u, d, t) {
  var s = paper(), x0 = 70, y0 = 600, W = 500, k1 = at(u, .3, 1.2), k2 = at(u, 1.2, 1.4);
  s += '<path d="M' + x0 + ' 260 V' + y0 + ' H' + (x0 + W) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
  ["8", "10", "12", "2"].forEach(function (h, i) { s += N(h, x0 + 30 + i * 150, y0 + 34, 22, INK) + '<path d="M' + (x0 + 30 + i * 150) + ' ' + y0 + ' v8" stroke="' + INK + '" stroke-width="2"/>'; });
  s += T("بالليل", x0 + W - 20, y0 + 70, 18, MUTE, 600) + T("ميلاتونين", x0 + 60, 245, 20, OLIVE, 800);
  s += draw("M" + x0 + " 580 C160 578 190 570 230 500 C270 420 300 330 380 320 L" + (x0 + W) + " 312", k1, OLIVE, 5);
  s += draw("M" + x0 + " 584 C220 584 280 580 330 520 C370 470 400 390 470 380 L" + (x0 + W) + " 376", k2, ORANGE, 5);
  s += measure(230, 450, 342, 450, at(u, 2.6, .5), "") + G("", N("+1.5", 286, 430, 30, ORANGE) + T("ساعة", 286, 485, 20, INK, 700), at(u, 3, .3));
  return s + label(380, 320, 420, 270, "كتاب", OLIVE, at(u, 1, .5), 22) + label(470, 380, 520, 440, "شاشة", ORANGE, at(u, 2, .5), 22);
});
// 17 · what you watch wakes you up too: every new video and notification is a little rush for the brain
shot(17, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + phone(200, 430, 1.7, 1, t * 2.4);
  for (var i = 0; i < 4; i++) { var k = at(u, .6 + i * .7, .3); s += G("translate(" + (430 + (i % 2) * 40) + " " + (230 + i * 90) + ") scale(" + f(pop(clamp((u - .6 - i * .7) / .6))) + ")", R(-70, -26, 140, 52, "#f4ecdb", 2, 10) + C(-44, 0, 12, i % 2 ? ORANGE : BLUE, 1.6) + R(-24, -8, 80, 6, MUTE, 0) + R(-24, 6, 56, 6, GREY, 0), k); }
  for (var j = 0; j < 8; j++) { var a = j / 8 * Math.PI * 2 + t, r = 30 + 8 * Math.sin(t * 6 + j); s += '<path d="M' + f(220 + Math.cos(a) * (150 + r)) + ' ' + f(430 + Math.sin(a) * (170 + r)) + ' l' + f(Math.cos(a) * 18) + ' ' + f(Math.sin(a) * 18) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(at(u, 2.6, .4)) + '"/>'; }
  return s;
});
// 18 · «one more video…» and the time slips by: the clock hands race
shot(18, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var m = u * 260; return paper() + wallClock(320, 330, 170, 23 + Math.floor(m / 60), m % 60) + G("", T("فيديو كمان…", 320, 620, 40, ORANGE, 800), at(u, .2, .3)) + phone(120, 640, .7, 1, t * 3);
}, { tr: "out" });
// 19 · the myth: night mode (a yellow screen) fixes it — crossed out
shot(19, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .4, .8); return paper() + G("translate(320 380)", '<rect x="-80" y="-170" width="160" height="340" rx="22" fill="' + INK + '"/><rect x="-70" y="-150" width="140" height="300" rx="6" fill="' + (k > .5 ? "#ead6a8" : SCREEN) + '"/>' + R(-50, -110, 100, 60, "#d9c08a", 0, 6) + R(-50, -30, 100, 60, "#e3cd96", 0, 6) + R(-50, 50, 100, 60, "#d9c08a", 0, 6)) +
    G("", '<path d="M520 160 a28 28 0 1 0 20 38 a22 22 0 1 1 -20 -38 Z" fill="#f2e6b8" stroke="' + INK + '" stroke-width="2"/>', at(u, .2, .3)) + tag("الوضع الليلي", 320, 640, at(u, .8, .3), 30, BLUE) + cross(320, 380, 2.6, at(u, d - 1.4, .6));
});
// 20 · it cuts some blue, but the light still reaches your eye and the videos still wake your brain
shot(20, push(370, 390, 1.05, 1.0), function (u, d, t) {
  return paper() + headCut(t) + beam(640, 350, EYE[0] + 20, EYE[1], 140, 1, "#e8d69a") + phone(610, 370, .9, 1, t, "night") + rays(590, 360, EYE[0] + 20, EYE[1], t, 1, ORANGE) +
    pulseAlong("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1] + " L" + SCN[0] + " " + SCN[1], t, ORANGE, 2, at(u, 1.2, .4), .8) + label(EYE[0] + 40, EYE[1] - 30, 390, 200, "النور لسه داخل", ORANGE, at(u, 1.6, .5), 22);
});
// 21 · the fix: put it down half an hour before sleep, away from the bed
shot(21, push(320, 420, 0.96, 1.02), function (u, d, t) {
  var k = at(u, .4, 1.2), s = paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '" opacity=".14"/>') + windowNight(70, 120, 150, 150) + bedSide(20, 560, t, { calm: true, eyesShut: true });
  s += R(520, 420, 100, 120, WOODC, 2.2) + R(512, 410, 116, 14, WOODD, 2) + phone(lerp(170, 570, k), lerp(380, 370, k), .45, 1 - k, t);
  s += numBox("30", 440, 200, at(u, 1.8, .3), 44) + G("", T("دقيقة قبل النوم", 440, 268, 22, INK, 700), at(u, 2, .3));
  return s + check(570, 320, 1.2, at(u, 3.4, .5), OLIVE);
});
// 22 · «يعني من الآخر»: the whole chain, labelled
shot(22, push(360, 390, 0.94, 1.0), function (u, d, t) {
  return paper() + headCut(t, { clockSun: true }) + beam(640, 350, EYE[0] + 20, EYE[1], 140, 1, GLOW) + phone(610, 370, .9, 1, t) +
    pulseAlong("M" + EYE[0] + " " + EYE[1] + " C450 400 420 430 " + CHIASM[0] + " " + CHIASM[1] + " L" + SCN[0] + " " + SCN[1], t, ORANGE, 3, 1, .8) + cross(PINEAL[0], PINEAL[1], .8, 1) +
    label(600, 300, 520, 190, "نور الشاشة", BLUE, at(u, .3, .4), 22) + label(SCN[0], SCN[1] - 28, 430, 120, "ساعة المخ", ORANGE, at(u, 1.2, .4), 22) + label(PINEAL[0], PINEAL[1], 330, 660, "ميلاتونين متأخر", OLIVE, at(u, 2.4, .4), 22);
}, { tr: "out" });
// 23 · the odd fact: melatonin isn't a sleep hormone, it's a darkness hormone
shot(23, push(320, 400, 1.06, 0.98), function (u, d, t) {
  return paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '"/>', .85 * at(u, .2, .8)) + G("translate(320 300)", '<path d="M40 -100 a110 110 0 1 0 70 150 a86 86 0 1 1 -70 -150 Z" fill="#f2e6b8" stroke="' + INK + '" stroke-width="2.4"/>') +
    melDots(320, 520, t, 16, 120, 1) + tag("هرمون ضلمة", 320, 690, at(u, 1.4, .3), 34, BLUE) + G("", T("هرمون نوم", 320, 600, 26, "#d8ccae", 700) + '<path d="M240 592 h160" stroke="' + ORANGE + '" stroke-width="5"/>', at(u, .6, .3));
});
// 24 · even night-active animals (rats) make it at night
shot(24, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + G("", '<rect x="-2000" y="-2000" width="4640" height="4800" fill="' + NIGHT + '" opacity=".75"/>') + G("translate(520 140)", '<path d="M14 -30 a36 36 0 1 0 24 48 a28 28 0 1 1 -24 -48 Z" fill="#f2e6b8"/>');
  var rx = 260 + 20 * Math.sin(t * 1.4), ry = 500;   // a rat in profile, awake, sniffing
  s += '<path d="M' + (rx - 120) + ' ' + (ry + 30) + ' C' + (rx - 200) + ' ' + (ry + 40) + ' ' + (rx - 220) + ' ' + (ry - 10) + ' ' + (rx - 260) + ' ' + (ry + 10) + '" stroke="#c9a59a" stroke-width="6" fill="none" stroke-linecap="round"/>';
  s += P("M" + (rx - 130) + " " + (ry + 30) + " C" + (rx - 140) + " " + (ry - 60) + " " + (rx + 10) + " " + (ry - 80) + " " + (rx + 70) + " " + (ry - 30) + " L" + (rx + 120) + " " + (ry + 4) + " C" + (rx + 100) + " " + (ry + 26) + " " + (rx + 40) + " " + (ry + 40) + " " + (rx - 130) + " " + (ry + 30) + " Z", "#9a9187", 2.4);
  s += '<ellipse cx="' + (rx + 30) + '" cy="' + (ry - 54) + '" rx="22" ry="26" fill="#c9a59a" stroke="' + INK + '" stroke-width="2"/>' + C(rx + 70, ry - 18, 5, INK, 0) + C(rx + 120, ry + 4, 5, "#c9a59a", 1.4);
  [[-60, 34], [40, 36]].forEach(function (p) { s += '<path d="M' + (rx + p[0]) + ' ' + (ry + p[1]) + ' v14" stroke="#c9a59a" stroke-width="6" stroke-linecap="round"/>'; });
  s += '<path d="M' + (rx - 300) + ' ' + (ry + 52) + ' H' + (rx + 300) + '" stroke="' + INK + '" stroke-width="2.4"/>';
  return s + G("", '<rect x="500" y="300" width="104" height="214" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + gauge(552, 318, lerp(.2, .85, at(u, 1.2, 1.4)), t), at(u, .8, .4)) + label(rx + 10, ry - 40, 160, 300, "فار صاحي", "#f4ecdb", at(u, .4, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: lying in bed at night, the phone over the face. line 1: the wall clock runs to 2:00. line 2: morning, the alarm, a flat battery
  var l1 = LN[1], k = clamp((t - l1.start) / Math.max(1, l1.end - l1.start)), day = li >= 2;
  var s = '<rect x="0" y="0" width="608" height="660" fill="' + (day ? "#efe6cf" : "#dcd6c6") + '"/>' + windowNight(40, 90, 150, 150, day);
  s += wallClock(470, 170, 70, li === 0 ? 23 : li === 1 ? 23 + ease(k) * 3 : 7, li === 0 ? 50 + (t * 4) % 10 : li === 1 ? (ease(k) * 190) % 60 : 30);
  s += G("translate(0 10)", bedSide(40, 500, t, { phone: day ? 0 : 1, eyesShut: false }));
  if (day) { var u = t - LN[2].start; s += G("translate(300 300)", R(-44, -22, 80, 44, "#f4ecdb", 3, 4) + R(36, -10, 10, 20, INK, 0) + R(-38, -16, 14, 32, ORANGE, 0), ease(u / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(0 0)", phone(90, 108, .9, 1, t)) + '<path d="M118 40 a14 14 0 1 0 10 20 a11 11 0 1 1 -10 -20 Z" fill="#f2e6b8" stroke="' + INK + '" stroke-width="1.6"/>';
};
SCENE.outro = function (svg, u, t) {
  return G("translate(40 -150) scale(.62)", headCut(t, { clockSun: true }) + beam(640, 350, EYE[0] + 20, EYE[1], 140, 1, GLOW) + phone(610, 370, .9, 1, t)) +
    callout("1", 450, 70, ease(u / .3)) + callout("2", 360, 130, ease(u / .3 - .5)) + callout("3", 278, 95, ease(u / .3 - 1)) + callout("4", 190, 118, ease(u / .3 - 1.5));
};
