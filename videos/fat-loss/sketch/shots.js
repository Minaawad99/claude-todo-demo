// ── «الدهون اللي بنخسّها بتروح فين؟» — drawings. The hand follows the «طب إزاي؟» reference (v20: the pink body with its
// inner organs, close cuts with leader labels; v04: head in profile). Shapes follow real references (refs/SOURCES.md):
// white fat cells (adipocytes) packed together, each one almost filled by a single lipid droplet that pushes a flattened
// nucleus against the edge; the triglyceride (a glycerol head with three long fatty-acid chains); the mitochondrion
// (an outer membrane and the folded inner membrane, the cristae); the lungs and windpipe.

// ── materials ──
var LIPID = "#ecd27a", LIPID_D = "#cfa94a", RIM = "#f2e6c6", NUC = "#b9a7c9", CHAIN = "#d99a4a", HEADC = "#7f8a4a",
    BLOOD = "#c9574a", BLOOD_D = "#a13d32", VESSEL = "#e7b3a4", MITO = "#e2b08c", MITO_IN = "#f2d6bd", MUSCLE = "#c9746a", MUSCLE_L = "#e0a196",
    LUNG = "#e6a8a0", OXY = "#7fa7c4", CARB = "#55504a", HYD = "#f4f1ea", FLAME = "#e58a3a", FLAME_Y = "#f2c25a", WOOD = "#8a5a36", WOOD_L = "#b07e52", NOTE = "#b9c79a";
