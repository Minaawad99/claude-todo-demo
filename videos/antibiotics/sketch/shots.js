// ── «المضاد الحيوي من غير دكتور» — drawings, in the hand of the «طب إزاي؟» reference (sheets v17, v20).
// Shapes (refs/SOURCES.md): rod bacteria like E. coli (about 2 µm, rounded ends, flagella); the cold virus is a 20-sided
// shell about 30 nm across, so it is drawn tiny beside a bacterium; the cell wall is a peptidoglycan mesh (sugar chains
// joined by short cross-links, which penicillin stops); human cells have only a thin membrane; Fleming's 1928 plate
// is a culture dish with a mould colony and a clear ring where the staphylococci around it died.

var BAC = "#a9b277", BAC_D = "#7d8650", RES = "#d0784c", VIR = "#7f9db2", GUT = "#d99a86", GOOD = "#9fb4c4", AGAR = "#e3c98e";

// a rod bacterium centred on (x,y), length L, width W, angle ang (deg). op: {flag, burst 0..1, hole 0..1, shield}
function rod(x, y, L, W, ang, fill, t, op) {
  op = op || {}; var h = L / 2, r = W / 2, s = "", k, b = clamp(op.burst || 0), sw = Math.max(1.4, W * .07);
  var body = 'M' + f(-h + r) + ' ' + f(-r) + ' H' + f(h - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(h - r) + ' ' + f(r) + ' H' + f(-h + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(-h + r) + ' ' + f(-r) + ' Z';
  if (b > 0) {   // it bursts: the shell swells and fades, its insides spill out as dots
    for (k = 0; k < 22; k++) { var a = hash(k + x) * 6.28, dd = (r * .3 + L * .6 * b) * (.4 + hash(k + 3) * .7); s += '<circle cx="' + f(Math.cos(a) * dd) + '" cy="' + f(Math.sin(a) * dd * .7) + '" r="' + f(W * .09 + 1.5) + '" fill="' + (fill === RES ? RES : BAC_D) + '" stroke="' + INK + '" stroke-width="' + f(Math.max(.6, W * .015)) + '" opacity="' + f(1 - b * .85) + '"/>'; }
    for (k = 0; k < 6; k++) { var a2 = k / 6 * 6.28 + .3, d2 = r * (1 + 1.4 * b); s += G('translate(' + f(Math.cos(a2) * (h * .8) * (1 + b)) + ' ' + f(Math.sin(a2) * d2) + ') rotate(' + f(a2 * 57 + b * 90) + ')', '<path d="M' + f(-W * .3) + ' 0 Q0 ' + f(-W * .14) + ' ' + f(W * .3) + ' 0" fill="none" stroke="' + INK + '" stroke-width="' + f(sw) + '" stroke-linecap="round"/>', 1 - b * .6); }
    if (b < 1) s += G('scale(' + f(1 + .18 * b) + ')', P(body, fill, sw, ' opacity="' + f(1 - b) + '" stroke-dasharray="' + f(8 + 30 * b) + ' ' + f(4 + 26 * b) + '"'));
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')', s);
  }
  if (op.flag !== false) for (k = 0; k < 3; k++) {   // flagella: wavy tails off the back end that keep moving
    var d = "", y0 = (k - 1) * r * .55; for (var q = 0; q <= 14; q++) { var xx = -h + 4 - q * L * .045; d += (q ? " L" : "M") + f(xx) + " " + f(y0 + (k - 1) * q * 1.4 + Math.sin(q * .9 - t * 9 + k) * W * .12); }
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1, W * .045)) + '" fill="none" stroke-linecap="round"/>';
  }
  s += P(body, fill, sw);
  s += '<path d="' + body + '" transform="scale(' + f(1 - 7 / L) + ' ' + f(1 - 7 / W) + ')" fill="none" stroke="' + INK + '" stroke-width="' + f(sw * .45) + '" opacity=".45"/>';
  s += '<path d="M' + f(-h * .45) + ' ' + f(-r * .1) + ' q' + f(h * .15) + ' ' + f(-r * .45) + ' ' + f(h * .3) + ' 0 t' + f(h * .3) + ' 0 t' + f(h * .3) + ' 0" fill="none" stroke="' + INK + '" stroke-width="' + f(sw * .55) + '" opacity=".5"/>';
  if (op.shield) s += '<path d="' + body + '" transform="scale(' + f(1.18 + .03 * Math.sin(t * 4)) + ' ' + f(1.3 + .05 * Math.sin(t * 4)) + ')" fill="none" stroke="' + ORANGE + '" stroke-width="' + f(sw * 1.2) + '" stroke-dasharray="6 5"/>';
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')', s);
}
// the cold virus: a 20-sided shell seen as a hexagon of triangles, turning slowly
function virus(x, y, r, t, col) {
  var s = "", pts = [], k, a0 = t * .4; for (k = 0; k < 6; k++) { var a = a0 + k * Math.PI / 3; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  s += '<path d="M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z" fill="' + (col || VIR) + '" stroke="' + INK + '" stroke-width="' + f(Math.max(1.2, r * .08)) + '" stroke-linejoin="round"/>';
  var inr = []; for (k = 0; k < 3; k++) { var b = a0 + Math.PI / 6 + k * 2 * Math.PI / 3; inr.push([Math.cos(b) * r * .45, Math.sin(b) * r * .45]); }
  s += '<path d="M' + inr.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z" fill="#9cb6c6" stroke="' + INK + '" stroke-width="' + f(Math.max(.8, r * .05)) + '"/>';
  pts.forEach(function (p, i) { var q = inr[Math.floor(i / 2)]; s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + INK + '" stroke-width="' + f(Math.max(.7, r * .04)) + '"/>'; });
  return G('translate(' + f(x) + ' ' + f(y) + ')', s);
}
// a human body cell: soft blob, nucleus, a few organelles, only a thin membrane
function cell(x, y, r, t) {
  var d = "", k; for (k = 0; k <= 24; k++) { var a = k / 24 * Math.PI * 2, rr = r * (1 + .06 * Math.sin(a * 3 + t * 1.2) + .04 * Math.cos(a * 5)); d += (k ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
  var s = P(d + " Z", SKIN, 1.6) + C(x - r * .12, y - r * .05, r * .3, "#b77a5c", 1.6) + C(x - r * .16, y - r * .1, r * .1, BROWN, 0);
  [[.45, .3, .12], [.3, -.45, .09], [-.5, .4, .08], [.55, -.1, .07]].forEach(function (o) { s += '<ellipse cx="' + f(x + o[0] * r) + '" cy="' + f(y + o[1] * r) + '" rx="' + f(o[2] * r * 1.6) + '" ry="' + f(o[2] * r) + '" fill="#e7b9a0" stroke="' + INK + '" stroke-width="1"/>'; });
  return s;
}
// a capsule pill: orange half and cream half
function pill(x, y, L, ang) {
  var r = L * .22, h = L / 2;
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ')',
    '<path d="M0 ' + f(-r) + ' H' + f(-h + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 0 ' + f(-h + r) + ' ' + f(r) + ' H0 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M0 ' + f(-r) + ' H' + f(h - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(h - r) + ' ' + f(r) + ' H0 Z" fill="#efe4c8" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + f(-h + r) + ' ' + f(-r * .5) + ' H' + f(h - r) + '" stroke="#fff" stroke-width="' + f(r * .25) + '" stroke-linecap="round" opacity=".5"/>');
}
// a penicillin molecule drawn as a small square-and-pentagon ring (the β-lactam ring), orange
function pen(x, y, s, a) { return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a || 0) + ') scale(' + f(s || 1) + ')', '<path d="M-10 -8 H2 V4 H-10 Z M2 -8 L12 -12 L18 -2 L12 8 L2 4" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>'); }
// a colony of rods: states(i) → {fill, burst, shield, hide}
var COL = []; (function () { for (var i = 0; i < 26; i++) { var a = hash(i) * 6.28, rr = 40 + 230 * Math.sqrt(hash(i + 50)); COL.push([320 + Math.cos(a) * rr * 1.05, 400 + Math.sin(a) * rr * 1.2, 70 + hash(i + 7) * 30, hash(i + 11) * 360]); } })();
function colony(t, st) {
  var s = ""; COL.forEach(function (c, i) { var o = st ? st(i) : {}; if (o.hide) return; s += rod(c[0] + 6 * Math.sin(t * 1.3 + i), c[1] + 5 * Math.cos(t * 1.1 + i * 2), c[2], 30, c[3] + 8 * Math.sin(t * .7 + i), o.fill || BAC, t, o); }); return s;
}
// a person from the side, head and shoulders, in the reference's flat skin tone
function person(x, y, s, col) {
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')',
    P('M-70 120 C-70 60 -40 40 0 36 C40 40 70 60 70 120 Z', col || "#9aa58a", 2) +
    P('M-14 40 V18 H14 V40 Z', SKIN, 2) +
    P('M0 -60 C34 -60 46 -36 44 -12 C48 -8 54 0 50 6 C46 10 44 12 42 16 C40 26 30 30 16 26 C4 24 -30 24 -38 -6 C-44 -30 -30 -60 0 -60 Z', SKIN, 2) +
    P('M-34 -26 C-40 -56 -4 -72 26 -56 C10 -54 -6 -46 -14 -30 Z', "#5a4636", 1.6) + '<circle cx="26" cy="-18" r="3" fill="' + INK + '"/>');
}
function grid8(n, x0, y0, w, h, t) {   // n orange rods packed into a box (for the doubling count)
  var s = "", cols = Math.ceil(Math.sqrt(n * w / h)), rows = Math.ceil(n / cols), cw = w / cols, ch = h / rows, L = Math.min(cw * .8, 90), W = Math.min(ch * .55, L * .42, 34);
  for (var i = 0; i < n; i++) { var cx = x0 + (i % cols + .5) * cw, cy = y0 + (Math.floor(i / cols) + .5) * ch; s += rod(cx + 3 * Math.sin(t * 2 + i), cy, L, W, 8 * Math.sin(i * 1.7), RES, t, { flag: n < 9 }); }
  return s;
}

// ── shots (line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a pinned rule card with a capsule on it
shot(4, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", '<rect x="120" y="230" width="400" height="330" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 395)"/>' + C(320, 238, 10, ORANGE, 2) +
    T("القاعدة", 320, 300, 40, INK, 800), at(u, .2, .4)) + appear(at(u, .7, .4), pill(320, 410 + 6 * Math.sin(t * 2), 190, -12 + 4 * Math.sin(t * 1.4)));
});
// 5 · it kills bacteria only: the rod gets ✓, the tiny virus beside it gets ✗ (drawn to scale: about 60 times smaller)
shot(5, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + pill(320, 170, 150, 0) + arrow(260, 230, 200, 320, ORANGE, 5, at(u, .3, .4)) + arrow(380, 230, 450, 330, ORANGE, 5, at(u, 1.8, .4)) +
    appear(at(u, .2, .4), rod(170, 470, 220, 92, -8, BAC, t)) + label(150, 520, 120, 640, "بكتيريا", OLIVE, at(u, .6, .5), 26) + check(170, 340, 1.2, at(u, 1, .4), OLIVE) +
    appear(at(u, 1.6, .4), virus(480, 470, 26, t))+'<circle cx="480" cy="470" r="' + f(70 + 4 * Math.sin(t * 3)) + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="6 6"/>' +
    label(500, 495, 540, 640, "فيروس", BLUE, at(u, 2, .5), 26) + cross(480, 360, 1.1, at(u, 2.6, .5));
});
hud(6, 8, function (u, t) { return G("", '<rect x="430" y="28" width="190" height="64" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + pill(476, 60, 64, 0) + T("بكتيريا بس", 565, 69, 22, OLIVE, 800)); });
// 6 · the cold is a virus, gone by itself in about a week: a head in profile, viruses in the nose, seven days ticking off
shot(6, push(300, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + person(230, 320, 2, "#9aa58a"), k = clamp((u - .8) / (d - 1));
  for (var i = 0; i < 9; i++) if (hash(i + 3) > k) s += virus(345 + hash(i) * 60 + 4 * Math.sin(t * 2 + i), 285 + hash(i + 20) * 70 + 4 * Math.cos(t * 2 + i), 11, t + i, VIR);
  s += label(390, 300, 440, 200, "فيروس البرد", BLUE, at(u, .3, .5), 24);
  for (i = 0; i < 7; i++) { var x = 99 + i * 64, on = k * 7 > i; s += R(x, 600, 54, 54, on ? "#e2d2ad" : "#f4ecdb", 1.8) + (on ? check(x + 27, 630, .55, clamp(k * 7 - i), OLIVE) : N(String(i + 1), x + 27, 637, 24, INK)); }
  return s + T("أسبوع", 320, 700, 28, ORANGE, 800);
});
// 7 · how does it kill? a rod bacterium close up, swimming
shot(7, push(320, 400, 0.95, 1.05), function (u, d, t) {
  return paper() + rod(360 + 10 * Math.sin(t * 1.5), 400, 380, 160, -6 + 3 * Math.sin(t), BAC, t) + label(300, 330, 220, 200, "بكتيريا", OLIVE, at(u, .3, .5), 28) + T("؟", 520, 230, 120, ORANGE, 800);
});
// 8 · the wall: a mesh round the cell; penicillin sticks to it, the links break, the cell swells and bursts. thumbnail: a balloon
function mesh(x, y, w, h, gone, t) {   // peptidoglycan: sugar chains (rows of beads) with short cross-links; gone(i) → cross-link broken
  var s = "", i, j, n = 0;
  for (j = 0; j < 4; j++) { var yy = y + j * h / 3; s += '<path d="M' + f(x) + ' ' + f(yy) + ' H' + f(x + w) + '" stroke="' + BAC_D + '" stroke-width="5"/>'; for (i = 0; i < 9; i++) s += C(x + i * w / 8, yy, 7, "#c9cf98", 1.4); }
  for (j = 0; j < 3; j++) for (i = 0; i < 8; i++) { var xx = x + (i + .5) * w / 8 + (j % 2 ? 10 : -10), g = gone(n++); s += g ? '<path d="M' + f(xx) + ' ' + f(y + j * h / 3 + 9) + ' v8 M' + f(xx) + ' ' + f(y + (j + 1) * h / 3 - 9) + ' v-8" stroke="' + ORANGE + '" stroke-width="4"/>' : '<path d="M' + f(xx) + ' ' + f(y + j * h / 3 + 7) + ' V' + f(y + (j + 1) * h / 3 - 7) + '" stroke="' + INK + '" stroke-width="3"/>'; }
  return s;
}
shot(8, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var bk = clamp((u - 3.7) / .8), sw = clamp((u - 2.8) / 1), s = paper();
  s += rod(320, 560, 440 * (1 + .06 * sw), 180 * (1 + .12 * sw), 0, BAC, t, { burst: bk, flag: true });
  s += label(200, 486, 120, 420, "الجدار", OLIVE, at(u, .4, .5) * (1 - bk), 26);
  s += inset(320, 250, 140, mesh(-120, -70, 240, 140, function (n) { return hash(n * 3) < clamp((u - 1.4) / 1.4); }, t) +
    (function () { var r = ""; for (var i = 0; i < 6; i++) { var kk = clamp((u - .9 - i * .2) / .6); r += pen(lerp(-140 + i * 50, -100 + i * 40, kk), lerp(-140, -30 + (i % 3) * 45, kk), 1.3, 20 * Math.sin(t * 2 + i)); } return r; })(), at(u, .7, .4));
  s += label(270, 170, 190, 120, "البنسلين", ORANGE, at(u, 1.2, .5), 24);
  return s + iconBox(530, 710, 120, (u < 4.6 ? '<ellipse cx="0" cy="-8" rx="' + f(36 + 6 * clamp((u - 3.4) / 1)) + '" ry="' + f(44 + 6 * clamp((u - 3.4) / 1)) + '" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 36 l-6 10 h12 Z M0 46 q-6 10 4 16" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>' :
    '<path d="M-30 -30 l12 8 M30 -34 l-10 10 M-36 10 l14 -2 M34 8 l-14 -2 M0 -50 v14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-10 -6 l8 10 l10 -14 l6 18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/>'), at(u, 3.4, .3));
});
// 9 · our own cells have no wall: penicillin bounces off, nothing happens
shot(9, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper() + cell(320, 430, 190, t);
  for (var i = 0; i < 5; i++) { var a = i * 1.25 + t * .5, rr = 230 + 18 * Math.sin(t * 3 + i * 2); s += pen(320 + Math.cos(a) * rr, 430 + Math.sin(a) * rr * .9, 1.5, t * 30 + i * 40); }
  return s + label(140, 470, 230, 690, "غشا رفيع بس", OLIVE, at(u, .4, .5), 24) + label(300, 420, 260, 170, "خلية من جسمك", INK, at(u, .9, .5), 24) + check(470, 640, 1.2, at(u, 1.6, .4), OLIVE);
}, { tr: "out" });
// 10 · bacteria are not all the same: a colony of rods
shot(10, push(320, 400, 0.92, 1.02), function (u, d, t) { return paper() + appear(at(u, .1, .5), colony(t)); });
// 11 · among millions, one has a small change that lets it stand the drug (orange), magnified
var MUT = 7;
shot(11, push(320, 400, 1.02, 1.1), function (u, d, t) {
  var k = at(u, .8, .5), c = COL[MUT];
  return paper() + dim(at(u, .8, .5), colony(t, function (i) { return i === MUT ? { hide: true } : {}; })) +
    rod(c[0] + 6 * Math.sin(t * 1.3 + MUT), c[1] + 5 * Math.cos(t * 1.1 + MUT * 2), c[2], 30, c[3], k > .5 ? RES : BAC, t) +
    inset(470, 170, 110, rod(0, 0, 170, 70, -10 + 4 * Math.sin(t), RES, t), at(u, 1.6, .4)) + draw("M" + f(c[0]) + " " + f(c[1]) + " L410 255", at(u, 1.5, .3), INK, 1.4) +
    label(420, 180, 300, 90, "تغيير صغير", ORANGE, at(u, 2.3, .5), 24);
});
// 12 · the drug comes in: the weak ones burst one by one, the strong one stays, the field is empty
shot(12, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var s = paper(), i;
  for (i = 0; i < 18; i++) { var kk = clamp((u - .1 - i * .05) / 1.2); if (kk > 0 && kk < 1) s += pen(lerp(-40 + hash(i) * 80, 80 + hash(i + 9) * 480, kk), lerp(-40 + hash(i + 2) * 60, 140 + hash(i + 4) * 520, kk), 1.4, i * 30 + t * 40); }
  s += colony(t, function (i) { return i === MUT ? { fill: RES, shield: u > 2.6 } : { burst: clamp((u - .7 - hash(i + 30) * 2) / .5) }; });
  return s + tag("الملعب فاضي", 320, 700, at(u, 3.6, .3), 30, ORANGE);
});
// 13 · one divides every 20 minutes: 1, 2, 4 … and a counter that reaches 16 million in 8 hours
shot(13, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var g = Math.min(6, Math.floor(u / .55)), n = Math.pow(2, g), k = at(u, .4, d - 1.4);
  return paper() + grid8(n, 60, 270, 520, 380, t) + G("", '<rect x="90" y="80" width="460" height="160" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>', 1) +
    N(count(16000000, k), 320, 168, 58, ORANGE) + T("بكتيريا", 320, 214, 26, INK, 700) + numBox(Math.round(8 * k) + " h", 320, 700, at(u, .3, .3), 34) +
    G("translate(530 700)", '<circle r="26" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 L' + f(18 * Math.sin(t * 6)) + ' ' + f(-18 * Math.cos(t * 6)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + T("20 د", 0, 50, 16, INK, 700));
});
// 14 · like spraying weed killer on a garden: the weak weeds wilt, the tough one is left and spreads
function weed(x, y, s, col, droop) {
  var r = ""; for (var k = -2; k <= 2; k++) { var a = k * 22 + droop * (k >= 0 ? 60 : -60); r += G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + f(s) + ')', P('M0 0 C-8 -20 -6 -46 0 -60 C6 -46 8 -20 0 0 Z', col, 1.4)); } return r;
}
shot(14, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var s = paper(), i, sp = clamp((u - .3) / 1.4), sp2 = clamp((u - 2.4) / 1.6);
  s += R(-40, 560, 720, 300, "#8f6a48", 2) + hatch("M-40 560 H680 V860 H-40 Z") + '<path d="M-40 560 H680" stroke="#6d5034" stroke-width="5"/>';
  for (i = 0; i < 9; i++) { var x = 40 + i * 70, tough = i === 4, dr = tough ? 0 : clamp((u - 1 - hash(i) * .8) / .8); s += weed(x, 562, 2.2 + .2 * Math.sin(t * 2 + i) * .1, tough ? "#4f6b33" : dr > .5 ? "#b7ae86" : "#86a35a", dr * (.9 + .1 * Math.sin(t * 3 + i))); }
  for (i = 0; i < 6; i++) if (sp2 * 6 > i) s += weed(75 + i * 70 + (i > 2 ? 70 : 0), 562, 1.9 * clamp(sp2 * 6 - i), "#4f6b33", 0);
  s += G("translate(140 210) rotate(20)", R(-26, -10, 90, 60, "#5f7f97", 2, 8) + R(60, 0, 50, 14, INK, 1));
  for (i = 0; i < 26; i++) { var p = (t * .8 + hash(i)) % 1; if (sp > 0 && sp < 1) s += '<circle cx="' + f(240 + p * 330 + hash(i + 5) * 40) + '" cy="' + f(240 + p * 300 + hash(i + 8) * 60) + '" r="3" fill="' + BLUE + '" opacity="' + f(1 - p) + '"/>'; }
  s += label(320, 470, 400, 330, "اللي استحمل", ORANGE, at(u, 2.2, .5), 24);
  return s + iconBox(540, 90, 130, '<g transform="scale(.32) translate(-320 -400)">' + colony(t, function (i) { return i === MUT ? { fill: RES } : { hide: true }; }) + '</g>', at(u, 3, .3));
}, { tr: "out" });
// 15–16 · stopping early: bacteria count over the days. You feel better once it drops under the line, before it reaches zero;
// stop there and the survivors climb back, higher
function axes(k) {
  return draw("M90 640 H590", k, INK, 3) + draw("M90 640 V150", k, INK, 3) + G("", T("عدد البكتيريا", 120, 140, 22, INK, 700, "end") + T("الأيام", 590, 690, 22, INK, 700, "start"), clamp(k * 2 - 1)) +
    G("", '<path d="M90 470 H590" stroke="' + BLUE + '" stroke-width="2.4" stroke-dasharray="10 8"/>' + T("تعبان", 585, 455, 20, BLUE, 800, "start"), clamp(k * 2 - 1));
}
shot(15, push(330, 420, 0.96, 1.02), function (u, d, t) { return paper() + axes(at(u, .1, .8)) + T("؟", 360, 380, 110, ORANGE, 800); });
shot(16, push(340, 410, 1.0, 1.06), function (u, d, t) {
  var s = paper() + axes(1), k1 = clamp((u - .2) / 1.6), k2 = clamp((u - 2.3) / 1.6);
  s += draw("M90 220 C170 230 220 480 290 560", k1, OLIVE, 6) + draw("M290 560 C330 600 360 520 420 420 C470 340 520 200 590 170", k2, ORANGE, 6);
  s += G("", '<path d="M290 160 V640" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6"/>' + pill(290, 130, 60, 0) + cross(290, 130, .7, at(u, 1.9, .4)), at(u, 1.6, .3));
  return s + label(275, 535, 330, 610, "بتحس إنك أحسن", BLUE, at(u, 1.2, .5), 20) + label(560, 190, 440, 120, "أقوى", ORANGE, at(u, 3.6, .5), 26);
});
// 17 · take the dose and the days the doctor says: a blister strip, a pill pushed out each day
shot(17, push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper(), k = clamp((u - .6) / (d - 1.4)), i;
  s += R(80, 260, 480, 280, "#d6d3cb", 2.4, 16) + hatch("M80 260 H560 V540 H80 Z");
  for (i = 0; i < 10; i++) { var x = 135 + (i % 5) * 92, y = 330 + Math.floor(i / 5) * 140, done = k * 10 > i;
    s += '<ellipse cx="' + x + '" cy="' + y + '" rx="34" ry="52" fill="' + (done ? "#c2bdb2" : "#efece5") + '" stroke="' + INK + '" stroke-width="1.8"/>' + (done ? '<path d="M' + (x - 20) + ' ' + (y - 24) + ' l12 18 l10 -14 l10 20" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' : pill(x, y, 80, 90)); }
  s += label(135, 290, 210, 200, "الجرعة", OLIVE, at(u, .4, .5), 26) + measure(100, 600, 540, 600, at(u, 1.2, 1.2), "", 0) + G("", T("المدة", 320, 650, 28, OLIVE, 800), at(u, 2.2, .4));
  return s + iconBox(520, 110, 120, '<rect x="-38" y="-46" width="76" height="92" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>' + N("Rx", -10, -12, 26, ORANGE) + '<path d="M-26 6 H26 M-26 20 H22 M-26 34 H14" stroke="' + INK + '" stroke-width="2"/>', at(u, .8, .3));
}, { tr: "out" });
// 18 · it also kills the good bacteria in your gut, and the resistant ones move into the space
shot(18, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper(), i, k = clamp((u - .8) / 2), g = clamp((u - 2.8) / 1.8);
  s += C(320, 420, 270, GUT, 3); for (i = 0; i < 40; i++) { var a = i / 40 * 6.28; s += G('translate(' + f(320 + Math.cos(a) * 225) + ' ' + f(420 + Math.sin(a) * 225) + ') rotate(' + f(a * 180 / Math.PI + 90) + ')', P('M-9 0 C-9 -40 9 -40 9 0', "#e9b29c", 1.4)); }
  s += C(320, 420, 190, "#efd9bf", 2);
  for (i = 0; i < 22; i++) { var ga = i * 2.4, gr = 30 + 140 * Math.sqrt((i + .5) / 22), bx = 320 + Math.cos(ga) * gr, by = 420 + Math.sin(ga) * gr;
    var dead = hash(i + 9) < k; if (!dead) s += rod(bx + 5 * Math.sin(t * 2 + i), by, 44, 18, hash(i + 2) * 180, i % 2 ? GOOD : BAC, t, { flag: false }); else if (hash(i + 13) < g) s += rod(bx, by + 4 * Math.cos(t * 2 + i), 44, 18, hash(i + 2) * 180, RES, t, { flag: false }); }
  for (i = 0; i < 5; i++) { var kk = clamp((u - .2 - i * .25) / 1.4); if (kk > 0 && kk < 1) s += pill(lerp(140, 500, kk), 420 + (i - 2) * 50, 46, 30 * i); }
  return s + label(320, 160, 420, 70, "بطنك من جوه", INK, at(u, .2, .5), 22) + label(250, 520, 330, 720, "البكتيريا الكويسة", OLIVE, at(u, .6, .5), 22);
}, { tr: "out" });
// 19 · a resistant one hands the weapon to another: a ring of genes (plasmid) crosses a thin bridge
shot(19, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = clamp((u - 1.2) / 1.6), s = paper();
  s += draw("M250 420 C290 400 350 400 390 420", at(u, .5, .5), INK, 4);
  s += rod(140, 420, 200, 90, 0, RES, t, { flag: false }) + rod(480, 430, 200, 90, 0, k > .9 ? RES : BAC, t, { flag: false });
  var px = lerp(160, 480, k), py = 420 - 50 * Math.sin(k * Math.PI);
  s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(22 + 2 * Math.sin(t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="7"/><circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(22 + 2 * Math.sin(t * 5)) + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  return s + label(px, py - 26, 330, 230, "حتة جينات", BLUE, at(u, .9, .5), 26) + label(480, 470, 380, 620, "بقت مقاومة", ORANGE, at(u, 3, .5), 24);
}, { tr: "in" });
// 20 · the myth: «my body gets used to it» — crossed out
shot(20, push(300, 420, 1.06, 1.0), function (u, d, t) {
  return paper() + person(300, 430, 2.6, "#9aa58a") + G("", '<rect x="320" y="130" width="240" height="90" rx="40" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + T("جسمي اتعوّد", 440, 188, 28, INK, 800), at(u, .4, .4)) +
    pill(520 + 6 * Math.sin(t * 2), 360, 90, -20) + cross(440, 175, 1.4, at(u, d - .9, .45));
});
// 21 · the bacteria learn, and pass from you to the next person
shot(21, push(320, 430, 1.0, .96), function (u, d, t) {
  var s = paper() + person(170, 460, 1.7, "#9aa58a") + person(500, 460, 1.7, "#b3a78a") + check(170, 230, 1, at(u, .3, .4), OLIVE), i;
  for (i = 0; i < 6; i++) { var p = clamp((u - 1.4 - i * .25) / 1.2), x = lerp(230, 450, p), y = 360 - 120 * Math.sin(p * Math.PI); if (p > 0) s += rod(x, y, 46, 18, 20 * Math.sin(t * 3 + i), RES, t, { flag: false }); }
  return s + rod(170, 560, 60, 24, 0, RES, t, { flag: false }) + label(190, 560, 300, 680, "البكتيريا", ORANGE, at(u, .6, .5), 24);
});
// 22 · «يعني من الآخر»: three framed points, one after the other
shot(22, push(320, 400, 0.98, 1.03), function (u, d, t) {
  var s = paper(), rows = [[.3, 0], [3.0, 1], [5.0, 2]];
  rows.forEach(function (r) { var k = at(u, r[0], .4), y = 150 + r[1] * 220; s += appear(k, R(60, y - 80, 520, 180, "#f4ecdb", 2) + callout(String(r[1] + 1), 90, y - 70, k)); });
  s += appear(at(u, .3, .4), rod(220, 150, 160, 64, 0, BAC, t) + check(220, 95, .7, at(u, 1.2, .4), OLIVE) + virus(430, 150, 30, t) + cross(430, 150, .9, at(u, 1.6, .4)));
  s += appear(at(u, 3, .4), rod(200, 370, 120, 48, 10, BAC, t, { burst: clamp((u - 3.4) / .6) }) + rod(420, 370, 150, 60, -6, RES, t, { shield: true }));
  s += appear(at(u, 5, .4), pill(220, 590, 120, -15) + T("مش من دماغك", 420, 600, 28, ORANGE, 800));
  return s;
}, { tr: "out" });
// 23 · Fleming's plate (1928): a mould colony, and a clear ring where the bacteria around it died
shot(23, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var s = paper(), i, k = at(u, .4, .6);
  s += '<ellipse cx="320" cy="440" rx="270" ry="250" fill="#d9d6cc" stroke="' + INK + '" stroke-width="3"/><ellipse cx="320" cy="430" rx="250" ry="230" fill="' + AGAR + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<ellipse cx="300" cy="300" rx="132" ry="120" fill="#efe0b8"/>';
  for (i = 0; i < 80; i++) { var a = hash(i) * 6.28, rr = 30 + hash(i + 3) * 200, x = 320 + Math.cos(a) * rr, y = 430 + Math.sin(a) * rr * .92; if (Math.hypot(x - 300, (y - 300) * 1.1) < 150) continue; s += C(x, y, 5 + hash(i + 6) * 6, "#f2ead2", 1.1); }
  s += G("", '<ellipse cx="300" cy="300" rx="' + f(130 + 3 * Math.sin(t * 2)) + '" ry="' + f(118 + 3 * Math.sin(t * 2)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="8 7"/>', at(u, 1.6, .4));
  var fz = ""; for (i = 0; i < 26; i++) { var b = i / 26 * 6.28; fz += (i ? " L" : "M") + f(300 + Math.cos(b) * (62 + 8 * hash(i))) + " " + f(300 + Math.sin(b) * (56 + 8 * hash(i + 1))); }
  s += appear(k, P(fz + " Z", "#f6f3e8", 2) + C(300, 300, 34, "#7d9a6a", 1.6) + C(300, 300, 14, "#5e7a4c", 0));
  s += label(330, 280, 420, 130, "عفن البنسلين", OLIVE, at(u, .9, .5), 24) + label(470, 520, 470, 720, "بكتيريا", INK, at(u, 1.3, .5), 22);
  return s + numBox("80", 120, 120, at(u, 3, .3), 40) + G("", T("سنة وأكتر", 120, 175, 22, INK, 800), at(u, 3.2, .3));
});
// 24 · his warning: a small dose teaches the microbe to resist — the bacterium grows its shield
shot(24, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + numBox("1945", 320, 120, at(u, .2, .3), 42) + G("translate(170 420)", pill(0, 0, 150, -20) + '<rect x="0" y="-60" width="90" height="120" fill="' + PAPER + '"/>', 1) + tag("جرعة قليلة", 170, 560, at(u, .5, .3), 26, ORANGE) +
    arrow(260, 420, 340, 420, INK, 4, at(u, 1, .3)) + rod(470, 420, 210, 90, -4, at(u, 2, .4) > .5 ? RES : BAC, t, { shield: u > 2.2 }) + label(470, 470, 470, 640, "اتعلم يقاوم", ORANGE, at(u, 2.6, .5), 24);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: a pharmacy box of antibiotics and a strip. line 1: a thermometer falls, the days pass. line 2: the box crossed out
  var s = "", l1 = LN[1], k1 = clamp((t - l1.start) / Math.max(1, l1.end - l1.start));
  s += G("translate(0 " + f(4 * Math.sin(t * 1.6)) + ")", R(150, 170, 300, 380, "#f4ecdb", 2.4) + R(150, 170, 300, 80, ORANGE, 2.4) + T("مضاد حيوي", 300, 225, 34, "#fff", 800) +
    N("500 mg", 300, 300, 34, INK) + '<path d="M180 330 H420 M180 360 H380" stroke="' + INK + '" stroke-width="2"/>' + G("translate(300 450)", '<path d="M-50 -16 H-16 V-50 H16 V-16 H50 V16 H16 V50 H-16 V16 H-50 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>'));
  s += pill(500, 560 + 6 * Math.sin(t * 2.2), 120, -30 + 6 * Math.sin(t * 1.3));
  if (li >= 1) {
    var lv = lerp(200, 120, k1);
    s += iconBox(90, 120, 150, '<rect x="-12" y="-62" width="24" height="100" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cy="44" r="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="' + f(44 - lv * .5) + '" width="12" height="' + f(lv * .5) + '" fill="' + ORANGE + '"/>', ease((t - l1.start) / .4));
  }
  if (li >= 2) { var u = t - LN[2].start; s += cross(300, 360, 3.2, ease((u - .3) / .5)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return rod(96 + 8 * Math.sin(t * 1.4), 132, 80, 32, 8 * Math.sin(t), BAC, t) + pill(90, 78, 74, -20 + t * 40);
};
SCENE.outro = function (svg, u, t) {
  return pill(90, 140, 120, -20) + rod(250, 140, 120, 48, 0, BAC, t, { flag: false }) + rod(410, 140, 130, 52, 0, RES, t, { flag: false, shield: true }) + virus(540, 140, 34, t) +
    callout("1", 90, 80, ease(u / .3)) + callout("2", 250, 90, ease(u / .3 - .5)) + callout("3", 410, 90, ease(u / .3 - 1)) + callout("4", 540, 90, ease(u / .3 - 1.5));
};
