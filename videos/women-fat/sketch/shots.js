// ── «ليه الست محتاجة دهون أكتر من الراجل؟» — drawings. The drawing hand is «لو حد شرق قدامك» (videos/choking); the body cuts
// follow the «طب إزاي؟» reference sheets (v04 head and brain cut, v17 the baby in the womb, v07 bone) and real anatomy
// (refs/SOURCES.md): the brain is a mid-line cut after the Visible Human section (hypothalamus under the thalamus, the
// pituitary on its stalk in the sella turcica); fat is real white adipose tissue (polygonal cells, one big droplet, the
// nucleus pressed flat to the edge); the thigh is an axial MRI cut (skin, subcutaneous fat, fascia, quadriceps in front,
// hamstrings behind, adductors inside, the femur a little to the front, the femoral vessels on the inner side); the
// femur follows Gray's anatomy (head, neck, greater trochanter, shaft, condyles; trabecular arcs in the head).
// People: the shared person kit (videos/_templates/people/person.js), the woman with o.sex "f" and the "tunic" outfit.

var FAT = "#e6c86e", FATD = "#c29a3e", FATL = "#f3e2a8", CYTO = "#efd3c4", MEMB = "#c98a72", NUC = "#7d5a72",
    MUSC = "#c47b68", MUSCD = "#a3604f", MUSCL = "#d89a86", BONE = "#e9dfc7", BONED = "#cbbd9b", MARROW = "#ecd08a",
    BLOODC = "#b8483a", VEIN = "#4a6f8a", UTER = "#d08b7c", UTERD = "#b06a5c", LINING = "#b65848", AMNIO = "#d3e2e3", PLAC = "#7d8448",
    BRAIN = "#dcb79c", BRAIND = "#b98d72", CEREB = "#c99a80", HYPO = OLIVE, PIT = "#9a8f4e", SKULL = "#efe6d0";
function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function poly(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" ") + " Z"; }
function smooth(pts, close) {   // a smooth curve through points (quadratic through midpoints), like the kit's pPath
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1]));
}
function breath(t, ph) { return (Math.sin(t * 2.2 + (ph || 0)) + 1) / 2; }
function blink(t, ph) { var x = (t + (ph || 0)) % 3.7; return x < 0.13 ? 0.05 : 1; }

// ── people ──
function woman(x, y, s, t, o) {
  o = o || {}; var p = { x: x, y: y, s: s, sex: "f", outfit: "tunic", breath: breath(t, o.ph), head: o.head, arms: o.arms, lean: o.lean,
    face: Object.assign({ eyes: blink(t, o.ph), mouth: "neutral", brows: "neutral" }, o.face || {}) };
  if (o.colors) p.colors = o.colors;
  return PERSON.front(p);
}
function man(x, y, s, t, o) {
  o = o || {}; return PERSON.front({ x: x, y: y, s: s, outfit: o.outfit || "casual", breath: breath(t, (o.ph || 0) + 1), head: o.head, arms: o.arms, lean: o.lean,
    face: Object.assign({ eyes: blink(t, (o.ph || 0) + 1.3), mouth: "neutral" }, o.face || {}) });
}
var HANDS_IN = function (x, y, s) { return [{ to: [x - 6 * s, y - 34 * s], bend: 1, hand: "relaxed" }, { to: [x + 6 * s, y - 40 * s], bend: -1, hand: "relaxed" }]; };
// a label whose name sits centred above the end of its leader line (for labels near the right edge, where RTL text would run off)
function labelUp(px, py, lx, ly, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22;
  var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6));
  return '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="3.5" fill="' + INK + '"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.3"/>' +
    (k > .55 ? '<g opacity="' + f(clamp((k - .55) / .3)) + '">' + T(text, lx, ly - 10, sz, col || INK, 700) + '</g>' : "");
}
// where the body keeps its fat, drawn over the person like an X-ray: hatched yellow patches.
// Woman (gynoid): hips and outer thighs, the lower belly, the breasts. Man (android): the belly. Units from the hip joint, H = 400.
function fatZones(x, y, s, sex, k, t, hl) {
  k = clamp(k); if (k <= 0) return ""; var pul = 1 + (hl ? 0.035 * Math.sin(t * 5) : 0), out = "";
  function blob(pts) { var q = pts.map(function (p) { return [x + p[0] * s * pul, y + p[1] * s * pul]; }), d = smooth(q, true);
    var id = "fz" + (++CLIPN), cells = "", bx = q.reduce(function (m, p) { return [Math.min(m[0], p[0]), Math.min(m[1], p[1]), Math.max(m[2], p[0]), Math.max(m[3], p[1])]; }, [1e9, 1e9, -1e9, -1e9]), cr = 5.5 * s;
    for (var yy = bx[1]; yy < bx[3]; yy += cr * 1.7) for (var xx = bx[0] + ((yy / (cr * 1.7)) & 1 ? cr * .85 : 0); xx < bx[2]; xx += cr * 1.7) cells += '<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="' + f(cr * .8) + '"/>';
    return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + FAT + '" opacity=".72"/><g clip-path="url(#' + id + ')" fill="none" stroke="' + FATD + '" stroke-width="' + f(.8 * s) + '" opacity=".75">' + cells + '</g>' +
      '<path d="' + d + '" fill="none" stroke="' + FATD + '" stroke-width="' + f(1.8 * s) + '"/>'; }
  if (sex === "f") {
    [-1, 1].forEach(function (sd) {
      out += blob([[sd * 26, -32], [sd * 39, -12], [sd * 46, 18], [sd * 47, 52], [sd * 42, 84], [sd * 32, 98], [sd * 23, 80], [sd * 22, 40], [sd * 20, 0]]);
    });
  } else {
    out += blob([[-30, -40], [-18, -70], [0, -76], [18, -70], [30, -40], [24, -14], [0, -6], [-24, -14]]);
  }
  return appear(k, out);
}

