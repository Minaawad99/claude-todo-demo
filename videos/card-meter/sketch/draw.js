/* «عداد الكارت» — the episode's own drawings (sketch style). Loaded before scenes.js; the functions run at draw time, so
   they use the shared sketch helpers (R, C, P, T, N, G, f, draw, arrow, INK, ORANGE…) and the person kit.
   Real shapes after the photos listed in ../refs/SOURCES.md: the Egyptian single-phase prepaid meter (cream case, LCD on top,
   a red imp/kWh LED and a warning LED, the card slot under them, the sealed terminal cover with four cables at the bottom),
   its inside (manganin shunt on the phase line, the metering chip, the microcontroller and memory, the card contacts, the
   latching relay), the ISO 7816 contact card, the latching relay itself (coil, armature, moving contact). Panel units 640×786. */
var CM = (function () {
var CASE = "#ece7da", CASED = "#d3ccba", CASEDD = "#bdb5a1", LCD = "#b7c29f", LCDD = "#2d3427", PCB = "#8d9b72", PCBD = "#6f7d57",
    COPPER = "#c47a43", COPPERL = "#dc9a62", GOLD = "#d4b15a", GOLDD = "#a98a3a", CARD = "#d7e3ea", CARDD = "#4a6f8a", RED = "#c8382a", REDOFF = "#7a4b43",
    AMBER = "#e3a52b", AMBEROFF = "#8b7449", WIREB = "#6b4a2e", WIREN = "#3f6f9a", BLACK = "#33302c", NIGHT = "#1d2027";
function now() { return window.__t || 0; }
function money(v) { return (Math.max(0, v)).toFixed(2); }
function lineP(pts, col, w, ex) { var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"); return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
// dots running along a polyline (current flowing). sp = px/s, gap = px between dots
function flow(pts, t, col, sp, gap, r) {
  var L = [0], s = "", i; for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  var tot = L[L.length - 1]; gap = gap || 26;
  for (var d = (t * (sp || 60)) % gap; d < tot; d += gap) { i = 1; while (i < L.length - 1 && L[i] < d) i++; var k = (d - L[i - 1]) / (L[i] - L[i - 1]); s += '<circle cx="' + f(lerp(pts[i - 1][0], pts[i][0], k)) + '" cy="' + f(lerp(pts[i - 1][1], pts[i][1], k)) + '" r="' + (r || 3.6) + '" fill="' + (col || ORANGE) + '"/>'; }
  return s;
}
// the LCD digits, in a seven-segment-ish serif
function lcd(x, y, w, h, txt, o) {
  o = o || {}; var s = R(x, y, w, h, o.dark ? "#59604c" : LCD, 2.2, 4);
  if (txt != null && !o.dark) s += '<text x="' + f(x + w - 14) + '" y="' + f(y + h * .72) + '" text-anchor="end" style="font:700 ' + f(h * .58) + 'px \'Courier New\',monospace;fill:' + (o.col || LCDD) + ';direction:ltr;letter-spacing:1px">' + txt + '</text>';
  if (o.unit && !o.dark) s += '<text x="' + f(x + 12) + '" y="' + f(y + h * .72) + '" text-anchor="start" style="font:800 ' + f(h * .26) + 'px \'Noto Sans Arabic\';fill:' + LCDD + '">' + o.unit + '</text>';
  return s;
}
function led(x, y, on, col, off, r) { r = r || 9; return (on > 0.05 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="' + col + '" opacity="' + f(.28 * on) + '"/>' : "") + C(x, y, r, on > .5 ? col : off, 2); }
// ── the prepaid meter, front. cx, cy = centre of the case; s = scale (case 300 × 440 at s = 1)
// o.bal (number on the LCD) | o.txt (raw LCD text) · o.pulse 0..1 (red imp LED) · o.warn 0..1 (warning LED) · o.card 0..1 (card going in) ·
// o.wires (cables out of the bottom) · o.dark (night, LCD backlight off) · o.coverOpen 0..1 (terminal cover swung away)
function meter(cx, cy, s, o) {
  o = o || {}; var g = "";
  g += '<path d="M150 -212 L172 -196 L172 228 L150 220 Z" fill="' + CASEDD + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';   // the right side, in depth
  g += R(-150, -220, 300, 440, CASE, 2.6, 18);
  g += R(-136, -206, 272, 300, "none", 1.4, 12);
  g += T("عداد كهربا مسبوق الدفع", 0, -184, 13, "#6d6a64", 800);
  var txt = o.txt != null ? o.txt : money(o.bal == null ? 125.4 : o.bal);
  g += lcd(-112, -170, 224, 74, txt, { dark: o.dark, col: o.lcdCol, unit: "ج" });
  g += T("imp/kWh", -60, -52, 11, "#6d6a64", 700) + T("تحذير", 60, -52, 12, "#6d6a64", 800);
  g += led(-60, -74, o.pulse || 0, RED, REDOFF) + led(60, -74, o.warn || 0, AMBER, AMBEROFF);
  // the card slot
  g += R(-78, 2, 156, 16, BLACK, 2, 3) + T("دخّل الكارت هنا", 0, -10, 12, "#6d6a64", 800) + lineP([[-6, 40], [0, 30], [6, 40]], "#8a8478", 2);
  // a button
  g += C(0, 62, 11, CASED, 2) + C(0, 62, 5, "none", 1.2);
  // the sealed terminal cover
  var oc = o.coverOpen || 0;
  var cov = R(-150, 100, 300, 120, CASED, 2.4, 14) + lineP([[-120, 120], [120, 120]], "#b5ad98", 1.4) + C(0, 160, 7, "#9a9384", 1.8) + lineP([[0, 167], [-10, 196], [-4, 206]], "#7c776c", 1.4) + C(-4, 210, 6, "#a7a7a7", 1.6);
  if (oc > 0) { g += R(-136, 104, 272, 110, "#2f2c28", 2) + [-96, -40, 40, 96].map(function (x) { return R(x - 14, 132, 28, 30, COPPER, 1.8, 3); }).join(""); g += G('translate(' + f(70 * oc) + ' ' + f(150 * oc) + ') rotate(' + f(14 * oc) + ' 0 160)', cov, 1 - .15 * oc); }
  else g += cov;
  if (o.wires !== false) {   // the four cables: phase in, neutral in, neutral out, phase out
    var cols = [WIREB, WIREN, WIREN, WIREB], xs = [-96, -40, 40, 96];
    xs.forEach(function (x, i) { g += '<path d="M' + x + ' 220 L' + x + ' ' + (o.wireLen || 330) + '" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/><path d="M' + x + ' 220 L' + x + ' ' + (o.wireLen || 330) + '" stroke="' + cols[i] + '" stroke-width="10" stroke-linecap="round"/>'; });
  }
  if (o.card) g += card(0, 10 + 70 - 62 * clamp(o.card), .78, { rot: 0, back: true, clip: true });   // the card hanging out of the slot
  if (o.dark) g += '<rect x="-150" y="-220" width="322" height="440" rx="18" fill="' + NIGHT + '" opacity=".35"/>';
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g);
}
// ── the card (credit-card size, 172 × 108 at s = 1), centred on cx, cy. o.rot (deg) · o.glow 0..1 (chip lit) · o.bal (a number on the chip label) · o.clip (only the part below the slot)
function card(cx, cy, s, o) {
  o = o || {}; var g = R(-86, -54, 172, 108, CARD, 2.4, 9) + '<rect x="-86" y="-30" width="172" height="20" fill="' + CARDD + '" opacity=".85"/>' +
    T("كارت الكهربا", 30, 34, 15, CARDD, 800) + P("M64 -46 L52 -24 L62 -24 L50 -2", "none", 2.4).replace('stroke="' + INK + '"', 'stroke="' + AMBER + '"');
  g += chipPad(-50, 18, .9, o.glow || 0);
  if (o.clip) { var id = "cc" + (++CLIPN); return '<clipPath id="' + id + '"><rect x="' + f(cx - 200) + '" y="' + f(18 - 1) + '" width="400" height="300"/></clipPath><g clip-path="url(#' + id + ')">' + G('translate(' + f(cx) + ' ' + f(cy + 30) + ') scale(' + f(s) + ') rotate(90)', g) + '</g>'; }
  return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s) + ')', g);
}
// the gold contact pad of a smart card (ISO 7816: eight contacts), centred
function chipPad(x, y, s, glow) {
  var g = (glow > 0 ? '<rect x="-34" y="-28" width="68" height="56" rx="10" fill="' + ORANGE + '" opacity="' + f(.35 * glow) + '"/>' : "") + R(-24, -19, 48, 38, GOLD, 1.8, 6);
  g += lineP([[-24, -6], [-8, -6], [-8, -19]], GOLDD, 1.4) + lineP([[-24, 6], [-8, 6], [-8, 19]], GOLDD, 1.4) + lineP([[24, -6], [8, -6], [8, -19]], GOLDD, 1.4) + lineP([[24, 6], [8, 6], [8, 19]], GOLDD, 1.4) + R(-8, -6, 16, 12, "none", 1.4, 2).replace('stroke="' + INK + '"', 'stroke="' + GOLDD + '"');
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', g);
}
// the chip opened up: a tiny memory grid holding the balance (for the «الموظف بيكتب على الشريحة» close-up)
function chipBig(cx, cy, s, txt, k) {
  var g = R(-150, -110, 300, 220, GOLD, 3, 26);
  [[-150, -36], [-150, 36], [150, -36], [150, 36]].forEach(function (p) { g += lineP([[p[0], p[1]], [p[0] * .35, p[1]], [p[0] * .35, p[1] > 0 ? 110 : -110]], GOLDD, 3); });
  g += R(-52, -36, 104, 72, "#2f2c28", 2.4, 6);
  for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) g += '<rect x="' + f(-44 + i * 23) + '" y="' + f(-28 + j * 20) + '" width="16" height="13" fill="' + (hash(i * 3 + j + 9) < (k || 0) ? ORANGE : "#57524a") + '"/>';
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g) + (txt ? T(txt, cx, cy + 170 * s, 34 * s, ORANGE, 800) : "");
}
// ── the meter opened (cover off): the board inside. o.flow 0..1 (current dots) · o.open 0..1 (relay contact open) · o.pulse (red LED) ·
// o.hi: which part is lit — "shunt" | "ic" | "mcu" | "mem" | "relay" | "contacts" · o.bal · o.sig 0..1 (a pulse running from the MCU to the relay coil)
var PH = [[-96, 330], [-96, 150], [-96, 120], [-40, 120], [16, 120], [40, 120], [40, 150], [96, 150], [96, 330]];   // phase in → shunt → relay → phase out
function inside(cx, cy, s, o) {
  o = o || {}; var t = now(), g = "", hi = o.hi || "";
  function lit(name, inner) { return hi && hi !== name ? '<g opacity=".55">' + inner + '</g>' : inner; }
  g += '<path d="M150 -212 L172 -196 L172 228 L150 220 Z" fill="' + CASEDD + '" stroke="' + INK + '" stroke-width="2.2"/>';
  g += R(-150, -220, 300, 440, "#3a3631", 2.6, 18);   // the empty case
  g += R(-136, -206, 272, 300, PCB, 2, 8);            // the board
  for (var i = 0; i < 7; i++) g += lineP([[-128, -150 + i * 34], [-80 + hash(i) * 40, -150 + i * 34], [-60 + hash(i) * 40, -134 + i * 34]], PCBD, 1.4);
  g += lcd(-112, -196, 224, 56, money(o.bal == null ? 125.4 : o.bal), { unit: "ج" });
  g += led(-112, -118, o.pulse || 0, RED, REDOFF, 7);
  // the metering chip (multiplies current × voltage)
  g += lit("ic", R(-110, -100, 56, 56, BLACK, 2, 3) + pins(-110, -100, 56) + T("قياس", -82, -66, 12, "#e8e2d2", 800));
  // the microcontroller (the meter's brain) and the memory beside it
  g += lit("mcu", R(-20, -110, 76, 76, BLACK, 2, 3) + pins(-20, -110, 76) + C(-8, -98, 3, "#57524a", 1) + T("المخ", 18, -66, 14, "#e8e2d2", 800));
  g += lit("mem", R(76, -100, 46, 32, BLACK, 2, 3) + pins(76, -100, 46, 1) + T("ذاكرة", 99, -79, 10, "#e8e2d2", 800));
  // the card contacts under the slot
  g += lit("contacts", R(-60, -20, 120, 30, "#2f2c28", 2, 4) + [-44, -24, -4, 16, 36].map(function (x) { return R(x, -14, 12, 18, GOLD, 1.2, 2); }).join(""));
  // traces from the chips
  g += lineP([[-54, -72], [-20, -72]], GOLDD, 2) + lineP([[56, -72], [76, -84]], GOLDD, 2) + lineP([[18, -34], [18, -20]], GOLDD, 2);
  g += lineP([[-96, 120], [-96, 70], [-82, 50], [-82, -44]], GOLDD, 1.8) + lineP([[16, 120], [16, 80], [-70, 60], [-70, -44]], GOLDD, 1.8);   // the shunt's sense wires
  var sig = o.sig || 0; g += lineP([[40, -34], [40, 20], [80, 40], [80, 78]], sig > 0 ? ORANGE : GOLDD, sig > 0 ? 3 : 1.8);
  if (sig > 0 && sig < 1) { var q = sig < .4 ? [40, lerp(-34, 20, sig / .4)] : sig < .7 ? [lerp(40, 80, (sig - .4) / .3), lerp(20, 40, (sig - .4) / .3)] : [80, lerp(40, 78, (sig - .7) / .3)]; g += C(q[0], q[1], 7, ORANGE, 1.6); }
  // the phase line through the shunt and the relay: a thick copper bar
  g += lineP(PH.slice(0, 5), INK, 16) + lineP(PH.slice(0, 5), COPPER, 11);
  g += lit("shunt", R(-62, 110, 56, 20, "#9aa0a3", 2, 2) + lineP([[-62, 120], [-6, 120]], "#c9ced0", 3));   // the manganin shunt
  g += lineP(PH.slice(6), INK, 16) + lineP(PH.slice(6), COPPER, 11);
  // the latching relay box with its contact arm
  var op = clamp(o.open || 0);
  g += lit("relay", R(20, 78, 92, 62, BLACK, 2.4, 6) + T("ريليه", 66, 100, 12, "#e8e2d2", 800) + C(40, 120, 6, COPPERL, 1.6) + lineP([[40, 120], [lerp(68, 60, op), lerp(122, 100, op)]], COPPERL, 6) + C(70, 124, 5, COPPERL, 1.6));
  if (o.flow && op < .5) g += G("", flow(PH, t, ORANGE, 70, 30, 3.8), o.flow);
  // neutral (blue) straight through
  g += lineP([[-40, 150], [-40, 330]], INK, 15) + lineP([[-40, 150], [-40, 330]], WIREN, 10) + lineP([[40, 150], [40, 330]], INK, 15) + lineP([[40, 150], [40, 330]], WIREN, 10);
  g += lineP([[-40, 150], [40, 150]], INK, 10) + lineP([[-40, 150], [40, 150]], WIREN, 5);
  g += lineP([[-96, 220], [-96, 330]], INK, 15) + lineP([[-96, 220], [-96, 330]], WIREB, 10) + lineP([[96, 220], [96, 330]], INK, 15) + lineP([[96, 220], [96, 330]], WIREB, 10);
  g += R(-136, 160, 272, 56, "#2f2c28", 2, 8) + [-96, -40, 40, 96].map(function (x) { return R(x - 14, 170, 28, 34, COPPER, 1.8, 3); }).join("");   // the terminal block
  g += C(110, -140, 14, "#9aa0a3", 2) + T("بطارية", 110, -116, 10, "#e8e2d2", 800);
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g);
}
function pins(x, y, w, n) { var s = ""; for (var i = 0; i < 5; i++) { var p = x + 6 + i * (w - 12) / 4; s += '<rect x="' + f(p - 2) + '" y="' + f(y - 6) + '" width="4" height="6" fill="#c9ced0"/><rect x="' + f(p - 2) + '" y="' + f(y + (n ? 32 : w)) + '" width="4" height="6" fill="#c9ced0"/>'; } return s; }
// ── the latching relay close-up (cut open). o.open 0..1 · o.coil 0..1 (coil energised: field lines) · o.flow (current through when closed) · o.rev (the reverse pulse colour, blue)
function relay(cx, cy, s, o) {
  o = o || {}; var t = now(), op = clamp(o.open || 0), g = "", col = o.rev ? BLUE : ORANGE;
  g += R(-230, -170, 460, 340, "#4a4540", 3, 16) + R(-214, -154, 428, 308, "#ded6c2", 2, 10);
  // the coil: a core wound with copper wire
  g += R(-170, -40, 40, 150, "#8a8f93", 2.4, 4);
  for (var i = 0; i < 12; i++) g += '<rect x="-186" y="' + f(-30 + i * 11.5) + '" width="72" height="10" rx="5" fill="' + (o.coil > .3 ? COPPERL : COPPER) + '" stroke="' + INK + '" stroke-width="1.4"/>';
  g += T("ملف", -150, 150, 22, INK, 800);
  if (o.coil > 0) for (var r = 0; r < 3; r++) { var a = (t * 1.4 + r / 3) % 1; g += '<ellipse cx="-150" cy="-50" rx="' + f(60 + 70 * a) + '" ry="' + f(30 + 30 * a) + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-dasharray="10 8" opacity="' + f(o.coil * (1 - a)) + '"/>'; }
  // the armature: a steel plate hinged at its right end, pulled down to the coil when energised
  var ang = lerp(0, -12, op), pv = [40, -90];
  g += G('rotate(' + f(ang) + ' ' + pv[0] + ' ' + pv[1] + ')', R(-190, -104, 236, 18, "#9aa0a3", 2.4, 4) + C(40, -95, 7, "#c9ced0", 2) +
    lineP([[30, -86], [110, -50], [150, -20]], INK, 9) + lineP([[30, -86], [110, -50], [150, -20]], COPPERL, 5) + C(150, -16, 10, "#e8d5a0", 2));   // the spring arm with the moving contact
  g += C(40, -95, 9, "#555", 2);
  // the fixed contact, and the cables in and out
  var fx = 152, fy = 4; g += C(fx, fy, 10, "#e8d5a0", 2) + lineP([[fx, fy + 10], [fx, 150], [230, 150]], INK, 16) + lineP([[fx, fy + 10], [fx, 150], [230, 150]], COPPER, 11);
  g += lineP([[40, -95], [40, -140], [230, -140]], INK, 16) + lineP([[40, -95], [40, -140], [230, -140]], COPPER, 11);
  if (o.flow && op < .4) g += flow([[230, -140], [40, -140], [40, -95], [110, -50], [150, -16], [fx, fy], [fx, 150], [230, 150]], t, ORANGE, 80, 30, 4.5);
  if (o.spark) g += G("", '<path d="M150 -2 l12 -6 -4 10 14 -4" stroke="' + AMBER + '" stroke-width="3" fill="none"/>', o.spark);
  return G('translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ')', g);
}
// ── a room at night or with the light on: wall, ceiling lamp, a window, the meter small on the wall. o.light 0..1 · o.meterBal
function room(o) {
  o = o || {}; var L = clamp(o.light == null ? 1 : o.light), g = "";
  g += R(-40, -40, 720, 860, "#e9dcc0", 0) + R(-40, 640, 720, 200, "#c8b28a", 2) + lineP([[-40, 640], [680, 640]], INK, 2.4);
  for (var i = 0; i < 9; i++) g += lineP([[-40 + i * 90, 640], [-80 + i * 90, 800]], "#b39d76", 1.4);
  // the window
  g += R(400, 150, 170, 200, L > .5 ? "#cfe0e8" : "#2c3446", 3) + lineP([[485, 150], [485, 350]], INK, 3) + lineP([[400, 250], [570, 250]], INK, 3) + R(390, 350, 190, 14, "#a98c62", 2);
  if (L <= .5) g += C(530, 190, 14, "#f1e6c4", 1.6);
  // the ceiling lamp
  g += lineP([[300, -40], [300, 80]], INK, 2.4) + R(282, 74, 36, 22, "#8a8478", 2, 3);
  g += (L > 0 ? '<circle cx="300" cy="124" r="' + f(70 + 10 * Math.sin(now() * 2)) + '" fill="#f6dc7a" opacity="' + f(.3 * L) + '"/>' : "") + '<path d="M284 96 Q268 120 280 140 Q290 154 300 154 Q310 154 320 140 Q332 120 316 96 Z" fill="' + (L > .5 ? "#f6e39a" : "#cfc8b8") + '" stroke="' + INK + '" stroke-width="2.2"/>';
  // the meter on the wall, by the door frame
  g += R(40, 120, 10, 520, "#a98c62", 2) + meter(120, 300, .32, { bal: o.meterBal == null ? 0 : o.meterBal, dark: L < .5, warn: o.warn || 0, wireLen: 300 });
  return g;
}
function nightOver(k) { return k > 0 ? '<rect x="-400" y="-400" width="1440" height="1600" fill="' + NIGHT + '" opacity="' + f(.62 * clamp(k)) + '"/>' : ""; }
// ── a house seen from outside, cut open on one side, the street cable coming in to the meter (line 10)
function houseCut(t, k) {
  var g = R(-40, 660, 720, 160, "#b9a581", 2) + lineP([[-40, 660], [680, 660]], INK, 2.4);
  g += R(60, 70, 20, 590, "#8a8478", 2.4) + lineP([[20, 100], [120, 100]], INK, 3) + C(40, 108, 7, "#e8e2d2", 1.6) + C(100, 108, 7, "#e8e2d2", 1.6);   // the street pole
  g += '<path d="M240 260 L440 140 L640 260 Z" fill="#b5543a" stroke="' + INK + '" stroke-width="2.4"/>' + R(260, 260, 360, 400, "#e6d6b2", 2.4);
  g += R(300, 320, 120, 120, "#cfe0e8", 2.4) + lineP([[360, 320], [360, 440]], INK, 2) + lineP([[300, 380], [420, 380]], INK, 2) + R(480, 480, 90, 180, "#a98c62", 2.4) + C(555, 570, 5, INK, 1);
  var cab = [[100, 108], [180, 160], [262, 300], [262, 520]]; g += '<path d="M100 108 Q180 190 262 300 L262 520" fill="none" stroke="' + INK + '" stroke-width="5"/>';
  g += meter(262, 560, .2, { bal: 125.4, wireLen: 300 });
  if (k > 0) g += G("", flow([[100, 108], [150, 160], [210, 225], [262, 300], [262, 520]], t, ORANGE, 70, 26, 4), k);
  return g;
}
// ── the charging office: a counter, the clerk behind it, the card writer on the counter, the card on it. o.write 0..1 · o.cardGlow
function office(t, o) {
  o = o || {}; var g = R(-40, -40, 720, 860, "#e4dcc6", 0) + R(60, 60, 520, 120, "#f1ead8", 2.4) + T("شحن كروت الكهربا", 320, 135, 34, CARDD, 800);
  var P1 = PERSON.front({ x: 300, y: 560, s: 1.6, legs: "stand", outfit: "office", breath: (Math.sin(t * 1.7) + 1) / 2,
    head: { tilt: 3 * Math.sin(t * .9), nod: .25 }, face: { look: [0, .8], eyes: Math.sin(t * 2.3) > .97 ? .05 : 1, mouth: "neutral" },
    arms: [{ to: [215, 545], hand: "flat", bend: -1 }, { to: [375, 540], hand: "relaxed", bend: 1 }] });
  g += P1.svg;
  g += R(-40, 560, 720, 260, "#a98c62", 2.6) + R(-40, 548, 720, 22, "#c8a878", 2.6);   // the counter in front of him
  // the card writer: a small terminal with a screen and a slot
  g += R(330, 480, 150, 80, "#dfe3e2", 2.4, 8) + R(346, 492, 80, 34, LCD, 2, 3) + '<text x="420" y="518" text-anchor="end" style="font:700 20px \'Courier New\';fill:' + LCDD + ';direction:ltr">' + (o.amt || "") + '</text>' + R(440, 494, 26, 10, BLACK, 1.4, 2) + R(440, 512, 26, 10, BLACK, 1.4, 2) + R(352, 538, 110, 8, BLACK, 1.4, 2);
  g += card(230, 548, .7, { rot: -6, glow: o.cardGlow || 0 });
  return g;
}
// a taxi meter (analogy thumbnail): red digits climbing
function taxi(v) { return R(-58, -32, 116, 64, BLACK, 2.4, 8) + R(-48, -22, 96, 30, "#3a1714", 1.6, 3) + '<text x="42" y="2" text-anchor="end" style="font:700 22px \'Courier New\';fill:#f0553f;direction:ltr">' + v.toFixed(2) + '</text>' + T("تاكسي", 0, 26, 13, "#e8e2d2", 800) + R(-26, -48, 52, 16, AMBER, 2, 4); }
// a wall light switch (analogy thumbnail): k 0 on .. 1 off
function wallSwitch(k) {   // a wall rocker switch: k 0 = on (top pressed) .. 1 = off (bottom pressed)
  var g = R(-48, -64, 96, 128, "#f4f0e6", 2.6, 8) + C(0, -52, 3.5, "#d6cfbf", 1.2) + C(0, 52, 3.5, "#d6cfbf", 1.2) + R(-26, -38, 52, 76, "#e3ddcf", 2.4, 5);
  g += k < .5 ? R(-26, -38, 52, 38, "#cfc8b6", 2.2, 5) + T("I", 0, 26, 18, INK, 800) : R(-26, 0, 52, 38, "#cfc8b6", 2.2, 5) + T("O", 0, -12, 18, INK, 800);
  return g;
}
// the price stairs (الشرايح): bars rising, the one in use lit
function stairs(x, y, n, k, cur) {
  var g = "", w = 92;
  for (var i = 0; i < n; i++) { var h = 60 + i * 64, kk = clamp(k * n - i); if (kk <= 0) continue; g += R(x + i * (w + 10), y - h * kk, w, h * kk, i === cur ? ORANGE : i < cur ? "#d9a57f" : BEIGE, 2.2) + T("شريحة " + (i + 1), x + i * (w + 10) + w / 2, y + 30, 18, INK, 800); }
  return g;
}
// the report the card carries back: a sheet with a usage graph and the «cover opened» line
function report(x, y, s, k, warn) {
  var g = R(-90, -120, 180, 240, "#fbf8f1", 2.4, 4) + T("تقرير العداد", 0, -88, 18, INK, 800) + lineP([[-70, -72], [70, -72]], INK, 1.4);
  var b = [30, 44, 38, 60, 52, 70]; b.forEach(function (h, i) { var kk = clamp(k * 6 - i); g += R(-64 + i * 22, 10 - h * kk, 16, h * kk, BLUE, 1.4); });
  g += T("استهلاكك", 0, 36, 15, BLUE, 800);
  if (warn > 0) g += G("", R(-76, 56, 152, 40, "#f6e0d6", 1.8, 6) + T("⚠ اتفتح الغطا", 0, 82, 15, ORANGE, 800), warn);
  return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', g);
}
return { meter: meter, card: card, chipPad: chipPad, chipBig: chipBig, inside: inside, relay: relay, room: room, nightOver: nightOver, houseCut: houseCut,
  office: office, taxi: taxi, wallSwitch: wallSwitch, stairs: stairs, report: report, flow: flow, lineP: lineP, lcd: lcd, led: led, money: money, PH: PH,
  colors: { CASE: CASE, LCD: LCD, COPPER: COPPER, GOLD: GOLD, CARDD: CARDD, RED: RED, AMBER: AMBER, NIGHT: NIGHT } };
})();
