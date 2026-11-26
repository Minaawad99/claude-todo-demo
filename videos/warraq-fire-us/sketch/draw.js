/* «حريق دائري الوراق» — the drawings, in the «اسكتش» hand (cream paper, ink outline, flat fills, light hatching).
   Loaded before scenes.js; it uses the sketch helpers (R, C, P, G, T, N, f, lerp, clamp, ease, hash, INK, ORANGE…), which
   are globals by the time anything is drawn. Vehicles are drawn from real photos (refs/SOURCES.md), to real size:
   local units are centimetres (1 m = 100), x = 0 is the front bumper, y = 0 the ground under the tyres, the front faces left.
   Place one with G("translate(x y) scale(s)", sedan(...)). */

var NIGHT = "#2b3340", ASPH = "#77736b", ASPH_D = "#5e5b55", CONC = "#c9c2b2", CONC_D = "#a9a191", CHAR = "#4a4540", CHAR_D = "#34302c",
    FUEL = "#a08a4e", FIRE_O = "#c4532f", FIRE_M = "#d98a4a", FIRE_I = "#e9c66a", SMOKE = "#6d675f", LAMP = "#f0d27a",
    VAPOR = "#4a6f8a", CAR_W = "#ece9e1", CAR_WD = "#c9c4b8", GLASS2 = "#9fb3bd", GLASS_D = "#7e939e", TYRE = "#2f2b27", RIM = "#b9b6ae";

// ── wheels: a tyre with tread line, a rim with spokes and a hub; burnt = only the steel rim on a flat tyre ──
function wheelS(x, y, r, o) {
  o = o || {}; var s = "", rim = r * .62, a0 = o.rot || 0;
  if (o.burnt) return C(x, y + r * .08, r * .98, CHAR_D, 2) + C(x, y, rim, "#5b5650", 1.8) + C(x, y, rim * .3, CHAR, 1.4);
  s += C(x, y, r, TYRE, 2.2) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .86) + '" fill="none" stroke="#4a443e" stroke-width="' + f(r * .06) + '"/>';
  s += C(x, y, rim, o.rim || RIM, 1.8);
  for (var i = 0; i < (o.spokes || 5); i++) { var a = a0 + i * Math.PI * 2 / (o.spokes || 5), c = Math.cos(a), d = Math.sin(a);
    s += '<path d="M' + f(x + c * rim * .3) + ' ' + f(y + d * rim * .3) + ' L' + f(x + c * rim * .92) + ' ' + f(y + d * rim * .92) + '" stroke="#8d8a82" stroke-width="' + f(rim * .22) + '" stroke-linecap="round"/>'; }
  return s + C(x, y, rim * .3, "#d7d4cc", 1.4) + C(x, y, rim * .1, INK, 0);
}

// ── a compact sedan (Hyundai Verna / Accent, the commonest car on Cairo roads): 4.37 m long, 1.47 m high, wheelbase 2.57 m,
// wheels 0.62 m. o: {col, colD, burnt (0..1 charred), lights, t, spin}
function sedan(o) {
  o = o || {}; var col = o.col || "#b9c2c6", colD = o.colD || "#8f9a9f", b = clamp(o.burnt || 0), s = "";
  if (b > .5) { col = CHAR; colD = CHAR_D; }
  var body = "M6 -30 L2 -46 Q0 -64 12 -74 L22 -82 Q70 -89 130 -95 L198 -137 Q214 -146 240 -146 L304 -144 Q322 -143 334 -132 L384 -101 L424 -97 Q437 -95 438 -80 L438 -42 Q437 -31 428 -29 L386 -29 A43 43 0 0 0 300 -29 L128 -29 A43 43 0 0 0 42 -29 Z";
  s += '<ellipse cx="219" cy="2" rx="215" ry="9" fill="' + INK + '" opacity=".18"/>';
  s += P(body, col, 2.4);
  // lower body shade and the sill
  s += '<path d="M44 -34 L128 -34 L128 -29 Q86 -70 44 -34 Z" fill="' + colD + '" opacity=".0"/>' + P("M128 -36 L300 -36 L300 -29 L128 -29 Z", colD, 1.4);
  s += '<path d="M8 -58 Q140 -66 438 -66" stroke="' + colD + '" stroke-width="2.6" fill="none"/>';   // shoulder crease
  // glass: windscreen edge, front and rear side windows, the B and C pillars
  var g = b > .5 ? "#3c3834" : GLASS2;
  s += P("M150 -99 L204 -133 Q214 -139 232 -139 L254 -139 L254 -99 Z", g, 1.8) + P("M262 -99 L262 -139 L302 -138 Q316 -137 326 -128 L366 -101 Z", g, 1.8);
  if (b <= .5) s += '<path d="M168 -104 L206 -128 L214 -128 L176 -104 Z M276 -104 L276 -132 L284 -132 L284 -104 Z" fill="#fff" opacity=".45"/>';
  s += P("M254 -139 L262 -139 L262 -99 L254 -99 Z", colD, 1.4);
  // doors, handles, mirror, fuel flap
  s += '<path d="M146 -96 L140 -36 M258 -100 L258 -36 M356 -96 Q352 -60 340 -42" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
  s += R(226, -88, 18, 5, colD, 1.1, 2) + R(330, -88, 18, 5, colD, 1.1, 2) + P("M150 -100 L136 -104 Q130 -96 136 -90 L150 -92 Z", col, 1.6) + C(392, -78, 7, colD, 1.2);
  // lamps: headlamp swept back, fog lamp, tail lamp; grille and bumper line
  s += P("M6 -66 Q8 -76 22 -80 L50 -82 Q44 -70 30 -64 Z", o.lights ? LAMP : "#e7e2d4", 1.6) + R(8, -44, 16, 7, "#d6d0c0", 1.1, 3);
  s += P("M424 -94 Q436 -92 437 -80 L416 -80 Q414 -90 424 -94 Z", "#a8433a", 1.6);
  s += '<path d="M2 -52 L40 -52 M406 -50 L438 -50" stroke="' + INK + '" stroke-width="1.2"/>';
  if (o.lights && b <= .2) s += '<path d="M4 -72 L-150 -40 L-150 -96 Z" fill="' + LAMP + '" opacity=".16"/>';
  s += wheelS(85, -31, 31, { burnt: b > .5, rot: (o.t || 0) * (o.spin || 0) }) + wheelS(343, -31, 31, { burnt: b > .5, rot: (o.t || 0) * (o.spin || 0) });
  if (b > 0 && b <= .5) s += '<path d="' + body + '" fill="' + CHAR + '" opacity="' + f(b * 1.4) + '"/>';
  return s;
}