function PS(d, fill, sw, ex) { var col = INK; ex = (ex || "").replace(/ stroke="([^"]*)"/, function (m, c) { col = c; return ""; }); return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + col + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"' + (ex || "") + '/>'; }
function at2(x, y, s, inner, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + ' scale(' + f(s) + ')">' + inner + '</g>'; }
function chunkAt(line, j) { var l = LN[line], c = window.CHUNKS[line]; return (l.end - l.start) * (c[j] || 0); }
function enz(x, y, r, rot, col, open) { var a = (open == null ? .5 : open) * .7 + .15; return at2(x, y, 1, '<path d="M0 0 L' + f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a)) + ' A' + r + ' ' + r + ' 0 1 1 ' + f(r * Math.cos(-a)) + ' ' + f(r * Math.sin(-a)) + ' Z" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><circle cx="' + f(-r * .45) + '" cy="' + f(-r * .35) + '" r="' + f(r * .14) + '" fill="#fff" opacity=".45"/>', rot); }
function drop(x, y, s, col) { return at2(x, y, s || 1, '<path d="M0 -26 C10 -10 18 0 18 10 A18 18 0 0 1 -18 10 C-18 0 -10 -10 0 -26 Z" fill="' + (col || "#9cc0d2") + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 6 q0 8 6 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'); }

// ── molecules ──
function o2(x, y, s, rot) { return at2(x, y, s || 1, C(-6, 0, 8, OXY, 1.6) + C(6, 0, 8, OXY, 1.6), rot); }
function co2(x, y, s, rot) { return at2(x, y, s || 1, C(-14, 0, 8, OXY, 1.6) + C(14, 0, 8, OXY, 1.6) + C(0, 0, 10, CARB, 1.8), rot); }
function h2o(x, y, s, rot) { return at2(x, y, s || 1, C(-10, 7, 6, HYD, 1.4) + C(10, 7, 6, HYD, 1.4) + C(0, -2, 10, OXY, 1.8), rot); }
// a fatty-acid chain: a zigzag of n links from (0,0) to the right; w = wiggle phase
function chain(x, y, n, s, w, col) {
  var d = "M0 0", dots = ""; for (var i = 1; i <= n; i++) { var px = i * 14, py = (i % 2 ? -8 : 0) + Math.sin(w + i * .7) * 2; d += " L" + px + " " + f(py); dots += '<circle cx="' + px + '" cy="' + f(py) + '" r="3.2" fill="' + INK + '"/>'; }
  return at2(x, y, s || 1, '<path d="' + d + '" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || CHAIN) + '" stroke-width="4.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' + dots);
}
// a triglyceride: an olive head (glycerol) with three chains; off[i] pulls chain i away (0..1, then far)
function tri(x, y, s, t, off, op) {
  op = op || {}; off = off || [0, 0, 0]; var g = R(-18, -46, 30, 92, HEADC, 2.4, 10);
  [-30, 0, 30].forEach(function (cy, i) { var o = off[i] || 0; g += C(12, cy, 6, "#a7ae72", 1.6) + chain(18 + o * 160, cy + o * (i - 1) * 40, op.n || 16, 1, t * 3 + i, op.col); });
  return at2(x, y, s, g, op.rot);
}

// ── fat cells (adipocytes): membrane rim, one big lipid droplet, a flattened nucleus at the edge. fill 0..1 = how full.
function fatCell(x, y, r, fill, i, t) {
  var lr = (r - 6) * (0.25 + 0.75 * (fill == null ? 1 : fill)), a = hash(i || 0) * 6.28, br = 1 + .012 * Math.sin((t || 0) * 2 + (i || 0));
  var s = C(x, y, r * br, RIM, 2.4) + C(x, y, lr * br, LIPID, 1.6) + '<circle cx="' + f(x - lr * .3) + '" cy="' + f(y - lr * .35) + '" r="' + f(lr * .25) + '" fill="#fff" opacity=".35"/>';
  var nx = x + Math.cos(a) * (r - 7), ny = y + Math.sin(a) * (r - 7);
  return s + '<ellipse cx="' + f(nx) + '" cy="' + f(ny) + '" rx="' + f(Math.max(5, r * .16)) + '" ry="' + f(Math.max(3, r * .07)) + '" transform="rotate(' + f(a * 180 / Math.PI + 90) + ' ' + f(nx) + ' ' + f(ny) + ')" fill="' + NUC + '" stroke="' + INK + '" stroke-width="1.4"/>';
}
function tissue(t, fill, op) {
  op = op || {}; var s = "", i = 0;
  for (var r = 0; r < 10; r++) for (var c = 0; c < 7; c++, i++) { var x = -20 + c * 104 + (r % 2 ? 52 : 0) + (hash(i) - .5) * 14, y = 20 + r * 90 + (hash(i + 30) - .5) * 14, rr = 50 + hash(i + 60) * 8;
    s += fatCell(x, y, rr, typeof fill === "function" ? fill(i, x, y) : fill, i, t); }
  // a capillary snaking between the cells
  if (op.vessel !== false) s += PS("M-40 620 C120 560 200 700 340 620 S560 560 700 640", "none", 20, ' stroke="' + INK + '"') + PS("M-40 620 C120 560 200 700 340 620 S560 560 700 640", "none", 15, ' stroke="' + VESSEL + '"');
  return s;
}

// ── blood, muscle, mitochondrion ──
function rbc(x, y, r, rot) { return at2(x, y, 1, '<ellipse rx="' + r + '" ry="' + f(r * .62) + '" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="1.8"/><ellipse rx="' + f(r * .5) + '" ry="' + f(r * .25) + '" fill="' + BLOOD_D + '" opacity=".6"/>', rot); }
// a blood vessel cut along its length from x0 to x1 at y, flowing right; cargo(t) draws what rides in it
function vessel(y, h, t, cargo) {
  var s = R(-60, y - h / 2 - 14, 760, h + 28, VESSEL, 2.4) + R(-60, y - h / 2, 760, h, "#f4dccf", 1.6);
  for (var i = 0; i < 12; i++) { var x = ((i * 80 + t * 90) % 820) - 80; s += rbc(x, y + (hash(i) - .5) * (h - 40), 22, (hash(i + 4) - .5) * 60 + t * 20 * (i % 2 ? 1 : -1)); }
  return s + (cargo ? cargo(t) : "");
}
function mito(x, y, s, t, op) {
  op = op || {}; var g = '<ellipse rx="150" ry="74" fill="' + MITO + '" stroke="' + INK + '" stroke-width="3"/><ellipse rx="136" ry="60" fill="' + MITO_IN + '" stroke="' + INK + '" stroke-width="2"/>';
  var d = "M-120 0"; for (var i = 0; i < 9; i++) { var xx = -110 + i * 28; d += " L" + xx + " " + (i % 2 ? 44 : -44) + " L" + (xx + 14) + " " + (i % 2 ? 44 : -44); }
  g += '<path d="' + d + ' L130 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linejoin="round"/>';
  if (op.glow) g += '<ellipse rx="' + f(150 + 8 * Math.sin(t * 6)) + '" ry="' + f(74 + 5 * Math.sin(t * 6)) + '" fill="' + FLAME_Y + '" opacity="' + f(.25 * op.glow) + '"/>';
  return at2(x, y, s, g, op.rot);
}
function muscle(x, y, w, h, t) {
  var s = R(x, y, w, h, MUSCLE, 2.6, 18);
  for (var i = 1; i < 6; i++) s += '<path d="M' + (x + 10) + ' ' + f(y + i * h / 6) + ' H' + (x + w - 10) + '" stroke="' + INK + '" stroke-width="1.4" opacity=".55"/>';
  for (var k = 0; k < w / 16; k++) s += '<path d="M' + f(x + 12 + k * 16) + ' ' + (y + 6) + ' v' + (h - 12) + '" stroke="' + MUSCLE_L + '" stroke-width="2" opacity=".6"/>';
  return s;
}
function liver(x, y, s) { return at2(x, y, s, PS("M-120 -20 C-120 -70 -20 -80 60 -60 C120 -46 140 -20 120 10 C90 50 10 60 -40 60 C-90 60 -120 30 -120 -20 Z", "#9a4a3c", 2.6) + PS("M10 -66 C0 -20 6 20 -10 58", "none", 1.6, ' stroke="#6a2e24"') + '<ellipse cx="-60" cy="-20" rx="26" ry="10" fill="#fff" opacity=".15"/>'); }

// ── the body (v20 hand): a pink silhouette from the front, lungs and windpipe inside ──
var BODYH = "M14 -214 L70 -196 C84 -192 90 -180 92 -166 L104 -40 C106 -24 100 -6 88 -6 C80 -6 78 -18 78 -30 L66 -140 C62 -100 58 -76 56 -58 C64 -36 68 -16 66 2 L60 150 L56 238 C56 250 44 254 30 252 C22 250 22 240 22 230 L18 150 L0 30";
// the body: the right half and its mirror
function body2(x, y, s, t, op) {
  op = op || {}; var half = '<path d="' + BODYH + ' L0 -214 Z" fill="' + SKIN + '" stroke="none"/>', edge = '<path d="' + BODYH + '" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
  var g = half + '<g transform="scale(-1 1)">' + half + '</g>' + edge + '<g transform="scale(-1 1)">' + edge + '</g>' + '<circle cx="0" cy="-250" r="38" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6" vector-effect="non-scaling-stroke"/>';
  if (op.lungs) g += '<g opacity="' + f(op.lungs) + '">' + PS("M0 -212 V-150 M0 -150 L-18 -132 M0 -150 L18 -132", "none", 7, ' stroke="#b89a8a"') + PS("M-20 -136 C-58 -152 -64 -100 -60 -60 C-56 -36 -32 -34 -14 -46 C-8 -80 -8 -110 -20 -136 Z", LUNG, 2.2) + PS("M20 -136 C58 -152 64 -100 60 -60 C56 -36 32 -34 14 -46 C8 -80 8 -110 20 -136 Z", LUNG, 2.2) + '</g>';
  if (op.belly != null) g += '<ellipse cx="0" cy="-6" rx="' + f(46 * op.belly) + '" ry="' + f(30 * op.belly) + '" fill="' + LIPID + '" opacity=".85" stroke="' + INK + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>';
  return at2(x, y, s, g);
}
// breath: puffs leaving a mouth at (x,y) going in direction dx (±1), with CO2 molecules riding in them
function breath(x, y, dx, t, k, n) {
  var s = ""; n = n || 7;
  for (var i = 0; i < n; i++) { var q = (t * .35 + i / n) % 1, px = x + dx * q * 220, py = y - q * 60 + Math.sin(t * 2 + i) * 10, op = clamp(k) * (1 - q);
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(14 + q * 34) + '" fill="#dfe6e8" opacity="' + f(op * .7) + '" stroke="' + INK + '" stroke-width="1" stroke-opacity="' + f(op * .5) + '"/>' + G("", co2(px, py, .7 + q * .5, t * 40 + i * 50), op); }
  return s;
}

// ── analogies ──
function note(x, y, s, val, rot) { return at2(x, y, s, R(-80, -40, 160, 80, NOTE, 2.2, 6) + R(-70, -30, 140, 60, "none", 1.2, 4) + '<circle cx="-40" cy="0" r="18" fill="#a2b382" stroke="' + INK + '" stroke-width="1.4"/>' + N(val, 34, 12, 30, INK), rot); }
function coin(x, y, r, val) { return C(x, y, r, "#d8c48a", 2) + C(x, y, r * .76, "none", 1.2) + N(val, x, y + r * .32, r * .9, INK); }
function fire(x, y, s, t) {
  var g = R(-130, 30, 260, 40, "#6a6a66", 2.4, 6) + R(-150, -150, 300, 200, "#8f8c86", 2.6, 10) + R(-120, -110, 240, 150, "#2e2a26", 2.4, 60);
  g += '<g>' + R(-80, 10, 160, 22, WOOD, 2, 8) + '<g transform="rotate(-14)">' + R(-70, -6, 150, 22, WOOD_L, 2, 8) + '</g></g>';
  for (var i = 0; i < 4; i++) { var h = 70 + 22 * Math.sin(t * 7 + i * 1.7), xx = -54 + i * 36; g += '<path d="M' + (xx - 22) + ' 10 Q' + (xx - 20) + ' ' + f(-h * .5) + ' ' + xx + ' ' + f(-h) + ' Q' + (xx + 22) + ' ' + f(-h * .5) + ' ' + (xx + 22) + ' 10 Z" fill="' + FLAME + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + (xx - 10) + ' 10 Q' + (xx - 8) + ' ' + f(-h * .25) + ' ' + xx + ' ' + f(-h * .55) + ' Q' + (xx + 10) + ' ' + f(-h * .25) + ' ' + (xx + 10) + ' 10 Z" fill="' + FLAME_Y + '"/>'; }
  g += R(-40, -330, 80, 180, "#8f8c86", 2.6);
  return at2(x, y, s, g);
}
function smoke(x, y, t, k) { var s = ""; for (var i = 0; i < 8; i++) { var q = (t * .3 + i / 8) % 1; s += '<circle cx="' + f(x + Math.sin(t + i * 2) * 30 * q) + '" cy="' + f(y - q * 300) + '" r="' + f(16 + 34 * q) + '" fill="#8e8b85" opacity="' + f(.45 * (1 - q) * k) + '"/>'; } return s; }
function plate(x, y, s, n) { var g = '<ellipse rx="90" ry="26" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.4"/><ellipse rx="64" ry="16" fill="none" stroke="' + INK + '" stroke-width="1.2"/>'; for (var i = 0; i < n; i++) g += C(-34 + i * 24, -8 - (i % 2) * 6, 14, ["#c96a4a", "#a7ae6c", "#e2b84a", "#c96a4a"][i % 4], 1.8); return at2(x, y, s, g); }
function gauge(x, y, r, k, col, lbl) {
  var a = Math.PI + k * Math.PI, s = '<path d="M' + (x - r) + ' ' + y + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + ' Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="M' + (x - r + 12) + ' ' + y + ' A' + (r - 12) + ' ' + (r - 12) + ' 0 0 1 ' + f(x + Math.cos(a) * (r - 12)) + ' ' + f(y + Math.sin(a) * (r - 12)) + '" stroke="' + col + '" stroke-width="10" fill="none"/>';
  return s + '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a) * (r - 18)) + ' ' + f(y + Math.sin(a) * (r - 18)) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(x, y, 6, INK, 0) + T(lbl, x, y + 36, 24, col, 800);
}
function balloon(x, y, k, t) { var r = 26 + 34 * k; return '<path d="M' + x + ' ' + f(y + r) + ' q-6 30 4 60" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f(r * .9) + '" ry="' + f(r) + '" fill="' + LIPID + '" stroke="' + INK + '" stroke-width="2.2"/>' + '<path d="M' + (x - 5) + ' ' + f(y + r) + ' l5 8 l5 -8 Z" fill="' + LIPID + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
function scale(x, y, s, val, k) { return at2(x, y, s, R(-110, -30, 220, 70, "#e9e4d8", 2.6, 14) + R(-60, -20, 120, 40, "#2e3a2e", 2, 6) + N(val, 0, 13, 30, "#b9e07a") + R(-90, 40, 30, 10, INK, 0) + R(60, 40, 30, 10, INK, 0)); }

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · fat tissue: cells packed together, each almost all one oil droplet; then into one cell
shot(4, push(320, 380, 1.0, 1.08), function (u, d, t) {
  return paper() + tissue(t, 1) + label(330, 380, 420, 120, "خلية دهون", OLIVE, at(u, .4, .5), 26);
});
shot([4, 1], push(320, 400, 1.04, 0.98), function (u, d, t) {
  return paper() + fatCell(320, 400, 250, 1, 3, t) + label(250, 360, 120, 120, "نقطة زيت", ORANGE, at(u, .4, .5), 28) + label(320 + Math.cos(hash(3) * 6.28) * 243, 400 + Math.sin(hash(3) * 6.28) * 243, 470, 720, "النواة", OLIVE, at(u, 1, .5), 24);
}, { tr: "in" });
// 5 · the oil is made of molecules: three long chains hanging from one head
shot(5, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .3, .6); return paper() + '<circle cx="320" cy="400" r="270" fill="' + LIPID + '" opacity=".35"/>' + appear(k, tri(130, 400, 1.8, t)) +
    label(118, 330, 120, 190, "الراس", OLIVE, at(u, chunkAt(5, 2) + .1, .5), 26) + label(400, 345, 430, 190, "3 سلاسل", ORANGE, at(u, chunkAt(5, 1) + .2, .5), 26);
}, { tr: "in" });
// 6 · when you eat less than you spend: a balance tips toward «spending»
shot(6, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, chunkAt(6, 1), 1.0), a = lerp(0, -14, k) + Math.sin(t * 2) * 1.2, s = paper();
  s += R(300, 460, 40, 220, "#bfb49c", 2.4) + '<path d="M250 690 H390 L370 660 H270 Z" fill="#bfb49c" stroke="' + INK + '" stroke-width="2.4"/>';
  var bar = '<rect x="-230" y="-10" width="460" height="20" rx="8" fill="#a98a62" stroke="' + INK + '" stroke-width="2.4"/>' + C(0, 0, 14, INK, 0);
  var lp = [-200, 0], rp = [200, 0], ra = a * Math.PI / 180;
  var L1 = [lp[0] * Math.cos(ra), lp[0] * Math.sin(ra)], R1 = [rp[0] * Math.cos(ra), rp[0] * Math.sin(ra)];
  s += at2(320, 460, 1, '<g transform="rotate(' + f(a) + ')">' + bar + '</g>' +
    PS("M" + f(L1[0]) + " " + f(L1[1]) + " L" + f(L1[0] - 60) + " " + f(L1[1] + 90) + " M" + f(L1[0]) + " " + f(L1[1]) + " L" + f(L1[0] + 60) + " " + f(L1[1] + 90), "none", 1.6) + '<path d="M' + f(L1[0] - 80) + ' ' + f(L1[1] + 90) + ' H' + f(L1[0] + 80) + ' Q' + f(L1[0]) + ' ' + f(L1[1] + 130) + ' ' + f(L1[0] - 80) + ' ' + f(L1[1] + 90) + ' Z" fill="#d8ccae" stroke="' + INK + '" stroke-width="2.4"/>' + plate(L1[0], L1[1] + 70, .7, 2) +
    PS("M" + f(R1[0]) + " " + f(R1[1]) + " L" + f(R1[0] - 60) + " " + f(R1[1] + 90) + " M" + f(R1[0]) + " " + f(R1[1]) + " L" + f(R1[0] + 60) + " " + f(R1[1] + 90), "none", 1.6) + '<path d="M' + f(R1[0] - 80) + ' ' + f(R1[1] + 90) + ' H' + f(R1[0] + 80) + ' Q' + f(R1[0]) + ' ' + f(R1[1] + 130) + ' ' + f(R1[0] - 80) + ' ' + f(R1[1] + 90) + ' Z" fill="#d8ccae" stroke="' + INK + '" stroke-width="2.4"/>' +
    at2(R1[0], R1[1] + 40, .5, fire(0, 0, 1, t)));
  return s + G("", T("أكل", 120, 300, 30, OLIVE, 800), at(u, .4, .3)) + G("", T("صرف", 520, 300, 30, ORANGE, 800), at(u, .6, .3));
});
// 7 · the hormones: insulin down, adrenaline up — a signal to the fat cell: «let it out»
shot(7, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k1 = at(u, .3, 1), k2 = at(u, 1.2, 1), sig = at(u, chunkAt(7, 2), .8), s = paper();
  s += gauge(170, 220, 110, lerp(.8, .2, k1), BLUE, "الإنسولين") + gauge(470, 220, 110, lerp(.2, .9, k2), ORANGE, "الأدرينالين");
  s += fatCell(320, 600, 140, 1, 3, t);
  s += draw("M170 290 C170 400 260 430 290 470", sig, INK, 3, ' stroke-dasharray="10 8"') + draw("M470 290 C470 400 380 430 350 470", sig, INK, 3, ' stroke-dasharray="10 8"');
  for (var i = 0; i < 2; i++) { var q = (u * .7 + i * .5) % 1; if (sig > .9) s += C(lerp(470, 350, q), lerp(290, 470, q), 8, ORANGE, 1.4); }
  return s + G("", tag("طلّعي!", 320, 400, 1, 32, ORANGE), at(u, chunkAt(7, 2) + .4, .3));
});
// 8 · enzymes inside the cell cut the three chains off the head and send them into the blood
shot(8, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .6, 1.4), s = paper() + '<circle cx="320" cy="300" r="260" fill="' + LIPID + '" opacity=".3"/>';
  s += tri(120, 300, 1.4, t, [k * (1 + .2 * Math.sin(t)), k * 1.1, k * (1.2 + .1 * Math.sin(t * 1.3))]);
  for (var i = 0; i < 3; i++) s += enz(lerp(260, 156, at(u, .2 + i * .15, .5)), 258 + i * 42, 20, 180, ORANGE, .5 + .5 * Math.sin(t * 7 + i));
  s += vessel(660, 120, t, function (tt) { var c = ""; for (var j = 0; j < 3; j++) { var q = at(u, chunkAt(8, 1) + j * .3, 1); if (q > 0) c += chain(lerp(300, 120 + j * 160, q), lerp(420, 650 + (j - 1) * 20, q), 10, 1, tt * 4 + j); } return c; });
  return s + label(170, 258, 120, 120, "إنزيم", ORANGE, at(u, .4, .4), 24) + label(560, 640, 520, 520, "الدم", BLOOD_D, at(u, chunkAt(8, 1) + .2, .4), 24);
}, { tr: "in" });
// 9 · like breaking a 100-pound note into change so you can spend it
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .5, .8), s = paper() + note(320, 300 - 40 * k, 1.8, "100", -4 + 8 * k * Math.sin(t)) ;
  for (var i = 0; i < 7; i++) { var q = at(u, .9 + i * .12, .5), a = -1.2 + i * .4; s += G("", coin(320 + Math.cos(a) * 200 * q + (i - 3) * 20, 420 + Math.abs(Math.sin(a)) * 160 * q + 40, 34, ["5", "1", "10", "5", "1", "10", "5"][i]), q); }
  return s + iconBox(80, 90, 120, tri(-38, 0, .5, t), at(u, .2, .3)) + G("", T("فكّة", 320, 740, 36, ORANGE, 800), at(u, 1.8, .3));
}, { tr: "out" });
// 10 · the blood carries the chains to the muscles and the liver
shot(10, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + vessel(380, 140, t, function (tt) { var c = ""; for (var j = 0; j < 5; j++) { var x = ((j * 150 + tt * 90) % 820) - 100; c += chain(x, 370 + (j % 2 ? -26 : 26), 9, 1, tt * 4 + j); } return c; });
  s += appear(at(u, .6, .5), muscle(40, 520, 280, 170, t)) + appear(at(u, 1.2, .5), liver(480, 610, 1.1, t));
  s += arrow(180, 460, 180, 515, INK, 5, at(u, .7, .3)) + arrow(470, 460, 480, 540, INK, 5, at(u, 1.3, .3));
  return s + label(160, 600, 120, 740, "العضلات", OLIVE, at(u, .8, .4), 26) + label(520, 640, 460, 740, "الكبد", OLIVE, at(u, 1.4, .4), 26) + label(560, 380, 520, 230, "سلاسل الدهون", ORANGE, at(u, .3, .4), 24);
});
// 11 · inside the muscle cell: the mitochondria, the cell's power stations
shot(11, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var s = paper() + R(40, 120, 560, 560, MUSCLE_L, 2.6, 30) + '<rect x="40" y="120" width="560" height="560" rx="30" fill="url(#hatch)" opacity=".3"/>';
  s += mito(220, 260, .6, t, { rot: -14 }) + mito(450, 340, .55, t, { rot: 20 }) + mito(300, 560, 1.05, t, { glow: at(u, chunkAt(11, 1), .6) });
  return s + label(300, 500, 330, 90, "الميتوكوندريا", OLIVE, at(u, chunkAt(11, 1) + .1, .5), 28) + G("", T("⚡", 520, 720, 50, ORANGE, 800), at(u, chunkAt(11, 1) + .5, .3));
}, { tr: "in" });
// 12 · the chain is chopped into short pieces; each piece burns with the oxygen you breathe in
shot(12, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + mito(320, 420, 1.9, t, { glow: at(u, chunkAt(12, 1), .5) }), cut = Math.floor(clamp((u - .4) / 2.4) * 6);
  s += chain(40 + cut * 28, 420, 14 - cut * 2, 1.4, t * 3);
  for (var i = 0; i < cut; i++) { var q = clamp((u - .4 - i * .4) / 1.2); s += G("", '<path d="M0 0 L14 -8 L28 0" transform="translate(' + f(lerp(40 + i * 28, 340, q)) + ' ' + f(lerp(420, 420 + (i % 2 ? -1 : 1) * 40 * q, q)) + ')" stroke="' + CHAIN + '" stroke-width="6" fill="none" stroke-linecap="round"/>', 1 - clamp(q * 1.4 - .4)); }
  var ko = at(u, chunkAt(12, 1), .4); for (i = 0; i < 6; i++) { var qq = (t * .4 + i / 6) % 1; s += G("", o2(lerp(640, 360, qq), 260 + i * 40 + Math.sin(t * 2 + i) * 10, 1.4, t * 30), ko * clamp(qq * 4) * (1 - qq * .5)); }
  return s + label(560, 290, 470, 150, "أكسجين", BLUE, ko, 26) + G("", '<circle cx="360" cy="420" r="' + f(36 + 6 * Math.sin(t * 8)) + '" fill="' + FLAME_Y + '" opacity="' + f(.6 * ko) + '"/>', 1);
}, { tr: "in" });
// 13 · like wood in a stove: it gives you warmth and leaves smoke
shot(13, push(320, 420, 1.04, 0.98), function (u, d, t) {
  return paper() + fire(320, 520, 1.5, t) + smoke(320, 0, t, at(u, chunkAt(13, 2), .5)) + label(260, 520, 120, 690, "خشب", OLIVE, at(u, .4, .4), 26) +
    G("", tag("دفا", 520, 600, 1, 34, ORANGE), at(u, chunkAt(13, 1), .3)) + label(340, 100, 470, 130, "دخان", BLUE, at(u, chunkAt(13, 2) + .2, .4), 26);
}, { tr: "out" });
// 14 · the burning gives energy, and leaves only two things: carbon dioxide and water
shot(14, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, chunkAt(14, 2), .6), s = paper() + mito(320, 260, 1.1, t, { glow: 1 });
  s += G("", T("⚡", 320, 150, 70, ORANGE, 800), at(u, .3, .3)) + G("", T("طاقة", 470, 150, 30, ORANGE, 800), at(u, .5, .3));
  for (var i = 0; i < 3; i++) { s += G("", co2(140 + (i % 2) * 90, 440 + i * 85 + Math.sin(t * 2 + i) * 6, 1.6, t * 20 + i * 40), k); s += G("", h2o(470 + (i % 2) * 40, 470 + i * 70 + Math.cos(t * 2 + i) * 6, 2, -t * 20), at(u, chunkAt(14, 3), .6)); }
  return s + G("", T("ثاني أكسيد الكربون", 200, 730, 26, BLUE, 800), k) + G("", T("مية", 490, 730, 30, BLUE, 800), at(u, chunkAt(14, 3), .5));
});
// 15 · carbon dioxide rides the blood back to the lungs and leaves with your breath
shot(15, push(320, 360, 1.0, 1.06), function (u, d, t) {
  var kl = at(u, chunkAt(15, 1), .6), kb = at(u, chunkAt(15, 2), .5);
  var s = paper() + body2(320, 420, 1.45, t, { lungs: kl });
  s += draw("M330 470 C380 380 360 300 340 250", kl, BLUE, 4, ' stroke-dasharray="9 7"');
  for (var i = 0; i < 3; i++) { var q = (u * .5 + i / 3) % 1; if (kl > .5) s += co2(lerp(330, 340, q) + Math.sin(q * 6) * 30, lerp(470, 250, q), .8, t * 40); }
  return s + breath(300, 70, -1, t, kb, 7) + label(370, 260, 470, 330, "الرئة", OLIVE, kl, 26) + label(200, 50, 150, 160, "النَفَس", BLUE, kb, 26);
}, { tr: "out" });
// 16 · the water leaves in urine, sweat and breath
shot(16, push(320, 380, 1.04, 1.0), function (u, d, t) {
  var s = paper() + body2(320, 420, 1.45, t, {}), w = [chunkAt(16, 0) + .8, chunkAt(16, 0) + 1.4, chunkAt(16, 0) + 2.0];
  s += G("", drop(160, 620, 1.4) + T("بول", 160, 700, 26, BLUE, 800), at(u, w[0], .3));
  for (var i = 0; i < 4; i++) { var q = (t * .4 + i / 4) % 1; s += G("", drop(450 + (i % 2) * 20, 330 + q * 120, .6), at(u, w[1], .3) * (1 - q)); }
  s += G("", T("عرق", 520, 300, 26, BLUE, 800), at(u, w[1], .3));
  return s + G("", breath(300, 70, -1, t, 1, 5) + T("نَفَس", 130, 140, 26, BLUE, 800), at(u, w[2], .3));
});
// 17–18 · of 10 kg of fat: 8.4 kg leaves as carbon dioxide through your breath, 1.6 kg as water
function split(u, t, k, hiW) {
  var s = paper(), y0 = 170, H = 500, cH = H * .84 * k;
  s += R(200, y0, 240, H, "#efe7d2", 2.6, 10) + N("10", 320, y0 - 30, 44, INK) + T("كيلو دهون", 320, y0 - 2, 20, INK, 700);
  s += sweep(200, y0, 240, H, k, "d", R(200, y0, 240, H * .84, "#c9d6dc", 2.4, 10) + R(200, y0 + H * .84, 240, H * .16, "#9cc0d2", 2.4, 10));
  for (var i = 0; i < 9; i++) s += G("", co2(240 + (i % 3) * 80, y0 + 60 + Math.floor(i / 3) * 120 + Math.sin(t * 2 + i) * 8, 1.4, t * 30 + i * 40), clamp(k * 1.4 - i * .05));
  s += G("", N(k < 1 ? count(8.5, k, 1) : "8.5", 520, 400, 60, ORANGE) + T("كيلو نَفَس", 530, 440, 22, INK, 700), at(u, .6, .4));
  s += G("", N("1.5", 520, y0 + H * .92 + 14, 46, BLUE) + T("كيلو مية", 530, y0 + H * .92 + 44, 20, INK, 700), hiW);
  if (hiW > 0) s += '<rect x="194" y="' + f(y0 + H * .84 - 6) + '" width="252" height="' + f(H * .16 + 12) + '" rx="12" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 6" opacity="' + f(hiW) + '"/>';
  return s + breath(150, 260, -1, t, k * (1 - hiW * .6), 5);
}
shot(17, push(320, 420, 1.0, 1.04), function (u, d, t) { return split(u, t, at(u, .4, 2.2), 0); });
shot(18, push(320, 440, 1.0, 1.05), function (u, d, t) { return split(u, t, 1, at(u, .3, .5)); });
// 19 · the myth: fat turns into muscle, or melts out in sweat — no
shot(19, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var x = at(u, chunkAt(19, 2), .6), s = paper();
  s += fatCell(150, 260, 100, 1, 2, t) + arrow(270, 260, 380, 260, INK, 5, at(u, .4, .4)) + muscle(400, 190, 200, 140, t) + cross(320, 260, 1.6, x);
  s += fatCell(150, 560, 100, 1, 5, t) + arrow(270, 560, 380, 560, INK, 5, at(u, chunkAt(19, 1), .4)) + G("", drop(480, 570, 2.2), at(u, chunkAt(19, 1) + .2, .3)) + cross(320, 560, 1.6, at(u, chunkAt(19, 2) + .3, .6));
  return s;
}, { tr: "out" });
// 20 · muscle is a different tissue; sweat is water that cools you
shot(20, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var s = paper() + muscle(60, 180, 240, 240, t) + '<g transform="translate(350 180)"><clipPath id="fc"><rect width="240" height="240" rx="18"/></clipPath><g clip-path="url(#fc)">' + fatCell(60, 60, 70, 1, 1, t) + fatCell(180, 70, 66, 1, 2, t) + fatCell(110, 190, 72, 1, 4, t) + fatCell(240, 200, 60, 1, 6, t) + '</g><rect width="240" height="240" rx="18" fill="none" stroke="' + INK + '" stroke-width="2.6"/></g>';
  s += T("≠", 325, 320, 70, ORANGE, 800) + label(180, 300, 120, 470, "عضلة", OLIVE, at(u, .3, .4), 24) + label(470, 300, 520, 470, "دهون", OLIVE, at(u, .5, .4), 24);
  var k = at(u, chunkAt(20, 1), .5); for (var i = 0; i < 3; i++) { var q = (t * .5 + i / 3) % 1; s += G("", drop(220 + i * 100, 560 + q * 100, .9), k * (1 - q)); }
  return s + G("", T("عرق = تبريد", 320, 740, 32, BLUE, 800), k);
});
// 21 · the fat cell doesn't disappear: it empties and shrinks like a balloon
shot(21, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, chunkAt(21, 1), 1.6), s = paper() + fatCell(320, 400, lerp(220, 120, k), lerp(1, .1, k), 3, t);
  return s + iconBox(530, 110, 150, G("translate(0 -16)", balloon(0, 0, 1 - k * .7, t)), at(u, chunkAt(21, 1) + .3, .3)) + G("", tag("لسه موجودة", 320, 700, 1, 30, OLIVE), at(u, .5, .3)) + G("", tag("بتصغر", 320, 140, 1, 30, ORANGE), at(u, chunkAt(21, 1) + .6, .3));
});
// 22 · eat like before and it fills right back up
shot(22, push(320, 400, 1.04, 0.98), function (u, d, t) {
  var k = at(u, chunkAt(22, 1), 1.4), s = paper() + fatCell(320, 420, lerp(120, 220, k), lerp(.1, 1, k), 3, t);
  s += plate(140, 140, 1, 4) + arrow(200, 190, 250, 260, INK, 5, at(u, .4, .4));
  for (var i = 0; i < 3; i++) { var q = (t * .5 + i / 3) % 1; s += G("", C(lerp(220, 300, q), lerp(210, 360, q), 9, LIPID, 1.4), k > 0 && k < 1 ? 1 : .3); }
  return s + G("", T("↻", 520, 160, 80, ORANGE, 800), at(u, chunkAt(22, 1), .3));
}, { tr: "out" });
// 23 · the recap: eat less → the cell lets go → the mitochondria burn it → you breathe it out
shot(23, push(320, 400, 0.98, 1.02), function (u, d, t) {
  var a = [0, 1, 2, 3].map(function (j) { return at(u, chunkAt(23, j) + .1, .5); }), s = paper();
  s += appear(a[0], plate(470, 200, 1, 1) + T("↓", 470, 150, 50, ORANGE, 800)) + callout("1", 580, 90, a[0]);
  s += appear(a[1], fatCell(170, 200, 90, .5, 3, t) + chain(220, 190, 6, 1, t * 3)) + callout("2", 60, 90, a[1]);
  s += appear(a[2], mito(170, 540, .7, t, { glow: 1 })) + callout("3", 60, 450, a[2]);
  s += appear(a[3], breath(560, 540, -1, t, 1, 5)) + callout("4", 580, 450, a[3]);
  return s + arrow(380, 200, 280, 200, INK, 4, a[1]) + arrow(170, 310, 170, 470, INK, 4, a[2]) + arrow(290, 540, 400, 540, INK, 4, a[3]);
}, { tr: "out" });
// 24 · the odd fact: to burn those 10 kg you must breathe in about 29 kg of oxygen
shot(24, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var k = at(u, chunkAt(24, 1), 1.6), s = paper() + body2(180, 470, 1.15, t, { lungs: 1 });
  for (var i = 0; i < 8; i++) { var q = (t * .35 + i / 8) % 1; s += G("", o2(lerp(560, 200, q), 200 + i * 10 + Math.sin(t * 2 + i) * 20, 1.2, t * 30), clamp(k * 2) * clamp(q * 4) * (1 - q * .4)); }
  s += R(420, 420, 180, 240, "#c9d6dc", 2.6, 12) + N("O₂", 510, 560, 50, BLUE);
  return s + bigNum(count(29, k), "كيلو أكسجين", 510, 340, at(u, chunkAt(24, 1), .3), ORANGE, 90) + G("", tag("10 كيلو دهون", 510, 720, 1, 22, INK), at(u, .3, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a body on a bathroom scale, the number drops by 10. line 1: the belly fat shrinks, arrows out. line 2: «?»
  var k = clamp(t / 1.4), s = body2(300, 330, 1.05, t, { belly: li === 0 ? 1 : lerp(1, .35, clamp((t - LN[1].start) / 1.5)) }) + scale(300, 620, 1, (90 - Math.round(10 * k)) + "", 1);
  if (li >= 1) for (var i = 0; i < 3; i++) s += arrow(300, 320, 300 + Math.cos(i * 2.1 + 2.6) * 150, 320 + Math.sin(i * 2.1 + 2.6) * 120, ORANGE, 4, clamp((t - LN[1].start - .3 - i * .2) / .4));
  if (li >= 2) s += G("", T("؟", 480, 220, 120, ORANGE, 800), clamp((t - LN[2].start) / .3));
  return s;
};
SCENE.bumper = function (u, t) { return fatCell(90, 110, 52 + 3 * Math.sin(t * 3), 1, 3, t) + breath(120, 70, 1, t, 1, 3); };
SCENE.outro = function (svg, u, t) {
  var s = fatCell(530, 150, 70, .7, 3, t) + chain(330, 150, 7, 1, t * 3) + mito(200, 150, .45, t, { glow: 1 }) + breath(110, 150, -1, t, 1, 3);
  return s + callout("1", 530, 40, ease(u / .3)) + callout("2", 380, 40, ease(u / .3 - .5)) + callout("3", 200, 40, ease(u / .3 - 1)) + callout("4", 60, 40, ease(u / .3 - 1.5));
};
