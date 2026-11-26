// ── «اتبرع لمصابي حريق الوراق» — shots. Panel world 640 × 786. People: the shared person kit; the road and the fire
// come from ../../warraq-fire/sketch/draw.js (copied as draw.js). Donation numbers only on screen, all from the
// hospitals' own official pages (refs/SOURCES.md).
function LS(i) { return LN[i].start; }
function pf(o) { return PERSON.front(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function ps(o) { return PERSON.side(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function blink(t, s) { var p = (t + (s || 0)) % 3.7; return p < .12 ? .05 : 1; }
function place(x, y, s, inner) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", inner); }
function floorL(y) { return R(-600, y, 1840, 600, "#e3d7bd", 0) + '<path d="M-600 ' + y + ' H1240" stroke="' + INK + '" stroke-width="2.4"/>'; }
var WHITE = "#f4f2ec", GAUZE = "#f7f4ea", GREEN = "#5e8a4e", RED = "#b8402f";

// a phone in a hand (the kit's hand), screen content drawn in a 120×220 box at (0,0)
function handPhone(x, y, sc, screen, t) {
  var s = R(-70, -120, 140, 250, "#2f2b27", 3, 18) + '<rect x="-60" y="-104" width="120" height="212" rx="6" fill="#dfe7e2" stroke="' + INK + '" stroke-width="1.6"/>';
  s += '<clipPath id="scr' + (++CLIPN) + '"><rect x="-60" y="-104" width="120" height="212" rx="6"/></clipPath><g clip-path="url(#scr' + CLIPN + ')">' + (screen || "") + '</g>';
  s = PERSON.hand([-18, 205], -1.5, "relaxed", -1, 3.2, PERSON.colors, true) + s;   // the hand holds the phone from below, behind it
  return place(x, y, sc, s);
}
// the fire on a phone screen (yesterday, watching)
function screenFire(t) { return '<rect x="-60" y="-104" width="120" height="212" fill="#2b3340"/>' + R(-60, 40, 120, 70, ASPH, 0) + fireRow(-60, 60, 40, 46, t, 1) + smoke(0, -10, 100, 80, t, 1, 6, 6) + C(-40, -88, 5, RED, 0) + T("مباشر", -10, -84, 11, "#fff", 700); }
// a heart with a plus, for «تنقذ روح»
function heart(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", P("M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30 Z", col || ORANGE, 3) + '<path d="M0 -22 V6 M-14 -8 H14" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'); }

// ── 0–1 · the hook card ──
SCENE.intro = function (svg, t, li) {
  var s = '<rect width="608" height="660" fill="' + PAPER + '"/>';
  if (li === 0) s += '<rect width="608" height="660" fill="' + NIGHT + '" opacity=".55"/>' + handPhone(304, 330, 1.25, screenFire(t), t);
  else { var k = ease((t - LS(1)) / .6); s += '<rect width="608" height="660" fill="' + NIGHT + '" opacity="' + f(.55 * (1 - k)) + '"/>' + handPhone(304, 330, 1.25, '<rect x="-60" y="-104" width="120" height="212" fill="#f4ecdb"/>' + heart(0, 0, .9 * pop(k) + .01, ORANGE), t); }
  return s + '<rect x="1" y="1" width="606" height="658" fill="none" stroke="' + INK + '" stroke-width="2"/>';
};

// ── 2 · «لسه فيه مصابين في المستشفيات…»: a hospital bed, the patient with bandaged arms, a drip, a monitor ──
function monitor(x, y, t) { var s = R(x - 70, y - 50, 140, 100, "#2f2b27", 2.4, 6) + R(x - 60, y - 40, 120, 70, "#203028", 1.2), d = "M" + (x - 58) + " " + (y - 5); for (var i = 0; i <= 116; i += 4) { var ph = ((i + t * 60) % 58) / 58, v = ph > .4 && ph < .46 ? -22 : ph > .46 && ph < .5 ? 12 : 0; d += " L" + (x - 58 + i) + " " + f(y - 5 + v); } return s + '<path d="' + d + '" stroke="#7fd08a" stroke-width="2" fill="none"/>' + R(x - 6, y + 50, 12, 120, "#8d887e", 1.6); }
function bedScene(t, o) {
  o = o || {}; var s = paper() + floorL(640);
  s += R(120, 500, 460, 30, "#c6c3bb", 2.4) + R(130, 530, 14, 110, "#8d887e", 1.8) + R(556, 530, 14, 110, "#8d887e", 1.8) + R(110, 430, 16, 210, "#8d887e", 1.8) + R(128, 470, 440, 32, WHITE, 2.2, 10);
  s += R(140, 452, 90, 24, WHITE, 2, 12);   // pillow
  var po = { x: 330, y: 470, s: .95, dir: 1, rot: -90, legs: [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms: [{ sh: 6, el: 8, hand: "relaxed" }, { sh: -6, el: 8, hand: "relaxed" }], face: { eyes: .15, brows: "worried", mouth: "neutral" }, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } } };
  s += ps(po);
  s += P("M240 440 Q380 420 560 450 L560 476 L240 476 Z", "#cfe0ee", 2.2);   // the sheet over the legs
  for (var i = 0; i < 5; i++) s += R(210 + i * 18, 446, 12, 26, GAUZE, 1.2, 3);   // gauze bands on the arm
  s += R(60, 230, 8, 410, "#8d887e", 1.8) + P("M40 230 L88 230 L84 300 L44 300 Z", "#d7e6ec", 2) + '<path d="M64 300 Q70 400 200 450" stroke="' + INK + '" stroke-width="1.4" fill="none"/>' + C(64, 280 + 14 * ((t * .8) % 1), 3, "#9fbfd0", 0);
  return s + monitor(560, 300, t);
}
shot(2, still(340, 440, 1.35), function (u, d, t) { return bedScene(t); });
// «وفيهم حروق وصلت لسبعين في المية من الجسم.»: a standing figure, 70 % of the body shaded orange
shot([2, 1], still(320, 400, 1), function (u, d, t) {
  var k = at(u, .1, 1.2), body = pf({ x: 230, y: 650 - 210 * 1.1, s: 1.1, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } }, face: { eyes: blink(t), brows: "worried" }, arms: [{ rel: [-30, 150], hand: "relaxed" }, { rel: [30, 150], hand: "relaxed" }] });
  var top = lerp(650, 650 - 400 * 1.1 * .74, k);
  return paper() + floorL(650) + body + '<clipPath id="b70"><rect x="0" y="' + f(top) + '" width="460" height="' + f(650 - top) + '"/></clipPath><g clip-path="url(#b70)" opacity=".55">' + body.replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="' + ORANGE + '"') + '</g>' + bigNum(count(70, k) + "%", "من الجسم", 500, 380, at(u, .2, .4), ORANGE, 90);
});
// 3 · «والحرق الكبير ده… علاجه مش يوم ولا يومين.»: calendar pages flying off
function calendar(x, y, n, k) { var s = R(x - 110, y - 120, 220, 240, WHITE, 2.6, 8) + R(x - 110, y - 120, 220, 56, RED, 2.6, 8) + C(x - 60, y - 124, 8, "#8d887e", 2) + C(x + 60, y - 124, 8, "#8d887e", 2) + N(String(n), x, y + 60, 90, INK) + T("يوم", x, y + 100, 22, MUTE, 700); return s; }
shot(3, still(320, 400, 1), function (u, d, t) { var n = Math.min(60, Math.floor(1 + u * 18)), s = paper() + calendar(320, 400, n); for (var i = 0; i < 3; i++) { var p = (u * 1.8 + i / 3) % 1; s += G("translate(" + f(320 + p * 260) + " " + f(330 - p * 220) + ") rotate(" + f(p * 70) + ")", R(-90, -50, 180, 110, WHITE, 2, 6), 1 - p); } return s + tag("مش يوم ولا يومين", 320, 620, at(u, .4, .4), 30, ORANGE); });
// 4 · «طب ليه علاج الحروق صعب كده؟»
// the skin in a cut: epidermis, dermis with a hair and vessels, the fat under it; microbes outside
function skinCut(t, burn, o) {
  o = o || {}; var s = paper(), X0 = -40, X1 = 680;
  s += R(X0, 520, X1 - X0, 300, "#f0d79a", 2.4); for (var i = 0; i < 14; i++) s += C(X0 + 30 + i * 52, 580 + (i % 2) * 40, 22, "#f6e2ad", 1.4);   // fat
  s += R(X0, 380, X1 - X0, 140, "#e7a98f", 2.4) + '<path d="M40 470 Q160 430 280 470 T520 470 T760 470" stroke="#b8402f" stroke-width="5" fill="none"/><path d="M40 490 Q160 460 280 490 T520 490" stroke="#4a6f8a" stroke-width="5" fill="none"/>';   // dermis, vessels
  s += P("M300 380 L300 470 Q310 500 320 470 L320 380", "#3a2a20", 1.4) + '<ellipse cx="310" cy="480" rx="16" ry="22" fill="#d98a6a" stroke="' + INK + '" stroke-width="1.6"/>';   // hair follicle
  s += R(X0, 350, X1 - X0, 30, "#f3c8b0", 2.4);   // epidermis
  for (var j = 0; j < 30; j++) s += '<path d="M' + (X0 + j * 26) + ' 352 l12 0" stroke="#e0a98a" stroke-width="2"/>';
  if (burn > 0) { var bx = 120, bw = 400 * burn; s += P("M" + bx + " 350 Q" + (bx + bw * .2) + " 395 " + (bx + bw * .5) + " 400 Q" + (bx + bw * .8) + " 395 " + (bx + bw) + " 350 Z", CHAR, 2.2) + '<path d="M' + bx + ' 350 Q' + (bx + bw * .5) + ' 410 ' + (bx + bw) + ' 350" stroke="' + ORANGE + '" stroke-width="3" fill="none" opacity=".7"/>'; }
  // microbes: green capsules; they bounce off the skin, or slip in through the burn
  for (var m = 0; m < 9; m++) { var p = (t * .35 + hash(m)) % 1, mx = 40 + hash(m + 5) * 560, enter = burn > .5 && mx > 140 && mx < 500, my = enter ? 150 + p * 320 : 150 + 190 * Math.abs(Math.sin(p * Math.PI)); s += G("translate(" + f(mx) + " " + f(my) + ") rotate(" + f(m * 40 + t * 30) + ")", '<rect x="-14" y="-7" width="28" height="14" rx="7" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-5" cy="0" r="2" fill="#2f3a20"/><circle cx="5" cy="0" r="2" fill="#2f3a20"/>'); }
  return s;
}
shot(4, still(320, 420, 1), function (u, d, t) { return skinCut(t, 0) + T("؟", 320, 250, 150 * (pop(at(u, .1, .5)) || .01), ORANGE, 900); });
// 5 · «عشان الجلد هو اللي بيحمي جسمك من الميكروبات…»
shot(5, still(320, 420, 1), function (u, d, t) { return skinCut(t, 0) + label(560, 365, 520, 270, "الجلد", OLIVE, at(u, .2, .5), 26) + label(100, 190, 140, 120, "ميكروبات", GREEN, at(u, .8, .5), 22) + check(560, 180, 1.2, at(u, 1.2, .4), OLIVE); });
// «ولما يتحرق، الجسم بيبقى مفتوح.»
shot([5, 2], fly([320, 420, 1], [320, 400, 1.2], 1.8), function (u, d, t) { return skinCut(t, at(u, 0, .8)) + label(320, 395, 470, 250, "مفتوح", ORANGE, at(u, .8, .5), 30); });
// 6 · «فالمريض محتاج أوضة معقمة،»: a clean room: the bed behind glass, filtered air
function cleanRoom(t, k) { var s = bedScene(t); s += '<rect x="20" y="180" width="600" height="460" fill="#d7e6ec" opacity=".25" stroke="' + BLUE + '" stroke-width="4" stroke-dasharray="14 8"/>'; for (var i = 0; i < 4; i++) { var p = (t * .4 + i / 4) % 1; s += arrow(120 + i * 130, 190 + p * 120, 120 + i * 130, 220 + p * 120, BLUE, 3, 1); } return s + R(250, 150, 140, 30, "#c6c3bb", 2) + tag("معقمة", 320, 120, k, 32, BLUE); }
shot(6, still(330, 420, 1), function (u, d, t) { return cleanRoom(t, at(u, .2, .4)); });
// «وغيار على الجرح كل يوم،»: gauze winding round a forearm
function forearmD(k, t) {
  var sk = PERSON.colors.skin, s = paper() + R(-120, 380, 80, 140, "#cfe0ee", 2.4) + '<path d="M-44 392 C40 388 200 398 334 399 L334 461 C200 470 40 500 -44 506 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.6"/>' + PERSON.hand([326, 430], 0, "relaxed", 1, 4.6, PERSON.colors, false);
  var n = Math.floor(k * 9); for (var i = 0; i < n; i++) s += P("M" + (20 + i * 30) + " 392 L" + (46 + i * 30) + " 390 L" + (52 + i * 30) + " 500 L" + (26 + i * 30) + " 504 Z", GAUZE, 1.6);
  if (k > 0 && k < 1) { var rx = 30 + k * 270; s += G("translate(" + f(rx) + " 360)", C(0, 0, 34, GAUZE, 2.4) + C(0, 0, 12, "#d6d2c6", 1.6)); }
  return s;
}
shot([6, 1], still(200, 430, 1.1), function (u, d, t) { return forearmD(clamp(u / 1.8), t) + tag("كل يوم", 220, 250, at(u, .3, .4), 30, ORANGE); });
// «وساعات عمليات ترقيع جلد.»: a patch of healthy skin moved from the thigh onto the burn
shot([6, 2], still(320, 400, 1), function (u, d, t) {
  var body = pf({ x: 320, y: 650 - 210 * 1.1, s: 1.1, outfit: { base: "casual", colors: { shirt: "#cfe0ee", shirtD: "#a6bfd3" } }, face: { eyes: blink(t), brows: "worried" }, arms: [{ rel: [-30, 150], hand: "relaxed" }, { rel: [40, 140], hand: "relaxed" }] });
  var k = at(u, .3, 1.2), px = lerp(290, 400, k), py = lerp(520, 330, k);
  return paper() + floorL(650) + body + '<ellipse cx="400" cy="330" rx="22" ry="14" fill="' + CHAR + '" opacity=".75"/>' + R(px - 16, py - 10, 32, 20, "#e7a98f", 2, 4) + '<path d="M290 520 Q380 470 400 330" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="8 6" fill="none" opacity="' + f(at(u, 0, .3)) + '"/>' + label(290, 520, 150, 600, "جلد سليم", OLIVE, at(u, .1, .4), 22) + label(400, 330, 520, 230, "الحرق", ORANGE, at(u, .1, .4), 22);
});
// 7 · «وكل ده بيتكلف كتير… وبياخد شهور.»: coins piling up, the months turning
function coinStack(x, y, n) { var s = ""; for (var i = 0; i < n; i++) s += '<ellipse cx="' + x + '" cy="' + f(y - i * 12) + '" rx="46" ry="14" fill="#e2b93a" stroke="' + INK + '" stroke-width="2"/>'; return s; }
shot(7, still(320, 420, 1), function (u, d, t) { var k = clamp(u / 2.2), s = paper() + floorL(600); [180, 300, 420].forEach(function (x, i) { s += coinStack(x, 600, Math.floor(k * (8 + i * 6))); }); return s + G("", calendar(520, 260, Math.max(1, Math.floor(k * 6)), 1).replace(">يوم<", ">شهور<"), at(u, 1.4, .4)) + T("كتير", 300, 280, 44, ORANGE, 900); });
// 8 · «طب أتبرع فين؟»: your phone, a question mark
shot(8, still(320, 400, 1), function (u, d, t) { return paper() + handPhone(320, 420, 1.3, '<rect x="-60" y="-104" width="120" height="212" fill="#f4ecdb"/>' + T("؟", 0, 40, 110 * (pop(at(u, .1, .5)) || .01), ORANGE, 900), t); });
// 9 · «أول مكان: مستشفى 185 قصر العيني للحوادث والحروق…»: the hospital, the «185» on its front
function hospital(x, y, name, sign, o) {
  o = o || {}; var s = R(x - 220, y - 300, 440, 300, "#e9e3d4", 2.6) + R(x - 220, y - 320, 440, 26, "#c6c3bb", 2.4);
  for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) s += R(x - 196 + c * 66, y - 280 + r * 62, 44, 40, GLASS2, 1.6);
  s += R(x - 60, y - 70, 120, 70, GLASS2, 2.2) + '<path d="M' + x + ' ' + (y - 70) + ' V' + y + '" stroke="' + INK + '" stroke-width="1.6"/>';
  s += R(x - 150, y - 380, 300, 64, o.signCol || BLUE, 2.4, 6) + T(sign, x, y - 336, 36, "#fff", 900);
  s += R(x + 150, y - 382, 50, 50, "#fff", 2, 4) + '<path d="M' + (x + 175) + ' ' + (y - 372) + ' V' + (y - 342) + ' M' + (x + 160) + ' ' + (y - 357) + ' H' + (x + 190) + '" stroke="' + RED + '" stroke-width="9"/>';
  return s + T(name, x, y + 50, 26, INK, 800);
}
shot(9, still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "قصر العيني · جامعة القاهرة", "مستشفى 185", { signCol: "#8a2f5c" }) + T("للحوادث والحروق", 320, 200, 28, "#8a2f5c", 800); });
shot([9, 2], still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "قصر العيني · جامعة القاهرة", "مستشفى 185", { signCol: "#8a2f5c" }) + T("للحوادث والحروق", 320, 200, 28, "#8a2f5c", 800) + tag("حكومي", 320, 130, at(u, .2, .4), 40, OLIVE) + check(450, 120, 1.1, at(u, .5, .4), OLIVE); });
// 10 · the three ways, each number on its own card (from the committee's official post)
function payCard(y, k, head, col, big, small) { k = pop(k); if (k <= 0) return ""; return G("translate(320 " + f(y) + ") scale(" + f(k) + ")", R(-280, -70, 560, 140, "#f4ecdb", 2.4, 10) + R(-280, -70, 150, 140, col, 2.4, 10) + T(head, -205, 8, 22, "#fff", 900) + N(big, 70, -2, big.length > 12 ? 30 : 40, INK) + T(small, 70, 44, 17, MUTE, 700)); }
function payCards(u, n) { return paper() + payCard(180, n > 0 ? 1 : 0, "فودافون كاش", "#c93c2a", "*9*155#", "من موبايلك") + payCard(360, n > 1 ? 1 : 0, "فوري", "#e2a33a", "لجنة زكاة 185", "ابحث عن: القصر العيني") + payCard(540, n > 2 ? 1 : 0, "إنستاباي", "#5b3c8f", "01115010062322", "بنك القاهرة · لجنة زكاة مستشفى 185"); }
shot(10, still(320, 393, 1), function (u, d, t) { return payCards(u, 1); });
shot([10, 1], still(320, 393, 1), function (u, d, t) { return payCards(u, 2); });
shot([10, 2], still(320, 393, 1), function (u, d, t) { return payCards(u, 3); });
shot([10, 3], fly([320, 393, 1], [320, 393, .92], 1.6), function (u, d, t) { return payCards(u, 3) + T("بنك مصر: 1430001000008742", 320, 680, 22, INK, 800); });
// 11 · «تاني مكان: مستشفى أهل مصر للحروق… بيعالج الحروق ببلاش.»
shot(11, still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "مستشفى أهل مصر لعلاج الحروق", "أهل مصر", { signCol: "#3f8aa8" }); });
shot([11, 1], still(320, 400, 1), function (u, d, t) { return paper() + floorL(640) + hospital(320, 640, "مستشفى أهل مصر لعلاج الحروق", "أهل مصر", { signCol: "#3f8aa8" }) + tag("ببلاش", 320, 130, at(u, .1, .4), 44, OLIVE); });
// 12 · «كلمهم على الخط الساخن…»: 16863 · «ومندوب يوصلك لحد باب البيت.»: the courier at your door
shot(12, still(320, 400, 1), function (u, d, t) { var s = paper(); s += handPhone(320, 440, 1.2, '<rect x="-60" y="-104" width="120" height="212" fill="#dfe7e2"/>' + N("16863", 0, -30, 30, INK) + T("أهل مصر", 0, 0, 14, "#3f8aa8", 800) + C(0, 60, 22 + 2 * Math.sin(t * 8), GREEN, 2), t); return s + numBox("16863", 320, 150, at(u, .2, .4), 46, true); });
function door(x, y) { return R(x - 80, y - 260, 160, 260, "#a9784d", 2.6) + R(x - 64, y - 244, 128, 110, "#b98a5e", 1.6) + R(x - 64, y - 120, 128, 110, "#b98a5e", 1.6) + C(x + 58, y - 130, 7, "#e2b93a", 1.6) + R(x - 100, y - 280, 200, 20, "#c6c3bb", 2); }
shot([12, 1], still(330, 410, 1), function (u, d, t) {
  var w = PERSON.walkPose(t * 5, clamp(1 - u / 1.2)), po = { x: lerp(560, 400, ease(clamp(u / 1.2))), s: .95, dir: -1, legs: w.legs, arms: [{ sh: 40, el: 60, hand: "fist" }, w.arms[1]], face: { eyes: blink(t), mouth: "smile" }, outfit: { base: "casual", colors: { shirt: "#3f8aa8", shirtD: "#2f6a84" } } }; po.y = PERSON.sideHipY(po, 640);
  return paper() + floorL(640) + R(-200, 280, 400, 360, "#e9e3d4", 2.4) + door(180, 640) + ps(po) + R(po.x - 70, 520, 56, 40, "#c9a77c", 2, 4) + tag("لحد باب البيت", 320, 170, at(u, .6, .4), 30, "#3f8aa8");
});
// 13 · «وأي مبلغ… حتى لو صغير… بيفرق.»: one small coin drops into a jar that fills
shot(13, still(320, 420, 1), function (u, d, t) {
  var k = clamp(u / 2.4), s = paper() + floorL(640) + P("M200 300 L200 600 Q200 640 240 640 L400 640 Q440 640 440 600 L440 300 Z", "#d7e6ec", 3) + R(190, 280, 260, 26, "#c6c3bb", 2.4, 6);
  for (var i = 0; i < Math.floor(k * 24); i++) s += '<ellipse cx="' + f(240 + (i % 5) * 40) + '" cy="' + f(620 - Math.floor(i / 5) * 18) + '" rx="20" ry="7" fill="#e2b93a" stroke="' + INK + '" stroke-width="1.6"/>';
  var p = (u * 1.2) % 1; s += '<ellipse cx="320" cy="' + f(160 + p * 400) + '" rx="22" ry="22" fill="#e2b93a" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - p * .5) + '"/>';
  return s + tag("بيفرق", 320, 180, at(u, 1.6, .4), 40, ORANGE);
});
// 14 · «طب والدم؟»: a blood bag
function bloodBag(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", P("M-50 -80 L50 -80 Q60 -80 60 -70 L60 60 Q60 80 40 80 L-40 80 Q-60 80 -60 60 L-60 -70 Q-60 -80 -50 -80 Z", "#b8402f", 2.6) + R(-34, -50, 68, 40, "#f4ecdb", 1.6) + T("O+", 0, -22, 18, INK, 800) + R(-6, -110, 12, 30, "#c6c3bb", 1.6)); }
shot(14, still(320, 400, 1), function (u, d, t) { return paper() + bloodBag(320, 430, 1.6) + T("؟", 480, 300, 120 * (pop(at(u, .1, .5)) || .01), ORANGE, 900); });
// 15 · «وزارة الصحة قالت إن الدم موجود ومكفّي كل المصابين…»: a full fridge of bags, a check
shot(15, still(320, 400, 1), function (u, d, t) { var s = paper() + R(120, 180, 400, 460, "#e9e3d4", 3, 8) + R(140, 200, 360, 420, "#dfe7e2", 2); for (var r = 0; r < 3; r++) { s += R(140, 330 + r * 130, 360, 8, "#8d887e", 1.4); for (var c = 0; c < 4; c++) s += bloodBag(185 + c * 90, 270 + r * 130, .5); } return s + tag("وزارة الصحة", 320, 130, at(u, .1, .4), 30, BLUE) + check(540, 160, 1.3, at(u, .6, .4), OLIVE); });
shot([15, 2], still(320, 400, 1), function (u, d, t) { var s = paper() + bloodBag(320, 420, 1.4) + tag("حملات تبرع بالدم", 320, 160, 1, 30) + cross(320, 160, 2.4, at(u, .3, .5)); return s + tag("مش محتاجين دلوقتي", 320, 640, at(u, .6, .4), 30, OLIVE); });
// 16 · «وخلي بالك من النصابين…»: two pages, a fake one ✗ and the official one ✓
function page(x, y, title, official) { var s = R(x - 120, y - 170, 240, 340, "#fff", 2.4, 10) + R(x - 120, y - 170, 240, 50, official ? "#3f6ab0" : "#8d887e", 2.4, 10) + T(title, x, y - 138, 18, "#fff", 800); for (var i = 0; i < 5; i++) s += R(x - 96, y - 90 + i * 40, 192 - (i % 2) * 50, 12, "#d6d2c6", 0, 4); if (official) s += C(x + 92, y - 145, 14, "#3f9ae0", 2) + '<path d="M' + (x + 85) + ' ' + (y - 145) + ' l5 6 l9 -11" stroke="#fff" stroke-width="3" fill="none"/>'; return s; }
shot(16, still(320, 400, 1), function (u, d, t) { return paper() + page(180, 420, "تبرع هنا!!", false) + page(460, 420, "الصفحة الرسمية", true) + cross(180, 420, 2.4, at(u, .6, .5)) + check(460, 640, 1.4, at(u, 1.4, .4), OLIVE); });
// 17 · «يعني من الآخر…»: the two hospitals side by side
function miniHosp(x, y, sign, col, line1, line2, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", R(-140, -200, 280, 400, "#f4ecdb", 2.6, 10) + R(-110, -170, 220, 50, col, 2, 6) + T(sign, 0, -136, 24, "#fff", 900) + R(-90, -100, 180, 120, "#e9e3d4", 2) + R(-70, -80, 40, 30, GLASS2, 1.4) + R(30, -80, 40, 30, GLASS2, 1.4) + R(-20, -40, 40, 60, GLASS2, 1.6) + N(line1, 0, 80, 28, INK) + T(line2, 0, 130, 18, MUTE, 700)); }
shot(17, still(320, 400, 1), function (u, d, t) { return paper() + miniHosp(170, 400, "مستشفى 185", "#8a2f5c", "*9*155#", "فودافون كاش · فوري · إنستاباي", at(u, .2, .4)) + miniHosp(470, 400, "أهل مصر", "#3f8aa8", "16863", "مندوب لحد البيت", at(u, 1.2, .4)); });

// ── the end card: a hand on the hospital's heart, quiet ──
SCENE.outro = function (svg, u, t) { return '<rect width="600" height="280" fill="' + PAPER + '"/>' + G("translate(300 150) scale(1.5)", P("M0 40 C-80 -14 -54 -80 0 -40 C54 -80 80 -14 0 40 Z", ORANGE, 3)) + '<path d="M300 100 V180 M260 140 H340" stroke="#fff" stroke-width="12" stroke-linecap="round"/>' + T("مستشفى 185", 120, 250, 22, "#8a2f5c", 900) + T("أهل مصر", 480, 250, 22, "#3f8aa8", 900); };
