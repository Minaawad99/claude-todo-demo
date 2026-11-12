// ── «ليه صوتك غريب لما تسمعه متسجّل؟» — shots over the channel's ink-and-wash cutaways (img/NN.webp, refs/SOURCES.md).
// Colours: slate blue = sound through the air, orange = sound through bone (the inside path).
pics({ 1: [728, 1008], 2: [531, 962], 3: [696, 668], 4: [768, 783], 5: [687, 882], 6: [721, 755], 7: [757, 1033], 8: [728, 939], 9: [722, 812], 10: [730, 908] });
var AIR = BLUE, BONE = ORANGE;

// sound as rings opening from (x, y) toward angle ang (deg), moving with t
function rings(x, y, ang, t, col, n, spread, sz) {
  var s = "", i; n = n || 5; sz = sz || 120;
  for (i = 0; i < n; i++) { var ph = (t * .9 + i / n) % 1, r = 12 + ph * sz; s += '<path d="M' + f(x + r * Math.cos((ang - (spread || 35)) * Math.PI / 180)) + ' ' + f(y + r * Math.sin((ang - (spread || 35)) * Math.PI / 180)) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r * Math.cos((ang + (spread || 35)) * Math.PI / 180)) + ' ' + f(y + r * Math.sin((ang + (spread || 35)) * Math.PI / 180)) + '" fill="none" stroke="' + (col || AIR) + '" stroke-width="3" stroke-linecap="round" opacity="' + f(1 - ph) + '"/>'; }
  return s;
}
// a framed strip with the two parts of a voice: a thick low wave and a thin high one (k* = how much of each is heard)
function waveBox(x, y, w, t, kThick, kThin, title) {
  var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="150" rx="6" fill="#f6efdf" stroke="' + INK + '" stroke-width="2"/>';
  s += G("", wave(x + 20, y + 52, x + w - 90, y + 52, t * .5, BONE, 18, 90, 1, 6) + T("تخين", x + w - 46, y + 60, 20, BONE, 800), clamp(kThick));
  s += G("", wave(x + 20, y + 112, x + w - 90, y + 112, t * 1.4, AIR, 7, 22, 1, 2.4) + T("رفيع", x + w - 46, y + 120, 20, AIR, 800), clamp(kThin));
  return s + (title ? T(title, x + w / 2, y - 12, 22, INK, 800) : "");
}
var MOUTH1 = [470, 560], COCH1 = [292, 262], EAR1 = [190, 330], LARYNX1 = [292, 720];
var AIRPATH1 = [[470, 560], [640, 520], [740, 330], [650, 60], [380, -40], [120, 40], [60, 220], [150, 320], [240, 300], [292, 262]];
var BONEPATH1 = [[292, 720], [300, 600], [330, 470], [300, 360], [292, 262]];

