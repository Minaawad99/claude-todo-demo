// ── «عروق جسمك طولها كام؟» — drawings. Every anatomical shape comes from a real reference (refs/SOURCES.md):
// the whole-body vessel map is traced from the public-domain Wikimedia Commons «Circulatory System en.svg» (sketch/vessels.js,
// made by tools/extract_vessels.py); the capillary bed, the red cells in single file, the one-cell wall, the muscle cross-section
// with a capillary round every fibre (Krogh's own figure) and the eye cut follow histology photos and Gray's Anatomy plates.
// People come from the shared person kit; the globe uses real coastlines.

var ART = "#b8432e", ART_D = "#8a2e1f", VEIN = "#4a6f8a", VEIN_D = "#2f4a5e", FLESH = "#e7c2a6", RBC = "#c4473a", RBC_L = "#de7a68",
    TISSUE = "#efd2bf", NUC = "#9a6d8a", MUSCLE = "#d98b78", MUSCLE_D = "#b96a58", HAIR = "#4a3a2c";
function vstyle() {
  return '<style>.f-art{fill:' + ART + '}.s-art{stroke:' + ART_D + '}.f-vein{fill:' + VEIN + '}.s-vein{stroke:' + VEIN_D + '}.f-sil{fill:' + FLESH + '}' +
    '.s-sil,.s-ink,.s-x{stroke:' + INK + '}.f-heart{fill:#c25a44}.f-w{fill:#f4ecdb}.s-w{stroke:#f4ecdb}.f-x{fill:' + FLESH + '}.nf{fill:none}.f-ink{fill:' + INK + '}</style>';
}
// the real vessel map. o: {sil (0..1 skin opacity), art, vein (0..1 how much is shown, swept top→down), dimA, dimV, up (vein sweep bottom→up)}
function body(x, y, s, o) {
  o = o || {}; var W = 550, H = 830, r = vstyle();
  var tr = "translate(" + f(x - W * s / 2) + " " + f(y - H * s / 2) + ") scale(" + s + ")";
  var sil = o.sil == null ? 1 : o.sil, a = o.art == null ? 1 : o.art, v = o.vein == null ? 1 : o.vein;
  if (sil > 0) r += G("", VESSELS.sil + '<g opacity=".18">' + VESSELS.sil.replace(/class="f-sil[^"]*"/g, 'fill="url(#hatch)"') + '</g>', sil);
  var veins = o.up ? sweep(0, 0, W, H, v, "u", VESSELS.veins) : sweep(0, 0, W, H, v, "d", VESSELS.veins);
  r += dim(o.dimV || 0, veins) + dim(o.dimA || 0, sweep(0, 0, W, H, a, "d", VESSELS.arts + VESSELS.heart));
  return G(tr, r);
}
// a pulse: a bright dot running down the aorta and out along a path (map coordinates)
function pulseDot(x, y, s, pts, k, col) {
  var n = pts.length - 1, i = Math.min(n - 1, Math.floor(k * n)), e = k * n - i, p = [lerp(pts[i][0], pts[i + 1][0], e), lerp(pts[i][1], pts[i + 1][1], e)];
  return C(x + (p[0] - 275) * s, y + (p[1] - 415) * s, 7, col || "#f2d16b", 2);
}
var AORTA_PATH = [[300, 205], [300, 190], [292, 200], [300, 260], [300, 330], [300, 390], [285, 420], [272, 470], [268, 560], [268, 650], [266, 740], [262, 780]];
var VENA_PATH = [[335, 780], [333, 700], [330, 600], [320, 470], [300, 420], [292, 330], [292, 260], [292, 215]];

// the Earth with the vessel thread wound round it `turns` times; k 0..1 how much of the thread is drawn
function wrapGlobe(cx, cy, r, t, turns, k, col) {
  var s = globe(cx, cy, r, 20 + t * 1.6, 15), N = 260, front = "", back = "", lastF = null;
  for (var i = 0; i <= N * clamp(k); i++) {
    var q = i / N, th = q * turns * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(th) * r * 1.04, y = cy - r * .55 + q * r * 1.1 + Math.sin(th) * r * .2, isF = Math.sin(th) > 0;
    var seg = (lastF === isF && i ? " L" : " M") + f(x) + " " + f(y); if (isF) front += seg; else back += seg; lastF = isF;
  }
  return '<path d="' + back + '" stroke="' + (col || ART) + '" stroke-width="3" fill="none" stroke-dasharray="6 6" opacity=".7"/>' + s +
    '<path d="' + front + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="' + front + '" stroke="' + (col || ART) + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
}
// a branching artery (a tree that draws itself): thick trunk at the bottom, ever thinner branches
function tree(x, y, len, ang, w, depth, k, seed) {
  if (depth < 0 || k <= 0) return "";
  var a = ang * Math.PI / 180, x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len, kk = clamp(k * 5 - (5 - depth - 1) * 0.0), s = "";
  var mine = clamp(k * 6 - (6 - depth - 1));   // the trunk first, then each level
  if (mine <= 0) return "";
  var bend = (hash(seed) - .5) * 30;
  var d = "M" + f(x) + " " + f(y) + " Q" + f((x + x2) / 2 + bend) + " " + f((y + y2) / 2) + " " + f(x2) + " " + f(y2);
  s += draw(d, mine, INK, w + 3, ' stroke-linecap="round"') + draw(d, mine, ART, w, ' stroke-linecap="round"');
  if (mine >= 1) {
    var sp = 22 + hash(seed + 3) * 16;
    s += tree(x2, y2, len * .74, ang - sp, w * .68, depth - 1, k, seed * 2 + 1) + tree(x2, y2, len * .7, ang + sp, w * .68, depth - 1, k, seed * 2 + 2);
  }
  return s;
}
// a capillary bed between an arteriole (left, red) and a venule (right, blue): a mesh whose colour turns from red to blue
var BED = (function () {
  var nodes = [], edges = [], i, j;
  for (i = 0; i < 7; i++) for (j = 0; j < 5; j++) nodes.push([150 + i * 58 + (hash(i * 9 + j) - .5) * 30, 250 + j * 70 + (hash(i * 7 + j + 50) - .5) * 34]);
  for (i = 0; i < 7; i++) for (j = 0; j < 5; j++) { var n = i * 5 + j; if (i < 6) edges.push([n, n + 5]); if (j < 4 && hash(n + 11) > .25) edges.push([n, n + 1]); }
  return { nodes: nodes, edges: edges };
})();
function mixc(a, b, k) { var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }; var r = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), clamp(k))); r += (v < 16 ? "0" : "") + v.toString(16); } return r; }
function capBed(u, t, k) {
  var s = "";
  // arteriole and venule
  s += P("M-40 360 C40 350 90 320 150 270 M150 270 L150 530 M90 330 C110 380 130 430 150 530", "none", 0) +
       draw("M-40 380 C40 380 100 340 150 250 L150 530", k * 2, INK, 26, ' stroke-linecap="round"') + draw("M-40 380 C40 380 100 340 150 250 L150 530", k * 2, ART, 20, ' stroke-linecap="round"');
  BED.edges.forEach(function (e, n) {
    var a = BED.nodes[e[0]], b = BED.nodes[e[1]], c = mixc(ART, VEIN, ((a[0] + b[0]) / 2 - 150) / 348), q = clamp(k * 2.2 - .6 - ((a[0] - 150) / 348) * .8);
    if (q <= 0) return; var d = "M" + f(a[0]) + " " + f(a[1]) + " Q" + f((a[0] + b[0]) / 2 + (hash(n) - .5) * 26) + " " + f((a[1] + b[1]) / 2 + (hash(n + 5) - .5) * 26) + " " + f(b[0]) + " " + f(b[1]);
    s += draw(d, q, INK, 8, ' stroke-linecap="round"') + draw(d, q, c, 5, ' stroke-linecap="round"');
  });
  var vk = clamp(k * 2.2 - 1.4);
  s += draw("M498 250 L498 530 C540 430 600 400 700 400", vk, INK, 30, ' stroke-linecap="round"') + draw("M498 250 L498 530 C540 430 600 400 700 400", vk, VEIN, 24, ' stroke-linecap="round"');
  // red cells running through
  for (var i = 0; i < 9; i++) { var e = BED.edges[(i * 7) % BED.edges.length], a = BED.nodes[e[0]], b = BED.nodes[e[1]], q2 = (t * .6 + i * .37) % 1;
    if (k > .9) s += '<ellipse cx="' + f(lerp(a[0], b[0], q2)) + '" cy="' + f(lerp(a[1], b[1], q2)) + '" rx="5" ry="3.4" fill="' + RBC_L + '" stroke="' + INK + '" stroke-width="1"/>'; }
  return s;
}
// a capillary cut lengthwise: one-cell wall with flat nuclei, red cells squeezing through in single file
function capTube(x0, x1, y, h, t, o) {
  o = o || {}; var s = "", wall = 9;
  s += R(x0, y - h / 2 - wall, x1 - x0, h + wall * 2, "#e6b3a3", 2.2);   // the wall
  s += R(x0, y - h / 2, x1 - x0, h, "#f3dfd0", 0);   // the lumen (plasma)
  s += '<path d="M' + x0 + ' ' + f(y - h / 2) + ' H' + x1 + ' M' + x0 + ' ' + f(y + h / 2) + ' H' + x1 + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var xx = x0 + 30; xx < x1; xx += 120) {   // endothelial cell borders and their flat nuclei
    s += '<path d="M' + f(xx) + ' ' + f(y - h / 2 - wall) + ' v' + wall + ' M' + f(xx + 60) + ' ' + f(y + h / 2) + ' v' + wall + '" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<ellipse cx="' + f(xx + 55) + '" cy="' + f(y - h / 2 - wall / 2) + '" rx="22" ry="3.6" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1"/><ellipse cx="' + f(xx + 115) + '" cy="' + f(y + h / 2 + wall / 2) + '" rx="22" ry="3.6" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1"/>';
  }
  if (o.hlWall) s += G("", R(x0, y - h / 2 - wall, x1 - x0, wall, OLIVE, 0) + R(x0, y + h / 2, x1 - x0, wall, OLIVE, 0), .45 * o.hlWall);
  // red cells: bent into a bullet shape as they squeeze through, moving left → right
  var sp = o.speed == null ? 60 : o.speed, gap = o.gap || 46;
  for (var i = -2; i < (x1 - x0) / gap + 2; i++) {
    var cx = x0 + ((i * gap + t * sp) % (x1 - x0 + gap * 2)) - gap; if (cx < x0 + 6 || cx > x1 - 6) continue;
    var rh = h * .46;
    s += '<path d="M' + f(cx - 12) + ' ' + f(y - rh) + ' Q' + f(cx + 14) + ' ' + f(y - rh) + ' ' + f(cx + 16) + ' ' + f(y) + ' Q' + f(cx + 14) + ' ' + f(y + rh) + ' ' + f(cx - 12) + ' ' + f(y + rh) + ' Q' + f(cx - 4) + ' ' + f(y) + ' ' + f(cx - 12) + ' ' + f(y - rh) + ' Z" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.6"/>' +
         '<path d="M' + f(cx + 2) + ' ' + f(y - rh * .5) + ' Q' + f(cx + 9) + ' ' + f(y) + ' ' + f(cx + 2) + ' ' + f(y + rh * .5) + '" stroke="' + RBC_L + '" stroke-width="3" fill="none"/>';
  }
  return s;
}
// tissue cells round a vessel: soft polygons with a nucleus each
function cells(x0, y0, x1, y1, seed, col) {
  var s = "", st = 54;
  for (var x = x0; x < x1; x += st) for (var y = y0; y < y1; y += st) {
    var cx = x + (hash(x * .3 + y + seed) - .5) * 14, cy = y + (hash(x + y * .7 + seed) - .5) * 14, d = "";
    for (var k = 0; k < 6; k++) { var a = k / 6 * Math.PI * 2 + hash(x + k) * .4, rr = st * .5 * (.88 + hash(x * k + y) * .14); d += (k ? " L" : "M") + f(cx + Math.cos(a) * rr) + " " + f(cy + Math.sin(a) * rr); }
    s += P(d + " Z", col || TISSUE, 1.4) + C(cx + 4, cy - 2, 7, NUC, 1.2);
  }
  return s;
}
// O2 dots: blue, small, with the letters
function o2(x, y, k) { if (k <= 0) return ""; return G("", C(x, y, 13, "#cfe0ec", 1.8) + T("O₂", x, y + 5, 13, VEIN_D, 800), clamp(k)); }
// muscle cross-section (Krogh's own picture of a muscle under the microscope): polygon fibres, a capillary dot between them
var FIB = (function () { var a = []; for (var i = 0; i < 9; i++) for (var j = 0; j < 11; j++) a.push([60 + i * 66 + (j % 2) * 33 + (hash(i * 13 + j) - .5) * 14, 120 + j * 58 + (hash(i + j * 17) - .5) * 12]); return a; })();
function muscleCut(k, kc, dense) {
  var s = "";
  FIB.forEach(function (p, n) { var d = ""; for (var q = 0; q < 6; q++) { var a = q / 6 * Math.PI * 2 + Math.PI / 6, rr = 31 + hash(n + q * 3) * 4; d += (q ? " L" : "M") + f(p[0] + Math.cos(a) * rr) + " " + f(p[1] + Math.sin(a) * rr * .95); }
    s += G("", P(d + " Z", n % 3 ? MUSCLE : MUSCLE_D, 1.6), clamp(k * 3 - hash(n) * 2)); });
  FIB.forEach(function (p, n) { if (n % 2) return; var q = clamp(kc * 3 - hash(n + 40) * 2); if (q > 0) s += G("", C(p[0] + 33, p[1] + 2, 6, ART, 1.4), q); });
  if (dense) FIB.forEach(function (p, n) { var q = clamp(dense * 3 - hash(n + 90) * 2); if (q > 0) s += G("", C(p[0] - 2, p[1] - 30, 5, ART, 1.2) + C(p[0] + 16, p[1] + 26, 5, ART, 1.2) + C(p[0] - 20, p[1] + 22, 5, ART, 1.2), q); });
  return s;
}
// the hair shaft (scales on the surface, as under the microscope) and the capillary at the same scale
function hairShaft(x, y, len, w, ang) {
  var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')">' + R(0, -w / 2, len, w, "#6b5640", 2.4);
  for (var i = 0; i < len; i += 26) s += '<path d="M' + i + ' ' + f(-w / 2) + ' q14 ' + f(w * .5) + ' 4 ' + f(w) + '" stroke="' + HAIR + '" stroke-width="2" fill="none"/>';
  return s + R(0, -w / 2, len, w * .25, "#8a7258", 0) + '</g>';
}
// a heart drawn the way the reference series draws it (v17): red pumping chambers, the aorta arch on top, the vena cava in blue
function heart(x, y, s, beat) {
  var b = 1 + .05 * beat;
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * b) + ")",
    P("M-20 -70 C-22 -120 40 -128 52 -96 L52 -40 L32 -40 L32 -88 C24 -100 2 -100 0 -70 Z", ART, 2.4) +
    P("M-44 -80 L-44 -20 L-26 -20 L-26 -80 Z", VEIN, 2.4) +
    P("M-70 -30 C-90 30 -40 90 10 120 C60 90 96 20 76 -30 C60 -60 30 -50 10 -30 C-10 -52 -50 -60 -70 -30 Z", "#c25a44", 2.6) +
    '<path d="M-70 -30 C-90 30 -40 90 10 120 C60 90 96 20 76 -30 C60 -60 30 -50 10 -30 C-10 -52 -50 -60 -70 -30 Z" fill="url(#hatch)" opacity=".25"/>' +
    P("M10 -26 C4 20 8 70 10 116", "none", 1.6) + P("M-30 20 C-10 30 30 34 60 18", "none", 1.2));
}
// an eye cut from the side (Gray's Anatomy fig. 869 for the layers): white sclera with vessels, the clear cornea bulging in front
function eyeCut(t, k) {
  var s = "";
  s += C(330, 400, 210, "#f4efe6", 3);   // sclera
  s += '<circle cx="330" cy="400" r="196" fill="#c46a54" opacity=".25"/>';   // choroid
  s += C(330, 400, 188, "#f1ece0", 1.6);   // inside (vitreous)
  s += P("M150 300 C100 340 96 460 150 500", "#e5eef2", 2.6);   // cornea: clear, no vessels
  s += P("M162 300 L176 320 L176 480 L162 500", "#5c7a5a", 2);   // iris
  s += '<ellipse cx="206" cy="400" rx="30" ry="62" fill="#e8e2d0" stroke="' + INK + '" stroke-width="2"/>';   // lens
  // vessels in the white and at the back
  for (var i = 0; i < 9; i++) { var a = (-.9 + i * .22) * Math.PI / 2 + .1, r0 = 198, d = "M" + f(330 + Math.cos(a) * r0) + " " + f(400 + Math.sin(a) * r0);
    d += " Q" + f(330 + Math.cos(a + .18) * (r0 - 26)) + " " + f(400 + Math.sin(a + .18) * (r0 - 26)) + " " + f(330 + Math.cos(a + .1) * (r0 - 48)) + " " + f(400 + Math.sin(a + .1) * (r0 - 48));
    s += draw(d, k * 1.5 - i * .05, ART, 3, ' stroke-linecap="round"'); }
  ["M168 268 Q190 230 236 214", "M168 532 Q190 570 236 586", "M180 250 Q160 232 150 210", "M180 550 Q160 568 150 590"].forEach(function (d, i) { s += draw(d, k * 1.5 - i * .1, ART, 3, ' stroke-linecap="round"'); });
  s += R(520, 380, 120, 40, "#e2b04a", 2.2);   // optic nerve
  return s;
}