// ── white fat seen down the microscope: polygonal cells packed edge to edge (a hex tiling with jittered shared corners),
// one big droplet filling each cell, the nucleus squeezed flat against the edge. fill 0..1 = how full the droplets are.
function adipose(cx, cy, w, h, r, fill, t, o) {
  o = o || {}; var s = "", id = "ad" + (++CLIPN), sq = Math.sqrt(3), cells = [];
  function corner(x, y) { var kx = Math.round(x * 10), ky = Math.round(y * 10), j = hash(kx * 0.37 + ky * 1.91); return [x + (j - .5) * r * .34, y + (hash(kx * 2.3 - ky * .71) - .5) * r * .34]; }
  var i0 = Math.floor(-w / 2 / (1.5 * r)) - 1, i1 = Math.ceil(w / 2 / (1.5 * r)) + 1, j0 = Math.floor(-h / 2 / (sq * r)) - 1, j1 = Math.ceil(h / 2 / (sq * r)) + 1;
  for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) {
    var x = i * 1.5 * r, y = j * sq * r + (i & 1 ? sq * r / 2 : 0), pts = [];
    for (var a = 0; a < 6; a++) pts.push(corner(x + r * Math.cos(a * Math.PI / 3), y + r * Math.sin(a * Math.PI / 3)));
    cells.push({ x: x, y: y, pts: pts, h: hash(i * 13.1 + j * 7.7) });
  }
  s += '<clipPath id="' + id + '">' + (o.circle ? '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(o.circle) + '"/>' : '<rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '"/>') + '</clipPath><g clip-path="url(#' + id + ')">';
  s += '<rect x="' + f(cx - w / 2 - 10) + '" y="' + f(cy - h / 2 - 10) + '" width="' + f(w + 20) + '" height="' + f(h + 20) + '" fill="' + CYTO + '"/>';
  cells.forEach(function (c) {
    var P = c.pts.map(function (p) { return [cx + p[0], cy + p[1]]; }), C0 = [cx + c.x, cy + c.y];
    var fl = clamp(fill * (0.88 + 0.12 * c.h) * (o.breathe ? 1 + 0.03 * Math.sin(t * 2 + c.h * 6) : 1));
    s += '<path d="' + smooth(P, true) + '" fill="' + CYTO + '" stroke="' + MEMB + '" stroke-width="2.4"/>';
    if (fl > 0.05) { var D = P.map(function (p) { return L2(C0, p, 0.86 * fl); }); s += '<path d="' + smooth(D, true) + '" fill="' + (o.hl ? FAT : FATL) + '" stroke="' + FATD + '" stroke-width="1"/>'; }
    var e = Math.floor(c.h * 6), n = L2(C0, L2(c.pts[e].map(function (v, q) { return v + [cx, cy][q]; }), c.pts[(e + 1) % 6].map(function (v, q) { return v + [cx, cy][q]; }), .5), 0.84);
    var ang = Math.atan2(n[1] - C0[1], n[0] - C0[0]) * 180 / Math.PI + 90;
    s += '<ellipse cx="' + f(n[0]) + '" cy="' + f(n[1]) + '" rx="' + f(r * .2) + '" ry="' + f(r * .07 + r * .1 * (1 - fill)) + '" transform="rotate(' + f(ang) + ' ' + f(n[0]) + ' ' + f(n[1]) + ')" fill="' + NUC + '"/>';
  });
  if (o.vessel) {   // a capillary running across, red cells drifting along it
    var v = o.vessel, a2 = Math.atan2(v[3] - v[1], v[2] - v[0]), L = Math.hypot(v[2] - v[0], v[3] - v[1]), nx = -Math.sin(a2), ny = Math.cos(a2), wv = o.vw || 16;
    s += '<path d="M' + f(v[0] + nx * wv) + ' ' + f(v[1] + ny * wv) + ' L' + f(v[2] + nx * wv) + ' ' + f(v[3] + ny * wv) + ' L' + f(v[2] - nx * wv) + ' ' + f(v[3] - ny * wv) + ' L' + f(v[0] - nx * wv) + ' ' + f(v[1] - ny * wv) + ' Z" fill="#e8b9a8" stroke="' + BLOODC + '" stroke-width="2.4"/>';
    for (var q = 0; q < 14; q++) { var u = ((q / 14) + t * 0.08 + hash(q) * .03) % 1, px = v[0] + (v[2] - v[0]) * u + nx * (hash(q + 4) - .5) * wv, py = v[1] + (v[3] - v[1]) * u + ny * (hash(q + 4) - .5) * wv;
      s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(wv * .42) + '" ry="' + f(wv * .26) + '" transform="rotate(' + f(a2 * 180 / Math.PI) + ' ' + f(px) + ' ' + f(py) + ')" fill="' + BLOODC + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    if (o.leptin) {   // leptin: small orange dots leaving the cells and riding the blood
      var nL = Math.round(o.leptin * 26);
      for (q = 0; q < nL; q++) { var uu = ((q / nL) + t * 0.1) % 1, side = q % 2 ? 1 : -1, off = wv + 70 * (1 - clamp(((t * .6 + hash(q * 3)) % 1) * 2)) * side;
        var lx = v[0] + (v[2] - v[0]) * uu + nx * off * (hash(q) > .5 ? 1 : .6), ly = v[1] + (v[3] - v[1]) * uu + ny * off * (hash(q) > .5 ? 1 : .6);
        s += '<circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="4.2" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1"/>'; }
    }
  }
  s += '</g>';
  if (o.circle) s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(o.circle) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  else s += '<rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  return s;
}

// ── the head in a mid-line cut, face to the right (after the Visible Human section and the v04 reference) ──
// o: {hyp: 0..1 hypothalamus lit, pit: 0..1 pituitary lit, dots: 0..1 leptin arriving, quiet: 0..1 (the message stops)}
var HEAD = [[300, 96], [380, 104], [440, 150], [470, 214], [476, 262], [492, 300], [508, 338], [496, 352], [494, 372], [500, 392], [486, 412], [484, 432], [476, 462], [452, 486], [418, 494], [400, 520], [398, 786], [196, 786], [200, 560], [176, 470], [150, 380], [146, 300], [162, 210], [210, 134]];
function brainCut(t, o) {
  o = o || {}; var s = "";
  s += '<path d="' + smooth(HEAD, true) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  // skull: a thick pale band inside the scalp, the face bones in front
  var SK = [[300, 116], [372, 124], [426, 164], [452, 222], [456, 270], [430, 300], [372, 330], [300, 336], [234, 368], [196, 380], [170, 330], [168, 262], [184, 196], [228, 146]];
  s += '<path d="' + smooth(SK, true) + '" fill="' + SKULL + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // cerebrum: the big folded brain, the cerebellum under the back, the brainstem going down into the neck
  var CB = [[300, 132], [366, 140], [414, 174], [436, 222], [436, 262], [412, 286], [380, 300], [350, 312], [320, 318], [282, 318], [246, 330], [212, 330], [190, 300], [186, 248], [200, 196], [238, 152]];
  s += '<path d="' + smooth(CB, true) + '" fill="' + BRAIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
  // gyri: folded lines on the cut surface
  var gy = "";
  for (var g = 0; g < 9; g++) {
    var a0 = -2.7 + g * 0.27, r0 = 120, cx0 = 312, cy0 = 248, p0 = [cx0 + Math.cos(a0) * r0 * 1.08, cy0 + Math.sin(a0) * r0 * .78], p1 = [cx0 + Math.cos(a0) * r0 * .55, cy0 + Math.sin(a0) * r0 * .42];
    gy += '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + ' Q' + f((p0[0] + p1[0]) / 2 + 10 * Math.sin(g * 2.1)) + ' ' + f((p0[1] + p1[1]) / 2 + 12 * Math.cos(g * 1.7)) + ' ' + f(p1[0]) + ' ' + f(p1[1]) + '" stroke="' + BRAIND + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  }
  s += gy + '<path d="M214 250 Q236 226 228 200 M222 296 Q250 284 262 300 M404 210 Q384 222 392 246 M420 254 Q398 258 396 280" stroke="' + BRAIND + '" stroke-width="2" fill="none"/>';
  // corpus callosum (the pale C) and the thalamus under it
  s += '<path d="M386 236 C376 206 300 196 258 214 C238 224 236 248 254 256 C262 246 280 232 304 230 C340 228 362 236 372 252 Z" fill="#f1e6d6" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="M290 262 C312 248 352 250 360 270 C364 288 340 300 314 298 C292 296 280 280 290 262 Z" fill="' + CEREB + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // cerebellum: leafy, hatched, under the back of the brain
  s += '<path d="M206 336 C206 304 246 296 276 310 C296 322 292 356 266 368 C238 378 208 366 206 336 Z" fill="' + CEREB + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var c = 0; c < 5; c++) s += '<path d="M' + f(214 + c * 4) + ' ' + f(318 + c * 10) + ' Q' + f(244) + ' ' + f(306 + c * 12) + ' ' + f(282 - c * 3) + ' ' + f(320 + c * 9) + '" stroke="' + BRAIND + '" stroke-width="1.5" fill="none"/>';
  // brainstem into the spinal cord
  s += '<path d="M312 296 C332 312 334 340 324 372 C318 402 318 440 318 520 L296 520 C296 450 294 404 290 372 C286 340 294 314 312 296 Z" fill="' + CEREB + '" stroke="' + INK + '" stroke-width="2"/>';
  // the bony seat of the pituitary (sella turcica), the stalk and the gland
  s += '<path d="M352 352 C352 368 380 372 388 352" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M352 352 C352 368 380 372 388 352" stroke="' + SKULL + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  var hyp = clamp(o.hyp || 0), pit = clamp(o.pit || 0), q = clamp(o.quiet || 0);
  s += '<path d="M352 300 C368 306 372 324 368 340" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M352 300 C368 306 372 324 368 340" stroke="' + (pit > .5 ? PIT : CEREB) + '" stroke-width="3" fill="none"/>';
  s += '<ellipse cx="370" cy="350" rx="15" ry="10" fill="' + (pit > 0 ? mixC(CEREB, PIT, pit) : CEREB) + '" stroke="' + INK + '" stroke-width="2"/>';
  // the hypothalamus: a small region under the thalamus, at the floor of the brain
  var hk = 1 + 0.06 * Math.sin(t * 6) * hyp;
  s += G('translate(352 304) scale(' + f(hk) + ')', '<path d="M-22 -8 C-14 -20 10 -18 20 -6 C22 4 12 10 -2 10 C-14 10 -24 4 -22 -8 Z" fill="' + mixC(CEREB, HYPO, hyp) + '" stroke="' + INK + '" stroke-width="2"/>');
  // face: eye in the socket, nose cartilage, mouth and tongue, the jaw
  s += '<ellipse cx="448" cy="276" rx="18" ry="14" fill="#f4ecdb" stroke="' + INK + '" stroke-width="1.8"/><circle cx="458" cy="277" r="6" fill="' + PSN.iris + '"/>';
  s += '<path d="M410 330 C440 326 470 334 488 350 L470 360 C450 352 428 350 410 352 Z" fill="#f1e5d2" stroke="' + INK + '" stroke-width="1.6"/>';
  s += '<path d="M392 392 C420 380 456 382 484 400 C470 412 444 416 410 416 Z" fill="#c97566" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="M396 438 C420 450 452 452 474 440" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M396 438 C420 450 452 452 474 440" stroke="' + SKULL + '" stroke-width="2.6" fill="none"/>';
  // the neck: spine at the back, the windpipe in front
  for (var y = 400; y < 786; y += 44) s += R(232, y, 46, 34, BONE, 1.8, 5);
  s += '<path d="M360 470 L360 786 L392 786 L392 476" fill="#e9d6c6" stroke="' + INK + '" stroke-width="1.8"/>';
  for (y = 488; y < 786; y += 18) s += '<path d="M362 ' + y + ' h28" stroke="' + BRAIND + '" stroke-width="2"/>';
  // a carotid artery coming up the neck: the blood the leptin rides in
  s += '<path d="M338 786 C338 640 336 520 344 430 C348 392 360 370 366 360" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M338 786 C338 640 336 520 344 430 C348 392 360 370 366 360" stroke="' + BLOODC + '" stroke-width="7" fill="none"/>';
  if (o.dots) { var nD = Math.round(o.dots * 9); for (var dI = 0; dI < nD; dI++) { var u = ((dI / 9) + t * 0.32) % 1, py = lerp(786, 330, u), px = py > 430 ? 338 + (786 - py) / 356 * 6 : lerp(344, 352, (430 - py) / 100);
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="5.5" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - q) + '"/>'; } }
  return s;
}
function mixC(a, b, k) { k = clamp(k); var A = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), B = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
  return "#" + A.map(function (v, i) { return ("0" + Math.round(lerp(v, B[i], k)).toString(16)).slice(-2); }).join(""); }

