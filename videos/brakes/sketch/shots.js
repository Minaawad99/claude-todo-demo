// ── «الفرامل بتوقف العربية إزاي؟» — «اسكتش» style. One chain, drawn part by part: pedal lever → servo → master cylinder →
// pipes → caliper piston → pads on the disc → heat; then tyre grip and ABS. Shapes follow a real single-piston floating
// caliper on a vented disc with a 4-stud hat (photos in refs/SOURCES.md). Brake fluid is drawn slate blue.
var METAL = "#bdbab2", METAL_D = "#8f8c84", STEEL = "#d9d6cd", RUBBER = "#3b3733", FLUID = "#9db9c9", PADC = "#6a5546", HAT = "#c9b9a0",
    ASPH = "#77726a", SKYC = "#dfe6df", BODYC = "#b9c2a0", GLASS = "#d5e2e2", HOT = "#d9622b", EMPTY = "#e9e1cc";
function rad(a) { return a * Math.PI / 180; }
function L1(x1, y1, x2, y2, col, w, ex) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" fill="none"' + (ex || "") + '/>'; }
function EL(x, y, rx, ry, fill, sw) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function ring(x, y, r, col, w, op) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"' + (op != null ? ' opacity="' + f(op) + '"' : "") + '/>'; }
function zig(x1, x2, y, amp, n) { var d = "M" + f(x1) + " " + f(y); for (var i = 1; i <= n * 2; i++) d += " L" + f(x1 + (x2 - x1) * i / (n * 2)) + " " + f(y + (i % 2 ? -amp : amp) * (i < n * 2 ? 1 : 0)); return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'; }
function sector(x, y, r1, r2, a1, a2) { var c1 = Math.cos(rad(a1)), s1 = Math.sin(rad(a1)), c2 = Math.cos(rad(a2)), s2 = Math.sin(rad(a2)), lg = a2 - a1 > 180 ? 1 : 0; return "M" + f(x + r2 * c1) + " " + f(y + r2 * s1) + " A" + r2 + " " + r2 + " 0 " + lg + " 1 " + f(x + r2 * c2) + " " + f(y + r2 * s2) + " L" + f(x + r1 * c2) + " " + f(y + r1 * s2) + " A" + r1 + " " + r1 + " 0 " + lg + " 0 " + f(x + r1 * c1) + " " + f(y + r1 * s1) + " Z"; }
// heat squiggles rising from (x,y) over width w
function heatUp(x, y, w, n, t, col, k) { var s = ""; k = k == null ? 1 : k; if (k <= 0) return ""; for (var i = 0; i < n; i++) { var ph = (t * .7 + hash(i + 3)) % 1, px = x + w * (i + .5) / n, py = y - ph * 60; s += '<path d="M' + f(px) + ' ' + f(py) + ' q7 -9 0 -18 q-7 -9 0 -18" fill="none" stroke="' + (col || HOT) + '" stroke-width="3" stroke-linecap="round" opacity="' + f(k * Math.sin(ph * Math.PI)) + '"/>'; } return s; }

// ── street: skyline, road
function city(off, y0) { var s = ""; for (var k = 0; k < 9; k++) { var bw = 74 + hash(k) * 50, x = ((k * 112 - off) % 1008 + 1008) % 1008 - 160, h = 130 + hash(k + 3) * 170; s += R(x, y0 - h, bw, h, k % 2 ? TAN : BEIGE, 1.4); for (var r = 0; r < Math.floor((h - 20) / 34); r++) for (var c = 0; c < Math.floor((bw - 12) / 24); c++) s += R(x + 9 + c * 24, y0 - h + 12 + r * 34, 12, 18, EMPTY, 1); } return s; }
function road(off, y0, h) { var s = R(-80, y0, 800, h || 400, ASPH, 2) + R(-80, y0, 800, 10, "#a39d92", 1.2); for (var k = 0; k < 7; k++) s += R(((k * 130 - off) % 910 + 910) % 910 - 110, y0 + (h || 400) * .55, 64, 8, EMPTY, 0); return s; }

// ── a wheel from the side: tyre with tread ticks, rim, five spokes; o.disc shows the disc and the caliper behind the spokes
function wheel(x, y, r, a, o) {
  o = o || {}; var s = C(x, y, r, RUBBER, 2), i, an;
  for (i = 0; i < 14; i++) { an = rad(a + i * 360 / 14); s += L1(x + Math.cos(an) * r * .86, y + Math.sin(an) * r * .86, x + Math.cos(an) * r * .97, y + Math.sin(an) * r * .97, "#6a645c", Math.max(1, r * .04)); }
  s += C(x, y, r * .68, STEEL, 1.6);
  if (o.disc) s += C(x, y, r * .58, o.heat ? HOT : METAL, 1.2) + ring(x, y, r * .44, "#8a877f", 1) + P(sector(x, y, r * .34, r * .64, 195, 250), o.cal || METAL_D, 1.4);
  for (i = 0; i < 5; i++) { an = rad(a + i * 72); s += L1(x, y, x + Math.cos(an) * r * .64, y + Math.sin(an) * r * .64, INK, r * .15) + L1(x, y, x + Math.cos(an) * r * .63, y + Math.sin(an) * r * .63, STEEL, r * .15 - 3); }
  return s + C(x, y, r * .16, METAL_D, 1.6);
}
// ── a small saloon from the side, facing right; origin on the ground under its middle. a = wheel angle (deg)
function car(x, y, s, a, o) {
  o = o || {}; var b = P("M-216 -22 L-220 -58 C-220 -72 -200 -80 -180 -82 L-128 -86 C-112 -112 -96 -128 -70 -130 L28 -130 C48 -130 70 -108 92 -86 L176 -76 C204 -72 216 -62 218 -46 L218 -22 L172 -22 A42 42 0 0 0 88 -22 L-88 -22 A42 42 0 0 0 -172 -22 Z", o.col || BODYC, 2.2);
  b += P("M-116 -88 C-104 -108 -92 -120 -70 -122 L-12 -122 L-12 -88 Z", GLASS, 1.6) + P("M-2 -122 L26 -122 C42 -122 58 -106 76 -88 L-2 -88 Z", GLASS, 1.6);
  b += L1(-8, -86, -8, -28, INK, 1.4) + L1(-124, -84, -124, -40, INK, 1.2) + L1(84, -84, 86, -40, INK, 1.2) + R(-40, -76, 18, 5, INK, 0, 2) + R(40, -76, 18, 5, INK, 0, 2);
  b += P("M200 -66 L216 -58 L214 -50 L198 -54 Z", "#f1e3b0", 1.2) + R(-220, -66, 8, 16, ORANGE, 1.2) + L1(-216, -34, 218, -34, INK, 1) + L1(76, -90, 90, -96, INK, 3);
  if (o.xray) b = G("", b, .4);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")" + (o.rot ? " rotate(" + f(o.rot) + " -130 0)" : ""), b + wheel(-130, -34, 34, o.lock ? 20 : a, o) + wheel(130, -34, 34, o.lock ? 50 : a, o));
}
// ── the car from above, nose up: body, glass, four wheels (front ones steer); pipes run from the master cylinder to each wheel
function carTop(x, y, s, t, o) {
  o = o || {}; var b = "", w = [[-84, -112, 1], [84, -112, 1], [-84, 112, 0], [84, 112, 0]], i;
  for (i = 0; i < 4; i++) b += G("translate(" + w[i][0] + " " + w[i][1] + ") rotate(" + (w[i][2] ? (o.steer || 0) : 0) + ")", R(-12, -30, 24, 60, RUBBER, 1.6, 5));
  var body = P("M-70 -150 C-70 -176 -40 -184 0 -184 C40 -184 70 -176 70 -150 L74 120 C74 160 50 172 0 172 C-50 172 -74 160 -74 120 Z", BODYC, 2.2) +
    P("M-54 -76 C-30 -90 30 -90 54 -76 L48 -40 L-48 -40 Z", GLASS, 1.4) + P("M-48 70 L48 70 L52 104 C30 114 -30 114 -52 104 Z", GLASS, 1.4) + R(-50, -36, 100, 102, o.pipes ? "none" : "#aab391", 1.2, 6) + L1(-58, -150, -30, -166, INK, 1.2) + L1(58, -150, 30, -166, INK, 1.2);
  b += o.pipes ? G("", body, .3) : body;
  if (o.pipes) {
    var k = o.pipes, pp = ["M-30 -128 H-84 V-112", "M-22 -128 V-100 H84 V-112", "M-30 -120 V112 H-84", "M-22 -112 H30 V112 H84"];
    b += R(-44, -142, 34, 22, METAL_D, 1.4, 3);
    for (i = 0; i < 4; i++) b += draw(pp[i], k, INK, 6) + draw(pp[i], k, FLUID, 3.4) + (k >= 1 ? '<path d="' + pp[i] + '" fill="none" stroke="' + BLUE + '" stroke-width="3.4" stroke-dasharray="7 15" stroke-dashoffset="' + f(-t * 60) + '"/>' : "");
    for (i = 0; i < 4; i++) b += G("", R(w[i][0] + (w[i][0] < 0 ? 10 : -22), w[i][1] - 12, 12, 24, ORANGE, 1.4, 2), clamp(k * 2 - 1));
  }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}

