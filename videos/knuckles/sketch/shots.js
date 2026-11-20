// ── «ليه صوابعك بتطقطق؟» — drawings. Shapes follow the «طب إزاي؟» reference (v07: the salmon hand with its bones
// laid over it; v16: the cut-open vessel with bubbles and a gauge) and real references (refs/SOURCES.md):
// the knuckle (metacarpophalangeal joint) is a side cut along the finger: the round metacarpal head on the right,
// the shallow cup of the first finger bone on the left, cartilage on both faces, the joint space with synovial fluid,
// the capsule closing it in, the extensor tendon over the top and the flexor tendon under the palm side.
// People are flat side-view figures with real body proportions (copied from videos/choking/sketch/shots.js).

var BONEC = "#f7f1e3", BONE_IN = "#e4cf9f", CART = "#cfe0e2", FLUID = "#e9df9f", TISS = "#e7b49b", TEND = "#f1e8d2", CAPS = OLIVE,
    GASC = "#4a6f8a", BUBC = "#f7fbfc", SHIRT_V = "#7f97a6", SHIRT_R = "#b9a98a", PANTS = "#5b5145", HAIR = "#3e3128", WOODC = "#a9784d";
function pathPts(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" "); }

// ── the knuckle cut (centre 0,0 = where head and cup meet; the finger runs off to the left, the hand to the right) ──
// o: {g: gap 0..34 (traction), cap 0..1, fl 0..1 fluid, gas 0..1 dissolved gas dots, bub 0..1 bubble, hl: "bone"|"cart"|"cap"|"fluid",
//     mri: true (MRI greys), skin: false to leave the skin off, swell: 0..1 (red, swollen), wear: 0..1 (rough cartilage)}
function joint(o) {
  o = o || {}; var g = o.g || 0, t = window.__t, M = o.mri, s = "", k;
  var col = M ? { skin: "#3b3b3b", tis: "#4b4b4b", bone: "#8e8e8e", bin: "#7a7a7a", cart: "#c9c9c9", fl: "#e2e2e2", ten: "#2a2a2a", cap: "#5e5e5e", bub: "#0d0d0d", ink: "#1a1a1a" }
                : { skin: o.swell ? "#e29a84" : SKIN, tis: o.swell ? "#e5a08a" : TISS, bone: BONEC, bin: BONE_IN, cart: CART, fl: FLUID, ten: TEND, cap: CAPS, bub: BUBC, ink: INK };
  var ink = col.ink, c2 = 60 - g, b = lerp(104, 88, clamp(g / 34)), pl = -150 - g, rA = o.rot || 0;
  function P2(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + fill + '" stroke="' + ink + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
  // skin and the soft tissue under it (the hand is thicker than the finger; a bump over the knuckle)
  if (o.skin !== false) {
    s += P2("M-520 -118 C-300 -122 -120 -132 " + f(-10 - g * .5) + " -146 C70 -176 160 -172 230 -152 L520 -146 L520 156 C300 160 140 168 0 148 C-120 134 -300 128 -520 122 Z", col.skin, 2.6);
    s += P2("M-520 -100 C-300 -104 -120 -114 " + f(-10 - g * .5) + " -128 C70 -156 160 -152 230 -134 L520 -128 L520 138 C300 142 140 150 0 130 C-120 116 -300 110 -520 104 Z", col.tis, 1.2);
    s += '<path d="M-520 -100 C-300 -104 -120 -114 ' + f(-10 - g * .5) + ' -128 C70 -156 160 -152 230 -134 L520 -128 L520 138 C300 142 140 150 0 130 C-120 116 -300 110 -520 104 Z" fill="url(#hatch)" opacity=".35"/>';
    // extensor tendon over the top, flexor tendon in its sheath under the palm side
    s += P2("M-520 -92 C-300 -96 -120 -104 " + f(-10 - g * .5) + " -116 C70 -142 160 -138 230 -122 L520 -116 L520 -100 L230 -106 C160 -122 70 -126 " + f(-10 - g * .5) + " -100 C-120 -88 -300 -80 -520 -76 Z", col.ten, 1.6);
    s += P2("M-520 76 C-300 80 -120 88 0 104 C140 122 300 112 520 108 L520 128 C300 132 140 142 0 126 C-120 110 -300 102 -520 98 Z", col.ten, 1.6);
  }
  // the capsule's inside: fluid (behind the bones, so only the space between them shows)
  var sac = "M" + f(pl) + " -46 C" + f(pl + 30) + " " + f(-b) + " 70 " + f(-b - 4) + " 150 -46 L150 46 C70 " + f(b + 4) + " " + f(pl + 30) + " " + f(b) + " " + f(pl) + " 46 Z";
  if (o.fl !== 0) s += G("", P2(sac, col.fl, 0), o.fl == null ? 1 : o.fl);
  // dissolved gas: small blue dots drifting in the fluid; they gather into the bubble when it forms
  var gas = o.gas || 0, bub = o.bub || 0, xb = (-29 - g + -15) / 2;
  if (gas > 0) for (k = 0; k < 34; k++) {
    var hx = hash(k * 3 + 1), hy = hash(k * 7 + 2), x0 = lerp(pl + 24, 130, hx), yy = (hy * 2 - 1), env = 1 - Math.pow((x0 - (pl + 150) / 2) / ((150 - pl) / 2), 2);
    var y0 = yy * Math.max(14, (b - 10) * env), jx = x0 + 3 * Math.sin(t * 1.3 + k), jy = y0 + 3 * Math.cos(t * 1.1 + k * 2), into = clamp(bub * 1.6 - hash(k + 50) * .6);
    var px = lerp(jx, xb, into), py = lerp(jy, 0, into);
    if (into < .98) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2.6 + hash(k + 9) * 1.6) + '" fill="' + (M ? "#555" : GASC) + '" opacity="' + f(gas * (1 - into)) + '"/>';
  }
  // the first finger bone (proximal phalanx): a shallow cup facing the head
  var cupA = function (r, y) { return c2 - Math.sqrt(r * r - y * y); };
  var ph = "M" + f(cupA(89, 60)) + " -60 A89 89 0 0 0 " + f(cupA(89, 60)) + " 60 L" + f(c2 - 128) + " 62 Q" + f(c2 - 160) + " 42 " + f(c2 - 200) + " 42 L-560 40 L-560 -40 L" + f(c2 - 200) + " -42 Q" + f(c2 - 160) + " -42 " + f(c2 - 128) + " -62 Z";
  var mc = "M560 -44 L150 -44 Q126 -44 108 -57 A75 75 0 1 0 108 57 Q126 44 150 44 L560 44 Z";
  var boneHl = o.hl === "bone";
  var bf = boneHl ? "#f3d9b8" : col.bone, PH = "", MC = "";
  PH += P2(ph, bf, 2.4) + P2("M" + f(c2 - 100) + " -40 Q" + f(c2 - 84) + " 0 " + f(c2 - 100) + " 40 L" + f(c2 - 160) + " 30 L-560 28 L-560 -28 L" + f(c2 - 160) + " -30 Z", col.bin, 0, ' opacity=".55"');
  MC += P2(mc, bf, 2.4) + P2("M560 -32 L170 -32 Q140 -32 128 -40 A58 58 0 0 0 128 40 Q140 32 170 32 L560 32 Z", col.bin, 0, ' opacity=".55"');
  for (k = 0; k < 16; k++) { var bx = hash(k + 70), by = (hash(k + 80) * 2 - 1); MC += '<circle cx="' + f(90 + bx * 260) + '" cy="' + f(by * 24) + '" r="' + f(2 + hash(k) * 3.5) + '" fill="' + col.bone + '" stroke="' + ink + '" stroke-width=".9" opacity=".7"/>'; PH += '<circle cx="' + f(c2 - 110 - bx * 260) + '" cy="' + f(by * 22) + '" r="' + f(2 + hash(k + 3) * 3.5) + '" fill="' + col.bone + '" stroke="' + ink + '" stroke-width=".9" opacity=".7"/>'; }
  // cartilage caps on both faces (rough when worn)
  var cw = o.hl === "cart" ? 11 : 8, cc = o.hl === "cart" ? "#a9cdd3" : col.cart;
  var headC = "M" + f(60 + 71 * Math.cos(2.2)) + " " + f(71 * Math.sin(2.2)) + " A71 71 0 0 1 " + f(60 + 71 * Math.cos(4.08)) + " " + f(71 * Math.sin(4.08));
  var cupC = "M" + f(cupA(85, 57)) + " 57 A85 85 0 0 1 " + f(cupA(85, 57)) + " -57";
  MC += '<path d="' + headC + '" stroke="' + ink + '" stroke-width="' + (cw + 3) + '" fill="none"/><path d="' + headC + '" stroke="' + cc + '" stroke-width="' + cw + '" fill="none"' + (o.wear ? ' stroke-dasharray="9 5"' : "") + '/>';
  PH += '<path d="' + cupC + '" stroke="' + ink + '" stroke-width="' + (cw + 3) + '" fill="none"/><path d="' + cupC + '" stroke="' + cc + '" stroke-width="' + cw + '" fill="none"' + (o.wear ? ' stroke-dasharray="9 5"' : "") + '/>';
  s += MC + G(rA ? "rotate(" + f(rA) + " 60 0)" : "", PH);
  // the bubble: a gas cavity filling the space between the faces
  if (bub > 0) { var rx = Math.max(4, (14 + g) / 2 - 2) * Math.min(1, bub * 1.2), ry = 46 * bub;
    s += '<ellipse cx="' + f(xb) + '" cy="0" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + col.bub + '" stroke="' + (M ? "#000" : BLUE) + '" stroke-width="2.4"/>' + (M ? "" : '<ellipse cx="' + f(xb - rx * .3) + '" cy="' + f(-ry * .45) + '" rx="' + f(rx * .25) + '" ry="' + f(ry * .14) + '" fill="#fff"/>'); }
  // the capsule wall: olive band over the top and bottom of the sac, slack when relaxed, taut when pulled
  var capK = o.cap == null ? 1 : o.cap;
  if (capK > 0) {
    var top = "M" + f(pl) + " -46 C" + f(pl + 30) + " " + f(-b) + " 70 " + f(-b - 4) + " 150 -46", bot = "M" + f(pl) + " 46 C" + f(pl + 30) + " " + f(b) + " 70 " + f(b + 4) + " 150 46";
    var cwid = o.hl === "cap" ? 10 : 7;
    s += draw(top, capK, ink, cwid + 3) + draw(top, capK, col.cap, cwid) + draw(bot, capK, ink, cwid + 3) + draw(bot, capK, col.cap, cwid);
  }
  return s;
}
// the joint at (x, y) scaled
function J(x, y, sc, o) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc) + ")", joint(o)); }
// a pressure gauge: val 1 = normal, 0 = very low
function gauge(x, y, r, val, k) {
  k = k == null ? 1 : k; if (k <= 0) return ""; var a = Math.PI * (1 - clamp(val)), s = "";
  s += '<path d="M' + f(x - r) + ' ' + f(y) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + r) + ' ' + f(y) + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + f(x - r * .82) + ' ' + f(y) + ' A' + f(r * .82) + ' ' + f(r * .82) + ' 0 0 1 ' + f(x - r * .82 * Math.cos(Math.PI * .3)) + ' ' + f(y - r * .82 * Math.sin(Math.PI * .3)) + '" stroke="' + ORANGE + '" stroke-width="7" fill="none"/>';
  for (var i = 0; i <= 8; i++) { var b = Math.PI * i / 8; s += '<path d="M' + f(x + Math.cos(Math.PI - b) * r * .9) + ' ' + f(y - Math.sin(Math.PI - b) * r * .9) + ' L' + f(x + Math.cos(Math.PI - b) * r * .72) + ' ' + f(y - Math.sin(Math.PI - b) * r * .72) + '" stroke="' + INK + '" stroke-width="2"/>'; }
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x - Math.cos(a) * r * .78) + ' ' + f(y - Math.sin(a) * r * .78) + '" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' + C(x, y, 6, INK, 0);
  return appear(k, s + T("الضغط", x, y + 30, r * .32, INK, 800));
}

