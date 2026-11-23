// ── «لو اتحبست في شنطة عربية» — drawings in the «اسكتش» hand. Reference v18 (the car in profile as a cut-away, the
// inside showing through the side) and the short the user sent (the person reclined in the trunk, knees up, kicking the
// lid; the T handle hanging on its cable under the lid). Real shapes (refs/SOURCES.md): a compact sedan to real size
// (1 m = 120 units), the rotary latch (a forked bolt closing round a U striker), the glow-in-the-dark T handle on a cable.
// People: the shared person kit (videos/_templates/people/person.js), "casual" outfit.

function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function D2R(a) { return a * Math.PI / 180; }
var BODY = "#cfc4a8", BODY_D = "#b3a585", GLASS = "#cfdde3", DARK = "#2f3034", DARK2 = "#3c3d42", CARPET = "#4a4a50",
    STEEL = "#9aa2ac", STEEL_D = "#6e757e", GLOW = "#e9f2a8", GLOW_D = "#b9c86a", TAIL = "#b8452e", SEAT = "#8a8173";

// ── the car: a compact sedan in profile, front to the left, real size (1 m = 120 units): length 4.8 m, height 1.47 m,
// wheelbase 2.6 m (308), wheels 0.63 m (r 38), trunk deck 1.1 m. Local y 0 = the ground, up is negative. Like reference
// v18 the trunk is cut open on the centre line, and it shows what a real trunk has in section (refs/SOURCES.md):
//   the back of the rear seat (with the seat belt) and the parcel shelf under the rear window; the carpeted floor board
//   with the spare wheel lying flat in its well under it; the lid's inner panel (a ribbed frame with lightening holes) on
//   two curved gooseneck hinges; at the rear edge of the lid the latch box, and on the body sill the striker; the back of
//   the rear lamp housing in the corner; the bumper and the number plate outside.
// The trunk is drawn a little roomier than a real one so a person fits on the page, as the short the user sent does.
var CAR_P = "M8 -44 L2 -84 Q4 -100 30 -104 L160 -118 L238 -172 Q248 -177 266 -177 L372 -175 Q384 -174 392 -168 L456 -134 L456 -98 L574 -98 L576 -70 Q580 -66 579 -52 Q577 -42 566 -40 L556 -28 L478 -28 L468 -44 A48 48 0 0 0 372 -44 L160 -44 A48 48 0 0 0 64 -44 Z";
var CABIN = "M154 -48 L162 -114 L238 -166 L372 -166 L420 -140 L420 -48 Z";
var WIN_F = "M168 -120 L240 -164 L300 -164 L300 -120 Z", WIN_R = "M310 -120 L310 -164 L370 -164 L414 -141 L414 -120 Z";
var HINGE = [452, -128];   // the gooseneck pivot, under the rear window's lower edge
var LID = "M456 -134 L558 -130 Q572 -128 574 -114 L574 -98 L566 -98 L566 -112 Q564 -121 554 -122 L460 -126 Z";
var TRUNK = "M436 -128 L460 -126 L554 -122 Q564 -121 566 -112 L566 -98 L562 -96 L562 -42 L436 -42 Z";
var TRUNK_OPEN = "M436 -128 L456 -134 L566 -98 L562 -96 L562 -42 L436 -42 Z", TRUNK_AIR = "M436 -128 L456 -134 L456 -400 L800 -400 L800 -98 L562 -96 L562 -42 L436 -42 Z";
var FLOOR = -46, LATCH = [565, -102], RW = 420;
function wheel(x, t, spin, sw) { var a = (spin || 0) * t * 200, s = C(x, -38, 38, "#3a352e", 2.4 * sw) + C(x, -38, 25, "#a9a59c", 2 * sw) + C(x, -38, 8, "#5a554d", 1.4 * sw) + C(x, -38, 3, INK, 0);
  for (var i = 0; i < 5; i++) { var b = (a + i * 72) * Math.PI / 180; s += '<path d="M' + f(x + Math.cos(b) * 10) + ' ' + f(-38 + Math.sin(b) * 10) + ' L' + f(x + Math.cos(b) * 23) + ' ' + f(-38 + Math.sin(b) * 23) + '" stroke="#6e695f" stroke-width="' + f(5 * sw) + '" stroke-linecap="round"/>'; } return s; }
