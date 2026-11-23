// ── the dog: a medium short-coated mixed-breed («بلدي») dog drawn from real proportions (refs/SOURCES.md) ──
// Side view, facing right in its own coordinates (dir: -1 mirrors it). Units: the height at the withers = 100 at s = 1,
// body length (point of shoulder → point of buttock) ≈ 1.1 × that, head ≈ 0.42 × withers (skull ≈ muzzle, a clear stop),
// chest down to the elbow (≈ half the height), a tucked-up loin, the hind leg angled at the stifle and the hock, pricked
// ears and a tail carried up. Legs are one flowing outline each (no joint circles), like the person kit.
var FAWN = "#c99a62", FAWN_D = "#a8794a", FAWN_L = "#dcb784", CREAM = "#efe0c0", DNOSE = "#2b231c", EAR_IN = "#d9a186";
// a smooth outline through pts (quadratic through the midpoints)
function smooth(pts, close) {
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  var Lp = pts[pts.length - 1]; return d + (close ? " Q" + f(Lp[0]) + " " + f(Lp[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(Lp[0]) + " " + f(Lp[1]));
}
// a tapered limb through pts with a width at each point: {fill: closed, line: open at the top so it melts into the body}
function tube(pts, ws) {
  var Lf = [], Rt = [], n = pts.length;
  for (var i = 0; i < n; i++) {
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = ws[i] / 2;
    Lf.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Rt.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  var e = pts[n - 1], pe = pts[n - 2], dx2 = e[0] - pe[0], dy2 = e[1] - pe[1], dl = Math.hypot(dx2, dy2) || 1, tip = [e[0] + dx2 / dl * ws[n - 1] * .45, e[1] + dy2 / dl * ws[n - 1] * .45];
  var ring = Lf.concat([tip]).concat(Rt.slice().reverse());
  return { fill: smooth(ring, true), line: smooth(ring, false) };
}
function rotP(p, c, deg) { var a = deg * Math.PI / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; }
// a paw seen from the side: a rounded pad block with two toe creases; x,y = the ground point under it
function paw(w, col) { return '<path d="M' + f(-w * .45) + ' 0 C' + f(-w * .55) + ' ' + f(-w * .55) + ' ' + f(-w * .1) + ' ' + f(-w * .72) + ' ' + f(w * .3) + ' ' + f(-w * .6) + ' C' + f(w * .62) + ' ' + f(-w * .5) + ' ' + f(w * .72) + ' ' + f(-w * .2) + ' ' + f(w * .66) + ' 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M' + f(w * .22) + ' 0 q' + f(w * .02) + ' ' + f(-w * .2) + ' ' + f(-w * .02) + ' ' + f(-w * .34) + ' M' + f(w * .46) + ' 0 q' + f(w * .02) + ' ' + f(-w * .16) + ' ' + f(-w * .04) + ' ' + f(-w * .28) + '" stroke="' + INK + '" stroke-width="1.1" fill="none"/>'; }
// leg chains in dog units (facing right). Front: shoulder → elbow → wrist (carpus) → paw. Hind: hip → stifle → hock → paw.
function frontLeg(sw, lift) {
  var top = [38, -76], el = rotP([27, -50], top, sw), wr = rotP([29, -17], top, sw), pw = rotP([32, -6], top, sw);
  if (lift) { wr = [wr[0] - 5 * lift, wr[1] - 6 * lift]; pw = [wr[0] + 6 - 3 * lift, wr[1] + 10 - 3 * lift]; }
  return { pts: [top, el, wr, pw], ws: [22, 13, 9, 8.5], paw: pw };
}
function hindLeg(sw, lift) {
  var top = [-42, -74], st = rotP([-31, -46], top, sw), hk = rotP([-50, -22], top, sw), pw = rotP([-47, -6], top, sw);
  if (lift) { hk = [hk[0] - 3 * lift, hk[1] - 7 * lift]; pw = [hk[0] + 5 + 2 * lift, hk[1] + 15 - 5 * lift]; }
  return { pts: [top, st, hk, pw], ws: [32, 17, 8.5, 8.5], paw: pw };
}
// o: {x, y (ground under the middle of the body), s, dir, ph (walk phase, radians), walk (0..1), head (deg, + nose down),
//     tail (deg, wag), sniff (0..1 nostril twitch), mouth (0..1 open, panting), eyes (0..1), legsUp: lift all paws (sitting not used)}
// returns {svg, nose: [x,y] world point of the nose tip, eye: [x,y], head: [x,y] world centre of the skull}
function dog(o) {
  o = o || {}; var s = o.s || 1, dir = o.dir || 1, ph = o.ph || 0, wk = o.walk || 0, hd = o.head || 0, tl = o.tail || 0;
  var bob = wk ? -1.5 * Math.abs(Math.sin(ph)) : 0;
  function W(p) { return [o.x + dir * p[0] * s, o.y + (p[1] + bob) * s]; }
  function Wl(pts) { return pts.map(W); }
  function leg(L, col, colD) {
    var tb = tube(Wl(L.pts), L.ws.map(function (v) { return v * s; })), pw = W(L.paw);
    return '<path d="' + tb.fill + '" fill="' + col + '"/>' + '<path d="' + tb.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' +
      G("translate(" + f(pw[0] + dir * 3 * s) + " " + f(pw[1] + 6 * s) + ") scale(" + dir + " 1)", paw(15 * s, colD || col));
  }
  var swF = wk * 20 * Math.sin(ph), swH = -wk * 20 * Math.sin(ph), lfF = wk * clamp(Math.cos(ph)) * .9, lfH = wk * clamp(-Math.cos(ph)) * .9;
  var swF2 = wk * 20 * Math.sin(ph + Math.PI), swH2 = -wk * 20 * Math.sin(ph + Math.PI), lfF2 = wk * clamp(Math.cos(ph + Math.PI)) * .9, lfH2 = wk * clamp(-Math.cos(ph + Math.PI)) * .9;
  var svg = "";
  // far legs (darker, a step behind)
  svg += leg(frontLeg(swF2 - 4, lfF2), FAWN_D, FAWN_D) + leg(hindLeg(swH2 + 3, lfH2), FAWN_D, FAWN_D);
  // tail: set at the croup, carried up in a loose curve, wagging about its root
  var tr = [-50, -94], tp = [[-50, -94], [-64, -106], [-71, -122], [-68, -137], [-58, -143]].map(function (p) { return rotP(p, tr, -tl); });
  var tb = tube(Wl(tp), [11, 10, 8.5, 6.5, 3.5].map(function (v) { return v * s; }));
  svg += '<path d="' + tb.fill + '" fill="' + FAWN + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>';
  // torso: withers → back → croup → buttock → thigh → tucked belly → brisket → chest front
  var torso = [[22, -101], [0, -98], [-24, -97], [-42, -97], [-54, -92], [-61, -80], [-62, -66], [-56, -54], [-44, -50], [-34, -58], [-20, -63], [0, -57], [18, -48], [32, -45], [44, -50], [52, -62], [55, -76], [48, -92]];
  var tp2 = Wl(torso), td = smooth(tp2, true);
  svg += '<path d="' + td + '" fill="' + FAWN + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>';
  // shade under the belly and at the back of the thigh, light hatching on the far side, a few hair strokes
  var cid = "dg" + (++CLIPN);
  svg += '<clipPath id="' + cid + '"><path d="' + td + '"/></clipPath><g clip-path="url(#' + cid + ')">' +
    '<path d="' + smooth(Wl([[-60, -58], [-36, -54], [-16, -58], [8, -48], [36, -46], [36, -36], [-60, -36]]), true) + '" fill="' + FAWN_D + '" opacity=".5"/>' +
    '<path d="' + smooth(Wl([[-24, -72], [-8, -67], [12, -61], [28, -62]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.8 * s) + '" fill="none" opacity=".7"/>' +
    '<path d="' + smooth(Wl([[-40, -94], [-32, -82], [-34, -66]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +
    '<path d="' + smooth(Wl([[26, -97], [31, -84], [32, -70]]), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +
    '<path d="' + smooth(tp2.slice(0, 9), false) + '" fill="none" stroke="' + FAWN_L + '" stroke-width="' + f(5 * s) + '" opacity=".6" transform="translate(0 ' + f(4 * s) + ')"/></g>';
  // near legs, over the body: the outline is open at the top so the leg melts into the shoulder / thigh
  svg += leg(hindLeg(swH + 3, lfH), FAWN, FAWN) + leg(frontLeg(swF - 2, lfF), FAWN, FAWN);
  // neck + head, turning about the base of the neck (head > 0 = nose down to sniff the floor)
  var piv = [40, -90], H = function (p) { return W(rotP(p, piv, hd)); }, HF = function (p) { return H([58 + (p[0] - 60) * .72, -131 + (p[1] + 146) * .7]); };
  var sn = o.sniff ? Math.sin(window.__t * 26) * o.sniff : 0, mo = clamp(o.mouth || 0);
  var nh = [[20, -100], [32, -110], [44, -121], [53, -129], [60, -133], [69, -137.5], [78, -136], [84, -130], [94, -126.5], [100, -125], [104, -122], [104.6, -118],
            [103, -115], [98, -113 + 3 * mo], [90, -109 + 6 * mo], [84, -106 + 3 * mo], [76, -105], [66, -101], [60, -90], [56, -78], [50, -68]];
  // far ear, then the head, then the near ear
  var ear = function (dx, col, inner) { var tip = [60 + dx - 1.5 * sn, -163];
    var p = [[55 + dx, -131], [54 + dx, -145], tip, [66 + dx, -150], [71 + dx, -134]].map(H);
    var q = [[58.5 + dx, -134], [58 + dx, -146], [60.5 + dx - 1.2 * sn, -157], [64.5 + dx, -147], [67 + dx, -135]].map(H);
    return '<path d="' + smooth(p, true) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' + (inner ? '<path d="' + smooth(q, true) + '" fill="' + EAR_IN + '" opacity=".9"/><path d="' + smooth([[60 + dx, -137], [61 + dx, -148]].map(H), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.2 * s) + '" fill="none"/>' : ""); };
  svg += ear(-7, FAWN_D, false);
  var hp = nh.map(H), hdP = smooth(hp, false), hdF = smooth(hp, true);
  if (mo > .05) svg += '<path d="' + smooth([[116, -122], [106, -116], [100, -114], [106, -112 + 7 * mo], [118, -121 + 4 * mo]].map(HF), true) + '" fill="#8a3e34" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>' +
    '<path d="' + smooth([[104, -116], [112, -118 + 4 * mo], [117, -118 + 5 * mo]].map(HF), false) + '" stroke="#d9837a" stroke-width="' + f(4 * s * mo) + '" fill="none" stroke-linecap="round"/>';
  svg += '<path d="' + hdF + '" fill="' + FAWN + '"/>';
  var hid = "dh" + (++CLIPN);
  svg += '<clipPath id="' + hid + '"><path d="' + hdF + '"/></clipPath><g clip-path="url(#' + hid + ')">' +
    '<path d="' + smooth([[56, -76], [62, -96], [72, -104], [84, -106], [98, -112], [106, -112], [106, -100], [60, -60]].map(H), true) + '" fill="' + CREAM + '"/>' +   // pale throat and lower jaw
    '<path d="' + smooth([[96, -142], [110, -138], [122, -134]].map(HF), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(3 * s) + '" fill="none" opacity=".7"/>' +   // muzzle ridge
    '<path d="' + smooth([[64, -110], [72, -122], [70, -136]].map(HF), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>' +   // cheek line
    '<path d="' + smooth([[20, -100], [34, -112], [46, -123], [56, -131]].map(H), false) + '" stroke="' + FAWN_D + '" stroke-width="' + f(6 * s) + '" fill="none" opacity=".45"/></g>';
  svg += '<path d="' + hdP + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linejoin="round"/>';
  // the nose leather: a dark rounded block at the tip with the nostril and its side slit (the slit is what the dog breathes out of)
  var np = [[116, -138], [122, -137.5], [125.5, -134], [126, -129], [123.5, -126], [118, -126.5], [116.5, -131]].map(HF);
  svg += '<path d="' + smooth(np, true) + '" fill="' + DNOSE + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>';
  var nn = HF([121.5 + .6 * sn, -131]);
  svg += '<ellipse cx="' + f(nn[0]) + '" cy="' + f(nn[1]) + '" rx="' + f(2.1 * s) + '" ry="' + f(1.5 * s + .4 * Math.abs(sn) * s) + '" fill="#0d0a08"/>' +
    '<path d="' + smooth([[121, -130], [119, -128.5], [117.6, -127.4]].map(HF), false) + '" stroke="#0d0a08" stroke-width="' + f(1.1 * s) + '" fill="none"/>' +
    '<path d="' + smooth([[118.5, -136], [122, -135.4]].map(HF), false) + '" stroke="#6b6158" stroke-width="' + f(1.2 * s) + '" fill="none" stroke-linecap="round"/>';
  // mouth line and whisker spots
  svg += '<path d="' + smooth([[122, -125.5], [118, -123], [110, -119.5 + 3 * mo], [102, -117 + 2 * mo], [99, -118 + mo]].map(HF), false) + '" stroke="' + INK + '" stroke-width="' + f(1.5 * s) + '" fill="none" stroke-linecap="round"/>';
  [[96, -120.5], [92.5, -119], [94.5, -123], [90.5, -121.5]].forEach(function (p) { var q = H(p); svg += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(.75 * s) + '" fill="' + FAWN_D + '"/>'; });
  // the eye: almond, dark brown iris filling it, a highlight, a lid line; o.eyes closes it
  var ec = HF([89, -141]), eo = o.eyes == null ? 1 : o.eyes, er = 3.7 * s, eh = 2.6 * s * eo, ang = (hd * dir) + (dir < 0 ? 0 : 0);
  svg += G("translate(" + f(ec[0]) + " " + f(ec[1]) + ") rotate(" + f(ang + dir * -8) + ")",
    (eo > .08 ? '<ellipse rx="' + f(er) + '" ry="' + f(Math.max(.4, eh)) + '" fill="#3a2414" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/><circle cx="' + f(dir * .9 * s) + '" cy="' + f(-.3 * s) + '" r="' + f(1.9 * s * Math.min(1, eo + .2)) + '" fill="#0d0a08"/><circle cx="' + f(dir * 2 * s) + '" cy="' + f(-1.2 * s) + '" r="' + f(.9 * s) + '" fill="#fff"/>' : '<path d="M' + f(-er) + ' 0 Q0 ' + f(1.6 * s) + ' ' + f(er) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>') +
    '<path d="M' + f(-er * 1.3) + ' ' + f(-eh - 1.6 * s) + ' Q0 ' + f(-eh - 3.8 * s) + ' ' + f(er * 1.25) + ' ' + f(-eh - 1.2 * s) + '" stroke="' + FAWN_D + '" stroke-width="' + f(1.6 * s) + '" fill="none" stroke-linecap="round"/>');
  svg += ear(0, FAWN, true);
  // collar
  var c1 = H([35, -110]), c2 = H([55, -96]);
  svg += '<path d="M' + f(c1[0]) + ' ' + f(c1[1]) + ' L' + f(c2[0]) + ' ' + f(c2[1]) + '" stroke="' + INK + '" stroke-width="' + f(8 * s) + '" stroke-linecap="round"/><path d="M' + f(c1[0]) + ' ' + f(c1[1]) + ' L' + f(c2[0]) + ' ' + f(c2[1]) + '" stroke="' + BLUE + '" stroke-width="' + f(5 * s) + '" stroke-linecap="round"/>';
  var tagp = H([53, -93]); svg += '<circle cx="' + f(tagp[0]) + '" cy="' + f(tagp[1] + 5 * s) + '" r="' + f(3.4 * s) + '" fill="#d9b44a" stroke="' + INK + '" stroke-width="' + f(1.2 * s) + '"/>';
  return { svg: svg, nose: HF([126, -130]), eye: ec, head: HF([84, -134]), tailTip: W(tp[4]) };
}
// a shadow on the floor under a dog or a person
function shadow(x, y, rx) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(rx * .09) + '" fill="' + INK + '" opacity=".12"/>'; }