// ── the hand: the rig from «ليه البنصر مش بيترفع؟» (videos/finger-stuck), approved by the user ──
var LIT = "#efc0a4", NAIL = "#efcdb9", WOODT = "#d9c29b", WOODG = "#c4a97c", TENDR = "#f4eee2";

// ── curve helpers ──
function smooth(pts, closed) {   // Catmull-Rom → cubic Bézier through the points
  var n = pts.length, d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 0; i < (closed ? n : n - 1); i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (!closed) { if (i == 0) p0 = p1; if (i == n - 2) p3 = p2; }
    d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
  }
  return d + (closed ? " Z" : "");
}
function sline(pts, col, w, op, ex) { return '<path d="' + smooth(pts, false) + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : "") + (ex || "") + '/>'; }

// a jointed digit outline from joints [[x, y, width], …] (root → tip centre)
function digit(j) {
  var L = [], R = [], n = j.length;
  function nrm(i) { var a = j[Math.max(0, i - 1)], b = j[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l, dx / l, dy / l]; }
  for (var i = 0; i < n; i++) { var q = nrm(i), w = j[i][2] / 2; L.push([j[i][0] + q[0] * w, j[i][1] + q[1] * w]); R.push([j[i][0] - q[0] * w, j[i][1] - q[1] * w]); }
  var e = nrm(n - 1), tw = j[n - 1][2] / 2, tip = [];
  for (var k = 1; k < 6; k++) { var th = Math.PI * k / 6, c = Math.cos(th), s = Math.sin(th); tip.push([j[n - 1][0] + e[0] * tw * c + e[2] * tw * s, j[n - 1][1] + e[1] * tw * c + e[3] * tw * s]); }
  return { d: smooth(L.concat(tip, R.reverse()), true), at: function (i, off) { var q = nrm(i), w = j[i][2] / 2; return [j[i][0] + q[0] * w * off, j[i][1] + q[1] * w * off]; }, nrm: nrm };
}
// joints of a finger: root (x,y), direction a (deg, 0 = down), phalanx lengths, widths at root / PIP / DIP / tip.
// lift 0..1 tips it toward the camera (segments foreshorten, the far end grows); fold 0..1 curls it under the palm.
function joints(x, y, a, ls, ws, lift, bend, fold) {
  lift = lift || 0; fold = fold || 0;
  var out = [], r = a * Math.PI / 180, px = x, py = y, sc = [1, 1 - 0.30 * lift, 1 - 0.45 * lift, 1 - 0.55 * lift], fs = [1 - 0.35 * fold, 1 - 0.85 * fold, 1 - 0.85 * fold];
  var W = [ws[0], ws[0] * 0.92, ws[1] * 1.03, ws[1] * 0.9, ws[2] * 1.02, ws[2] * 0.94, ws[3]];
  out.push([px, py, W[0]]);
  for (var s = 0; s < 3; s++) {
    var L = Math.max(2, ls[s] * sc[s + 1] * fs[s]), gr = 1 + 0.18 * lift * (s + 1) / 3;
    out.push([px + Math.sin(r) * L / 2, py + Math.cos(r) * L / 2, W[1 + 2 * s] * gr]);
    px += Math.sin(r) * L; py += Math.cos(r) * L; r += (bend || 0) * Math.PI / 180;
    out.push([px, py, (s < 2 ? W[2 + 2 * s] : W[6]) * gr]);
  }
  return out;   // 0 root, 2 PIP, 4 DIP, 6 tip centre
}
function wrinkles(D, i, count, len, op) {
  var s = "", q = D.nrm(i);
  for (var k = 0; k < count; k++) { var o = (k - (count - 1) / 2) * 5, c = D.at(i, 0), cx = c[0] + q[2] * o, cy = c[1] + q[3] * o, w = len * (1 - Math.abs(k - (count - 1) / 2) * 0.25);
    s += '<path d="M' + f(cx + q[0] * w / 2) + ' ' + f(cy + q[1] * w / 2) + ' Q' + f(cx + q[2] * 3.5) + ' ' + f(cy + q[3] * 3.5) + ' ' + f(cx - q[0] * w / 2) + ' ' + f(cy - q[1] * w / 2) + '" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round" opacity="' + (op || .5) + '"/>'; }
  return s;
}
// a finger: body, shaded side (its thickness), lit ridge, knuckle wrinkles, nail. o: {red 0..1}
function drawFinger(j, o) {
  o = o || {}; var D = digit(j), s = '<path d="' + D.d + '" fill="' + SKIN + '"/>';
  if (o.red) s += '<path d="' + D.d + '" fill="' + ORANGE + '" opacity="' + f(.55 * o.red) + '"/>';
  var sh = [], i; for (i = 0; i < j.length; i++) sh.push(D.at(i, -1)); for (i = j.length - 1; i >= 0; i--) sh.push(D.at(i, -0.25));
  s += '<path d="' + smooth(sh, true) + '" fill="' + SKIN2 + '" opacity=".5"/>';
  var hl = []; for (i = 1; i < j.length - 1; i++) hl.push(D.at(i, 0.5));
  s += sline(hl, LIT, f(j[3][2] * 0.16), .75);
  s += '<path d="' + D.d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  s += wrinkles(D, 2, 3, j[2][2] * 0.55, .55) + wrinkles(D, 4, 2, j[4][2] * 0.45, .45);
  var a = j[5], b = j[6], ang = Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI, nw = b[2] * 0.62, nl = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.05 + b[2] * 0.25;
  if (nl > 8) s += G('translate(' + f(a[0]) + ' ' + f(a[1]) + ') rotate(' + f(-ang) + ')', '<path d="M' + f(-nw / 2) + ' 2 Q0 -4 ' + f(nw / 2) + ' 2 L' + f(nw / 2) + ' ' + f(nl - nw * 0.45) + ' Q' + f(nw / 2) + ' ' + f(nl) + ' 0 ' + f(nl) + ' Q' + f(-nw / 2) + ' ' + f(nl) + ' ' + f(-nw / 2) + ' ' + f(nl - nw * 0.45) + ' Z" fill="' + NAIL + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + f(-nw * 0.28) + ' 6 L' + f(-nw * 0.28) + ' ' + f(nl * 0.6) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>');
  return s;
}
function shadowOf(j, dx, dy, op) { var J = j.map(function (p) { return [p[0] + dx, p[1] + dy, p[2]]; }); return '<path d="' + digit(J).d + '" fill="' + INK + '" opacity="' + op + '"/>'; }
// folded under: the first phalanx dips to the table and the bent middle knuckle faces the camera
function drawFolded(x, y, a, len, w) {
  var r = a * Math.PI / 180, ex = x + Math.sin(r) * len, ey = y + Math.cos(r) * len, s = "";
  var j = [[x, y, w], [x + Math.sin(r) * len * .5, y + Math.cos(r) * len * .5, w], [ex, ey, w * 1.12]], D = digit(j), sh = [], i;
  s += '<ellipse cx="' + f(ex + 6) + '" cy="' + f(ey + 12) + '" rx="' + f(w * 0.62) + '" ry="' + f(w * 0.34) + '" fill="' + INK + '" opacity=".28"/>';
  s += '<path d="' + D.d + '" fill="' + SKIN + '"/>';
  for (i = 0; i < 3; i++) sh.push(D.at(i, -1)); for (i = 2; i >= 0; i--) sh.push(D.at(i, -0.2));
  s += '<path d="' + smooth(sh, true) + '" fill="' + SKIN2 + '" opacity=".55"/><path d="' + D.d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  for (var k = 0; k < 3; k++) { var rr = w * (0.16 + 0.1 * k); s += '<path d="M' + f(ex - rr) + ' ' + f(ey - 2 + k * 2) + ' Q' + f(ex) + ' ' + f(ey + rr * 0.9) + ' ' + f(ex + rr) + ' ' + f(ey - 2 + k * 2) + '" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity="' + (.55 - k * .12) + '" stroke-linecap="round"/>'; }
  return s + '<ellipse cx="' + f(ex - w * 0.12) + '" cy="' + f(ey - w * 0.05) + '" rx="' + f(w * 0.12) + '" ry="' + f(w * 0.07) + '" fill="' + LIT + '" opacity=".8"/>';
}
function padThumb(TJ) { var a = TJ[0], b = TJ[2], c = TJ[4]; function mid(p, q, k) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 * (k || 1)]; }
  var m1 = mid(a, b, .95); return [a, mid(a, m1), m1, mid(m1, b), b, mid(b, c, .96), c]; }

