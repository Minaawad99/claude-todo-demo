// ── «ليه بتكح أكتر لما تبطّل سجاير؟» — drawings. Shapes from real references (refs/SOURCES.md):
// · the airway tree after Gray's Anatomy fig. 961: larynx on top, a trachea of C-shaped cartilage rings, the right main
//   bronchus shorter, wider and steeper than the left, then the branching bronchi;
// · the lungs after Gray's fig. «Heart and lungs»: right lung (viewer's left) in three lobes, left lung in two with the
//   cardiac notch, apexes above the bronchi, concave bases on the diaphragm;
// · the airway wall after the OpenStax trachea micrograph (2308) and the Dartmouth SEM of bronchiolar cilia: air on top,
//   a thin mucus blanket riding on the cilia tips, a watery layer the cilia beat in, tall columnar cells with their nuclei
//   at different heights and cup-shaped goblet cells between them, glands under them, hyaline cartilage at the bottom.
// People: the shared person kit (PERSON.front), dressed for the topic (casual for the smoker, doctor for the doctor).

var LUNG = "#e4b4a4", LUNG_D = "#c98b7c", AIRW = "#a9a874", AIRW_D = "#7f7f4e", RING = "#e6dcc4", CART = "#dfe3dc", CART_D = "#b9c3bd",
    CELL = "#ebc6b4", CELL_D = "#d49f8b", NUC = "#7b5a70", MUC = "#cfc58f", MUC_D = "#a3965c", PCL = "#d9e5e6", SUB = "#f0dccb",
    TAR = "#5b4b3d", SMOKE = "#9a958c", CHILI = "#b8402c", BLOOD = "#a8332a";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function along(pts, k) {
  var segs = [], tot = 0, i; for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  var d = clamp(k) * tot; for (i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) return L2(pts[i], pts[i + 1], clamp(d / segs[i])); d -= segs[i]; }
}
function wob(t, a, sp) { return a * Math.sin(t * (sp || 2)); }

// ═════════ the lungs and the airway tree (front view, designed on a 640-wide sheet, trachea on x = 320) ═════════
var RL = "M268 176 C226 166 160 222 134 318 C112 404 100 520 96 622 C132 646 206 654 252 634 C272 604 286 566 290 520 L292 336 C291 262 284 204 268 176 Z",
    LLg = "M374 176 C416 166 482 222 508 318 C530 404 542 520 546 622 C512 646 456 652 414 634 C398 606 420 566 410 532 C398 492 362 482 354 440 L350 336 C351 262 358 204 374 176 Z";