// ── a Toyota HiAce high-roof microbus, the Cairo «ميكروباص»: 5.38 m long, 2.28 m high, wheelbase 3.11 m; white with the
// blue and yellow side stripes of the photo (refs). o: {burnt, lights, t, spin}
function microbus(o) {
  o = o || {}; var b = clamp(o.burnt || 0), w = b > .5 ? CHAR : CAR_W, wd = b > .5 ? CHAR_D : CAR_WD, s = "";
  var body = "M4 -34 L2 -84 Q2 -104 14 -112 L40 -124 L96 -212 Q104 -224 124 -225 L512 -228 Q534 -228 536 -210 L538 -44 Q538 -34 528 -33 L432 -33 A46 46 0 0 0 340 -33 L122 -33 A46 46 0 0 0 30 -33 Z";
  s += '<ellipse cx="270" cy="2" rx="268" ry="10" fill="' + INK + '" opacity=".18"/>';
  s += P(body, w, 2.4);
  if (b <= .5) {   // the stripes: a blue band along the bottom that sweeps up to the back, a yellow one inside it
    s += '<path d="M8 -56 L300 -56 Q400 -60 440 -150 L470 -226 L512 -228 L470 -120 Q440 -50 380 -44 L8 -44 Z" fill="#3f67a8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M8 -66 L290 -66 Q380 -72 410 -160 L432 -226 L452 -227 L428 -150 Q400 -62 300 -58 L8 -58 Z" fill="#e2b93a" stroke="' + INK + '" stroke-width="1.2"/>';
  }
  s += P("M14 -112 L40 -124 L96 -212 Q100 -218 108 -219 L108 -214 L48 -122 L18 -110 Z", wd, 1.2);   // A-pillar and the windscreen edge
  var g = b > .5 ? "#3c3834" : GLASS2;
  s += P("M56 -124 L104 -200 L148 -200 L148 -124 Z", g, 1.8);   // driver's door window
  for (var i = 0; i < 4; i++) s += P("M" + (166 + i * 78) + " -196 L" + (236 + i * 78) + " -196 L" + (236 + i * 78) + " -136 L" + (166 + i * 78) + " -136 Z", g, 1.8);
  s += P("M484 -196 L520 -196 L522 -136 L484 -136 Z", g, 1.8);
  if (b <= .5) s += '<path d="M70 -132 L110 -194 L118 -194 L78 -132 Z M178 -140 L196 -192 L204 -192 L186 -140 Z" fill="#fff" opacity=".4"/>';
  // roof rack and rails, the sliding-door rail, doors, handles, mirror, step
  s += P("M130 -226 L500 -229 L500 -240 L130 -237 Z", "#cfcac0", 1.4); for (var r = 150; r < 500; r += 50) s += '<path d="M' + r + ' -227 L' + r + ' -238" stroke="' + INK + '" stroke-width="1.2"/>';
  s += '<path d="M156 -120 L156 -38 M240 -128 L240 -38 M168 -130 L420 -130" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' + R(136, -112, 14, 6, wd, 1.1, 2) + R(220, -112, 14, 6, wd, 1.1, 2);
  s += P("M56 -124 L40 -130 Q34 -118 40 -110 L56 -112 Z", w, 1.6);
  // lamps, grille, bumper, tail lamp
  s += P("M4 -84 Q6 -98 18 -100 L36 -100 L30 -84 Z", o.lights ? LAMP : "#e7e2d4", 1.6) + R(2, -72, 26, 10, "#bdb7aa", 1.2, 2) + '<path d="M2 -62 L34 -62" stroke="' + INK + '" stroke-width="1.2"/>';
  s += R(528, -130, 10, 34, "#a8433a", 1.4, 2);
  if (o.lights && b <= .2) s += '<path d="M4 -92 L-160 -56 L-160 -120 Z" fill="' + LAMP + '" opacity=".16"/>';
  s += wheelS(76, -33, 33, { burnt: b > .5, rot: (o.t || 0) * (o.spin || 0), spokes: 6 }) + wheelS(386, -33, 33, { burnt: b > .5, rot: (o.t || 0) * (o.spin || 0), spokes: 6 });
  if (b > 0 && b <= .5) s += '<path d="' + body + '" fill="' + CHAR + '" opacity="' + f(b * 1.4) + '"/>';
  return s;
}

