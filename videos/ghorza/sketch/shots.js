// ── «الغرزة» — shots. Drawings in draw.js (GZ.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (~1.8 s) in or out. Life comes from the
// drawing: lane dashes running down (the camera travels with the traffic), wheels, blinkers, brake lights, flames, breathing.
var Z = GZ, LANE = Z.LANE, CC = Z.CARC, SPEED = 130;                    // px/s the lane dashes run down the panel
var OV = [320, 430, .8];                                               // overview of the road, plan view
function chunkT(i, j) { var l = LN[i], c = window.CHUNKS[i]; return l.start + (l.end - l.start) * (c[j] || 0); }
function road(t, o) { return Z.road(Object.assign({ scroll: t * SPEED }, o || {})); }
function kf(K, t) {   // keyframes [[t, x, y, ang?], …] → eased in between
  if (t <= K[0][0]) return K[0].slice(1); for (var i = 1; i < K.length; i++) if (t < K[i][0]) { var a = K[i - 1], b = K[i], k = ease((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] || 0, b[3] || 0, k)]; }
  return K[K.length - 1].slice(1);
}
// ── scene A: the Warraq crash in plan view. The tanker in lane 2; the young man weaves from lane 0 across to lane 3 and cuts
//    left into the tanker's right rear (prosecution: the left front of his car hit the right rear of the tanker).
var T6 = chunkT(6, 1) + .2, HIT = T6 + .55;                            // the cut, the contact
var WK = [[LN[4].start, LANE(0), 720], [chunkT(4, 2), LANE(0), 700], [chunkT(4, 2) + .8, LANE(1), 660], [LN[5].start + .6, LANE(1), 640],
  [chunkT(5, 1), LANE(2), 610], [chunkT(5, 1) + .8, LANE(3), 590], [LN[6].start + .6, LANE(3), 565], [T6, LANE(3) - 4, 548], [HIT, 430, 524]];
function weaver(t) {
  if (t < HIT) { var p = kf(WK, t), q = kf(WK, t + .05), ang = Math.atan2(q[0] - p[0], -(q[1] - p[1]) + SPEED * 2.2 * .05) * 57.3; if (t > T6) ang = lerp(ang, -24, clamp((t - T6) / (HIT - T6))); return [p[0], p[1], ang]; }
  var k = ease((t - HIT) / 1.1); return [lerp(430, 470, k), lerp(524, 590, k), lerp(-24, 38, k)];   // he loses the wheel and slews right
}
function tankerAt(t) { var k = ease((t - HIT - .15) / 1.2); return { x: LANE(2) + 70 * k, a: 9 * k }; }
var OTHERS = [[0, 330, 3], [0, 560, 0], [1, 200, 1], [1, 900, 4], [2, 800, 2], [3, 120, 5]];
function others(t, o) { o = o || {}; return OTHERS.map(function (c, i) { return Z.carTop(LANE(c[0]), c[1] + 6 * Math.sin(t * .6 + i), CC[c[2]], 0, { ring: o.ring ? o.ring : 0, brake: o.brake && o.brake(i) }); }).join(""); }
function sceneA(t, o) {
  o = o || {}; var w = weaver(t), tk = tankerAt(t), s = road(t) + others(t, o) + Z.tankerTop(tk.x, 40, tk.a, { brake: t > HIT });
  if (o.path) s += draw("M150 760 C150 700 250 690 250 650 S350 610 350 600 S450 590 450 560", o.path, ORANGE, 4, ' stroke-dasharray="12 9"');
  s += Z.carTop(w[0], w[1], ORANGE, w[2], { ring: o.wring || 0, blink: t > chunkT(4, 2) && t < T6 ? (t < HIT ? 1 : 0) : 0 });
  if (t > HIT - .05) s += Z.burst(LANE(2) + 36 + tk.x - LANE(2), 470, clamp((t - HIT) / .5)) + Z.burst(LANE(2) + 40 + tk.x - LANE(2), 360, clamp((t - HIT - .35) / .5));
  return s;
}
var CA = [400, 520, 1.9];
function spd(x, y, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", '<rect x="-92" y="-30" width="184" height="52" fill="' + INK + '"/>' + N("110", 40, 10, 30, "#fff") + T("كم/س", -36, 8, 24, "#fff", 800)); }                                              // close on the tanker's right rear
shot(4, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + sceneA(t) + tag("الدائري · الوراق", 320, 0, at(u, .2, .3), 26); });
shot([4, 2], still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + sceneA(t, { wring: at(u, 0, .4) }) + tag("الدائري · الوراق", 320, 0, 1, 26); });
shot(5, fly(OV, [300, 560, 1.25], 1.8), function (u, d, t) { return paper() + sceneA(t, { wring: 1 }) + spd(300, 400, at(u, .6, .3)); });
shot([5, 1], still(300, 560, 1.25), function (u, d, t) { return paper() + sceneA(t, { path: at(u, 0, d), wring: 1 }) + spd(300, 400, 1); });
shot(6, fly([300, 560, 1.25], CA, 1.8), function (u, d, t) { return paper() + sceneA(t) + label(350, 300, 200, 250, "ناقلة بنزين", OLIVE, at(u, .3, .5), 22); });
shot([6, 1], still(CA[0], CA[1], CA[2]), function (u, d, t) { return paper() + sceneA(t) + label(386, 478, 250, 430, "ضهرها من اليمين", ORANGE, at(u, .1, .5), 16); });
shot([6, 2], still(CA[0], CA[1], CA[2]), function (u, d, t) { return paper() + sceneA(t) + T("فرقع!", 470, 380, 28, ORANGE, 800); });

