
// ── «الموبايل اللي بيبات في الشاحن» — drawings in the «اسكتش» hand, to real sizes:
// phone 147 × 71.5 × 7.8 mm (a typical 6.1" phone), corner radius 9 mm, USB-C port 8.4 × 2.6 mm;
// pouch cell inside about 92 × 60 × 4.5 mm; 20 W USB-C wall charger, EU plug: body 44 × 38 × 28 mm, pins Ø4.8 × 19 mm, 19 mm apart;
// cell layers: aluminium foil + LiCoO2 cathode | separator | graphite anode + copper foil, in electrolyte.
// Bedroom: bed 2.0 m long, mattress top 0.55 m, nightstand 0.55 m; people with real proportions (H = 1.75 m).
var GLASSD = "#2f3a42", SCREEN = "#dfe6e4", FRAME = "#9aa2ac", POUCH = "#c9c2b0", BOARD = "#5e653a", CU = "#c07a4a", AL = "#b8bec4",
    GRAPH = "#4d4a44", CATH = "#7f97a6", ION = ORANGE, SHEET = "#e9e0c9", WOODN = "#a9784d", WOODN_D = "#7c5434", PILLOW = "#f1ebdc", BLANKET = "#9fb2a2";

// the phone from the front, centre (x, y), s units per mm. o: {pct, charging, dark, time, screen (svg in screen coords), tilt}
function phoneFront(x, y, s, o) {
  o = o || {}; var w = 71.5 * s, h = 147 * s, r = 9 * s, b = 2.2 * s, g = "";
  g += R(-w / 2, -h / 2, w, h, FRAME, 2.4, r) + R(-w / 2 + 1.2 * s, -h / 2 + 1.2 * s, w - 2.4 * s, h - 2.4 * s, GLASSD, 0, r - s);
  var sx = -w / 2 + b, sy = -h / 2 + b, sw = w - 2 * b, shh = h - 2 * b, id = "scr" + (++CLIPN);
  g += '<clipPath id="' + id + '"><rect x="' + f(sx) + '" y="' + f(sy) + '" width="' + f(sw) + '" height="' + f(shh) + '" rx="' + f(r - b) + '"/></clipPath>';
  g += '<g clip-path="url(#' + id + ')">' + R(sx, sy, sw, shh, o.dark ? "#26303a" : SCREEN, 0);
  if (o.pct != null) g += battIcon(0, -h * .05, s * 1.25, o.pct, o.charging, o.dark) + N(Math.round(o.pct) + "%", 0, h * .2, 15 * s, o.dark ? "#e9ecea" : INK);
  if (o.time) g += N(o.time, 0, -h * .3, 13 * s, o.dark ? "#e9ecea" : INK);
  if (o.screen) g += o.screen;
  g += '</g>' + C(0, -h / 2 + 9 * s, 2.6 * s, "#111", 0);   // front camera hole
  g += R(-w / 2 - 1.4 * s, -h * .22, 1.6 * s, 18 * s, FRAME, 1.2, 1) + R(w / 2 - .2 * s, -h * .26, 1.6 * s, 26 * s, FRAME, 1.2, 1);   // buttons
  return G("translate(" + f(x) + " " + f(y) + ")" + (o.tilt ? " rotate(" + o.tilt + ")" : ""), g);
}
// battery icon with a fill level, bolt when charging
function battIcon(x, y, s, pct, charging, dark) {
  var w = 30 * s, h = 14 * s, k = clamp(pct / 100), col = pct <= 20 ? ORANGE : pct > 80 ? ORANGE : OLIVE;
  if (pct > 20 && pct <= 80) col = OLIVE; if (pct > 80) col = BLUE;
  var g = R(-w / 2, -h / 2, w, h, "none", 1.6 * Math.min(1.5, s), 2.5 * s) + R(w / 2, -h * .2, 2.4 * s, h * .4, dark ? "#e9ecea" : INK, 0, 1) + R(-w / 2 + 2 * s, -h / 2 + 2 * s, (w - 4 * s) * k, h - 4 * s, col, 0, 1.5 * s);
  if (charging) g += '<path d="M' + f(2 * s) + ' ' + f(-h * .62) + ' L' + f(-5 * s) + ' ' + f(h * .08) + ' L' + f(0) + ' ' + f(h * .08) + ' L' + f(-2 * s) + ' ' + f(h * .62) + ' L' + f(5 * s) + ' ' + f(-h * .08) + ' L0 ' + f(-h * .08) + ' Z" fill="#f4d06a" stroke="' + INK + '" stroke-width="1.2"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", g.replace(/stroke="#2a2016"/g, dark ? 'stroke="#e9ecea"' : 'stroke="#2a2016"'));
}
// USB-C cable from the bottom of the phone at (x, y) along path d (already absolute); plug drawn at the phone end
function cable(d, col) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#f2efe8") + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }
function plugC(x, y, s) { return R(x - 4.5 * s, y, 9 * s, 14 * s, "#f2efe8", 1.6, 2 * s) + R(x - 3 * s, y - 4 * s, 6 * s, 4.5 * s, FRAME, 1.2, 1); }
// 20 W wall charger in profile, pins to the left (into the wall at x), s units per mm
function charger(x, y, s, o) {
  o = o || {}; var g = R(0, -19 * s, 28 * s, 38 * s, o.cheap ? "#e4e0d6" : "#f6f3ec", 2.2, 4 * s) + R(-19 * s, -11.5 * s, 19 * s, 4.8 * s, AL, 1.4, 2) + R(-19 * s, 6.7 * s, 19 * s, 4.8 * s, AL, 1.4, 2);
  if (!o.cheap) g += T("20W", 14 * s, 3 * s, 6 * s, MUTE, 700);
  return G("translate(" + f(x) + " " + f(y) + ")", g);
}
// charger cut open: o.cheap → bare board, no fuse, no isolation; else transformer, fuse, protection chip
function chargerInside(x, y, s, cheap, k) {
  var g = R(0, 0, 120 * s, 90 * s, "#f6f3ec", 2.4, 8 * s) + R(10 * s, 60 * s, 100 * s, 10 * s, BOARD, 1.6, 2);
  if (!cheap) g += R(18 * s, 26 * s, 30 * s, 34 * s, "#d9b86a", 1.8, 3) + '<path d="M22 ' + 30 * s + ' h' + 22 * s + ' M22 ' + 36 * s + ' h' + 22 * s + ' M22 ' + 42 * s + ' h' + 22 * s + ' M22 ' + 48 * s + ' h' + 22 * s + '" stroke="' + CU + '" stroke-width="2" transform="translate(' + f(-22 + 18 * s) + ' 0)"/>' +
    R(56 * s, 44 * s, 14 * s, 16 * s, INK, 0, 2) + R(76 * s, 34 * s, 10 * s, 26 * s, "#4a6f8a", 1.6, 4 * s) + R(92 * s, 48 * s, 18 * s, 8 * s, "#d8ccae", 1.4, 3);
  else g += R(30 * s, 46 * s, 12 * s, 14 * s, "#3a352e", 1.4, 2) + R(60 * s, 40 * s, 8 * s, 20 * s, "#b9ab8a", 1.4, 3);
  return G("translate(" + f(x) + " " + f(y) + ")", g);
}
// Egyptian wall socket (Schuko, round recess) at (x, y) seen from the side as a plate on the wall
function socketSide(x, y, s) { return R(x - 10 * s, y - 40 * s, 10 * s, 80 * s, "#efe9dc", 2, 3); }