// ── a fuel tanker: a cab-over tractor and a three-axle tank semi-trailer, 12.6 m long, 3.5 m high (refs: the side-view tanker
// photo). The tank has five compartments with manholes under a walkway rail, a rear ladder, a hose cabinet and the orange
// hazard plate «33 / 1203» (petrol). o: {lights, t, spin, hl (0..1 highlight the tank in orange), plate}
function tanker(o) {
  o = o || {}; var s = "", TK = "#e4e1d8", TKD = "#bdb8ab", CAB = "#e9e6dd";
  s += '<ellipse cx="640" cy="2" rx="640" ry="12" fill="' + INK + '" opacity=".18"/>';
  // trailer chassis, landing legs, mud flaps
  s += R(250, -124, 1010, 16, "#4b4741", 2) + R(380, -108, 10, 70, "#5b5650", 1.6) + R(372, -42, 26, 8, "#5b5650", 1.4);
  // the tank: one long ellipse-ended barrel
  var tank = "M300 -330 L1210 -330 Q1262 -330 1262 -228 Q1262 -126 1210 -126 L300 -126 Q248 -126 248 -228 Q248 -330 300 -330 Z";
  s += P(tank, o.hl ? lerp3(TK, "#e3a07a", o.hl) : TK, 2.6);
  s += '<path d="M260 -180 Q760 -168 1256 -180 L1252 -150 Q1220 -128 1210 -126 L300 -126 Q262 -126 254 -150 Z" fill="' + TKD + '" opacity=".6"/>';
  for (var r = 1; r < 5; r++) { var x = 250 + r * 202; s += '<path d="M' + x + ' -330 L' + x + ' -126" stroke="' + TKD + '" stroke-width="5"/><path d="M' + x + ' -330 L' + x + ' -126" stroke="' + INK + '" stroke-width="1"/>'; }
  // walkway rail and manholes on top
  for (var m = 0; m < 5; m++) { var mx = 340 + m * 202; s += R(mx, -346, 52, 16, "#9a958a", 1.6, 3); }
  s += '<path d="M290 -372 L1220 -372 M300 -372 L300 -330 M500 -372 L500 -330 M700 -372 L700 -330 M900 -372 L900 -330 M1100 -372 L1100 -330 M1210 -372 L1210 -330" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
  // rear ladder, hose cabinet, hazard plates, a stripe
  s += '<path d="M1262 -330 L1272 -330 L1272 -130 M1284 -330 L1284 -130" stroke="' + INK + '" stroke-width="2.2"/>';
  for (var l = -310; l < -130; l += 30) s += '<path d="M1272 ' + l + ' L1284 ' + l + '" stroke="' + INK + '" stroke-width="2"/>';
  s += R(640, -120, 190, 64, "#9a958a", 2) + '<path d="M735 -120 L735 -56" stroke="' + INK + '" stroke-width="1.3"/>' + R(700, -96, 12, 6, INK, 0) + R(758, -96, 12, 6, INK, 0);
  s += '<path d="M260 -204 L1258 -204" stroke="' + ORANGE + '" stroke-width="7"/>';
  s += R(1100, -290, 70, 50, ORANGE, 2, 2) + '<path d="M1100 -265 L1170 -265" stroke="' + INK + '" stroke-width="2"/>' + N("33", 1135, -270, 20, INK) + N("1203", 1135, -246, 18, INK);
  s += G("translate(1210 -262) rotate(45)", R(-20, -20, 40, 40, "#c93c2a", 2)) + T("3", 1210, -254, 22, "#fff", 800);
  // trailer wheels: three axles, the mud flap behind
  [980, 1090, 1200].forEach(function (x) { s += wheelS(x, -50, 50, { rot: (o.t || 0) * (o.spin || 0), spokes: 8 }); });
  s += R(1250, -108, 10, 80, "#3a3631", 1.4);
  // the tractor: cab-over with a tall flat front, windscreen, sun visor, door, steps, mirror, grille, bumper; fuel tank and air tanks
  s += R(150, -136, 170, 24, "#4b4741", 2);
  s += P("M8 -66 L8 -300 Q8 -350 50 -352 L220 -356 Q240 -356 240 -336 L240 -110 L8 -110 Z", CAB, 2.6);
  s += P("M8 -66 L240 -66 L240 -110 L8 -110 Z", "#6b665e", 2.2) + R(4, -60, 70, 22, "#8d887e", 1.8, 3);   // bumper
  s += P("M14 -300 Q14 -334 44 -336 L118 -336 L118 -222 L14 -222 Z", GLASS2, 2);   // windscreen (side edge)
  s += P("M126 -330 L218 -332 L218 -232 L126 -230 Z", GLASS2, 2);   // door window
  s += '<path d="M32 -296 L58 -330 L66 -330 L40 -296 Z" fill="#fff" opacity=".45"/><path d="M122 -340 L122 -116" stroke="' + INK + '" stroke-width="1.6"/>';
  s += P("M12 -350 L236 -354 L236 -366 Q140 -372 14 -362 Z", "#cfcac0", 1.6);   // visor / roof spoiler
  s += R(196, -200, 20, 7, "#9a958a", 1.1, 2) + R(150, -126, 60, 10, "#5b5650", 1.2) + R(156, -104, 52, 8, "#5b5650", 1.2);
  s += P("M8 -230 L-14 -236 L-18 -150 L-6 -146 L-4 -220 L8 -220 Z", "#5b5650", 1.6);   // mirror arm
  for (var gy = -196; gy < -124; gy += 12) s += '<path d="M10 ' + gy + ' L60 ' + gy + '" stroke="#8d887e" stroke-width="3"/>';
  s += P("M8 -120 L46 -120 L46 -100 L8 -100 Z", o.lights ? LAMP : "#e7e2d4", 1.6);
  if (o.lights) s += '<path d="M6 -112 L-220 -60 L-220 -160 Z" fill="' + LAMP + '" opacity=".16"/>';
  s += R(250, -112, 100, 42, "#a9a59c", 1.8, 18) + '<path d="M272 -112 L272 -70 M328 -112 L328 -70" stroke="' + INK + '" stroke-width="1.3"/>';
  s += wheelS(80, -50, 50, { rot: (o.t || 0) * (o.spin || 0), spokes: 8 }) + wheelS(330, -50, 50, { rot: (o.t || 0) * (o.spin || 0), spokes: 8 });
  return s;
}
function lerp3(a, b, k) { function h(c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); } var o = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(h(a, i), h(b, i), clamp(k))); o += (v < 16 ? "0" : "") + v.toString(16); } return o; }