// the lid's inside: inner panel frame with holes, the gooseneck arm, the latch box at its rear edge (all in closed-lid coords)
function lidInner(sw, lidIn) {
  var g = P("M462 -126 L554 -122 Q563 -121 565 -112 L565 -104 L559 -104 L559 -111 Q557 -116 552 -116 L464 -120 Z", "#8e8778", 1.4 * sw);
  [478, 502, 526].forEach(function (x) { g += '<ellipse cx="' + x + '" cy="' + f(-121.5 + (x - 478) * .04) + '" rx="7" ry="1.8" fill="' + DARK + '" stroke="' + INK + '" stroke-width="' + f(.8 * sw) + '"/>'; });
  // the gooseneck hinge: a curved steel arm from the pivot, dipping into the trunk and up to the lid
  g += '<path d="M452 -128 Q451 -112 464 -112 Q476 -112 480 -122" fill="none" stroke="' + INK + '" stroke-width="' + f(5.4 * sw) + '" stroke-linecap="round"/><path d="M452 -128 Q451 -112 464 -112 Q476 -112 480 -122" fill="none" stroke="' + STEEL + '" stroke-width="' + f(3 * sw) + '" stroke-linecap="round"/>' + C(452, -128, 2.6, STEEL, .8 * sw);
  // the latch box on the lid's rear edge, the release cable running to it
  g += R(557, -111, 9, 11, "#5f6166", 1.2 * sw, 1.5) + C(561.5, -104, 1.6, STEEL, .6 * sw);
  return g + (lidIn || "");
}
// o: {x, y (world point under the rear bumper, local x 570), sc, t, lid (0 shut … 1 open, 55°), shake (lid jolt 0..1),
//    people (fn t → local SVG inside the trunk), lidIn (local SVG hung on the lid: the handle), dark (0..1), hlTail, spare}
function car(o) {
  var t = o.t || 0, sc = o.sc || 1, sw = 1 / Math.sqrt(sc), g = "";
  g += '<ellipse cx="290" cy="2" rx="290" ry="8" fill="' + INK + '" opacity=".14"/>';
  g += P(CAR_P, BODY, 2.6 * sw) + '<path d="' + CAR_P + '" fill="url(#hatch)" opacity=".3"/>';
  g += P(CABIN, "#efe6d2", 1.6 * sw);
  g += P("M154 -98 L202 -102 L204 -86 L156 -72 Z", "#7c7468", 1.6 * sw);
  g += P("M216 -66 L280 -66 L284 -52 L218 -50 Z", SEAT, 1.6 * sw) + P("M276 -66 L296 -146 Q304 -150 308 -142 L296 -58 Z", SEAT, 1.6 * sw) + R(294, -160, 16, 18, SEAT, 1.4 * sw, 4);
  g += P("M346 -64 L406 -64 L410 -50 L348 -48 Z", SEAT, 1.6 * sw);
  g += wheel(112, t, o.spin, sw) + wheel(RW, t, o.spin, sw);
  // ── the trunk, cut on the centre line ──
  var tid = "tr" + (++CLIPN), lk = clamp((o.lid || 0) * 4);
  g += P(TRUNK_OPEN, DARK, 1.6 * sw) + G("", P(TRUNK, DARK, 0), 1 - lk);
  // the rear seat's back (the trunk's front wall) with its belt, and the parcel shelf
  g += P("M404 -62 L418 -132 Q424 -138 432 -134 L438 -128 L436 -42 L410 -46 Z", SEAT, 1.6 * sw) + '<path d="M414 -64 L426 -126" stroke="#766d60" stroke-width="' + f(1.2 * sw) + '"/>' + P("M424 -128 L430 -132 L431 -60 L425 -60 Z", "#4c4b4f", .9 * sw);
  g += P("M430 -136 L458 -136 L458 -130 L432 -129 Z", "#5d5a55", 1.2 * sw);
  // the spare-wheel well under the floor, with the spare lying flat (a slab of tyre and rim seen from the side)
  g += P("M474 -42 L478 -30 L552 -30 L556 -42 Z", "#3a3b40", 1.4 * sw);
  g += R(482, -41, 66, 10, "#2b2925", 1.4 * sw, 4) + R(498, -38.5, 34, 5, "#9a958a", 1 * sw, 2) + '<path d="M486 -36 h4 M540 -36 h4" stroke="#6e695f" stroke-width="' + f(2 * sw) + '"/>';
  // the floor board with its carpet
  g += R(436, FLOOR, 126, 4, CARPET, 1 * sw) + '<path d="M436 ' + (FLOOR + .8) + ' H562" stroke="#5e5e66" stroke-width="' + f(1.2 * sw) + '" stroke-dasharray="2 3"/>';
  // the back of the rear lamp housing in the corner, with its bulb holder; the rear sill and the striker
  g += P("M550 -84 L562 -84 L562 -70 L551 -70 Z", "#4a4b50", 1.1 * sw) + C(555.5, -77, 2.4, "#77787d", .8 * sw);
  g += R(556, -98, 10, 3, STEEL_D, .8 * sw) + '<path d="M560 -98 L560 -101 L564 -101 L564 -98" fill="none" stroke="' + STEEL + '" stroke-width="' + f(1.6 * sw) + '"/>';
  g += '<clipPath id="' + tid + '"><path d="' + (lk > 0 ? TRUNK_AIR : TRUNK) + '"/></clipPath><g clip-path="url(#' + tid + ')">';
  if (o.people) g += o.people(t);
  if (o.dark) g += '<rect x="420" y="-140" width="160" height="100" fill="#000" opacity="' + f(.2 * o.dark) + '"/>';
  g += '</g>' + P(lk > 0 ? TRUNK_OPEN : TRUNK, "none", 2 * sw);
  // windows, pillars, doors, lights, bumper, plate
  g += '<g opacity=".7"><path d="' + WIN_F + '" fill="' + GLASS + '"/><path d="' + WIN_R + '" fill="' + GLASS + '"/></g>' + P(WIN_F, "none", 2 * sw) + P(WIN_R, "none", 2 * sw) + R(300, -166, 10, 120, BODY, 2 * sw);
  g += '<path d="M160 -118 L156 -48 M300 -118 L300 -46 M420 -140 L420 -60" stroke="' + INK + '" stroke-width="' + f(1.8 * sw) + '" fill="none"/>' + R(258, -102, 22, 6, INK, 0, 3) + R(390, -102, 22, 6, INK, 0, 3);
  g += P("M6 -88 L26 -96 L28 -86 L8 -82 Z", "#f4efe3", 1.4 * sw);
  g += P("M566 -97 L574.5 -97 L576 -78 L567 -78 Z", TAIL, 1.4 * sw, o.hlTail ? ' style="filter:drop-shadow(0 0 ' + f(5 * o.hlTail) + 'px ' + ORANGE + ')"' : "") + '<path d="M567 -88 H575" stroke="#e7a08c" stroke-width="' + f(1.2 * sw) + '"/>';
  g += P("M570 -66 Q581 -64 580 -52 Q579 -44 568 -43 L562 -43 L562 -66 Z", "#bdb196", 1.8 * sw);
  // the lid: outer skin and the inner frame turn together round the gooseneck pivot; a kick makes it jolt
  var ang = -55 * ease(clamp(o.lid || 0)) - 1.4 * (o.shake || 0);
  g += G("rotate(" + f(ang) + " " + HINGE[0] + " " + HINGE[1] + ")", lidInner(sw, o.lidIn) + P(LID, BODY, 2.2 * sw) + '<path d="' + LID + '" fill="url(#hatch)" opacity=".3"/>');
  return G("translate(" + f(o.x) + " " + f(o.y) + ") scale(" + f(sc) + ") translate(-570 0)", g);
}