// ── the cell, cut open: cathode (left) | separator | anode graphite layers (right). k = state of charge 0..1.
// Ions sit in the cathode at k = 0 and between the graphite sheets at k = 1. o: {t, flow (show moving ions), sei (0..1 crust), trapped, voltage}
var CELL = { x: 70, y: 210, w: 500, h: 360 };
function cellCut(k, o) {
  o = o || {}; var X = CELL.x, Y = CELL.y, W = CELL.w, H = CELL.h, t = o.t || 0, s = "";
  s += R(X - 10, Y - 10, W + 20, H + 20, "#e6efe9", 2.4, 6);                         // electrolyte bath
  s += R(X, Y, 22, H, AL, 2) + R(X + W - 22, Y, 22, H, CU, 2);                         // current collectors
  s += R(X + 22, Y, 170, H, "#d7dde0", 1.6);                                            // cathode coating
  for (var i = 0; i < 40; i++) { var cx = X + 40 + (i % 5) * 34 + (Math.floor(i / 5) % 2) * 14, cy = Y + 22 + Math.floor(i / 5) * 44; s += C(cx, cy, 15, CATH, 1.4); }
  s += '<path d="M' + (X + W / 2) + ' ' + Y + ' V' + (Y + H) + '" stroke="' + INK + '" stroke-width="3" stroke-dasharray="10 7"/>';   // separator
  var ax = X + W - 22 - 170; s += R(ax, Y, 170, H, "#ece6d6", 1.6);                  // anode coating: graphite sheets
  var NS = 9; for (var j = 0; j <= NS; j++) { var gy = Y + 18 + j * (H - 36) / NS; s += '<path d="M' + (ax + 8) + ' ' + f(gy) + ' H' + (ax + 162) + '" stroke="' + GRAPH + '" stroke-width="5" stroke-linecap="round"/>'; }
  if (o.sei) { var sk = clamp(o.sei); s += R(ax - 4, Y + 4, 10 + 14 * sk, H - 8, "#8f8576", 1.2, 3) + '<rect x="' + (ax - 4) + '" y="' + (Y + 4) + '" width="' + f(10 + 14 * sk) + '" height="' + (H - 8) + '" fill="url(#hatch)" opacity=".6"/>'; }
  // ions: 54 of them; the first k·54 sit in the anode gaps, the rest in the cathode
  var n = 54, inA = Math.round(n * clamp(k)), trapped = o.trapped || 0;
  for (var q = 0; q < n; q++) {
    var ia = q < inA, row = q % NS, col = Math.floor(q / NS), px, py;
    if (ia) { px = ax + 20 + col * 26 + 3 * Math.sin(t * 3 + q); py = Y + 18 + (row + .5) * (H - 36) / NS; }
    else { var cq = q - inA; px = X + 50 + (cq % 5) * 30 + 2 * Math.sin(t * 2 + q); py = Y + 40 + Math.floor(cq / 5) * 32; if (py > Y + H - 20) py = Y + H - 20 - (cq % 3) * 10; }
    var dead = q >= n - trapped;
    if (dead) { px = ax + 4 + (q % 2) * 8; py = Y + 20 + (q % 13) * 25; }
    s += C(px, py, 7, dead ? "#8f8576" : ION, 1.4);
  }
  if (o.flow) for (var m = 0; m < 4; m++) { var p = ((t * .45 + m / 4) % 1), fy = Y + 70 + m * 70; s += C(lerp(X + 200, ax - 10, p), fy + 6 * Math.sin(p * 9), 7, ION, 1.4) + arrow(X + 205, fy - 22, ax - 18, fy - 22, ORANGE, 2.5, 1); }
  return s;
}
// voltage dial 3.0 … 4.2 V
function vdial(x, y, r, v, k) {
  var a0 = Math.PI * 1.15, a1 = Math.PI * 1.85, a = lerp(a0, a1, clamp((v - 3) / 1.2)), s = "";
  s += '<path d="M' + f(x + Math.cos(a0) * r) + ' ' + f(y + Math.sin(a0) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.cos(a1) * r) + ' ' + f(y + Math.sin(a1) * r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  var ar = lerp(a0, a1, .82); s += '<path d="M' + f(x + Math.cos(ar) * r) + ' ' + f(y + Math.sin(ar) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.cos(a1) * r) + ' ' + f(y + Math.sin(a1) * r) + '" fill="none" stroke="' + ORANGE + '" stroke-width="9"/>';
  s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(x, y, 7, INK, 0);
  s += N(v.toFixed(1) + " V", x, y + 42, 26, v > 4.1 ? ORANGE : INK);
  return G("", s, k);
}
// a suitcase, side view, lid bulging by b (0..1)
function suitcase(x, y, b) { var w = 130, h = 50, s = R(x, y - h, w, h, "#8a6a4a", 2.6, 10) + '<path d="M' + x + ' ' + (y - h) + ' Q' + (x + w / 2) + ' ' + f(y - h - 40 * b) + ' ' + (x + w) + ' ' + (y - h) + '" fill="#9b7a58" stroke="' + INK + '" stroke-width="2.6"/>' + R(x + 45, y - h - 12 - 14 * b, 40, 8, INK, 0, 4);
  s += '<path d="M' + (x + 6) + ' ' + (y - h + 4) + ' q8 -12 16 0 q8 -12 16 0" stroke="#c98a5a" stroke-width="4" fill="none"/>' + C(x + 18, y + 4, 5, INK, 0) + C(x + w - 18, y + 4, 5, INK, 0); return s; }

// ── bedroom, side view, eye level. Floor at y = 700. 1 m = 140 units.
var FL = 700, MM = 0.14;   // units per mm in the room
function bed(x) { var s = R(x, FL - 77, 280, 20, WOODN, 2.2) + R(x + 6, FL - 57, 10, 57, WOODN_D, 2) + R(x + 264, FL - 57, 10, 57, WOODN_D, 2) + R(x - 10, FL - 150, 20, 150, WOODN, 2.4, 4);
  return s + R(x, FL - 98, 280, 22, "#efe8d8", 2.2, 8); }
function nightstand(x) { return R(x, FL - 77, 66, 77, WOODN, 2.4) + R(x + 6, FL - 64, 54, 24, WOODN_D, 1.6) + C(x + 33, FL - 52, 3, INK, 0); }
// a person lying on the back, head to the left, hip at (hx, hy); s figure scale (H = 1.75 m = 245 units → s = .6125)
function sleeper(hx, hy, s, t) {
  var br = 1 + .02 * Math.sin(t * 1.4);
  return G("translate(" + f(hx) + " " + f(hy) + ") rotate(-90) scale(1 " + f(br) + ")", whole(fig({ x: 0, y: 0, s: s, lean: 0, hands: [rel(40, 30), rel(30, 26)], bend: [1, 1], legs: [[0, 0], [2, -2]], shirt: SHIRT_V })));
}
function blanket(x, y, w, t) { var d = "M" + x + " " + y + " Q" + (x + w * .3) + " " + f(y - 26 - 2 * Math.sin(t * 1.4)) + " " + (x + w * .55) + " " + f(y - 18) + " T" + (x + w) + " " + (y - 6) + " L" + (x + w) + " " + (y + 26) + " L" + x + " " + (y + 26) + " Z"; return P(d, BLANKET, 2.2) + '<path d="' + d + '" fill="url(#hatch)" opacity=".35"/>'; }
function pillowAt(x, y, w) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w / 2) + '" ry="' + f(w * .2) + '" fill="' + PILLOW + '" stroke="' + INK + '" stroke-width="2.2"/>'; }
function room(t, o) {
  o = o || {}; var s = R(-400, 0, 1440, FL, o.night ? "#cfcabd" : "#e8dfc9", 0) + floor(FL);
  s += R(170, 140, 150, 170, o.night ? "#3a4654" : "#cdd9df", 2.4) + '<path d="M245 140 V310 M170 225 H320" stroke="' + INK + '" stroke-width="2"/>';   // window
  if (o.night) s += C(285, 175, 14, "#f1e9c8", 1.4) + C(291, 171, 13, "#3a4654", 0);
  s += bed(220) + nightstand(90);
  s += socketSide(-8 + 0, FL - 200, 1) + R(-18, FL - 240, 10, 80, "#efe9dc", 2, 3);
  return s;
}