// ── the pedal: a lever hung from a pivot. pk 0..1 = how far it is pressed. o.arrows, o.meas 0..1
function shoe() { return R(-262, 196, 118, 64, "#5d6b78", 2) + P("M-58 128 C-84 118 -106 150 -110 192 L-152 200 L-152 264 L-58 258 Z", "#e7e0d0", 2.2) + L1(-96, 168, -72, 178, INK, 1.6) + L1(-102, 186, -76, 196, INK, 1.6) + R(-60, 124, 11, 138, RUBBER, 1.6, 4); }
function pedalAsm(x, y, s, pk, o) {
  o = o || {}; var a = -9 * pk, ca = Math.cos(rad(a)), sa = Math.sin(rad(a)), rx = -8 * ca - 102 * sa, ry = -220 + (-8 * sa + 102 * ca);   // pushrod eye, 1/4 of the way down
  var b = R(196, -270, 18, 350, BEIGE, 2) + hatch("M196 -270 h18 v350 h-18 Z") + R(-70, -266, 140, 28, METAL, 2) + hatch("M-70 -266 h140 v28 h-140 Z") + P("M-16 -238 L16 -238 L10 -212 L-10 -212 Z", METAL_D, 2);
  b += R(rx, ry - 6, 250 - rx, 12, STEEL, 1.8, 3);
  b += G("rotate(" + f(a) + " 0 -220)", P("M-9 -224 L9 -224 L-18 150 L-40 150 Z", METAL, 2.2) + R(-48, 146, 16, 96, RUBBER, 2, 4) + L1(-49, 166, -49, 224, "#6a645c", 2) + (o.noShoe ? "" : shoe()));
  b += C(0, -220, 11, STEEL, 2.2) + C(0, -220, 3.5, INK, 0) + C(rx, ry, 7, STEEL, 2);
  if (o.meas) { var m = o.meas; b += draw("M34 -220 V" + f(ry), m, OLIVE, 3) + G("", N("1", 56, -158, 30, OLIVE), clamp(m * 2 - 1)) + draw("M96 -220 V196", m, ORANGE, 3) + G("", N("4", 122, 0, 34, ORANGE), clamp(m * 2 - 1)) + G("", L1(26, -220, 104, -220, INK, 1.2) + L1(88, 196, 104, 196, INK, 1.2), m); }
  if (o.arrows) b += arrow(-250, 300, -110, 300, ORANGE, 5, o.arrows) + arrow(112, ry + 34, 190, ry + 34, ORANGE, 11, o.arrows * 2 - 1);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── the servo (vacuum booster) cut open: a drum split by a diaphragm; engine suction on one side, air let in on the other
function servoCut(x, y, s, pk, t, o) {
  o = o || {}; var dx = -18 + 34 * pk, b = "", i;
  b += '<path d="M56 -138 V-236 H250" fill="none" stroke="' + INK + '" stroke-width="20"/><path d="M56 -138 V-236 H250" fill="none" stroke="#cdd8d6" stroke-width="15"/>';
  for (i = 0; i < 4; i++) { var q = (t * .9 + i / 4) % 1, px = q < .4 ? 56 : 56 + (q - .4) / .6 * 190, py = q < .4 ? -150 - q / .4 * 86 : -236; b += G("translate(" + f(px) + " " + f(py) + ") rotate(" + (q < .4 ? -90 : 0) + ")", '<path d="M-5 -5 L3 0 L-5 5" fill="none" stroke="' + BLUE + '" stroke-width="3" stroke-linecap="round"/>'); }
  b += EL(0, 0, 112, 152, "#d5dfe0", 2.6) + sweep(-114, -154, 114 + dx, 308, 1, "r", EL(0, 0, 112, 152, pk > .05 ? "#ecd3bd" : EMPTY, 2.6));
  b += R(-236, -7, 236 + dx - 8, 14, STEEL, 1.8, 3) + R(dx + 8, -7, 236 - dx, 14, STEEL, 1.8, 3) + zig(dx + 10, 106, 0, 30, 6);
  b += '<path d="M' + f(dx) + ' -148 C' + f(dx - 16) + ' -100 ' + f(dx + 16) + ' -70 ' + f(dx) + ' -46 L' + f(dx) + ' 46 C' + f(dx + 16) + ' 70 ' + f(dx - 16) + ' 100 ' + f(dx) + ' 148" fill="none" stroke="' + INK + '" stroke-width="4"/>' + R(dx - 9, -48, 18, 96, METAL_D, 2, 3);
  if (pk > .05) for (i = 0; i < 3; i++) b += arrow(-100 + 6 * Math.sin(t * 5 + i), -70 + i * 70, dx - 26, -70 + i * 70, ORANGE, 4, pk);
  b += ring(0, 0, 112, INK, 0, 1);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── the master cylinder cut open: a small piston in a bore full of fluid, the reservoir on top, the outlet to the pipes
function masterCut(x, y, s, pk, t, o) {
  var px = -128 + 46 * pk, b = R(-70, -122, 124, 74, "#efe9d8", 2, 6) + R(-66, -96, 116, 44, FLUID, 0) + L1(-66, -96, 50, -96, BLUE, 1.6) + R(-30, -138, 44, 18, RUBBER, 1.6, 3) + R(-22, -50, 16, 20, FLUID, 1.4);
  b += R(-150, -36, 300, 72, METAL, 2.2, 7) + R(-140, -19, 282, 38, FLUID, 1.6) + (pk > 0 ? '<rect x="' + f(px + 30) + '" y="-19" width="' + f(142 - px - 30) + '" height="38" fill="' + BLUE + '" opacity="' + f(.55 * pk) + '"/>' : "") + R(-140, -19, px + 140, 38, EMPTY, 1.6);
  b += zig(px + 32, 136, 0, 12, 7) + R(px, -19, 30, 38, METAL_D, 2) + L1(px + 8, -19, px + 8, 19, INK, 1.2) + L1(px + 22, -19, px + 22, 19, INK, 1.2) + R(-236, -6, px + 236, 12, STEEL, 1.8, 3);
  b += R(150, -9, 90, 18, FLUID, 1.8) + (pk > 0 ? '<rect x="150" y="-9" width="90" height="18" fill="' + BLUE + '" opacity="' + f(.55 * pk) + '"/>' : "");
  if (pk > .2) for (var i = 0; i < 3; i++) { var q = (t * 1.2 + i / 3) % 1; b += C(150 + q * 86, 0, 3.4, "#fff", 0); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── one fluid, two pistons: a narrow one pushed down a long way, a wide one coming up with a much bigger force
function gauge(x, y, r, k) { var a = rad(-210 + 180 * k); return C(x, y, r, "#f4ecdb", 2) + L1(x, y, x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, ORANGE, 3) + C(x, y, 3, INK, 0); }
function hydro(x, y, s, k, t) {
  var yl = -110 + 120 * k, yr = 30 - 42 * k, b = P("M-222 -170 H-138 V112 H48 V-170 H242 V172 H-222 Z", METAL, 2.4);
  b += P("M-210 " + f(yl) + " H-150 V124 H60 V" + f(yr) + " H230 V160 H-210 Z", FLUID, 1.4) + '<path d="M-210 ' + f(yl) + ' H-150 V124 H60 V' + f(yr) + ' H230 V160 H-210 Z" fill="' + BLUE + '" opacity="' + f(.5 * k) + '"/>';
  b += R(-210, -170, 60, yl + 170, EMPTY, 1.4) + R(60, -170, 170, yr + 170, EMPTY, 1.4);
  b += R(-187, yl - 150, 14, 132, STEEL, 1.8) + R(-210, yl - 20, 60, 20, METAL_D, 2) + R(134, yr - 150, 22, 132, STEEL, 1.8) + R(60, yr - 20, 170, 20, METAL_D, 2);
  for (var i = 0; i < 5; i++) { var q = (t * .8 + i / 5) % 1; b += C(-150 + q * 210, 142, 3.4, "#fff", 0); }
  b += gauge(-180, 60, 22, .2 + .6 * k) + gauge(145, 100, 22, .2 + .6 * k);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── a trolley jack: low chassis on small wheels, a lifting arm with a saddle, a long handle pumped by one hand
function jack(x, y, s, k, t) {
  var th = rad(6 + 26 * k), sx = -70 + 124 * Math.cos(th), sy = -18 - 124 * Math.sin(th), ha = rad(-66 + 12 * Math.sin(t * 6)), hx = -112 - 175 * Math.cos(ha), hy = -24 + 175 * Math.sin(ha);
  var b = L1(-112, -24, hx, hy, INK, 9) + L1(-112, -24, hx, hy, METAL, 5.5) + L1(hx, hy, hx + (hx + 112) * .16, hy + (hy + 24) * .16, RUBBER, 11);
  b += P("M" + f(hx - 18) + " " + f(hy - 16) + " c14 -12 40 -8 44 10 c4 16 -12 28 -30 24 c-12 -2 -22 -18 -14 -34 Z", SKIN, 2) + P("M" + f(hx - 12) + " " + f(hy + 6) + " l-70 44 l22 36 l66 -52 Z", "#5d6b78", 2);
  b += L1(-70, -18, sx, sy, INK, 16) + L1(-70, -18, sx, sy, ORANGE, 11) + R(sx - 22, sy - 12, 44, 10, METAL_D, 1.8, 2) + R(-124, -20, 250, 16, ORANGE, 2, 4) + R(-126, -40, 30, 26, METAL_D, 1.8, 3) + C(-104, -4, 8, RUBBER, 1.6) + C(104, -4, 8, RUBBER, 1.6);
  return { svg: G("translate(" + f(x) + " " + f(y) + ") scale(" + (-s) + " " + s + ")", b), top: y + (sy - 12) * s, sx: x - sx * s };
}

// ── the caliper cut through, seen from above the disc's edge: vented disc (two plates and vanes), a pad each side, the piston
// in its bore on the right. k 0..1 = clamping; o.spin = how fast the vanes run (px/s); o.heat 0..1
function caliperCut(x, y, s, k, t, o) {
  o = o || {}; var g = 10 * (1 - k), bx = 10 * k, b = "", i, body = o.col || METAL;
  var vs = ""; for (i = 0; i < 12; i++) vs += R(-5, (((i * 40 + (o.dist || 0)) % 480) + 480) % 480 - 190, 10, 15, METAL_D, 1.2);
  b += sweep(-20, -150, 40, 420, 1, "d", R(-16, -150, 32, 440, "#7d7a72", 0) + vs + R(-16, -150, 11, 440, o.heat ? HOT : METAL, 1.8) + R(5, -150, 11, 440, o.heat ? HOT : METAL, 1.8)) + L1(-16, -150, 16, -150, INK, 2);
  if (o.heat) b += G("", R(-16, -150, 11, 440, METAL, 1.8) + R(5, -150, 11, 440, METAL, 1.8), 1 - o.heat);
  b += G("translate(" + f(bx) + " 0)", P("M-94 -208 H240 V88 H60 V-166 H-56 V62 H-94 Z", body, 2.4) + hatch("M-94 -208 H240 V88 H60 V-166 H-56 V62 H-94 Z") + R(72, -92, 132, 152, FLUID, 1.6) + '<rect x="72" y="-92" width="132" height="152" fill="' + BLUE + '" opacity="' + f(.55 * k) + '"/>' + R(240, -24, 90, 18, FLUID, 1.8) + R(200, -22, 44, 14, FLUID, 0) + '<rect x="200" y="-24" width="130" height="18" fill="' + BLUE + '" opacity="' + f(.55 * k) + '"/>');
  b += R(-46 - g, -118, 8, 206, STEEL, 1.6) + R(-38 - g, -110, 22, 190, PADC, 1.8) + R(16 + g, -110, 22, 190, PADC, 1.8) + R(38 + g, -118, 8, 206, STEEL, 1.6);
  b += R(46 + g, -86, 88, 140, STEEL, 2, 5) + R(58 + g, -74, 64, 116, EMPTY, 1.2, 4) + R(118 + g, -92, 10, 8, RUBBER, 0) + R(118 + g, 52, 10, 8, RUBBER, 0);
  if (k > .3) for (i = 0; i < 3; i++) b += arrow(196 + bx - 4 * Math.sin(t * 6), -60 + i * 45, 146 + g, -60 + i * 45, "#fff", 4, k);
  if (o.heat) for (i = 0; i < 2; i++) b += '<rect x="' + (i ? 12 : -20) + '" y="-110" width="8" height="190" fill="' + HOT + '" opacity="' + f(.5 * o.heat * (.7 + .3 * Math.sin(t * 9 + i))) + '"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", b);
}
// ── the disc face-on (as on the car with the wheel off): friction ring, hat with four studs, the caliper fixed at 9 o'clock
function discFace(x, y, r, a, o) {
  o = o || {}; var s = C(x, y, r, METAL, 2.6), i, an;
  if (o.heat) s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r - 2) + '" fill="' + HOT + '" opacity="' + f(.85 * o.heat) + '"/>';
  s += ring(x, y, r * .9, "#8a877f", 1, .7) + ring(x, y, r * .76, "#8a877f", 1, .7) + ring(x, y, r * .62, "#8a877f", 1, .7);
  for (i = 0; i < 6; i++) { an = rad(a + i * 60); s += L1(x + Math.cos(an) * r * .56, y + Math.sin(an) * r * .56, x + Math.cos(an + .5) * r * .95, y + Math.sin(an + .5) * r * .95, o.heat > .5 ? "#a8431c" : METAL_D, Math.max(2, r * .022)); }
  s += C(x, y, r * .47, HAT, 2.2) + ring(x, y, r * .4, INK, 1, .4);
  for (i = 0; i < 4; i++) { an = rad(a + i * 90); s += C(x + Math.cos(an) * r * .29, y + Math.sin(an) * r * .29, r * .055, STEEL, 1.6) + C(x + Math.cos(an) * r * .29, y + Math.sin(an) * r * .29, r * .022, INK, 0); }
  s += C(x, y, r * .15, METAL_D, 2) + C(x, y, r * .08, STEEL, 1.6);
  if (o.cal !== false) {
    var c = o.cal || METAL_D, sq = (o.clamp || 0) * r * .03;
    s += P(sector(x + sq, y, r * .5, r * 1.1, 148, 212), c, 2.6) + P(sector(x + sq, y, r * .64, r * .98, 160, 200), "none", 1.4) + C(x - r * .98 + sq, y - r * .44, r * .04, STEEL, 1.6) + C(x - r * .98 + sq, y + r * .44, r * .04, STEEL, 1.6);
    s += '<path d="M' + f(x - r * 1.08) + ' ' + f(y - r * .1) + ' C' + f(x - r * 1.5) + ' ' + f(y - r * .1) + ' ' + f(x - r * 1.3) + ' ' + f(y - r * .9) + ' ' + f(x - r * 1.7) + ' ' + f(y - r) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(r * .05) + '"/>';
  }
  return s;
}
// a brake pad on its own: steel backing plate with two ears, the friction block with its centre groove
function padShape(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", P("M-70 -30 H70 L84 -22 V-4 L70 4 V30 H-70 V4 L-84 -4 V-22 Z", STEEL, 2) + P("M-58 -24 C-20 -32 20 -32 58 -24 V22 H-58 Z", PADC, 2) + L1(0, -29, 0, 22, INK, 2)); }
// a bicycle rim brake from the front: tyre and rim, the horseshoe, a block each side
function bikeBrake(k) { return R(-11, -40, 22, 100, RUBBER, 1.6, 10) + R(-8, 14, 16, 30, STEEL, 1.4) + P("M-40 30 C-44 -30 -20 -56 0 -56 C20 -56 44 -30 40 30", "none", 4) + L1(0, -56, 0, -74, INK, 3) + R(-30 + 9 * k, 16, 12, 22, ORANGE, 1.4, 2) + R(18 - 9 * k, 16, 12, 22, ORANGE, 1.4, 2); }
function speedo(x, y, r, v, max) { var a = Math.PI * (1 - clamp(v / max)), s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i <= 10; i++) { var b = Math.PI * (1 - i / 10); s += L1(x + Math.cos(b) * r * .82, y - Math.sin(b) * r * .82, x + Math.cos(b) * r * .94, y - Math.sin(b) * r * .94, INK, i % 5 ? 1.4 : 3); } return s + L1(x, y, x + Math.cos(a) * r * .74, y - Math.sin(a) * r * .74, ORANGE, 5) + C(x, y, 8, INK, 0) + N(Math.round(v) + "", x, y + r * .5, r * .42, INK); }
// the ABS tone ring on the hub with its sensor, and the pulses it sends (wider as the wheel slows)
function toneRing(x, y, r, a) { var d = "", n = 28, i; for (i = 0; i < n; i++) { var a1 = rad(a + i * 360 / n), a2 = rad(a + (i + .5) * 360 / n), a3 = rad(a + (i + 1) * 360 / n); d += (i ? " L" : "M") + f(x + Math.cos(a1) * r) + " " + f(y + Math.sin(a1) * r) + " L" + f(x + Math.cos(a2) * r) + " " + f(y + Math.sin(a2) * r) + " L" + f(x + Math.cos(a2) * r * .88) + " " + f(y + Math.sin(a2) * r * .88) + " L" + f(x + Math.cos(a3) * r * .88) + " " + f(y + Math.sin(a3) * r * .88); } return P(d + " Z", OLIVE, 2) + C(x, y, r * .74, METAL, 2) + C(x, y, r * .3, METAL_D, 2); }
function pulses(x, y, w, ph, per, col) { var d = "M" + f(x) + " " + f(y), px; for (px = 0; px <= w; px += 2) { var hi = ((px + ph) % per + per) % per < per / 2; d += " L" + f(x + px) + " " + f(y - (hi ? 26 : 0)); } return '<path d="' + d + '" fill="none" stroke="' + (col || OLIVE) + '" stroke-width="3.4" stroke-linejoin="round"/>'; }

// ── the whole chain on one page (lines 11 and 23): pedal → servo → master → pipe (ABS unit on it) → caliper on the disc
function system(pk, t, hl) {
  function part(n, inner) { return hl && hl !== n ? dim(1, inner) : inner; }
  var s = part(1, pedalAsm(112, 262, .5, pk, {}) + servoCut(322, 203, .46, pk, t, {}));
  s += part(2, masterCut(506, 203, .4, pk, t) + '<path d="M600 203 H618 V556 H574" fill="none" stroke="' + INK + '" stroke-width="9"/><path d="M600 203 H618 V556 H574" fill="none" stroke="' + (pk > .3 ? BLUE : FLUID) + '" stroke-width="5"/>' + (pk > .3 ? '<path d="M600 203 H618 V556 H574" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="5 22" stroke-dashoffset="' + f(-t * 70) + '"/>' : ""));
  s += part(3, caliperCut(280, 572, .88, pk, t, { dist: t * 200 * (1 - pk), heat: pk > .6 ? (pk - .6) * 2 : 0 }));
  s += part(4, R(590, 344, 56, 64, "#f4ecdb", 2, 5) + N("ABS", 618, 384, 19, hl === 4 ? ORANGE : INK));
  return s;
}

// ── shots
// 4 · one small rule, remember it
shot(4, push(320, 400, 1.04, 1.0), function (u, d, t) { return paper() + R(96, 150, 448, 480, "#f4ecdb", 2.4, 8) + T("قاعدة", 320, 226, 36, OLIVE, 800) + hydro(320, 430, .72, .25 + .2 * Math.sin(t * 2), t) + G("", T("السايل", 320, 600, 26, BLUE, 700), at(u, .6, .4)); });
// 5 · a liquid can't be squeezed; push it at one end and the pressure reaches every part of it unchanged
shot(5, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var k = at(u, .4, .6), j = 3 * Math.sin(t * 7) * k, s = paper(), i, pts = [[330, 245, 0, -1], [470, 245, 0, -1], [330, 555, 0, 1], [470, 555, 0, 1], [565, 330, 1, 0], [565, 470, 1, 0], [250, 300, -1, 0], [250, 500, -1, 0]];
  s += P("M40 362 H244 V250 H560 V550 H244 V438 H40 Z", METAL, 2.6) + P("M" + f(100 + j) + " 374 H256 V262 H548 V538 H256 V426 H" + f(100 + j) + " Z", FLUID, 1.6) + R(52, 374, 48 + j, 52, EMPTY, 1.4);
  s += R(100 + j - 26, 374, 26, 52, METAL_D, 2) + R(-40, 392, 116 + j, 16, STEEL, 1.8) + arrow(-30 + 6 * Math.sin(t * 7), 340, 70, 340, ORANGE, 9, k);
  for (i = 0; i < 26; i++) s += C(280 + hash(i) * 250 + 3 * Math.sin(t * 2 + i), 280 + hash(i + 9) * 240 + 3 * Math.cos(t * 2.3 + i), 3, "#fff", 0);
  var k2 = at(u, d * .5, .6); for (i = 0; i < 8; i++) { var p = pts[i], pl = 44 + 6 * Math.sin(t * 5); s += arrow(p[0] - p[2] * pl, p[1] - p[3] * pl, p[0], p[1], BLUE, 6, k2); }
  return s + tag("ما بيتضغطش", 400, 180, at(u, 1.2, .4), 26) + G("", gauge(400, 400, 34, .75) , k2) + tag("نفس الضغط", 400, 640, at(u, d * .62, .4), 26);
});
// 6 · the pedal is a lever: about four times your foot's force
shot(6, push(300, 420, .98, 1.05), function (u, d, t) { var pk = .5 * at(u, .5, .8) + .5 * at(u, d * .5, .8) - .12 * at(u, d * .3, .5) + .04 * Math.sin(t * 3); return paper() + pedalAsm(300, 440, 1.2, pk, { meas: at(u, d * .42, .9), arrows: at(u, d * .55, 1) }) + label(300, 176, 430, 110, "محور", INK, at(u, d * .3, .5), 24) + label(250, 672, 400, 736, "البدال", OLIVE, at(u, d * .22, .5), 26) + numBox("×4", 470, 560, at(u, d * .72, .4), 44); }, { tr: "in" });
// 7 · behind it the servo: engine suction multiplies the force again
shot(7, push(320, 410, 1.0, 1.05), function (u, d, t) { var pk = at(u, .7, .9) - .5 * at(u, d * .45, .5) + .5 * at(u, d * .62, .6); return paper() + servoCut(310, 440, 1.35, pk, t, {}) + arrow(10, 394, 110, 394, ORANGE, 6, at(u, .5, .4)) + arrow(500, 388, 626, 388, ORANGE, 15, at(u, 1.3, .5)) + tag("السيرفو", 310, 716, at(u, .9, .4), 28) + G("", T("شفط المحرك", 500, 164, 24, BLUE, 700), at(u, d * .45, .4)); });
// 8 · that force pushes a small piston in a cylinder of fluid …
shot(8, push(320, 420, 1.0, 1.06), function (u, d, t) { var pk = at(u, d * .22, 1) - .4 * at(u, d * .4, .4) + .4 * at(u, d * .46, .5); return paper() + masterCut(290, 470, 1.55, pk, t) + arrow(-10, 420, 70, 420, ORANGE, 15, at(u, .4, .4)) + label(120 + 71 * pk, 470, 300, 650, "مكبس صغير", OLIVE, at(u, d * .25, .5), 26) + label(270, 340, 420, 220, "زيت فرامل", BLUE, at(u, d * .36, .5), 26); });
// … and the fluid runs in pipes to all four wheels (the car from above)
shot([8, 2], push(320, 410, 1.06, 1.0), function (u, d, t) { var s = paper(); for (var i = 0; i < 2; i++) s += L1(60 + i * 520, -40, 60 + i * 520, 840, MUTE, 2, ' stroke-dasharray="26 22" stroke-dashoffset="' + f(-t * 90) + '"'); return s + carTop(320, 410, 1.95, t, { pipes: at(u, .2, 1.3) }); }, { tr: "out" });
// 9 · at each wheel a much wider piston: the same pressure on a bigger area is a bigger force
shot(9, push(320, 410, 1.0, 1.04), function (u, d, t) { var k = .5 + .5 * Math.sin(u * 1.5 - 1.2), kk = at(u, .5, .6); return paper() + hydro(320, 420, 1.18, k * kk, t) + arrow(108, 100 + 140 * k * kk, 108, 190 + 140 * k * kk, ORANGE, 6, kk) + arrow(490, 250 - 50 * k * kk, 490, 110 - 50 * k * kk, ORANGE, 17, at(u, 1.2, .5)) + G("", T("مكبس أوسع", 490, 690, 26, OLIVE, 700), at(u, .8, .4)) + tag("نفس الضغط", 250, 690, at(u, d * .4, .4), 24); });
// 10 · like the jack that lifts the car with one hand
shot(10, push(330, 430, 1.0, 1.06), function (u, d, t) { var k = at(u, .4, d - .8), j = jack(370, 640, 1.0, k, t), a = -Math.atan2(Math.max(0, 606 - j.top), j.sx + 94) * 57.3; return paper() + R(-80, -40, 800, 700, SKYC, 0) + city(0, 640) + R(-80, 640, 800, 240, "#c9c09a", 2) + G("rotate(" + f(a) + " -94 640)", car(75, 640, 1.3, 0, {})) + j.svg; });
// 11 · a 20 kg push arrives at the wheel as more than a ton
shot(11, push(320, 400, .96, 1.0), function (u, d, t) { var pk = at(u, .5, .9); return paper() + system(pk, t) + numBox("20 كجم", 96, 448, at(u, .6, .4), 26) + numBox("+1 طن", 470, 740, at(u, d * .62, .4), 40, true) + arrow(470, 690, 410, 620, ORANGE, 12, at(u, d * .6, .4)); }, { tr: "out" });
// 12 · it shuts a caliper on an iron disc that turns with the wheel
shot(12, push(330, 400, 1.0, 1.06), function (u, d, t) { var k = at(u, d * .35, .6), a = 300 * (u - .28 * k * Math.max(0, u - d * .35)); return paper() + G("", C(340, 400, 330, RUBBER, 2) + C(340, 400, 262, EMPTY, 2), .28) + discFace(340, 400, 220, a, { cal: ORANGE, clamp: k }) + arrow(40, 400, 92, 400, INK, 6, k) + label(150, 330, 190, 140, "كماشة", ORANGE, at(u, d * .4, .5), 28) + label(470, 300, 520, 130, "طارة", OLIVE, at(u, d * .62, .5), 28); });
// 13 · inside it the pads rub the disc from both sides, like a bicycle's brake blocks on the rim
shot(13, push(300, 410, 1.0, 1.05), function (u, d, t) { var k = at(u, .7, .7), dist = 420 * (u - .42 * k * Math.max(0, u - .7)); return paper() + caliperCut(250, 440, 1.45, k, t, { dist: dist, heat: at(u, 1.6, 2) * .8 }) + heatUp(210, 210, 80, 3, t, HOT, at(u, 2, 1)) + label(200, 430, 90, 640, "تيل", OLIVE, at(u, 1, .5), 28) + label(290, 520, 330, 690, "تيل", OLIVE, at(u, 1.3, .5), 28) + label(390, 400, 470, 250, "مكبس", INK, at(u, 1.9, .5), 24) + iconBox(520, 130, 150, bikeBrake(.5 + .5 * Math.sin(t * 3)), at(u, d * .62, .4)); }, { tr: "in" });
// 14 · where did the car's speed go? it turned into heat
shot(14, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var D = d - .6, uu = Math.min(u, D), off = 520 * (uu - uu * uu / (2 * D)), v = 100 * (1 - uu / D), h = clamp(uu / D);
  return paper() + R(-80, -40, 800, 420, SKYC, 0) + city(off * .4, 372) + road(off, 372, 500) + car(300, 470, 1.25, off / 34 * 57.3 / 1.25, { disc: 1, heat: h > .5 }) + speedo(170, 660, 90, v, 120) + arrow(280, 630, 370, 630, "#fff", 6, at(u, d * .5, .4)) + discFace(490, 630, 78, off * 1.2, { heat: h, cal: false }) + heatUp(440, 552, 100, 4, t, HOT, h) + G("", T("سرعة", 170, 742, 24, "#fff", 700) + T("سخونة", 490, 742, 24, "#fff", 700), at(u, .5, .4));
});
// 15 · one stop from 100 km/h makes enough heat to boil a litre and a half of water
shot(15, push(320, 410, 1.04, 1.0), function (u, d, t) {
  var s = paper(), i, k = at(u, .5, 1.6);
  s += R(120, 596, 400, 16, HOT, 2) + R(120, 634, 400, 16, HOT, 2); for (i = 0; i < 12; i++) s += R(130 + i * 33, 612, 12, 22, "#a8431c", 1.2); s += R(250, 560, 140, 36, HAT, 2) + heatUp(150, 590, 340, 6, t, HOT, 1);
  s += P("M190 300 H450 V540 C450 552 440 558 430 558 H210 C200 558 190 552 190 540 Z", "#f1eee4", 2.6) + P("M194 380 H446 V540 C446 550 438 554 430 554 H210 C202 554 194 550 194 540 Z", FLUID, 0) + L1(194, 380, 446, 380, BLUE, 2) + P("M450 330 C520 330 520 440 450 440", "none", 9) + L1(180, 300, 460, 300, INK, 5);
  for (i = 0; i < 16; i++) { var q = (t * (.5 + hash(i)) + hash(i + 4)) % 1; s += G("", ring(210 + hash(i + 8) * 220, 548 - q * 160, 4 + hash(i) * 5, "#fff", 2), k * (1 - q)); }
  for (i = 0; i < 4; i++) { var qq = (t * .5 + i / 4) % 1; s += '<path d="M' + (250 + i * 46) + ' ' + f(290 - qq * 90) + ' q12 -14 0 -28 q-12 -14 0 -28" fill="none" stroke="' + MUTE + '" stroke-width="3.4" stroke-linecap="round" opacity="' + f(k * Math.sin(qq * Math.PI)) + '"/>'; }
  return s + numBox("1.5 لتر", 320, 470, at(u, d * .55, .4), 38) + numBox("100 كم/س", 320, 720, at(u, .5, .4), 30, true);
});
// 16 · so the disc is hollow inside and air runs through it and cools it
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var a = t * 40, s = paper() + discFace(320, 410, 230, a, { heat: 1 - .8 * at(u, .8, d - 1.2), cal: false }), i, a0 = a + 20;
  s += P(sector(320, 410, 112, 226, a0, a0 + 80), "#6f6c65", 2.2); for (i = 1; i < 10; i++) { var an = rad(a0 + i * 8); s += L1(320 + Math.cos(an) * 116, 410 + Math.sin(an) * 116, 320 + Math.cos(an + .16) * 222, 410 + Math.sin(an + .16) * 222, STEEL, 5); }
  for (i = 0; i < 12; i++) { var q = (t * .9 + hash(i)) % 1, b = rad(i * 30 + 8), r1 = 236 + q * 70; s += G("translate(" + f(320 + Math.cos(b) * r1) + " " + f(410 + Math.sin(b) * r1) + ") rotate(" + f(i * 30 + 8) + ")", '<path d="M-10 -7 L2 0 L-10 7" fill="none" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round"/>', Math.sin(q * Math.PI)); }
  return s + tag("مفرّغة من جوه", 190, 100, at(u, .6, .4), 26) + G("", T("هوا", 560, 110, 30, BLUE, 800), at(u, d * .5, .4));
});
// 17 · many people think the brakes stop the car. no.
shot(17, push(330, 420, 1.0, 1.05), function (u, d, t) { var off = t * 200; return paper() + R(-80, -40, 800, 500, SKYC, 0) + city(off * .3, 440) + road(off, 440, 420) + car(170, 690, 2.2, off / 34 * 57.3 / 2.2, { disc: 1, cal: ORANGE }) + arrow(300, 300, 420, 560, ORANGE, 9, at(u, .4, .5)) + tag("الفرامل؟", 250, 262, at(u, .5, .4), 30) + cross(456, 615, 2, at(u, d * .78, .4)); });
// 18 · the brakes only stop the wheels; what stops the car is the tyre's grip on the asphalt
shot(18, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var a = t * 30 * (1 - .6 * at(u, 0, d)), s = paper() + R(-80, -40, 800, 640, SKYC, 0) + R(-80, 580, 800, 300, ASPH, 2.4), i;
  for (i = 0; i < 40; i++) s += C(((hash(i) * 800 - t * 120 * (1 - .6 * at(u, 0, d))) % 800 + 800) % 800 - 80, 596 + hash(i + 5) * 180, 2 + hash(i + 2) * 3, "#5f5a53", 0);
  s += C(320, 130, 452, RUBBER, 2.6); for (i = 0; i < 44; i++) { var an = rad(a + i * 360 / 44); s += L1(320 + Math.cos(an) * 408, 130 + Math.sin(an) * 408, 320 + Math.cos(an + .02) * 450, 130 + Math.sin(an + .02) * 450, "#6a645c", 7); }
  s += C(320, 130, 330, STEEL, 2.4) + C(320, 130, 290, METAL, 2) + P(sector(320, 130, 180, 320, 100, 140), ORANGE, 2);
  var k = at(u, d * .4, .6); s += G("", '<ellipse cx="320" cy="582" rx="' + f(120 + 8 * Math.sin(t * 5)) + '" ry="9" fill="' + OLIVE + '" stroke="' + INK + '" stroke-width="2"/>', k) + arrow(470, 640, 250 + 10 * Math.sin(t * 5), 640, ORANGE, 14, k) + label(380, 584, 340, 720, "مسكة الكاوتش", EMPTY, at(u, d * .5, .5), 28);
  return s + label(190, 346, 290, 250, "الفرامل: بتوقف العجل", INK, at(u, .5, .5), 22);
});
// 19 · stamp hard and the wheels lock: the car slides and the steering does nothing
shot(19, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var s = paper() + R(90, -60, 460, 920, ASPH, 2.4), i, k = at(u, .4, .5);
  for (i = 0; i < 6; i++) s += R(314, ((i * 170 + t * 260) % 1020) - 120, 12, 80, EMPTY, 0);
  for (i = 0; i < 4; i++) s += G("", R(320 + [-119, 91, -119, 91][i], 430 + [-140, -140, 140, 140][i], 28, 620, "#4a4540", 0), k * .8);
  s += carTop(320, 430, 1.25, t, { steer: 28 * at(u, d * .45, .5) });
  s += arrow(320, 180, 320, 50 + 6 * Math.sin(t * 6), ORANGE, 14, k) + draw("M350 190 C360 110 430 70 520 70", at(u, d * .5, .6), EMPTY, 6, ' stroke-dasharray=".06 .04"') + cross(470, 84, 1.1, at(u, d * .72, .4));
  return s + tag("العجل قفل", 470, 700, at(u, .6, .4), 26);
});
// 20 · ABS: at every wheel a sensor counts its turns
shot(20, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var w = 1 - .5 * at(u, d * .5, d * .4), a = 140 * (u - .25 * at(u, d * .5, d * .4) * Math.max(0, u - d * .5)), s = paper();
  s += G("", discFace(280, 360, 250, a, { cal: false }), .35) + toneRing(280, 360, 150, a) + R(436, 340, 92, 40, RUBBER, 2, 6) + R(424, 350, 14, 20, STEEL, 1.6) + '<path d="M528 360 C600 360 590 520 560 560" fill="none" stroke="' + INK + '" stroke-width="6"/>';
  s += R(90, 580, 470, 130, "#f4ecdb", 2, 6) + sweep(100, 590, 450, 110, 1, "r", pulses(100, 680, 450, -a * 2.6, 46 / w, OLIVE));
  return s + label(482, 340, 450, 190, "حساس", OLIVE, at(u, d * .45, .5), 28) + label(200, 240, 215, 96, "ترس مسنن", INK, at(u, d * .6, .5), 24);
}, { tr: "in" });
// 21 · the moment a wheel is about to stop, the computer eases the fluid pressure on it; when it turns again it presses again
shot(21, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var ph = u / d * 2 * Math.PI * 1.5, sp = .55 + .45 * Math.cos(ph), pr = .5 + .5 * Math.cos(ph - 2.2), a = 200 * (.55 * u + .45 * d / (3 * Math.PI) * Math.sin(ph)), s = paper(), i, dw = "", dp = "";
  s += discFace(190, 250, 130, a, { cal: pr > .5 ? ORANGE : METAL_D, clamp: pr }) + '<path d="M22 236 C-10 236 0 110 120 96 H420" fill="none" stroke="' + INK + '" stroke-width="9"/><path d="M22 236 C-10 236 0 110 120 96 H420" fill="none" stroke="' + FLUID + '" stroke-width="5"/><path d="M22 236 C-10 236 0 110 120 96 H420" fill="none" stroke="' + BLUE + '" stroke-width="5" opacity="' + f(pr) + '"/>';
  s += '<path d="M500 96 H700" fill="none" stroke="' + INK + '" stroke-width="9"/><path d="M500 96 H700" fill="none" stroke="' + BLUE + '" stroke-width="5"/>' + R(410, 50, 100, 92, METAL, 2.4, 6) + G("translate(460 96) rotate(" + f(90 * (1 - pr)) + ")", R(-30, -6, 60, 12, pr > .5 ? BLUE : ORANGE, 1.6, 3)) + R(420, 170, 150, 96, "#3f4a44", 2.4, 6);
  for (i = 0; i < 5; i++) s += L1(436 + i * 30, 266, 436 + i * 30, 280, INK, 3) + L1(436 + i * 30, 156, 436 + i * 30, 170, INK, 3); s += T("كمبيوتر", 495, 228, 22, "#fff", 700) + L1(460, 142, 460, 156, INK, 3);
  s += R(60, 440, 520, 300, "#f4ecdb", 2, 6) + L1(90, 462, 90, 712, INK, 2) + L1(90, 712, 560, 712, INK, 2) + L1(90, 588, 560, 588, MUTE, 1, ' stroke-dasharray="5 5"');
  for (i = 0; i <= 100; i++) { var uu = u * i / 100, p2 = uu / d * 2 * Math.PI * 1.5, x = 96 + 456 * uu / d; dw += (i ? " L" : "M") + f(x) + " " + f(574 - 90 * (.55 + .45 * Math.cos(p2))); dp += (i ? " L" : "M") + f(x) + " " + f(704 - 90 * (.5 + .5 * Math.cos(p2 - 2.2))); }
  s += '<path d="' + dw + '" fill="none" stroke="' + OLIVE + '" stroke-width="4" stroke-linejoin="round"/><path d="' + dp + '" fill="none" stroke="' + BLUE + '" stroke-width="4" stroke-linejoin="round"/>' + T("لفّة العجلة", 548, 476, 20, OLIVE, 700, "start") + T("ضغط الزيت", 548, 612, 20, BLUE, 700, "start");
  return s;
});
// 22 · about 15 times a second, which is why the pedal shudders under your foot
shot(22, push(320, 410, 1.0, 1.05), function (u, d, t) {
  var pk = .8 + .1 * Math.sin(t * 2 * Math.PI * 15), s = paper() + pedalAsm(170, 470, 1.05, pk, {}), i, k = at(u, d * .55, .4);
  for (i = 0; i < 3; i++) s += G("", '<path d="M' + (175 + i * 22) + ' ' + (600 + i * 6) + ' q12 30 0 60" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>', k * (.5 + .5 * Math.sin(t * 20 + i)));
  s += bigNum(count(15, at(u, .3, 1.2)), "مرة في الثانية", 510, 230, at(u, .3, .4), ORANGE, 110) + R(414, 420, 200, 90, "#f4ecdb", 2, 6) + sweep(422, 428, 184, 74, 1, "r", pulses(422, 492, 184, t * 220, 30, BLUE));
  return s;
});
// 23 · recap: the pedal multiplies, the fluid carries, the caliper turns motion into heat, ABS keeps the wheels turning
shot(23, push(320, 400, .96, 1.0), function (u, d, t) { var n = u < d * .3 ? 1 : u < d * .5 ? 2 : u < d * .76 ? 3 : 4, pk = .6 + .4 * Math.sin(t * 2.2); return paper() + system(pk, t, n) + callout("1", 250, 320, at(u, .2, .4), 20) + callout("2", 500, 290, at(u, d * .3, .4), 20) + callout("3", 110, 600, at(u, d * .5, .4), 20) + callout("4", 560, 440, at(u, d * .76, .4), 20); });
// 24 · the odd fact: double the speed and the braking distance is four times as long
shot(24, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .5, 2.2), q = 1 - (1 - clamp((u - .5) / 2.2)) * (1 - clamp((u - .5) / 2.2)), s = paper(), i;
  s += R(-80, 250, 800, 60, ASPH, 2) + R(-80, 520, 800, 60, ASPH, 2) + R(70, 322, 110 * q, 16, OLIVE, 2) + R(70, 592, 440 * q, 16, ORANGE, 2);
  for (i = 1; i < 4; i++) s += G("", L1(70 + i * 110, 588, 70 + i * 110, 612, INK, 2.4), at(u, 3, .3));
  s += car(70 + 110 * q, 292, .38, 110 * q * 4.4, { disc: 1 }) + car(70 + 440 * q, 562, .38, 440 * q * 4.4, { disc: 1 }) + numBox("50", 110, 180, at(u, .2, .4), 34) + numBox("100", 110, 450, at(u, .2, .4), 34) + T("كم/س", 200, 190, 22, INK, 600) + T("كم/س", 216, 460, 22, INK, 600);
  return s + G("", N("×1", 125, 384, 34, OLIVE), at(u, 2.8, .3)) + bigNum("×4", "مسافة الفرملة", 320, 716, at(u, d * .6, .4), ORANGE, 84);
});

