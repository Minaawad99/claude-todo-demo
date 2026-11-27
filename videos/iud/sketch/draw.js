/* «اللولب» — the episode's own drawings (sketch style). Self-contained SVG builders used by shots.js and review.html.
   Anatomy after refs/Scheme_female_reproductive_system-en.png (CDC / Mysid, public domain): a front (coronal) cut of the
   uterus — the thick muscle wall (myometrium), the lining (endometrium), the flat triangular cavity, the narrow cervical
   canal opening into the top of the vagina, the two Fallopian tubes leaving the upper corners with their fringed ends
   over the ovaries. The devices after refs/Copper_IUD.jpg (a copper T: white T frame, copper wire wound on the stem and
   sleeves on the arms, a bead and two threads; about 3.2 × 3.6 cm) and refs/Mirena_IntraUterine_System.jpg (a hormonal
   T: the same frame with a white hormone cylinder on the stem, dark threads). Drawn in our own hand.
   Local units: the uterus is drawn around (0,0) = the middle of the fundus inside; s scales it. */
var IU = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0";
var MYO = "#e4a797", MYOD = "#c98777", ENDO = "#c8716a", ENDOD = "#a9564f", CAV = "#f7e4db", VAG = "#e9b9ab", VAGD = "#d39d8f",
    TUBE = "#dc9384", TUBED = "#b96f62", OVA = "#efd9a6", OVAD = "#d9bd82", MUC = "#a9c0cf", MUCD = "#7f9db1", COP = "#b8692f", COPL = "#e09a5c",
    PLAST = "#f6f3ea", HORM = "#f1ecdc", THREAD = "#3a2a22", WBC = "#c9c3df", WBCN = "#6f5f9e", EGGC = "#f3e6b8", SPERM = "#f8f4ea";
