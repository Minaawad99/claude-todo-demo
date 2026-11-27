// ── «How plasma donation works» — shots. Drawings in draw.js (PL.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: one drawing holds dead still for several lines, then flies (eased, ~1.8 s) onto the part
// being talked about and later back out. The life between moves is in the drawing: pumps turn, blood runs in the tubes,
// the bowl spins, the bottle fills, the donor breathes and blinks.
var DONOR = { outfit: { base: "casual", colors: { shirt: "#6f8fa8", shirtD: "#557590", pants: "#3f4a5c", pantsD: "#2e3646" } } };
var TECH = { outfit: { base: "casual", colors: { shirt: "#5e9c96", shirtD: "#467d78", pants: "#5e9c96", pantsD: "#467d78" } } };   // scrubs: top and trousers the same teal
function blink(t, ph) { return Math.sin(t * 2.1 + (ph || 0)) > .985 ? .08 : 1; }
function spinA(t) { return t * 7; }
// the donor reclined on the donation bed, seen from the side (the user's note: side view, the bed and the arm showing),
// his near arm stretched along the arm rest toward the machine beside the bed
var REC = -52;   // how far the bed tips him back (deg)
function donor(x, hipY, s, t, o) {
  o = o || {};
  return PERSON.side(Object.assign({ x: x, y: hipY, s: s, dir: 1, rot: REC, breath: .5 + .5 * Math.sin(t * 1.6),
    legs: [{ hip: 58, knee: 34, ankle: -12 }, { hip: 54, knee: 38, ankle: -12 }],
    arms: [{ sh: 30 + (o.armUp || 0), el: 2, hand: o.fist ? "fist" : "relaxed" }, { sh: 6, el: 18, hand: "relaxed" }],
    head: { tilt: 18 + 2 * Math.sin(t * .8) }, face: Object.assign({ eyes: blink(t), brows: "neutral", mouth: "smile" }, o.face || {}) }, DONOR));
}
// the donation bed in profile, built round the donor's joints: base and post, seat, tipped back rest with a head pillow,
// raised leg rest, and the padded arm rest (white pad on top, as in the photo) under the stretched arm
function bed(J, s, H) {
  var K = J.knee, A = J.ankle || [K[0] + 80, K[1] + 40];
  var a = REC * Math.PI / 180, ux = -Math.sin(-a), uy = -Math.cos(-a);   // along the back rest, toward the head
  var px = Math.cos(a), py = Math.sin(a);                               // across it
  var off = 30 * s, b0 = [H[0] - px * off, H[1] + 48 * s], len = 250 * s;
  function Pt(u, v) { return [b0[0] + ux * u + px * v, b0[1] + uy * u + py * v]; }
  var back = PL.shape([Pt(0, -4 * s), Pt(len, -4 * s), Pt(len + 10 * s, 26 * s), Pt(0, 40 * s)], "#5d6b62", 2.6);
  var pillow = PL.shape([Pt(len - 70 * s, -18 * s), Pt(len + 4 * s, -18 * s), Pt(len + 8 * s, 4 * s), Pt(len - 70 * s, 6 * s)], "#e9e4d6", 2.2);
  var seat = R(H[0] - 70 * s, H[1] + 34 * s, (K[0] - H[0]) + 110 * s, 40 * s, "#5d6b62", 2.6, 12);
  var lr0 = [K[0] + 16 * s, K[1] + 40 * s], lr1 = [A[0] + 50 * s, A[1] + 30 * s];
  var legrest = PL.shape([[lr0[0] - 30 * s, lr0[1] - 10 * s], [lr1[0], lr1[1] - 6 * s], [lr1[0] + 4 * s, lr1[1] + 30 * s], [lr0[0] - 30 * s, lr0[1] + 32 * s]], "#5d6b62", 2.6);
  var fl = H[1] + 230 * s, base = R(H[0] - 110 * s, fl - 26 * s, 300 * s, 26 * s, "#8c8c86", 2.4, 6) + R(H[0] + 10 * s, H[1] + 74 * s, 34 * s, fl - H[1] - 100 * s, "#8c8c86", 2.2) +
    C(H[0] - 90 * s, fl + 6 * s, 9 * s, "#4a4a48", 1.6) + C(H[0] + 170 * s, fl + 6 * s, 9 * s, "#4a4a48", 1.6);
  return { under: base + legrest + seat + back + pillow, floor: fl };
}
function armRest(J, s) {   // the arm rest sits under the stretched near arm, from the elbow to past the hand
  var e = J.elbow0 || J.elbow, w = J.wrist0 || J.wrist; if (!e || !w) return "";
  var y = Math.max(e[1], w[1]) + 14 * s, x0 = e[0] - 70 * s, x1 = w[0] + 70 * s;
  return R(x0, y, x1 - x0, 22 * s, "#46524a", 2.2, 8) + R(x0 + 6 * s, y - 7 * s, x1 - x0 - 12 * s, 9 * s, "#f6f3ea", 1.6, 4) + R((x0 + x1) / 2 - 8 * s, y + 22 * s, 16 * s, 130 * s, "#8c8c86", 2);
}
function room(t, o) {   // the whole station, from the side: the bed with the donor, the tube to the machine beside it
  o = o || {}; var s = .9, hx = 250, hy = 540;
  var m = PL.machine(452, 190, .82, { k: o.k || 0, spin: o.run ? spinA(t) : 0, flow: o.run, glow: o.glow, ml: o.ml }, t);
  var p = donor(hx, hy, s, t, o.donor), J = p.joints, b = bed(J, s, [hx, hy]);
  var e = J.elbow0 || J.elbow || [hx + 100, hy - 60];
  var tubeCol = o.k != null || o.run ? PL.RED : "#e4e0d6";
  var d = "M" + f(e[0] + 10) + " " + f(e[1] + 6) + " C" + f(e[0] + 110) + " " + f(e[1] + 30) + " " + f(m.J.inlet[0] - 90) + " " + f(m.J.inlet[1] + 10) + " " + f(m.J.inlet[0]) + " " + f(m.J.inlet[1]);
  var floor = '<rect x="-400" y="' + f(b.floor + 14) + '" width="1500" height="400" fill="#ddd2b8"/>' + PL.line([[-400, b.floor + 14], [1100, b.floor + 14]], INK, 2.2);
  return { svg: floor + b.under + armRest(J, s) + p.svg + PL.tube(d, tubeCol, 5, o.run ? 1 : 0, t) + m.svg, J: m.J, wrist: [e[0] + 10, e[1] + 6], joints: J };
}
// ── small drawings for single shots ──
var ROOM = [330, 455, 1.0], BOWLZ = [596, 362, 2.6], BOTTLEZ = [600, 620, 2.3], ARMZ = [340, 565, 2.0];
function chip(txt, x, y, col, k, sz) { k = pop(k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .58 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .95) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '"/>' + T(txt, 0, sz * .38, sz, "#fbf8f1", 800)); }
function qmark(x, y, k, sz) { return G("", T("?", x, y, sz || 130, ORANGE, 800), k == null ? 1 : k); }
function stopwatch(x, y, r, k, t) { var a = k * Math.PI * 2; return C(x, y, r, "#fbf8f1", 3) + R(x - 8, y - r - 16, 16, 12, INK, 0) + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.sin(a) * r) + ' ' + f(y - Math.cos(a) * r) + ' Z" fill="' + ORANGE + '" opacity=".35"/>' + PL.line([[x, y], [x + Math.sin(a) * r * .85, y - Math.cos(a) * r * .85]], ORANGE, 5) + C(x, y, 5, ORANGE, 0); }
function bowlScene(t, sep, o) { o = o || {}; return PL.bowl(320, 420, 160, { sep: sep, a: spinA(t) }, t) + (o.lab ? label(320, 150, 470, 120, "blood in", INK, o.lab, 20) : ""); }
function armScene(t, o) { return '<rect x="-400" y="-400" width="1500" height="1600" fill="#e6dfcf"/>' + PL.arm(430, 420, 1, o, t); }
// the clinic front with its sign, the donor walking in (side view)
function clinic(t, k) {
  var s = '<rect x="-300" y="690" width="1300" height="200" fill="#d8ccae"/>' + PL.line([[-300, 690], [1000, 690]], INK, 2.4) +
    R(60, 160, 520, 530, "#e8e2d2", 2.6) + R(60, 160, 520, 90, BLUE, 2.6) + T("PLASMA CENTER", 320, 220, 40, "#fbf8f1", 800) +
    R(300, 330, 200, 360, "#cfe0ea", 2.4) + PL.line([[400, 330], [400, 690]], INK, 2.4) + R(96, 330, 160, 200, "#cfe0ea", 2.4) + PL.line([[176, 330], [176, 530]], INK, 1.6) +
    T("OPEN", 176, 470, 22, ORANGE, 800) + PL.line([[384, 500], [384, 540]], INK, 5) + PL.line([[416, 500], [416, 540]], INK, 5);
  var ph = t * 5.2, x = lerp(-40, 330, k), hy = PERSON.sideHipY({ s: .95 }, 690) || 690 - 200;
  var pose = PERSON.walkPose(ph, 1);
  return s + PERSON.side(Object.assign({ x: x, y: hy, s: .95, dir: 1, legs: pose.legs, arms: pose.arms, face: { eyes: blink(t), mouth: "smile" } }, DONOR)).svg;
}
function weighIn(t, u) {   // the donor stands on a medical scale, the reading counts up
  var p = PERSON.front(Object.assign({ x: 250, y: 658 - 208, s: 1.0, legs: "stand", breath: .5 + .5 * Math.sin(t * 1.6), head: { tilt: 2 * Math.sin(t * .8) }, face: { eyes: blink(t), mouth: "smile", look: [.6, -.2] },
    arms: [{ rel: [-22, 150], hand: "relaxed" }, { rel: [22, 150], hand: "relaxed" }] }, DONOR));
  return '<rect x="-300" y="666" width="1300" height="300" fill="#d8ccae"/>' + PL.line([[-300, 666], [1000, 666]], INK, 2.4) + PL.scale(250, 668, 1.4, count(165, at(u, .2, 1.2)) + " lb") + p.svg + PL.scale(250, 680, 1.4, "", true);
}
function finger(t, u) {   // a fingertip, a lancet, a drop of blood, the reader
  var drop = at(u, .5, .6), hand = PERSON.hand([110, 470], -.12, "point", 1, 4.2), tip = [110 + 44 * 4.2 * Math.cos(-.12), 470 + 44 * 4.2 * Math.sin(-.12)];
  return hand + PL.line([[tip[0] + 20, tip[1] - 120], [tip[0] + 6, tip[1] - 34]], "#9aa0a4", 6) + R(tip[0] + 6, tip[1] - 220, 40, 100, "#e8e4da", 2.4, 8) + G("", '<path d="M' + f(tip[0] - 6) + ' ' + f(tip[1] - 64) + ' q16 26 0 40 q-16 -14 0 -40 Z" fill="' + PL.RED + '" stroke="' + INK + '" stroke-width="2"/>', drop) +
    R(470, 520, 140, 170, "#e8e4da", 2.4, 10) + R(484, 534, 112, 70, "#cfe0ea", 1.8, 4) + T("IRON", 540, 562, 18, INK, 800) + T(at(u, 1.2, .3) > .5 ? "OK ✓" : "…", 540, 592, 22, at(u, 1.2, .3) > .5 ? "#3b7a4c" : INK, 800);
}
function calendar(x, y, cols, rows, marks, title, k, col) {   // a little calendar grid with blood drops on the donation days
  var cw = 56, ch = 46, w = cols * cw, s = R(x, y, w, 50 + rows * ch, "#fbf8f1", 2.4) + R(x, y, w, 50, col || ORANGE, 2.4) + T(title, x + w / 2, y + 34, 22, "#fbf8f1", 800);
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var cx = x + c * cw, cy = y + 50 + r * ch, i = r * cols + c; s += R(cx, cy, cw, ch, "none", 1); if (marks.indexOf(i) >= 0 && k > marks.indexOf(i) / marks.length) s += '<path d="M' + f(cx + cw / 2) + ' ' + f(cy + 8) + ' q14 18 0 30 q-14 -12 0 -30 Z" fill="' + (col === BLUE ? PL.RED : PL.PLASMA) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return s;
}
function gauge(x, y, w, k, col, name, sub) { return T(name, x, y - 16, 30, INK, 800, "start") + R(x, y, w, 50, "#fbf8f1", 2.4, 6) + R(x, y, w * clamp(k), 50, col, 0, 6) + R(x, y, w, 50, "none", 2.4, 6) + (sub ? T(sub, x + w, y + 90, 30, ORANGE, 800, "end") : ""); }
function dollar(x, y, k) { k = pop(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ') rotate(-6)', R(-90, -46, 180, 92, "#c9d9b4", 2.6, 6) + R(-78, -34, 156, 68, "none", 1.4, 4) + C(0, 0, 26, "#dde8cc", 1.8) + N("$", 0, 14, 36, "#3e5a2e") + N("50", -56, -10, 20, "#3e5a2e") + N("50", 56, 26, 20, "#3e5a2e")); }
function vial(x, y, col, name, k) { k = pop(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', R(-26, -60, 52, 110, "#fbf8f1", 2.4, 8) + R(-26, -10, 52, 60, col, 0, 0) + R(-26, -60, 52, 110, "none", 2.4, 8) + R(-20, -80, 40, 22, "#8a9aa8", 2, 3) + R(-26, 0, 52, 30, "#fbf8f1", 1.4) + T("Rx", 0, 22, 16, INK, 800) + T(name, 0, 86, 19, INK, 800)); }
function factory(x, y) { return PL.shape([[x - 90, y], [x - 90, y - 80], [x - 50, y - 110], [x - 50, y - 80], [x - 10, y - 110], [x - 10, y - 80], [x + 30, y - 110], [x + 30, y - 80], [x + 90, y - 80], [x + 90, y]], "#d8ccae", 2.6) + R(x + 52, y - 160, 22, 80, "#c6c6c0", 2.2) + R(x - 70, y - 50, 30, 30, "#cfe0ea", 1.8) + R(x - 20, y - 50, 30, 30, "#cfe0ea", 1.8) + R(x + 30, y - 50, 30, 30, "#cfe0ea", 1.8); }
function smoke(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var u = (t * .5 + i / 3) % 1; s += G("", C(x + u * 30, y - u * 80, 10 + u * 14, "#e3ddd0", 1.4), 1 - u); } return s; }
function waterDrop(x, y, sz) { return '<path d="M' + x + ' ' + (y - sz) + ' C' + (x + sz * .9) + ' ' + (y - sz * .1) + ' ' + (x + sz * .7) + ' ' + (y + sz * .8) + ' ' + x + ' ' + (y + sz * .8) + ' C' + (x - sz * .7) + ' ' + (y + sz * .8) + ' ' + (x - sz * .9) + ' ' + (y - sz * .1) + ' ' + x + ' ' + (y - sz) + ' Z" fill="#9cc3dd" stroke="' + INK + '" stroke-width="2.4"/>'; }
function glassW(x, y) { return PL.shape([[x - 40, y - 70], [x - 32, y + 60], [x + 32, y + 60], [x + 40, y - 70]], "#fbf8f1", 2.4) + PL.shape([[x - 37, y - 40], [x - 32, y + 60], [x + 32, y + 60], [x + 37, y - 40]], "#bcd6e6", 0); }
function sandwich(x, y) { return PL.shape([[x - 70, y + 20], [x, y - 40], [x + 70, y + 20]], "#e8c88e", 2.4) + R(x - 74, y + 20, 148, 12, "#7aa35a", 2) + R(x - 74, y + 32, 148, 12, "#c96a5a", 2) + PL.shape([[x - 70, y + 44], [x + 70, y + 44], [x, y + 90]], "#e8c88e", 2.4); }
function patient(x, y, s, t, face) {   // a patient, standing, front
  return PERSON.front({ x: x, y: y, s: s, legs: "stand", breath: .5 + .5 * Math.sin(t * 1.6), head: { tilt: 2 * Math.sin(t * .7) }, face: Object.assign({ eyes: blink(t, 1), mouth: "smile" }, face || {}), arms: [{ rel: [-22, 150], hand: "relaxed" }, { rel: [22, 150], hand: "relaxed" }], outfit: { base: "home", colors: { shirt: "#c98f6a", shirtD: "#a87050" } } }).svg;
}
function tubeScene(sep, u, o) { o = o || {}; var tt = PL.testTube(320, 120, 120, 560, sep); return { svg: tt.svg, tt: tt }; }

// 4 · First, one quick rule. Keep it in mind. — a tube of blood, a framed «RULE»
shot(4, still(320, 400, 1), function (u, d, t) { var tt = tubeScene(0); return paper() + appear(at(u, 0, .5), tt.svg) + tag("RULE", 320, 66, at(u, .3, .3), 30, ORANGE) + G("", T("keep it in mind", 520, 360, 22, MUTE, 700), at(u, 1, .4)); });
// 5 · Your blood is more than half plasma, a yellow liquid. The rest is mostly red cells.
shot([5, 1], still(320, 400, 1), function (u, d, t) {
  var k = at(u, 0, 1.6), tt = PL.testTube(320, 120, 120, 560, k); return paper() + tt.svg + (k > .9 ? measure(430, tt.y0, 430, tt.split, at(u, 1.6, .6), "") + G("", N("55%", 520, (tt.y0 + tt.split) / 2 + 12, 40, ORANGE), at(u, 2, .3)) : "");
});
shot([5, 2], fly([320, 400, 1], [320, 300, 1.6], 1.8), function (u, d, t) { var tt = PL.testTube(320, 120, 120, 560, 1); return paper() + tt.svg + label(320, 250, 190, 210, "plasma", ORANGE, at(u, .3, .6), 26) + G("", N("55%", 450, 330, 36, ORANGE), 1); });
shot([5, 3], fly([320, 300, 1.6], [320, 560, 1.6], 1.8), function (u, d, t) { var tt = PL.testTube(320, 120, 120, 560, 1); return paper() + tt.svg + label(320, 250, 190, 210, "plasma", ORANGE, 1, 26) + label(330, 560, 200, 640, "red cells", PL.RED, at(u, .8, .6), 26) + G("", N("45%", 440, 600, 36, PL.RED), at(u, 1.2, .3)); });
// 6 · So what happens when you walk in? — the clinic front, the donor walks to the door
shot(6, still(320, 420, 1), function (u, d, t) { return paper() + clinic(t, at(u, 0, d + .4)) + qmark(560, 140, at(u, .4, .3), 110); });
// 7 · weigh, blood pressure, finger prick
shot(7, still(320, 400, 1), function (u, d, t) { return paper() + weighIn(t, u); });
shot([7, 1], still(320, 400, 1), function (u, d, t) { var bp = at(u, .2, 1.2); return paper() + PL.monitor(320, 330, 2.0, Math.round(lerp(140, 118, bp)), Math.round(lerp(90, 76, bp)), Math.round(lerp(88, 72, bp))) + G("", T("blood pressure", 320, 600, 30, OLIVE, 800), at(u, .2, .3)); });
shot([7, 2], still(320, 420, 1), function (u, d, t) { return paper() + finger(t, u); });
// 8 · Then one needle goes into a vein in your arm.
shot(8, still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { return paper() + room(t, {}).svg; });
shot([8, 1], still(330, 400, 1), function (u, d, t) { return armScene(t, { needle: at(u, .1, .9), k: 0 }) + label(400, 405, 520, 250, "vein", BLUE, at(u, .9, .5), 26) + G("", T("one needle", 200, 230, 30, ORANGE, 800), at(u, 1, .3)); });
// 9 · So where does the blood go? — the tube fills, then the question
shot(9, still(330, 400, 1), function (u, d, t) { return armScene(t, { needle: 1, k: 1, flow: 1, squeeze: true }) + qmark(560, 200, at(u, .5, .3), 130); });
// 10 · Into a machine with a bowl that spins thousands of times a minute.
shot(10, fly(ROOM, BOWLZ, 1.6), function (u, d, t) { return paper() + room(t, { run: true, k: .05, glow: at(u, 1.0, .4) }).svg + label(BOWLZ[0] - 20, BOWLZ[1] - 50, BOWLZ[0] - 90, BOWLZ[1] - 90, "centrifuge", OLIVE, at(u, 1.2, .4), 12); });
// the centrifuge up close, as it sits in the machine (the user's note: show it still first, then spinning)
// speed: still for the first stretch, then an eased spin-up; the angle is the integral of the speed so the ribs never jump
var SPIN0 = 0;   // set per shot: when the bowl starts turning (absolute time)
function spinAt(t, t0, ramp) { var x = t - t0; if (x <= 0) return { w: 0, a: 0 }; var r = ramp || 1.6; return x < r ? { w: x / r, a: 9 * x * x / (2 * r) } : { w: 1, a: 9 * r / 2 + 9 * (x - r) }; }
function rpmBox(w, k) { return numBox(w < .02 ? "0 rpm" : Math.round(4800 * ease(w) / 50) * 50 + " rpm", 320, 712, k == null ? 1 : k, 30, true); }
function cf(t, o) { return PL.centrifuge(320, 430, 150, o, t); }
shot([10, 1], still(320, 400, 1), function (u, d, t) {
  var t0 = LN[10].start + (LN[10].end - LN[10].start) * window.CHUNKS[10][2] + .15, sp = spinAt(t, t0, 1.6), fill = at(u, 0, .9);
  return paper() + cf(t, { fill: fill, w: sp.w, a: sp.a, flowIn: 1 }) + (sp.w > 0 ? "" : chip("still", 320, 90, MUTE, at(u, .1, .3), 24)) + G("", chip("spinning", 320, 90, ORANGE, 1, 24), clamp(sp.w * 3)) + rpmBox(sp.w);
});
shot([10, 3], still(320, 400, 1), function (u, d, t) { var sp = spinAt(t, LN[10].start + (LN[10].end - LN[10].start) * window.CHUNKS[10][2] + .15, 1.6); return paper() + cf(t, { fill: 1, w: sp.w, a: sp.a, flowIn: 1 }) + chip("1000s of spins a minute", 320, 90, ORANGE, 1, 24) + rpmBox(sp.w); });
// 11 · like fresh juice: the pulp sinks, the clear part floats; except this takes seconds
shot(11, still(320, 400, 1), function (u, d, t) { return paper() + PL.juice(320, 380, 2.2, 0) + T("fresh juice", 320, 690, 28, INK, 800); });
shot([11, 2], still(320, 400, 1), function (u, d, t) { var k = at(u, 0, 2.2); return paper() + PL.juice(320, 380, 2.2, k) + label(330, 480, 480, 600, "pulp sinks", ORANGE, at(u, .4, .5), 22) + label(320, 300, 470, 200, "clear part floats", BLUE, at(u, 1.6, .5), 22); });
shot([11, 4], still(320, 400, 1), function (u, d, t) { var k = at(u, .2, 1.6), a = 9 * (t - 20); return paper() + cf(t, { fill: 1, sep: k, w: 1, a: a, flowIn: 1 }) + rpmBox(1) + iconBox(540, 120, 150, stopwatch(0, 8, 46, (u * .5) % 1, t), at(u, 0, .3)); });
// 12 · red cells flung outward (the bowl in the machine, then cut open); the plasma flows out to a plastic bottle
shot(12, still(320, 400, 1), function (u, d, t) { var a = 9 * (t - 20); return paper() + cf(t, { fill: 1, sep: 1, w: 1, a: a, flowIn: 1 }) + arrow(250, 520, 185, 520, PL.RED, 7, at(u, .2, .4)) + arrow(390, 520, 455, 520, PL.RED, 7, at(u, .2, .4)) + label(470, 470, 600, 330, "red cells", PL.RED, at(u, .6, .5), 22) +
  inset(110, 180, 80, '<ellipse rx="70" ry="70" fill="' + PL.RED + '" stroke="' + INK + '" stroke-width="2"/><circle r="40" fill="' + PL.PLASMA + '" stroke="' + INK + '" stroke-width="2"/>' + '<g transform="rotate(' + f(a * 57.3 % 360) + ')"><path d="M0 -55 A55 55 0 0 1 55 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></g>', at(u, .9, .3)) + G("", T("from above", 110, 285, 18, INK, 800), at(u, 1.1, .3)); });
shot([12, 2], still(320, 400, 1), function (u, d, t) { var a = 9 * (t - 20); return paper() + cf(t, { fill: 1, sep: 1, w: 1, a: a, flowIn: 1, flowOut: 1 }) + label(320, 470, 180, 640, "plasma", ORANGE, at(u, .1, .5), 26) + arrow(560, 190, 630, 190, ORANGE, 6, at(u, .3, .5)); });
shot([12, 3], fly(BOWLZ, BOTTLEZ, 1.8), function (u, d, t) { return paper() + room(t, { run: true, k: .1 + .2 * at(u, 0, d) }).svg; });
// 13 · So what about the red cells?
shot(13, still(320, 400, 1), function (u, d, t) { var a = 9 * (t - 20); return paper() + cf(t, { fill: 1, sep: 1, w: 1, a: a, flowIn: 1, flowOut: 1 }) + '<rect x="150" y="300" width="70" height="300" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="12 9" rx="10"/><rect x="420" y="300" width="70" height="300" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="12 9" rx="10"/>' + qmark(560, 180, at(u, .2, .3), 120); });
// 14 · pumped back into you, through the same needle, with some salt water
shot(14, still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { var r = room(t, { run: true, k: .35 }), w = r.wrist; return paper() + r.svg + arrow(r.J.inlet[0] - 6, r.J.inlet[1] + 14, w[0] + 50, w[1] + 34, ORANGE, 6, at(u, .3, .8)) + G("", T("back", 330, 760, 30, ORANGE, 800), at(u, .8, .3)); });
shot([14, 2], still(330, 400, 1), function (u, d, t) { return armScene(t, { needle: 1, k: 1, flow: -1 }) + chip("same needle", 400, 250, ORANGE, at(u, .2, .3), 24); });
shot([14, 3], fly(ROOM, [590, 200, 2.0], 1.4), function (u, d, t) { return paper() + room(t, { run: true, k: .4 }).svg + label(578, 185, 500, 160, "salt water", BLUE, at(u, .9, .5), 14); });
// 15 · Draw, spin, return. Over and over, for about an hour.
function cycle(u, t, n) {
  var r = room(t, { run: true, k: .45 + .1 * at(u, 0, 3) }), w = r.wrist;
  return paper() + r.svg + callout("1", w[0] + 60, w[1] - 40, n >= 1 ? 1 : 0, 22) + callout("2", 600, 280, n >= 2 ? 1 : 0, 22) + callout("3", w[0] + 130, w[1] + 70, n >= 3 ? 1 : 0, 22);
}
shot(15, still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { var l = LN[15], c = (t - l.start) / (l.end - l.start); return cycle(u, t, c < .14 ? 1 : c < .26 ? 2 : 3); });
shot([15, 1], still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { return cycle(u, t, 3) + iconBox(130, 160, 150, stopwatch(0, 8, 46, at(u, 0, d + .5), t) + T("1 hour", 0, 66, 18, INK, 800), at(u, .3, .3)); });
// 16 · Until the bottle holds almost a liter of plasma.
shot(16, fly(ROOM, BOTTLEZ, 1.8), function (u, d, t) { var k = .55 + .45 * at(u, .6, d); return paper() + room(t, { run: true, k: k }).svg + G("", N("~1 L", 500, 660, 28, ORANGE), at(u, 1.6, .3)); });
// 17 · twice a week vs regular blood every two months
shot(17, still(320, 400, 1), function (u, d, t) { return paper() + calendar(124, 140, 7, 1, [1, 4], "PLASMA · 1 WEEK", at(u, .2, 1.2), ORANGE) + T("2×", 320, 330, 60, ORANGE, 800); });
shot([17, 2], still(320, 400, 1), function (u, d, t) { return paper() + calendar(124, 140, 7, 1, [1, 4], "PLASMA · 1 WEEK", 1, ORANGE) + T("2×", 320, 330, 60, ORANGE, 800) + calendar(124, 380, 7, 8, [3], "WHOLE BLOOD · 2 MONTHS", at(u, .3, .5), BLUE); });
// 18 · plasma refills in a day or two; red cells take weeks
shot(18, still(320, 400, 1), function (u, d, t) { var k = at(u, .4, Math.max(1.4, d - .6)); return paper() + gauge(80, 300, 480, .3 + .7 * k, PL.PLASMA, "plasma", k > .98 ? "1–2 days" : "") + gauge(80, 520, 480, .3 + .7 * at(u, .4, 30), PL.RED, "red cells", ""); });
shot([18, 3], still(320, 400, 1), function (u, d, t) { return paper() + gauge(80, 300, 480, 1, PL.PLASMA, "plasma", "1–2 days") + gauge(80, 520, 480, .32 + .03 * u, PL.RED, "red cells", "") + G("", T("weeks", 560, 610, 30, BLUE, 800, "end"), at(u, .2, .3)); });
// 19 · America collects about 70 % of the world's plasma
shot(19, still(320, 400, 1), function (u, d, t) { return paper() + globe(320, 380, 230, -98 + u * 1.6, 30) + G("", label(320 - u * 4, 330, 470, 120, "USA", INK, 1, 28), at(u, .3, .4)); });
shot([19, 2], still(320, 400, 1), function (u, d, t) {
  var k = at(u, 0, 1.4), a = .7 * k * Math.PI * 2, R1 = 200, cx = 320, cy = 380;
  return paper() + globe(cx, cy, 230, -98 + (t - LN[19].start) * 1.6, 30) + '<circle cx="' + cx + '" cy="' + cy + '" r="' + R1 + '" fill="#fbf8f1" opacity=".75"/>' +
    '<path d="M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy - R1) + ' A' + R1 + ' ' + R1 + ' 0 ' + (k * .7 > .5 ? 1 : 0) + ' 1 ' + f(cx + Math.sin(a) * R1) + ' ' + f(cy - Math.cos(a) * R1) + ' Z" fill="' + PL.PLASMA + '" stroke="' + INK + '" stroke-width="2.4"/>' + N(count(70, k) + "%", cx, cy + 24, 76, ORANGE);
});
// 20 · ~$50 a visit; companies turn it into medicine for hemophilia, immune disorders and burns
shot(20, still(320, 400, 1), function (u, d, t) { return paper() + PL.bottle(200, 300, 2.2, 1) + dollar(440, 380, at(u, .4, .3)); });
shot([20, 2], still(320, 400, 1), function (u, d, t) { return paper() + PL.bottle(100, 280, 1.3, 1) + arrow(150, 330, 200, 330, INK, 5, at(u, 0, .4)) + factory(310, 400) + smoke(362, 240, t) + arrow(410, 340, 450, 340, INK, 5, at(u, .5, .4)) + G("", T("medicine", 540, 350, 30, OLIVE, 800), at(u, .9, .3)); });
shot([20, 4], still(320, 400, 1), function (u, d, t) {
  var l = LN[20], c = window.CHUNKS[20], i4 = l.start + (l.end - l.start) * c[4], i5 = l.start + (l.end - l.start) * c[5];
  return paper() + factory(320, 230) + smoke(372, 70, t) + vial(150, 470, "#c8352c", "hemophilia", at(t - i4, 0, .3)) + vial(320, 470, "#e9c96a", "immune", at(t - i5, 0, .3)) + vial(490, 470, "#9cc3dd", "burns", at(t - i5, .8, .3));
});
// 21 · A lot of people think donors are losing their blood. Nope.
shot(21, still(ROOM[0], 440, ROOM[2]), function (u, d, t) { return paper() + room(t, { run: true, k: .6, donor: { face: { mouth: "o", brows: "worried", eyes: 1.2 } } }).svg + chip("losing blood?", 330, 150, INK, at(u, .2, .3), 26); });
shot([21, 1], still(ROOM[0], 440, ROOM[2]), function (u, d, t) { return paper() + room(t, { run: true, k: .6, donor: { face: { mouth: "grin", brows: "raised" } } }).svg + chip("losing blood?", 330, 150, INK, 1, 26) + cross(330, 150, 1.3, at(u, 0, .4)); });
// 22 · mostly water and some protein; food and drinks put it back
shot(22, still(320, 400, 1), function (u, d, t) { return paper() + waterDrop(220, 330, 120) + T("water", 220, 520, 30, BLUE, 800) + G("", T("+ protein", 470, 360, 34, ORANGE, 800), at(u, .9, .3)); });
shot([22, 2], still(320, 400, 1), function (u, d, t) { return paper() + G("translate(200 380) scale(1.6) translate(-200 -380)", glassW(200, 380)) + G("translate(450 380) scale(1.5) translate(-450 -380)", sandwich(450, 360)) + check(320, 640, 1.8, at(u, .6, .5), "#3b7a4c"); });
// 23 · So basically: needle, spin, plasma in the bottle, red cells back in you
function recap(u, t, n) { var r = room(t, { run: true, k: .8 }), w = r.wrist; return paper() + r.svg + callout("1", w[0] - 10, w[1] - 50, n >= 1 ? 1 : 0, 22) + callout("2", 600, 280, n >= 2 ? 1 : 0, 22) + callout("3", 570, 590, n >= 3 ? 1 : 0, 22) + callout("4", w[0] + 130, w[1] + 70, n >= 4 ? 1 : 0, 22); }
shot(23, still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { var l = LN[23], c = window.CHUNKS[23], x = (t - l.start) / (l.end - l.start); return recap(u, t, x < c[1] ? 0 : x < c[1] + .12 ? 1 : 2); });
shot([23, 2], still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { return recap(u, t, 3); });
shot([23, 3], still(ROOM[0], ROOM[1], ROOM[2]), function (u, d, t) { return recap(u, t, 4) + arrow(449 - 6, 511 + 14, r0x(t) + 50, r0y(t) + 34, ORANGE, 6, at(u, .1, .8)); });
function r0x(t) { return room(t, {}).wrist[0]; } function r0y(t) { return room(t, {}).wrist[1]; }
// 24 · one immune disorder patient needs about 130 donations a year
shot(24, still(320, 400, 1), function (u, d, t) { return paper() + patient(320, 470, 1.1, t) + qmark(540, 200, at(u, .5, .3), 110); });
shot([24, 2], still(320, 400, 1), function (u, d, t) {
  var k = at(u, 0, 2.2), n = Math.round(130 * k), s = paper();
  for (var i = 0; i < n; i++) { var c = i % 13, r = Math.floor(i / 13); s += PL.bottle(80 + c * 40, 120 + r * 54, .42, 1); }
  return s + N(String(n), 320, 720, 64, ORANGE);
});
shot([24, 3], still(320, 400, 1), function (u, d, t) { var s = paper(); for (var i = 0; i < 130; i++) { var c = i % 13, r = Math.floor(i / 13); s += PL.bottle(80 + c * 40, 120 + r * 54, .42, 1); } return dim(.6, s) + patient(320, 520, .9, t) + chip("130 / year", 320, 300, ORANGE, at(u, .1, .3), 34); });

// ── opening card, bumper and summary art ──
SCENE.intro = function (svg, t, li) {
  var r = room(t, { run: li >= 2, k: li >= 1 ? .5 : 0 });
  var s = '<g transform="translate(-40 -40) scale(.95)">' + r.svg + '</g>';
  if (li >= 1) s += dollar(150, 120, (t - LN[1].start - 1.2) / .3);
  if (li >= 2) s += arrow(330, 460, 240, 500, ORANGE, 6, (t - LN[2].start - .3) / .6);
  return s;
};
SCENE.bumper = function (u, t) {   // a drop of blood: plasma on top, red cells below
  return '<clipPath id="bd"><path d="M90 30 C140 100 150 150 90 180 C30 150 40 100 90 30 Z"/></clipPath><g clip-path="url(#bd)"><rect x="0" y="0" width="180" height="200" fill="' + PL.PLASMA + '"/><rect x="0" y="' + f(118 + 4 * Math.sin(t * 3)) + '" width="180" height="100" fill="' + PL.RED + '"/></g><path d="M90 30 C140 100 150 150 90 180 C30 150 40 100 90 30 Z" fill="none" stroke="' + INK + '" stroke-width="3"/>';
};
SCENE.outro = function (svg, u, t) {
  var r = room(t, { run: true, k: .9 }), w = r.wrist;
  return '<g transform="translate(70 -60) scale(.48)">' + r.svg + '</g>' + callout("1", 70 + .48 * (w[0] - 10), -60 + .48 * (w[1] - 50), ease(u / .3)) + callout("2", 70 + .48 * 600, -60 + .48 * 280, ease(u / .3 - .5)) + callout("3", 70 + .48 * 570, -60 + .48 * 590, ease(u / .3 - 1)) + callout("4", 70 + .48 * (w[0] + 130), -60 + .48 * (w[1] + 70), ease(u / .3 - 1.5));
};