// ── opening card, bumper, summary art
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  var off = t * 240, s = R(-10, -10, 630, 480, SKYC, 0) + city(off * .35, 430) + road(off, 430, 240) + car(300, 560, 1.25, off / 34 * 57.3 / 1.25, { disc: 1, cal: li >= 2 ? ORANGE : null });
  if (li === 0) s += G("", numBox("1.5 طن", 300, 330, 1, 38), ease((t - LN[0].start) / .4));
  if (li >= 1) s += iconBox(470, 150, 190, pedalAsm(20, 6, .3, .5 + .5 * Math.sin(t * 4), {}), ease((t - LN[1].start) / .35));
  if (li >= 2) { var k = ease((t - LN[2].start) / .35); s += iconBox(150, 150, 190, padShape(0, 0, .9) + T("تيل", 0, 74, 26, OLIVE, 800), k) + G("", ring(462, 518, 56, ORANGE, 5) + L1(238, 232, 420, 480, ORANGE, 3, ' stroke-dasharray="8 7"'), k); }
  return s;
};
SCENE.bumper = function (u, t) { return discFace(96, 112, 52, t * 120, { cal: ORANGE }); };
SCENE.outro = function (svg, u, t) {
  return pedalAsm(86, 150, .36, .5 + .4 * Math.sin(t * 2), { noShoe: 1 }) + masterCut(240, 150, .34, .5 + .4 * Math.sin(t * 2), t) + caliperCut(400, 160, .4, .5 + .4 * Math.sin(t * 2), t, { dist: t * 120 }) + toneRing(530, 150, 44, t * 90) +
    callout("1", 86, 30, ease(u / .3)) + callout("2", 240, 30, ease(u / .3 - .5)) + callout("3", 400, 30, ease(u / .3 - 1)) + callout("4", 530, 30, ease(u / .3 - 1.5));
};
