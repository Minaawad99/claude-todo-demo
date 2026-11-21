/* «إيه الحكاية؟» — the detailed person (front / three-quarter view), after the look the channel picked from its Gemini
   cover (videos/person-demo): a face with eyes, brows, nose, mouth and expressions; hands with five fingers in poses;
   a sweater with ribbed collar, cuffs and hem; folds and soft shading. Joints keep the real body proportions used in every
   sketch episode (Drillis & Contini, H = 400 units at s = 1):
     hip joint 0.52H · shoulder 0.818H · chin 0.87H · top of head 1.0H
     thigh 0.245H · shank 0.246H · upper arm 0.186H · forearm 0.146H · hand 0.108H (palm 0.06H + middle finger 0.048H)
     shoulder joints 0.22H apart · hip joints 0.10H apart · head 0.13H tall, 0.093H wide · neck 0.065H wide
   Needs the shared helpers (_helpers.js: f, G, C, lerp, clamp, ease, INK, SKIN…). Everything is redrawn from the pose, so a
   pose can be tweened (personMix) and the render stays deterministic.

   person(o) — o.x, o.y: the point between the hip joints; o.s: scale.
     o.lean (deg, + leans to the viewer's right) · o.slump (0..1: shoulders drop, head sinks) · o.breath (0..1)
     o.legs: "stand" | "sit" | {k: [[dx,dy],[dx,dy]], a: [[dx,dy],[dx,dy]]} knee and ankle offsets from each hip joint (units)
     o.arms: [viewer-left arm, viewer-right arm], each {to: [x, y] wrist target in world coords | rel: [dx, dy] from the
             shoulder in units, bend: ±1 (elbow side), hand: "open" | "relaxed" | "flat" | "fist" | "point" | "thumb",
             rot: hand angle in deg (default: along the forearm), palm: true to show the palm}
     o.head: {tilt (deg), turn (-1..1, three-quarter turn), nod (0..1, chin to chest)}
     o.face: {eyes (0 closed .. 1 open, 1.25 wide), look [dx, dy] (-1..1), brows: "neutral" | "raised" | "worried" | "angry",
             mouth: "neutral" | "smile" | "grin" | "open" | "o" | "frown" | "yawn", tired: bool}
     o.colors: {shirt, shirtD, pants, pantsD, hair, skin, skinD, socks}
   returns {svg, joints}: joints has the shoulder, elbow, wrist, hip, knee, ankle points and the head centre. */
var PSN = { skin: "#e0a98a", skinD: "#c07f62", skinL: "#efc3a8", lip: "#b56b5c", hair: "#2f2620", hairL: "#4d3f34",
  shirt: "#a9c3dc", shirtD: "#7f9bb6", pants: "#3d3c3f", pantsD: "#2a292c", socks: "#56565c", white: "#fbf8f1", iris: "#4a3426" };
