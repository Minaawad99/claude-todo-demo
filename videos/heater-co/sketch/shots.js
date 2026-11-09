// ── «السخان والحمام المقفول» — drawings from the standard instantaneous gas water heater (a white enamel box, sight
// window, two knobs, a draft hood and flue on top, gas / cold / hot pipes underneath; inside: a burner bar, a finned copper
// heat exchanger and its coil) and a bathroom cut from the side, in the «اسكتش» hand. Sources in refs/SOURCES.md.
var ENAMEL = "#f4f1ea", ENAMEL_D = "#d9d4c8", TILE = "#dfe5e2", TILE_L = "#c7d0cc", COPPER = "#b8763e", GASY = "#c9a227",
    STEAM = "#ffffff", BLOOD = "#b8392a", BLOOD_L = "#d9654b", CHERRY = "#e8493a", O2C = BLUE, CC = "#3d3a34", HC = "#f4f1ea", VEIN = "#e8b4a0";

function mixc(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }; var o = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), k)); o += (v < 16 ? "0" : "") + v.toString(16); } return o; }

// a flame that flickers; yel 0 = blue (enough air), 1 = yellow-orange (short of oxygen)
function flame(x, y, h, t, yel, seed) {
  seed = seed || 0; var w = h * .42, fl = 1 + .1 * Math.sin(t * 13 + seed * 2.1) + .06 * Math.sin(t * 21 + seed), hh = h * fl * (1 + .25 * yel), sway = 3 * Math.sin(t * 9 + seed);
  var out = mixc("#5b8fd0", "#e98b2e", yel), inn = mixc("#cfe3ff", "#ffd24a", yel);
  var d = function (W, H) { return "M" + f(x - W) + " " + f(y) + " C" + f(x - W) + " " + f(y - H * .45) + " " + f(x + sway - W * .3) + " " + f(y - H * .7) + " " + f(x + sway) + " " + f(y - H) + " C" + f(x + sway + W * .3) + " " + f(y - H * .7) + " " + f(x + W) + " " + f(y - H * .45) + " " + f(x + W) + " " + f(y) + " Z"; };
  return '<path d="' + d(w, hh) + '" fill="' + out + '" stroke="' + INK + '" stroke-width="1.6"/><path d="' + d(w * .5, hh * .55) + '" fill="' + inn + '"/>';
}

// molecules: O blue, C dark, H white. CO gets a dashed orange ring so the eye finds it.
function atom(x, y, r, c) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
function mol(x, y, type, s, rot) {
  s = s || 1; var r = 9 * s, inner = "";
  if (type === "O2") inner = atom(-r * .8, 0, r, O2C) + atom(r * .8, 0, r, O2C);
  if (type === "CO") inner = '<circle r="' + f(r * 2.3) + '" fill="none" stroke="' + ORANGE + '" stroke-width="' + f(1.6 * s) + '" stroke-dasharray="' + f(4 * s) + ' ' + f(3 * s) + '"/>' + atom(-r * .8, 0, r * 1.05, CC) + atom(r * .8, 0, r, O2C);
  if (type === "CO2") inner = atom(-r * 1.5, 0, r, O2C) + atom(r * 1.5, 0, r, O2C) + atom(0, 0, r * 1.05, CC);
  if (type === "H2O") inner = atom(-r * .9, r * .7, r * .6, HC) + atom(r * .9, r * .7, r * .6, HC) + atom(0, 0, r, O2C);
  if (type === "CH4") inner = [0, 1, 2, 3].map(function (k) { var a = k * 1.571 + .785; return atom(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1, r * .55, HC); }).join("") + atom(0, 0, r, CC);
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ")", inner);
}
// a cloud of molecules drifting inside a box; n of them, kind chooses the type
function cloud(x, y, w, h, n, type, t, s, seed) {
  var out = ""; seed = seed || 0;
  for (var k = 0; k < n; k++) { var i = k + seed * 50, px = x + ((hash(i) * w + t * (6 + hash(i + 3) * 10)) % w), py = y + hash(i + 7) * h + 6 * Math.sin(t * 1.3 + i); out += mol(px, py, type, s || .7, hash(i + 9) * 180 + t * 20); }
  return out;
}