// ── the boy in the trunk: his back against the back of the rear seat, his body and face toward the lid and the rear of
// the car (the user's correction), knees up. PERSON.side facing right (DIR 1), in the car's local units: s = .44, a
// 1.5 m youth at 1 m = 120. Legs and arms are posed by where the feet and hands must land (two-bone IK on the kit's real
// segment lengths), keeping knee and elbow flexion ≥ 0, so joints only bend the real way inside one flowing outline.
var PS = .44, DIR = 1, THIGH = 98 * PS, SHIN = 98 * PS, UARM = 74 * PS, FARM = 58 * PS;
function ik2(a, b, l1, l2, side) { var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), an = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, .01)))); return [a[0] + Math.cos(an + side * c) * l1, a[1] + Math.sin(an + side * c) * l1]; }
function locA(dx, dy, rot) { var r = D2R(-rot), lx = (dx * Math.cos(r) - dy * Math.sin(r)) * DIR, ly = dx * Math.sin(r) + dy * Math.cos(r); return Math.atan2(lx, ly) * 180 / Math.PI; }
function kitW(x, y, rot, p) { var a = D2R(rot), px = p[0] * PS * DIR, py = p[1] * PS; return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)]; }
function wrap(a) { return ((a % 360) + 540) % 360 - 180; }
function legTo(hip, ank, rot) {
  var c = [1, -1].map(function (sd) { var kn = ik2(hip, ank, THIGH, SHIN, sd), a1 = locA(kn[0] - hip[0], kn[1] - hip[1], rot), a2 = locA(ank[0] - kn[0], ank[1] - kn[1], rot); return { hip: a1, knee: wrap(a1 - a2) }; });
  return c[0].knee >= 0 && (c[1].knee < 0 || c[0].knee <= c[1].knee) ? c[0] : c[1];
}
function armTo(sh, wr, rot, straight) {
  var c = [1, -1].map(function (sd) { var el = straight ? L2(sh, wr, UARM / (UARM + FARM)) : ik2(sh, wr, UARM, FARM, sd), a1 = locA(el[0] - sh[0], el[1] - sh[1], rot), a2 = locA(wr[0] - el[0], wr[1] - el[1], rot); return { sh: a1, el: wrap(a2 - a1) }; });
  return c[0].el >= -1 && (c[1].el < -1 || c[0].el <= c[1].el) ? c[0] : c[1];
}
// o: {hip, rot, feet [[x,y],[x,y]] ankle targets, hands [[x,y] | null, …] wrist targets, hk, straight, ankle, wrist, face, tilt, t}
var HIP = [508, -51], ROT = -50;
function trapped(o) {
  var t = o.t || 0, rot = o.rot == null ? ROT : o.rot, hip = o.hip || HIP, sh = kitW(hip[0], hip[1], rot, [-2, -117]);
  var legs = o.feet.map(function (a, i) { var L = legTo(hip, a, rot); L.ankle = (o.ankle && o.ankle.length ? o.ankle[i] : o.ankle) || 0; return L; });
  var rest = [[hip[0] - 14, FLOOR - 1], [hip[0] - 20, FLOOR - 1]];
  var arms = [0, 1].map(function (i) { var w = (o.hands && o.hands[i]) || rest[i], A = armTo(sh, w, rot, o.straight && o.straight[i]); A.hand = (o.hk && o.hk[i]) || "flat"; if (o.wrist) A.wrist = o.wrist[i]; return A; });
  var P_ = PERSON.side({ x: hip[0], y: hip[1], s: PS, dir: DIR, rot: rot, outfit: { base: "casual", colors: { shirt: "#b9c7d4", shirtD: "#93a4b4", pants: "#4b5a6e", pantsD: "#38445a" } }, breath: (Math.sin(t * 3.1) + 1) / 2, legs: legs, arms: arms,
    head: { tilt: o.tilt || 0 }, face: Object.assign({ eyes: 1.2, brows: "worried", mouth: "open" }, o.face || {}) });
  return P_.svg;
}
// the kick: leaning back on both hands, knees drawn up (k 0) … both feet driven up into the lid (k 1)
var FEET_IN = [[542, -74], [534, -70]], FEET_HIT = [[552, -116], [541, -118]];
function kickPose(k, t, face) {
  var k2 = clamp(k * 1.15 - .1);
  return trapped({ hip: [HIP[0], HIP[1] + 1.5 * k], rot: ROT - 6 * k, feet: [L2(FEET_IN[0], FEET_HIT[0], k), L2(FEET_IN[1], FEET_HIT[1], k2)], ankle: lerp(10, -50, k),
    hands: [[452, FLOOR - 1], [446, FLOOR - 1]], hk: ["flat", "flat"], wrist: [-70, -70], face: face, t: t, tilt: -10 + 6 * k });
}
// sitting up, back off the seat, an arm reaching forward and up to the handle by the latch; feet flat toward the rear
var HIP_R = [519, -51], FEET_R = [[558, FLOOR - 4], [552, FLOOR - 4]];
function reachPose(hand, t, o) {
  o = o || {};
  return trapped(Object.assign({ hip: HIP_R, rot: -34, feet: FEET_R, ankle: 0, hands: [hand, [486, FLOOR - 1]], hk: ["fist", "flat"], wrist: [0, 70], t: t, tilt: -16, face: { eyes: 1.1, brows: "angry", mouth: "neutral" } }, o));
}
function kickK(t, per) { var p = (t % per) / per; return p < .25 ? ease(p / .25) : 1 - ease((p - .25) / .75); }
function kickHit(t, per) { var p = (t % per) / per; return p > .22 && p < .4 ? 1 - Math.abs(p - .28) / .12 : 0; }
// impact star at a hit
function impact(x, y, k, col, r0) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = (r0 || 10) + 22 * k, s = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + .2; s += '<path d="M' + f(x + Math.cos(a) * r * .55) + ' ' + f(y + Math.sin(a) * r * .55) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="3" stroke-linecap="round"/>'; } return G("", s, 1 - k); }

