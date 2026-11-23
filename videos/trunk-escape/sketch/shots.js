// ── «لو اتحبست في شنطة عربية» — drawings in the «اسكتش» hand. Reference v18 (the car in profile as a cut-away, the
// inside showing through the side) and the short the user sent (the person reclined in the trunk, knees up, kicking the
// lid; the T handle hanging on its cable under the lid). Real shapes (refs/SOURCES.md): a compact sedan to real size
// (1 m = 120 units), the rotary latch (a forked bolt closing round a U striker), the glow-in-the-dark T handle on a cable.
// People: the shared person kit (videos/_templates/people/person.js), "casual" outfit.

function L2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
function D2R(a) { return a * Math.PI / 180; }
var BODY = "#cfc4a8", BODY_D = "#b3a585", GLASS = "#cfdde3", DARK = "#2f3034", DARK2 = "#3c3d42", CARPET = "#4a4a50",
    STEEL = "#9aa2ac", STEEL_D = "#6e757e", GLOW = "#e9f2a8", GLOW_D = "#b9c86a", TAIL = "#b8452e", SEAT = "#8a8173";

// ── the car: a compact sedan in profile, front to the left, real size (1 m = 120 units): length 4.7 m (570), height
// 1.47 m (177), wheelbase 2.6 m (308), wheels 0.63 m (r 38), trunk deck 1.08 m (130). Local y 0 = the ground, up is
// negative. The trunk is cut open like v18 (dark inside, the person seen through the side); it is drawn a little deeper
// than a real one (floor 0.4 m) so a grown man fits on the page, as the short the user sent does.
var CAR_P = "M8 -44 L2 -84 Q4 -100 30 -104 L160 -118 L238 -172 Q248 -177 266 -177 L372 -175 Q384 -174 392 -168 L462 -130 L462 -100 L570 -100 L571 -52 Q569 -44 559 -44 L468 -44 A48 48 0 0 0 372 -44 L160 -44 A48 48 0 0 0 64 -44 Z";
var CABIN = "M154 -48 L162 -114 L238 -166 L372 -166 L416 -138 L416 -48 Z";
var WIN_F = "M168 -120 L240 -164 L300 -164 L300 -120 Z", WIN_R = "M310 -120 L310 -164 L370 -164 L410 -139 L410 -120 Z";
var HINGE = [462, -130];
var LID = "M462 -130 L556 -126 Q568 -124 570 -112 L570 -100 L562 -100 L562 -110 Q560 -118 552 -119 L464 -123 Z";   // closed: deck to the rear, then down the back to the latch
var TRUNK = "M420 -126 L464 -123 L552 -119 Q562 -117 562 -108 L562 -48 L420 -48 Z";   // the space inside, cut on the centre line
var TRUNK_OPEN = "M420 -126 L462 -130 L562 -100 L562 -48 L420 -48 Z", TRUNK_AIR = "M420 -126 L462 -130 L462 -400 L800 -400 L800 -100 L562 -100 L562 -48 L420 -48 Z";
var LATCH = [566, -100], RW = 420;
function wheel(x, t, spin, sw) { var a = (spin || 0) * t * 200, s = C(x, -38, 38, "#3a352e", 2.4 * sw) + C(x, -38, 24, "#a9a59c", 2 * sw) + C(x, -38, 7, INK, 0);
  for (var i = 0; i < 5; i++) { var b = (a + i * 72) * Math.PI / 180; s += '<path d="M' + f(x + Math.cos(b) * 8) + ' ' + f(-38 + Math.sin(b) * 8) + ' L' + f(x + Math.cos(b) * 21) + ' ' + f(-38 + Math.sin(b) * 21) + '" stroke="' + INK + '" stroke-width="' + f(3 * sw) + '"/>'; } return s; }