// ── scene B: section across the road, seen from behind: the tanker slews into the barrier and rolls onto its side; the
//    fuel runs out and catches fire (kept restrained: flames and smoke, no people).
var GY = 560, SB = 100;                                               // ground line, px per metre
function sceneB(u0, k) {   // k: {slide, roll, spill, fire}
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 6; i++) s += '<rect x="' + (-120 + i * 140) + '" y="' + (GY + 4) + '" width="60" height="6" fill="#f7f3e8"/>';
  s += Z.jerseySection(560, GY, SB, 1) + label(590, GY - 50, 610, GY - 180, "الحاجز الخرساني", OLIVE, k.lab == null ? 1 : k.lab, 15);
  var x = lerp(220, 310, k.slide || 0), roll = k.roll || 0;
  s += Z.spill(x + 120, GY + 22, 230, k.spill || 0, .18);
  s += Z.tankerRear(x, GY - (roll ? 0 : 0), SB, roll > 0 ? lerp(0, 12, Math.min(1, roll * 3)) - (roll > .33 ? 0 : 0) : 0, 1);
  return s;
}
function rolled(x, k) { return Z.tankerRear(x, GY, SB, -90 * ease(k), -1); }   // onto its left side
shot(7, still(320, 430, 1), function (u, d, t) {
  var sl = at(u, .2, 1.1), s = sceneB(u, { slide: sl, lab: at(u, .8, .5) });
  if (u > 1.2) s += Z.burst(540, GY - 120, clamp((u - 1.2) / .4));
  return paper() + s;
});
shot([7, 2], still(320, 430, 1), function (u, d, t) {
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>' + Z.jerseySection(560, GY, SB, 1);
  return paper() + s + rolled(500, at(u, 0, .9)) + G("", T("اتقلبت", 200, 200, 34, ORANGE, 800), at(u, .7, .3));
});
function down(u, sp, fi) {
  var s = '<rect x="-600" y="' + GY + '" width="1840" height="800" fill="' + Z.ASPH + '" stroke="' + INK + '" stroke-width="2"/>' + Z.jerseySection(560, GY, SB, 1);
  s += Z.spill(260, GY + 30, 300, sp, .2) + rolled(500, 1);
  if (sp > .2) s += draw("M250 " + (GY - 60) + " Q230 " + (GY - 20) + " 210 " + (GY + 14), sp, "#7d6a8a", 6);
  return s + Z.flames(260, GY + 24, 340, 170, fi);
}
shot([7, 3], still(320, 430, 1), function (u, d, t) { return paper() + down(u, at(u, 0, d + .4), 0) + label(160, GY + 40, 80, GY + 140, "بنزين", "#7d6a8a", at(u, .3, .5), 18); });
shot([7, 4], still(320, 430, 1), function (u, d, t) { return paper() + down(u, 1, at(u, 0, .8)); });