// ── the emergency release: a T handle on a cable under the lid, by the latch (as fitted under US FMVSS 401: a handle that
// glows in the dark after light, with a car-and-open-trunk mark). handleT(cx, top, s, glow, pull): local units at s = 1:
// the bar 110 wide, the stem 90 long, hanging from a cable.
function handleT(cx, top, s, glow, pull, t) {
  var g = "", y0 = top + (pull || 0) * 40, gl = clamp(glow || 0), pulse = .85 + .15 * Math.sin((t || 0) * 3);
  if (gl > 0) g += '<ellipse cx="' + cx + '" cy="' + f(y0 + 78) + '" rx="' + f(80 * s) + '" ry="' + f(70 * s) + '" fill="' + GLOW + '" opacity="' + f(.35 * gl * pulse) + '" style="filter:blur(' + f(10 * s) + 'px)"/>';
  g += '<path d="M' + cx + ' ' + f(top - 60 * s) + ' L' + cx + ' ' + f(y0 + 2) + '" stroke="#5a5c60" stroke-width="' + f(5 * s) + '"/>';   // cable
  var col = gl > .1 ? GLOW : "#ece6d2", cd = gl > .1 ? GLOW_D : "#cfc6aa";
  var T_ = "M" + f(cx - 16 * s) + " " + f(y0) + " L" + f(cx + 16 * s) + " " + f(y0) + " L" + f(cx + 16 * s) + " " + f(y0 + 70 * s) + " Q" + f(cx + 18 * s) + " " + f(y0 + 78 * s) + " " + f(cx + 34 * s) + " " + f(y0 + 79 * s) +
    " L" + f(cx + 54 * s) + " " + f(y0 + 81 * s) + " Q" + f(cx + 64 * s) + " " + f(y0 + 98 * s) + " " + f(cx + 54 * s) + " " + f(y0 + 118 * s) + " L" + f(cx - 54 * s) + " " + f(y0 + 118 * s) +
    " Q" + f(cx - 64 * s) + " " + f(y0 + 98 * s) + " " + f(cx - 54 * s) + " " + f(y0 + 81 * s) + " L" + f(cx - 34 * s) + " " + f(y0 + 79 * s) + " Q" + f(cx - 18 * s) + " " + f(y0 + 78 * s) + " " + f(cx - 16 * s) + " " + f(y0 + 70 * s) + " Z";
  g += P(T_, col, 2.4 * Math.max(.6, s)) + '<path d="M' + f(cx + 10 * s) + ' ' + f(y0 + 6 * s) + ' L' + f(cx + 10 * s) + ' ' + f(y0 + 74 * s) + '" stroke="' + cd + '" stroke-width="' + f(3 * s) + '"/>';
  // the mark: a car with its trunk open and a person climbing out; the two "pull" arrows at the ends of the bar
  g += G("translate(" + f(cx) + " " + f(y0 + 104 * s) + ") scale(" + f(s * .5) + ")", '<path d="M-34 4 L-34 -6 L-22 -9 L-12 -22 L10 -22 L16 -9 L24 -9 L40 -30" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M24 -9 L34 -9 L34 4 L-34 4" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-linejoin="round"/><circle cx="-19" cy="7" r="6" fill="' + ORANGE + '"/><circle cx="19" cy="7" r="6" fill="' + ORANGE + '"/><circle cx="29" cy="-26" r="4.5" fill="' + ORANGE + '"/><path d="M28 -21 L25 -12 M24 -17 L33 -15" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/>');
  [-40, 40].forEach(function (dx) { g += '<path d="M' + f(cx + dx * s) + ' ' + f(y0 + 88 * s) + ' L' + f(cx + dx * s) + ' ' + f(y0 + 106 * s) + ' M' + f(cx + (dx - 6) * s) + ' ' + f(y0 + 100 * s) + ' L' + f(cx + dx * s) + ' ' + f(y0 + 107 * s) + ' L' + f(cx + (dx + 6) * s) + ' ' + f(y0 + 100 * s) + '" stroke="' + ORANGE + '" stroke-width="' + f(3.4 * s) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; });
  return g;
}