// o: {x, y (world point under the rear bumper), sc, t, lid (0 shut … 1 open, ~55°), shake (lid jolt 0..1),
//    people (fn t → local SVG inside the trunk), lidIn (local SVG on the lid: the handle), dark (0..1), hlTail}
function car(o) {
  var t = o.t || 0, sc = o.sc || 1, sw = 1 / Math.sqrt(sc), g = "";
  g += '<ellipse cx="290" cy="2" rx="284" ry="8" fill="' + INK + '" opacity=".14"/>';
  g += P(CAR_P, BODY, 2.6 * sw) + '<path d="' + CAR_P + '" fill="url(#hatch)" opacity=".3"/>';
  g += P(CABIN, "#efe6d2", 1.6 * sw);
  g += P("M154 -98 L202 -102 L204 -86 L156 -72 Z", "#7c7468", 1.6 * sw);
  g += P("M216 -66 L280 -66 L284 -52 L218 -50 Z", SEAT, 1.6 * sw) + P("M276 -66 L296 -146 Q304 -150 308 -142 L296 -58 Z", SEAT, 1.6 * sw) + R(294, -160, 16, 18, SEAT, 1.4 * sw, 4);
  g += P("M338 -64 L396 -64 L400 -50 L340 -48 Z", SEAT, 1.6 * sw) + P("M390 -64 L402 -128 Q408 -132 414 -126 L410 -56 Z", SEAT, 1.6 * sw);
  g += wheel(112, t, o.spin, sw) + wheel(RW, t, o.spin, sw);
  // the trunk, cut open (on the centre line, so the near wheel goes behind the cut)
  var tid = "tr" + (++CLIPN), lk = clamp((o.lid || 0) * 4);
  g += P(TRUNK_OPEN, DARK, 1.6 * sw) + G("", P(TRUNK, DARK, 0), 1 - lk) + R(420, -52, 142, 4, CARPET, 0);
  g += '<clipPath id="' + tid + '"><path d="' + (lk > 0 ? TRUNK_AIR : TRUNK) + '"/></clipPath><g clip-path="url(#' + tid + ')">';
  if (o.people) g += o.people(t);
  if (o.dark) g += '<rect x="420" y="-140" width="160" height="100" fill="#000" opacity="' + f(.22 * o.dark) + '"/>';
  g += '</g>' + P(lk > 0 ? TRUNK_OPEN : TRUNK, "none", 2 * sw);
  g += '<g opacity=".7"><path d="' + WIN_F + '" fill="' + GLASS + '"/><path d="' + WIN_R + '" fill="' + GLASS + '"/></g>' + P(WIN_F, "none", 2 * sw) + P(WIN_R, "none", 2 * sw) + R(300, -166, 10, 120, BODY, 2 * sw);
  g += '<path d="M160 -118 L156 -48 M300 -118 L300 -46 M416 -138 L416 -60" stroke="' + INK + '" stroke-width="' + f(1.8 * sw) + '" fill="none"/>' + R(258, -102, 22, 6, INK, 0, 3) + R(390, -102, 22, 6, INK, 0, 3);
  g += P("M6 -88 L26 -96 L28 -86 L8 -82 Z", "#f4efe3", 1.4 * sw);
  g += P("M562 -100 L570.5 -100 L571 -80 L563 -80 Z", TAIL, 1.4 * sw, o.hlTail ? ' style="filter:drop-shadow(0 0 ' + f(5 * o.hlTail) + 'px ' + ORANGE + ')"' : "");
  var ang = -55 * ease(clamp(o.lid || 0)) - 1.4 * (o.shake || 0);
  g += G("rotate(" + f(ang) + " " + HINGE[0] + " " + HINGE[1] + ")", P(LID, BODY, 2.2 * sw) + '<path d="' + LID + '" fill="url(#hatch)" opacity=".3"/>' + (o.lidIn || ""));
  return G("translate(" + f(o.x) + " " + f(o.y) + ") scale(" + f(sc) + ") translate(-570 0)", g);
}

