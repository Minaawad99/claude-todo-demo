// ── «قطتك بتشوفك إزاي؟» — drawings. The cat in cat.js (a brown tabby, from photos, refs/SOURCES.md); the room, the owner,
// the eye cut, the split view and the eye filter come from common.js (shared with the dog episode). Shapes from real
// references: the slit pupil from a thin vertical line to a full circle (Banks et al. 2015: ~135× in area for the domestic cat,
// ~15× for us); the retina packed with rods; the tapetum lucidum, a mirror layer behind the retina that sends the light back
// for a second pass and makes the eyeshine; whiskers about as wide as the body, swept forward when something is close.

var NIGHT = "#1c1f26", NIGHT2 = "#262a33", BULB = "#f2d36b";
// the cat's view: blur and the dichromat matrix (cats, like dogs, see blue and yellow-green; red goes dull)
function catView(inner, b) { return dogView(inner, b || 6); }
// darkness over a scene: k 0..1
function dark(k, x, y, w, h) { return '<rect x="' + (x || -400) + '" y="' + (y || -400) + '" width="' + (w || 1440) + '" height="' + (h || 1600) + '" fill="#0b0c10" opacity="' + f(clamp(k) * .94) + '"/>'; }
// a big cat eye seen from the front, with the fur round it: the pupil from a slit (0) to round (1), shine
function bigCatEye(x, y, r, pupil, glow) {
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 1.7) + '" ry="' + f(r * 1.45) + '" fill="' + TAB + '" stroke="' + INK + '" stroke-width="3"/>';
  for (var i = 0; i < 6; i++) { var a = -2.6 + i * .32; s += '<path d="M' + f(x + Math.cos(a) * r * 1.2) + ' ' + f(y + Math.sin(a) * r * 1.1) + ' L' + f(x + Math.cos(a) * r * 1.6) + ' ' + f(y + Math.sin(a) * r * 1.4) + '" stroke="' + TAB_D + '" stroke-width="6" stroke-linecap="round"/>'; }
  return s + catEye(x, y, r, r * .82, pupil, 1, glow);
}
// a human eye from the front: white, iris, a round pupil (p 0..1 small to big), lids and lashes
function humanEye(x, y, r, p) {
  var id = "he" + (++CLIPN), eye = 'M' + f(x - r * 1.5) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y - r * 1.25) + ' ' + f(x + r * 1.5) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + r * 1.1) + ' ' + f(x - r * 1.5) + ' ' + f(y) + ' Z';
  var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 2) + '" ry="' + f(r * 1.5) + '" fill="#e0a98a" stroke="' + INK + '" stroke-width="3"/>';
  s += '<clipPath id="' + id + '"><path d="' + eye + '"/></clipPath><path d="' + eye + '" fill="#fbf8f1"/><g clip-path="url(#' + id + ')">' + C(x, y, r * .62, "#6b4a32", 1.6) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * lerp(.12, .44, clamp(p))) + '" fill="#14110d"/><circle cx="' + f(x + r * .2) + '" cy="' + f(y - r * .22) + '" r="' + f(r * .09) + '" fill="#fff"/></g>';
  return s + '<path d="' + eye + '" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(x - r * 1.3) + ' ' + f(y - r * .9) + ' Q' + f(x) + ' ' + f(y - r * 1.6) + ' ' + f(x + r * 1.3) + ' ' + f(y - r * .9) + '" stroke="#3a2c22" stroke-width="7" fill="none" stroke-linecap="round"/>';
}
// sun and moon chips
function sunIcon(x, y, r, t) { return sun(x, y, r, t); }
// a strip of retina seen from the side: rods (tall thin, blue) and cones (short, olive), a few light dots falling in
function retinaStrip(x, y, w, nRods, nCones, t, k) {
  var s = R(x, y, w, 120, "#f1e2d2", 2) + R(x, y + 120, w, 22, TAPETUM, 0);
  var n = nRods + nCones, i, kk = clamp(k == null ? 1 : k);
  for (i = 0; i < n; i++) { var cx = x + 10 + (i + .5) * (w - 20) / n, cone = nCones && (i % Math.round(n / nCones) === 0);
    s += cone ? P("M" + f(cx - 5) + " " + (y + 118) + " L" + f(cx - 5) + " " + (y + 70) + " L" + f(cx) + " " + (y + 52) + " L" + f(cx + 5) + " " + (y + 70) + " L" + f(cx + 5) + " " + (y + 118) + " Z", OLIVE, 1.4)
              : R(cx - 3, y + 16, 6, 102, BLUE, 1.2, 3); }
  for (i = 0; i < 8; i++) { var p = ((t * .6 + hash(i)) % 1), lx = x + 20 + hash(i + 4) * (w - 40); s += '<circle cx="' + f(lx) + '" cy="' + f(y - 60 + p * 170) + '" r="5" fill="' + BULB + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(kk * Math.sin(p * Math.PI)) + '"/>'; }
  return s;
}
// a light bulb, lit (k 0..1)
function bulb(x, y, sc, k) {
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", (k > 0 ? '<circle r="46" fill="' + BULB + '" opacity="' + f(.3 * k) + '"/>' : "") +
    '<path d="M-22 10 C-36 -6 -30 -36 0 -38 C30 -36 36 -6 22 10 L16 24 L-16 24 Z" fill="' + (k > 0 ? BULB : "#e8e2d2") + '" stroke="' + INK + '" stroke-width="2.4"/>' + R(-15, 24, 30, 16, "#9a9a92", 2) + '<path d="M-8 6 L-4 -10 L0 4 L4 -10 L8 6" stroke="' + INK + '" stroke-width="1.6" fill="none"/>');
}
// a desk lamp in profile with a mirror behind the bulb (the analogy): rays out, and rays bounced back by the mirror
function lampMirror(x, y, t, k) {
  var s = R(x - 60, y + 120, 120, 16, "#8a7a62", 2) + P("M" + (x - 6) + " " + (y + 120) + " L" + (x - 6) + " " + (y + 20) + " L" + (x + 6) + " " + (y + 20) + " L" + (x + 6) + " " + (y + 120) + " Z", "#8a7a62", 2);
  s += P("M" + (x - 70) + " " + (y - 60) + " Q" + (x - 110) + " " + y + " " + (x - 70) + " " + (y + 60), "none", 9, ' stroke="#c9d6dc" stroke-linecap="round"') + P("M" + (x - 70) + " " + (y - 60) + " Q" + (x - 110) + " " + y + " " + (x - 70) + " " + (y + 60), "none", 2);
  s += bulb(x - 20, y, 1, 1);
  for (var i = 0; i < 5; i++) { var a = (-40 + i * 20) * Math.PI / 180, ph = (t * .8 + i * .2) % 1;
    s += '<path d="M' + f(x + 10 + Math.cos(a) * 40) + ' ' + f(y + Math.sin(a) * 40) + ' l' + f(Math.cos(a) * 160) + ' ' + f(Math.sin(a) * 160) + '" stroke="' + BULB + '" stroke-width="5" stroke-dasharray="14 12" stroke-dashoffset="' + f(-t * 50) + '" stroke-linecap="round"/>';
    if (k > 0) s += '<path d="M' + f(x - 50) + ' ' + f(y + (i - 2) * 22) + ' L' + f(x + 220) + ' ' + f(y + (i - 2) * 50) + '" stroke="#e8a63a" stroke-width="4" stroke-dasharray="10 14" stroke-dashoffset="' + f(-t * 50) + '" opacity="' + f(k * .8) + '"/>'; }
  return s;
}
// a torch in a hand, beam to the right
function torch(x, y, ang, k) {
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ")", (k > 0 ? '<path d="M40 -14 L560 -120 L560 120 L40 14 Z" fill="#fff6c8" opacity="' + f(.22 * k) + '"/>' : "") +
    R(-60, -14, 100, 28, "#3a3a40", 2, 6) + R(36, -20, 14, 40, "#5a5a62", 2, 3) + '<ellipse cx="-50" cy="0" rx="22" ry="20" fill="#e0a98a" stroke="' + INK + '" stroke-width="2"/>');
}
// sound rings travelling from a point
function rings(x, y, t, col, k, n) { var s = ""; for (var i = 0; i < (n || 3); i++) { var p = (t * .7 + i / (n || 3)) % 1; s += '<path d="M' + f(x + 14 + p * 70) + ' ' + f(y - 18 - p * 26) + ' Q' + f(x + 26 + p * 82) + ' ' + f(y) + ' ' + f(x + 14 + p * 70) + ' ' + f(y + 18 + p * 26) + '" stroke="' + (col || ORANGE) + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f((1 - p) * clamp(k == null ? 1 : k)) + '"/>'; } return s; }
// a little toy mouse on the floor
function toyMouse(x, y, sc) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + sc + ")", '<path d="M-30 0 C-30 -26 20 -30 34 -4 L40 0 Z" fill="#9a9aa2" stroke="' + INK + '" stroke-width="2.2"/><circle cx="-4" cy="-24" r="9" fill="#c8a0a0" stroke="' + INK + '" stroke-width="2"/><circle cx="24" cy="-10" r="2.5" fill="' + INK + '"/><path d="M-30 -2 C-60 -2 -60 20 -80 10" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'); }

