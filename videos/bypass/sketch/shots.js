// ── «تحويل المسار» — drawings, traced from real anatomy plates (refs/SOURCES.md):
// the stomach from the NCI plate (refs/stomach-nci.jpg), the organs' places in the belly from Gray's Anatomy plate 1223
// (refs/abdomen-gray1223.png: liver over the right upper belly, stomach under the left ribs, the colon framing the coils
// of small bowel), and the new route from the NIDDK Roux-en-Y drawing (refs/rygb-niddk.png: a small pouch stapled off the
// top of the stomach, a limb of small bowel brought up to it in front of the stomach, the duodenum's limb rejoined lower).
// Front view as the surgeon sees it: the patient's left is on the viewer's right.
var WALL = "#e39a82", WALLD = "#b85a44", LUMEN = "#f0c9b6", FOLD = "#c8735c", GUT = "#e8b08f", GHREL = "#bd552f",
    SHIRT = "#7f97a6", SHIRT2 = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", DRAPE = "#9fb7a8", STEEL = "#b9bcb8";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }
// a smooth curve through points (Catmull-Rom → cubic). cont = no leading M (to join onto a path)
function curve(p, cont) {
  var d = cont ? "" : "M" + f(p[0][0]) + " " + f(p[0][1]);
  for (var i = 0; i < p.length - 1; i++) {
    var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += " C" + f(b[0] + (c[0] - a[0]) / 6) + " " + f(b[1] + (c[1] - a[1]) / 6) + " " + f(c[0] - (e[0] - b[0]) / 6) + " " + f(c[1] - (e[1] - b[1]) / 6) + " " + f(c[0]) + " " + f(c[1]);
  }
  return d;
}
function rev(p) { return p.slice().reverse(); }
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}

// ── the stomach, front view, world units (it fills about 380×560 around 330,380) ──
// traced from the NCI stomach plate (refs/SOURCES.md, refs/stomach-nci.jpg): world = 30 + 1.75 × plate px
var GC = [[315, 166], [324, 119], [350, 75], [398, 54], [450, 61], [490, 96], [518, 148], [534, 224], [538, 302], [529, 390], [510, 464], [478, 523], [436, 565], [385, 593], [328, 604], [275, 595], [230, 572], [194, 548], [177, 534]],   // greater curve, angle of His → pylorus (bottom)
    LC = [[180, 411], [205, 397], [231, 404], [254, 432], [278, 427], [292, 386], [294, 334], [291, 285], [282, 250]],   // pylorus (top) → angular notch → lesser curve → cardia
    SL = [[315, 166], [331, 215], [340, 285], [340, 355], [331, 416], [319, 469], [306, 521], [292, 565], [275, 595]],   // the staple line: His → about 5 cm before the pylorus (ends on GC[15])
    OES_L = [[282, 250], [254, 206], [226, 148], [205, 84], [191, -12], [186, -90]], OES_R = [[315, 166], [292, 145], [268, 110], [247, 58], [236, -12], [232, -90]],
    DUO = [[184, 472], [138, 470], [100, 464], [65, 481], [51, 539], [62, 640]];
var PY = [180, 411], P_FULL = curve(GC) + " L180 411" + curve(LC, 1) + " Z",
    P_SLEEVE = curve(SL) + curve(GC.slice(15), 1) + " L180 411" + curve(LC, 1) + " Z",
    P_CUT = curve(GC.slice(0, 16)) + curve(rev(SL), 1) + " Z";
// an organ: flat fill, a darker band just inside the outline (the wall), light hatching, ink outline
function organ(d, fill, band, sw) {
  var id = "og" + (++CLIPN);
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + fill + '"/>' +
    '<g clip-path="url(#' + id + ')"><path d="' + d + '" fill="none" stroke="' + (band || WALLD) + '" stroke-width="16"/><path d="' + d + '" fill="url(#hatch)" opacity=".22"/></g>' +
    '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (sw || 2.6) + '" stroke-linejoin="round"/>';
}
// soft folds (rugae) inside the stomach, clipped to a shape
function rugae(d, op) {
  var id = "rg" + (++CLIPN), sx = "";
  for (var i = 0; i < 9; i++) { var x0 = 250 + i * 32, q = ""; for (var y = 40; y <= 640; y += 20) { var x = x0 + 12 * Math.sin(y / 36 + i * 1.7) - (y > 420 ? (y - 420) * .45 : 0); q += (y === 40 ? "M" : " L") + f(x) + " " + y; } sx += '<path d="' + q + '" stroke="' + FOLD + '" stroke-width="2.4" fill="none" stroke-linejoin="round" opacity="' + (op || .55) + '"/>'; }
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' + sx + '</g>';
}
// a liquid filling a shape from the bottom: lvl 0..1 of the box y0..y1, the surface wobbles with t
function fillIn(d, lvl, t, y0, y1, col) {
  if (lvl <= 0) return ""; var id = "fl" + (++CLIPN), y = lerp(y1, y0, clamp(lvl)), w = "";
  for (var x = 60; x <= 600; x += 20) w += (x === 60 ? "M" : " L") + x + " " + f(y + 4 * Math.sin(x / 40 + t * 3));
  return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')"><path d="' + w + ' L600 900 L60 900 Z" fill="' + (col || "#9fbccb") + '" opacity=".85"/><path d="' + w + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
}
function gullet(hl) { return organ(curve(OES_L) + " L" + OES_R[OES_R.length - 1].join(" ") + curve(rev(OES_R), 1) + " Z", hl ? "#e7a58f" : GUT, WALLD, 2.4); }
function duodenum() { var d = curve(DUO); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="74" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + GUT + '" stroke-width="68" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + WALLD + '" stroke-width="2" fill="none" opacity=".4" stroke-dasharray="4 10"/>'; }
function pylorus() { return '<path d="M180 414 Q166 472 178 531" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M180 414 Q166 472 178 531" stroke="' + WALLD + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
// ── people (copied from videos/choking/sketch/shots.js: real body proportions, Drillis & Contini) ──
// ── people: flat side-view figures facing left. Joints by angle (deg from straight down, + toward the front) or hands by IK.
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {   // elbow for a two-bone arm reaching tg; bend +1 / -1 picks the side
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
// Proportions from real body measurements (Drillis & Contini segment lengths as fractions of the standing height H,
// side-view depths from adult anthropometry). H = 400 units at s = 1:
//   ankle 0.039H · knee 0.285H · hip joint 0.52H · navel 0.60H · shoulder 0.818H · chin 0.87H · top of head 1.0H
//   thigh 0.245H · shank 0.246H · foot 0.152H · upper arm 0.186H · forearm 0.146H · hand 0.108H
//   side depths: chest 0.13H · waist 0.115H · seat 0.14H · head 0.115H deep by 0.13H tall · neck 0.06H
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
// o: {x, y (hip joint), s, lean, shirt, hair, legs: [[thigh, shin], [thigh, shin]], hands: [[x,y] | rel(), …], bend: [±1, ±1], belly, mouth, tilt}
// returns {far, body, near}: draw far, then whatever goes between, then body, then near. at(h, side): a point h above the hip
// along the trunk and side units to the front (+) or back (−).
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {   // two tapered segments: ink outlines first, then fills, so the joint stays clean
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]];   // the foot points to the front, square to the shank
    var toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1] + b[1] * 0 + 0], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    if (o.kneel) shoe = "";
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  // trunk outline: front then back, measured depths (chest 0.13H, waist 0.115H, seat 0.14H)
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  if (o.belly) fr = [[-6, 18], [14, 34], [34, 46], [56, 40], [76, 30], [92, 28], [110, 22], [120, 10]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var belt = atF(10, 0), tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  // head: 0.115H deep, 0.13H tall, face to the front; nose, ear, hair at the back and top
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>' +
    (o.mouth ? '<ellipse cx="' + f(-rx * .82) + '" cy="' + f(ry * .48) + '" rx="' + f(rx * .13) + '" ry="' + f(ry * .08 + ry * .08 * o.mouth) + '" fill="' + INK + '"/>' : ""));
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.up = up; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
var THROAT = [rel(130, 16), rel(124, 18)];   // the neck, just under the chin
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y, x0, x1) { return '<path d="M' + (x0 || -400) + ' ' + y + ' H' + (x1 || 1040) + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(x0 || -400, y, (x1 || 1040) - (x0 || -400), 300, "#e3d7bd", 0) + '<rect x="' + (x0 || -400) + '" y="' + y + '" width="' + ((x1 || 1040) - (x0 || -400)) + '" height="300" fill="url(#hatch)" opacity=".35"/>'; }