// ── scene C: plan view, pulled back: the overturned tanker by the barrier, and the jam behind it. 27 cars burnt, 31 dead.
var JAM = []; (function () { for (var r = 0; r < 7; r++) for (var l = 0; l < 4; l++) JAM.push([LANE(l), 640 + r * 150 + (l % 2) * 40 + (r * 13 % 30), (r * 4 + l) % 6]); })();
function sceneC(t, n) {
  var s = Z.road({ scroll: 0, y0: -400, y1: 1900 });
  s += Z.spill(420, 260, 150, 1, 1.8) + '<g style="filter:saturate(.2) brightness(.7)">' + Z.tankerTop(455, 20, 6) + '</g>' + Z.flames(430, 470, 160, 120, .9) + Z.flames(440, 250, 120, 90, .8);
  JAM.forEach(function (c, i) { s += Z.carTop(c[0], c[1], CC[c[2]], 0, { burnt: i < n }); if (i < n && i % 3 === 0) s += Z.flames(c[0], c[1] - 20, 40, 40, .7); });
  return s;
}
var CC1 = [320, 760, .56];
shot(8, still(CC1[0], CC1[1], CC1[2]), function (u, d, t) { var n = Math.round(27 * at(u, .3, 1.8)); return paper() + sceneC(t, n); });
shot([8, 2], still(CC1[0], CC1[1], CC1[2]), function (u, d, t) { return paper() + dim(at(u, 0, .4), sceneC(t, 27)); });
hud(8, 9, function (u, t) { var n = Math.round(27 * clamp((t - chunkT(8, 1)) / 1.6)); return t > chunkT(8, 1) - .1 ? numBox(String(n) + " عربية", 170, 80, 1, 28, true) : ""; });
hud([8, 2], 9, function (u, t) { return bigNum("31", "واحد راحوا", 320, 420, ease(u / .5), ORANGE, 120); });

// ── 9–10 · what did the weave buy him? 20 km at 110 instead of 100: 10:55 instead of 12:00
shot(9, still(320, 393, 1), function (u, d, t) { return paper() + Z.watch(320, 360, 150, (t * .25) % 1) + G("", T("؟", 320, 640, 120, ORANGE, 800), at(u, .4, .3)); });
function bar(y, lab, kmh, mins, k, col) {
  var w = 460 * (mins / 12), s = T(lab, 540, y - 18, 28, INK, 800, "start") + R(80, y, 460, 44, "#e9dfc7", 1.6) + R(80, y, w * k, 44, col, 1.6);
  return s + (k > .98 ? N(mins === 12 ? "12:00" : "10:55", 90, y + 90, 34, INK, "start") + T("دقيقة", 200, y + 90, 22, INK, 700, "end") : "");
}
shot(10, still(320, 393, 1), function (u, d, t) { return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, at(u, .2, 1.6), "#8aa0ad"); });
shot([10, 1], still(320, 393, 1), function (u, d, t) { return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, 1, "#8aa0ad") + bar(460, "بـ110 كم/س", 110, 10.92, at(u, 0, 1.4), ORANGE); });
shot([10, 2], still(320, 393, 1), function (u, d, t) {
  var x1 = 80 + 460 * 10.92 / 12, x2 = 540;
  return paper() + T("20 كيلو", 320, 160, 40, INK, 800) + bar(300, "بـ100 كم/س", 100, 12, 1, "#8aa0ad") + bar(460, "بـ110 كم/س", 110, 10.92, 1, ORANGE) +
    G("", P("M" + f(x1) + " 520 V600 M" + x2 + " 520 V600 M" + f(x1) + " 590 H" + x2, "none", 2.4) + T("دقيقة واحدة بس", (x1 + x2) / 2 - 30, 650, 34, ORANGE, 800, "start"), at(u, .2, .4));
});