// ── the womb from the front (frontal anatomy diagram, shape after the laparoscopic photo): pear-shaped uterus with a domed
// top, the tubes curving out from its upper corners to the fringed ends, the ovaries under them, the cervix below.
// o: {grow 0..1 (pregnant), ov: 0..1 ovaries lit, lining: 0..1 the monthly lining, off: 0..1 (switched off, greys out)}
function uterusFront(cx, cy, s, t, o) {
  o = o || {}; var g = "", gr = clamp(o.grow || 0), off = clamp(o.off || 0), W = 46 + 40 * gr, H = 60 + 50 * gr;
  var col = mixC(UTER, "#c9bfb0", off), colD = mixC(UTERD, "#a89e90", off);
  [-1, 1].forEach(function (sd) {   // tubes and ovaries
    var tb = [[sd * (W - 6), -H * .62], [sd * (W + 40), -H * .9], [sd * (W + 86), -H * .66], [sd * (W + 104), -H * .2]];
    g += '<path d="' + smooth(tb, false) + '" stroke="' + INK + '" stroke-width="14" fill="none" stroke-linecap="round"/><path d="' + smooth(tb, false) + '" stroke="' + col + '" stroke-width="9.5" fill="none" stroke-linecap="round"/>';
    for (var k = 0; k < 6; k++) { var a = (-60 + k * 26) * Math.PI / 180; g += '<path d="M' + f(sd * (W + 104)) + ' ' + f(-H * .2) + ' l' + f(sd * Math.cos(a) * 14) + ' ' + f(Math.sin(a) * 14 + 10) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M' + f(sd * (W + 104)) + ' ' + f(-H * .2) + ' l' + f(sd * Math.cos(a) * 14) + ' ' + f(Math.sin(a) * 14 + 10) + '" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round"/>'; }
    var ox = sd * (W + 62), oy = -H * .05, ov = clamp(o.ov || 0) * (1 - off);
    g += '<path d="M' + f(sd * (W - 4)) + ' ' + f(-H * .42) + ' Q' + f(sd * (W + 24)) + ' ' + f(-H * .2) + ' ' + f(ox - sd * 18) + ' ' + f(oy) + '" stroke="' + colD + '" stroke-width="5" fill="none"/>';
    g += '<ellipse cx="' + f(ox) + '" cy="' + f(oy) + '" rx="28" ry="17" transform="rotate(' + f(sd * -14) + ' ' + f(ox) + ' ' + f(oy) + ')" fill="' + mixC(mixC("#e8cdb6", "#c9bfb0", off), "#f0b98a", ov) + '" stroke="' + INK + '" stroke-width="2"/>';
    [[-10, -3, 6], [6, 4, 5], [12, -6, 4], [-2, 7, 3.5]].forEach(function (fo, i) { var pulse = i === 0 ? ov * (1 + .15 * Math.sin(t * 5)) : 1; g += '<circle cx="' + f(ox + sd * fo[0]) + '" cy="' + f(oy + fo[1]) + '" r="' + f(fo[2] * pulse) + '" fill="' + (i === 0 && ov > .3 ? "#f6e7c8" : "#f3e3cf") + '" stroke="' + colD + '" stroke-width="1.2"/>'; });
  });
  // the body of the uterus: thick muscle wall, the cavity inside, the cervix and the canal below
  var body = [[0, -H - 4], [W * .7, -H * .96], [W, -H * .66], [W * .92, -H * .1], [W * .56, H * .42], [W * .36, H * .74], [W * .34, H * 1.02], [-W * .34, H * 1.02], [-W * .36, H * .74], [-W * .56, H * .42], [-W * .92, -H * .1], [-W, -H * .66], [-W * .7, -H * .96]];
  g += '<path d="' + smooth(body, true) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.6"/>';
  g += '<path d="' + smooth([[-W * .7, -H * .7], [-W * .2, -H * .82], [W * .4, -H * .74], [W * .66, -H * .4]], false) + '" stroke="' + colD + '" stroke-width="1.4" fill="none" opacity=".7"/>';
  if (gr < .2) {
    var li = clamp(o.lining == null ? 1 : o.lining) * (1 - off), cav = [[-W * .62, -H * .62], [W * .62, -H * .62], [W * .1, H * .5], [-W * .1, H * .5]];
    g += '<path d="' + smooth(cav, true) + '" fill="' + mixC("#e9c3b6", LINING, li) + '" stroke="' + INK + '" stroke-width="1.8"/>';
  }
  g += '<path d="M' + f(-W * .3) + ' ' + f(H * 1.02) + ' L' + f(-W * .36) + ' ' + f(H * 1.7) + ' L' + f(W * .36) + ' ' + f(H * 1.7) + ' L' + f(W * .3) + ' ' + f(H * 1.02) + '" fill="' + mixC("#e2a99a", "#c9bfb0", off) + '" stroke="' + INK + '" stroke-width="2.2"/>';
  g += '<path d="M0 ' + f(H * .5) + ' L0 ' + f(H * 1.68) + '" stroke="' + colD + '" stroke-width="3"/>';
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g);
}