// ── the heater seen from the front. op: yel (flame colour), cut (show the inside), pipe (flue length up), on
function heater(x, y, w, t, op) {
  op = op || {}; var h = w * 1.7, s = "";
  if (op.pipe) s += R(x - w * .14, y - op.pipe, w * .28, op.pipe, "#cfcac0", 2);
  s += P("M" + f(x - w * .3) + " " + f(y) + " L" + f(x - w * .14) + " " + f(y - w * .14) + " L" + f(x + w * .14) + " " + f(y - w * .14) + " L" + f(x + w * .3) + " " + f(y) + " Z", "#cfcac0", 2);   // draft hood
  ["M", GASY, ORANGE, BLUE].forEach(function (c, i) { if (i) s += R(x - w * .32 + (i - 1) * w * .32 - 5, y + h, 10, w * .45, c, 1.6); });   // gas / hot / cold pipes under it
  s += R(x - w / 2, y, w, h, ENAMEL, 2.6, 10);
  if (op.cut) {
    s += R(x - w * .42, y + h * .06, w * .84, h * .8, "#e9e4d8", 1.6, 4);
    s += R(x - w * .36, y + h * .14, w * .72, h * .38, "#d9a77a", 2, 3);   // finned heat exchanger
    for (var k = 0; k < 14; k++) s += '<path d="M' + f(x - w * .33 + k * w * .049) + ' ' + f(y + h * .15) + ' v' + f(h * .36) + '" stroke="' + INK + '" stroke-width="1" opacity=".5"/>';
    var coil = "M" + f(x - w * .4) + " " + f(y + h * .2); for (k = 0; k < 4; k++) coil += " H" + f(x + (k % 2 ? -w * .34 : w * .34)) + " v" + f(h * .09);
    s += '<path d="' + coil + '" stroke="' + COPPER + '" stroke-width="' + f(w * .045) + '" fill="none" stroke-linejoin="round"/><path d="' + coil + '" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".4"/>';
    s += R(x - w * .38, y + h * .74, w * .76, h * .06, "#8f8576", 1.6, 2);   // burner bar
    for (k = 0; k < 7; k++) s += flame(x - w * .32 + k * w * .107, y + h * .74, w * .16 * (op.on == null ? 1 : op.on), t, op.yel || 0, k);
  } else {
    s += R(x - w * .3, y + h * .1, w * .6, h * .12, ENAMEL_D, 1.4, 4);   // the badge
    s += R(x - w * .16, y + h * .56, w * .32, h * .18, "#2f2a24", 2, 6);   // sight window
    s += '<g clip-path="none">' + flame(x, y + h * .72, w * .16 * (op.on == null ? 1 : op.on), t, op.yel || 0, 1) + '</g>';
    s += C(x - w * .2, y + h * .87, w * .085, "#e6e1d4", 1.8) + C(x + w * .2, y + h * .87, w * .085, "#e6e1d4", 1.8);
    s += '<path d="M' + f(x - w * .2) + ' ' + f(y + h * .87) + ' l0 ' + f(-w * .07) + ' M' + f(x + w * .2) + ' ' + f(y + h * .87) + ' l' + f(w * .05) + ' ' + f(-w * .05) + '" stroke="' + INK + '" stroke-width="2"/>';
  }
  return s;
}

// a person seen from the side, plain shapes, no face. slump 0..1 tips them over away from the door; sway for dizziness
function person(x, y, s, slump, sway, t) {
  var sk = ease(slump || 0), a = 62 * sk + (sway || 0) * 5 * Math.sin((t || 0) * 2.4); s = s * (1 - .3 * sk);
  var body = '<path d="M-14 0 L-10 -78 L10 -78 L14 0 Z" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M-20 -78 C-24 -120 -22 -150 0 -158 C22 -150 24 -120 20 -78 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M16 -146 C30 -120 30 -100 22 -82" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M16 -146 C30 -120 30 -100 22 -82" stroke="' + SKIN + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<rect x="-8" y="-172" width="16" height="16" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="-190" r="21" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(a) + ")", body);
}