// ── 11–14 · the rule: at 110 a car covers about 30 m a second; a driver needs about 1.5 s to see and brake → about 45 m
hud(11, 15, function (u, t) { return tag("قاعدة", 560, 60, ease(u / .3), 22, ORANGE); });
shot(11, still(320, 393, 1), function (u, d, t) { return paper() + Z.watch(320, 380, 120, (t * .5) % 1) + tag("خليك فاكرها", 320, 620, at(u, .8, .3), 28, INK); });
var SV = 16, GR = 560;
function lamps(t, s) { var g = ""; for (var x = -400 + ((-t * 160) % (40 * s) + 40 * s) % (40 * s); x < 1040; x += 40 * s) g += P("M" + f(x) + " " + GR + " V" + (GR - 12 * s) + " h" + f(2.2 * s), "none", 3) + R(x + 2.2 * s - 6, GR - 12 * s - 2, 14, 6, "#f4eed9", 1.4); return g; }                                                // side view: 12 px per metre, ground at y 520
function sideRoad(t) { var s = R(-400, GR, 1440, 200, Z.ASPH, 2); for (var x = -400 + ((-t * 160) % 120 + 120) % 120; x < 1040; x += 120) s += '<rect x="' + f(x) + '" y="' + (GR + 30) + '" width="50" height="6" fill="#f7f3e8"/>'; return s; }
function runCar(x, t, o, sv) { return Z.carSide(x, GR, sv || SV, "#8aa0ad", Object.assign({ spin: t * 30 }, o || {})); }
shot(12, still(320, 420, 1), function (u, d, t) { return paper() + lamps(t, SV) + sideRoad(t) + runCar(40, t) + spd(320, 300, at(u, .1, .3)); });
shot([12, 1], still(320, 420, 1), function (u, d, t) {
  var k = ((u - .2) % 1.6) / 1.6, x = 20 + 480 * clamp(k * 1.25);
  return paper() + lamps(t, SV) + sideRoad(t) + G("", runCar(20, 0), .3) + runCar(x, t) + measure(92, GR + 80, 572, GR + 80, at(u, .2, .8), "30 م", 34);
});
shot([12, 2], still(320, 420, 1), function (u, d, t) { return paper() + lamps(t, SV) + sideRoad(t) + G("", runCar(20, 0), .3) + runCar(500, t) + measure(92, GR + 80, 572, GR + 80, 1, "30 م", 34) + Z.watch(320, 250, 80, clamp(u / 1)) + T("ثانية واحدة", 320, 380, 30, BLUE, 800); });
function faceBox(x, y, sz, fc, k) {   // the driver's face in a framed box
  return iconBox(x, y, sz, '<clipPath id="fb' + (++CLIPN) + '"><rect x="' + f(-sz / 2 + 3) + '" y="' + f(-sz / 2 + 3) + '" width="' + f(sz - 6) + '" height="' + f(sz - 6) + '"/></clipPath><g clip-path="url(#fb' + CLIPN + ')">' +
    PERSON.head([0, sz * .1 + 2 * Math.sin(window.__t * 1.6)], sz / 80, 3 * Math.sin(window.__t * 1.1), { face: Object.assign({ eyes: Math.sin(window.__t * 2.3) > .96 ? .05 : 1 }, fc) }, PERSON.colors) + '</g>', k);
}
function pedal(x, y, k) { return R(x - 30, y - 50 + 14 * k, 60, 80, "#5b5650", 2, 6) + P("M" + (x - 22) + " " + f(y - 30 + 14 * k) + " H" + (x + 22) + " M" + (x - 22) + " " + f(y - 10 + 14 * k) + " H" + (x + 22), "none", 1.4, ' stroke="#8f8b84"') + T("فرامل", x, y + 70, 18, INK, 800); }
shot(13, still(320, 393, 1), function (u, d, t) { return paper() + faceBox(320, 300, 300, { eyes: 1.2, brows: "raised", mouth: "o" }, at(u, 0, .3)); });
shot([13, 1], still(320, 393, 1), function (u, d, t) { return paper() + faceBox(170, 250, 220, { eyes: 1.2, brows: "raised", mouth: "o" }, 1) + Z.watch(470, 250, 85, clamp(u / 1.5) * .75) + bigNum("1.5", "ثانية", 470, 450, at(u, .2, .3), BLUE, 64); });
shot([13, 2], still(320, 393, 1), function (u, d, t) { return paper() + faceBox(170, 250, 220, { eyes: 1.1, brows: "worried", mouth: "frown" }, 1) + Z.watch(470, 250, 85, .75) + bigNum("1.5", "ثانية", 470, 450, 1, BLUE, 64) + pedal(320, 640, at(u, .6, .4)); });
shot(14, still(320, 420, 1), function (u, d, t) { var x = 20 + 540 * at(u, .1, d + 1.2); return paper() + lamps(t, 12) + sideRoad(t) + G("", runCar(20, 0, {}, 12), .3) + runCar(Math.min(x, 560), t, {}, 12); });
shot([14, 2], still(320, 420, 1), function (u, d, t) {
  var tt = t * (1 - at(u, .3, 1)); return paper() + lamps(tt, 12) + sideRoad(tt) + G("", runCar(20, 0, {}, 12), .3) + runCar(560, tt, { brake: u > .2 }, 12) + measure(74, GR + 80, 614, GR + 80, at(u, 0, .8), "45 م", 40) + T("لسه بيدوس فرامل", 320, 330, 34, ORANGE, 800);
});

