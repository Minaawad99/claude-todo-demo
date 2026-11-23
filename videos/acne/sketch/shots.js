// ── «ليه الحبوب بتطلع في وشك وصاحبك لأ؟» — drawings. Skin follows the «طب إزاي؟» skin cut (sheet v20: a block of
// skin seen three-quarter, salmon epidermis with a wavy top, a paler dermis with a red vessel, round fat cells under it)
// and real histology (refs/SOURCES.md): a hair follicle with its sebaceous gland opening into the canal, sebum, a plug of
// sebum and dead cells (comedo), C. acnes in the closed canal, neutrophils leaving the vessel, a red swollen papule with pus.
// People: the shared person kit (videos/_templates/people/person.js), T-shirts as in the hook the user sent.

var EPI = "#d98f78", EPI_D = "#c27660", DERM = "#efcab2", DERM_D = "#e2b49a", FAT = "#e9dfba", FAT_D = "#cfc394",
    SEBUM = "#e7c860", SEBUM_L = "#f3e1a0", CANAL = "#f7eedb", HAIRC = "#4a3426", VESSEL = "#b9483a", BAC = "#6f7a3c", BAC_L = "#a3ad6a",
    PUS = "#f1e4b0", RED = "#c4553f", WBC = "#fbf8f1", WBC_N = "#9aa3b8", FLAKE = "#cfae86";