// ── the bathroom cut from the side: tiled back wall, shower on the left, heater on the wall, door on the right.
// op: o2 0..1 (blue O2 in the air), co 0..1 (CO in the air), yel, door 0..1 (open), steam, slump, sway, nohead (hide heater), out (heater moved outside)
function bath(t, op) {
  op = op || {}; var s = "", X0 = 40, X1 = 600, Y0 = 110, Y1 = 640;
  s += R(X0, Y0, X1 - X0, Y1 - Y0, TILE, 0);
  for (var gx = X0; gx < X1; gx += 40) s += '<path d="M' + gx + ' ' + Y0 + ' V' + Y1 + '" stroke="' + TILE_L + '" stroke-width="1.2"/>';
  for (var gy = Y0; gy < Y1; gy += 40) s += '<path d="M' + X0 + ' ' + gy + ' H' + X1 + '" stroke="' + TILE_L + '" stroke-width="1.2"/>';
  s += R(X0 - 20, Y0 - 34, X1 - X0 + 40, 34, BEIGE, 2.4) + hatch("M" + (X0 - 20) + " " + (Y0 - 34) + " h" + (X1 - X0 + 40) + " v34 h-" + (X1 - X0 + 40) + " Z");   // ceiling slab
  s += R(X0 - 20, Y1, X1 - X0 + 40, 40, BEIGE, 2.4) + hatch("M" + (X0 - 20) + " " + Y1 + " h" + (X1 - X0 + 40) + " v40 h-" + (X1 - X0 + 40) + " Z");          // floor slab
  // small high window, shut
  s += R(470, 150, 80, 56, "#bcd3dc", 2.4, 3) + '<path d="M510 150 V206" stroke="' + INK + '" stroke-width="2"/>';
  // the door on the right: a panel; when it opens it narrows and shows the light of the hall behind it
  var dk = clamp(op.door || 0);
  s += R(452, 330, 110, 310, "#fff4d6", 2.4);
  s += P("M452 330 L" + f(452 + 110 * (1 - .78 * dk)) + " " + f(330 - 20 * dk) + " L" + f(452 + 110 * (1 - .78 * dk)) + " " + f(640 + 14 * dk) + " L452 640 Z", "#a9784d", 2.4) + C(452 + 110 * (1 - .78 * dk) - 14, 490, 5, INK, 0);
  if (dk > 0) for (var k = 0; k < 3; k++) s += arrow(600 - k * 10, 400 + k * 70, 600 - 120 * dk - k * 10, 400 + k * 70, BLUE, 4, dk);
  // shower: tray, pipe, head, water
  s += R(80, 618, 200, 22, "#f7f3ea", 2.2, 4) + '<path d="M300 230 H240 V170 H222" stroke="' + INK + '" stroke-width="5" fill="none"/>' + R(178, 160, 44, 16, "#cfcac0", 2, 4);
  // the heater on the wall, its flue stops at the ceiling (nowhere to go)
  if (!op.out) s += heater(330, 240, 76, t, { yel: op.yel || 0, pipe: 96 });
  // the person in the shower
  s += person(205, 618, 1.25, op.slump || 0, op.sway || 0, t);
  for (k = 0; k < 9; k++) { var dx = 184 + k * 4.5, ph = (t * 2.2 + hash(k)) % 1; s += '<path d="M' + f(dx) + ' ' + f(180 + ph * 420) + ' v22" stroke="' + BLUE + '" stroke-width="2" opacity=".55"/>'; }
  // steam
  for (k = 0; k < 6 * (op.steam || 0); k++) { var u2 = (t * .25 + k / 6) % 1; s += '<path d="M' + f(100 + k * 60) + ' ' + f(560 - u2 * 380) + ' q-14 -20 0 -40 q14 -20 0 -40" stroke="' + STEAM + '" stroke-width="7" fill="none" stroke-linecap="round" opacity="' + f((1 - u2) * .8) + '"/>'; }
  // the air: O2 pairs and CO
  s += cloud(X0 + 20, Y0 + 30, X1 - X0 - 60, Y1 - Y0 - 90, Math.round(26 * (op.o2 == null ? 1 : op.o2)), "O2", t, .62, 1);
  s += cloud(X0 + 20, Y0 + 30, X1 - X0 - 60, Y1 - Y0 - 120, Math.round(22 * (op.co || 0)), "CO", t, .62, 2);
  // the cut edges
  s += '<path d="M' + X0 + ' ' + Y0 + ' V' + Y1 + ' M' + X1 + ' ' + Y0 + ' V' + Y1 + '" stroke="' + INK + '" stroke-width="3"/>';
  return s;
}