// ── the tanker from behind (the end of the tank), for the crash seen along the road. Local: x = 0 the middle, y = 0 the
// ground; 2.5 m wide (250), 3.5 m high. rot is applied by the caller.
function tankerBack(o) {
  o = o || {}; var s = "", TK = "#e4e1d8", TKD = "#bdb8ab";
  s += R(-118, -132, 236, 22, "#4b4741", 2);   // chassis cross member
  [[-124, -96], [-92, -64], [64, 96], [96, 124]].forEach(function (w) { s += R(w[0], -100, w[1] - w[0], 100, TYRE, 2, 6) + '<path d="M' + (w[0] + 6) + ' -50 L' + (w[1] - 6) + ' -50" stroke="#4a443e" stroke-width="3"/>'; });
  s += R(-108, -96, 216, 18, "#6b665e", 2) + R(-116, -86, 34, 12, "#a8433a", 1.4, 2) + R(82, -86, 34, 12, "#a8433a", 1.4, 2) + R(-26, -90, 52, 16, "#f0efe8", 1.4);   // bumper, lamps, plate
  s += '<ellipse cx="0" cy="-236" rx="124" ry="104" fill="' + TK + '" stroke="' + INK + '" stroke-width="2.6"/>';
  s += '<ellipse cx="0" cy="-236" rx="104" ry="86" fill="none" stroke="' + TKD + '" stroke-width="5"/><path d="M-110 -200 Q0 -120 110 -200 Q60 -140 0 -134 Q-60 -140 -110 -200 Z" fill="' + TKD + '" opacity=".7"/>';
  s += '<path d="M-14 -336 L-14 -134 M14 -336 L14 -134" stroke="' + INK + '" stroke-width="2.4"/>';
  for (var l = -320; l < -140; l += 26) s += '<path d="M-14 ' + l + ' L14 ' + l + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M-110 -352 L110 -352 M-90 -352 L-90 -334 M90 -352 L90 -334" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(40, -270, 56, 40, ORANGE, 2, 2) + '<path d="M40 -250 L96 -250" stroke="' + INK + '" stroke-width="1.6"/>' + N("33", 68, -254, 15, INK) + N("1203", 68, -235, 13, INK);
  return s;
}