// heat chevrons rising from (x, y)
function heat(x, y, t, n, h, k) { var s = ""; for (var i = 0; i < (n || 3); i++) { var p = ((t * .6 + i / (n || 3)) % 1), yy = y - p * (h || 60), xx = x + (i - 1) * 16; s += '<path d="M' + f(xx - 8) + ' ' + f(yy + 6) + ' L' + f(xx) + ' ' + f(yy) + ' L' + f(xx + 8) + ' ' + f(yy + 6) + '" stroke="' + ORANGE + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f((1 - p) * (k == null ? 1 : k)) + '"/>'; } return s; }
function thermo(x, y, h, k, txt) { var s = R(x - 10, y - h, 20, h, "#f4ecdb", 2, 10) + C(x, y + 6, 17, ORANGE, 2) + R(x - 5, y - h * clamp(k) + 8, 10, h * clamp(k), ORANGE, 0, 5); for (var i = 1; i < 5; i++) s += '<path d="M' + (x + 10) + ' ' + f(y - h * i / 5) + ' h8" stroke="' + INK + '" stroke-width="1.6"/>'; return s + (txt ? N(txt, x + 54, y - h * clamp(k) + 14, 26, ORANGE) : ""); }
// flame
function flame(x, y, sc, t) { var w = 1 + .08 * Math.sin(t * 9), d = "M0 0 C-30 -10 -34 -50 -14 -80 C-10 -60 -2 -58 0 -66 C4 -90 18 -100 22 -120 C40 -80 44 -30 26 -6 C18 0 8 2 0 0 Z";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(sc * w) + " " + f(sc * (2 - w)) + ")", P(d, ORANGE, 2.4) + '<path d="M2 -6 C-12 -14 -12 -36 0 -50 C6 -36 16 -30 12 -10 Z" fill="#f4d06a" stroke="' + INK + '" stroke-width="1.6"/>'); }
// overnight charge graph: 23:00 → 07:00 on x, 0..100 % on y. upto: hours drawn (0..8). mode: "full" (rise then 100 with dips) | "smart" (to 80, hold, to 100 before 7)
function nightGraph(x, y, w, h, upto, mode, k) {
  var s = '<path d="M' + x + ' ' + (y - h) + ' V' + y + ' H' + (x + w) + '" stroke="' + INK + '" stroke-width="2.6" fill="none"/>';
  var hrs = ["11", "12", "1", "2", "3", "4", "5", "6", "7"];
  for (var i = 0; i < 9; i++) s += '<path d="M' + f(x + i * w / 8) + ' ' + y + ' v8" stroke="' + INK + '" stroke-width="2"/>' + N(hrs[i], x + i * w / 8, y + 30, 16, MUTE);
  [20, 80, 100].forEach(function (p) { s += '<path d="M' + x + ' ' + f(y - h * p / 100) + ' H' + (x + w) + '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>' + N(p + "%", x - 8, y - h * p / 100 + 6, 15, INK, "end"); });
  function pct(hh) { if (mode === "smart") { if (hh < 1.2) return 30 + 50 * hh / 1.2; if (hh < 6.6) return 80 - (hh - 1.2) * .6 + .6 * ((hh * 3) % 1); return Math.min(100, 80 + (hh - 6.6) * 30); }
    if (hh < 2) return 30 + 70 * hh / 2; var c = ((hh - 2) * 1.2) % 1; return 100 - 4 * c; }
  var d = ""; for (var hh = 0; hh <= Math.min(8, upto); hh += .05) d += (d ? " L" : "M") + f(x + hh * w / 8) + " " + f(y - h * pct(hh) / 100);
  if (d) s += '<path d="' + d + '" stroke="' + (mode === "smart" ? OLIVE : ORANGE) + '" stroke-width="4.5" fill="none" stroke-linejoin="round"/>';
  if (upto > 0) { var e = Math.min(8, upto); s += C(x + e * w / 8, y - h * pct(e) / 100, 7, mode === "smart" ? OLIVE : ORANGE, 2); }
  return G("", s, k);
}
// a battery bar (big, upright) with a % fill
function bigBatt(x, y, w, h, pct, col, k) { var s = R(x, y - h, w, h, PAPER, 3, 10) + R(x + w * .3, y - h - 14, w * .4, 14, INK, 0, 3) + R(x + 8, y - 8 - (h - 16) * pct / 100, w - 16, (h - 16) * pct / 100, col || OLIVE, 0, 5); return G("", s, k == null ? 1 : k); }
// phone in profile (side cut), length 147 mm along x from x0, s units/mm; swell 0..1 lifts the screen up to 4 mm
function phoneSide(x0, y, s, swell, t) {
  var L = 147 * s, sw = clamp(swell), bul = 4 * s * sw, g = "";
  g += R(x0, y, L, 8 * s, FRAME, 2.2, 3 * s);                                                    // frame + back
  var bx0 = x0 + 30 * s, bx1 = x0 + 122 * s;                                                     // battery under the middle
  g += P("M" + f(bx0) + " " + f(y + 6.6 * s) + " L" + f(bx0) + " " + f(y + 2.2 * s) + " Q" + f((bx0 + bx1) / 2) + " " + f(y + 2.2 * s - bul * 2) + " " + f(bx1) + " " + f(y + 2.2 * s) + " L" + f(bx1) + " " + f(y + 6.6 * s) + " Z", POUCH, 1.8);
  // the screen: hinged at the left end, its right end lifted by the bulge
  var lift = bul * 2.1, ang = Math.atan2(lift, L * .85) * 180 / Math.PI;
  g += G("rotate(" + f(-ang) + " " + f(x0 + 6 * s) + " " + f(y) + ")", R(x0 + 2 * s, y - 1.6 * s, L - 4 * s, 2.2 * s, GLASSD, 1.8, 1));
  if (sw > .2) for (var i = 0; i < 6; i++) { var p = ((t * .5 + i / 6) % 1); g += C(lerp(bx0 + 10 * s, bx1 - 10 * s, hash(i)), y + 3 * s - p * 3 * s * sw, 1.6 * s * (.6 + hash(i + 3)), "none", 1.4); }
  return g;
}