// ══SHOTS══
// seconds from the start of line l to its caption chunk c
function cf(l, c) { return (LN[l].end - LN[l].start) * (window.CHUNKS[l][c] || 0); }
function bell(x, y, s, t, ring) {
  var sw = ring * 14 * Math.sin(t * 16), w = "";
  for (var i = 1; i <= 3; i++) { var r = 40 + i * 16; w += '<path d="M' + f(-r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 0 ' + f(-r * .7) + ' ' + f(r * .5) + ' M' + f(r * .7) + ' ' + f(-r * .7) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(r * .7) + ' ' + f(r * .5) + '" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(clamp(ring * 1.4 - (i - 1) * .3)) + '"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", w + G("rotate(" + f(sw) + " 0 -40)", '<path d="M-34 20 C-34 -10 -30 -36 0 -38 C30 -36 34 -10 34 20 L44 30 L-44 30 Z" fill="#d9a441" stroke="' + INK + '" stroke-width="2.4"/><circle cy="38" r="8" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="-48" width="12" height="12" rx="3" fill="#b9832c" stroke="' + INK + '" stroke-width="2"/>'));
}
function brain(x, y, sc, col) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-40 10 C-50 -20 -30 -42 -6 -40 C10 -50 40 -40 44 -14 C56 4 44 28 22 30 L10 30 L8 44 L-6 44 L-6 30 C-30 32 -46 26 -40 10 Z" fill="' + (col || "#d9a0a0") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -20 q10 8 0 18 M10 -26 q-8 12 4 20 M24 4 q-12 4 -16 16" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'); }
function heart(x, y, sc, beatK) { var b = 1 + .06 * (beatK || 0); return G("translate(" + x + " " + y + ") scale(" + f(sc * b) + ")", '<path d="M0 34 C-60 -4 -50 -46 -18 -44 C-6 -44 0 -34 0 -28 C0 -34 6 -44 18 -44 C50 -46 60 -4 0 34 Z" fill="#c9533f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-8 -40 v-16 M8 -40 c0 -14 10 -18 20 -18" stroke="#4a6f8a" stroke-width="7" fill="none" stroke-linecap="round"/>'); }
function drop(x, y, s, col) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M0 -30 C14 -10 22 2 22 12 A22 22 0 0 1 -22 12 C-22 2 -14 -10 0 -30 Z" fill="' + (col || "#b8402f") + '" stroke="' + INK + '" stroke-width="2"/>'); }
function gauge(x, y, s, v) { var a = (-150 + 120 * v) * Math.PI / 180; return G("translate(" + x + " " + y + ") scale(" + s + ")", '<circle r="34" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 14 A28 28 0 1 1 24 14" stroke="' + ORANGE + '" stroke-width="5" fill="none" opacity=".5"/><path d="M0 0 L' + f(Math.cos(a) * 26) + ' ' + f(Math.sin(a) * 26) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/><path d="M34 0 C60 0 60 40 30 46" stroke="' + INK + '" stroke-width="5" fill="none"/>'); }
function sleeper(x, y, s, t) { var z = ""; for (var i = 0; i < 3; i++) { var p = (t * .6 + i / 3) % 1; z += G("", T("z", 36 + p * 40 + i * 6, -20 - p * 50, 16 + 10 * p, BLUE, 800), 1 - p); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<rect x="-60" y="10" width="120" height="22" rx="6" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-6" rx="26" ry="23" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-26 -8 C-26 -36 24 -36 26 -10 C10 -22 -10 -22 -26 -8 Z" fill="' + HAIR + '"/><path d="M-12 -2 q5 4 10 0" stroke="' + INK + '" stroke-width="2" fill="none"/>' + z); }
function scale(x, y, txt, col) { return G("translate(" + x + " " + y + ") scale(1.5)", '<rect x="-74" y="-14" width="148" height="28" rx="8" fill="#e8e3d6" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-10" width="60" height="18" rx="3" fill="#f6f2e8" stroke="' + INK + '" stroke-width="1.4"/>' + N(txt, 0, 5, 13, col || INK)); }
function pills(x, y, s, t) { var p = ""; for (var i = 0; i < 5; i++) { var a = i * 1.3 + Math.sin(t * 1.5 + i) * .2; p += G("translate(" + (i * 34 - 70) + " " + (110 + 6 * Math.sin(t * 2 + i)) + ") rotate(" + f(a * 30) + ")", '<rect x="-20" y="-9" width="40" height="18" rx="9" fill="' + (i % 2 ? "#e2c25b" : "#c96a4a") + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -9 V9" stroke="' + INK + '" stroke-width="1.4"/>'); }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", R(-56, -80, 112, 150, "#f4efe3", 2.6, 12) + R(-62, -110, 124, 36, OLIVE, 2.4, 6) + R(-46, -40, 92, 64, "#e9dfc6", 1.6) + T("فيتامين", 0, -8, 18, OLIVE, 800) + T("حديد", 0, 16, 16, INK, 700) + p); }
function head(x, y, s, hair, t) {   // a side-view head (face to the left) with the hair cap; hair 0..1 how much is left
  var hs = "", N0 = 30; for (var i = 0; i < N0; i++) { if (hash(i * 3.1) > hair) continue; var a0 = (-150 + i * 5.2) * Math.PI / 180, a1 = a0 + .42, r = 63 + 3 * hash(i);
    hs += '<path d="M' + f(Math.cos(a0) * r) + ' ' + f(Math.sin(a0) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(Math.cos(a1) * r) + ' ' + f(Math.sin(a1) * r) + '" stroke="' + HAIR + '" stroke-width="9" fill="none" stroke-linecap="round"/>'; }
  return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M-16 60 L-14 110 L36 110 L36 56 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="60" ry="68" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>' + hs +
    '<path d="M-60 -6 l-16 24 l16 4" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="12" cy="4" rx="9" ry="14" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-40 -16 h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
}

// ── tubes, routes, particles ──
var LIVER = "#9c4a3a", LIVERD = "#6f2f25", GALL = "#6f8a4a", PANC = "#e3c27a", PANCD = "#b08f45", BOWEL = "#e8a98c", BOWELD = "#b9644c",
    COLON = "#d9b49a", COLOND = "#a67b62", BILE = "#7d9a3a", FOODC = "#8a5a3c", HORM = "#4a6f8a", STEEL = "#b9bcb8", POUCHC = "#f0b9a0";
// dense points on the smooth curve through pts
function cr(pts, n) {
  n = n || 10; var o = [];
  for (var i = 0; i < pts.length - 1; i++) { var a = pts[i - 1] || pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] || c;
    for (var j = 0; j < n; j++) { var u = j / n, u2 = u * u, u3 = u2 * u;
      o.push([.5 * (2 * b[0] + (-a[0] + c[0]) * u + (2 * a[0] - 5 * b[0] + 4 * c[0] - e[0]) * u2 + (-a[0] + 3 * b[0] - 3 * c[0] + e[0]) * u3),
              .5 * (2 * b[1] + (-a[1] + c[1]) * u + (2 * a[1] - 5 * b[1] + 4 * c[1] - e[1]) * u2 + (-a[1] + 3 * b[1] - 3 * c[1] + e[1]) * u3)]); } }
  o.push(pts[pts.length - 1]); return o;
}
function part(pts, k0, k1) { var n = pts.length - 1, a = Math.round(clamp(k0) * n), b = Math.round(clamp(k1) * n); return pts.slice(a, Math.max(a + 2, b + 1)); }
// a length of bowel: ink outline, flat fill, a lit strip, and the ring folds across it. o: {fill, dark, ticks, cap}
function tube(pts, w, o) {
  o = o || {}; if (pts.length < 2) return ""; var d = pathPts(pts), cap = o.cap || "round";
  return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 5) + '" fill="none" stroke-linecap="' + cap + '" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="' + (o.fill || BOWEL) + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="' + cap + '" stroke-linejoin="round"/>' +
    '<path d="' + d + '" stroke="' + (o.dark || BOWELD) + '" stroke-width="' + f(w * .78) + '" fill="none" stroke-dasharray="2.2 ' + (o.ticks || 11) + '" opacity=".5"/>' +
    '<path d="' + d + '" stroke="#fff" stroke-width="' + f(w * .16) + '" fill="none" stroke-linecap="round" opacity=".28" transform="translate(' + f(-w * .2) + ' ' + f(-w * .2) + ')"/>';
}
// dots running along a route: n dots, speed in route-lengths per second, k = how far the route is open (0..1)
function flow(pts, t, n, sp, col, r, k, sq) {
  var s = ""; k = k == null ? 1 : clamp(k); if (k <= 0) return "";
  for (var i = 0; i < n; i++) { var q = ((t * sp + i / n) % 1); if (q > k) continue; var p = along(pts, q), a = Math.min(1, q * 12, (k - q) * 12 + .2);
    s += sq ? '<rect x="' + f(p[0] - r) + '" y="' + f(p[1] - r) + '" width="' + f(2 * r) + '" height="' + f(2 * r) + '" rx="' + f(r * .5) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.3" opacity="' + f(a) + '" transform="rotate(' + f(q * 700 + i * 40) + ' ' + f(p[0]) + ' ' + f(p[1]) + ')"/>'
            : '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(a) + '"/>'; }
  return s;
}

// ── the close-up: stomach, duodenum, the first loops of jejunum; before and after the bypass ──
var CUT = [404, 830], YP = [470, 985], JOIN = [348, 268],
    DUOJ = cr([[184, 472], [138, 470], [100, 464], [65, 481], [51, 539], [62, 620], [100, 680], [170, 708], [260, 704], [340, 690], [392, 712], [410, 770], CUT]),   // duodenum and the first jejunum, down to the cut
    LOWER = cr([CUT, [400, 880], [425, 940], YP]),   // the piece just below the cut (before); it becomes the limb brought up
    ROUX = cr([YP, [548, 930], [612, 810], [630, 640], [614, 470], [562, 352], [470, 292], [392, 270], JOIN]),   // Y → pouch, in front of the stomach
    STUB = cr([CUT, [414, 895], [440, 950], [462, 978]]),   // the duodenum's limb rejoined to the side of the other, lower down
    COMMON = cr([YP, [502, 1040], [482, 1110], [400, 1150], [300, 1165], [200, 1195], [110, 1260]]),
    OESC = cr([[210, -80], [214, 0], [226, 90], [250, 160], [290, 215], [318, 250]]),
    POUCH = "M282 250 L291 285 Q292 300 300 303 L344 298 Q352 296 351 286 L346 215 Q344 196 315 166 Z",
    PSTAPLE = [[293, 304], [320, 301], [350, 297], [349, 250], [346, 212], [332, 184], [315, 166]];
var FOOD_OLD = OESC.concat(cr([[318, 250], [380, 215], [440, 240], [470, 330], [440, 450], [360, 520], [260, 520], [184, 472]]), DUOJ, LOWER, COMMON),
    FOOD_NEW = OESC.concat(rev(ROUX), COMMON), JUICE = cr([[450, 330], [430, 450], [350, 520], [260, 520], [184, 472]]).concat(DUOJ, STUB, COMMON);
// lerp two point lists of any length
function morph(a, b, k) { var n = 40, o = []; for (var i = 0; i <= n; i++) o.push(L2(along(a, i / n), along(b, i / n), k)); return o; }
function liverUp() {   // the liver's left lobe and the gallbladder at the top left (lifted clear of the stomach, as in surgery)
  var d = curve([[-80, 150], [-10, 70], [90, 40], [170, 60], [205, 120], [190, 200], [120, 290], [30, 360], [-80, 380]]) + " Z";
  return organ(d, LIVER, LIVERD) + '<path d="M40 90 C70 160 60 250 10 330" stroke="' + LIVERD + '" stroke-width="3" fill="none"/>' +
    '<path d="M70 318 C92 372 96 430 88 482" stroke="' + INK + '" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M70 318 C92 372 96 430 88 482" stroke="' + BILE + '" stroke-width="6.5" fill="none" stroke-linecap="round"/>' +
    P("M52 300 C28 318 22 372 46 392 C70 398 86 356 76 318 C72 304 62 296 52 300 Z", GALL, 2.2);
}
function pancreas() { var d = curve([[96, 560], [120, 520], [180, 540], [250, 572], [340, 590], [440, 580], [520, 560], [548, 580], [520, 618], [430, 640], [330, 648], [240, 640], [160, 640], [110, 620]]) + " Z";
  var s = organ(d, PANC, PANCD); for (var i = 0; i < 9; i++) s += '<path d="M' + (140 + i * 44) + ' ' + (566 + (i % 2) * 6) + ' q14 22 0 52" stroke="' + PANCD + '" stroke-width="1.8" fill="none" opacity=".7"/>'; return s; }
// o: {after: 0|1, pouch: 0..1 staple line drawn, cut: 0..1 scissors gap, up: 0..1 lower piece brought up to the pouch, stub: 0..1,
//     hlPouch, hlRem, dimRem, fill: pouch fill, common: 0|1 show common channel, mini}
function gutCloseup(t, o) {
  o = o || {}; var s = "", up = o.after ? 1 : clamp(o.up || 0), cut = o.after ? 1 : clamp(o.cut || 0), stub = o.after ? 1 : clamp(o.stub || 0), pk = o.after ? 1 : clamp(o.pouch || 0);
  s += liverUp() + pancreas();
  s += tube(COMMON, 50) + tube(DUOJ, 54);
  // the lower piece: in place (before), or swung up to the pouch (after)
  var low = up > 0 ? morph(rev(LOWER), ROUX, ease(up)) : rev(LOWER);
  if (stub > 0) s += tube(part(STUB, 0, stub), 50);
  if (cut > 0 && up < 1) s += '<circle cx="' + CUT[0] + '" cy="' + CUT[1] + '" r="' + f(8 + 26 * cut) + '" fill="' + PAPER + '" opacity="' + f(.9 * cut) + '"/>';
  var rem = gullet() + organ(P_FULL, o.hlRem ? "#eaa890" : WALL) + rugae(P_FULL) + pylorus();
  s += o.dimRem ? dim(o.dimRem, rem) : rem;
  if (o.remFill) s += fillIn(P_FULL, o.remFill, t, 100, 610, "#c9c46a");
  if (pk > 0) { s += G("", organ(POUCH, o.hlPouch ? "#f6c9a4" : POUCHC, o.hlPouch ? ORANGE : WALLD), pk) + (o.fill ? fillIn(POUCH, o.fill, t, 170, 304, FOODC) : "");
    var pp = part(cr(PSTAPLE, 6), 0, pk); s += '<path d="' + pathPts(pp) + '" stroke="' + PAPER + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="' + pathPts(pp) + '" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-dasharray="7 5"/>'; }
  if (up > 0 || !o.after) s += tube(low, 50, { fill: o.hlRoux ? "#f3c0a0" : BOWEL });
  if (up >= 1) s += '<ellipse cx="' + JOIN[0] + '" cy="' + JOIN[1] + '" rx="10" ry="24" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="4 4"/>';
  if (stub >= 1) s += '<ellipse cx="464" cy="980" rx="22" ry="10" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="4 4" transform="rotate(50 464 980)"/>';
  return s;
}

// ── the whole belly (Gray's plate 1223): liver top left, stomach under the left ribs, colon framing the coils of small bowel ──
var TRUNK = "M150 40 C150 20 490 20 490 40 L520 300 C540 420 520 560 500 800 L140 800 C120 560 100 420 120 300 Z";
var COLONP = cr([[214, 668], [196, 640], [190, 560], [192, 500], [206, 452], [250, 448], [320, 466], [390, 452], [440, 420], [458, 440], [462, 520], [456, 610], [420, 668], [360, 700], [324, 740], [320, 790]], 8),
    COILS = (function () { var p = [[262, 452], [300, 470], [350, 462], [400, 476], [420, 500], [396, 520], [340, 512], [280, 520], [240, 506], [228, 532], [262, 552], [320, 548], [380, 556], [420, 546], [428, 576], [390, 592], [330, 584], [270, 592], [234, 580], [228, 610], [266, 628], [330, 620], [392, 630], [410, 656], [360, 664], [300, 656], [250, 662], [222, 650]]; return cr(p, 6); })();
var MINI = "translate(226 177) scale(.42)", ROUTE_ALL = cr([[262, -40], [300, 40], [316, 150], [330, 260], [372, 290], [410, 320], [398, 372], [330, 400], [296, 378], [262, 372], [248, 400], [262, 452]], 6).concat(COILS);
function abdomen(t, o) {
  o = o || {}; var s = P(TRUNK, SKIN, 2.6) + '<path d="' + TRUNK + '" fill="url(#hatch)" opacity=".12"/>';
  s += '<path d="M180 60 C230 200 300 260 320 280 C340 260 410 200 460 60" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none"/>';
  for (var i = 0; i < 4; i++) s += '<path d="M' + (200 + i * 10) + ' ' + (80 + i * 40) + ' Q260 ' + (110 + i * 40) + ' 310 ' + (100 + i * 40) + ' M' + (440 - i * 10) + ' ' + (80 + i * 40) + ' Q380 ' + (110 + i * 40) + ' 330 ' + (100 + i * 40) + '" stroke="' + SKIN2 + '" stroke-width="2.4" fill="none" opacity=".7"/>';
  s += tube(COLONP, 36, { fill: COLON, dark: COLOND, ticks: 17 });
  s += P("M214 668 C196 690 206 716 226 706", "none", 5);   // the appendix end
  s += tube(COILS, 21, { ticks: 7 });
  var body = G(MINI, pancreas() + tube(DUOJ.slice(0, 96), 54) + gullet() + organ(P_FULL, o.hlSt ? "#eaa890" : WALL) + pylorus());
  s += body;
  // the liver: big right lobe on the viewer's left, thinning across the midline over the stomach's edge
  var lv = curve([[150, 262], [156, 214], [196, 184], [262, 176], [330, 190], [392, 214], [410, 236], [372, 262], [318, 286], [262, 318], [206, 344], [166, 330]]) + " Z";
  s += organ(lv, LIVER, LIVERD) + '<path d="M300 186 C296 230 286 270 268 314" stroke="' + LIVERD + '" stroke-width="2.4" fill="none"/>';
  s += P("M236 318 C222 328 220 356 234 364 C248 364 254 340 250 324 C246 316 240 314 236 318 Z", GALL, 1.8);
  s += '<ellipse cx="320" cy="600" rx="6" ry="8" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>';
  return s;
}
// small icons
function egg(s) { return G("scale(" + (s || 1) + ")", '<path d="M0 -38 C22 -38 32 -4 32 12 A32 30 0 0 1 -32 12 C-32 -4 -22 -38 0 -38 Z" fill="#f4ead6" stroke="' + INK + '" stroke-width="2.4"/><path d="M-16 -8 q4 -16 14 -20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'); }
function spoon(x, y, r) { return G("translate(" + x + " " + y + ") rotate(" + r + ")", '<ellipse cx="0" cy="-22" rx="14" ry="20" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-22" rx="9" ry="14" fill="' + FOODC + '" opacity=".8"/><rect x="-3.5" y="-4" width="7" height="46" rx="3" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/>'); }
function scissors(x, y, rot, open) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot) + ")", [1, -1].map(function (q) { return G("rotate(" + f(q * (6 + 16 * open)) + ")", '<path d="M0 0 L70 -5 L74 0 L70 5 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 L-34 ' + (q * 10) + '" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><circle cx="-46" cy="' + (q * 14) + '" r="13" fill="none" stroke="' + ORANGE + '" stroke-width="6"/>'); }).join("") + '<circle r="4" fill="' + INK + '"/>'); }
function stapler2(pts, k, t) { var p = along(pts, clamp(k)), p2 = along(pts, clamp(k + .03)), a = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180 / Math.PI, o = 3 + 3 * Math.abs(Math.sin(t * 9));
  return G("translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(a - 180) + ")", '<rect x="-6" y="' + f(-o - 11) + '" width="96" height="11" rx="3" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="' + f(o) + '" width="96" height="11" rx="3" fill="#9ea3a0" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-13" width="110" height="26" rx="6" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>'); }
function detour(s) { return G("scale(" + (s || 1) + ")", '<rect x="-46" y="-34" width="92" height="68" rx="6" fill="#e2a23a" stroke="' + INK + '" stroke-width="2.6"/><path d="M-26 14 V-2 Q-26 -14 -14 -14 H16" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M12 -26 L32 -14 L12 -2 Z" fill="' + INK + '"/><rect x="-5" y="34" width="10" height="26" fill="#5f6b70" stroke="' + INK + '" stroke-width="2"/>'); }
function chipsN(n, on, x, y) { var s = ""; for (var i = 0; i < n; i++) { var c = i < on; s += '<circle cx="' + (x + (i - (n - 1) / 2) * 48) + '" cy="' + y + '" r="18" fill="' + (c ? ORANGE : PAPER) + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(i + 1), x + (i - (n - 1) / 2) * 48, y + 7, 19, c ? "#fff" : INK); } return s; }
function cig(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ") rotate(-20)", '<rect x="-40" y="-7" width="62" height="14" fill="#f4efe3" stroke="' + INK + '" stroke-width="2"/><rect x="-40" y="-7" width="22" height="14" fill="#d9a441" stroke="' + INK + '" stroke-width="2"/><rect x="22" y="-7" width="8" height="14" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M34 -10 q8 -12 0 -22 q-8 -10 2 -22" stroke="' + MUTE + '" stroke-width="3" fill="none" stroke-linecap="round"/>'); }
function tablet(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<circle r="22" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.2"/><path d="M-22 0 H22" stroke="' + INK + '" stroke-width="1.8"/>'); }
function cake(x, y, s) { return G("translate(" + x + " " + y + ") scale(" + s + ")", '<path d="M-40 30 L40 30 L40 -6 L-40 -6 Z" fill="#e8d2a6" stroke="' + INK + '" stroke-width="2.2"/><path d="M-40 -6 Q-30 -26 0 -24 Q30 -26 40 -6 Z" fill="#c96a8a" stroke="' + INK + '" stroke-width="2"/><circle cy="-30" r="8" fill="#c9533f" stroke="' + INK + '" stroke-width="1.6"/>'); }
var Z_ALL = .6, C_ALL = [340, 570];
function sweat(x, y, t, n) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .9 + i / n) % 1; s += G("", drop(x + (i - n / 2) * 16 + 6 * Math.sin(i * 9), y + p * 46, .22, "#7fa7bd"), 1 - p); } return s; }