// labels get a paper halo in this episode (they sit over cells, fibres and the body)
var _label = label; label = function () { return _label.apply(null, arguments).replace(/style="font:/g, 'style="paint-order:stroke;stroke:#eee5d0;stroke-width:7px;stroke-linejoin:round;font:'); };
// ── shots (one per idea; line numbers from script.txt) ──
// 4 · five litres of blood go round the whole body in about a minute: the real vessel map, a pulse running down and back up
shot(4, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var q = (u * .45) % 2, s = paper() + body(320, 415, .9, { sil: 1 });
  s += q < 1 ? pulseDot(320, 415, .9, AORTA_PATH, q) : pulseDot(320, 415, .9, VENA_PATH, q - 1, "#cfe0ec");
  s += numBox("5", 500, 140, at(u, .4, .4), 36) + G("", T("لتر", 560, 150, 28, INK, 800), at(u, .6, .3)) + iconBox(110, 120, 120, '<circle r="40" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 L' + f(Math.sin(u * 2.5) * 30) + ' ' + f(-Math.cos(u * 2.5) * 30) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + T("دقيقة", 0, 62, 18, INK, 800), at(u, 1.6, .4));
  return s;
});
// 5 · the rule card, over a faint body
shot(5, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + G("", body(320, 415, .9, { sil: 1 }), .3) + G("", '<rect x="120" y="250" width="400" height="190" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 345)"/>' +
    T("الأكسجين", 320, 318, 44, VEIN, 800) + T("محتاج جدار رفيع", 320, 380, 36, INK, 700) + C(320, 256, 9, ORANGE, 2), at(u, .3, .4)) + o2(200, 470 + 6 * Math.sin(t * 3), at(u, .8, .3)) + o2(450, 480 + 6 * Math.cos(t * 3), at(u, 1, .3));
});
// 6 · thick artery wall: the O2 bounces off (✗); a capillary wall one cell thick: it passes (✓). Artery layers after Gray's fig. 492
shot(6, push(320, 400, 1.02, .96), function (u, d, t) {
  var s = paper();
  // artery in cross-section: adventitia, muscle layer (media), thin lining, lumen with red cells
  s += C(185, 380, 120, "#e3c39a", 2.4) + C(185, 380, 96, "#c97a64", 2.2) + '<circle cx="185" cy="380" r="96" fill="url(#hatch)" opacity=".5"/>' + C(185, 380, 62, "#e9d7c8", 2) + C(185, 380, 56, "#f3dfd0", 1.4);
  for (var i = 0; i < 5; i++) s += '<ellipse cx="' + f(185 + Math.cos(i * 1.3 + t * .4) * 26) + '" cy="' + f(380 + Math.sin(i * 1.3 + t * .4) * 26) + '" rx="13" ry="9" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.4"/>';
  // capillary in cross-section: one thin cell round, one red cell inside
  s += C(470, 380, 44, "#e6b3a3", 2.4) + C(470, 380, 34, "#f3dfd0", 1.6) + '<ellipse cx="470" cy="380" rx="24" ry="20" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.6"/>' + '<ellipse cx="470" cy="343" rx="16" ry="4" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1"/>';
  s += label(185, 270, 120, 190, "جدار تخين", INK, at(u, .3, .5), 26) + label(470, 336, 520, 250, "جدار رفيع", OLIVE, at(u, 1.2, .5), 26);
  // O2 tries to leave: bounces back at the thick wall, sails out of the thin one
  var b = (u * .8) % 1, bx = 185 + (b < .5 ? b * 2 : (1 - b) * 2) * 80;
  s += o2(bx, 380 + 8 * Math.sin(t * 5), at(u, .6, .3)) + o2(470 + 30 + ((u * 50) % 120), 380, at(u, 1.5, .3));
  return s + cross(185, 560, 1.1, at(u, 1.8, .4)) + check(470, 560, 1.4, at(u, 2.3, .4), OLIVE);
});
// 7 · out of the heart into the aorta, as wide as a garden hose: zoom into the heart of the real map
shot(7, push(320, 300, 1.6, 1.85), function (u, d, t) {
  var s = paper() + body(320, 415, .9, { sil: 1, dimV: at(u, .3, .6) });
  s += G("", C(320 + (300 - 275) * .9, 415 + (215 - 415) * .9, 16, "none", 0) + draw("M343 222 C346 205 336 196 326 200", at(u, .6, .6), ORANGE, 5), 1);
  s += label(343, 232, 390, 170, "الأورطي", ORANGE, at(u, .7, .5), 20) + label(330, 290, 250, 260, "القلب", OLIVE, at(u, .4, .5), 18);
  s += iconBox(225, 175, 64, '<path d="M-24 10 C-10 -20 10 -20 22 8" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-24 10 C-10 -20 10 -20 22 8" stroke="#5e8a4a" stroke-width="8" fill="none" stroke-linecap="round"/>' + C(22, 8, 4, "#9fb7c3", 1), at(u, 1.6, .3));
  return s;
}, { tr: "in" });
// 8 · it branches into smaller and smaller arteries, like a tree's branches
shot(8, push(320, 420, .95, 1.05), function (u, d, t) {
  var k = at(u, .1, d * .8);
  return paper() + G("rotate(" + f(2.2 * Math.sin(t * 1.4)) + " 320 760)", tree(320, 760, 170, 0, 26, 6, k, 1)) + C(320 + 3 * Math.sin(t * 1.4), lerp(760, 600, (u * .9) % 1), 7, "#f2d16b", 2) + iconBox(530, 110, 110, '<path d="M0 40 V0 M0 10 L-20 -14 M0 4 L22 -18 M-20 -14 L-30 -30 M-20 -14 L-8 -32 M22 -18 L14 -34 M22 -18 L34 -30" stroke="#6b4a2c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="0" cy="-22" r="34" fill="#7f8a4a" opacity=".45"/>', at(u, 1.2, .3)) +
    label(320, 650, 450, 640, "شريان", ORANGE, at(u, .6, .5), 24);
});
// 9 · down to the capillaries: arteriole → a mesh of capillaries → venule (the classic histology diagram)
shot(9, push(320, 400, 1.08, .96), function (u, d, t) {
  var k = at(u, .1, 1.8);
  return paper() + capBed(u, t, k) + label(110, 330, 220, 170, "شريان صغير", ORANGE, at(u, .3, .5), 24) + label(330, 390, 330, 640, "شعيرات دموية", OLIVE, at(u, 1, .5), 26) + label(505, 300, 470, 190, "وريد صغير", VEIN, at(u, 1.1, .5), 24);
}, { tr: "in" });
// 10 · 7 microns: a hair from your head (about 70 µm, scales on it as under the microscope) and a capillary at the same scale
shot(10, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .2, .6), s = paper();
  s += G("", hairShaft(-20, 300, 720, 140, 0), k) + label(330, 250, 400, 150, "شعرة من راسك", HAIR, at(u, .5, .5), 26);
  s += G("", capTube(-20, 680, 560, 9, t, { speed: 30, gap: 26 }), at(u, 1, .5)) + label(300, 560, 360, 670, "شعيرة دموية", ORANGE, at(u, 1.3, .5), 26) + G("", T("7 ميكرون", 120, 620, 24, ORANGE, 800), at(u, 1.8, .4));
  s += measure(560, 230, 560, 370, at(u, .8, .5), "") + G("", T("70 ميكرون", 520, 410, 24, INK, 800), at(u, 1.1, .4));
  s += numBox("10×", 140, 470, at(u, 2.2, .3), 34) + G("", T("أرفع", 140, 520, 22, INK, 800), at(u, 2.4, .3));
  return s;
});
// 11 · so narrow that red cells pass one behind another, like a queue
shot(11, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + cells(-40, 150, 700, 330, 3) + cells(-40, 470, 700, 700, 9) + capTube(-40, 700, 400, 54, t, { speed: 70, gap: 58 });
  s += label(330, 400, 380, 240, "كرة دم حمرا", ORANGE, at(u, .5, .5), 24);
  var q = ""; for (var i = 0; i < 3; i++) q += PERSON.side({ x: -34 + i * 34, y: 16, s: .15, dir: 1, outfit: "casual", face: { eyes: 1 } }).svg;
  return s + iconBox(530, 110, 120, q, at(u, 1.4, .3));
});
// 12 · the wall is one layer of cells: O2 leaves the red cells, crosses it and goes into the cells next to it
shot(12, push(320, 410, 1.25, 1.12), function (u, d, t) {
  var s = paper() + cells(-40, 150, 700, 330, 3) + cells(-40, 470, 700, 700, 9) + capTube(-40, 700, 400, 54, t, { speed: 40, gap: 58, hlWall: at(u, .3, .5) });
  for (var i = 0; i < 7; i++) { var q = ((u * .5 + i * .27) % 1), up = i % 2 ? -1 : 1, x = 40 + i * 90; s += o2(x + q * 20, 400 + up * (10 + q * 150), at(u, .6 + i * .1, .3) * (1 - clamp((q - .85) / .15))); }
  return s + label(250, 364, 210, 250, "خلية واحدة", OLIVE, at(u, .4, .5), 24);
}, { tr: "in" });
// 13 · the blood comes back to the heart in the veins: the map's veins light up from the feet up
shot(13, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .1, 1.6), q = (u * .45) % 1;
  return paper() + body(320, 415, .9, { sil: 1, dimA: .8, vein: k, up: true }) + pulseDot(320, 415, .9, VENA_PATH, q, "#cfe0ec") + label(352, 640, 470, 600, "الأوردة", VEIN, at(u, .8, .5), 26);
}, { tr: "out" });
// 14 · why so long? every cell must sit next to a capillary
shot(14, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + cells(40, 160, 640, 660, 21);
  var paths = ["M-20 210 C120 260 220 160 330 230 S520 280 680 220", "M-20 420 C100 380 220 470 330 420 S530 360 680 430", "M-20 620 C120 590 240 660 360 610 S540 580 680 640"];
  paths.forEach(function (d, i) { s += draw(d, at(u, .3 + i * .3, .9), INK, 10, ' stroke-linecap="round"') + draw(d, at(u, .3 + i * .3, .9), ART, 7, ' stroke-linecap="round"'); });
  return s + T("؟", 540, 170, 120, ORANGE, 800);
});
// 15 · a muscle cut across (Krogh's own microscope picture): a capillary next to every fibre; the net is most of the length
shot(15, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var s = paper() + muscleCut(at(u, 0, .8), at(u, .5, 1.2), 0);
  return s + label(357, 238, 420, 100, "شعيرة", ORANGE, at(u, 1.2, .5), 24) + label(282, 296, 200, 100, "ليفة عضل", OLIVE, at(u, 1.5, .5), 22) + tag("أغلب الطول", 320, 730, at(u, 2.4, .3), 32, ORANGE);
}, { tr: "in" });
// 16 · who said two and a half times round the Earth?
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + wrapGlobe(300, 420, 210, t, 2.5, 1) + T("؟", 560, 200, 140, ORANGE, 800);
}, { tr: "out" });
// 17 · August Krogh, Nobel prize 1920 for his work on the capillaries (his real photo)
shot(17, push(320, 400, 1.05, 1.0), function (u, d, t) {
  var s = paper() + G("", muscleCut(1, 1, 0), .25);
  s += G("rotate(-3 320 360)", R(170, 160, 300, 380, "#f4ecdb", 2.4) + '<image href="krogh.jpg" x="186" y="176" width="268" height="300" preserveAspectRatio="xMidYMid slice" style="filter:sepia(.55) contrast(1.05)"/>' + R(186, 176, 268, 300, "none", 1.6) + T("أوجست كروج", 320, 520, 28, INK, 800) + C(320, 168, 9, ORANGE, 2), at(u, .1, .4));
  return s + G("translate(500 600)", C(0, 0, 50, "#d9b24a", 2.6) + C(0, 0, 38, "none", 1.4) + T("نوبل", 0, -2, 20, INK, 800) + N("1920", 0, 24, 18, INK), pop(at(u, 1.4, .5)));
});
// 18 · in 1922 he worked it out: 100,000 km
shot(18, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + G("rotate(2 320 380)", R(110, 140, 420, 470, "#f6f0e0", 2.4) + (function () { var r = ""; for (var y = 190; y < 600; y += 34) r += '<path d="M130 ' + y + ' H510" stroke="#c9d3da" stroke-width="1.2"/>'; return r; })() +
    N("1922", 470, 190, 30, OLIVE) + draw("M150 250 C200 240 260 255 330 246", at(u, .2, .5), INK, 2) + draw("M150 290 C210 284 280 296 360 288", at(u, .4, .5), INK, 2) + draw("M150 330 C190 324 240 338 300 330", at(u, .6, .5), INK, 2));
  return s + N(count(100000, at(u, .7, 1.4)), 320, 470, 64, ORANGE) + T("كيلو", 320, 520, 30, INK, 800);
});
// 19 · but on a huge man with 50 kg of muscle, and too many capillaries per square millimetre
shot(19, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var br = (Math.sin(t * 1.7) + 1) / 2, s = paper();
  s += G("", PERSON.front({ x: 90, y: 520, s: .8, outfit: "casual", face: { eyes: 1 } }).svg, .35);
  s += PERSON.front({ x: 240, y: 450, s: 1.25, breath: br, outfit: "casual", face: { eyes: 1, mouth: "neutral" }, head: { tilt: 1.5 * Math.sin(t) } }).svg;
  s += label(275, 410, 420, 300, "50 كيلو عضل", ORANGE, at(u, .5, .5), 28);
  s += inset(500, 560, 120, G("translate(-320 -420) scale(1)", muscleCut(1, 1, at(u, 1.5, .8))), at(u, 1.2, .4));
  return s + tag("شعيرات زيادة", 500, 730, at(u, 2.2, .3), 26, ORANGE);
});
// 20 · in 2021 scientists did it again on a normal body
shot(20, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var br = (Math.sin(t * 1.7) + 1) / 2, bl = (t * 1000) % 3300 < 120 ? .05 : 1;
  return paper() + PERSON.front({ x: 220, y: 480, s: .95, breath: br, outfit: "casual", face: { eyes: bl, mouth: "smile" }, head: { tilt: 1.5 * Math.sin(t) } }).svg +
    G("rotate(4 500 300)", R(400, 170, 200, 250, "#f6f0e0", 2.4) + N("2021", 500, 230, 36, VEIN) + '<path d="M425 270 H575 M425 300 H560 M425 330 H575 M425 360 H540" stroke="' + MUTE + '" stroke-width="3"/>', at(u, .3, .4)) + check(500, 470, 1.2, at(u, 1.4, .4), OLIVE);
});
// 21 · between 9,000 and 19,000 km: bars against the old 100,000
shot(21, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper(), k = at(u, .2, 1), W = 520;
  s += T("كروج 1922", 580, 200, 24, MUTE, 800, "start") + R(60, 220, W * k, 60, GREY, 2) + G("", N("100,000", 70 + W * k - 14, 262, 26, INK, "end"), clamp(k * 3 - 2)) + cross(320, 250, .9, at(u, 1.2, .4));
  s += G("", T("2021", 580, 380, 24, VEIN, 800, "start"), at(u, .6, .3)) + R(60, 400, W * .09 * at(u, .6, 1), 60, VEIN, 2) + R(60 + W * .09, 400, W * .1 * at(u, .9, 1), 60, "#9fb7c3", 2);
  s += N(count(9000, at(u, .6, 1)) + " – " + count(19000, at(u, .6, 1)), 320, 560, 52, VEIN) + T("كيلو", 320, 610, 30, INK, 800);
  return s;
});
// 22 · from Cairo to Tokyo, maybe to Australia — but never once round the Earth (real coastlines)
var CAIRO = [31.2, 30.0], TOKYO = [139.7, 35.7], SYD = [151.2, -33.9];
function gc(a, b, n) { var r = Math.PI / 180, p = [], v = function (q) { return [Math.cos(q[1] * r) * Math.cos(q[0] * r), Math.cos(q[1] * r) * Math.sin(q[0] * r), Math.sin(q[1] * r)]; }, A = v(a), B = v(b), d = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]);
  for (var i = 0; i <= n; i++) { var k = i / n, s1 = Math.sin((1 - k) * d) / Math.sin(d), s2 = Math.sin(k * d) / Math.sin(d), x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2]; p.push([Math.atan2(y, x) / r, Math.asin(z) / r]); } return p; }
