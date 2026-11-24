// ── «إزاي دكتور العيون بيعرف نمرة نظرك؟» — drawings. The eye is a real side cut (cornea, iris, lens on its zonules,
// ciliary muscle, sclera / choroid / retina, optic nerve, fovea); the autorefractor is a table-top unit with a chin rest,
// forehead bar, joystick and operator screen; the retinoscope is a streak scope held to the doctor's eye; the fundus has
// the optic disc, the arcades of arteries and veins and the macula. Sources in refs/SOURCES.md.

var SCL = "#ebe2cc", SCL_D = "#cfc2a2", RET = "#c97a68", RET_D = "#a65446", VIT = "#f4efe2", AQ = "#dfe9ea", LENS = "#e6e7e0", LENS_L = "#c9ccc2",
    IRIS = "#7a5034", NERVE = "#e2cfa6", NERVE_D = "#bca26f", MUSC = "#7d8a4a", MUSC_L = "#a3ad6c", IR = "#a0402f", BEAM = "#5b84a0",
    FUND = "#cf6e4c", FUND_D = "#b85a3c", ART = "#a3341f", VEIN = "#7e2418", DISC = "#f1d59a", DEV = "#e9e4d6", DEV_D = "#c9c1ad", DEV_K = "#4a4a48";

// ── the eye, cut through from the side; light comes in from the left ──
// o: {fat 0..1 (lens thickened by the ciliary muscle), pupil 0..1 (open), musc 0..1 (highlight the muscle), ret 0..1 (highlight the retina),
//     nerve: false to hide the optic nerve, lensHi, irisHi}
function eyeGeo(cx, cy, r, o) {
  o = o || {}; var fat = o.fat || 0, pupil = o.pupil == null ? .35 : o.pupil;
  return { cx: cx, cy: cy, r: r, lx: cx - .6 * r, lrx: r * (.13 + .07 * fat), lry: r * (.3 - .03 * fat), retX: cx + .86 * r, ix: cx - .8 * r,
    pup: r * lerp(.09, .3, pupil), corneaX: cx - 1.13 * r };
}
function eye(cx, cy, r, o) {
  o = o || {}; var E = eyeGeo(cx, cy, r, o), s = "", k;
  var ang = function (a, rr) { return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; };
  // optic nerve leaving the back, slightly below the axis
  if (o.nerve !== false) {
    var n0 = ang(.18, .8 * r);
    s += '<path d="M' + f(n0[0]) + ' ' + f(n0[1] - .17 * r) + ' C' + f(cx + 1.3 * r) + ' ' + f(cy + .02 * r) + ' ' + f(cx + 1.6 * r) + ' ' + f(cy + .1 * r) + ' ' + f(cx + 2.1 * r) + ' ' + f(cy + .16 * r) +
         ' L' + f(cx + 2.1 * r) + ' ' + f(cy + .5 * r) + ' C' + f(cx + 1.6 * r) + ' ' + f(cy + .46 * r) + ' ' + f(cx + 1.25 * r) + ' ' + f(cy + .42 * r) + ' ' + f(n0[0]) + ' ' + f(n0[1] + .17 * r) + ' Z" fill="' + NERVE + '" stroke="' + INK + '" stroke-width="2"/>';
    for (k = 1; k < 4; k++) s += '<path d="M' + f(cx + .98 * r) + ' ' + f(cy + .06 * r + k * .08 * r) + ' C' + f(cx + 1.4 * r) + ' ' + f(cy + .1 * r + k * .08 * r) + ' ' + f(cx + 1.7 * r) + ' ' + f(cy + .14 * r + k * .08 * r) + ' ' + f(cx + 2.1 * r) + ' ' + f(cy + .18 * r + k * .08 * r) + '" stroke="' + NERVE_D + '" stroke-width="1.4" fill="none"/>';
  }
  // the wall: sclera (outer), choroid line, retina (inner red band) — open at the front where the cornea sits
  var a0 = Math.PI * .79, a1 = -Math.PI * .79;   // the wall runs from the top-front, round the back, to the bottom-front
  function band(r1, r2) { var p = ang(a0, r1), q = ang(a1, r1), p2 = ang(a1, r2), q2 = ang(a0, r2); return "M" + f(p[0]) + " " + f(p[1]) + " A" + f(r1) + " " + f(r1) + " 0 1 0 " + f(q[0]) + " " + f(q[1]) + " L" + f(p2[0]) + " " + f(p2[1]) + " A" + f(r2) + " " + f(r2) + " 0 1 1 " + f(q2[0]) + " " + f(q2[1]) + " Z"; }
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(.86 * r) + '" fill="' + VIT + '"/>';
  // cornea and the clear front chamber
  var A = ang(a0, r), B = ang(a1, r);
  s += '<path d="M' + f(A[0]) + ' ' + f(A[1]) + ' Q' + f(cx - 1.34 * r) + ' ' + f(cy) + ' ' + f(B[0]) + ' ' + f(B[1]) + ' L' + f(E.ix) + ' ' + f(B[1]) + ' L' + f(E.ix) + ' ' + f(A[1]) + ' Z" fill="' + AQ + '"/>';
  s += '<path d="M' + f(A[0]) + ' ' + f(A[1]) + ' Q' + f(cx - 1.34 * r) + ' ' + f(cy) + ' ' + f(B[0]) + ' ' + f(B[1]) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<path d="' + band(r, .93 * r) + '" fill="' + SCL + '" stroke="' + INK + '" stroke-width="2.2"/>' + '<path d="' + band(r, .93 * r) + '" fill="url(#hatch)" opacity=".35"/>';
  s += '<path d="' + band(.93 * r, .89 * r) + '" fill="#8f5a44" stroke="none"/>';
  var rc = o.ret ? lerp(0, 1, clamp(o.ret)) : 0;
  s += '<path d="' + band(.89 * r, .85 * r) + '" fill="' + (rc ? mixC(RET, ORANGE, rc) : RET) + '" stroke="' + INK + '" stroke-width="1.2"/>';
  // fovea: a small dip on the axis at the back
  s += '<path d="M' + f(E.retX - 1) + ' ' + f(cy - .06 * r) + ' Q' + f(E.retX + .03 * r) + ' ' + f(cy) + ' ' + f(E.retX - 1) + ' ' + f(cy + .06 * r) + '" stroke="' + RET_D + '" stroke-width="2" fill="none"/>';
  // ciliary body with its muscle, and the zonule threads to the lens
  [-1, 1].forEach(function (sd) {
    var root = ang(sd < 0 ? a0 + .02 : a1 - .02, .9 * r), tip = [E.lx + .02 * r, cy + sd * (E.lry + .1 * r)], base2 = ang(sd < 0 ? a0 - .32 : a1 + .32, .88 * r);
    for (k = 0; k < 7; k++) { var q = k / 6; s += '<path d="M' + f(lerp(tip[0], base2[0], .1 + q * .2)) + ' ' + f(lerp(tip[1], base2[1], .1 + q * .2)) + ' L' + f(E.lx + E.lrx * (.2 + .6 * Math.cos(q * 1.2))) + ' ' + f(cy + sd * E.lry * (.75 + .2 * Math.sin(q * 1.4))) + '" stroke="#a99d80" stroke-width="1"/>'; }
    var mc = o.musc ? mixC(MUSC, "#4f6a1e", clamp(o.musc)) : MUSC;
    s += '<path d="M' + f(root[0]) + ' ' + f(root[1]) + ' L' + f(tip[0]) + ' ' + f(tip[1]) + ' L' + f(base2[0]) + ' ' + f(base2[1]) + ' Q' + f(lerp(root[0], base2[0], .5) + .03 * r) + ' ' + f(lerp(root[1], base2[1], .5)) + ' ' + f(root[0]) + ' ' + f(root[1]) + ' Z" fill="' + mc + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
    for (k = 1; k < 4; k++) s += '<path d="M' + f(lerp(root[0], tip[0], .25 * k)) + ' ' + f(lerp(root[1], tip[1], .25 * k)) + ' L' + f(lerp(base2[0], tip[0], .25 * k)) + ' ' + f(lerp(base2[1], tip[1], .25 * k)) + '" stroke="' + MUSC_L + '" stroke-width="1.2"/>';
  });
  // the lens
  s += '<ellipse cx="' + f(E.lx) + '" cy="' + f(cy) + '" rx="' + f(E.lrx) + '" ry="' + f(E.lry) + '" fill="' + (o.lensHi ? mixC(LENS, "#c8d9e3", clamp(o.lensHi)) : LENS) + '" stroke="' + INK + '" stroke-width="2"/>' +
       '<ellipse cx="' + f(E.lx) + '" cy="' + f(cy) + '" rx="' + f(E.lrx * .62) + '" ry="' + f(E.lry * .72) + '" fill="none" stroke="' + LENS_L + '" stroke-width="1.4"/>' +
       '<path d="M' + f(E.lx - E.lrx * .5) + ' ' + f(cy - E.lry * .55) + ' Q' + f(E.lx - E.lrx * .8) + ' ' + f(cy) + ' ' + f(E.lx - E.lrx * .5) + ' ' + f(cy + E.lry * .55) + '" stroke="#fff" stroke-width="2.2" fill="none" opacity=".8"/>';
  // the iris: two brown leaves in front of the lens, the pupil is the gap between them
  [-1, 1].forEach(function (sd) {
    var y0 = cy + sd * .58 * r, y1 = cy + sd * E.pup, w = .07 * r;
    s += '<path d="M' + f(E.ix - w / 2) + ' ' + f(y0) + ' L' + f(E.ix - w / 2) + ' ' + f(y1) + ' Q' + f(E.ix) + ' ' + f(y1 - sd * w * .6) + ' ' + f(E.ix + w / 2) + ' ' + f(y1) + ' L' + f(E.ix + w / 2 + .02 * r) + ' ' + f(y0) + ' Z" fill="' + (o.irisHi ? mixC(IRIS, ORANGE, clamp(o.irisHi)) : IRIS) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
  });
  return s;
}
function LTR(x) { return "\u202A" + x + "\u202C"; }
// the eye mirrored to look right (toward a machine on its right)
function eyeR(cx, cy, r, o) { return G("translate(" + f(2 * cx) + " 0) scale(-1 1)", eye(cx, cy, r, o)); }
function mixC(a, b, k) { var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, h = function (v) { return ("0" + Math.round(v).toString(16)).slice(-2); }; return "#" + h(lerp(p(a, 0), p(b, 0), k)) + h(lerp(p(a, 1), p(b, 1), k)) + h(lerp(p(a, 2), p(b, 2), k)); }
// three rays from the left, through the lens, meeting at focusX on the axis (then spreading if they meet early)
function rays(E, focusX, k, col, w, dash) {
  var s = "", x0 = E.cx - 2.6 * E.r, end = E.retX - 2;
  [-.2, 0, .2].forEach(function (dy, i) {
    var y = E.cy + dy * E.r, mx = E.lx, fy = E.cy, ex = end, ey = fy + (y - fy) * (focusX - end) / (focusX - mx) * (-1) * -1;
    // after the lens the ray heads for (focusX, cy); it stops at the retina
    var tt = (end - mx) / (focusX - mx); ey = y + (fy - y) * tt;
    var d = "M" + f(x0) + " " + f(y) + " L" + f(mx) + " " + f(y) + " L" + f(ex) + " " + f(ey);
    s += draw(d, k, col || BEAM, w || 2.6, dash ? ' stroke-dasharray="' + dash + '"' : "");
  });
  return s;
}
// the spot the rays make on the retina: a sharp dot when they meet on it, a wide smear when they meet early or late
function spot(E, focusX, k, col) {
  var tt = (E.retX - 2 - E.lx) / (focusX - E.lx), half = Math.abs(.2 * E.r * (1 - tt)), rr = Math.max(4, half + 3);
  return G("", '<ellipse cx="' + f(E.retX - 3) + '" cy="' + f(E.cy) + '" rx="5" ry="' + f(rr) + '" fill="' + (col || ORANGE) + '" opacity=".85" stroke="' + INK + '" stroke-width="1.2"/>', clamp(k));
}