// ── pregnancy in a side cut, the mother facing right (after v17 and the mid-line anatomy of late pregnancy):
// spine at the back, the womb filling the belly, its thick wall, the waters, the placenta high on the back wall,
// the baby head-down and curled, the cord. k = how far along (0..1).
function pregnancyCut(t, k) {
  k = clamp(k); var s = "", bel = lerp(430, 528, k), b = breath(t);
  var body = [[236, 70], [330, 74], [384, 130], [406, 196], [394, 250], [lerp(380, 470, k), 320], [bel, 440 + 4 * b], [lerp(410, 470, k), 580], [430, 640], [400, 700], [380, 786], [212, 786], [214, 700], [196, 620], [188, 560], [204, 470], [220, 360], [214, 240], [216, 150]];
  s += '<path d="' + smooth(body, true) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="' + smooth(body, true) + '" fill="url(#hatch)" opacity=".16"/>';
  // spine down the back, the pelvis and the pubic bone in front
  for (var y = 110; y < 600; y += 40) { var x = 246 + 12 * Math.sin((y - 110) / 490 * Math.PI) - (y > 470 ? (y - 470) * .25 : 0); s += R(x, y, 38, 30, BONE, 1.8, 5); }
  s += '<path d="M232 600 C250 640 300 668 360 660" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M232 600 C250 640 300 668 360 660" stroke="' + BONE + '" stroke-width="11" fill="none" stroke-linecap="round"/>';
  s += '<ellipse cx="402" cy="640" rx="16" ry="24" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  // the womb: wall, waters, placenta
  var cx = lerp(330, 380, k), cy = lerp(560, 450, k), rx = lerp(60, 148, k), ry = lerp(70, 172, k);
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx + 14) + '" ry="' + f(ry + 14) + '" transform="rotate(-18 ' + f(cx) + ' ' + f(cy) + ')" fill="' + UTER + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" transform="rotate(-18 ' + f(cx) + ' ' + f(cy) + ')" fill="' + AMNIO + '" stroke="' + INK + '" stroke-width="1.8"/>';
  s += '<path d="M' + f(cx - rx * .62) + ' ' + f(cy - ry * .62) + ' C' + f(cx - rx * .2) + ' ' + f(cy - ry * 1.02) + ' ' + f(cx + rx * .32) + ' ' + f(cy - ry * .98) + ' ' + f(cx + rx * .58) + ' ' + f(cy - ry * .74) + ' L' + f(cx + rx * .4) + ' ' + f(cy - ry * .6) + ' C' + f(cx + rx * .2) + ' ' + f(cy - ry * .78) + ' ' + f(cx - rx * .2) + ' ' + f(cy - ry * .8) + ' ' + f(cx - rx * .5) + ' ' + f(cy - ry * .5) + ' Z" fill="' + PLAC + '" stroke="' + INK + '" stroke-width="2"/>';
  // the baby: head down near the cervix, back curled toward the mother's front, knees up
  var fs = lerp(.3, 1, k), fx = cx + 4, fy = cy + 8;
  var baby = '<path d="M-4 -120 C46 -128 84 -84 80 -26 C78 24 52 56 14 66 L-30 60 C-60 40 -74 -10 -66 -60 C-60 -98 -36 -118 -4 -120 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' +   // trunk
    '<circle cx="-6" cy="96" r="56" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>' +   // head, down
    '<path d="M-44 104 q-8 10 -2 18" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/><path d="M-30 118 q8 4 14 0" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' +
    '<path d="M-60 -40 C-104 -50 -110 -2 -76 12 C-60 18 -44 8 -40 -6" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +   // thigh and knee to the front
    '<path d="M-74 10 C-80 40 -60 60 -40 52" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M30 -10 C10 10 -10 30 -24 40" stroke="' + INK + '" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M30 -10 C10 10 -10 30 -24 40" stroke="' + SKIN + '" stroke-width="11" stroke-linecap="round" fill="none"/>';   // arm
  s += G('translate(' + f(fx) + ' ' + f(fy) + ') rotate(-18) scale(' + f(fs) + ')', baby);
  // the cord from the baby's belly to the placenta
  var c0 = [fx - 30 * fs, fy - 10 * fs], c1 = [cx + rx * .05, cy - ry * .82];
  s += '<path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' C' + f(c0[0] - 60) + ' ' + f(c0[1] - 60) + ' ' + f(c1[0] - 70) + ' ' + f(c1[1] + 40) + ' ' + f(c1[0]) + ' ' + f(c1[1]) + '" stroke="' + INK + '" stroke-width="11" fill="none"/>' +
       '<path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' C' + f(c0[0] - 60) + ' ' + f(c0[1] - 60) + ' ' + f(c1[0] - 70) + ' ' + f(c1[1] + 40) + ' ' + f(c1[0]) + ' ' + f(c1[1]) + '" stroke="#c9d3b0" stroke-width="7" fill="none" stroke-dasharray="6 4"/>';
  return s;
}

// ── a thigh cut across, after an axial MRI: skin, the fat under it (fw = its thickness), the fascia, the muscle groups,
// the femur a little to the front, the femoral artery and vein on the inner side. Front is up, the inner side to the left.
function thighCut(cx, cy, R, fw, t, o) {
  o = o || {}; var s = "", Ri = R - fw, sh = function (r, sx, sy) { var p = []; for (var a = 0; a < 24; a++) { var an = a / 24 * Math.PI * 2, w = 1 + .05 * Math.sin(an * 3 + .6); p.push([cx + Math.cos(an) * r * sx * w, cy + Math.sin(an) * r * sy * w]); } return smooth(p, true); };
  s += '<path d="' + sh(R + 4, 1, .92) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<path d="' + sh(R, 1, .92) + '" fill="' + (o.hl ? FAT : FATL) + '" stroke="' + SKIN2 + '" stroke-width="1.2"/>';
  // fat lobules: little rounded cells in the fat layer
  for (var a = 0; a < 40; a++) { var an = a / 40 * Math.PI * 2 + .05, rr = (R + Ri) / 2; s += '<circle cx="' + f(cx + Math.cos(an) * rr) + '" cy="' + f(cy + Math.sin(an) * rr * .92) + '" r="' + f(Math.max(2, fw * .28)) + '" fill="none" stroke="' + FATD + '" stroke-width=".9" opacity=".7"/>'; }
  s += '<path d="' + sh(Ri, 1, .92) + '" fill="' + MUSC + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // muscle groups, split by thin septa: front (quadriceps), back (hamstrings), inner (adductors)
  var bx = cx + Ri * .06, by = cy - Ri * .12;
  [[-.42, 1], [-1.7, 1], [-2.6, .95], [2.2, 1], [.9, 1], [-1.05, .9]].forEach(function (q) { var e = [cx + Math.cos(q[0]) * Ri * q[1], cy + Math.sin(q[0]) * Ri * .92 * q[1]];
    s += '<path d="M' + f(bx) + ' ' + f(by) + ' Q' + f((bx + e[0]) / 2 + 8) + ' ' + f((by + e[1]) / 2 - 6) + ' ' + f(e[0]) + ' ' + f(e[1]) + '" stroke="' + MUSCD + '" stroke-width="2" fill="none"/>'; });
  s += '<path d="' + sh(Ri * .99, 1, .92) + '" fill="url(#hatch)" opacity=".18"/>';
  // femur: cortex ring and marrow
  s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(Ri * .2) + '" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.2"/><circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(Ri * .11) + '" fill="' + MARROW + '" stroke="' + BONED + '" stroke-width="1.2"/>';
  // femoral artery and vein on the inner front side
  var vx = cx - Ri * .5, vy = cy - Ri * .3;
  s += C(vx, vy, Ri * .065, BLOODC, 1.6) + C(vx - Ri * .02, vy + Ri * .14, Ri * .075, VEIN, 1.6);
  return s;
}

// ── the femur (front view, after Gray's anatomy): head, neck, greater and lesser trochanter, shaft, condyles.
// cut: show the upper end cut open (cortex, trabecular arcs, marrow canal). loss 0..1 thins the bone inside.
function femur(cx, cy, s, t, o) {
  o = o || {}; var g = "", loss = clamp(o.loss || 0);
  var out = [[-30, -26], [-4, -14], [20, -30], [40, -30], [52, -8], [48, 30], [32, 64], [24, 110], [22, 220], [26, 330], [36, 378], [62, 408], [66, 444], [42, 462], [16, 452], [0, 434], [-14, 452], [-40, 462], [-64, 446], [-60, 408], [-34, 378], [-22, 330], [-18, 220], [-18, 124], [-28, 100], [-44, 92], [-34, 72], [-30, 44], [-38, 14]];
  g += '<path d="' + smooth(out, true) + '" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.6"/>';
  g += '<circle cx="-50" cy="-10" r="28" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M-38 -4 q-4 6 2 10" stroke="' + BONED + '" stroke-width="1.6" fill="none"/>';   // the head (ball of the hip joint) with its small pit
  g += '<path d="M8 -6 C14 8 18 24 20 40" stroke="' + BONED + '" stroke-width="1.6" fill="none"/>';   // the line between the trochanters
  if (o.cut) {
    // marrow canal in the shaft, trabecular arcs in the head and neck
    g += '<path d="' + smooth([[-8, 100], [10, 100], [12, 220], [14, 330], [0, 360], [-10, 330], [-10, 220]], true) + '" fill="' + MARROW + '" stroke="' + BONED + '" stroke-width="1.4"/>';
    var lw = lerp(2.2, .7, loss), op = lerp(.95, .35, loss);
    for (var i = 0; i < 6; i++) g += '<path d="M' + f(-60 + i * 6) + ' ' + f(-24 + i * 4) + ' Q' + f(-30 + i * 4) + ' ' + f(10 + i * 6) + ' ' + f(-18 + i * 3) + ' ' + f(80 + i * 6) + '" stroke="' + BONED + '" stroke-width="' + f(lw) + '" fill="none" opacity="' + f(op) + '"/>';
    for (i = 0; i < 5; i++) g += '<path d="M' + f(40 - i * 4) + ' ' + f(-24 + i * 10) + ' Q' + f(-6) + ' ' + f(-30 + i * 6) + ' ' + f(-52 + i * 5) + ' ' + f(-30 + i * 8) + '" stroke="' + BONED + '" stroke-width="' + f(lw) + '" fill="none" opacity="' + f(op) + '"/>';
    if (loss > 0) for (i = 0; i < 14; i++) { var hx = -50 + hash(i) * 90, hy = -30 + hash(i + 7) * 100; if (hy > 40 && hx < -24) continue; g += '<ellipse cx="' + f(hx) + '" cy="' + f(hy) + '" rx="' + f(3 + 6 * loss * hash(i + 3)) + '" ry="' + f(2 + 4 * loss) + '" fill="' + MARROW + '" opacity="' + f(loss) + '"/>'; }
  }
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g);
}