function f(n) { return (+n).toFixed(1); }
function now() { return (typeof window !== 'undefined' && window.__t) || 0; }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// smooth path through points (quadratic midpoints)
function sm(pts, close) {
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  if (close) { var m0 = [(pts[pts.length - 1][0] + pts[0][0]) / 2, (pts[pts.length - 1][1] + pts[0][1]) / 2]; d = "M" + f(m0[0]) + " " + f(m0[1]); for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); } return d + " Z"; }
  for (var j = 1; j < pts.length; j++) { var m = [(pts[j - 1][0] + pts[j][0]) / 2, (pts[j - 1][1] + pts[j][1]) / 2]; d += " Q" + f(pts[j - 1][0]) + " " + f(pts[j - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  var L = pts[pts.length - 1]; return d + " L" + f(L[0]) + " " + f(L[1]);
}
function mir(pts) { return pts.map(function (p) { return [-p[0], p[1]]; }); }
function path(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round" stroke-linecap="round"' + (ex || "") + '/>'; }
function ln(pts, col, w, ex) { return '<path d="' + sm(pts) + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }

// ── the uterus, front cut ──
// right half outlines (x > 0); mirrored for the left
var OUT_R = [[0, -44], [70, -40], [128, -22], [158, 10], [166, 52], [156, 112], [132, 176], [100, 232], [74, 268], [62, 296], [60, 340], [58, 372], [50, 392], [26, 402]];
var OUT = mir(OUT_R.slice().reverse()).concat(OUT_R.slice(1));
var CAVITY = [[-118, 22], [-60, 10], [0, 8], [60, 10], [118, 22], [64, 128], [22, 220], [0, 252], [-22, 220], [-64, 128]];
function endoShape(e) {   // the lining: the cavity grown by e on every side (e = thickness, ~24 normal, ~8 thin)
  return [[-118 - e * 1.3, 22 - e * .9], [-60, 10 - e], [0, 8 - e], [60, 10 - e], [118 + e * 1.3, 22 - e * .9], [64 + e, 128 + e * .3], [22 + e * .8, 220 + e * .4], [0, 252 + e * .3], [-22 - e * .8, 220 + e * .4], [-64 - e, 128 + e * .3]];
}
var CANAL_R = [[0, 252], [7, 270], [12, 300], [13, 340], [9, 375], [7, 398]];
var CANAL = CANAL_R.concat(mir(CANAL_R.slice().reverse()));
// the vagina below: walls around the cervix (the fornices) going down out of frame
var VAG_R_OUT = [[60, 300], [104, 316], [122, 362], [110, 440], [96, 540], [92, 720]];
var VAG_R_IN = [[60, 336], [80, 372], [86, 406], [72, 450], [58, 540], [54, 720]];
// the Fallopian tube (right; mirrored for left): from the upper corner out, up and over, down to the fringed end
var TUBE_R = [[150, 14], [196, 0], [244, -10], [286, -2], [316, 22], [330, 58], [326, 92]];
var OVARY_R = [262, 96, 40, 25, -18];

function cavityClip(id, e) { return '<clipPath id="' + id + '"><path d="' + sm(e ? endoShape(e) : CAVITY, true) + '"/></clipPath>'; }
var UID = 0;
/* uterus(cx, cy, s, o) — o: endo (lining thickness, default 24), mucus (0 watery .. 1 thick jelly), tubes (default true),
   vagina (default true), egg (0..1 shown), side ("l" | "r" | "both", which tubes), inner(svg drawn inside the cavity clip, local
   units), over (svg on top, local units), hl ("cervix" | "cavity" | "tube" | "endo": that part glows orange), dim (0..1). */
function uterus(cx, cy, s, o) {
  o = o || {}; var e = o.endo == null ? 24 : o.endo, id = "uc" + (++UID), t = now(), s2 = "";
  var br = 1 + .006 * Math.sin(t * 1.3);   // the muscle breathes very slightly
  // vagina
  if (o.vagina !== false) {
    var wallR = VAG_R_OUT.concat(VAG_R_IN.slice().reverse()), wallL = mir(wallR);
    s2 += '<path d="' + sm(VAG_R_IN.concat(mir(VAG_R_IN).reverse()), true) + '" fill="#f3d6cb"/>';   // the canal
    s2 += path(sm(wallR, true), VAG, 2) + path(sm(wallL, true), VAG, 2);
    for (var r = 0; r < 8; r++) { var y = 456 + r * 32; s2 += ln([[62 + r * .2, y], [76, y - 6], [90 + r * .2 - (r < 2 ? 6 : 0), y + 2]], VAGD, 2) + ln([[-62 - r * .2, y], [-76, y - 6], [-90 - r * .2 + (r < 2 ? 6 : 0), y + 2]], VAGD, 2); }   // the rugae
  }
  // tubes and ovaries
  if (o.tubes !== false) {
    [1, -1].forEach(function (sg) {
      if (o.side === "l" && sg > 0 || o.side === "r" && sg < 0) return;
      var tp = TUBE_R.map(function (p) { return [p[0] * sg, p[1]]; }), ov = OVARY_R;
      s2 += '<path d="M' + f(150 * sg) + ' 40 Q' + f(210 * sg) + ' 70 ' + f((ov[0] - 30) * sg) + ' ' + f(ov[1] - 4) + '" stroke="' + MYOD + '" stroke-width="7" fill="none" stroke-linecap="round"/>';   // the ovarian ligament
      s2 += '<ellipse cx="' + f(ov[0] * sg) + '" cy="' + ov[1] + '" rx="' + ov[2] + '" ry="' + ov[3] + '" transform="rotate(' + (ov[4] * sg) + ' ' + f(ov[0] * sg) + ' ' + ov[1] + ')" fill="' + OVA + '" stroke="' + INK + '" stroke-width="2"/>';
      for (var k = 0; k < 6; k++) s2 += '<circle cx="' + f((ov[0] - 24 + hash(k + 3) * 46) * sg) + '" cy="' + f(ov[1] - 12 + hash(k + 9) * 22) + '" r="' + f(3 + hash(k) * 5) + '" fill="#f7ebc9" stroke="' + OVAD + '" stroke-width="1.4"/>';   // follicles
      s2 += ln(tp, INK, 24) + ln(tp, sg * 1 === 1 && o.hl === "tubeR" || o.hl === "tube" ? "#e3a08f" : TUBE, 20) + ln(tp, TUBED, 4);   // the tube and its narrow channel
      var end = tp[tp.length - 1];
      for (var fr = 0; fr < 7; fr++) { var a = (-.2 + fr * .23) * Math.PI, L = 16 + hash(fr + 20) * 10 + 2 * Math.sin(t * 1.4 + fr); s2 += ln([[end[0], end[1]], [end[0] + Math.cos(a + .6) * L * .5 * sg, end[1] + Math.sin(a + .6) * L * .5 + 6], [end[0] + Math.cos(a + .9) * L * sg, end[1] + Math.abs(Math.sin(a + .9)) * L + 4]], INK, 8) + ln([[end[0], end[1]], [end[0] + Math.cos(a + .6) * L * .5 * sg, end[1] + Math.sin(a + .6) * L * .5 + 6], [end[0] + Math.cos(a + .9) * L * sg, end[1] + Math.abs(Math.sin(a + .9)) * L + 4]], TUBE, 5); }   // the fringes
    });
  }
  // the muscle wall
  s2 += '<g transform="translate(0 120) scale(' + br.toFixed(4) + ') translate(0 -120)">';
  s2 += path(sm(OUT, true), MYO, 2.4) + '<path d="' + sm(OUT, true) + '" fill="url(#hatch)" opacity=".55"/>';
  for (var m = 0; m < 7; m++) { var yy = -10 + m * 40, w = 150 - m * 14; s2 += ln([[-w, yy + 8], [-w * .6, yy], [-w * .25, yy + 6]], MYOD, 1.6, ' opacity=".7"') + ln([[w, yy + 8], [w * .6, yy], [w * .25, yy + 6]], MYOD, 1.6, ' opacity=".7"'); }   // muscle fibres
  // lining, cavity, canal
  s2 += path(sm(endoShape(e), true), o.hl === "endo" ? "#d4806f" : ENDO, 1.6);
  for (var v = 0; v < 18; v++) { var p0 = endoShape(e)[v % 10], p1 = CAVITY[v % 10], kk = .3 + hash(v) * .4; s2 += ln([[p0[0] + (p1[0] - p0[0]) * .2, p0[1] + (p1[1] - p0[1]) * .2], [p0[0] + (p1[0] - p0[0]) * kk + 4, p0[1] + (p1[1] - p0[1]) * kk]], ENDOD, 1.4); }   // glands in the lining
  s2 += path(sm(CAVITY, true), o.hl === "cavity" ? "#fbd9c4" : CAV, 2);
  var mu = o.mucus == null ? 0 : o.mucus;
  s2 += path(sm(CANAL, true), o.hl === "cervix" ? "#f6c7b0" : CAV, 1.8);
  if (mu > 0) {   // cervical mucus: watery strands, or a thick blue jelly plug that fills the canal
    s2 += '<path d="' + sm(CANAL, true) + '" fill="' + MUC + '" opacity="' + f(.25 + .65 * mu) + '"/>';
    for (var q = 0; q < 9; q++) { var yq = 262 + q * 15, wq = 6 + 4 * Math.sin(q); s2 += '<path d="M' + f(-wq) + ' ' + f(yq + 3 * Math.sin(t * 1.5 + q)) + ' Q0 ' + f(yq - 6) + ' ' + f(wq) + ' ' + f(yq + 3 * Math.cos(t * 1.5 + q)) + '" stroke="' + MUCD + '" stroke-width="' + f(1 + 1.6 * mu) + '" fill="none" opacity="' + f(.4 + .6 * mu) + '"/>'; }
  }
  if (o.inner) s2 += cavityClip(id, 0) + '<g clip-path="url(#' + id + ')">' + o.inner + '</g>';
  s2 += '</g>';
  if (o.over) s2 += o.over;
  var g = '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + s + ')">' + s2 + '</g>';
  return o.dim ? '<g opacity="' + f(1 - .6 * o.dim) + '">' + g + '</g>' : g;
}
// points along the sperm route, local uterus units: vagina → canal → cavity → left corner → left tube (to the egg)
var ROUTE = [[0, 640], [0, 520], [0, 420], [0, 330], [0, 250], [-20, 170], [-60, 90], [-110, 30], [-160, 8], [-205, -4], [-240, -9]];
var EGG = [-262, -6];
function routeAt(k) { k = clamp(k) * (ROUTE.length - 1); var i = Math.min(ROUTE.length - 2, Math.floor(k)), u = k - i, a = ROUTE[i], b = ROUTE[i + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])]; }
function routeD(k) { var d = "", n = 60; for (var i = 0; i <= n * clamp(k); i++) { var p = routeAt(i / n); d += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]); } return d; }

