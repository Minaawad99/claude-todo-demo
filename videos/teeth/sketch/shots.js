// ── «ليه سنانك بتصفر وإنت بتغسلها؟» — shots. Drawings in draw.js (TH.*), the person in people.js (shared person kit).
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (~1.8 s) onto the part being talked
// about and later back out. The life is in the drawing: the person breathes and blinks, acid bubbles rise, fluoride settles.
var MX = 300, MY = 470, MS = 1.15;                                     // the cut molar in its jaw
var WIDE = [320, 430, 1.0], CROWN = [330, 320, 1.4], NECK = [215, 455, 2.1], NECKW = [250, 430, 1.45];
var BATH = [320, 370, 1.2];
function mol(o) { return TH.molar(MX, MY, MS, o || {}); }
function chipT(x, y, txt, col, side, k, sz) { k = clamp(k == null ? 1 : k); return k > 0 ? G("", TH.tag(x, y, txt, col, side, sz), k) : ""; }
function q(x, y, k, sz) { return G("", T("؟", x, y, sz || 120, ORANGE, 800), clamp(k)); }
// the bathroom: we look at him from the mirror (o: brusher options)
function bath(t, o) {
  var g = '<rect x="-400" y="-400" width="1440" height="1600" fill="#e6e0d0"/>';
  for (var i = -6; i < 20; i++) g += '<path d="M' + (i * 64) + ' -400 V1200" stroke="#d3cbb6" stroke-width="2"/>';
  for (var j = -6; j < 20; j++) g += '<path d="M-400 ' + (j * 64) + ' H1040" stroke="#d3cbb6" stroke-width="2"/>';
  g += '<clipPath id="mir' + (++CLIPN) + '"><rect x="70" y="50" width="500" height="560"/></clipPath>' + TH.mirror(70, 50, 500, 560);
  g += '<g clip-path="url(#mir' + CLIPN + ')">' + PEOPLE.brusher(320, 900, 1.5, t, o || {}) + '</g>';
  g += '<rect x="58" y="38" width="524" height="584" fill="none" stroke="#8a7a5c" stroke-width="14"/><rect x="58" y="38" width="524" height="584" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  return g + TH.sink(320, 660, 460);
}
bath(0, {}); var MOUTH = [PEOPLE_MOUTH[0], PEOPLE_MOUTH[1]];
function mouthCam(z) { return [MOUTH[0], MOUTH[1] + 20, z || 2.4]; }
function num(n, k) { return numBox(n, 560, 90, k, 46, true); }
function lyr(u, a) { return LN[a].end - LN[a].start; }

