// ── «ليه شعرك فيه قشرة؟» — shots. Drawings in draw.js (DD.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (eased ~1.8 s) onto the part being
// talked about and back out. The life is inside the drawing: hairs sway, blood runs, yeast breathes, skin cells rise.
var Z = DD, ZC = DD.C;
var BX = 60, BY = 330, BW = 470;                         // the scalp block
var WB = [330, 420, 1.0], EP = [250, 330, 2.3], TOPV = [330, 250, 1.6];
var DARK = { shirt: "#343a48", shirtD: "#262b36", pants: "#4b5a6e", pantsD: "#38445a" }, FRIEND = { shirt: "#2f3a3a", shirtD: "#222b2b", pants: "#4b5a6e", pantsD: "#38445a" };
function brt(t, k) { return .5 + .5 * Math.sin(t * 1.7 + (k || 0)); }
function blink(t, k) { return Math.sin(t * 2.3 + (k || 0)) > .97 ? .08 : 1; }
// a man from the waist up (person kit). o.flakes 0..1 specks on his shoulders and hair; o.scratch: hand scratching his hair;
// o.fall: specks drifting down while he scratches
function man(cx, hipY, s, t, o) {
  o = o || {}; var face = Object.assign({ eyes: blink(t, cx) }, o.face || {});
  var base = { x: cx, y: hipY, s: s, outfit: { base: "casual", colors: o.colors || DARK }, breath: brt(t, cx), face: face, head: Object.assign({ tilt: 2 * Math.sin(t * .9 + cx) }, o.head || {}),
    arms: [{ rel: [-12, 70], hand: "relaxed" }, { rel: [12, 70], hand: "relaxed" }] };
  var p = PERSON.front(base), h = p.joints.head;
  if (o.scratch) { var sc = 6 * Math.sin(t * 14); base.arms = [{ rel: [-12, 70], hand: "relaxed" }, { to: [h[0] + (14 + sc * .5) * s, h[1] - (30 + Math.abs(sc) * .3) * s], bend: 1, hand: "open", rot: -150 }]; p = PERSON.front(base); }
  var g = p.svg, k = o.flakes || 0;
  if (k > 0) {
    var sh = p.joints.sh, n = Math.round(26 * k);
    for (var i = 0; i < n; i++) { var side = i % 2 ? sh[1] : sh[0], dir = i % 2 ? 1 : -1; g += Z.speck(side[0] - dir * (Z.rnd(i) * 40 * s) + dir * 6 * s, side[1] - 4 * s + Z.rnd(i + 9) * 26 * s, 2.2 * s * (.6 + Z.rnd(i + 3) * .6), i); }
    for (var j = 0; j < Math.round(14 * k); j++) g += Z.speck(h[0] + (Z.rnd(j + 30) - .5) * 44 * s, h[1] - 30 * s + Z.rnd(j + 40) * 14 * s, 1.5 * s, j + 50);
  }
  if (o.fall) for (var q = 0; q < 10; q++) { var u = (t * .55 + q / 10) % 1, x0 = h[0] + (Z.rnd(q + 70) - .3) * 60 * s; g += Z.speck(x0 + Math.sin(u * 9 + q) * 8, h[1] - 10 * s + u * 140 * s, 1.8 * s, q + 90); }
  return { svg: g, head: h, sh: p.joints.sh };
}
function block(o) { return Z.scalpBlock(BX, BY, BW, o || {}).svg; }
function chip(txt, x, y, col, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .9) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '"/>' + T(txt, 0, sz * .4, sz, "#fbf8f1", 800)); }
function Q(x, y, k, sz) { return G("", T("؟", x, y, sz || 140, ORANGE, 800), clamp(k == null ? 1 : k)); }
var EPI = function (t, fast, k) { return Z.epiStack(110, 230, 420, 470, { phase: t * (fast ? 1.1 : .55), fast: fast }); };
function lensYeast(t, o) { return Z.lens(320, 380, 230, Z.surface(320, 380, 230, o || { yeast: 1, oil: .6 }), 40); }
// a dust cloud (dirt) for «مش وساخة»
function dirt(x, y) { return G('translate(' + x + ' ' + y + ') scale(2.2) translate(' + (-x) + ' ' + (-y) + ')', dirt1(x, y)); }
function dirt1(x, y) { var g = ""; for (var i = 0; i < 7; i++) g += Z.ball(x + Math.cos(i) * 34, y + Math.sin(i * 1.7) * 18, 22 + Z.rnd(i) * 8, "#9a8c76", "#6d6252", "#c4b8a2", 1.6, false); return g + T("وساخة", x, y + 66, 16, INK, 800); }
// the analogy: a table with plates left full of crumbs
function plates(t) {
  var g = Z.poly([[-120, 10], [120, 10], [150, 50], [-150, 50]], "#c9a27a", 2.2) + '<rect x="-150" y="50" width="300" height="12" fill="#a27c56" stroke="' + INK + '" stroke-width="2"/>';
  [[-70, 22], [55, 26]].forEach(function (p, i) { g += Z.ell(p[0], p[1], 46, 14, "#f6f2ea", 2) + Z.ell(p[0], p[1], 30, 8, "#e8e1d2", 1.2) + Z.bits(p[0], p[1] - 1, 7, 20, i * 9 + 3) + Z.ell(p[0] + 12, p[1] - 3, 8, 3, "#b98a22", 0); });
  return g + Z.line([[100, 0], [130, -30]], "#8f8576", 3) + Z.line([[108, 4], [140, -22]], "#8f8576", 3);
}
// the phone with the profile and the link in the bio (mid-video ask)
function phone(t, k) {
  var g = '<rect x="190" y="120" width="260" height="520" rx="34" fill="#2f3138" stroke="' + INK + '" stroke-width="2.6"/><rect x="204" y="150" width="232" height="460" rx="14" fill="#fbf8f1"/>';
  g += Z.ball(320, 225, 44, "#e8b49a", "#cf9478", "#f3cdb8", 2, false) + T("إيه الحكاية؟", 320, 300, 22, INK, 800);
  g += '<rect x="240" y="320" width="160" height="8" rx="4" fill="#cfc6b2"/><rect x="255" y="338" width="130" height="8" rx="4" fill="#cfc6b2"/>';
  var p = 1 + .06 * Math.sin(t * 5); g += G('translate(320 385) scale(' + f(p) + ')', '<rect x="-86" y="-22" width="172" height="44" rx="22" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + T("اللينك 🔗", 0, 8, 20, "#fbf8f1", 800));
  for (var i = 0; i < 6; i++) g += '<rect x="' + (218 + (i % 3) * 70) + '" y="' + (440 + Math.floor(i / 3) * 80) + '" width="64" height="74" fill="#d8ccae" stroke="' + INK + '" stroke-width="1.2"/>';
  if (k > 0) { var ty = lerp(560, 400, ease(k)); g += PERSON.hand([360, ty + 70], -1.9, "point", 1, 2.2, PERSON.colors); if (k > .9) g += '<circle cx="330" cy="388" r="' + f(20 + 30 * ((t * 1.5) % 1)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f(1 - (t * 1.5) % 1) + '"/>'; }
  return g;
}
function doctor(t, x, y, s) { return PERSON.front({ x: x, y: y, s: s, outfit: "doctor", breath: brt(t), face: { mouth: "smile", eyes: blink(t, 3) }, head: { tilt: 2 * Math.sin(t) }, arms: [{ rel: [-12, 70], hand: "relaxed" }, { rel: [12, 70], hand: "relaxed" }] }).svg; }
function gear(x, y, r) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2, rr = i % 2 ? r : r * 1.25; d += (i ? "L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + 'Z" fill="#c6c6c0" stroke="' + INK + '" stroke-width="2"/>' + Z.circ(x, y, r * .4, PAPER, 2); }

// 4 · «طب القشرة دي إيه أصلاً؟» — one flake, big, turning slowly, and a question mark
shot(4, still(320, 393, 1), function (u, d, t) { return paper() + Z.flake(300, 420, 2.2, -8 + 4 * Math.sin(t * .8), { seed: 4, curl: true, cells: false }) + Q(520, 230, at(u, .2, .3)); });
// 5 · not dirt; pieces of your own scalp skin
shot(5, still(320, 393, 1), function (u, d, t) { return paper() + dirt(320, 380) + cross(320, 380, 1.6, at(u, .4, .5)); });
shot([5, 1], still(320, 393, 1), function (u, d, t) { var k = at(u, 0, 1.2); return paper() + Z.flake(320, 400, 2.2, -8 + 4 * Math.sin(t * .8), { seed: 4, curl: true, cells: k > .05 }) + (k > .05 ? "" : ""); });
shot([5, 2], fly([320, 393, 1], [320, 400, 1.5], 1.8), function (u, d, t) { return paper() + Z.flake(320, 400, 2.2, -8 + 4 * Math.sin(t * .8), { seed: 4, curl: true }) + label(320, 400, 470, 250, "جلد راسك", ORANGE, at(u, .4, .5), 22); });
// 6 · the scalp renews all the time: the block, then the cells rising
shot(6, still(WB[0], WB[1], WB[2]), function (u, d, t) { return paper() + appear(at(u, 0, .6), block({})); });
shot([6, 1], still(320, 420, 1), function (u, d, t) { return paper() + EPI(t) + tag("جديد", 320, 690, at(u, .1, .3), 22, OLIVE) + arrow(560, 660, 560, 300, OLIVE, 4, at(u, .2, .6)); });
shot([6, 2], still(320, 420, 1), function (u, d, t) { return paper() + EPI(t) + tag("قديم", 320, 140, at(u, 0, .3), 22, INK) + arrow(560, 660, 560, 300, OLIVE, 4, 1); });
// 7 · normally they fall one by one, too small to see
shot(7, fly([320, 420, 1], [320, 300, 1.7], 1.8), function (u, d, t) { return paper() + EPI(t); });
shot([7, 1], still(320, 300, 1.7), function (u, d, t) { return paper() + EPI(t) + tag("خلية خلية", 320, 150, at(u, .1, .3), 20, BLUE); });
// 8 · so why big pieces on you? — the man with flakes on his shoulders
shot(8, still(320, 393, 1), function (u, d, t) { return paper() + man(320, 900, 2.1, t, { flakes: 1, face: { brows: "worried", mouth: "frown" } }).svg + Q(520, 200, at(u, .2, .3)); });
shot([8, 1], fly([320, 393, 1], [210, 470, 1.9], 1.8), function (u, d, t) { return paper() + man(320, 900, 2.1, t, { flakes: 1, face: { brows: "worried", mouth: "frown" } }).svg + Q(520, 200, 1); });
// 9 · a tiny yeast, Malassezia, on almost everyone's head, even your friend's
shot(9, still(WB[0], WB[1], WB[2]), function (u, d, t) { return paper() + block({ yeast: at(u, .2, 1.2) }); });
shot([9, 1], still(320, 393, 1), function (u, d, t) { return paper() + lensYeast(t, { yeast: at(u, 0, .8), oil: .6 }) + tag("مالاسيزيا", 320, 680, at(u, .3, .3), 24, OLIVE); });
shot([9, 2], still(320, 393, 1), function (u, d, t) {
  var a = man(170, 820, 1.55, t, { face: { mouth: "neutral" } }), b = man(470, 820, 1.55, t, { colors: FRIEND, face: { mouth: "smile" } });
  return paper() + a.svg + b.svg + Z.lens(170, 260, 90, Z.surface(170, 260, 90, { yeast: 1 }), 130) + Z.lens(470, 260, 90, Z.surface(470, 260, 90, { yeast: 1 }), 50);
});
shot([9, 3], still(470, 330, 1.5), function (u, d, t) {
  var a = man(170, 820, 1.55, t, { face: { mouth: "neutral" } }), b = man(470, 820, 1.55, t, { colors: FRIEND, face: { mouth: "smile" } });
  return paper() + a.svg + b.svg + Z.lens(170, 260, 90, Z.surface(170, 260, 90, { yeast: 1 }), 130) + Z.lens(470, 260, 90, Z.surface(470, 260, 90, { yeast: 1 }), 50) + check(560, 170, .8, at(u, .2, .4), OLIVE);
});
// 10 · it eats the oil the scalp makes, and leaves leftovers behind
function eatScene(u, t, bitsK) {
  var e = (t * .45) % 1, k = clamp(bitsK);
  return paper() + Z.surface(320, 393, 420, {}) + '<rect x="-200" y="-200" width="1040" height="1200" fill="#eee5d0" opacity=".35"/>' +
    Z.oil(lerp(150, 300, ease(e)), 380, 30 * (1 - .6 * e)) + Z.yeast(360, 390, 72, -25, { bud: .7 + .1 * e }) + Z.oil(120, 250, 24) + Z.oil(90, 520, 20) + (k > 0 ? Z.bits(480, 520, Math.round(16 * k), 70, 7) : "");
}
shot(10, still(320, 393, 1), function (u, d, t) { return eatScene(u, t, 0) + tag("دهون", 150, 300, at(u, .2, .3), 22, "#b98a22"); });
shot([10, 1], fly([320, 393, 1], [290, 400, 1.5], 1.8), function (u, d, t) { return eatScene(u, t, 0); });
shot([10, 2], fly([290, 400, 1.5], [320, 393, 1], 1.8), function (u, d, t) { return eatScene(u, t, at(u, .3, 1.2)) + tag("بواقي", 480, 640, at(u, .8, .3), 24, ORANGE); });
// 11 · like a guest who eats at your place and leaves the plates on the table
shot(11, still(320, 393, 1), function (u, d, t) { return eatScene(u, t, 1) + iconBox(470, 160, 260, G("translate(0 10)", plates(t)), at(u, .1, .3)); });
shot([11, 1], fly([320, 393, 1], [470, 170, 2.2], 1.8), function (u, d, t) { return eatScene(u, t, 1) + iconBox(470, 160, 260, G("translate(0 10)", plates(t)), 1); });
// 12 · mid-video ask: the link in the bio
shot(12, still(320, 393, 1), function (u, d, t) { return paper() + phone(t, 0); });
shot([12, 1], still(320, 393, 1), function (u, d, t) { return paper() + phone(t, at(u, 0, .8)); });
shot([12, 3], fly([320, 393, 1], [320, 393, 1.25], 1.8), function (u, d, t) { return paper() + phone(t, 1); });
// 13 · so why him not, and you yes?
function twoMen(t, flakes, o) { o = o || {}; var a = man(190, 900, 1.8, t, { flakes: flakes, scratch: o.scratch, fall: o.fall, face: { brows: "worried", mouth: "frown", look: [.3, 0] }, head: { tilt: -6 } }), b = man(470, 900, 1.8, t, { colors: FRIEND, face: { mouth: "smile", look: [-.4, 0] }, head: { tilt: 4 } }); return a.svg + b.svg; }
shot(13, still(320, 393, 1), function (u, d, t) { return paper() + twoMen(t, 1, { scratch: true, fall: true }) + Q(330, 170, at(u, .1, .3), 110); });
// 14 · many scalps don't mind the leftovers
var CA = 30, CB = 340;
function calm(t, k) { return Z.scalpBlock(CA, 470, 230, { back: 2, cut: false }).svg; }
function sens(irr, fl) { return Z.scalpBlock(CB, 470, 230, { back: 2, cut: false, irritated: irr, flakes: fl }).svg; }
shot(14, still(320, 393, 1), function (u, d, t) { return paper() + calm(t) + dim(.6, sens(0, 0)) + chip("عادية", 125, 712, "#4f8a7a", at(u, .3, .3)); });
shot([14, 1], fly([320, 393, 1], [180, 420, 1.7], 1.8), function (u, d, t) { return paper() + calm(t) + dim(.6, sens(0, 0)) + chip("عادية", 125, 712, "#4f8a7a", 1) + check(170, 300, .9, at(u, 1.2, .4), "#4f8a7a"); });
// 15 · but if your scalp is sensitive, the leftovers irritate it
shot(15, fly([180, 420, 1.7], [320, 393, 1], 1.8), function (u, d, t) { var k = at(u, .6, 1.4); return paper() + calm(t) + sens(k * (.85 + .15 * Math.sin(t * 4)), 0) + chip("عادية", 125, 712, "#4f8a7a", 1) + chip("حساسة", 455, 712, RED_(), at(u, .8, .3)); });
shot([15, 1], still(455, 420, 1.7), function (u, d, t) { return paper() + calm(t) + sens(.85 + .15 * Math.sin(t * 4), 0) + chip("حساسة", 455, 712, RED_(), 1) + Z.bits(440, 380, 12, 60, 3); });
function sensC(irr, fl) { return Z.scalpBlock(190, 470, 230, { back: 2, cut: false, irritated: irr, flakes: fl }).svg; }
function RED_() { return ZC.RED; }
// 16 · irritated skin renews faster, about twice as fast
function twoStacks(t, lab) {
  return Z.epiStack(40, 250, 260, 440, { phase: t * .55 }) + Z.epiStack(340, 250, 260, 440, { phase: t * 1.1, fast: true }) +
    chip("عادي", 170, 200, "#4f8a7a", lab) + chip("متهيّج", 470, 200, RED_(), lab);
}
shot(16, still(320, 420, 1), function (u, d, t) { return paper() + twoStacks(t, at(u, 0, .3)); });
shot([16, 1], still(320, 420, 1), function (u, d, t) { return paper() + twoStacks(t, 1) + bigNum("×2", "", 470, 120, at(u, .1, .4), ORANGE, 64); });
// 17 · the cells reach the top before they separate; they fall stuck together, thousands in one piece
shot(17, still(320, 420, 1), function (u, d, t) { return paper() + EPI(t, true); });
shot([17, 2], fly([320, 420, 1], [320, 250, 1.5], 1.8), function (u, d, t) { return paper() + EPI(t, true) + tag("لازقة", 320, 100, at(u, 1.2, .3), 22, ORANGE); });
shot([17, 3], still(320, 400, 1), function (u, d, t) { return paper() + Z.flake(320, 400, 2.3, -8 + 4 * Math.sin(t * .8), { seed: 4, curl: true }) + bigNum(count(1000, at(u, 0, 1)) + "+", "خلية في الحتة", 320, 160, 1, ORANGE, 56); });
// 18 · can anything prevent it? — the shampoo, a question mark
shot(18, still(320, 393, 1), function (u, d, t) { return paper() + Z.bottle(260, 650, 1.6 + .02 * Math.sin(t * 2), "#4f8a7a") + Q(500, 260, at(u, .2, .3)); });
// 19 · nothing removes it for ever, but you can calm it
shot(19, still(320, 393, 1), function (u, d, t) { return paper() + sensC(.9 + .1 * Math.sin(t * 4), .8) + chip("للأبد", 320, 200, INK, at(u, .1, .3)) + cross(320, 200, 1, at(u, .5, .5)); });
shot([19, 1], fly([320, 393, 1], [310, 420, 1.7], 1.8), function (u, d, t) { var k = at(u, .4, 2); return paper() + sensC(.95 * (1 - k), .8 * (1 - k)) + chip("بتهدى", 305, 712, "#4f8a7a", at(u, 1.6, .3)); });
// 20 · the shampoo with ketoconazole, zinc pyrithione or selenium lowers the yeast
var ING = ["كيتوكونازول", "زنك بيريثيون", "سيلينيوم"];
function ingr(u, n) { var g = ""; for (var i = 0; i < n; i++) g += chip(ING[i], 450, 220 + i * 90, BLUE, i === n - 1 ? at(u, 0, .3) : 1, 20); return g; }
shot(20, still(320, 393, 1), function (u, d, t) { return paper() + Z.bottle(170, 640, 1.5, "#4f8a7a"); });
shot([20, 1], still(320, 393, 1), function (u, d, t) { return paper() + Z.bottle(170, 640, 1.5, "#4f8a7a") + ingr(u, 1); });
shot([20, 2], still(320, 393, 1), function (u, d, t) { return paper() + Z.bottle(170, 640, 1.5, "#4f8a7a") + ingr(u, 2); });
shot([20, 3], still(320, 393, 1), function (u, d, t) { return paper() + Z.bottle(170, 640, 1.5, "#4f8a7a") + ingr(u, 3); });
shot([20, 4], still(320, 393, 1), function (u, d, t) { var k = at(u, .1, 1.5); return paper() + lensYeast(t, { yeast: 1 - k, oil: .6 }) + tag("أقل", 320, 680, at(u, .8, .3), 24, OLIVE); });
// 21 · less yeast, fewer leftovers, the skin slows back down
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + lensYeast(t, { yeast: .2, oil: .6, bits: 1 - at(u, 0, 1.2) }); });
shot([21, 2], still(320, 420, 1), function (u, d, t) { return paper() + Z.epiStack(110, 230, 420, 470, { phase: t * .45 }) + chip("على مهله", 320, 160, "#4f8a7a", at(u, .1, .3)); });
// 22 · leave it 3 to 5 minutes before rinsing
function foamHead(t) { var m = man(200, 960, 1.9, t, { face: { mouth: "smile", eyes: blink(t) } }), h = m.head, g = m.svg; for (var i = 0; i < 16; i++) g += Z.ball(h[0] + (Z.rnd(i) - .5) * 110, h[1] - 50 + (Z.rnd(i + 5) - .5) * 40 + 3 * Math.sin(t * 2 + i), 14 + Z.rnd(i + 2) * 10, "#fbf8f1", "#c9d6dc", "#ffffff", 1.4, false); return g; }
shot(22, still(320, 393, 1), function (u, d, t) { return paper() + foamHead(t); });
shot([22, 1], still(320, 393, 1), function (u, d, t) { return paper() + foamHead(t) + Z.timer(480, 230, 90, 3 + 2 * clamp(u / Math.max(1, d + 2)), at(u, 0, .5)); });
shot([22, 2], fly([320, 393, 1], [460, 260, 1.6], 1.8), function (u, d, t) { return paper() + foamHead(t) + Z.timer(480, 230, 90, 4 + .9 * clamp(u / 3), 1); });
// 23 · many think dandruff is a dry scalp, so they rub oil in. No.
shot(23, still(320, 393, 1), function (u, d, t) { return paper() + twoMen(t, 1, {}); });
shot([23, 2], still(WB[0], WB[1], WB[2]), function (u, d, t) { var k = at(u, 0, 1.5); return paper() + block({ oil: k }) + G('translate(430 120) rotate(' + f(-50 * at(u, 0, .6)) + ')', Z.oilBottle(0, 0, .6)); });
shot([23, 3], still(WB[0], WB[1], WB[2]), function (u, d, t) { return paper() + block({ oil: 1 }) + G('translate(430 120) rotate(-50)', Z.oilBottle(0, 0, .6)) + cross(430, 60, 1.4, at(u, 0, .5)); });
// 24 · that oil is food for the yeast
shot(24, still(320, 393, 1), function (u, d, t) { var k = at(u, 0, 1.5); return paper() + lensYeast(t, { yeast: 1, oil: 1 }) + tag("أكل للخميرة", 320, 680, at(u, .4, .3), 22, ORANGE); });
shot([24, 1], fly([320, 393, 1], [300, 380, 1.8], 1.8), function (u, d, t) { return paper() + lensYeast(t, { yeast: 1, oil: 1 }); });
// 25 · strong redness, on the eyebrows, no better after a month: see a dermatologist
var WARN = ["احمرار", "الحواجب", "شهر"];
function warn(u, n) { var g = ""; for (var i = 0; i < n; i++) g += chip(WARN[i], 170, 220 + i * 90, ORANGE, i === n - 1 ? at(u, 0, .3) : 1, 22); return g; }
shot(25, still(320, 393, 1), function (u, d, t) { return paper() + G('translate(60 0)', sensC(.95 + .05 * Math.sin(t * 4), .5)) + warn(u, 1); });
shot([25, 1], still(320, 393, 1), function (u, d, t) { return paper() + man(420, 980, 2.0, t, { face: { brows: "worried", mouth: "frown" } }).svg + warn(u, 2); });
shot([25, 2], still(320, 393, 1), function (u, d, t) { return paper() + man(420, 980, 2.0, t, { face: { brows: "worried", mouth: "frown" } }).svg + warn(u, 3) + iconBox(170, 520, 120, '<rect x="-36" y="-30" width="72" height="64" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/><rect x="-36" y="-30" width="72" height="16" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' + T("30", 0, 22, 22, INK, 800), at(u, .2, .3)); });
shot([25, 3], still(320, 393, 1), function (u, d, t) { return paper() + doctor(t, 400, 1000, 2.0) + chip("دكتور جلدية", 200, 200, OLIVE, at(u, .1, .3)); });
// 26 · bottom line: yeast eats oil, leaves leftovers, irritates the skin, it flakes early
function recap(u, n, t) {
  var g = "", cx = [170, 470, 170, 470], cy = [210, 210, 520, 520];
  var art = [function () { return Z.yeast(0, 0, 46, -25, { bud: .7 }); }, function () { return Z.oil(-40, 0, 26) + Z.bits(40, 10, 12, 34, 5); },
    function () { return Z.scalpBlock(-100, 20, 170, { back: 1, cut: false, irritated: .9 + .1 * Math.sin(t * 4) }).svg; }, function () { return Z.flake(0, 0, 1.05, -8 + 4 * Math.sin(t), { seed: 4, curl: true }); }];
  for (var i = 0; i < n; i++) { var k = i === n - 1 ? at(u, 0, .4) : 1; g += appear(k, G('translate(' + cx[i] + ' ' + cy[i] + ')', art[i]())) + callout(String(i + 1), cx[i] - 110, cy[i] - 110, k, 20); if (i) g += arrow(i === 2 ? 400 : cx[i - 1] + 90, i === 2 ? 300 : cy[i - 1], i === 2 ? 240 : cx[i] - 90, i === 2 ? 420 : cy[i], ORANGE, 3, k); }
  return g;
}
shot(26, still(320, 393, 1), function (u, d, t) { return paper() + recap(u, 1, t); });
shot([26, 2], still(320, 393, 1), function (u, d, t) { return paper() + recap(u, 2, t); });
shot([26, 3], still(320, 393, 1), function (u, d, t) { return paper() + recap(u, 3, t); });
shot([26, 4], still(320, 393, 1), function (u, d, t) { return paper() + recap(u, 4, t); });
// 27 · the oddest: it can't make fat for itself, so its only food is what's on your head
shot(27, still(320, 393, 1), function (u, d, t) { return paper() + Z.yeast(320, 420, 110, -25, { bud: .75 }); });
shot([27, 1], still(320, 393, 1), function (u, d, t) { return paper() + Z.yeast(250, 460, 110, -25, { bud: .75 }) + iconBox(480, 200, 170, gear(0, -6, 34) + Z.oil(0, -6, 14) + T("دهون", 0, 66, 18, INK, 800), at(u, .1, .3)) + cross(480, 200, 1.2, at(u, .6, .5)); });
shot([27, 3], still(320, 393, 1), function (u, d, t) { return paper() + Z.surface(320, 393, 420, { oil: 1 }) + '<rect x="-200" y="-200" width="1040" height="1200" fill="#eee5d0" opacity=".3"/>' + Z.yeast(330, 380, 90, -25, { bud: .75, eat: (t * .5) % 1 }) + tag("راسك", 320, 690, at(u, .4, .3), 26, OLIVE); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: he scratches, specks fall on his black T-shirt. line 1: the specks on the shoulders, ringed. line 2: his friend beside him, clean
  if (li < 2) { var m = man(304, 760, 2.25, t, { flakes: li >= 1 ? 1 : clamp(t / 2), scratch: li === 0, fall: li === 0, face: { brows: "worried", mouth: li ? "o" : "frown", eyes: li ? 1.2 : blink(t) } });
    var s = m.svg; if (li >= 1) s += inset(130, 120, 90, '<g transform="translate(' + f(-m.sh[0][0] - 20) + ' ' + f(-m.sh[0][1] - 4) + ')">' + man(304, 760, 2.25, t, { flakes: 1, face: { mouth: "o" } }).svg + '</g>', ease((t - LN[1].start) / .3)); return s; }
  return '<g transform="translate(-16 -180) scale(.95)">' + twoMen(t, 1, {}) + '</g>';
};
SCENE.bumper = function (u, t) { return Z.flake(90, 110, .9, -8 + 6 * Math.sin(t * 1.2), { seed: 4, curl: true }); };
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(40 -30) scale(.55)">' + Z.scalpBlock(60, 330, 470, { back: 2, irritated: .6, flakes: 1, oil: 1, yeast: 1 }).svg + '</g>' +
    callout("1", 160, 90, ease(u / .3)) + callout("2", 120, 150, ease(u / .3 - .5)) + callout("3", 230, 120, ease(u / .3 - 1)) + callout("4", 300, 60, ease(u / .3 - 1.5)) +
    G('translate(470 150)', Z.yeast(0, 0, 50, -25, { bud: .7 }));
};