// the pictures, alive
function live(L, t, o) {
  o = o || {}; var n = L.n, s = "", i, k = L.k;
  if (n === 1) {   // the head: the throat buzzes while he talks, the cochlea answers
    s = G(about(L, 360, 1000, 1, .8 * Math.sin(t * .7)), pic(L) + part(L, ell(292, 720, 60, 90), about(L, 292, 720, 1 + .02 * Math.abs(Math.sin(t * 24)))) + part(L, ell(292, 262, 34, 30), about(L, 292, 262, 1 + .05 * Math.abs(Math.sin(t * 9)))));
    return s;
  }
  if (n === 2) {   // the vocal folds vibrate, air rising between them
    s = pic(L);
    s += part(L, poly([[175, 380], [258, 380], [258, 690], [175, 690]]), "translate(" + f(3 * Math.sin(t * 30) * k) + " 0)");
    s += part(L, poly([[262, 380], [345, 380], [345, 690], [262, 690]]), "translate(" + f(-3 * Math.sin(t * 30) * k) + " 0)");
    s += runDots(mapPts(L, [[262, 900], [262, 700], [262, 560], [262, 300], [262, 120]]), t, "#dfe9ef", 4, 10, 120);
    return s;
  }
  if (n === 3) {   // the ear: the eardrum trembles; the stapedius pulls when o.muscle
    s = pic(L) + part(L, ell(360, 330, 30, 50), about(L, 360, 330, 1 + .04 * Math.abs(Math.sin(t * 14))));
    if (o.muscle) s += part(L, ell(600, 320, 50, 22), about(L, 560, 330, 1 - .0 + .1 * (.5 + .5 * Math.sin(t * 3)), 4 * Math.sin(t * 3)));
    s += part(L, ell(555, 375, 75, 75), about(L, 555, 375, 1 + .025 * Math.abs(Math.sin(t * 9))));
    return s;
  }
  if (n === 4) return pic(L) + part(L, poly([[0, 0], [215, 0], [215, 520], [0, 520]]), about(L, 120, 520, 1, 1.4 * Math.sin(t * 1.3), 0, 2 * Math.sin(t * 2.6)));
  if (n === 5) {   // the skull talks: the jaw opens and closes
    var jaw = poly([[100, 640], [330, 560], [470, 470], [520, 560], [430, 880], [100, 882]]);
    return picBut(L, jaw) + part(L, jaw, about(L, 470, 480, 1, 3.5 * (.5 + .5 * Math.sin(t * 5))));
  }
  if (n === 6) return G("translate(0 " + f(4 * Math.sin(t * 1.1)) + ")", pic(L));
  if (n === 7) {   // chewing: the jaw bites, crumbs fly
    var jw = poly([[200, 470], [480, 450], [535, 560], [380, 625], [200, 590]]), b = Math.pow(Math.abs(Math.sin(t * 4)), 2);
    s = picBut(L, jw) + part(L, jw, about(L, 480, 400, 1, 2.5 * b));
    for (i = 0; i < 8; i++) { var ph = (t * .8 + hash(i)) % 1, c = L.p(245, 500); s += '<path d="M' + f(c[0] - ph * 60 * hash(i + 2)) + ' ' + f(c[1] + ph * 40 - 20 + 30 * hash(i + 5) * ph * ph) + ' l4 -3 l3 4 z" fill="#d9b25f" stroke="' + INK + '" stroke-width=".8" opacity="' + f(1 - ph) + '"/>'; }
    return s;
  }
  if (n === 8) return G(about(L, 360, 900, 1, 1 * Math.sin(t * .9)), pic(L));
  if (n === 9) return pic(L) + part(L, poly([[100, 80], [330, 80], [330, 800], [100, 800]]), about(L, 220, 800, 1, .9 * Math.sin(t * .8)));
  if (n === 10) {   // the rod trembles against the piano
    var rod = poly([[160, 180], [310, 220], [310, 250], [160, 215]]);
    return picBut(L, rod) + part(L, rod, "translate(0 " + f(1.6 * Math.sin(t * 40) * k) + ")") + part(L, poly([[200, 380], [320, 380], [320, 460], [200, 460]]), "translate(" + f(2 * Math.sin(t * 6)) + " 0)");
  }
  return pic(L);
}

// layouts (world 640 × 786)
var HEAD = PL(1, 320, 400, 470), LAR = PL(2, 320, 390, 330), EAR = PL(3, 320, 380, 600), DUO = PL(4, 320, 380, 520), SKL = PL(5, 320, 400, 520),
    PHN = PL(6, 320, 330, 560), CHP = PL(7, 300, 400, 500), FNG = PL(8, 320, 400, 560), MIR = PL(9, 320, 390, 600), BTH = PL(10, 320, 400, 560);
var DUO_MOUTH = [190, 390], DUO_EAR = [470, 370], DUO_COCH = [615, 335];