// ── a Jersey concrete barrier seen end-on (the profile), 81 cm high, 61 cm at the base, 15 cm at the top; and seen from the side
function jerseyEnd(x, y, sc, cr) { sc = sc || 1; return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", P("M-30 0 L-30 -8 L-22 -26 L-9 -74 L-8 -81 L8 -81 L9 -74 L22 -26 L30 -8 L30 0 Z", CONC, 2.2) + '<path d="M-22 -26 L22 -26" stroke="' + CONC_D + '" stroke-width="2"/>' + (cr ? '<path d="M-8 -81 L-2 -60 L-12 -44 L-4 -30" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' : "")); }
function jerseySide(x0, x1, y, h) { h = h || 32; var s = R(x0, y - h, x1 - x0, h, CONC, 2) + '<path d="M' + x0 + ' ' + f(y - h * .32) + ' L' + x1 + ' ' + f(y - h * .32) + '" stroke="' + CONC_D + '" stroke-width="2"/>'; for (var x = x0 + 120; x < x1; x += 120) s += '<path d="M' + x + ' ' + (y - h) + ' L' + x + ' ' + y + '" stroke="' + INK + '" stroke-width="1.2"/>'; return s; }

// ── the Ring Road over the «نفق عشرة» underpass, from the side at eye level: the deck (asphalt on a concrete slab), the
// parapet, lamp posts, and the underpass below with its own road. y = the deck surface. o: {x0, x1, lamps, tunnel, night}
function deckSide(y, o) {
  o = o || {}; var x0 = o.x0 == null ? -900 : o.x0, x1 = o.x1 == null ? 1700 : o.x1, s = "";
  if (o.tunnel !== false) {   // the street under the bridge: piers and a dark opening
    s += R(x0, y + 60, x1 - x0, 400, "#d9cfb8", 0) + '<rect x="' + x0 + '" y="' + (y + 60) + '" width="' + (x1 - x0) + '" height="400" fill="url(#hatch)" opacity=".5"/>';
    s += R(o.tx == null ? 140 : o.tx, y + 60, 360, 140, "#4b4741", 2) + R(o.tx == null ? 140 : o.tx, y + 200, 360, 12, ASPH, 2);
    [x0 + 40, (o.tx == null ? 140 : o.tx) - 50, (o.tx == null ? 140 : o.tx) + 360, (o.tx == null ? 140 : o.tx) + 700].forEach(function (px) { s += R(px, y + 60, 50, 400, CONC, 2) + hatch("M" + px + " " + (y + 60) + " h50 v400 h-50 Z"); });
  }
  s += R(x0, y + 18, x1 - x0, 42, CONC, 2.2) + '<path d="M' + x0 + ' ' + (y + 40) + ' L' + x1 + ' ' + (y + 40) + '" stroke="' + CONC_D + '" stroke-width="2"/>';   // deck slab
  s += R(x0, y, x1 - x0, 18, ASPH, 2.2);   // asphalt
  for (var d = x0; d < x1; d += 160) s += R(d, y + 6, 70, 4, "#e9e3d2", 0);
  if (o.lamps !== false) for (var lx = (o.lx || 60); lx < x1; lx += 520) if (lx > x0) {
    s += R(lx - 5, y - 330, 10, 330, "#8d887e", 1.6) + P("M" + (lx) + " " + (y - 330) + " Q" + (lx) + " " + (y - 360) + " " + (lx - 60) + " " + (y - 360) + " L" + (lx - 90) + " " + (y - 360), "none", 4) + R(lx - 118, y - 366, 40, 12, "#5b5650", 1.6, 3);
    if (o.night) s += '<path d="M' + (lx - 112) + ' ' + (y - 354) + ' L' + (lx - 180) + ' ' + y + ' L' + (lx - 18) + ' ' + y + ' L' + (lx - 84) + ' ' + (y - 354) + ' Z" fill="' + LAMP + '" opacity=".13"/>' + R(lx - 114, y - 356, 32, 5, LAMP, 0);
  }
  return s;
}

// ── the road seen along its length (a cross-section through the deck): two carriageways, the barrier in the middle,
// the slab and the underpass mouth below. y = road surface; x = barrier.
function deckCross(x, y, o) {
  o = o || {}; var s = "";
  s += R(-600, y + 60, 1840, 500, "#d9cfb8", 0) + '<rect x="-600" y="' + (y + 60) + '" width="1840" height="500" fill="url(#hatch)" opacity=".5"/>';
  s += R(x - 520, y + 70, 1040, 190, "#4b4741", 2.2) + R(x - 520, y + 250, 1040, 14, ASPH, 2) + T("Ashara underpass", x, y + 175, 26, "#e9e3d2", 800);
  s += R(-600, y + 16, 1840, 54, CONC, 2.2) + R(-600, y, 1840, 16, ASPH, 2.2);
  [-300, x + 260, x + 520].forEach(function (lx) { s += R(lx, y + 4, 60, 5, "#e9e3d2", 0); });
  s += jerseyEnd(x, y, o.sc || 1.15, o.crack);
  return s;
}

// ── fire: tongues of flame, red outside, then orange, a pale core (the reference's flame, v19), flickering with t ──
function flame(x, y, h, t, seed, wid) {
  seed = seed || 0; wid = wid || h * .5; if (h <= 1) return "";
  var fl = 1 + .08 * Math.sin(t * 9 + seed * 3) + .05 * Math.sin(t * 15.3 + seed), H = h * fl, sw = Math.sin(t * 5 + seed) * h * .06, s = "";
  function tongue(sc, col, sw2) { var w = wid * sc, hh = H * sc, tip = x + sw * sc * 1.6;
    return '<path d="M' + f(x - w) + ' ' + f(y) + ' Q' + f(x - w * 1.05) + ' ' + f(y - hh * .45) + ' ' + f(x - w * .35 + sw) + ' ' + f(y - hh * .7) + ' Q' + f(x - w * .25) + ' ' + f(y - hh * .52) + ' ' + f(x - w * .05) + ' ' + f(y - hh * .6) +
      ' Q' + f(tip - w * .2) + ' ' + f(y - hh * .85) + ' ' + f(tip) + ' ' + f(y - hh) + ' Q' + f(x + w * .55 + sw) + ' ' + f(y - hh * .72) + ' ' + f(x + w * .4) + ' ' + f(y - hh * .5) + ' Q' + f(x + w * .62) + ' ' + f(y - hh * .6) + ' ' + f(x + w * .78 + sw) + ' ' + f(y - hh * .66) +
      ' Q' + f(x + w * 1.08) + ' ' + f(y - hh * .35) + ' ' + f(x + w) + ' ' + f(y) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="' + sw2 + '" stroke-linejoin="round"/>'; }
  return tongue(1, FIRE_O, 2) + tongue(.66, FIRE_M, 1.4) + tongue(.36, FIRE_I, 1.1);
}
// a row of flames from x0 to x1 at y; k 0..1 = how far the fire has run (from `from`: "l" or "r"); h = height
function fireRow(x0, x1, y, h, t, k, from, gap) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; gap = gap || h * .55; var s = "", n = Math.max(1, Math.floor((x1 - x0) / gap));
  for (var i = 0; i <= n; i++) { var u = i / n, x = lerp(x0, x1, u), reach = from === "r" ? 1 - u : from === "c" ? Math.abs(u - .5) * 2 : u, kk = clamp((k - reach * .9) / .1);
    if (kk > 0) s += flame(x + (hash(i + 3) - .5) * gap * .5, y, h * (.6 + .5 * hash(i)) * kk, t, i * 1.7, gap * .75); }
  return s;
}
// a warm glow behind a fire
function glow(x, y, r, k) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + FIRE_I + '" opacity="' + f(.22 * k) + '" filter="url(#soft)"/>'; }
// smoke: dark puffs rising and drifting with the wind (dx per second)
function smoke(x, y, w, h, t, k, dx, n) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = ""; n = n || 10; dx = dx == null ? 18 : dx;
  for (var i = 0; i < n; i++) { var p = (t * .16 + hash(i)) % 1, px = x + (hash(i + 9) - .5) * w + p * dx * 6, py = y - p * h, r = (18 + 30 * p) * (w / 300 + .6);
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r) + '" fill="' + SMOKE + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(k * (.85 - .6 * p)) + '"/>'; }
  return s;
}
// fuel spilt on the road from the side: a thin shiny layer from x0 growing to x1 (k)
function spill(x0, x1, y, k, t) { k = clamp(k); if (k <= 0) return ""; var xe = lerp(x0, x1, k), s = '<path d="M' + f(x0) + ' ' + f(y) + ' Q' + f(x0) + ' ' + f(y - 7) + ' ' + f(x0 + 20) + ' ' + f(y - 7) + ' L' + f(xe - 16) + ' ' + f(y - 6) + ' Q' + f(xe) + ' ' + f(y - 5) + ' ' + f(xe + 6) + ' ' + f(y) + ' Z" fill="' + FUEL + '" stroke="' + INK + '" stroke-width="1.6"/>';
  for (var i = 0; i < 6; i++) { var gx = lerp(x0 + 30, xe - 30, (i + .5) / 6 + .03 * Math.sin(t * 2 + i)); if (gx < xe - 20) s += '<path d="M' + f(gx) + ' ' + f(y - 5) + ' l14 0" stroke="#e8dcb0" stroke-width="1.6" stroke-linecap="round"/>'; }
  return s;
}
// fuel vapour: a pale blue layer that hugs the ground and creeps forward (k), with small molecules drifting in it
function vapor(x0, x1, y, h, k, t, from) {
  k = clamp(k); if (k <= 0) return ""; var xe = from === "r" ? lerp(x1, x0, k) : lerp(x0, x1, k), a = Math.min(x0, xe), b = Math.max(x0, xe), s = "";
  if (from === "r") { a = xe; b = x1; }
  var d = "M" + f(a) + " " + f(y); for (var x = a; x <= b; x += 14) d += " L" + f(x) + " " + f(y - h * (.75 + .25 * Math.sin(x * .03 - t * 2.2)) * clamp((b - x) / 60 + .2) * clamp((x - a) / 60 + .2)); d += " L" + f(b) + " " + f(y) + " Z";
  s += '<path d="' + d + '" fill="' + VAPOR + '" opacity=".28" stroke="' + VAPOR + '" stroke-width="2" stroke-dasharray="6 5"/>';
  for (var i = 0; i < Math.floor((b - a) / 26); i++) { var mx = a + 13 + i * 26 + 6 * Math.sin(t * 1.7 + i), my = y - h * (.2 + .5 * hash(i)) + 3 * Math.sin(t * 2.3 + i * 2); s += C(mx, my, 4, VAPOR, 1.2); }
  return s;
}
// a spark: a small star of orange strokes that flashes
function spark(x, y, k, t, sc) { k = clamp(k); if (k <= 0) return ""; sc = (sc || 1) * (1 + .25 * Math.sin(t * 30)); var s = "";
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + .3, r1 = 6 * sc, r2 = (i % 2 ? 18 : 28) * sc; s += '<path d="M' + f(x + Math.cos(a) * r1) + ' ' + f(y + Math.sin(a) * r1) + ' L' + f(x + Math.cos(a) * r2) + ' ' + f(y + Math.sin(a) * r2) + '" stroke="' + (i % 2 ? FIRE_I : ORANGE) + '" stroke-width="3.2" stroke-linecap="round"/>'; }
  return G("", s + C(x, y, 5 * sc, FIRE_I, 1.4), k); }