// ── the person in the trunk: reclined on his back, head toward the rear (by the latch and the handle), knees up toward
// the seat (as in the short the user sent). PERSON.side in the car's local units (s = .5, a 1.67 m man in 1 m = 120).
// Legs and arms are posed by where the feet and hands must land (two-bone IK on the kit's real segment lengths), keeping
// the knee flexion ≥ 0 and the elbow flexion ≥ 0, so the joints only bend the real way and stay in one flowing outline.
var PS = .5, DIR = -1, THIGH = 98 * PS, SHIN = 98 * PS, UARM = 74 * PS, FARM = 58 * PS;
function ik2(a, b, l1, l2, side) { var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), an = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, .01)))); return [a[0] + Math.cos(an + side * c) * l1, a[1] + Math.sin(an + side * c) * l1]; }
// a world direction → the kit's local angle (deg from straight down, + forward) for a body at rot (deg), facing DIR
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
// o: {hip, rot, feet [[x,y],[x,y]] ankle targets, hands [[x,y] | null, …] wrist targets (null = on the belly), hk hand kinds,
//     straight [bool, bool], ankle (foot tilt), face, tilt, t}
var HIP = [452, -56], ROT = 62;
function trapped(o) {
  var t = o.t || 0, rot = o.rot == null ? ROT : o.rot, hip = o.hip || HIP, sh = kitW(hip[0], hip[1], rot, [-2, -117]);
  var legs = o.feet.map(function (a) { var L = legTo(hip, a, rot); L.ankle = o.ankle == null ? 10 : o.ankle; return L; });
  var belly = kitW(hip[0], hip[1], rot, [34, -50]), belly2 = kitW(hip[0], hip[1], rot, [30, -36]);
  var arms = [0, 1].map(function (i) { var w = (o.hands && o.hands[i]) || (i ? belly2 : belly), A = armTo(sh, w, rot, o.straight && o.straight[i]); A.hand = (o.hk && o.hk[i]) || "relaxed"; if (o.wrist) A.wrist = o.wrist[i]; return A; });
  var P_ = PERSON.side({ x: hip[0], y: hip[1], s: PS, dir: DIR, rot: rot, outfit: "casual", breath: (Math.sin(t * 3.1) + 1) / 2, legs: legs, arms: arms,
    head: { tilt: o.tilt || 0 }, face: Object.assign({ eyes: 1.2, brows: "worried", mouth: "open" }, o.face || {}) });
  return P_.svg;
}
// knees drawn in (k 0) … feet hit the lid (k 1)
var FEET_IN = [[434, -98], [440, -94]], FEET_HIT = [[458, -122], [470, -121]];
function kickPose(k, t, face) {
  var k2 = clamp(k * 1.2 - .15);
  return trapped({ feet: [L2(FEET_IN[0], FEET_HIT[0], k), L2(FEET_IN[1], FEET_HIT[1], k2)], ankle: lerp(-20, -55, k), hands: [[492 - 3 * k, -53], [482, -54]], hk: ["flat", "flat"], wrist: [-60, -60], face: face, t: t, tilt: 6 * k });
}
// slid down toward the seat, knees up, feet flat on the floor: the pose for reaching the handle over the face
var HIP_R = [440, -60], FEET_R = [[414, -56], [422, -56]];
function reachPose(hand, t, o) {
  o = o || {};
  return trapped(Object.assign({ hip: HIP_R, rot: 84, feet: FEET_R, ankle: 30, hands: [hand, [462, -54]], hk: ["fist", "relaxed"], t: t, tilt: -14, face: { eyes: 1.1, brows: "angry", mouth: "neutral" } }, o));
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
var HD = [546, -119];   // where the handle hangs under the lid (local)
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
  var per = 1.4, a = Wp([476, -96]), b = Wp([466, -128]);
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
  var h = Wp([HD[0], HD[1] + 8]), lmp = Wp([567, -90]);
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, hlTail: at(u, 2.4, .5), lidIn: handleSmall(1, 0, t), people: function (tt) { return reachPose(null, tt, { hands: [null, null], face: { eyes: 1.1, brows: "raised", mouth: "neutral" }, tilt: -18 }); } }) +
    label(h[0], h[1], 470, 120, "فوق القفل", OLIVE, at(u, .3, .5), 30) + label(lmp[0], lmp[1], 470, 770, "جنب الفانوس", ORANGE, at(u, 2.4, .5), 30) + inset(140, 150, 100, '<g transform="scale(1.2) translate(0 -70)">' + handleT(0, -20, .9, 1, 0, t) + '</g>', at(u, .6, .5));
});
// 9 · «اسحبه، وبعدين زق الغطا لفوق.» — the fist pulls the handle down, the latch lets go, both hands push the lid up
function lidPt(p, lid) { var a = D2R(-55 * ease(clamp(lid))), dx = p[0] - HINGE[0], dy = p[1] - HINGE[1]; return [HINGE[0] + dx * Math.cos(a) - dy * Math.sin(a), HINGE[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
shot(9, push(330, 430, 1.0, .9), function (u, d, t) {
  var pull = at(u, .3, .5), lid = at(u, 1.3, 1.4), g = [HD[0] - 1, HD[1] + 10 + 4 * pull], hk = Math.min(lid, .45);
  return paper() + road(0, Y) + car({ x: X, y: Y, sc: S, t: t, lid: lid, lidIn: handleSmall(1, pull * (1 - clamp(lid * 3)), t), people: function (tt) {
      var h0 = lid > 0 ? lidPt([520, -118], hk) : g, h1 = lid > 0 ? lidPt([498, -120], hk) : null;
      if (lid > 0 && lid < .15) h0 = L2(g, h0, lid / .15);
      return reachPose(h0, tt, { hands: [h0, h1 ? (lid < .15 ? L2([462, -54], h1, lid / .15) : h1) : null], hk: ["fist", lid > 0 ? "flat" : "relaxed"], wrist: lid > 0 ? [-80, -80] : null,
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