// ══ shots (line numbers from script.txt) ══
var FL = 640;
// 3 · «ليه شايفاك مغبّش؟»: the cat looking up at a blurred owner
shot(3, push(330, 420, 1.0, 1.08), function (u, d, t) {
  var o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .3] }), c = catFront({ x: 170, y: FL + 6, s: 1.1, pupil: .3, look: [.6, -.8], tilt: -8 });
  return paper() + room(FL, { plantX: 600 }) + catView(o.svg, 6) + shadow(170, FL + 4, 90) + c.svg + G("", T("؟", 260, 200, 120, ORANGE, 800), at(u, .5, .3));
});
// 4 · an eye made for hunting, not for detail: about five times weaker than yours
shot(4, push(320, 390, 1.0, 1.05), function (u, d, t) {
  var k2 = at(u, d * .4, .8);
  var s = paper() + T("عينك", 320, 70, 30, INK, 800) + eyeCut(290, 220, 120, "human", t, { rays: at(u, .3, .8) }) + label(398, 220, 470, 330, "النقطة دي", ORANGE, at(u, 1.2, .5), 24);
  s += G("", T("عينها", 320, 420, 30, INK, 800) + eyeCut(290, 570, 120, "dog", t, { rays: k2 }) + label(300, 470, 470, 440, "معمولة للصيد", OLIVE, at(u, d * .5, .5), 22), k2 > 0 ? 1 : 0);
  return s + numBox("÷5", 120, 420, at(u, d * .75, .3), 30, true);
});
// 5 · anything closer than a quarter metre is a blur: the toy under her nose, out of focus
shot(5, push(320, 420, 1.05, 1.12), function (u, d, t) {
  var c = catFront({ x: 320, y: 920, s: 2.6, pupil: .4, look: [0, 1], tilt: 0 }), k = at(u, .5, .6);
  var toy = toyMouse(330 + 14 * Math.sin(t * 1.5), 650, 1.6);
  return paper() + c.svg + '<defs><filter id="nearb"><feGaussianBlur stdDeviation="' + f(lerp(0, 5, k)) + '"/></filter></defs><g filter="url(#nearb)">' + toy + '</g>' +
    measure(560, 230, 560, 640, at(u, 1.0, .7), "") + G("", T("25 سم", 560, 212, 26, ORANGE, 800), at(u, 1.6, .3)) + G("", T("؟", 420, 640, 60, ORANGE, 800), at(u, 2.0, .3));
});
// 6 · so she uses her whiskers: they sweep forward and touch what she can't see
shot(6, push(320, 470, 1.1, 1.04), function (u, d, t) {
  var w = at(u, .4, .8) * (.85 + .15 * Math.sin(t * 3)), c = catFront({ x: 320, y: 920, s: 2.6, pupil: .4, look: [0, 1], whisk: w, whiskCol: w > .3 ? "#f2c98a" : null });
  return paper() + c.svg + '<g filter="url(#nearb)">' + toyMouse(330, 650, 1.6) + '</g><defs><filter id="nearb"><feGaussianBlur stdDeviation="5"/></filter></defs>' +
    label(160, 470, 150, 610, "الشنبات", OLIVE, at(u, 1.0, .5), 26) + G("", cloud(330, 620, 40, t, "#f2c98a", 1, 2), w);
});
// 7 · colours: blue and yellow-green stay, red goes dull
shot(7, push(320, 400, 1.04, 1.0), function (u, d, t) {
  var toys = [["#3e64b5", "أزرق"], ["#e2c23a", "أصفر"], ["#7fae3a", "أخضر"], [SHIRT, "أحمر"]], s = paper();
  s += T("إنت", 560, 150, 28, INK, 800, "end") + T("هي", 560, 450, 28, INK, 800, "end");
  for (var i = 0; i < 30; i++) { s += R(60 + i * 17, 330, 17.6, 26, spec(400 + i * 10), 0) + G("", R(60 + i * 17, 630, 17.6, 26, specDog(400 + i * 10), 0), at(u, .8 + i * .03, .2)); }
  s += R(60, 330, 510, 26, "none", 1.6) + R(60, 630, 510, 26, "none", 1.6);
  toys.forEach(function (q, i) { var x = 120 + i * 125, bob = 4 * Math.sin(t * 3 + i), k = at(u, .2 + i * .25, .3), kd = at(u, 1.2 + i * .3, .4);
    s += G("", C(x, 240 + bob, 42, q[0], 2.4) + '<path d="M' + (x - 26) + ' ' + f(226 + bob) + ' q12 -14 26 -12" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>' + T(q[1], x, 310, 20, INK, 700), k);
    s += G("", C(x, 540 - bob, 42, dvHex(q[0]), 2.4) + (i === 3 ? tag("باهت", x, 470, at(u, 2.6, .3), 22, ORANGE) : check(x, 470, .6, at(u, 2 + i * .3, .4), BLUE)), kd);
  });
  return s;
});
// 8 · «طب إزاي بتشوف في الضلمة؟»: the room goes dark, two eyes shine
shot(8, push(320, 420, 1.12, 1.0), function (u, d, t) {
  var c = catFront({ x: 320, y: FL + 6, s: 1.4, pupil: 1, glow: at(u, .25, .4) });
  return paper() + room(FL, { rugX: 320 }) + shadow(320, FL + 4, 110) + c.svg.replace(/x/, "x") + dark(at(u, 0, .4) * .9) + (at(u, .25, .4) > 0 ? catEye(c.eyes[0][0], c.eyes[0][1], 22, 17, 1, 1, at(u, .25, .4)) + catEye(c.eyes[1][0], c.eyes[1][1], 22, 17, 1, 1, at(u, .25, .4)) : "") +
    G("", T("؟", 470, 230, 120, ORANGE, 800), at(u, .8, .3));
}, { tr: "out" });
// 9 · secret one, the pupil: a thin line by day, a full circle by night
shot(9, push(320, 380, 1.0, 1.06), function (u, d, t) {
  var k = clamp((Math.sin((u - 1.2) * 1.1) + 1) / 2), night = u > 1.2 ? k : 0, s = paper();
  s += G("", R(-400, -400, 1440, 1600, NIGHT, 0), night * .85);
  s += bigCatEye(320, 360, 120, night, 0);
  s += G("", sun(110, 120, 34, t), 1 - night) + G("", moon(530, 120, 34), night);
  s += G("", tag("بالنهار: خط", 160, 640, 1, 26, ORANGE), (1 - night) * at(u, .4, .3)) + G("", tag("بالليل: دايرة", 480, 640, 1, 26, BLUE), night);
  return s;
});
// 10 · her pupil grows about 135 times in area, yours about 15
shot(10, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var p = (Math.sin(t * 1.6) + 1) / 2, s = paper();
  s += bigCatEye(180, 280, 80, p, 0) + humanEye(470, 280, 62, p);
  s += G("", N(count(135, at(u, .5, 1.6)) + "×", 180, 520, 66, ORANGE), at(u, .4, .3)) + T("القطة", 180, 570, 24, INK, 700);
  s += G("", N("15×", 470, 520, 66, INK) + T("إنت", 470, 570, 24, INK, 700), at(u, d * .55, .3));
  return s;
});
// 11 · secret two: the retina is packed with cells that feel the faintest light — far more than yours
shot(11, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + T("عينك", 320, 90, 26, INK, 800) + retinaStrip(60, 120, 520, 14, 6, t, 1);
  s += G("", T("عينها", 320, 420, 26, INK, 800) + retinaStrip(60, 450, 520, 38, 3, t, 1), at(u, d * .35, .4));
  return s + label(84, 220, 40, 330, "خلايا الضلمة", BLUE, at(u, d * .55, .5), 24);
});
// 12 · secret three: a mirror behind the retina, the tapetum
shot(12, push(320, 380, 1.0, 1.1), function (u, d, t) {
  var s = paper() + eyeCut(300, 380, 210, "dog", t, { rays: at(u, .3, .8) });
  return s + label(470, 220, 400, 100, "التابيتوم", TAPETUM, at(u, .9, .6), 30) + label(452, 300, 560, 600, "الشبكية", ORANGE, at(u, 1.6, .5), 24) + G("", tag("مراية", 140, 120, 1, 30, BLUE), at(u, d * .6, .3));
}, { tr: "in" });
// 13 · the light the cells missed bounces back off the mirror for a second chance
shot(13, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper() + R(40, 140, 560, 180, "#f1e2d2", 2) + R(40, 320, 560, 40, TAPETUM, 2) + T("الشبكية", 320, 130, 22, ORANGE, 800) + T("المراية", 320, 400, 22, TAPETUM, 800);
  for (var i = 0; i < 10; i++) s += R(70 + i * 54, 170, 10, 140, BLUE, 1.2, 4);
  var cyc = (u * .5) % 1, x = 300, yIn = lerp(-20, 320, clamp(cyc * 2)), yBack = lerp(320, 200, clamp(cyc * 2 - 1));
  s += '<path d="M' + x + ' -20 L' + x + ' ' + f(cyc < .5 ? yIn : 320) + '" stroke="' + BULB + '" stroke-width="7" stroke-linecap="round"/>';
  if (cyc >= .5) s += '<path d="M' + x + ' 320 L' + f(x + 40) + ' ' + f(yBack) + '" stroke="#e8a63a" stroke-width="7" stroke-linecap="round"/>';
  if (cyc > .9) s += '<circle cx="' + (x + 40) + '" cy="200" r="22" fill="' + BULB + '" opacity=".7"/>';
  s += G("", tag("فرصة تانية", 470, 560, 1, 28, ORANGE), at(u, d * .5, .3)) + G("", N("1", 250, 260, 40, INK), cyc < .5 ? 1 : 0) + G("", N("2", 380, 250, 40, ORANGE), cyc >= .5 ? 1 : 0);
  return s;
});
// 14 · like a mirror behind a lamp: the room gets brighter
shot(14, push(300, 380, 1.25, 1.0), function (u, d, t) {
  return paper() + R(-400, -400, 1440, 1600, "#d9cfb8", 0) + G("", R(-400, -400, 1440, 1600, "#f6ecc8", 0), at(u, .3, 1.2) * .8) + lampMirror(260, 360, t, at(u, 1.0, .8)) + label(196, 310, 120, 160, "مراية", BLUE, at(u, .4, .5), 28);
});
// 15 · that is exactly why her eyes shine when you light them up in the dark
shot(15, push(330, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .8, .4), c = catFront({ x: 430, y: FL, s: 1.2, pupil: 1 });
  var s = R(-400, -400, 1440, 1600, NIGHT, 0) + R(-400, FL, 1440, 400, NIGHT2, 0) + '<g opacity="' + f(.15 + .25 * k) + '">' + c.svg + '</g>';
  s += catEye(c.eyes[0][0], c.eyes[0][1], 15.8, 12.4, 1, 1, k) + catEye(c.eyes[1][0], c.eyes[1][1], 15.8, 12.4, 1, 1, k);
  return s + torch(60, 330, 4 + 2 * Math.sin(t), k) + G("", tag("عينيها بتلمع", 300, 120, 1, 28, ORANGE), at(u, 1.4, .3));
});
// 16 · so she needs about a sixth of the light you need
shot(16, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper() + T("إنت محتاج", 470, 120, 26, INK, 800) + T("هي محتاجة", 150, 120, 26, INK, 800);
  for (var i = 0; i < 6; i++) s += bulb(400 + (i % 3) * 70, 220 + Math.floor(i / 3) * 110, .9, at(u, .3 + i * .15, .2));
  s += G("", bulb(150, 270, 1.2, 1), at(u, 1.5, .3)) + G("", N("1/6", 150, 520, 80, ORANGE), at(u, d * .5, .3));
  return s;
});
// 17 · «طب بتعرفك إزاي؟»: the cat in front of the owner, a question mark
shot(17, push(320, 420, 1.1, 1.0), function (u, d, t) {
  var o = owner(410, FL, 1.25, t, { mouth: "smile", look: [-.6, .5], tilt: -6 }), c = catFront({ x: 170, y: FL + 6, s: 1.15, pupil: .35, look: [.7, -.8], tilt: -10 });
  return paper() + room(FL) + o.svg + shadow(170, FL + 4, 90) + c.svg + G("", T("؟", 230, 170, 130, ORANGE, 800), at(u, .4, .3));
});
// 18 · the Japan study: strangers' voices, then the owner's — her ears turn to it
shot(18, push(320, 420, 1.0, 1.05), function (u, d, t) {
  var turn = at(u, d * .55, .5), c = catSide({ x: 420, y: 640, s: 1.4, dir: 1, ears: 70 * turn, head: -4 * turn }), s = paper() + R(-400, 640, 1440, 400, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  ["#b9b3a6", "#b9b3a6", ORANGE].forEach(function (col, i) { var y = 160 + i * 130, on = i < 2 ? at(u, .3 + i * .6, .3) * (1 - at(u, d * .5, .3)) : at(u, d * .5, .3);
    s += G("", backHead(70, y, .85).replace(/#2f2620/g, i < 2 ? "#6f6a62" : "#2f2620") + rings(110, y + 10, t, col, 1), .35 + .65 * on); });
  s += c.svg + G("", tag("صوت صاحبها", 150, 600, 1, 24, ORANGE), at(u, d * .55, .3)) + G("", tag("اليابان 2013", 470, 120, 1, 22), at(u, .3, .3));
  return s;
});
// 19 · she moves her ears and head toward you… but usually doesn't get up
shot(19, push(320, 420, 1.06, 1.0), function (u, d, t) {
  var turn = clamp((Math.sin(t * 1.6) + 1) / 2), w = walker(120, FL, 1.05, 0, true, { still: true, mouth: "open" }), c = catSide({ x: 470, y: FL, s: 1.15, dir: 1, ears: 75 * turn, head: -6 * turn, eyes: blink(t, 2) });
  var s = paper() + room(FL, { plant: false, frameX: 300 }) + w.svg + rings(190, FL - 360, t, ORANGE, 1) + c.svg;
  return s + G("", tag("مبتقومش", 470, 260, 1, 30, ORANGE), at(u, d * .55, .3)) + label(c.ear[0], c.ear[1], c.ear[0] + 40, c.ear[1] - 90, "ودانها", OLIVE, at(u, .6, .5), 22);
});
// 20 · and by your smell: rubbing her head on you puts her scent on you
shot(20, push(330, 440, 1.0, 1.08), function (u, d, t) {
  var r = (Math.sin(t * 2.2) + 1) / 2, o = owner(430, FL, 1.25, t, { mouth: "smile", look: [-.5, .6], tilt: -6 }), c = catSide({ x: 230, y: FL, s: 1.15, dir: 1, rub: r, eyes: .2 + .3 * r, tail: 30 });
  return paper() + room(FL) + o.svg + c.svg + cloud(c.cheek[0] + 30, c.cheek[1] + 10, 30, t, ORANGE, at(u, .6, .5)) + cloud(400, FL - 140, 40, t, ORANGE, at(u, d * .5, .6), 7) +
    G("", tag("إنت تبعها", 330, 150, 1, 30, ORANGE), at(u, d * .6, .3));
});
// 21 · the myth: cats see in pitch dark. No.
shot(21, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return R(-400, -400, 1440, 1600, "#07080a", 0) + G("", tag("ضلمة كحل", 320, 200, 1, 34), at(u, .3, .3)) + G("", N("0", 320, 420, 120, "#f6f1e6") + T("نور", 320, 480, 26, "#f6f1e6", 700), at(u, .6, .3)) + cross(320, 380, 3, at(u, d * .75, .5));
});
// 22 · with no light at all, she's just like you
shot(22, pan(260, 420, 380, 400, 1.1), function (u, d, t) {
  var c = catFront({ x: 200, y: FL + 6, s: 1.2, pupil: 1, eyes: blink(t) }), o = owner(450, FL, 1.2, t, { mouth: "neutral", look: [0, 0] });
  var bob = 18 * Math.sin(t * 2.4);
  return R(-400, -400, 1440, 1600, "#07080a", 0) + '<g opacity="' + f(.05 + .05 * Math.sin(t * 1.8)) + '">' + room(FL) + c.svg + o.svg + '</g>' + G("", tag("زيك بالظبط", 320, 150, 1, 30, ORANGE), at(u, d * .4, .3)) +
    G("", T("؟", 200, 380 + bob, 80, "#f6f1e6", 800) + T("؟", 450, 280 - bob, 80, "#f6f1e6", 800), at(u, .3, .3));
});
// 23 · the recap: a pupil that opens wide, lots of dark cells, a mirror behind the eye
shot(23, push(320, 400, 1.12, .98), function (u, d, t) {
  var s = paper(), ks = [at(u, .2, .4), at(u, d * .3, .4), at(u, d * .55, .4)];
  s += G("translate(" + f(8 * Math.sin(t * 1.7)) + " " + f(10 * Math.sin(t * 2.2)) + ")", G("", R(40, 60, 260, 220, "#f4ecdb", 2) + bigCatEye(170, 160, 42, (Math.sin(t * 2) + 1) / 2, 0) + T("البؤبؤ", 170, 320, 26, INK, 800), ks[0]));
  s += G("", R(340, 60, 260, 220, "#f4ecdb", 2) + G("translate(350 80) scale(.46)", retinaStrip(0, 120, 520, 30, 3, t, 1)) + T("خلايا الضلمة", 470, 320, 26, INK, 800), ks[1]);
  s += G("", R(140, 370, 360, 300, "#f4ecdb", 2) + G("translate(320 510) scale(.48) translate(-300 -380)", eyeCut(300, 380, 210, "dog", t, {})) + T("المراية", 320, 700, 28, TAPETUM, 800), ks[2]);
  return s;
});
// 24 · the oddest: blink slowly at her and she'll often blink back — the cat smile
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var cyc = (u * .32) % 1, you = cyc < .45 ? Math.max(.04, 1 - Math.sin(clamp(cyc / .45) * Math.PI)) : 1, her = cyc > .5 ? Math.max(.04, 1 - Math.sin(clamp((cyc - .5) / .45) * Math.PI)) : 1;
  var o = owner(170, 900, 1.7, t, { mouth: "smile", eyes: you, look: [.6, .3] });
  var c = catFront({ x: 470, y: 760, s: 1.6, pupil: .4, eyes: her, tilt: 6 });
  return paper() + '<clipPath id="oh"><rect x="-100" y="0" width="360" height="560"/></clipPath><g clip-path="url(#oh)">' + o.svg + '</g>' + c.svg +
    G("", tag("ابتسامة القطط", 320, 640, 1, 34, ORANGE), at(u, d * .6, .3)) + G("", T("ببطء…", 170, 100, 28, BLUE, 800), at(u, .4, .3));
});

// ══ the hook card art (608 × 660): line 0 the owner split between your eye and hers; line 1 the light goes out —
// you see nothing, she still sees you, her eyes shining ══
SCENE.intro = function (svg, t, li) {
  var fl = 600, u0 = t - LN[0].start, o = owner(304, fl, 1.18, t, { mouth: "smile" }), c = catFront({ x: 130, y: fl + 6, s: .95, pupil: li >= 1 ? 1 : .3, look: [.7, -.7], tilt: -8 });
  var base = room(fl, { plantX: 520, frameX: 150, rugX: 304 }) + o.svg, s;
  if (li === 0) { var w = lerp(620, 304, ease((u0 - .5) / 1.1)); s = split(w, base, catView(base, 6), 0, 660) + (u0 > .8 ? T("إنت", 150, 60, 30, INK, 800) + T("هي", 460, 60, 30, INK, 800) : "") + c.svg; }
  else {
    var u1 = t - LN[1].start, k = ease(u1 / .5);
    s = split(304, base + dark(k) + T("إنت", 150, 60, 30, "#f6f1e6", 800), '<g filter="url(#grey)">' + catView(base, 4) + '</g>' + dark(k * .55) + T("هي", 460, 60, 30, "#f6f1e6", 800), 0, 660) + dvDefs(4) + '<g opacity="' + f(1 - .85 * k) + '">' + c.svg + '</g>';
    if (k > .3) s += catEye(c.eyes[0][0], c.eyes[0][1], 13.3, 10.4, 1, 1, k) + catEye(c.eyes[1][0], c.eyes[1][1], 13.3, 10.4, 1, 1, k);
    s += G("translate(70 120)", R(-24, -36, 48, 72, "#efe6d0", 2, 6) + R(-8, -20, 16, 28, k > .5 ? "#6f6a62" : "#efe6d0", 1.6, 3) + '<circle cx="0" cy="' + (k > .5 ? 4 : -10) + '" r="7" fill="' + INK + '"/>', 1 - .5 * k);
  }
  return s;
};
// the bumper (180 × 200): a cat's face, the pupil opening and closing
SCENE.bumper = function (u, t) {
  var c = catFront({ x: 90, y: 262, s: .66, pupil: (Math.sin(t * 2.4) + 1) / 2 });
  return c.svg;
};
// the summary card art (600 × 280): the cat at night, eyes shining, with the three secrets numbered
SCENE.outro = function (svg, u, t) {
  var c = catFront({ x: 300, y: 290, s: 1.0, pupil: 1 });
  return '<rect width="600" height="280" fill="' + NIGHT + '"/><g opacity=".45">' + c.svg + '</g>' + catEye(c.eyes[0][0], c.eyes[0][1], 16, 12.5, 1, 1, 1) + catEye(c.eyes[1][0], c.eyes[1][1], 16, 12.5, 1, 1, 1) + moon(520, 60, 26) +
    callout("1", c.eyes[0][0] - 50, c.eyes[0][1] - 30, ease(u / .3)) + callout("2", c.eyes[1][0] + 50, c.eyes[1][1] - 30, ease(u / .3 - .5)) + callout("3", c.eyes[1][0] + 60, c.eyes[1][1] + 30, ease(u / .3 - 1)) + callout("4", 150, 200, ease(u / .3 - 1.5));
};