function pPath(pts, close) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1])); }
function pLine(pts, col, w, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function pIK(sh, tg, l1, l2, bend) { var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, .01)))); return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1]; }
// a limb segment: ink outline, fill, and a shadow strip on the side away from the light (upper left)
function pTube(a, b, w1, w2, col, colD, s) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, sd = (nx * .7 + ny * -.7) > 0 ? 1 : -1;   // shade on the right/lower side
  var P = [[a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2], [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2]];
  var poly = "M" + P.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  var sh = [[a[0] - sd * nx * w1 * .3 + dx * .08, a[1] - sd * ny * w1 * .3 + dy * .08], [b[0] - sd * nx * w2 * .3 - dx * .08, b[1] - sd * ny * w2 * .3 - dy * .08]];
  return { ink: '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(w1 / 2 + 1.3 * s) + '" fill="' + INK + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(w2 / 2 + 1.3 * s) + '" fill="' + INK + '"/><path d="' + poly + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="' + f(2.6 * s) + '" stroke-linejoin="round"/>',
    fill: '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(w1 / 2) + '" fill="' + col + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(w2 / 2) + '" fill="' + col + '"/><path d="' + poly + '" fill="' + col + '"/>' +
      pLine(sh, colD, Math.min(w1, w2) * .32, ' opacity=".75"') };
}
// ── the hand: wrist point w, direction ang (radians, wrist → fingertips), side ±1 puts the thumb on one side ──
// palm 24 × 20 units, fingers index 17 · middle 19 · ring 18 · little 14, thumb 15 (H = 400)
function pHand(w, ang, kind, side, s, colors, palm) {
  var c = colors || PSN, ca = Math.cos(ang), sa = Math.sin(ang);
  function P(x, y) { y *= side; return [w[0] + (x * ca - y * sa) * s, w[1] + (x * sa + y * ca) * s]; }
  function finger(bx, by, a0, len, wd, curl) {   // two segments; curl foreshortens the finger toward the viewer and bends it a little
    var k1 = len * .56 * (1 - .45 * curl), k2 = len * .44 * (1 - .75 * curl), a1 = a0 * Math.PI / 180, a2 = a1 + curl * .5;
    var p0 = [bx, by], p1 = [bx + Math.cos(a1) * k1, by + Math.sin(a1) * k1], p2 = [p1[0] + Math.cos(a2) * k2, p1[1] + Math.sin(a2) * k2];
    var q = [P(p0[0], p0[1]), P(p1[0], p1[1]), P(p2[0], p2[1])];
    return { ink: pLine(q, INK, (wd + 2.4) * s), fill: pLine(q, c.skin, wd * s) + pLine([P(p1[0] - Math.cos(a1) * 1.2, p1[1] - Math.sin(a1) * 1.2 + wd * .35), P(p1[0] - Math.cos(a1) * 1.2, p1[1] - Math.sin(a1) * 1.2 - wd * .35)], c.skinD, .9 * s), tip: q[2] };
  }
  var F = { open: [[-16, 0], [-5, 0], [6, 0], [17, 0], -58, 0], relaxed: [[-6, .45], [-2, .5], [3, .55], [8, .6], -38, .2], flat: [[-3, 0], [-1, 0], [1, 0], [3, 0], -22, 0],
            fist: [[0, 1], [0, 1], [0, 1], [0, 1], 20, .6], point: [[-2, 0], [0, 1], [0, 1], [0, 1], 10, .5], thumb: [[0, 1], [0, 1], [0, 1], [0, 1], -88, 0] }[kind] || null;
  F = F || [[-6, .45], [-2, .5], [3, .55], [8, .6], -38, .2];
  var bases = [[23, -7], [24.5, -2.4], [24, 2.4], [22, 6.8]], lens = [17, 19, 18, 14], wds = [4.6, 4.8, 4.5, 3.9];
  var palmPts = [[0, -6.5], [4, -11], [11, -12.5], [21, -10], [25, -6], [25.5, 2], [23, 9.5], [12, 11], [3, 9], [0, 6]].map(function (p) { return P(p[0], p[1]); });
  var ink = "", fill = "", fing = [];
  for (var i = 0; i < 4; i++) {
    var cu = F[i][1];
    if (cu >= .99) { var kb = P(bases[i][0] + 2.5, bases[i][1]); fing.push({ ink: '<circle cx="' + f(kb[0]) + '" cy="' + f(kb[1]) + '" r="' + f((wds[i] / 2 + 1.4) * s) + '" fill="' + INK + '"/>', fill: '<circle cx="' + f(kb[0]) + '" cy="' + f(kb[1]) + '" r="' + f(wds[i] / 2 * s) + '" fill="' + c.skin + '"/>' }); }
    else fing.push(finger(bases[i][0], bases[i][1], F[i][0], lens[i], wds[i], cu));
  }
  var ta = F[4], th = kind === "fist" || kind === "point" ? finger(10, -8, 22, 12, 5.4, .1) : finger(9, -9.5, ta, 14, 5.6, F[5]);
  fing.forEach(function (q) { ink += q.ink; });
  var palmD = "M" + palmPts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  var out = ink + '<path d="' + palmD + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="' + f(2.6 * s) + '" stroke-linejoin="round"/>';
  fing.forEach(function (q) { out += q.fill; });
  out += '<path d="' + palmD + '" fill="' + c.skin + '"/>';
  if (kind === "fist" || kind === "point" || kind === "thumb") { var k0 = P(24, -8), k3 = P(24, 8); out += pLine([k0, P(26.5, -3), P(26.5, 3), k3], INK, 1.4 * s); for (var j = 0; j < 3; j++) { var kk = P(23, -4.6 + j * 4.6); out += pLine([kk, P(26, -4.6 + j * 4.6)], c.skinD, 1 * s); } }
  else out += pLine([P(9, 7), P(20, 6)], c.skinD, 1 * s) + (palm ? pLine([P(6, -4), P(16, 1), P(21, 3)], c.skinD, 1 * s) : pLine([P(20, -6), P(21, -2)], c.skinD, .9 * s));
  out += th.ink + th.fill;
  return out;
}
// ── the head: centre hc, local units (head 52 tall, 37 wide); turn shifts the features for a three-quarter view ──
function pHead(hc, s, rot, o, c) {
  var fc = o.face || {}, hd = o.head || {}, tr = hd.turn || 0, eo = fc.eyes == null ? 1 : fc.eyes, look = fc.look || [0, 0], mo = fc.mouth || "neutral", br = fc.brows || "neutral";
  var g = "", X = function (u) { return u + tr * 4.5; };
  var shape = [[0, -27.5], [12, -26], [18.4, -15], [18.8, -2], [17, 9], [12.5, 18.5], [6, 24.5], [0, 26.2], [-6, 24.5], [-12.5, 18.5], [-17, 9], [-18.8, -2], [-18.4, -15], [-12, -26]].map(function (p) { return [p[0] - tr * (p[0] > 0 ? 1.5 : -.5), p[1]]; });
  var ear = function (sd) { var ex = sd * (18.6 - tr * sd * 1.4); return '<path d="M' + f(ex) + ' -5 C' + f(ex + sd * 6) + ' -8 ' + f(ex + sd * 6.5) + ' 6 ' + f(ex + sd * .5) + ' 8 Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M' + f(ex + sd * 1.5) + ' -2 C' + f(ex + sd * 4) + ' -3 ' + f(ex + sd * 4) + ' 3 ' + f(ex + sd * 1.5) + ' 4" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>'; };
  g += ear(-1) + ear(1);
  g += '<path d="' + pPath(shape, true) + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // shading: the far cheek and jaw, a soft shadow under the hair line
  g += '<path d="M' + f(X(9)) + ' -12 C' + f(X(17)) + ' -6 ' + f(X(16)) + ' 12 ' + f(X(6)) + ' 23 C' + f(X(13)) + ' 18 17 8 18.4 -2 C18.4 -9 16 -13 ' + f(X(9)) + ' -12 Z" fill="' + c.skinD + '" opacity=".45"/>';
  // hair: a full dark cap with a short fringe, a few lighter strands
  var hair = [[-19.5, -2], [-20.5, -16], [-14, -28.5], [-2, -32.5], [11, -31], [19.5, -21], [20, -4], [17.5, -9], [16, -15.5], [X(9), -17.5], [X(3), -15], [X(-2), -18], [X(-9), -16], [-15.5, -14], [-17.5, -7]];
  g += '<path d="' + pPath(hair, true) + '" fill="' + c.hair + '" stroke="' + INK + '" stroke-width="1.8"/>';
  g += pLine([[-12, -27], [-6, -23], [0, -24]], c.hairL, 1.2) + pLine([[2, -29], [8, -25], [12, -25]], c.hairL, 1.2) + pLine([[-17, -18], [-14, -13]], c.hairL, 1.1);
  // brows
  var bv = { neutral: [0, 0], raised: [-3, 0], worried: [-1.5, -2.6], angry: [1, 2.4] }[br] || [0, 0];
  [-1, 1].forEach(function (sd) { var cx = X(sd * 7.6), inner = cx - sd * 3.6, outer = cx + sd * 4.2, y0 = -8.2 + bv[0];
    g += '<path d="M' + f(inner) + ' ' + f(y0 + bv[1] * .5 + (br === "worried" ? -1 : 0)) + ' Q' + f(cx) + ' ' + f(y0 - 2.2) + ' ' + f(outer) + ' ' + f(y0 + 1 - bv[1] * .3) + '" stroke="' + c.hair + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; });
  // eyes: almond whites, iris and pupil looking at look[], upper lid heavier; closed = a curved lid line with lashes
  [-1, 1].forEach(function (sd) {
    var cx = X(sd * 7.6), cy = -1.5, w = sd * tr > 0 ? 3.2 : 3.7, hh = 2.9 * eo, id = "ey" + (++CLIPN);
    if (eo < .12) { g += '<path d="M' + f(cx - w) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy + 2.6) + ' ' + f(cx + w) + ' ' + f(cy) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' + pLine([[cx - w * .5, cy + 1.6], [cx - w * .6, cy + 3]], INK, .9) + pLine([[cx + w * .3, cy + 1.9], [cx + w * .35, cy + 3.2]], INK, .9); }
    else {
      var eye = 'M' + f(cx - w) + ' ' + f(cy) + ' Q' + f(cx - w * .2) + ' ' + f(cy - hh * 1.25) + ' ' + f(cx + w) + ' ' + f(cy - hh * .15) + ' Q' + f(cx + w * .2) + ' ' + f(cy + hh * .9) + ' ' + f(cx - w) + ' ' + f(cy) + ' Z';
      g += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath><path d="' + eye + '" fill="' + PSN.white + '"/>';
      g += '<g clip-path="url(#' + id + ')"><circle cx="' + f(cx + look[0] * 1.6 + tr * .8) + '" cy="' + f(cy - hh * .1 + look[1] * 1) + '" r="2.15" fill="' + PSN.iris + '"/><circle cx="' + f(cx + look[0] * 1.6 + tr * .8) + '" cy="' + f(cy - hh * .1 + look[1] * 1) + '" r="1.05" fill="#140d08"/><circle cx="' + f(cx + look[0] * 1.6 + tr * .8 - .7) + '" cy="' + f(cy - hh * .1 + look[1] - .8) + '" r=".55" fill="#fff"/>' +
           (eo < .7 ? '<rect x="' + f(cx - w - 1) + '" y="' + f(cy - 4) + '" width="' + f(2 * w + 2) + '" height="' + f(3.6 * (1 - eo / .7) + .5) + '" fill="' + c.skinD + '"/>' : "") + '</g>';
      g += '<path d="M' + f(cx - w - .4) + ' ' + f(cy + .2) + ' Q' + f(cx - w * .2) + ' ' + f(cy - hh * 1.25 - .4) + ' ' + f(cx + w + .3) + ' ' + f(cy - hh * .15) + '" stroke="' + INK + '" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      g += '<path d="M' + f(cx - w * .5) + ' ' + f(cy + hh * .55) + ' Q' + f(cx + w * .2) + ' ' + f(cy + hh * .8) + ' ' + f(cx + w * .8) + ' ' + f(cy + hh * .2) + '" stroke="' + c.skinD + '" stroke-width=".9" fill="none"/>';
    }
    if (fc.tired) g += '<path d="M' + f(cx - w * .7) + ' ' + f(cy + 3.4) + ' Q' + f(cx) + ' ' + f(cy + 5.2) + ' ' + f(cx + w * .8) + ' ' + f(cy + 3.2) + '" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>';
  });
  // nose: a side line, the tip and one nostril, a little shadow
  var nx = X(tr * 2);
  g += '<path d="M' + f(nx - .6) + ' -2 C' + f(nx + .4) + ' 3 ' + f(nx + 2.6) + ' 6 ' + f(nx + 2.4) + ' 8.4 C' + f(nx + 1.4) + ' 10 ' + f(nx - 1.4) + ' 10 ' + f(nx - 2.6) + ' 9.2" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
       '<path d="M' + f(nx - 3.3) + ' 8.1 q-1.2 1.4 .6 2" stroke="' + INK + '" stroke-width="1.1" fill="none"/><path d="M' + f(nx + 1) + ' 0 C' + f(nx + 2.5) + ' 4 ' + f(nx + 3.4) + ' 7 ' + f(nx + 2.6) + ' 9" stroke="' + c.skinD + '" stroke-width="2" fill="none" opacity=".55"/>';
  // mouth
  var mx = X(tr * 1.5), my = 15;
  var M = {
    neutral: '<path d="M' + f(mx - 5) + ' ' + my + ' Q' + f(mx) + ' ' + f(my + .9) + ' ' + f(mx + 5) + ' ' + f(my - .2) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M' + f(mx - 3) + ' ' + f(my + 2.8) + ' Q' + f(mx) + ' ' + f(my + 3.8) + ' ' + f(mx + 3) + ' ' + f(my + 2.8) + '" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>',
    smile: '<path d="M' + f(mx - 6) + ' ' + f(my - 1.2) + ' Q' + f(mx) + ' ' + f(my + 4.2) + ' ' + f(mx + 6) + ' ' + f(my - 1.4) + '" stroke="' + INK + '" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M' + f(mx - 7.2) + ' ' + f(my - 2.4) + ' q.6 1 1.4 1.2 M' + f(mx + 7.2) + ' ' + f(my - 2.6) + ' q-.6 1 -1.4 1.2" stroke="' + INK + '" stroke-width="1.1" fill="none"/>',
    grin: '<path d="M' + f(mx - 6.5) + ' ' + f(my - 1.5) + ' Q' + f(mx) + ' ' + f(my - .2) + ' ' + f(mx + 6.5) + ' ' + f(my - 1.7) + ' Q' + f(mx) + ' ' + f(my + 7) + ' ' + f(mx - 6.5) + ' ' + f(my - 1.5) + ' Z" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M' + f(mx - 5.6) + ' ' + f(my - 1.2) + ' Q' + f(mx) + ' ' + f(my + .2) + ' ' + f(mx + 5.6) + ' ' + f(my - 1.4) + ' L' + f(mx + 4.6) + ' ' + f(my + 1) + ' Q' + f(mx) + ' ' + f(my + 2.2) + ' ' + f(mx - 4.6) + ' ' + f(my + 1) + ' Z" fill="#fff"/>',
    open: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1.5) + '" rx="4.2" ry="3.2" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(mx - 2.6) + ' ' + f(my + 3.5) + ' q2.6 -1.6 5.2 0" fill="' + PSN.lip + '"/>',
    o: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1.6) + '" rx="2.6" ry="3.4" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6"/>',
    frown: '<path d="M' + f(mx - 5) + ' ' + f(my + 1.6) + ' Q' + f(mx) + ' ' + f(my - 2) + ' ' + f(mx + 5) + ' ' + f(my + 1.4) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    yawn: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 2.8) + '" rx="5" ry="6.2" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.7"/><path d="M' + f(mx - 3) + ' ' + f(my + 6.6) + ' q3 -2.2 6 0" fill="' + PSN.lip + '"/><path d="M' + f(mx - 3.4) + ' ' + f(my - 2) + ' h6.8" stroke="#fff" stroke-width="1.4"/>'
  };
  g += M[mo] || M.neutral;
  // jaw shadow and chin line
  g += '<path d="M' + f(X(-3)) + ' 22.5 Q' + f(X(0)) + ' 23.8 ' + f(X(3)) + ' 22.5" stroke="' + c.skinD + '" stroke-width="1" fill="none"/>';
  return G("translate(" + f(hc[0]) + " " + f(hc[1]) + ") rotate(" + f(rot) + ") scale(" + f(s) + ")", g);
}
var PLEGS = { stand: { k: [[-1.5, 98], [1.5, 98]], a: [[-1, 196], [1, 196]] }, sit: { k: [[-10, 18], [10, 18]], a: [[-11, 102], [11, 102]] } };
function person(o) {
  var s = o.s || 1, c = {}, k; for (k in PSN) c[k] = PSN[k]; if (o.colors) for (k in o.colors) c[k] = o.colors[k];
  var lean = (o.lean || 0) * Math.PI / 180, sl = o.slump || 0, br = (o.breath || 0) * 1.6;
  var up = [Math.sin(lean), -Math.cos(lean)], rt = [Math.cos(lean), Math.sin(lean)], H = [o.x, o.y];
  function T(h, x) { return [H[0] + (up[0] * h + rt[0] * x) * s, H[1] + (up[1] * h + rt[1] * x) * s]; }   // trunk frame: h up from the hips, x to the viewer's right
  var hSh = 114 - 10 * sl + br, hNeck = 120 - 10 * sl + br, hd = o.head || {}, nod = hd.nod || 0;
  var legs = typeof o.legs === "object" ? o.legs : PLEGS[o.legs || "stand"], svg = "", J = { hip: [], knee: [], ankle: [], sh: [], el: [], wr: [] };
  // ── legs: trousers to the ankle, socks and feet ──
  var legInk = "", legFill = "", feet = "";
  [-1, 1].forEach(function (sd, i) {
    var hp = [H[0] + sd * 20 * s, H[1] + 2 * s], kn = [hp[0] + legs.k[i][0] * s, H[1] + legs.k[i][1] * s], an = [hp[0] + legs.a[i][0] * s, H[1] + legs.a[i][1] * s];
    J.hip.push(hp); J.knee.push(kn); J.ankle.push(an);
    var sitK = Math.hypot(kn[0] - hp[0], kn[1] - hp[1]) < 60 * s, t1 = pTube(hp, kn, 40 * s, sitK ? 34 * s : 27 * s, c.pants, c.pantsD, s), t2 = pTube(kn, [an[0], an[1] - 6 * s], sitK ? 30 * s : 26 * s, 22 * s, c.pants, c.pantsD, s);
    legInk += t1.ink + t2.ink; legFill += t2.fill + t1.fill;
    if (sitK) legFill += '<ellipse cx="' + f(kn[0]) + '" cy="' + f(kn[1] + 2 * s) + '" rx="' + f(17 * s) + '" ry="' + f(13 * s) + '" fill="' + c.pants + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[kn[0] - 9 * s, kn[1] + 6 * s], [kn[0] - 2 * s, kn[1] + 9 * s], [kn[0] + 7 * s, kn[1] + 6 * s]], c.pantsD, 1.4 * s);
    else legFill += pLine([[kn[0] - 7 * s, kn[1] - 3 * s], [kn[0] + 1 * s, kn[1] + 1 * s], [kn[0] + 7 * s, kn[1] - 2 * s]], c.pantsD, 1.3 * s);
    legFill += pLine([[an[0] + sd * 3 * s, kn[1] + 20 * s], [an[0] + sd * 2 * s, an[1] - 14 * s]], c.pantsD, 1.1 * s, ' opacity=".7"');
    // the foot seen from the front: a sock, toes pointing slightly out, a sole line on the floor
    var fx = an[0] + sd * 3 * s, fy = an[1] + 14 * s;
    feet += '<path d="M' + f(an[0] - 10 * s) + ' ' + f(an[1] - 6 * s) + ' L' + f(an[0] + 10 * s) + ' ' + f(an[1] - 6 * s) + ' L' + f(fx + 13 * s + sd * 3 * s) + ' ' + f(fy - 3 * s) + ' Q' + f(fx + 14 * s + sd * 4 * s) + ' ' + f(fy + 2 * s) + ' ' + f(fx + 6 * s) + ' ' + f(fy + 2 * s) + ' L' + f(fx - 8 * s) + ' ' + f(fy + 2 * s) + ' Q' + f(fx - 15 * s + sd * 2 * s) + ' ' + f(fy + 1 * s) + ' ' + f(fx - 13 * s + sd * 2 * s) + ' ' + f(fy - 4 * s) + ' Z" fill="' + c.socks + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' +
             pLine([[fx - 9 * s, fy - 2 * s], [fx + 8 * s, fy - 2 * s]], "#6e6e75", 1.2 * s);
  });
  svg += feet + legInk + legFill;
  // ── trunk: sweater with ribbed hem, crew collar, side folds; the trousers' waist under the hem ──
  var wy = 7 + br * .3;
  svg += '<path d="' + pPath([T(-8, -40), T(10, -38), T(10, 38), T(-8, 40), T(-16, 0)], true) + '" fill="' + c.pants + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  var tor = [T(wy, -37), T(30, -33 - br * .3), T(70, -38 - br * .4), T(96, -42), T(hSh + 2, -46 + 2 * sl), T(hSh + 8, -30), T(hNeck + 2, -13), T(hNeck + 2, 13), T(hSh + 8, 30), T(hSh + 2, 46 - 2 * sl), T(96, 42), T(70, 38 + br * .4), T(30, 33 + br * .3), T(wy, 37)];
  svg += '<path d="' + pPath(tor, true) + '" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  svg += '<path d="' + pPath([T(hSh, 22), T(90, 36), T(50, 33), T(wy + 6, 34), T(wy + 6, 22), T(50, 24), T(86, 22)], true) + '" fill="' + c.shirtD + '" opacity=".55"/>';   // shaded far side
  svg += pLine([T(60, -20), T(52, -6), T(56, 6)], c.shirtD, 1.4 * s) + pLine([T(34, 8), T(26, 18)], c.shirtD, 1.3 * s) + pLine([T(40, -26), T(30, -16)], c.shirtD, 1.3 * s);
  var hem = [T(wy, -37), T(wy + 9, -36), T(wy + 9, 36), T(wy, 37)];
  svg += '<path d="M' + hem.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  for (var r = -32; r <= 32; r += 4) svg += pLine([T(wy + 1, r), T(wy + 8, r)], c.shirtD, .9 * s);
  // collar (crew neck, ribbed) and neck with the shadow under the chin
  var nb = [T(hNeck - 2, -14), T(hNeck + 4, -12), T(hNeck + 4, 12), T(hNeck - 2, 14)];
  var hc0 = T(166 - 10 * sl - 26 * nod + br, 0), tilt = (hd.tilt || 0) + (o.lean || 0);
  svg += '<path d="M' + f(T(hNeck - 4, -11)[0]) + ' ' + f(T(hNeck - 4, -11)[1]) + ' L' + f(hc0[0] - 10 * s) + ' ' + f(hc0[1] + 18 * s) + ' L' + f(hc0[0] + 10 * s) + ' ' + f(hc0[1] + 18 * s) + ' L' + f(T(hNeck - 4, 11)[0]) + ' ' + f(T(hNeck - 4, 11)[1]) + ' Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  svg += '<path d="M' + f(T(hNeck - 1, -11)[0]) + ' ' + f(T(hNeck - 1, -11)[1]) + ' Q' + f(T(hNeck + 6, 0)[0]) + ' ' + f(T(hNeck + 6, 0)[1]) + ' ' + f(T(hNeck - 1, 11)[0]) + ' ' + f(T(hNeck - 1, 11)[1]) + '" stroke="' + c.skinD + '" stroke-width="' + f(4 * s) + '" fill="none" opacity=".6"/>';
  svg += '<path d="' + pPath([T(hNeck - 4, -17), T(hNeck + 2, -15), T(hNeck - 5, 0), T(hNeck + 2, 15), T(hNeck - 4, 17), T(hNeck - 9, 0)], true) + '" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  svg += pLine([T(hNeck - 4.5, -13), T(hNeck - 8, 0), T(hNeck - 4.5, 13)], c.shirtD, 1.1 * s);
  J.head = hc0;
  var headSvg = pHead(hc0, s, tilt, o, c);
  // ── arms: sleeve to the wrist with a ribbed cuff, the hand ──
  var arms = o.arms || [{}, {}], armSvg = ["", ""];
  [-1, 1].forEach(function (sd, i) {
    var A = arms[i] || {}, sp = T(hSh - 4, sd * 40);
    var tg = A.to || (A.rel ? [sp[0] + A.rel[0] * s, sp[1] + A.rel[1] * s] : [sp[0] + sd * 10 * s, sp[1] + 128 * s]);
    var el = pIK(sp, tg, 74 * s, 58 * s, A.bend == null ? -sd : A.bend), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, 58 * s), el[1] + dy / dl * Math.min(dl, 58 * s)];
    J.sh.push(sp); J.el.push(el); J.wr.push(wr);
    var u1 = pTube(sp, el, 25 * s, 21 * s, c.shirt, c.shirtD, s), cuff = [wr[0] - dx / dl * 9 * s, wr[1] - dy / dl * 9 * s], u2 = pTube(el, cuff, 21 * s, 18 * s, c.shirt, c.shirtD, s);
    var ha = A.rot != null ? A.rot * Math.PI / 180 : Math.atan2(dy, dx), side = A.side || (sd * (Math.cos(ha) >= 0 ? -1 : 1));
    var hand = pHand([wr[0] + Math.cos(ha) * 2 * s, wr[1] + Math.sin(ha) * 2 * s], ha, A.hand || "relaxed", side, s, c, A.palm);
    var cf = pTube(cuff, [wr[0] + dx / dl * 1 * s, wr[1] + dy / dl * 1 * s], 19 * s, 17 * s, c.shirt, c.shirtD, s), rib = "";
    for (var q = -6; q <= 6; q += 3) { var nx2 = -dy / dl, ny2 = dx / dl; rib += pLine([[cuff[0] + nx2 * q * s, cuff[1] + ny2 * q * s], [cuff[0] + nx2 * q * s + dx / dl * 8 * s, cuff[1] + ny2 * q * s + dy / dl * 8 * s]], c.shirtD, .9 * s); }
    var fold = pLine([[el[0] - (el[0] - sp[0]) * .12 + 3 * s, el[1] - (el[1] - sp[1]) * .12], [el[0] + dx / dl * 6 * s, el[1] + dy / dl * 6 * s]], c.shirtD, 1.3 * s);
    armSvg[i] = u1.ink + u2.ink + cf.ink + u1.fill + u2.fill + cf.fill + rib + fold + hand;
  });
  // arms reaching up over the head (a stretch, a hand on the forehead) are drawn after the head
  var front = [arms[0] && arms[0].front, arms[1] && arms[1].front];
  svg += (front[0] ? "" : armSvg[0]) + (front[1] ? "" : armSvg[1]) + headSvg + (front[0] ? armSvg[0] : "") + (front[1] ? armSvg[1] : "");
  return { svg: svg, joints: J };
}
// tween two poses (numbers, points and arrays blend; strings switch at the midpoint)
function personMix(a, b, k) {
  if (k <= 0) return a; if (k >= 1) return b;
  function mix(x, y) {
    if (typeof x === "number" && typeof y === "number") return lerp(x, y, k);
    if (Array.isArray(x) && Array.isArray(y)) return x.map(function (v, i) { return mix(v, y[i]); });
    if (x && y && typeof x === "object" && typeof y === "object") { var o = {}, kk; for (kk in x) o[kk] = kk in y ? mix(x[kk], y[kk]) : x[kk]; for (kk in y) if (!(kk in o)) o[kk] = y[kk]; return o; }
    return k < .5 ? x : y;
  }
  var A = Object.assign({}, a, { legs: typeof a.legs === "object" ? a.legs : PLEGS[a.legs || "stand"] }), B = Object.assign({}, b, { legs: typeof b.legs === "object" ? b.legs : PLEGS[b.legs || "stand"] });
  return mix(A, B);
}
// a sofa from the front, at the person's scale: seat 0.26H, arms 0.37H, back 0.49H (olive fabric, seams, cushion folds)
function sofaFront(cx, fl, w, s) {
  var g = "", st = fl - 104 * s, x0 = cx - w / 2, x1 = cx + w / 2, OL = "#8d9256", OLD = "#6d7240", OLL = "#a3a86a";
  g += '<path d="M' + f(x0 + 30 * s) + ' ' + f(st - 8 * s) + ' L' + f(x0 + 38 * s) + ' ' + f(fl - 200 * s) + ' Q' + f(cx) + ' ' + f(fl - 212 * s) + ' ' + f(x1 - 38 * s) + ' ' + f(fl - 200 * s) + ' L' + f(x1 - 30 * s) + ' ' + f(st - 8 * s) + ' Z" fill="' + OLD + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var i = 0; i < 2; i++) { var a = x0 + 44 * s + i * (w - 88 * s) / 2, b = a + (w - 88 * s) / 2 - 6 * s; g += '<path d="M' + f(a) + ' ' + f(st - 6 * s) + ' L' + f(a + 4 * s) + ' ' + f(fl - 190 * s) + ' Q' + f((a + b) / 2) + ' ' + f(fl - 200 * s) + ' ' + f(b - 4 * s) + ' ' + f(fl - 190 * s) + ' L' + f(b) + ' ' + f(st - 6 * s) + ' Z" fill="' + OL + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[a + 14 * s, fl - 170 * s], [a + 26 * s, fl - 150 * s]], OLD, 1.3 * s) + pLine([[b - 10 * s, st - 30 * s], [b - 22 * s, st - 16 * s]], OLD, 1.3 * s); }
  g += '<path d="M' + f(x0 + 26 * s) + ' ' + f(st - 10 * s) + ' L' + f(x1 - 26 * s) + ' ' + f(st - 10 * s) + ' L' + f(x1 - 20 * s) + ' ' + f(st + 14 * s) + ' L' + f(x0 + 20 * s) + ' ' + f(st + 14 * s) + ' Z" fill="' + OLL + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[cx, st - 10 * s], [cx, st + 14 * s]], OLD, 1.4 * s);
  g += R(x0 + 20 * s, st + 14 * s, w - 40 * s, 70 * s, OL, 2.2 * s) + pLine([[cx, st + 14 * s], [cx, st + 84 * s]], OLD, 1.4 * s) + R(x0 + 24 * s, st + 60 * s, w - 48 * s, 24 * s, OLD, 0, 0, ' opacity=".5"');
  [x0, x1 - 40 * s].forEach(function (ax) { g += '<path d="M' + f(ax) + ' ' + f(fl - 18 * s) + ' L' + f(ax) + ' ' + f(fl - 140 * s) + ' Q' + f(ax + 20 * s) + ' ' + f(fl - 156 * s) + ' ' + f(ax + 40 * s) + ' ' + f(fl - 140 * s) + ' L' + f(ax + 40 * s) + ' ' + f(fl - 18 * s) + ' Z" fill="' + OL + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>' + pLine([[ax + 30 * s, fl - 132 * s], [ax + 30 * s, fl - 30 * s]], OLD, 2.4 * s, ' opacity=".6"'); });
  g += R(x0 + 6 * s, fl - 18 * s, 12 * s, 18 * s, "#6a4a32", 1.6 * s) + R(x1 - 18 * s, fl - 18 * s, 12 * s, 18 * s, "#6a4a32", 1.6 * s);
  return g;
}