// ── spongy bone up close (micro-CT look): a net of bony struts with marrow in the spaces. loss 0..1: the struts thin and
// break, the holes grow (osteoporosis).
function trabecular(cx, cy, r, loss, t) {
  var s = "", id = "tb" + (++CLIPN), sp = r / 4.2, N = {}, k;
  s += '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath><g clip-path="url(#' + id + ')">';
  s += '<rect x="' + f(cx - r) + '" y="' + f(cy - r) + '" width="' + f(2 * r) + '" height="' + f(2 * r) + '" fill="#f1dca6"/>';
  for (var i = -6; i <= 6; i++) for (var j = -6; j <= 6; j++) N[i + "," + j] = [cx + i * sp + (hash(i * 3.1 + j * 7.3) - .5) * sp * .7, cy + j * sp + (hash(i * 5.7 - j * 2.9) - .5) * sp * .7];
  var ink = "", bone = "", w = lerp(11, 3.2, loss);
  for (i = -6; i <= 6; i++) for (j = -6; j <= 6; j++) [[1, 0], [0, 1], [1, 1]].forEach(function (dv, n) {
    var b = N[(i + dv[0]) + "," + (j + dv[1])]; if (!b) return; var h = hash(i * 11.3 + j * 3.7 + n * 1.9);
    if (n === 2 && h > .4) return; if (h < loss * .62) return;
    var a = N[i + "," + j], d = "M" + f(a[0]) + " " + f(a[1]) + " L" + f(b[0]) + " " + f(b[1]), ww = w * (.7 + .5 * hash(h * 9));
    ink += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(ww + 3) + '" stroke-linecap="round"/>'; bone += '<path d="' + d + '" stroke="' + BONE + '" stroke-width="' + f(ww) + '" stroke-linecap="round"/>';
  });
  s += ink + bone + '</g><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  return s;
}