// a red blood cell seen from above: a disc with a dimple, four seats around it carrying O2 / CO
function rbc(x, y, r, seats, t, spin) {
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * .92) + '" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * .5) + '" ry="' + f(r * .44) + '" fill="' + BLOOD_L + '" stroke="' + INK + '" stroke-width="1.2" opacity=".9"/>';
  (seats || []).forEach(function (m, i) { if (!m) return; var a = i * 1.571 + .785 + (spin || 0); s += mol(x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74, m, r / 60, a * 57.3 + 90); });
  return s;
}
// a blood vessel cut along its length with cells flowing through it; co = share of seats taken by CO
function vessel(t, co, n) {
  var s = R(-40, 250, 720, 300, "#f0d2c4", 0) + '<path d="M-40 250 H680 M-40 550 H680" stroke="' + INK + '" stroke-width="3"/>' + R(-40, 226, 720, 24, VEIN, 2) + R(-40, 550, 720, 24, VEIN, 2);
  for (var k = 0; k < (n || 6); k++) { var px = ((hash(k) * 760 + t * 46) % 760) - 60, py = 300 + hash(k + 4) * 200; var seats = [0, 1, 2, 3].map(function (j) { return hash(k * 4 + j + 20) < co ? "CO" : "O2"; }); s += rbc(px, py, 46, seats, t, t * .3 + k); }
  return s;
}