// ── 15 · the weave eats the safety gap in front of you and behind you
var GB = [320, 430, .8];
function gapScene(t, k, o) {   // k: 0 the gap is whole, 1 the weaver is in it
  o = o || {}; var s = road(t) + Z.carTop(LANE(1), 150, CC[1]) + Z.carTop(LANE(1), 760, CC[4]) + Z.carTop(LANE(0), 420, CC[0]) + Z.carTop(LANE(3), 300, CC[5]) + Z.carTop(LANE(2), 640, CC[2]);
  var wx = lerp(LANE(2) + 10, LANE(1), ease(k)), wy = 460;
  if (k <= 0) s += measure(LANE(1) + 60, 214, LANE(1) + 60, 696, o.m == null ? 1 : o.m, "", 0);
  else s += G("", measure(LANE(1) + 60, 214, LANE(1) + 60, wy - 64, 1, "") + measure(LANE(1) + 60, wy + 64, LANE(1) + 60, 696, 1, ""), 1) + G("", '<rect x="' + (LANE(1) + 50) + '" y="214" width="20" height="482" fill="' + ORANGE + '" opacity=".25"/>', ease(k));
  return s + Z.carTop(wx, wy + (1 - ease(k)) * 120, ORANGE, -16 * Math.sin(Math.PI * ease(k)), { blink: k > 0 && k < 1 ? -1 : 0 });
}
shot(15, still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, 0, { m: at(u, .3, .8) }) + G("", T("مسافة الأمان", LANE(1) + 76, 455, 30, BLUE, 800, "end"), at(u, .9, .3)); });
shot([15, 1], still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, at(u, 0, 1.2)); });
shot([15, 2], fly(GB, [250, 300, 1.5], 1.8), function (u, d, t) { return paper() + gapScene(t, 1) + label(LANE(1) + 60, 300, 480, 240, "قدامك", ORANGE, at(u, 1.2, .5), 22); });
shot([15, 3], fly([250, 300, 1.5], [250, 600, 1.5], 1.2), function (u, d, t) { return paper() + gapScene(t, 1) + label(LANE(1) + 60, 600, 480, 640, "وراك", ORANGE, at(u, .6, .5), 22); });

// ── 16 · a push in a queue: the first falls on the one behind, and he on the next
var QF = 600;   // floor
function queue(t, push) {
  var s = '<path d="M0 ' + QF + ' H640" stroke="' + INK + '" stroke-width="2"/>' + R(-10, QF, 660, 200, "#e6dcc4", 0);
  var cols = ["#a9c3dc", "#c9a77c", "#b9a7c9", "#9fb8a0"];
  for (var i = 3; i >= 0; i--) {
    var x = 130 + i * 120, lean = 16 * ease(clamp(push * 4 - i * 1.0)), o = { x: x, s: .78, dir: -1, outfit: { base: "casual", colors: { shirt: cols[i], shirtD: cols[i] } }, breath: (Math.sin(t * 1.6 + i) + 1) / 2,
      legs: [{ hip: 0, knee: 3 }, { hip: 2, knee: 3 }], arms: [{ sh: 8, el: 20, hand: "relaxed" }, { sh: -4, el: 18, hand: "relaxed" }], face: { mouth: lean > 4 ? "o" : "neutral", brows: lean > 4 ? "raised" : "neutral", eyes: lean > 4 ? 1.2 : 1 } };
    o.y = PERSON.sideHipY(o, QF); s += G("rotate(" + f(lean) + " " + f(x + 10) + " " + QF + ")", PERSON.side(o).svg);
  }
  return s;
}
shot(16, still(320, 420, 1), function (u, d, t) { return paper() + queue(t, 0) + arrow(20, 380, 90, 380, ORANGE, 6, at(u, .6, .4)); });
shot([16, 1], still(320, 420, 1), function (u, d, t) { return paper() + queue(t, at(u, 0, 2.6) * .45) + arrow(20, 380, 90, 380, ORANGE, 6, 1); });
shot([16, 2], still(320, 420, 1), function (u, d, t) { return paper() + queue(t, .45 + .55 * at(u, 0, d)) + arrow(20, 380, 90, 380, ORANGE, 6, 1); });