// ── what you see inside the machine: a red balloon over a road running to the horizon. blur: 0..1 ──
var BLN = 0;
function balloonPic(cx, cy, r, blur, t, bob) {
  var id = "bp" + (++BLN), fid = "bf" + BLN, s = "";
  s += '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath>';
  s += '<filter id="' + fid + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="' + f(blur * r * .045) + '"/></filter>';
  var hy = cy + r * .12, by = cy - r * .22 + (bob == null ? 3 * Math.sin(t * 1.3) : bob);
  var inner = R(cx - r, cy - r, 2 * r, 2 * r, "#cad9dd", 0) +
    '<path d="M' + f(cx - r) + ' ' + f(hy) + ' L' + f(cx - r * .6) + ' ' + f(hy - r * .1) + ' L' + f(cx - r * .3) + ' ' + f(hy - r * .03) + ' L' + f(cx + r * .2) + ' ' + f(hy - r * .13) + ' L' + f(cx + r * .6) + ' ' + f(hy - r * .04) + ' L' + f(cx + r) + ' ' + f(hy - r * .09) + ' V' + f(hy) + ' Z" fill="#9fb0a0" stroke="none"/>' +
    R(cx - r, hy, 2 * r, r, "#9fae72", 0) + R(cx - r, hy + r * .3, 2 * r, r, "#8c9c62", 0) +
    '<path d="M' + f(cx - 4) + ' ' + f(hy) + ' L' + f(cx + 4) + ' ' + f(hy) + ' L' + f(cx + r * .45) + ' ' + f(cy + r) + ' L' + f(cx - r * .45) + ' ' + f(cy + r) + ' Z" fill="#d8c9a0"/>' +
    '<path d="M' + f(cx) + ' ' + f(hy + 6) + ' L' + f(cx) + ' ' + f(cy + r) + '" stroke="#f2ecd8" stroke-width="' + f(r * .025) + '" stroke-dasharray="' + f(r * .08) + ' ' + f(r * .07) + '"/>' +
    // the balloon: envelope with stripes, ropes and the basket
    '<path d="M' + f(cx) + ' ' + f(by - r * .17) + ' C' + f(cx + r * .16) + ' ' + f(by - r * .17) + ' ' + f(cx + r * .15) + ' ' + f(by + r * .06) + ' ' + f(cx + r * .04) + ' ' + f(by + r * .13) + ' L' + f(cx - r * .04) + ' ' + f(by + r * .13) + ' C' + f(cx - r * .15) + ' ' + f(by + r * .06) + ' ' + f(cx - r * .16) + ' ' + f(by - r * .17) + ' ' + f(cx) + ' ' + f(by - r * .17) + ' Z" fill="#c0392b"/>' +
    '<path d="M' + f(cx) + ' ' + f(by - r * .17) + ' C' + f(cx + r * .06) + ' ' + f(by - r * .1) + ' ' + f(cx + r * .05) + ' ' + f(by + r * .08) + ' ' + f(cx + r * .02) + ' ' + f(by + r * .13) + ' L' + f(cx - r * .02) + ' ' + f(by + r * .13) + ' C' + f(cx - r * .05) + ' ' + f(by + r * .08) + ' ' + f(cx - r * .06) + ' ' + f(by - r * .1) + ' ' + f(cx) + ' ' + f(by - r * .17) + ' Z" fill="#f1e6c8"/>' +
    '<path d="M' + f(cx - r * .035) + ' ' + f(by + r * .13) + ' L' + f(cx - r * .02) + ' ' + f(by + r * .19) + ' M' + f(cx + r * .035) + ' ' + f(by + r * .13) + ' L' + f(cx + r * .02) + ' ' + f(by + r * .19) + '" stroke="' + INK + '" stroke-width="1"/>' +
    R(cx - r * .025, by + r * .19, r * .05, r * .035, "#7a5a3a", .8);
  s += '<g clip-path="url(#' + id + ')"><g' + (blur > .02 ? ' filter="url(#' + fid + ')"' : "") + '>' + inner + '</g></g>';
  s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  return s;
}

