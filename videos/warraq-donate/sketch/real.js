/* «اتبرع لمصابي حريق الوراق» — drawings from real photos (refs/SOURCES.md), in the «اسكتش» hand.
   Loaded before scenes.js; uses the sketch helpers at draw time. */

// ── the Egyptian Ambulance Organization's Mercedes Sprinter (Wikimedia «Ambulance in Egypt 02»): yellow, high roof, a blue
// band along the belt line and one under the roof, a blue light bar, the star of life, «إسعاف» and «☎ 123».
// Side view, front to the left; local cm: 590 long, 285 high, wheelbase 366, wheels Ø 70. o: {t, spin, flash}
function ambulanceEG(o) {
  o = o || {}; var Y = "#e8cc3a", YD = "#c9ab22", B = "#2f4fa8", s = "";
  s += '<ellipse cx="295" cy="2" rx="300" ry="10" fill="' + INK + '" opacity=".18"/>';
  var body = "M6 -36 L4 -96 Q6 -118 30 -126 L64 -134 L118 -228 Q126 -240 146 -242 L560 -250 Q586 -250 588 -228 L590 -50 Q590 -38 578 -37 L506 -37 A44 44 0 0 0 418 -37 L148 -37 A44 44 0 0 0 60 -37 Z";
  s += P(body, Y, 2.6);
  s += '<path d="M8 -46 L590 -46 L590 -36 L8 -36 Z" fill="#5b5650"/>' + P("M4 -60 L60 -60 L60 -37 L6 -37 Z", "#5b5650", 1.6) + P("M506 -60 L590 -60 L590 -37 L506 -37 Z", "#5b5650", 1.6);   // grey skirts and bumpers
  s += R(6, -104, 584, 16, B, 1.6) + R(6, -84, 584, 5, B, 0) + R(150, -232, 438, 12, B, 1.4);   // the blue bands
  s += P("M74 -132 L120 -220 L176 -220 L176 -132 Z", GLASS2, 2) + '<path d="M90 -140 L124 -206 L132 -206 L98 -140 Z" fill="#fff" opacity=".45"/>';   // cab window
  s += P("M64 -134 L112 -224 Q116 -232 126 -234 L126 -226 L80 -136 Z", YD, 1.4);   // A-pillar
  s += '<path d="M186 -126 L186 -50 M300 -232 L300 -50 M520 -232 L520 -50" stroke="' + INK + '" stroke-width="1.6"/>' + R(150, -116, 16, 7, YD, 1.1, 2) + R(310, -116, 16, 7, YD, 1.1, 2);   // doors, handles
  s += R(318, -214, 180, 86, "#e2c432", 1.2, 4);   // the side panel
  s += G("translate(355 -176)", C(0, 0, 22, "#fff", 1.6) + '<path d="M0 -16 V16 M-14 -8 L14 8 M-14 8 L14 -8" stroke="' + B + '" stroke-width="6" stroke-linecap="round"/>');   // star of life
  s += T("إسعاف", 440, -60, 30, B, 900) + T("☎ 123", 250, -60, 26, B, 900);
  s += P("M8 -96 Q10 -112 26 -116 L48 -118 L42 -96 Z", "#f3eed8", 1.6) + R(4, -72, 48, 12, "#bdb7aa", 1.2, 2);   // headlamp, grille
  s += R(578, -170, 12, 50, "#c93c2a", 1.4, 2);   // tail lamp
  var fl = o.flash && Math.floor((o.t || 0) * 6) % 2;
  s += R(150, -262, 70, 14, fl ? "#7fb0e0" : B, 1.6, 4) + R(500, -262, 60, 14, fl ? B : "#7fb0e0", 1.6, 4) + R(230, -258, 250, 8, "#e9e3d2", 1.2, 3);
  if (fl) s += '<circle cx="185" cy="-255" r="34" fill="#7fb0e0" opacity=".3" filter="url(#soft)"/>';
  s += P("M64 -134 L52 -138 Q46 -126 52 -118 L64 -120 Z", Y, 1.6);   // mirror
  s += wheelS(104, -36, 36, { rot: (o.t || 0) * (o.spin || 0), spokes: 6 }) + wheelS(462, -36, 36, { rot: (o.t || 0) * (o.spin || 0), spokes: 6 });
  return s;
}