// ── props ──
function burger(x, y, s) {   // a burger from the side: bun, lettuce, cheese, patty, bun with sesame
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')',
    '<path d="M-20 4 h40 q0 7 -6 7 h-28 q-6 0 -6 -7 Z" fill="#d79a52" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<rect x="-21" y="-2" width="42" height="7" rx="3" fill="#7a4a2e" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<path d="M-21 -2 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4" fill="#e3b23c" stroke="' + INK + '" stroke-width="1"/>' +
    '<path d="M-22 -4 q4 3 8 0 q4 3 8 0 q4 3 8 0 q4 3 8 0 q4 3 8 0 q4 3 8 0" fill="none" stroke="#7d8a3a" stroke-width="3"/>' +
    '<path d="M-20 -4 q0 -16 20 -16 q20 0 20 16 Z" fill="#d89a52" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<path d="M-8 -14 l2 -1 M2 -16 l2 0 M9 -12 l2 -1 M-13 -9 l2 -1" stroke="#f6ead0" stroke-width="1.6" stroke-linecap="round"/>');
}
function battery(x, y, w, h, level, cols, labels, k) {   // a battery on its side, filled with cells; level 0..1
  var s = R(x, y, w, h, PAPER, 3, 10) + R(x + w, y + h * .3, 12, h * .4, INK, 0, 3), n = cols.length, cw = (w - 16) / n;
  for (var i = 0; i < n; i++) { var lit = clamp(level * n - i); if (lit <= 0) continue; s += '<rect x="' + f(x + 8 + i * cw + 2) + '" y="' + f(y + 8) + '" width="' + f((cw - 4) * lit) + '" height="' + f(h - 16) + '" rx="5" fill="' + cols[i] + '" stroke="' + INK + '" stroke-width="1.6"/>';
    if (labels && lit > .9) s += '<g opacity="' + f(clamp((k || 1) * 3 - i)) + '">' + T(labels[i], x + 8 + i * cw + cw / 2, y + h / 2 + 9, 24, "#fff", 800) + '</g>'; }
  return s;
}
function phone(level, t) {   // the analogy: a phone whose battery is running out shuts its apps
  var s = R(-28, -46, 56, 92, "#3b3a3c", 2, 8) + R(-23, -38, 46, 74, "#e8eef0", 1.2, 3), low = level < .25;
  s += R(-14, -33, 26, 11, PAPER, 1.4, 2) + '<rect x="-12.5" y="-31.5" width="' + f(23 * level) + '" height="8" fill="' + (low ? ORANGE : OLIVE) + '"/>' + R(12, -30, 3, 5, INK, 0);
  for (var i = 0; i < 6; i++) { var ax = -14 + (i % 3) * 14, ay = -12 + Math.floor(i / 3) * 16, on = !low || i === 0; s += R(ax - 5, ay - 5, 10, 10, on ? [BLUE, ORANGE, OLIVE, "#b98a5a", BLUE, ORANGE][i] : "#c9c4b8", 1, 2); }
  return s;
}
function calendar(x, y, s, period, off, t) {   // a month: 5 rows × 7 days, the period days coloured; off 0..1 crosses them out
  var g = R(-120, -110, 240, 230, "#f6efe0", 2.4, 6) + '<rect x="-120" y="-110" width="240" height="40" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var r = 0; r < 4; r++) g += '<circle cx="' + (-80 + r * 54) + '" cy="-110" r="6" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/>';
  for (var i = 0; i < 31; i++) { var cx = -96 + (i % 7) * 32, cy = -50 + Math.floor(i / 7) * 34, pd = i >= 8 && i < 13 && period;
    g += pd ? '<circle cx="' + cx + '" cy="' + (cy - 5) + '" r="12" fill="' + mixC("#c25b4a", "#d8d0c2", off) + '"/>' : "";
    g += N(String(i + 1), cx, cy + 1, 14, pd ? "#fff" : INK); }
  if (off > 0) g += G("translate(0 -22)", cross(0, 0, 1.3, off));
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', g);
}
function syringe(x, y, s, ang, push) {   // a syringe with the leptin in it; push 0..1 empties it
  var g = R(-70, -14, 120, 28, "#f2f4f0", 2.2, 3) + '<rect x="' + f(-68 + 116 * push) + '" y="-12" width="' + f(116 * (1 - push)) + '" height="24" fill="' + ORANGE + '" opacity=".75"/>';
  for (var i = 0; i < 6; i++) g += '<path d="M' + (-56 + i * 18) + ' -14 v8" stroke="' + INK + '" stroke-width="1.4"/>';
  g += R(-90 + 116 * push, -10, 22, 20, "#8a8c90", 2) + R(-130 + 116 * push, -4, 44, 8, "#b9bbbf", 1.8) + R(-138 + 116 * push, -18, 10, 36, "#8a8c90", 2);
  g += R(50, -6, 12, 12, "#b9bbbf", 1.8) + '<path d="M62 0 L110 0" stroke="' + INK + '" stroke-width="3.4"/><path d="M62 0 L108 0" stroke="#d6d8dc" stroke-width="1.6"/>';
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + f(s) + ')', g);
}
function bag() {   // the emergency bag: a first-aid bag with a cross
  return '<path d="M-30 -14 h60 v34 h-60 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -14 v-8 h24 v8" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M-6 3 h12 M0 -3 v12" stroke="#fff" stroke-width="4"/>';
}
function gauge(level) {   // a fuel gauge for «عندنا وقود كفاية»
  var a = lerp(-150, -30, level) * Math.PI / 180;
  return '<path d="M-34 12 A36 36 0 0 1 34 12" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M-30 6 l6 3 M30 6 l-6 3 M0 -24 v7" stroke="' + INK + '" stroke-width="2"/>' + T("E", -30, 26, 12, ORANGE, 800) + T("F", 30, 26, 12, OLIVE, 800) +
    '<path d="M0 12 L' + f(Math.cos(a) * 30) + ' ' + f(12 + Math.sin(a) * 30) + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/><circle cx="0" cy="12" r="4" fill="' + INK + '"/>';
}
function bubble(x, y, w, h, inner, k) {   // a speech bubble from the brain
  k = pop(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<path d="M' + f(-w / 2) + ' ' + f(-h / 2) + ' h' + f(w) + ' v' + f(h) + ' h' + f(-w * .5 + 16) + ' l-26 22 l4 -22 h' + f(-w * .5 + 6) + ' Z" fill="#f6efe0" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' + inner);
}
// a flat graph: axes, a line that draws itself left to right. pts in 0..1 (x right, y up).
function graph(x, y, w, h, pts, k, col, labels) {
  var d = pts.map(function (p, i) { return (i ? "L" : "M") + f(x + p[0] * w) + " " + f(y + h - p[1] * h); }).join(" ");
  var s = '<path d="M' + f(x) + ' ' + f(y - 10) + ' V' + f(y + h) + ' H' + f(x + w + 10) + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  return s + draw(d, k, col || ORANGE, 5) + (labels || "");
}

// ═════════ shots ═════════
// line starts: 4 essential fat · 5 rule · 6 fat talks · 7 why her · 8 77,000 · 9 burgers · 10 hips & thighs · 11 breastfeeding
// 12 leptin · 13 more fat more leptin · 14 reaches the brain · 15 fat drops · 16 period off · 17 estrogen · 18 bones · 19 thin
// 20 myth · 21 bodybuilders · 22 battery · 23 the experiment

// 4a: the two people with their fat bars and the «essential» line
function bars(u, t, lowK) {
  var s = "", base = 700, H = 380, lineY = base - H * .32;
  [[150, 0.16, 0.10, "الراجل"], [340, 0.40, 0.30, "الست"]].forEach(function (b, i) {
    var lv = lerp(b[1], b[2] * (i ? 1 : 1), 0), drop = i === 1 ? lowK : 0, cur = lerp(b[1], 0.2, drop);
    s += R(b[0] - 50, base - H, 100, H, "#f6efe0", 2.4, 6);
    s += '<rect x="' + f(b[0] - 44) + '" y="' + f(base - H * cur * at(u, .1 + i * .3, .8)) + '" width="88" height="' + f(H * cur * at(u, .1 + i * .3, .8)) + '" fill="' + FAT + '"/>' + '<rect x="' + f(b[0] - 44) + '" y="' + f(base - H * cur * at(u, .1 + i * .3, .8)) + '" width="88" height="' + f(H * cur * at(u, .1 + i * .3, .8)) + '" fill="url(#hatch)" opacity=".45"/>';
    s += T(b[3], b[0], base + 40, 28, INK, 800);
  });
  s += draw("M60 " + f(lineY + 70) + " H240", at(u, 1.1, .6), ORANGE, 4, ' stroke-dasharray="10 6"') + draw("M250 " + f(lineY - 20) + " H430", at(u, 1.3, .6), ORANGE, 4, ' stroke-dasharray="10 6"');
  return s;
}
shot(4, push(260, 430, 0.98, 1.06), function (u, d, t) {
  return paper() + bars(u, t, 0) + tag("الدهون الأساسية", 250, 200, at(u, 1.6, .5), 30, OLIVE) +
    numBox("2–5%", 150, 600, at(u, .9, .4), 26) + numBox("10–13%", 340, 540, at(u, 1.2, .4), 26);
});
shot([4, 1], push(400, 420, 1.0, 1.1), function (u, d, t) {
  var s = paper() + bars(5, t, at(u, .2, 1.4)) + tag("الدهون الأساسية", 250, 200, 1, 30, OLIVE);
  // below the line the body starts switching things off: three small lights going out
  ["الدورة", "العضم", "الهرمونات"].forEach(function (w, i) { var k = at(u, 1.2 + i * .35, .3), on = 1 - k;
    s += C(560, 330 + i * 90, 18, mixC("#f2d36b", "#9a958a", k), 2) + (on > .5 ? '<circle cx="560" cy="' + (330 + i * 90) + '" r="' + f(26 + 3 * Math.sin(t * 6 + i)) + '" fill="none" stroke="#f2d36b" stroke-width="3" opacity=".7"/>' : "") + T(w, 530, 338 + i * 90, 22, k > .5 ? MUTE : INK, 700, "start"); });
  return s;
});
// 5: the rule — one fat cell, a storeroom
shot(5, push(320, 400, 1.12, 1.0), function (u, d, t) {
  return paper() + adipose(320, 400, 520, 520, 72, 0.95, t, { circle: 250, breathe: true }) + label(320, 400, 470, 130, "خلية دهون", OLIVE, at(u, .6, .6), 26);
}, { tr: "in" });
// 6: storeroom + messages to the brain
shot(6, push(300, 470, 1.0, 0.9), function (u, d, t) {
  var s = paper() + adipose(250, 560, 380, 380, 56, 0.95, t, { circle: 180, breathe: true });
  s += iconBox(500, 520, 120, G("scale(1.3)", '<path d="M-26 -6 L0 -22 L26 -6 V22 H-26 Z" fill="#c9a77c" stroke="' + INK + '" stroke-width="2"/><rect x="-10" y="4" width="20" height="18" fill="' + INK + '"/>') + T("مخزن", 0, 50, 18, OLIVE, 800), at(u, .2, .35));
  // the head outline top right, envelopes flying up to it
  s += G("translate(400 40) scale(.44)", brainCut(t, { hyp: .4 }));
  var k = at(u, 1.1, .4);
  for (var i = 0; i < 3; i++) { var pu = ((u * .5 + i / 3) % 1), x = lerp(300, 470, pu), y = lerp(440, 120, pu);
    s += G('translate(' + f(x) + ' ' + f(y) + ') rotate(-25)', '<rect x="-20" y="-13" width="40" height="26" fill="#f6efe0" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -13 L0 3 L20 -13" fill="none" stroke="' + INK + '" stroke-width="2"/>', k); }
  return s + tag("رسايل للمخ", 470, 330, at(u, 1.6, .4), 26, ORANGE);
});
hud(6, 8, function (u, t) { return tag("الدهون = مخزن + رسايل", 320, 70, pop(clamp(u / .4)), 24, OLIVE); });
// 7: why her? the woman, puzzled, then the womb
shot(7, push(320, 420, 1.15, 1.25), function (u, d, t) {
  var p = woman(320, 420, 1.45, t, { face: { brows: "raised", mouth: "o", look: [.3, -.4] }, head: { tilt: -8 } });
  return paper() + p.svg + T("؟", 470, 230, 110, ORANGE, 800);
});
shot([7, 1], push(320, 420, 1.0, 1.08), function (u, d, t) {
  var gr = at(u, 1.0, 2.2);
  return paper() + uterusFront(320, 420, 1.55, t, { grow: gr * .9, ov: 0, lining: 1 }) + label(320, 420 - (60 + 45 * gr) * 1.4, 470, 150, "الرحم", OLIVE, at(u, .3, .6), 26) + tag("أغلى حاجة", 160, 680, at(u, .6, .4), 28, ORANGE);
});
// 8: the pregnancy in a side cut, a counter running to 77,000 calories
shot(8, push(340, 430, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 0, 3.2);
  return paper() + pregnancyCut(t, .45 + .55 * k) + G("translate(0 0)", numBox(count(77000, at(u, .4, 2.4)), 520, 120, at(u, .3, .3), 30)) + T("سعر حراري زيادة", 520, 175, 22, ORANGE, 800);
});
// 9: burgers piling up to 130
shot(9, push(320, 420, 0.94, 1.0), function (u, d, t) {
  var s = paper(), n = Math.floor(130 * at(u, .1, 1.7));
  for (var i = 0; i < n; i++) { var c = i % 10, r = Math.floor(i / 10); s += burger(78 + c * 54, 718 - r * 38, 1.05); }
  return s + '<rect x="200" y="40" width="240" height="96" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' + N(String(n), 320, 112, 64, ORANGE);
});
// 10: where it's kept — the pelvis and the legs, then the thigh cut across (her fat layer is thick)
shot(10, push(330, 410, 1.0, 1.06), function (u, d, t) {
  var p = woman(330, 380, 1.4, t, { face: { mouth: "smile" }, arms: HANDS_IN(330, 380, 1.4) });
  return paper() + p.svg + fatZones(330, 380, 1.4, "f", at(u, .3, .6), t, true) + label(270, 380, 120, 300, "الحوض", OLIVE, at(u, .8, .5), 26) + label(272, 470, 120, 560, "الرجلين", OLIVE, at(u, 1.2, .5), 26);
});
shot([10, 2], push(320, 400, 1.06, 1.0), function (u, d, t) {
  var s = paper() + thighCut(300, 400, 220, 62, t, { hl: true });
  s += labelUp(300, 214, 470, 120, "الدهون", OLIVE, at(u, .3, .5), 28) + labelUp(318, 370, 500, 640, "العضم", INK, at(u, .6, .5), 24) + labelUp(200, 480, 130, 680, "العضلات", MUSCD, at(u, .9, .5), 24);
  return s + iconBox(110, 110, 120, G("scale(1.4)", bag()) + T("طوارئ", 0, 50, 18, ORANGE, 800), at(u, 1.1, .35));
}, { tr: "in" });
// 11: after the birth, the store pays for the milk
shot(11, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var p = woman(320, 420, 1.5, t, { face: { mouth: "smile", look: [-.4, .7] }, head: { tilt: 8, nod: .12 }, arms: [{ to: [320 + 28 * 1.5, 420 - 62 * 1.5], bend: 1, hand: "relaxed" }, { to: [320 + 30 * 1.5, 420 - 90 * 1.5], bend: -1, hand: "relaxed" }] });
  var s = paper() + p.svg + fatZones(320, 420, 1.5, "f", 1 - .4 * at(u, .6, 1.4), t, false);
  // the baby wrapped in a blanket, in her arms
  s += G("translate(312 312) rotate(-8) scale(1.05)", '<ellipse cx="0" cy="0" rx="58" ry="30" fill="#e9e1cc" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 -24 Q0 -6 26 -26" stroke="#d1c6ab" stroke-width="2" fill="none"/>' + C(-36, -6, 22, SKIN, 2.2) + '<path d="M-44 -6 q4 3 8 0 M-36 -6 q4 3 8 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>');

  [-1, 1].forEach(function (sd) { s += arrow(320 + sd * 62, 470, 320 + sd * 34, 330, ORANGE, 4, at(u, .8 + (sd + 1) * .2, .6)); });
  return s + tag("الرضاعة", 520, 160, at(u, .5, .4), 28, BLUE);
});
// 12: how does fat talk? the tissue down the microscope, then the leptin dots
shot(12, push(320, 400, 1.15, 1.04), function (u, d, t) {
  return paper() + adipose(320, 400, 600, 640, 60, 0.95, t, { vessel: [-20, 620, 680, 300], vw: 22, leptin: 0, breathe: true }) + T("؟", 320, 140, 120, ORANGE, 800);
}, { tr: "in" });
shot([12, 1], push(320, 420, 1.04, 1.12), function (u, d, t) {
  return paper() + adipose(320, 400, 600, 640, 60, 0.95, t, { vessel: [-20, 620, 680, 300], vw: 22, leptin: at(u, .2, .8) * .9, breathe: true }) + tag("اللبتين", 320, 110, at(u, .5, .4), 34, ORANGE);
});
// 13: every cell puts leptin in the blood; more fat, more leptin
shot(13, push(330, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + adipose(320, 400, 600, 640, 60, 0.95, t, { vessel: [-20, 620, 680, 300], vw: 22, leptin: 1, breathe: true }) + labelUp(230, 515, 150, 720, "الدم", BLOODC, at(u, .5, .5), 26);
});
shot([13, 1], push(320, 400, 1.04, 1.0), function (u, d, t) {
  var k = at(u, .2, 1.6), s = paper();
  s += adipose(170, 380, 290, 290, 30, .35, t, { circle: 140, vessel: [20, 540, 320, 220], vw: 12, leptin: .25 }) + adipose(470, 380, 290, 290, 44, .98, t, { circle: 140, vessel: [320, 540, 620, 220], vw: 12, leptin: lerp(.25, 1, k) });
  s += T("دهون قليلة", 170, 570, 26, INK, 800) + T("دهون أكتر", 470, 570, 26, INK, 800) ;
  return s + numBox("لبتين +", 470, 600, at(u, .9, .4), 28);
});
// 14: the leptin reaches the brain: «we have enough fuel»
shot(14, push(320, 330, 1.0, 1.1), function (u, d, t) {
  return paper() + brainCut(t, { hyp: at(u, 1, .5), dots: 1 }) + labelUp(352, 304, 520, 580, "الهيبوثالامس", OLIVE, at(u, 1.1, .5), 24) +
    bubble(470, 110, 220, 92, T("عندنا وقود كفاية", 0, 4, 22, INK, 800) + G("translate(0 26) scale(.5)", ""), at(u, 1.8, .4)) + iconBox(110, 110, 110, G("translate(0 -4) scale(1.15)", gauge(.95)), at(u, 2.0, .4));
}, { tr: "in" });
// 15: the fat drops, the cells empty out; the message goes quiet
shot(15, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .1, 1.6);
  return paper() + adipose(320, 400, 600, 640, 60, lerp(.95, .3, k), t, { vessel: [-20, 620, 680, 300], vw: 22, leptin: lerp(1, .12, k) }) + arrow(560, 160, 560, 300, ORANGE, 7, at(u, .2, .5)) + numBox("دهون ↓", 470, 110, at(u, .1, .4), 26);
});
shot([15, 1], push(320, 330, 1.08, 1.0), function (u, d, t) {
  var k = at(u, .1, .8);
  return paper() + brainCut(t, { hyp: 1 - k * .7, dots: .15 * (1 - k), quiet: k }) + bubble(470, 110, 220, 92, T("…", 0, 12, 44, MUTE, 800), at(u, .3, .4)) + iconBox(110, 110, 110, G("translate(0 -4) scale(1.15)", gauge(lerp(.95, .05, k))), 1);
});
// 16: the brain switches off the period: the signal down to the ovaries stops; the phone analogy; the calendar
shot(16, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, 1.2), s = paper();
  s += G("translate(40 20) scale(.5)", brainCut(t, { hyp: 1 - k, pit: 1 - k }));
  s += uterusFront(380, 600, .95, t, { ov: 1, lining: 1, off: k * .85 });
  s += draw("M225 200 C300 260 360 400 380 520", 1, k > .5 ? MUTE : ORANGE, 4, ' stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '"');
  s += G("translate(330 330)", cross(0, 0, .8, at(u, 1.4, .4)));
  return s + labelUp(254, 596, 160, 700, "المبيض", OLIVE, at(u, .3, .5), 24);
});
shot([16, 1], push(320, 400, 1.04, 1.0), function (u, d, t) {
  var k = at(u, .1, 1.4);
  return paper() + G("translate(320 360) scale(3.2)", phone(lerp(.8, .12, k), t)) + T("بيقفل اللي مش ضروري", 320, 720, 28, INK, 800);
}, { tr: "in" });
// 17: no period: the month's calendar loses its days; then estrogen drops: the ovary and a falling line
shot(17, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + calendar(320, 420, 2.0, true, at(u, .2, .5), t) + tag("الدورة", 320, 110, at(u, .05, .3), 30, ORANGE);
});
shot([17, 1], push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + uterusFront(320, 230, .9, t, { ov: .6, lining: .3, off: .5 });
  s += graph(90, 420, 460, 240, [[0, .8], [.2, .78], [.35, .74], [.5, .55], [.65, .3], [.8, .2], [1, .18]], at(u, .2, 1.4), BLUE, T("الإستروجين", 100, 404, 24, BLUE, 800, "end") + T("الوقت", 560, 700, 20, MUTE, 700));
  return s + arrow(500, 470, 540, 590, ORANGE, 5, at(u, 1.2, .4));
});
// 18: estrogen keeps the bones strong: the femur, cut open at the top
shot(18, push(320, 390, 0.98, 1.04), function (u, d, t) {
  var s = paper() + femur(330, 150, 1.1, t, { cut: true, loss: 0 });
  for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2 + t * .8, r = 150 + 10 * Math.sin(t * 3 + i); s += '<circle cx="' + f(300 + Math.cos(a) * r) + '" cy="' + f(200 + Math.sin(a) * r * .7) + '" r="6" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(at(u, .3, .5)) + '"/>'; }
  return s + label(276, 140, 130, 320, "العضم", OLIVE, at(u, .6, .5), 26) + check(520, 140, 1.2, at(u, 1.2, .4), OLIVE);
});
// 19: the bone thins: spongy bone up close, struts breaking, holes growing; even in your twenties
shot(19, push(320, 390, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .3, 2.2);
  return paper() + trabecular(320, 380, 250, lerp(0, .75, k), t) + tag(k < .5 ? "عضم سليم" : "عضم بيخف", 320, 700, 1, 28, k < .5 ? OLIVE : ORANGE);
}, { tr: "in" });
shot([19, 1], push(320, 420, 1.12, 1.2), function (u, d, t) {
  var p = woman(210, 420, 1.4, t, { face: { brows: "worried", mouth: "frown", look: [.5, -.2] } });
  return paper() + p.svg + inset(470, 300, 105, trabecular(0, 0, 105, .75, t), at(u, .1, .4)) + numBox("20+", 470, 470, at(u, .5, .4), 34);
});
// 20: the myth: less fat is always better? no.
shot(20, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + bars(5, t, 0), k = at(u, .2, 1.2);
  s += '<rect x="296" y="' + f(700 - 380 * lerp(.4, .12, k)) + '" width="88" height="' + f(380 * lerp(.4, .12, k)) + '" fill="#e3b23c" opacity=".35"/>' + arrow(480, 300, 480, 560, ORANGE, 6, at(u, .2, .6));
  s += check(560, 150, 1.1, at(u, .6, .3), OLIVE);
  var ck = at(u, LN[20].end - LN[20].start - 1.0, .3);
  if (ck > 0) s += '<rect x="510" y="100" width="100" height="100" fill="' + PAPER + '"/>' + cross(560, 150, 1.4, ck);
  return s;
});
// 21: bodybuilders: a year of body fat, dipping to the low numbers for a few days around the contest, then back up
shot(21, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var pts = [[0, .55], [.2, .5], [.4, .38], [.55, .2], [.6, .08], [.64, .08], [.7, .3], [.8, .5], [1, .55]];
  var s = paper() + graph(70, 260, 500, 300, pts, at(u, .2, 2.2), ORANGE, T("نسبة الدهون", 80, 244, 22, INK, 800, "end") + T("السنة", 580, 600, 20, MUTE, 700));
  s += G("translate(380 220)", '<path d="M-18 -30 h36 v14 q0 22 -18 26 q-18 -4 -18 -26 Z" fill="#e3b23c" stroke="' + INK + '" stroke-width="2"/><path d="M-18 -24 q-14 0 -12 10 q2 8 12 6 M18 -24 q14 0 12 10 q-2 8 -12 6" fill="none" stroke="' + INK + '" stroke-width="2"/><rect x="-5" y="10" width="10" height="12" fill="#e3b23c" stroke="' + INK + '" stroke-width="1.6"/><rect x="-14" y="22" width="28" height="8" fill="' + INK + '"/>', at(u, 1.4, .4));
  s += measure(368, 600, 396, 600, at(u, 2.0, .4), "") + tag("أيام قليلة", 382, 690, at(u, 2.2, .4), 26, ORANGE);
  return s;
});
shot([21, 2], push(320, 420, 1.0, 1.06), function (u, d, t) {
  var p = man(320, 420, 1.45, t, { face: { brows: "worried", mouth: "frown", tired: true }, head: { nod: .1 } });
  return paper() + p.svg + cross(500, 220, 1.2, at(u, .5, .4)) + tag("مش بيعيشوا بيها", 320, 90, at(u, .2, .4), 26, INK);
});
// 22: the recap: the fat isn't extra; it is a battery running her hormones, her cycle and her bones
shot(22, push(320, 420, 1.08, 1.14), function (u, d, t) {
  var p = woman(320, 420, 1.4, t, { face: { mouth: "smile" }, arms: HANDS_IN(320, 420, 1.4) });
  return paper() + p.svg + fatZones(320, 420, 1.4, "f", 1, t, true) + tag("زيادة", 130, 260, at(u, .3, .3), 30, INK) + cross(130, 255, 1.1, at(u, 1.0, .4));
});
shot([22, 2], push(320, 400, 1.02, 1.1), function (u, d, t) {
  var p = woman(150, 430, 1.3, t, { face: { mouth: "smile" }, arms: HANDS_IN(150, 430, 1.3) }), k = at(u, .3, 2.2);
  return paper() + p.svg + fatZones(150, 430, 1.3, "f", 1, t, true) + battery(280, 330, 330, 110, k, [BLUE, BLUE, BLUE], ["هرمونات", "دورة", "عضم"], k) + tag("البطارية", 445, 250, at(u, .1, .4), 30, ORANGE) +
    draw("M200 470 C240 470 250 400 280 390", at(u, .2, .5), ORANGE, 4, ' stroke-dasharray="8 6"');
});
// 23: the experiment: women whose periods had stopped got leptin shots alone; in 3 of 8 the cycle came back
shot(23, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper();
  for (var i = 0; i < 8; i++) { var x = 90 + (i % 4) * 150, y = 340 + Math.floor(i / 4) * 290;
    s += woman(x, y, .62, t, { ph: i, face: { brows: "worried" } }).svg + calendar(x, y - 175, .22, true, at(u, 1.2 + i * .06, .3), t); }
  return s + numBox("2004", 320, 92, at(u, .2, .4), 28);
});
shot([23, 2], push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + syringe(330, 320, 2.2, -20, at(u, .4, 1.2)) + tag("لبتين بس", 320, 500, at(u, .1, .4), 34, ORANGE);
}, { tr: "in" });
shot([23, 3], push(320, 420, 1.04, 1.0), function (u, d, t) {
  var s = paper();
  for (var i = 0; i < 8; i++) { var x = 90 + (i % 4) * 150, y = 340 + Math.floor(i / 4) * 290, back = i === 1 || i === 4 || i === 6, k = at(u, .25 + i * .06, .4);
    s += woman(x, y, .62, t, { ph: i, face: { mouth: back && k > .5 ? "smile" : "neutral" } }).svg + (back ? check(x, y - 160, .8, k, OLIVE) : ""); }
  return s + numBox("3 من 8", 320, 92, at(u, .5, .4), 28);
});

