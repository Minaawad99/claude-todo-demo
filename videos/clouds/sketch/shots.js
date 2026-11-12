// ── «السحابة وزنها كام؟ وإزاي مش بتقع؟» — drawings. Hand follows the «طب إزاي؟» reference (sheet v03 for sky and clouds,
// v16 for steam); shapes follow real references (refs/SOURCES.md): a fair-weather cumulus with a flat shaded base and
// heaped turrets, a cumulonimbus with its anvil, an African bush elephant in profile, a hair in cross-section.
var CW = "#f7f3e8", CSH = "#c6cbc8", DROP = "#8fb1c6", ELE = "#a39c8f", ELE_D = "#857e72", AIR = "#b7cad3", FIELD = "#c7c296";
function cu(l, c) { return startOf([l, c]) - LN[l].start; }   // seconds from a line's start to its caption chunk c

// a heap of round puffs with one outline and a flat base at y = cy. list: [x, y, rx, ry?] in units of s.
var CUMULUS = [[-.80, -.10, .20], [-.55, -.26, .27], [-.22, -.50, .35], [.16, -.44, .37], [.50, -.24, .28], [.78, -.09, .19], [-.3, -.12, .3], [.1, -.12, .32], [.45, -.08, .25], [-.62, -.06, .22], [-.04, -.74, .25], [.36, -.62, .2]];
var STORM = [[-.6, -.08, .24], [-.25, -.15, .32], [.2, -.15, .34], [.58, -.1, .26], [0, -.5, .42], [-.2, -.9, .37], [.2, -1.0, .39], [0, -1.4, .4], [-.15, -1.8, .38], [.2, -1.85, .36],
             [-.5, -.5, .3], [.5, -.6, .32], [-.45, -1.3, .3], [.48, -1.4, .3], [.15, -2.3, 1.25, .25], [.95, -2.32, .6, .19], [-.75, -2.3, .5, .19], [0, -2.1, .5, .3]];