// ── Qasr El-Ainy, Cairo University (Wikimedia «قصر العيني»): the stone front with a columned portico and pediment, long
// wings with rows of windows, and the tall clock tower: square base with the clock, a drum ringed with columns, a balcony,
// a small drum, a terracotta dome and a crescent on top. cx, gy (ground), s scale.
function qasrAiny(cx, gy, s) {
  var ST = "#dcc8a4", STD = "#c4ae88", g = "";
  function W(x, y, w, h) { return R(x, y, w, h, "#6f7f86", 1.4) + '<path d="M' + x + ' ' + (y + h / 2) + ' h' + w + '" stroke="#9fb3bd" stroke-width="1"/>'; }
  // the wings
  g += R(-420, -190, 840, 190, ST, 2.6) + R(-420, -196, 840, 12, STD, 2) + '<path d="M-420 -120 H420" stroke="' + STD + '" stroke-width="3"/>';
  for (var i = 0; i < 12; i++) { var x = -400 + i * 70; if (Math.abs(x + 15) < 130) continue; g += W(x, -176, 30, 40) + W(x, -100, 30, 50); }
  // the portico: four columns, pediment, steps, the door
  g += P("M-130 -210 L0 -262 L130 -210 Z", ST, 2.4) + '<path d="M-108 -214 L0 -255 L108 -214" stroke="' + STD + '" stroke-width="2" fill="none"/>' + R(-130, -212, 260, 16, STD, 2);
  for (var c = 0; c < 4; c++) { var px = -105 + c * 70; g += R(px - 11, -196, 22, 180, "#e6d6b6", 2) + R(px - 15, -200, 30, 8, STD, 1.6) + R(px - 15, -18, 30, 8, STD, 1.6); }
  g += R(-24, -110, 48, 100, "#3a3631", 2) + R(-150, -10, 300, 10, STD, 2);
  // the clock tower
  g += R(-58, -380, 116, 170, ST, 2.6) + C(0, -300, 22, "#f4f2ec", 2.4) + '<path d="M0 -300 L0 -316 M0 -300 L10 -296" stroke="' + INK + '" stroke-width="2.4"/>';
  g += R(-64, -392, 128, 14, STD, 2);
  g += R(-48, -490, 96, 98, "#e6d6b6", 2.4); for (var k = 0; k < 6; k++) g += R(-44 + k * 16, -484, 7, 88, "#cdb994", 1.2);   // the drum with its columns
  g += R(-60, -500, 120, 12, STD, 2) + '<path d="M-58 -512 H58 M-58 -512 V-500 M58 -512 V-500 M-30 -512 V-500 M0 -512 V-500 M30 -512 V-500" stroke="' + INK + '" stroke-width="1.6"/>';   // balcony rail
  g += R(-34, -548, 68, 48, ST, 2.2) + R(-8, -540, 16, 26, "#6f7f86", 1.4, 8) + R(-28, -540, 10, 22, "#6f7f86", 1.2, 5) + R(18, -540, 10, 22, "#6f7f86", 1.2, 5);
  g += P("M-40 -548 Q-40 -610 0 -616 Q40 -610 40 -548 Z", "#b5654a", 2.4) + '<path d="M-20 -560 Q-18 -596 0 -606" stroke="#cf8a6c" stroke-width="3" fill="none"/>';   // the dome
  g += R(-4, -640, 8, 26, "#8d6a3a", 1.4) + C(0, -646, 7, "#b08a4a", 1.4) + '<path d="M-10 -670 Q0 -652 10 -670 Q0 -660 -10 -670 Z" fill="#b08a4a" stroke="' + INK + '" stroke-width="1.4"/>';   // the crescent
  // trees in front (the clipped ficus of the photo)
  [[-250, -40], [180, -30], [330, -50]].forEach(function (p, i) { g += R(p[0] - 6, p[1], 12, -p[1], "#6b4f36", 1.6) + C(p[0] - 30, p[1] - 20, 44, "#5e7a46", 2) + C(p[0] + 20, p[1] - 40, 50, "#6d8a52", 2) + C(p[0] + 40, p[1], 36, "#5e7a46", 2); });
  return G("translate(" + f(cx) + " " + f(gy) + ") scale(" + (s || 1) + ")", g);
}