// a bus seat (the analogy): someone grey sitting who won't get up
function busSeat(x, y, s, k) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", R(-40, -10, 80, 16, OLIVE, 2, 4) + R(20, -80, 16, 76, OLIVE, 2, 4) + '<path d="M-30 6 V40 M30 6 V40" stroke="' + INK + '" stroke-width="4"/>' +
    G("", '<circle cx="2" cy="-62" r="14" fill="' + GREY + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -46 H18 V-10 H-26 V-20 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="2"/>', k));
}
// a head-and-chest outline from the front with the brain and the heart
function bodyFront(t, starve) {
  var s = '<path d="M320 70 C380 70 410 110 410 170 C410 230 380 262 352 270 L352 300 C430 310 500 340 520 420 L540 760 H100 L120 420 C140 340 210 310 288 300 L288 270 C260 262 230 230 230 170 C230 110 260 70 320 70 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  var gl = .5 + .5 * Math.sin(t * 5);
  s += '<path d="M262 160 C258 120 290 96 320 98 C356 96 384 120 380 162 C378 196 350 212 320 210 C290 212 264 196 262 160 Z" fill="' + mixc("#e7a9a0", "#a99a96", starve) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var k = 0; k < 5; k++) s += '<path d="M' + (276 + k * 20) + ' ' + (118 + (k % 2) * 8) + ' q8 30 -2 70" stroke="' + INK + '" stroke-width="1.3" fill="none" opacity=".45"/>';
  s += G("translate(300 470) scale(" + f(1 + .05 * Math.sin(t * (6 - 3 * starve))) + ")", '<path d="M0 30 C-60 -10 -50 -60 -20 -60 C-6 -60 0 -48 0 -40 C0 -48 6 -60 20 -60 C50 -60 60 -10 0 30 Z" fill="' + mixc(BLOOD, "#9a7a72", starve) + '" stroke="' + INK + '" stroke-width="2"/>');
  if (starve > .3) s += '<circle cx="320" cy="155" r="' + f(70 + 6 * gl) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" opacity="' + f(starve) + '"/><circle cx="300" cy="455" r="' + f(64 + 6 * gl) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" opacity="' + f(starve) + '"/>';
  return s;
}
// an oxygen bar for the HUD, top of the panel (reference: «الأوكسجين في جسمه»)
function o2bar(v, label) { return T(label || "الأكسجين", 600, 52, 20, INK, 700, "start") + R(340, 64, 260, 18, PAPER, 1.8) + R(342, 66, 256 * clamp(v), 14, v < .45 ? ORANGE : OLIVE, 0); }
// a nose and smell lines (for the myth)
function smell(x, y, k, t) { var s = ""; for (var i = 0; i < 3; i++) s += '<path d="M' + f(x + i * 22) + ' ' + f(y) + ' c-10 -14 10 -22 0 -36 c-10 -14 10 -22 0 -36" stroke="' + OLIVE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(k * (.6 + .4 * Math.sin(t * 3 + i))) + '"/>'; return s; }
// two vials of blood: normal and CO-poisoned (cherry red)
function vial(x, y, c, lvl) { return R(x - 34, y - 220, 68, 240, "#eef1ee", 2.4, 30) + '<path d="M' + (x - 32) + ' ' + f(y + 20 - 200 * lvl) + ' H' + (x + 32) + ' V' + (y - 10) + ' a32 32 0 0 1 -64 0 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="1.6"/>' + R(x - 44, y - 236, 88, 22, ENAMEL_D, 2, 4); }
// the sponsor coupon
function coupon(x, y, k) {
  var w = 440, h = 220, s = '<path d="M' + (x - w / 2) + ' ' + (y - h / 2) + ' H' + (x + w / 2) + ' V' + (y - 24) + ' a24 24 0 0 0 0 48 V' + (y + h / 2) + ' H' + (x - w / 2) + ' V' + (y + 24) + ' a24 24 0 0 0 0 -48 Z" fill="#f7e9a6" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M' + (x + w / 2 - 120) + ' ' + (y - h / 2 + 14) + ' V' + (y + h / 2 - 14) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="8 7"/>';
  s += T("كود الخصم", x - 50, y - 50, 26, INK, 700) + G("", numBox("Awad11", x - 50, y + 20, 1, 44, true), clamp(k));
  s += G("translate(" + (x + w / 2 - 60) + " " + y + ")", '<path d="M-30 -20 H30 L24 44 H-24 Z" fill="#f2d600" stroke="' + INK + '" stroke-width="2.2"/><path d="M-14 -20 C-14 -44 14 -44 14 -20" stroke="' + INK + '" stroke-width="3" fill="none"/>' + T("نون", 0, 20, 22, INK, 800));
  return s;
}

