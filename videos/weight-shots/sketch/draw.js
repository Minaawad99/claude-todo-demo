/* «حقن التخسيس» — the episode's own drawings (sketch style). Self-contained SVG builders used by shots.js and review.html.
   Real anatomy after the pictures listed in ../refs/SOURCES.md:
   - the stomach (oesophagus, cardia, fundus, body, antrum, pyloric sphincter, duodenal bulb, rugae) after SEER «Illu stomach2»;
   - the pancreas (head in the C of the duodenum, neck, body, tail, the main duct) after Blausen 0699, islets of Langerhans
     after histology plates (pale round islands among the acini);
   - the brain in mid-sagittal section (cerebrum, corpus callosum, thalamus, hypothalamus, infundibulum and pituitary, optic
     chiasm, midbrain, pons, medulla, cerebellum) after BodyParts3D «Hypothalamus image» and Gray's mid-sagittal plate;
   - the small-intestine wall: villi with their surface cells and capillary loop, and an enteroendocrine L-cell (flask
     shaped, its tip open to the gut, its granules at the base next to the capillary) after «Intestinal villus simplified»
     and enteroendocrine-cell diagrams;
   - white fat: polygonal adipocytes, one big lipid droplet each, the nucleus pressed to the rim (histology);
   - GLP-1 as a 30-bead peptide chain; semaglutide with bead 2 changed (Aib) and a fatty-acid tail that holds albumin;
   - the Gila monster (Heloderma suspectum) from the Commons photograph: beaded black skin with orange-pink bands.
   Drawn in the «طب إزاي؟» hand: flat fills, ink outlines, organ walls as a double line (v17). Panel units 640 × 786. */
var GW = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0", CREAM = "#fbf8f1";
var WALL = "#d98c78", WALLD = "#c27463", CAV = "#f3c7b8", MUC = "#e9a896", CHYME = "#d9b77a", CHYMED = "#b9965a",
    PANC = "#ecd08a", PANCD = "#d4b468", ISLET = "#f6ead0", BLOOD = "#b8463a", BLOODL = "#d9675a", PLASMA = "#f2d6c8",
    GREYM = "#e6c5ae", WHITEM = "#f4e4d2", SKIN = "#e0a98a", SKIND = "#c07f62", FATC = "#f3e6b8", FATD = "#dcc98e",
    MUSC = "#b45a4a", MUSCL = "#d07e6c", STEEL = "#c9d3da", STEELD = "#9aa9b4";
