// ── «حريق دائري الوراق» — shots. Part 1 (lines 0–7) tells what happened, at night (a blue-grey wash over the paper,
// the fire the only warm colour); part 2 (8–11) explains why it spread so fast; part 3 (12–23) what to do. People are the
// shared person kit (PERSON.front / PERSON.side); vehicles and the road are in draw.js. Panel world 640 × 786.
function LS(i) { return LN[i].start; }
function pf(o) { return PERSON.front(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function ps(o) { return PERSON.side(Object.assign({ outfit: "casual", breath: .5 + .5 * Math.sin(window.__t * 1.6) }, o)).svg; }
function blink(t, seed) { var p = (t + (seed || 0)) % 3.7; return p < .12 ? .05 : 1; }
function place(x, y, s, inner) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", inner); }
function placeL(x, y, s, a, inner) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ") scale(" + f(s) + ")", inner); }
var DRV = { base: "casual", colors: { shirt: "#9fb0bd", shirtD: "#7d8f9d", pants: "#4b4741", pantsD: "#38342f" } };
var RD = 560, VS = .42;   // the deck surface in side views, vehicle scale (1 m = 42 units)

// ── the night road, side view, with the traffic going left; scroll = how far the background has moved ──
function nightSky() { return paper() + '<rect x="-2000" y="-2000" width="5000" height="5000" fill="' + NIGHT + '" opacity=".62"/>'; }
function nightRoad(t, scroll, inner, k) {
  var sc = ((scroll % 520) + 520) % 520;
  return nightSky() + skyline(RD - 120, t, -700, 1400) + G("translate(" + f(-sc) + " 0)", deckSide(RD, { night: 1, lx: 120, tx: 360 })) + inner + nightWash(.35 * (k == null ? 1 : k));
}
function dayRoad(t, inner) { return paper() + deckSide(RD, { lx: 120, tx: 360 }) + inner; }
function traffic(t, o) {   // a sedan, a microbus and the tanker, side by side in the flow
  o = o || {}; return place(-150, RD, VS, sedan({ lights: 1, t: t, spin: -7, col: "#c9b28f" })) + place(70, RD, VS, microbus({ lights: 1, t: t, spin: -7 })) +
    G(o.tk || "", place(o.tx == null ? 330 : o.tx, RD, VS, tanker({ lights: 1, t: t, spin: -7, hl: o.hl || 0 })));
}
// a steering wheel in an inset, turning hard
function steering(a) { return '<circle r="62" fill="none" stroke="' + INK + '" stroke-width="16"/><circle r="62" fill="none" stroke="#5b5650" stroke-width="11"/>' + G("rotate(" + f(a) + ")", '<path d="M-60 0 L60 0 M0 0 L0 60" stroke="#5b5650" stroke-width="12"/>' + C(0, 0, 18, "#3a3631", 2)); }
// the tanker lying on its side after the crash, seen from the side: the top of the tank (manholes, walkway) faces us
function tankerLying(o) {
  o = o || {}; var s = "", TK = o.burnt ? CHAR : "#e4e1d8";
  s += '<ellipse cx="700" cy="2" rx="660" ry="12" fill="' + INK + '" opacity=".2"/>';
  s += P("M290 0 Q240 0 240 -125 Q240 -250 290 -250 L1210 -250 Q1260 -250 1260 -125 Q1260 0 1210 0 Z", TK, 2.6);
  s += '<path d="M250 -80 Q750 -60 1252 -80 L1250 -40 Q1240 -2 1210 0 L290 0 Q258 -2 252 -40 Z" fill="#bdb8ab" opacity="' + (o.burnt ? .2 : .6) + '"/>';
  for (var m = 0; m < 5; m++) { var mx = 366 + m * 202; s += '<ellipse cx="' + mx + '" cy="-125" rx="30" ry="40" fill="#9a958a" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + mx + '" cy="-125" rx="16" ry="22" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; }
  s += '<path d="M290 -40 L1210 -40 M290 -210 L1210 -210" stroke="' + INK + '" stroke-width="2.2"/>';
  if (!o.burnt) s += '<path d="M260 -132 L1256 -132" stroke="' + ORANGE + '" stroke-width="7" opacity=".0"/>';
  // the cab lying on its side, crumpled, the trailer wheels sticking out towards the barrier (drawn as dark ovals at the bottom)
  s += P("M0 0 L10 -230 L220 -240 L236 -10 Z", o.burnt ? CHAR_D : "#e9e6dd", 2.6) + P("M24 -40 L30 -200 L120 -206 L116 -44 Z", o.burnt ? "#3c3834" : GLASS2, 2) + '<path d="M40 -60 L70 -120 L58 -160" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>';
  [960, 1080, 1200].forEach(function (x) { s += '<ellipse cx="' + x + '" cy="-8" rx="46" ry="14" fill="' + TYRE + '" stroke="' + INK + '" stroke-width="2"/>'; });
  return s;
}
var TLX = 150, TLS = .42;   // where the lying tanker sits (world x of its nose) and its scale
function tankScene(t, o) { o = o || {}; return place(TLX, RD, TLS, tankerLying({ burnt: o.burnt })); }

// ── 0–1 · the hook card: the Ring Road at night over the underpass, traffic flowing ──
SCENE.intro = function (svg, t, li) {
  var sc = (t * 40) % 520, s = '<rect x="0" y="0" width="608" height="660" fill="' + PAPER + '"/>' + skyline(330, t, -60, 700);
  s += G("translate(" + f(-sc) + " 0)", deckSide(430, { night: 1, lx: 100, tx: 300, x0: -200, x1: 1300 }));
  s += place(20, 430, .36, microbus({ lights: 1, t: t, spin: -7 })) + place(250, 430, .36, sedan({ lights: 1, t: t, spin: -7, col: "#a7b4b9" })) + place(440, 430, .36, sedan({ lights: 1, t: t, spin: -7, col: "#c9b28f" }));
  s += nightWash(1);
  if (li >= 1) { var k = ease((t - LS(1)) / .5); s += label(470, 560, 540, 610, "نفق عشرة", "#efe6d2", k, 24) + tag("الطريق الدائري", 304, 300, ease((t - LS(1) - .4) / .5), 26); }
  return s + '<rect x="1" y="1" width="606" height="658" fill="none" stroke="' + INK + '" stroke-width="2"/>';
};

// ════ PART 1 · what happened (night) ════
// 2 · «وفجأة…»: the traffic, the background flowing past
shot([2, 0], still(330, 440, 1.15), function (u, d, t) { return nightRoad(t, t * 40, traffic(t)); });
// «عربية محمّلة مواد بترولية»: fly onto the tanker, the tank takes the orange, the hazard plate labelled
shot([2, 1], fly([330, 440, 1.15], [470, 450, 1.6], 1.8), function (u, d, t) {
  return nightRoad(t, t * 40, traffic(t, { hl: at(u, .2, .8) }), 1) + label(560, 470, 470, 360, "مواد بترولية", "#f7dcc4", at(u, .5, .6), 20);
});
// «السواق فقد السيطرة عليها»: the tanker sways, the steering wheel spins in an inset
shot([2, 2], still(470, 450, 1.6), function (u, d, t) {
  var sw = Math.sin(u * 5) * 2.2 * clamp(u / 1.2);
  return nightRoad(t, t * 40, traffic(t, { hl: 1, tk: "rotate(" + f(sw) + " 450 " + RD + ")" }), 1) + inset(400, 330, 66, steering(Math.sin(u * 4) * 120 * clamp(u / .8)), at(u, .2, .4));
});
// 3 · «خبطت في الحاجز الخرساني…»: along the road, the tanker from behind veers into the barrier
function crossScene(u, t, roll, x, crack) {
  var s = nightSky() + deckCross(170, RD, { crack: crack, sc: .9 });
  s += G("translate(" + f(x) + " " + RD + ") scale(.9) rotate(" + f(roll) + " 124 0)", tankerBack());
  return s + nightWash(.35);
}
shot([3, 0], still(330, 420, 1.05), function (u, d, t) { var k = clamp(u / 1.1), x = lerp(560, 310, ease(k)); return crossScene(u, t, 0, x, u > 1.1) + impact(195, RD - 60, (u - 1.1) / .5); });
// «وانقلبت.»: it rolls onto its side against the barrier
shot([3, 1], still(400, 420, 1.05), function (u, d, t) { var r = 90 * ease(clamp(u / .8)); return crossScene(u, t, r, 310, 1) + impact(470, RD - 20, (u - .75) / .5); });
// 4 · «والوقود اتدلق على الأسفلت…»: from the side, the tanker on its side; the fuel spreads both ways
function spillScene(t, k, fire, o) {
  o = o || {}; var s = nightSky() + skyline(RD - 120, t, -700, 1400) + deckSide(RD, { night: 1, lx: 120, tx: 360 });
  s += tankScene(t, o) + spill(TLX + 60, -500, RD, k * .9, t) + spill(TLX + 420, 1300, RD, k, t);
  s += nightWash(.35);
  if (fire > 0) s += glow(TLX + 300, RD - 80, 420, fire) + smoke(TLX + 300, RD - 140, 800, 400, t, fire, 14, 14) + fireRow(-500, 1300, RD, 150, t, fire, "c") + fireRow(TLX + 20, TLX + 520, RD - 105, 110, t, clamp(fire * 1.5));
  return s;
}
shot([4, 0], still(400, 430, 1.2), function (u, d, t) { return spillScene(t, at(u, .1, 2.2), 0); });
// «وفي أقل من نص دقيقة،»: a stopwatch
shot([4, 1], still(400, 430, 1.2), function (u, d, t) { return spillScene(t, .9 + .1 * clamp(u / 2), 0); });
hud([4, 1], [4, 2], function (u, t) { return stopwatch(540, 130, 54, clamp(u / 1.6)) + numBox("< 30", 540, 236, at(u, .2, .3), 22) + T("ثانية", 540, 278, 18, PAPER, 700); });
// «الطريق كله ولع.»: the fire runs out from the middle along the spill
shot([4, 2], fly([400, 430, 1.2], [400, 420, .9], 1.8), function (u, d, t) { return spillScene(t, 1, clamp(u / 1.2)); });
// 5 · «النار مسكت في العربيات اللي جنبها،»: a row of stopped cars catching one after the other (from the right)
var ROW = [[-560, "s", "#c9b28f"], [-330, "m"], [-60, "s", "#a7b4b9"], [190, "s", "#d6d0c0"], [440, "m"], [720, "s", "#9b6a5a"], [960, "s", "#b9c2c6"]];
function rowScene(t, k, o) {
  o = o || {}; var s = nightSky() + skyline(RD - 120, t, -900, 1500) + deckSide(RD, { night: 1, lx: 120, tx: 360, x0: -1000, x1: 1800 }), f2 = "";
  ROW.forEach(function (c, i) { var reach = 1 - i / (ROW.length - 1), kk = clamp((k - (1 - reach) * .85) / .15) * (o.burnt ? 0 : 1), b = o.burnt ? 1 : kk * .45;
    s += place(c[0], RD, VS, c[1] === "m" ? microbus({ burnt: b }) : sedan({ burnt: b, col: c[2] }));
    var w = c[1] === "m" ? 226 : 184;
    if (kk > 0) f2 += glow(c[0] + w / 2, RD - 60, 160, kk) + fireRow(c[0] + 10, c[0] + w - 10, RD - 30, 120, t + i, kk) + smoke(c[0] + w / 2, RD - 120, 160, 360, t + i * .7, kk, 10, 6);
    if (o.burnt) f2 += smoke(c[0] + w / 2, RD - 60, 120, 300, t + i * .7, .45, 8, 3);
  });
  return s + place(1180, RD, TLS, tankerLying({ burnt: o.burnt })) + nightWash(.35) + f2 + (o.burnt ? "" : fireRow(1180, 1800, RD, 150, t, 1));
}
shot([5, 0], still(780, 420, 1), function (u, d, t) { return rowScene(t, .15 + .3 * clamp(u / 2.2)); });
// «واحدة ورا التانية…»: the camera follows the fire to the left
shot([5, 1], fly([780, 420, 1], [80, 420, .75], 1.8), function (u, d, t) { return rowScene(t, .45 + .45 * clamp(u / 2)); });
// «أكتر من 20 عربية.»: the count
shot([5, 2], still(80, 420, .75), function (u, d, t) { return rowScene(t, .9 + .1 * clamp(u)); });
hud([5, 2], 6, function (u, t) { return tag("أكتر من", 320, 110, at(u, 0, .3), 24) + numBox(count(20, clamp(u / 1)), 320, 178, at(u, .1, .3), 44, true) + T("عربية", 320, 240, 22, PAPER, 800); });
// 6 · «ناس جوه عربياتهم…»: one car close, the smoke closing over the windows (no people shown)
shot([6, 0], still(260, 470, 1.6), function (u, d, t) { var s = nightSky() + deckSide(RD, { night: 1, lx: 520, tx: 360 }) + place(150, RD, .52, sedan({ col: "#a7b4b9", burnt: .2 })) + nightWash(.35); return s + smoke(260, RD - 70, 260, 260, t, .5 + .5 * clamp(u / 2), 6, 12) + fireRow(150, 380, RD - 20, 70, t, .6); });
// «ملحقوش ينزلوا.»: the smoke covers it, the picture goes dark and quiet
shot([6, 1], still(260, 470, 1.6), function (u, d, t) { var s = nightSky() + deckSide(RD, { night: 1, lx: 520, tx: 360 }) + place(150, RD, .52, sedan({ col: "#a7b4b9", burnt: .4 })) + nightWash(.35); return s + smoke(260, RD - 70, 300, 260, t, 1, 6, 16) + '<rect x="-500" y="-500" width="2000" height="2000" fill="' + NIGHT + '" opacity="' + f(.35 * clamp(u / 1.6)) + '"/>'; }, { tr: "fade" });
// 7 · «وفي الآخر…»: after the fire: the burnt shells in a row, thin smoke
shot([7, 0], still(220, 420, .75), function (u, d, t) { return rowScene(t, 1, { burnt: 1 }); });
// «30 روح راحت،»: the number, quiet, in ink; a mourning ribbon
function ribbon(x, y, s) { var d = "M-30 52 L0 -6 C24 -50 20 -82 0 -82 C-20 -82 -24 -50 0 -6 L30 52"; return G("translate(" + f(x) + " " + f(y) + ") scale(" + (s || 1) + ")", '<path d="' + d + '" stroke="' + INK + '" stroke-width="17" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="#3d3833" stroke-width="11" fill="none" stroke-linejoin="round"/><path d="M-6 -70 C-14 -60 -12 -40 -2 -22" stroke="#6b665e" stroke-width="2.5" fill="none"/>'); }
shot([7, 1], still(220, 420, .75), function (u, d, t) { return rowScene(t, 1, { burnt: 1 }) + '<rect x="-800" y="-800" width="2600" height="2600" fill="' + PAPER + '" opacity="' + f(.75 * at(u, 0, .6)) + '"/>' + G("", ribbon(220, 160, 1.4), at(u, .2, .5)) + bigNum("30", "روح", 220, 400, at(u, .3, .5), INK, 150); });
// «وعشرات المصابين.»: an ambulance passes under the number
function ambulance(t) { return microbus({ t: t, spin: -7 }) + '<path d="M300 -96 a26 26 0 1 0 0 1 a20 20 0 1 1 0 -1 Z" fill="#c93c2a"/>' + R(160, -132, 330, 14, "#c93c2a", 0) + R(170, -244, 60, 14, "#c93c2a", 1.4, 3); }
shot([7, 2], still(220, 420, .75), function (u, d, t) { return rowScene(t, 1, { burnt: 1 }) + '<rect x="-800" y="-800" width="2600" height="2600" fill="' + PAPER + '" opacity=".75"/>' + ribbon(220, 160, 1.4) + bigNum("30", "روح", 220, 400, 1, INK, 150) + tag("وعشرات المصابين", 220, 560, at(u, .1, .4), 34) + place(lerp(900, -300, clamp(u / 3.4)), 820, .5, ambulance(t)); });

// ════ PART 2 · why it spread so fast (day: the paper comes back) ════
// 8 · «طب إزاي النار…»: the spill and the cars again, by day, and the question
function dayRow(t, o) { o = o || {}; var s = paper() + deckSide(RD, { lx: 120, tx: 360, x0: -1000, x1: 1800 }); ROW.slice(1, 5).forEach(function (c) { s += place(c[0], RD, VS, c[1] === "m" ? microbus({}) : sedan({ col: c[2] })); }); return s + place(1180, RD, TLS, tankerLying({})) + spill(1180, -400, RD, o.spill == null ? 1 : o.spill, t); }
shot([8, 0], still(420, 420, .8), function (u, d, t) { return dayRow(t) + T("؟", 420, 260, 170 * pop(at(u, .1, .5)) || 1, ORANGE, 900); });
// «انتشرت بالسرعة دي؟»: orange arrows racing from the tanker along the road
shot([8, 1], still(420, 420, .8), function (u, d, t) { var s = dayRow(t); for (var i = 0; i < 3; i++) { var p = (u * .8 + i / 3) % 1; s += arrow(lerp(1300, -200, p) + 160, RD - 40 - i * 20, lerp(1300, -200, p), RD - 40 - i * 20, ORANGE, 6, 1); } return s + T("؟", 420, 260, 170, ORANGE, 900); });
// 9 · a cut through a puddle of fuel on the asphalt: the liquid, and the vapour rising off it
function puddle(u, t, o) {
  o = o || {}; var s = paper() + R(-200, 520, 1040, 400, ASPH, 2.4) + '<rect x="-200" y="520" width="1040" height="400" fill="url(#hatch)" opacity=".6"/>';
  for (var i = 0; i < 26; i++) s += C(-160 + hash(i) * 960, 560 + hash(i + 50) * 300, 6 + hash(i + 9) * 10, ASPH_D, 1.2);
  s += P("M40 520 Q40 470 90 470 L550 470 Q600 470 600 520 Z", FUEL, 2.4) + '<path d="M110 486 L240 486 M300 482 L420 482" stroke="#e8dcb0" stroke-width="3" stroke-linecap="round"/>';
  if (o.vap) for (var j = 0; j < 22; j++) { var p = (t * .35 + hash(j)) % 1, x = 70 + hash(j + 3) * 500 + 10 * Math.sin(t * 2 + j), y = 462 - p * 300 * o.vap; s += G("", C(x, y, 9, VAPOR, 1.6) + C(x + 9, y - 6, 6, "#6f90a8", 1.2), (1 - p) * clamp(o.vap)); }
  return s;
}
shot([9, 0], still(320, 420, 1), function (u, d, t) { return puddle(u, t) + label(320, 495, 470, 640, "الوقود", INK, at(u, .2, .6), 26); });
// «مش هو اللي بيولّع…»: a match to the liquid: ✗
shot([9, 1], still(320, 420, 1), function (u, d, t) { return puddle(u, t) + label(320, 495, 470, 640, "الوقود", INK, 1, 26) + cross(320, 500, 1.3, at(u, .3, .5)); });
// «اللي بيولّع البخار»: the vapour rises, labelled in blue; a small flame sits on the vapour, not the liquid
shot([9, 2], fly([320, 420, 1], [320, 360, 1.25], 1.8), function (u, d, t) { return puddle(u, t, { vap: at(u, 0, 1.2) }) + label(470, 300, 560, 220, "البخار", BLUE, at(u, .6, .6), 28) + flame(220, 330, 90 * at(u, 1.2, .5), t, 2) + check(320, 640, 1.2, at(u, 1.4, .4), OLIVE); });
// «اللي طالع منه.»: arrows up from the surface
shot([9, 3], still(320, 360, 1.25), function (u, d, t) { var s = puddle(u, t, { vap: 1 }) + label(470, 300, 560, 220, "البخار", BLUE, 1, 28) + flame(220, 330, 90, t, 2); for (var i = 0; i < 4; i++) s += arrow(130 + i * 120, 456, 130 + i * 120, 456 - 120 * at(u, .1 * i, .5), BLUE, 4, 1); return s; });
// 10 · «والبخار ده أتقل من الهوا…»: a balance: the vapour pan sinks, the air pan rises
function balance(k, t) {
  var a = -14 * ease(k) + Math.sin(t * 2) * .6, s = R(300, 250, 40, 380, "#a9a59c", 2.2) + P("M220 640 L420 640 L380 610 L260 610 Z", "#8d887e", 2.2);
  var lx = 320 - Math.cos(a * Math.PI / 180) * 210, ly = 250 - Math.sin(a * Math.PI / 180) * 210, rx = 320 + Math.cos(a * Math.PI / 180) * 210, ry = 250 + Math.sin(a * Math.PI / 180) * 210;
  s += G("rotate(" + f(a) + " 320 250)", R(110, 242, 420, 16, "#c6c3bb", 2.2)) + C(320, 250, 14, INK, 0);
  function pan(x, y, inner) { return '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x - 80) + ' ' + f(y + 150) + ' M' + f(x) + ' ' + f(y) + ' L' + f(x + 80) + ' ' + f(y + 150) + '" stroke="' + INK + '" stroke-width="2"/>' + P("M" + f(x - 100) + " " + f(y + 150) + " Q" + f(x) + " " + f(y + 210) + " " + f(x + 100) + " " + f(y + 150) + " Z", "#c6c3bb", 2.2) + inner; }
  var vap = "", air = ""; for (var i = 0; i < 9; i++) { vap += C(lx - 50 + (i % 3) * 50, ly + 120 - Math.floor(i / 3) * 26, 12, VAPOR, 1.6); }
  for (var j = 0; j < 4; j++) air += C(rx - 40 + (j % 2) * 80, ry + 118 - Math.floor(j / 2) * 30, 10, "#e8eef0", 1.6);
  return s + pan(lx, ly, vap) + pan(rx, ry, air) + T("البخار", lx, ly + 260, 28, BLUE, 800) + T("الهوا", rx, ry + 260, 28, INK, 800);
}
shot([10, 0], still(320, 420, 1), function (u, d, t) { return paper() + balance(0, t); });
shot([10, 1], still(320, 420, 1), function (u, d, t) { return paper() + balance(at(u, 0, .9), t) + tag("أتقل", 110, 140, at(u, .7, .4), 32, ORANGE); });
// «بيزحف على الأرض،»: by day, from the side: the vapour layer creeps from the tanker along the ground
function creepScene(t, k, o) { o = o || {}; var s = dayRow(t, {}); return s + vapor(-500, 1300, RD, 60, k, t, "r") + (o.fire ? fireRow(-500, 1300, RD, 130, t, o.fire, "r") + glow(400, RD - 60, 600, o.fire) : ""); }
shot([10, 2], still(420, 420, .8), function (u, d, t) { return creepScene(t, .2 + .5 * clamp(u / 2)); });
// «ويدخل تحت العربيات.»: fly in under a car
shot([10, 3], fly([420, 420, .8], [300, 520, 1.6], 1.8), function (u, d, t) { return creepScene(t, .7 + .3 * clamp(u / 2)) + label(330, RD - 20, 420, 430, "تحت العربية", BLUE, at(u, 1.2, .5), 22); });
// 11 · «وأول شرارة…»: the front of a car opened up: the engine, the hot exhaust manifold, the battery
var CAR2 = -60;   // the sedan in ROW[2]
function engineBay(t, hot, sp) {
  var x = CAR2, sc = VS, s = "";
  var o = function (lx, ly) { return [x + lx * sc, RD + ly * sc]; };
  var a = o(24, -88), b = o(128, -34);
  s += R(a[0], a[1], b[0] - a[0], b[1] - a[1], "#3a3631", 1.6);   // the opened hood
  s += R(o(44, -84)[0], o(44, -84)[1], 60 * sc, 40 * sc, "#8d887e", 1.4) + R(o(52, -92)[0], o(52, -92)[1], 44 * sc, 10 * sc, "#6b665e", 1.2);   // engine block and cover
  s += '<path d="M' + f(o(104, -76)[0]) + ' ' + f(o(104, -76)[1]) + ' Q' + f(o(124, -70)[0]) + ' ' + f(o(124, -70)[1]) + ' ' + f(o(120, -40)[0]) + ' ' + f(o(120, -40)[1]) + '" stroke="' + lerp3("#6b665e", ORANGE, hot) + '" stroke-width="5" fill="none"/>';   // exhaust manifold glowing
  s += R(o(28, -80)[0], o(28, -80)[1], 14 * sc, 18 * sc, "#2f2b27", 1.2) + R(o(30, -84)[0], o(30, -84)[1], 3 * sc, 4 * sc, ORANGE, 0) + R(o(37, -84)[0], o(37, -84)[1], 3 * sc, 4 * sc, INK, 0);   // battery
  if (hot > 0) s += glow(o(116, -60)[0], o(116, -60)[1], 26, hot);
  if (sp) s += spark(o(sp === 1 ? 120 : 32, sp === 1 ? -42 : -84)[0], o(sp === 1 ? 120 : 32, sp === 1 ? -42 : -84)[1], 1, t, .6);
  return s;
}
// the engine bay in a magnified circle: engine block, the exhaust manifold glowing, the battery; the vapour layer under it
function bayClose(t, hot, sp) {
  var s = R(-300, -300, 600, 600, "#d8ccae", 0) + R(-300, 40, 600, 260, ASPH, 2) + vapor(-300, 300, 40, 90, 1, t);
  s += R(-200, -150, 300, 150, "#8d887e", 3) + R(-180, -190, 240, 40, "#6b665e", 2.4) + '<path d="M-150 -110 h200 M-150 -70 h200" stroke="#6b665e" stroke-width="4"/>';
  s += '<path d="M100 -120 Q180 -110 170 -20 L170 60" stroke="' + INK + '" stroke-width="30" fill="none"/><path d="M100 -120 Q180 -110 170 -20 L170 60" stroke="' + lerp3("#6b665e", ORANGE, hot) + '" stroke-width="24" fill="none"/>';
  s += R(-270, -150, 70, 90, "#2f2b27", 2.4) + R(-262, -168, 16, 18, ORANGE, 1.6) + R(-226, -168, 16, 18, "#5b5650", 1.6) + '<path d="M-254 -168 Q-240 -230 -160 -190" stroke="#c93c2a" stroke-width="6" fill="none"/>';
  if (hot > 0) s += '<circle cx="170" cy="-40" r="70" fill="' + FIRE_I + '" opacity="' + f(.35 * hot) + '" filter="url(#soft)"/>';
  if (sp === 1) s += spark(170, 50, 1, t, 1.4); if (sp === 2) s += spark(-254, -168, 1, t, 1.4);
  return s;
}
shot([11, 0], still(300, 430, 1), function (u, d, t) { return creepScene(t, 1) + engineBay(t, 1, 0) + inset(330, 240, 170, G("scale(.56)", bayClose(t, at(u, 0, .8), u > .7 ? 1 : 0)), at(u, 0, .4)) + '<path d="M' + f(CAR2 + 50) + ' ' + f(RD - 25) + ' L240 390" stroke="' + INK + '" stroke-width="1.6"/>'; });
shot([11, 1], still(300, 430, 1), function (u, d, t) { return creepScene(t, 1) + engineBay(t, 1, 1) + inset(330, 240, 170, G("scale(.56)", bayClose(t, 1, 1)), 1) + label(450, 230, 560, 470, "موتور سخن", ORANGE, at(u, .1, .5), 24); });
shot([11, 2], still(300, 430, 1), function (u, d, t) { return creepScene(t, 1) + engineBay(t, 1, 2) + inset(330, 240, 170, G("scale(.56)", bayClose(t, 1, 2)), 1) + label(250, 175, 80, 470, "كهربا", ORANGE, at(u, .1, .5), 24); });
// «تولّع المكان كله مرة واحدة.»: fly out; the flame front runs back along the vapour to the tanker
shot([11, 3], fly([300, 430, 1], [420, 420, .8], 1.6), function (u, d, t) { return creepScene(t, 1, { fire: clamp(u / 1.4) }) + engineBay(t, 1, 1); });

// ════ PART 3 · if you are there ════
// 12 · «طب لو إنت في نفس الموقف…»: you, beside your car; smoke far behind
function youScene(t, o) {
  o = o || {}; var s = dayRoad(t, "") + smoke(900, RD - 100, 400, 420, t, .8, 18, 10) + fireRow(760, 1100, RD, 110, t, 1) + place(-760, RD, 2.17, sedan({ col: "#a7b4b9" }));
  return s + pf(Object.assign({ x: 430, y: RD - 210 * .95, s: .95, outfit: DRV, face: { eyes: blink(t), brows: "worried", mouth: "frown", look: [.6, 0] }, head: { turn: .3 } }, o.p || {}));
}
shot([12, 0], still(320, 380, 1.05), function (u, d, t) { return youScene(t); });
shot([12, 1], fly([320, 380, 1.05], [430, 220, 1.9], 1.8), function (u, d, t) { return youScene(t, { p: { face: { eyes: blink(t) * 1.15, brows: "worried", mouth: "o", look: [.8, -.1] } } }); });
shot([12, 2], still(430, 220, 1.9), function (u, d, t) { return youScene(t, { p: { face: { eyes: blink(t) * 1.15, brows: "worried", mouth: "o", look: [.8, -.1] } } }) + T("؟", 560, 170, 90 * pop(at(u, 0, .5)) || 1, ORANGE, 900); });
// 13 · «أول حاجة: سيب العربية،»: he walks away from the car (to the left), the door left open
function walkAway(u, t, o) {
  o = o || {}; var ph = t * 5.2, wp = PERSON.walkPose(ph, 1), x = (o.x0 == null ? 300 : o.x0) - u * 55;
  var po = { x: x, s: .45, dir: -1, legs: wp.legs, arms: wp.arms, face: { eyes: blink(t), brows: "worried" }, outfit: DRV }; po.y = PERSON.sideHipY(po, RD);
  var s = dayRoad(t, "") + place(330, RD, 1.03, sedan({ col: "#a7b4b9" }));
  s += smoke(900, RD - 80, 420, 460, t, .9, 26, 12) + fireRow(760, 1200, RD, 120, t, 1);
  return { s: s, p: PERSON.side(Object.assign({ outfit: DRV, breath: .5 }, po)).svg, x: x };
}
shot([13, 0], still(360, 440, 1.15), function (u, d, t) { var w = walkAway(u, t); return w.s + w.p + numBox("1", 90, 120, at(u, 0, .3), 40, true); });
// «وابعد عكس اتجاه الريح،»: wind arrows blow to the right, the smoke leans right; he walks left, into the wind
function windArrows(t, y0) { var s = ""; for (var i = 0; i < 5; i++) { var p = (t * .5 + i / 5) % 1, x = lerp(-200, 900, p), y = y0 + (i % 3) * 60; s += G("", wave(x, y, x + 140, y, t, BLUE, 5, 36, 1, 3) + arrow(x + 130, y, x + 160, y, BLUE, 3, 1), Math.sin(p * Math.PI)); } return s; }
shot([13, 1], still(260, 440, 1.15), function (u, d, t) { var w = walkAway(u + 1.5, t); return w.s + windArrows(t, 260) + w.p + tag("الريح", 440, 210, at(u, .2, .4), 26, BLUE) + arrow(w.x - 40, 360, w.x - 200, 360, OLIVE, 6, at(u, .4, .6)); });
// «مسافة كبيرة…»: fly out; a dimension line from him to the fire
shot([13, 2], fly([260, 440, 1.15], [420, 420, .62], 1.8), function (u, d, t) { var w = walkAway(u + 3.6, t); return w.s + windArrows(t, 260) + w.p + measure(w.x, RD + 90, 820, RD + 90, at(u, .6, .8), "") + tag("مسافة كبيرة", (w.x + 820) / 2, RD + 170, at(u, 1.1, .4), 30, OLIVE); });
// «لأن التانك ممكن ينفجر.»: the tanker in the fire, a warning triangle pulsing
function warn(x, y, s, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * k) + ")", P("M0 -60 L56 40 L-56 40 Z", "#e2b93a", 3) + R(-5, -30, 10, 42, INK, 0, 3) + C(0, 26, 6, INK, 0)); }
shot([13, 3], still(900, 420, .9), function (u, d, t) { var s = dayRoad(t, "") + place(700, RD, TLS, tankerLying({})) + glow(950, RD - 80, 380, 1) + smoke(950, RD - 140, 500, 420, t, 1, 20, 12) + fireRow(660, 1260, RD, 150, t, 1) + fireRow(700, 1220, RD - 105, 110, t, 1); var pu = .5 + .5 * Math.sin(u * 6); return s + '<ellipse cx="950" cy="' + (RD - 60) + '" rx="' + f(330 + 30 * pu) + '" ry="' + f(160 + 15 * pu) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="14 10" opacity="' + f(at(u, .3, .4)) + '"/>' + warn(950, 210, 1.4, at(u, .1, .5)); });
// 14 · «تاني حاجة:»: he stops at a distance and calls, the phone to his ear
function caller(t, o) {
  o = o || {}; var p = { x: 320, y: 560 - 210 * 1.05, s: 1.05, outfit: DRV, face: { eyes: blink(t), brows: "worried", mouth: o.talk ? (Math.sin(t * 9) > 0 ? "open" : "neutral") : "neutral", look: [-.2, 0] }, head: { tilt: 6 },
    arms: [{ rel: [-40, 150], hand: "relaxed" }, { to: [320 + 40, 560 - 210 * 1.05 - 128], hand: "fist", bend: 1 }] };
  return paper() + R(-400, 560, 1440, 300, "#e3d7bd", 0) + '<path d="M-400 560 H1040" stroke="' + INK + '" stroke-width="2.4"/>' + smoke(900, 520, 300, 400, t, .6, 18, 8) + pf(p) + phone(348, 560 - 210 * 1.05 - 168, .8, 12);
}
shot([14, 0], still(320, 380, 1), function (u, d, t) { return caller(t) + numBox("2", 90, 120, at(u, 0, .3), 40, true); });
// «كلّم المطافي على 180،»
shot([14, 1], still(320, 380, 1), function (u, d, t) { return caller(t, { talk: 1 }) + iconBox(140, 290, 150, place(-66, 36, .16, fireTruck({ flash: 1, t: t })), at(u, 0, .4)) + numBox("180", 140, 420, at(u, .2, .4), 52) + T("المطافي", 140, 490, 26, ORANGE, 800); });
// «والإسعاف على 123…»
shot([14, 2], still(320, 380, 1), function (u, d, t) { return caller(t, { talk: 1 }) + iconBox(140, 290, 150, place(-66, 36, .16, fireTruck({ flash: 1, t: t })), 1) + numBox("180", 140, 420, 1, 52) + T("المطافي", 140, 490, 26, ORANGE, 800) + iconBox(500, 290, 150, place(-60, 32, .22, ambulance(t)), at(u, 0, .4)) + numBox("123", 500, 420, at(u, .2, .4), 52) + T("الإسعاف", 500, 490, 26, BLUE, 800); });
// «وقول المكان بالظبط.»: a map pin on the Ring Road over the underpass
function pin(x, y, k) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", P("M0 0 C-40 -50 -44 -70 -44 -86 A44 44 0 0 1 44 -86 C44 -70 40 -50 0 0 Z", ORANGE, 3) + C(0, -86, 16, PAPER, 2.4)); }
shot([14, 3], still(320, 400, 1), function (u, d, t) { return dayRoad(t, place(-100, RD, VS, microbus({})) + place(420, RD, VS, sedan({ col: "#c9b28f" }))) + label(330, 640, 470, 700, "نفق عشرة", INK, at(u, .3, .5), 24) + pin(320, RD - 10, at(u, 0, .5)) + tag("الدائري · فوق نفق عشرة", 320, 300, at(u, .4, .4), 28); });
// 15 · «ولو فيه حد هدومه بتولّع…»: someone with flames on his back
var VIC = { base: "casual", colors: { shirt: "#c9a77c", shirtD: "#a5845c" } };
function victimStand(t, fl, o) { o = o || {}; var po = { x: 330, s: 1.05, dir: 1, legs: [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms: [{ sh: 10, el: 30, hand: "open" }, { sh: -10, el: 30, hand: "open" }], face: { eyes: blink(t) * 1.2, brows: "worried", mouth: "open" }, outfit: VIC }; po.y = PERSON.sideHipY(po, 640);
  return paper() + R(-400, 640, 1440, 300, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>' + ps(Object.assign(po, o)) + (fl > 0 ? flame(300, po.y - 60, 120 * fl, t, 1, 40) + flame(290, po.y - 10, 80 * fl, t, 4, 34) : ""); }
shot([15, 0], still(330, 420, 1), function (u, d, t) { return victimStand(t, .3 + .3 * clamp(u)); });
shot([15, 1], still(330, 420, 1), function (u, d, t) { return victimStand(t, .7); });
// «خليه يقف،»
shot([15, 2], still(330, 420, 1), function (u, d, t) { return victimStand(t, .7) + tag("قف", 520, 160, at(u, 0, .4), 40, ORANGE) + numBox("1", 140, 160, at(u, 0, .3), 34, true); });
// «وينام على الأرض،»: he lies flat on his back
function victimLying(t, fl, roll, o) { o = o || {}; var po = { x: 330 + (o.dx || 0), y: 610, s: 1.05, dir: 1, rot: -90 + (roll || 0), legs: [{ hip: 0, knee: 0 }, { hip: 0, knee: 0 }], arms: [{ sh: 6, el: 10, hand: "relaxed" }, { sh: -6, el: 10, hand: "relaxed" }], face: { eyes: blink(t), brows: "worried", mouth: "neutral" }, outfit: VIC };
  return paper() + R(-400, 640, 1440, 300, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>' + ps(po) + (fl > 0 ? flame(300, 612, 90 * fl, t, 1, 50) + flame(220, 616, 60 * fl, t, 4, 40) : ""); }
shot([15, 3], still(330, 420, 1), function (u, d, t) { return victimLying(t, .55) + tag("نام", 520, 160, at(u, 0, .4), 40, ORANGE) + numBox("2", 140, 160, at(u, 0, .3), 34, true); });
// «ويتقلّب.»: he rolls side to side, the flames get smaller
shot([15, 4], still(330, 420, 1), function (u, d, t) { return victimLying(t, .55 * (1 - clamp(u / 1.6)), 0, { dx: 30 * Math.sin(u * 5) }) + tag("اتقلّب", 520, 160, at(u, 0, .4), 40, ORANGE) + numBox("3", 140, 160, at(u, 0, .3), 34, true) + arrow(240, 560, 420, 560, ORANGE, 5, at(u, .2, .5)) + arrow(420, 520, 240, 520, ORANGE, 5, at(u, .6, .5)); });
// 16 · «وغطّيه بجاكيت قطن، أو بطانية…»: a blanket laid over him
shot([16, 0], still(330, 420, 1), function (u, d, t) { var k = at(u, .1, .9); return victimLying(t, .35 * (1 - k)) + G("translate(0 " + f(-160 * (1 - k)) + ")", blanket(120, 636, 440, 70, "#8e6a4e"), clamp(k * 3)) + label(420, 590, 540, 470, "قطن", OLIVE, at(u, .9, .5), 28); });
shot([16, 1], still(330, 420, 1), function (u, d, t) { return victimLying(t, 0) + blanket(120, 636, 440, 70, "#8e6a4e") + label(420, 590, 540, 470, "قطن", OLIVE, 1, 28) + tag("بطانية", 200, 300, at(u, .1, .4), 32); });
// «عشان النار تتخنق.»: no air for the fire: O₂ crossed out
shot([16, 2], fly([330, 420, 1], [330, 520, 1.5], 1.8), function (u, d, t) { return victimLying(t, 0) + blanket(120, 636, 440, 70, "#8e6a4e") + G("", T("الأكسجين", 330, 390, 30, BLUE, 800) + wave(240, 440, 420, 440, t, BLUE, 5, 30, 1, 3), at(u, .2, .4)) + cross(330, 440, 1, at(u, .8, .5)); });
// 17 · «والحرق… مية جارية عادية، 20 دقيقة.»: the burnt forearm under a running tap
function sinkScene(u, t, flow) {
  var p = { x: 230, y: 640 - 210, s: 1.05, outfit: { base: "casual", colors: { shirt: "#c9a77c", shirtD: "#a5845c" } }, face: { eyes: blink(t), brows: "worried", look: [.8, .4] }, head: { turn: .4, tilt: 6 },
    arms: [{ rel: [-40, 150], hand: "relaxed" }, { to: [440, 330], hand: "open", straight: true, rot: 0 }] };
  return paper() + R(380, 400, 300, 240, "#c6c3bb", 2.2) + R(370, 390, 320, 20, "#a9a59c", 2.2) + R(400, 410, 260, 60, "#8d887e", 1.6) + pf(p) + tap(470, 230, flow, t) + '<ellipse cx="448" cy="330" rx="30" ry="12" fill="#d98a6a" opacity=".55"/>';
}
shot([17, 0], still(380, 380, 1.1), function (u, d, t) { return sinkScene(u, t, 0) + label(448, 334, 560, 520, "الحرق", ORANGE, at(u, .1, .5), 26); });
shot([17, 1], still(380, 380, 1.1), function (u, d, t) { return sinkScene(u, t, at(u, 0, .4)) + label(458, 380, 560, 520, "مية عادية", BLUE, at(u, .3, .5), 26); });
shot([17, 2], still(380, 380, 1.1), function (u, d, t) { return sinkScene(u, t, 1) + stopwatch(170, 150, 60, clamp(u / 1.8)) + numBox("20", 170, 264, at(u, .1, .3), 34) + T("دقيقة", 170, 310, 22, INK, 800); });
// 18 · the myth: toothpaste and ice
shot([18, 0], still(320, 400, 1), function (u, d, t) { return paper() + tag("ناس كتير فاكرة…", 320, 200, at(u, 0, .4), 32); });
shot([18, 1], still(320, 400, 1), function (u, d, t) { return paper() + G("", toothpaste(190, 400, 1.4), at(u, 0, .4)) + G("", iceCube(470, 400, 64), at(u, .5, .4)) + T("معجون السنان", 190, 520, 26, INK, 800) + T("التلج", 470, 520, 26, BLUE, 800); });
shot([18, 2], still(320, 400, 1), function (u, d, t) { return paper() + toothpaste(190, 400, 1.4) + iceCube(470, 400, 64) + T("معجون السنان", 190, 520, 26, INK, 800) + T("التلج", 470, 520, 26, BLUE, 800); });
shot([18, 3], still(320, 400, 1), function (u, d, t) { return paper() + toothpaste(190, 400, 1.4) + iceCube(470, 400, 64) + T("معجون السنان", 190, 520, 26, INK, 800) + T("التلج", 470, 520, 26, BLUE, 800) + cross(190, 400, 2.2, at(u, .1, .5)) + cross(470, 400, 2.2, at(u, .4, .5)) + tag("لأ", 320, 640, at(u, 0, .3), 44, ORANGE); });
// 19 · «ومتشدّش هدوم لازقة في الجلد…»: a forearm with the cloth stuck to the burn
function forearm(o) { o = o || {}; var sk = PERSON.colors.skin || "#e0b294", s = P("M-80 420 L-80 540 C120 500 300 470 470 452 L466 392 C300 400 120 416 -80 420 Z", "#c9a77c", 0) + P("M-60 444 C120 424 300 404 470 392 Q486 420 470 452 C300 466 120 494 -60 520 Z", sk, 2.4) + PERSON.hand([476, 422], -0.08, "relaxed", 1, 2.6, PERSON.colors) + P("M-80 420 C-40 418 -30 430 -20 440 L-24 526 C-40 530 -60 536 -80 540 Z", "#c9a77c", 2.4);
  s += '<ellipse cx="260" cy="440" rx="80" ry="26" fill="#d98a6a" opacity=".6"/>';
  if (o.stuck) s += P("M200 418 L320 404 L330 452 Q260 470 206 466 Z", "#c9a77c", 2) + '<path d="M210 430 L300 420" stroke="#a5845c" stroke-width="2"/>';
  if (o.cloth) s += G("translate(0 " + f(-120 * (1 - o.cloth)) + ")", P("M150 400 L380 380 Q392 430 380 470 L156 492 Q140 450 150 400 Z", "#f4f2ec", 2.2) + '<path d="M170 420 L360 404 M168 450 L366 436" stroke="#d6d2c6" stroke-width="2"/>', clamp(o.cloth * 3));
  return s; }
shot([19, 0], still(250, 420, 1), function (u, d, t) { var pull = Math.max(0, Math.sin(u * 4)) * 14 * at(u, .3, .3); return paper() + forearm({ stuck: 1 }) + arrow(330, 400, 420, 300, ORANGE, 6, at(u, .2, .4)) + cross(380, 330, 1.2, at(u, .8, .5)); });
shot([19, 1], still(250, 420, 1), function (u, d, t) { return paper() + forearm({ stuck: 1 }) + label(270, 430, 400, 260, "لازقة في الجلد", ORANGE, at(u, 0, .5), 26) + cross(380, 330, 1.2, 1); });
// «غطّيه بقماشة نضيفة،»
shot([19, 2], still(250, 420, 1), function (u, d, t) { return paper() + forearm({ stuck: 1, cloth: at(u, 0, .8) }) + label(280, 400, 420, 260, "قماشة نضيفة", OLIVE, at(u, .7, .5), 26) + check(110, 300, 1.4, at(u, .9, .4), OLIVE); });
// «لحد ما الإسعاف يوصل.»: the ambulance arrives
shot([19, 3], still(320, 420, 1), function (u, d, t) { return dayRoad(t, place(lerp(900, 120, ease(clamp(u / 2))), RD, .62, ambulance(t))); });
// 20 · «ولو الدخان حواليك…»: smoke fills from the top; «وطّي على الأرض،»: he moves bent low; «الهوا النضيف تحت.»
function smokeRoom(t, k, o) {
  o = o || {}; var s = paper() + R(-400, 640, 1440, 300, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  var low = o.low || 0, wp = PERSON.walkPose(t * 3.4, .7);
  var po = { x: 300, s: 1.05, dir: -1, lean: 55 * low, legs: wp.legs.map(function (L) { return { hip: L.hip + 55 * low, knee: L.knee + 70 * low, ankle: (L.ankle || 0) - 15 * low }; }), arms: low ? [{ sh: -45, el: 30, hand: "relaxed" }, { sh: -35, el: 25, hand: "relaxed" }] : wp.arms, face: { eyes: blink(t) * .8, brows: "worried", mouth: "neutral" }, head: { tilt: -30 * low }, outfit: DRV };
  po.y = PERSON.sideHipY(po, 640); s += ps(po);
  var top = lerp(-100, 400 + 60 * low, clamp(k)), d = "M-400 -400 L1040 -400 L1040 " + f(top);
  for (var x = 1040; x >= -400; x -= 40) d += " L" + x + " " + f(top + 16 * Math.sin(x * .05 + t * 1.6));
  s += '<path d="' + d + ' Z" fill="' + SMOKE + '" opacity=".78" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 8; i++) s += '<circle cx="' + f(-300 + i * 180 + 20 * Math.sin(t + i)) + '" cy="' + f(top - 30) + '" r="46" fill="' + SMOKE + '" opacity=".6"/>';
  if (o.air) s += '<rect x="-400" y="' + f(top + 40) + '" width="1440" height="' + f(640 - top - 40) + '" fill="' + VAPOR + '" opacity="' + f(.12 * o.air) + '"/>' + tag("الهوا النضيف", 320, 600, o.air, 30, BLUE) + arrow(560, 600, 560, 510, BLUE, 5, o.air);
  return s;
}
shot([20, 0], still(320, 420, 1), function (u, d, t) { return smokeRoom(t, .2 + .5 * clamp(u / 2), { walk: 1 }); });
shot([20, 1], still(320, 420, 1), function (u, d, t) { return smokeRoom(t, .7, { low: at(u, 0, .8), walk: 1 }); });
shot([20, 2], still(320, 470, 1.1), function (u, d, t) { return smokeRoom(t, .7, { low: 1, air: at(u, .1, .5), walk: 1 }); });
// 21 · «والموبايل… ليه لازمة واحدة بس، إنك تتصل.»
function bigPhone(u, t, call) { var s = paper() + R(200, 140, 240, 470, "#2f2b27", 3, 30) + R(218, 176, 204, 380, call ? "#dfe7e2" : "#9fb3bd", 2, 8) + R(290, 156, 60, 8, "#5b5650", 0, 4);
  if (call) { s += N("180", 320, 300, 54, INK) + T("المطافي", 320, 340, 22, ORANGE, 800) + C(320, 470, 40 + 3 * Math.sin(t * 8), "#5e8a4e", 2.4) + G("translate(320 470) rotate(-30)", P("M-18 -8 Q-20 -20 -10 -22 L-4 -12 Q-8 -6 -6 0 Q-2 8 6 6 Q12 4 14 10 L18 18 Q10 26 0 22 Q-16 14 -18 -8 Z", "#fff", 1.6)); for (var i = 0; i < 3; i++) { var p = (t * 1.4 + i / 3) % 1; s += '<circle cx="320" cy="470" r="' + f(40 + p * 70) + '" fill="none" stroke="#5e8a4e" stroke-width="3" opacity="' + f(1 - p) + '"/>'; } }
  return s; }
shot([21, 0], still(320, 400, 1), function (u, d, t) { return bigPhone(u, t, 0); });
shot([21, 2], still(320, 400, 1), function (u, d, t) { return bigPhone(u, t, 0) + numBox("1", 520, 200, at(u, 0, .3), 52, true) + T("لازمة واحدة", 520, 280, 24, INK, 800); });
shot([21, 3], still(320, 400, 1), function (u, d, t) { return bigPhone(u, t, 1) + check(520, 470, 1.4, at(u, .3, .4), OLIVE); });
// 22 · «مش إنك تقف تصوّر…»: a crowd filming with their phones held up
var CROWD = [[110, { base: "casual", colors: { shirt: "#7f97a6", shirtD: "#61798a" } }, -1], [320, "womanCasual", 1], [530, { base: "office", colors: { shirt: "#e8eef3", shirtD: "#bccbd6" } }, -1]];
function crowd(t, o) {
  o = o || {}; var s = "";
  CROWD.forEach(function (c, i) { var x = c[0] + (o.part ? (i === 1 ? 0 : (i === 0 ? -1 : 1) * 260 * o.part) : 0), y = 640 - 210 * .9, hy = y - 196 * .9;
    s += pf({ x: x, y: y, s: .9, outfit: c[1], face: { eyes: blink(t, i), brows: "neutral", look: [0, -.4] }, head: { tilt: 0 }, arms: [{ to: [x - 14, hy - 40], hand: "fist", bend: -1 }, { to: [x + 14, hy - 40], hand: "fist", bend: 1 }] }) + phone(x, hy - 60, 1, 0, o.rec ? "#d9d4c8" : "#9fb3bd") + (o.rec ? C(x + 8, hy - 76, 4, "#c93c2a", 0) : ""); });
  return s;
}
shot([22, 0], still(320, 420, 1), function (u, d, t) { return paper() + R(-400, 640, 1440, 300, "#e3d7bd", 0) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>' + smoke(320, 280, 600, 300, t, .5, 10, 8) + crowd(t, { rec: Math.floor(t * 2) % 2 }) + cross(320, 260, 2.2, at(u, .5, .5)); });
// «وتسد السكة على عربية مطافي،»: the fire engine stuck behind them, its light flashing
function roadCrowd(t, part, o) { o = o || {}; var s = paper() + R(-400, 640, 1440, 300, ASPH, 2.4) + '<path d="M-400 640 H1040" stroke="' + INK + '" stroke-width="2.4"/>';
  s += place(o.tx == null ? 700 : o.tx, 640, .56, fireTruck({ flash: 1, t: t })) + crowd(t, { part: part }); return s; }
shot([22, 1], still(420, 440, .9), function (u, d, t) { return roadCrowd(t, 0) + tag("السكة مقفولة", 420, 160, at(u, .1, .4), 30, ORANGE); });
shot([22, 2], fly([420, 440, .9], [760, 470, 1.3], 1.8), function (u, d, t) { return roadCrowd(t, 0) + label(820, 520, 960, 330, "عربية مطافي", ORANGE, at(u, 1, .5), 22); });
// «ممكن تلحق حد.»: they step aside, the engine goes through
shot([22, 3], fly([760, 470, 1.3], [420, 440, .9], 1.8), function (u, d, t) { var k = at(u, .2, 1); return roadCrowd(t, k, { tx: lerp(700, 120, at(u, 1, 1.6)) }) + check(420, 200, 1.6, at(u, 1.4, .4), OLIVE); });
// 23 · «يعني من الآخر… ابعد، اتصل، غطّي، وبرّد بالمية.»: four chips
function chip(x, y, k, n, word, icon) { k = pop(k); if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(k) + ")", R(-120, -130, 240, 260, "#f4ecdb", 2.4) + icon + callout(n, -96, -104, 1, 18) + T(word, 0, 108, 34, INK, 900)); }
function steps4w(u, t, lit) {
  var w = PERSON.walkPose(t * 5, 1), wi = { x: 0, s: .38, dir: -1, legs: w.legs, arms: w.arms, outfit: DRV }; wi.y = PERSON.sideHipY(wi, 60);
  return paper() + chip(180, 230, lit > 0 ? 1 : 0, "1", "ابعد", ps(wi) + arrow(-40, -60, -100, -60, OLIVE, 5, 1)) + chip(460, 230, lit > 1 ? 1 : 0, "2", "اتصل", phone(0, -20, 1.6, 10) + N("180", 0, 50, 26, ORANGE)) +
    chip(180, 540, lit > 2 ? 1 : 0, "3", "غطّي", blanket(-90, 40, 180, 90, "#8e6a4e")) + chip(460, 540, lit > 3 ? 1 : 0, "4", "برّد", place(30, 60, .55, tap(0, 0, 1, t)));
}
shot([23, 0], still(320, 400, 1), function (u, d, t) { return steps4w(u, t, 0) + T("يعني من الآخر…", 320, 400, 40, INK, 900); });
shot([23, 1], still(320, 400, 1), function (u, d, t) { return steps4w(u, t, u < .6 ? 1 : 2); });
shot([23, 2], still(320, 400, 1), function (u, d, t) { return steps4w(u, t, u < .6 ? 3 : 4); });

// ── the end card: the Ring Road at dusk, quiet, a mourning ribbon ──
SCENE.outro = function (svg, u, t) {
  var s = '<rect width="600" height="280" fill="' + PAPER + '"/>' + skyline(170, t, -20, 640) + G("translate(0 0)", deckSide(200, { night: 1, lx: 160, tx: 200, x0: -20, x1: 640 }));
  return s + nightWash(.8) + ribbon(70, 90, 1);
};
function stopwatch(x, y, r, k) { return C(x, y, r, PAPER, 3) + R(x - 9, y - r - 16, 18, 12, INK, 0) + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.sin(k * 6.283) * r * .8) + ' ' + f(y - Math.cos(k * 6.283) * r * .8) + '" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round"/>' + '<path d="M' + f(x) + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 ' + (k > .5 ? 1 : 0) + ' 1 ' + f(x + Math.sin(k * 6.283) * r) + ' ' + f(y - Math.cos(k * 6.283) * r) + '" stroke="' + ORANGE + '" stroke-width="6" fill="none"/>' + C(x, y, 5, ORANGE, 0); }
function impact(x, y, k, col) { k = clamp(k); if (k <= 0 || k >= 1) return ""; var r = 20 + 50 * k, s = ""; for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5; s += '<path d="M' + f(x + Math.cos(a) * r * .5) + ' ' + f(y + Math.sin(a) * r * .5) + ' L' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + '" stroke="' + (col || ORANGE) + '" stroke-width="6" stroke-linecap="round"/>'; } return G("", s, 1 - k); }