// ── the hand (hand units: the wrist cuff at the top ≈ y 75, fingertips ≈ y 620) ──
var FG = { pinky: [148, 330, -11, [74, 46, 38], [42, 38, 34, 30]], ring: [203, 350, -4, [92, 58, 44], [48, 43, 39, 34]], middle: [262, 356, 1, [98, 64, 46], [50, 45, 41, 35]], index: [320, 344, 7, [90, 56, 42], [48, 43, 39, 34]] };
var BEND = { pinky: -2, ring: 0, middle: 0, index: 2 };
// tendon start points under the cuff, one per finger
var TW = { pinky: [206, 120], ring: [228, 120], middle: [250, 120], index: [272, 120] };
function fingerJ(k, q) { var g = FG[k], pl = q.pull || 0, r = g[2] * Math.PI / 180; return joints(g[0] + Math.sin(r) * pl, g[1] + Math.cos(r) * pl, g[2], g[3], g[4], q.lift || 0, BEND[k], q.fold || 0); }
function thumbJ(q) { var TJ = joints(350, 228, 30, [0, 66, 52], [62, 50, 44, 38], q.lift || 0, 8).slice(2); TJ[0][2] = 66; return padThumb(TJ); }
// o: {f: {pinky|ring|middle|index|thumb: {lift, fold, red, jit}}, xray 0..1, tend: {...} tendon options}
function hand(o) {
  o = o || {}; var F = o.f || {}, s = "", J = {}, x = o.xray || 0, k;
  ["pinky", "ring", "middle", "index"].forEach(function (k) { J[k] = fingerJ(k, F[k] || {}); });
  var back = 'M154 118 C146 190 130 262 122 322 C120 336 128 346 142 350 C176 368 216 372 262 374 C312 374 348 362 362 342 C374 318 378 296 376 270 C372 236 358 180 344 118 Z';
  var skin = "";
  // contact shadows: a lifted finger's shadow stays on the table and slides away from it
  skin += '<path d="' + back + '" transform="translate(9 12)" fill="' + INK + '" opacity=".13"/>';
  for (k in J) { var q = F[k] || {}; if ((q.fold || 0) > .7) continue; var lj = q.lift ? fingerJ(k, { fold: q.fold }) : J[k]; skin += shadowOf(lj, 8 + (q.lift || 0) * 6, 12 + (q.lift || 0) * 30, f(.13 + (q.lift || 0) * .07)); }
  // the middle finger: straight, folding, or folded under
  var mf = (F.middle || {}).fold || 0, mk = clamp((mf - .45) / .4);
  if (mk > 0) skin += G("", drawFolded(FG.middle[0], FG.middle[1], FG.middle[2], 62, 52), mk);
  ["pinky", "ring", "index"].forEach(function (k) { skin += drawFinger(J[k], F[k]); });
  if (mk < 1) skin += G("", drawFinger(J.middle, F.middle), 1 - mk);
  // the thumb sits under the edge of the hand
  var th = F.thumb || {}, TJ = thumbJ(th), TJ0 = th.lift ? thumbJ({}) : TJ;
  skin += shadowOf(TJ0, 8 + (th.lift || 0) * 6, 12 + (th.lift || 0) * 30, f(.13 + (th.lift || 0) * .07)) + drawFinger(TJ, th);
  // back of the hand over the finger roots
  skin += '<path d="' + back + '" fill="' + SKIN + '"/>';
  skin += '<path d="M154 118 C146 190 130 262 122 322 C120 336 128 346 142 350 L162 340 C158 270 168 190 180 118 Z" fill="' + SKIN2 + '" opacity=".5"/>';
  [[204, 150, 146, 318], [226, 150, 203, 338], [248, 150, 262, 344], [272, 150, 320, 330]].forEach(function (t) { skin += sline([[t[0], t[1]], [(t[0] * 2 + t[2]) / 3, 230], [t[2], t[3]]], SKIN2, 3.2, .5); });
  [[148, 330, 40], [203, 350, 46], [262, 356, 48], [320, 344, 46]].forEach(function (p) {
    skin += '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 12) + '" rx="' + f(p[2] * 0.26) + '" ry="6" fill="' + LIT + '" opacity=".45"/>';
    skin += '<path d="M' + f(p[0] - p[2] * 0.35) + ' ' + (p[1] - 2) + ' q' + f(p[2] * 0.35) + ' -12 ' + f(p[2] * 0.7) + ' 0" fill="none" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>'; });
  [[176, 352], [233, 364], [292, 362]].forEach(function (p) { skin += '<path d="M' + (p[0] - 7) + ' ' + (p[1] - 6) + ' q7 12 14 0" fill="none" stroke="' + INK + '" stroke-width="2.2" opacity=".6"/>'; });
  skin += '<path d="M154 118 C146 190 130 262 122 322 C120 336 126 344 134 348" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  skin += '<path d="M344 118 C350 150 356 176 366 200" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  skin += '<path d="M370 268 C384 282 388 300 382 316" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" opacity=".45"/>';
  s += x > 0 ? '<g opacity="' + f(1 - .68 * x) + '" style="filter:saturate(' + f(1 - .6 * x) + ')">' + skin + '</g>' : skin;
  if (x > 0) s += '<g opacity="' + f(x) + '">' + tendons(J, F, o.tend || {}) + '</g>';
  if (o.bones) s += '<g opacity="' + f(o.bones) + '">' + rigBones(J, F) + '</g>';
  if (o.hl) { var hg = FG[o.hl], hq = (F[o.hl] || {}).pull || 0; s += '<ellipse cx="' + f(hg[0]) + '" cy="' + f(hg[1] - 6 + hq / 2) + '" rx="' + f(hg[4][0] * .62) + '" ry="' + f(22 + hq / 2) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>'; }
  // sleeve cuff (always on top: the tendons run in from under it)
  s += '<path d="M136 74 L362 74 L358 128 C298 138 206 138 144 128 Z" fill="' + (o.sleeve || BLUE) + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  s += '<path d="M146 116 C206 124 298 124 356 116" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".4"/>';
  return s;
}
// the extensor tendons. opt: {pull: 0..1 (the middle tendon dragged toward the fingertip), band 0..1 highlight,
// own 0..1 (the extra muscles of index and pinky in olive), lock 0..1 (the ring tendon held), col: {finger: colour}}
function tendonPts(k, J, F) {
  var w = TW[k], q = F[k] || {}, j = J[k];
  if ((q.fold || 0) > .45) { var g = FG[k], r = g[2] * Math.PI / 180; return [w, [(w[0] * 2 + g[0]) / 3, 240], [g[0], g[1]], [g[0] + Math.sin(r) * 58, g[1] + Math.cos(r) * 58]]; }
  return [w, [(w[0] * 2 + j[0][0]) / 3, 240], [j[0][0], j[0][1]], [j[2][0], j[2][1]], [j[4][0], j[4][1]], [j[5][0], j[5][1]]];
}
function tendons(J, F, o) {
  var s = "", col = o.col || {}, pull = o.pull || 0;
  // the extra muscles: a second tendon beside the index and the little finger, joining at the knuckle
  if (o.own) {
    s += sline([[TW.pinky[0] - 14, 120], [180, 240], [FG.pinky[0] - 4, FG.pinky[1] - 6]], OLIVE, 6, o.own);
    s += sline([[TW.index[0] + 16, 120], [300, 240], [FG.index[0] + 6, FG.index[1] - 6]], OLIVE, 6, o.own);
  }
  ["pinky", "ring", "middle", "index"].forEach(function (k) {
    var p = tendonPts(k, J, F), c = col[k] || TENDR;
    s += sline(p, INK, 10) + sline(p, c, 6);
  });
  // the band (juncturae tendinum) between the ring and middle tendons, just above the knuckles
  var by = 300 + 14 * pull, b1 = [210, by + 2], b2 = [258, by + 6];
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>';
  s += '<path d="M' + f(b1[0]) + ' ' + f(b1[1]) + ' L' + f(b2[0]) + ' ' + f(b2[1]) + '" stroke="' + (o.band ? ORANGE : "#e3cdb6") + '" stroke-width="10" stroke-linecap="round"/>';
  return s;
}
// the bones laid over the rig (reference v07): carpals under the cuff, a metacarpal to each knuckle, three phalanges per finger
function rigBones(J, F) {
  var s = "";
  function bone(p, q, w) { return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" stroke-linecap="round"/><path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + BONEC + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
    '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="' + f(w * .62) + '" ry="' + f(w * .5) + '" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function toward(p, q, k) { return [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]; }
  [[196, 150, 15, 11], [226, 146, 15, 12], [256, 147, 15, 12], [286, 152, 14, 11], [204, 176, 15, 11], [234, 178, 15, 12], [264, 178, 14, 11], [292, 182, 14, 12]].forEach(function (c, i) {
    s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '" transform="rotate(' + (i * 23 % 40 - 20) + ' ' + c[0] + ' ' + c[1] + ')" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="1.8"/>'; });
  var base = { pinky: [196, 196], ring: [222, 198], middle: [250, 198], index: [280, 196] };
  ["pinky", "ring", "middle", "index"].forEach(function (k) {
    var j = J[k], q = F[k] || {}, g = FG[k];
    if ((q.fold || 0) > .45) { s += bone(base[k], [g[0], g[1] - 8], 18); return; }
    s += bone(base[k], toward(base[k], [j[0][0], j[0][1]], .94), 18);
    s += bone(toward([j[0][0], j[0][1]], [j[2][0], j[2][1]], .08), toward([j[0][0], j[0][1]], [j[2][0], j[2][1]], .92), 16);
    s += bone(toward([j[2][0], j[2][1]], [j[4][0], j[4][1]], .1), toward([j[2][0], j[2][1]], [j[4][0], j[4][1]], .9), 14);
    s += bone(toward([j[4][0], j[4][1]], [j[6][0], j[6][1]], .12), toward([j[4][0], j[4][1]], [j[6][0], j[6][1]], .78), 12);
  });
  var T = thumbJ((F.thumb) || {});
  s += bone([300, 186], toward([300, 186], [T[0][0], T[0][1]], .9), 18) + bone(toward([T[0][0], T[0][1]], [T[4][0], T[4][1]], .1), toward([T[0][0], T[0][1]], [T[4][0], T[4][1]], .88), 16) + bone(toward([T[4][0], T[4][1]], [T[6][0], T[6][1]], .14), toward([T[4][0], T[4][1]], [T[6][0], T[6][1]], .75), 13);
  return s;
}
// place the rig: (x, y) = the middle of the hand, s scale, rot (0 = fingers down toward you, 180 = fingers up), mirror = the left hand
function HAND(x, y, s, rot, o, mirror) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(rot || 0) + ") scale(" + f((mirror ? -1 : 1) * s) + " " + f(s) + ") translate(-250 -350)", hand(o || {})); }
// a panel point for a rig point
function HP(x, y, s, rot, px, py, mirror) { var a = (rot || 0) * Math.PI / 180, dx = (px - 250) * s * (mirror ? -1 : 1), dy = (py - 350) * s; return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)]; }

