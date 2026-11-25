// ── «إزاي الليزر بيشيل الشعر؟» — shots. Drawings in draw.js (LZ.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move (user's rule): the frame holds dead still on one drawing for several lines, then flies
// (eased, ~1.8 s) in onto the part being talked about and later back out. The life between moves is in the drawing:
// the light pulses, heat runs, melanin glows, hairs move.
var FX = [.14, .38, .62, .86], BX = 40, BY = 330, BW = 540;           // the skin block and its follicles
var W = [320, 470, 1.0], F = [228, 470, 1.75], B = [200, 572, 2.7], S = [262, 330, 1.9];
var WOMAN = { hair: "long", fem: true }, WCOL = Object.assign({}, PERSON.colors, { hair: "#3b2519", hairL: "#7a5238", lip: "#b8545c" });
function pulse(t) { return Math.max(0, 1 - ((t * 1.4) % 1) * 2.6); }                       // a flash every 0.7 s
function face(x, y, sz, fc, k) {   // the woman's face in a framed box (iconBox look)
  return iconBox(x, y, sz, '<clipPath id="fc' + (++CLIPN) + '"><rect x="' + f(-sz / 2 + 3) + '" y="' + f(-sz / 2 + 3) + '" width="' + f(sz - 6) + '" height="' + f(sz - 6) + '"/></clipPath><g clip-path="url(#fc' + CLIPN + ')">' +
    PERSON.head([0, sz * .1], sz / 80, 0, { face: fc, _of: WOMAN }, WCOL) + '</g>', k);
}
function block(fol, o) { return LZ.skinBlock(BX, BY, BW, fol, o).svg; }
function laser(x, y, t, on, L, col) { var p = on ? pulse(t) : 0; return LZ.beam(x, y, L || 300, on ? (.35 + .65 * p) : 0, col) + LZ.handpiece(x, y, .8, p); }
function fols(o1, o0) { return FX.map(function (x, i) { return Object.assign({ x: x }, o0 || {}, i === 1 ? o1 || {} : {}); }); }
function cal(x, y, txt, k) { return iconBox(x, y, 130, '<rect x="-40" y="-34" width="80" height="70" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="-34" width="80" height="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' +
  '<path d="M-24 -42 V-28 M24 -42 V-28" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' + T(txt, 0, 20, txt.length > 6 ? 15 : 19, INK, 800), k); }