// ═════════ the opening card, the bumper and the summary art ═════════
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // the two people side by side; line 1 shows his small fat store and «2–5%», line 2 hers and «10–13%»
  var s = "", y = 330, sc = 1.38;
  var M = man(170, y, sc, t, { face: { mouth: li === 1 ? "smile" : "neutral" }, arms: [{ to: [170 - 62 * sc, y + 4 * sc] }, { to: [170 + 62 * sc, y + 4 * sc] }] }), W = woman(430, y, sc, t, { face: { mouth: li === 2 ? "smile" : "neutral", look: li >= 1 ? [-.4, 0] : [0, 0] }, arms: HANDS_IN(430, y, sc) });
  s += (li === 2 ? dim(.6, M.svg) : M.svg) + W.svg;
  var k0 = clamp(t / .6), k1 = li >= 1 ? clamp((t - LN[1].start) / .5) : 0, k2 = li >= 2 ? clamp((t - LN[2].start) / .5) : 0;
  s += fatZones(170, y, sc, "m", li === 0 ? .4 * k0 : li === 1 ? lerp(.4, 1, k1) : .5, t, li === 1);
  s += fatZones(430, y, sc, "f", li <= 1 ? .4 * k0 : lerp(.4, 1, k2), t, li === 2);
  if (li >= 1) s += numBox("2–5%", 170, 30, k1, 30);
  if (li >= 2) s += numBox("10–13%", 430, 30, k2, 30);
  return s;
};
SCENE.bumper = function (u, t) { return adipose(90, 112, 160, 160, 26, .95, t, { breathe: true }); };
SCENE.outro = function (svg, u, t) {
  var W = woman(110, 150, .5, t, { face: { mouth: "smile" }, arms: HANDS_IN(110, 150, .5) });
  return W.svg + fatZones(110, 150, .5, "f", 1, t, false) + adipose(250, 140, 110, 110, 18, .95, t, { circle: 50 }) +
    G("translate(330 -20) scale(.36)", brainCut(t, { hyp: 1, dots: 1 }).replace(/<rect x="232"[^>]*>/g, "")) + femur(530, 52, .36, t, { cut: true }) +
    callout("1", 110, 120, ease(u / .3)) + callout("2", 250, 70, ease(u / .3 - .5)) + callout("3", 420, 60, ease(u / .3 - 1)) + callout("4", 560, 40, ease(u / .3 - 1.5));
};