// the night: a blue-grey wash over the drawing (the story part of the episode); k 0..1
function nightWash(k) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; return '<rect x="-2000" y="-2000" width="5000" height="5000" fill="' + NIGHT + '" opacity="' + f(.42 * k) + '"/>'; }
// the night sky behind: stars and a city skyline far away (Imbaba and Warraq blocks)
function skyline(y, t, x0, x1) {
  var s = ""; x0 = x0 == null ? -900 : x0; x1 = x1 == null ? 1700 : x1;
  for (var x = x0, i = 0; x < x1; i++) { var w = 60 + hash(i) * 70, h = 90 + hash(i + 40) * 170; s += R(x, y - h, w, h, "#c2b9a4", 1.6);
    for (var wy = y - h + 16; wy < y - 14; wy += 26) for (var wx = x + 10; wx < x + w - 14; wx += 22) if (hash(i * 31 + wx * 7 + wy) > .62) s += R(wx, wy, 9, 12, LAMP, 0, 0, ' opacity="' + f(.55 + .35 * Math.sin(t * .7 + wx)) + '"');
    x += w + 6; }
  return s;
}

// ── props for the first-aid part ──
function phone(x, y, sc, ang, scr) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ") scale(" + (sc || 1) + ")", R(-16, -30, 32, 60, "#2f2b27", 2, 6) + R(-12, -24, 24, 46, scr || "#9fb3bd", 1, 2) + C(0, 26, 2, "#8d887e", 0)); }
function blanket(x, y, w, h, col) { col = col || "#8e6a4e"; var s = P("M" + f(x) + " " + f(y) + " Q" + f(x + w * .25) + " " + f(y - h) + " " + f(x + w * .5) + " " + f(y - h * .9) + " Q" + f(x + w * .78) + " " + f(y - h * 1.05) + " " + f(x + w) + " " + f(y) + " Z", col, 2.2);
  for (var i = 1; i < 6; i++) s += '<path d="M' + f(x + w * i / 6) + ' ' + f(y - h * .85) + ' L' + f(x + w * i / 6 + 6) + ' ' + f(y - 4) + '" stroke="' + INK + '" stroke-width="1" opacity=".5"/>'; return s; }
