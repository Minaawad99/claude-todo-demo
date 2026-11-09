// ── «تحلل جسم الإنسان» / How a Body Decomposes — one drawing file for both editions (decomp-en/sketch/make.sh adds
// `window.EN_ED = true;`). Calm forensic-science drawings: cells, a body always covered by a sheet, a soil cut, a skeleton.
// Nothing gory. Quick mode, see refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var CELL = "#f2d6c8", CELL_D = "#d9a186", NUC = "#b77a5c", LYS = "#e8c46a", SHEET = "#f7f3ea", SHEET_D = "#ddd6c6", PURPLE = "#8f6a8a",
    SOIL = "#a9845c", SOIL_D = "#8a6a46", SOIL_L = "#c9a97a", BONE = "#efe6d0", BACT = OLIVE, FLY = "#3d3a34";

// ── a cell with its nucleus and lysosomes (enzyme sacs); burst 0..1 opens the sacs and spills enzyme dots, crumble breaks the wall
function cell(x, y, r, t, burst, crumble) {
  burst = burst || 0; crumble = crumble || 0; var s = "", n = 40, d = "";
  for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2, rr = r * (1 + .05 * Math.sin(a * 5 + t * 1.5) - crumble * .25 * Math.max(0, Math.sin(a * 7 + 1))); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr * .85); }
  s += '<path d="' + d + ' Z" fill="' + CELL + '" stroke="' + INK + '" stroke-width="2.6"' + (crumble > .3 ? ' stroke-dasharray="' + f(30 - 20 * crumble) + ' ' + f(6 + 14 * crumble) + '"' : "") + '/>';
  s += '<ellipse cx="' + f(x - r * .1) + '" cy="' + f(y) + '" rx="' + f(r * .3) + '" ry="' + f(r * .26) + '" fill="' + NUC + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - .6 * crumble) + '"/>';
  for (var k = 0; k < 7; k++) {
    var a2 = k * .9 + 1, px = x + Math.cos(a2) * r * .62, py = y + Math.sin(a2) * r * .5;
    if (burst < .5) s += C(px, py, r * .09, LYS, 1.6) + C(px, py, r * .03, ORANGE, 0);
    else s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r * .09) + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="4 4"/>';
    for (var j = 0; j < 4 * burst; j++) { var b = j * 1.6 + k + t * .8, rr2 = r * .12 + burst * r * .25 * (1 + .3 * Math.sin(t * 2 + j)); s += C(px + Math.cos(b) * rr2, py + Math.sin(b) * rr2, r * .025 + 1.5, ORANGE, 0); }
  }
  return s;
}
// oxygen dots arriving through a small vessel on the left; flow 0..1
function o2in(x, y, t, flow) { var s = R(x - 220, y - 22, 170, 44, "#f0d2c4", 2.2, 20); for (var k = 0; k < 5; k++) { var u = (t * .7 + k / 5) % 1; s += G("", C(x - 210 + u * 210, y + (k % 2 ? -8 : 8), 8, BLUE, 1.4), flow * (1 - u * .3)); } return s; }
// ── a body lying on its back, covered with a sheet, seen from the side (head to the left). swell 0..1 bulges the belly
function sheet(x, y, s, t, swell, sink) {
  swell = swell || 0; sink = sink || 0; var b = 30 * swell + 2 * Math.sin(t * 1.4) * swell;
  var top = "M-250 0 C-250 -44 -214 -60 -180 -50 C-150 -40 -130 -40 -110 -44 C-40 -54 0 " + f(-52 - b) + " 60 " + f(-56 - b * 1.2) + " C120 " + f(-58 - b) + " 150 -40 200 -32 C240 -26 260 -18 262 0 Z";
  return G("translate(" + f(x) + " " + f(y + sink * 20) + ") scale(" + s + " " + f(s * (1 - .55 * sink)) + ")", '<path d="' + top + '" fill="' + SHEET + '" stroke="' + INK + '" stroke-width="2.6"/>' + '<path d="M-150 -38 C-120 -20 -60 -26 -20 -40 M40 -40 C80 -20 140 -26 180 -24" stroke="' + SHEET_D + '" stroke-width="3" fill="none"/>');
}
function table(x, y, w) { return R(x - w / 2, y, w, 16, "#b9b4a6", 2.2, 4) + '<path d="M' + f(x - w / 2 + 30) + ' ' + f(y + 16) + ' v80 M' + f(x + w / 2 - 30) + ' ' + f(y + 16) + ' v80" stroke="' + INK + '" stroke-width="5"/>'; }
// muscle fibres: rows of filaments; lock 0..1 pulls them together and pins them, loose relaxes them
function fibres(x, y, t, lock, loose) {
  var s = R(x - 220, y - 120, 440, 240, "#e7b7a6", 2.4, 30), sh = 30 * (lock || 0) * (1 - (loose || 0));
  for (var r = 0; r < 5; r++) { var yy = y - 90 + r * 45; s += R(x - 200, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x + 40 - sh, yy - 6, 160 + sh, 12, BROWN, 1.4, 6) + R(x - 130, yy + 10, 260, 8, "#c98a74", 1.2, 4); if (lock > .5 && !(loose > .5)) s += '<path d="M' + f(x - 40 + sh - 8) + ' ' + f(yy - 12) + ' l16 24 M' + f(x - 40 + sh + 8) + ' ' + f(yy - 12) + ' l-16 24" stroke="' + ORANGE + '" stroke-width="2.6" opacity=".8"/>'; }
  return s + '<path d="M' + f(x + 14 * Math.sin(t * 3) * (1 - (lock || 0))) + ' ' + (y - 120) + ' v240" stroke="none"/>';
}
function battery(x, y, v) { return R(x - 40, y - 70, 80, 140, PAPER, 2.4, 8) + R(x - 16, y - 82, 32, 12, INK, 0, 3) + R(x - 32, y + 62 - 124 * clamp(v), 64, 124 * clamp(v), v < .3 ? ORANGE : OLIVE, 0, 4); }
// a rod bacterium
function bact(x, y, a, s) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + (s || 1) + ")", '<rect x="-16" y="-7" width="32" height="14" rx="7" fill="' + BACT + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M16 0 q8 -6 14 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'); }
function fly(x, y, t, s) { var w = 6 * Math.abs(Math.sin(t * 40)); return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", '<ellipse cx="-6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="6" cy="' + f(-6 - w) + '" rx="8" ry="5" fill="#cfe0e8" stroke="' + INK + '" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="10" ry="6" fill="' + FLY + '"/><circle cx="10" cy="-1" r="4" fill="' + FLY + '"/>'); }
// a soil cut with grass on top, layers, stones
function soil(y, t) { var s = R(-40, y, 720, 860 - y, SOIL, 2.4); s += R(-40, y + 120, 720, 860 - y - 120, SOIL_D, 0) + '<path d="M-40 ' + (y + 120) + ' H680" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>'; for (var k = 0; k < 18; k++) s += '<path d="M' + f(k * 38 - 20) + ' ' + y + ' l6 -16 l6 16" stroke="' + OLIVE + '" stroke-width="3" fill="none"/>'; for (k = 0; k < 10; k++) s += '<ellipse cx="' + f(hash(k) * 640) + '" cy="' + f(y + 30 + hash(k + 3) * 220) + '" rx="' + f(8 + hash(k + 5) * 10) + '" ry="6" fill="' + SOIL_L + '" stroke="' + INK + '" stroke-width="1.2"/>'; return s; }
// a skeleton lying down (side), simple bones
function skeleton(x, y, s) {
  var b = '<ellipse cx="-200" cy="-10" rx="30" ry="24" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/><circle cx="-210" cy="-14" r="5" fill="' + INK + '"/>';
  b += '<path d="M-168 -6 H130" stroke="' + INK + '" stroke-width="8"/><path d="M-168 -6 H130" stroke="' + BONE + '" stroke-width="5"/>';
  for (var k = 0; k < 8; k++) b += '<path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M' + (-140 + k * 16) + ' -6 c6 -26 18 -30 24 -30" stroke="' + BONE + '" stroke-width="2.6" fill="none"/>';
  b += '<ellipse cx="120" cy="-4" rx="26" ry="18" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  ["M140 0 L250 4", "M140 6 L250 14", "M-110 0 L0 14", "M-110 4 L0 22"].forEach(function (d) { b += '<path d="' + d + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" stroke="' + BONE + '" stroke-width="6" stroke-linecap="round"/>'; });
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
function thermo(x, y, v, lab) { var h = 220 * clamp(v); return R(x - 16, y - 240, 32, 250, "#f6f1e6", 2.4, 16) + R(x - 8, y - h, 16, h, ORANGE, 0) + C(x, y + 16, 24, ORANGE, 2.4) + (lab ? T(lab, x + 70, y - h + 8, 28, INK, 800) : ""); }
function stageTag(n, txt, k) { return G("", numBox(String(n), 120, 190, k, 40, true) + T(txt, 180, 202, 34, INK, 800, "end"), clamp(k)); }
// the four-stage strip on top (HUD): which one is on
function strip(on) { var L = [TX("هضم ذاتي", "self-digestion"), TX("انتفاخ", "bloat"), TX("تحلل", "decay"), TX("عضم", "bones")], s = ""; for (var i = 0; i < 4; i++) { var x = 110 + i * 140, a = i + 1 === on; s += '<rect x="' + (x - 62) + '" y="34" width="124" height="40" rx="6" fill="' + (a ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="1.8"/>' + T((i + 1) + " · " + L[i], x, 61, 17, a ? "#fff" : INK, 700); } return s; }


// ── a standing body outline (front, medical-diagram plain, no face). Strokes don't scale, so it can be zoomed into.
var NS = ' vector-effect="non-scaling-stroke"';
function bodyOutline() {
  return '<path d="M-20 -190 L-20 -170 C-70 -165 -100 -150 -110 -120 L-150 40 C-155 60 -135 66 -128 46 L-95 -70 L-90 40 L-80 250 C-80 266 -50 266 -48 250 L-20 70 L20 70 L48 250 C50 266 80 266 80 250 L90 40 L95 -70 L128 46 C135 66 155 60 150 40 L110 -120 C100 -150 70 -165 20 -170 L20 -190 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"' + NS + '/><circle cx="0" cy="-228" r="40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"' + NS + '/>';
}
// the gut inside the belly (body units, around 0,20): the colon framing the small intestine coils
function gutLayer() {
  var s = '<path d="M-44 52 V-12 C-44 -22 -36 -26 -26 -26 H26 C36 -26 44 -22 44 -12 V52" fill="none" stroke="#c98a74" stroke-width="18" stroke-linecap="round"/><path d="M-44 52 V-12 C-44 -22 -36 -26 -26 -26 H26 C36 -26 44 -22 44 -12 V52" fill="none" stroke="' + INK + '" stroke-width="1.6"' + NS + ' opacity=".7"/>';
  s += '<path d="M-28 -8 C-10 -16 10 -2 28 -8 C34 4 10 10 -6 4 C-24 0 -34 14 -20 20 C0 26 20 14 30 22 C30 34 6 40 -12 34 C-28 30 -32 44 -16 48 C4 52 20 44 28 48" fill="none" stroke="#e0a08c" stroke-width="9" stroke-linecap="round"/><path d="M-28 -8 C-10 -16 10 -2 28 -8 C34 4 10 10 -6 4 C-24 0 -34 14 -20 20 C0 26 20 14 30 22 C30 34 6 40 -12 34 C-28 30 -32 44 -16 48 C4 52 20 44 28 48" fill="none" stroke="' + INK + '" stroke-width="1.4"' + NS + ' opacity=".6"/>';
  return s;
}
// a continuous zoom from the whole body into a point (fx,fy body units) that lands on screen at (cx,cy); Z grows 1 → zmax
function zoomBody(Z, fx, fy, cx, cy, bodyOp) { return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(Z * .9) + ") translate(" + f(-fx) + " " + f(-fy) + ")", bodyOutline(), bodyOp); }

// ── shots (same line numbers in both editions)
// 4 · one small rule: the camera goes from the whole body into the chest, the tissue, and one cell with its blood supply
shot(4, push(330, 420, 1.0, 1.0), function (u, d, t) {
  var k = ease(clamp((u - .2) / (d - .5))), Z = Math.exp(Math.log(46) * k), fx = -50, fy = -110, cx = 360, cy = 420, s = paper();
  s += zoomBody(Z, fx, fy, cx, cy, 1 - clamp((Z - 4) / 6));
  var tk = clamp((Z - 3) / 5); if (tk > 0) { var rt = 3.6 * Z * .9, sp = 8 * Z * .9; for (var i = -5; i <= 5; i++) for (var j = -5; j <= 5; j++) { var px = cx + i * sp + (j % 2 ? sp / 2 : 0), py = cy + j * sp * .86; if (px < -rt || px > 640 + rt || py < -rt || py > 800 + rt) continue; s += G("", cell(px, py, rt, t + i + j, 0, 0), tk); } }
  s += G("", o2in(cx - 150, cy, t, 1), clamp((k - .85) / .15));
  return s + tag(TX("قاعدة", "THE RULE"), 320, 140, clamp((k - .8) / .2), 34, OLIVE);
});
// 5 · a cell lives while the blood brings oxygen; cut it and the cell falls apart
shot(5, push(330, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, d * .45, d * .5); return paper() + cell(360, 420, 150, t, 0, k) + o2in(210, 420, t, 1 - at(u, d * .3, .6)) + cross(110, 300, .9, at(u, d * .35, .4)); }, { tr: "in" });
// 6 · first stage: self-digestion
shot(6, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(1, TX("الهضم الذاتي", "autolysis"), at(u, .2, .3)) + cell(320, 440, 170, t, 0, 0); });
// 7 · enzymes locked in tiny sacs; without oxygen the sacs burst
shot(7, push(330, 430, 1.0, 1.25), function (u, d, t) { return paper() + cell(320, 440, 200, t, at(u, d * .55, .8), 0) + label(320 + Math.cos(1) * 124, 440 + Math.sin(1) * 100, 470, 680, TX("أكياس إنزيمات", "enzyme sacs"), ORANGE, at(u, .6, .5), 24); });
// 8 · the enzymes spill out and digest the cell itself, like a stomach digesting food
shot(8, push(320, 420, 1.06, 1.0), function (u, d, t) { return paper() + cell(300, 450, 190, t, 1, at(u, .3, d - .5)) + iconBox(520, 150, 160, '<path d="M-30 -50 C-60 -40 -60 20 -20 40 C20 60 60 30 50 0 C40 -20 10 -10 0 -30 C-6 -44 -16 -54 -30 -50 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>', at(u, d * .5, .3)); });
// 9 · meanwhile the body cools about one degree an hour (1.5 °F)
shot(9, push(320, 420, 1.0, 1.05), function (u, d, t) { var k = at(u, .2, d - .3); return paper() + thermo(220, 600, .95 - .5 * k, EN ? count(98.6 - 6 * k, 1, 1) + "°F" : count(37 - 4 * k, 1, 1) + "°") + numBox(TX("−1° / ساعة", "−1.5°F / hr"), 430, 300, at(u, .8, .3), 34); });
// 10 · the blood settles with gravity, purple patches on the lower side
shot(10, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + table(320, 470, 560) + sheet(320, 470, 1.05, t, 0) + arrow(560, 250, 560, 380, MUTE, 6, at(u, .3, .5)) + inset(330, 620, 110, R(-120, -110, 240, 220, SKIN, 0) + R(-120, 110 - 80 * k, 240, 80 * k, PURPLE, 0, 0) + '<path d="M-120 110 H120" stroke="' + INK + '" stroke-width="3"/>', at(u, .6, .3)); });
// 11 · muscles stiffen as their energy runs out, then loosen a day or two later
shot(11, push(320, 420, 1.0, 1.04), function (u, d, t) { var lock = at(u, .3, 1.2), loose = at(u, d * .65, 1); return paper() + fibres(300, 470, t, lock, loose) + battery(540, 200, 1 - lock) + G("", T(TX("يوم أو اتنين", "1–2 days"), 300, 700, 30, OLIVE, 800), loose); });
// 12 · second stage: bloat
shot(12, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + stageTag(2, TX("الانتفاخ", "bloat"), at(u, .2, .3)) + table(320, 520, 560) + sheet(320, 520, 1.05, t, .3); });
hud(12, 18, function (u, t) { var on = t < LN[16].start ? 2 : t < LN[17].start ? 3 : 4; return strip(on); });
hud(6, 12, function (u, t) { return strip(1); });
// 13 · trillions of gut bacteria: from the whole body into the belly, the gut, and the bacteria multiplying inside
shot(13, push(320, 430, 1.0, 1.0), function (u, d, t) {
  var k = ease(clamp((u - .1) / (d * .5))), Z = Math.exp(Math.log(9) * k), s = paper();
  s += zoomBody(Z, 0, 14, 320, 430, 1);
  s += G("translate(320 430) scale(" + f(Z * .9) + ") translate(0 -14)", gutLayer(), clamp((Z - 1.5) / 2));
  var n = Math.round(46 * clamp((u - d * .45) / (d * .45)));
  for (var j = 0; j < n; j++) s += bact(140 + hash(j) * 360 + 6 * Math.sin(t * 2 + j), 260 + hash(j + 9) * 330 + 6 * Math.cos(t * 2 + j), hash(j + 4) * 180 + t * 20, .9);
  return s + G("", '<rect x="230" y="680" width="180" height="40" rx="6" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T(TX("مناعة: ✗", "immune: ✗"), 320, 708, 22, ORANGE, 800), at(u, d * .7, .3));
});
// 14 · they make gas and the body swells like a balloon in a few days
shot(14, push(320, 430, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5), s = paper() + table(320, 520, 560) + sheet(320, 520, 1.05, t, k); for (var j = 0; j < 6; j++) { var v = (t * .5 + j / 6) % 1; s += C(260 + j * 30, 470 - v * 60 * k, 6 + 6 * v, "#d8e6c8", 1.2); } return s + numBox(TX("أيام", "days"), 500, 250, at(u, d * .6, .3), 32); });
// 15 · the gases smell awful and call in flies from far away
shot(15, push(320, 430, 1.06, 1.0), function (u, d, t) { var s = paper() + table(320, 560, 560) + sheet(320, 560, 1.05, t, 1); for (var i = 0; i < 4; i++) s += '<path d="M' + (220 + i * 60) + ' 480 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" stroke="' + OLIVE + '" stroke-width="4" fill="none" opacity="' + f(.4 + .3 * Math.sin(t * 3 + i)) + '"/>'; for (var k = 0; k < 5; k++) { var q = clamp(u / d * 1.3 - k * .12); s += fly(lerp(680 + k * 40, 330 + k * 30, q) + 8 * Math.sin(t * 6 + k), lerp(120 + k * 40, 360 + (k % 2) * 30, q), t, 1.2); } return s; });
// 16 · stage three, active decay: tissue liquefies, larvae feed, most of the mass is lost (bar drops; the sheet sinks)
shot(16, push(320, 430, 1.04, 1.0), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + stageTag(3, TX("التحلل النشط", "active decay"), at(u, .2, .3)) + soil(560, t) + sheet(320, 560, 1.05, t, 0, k) + R(470, 200, 140, 26, PAPER, 2) + R(472, 202, 136 * (1 - .75 * k), 22, OLIVE, 0) + T(TX("الوزن", "mass"), 540, 260, 22, INK, 700); });
// 17 · in the end only the skeleton stays, for hundreds of years
shot(17, push(320, 460, 1.0, 1.06), function (u, d, t) { return paper() + stageTag(4, TX("الهيكل العضمي", "skeleton"), at(u, .2, .3)) + soil(380, t) + skeleton(320, 560, 1.05) + G("", numBox(TX("مئات السنين", "centuries"), 440, 250, 1, 30), at(u, d * .55, .3)); }, { tr: "out" });
// 18 · temperature first: warm speeds it up, cold slows it right down
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + G("translate(180 260)", '<circle r="54" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * .785 + t; return '<path d="M' + f(Math.cos(a) * 66) + ' ' + f(Math.sin(a) * 66) + ' l' + f(Math.cos(a) * 18) + ' ' + f(Math.sin(a) * 18) + '" stroke="' + INK + '" stroke-width="4"/>'; }).join("")) + arrow(120, 420, 260, 420, ORANGE, 9, at(u, .5, .4)) + G("translate(460 260) rotate(" + f(t * 20) + ")", [0, 1, 2].map(function (i) { return '<path d="M0 -60 V60" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round" transform="rotate(' + (i * 60) + ')"/>'; }).join("")) + arrow(420, 420, 470, 420, BLUE, 9, at(u, d * .5, .4)) + G("", T("×", 500, 432, 40, BLUE, 800), at(u, d * .6, .3)); });
// 19 · in air twice as fast as in water, eight times faster than buried in soil
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var rows = [[TX("هوا", "air"), 1, "#cfe0e8", TX("أسبوع", "1 week")], [TX("مية", "water"), 2, "#9fb7c3", TX("أسبوعين", "2 weeks")], [TX("تربة", "soil"), 8, SOIL, TX("8 أسابيع", "8 weeks")]], s = paper();
  rows.forEach(function (r, i) { var k = at(u, .3 + i * .7, .5), y = 260 + i * 150; s += R(80, y - 50, 120, 100, r[2], 2.2, 8) + T(r[0], 140, y + 10, 28, INK, 800) + R(230, y - 10, (44 * r[1] + 6 * Math.sin(t * 3 + i)) * k, 40, i ? MUTE : ORANGE, 2, 4) + G("", T(r[3], 236, y - 24, 26, INK, 800, "end"), k); });
  return s;
});
// 20 · the myth: hair and nails keep growing after death. no.
shot(20, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 250, 220, 420, SKIN, 2.6, 90) + R(180, 230, 160, 120, "#f4ecdb", 2.4, 60) + arrow(400, 300, 400, 180 - 6 * Math.sin(t * 3), ORANGE, 8, at(u, .4, .5)) + T("؟", 480, 260, 90, ORANGE, 800) + cross(420, 520, 1.3, at(u, d * .8, .4)); });
// 21 · the skin dries and shrinks back, so they look longer
shot(21, push(320, 420, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, d - .5); return paper() + R(180, 230, 160, 160 + 40 * k, "#f4ecdb", 2.4, 50) + R(150, 290 + 50 * k, 220, 420, SKIN, 2.6, 90) + measure(400, 230, 400, 290 + 50 * k, 1, "") + label(260, 300 + 50 * k, 470, 560, TX("الجلد بينكمش", "skin shrinks"), OLIVE, at(u, d * .5, .5), 24); });
// 22 · recap: cells digest themselves, bacteria bloat, insects finish, bones remain
shot(22, push(320, 420, .88, 1.06), function (u, d, t) { var s = paper(), q = d / 4.4; var bb = function (i) { return f(16 * Math.sin(t * 2.4 + i * 1.3)); };
  s += G("translate(170 " + (300 + +bb(0)) + ") scale(.8)", cell(0, 0, 160, t, 1, .4), at(u, .1, .3)) + G("translate(470 " + (320 + +bb(1)) + ") scale(.55)", sheet(0, 0, 1, t, 1), at(u, q, .3)) + G("", fly(170 + 30 * Math.sin(t * 1.7), 600 + +bb(2), t, 4), at(u, 2 * q, .3)) + G("translate(470 " + (600 + +bb(3)) + ") scale(.62)", skeleton(0, 0, 1), at(u, 3 * q, .3)); for (var i = 0; i < 4; i++) s += callout(String(i + 1), [60, 360, 60, 360][i], [150, 150, 470, 470][i], at(u, .1 + i * q, .3), 20); return s; }, { tr: "out" });
