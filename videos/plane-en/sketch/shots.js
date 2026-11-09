window.EN_ED = true;
// ── «الطيارة بتطير إزاي؟» / «How Planes Fly» — one drawing file for both editions. plane-en/sketch/shots.js is this
// file with `window.EN_ED = true;` on top (made by plane-en/sketch/make.sh); only the label text changes.
// Shapes: a twin-engine narrow-body airliner from the side; the wing section is the NACA 4412 profile (4% camber at 40%,
// 12% thick), drawn from its published formula. Quick mode, see refs/SOURCES.md.
var EN = !!window.EN_ED;
function TX(ar, en) { return EN ? en : ar; }
var BODY = "#f4f1ea", BODY_D = "#d9d4c8", SKYB = "#cfe0e8", CLOUD = "#fbf8f0", WINGC = "#c9c4b4", TARMAC = "#6f6a62";

// ── the NACA 4412 section, chord c, leading edge at (x,y), tilted nose-up by aoa degrees; flap 0..1 extends a flap
function foilPts(n) { var m = .04, p = .4, th = .12, up = [], lo = []; for (var i = 0; i <= n; i++) { var b = i / n * Math.PI, x = (1 - Math.cos(b)) / 2, yt = 5 * th * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x * x * x - .1015 * x * x * x * x), yc = x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) * (1 - p)) * (1 - 2 * p + 2 * p * x - x * x); up.push([x, yc + yt]); lo.push([x, yc - yt]); } return [up, lo]; }
var FOIL = foilPts(40);
function foil(x, y, c, aoa, flap, fill) {
  var d = "M" + FOIL[0].map(function (q) { return f(q[0] * c) + " " + f(-q[1] * c); }).join(" L") + " L" + FOIL[1].slice().reverse().map(function (q) { return f(q[0] * c) + " " + f(-q[1] * c); }).join(" L") + " Z";
  var s = '<path d="' + d + '" fill="' + (fill || WINGC) + '" stroke="' + INK + '" stroke-width="2.4"/>' + hatch(d);
  if (flap) { var k = ease(flap); s += G("translate(" + f(c * (.86 + .14 * k)) + " " + f(c * .02 * k) + ") rotate(" + f(28 * k) + ")", '<path d="M0 -' + f(c * .03) + ' C' + f(c * .1) + ' -' + f(c * .035) + ' ' + f(c * .22) + ' -' + f(c * .01) + ' ' + f(c * .26) + ' 0 C' + f(c * .2) + ' ' + f(c * .01) + ' ' + f(c * .08) + ' ' + f(c * .02) + ' 0 ' + f(c * .02) + ' Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>'); }
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(-aoa) + ")", s);
}
// ── air lines round the section: dashes run with t (faster over the top), bend down behind the wing (dw 0..1)
function flow(x, y, c, t, dw, n, opts) {
  opts = opts || {}; var s = "", N = n || 9;
  for (var i = 0; i < N; i++) {
    var y0 = (i - (N - 1) / 2) * c * .16; if (Math.abs(y0) < c * .12) y0 += (y0 < 0 ? -1 : 1) * c * .1;
    var top = y0 < 0, P = Math.exp(-Math.abs(y0) / (c * .45)), Q = Math.exp(-Math.abs(y0) / (c * 1.3)), d = "";
    for (var px = -40; px <= 680; px += 10) {
      var u = (px - x) / c, bell = Math.exp(-Math.pow((u - .3) / .42, 2)), ss = clamp((u - .1) / 1.3); ss = ss * ss * (3 - 2 * ss);
      var py = y + y0 - (top ? c * .17 : -c * .02) * P * bell + dw * c * .34 * Q * ss;
      d += (px > -40 ? " L" : "M") + f(px) + " " + f(py);
    }
    var sp = top ? (opts.fast || 120) : 70;
    s += '<path d="' + d + '" stroke="' + (opts.col || BLUE) + '" stroke-width="2.4" fill="none" stroke-dasharray="18 12" stroke-dashoffset="' + f(-t * sp) + '" opacity="' + f(opts.op || .85) + '"/>';
  }
  return s;
}
// ── an airliner from the side, facing right: fuselage, cockpit, windows, wing root with the engine under it, tail
function plane(x, y, s, t, op) {
  op = op || {}; var b = "";
  b += '<path d="M-250 -10 L-300 -96 L-262 -96 L-200 -26 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>';   // fin
  b += '<path d="M-250 -6 L-312 -2 L-300 8 L-230 6 Z" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2"/>';             // tailplane
  b += '<path d="M-300 -18 C-260 -34 -150 -38 150 -38 C230 -38 270 -20 290 0 C270 22 230 34 150 34 L-200 34 C-250 34 -290 14 -300 -18 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
  b += '<path d="M-280 14 C-230 26 -150 30 150 30 C220 30 250 22 270 14" stroke="' + BLUE + '" stroke-width="5" fill="none"/>';
  for (var i = 0; i < 16; i++) b += '<rect x="' + (-200 + i * 22) + '" y="-20" width="9" height="12" rx="4" fill="#9fb7c3" stroke="' + INK + '" stroke-width="1.2"/>';
  b += '<path d="M244 -20 L268 -14 L262 -4 L238 -8 Z" fill="#2f2a24"/>';
  b += '<rect x="-60" y="-26" width="18" height="44" rx="3" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/>';
  b += '<path d="M-70 14 L60 6 L70 18 L-60 30 Z" fill="' + WINGC + '" stroke="' + INK + '" stroke-width="2.2"/>';                // wing root (far side hidden)
  b += '<rect x="-10" y="28" width="86" height="34" rx="16" fill="' + BODY_D + '" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="74" cy="45" rx="7" ry="15" fill="#3d3a34" stroke="' + INK + '" stroke-width="1.6"/>';   // engine
  if (op.gear) b += '<path d="M180 34 V64 M-40 34 V64" stroke="' + INK + '" stroke-width="5"/>' + C(180, 70, 9, "#3d3a34", 2) + C(-40, 70, 9, "#3d3a34", 2) + C(-58, 70, 9, "#3d3a34", 2);
  if (op.flap) b += '<path d="M-68 26 L-96 40 L-60 34 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2" opacity="' + f(op.flap) + '"/>';
  if (op.thrust) for (var k = 0; k < 3; k++) { var u = (t * 2 + k / 3) % 1; b += '<path d="M' + f(-20 - u * 160) + ' ' + (38 + k * 7) + ' h' + f(-30) + '" stroke="' + MUTE + '" stroke-width="3" stroke-linecap="round" opacity="' + f(op.thrust * (1 - u)) + '"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(op.rot || 0) + ")", b);
}
// a small aerobatic propeller plane (for the upside-down fact)
function stunt(x, y, s, t, inv) {
  var b = '<path d="M-110 -6 L-130 -44 L-112 -44 L-90 -8 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-120 -2 C-60 -20 60 -22 96 -8 C104 0 104 8 96 14 C60 22 -60 20 -120 6 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M10 -16 C24 -34 50 -34 60 -16" fill="#9fb7c3" stroke="' + INK + '" stroke-width="2"/>' + C(102, 3, 6, INK, 0);
  var pr = Math.sin(t * 40); b += '<ellipse cx="106" cy="3" rx="4" ry="' + f(34 * Math.abs(pr) + 4) + '" fill="' + MUTE + '" opacity=".5"/>';
  b += '<path d="M-30 2 L40 0 L44 8 L-26 10 Z" fill="' + WINGC + '" stroke="' + INK + '" stroke-width="2"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") scale(1 " + (inv ? -1 : 1) + ")", b);
}
function cloud(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", '<path d="M-60 20 C-80 20 -84 -6 -60 -8 C-58 -30 -26 -36 -14 -18 C-4 -40 34 -38 38 -12 C62 -16 72 18 50 20 Z" fill="' + CLOUD + '" stroke="' + INK + '" stroke-width="2"/>'); }
function clouds(t, y0) { var s = ""; for (var k = 0; k < 6; k++) { var x = ((hash(k) * 900 - t * (30 + hash(k + 2) * 20)) % 900 + 900) % 900 - 130; s += cloud(x, y0 + hash(k + 5) * 120, .9 + hash(k + 7) * .8); } return s; }
// a flat hand (a mitten) seen from the side, tilted by a degrees
function hand(x, y, s, a) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ") rotate(" + f(-a) + ")", '<path d="M-120 -8 L-20 -12 C10 -14 40 -16 70 -12 C96 -8 100 6 74 10 C40 14 10 14 -20 12 L-120 12 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -12 C-16 -24 4 -26 14 -14" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'); }
function speedo(x, y, r, v, max, k) { var a = Math.PI * (1 - clamp(v * ease(k) / max)); var s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + '" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i <= 6; i++) { var b = Math.PI * (1 - i / 6); s += '<path d="M' + f(x + Math.cos(b) * r * .8) + ' ' + f(y - Math.sin(b) * r * .8) + ' L' + f(x + Math.cos(b) * r * .95) + ' ' + f(y - Math.sin(b) * r * .95) + '" stroke="' + INK + '" stroke-width="3"/>'; } return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .8) + ' ' + f(y - Math.sin(a) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="6" stroke-linecap="round"/>' + C(x, y, 9, INK, 0); }
function sky() { return R(-40, -40, 720, 860, SKYB, 0); }