// ── 17–19 · you control your own car — the driver behind his windscreen, seen from the front
function cabin(t, face, o) {
  o = o || {}; var s = R(-10, -10, 660, 806, "#cfd9dc", 0);                                         // sky / glare behind
  s += R(190, 300, 260, 360, "#5a5652", 2, 40);                                                   // seat back
  var hip = 640, sc = 1.55, br = (Math.sin(t * 1.5) + 1) / 2, wy = hip - 96 * sc, ax = 64 * sc;
  var turn = o.turn || 0;
  s += PERSON.front({ x: 320, y: hip, s: sc, legs: "sit", outfit: "casual", breath: br, head: { tilt: 2 * Math.sin(t * .9), turn: turn },
    face: Object.assign({ eyes: Math.sin(t * 2.4) > .96 ? .05 : 1 }, face), arms: [{ to: [320 - ax, wy - 18], hand: "fist", bend: -1 }, { to: [320 + ax, wy - 18], hand: "fist", bend: 1 }] }).svg;
  s += '<ellipse cx="320" cy="' + f(wy) + '" rx="' + f(ax + 18) + '" ry="' + f(34) + '" fill="none" stroke="' + INK + '" stroke-width="16"/><ellipse cx="320" cy="' + f(wy) + '" rx="' + f(ax + 18) + '" ry="34" fill="none" stroke="#3d3a37" stroke-width="11"/>';
  s += P("M320 " + f(wy) + " V" + f(wy + 60), "none", 12, ' stroke="#3d3a37"');
  s += '<path d="M150 230 L490 230 L560 600 L80 600 Z" fill="' + Z.GLASS + '" opacity=".2"/>' + P("M190 245 L150 400 M215 245 L185 350", "none", 5, ' stroke="#fff" opacity=".4"');
  s += P("M0 -10 L150 230 L80 600 L0 600 Z M640 -10 L490 230 L560 600 L640 600 Z", "#8aa0ad", 2.4) + R(0, 180, 640, 50, "#8aa0ad", 2.4);   // pillars and roof
  s += R(290, 232, 60, 22, "#3d3a37", 2, 6);                                                     // rear-view mirror
  s += P("M0 600 L640 600 L640 820 L0 820 Z", "#8aa0ad", 2.4) + P("M100 640 Q320 625 540 640", "none", 1.6, ' opacity=".5"');   // bonnet
  return s;
}
shot(17, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "smile", brows: "neutral" }); });
shot([17, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "grin", brows: "neutral" }) + tag("عربيتك", 300, 650, at(u, .2, .3), 28, OLIVE) + check(410, 642, .8, at(u, .6, .4), OLIVE); });
shot(18, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", look: [.8, 0], brows: "raised" }, { turn: .25 }); });
shot([18, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", look: [.8, 0], brows: "worried" }, { turn: .25 }) + G("", T("؟", 470, 330, 110, ORANGE, 800), at(u, .2, .3)); });
shot(19, still(320, 450, 1.4), function (u, d, t) { return paper() + dim(.5, cabin(t, { mouth: "neutral", look: [.8, 0], brows: "worried" }, { turn: .25 }) + T("؟", 470, 330, 110, ORANGE, 800)); });
hud(19, 20, function (u, t) {   // the mid-video bio pill
  var k = pop(clamp(u / .35)); if (k <= 0) return "";
  return G("translate(320 " + f(110 + 4 * Math.sin(t * 3)) + ") scale(" + f(k) + ")", '<rect x="-170" y="-34" width="340" height="68" rx="34" fill="#f2c94c" stroke="' + INK + '" stroke-width="2.4"/>' + T("اللينك في البايو ↑", 0, 12, 32, "#1a1a1a", 900));
});

// ── 20–23 · you don't control the one beside you: he brakes, swerves, or drives a heavy tanker that can't stop quick
var YOU = [LANE(1), 470], NB = [LANE(2), 400];
function nbScene(t, o) {
  o = o || {}; var s = road(t);
  var fb = o.brakeK || 0, sw = o.swerve || 0;
  s += Z.carTop(LANE(1), 250 + 70 * fb, CC[3], 0, { brake: fb > 0 }) + Z.carTop(LANE(0), 380, CC[0]) + Z.carTop(LANE(3), 560, CC[2]);
  s += Z.tankerTop(LANE(3), -80, 0, { ring: o.tring || 0 });
  s += Z.carTop(lerp(NB[0], NB[0] - 60, ease(sw)), NB[1] + 20 * ease(sw), CC[5], -18 * Math.sin(Math.PI * Math.min(1, sw * .8)) - 6 * ease(sw), { ring: o.nring || 0 });
  s += Z.carTop(YOU[0], YOU[1], "#4a6f8a", 0, {});
  return s;
}
shot(20, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t) + label(YOU[0] - 20, YOU[1] + 30, 60, YOU[1] + 190, "انت", BLUE, at(u, .1, .4), 36); });
shot(21, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t, { nring: at(u, .2, .4) }) + label(YOU[0] - 20, YOU[1] + 30, 60, YOU[1] + 190, "انت", BLUE, 1, 36) + label(NB[0] + 26, NB[1] + 20, 590, NB[1] + 180, "اللي جنبك", ORANGE, at(u, .4, .5), 34); });
shot([21, 2], still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + nbScene(t, { nring: 1 }) + faceBox(500, 120, 180, { eyes: 1.3, brows: "raised", mouth: "o" }, at(u, .1, .3)); });
var CN = [300, 400, 1.15];
shot(22, fly(OV, CN, 1.8), function (u, d, t) { return paper() + nbScene(t, { brakeK: at(u, .2, 1.2) }) + G("", T("فرامل فجأة", LANE(1), 150, 24, ORANGE, 800), at(u, .6, .3)); });
shot([22, 1], still(CN[0], CN[1], CN[2]), function (u, d, t) { return paper() + nbScene(t, { brakeK: 1, swerve: at(u, 0, 1.4) }) + arrow(NB[0] + 20, NB[1] - 90, NB[0] - 50, NB[1] - 150, ORANGE, 5, at(u, .2, .4)); });
shot([22, 2], fly(CN, [360, 300, .9], 1.6), function (u, d, t) { return paper() + nbScene(t, { brakeK: 1, swerve: 1, tring: at(u, .4, .4) }) + G("", tag("محمّلة", LANE(3), 180, 1, 22, ORANGE), at(u, .8, .3)); });
// 23 · the stopping distances from the same speed: the loaded tanker needs much longer
shot(23, still(320, 420, 1), function (u, d, t) {
  var s = paper() + R(-400, 300, 1440, 60, Z.ASPH, 2) + R(-400, 600, 1440, 60, Z.ASPH, 2);
  s += Z.carSide(10, 300, 14, "#8aa0ad", {}) + Z.tankerSide(10, 600, 14, {});
  s += '<rect x="73" y="318" width="' + f(250 * at(u, .2, .8)) + '" height="18" fill="' + BLUE + '" opacity=".75"/>' + T("عربية", 620, 200, 30, INK, 800, "start");
  s += '<rect x="241" y="618" width="' + f(390 * at(u, .5, 1.3)) + '" height="18" fill="' + ORANGE + '" opacity=".85"/>' + T("ناقلة محمّلة", 620, 470, 30, INK, 800, "start");
  return s + G("", T("أطول بكتير", 440, 730, 38, ORANGE, 800), at(u, 1.5, .3));
});