function tap(x, y, k, t) {   // a kitchen tap with running water (k = flow)
  var s = R(x - 60, y - 22, 120, 22, "#a9a59c", 2, 6) + P("M" + (x + 50) + " " + (y - 22) + " L" + (x + 50) + " " + (y - 70) + " Q" + (x + 50) + " " + (y - 110) + " " + (x) + " " + (y - 110) + " L" + (x - 30) + " " + (y - 110) + " L" + (x - 30) + " " + (y - 92) + " L" + (x) + " " + (y - 92) + " Q" + (x + 30) + " " + (y - 92) + " " + (x + 30) + " " + (y - 66) + " L" + (x + 30) + " " + (y - 22) + " Z", "#c6c3bb", 2);
  if (k > 0) { s += R(x - 28, y - 92, 16, 300 * clamp(k), "#9fbfd0", 1.4) ; for (var i = 0; i < 5; i++) { var p = (t * 1.6 + i / 5) % 1; s += '<path d="M' + (x - 22) + ' ' + f(y - 80 + p * 280 * clamp(k)) + ' l0 18" stroke="#e8f0f2" stroke-width="2" stroke-linecap="round"/>'; } }
  return s;
}
function toothpaste(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") rotate(-18) scale(" + (sc || 1) + ")", P("M-70 -22 L50 -26 L70 -14 L70 14 L50 26 L-70 22 Z", "#f1efe8", 2.2) + R(70, -10, 26, 20, "#4a6f8a", 2, 3) + '<path d="M-40 -23 L-40 23" stroke="' + ORANGE + '" stroke-width="10"/>' + '<path d="M-70 -22 L-82 -24 L-82 24 L-70 22" fill="none" stroke="' + INK + '" stroke-width="2"/>'); }
function iceCube(x, y, s) { s = s || 40; return G("translate(" + f(x) + " " + f(y) + ")", P("M" + -s + " " + -s * .4 + " L0 " + -s + " L" + s + " " + -s * .4 + " L" + s + " " + s * .6 + " L0 " + s + " L" + -s + " " + s * .6 + " Z", "#d7e6ec", 2.2) + '<path d="M' + -s + ' ' + -s * .4 + ' L0 ' + s * .2 + ' L' + s + ' ' + -s * .4 + ' M0 ' + s * .2 + ' L0 ' + s + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/><path d="M' + (-s * .6) + ' ' + (-s * .3) + ' l12 -6" stroke="#fff" stroke-width="3"/>'); }
// a fire engine of the Civil Protection: red, 8 m, ladder on the roof, side lockers (front faces left)
function fireTruck(o) {
  o = o || {}; var s = "", RD = "#b8402f", RDD = "#8f3022";
  s += '<ellipse cx="400" cy="2" rx="400" ry="10" fill="' + INK + '" opacity=".18"/>';
  s += P("M6 -60 L6 -250 Q8 -282 40 -284 L190 -286 L196 -60 Z", RD, 2.4) + P("M196 -60 L196 -270 L800 -270 L800 -60 Z", RD, 2.4);
  s += P("M14 -250 Q16 -274 42 -276 L110 -276 L110 -170 L14 -170 Z", GLASS2, 2) + P("M120 -276 L184 -276 L184 -170 L120 -170 Z", GLASS2, 2);
  for (var i = 0; i < 4; i++) s += R(214 + i * 142, -250, 128, 150, RDD, 2) + '<path d="M' + (214 + i * 142) + ' -175 L' + (342 + i * 142) + ' -175" stroke="' + INK + '" stroke-width="1.2"/>';
  s += '<path d="M6 -120 L800 -120" stroke="#f0efe8" stroke-width="10"/><path d="M6 -120 L800 -120" stroke="' + INK + '" stroke-width="1" />';
  s += R(200, -300, 560, 14, "#d6d2c6", 2); for (var r = 220; r < 760; r += 36) s += '<path d="M' + r + ' -300 L' + r + ' -286" stroke="' + INK + '" stroke-width="1.6"/>';
  s += R(40, -300, 90, 16, "#4a6f8a", 1.8, 4) + R(52, -298, 20, 12, o.flash && Math.floor(o.t * 6) % 2 ? "#7fb0e0" : "#4a6f8a", 0);
  s += R(4, -84, 70, 24, "#8d887e", 1.8, 3) + R(8, -150, 30, 18, LAMP, 1.4);
  s += wheelS(110, -46, 46, { spokes: 8 }) + wheelS(560, -46, 46, { spokes: 8 }) + wheelS(680, -46, 46, { spokes: 8 });
  return s;
}
