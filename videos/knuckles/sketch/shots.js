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

// ── a hand seen from the back (fingers up, wrist at 0,0); proportions of a real adult hand ──
// palm (wrist → knuckles) ≈ 0.55 of the hand length, middle finger ≈ 0.45; phalanges about 1 : 0.6 : 0.45.
// o: {x, y, s, rot, mirror, bones 0..1 (X-ray overlay), pull: [finger, gap], hl: finger (knuckle highlight), swell: finger, sleeve}
var FING = [ { x: -50, y: -160, w: 31, L: [56, 34, 27] }, { x: -17, y: -166, w: 32, L: [62, 40, 30] },
             { x: 17, y: -162, w: 30, L: [58, 37, 28] }, { x: 49, y: -148, w: 25, L: [45, 27, 24] } ];
function handTop(o) {
  var s = "", i, sk = o.skin || SKIN;
  if (o.sleeve !== false) s += R(-62, 10, 124, 260, o.sleeve || SHIRT_V, 2.4) + '<path d="M-62 34 H62" stroke="' + INK + '" stroke-width="1.4"/>';
  s += '<path d="M-58 14 L-60 -20 L-70 -80 L-68 -150 Q-60 -170 -36 -172 L40 -166 Q64 -160 66 -140 L64 -60 L58 14 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  // thumb: from the wrist side, angled out
  s += G("translate(-58 -52) rotate(-38)", '<path d="M-16 0 L-15 -58 Q-14 -96 0 -98 Q15 -96 16 -58 L16 0 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-12 -52 h24" stroke="' + INK + '" stroke-width="1.4"/><path d="M-8 -86 q8 -6 16 0 v8 h-16 z" fill="#efd2c2" stroke="' + INK + '" stroke-width="1.2"/>');
  for (i = 0; i < 4; i++) {
    var F = FING[i], gap = o.pull && o.pull[0] === i ? o.pull[1] : 0, L = F.L[0] + F.L[1] + F.L[2], w = F.w, x = F.x, y0 = F.y - gap, top = y0 - L;
    var fill = o.swell === i ? "#e08a74" : sk;
    if (gap) s += '<path d="M' + f(x - w / 2 + 1) + ' ' + f(F.y + 6) + ' L' + f(x - w / 2 + 2) + ' ' + f(y0) + ' M' + f(x + w / 2 - 1) + ' ' + f(F.y + 6) + ' L' + f(x + w / 2 - 2) + ' ' + f(y0) + '" stroke="' + INK + '" stroke-width="2"/>' + R(x - w / 2 + 2, y0 - 2, w - 4, gap + 10, fill, 0);
    s += '<path d="M' + f(x - w / 2) + ' ' + f(y0 + 8) + ' L' + f(x - w * .42) + ' ' + f(top + w * .4) + ' Q' + f(x) + ' ' + f(top - w * .25) + ' ' + f(x + w * .42) + ' ' + f(top + w * .4) + ' L' + f(x + w / 2) + ' ' + f(y0 + 8) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    var yp = y0 - F.L[0], yd = yp - F.L[1];
    s += '<path d="M' + f(x - w * .3) + ' ' + f(yp) + ' q' + f(w * .3) + ' -4 ' + f(w * .6) + ' 0 M' + f(x - w * .28) + ' ' + f(yp + 5) + ' q' + f(w * .28) + ' -3 ' + f(w * .56) + ' 0 M' + f(x - w * .26) + ' ' + f(yd) + ' q' + f(w * .26) + ' -3 ' + f(w * .52) + ' 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    s += '<path d="M' + f(x - w * .28) + ' ' + f(top + 8) + ' q' + f(w * .28) + ' -9 ' + f(w * .56) + ' 0 v' + f(F.L[2] * .45) + ' h' + f(-w * .56) + ' z" fill="#efd2c2" stroke="' + INK + '" stroke-width="1.2"/>';
    // the knuckle bump on the back of the hand
    s += '<path d="M' + f(x - w * .34) + ' ' + f(F.y + 10) + ' q' + f(w * .34) + ' -10 ' + f(w * .68) + ' 0" stroke="' + (o.hl === i ? ORANGE : INK) + '" stroke-width="' + (o.hl === i ? 4 : 1.6) + '" fill="none"/>';
  }
  if (o.bones) s += G("", handBones(o), o.bones);
  return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f((o.mirror ? -1 : 1) * (o.s || 1)) + " " + f(o.s || 1) + ")", s);
}
// the bones of the hand laid over it (reference v07): carpals, metacarpals, three phalanges per finger, two in the thumb
function handBones(o) {
  var s = "", i, j; function bone(x1, y1, x2, y2, w) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" stroke-linecap="round"/><path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + BONEC + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>' + C(x1, y1, w * .62, BONEC, 1.4) + C(x2, y2, w * .62, BONEC, 1.4); }
  [[-34, -30, 11, 9], [-12, -34, 10, 9], [10, -33, 10, 9], [32, -28, 9, 8], [-30, -10, 12, 9], [-8, -12, 10, 8], [13, -11, 9, 8], [33, -8, 8, 9]].forEach(function (c, j) { s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '" transform="rotate(' + (j * 23 % 40 - 20) + ' ' + c[0] + ' ' + c[1] + ')" fill="' + BONEC + '" stroke="' + INK + '" stroke-width="1.6"/>'; });
  for (i = 0; i < 4; i++) { var F = FING[i], gap = o.pull && o.pull[0] === i ? o.pull[1] : 0, y = F.y - gap, mx = F.x * .7;
    s += bone(mx, -50, F.x, F.y - 6, 11);
    s += bone(F.x, y - 8, F.x, y - F.L[0] + 4, 10) + bone(F.x, y - F.L[0] - 3, F.x, y - F.L[0] - F.L[1] + 4, 9) + bone(F.x, y - F.L[0] - F.L[1] - 3, F.x, y - F.L[0] - F.L[1] - F.L[2] + 8, 8);
    if (o.hl === i) s += '<circle cx="' + f(F.x) + '" cy="' + f(F.y - 6 - gap / 2) + '" r="' + f(14 + gap / 2) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3.5"/>'; }
  s += G("translate(-58 -52) rotate(-38)", bone(0, 6, 0, -44, 11) + bone(0, -52, 0, -76, 10) + bone(0, -84, 0, -92, 8));
  return s;
}

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
  return paper() + handTop({ x: 320, y: 610, s: 1.75, bones: at(u, .4, .8), hl: at(u, 1.2, .2) > 0 ? 0 : null }) + label(232, 316, 470, 120, "مفصل", OLIVE, at(u, 1.4, .5), 30);
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
  var g = 4 + 2 * Math.sin(t * 3); return paper() + handTop({ x: 330, y: 650, s: 1.55, pull: [1, at(u, .6, 1) * 16], hl: 1 }) +
    arrow(304, 120, 304, 40, ORANGE, 7, at(u, .5, .4)) + inset(500, 560, 110, J(-10, 0, .55, { g: at(u, .8, 1) * 24, gas: 1 }), at(u, 1.4, .3));
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
  var tc = d * .62, b = clamp((u - tc) / .12), g = 30 + 4 * at(u, tc, .15);
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
  return paper() + handTop({ x: 170, y: 640, s: .95, mirror: true, hl: 1, sleeve: SHIRT_R }) + handTop({ x: 470, y: 640, s: .95, sleeve: SHIRT_R }) +
    T("الشمال", 170, 140, 32, ORANGE, 800) + T("اليمين", 470, 140, 32, INK, 800) + burst(185, 470, ((t * 4 / (Math.PI * 2)) % 1) * 1.4, 50) +
    numBox("+" + count(60, at(u, 1.2, 1.4)), 320, 730, at(u, 1, .3), 44) + G("", T("سنة", 450, 744, 30, INK, 800), at(u, 1.4, .3));
});
// 21 · in the end neither hand had arthritis; studies on hundreds of people agree
shot(21, push(320, 420, 1.04, 0.98), function (u, d, t) {
  var s = paper() + handTop({ x: 190, y: 450, s: .75, mirror: true, bones: 1, sleeve: SHIRT_R }) + handTop({ x: 450, y: 450, s: .75, bones: 1, sleeve: SHIRT_R }) + R(-100, 636, 840, 300, PAPER, 0) + '<path d="M40 636 H600" stroke="' + INK + '" stroke-width="1.6"/>' +
    check(190, 120, 1.2, at(u, .4, .4), OLIVE) + check(450, 120, 1.2, at(u, .8, .4), OLIVE);
  var k = at(u, d * .35, 1.2); for (var i = 0; i < 30; i++) s += G("", personIcon(68 + (i % 15) * 36, 680 + Math.floor(i / 15) * 44, .8, i % 3 ? GREY : KHAKI), clamp(k * 30 - i));
  return s;
});
// 22 · but pain or swelling is something else: see a doctor
shot(22, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var p = .5 + .5 * Math.sin(t * 5);
  return paper() + handTop({ x: 320, y: 640, s: 1.4, swell: 1, hl: 1 }) + '<circle cx="296" cy="398" r="' + f(36 + 8 * p) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(.4 + .5 * p) + '"/>' +
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
    var u2 = t - LN[2].start; s += handTop({ x: 300, y: 600, s: 1.45, pull: [0, 10 * Math.abs(Math.sin(u2 * 2))], hl: 0, bones: 0 }) + speaker(480, 150, 1, false, t) + cross(480, 150, 1.1, clamp((u2 - .8) / .4));
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