// ── the rotary latch, cut open (close-up), as on real trunk latches: a steel housing with a slot (the "fish mouth")
// the striker comes up into; inside, the forked bolt (the claw) turns on a pin and closes round the striker bar; a spring
// pawl catches the bolt's tooth and holds it. The striker is a U loop of round bar bolted to the body: here its bar is seen
// end-on, a round section in the slot. open: 0 locked … 1 released (the pawl lifts, the bolt turns, the striker is free).
function forkBolt(r, nAng, nW, nIn, tA) {   // a disc of radius r with a notch toward nAng (deg), nW wide, down to radius nIn; a tooth on the far side
  var pts = [], a0 = nAng + nW / 2, i;
  for (i = 0; i <= 64; i++) { var a = a0 + (360 - nW) * i / 64, rr = r; var d = ((a - (tA == null ? nAng + 180 : tA)) % 360 + 360) % 360; if (d < 18 || d > 342) rr = r + 10; pts.push([Math.cos(D2R(a)) * rr, Math.sin(D2R(a)) * rr]); }
  var e = [Math.cos(D2R(nAng)), Math.sin(D2R(nAng))], n = [-e[1], e[0]], hw = Math.sin(D2R(nW / 2)) * r;
  pts.push([e[0] * nIn + n[0] * -hw, e[1] * nIn + n[1] * -hw]);
  var arc = ""; var c = [e[0] * nIn, e[1] * nIn];
  return "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " A" + f(hw) + " " + f(hw) + " 0 0 1 " + f(e[0] * nIn + n[0] * hw) + " " + f(e[1] * nIn + n[1] * hw) + " Z";
}
function latchCut(cx, cy, s, open, hl, t) {
  var g = "", k = ease(clamp(open || 0)), sx = cx, sy = cy - 14 * s;
  // the body panel and the striker loop under it
  g += R(cx - 200 * s, cy + 70 * s, 400 * s, 90 * s, BODY, 2.6) + '<rect x="' + f(cx - 200 * s) + '" y="' + f(cy + 70 * s) + '" width="' + f(400 * s) + '" height="' + f(90 * s) + '" fill="url(#hatch)" opacity=".3"/>';
  g += R(cx - 60 * s, cy + 58 * s, 120 * s, 16 * s, STEEL_D, 2.2, 4) + C(cx - 42 * s, cy + 66 * s, 5 * s, "#c9ced3", 1.4) + C(cx + 42 * s, cy + 66 * s, 5 * s, "#c9ced3", 1.4);
  g += '<path d="M' + f(cx - 22 * s) + ' ' + f(cy + 60 * s) + ' L' + f(cx - 10 * s) + ' ' + f(cy + 10 * s) + ' M' + f(cx + 22 * s) + ' ' + f(cy + 60 * s) + ' L' + f(cx + 10 * s) + ' ' + f(cy + 10 * s) + '" stroke="' + INK + '" stroke-width="' + f(16 * s) + '" stroke-linecap="round"/><path d="M' + f(cx - 22 * s) + ' ' + f(cy + 60 * s) + ' L' + f(cx - 10 * s) + ' ' + f(cy + 10 * s) + ' M' + f(cx + 22 * s) + ' ' + f(cy + 60 * s) + ' L' + f(cx + 10 * s) + ' ' + f(cy + 10 * s) + '" stroke="' + STEEL + '" stroke-width="' + f(10 * s) + '" stroke-linecap="round"/>';
  // the lid moves up with the latch when released
  var ly = -60 * s * clamp((open - .5) * 2);
  var hs = "";
  // housing plate with the slot
  hs += P("M" + f(cx - 150 * s) + " " + f(cy - 170 * s) + " L" + f(cx + 150 * s) + " " + f(cy - 170 * s) + " L" + f(cx + 150 * s) + " " + f(cy + 40 * s) + " L" + f(cx + 22 * s) + " " + f(cy + 40 * s) + " L" + f(cx + 22 * s) + " " + f(cy - 30 * s) + " Q" + f(cx) + " " + f(cy - 52 * s) + " " + f(cx - 22 * s) + " " + f(cy - 30 * s) + " L" + f(cx - 22 * s) + " " + f(cy + 40 * s) + " L" + f(cx - 150 * s) + " " + f(cy + 40 * s) + " Z", "#a9a49a", 2.6);
  hs += '<path d="M' + f(cx - 150 * s) + ' ' + f(cy - 170 * s) + ' h' + f(300 * s) + ' v' + f(210 * s) + ' h' + f(-300 * s) + ' Z" fill="url(#hatch)" opacity=".25"/>';
  [[-120, -140], [120, -140], [-120, 10], [120, 10]].forEach(function (p) { hs += C(cx + p[0] * s, cy + p[1] * s, 7 * s, "#c9ced3", 1.6) + '<path d="M' + f(cx + p[0] * s - 4 * s) + ' ' + f(cy + p[1] * s) + ' h' + f(8 * s) + '" stroke="' + INK + '" stroke-width="1.4"/>'; });
  // the forked bolt on its pin, right of the slot; locked, the notch wraps round the striker
  var pin = [cx + 66 * s, cy - 14 * s], ang = -62 * k;
  hs += G("translate(" + f(pin[0]) + " " + f(pin[1]) + ") rotate(" + f(ang) + ") scale(" + f(s) + ")", P("M-88 -24 Q-62 -62 -6 -62 L0 -74 L14 -60 Q58 -50 60 0 Q58 58 0 60 Q-50 60 -88 28 L-86 19 Q-62 22 -50 17 Q-43 0 -50 -17 Q-62 -20 -86 -15 Z", hl === "hook" ? OLIVE : "#7d858e", 2.6 / s) + '<path d="M-30 -40 Q0 -52 30 -36" stroke="#9aa2ac" stroke-width="3" fill="none"/>' + C(0, 0, 11, "#c9ced3", 2 / s) + C(0, 0, 4, INK, 0));
  // the pawl, left of the bolt's tooth: pivots up to let it go
  var pp = [cx - 76 * s, cy - 100 * s];
  hs += G("translate(" + f(pp[0]) + " " + f(pp[1]) + ") rotate(" + f(4 - 26 * k) + ") scale(" + f(s) + ")", P("M0 -10 L120 -4 Q132 0 130 10 L120 30 L112 22 L-4 12 Q-12 0 0 -10 Z", "#8d949c", 2.4 / s) + C(0, 0, 9, "#c9ced3", 2 / s) + C(0, 0, 3, INK, 0));
  // the cable from the handle pulls the pawl
  hs += '<path d="M' + f(cx - 150 * s) + ' ' + f(cy - 150 * s) + ' Q' + f(cx - 120 * s) + ' ' + f(cy - 150 * s) + ' ' + f(pp[0] + 30 * s) + ' ' + f(pp[1] - 4 * s) + '" stroke="#5a5c60" stroke-width="' + f(4 * s) + '" fill="none"/>';
  g += G("translate(0 " + f(ly) + ")", hs);
  // the striker bar seen end-on, in the slot
  g += C(sx, sy, 17 * s, hl === "striker" ? OLIVE : STEEL, 2.6) + C(sx - 5 * s, sy - 5 * s, 5 * s, "#e6e9ec", 0);
  return g;
}

