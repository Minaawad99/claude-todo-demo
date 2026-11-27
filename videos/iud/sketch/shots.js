// ── «اللولب بيمنع الحمل إزاي؟» — shots. Drawings in draw.js (IU.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing for several lines, then flies (eased, ~1.8 s)
// onto the part being talked about, and later back out. The life is in the drawing: sperm swim, ions drift, cells creep.
var _label = label; label = function () { return _label.apply(null, arguments).replace(/<text /g, '<text paint-order="stroke" stroke="#f4ecdb" stroke-width="4" stroke-linejoin="round" '); };   // labels on pink tissue get a paper halo so they read
var UX = 320, UY = 200, US = .95;                                  // the uterus in the panel
function L2P(p) { return [UX + p[0] * US, UY + p[1] * US]; }       // local uterus units → panel
var U = [320, 393, 1], CAV = [320, 300, 1.75], COIL = [320, 300, 2.3], CERV = [320, 500, 2.3], TUBE = [120, 220, 2.1], MID = [320, 330, 1.4];
var WOMAN = { base: "woman" }, DOC = "doctor";
function U1(o) { return IU.uterus(UX, UY, US, o); }
function chip(txt, x, y, col, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = txt.length * sz * .62 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="' + f(-sz * .95) + '" width="' + f(w) + '" height="' + f(sz * 1.8) + '" rx="8" fill="' + col + '"/>' + T(txt, 0, sz * .4, sz, "#fbf8f1", 800)); }
function cAt(li, ci) { var l = LN[li], c = window.CHUNKS[li]; return l.start + (l.end - l.start) * (c[ci] || 0); }   // page time of a caption chunk
function blink(t, ph) { return Math.sin(t * 2.3 + (ph || 0)) > .97 ? .08 : 1; }
function woman(x, y, s, face, t, extra) { return PERSON.front(Object.assign({ x: x, y: y, s: s, outfit: "woman", breath: .5 + .5 * Math.sin(t * 1.6), head: { tilt: 3 * Math.sin(t * .9) }, face: Object.assign({ eyes: blink(t) }, face || {}) }, extra || {})).svg; }
function doctor(x, y, s, face, t, extra) { return PERSON.front(Object.assign({ x: x, y: y, s: s, outfit: DOC, breath: .5 + .5 * Math.sin(t * 1.5 + 1), head: { tilt: -3 * Math.sin(t * .8) }, face: Object.assign({ eyes: blink(t, 2) }, face || {}) }, extra || {})).svg; }
// a group of sperm swimming along the route, from k0 to k1 (0 = vagina, 1 = the egg); stop: where they can't pass (0..1)
function swarm(n, k, t, o) {
  o = o || {}; var s = "";
  for (var i = 0; i < n; i++) {
    var kk = k - i * .045 - hash(i + 2) * .03; if (o.stop != null) kk = Math.min(kk, o.stop - hash(i + 7) * .05); if (kk <= 0) continue;
    var p = IU.routeAt(kk), off = (hash(i + 11) - .5) * (o.spread || 26), bob = 3 * Math.sin(t * 3 + i);
    s += IU.sperm(p[0] + Math.cos(p[2] + 1.57) * off, p[1] + Math.sin(p[2] + 1.57) * off + bob, p[2] + .25 * Math.sin(t * 2 + i), 1, i, { slow: o.slow == null ? 1 : o.slow, dead: o.dead && hash(i + 30) < o.dead ? 1 : 0 });
  }
  return s;
}
function routeLine(k, col) { return '<path d="' + IU.routeD(k) + '" stroke="' + (col || ORANGE) + '" stroke-width="3" stroke-dasharray="8 7" fill="none"/>'; }
function eggAt(k) { return IU.egg(IU.EGG[0], IU.EGG[1], 13, k); }

// 4 · «اللولب نوعين: نحاسي، وهرموني.» — the two real devices side by side (copper on the right: it is read first)
shot(4, still(320, 360, 1), function (u, d, t) {
  return paper() + appear(at(u, 0, .5), IU.device(450, 160, 1.15, "copper", { glow: .4 })) + appear(at(u, .3, .5), IU.device(190, 160, 1.15, "hormonal"));
});
shot([4, 1], still(320, 360, 1), function (u, d, t) {
  return paper() + IU.device(450, 160, 1.15, "copper", { glow: .6 }) + IU.device(190, 160, 1.15, "hormonal") + chip("نحاسي", 450, 110, ORANGE, at(u, 0, .3)) + chip("هرموني", 190, 110, OLIVE, at(u, .5, .3));
});
// 5 · a small rule first: the uterus draws itself in
shot(5, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + appear(at(u, 0, 1.2), U1({})); });
shot([5, 2], still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({}) + tag("قاعدة", 320, 90, at(u, 0, .3), 26, ORANGE); });
// 6 · the path: sperm come up through the cervix, across the uterus, into the tube to meet the egg
shot(6, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: swarm(6, .05 + .1 * at(u, 0, d), t) }); });
shot([6, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ hl: "cervix", over: routeLine(.35 * at(u, 0, d)) + swarm(6, .17 + .18 * at(u, 0, d), t) }) + label(306, 500, 160, 470, "عنق الرحم", BLUE, at(u, .1, .5), 22);
});
shot([6, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ hl: "cavity", over: routeLine(.35 + .3 * at(u, 0, d)) + swarm(6, .38 + .3 * at(u, 0, d), t) }) + label(400, 280, 560, 330, "الرحم", BLUE, at(u, .1, .5), 22);
});
shot([6, 3], fly(U, TUBE, 1.8), function (u, d, t) {
  return paper() + U1({ over: routeLine(.65 + .3 * at(u, 0, d)) + swarm(6, .68 + .28 * at(u, 0, d), t) + eggAt(at(u, .3, .6)) });
});
shot([6, 4], still(TUBE[0], TUBE[1], TUBE[2]), function (u, d, t) {
  return paper() + U1({ hl: "tube", over: routeLine(.97) + swarm(6, .97, t, { spread: 14 }) + eggAt(1) }) + label(74, 194, 150, 120, "البويضة", OLIVE, at(u, 0, .5), 15) + label(170, 208, 200, 290, "قناة فالوب", OLIVE, at(u, .4, .5), 15);
});
// 7 · if it doesn't get there — no pregnancy
shot(7, fly(TUBE, U, 1.6), function (u, d, t) {
  var p = L2P([0, 330]); return paper() + U1({ over: routeLine(1, "#9a9086") + eggAt(1) }) + cross(p[0], p[1], .9, at(u, .6, .5));
});
shot([7, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  var p = L2P([0, 330]); return paper() + U1({ over: routeLine(1, "#9a9086") + eggAt(1) }) + cross(p[0], p[1], .9, 1) + chip("مفيش حمل", 320, 90, ORANGE, at(u, 0, .3), 26);
});
// 8 · the copper one: its wire gives off copper ions, toxic to sperm
shot(8, still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.2); return paper() + U1({ over: '<g transform="translate(0 ' + f(260 * (1 - k)) + ')" opacity="' + f(k) + '">' + IU.inUterus("copper") + '</g>' }) + chip("نحاسي", 320, 90, ORANGE, at(u, .3, .3), 24);
});
shot([8, 1], fly(U, COIL, 1.8), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, at(u, .4, 1), t), over: IU.inUterus("copper", { glow: at(u, .3, 1) }) }) + G("", label(326, 330, 360, 410, "أيونات نحاس", ORANGE, at(u, 1.6, .5), 12), 1);
});
shot([8, 2], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .45 + .1 * at(u, 0, d), t, { spread: 50 }), over: IU.inUterus("copper", { glow: 1 }) }) + label(326, 330, 360, 410, "أيونات نحاس", ORANGE, 1, 12) + chip("سامة", 250, 430, ORANGE, at(u, .4, .3), 14);
});
// 9 · they slow down… and die before they get there
shot(9, still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .55 + .02 * at(u, 0, d), t, { spread: 50, slow: 1 - .8 * at(u, 0, d) }), over: IU.inUterus("copper", { glow: 1 }) });
});
shot([9, 1], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 26, 120, 1, t) + swarm(5, .57, t, { spread: 50, slow: .2, dead: at(u, .1, .6) * 1.01 }), over: IU.inUterus("copper", { glow: 1 }) }) + cross(250, 330, .5, at(u, .7, .4));
});
// 10 · the uterus takes it for a foreign body and sends white blood cells that attack any sperm that comes in
var WB = [[-70, 70], [60, 60], [-40, 150], [40, 160], [-90, 40], [90, 40], [0, 220]];
function cells(k, t, toward) { var s = ""; WB.forEach(function (p, i) { var kk = clamp(k * 1.6 - i * .1), x = p[0] * (1.5 - .5 * kk), y = p[1]; if (toward) { x = lerp(x, toward[i % toward.length][0], toward.k * .55); y = lerp(y, toward[i % toward.length][1], toward.k * .55); } s += IU.wbc(x + 3 * Math.sin(t * 1.2 + i), y + 3 * Math.cos(t + i), 15, i, kk); }); return s; }
shot(10, fly(COIL, MID, 1.8), function (u, d, t) { return paper() + U1({ hl: "cavity", over: IU.inUterus("copper", { glow: .5 }) }); });
shot([10, 1], still(MID[0], MID[1], MID[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper", { glow: .5 }) }) + tag("جسم غريب", 320, 170, at(u, 0, .3), 18, INK) + arrow(320, 190, 320, 230, INK, 3, at(u, .2, .3)); });
shot([10, 2], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  return paper() + U1({ inner: cells(at(u, 0, d), t), over: IU.inUterus("copper", { glow: .5 }) }) + label(250, 270, 150, 210, "كرات دم بيضا", BLUE, at(u, .4, .5), 16);
});
shot([10, 3], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  var tw = [[-30, 120], [30, 150], [-10, 180]]; tw.k = at(u, 0, d);
  var sp = IU.sperm(-30, 120, 1.2, 1, 1, { dead: tw.k > .7 ? 1 : 0 }) + IU.sperm(30, 150, 2, 1, 2, { dead: tw.k > .8 ? 1 : 0 }) + IU.sperm(-10, 180, 1.6, 1, 3, { dead: tw.k > .9 ? 1 : 0 });
  return paper() + U1({ inner: sp + cells(1, t, tw), over: IU.inUterus("copper", { glow: .5 }) }) + label(250, 270, 150, 210, "كرات دم بيضا", BLUE, 1, 16);
});
// 11 · like a building's doorman: any stranger is turned back at the door
function guard(t, k) {
  return PERSON.front({ x: 300, y: 430, s: .9, outfit: { base: "casual", hat: "cap", colors: { shirt: "#4a6f8a", shirtD: "#38566c", pants: "#3c3f47", pantsD: "#2c2e35", hat: "#2f3c4c" } }, breath: .5 + .5 * Math.sin(t * 1.6),
    arms: [{ rel: [-40, 60], hand: "relaxed" }, { rel: [lerp(30, 140, k), lerp(70, -30, k)], straight: k > .5, hand: "open", palm: true, rot: -90 * k }], head: { turn: .3 * k }, face: { brows: k > .5 ? "angry" : "neutral", mouth: k > .5 ? "open" : "neutral", eyes: blink(t), look: [k, 0] } }).svg;
}
function stranger(x, t, back) { return IU.sperm(x, 470 + 6 * Math.sin(t * 3), back ? 0 : Math.PI, 4.2, 0) ; }
shot(11, still(320, 393, 1), function (u, d, t) {
  return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, 0) + tag("البواب", 300, 150, at(u, .2, .3), 22, OLIVE);
});
shot([11, 1], still(320, 393, 1), function (u, d, t) {
  var k = at(u, 0, d); return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, at(u, .1, .5)) + stranger(lerp(700, 560, k), t, false) + tag("البواب", 300, 150, 1, 22, OLIVE);
});
shot([11, 2], still(320, 393, 1), function (u, d, t) {
  var k = at(u, 0, d); return paper() + IU.door(170, 520, 1.6) + '<path d="M0 616 H640" stroke="' + INK + '" stroke-width="2.4"/>' + guard(t, 1) + stranger(lerp(560, 720, k), t, true) + arrow(520, 400, 620, 400, ORANGE, 5, at(u, .1, .4)) + cross(470, 300, .8, at(u, .2, .4)) + tag("البواب", 300, 150, 1, 22, OLIVE);
});
// 12 · the hormonal one releases a hormone, levonorgestrel, in tiny amounts
shot(12, still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.1); return paper() + U1({ over: '<g transform="translate(0 ' + f(260 * (1 - k)) + ')" opacity="' + f(k) + '">' + IU.inUterus("hormonal") + '</g>' }) + chip("هرموني", 320, 90, OLIVE, at(u, .3, .3), 24);
});
shot([12, 1], fly(U, COIL, 1.8), function (u, d, t) { return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, at(u, .3, 1), t), over: IU.inUterus("hormonal", { glow: at(u, .2, 1) }) }); });
shot([12, 2], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) }) + label(314, 330, 296, 420, "ليفونورجيستريل", OLIVE, at(u, 0, .5), 12);
});
shot([12, 3], still(COIL[0], COIL[1], COIL[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.hormone(0, 120, 22, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) }) + label(314, 330, 296, 420, "ليفونورجيستريل", OLIVE, 1, 12) + chip("كميات صغيرة جدًا", 320, 450, OLIVE, at(u, 0, .3), 11);
});
// 13 · the hormone makes the cervical mucus thick like jelly, so sperm can't get through
shot(13, fly(COIL, CERV, 1.8), function (u, d, t) { return paper() + U1({ mucus: .15, over: IU.inUterus("hormonal") }); });
shot([13, 1], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: .15 + .85 * at(u, 0, d), hl: "cervix", over: IU.inUterus("hormonal") }) + label(314, 520, 290, 440, "إفرازات عنق الرحم", BLUE, at(u, .2, .5), 10);
});
shot([13, 2], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, over: IU.inUterus("hormonal") }) + label(314, 520, 290, 440, "إفرازات عنق الرحم", BLUE, 1, 10) + iconBox(400, 560, 70, IU.jelly(0, 6, .5, t), at(u, 0, .3));
});
shot([13, 3], still(CERV[0], CERV[1], CERV[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, over: IU.inUterus("hormonal") + swarm(5, .22, t, { stop: .245, spread: 18, slow: .7 }) }) + iconBox(400, 560, 70, IU.jelly(0, 6, .5, t), 1) + cross(320, 552, .35, at(u, .4, .4));
});
// 14 · and keeps the lining thin, so periods get lighter
shot(14, fly(CERV, MID, 1.8), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 24 - 16 * at(u, .6, d), hl: "endo", over: IU.inUterus("hormonal") }) + label(206, 240, 120, 180, "بطانة الرحم", OLIVE, at(u, .4, .5), 16);
});
shot([14, 1], still(MID[0], MID[1], MID[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 8, over: IU.inUterus("hormonal") }) + label(206, 240, 120, 180, "بطانة الرحم", OLIVE, 1, 16) + chip("الدورة بتخف", 320, 470, OLIVE, at(u, 0, .3), 16) +
    G("translate(450 190)", IU.drop(0, 0, .55 + .25 * (1 - at(u, .2, 1)), "#b8463a"), at(u, 0, .3));
});
// 15 · both work more than 99 %
shot(15, still(320, 393, 1), function (u, d, t) {
  return paper() + IU.device(470, 260, .9, "copper") + IU.device(170, 260, .9, "hormonal") + G("", N("+" + count(99, at(u, .2, 1.6)) + "%", 320, 610, 92, ORANGE), at(u, .1, .3)) + T("كفاءة", 320, 680, 28, INK, 800);
});
// 16 · copper lasts up to 10 years, hormonal 3 to 8 depending on the type
shot(16, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 200, .9, "copper", { glow: .5 }) + IU.device(170, 200, .9, "hormonal") + G("", IU.calendar(470, 630, 1.5, "10 سنين"), at(u, .3, .4)); });
shot([16, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + IU.device(470, 200, .9, "copper") + IU.device(170, 200, .9, "hormonal", { glow: .5 }) + IU.calendar(470, 630, 1.5, "10 سنين") + G("", IU.calendar(170, 630, 1.5, "3–8 سنين", OLIVE), at(u, 0, .4));
});
// 17 · what to do after it's fitted: after every period, check the thread is there
shot(17, still(320, 393, 1), function (u, d, t) { return paper() + woman(320, 480, 1.05, { mouth: "neutral", brows: "raised", look: [.5, -.4] }, t) + G("", T("؟", 500, 220, 120, ORANGE, 800), at(u, .3, .3)); });
shot([17, 2], still(320, 393, 1), function (u, d, t) { return paper() + woman(260, 480, 1.05, { mouth: "smile" }, t) + G("", IU.calendar(500, 220, 1.5, "بعد الدورة"), at(u, 0, .35)); });
var THR = [320, 610, 2.2];
shot([17, 3], still(THR[0], THR[1], THR[2]), function (u, d, t) {
  var p = L2P([-4, 440]); return paper() + U1({ over: IU.inUterus("copper") }) + label(p[0] - 4, p[1], 250, 560, "الخيط", ORANGE, at(u, .1, .5), 12) + check(380, 580, .5, at(u, .6, .4));
});
// 18 · see the doctor after the first period to check where it sits
shot(18, still(320, 393, 1), function (u, d, t) { return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t); });
shot([18, 1], still(320, 393, 1), function (u, d, t) { return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t) + G("", IU.calendar(320, 120, 1.3, "أول دورة"), at(u, 0, .35)); });
shot([18, 2], still(320, 393, 1), function (u, d, t) {
  return paper() + doctor(430, 470, 1, { mouth: "smile" }, t) + woman(200, 480, 1, { mouth: "smile", look: [.6, 0] }, t) + inset(320, 130, 95, IU.uterus(0, -60, .34, { tubes: false, over: IU.inUterus("copper") }), at(u, 0, .3)) + check(400, 200, .7, at(u, .5, .4));
});
// 19 · warning signs: bad pain, fever, strange discharge, the thread gone → go straight away
var SIG = [[470, 150, "وجع جامد"], [170, 150, "سخونية"], [470, 400, "إفرازات غريبة"], [170, 400, "الخيط اختفى"]];
function sign(i, k, t) {
  var x = SIG[i][0], y = SIG[i][1], ic = [IU.bolt(0, 0, 1.1), IU.thermometer(0, 0, .9, .85 + .1 * Math.sin(t * 3)), IU.drop(0, 0, 1, "#b6b06a"), IU.ln([[-6, -50], [-10, -10], [-4, 30]], "#3a2a22", 3) + '<text x="22" y="10" style="font:800 56px Noto Sans Arabic" fill="' + ORANGE + '" text-anchor="middle">؟</text>'][i];
  return G("", iconBox(x, y, 150, ic, k) + G("", T(SIG[i][2], x, y + 110, 22, INK, 800), k), 1);
}
function signs(n, kl, t) { var s = ""; for (var i = 0; i < n; i++) s += sign(i, i === n - 1 ? kl : 1, t); return s; }
shot(19, still(320, 393, 1), function (u, d, t) { return paper() + signs(1, at(u, 0, .3), t); });
shot([19, 1], still(320, 393, 1), function (u, d, t) { return paper() + signs(2, at(u, 0, .3), t); });
shot([19, 2], still(320, 393, 1), function (u, d, t) { return paper() + signs(3, at(u, 0, .3), t); });
shot([19, 3], still(320, 393, 1), function (u, d, t) { return paper() + signs(4, at(u, 0, .3), t); });
shot([19, 4], still(320, 393, 1), function (u, d, t) { return paper() + signs(4, 1, t) + chip("روحي على طول", 320, 690, ORANGE, at(u, 0, .3), 26); });
// 20 · it doesn't protect against sexually transmitted infections
shot(20, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 220, 1, "copper") + G("", IU.shield(480, 560, 1.6), at(u, .2, .4)); });
shot([20, 1], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 220, 1, "copper") + IU.shield(480, 560, 1.6) + cross(480, 560, 1.2, at(u, .1, .5)) + chip("مبيحميش", 200, 640, ORANGE, at(u, .3, .3), 24); });
// 21 · many think the IUD causes abortion. No.
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + woman(220, 480, 1.05, { mouth: "frown", brows: "worried", look: [.5, -.2] }, t) + chip("إجهاض؟", 470, 200, INK, at(u, .6, .3), 26); });
shot([21, 2], still(320, 393, 1), function (u, d, t) { return paper() + woman(220, 480, 1.05, { mouth: "smile", brows: "raised" }, t) + chip("إجهاض؟", 470, 200, INK, 1, 26) + cross(470, 200, 1, at(u, 0, .4)); });
// 22 · it stops fertilisation itself; when it's taken out, fertility comes back fast
shot(22, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper") + eggAt(1) }) + label(74, 194, 120, 110, "البويضة لوحدها", OLIVE, at(u, .2, .5), 15) + chip("مفيش تلقيح", 400, 90, OLIVE, at(u, .6, .3), 20); });
shot([22, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  var k = at(u, 0, 1.2); return paper() + U1({ over: '<g transform="translate(0 ' + f(420 * k) + ')" opacity="' + f(1 - k * .9) + '">' + IU.inUterus("copper") + '</g>' + eggAt(1) }) + arrow(470, 380, 470, 560, ORANGE, 5, at(u, .1, .5));
});
shot([22, 3], still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: eggAt(1) + swarm(5, .7 + .25 * at(u, 0, d), t) }) + chip("الخصوبة بترجع", 400, 90, BLUE, at(u, 0, .3), 20) + check(560, 90, .6, at(u, .4, .4)); });
// 23 · bottom line: copper poisons the sperm, hormonal closes the road, both stop fertilisation
shot(23, still(U[0], U[1], U[2]), function (u, d, t) { return paper() + U1({ over: IU.inUterus("copper") + eggAt(1) }); });
shot([23, 1], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ inner: IU.ions(0, 130, 22, 110, 1, t) + swarm(4, .5, t, { dead: 1.01, spread: 60 }), over: IU.inUterus("copper", { glow: 1 }) + eggAt(1) }) + callout("1", 410, 260, at(u, 0, .3), 18);
});
shot([23, 2], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 10, inner: IU.hormone(0, 120, 18, 100, 1, t), over: IU.inUterus("hormonal", { glow: 1 }) + swarm(4, .22, t, { stop: .245, spread: 18, slow: .6 }) + eggAt(1) }) + callout("1", 410, 260, 1, 18) + callout("2", 380, 520, at(u, 0, .3), 18);
});
shot([23, 3], still(U[0], U[1], U[2]), function (u, d, t) {
  return paper() + U1({ mucus: 1, endo: 10, over: IU.inUterus("hormonal") + eggAt(1) }) + callout("1", 410, 260, 1, 18) + callout("2", 380, 520, 1, 18) + callout("3", 130, 140, at(u, 0, .3), 18) + chip("مفيش تلقيح", 400, 90, OLIVE, at(u, .3, .3), 20);
});
// 24 · the oddest: a copper IUD fitted within 5 days after sex is the strongest emergency contraception
shot(24, still(320, 393, 1), function (u, d, t) { return paper() + IU.device(320, 170, 1.05, "copper", { glow: .5 + .3 * Math.sin(t * 2) }); });
shot([24, 1], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 170, .95, "copper", { glow: .5 }) + G("", IU.calendar(190, 260, 2, "5 أيام"), at(u, 0, .4)); });
shot([24, 3], still(320, 393, 1), function (u, d, t) { return paper() + IU.device(470, 170, .95, "copper", { glow: .5 }) + IU.calendar(190, 260, 2, "5 أيام") + tag("طوارئ", 320, 640, at(u, 0, .3), 34, ORANGE) + check(470, 640, .8, at(u, .6, .4)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the copper T beside a fingertip, about 3 cm. line 1: placed in the uterus. line 2: the cavity stays open round it
  var k1 = li >= 1 ? ease((t - LN[1].start) / .6) : 0, s = "";
  if (li === 0) s += IU.device(380, 200, .9, "copper", { thread: 120 }) + IU.finger(170, 330, 1.3) + measure(470, 200 + 4, 470, 200 + 190 * .9, ease((t - .8) / .8), "") + G("", T("3 سم", 540, 300, 26, ORANGE, 800), ease((t - 1.6) / .3));
  else {
    s += IU.uterus(304, 170, .82, { over: IU.inUterus("copper") + (li >= 2 ? '<path d="M0 420 L0 250 L-60 110 L-150 20" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="10 8" fill="none"/>' + IU.sperm(-70, 90, -2, 1.3, 0) : "") });
    if (li >= 2) s += G("", T("؟", 520, 110, 110, ORANGE, 800), ease((t - LN[2].start - .3) / .3));
  }
  return s;
};
SCENE.bumper = function (u, t) { return IU.device(90, 40, .55, "copper", { thread: 40, glow: .5 + .5 * Math.sin(t * 3) }); };
SCENE.outro = function (svg, u, t) {
  return IU.uterus(300, 40, .5, { mucus: 1, endo: 12, tubes: true, inner: IU.ions(0, 130, 16, 100, 1, t) + IU.wbc(-60, 90, 14, 1, 1), over: IU.inUterus("copper") }) +
    callout("1", 330, 95, ease(u / .3)) + callout("2", 250, 85, ease(u / .3 - .5)) + callout("3", 335, 200, ease(u / .3 - 1)) + callout("4", 230, 40, ease(u / .3 - 1.5));
};