// the branching tree: deterministic, grown from the two main bronchi
var TREE = (function () {
  var segs = [];
  function grow(x, y, ang, len, w, dep, seed) {
    var a = ang * Math.PI / 180, x2 = x + Math.sin(a) * len, y2 = y + Math.cos(a) * len;
    segs.push({ a: [x, y], b: [x2, y2], w: w, dep: dep });
    if (dep >= 5) return;
    var sp = 24 + 10 * hash(seed);
    grow(x2, y2, ang - sp, len * (.7 + .1 * hash(seed + 3)), w * .66, dep + 1, seed * 2 + 1);
    grow(x2, y2, ang + sp * .9, len * (.66 + .1 * hash(seed + 7)), w * .62, dep + 1, seed * 2 + 2);
  }
  grow(304, 318, 28, 62, 15, 1, 11);    // right main bronchus continues down and out (viewer's left)
  grow(342, 326, -44, 74, 12, 1, 23);   // left main bronchus: longer, flatter
  return segs;
})();
// o: {tar 0..1 (grey speckles), tree 0..1 (draw-on), hlTree, rings, dim, breathe 0..1, blobs: [[x,y],…], co: k}
function lungs(t, o) {
  o = o || {}; var s = "", br = 1 + .018 * Math.sin(t * 1.6) * (o.breathe == null ? 1 : o.breathe), id = "lg" + (++CLIPN);
  s += '<clipPath id="' + id + '"><path d="' + RL + '"/><path d="' + LLg + '"/></clipPath>';
  var lobes = P(RL, LUNG, 2.6) + P(LLg, LUNG, 2.6);
  lobes += '<g clip-path="url(#' + id + ')">';
  // shading toward the edges and the lobe fissures (horizontal + oblique on the right, oblique on the left)
  lobes += '<path d="M96 300 C150 340 170 520 160 660 L80 660 L80 300 Z M546 300 C492 340 472 520 482 660 L560 660 L560 300 Z" fill="' + LUNG_D + '" opacity=".35"/>';
  lobes += '<path d="' + RL + '" fill="url(#hatch)" opacity=".22"/><path d="' + LLg + '" fill="url(#hatch)" opacity=".22"/>';
  lobes += '<path d="M104 418 C160 410 230 420 292 428 M118 330 C170 420 210 540 232 650 M376 250 C420 330 470 470 500 650" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
  // the tree, inside the lungs
  var tk = o.tree == null ? 1 : o.tree;
  TREE.forEach(function (g, i) {
    var kk = clamp(tk * 6 - (g.dep - 1)); if (kk <= 0) return;
    var b = L2(g.a, g.b, kk), d = "M" + f(g.a[0]) + " " + f(g.a[1]) + " L" + f(b[0]) + " " + f(b[1]);
    lobes += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(g.w + 3) + '" stroke-linecap="round" fill="none" opacity=".75"/><path d="' + d + '" stroke="' + (o.hlTree ? "#c3c58a" : "#d9cfae") + '" stroke-width="' + f(g.w) + '" stroke-linecap="round" fill="none"/>';
  });
  if (o.tar) { for (var j = 0; j < 160; j++) { var px = 100 + 440 * hash(j * 3.1), py = 190 + 450 * hash(j * 7.7), r = 1.5 + 3.5 * hash(j + .5); lobes += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r) + '" fill="' + TAR + '" opacity="' + f(.55 * o.tar) + '"/>'; }
    lobes += '<path d="' + RL + '" fill="' + TAR + '" opacity="' + f(.22 * o.tar) + '"/><path d="' + LLg + '" fill="' + TAR + '" opacity="' + f(.22 * o.tar) + '"/>'; }
  lobes += '</g>';
  // main bronchi and the trachea with C-rings, the larynx on top
  var air = '<path d="M320 286 C312 300 306 310 300 322 M320 286 C330 300 340 314 346 330" stroke="' + INK + '" stroke-width="22" stroke-linecap="round" fill="none"/>' +
    '<path d="M320 286 C312 300 306 310 300 322 M320 286 C330 300 340 314 346 330" stroke="' + (o.hlTree ? "#c3c58a" : RING) + '" stroke-width="17" stroke-linecap="round" fill="none"/>';
  air += R(302, 60, 36, 232, o.hlTree ? "#c3c58a" : "#ece4d0", 2.4);
  for (var y = 76; y < 286; y += 13) air += '<path d="M303 ' + y + ' Q320 ' + (y + 5) + ' 337 ' + y + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
  air += P("M296 60 L292 18 C300 6 340 6 348 18 L344 60 Z", "#e2d6bb", 2.4) + P("M306 30 L320 44 L334 30", "none", 1.6);
  s += G("translate(320 640) scale(" + f(br) + " " + f(1 + (br - 1) * .5) + ") translate(-320 -640)", lobes) + air;
  if (o.blobs) o.blobs.forEach(function (p) { s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="11" ry="8" fill="' + MUC + '" stroke="' + INK + '" stroke-width="1.8"/>'; });
  return o.dim ? dim(o.dim, s) : s;
}
// a path from a lower branch of the right lung, up the main bronchus and the trachea to the throat
var UPPATH = [[196, 560], [232, 452], [270, 372], [304, 318], [320, 286], [320, 60], [320, 0]];

// ═════════ the airway wall, cut open (close-up) ═════════
// o: {len (cilia length 1 healthy … .55 smoker), dens (1 … .6), speed (1 … .3), muc (blanket thickness 1 … 2.4), gob (goblet size 1 … 1.6),
//     dust 0..1 (trapped specks), smoke 0..1, hl: "muc"|"cil"|"gob", x: scroll, beat (cilia frequency, default 1.2)}
var CW = 40, CY = 372, CB = 520;
function wall(t, o) {
  o = o || {}; var s = "", len = o.len == null ? 1 : o.len, dens = o.dens == null ? 1 : o.dens, sp = o.speed == null ? 1 : o.speed,
      muc = o.muc == null ? 1 : o.muc, gob = o.gob == null ? 1 : o.gob, L = 58 * len, gobEvery = o.gobEvery || 5;
  var mv = t * 26 * sp;   // the blanket's drift (px)
  // submucosa with a gland and a small vessel; hyaline cartilage at the bottom
  s += R(-80, CB, 800, 300, SUB, 0) + '<rect x="-80" y="' + CB + '" width="800" height="300" fill="url(#hatch)" opacity=".18"/>';
  for (var gI = 0; gI < 3; gI++) { var gx = 40 + gI * 250; for (var a = 0; a < 6; a++) s += C(gx + 34 * Math.cos(a), CB + 70 + 22 * Math.sin(a), 15, "#e3c0a6", 1.6) + C(gx + 34 * Math.cos(a), CB + 70 + 22 * Math.sin(a), 4, "#f6eee2", 1); }
  s += C(560, CB + 64, 16, "#c86b5f", 2) + C(170, CB + 96, 11, "#c86b5f", 1.8);
  s += P("M-80 " + (CB + 140) + " C120 " + (CB + 130) + " 420 " + (CB + 150) + " 720 " + (CB + 136) + " L720 800 L-80 800 Z", CART, 2.4);
  for (var c2 = 0; c2 < 26; c2++) { var cx = -60 + c2 * 30 + 12 * hash(c2), cy = CB + 175 + 60 * hash(c2 + 9); s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="9" ry="6" fill="' + CART_D + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="2.6" fill="' + NUC + '"/>'; }
  // the watery layer the cilia beat in
  s += R(-80, CY - L - 10, 800, L + 12, PCL, 0);
  // cells
  for (var i = -2; i < 18; i++) {
    var x = i * CW, isG = ((i % gobEvery) + gobEvery) % gobEvery === 2;
    if (isG) {
      var bw = CW * .5 * gob, top = CY - 4;
      s += P("M" + f(x + CW / 2 - 7) + " " + CB + " C" + f(x + CW / 2 - 7) + " " + (CB - 60) + " " + f(x + CW / 2 - bw) + " " + (CY + 70) + " " + f(x + CW / 2 - bw) + " " + (CY + 30) + " C" + f(x + CW / 2 - bw) + " " + top + " " + f(x + CW / 2 + bw) + " " + top + " " + f(x + CW / 2 + bw) + " " + (CY + 30) + " C" + f(x + CW / 2 + bw) + " " + (CY + 70) + " " + f(x + CW / 2 + 7) + " " + (CB - 60) + " " + f(x + CW / 2 + 7) + " " + CB + " Z", o.hl === "gob" ? "#e0d6a2" : "#efe3c4", 2);
      for (var dI = 0; dI < 7; dI++) s += C(x + CW / 2 + (hash(i * 13 + dI) - .5) * bw * 1.1, CY + 14 + dI * 9 * Math.min(1.3, gob), 5 * Math.min(1.4, gob), MUC, 1);
      s += '<ellipse cx="' + f(x + CW / 2) + '" cy="' + (CB - 24) + '" rx="5" ry="9" fill="' + NUC + '"/>';
      // a drop of mucus leaving the cup
      var ph = (t * .5 * gob + hash(i)) % 1; s += '<ellipse cx="' + f(x + CW / 2) + '" cy="' + f(CY - 4 - ph * (L + 4)) + '" rx="' + f(4 + 2 * gob) + '" ry="' + f(5 + 2 * gob) + '" fill="' + MUC + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - ph * .6) + '"/>';
      continue;
    }
    s += R(x, CY, CW, CB - CY, CELL, 1.6);
    var ny = CY + 40 + 70 * hash(i * 5.3); s += '<ellipse cx="' + f(x + CW / 2) + '" cy="' + f(ny) + '" rx="8" ry="15" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1"/>';
    // cilia: each one bends with a travelling (metachronal) wave, a fast power stroke toward the throat (right)
    for (var k = 0; k < 8; k++) {
      var cxk = x + 3 + k * (CW - 6) / 7, hk = hash(i * 31 + k * 7);
      if (hk > dens) continue;
      var Lk = L * (len < 1 ? .55 + .45 * hash(i * 17 + k) * (len + .2) : .92 + .08 * hk), phase = (t * (o.beat || 1.2) * sp - cxk / 160) * Math.PI * 2;
      var sw = Math.sin(phase), ang = (14 + 34 * sw) * Math.PI / 180, bend = (sw > 0 ? -10 : 18) * Math.cos(phase);
      var tx = cxk + Math.sin(ang) * Lk, ty = CY - Math.cos(ang) * Lk, mx = cxk + Math.sin(ang) * Lk * .5 + bend * .4, my = CY - Math.cos(ang) * Lk * .5;
      var d = "M" + f(cxk) + " " + CY + " Q" + f(mx) + " " + f(my) + " " + f(tx) + " " + f(ty);
      s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + (o.hl === "cil" ? "#c3c58a" : "#f3ece0") + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    }
  }
  // the mucus blanket riding on the cilia tips, drifting right (toward the throat)
  var bot = CY - L - 6, th = 30 * muc, d2 = "M-80 " + f(bot), d3 = "";
  for (var xx = -80; xx <= 720; xx += 20) d2 += " L" + xx + " " + f(bot - th - 5 * Math.sin((xx - mv) / 38) - 3 * Math.sin((xx - mv) / 13));
  d2 += " L720 " + f(bot) + " Z";
  s += P(d2, o.hl === "muc" ? "#d9cf86" : MUC, 2.2);
  for (var st = 0; st < 14; st++) { var sx = ((st * 64 + mv) % 860) - 100, sy = bot - th * (.3 + .4 * hash(st)); d3 += '<path d="M' + f(sx) + ' ' + f(sy) + ' q16 -5 30 0" stroke="' + MUC_D + '" stroke-width="2" fill="none"/>'; }
  s += d3;
  // trapped dust (brown specks) and microbes (olive rods), carried with the blanket
  if (o.dust) for (var p = 0; p < 12; p++) {
    var px = ((p * 71 + mv) % 860) - 100, py = bot - th * (.25 + .5 * hash(p + 2)), isM = p % 3 === 0;
    s += G("", isM ? '<rect x="' + f(px - 9) + '" y="' + f(py - 4) + '" width="18" height="8" rx="4" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + f(40 * hash(p)) + ' ' + f(px) + ' ' + f(py) + ')"/>'
      : '<path d="M' + f(px - 5) + ' ' + f(py + 3) + ' L' + f(px - 2) + ' ' + f(py - 5) + ' L' + f(px + 6) + ' ' + f(py - 2) + ' L' + f(px + 4) + ' ' + f(py + 5) + ' Z" fill="#8a6a48" stroke="' + INK + '" stroke-width="1"/>', o.dust);
  }
  if (o.smoke) s += smokeWisps(t, 0, 60, 640, bot - th - 60, o.smoke);
  return s;
}
function smokeWisps(t, x0, y0, w, h, k) {
  var s = ""; for (var i = 0; i < 7; i++) { var y = y0 + h * hash(i + 4), x = x0 + ((i * 120 + t * 40) % (w + 200)) - 100;
    s += '<path d="M' + f(x) + ' ' + f(y) + ' c30 -24 60 24 90 0 s60 -24 90 0" stroke="' + SMOKE + '" stroke-width="' + f(10 + 6 * hash(i)) + '" stroke-linecap="round" fill="none" opacity="' + f(.45 * k) + '"/>'; }
  return s;
}
// the wall seen whole: a short tube section with a blanket band, for "the pipes are lined" (line 8)
function tubeCut(t, k) {
  var s = "", c = [320, 400];
  s += '<ellipse cx="200" cy="400" rx="90" ry="190" fill="' + CART + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="M200 210 L560 210 L560 590 L200 590" fill="' + CELL + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<ellipse cx="200" cy="400" rx="70" ry="160" fill="' + CELL + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<ellipse cx="200" cy="400" rx="' + f(52 + 4 * Math.sin(t * 2)) + '" ry="140" fill="' + MUC + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<ellipse cx="200" cy="400" rx="40" ry="122" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var y = 230; y < 590; y += 34) s += '<path d="M230 ' + y + ' L560 ' + y + '" stroke="' + CART_D + '" stroke-width="6"/>';
  s += '<path d="M200 210 L560 210 M200 590 L560 590" stroke="' + INK + '" stroke-width="2.6"/>';
  return s;
}