// ── shots ──
// 4 · the normal route: gullet → stomach → small bowel; about 6 m of it
shot(4, push(320, 410, .9, .97), function (u, d, t) {
  var k = at(u, .3, 3.6), c1 = cf(4, 1), c3 = cf(4, 3);
  return paper() + abdomen(t, {}) + flow(ROUTE_ALL, t, 7, .09, FOODC, 6.5, .12 + .88 * k, 1) +
    label(308, 120, 215, 90, "المريء", OLIVE, at(u, c1, .4), 24) + label(400, 300, 470, 150, "المعدة", OLIVE, at(u, c1 + .7, .4), 24) + label(400, 610, 440, 735, "الأمعاء الدقيقة", OLIVE, at(u, cf(4, 2), .4), 24) +
    numBox("6 m", 200, 740, at(u, c3 + .3, .3), 34, true);
});
// 5 · bile from the liver and gallbladder, juice from the pancreas: they meet the food at the start of the bowel
shot(5, push(210, 440, 1.0, 1.1), function (u, d, t) {
  var bile = cr([[62, 330], [84, 400], [90, 470], [78, 540], [70, 600], [100, 680], [170, 708], [260, 704]], 8), pj = cr([[500, 590], [400, 610], [280, 606], [170, 590], [100, 580], [70, 600], [100, 680], [170, 708], [260, 704]], 8);
  return paper() + gutCloseup(t, {}) + flow(bile, t, 8, .22, BILE, 8, at(u, .5, 1.2)) + flow(pj, t, 8, .2, "#d9a441", 7, at(u, 1.6, 1.2)) +
    label(60, 200, 250, 110, "الكبد", ORANGE, at(u, .2, .4), 26) + label(48, 350, 250, 390, "المرارة", OLIVE, at(u, .6, .4), 24) + label(330, 615, 330, 770, "البنكرياس", "#9a7420", at(u, 1.6, .4), 24) +
    G("", tag("بيهضموا الأكل", 130, 770, 1, 24, OLIVE), at(u, cf(5, 2), .3));
});
// 6 · the stapler closes off a small pouch at the top of the stomach, the size of an egg
shot(6, push(350, 300, 1.0, 1.55), function (u, d, t) {
  var k = at(u, .9, 2.0), c2 = cf(6, 2) || 3.4;
  var s = paper() + gutCloseup(t, { pouch: k, hlPouch: k >= 1 ? 1 : 0 });
  if (k > 0 && k < 1) s += stapler2(cr(PSTAPLE, 6), k, t);
  return s + label(330, 240, 440, 190, "الجيب", ORANGE, at(u, 2.6, .4), 20) + iconBox(480, 330, 96, egg(.9), at(u, c2, .3)) + G("", T("قد البيضة", 480, 404, 17, ORANGE, 800), at(u, c2 + .2, .3));
}, { tr: "in" });
// 7 · about 30 ml: two spoonfuls and it is full
shot(7, push(330, 250, 1.75, 1.9), function (u, d, t) {
  var k = at(u, .3, 1.6);
  return paper() + gutCloseup(t, { pouch: 1, hlPouch: 1, fill: k * (.9 + .03 * Math.sin(t * 3)), dimRem: .5 }) + numBox("30 ml", 420, 350, at(u, .4, .3), 18, true) +
    G("", spoon(206, 330, -20 + 6 * Math.sin(t * 3)) + spoon(244, 344, 14 + 6 * Math.sin(t * 3 + 1)), at(u, cf(7, 1), .3));
});
// 8 · the small bowel is cut; the lower end is brought up and joined to the pouch
shot(8, pan(380, 700, 380, 600, .68), function (u, d, t) {
  var c1 = cf(8, 1), cut = at(u, .5, .5), up = at(u, c1, d - c1 - .5), s = paper() + gutCloseup(t, { pouch: 1, cut: cut, up: up, hlRoux: up > 0 ? 1 : 0 });
  if (u < c1 + .2) s += G("", scissors(CUT[0] + 60 - 30 * at(u, .1, .4), CUT[1], 180, 1 - cut), 1 - at(u, c1 - .2, .3));
  return s + label(JOIN[0] + 6, JOIN[1], 190, 110, "توصيلة", ORANGE, at(u, d - .9, .4), 30) + (up > 0 && up < 1 ? arrow(560, 760, 590, 620, ORANGE, 6, 1) : "");
});
// 9 · food drops from the pouch straight into the bowel: a detour
shot(9, push(C_ALL[0] + 40, 520, .66, Z_ALL), function (u, d, t) {
  return paper() + gutCloseup(t, { after: 1, hlPouch: 1, hlRoux: 1, dimRem: .55 }) + flow(FOOD_NEW, t, 10, .16, FOODC, 11, at(u, .1, 2.2), 1) +
    iconBox(120, 880, 190, detour(1.5), at(u, cf(9, 1), .3)) + G("", T("تحويلة", 120, 1020, 36, ORANGE, 800), at(u, cf(9, 1) + .2, .3));
});
// 10 · the rest of the stomach stays where it is, closed, still making its juice
shot(10, push(360, 380, .95, 1.05), function (u, d, t) {
  var c1 = cf(10, 1), c2 = cf(10, 2);
  return paper() + gutCloseup(t, { after: 1, hlRem: 1, remFill: at(u, c2, 1.2) * (.3 + .02 * Math.sin(t * 2.5)) }) + label(450, 200, 500, 70, "باقي المعدة", OLIVE, at(u, .3, .4), 24) +
    G("", tag("مقفولة", 180, 110, 1, 28, OLIVE), at(u, c1 + .5, .3)) + label(430, 500, 500, 650, "عصارة", "#8a8420", at(u, c2 + .4, .4), 24);
});
// 11 · the juice takes the old road and meets the food lower down, at a second join
shot(11, pan(300, 560, 400, 860, .78), function (u, d, t) {
  var c1 = cf(11, 1), c2 = cf(11, 2);
  return paper() + gutCloseup(t, { after: 1, dimRem: .3 }) + flow(JUICE, t, 14, .13, BILE, 9, at(u, .1, 2.6)) + flow(FOOD_NEW, t, 8, .14, FOODC, 10, at(u, c1 - .6, 1.4), 1) +
    label(120, 690, 150, 880, "الطريق القديم", BLUE, at(u, .8, .4), 28) + label(466, 982, 250, 1010, "توصيلة تانية", ORANGE, at(u, c2, .4), 28);
});
// 12 · the whole thing is a letter Y
shot(12, push(C_ALL[0], C_ALL[1], .6, .57), function (u, d, t) {
  var yv = pathPts(part(rev(ROUX), .08, 1)), ys = pathPts(DUOJ.slice(70).concat(STUB)), yc = pathPts(part(COMMON, 0, .45));
  return paper() + dim(.45, gutCloseup(t, { after: 1 })) + draw(yv, at(u, .1, .6), ORANGE, 16) + draw(ys, at(u, .5, .5), ORANGE, 16) + draw(yc, at(u, .8, .4), ORANGE, 16) +
    G("translate(" + f(180 + 8 * Math.sin(t * 3)) + " 1060) scale(" + f(1 + .04 * Math.sin(t * 4)) + ")", N("Y", 0, 0, 230, ORANGE), at(u, .7, .3));
}, { tr: "out" });
// 13–15 · three reasons, ticked off on top
hud(13, 16, function (u, t) { var n = t >= LN[15].start ? 3 : t >= LN[14].start ? 2 : u > cf(13, 1) ? 1 : 0; return chipsN(3, n, 320, 56); });
// 13 · one: the pouch is small, a few bites and you are full
shot(13, push(360, 310, 1.2, 1.35), function (u, d, t) {
  var c1 = cf(13, 1), k = at(u, c1 + .2, 1.6), bites = "";
  for (var i = 0; i < 3; i++) { var q = (u - c1 - .2 - i * .5) / .5; if (q > 0 && q < 1) bites += C(lerp(214, 318, q) , lerp(0, 250, q), 9, FOODC, 1.6); }
  return paper() + gutCloseup(t, { after: 1, hlPouch: 1, fill: k * .92, dimRem: .5 }) + bites + G("", T("؟", 470, 330, 120, ORANGE, 800), 1 - at(u, c1 - .1, .3)) + G("", tag("شبعت", 440, 180, 1, 24, ORANGE), at(u, c1 + 1.6, .3));
});
// 14 · two: food and juice meet late, so a little less is absorbed
shot(14, push(C_ALL[0] + 20, 600, .62, .66), function (u, d, t) {
  var c1 = cf(14, 1), c3 = cf(14, 3) || cf(14, 2), hl = pathPts(part(rev(ROUX), .1, 1));
  return paper() + gutCloseup(t, { after: 1, dimRem: .4 }) + G("", '<path d="' + hl + '" stroke="' + ORANGE + '" stroke-width="64" fill="none" opacity=".22" stroke-linecap="round"/>', at(u, c1, .4)) +
    flow(FOOD_NEW, t, 9, .13, FOODC, 11, 1, 1) + flow(JUICE, t, 12, .12, BILE, 9) + G("", T("أكل لوحده", 740, 540, 36, FOODC, 800) + T("من غير عصارة", 740, 590, 30, MUTE, 700), at(u, c1 + .3, .3)) +
    G("", arrow(500, 1120, 500, 1210, ORANGE, 9, 1) + T("امتصاص أقل", 330, 1190, 36, ORANGE, 800), at(u, c3, .3));
});
// 15 · three: food reaches the far bowel early; it releases satiety hormones that also steady the sugar
shot(15, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c1 = cf(15, 1), c2 = cf(15, 2), s = paper(), coil = cr([[120, 520], [200, 470], [290, 520], [380, 470], [470, 520], [540, 600], [470, 660], [380, 620], [290, 670], [200, 620], [120, 670]], 8), hk = at(u, c2, .6), i;
  s += tube(coil, 46) + flow(coil, t, 8, .2, FOODC, 9, at(u, .1, 1.2), 1) + G("", T("آخر الأمعاء", 320, 750, 26, OLIVE, 800), at(u, c1 - .5, .3));
  for (i = 0; i < 10; i++) { var q = ((t * .45 + i / 10) % 1), x0 = 150 + i * 36, tx = i % 2 ? 470 : 170; s += G("", C(lerp(x0, tx, q), lerp(540, 250, q) + 14 * Math.sin(q * 9 + i), 7, HORM, 1.4), hk * Math.sin(q * Math.PI)); }
  s += G("", brain(170, 180, 1.5, "#d9a0a0") + T("شبع", 170, 290, 30, HORM, 800), at(u, .2, .3) * (.3 + .7 * hk)) + G("", drop(470, 180, 1.7) + T("السكر", 470, 290, 30, HORM, 800) + check(560, 170, .9, at(u, c2 + 1.2, .4), OLIVE), at(u, .4, .3) * (.3 + .7 * at(u, c2 + .5, .3)));
  return s + G("", tag("هرمونات", 320, 400, 1, 26, HORM), hk);
});
// 16 · the sugar improves within days, before the weight has moved
shot(16, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper(), X0 = 110, X1 = 560, Y0 = 600, k = at(u, .3, 2.2), i, sug = [], wt = [];
  for (i = 0; i <= 40; i++) { var x = i / 40; sug.push([lerp(X0, X1, x), lerp(250, 500, 1 - Math.pow(1 - Math.min(1, x * 3.2), 2.4))]); wt.push([lerp(X0, X1, x), lerp(250, 320, x * x)]); }
  s += '<path d="M' + X0 + ' 200 V' + Y0 + ' H' + X1 + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  for (i = 0; i < 7; i++) s += '<path d="M' + (X0 + i * 75) + ' ' + Y0 + ' v10" stroke="' + INK + '" stroke-width="2"/>' + N(String(i * 2 || 0), X0 + i * 75, Y0 + 34, 16, INK);
  s += T("أيام", 335, 668, 20, INK, 700) + draw(pathPts(wt), k, MUTE, 5) + draw(pathPts(sug), k, HORM, 6);
  s += G("", T("الوزن", 520, 290, 24, MUTE, 800), at(u, cf(16, 1), .3)) + G("", T("السكر", 300, 520, 26, HORM, 800), at(u, .6, .3)) + G("", tag("في أيام", 250, 180, 1, 28, ORANGE), at(u, 1.2, .3));
  if (k > 0) { var p = along(sug, k); s += C(p[0], p[1], 8 + Math.sin(t * 6), HORM, 2); }
  return s;
});
// 17 · about 70% of the extra weight goes
shot(17, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + floor(690), k = at(u, .3, 1.6), p = fig({ x: 200, y: 666 - 212, lean: 0, shirt: "#7f97a6", hands: [null, null], bend: [-1, -1] }), bl = p.at(48, 24);
  s += scale(200, 678, "kg") + p.far + '<ellipse cx="' + f(bl[0]) + '" cy="' + f(bl[1]) + '" rx="' + f(46 - 26 * k) + '" ry="' + f(62 - 22 * k) + '" fill="#7f97a6" stroke="' + INK + '" stroke-width="2.2" opacity="' + f(1 - .8 * k) + '"/>' + p.body + p.near;
  return s + bigNum(count(70, k) + "%", "من الوزن الزيادة", 450, 330, at(u, .2, .3), ORANGE, 84) + arrow(450, 430, 450, 540, ORANGE, 8, k);
});
// 18 · the price: sugar rushes into the bowel at once; dizzy, sweating, a pounding heart
shot(18, push(350, 330, 1.0, 1.0), function (u, d, t) {
  var c1 = cf(18, 1), c2 = cf(18, 2);
  return paper() + gutCloseup(t, { after: 1, dimRem: .5 }) + G("", cake(150, 60, 1.3), at(u, c1 - .5, .3)) + flow(FOOD_NEW, t, 16, .5, "#c96a8a", 10, at(u, c1, 1.0), 1) + G("", tag("مرة واحدة", 500, 130, 1, 26, ORANGE), at(u, c2 - .5, .3)) + G("", T("؟", 520, 120, 100, ORANGE, 800), 1 - at(u, c1 - .5, .3));
});
shot([18, 3], push(320, 420, 1.1, 1.16), function (u, d, t) {
  var sway = 6 * Math.sin(t * 2.2), p = fig({ x: 250 + sway, y: 690 - 212, lean: 4 + 5 * Math.sin(t * 2.2), shirt: "#8f7f9a", hands: [rel(150, 20), null], bend: [-1, -1], tilt: -8 }), s = paper() + floor(690) + whole(p);
  var ch = p.at(96, 22), i; for (i = 0; i < 3; i++) { var a = t * 2 + i * 2.1; s += '<path d="M' + f(p.hd[0] + Math.cos(a) * 46) + ' ' + f(p.hd[1] - 50 + Math.sin(a) * 12) + ' q8 -8 16 0" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
  s += sweat(p.hd[0] - 34, p.hd[1] - 6, t, 3) + heart(ch[0] - 2, ch[1], .42, Math.abs(Math.sin(t * 9)));
  return s + G("", T("دوخة", 480, 250, 34, ORANGE, 800), at(u, .1, .3)) + G("", T("عرق", 480, 340, 34, HORM, 800), at(u, .6, .3)) + G("", heart(440, 440, .7, Math.abs(Math.sin(t * 9))) + T("القلب يدق", 520, 510, 26, ORANGE, 800), at(u, 1.1, .3));
});
// 19 · vitamins, iron and calcium for life, more than after a sleeve
shot(19, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var c1 = cf(19, 1), c2 = cf(19, 2) || c1 + 1, s = paper() + G("", pills(200, 380, 1.5, t), at(u, .1, .3));
  [["B12", 250], ["Fe", 350], ["Ca", 450]].forEach(function (q, i) { s += numBox(q[0], 470, q[1], at(u, .4 + i * .45, .3), 34, i === 0); });
  s += G("", T("فيتامين", 470, 190, 22, OLIVE, 800), at(u, .3, .3)) + G("", tag("طول العمر", 200, 640, 1, 28, OLIVE), at(u, c1, .3));
  var b = at(u, c2, .5); s += G("", T("التكميم", 400, 600, 20, MUTE, 700) + R(380, 620 - 40, 40, 40, "#c0b49c", 2) + T("التحويل", 500, 600 - 60, 20, ORANGE, 800) + R(480, 620 - 100 * b, 40, 100 * b, ORANGE, 2) + '<path d="M360 620 H540" stroke="' + INK + '" stroke-width="2.4"/>', b);
  return s;
});
// 20 · an ulcer can form at the join, more so with smoking and painkillers
shot(20, push(JOIN[0] + 30, JOIN[1] + 20, 1.5, 1.7), function (u, d, t) {
  var c1 = cf(20, 1), pu = 1 + .12 * Math.sin(t * 6);
  return paper() + gutCloseup(t, { after: 1, dimRem: .5 }) + G("", '<circle cx="' + (JOIN[0] + 8) + '" cy="' + JOIN[1] + '" r="' + f(15 * pu) + '" fill="#b8402f" stroke="' + INK + '" stroke-width="2"/><circle cx="' + (JOIN[0] + 8) + '" cy="' + JOIN[1] + '" r="' + f(6 * pu) + '" fill="#6f1f18"/>', at(u, .5, .4)) +
    label(JOIN[0] + 8, JOIN[1], 470, 190, "قرحة", ORANGE, at(u, .8, .4), 22) + iconBox(270, 440, 84, cig(4, 6, .8), at(u, c1, .3)) + iconBox(370, 440, 84, tablet(0, 0, 1.1), at(u, c1 + .7, .3)) + cross(270, 440, .9, at(u, c1 + .3, .4)) + cross(370, 440, .9, at(u, c1 + 1.0, .4));
}, { tr: "in" });
// 21 · the «mini»: a long pouch and one join only
shot(21, push(330, 420, .8, .86), function (u, d, t) {
  var c1 = cf(21, 1), c2 = cf(21, 2), SLm = cr([[315, 166], [331, 215], [340, 285], [340, 355], [331, 416], [322, 460]], 8), s = paper();
  var loop = cr([[40, 900], [140, 760], [250, 640], [330, 520], [372, 468], [420, 520], [470, 640], [520, 780], [560, 920]], 8), pouchL = curve([[315, 166], [331, 215], [340, 285], [340, 355], [331, 416], [322, 462]]) + " L286 440 L292 386 L294 334 L291 285 L282 250 Z";
  s += dim(.5, gullet() + organ(P_FULL, WALL) + rugae(P_FULL) + pylorus() + tube(DUOJ.slice(0, 60), 54));
  s += G("", tube(loop, 50, { fill: "#f3c0a0" }), at(u, c1 + .4, .5)) + gullet() + organ(pouchL, "#f6c9a4", ORANGE) + '<path d="' + pathPts(SLm) + '" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-dasharray="7 5"/>';
  s += flow(OESC.concat(cr([[318, 250], [316, 330], [312, 400], [330, 468], [420, 520], [470, 640], [520, 780], [560, 920]], 8)), t, 8, .2, FOODC, 10, at(u, c1 + .9, 1.2), 1);
  s += G("", tag("الميني", 150, 120, 1, 36, ORANGE), at(u, .3, .3)) + label(318, 330, 150, 330, "جيب طويل", ORANGE, at(u, c1, .4), 28) + label(350, 468, 490, 380, "توصيلة واحدة", ORANGE, at(u, c2 - .5, .4), 26) + G("", '<ellipse cx="350" cy="468" rx="30" ry="12" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-dasharray="4 4"/>', at(u, c1 + .6, .3));
  return s;
});
// 22 · the myth: the stomach is taken out. No.
shot(22, push(360, 380, .86, .8), function (u, d, t) {
  var k = at(u, .2, .6), away = 60 * Math.sin(Math.min(1, u / 1.0) * Math.PI);
  return paper() + dim(.5, liverUp() + pancreas() + tube(DUOJ, 54)) + G("translate(" + f(away) + " " + f(-away * .4) + ")", gullet() + organ(P_FULL, WALL) + rugae(P_FULL) + pylorus()) + G("", T("بتتشال؟", 300, 815, 44, INK, 800), k) + cross(360, 360, 3, at(u, 1.0, .4)) + G("", T("لأ", 540, 820, 70, ORANGE, 800), at(u, 1.15, .25));
});
// 23 · nothing is removed; only the road changed
shot(23, push(C_ALL[0], C_ALL[1] - 20, .6, .64), function (u, d, t) {
  var c1 = cf(23, 1);
  return paper() + gutCloseup(t, { after: 1, hlRem: 1 }) + check(640, 120, 1.6, at(u, .3, .4), OLIVE) + G("", T("في مكانها", 640, 50, 34, OLIVE, 800), at(u, .2, .3)) + flow(FOOD_NEW, t, 10, .15, FOODC, 11, at(u, c1, 1.4), 1) + G("", tag("الطريق اتغير", 170, 960, 1, 40, ORANGE), at(u, c1 + .2, .3));
});
// 24 · from the end: a small pouch, a detour, satiety hormones; with vitamins and follow-up for life
shot(24, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = [cf(24, 1), cf(24, 2), cf(24, 3), cf(24, 4), cf(24, 5) || cf(24, 4) + .8], s = paper();
  s += G("translate(320 400) scale(" + f(1 + .05 * Math.sin(t * 4)) + ") translate(-320 -400)", tag("من الآخر", 320, 400, at(u, .05, .3), 44, ORANGE), 1 - at(u, c[0] - .1, .3));
  s += G("", G("translate(70 60) scale(.3)", '<clipPath id="rc"><rect x="150" y="-60" width="420" height="700"/></clipPath><g clip-path="url(#rc)">' + gutCloseup(t, { after: 1, hlPouch: 1 }) + '</g>') + T("جيب صغير", 160, 300, 22, ORANGE, 800), at(u, c[0], .3));
  s += G("", G("translate(320 190)", detour(1.1)) + T("تحويلة", 320, 300, 22, ORANGE, 800), at(u, c[1], .3));
  s += G("", brain(490, 170, 1.0, "#d9a0a0") + C(450 + 8 * Math.sin(t * 3), 230, 6, HORM, 1.4) + C(520, 236 + 6 * Math.sin(t * 4), 6, HORM, 1.4) + T("هرمونات شبع", 490, 300, 22, HORM, 800), at(u, c[2], .3));
  s += G("", '<path d="M80 380 H560" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 6"/>', at(u, c[3], .3));
  s += G("", pills(190, 520, .9, t) + T("فيتامينات", 190, 700, 22, OLIVE, 800), at(u, c[3], .3));
  var doc = fig({ x: 450, y: 700 - 212 * .8, s: .8, lean: 0, shirt: "#f2f0ea", hands: [null, null], bend: [-1, -1] });
  s += G("", whole(doc) + T("متابعة", 450, 760, 22, INK, 800), at(u, c[4], .3));
  return s;
});
// 25 · the odd fact: the idea came in the 1960s, from ulcer patients who lost weight after part of the stomach was removed
shot(25, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var c2 = cf(25, 2), c3 = cf(25, 3) || c2 + 1.4, s = paper(), k = at(u, c2 + .2, 1.0);
  s += G("", numBox("1966", 320, 130, 1, 44, true), at(u, .6, .3));
  var doc = fig({ x: 140, y: 690 - 212 * .9, s: .9, lean: 4, shirt: "#f2f0ea", hair: "#8a8a86", hands: [rel(120, 40), null], bend: [-1, -1] });
  s += floor(690) + G("", whole(doc), at(u, .2, .3));
  s += G("", G("translate(250 220) scale(.5)", gullet() + organ(P_FULL, WALL) + rugae(P_FULL) + pylorus() + '<path d="M300 460 L560 380 L560 640 L200 640 Z" fill="' + PAPER + '" opacity="' + f(.85 * k) + '"/>' + draw("M300 460 L560 380", k, ORANGE, 8) + G("", '<circle cx="330" cy="470" r="20" fill="#b8402f" stroke="' + INK + '" stroke-width="2"/>', 1 - k)) + T("قرحة", 330, 540, 24, ORANGE, 800), at(u, c2 - .3, .3));
  s += G("", scale(500, 678, "− kg", ORANGE) + arrow(500, 560, 500, 640, ORANGE, 7, 1), at(u, c3, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: food going down the gullet; line 1: the route skipping the stomach and the first metre; line 2: the stomach still there
  var s = "", TR = "translate(70 70) scale(.72)";
  if (li === 0) s += G(TR, gutCloseup(t, {}) + flow(OESC, t, 4, .5, FOODC, 11, 1, 1));
  if (li === 1) { var u = t - LN[1].start; s += G(TR, gutCloseup(t, { after: 1, dimRem: .7 }) + flow(FOOD_NEW, t, 9, .16, FOODC, 11, ease(u / 1.6), 1)) + numBox("1 m", 150, 560, ease((u - 1.8) / .3), 34, true) + cross(330, 330, 1.6, ease((u - .6) / .4)); }
  if (li >= 2) { var v = t - LN[2].start; s += G(TR, gutCloseup(t, { after: 1, hlRem: 1 }) + flow(FOOD_NEW, t, 9, .16, FOODC, 11, 1, 1)) + check(470, 150, 1.5, ease((v - .4) / .4), OLIVE) + G("", tag("لسه مكانها", 430, 70, 1, 30, OLIVE), ease((v - .2) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(20 34) scale(.215)", gutCloseup(t, { after: 1 }) + flow(FOOD_NEW, t, 7, .2, FOODC, 16, 1, 1));
};
SCENE.outro = function (svg, u, t) {
  return G("translate(160 8) scale(.235)", gutCloseup(t, { after: 1, hlPouch: 1 }) + flow(FOOD_NEW, t, 8, .15, FOODC, 13, 1, 1) + flow(JUICE, t, 9, .12, BILE, 11)) +
    callout("1", 208, 66, ease(u / .3)) + callout("2", 300, 96, ease(u / .3 - .5)) + callout("3", 322, 150, ease(u / .3 - 1)) + callout("4", 250, 250, ease(u / .3 - 1.5));
};