var C = { INK: INK, ORANGE: ORANGE, BLUE: BLUE, OLIVE: OLIVE, WALL: WALL, CAV: CAV, CHYME: CHYME, PANC: PANC, BLOOD: BLOOD, FATC: FATC, MUSC: MUSC, SKIN: SKIN };
function f(n) { return (+n).toFixed(1); }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function now() { return (typeof window !== 'undefined' && window.__t) || 0; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
var CID = 0;
// Catmull-Rom through points → cubic Béziers (closed or open)
function cr(pts, closed) {
  var n = pts.length, d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  var get = function (i) { return closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; };
  for (var i = 0; i < (closed ? n : n - 1); i++) {
    var p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
  }
  return d + (closed ? " Z" : "");
}
function tr(pts, x, y, s) { return pts.map(function (p) { return [x + p[0] * s, y + p[1] * s]; }); }
function blob(pts, fill, sw, ex) { return '<path d="' + cr(pts, true) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function line(pts, col, w, ex) { return '<path d="' + cr(pts, false) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function seg(pts, col, w, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function circ(x, y, r, fill, sw, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + (col || INK) + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function ell(x, y, rx, ry, fill, sw, rot) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"' + (rot ? ' transform="rotate(' + f(rot) + ' ' + f(x) + ' ' + f(y) + ')"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function txt(t, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px \'Noto Sans Arabic\';fill:' + (col || INK) + '">' + t + '</text>'; }
function G(trn, inner, op) { return '<g' + (trn ? ' transform="' + trn + '"' : "") + (op != null && op < 1 ? ' opacity="' + Math.max(0, op).toFixed(3) + '"' : "") + '>' + inner + '</g>'; }
// a leader-line tag: dot, line, word in a coloured chip
function tag(x, y, t, col, side, dy) {
  col = col || INK; side = side || 1; var tx = x + side * 64, ty = y - (dy == null ? 34 : dy), w = t.length * 12 + 22;
  return circ(x, y, 3.5, col, 0) + seg([[x, y], [tx, ty]], col, 1.6) +
    '<rect x="' + f(side > 0 ? tx : tx - w) + '" y="' + f(ty - 17) + '" width="' + w + '" height="32" rx="7" fill="' + col + '"/>' + txt(t, side > 0 ? tx + w / 2 : tx - w / 2, ty + 6, 18, CREAM);
}
// along a polyline: point at fraction u (by length)
function along(pts, u) {
  var L = [0]; for (var i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  var d = clamp(u) * L[L.length - 1]; for (var j = 1; j < pts.length; j++) if (d <= L[j]) { var k = (d - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]); return [lerp(pts[j - 1][0], pts[j][0], k), lerp(pts[j - 1][1], pts[j][1], k)]; }
  return pts[pts.length - 1];
}
// a hollow tube (oesophagus, duodenum, a vessel): ink rim, wall, lumen, as three strokes along one centre line
function tube(pts, w, wall, lumen, smooth) {
  var d = smooth === false ? 'M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") : cr(pts, false);
  var s = function (col, ww) { return '<path d="' + d + '" stroke="' + col + '" stroke-width="' + f(ww) + '" fill="none" stroke-linecap="butt" stroke-linejoin="round"/>'; };
  return { outer: s(INK, w + 4) + s(wall || WALL, w), inner: s(INK, w - 2 * w * .22 + 2) + s(lumen || CAV, w - 2 * w * .22) };
}

// ── THE STOMACH, front view, cut open (patient's left on the viewer's right, as in the anatomy plate) ──
// o.fill 0..1 how full (chyme level) · o.pyl 0..1 the pyloric sphincter squeezed shut · o.flow 0..1 chyme leaving to the duodenum
// o.labels: name the parts · o.slow: the outflow drips slowly (the drug)
var ST_OUT = [[20, -118], [44, -150], [92, -170], [142, -152], [170, -104], [176, -40], [164, 30], [128, 96], [70, 142], [2, 160], [-62, 150], [-112, 118], [-146, 80], [-160, 54],
  [-150, 30], [-120, 40], [-78, 46], [-44, 30], [-22, -8], [-10, -60], [-4, -100]];
function stomach(cx, cy, s, o) {
  o = o || {}; var t = now(), id = "st" + (++CID), out = tr(ST_OUT, cx, cy, s), g = "";
  var wall = 15 * s, oes = tr([[30, -260], [26, -190], [12, -128], [8, -100]], cx, cy, s), duo = tr([[-150, 42], [-188, 40], [-222, 34], [-252, 50], [-262, 100], [-258, 170]], cx, cy, s);
  var T1 = tube(oes, 40 * s, WALL, CAV), T2 = tube(duo, 46 * s, WALL, CAV);
  g += T1.outer + T2.outer;
  g += '<clipPath id="' + id + '"><path d="' + cr(out, true) + '"/></clipPath>';
  g += '<path d="' + cr(out, true) + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="4"/>';
  g += '<path d="' + cr(out, true) + '" fill="' + CAV + '"/>';
  // the chyme inside, up to a level, with bits of food
  var lv = lerp(cy + 160 * s, cy - 110 * s, clamp(o.fill == null ? .5 : o.fill)), wob = 3 * s * Math.sin(t * 1.6);
  var food = '<path d="M' + f(cx - 220 * s) + ' ' + f(lv + wob) + ' Q' + f(cx - 40 * s) + ' ' + f(lv - wob * 2) + ' ' + f(cx + 200 * s) + ' ' + f(lv + wob) + ' V' + f(cy + 220 * s) + ' H' + f(cx - 220 * s) + ' Z" fill="' + CHYME + '"/>';
  for (var i = 0; i < 26; i++) { var px = cx + (-150 + rnd(i) * 320) * s, py = lv + (8 + rnd(i + 40) * 170) * s + 3 * s * Math.sin(t * 1.3 + i); food += circ(px, py, (3 + rnd(i + 7) * 4) * s, i % 3 ? CHYMED : "#c9a46a", 1 * s); }
  g += '<g clip-path="url(#' + id + ')">' + food;
  // rugae: the folds of the lining, along the long axis
  for (var r = 0; r < 7; r++) { var rp = []; for (var q = 0; q <= 6; q++) { var u = q / 6, a = Math.PI * (.95 - .55 * u); rp.push([cx + (40 - 120 * u + 60 * Math.cos(a) * (r / 7)) * s, cy + (-110 + 30 * r + 200 * u * (1 - u) + 6 * Math.sin(q * 2.3 + r)) * s]); } g += line(rp, MUC, 3 * s); }
  // the wall: an inner band, the ink line inside it, so the organ reads as cut open (v17)
  g += '<path d="' + cr(out, true) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2 * wall + 2.4) + '"/><path d="' + cr(out, true) + '" fill="none" stroke="' + WALL + '" stroke-width="' + f(2 * wall) + '"/>';
  g += '<path d="' + cr(out, true) + '" fill="none" stroke="' + WALLD + '" stroke-width="' + f(wall * .7) + '"/></g>';
  // the tube lumens opening into it
  g += T1.inner + T2.inner;
  // chyme leaving through the pylorus into the duodenum: drips that run along it
  var flow = o.flow == null ? 0 : o.flow, rate = o.slow ? .35 : 1.2, n = o.slow ? 2 : 6;
  if (flow > 0) for (var j = 0; j < n; j++) { var uu = (t * rate * .25 + j / n) % 1, p = along(duo, uu); g += G("", circ(p[0], p[1], 7 * s, CHYME, 1.4 * s), flow * Math.min(1, uu * 6, (1 - uu) * 6)); }
  // the pyloric sphincter: a thick muscle ring, the two halves close to squeeze the outlet
  var pyl = clamp(o.pyl || 0), py0 = tr([[-153, 40]], cx, cy, s)[0], gap = (12 - 9 * pyl) * s;
  g += ell(py0[0], py0[1] - gap - 10 * s, 13 * s, 10 * s, o.pylCol || "#c0604e", 2) + ell(py0[0], py0[1] + gap + 10 * s, 13 * s, 10 * s, o.pylCol || "#c0604e", 2);
  if (o.labels) {
    var L = function (pp, t2, col, side, dy) { var p2 = tr([pp], cx, cy, s)[0]; return tag(p2[0], p2[1], t2, col, side, dy); };
    g += L([28, -220], "المريء", INK, 1) + L([120, -140], "المعدة", OLIVE, 1) + L([-153, 40], "البوّابة", ORANGE, -1, -60) + L([-256, 130], "المصارين", INK, 1, 0);
  }
  return g;
}

// ── THE PANCREAS and the duodenum's C, front view ──
// o.islets 0..1 the islets light · o.insulin 0..1 insulin dots leave to the vessel · o.sugar 0..1 sugar dots in the blood
function pancreas(cx, cy, s, o) {
  o = o || {}; var t = now(), g = "";
  var duo = tr([[-150, -120], [-196, -110], [-226, -60], [-232, 10], [-214, 80], [-160, 120], [-90, 128], [-30, 112]], cx, cy, s);
  var D = tube(duo, 54 * s, "#d98c8c", "#f0c0bc"); g += D.outer + D.inner;
  // lobulated outline: head in the C, neck, body, tail rising to the spleen
  var base = [[-180, -50], [-150, -84], [-100, -78], [-40, -70], [30, -88], [100, -104], [170, -122], [214, -116], [226, -92], [200, -64], [140, -40], [70, -24], [0, -14], [-60, 10], [-90, 60], [-130, 84], [-176, 64], [-196, 10]];
  var lob = []; for (var i = 0; i < base.length; i++) { var a = base[i], b = base[(i + 1) % base.length]; lob.push(a); var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], nx = (b[1] - a[1]), ny = -(b[0] - a[0]), nl = Math.hypot(nx, ny) || 1; lob.push([m[0] + nx / nl * 7, m[1] + ny / nl * 7]); }
  g += blob(tr(lob, cx, cy, s), PANC, 2.4);
  // lobule lines and the main duct running from the tail to the head
  for (var k = 0; k < 9; k++) { var lx = cx + (-150 + k * 42) * s, ly = cy + (-40 - k * 7 + (k < 3 ? 30 : 0)) * s; g += line([[lx - 10 * s, ly - 18 * s], [lx, ly], [lx - 6 * s, ly + 18 * s]], PANCD, 2 * s); }
  var duct = tr([[210, -100], [140, -76], [60, -58], [-20, -42], [-100, -20], [-160, 10], [-200, 30]], cx, cy, s);
  g += line(duct, "#c7a253", 5 * s) + line(duct, "#f1dc9e", 2.4 * s);
  // islets of Langerhans: pale round islands with beta-cell dots
  var isl = [[-120, 20], [-40, -40], [60, -60], [150, -96]], k2 = clamp(o.islets || 0);
  isl.forEach(function (p, j) { var q = tr([p], cx, cy, s)[0], r = (11 + 2 * Math.sin(t * 2 + j) * k2) * s; g += circ(q[0], q[1], r, k2 ? lerpCol(ISLET, "#f4c27a", k2) : ISLET, 1.6 * s);
    for (var d = 0; d < 5; d++) g += circ(q[0] + Math.cos(d * 1.3 + j) * r * .5, q[1] + Math.sin(d * 1.3 + j) * r * .5, 1.8 * s, k2 ? ORANGE : PANCD, 0); });
  // a vein above it, sugar and insulin in the blood
  var vy = cy - 190 * s; g += vessel(cx - 260 * s, cx + 260 * s, vy, 44 * s, t, { sugar: o.sugar || 0, insulin: o.insulin || 0 });
  if (o.insulin) isl.forEach(function (p, j) { var q = tr([p], cx, cy, s)[0]; for (var m2 = 0; m2 < 3; m2++) { var u = (t * .5 + m2 / 3 + j * .17) % 1; g += G("", circ(q[0] + 6 * s * Math.sin(u * 7 + j), lerp(q[1] - 12 * s, vy + 14 * s, u), 4.5 * s, "#e8b24a", 1.2 * s), o.insulin * Math.min(1, (1 - u) * 5, u * 8)); } });
  if (o.labels) { var q0 = tr([[60, -40]], cx, cy, s)[0], q1 = tr([[-230, 40]], cx, cy, s)[0], q2 = tr([[-40, -40]], cx, cy, s)[0]; g += tag(q0[0], q0[1], "البنكرياس", OLIVE, 1, -90) + tag(q1[0], q1[1], "الاتناشر", INK, 1, -150); if (o.labels > 1) g += tag(q2[0], q2[1], "جزر الإنسولين", ORANGE, -1, -60); }
  return g;
}
function lerpCol(a, b, k) { var p = function (c, i) { return parseInt(c.substr(1 + 2 * i, 2), 16); }, r = ""; for (var i = 0; i < 3; i++) r += ("0" + Math.round(lerp(p(a, i), p(b, i), clamp(k))).toString(16)).slice(-2); return "#" + r; }

// ── A BLOOD VESSEL, cut along its length: wall, plasma, red cells flowing, and what rides in the blood ──
// o.sugar, o.insulin 0..1 · o.msg: [{u: 0..1 position, kind: "glp" | "sema" | "cut"}] messages riding · o.speed
function vessel(x1, x2, y, h, t, o) {
  o = o || {}; var g = "", sp = o.speed || 60, w = x2 - x1;
  g += '<rect x="' + f(x1) + '" y="' + f(y - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + PLASMA + '"/>';
  g += seg([[x1, y - h / 2], [x2, y - h / 2]], INK, 2) + seg([[x1, y + h / 2], [x2, y + h / 2]], INK, 2);
  g += seg([[x1, y - h / 2 + 5], [x2, y - h / 2 + 5]], BLOODL, 3) + seg([[x1, y + h / 2 - 5], [x2, y + h / 2 - 5]], BLOODL, 3);
  var nC = Math.round(w / 95); for (var i = 0; i < nC; i++) { var x = x1 + ((i * 95 + t * sp + rnd(i) * 30) % w), yy = y + (rnd(i + 3) - .5) * h * .45; g += ell(x, yy, Math.min(h * .22, 26), Math.min(h * .1, 11), BLOOD, 1.2, 20 * (rnd(i + 5) - .5)) + ell(x, yy, Math.min(h * .1, 12), Math.min(h * .035, 4), "#9c3a30", 0, 20 * (rnd(i + 5) - .5)); }
  if (o.sugar) for (var j = 0; j < 8; j++) { var xs = x1 + ((j * w / 8 + t * sp * .8) % w); g += G("", '<rect x="' + f(xs - 4) + '" y="' + f(y - 4 + (rnd(j + 9) - .5) * h * .5) + '" width="8" height="8" fill="#fbf8f1" stroke="' + INK + '" stroke-width="1.2" transform="rotate(45 ' + f(xs) + ' ' + f(y) + ')"/>', o.sugar); }
  if (o.insulin) for (var m = 0; m < 6; m++) { var xi = x1 + ((m * w / 6 + 20 + t * sp * .8) % w); g += G("", circ(xi, y + (rnd(m + 19) - .5) * h * .5, 4.5, "#e8b24a", 1.2), o.insulin); }
  return g;
}

// ── GLP-1: the message. A 30-bead chain (the peptide); semaglutide: bead 2 swapped, a fatty-acid tail and albumin ──
// o.kind "glp" | "sema" · o.cut 0..1 (DPP-4 snips the first two beads off, they drift away) · o.glow
function glp(x, y, s, o) {
  o = o || {}; var t = now(), g = "", pts = [];
  for (var i = 0; i < 30; i++) { var a = i * .62 + t * .6, r = 4 * s; pts.push([x + (-58 + i * 4) * s, y + Math.sin(a) * 6 * s + (i > 14 ? (i - 14) * 0 : 0)]); }
  var cut = clamp(o.cut || 0), sema = o.kind === "sema";
  g += seg(pts.slice(cut > 0 ? 2 : 0), INK, 1.6 * s);
  if (sema) {   // the fatty-acid tail on bead 20 (Lys26), and albumin riding on it
    var b = pts[19], tail = [b]; for (var j = 1; j <= 8; j++) tail.push([b[0] + j * 4 * s, b[1] - 10 * s - j * 3.4 * s + (j % 2 ? 3 * s : -3 * s)]);
    g += seg(tail, "#7a6a3a", 2.4 * s);
    if (o.alb !== false) { var e = tail[tail.length - 1]; g += blob(tr([[-20, -6], [-8, -20], [12, -22], [26, -10], [24, 10], [6, 20], [-14, 16]], e[0] + 16 * s, e[1] - 12 * s, s), "#d7dcc6", 1.8 * s) + txt("ألبيومين", e[0] + 16 * s, e[1] - 8 * s, 8 * s, OLIVE, 800); }
  }
  pts.forEach(function (p, k) {
    var off = k < 2 && cut > 0 ? [-cut * 30 * s - k * 6 * s, -cut * 26 * s + Math.sin(t * 3 + k) * 2 * s] : [0, 0], col = k === 1 && sema ? BLUE : o.glow ? lerpCol("#f2b24a", ORANGE, o.glow) : "#f2b24a";
    g += G("", circ(p[0] + off[0], p[1] + off[1], 5 * s, col, 1.5 * s), k < 2 && cut > 0 ? 1 - cut * .4 : 1);
  });
  return g;
}
// DPP-4, the enzyme that cuts the message: a lumpy protein with a cleft, opening and closing
function dpp4(x, y, s, k) {
  var t = now(), bite = .5 + .5 * Math.sin(t * 5) * (k == null ? 1 : k), g = "";
  g += blob(tr([[-40, -30], [-10, -44], [26, -40], [44, -18], [46, 14], [28, 40], [-6, 46], [-36, 32], [-48, 6]], x, y, s), "#a9b48a", 2);
  g += '<path d="M' + f(x + 30 * s) + ' ' + f(y - 4 * s) + ' L' + f(x - 6 * s) + ' ' + f(y - 2 * s) + ' L' + f(x + 30 * s) + ' ' + f(y + (6 + 18 * bite) * s) + ' Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 6; i++) g += circ(x + (-30 + rnd(i) * 40) * s, y + (-28 + rnd(i + 5) * 60) * s, 2.2 * s, "#8a9670", 0);
  return g;
}

// ── THE BRAIN in a head, mid-sagittal (face to the right) ──
// o.hypo 0..1 the hypothalamus lit · o.hunger, o.full 0..1 the two centres glowing · o.zoomed: draw the centres larger
// o.hits 0..1: the message arriving from the blood
function brainHead(cx, cy, s, o) {
  o = o || {}; var t = now(), g = "", P = function (pts) { return tr(pts, cx, cy, s); };
  // head and neck in profile
  g += blob(P([[-128, -40], [-120, -112], [-70, -160], [10, -172], [86, -148], [128, -92], [138, -30], [150, 0], [168, 34], [150, 44], [156, 66], [146, 82], [150, 104], [130, 128], [96, 132], [80, 160], [70, 240], [-70, 240], [-74, 150], [-104, 110], [-130, 40]]), SKIN, 2.4);
  g += blob(P([[-38, 20], [-30, 2], [-14, 8], [-12, 34], [-24, 52], [-36, 44]]), SKIND, 1.6);   // the ear
  // the skull cut: bone band, then the brain
  g += blob(P([[-116, -40], [-108, -104], [-64, -148], [10, -158], [80, -136], [116, -84], [124, -30], [110, 6], [70, 18], [10, 26], [-40, 30], [-96, 28], [-118, 4]]), "#efe3cc", 2);
  var CER = P([[-104, -30], [-98, -94], [-58, -134], [10, -144], [72, -124], [106, -78], [112, -30], [96, 0], [62, 6], [30, -4], [0, 2], [-30, 4], [-70, 6], [-100, -4]]);
  g += blob(CER, GREYM, 2.2);
  // gyri: sulci as wandering lines on the cut face (the medial surface)
  var sul = [[[-80, -60], [-60, -86], [-40, -70], [-20, -100]], [[-20, -120], [0, -100], [20, -122], [40, -104]], [[50, -112], [64, -90], [86, -96], [94, -70]], [[-90, -30], [-70, -40], [-56, -26]], [[70, -40], [88, -50], [98, -30]], [[-6, -78], [14, -84], [34, -72], [50, -84]]];
  sul.forEach(function (q) { g += line(P(q), "#c9a088", 2.4 * s); });
  // corpus callosum: the white arch
  g += line(P([[-58, -42], [-40, -58], [0, -66], [40, -62], [62, -46], [66, -30], [56, -26]]), INK, 16 * s) + line(P([[-58, -42], [-40, -58], [0, -66], [40, -62], [62, -46], [66, -30], [56, -26]]), WHITEM, 12 * s);
  // thalamus
  g += ell(cx - 4 * s, cy - 24 * s, 30 * s, 18 * s, "#e9d2b8", 2);
  // brainstem: midbrain, pons, medulla, down the neck
  g += blob(P([[-24, -12], [8, -10], [18, 10], [26, 34], [20, 58], [8, 74], [6, 150], [-22, 150], [-24, 76], [-30, 40], [-34, 10]]), "#e9d2b8", 2);
  // cerebellum with its folia, behind the brainstem
  g += blob(P([[-104, 6], [-80, -6], [-44, 0], [-30, 24], [-40, 52], [-70, 62], [-100, 46], [-112, 24]]), "#ddb79c", 2);
  for (var fl = 0; fl < 4; fl++) g += line(P([[-100, 10 + fl * 12], [-74, 4 + fl * 12], [-44, 14 + fl * 10]]), "#b78d72", 1.6 * s);
  // optic chiasm, infundibulum and the pituitary under the hypothalamus
  g += ell(cx + 52 * s, cy + 6 * s, 9 * s, 5 * s, "#f4ecd8", 1.6);
  g += line(P([[34, 6], [36, 20], [38, 30]]), INK, 5 * s) + line(P([[34, 6], [36, 20], [38, 30]]), "#e9d2b8", 3 * s);
  g += ell(cx + 40 * s, cy + 36 * s, 10 * s, 7 * s, "#e3b9a0", 1.8);
  // the hypothalamus: below and in front of the thalamus, the floor of the third ventricle
  var hk = clamp(o.hypo || 0);
  g += blob(P([[14, -10], [32, -12], [44, -2], [40, 8], [28, 10], [14, 4]]), hk ? lerpCol("#e9d2b8", "#e8a66c", hk) : "#e9d2b8", 2);
  if (hk) g += circ(cx + 29 * s, cy - 1 * s, (16 + 3 * Math.sin(t * 3)) * s, "none", 2.5 * s * hk, ORANGE);
  // the two centres (arcuate nucleus groups): hunger (AgRP/NPY) and fullness (POMC)
  if (o.hunger != null || o.full != null) {
    var hu = clamp(o.hunger || 0), fu = clamp(o.full || 0), r = (o.zoomed ? 5.5 : 4) * s;
    g += circ(cx + 22 * s, cy + 2 * s, r * (1 + .25 * hu * Math.sin(t * 6)), hu ? lerpCol(PAPER, ORANGE, hu) : PAPER, 1.4 * s);
    g += circ(cx + 35 * s, cy + 2 * s, r * (1 + .25 * fu * Math.sin(t * 4)), fu ? lerpCol(PAPER, "#5e8a4a", fu) : PAPER, 1.4 * s);
  }
  if (o.hits) for (var m = 0; m < 4; m++) { var u = (t * .45 + m / 4) % 1, p = along(P([[8, 150], [4, 80], [16, 30], [30, 4]]), u); g += G("", circ(p[0], p[1], 3.4 * s, ORANGE, 1 * s), o.hits * Math.min(1, (1 - u) * 6, u * 6)); }
  return g;
}

// ── THE GUT WALL: villi of the small intestine, one L-cell, a capillary at the base ──
// o.food 0..1 food in the lumen · o.lcell 0..1 the L-cell lit · o.release 0..1 GLP-1 dots go to the capillary · o.labels
function villi(cx, cy, s, o) {
  o = o || {}; var t = now(), g = "", W = 560 * s, x0 = cx - W / 2, base = cy + 130 * s;
  // the lumen, with food passing
  if (o.food) for (var i = 0; i < 9; i++) { var fx = x0 + ((i * 70 + t * 30) % W), fy = cy - 190 * s + rnd(i) * 70 * s; g += G("", blob(tr([[-12, -6], [0, -12], [14, -6], [12, 8], [-4, 12], [-14, 6]], fx, fy, s * (.8 + rnd(i + 3) * .6)), i % 2 ? CHYME : "#c9a46a", 1.4), o.food); }
  // the wall band under the villi (submucosa, muscle)
  g += '<rect x="' + f(x0) + '" y="' + f(base) + '" width="' + f(W) + '" height="' + f(110 * s) + '" fill="' + WALL + '" stroke="' + INK + '" stroke-width="2"/>';
  g += seg([[x0, base + 60 * s], [x0 + W, base + 60 * s]], WALLD, 3 * s);
  for (var mi = 0; mi < 16; mi++) g += seg([[x0 + (mi + .5) * W / 16 - 8 * s, base + 72 * s], [x0 + (mi + .5) * W / 16 + 8 * s, base + 100 * s]], WALLD, 2 * s);
  // the capillary running along the base, blood flowing; GLP-1 rides away in it
  var vy = base + 30 * s; g += vessel(x0, x0 + W, vy, 30 * s, t, {});
  var nV = 4, vw = W / nV;
  for (var v = 0; v < nV; v++) {
    var vx = x0 + vw * (v + .5), hh = 250 * s, ww = vw * .36;
    var outl = [[vx - ww, base], [vx - ww * .96, base - hh * .55], [vx - ww * .7, base - hh * .9], [vx, base - hh], [vx + ww * .7, base - hh * .9], [vx + ww * .96, base - hh * .55], [vx + ww, base]];
    g += '<path d="' + cr(outl, false) + ' Z" fill="' + CAV + '" stroke="' + INK + '" stroke-width="2"/>';
    // the surface layer: a row of tall cells drawn as ticks (as the reference)
    var inner = outl.map(function (p) { return [vx + (p[0] - vx) * .78, base - (base - p[1]) * .9]; });
    g += '<path d="' + cr(inner, false) + '" fill="none" stroke="' + MUC + '" stroke-width="' + f(4 * s) + '"/>';
    for (var k = 1; k < 24; k++) { var u = k / 24, a = along(outl, u), b = along(inner, u); g += seg([a, b], "#c98a7a", 1.2 * s); }
    // the capillary loop inside the villus
    var cap = [[vx - ww * .45, base + 10 * s], [vx - ww * .45, base - hh * .55], [vx - ww * .2, base - hh * .8], [vx + ww * .2, base - hh * .8], [vx + ww * .45, base - hh * .55], [vx + ww * .45, base + 10 * s]];
    g += line(cap, INK, 9 * s) + line(cap, BLOODL, 6 * s);
    // the L-cell: in the second villus, a flask cell with its tip open to the gut, its granules at the base
    if (v === 1) {
      var lk = clamp(o.lcell || 0), lp = along(outl, .33), lq = along(inner, .33), ln = [lq[0] - lp[0], lq[1] - lp[1]];
      var cxl = lp[0] + ln[0] * .55, cyl = lp[1] + ln[1] * .55;
      g += blob(tr([[-4, -28], [4, -28], [16, -2], [14, 22], [-14, 22], [-16, -2]], cxl, cyl, s * 1.15), lk ? lerpCol("#f4d8a4", "#f0b25a", lk) : "#f4d8a4", 2);
      for (var gr = 0; gr < 8; gr++) g += circ(cxl + (-9 + rnd(gr) * 18) * s, cyl + (6 + rnd(gr + 4) * 14) * s, 2.6 * s, lk ? ORANGE : "#c8a070", 0);
      if (o.labels) g += tag(cxl - 10 * s, cyl, "خلية L", ORANGE, -1, 80);
      // released GLP-1 dots: out of the base, down the capillary, into the vessel, away to the right
      if (o.release) for (var m = 0; m < 7; m++) { var uu = (t * .35 + m / 7) % 1, path = [[cxl, cyl + 10 * s], [vx - ww * .45, base - hh * .2], [vx - ww * .45, vy], [x0 + W, vy]], q = along(path, uu); g += G("", circ(q[0], q[1], 5 * s, ORANGE, 1.4 * s), o.release * Math.min(1, uu * 10, (1 - uu) * 8)); }
    }
  }
  if (o.labels) g += tag(x0 + vw * 3.5, base - 200 * s, "خملة", OLIVE, -1, 40) + tag(x0 + W - 40 * s, vy, "دم", BLOOD, -1, -60);
  return g;
}

// ── WHITE FAT: adipocytes, one big droplet each, nucleus at the rim; o.shrink 0..1 they empty; o.out 0..1 fatty acids leave ──
function fat(cx, cy, s, o) {
  o = o || {}; var t = now(), g = "", sh = clamp(o.shrink || 0), cells = [];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) cells.push([(c - 1.5) * 92 + (r % 2 ? 46 : 0) + (rnd(r * 4 + c) - .5) * 14, (r - 1.5) * 80 + (rnd(r * 4 + c + 50) - .5) * 12]);
  g += '<rect x="' + f(cx - 230 * s) + '" y="' + f(cy - 180 * s) + '" width="' + f(460 * s) + '" height="' + f(360 * s) + '" fill="#f1dfd2" stroke="none"/>';
  cells.forEach(function (p, i) {
    var rr = (50 - 18 * sh) * s * (1 + .02 * Math.sin(t * 1.4 + i)), x = cx + p[0] * s, y = cy + p[1] * s, poly = [];
    for (var a = 0; a < 7; a++) { var an = a / 7 * Math.PI * 2 + i, rj = rr * (1 + (rnd(i * 7 + a) - .5) * .18); poly.push([x + Math.cos(an) * rj, y + Math.sin(an) * rj]); }
    g += blob(poly, "#f6efd9", 2) + blob(poly.map(function (q) { return [x + (q[0] - x) * .84, y + (q[1] - y) * .84]; }), lerpCol(FATC, "#f6efd9", sh * .6), 1.2);
    var na = i * 1.7; g += ell(x + Math.cos(na) * rr * .9, y + Math.sin(na) * rr * .9, 9 * s, 4.5 * s, "#8a6a8a", 1.2, na * 57.3 + 90);
  });
  if (o.out) for (var m = 0; m < 12; m++) { var u = (t * .4 + m / 12) % 1, x2 = cx + (-200 + (m * 37) % 400) * s, y2 = lerp(cy + (rnd(m) - .5) * 200 * s, cy - 260 * s, u); g += G("", seg([[x2 - 6 * s, y2], [x2, y2 - 4 * s], [x2 + 6 * s, y2], [x2 + 12 * s, y2 - 4 * s]], "#b3903a", 2.6 * s), o.out * Math.min(1, u * 6, (1 - u) * 4)); }
  return g;
}
// ── MUSCLE: a bundle cut across (fascicles) and along (striations) ──
function muscle(cx, cy, s, o) {
  o = o || {}; var g = "", P = function (pts) { return tr(pts, cx, cy, s); };
  g += line(P([[-250, 0], [-170, 0]]), INK, 20 * s) + line(P([[-250, 0], [-170, 0]]), "#efe6d4", 15 * s);   // tendon
  var belly = P([[-180, -10], [-120, -52], [-20, -70], [80, -60], [130, -48], [130, 48], [80, 60], [-20, 70], [-120, 52], [-180, 10]]);
  g += blob(belly, MUSC, 2.6);
  for (var i = -4; i <= 4; i++) g += line(P([[-170, i * 2], [-110, i * 10], [-20, i * 15], [80, i * 12.5], [128, i * 10.5]]), "#9a4636", 1.6 * s);
  g += ell(cx + 130 * s, cy, 26 * s, 50 * s, MUSCL, 2.6);   // the cut end: fascicles in their sheaths
  for (var k = 0; k < 10; k++) { var a = k * 2.4, r = (k < 1 ? 0 : 12 + (k % 3) * 11) * s; g += ell(cx + 130 * s + Math.cos(a) * r * .45, cy + Math.sin(a) * r, 7 * s, 9 * s, "#e49a88", 1.2); }
  return g;
}
// ── PROPS ──
// a plate from the three-quarter view; k = how much food is left (0..1)
function plate(x, y, s, k) {
  var g = ell(x, y + 6 * s, 112 * s, 40 * s, "#d9cdb4", 2) + ell(x, y, 110 * s, 38 * s, CREAM, 2.2) + ell(x, y, 80 * s, 26 * s, "#f3ede0", 1.4);
  k = clamp(k == null ? 1 : k); if (k <= 0) return g;
  var rice = [], n = Math.round(22 * k);
  g += blob(tr([[-60, 0], [-50, -18], [-20, -26], [10, -20], [20, -4], [0, 10], [-40, 12]], x - 12 * s * (1 - k), y, s * (.5 + .5 * k)), "#f4ecd0", 1.8);
  for (var i = 0; i < n; i++) rice.push(ell(x + (-60 + rnd(i) * 70) * s * (.5 + .5 * k), y + (-18 + rnd(i + 30) * 26) * s * (.5 + .5 * k), 4 * s, 1.6 * s, "#fbf6e6", .8, rnd(i + 7) * 180));
  g += rice.join("");
  if (k > .35) g += blob(tr([[8, -14], [40, -24], [66, -14], [64, 6], [36, 14], [12, 6]], x, y, s), "#c7834e", 1.8) + line(tr([[20, -10], [40, -16], [58, -10]], x, y, s), "#a5653a", 2 * s);
  if (k > .6) g += circ(x - 6 * s, y - 24 * s, 9 * s, "#6f8a3a", 1.4) + circ(x + 8 * s, y - 28 * s, 7 * s, "#86a04a", 1.4);
  return g;
}
// a sink in section: basin, water at o.level, a drain narrowed by o.narrow (0 wide .. 1 narrow), drops falling
function sink(x, y, s, o) {
  o = o || {}; var t = now(), g = "", lv = clamp(o.level == null ? .6 : o.level), nw = lerp(26, 6, clamp(o.narrow || 0)) * s;
  var basin = tr([[-150, -80], [150, -80], [130, 40], [90, 80], [20, 96], [-20, 96], [-90, 80], [-130, 40]], x, y, s);
  g += '<path d="M' + basin.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="#e5ebee" stroke="' + INK + '" stroke-width="3"/>';
  var wy = lerp(y + 90 * s, y - 70 * s, lv);
  g += '<clipPath id="sk' + (++CID) + '"><path d="M' + basin.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z"/></clipPath><g clip-path="url(#sk' + CID + ')"><rect x="' + f(x - 160 * s) + '" y="' + f(wy + 2 * Math.sin(t * 2) * s) + '" width="' + f(320 * s) + '" height="' + f(200 * s) + '" fill="#8fb2c6"/>' + seg([[x - 160 * s, wy], [x + 160 * s, wy]], "#cfe0ea", 3 * s) + '</g>';
  g += seg([[x - 170 * s, y - 80 * s], [x + 170 * s, y - 80 * s]], INK, 6 * s);
  g += '<rect x="' + f(x - nw / 2) + '" y="' + f(y + 96 * s) + '" width="' + f(nw) + '" height="' + f(90 * s) + '" fill="#8fb2c6" stroke="' + INK + '" stroke-width="2"/>';
  g += '<rect x="' + f(x - nw / 2 - 10 * s) + '" y="' + f(y + 96 * s) + '" width="' + f(10 * s) + '" height="' + f(90 * s) + '" fill="#9aa9b4" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(x + nw / 2) + '" y="' + f(y + 96 * s) + '" width="' + f(10 * s) + '" height="' + f(90 * s) + '" fill="#9aa9b4" stroke="' + INK + '" stroke-width="2"/>';
  var nd = o.narrow > .5 ? 2 : 5; for (var i = 0; i < nd; i++) { var u = (t * (o.narrow > .5 ? .5 : 1.4) + i / nd) % 1; g += G("", ell(x, y + (190 + u * 70) * s, 4 * s, 7 * s, "#6f97ad", 1.2), Math.min(1, (1 - u) * 4)); }
  return g;
}
// a pen injector (generic, no brand): needle, hub, glass window, barrel, dose window, the dose knob
function pen(x, y, ang, s, o) {
  o = o || {}; var g = "";
  g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + f(s) + ')">';
  g += seg([[0, 0], [-26, 0]], "#8a8f94", 2.2) + '<rect x="-38" y="-7" width="14" height="14" rx="3" fill="#eef1f2" stroke="' + INK + '" stroke-width="2"/>';
  g += '<rect x="-150" y="-15" width="114" height="30" rx="8" fill="#eef1f2" stroke="' + INK + '" stroke-width="2.2"/>';
  g += '<rect x="-112" y="-9" width="62" height="18" rx="4" fill="#dce9ef" stroke="' + INK + '" stroke-width="1.6"/><rect x="-104" y="-6" width="' + f(40 * (o.dose == null ? .8 : o.dose)) + '" height="12" rx="3" fill="#bcd3de"/>';
  g += '<rect x="-270" y="-17" width="124" height="34" rx="9" fill="' + (o.col || "#6d93b0") + '" stroke="' + INK + '" stroke-width="2.2"/>';
  g += '<rect x="-236" y="-9" width="22" height="18" rx="3" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="1.6"/>' + txt("1", -225, 5, 13, INK);
  g += '<rect x="-300" y="-14" width="32" height="28" rx="6" fill="#4d6c84" stroke="' + INK + '" stroke-width="2.2"/>';
  for (var i = 0; i < 4; i++) g += seg([[-294 + i * 7, -11], [-294 + i * 7, 11]], "#36506a", 1.6);
  return g + '</g>';
}
// a bathroom scale (top view) with a digital readout
function scale(x, y, s, num, col) {
  var g = '<rect x="' + f(x - 120 * s) + '" y="' + f(y - 40 * s) + '" width="' + f(240 * s) + '" height="' + f(80 * s) + '" rx="' + f(18 * s) + '" fill="#e9eef0" stroke="' + INK + '" stroke-width="2.4"/>';
  g += '<rect x="' + f(x - 120 * s) + '" y="' + f(y + 30 * s) + '" width="' + f(240 * s) + '" height="' + f(14 * s) + '" rx="' + f(7 * s) + '" fill="#c4ccd1" stroke="' + INK + '" stroke-width="2"/>';
  g += '<rect x="' + f(x - 46 * s) + '" y="' + f(y - 28 * s) + '" width="' + f(92 * s) + '" height="' + f(40 * s) + '" rx="' + f(6 * s) + '" fill="#2f3a3f" stroke="' + INK + '" stroke-width="2"/>';
  return g + '<text x="' + f(x) + '" y="' + f(y + 2 * s) + '" text-anchor="middle" style="font:800 ' + f(26 * s) + 'px \'Noto Serif\';fill:' + (col || "#9be08a") + ';direction:ltr">' + num + '</text>';
}
// a two-pan balance: tilt -1 (left down) .. 1 (right down). left and right: SVG drawn around (0,0) on each pan
function balance(x, y, s, tilt, left, right) {
  var a = tilt * 12 * Math.PI / 180, L = 170 * s, lx = x - Math.cos(a) * L, ly = y - Math.sin(a) * L, rx = x + Math.cos(a) * L, ry = y + Math.sin(a) * L, g = "";
  g += '<path d="M' + f(x - 70 * s) + ' ' + f(y + 300 * s) + ' H' + f(x + 70 * s) + ' L' + f(x + 20 * s) + ' ' + f(y + 270 * s) + ' H' + f(x - 20 * s) + ' Z" fill="#b8a07a" stroke="' + INK + '" stroke-width="2.4"/>';
  g += '<rect x="' + f(x - 8 * s) + '" y="' + f(y) + '" width="' + f(16 * s) + '" height="' + f(272 * s) + '" fill="#cdb791" stroke="' + INK + '" stroke-width="2.2"/>';
  g += seg([[lx, ly], [rx, ry]], INK, 10 * s) + seg([[lx, ly], [rx, ry]], "#cdb791", 6 * s) + circ(x, y, 12 * s, "#e0c98e", 2.2);
  [[lx, ly, left], [rx, ry, right]].forEach(function (p) {
    g += seg([[p[0], p[1]], [p[0] - 60 * s, p[1] + 110 * s]], INK, 1.6) + seg([[p[0], p[1]], [p[0] + 60 * s, p[1] + 110 * s]], INK, 1.6);
    g += '<path d="M' + f(p[0] - 80 * s) + ' ' + f(p[1] + 110 * s) + ' Q' + f(p[0]) + ' ' + f(p[1] + 150 * s) + ' ' + f(p[0] + 80 * s) + ' ' + f(p[1] + 110 * s) + ' Z" fill="#d8c29a" stroke="' + INK + '" stroke-width="2.2"/>';
    g += '<g transform="translate(' + f(p[0]) + ' ' + f(p[1] + 108 * s) + ')">' + (p[2] || "") + '</g>';
  });
  return g;
}
// a flame (energy spent), drawn around (0,0) bottom
function flame(s, t) { var w = 1 + .06 * Math.sin(t * 9); return '<path d="M0 0 C' + f(-34 * s) + ' ' + f(-6 * s) + ' ' + f(-36 * s * w) + ' ' + f(-50 * s) + ' ' + f(-6 * s) + ' ' + f(-96 * s * w) + ' C' + f(-2 * s) + ' ' + f(-60 * s) + ' ' + f(22 * s) + ' ' + f(-60 * s) + ' ' + f(14 * s) + ' ' + f(-82 * s * w) + ' C' + f(40 * s) + ' ' + f(-50 * s) + ' ' + f(34 * s) + ' ' + f(-6 * s) + ' 0 0 Z" fill="#e9874a" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 -6 C-14 -10 -14 -34 -2 -50 C4 -34 16 -30 10 -14 Z" transform="scale(' + f(s) + ')" fill="#f3c35a"/>'; }
// a graph of body weight (% change) over weeks: o.k1 the drug part drawn, o.k2 the stop part drawn (STEP-1 extension shape)
function graph(x, y, w, h, o) {
  o = o || {}; var g = "", X = function (wk) { return x + wk / 120 * w; }, Y = function (pc) { return y + (-pc) / 20 * h; };
  g += seg([[x, y - 20], [x, y + h + 10]], INK, 2.4) + seg([[x - 10, y], [x + w + 10, y]], INK, 2.4);
  for (var p = 5; p <= 20; p += 5) g += seg([[x - 6, Y(-p)], [x + w, Y(-p)]], "#d6cab0", 1.2) + '<text x="' + f(x - 12) + '" y="' + f(Y(-p) + 6) + '" text-anchor="end" style="font:700 16px \'Noto Serif\';fill:' + INK + ';direction:ltr">-' + p + '%</text>';
  var A = [[0, 0], [8, -3], [20, -8.5], [36, -13], [52, -16], [68, -17.3]], B = [[68, -17.3], [80, -13.5], [92, -10], [106, -7.4], [120, -5.6]];
  var dA = function (k) { var n = Math.max(1, Math.round(k * 50)), pts = []; for (var i = 0; i <= n; i++) { var u = i / 50, q = along(A, u); pts.push([X(q[0]), Y(q[1])]); } return pts; };
  if (o.k1) g += seg(dA(clamp(o.k1)), "#5e8a4a", 5);
  if (o.k2) { var n2 = Math.max(1, Math.round(clamp(o.k2) * 40)), pts2 = []; for (var j = 0; j <= n2; j++) { var q2 = along(B, j / 40); pts2.push([X(q2[0]), Y(q2[1])]); } g += seg(pts2, ORANGE, 5); }
  if (o.stop) g += seg([[X(68), y - 20], [X(68), y + h + 10]], INK, 2, ' stroke-dasharray="8 6"') + txt("وقف الحقنة", X(68), y - 30, 18, INK);
  return g;
}
// the Gila monster, seen from above (as in the photograph): beaded black skin, orange-pink bands; o.tongue 0..1
function gila(x, y, s, o) {
  o = o || {}; var t = now(), g = "", P = function (pts) { return tr(pts, x, y, s); };
  var legs = [[[-110, -34], [-124, -66], [-142, -76]], [[-110, 34], [-124, 66], [-142, 76]], [[60, -34], [52, -68], [36, -80]], [[60, 34], [52, 68], [36, 80]]];
  legs.forEach(function (L) { g += line(P(L), INK, 28 * s) + line(P(L), "#3a2a24", 23 * s); var e = P([L[2]])[0], dy = L[2][1] > 0 ? 1 : -1; for (var c = -2; c <= 2; c++) g += seg([e, [e[0] - 14 * s + c * 2 * s, e[1] + (c * 6 + dy * 8) * s]], INK, 3 * s); });
  var body = P([[-200, 0], [-176, -34], [-130, -46], [-60, -50], [10, -50], [70, -42], [130, -28], [190, -16], [226, 0], [190, 16], [130, 28], [70, 42], [10, 50], [-60, 50], [-130, 46], [-176, 34]]);
  g += blob(body, "#2f2420", 2.6);
  var bands = [-150, -100, -50, 0, 50, 100, 150, 190];
  bands.forEach(function (bx, i) { var hw = (bx < 60 ? 44 : 44 - (bx - 60) * .26); g += blob(P([[bx - 12, -hw * .8], [bx + 4, -hw * .9], [bx + 16, -hw * .3], [bx + 8, hw * .2], [bx + 14, hw * .8], [bx - 6, hw * .9], [bx - 14, hw * .2], [bx - 8, -hw * .3]]), i % 2 ? "#e08a5a" : "#d9714a", 1.4); });
  for (var b = 0; b < 200; b++) { var u = rnd(b), v = rnd(b + 200) - .5, bx2 = -190 + u * 400, hw2 = bx2 < 60 ? 44 : Math.max(4, 44 - (bx2 - 60) * .26); var q = P([[bx2, v * 1.8 * hw2]])[0]; g += circ(q[0], q[1], 2.4 * s, "none", 1 * s, "#5a463e"); }
  // the head: broad, rounded snout, small eyes; the forked tongue flicks
  g += blob(P([[-176, -32], [-214, -38], [-250, -28], [-266, 0], [-250, 28], [-214, 38], [-176, 32]]), "#3a2c26", 2.6);
  g += blob(P([[-214, -22], [-238, -14], [-240, 10], [-214, 22], [-206, 0]]), "#d97a52", 1.4);
  g += circ(x - 222 * s, y - 20 * s, 4 * s, "#1a1310", 1) + circ(x - 222 * s, y + 20 * s, 4 * s, "#1a1310", 1);
  var tg = clamp(o.tongue == null ? Math.max(0, Math.sin(t * 2.4)) : o.tongue);
  if (tg > .05) g += seg(P([[-262, 0], [-262 - 34 * tg, 0], [-262 - 44 * tg, -7 * tg]]), "#7a3a4a", 3.4 * s) + seg(P([[-262 - 34 * tg, 0], [-262 - 44 * tg, 7 * tg]]), "#7a3a4a", 3.4 * s);
  return g;
}
// a person-sized body map: the stations numbered (used over PERSON.front): a cut-away window over the belly showing organs
function bellyWindow(x, y, s, o) {
  o = o || {}; var id = "bw" + (++CID), g = "", w = 150 * s, h = 120 * s;
  g += '<clipPath id="' + id + '"><rect x="' + f(x - w / 2) + '" y="' + f(y - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(14 * s) + '"/></clipPath>';
  g += '<g clip-path="url(#' + id + ')"><rect x="' + f(x - w) + '" y="' + f(y - h) + '" width="' + f(2 * w) + '" height="' + f(2 * h) + '" fill="#f0c9b4"/>';
  // small intestine coils low, stomach high on the viewer's right, the pancreas tucked behind it
  for (var i = 0; i < 6; i++) g += line([[x - w * .4, y + h * .08 + i * 7 * s], [x - w * .1, y + h * .02 + i * 7 * s], [x + w * .1, y + h * .14 + i * 7 * s], [x + w * .4, y + h * .06 + i * 7 * s]], "#d98c8c", 6 * s);
  g += G("", stomach(x + w * .16, y - h * .1, s * .2, { fill: .5 }), 1);
  g += G("", '<g transform="translate(' + f(x - w * .06) + ' ' + f(y + h * .02) + ') scale(' + f(s * .16) + ')"><path d="M-180 -50 C-150 -90 40 -60 220 -120 C240 -100 200 -60 0 -14 C-60 10 -100 80 -180 60 Z" fill="' + PANC + '" stroke="' + INK + '" stroke-width="10"/></g>', o.panc == null ? 1 : o.panc);
  g += '</g><rect x="' + f(x - w / 2) + '" y="' + f(y - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(14 * s) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="7 5"/>';
  return g;
}
return { C: C, f: f, cr: cr, blob: blob, line: line, seg: seg, circ: circ, ell: ell, txt: txt, tag: tag, along: along, lerpCol: lerpCol,
  stomach: stomach, pancreas: pancreas, vessel: vessel, glp: glp, dpp4: dpp4, brainHead: brainHead, villi: villi, fat: fat, muscle: muscle,
  plate: plate, sink: sink, pen: pen, scale: scale, balance: balance, flame: flame, graph: graph, gila: gila, bellyWindow: bellyWindow };
})();
