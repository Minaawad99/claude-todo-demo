// ── «ليه البصل بيعيّطك؟» — drawings. The hand follows the «طب إزاي؟» reference (sheets v04: the head in profile,
// v20: the skin cut with nerve endings and the receptor "gate"); shapes follow real references (refs/SOURCES.md):
// the onion bulb cut lengthwise (fleshy scales meeting at the basal plate, roots under it, papery skin), the onion
// epidermis cells (long staggered bricks with a nucleus), the eye in section (cornea, iris, lens) and the lacrimal
// gland above the outer corner of the eye with its ducts (Gray's Anatomy fig. 895).

// ── materials ──
var PEEL = "#c98a4e", PEEL_D = "#9c6232", FLESH = "#f1ead0", FLESH2 = "#e6deb6", RING = "#c2b47c", WALL = "#d4c792", CYTO = "#f3eedb",
    VAC = "#c5d4d4", SULF = "#d2b445", MOLB = "#a9ad74", GAS = "#7f9fb6", STEEL = "#c3c7c9", STEEL_D = "#8e9497", BOARD = "#c9a274", BOARD_D = "#9a7348",
    EYEW = "#f6f2e8", IRIS = "#6f8a6a", BRAIN = "#9db07a", GLAND = "#d9a58e", TEAR = "#9cc0d2", SOIL = "#a98a62", SOIL_D = "#8a6d4a", LEAF = "#8ea05a";
function PS(d, fill, sw, ex) { var col = INK; ex = (ex || "").replace(/ stroke="([^"]*)"/, function (m, c) { col = c; return ""; }); return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + col + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"' + (ex || "") + '/>'; }
function at2(x, y, s, inner, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + ' scale(' + f(s) + ')">' + inner + '</g>'; }
// the moment a caption chunk starts, in seconds from the start of the line's shot (for builds that follow the words)
function chunkAt(line, j) { var l = LN[line], c = window.CHUNKS[line]; return (l.end - l.start) * (c[j] || 0); }

// ── the onion ──
var BULB = "M-10 -135 C-10 -100 -35 -85 -70 -60 C-105 -35 -108 35 -75 70 C-55 90 -30 95 -18 95 L18 95 C30 95 55 90 75 70 C108 35 105 -35 70 -60 C35 -85 10 -100 10 -135 Z";
function roots(t, n) { var s = ""; for (var k = 0; k < (n || 9); k++) { var x = -22 + k * 5.5, sw = 4 * Math.sin(t * 1.3 + k); s += PS("M" + f(x) + " 94 q" + f(-10 + k * 2.4 + sw) + " 18 " + f(-14 + k * 3.6) + " " + f(30 + 6 * hash(k)), "none", 1.4, ' stroke="#9a8460"'); } return s; }
// a whole onion, unit = 100 (scale with s): papery golden skin, striations from the neck to the base, dry tip, roots
function onion(x, y, s, t, op) {
  op = op || {}; var g = PS(BULB, PEEL, 2.4);
  for (var k = -3; k <= 3; k++) if (k) g += PS("M" + f(k * 2.5) + " -125 C" + f(k * 26) + " -70 " + f(k * 30) + " 40 " + f(k * 5) + " 92", "none", 1, ' stroke="' + PEEL_D + '" opacity=".7"');
  g += '<path d="M-58 -30 C-70 0 -64 30 -48 52" stroke="#e7bf8a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>';
  g += PS("M-6 -134 C-12 -150 -20 -156 -26 -166 M6 -134 C10 -152 18 -158 22 -170 M0 -134 C0 -150 2 -160 -2 -176", "none", 1.6, ' stroke="' + PEEL_D + '"');
  if (op.roots !== false) g += roots(t || 0);
  return at2(x, y, s, g, op.rot);
}
// the onion cut lengthwise: thin skin, fleshy scales that all meet at the basal plate, the young shoot in the middle
function onionHalf(x, y, s, t, op) {
  op = op || {}; var g = PS(BULB, PEEL, 2.4), k;
  for (k = 0; k < 7; k++) { var sx = .93 - k * .13, sy = .95 - k * .1; g += '<g transform="translate(0 92) scale(' + f(sx) + ' ' + f(sy) + ') translate(0 -92)">' + PS(BULB, k % 2 ? FLESH2 : FLESH, 1.5, ' stroke="' + RING + '"') + '</g>'; }
  g += PS("M-4 86 C-10 40 -8 -40 0 -118 C8 -40 10 40 4 86 Z", "#c6cc8a", 1.4);
  g += '<ellipse cx="0" cy="88" rx="30" ry="9" fill="#d6c595" stroke="' + INK + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>';
  if (op.hot) g += '<g opacity="' + f(op.hot) + '">' + PS("M-30 88 C-34 70 -34 60 -30 50 L30 50 C34 60 34 70 30 88 Z", ORANGE, 0, ' opacity=".35"') + '</g>';
  if (op.roots !== false) g += roots(t || 0);
  return at2(x, y, s, g, op.rot);
}
// onion epidermis: long cells laid like staggered bricks, each with a nucleus. broken(i) → 0..1 how broken cell i is.
function cells(x0, y0, cols, rows, cw, chh, broken) {
  var s = "", i = 0;
  for (var r = 0; r < rows; r++) for (var c = -1; c < cols; c++, i++) {
    var x = x0 + c * cw + (r % 2 ? cw / 2 : 0), y = y0 + r * chh, b = broken ? broken(i, x, y) : 0;
    s += R(x + 2, y + 2, cw - 4, chh - 4, b > 0 ? "#ead9b9" : FLESH, 1.6, 6) + '<circle cx="' + f(x + cw * .3 + hash(i) * cw * .4) + '" cy="' + f(y + chh * .5) + '" r="' + f(chh * .13) + '" fill="#cdbf8f" stroke="' + INK + '" stroke-width="1.1"/>';
    if (b > 0) s += '<g opacity="' + f(b) + '"><path d="M' + f(x + cw * .2) + ' ' + f(y + 4) + ' l10 ' + f(chh * .4) + ' l-8 ' + f(chh * .25) + ' l12 ' + f(chh * .3) + '" stroke="' + ORANGE + '" stroke-width="2.6" fill="none"/>' + C(x + cw * .7, y + chh * .4, 4, BLUE, 1) + C(x + cw * .8, y + chh * .65, 3, BLUE, 1) + '</g>';
  }
  return s;
}

