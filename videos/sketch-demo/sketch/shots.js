// ── demo: the pin-tumbler lock. Every shot uses the shared helpers; nothing here is specific to the template.
function key(x, y, s, col, cuts) {
  cuts = cuts || [30, 55, 20, 60, 40]; var d = "M0 0", w = 34;
  cuts.forEach(function (c, i) { d += " L" + (i * w + 10) + " " + (-c * 0.5) + " L" + (i * w + 24) + " " + (-c * 0.5) + " L" + ((i + 1) * w) + " 0"; });
  d += " L" + (5 * w) + " 0 L" + (5 * w) + " 22 L0 22 Z";
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", P(d, col || OLIVE, 2.4) + C(5 * w + 34, 11, 30, col || OLIVE, 2.4) + C(5 * w + 44, 11, 8, PAPER, 2));
}
function pins(x, y, lift, hi) {   // five pins over a cylinder; lift[i] 0..1 raises the lower pin; hi = colour the cut line
  var s = "";
  for (var i = 0; i < 5; i++) {
    var px = x + i * 70, l = lift ? lift[i] : 0;
    s += R(px - 16, y - 210, 32, 120, "#e7dcc3", 1.5) + R(px - 13, y - 200 - l * 40, 26, 70, hi ? ORANGE : "#e4d8c0", 2.4) + R(px - 13, y - 130 - l * 40, 26, 90, INK, 2.4);
  }
  return s;
}
function body(x, y) { return R(x - 40, y - 220, 380, 330, BEIGE, 1.5) + hatch("M" + (x - 40) + " " + (y - 220) + " h380 v330 h-380 Z") + R(x - 40, y - 90, 380, 120, GREY, 1.5) + '<path d="M' + (x - 40) + ' ' + (y - 90) + ' H' + (x + 340) + '" stroke="' + BLUE + '" stroke-width="3"/>'; }

shot(3, push(320, 400, 0.9, 1.15), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), C(320, 400, 170, BEIGE, 2.4) + hatch("M150 400 a170 170 0 1 0 340 0 a170 170 0 1 0 -340 0") + C(320, 400, 120, "#c9d3d6", 2.4) + P("M300 340 h40 v40 h-12 l12 70 h-40 l12 -70 h-12 Z", PAPER, 2.4)) +
    label(370, 330, 460, 230, "الأسطوانة", BLUE, at(u, .6, .6));
});
shot([4, 1], push(320, 420, 1.1, 1.0), function (u, d, t) {
  return paper() + dim(.5, C(320, 400, 170, BEIGE, 2.4) + C(320, 400, 120, "#c9d3d6", 2.4)) + T("؟", 320, 470, 220, ORANGE, 800);
});
shot(5, pan(380, 380, 300, 400, 1.15), function (u, d, t) {
  var s = paper() + body(180, 520);
  for (var i = 0; i < 5; i++) s += appear(at(u, .15 * i, .35), pins(180 + i * 70, 520, null).replace(/<rect[^>]*>/g, function (r, k) { return r; }));
  return s + label(250, 330, 330, 230, "المسامير", OLIVE, at(u, 1, .6));
});
shot(6, push(320, 470, 0.95, 1.1), function (u, d, t) {
  var k = at(u, .3, 1.4), lift = [.6, .9, .4, 1, .7].map(function (v) { return v * k; });
  return paper() + body(180, 520) + pins(180, 520, lift, false) + sweep(120, 260, 400, 400, at(u, 1.6, .8), "r", pins(180, 520, lift, true)) + key(120, 560 + 40 * (1 - k), 1.6, OLIVE);
}, { tr: "in" });
shot(7, push(320, 420, 1, 1.12), function (u, d, t) {
  return paper() + key(140, 400, 1.6, OLIVE) + cross(330, 380, 1.6, at(u, d - 1.2, .5)) + check(500, 250, 1, at(u, d - .4, .3));
});
shot(8, push(320, 400, 1.05, 0.95), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), key(150, 520, 1.5, OLIVE)) + bigNum(count(100000, at(u, .5, 1.6)), "كلمة سر على الورق", 320, 320, at(u, .3, .4), ORANGE, 90);
}, { tr: "out" });
hud(5, 8, function (u, t) { return iconBox(560, 70, 90, '<path d="M-28 -6 h56 M-28 8 h56" stroke="' + INK + '" stroke-width="4"/>' + C(0, -24, 7, INK, 0), at(u, .3, .3)); });

window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) { return key(40, 200, 1.0, OLIVE) + G("", key(330, 420, 1.0, OLIVE, [30, 55, 30, 60, 40]), 0.35 + 0.65 * ease((t - 1.6) / .4)) + (li >= 1 ? cross(470, 420, 1.2, ease((t - LN[1].start - .6) / .4)) : ""); };
SCENE.bumper = function (u, t) { return key(26, 112, 0.42, OLIVE); };
SCENE.outro = function (svg, u, t) { return R(60, 40, 480, 200, BEIGE, 1.5) + pins(110, 200, [.6, .9, .4, 1, .7], true) + key(80, 220, 1.2, OLIVE) + callout("1", 30, 220, ease(u / .3)) + callout("2", 300, 30, ease(u / .3 - .5)) + callout("3", 570, 80, ease(u / .3 - 1)) + callout("4", 470, 250, ease(u / .3 - 1.5)); };