function chip(txt, x, y, col, k) { k = pop(k); if (k <= 0) return ""; var w = txt.length * 15 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="-20" width="' + w + '" height="40" rx="8" fill="' + col + '"/>' + T(txt, 0, 9, 22, "#fbf8f1", 800)); }

// 4 · «طب الليزر بيعمل إيه أصلاً؟» — the leg under the handpiece, a big question mark
shot(4, still(320, 393, 1), function (u, d, t) {
  return paper() + LZ.leg(38, 470, .97, {}) + laser(250, 438, t, true, 0) + T("؟", 500, 300, 150, ORANGE, 800);
});
// 5 · the device sends a pulse of light — into the cut-open skin
shot(5, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, u > .3, 300 * at(u, .3, .5)); });
shot([5, 2], still(W[0], W[1], W[2]), function (u, d, t) {   // shorter than a blink: an eye that blinks beside the flash
  var bl = Math.abs(Math.sin(t * 2.2)), eye = '<path d="M-44 0 Q0 ' + f(-34 * bl) + ' 44 0 Q0 ' + f(34 * bl) + ' -44 0 Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="3"/>' + (bl > .3 ? '<circle r="' + f(14 * bl) + '" fill="#4a3426"/>' : "") + T("رمشة عين", 0, 66, 20, INK, 800);
  return paper() + block(fols()) + laser(262, 300, t, true, 300) + iconBox(510, 130, 150, eye, at(u, .1, .3));
});
// 6 · the light passes the skin… and looks for one colour: the dark pigment in the hair, melanin
shot(6, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, true, 300 * at(u, 0, 1)); });
shot([6, 2], fly(W, F, 1.8), function (u, d, t) { return paper() + block(fols()) + laser(262, 300, t, true, 300); });
shot([6, 3], still(F[0], F[1], F[2]), function (u, d, t) {
  var k = at(u, .1, 1.2); return paper() + block(fols({ mel: k }), {}) + laser(262, 300, t, true, 300) + (u > 1.4 ? label(214, 470, 330, 420, "الميلانين", ORANGE, at(u, 1.4, .5), 15) : "");
});
// 7 · melanin drinks the light and turns it into heat
shot(7, still(F[0], F[1], F[2]), function (u, d, t) { return paper() + block(fols({ mel: 1 })) + laser(262, 300, t, true, 300) + label(214, 470, 330, 420, "الميلانين", ORANGE, 1, 15); });
shot([7, 1], still(F[0], F[1], F[2]), function (u, d, t) {
  var k = at(u, 0, 1.2) * .35; return paper() + block(fols({ mel: 1, k: k + .04 * Math.sin(t * 6) })) + laser(262, 300, t, true, 300) + label(262, 360, 340, 400, "حرارة", ORANGE, at(u, .4, .4), 16);
});
// 8 · like a black blouse in the sun: it heats faster than the white one
function blouse(x, y, col) { return LZ.shape([[x - 70, y], [x - 34, y - 14], [x - 16, y - 4], [x + 16, y - 4], [x + 34, y - 14], [x + 70, y], [x + 96, y + 56], [x + 66, y + 70], [x + 54, y + 44], [x + 56, y + 170], [x - 56, y + 170], [x - 54, y + 44], [x - 66, y + 70], [x - 96, y + 56]], col, 2.4) + LZ.line([[x - 16, y - 4], [x, y + 12], [x + 16, y - 4]], INK, 2); }
function thermo(x, y, k) { return '<rect x="' + (x - 9) + '" y="' + y + '" width="18" height="120" rx="9" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + (y + 128) + '" r="15" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><rect x="' + (x - 4) + '" y="' + f(y + 120 - 110 * k) + '" width="8" height="' + f(110 * k + 10) + '" fill="' + ORANGE + '"/>'; }
function heatUp(x, y, t, n) {   // heat squiggles rising from the black blouse, all the time
  var L = window.LIFE || 1, s = ""; for (var i = 0; i < 4 * L; i++) { var u = (t * .7 + i / (4 * L)) % 1, xx = x - 60 + (i % 5) * 30, yy = y - u * 110; s += G("", '<path d="M' + f(xx) + ' ' + f(yy) + ' q8 -10 0 -20 t0 -20" stroke="' + ORANGE + '" stroke-width="' + f(3 + L) + '" fill="none" stroke-linecap="round"/>', 1 - u); } return s; }
function sunAt(t) { var s = '<circle cx="320" cy="150" r="46" fill="#e9b949" stroke="' + INK + '" stroke-width="2.4"/>'; for (var r = 0; r < 12; r++) { var a = r * Math.PI / 6 + t * .4 * (window.LIFE || 1); s += LZ.line([[320 + Math.cos(a) * 62, 150 + Math.sin(a) * 62], [320 + Math.cos(a) * 82, 150 + Math.sin(a) * 82]], "#c9962a", 4); } return s; }
shot(8, still(320, 393, 1), function (u, d, t) {
  var k = at(u, .3, d + 1.5);
  return paper() + sunAt(t) + blouse(180, 300, "#2f2a28") + blouse(460, 300, "#f6f2ea") + heatUp(180, 290, t) + thermo(150, 520, .2 + .65 * k) + thermo(430, 520, .2 + .1 * k);
});
shot([8, 1], still(320, 393, 1), function (u, d, t) {
  return paper() + sunAt(t) + blouse(180, 300, "#2f2a28") + blouse(460, 300, "#f6f2ea") + heatUp(180, 290, t) + thermo(150, 520, .85) + thermo(430, 520, .3) + G("", T("بتسخن أسرع", 180, 720, 30, ORANGE, 800), at(u, .1, .3)) +
    wave(120, 270, 240, 270, t, ORANGE, 4, 12, at(u, .2, .4), 2);
});
// 9 · the heat runs down inside the hair… to the bulb
shot(9, still(F[0], F[1], F[2]), function (u, d, t) { return paper() + block(fols({ mel: 1, k: .35 + .45 * at(u, 0, d) })) + laser(262, 300, t, true, 300); });
shot([9, 2], fly(F, B, 1.8), function (u, d, t) { return paper() + block(fols({ mel: 1, k: .8 + .2 * at(u, 0, 1.2) + .03 * Math.sin(t * 6) })); });
// 10 · the bulb is the factory, a few millimetres under the skin; it makes the hair
shot(10, still(B[0], B[1], B[2]), function (u, d, t) { return paper() + block(fols({ k: .96 + .04 * Math.sin(t * 5) })) + tag("المصنع", 200, 520, at(u, .3, .3), 16, OLIVE); });
shot([10, 1], fly(B, [215, 470, 1.5], 1.8), function (u, d, t) {
  return paper() + block(fols({ k: .96 + .04 * Math.sin(t * 5) })) + tag("المصنع", 200, 520, 1, 16, OLIVE) + measure(300, 330, 300, 590, at(u, .5, .8), "") + G("", T("كام مللي", 360, 470, 20, ORANGE, 800), at(u, 1.1, .3));
});
shot([10, 3], still(215, 470, 1.5), function (u, d, t) {   // it makes the hair: the shaft grows a little out of the bulb
  return paper() + block(fols({ out: 60 + 14 * at(u, 0, d) })) + tag("المصنع", 200, 520, 1, 16, OLIVE) + arrow(170, 560, 170, 440, OLIVE, 4, at(u, .2, .5));
});
// 11 · the heat harms the factory's cells: it weakens and can hardly make a new hair
shot(11, fly([215, 470, 1.5], B, 1.8), function (u, d, t) { return paper() + block(fols({ k: 1, dmg: at(u, .6, d) })); });
shot([11, 2], still(B[0], B[1], B[2]), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + tag("ضعيف", 200, 520, at(u, .1, .3), 16, ORANGE) + cross(250, 540, .55, at(u, .8, .5)); });
// 12 · so why doesn't the hair fall at once?
shot(12, fly(B, W, 1.8), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + G("", T("؟", 520, 230, 120, ORANGE, 800), at(u, 1.2, .3)); });
// 13 · the hair is still in place; the skin needs time to push it out
shot(13, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + block(fols({ dmg: 1 })) + T("؟", 520, 230, 120, ORANGE, 800) + label(240, 380, 120, 230, "لسه مكانها", INK, at(u, .2, .5), 16); });
shot([13, 2], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ dmg: 1, shed: .9 * at(u, .2, d + 1.4) })) + arrow(300, 300, 330, 200, ORANGE, 5, at(u, .3, .4)) + cal(520, 160, "1–3 أسابيع", at(u, .1, .3));
});
// 14 · why so many sessions? — her face and the session counter
shot(14, still(320, 393, 1), function (u, d, t) {
  var s = paper() + LZ.leg(38, 520, .97, {}) + face(320, 200, 200, { mouth: "frown", brows: "worried", look: [0, .4], eyes: 1 - .9 * (Math.sin(t * 2.5) > .97) }, at(u, 0, .3));
  for (var i = 0; i < 6; i++) s += callout(String(i + 1), 110 + i * 84, 700, at(u, .2 + i * .12, .3), 22);
  return s;
});
// 15 · not all the hair works at the same time — three follicles in three phases
var PH = [{ x: .2, phase: "grow" }, { x: .52, phase: "stop" }, { x: .83, phase: "rest", out: 30 }], PX3 = [148, 321, 488];
function block3(o) { return LZ.skinBlock(BX, BY, BW, PH.map(function (q, i) { return Object.assign({}, q, (o || [])[i] || {}); })).svg; }
shot(15, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + appear(at(u, 0, .6), block3()); });
// 16 · growth, stopped, asleep: each one named in turn while the others dim
shot(16, still(W[0], W[1], W[2]), function (u, d, t) {
  var c = window.CHUNKS[16], l = LN[16], i = 0; for (var j = 0; j < c.length; j++) if (t >= l.start + (l.end - l.start) * c[j]) i = j;
  var s = paper() + block3(), cols = ["#4f8a7a", INK, INK], names = ["نمو", "واقف", "نايم"];
  for (var k = 0; k <= i; k++) s += chip(names[k], PX3[k], 210, k === i ? cols[0] === cols[k] ? cols[k] : ORANGE : "#6d6a64", at(t - (l.start + (l.end - l.start) * c[k]), 0, .3));
  return s + G("", '<rect x="' + f(PX3[i] - 70) + '" y="260" width="140" height="470" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="10 8" rx="10"/>', at(u, .1, .3));
});
// 17 · the laser hits the growing hair hardest, because it still holds on to the bulb
function chips3(k) { return chip("نمو", PX3[0], 210, "#4f8a7a", k) + chip("واقف", PX3[1], 210, "#6d6a64", k) + chip("نايم", PX3[2], 210, "#6d6a64", k); }
shot(17, still(W[0], W[1], W[2]), function (u, d, t) {
  var k = at(u, .5, d + 2); return paper() + block3([{ k: k }, { k: k * .35 }, { k: 0 }]) + chips3(1) + LZ.beam(320, 300, 300, .4 + .5 * pulse(t), null).replace(/x/, "x") ;
});
shot([17, 3], fly(W, [148, 560, 2.2], 1.8), function (u, d, t) { return paper() + block3([{ k: 1 }, { k: .35 }, {}]) + chips3(1) + label(110, 600, 60, 500, "ماسك في البُصيلة", "#4f8a7a", at(u, 1.6, .5), 13); });
// 18 · you wait a few weeks, the sleeping hair wakes, and the next session hits it
shot(18, fly([148, 560, 2.2], W, 1.8), function (u, d, t) { return paper() + block3([{ dmg: 1 }, {}, {}]) + chips3(1) + cal(520, 150, "كام أسبوع", at(u, 1.2, .3)); });
shot([18, 2], still(W[0], W[1], W[2]), function (u, d, t) {   // the asleep follicle becomes a growing one
  var k = at(u, .1, .8); return paper() + G("", block3([{ dmg: 1 }, {}, {}]), 1 - k) + G("", block3([{ dmg: 1 }, {}, { phase: "grow", out: 60 }]), k) + chip("نمو", PX3[2], 210, "#4f8a7a", 1) + chip("نمو", PX3[0], 210, "#4f8a7a", 1) + chip("واقف", PX3[1], 210, "#6d6a64", 1);
});
shot([18, 3], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block3([{ dmg: 1 }, {}, { phase: "grow", out: 60, k: at(u, .3, d) }]) + laser(500, 300, t, true, 300) + chip("الجلسة 2", 160, 160, ORANGE, at(u, .1, .3));
});
// 19 · so it works best on dark hair in light skin
shot(19, still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ mel: 1, k: .5 + .5 * at(u, .2, d) })) + laser(262, 300, t, true, 300) + chip("شعر غامق", 470, 170, INK, at(u, LN[19].end - LN[19].start > 2 ? 1.0 : .5, .3)) + chip("جلد فاتح", 470, 222, "#c27a68", at(u, 1.6, .3)) + check(560, 120, .8, at(u, 2.2, .4));
});
// 20 · on dark skin the skin's own melanin would take the light; a longer wavelength goes past it to the hair
shot(20, still(W[0], W[1], W[2]), function (u, d, t) { return paper() + LZ.skinBlock(BX, BY, BW, fols(), { skinMel: true }).svg + T("بشرة غامقة", 470, 190, 24, INK, 800); });
shot([20, 1], still(W[0], W[1], W[2]), function (u, d, t) {
  var p = pulse(t); return paper() + LZ.skinBlock(BX, BY, BW, fols({ mel: 1, k: .2 + .8 * at(u, .3, d + 1.6) }), { skinMel: true }).svg + LZ.beam(262, 300, 300, .4 + .6 * p, "#f0c6b8") + LZ.handpiece(262, 300, .8, p) +
    chip("طول موجي أطول", 470, 190, "#a5473b", at(u, .1, .3));
});
shot([20, 4], still(W[0], W[1], W[2]), function (u, d, t) {
  var p = pulse(t); return paper() + LZ.skinBlock(BX, BY, BW, fols({ mel: 1, k: 1 }), { skinMel: true }).svg + LZ.beam(262, 300, 300, .4 + .6 * p, "#f0c6b8") + LZ.handpiece(262, 300, .8, p) +
    chip("طول موجي أطول", 470, 190, "#a5473b", 1) + label(330, 345, 450, 270, "الجلد مايسخنش", "#4f8a7a", at(u, .1, .5), 15);
});
// 21 · many women think the laser removes hair for ever. No.
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + LZ.leg(38, 520, .97, { cleared: [60, 400] }) + face(320, 200, 200, { mouth: "smile", eyes: 1 - .9 * (Math.sin(t * 2.5) > .97) }, at(u, 0, .3)); });
shot([21, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + LZ.leg(38, 520, .97, { cleared: [60, 400] }) + face(320, 200, 200, { mouth: "smile" }, 1) + chip("للأبد", 320, 360, INK, at(u, 0, .3)) + cross(320, 360, 1, at(u, .5, .5));
});
// 22 · it reduces it; what comes back is finer and lighter
shot(22, still(320, 393, 1), function (u, d, t) { return paper() + LZ.leg(38, 520, .97, { keep: .35 + .65 * (1 - at(u, .2, d)) }) + face(320, 200, 200, { mouth: "neutral" }, 1); });
shot([22, 1], still(320, 393, 1), function (u, d, t) {
  var hair = function (x, w, col) { return LZ.line([[x, 60], [x + 18, -50]], INK, w + 3) + LZ.line([[x, 60], [x + 18, -50]], col, w); };
  return paper() + LZ.leg(38, 520, .97, { keep: .35, thin: true }) + face(320, 200, 200, { mouth: "smile" }, 1) +
    iconBox(540, 160, 150, hair(-40, 7, "#3b2519") + hair(20, 2.5, "#8a6a52") + T("قبل", -32, 62, 16, INK, 800) + T("بعد", 28, 62, 16, INK, 800), at(u, .2, .3)) + chip("أخف وأرفع", 320, 700, "#4a6f8a", at(u, LN[22].end - LN[22].start - 1.5 > 0 ? 1.4 : .8, .3));
});
// 23 · bottom line: light → heat → the bulb → weakened (numbered on the one follicle)
var RC = [215, 470, 1.5];
shot(23, fly(W, RC, 1.8), function (u, d, t) { return paper() + block(fols({ mel: 1 })) + laser(262, 300, t, true, 300); });
shot([23, 1], still(RC[0], RC[1], RC[2]), function (u, d, t) {
  return paper() + block(fols({ mel: 1, k: at(u, .4, 1) })) + laser(262, 300, t, true, 300) + callout("1", 300, 330, at(u, 0, .3), 16) + callout("2", 250, 420, at(u, .6, .3), 16);
});
shot([23, 2], still(RC[0], RC[1], RC[2]), function (u, d, t) {
  return paper() + block(fols({ k: 1, dmg: at(u, .5, 1) })) + laser(262, 300, t, true, 300) + callout("1", 300, 330, 1, 16) + callout("2", 250, 420, 1, 16) + callout("3", 150, 580, at(u, 0, .3), 16) + callout("4", 250, 610, at(u, .6, .3), 16);
});
// 24 · the oddest: white and light blonde hair doesn't react at all — no melanin to drink the light
shot(24, fly(RC, W, 1.8), function (u, d, t) { return paper() + block(fols({ white: true }, { white: true }), { white: true }); });
shot([24, 3], still(W[0], W[1], W[2]), function (u, d, t) {
  return paper() + block(fols({ white: true }, { white: true }), { white: true }) + laser(262, 300, t, true, 420) + label(214, 470, 340, 420, "مافيهوش ميلانين", "#6d6a64", at(u, .2, .5), 14) + cross(150, 600, .9, at(u, .9, .5));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: her leg under the handpiece. line 1: the hairs are still there (her face, surprised). line 2: two weeks, they fall
  var l2 = LN[2], fall = li >= 2 ? clamp((t - l2.start - .4) / Math.max(1, l2.end - l2.start)) : 0;
  var s = LZ.leg(0, 430, .96, { bracket: li === 0 ? [130, 310] : null, fall: fall }) + (li === 0 ? LZ.beam(232, 400, 0, 0) + LZ.handpiece(232, 400, .85, pulse(t)) : "");
  if (li >= 1) s += face(470, 150, 190, { mouth: li >= 2 ? "smile" : "o", eyes: li >= 2 ? 1 : 1.25, brows: li >= 2 ? "neutral" : "raised", look: [0, .6] }, ease((t - LN[1].start) / .3));
  if (li >= 2) s += cal(120, 150, "أسبوعين", ease((t - l2.start) / .3));
  return s;
};
SCENE.bumper = function (u, t) {
  var p = pulse(t); return LZ.beam(90, 120, 80, .5 + .5 * p) + LZ.handpiece(90, 120, .55, p) + '<rect x="0" y="120" width="180" height="80" fill="#e4a593"/>' + LZ.line([[40, 120], [52, 96]], INK, 3) + LZ.line([[110, 120], [122, 96]], INK, 3);
};
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(60 -110) scale(.62)">' + LZ.skinBlock(40, 300, 540, [{ x: .38, k: 1 }], { backHairs: 4 }).svg + LZ.beam(262, 270, 280, .6 + .4 * pulse(t)) + LZ.handpiece(262, 270, .8, pulse(t)) + '</g>' +
    callout("1", 270, 70, ease(u / .3)) + callout("2", 190, 150, ease(u / .3 - .5)) + callout("3", 230, 200, ease(u / .3 - 1)) + callout("4", 150, 250, ease(u / .3 - 1.5));
};