// ── the egg (ovum) with its corona of cells ──
function egg(x, y, r, k) {
  if (k <= 0) return ""; var s = "", t = now();
  for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI * 2 + t * .1; s += '<circle cx="' + f(x + Math.cos(a) * r * 1.25) + '" cy="' + f(y + Math.sin(a) * r * 1.25) + '" r="' + f(r * .28) + '" fill="#f1d7a0" stroke="' + INK + '" stroke-width="1"/>'; }
  return '<g opacity="' + f(k) + '">' + s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + EGGC + '" stroke="' + INK + '" stroke-width="1.8"/><circle cx="' + f(x - r * .2) + '" cy="' + f(y - r * .1) + '" r="' + f(r * .32) + '" fill="#d8b46a" stroke="' + INK + '" stroke-width="1.2"/></g>';
}
// ── a sperm cell: oval head, midpiece, beating tail. ang = heading (rad). dead: grey, still, bent ──
function sperm(x, y, ang, s, ph, o) {
  o = o || {}; var dead = o.dead || 0, slow = o.slow == null ? 1 : o.slow, t = now(), d = "", L = 46;
  for (var i = 0; i <= 16; i++) { var u = i / 16, amp = (1 - dead) * 5 * u * slow + dead * 9 * u * u, xx = -10 - u * L, yy = amp * Math.sin(u * 7 - (t * 14 * slow) - ph) + dead * 10 * u * u; d += (i ? " L" : "M") + f(xx) + " " + f(yy); }
  var col = dead > .5 ? "#bdb6a8" : SPERM;
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang * 180 / Math.PI) + ') scale(' + s + ')"' + (dead > .5 ? ' opacity=".75"' : "") + '>' +
    '<path d="' + d + '" stroke="' + INK + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M-3 0 L-12 0" stroke="' + INK + '" stroke-width="4.4" stroke-linecap="round"/><path d="M-3 0 L-12 0" stroke="#e8d9b8" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="4" cy="0" rx="8" ry="5.4" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="6.5" cy="0" rx="3.6" ry="3.4" fill="' + (dead > .5 ? "#cfc8ba" : "#e6ecef") + '"/>' +
    (dead > .5 ? '<path d="M-1 -3 l5 6 M4 -3 l-5 6" stroke="' + INK + '" stroke-width="1.2"/>' : "") + '</g>';
}
// ── a white blood cell: a soft lobed blob with a lobed nucleus, reaching out a little ──
function wbc(x, y, r, ph, k) {
  if (k <= 0) return ""; var t = now(), pts = [];
  for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2, rr = r * (1 + .12 * Math.sin(a * 3 + t * 1.6 + ph) + .08 * hash(i + ph * 7)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  var nu = ""; for (var j = 0; j < 3; j++) nu += '<circle cx="' + f(x - r * .3 + j * r * .3) + '" cy="' + f(y + (j % 2 ? -r * .18 : r * .12)) + '" r="' + f(r * .26) + '" fill="' + WBCN + '" stroke="' + INK + '" stroke-width="1"/>';
  var gr = ""; for (var g = 0; g < 7; g++) gr += '<circle cx="' + f(x + (hash(g + ph) - .5) * r * 1.2) + '" cy="' + f(y + (hash(g + 5 + ph) - .5) * r * 1.2) + '" r="1.4" fill="#8c80b5"/>';
  return '<g opacity="' + f(k) + '">' + path(sm(pts, true), WBC, 1.8) + gr + nu + '</g>';
}
// ── copper ions: small orange beads with a + drifting out of the coil ──
function ion(x, y, r, k) { if (k <= 0) return ""; return '<g opacity="' + f(k) + '"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + COPL + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + f(x - r * .5) + ' ' + f(y) + ' h' + f(r) + ' M' + f(x) + ' ' + f(y - r * .5) + ' v' + f(r) + '" stroke="' + INK + '" stroke-width="1.3"/></g>'; }
function ions(cx, cy, n, spread, k, t) {
  var s = ""; for (var i = 0; i < n; i++) { var u = (t * .18 + hash(i)) % 1, a = hash(i + 40) * Math.PI * 2, rr = spread * (.15 + .85 * u); s += ion(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.4, 5, k * Math.sin(u * Math.PI)); } return s;
}
// ── hormone: tiny olive dots seeping out of the cylinder ──
function hormone(cx, cy, n, spread, k, t) {
  var s = ""; for (var i = 0; i < n; i++) { var u = (t * .15 + hash(i + 3)) % 1, a = hash(i + 60) * Math.PI * 2, rr = spread * (.1 + .9 * u); s += '<circle cx="' + f(cx + Math.cos(a) * rr * .8) + '" cy="' + f(cy + Math.sin(a) * rr * 1.3) + '" r="4.6" fill="#8f9a55" stroke="' + INK + '" stroke-width="1" opacity="' + f(k * Math.sin(u * Math.PI)) + '"/>'; } return s;
}

/* ── the device: device(x, y, s, type, o) — type "copper" | "hormonal". (x,y) = the middle of the arms. At s = 1 the arms
   span ±100 and the stem runs 0 → 200 (so 1 mm ≈ 6 units), threads hang to y = 200 + o.thread (default 170).
   o.glow: 0..1 orange glow on the copper / the cylinder. o.fold: 0..1 the arms folded up (inserting). ── */
function device(x, y, s, type, o) {
  o = o || {}; var t = now(), fo = o.fold || 0, s2 = "", TL = o.thread == null ? 170 : o.thread;
  var ax = 100 * (1 - fo * .9), ay = -fo * 60;
  // threads
  if (TL > 0) s2 += ln([[-3, 214], [-6 + 2 * Math.sin(t * .9), 214 + TL * .5], [-10 + 3 * Math.sin(t * .7), 214 + TL]], THREAD, 2.2) + ln([[3, 214], [2 + 2 * Math.sin(t * .8 + 1), 214 + TL * .5], [6 + 3 * Math.sin(t * .6 + 1), 214 + TL * .97]], THREAD, 2.2);
  // frame: arms and stem
  var arm = 'M' + f(-ax) + ' ' + f(ay + 4) + ' Q' + f(-ax * .5) + ' ' + f(ay * .5 - 2) + ' 0 6 Q' + f(ax * .5) + ' ' + f(ay * .5 - 2) + ' ' + f(ax) + ' ' + f(ay + 4);
  s2 += '<path d="' + arm + '" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round"/><path d="' + arm + '" stroke="' + PLAST + '" stroke-width="8" fill="none" stroke-linecap="round"/>';
  s2 += '<path d="M0 6 L0 206" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M0 6 L0 206" stroke="' + PLAST + '" stroke-width="8" stroke-linecap="round"/>';
  s2 += '<circle cx="0" cy="210" r="8" fill="' + PLAST + '" stroke="' + INK + '" stroke-width="2"/>';
  if (type === "copper") {
    var g = o.glow || 0;
    if (g > 0) s2 += '<rect x="-30" y="30" width="60" height="170" rx="30" fill="' + ORANGE + '" opacity="' + f(.18 * g * (.7 + .3 * Math.sin(t * 3))) + '"/>';
    for (var w = 0; w < 30; w++) { var yy = 34 + w * 5.6; s2 += '<path d="M-10 ' + f(yy) + ' Q0 ' + f(yy + 4) + ' 10 ' + f(yy + 2) + '" stroke="' + INK + '" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M-10 ' + f(yy) + ' Q0 ' + f(yy + 4) + ' 10 ' + f(yy + 2) + '" stroke="' + (w % 2 ? COP : COPL) + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }   // the copper wire wound on the stem
    if (fo < .2) [-1, 1].forEach(function (sg) { s2 += '<rect x="' + f(sg > 0 ? 54 : -86) + '" y="-5" width="32" height="15" rx="4" fill="' + COP + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(sg > 0 ? 58 : -82) + ' -1 h24" stroke="' + COPL + '" stroke-width="2"/>'; });   // copper sleeves on the arms
  } else {
    var gh = o.glow || 0;
    if (gh > 0) s2 += '<rect x="-34" y="26" width="68" height="168" rx="30" fill="#8f9a55" opacity="' + f(.2 * gh * (.7 + .3 * Math.sin(t * 3))) + '"/>';
    s2 += '<rect x="-17" y="36" width="34" height="150" rx="6" fill="' + HORM + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-10 44 V178" stroke="#fff" stroke-width="4" opacity=".7"/><path d="M11 44 V178" stroke="#d8d0b8" stroke-width="3"/>';   // the hormone cylinder on the stem
  }
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + s2 + '</g>';
}
// the device inside the uterus: placed with its arms under the fundus (local uterus units)
function inUterus(type, o) { return device(0, 34, .86, type, Object.assign({ thread: 250 }, o || {})); }

// ── small icons for the boxes ──
function finger(x, y, s) {   // a fingertip seen from the back: nail, knuckle creases
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M-26 120 L-28 -10 Q-28 -48 0 -50 Q28 -48 28 -10 L26 120", "#e8b49a", 2.2) +
    path("M-15 -30 Q-15 -42 0 -43 Q15 -42 15 -30 L14 -4 Q0 2 -14 -4 Z", "#f3d6c6", 1.8) + ln([[-12, 40], [0, 36], [12, 40]], "#c9917a", 1.8) + ln([[-10, 46], [0, 43], [10, 46]], "#c9917a", 1.6) + '</g>';
}
function calendar(x, y, s, txt, col) {
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-40" y="-34" width="80" height="70" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="-34" width="80" height="18" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M-24 -42 V-28 M24 -42 V-28" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><text x="0" y="22" text-anchor="middle" style="font:800 ' + (txt.length > 4 ? 15 : 22) + 'px Noto Sans Arabic" fill="' + INK + '">' + txt + '</text></g>';
}
function thermometer(x, y, s, k) {
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-9" y="-60" width="18" height="100" rx="9" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="46" r="15" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="-4" y="' + f(40 - 92 * k) + '" width="8" height="' + f(92 * k + 6) + '" fill="' + ORANGE + '"/>' +
    [0, 1, 2, 3].map(function (i) { return '<path d="M9 ' + (-44 + i * 20) + ' h8" stroke="' + INK + '" stroke-width="1.6"/>'; }).join("") + '</g>';
}
function drop(x, y, s, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M0 -40 Q30 0 26 18 Q22 40 0 40 Q-22 40 -26 18 Q-30 0 0 -40 Z", col || "#c9c48a", 2.2) + '<path d="M-10 6 Q-12 20 -2 28" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/></g>'; }
function bolt(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M8 -44 L-20 4 L0 4 L-8 44 L22 -6 L2 -6 Z", ORANGE, 2.2) + '</g>'; }
function shield(x, y, s, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M0 -50 L40 -36 Q42 20 0 52 Q-42 20 -40 -36 Z", col || "#c9d3c0", 2.6) + path("M0 -38 L28 -28 Q30 14 0 38", "none", 1.6) + '</g>'; }
function jelly(x, y, s, t) {   // a spoonful of thick jelly in a bowl (the mucus analogy)
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M-50 0 Q-50 44 0 46 Q50 44 50 0 Z", "#e7e1d2", 2.2) + path("M-40 0 Q-36 " + f(-26 - 2 * Math.sin(t * 2)) + " -6 -30 Q24 " + f(-34 + 2 * Math.sin(t * 2)) + " 40 0 Z", MUC, 2) + '<path d="M-24 -12 Q-14 -24 0 -22" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>' + path("M-56 0 L56 0", "none", 2.4) + '</g>';
}
// a building door with a guard in front stretching his arm out (the doorman analogy) — built in shots.js with the person kit
function door(x, y, s) {
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + path("M-60 -150 L60 -150 L60 60 L-60 60 Z", "#d8c7a3", 2.4) + path("M-48 -138 L48 -138 L48 60 L-48 60 Z", "#7c5a3c", 2.2) +
    path("M-40 -128 L-4 -128 L-4 50 L-40 50 Z", "#9a7350", 1.6) + path("M4 -128 L40 -128 L40 50 L4 50 Z", "#9a7350", 1.6) + '<circle cx="-10" cy="-30" r="3.4" fill="#e0b65a" stroke="' + INK + '"/><circle cx="10" cy="-30" r="3.4" fill="#e0b65a" stroke="' + INK + '"/>' +
    path("M-90 60 L90 60", "none", 2.6) + '</g>';
}
return { uterus: uterus, device: device, inUterus: inUterus, sperm: sperm, egg: egg, wbc: wbc, ion: ion, ions: ions, hormone: hormone, routeAt: routeAt, routeD: routeD, ROUTE: ROUTE, EGG: EGG,
  finger: finger, calendar: calendar, thermometer: thermometer, drop: drop, bolt: bolt, shield: shield, jelly: jelly, door: door, sm: sm, path: path, ln: ln,
  C: { MYO: MYO, ENDO: ENDO, CAV: CAV, MUC: MUC, COP: COP, COPL: COPL, TUBE: TUBE, WBC: WBC } };
})();