// ── 24–26 · «the weave is skill». No. Skill is everyone getting home.
shot(24, still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "grin", brows: "raised" }) + tag("شطارة", 320, 650, at(u, .2, .3), 30, INK); });
shot([24, 1], still(320, 450, 1.4), function (u, d, t) { return paper() + cabin(t, { mouth: "neutral", brows: "neutral" }) + tag("شطارة", 320, 650, 1, 30, INK) + cross(320, 644, 1.1, at(u, .1, .5)); });
function safeRoad(t, k) {   // every car in its lane with room around it; a ✓ pops on each
  var L = [[0, 180, 0], [0, 600, 3], [1, 380, 1], [2, 120, 2], [2, 560, 4], [3, 300, 5]], s = road(t);
  L.forEach(function (c, i) { s += Z.carTop(LANE(c[0]), c[1], CC[c[2]], 0) + check(LANE(c[0]) + 40, c[1] - 70, .7, at(k, i * .2, .4), OLIVE); });
  return s + Z.carTop(LANE(1), 760, "#4a6f8a", 0) + check(LANE(1) + 40, 690, .7, at(k, 1.3, .4), OLIVE);
}
shot(25, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + safeRoad(t, u); });
shot(26, still(OV[0], OV[1], OV[2]), function (u, d, t) { return paper() + dim(.55, safeRoad(t, 9)) + Z.watch(320, 300, 110, (t * .4) % 1) + G("", T("ثواني", 320, 470, 40, ORANGE, 800), at(u, .5, .3)); });
shot([26, 2], still(GB[0], GB[1], GB[2]), function (u, d, t) { return paper() + gapScene(t, 1) + G("", T("مفيش وقت", 470, 120, 34, BLUE, 800), at(u, .3, .3)); });
shot([26, 3], still(OV[0], OV[1], OV[2]), function (u, d, t) {
  var s = road(t); OTHERS.forEach(function (c, i) { s += Z.carTop(LANE(c[0]), c[1], CC[c[2]], 0, { ring: at(u, i * .15, .4) }); });
  return paper() + s + Z.carTop(LANE(2), 560, "#4a6f8a", 0) + G("", tag("أرواح ملهاش ذنب", 320, 40, 1, 28, ORANGE), at(u, 1.2, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the weave on the road (a stopwatch: a few seconds). line 1: only his car ringed. line 2: every car round him ringed
  var s = '<g transform="translate(64 250) scale(.75)">' + Z.road({ scroll: t * SPEED, y0: 0, y1: 520 }) + '<clipPath id="ic"><rect x="-90" y="0" width="720" height="520"/></clipPath><g clip-path="url(#ic)">';
  var L = [[0, 130, 0], [2, 80, 2], [1, 330, 1], [3, 260, 5], [2, 470, 4]];
  L.forEach(function (c, i) { s += Z.carTop(LANE(c[0]), c[1] + 5 * Math.sin(t + i), CC[c[2]], 0, { ring: li >= 2 ? ease((t - LN[2].start - i * .12) / .3) : 0 }); });
  var p = (t * .35) % 1, wx = 250 + 100 * Math.sin(p * Math.PI * 2), wy = 420 - 200 * p;
  s += Z.carTop(wx, wy, ORANGE, 22 * Math.cos(p * Math.PI * 2), { ring: li === 1 ? ease((t - LN[1].start) / .3) : 0 });
  s += '</g></g>';
  if (li === 0) s += G("", Z.watch(520, 160, 60, (t * .6) % 1) + T("كام ثانية", 520, 260, 26, ORANGE, 800), ease((t - .8) / .3));
  return s;
};
SCENE.bumper = function (u, t) {
  var s = '<g transform="translate(-30 0) scale(.5)">' + Z.road({ scroll: t * SPEED, y0: 0, y1: 400 }) + '</g>';
  var p = (t * .5) % 1; return s + G("translate(0 0) scale(.5)", Z.carTop(250 + 100 * Math.sin(p * 6.283), 250, ORANGE, 20 * Math.cos(p * 6.283)) + Z.carTop(150, 120, CC[1], 0) + Z.carTop(350, 330, CC[2], 0));
};
SCENE.outro = function (svg, u, t) {
  var s = '<g transform="translate(150 -20) scale(.6) rotate(0)"><clipPath id="oc"><rect x="-20" y="0" width="640" height="520"/></clipPath><g clip-path="url(#oc)">' + Z.road({ scroll: t * SPEED, y0: 0, y1: 520 }) +
    Z.carTop(LANE(1), 120, CC[1], 0) + Z.carTop(LANE(1), 440, CC[4], 0) + Z.carTop(LANE(1) + 50 * Math.sin(t * 2), 290, ORANGE, -14 * Math.cos(t * 2)) + Z.carTop(LANE(3), 260, CC[2], 0) + '</g></g>';
  return s + callout("1", 300, 190, ease(u / .3)) + callout("2", 240, 110, ease(u / .3 - .5)) + callout("3", 360, 160, ease(u / .3 - 1));
};