// 4 · «قبل ما نشرح… السنة ليها طبقتين… خليك فاكرهم»
shot(4, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + appear(at(u, 0, .8), mol()); }, { tr: "fade" });
shot([4, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + callout("1", 196, 232, at(u, .1, .3), 18) + callout("2", 330, 290, at(u, .5, .3), 18); });
shot([4, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + callout("1", 196, 232, 1, 18) + callout("2", 330, 290, 1, 18) + tag("قاعدة", 540, 110, at(u, .1, .3), 24, ORANGE); });
// 5 · outside: white, half see-through, the enamel — the hardest thing in your body
shot(5, fly(WIDE, CROWN, 1.8), function (u, d, t) { return paper() + mol() + sweep(150, 180, 330, 260, at(u, .4, 1.2), 1, '<g opacity=".35">' + mol() + '</g>'); });
shot([5, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) {   // half see-through: the yellow behind it glows through a little
  return paper() + mol() + inset(470, 200, 62, TH.tooth(0, 60, .45, { uncut: true, yellow: .25 + .08 * Math.sin(t * 2) }), at(u, .1, .3));
});
shot([5, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + chipT(402, 232, "المينا", BLUE, 1, at(u, .1, .4), 17); });
shot([5, 3], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + chipT(402, 232, "المينا", BLUE, 1, 1, 17) + tag("أقوى من العضم", 330, 450, at(u, .2, .3), 22, ORANGE); });
// 6 · and under it, yellow by nature: the dentin
shot(6, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + '<circle cx="300" cy="300" r="' + f(70 * at(u, .1, .8) + 6 * Math.sin(t * 3)) + '" fill="#e9b949" opacity=".22"/>' + chipT(402, 232, "المينا", BLUE, 1, 1, 17); });
shot([6, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol() + '<circle cx="300" cy="300" r="' + f(60 + 6 * Math.sin(t * 3)) + '" fill="#e9b949" opacity=".22"/>' + chipT(300, 300, "العاج", OLIVE, 1, at(u, .1, .4), 17) + chipT(402, 232, "المينا", BLUE, 1, 1, 17); });
// 7 · so the thinner the enamel, the more of the yellow under it shows
shot(7, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { var k = at(u, .2, 1.4); return paper() + mol({ en: 1 - .7 * k }) + chipT(300, 300, "العاج", OLIVE, 1, 1, 17); });
shot([7, 1], fly(CROWN, WIDE, 1.8), function (u, d, t) { return paper() + mol({ en: .3 }) + inset(520, 270, 92, TH.tooth(0, 80, .5, { uncut: true, yellow: .15 + .7 * at(u, .3, 1.4) }), at(u, .1, .3)); });
shot([7, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .3 }) + inset(520, 270, 92, TH.tooth(0, 80, .5, { uncut: true, yellow: .85 + .03 * Math.sin(t * 3) }), 1) + arrow(430, 270, 400, 270, ORANGE, 4, at(u, .1, .4)); });
// 8 · «طب إيه اللي بيرقّق المينا؟» — first mistake: brushing straight after something sour
shot(8, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .3 }) + q(520, 240, at(u, .3, .3)); });
shot([8, 2], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin" } }) + num("1", at(u, .1, .3)); });
shot([8, 4], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, {}) + num("1", 1) + iconBox(130, 140, 150, TH.glassOJ(0, 60, .75, .7), at(u, 0, .3)); });
// 9 · a glass of orange juice softens the enamel's surface for a while
shot(9, fly(WIDE, CROWN, 1.8), function (u, d, t) { var k = at(u, .3, 1.6); return paper() + mol({ soft: k }) + '<g transform="rotate(' + f(-35 * at(u, 0, .8)) + ' 480 260)">' + TH.glassOJ(480, 280, .7, .7 - .3 * k) + '</g>'; });
shot([9, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + chipT(402, 232, "طري", ORANGE, 1, at(u, .2, .4), 17); });
shot([9, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + chipT(402, 232, "طري", ORANGE, 1, 1, 17) + watchSmall(t, at(u, .1, .3)); });
function watchSmall(t, k) { return iconBox(150, 160, 120, TH.watch(0, 6, 40, t, ""), k); }
// 10 · scrub it then and you scrape it off while it's soft
function scrubBrush(t, x, y) { var b = 34 * Math.sin(t * 12); return TH.brush(x + b, y, 0, 1.05, { paste: true }); }
function chips(t, n, x, y) { var s = ""; for (var i = 0; i < (n || 12); i++) { var u = (t * 1.1 + hash(i)) % 1; s += '<rect x="' + f(x + (hash(i + 3) - .5) * 160 + (hash(i + 5) - .5) * 160 * u) + '" y="' + f(y - 40 * u + 220 * u * u) + '" width="5" height="5" fill="#f7f3ea" stroke="' + ORANGE + '" stroke-width="1" opacity="' + f(1 - u) + '"/>'; } return s; }
shot(10, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 }) + scrubBrush(t, 290, 160); });
shot([10, 1], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: 1 - .4 * at(u, 0, d), en: 1 - .35 * at(u, 0, d) }) + scrubBrush(t, 290, 160) + chips(t, 14, 300, 200); });
shot([10, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: .6, en: .65 }) + scrubBrush(t, 290, 160) + chips(t, 14, 300, 200) + chipT(402, 232, "وهي طرية", ORANGE, 1, at(u, .1, .4), 17); });
// 11 · like wiping a wall whose paint is still wet
shot(11, still(320, 393, 1), function (u, d, t) { return paper() + TH.wetWall(110, 170, at(u, .2, d + .2), t); });
// 12 · the right way: rinse with water, and wait half an hour to an hour
shot(12, still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, at(u, .1, .4), OLIVE) + TH.cup(220, 560, 2.2, .55 + .02 * Math.sin(t * 3)) + tag("اشطف بمية", 220, 650, at(u, .3, .3), 24, BLUE); });
shot([12, 1], still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, 1, OLIVE) + TH.watch(320, 380, 150, t * 2.2, "") ; });
shot([12, 2], still(320, 393, 1), function (u, d, t) { return paper() + check(520, 120, .9, 1, OLIVE) + TH.watch(320, 380, 150, t * 2.2, "") + bigNum("30–60", "دقيقة", 320, 650, at(u, .1, .4), ORANGE, 64); });
// 13 · second mistake: scrubbing hard
shot(13, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { scrub: 1, face: { mouth: "grin", brows: "angry" } }) + num("2", at(u, .1, .3)); });
shot([13, 1], fly(BATH, mouthCam(2.0), 1.8), function (u, d, t) { return paper() + bath(t, { scrub: 1, face: { mouth: "grin", brows: "angry" } }) + num("2", 1); });
// 14 · like sandpaper on a painted door: the harder you press, the more you take off
shot(14, still(320, 393, 1), function (u, d, t) { return paper() + TH.sandDoor(170, 110, t, .15); });
shot([14, 2], still(320, 393, 1), function (u, d, t) { return paper() + TH.sandDoor(170, 110, t * 1.6, .15 + .7 * at(u, 0, d)) + arrow(560, 300, 560, 470, ORANGE, 6, at(u, .1, .4)) + T("ضغط", 560, 280, 24, ORANGE, 800); });
// 15 · it eats the enamel at the gum line, and the gum itself pulls down
shot(15, fly(WIDE, NECKW, 1.8), function (u, d, t) { return paper() + mol({ wear: at(u, .4, 1.6) }); });
shot([15, 1], still(NECKW[0], NECKW[1], NECKW[2]), function (u, d, t) { return paper() + mol({ wear: 1 }) + tag("عند اللثة", 150, 330, at(u, .1, .3), 20, ORANGE) + arrow(160, 350, 190, 425, ORANGE, 3, at(u, .3, .4)); });
shot([15, 2], still(NECKW[0], NECKW[1], NECKW[2]), function (u, d, t) { return paper() + mol({ wear: 1, rec: at(u, .1, d) }) + arrow(150, 410, 150, 470, ORANGE, 4, at(u, .2, .4)); });
// 16 · the right way: a soft brush, tilted 45° to the gum, small strokes, for two minutes
function at45(t, k) { var j = 3 * Math.sin(t * 10); return TH.brushEnd(MX - 104 * MS + j, MY - 22 * MS + j, 45, 1.25); }
shot(16, fly(NECKW, NECK, 1.8), function (u, d, t) { return paper() + mol() + check(110, 300, .55, at(u, .2, .4), OLIVE) + G("", at45(t), at(u, .1, .3)); });
shot([16, 1], still(NECK[0], NECK[1], NECK[2]), function (u, d, t) { return paper() + mol() + at45(t) + draw("M150 380 A60 60 0 0 1 195 365", at(u, .1, .5), ORANGE, 2.5) + G("", N("45°", 150, 350, 26, ORANGE), at(u, .4, .3)); });
shot([16, 3], still(NECK[0], NECK[1], NECK[2]), function (u, d, t) { return paper() + mol() + at45(t * 1.6) + G("", N("45°", 150, 350, 26, ORANGE), 1) + wave(150, 440, 200, 440, t, BLUE, 4, 14, at(u, .1, .4), 2); });
shot([16, 4], fly(NECK, WIDE, 1.8), function (u, d, t) { return paper() + mol() + at45(t) + iconBox(520, 130, 150, TH.watch(0, 0, 50, t, "دقيقتين"), at(u, .3, .3)); });
// 17 · but there's a third mistake most people make every day… and nobody told them
shot(17, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, {}) + num("3", at(u, .1, .3)) + q(560, 260, at(u, .3, .3), 80); });
shot([17, 2], still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin" } }) + num("3", 1) + q(560, 260, 1, 80) + tag("كل يوم", 140, 120, at(u, .1, .3), 22, ORANGE); });
shot([17, 3], fly(BATH, mouthCam(1.7), 1.8), function (u, d, t) { return paper() + bath(t, { face: { mouth: "grin", brows: "raised" } }) + num("3", 1); });
// 18 · the bio line: the link pill
shot(18, still(320, 393, 1), function (u, d, t) {
  var k = at(u, .3, .4); return paper() + dim(.6, bath(t, { face: { mouth: "grin", brows: "raised" } })) +
    G('translate(320 ' + f(190 - (1 - k) * 12) + ')', '<rect x="-150" y="-34" width="300" height="68" rx="34" fill="#f2c94c" stroke="' + INK + '" stroke-width="2.4"/>' + T("اللينك في البايو ↑", 0, 11, 30, "#1a1a1a", 900), k);
});
// 19 · back to it: rinsing with water straight after brushing
shot(19, still(BATH[0], BATH[1], BATH[2]), function (u, d, t) { return paper() + bath(t, { cup: true, face: { mouth: "o", eyes: .6 } }) + num("3", at(u, .1, .3)); });
shot([19, 1], fly(BATH, mouthCam(1.8), 1.8), function (u, d, t) { return paper() + bath(t, { cup: true, face: { mouth: "o", eyes: .6 } }) + num("3", 1); });
// 20 · «طب وإيه المشكلة؟» — the paste has fluoride; it makes the enamel stronger
shot(20, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol() + q(520, 240, at(u, .2, .3)); });
shot([20, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ fl: at(u, .3, 1.4) }) + TH.tube(360, 110, -12, .9); });
shot([20, 2], fly(WIDE, CROWN, 1.8), function (u, d, t) { return paper() + mol({ fl: 1 }) + chipT(402, 232, "بيقوّي المينا", OLIVE, 1, at(u, .6, .4), 15); });
// 21 · the water washes it off before it works. Right: spit the paste, don't rinse
function rinse(t, k) { var s = ""; for (var i = 0; i < 18; i++) { var v = (t * .9 + hash(i)) % 1, x = 150 + hash(i + 2) * 300; s += '<path d="M' + f(x) + ' ' + f(130 + v * 320) + ' q-4 10 0 16 q4 -6 0 -16" fill="#8fb5cc" stroke="' + BLUE + '" stroke-width="1.2" opacity="' + f(k * (1 - v * .6)) + '"/>'; } return s; }
shot(21, still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { var k = at(u, .2, d); return paper() + mol({ fl: 1, flOff: k }) + rinse(t, at(u, 0, .4)); });
shot([21, 2], fly(CROWN, WIDE, 1.8), function (u, d, t) { return paper() + mol({ fl: 1 }) + iconBox(140, 130, 150, TH.cup(0, 50, 1, .6), at(u, .1, .3)) + cross(140, 130, .9, at(u, .5, .5)); });
shot([21, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ fl: 1 }) + iconBox(140, 130, 150, TH.cup(0, 50, 1, .6), 1) + cross(140, 130, .9, 1) + tag("تُف بس", 520, 130, at(u, .1, .3), 22, BLUE) + check(520, 190, .6, at(u, .3, .4), OLIVE); });
// 22 · fourth mistake: home whitening tricks. Lemon dissolves the enamel; charcoal and baking soda can sand it
shot(22, still(320, 393, 1), function (u, d, t) { return paper() + numBox("4", 560, 90, at(u, .1, .3), 46, true) + TH.lemon(120, 420, 1.5) + G("", TH.charcoal(320, 450, 1.6), at(u, .4, .3)) + G("", TH.soda(510, 450, 1.5), at(u, .7, .3)); });
shot([22, 2], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ soft: at(u, .1, 1), en: 1 - .4 * at(u, .2, d) }) + TH.lemon(480, 200, .9); });
shot([22, 4], still(CROWN[0], CROWN[1], CROWN[2]), function (u, d, t) { return paper() + mol({ en: .55 }) + TH.charcoal(490, 220, .8) + scrubBrush(t, 290, 160) + chips(t, 12, 300, 200); });
// 23 · lots think yellowish teeth mean dirty ones. No: a healthy tooth doesn't have to be snow white
shot(23, still(320, 393, 1), function (u, d, t) { return paper() + TH.smile(320, 360, 1.4, .55 + .02 * Math.sin(t * 2)); });
shot([23, 2], still(320, 393, 1), function (u, d, t) { return paper() + TH.smile(320, 360, 1.4, .55) + tag("مش نضيفة؟", 320, 600, at(u, .1, .3), 28, INK); });
shot([23, 3], still(320, 393, 1), function (u, d, t) { return paper() + dim(.5, TH.smile(320, 300, 1.2, .55)) + tag("مش نضيفة؟", 320, 520, 1, 28, INK) + cross(320, 510, 1.1, at(u, .1, .5)); });
shot([23, 4], still(320, 393, 1), function (u, d, t) { return paper() + TH.shades(135, 400, 6, at(u, 0, 1.2)) + check(320, 600, 1, at(u, 1, .5), OLIVE) + tag("كلها سليمة", 320, 680, at(u, 1.3, .3), 24, OLIVE); });
// 24 · bottom line: wait after sour · soft brush · don't rinse · no home tricks
function recap(ks) {
  var cells = [[180, 250], [460, 250], [180, 560], [460, 560]], s = "";
  var art = [function () { return TH.watch(0, 0, 70, window.__t, ""); }, function () { return TH.brush(-100, 0, 0, .8, {}); },
    function () { return TH.cup(0, 60, 1.4, .6) + cross(0, 10, 1.1, 1); }, function () { return TH.lemon(0, 0, 1) + cross(0, 0, 1.1, 1); }];
  for (var i = 0; i < 4; i++) { var k = clamp(ks[i] || 0); if (k <= 0) continue; s += G("", G('translate(' + cells[i][0] + ' ' + cells[i][1] + ')', art[i]()), k) + callout(String(i + 1), cells[i][0] - 110, cells[i][1] - 110, k, 18); }
  return s;
}
function head24(k) { return tag("من الآخر", 320, 80, k, 26, ORANGE); }
shot(24, still(320, 393, 1), function (u, d, t) { return paper() + head24(at(u, .1, .3)); });
shot([24, 1], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([at(u, 0, .3)]); });
shot([24, 2], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, at(u, 0, .3)]); });
shot([24, 3], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, 1, at(u, 0, .3)]); });
shot([24, 4], still(320, 393, 1), function (u, d, t) { return paper() + head24(1) + recap([1, 1, 1, at(u, 0, .3)]); });
// 25 · the oddest: enamel has not one living cell… so once it's gone, your body can't build it again
shot(25, still(320, 393, 1), function (u, d, t) { return paper() + inset(190, 360, 140, TH.crystals(0, 0, 150), at(u, .1, .3)) + tag("المينا", 190, 545, at(u, .3, .3), 24, BLUE) + G("", inset(460, 360, 120, TH.boneCells(0, 0, 130, t), 1) + tag("العضم", 460, 545, 1, 24, OLIVE), at(u, .8, .4)); });
shot([25, 1], still(320, 393, 1), function (u, d, t) { return paper() + inset(190, 360, 140, TH.crystals(0, 0, 150), 1) + tag("المينا", 190, 545, 1, 24, BLUE) + inset(460, 360, 120, TH.boneCells(0, 0, 130, t), 1) + tag("العضم", 460, 545, 1, 24, OLIVE) +
  T("مافيهاش خلايا", 190, 610, 26, ORANGE, 800) + cross(190, 360, 1.2, at(u, .3, .5)) + G("", T("خلايا حية", 460, 610, 26, OLIVE, 800), at(u, .9, .3)); });