// ── molecules ──
// the sulfur compound: a little chain with a yellow sulfur ball
function sulf(x, y, s, rot) { return at2(x, y, s || 1, C(-12, 4, 7, MOLB, 1.6) + C(0, -2, 9, SULF, 1.8) + C(13, -6, 6, MOLB, 1.6) + C(5, 9, 5, "#e9e1cc", 1.4), rot); }
// an enzyme: a blob with a notch (its working pocket) that opens and closes
function enz(x, y, r, rot, col, open) { var a = (open == null ? .5 : open) * .7 + .15; return at2(x, y, 1, '<path d="M0 0 L' + f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a)) + ' A' + r + ' ' + r + ' 0 1 1 ' + f(r * Math.cos(-a)) + ' ' + f(r * Math.sin(-a)) + ' Z" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><circle cx="' + f(-r * .45) + '" cy="' + f(-r * .35) + '" r="' + f(r * .14) + '" fill="#fff" opacity=".45"/>', rot); }
// the second enzyme (LFS): a rounded square with a pocket, darker
function lfs(x, y, r, rot, open) { var o = (open == null ? .5 : open) * r * .5; return at2(x, y, 1, '<path d="M' + f(-r) + ' ' + f(-r * .8) + ' Q' + f(-r) + ' ' + f(-r) + ' ' + f(-r * .8) + ' ' + f(-r) + ' H' + f(r * .8) + ' Q' + f(r) + ' ' + f(-r) + ' ' + f(r) + ' ' + f(-r * .8) + ' V' + f(-o) + ' H' + f(r * .2) + ' V' + f(o) + ' H' + f(r) + ' V' + f(r * .8) + ' Q' + f(r) + ' ' + f(r) + ' ' + f(r * .8) + ' ' + f(r) + ' H' + f(-r * .8) + ' Q' + f(-r) + ' ' + f(r) + ' ' + f(-r) + ' ' + f(r * .8) + ' Z" fill="#a8462a" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>', rot); }
// the unstable acid: the sulfur half, shaking
function acid(x, y, s, t) { var j = Math.sin(t * 31) * 2.2, r = Math.sin(t * 23) * 10; return at2(x + j, y, s || 1, C(-6, 2, 7, MOLB, 1.6) + C(6, -3, 9, SULF, 1.8) + C(16, 6, 5, "#e9e1cc", 1.4), r); }
// a gas molecule: two pale-blue balls with little rising wisps
function gasM(x, y, s, t, i) { var w = Math.sin(t * 4 + (i || 0)) * 3; return at2(x, y, s || 1, C(-5, 0, 7, "#b8cfdc", 1.6) + C(6, -3, 6, GAS, 1.6) + '<path d="M' + f(-4 + w) + ' -12 q-4 -6 0 -12 t0 -12 M' + f(6 - w) + ' -14 q4 -6 0 -12" stroke="' + GAS + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'); }
// a rising plume of gas molecules from (x,y) toward (x2,y2); p = how far it has got
function plume(x, y, x2, y2, t, p, n, sc) {
  var s = ""; n = n || 14;
  for (var i = 0; i < n; i++) { var q = ((t * .22 + hash(i) ) % 1), qq = q * clamp(p == null ? 1 : p); if (qq <= .02) continue;
    var px = lerp(x, x2, qq) + Math.sin(t * 1.7 + i * 2) * 26 * (1 - Math.abs(qq - .5)), py = lerp(y, y2, qq); s += G("", gasM(px, py, (sc || .9) * (.8 + .4 * hash(i + 7)), t, i), clamp(Math.min(qq * 5, (1 - q) * 4))); }
  return s;
}

// ── the cell (one onion cell in section): wall, cytoplasm round the edge with the sulfur compound, the big vacuole
// holding the enzyme. mix 0..1 = the wall between them is broken and the two halves meet.
var CX = 320, CY = 400, CW = 420, CH = 500;
var SPOTS = [[150, 205], [250, 190], [395, 195], [480, 220], [150, 330], [495, 330], [150, 470], [495, 465], [180, 600], [300, 615], [430, 610], [490, 560], [140, 560], [370, 190]];
var EPOS = [[260, 300], [360, 290], [300, 400], [400, 400], [250, 500], [350, 520], [420, 480]];
function cell(t, op) {
  op = op || {}; var mix = op.mix || 0, s = "";
  s += R(CX - CW / 2 - 14, CY - CH / 2 - 14, CW + 28, CH + 28, WALL, 2.6, 18) + '<rect x="' + (CX - CW / 2 - 14) + '" y="' + (CY - CH / 2 - 14) + '" width="' + (CW + 28) + '" height="' + (CH + 28) + '" rx="18" fill="url(#hatch)" opacity=".5"/>';
  s += R(CX - CW / 2, CY - CH / 2, CW, CH, CYTO, 2, 12);
  // the nucleus in a corner
  s += C(CX + 150, CY - 175, 32, "#d9cf9f", 1.8) + C(CX + 156, CY - 178, 10, "#bfb27e", 1.2);
  // the vacuole: its membrane is the wall between the two rooms; it tears when mix > 0
  var vd = "M200 260 C200 220 260 215 320 218 C390 220 445 225 445 270 C450 340 452 460 440 540 C432 590 380 592 320 590 C250 590 205 590 200 540 C192 450 196 330 200 260 Z";
  if (mix < .99) s += '<g opacity="' + f(1 - mix * .8) + '">' + PS(vd, VAC, 2.4, mix > 0 ? ' stroke-dasharray="' + f(60 - 40 * mix) + ' ' + f(30 * mix + 2) + '"' : "") + '</g>';
  // the sulfur compound in the cytoplasm (olive room), the enzyme in the vacuole (orange room); with mix they meet
  SPOTS.forEach(function (p, i) { var bx = p[0] + Math.sin(t * 1.6 + i) * 4, by = p[1] + Math.cos(t * 1.3 + i) * 4;
    if (op.sulfK != null) s += appear(op.sulfK, sulf(bx, by, 1.15, i * 40)); else s += sulf(bx, by, 1.15, i * 40); });
  EPOS.forEach(function (p, i) { var tg = SPOTS[i * 2 % SPOTS.length], ex = lerp(p[0], tg[0] + 22, mix) + Math.sin(t * 1.9 + i) * 5, ey = lerp(p[1], tg[1] + 6, mix) + Math.cos(t * 1.5 + i) * 5;
    var e = enz(ex, ey, 17, 180 + i * 25, ORANGE, .5 + .5 * Math.sin(t * 5 + i)); s += op.enzK != null ? appear(op.enzK, e) : e; });
  return s;
}
// a kitchen knife blade coming down (edge at the bottom); x, y = the point of the edge's middle
function blade(x, y, len, rot, dull) {
  var e = dull ? ' stroke-width="5"' : "";
  return at2(x, y, 1, '<path d="M' + f(-len / 2) + ' 0 L' + f(len / 2) + ' -12 L' + f(len / 2) + ' -86 L' + f(-len / 2 + 40) + ' -86 Q' + f(-len / 2) + ' -60 ' + f(-len / 2) + ' 0 Z" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M' + f(-len / 2 + 6) + ' -4 L' + f(len / 2) + ' -16" stroke="' + (dull ? STEEL_D : "#eef1f2") + '"' + (dull ? e : ' stroke-width="3"') + '/><path d="M' + f(-len / 2 + 30) + ' -70 L' + f(len / 2 - 10) + ' -76" stroke="#e4e7e8" stroke-width="5" stroke-linecap="round"/>' +
    R(len / 2, -96, 150, 34, "#4b3a2c", 2.4, 8) + C(len / 2 + 40, -79, 4, "#c9c2b0", 1) + C(len / 2 + 100, -79, 4, "#c9c2b0", 1), rot);
}

// ── the head, the eye, the gland ──
// a head in profile looking left (v04 hand): skin, ear, closed-mouth line, an almond eye. unit ≈ 100.
var HEAD = "M60 165 C62 120 92 92 100 40 C112 -32 70 -104 0 -106 C-60 -108 -96 -62 -99 -22 C-100 -10 -104 2 -113 18 C-119 28 -113 35 -101 37 C-105 45 -101 49 -99 53 C-104 57 -101 63 -97 67 C-99 81 -95 91 -80 95 C-60 99 -45 101 -35 113 L-32 165 Z";
function head(x, y, s, rot, op) {
  op = op || {}; var g = PS(HEAD, SKIN, 2.6) + '<path d="' + HEAD + '" fill="url(#hatch)" opacity=".25"/>';
  if (op.brain) g += '<g opacity="' + f(op.brain) + '">' + PS("M-70 -40 C-80 -80 -30 -96 10 -92 C60 -88 84 -50 78 -14 C74 10 50 18 24 14 C0 22 -30 16 -50 6 C-66 -2 -68 -20 -70 -40 Z", BRAIN, 2.2) +
    PS("M-50 -50 q10 -12 22 -4 M-20 -70 q14 -6 22 6 M18 -60 q14 -10 26 2 M40 -30 q12 -2 16 12 M-30 -20 q12 -10 26 0 M10 -20 q10 8 24 0", "none", 1.6, ' stroke="#5e6e45"') + PS("M20 14 C24 34 30 50 26 70", "none", 9, ' stroke="#7f915e"') + '</g>';
  g += PS("M32 -6 C46 -18 58 -2 50 14 C46 24 34 26 32 18", "#c98f74", 2) + PS("M-104 58 q8 2 12 -2", "none", 1.6);
  g += PS("M-92 -32 q14 -9 30 -4", "none", 3);
  g += PS("M-88 -8 Q-76 -20 -62 -10 Q-76 -2 -88 -8 Z", op.wet ? "#fff" : EYEW, 1.8) + C(-80, -10, 3.5, INK, 0);
  return at2(x, y, s, g, rot);
}
// the eye in section, looking left: white globe, clear cornea bulging in front, iris, lens, the optic nerve out the back
function eyeCut(x, y, s, t, op) {
  op = op || {}; var g = "";
  g += R(130, -26, 120, 52, "#e2c9a0", 2.2, 20) + '<path d="M140 -16 H250 M140 0 H250 M140 16 H250" stroke="#c7ad83" stroke-width="2"/>';
  g += C(0, 0, 150, EYEW, 3) + '<circle r="150" fill="url(#hatch)" opacity=".18"/>';
  g += C(18, 0, 132, "#e9d8c8", 1.4) + PS("M-60 -20 C-30 -40 30 -60 90 -40 M-40 40 C0 60 60 70 100 40", "none", 1.6, ' stroke="#c98f74"');
  g += PS("M-118 -92 C-178 -60 -178 60 -118 92", "#dce9ee", 3) + PS("M-118 -92 C-178 -60 -178 60 -118 92", "none", 7, ' stroke="#b8d4df" opacity=".9"');
  g += PS("M-120 -78 C-126 -30 -126 30 -120 78", "none", 10, ' stroke="' + IRIS + '"') + '<ellipse cx="-92" cy="0" rx="26" ry="62" fill="#efe9da" stroke="' + INK + '" stroke-width="2"/>';
  // the lids, top and bottom (skin), meeting in front of the cornea
  g += PS("M-200 -170 C-150 -170 -110 -150 -100 -100 C-130 -110 -160 -100 -178 -62 C-190 -90 -196 -130 -200 -170 Z", SKIN, 2.4) + PS("M-200 170 C-150 170 -110 150 -100 100 C-130 108 -160 98 -178 62 C-190 90 -196 130 -200 170 Z", SKIN, 2.4);
  return at2(x, y, s, g);
}
// the front of the cornea, magnified: a row of surface cells with the tear film on top, nerve endings reaching up
// between them, each ending a «gate» that opens when a gas molecule lands on it (reference v20)
function cornea(t, op) {
  op = op || {}; var s = "", k, act = op.act || 0, gx = op.gx == null ? 320 : op.gx;
  s += R(-60, 330, 760, 60, "#d9e8ee", 0) + '<path d="M-60 330 H700" stroke="' + INK + '" stroke-width="2" opacity=".5"/>';
  for (k = 0; k < 11; k++) s += '<ellipse cx="' + f(-30 + k * 66) + '" cy="420" rx="34" ry="30" fill="#efe2d2" stroke="' + INK + '" stroke-width="1.8"/>' + '<ellipse cx="' + f(-30 + k * 66 + 33) + '" cy="474" rx="34" ry="28" fill="#e9d8c4" stroke="' + INK + '" stroke-width="1.8"/>';
  s += R(-60, 500, 760, 400, "#e4d3bc", 2) + '<rect x="-60" y="500" width="760" height="400" fill="url(#hatch)" opacity=".35"/>';
  // the nerve: a trunk from below, branches up to endings at the surface
  var ends = [130, gx, 510];
  var nd = ends.map(function (ex, i) { return "M" + f(320 + (i - 1) * 40) + " 900 C" + f(320 + (i - 1) * 40) + " 700 " + f(ex) + " 600 " + f(ex) + " 388"; }).join(" ");
  s += PS(nd, "none", 13) + PS(nd, "none", 8.5, ' stroke="#d8ccb2"');
  // gates on the endings
  ends.forEach(function (ex, i) { var open = i === 1 ? act : 0, w = 10 + 10 * open;
    s += '<path d="M' + f(ex - 26) + ' 386 h' + f(26 - w) + ' v-28 M' + f(ex + 26) + ' 386 h' + f(-26 + w) + ' v-28" stroke="' + INK + '" stroke-width="3" fill="none"/>' +
         R(ex - 26 - 2, 358, 26 - w + 2, 30, i === 1 ? ORANGE : "#c96a4a", 2, 4) + R(ex + w, 358, 26 - w + 2, 30, i === 1 ? ORANGE : "#c96a4a", 2, 4); });
  // a pulse running down the active nerve
  if (op.pulse) for (k = 0; k < 3; k++) { var q = ((op.pulse * .6 + k / 3) % 1), py = lerp(400, 880, q), px = gx + (320 - gx) * Math.pow(q, 1.4); s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="10" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(1 - q * .6) + '"/>'; }
  return s;
}
// the lacrimal gland seen from the front (Gray 895): a lobed gland above the outer corner, ducts into the upper lid
function glandFront(t, k, tears) {
  var s = '<ellipse cx="0" cy="0" rx="150" ry="70" fill="' + EYEW + '" stroke="' + INK + '" stroke-width="2.6"/>' + C(-6, 0, 50, IRIS, 2.4) + C(-6, 0, 22, INK, 0) + C(6, -12, 8, "#fff", 0);
  s += PS("M-170 -10 C-120 -100 120 -100 170 -10 C120 -70 -120 -70 -170 -10 Z", SKIN, 2.4) + PS("M-170 10 C-120 90 120 90 170 10 C120 60 -120 60 -170 10 Z", SKIN, 2.4);
  s += PS("M-120 -78 C-60 -110 60 -110 120 -78", "none", 3);
  var lobes = [[150, -112, 22], [176, -98, 20], [130, -98, 18], [168, -126, 17], [192, -116, 15], [150, -134, 14]];
  s += appear(k, lobes.map(function (l) { return C(l[0], l[1], l[2], GLAND, 2); }).join("") + PS("M120 -94 C110 -84 104 -78 100 -66 M140 -88 C134 -78 128 -72 122 -62 M160 -84 C156 -74 150 -68 144 -58", "none", 2.2, ' stroke="' + BLUE + '"'));
  if (tears) for (var i = 0; i < 6; i++) { var q = (t * .5 + i / 6) % 1, x = 100 - q * 220, y = -40 + Math.sin(q * Math.PI) * 60; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" fill="' + TEAR + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(tears * (1 - q * .3)) + '"/>'; }
  if (tears > .3) { var dq = (t * .7) % 1; s += '<path d="M-150 ' + f(70 + dq * 80) + ' q-10 16 0 24 q10 -8 0 -24 Z" fill="' + TEAR + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(tears) + '"/>'; }
  return s;
}
function tearDrop(x, y, s, col) { return at2(x, y, s || 1, '<path d="M0 -26 C10 -10 18 0 18 10 A18 18 0 0 1 -18 10 C-18 0 -10 -10 0 -26 Z" fill="' + (col || TEAR) + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 6 q0 8 6 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'); }

// ── the kitchen ──
function boardSide(x, y, w) { return R(x, y, w, 26, BOARD, 2.4, 6) + R(x + 8, y + 26, w - 16, 8, BOARD_D, 2, 2) + '<path d="M' + f(x + 20) + ' ' + f(y + 9) + ' H' + f(x + w - 30) + ' M' + f(x + 40) + ' ' + f(y + 17) + ' H' + f(x + w - 60) + '" stroke="' + BOARD_D + '" stroke-width="1.4"/>'; }
// a glow stick: clear tube, a glass vial inside; bend 0..1 cracks the vial and the two liquids mix and glow
function glowStick(x, y, t, bend) {
  var a = bend * 22, glow = clamp(bend * 1.6 - .5), s = "";
  var tube = function (half, sign) { var g = R(sign < 0 ? -230 : 0, -24, 230, 48, glow > 0 ? "rgba(200,220,120," + f(.35 + .5 * glow) + ")" : "#e8ead8", 2.6, 22);
    g += R(sign < 0 ? -200 : 10, -10, 190, 20, glow > 0 ? "rgba(240,240,200,.6)" : "#c9dce4", 1.8, 10);
    if (glow > 0) g += '<rect x="' + (sign < 0 ? -226 : 4) + '" y="-20" width="222" height="40" rx="20" fill="#d9ec7c" opacity="' + f(glow * .7) + '"/>';
    return G("rotate(" + f(sign * a) + ")", g); };
  if (glow > 0) s += '<ellipse cx="0" cy="0" rx="' + f(260 + 20 * Math.sin(t * 3)) + '" ry="' + f(80 + 10 * Math.sin(t * 3)) + '" fill="#e6f09a" opacity="' + f(glow * .45) + '"/>';
  s += tube(0, -1) + tube(1, 1);
  if (bend > .45) s += '<path d="M-8 -12 l6 8 l-5 6 l7 9" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>';
  return at2(x, y, 1, s);
}
// a ceiling smoke alarm and a sprinkler; on 0..1 = the alarm has gone off and the sprinkler sprays
function alarm(t, on) {
  var s = R(-40, 60, 720, 70, "#e3d8bf", 2.4) + '<rect x="-40" y="60" width="720" height="70" fill="url(#hatch)" opacity=".5"/>';
  s += R(118, 130, 124, 16, "#f1ece0", 2.2, 4) + '<path d="M128 146 Q180 190 232 146 Z" fill="#f1ece0" stroke="' + INK + '" stroke-width="2.2"/>' + C(180, 160, 6, on > 0 && Math.sin(t * 12) > 0 ? "#e2402a" : "#7a2a1e", 1.4);
  for (var i = 0; i < 9; i++) { var q = (t * .35 + i / 9) % 1, sx = 180 + Math.sin(t + i * 2) * 40 * q - 20, sy = 520 - q * 340; s += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="' + f(16 + 30 * q) + '" fill="#9b9a94" opacity="' + f(.35 * (1 - q)) + '"/>'; }
  s += R(452, 130, 16, 30, STEEL, 2) + PS("M436 162 H484 L476 172 H444 Z", STEEL, 2) + C(460, 176, 7, ORANGE, 1.6);
  if (on > 0) for (i = 0; i < 26; i++) { var qq = (t * 1.1 + hash(i)) % 1, ang = Math.PI / 2 + (hash(i + 3) - .5) * 1.9, d = 30 + qq * 380; s += '<path d="M' + f(460 + Math.cos(ang) * d) + ' ' + f(178 + Math.sin(ang) * d) + ' l' + f(Math.cos(ang) * 10) + ' ' + f(Math.sin(ang) * 10) + '" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(on * (1 - qq * .6)) + '"/>'; }
  return s;
}
// a beetle seen from above (no face): shell halves, head, six legs, antennae; walk = leg swing
function beetle(x, y, s, rot, walk) {
  var w = Math.sin(walk || 0) * 8, g = "";
  [-1, 1].forEach(function (sd) { [-18, 0, 18].forEach(function (ly, i) { var sw = (i % 2 ? w : -w) * sd; g += PS("M" + f(sd * 16) + " " + ly + " l" + f(sd * 20) + " " + f(-8 + sw) + " l" + f(sd * 10) + " " + f(14 + sw), "none", 2.4); }); });
  g += PS("M-6 -40 q-6 -14 -18 -18 M6 -40 q6 -14 18 -18", "none", 2);
  g += '<ellipse cx="0" cy="6" rx="22" ry="34" fill="#5a4636" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 -26 V40" stroke="' + INK + '" stroke-width="1.8"/>' + '<ellipse cx="0" cy="-32" rx="11" ry="9" fill="#3d2f24" stroke="' + INK + '" stroke-width="2"/><ellipse cx="-9" cy="-4" rx="5" ry="10" fill="#fff" opacity=".2"/>';
  return at2(x, y, s, g, rot);
}
function snow(x, y, r) { var s = ""; for (var k = 0; k < 3; k++) s += G("rotate(" + (k * 60) + " " + x + " " + y + ")", '<path d="M' + x + ' ' + (y - r) + ' V' + (y + r) + ' M' + (x - 8) + ' ' + (y - r + 10) + ' L' + x + ' ' + (y - r + 18) + ' L' + (x + 8) + ' ' + (y - r + 10) + ' M' + (x - 8) + ' ' + (y + r - 10) + ' L' + x + ' ' + (y + r - 18) + ' L' + (x + 8) + ' ' + (y + r - 10) + '" stroke="' + BLUE + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>'); return s; }
function thermo(x, y, k) { var h = 150 * (1 - k * .75); return R(x - 14, y - 180, 28, 190, "#f4efe3", 2.4, 14) + C(x, y + 20, 24, BLUE, 2.4) + R(x - 6, y - h, 12, h + 10, BLUE, 0) + [0, 1, 2, 3, 4].map(function (i) { return '<path d="M' + (x + 14) + ' ' + (y - 30 - i * 30) + ' h10" stroke="' + INK + '" stroke-width="2"/>'; }).join(""); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · an onion cut lengthwise; then the camera flies into the flesh: the cells, laid like bricks
shot(4, push(320, 380, 0.98, 1.08), function (u, d, t) {
  return paper() + boardSide(70, 640, 500) + onionHalf(320, 420, 2.1, t, { roots: true }) + label(250, 330, 130, 180, "طبقات البصلة", OLIVE, at(u, .6, .5), 24);
});
shot([4, 1], push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + cells(0, 120, 7, 9, 104, 64) + inset(320, 450, 150, G("translate(-320 -400)", cells(0, 300, 7, 4, 104, 64)) + G("translate(-6 -4)", '<circle r="60" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="8 6" transform="rotate(' + f(t * 20) + ')"/>'), at(u, .8, .4)) +
    label(150, 200, 120, 90, "خلايا", OLIVE, at(u, .3, .5), 26);
}, { tr: "in" });
// 5 · one cell in section: the sulfur compound in one room, the enzyme (alliinase) in the other
shot(5, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k1 = at(u, .3, .6), k2 = at(u, chunkAt(5, 1), .6);
  return paper() + cell(t, { sulfK: k1, enzK: k2 }) + label(250, 190, 300, 90, "مادة فيها كبريت", OLIVE, k1, 24) + label(400, 400, 560, 330, "الأليناز", ORANGE, k2, 26) +
    G("", tag("أوضة 1", 320, 715, 1, 22, OLIVE) , at(u, chunkAt(5, 2), .4)) + G("", tag("أوضة 2", 320, 560, 1, 22, BLUE), at(u, chunkAt(5, 2) + .3, .4));
}, { tr: "in" });
// 6 · the knife comes down, the wall between the rooms tears, the two halves meet
shot(6, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var kd = at(u, .4, 1.0), mix = at(u, 1.3, d - 1.8);
  return paper() + cell(t, { mix: mix }) + blade(lerp(300, 330, kd), lerp(-60, 360, kd), 360, -8) + G("", tag("اتكسرت", 320, 720, 1, 30, ORANGE), at(u, 1.6, .3)) + '<g opacity="' + f(at(u, 1.2, .3)) + '">' + label(205, 420, 120, 700, "الحيطة", ORANGE, 1, 24) + '</g>';
});
// 7 · like a glow stick: bend it, the inner vial cracks, the two liquids mix and it lights
shot(7, push(320, 400, 0.98, 1.06), function (u, d, t) {
  var b = at(u, .6, 1.2);
  return paper() + G("translate(320 420) scale(1.25) translate(-320 -400)", glowStick(320, 400, t, b)) + label(130, 420, 200, 270, "سايلين", OLIVE, at(u, .2, .4), 24) + label(300, 420, 360, 270, "أنبوبة إزاز جوه", BLUE, at(u, .3, .4), 24) +
    iconBox(530, 120, 140, onionHalf(0, 10, .38, t, { roots: false }), at(u, .2, .3)) + G("", T("تكسرها = تنوّر", 320, 620, 32, INK, 800), at(u, 2, .4));
}, { tr: "out" });
// 8 · the enzyme cuts the sulfur compound; what comes off is an acid that won't sit still
shot(8, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .4, 1.2), cut = at(u, 1.6, .4), s = paper();
  s += C(320, 400, 250, CYTO, 2) + '<circle cx="320" cy="400" r="250" fill="url(#hatch)" opacity=".15"/>';
  s += enz(lerp(120, 245, k), 400, 70, 0, ORANGE, .4 + .6 * Math.abs(Math.sin(t * (cut > 0 ? 6 : 3))));
  if (cut < 1) s += G("", sulf(340, 400, 3.2, -10), 1 - cut);
  if (cut > 0) s += G("", acid(lerp(360, 430, cut), lerp(400, 360, cut), 3.2, t) + C(lerp(300, 260, cut), lerp(420, 480, cut), 16, MOLB, 2), cut);
  return s + label(430, 360, 520, 200, "حمض مش مستقر", ORANGE, at(u, 2.1, .5), 24) + label(200, 420, 120, 620, "الأليناز", ORANGE, at(u, .6, .4), 22);
}, { tr: "in" });
// 9 · a second enzyme (LFS) comes in; found in Japan in 2002
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1);
  return paper() + C(320, 400, 250, CYTO, 2) + acid(400, 360, 3.2, t) + lfs(lerp(-40, 200, k), 380, 64, 0, .5 + .5 * Math.sin(t * 4)) + label(170, 330, 110, 170, "إنزيم تاني", ORANGE, at(u, .9, .4), 24) +
    G("", tag("LFS", 200, 480, 1, 30, "#a8462a"), at(u, 1.1, .3)) + bigNum(count(2002, at(u, chunkAt(9, 1), .9)).replace(",", ""), "اليابان", 450, 660, at(u, chunkAt(9, 1), .3), ORANGE, 78);
});
// 10 · it turns the acid into a light gas that floats off — in seconds
shot(10, push(320, 420, 1.04, 0.96), function (u, d, t) {
  var k = at(u, .3, .8), s = paper() + C(320, 520, 230, CYTO, 2);
  s += lfs(210, 520, 64, 0, .5 + .5 * Math.sin(t * 6)) + G("", acid(lerp(420, 300, k), 500, 3, t), 1 - k);
  s += plume(300, 470, 330, 30, t, at(u, .9, 1.2), 16, 1.6);
  return s + label(360, 220, 480, 120, "غاز خفيف", BLUE, at(u, 1.6, .5), 26) + G("", '<circle cx="530" cy="640" r="44" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/><path d="M530 640 L' + f(530 + 30 * Math.sin(t * 5)) + ' ' + f(640 - 30 * Math.cos(t * 5)) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/><path d="M522 590 h16" stroke="' + INK + '" stroke-width="5"/>' + T("ثواني", 530, 718, 26, ORANGE, 800), at(u, chunkAt(10, 1), .4));
}, { tr: "out" });
// 11–12 · the kitchen from the side: the board, the cut onion, your head bent over it; the gas rises into your face
function kitchen(u, t, p, op) {
  op = op || {}; var s = paper() + R(-40, 640, 720, 200, "#d8ccae", 2.4) + '<rect x="-40" y="640" width="720" height="200" fill="url(#hatch)" opacity=".4"/>' + boardSide(40, 614, 360);
  s += onionHalf(150, 545, .6, t, { roots: false }) + onionHalf(290, 545, .6, t, { roots: false });
  s += blade(470, 610, 160, 0);
  s += head(450, 250, 1.15, -28, { wet: op.wet });
  s += plume(220, 520, 330, 230, t, p, 18, 1.1);
  return s;
}
shot(11, push(320, 420, 0.94, 1.0), function (u, d, t) { return kitchen(u, t, at(u, .2, 1.6)) + G("", T("؟", 120, 280, 120, ORANGE, 800), at(u, .5, .3)); }, { tr: "out" });
shot(12, pan(300, 470, 330, 330, 1.08), function (u, d, t) { var k = at(u, chunkAt(12, 2), .8); return kitchen(u, t, 1) + draw("M220 520 C240 430 290 330 340 262", k, ORANGE, 3, ' stroke-dasharray="10 8"') + arrow(325, 285, 340, 262, ORANGE, 4, k) + label(330, 625, 420, 720, "لوح التقطيع", OLIVE, at(u, .5, .4), 22); });
// 13 · the gas lands on the eye: a section of the eye, gas molecules settling on the cornea, its nerve endings
shot(13, push(300, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + eyeCut(400, 400, 1.15, t);
  s += plume(-40, 520, 140, 300, t, 1, 12, 1.4);
  for (var i = 0; i < 6; i++) { var q = at(u, .6 + i * .3, .6); s += G("", gasM(lerp(40, 172 - Math.abs(i - 2.5) * 6, q), lerp(560, 260 + i * 56, q), 1.3, t, i), q); }
  return s + label(212, 320, 300, 150, "القرنية", OLIVE, at(u, .4, .5), 26) + label(222, 460, 320, 680, "أطراف أعصاب", ORANGE, at(u, chunkAt(13, 1) + .3, .5), 24);
}, { tr: "in" });
// 14 · close on the nerve ending: the gas docks in its gate, the gate opens, a signal runs down the nerve.
//      Thumbnail: the same nerve that feels hot mustard
shot(14, push(320, 450, 1.06, 1.0), function (u, d, t) {
  var land = at(u, .4, .8), act = at(u, 1.1, .4), s = paper() + cornea(t, { act: act, pulse: act > 0 ? (u - 1.1) : 0 });
  s += gasM(320, lerp(120, 340, land), 2, t, 1); for (var i = 0; i < 5; i++) s += gasM(80 + i * 120, 180 + 40 * Math.sin(t * 1.5 + i * 2), 1.4, t, i);
  return s + label(346, 372, 470, 260, "بوابة", ORANGE, at(u, .3, .4), 26) +
    iconBox(110, 110, 150, R(-28, -20, 56, 60, "#e5c04a", 2, 6) + R(-32, -34, 64, 16, "#7a5a3a", 2, 4) + R(-20, -4, 40, 24, "#f4efe3", 1.4) + T("مستردة", 0, 13, 13, INK, 800), at(u, chunkAt(14, 0) + .2, .3));
}, { tr: "in" });
// 15 · the brain reads it as harm and tells the tear gland to make tears (profile, plus the gland seen from the front)
shot(15, push(320, 400, 0.96, 1.02), function (u, d, t) {
  var kb = at(u, .3, .5), kg = at(u, chunkAt(15, 1), .5), tears = at(u, chunkAt(15, 1) + .5, .6);
  var s = paper() + head(250, 330, 2.0, 0, { brain: kb, wet: tears > 0 });
  s += draw("M90 312 C110 260 160 220 220 200", kb, ORANGE, 4, ' stroke-dasharray="9 7"');
  for (var k = 0; k < 2; k++) { var q = ((u * .8 + k * .5) % 1); if (kb > .5) s += C(lerp(90, 220, q), lerp(312, 200, q) - Math.sin(q * Math.PI) * 30, 7, ORANGE, 1.4); }
  if (tears > 0) for (var i = 0; i < 3; i++) { var qq = (t * .6 + i / 3) % 1; s += tearDrop(78 - qq * 20, 330 + qq * 300, .7, TEAR); }
  s += label(250, 210, 380, 90, "المخ", OLIVE, kb, 26);
  return s + inset(470, 600, 150, G("scale(.78) translate(-40 30)", glandFront(t, kg, tears)), kg) + label(560, 520, 440, 420, "الغدة الدمعية", BLUE, at(u, chunkAt(15, 1) + .3, .5), 22);
});
// 16 · like a fire alarm: it senses smoke and opens the sprinklers
shot(16, push(320, 380, 1.04, 0.98), function (u, d, t) {
  var on = at(u, 1, .4); return paper() + alarm(t, on) + label(180, 175, 260, 300, "الإنذار", ORANGE, at(u, .3, .4), 24) + label(470, 175, 380, 240, "الرشاش", BLUE, at(u, 1.4, .4), 24) +
    G("", R(60, 560, 520, 150, "#efe6d0", 0) + T("دخان ← إنذار ← مية", 320, 650, 34, INK, 800), at(u, 2, .4));
}, { tr: "out" });
// 17 · why does the onion do it? to defend itself — the onion in the ground, in section
function ground(t, k) {
  var s = R(-40, 470, 720, 400, SOIL, 2.4) + '<rect x="-40" y="470" width="720" height="400" fill="url(#hatch)" opacity=".5"/>';
  for (var i = 0; i < 30; i++) s += C(hash(i) * 640, 500 + hash(i + 50) * 300, 3 + hash(i + 9) * 4, SOIL_D, 0);
  s += '<path d="M-40 470 H680" stroke="#6e5a3c" stroke-width="4"/>';
  for (i = 0; i < 4; i++) { var sw = Math.sin(t * 1.4 + i) * 6; s += PS("M" + (300 + i * 14) + " 360 C" + f(290 + i * 20 + sw) + " 240 " + f(250 + i * 40 + sw) + " 120 " + f(230 + i * 52 + sw * 2) + " " + (40 + i * 10), "none", 12, ' stroke="' + LEAF + '"') + PS("M" + (300 + i * 14) + " 360 C" + f(290 + i * 20 + sw) + " 240 " + f(250 + i * 40 + sw) + " 120 " + f(230 + i * 52 + sw * 2) + " " + (40 + i * 10), "none", 1.6); }
  s += onion(320, 470, 1.25, t, { roots: true });
  return s;
}
shot(17, push(320, 420, 1.0, 1.06), function (u, d, t) { return paper() + ground(t) + G("", tag("بتحمي نفسها", 320, 720, 1, 32, OLIVE), at(u, chunkAt(17, 1), .4)) + G("", T("؟", 520, 200, 110, ORANGE, 800), at(u, .2, .3) * (1 - at(u, chunkAt(17, 1), .3))); });
// 18 · a beetle bites the bulb, gets the spray in its face and backs off
shot(18, push(320, 470, 1.12, 1.04), function (u, d, t) {
  var kIn = at(u, .1, 1.0), puff = at(u, 1.2, .5), away = at(u, 2.0, 1.2), bx = lerp(lerp(620, 470, kIn), 640, away), by = lerp(560, 620, away);
  var s = paper() + ground(t) + beetle(bx, by, 1.3, -90 + (away > 0 ? 140 * away : 0), t * 12);
  if (puff > 0) s += plume(450, 560, 520, 330, t, puff, 12, 1.4) + '<circle cx="455" cy="560" r="' + f(40 * puff) + '" fill="' + GAS + '" opacity="' + f(.35 * (1 - away)) + '"/>';
  return s + G("", arrow(bx - 30, by - 70, bx + 40, by - 110, OLIVE, 5, 1), at(u, 2.2, .4)) + label(460, 540, 400, 380, "الرشّة", BLUE, at(u, 1.4, .4), 24);
}, { tr: "in" });
// 19 · the myth: the gas turns into sulfuric acid in the eye — no
shot(19, push(320, 400, 1.06, 0.98), function (u, d, t) {
  var x = at(u, chunkAt(19, 1) + .1, .6);
  return paper() + eyeCut(400, 500, 1.0, t) + plume(-20, 620, 180, 480, t, 1, 10, 1.3) + numBox("H₂SO₄", 320, 170, at(u, .3, .3), 54) + G("", T("حمض كبريتيك", 320, 260, 30, ORANGE, 800), at(u, .5, .3)) + cross(320, 190, 2.8, x);
}, { tr: "out" });
// 20 · the gas itself sets off the nerves; the tears wash it out
shot(20, push(320, 450, 1.0, 1.05), function (u, d, t) {
  var wash = at(u, chunkAt(20, 1), 1.4), s = paper() + cornea(t, { act: 1 - wash, pulse: u });
  for (var i = 0; i < 6; i++) { var gx = 60 + i * 110 + wash * 520, gy = 300 + 20 * Math.sin(t * 2 + i); s += G("", gasM(gx, gy, 1.6, t, i), 1 - wash * .8); }
  s += sweep(-60, 250, 760, 90, wash, "r", '<path d="M-60 330 C40 250 140 300 240 270 S440 300 520 262 S640 290 700 270 V340 H-60 Z" fill="' + TEAR + '" opacity=".75" stroke="' + INK + '" stroke-width="2"/>');
  return s + check(320, 150, 1.5, at(u, .4, .5), OLIVE) + label(346, 372, 470, 230, "الغاز نفسه", BLUE, at(u, .2, .4), 24) + G("", tag("دموع", 160, 200, 1, 28, BLUE), at(u, chunkAt(20, 1) + .4, .3));
});
// 21 · fewer tears: a few minutes in the fridge — the cold makes the enzyme sluggish
shot(21, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.6), s = paper();
  s += R(120, 120, 400, 560, "#e9ece6", 3, 14) + R(140, 140, 360, 520, "#dfe7ea", 2, 8) + '<path d="M140 420 H500" stroke="' + INK + '" stroke-width="3"/>' + R(500, 140, 30, 520, "#d4d9d6", 2, 6);
  s += onion(320, 330, .7, t, { roots: false }) + onion(240, 590, .45, t, { roots: false }) + onion(400, 590, .45, t, { roots: false }) + thermo(580, 600, k) + snow(200, 200, 24 + 3 * Math.sin(t * 2));
  return s + iconBox(80, 90, 130, enz(0, 4, 34, 0, ORANGE, .2 + .25 * Math.abs(Math.sin(t * (4 - 3 * k)))) + T("z", 30, -26, 18, BLUE, 800) + T("z", 44, -40, 14, BLUE, 800), at(u, chunkAt(21, 2), .3)) + label(580, 440, 560, 90, "برد", BLUE, at(u, 1, .4), 22);
});
// 22 · a sharp knife breaks fewer cells than a dull one; then: leave the root end till last
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .3, 1.2), s = paper();
  s += cells(0, 240, 3, 4, 104, 60, function (i, x, y) { return Math.abs(x + 52 - 150) < 60 && y < 240 + 60 * 4 * k ? k : 0; }) + G("translate(320 0)", cells(0, 240, 3, 4, 104, 60, function (i, x, y) { return y < 240 + 60 * 4 * k ? k : 0; }));
  s += '<path d="M320 200 V500" stroke="' + INK + '" stroke-width="3"/>';
  s += blade(170, lerp(180, 470, k), 200, -90) + blade(470, lerp(180, 440, k), 200, -90, true);
  return s + T("حامية", 150, 560, 32, OLIVE, 800) + T("تلمة", 480, 560, 32, ORANGE, 800) + check(150, 620, 1.2, at(u, 1.4, .4), OLIVE) + cross(480, 620, .9, at(u, 1.6, .4));
});
shot([22, 1], push(320, 400, 1.06, 0.98), function (u, d, t) {
  return paper() + onion(320, 360, 2.1, t, { roots: true }) + '<circle cx="320" cy="580" r="' + f(70 + 4 * Math.sin(t * 4)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 7"/>' + label(370, 590, 520, 700, "الجذر", ORANGE, at(u, .2, .4), 26) + G("", tag("للآخر", 160, 680, 1, 30, ORANGE), at(u, .6, .3));
}, { tr: "in" });
// 23 · the recap: knife → gas → eye → tears, each one as it is said
shot(23, push(320, 400, 0.98, 1.02), function (u, d, t) {
  var a = [0, chunkAt(23, 1), chunkAt(23, 2), chunkAt(23, 3)].map(function (c) { return at(u, c + .1, .5); }), s = paper();
  s += appear(a[0], G("translate(170 200) scale(.38) translate(-320 -400)", cell(t, { mix: .7 })) + blade(170, 130 + 8 * Math.sin(t * 2), 160, -10)) + callout("1", 60, 90, a[0]);
  s += appear(a[1], plume(470, 330, 470, 120, t, 1, 10, 1.2)) + callout("2", 580, 90, a[1]);
  s += appear(a[2], eyeCut(170, 560, .6, t)) + callout("3", 60, 450, a[2]);
  s += appear(a[3], tearDrop(470, 560, 2.4 + .1 * Math.sin(t * 3))) + callout("4", 580, 450, a[3]);
  s += arrow(270, 210, 380, 210, INK, 4, a[1]) + arrow(450, 360, 300, 480, INK, 4, a[2]) + arrow(300, 570, 400, 570, INK, 4, a[3]);
  return s;
}, { tr: "out" });
// 24 · the odd fact: an onion that doesn't make you cry — the second enzyme switched off
shot(24, push(320, 420, 1.04, 0.98), function (u, d, t) {
  return paper() + boardSide(90, 600, 460) + onionHalf(320, 430, 1.6, t, { roots: false }) + lfs(500, 230, 50, 0, .3) + cross(500, 230, 1.3, at(u, chunkAt(24, 1) + .2, .6)) +
    G("", tag("نيوزيلندا · اليابان", 220, 140, 1, 26, OLIVE), at(u, .4, .3)) + check(170, 300, 1.4, at(u, chunkAt(24, 1) + .8, .5), OLIVE) + label(330, 380, 210, 300, "بصلة ما بتعيّطش", OLIVE, at(u, chunkAt(24, 1) + .6, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a whole onion on a board — nothing happens. line 1: the knife comes down, the gas rises, the eye waters.
  // line 2: you never touched your eye — a dashed gap between the board and the eye
  var s = boardSide(60, 520, 490), u1 = t - LN[1].start;
  if (li === 0) s += onion(300, 360, 1.4, t) + check(470, 150, 1.2, ease((t - 1.2) / .5), OLIVE);
  else {
    var cut = ease(u1 / .6); s += onionHalf(230 - 30 * cut, 400, 1.15, t, { roots: false, rot: -cut * 8 }) + onionHalf(370 + 30 * cut, 400, 1.15, t, { roots: false, rot: 180 + cut * 8 }) + blade(300, lerp(160, 470, cut), 300, -90);
    s += plume(300, 400, 360, 60, t, ease((u1 - .6) / 1.2), 14, 1.3);
    s += iconBox(500, 100, 170, '<path d="M-70 0 Q0 -50 70 0 Q0 50 -70 0 Z" fill="' + EYEW + '" stroke="' + INK + '" stroke-width="2.4"/>' + C(0, 0, 22, IRIS, 2) + C(0, 0, 9, INK, 0) + tearDrop(-50, 40 + ((t * 40) % 40), .7) + PS("M-70 -20 Q0 -66 70 -20", "none", 3), ease((u1 - 1.2) / .3));
    if (li >= 2) s += draw("M420 190 C380 260 330 300 300 360", ease((t - LN[2].start) / .6), ORANGE, 3, ' stroke-dasharray="10 8"') + G("", T("؟", 420, 300, 90, ORANGE, 800), ease((t - LN[2].start - .5) / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) { return onion(90, 112, .5 + .02 * Math.sin(t * 3), t) + plume(110, 70, 140, 0, t, 1, 6, .6); };
SCENE.outro = function (svg, u, t) {
  var s = G("translate(530 150) scale(.26) translate(-320 -400)", cell(t, { mix: .7 })) + plume(390, 200, 380, 40, t, 1, 7, .8) + G("translate(250 150) scale(.36)", eyeCut(0, 0, 1, t)) + G("translate(80 120) scale(.28)", glandFront(t, 1, 1));
  return s + callout("1", 530, 30, ease(u / .3)) + callout("2", 390, 30, ease(u / .3 - .5)) + callout("3", 230, 30, ease(u / .3 - 1)) + callout("4", 80, 30, ease(u / .3 - 1.5));
};
