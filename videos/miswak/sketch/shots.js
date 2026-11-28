// ── «المسواك» — shots. Drawings in draw.js (MW.*), people from the Gemini kit (PERSON.sprite), real clips from the partner's
// video in ../clips (played frame by frame inside a taped photo frame). The frame holds still; the camera only flies (~1.8 s)
// in onto a detail and back out. Life comes from the drawing: fibres sway, the host breathes, bristle tips move.
var Z = MW, FULL = [320, 393, 1], LOGO = "../refs/product/logo.png", CLIPN2 = 0;
var CLIPS = { green: 81, bend: 87, pouch: 69, pocket: 84, bag: 72, box: 90, finger: 60, clear: 90 };
function host(name, x, fy, h, t, o) { return PERSON.sprite(name, x, fy, h, Object.assign({ t: t }, o || {})); }
function brand(k) { return G("", Z.logo(LOGO, 510, 62, 220), k == null ? 1 : clamp(k)); }   // the brand corner, top right (the user's rule for the ad part)
// a real clip in a taped frame: plays from the shot's start, holds its last frame
function vid(name, u, x, y, w, h, rot, k) {
  k = pop(k == null ? 1 : k); if (k <= 0) return ""; var n = CLIPS[name], i = Math.min(n, 1 + Math.floor(Math.max(0, u) * 30)), id = "vd" + (++CLIPN2);
  var src = "../clips/" + name + "/" + ("00" + i).slice(-3) + ".jpg";
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + f(k) + ')',
    '<rect x="' + f(-w / 2 - 10) + '" y="' + f(-h / 2 - 10) + '" width="' + f(w + 20) + '" height="' + f(h + 20) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')"><image href="' + src + '" x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/></g>' +
    '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/><rect x="-34" y="' + f(-h / 2 - 22) + '" width="68" height="22" fill="#e9dcae" opacity=".85" transform="rotate(-4)"/>');
}
function ground() { return '<rect x="-400" y="560" width="1440" height="600" fill="#e2cf9f"/>' + Z.line([[-400, 560], [1040, 560]], INK, 2) + [[90, 610], [260, 660], [470, 620], [560, 700]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="18" ry="5" fill="#cdb682"/>'; }).join(""); }
function magFibres(k) {   // the inside of the stick, magnified: fibres with silica grains
  var g = ""; for (var i = 0; i < 14; i++) g += Z.line([[-150, -120 + i * 18], [150, -120 + i * 18 + 6 * Math.sin(i + window.__t * .8)]], i % 2 ? Z.C.FIB : "#d8c497", 9);
  for (i = 0; i < 40; i++) g += '<circle cx="' + f(-140 + 280 * Z.rnd(i)) + '" cy="' + f(-120 + 250 * Z.rnd(i + 40)) + '" r="' + f((2.5 + 3 * Z.rnd(i + 7)) * clamp(k * 1.5 - Z.rnd(i) * .5)) + '" fill="#fff" stroke="' + BLUE + '" stroke-width="1.4"/>';
  return '<clipPath id="mgc"><circle cx="400" cy="250" r="170"/></clipPath><circle cx="400" cy="250" r="170" fill="#f3e8cc"/><g clip-path="url(#mgc)"><g transform="translate(400 250) scale(1.25)">' + g + '</g></g><circle cx="400" cy="250" r="170" fill="none" stroke="' + ORANGE + '" stroke-width="5"/>';
}
function jaw(stainK) { return Z.jawCut(-20, 660, 520, [150, 470], { w: 230, h: 210, r: 230, stain: 1, stainK: stainK }); }
function rub(t) { var x = 150 + 22 * Math.sin(t * 5), y = 300 + 8 * Math.cos(t * 5); return Z.stick(x, y, x - 210, y - 130, 34, { fray: 1 }); }   // the miswak rubbing the crown
function two(t, k, cut) { return Z.stick(110, 230, 470, 230, 30, { fray: 1 }) + Z.chip(560, 230, "النهاردة", OLIVE) + G("", Z.stick(110, 480, 470, 480, 30, { fray: 1, dry: 1, cut: cut || 0 }) + Z.chip(560, 480, "بعد يومين", ORANGE), k); }
var A11 = null; function arch11() { return A11 || (A11 = Z.arch(320, 170, 210, 330, { hot: 5 })); }
function bass(t) { var j = Math.sin(t * 6) * 4; return Z.jawCut(-20, 660, 520, [360], { w: 190, h: 230, r: 240 }) + Z.brushEnd(150 + j * .5, 330 + j, 262 + j * .3, 506, { miswak: true, taper: true }); }
function myth(t, kH, kS) {
  var j = Math.sin(t * 6) * 3;
  return Z.jawCut(-20, 660, 540, [190, 500], { w: 150, h: 190, r: 200 }) +
    G("", Z.brushEnd(40 + j, 380, 112 + j, 530, { hard: true, col: "#c9cdd1" }) + [0, 1, 2].map(function (q) { return Z.line([[96 + q * 8, 532 + q * 6], [110 + q * 8, 540 + q * 6]], "#a8322a", 4); }).join(""), kH) +
    G("", Z.brushEnd(350 + j, 380, 422 + j, 530, { taper: true, miswak: true, bend: .6 + .3 * Math.sin(t * 6) }), kS);
}
function cals(k) { return [0, 1, 2].map(function (q) { return G("", Z.calendar(160 + q * 160, 230, 1.4, ["شهر 1", "شهر 2", "شهر 3"][q]), clamp(k * 3 - q)); }).join(""); }

// 4 · the miswak is a twig of a tree called Arak
shot(4, still(320, 393, 1), function (u, d, t) { return paper() + ground() + appear(at(u, 0, .6), Z.shrub(320, 560, 1.05)) + label(470, 330, 540, 260, "الأراك", OLIVE, at(u, 1.4, .5), 22); });
shot([4, 1], fly([320, 393, 1], [200, 330, 1.7], 1.8), function (u, d, t) { return paper() + ground() + Z.shrub(320, 560, 1.05) + label(470, 330, 540, 260, "الأراك", OLIVE, 1, 22) + iconBox(130, 130, 200, '<g transform="translate(-100 -100)">' + Z.berries(90, 50, 9, 9) + Z.leaf(20, 140, 70, -10) + Z.leaf(100, 140, 70, 10) + '</g>' + T("ثمر الأراك", 0, 88, 16, MUTE), at(u, .4, .4)); });
// 5 · what's inside it?
shot(5, fly([200, 330, 1.7], FULL, 1.8), function (u, d, t) { return paper() + Z.stick(80, 640, 470, 520, 44, { fray: 1 }) + G("", T("؟", 420, 300, 150, ORANGE, 800), at(u, .8, .3)); });
// 6 · natural substances, best known: silica (the magnifier opens on the fibres)
shot(6, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.stick(80, 640, 470, 520, 44, { fray: 1 }) + draw("M150 600 L300 420", at(u, .1, .5), INK, 1.5, ' stroke-dasharray="6 5"') + G("", magFibres(at(u, .6, d)), at(u, .3, .4)) + label(440, 170, 520, 110, "ألياف", OLIVE, at(u, .9, .5), 20) + label(330, 300, 220, 360, "سيليكا", BLUE, at(u, d - .9, .5), 22); });
// 7 · silica: tiny grains that polish the tooth gently, like a polishing cloth (the stains fade as it rubs)
shot(7, fly(FULL, [320, 420, 1.15], 1.8), function (u, d, t) { return paper() + jaw(1) + label(560, 330, 600, 250, "المينا", OLIVE, at(u, 1.2, .5), 20); });
shot([7, 2], still(320, 420, 1.15), function (u, d, t) { return paper() + jaw(1 - at(u, .2, d + 2)) + rub(t) + label(560, 330, 600, 250, "المينا", OLIVE, 1, 20) + [0, 1, 2].map(function (q) { return G("", Z.line([[250 + q * 12, 330 + q * 22], [268 + q * 12, 318 + q * 22]], "#ffffff", 4), clamp(Math.sin(t * 3 + q) * .5 + .5)); }).join(""); });
shot([7, 3], still(320, 420, 1.15), function (u, d, t) { return paper() + jaw(.3 - .3 * at(u, 0, d)) + rub(t) + iconBox(130, 130, 190, '<rect x="-60" y="-20" width="120" height="44" fill="#c7d6e6" stroke="' + INK + '" stroke-width="2"/>' + G('translate(' + f(20 * Math.sin(t * 4)) + ' 0)', Z.blob([[-40, -40], [30, -50], [50, -10], [-10, 0], [-50, -10]], "#e9b949", 2)) + T("قماشة تلميع", 0, 66, 17), at(u, 0, .4)); });
// 8 · and the WHO itself encouraged its use, from the eighties
shot(8, fly([320, 420, 1.15], FULL, 1.8), function (u, d, t) {
  return paper() + appear(at(u, .2, .5), '<rect x="150" y="150" width="340" height="440" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (q) { return Z.line([[190, 300 + q * 34], [450 - (q % 3) * 40, 300 + q * 34]], "#cfc6b4", 6); }).join("") +
    T("منظمة الصحة العالمية", 320, 230, 26, BLUE, 800) + Z.stick(210, 540, 420, 520, 18, { fray: .6 })) + check(470, 560, 1.3, at(u, d * .5, .5), OLIVE) + G("", Z.chip(320, 680, "التمانينات", ORANGE), at(u, d * .6, .3));
});
// 9 · so why do we throw it away? (the host, thinking)
shot(9, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + host("host-think", 300, 775, 650, t) + G("", T("؟", 520, 260, 140, ORANGE, 800), at(u, .3, .3)) + Z.bin(540, 760, 1.1); });
// 10 · the fibres go hard after two days; you cut the end and start again every day or so
shot(10, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + two(t, at(u, .6, .5), 0); });
shot([10, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var o = .5 + .5 * Math.abs(Math.sin(t * 5)); return paper() + two(t, 1, at(u, 0, .5)) + G("", Z.scissors(150, 620, .9, o, -70), at(u, .2, .3)) + label(170, 480, 300, 580, "ناشف", ORANGE, at(u, .3, .5), 20); });
// 11 · the fibres come out of the end of the stick: hard to reach the back teeth and the inside (the upper arch from below)
shot(11, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch11(), w = 6 * Math.sin(t * 3); return paper() + appear(at(u, 0, .5), a.svg) + Z.stick(300 + w, 160, 160 + w, 60, 24, { fray: .9 }); });
shot([11, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch11(), w = 6 * Math.sin(t * 3); return paper() + a.svg + Z.stick(300 + w, 160, 160 + w, 60, 24, { fray: .9 }) + cross(a.back[-1][0], a.back[-1][1], .85, at(u, .1, .5)) + cross(a.back[1][0], a.back[1][1], .85, at(u, .4, .5)) + label(320, 380, 400, 460, "جوه", BLUE, at(u, 1, .5), 22); });
// 12 · what if we took the miswak and made it a brush?
shot(12, fly(FULL, [320, 380, 1.05], 1.8), function (u, d, t) {
  var k = at(u, .8, 1.2); return paper() + G("", Z.stick(80, 250, 400, 250, 30, { fray: 1 }), 1 - .5 * k) + arrow(320, 330, 320, 430, ORANGE, 5, at(u, .5, .6)) + G("translate(120 560)", G("", Z.brushSide(0, 0, 400, { miswak: true, taper: true, h: 70 }), k)) + G("", T("؟", 560, 300, 120, ORANGE, 800), at(u, .2, .3));
});
// 13 · in Japan they made a brush whose bristles are kneaded with miswak powder and silica (the product photo + the real brush)
shot(13, fly([320, 380, 1.05], FULL, 1.8), function (u, d, t) { return paper() + G("", Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2), at(u, .2, .4)) + brand(at(u, .1, .4)) + G("", Z.chip(250, 640, "صنع اليابان", INK), at(u, 1, .3)); });
shot([13, 1], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2) + brand() + Z.chip(250, 640, "صنع اليابان", INK) + vid("green", u, 500, 520, 170, 302, 4, at(u, 0, .4)); });
shot([13, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + Z.photo("../refs/product/mizuha-powder.jpg", 250, 400, 360, 360, -2) + brand() + vid("green", u + 1.2, 500, 520, 170, 302, 4) + Z.tag(250, 300, "بودرة المسواك", ORANGE, 1, -90); });
// 14 · and it's now sold in Egypt by Smart Miswak (the real brush beside its box)
shot(14, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("box", u, 300, 420, 330, 586, -2, at(u, 0, .4)) + G("", Z.chip(320, 740, "متوفرة في مصر", ORANGE), at(u, 1.2, .3)); });
// 15 · the bristles are needle-fine at the tip, like a pencil point
shot(15, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var s = Math.sin(t * 2) * 2; return paper() + brand() + G("", Z.bristle(200, 640, 420, 70, false) + Z.chip(200, 700, "عادية", "#6d6a64"), at(u, 0, .4)) + G('translate(' + f(s) + ' 0)', G("", Z.bristle(440, 640, 420, 70, true) + Z.chip(440, 700, "مدبّبة", ORANGE), at(u, .5, .4))) + iconBox(110, 110, 170, Z.pencil(0, 0, .9, -30), at(u, 1.2, .4)); });
// 16 · so they get between the teeth and down to the gum line (one tooth cut from the side, the brush head across at 45°)
shot(16, fly(FULL, [300, 470, 1.25], 1.8), function (u, d, t) { return paper() + bass(t) + label(262, 512, 120, 600, "خط اللثة", OLIVE, at(u, 1.2, .5), 22); });
shot([16, 1], still(300, 470, 1.25), function (u, d, t) { return paper() + bass(t) + label(262, 512, 120, 600, "خط اللثة", OLIVE, 1, 22) + iconBox(150, 260, 190, G("scale(.6)", Z.frontTeeth(0, 70, 110, 190, true)) + T("بين السنان", 0, 82, 17, ORANGE), at(u, 0, .4)); });
// 17 · many think the hard brush cleans better. No. (it jabs the gum)
shot(17, fly([300, 470, 1.25], FULL, 1.8), function (u, d, t) { return paper() + myth(t, 1, 0) + G("", Z.chip(120, 730, "خشنة", "#6d6a64"), at(u, .4, .3)); });
shot([17, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + myth(t, 1, 0) + Z.chip(120, 730, "خشنة", "#6d6a64") + cross(110, 260, 1, at(u, 0, .5)); });
// 18 · dentists advise the soft one; a hard one can hurt the gum over time (the soft tips bow; then the real brush bends under a finger)
shot(18, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + myth(t, 1, at(u, 0, .5)) + Z.chip(120, 730, "خشنة", "#6d6a64") + cross(110, 260, 1, 1) + check(420, 260, 1.2, at(u, .6, .5), OLIVE) + G("", Z.chip(430, 730, "ناعمة", OLIVE), at(u, .6, .3)); });
shot([18, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("bend", u, 320, 400, 330, 586, -2, at(u, 0, .4)) + Z.chip(320, 740, "ناعمة", OLIVE); });
// 19 · and you can use it without paste when you're out: at work or travelling (the host shows the brush; then the bag)
shot(19, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + host("host-show-brush", 420, 775, 650, t) + iconBox(110, 190, 160, '<rect x="-56" y="-30" width="112" height="76" rx="8" fill="#8d5d35" stroke="' + INK + '" stroke-width="2"/><rect x="-22" y="-44" width="44" height="16" rx="5" fill="none" stroke="' + INK + '" stroke-width="4"/>' + T("الشغل", 0, 70, 17), at(u, 1.6, .4)); });
shot([19, 3], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("bag", u, 320, 410, 330, 586, 2, at(u, 0, .4)); });
// 20 · a kids' size, and a small one with a cap for your pocket (the pouch, the pink pocket brush)
shot(20, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("pouch", u, 320, 410, 330, 586, -2, at(u, 0, .4)) + G("", Z.chip(320, 740, "مقاس أطفال", OLIVE), at(u, .4, .3)); });
shot([20, 2], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + vid("pocket", u, 320, 410, 330, 586, 2, at(u, 0, .4)) + G("", Z.chip(320, 740, "بغطا للجيب", ORANGE), at(u, .3, .3)); });
// 21 · like any brush, change it every three months
shot(21, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + brand() + cals(at(u, 0, d * .8)) + arrow(110, 340, 530, 340, ORANGE, 4, at(u, .4, d * .6)) + G("translate(110 560)", Z.brushSide(0, 0, 330, { miswak: true, taper: true, h: 60 })) + G("", Z.chip(320, 700, "3 شهور", ORANGE), at(u, d * .7, .3)); });
// 22 · bottom line: the miswak idea, in a brush that reaches everywhere, with nothing to cut
var A22 = null; function arch22() { return A22 || (A22 = Z.arch(320, 200, 190, 290, {})); }
shot(22, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch22(), q = (t * .25) % 1, ang = 30 + 60 * Math.sin(t * .8); return paper() + a.svg + G('translate(' + f(200 + 120 * Math.sin(t * .8)) + ' ' + f(150 + 260 * q) + ') rotate(' + f(ang) + ')', Z.brushSide(0, 0, 220, { miswak: true, taper: true, h: 36, down: true })); });
shot([22, 3], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { var a = arch22(); return paper() + a.svg + check(a.back[-1][0], a.back[-1][1] + 70, .9, at(u, 0, .4), OLIVE) + check(a.back[1][0], a.back[1][1] + 70, .9, at(u, .3, .4), OLIVE) + check(320, 700, .9, at(u, .6, .4), OLIVE); });
shot([22, 4], still(FULL[0], FULL[1], FULL[2]), function (u, d, t) { return paper() + host("host-thumbs-up", 320, 775, 650, t) + G("", Z.scissors(520, 200, .9, .6, -40) + cross(520, 200, 1.1, at(u, .3, .5)), at(u, 0, .3)); });
// 23 · the oddest: the word سواك comes from ساك, «to rub»
shot(23, still(FULL[0], FULL[1], FULL[2]), function (u, d, t) {
  var w = 30 * Math.sin(t * 4);
  return paper() + appear(at(u, 0, .4), '<rect x="150" y="160" width="340" height="140" rx="10" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + T("سِواك", 320, 260, 76, INK, 800)) + arrow(320, 320, 320, 400, ORANGE, 5, at(u, .8, .5)) +
    G("", '<rect x="150" y="420" width="340" height="140" rx="10" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' + T("ساكَ = دَلَكَ", 320, 520, 60, ORANGE, 800), at(u, 1.2, .4)) + G('translate(' + f(w) + ' 0)', Z.stick(170, 680, 470, 640, 20, { fray: .8 }));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a drooping Arak branch, one twig ends in a frayed brush. line 1: older than your bathroom brush. line 2: the host, let down
  var s = "", k1 = li >= 1 ? ease((t - LN[1].start) / .4) : 0, k2 = li >= 2 ? ease((t - LN[2].start) / .4) : 0;
  if (li === 0) s += Z.branch([[700, 40], [560, 70], [450, 130], [370, 220], [330, 320]], { w: 10, leaf: 58, berries: true }) + Z.branch([[700, 280], [600, 280], [520, 310], [470, 370]], { w: 8, leaf: 48, ph: 2 }) +
    Z.stick(140, 540, 350, 360, 26, { fray: 1 }) + Z.line([[350, 360], [362, 342], [378, 310]], "#d6cbb0", 9);
  if (li === 1) s += G("", Z.line([[40, 430], [570, 430]], INK, 3) + Z.stick(430, 320, 580, 260, 22, { fray: .8 }) + T("آلاف السنين", 500, 500, 28, ORANGE, 800) + Z.brushSide(50, 320, 210, { col: "#7fb2d6" }) + T("فرشاتك", 140, 500, 28, INK, 800) + arrow(400, 560, 210, 560, INK, 3, k1), k1);
  if (li >= 2) s += G("", host("host-miswak-sad", 230, 650, 620, t) + Z.bin(500, 640, 1.1) + Z.stick(470, 560, 540, 530, 12, { dry: 1, fray: .6 }) + Z.calendar(500, 120, 1.2, "يومين"), k2);
  return s;
};
SCENE.bumper = function (u, t) { return Z.stick(30, 120, 170, 60, 18, { fray: 1 }); };
SCENE.outro = function (svg, u, t) {
  return G("translate(30 40) scale(.8)", Z.stick(20, 120, 260, 60, 22, { fray: 1 }) + G("translate(330 150)", Z.brushSide(0, 0, 330, { miswak: true, taper: true, h: 60 }))) +
    callout("1", 120, 40, ease(u / .3)) + callout("2", 210, 110, ease(u / .3 - .5)) + callout("3", 380, 70, ease(u / .3 - 1)) + callout("4", 470, 200, ease(u / .3 - 1.5));
};