// ── people: flat side-view figures facing left, real proportions (Drillis & Contini; see videos/choking/sketch/shots.js) ──
function limb(pts, w, col) { var d = pathPts(pts); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
function dirv(a) { a = a * Math.PI / 180; return [-Math.sin(a), Math.cos(a)]; }
function ik(sh, tg, l1, l2, bend) {
  var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1];
}
var HB = { thigh: 98, shin: 98, foot: 61, ankle: 16, sh: 119, chin: 140, head: 166, ua: 74, fa: 58, hand: 43 };
function fig(o) {
  var s = o.s || 1, up = dirv(180 - (o.lean || 0)), hip = [o.x, o.y], fw = [up[1], -up[0]];
  function atF(h, side) { return [hip[0] + up[0] * h * s + fw[0] * side * s, hip[1] + up[1] * h * s + fw[1] * side * s]; }
  var sh = atF(HB.sh, -2), hd = atF(HB.head, 3);
  var legs = o.legs || [[8, -4], [-8, 4]], arms = o.hands || [null, null], bend = o.bend || [-1, -1], out = { far: "", body: "", near: "" };
  function seg2(a1, b1, w1, a2, b2, w2, c1, c2) {
    var d1 = "M" + f(a1[0]) + " " + f(a1[1]) + " L" + f(b1[0]) + " " + f(b1[1]), d2 = "M" + f(a2[0]) + " " + f(a2[1]) + " L" + f(b2[0]) + " " + f(b2[1]);
    return '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="' + f(w1 + 4) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + INK + '" stroke-width="' + f(w2 + 4) + '" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" stroke="' + c1 + '" stroke-width="' + f(w1) + '" stroke-linecap="round"/><path d="' + d2 + '" stroke="' + c2 + '" stroke-width="' + f(w2) + '" stroke-linecap="round"/>';
  }
  function leg(i) {
    var a = dirv(legs[i][0]), b = dirv(legs[i][0] + legs[i][1]), kn = [hip[0] + a[0] * HB.thigh * s, hip[1] + a[1] * HB.thigh * s], an = [kn[0] + b[0] * HB.shin * s, kn[1] + b[1] * HB.shin * s];
    var sole = [-b[1], b[0]], toe = [an[0] - Math.abs(sole[0]) * HB.foot * .78 * s, an[1]], heel = [an[0] + 12 * s, an[1]];
    var shoe = '<path d="M' + f(heel[0]) + ' ' + f(an[1] - 8 * s) + ' L' + f(heel[0]) + ' ' + f(an[1] + HB.ankle * s) + ' L' + f(toe[0] - 6 * s) + ' ' + f(an[1] + HB.ankle * s) + ' Q' + f(toe[0] - 10 * s) + ' ' + f(an[1] + 2 * s) + ' ' + f(toe[0] + 8 * s) + ' ' + f(an[1] - 2 * s) + ' L' + f(an[0] - 4 * s) + ' ' + f(an[1] - 10 * s) + ' Z" fill="' + INK + '"/>';
    return seg2(hip, kn, 36 * s, kn, an, 25 * s, PANTS, PANTS) + shoe;
  }
  function arm(i) {
    var sp = atF(HB.sh - 8, i ? 2 : -2), tg = arms[i] && arms[i].rel ? atF(arms[i].h, arms[i].side) : arms[i] || [sp[0] - 8 * s, sp[1] + (HB.ua + HB.fa) * s * .97];
    var el = ik(sp, tg, HB.ua * s, HB.fa * s, bend[i]), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, HB.fa * s), el[1] + dy / dl * Math.min(dl, HB.fa * s)];
    var ang = Math.atan2(dy, dx) * 180 / Math.PI, hand = G("translate(" + f(wr[0]) + " " + f(wr[1]) + ") rotate(" + f(ang) + ")", '<path d="M-4 -9 C10 -11 ' + f(HB.hand * .62 * s) + ' -8 ' + f(HB.hand * .66 * s) + ' 0 C' + f(HB.hand * .62 * s) + ' 8 10 11 -4 9 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>');
    return seg2(sp, el, 22 * s, el, wr, 17 * s, o.shirt || SHIRT_V, SKIN) + '<path d="M' + f(el[0] + (wr[0] - el[0]) * .55) + ' ' + f(el[1] + (wr[1] - el[1]) * .55) + ' L' + f(el[0]) + ' ' + f(el[1]) + '" stroke="' + (o.shirt || SHIRT_V) + '" stroke-width="' + f(19 * s) + '" stroke-linecap="butt"/>' + hand;
  }
  out.far = arm(1) + leg(1);
  var fr = [[-6, 18], [24, 22], [46, 22], [70, 27], [92, 28], [110, 22], [120, 10]], bk = [[120, -12], [104, -24], [80, -24], [52, -19], [26, -27], [4, -30], [-10, -18]];
  var pts = fr.concat(bk).map(function (q) { return atF(q[0], q[1]); }), d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); }
  d += " Q" + f(pts[pts.length - 1][0]) + " " + f(pts[pts.length - 1][1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z";
  var tor = '<path d="' + d + '" fill="' + (o.shirt || SHIRT_V) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  var pd = [atF(-6, 18), atF(14, 20), atF(14, -28), atF(-10, -18)];
  tor += '<path d="M' + pd.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="2"/>';
  var n0 = atF(HB.sh - 4, 2), n1 = atF(HB.chin + 6, 4), neck = limb([n0, n1], 24 * s, SKIN);
  var rx = 23 * s, ry = 26 * s, ang = -(o.lean || 0) + (o.tilt || 0), head = G("translate(" + f(hd[0]) + " " + f(hd[1]) + ") rotate(" + f(ang) + ")",
    '<ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>' +
    '<path d="M' + f(-rx * .2) + ' ' + f(-ry * .98) + ' C' + f(rx * .6) + ' ' + f(-ry * 1.12) + ' ' + f(rx * 1.12) + ' ' + f(-ry * .5) + ' ' + f(rx) + ' ' + f(ry * .25) + ' L' + f(rx * .45) + ' ' + f(ry * .05) + ' Q' + f(rx * .2) + ' ' + f(-ry * .55) + ' ' + f(-rx * .78) + ' ' + f(-ry * .6) + ' Z" fill="' + (o.hair || HAIR) + '" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M' + f(-rx * .97) + ' ' + f(-ry * .12) + ' l' + f(-rx * .26) + ' ' + f(ry * .3) + ' l' + f(rx * .26) + ' ' + f(ry * .05) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<ellipse cx="' + f(rx * .2) + '" cy="' + f(ry * .08) + '" rx="' + f(rx * .14) + '" ry="' + f(ry * .2) + '" fill="' + SKIN2 + '" stroke="' + INK + '" stroke-width="1.2"/>');
  out.body = leg(0) + tor + neck + head;
  out.near = arm(0);
  out.sh = sh; out.hd = hd; out.hip = hip; out.at = atF;
  return out;
}
function rel(h, side) { return { rel: 1, h: h, side: side }; }
function whole(fg) { return fg.far + fg.body + fg.near; }
function floor(y) { return '<path d="M-400 ' + y + ' H1040" stroke="' + INK + '" stroke-width="2.4"/>' + R(-400, y, 1440, 300, "#e3d7bd", 0) + '<rect x="-400" y="' + y + '" width="1440" height="300" fill="url(#hatch)" opacity=".35"/>'; }
// a chair (seat 0.25H = 100 above the floor) and a desk (0.43H = 172), side view; x = front edge of the seat
function chair(x, fl) { return R(x, fl - 106, 96, 12, WOODC, 2) + R(x + 84, fl - 250, 12, 144, WOODC, 2) + R(x + 6, fl - 94, 9, 94, "#7c5434", 1.8) + R(x + 80, fl - 94, 9, 94, "#7c5434", 1.8); }
function desk(x, w, fl) { return R(x, fl - 178, w, 12, WOODC, 2) + R(x + 10, fl - 166, 10, 166, "#7c5434", 1.8) + R(x + w - 20, fl - 166, 10, 166, "#7c5434", 1.8); }
// a seated man facing left at chair front x; shake: knee bounce 0..1; hands: two targets
function sitter(x, fl, hands, shake, opt) {
  opt = opt || {}; var hip = [x + 30, fl - 112], th = 90 + 5 * (shake || 0);
  return fig({ x: hip[0], y: hip[1], lean: opt.lean || 4, shirt: opt.shirt || SHIRT_V, hands: hands, bend: opt.bend || [-1, -1], legs: [[th, -th + 4], [88, -86]] });
}
// sound burst lines ("طق") at (x, y); k 0..1 life
function burst(x, y, k, sz, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = (sz || 30) * (0.5 + k), s = ""; for (var i = 0; i < 9; i++) { var a = i * Math.PI * 2 / 9 + .3; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="4.5" stroke-linecap="round"/>'; } return G("", s, 1 - k * k); }
function speaker(x, y, sc, on, t) { var s = '<path d="M-30 -14 H-12 L10 -34 V34 L-12 14 H-30 Z" fill="' + INK + '"/>'; if (on) for (var i = 0; i < 3; i++) s += '<path d="M' + (20 + i * 14) + ' -' + (16 + i * 9) + ' q' + (10 + i * 4) + ' ' + (16 + i * 9) + ' 0 ' + (32 + i * 18) + '" stroke="' + INK + '" stroke-width="4" fill="none" opacity="' + f(.5 + .5 * Math.sin(t * 6 - i)) + '"/>'; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }
// a syringe-like sealed cylinder of water, tip up and capped; p 0..1 = plunger pulled down; bub 0..1 bubbles
function cylinder(x, y, p, bub, t) {
  var s = "", top = y, bot = y + 380 + p * 90, w = 170, k;
  s += R(x - w / 2, top, w, bot - top, "#a9c3cf", 2.6) + R(x - 22, top - 40, 44, 40, "#a9c3cf", 2.4) + R(x - 30, top - 66, 60, 28, ORANGE, 2.4);
  for (k = 0; k < 7; k++) s += '<path d="M' + f(x + w / 2 - 2) + ' ' + f(top + 40 + k * 50) + ' h-22" stroke="' + INK + '" stroke-width="1.6"/>';
  for (k = 0; k < 26; k++) { var bx = x - w / 2 + 18 + hash(k + 3) * (w - 36), by = top + 30 + hash(k + 11) * (bot - top - 60), r = (2 + hash(k + 7) * 9) * clamp(bub * 1.5 - hash(k + 1) * .5); if (r > .6) s += '<circle cx="' + f(bx + 2 * Math.sin(t * 2 + k)) + '" cy="' + f(by - ((t * 14 + k * 9) % 30) * bub) + '" r="' + f(r) + '" fill="' + BUBC + '" stroke="' + BLUE + '" stroke-width="1.8"/>'; }
  s += R(x - w / 2 + 4, bot - 4, w - 8, 26, "#3d3a34", 2.2) + R(x - 12, bot + 22, 24, 170, GREY, 2.2) + R(x - 50, bot + 186, 100, 16, GREY, 2.2);
  return s;
}
// a soda bottle; open 0..1 = cap off; t for the fizz
function bottle(x, y, open, t) {
  var s = "", k;
  s += '<path d="M' + (x - 70) + ' ' + (y + 420) + ' L' + (x - 70) + ' ' + (y + 160) + ' Q' + (x - 70) + ' ' + (y + 90) + ' ' + (x - 26) + ' ' + (y + 40) + ' L' + (x - 26) + ' ' + y + ' L' + (x + 26) + ' ' + y + ' L' + (x + 26) + ' ' + (y + 40) + ' Q' + (x + 70) + ' ' + (y + 90) + ' ' + (x + 70) + ' ' + (y + 160) + ' L' + (x + 70) + ' ' + (y + 420) + ' Z" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2.6"/>';
  s += R(x - 70, y + 200, 140, 90, "#e9e1cc", 2) + T("صودا", x, y + 256, 34, ORANGE, 800);
  s += '<path d="M' + (x - 70) + ' ' + (y + 120) + ' H' + (x + 70) + '" stroke="#c9a37f" stroke-width="2" stroke-dasharray="6 6"/>';
  for (k = 0; k < 30; k++) { var lift = ((t * (40 + hash(k) * 50) + hash(k + 4) * 300) % 300) * open, bx = x - 55 + hash(k + 2) * 110, by = y + 410 - lift - hash(k + 6) * 40 * (1 - open), r = 2.5 + hash(k + 8) * 4.5;
    if (open > 0 || k < 6) s += '<circle cx="' + f(bx + 3 * Math.sin(t * 3 + k)) + '" cy="' + f(Math.max(y + 120, by)) + '" r="' + f(open > 0 ? r : 2) + '" fill="#f3ead8" stroke="' + INK + '" stroke-width="1" opacity="' + f(open > 0 ? .9 : .5) + '"/>'; }
  var cy = y - 26 - open * 90, ca = open * 35;
  s += G("translate(" + x + " " + f(cy) + ") rotate(" + f(ca) + ")", R(-32, -6, 64, 32, ORANGE, 2.4) + '<path d="M-26 0 v20 M-14 0 v20 M-2 0 v20 M10 0 v20 M22 0 v20" stroke="' + INK + '" stroke-width="1.2"/>');
  if (open > .3) for (k = 0; k < 6; k++) { var a = -Math.PI / 2 + (k - 2.5) * .35, r1 = 30 + ((t * 60 + k * 13) % 50); s += '<circle cx="' + f(x + Math.cos(a) * r1) + '" cy="' + f(y - 6 + Math.sin(a) * r1) + '" r="4" fill="#f3ead8" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - (r1 - 30) / 50) + '"/>'; }
  return s;
}
// a 20-minute clock face; k 0..1 of the 20 minutes
function clock20(x, y, r, k) {
  var a = -Math.PI / 2 + k * (20 / 60) * Math.PI * 2, s = C(x, y, r, "#f4ecdb", 3);
  for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; s += '<path d="M' + f(x + Math.cos(b) * r * .82) + ' ' + f(y + Math.sin(b) * r * .82) + ' L' + f(x + Math.cos(b) * r * .94) + ' ' + f(y + Math.sin(b) * r * .94) + '" stroke="' + INK + '" stroke-width="3"/>'; }
  if (k > 0) s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + f(y - r * .78) + ' A' + f(r * .78) + ' ' + f(r * .78) + ' 0 0 1 ' + f(x + Math.cos(a) * r * .78) + ' ' + f(y + Math.sin(a) * r * .78) + ' Z" fill="' + ORANGE + '" opacity=".3"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * r * .72) + ' ' + f(y + Math.sin(a) * r * .72) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 6, INK, 0);
}
function egg(x, y, sc) { return G("translate(" + x + " " + y + ") scale(" + sc + ")", '<path d="M-46 6 C-50 -24 -20 -36 6 -30 C34 -40 52 -14 44 10 C40 30 10 36 -10 32 C-34 34 -44 24 -46 6 Z" fill="#f3f0e6" stroke="' + INK + '" stroke-width="2.4" opacity=".9"/><circle cx="2" cy="2" r="17" fill="#e8b23e" stroke="' + INK + '" stroke-width="2.2"/>'); }
function personIcon(x, y, sc, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", C(0, -16, 9, col || GREY, 1.4) + '<path d="M-13 14 Q-13 -4 0 -4 Q13 -4 13 14 Z" fill="' + (col || GREY) + '" stroke="' + INK + '" stroke-width="1.4"/>'); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · the rule card
shot(4, push(320, 420, 1.0, 1.05), function (u, d, t) {
  return paper() + cylinder(320, 210, 0, 0, t) + tag("قاعدة", 320, 110, at(u, .3, .3), 40, ORANGE);
});
// 5 · lower the pressure on a liquid and its dissolved gas comes out as bubbles: the plunger pulled, the gauge drops
shot(5, push(320, 430, 1.04, 0.96), function (u, d, t) {
  var p = at(u, .6, 1.6), b = at(u, 1.4, 1.6);
  return paper() + cylinder(300, 170, p, b, t) + arrow(300, 700 + 60 * p, 300, 760 + 60 * p, ORANGE, 6, at(u, .5, .3)) + gauge(520, 230, 80, 1 - .8 * p, at(u, .2, .3)) +
    label(330, 380, 520, 430, "فقاقيع", BLUE, at(u, 2.4, .5), 28);
});
// 6 · like a soda bottle: closed, no bubbles; open it and they rise
shot(6, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var o = at(u, 1.2, .6); return paper() + bottle(320, 190, o, t) + gauge(520, 250, 70, 1 - .75 * o, at(u, .2, .3));
}, { tr: "out" });
// 7 · inside the finger: the hand with its bones (reference v07), the knuckle ringed, then a cut through it
shot(7, push(320, 420, 0.96, 1.08), function (u, d, t) {
  var mk = HP(320, 420, 1.15, 180, 262, 342); return paper() + HAND(320, 420, 1.15, 180, { bones: at(u, .4, .8), hl: at(u, 1.2, .2) > 0 ? "middle" : null }) + label(mk[0], mk[1], 150, 120, "مفصل", OLIVE, at(u, 1.4, .5), 30);
});
shot([7, 2], push(330, 400, 0.9, 1.0), function (u, d, t) {
  return paper() + J(330, 400, 1.15, { g: 0, cap: 0, fl: 0, hl: at(u, .2, .3) > 0 ? "cart" : null }) +
    label(420, 360, 520, 190, "عضم", OLIVE, at(u, .3, .4), 28) + label(160, 340, 90, 190, "عضم", OLIVE, at(u, .5, .4), 28) + label(280, 455, 230, 640, "غضروف", BLUE, at(u, 1.0, .4), 28);
}, { tr: "in" });
// 8 · the sealed capsule round it, full of thick fluid like egg white
shot(8, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var c = at(u, .3, 1.0), fl = at(u, 1.4, .8);
  return paper() + J(330, 400, 1.15, { g: 0, cap: c, fl: fl, hl: "cap" }) + label(330, 300, 470, 170, "الكيس", OLIVE, at(u, .9, .4), 28) +
    label(300, 400, 200, 650, "السايل الزلالي", BLUE, at(u, 2.6, .4), 28) + iconBox(90, 110, 120, egg(0, 0, 1), at(u, 1.8, .3));
});
// 9 · it oils the joint (the finger rocks), and gas is dissolved in it (blue dots, CO₂)
shot(9, push(330, 400, 1.06, 1.18), function (u, d, t) {
  var rock = 4 * Math.sin(t * 2.4) * (1 - at(u, 1.6, .5));
  return paper() + G("rotate(" + f(rock) + " 400 400)", J(330, 400, 1.15, { g: 0, gas: at(u, 1.6, .8) })) + label(300, 340, 470, 160, "غازات", BLUE, at(u, 2.2, .4), 28) +
    G("", N("CO₂", 140, 660, 52, BLUE), at(u, 2.8, .3));
});
// 10 · pulling the finger: the bones part, the capsule stretches
shot(10, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var pl = at(u, .6, 1) * 16, tip = HP(320, 440, 1.1, 180, 262, 640); return paper() + HAND(320, 440, 1.1, 180, { f: { middle: { pull: pl } }, hl: "middle" }) +
    arrow(tip[0], tip[1] - 20, tip[0], tip[1] - 90 - 6 * Math.sin(t * 6), ORANGE, 7, at(u, .5, .4)) + inset(530, 650, 105, J(-10, 0, .55, { g: at(u, .8, 1) * 24, gas: 1 }), at(u, 1.4, .3));
});
shot([10, 1], push(330, 400, 1.04, 1.1), function (u, d, t) {
  var g = at(u, .2, 1.6) * 30; return paper() + J(330, 400, 1.15, { g: g, gas: 1, hl: "cap" }) + arrow(110, 400, 20, 400, ORANGE, 7, at(u, .3, .4)) + arrow(560, 400, 630, 400, ORANGE, 7, at(u, .3, .4)) +
    label(330, 330, 470, 170, "بيتمط", OLIVE, at(u, 1.4, .4), 28);
}, { tr: "in" });
// 11 · more space, much lower pressure: the gauge needle falls
shot(11, push(330, 420, 1.1, 1.0), function (u, d, t) {
  var g = 30 + 3 * Math.sin(t * 2.5); return paper() + J(330, 420, 1.15, { g: g, gas: 1 }) + measure(268, 560, 314, 560, at(u, .2, .5), "") + gauge(500, 180, 90, lerp(.9, .1, at(u, .4, 1.6)), 1);
});
// 12 · the crack: in a split second the gas comes out as one bubble — «طق!»
shot(12, push(330, 410, 1.0, 1.12), function (u, d, t) {
  var tc = LN[12].end - LN[12].start - 0.36, b = clamp((u - tc) / .12), g = 30 + 4 * at(u, tc, .15);
  return paper() + J(330, 410, 1.15, { g: g, gas: 1, bub: b }) + gauge(500, 170, 80, .1, 1) + burst(300, 410, (u - tc) / .8, 110) +
    G("translate(140 640) scale(" + f(pop(clamp((u - tc) / .5))) + ")", T("طق!", 0, 0, 84, ORANGE, 800)) + (b >= 1 ? label(300, 380, 450, 640, "فقاعة", BLUE, at(u, tc + .4, .4), 30) : "");
});
// 13 · 2015: they filmed it in an MRI scanner; a dark gap appears at the moment of the sound
shot(13, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var cyc = (u * .5) % 1, b = cyc > .55 ? 1 : 0, s = paper();
  s += R(70, 160, 500, 420, "#0f0f0f", 3) + G("", '<clipPath id="mri"><rect x="72" y="162" width="496" height="416"/></clipPath><g clip-path="url(#mri)">' + J(320, 370, .8, { mri: true, g: 18 + 10 * b, bub: b }) + '</g>', 1);
  s += T("MRI", 110, 200, 22, "#bbb", 700, "start") + N("2015", 320, 680, 64, ORANGE) + (b ? T("الفقاعة", 380, 300, 26, "#fff", 800) : "");
  return s + G("", '<rect x="74" y="164" width="' + f(492 * cyc) + '" height="4" fill="' + ORANGE + '"/>', 1) + speaker(500, 520, .8, b, t);
});
// 14 · why not again right away? the bubble is still there
shot(14, push(330, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + J(330, 400, 1.15, { g: 26, gas: .4, bub: 1 }) + T("؟", 520, 230, 150, ORANGE, 800) + speaker(150, 640, .9, false, t) + cross(150, 640, .9, at(u, .8, .4));
}, { tr: "out" });
// 15 · the gas needs about 20 minutes to dissolve back: the bubble shrinks, the dots come back, the clock runs
shot(15, push(330, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, d - .8); return paper() + J(330, 470, 1.0, { g: lerp(26, 8, k), gas: k, bub: lerp(1, .05, k) }) + clock20(470, 170, 90, k) +
    numBox(count(20, k), 210, 170, at(u, .3, .3), 54) + G("", T("دقيقة", 210, 240, 30, INK, 800), at(u, .5, .3));
});
// 16 · why do we crack them at all? a man at his desk
shot(16, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var fl = 640, h = [[214, 446 + 3 * Math.sin(t * 5)], [220, 448 + 3 * Math.sin(t * 5)]];
  return paper() + floor(fl) + desk(60, 220, fl) + chair(300, fl) + whole(sitter(300, fl, h, 0)) + T("؟", 480, 220, 140, ORANGE, 800);
});
// 17 · after the crack the joint is a little looser and moves further: an arc of motion widens, relief
shot(17, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var k = at(u, .4, 1.2), sw = 12 * Math.sin(t * 2.2), s = paper();
  var amp = lerp(12, 34, k), ang = amp * Math.sin(t * 2.2), R0 = 250;
  s += J(300, 430, .9, { g: 10, bub: .6, gas: .3, skin: false, rot: ang });
  var a0 = 180 - amp, a1 = 180 + amp, cx = 354, cy = 430;
  s += '<path d="M' + f(cx + R0 * Math.cos(a0 * Math.PI / 180)) + ' ' + f(cy + R0 * Math.sin(a0 * Math.PI / 180)) + ' A' + R0 + ' ' + R0 + ' 0 0 1 ' + f(cx + R0 * Math.cos(a1 * Math.PI / 180)) + ' ' + f(cy + R0 * Math.sin(a1 * Math.PI / 180)) + '" stroke="' + ORANGE + '" stroke-width="5" fill="none" stroke-dasharray="12 8"/>';
  return s + tag("أوسع شوية", 330, 120, at(u, .9, .3), 34, ORANGE) + check(520, 690, 1.3, at(u, 1.8, .4), OLIVE);
});
// 18 · and it becomes a habit, like jiggling a leg when you're nervous or bored
shot(18, push(320, 440, 1.04, 1.0), function (u, d, t) {
  var fl = 640, sh = Math.abs(Math.sin(t * 11)), h = [[214, 446], [220, 448]];
  return paper() + floor(fl) + desk(60, 220, fl) + chair(300, fl) + whole(sitter(300, fl, h, sh)) + tag("عادة", 470, 160, at(u, .3, .3), 42, ORANGE) +
    iconBox(110, 150, 130, clock20(0, 0, 44, (t * .2) % 1), at(u, 1.6, .3));
});
// 19 · the myth: cracking gives you arthritis — no
shot(19, push(320, 410, 1.06, 0.98), function (u, d, t) {
  return paper() + J(330, 410, 1.0, { g: 0, wear: 1 }) + tag("خشونة", 330, 160, at(u, .3, .3), 42, ORANGE) + cross(330, 410, 2.2, at(u, d - 1.4, .5));
}, { tr: "out" });
// 20 · Donald Unger: the left hand only, every day, for more than 60 years
shot(20, push(320, 430, 1.0, 1.05), function (u, d, t) {
  var cr = Math.sin(t * 4) > .6 ? 1 : 0;
  return paper() + HAND(160, 420, .72, 180, { hl: "middle", sleeve: SHIRT_R }, true) + HAND(480, 420, .72, 180, { sleeve: SHIRT_R }) +
    T("الشمال", 170, 140, 32, ORANGE, 800) + T("اليمين", 470, 140, 32, INK, 800) + burst(HP(160, 420, .72, 180, 262, 342, true)[0], HP(160, 420, .72, 180, 262, 342, true)[1], ((t * 4 / (Math.PI * 2)) % 1) * 1.4, 50) +
    numBox("+" + count(60, at(u, 1.2, 1.4)), 320, 730, at(u, 1, .3), 44) + G("", T("سنة", 450, 744, 30, INK, 800), at(u, 1.4, .3));
});
// 21 · in the end neither hand had arthritis; studies on hundreds of people agree
shot(21, push(320, 420, 1.04, 0.98), function (u, d, t) {
  var s = paper() + HAND(165, 400, .66, 180, { bones: 1, sleeve: SHIRT_R }, true) + HAND(475, 400, .66, 180, { bones: 1, sleeve: SHIRT_R }) + R(-100, 636, 840, 300, PAPER, 0) + '<path d="M40 636 H600" stroke="' + INK + '" stroke-width="1.6"/>' +
    check(190, 120, 1.2, at(u, .4, .4), OLIVE) + check(450, 120, 1.2, at(u, .8, .4), OLIVE);
  var k = at(u, d * .35, 1.2); for (var i = 0; i < 30; i++) s += G("", personIcon(68 + (i % 15) * 36, 680 + Math.floor(i / 15) * 44, .8, i % 3 ? GREY : KHAKI), clamp(k * 30 - i));
  return s;
});
// 22 · but pain or swelling is something else: see a doctor
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var p = .5 + .5 * Math.sin(t * 5);
  var mk = HP(320, 430, 1.15, 180, 262, 342); return paper() + HAND(320, 430, 1.15, 180, { f: { middle: { red: .45 + .4 * p } } }) + '<circle cx="' + f(mk[0]) + '" cy="' + f(mk[1]) + '" r="' + f(40 + 8 * p) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(.4 + .5 * p) + '"/>' +
    tag("وجع / ورم", 470, 150, at(u, .3, .3), 32, ORANGE) +
    iconBox(110, 150, 130, '<path d="M-30 -36 V0 Q-30 26 0 26 Q30 26 30 0 V-36" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M0 26 V40 Q0 52 18 52 Q34 52 34 36" stroke="' + INK + '" stroke-width="5" fill="none"/>' + C(34, 30, 9, GREY, 2.4), at(u, 1.4, .3));
});
// 23 · «يعني من الآخر»: the whole thing at once, numbered
shot(23, push(330, 410, 0.96, 1.04), function (u, d, t) {
  var b = at(u, 1.6, .2); return paper() + J(330, 410, 1.1, { g: 28, gas: 1 - b * .6, bub: b }) + arrow(110, 410, 30, 410, ORANGE, 7, at(u, .3, .3)) +
    callout("1", 80, 350, at(u, .3, .3), 20) + callout("2", 470, 260, at(u, .9, .3), 20) + gauge(470, 200, 0, 0, 0) + callout("3", 300, 300, at(u, 1.6, .3), 20) + clock20(520, 640, 60, at(u, 2.4, 1.6)) + callout("4", 440, 600, at(u, 2.4, .3), 20);
}, { tr: "out" });
// 24 · the odd fact: his mother told him he'd get arthritis; he ran the test for 60 years and won a prize for it (Ig Nobel 2009)
shot(24, push(320, 430, 1.0, 1.05), function (u, d, t) {
  var fl = 700, s = paper() + floor(fl);
  var mom = fig({ x: 470, y: fl - 212, lean: 2, shirt: "#9a5a4a", hair: "#b9b2a6", hands: [[350, fl - 318 + 4 * Math.sin(t * 6)], null], bend: [1, -1] });
  var kh = [[160, fl - 236 + 3 * Math.sin(t * 8)], [164, fl - 232 + 3 * Math.sin(t * 8)]];
  var kid = fig({ x: 200, y: fl - 212 * .72, s: .72, lean: 0, shirt: SHIRT_V, hands: kh, bend: [-1, -1] });
  s += whole(kid) + whole(mom) + burst(158, fl - 236, ((t * 1.3) % 1) * 1.2, 30);
  s += G("", '<path d="M330 90 H590 Q610 90 610 110 V190 Q610 210 590 210 H500 L470 250 L470 210 H330 Q310 210 310 190 V110 Q310 90 330 90 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>' + T("هتجيلك خشونة!", 460, 162, 30, INK, 800), at(u, .2, .4));
  s += G("translate(170 250) scale(.8)", '<path d="M-70 -120 H70 V-60 Q70 0 0 10 Q-70 0 -70 -60 Z" fill="#d9a53a" stroke="' + INK + '" stroke-width="2.6"/><path d="M-70 -100 Q-110 -100 -104 -64 Q-98 -36 -60 -34 M70 -100 Q110 -100 104 -64 Q98 -36 60 -34" stroke="' + INK + '" stroke-width="5" fill="none"/>' + R(-12, 10, 24, 60, "#d9a53a", 2.4) + R(-60, 70, 120, 24, "#7c5434", 2.4) + N("2009", 0, -50, 34, INK) + T("Ig Nobel", 0, 130, 30, ORANGE, 800), at(u, LN[24].end - LN[24].start - 1.6, .4));
  return s;
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // line 0: a man at a desk pushes his clasped hands forward. line 1: «طق» at the knuckles. line 2: the same finger again, no sound
  var fl = 600, s = "";
  if (li < 2) {
    var k = clamp((t - LN[0].start) / 1.6), hx = lerp(250, 150, k), h = [[hx, 360], [hx + 4, 364]];
    s += floor(fl) + desk(40, 200, fl) + chair(330, fl) + whole(sitter(330, fl, h, 0, { bend: [1, 1] }));
    if (li === 1) { var u = t - LN[1].start; s += burst(hx - 20, 360, (u % 1.1) / .7, 60) + G("", T("طق طق", 160, 230, 44, ORANGE, 800), clamp(u / .3)); }
  } else {
    var u2 = t - LN[2].start; s += HAND(300, 360, 1.0, 180, { f: { index: { pull: 12 * Math.abs(Math.sin(u2 * 2)) } }, hl: "index" }) + speaker(480, 150, 1, false, t) + cross(480, 150, 1.1, clamp((u2 - .8) / .4));
  }
  return s;
};
SCENE.bumper = function (u, t) {
  var b = .5 + .5 * Math.sin(t * 3);
  return '<rect x="0" y="0" width="180" height="200" fill="' + PAPER + '"/>' + J(95, 100, .42, { g: 20, bub: .4 + .6 * b, gas: 1 });
};
SCENE.outro = function (svg, u, t) {
  return J(300, 140, .62, { g: 26, bub: 1, gas: .6 }) + callout("1", 60, 80, ease(u / .3)) + callout("2", 420, 60, ease(u / .3 - .5)) + callout("3", 280, 60, ease(u / .3 - 1)) + callout("4", 330, 240, ease(u / .3 - 1.5));
};
