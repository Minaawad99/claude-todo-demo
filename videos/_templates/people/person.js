/* «إيه الحكاية؟» — the detailed person (front / three-quarter view), after the look the channel picked from its Gemini
   cover (videos/person-demo; rules in videos/_templates/people/README.md): a face with eyes, brows, nose, mouth and expressions; hands with five fingers in poses;
   a sweater with ribbed collar, cuffs and hem; folds and soft shading. Joints keep the real body proportions used in every
   sketch episode (Drillis & Contini, H = 400 units at s = 1):
     hip joint 0.52H · shoulder 0.818H · chin 0.87H · top of head 1.0H
     thigh 0.245H · shank 0.246H · upper arm 0.186H · forearm 0.146H · hand 0.108H (palm 0.06H + middle finger 0.048H)
     shoulder joints 0.22H apart · hip joints 0.10H apart · head 0.13H tall, 0.093H wide · neck 0.065H wide
   Self-contained (own helpers inside); loads in any skill's page. API: window.PERSON = {front, side, walkPose, sideHipY, mix,
   sofaFront, hand, head, colors, setInk}; the same names are also plain globals (person, personSide…) where free.
   Everything is redrawn from the pose, so a pose can be tweened (PERSON.mix) and the render stays deterministic.

   person(o) — o.x, o.y: the point between the hip joints; o.s: scale.
     o.lean (deg, + leans to the viewer's right) · o.slump (0..1: shoulders drop, head sinks) · o.breath (0..1)
     o.legs: "stand" | "sit" | {k: [[dx,dy],[dx,dy]], a: [[dx,dy],[dx,dy]]} knee and ankle offsets from each hip joint (units)
     o.arms: [viewer-left arm, viewer-right arm], each {to: [x, y] wrist target in world coords | rel: [dx, dy] from the
             shoulder in units, bend: ±1 (elbow side), hand: "open" | "relaxed" | "flat" | "fist" | "point" | "thumb",
             rot: hand angle in deg (default: along the forearm), palm: true to show the palm}
     o.head: {tilt (deg), turn (-1..1, three-quarter turn), nod (0..1, chin to chest)}
     o.face: {eyes (0 closed .. 1 open, 1.25 wide), look [dx, dy] (-1..1), brows: "neutral" | "raised" | "worried" | "angry",
             mouth: "neutral" | "smile" | "grin" | "open" | "o" | "frown" | "yawn", tired: bool}
     o.colors: {shirt, shirtD, pants, pantsD, hair, skin, skinD, socks}
     o.face.mustache: a colour draws a moustache · o.headset: true (or a colour) draws a headset with a boom mic
   returns {svg, joints}: joints has the shoulder, elbow, wrist, hip, knee, ankle points and the head centre. */
