// ── the cat: a short-haired brown tabby («قطة بلدي») from real proportions and photos (refs/SOURCES.md) ──
// Front view sitting (catFront) and profile sitting (catSide). Units: the sitting height to the top of the head ≈ 250 at s = 1.
// Head about as wide as the shoulders, wide cheeks, big upright ears set wide, large almond eyes with a vertical slit pupil
// (o.pupil: 0 = a thin slit, 1 = round and wide open), a small triangular nose, a split upper lip, whisker pads and long
// whiskers, the tabby «M» on the forehead, stripes on the cheeks, legs and tail.
var TAB = "#a8957a", TAB_D = "#5e4e3c", TAB_L = "#e6dccb", TAB_M = "#8a7860", CNOSE = "#c98a7e", CEAR = "#d9a18f", IRIS = "#c4b23e", IRIS_D = "#8f8a2c", GLOW = "#d9f59a";
function cpath(pts, close) { return smooth(pts, close); }
// one cat eye in the front view: almond outline, iris, a pupil from slit to round, a highlight; glow makes it shine (eyeshine)
function catEye(x, y, rx, ry, pupil, open, glow, look) {
  open = open == null ? 1 : open; var s = "", h = ry * open, lk = look || [0, 0];
  if (open < .08) return '<path d="M' + f(x - rx) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + ry * .35) + ' ' + f(x + rx) + ' ' + f(y) + '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  var id = "ce" + (++CLIPN), eye = 'M' + f(x - rx) + ' ' + f(y) + ' Q' + f(x - rx * .7) + ' ' + f(y - h * 1.25) + ' ' + f(x) + ' ' + f(y - h) + ' Q' + f(x + rx * .8) + ' ' + f(y - h * 1.1) + ' ' + f(x + rx) + ' ' + f(y - h * .1) + ' Q' + f(x + rx * .75) + ' ' + f(y + h * 1.1) + ' ' + f(x) + ' ' + f(y + h) + ' Q' + f(x - rx * .8) + ' ' + f(y + h * 1.05) + ' ' + f(x - rx) + ' ' + f(y) + ' Z';
  s += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath>';
  s += '<path d="' + eye + '" fill="' + (glow ? GLOW : IRIS) + '"/>';
  s += '<g clip-path="url(#' + id + ')">';
  if (!glow) s += '<ellipse cx="' + f(x) + '" cy="' + f(y + ry * .55) + '" rx="' + f(rx * 1.1) + '" ry="' + f(ry * .7) + '" fill="' + IRIS_D + '" opacity=".35"/>';
  var pw = lerp(.1, .86, clamp(pupil)) * rx, px = x + lk[0] * rx * .2, py = y + lk[1] * ry * .2;
  s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(pw) + '" ry="' + f(ry * .98) + '" fill="' + (glow ? "#7fbf5a" : "#14110d") + '"/>';
  if (!glow) s += '<circle cx="' + f(px + rx * .28) + '" cy="' + f(py - ry * .38) + '" r="' + f(rx * .16) + '" fill="#fff"/>';
  s += '</g><path d="' + eye + '" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
  if (glow) s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx * 1.9) + '" ry="' + f(ry * 1.9) + '" fill="' + GLOW + '" opacity="' + f(.22 * glow) + '"/>';
  return s;
}
// o: {x, y (ground), s, pupil, eyes (open 0..1), glow (0..1), look [dx,dy], tilt (deg), ears (deg, + turns them out/back),
//     whisk (0..1 whiskers swept forward), tail (deg), breath}
function catFront(o) {
  o = o || {}; var s = o.s || 1, t = window.__t || 0, br = 1 + .012 * Math.sin(t * 2.1) * (o.breath == null ? 1 : o.breath);
  function W(p) { return [o.x + p[0] * s, o.y + p[1] * s]; }
  function Wl(a) { return a.map(W); }
  var g = "";
  // tail curling round the front paws
  var tw = (o.tail || 0) + 6 * Math.sin(t * 1.3);
  var tp = [[58, -14], [92, -6], [100, -22], [86, -34]].map(function (p) { return rotP(p, [58, -14], -tw * .3); });
  var tb = tube(Wl(tp.concat([[66, -30]])), [16, 15, 13, 11, 7].map(function (v) { return v * s; }));
  // body: a pear from the neck to the haunches, sitting
  var body = [[-30, -150], [-46, -118], [-58, -80], [-66, -44], [-62, -12], [-46, 0], [46, 0], [62, -12], [66, -44], [58, -80], [46, -118], [30, -150]];
  var bp = Wl(body.map(function (p) { return [p[0] * br, p[1]]; }));
  g += '<path d="' + cpath(bp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '" stroke-linejoin="round"/>';
  var bid = "cb" + (++CLIPN); g += '<clipPath id="' + bid + '"><path d="' + cpath(bp, true) + '"/></clipPath><g clip-path="url(#' + bid + ')">';
  [[-60, -100], [-64, -70], [-66, -40], [60, -100], [64, -70], [66, -40]].forEach(function (p, i) { var sd = p[0] < 0 ? -1 : 1; g += '<path d="' + cpath(Wl([[p[0] - sd * 6, p[1]], [p[0] + sd * -22, p[1] + 6], [p[0] + sd * -34, p[1] + 16]]), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(5 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '<path d="' + cpath(Wl([[-26, -150], [-34, -110], [-28, -70], [0, -56], [28, -70], [34, -110], [26, -150]]), true) + '" fill="' + TAB_L + '"/>';   // pale chest
  g += '<path d="' + cpath(Wl([[-64, -48], [-52, -70], [-40, -40], [-44, 0]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/><path d="' + cpath(Wl([[64, -48], [52, -70], [40, -40], [44, 0]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/></g>';
  // front legs and paws
  [-1, 1].forEach(function (sd) {
    var lg = tube(Wl([[sd * 15, -104], [sd * 17, -60], [sd * 18, -12]]), [24, 19, 17].map(function (v) { return v * s; }));
    g += '<path d="' + lg.fill + '" fill="' + TAB_L + '"/><path d="' + lg.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
    for (var k = 0; k < 3; k++) { var y = -76 + k * 18; g += '<path d="' + cpath(Wl([[sd * 7, y], [sd * 17, y + 3], [sd * 27, y]]), false) + '" stroke="' + TAB_M + '" stroke-width="' + f(3.4 * s) + '" fill="none" stroke-linecap="round"/>'; }
    var pw = W([sd * 18, -5]);
    g += '<ellipse cx="' + f(pw[0]) + '" cy="' + f(pw[1]) + '" rx="' + f(14 * s) + '" ry="' + f(8 * s) + '" fill="' + TAB_L + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/><path d="M' + f(pw[0] - 4 * s) + ' ' + f(pw[1] + 2 * s) + ' v' + f(5 * s) + ' M' + f(pw[0] + 4 * s) + ' ' + f(pw[1] + 2 * s) + ' v' + f(5 * s) + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  });
  g += '<path d="' + tb.fill + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var k = 0; k < 3; k++) { var q = W(tp[Math.min(3, k + 1)]); g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(4 * s) + '" fill="' + TAB_D + '" opacity=".75"/>'; }
  // head, turning a little; ears; face
  var hc = [0, -186], tl = (o.tilt || 0) + 2 * Math.sin(t * .8), H = function (p) { return W(rotP([p[0] * 1.14, p[1] * 1.14 + hc[1] + 4], [0, hc[1] + 30], tl)); };
  var ear = function (sd) {
    var e = (o.ears || 0) * sd, base0 = [sd * 14, -36], base1 = [sd * 50, -14], tip = [sd * 44, -70];
    var pts = [base0, [sd * 22, -52], tip, [sd * 52, -40], base1].map(function (p) { return rotP(p, [sd * 32, -24], e); });
    var inn = [[sd * 22, -34], [sd * 28, -48], [sd * 42, -60], [sd * 46, -38], [sd * 44, -22]].map(function (p) { return rotP(p, [sd * 32, -24], e); });
    return '<path d="' + cpath(pts.map(H), true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '" stroke-linejoin="round"/>' +
      (Math.abs(e) < 50 ? '<path d="' + cpath(inn.map(H), true) + '" fill="' + CEAR + '" opacity="' + f(1 - Math.abs(e) / 60) + '"/>' : "");
  };
  g += ear(-1) + ear(1);
  var head = [[0, -40], [24, -37], [44, -24], [54, 0], [56, 16], [48, 28], [30, 38], [0, 42], [-30, 38], [-48, 28], [-56, 16], [-54, 0], [-44, -24], [-24, -37]];
  var hp = head.map(H), hid = "ch" + (++CLIPN);
  g += '<path d="' + cpath(hp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.6 * s) + '"/>';
  g += '<clipPath id="' + hid + '"><path d="' + cpath(hp, true) + '"/></clipPath><g clip-path="url(#' + hid + ')">';
  g += '<path d="' + cpath([[-30, 14], [-18, 6], [0, 8], [18, 6], [30, 14], [30, 34], [0, 46], [-30, 34]].map(H), true) + '" fill="' + TAB_L + '"/>';   // pale muzzle
  // the tabby M on the forehead and the cheek stripes
  g += '<path d="' + cpath([[-16, -14], [-14, -32], [-6, -20], [0, -34], [6, -20], [14, -32], [16, -14]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3.2 * s) + '" fill="none" stroke-linejoin="round"/>';
  [[-1], [1]].forEach(function (q) { var sd = q[0]; g += '<path d="' + cpath([[sd * 30, 4], [sd * 42, 8], [sd * 56, 6]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" fill="none" stroke-linecap="round"/><path d="' + cpath([[sd * 32, 14], [sd * 44, 20], [sd * 56, 20]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" fill="none" stroke-linecap="round"/>';
    g += '<path d="' + cpath([[sd * 30, -6], [sd * 38, -14], [sd * 44, -24]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(2.4 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '</g>';
  // eyes
  var eo = o.eyes == null ? 1 : o.eyes, er = H([-21, -4]), el = H([21, -4]);
  g += catEye(er[0], er[1], 14 * s, 11 * s, o.pupil == null ? .35 : o.pupil, eo, o.glow, o.look) + catEye(el[0], el[1], 14 * s, 11 * s, o.pupil == null ? .35 : o.pupil, eo, o.glow, o.look);
  // nose, mouth, whisker pads, whiskers
  var n = [[-6, 12], [6, 12], [0, 19]].map(H);
  g += '<path d="M' + n.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + CNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" stroke-linejoin="round"/>';
  g += '<path d="' + cpath([[0, 19], [0, 25]].map(H), false) + ' M' + cpath([[-10, 28], [-5, 27], [0, 25]].map(H), false).slice(1) + ' M' + cpath([[0, 25], [5, 27], [10, 28]].map(H), false).slice(1) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none" stroke-linecap="round"/>';
  [[-1], [1]].forEach(function (q) { var sd = q[0];
    [[-10, 20], [-6, 23], [-12, 26]].forEach(function (p) { var c = H([sd * -p[0], p[1]]); g += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(1.2 * s) + '" fill="' + TAB_D + '"/>'; });
    var wk = o.whisk || 0;
    [[18, -10], [22, 0], [20, 10]].forEach(function (a, i) { var r0 = H([sd * 14, 20 + i * 3]), ang = (sd > 0 ? 0 : 180) + sd * (a[1] - wk * 40), L = (78 - i * 6) * s, rad = (ang + tl) * Math.PI / 180;
      var e1 = [r0[0] + Math.cos(rad) * L, r0[1] + Math.sin(rad) * L], m = [r0[0] + Math.cos(rad) * L * .5, r0[1] + Math.sin(rad) * L * .5 - 4 * s];
      g += '<path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e1[0]) + ' ' + f(e1[1]) + '" stroke="' + (o.whiskCol || "#f6f1e6") + '" stroke-width="' + f(2.6 * s) + '" fill="none" stroke-linecap="round"/><path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e1[0]) + ' ' + f(e1[1]) + '" stroke="' + INK + '" stroke-width="' + f(.8 * s) + '" fill="none" opacity=".5"/>'; });
  });
  return { svg: g, eyes: [er, el], nose: H([0, 15]), head: H([0, 0]) };
}
// the cat sitting in profile, facing right in its own coordinates (dir -1 mirrors it). o.ears: deg the near ear turns back
// (toward the viewer's left when facing right); o.head: deg (+ down); o.look; o.rub (0..1 head pushed forward and down)
function catSide(o) {
  o = o || {}; var s = o.s || 1, dir = o.dir || 1, t = window.__t || 0;
  function W(p) { return [o.x + dir * p[0] * s, o.y + p[1] * s]; }
  function Wl(a) { return a.map(W); }
  var g = "", tw = (o.tail || 0) + 8 * Math.sin(t * 1.4);
  // tail along the ground behind, tip lifting and twitching
  var tp = [[-50, -10], [-80, -4], [-110, -6], [-130, -16], [-136, -32]].map(function (p) { return rotP(p, [-50, -10], -tw * .25); });
  var tb = tube(Wl(tp), [16, 14, 13, 11, 8].map(function (v) { return v * s; }));
  g += '<path d="' + tb.fill + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var k = 1; k < 5; k++) { var q = W(tp[k]); g += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(4.5 * s) + '" fill="' + TAB_D + '" opacity=".7"/>'; }
  // body: haunch round at the back, chest upright in front
  var body = [[30, -150], [10, -146], [-20, -130], [-46, -100], [-62, -60], [-62, -24], [-50, 0], [40, 0], [44, -40], [40, -90], [44, -130]];
  var bp = Wl(body), bid = "cs" + (++CLIPN);
  g += '<path d="' + cpath(bp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  g += '<clipPath id="' + bid + '"><path d="' + cpath(bp, true) + '"/></clipPath><g clip-path="url(#' + bid + ')">';
  [[-10, -138], [-30, -118], [-46, -92], [-56, -64]].forEach(function (p) { g += '<path d="' + cpath(Wl([[p[0], p[1]], [p[0] + 14, p[1] + 18], [p[0] + 20, p[1] + 38]]), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(5 * s) + '" fill="none" stroke-linecap="round"/>'; });
  g += '<path d="' + cpath(Wl([[30, -140], [46, -120], [44, -80], [40, -50], [26, -70], [24, -120]]), true) + '" fill="' + TAB_L + '"/>';
  g += '<path d="' + cpath(Wl([[-60, -40], [-40, -70], [-10, -46], [-6, -4]]), false) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '" fill="none"/></g>';
  // front legs
  [[22, TAB_M], [34, TAB_L]].forEach(function (L, i) { var lg = tube(Wl([[L[0], -100], [L[0] + 2, -50], [L[0] + 3, -8]]), [20, 15, 13].map(function (v) { return v * s; }));
    g += '<path d="' + lg.fill + '" fill="' + (i ? TAB_L : TAB) + '"/><path d="' + lg.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>'; var pw = W([L[0] + 8, -5]);
    g += '<ellipse cx="' + f(pw[0]) + '" cy="' + f(pw[1]) + '" rx="' + f(14 * s) + '" ry="' + f(6.5 * s) + '" fill="' + (i ? TAB_L : TAB) + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>'; });
  // head on top, facing right; turns about the neck
  var rub = o.rub || 0, hd = (o.head || 0) + rub * 30, piv = [30, -146], H = function (p) { return W(rotP([piv[0] + (p[0] - piv[0]) * 1.32 - 6 + rub * 14, piv[1] + (p[1] - piv[1]) * 1.32 + 16 + rub * 6], piv, hd)); };
  var head = [[6, -150], [10, -176], [26, -192], [48, -194], [66, -182], [74, -168], [80, -160], [78, -152], [70, -146], [64, -140], [44, -132], [22, -134]];
  var ear = function (back, far) { var e = far ? 0 : (o.ears || 0), c = [32, -188];
    var pts = [[22, -186], [24, -212], [44, -196]].map(function (p) { return rotP(p, c, -e); });
    if (far) pts = [[34, -190], [44, -214], [54, -192]];
    return '<path d="M' + pts.map(H).map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + (far ? TAB_D : TAB) + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>' +
      (!far && e < 50 ? '<path d="M' + [[27, -188], [28, -206], [40, -194]].map(function (p) { return rotP(p, c, -e); }).map(H).map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + CEAR + '" opacity="' + f(1 - e / 60) + '"/>' : ""); };
  g += ear(0, 1);
  var hp = head.map(H);
  g += '<path d="' + cpath(hp, true) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  g += '<path d="' + cpath([[58, -150], [70, -146], [78, -152], [70, -140], [58, -138]].map(H), true) + '" fill="' + TAB_L + '"/>';
  [[20, -180, 30, -168], [16, -168, 28, -160], [36, -192, 40, -180]].forEach(function (a) { g += '<path d="' + cpath([[a[0], a[1]], [a[2], a[3]]].map(H), false) + '" stroke="' + TAB_D + '" stroke-width="' + f(3 * s) + '" stroke-linecap="round"/>'; });
  g += ear(0, 0);
  // eye (profile: a wedge), nose, mouth, whiskers
  var ec = H([60, -170]), eo = o.eyes == null ? 1 : o.eyes, ang = dir * hd;
  g += G("translate(" + f(ec[0]) + " " + f(ec[1]) + ") rotate(" + f(ang) + ") scale(" + dir + " 1)", eo > .1 ?
    '<path d="M-8 0 Q0 ' + f(-7 * s * eo) + ' 8 -1 Q2 ' + f(6 * s * eo) + ' -8 0 Z" fill="' + IRIS + '" stroke="' + INK + '" stroke-width="' + f(1.8 * s) + '"/><ellipse cx="2" cy="-1" rx="' + f(1.4 * s) + '" ry="' + f(4 * s * eo) + '" fill="#14110d"/>' :
    '<path d="M-8 0 Q0 3 8 -1" stroke="' + INK + '" stroke-width="2" fill="none"/>');
  var np = H([79, -158]);
  g += '<circle cx="' + f(np[0]) + '" cy="' + f(np[1]) + '" r="' + f(3.2 * s) + '" fill="' + CNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  g += '<path d="' + cpath([[76, -150], [70, -146], [64, -147]].map(H), false) + '" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>';
  var wk = o.whisk || 0;
  [-14, -4, 6].forEach(function (a) { var r0 = H([68, -152]), rad = (dir > 0 ? 0 : 180) * Math.PI / 180 + dir * (a - wk * 30 + hd) * Math.PI / 180, L = 64 * s;
    g += '<path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' l' + f(Math.cos(rad) * L) + ' ' + f(Math.sin(rad) * L) + '" stroke="#f6f1e6" stroke-width="' + f(2.4 * s) + '" stroke-linecap="round"/><path d="M' + f(r0[0]) + ' ' + f(r0[1]) + ' l' + f(Math.cos(rad) * L) + ' ' + f(Math.sin(rad) * L) + '" stroke="' + INK + '" stroke-width="' + f(.7 * s) + '" opacity=".5"/>'; });
  return { svg: g, ear: H([34, -200]), head: H([46, -164]), cheek: H([56, -148]), nose: np };
}