// ════ shots ════
// 4 · sound is a tremble: the vocal cords shake, the air carries it
shot(4, push(320, 420, 1.0, 1.08), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), live(LAR, t)) + box(LAR.p(220, 560), 110, 140, "الأحبال الصوتية", OLIVE, at(u, .6, .5), 22) + box(LAR.p(262, 250), 520, 120, "الهوا", AIR, at(u, 2.4, .5), 24);
});
// 5 · in the ear, the snail-shaped cochlea turns the tremble into a signal for the brain
shot(5, push(330, 400, 1.0, 1.1), function (u, d, t) {
  return paper() + live(EAR, t) + runDots(mapPts(EAR, [[60, 330], [200, 330], [360, 330], [430, 330], [520, 360]]), t, AIR, 5, 7, 90) + box(EAR.p(555, 375), 500, 640, "القوقعة", OLIVE, at(u, .5, .5), 26) +
    G("", draw("M" + f(EAR.p(620, 400)[0]) + " " + f(EAR.p(620, 400)[1]) + " q60 -40 120 -120", at(u, 2, .8), ORANGE, 3) + T("للمخ", 600, 160, 24, ORANGE, 800), at(u, 2, .3));
}, { tr: "in" });
// 6–7 · your friend hears you one way only: through the air, mouth to ear
shot(6, push(320, 380, .98, 1.05), function (u, d, t) {
  return paper() + live(DUO, t) + G("", rings(DUO.p(DUO_MOUTH[0], DUO_MOUTH[1])[0], DUO.p(DUO_MOUTH[0], DUO_MOUTH[1])[1], 0, t, AIR, 6, 30, 150), at(u, .3, .4)) + tag("طريق واحد", 320, 100, at(u, 1.6, .3), 26, AIR);
});
shot(7, push(420, 360, 1.3, 1.45), function (u, d, t) {
  var P = mapPts(DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR, [540, 360], DUO_COCH]);
  return paper() + live(DUO, t) + runDots(P, t, AIR, 6, 9, 110) + box(DUO.p(DUO_EAR[0], DUO_EAR[1]), 470, 180, "ودنه", OLIVE, at(u, 1, .5), 22) + box(P[1], 260, 560, "الهوا", AIR, at(u, .4, .5), 22);
});
// 8–9 · you hear yourself two ways at once: from outside like him, and from inside through your skull
shot(8, push(320, 400, .95, 1.0), function (u, d, t) {
  return paper() + live(HEAD, t) + G("", runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120), at(u, .3, .5)) + G("", runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70), at(u, 1.6, .5)) + tag("طريقين", 320, 740, at(u, 1, .3), 30, ORANGE);
}, { tr: "out" });
shot(9, push(330, 410, 1.0, 1.08), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) +
    box(HEAD.p(700, 330), 540, 330, "من بره", AIR, at(u, .3, .5), 24) + box(HEAD.p(320, 470), 520, 640, "من جوه", BONE, at(u, 1.5, .5), 24);
});
// 10 · the tremble runs through the bone straight to the cochlea (the skull talking)
shot(10, push(330, 410, 1.0, 1.1), function (u, d, t) {
  return paper() + live(SKL, t) + runDots(mapPts(SKL, [[200, 690], [330, 610], [420, 500], [470, 400]]), t, BONE, 6, 8, 80) + box(SKL.p(300, 150), 140, 100, "العضم", BONE, at(u, .4, .5), 26) + box(SKL.p(470, 390), 520, 700, "القوقعة", OLIVE, at(u, 1.2, .5), 24);
}, { tr: "in" });
// 11 · why it changes the sound: bone carries the thick (low) part better than the thin (high) part
shot(11, push(320, 380, 1.0, 1.04), function (u, d, t) {
  return paper() + G("translate(0 -60)", live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70)) + waveBox(80, 600, 480, t, at(u, .5, .5), lerp(1, .25, at(u, 2, 1)), "اللي بيعدّي من العضم");
});
// 12 · so from inside your voice reaches you deeper than it is
shot(12, push(310, 380, 1.15, 1.25), function (u, d, t) {
  var c = HEAD.p(COCH1[0], COCH1[1]);
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 7, 9, 80) + '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(40 + 6 * Math.sin(t * 5)) + '" fill="' + ORANGE + '" opacity=".15"/>' + tag("أتقل", c[0] + 150, c[1] - 60, at(u, .6, .3), 30, ORANGE);
}, { tr: "in" });
// 13 · like crisps: the crunch is loud inside your head and your friend barely hears it
shot(13, push(320, 400, 1.02, .96), function (u, d, t) {
  var P = mapPts(CHP, [[330, 470], [430, 470], [480, 400], [515, 320]]), c = CHP.p(515, 320);
  return paper() + live(CHP, t) + runDots(P, t, BONE, 6, 6, 90) + rings(c[0], c[1], 0, t * 1.4, BONE, 4, 180, 60) + box(CHP.p(245, 500), 120, 700, "القرمشة", ORANGE, at(u, .4, .5), 24) +
    iconBox(540, 110, 140, '<circle cx="-10" cy="-20" r="20" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-36 40 Q-10 0 16 40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>' + T("…؟", 34, -12, 26, AIR, 800), at(u, 2.4, .3));
});
// 14 · try it: fingers in your ears and talk — you still hear yourself, deeper
shot(14, push(330, 400, 1.0, 1.08), function (u, d, t) {
  var P = mapPts(FNG, [[600, 560], [560, 470], [560, 380], [555, 330]]), e = FNG.p(240, 430);
  return paper() + live(FNG, t) + cross(e[0] - 60, e[1] - 30, .8, at(u, .5, .5)) + runDots(P, t, BONE, 6, 6, 70) + box(FNG.p(555, 330), 540, 120, "من جوه", BONE, at(u, 1.4, .5), 24) + tag("أتقل", 520, 690, at(u, 2.6, .3), 28, ORANGE);
});
// 15 · a tiny muscle in your ear pulls while you talk so your own voice doesn't startle you
var STAP = [600, 320];
shot(15, push(EAR.p(STAP[0], STAP[1])[0] - 30, EAR.p(STAP[0], STAP[1])[1] + 10, 1.8, 1.95), function (u, d, t) {
  return paper() + live(EAR, t, { muscle: true }) + box(EAR.p(STAP[0], STAP[1]), EAR.p(STAP[0], STAP[1])[0] - 60, EAR.p(STAP[0], STAP[1])[1] - 110, "عضلة", OLIVE, at(u, .5, .5), 18);
}, { tr: "in" });
// 16 · and the phone? its mic hears you through the air only, just like your friend
shot(16, push(330, 380, 1.0, 1.08), function (u, d, t) {
  var m = PHN.p(370, 490), P = mapPts(PHN, [[700, 740], [600, 650], [470, 560], [370, 490]]);
  return paper() + live(PHN, t) + runDots(P, t, AIR, 6, 8, 100) + box(m, 160, 640, "المايك", OLIVE, at(u, .5, .5), 24) + tag("الهوا بس", 470, 700, at(u, 1.6, .3), 26, AIR);
}, { tr: "out" });
// 17 · so the recording loses the thick part you're used to and sounds thinner
shot(17, push(320, 380, 1.0, 1.04), function (u, d, t) {
  return paper() + G("translate(0 -90) scale(.95)", live(PHN, t)) + waveBox(80, 590, 480, t, lerp(1, .12, at(u, .6, 1.4)), 1, "اللي في التسجيل") + tag("أرفع", 520, 520, at(u, 2.2, .3), 28, AIR);
});
// 18 · many think the phone spoils the voice. No.
shot(18, push(330, 380, 1.04, .98), function (u, d, t) {
  return paper() + live(PHN, t) + cross(320, 380, 2, at(u, d - 1.1, .5));
});
// 19 · that's the voice people hear from you every day
shot(19, push(320, 380, .98, 1.04), function (u, d, t) {
  var P = mapPts(DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR]);
  return paper() + live(DUO, t) + runDots(P, t, AIR, 6, 8, 110) + check(520, 160, 1.4, at(u, .6, .5), OLIVE) + tag("ده صوتك", 330, 120, at(u, .9, .3), 28, OLIVE);
});
// 20 · and the brain has been used to the inside version for years, so any other copy sounds strange
shot(20, push(320, 400, 1.02, .96), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) + tag("متعود عليه", 330, 110, at(u, .4, .3), 28, ORANGE);
}, { tr: "out" });
// 21 · like your face in a photo: not the one you see in the mirror
shot(21, push(380, 300, 1.05, 1.15), function (u, d, t) {
  return paper() + live(MIR, t) + box(MIR.p(470, 170), 330, 80, "المراية", OLIVE, at(u, .3, .5), 22) + box(MIR.p(650, 170), 560, 470, "الصورة", OLIVE, at(u, 1, .5), 22);
});
// 22 · in short: you hear yourself through air and bone, people and the recording through air only
shot(22, push(320, 400, .95, 1.02), function (u, d, t) {
  return paper() + live(HEAD, t) + runDots(mapPts(HEAD, AIRPATH1), t, AIR, 6, 14, 120) + runDots(mapPts(HEAD, BONEPATH1), t, BONE, 6, 7, 70) +
    box(HEAD.p(700, 330), 540, 300, "الهوا", AIR, at(u, .3, .5), 22) + box(HEAD.p(320, 470), 530, 620, "العضم", BONE, at(u, 1, .5), 22) +
    iconBox(110, 110, 150, G("translate(-150 -270) scale(.38)", pic(PL(6, 400, 400, 400))) + T("الهوا بس", 0, 62, 16, AIR, 800), at(u, 2.6, .3));
}, { tr: "out" });
// 23 · the odd fact: Beethoven, going deaf, is said to have bitten a rod resting on the piano to hear through his jawbone
shot(23, push(320, 400, 1.0, 1.08), function (u, d, t) {
  var P = mapPts(BTH, [[330, 245], [250, 225], [175, 205], [110, 140]]);
  return paper() + live(BTH, t) + runDots(P, t, BONE, 6, 6, 70) + box(BTH.p(250, 225), 470, 110, "عصاية", ORANGE, at(u, 1.2, .5), 24) + box(BTH.p(100, 130), 120, 640, "عضم راسه", BONE, at(u, 2.6, .5), 22);
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
var IN_HEAD = PL(1, 304, 330, 440), IN_PHN = PL(6, 304, 300, 520), IN_DUO = PL(4, 304, 330, 380);
SCENE.intro = function (svg, t, li) {
  var s = "";
  if (li === 0) { var m = IN_HEAD.p(MOUTH1[0], MOUTH1[1]); s += live(IN_HEAD, t) + rings(m[0] + 10, m[1], 0, t, AIR, 5, 35, 120); }
  else if (li === 1) { var l1 = LN[1], c1 = window.CHUNKS[1], tq = l1.start + (l1.end - l1.start) * (c1[c1.length - 1] || .6); s += live(IN_PHN, t) + tag("ده مش أنا!", 304, 600, ease((t - tq) / .3), 34, ORANGE); }
  else { var u2 = t - LN[2].start, P = mapPts(IN_DUO, [DUO_MOUTH, [280, 385], [390, 380], DUO_EAR]); s += live(IN_DUO, t) + runDots(P, t, AIR, 5, 8, 100) + check(470, 600, 1.2, ease((u2 - .6) / .4), OLIVE); }
  return s;
};
SCENE.bumper = function (u, t) { return live(PL(1, 90, 100, 120), t); };
var OUT_HEAD = PL(1, 300, 140, 190);
SCENE.outro = function (svg, u, t) {
  return live(OUT_HEAD, t) + runDots(mapPts(OUT_HEAD, AIRPATH1), t, AIR, 3, 12, 50) + runDots(mapPts(OUT_HEAD, BONEPATH1), t, BONE, 3, 6, 30) +
    callout("1", OUT_HEAD.p(LARYNX1[0], LARYNX1[1])[0] - 30, OUT_HEAD.p(LARYNX1[0], LARYNX1[1])[1], ease(u / .3)) + callout("2", OUT_HEAD.p(700, 300)[0], OUT_HEAD.p(700, 300)[1], ease(u / .3 - .5)) +
    callout("3", OUT_HEAD.p(330, 470)[0] + 22, OUT_HEAD.p(330, 470)[1], ease(u / .3 - 1)) + callout("4", OUT_HEAD.p(COCH1[0], COCH1[1])[0] - 24, OUT_HEAD.p(COCH1[0], COCH1[1])[1] - 10, ease(u / .3 - 1.5));
};