var ROUTE = gc(CAIRO, TOKYO, 40).concat(gc(TOKYO, SYD, 24).slice(1));
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var lon = 85 + 6 * Math.sin(t * .3), lat = 18, g = GEO.globe(320, 420, 250, lon, lat), k = at(u, .2, 2.2), n = Math.floor(ROUTE.length * k), dd = "";
  for (var i = 0; i < n; i++) { var p = g.project(ROUTE[i]); if (p) dd += (dd ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
  var s = paper() + globe(320, 420, 250, lon, lat, { dot: CAIRO });
  s += '<path d="' + dd + '" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round"/><path d="' + dd + '" stroke="' + ART + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
  var pc = g.project(CAIRO), pt = g.project(TOKYO), ps = g.project(SYD);
  if (pc) s += label(pc[0], pc[1], pc[0] - 30, pc[1] - 120, "القاهرة", INK, at(u, .2, .4), 22);
  if (pt) s += label(pt[0], pt[1], pt[0] + 20, pt[1] - 120, "طوكيو", VEIN, at(u, 1.4, .4), 22);
  if (ps) s += label(ps[0], ps[1], ps[0] + 10, ps[1] + 120, "أستراليا", VEIN, at(u, 2.3, .4), 22);
  return s;
});
// 23 · the big number copied from book to book: a stack of books, each with 100,000 on its spine. «لأ»
shot(23, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper(), cols = ["#8a4a3a", "#4a6f8a", "#5e653a", "#9a7a4a", "#6a4a6a", "#3f5a6a"];
  for (var i = 0; i < 6; i++) { var y = 640 - i * 74, x = 150 + (hash(i) - .5) * 40, q = at(u, i * .18, .3); s += G("translate(0 " + f((1 - q) * -60) + ")", R(x, y, 340, 64, cols[i], 2.4) + R(x + 6, y + 8, 18, 48, "#f4ecdb", 0) + N("100,000", x + 190, y + 44, 30, "#f4ecdb"), q); }
  return s + cross(320, 420, 3, at(u, 2.2, .5)) + T("لأ", 540, 180, 90, ORANGE, 800);
});
// 24 · the recap: heart pumps → arteries spread → capillaries hand over the O2 → veins bring it back
shot(24, push(320, 410, 1.0, 1.04), function (u, d, t) {
  var s = paper(), P4 = [[320, 180], [530, 400], [320, 620], [110, 400]], names = [["القلب", ORANGE], ["الشرايين", ORANGE], ["الشعيرات", OLIVE], ["الأوردة", VEIN]];
  s += '<circle cx="320" cy="400" r="220" fill="none" stroke="' + MUTE + '" stroke-width="2" stroke-dasharray="8 8"/>';
  P4.forEach(function (p, i) {
    var k = at(u, .2 + i * .7, .4), n = P4[(i + 1) % 4];
    s += G("", C(p[0], p[1], 70, "#f4ecdb", 2.4) + T(names[i][0], p[0], p[1] + 96, 26, names[i][1], 800), k);
    if (i === 0) s += G("", heart(p[0], p[1] + 4, .42, Math.max(0, Math.sin(t * 7))), k);
    if (i === 1) s += G("", tree(p[0], p[1] + 48, 34, 0, 8, 3, 1, 4), k);
    if (i === 2) s += G("translate(" + (p[0] - 50) + " " + (p[1] - 45) + ") scale(.17)", capBed(0, t, 1), k);
    if (i === 3) s += G("", '<path d="M' + p[0] + ' ' + (p[1] + 48) + ' C' + (p[0] - 10) + ' ' + (p[1] + 10) + ' ' + (p[0] + 14) + ' ' + (p[1] - 10) + ' ' + p[0] + ' ' + (p[1] - 48) + '" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M' + p[0] + ' ' + (p[1] + 48) + ' C' + (p[0] - 10) + ' ' + (p[1] + 10) + ' ' + (p[0] + 14) + ' ' + (p[1] - 10) + ' ' + p[0] + ' ' + (p[1] - 48) + '" stroke="' + VEIN + '" stroke-width="11" fill="none" stroke-linecap="round"/>', k);
    var a0 = Math.atan2(p[1] - 400, p[0] - 320) + .4, a1 = Math.atan2(n[1] - 400, n[0] - 320) - .4; if (a1 < a0) a1 += Math.PI * 2;
    s += draw("M" + f(320 + Math.cos(a0) * 220) + " " + f(400 + Math.sin(a0) * 220) + " A220 220 0 0 1 " + f(320 + Math.cos(a1) * 220) + " " + f(400 + Math.sin(a1) * 220), at(u, .5 + i * .7, .5), names[i][1], 5);
  });
  // a red cell going round the loop
  var a = t * 1.1; return s + '<ellipse cx="' + f(320 + Math.cos(a) * 220) + '" cy="' + f(400 + Math.sin(a) * 220) + '" rx="12" ry="8" fill="' + RBC + '" stroke="' + INK + '" stroke-width="1.6"/>';
});
// 25 · the cornea has no blood vessels at all; it takes its O2 straight from the air
shot(25, push(300, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + eyeCut(t, at(u, .2, 1));
  s += label(118, 360, 90, 200, "القرنية", VEIN, at(u, .6, .5), 28) + G("", T("ولا عرق دم", 110, 620, 26, ORANGE, 800), at(u, 1.2, .4)) + cross(110, 680, .7, at(u, 1.4, .4));
  for (var i = 0; i < 5; i++) { var q = (u * .35 + i * .2) % 1; s += o2(lerp(-30, 110, q), 330 + i * 36, at(u, 1.8, .3) * (1 - clamp((q - .85) / .15))); }
  return s;
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var s = "";
  if (li === 0) {   // a man, and next to him every vessel of his body pulled out
    var k = clamp((t - LN[0].start - .4) / 2.2), bl = (t * 1000) % 3300 < 120 ? .05 : 1.25;
    s += PERSON.front({ x: 150, y: 400, s: .9, breath: (Math.sin(t * 1.7) + 1) / 2, outfit: "casual", face: { eyes: bl, brows: "raised", mouth: "o", look: [.6, 0] }, head: { turn: .3, tilt: 1.5 * Math.sin(t) } }).svg;
    s += body(430, 360, .72, { sil: 0, art: k, vein: k });
  } else if (li === 1) {   // two and a half times round the Earth
    var k1 = clamp((t - LN[1].start - .2) / 3);
    s += wrapGlobe(300, 330, 200, t, 2.5, k1) + G("", N("100,000", 300, 620, 52, ORANGE) + T("كيلو؟", 300, 652, 22, INK, 800), clamp(k1 * 2 - .6));
  } else {   // …that number is wrong
    var u = t - LN[2].start;
    s += wrapGlobe(300, 330, 200, t, 2.5, 1) + N("100,000", 300, 620, 52, ORANGE) + cross(300, 330, 3.2, ease(u / .5));
  }
  return s;
};
SCENE.bumper = function (u, t) { return heart(90, 112, .6, Math.max(0, Math.sin(t * 7))); };
SCENE.outro = function (svg, u, t) {
  return heart(80, 150, .55, Math.max(0, Math.sin(t * 7))) + tree(230, 240, 50, 0, 10, 4, 1, 4) + G("translate(320 50) scale(.33)", capBed(0, t, 1)) +
    '<path d="M560 240 C540 180 580 130 560 60" stroke="' + INK + '" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M560 240 C540 180 580 130 560 60" stroke="' + VEIN + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
    callout("1", 80, 40, ease(u / .3)) + callout("2", 230, 40, ease(u / .3 - .5)) + callout("3", 420, 40, ease(u / .3 - 1)) + callout("4", 560, 30, ease(u / .3 - 1.5));
};