(function () {
// own small helpers, so the kit works in any skill (sketch, animation, story-2d, law…) without the sketch helpers loaded
var INK = (window.PERSON_INK || "#2a2016"), CLIPN = 0;
function f(n) { return (+n).toFixed(1); }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + op.toFixed(3) + '"' : "") + '>' + inner + '</g>'; }
function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
// outfits: the body never changes, the clothes follow the topic. o.outfit = a preset name or {base, top, over, tie, epaulettes, hat, feet, colors}
//   top: "sweater" (ribbed) | "tshirt" (short sleeves) | "shirt" (collar, buttons, cuffs) · over: "labcoat" | "vest" (hi-vis) | "apron"
//   hat: "hardhat" | "cap" | "pilot" · feet: "socks" | "shoes" | "boots" · tie, epaulettes: true
var OUTFITS = {
  home:   { top: "sweater", feet: "socks" },
  casual: { top: "tshirt", feet: "shoes", colors: { shirt: "#c9a77c", shirtD: "#a5845c", pants: "#4b5a6e", pantsD: "#38445a" } },
  office: { top: "shirt", tie: true, feet: "shoes", colors: { shirt: "#e8eef3", shirtD: "#bccbd6", pants: "#3b3f4a", pantsD: "#2a2d36", tie: "#7a2e2e" } },
  doctor: { top: "shirt", tie: true, over: "labcoat", feet: "shoes", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3", tie: "#4a6f8a", pants: "#3d4656", pantsD: "#2b3240" } },
  worker: { top: "tshirt", over: "vest", hat: "hardhat", feet: "boots", colors: { shirt: "#7f97a6", shirtD: "#61798a", pants: "#4b5a6e", pantsD: "#38445a" } },
  pilot:  { top: "shirt", tie: true, epaulettes: true, hat: "pilot", feet: "shoes", colors: { shirt: "#f4f2ec", shirtD: "#d6d2c6", pants: "#262a36", pantsD: "#191c25", tie: "#262a36" } },
  chef:   { top: "shirt", over: "apron", hat: "cap", feet: "shoes", colors: { shirt: "#f4f2ec", shirtD: "#d6d2c6", pants: "#3b3f4a", pantsD: "#2a2d36", hat: "#f4f2ec", hatD: "#d6d2c6" } }
};
function pOutfit(o, c) {
  var x = o.outfit, of = {}, k;
  if (typeof x === "string") x = { base: x };
  x = x || {};
  var b = OUTFITS[x.base || "home"] || OUTFITS.home;
  for (k in b) if (k !== "colors") of[k] = b[k];
  for (k in x) if (k !== "colors" && k !== "base") of[k] = x[k];
  var cols = Object.assign({}, b.colors || {}, x.colors || {});
  for (k in cols) c[k] = cols[k];
  if (o.colors) for (k in o.colors) c[k] = o.colors[k];
  of.top = of.top || "sweater"; of.feet = of.feet || "socks";
  return of;
}
var PSN = { skin: "#e0a98a", skinD: "#c07f62", skinL: "#efc3a8", lip: "#b56b5c", hair: "#2f2620", hairL: "#4d3f34",
  shirt: "#a9c3dc", shirtD: "#7f9bb6", pants: "#3d3c3f", pantsD: "#2a292c", socks: "#56565c", white: "#fbf8f1", iris: "#4a3426",
  coat: "#f6f4ee", coatD: "#d8d4c8", vest: "#f08a24", vestD: "#c96a14", reflect: "#e9eef0", tie: "#7a2e2e", hat: "#f2c230", hatD: "#c99a20",
  shoes: "#2e2a26", apron: "#f4f2ec", apronD: "#d6d2c6", button: "#f4f2ec" };
function pPath(pts, close) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1])); }
function pLine(pts, col, w, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function L2p(a, b, k, off) { var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [a[0] + dx * k - dy / d * (off || 0), a[1] + dy * k + dx / d * (off || 0)]; }
function pIK(sh, tg, l1, l2, bend) { var dx = tg[0] - sh[0], dy = tg[1] - sh[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, .01)))); return [sh[0] + Math.cos(a + bend * c) * l1, sh[1] + Math.sin(a + bend * c) * l1]; }
// a limb segment: ink outline, fill, and a shadow strip on the side away from the light (upper left)
function pTube(a, b, w1, w2, col, colD, s) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, sd = (nx * .7 + ny * -.7) > 0 ? 1 : -1;   // shade on the right/lower side
  var P = [[a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2], [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2]];
  var poly = "M" + P.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " Z";
  var sh = [[a[0] - sd * nx * w1 * .3 + dx * .08, a[1] - sd * ny * w1 * .3 + dy * .08], [b[0] - sd * nx * w2 * .3 - dx * .08, b[1] - sd * ny * w2 * .3 - dy * .08]];
  return { ink: '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(w1 / 2 + 1.3 * s) + '" fill="' + INK + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(w2 / 2 + 1.3 * s) + '" fill="' + INK + '"/><path d="' + poly + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="' + f(2.6 * s) + '" stroke-linejoin="round"/>',
    fill: '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="' + f(w1 / 2) + '" fill="' + col + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="' + f(w2 / 2) + '" fill="' + col + '"/><path d="' + poly + '" fill="' + col + '"/>' +
      pLine(sh, colD, Math.min(w1, w2) * .32, ' opacity=".75"') };
}
// one continuous outline along a chain of points with a width at each point: no joint circles, the contour flows
// through elbows, knees and finger joints. Returns {fill (closed), line (open at the start, so it joins the body or palm
// without a seam)}. cap: round the far end (a fingertip, a knee seen from the front); otherwise the end is cut square.
function pLimb(pts, ws, cap) {
  var L = [], Rr = [], n = pts.length;
  for (var i = 0; i < n; i++) {
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = ws[i] / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Rr.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  var e = pts[n - 1], q = pts[n - 2], ex = e[0] - q[0], ey = e[1] - q[1], el = Math.hypot(ex, ey) || 1; ex /= el; ey /= el;
  var we = ws[n - 1] / 2, tip = cap ? [[e[0] + (-ey * .72 + ex * .62) * we, e[1] + (ex * .72 + ey * .62) * we], [e[0] + ex * we, e[1] + ey * we], [e[0] + (ey * .72 + ex * .62) * we, e[1] + (-ex * .72 + ey * .62) * we]] : [];
  var ring = L.concat(tip, Rr.slice().reverse());
  return { fill: pPath(ring, true), line: pPath(ring, false), mid: pts };
}
function pLimbDraw(lb, col, s, colD, sw) {
  return '<path d="' + lb.fill + '" fill="' + col + '"/>' + (colD ? colD : "") + '<path d="' + lb.line + '" fill="none" stroke="' + INK + '" stroke-width="' + f((sw || 2.3) * s) + '" stroke-linejoin="round" stroke-linecap="round"/>';
}
// a soft shadow strip inside a limb, on the side away from the light (upper left)
function pShade(pts, ws, col, s, k) {
  var dx = pts[pts.length - 1][0] - pts[0][0], dy = pts[pts.length - 1][1] - pts[0][1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, sd = (nx - ny) > 0 ? -1 : 1, P = [];
  for (var i = 1; i < pts.length - 1; i++) P.push([pts[i][0] + sd * nx * ws[i] * .27, pts[i][1] + sd * ny * ws[i] * .27]);
  if (P.length < 2) return "";
  return '<path d="' + pPath(P, false) + '" stroke="' + col + '" stroke-width="' + f(Math.min.apply(null, ws) * .3) + '" fill="none" stroke-linecap="round" opacity="' + (k || .55) + '"/>';
}
// ── the hand: wrist point w, direction ang (radians, wrist → fingertips), side ±1 puts the thumb on one side ──
// palm 24 long, 16 wide at the wrist and 21 across the knuckles; fingers index 17 · middle 19 · ring 18 · little 14 in three
// tapering joints (45 / 30 / 25 %), each finger thinner at the tip with a nail; the thumb grows out of the palm's heel.
function pHand(w, ang, kind, side, s, colors, palm) {
  var c = colors || PSN, ca = Math.cos(ang), sa = Math.sin(ang);
  function P(x, y) { y *= side; return [w[0] + (x * ca - y * sa) * s, w[1] + (x * sa + y * ca) * s]; }
  // per finger: [spread angle (deg), curl 0..1]; then the thumb: [angle, curl]
  var F = { open: [[-15, 0], [-5, .02], [5, .04], [15, .06], [-60, 0]], relaxed: [[-7, .32], [-2, .38], [3, .44], [8, .52], [-36, .15]],
            flat: [[-3, .02], [-1, .02], [1, .03], [3, .05], [-22, .02]], fist: [[0, 1], [0, 1], [0, 1], [0, 1], [24, .35]],
            point: [[-3, 0], [0, 1], [0, 1], [0, 1], [18, .3]], thumb: [[0, 1], [0, 1], [0, 1], [0, 1], [-90, 0]] }[kind] || null;
  F = F || [[-7, .32], [-2, .38], [3, .44], [8, .52], [-36, .15]];
  var bases = [[22, -7.4], [23.6, -2.5], [23, 2.4], [21, 6.9]], lens = [17, 19, 18, 14], wds = [4.9, 5.1, 4.8, 4.2], out = "", fing = "", nails = "";
  function chain(bx, by, a0, len, wd, curl, nail) {
    var pts = [[bx - 2.5, by]], ws = [wd * 1.05], x = bx, y = by, a = a0 * Math.PI / 180, segs = [.45, .3, .25], bend = [.35, .5, .45];
    pts.push([x, y]); ws.push(wd);
    for (var j = 0; j < 3; j++) { a += curl * bend[j] * .45; var L = len * segs[j] * (1 - curl * [.28, .78, .96][j]); if (L < .4) L = .4; x += Math.cos(a) * L; y += Math.sin(a) * L; pts.push([x, y]); ws.push(wd * [.97, .9, .8][j]); }
    var lb = pLimb(pts.map(function (p) { return P(p[0], p[1]); }), ws.map(function (v) { return v * s; }), true);
    var r = pLimbDraw(lb, c.skin, s, "", 2.1);
    // joint creases across the finger, short and curved
    for (var k = 2; k <= 3; k++) { var p0 = pts[k], aa = Math.atan2(pts[k + 1][1] - pts[k - 1][1], pts[k + 1][0] - pts[k - 1][0]), hw = ws[k] * .32; r += '<path d="M' + f(P(p0[0] - Math.sin(aa) * hw, p0[1] + Math.cos(aa) * hw)[0]) + ' ' + f(P(p0[0] - Math.sin(aa) * hw, p0[1] + Math.cos(aa) * hw)[1]) + ' L' + f(P(p0[0] + Math.sin(aa) * hw, p0[1] - Math.cos(aa) * hw)[0]) + ' ' + f(P(p0[0] + Math.sin(aa) * hw, p0[1] - Math.cos(aa) * hw)[1]) + '" stroke="' + c.skinD + '" stroke-width="' + f(.8 * s) + '" opacity=".8"/>'; }
    if (nail && curl < .6) { var t = pts[4], u = pts[3], na = Math.atan2(t[1] - u[1], t[0] - u[0]), nc = [t[0] - Math.cos(na) * 2.6, t[1] - Math.sin(na) * 2.6], q = P(nc[0], nc[1]);
      r += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="' + f(2.3 * s) + '" ry="' + f(wd * .3 * s) + '" transform="rotate(' + f((ang + side * na) * 180 / Math.PI) + ' ' + f(q[0]) + ' ' + f(q[1]) + ')" fill="' + c.skinL + '" stroke="' + c.skinD + '" stroke-width="' + f(.7 * s) + '"/>'; }
    return r;
  }
  for (var i = 3; i >= 0; i--) fing += chain(bases[i][0], bases[i][1], F[i][0], lens[i], wds[i], F[i][1], !palm);
  // the palm: narrower at the wrist, the heel of the hand, outlined on its two sides only so the fingers flow out of it
  var pp = [[-1, -7.5], [6, -9.5], [14, -10.2], [22.5, -9.4], [25, -4], [25, 4], [22.5, 9.3], [14, 10.6], [5, 9.6], [-1, 7.5]].map(function (p) { return P(p[0], p[1]); });
  var thumbFront = kind === "fist" || kind === "point", thumbSvg = "";
  out += fing + '{THUMB_BACK}<path d="' + pPath(pp, true) + '" fill="' + c.skin + '"/>';
  out += '<path d="' + pPath(pp.slice(0, 4), false) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linecap="round"/><path d="' + pPath(pp.slice(6), false) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '" stroke-linecap="round"/>';
  if (F[0][1] > .9 || F[1][1] > .9) out += '<path d="' + pPath([P(21, -8), P(24.5, -3), P(24.5, 3), P(21, 8)], false) + '" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" fill="none"/>';
  // back-of-hand tendons, or the palm's crease lines
  out += palm ? '<path d="' + pPath([P(5, -5), P(12, -1), P(19, 2)], false) + '" stroke="' + c.skinD + '" stroke-width="' + f(.9 * s) + '" fill="none"/><path d="' + pPath([P(8, 4), P(15, 5), P(21, 4)], false) + '" stroke="' + c.skinD + '" stroke-width="' + f(.9 * s) + '" fill="none"/>'
               : '<path d="M' + f(P(6, -2)[0]) + ' ' + f(P(6, -2)[1]) + ' L' + f(P(19, -3.5)[0]) + ' ' + f(P(19, -3.5)[1]) + ' M' + f(P(6, 2)[0]) + ' ' + f(P(6, 2)[1]) + ' L' + f(P(19, 2.5)[0]) + ' ' + f(P(19, 2.5)[1]) + '" stroke="' + c.skinD + '" stroke-width="' + f(.8 * s) + '" opacity=".55"/>';
  // the thumb: from inside the palm's heel, two joints, a nail
  var T0 = F[4], ta = T0[0] * Math.PI / 180, tx = 6, ty = -6, tp = [[tx - 3, ty + 1], [tx, ty]], tw = [6.6, 6.4];
  var tl = [8, 7], cx = tx, cy = ty, aa = ta;
  for (var j = 0; j < 2; j++) { aa += T0[1] * .6; cx += Math.cos(aa) * tl[j]; cy += Math.sin(aa) * tl[j]; tp.push([cx, cy]); tw.push([5.6, 4.9][j]); }
  var tlb = pLimb(tp.map(function (p) { return P(p[0], p[1]); }), tw.map(function (v) { return v * s; }), true);
  thumbSvg += thumbFront ? '<path d="' + tlb.fill + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="' + f(2.1 * s) + '" stroke-linejoin="round"/>' : pLimbDraw(tlb, c.skin, s, "", 2.1);
  if (!palm) { var nq = P(cx - Math.cos(aa) * 2.6, cy - Math.sin(aa) * 2.6); thumbSvg += '<ellipse cx="' + f(nq[0]) + '" cy="' + f(nq[1]) + '" rx="' + f(2.4 * s) + '" ry="' + f(1.7 * s) + '" transform="rotate(' + f((ang + side * aa) * 180 / Math.PI) + ' ' + f(nq[0]) + ' ' + f(nq[1]) + ')" fill="' + c.skinL + '" stroke="' + c.skinD + '" stroke-width="' + f(.7 * s) + '"/>'; }
  out = thumbFront ? out.replace('{THUMB_BACK}', '') + thumbSvg : out.replace('{THUMB_BACK}', thumbSvg);
  out += '<path d="' + pPath([P(4, -7.5), P(8, -4), P(9, 1)], false) + '" stroke="' + c.skinD + '" stroke-width="' + f(.9 * s) + '" fill="none" opacity=".7"/>';
  return out;
}
// ── the head: centre hc, local units (head 52 tall, 37 wide); turn shifts the features for a three-quarter view ──
function pHead(hc, s, rot, o, c) {
  var fc = o.face || {}, hd = o.head || {}, tr = hd.turn || 0, eo = fc.eyes == null ? 1 : fc.eyes, look = fc.look || [0, 0], mo = fc.mouth || "neutral", br = fc.brows || "neutral";
  var g = "", X = function (u) { return u + tr * 4.5; };
  var shape = [[0, -27.5], [12, -26], [18.4, -15], [18.8, -2], [17, 9], [12.5, 18.5], [6, 24.5], [0, 26.2], [-6, 24.5], [-12.5, 18.5], [-17, 9], [-18.8, -2], [-18.4, -15], [-12, -26]].map(function (p) { return [p[0] - tr * (p[0] > 0 ? 1.5 : -.5), p[1]]; });
  var ear = function (sd) { var ex = sd * (18.6 - tr * sd * 1.4); return '<path d="M' + f(ex) + ' -5 C' + f(ex + sd * 6) + ' -8 ' + f(ex + sd * 6.5) + ' 6 ' + f(ex + sd * .5) + ' 8 Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M' + f(ex + sd * 1.5) + ' -2 C' + f(ex + sd * 4) + ' -3 ' + f(ex + sd * 4) + ' 3 ' + f(ex + sd * 1.5) + ' 4" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>'; };
  g += ear(-1) + ear(1);
  g += '<path d="' + pPath(shape, true) + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // shading: the far cheek and jaw, a soft shadow under the hair line
  g += '<path d="M' + f(X(9)) + ' -12 C' + f(X(17)) + ' -6 ' + f(X(16)) + ' 12 ' + f(X(6)) + ' 23 C' + f(X(13)) + ' 18 17 8 18.4 -2 C18.4 -9 16 -13 ' + f(X(9)) + ' -12 Z" fill="' + c.skinD + '" opacity=".45"/>';
  // hair: a full dark cap with a short fringe, a few lighter strands
  var hair = [[-19.5, -2], [-20.5, -16], [-14, -28.5], [-2, -32.5], [11, -31], [19.5, -21], [20, -4], [17.5, -9], [16, -15.5], [X(9), -17.5], [X(3), -15], [X(-2), -18], [X(-9), -16], [-15.5, -14], [-17.5, -7]];
  g += '<path d="' + pPath(hair, true) + '" fill="' + c.hair + '" stroke="' + INK + '" stroke-width="1.8"/>';
  g += pLine([[-12, -27], [-6, -23], [0, -24]], c.hairL, 1.2) + pLine([[2, -29], [8, -25], [12, -25]], c.hairL, 1.2) + pLine([[-17, -18], [-14, -13]], c.hairL, 1.1);
  // brows
  var bv = { neutral: [0, 0], raised: [-3, 0], worried: [-1.5, -2.6], angry: [1, 2.4] }[br] || [0, 0];
  [-1, 1].forEach(function (sd) { var cx = X(sd * 7.6), inner = cx - sd * 3.6, outer = cx + sd * 4.2, y0 = -8.2 + bv[0];
    g += '<path d="M' + f(inner) + ' ' + f(y0 + bv[1] * .5 + (br === "worried" ? -1 : 0)) + ' Q' + f(cx) + ' ' + f(y0 - 2.2) + ' ' + f(outer) + ' ' + f(y0 + 1 - bv[1] * .3) + '" stroke="' + c.hair + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; });
  // eyes: almond whites, iris and pupil looking at look[], upper lid heavier; closed = a curved lid line with lashes
  [-1, 1].forEach(function (sd) {
    var cx = X(sd * 7.6), cy = -1.5, w = sd * tr > 0 ? 3.2 : 3.7, hh = 2.9 * eo, id = "ey" + (++CLIPN);
    if (eo < .12) { g += '<path d="M' + f(cx - w) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy + 2.6) + ' ' + f(cx + w) + ' ' + f(cy) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' + pLine([[cx - w * .5, cy + 1.6], [cx - w * .6, cy + 3]], INK, .9) + pLine([[cx + w * .3, cy + 1.9], [cx + w * .35, cy + 3.2]], INK, .9); }
    else {
      var eye = 'M' + f(cx - w) + ' ' + f(cy) + ' Q' + f(cx - w * .2) + ' ' + f(cy - hh * 1.25) + ' ' + f(cx + w) + ' ' + f(cy - hh * .15) + ' Q' + f(cx + w * .2) + ' ' + f(cy + hh * .9) + ' ' + f(cx - w) + ' ' + f(cy) + ' Z';
      g += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath><path d="' + eye + '" fill="' + PSN.white + '"/>';
      g += '<g clip-path="url(#' + id + ')"><circle cx="' + f(cx + look[0] * 1.6 + tr * .8) + '" cy="' + f(cy - hh * .1 + look[1] * 1) + '" r="2.15" fill="' + PSN.iris + '"/><circle cx="' + f(cx + look[0] * 1.6 + tr * .8) + '" cy="' + f(cy - hh * .1 + look[1] * 1) + '" r="1.05" fill="#140d08"/><circle cx="' + f(cx + look[0] * 1.6 + tr * .8 - .7) + '" cy="' + f(cy - hh * .1 + look[1] - .8) + '" r=".55" fill="#fff"/>' +
           (eo < .7 ? '<rect x="' + f(cx - w - 1) + '" y="' + f(cy - 4) + '" width="' + f(2 * w + 2) + '" height="' + f(3.6 * (1 - eo / .7) + .5) + '" fill="' + c.skinD + '"/>' : "") + '</g>';
      g += '<path d="M' + f(cx - w - .4) + ' ' + f(cy + .2) + ' Q' + f(cx - w * .2) + ' ' + f(cy - hh * 1.25 - .4) + ' ' + f(cx + w + .3) + ' ' + f(cy - hh * .15) + '" stroke="' + INK + '" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      g += '<path d="M' + f(cx - w * .5) + ' ' + f(cy + hh * .55) + ' Q' + f(cx + w * .2) + ' ' + f(cy + hh * .8) + ' ' + f(cx + w * .8) + ' ' + f(cy + hh * .2) + '" stroke="' + c.skinD + '" stroke-width=".9" fill="none"/>';
    }
    if (fc.tired) g += '<path d="M' + f(cx - w * .7) + ' ' + f(cy + 3.4) + ' Q' + f(cx) + ' ' + f(cy + 5.2) + ' ' + f(cx + w * .8) + ' ' + f(cy + 3.2) + '" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>';
  });
  // nose: a side line, the tip and one nostril, a little shadow
  var nx = X(tr * 2);
  g += '<path d="M' + f(nx - .6) + ' -2 C' + f(nx + .4) + ' 3 ' + f(nx + 2.6) + ' 6 ' + f(nx + 2.4) + ' 8.4 C' + f(nx + 1.4) + ' 10 ' + f(nx - 1.4) + ' 10 ' + f(nx - 2.6) + ' 9.2" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
       '<path d="M' + f(nx - 3.3) + ' 8.1 q-1.2 1.4 .6 2" stroke="' + INK + '" stroke-width="1.1" fill="none"/><path d="M' + f(nx + 1) + ' 0 C' + f(nx + 2.5) + ' 4 ' + f(nx + 3.4) + ' 7 ' + f(nx + 2.6) + ' 9" stroke="' + c.skinD + '" stroke-width="2" fill="none" opacity=".55"/>';
  // mouth
  var mx = X(tr * 1.5), my = 15;
  var M = {
    neutral: '<path d="M' + f(mx - 5) + ' ' + my + ' Q' + f(mx) + ' ' + f(my + .9) + ' ' + f(mx + 5) + ' ' + f(my - .2) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M' + f(mx - 3) + ' ' + f(my + 2.8) + ' Q' + f(mx) + ' ' + f(my + 3.8) + ' ' + f(mx + 3) + ' ' + f(my + 2.8) + '" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>',
    smile: '<path d="M' + f(mx - 6) + ' ' + f(my - 1.2) + ' Q' + f(mx) + ' ' + f(my + 4.2) + ' ' + f(mx + 6) + ' ' + f(my - 1.4) + '" stroke="' + INK + '" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M' + f(mx - 7.2) + ' ' + f(my - 2.4) + ' q.6 1 1.4 1.2 M' + f(mx + 7.2) + ' ' + f(my - 2.6) + ' q-.6 1 -1.4 1.2" stroke="' + INK + '" stroke-width="1.1" fill="none"/>',
    grin: '<path d="M' + f(mx - 6.5) + ' ' + f(my - 1.5) + ' Q' + f(mx) + ' ' + f(my - .2) + ' ' + f(mx + 6.5) + ' ' + f(my - 1.7) + ' Q' + f(mx) + ' ' + f(my + 7) + ' ' + f(mx - 6.5) + ' ' + f(my - 1.5) + ' Z" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M' + f(mx - 5.6) + ' ' + f(my - 1.2) + ' Q' + f(mx) + ' ' + f(my + .2) + ' ' + f(mx + 5.6) + ' ' + f(my - 1.4) + ' L' + f(mx + 4.6) + ' ' + f(my + 1) + ' Q' + f(mx) + ' ' + f(my + 2.2) + ' ' + f(mx - 4.6) + ' ' + f(my + 1) + ' Z" fill="#fff"/>',
    open: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1.5) + '" rx="4.2" ry="3.2" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(mx - 2.6) + ' ' + f(my + 3.5) + ' q2.6 -1.6 5.2 0" fill="' + PSN.lip + '"/>',
    o: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 1.6) + '" rx="2.6" ry="3.4" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6"/>',
    frown: '<path d="M' + f(mx - 5) + ' ' + f(my + 1.6) + ' Q' + f(mx) + ' ' + f(my - 2) + ' ' + f(mx + 5) + ' ' + f(my + 1.4) + '" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    yawn: '<ellipse cx="' + f(mx) + '" cy="' + f(my + 2.8) + '" rx="5" ry="6.2" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.7"/><path d="M' + f(mx - 3) + ' ' + f(my + 6.6) + ' q3 -2.2 6 0" fill="' + PSN.lip + '"/><path d="M' + f(mx - 3.4) + ' ' + f(my - 2) + ' h6.8" stroke="#fff" stroke-width="1.4"/>'
  };
  g += M[mo] || M.neutral;
  // a moustache (o.face.mustache = its colour): a full brush over the upper lip, drawn over the mouth line
  if (fc.mustache) g += '<path d="M' + f(mx - 8) + ' ' + f(my - .6) + ' Q' + f(mx - 7) + ' ' + f(my - 5.6) + ' ' + f(mx) + ' ' + f(my - 4.6) + ' Q' + f(mx + 7) + ' ' + f(my - 5.6) + ' ' + f(mx + 8) + ' ' + f(my - .6) + ' Q' + f(mx + 4) + ' ' + f(my - 2) + ' ' + f(mx) + ' ' + f(my - 1.4) + ' Q' + f(mx - 4) + ' ' + f(my - 2) + ' ' + f(mx - 8) + ' ' + f(my - .6) + ' Z" fill="' + fc.mustache + '" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/>';
  // jaw shadow and chin line
  g += '<path d="M' + f(X(-3)) + ' 22.5 Q' + f(X(0)) + ' 23.8 ' + f(X(3)) + ' 22.5" stroke="' + c.skinD + '" stroke-width="1" fill="none"/>';
  g += pHat(o._of && o._of.hat, c, false);
  // a headset (o.headset: true, or a colour): band over the head, an ear cup on each side, a boom mic to the mouth
  if (o.headset) { var hs = o.headset === true ? "#2b2e36" : o.headset;
    g += '<path d="M-20 -6 C-22 -30 -12 -36 0 -36 C12 -36 22 -30 20 -6" stroke="' + INK + '" stroke-width="4.6" fill="none"/><path d="M-20 -6 C-22 -30 -12 -36 0 -36 C12 -36 22 -30 20 -6" stroke="' + hs + '" stroke-width="2.4" fill="none"/>';
    [-1, 1].forEach(function (sd) { g += '<rect x="' + f(sd > 0 ? 16 : -24) + '" y="-10" width="8" height="15" rx="3.5" fill="' + hs + '" stroke="' + INK + '" stroke-width="1.6"/>'; });
    g += '<path d="M-20 2 Q-17 16 ' + f(mx - 7) + ' ' + f(my + 1) + '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="' + f(mx - 7) + '" cy="' + f(my + 1) + '" r="2.4" fill="' + hs + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  return G("translate(" + f(hc[0]) + " " + f(hc[1]) + ") rotate(" + f(rot) + ") scale(" + f(s) + ")", g);
}
function pHat(kind, c, side) {
  if (!kind) return "";
  var st = ' stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"';
  if (kind === "hardhat") return side
    ? '<path d="M-24 -11 C-25 -30 -10 -39 2 -39 C16 -39 25 -28 23 -11 Z" fill="' + c.hat + '"' + st + '/><path d="M-27 -11 L30 -10" stroke="' + INK + '" stroke-width="4.2" stroke-linecap="round"/><path d="M-27 -11 L30 -10" stroke="' + c.hatD + '" stroke-width="2" stroke-linecap="round"/><path d="M-8 -37 C-2 -30 2 -20 3 -12" stroke="' + c.hatD + '" stroke-width="2.2" fill="none"/>'
    : '<path d="M-22 -13 C-23 -32 -12 -40 0 -40 C12 -40 23 -32 22 -13 Z" fill="' + c.hat + '"' + st + '/><ellipse cx="0" cy="-13" rx="27" ry="4.2" fill="' + c.hatD + '"' + st + '/><path d="M0 -40 V-15 M-9 -38 C-11 -30 -12 -22 -12 -15 M9 -38 C11 -30 12 -22 12 -15" stroke="' + c.hatD + '" stroke-width="1.8" fill="none"/>';
  if (kind === "cap") return side
    ? '<path d="M-22 -14 C-23 -30 -10 -36 2 -36 C14 -36 21 -28 20 -14 Z" fill="' + c.hat + '"' + st + '/><path d="M16 -15 Q28 -15 34 -11 Q26 -9 16 -11 Z" fill="' + c.hatD + '"' + st + '/>'
    : '<path d="M-20 -15 C-21 -31 -10 -37 0 -37 C10 -37 21 -31 20 -15 Z" fill="' + c.hat + '"' + st + '/><path d="M-19 -15 Q0 -9 19 -15 Q0 -12 -19 -15 Z" fill="' + c.hatD + '"' + st + '/><circle cx="0" cy="-36" r="1.8" fill="' + c.hatD + '"/>';
  if (kind === "pilot") return side
    ? '<path d="M-20 -18 L-24 -34 Q2 -42 24 -33 L20 -18 Z" fill="' + c.pants + '"' + st + '/><path d="M-20 -18 L20 -18 L20 -13 L-20 -13 Z" fill="#14161c"' + st + '/><path d="M14 -14 Q26 -14 31 -9 Q24 -8 14 -10 Z" fill="#14161c"' + st + '/><circle cx="12" cy="-27" r="2.6" fill="#d9a72e" stroke="' + INK + '" stroke-width="1"/>'
    : '<path d="M-19 -18 L-26 -35 Q0 -43 26 -35 L19 -18 Z" fill="' + c.pants + '"' + st + '/><path d="M-19 -18 L19 -18 L19 -12.5 L-19 -12.5 Z" fill="#14161c"' + st + '/><path d="M-17 -12.5 Q0 -6 17 -12.5 Z" fill="#14161c"' + st + '/><path d="M-4 -30 L0 -34 L4 -30 L0 -25 Z" fill="#d9a72e" stroke="' + INK + '" stroke-width="1"/><path d="M-12 -30 Q-6 -33 -4 -30 M12 -30 Q6 -33 4 -30" stroke="#d9a72e" stroke-width="1.6" fill="none"/>';
  return "";
}
var PLEGS = { stand: { k: [[-1.5, 98], [1.5, 98]], a: [[-1, 196], [1, 196]] }, sit: { k: [[-10, 18], [10, 18]], a: [[-11, 102], [11, 102]] } };
function person(o) {
  var s = o.s || 1, c = {}, k; for (k in PSN) c[k] = PSN[k];
  var OF = pOutfit(o, c); o = Object.assign({}, o, { _of: OF });
  var lean = (o.lean || 0) * Math.PI / 180, sl = o.slump || 0, br = (o.breath || 0) * 1.6;
  var up = [Math.sin(lean), -Math.cos(lean)], rt = [Math.cos(lean), Math.sin(lean)], H = [o.x, o.y];
  function T(h, x) { return [H[0] + (up[0] * h + rt[0] * x) * s, H[1] + (up[1] * h + rt[1] * x) * s]; }   // trunk frame: h up from the hips, x to the viewer's right
  var hSh = 114 - 10 * sl + br, hNeck = 120 - 10 * sl + br, hd = o.head || {}, nod = hd.nod || 0;
  var legs = typeof o.legs === "object" ? o.legs : PLEGS[o.legs || "stand"], svg = "", J = { hip: [], knee: [], ankle: [], sh: [], el: [], wr: [] };
  // ── legs: trousers to the ankle, socks and feet ──
  var legSvg = "", feet = "";
  [-1, 1].forEach(function (sd, i) {
    var hp = [H[0] + sd * 20 * s, H[1] + 2 * s], kn = [hp[0] + legs.k[i][0] * s, H[1] + legs.k[i][1] * s], an = [hp[0] + legs.a[i][0] * s, H[1] + legs.a[i][1] * s];
    J.hip.push(hp); J.knee.push(kn); J.ankle.push(an);
    var top = [hp[0] - sd * 2 * s, hp[1] - 10 * s], hem = [an[0], an[1] - 5 * s], sitK = Math.hypot(kn[0] - hp[0], kn[1] - hp[1]) < 60 * s, g = "";
    if (sitK) {   // seated, the thigh comes toward us: the shin hangs behind, the thigh ends in a rounded knee in front
      var sh = [[kn[0], kn[1] - 4 * s], L2p(kn, hem, .35, sd * 1.5 * s), hem], sw = [29 * s, 27 * s, 22 * s];
      g += pLimbDraw(pLimb(sh, sw, false), c.pants, s, pShade(sh, sw, c.pantsD, s), 2.3);
      var th = [top, L2p(top, kn, .5, 0), [kn[0], kn[1] + 4 * s]], tw = [40 * s, 39 * s, 33 * s];
      g += pLimbDraw(pLimb(th, tw, true), c.pants, s, pShade(th, tw, c.pantsD, s), 2.3);
      g += '<path d="' + pPath([[kn[0] - 11 * s, kn[1] - 6 * s], [kn[0] - 3 * s, kn[1] - 9 * s], [kn[0] + 8 * s, kn[1] - 6 * s]], false) + '" stroke="' + c.pantsD + '" stroke-width="' + f(1.3 * s) + '" fill="none"/>' +
           '<path d="' + pPath([[top[0] + sd * 6 * s, top[1] + 16 * s], [kn[0] + sd * 10 * s, kn[1] - 18 * s]], false) + '" stroke="' + c.pantsD + '" stroke-width="' + f(1.2 * s) + '" fill="none" opacity=".8"/>';
    } else {      // standing: hip, thigh, knee, calf, ankle in one outline
      var pts = [top, L2p(top, kn, .45, sd * 1 * s), kn, L2p(kn, hem, .3, sd * 1.2 * s), hem], ws = [40 * s, 35 * s, 27 * s, 27 * s, 22 * s];
      g += pLimbDraw(pLimb(pts, ws, false), c.pants, s, pShade(pts, ws, c.pantsD, s), 2.3);
      g += '<path d="' + pPath([[kn[0] - 8 * s, kn[1] - 4 * s], [kn[0], kn[1] - 1 * s], [kn[0] + 7 * s, kn[1] - 3 * s]], false) + '" stroke="' + c.pantsD + '" stroke-width="' + f(1.2 * s) + '" fill="none"/>' +
           '<path d="' + pPath([[hem[0] - 9 * s, hem[1] - 10 * s], [hem[0] - 2 * s, hem[1] - 7 * s], [hem[0] + 8 * s, hem[1] - 9 * s]], false) + '" stroke="' + c.pantsD + '" stroke-width="' + f(1.1 * s) + '" fill="none"/>';
    }
    legSvg += g;
    var fx = an[0] + sd * 3 * s, fy = an[1] + 14 * s;
    feet += '<path d="M' + f(an[0] - 10 * s) + ' ' + f(an[1] - 6 * s) + ' L' + f(an[0] + 10 * s) + ' ' + f(an[1] - 6 * s) + ' L' + f(fx + 13 * s + sd * 3 * s) + ' ' + f(fy - 3 * s) + ' Q' + f(fx + 14 * s + sd * 4 * s) + ' ' + f(fy + 2 * s) + ' ' + f(fx + 6 * s) + ' ' + f(fy + 2 * s) + ' L' + f(fx - 8 * s) + ' ' + f(fy + 2 * s) + ' Q' + f(fx - 15 * s + sd * 2 * s) + ' ' + f(fy + 1 * s) + ' ' + f(fx - 13 * s + sd * 2 * s) + ' ' + f(fy - 4 * s) + ' Z" fill="' + (OF.feet === "socks" ? c.socks : c.shoes) + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '" stroke-linejoin="round"/>' +
             pLine([[fx - 9 * s, fy - 2 * s], [fx + 8 * s, fy - 2 * s]], OF.feet === "socks" ? "#6e6e75" : "#5a534c", 1.2 * s) +
             (OF.feet === "boots" ? '<path d="M' + f(an[0] - 12 * s) + ' ' + f(an[1] - 6 * s) + ' L' + f(an[0] - 12 * s) + ' ' + f(an[1] - 24 * s) + ' L' + f(an[0] + 12 * s) + ' ' + f(an[1] - 24 * s) + ' L' + f(an[0] + 12 * s) + ' ' + f(an[1] - 6 * s) + ' Z" fill="' + c.shoes + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[an[0] - 12 * s, an[1] - 20 * s], [an[0] + 12 * s, an[1] - 20 * s]], "#5a534c", 1.2 * s) : "");
  });
  svg += OF.feet === "boots" ? legSvg + feet : feet + legSvg;
  // ── trunk: sweater with ribbed hem, crew collar, side folds; the trousers' waist under the hem ──
  var wy = 7 + br * .3;
  svg += '<path d="' + pPath([T(-8, -40), T(10, -38), T(10, 38), T(-8, 40), T(-16, 0)], true) + '" fill="' + c.pants + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  var tor = [T(wy, -37), T(30, -33 - br * .3), T(70, -38 - br * .4), T(96, -42), T(hSh + 2, -46 + 2 * sl), T(hSh + 8, -30), T(hNeck + 2, -13), T(hNeck + 2, 13), T(hSh + 8, 30), T(hSh + 2, 46 - 2 * sl), T(96, 42), T(70, 38 + br * .4), T(30, 33 + br * .3), T(wy, 37)];
  svg += '<path d="' + pPath(tor, true) + '" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2.4 * s) + '"/>';
  svg += '<path d="' + pPath([T(hSh, 22), T(90, 36), T(50, 33), T(wy + 6, 34), T(wy + 6, 22), T(50, 24), T(86, 22)], true) + '" fill="' + c.shirtD + '" opacity=".55"/>';   // shaded far side
  svg += pLine([T(60, -20), T(52, -6), T(56, 6)], c.shirtD, 1.4 * s) + pLine([T(34, 8), T(26, 18)], c.shirtD, 1.3 * s) + pLine([T(40, -26), T(30, -16)], c.shirtD, 1.3 * s);
  var hem = [T(wy, -37), T(wy + 9, -36), T(wy + 9, 36), T(wy, 37)];
  svg += '<path d="M' + hem.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  if (OF.top === "sweater") for (var r = -32; r <= 32; r += 4) svg += pLine([T(wy + 1, r), T(wy + 8, r)], c.shirtD, .9 * s);
  else svg += pLine([T(wy + 2, -34), T(wy + 2, 34)], c.shirtD, 1.1 * s);
  if (OF.top === "shirt") {   // button placket, buttons, a chest pocket
    svg += pLine([T(hNeck - 6, 1.5), T(wy + 9, 1.5)], c.shirtD, 1.2 * s);
    for (var bh = 96; bh > 14; bh -= 20) { var bp = T(bh, 4.5); svg += '<circle cx="' + f(bp[0]) + '" cy="' + f(bp[1]) + '" r="' + f(1.7 * s) + '" fill="' + c.button + '" stroke="' + INK + '" stroke-width="' + f(.8 * s) + '"/>'; }
    svg += '<path d="M' + [T(96, -30), T(96, -14), T(78, -14), T(78, -30)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="none" stroke="' + c.shirtD + '" stroke-width="' + f(1.2 * s) + '"/>';
  }
  // collar (crew neck, ribbed) and neck with the shadow under the chin
  var nb = [T(hNeck - 2, -14), T(hNeck + 4, -12), T(hNeck + 4, 12), T(hNeck - 2, 14)];
  var hc0 = T(166 - 10 * sl - 26 * nod + br, 0), tilt = (hd.tilt || 0) + (o.lean || 0);
  svg += '<path d="M' + f(T(hNeck - 4, -11)[0]) + ' ' + f(T(hNeck - 4, -11)[1]) + ' L' + f(hc0[0] - 10 * s) + ' ' + f(hc0[1] + 18 * s) + ' L' + f(hc0[0] + 10 * s) + ' ' + f(hc0[1] + 18 * s) + ' L' + f(T(hNeck - 4, 11)[0]) + ' ' + f(T(hNeck - 4, 11)[1]) + ' Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  svg += '<path d="M' + f(T(hNeck - 1, -11)[0]) + ' ' + f(T(hNeck - 1, -11)[1]) + ' Q' + f(T(hNeck + 6, 0)[0]) + ' ' + f(T(hNeck + 6, 0)[1]) + ' ' + f(T(hNeck - 1, 11)[0]) + ' ' + f(T(hNeck - 1, 11)[1]) + '" stroke="' + c.skinD + '" stroke-width="' + f(4 * s) + '" fill="none" opacity=".6"/>';
  svg += '<path d="' + pPath([T(hNeck - 4, -17), T(hNeck + 2, -15), T(hNeck - 5, 0), T(hNeck + 2, 15), T(hNeck - 4, 17), T(hNeck - 9, 0)], true) + '" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
  if (OF.top === "sweater") svg += pLine([T(hNeck - 4.5, -13), T(hNeck - 8, 0), T(hNeck - 4.5, 13)], c.shirtD, 1.1 * s);
  if (OF.top === "shirt") {
    if (OF.tie) svg += '<path d="' + pPath([T(hNeck - 5, -3), T(hNeck - 5, 3), T(hNeck - 10, 2.5), T(hNeck - 10, -2.5)], true) + '" fill="' + c.tie + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '"/>' +
                       '<path d="M' + [T(hNeck - 10, -2.5), T(hNeck - 10, 2.5), T(62, 6), T(56, 0), T(62, -6)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.tie + '" stroke="' + INK + '" stroke-width="' + f(1.4 * s) + '" stroke-linejoin="round"/>';
    [-1, 1].forEach(function (sd) { svg += '<path d="M' + [T(hNeck + 3, sd * 3), T(hNeck + 3, sd * 15), T(hNeck - 12, sd * 9), T(hNeck - 6, sd * 2)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" stroke-linejoin="round"/>'; });
  }
  if (OF.epaulettes) [-1, 1].forEach(function (sd) { svg += '<path d="M' + [T(hSh + 6, sd * 24), T(hSh + 4, sd * 44), T(hSh - 2, sd * 44), T(hSh, sd * 24)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="#262a36" stroke="' + INK + '" stroke-width="' + f(1.2 * s) + '"/>' + pLine([T(hSh + 3, sd * 31), T(hSh + 2, sd * 41)], "#d9a72e", 1.6 * s); });
  if (OF.over === "vest") [-1, 1].forEach(function (sd) {
    var v = [T(hSh + 4, sd * 20), T(hSh, sd * 38), T(84, sd * 40), T(14, sd * 38), T(12, sd * 4), T(70, sd * 6), T(hNeck - 6, sd * 12)];
    svg += '<path d="' + pPath(v, true) + '" fill="' + c.vest + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>';
    [36, 66].forEach(function (h) { svg += '<path d="M' + [T(h + 4, sd * 5), T(h + 4, sd * 39), T(h - 4, sd * 39), T(h - 4, sd * 5)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.reflect + '" stroke="' + INK + '" stroke-width="' + f(1.1 * s) + '"/>'; });
  });
  if (OF.over === "apron") svg += '<path d="' + pPath([T(104, -20), T(104, 20), T(60, 28), T(-64, 36), T(-64, -36), T(60, -28)], true) + '" fill="' + c.apron + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([T(104, -18), T(hNeck - 4, -12)], INK, 1.6 * s) + pLine([T(104, 18), T(hNeck - 4, 12)], INK, 1.6 * s) + pLine([T(20, -38), T(20, 38)], c.apronD, 3 * s);
  if (OF.over === "labcoat") [-1, 1].forEach(function (sd) {   // an open white coat to mid-thigh: panel, lapel, pocket
    var pan = [T(hSh + 4, sd * 44), T(hNeck + 2, sd * 15), T(86, sd * 9), T(-66, sd * 12), T(-68, sd * 48), T(40, sd * 46), T(96, sd * 46)];
    svg += '<path d="' + pPath(pan, true) + '" fill="' + c.coat + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
    svg += '<path d="M' + [T(hNeck + 2, sd * 15), T(92, sd * 26), T(86, sd * 9)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" fill="' + c.coatD + '" stroke="' + INK + '" stroke-width="' + f(1.6 * s) + '" stroke-linejoin="round"/>';
    svg += '<path d="M' + [T(-18, sd * 20), T(-18, sd * 40), T(-40, sd * 40), T(-40, sd * 20)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="none" stroke="' + c.coatD + '" stroke-width="' + f(1.4 * s) + '"/>' + pLine([T(60, sd * 40), T(-50, sd * 44)], c.coatD, 1.2 * s);
  });
  J.head = hc0;
  var headSvg = pHead(hc0, s, tilt, o, c);
  // ── arms: sleeve to the wrist with a ribbed cuff, the hand ──
  var arms = o.arms || [{}, {}], armSvg = ["", ""];
  [-1, 1].forEach(function (sd, i) {
    var A = arms[i] || {}, sp = T(hSh + 3, sd * 40);   // shoulder joint at 0.818H (119 units above the hip joints, less a slump)
    var tg = A.to || (A.rel ? [sp[0] + A.rel[0] * s, sp[1] + A.rel[1] * s] : [sp[0] + sd * 10 * s, sp[1] + 128 * s]);
    // straight: a reaching arm (a stretch overhead) is one straight line from the shoulder through the elbow to the wrist
    if (A.straight) { var rdx = tg[0] - sp[0], rdy = tg[1] - sp[1], rdl = Math.hypot(rdx, rdy) || 1; tg = [sp[0] + rdx / rdl * 132 * s, sp[1] + rdy / rdl * 132 * s]; }
    var el = A.straight ? [sp[0] + (tg[0] - sp[0]) * 74 / 132, sp[1] + (tg[1] - sp[1]) * 74 / 132] : pIK(sp, tg, 74 * s, 58 * s, A.bend == null ? -sd : A.bend), dx = tg[0] - el[0], dy = tg[1] - el[1], dl = Math.hypot(dx, dy) || 1, wr = [el[0] + dx / dl * Math.min(dl, 58 * s), el[1] + dy / dl * Math.min(dl, 58 * s)];
    J.sh.push(sp); J.el.push(el); J.wr.push(wr);
    var cuff = [wr[0] - dx / dl * 8 * s, wr[1] - dy / dl * 8 * s], sp0 = [sp[0] - sd * 3 * s, sp[1] - 4 * s];
    var ang1 = Math.atan2(el[1] - sp[1], el[0] - sp[0]), ang2 = Math.atan2(dy, dx), bendA = Math.abs(((ang2 - ang1 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
    var ap = [sp0, L2p(sp, el, .3, 0), L2p(sp, el, .75, 0), el, L2p(el, cuff, .35, 0), cuff], aw = [27 * s, 24.5 * s, 21.5 * s, 20.5 * s, 20 * s, 16.5 * s];
    var coat = OF.over === "labcoat", sc = coat ? c.coat : c.shirt, scD = coat ? c.coatD : c.shirtD, sleeve;
    if (OF.top === "tshirt" && !coat) {   // bare arm, the short sleeve over its top
      var bare = [sp0, L2p(sp, el, .3, 0), L2p(sp, el, .75, 0), el, L2p(el, wr, .35, 0), wr], bw = [24 * s, 21 * s, 18 * s, 16.5 * s, 17 * s, 13 * s];
      var sv = [sp0, L2p(sp, el, .25, 0), L2p(sp, el, .5, 0)], sw2 = [28 * s, 26 * s, 25 * s];
      sleeve = pLimbDraw(pLimb(bare, bw, false), c.skin, s, pShade(bare, bw, c.skinD, s, .45), 2.2) + pLimbDraw(pLimb(sv, sw2, false), sc, s, "", 2.3);
    } else sleeve = pLimbDraw(pLimb(ap, aw, false), sc, s, pShade(ap, aw, scD, s), 2.3);
    // fabric bunching at the elbow: more folds the more the arm is bent, on the inside of the bend
    // the inside of the bend points from the elbow toward the middle of shoulder and wrist; folds sit there, inside the sleeve
    var mx = (sp[0] + wr[0]) / 2 - el[0], my = (sp[1] + wr[1]) / 2 - el[1], ml = Math.hypot(mx, my) || 1, vi = [mx / ml, my / ml], folds = "", nf = bendA > .35 ? 3 : 1;
    for (var q = 0; q < nf; q++) { var o0 = (q - (nf - 1) / 2) * 5.5 * s, bx = el[0] + vi[0] * 4 * s + Math.cos(ang2) * o0, by = el[1] + vi[1] * 4 * s + Math.sin(ang2) * o0;
      folds += '<path d="M' + f(bx + vi[0] * 5 * s) + ' ' + f(by + vi[1] * 5 * s) + ' Q' + f(bx - Math.cos(ang2) * 2.5 * s) + ' ' + f(by - Math.sin(ang2) * 2.5 * s) + ' ' + f(bx - vi[0] * 5 * s) + ' ' + f(by - vi[1] * 5 * s) + '" stroke="' + c.shirtD + '" stroke-width="' + f(1.3 * s) + '" fill="none" stroke-linecap="round"/>'; }
    folds += '<path d="' + pPath([L2p(sp, el, .2, 4 * s), L2p(sp, el, .5, 6 * s)], false) + '" stroke="' + c.shirtD + '" stroke-width="' + f(1.1 * s) + '" fill="none" opacity=".7"/>';
    // ribbed cuff, a little wider than the wrist, then the hand
    var cp = [cuff, [wr[0] + dx / dl * 1.5 * s, wr[1] + dy / dl * 1.5 * s]], cuffSvg = OF.top === "tshirt" && !coat ? "" : pLimbDraw(pLimb(cp, [17.5 * s, 16.5 * s], false), coat ? c.shirt : sc, s, "", 2), rib = "";
    if (OF.top === "sweater" && !coat) for (var qq = -6; qq <= 6; qq += 3) { var nx2 = -dy / dl, ny2 = dx / dl; rib += pLine([[cuff[0] + nx2 * qq * s, cuff[1] + ny2 * qq * s], [cuff[0] + nx2 * qq * s + dx / dl * 8 * s, cuff[1] + ny2 * qq * s + dy / dl * 8 * s]], c.shirtD, .9 * s); }
    var ha = A.rot != null ? A.rot * Math.PI / 180 : Math.atan2(dy, dx), side = A.side || (sd * (Math.cos(ha) >= 0 ? -1 : 1));
    var hand = pHand([wr[0] - Math.cos(ha) * 1 * s, wr[1] - Math.sin(ha) * 1 * s], ha, A.hand || "relaxed", side, s, c, A.palm);
    if (OF.top === "tshirt" && !coat) folds = "";
    armSvg[i] = sleeve + folds.replace(new RegExp(c.shirtD, "g"), scD) + hand + cuffSvg + rib;
  });
  // arms reaching up over the head (a stretch, a hand on the forehead) are drawn after the head
  var front = [arms[0] && arms[0].front, arms[1] && arms[1].front];
  svg += (front[0] ? "" : armSvg[0]) + (front[1] ? "" : armSvg[1]) + headSvg + (front[0] ? armSvg[0] : "") + (front[1] ? armSvg[1] : "");
  return { svg: svg, joints: J };
}
// tween two poses (numbers, points and arrays blend; strings switch at the midpoint)
function personMix(a, b, k) {
  if (k <= 0) return a; if (k >= 1) return b;
  function mix(x, y) {
    if (typeof x === "number" && typeof y === "number") return lerp(x, y, k);
    if (Array.isArray(x) && Array.isArray(y)) return x.map(function (v, i) { return mix(v, y[i]); });
    if (x && y && typeof x === "object" && typeof y === "object") { var o = {}, kk; for (kk in x) o[kk] = kk in y ? mix(x[kk], y[kk]) : x[kk]; for (kk in y) if (!(kk in o)) o[kk] = y[kk]; return o; }
    return k < .5 ? x : y;
  }
  var A = Object.assign({}, a, { legs: typeof a.legs === "object" ? a.legs : PLEGS[a.legs || "stand"] }), B = Object.assign({}, b, { legs: typeof b.legs === "object" ? b.legs : PLEGS[b.legs || "stand"] });
  return mix(A, B);
}
// a sofa from the front, at the person's scale: seat 0.26H, arms 0.37H, back 0.49H (olive fabric, seams, cushion folds)
function sofaFront(cx, fl, w, s) {
  var g = "", st = fl - 104 * s, x0 = cx - w / 2, x1 = cx + w / 2, OL = "#8d9256", OLD = "#6d7240", OLL = "#a3a86a";
  g += '<path d="M' + f(x0 + 30 * s) + ' ' + f(st - 8 * s) + ' L' + f(x0 + 38 * s) + ' ' + f(fl - 200 * s) + ' Q' + f(cx) + ' ' + f(fl - 212 * s) + ' ' + f(x1 - 38 * s) + ' ' + f(fl - 200 * s) + ' L' + f(x1 - 30 * s) + ' ' + f(st - 8 * s) + ' Z" fill="' + OLD + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>';
  for (var i = 0; i < 2; i++) { var a = x0 + 44 * s + i * (w - 88 * s) / 2, b = a + (w - 88 * s) / 2 - 6 * s; g += '<path d="M' + f(a) + ' ' + f(st - 6 * s) + ' L' + f(a + 4 * s) + ' ' + f(fl - 190 * s) + ' Q' + f((a + b) / 2) + ' ' + f(fl - 200 * s) + ' ' + f(b - 4 * s) + ' ' + f(fl - 190 * s) + ' L' + f(b) + ' ' + f(st - 6 * s) + ' Z" fill="' + OL + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[a + 14 * s, fl - 170 * s], [a + 26 * s, fl - 150 * s]], OLD, 1.3 * s) + pLine([[b - 10 * s, st - 30 * s], [b - 22 * s, st - 16 * s]], OLD, 1.3 * s); }
  g += '<path d="M' + f(x0 + 26 * s) + ' ' + f(st - 10 * s) + ' L' + f(x1 - 26 * s) + ' ' + f(st - 10 * s) + ' L' + f(x1 - 20 * s) + ' ' + f(st + 14 * s) + ' L' + f(x0 + 20 * s) + ' ' + f(st + 14 * s) + ' Z" fill="' + OLL + '" stroke="' + INK + '" stroke-width="' + f(2 * s) + '"/>' + pLine([[cx, st - 10 * s], [cx, st + 14 * s]], OLD, 1.4 * s);
  g += R(x0 + 20 * s, st + 14 * s, w - 40 * s, 70 * s, OL, 2.2 * s) + pLine([[cx, st + 14 * s], [cx, st + 84 * s]], OLD, 1.4 * s) + R(x0 + 24 * s, st + 60 * s, w - 48 * s, 24 * s, OLD, 0, 0, ' opacity=".5"');
  [x0, x1 - 40 * s].forEach(function (ax) { g += '<path d="M' + f(ax) + ' ' + f(fl - 18 * s) + ' L' + f(ax) + ' ' + f(fl - 140 * s) + ' Q' + f(ax + 20 * s) + ' ' + f(fl - 156 * s) + ' ' + f(ax + 40 * s) + ' ' + f(fl - 140 * s) + ' L' + f(ax + 40 * s) + ' ' + f(fl - 18 * s) + ' Z" fill="' + OL + '" stroke="' + INK + '" stroke-width="' + f(2.2 * s) + '"/>' + pLine([[ax + 30 * s, fl - 132 * s], [ax + 30 * s, fl - 30 * s]], OLD, 2.4 * s, ' opacity=".6"'); });
  g += R(x0 + 6 * s, fl - 18 * s, 12 * s, 18 * s, "#6a4a32", 1.6 * s) + R(x1 - 18 * s, fl - 18 * s, 12 * s, 18 * s, "#6a4a32", 1.6 * s);
  return g;
}

/* ── the same person from the side (profile), for walking, bending and lying down ──
   personSide(o): o.x, o.y the hip joint, o.s scale, o.dir 1 = facing right, -1 = facing left, o.rot rotates the whole body
   about the hip (deg; -90 with dir 1 lays him on his back, head to the left).
     o.lean: trunk angle from upright (deg, + forward) · o.breath 0..1
     o.legs: [near, far], each {hip: thigh angle from straight down (+ forward), knee: flexion (+ bends the shin back), ankle: foot tilt}
     o.arms: [near, far], each {sh: upper-arm angle from straight down (+ forward), el: elbow flexion (+ brings the forearm forward/up), hand}
     o.head: {tilt (+ nods forward)} · o.face: {eyes, brows, mouth} as in person()
   Same segment lengths as person(): thigh 98, shank 98, foot 61, upper arm 74, forearm 58, hand 43; side depths chest 52,
   waist 46, seat 56, head 52 tall × 48 deep (H = 400). Drawn in local units facing right, then placed with one transform. */
function walkPose(ph, amp) {   // a walking cycle: ph in radians, both legs and arms; amp 0..1 (0 = standing)
  amp = amp == null ? 1 : amp;
  function leg(p) { var sw = Math.sin(p), k = Math.max(0, Math.sin(p + 2.07));   /* the knee bends most just after toe-off, straight while the foot is on the floor */ return { hip: 19 * sw * amp, knee: (6 + 58 * k * k) * amp, ankle: (sw > 0 ? -8 * sw : 14 * -sw) * amp }; }
  return { legs: [leg(ph), leg(ph + Math.PI)], arms: [{ sh: -20 * Math.sin(ph) * amp, el: (16 + 10 * Math.max(0, -Math.sin(ph))) * amp + 6, hand: "relaxed" }, { sh: 20 * Math.sin(ph) * amp, el: (16 + 10 * Math.max(0, Math.sin(ph))) * amp + 6, hand: "relaxed" }] };
}
function personSide(o) {
  var c = {}, k; for (k in PSN) c[k] = PSN[k];
  var OF = pOutfit(o, c);
  var lean = (o.lean || 0) * Math.PI / 180, br = (o.breath || 0) * 1.4, fc = o.face || {}, hd = o.head || {};
  function T(h, x) { return [x * Math.cos(lean) + h * Math.sin(lean), -h * Math.cos(lean) + x * Math.sin(lean)]; }   // trunk frame: h up, x forward
  function V(a) { a = a * Math.PI / 180; return [Math.sin(a), Math.cos(a)]; }
  var legs = o.legs || [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms = o.arms || [{ sh: 2, el: 12 }, { sh: -2, el: 12 }], part = { leg: ["", ""], arm: ["", ""] }, J = {};
  // ── legs: one trouser outline hip → thigh → knee → calf → hem, then the sock-foot in profile ──
  legs.forEach(function (L, i) {
    var hp = [0, 2], kn = [hp[0] + V(L.hip)[0] * 98, hp[1] + V(L.hip)[1] * 98], b = L.hip - (L.knee || 0), an = [kn[0] + V(b)[0] * 98, kn[1] + V(b)[1] * 98];
    var fw = [Math.cos((b - (L.ankle || 0)) * Math.PI / 180), -Math.sin((b - (L.ankle || 0)) * Math.PI / 180)], dn = [-fw[1], fw[0]];
    var hem = [an[0] - V(b)[0] * 6, an[1] - V(b)[1] * 6], top = [hp[0] + 4, hp[1] - 14];
    var pts = [top, L2p(top, kn, .45, 0), kn, L2p(kn, hem, .35, 0), hem], ws = [46, 39, 30, 31, 23];
    var g = pLimbDraw(pLimb(pts, ws, false), i ? c.pantsD : c.pants, 1, pShade(pts, ws, c.pantsD, 1, i ? .3 : .55), 2.3);
    g += '<path d="' + pPath([L2p(kn, top, .08, -10), L2p(kn, hem, .1, -8)], false) + '" stroke="' + c.pantsD + '" stroke-width="1.3" fill="none"/>';   // crease behind the knee
    // the foot: heel behind the ankle, sole along fw, toes 47 ahead (foot 61 = 0.152H)
    var P = function (u, v) { return [an[0] + fw[0] * u + dn[0] * v, an[1] + fw[1] * u + dn[1] * v]; };
    var foot = [P(-14, -4), P(-15, 8), P(-10, 14), P(30, 14), P(46, 12), P(48, 6), P(40, 0), P(22, -6), P(6, -10), P(-8, -10)];
    var fcol = OF.feet === "socks" ? (i ? "#46464b" : c.socks) : (i ? "#1e1b18" : c.shoes);
    var boot = OF.feet === "boots" ? '<path d="' + pPath([P(-15, 6), P(-15, -24), P(12, -24), P(14, 0)], false) + '" fill="' + fcol + '" stroke="' + INK + '" stroke-width="2"/>' : "";
    g = '<path d="' + pPath(foot, true) + '" fill="' + fcol + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' + pLine([P(-12, 12), P(44, 11)], OF.feet === "socks" ? "#6e6e75" : "#5a534c", 1.1) + g + boot;
    part.leg[i] = g; if (!i) { J.knee = kn; J.ankle = an; J.toe = P(48, 6); J.heel = P(-14, 13); }
    J["foot" + i] = [P(-14, 14), P(48, 13)];
  });
  // ── trunk in profile: chest, back, the sweater's hem and collar ──
  var fr = [[-4, 27], [10, 28], [30, 25], [56, 27 + br], [80, 31 + br], [98, 30], [110, 23], [120, 13]], bk = [[121, -13], [110, -25], [88, -28], [62, -23], [38, -25], [16, -30], [-2, -29]];
  var torso = fr.concat(bk).map(function (q) { return T(q[0], q[1]); });
  var trunk = '<path d="' + pPath(torso, true) + '" fill="' + c.shirt + '" stroke="' + INK + '" stroke-width="2.4"/>';
  trunk += '<path d="' + pPath([T(112, -16), T(86, -20), T(60, -15), T(30, -18), T(8, -22), T(8, -10), T(40, -8), T(80, -10)], true) + '" fill="' + c.shirtD + '" opacity=".45"/>';
  trunk += '<path d="' + pPath([T(2, 27), T(10, 27.5), T(10, -28), T(1, -28)], false) + '" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
  if (OF.top === "sweater") for (var r = -24; r <= 24; r += 4) trunk += pLine([T(2.5, r), T(9, r)], c.shirtD, .9);
  if (OF.top === "shirt") { for (var bh = 96; bh > 14; bh -= 20) { var bp = T(bh, [26, 30, 28, 26, 27][Math.round((96 - bh) / 20)] - 3); trunk += '<circle cx="' + f(bp[0]) + '" cy="' + f(bp[1]) + '" r="1.6" fill="' + c.button + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    if (OF.tie) trunk += '<path d="' + pPath([T(116, 12), T(110, 16), T(62, 31), T(58, 27), T(108, 11)], true) + '" fill="' + c.tie + '" stroke="' + INK + '" stroke-width="1.3"/>'; }
  if (OF.epaulettes) trunk += '<path d="M' + [T(121, -10), T(121, 10), T(116, 10), T(116, -10)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="#262a36" stroke="' + INK + '" stroke-width="1.1"/>';
  if (OF.over === "vest") { trunk += '<path d="' + pPath([T(116, -14), T(116, 6), T(98, 31), T(14, 30), T(12, -30), T(96, -28)], true) + '" fill="' + c.vest + '" stroke="' + INK + '" stroke-width="2"/>';
    [36, 66].forEach(function (h) { trunk += '<path d="M' + [T(h + 4, -30), T(h + 4, 31), T(h - 4, 31), T(h - 4, -30)].map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + c.reflect + '" stroke="' + INK + '" stroke-width="1"/>'; }); }
  if (OF.over === "apron") trunk += '<path d="' + pPath([T(104, 30), T(104, 34), T(-64, 40), T(-66, 34)], true) + '" fill="' + c.apron + '" stroke="' + INK + '" stroke-width="2"/>' + pLine([T(104, 30), T(120, 12)], INK, 1.6) + pLine([T(20, 32), T(22, -30)], c.apronD, 3);
  trunk += pLine([T(60, 6), T(52, 14), T(48, 22)], c.shirtD, 1.3) + pLine([T(30, 2), T(24, 12)], c.shirtD, 1.2);
  // ── neck and head in profile, facing +x ──
  var tilt = (hd.tilt || 0) + (o.lean || 0), hc = T(166 + br * .5, 6);
  var neck = '<path d="M' + f(T(116, -8)[0]) + ' ' + f(T(116, -8)[1]) + ' L' + f(T(146, -10)[0]) + ' ' + f(T(146, -10)[1]) + ' L' + f(T(146, 10)[0]) + ' ' + f(T(146, 10)[1]) + ' L' + f(T(116, 13)[0]) + ' ' + f(T(116, 13)[1]) + ' Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2"/>' +
             '<path d="' + pPath([T(118, -11), T(124, 2), T(118, 15)], false) + '" stroke="' + INK + '" stroke-width="2" fill="' + c.shirt + '"/>' + pLine([T(119.5, -8), T(123, 2), T(119.5, 12)], c.shirtD, 1);
  var eo = fc.eyes == null ? 1 : fc.eyes, mo = fc.mouth || "neutral", h = "";
  var shape = [[-23, -4], [-19, -20], [-6, -28], [8, -26], [17, -18], [20.5, -8], [20.5, -4], [22, 0], [27.5, 7.5], [23, 10], [22.5, 12.5], [23, 15], [22, 17.5], [21, 22], [16, 25.5], [6, 25], [-2, 20], [-10, 15], [-17, 12], [-22, 6]];
  h += '<path d="' + pPath(shape, true) + '" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="2.2"/>';
  h += '<path d="M10 8 C14 16 14 21 8 24 C14 24 19 21 20 14 Z" fill="' + c.skinD + '" opacity=".35"/>';   // jaw shade
  h += '<path d="M-5 -4 C3 -6 5 8 -3 10 C-1 6 -1 0 -5 -4 Z" fill="' + c.skin + '" stroke="' + INK + '" stroke-width="1.7"/><path d="M-2.5 -1 C1 -1 1.5 5 -1.5 6" stroke="' + c.skinD + '" stroke-width="1.1" fill="none"/>';   // ear
  h += '<path d="' + pPath([[-23.5, 6], [-24, -10], [-17, -25], [-4, -31], [10, -29], [18, -21], [16, -15], [9, -18], [2, -16], [-6, -14], [-12, -8], [-10, -2], [-16, 4], [-19, 12]], true) + '" fill="' + c.hair + '" stroke="' + INK + '" stroke-width="1.8"/>' + pLine([[-16, -20], [-6, -24], [4, -25]], c.hairL, 1.2) + pLine([[-20, -6], [-17, 2]], c.hairL, 1.1);
  var bv = { neutral: 0, raised: -2.6, worried: -1.2, angry: 1.6 }[fc.brows || "neutral"] || 0;
  h += '<path d="M9 ' + f(-8 + bv) + ' Q14 ' + f(-10 + bv) + ' 18.5 ' + f(-7.5 + bv * .4) + '" stroke="' + c.hair + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  if (eo < .12) h += '<path d="M10.5 -2 Q14 0.6 17.5 -1.2" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  else { var eh = 2.8 * eo; h += '<path d="M10.5 -1.5 Q14.5 ' + f(-1.5 - eh) + ' 18 -2.6 Q17 ' + f(-1.5 + eh * .5) + ' 13 ' + f(-1 + eh * .45) + ' Z" fill="' + PSN.white + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="16.2" cy="' + f(-2 + eh * .05) + '" r="' + f(Math.min(1.9, eh * .7)) + '" fill="' + PSN.iris + '"/><path d="M10.5 -1.5 Q14.5 ' + f(-1.7 - eh) + ' 18.3 -2.6" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; }
  h += '<path d="M21 -1 C22.5 3 25.5 6 27.4 7.6 C26 9.4 23.5 9.6 22.5 9" stroke="' + INK + '" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M23 7.6 q1.2 .3 1.8 1.4" stroke="' + INK + '" stroke-width="1" fill="none"/>';
  var M = { neutral: '<path d="M18 14.6 L22.6 14.4" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>', smile: '<path d="M17 13.2 Q19.5 15.6 22.8 14.2" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    grin: '<path d="M16.8 13 Q19.5 17.4 22.9 14 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>', open: '<path d="M18.5 13.6 Q22.8 13 22.8 14.6 Q22.4 17.6 19 17 Z" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.4"/>',
    o: '<ellipse cx="21.6" cy="15" rx="1.6" ry="2.3" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.3"/>', frown: '<path d="M17.5 15.6 Q20 13.6 22.6 14.6" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
    yawn: '<path d="M18 12.8 Q23.6 12 23.6 14.8 Q23 20.6 18.6 19.4 Z" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.5"/>' };
  h += M[mo] || M.neutral;
  h += pHat(OF.hat, c, true);
  var head = G("translate(" + f(hc[0]) + " " + f(hc[1]) + ") rotate(" + f(tilt) + ")", h);
  J.head = hc;
  // ── arms: sleeve from the shoulder joint (0.818H) through the elbow to the cuff, the hand turned to its side ──
  arms.forEach(function (A, i) {
    var sp = T(117, -2), ua = (A.sh || 0) + (o.lean || 0), el = [sp[0] + V(ua)[0] * 74, sp[1] + V(ua)[1] * 74], fa = ua + (A.el || 0), wr = [el[0] + V(fa)[0] * 58, el[1] + V(fa)[1] * 58];
    var cuff = [el[0] + V(fa)[0] * 50, el[1] + V(fa)[1] * 50], ap = [T(124, -4), L2p(sp, el, .35, 0), el, L2p(el, cuff, .35, 0), cuff], aw = [26, 23, 20, 20, 16.5];
    var coat = OF.over === "labcoat", sc = coat ? (i ? c.coatD : c.coat) : (i ? c.shirtD : c.shirt), g;
    if (OF.top === "tshirt" && !coat) {
      var bare = [T(124, -4), L2p(sp, el, .35, 0), el, L2p(el, wr, .35, 0), wr], bw = [24, 21, 17, 17, 13];
      g = pLimbDraw(pLimb(bare, bw, false), i ? c.skinD : c.skin, 1, pShade(bare, bw, c.skinD, 1, .4), 2.2) + pLimbDraw(pLimb([T(124, -4), L2p(sp, el, .3, 0), L2p(sp, el, .5, 0)], [28, 26, 25], false), sc, 1, "", 2.3);
    } else {
      g = pLimbDraw(pLimb(ap, aw, false), sc, 1, pShade(ap, aw, coat ? c.coatD : c.shirtD, 1, i ? .3 : .55), 2.3);
      g += pLimbDraw(pLimb([cuff, [el[0] + V(fa)[0] * 59, el[1] + V(fa)[1] * 59]], [17.5, 16.5], false), coat ? (i ? c.shirtD : c.shirt) : sc, 1, "", 2);
    }
    if ((A.el || 0) > 25) g += '<path d="' + pPath([L2p(el, sp, .12, 6), [el[0] + 4, el[1] + 2], L2p(el, wr, .12, -6)], false) + '" stroke="' + c.shirtD + '" stroke-width="1.3" fill="none"/>';
    var ha = Math.atan2(V(fa + (A.wrist || 0))[1], V(fa + (A.wrist || 0))[0]);
    g = G("", pHand([wr[0] - Math.cos(ha) * 1, wr[1] - Math.sin(ha) * 1], ha, A.hand || "relaxed", -1, 1, i ? Object.assign({}, c, { skin: c.skinD }) : c, false)) + g;
    part.arm[i] = g; if (!i) { J.wrist = wr; J.elbow = el; }
  });
  var coatSvg = OF.over === "labcoat" ? '<path d="' + pPath([T(121, -14), T(121, 16), T(96, 34), T(30, 32), T(-66, 38), T(-68, -34), T(30, -32), T(96, -30)], true) + '" fill="' + c.coat + '" stroke="' + INK + '" stroke-width="2.2"/>' + pLine([T(112, 18), T(70, 30), T(60, 33)], c.coatD, 2) + pLine([T(-10, 30), T(-60, 34)], c.coatD, 1.3) : "";
  var body = part.arm[1] + part.leg[1] + trunk + part.leg[0] + coatSvg + neck + head + part.arm[0];
  var s = o.s || 1, dir = o.dir || 1;
  J.toLocal = function (p) { return p; };
  var tr = "translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f(s * dir) + " " + f(s) + ")";
  // world positions of the joints, for props and the floor contact
  function W(p) { var a = (o.rot || 0) * Math.PI / 180, x = p[0] * s * dir, y = p[1] * s; return [o.x + x * Math.cos(a) - y * Math.sin(a), o.y + x * Math.sin(a) + y * Math.cos(a)]; }
  var JW = {}; for (k in J) if (Array.isArray(J[k]) && typeof J[k][0] === "number") JW[k] = W(J[k]); JW.foot0 = J.foot0.map(W); JW.foot1 = J.foot1.map(W);
  return { svg: '<g transform="' + tr + '">' + body + '</g>', joints: JW };
}
// how high the hips must be so the lower foot stands on the floor (for walking: no sinking, no floating)
function sideHipY(o, floorY) { var p = personSide(Object.assign({}, o, { y: 0 })), lo = -1e9; ["foot0", "foot1"].forEach(function (k) { p.joints[k].forEach(function (q) { lo = Math.max(lo, q[1]); }); }); return floorY - lo; }

// export: window.PERSON for every skill; plain globals too where the name is free (the story kit has its own person())
var API = { outfits: OUTFITS, front: person, side: personSide, walkPose: walkPose, sideHipY: sideHipY, mix: personMix, sofaFront: sofaFront, hand: pHand, head: pHead, colors: PSN,
  setInk: function (c) { INK = c; } };
window.PERSON = API;
[["person", person], ["personSide", personSide], ["walkPose", walkPose], ["sideHipY", sideHipY], ["personMix", personMix], ["sofaFront", sofaFront], ["pHand", pHand], ["pHead", pHead], ["PSN", PSN]].forEach(function (q) { if (!(q[0] in window)) window[q[0]] = q[1]; });
})();