// ── the autorefractor, side view (patient side on the left). x, y = the eye window; s scale. o: {cut 0..1 (show insides), scr: text on the screen} ──
function refractor(x, y, s, t, o) {
  o = o || {}; var S = function (v) { return f(v * s); }, g = "";
  // table
  g += R(-120, 150, 520, 18, "#b48a5e", 2) + R(-110, 168, 20, 150, "#9a7048", 2) + R(370, 168, 20, 150, "#9a7048", 2);
  // base and sliding stage, joystick
  g += R(20, 112, 330, 38, DEV_D, 2, 6) + R(40, 100, 290, 14, DEV, 1.6, 3) + R(300, 62, 10, 40, DEV_K, 1.6, 3) + C(305, 58, 11, "#3c3c3a", 1.8);
  // chin rest and forehead bar on two rods (patient side)
  g += R(-62, -150, 8, 262, "#b8b2a4", 1.6) + R(-12, -150, 8, 262, "#b8b2a4", 1.6) + R(-70, -158, 74, 12, DEV, 1.6, 4) +
       '<path d="M-74 -96 Q-40 -86 -6 -96" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
       '<path d="M-78 48 Q-46 74 -10 48 L-10 58 Q-46 84 -78 58 Z" fill="#d8d2c2" stroke="' + INK + '" stroke-width="1.8"/>';
  // main housing with the measuring head toward the eye
  g += '<path d="M10 -62 L250 -62 Q272 -62 272 -40 L272 92 L30 92 Q10 92 10 72 Z" fill="' + DEV + '" stroke="' + INK + '" stroke-width="2.2"/>';
  g += R(-6, -28, 22, 56, DEV_D, 2, 4) + C(-2, 0, 14, "#2b3a44", 2) + C(-2, 0, 7, "#4d6a7a", 1.2) + C(-6, -4, 3, "#fff", 0);
  g += '<path d="M30 82 H262" stroke="' + DEV_D + '" stroke-width="2"/>';
  // operator screen on an arm
  g += '<path d="M240 -62 L248 -96" stroke="' + INK + '" stroke-width="5"/>' + '<g transform="rotate(-8 270 -130)">' + R(200, -170, 136, 84, "#3a3d3f", 2.4, 6) + R(210, -161, 116, 66, "#cfe0d8", 1.4, 2) +
       (o.scr ? T(LTR(o.scr), 268, -118, 26, "#1e3a2e", 800) : "") + '</g>';
  // inside (cut-away): window → beam splitter → lens → the balloon slide; an infrared lamp and the sensor below
  if (o.cut) {
    var c = clamp(o.cut), ins = R(28, -48, 232, 120, "#f6f2e6", 1.6, 4) +
      '<path d="M20 0 H236" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 4" opacity=".5"/>' +
      '<path d="M70 -22 L98 22" stroke="' + BLUE + '" stroke-width="4"/>' + '<path d="M150 -22 L178 22" stroke="' + BLUE + '" stroke-width="4"/>' +
      '<ellipse cx="125" cy="0" rx="6" ry="24" fill="' + AQ + '" stroke="' + INK + '" stroke-width="1.6"/>' +
      R(232, -30, 14, 60, "#fff", 1.6) + G("", balloonPic(239, 0, 26, 0, t), 1) +
      R(72, 50, 26, 16, "#3a2a24", 1.4) + C(85, 48, 6, IR, 1.2) + T("IR", 85, 80, 13, IR, 800) +
      R(152, 48, 30, 18, "#2b3a44", 1.4) + R(158, 44, 18, 6, "#4d6a7a", 1);
    g += G("", ins, c);
  }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", g);
}
// the patient sitting in profile, facing right, chin on the rest: returns the svg; hx,hy = where the eye should be
function patient(ex, ey, s, t, o) {
  o = o || {};
  var base = { x: 0, y: 0, s: s, dir: 1, lean: 22, outfit: o.outfit || "casual", breath: (Math.sin(t * 1.5) + 1) / 2, head: { tilt: 6 },
    legs: [{ hip: 88, knee: 92 }, { hip: 84, knee: 88 }], arms: o.lap ? [{ sh: 8, el: 38, hand: "relaxed" }, { sh: 6, el: 42, hand: "relaxed" }] : [{ sh: 22, el: 78, hand: "flat" }, { sh: 18, el: 82, hand: "flat" }],
    face: { eyes: o.blink ? 0 : 1, mouth: o.mouth || "neutral", brows: o.brows || "neutral" } };
  var probe = PERSON.side(base), h = probe.joints.head;
  base.x = ex - (h[0] + 18 * s); base.y = ey - (h[1] - 4 * s);
  return PERSON.side(base).svg;
}
// the doctor sitting in profile, facing left, holding the retinoscope to his eye (scope head over the eye, handle down to the fist)
function doctor(ex, ey, s, t) {
  var base = { x: 0, y: 0, s: s, dir: -1, lean: 8, outfit: "doctor", breath: (Math.sin(t * 1.4 + 1) + 1) / 2, head: { tilt: 4 },
    legs: [{ hip: 86, knee: 90 }, { hip: 82, knee: 86 }], arms: [{ sh: 62, el: 112, hand: "fist" }, { sh: 6, el: 40, hand: "relaxed" }], face: { eyes: .7, brows: "neutral", mouth: "neutral" } };
  var h = PERSON.side(base).joints.head; base.x = ex - (h[0] - 18 * s); base.y = ey - (h[1] - 4 * s);
  var P = PERSON.side(base), w = P.joints.wrist;
  var g = P.svg + '<path d="M' + f(ex + 4) + ' ' + f(ey + 10) + ' L' + f(w[0]) + ' ' + f(w[1] + 8) + '" stroke="#3d3f44" stroke-width="' + f(16 * s) + '" stroke-linecap="round"/>' +
    R(ex - 16 * s, ey - 16 * s, 26 * s, 34 * s, "#2f3136", 2, 4) + R(ex - 24 * s, ey - 6 * s, 9 * s, 14 * s, "#f5e7a8", 1.4, 2);
  return g;
}
// the eye seen from the front (a close-up): lids, white, iris, pupil; o.red 0..1 fills the pupil with the red glow, o.streak = band offset
function frontEye(cx, cy, r, pupil, o) {
  o = o || {}; var s = "", id = "fe" + (++CLIPN), pr = r * lerp(.16, .34, pupil);
  s += '<path d="M' + f(cx - 1.9 * r) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy - 1.75 * r) + ' ' + f(cx + 1.9 * r) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy + 1.5 * r) + ' ' + f(cx - 1.9 * r) + ' ' + f(cy) + ' Z" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2.4"/>';
  s += '<clipPath id="' + id + '"><path d="M' + f(cx - 1.9 * r) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy - 1.75 * r) + ' ' + f(cx + 1.9 * r) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy + 1.5 * r) + ' ' + f(cx - 1.9 * r) + ' ' + f(cy) + ' Z"/></clipPath>';
  var irisSvg = C(cx, cy, r * .82, IRIS, 2);
  for (var k = 0; k < 24; k++) { var a = k / 24 * Math.PI * 2; irisSvg += '<path d="M' + f(cx + Math.cos(a) * (pr + 3)) + ' ' + f(cy + Math.sin(a) * (pr + 3)) + ' L' + f(cx + Math.cos(a) * r * .76) + ' ' + f(cy + Math.sin(a) * r * .76) + '" stroke="#5e3a24" stroke-width="1.4"/>'; }
  var pf = o.red ? mixC("#1d1712", "#d2552f", clamp(o.red)) : "#1d1712";
  irisSvg += C(cx, cy, pr, pf, 2);
  if (o.streak != null && o.red) { var pid = "pp" + (++CLIPN); irisSvg += '<clipPath id="' + pid + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(pr) + '"/></clipPath><g clip-path="url(#' + pid + ')"><rect x="' + f(cx + o.streak * pr - pr * .28) + '" y="' + f(cy - pr) + '" width="' + f(pr * .56) + '" height="' + f(2 * pr) + '" fill="#f0a06a" opacity=".9"/></g>'; }
  irisSvg += C(cx - r * .3, cy - r * .3, r * .1, "#fff", 0);
  s += '<g clip-path="url(#' + id + ')">' + irisSvg + '</g>';
  // lids and lashes
  s += '<path d="M' + f(cx - 1.9 * r) + ' ' + f(cy) + ' Q' + f(cx) + ' ' + f(cy - 1.75 * r) + ' ' + f(cx + 1.9 * r) + ' ' + f(cy) + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
       '<path d="M' + f(cx - 2.1 * r) + ' ' + f(cy - .3 * r) + ' Q' + f(cx) + ' ' + f(cy - 2.15 * r) + ' ' + f(cx + 2.1 * r) + ' ' + f(cy - .3 * r) + '" fill="none" stroke="' + SKIN2 + '" stroke-width="2"/>';
  for (k = 0; k < 9; k++) { var u = .15 + k * .085, lx = lerp(cx - 1.9 * r, cx + 1.9 * r, u), ly = cy - 1.75 * r * 2 * u * (1 - u) * 1; s += '<path d="M' + f(lx) + ' ' + f(ly) + ' l' + f((u - .5) * 10) + ' -' + f(r * .22) + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'; }
  return s;
}
// the retinoscope held up in a fist: handle, head with the light window (right) and the peephole
function retinoscope(x, y, s, beamOn) {
  var g = R(-11, 0, 22, 120, "#3d3f44", 2, 4);
  for (var k = 0; k < 10; k++) g += '<path d="M-11 ' + (20 + k * 9) + ' H11" stroke="#5a5d63" stroke-width="1.4"/>';
  g += R(-15, -54, 30, 56, "#2f3136", 2.2, 5) + R(15, -40, 10, 24, "#2f3136", 1.8, 2) + C(0, -36, 5, "#9fb2bd", 1.4) + R(-13, 2, 26, 10, "#7b7f86", 1.6, 2);
  g += R(24, -36, 4, 16, beamOn ? "#f5e7a8" : "#8a8d93", 1);
  var hand = PERSON.hand([0, 66], -Math.PI / 2, "fist", 1, 1.25).svg || PERSON.hand([0, 66], -Math.PI / 2, "fist", 1, 1.25);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", g + (typeof hand === "string" ? hand : ""));
}
// a vertical bar of trial lenses (skiascopy rack) sliding in front of the eye; off = how far it has slid (in lens steps)
function lensRack(x, y, off, s) {
  var g = R(-12, -230, 24, 520, "#c9c2b0", 2, 6), k;
  for (k = 0; k < 9; k++) { var ly = -210 + k * 56 - off * 56; g += C(0, ly + 28, 22, "#dfe9ec", 2) + C(0, ly + 28, 14, "none", 1) + T(LTR("-" + (k * .25).toFixed(2)), 46, ly + 34, 15, MUTE, 700); }
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s || 1) + ")", g);
}
// the eye-drop bottle (cycloplegic drops come with a red cap) tipped over a front eye, a drop falling
function dropper(x, y, s, tilt, dropK) {
  var g = '<g transform="rotate(' + f(tilt) + ')">' + '<path d="M-26 -60 L26 -60 L30 40 Q30 56 14 56 L-14 56 Q-30 56 -30 40 Z" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2.4"/>' +
    R(-22, -20, 44, 44, "#e8e2d2", 1.4) + '<path d="M-22 -4 H22 M-22 6 H22" stroke="#b8352a" stroke-width="3"/>' + '<path d="M-14 -60 L-6 -100 L6 -100 L14 -60 Z" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2.2"/>' +
    R(-22, -64, 44, 12, "#b8352a", 2, 3) + '</g>';
  if (dropK > 0 && dropK < 1) g += '<path d="M0 ' + f(-110 + dropK * 140) + ' q8 12 0 16 q-8 -4 0 -16 Z" fill="#cfe3ea" stroke="' + INK + '" stroke-width="1.4"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", g);
}
// the back of the eye seen through a wide pupil: optic disc, arteries (lighter) and veins (darker) in arcades, the macula
function fundus(cx, cy, r, t, o) {
  o = o || {}; var id = "fu" + (++CLIPN), s = "", dx = cx + r * .32, dy = cy - r * .04;
  var inner = C(cx, cy, r, FUND, 0) + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#hatch)" opacity=".15"/>' +
    C(cx - r * .3, cy + r * .02, r * .2, FUND_D, 0) + C(cx - r * .3, cy + r * .02, r * .06, "#8e3f2a", 0);
  // arcades: up and down from the disc, sweeping round the macula; one artery + one vein each, with branches
  [-1, 1].forEach(function (sd) {
    [[ART, 4.2, -.04], [VEIN, 6, .06]].forEach(function (v) {
      var off = v[2] * r, d = "M" + f(dx) + " " + f(dy + sd * r * .04) + " C" + f(dx - r * .05) + " " + f(dy + sd * r * (.4 + v[2])) + " " + f(cx - r * .25) + " " + f(cy + sd * (r * .55 + off)) + " " + f(cx - r * .85) + " " + f(cy + sd * (r * .45 + off));
      inner += '<path d="' + d + '" stroke="' + v[0] + '" stroke-width="' + v[1] + '" fill="none" stroke-linecap="round"/>';
      for (var b = 0; b < 3; b++) { var bx = lerp(dx, cx - r * .6, .3 + b * .25), by = cy + sd * r * (.42 + b * .05) + off; inner += '<path d="M' + f(bx) + ' ' + f(by) + ' Q' + f(bx - r * .05) + ' ' + f(by + sd * r * .2) + ' ' + f(bx + r * .02) + ' ' + f(by + sd * r * .45) + '" stroke="' + v[0] + '" stroke-width="' + f(v[1] * .55) + '" fill="none" stroke-linecap="round"/>'; }
      inner += '<path d="M' + f(dx) + ' ' + f(dy) + ' Q' + f(dx + r * .3) + ' ' + f(dy + sd * r * .1) + ' ' + f(dx + r * .7) + ' ' + f(dy + sd * r * (.3 + v[2])) + '" stroke="' + v[0] + '" stroke-width="' + f(v[1] * .6) + '" fill="none" stroke-linecap="round"/>';
    });
  });
  inner += C(dx, dy, r * .13, DISC, 1.6) + C(dx + r * .02, dy, r * .06, "#f8ebc8", 0);
  // signs of disease: small bleeds and pale spots (diabetes), thin nipped arteries (pressure)
  if (o.sick) { var k = clamp(o.sick); for (var i = 0; i < 9; i++) { var a = hash(i) * 6.28, rr = r * (.25 + .5 * hash(i + 7)); inner += G("", (i % 3 ? '<circle cx="' + f(cx + Math.cos(a) * rr) + '" cy="' + f(cy + Math.sin(a) * rr) + '" r="' + f(3 + 3 * hash(i + 3)) + '" fill="#6e1a10"/>' : '<ellipse cx="' + f(cx + Math.cos(a) * rr) + '" cy="' + f(cy + Math.sin(a) * rr) + '" rx="7" ry="4" fill="#f3e2a6"/>'), clamp(k * 3 - i * .25)); } }
  s += '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>' + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
  return s;
}
// a flashlight aimed at a wall: the spot is small when focused, wide when not (the analogy)
function torchWall(k) {
  var rr = lerp(10, 34, k);
  return R(40, -50, 10, 100, "#e3dccb", 1.4) + '<path d="M-48 -6 L-8 -10 L-8 10 L-48 6 Z" fill="#5a5d63" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M-8 -10 L40 ' + f(-rr) + ' L40 ' + f(rr) + ' L-8 10 Z" fill="#f5e7a8" opacity=".55"/>' + '<ellipse cx="44" cy="0" rx="4" ry="' + f(rr) + '" fill="#f2d36b" stroke="' + INK + '" stroke-width="1"/>';
}
// the Helmholtz ophthalmoscope (1851): a lamp at the side, three glass plates at an angle, the doctor's eye behind them
function helmholtz(u, t) {
  var s = "", fl = 1 + .08 * Math.sin(t * 9);
  // lamp
  s += R(80, 470, 60, 18, "#7c5434", 2) + '<path d="M92 470 Q110 400 128 470 Z" fill="#d8ccae" stroke="' + INK + '" stroke-width="2"/>' + R(102, 380, 16, 30, "#f4efe3", 1.6) +
       '<path d="M110 ' + f(380 - 26 * fl) + ' Q120 364 110 382 Q100 364 110 ' + f(380 - 26 * fl) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.4"/>';
  // light to the plates, reflected into the patient's eye
  var k = at(u, .4, .8);
  s += draw("M126 372 L300 300", k, "#e0b040", 5, ' stroke-linecap="round" opacity=".8"') + draw("M300 300 L470 300", at(u, 1, .6), "#e0b040", 5, ' stroke-linecap="round" opacity=".8"');
  // plates in a frame on a handle
  s += R(296, 300, 10, 170, "#7c5434", 1.8) + '<g transform="rotate(-34 300 300)">' + R(250, 296, 100, 12, "#7c5434", 1.6) + [0, 1, 2].map(function (i) { return R(256, 280 - i * 9, 88, 5, "#cfe3ea", 1.2); }).join("") + '</g>';
  // the doctor's eye (left, looking through) and the patient's eye (right, front view)
  s += frontEye(500, 300, 34, .9, { red: at(u, 1.6, .5) }) + G("translate(165 300) scale(-1 1)", '<path d="M-40 0 Q0 -36 40 0 Q0 30 -40 0 Z" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2.2"/>' + C(6, 0, 14, IRIS, 1.6) + C(6, 0, 6, "#1d1712", 0)) +
       draw("M206 300 L300 300", at(u, 1.8, .5), INK, 2, ' stroke-dasharray="6 6"');
  return s;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: the eye cut appears, a pinned rule card over it
shot(4, push(320, 400, 1.06, .98), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), eye(360, 440, 175, {})) + G("", '<rect x="120" y="140" width="400" height="140" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-2 320 210)"/>' +
    T("النور لازم يتجمّع", 320, 200, 34, INK, 800) + T("على الشبكية", 320, 250, 36, ORANGE, 800) + C(320, 148, 9, ORANGE, 2), at(u, .4, .4));
});
// 5 · pupil, lens, retina: rays come in and meet in one point on the retina (labels in the order they are said)
shot(5, push(330, 400, .98, 1.06), function (u, d, t) {
  var E = eyeGeo(360, 400, 190, {}), lp = LN[5], q = function (fr) { return lp.start + (lp.end - lp.start) * fr - (lp.start); };
  return paper() + eye(360, 400, 190, { ret: at(u, q(.55), .5) }) + rays(E, E.retX - 2, at(u, .2, 1.6)) + spot(E, E.retX - 2, at(u, 1.8, .3)) +
    label(E.ix, 400 - E.pup - 4, 120, 180, "الحدقة", OLIVE, at(u, .3, .5), 26) + label(E.lx, 400 + E.lry - 10, 140, 650, "العدسة", OLIVE, at(u, q(.3), .5), 26) +
    label(E.retX + 4, 300, 560, 160, "الشبكية", ORANGE, at(u, q(.55), .5), 26);
}, { tr: "in" });
// 6 · if the point lands before or after the retina, the picture blurs: that is the «number»
shot(6, push(330, 400, 1.0, 1.05), function (u, d, t) {
  var E = eyeGeo(360, 430, 180, {}), ph = (Math.sin(t * 1.3) + 1) / 2, fx = u < d * .55 ? lerp(E.retX - 2, E.retX - 90, at(u, .3, .8)) : lerp(E.retX - 90, E.retX + 70, at(u, d * .55, .8));
  return paper() + eye(360, 430, 180, {}) + rays(E, fx, 1) + spot(E, fx, 1) + balloonPic(140, 150, 90, clamp(Math.abs(fx - E.retX) / 60), t) +
    tag("نمرة", 500, 160, at(u, d - 1.4, .3), 40, ORANGE);
});
// 7 · the machine sends infrared light you can't see, all the way to the back of the eye
shot(7, push(290, 400, .8, .88), function (u, d, t) {
  var cx = 165, E = eyeGeo(cx, 420, 105, {}), k = at(u, 1, 1.2), wx = 370, cornea = 2 * cx - E.corneaX, ret = 2 * cx - E.retX;
  return paper() + refractor(wx, 420, .8, t, { cut: at(u, .2, .5) }) + eyeR(cx, 420, 105, {}) +
    draw("M" + f(wx + 68) + " 458 L" + f(wx + 68) + " 420 L" + f(cornea) + " 420 L" + f(ret + 2) + " 420", k, IR, 4, ' stroke-dasharray="8 6"') +
    label(wx + 68, 462, 420, 650, "نور تحت الأحمر", ORANGE, at(u, 1.6, .5), 26) + G("", T("مش بتشوفه", 200, 600, 26, MUTE, 700), at(u, 2.6, .4));
}, { tr: "out" });
// 8 · it bounces off the retina and comes back; the sensor sees a tight dot or a wide smear
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var cx = 180, E = eyeGeo(cx, 400, 150, {}), k = at(u, .2, 1), wide = u > d * .5, kk = wide ? at(u, d * .5, .6) : 0, ret = 2 * cx - E.retX, cor = 2 * cx - E.corneaX;
  var s = paper() + eyeR(cx, 400, 150, {}) + R(450, 300, 150, 200, "#f6f2e6", 2, 6) + R(500, 360, 60, 80, "#2b3a44", 2) + T("الحساس", 525, 540, 22, INK, 800);
  s += draw("M" + f(ret + 4) + " 400 L" + f(cor) + " 400 L500 400", k, IR, 4, ' stroke-dasharray="8 6"') + arrow(420, 400, 470, 400, IR, 4, k);
  s += inset(500, 170, 86, R(-90, -90, 180, 180, "#1a2228", 0) + '<circle r="' + f(lerp(8, 44, kk)) + '" fill="' + IR + '" opacity="' + f(lerp(.95, .55, kk)) + '"/>' + '<circle r="' + f(lerp(4, 30, kk)) + '" fill="#e0805a" opacity=".8"/>', at(u, 1, .3)) +
    (wide ? tag("مفرّش", 260, 160, kk, 32, ORANGE) : tag("متجمّع", 260, 160, at(u, 1.3, .3), 32, BLUE));
  return s;
});
// 9 · like a torch on a wall: a small circle or a big one
shot(9, push(320, 400, 1.04, .98), function (u, d, t) {
  var k = (Math.sin(t * 1.6) + 1) / 2;
  return paper() + G("translate(300 400) scale(4.2)", torchWall(k)) + T(k < .5 ? "صغيرة" : "كبيرة", 330, 640, 40, k < .5 ? BLUE : ORANGE, 800);
}, { tr: "in" });
// 10 · «طب والبالونة ليه؟»: the picture inside the machine, and a question mark
shot(10, push(320, 400, .96, 1.06), function (u, d, t) { return paper() + balloonPic(320, 400, 230, 0, t) + G("", T("؟", 560, 220, 120, ORANGE, 800), at(u, .4, .3)); }, { tr: "in" });
// 11 · the ciliary muscle squeezes and the lens gets fat whenever you look at something near (a pencil coming close)
shot(11, push(320, 410, 1.02, 1.08), function (u, d, t) {
  var near = (Math.sin(t * 1.5 - 1.5) + 1) / 2, E = eyeGeo(400, 420, 190, { fat: near });
  return paper() + eye(400, 420, 190, { fat: near, musc: near }) + G("translate(" + f(lerp(-40, 120, near)) + " 420)", R(-60, -6, 70, 12, "#e2b24a", 1.8) + '<path d="M10 -6 L30 0 L10 6 Z" fill="#e8d2a8" stroke="' + INK + '" stroke-width="1.6"/>') +
    label(E.lx + 10, 420 - E.lry - 40, 470, 150, "العضلة", OLIVE, at(u, .4, .5), 28) + label(E.lx, 420 + 20, 480, 690, "العدسة بتتنفخ", ORANGE, at(u, 2, .5), 26);
});
// 12 · the machine is right against your face → the muscle works by itself → the reading comes out wrong
shot(12, push(300, 400, .92, 1.0), function (u, d, t) {
  var squeeze = .7 + .3 * Math.sin(t * 2);
  return paper() + refractor(250, 350, .9, t, { scr: u > 1.8 ? "-1.75" : "" }) + patient(232, 350, .9, t, { brows: "worried" }) +
    inset(470, 600, 110, eye(40, 0, 90, { fat: squeeze, musc: squeeze, nerve: false }), at(u, .5, .3)) + cross(560, 150, 1, at(u, d - 1.1, .5));
});
// 13 · the balloon is drawn far away on a road and blurred on purpose → the eye relaxes; the reading is right
shot(13, push(320, 400, 1.04, .98), function (u, d, t) {
  var rel = at(u, d * .45, 1.2), b = (Math.sin(t * 2.2) + 1) / 2 * (1 - rel) * .5 + rel * .35;
  return paper() + balloonPic(320, 250, 175, b, t) + eye(380, 610, 120, { fat: 1 - rel, musc: 1 - rel, nerve: false }) +
    tag("بعيد", 130, 120, at(u, .4, .3), 28, BLUE) + G("", T("العضلة ارتاحت", 380, 770, 26, OLIVE, 800), rel) + check(560, 520, 1, at(u, d - .9, .5), OLIVE);
});
// 14 · eye drops, then half an hour of waiting
hud(14, 15, function (u, t) {
  var a = -Math.PI / 2 + clamp(u / 2.2) * Math.PI;
  return C(540, 110, 62, "#f4ecdb", 2.4) + '<path d="M540 110 L540 48 A62 62 0 0 1 ' + f(540 + 62 * Math.cos(a)) + ' ' + f(110 + 62 * Math.sin(a)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>' +
    '<path d="M540 110 L' + f(540 + Math.cos(a) * 46) + ' ' + f(110 + Math.sin(a) * 46) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + C(540, 110, 5, INK, 0) + T("نص ساعة", 540, 202, 22, INK, 800);
});
shot(14, push(300, 430, 1.0, 1.06), function (u, d, t) {
  var dk = ((u - .4) % 1.3) / 1.3;
  return paper() + frontEye(300, 520, 90, .35, {}) + dropper(300, 230, 1.5, 180, u > .4 ? dk : 0);
});
// 15 · in kids and young people the muscle is strong: it doesn't believe the balloon
shot(15, push(320, 410, 1.0, 1.06), function (u, d, t) {
  var sq = .75 + .25 * Math.sin(t * 3);
  return paper() + eye(380, 470, 170, { fat: sq, musc: 1, nerve: false }) + balloonPic(150, 170, 90, .35, t) + cross(150, 170, 1.2, at(u, d - 1.6, .5)) +
    tag("قوية", 500, 160, at(u, 1, .3), 36, ORANGE);
});
// 16 · the drop blocks the nerve signal to two muscles: the lens muscle and the pupil muscle
shot(16, push(320, 410, .98, 1.04), function (u, d, t) {
  var E = eyeGeo(360, 430, 180, {}), k = at(u, .3, 1), blk = at(u, 1.4, .4), s = paper() + eye(360, 430, 180, { musc: 1 - blk, irisHi: 1 - blk });
  for (var i = 0; i < 2; i++) { var y = 430 - (i ? 40 : 120), p = ((t * 0.9 + i * .5) % 1); s += draw("M640 " + (y - 120) + " Q520 " + (y - 160) + " " + f(E.lx + 30) + " " + f(y), k, ORANGE, 2.6, ' stroke-dasharray="6 6"'); if (blk < .5) s += C(lerp(640, E.lx + 30, p), lerp(y - 120, y, p), 6, ORANGE, 1.2); }
  s += cross(E.lx + 60, 300, .9, blk) + label(E.lx + 10, 430 - E.lry - 40, 330, 170, "عضلة العدسة", OLIVE, at(u, 1.2, .5), 24) + label(E.ix, 430 + 120, 300, 720, "عضلة الحدقة", OLIVE, at(u, 2.2, .5), 24);
  return s + dropper(560, 650, .6, 160, 0);
});
// 17 · the lens stays relaxed, the pupil opens wide for hours, so everything is a blur
shot(17, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .5, 1.6);
  return paper() + frontEye(320, 340, 120, lerp(.3, 1, k), {}) + G("", R(170, 560, 300, 160, "#f6f2e6", 2) + [0, 1, 2, 3].map(function (i) { return R(195, 585 + i * 32, 250 - i * 30, 12, "#8f8576", 0); }).join(""), 1) +
    '<g filter="url(#bl17)"></g><filter id="bl17"><feGaussianBlur stdDeviation="3"/></filter>' + G("", R(170, 560, 300, 160, PAPER, 0), at(u, d * .6, .6) * .6) +
    tag("ساعات", 520, 150, at(u, 1.6, .3), 32, ORANGE);
});
// 18 · the doctor holds a small scope and sweeps a streak of light across your eye
shot(18, push(320, 430, .95, 1.03), function (u, d, t) {
  var ey = 360, sw = Math.sin(t * 2.4);
  return paper() + R(-200, 600, 1040, 400, "#e3d8bf", 0) + patient(180, ey, 1.1, t, { lap: true }) + doctor(470, ey - 4, 1.1, t) +
    G("", '<path d="M' + f(450) + ' ' + f(ey) + ' L186 ' + f(ey - 14 + sw * 10) + ' L186 ' + f(ey + 14 + sw * 10) + ' Z" fill="#f2d36b" opacity=".45"/>', at(u, .8, .4)) +
    label(462, ey - 20, 380, 170, "كشاف", OLIVE, at(u, .6, .5), 28);
}, { tr: "out" });
shot([18, 1], push(320, 400, .98, 1.04), function (u, d, t) {
  var E = eyeGeo(470, 420, 130, { pupil: .9 }), sw = Math.sin(t * 2.4);
  return paper() + retinoscope(120, 380, 1.3, true) + eye(470, 420, 130, { pupil: .9, nerve: false }) +
    '<path d="M160 333 L' + f(E.ix) + ' ' + f(420 - 40 + sw * 30) + ' L' + f(E.ix) + ' ' + f(420 + 40 + sw * 30) + ' Z" fill="#f2d36b" opacity=".45"/>' +
    inset(420, 160, 95, frontEye(0, 0, 50, 1, { red: 1, streak: sw }), at(u, .8, .3)) + "";
}, { tr: "in" });
// 19 · lenses one after another in front of the eye, until the red glow stops moving: the real number
shot(19, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var stop = at(u, d - 2.6, .3), off = Math.min(4, Math.floor(u / ((d - 2.6) / 4))) + at((u % ((d - 2.6) / 4)), 0, .25) * (stop < 1 ? 1 : 0), sw = Math.sin(t * 2.4) * (1 - stop);
  return paper() + retinoscope(90, 400, 1.1, true) + lensRack(250, 420, Math.min(4, off)) + eye(470, 420, 120, { pupil: .9, nerve: false }) +
    inset(430, 170, 95, frontEye(0, 0, 50, 1, { red: 1, streak: stop ? 0 : sw, }) + (stop ? '<circle r="17" fill="#f0a06a" opacity=".8"/>' : ""), 1) +
    numBox(LTR("-1.00"), 470, 640, stop, 40) + check(580, 640, .9, at(u, d - 2, .5), OLIVE);
});
// 20 · the myth: the drops are only for the number. No.
shot(20, push(320, 420, 1.06, .98), function (u, d, t) {
  return paper() + dropper(320, 380, 1.6, 0, 0) + tag("النمرة بس", 320, 640, at(u, .3, .3), 34, INK) + cross(320, 640, 1.6, at(u, d - .7, .5));
}, { tr: "out" });
// 21 · the wide pupil is an open door into the eye: vessels and the optic nerve, alive, without a cut
shot(21, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .2, 1.6);
  if (u < 1.8) return paper() + G("translate(320 400) scale(" + f(lerp(1, 3.6, k)) + ") translate(-320 -400)", frontEye(320, 400, 110, 1, { red: k }));
  return paper() + fundus(320, 400, 280, t) + label(320 + 280 * .32, 400, 380, 740, "عصب البصر", OLIVE, at(u, 2.6, .5), 26) + label(200, 250, 250, 100, "أوعية الدم", ORANGE, at(u, 2.2, .5), 26);
});
// 22 · from them: diabetes and blood pressure, before the person feels a thing
shot(22, push(320, 400, 1.06, 1.0), function (u, d, t) {
  return paper() + fundus(320, 420, 250, t, { sick: at(u, .4, 1.4) }) + tag("السكر", 150, 120, at(u, .6, .3), 34, ORANGE) + tag("الضغط", 470, 120, at(u, 1.4, .3), 34, ORANGE);
});
// 23 · «يعني من الآخر»: the four steps with ticks
shot(23, push(320, 400, .98, 1.02), function (u, d, t) {
  var lp = LN[23], len = lp.end - lp.start, s = paper();
  var items = [[refractor(0, 0, .42, t, {}), "النور الراجع"], [balloonPic(0, 0, 60, .3, t), "العضلة ترتاح"], [dropper(0, 10, .7, 0, 0), "القطرة"], [lensRack(0, 0, 2, .3), "العدسات"]];
  items.forEach(function (it, i) { var x = 170 + (i % 2) * 300, y = 220 + Math.floor(i / 2) * 330, k = at(u, len * (.12 + i * .22), .4);
    s += G("", R(x - 125, y - 120, 250, 280, "#f6f2e6", 2) + G("translate(" + f(x) + " " + f(y) + ")", it[0]) + T(it[1], x, y + 140, 24, INK, 800), lerp(.25, 1, k)) + callout(String(i + 1), x - 110, y - 104, k); });
  return s;
});
// 24 · the odd fact: until 1851 nobody had seen inside a living eye; Helmholtz stacked glass plates in front of a lamp
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + bigNum("1851", "", 320, 170, at(u, 1, .4), ORANGE, 90) + G("translate(320 360) scale(1.02) translate(-310 -330)", helmholtz(u - d * .4, t) + label(300, 330, 330, 560, "ألواح إزاز", BLUE, at(u, d * .6, .5), 22) + label(110, 400, 100, 600, "لمبة", ORANGE, at(u, d * .72, .5), 22));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: you, chin on the machine, the screen gives a number. line 1: what you see inside — the balloon (and no letters).
  // line 2: inside your eye the muscle keeps squeezing the lens (an inset).
  var s = refractor(240, 320, 1.05, t, { scr: t > LN[0].start + 1.6 ? "-1.25" : "" }) + patient(220, 320, 1.05, t, { blink: (t % 3.7) < .12 });
  if (li >= 1) { var k = ease((t - LN[1].start) / .4); s += G("", balloonPic(140, 140, 100, 0, t), k) + G("", T("ABC", 470, 80, 40, INK, 800) + cross(470, 68, 1, ease((t - LN[1].start - .5) / .4)), k); }
  if (li >= 2) { var q = (Math.sin(t * 3) + 1) / 2; s += inset(470, 520, 110, eye(40, 0, 90, { fat: q, musc: q, nerve: false }), ease((t - LN[2].start) / .3)); }
  return s;
};
SCENE.bumper = function (u, t) {
  return G("translate(90 100) scale(.55)", frontEye(0, 0, 70, .4 + .2 * Math.sin(t * 1.4), {}));
};
SCENE.outro = function (svg, u, t) {
  var E = eyeGeo(380, 140, 100, {});
  return refractor(70, 140, .42, t, {}) + eye(380, 140, 100, { nerve: true }) +
    callout("1", 90, 60, ease(u / .3)) + callout("2", E.lx + 10, 140 - E.lry - 30, ease(u / .3 - .5)) + callout("3", E.ix - 20, 140 - E.pup - 14, ease(u / .3 - 1)) + callout("4", E.retX + 20, 70, ease(u / .3 - 1.5));
};