// a pouch cell with the phone glass on it: k 0 flat … 1 puffed like a pillow, the glass tilting off
function swollen(x, y, k, t) {
  var w = 170, h = 18 + 40 * k, b = 26 * k, g = "";
  g += R(-w / 2 - 14, 30, w + 28, 14, FRAME, 2, 4);
  g += P("M" + (-w / 2) + " 30 C" + (-w / 2) + " " + f(30 - h) + " " + (w / 2) + " " + f(30 - h) + " " + (w / 2) + " 30 Z", POUCH, 2.2);
  g += P("M" + (-w / 2 + 10) + " 26 Q0 " + f(26 - h * .7 - b * .2) + " " + (w / 2 - 10) + " 26", "none", 1.2);
  g += G("rotate(" + f(-16 * k) + " " + (-w / 2 - 14) + " 24)", R(-w / 2 - 14, f(24 - 6 - h * .62 * k), w + 28, 8, GLASSD, 2, 3));
  return G("translate(" + x + " " + y + ")", g);
}
// ── shots (line numbers from script.txt). Lines 0–3 are the hook card, 4 the bumper, 24 the summary card, 25 the ask box.
// 5 · the rule: a lithium cell hates two things: full to the top, and heat
shot(5, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + appear(at(u, 0, .5), phoneFront(320, 330, 2.4, { pct: 100, charging: 1 })), c = window.CHUNKS[5], D = LN[5].end - LN[5].start;
  s += label(372, 250, 520, 160, "ليثيوم", BLUE, at(u, .4, .5), 30);
  var a = D * (c[1] || .45), b = D * (c[2] || .75);
  s += G("", bigBatt(70, 680, 90, 170, 100, BLUE, 1) + T("مليانة", 115, 735, 26, ORANGE, 800), at(u, a, .35)) + G("", cross(115, 590, 1, at(u, a + .3, .35)), 1);
  s += G("", thermo(520, 660, 150, .85 + .05 * Math.sin(t * 3), "") + T("سخونية", 520, 735, 26, ORANGE, 800), at(u, b, .35)) + cross(520, 600, 1, at(u, b + .3, .35));
  return s;
});
// 6 · what happens inside while charging? fly into the phone: the pouch cell under the back
shot(6, push(320, 400, 1.0, 1.25), function (u, d, t) {
  var s = paper(), k = at(u, .2, .8), w = 71.5 * 3.4, h = 147 * 3.4;
  s += R(320 - w / 2, 400 - h / 2, w, h, FRAME, 2.6, 30) + R(320 - w / 2 + 6, 400 - h / 2 + 6, w - 12, h - 12, "#e9e3d4", 1.6, 26);
  s += R(320 - w / 2 + 20, 400 - h / 2 + 20, w - 40, 110, BOARD, 2, 8) + C(320 - w / 2 + 60, 400 - h / 2 + 60, 22, "#3a352e", 2) + R(320 - 30, 400 + h / 2 - 40, 60, 16, FRAME, 1.6, 4);
  s += appear(k, R(320 - 30 * 3.4, 400 - h / 2 + 150, 60 * 3.4, 92 * 3.4, POUCH, 2.4, 8) + T("بطارية", 320, 400 + 40, 30, INK, 800));
  return s + G("", T("؟", 520, 200, 120, ORANGE, 800), at(u, .2, .3)) + label(390, 360, 560, 300, "جوه", BLUE, at(u, 1, .4), 26);
}, { tr: "in" });
// 7 · charging pushes lithium ions across and packs them between the graphite sheets
shot(7, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, d - .4) * .7;
  return paper() + cellCut(k, { t: t, flow: 1 }) + label(150, 230, 150, 150, "أيونات الليثيوم", ORANGE, at(u, .3, .5), 24) + label(470, 300, 520, 150, "الجرافيت", OLIVE, at(u, 1.4, .5), 24) +
    T("+", 81, 620, 30, INK, 800) + T("−", 559, 620, 30, INK, 800);
}, { tr: "in" });
// 8 · near 100 % the packing gets hard and the voltage climbs to its top
shot(8, push(320, 360, 1.0, 1.04), function (u, d, t) {
  var k = .7 + .3 * at(u, .2, d - .6), jit = k > .95 ? 2 * Math.sin(t * 30) : 0;
  return paper() + G("translate(" + f(jit) + " 0)", cellCut(k, { t: t * 3 })) + G("", R(160, 40, 320, 150, PAPER, 2, 10) + vdial(320, 150, 90, 3.7 + .5 * k, 1), 1) + numBox(Math.round(k * 100) + "%", 520, 630, 1, 30);
});
// 9 · like an overstuffed suitcase you sit on to close
shot(9, push(320, 470, 1.45, 1.55), function (u, d, t) {
  var b = .75 + .2 * Math.sin(t * 2.4), hy = 640 - 50 - 40 * b * .5 - 10, p = fig({ x: 340, y: hy, s: .7, lean: -4 + 4 * Math.sin(t * 2.4), legs: [[86, -84], [82, -80]], hands: [[300, hy + 6], [372, hy + 4]], bend: [1, -1], shirt: SHIRT_R });
  return paper() + floor(640) + suitcase(270, 640, b) + whole(p) + '<path d="M266 600 l-14 -12 M404 600 l14 -12 M262 620 h-18 M408 620 h18" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' +
    iconBox(215, 320, 120, G("translate(-83 -101) scale(.26)", cellCut(1, { t: t })), at(u, .3, .3));
}, { tr: "out" });
// 10 · doesn't the phone cut off by itself when it's done?
shot(10, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + phoneFront(260, 400, 2.6, { pct: 100, charging: 1 }) + cable("M260 591 C260 680 420 700 480 760", "#f2efe8") + plugC(260, 591, 2.6) + G("", T("؟", 470, 330, 130, ORANGE, 800), at(u, .2, .3));
});
// 11 · yes it stops, but stays full; when it dips a little it tops up again, seven, eight hours a night
shot(11, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var hrs = 8 * at(u, .3, d - .8);
  return paper() + nightGraph(100, 520, 470, 330, hrs, "full", 1) + label(280, 190, 330, 110, "مليان طول الليل", ORANGE, at(u, d * .35, .5), 26) + check(130, 120, .9, at(u, .1, .4)) + T("بيفصل", 200, 128, 24, INK, 800);
});
// 12 · the stress makes the electrolyte react; a crust grows on the graphite and eats lithium
shot(12, push(360, 390, 1.1, 1.22), function (u, d, t) {
  var k = at(u, .5, d - .8);
  return paper() + cellCut(.9, { t: t, sei: k, trapped: Math.round(10 * k) }) + label(390, 260, 470, 150, "طبقة", INK, at(u, .6, .5), 28) + label(395, 470, 300, 650, "ليثيوم محبوس", ORANGE, at(u, 1.6, .5), 26);
});
// 13 · and heat? charging warms the phone; under the pillow the heat has nowhere to go
shot(13, push(370, 520, 1.25, 1.32), function (u, d, t) {
  var s = paper() + room(t, { night: 1 }) + sleeper(360, FL - 120, .6125 * .9, t) + pillowAt(270, FL - 112, 90) + blanket(330, FL - 118, 180, t);
  var ph = '<rect x="252" y="' + (FL - 104) + '" width="34" height="5" fill="' + GLASSD + '" stroke="' + INK + '" stroke-width="1.2"/>';
  s += ph + cable("M252 " + (FL - 101) + " C200 " + (FL - 100) + " 120 " + (FL - 90) + " 10 " + (FL - 210), "#f2efe8") + heat(270, FL - 120, t, 3, 50, 1);
  var ins = pillowAt(0, -10, 200) + R(-60, 22, 120, 14, GLASSD, 2, 4) + heat(0, 10, t, 3, 40, 1) + '<path d="M-90 -40 q20 -20 40 0 M50 -40 q20 -20 40 0" stroke="' + ORANGE + '" stroke-width="3" fill="none"/>' + R(-140, 36, 280, 60, "#efe8d8", 2);
  return s + inset(470, 330, 120, ins, at(u, .4, .35)) + label(270, FL - 101, 470, 470, "تحت المخدة", ORANGE, at(u, .8, .5), 24);
}, { tr: "in" });
// 14 · heat speeds that reaction up many times
shot(14, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .2, d - .5);
  return paper() + thermo(130, 560, 360, .3 + .55 * k, Math.round(25 + 15 * k) + "°") + G("translate(260 0) scale(.62)", cellCut(.9, { t: t * (1 + 4 * k), sei: .3 + .6 * k, trapped: Math.round(4 + 10 * k) })) + heat(470, 220, t, 3, 60, k) + numBox("× " + (1 + Math.round(2 * k)), 470, 640, at(u, .5, .3), 34);
});
// 15 · a full battery kept a year: about 80 % left at room temperature, about 65 % at 40 °C
shot(15, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[15], D = LN[15].end - LN[15].start, a = at(u, .3, 1.6), b = at(u, D * (c[2] || .55), 1.6);
  return paper() + bigBatt(110, 600, 150, 340, 100 - 20 * a, OLIVE, 1) + N(count(100 - 20 * a < 80.5 ? 80 : 100 - 20 * a, 1) + "%", 185, 660, 40, INK) + T("25° · سنة", 185, 712, 22, INK, 800) +
    G("", bigBatt(380, 600, 150, 340, 100 - 35 * b, ORANGE, 1) + N(Math.round(100 - 35 * b) + "%", 455, 660, 40, ORANGE) + T("40° · سنة", 455, 712, 22, ORANGE, 800) + heat(455, 220, t, 3, 50, 1), at(u, D * (c[2] || .55) - .3, .3));
});
// 16 · why does it swell? gas from the reaction, no way out of the sealed pouch; the screen lifts
shot(16, push(320, 380, 1.0, 1.1), function (u, d, t) {
  var k = at(u, .3, d - .6);
  return paper() + phoneSide(60, 360, 3.55, k, t) + label(320, 386, 380, 520, "غازات", BLUE, at(u, .8, .5), 26) + label(540, 350 - 26 * k, 470, 220, "الشاشة بتترفع", ORANGE, at(u, d * .5, .5), 26) +
    inset(170, 590, 110, swollen(0, 10, .4 + .6 * k, t), at(u, d * .4, .35));
});
// 17 · fire: a fake charger without protection; the heat can run away
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[17], D = LN[17].end - LN[17].start, k2 = at(u, D * (c[1] || .45), .6);
  var s = paper() + chargerInside(110, 160, 1.9, 1, 1) + T("شاحن مضروب", 224, 140, 26, ORANGE, 800) + label(220, 260, 470, 220, "مفيش حماية", ORANGE, at(u, .5, .5), 22);
  s += G("", phoneFront(320, 560, 1.2, { pct: 100, charging: 1 }) + flame(320, 470, .9 + .2 * k2, t) + heat(320, 400, t, 3, 50, 1), k2);
  return s + G("", T("نادر… بس بيحصل", 320, 760, 26, INK, 800), at(u, D * .8, .3));
});
// 18 · the myth: «it overcharges» — no: a chip cuts the current at 100 %; it just sleeps full and warm
shot(18, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var c = window.CHUNKS[18], D = LN[18].end - LN[18].start, k = at(u, D * (c[1] || .45), .5), sw = k;
  var s = paper() + phoneFront(170, 330, 1.7, { pct: 100 }) + T("بيتشحن زيادة؟", 170, 120, 26, INK, 800) + cross(170, 330, 1.6, k);
  s += G("", R(330, 260, 260, 150, BOARD, 2, 8) + R(420, 300, 70, 70, INK, 0, 4) + T("شريحة الشحن", 460, 450, 22, OLIVE, 800) + '<path d="M300 335 H360" stroke="' + ORANGE + '" stroke-width="5"/>' +
    '<path d="M360 335 L' + f(360 + 40 * Math.cos(-sw * .7)) + ' ' + f(335 + 40 * Math.sin(-sw * .7)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + C(360, 335, 6, INK, 0) + C(402, 335, 6, INK, 0), at(u, D * (c[1] || .45), .3));
  return s + G("", T("مليان + سخن", 320, 640, 34, ORANGE, 800), at(u, D * .8, .3));
});
// 19 · what to do: smart charging in the battery settings: stop at 80, finish before you wake
shot(19, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var c = window.CHUNKS[19], D = LN[19].end - LN[19].start, on = at(u, D * (c[1] || .3), .4);
  var scr = T("البطارية", 0, -100, 18, INK, 800) + R(-62, -80, 124, 40, "#f4f1ea", 1.4, 8) + T("الشحن الذكي", 54, -54, 12, INK, 800, "start") + R(-56, -70, 34, 20, on > .5 ? OLIVE : GREY, 1.2, 10) + C(lerp(-46, -32, on), -60, 8, "#fff", 1.2) +
    R(-62, -32, 124, 40, "#f4f1ea", 1.4, 8) + T("حد الشحن", 54, -6, 12, INK, 800, "start") + N("80%", -36, -5, 15, ORANGE) + battIcon(0, 50, 1.6, 80, 0) + N("80%", 0, 90, 22, OLIVE);
  return paper() + phoneFront(170, 400, 2.0, { screen: scr }) + nightGraph(320, 560, 280, 280, 8 * at(u, D * .5, D * .5), "smart", at(u, D * .45, .3));
});
// 20 · the 20–80 rule
shot(20, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var p = 50 + 28 * Math.sin(t * 1.2), x = 120, w = 400, y = 380;
  var s = paper() + R(x, y, w, 70, PAPER, 3, 12) + R(x + w * .2, y, w * .6, 70, OLIVE, 0) + '<rect x="' + x + '" y="' + y + '" width="' + (w * .2) + '" height="70" fill="' + ORANGE + '" opacity=".5"/><rect x="' + (x + w * .8) + '" y="' + y + '" width="' + (w * .2) + '" height="70" fill="' + ORANGE + '" opacity=".5"/>' + R(x, y, w, 70, "none", 3, 12) + R(x + w, y + 22, 14, 26, INK, 0, 3);
  s += N("20%", x + w * .2, y + 116, 30, INK) + N("80%", x + w * .8, y + 116, 30, INK) + '<path d="M' + (x + w * .2) + ' ' + (y - 14) + ' V' + (y + 84) + ' M' + (x + w * .8) + ' ' + (y - 14) + ' V' + (y + 84) + '" stroke="' + INK + '" stroke-width="3"/>';
  s += '<path d="M' + f(x + w * p / 100) + ' ' + (y - 34) + ' l-12 -20 h24 Z" fill="' + INK + '"/>' + check(320, 260, 1.2, at(u, .5, .4)) + G("", cross(x + w * .1, y + 200, .7, 1) + cross(x + w * .9, y + 200, .7, 1), at(u, 1.5, .3));
  return s;
});
// 21 · on something dry and open, with an original charger
shot(21, push(90, 590, 2.5, 2.65), function (u, d, t) {
  var s = paper() + room(t, {}) + R(132, FL - 82, 34, 5, GLASSD, 1.4) + cable("M166 " + (FL - 80) + " C190 " + (FL - 80) + " 60 " + (FL - 100) + " 2 " + (FL - 200), "#f2efe8") + charger(2, FL - 200, .9, {});
  return s + heat(150, FL - 90, t, 3, 30, .35) + check(110, FL - 140, .5, at(u, .4, .4)) + label(14, FL - 205, 70, FL - 235, "شاحن أصلي", OLIVE, at(u, 1.2, .5), 12) + label(150, FL - 80, 95, FL - 180, "مكشوف", BLUE, at(u, .6, .5), 12);
}, { tr: "in" });
// 22 · bottom line: every night on the charger takes a bite of the battery's life
shot(22, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var n = Math.min(6, Math.floor(at(u, .2, d - .5) * 7)), s = paper();
  for (var i = 0; i < 6; i++) { var x = 70 + i * 86, op = i < n ? 1 : .25; s += G("", bigBatt(x, 520, 64, 200, 100 - i * 6, i > 3 ? ORANGE : OLIVE, 1) + C(x + 32, 580, 14, "#3a4654", 1.4) + C(x + 37, 576, 13, PAPER, 0), op); }
  return s + arrow(80, 650, 560, 650, INK, 3, at(u, .3, d - .6)) + T("كل ليلة", 320, 700, 26, INK, 800);
}, { tr: "out" });
// 23 · the odd fact: the same battery kept a year at 40 % loses only about 4 %
shot(23, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var a = at(u, .4, 1.6);
  return paper() + bigBatt(110, 600, 150, 340, 100 - 20 * a, ORANGE, .45) + N(Math.round(100 - 20 * a) + "%", 185, 660, 40, MUTE) + T("مليانة", 185, 712, 22, MUTE, 800) +
    bigBatt(380, 600, 150, 340, 100 - 4 * a, OLIVE, 1) + N(Math.round(100 - 4 * a) + "%", 455, 660, 40, OLIVE) + T("على 40%", 455, 712, 22, OLIVE, 800) + numBox("−4%", 455, 180, at(u, 1.8, .3), 34);
});

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  // 0: the bedroom at night, the phone charging on the nightstand; 1: it ages; 2: it swells; 3: it heats up
  var s = G("translate(30 -275) scale(1.25)", room(t, { night: 1 }) + sleeper(360, FL - 120, .6125 * .9, t) + pillowAt(270, FL - 112, 90) + blanket(330, FL - 118, 180, t) +
    R(108, FL - 82, 34, 5, GLASSD, 1.4) + cable("M142 " + (FL - 80) + " C170 " + (FL - 80) + " 60 " + (FL - 100) + " 2 " + (FL - 200), "#f2efe8") + charger(2, FL - 200, .9, {}));
  var v = li >= 1 ? t - LN[li].start : t - LN[0].start;
  if (li === 0) s += inset(150, 175, 115, phoneFront(0, 0, 1.2, { pct: 100, charging: 1, dark: 1, time: "2:14" }), ease(v / .5));
  if (li === 1) s += inset(150, 175, 115, bigBatt(-40, 80, 80, 160, 100 - 30 * ease(v / 2), OLIVE, 1), ease(v / .4)) + T("بتعجّز", 150, 330, 30, ORANGE, 800);
  if (li === 2) s += inset(150, 175, 115, swollen(0, 0, ease(v / 1.2), t), ease(v / .4)) + T("بتنفخ", 150, 330, 30, ORANGE, 800);
  if (li === 3) s += inset(150, 175, 115, phoneFront(0, 40, .9, { pct: 100, dark: 1 }) + flame(0, -20, .7 + .1 * Math.sin(t * 4), t), ease(v / .4)) + T("بتولّع", 150, 330, 30, ORANGE, 800);
  return s;
};
SCENE.bumper = function (u, t) { return G("translate(90 108)", phoneFront(0, 0, .62, { pct: 100, charging: 1 }) + cable("M0 46 C0 70 30 80 40 96", "#f2efe8")); };
SCENE.outro = function (svg, u, t) {
  return G("translate(300 140)", phoneFront(-170, 0, .95, { pct: 80 }) + bigBatt(-30, 80, 70, 150, 80, OLIVE, 1) + thermo(110, 70, 120, .3, "") + charger(170, -20, 1.4, {})) +
    callout("1", 130, 40, ease(u / .3)) + callout("2", 270, 40, ease(u / .3 - .5)) + callout("3", 410, 40, ease(u / .3 - 1)) + callout("4", 520, 40, ease(u / .3 - 1.5));
};