// ── a burns intensive-care room: the patient under a sheet and gauze, a radiant warmer over the bed, the monitor, two
// infusion pumps on a pole, the gas panel on the wall, a glass partition; a nurse in gown, cap and mask. o: {glass, nurse}
function burnICU(t, o) {
  o = o || {}; var s = '<rect x="-600" y="-600" width="1840" height="1240" fill="#dfe8e4"/>' + R(-600, 640, 1840, 600, "#c9d3cf", 0) + '<path d="M-600 640 H1240" stroke="' + INK + '" stroke-width="2.4"/>';
  s += R(-10, 210, 220, 60, "#c6c3bb", 2) + C(30, 240, 9, "#3f8a4e", 1.4) + C(70, 240, 9, "#4a6f8a", 1.4) + C(110, 240, 9, "#f4f2ec", 1.4) + C(150, 240, 9, "#c93c2a", 1.4);   // the gas panel
  // the bed
  s += R(140, 500, 440, 26, "#c6c3bb", 2.4) + R(150, 526, 12, 114, "#8d887e", 1.6) + R(558, 526, 12, 114, "#8d887e", 1.6) + R(130, 420, 14, 220, "#8d887e", 1.6) + R(146, 472, 430, 30, "#f4f2ec", 2.2, 10);
  s += R(156, 452, 86, 24, "#f4f2ec", 2, 12);
  var po = { x: 340, y: 470, s: .95, dir: 1, rot: -90, legs: [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms: [{ sh: 6, el: 8, hand: "relaxed" }, { sh: -6, el: 8, hand: "relaxed" }], face: { eyes: .1, brows: "worried", mouth: "neutral" }, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } } };
  s += PERSON.side(Object.assign({ breath: .5 + .5 * Math.sin(t * 1.4) }, po)).svg;
  s += P("M250 440 Q400 424 570 452 L570 478 L250 478 Z", "#e7eef2", 2.2);
  for (var g = 0; g < 6; g++) s += R(226 + g * 16, 446, 12, 28, "#f7f4ea", 1.2, 3);   // gauze on the arm
  s += R(180, 448, 36, 26, "#f7f4ea", 1.2, 8);   // gauze on the face side
  // the radiant warmer over the bed: a stand, an arm, the heater head glowing
  s += R(590, 160, 14, 480, "#8d887e", 1.8) + R(320, 160, 284, 14, "#8d887e", 1.8) + R(300, 170, 160, 34, "#5b5650", 2, 6) + R(310, 200, 140, 8, ORANGE, 1.2);
  s += '<path d="M310 208 L250 440 L520 440 L450 208 Z" fill="' + FIRE_I + '" opacity="' + f(.14 + .04 * Math.sin(t * 3)) + '"/>';
  // the monitor and the infusion pole
  var mx = 70, my = 330, d = "M" + (mx - 52) + " " + (my - 4); for (var i = 0; i <= 104; i += 4) { var ph = ((i + t * 60) % 52) / 52, v = ph > .4 && ph < .46 ? -20 : ph > .46 && ph < .5 ? 10 : 0; d += " L" + (mx - 52 + i) + " " + f(my - 4 + v); }
  s += R(mx - 64, my - 44, 128, 92, "#2f2b27", 2.4, 6) + R(mx - 56, my - 36, 112, 66, "#203028", 1.2) + '<path d="' + d + '" stroke="#7fd08a" stroke-width="2" fill="none"/>' + N("98", mx + 34, my + 22, 14, "#7fd08a") + R(mx - 6, my + 48, 12, 260, "#8d887e", 1.6);
  s += R(-60, 200, 8, 440, "#8d887e", 1.6) + R(-90, 300, 64, 44, "#e9e3d4", 1.8, 4) + R(-90, 360, 64, 44, "#e9e3d4", 1.8, 4) + N("40", -58, 330, 14, INK) + N("25", -58, 390, 14, INK) + P("M-76 200 L-38 200 L-42 260 L-72 260 Z", "#d7e6ec", 1.8) + '<path d="M-57 260 Q-40 420 220 470" stroke="' + INK + '" stroke-width="1.3" fill="none"/>';
  // the nurse: gown, cap and mask
  if (o.nurse) { var nx = 610; s += PERSON.front({ x: nx, y: 640 - 210 * 1.02, s: 1.02, outfit: { base: "doctor", tie: false, colors: { coat: "#8fc0b8", coatD: "#6fa098", shirt: "#8fc0b8", shirtD: "#6fa098", pants: "#8fc0b8", pantsD: "#6fa098" } }, face: { eyes: blink(t, 1), brows: "worried" }, head: { turn: -.4 }, arms: [{ to: [nx - 120, 470], hand: "open" }, { rel: [20, 150], hand: "relaxed" }], breath: .5 + .5 * Math.sin(t * 1.6) }).svg;
    var hy = 640 - 210 * 1.02 - 166 * 1.02; s += P("M" + (nx - 22) + " " + f(hy + 6) + " Q" + nx + " " + f(hy + 2) + " " + (nx + 22) + " " + f(hy + 6) + " L" + (nx + 20) + " " + f(hy + 24) + " Q" + nx + " " + f(hy + 32) + " " + (nx - 20) + " " + f(hy + 24) + " Z", "#d7e6ec", 1.6) + P("M" + (nx - 26) + " " + f(hy - 18) + " Q" + nx + " " + f(hy - 42) + " " + (nx + 26) + " " + f(hy - 18) + " Z", "#8fc0b8", 1.6); }
  // the glass partition
  if (o.glass) s += '<rect x="-30" y="120" width="680" height="520" fill="#cfe3ea" opacity="' + f(.22 * o.glass) + '" stroke="' + BLUE + '" stroke-width="' + f(5 * o.glass) + '"/><path d="M40 180 L120 140 M60 230 L180 160" stroke="#fff" stroke-width="5" opacity="' + f(.6 * o.glass) + '"/>';
  return s;
}