// 23 · the odd fact: a research farm in the US studies donated bodies to pin down time of death
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) { var s = paper() + R(-40, 520, 720, 300, "#c9c09a", 2.4); for (var k = 0; k < 6; k++) s += '<path d="M' + (40 + k * 110) + ' 520 V380 M' + (20 + k * 110) + ' 420 H' + (150 + k * 110) + ' M' + (20 + k * 110) + ' 460 H' + (150 + k * 110) + '" stroke="' + INK + '" stroke-width="3"/>'; for (k = 0; k < 3; k++) s += C(120 + k * 200, 300, 50, OLIVE, 2.4) + R(114 + k * 200, 340, 12, 60, WOOD_D || "#7c5434", 2); return s + G("translate(470 640) rotate(" + f(-6 + 3 * Math.sin(t * 1.5)) + ")", R(-90, -60, 180, 120, "#f7f3ea", 2.4, 4) + '<path d="M-70 -30 H70 M-70 0 H40 M-70 30 H60" stroke="' + INK + '" stroke-width="2" opacity=".5"/>' + C(60, 30, 26, "none", 4) + '<path d="M78 48 l26 26" stroke="' + INK + '" stroke-width="6"/>') + G("", numBox(TX("وقت الوفاة؟", "time of death?"), 320, 160, 1, 30), at(u, d * .55, .3)); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = '<path d="M60 300 H160 l20 -60 l30 120 l20 -60 H260" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-linejoin="round"/>';
  var k = clamp((t - LN[0].start) / 2.2); s += '<path d="M260 300 H' + f(260 + 290 * k) + '" stroke="' + INK + '" stroke-width="5"/>' + C(260 + 290 * k, 300, 9, ORANGE, 2);
  s += G("translate(" + f(300 + 14 * Math.sin(t * 2.2)) + " " + f(460 + 10 * Math.cos(t * 1.8)) + ") scale(" + f(1 + .06 * Math.sin(t * 2.6)) + ")", cell(0, 0, 110, t, li >= 1 ? ease((t - LN[1].start) / 1.2) : 0, 0), li >= 1 ? 1 : .35 + .1 * Math.sin(t * 3));
  if (li >= 2) s += G("", '<path d="M80 600 H520" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 8"/>' + [0, 1, 2, 3].map(function (i) { return callout(String(i + 1), 100 + i * 135, 600, 1, 18); }).join(""), ease((t - LN[2].start) / .5));
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 112) scale(.32)", cell(0, 0, 120, t, 0, 0)); };
SCENE.outro = function (svg, u, t) {
  return G("translate(70 140) scale(.3)", cell(0, 0, 160, t, 1, .3)) + G("translate(220 150) scale(.32)", sheet(0, 0, 1, t, 1)) + fly(370, 140, t, 1.6) + G("translate(500 150) scale(.3)", skeleton(0, 0, 1)) +
    callout("1", 70, 60, ease(u / .3)) + callout("2", 220, 60, ease(u / .3 - .5)) + callout("3", 370, 60, ease(u / .3 - 1)) + callout("4", 500, 60, ease(u / .3 - 1.5));
};