// ── shots (line numbers from script.txt)
// 4 · a small rule: remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 150, 340, 460, "#f4ecdb", 2.4, 8) + T("قاعدة", 320, 210, 34, OLIVE, 800) + flame(320, 520, 220, t, 0) + R(250, 520, 140, 22, "#8f8576", 2, 3) + cloud(170, 260, 300, 140, 8, "O2", t, .8, 3); });
// 5 · fire needs oxygen; when it runs short the flame turns and makes another gas
shot(5, push(320, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, d * .4, 1.4); return paper() + flame(320, 560, 260, t, k) + R(240, 560, 160, 24, "#8f8576", 2, 3) + cloud(80, 160, 480, 300, Math.round(16 * (1 - .75 * k)), "O2", t, .9, 4) + cloud(160, 140, 320, 200, Math.round(7 * k), "CO", t, 1, 5) + G("translate(520 200)", T("؟", 0, 0, 90, ORANGE, 800), k); });
// 6 · the heater burns the gas with oxygen from the bathroom's own air
shot(6, push(320, 420, 1.1, 1.0), function (u, d, t) { var s = paper() + heater(320, 120, 260, t, { cut: 1 }); for (var k = 0; k < 4; k++) { var ph = (t * .6 + k / 4) % 1; s += mol(lerp(60, 230, ph), 520 + k * 22, "O2", .9, t * 30) + mol(lerp(580, 410, ph), 520 + k * 22, "O2", .9, -t * 30); } return s + label(320, 540, 470, 700, "الشعلة", ORANGE, at(u, .6, .5), 24) + label(250, 160, 120, 90, "هوا الحمام", BLUE, at(u, 1.6, .5), 24); }, { tr: "in" });
// 7 · enough air: CO2 and water vapour come out, and those are fine
shot(7, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var a = at(u, .2, .4), b = at(u, .8, .4), c = at(u, 1.6, .5);
  var bob = function (i) { return f(14 * Math.sin(t * 2.6 + i)); };
  return paper() + G("translate(-60 110) scale(1.15)", appear(a, G("translate(0 " + bob(0) + ")", mol(110, 300, "CH4", 2.8, t * 25))) + appear(a, T("+", 200, 312, 50, INK, 800)) + appear(a, G("translate(0 " + bob(1) + ")", mol(270, 270, "O2", 2.2, 12 * Math.sin(t * 2)) + mol(270, 340, "O2", 2.2, -12 * Math.sin(t * 2)))) +
    draw("M330 305 L390 305", b, INK, 4) + arrow(380, 305, 400, 305, INK, 4, b) +
    appear(c, G("translate(0 " + bob(2) + ")", mol(500, 250, "CO2", 2, 10 * Math.sin(t * 2.2)) + mol(470, 370, "H2O", 2, t * 30) + mol(560, 370, "H2O", 2, -t * 30))) + label(500, 250, 330, 140, "تاني أكسيد الكربون", OLIVE, at(u, 2, .4), 20) + check(500, 520, 1.3, at(u, d * .75, .5)));
});
// 8 · the little heater burns a bathroom's worth of air in about half an hour
shot(8, push(320, 380, .92, .98), function (u, d, t) { var k = at(u, .4, d - .6); return paper() + bath(t, { o2: 1 - .55 * k, steam: .6 }) + G("translate(560 80)", '<circle r="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 L0 -36 A36 36 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(36 * Math.sin(k * Math.PI)) + ' ' + f(-36 * Math.cos(k * Math.PI)) + ' Z" fill="' + ORANGE + '" opacity=".75"/>') + T("30 دقيقة", 560, 150, 20, INK, 700); });
// 9 · the door is shut: oxygen drops, the flame starts making carbon monoxide
shot(9, push(330, 320, 1.0, 1.3), function (u, d, t) { var k = at(u, .4, d - .8); return paper() + bath(t, { o2: .45 - .3 * k, co: k, yel: k, steam: .5 }) + label(330, 400, 470, 270, "أول أكسيد الكربون", ORANGE, at(u, d * .6, .5), 22); });
hud(8, 10, function (u, t) { var k = clamp((t - LN[8].start) / (LN[10].start - LN[8].start)); return o2bar(1 - .75 * k, "الأكسجين في الحمام"); });
// 10 · what does it do to us? the camera flies into the body
shot(10, push(205, 420, 1.3, 1.7), function (u, d, t) { return paper() + bath(t, { o2: .2, co: 1, yel: 1, steam: .4, sway: 1 }) + T("؟", 290, 320, 110, ORANGE, 800); });
// 11 · in your blood: carriers that take oxygen all over the body, haemoglobin
shot(11, push(320, 400, 1.06, 1.0), function (u, d, t) { return paper() + vessel(t, 0, 6) + label(180, 400, 330, 170, "الهيموجلوبين", OLIVE, at(u, 1.6, .5), 24) + label(380, 330, 500, 680, "أكسجين", BLUE, at(u, .6, .5), 22); }, { tr: "in" });
// 12 · CO grips them about 200 times harder than oxygen
shot(12, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.6), seats = ["CO", k > .3 ? "CO" : "O2", k > .6 ? "CO" : "O2", k > .9 ? "CO" : "O2"], s = paper() + R(-40, 0, 720, 800, "#f0d2c4", 0) + rbc(320, 400, 200, seats, t, 0);
  for (var j = 1; j < 4; j++) if (k > j * .3) { var a = j * 1.571 + .785, q = clamp((k - j * .3) / .3); s += mol(320 + Math.cos(a) * (150 + 200 * q), 400 + Math.sin(a) * (150 + 200 * q), "O2", 2.4, q * 200); }
  return s + numBox("200×", 320, 720, at(u, 1.8, .3), 44);
});
// 13 · like someone sitting in your bus seat who won't get up
shot(13, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(-40, 0, 720, 800, "#f0d2c4", 0) + rbc(260, 430, 170, ["CO", "CO", "CO", "O2"], t, Math.sin(t * .8) * .05) + iconBox(520, 160, 170, busSeat(0, 30, 1, 1), at(u, .3, .3)); });
// 14 · sponsor: noon, Saudi Arabia and the UAE, code Awad11
shot(14, push(320, 400, 1.0, 1.05), function (u, d, t) { return paper() + tag("إعلان", 110, 90, 1, 22, MUTE) + G("rotate(" + f(-3 + Math.sin(t * 1.4) * 1.5) + " 320 380)", coupon(320, 380, at(u, .3, .4))) + T("السعودية · الإمارات", 320, 580, 30, INK, 800) + appear(at(u, 2.6, .4), T("خصم لحد", 360, 660, 28, INK, 800) + N("10%", 230, 668, 52, ORANGE)); });
// 15 · back to the bathroom: the brain and the heart starve first
shot(15, push(320, 400, 1.0, .96), function (u, d, t) { return paper() + bodyFront(t, at(u, .6, 1.6)) + label(320, 155, 500, 110, "المخ", ORANGE, at(u, 1.2, .5), 24) + label(300, 455, 470, 380, "القلب", ORANGE, at(u, 1.9, .5), 24); });
hud(15, 17, function (u, t) { var k = clamp((t - LN[15].start) / (LN[17].start - LN[15].start)); return o2bar(.4 - .3 * k, "الأكسجين في الجسم"); });
// 16 · headache, dizziness, vomiting, the muscles go slack — you can't reach the door
shot(16, push(330, 400, 1.08, .95), function (u, d, t) { var k = at(u, d * .45, 1.4); return paper() + bath(t, { o2: .15, co: 1, yel: 1, slump: k, sway: 1 - k, steam: .3 }) + G("", measure(372, 606, 448, 606, at(u, d * .6, .6), ""), 1) + cross(410, 560, .8, at(u, d * .8, .4)); });
// 17 · the myth: you'll smell the gas if something's wrong. no.
shot(17, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(60, 420, 520, 30, "#cfcac0", 2.4, 6) + R(300, 400, 40, 70, GASY, 2.4, 4) + smell(240, 400, at(u, .4, .6), t) + tag("ريحة؟", 320, 600, at(u, .6, .3), 30) + cross(320, 260, 1.5, at(u, d * .7, .5)); });
// 18 · the smell is added to the unburnt gas; CO has no colour and no smell
shot(18, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var L1 = paper() + '<path d="M320 120 V700" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 6"/>';
  L1 += R(40, 470, 240, 26, "#cfcac0", 2.2, 5) + cloud(70, 250, 200, 180, 6, "CH4", t, 1.1, 6) + smell(120, 420, 1, t) + T("غاز", 160, 560, 28, INK, 800) + check(160, 640, 1, at(u, .8, .4));
  L1 += cloud(360, 250, 220, 220, 7, "CO", t, 1.1, 7) + T("أول أكسيد الكربون", 480, 560, 24, ORANGE, 800) + appear(at(u, d * .5, .4), T("لا لون ولا ريحة", 480, 610, 24, INK, 700)) + cross(480, 680, .9, at(u, d * .6, .4));
  return L1;
});
// 19 · check the flame: blue is fine, yellow or orange means oxygen is short
shot(19, push(320, 420, 1.0, 1.06), function (u, d, t) { return paper() + R(80, 520, 200, 22, "#8f8576", 2, 3) + flame(180, 520, 220, t, 0, 1) + R(360, 520, 200, 22, "#8f8576", 2, 3) + G("", flame(460, 520, 220, t, 1, 2), at(u, d * .35, .4)) + check(180, 640, 1.1, at(u, .9, .4)) + cross(460, 640, 1.1, at(u, d * .7, .4)); });
// 20 · the fix: the heater outside the bathroom, with a flue going out of the house
shot(20, push(320, 380, .92, 1.0), function (u, d, t) {
  var s = paper() + bath(t, { out: 1, steam: .4 }) + R(600, 76, 60, 604, BEIGE, 2.4) + hatch("M600 76 h60 v604 h-60 Z");
  var k = at(u, .4, .8);
  s += G("translate(" + f(lerp(0, 380, k)) + " 0)", heater(330, 240, 76, t, { pipe: 30 }));
  s += draw("M710 405 V440 H300 V230", at(u, 1.0, .8), ORANGE, 5);
  s += draw("M710 212 V96 H1000", at(u, 1.2, .8), "#cfcac0", 18) + label(760, 96, 640, 30, "مدخنة", OLIVE, at(u, 1.8, .5), 24) + label(710, 330, 640, 712, "بره الحمام", OLIVE, at(u, 1, .5), 24);
  return G("translate(-20 40) scale(.82)", s);
}, { tr: "out" });
// 21 · if you feel dizzy: open the door, get out to the air, call the ambulance
shot(21, push(380, 400, 1.0, 1.1), function (u, d, t) { var k = at(u, .3, 1); return paper() + bath(t, { o2: .2 + .6 * k, co: 1 - k, door: k, sway: 1, steam: .2 }) + iconBox(130, 200, 130, '<rect x="-24" y="-42" width="48" height="84" rx="8" fill="' + CC + '" stroke="' + INK + '" stroke-width="2"/><rect x="-18" y="-32" width="36" height="56" fill="#fff"/><path d="M-6 -4 h12 M0 -10 v12" stroke="' + ORANGE + '" stroke-width="5"/>', at(u, d * .65, .3)); });
// 22 · recap: fire without enough air makes a gas that takes oxygen's place in your blood
shot(22, push(320, 400, .96, 1.02), function (u, d, t) { return paper() + bath(t, { o2: .3, co: .8, yel: 1, steam: .3 }) + label(330, 380, 470, 260, "شعلة صفرا", ORANGE, at(u, .3, .4), 22) + inset(500, 640, 110, rbc(0, 0, 70, ["CO", "CO", "O2", "CO"], t, t * .2), at(u, 2, .3)); }, { tr: "out" });
// 23 · the odd fact: the poisoned can look flushed and rosy, as if peacefully asleep
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) { return paper() + vial(220, 560, "#7a1f1a", .8) + G("", vial(420, 560, CHERRY, .8), at(u, .8, .5)) + T("دم عادي", 220, 640, 24, INK, 700) + appear(at(u, 1, .4), T("دم فيه أول أكسيد", 420, 640, 24, ORANGE, 700)) + label(420, 450, 330, 290, "أحمر فاتح", ORANGE, at(u, 1.6, .5), 22); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var k1 = li >= 1 ? ease((t - LN[1].start) / 1.5) : 0;
  return G("translate(16 10) scale(.9)", bath(t, { steam: 1, o2: 1 - .5 * k1, sway: k1 }) + (li >= 2 ? '<circle cx="330" cy="370" r="74" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-dasharray="12 9" opacity="' + f(ease((t - LN[2].start) / .4)) + '"/>' : ""));
};
SCENE.bumper = function (u, t) { return heater(90, 72, 46, t, {}); };
SCENE.outro = function (svg, u, t) {
  return heater(90, 50, 92, t, { yel: 1 }) + arrow(160, 140, 220, 140, INK, 3, 1) + mol(290, 140, "CO", 2.4) + arrow(360, 140, 410, 140, INK, 3, 1) + rbc(490, 140, 70, ["CO", "CO", "O2", "CO"], t, 0) +
    callout("1", 40, 60, ease(u / .3)) + callout("2", 140, 220, ease(u / .3 - .5)) + callout("3", 290, 80, ease(u / .3 - 1)) + callout("4", 560, 70, ease(u / .3 - 1.5));
};