shot([25, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: 1 - .75 * at(u, .2, 1.2) }); });
shot([25, 4], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + mol({ en: .25 }) + tag("مابترجعش", 500, 260, at(u, .1, .3), 24, ORANGE) + arrow(470, 280, 420, 300, ORANGE, 4, at(u, .4, .4)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: brushing at the mirror. line 1: the teeth turning yellow (inset). line 2: «how» you brush, not how often
  var s = '<g transform="translate(-16 -20) scale(.98)">' + bath(t, { face: { mouth: li >= 1 ? "grin" : "grin", brows: li >= 1 ? "worried" : "neutral" } }) + '</g>';
  if (li >= 1) s += inset(470, 150, 110, TH.smile(0, 0, .55, clamp((t - LN[1].start) / 2.2) * .85), ease((t - LN[1].start) / .3));
  if (li >= 2) s += tag("2×", 120, 120, ease((t - LN[2].start) / .3), 34, INK) + cross(120, 110, .7, clamp((t - LN[2].start - 1.6) / .5)) + tag("إزاي؟", 120, 230, ease((t - LN[2].start - 2.4) / .3), 30, ORANGE);
  return s;
};
SCENE.bumper = function (u, t) {
  return '<g transform="translate(90 112) scale(.33)">' + TH.tooth(0, 0, 1, { uncut: true }) + '</g>' + TH.brush(118, 70, -35, .3, { paste: true });
};
SCENE.outro = function (svg, u, t) {
  return '<g transform="translate(180 -40) scale(.36)">' + TH.molar(300, 470, 1.15, { fl: 1 }) + '</g>' +
    callout("1", 228, 40, ease(u / .3)) + callout("2", 300, 92, ease(u / .3 - .5)) + callout("3", 372, 150, ease(u / .3 - 1)) + callout("4", 352, 26, ease(u / .3 - 1.5));
};