// ── shots (line numbers from script.txt). World panel 640 × 786. In the trunk close-ups the car is at scale S with its
// rear bumper at world (X, Y); Wp(local) gives the world point of a local car point.
var X = 610, Y = 690, S = 3.6;
function Wp(p, x, y, sc) { return [(x || X) + (p[0] - 570) * (sc || S), (y || Y) + p[1] * (sc || S)]; }
var HD = [557, -101];   // where the handle hangs under the lid (local)
function handleSmall(gl, pull, t) { return '<g transform="translate(' + HD[0] + ' ' + HD[1] + ') scale(.085)">' + handleT(0, 0, 1, gl, pull, t) + '</g>'; }
function road(t, y, run) { return R(-600, y, 1840, 400, "#cbc2ad", 0) + '<path d="M-600 ' + y + ' H1240" stroke="' + INK + '" stroke-width="2.4"/>' + '<path d="M-600 ' + f(y + 50) + ' H1240" stroke="#efe9da" stroke-width="6" stroke-dasharray="54 40" stroke-dashoffset="' + f((run || 0) * t * 90) + '"/>'; }
var FACE_KICK = { eyes: 1.25, brows: "angry", mouth: "open" };
function kicking(t, per, amp, face) { return function (tt) { return kickPose(kickK(tt, per) * (amp || 1), tt, face || FACE_KICK); }; }
function kickStar(t, per, x, y, sc) { var p = (t % per) / per, k = (p - .22) / .4, w = Wp(L2(FEET_HIT[0], FEET_HIT[1], .5), x, y, sc); return impact(w[0], w[1] - 10, k, ORANGE, 12); }