function puffs(cx, cy, s, list, t, op) {
  op = op || {}; var id = "cl" + (++CLIPN), id2 = "cl" + (++CLIPN), a = "", b = "", arcs = "", sw = op.sw || 2.2, x0 = 1e9, x1 = -1e9, top = 0;
  list.forEach(function (p, i) {
    var k = 1 + (op.still ? 0 : .04 * Math.sin(t * 1.5 + i * 1.7)), x = cx + p[0] * s, y = cy + p[1] * s, rx = p[2] * s * k, ry = (p[3] || p[2]) * s * k;
    var e = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"';
    a += e + ' fill="' + INK + '" stroke="' + INK + '" stroke-width="' + (sw * 2) + '"/>'; b += e + '/>';
    var dy = (cy - y) / ry; if (Math.abs(dy) < 1) { var w = rx * Math.sqrt(1 - dy * dy); x0 = Math.min(x0, x - w); x1 = Math.max(x1, x + w); }
    top = Math.min(top, p[1] - (p[3] || p[2]));
    if (!p[3] && (i < 6 || i > 9) && i < 12 + (op.creases || 0)) { var r = rx * .66, a0 = 3.5 + .25 * (i % 3), a1 = a0 + 1.25; arcs += '<path d="M' + f(x + r * Math.cos(a0)) + ' ' + f(y + r * Math.sin(a0)) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * Math.cos(a1)) + ' ' + f(y + r * Math.sin(a1)) + '" stroke="' + INK + '" stroke-width="1.3" fill="none" opacity=".4" stroke-linecap="round"/>'; }
  });
  var H = -top * s + 30, band = (op.band == null ? .15 : op.band) * s;
  return '<clipPath id="' + id + '"><rect x="' + f(cx - 3 * s) + '" y="' + f(cy - H) + '" width="' + f(6 * s) + '" height="' + f(H) + '"/></clipPath><clipPath id="' + id2 + '">' + b + '</clipPath>' +
    '<g clip-path="url(#' + id + ')">' + a + '<g fill="' + (op.fill || CW) + '">' + b + '</g><g clip-path="url(#' + id2 + ')">' +
    '<rect x="' + f(cx - 3 * s) + '" y="' + f(cy - band) + '" width="' + f(6 * s) + '" height="' + f(band) + '" fill="' + (op.shade || CSH) + '"/><rect x="' + f(cx - 3 * s) + '" y="' + f(cy - band) + '" width="' + f(6 * s) + '" height="' + f(band) + '" fill="url(#hatch)" opacity=".8"/>' +
    (op.inner || "") + arcs + '</g></g><path d="M' + f(x0 - 1) + ' ' + f(cy) + ' L' + f(x1 + 1) + ' ' + f(cy) + '" stroke="' + INK + '" stroke-width="' + (sw + .4) + '" stroke-linecap="round"/>';
}
function cloud(cx, cy, s, t, op) { return puffs(cx, cy, s, CUMULUS, t, op); }
// a water droplet: a ball with a highlight
function drop(x, y, r, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + (col || DROP) + '" stroke="' + INK + '" stroke-width="' + (r > 12 ? 2.2 : r > 4 ? 1.4 : .8) + '"/>' + (r > 5 ? '<circle cx="' + f(x - r * .32) + '" cy="' + f(y - r * .35) + '" r="' + f(r * .24) + '" fill="#fff" opacity=".6"/>' : ""); }
// a field of droplets drifting inside a w×h box around (cx, cy); vy px/s (down positive), n drops, radius r
function dropField(cx, cy, w, h, t, vy, n, r, seed) {
  var s = ""; seed = seed || 0; for (var i = 0; i < n; i++) { var x = cx - w / 2 + hash(i + seed) * w + 5 * Math.sin(t * 1.3 + i), y = cy - h / 2 + ((hash(i + 50 + seed) * h + t * vy * (0.7 + .6 * hash(i + 9))) % h + h) % h; s += drop(x, y, r * (0.7 + .6 * hash(i + 77 + seed))); }
  return s;
}
// the ground from the side: a field with small houses and trees, to give the kilometre scale
function ground(y, t, op) {
  op = op || {}; var s = '<rect x="-600" y="' + y + '" width="1840" height="500" fill="' + (op.hot ? "#d3b98c" : FIELD) + '" stroke="' + INK + '" stroke-width="2"/><rect x="-600" y="' + y + '" width="1840" height="500" fill="url(#hatch)" opacity=".55"/>';
  [[40, 0], [118, 1], [150, 0], [262, 1], [420, 1], [470, 0], [540, 1], [590, 0], [-60, 1], [700, 0]].forEach(function (h, i) {
    if (op.bare) return; var x = h[0]; if (h[1]) s += '<path d="M' + x + ' ' + y + ' v-14" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + x + '" cy="' + (y - 19) + '" r="' + (7 + i % 3) + '" fill="#8a9460" stroke="' + INK + '" stroke-width="1.4"/>';
    else s += R(x, y - 15, 24, 15, "#e6dcc6", 1.4) + '<path d="M' + (x - 3) + ' ' + (y - 15) + ' L' + (x + 12) + ' ' + (y - 27) + ' L' + (x + 27) + ' ' + (y - 15) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.4"/>';
  });
  return s;
}
// an isometric cube (side 1) centred on o = {x, y, s}: back edges dashed, front edges solid, optional tinted faces
function cubeP(o, x, y, z) { return [o.x + (x - y) * .866 * o.s, o.y + (x + y - 1) * .5 * o.s - (z - .5) * o.s]; }
function cubeL(o, a, b) { var p = cubeP(o, a[0], a[1], a[2]), q = cubeP(o, b[0], b[1], b[2]); return "M" + f(p[0]) + " " + f(p[1]) + " L" + f(q[0]) + " " + f(q[1]); }
function cube(o, k, tint) {
  var back = "", front = "", E = [[[1, 0, 0], [1, 1, 0]], [[0, 1, 0], [1, 1, 0]], [[1, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [0, 1, 1]], [[0, 0, 1], [1, 0, 1]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]]];
  [[[0, 0, 0], [1, 0, 0]], [[0, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 0, 1]]].forEach(function (e) { back += draw(cubeL(o, e[0], e[1]), k, INK, 1.4, ' stroke-dasharray=".03 .03"'); });
  if (tint) { var F = function (pts, op) { return '<path d="' + pts.map(function (p, i) { var q = cubeP(o, p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + ' Z" fill="' + AIR + '" opacity="' + f(op * tint) + '"/>'; };
    front += F([[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], .55) + F([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], .7) + F([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], .4); }
  E.forEach(function (e) { front += draw(cubeL(o, e[0], e[1]), k, INK, 2.2); });
  return { back: back, front: front };
}
// African bush elephant in profile, facing left, feet on y = 0, about 200 wide × 125 tall at s = 1
var ELE_BODY = "M96 -92 C80 -112 30 -118 -8 -112 C-30 -124 -62 -126 -74 -108 C-84 -98 -90 -84 -90 -70 C-92 -48 -100 -30 -98 -14 C-97 -4 -86 -2 -84 -12 C-84 -26 -78 -44 -74 -58 C-68 -54 -60 -52 -54 -52 L-54 -4 C-54 0 -50 0 -48 0 L-30 0 C-26 0 -26 -2 -26 -6 L-24 -44 C0 -38 30 -38 46 -44 L46 -6 C46 0 48 0 52 0 L70 0 C74 0 74 -2 74 -6 L78 -50 C96 -62 102 -78 96 -92 Z";
var ELE_EAR = "M-50 -116 C-30 -124 -6 -112 -6 -92 C-6 -72 -20 -52 -34 -50 C-44 -56 -52 -72 -54 -88 Z";
function elephant(x, y, s, simple) {
  var w = simple ? 1.2 / s : 2 / s, st = ' stroke="' + INK + '" stroke-width="' + f(w) + '" stroke-linejoin="round"';
  var g = '<path d="M-22 -46 L-20 0 L-4 0 L-2 -44 Z M24 -46 L24 0 L40 0 L44 -46 Z" fill="' + ELE_D + '"' + st + '/><path d="' + ELE_BODY + '" fill="' + ELE + '"' + st + '/><path d="' + ELE_EAR + '" fill="' + ELE_D + '"' + st + '/>';
  if (!simple) g += '<path d="M-76 -62 C-86 -52 -98 -48 -110 -54 C-98 -42 -82 -46 -72 -56 Z" fill="#f4eede"' + st + '/><circle cx="-69" cy="-97" r="2.4" fill="' + INK + '"/><path d="M97 -88 C106 -70 104 -52 100 -40" fill="none"' + st + '/>' +
    '<path d="M-92 -52 h7 M-96 -36 h8 M-97 -22 h8 M-52 -18 h10 M48 -18 h10 M-30 -100 C-22 -92 -20 -80 -24 -68" stroke="' + INK + '" stroke-width="' + f(1.2 / s) + '" fill="none" opacity=".5"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", g);
}
// arrows of rising air: n chevron arrows climbing from y1 up to y0 around x, flowing with t
function rising(x, y0, y1, t, col, k, w) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = "", L = y1 - y0, n = Math.max(2, Math.round(L / 90));
  for (var i = 0; i < n; i++) { var p = ((i / n + t * .28) % 1 + 1) % 1, y = y1 - p * L, o = Math.sin(p * Math.PI) * k; s += G("", arrow(x + 6 * Math.sin(p * 6 + i), y, x + 6 * Math.sin(p * 6 + i + .6), y - 46, col || BLUE, w || 5), o); }
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · a summer cloud, one kilometre each way: the cloud inside a kilometre cube over the fields
function kmCloud(u, t, k, tint) { var o = { x: 320, y: 340, s: 185 }, c = cube(o, k, tint); return { o: o, s: ground(712, t) + c.back + cloud(320 + 7 * Math.sin(t * .8), 415, 128, t) + c.front }; }
shot(4, push(320, 390, 0.9, 1.0), function (u, d, t) {
  var q = kmCloud(u, t, at(u, .5, 1.1)), o = q.o, s = paper() + q.s, t1 = cu(4, 1), t2 = cu(4, 2);
  [[[1, 0, 0], [1, 1, 0], 62, 34, t1], [[0, 1, 0], [1, 1, 0], -62, 34, (t1 + t2) / 2], [[1, 0, 0], [1, 0, 1], 58, 6, t2]].forEach(function (e) {
    var k = at(u, e[4], .4), a = cubeP(o, e[0][0], e[0][1], e[0][2]), b = cubeP(o, e[1][0], e[1][1], e[1][2]);
    s += draw(cubeL(o, e[0], e[1]), k, ORANGE, 5) + G("", N("1", (a[0] + b[0]) / 2 + e[2] + 20, (a[1] + b[1]) / 2 + e[3], 30, ORANGE) + T("كم", (a[0] + b[0]) / 2 + e[2] - 12, (a[1] + b[1]) / 2 + e[3] - 2, 22, ORANGE, 800), k);
  });
  return s;
});
// 5 · one cubic metre of it holds about half a gram of water: a metre cube of drifting droplets, the number, ten drops in a corner box
shot(5, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var o = { x: 300, y: 330, s: 150 }, c = cube(o, 1, .5), k = at(u, .9, 1), drops = "";
  for (var i = 0; i < 10; i++) { var x = -52 + (i % 5) * 26, y = -30 + Math.floor(i / 5) * 34; drops += '<path d="M' + x + ' ' + (y - 12) + ' C' + (x + 9) + ' ' + y + ' ' + (x + 9) + ' ' + (y + 10) + ' ' + x + ' ' + (y + 10) + ' C' + (x - 9) + ' ' + (y + 10) + ' ' + (x - 9) + ' ' + y + ' ' + x + ' ' + (y - 12) + ' Z" fill="' + DROP + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  return paper() + c.back + dropField(300, 335, 170, 190, t, 14, 46, 3.2) + c.front + label(cubeP(o, 0, 1, 1)[0] + 30, cubeP(o, 0, 1, 1)[1] + 14, 230, 110, "متر مكعب", OLIVE, at(u, .3, .5), 24) +
    G("", N(count(.5, k, 1), 300, 600, 70, ORANGE) + T("جرام مية", 300, 646, 28, INK, 800), clamp(k * 3)) +
    iconBox(535, 150, 160, drops + T("≈ 10 نقط", 0, 64, 20, INK, 700), at(u, 2.0, .3));
}, { tr: "in" });
// 6 · times a thousand million cubic metres = 500 tonnes
shot(6, push(320, 390, 1.0, 1.06), function (u, d, t) {
  var k = at(u, cu(6, 1), 1.1), k0 = at(u, .3, .5);
  return paper() + G("translate(0 -40)", cloud(320 + 6 * Math.sin(t * .8), 250, 150, t)) +
    G("", N("0.5", 520, 360, 40) + T("جرام", 520, 394, 20, INK, 700) + N("×", 425, 362, 40, ORANGE) + N("1,000,000,000", 240, 360, 40) + T("متر مكعب", 240, 394, 20, INK, 700), k0) +
    draw("M120 430 H520", at(u, cu(6, 1) - .2, .4), INK, 2.4) +
    G("", N(count(500, k), 320, 560, 120, ORANGE) + T("طن مية", 320, 626, 36, INK, 800), clamp(k * 3));
});
// 6c · = a hundred elephants (5 tonnes each): the herd fills in ten by ten
shot([6, 2], push(320, 400, 0.96, 1.03), function (u, d, t) {
  var s = paper(), n = Math.floor(100 * at(u, .1, .75));
  for (var i = 0; i < n; i++) { var c = i % 10, r = Math.floor(i / 10); s += elephant(590 - c * 60 + 3 * Math.sin(t * 2 + r), 300 + r * 46 + 1.5 * Math.sin(t * 3 + i), .26, true); }
  return s + elephant(330, 205, .95) + G("", N("5", 510, 150, 56, ORANGE) + T("طن", 510, 186, 24, INK, 800), at(u, .2, .3)) + numBox("× 100", 110, 170, at(u, .9, .3), 30);
});
// 7 · so how does all that weight not fall?
shot(7, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var p = 1 + .05 * Math.sin(t * 5);
  return paper() + ground(730, t) + cloud(320 + 8 * Math.sin(t * .9), 300 + 5 * Math.sin(t * 1.7), 200, t) + arrow(320, 330, 320, 330 + 250 * at(u, .2, .5) * p, INK, 14) +
    G("", N("500", 215, 500, 54, ORANGE) + T("طن", 215, 538, 26, INK, 800), at(u, .4, .3)) + G("", T("؟", 450, 520, 130, ORANGE, 800), at(u, .9, .3));
}, { tr: "out" });
// 8–9 · the rule: the smaller a thing is, the more the air brakes it. Three balls falling through air.
function fallers(t, k, col) {
  var s = "", X = [130, 330, 510], Rr = [58, 24, 6], V = [560, 210, 26];
  for (var g = 0; g < 9; g++) s += '<path d="M40 ' + (120 + g * 75) + ' H600" stroke="' + INK + '" stroke-width="1" opacity=".12" stroke-dasharray="4 8"/>';
  X.forEach(function (x, i) {
    var y = 90 + ((t * V[i] + i * 190) % 640), r = Rr[i], n = 3 - i;
    for (var j = 0; j < n * 2; j++) s += '<path d="M' + f(x - r * .7 + j * r * 1.4 / Math.max(1, n * 2 - 1)) + ' ' + f(y - r - 12) + ' v-' + f(V[i] * .12) + '" stroke="' + INK + '" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>';
    s += C(x, y, r, col ? col[i] : GREY, i == 2 ? 1.4 : 2.4) + (r > 10 ? '<circle cx="' + f(x - r * .3) + '" cy="' + f(y - r * .34) + '" r="' + f(r * .22) + '" fill="#fff" opacity=".5"/>' : "");
    if (k > 0) { var a = [26, 44, 64][i] * clamp(k) * (1 + .12 * Math.sin(t * 6 + i)); s += arrow(x, y + r + 12 + a, x, y + r + 10, BLUE, [5, 5, 4][i]); }
  });
  return s;
}
shot(8, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", fallers(t, 0), .55) + G("", '<rect x="130" y="170" width="380" height="160" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 250)"/>' +
    T("الأصغر", 320, 238, 42, ORANGE, 800) + T("الهوا بيفرمله أكتر", 320, 292, 32, INK, 700) + C(320, 180, 9, ORANGE, 2), at(u, .3, .4));
});
shot(9, push(320, 400, 1.06, 0.98), function (u, d, t) {
  return paper() + fallers(t, at(u, .5, .5), [GREY, GREY, DROP]) + tag("سريع", 130, 740, at(u, .8, .3), 26, INK) + tag("بطيء جدًا", 500, 740, at(u, 1.6, .3), 26, BLUE);
});
// 10 · the water is broken into tiny droplets, thousands of millions of them: a magnifier on the cloud
shot(10, push(320, 400, 0.95, 1.04), function (u, d, t) {
  var k = at(u, cu(10, 1) - .2, .5), sx = 250, sy = 215;
  return paper() + cloud(310 + 6 * Math.sin(t * .8), 290, 240, t) + G("", C(sx, sy, 20, "none", 2.4) + '<path d="M' + (sx + 12) + ' ' + (sy + 16) + ' L330 400" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 5"/>', k) +
    inset(350, 540, 175, '<rect x="-200" y="-200" width="400" height="400" fill="#eef0ea"/>' + dropField(0, 0, 380, 380, t, 16, 70, 7), k) +
    label(440, 470, 480, 345, "نقط مية", BLUE, at(u, cu(10, 1) + .3, .5), 24) + tag("مليارات", 130, 660, at(u, cu(10, 2), .3), 32, ORANGE);
});
// 11 · a droplet is about 20 microns across, thinner than a hair: both in section at the same scale (hair ≈ 70 microns)
shot(11, push(320, 400, 1.1, 1.0), function (u, d, t) {
  var hx = 440, hy = 330, s = paper(), k2 = at(u, cu(11, 1) - .1, .5), i, by = 330 + 16 * Math.sin(t * 2.6);
  var hair = C(hx, hy, 140, "#7a5a44", 2.6) + C(hx, hy, 118, "#96735a", 1.2) + C(hx, hy, 30, "#5c4232", 1.4);
  for (i = 0; i < 26; i++) { var a = i / 26 * Math.PI * 2; hair += '<path d="M' + f(hx + 120 * Math.cos(a)) + ' ' + f(hy + 120 * Math.sin(a)) + ' Q' + f(hx + 134 * Math.cos(a + .1)) + ' ' + f(hy + 134 * Math.sin(a + .1)) + ' ' + f(hx + 139 * Math.cos(a + .22)) + ' ' + f(hy + 139 * Math.sin(a + .22)) + '" stroke="' + INK + '" stroke-width="1.2" fill="none" opacity=".6"/>'; }
  for (i = 0; i < 40; i++) { var b = hash(i) * 6.28, rr = 40 + hash(i + 20) * 70; hair += '<circle cx="' + f(hx + rr * Math.cos(b)) + '" cy="' + f(hy + rr * Math.sin(b)) + '" r="2" fill="#5c4232" opacity=".7"/>'; }
  s += G("", dropField(320, 400, 620, 760, t, 60, 14, 9, 31), .6) + appear(k2, hair) + drop(130, by, 40) + measure(90, 420, 170, 420, at(u, .5, .5), "") + G("", N("20", 130, 468, 40, ORANGE) + T("ميكرون", 130, 500, 22, INK, 700), at(u, .6, .4)) +
    label(130, by - 44, 150, 180, "نقطة السحاب", BLUE, at(u, .3, .5), 24) +
    measure(300, 510, 580, 510, k2, "") + G("", N("70", 440, 560, 40) + T("ميكرون", 440, 592, 22, INK, 700), k2) + label(hx - 40, hy - 134, 400, 110, "شعرة راسك (مقطع)", OLIVE, at(u, cu(11, 1) + .2, .5), 24);
  return s;
}, { tr: "in" });
// 12 · so it sinks about 1 cm a second, like dust in a sunbeam: a droplet beside a centimetre rule, then the window
shot(12, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), x0 = 200, i, y = 140 + ((t * 88) % 440), k = at(u, cu(12, 1), .6), kb = at(u, cu(12, 2), .3);
  s += R(x0 - 70, 110, 44, 520, "#f4efe3", 2);
  for (i = 0; i <= 50; i++) s += '<path d="M' + (x0 - 26) + ' ' + f(130 + i * 9.6) + ' h-' + (i % 10 ? (i % 5 ? 10 : 16) : 26) + '" stroke="' + INK + '" stroke-width="' + (i % 10 ? 1 : 2) + '"/>';
  for (i = 0; i <= 5; i++) s += N(String(i), x0 - 60, 138 + i * 96, 17);
  s += T("سم", x0 - 48, 660, 20, INK, 700) + '<path d="M' + x0 + ' ' + f(y - 60) + ' V' + f(y - 22) + '" stroke="' + INK + '" stroke-width="1.6" opacity=".4" stroke-dasharray="3 6"/>' + drop(x0, y, 15) + arrow(x0 + 34, y - 10, x0 + 34, y + 26, INK, 3.4);
  s += G("", N("1", 480, 720, 64, ORANGE) + T("سنتي في الثانية", 330, 712, 26, INK, 800), k);
  var win = '<rect x="-98" y="-98" width="196" height="196" fill="#e9dfc8"/><path d="M-98 -98 L-20 -98 L98 60 L98 98 L-10 98 Z" fill="#f6e9b4" opacity=".9"/><rect x="-92" y="-92" width="62" height="74" fill="#cfe0e6" stroke="' + INK + '" stroke-width="2"/><path d="M-61 -92 v74 M-92 -55 h62" stroke="' + INK + '" stroke-width="1.6"/>';
  for (i = 0; i < 44; i++) { var px = -60 + hash(i + 3) * 150, py = -70 + ((hash(i + 31) * 160 + t * (5 + 6 * hash(i))) % 160); if (py > (px + 98) * 1.34 - 110 - 30 && py < (px + 98) * 1.8 + 40) win += '<circle cx="' + f(px + 4 * Math.sin(t * 1.4 + i)) + '" cy="' + f(py) + '" r="' + f(2.4 + hash(i + 8) * 2.4) + '" fill="#7a6a45"/>'; }
  return s + iconBox(450, 310, 200, G('scale(1.15)', win), kb);
});
// 13 · but it does sink? Yes, only the air under it is going up
shot(13, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, cu(13, 1) + .3, .6), lift = k * Math.max(0, u - cu(13, 1) - .3) * 34, s = paper();
  s += G("translate(0 " + f(-lift % 600) + ")", dropField(320, 380, 560, 600, t, 22, 26, 11, 4));
  [110, 250, 390, 530].forEach(function (x, i) { s += rising(x, 80, 760, t + i * .37, BLUE, k, 7); });
  return s + G("", T("؟", 110, 170, 110, ORANGE, 800), at(u, .3, .3) * (1 - k)) + tag("الهوا طالع", 320, 720, at(u, cu(13, 1) + .6, .3), 32, BLUE);
});
// 14 · the Sun heats the ground, the warm air goes up faster than the droplets sink and carries them
function thermal(u, t, k1, k2, op) {
  op = op || {}; var s = ground(690, t, { hot: k1 > .5 }) + sun(70, 90, 46, t), i;
  for (i = 0; i < 5; i++) s += arrow(120 + i * 22, 150 + i * 34, 150 + i * 30, 205 + i * 40 + 4 * Math.sin(t * 4 + i), ORANGE, 3, k1 * (i < 4 ? 1 : 0));
  for (i = 0; i < 7; i++) s += wave(90 + i * 78, 676, 150 + i * 78, 676, t * .6, ORANGE, 4, 20, k1, 2.4);
  [230, 330, 430].forEach(function (x, j) { s += rising(x, 330, 670, t + j * .3, ORANGE, k2, 7); });
  return s + cloud(330 + 7 * Math.sin(t * .8), 300, 205, t, op);
}
shot(14, push(345, 400, 0.94, 1.0), function (u, d, t) {
  var k1 = at(u, .3, .6), k2 = at(u, cu(14, 1), .6);
  return paper() + thermal(u, t, k1, k2) + label(500, 690, 490, 610, "الأرض بتسخن", ORANGE, at(u, .7, .5), 22) + label(440, 520, 468, 462, "هوا دافي طالع", ORANGE, at(u, cu(14, 1) + .3, .5), 22) +
    G("translate(0 " + f(-6 * Math.sin(t * 2)) + ")", dropField(330, 262, 250, 50, t, -8, 16, 5, 9), at(u, cu(14, 2), .4)) + label(250, 262, 110, 400, "النقط", BLUE, at(u, cu(14, 2) + .2, .5), 22) + check(560, 250, 1, at(u, cu(14, 3), .4), OLIVE);
}, { tr: "out" });
// 15 · the air inside the cloud itself weighs about a million tonnes: the kilometre cube again, full of air
shot(15, push(320, 380, 1.0, 0.94), function (u, d, t) {
  var k = at(u, .8, 1.3), q = kmCloud(u, t, 1, at(u, .2, .8));
  return paper() + q.s + G("", N(count(1000000, k), 320, 640, 62, BLUE) + T("طن هوا", 320, 690, 28, INK, 800), clamp(k * 3)) + label(390, 230, 370, 100, "الهوا جوه السحابة", BLUE, at(u, .4, .5), 22);
});
// 16 · all the water is less than a thousandth of it: a bar of air with the water as a sliver, magnified
shot(16, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var k = at(u, .3, .8), k2 = at(u, 1.1, .5), s = paper();
  s += sweep(40, 250, 560, 90, k, "r", R(40, 250, 560, 90, AIR, 2.4)) + G("", T("هوا", 320, 306, 34, INK, 800) + N("1,000,000", 350, 230, 30, BLUE) + T("طن", 235, 228, 22, INK, 700), k);
  s += '<path d="M599 250 v90" stroke="' + ORANGE + '" stroke-width="2"/>' + G("", '<path d="M588 345 L500 430" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 5"/>' + C(596, 296, 12, "none", 2), k2);
  s += inset(420, 540, 130, '<rect x="-140" y="-140" width="280" height="280" fill="' + AIR + '"/><rect x="' + f(58 + 3 * Math.sin(t * 3)) + '" y="-140" width="14" height="280" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="72" y="-140" width="80" height="280" fill="' + PAPER + '"/><path d="M72 -140 v280" stroke="' + INK + '" stroke-width="2.4"/>', k2);
  return s + label(488, 500, 530, 415, "المية", ORANGE, at(u, 1.4, .4), 24) + G("", N("500", 150, 520, 44, ORANGE) + T("طن مية", 150, 556, 22, INK, 700), at(u, 1.3, .4)) + numBox("< 1/1000", 150, 660, at(u, 1.8, .3), 34);
});
// 17 · when does it fall? when droplets bump into each other and grow
shot(17, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper(), m = at(u, .9, 1.2), m2 = at(u, 2.0, .9), i;
  var C3 = [[170, 300], [450, 260], [330, 520]];
  for (i = 0; i < 12; i++) { var c = C3[i % 3], a = i * 2.1, r0 = 120 + 40 * hash(i), x = c[0] + Math.cos(a + t * .4) * r0 * (1 - m), y = c[1] + Math.sin(a + t * .4) * r0 * (1 - m) + 8 * Math.sin(t * 2 + i); if (m < 1) s += drop(x, y, 13); }
  C3.forEach(function (c, j) { var x = lerp(c[0], 320, m2), y = lerp(c[1], 400, m2) + 8 * Math.sin(t * 2.2 + j) + (m2 >= 1 ? 0 : 0); if (m > .6 && m2 < 1) s += drop(x, y, 13 + 22 * clamp((m - .6) / .4)); });
  if (m2 >= .95) { var fy = 400 + Math.max(0, u - 2.9) * 60 + 6 * Math.sin(t * 3); s += drop(320, fy, 35 + 26 * clamp((m2 - .95) / .05)) + arrow(420, fy - 20, 420, fy + 50 + 8 * Math.sin(t * 5), INK, 6); }
  return s + G("", T("؟", 540, 170, 110, ORANGE, 800), at(u, .2, .3) * (1 - m)) + dropField(320, 400, 600, 700, t, 10, 14, 4, 21);
});
// 18 · one raindrop needs about a million cloud droplets: a 2 mm drop (round, slightly flat underneath) beside a 0.02 mm one
shot(18, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .5, 1.6), s = paper(), i, cx = 390, cy = 360 + 6 * Math.sin(t * 2), R0 = 150;
  for (i = 0; i < 40; i++) { var p = ((hash(i) + t * .5) % 1), a = hash(i + 5) * 6.28, r = lerp(330, R0 * .7, p); s += '<circle cx="' + f(cx + r * Math.cos(a)) + '" cy="' + f(cy + r * Math.sin(a) * .9) + '" r="2" fill="' + BLUE + '" opacity="' + f(Math.sin(p * 3.1)) + '"/>'; }
  s += '<path d="M' + (cx - R0) + ' ' + f(cy) + ' C' + (cx - R0) + ' ' + f(cy - R0 * 1.25) + ' ' + (cx + R0) + ' ' + f(cy - R0 * 1.25) + ' ' + (cx + R0) + ' ' + f(cy) + ' C' + (cx + R0) + ' ' + f(cy + R0 * .95) + ' ' + (cx - R0) + ' ' + f(cy + R0 * .95) + ' ' + (cx - R0) + ' ' + f(cy) + ' Z" fill="' + DROP + '" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="' + (cx - 55) + '" cy="' + f(cy - 50) + '" rx="30" ry="20" fill="#fff" opacity=".55" transform="rotate(-30 ' + (cx - 55) + ' ' + f(cy - 50) + ')"/>';
  s += '<circle cx="90" cy="360" r="1.6" fill="' + INK + '"/>' + label(90, 360, 150, 220, "نقطة سحاب", BLUE, at(u, .3, .4), 22) + label(cx + 40, cy - 112, 470, 150, "نقطة مطر", BLUE, at(u, .6, .4), 22) +
    measure(cx - R0, 560, cx + R0, 560, at(u, .8, .5), "") + G("", N("2", cx + 22, 606, 34) + T("ملي", cx - 16, 603, 22, INK, 700), at(u, .9, .4));
  return s + G("", N(count(1000000, k), 320, 700, 62, ORANGE) + T("نقطة سحاب", 320, 744, 24, INK, 800), clamp(k * 3));
}, { tr: "in" });
// 19 · then the air can't hold it and it falls as rain
function rain(x0, x1, y0, y1, t, k, n) { var s = ""; for (var i = 0; i < (n || 34); i++) { var x = x0 + hash(i + 2) * (x1 - x0), L = y1 - y0, y = y0 + ((hash(i + 60) * L + t * (300 + 120 * hash(i))) % L); if (y - y0 < L * k) s += '<path d="M' + f(x) + ' ' + f(y) + ' l-3 22" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round"/>'; } return s; }
shot(19, push(320, 420, 1.0, 0.94), function (u, d, t) {
  var k = at(u, .2, 1.0);
  return paper() + ground(700, t) + rain(190, 480, 300, 696, t, k) + cloud(330 + 6 * Math.sin(t * .8), 300, 215, t, { shade: "#9ba3a5", band: .22 }) + tag("مطر", 560, 520, at(u, 1.0, .3), 32, BLUE);
}, { tr: "out" });
// 20 · the myth: «a cloud is water vapour» — crossed out
shot(20, push(320, 380, 1.08, 1.0), function (u, d, t) {
  return paper() + cloud(320 + 7 * Math.sin(t * .9), 380 + 5 * Math.sin(t * 1.6), 230, t) + tag("بخار مية", 320, 520, at(u, .5, .3), 36, INK) + cross(320, 510, 2.2, at(u, d * .62, .5));
});
// 21 · vapour is invisible: a kettle, the clear gap at the spout, then the white mist of liquid droplets; droplets and ice crystals
function kettle(x, y, t) {
  var s = '<path d="M-70 0 C-78 -40 -62 -96 -40 -104 L40 -104 C62 -96 78 -40 70 0 Z" fill="#b9c1c2" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-40 -104 C-30 -118 30 -118 40 -104 Z" fill="#9aa3a5" stroke="' + INK + '" stroke-width="2.2"/>' + C(0, -120, 8, INK, 0) +
    '<path d="M62 -52 L112 -96 L120 -84 L72 -24 Z" fill="#b9c1c2" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M-44 -102 C-70 -170 70 -170 44 -102" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-44 -102 C-70 -170 70 -170 44 -102" fill="none" stroke="#5c5650" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M-52 -20 C-58 -50 -50 -80 -40 -92" stroke="#fff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/><rect x="-84" y="0" width="168" height="12" fill="' + INK + '"/>';
  for (var i = 0; i < 7; i++) s += '<path d="M' + (-66 + i * 22) + ' 30 q6 -9 0 -18 q-6 9 0 18 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2" transform="translate(0 ' + f(2 * Math.sin(t * 9 + i)) + ')"/>';
  return G("translate(" + x + " " + y + ")", s);
}
function crystal(x, y, r, rot) { var s = ""; for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; s += '<path d="M0 0 L' + f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a)) + ' M' + f(.55 * r * Math.cos(a)) + ' ' + f(.55 * r * Math.sin(a)) + ' L' + f(.8 * r * Math.cos(a + .35)) + ' ' + f(.8 * r * Math.sin(a + .35)) + ' M' + f(.55 * r * Math.cos(a)) + ' ' + f(.55 * r * Math.sin(a)) + ' L' + f(.8 * r * Math.cos(a - .35)) + ' ' + f(.8 * r * Math.sin(a - .35)) + '" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round" fill="none"/>'; }
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", '<path d="M' + [0, 1, 2, 3, 4, 5].map(function (i) { return f(.3 * r * Math.cos(i * Math.PI / 3)) + " " + f(.3 * r * Math.sin(i * Math.PI / 3)); }).join(" L") + ' Z" fill="#dfe9ee" stroke="' + INK + '" stroke-width="1.4"/>' + s); }
shot(21, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + kettle(190, 640, t), k1 = at(u, .3, .5), k2 = at(u, cu(21, 1), .5), i;
  s += G("", '<path d="M306 548 L352 486 L372 500 L318 560 Z" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 5"/>', k1) + label(338, 522, 410, 612, "بخار: مابيتشافش", OLIVE, at(u, .5, .5), 22);
  var mist = [[0, 0, .5], [.5, -.35, .6], [-.3, -.6, .55], [.3, -1.0, .7], [-.5, -1.3, .6], [.2, -1.6, .75], [.9, -.9, .5], [-.9, -.9, .45]];
  s += G("", puffs(400 + 6 * Math.sin(t), 480, 62, mist.map(function (p, i) { return [p[0] + .06 * Math.sin(t * 1.3 + i), p[1] + .5 - .05 * Math.cos(t * 1.7 + i), p[2]]; }), t * 2, { band: 0.001, sw: 1.8 }), k1);
  s += label(430, 400, 250, 330, "نقط مية", BLUE, at(u, cu(21, 1) + .1, .5), 24);
  var ins = '<rect x="-150" y="-150" width="300" height="300" fill="#eef0ea"/>' + dropField(-40, 30, 150, 220, t, 14, 12, 12, 2) + crystal(62, -50 + 6 * Math.sin(t * 1.5), 40, t * 14) + crystal(78, 60 + 5 * Math.cos(t * 1.3), 30, -t * 10 + 20);
  return s + inset(470, 200, 130, ins, k2) + label(430, 235, 290, 235, "مية سايلة", BLUE, at(u, cu(21, 2), .4), 22) + label(532, 150, 330, 90, "بلّورات تلج", BLUE, at(u, cu(21, 3), .4), 22);
});
// 22 · «يعني من الآخر»: heavy water, in tiny droplets, held by rising air
shot(22, push(320, 400, 0.94, 1.02), function (u, d, t) {
  var op = { inner: dropField(330, 240, 330, 110, t, 6, 60, 3, 13) };
  return paper() + thermal(u, t, 1, 1, op) + G("", N("500", 140, 540, 46, ORANGE) + T("طن مية", 140, 574, 22, INK, 800), at(u, .9, .4)) +
    label(230, 262, 150, 400, "نقط صغيرة", BLUE, at(u, 2.0, .4), 24) + label(440, 540, 480, 478, "هوا طالع", ORANGE, at(u, 3.2, .4), 24);
}, { tr: "out" });
// 23 · the odd fact: a big thunderstorm cloud can hold a million tonnes of water, and still floats
shot(23, push(320, 400, 1.02, 0.93), function (u, d, t) {
  var k = at(u, cu(23, 2) - .3, 1.2), s = paper() + ground(730, t);
  s += rain(250, 400, 600, 728, t, 1, 16) + puffs(320 + 4 * Math.sin(t * .7), 600, 170, STORM, t, { shade: "#8f989b", band: .2, creases: 4 });
  s += G("", cloud(565, 600, 46, t, { sw: 1.6 }), at(u, .3, .4)) + label(565, 572, 578, 505, "سحابة عادية", INK, at(u, .6, .4), 18);
  s += measure(60, 728, 60, 170, at(u, .5, .7), "") + G("", N("12", 100, 440, 34) + T("كم", 100, 468, 20, INK, 700), at(u, .8, .4));
  if (u > 1.2 && (t * 1.3) % 1 < .16) s += '<path d="M330 600 l-18 44 h16 l-22 56" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linejoin="round"/>';
  return s + G("", '<rect x="150" y="20" width="340" height="96" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + N(count(1000000, k), 320, 72, 46, ORANGE) + T("طن مية", 320, 104, 22, INK, 800), clamp(k * 3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  CLIPN = 6000;
  // line 0: a cumulus over the fields. line 1: the elephants it outweighs. line 2: the «falling» arrow crossed out
  var s = G("translate(0 20)", ground(600, t, { bare: li >= 1 })) + cloud(304 + 10 * Math.sin(t * .8), 330 + 6 * Math.sin(t * 1.5), 215, t);
  if (li >= 1) { var u = t - LN[1].start; for (var i = 0; i < 5; i++) s += G("", elephant(540 - i * 112, 618, .5), ease((u - i * .15) / .3)); s += numBox("× 100", 400, 450, ease((u - .9) / .3), 34); }
  if (li >= 2) { var v = t - LN[2].start; s += arrow(170, 350, 170, 350 + 110 * ease(v / .4), INK, 9) + cross(170, 410, 1.2, ease((v - .5) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) {
  CLIPN = 7000;
  return '<rect x="0" y="0" width="180" height="200" fill="#cddbe0"/>' + cloud(90 + 10 * Math.sin(t * .9), 122 + 4 * Math.cos(t * 1.4), 62, t, { sw: 1.8 }) + rising(60, 132, 190, t, BLUE, 1, 3) + rising(120, 132, 190, t + .4, BLUE, 1, 3);
};
SCENE.outro = function (svg, u, t) {
  CLIPN = 5000;
  var s = '<rect x="-10" y="238" width="620" height="60" fill="#d3b98c" stroke="' + INK + '" stroke-width="1.6"/>';
  [220, 300, 380].forEach(function (x, j) { s += rising(x, 140, 236, t + j * .3, ORANGE, 1, 4); });
  s += cloud(300 + 5 * Math.sin(t * .8), 130, 130, t, { inner: dropField(300, 95, 220, 70, t, 5, 40, 2.4, 13) });
  return s + callout("1", 250, 50, ease(u / .3)) + callout("2", 425, 190, ease(u / .3 - .5)) + callout("3", 176, 134, ease(u / .3 - 1)) + callout("4", 90, 238, ease(u / .3 - 1.5));
};