// ── shots (same line numbers in both editions)
// 4 · one small rule, remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(150, 170, 340, 420, "#f4ecdb", 2.4, 8) + T(TX("قاعدة", "THE RULE"), 320, 240, 34, OLIVE, 800) + arrow(320, 330, 320, 470 + 8 * Math.sin(t * 3), ORANGE, 8) + arrow(320, 530, 320, 380 - 8 * Math.sin(t * 3), BLUE, 8); });
// 5 · push something down and it pushes you up just as hard
shot(5, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1), sq = 10 * k + 4 * Math.sin(t * 4);
  return paper() + R(120, 600, 400, 24, BEIGE, 2.4) + C(320, 560 - 0 + sq * .3, 40 - sq * .2, ORANGE, 2.4) + hand(330, 500 + sq * .2, 1, 0) + arrow(300, 380, 300, 470, ORANGE, 7, k) + arrow(420, 470, 420, 380 - 30 * k, BLUE, 7, at(u, .9, .6)) + label(300, 420, 160, 330, TX("زقّة لتحت", "push down"), ORANGE, at(u, .6, .5), 22) + label(420, 400, 470, 290, TX("رد لفوق", "push back up"), BLUE, at(u, 1.4, .5), 22);
});
// 6 · what does a plane push down? air
shot(6, push(320, 400, 1.0, 1.08), function (u, d, t) { return paper() + sky() + flow(150, 400, 340, t, 0, 9, { op: .5 }) + foil(150, 400, 340, 6, 0) + T("؟", 320, 230, 110, ORANGE, 800) + G("", T(TX("الهوا", "AIR"), 320, 680, 40, BLUE, 800), at(u, d * .7, .4)); });
// 7 · the wing isn't flat: curved on top, front tilted up a little
shot(7, push(300, 400, 1.12, 1.0), function (u, d, t) {
  var k = at(u, 1.2, 1.2);
  return paper() + foil(130, 410, 380, 7 * k + 1.2 * Math.sin(t * 1.8), 0) + '<path d="M90 ' + f(410 + 4 * Math.sin(t)) + ' H560" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 6" opacity=".6"/>' +
    label(260, 362, 340, 220, TX("مقوّس", "curved top"), OLIVE, at(u, .4, .5), 24) + draw("M180 410 A60 60 0 0 0 186 380", k, ORANGE, 3) + T("7°", 240, 386, 26, ORANGE, 800) + label(140, 398, 200, 560, TX("المقدمة مرفوعة", "front tilted up"), ORANGE, at(u, 1.8, .5), 22);
}, { tr: "in" });
// 8 · the air follows the curve and is bent down behind the wing
shot(8, push(330, 420, 1.0, .94), function (u, d, t) { var k = at(u, .3, 2); return paper() + sky() + flow(120, 380, 300, t, k, 11) + foil(120, 380, 300, 7, 0) + arrow(520, 470, 560, 470 + 120 * k, ORANGE, 6, k) + label(540, 540, 420, 650, TX("لتحت", "bent down"), ORANGE, at(u, 1.6, .5), 26); });
// 9 · the wings shove tons of air down every second, so the air shoves them up
shot(9, push(320, 420, 1.0, 1.05), function (u, d, t) { var k = at(u, 1.2, .8); return paper() + sky() + flow(120, 420, 300, t, 1, 11) + foil(120, 420, 300, 7, 0) + arrow(500, 560, 520, 720, ORANGE, 9, at(u, .3, .6)) + arrow(250, 360, 250, 360 - 200 * k - 6 * Math.sin(t * 3), OLIVE, 12, k) + G("", T(TX("رفع", "LIFT"), 250, 120, 36, OLIVE, 800), k); });
// 10 · like your hand out of a car window, tilted: you feel it lift
shot(10, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var a = 14 * at(u, .6, 1), car = P("M-60 820 V560 C-60 470 20 420 120 420 H330 C380 420 400 470 420 520 V820 Z", "#b98a5e", 3) + P("M0 600 V500 C0 470 40 452 110 452 H320 C350 452 366 480 376 510 V600 Z", "#3d3a34", 2.4) + R(-60, 640, 480, 14, "#8f6a46", 0);
  var air = ""; for (var k = 0; k < 4; k++) air += arrow(720 - ((t * 220 + k * 160) % 260), 420 + k * 48, 660 - ((t * 220 + k * 160) % 260), 420 + k * 48, BLUE, 4, 1);
  return paper() + sky() + air + car + hand(400, 540 - 24 * at(u, 1.2, 1), 1.2, a) + arrow(450, 500, 450, 330 - 10 * Math.sin(t * 3), OLIVE, 9, at(u, 1.2, .6));
});
// 11 · pressure: the air over the top runs faster, so its pressure drops
shot(11, push(320, 410, 1.0, 1.06), function (u, d, t) {
  var s = paper() + sky() + flow(120, 410, 380, t, .6, 11, { fast: 190 }) + foil(120, 410, 380, 6, 0);
  for (var k = 0; k < 5; k++) s += G("", T("−", 170 + k * 70, 300 + (k % 2) * 16, 46, ORANGE, 800), at(u, 1.2 + k * .15, .3));
  return s + label(330, 320, 260, 160, TX("أسرع، ضغط أقل", "fast air, low pressure"), ORANGE, at(u, 2, .5), 21);
});
// 12 · the air underneath has higher pressure, so it pushes the wing up
shot(12, push(320, 430, 1.06, 1.0), function (u, d, t) {
  var s = paper() + sky() + flow(120, 410, 380, t, .6, 11, { fast: 190 }) + foil(120, 410, 380, 6, 0);
  for (var k = 0; k < 5; k++) s += T("−", 170 + k * 70, 300 + (k % 2) * 16, 46, ORANGE, 800) + G("", T("+", 170 + k * 70, 520 + (k % 2) * 16, 50, BLUE, 800), at(u, .3 + k * .15, .3));
  return s + arrow(310, 600, 310, 470 - 8 * Math.sin(t * 3), BLUE, 9, at(u, 1.3, .6));
});
// 13 · not two reasons: the same story seen from two sides
shot(13, push(320, 420, .98, 1.04), function (u, d, t) {
  return paper() + sky() + flow(120, 410, 380, t, 1, 11) + foil(120, 410, 380, 6, 0) + T("−", 300, 300, 46, ORANGE, 800) + T("+", 300, 530, 50, BLUE, 800) + arrow(560, 520, 580, 650, ORANGE, 7, 1) +
    G("", R(150, 60, 340, 70, "#f4ecdb", 2.4, 8) + T("=", 320, 112, 56, INK, 800), at(u, d * .45, .4));
}, { tr: "out" });
// 14 · the engines only push the plane forward
shot(14, push(320, 400, 1.0, 1.06), function (u, d, t) { return paper() + sky() + clouds(t, 560) + plane(320, 380, 1.0, t, { thrust: 1 }) + arrow(400, 448, 560, 448, ORANGE, 8, at(u, .8, .6)) + label(400, 440, 520, 560, TX("المحرك", "engine"), OLIVE, at(u, .4, .5), 24); });
// 15 · no speed, not enough air over the wing
shot(15, push(320, 420, 1.04, 1.0), function (u, d, t) { var k = clamp(u / d); return paper() + sky() + flow(120, 410, 380, t * .35, .15, 5, { op: .35, fast: 40 }) + foil(120, 410 + 120 * k, 380, 6 - 4 * k + 2 * Math.sin(t * 3), 0) + arrow(310, 300 + 120 * k, 310, 420 + 150 * k, MUTE, 7, at(u, .6, .5)) + cross(320, 680, 1.1, at(u, d * .6, .4)); });
// 16 · a big jet races down the runway to about 300 km/h (180 mph)
shot(16, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .2, d - .6), s = paper() + sky() + R(-40, 560, 720, 260, TARMAC, 2.4);
  for (var i = 0; i < 6; i++) s += R(((i * 150 - t * 400 * (.3 + k)) % 900 + 900) % 900 - 120, 640, 80, 10, "#f4f1ea", 0);
  s += plane(320, 470 - 20 * k, .8, t, { gear: 1, thrust: 1, rot: -3 * k });
  return s + G("translate(320 200)", speedo(0, 0, 110, (EN ? 180 : 300) * k, EN ? 200 : 340, 1)) + numBox(count(EN ? 180 : 300, k), 320, 270, 1, 34) + T(TX("كم/س", "mph"), 320, 330, 24, INK, 700);
});
// 17 · for takeoff and landing, flaps slide out from the back of the wing: bigger and more curved
shot(17, push(330, 420, 1.0, 1.08), function (u, d, t) { var k = at(u, .4, 1.6); return paper() + sky() + flow(110, 400, 360, t, .6 + .4 * k, 11) + foil(110, 400, 360, 6, k) + label(470, 450, 400, 640, TX("الفلابس", "flaps"), OLIVE, at(u, 1.6, .5), 26); });
// 18 · so it keeps flying while slow
shot(18, push(320, 420, 1.04, 1.0), function (u, d, t) { return paper() + sky() + clouds(t * .4, 520) + plane(320, 360, .9, t, { flap: 1, gear: 1, rot: 4 }) + R(-40, 700, 720, 120, TARMAC, 2.4); });
// 19 · the myth: the top air must meet the bottom air at the back of the wing. no.
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, d * .55), s = paper() + sky() + flow(120, 420, 400, t, .4, 9, { op: .45 }) + foil(120, 420 + 5 * Math.sin(t * 2), 400, 4, 0);
  var px = function (q, top) { var i = Math.round(q * 40), pt = FOIL[top ? 0 : 1][Math.min(40, i)]; return [120 + pt[0] * 400, 420 - pt[1] * 400 + (top ? -16 : 16)]; };
  var a = px(k, 1), b = px(k, 0); s += C(a[0], a[1], 16, ORANGE, 2.4) + C(b[0], b[1], 16, BLUE, 2.4);
  s += G("", '<path d="M520 400 l16 0" stroke="' + INK + '" stroke-width="3"/>' + T(TX("يتقابلوا؟", "meet?"), 520, 320, 30, INK, 800), at(u, d * .5, .4));
  return s + cross(520, 330, 1.2, at(u, d * .78, .4));
});
// 20 · the top air gets there first; nobody waits for anybody
shot(20, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, d * .7), s = paper() + sky() + flow(120, 420, 400, t, .4, 9, { op: .45 }) + foil(120, 420 + 5 * Math.sin(t * 2), 400, 4, 0);
  var px = function (q, top) { var i = Math.round(clamp(q) * 40), pt = FOIL[top ? 0 : 1][i]; return [120 + pt[0] * 400 + (q > 1 ? (q - 1) * 400 : 0), 420 - pt[1] * 400 + (top ? -16 : 16)]; };
  var a = px(k * 1.45, 1), b = px(k, 0); s += C(a[0], a[1], 16, ORANGE, 2.4) + C(b[0], b[1], 16, BLUE, 2.4);
  return s + G("", T(TX("الأول", "first"), a[0], a[1] - 30, 26, ORANGE, 800), at(u, d * .7, .3));
});
// 21 · recap: the wing bends air down, the air lifts the plane, the engines give it speed
shot(21, push(320, 420, .96, 1.02), function (u, d, t) {
  return paper() + sky() + flow(120, 420, 340, t, 1, 11) + foil(120, 420, 340, 6, 0) + arrow(520, 520, 545, 660, ORANGE, 8, at(u, .3, .5)) + arrow(260, 360, 260, 170, OLIVE, 10, at(u, 1.6, .5)) + arrow(60, 440, 110, 440, MUTE, 8, at(u, 3, .5)) +
    G("", T(TX("رفع", "LIFT"), 260, 140, 30, OLIVE, 800), at(u, 1.8, .3)) + G("", T(TX("سرعة", "SPEED"), 90, 500, 26, MUTE, 800), at(u, 3.2, .3));
}, { tr: "out" });
// 22 · the odd fact: stunt planes fly upside down, tilting the wing itself into the air
shot(22, push(320, 400, 1.0, 1.06), function (u, d, t) { var k = at(u, .3, 1.2); return paper() + sky() + clouds(t * .6, 560) + G("rotate(" + f(-8 * k) + " 320 300)", stunt(320, 300, 1.6, t, 1)) + G("translate(0 120)", G("", flow(170, 520, 300, t, 1, 7, { op: .6 }) + foil(170, 520, 300, 6, 0, "#d9cfb6"), at(u, 1.6, .5))); });

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = sky() + clouds(t, 470) + plane(300, 260, .9, t, { thrust: 1, rot: Math.sin(t * .9) * 1.5 });
  if (li === 0) s += G("", numBox(TX("+70 طن", "70+ tons"), 300, 120, 1, 36), ease((t - LN[0].start) / .4));
  if (li >= 1) { var k = ease((t - LN[1].start) / .4); s += G("", '<ellipse cx="300" cy="150" rx="170" ry="16" fill="none" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 8"/><path d="M300 150 V206" stroke="' + INK + '" stroke-width="4" stroke-dasharray="6 5"/>', k * .8) + cross(300, 150, .9, ease((t - LN[1].start - .6) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) { return plane(90, 112, .24, t, { thrust: 1 }); };
SCENE.outro = function (svg, u, t) {
  return flow(80, 150, 300, t, 1, 9, { op: .7 }) + foil(80, 150, 300, 6, 0) + arrow(440, 190, 460, 270, ORANGE, 5, 1) + arrow(200, 110, 200, 30, OLIVE, 6, 1) +
    callout("1", 230, 175, ease(u / .3)) + callout("2", 490, 250, ease(u / .3 - .5)) + callout("3", 300, 90, ease(u / .3 - 1)) + callout("4", 40, 150, ease(u / .3 - 1.5));
};