// ═════════ props ═════════
function cigarette(x, y, ang, len, lit, t) {
  var s = G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ")", R(0, -5, len * .72, 10, "#f6f2ea", 1.6) + R(len * .72, -5, len * .28, 10, "#d79a52", 1.6) + (lit ? '<rect x="-4" y="-5" width="5" height="10" fill="' + ORANGE + '"/>' : ""));
  if (lit) for (var i = 0; i < 3; i++) { var p = (t * .5 + i / 3) % 1; s += '<path d="M' + f(x - 6 + 10 * Math.sin(p * 6 + i)) + ' ' + f(y - 10 - p * 70) + ' q8 -8 0 -16" stroke="' + SMOKE + '" stroke-width="3" fill="none" opacity="' + f(.7 * (1 - p)) + '"/>'; }
  return s;
}
function brokenCig(x, y, k) {
  return G("translate(" + f(x) + " " + f(y) + ")", G("rotate(" + f(-18 * k) + ")", R(-70, -6, 66, 12, "#f6f2ea", 1.8) + R(-90, -6, 20, 12, "#d79a52", 1.8)) + G("rotate(" + f(18 * k) + ")", R(4, -6, 66, 12, "#f6f2ea", 1.8) + '<path d="M4 -6 l4 6 l-4 6" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'));
}
function chili(x, y, s, rot) {
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + s + ")",
    '<path d="M-6 -40 C10 -44 18 -30 16 -10 C14 20 4 46 -14 62 C-18 66 -22 62 -20 58 C-10 36 -14 6 -18 -18 C-20 -32 -16 -40 -6 -40 Z" fill="' + CHILI + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M-14 -40 C-6 -48 8 -48 12 -38 C4 -34 -6 -34 -14 -40 Z" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M0 -44 C2 -54 8 -60 16 -62" stroke="' + OLIVE + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M6 -30 C8 -10 4 10 -4 30" stroke="#e7a092" stroke-width="3" fill="none" opacity=".7"/>');
}
function exhaust(t) {   // the back of a car: bumper, the tail pipe and its fumes (for the analogy box)
  var s = R(-50, -16, 100, 28, "#8f99a0", 1.8, 6) + R(-46, 12, 22, 8, INK, 0) + R(-38, -30, 76, 16, "#b6bfc4", 1.6, 4) + R(28, 6, 26, 9, "#6b6560", 1.6, 2);
  for (var i = 0; i < 4; i++) { var p = (t * .7 + i / 4) % 1; s += C(56 + p * 40, 10 - p * 22, 5 + 10 * p, "#b9b4aa", 1.2).replace('fill="#b9b4aa"', 'fill="#b9b4aa" opacity="' + f(1 - p) + '"'); }
  return s;
}
function flypaper(t) {   // a hanging sticky strip with flies stuck on it
  var s = '<path d="M0 -50 V-38" stroke="' + INK + '" stroke-width="2"/>' + R(-12, -38, 24, 86, "#e6c65a", 1.8);
  [[-4, -20], [5, 4], [-3, 28]].forEach(function (q, i) { s += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="4" ry="3" fill="' + INK + '"/><path d="M' + q[0] + ' ' + q[1] + ' l-7 -5 M' + q[0] + ' ' + q[1] + ' l7 -5" stroke="' + INK + '" stroke-width="1" opacity=".7"/>'; });
  var fx = 30 - 8 * Math.sin(t * 3), fy = -26 + 6 * Math.cos(t * 4); s += '<ellipse cx="' + f(fx) + '" cy="' + f(fy) + '" rx="4" ry="3" fill="' + INK + '"/>';
  return s;
}
function escalator(t) {   // side view: steps climbing to the right
  var s = '<path d="M-48 36 L-30 36 L30 -24 L48 -24" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M-48 18 L-34 18 L26 -42 L48 -42" stroke="' + INK + '" stroke-width="2" fill="none"/>';
  for (var i = 0; i < 5; i++) { var p = ((t * .35 + i / 5) % 1), x = -30 + p * 60, y = 36 - p * 60; s += R(x - 8, y - 9, 12, 9, "#c9b48c", 1.2); }
  return s + arrow(-20, -10, 10, -40, ORANGE, 3, 1);
}
function calendarWeeks(x, y, n, on, lbl) {
  var s = ""; for (var i = 0; i < n; i++) { var c = i < on, cx = x + (i - (n - 1) / 2) * 62; s += R(cx - 26, y - 22, 52, 44, c ? "#f4ecdb" : PAPER, 1.8, 4) + R(cx - 26, y - 22, 52, 11, c ? ORANGE : "#c9bfa8", 1.4, 0) + N(String(i + 1), cx, y + 17, 20, INK); }
  return s + (lbl ? T(lbl, x, y + 52, 20, INK, 700) : "");
}
function gauge(x, y, r, k, lbl) {
  var s = P("M" + f(x - r) + " " + f(y) + " A" + r + " " + r + " 0 0 1 " + f(x + r) + " " + f(y), "#f4ecdb", 2.2);
  for (var i = 0; i <= 8; i++) { var a = Math.PI + i / 8 * Math.PI; s += '<path d="M' + f(x + Math.cos(a) * r * .8) + ' ' + f(y + Math.sin(a) * r * .8) + ' L' + f(x + Math.cos(a) * r * .95) + ' ' + f(y + Math.sin(a) * r * .95) + '" stroke="' + INK + '" stroke-width="' + (i % 4 ? 1.4 : 3) + '"/>'; }
  s += P("M" + f(x + r * .55) + " " + f(y - r * .55) + " A" + f(r * .78) + " " + f(r * .78) + " 0 0 1 " + f(x + r * .78) + " " + f(y), "none", 6, ' stroke="' + BLUE + '"');
  var a2 = Math.PI + (.2 + .65 * k) * Math.PI; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a2) * r * .72) + ' ' + f(y + Math.sin(a2) * r * .72) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
  return s + (lbl ? T(lbl, x, y + 34, 20, INK, 700) : "");
}
function blood(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + (sc || 1) + ")", '<path d="M0 -26 C10 -10 18 0 18 10 C18 22 10 28 0 28 C-10 28 -18 22 -18 10 C-18 0 -10 -10 0 -26 Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/>'); }
function coMol(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", C(-9, 0, 11, "#6f6a64", 1.8) + C(10, 0, 9, "#d9573a", 1.8) + T("C", -9, 5, 12, "#fff", 800) + T("O", 10, 4, 10, "#fff", 800)); }
function chart(x, y, k, hiK) {   // cough reports: smoking, week 1, week 2, week 4, week 6 (rise at week 1, then down; Ussher et al. 2003)
  var vals = [.32, .72, .6, .42, .26], w = 380, h = 200, s = R(x, y, w, h, "#f4ecdb", 2), pts = [];
  ["مدخن", "أسبوع 1", "أسبوع 2", "أسبوع 4", "أسبوع 6"].forEach(function (lb, i) { var px = x + 40 + i * 75; pts.push([px, y + h - 30 - vals[i] * 150]); s += T(lb, px, y + h - 8, 14, INK, 600); });
  s += '<path d="M' + (x + 20) + ' ' + (y + h - 26) + ' H' + (x + w - 14) + '" stroke="' + INK + '" stroke-width="1.6"/>';
  var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"); s += draw(d, k, ORANGE, 4);
  pts.forEach(function (p, i) { if (k * 4 >= i) s += C(p[0], p[1], i === 1 ? 8 : 5, i === 1 ? ORANGE : INK, 1.4); });
  if (hiK) s += G("", '<circle cx="' + f(pts[1][0]) + '" cy="' + f(pts[1][1]) + '" r="' + f(18 + 3 * Math.sin(window.__t * 5)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>', hiK);
  return s + T("الكحة", x + 14, y + 26, 16, INK, 700, "start");
}

// ═════════ the man (shared person kit), casual clothes ═════════
var MAN = { outfit: "casual" }, PS = 2.3, PX0 = 320, PY0 = 860;   // waist-up close-up: hips below the panel edge
function man(t, o) {
  var base = Object.assign({ x: PX0, y: PY0, s: PS, legs: "stand", breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: wob(t, 2, 1.1) }, face: { eyes: 1, mouth: "neutral" } }, MAN, o || {});
  if (!base.arms) base.arms = [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, { to: [PX0 + 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: -1 }];
  return PERSON.front(base);
}
function headAt(o) { return man(0, o).joints.head; }
// the cough: fist to the mouth, eyes squeezed, head jerks forward on each cough (n coughs per second)
function coughMan(t, k, rate) {
  var c = Math.max(0, Math.sin(t * Math.PI * 2 * (rate || 1.3))), hd = headAt({}), m = [hd[0] + 8 * PS, hd[1] + 20 * PS], up = k > .5;
  var arm = up ? { to: [m[0], m[1] + 4 * c], hand: "fist", elbow: [-14, 56], front: true, rot: -150 } : { to: [PX0 + 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: -1 };
  var p = man(t, { head: { tilt: -3 + 6 * c * k, nod: .22 * c * k }, face: { eyes: up ? .15 : 1, brows: "worried", mouth: c > .4 ? "o" : "frown" },
    arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, arm] });
  var s = p.svg;
  if (up && c > .3) for (var i = 0; i < 3; i++) s += '<path d="M' + f(m[0] - 70 - i * 6) + ' ' + f(m[1] - 30 + i * 24) + ' l-30 ' + f(-12 + i * 12) + '" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" opacity="' + f(c) + '"/>';
  return s;
}

// ═════════ shots (line numbers from script.txt) ═════════
// 4 · «طب إيه اللي بيحصل جوه الرئة لما تبطّل؟»: the lungs draw themselves, the tree grows in
shot(4, push(320, 380, 1.08, 0.98), function (u, d, t) {
  return paper() + lungs(t, { tree: at(u, .2, 2.2) }) + label(160, 380, 130, 250, "الرئة", OLIVE, at(u, .8, .5), 26) + label(320, 160, 430, 90, "ماسورة الهوا", OLIVE, at(u, 1.4, .5), 24) + T("؟", 560, 220, 120, ORANGE, 800);
});
// 5 · carbon monoxide leaves within two days: CO molecules ride up the trachea and out; the car-exhaust analogy box
shot(5, push(320, 360, 1.0, 1.06), function (u, d, t) {
  var s = paper() + lungs(t, { tar: .25 });
  for (var i = 0; i < 9; i++) { var p = ((u * .28 + i / 9) % 1), q = along(UPPATH.map(function (pp, j) { return i % 2 ? [640 - pp[0], pp[1]] : pp; }), p); s += G("", coMol(q[0], q[1], .9), Math.min(1, at(u, .2 + i * .15, .4)) * (p > .9 ? (1 - p) * 10 : 1)); }
  s += iconBox(540, 110, 130, G("translate(-8 10)", exhaust(t)), at(u, 1.6, .4)) + tag("يومين", 120, 120, at(u, .5, .4), 30, ORANGE);
  return s + label(338, 120, 470, 240, "أول أكسيد الكربون", BLUE, at(u, 1.0, .5), 22);
});
// 6 · UK study 2003: the cough chart rises at week one, then falls
shot(6, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + G("translate(-42 -40) scale(1.15)", chart(60, 300, at(u, .6, 2.6), at(u, 3, .4))) + tag("إنجلترا 2003", 320, 200, at(u, .2, .4), 28);
});
// 7 · «ليه أصلاً فيه مخاط؟»: fly into one bronchus — the lungs zoom toward a branch
shot(7, function (u, d) { var k = ease(u / d); return [lerp(320, 210, k), lerp(400, 470, k), lerp(1, 2.6, k)]; }, function (u, d, t) {
  return paper() + lungs(t, {}) + G("", '<circle cx="210" cy="470" r="' + f(34 + 4 * Math.sin(t * 4)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4"/>', at(u, .4, .4)) + T("؟", 270, 430, 70, ORANGE, 800);
}, { tr: "fade" });
// 8 · the pipes are lined inside with a sticky blanket: a cut tube, then the wall close-up label
shot(8, push(330, 400, 1.06, 0.98), function (u, d, t) {
  return paper() + tubeCut(t, 1) + label(160, 300, 150, 140, "مخاط لزج", BLUE, at(u, .6, .5), 26) + label(420, 230, 470, 120, "جدار الماسورة", OLIVE, at(u, 1.2, .5), 24);
}, { tr: "in" });
// 9 · the blanket traps dust and microbes (flypaper box); specks fall in from the air and stick
shot(9, push(320, 360, 1.0, 1.05), function (u, d, t) {
  var s = paper() + wall(t, { dust: 1 });
  for (var i = 0; i < 6; i++) { var p = clamp((u - .3 - i * .35) / 1.2), x = 60 + i * 100, y = lerp(40, 260 + 10 * hash(i), ease(p)); if (p < 1) s += i % 2 ? '<rect x="' + f(x - 9) + '" y="' + f(y - 4) + '" width="18" height="8" rx="4" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.2"/>' : '<path d="M' + f(x - 5) + ' ' + f(y + 3) + ' L' + f(x - 2) + ' ' + f(y - 5) + ' L' + f(x + 6) + ' ' + f(y - 2) + ' L' + f(x + 4) + ' ' + f(y + 5) + ' Z" fill="#8a6a48" stroke="' + INK + '" stroke-width="1"/>'; }
  return s + iconBox(550, 90, 120, flypaper(t), at(u, 1.4, .4)) + label(220, 262, 250, 120, "تراب وميكروبات", ORANGE, at(u, 1.8, .5), 22);
});
// 10 · the cilia beat together and push the blanket up toward the throat (escalator box)
shot(10, push(330, 380, 1.08, 1.0), function (u, d, t) {
  return paper() + wall(t, { hl: at(u, .3, .4) > .5 ? "cil" : "", dust: 1 }) + label(200, 330, 110, 130, "شعيرات", OLIVE, at(u, .5, .5), 26) +
    arrow(360, 180, 600, 180, ORANGE, 6, at(u, 1.2, .6)) + T("للزور", 560, 160, 26, ORANGE, 800) + iconBox(90, 90, 120, escalator(t), at(u, 2.2, .4));
});
// 11 · up at the throat you swallow it without noticing: the blanket rides up the trachea
shot(11, push(320, 300, 1.0, 1.1), function (u, d, t) {
  var blobs = []; for (var i = 0; i < 5; i++) { var p = (u * .22 + i / 5) % 1; blobs.push(along(UPPATH, .25 + .75 * p)); }
  return paper() + lungs(t, { blobs: blobs }) + label(320, 30, 440, 80, "الزور", OLIVE, at(u, .4, .5), 26) + check(520, 220, 1, at(u, 1.4, .4), OLIVE);
}, { tr: "out" });
// 12 · «والسجاير بتعمل إيه في ده؟»: the man lights a cigarette, smoke rises
shot(12, push(320, 430, 1.0, 1.08), function (u, d, t) {
  var hd = headAt({}), m = [hd[0] - 4 * PS, hd[1] + 22 * PS], k = at(u, .2, .6);
  var p = man(t, { face: { eyes: .9, mouth: "neutral", look: [-.3, 0] }, arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, (k > .5 ? { to: [hd[0] + 14 * PS, hd[1] + 30 * PS], hand: "relaxed", elbow: [-8, 52], front: true, rot: -120 } : { to: [PX0 + 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: -1 })] });
  var w = p.joints.wr[1];
  return paper() + p.svg + cigarette(w[0] - 20, w[1] - 14, 160, 70, true, t) + smokeWisps(t, 0, 60, 640, 200, at(u, .6, 1)) + T("؟", 120, 260, 120, ORANGE, 800);
});
// 13 · smoke makes the pipes pour out more, thicker mucus: goblet cells swell, the blanket thickens
shot(13, push(320, 380, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .4, 2.4);
  return paper() + wall(t, { smoke: 1, gob: lerp(1, 1.6, k), muc: lerp(1, 2.3, k), gobEvery: k > .5 ? 3 : 5, hl: "gob" }) + label(100, 420, 160, 640, "خلايا المخاط", OLIVE, at(u, 1, .5), 22) + tag("أكتر وأتقل", 470, 110, at(u, 2, .4), 28, BLUE);
});
// 14 · the cilia get fewer and shorter, the escalator slows and mucus piles up
shot(14, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 2.2);
  return paper() + wall(t, { len: lerp(1, .55, k), dens: lerp(1, .6, k), speed: lerp(1, .25, k), muc: 2.3, gob: 1.6, gobEvery: 3, dust: 1, smoke: .5, hl: "cil" }) +
    cross(560, 140, .9, at(u, 2.6, .5)) + iconBox(90, 90, 120, escalator(t * lerp(1, .2, k)), at(u, 1.6, .4)) + label(240, 330, 330, 150, "أقل وأقصر", ORANGE, at(u, 1.0, .5), 24);
});
// 15 · «طب ولما تبطّل؟»: the man breaks the cigarette
shot(15, push(320, 430, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .5, .4);
  return paper() + man(t, { face: { eyes: 1, mouth: k > .5 ? "smile" : "neutral", brows: "raised" } }).svg + brokenCig(320, 300, k) + T("؟", 520, 250, 110, ORANGE, 800);
});
// 16 · 29 smokers, a chili spray test: cough reflex sharper after two weeks
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, 2, 1.6);
  return paper() + numBox("29", 140, 150, at(u, .2, .3), 46) + T("مدخن", 140, 220, 24, INK, 700) + G("", chili(320, 200, 1.3, 20 + wob(t, 4, 2)), at(u, .8, .4)) +
    G("", (function () { var s = ""; for (var i = 0; i < 16; i++) { var p = (t * .6 + i / 16) % 1; s += C(370 + p * 160, 200 - 40 * Math.sin(i) * p, 3 + 3 * p, "#e7a092", 0); } return s; })(), at(u, 1, .4)) +
    gauge(320, 560, 150, k, "سرعة الكحة") + calendarWeeks(320, 690, 2, Math.min(2, Math.floor(at(u, 1.5, 1.2) * 2.99)), "");
});
// 17 · the cilia wake up and grow back over the following weeks
shot(17, push(320, 380, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .3, 3);
  return paper() + wall(t, { len: lerp(.55, 1, k), dens: lerp(.6, 1, k), speed: lerp(.25, 1, k), muc: 2.1, gob: lerp(1.6, 1.1, k), gobEvery: k > .6 ? 5 : 3, dust: 1, hl: "cil" }) +
    calendarWeeks(320, 110, 6, Math.round(k * 6), "") + check(560, 220, 1, at(u, 3, .4), OLIVE);
});
// 18 · the piled-up mucus comes out, and its only way out is the cough: blobs race up the tree, the man coughs
shot(18, push(320, 420, 1.02, 0.98), function (u, d, t) {
  var blobs = []; for (var i = 0; i < 8; i++) { var p = (u * .35 + i / 8) % 1; blobs.push(along(UPPATH, p)); }
  var s = paper();
  if (u < d * .45) s += lungs(t, { blobs: blobs, tar: .2 });
  else s += coughMan(t, at(u, d * .45, .4), 1.4);
  return s;
});
// 19 · the myth: «التبطيل بيأذي الرئة» — crossed out
shot(19, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + lungs(t, { dim: .3 }) + tag("التبطيل بيأذي الرئة", 320, 380, at(u, .3, .4), 30) + cross(320, 370, 2.6, at(u, d - 1.4, .6));
});
// 20 · it's the lungs cleaning themselves: the healthy wall, blanket flowing, a check; «كام أسبوع»
shot(20, push(320, 380, 1.06, 1.0), function (u, d, t) {
  return paper() + wall(t, { dust: 1, speed: 1.2 }) + arrow(300, 170, 600, 170, ORANGE, 6, at(u, .4, .5)) + check(130, 150, 1.2, at(u, .8, .4), OLIVE) + tag("كام أسبوع", 420, 110, at(u, 2.2, .4), 28, OLIVE);
});
// 21 · the doctor: more than three weeks, or blood → see a doctor
shot(21, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var hd = headAt({ outfit: "doctor" });
  var p = man(t, { outfit: "doctor", face: { eyes: 1, brows: "raised", mouth: "neutral" }, arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, { to: [hd[0] + 70 * PS, hd[1] - 4 * PS], hand: "point", bend: 1, rot: -90 }] });
  return paper() + p.svg + tag("+3 أسابيع", 140, 140, at(u, .4, .4), 30, ORANGE) + G("", blood(520, 140, 1.2), at(u, 1.6, .4)) + T("أو", 400, 150, 28, INK, 800);
});
// 22 · the recap: three panels in a row — more mucus, crippled cilia, cilia wake up + cough
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  function pnl(y, k, o, cap, n) { return G("", G("translate(16 " + f(y - 160) + ") scale(.62)", '<clipPath id="rc' + n + '"><rect x="-26" y="258" width="650" height="330"/></clipPath><g clip-path="url(#rc' + n + ')">' + wall(t, o) + '</g>') + R(0, y, 402, 205, "none", 2.4) + callout(String(n), 20, y + 20, k) + T(cap, 520, y + 112, 28, INK, 800), k); }
  return paper() + pnl(40, at(u, .2, .4), { muc: 2.2, gob: 1.6, gobEvery: 3, smoke: 1 }, "مخاط أكتر", 1) + pnl(290, at(u, 1.6, .4), { len: .55, dens: .6, speed: .3, muc: 2.2 }, "شعيرات مكسّحة", 2) +
    pnl(540, at(u, 3.4, .4), { muc: 1.4, speed: 1.2, dust: 1 }, "تصحى وتطلّعه", 3);
});
// 23 · the odd fact: one cell, ~200 cilia, beating more than 10 times a second
shot(23, push(320, 400, 1.08, 1.0), function (u, d, t) {
  var s = paper(), cx = 320, cy = 470;
  s += R(cx - 90, cy, 180, 260, CELL, 2.4) + '<ellipse cx="' + cx + '" cy="' + (cy + 150) + '" rx="34" ry="56" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var k = 0; k < 40; k++) { var x = cx - 86 + k * 4.4, ph = (t * 12 - k / 9) * Math.PI * 2 / 4, a = (16 + 30 * Math.sin(ph)) * Math.PI / 180, L = 150 + 10 * hash(k);
    var dd = "M" + f(x) + " " + cy + " Q" + f(x + Math.sin(a) * L * .5 - 6) + " " + f(cy - L * .5) + " " + f(x + Math.sin(a) * L) + " " + f(cy - Math.cos(a) * L);
    s += '<path d="' + dd + '" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="' + dd + '" stroke="#f3ece0" stroke-width="1.2" fill="none"/>'; }
  s += G("", N(count(200, at(u, .4, 1.6)), 140, 200, 64, ORANGE) + T("شعرة", 140, 240, 26, INK, 700), at(u, .3, .3));
  s += G("", N("+10", 520, 200, 56, ORANGE) + T("مرة في الثانية", 520, 240, 22, INK, 700), at(u, 2.4, .3));
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the man breaks a cigarette and smiles. line 1: a week later he coughs (calendar "أسبوع"). line 2: the lungs with a question
  var u0 = t - LN[0].start;
  if (li === 0) return G("translate(-16 -150) scale(.95)", man(t, { face: { eyes: 1, mouth: u0 > 1.2 ? "smile" : "neutral", brows: "raised" } }).svg + brokenCig(320, 300, ease((u0 - .6) / .4)));
  if (li === 1) { var u1 = t - LN[1].start; return G("translate(-16 -150) scale(.95)", coughMan(t, ease((u1 - .8) / .4), 1.3)) + iconBox(520, 90, 120, calendarWeeks(0, 0, 1, 1, "") + T("أسبوع", 0, 44, 18, INK, 800), ease(u1 / .4)); }
  var u2 = t - LN[2].start;
  return G("translate(14 0) scale(.92)", lungs(t, { tar: .35 })) + T("؟", 520, 160, 140, ORANGE, 800) + cross(300, 520, .6, 0);
};
SCENE.bumper = function (u, t) {
  return G("translate(90 108) scale(.24) translate(-320 -340)", lungs(t, { breathe: 3 }));
};
SCENE.outro = function (svg, u, t) {
  var s = G("translate(40 0) scale(.42)", lungs(t, {})) + inset(430, 140, 120, G("translate(-430 -360) scale(1.1)", wall(t, { dust: 1 })), ease(u / .4));
  return s + callout("1", 175, 170, ease(u / .3 - .5)) + callout("2", 380, 70, ease(u / .3 - 1)) + callout("3", 400, 170, ease(u / .3 - 1.5)) + callout("4", 175, 20, ease(u / .3 - 2));
};