// 4 · «طب ليه الرفس مش بيفتح؟» — the rear of the car, the lid jolting at every kick
shot(4, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var x = 640, y = 640, sc = 2.3, per = 1.1;
  return paper() + road(t, y) + car({ x: x, y: y, sc: sc, t: t, shake: kickHit(t, per), people: kicking(t, per) }) + kickStar(t, per, x, y, sc) + G("", T("؟", 320, 190, 140, ORANGE, 800), at(u, .5, .4));
});
// 5 · the latch cut open: the forked bolt closed round the striker; a kick does nothing
shot(5, push(320, 420, 1.04, 1.12), function (u, d, t) {
  var per = 1.1, hit = kickHit(t, per);
  return paper() + G("translate(0 " + f(-4 * hit) + ")", latchCut(320, 400, 1.3, 0, u > 1.2 ? (u > 2.6 ? "striker" : "hook") : "", t)) +
    label(290, 330, 430, 200, "خطاف حديد", OLIVE, at(u, 1.2, .5), 28) + label(330, 470, 150, 600, "حلقة حديد", OLIVE, at(u, 2.6, .5), 28) +
    arrow(320, 90, 320, 190, ORANGE, 8, .5 + .5 * hit) + impact(320, 200, (t % per) / per * 2.5 - .55, ORANGE);
});
shot([5, 1], push(320, 420, 1.12, 1.16), function (u, d, t) {
  return paper() + latchCut(320, 400, 1.3, 0, "", t) + tag("حتى في الحوادث", 320, 650, at(u, .2, .4), 30, ORANGE) + cross(320, 150, 1.4, at(u, .5, .5));
});
// 6 · «وإنت نايم متني كده…» — close in the trunk: no room, no angle
shot(6, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var per = 1.4, a = Wp([520, -96]), b = Wp([528, -124]);
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, shake: kickHit(t, per) * .3, people: kicking(t, per, .75, { eyes: 1.2, brows: "worried", mouth: "frown" }) }) +
    G("", arrow(a[0] + 40, a[1], b[0] + 40, b[1], ORANGE, 6, 1) + T("مفيش مسافة", 330, 150, 36, ORANGE, 800), at(u, .8, .4));
});
// 7 · «دوّر على مقبض صغير…» — the dark trunk, the handle starts to glow under the lid; push in to it
shot(7, function (u, d) { var h = Wp([HD[0], HD[1] + 6]), k = ease(clamp((u - .4) / Math.max(.5, d - .4))); return [lerp(330, h[0], k), lerp(440, h[1] + 40, k), lerp(1.0, 2.0, k)]; }, function (u, d, t) {
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, dark: 1, lidIn: handleSmall(at(u, .2, .8), 0, t), people: function (tt) { return reachPose(null, tt, { hands: [null, null], face: { eyes: 1.25, brows: "raised", mouth: "o" }, tilt: -30 }); } });
});
// [7, 2] · the handle close up: a T on a cable from the latch, glowing; the car-and-open-trunk mark, the pull arrows
shot([7, 2], push(320, 420, 1.0, 1.06), function (u, d, t) {
  return handleClose(t, .7 + .3 * at(u, 0, .6), 0) + label(395, 520, 540, 640, "حرف T", "#f4ecdb", at(u, .4, .5), 30) + label(250, 420, 110, 640, "بينوّر", GLOW, at(u, 1.4, .5), 30);
}, { tr: "in" });
// 8 · where it is: under the lid over the latch, or by the rear lamps
shot(8, push(330, 420, 1.0, 1.04), function (u, d, t) {
  var h = Wp([HD[0], HD[1] + 8]), lmp = Wp([556, -77]);
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, hlTail: at(u, 2.4, .5), lidIn: handleSmall(1, 0, t), people: function (tt) { return reachPose(null, tt, { hands: [null, null], face: { eyes: 1.1, brows: "raised", mouth: "neutral" }, tilt: -18 }); } }) +
    label(h[0], h[1], 470, 120, "فوق القفل", OLIVE, at(u, .3, .5), 30) + label(lmp[0], lmp[1], 470, 770, "جنب الفانوس", ORANGE, at(u, 2.4, .5), 30) + inset(140, 150, 100, '<g transform="scale(1.2) translate(0 -70)">' + handleT(0, -20, .9, 1, 0, t) + '</g>', at(u, .6, .5));
});
// 9 · «اسحبه، وبعدين زق الغطا لفوق.» — the fist pulls the handle down, the latch lets go, both hands push the lid up
function lidPt(p, lid) { var a = D2R(-55 * ease(clamp(lid))), dx = p[0] - HINGE[0], dy = p[1] - HINGE[1]; return [HINGE[0] + dx * Math.cos(a) - dy * Math.sin(a), HINGE[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
shot(9, push(330, 430, 1.0, .9), function (u, d, t) {
  var pull = at(u, .3, .5), lid = .6 * at(u, 1.3, 1.6), g = [HD[0] - 1, HD[1] + 10 + 4 * pull], hk = lid;
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, lid: lid, lidIn: handleSmall(1, pull * (1 - clamp(lid * 3)), t), people: function (tt) {
      var h0 = lid > 0 ? lidPt([512, -122], hk) : g, h1 = lid > 0 ? lidPt([496, -124], hk) : null;
      if (lid > 0 && lid < .15) h0 = L2(g, h0, lid / .15);
      return reachPose(h0, tt, { rot: lerp(-34, -4, lid / .6), hands: [h0, h1 ? (lid < .15 ? L2([462, -54], h1, lid / .15) : h1) : null], hk: ["fist", lid > 0 ? "flat" : "relaxed"], wrist: lid > 0 ? [-80, -80] : null,
        face: { eyes: 1.1, brows: lid > .5 ? "raised" : "angry", mouth: lid > .5 ? "smile" : "neutral" }, tilt: -24 });
    } }) + G("", arrow(560, 130, 560, 230, ORANGE, 7, 1) + T("اسحب", 560, 110, 36, ORANGE, 800), at(u, .2, .3) * (1 - at(u, 1.2, .3))) + G("", arrow(150, 330, 150, 200, OLIVE, 7, 1) + T("زق", 150, 370, 40, OLIVE, 800), at(u, 1.3, .4));
});

// the handle close-up scene (dark lid underside, latch box, cable, glowing T)
function handleClose(t, gl, pull) {
  var s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + DARK + '"/>';
  for (var i = 0; i < 5; i++) s += P("M" + (-60 + i * 170) + " -40 L" + (20 + i * 170) + " 300 L" + (90 + i * 170) + " 300 L" + (10 + i * 170) + " -40 Z", DARK2, 1.4);   // ribs of the lid's inner panel
  s += R(-60, 290, 760, 40, "#26272a", 2) + R(170, 180, 300, 140, "#55575c", 2.6, 14) + R(200, 300, 240, 70, "#46484c", 2.4, 8) + C(230, 230, 12, STEEL, 2) + C(410, 230, 12, STEEL, 2) + R(290, 340, 60, 50, "#3a3b3f", 2, 6);
  s += handleT(320, 380, 2.4, gl, pull, t);
  return s;
}

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the car at night, the trunk cut open, him inside. line 1: kicking the lid. line 2: the handle glows by his head.
  var l = LN[li], u = t - l.start, x = 600, y = 540, sc = 1.75, per = 1.0;
  var s = '<rect x="-100" y="-100" width="800" height="900" fill="' + PAPER + '"/>' + road(t, y, 0);
  s += car({ x: x, y: y, sc: sc, t: t, shake: li === 1 ? kickHit(t, per) : 0, dark: li === 1 ? .5 : 1, lidIn: li === 2 ? handleSmall(at(u, .3, .6), 0, t) : "",
    people: li === 1 ? kicking(t, per) : function (tt) { return li === 2 ? reachPose(null, tt, { hands: [null, null], face: { eyes: 1.25, brows: "raised", mouth: "o" }, tilt: -18 }) : kickPose(0, tt, { eyes: 1.2, brows: "worried", mouth: "frown" }); } });
  if (li === 1) s += kickStar(t, per, x, y, sc);
  return s;
};
SCENE.bumper = function (u, t) { return '<g transform="translate(90 40) scale(.55)">' + handleT(0, 20, 1, 1, 0, t) + '</g>'; };
SCENE.outro = function (svg, u, t) {
  return car({ x: 590, y: 270, sc: .98, t: t, lidIn: handleSmall(1, 0, t), people: function (tt) { return reachPose([HD[0] - 1, HD[1] + 10], tt, { face: { eyes: 1, brows: "raised", mouth: "smile" } }); } }) +
    callout("1", 470, 60, ease(u / .3)) + callout("2", 548, 120, ease(u / .3 - .5)) + callout("3", 120, 60, ease(u / .3 - 1)) + callout("4", 380, 120, ease(u / .3 - 1.5));
};