function hsh(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ── the skin block ──
// front face x 40..600; skin top y = SK.top; depth offset of the top face (DX, DY). o: {gland 1..1.7, sebum 0..1 (canal fill),
// flow (drops moving), plug 0..1, flakes 0..1, bac n (in the canal), surf n (bacteria on the top), wbc 0..1, red 0..1, pus 0..1,
// bump 0..1, sq 0..1 (fingers press), rupt 0..1, scar 0..1, soap 0..1, irrit 0..1}
var SK = { x0: 40, x1: 600, top: 250, fx: 300, dx: 56, dy: -62 };
function skin(o, t) {
  o = o || {}; t = t || 0;
  var x0 = SK.x0, x1 = SK.x1, T0 = SK.top, FX = SK.fx, DX = SK.dx, DY = SK.dy, E = T0 + 42, D1 = T0 + 330, B = T0 + 440;
  var bump = (o.bump || 0) * 34 + (o.sq || 0) * 10, scar = o.scar || 0;
  function sy(x) { var g = Math.exp(-Math.pow((x - FX) / 70, 2)); return T0 + 3 * Math.sin(x / 23) - bump * g + scar * 9 * Math.exp(-Math.pow((x - FX) / 30, 2)); }
  var front = "", s = "", i, x;
  for (x = x0; x <= x1; x += 8) front += (x === x0 ? "M" : " L") + f(x) + " " + f(sy(x));
  // top face (the surface seen from above), then the right side
  s += '<path d="' + front + ' L' + f(x1 + DX) + ' ' + f(T0 + DY) + ' L' + f(x0 + DX) + ' ' + f(T0 + DY) + ' Z" fill="' + (o.irrit ? "#e39a83" : EPI) + '" stroke="' + INK + '" stroke-width="2"/>';
  for (i = 0; i < 9; i++) { var px = x0 + 50 + i * 60 + (i % 2) * 14, k = .25 + (i % 3) * .25; s += '<path d="M' + f(px + DX * k) + ' ' + f(T0 + DY * k + 2) + ' q6 -3 12 0" stroke="' + EPI_D + '" stroke-width="1.6" fill="none"/>'; }
  s += '<path d="M' + x1 + ' ' + f(sy(x1)) + ' L' + f(x1 + DX) + ' ' + f(T0 + DY) + ' L' + f(x1 + DX) + ' ' + f(B + DY) + ' L' + x1 + ' ' + B + ' Z" fill="' + DERM_D + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + x1 + ' ' + f(E) + ' L' + f(x1 + DX) + ' ' + f(E + DY) + ' M' + x1 + ' ' + D1 + ' L' + f(x1 + DX) + ' ' + f(D1 + DY) + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // front: fat, dermis, epidermis
  s += R(x0, D1, x1 - x0, B - D1, FAT, 2);
  for (i = 0; i < 12; i++) for (var j = 0; j < 2; j++) s += '<ellipse cx="' + f(x0 + 26 + i * 47 + j * 22) + '" cy="' + f(D1 + 32 + j * 52) + '" rx="21" ry="20" fill="#f4ecd0" stroke="' + FAT_D + '" stroke-width="1.6"/>';
  s += '<path d="' + front + ' L' + x1 + ' ' + D1 + ' L' + x0 + ' ' + D1 + ' Z" fill="' + DERM + '" stroke="' + INK + '" stroke-width="2"/>';
  s += hatch('M' + x0 + ' ' + (D1 - 60) + ' H' + x1 + ' V' + D1 + ' H' + x0 + ' Z').replace('fill="url(#hatch)"', 'fill="url(#hatch)" opacity=".25"');
  var ep = front; for (x = x1; x >= x0; x -= 8) ep += " L" + f(x) + " " + f(sy(x) + 40 + 4 * Math.sin(x / 31));
  s += '<path d="' + ep + ' Z" fill="' + (o.irrit ? "#df8f76" : EPI) + '" stroke="' + INK + '" stroke-width="2"/>';
  // the vessel along the bottom of the dermis (cut lengthwise), slightly pulsing
  var vy = D1 - 26, pul = 1 + .08 * Math.sin(t * 6);
  s += '<path d="M' + x0 + ' ' + vy + ' C200 ' + (vy - 18) + ' 420 ' + (vy + 18) + ' ' + x1 + ' ' + vy + '" stroke="' + INK + '" stroke-width="' + f(15 * pul) + '" fill="none"/><path d="M' + x0 + ' ' + vy + ' C200 ' + (vy - 18) + ' 420 ' + (vy + 18) + ' ' + x1 + ' ' + vy + '" stroke="' + VESSEL + '" stroke-width="' + f(11 * pul) + '" fill="none"/>';
  // inflammation glow behind the follicle
  if (o.red) { CLIPN++; var gid = "rg" + CLIPN; s += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="' + RED + '" stop-opacity=".55"/><stop offset="1" stop-color="' + RED + '" stop-opacity="0"/></radialGradient></defs><ellipse cx="' + FX + '" cy="' + (T0 + 140) + '" rx="' + f(230 * o.red * (1 + .03 * Math.sin(t * 3))) + '" ry="' + f(210 * o.red) + '" fill="url(#' + gid + ')"/>'; }
  // the follicle: funnel opening, canal down to the bulb
  var cb = T0 + 270, op = sy(FX), w0 = 26, w1 = 15;
  var canal = 'M' + f(FX - w0) + ' ' + f(op) + ' C' + f(FX - w1) + ' ' + f(op + 30) + ' ' + f(FX - w1) + ' ' + f(op + 40) + ' ' + f(FX - w1) + ' ' + f(op + 60) + ' L' + f(FX - w1 + 2) + ' ' + cb + ' Q' + FX + ' ' + (cb + 14) + ' ' + f(FX + w1 - 2) + ' ' + cb + ' L' + f(FX + w1) + ' ' + f(op + 60) + ' C' + f(FX + w1) + ' ' + f(op + 40) + ' ' + f(FX + w1) + ' ' + f(op + 30) + ' ' + f(FX + w0) + ' ' + f(op) + ' Z';
  var swell = Math.max(o.pus || 0, o.sq || 0);
  if (swell) s += '<ellipse cx="' + FX + '" cy="' + f(op + 100) + '" rx="' + f(16 + 34 * swell) + '" ry="' + f(70 + 30 * swell) + '" fill="' + PUS + '" stroke="' + INK + '" stroke-width="2"' + (o.rupt ? ' stroke-dasharray="6 5"' : '') + '/>';
  s += '<path d="' + canal + '" fill="' + CANAL + '" stroke="' + INK + '" stroke-width="2"/>';
  // sebum filling the canal from the bottom
  var sb = o.sebum || 0;
  if (sb > 0) { CLIPN++; var cid = "cc" + CLIPN, lvl = lerp(cb + 10, op - 4, sb); s += '<clipPath id="' + cid + '"><path d="' + canal + '"/></clipPath><g clip-path="url(#' + cid + ')">' + R(FX - 40, lvl, 80, cb + 20 - lvl, SEBUM, 0) + '<path d="M' + (FX - 40) + ' ' + f(lvl) + ' q10 ' + f(-3 * Math.sin(t * 3)) + ' 20 0 t20 0 t20 0 t20 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/></g>'; }
  if (swell) s += '<ellipse cx="' + FX + '" cy="' + f(op + 110) + '" rx="' + f(10 + 26 * swell) + '" ry="' + f(55 + 26 * swell) + '" fill="' + PUS + '" opacity=".85"/>';
  // the hair: bulb at the bottom, shaft up out of the skin
  s += '<ellipse cx="' + FX + '" cy="' + (cb + 2) + '" rx="13" ry="10" fill="' + BROWN + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + FX + ' ' + cb + ' L' + (FX + 2) + ' ' + f(op + 20) + ' Q' + (FX + 4) + ' ' + f(op - 40) + ' ' + f(FX + 22 + 3 * Math.sin(t * 1.3)) + ' ' + f(op - 110) + '" stroke="' + HAIRC + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  // the gland: lobes beside the canal, a short duct into it
  var g = o.gland || 1, gx = FX + 40 + 30 * g, gy = T0 + 150, br = 1 + .03 * Math.sin(t * 2.2);
  s += '<path d="M' + (FX + w1 - 1) + ' ' + (gy - 22) + ' Q' + f(gx - 20 * g) + ' ' + (gy - 26) + ' ' + f(gx - 26 * g) + ' ' + (gy - 8) + '" stroke="' + INK + '" stroke-width="12" fill="none"/><path d="M' + (FX + w1 - 3) + ' ' + (gy - 22) + ' Q' + f(gx - 20 * g) + ' ' + (gy - 26) + ' ' + f(gx - 26 * g) + ' ' + (gy - 8) + '" stroke="' + SEBUM_L + '" stroke-width="8" fill="none"/>';
  var lobes = [[0, 0, 24], [20, -14, 18], [22, 14, 19], [-4, 22, 16], [-2, -20, 16]];
  var lb = lobes.map(function (q) { return C(gx + q[0] * g * br, gy + q[1] * g * br, q[2] * g * br, SEBUM_L, 2); }).join("");
  s += lb + lobes.map(function (q) { return '<circle cx="' + f(gx + q[0] * g * br) + '" cy="' + f(gy + q[1] * g * br) + '" r="' + f(q[2] * g * br - 1.5) + '" fill="' + SEBUM_L + '"/>'; }).join("");
  for (i = 0; i < 10; i++) s += '<circle cx="' + f(gx + (hsh(i) - .5) * 44 * g) + '" cy="' + f(gy + (hsh(i + 9) - .5) * 44 * g) + '" r="2.4" fill="' + SEBUM + '"/>';
  // sebum drops: from the gland, along the duct, up the canal and out over the skin
  if (o.flow) for (i = 0; i < 6; i++) {
    var p = (t * .35 + i / 6) % 1, dxp, dyp;
    if (p < .3) { dxp = lerp(gx - 20 * g, FX + 4, p / .3); dyp = gy - 20; } else if (p < .8) { dxp = FX + 6; dyp = lerp(gy - 20, op + 2, (p - .3) / .5); } else { dxp = lerp(FX + 6, FX + 6 + 120 * (i % 2 ? 1 : -1), (p - .8) / .2); dyp = sy(dxp) - 4; }
    s += G("", '<ellipse cx="' + f(dxp) + '" cy="' + f(dyp) + '" rx="6" ry="7.5" fill="' + SEBUM + '" stroke="' + INK + '" stroke-width="1.4"/>', o.flow * Math.min(1, Math.sin(p * Math.PI) * 3));
  }
  // dead skin cells: flat flakes along the canal walls, piling at the opening
  if (o.flakes) for (i = 0; i < 12; i++) { var fy = lerp(op + 70, op + 4, hsh(i + 30)), fx2 = FX + (i % 2 ? 1 : -1) * (6 + 5 * hsh(i + 40)), fk = clamp(o.flakes * 1.6 - i / 12); s += G("translate(" + f(fx2) + " " + f(fy) + ") rotate(" + f((hsh(i) - .5) * 60) + ")", '<path d="M-9 -3 L7 -4 L10 2 L-6 4 Z" fill="' + FLAKE + '" stroke="' + INK + '" stroke-width="1.2"/>', fk); }
  // the plug at the opening
  if (o.plug) s += G("", '<path d="M' + f(FX - w0 - 2) + ' ' + f(op - 3) + ' Q' + FX + ' ' + f(op - 14) + ' ' + f(FX + w0 + 2) + ' ' + f(op - 3) + ' C' + f(FX + w1 + 2) + ' ' + f(op + 26) + ' ' + f(FX + w1) + ' ' + f(op + 36) + ' ' + f(FX + w1 - 2) + ' ' + f(op + 44) + ' Q' + FX + ' ' + f(op + 50) + ' ' + f(FX - w1 + 2) + ' ' + f(op + 44) + ' C' + f(FX - w1) + ' ' + f(op + 36) + ' ' + f(FX - w1 - 2) + ' ' + f(op + 26) + ' ' + f(FX - w0 - 2) + ' ' + f(op - 3) + ' Z" fill="#c9a865" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M' + (FX - 10) + ' ' + f(op + 10) + ' l8 -3 M' + (FX + 2) + ' ' + f(op + 24) + ' l9 -2 M' + (FX - 8) + ' ' + f(op + 34) + ' l7 2" stroke="' + INK + '" stroke-width="1.3"/>', o.plug);
  // bacteria: rods in the canal (in the sebum) and on the surface
  function rod(x, y, a, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + f(sc || 1) + ")", '<rect x="-7" y="-3" width="14" height="6" rx="3" fill="' + BAC_L + '" stroke="' + BAC + '" stroke-width="1.6"/>'); }
  var nb = Math.round(o.bac || 0);
  for (i = 0; i < nb; i++) { var by = lerp(op + 50, cb - 8, hsh(i + 70)), bx = FX + (hsh(i + 80) - .5) * 20 + 1.5 * Math.sin(t * 3 + i); if (swell) { bx = FX + (hsh(i + 80) - .5) * (20 + 40 * swell); by = lerp(op + 40, op + 170, hsh(i + 70)); } s += rod(bx, by + 1.5 * Math.cos(t * 2.6 + i), hsh(i + 90) * 180 + 10 * Math.sin(t + i), .8); }
  var ns = Math.round(o.surf || 0);
  for (i = 0; i < ns; i++) { var kx = hsh(i + 200), ky = hsh(i + 210), sx = x0 + 30 + kx * (x1 - x0 - 60), syy = lerp(sy(sx), T0 + DY, ky) - 4; s += rod(sx + ky * DX + 2 * Math.sin(t * 2 + i), syy, hsh(i + 220) * 180, .8); }
  // white blood cells: out of the vessel, gathering round the canal
  if (o.wbc) for (i = 0; i < 9; i++) {
    var k2 = clamp(o.wbc * 1.5 - i * .06), ax = 120 + i * 45, ay = vy, ang = i * .7, tx = FX + Math.cos(ang) * (36 + 12 * (i % 3)), ty = op + 110 + Math.sin(ang) * 70;
    var wx = lerp(ax, tx, ease(k2)) + 2 * Math.sin(t * 2 + i), wy = lerp(ay, ty, ease(k2)) + 2 * Math.cos(t * 2.4 + i);
    s += G("", C(wx, wy, 11, WBC, 1.8) + '<path d="M' + f(wx - 5) + ' ' + f(wy) + ' q2 -5 5 0 q3 5 5 0" stroke="' + WBC_N + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>', Math.min(1, k2 * 4));
  }
  // pus leaking deeper after a squeeze
  if (o.rupt) for (i = 0; i < 9; i++) { var rk = clamp(o.rupt * 1.4 - i * .05), ra = Math.PI * (.15 + .7 * i / 8); s += G("", C(FX + Math.cos(ra) * (60 + 110 * rk), op + 150 + Math.sin(ra) * (30 + 90 * rk), 7, PUS, 1.6), rk); }
  if (scar) s += G("", '<path d="M' + (FX - 60) + ' ' + f(T0 + 46) + ' Q' + FX + ' ' + f(T0 + 90) + ' ' + (FX + 60) + ' ' + f(T0 + 46) + '" stroke="#b46a58" stroke-width="5" fill="none" stroke-linecap="round"/>', scar);
  // soap foam on top
  if (o.soap) for (i = 0; i < 16; i++) { var bk = hsh(i + 300), bx2 = x0 + 20 + bk * (x1 - x0 - 20), by2 = lerp(sy(bx2), T0 + DY, hsh(i + 310)) - 8 - 4 * Math.sin(t * 2 + i); s += G("", C(bx2 + hsh(i + 310) * DX, by2, 7 + 9 * hsh(i + 320), "#fbf8f1", 1.4), clamp(o.soap * 2 - i / 16)); }
  // fingers pressing from both sides
  if (o.sq) { var pz = o.sq * 45; [-1, 1].forEach(function (sd) {
    var fxp = FX + sd * (230 - pz), fyp = T0 - 26;
    s += G("translate(" + f(fxp) + " " + f(fyp) + ") scale(" + (-sd) + " 1)", '<path d="M-170 -34 L-10 -34 C26 -34 40 -14 40 4 C40 24 24 34 -10 34 L-170 34 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M8 -26 C26 -24 30 -6 28 4 C26 14 18 20 8 20 C0 14 -2 -18 8 -26 Z" fill="#f2d2c0" stroke="' + INK + '" stroke-width="1.6"/><path d="M-60 -10 q-6 10 0 20 M-80 -10 q-6 10 0 20" stroke="' + SKIN2 + '" stroke-width="2" fill="none"/>');
  }); }
  return s;
}
function skinMini(x, y, sc, o, t) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", skin(o, t)); }
var OP = function () { return SK.top; };   // the pore opening height

// ── people (shared person kit), T-shirts ──
var SPOTS = [[-10, 9], [11, 7], [-7, 16], [9, 17], [-13, 1], [13, 0], [2, 21], [-3, -13], [6, -15], [-15, 11], [15, 12], [-1, 15]];
var MATE = { shirt: "#9fb38a", shirtD: "#7d9168" };
function pimples(hc, s, n, t, scale, hand) {
  var out = "", m = Math.floor(n), fr = n - m;
  for (var i = 0; i < Math.min(Math.ceil(n), SPOTS.length); i++) {
    if (hand && SPOTS[i][1] < -5) continue;
    var p = SPOTS[i], k = i < m ? 1 : fr, x = hc[0] + p[0] * s, y = hc[1] + p[1] * s, r = (2.2 + 1 * hsh(i)) * s * (scale || 1) * (1 + .06 * Math.sin(t * 2 + i));
    out += G("", '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.9) + '" fill="' + RED + '" opacity=".28"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + RED + '"/>' + (i % 3 === 0 ? '<circle cx="' + f(x - r * .25) + '" cy="' + f(y - r * .3) + '" r="' + f(r * .4) + '" fill="' + PUS + '"/>' : ""), k);
  }
  return out;
}
var LASTHEAD = [0, 0];
// o: {spots, hand (on the forehead), brows, mouth, mate (the friend's shirt), turn, outfit}
function boy(x, y, s, t, o) {
  o = o || {};
  var q = { x: x, y: y, s: s, legs: "stand", outfit: o.outfit || { base: "casual", colors: o.mate ? MATE : {} }, breath: (Math.sin(t * 1.7 + x) + 1) / 2,
    head: { tilt: (o.tilt || 0) + 1.6 * Math.sin(t * .9 + x * .01), turn: o.turn || 0 },
    face: { eyes: ((t + x * .003) * 1000) % 3900 < 130 ? .05 : (o.eyes == null ? 1 : o.eyes), brows: o.brows || "neutral", mouth: o.mouth || "neutral", look: o.look || [0, 0] } };
  if (o.hand) { var gh = PERSON.front(q).joints.head; q.arms = [{}, { to: [gh[0] + 23 * s, gh[1] - 13 * s], bend: 1, hand: "flat", front: true, rot: -168, palm: true }]; }
  if (o.arms) q.arms = o.arms;
  var P = PERSON.front(q); LASTHEAD = P.joints.head;
  return P.svg + pimples(P.joints.head, s, o.spots || 0, t, 1, o.hand);
}
// a bust in a clipped frame (for the grid of faces and photo frames)
function bust(cx, cy, w, h, s, t, o, frame) {
  CLIPN++; var id = "bc" + CLIPN;
  return '<clipPath id="' + id + '"><rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath>' + R(cx - w / 2, cy - h / 2, w, h, frame || "#f4ecdb", 2) +
    '<g clip-path="url(#' + id + ')">' + boy(cx, cy - h / 2 + 14 * s + 192 * s, s, t, o) + '</g>' + R(cx - w / 2, cy - h / 2, w, h, "none", 2.4);
}

// ── props ──
function burger(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-40 -2 C-40 -30 40 -30 40 -2 Z" fill="#d79b52" stroke="' + INK + '" stroke-width="2.2"/><path d="M-28 -16 l3 -2 M-8 -20 l3 -2 M14 -17 l3 -2" stroke="#f4ecdb" stroke-width="2.4" stroke-linecap="round"/>' + R(-44, -2, 88, 8, "#7d9a52", 2, 3) + R(-42, 6, 84, 10, "#7a4a32", 2, 4) + '<path d="M-40 16 L40 16 C40 30 -40 30 -40 16 Z" fill="#d79b52" stroke="' + INK + '" stroke-width="2.2"/>'); }
function soapBar(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-46 -6 L-30 -24 L50 -24 L34 -6 Z" fill="#cfe3e8" stroke="' + INK + '" stroke-width="2.2"/>' + R(-46, -6, 80, 28, "#a9cdd6", 2.2, 3) + '<path d="M34 -6 L50 -24 L50 4 L34 22 Z" fill="#8fb7c2" stroke="' + INK + '" stroke-width="2.2"/>' + C(-30, -32, 8, "#fbf8f1", 1.6) + C(-14, -40, 6, "#fbf8f1", 1.6) + C(4, -34, 9, "#fbf8f1", 1.6)); }
function chocolate(x, y, sc) { var s = '<path d="M-50 -30 L30 -30 L50 -14 L50 34 L-30 34 L-50 18 Z" fill="#5a3826" stroke="' + INK + '" stroke-width="2.2"/>'; for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) s += R(-44 + i * 26, -24 + j * 26, 22, 22, "#6e4630", 1.6, 2); return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s + '<path d="M-50 18 L-50 34 L30 34 L50 18" fill="#c9c3b6" stroke="' + INK + '" stroke-width="2"/>'); }
function dna(x, y, h, t, sc) { var s = ""; for (var i = 0; i <= 12; i++) { var yy = y - h / 2 + i * h / 12, a = t * 1.6 + i * .55, xa = x + Math.sin(a) * 22 * (sc || 1), xb = x - Math.sin(a) * 22 * (sc || 1); s += '<path d="M' + f(xa) + ' ' + f(yy) + ' L' + f(xb) + ' ' + f(yy) + '" stroke="' + (i % 2 ? OLIVE : ORANGE) + '" stroke-width="3"/>' + C(xa, yy, 4.5, BLUE, 1.4) + C(xb, yy, 4.5, "#c9a865", 1.4); } return s; }
function gauge(x, y, r, v, label2) { var a = Math.PI * (1 + v); return P("M" + f(x - r) + " " + f(y) + " A" + r + " " + r + " 0 0 1 " + f(x + r) + " " + f(y), "#f4ecdb", 2.4) + '<path d="M' + f(x - r + 6) + ' ' + y + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + f(x) + ' ' + f(y - r + 6) + '" stroke="' + OLIVE + '" stroke-width="6" fill="none"/><path d="M' + f(x) + ' ' + f(y - r + 6) + ' A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + f(x + r - 6) + ' ' + y + '" stroke="' + ORANGE + '" stroke-width="6" fill="none"/>' +
  '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * (r - 14)) + ' ' + f(y + Math.sin(a) * (r - 14)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 6, INK, 0) + (label2 ? T(label2, x, y + 34, 22, INK, 700) : ""); }
function moonIcon(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M10 -30 A32 32 0 1 0 30 18 A26 26 0 1 1 10 -30 Z" fill="#f0c66a" stroke="' + INK + '" stroke-width="2.4"/>' + T("z", 34, -26, 22, BLUE, 800) + T("z", 46, -44, 16, BLUE, 800)); }
function calendar(x, y, sc, t) { var s = R(-40, -34, 80, 74, "#f4ecdb", 2.4, 4) + R(-40, -34, 80, 18, ORANGE, 2.4, 4) + '<path d="M-24 -42 v14 M24 -42 v14" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) s += C(-27 + i * 18, -2 + j * 16, 4.5, i === 2 && j === 1 ? RED : "#d8ccae", 1); return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s); }
function stressIcon(x, y, sc, t) { var s = ""; for (var i = 0; i < 3; i++) s += '<path d="M' + f(-30 + i * 22) + ' ' + f(-30 + 3 * Math.sin(t * 8 + i)) + ' l8 -14 l-4 12 l10 -4" stroke="' + ORANGE + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", s + P("M-34 0 C-40 -20 -10 -24 0 -12 C10 -26 40 -20 34 0 C40 20 10 30 0 18 C-14 30 -40 18 -34 0 Z", "#f4ecdb", 2.4) + '<path d="M-20 0 q6 -8 12 0 t12 0 t12 0" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'); }
function plate(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<ellipse cx="0" cy="0" rx="60" ry="18" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="0" cy="-2" rx="38" ry="10" fill="#e8dcc0" stroke="' + INK + '" stroke-width="1.4"/>' + burger(0, -18, .55)); }
// the kitchen sink and its trap, cut open from the side
function sink(t, k) {
  var s = '<path d="M60 150 L580 150 L520 330 L120 330 Z" fill="#c9cdd0" stroke="' + INK + '" stroke-width="2.6"/><path d="M84 162 L556 162 L504 318 L136 318 Z" fill="#e3e6e6" stroke="' + INK + '" stroke-width="1.6"/>';
  var wl = lerp(316, 230, k); s += '<path d="M' + f(lerp(136, 104, (316 - wl) / 154)) + ' ' + f(wl) + ' L' + f(lerp(504, 536, (316 - wl) / 154)) + ' ' + f(wl) + ' L504 318 L136 318 Z" fill="#9fc0cf" opacity=".85"/>' + wave(lerp(136, 110, (316 - wl) / 154), wl, lerp(504, 530, (316 - wl) / 154), wl, t, BLUE, 3, 40, 1, 2);
  // pipe down, U-trap, out to the wall
  var pipe = "M300 330 L300 470 Q300 560 380 560 Q460 560 460 470 L460 430 L600 430";
  s += '<path d="' + pipe + '" stroke="' + INK + '" stroke-width="52" fill="none"/><path d="' + pipe + '" stroke="#e3e6e6" stroke-width="46" fill="none"/>';
  s += '<path d="M300 330 L300 470 Q300 556 380 556" stroke="#9fc0cf" stroke-width="40" fill="none" opacity=".8"/>';
  s += '<path d="' + pipe + '" stroke="' + SEBUM + '" stroke-width="46" fill="none" stroke-dasharray="1 0" opacity=".0"/>';
  // grease coating and the clump in the bend
  s += '<path d="M277 360 L277 470 Q277 578 380 582 Q483 578 483 470 L483 430 L600 430" stroke="' + SEBUM + '" stroke-width="10" fill="none" opacity=".95"/>';
  s += '<path d="M323 360 L323 470 Q323 535 380 536 Q437 535 437 470 L437 452 L600 452" stroke="' + SEBUM + '" stroke-width="8" fill="none"/>';
  s += G("", '<ellipse cx="380" cy="556" rx="64" ry="22" fill="' + SEBUM + '" stroke="' + INK + '" stroke-width="2"/>' + C(356, 552, 7, BROWN, 1.4) + C(384, 562, 6, "#7d9a52", 1.4) + C(404, 550, 7, BROWN, 1.4) + C(372, 566, 5, "#c06a3a", 1.4), k);
  s += R(270, 322, 60, 12, "#9a9e9f", 2, 3);
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
var BY = 800, BS = 2.1;   // the waist-up boys
// 3 · under the skin of your face: start on his face, magnify a patch
shot(3, push(320, 420, 1.0, 1.25), function (u, d, t) {
  var s = paper() + boy(320, BY + 40, 2.5, t, { spots: 0 }), h = LASTHEAD, k = at(u, .8, .6);
  return s + G("", '<circle cx="' + f(h[0] + 24) + '" cy="' + f(h[1] + 20) + '" r="18" fill="none" stroke="' + ORANGE + '" stroke-width="3"/>', k) +
    G("", '<path d="M' + f(h[0] + 36) + ' ' + f(h[1] + 32) + ' L520 560" stroke="' + ORANGE + '" stroke-width="2.4" stroke-dasharray="6 5"/>' + inset(520, 620, 110, skinMini(-SK.fx * .55, -(OP() + 70) * .55, .55, {}, t), at(u, 1.2, .6)), k);
});
shot([3, 1], push(330, 380, .92, 1.0), function (u, d, t) {
  return paper() + skin({}, t) + label(SK.fx - 18, OP() + 4, 120, 140, "المسام", INK, at(u, .2, .5), 26) +
    label(SK.fx + 22, OP() - 90, 470, 110, "شعرة", INK, at(u, .6, .5), 26) + label(SK.fx + 100, OP() + 150, 520, 330, "غدة دهنية", OLIVE, at(u, 1.1, .5), 28) +
    label(80, OP() + 20, 110, 640, "الجلد", INK, at(u, 1.5, .5), 22);
}, { tr: "in" });
// 4 · the gland makes oil that keeps the skin soft
shot(4, push(340, 380, 1.05, 1.15), function (u, d, t) {
  return paper() + skin({ flow: at(u, .3, .5), sebum: .1 }, t) + label(SK.fx + 96, OP() + 150, 500, 190, "دهن", ORANGE, at(u, .6, .5), 30) +
    G("", tag("بيحمي الجلد", 330, 110, 1, 26, OLIVE), at(u, 1.8, .4));
});
// 5 · so how does a pimple start?
shot(5, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + dim(.55, skin({ flow: 1, sebum: .1 }, t)) + G("", N("؟", 320 + 6 * Math.sin(t * 2), 200, 170, ORANGE), at(u, .1, .4));
}, { tr: "out" });
// 6 · puberty hormones: the gland grows and makes more oil
hud(6, 7, function (u, t) { return tag("هرمونات المراهقة", 320, 70, at(u, .2, .3), 28, ORANGE); });
shot(6, push(390, 400, 1.12, 1.2), function (u, d, t) {
  var g = lerp(1, 1.6, at(u, .8, 1.6)), hs = "";
  for (var i = 0; i < 8; i++) { var p = (t * .3 + i / 8) % 1, hx = 120 + i * 55, hy = lerp(SK.top + 304, SK.top + 150, p); hs += G("translate(" + f(hx + 12 * Math.sin(t + i)) + " " + f(hy) + ")", '<path d="M0 -8 L7 -4 L7 4 L0 8 L-7 4 L-7 -4 Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.4"/>', Math.sin(p * Math.PI) * at(u, .2, .4)); }
  return paper() + skin({ gland: g, flow: 1, sebum: lerp(.1, .45, at(u, 1, 2.4)) }, t) + hs + label(SK.fx + 110, OP() + 170, 470, 560, "الغدة بتكبر", OLIVE, at(u, 1.6, .5), 26);
});
// 7 · about 8 in 10 teenagers get spots, not equally
var FACES = [3, 0, 6, 2, 9, 1, 4, 0, 5, 2];
shot(7, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + numBox("8 / 10", 320, 110, at(u, .2, .4), 42);
  for (var i = 0; i < 10; i++) { var cx = 82 + (i % 5) * 119, cy = 300 + Math.floor(i / 5) * 230, k = at(u, .3 + i * .12, .3), n = i === 1 || i === 7 ? 0 : FACES[i] * at(u, .8 + i * .08, .8);
    s += G("", bust(cx, cy, 108, 200, 1.45, t + i, { spots: n, mate: i % 2, brows: n > 3 ? "worried" : "neutral", mouth: n > 3 ? "frown" : "smile" }), k); if (i === 1 || i === 7) s += check(cx + 34, cy - 80, .6, at(u, 2.6, .4), OLIVE); }
  return s;
});
// 8 · extra oil mixes with dead skin cells and plugs the pore
shot(8, push(SK.fx, OP() + 60, 1.7, 1.95), function (u, d, t) {
  return paper() + skin({ gland: 1.6, flow: 1, sebum: .55, flakes: at(u, .3, 1.6), plug: at(u, 2.2, .8) }, t) +
    label(SK.fx - 16, OP() + 40, 200, OP() + 150, "جلد ميت", INK, at(u, .9, .4), 20) + label(SK.fx + 14, OP() + 4, 400, OP() - 60, "سدادة", ORANGE, at(u, 2.6, .4), 26);
}, { tr: "in" });
// 9 · like the kitchen sink: grease and scraps block the pipe
shot(9, push(330, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + sink(t, at(u, .4, 2.4)) + label(380, 556, 220, 660, "زيت + بواقي أكل", ORANGE, at(u, 1.4, .5), 24) +
    inset(100, 100, 80, skinMini(-SK.fx * .4, -(OP() + 30) * .4, .4, { plug: 1, sebum: .6, gland: 1.6 }, t), at(u, .3, .4));
});
// 10 · bacteria live on everyone's skin and eat the oil
shot(10, push(330, 360, 1.0, 1.12), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .55, plug: 0, surf: 22 * at(u, .2, 1), bac: 6 * at(u, 2, 1), flow: 1 }, t) +
    label(150, OP() - 30, 200, 120, "بكتيريا", OLIVE, at(u, .6, .5), 28) + G("", tag("على جلد كل الناس", 400, 110, 1, 24, INK), at(u, 1.3, .4));
}, { tr: "out" });
// 11 · the door shuts: lots of food, no air, they multiply
hud(11, 12, function (u, t) { var k = at(u, .8, 2.6); return numBox(Math.round(lerp(6, 320, k * k)) + "", 520, 90, at(u, .2, .3), 38) + T("بكتيريا", 520, 140, 20, OLIVE, 700); });
shot(11, push(SK.fx, OP() + 120, 1.55, 1.75), function (u, d, t) {
  var k = at(u, .8, 2.6);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: lerp(6, 46, k * k) }, t) + G("", C(SK.fx - 120, OP() - 40, 22, "#e6eef2", 2) + T("هوا", SK.fx - 120, OP() - 32, 18, BLUE, 800), at(u, .4, .3)) + cross(SK.fx - 120, OP() - 40, .7, at(u, .9, .4));
}, { tr: "in" });
// 12 · the immune system sends an army of white cells
shot(12, push(330, 420, 1.05, 1.15), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 46, wbc: at(u, .6, 2.6) }, t) +
    label(150, SK.top + 300, 240, 650, "كرات الدم البيضا", BLUE, at(u, 1, .5), 24) + G("", tag("جهاز المناعة", 320, 110, 1, 28, BLUE), at(u, .2, .4));
});
// 13 · red, swollen, pus = the pimple; then back out to the face
shot(13, push(SK.fx, OP() + 60, 1.1, 1.3), function (u, d, t) {
  var k = at(u, .2, 1.6);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 46, wbc: 1, red: k, bump: k, pus: at(u, .9, 1.2) }, t) +
    label(SK.fx + 30, OP() + 100, 420, 580, "صديد", ORANGE, at(u, 1.5, .4), 26) + label(SK.fx + 120, OP() - 10, 440, 150, "بيحمر", RED, at(u, .7, .4), 26);
});
shot([13, 1], push(320, 460, 1.4, 1.2), function (u, d, t) {
  var s = paper() + boy(320, BY + 80, 2.6, t, { spots: 4, brows: "worried", mouth: "frown" }), h = LASTHEAD;
  return s + G("", '<circle cx="' + f(h[0] - 10 * 2.6) + '" cy="' + f(h[1] + 9 * 2.6) + '" r="22" fill="none" stroke="' + ORANGE + '" stroke-width="3.5"/>', at(u, .5, .4));
}, { tr: "out" });
// 14 · so why not your friend?
shot(14, push(320, 430, 1.0, 1.05), function (u, d, t) {
  return paper() + boy(185, BY, BS, t, { spots: 10, hand: true, brows: "worried", mouth: "frown" }) + boy(470, BY, BS, t + 1, { mate: 1, mouth: "smile" }) +
    numBox("10", 185, 690, 1, 30, true) + numBox("0", 470, 690, 1, 30, true) + G("", N("؟", 470, 200, 110, ORANGE), at(u, .2, .3));
});
// 15 · the same bacteria are on his face right now
shot(15, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var s = paper() + boy(185, BY, BS, t, { spots: 10, hand: true, brows: "worried", mouth: "frown" }), h1 = LASTHEAD;
  s += boy(470, BY, BS, t + 1, { mate: 1, mouth: "smile" }); var h2 = LASTHEAD;
  function bugs(n) { var r = ""; for (var i = 0; i < n; i++) r += G("translate(" + f((hsh(i) - .5) * 90 + 3 * Math.sin(t * 2 + i)) + " " + f((hsh(i + 5) - .5) * 90) + ") rotate(" + f(hsh(i + 9) * 180) + ")", '<rect x="-9" y="-4" width="18" height="8" rx="4" fill="' + BAC_L + '" stroke="' + BAC + '" stroke-width="1.8"/>'); return R(-80, -80, 160, 160, "#efcab2", 0) + r; }
  [h1, h2].forEach(function (h, j) { var cx = j ? 520 : 140, k = at(u, .3 + j * .5, .5);
    s += G("", '<path d="M' + f(h[0] + (j ? 20 : -20)) + ' ' + f(h[1] + 20) + ' L' + cx + ' 210" stroke="' + OLIVE + '" stroke-width="2.4" stroke-dasharray="6 5"/>' + inset(cx, 170, 70, bugs(12), 1) + check(cx + 50, 110, .55, at(u, 1 + j * .5, .4), OLIVE), k); });
  return s + G("", tag("نفس البكتيريا", 330, 330, 1, 26, OLIVE), at(u, 1.6, .4));
});
// 16 · the difference is genes: how much oil, whether the plug forms
shot(16, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, 1.6);
  return paper() + G("", dna(170, 190, 200, t) + dna(470, 190, 200, t + .7), at(u, .1, .4)) + G("", tag("الجينات", 320, 70, 1, 30, ORANGE), at(u, .3, .3)) +
    G("", skinMini(170 - SK.fx * .38, 330 - OP() * .38, .38, { gland: lerp(1, 1.7, k), sebum: lerp(.2, .7, k), plug: at(u, 2.4, .6), flow: 1 }, t) + skinMini(470 - SK.fx * .38, 330 - OP() * .38, .38, { gland: 1, sebum: .2, flow: 1 }, t + .5), at(u, .5, .4)) +
    gauge(170, 640, 60, lerp(.3, .85, k), "غددك") + gauge(470, 640, 60, .3, "غدد صاحبك");
});
// 17 · if your dad or mum had spots, your chances are higher
shot(17, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + G("", bust(320, 200, 190, 230, 1.15, t, { spots: 7, outfit: "office", brows: "worried", mouth: "frown" }, "#e7dcc4") + T("أبوك زمان", 320, 345, 22, INK, 700) + T("(أو أمك)", 320, 375, 20, MUTE, 700), at(u, .1, .4)) +
    G("", dna(320, 470, 120, t, .7) + arrow(320, 420, 320, 535, ORANGE, 4, 1), at(u, .9, .4)) +
    G("", bust(320, 650, 190, 200, 1.1, t + 2, { spots: 6, brows: "worried" }) + numBox("↑", 470, 650, 1, 44), at(u, 1.6, .4));
});
// 18 · more triggers: stress, little sleep, the period
shot(18, push(320, 400, .9, .95), function (u, d, t) {
  var k1 = at(u, .9, .3), k2 = at(u, 1.9, .3), k3 = at(u, 3.0, .3);
  return paper() + boy(320, BY + 20, BS, t, { spots: 3 + k1 + k2 + k3, brows: "worried", mouth: "frown" }) +
    iconBox(95, 210, 120, stressIcon(0, 4, 1.2, t), k1) + G("", T("توتر", 95, 310, 26, ORANGE, 800), k1) +
    iconBox(320, 110, 120, moonIcon(-8, 8, 1.1), k2) + G("", T("قلة نوم", 320, 210, 26, BLUE, 800), k2) +
    iconBox(545, 210, 120, calendar(0, 4, 1.1, t), k3) + G("", T("الدورة", 545, 310, 26, RED, 800), k3);
});
// 19 · the myth: dirt or chocolate. No.
shot(19, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + soapBar(180, 330 + 4 * Math.sin(t * 2), 1.6) + chocolate(460, 330 + 4 * Math.cos(t * 2), 1.6) + G("", T("الوساخة", 180, 460, 30, INK, 800) + T("الشوكولاتة", 460, 460, 30, INK, 800), at(u, .3, .4)) +
    cross(180, 330, 1.2, at(u, 2.2, .4)) + cross(460, 330, 1.2, at(u, 2.6, .4)) + G("", tag("لأ", 320, 600, 1, 48, ORANGE), at(u, 2.9, .3));
});
// 20 · the plug forms inside the pore; scrubbing irritates; food matters little
shot(20, push(SK.fx, OP() + 50, 1.3, 1.45), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .6, plug: 1, soap: at(u, .2, 1), flow: 1 }, t) + label(SK.fx + 14, OP() + 30, 420, OP() + 220, "جوه", ORANGE, at(u, .8, .4), 30);
});
shot([20, 1], push(330, 360, 1.05, 1.12), function (u, d, t) {
  return paper() + skin({ gland: 1.6, sebum: .6, plug: 1, soap: 1, irrit: 1, red: .5 * at(u, .3, 1) }, t) + G("", tag("بيهيّج الجلد", 320, 110, 1, 28, RED), at(u, .5, .4));
});
shot([20, 2], push(320, 400, 1.0, 1.05), function (u, d, t) {
  return paper() + plate(320, 380, 2.2) + G("", T("تأثير صغير", 320, 560, 34, OLIVE, 800), at(u, .4, .4)) + measure(150, 620, 220, 620, at(u, .6, .5), "");
});
// 21 · don't squeeze: the pressure pushes pus deeper and leaves a mark
shot(21, push(SK.fx, OP() + 90, 1.05, 1.2), function (u, d, t) {
  var sq = at(u, .2, .9), r = at(u, 1.3, 1.4);
  return paper() + skin({ gland: 1.6, sebum: .7, plug: 1, bac: 30, red: .8, bump: 1, pus: 1, sq: sq * (1 - at(u, 3.2, .5)), rupt: r, scar: at(u, 3.4, .8) }, t) +
    arrow(SK.fx, OP() + 120, SK.fx, OP() + 230, ORANGE, 5, r) + label(SK.fx + 60, OP() + 50, 520, OP() + 360, "أثر", RED, at(u, 3.6, .4), 28) + cross(SK.fx, OP() - 140, 1, at(u, .7, .4));
});
// 22 · recap: hormones → oil → plug → bacteria → immune fire
shot(22, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var cells = [{ gland: 1.6, flow: 1, sebum: .3 }, { gland: 1.6, sebum: .6, plug: 1 }, { gland: 1.6, sebum: .7, plug: 1, bac: 40 }, { gland: 1.6, plug: 1, bac: 40, wbc: 1, red: 1, bump: 1, pus: 1 }], s = paper();
  cells.forEach(function (o, i) { var cx = i % 2 ? 470 : 170, cy = i < 2 ? 230 : 560, k = at(u, .2 + i * 1.3, .5);
    s += G("", R(cx - 150, cy - 150, 300, 300, "#f4ecdb", 2) + skinMini(cx - SK.fx * .44, cy - OP() * .44 - 10, .44, o, t) + callout(i + 1 + "", cx - 128, cy - 128, 1), k); });
  return s;
});
// 23 · twin studies: about 80% genetic
shot(23, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, 1.2, 1.6);
  return paper() + boy(180, BY - 40, 1.8, t, { spots: 6, brows: "worried" }) + boy(460, BY - 40, 1.8, t + .3, { spots: 6, brows: "worried" }) + G("", tag("توائم", 320, 90, 1, 28, OLIVE), at(u, .3, .3)) +
    G("", R(170, 560, 300, 150, "#f4ecdb", 2.4) + N(Math.round(80 * k) + "%", 320, 660, 90, ORANGE) + T("وراثة", 320, 700, 24, INK, 800), at(u, 1, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var l = LN[li], u = t - l.start, s = "";
  var k0 = li === 0 ? at(u, 1.2, 1.6) : 1, dimK = li === 1 ? at(u, .1, .4) : 0;
  var ppl = boy(160, 800, 2.3, t, { spots: 10 * k0, hand: k0 > .5, brows: k0 > .3 ? "worried" : "neutral", mouth: k0 > .3 ? "frown" : "neutral" }) + boy(450, 800, 2.3, t + 1, { mate: 1, mouth: "smile" }) +
    numBox(Math.round(10 * k0) + "", 160, 610, 1, 34, true) + numBox("0", 450, 610, 1, 34, true) + T("حبوب", 160, 560, 24, RED, 800) + T("صافي", 450, 560, 24, OLIVE, 800);
  s += li === 1 ? dim(.6 * dimK, ppl) : ppl;
  if (li === 0) s += G("", plate(160, 120, 1.5) + plate(450, 120, 1.5) + T("نفس الأكل", 305, 40, 28, INK, 800), at(u, 2.2, .4));
  if (li === 1) { s += soapBar(160, 140, 2) + cross(160, 130, 1.4, at(u, .7, .4)) + plate(450, 150, 1.6) + cross(450, 130, 1.4, at(u, 1.8, .4)) + T("نظافة", 160, 240, 26, INK, 800) + T("أكل", 450, 240, 26, INK, 800); }
  return s;
};
SCENE.bumper = function (u, t) {
  return '<circle cx="92" cy="112" r="56" fill="' + DERM + '"/>' + G("translate(" + f(92 - SK.fx * .2) + " " + f(112 - (OP() + 60) * .2) + ") scale(.2)", skin({ gland: 1.6, sebum: .6, plug: 1, bac: 20, red: .6 + .3 * Math.sin(t * 2), bump: .8 }, t));
};
SCENE.outro = function (svg, u, t) {
  return skinMini(300 - SK.fx * .5, 150 - OP() * .5, .5, { gland: 1.6, plug: 1, bac: 30, wbc: 1, red: 1, bump: 1, pus: 1 }, t) +
    callout("1", 300 + 70, 92, ease(u / .3)) + callout("2", 300 - 30, 110, ease(u / .3 - .5)) + callout("3", 300 + 40, 195, ease(u / .3 - 1)) + callout("4", 300 - 110, 190, ease(u / .3 - 1.5));
};
