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
    BONE = "#e6dcc4", TAR = "#5b4b3d", SMOKE = "#9a958c", CHILI = "#b8402c", BLOOD = "#a8332a";
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
function exhaust(t) {   // back half of a sedan from the side (real proportions: wheel ≈ ⅓ of the body height + roof), the tail pipe under the bumper
  var s = P("M-120 10 L-120 -24 C-112 -34 -70 -38 -40 -40 L-6 -74 C2 -80 40 -82 70 -80 L92 -54 C110 -50 128 -46 132 -36 L134 6 C134 12 128 16 120 16 L-120 16 Z", "#9aa6ad", 2.2);
  s += P("M-30 -42 L-2 -70 L40 -72 L40 -44 Z", "#d5e1e6", 1.6) + P("M48 -72 L66 -72 L84 -50 L48 -46 Z", "#d5e1e6", 1.6) + '<path d="M44 -74 L44 10" stroke="' + INK + '" stroke-width="1.4"/>';
  s += R(120, -40, 12, 14, "#c8503a", 1.4, 2) + '<path d="M-120 -14 H128" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
  [[-70, 16], [80, 16]].forEach(function (w) { s += C(w[0], w[1], 24, INK, 0) + C(w[0], w[1], 12, "#c9c9c4", 1.6); });
  s += R(118, 12, 30, 8, "#6b6560", 1.6, 3);   // tail pipe
  for (var i = 0; i < 5; i++) { var p = (t * .7 + i / 5) % 1; s += '<circle cx="' + f(152 + p * 60) + '" cy="' + f(16 - p * 30) + '" r="' + f(5 + 14 * p) + '" fill="#b9b4aa" opacity="' + f(.8 * (1 - p)) + '" stroke="' + INK + '" stroke-width="1"/>'; }
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
var MAN = { outfit: "casual" }, PS = 4.2, PX0 = 320, PY0 = 878;   // chest close-up: head on top, the chest (.87H–.655H) fills y 290–650   // waist-up close-up: hips below the panel edge
function man(t, o) {
  var base = Object.assign({ x: PX0, y: PY0, s: PS, legs: "stand", breath: (Math.sin(t * 1.6) + 1) / 2, head: { tilt: wob(t, 2, 1.1) }, face: { eyes: 1, mouth: "neutral" } }, MAN, o || {});
  if (!base.arms) base.arms = [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, { to: [PX0 + 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: -1 }];
  return PERSON.front(base);
}
function headAt(o) { return man(0, o).joints.head; }
// the cough: fist to the mouth, eyes squeezed, head jerks forward on each cough (n coughs per second)
function coughMan(t, k, rate) {
  var c = Math.max(0, Math.sin(t * Math.PI * 2 * (rate || 1.3))), hd = headAt({}), m = [hd[0] + 6 * PS, hd[1] + 13 * PS], up = k > .5;
  var arm = up ? { to: [m[0], m[1] + 4 * c], hand: "fist", elbow: [-12, 50], front: true, rot: -150 } : { to: [PX0 + 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: -1 };
  var p = man(t, { head: { tilt: -3 + 6 * c * k, nod: .22 * c * k }, face: { eyes: up ? .15 : 1, brows: "worried", mouth: c > .4 ? "o" : "frown" },
    arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, arm] });
  var s = p.svg;
  if (up && c > .3) for (var i = 0; i < 3; i++) s += '<path d="M' + f(m[0] - 70 - i * 6) + ' ' + f(m[1] - 30 + i * 24) + ' l-30 ' + f(-12 + i * 12) + '" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" opacity="' + f(c) + '"/>';
  return s;
}

// ═════════ the chest window: lungs, ribs and heart drawn INSIDE the man at their real places ═════════
// Surface anatomy as fractions of standing height H (adult, front view): larynx ≈ .87H (just under the chin), lung apex ≈ .825H
// (2–3 cm above the clavicle), clavicles and sternal notch ≈ .815H, carina (sternal angle) ≈ .79H, nipples / xiphoid ≈ .72H,
// lower lung edge ≈ .70H at the 6th rib in front and ≈ .67H at the side, lung field ≈ .17H wide. The kit's man stands with his
// hip joints at .52H, so a height h sits at y = PY0 − (h − .52)·400·PS.
function hy(h) { return PY0 - (h - .52) * 400 * PS; }
function hx(w) { return PX0 + w * 400 * PS; }
// lungs() is drawn on a sheet where the larynx top is y 10, the apexes y 170, the bases y 640 and the lung field x 96–546:
// map it onto those landmarks
var LSX = (hx(.088) - hx(-.088)) / 450, LSY = (hy(.665) - hy(.825)) / 470;
function lungFrame() { return "translate(" + f(PX0) + " " + f(hy(.825)) + ") scale(" + f(LSX) + " " + f(LSY) + ") translate(-320 -170)"; }
function ribs(op) {
  // after Gray's Anatomy fig. 112 (front of the thorax): the sternum (wide manubrium, narrower body, small xiphoid); each true
  // rib leaves the sternum as a pale costal cartilage running out and DOWN, then the bone turns out and UP and curves down
  // around the side; ribs 8–10 join the costal margin, the inverted V under the sternum. Heights as fractions of H.
  var s = "", Hs = 400 * PS, X = function (w) { return PX0 + w * Hs; }, Y = hy;
  function bone(d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + BONE + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>'; }
  function cart(d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" fill="none" stroke-linecap="round" opacity=".8"/><path d="' + d + '" stroke="#cfd6cf" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>'; }
  var attach = [.809, .792, .776, .763, .750, .738, .727];
  [-1, 1].forEach(function (d) {
    // ribs 8–10: the costal margin and the lower bone ends at the side
    s += cart("M" + f(X(d * .008)) + " " + f(Y(.722)) + " C" + f(X(d * .03)) + " " + f(Y(.70)) + " " + f(X(d * .06)) + " " + f(Y(.672)) + " " + f(X(d * .083)) + " " + f(Y(.655)), 6);
    for (var j = 0; j < 3; j++) s += bone("M" + f(X(d * (.074 + j * .006))) + " " + f(Y(.685 - j * .012)) + " Q" + f(X(d * (.092 + j * .002))) + " " + f(Y(.705 - j * .012)) + " " + f(X(d * .099)) + " " + f(Y(.69 - j * .014)), 7);
    for (var i = 0; i < 7; i++) {
      var yS = attach[i], drop = i < 2 ? .004 : .006 + (i - 2) * .007, xC = .032 + i * .006 + (i === 0 ? -.012 : 0), yC = yS - drop;
      var xP = i === 0 ? .06 : .072 + i * .002, yP = yC + (i === 0 ? .004 : .010), xE = i === 0 ? .07 : .097, yE = yC - .022 - i * .002;
      s += cart("M" + f(X(d * .012)) + " " + f(Y(yS)) + " Q" + f(X(d * (xC * .6))) + " " + f(Y(yS - drop * .2)) + " " + f(X(d * xC)) + " " + f(Y(yC)), i < 2 ? 7 : 6);
      s += bone("M" + f(X(d * xC)) + " " + f(Y(yC)) + " Q" + f(X(d * xP)) + " " + f(Y(yP + .012)) + " " + f(X(d * xE)) + " " + f(Y(yE)), 8);
    }
    // the clavicle: an S-curved bar from the top of the sternum out to the shoulder
    s += bone("M" + f(X(d * .014)) + " " + f(Y(.815)) + " C" + f(X(d * .045)) + " " + f(Y(.808)) + " " + f(X(d * .07)) + " " + f(Y(.822)) + " " + f(X(d * .105)) + " " + f(Y(.82)), 10);
  });
  // sternum: manubrium, body, xiphoid
  s += P("M" + f(X(-.018)) + " " + f(Y(.814)) + " L" + f(X(.018)) + " " + f(Y(.814)) + " L" + f(X(.013)) + " " + f(Y(.792)) + " L" + f(X(-.013)) + " " + f(Y(.792)) + " Z", BONE, 2);
  s += P("M" + f(X(-.012)) + " " + f(Y(.791)) + " L" + f(X(.012)) + " " + f(Y(.791)) + " L" + f(X(.014)) + " " + f(Y(.735)) + " L" + f(X(.006)) + " " + f(Y(.726)) + " L" + f(X(-.006)) + " " + f(Y(.726)) + " L" + f(X(-.014)) + " " + f(Y(.735)) + " Z", BONE, 2);
  s += P("M" + f(X(-.005)) + " " + f(Y(.726)) + " L" + f(X(.005)) + " " + f(Y(.726)) + " L" + f(X(0)) + " " + f(Y(.712)) + " Z", "#cfd6cf", 1.6);
  return G("", s, op == null ? .85 : op);
}
function heart(t) {   // in the middle, its apex toward the man's left (viewer's right), beating
  var b = 1 + .05 * Math.max(0, Math.sin(t * 7.5)), cx = PX0 + .018 * 400 * PS, cy = hy(.742);   // ≈ 12 cm wide (.07H), apex to his left
  return G("translate(" + f(cx) + " " + f(cy) + ") scale(" + f(b * .07 * 400 * PS / 130) + ") rotate(-30)", '<path d="M0 -46 C-30 -66 -70 -40 -58 -6 C-48 22 -10 44 6 62 C24 40 60 18 64 -10 C70 -44 30 -64 0 -46 Z" fill="#c8705f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-8 -50 C-6 -70 0 -84 12 -90" stroke="#c8705f" stroke-width="16" fill="none"/><path d="M-8 -50 C-6 -70 0 -84 12 -90" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".6"/>');
}
// the window: the shirt and skin cut open over the chest, the organs inside. o: lungs() options + {k: open 0..1, heart, ribs}
function chestWin(t, k, o) {
  o = o || {}; k = clamp(k); if (k <= 0) return ""; var id = "cw" + (++CLIPN), x0 = hx(-.105), x1 = hx(.105), y0 = hy(.87), y1 = hy(.655), r = 60;
  var win = "M" + f(PX0 - 24) + " " + f(y0) + " L" + f(PX0 + 24) + " " + f(y0) + " L" + f(PX0 + 30) + " " + f(hy(.83)) + " C" + f(x1 - 20) + " " + f(hy(.83)) + " " + f(x1) + " " + f(hy(.80)) + " " + f(x1) + " " + f(hy(.77)) + " L" + f(x1 - 8) + " " + f(y1 + r) + " Q" + f(x1 - 10) + " " + f(y1) + " " + f(x1 - 70) + " " + f(y1) + " L" + f(x0 + 70) + " " + f(y1) + " Q" + f(x0 + 10) + " " + f(y1) + " " + f(x0 + 8) + " " + f(y1 + r) + " L" + f(x0) + " " + f(hy(.77)) + " C" + f(x0) + " " + f(hy(.80)) + " " + f(x0 + 20) + " " + f(hy(.83)) + " " + f(PX0 - 30) + " " + f(hy(.83)) + " Z";
  var inner = '<path d="' + win + '" fill="#f3e3d6"/><path d="' + win + '" fill="url(#hatch)" opacity=".15"/>';
  inner += P("M" + f(x0) + " " + f(y1 + 18) + " C" + f(PX0 - 60) + " " + f(hy(.69)) + " " + f(PX0 + 60) + " " + f(hy(.69)) + " " + f(x1) + " " + f(y1 + 18), "none", 6, ' stroke="' + OLIVE + '" opacity=".8"');   // diaphragm
  inner += G(lungFrame(), lungs(t, o));
  if (o.heart !== false) inner += heart(t);
  if (o.ribs !== false) inner += ribs(o.ribsOp);
  if (o.extra) inner += o.extra;
  return G("", '<clipPath id="' + id + '"><path d="' + win + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g><path d="' + win + '" fill="none" stroke="' + INK + '" stroke-width="3"/>', k);
}
// a point on the lungs sheet → panel coordinates (for things that travel through the body)
function L2W(p) { return [PX0 + (p[0] - 320) * LSX, hy(.825) + (p[1] - 170) * LSY]; }
function clockChip(x, y, txt, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", R(-96, -34, 192, 68, "#f4ecdb", 2.2, 6) + C(-62, 0, 20, PAPER, 2) + '<path d="M-62 0 V-13 M-62 0 L-52 6" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + T(txt, 22, 10, 26, ORANGE, 800)); }
function pulse(x, y, w, t, rate, k) { var d = "M" + f(x) + " " + y, n = 60; for (var i = 0; i <= n; i++) { var xx = x + w * i / n, ph = ((i / n) * rate * 2 - t * rate) % 1, v = ph < 0 ? ph + 1 : ph; var yy = y - (v > .45 && v < .5 ? -18 : v >= .5 && v < .56 ? 46 : v >= .56 && v < .6 ? -14 : 0); d += " L" + f(xx) + " " + f(yy); } return draw(d, k == null ? 1 : k, ORANGE, 3.5); }

// ═════════ shots (line numbers from script.txt) ═════════
// 3 · 20 minutes: the pulse starts to calm — the heart in the open chest, the trace slowing
shot(3, push(320, 420, 1.02, 1.08), function (u, d, t) {
  var rate = lerp(1.8, 1.0, at(u, .8, 2));
  return paper() + man(t, { face: { eyes: 1, mouth: "neutral" } }).svg + chestWin(t, at(u, .1, .5), { ribsOp: .5 }) + clockChip(150, 110, "20 دقيقة", at(u, .2, .4)) + R(400, 60, 220, 110, "#f4ecdb", 2) + pulse(410, 125, 200, t, rate, at(u, .4, .5));
});
// 4 · 8 hours: half the carbon monoxide leaves the blood — CO molecules ride up the airway and out
function coStream(t, u, n, x) {
  var s = "", path = UPPATH.map(L2W).concat([[PX0 + 30, hy(.895)], [PX0 - 140, hy(.93)]]);
  for (var i = 0; i < n; i++) { var p = ((u * .25 + i / n) % 1), q = along(path, p); s += G("", coMol(q[0], q[1], .8), Math.min(1, at(u, .2 + i * .12, .4))); }
  return s;
}
shot(4, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + man(t, { face: { eyes: 1, mouth: "o" } }).svg + chestWin(t, 1, { ribsOp: .45, tar: .3 }) + coStream(t, u, 10) + clockChip(150, 110, "8 ساعات", at(u, .2, .4)) + tag("النص", 520, 120, at(u, 1.6, .4), 30, ORANGE);
});
// 5 · the same gas as a car's exhaust: the back of a car, big, its fumes made of the same CO molecules
shot(5, push(320, 420, 1.06, 0.98), function (u, d, t) {
  var s = paper() + G("translate(200 470) scale(1.8)", exhaust(t));
  for (var i = 0; i < 8; i++) { var p = (u * .3 + i / 8) % 1; s += G("", coMol(480 + p * 160, 490 - p * 200 + 20 * Math.sin(i), 1.1), Math.min(1, at(u, .3 + i * .1, .3)) * (1 - p)); }
  return s + label(500, 470, 470, 220, "أول أكسيد الكربون", BLUE, at(u, .8, .5), 24) + line0(410);
});
function line0(y) { return '<path d="M-100 ' + y + ' H740" stroke="' + INK + '" stroke-width="2" opacity="0"/>'; }
// 6 · after two days: all of it is out — the stream thins to nothing, a check
shot(6, push(320, 380, 1.06, 1.0), function (u, d, t) {
  var n = Math.max(0, Math.round(8 * (1 - at(u, .2, 1.4))));
  return paper() + man(t, { face: { eyes: 1, mouth: "smile" } }).svg + chestWin(t, 1, { ribsOp: .45 }) + coStream(t, u, n) + clockChip(150, 110, "يومين", at(u, .1, .4)) + check(520, 140, 1.2, at(u, 1.6, .4), OLIVE);
});
// 7 · after three days breathing is easier: the airways relax, the lungs fill wider, air arrows in
shot(7, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var b = (Math.sin(t * 1.5) + 1) / 2;
  return paper() + man(t, { breath: b, face: { eyes: .6, mouth: "smile", brows: "raised" }, head: { tilt: -4 } }).svg + chestWin(t, 1, { breathe: 3.5, hlTree: true, ribsOp: .45 }) + clockChip(150, 110, "3 أيام", at(u, .1, .4)) +
    G("", arrow(PX0 - 150, hy(.95), PX0 + 4, hy(.885), BLUE, 6, 1), .4 + .6 * b);
});
// 8 · «بس هنا بتحصل حاجة غريبة»: the man frowns, an orange «!» over him
shot(8, push(320, 420, 1.04, 1.0), function (u, d, t) {
  return paper() + man(t, { face: { eyes: 1.2, brows: "worried", mouth: "frown", look: [.3, -.2] }, head: { tilt: 5 } }).svg + chestWin(t, 1, { ribsOp: .45 }) + G("", T("!", 530, 260, 160, ORANGE, 900), at(u, .3, .3));
});
// 9 · a study in England, 2003
shot(9, push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + G("translate(-42 -40) scale(1.15)", chart(60, 300, at(u, .8, 1.6), 0)) + tag("إنجلترا 2003", 320, 200, at(u, .2, .4), 30);
});
// 10 · quitters coughed more after just one week: the week-1 point rings, the man coughs in a box
shot(10, push(320, 400, 1.0, 1.04), function (u, d, t) {
  return paper() + G("translate(-42 -40) scale(1.15)", chart(60, 300, 1, at(u, .3, .4))) + tag("إنجلترا 2003", 320, 200, 1, 30) + iconBox(520, 640, 200, '<clipPath id="cb"><rect x="-100" y="-100" width="200" height="200"/></clipPath><g clip-path="url(#cb)">' + G("translate(-128 -90) scale(.4)", coughMan(t, 1, 1.4)) + '</g>', at(u, .8, .4));
});
// 11 · «طب ليه؟»: the camera flies into the open chest, into one bronchus of the right lung
shot(11, function (u, d) { var k = ease(u / d), q = L2W([210, 470]); return [lerp(320, q[0], k), lerp(420, q[1], k), lerp(1, 2.8, k)]; }, function (u, d, t) {
  var q = L2W([210, 470]);
  return paper() + man(t, {}).svg + chestWin(t, 1, { ribsOp: .3 }) + G("", '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(16 + 2 * Math.sin(t * 4)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>', at(u, .2, .3)) + T("؟", 520, 260, 110, ORANGE, 800);
});
// 12 · the pipes are lined with sticky mucus: the cut tube
shot(12, push(330, 400, 1.06, 0.98), function (u, d, t) {
  return paper() + tubeCut(t, 1) + label(160, 300, 150, 140, "مخاط لزج", BLUE, at(u, .5, .5), 26) + label(420, 230, 470, 120, "جدار الماسورة", OLIVE, at(u, 1.0, .5), 24);
}, { tr: "in" });
// 13 · it traps dust and microbes, like flypaper
shot(13, push(320, 360, 1.0, 1.05), function (u, d, t) {
  var s = paper() + wall(t, { dust: 1 });
  for (var i = 0; i < 6; i++) { var p = clamp((u - .2 - i * .25) / 1), x = 60 + i * 100, y = lerp(40, 260 + 10 * hash(i), ease(p)); if (p < 1) s += i % 2 ? '<rect x="' + f(x - 9) + '" y="' + f(y - 4) + '" width="18" height="8" rx="4" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="1.2"/>' : '<path d="M' + f(x - 5) + ' ' + f(y + 3) + ' L' + f(x - 2) + ' ' + f(y - 5) + ' L' + f(x + 6) + ' ' + f(y - 2) + ' L' + f(x + 4) + ' ' + f(y + 5) + ' Z" fill="#8a6a48" stroke="' + INK + '" stroke-width="1"/>'; }
  return s + iconBox(550, 90, 120, flypaper(t), at(u, 1.2, .4)) + label(220, 262, 250, 120, "تراب وميكروبات", ORANGE, at(u, .6, .5), 22);
});
// 14 · under it, tiny hairs beat together
shot(14, push(330, 400, 1.1, 1.18), function (u, d, t) {
  return paper() + wall(t, { hl: "cil", dust: 1 }) + label(200, 330, 110, 130, "شعيرات", OLIVE, at(u, .3, .5), 28);
});
// 15 · they push the mucus up, like an escalator
shot(15, push(330, 380, 1.04, 1.0), function (u, d, t) {
  return paper() + wall(t, { dust: 1 }) + arrow(300, 180, 600, 180, ORANGE, 6, at(u, .2, .6)) + T("لفوق", 560, 160, 26, ORANGE, 800) + iconBox(90, 90, 120, escalator(t), at(u, .8, .4));
});
// 16 · up to the throat, swallowed without noticing: mucus beads ride up the airway inside the man to the throat
shot(16, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var blobs = []; for (var i = 0; i < 5; i++) { var p = (u * .25 + i / 5) % 1; blobs.push(along(UPPATH, .25 + .75 * p)); }
  return paper() + man(t, { face: { eyes: 1, mouth: "neutral" } }).svg + chestWin(t, 1, { blobs: blobs, heart: false, ribsOp: .3 }) + label(PX0, hy(.875), PX0 + 170, hy(.95), "الزور", OLIVE, at(u, .3, .5), 26) + check(520, 140, 1, at(u, 1.2, .4), OLIVE);
}, { tr: "out" });
// 17 · «طب والسجاير؟»: the man smokes
shot(17, push(320, 430, 1.0, 1.06), function (u, d, t) {
  var hd = headAt({}), k = at(u, .1, .4);
  var p = man(t, { face: { eyes: .9, mouth: "neutral", look: [-.3, 0] }, arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, { to: [lerp(PX0 + 52 * PS, PX0 + 44 * PS, k), lerp(PY0 + 30 * PS, hy(.735), k)], hand: "relaxed", elbow: [6, 48], rot: -60 }] });
  var w = p.joints.wr[1];
  return paper() + p.svg + cigarette(w[0] + 8, w[1] - 30, -70, 60, true, t) + smokeWisps(t, 0, 60, 640, 200, at(u, .4, 1)) + T("؟", 120, 260, 120, ORANGE, 800);
});
// 18 · smoke makes more, thicker mucus
shot(18, push(320, 380, 1.06, 0.98), function (u, d, t) {
  var k = at(u, .2, 1.8);
  return paper() + wall(t, { smoke: 1, gob: lerp(1, 1.6, k), muc: lerp(1, 2.3, k), gobEvery: k > .5 ? 3 : 5, hl: "gob" }) + label(100, 420, 160, 640, "خلايا المخاط", OLIVE, at(u, .8, .5), 22) + tag("أكتر وأتقل", 470, 110, at(u, 1.4, .4), 28, BLUE);
});
// 19 · and the hairs fewer and shorter
shot(19, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, 1.6);
  return paper() + wall(t, { len: lerp(1, .55, k), dens: lerp(1, .6, k), speed: lerp(1, .4, k), muc: 2.3, gob: 1.6, gobEvery: 3, smoke: .5, hl: "cil" }) + label(240, 330, 330, 150, "أقل وأقصر", ORANGE, at(u, .8, .5), 26);
});
// 20 · the escalator slows and the mucus piles up
shot(20, push(320, 380, 1.04, 1.0), function (u, d, t) {
  var k = at(u, .1, 1.4);
  return paper() + wall(t, { len: .55, dens: .6, speed: lerp(.4, .2, k), muc: lerp(2.3, 3, k), gob: 1.6, gobEvery: 3, dust: 1, smoke: .5 }) + iconBox(90, 90, 120, escalator(t * .2), at(u, .2, .4)) + cross(560, 120, .9, at(u, 1.2, .5));
});
// 21 · «طب ولما تبطّل؟»: the man breaks the cigarette
shot(21, push(320, 430, 1.04, 0.98), function (u, d, t) {
  var k = at(u, .3, .4);
  return paper() + man(t, { face: { eyes: 1, mouth: k > .5 ? "smile" : "neutral", brows: "raised" } }).svg + brokenCig(480, 230, k) + T("؟", 120, 200, 110, ORANGE, 800);
});
// 22 · the hairs wake up and get back to work
shot(22, push(320, 380, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .2, 2.2);
  return paper() + wall(t, { len: lerp(.55, 1, k), dens: lerp(.6, 1, k), speed: lerp(.2, 1, k), muc: 2.4, gob: lerp(1.6, 1.1, k), gobEvery: k > .6 ? 5 : 3, dust: 1, hl: "cil" }) + calendarWeeks(320, 110, 6, Math.round(k * 6), "") + check(560, 220, 1, at(u, 2.2, .4), OLIVE);
});
// 23 · scientists sprayed chili on 29 smokers
shot(23, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var mist = ""; for (var i = 0; i < 18; i++) { var p = (t * .6 + i / 18) % 1; mist += C(360 + p * 200, 330 - 50 * Math.sin(i) * p, 3 + 4 * p, "#e7a092", 0); }
  return paper() + numBox("29", 150, 170, at(u, .6, .3), 52) + T("مدخن", 150, 250, 26, INK, 700) + G("", chili(300, 330, 1.8, 20 + wob(t, 4, 2)), at(u, .1, .4)) + G("", mist, at(u, .4, .4)) + tag("رذاذ شطة", 320, 560, at(u, 1, .4), 30, ORANGE);
});
// 24 · two weeks after quitting, the cough came faster: the reflex gauge swings up
shot(24, push(320, 420, 1.04, 0.98), function (u, d, t) {
  return paper() + gauge(320, 470, 190, at(u, .6, 1.4), "سرعة الكحة") + calendarWeeks(320, 640, 2, Math.min(2, Math.floor(at(u, .1, .8) * 2.99)), "أسبوعين");
});
// 25 · the mucus piled up for years starts to come out: beads race up the tree inside the man
shot(25, push(320, 400, 1.02, 1.06), function (u, d, t) {
  var blobs = []; for (var i = 0; i < 9; i++) { var p = (u * .4 + i / 9) % 1; blobs.push(along(UPPATH, p)); }
  return paper() + man(t, { face: { eyes: 1, brows: "worried", mouth: "frown" } }).svg + chestWin(t, 1, { blobs: blobs, tar: .3, heart: false, ribsOp: .3 });
});
// 26 · and its only way out is the cough
shot(26, push(320, 420, 1.0, 1.04), function (u, d, t) {
  return paper() + coughMan(t, at(u, .1, .3), 1.5) + G("", '<ellipse cx="' + f(PX0 - 150 - 40 * ((t * 1.5) % 1)) + '" cy="' + f(hy(.93)) + '" rx="12" ry="8" fill="' + MUC + '" stroke="' + INK + '" stroke-width="1.8"/>', 1 - ((t * 1.5) % 1));
});
// 27 · the myth: «التبطيل بيأذي الرئة» — crossed out
shot(27, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + lungs(t, { dim: .3 }) + tag("التبطيل بيأذي الرئة", 320, 380, at(u, .2, .4), 30) + cross(320, 370, 2.6, at(u, d - 1.0, .5));
});
// 28 · it's the lungs cleaning themselves; it usually calms within a few weeks
shot(28, push(320, 380, 1.06, 1.0), function (u, d, t) {
  return paper() + wall(t, { dust: 1, speed: 1.2 }) + arrow(300, 170, 600, 170, ORANGE, 6, at(u, .3, .5)) + check(130, 150, 1.2, at(u, .6, .4), OLIVE) + tag("كام أسبوع", 420, 110, at(u, 1.6, .4), 28, OLIVE);
});
// 29 · past three weeks, or with blood: see a doctor
shot(29, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var hd = headAt({ outfit: "doctor" });
  var p = man(t, { outfit: "doctor", face: { eyes: 1, brows: "raised", mouth: "neutral" }, arms: [{ to: [PX0 - 52 * PS, PY0 + 30 * PS], hand: "relaxed", bend: 1 }, { to: [hd[0] + 44 * PS, hd[1] - 2 * PS], hand: "point", elbow: [16, 40], rot: -90 }] });
  return paper() + p.svg + tag("+3 أسابيع", 140, 140, at(u, .2, .4), 30, ORANGE) + G("", blood(140, 260, 1.2), at(u, 1.0, .4)) + T("أو", 140, 205, 28, INK, 800);
});
// 30 · the recap: three panels — smoke cripples the hairs, quit, they wake and cough it out
shot(30, push(320, 400, 1.0, 1.04), function (u, d, t) {
  function pnl(y, k, o, cap, n) { return G("", G("translate(16 " + f(y - 160) + ") scale(.62)", '<clipPath id="rc' + n + '"><rect x="-26" y="258" width="650" height="330"/></clipPath><g clip-path="url(#rc' + n + ')">' + wall(t, o) + '</g>') + R(0, y, 402, 205, "none", 2.4) + callout(String(n), 20, y + 20, k) + T(cap, 520, y + 112, 26, INK, 800), k); }
  return paper() + pnl(40, at(u, .2, .4), { len: .55, dens: .6, speed: .3, muc: 2.3, gob: 1.6, gobEvery: 3, smoke: 1 }, "الدخان كسّحها", 1) + pnl(290, at(u, 1.4, .4), { len: .85, dens: .9, speed: .8, muc: 2.2 }, "تبطّل… تصحى", 2) +
    pnl(540, at(u, 2.8, .4), { muc: 1.2, speed: 1.3, dust: 1 }, "تطلّعه بالكحة", 3);
});
// 31 · the odd fact: each cell carries about 200 hairs
var CELLX = 320, CELLY = 470;
function bigCell(t, rate) {
  var s = R(CELLX - 90, CELLY, 180, 260, CELL, 2.4) + '<ellipse cx="' + CELLX + '" cy="' + (CELLY + 150) + '" rx="34" ry="56" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var k = 0; k < 40; k++) { var x = CELLX - 86 + k * 4.4, ph = (t * rate - k / 9) * Math.PI * 2 / 4, a = (16 + 30 * Math.sin(ph)) * Math.PI / 180, L = 150 + 10 * hash(k);
    var dd = "M" + f(x) + " " + CELLY + " Q" + f(x + Math.sin(a) * L * .5 - 6) + " " + f(CELLY - L * .5) + " " + f(x + Math.sin(a) * L) + " " + f(CELLY - Math.cos(a) * L);
    s += '<path d="' + dd + '" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="' + dd + '" stroke="#f3ece0" stroke-width="1.2" fill="none"/>'; }
  return s;
}
shot(31, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + bigCell(t, 3) + G("", N(count(200, at(u, .3, 1.4)), 140, 200, 64, ORANGE) + T("شعرة", 140, 240, 26, INK, 700), at(u, .2, .3)) + label(CELLX, CELLY + 200, 520, 680, "خلية واحدة", OLIVE, at(u, .6, .5), 24);
});
// 32 · beating more than 10 times a second
shot(32, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + bigCell(t, lerp(3, 12, at(u, 0, .8))) + N("200", 140, 200, 64, ORANGE) + T("شعرة", 140, 240, 26, INK, 700) + G("", N("+10", 520, 200, 56, ORANGE) + T("مرة في الثانية", 520, 240, 22, INK, 700), at(u, .3, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the man breaks a cigarette, his chest opens on the lungs, «؟». line 1: he coughs, a «أسبوع» calendar
  var u0 = t - LN[0].start;
  if (li === 0) return G("translate(12 -20) scale(.92)", man(t, { face: { eyes: 1, mouth: u0 > 1.6 ? "o" : "neutral", brows: "raised" } }).svg + chestWin(t, ease((u0 - 1.2) / .5), { ribsOp: .5 }) + brokenCig(470, 240, ease((u0 - .4) / .4))) + T("؟", 540, 200, 110, ORANGE, 800);
  var u1 = t - LN[1].start;
  return G("translate(12 -20) scale(.92)", coughMan(t, ease((u1 - .5) / .3), 1.4)) + iconBox(520, 90, 120, calendarWeeks(0, 0, 1, 1, "") + T("أسبوع", 0, 44, 18, INK, 800), ease(u1 / .4));
};
SCENE.bumper = function (u, t) {
  return G("translate(90 108) scale(.24) translate(-320 -340)", lungs(t, { breathe: 3 }));
};
SCENE.outro = function (svg, u, t) {
  var s = G("translate(40 0) scale(.42)", lungs(t, {})) + inset(430, 140, 120, G("translate(-430 -360) scale(1.1)", wall(t, { dust: 1 })), ease(u / .4));
  return s + callout("1", 175, 170, ease(u / .3 - .5)) + callout("2", 380, 70, ease(u / .3 - 1)) + callout("3", 400, 170, ease(u / .3 - 1.5)) + callout("4", 175, 20, ease(u / .3 - 2));
};
