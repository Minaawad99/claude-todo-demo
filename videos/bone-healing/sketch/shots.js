// ── «إزاي العضمة المكسورة بتلحم نفسها؟» — the channel's ink-and-wash cutaways (img/NN.webp), and every picture moves:
// the welder's arm and head and the torch's light, the blood in the vessels, the clot that throbs, the cells that eat and
// build, the soft bridge pulled tight, the concrete flowing, calcium lighting the new bone, the bulge shrinking back.
pics({ 1: [700, 729], 2: [479, 1336], 3: [559, 1067], 4: [639, 962], 5: [706, 883], 6: [733, 1135], 7: [749, 1301], 8: [709, 1182], 9: [768, 635], 10: [705, 1204], 11: [611, 1213], 12: [768, 1359] });
var HOT = "#ffb45a", BLOODC = "#c0392b", CAL = "#fff1c9";

// ── the living pictures ──
var WELD = { shoulder: [200, 200], tip: [362, 378], neck: [300, 200], bead: [[255, 470], [300, 440], [362, 385]] };
function welder(L, t, o) {
  o = o || {}; var s = "", sweep = Math.sin(t * 1.6), rot = 3.2 * sweep, dx = 7 * sweep * L.k, dy = -4 * sweep * L.k, nod = 2.2 * Math.sin(t * .9 + 1);
  var fl = .7 + .3 * Math.abs(Math.sin(t * 23)) * (.6 + .4 * Math.sin(t * 7)), tip = movedPt(L, WELD.tip[0], WELD.tip[1], WELD.shoulder[0], WELD.shoulder[1], 1, rot, dx, dy);
  s += pic(L);
  s += partSoft(L, 330, 105, 105, 100, about(L, WELD.neck[0], WELD.neck[1], 1, nod));                                   // the helmet nods
  s += partSoft(L, 265, 320, 150, 95, about(L, WELD.shoulder[0], WELD.shoulder[1], 1, rot, dx, dy));                    // the arm and torch move along the seam
  // the light: a flickering bloom at the tip, the whole scene warmed, the fresh bead glowing behind the torch
  s += glow(tip[0], tip[1], 150 * L.k / .8 * fl, "#ffd9a0", .55 * fl) + glow(tip[0], tip[1], 40 * L.k / .8, "#fffbe8", .95 * fl);
  WELD.bead.forEach(function (b, i) { var p = L.p(b[0], b[1]); s += glow(p[0], p[1], 34 * L.k / .8, HOT, (.35 + .25 * i) * (.8 + .2 * Math.sin(t * 9 + i))); });
  s += sparks(tip[0], tip[1], t, 22, 110 * L.k / .8, -35, 150) + sparks(tip[0], tip[1], t + .37, 10, 70 * L.k / .8, 150, 80);
  s += '<rect x="-2000" y="-2000" width="5000" height="5000" fill="#ffb060" opacity="' + f(.05 * fl * (o.room == null ? 1 : o.room)) + '" style="mix-blend-mode:screen"/>';
  return s;
}
var BONE3 = { vessels: [[[120, 870], [130, 700], [150, 520], [140, 320], [120, 150]], [[440, 880], [430, 700], [420, 520], [440, 330], [430, 120]], [[260, 980], [240, 820], [250, 680]]], marrow: [270, 520] };
var CLOT = { c: [300, 480], vin: [[[20, 740], [120, 650], [210, 560], [260, 520]], [[600, 450], [480, 500], [370, 500]], [[520, 720], [430, 620], [350, 540]]] };
var MACRO = [[130, 220, 1], [420, 400, 2], [180, 560, 3], [480, 700, 4]];
var CUBES = [[395, 205], [430, 165], [470, 145], [510, 140], [400, 245], [420, 285], [450, 310], [485, 320], [520, 330]];
function live(L, t, o) {
  o = o || {}; var n = L.n, s = "", i, k = L.k, b = beat(t), v;
  if (n === 1) return welder(L, t, o);
  if (n === 2) {   // the leg: a gentle sway; the broken end shifts on the crack and the blood pulses (or the healed glow)
    s = G(about(L, 240, 1300, 1, .9 * Math.sin(t * .8)), pic(L) + (o.healed ? "" : partSoft(L, 300, 820, 80, 120, "translate(" + f(2.5 * Math.sin(t * 1.4) * k) + " " + f(2 * Math.abs(Math.sin(t * 1.4)) * k) + ")")));
    var cr = L.p(260, 680);
    s += o.healed ? glow(cr[0], cr[1], 120 * k, "#ffe6a8", .6 + .2 * Math.sin(t * 2)) : glow(cr[0], cr[1], 110 * k, "#ff5a3c", .25 + .45 * b);
    return s;
  }
  if (n === 3) {   // the living bone: blood runs in its vessels, the marrow glows with each beat
    s = G(about(L, 280, 1000, 1, .8 * Math.sin(t * .7)), pic(L));
    BONE3.vessels.forEach(function (vp, j) { s += runDots(mapPts(L, vp), t + j * .4, "#d9412e", 3.2, 9, 55); });
    var m = L.p(BONE3.marrow[0], BONE3.marrow[1]); s += glow(m[0], m[1], 150 * k, "#ffb347", .25 + .4 * b);
    return s;
  }
  if (n === 4) {   // the clot throbs, blood seeps in from the torn vessels
    s = pic(L) + partSoft(L, CLOT.c[0], CLOT.c[1], 150, 140, about(L, CLOT.c[0], CLOT.c[1], 1 + .05 * b, 2 * Math.sin(t)));
    CLOT.vin.forEach(function (vp, j) { s += G("", runDots(mapPts(L, vp), t + j * .3, "#a8231a", 4.2, 6, 40), o.bleed == null ? 1 : o.bleed); });
    var c = L.p(CLOT.c[0], CLOT.c[1]); s += glow(c[0], c[1], 160 * k, "#ff4a30", .15 + .3 * b * (o.bleed == null ? 1 : o.bleed));
    return s;
  }
  if (n === 5) {   // the clean-up cells swell and creep onto the bone fragments; red cells drift through the net
    s = pic(L);
    MACRO.forEach(function (m) { var ph = t * 1.3 + m[2] * 1.7, sw = .5 + .5 * Math.sin(ph); s += partSoft(L, m[0], m[1], 120, 115, about(L, m[0], m[1], 1 + .06 * sw, 4 * Math.sin(ph * .7), 6 * Math.cos(ph * .6) * k, 6 * Math.sin(ph * .5) * k)); });
    for (i = 0; i < 9; i++) { var a = t * .25 + i * .7, x = 340 + 300 * Math.cos(a + hash(i) * 6), y = 440 + 360 * Math.sin(a * .8 + hash(i + 3) * 6), p = L.p(x, y); s += cellSprite(p[0], p[1], 15 * k, "#c9483a", a * 40); }
    return s;
  }
  if (n === 6) {   // the soft bridge breathes, and pulls the two ends a little closer
    var pull = .5 + .5 * Math.sin(t * 1.5);
    s = pic(L) + partSoft(L, 420, 300, 150, 150, "translate(" + f(-4 * pull * k) + " " + f(6 * pull * k) + ")") + partSoft(L, 300, 820, 140, 160, "translate(" + f(4 * pull * k) + " " + f(-6 * pull * k) + ")");
    s += partSoft(L, 370, 560, 170, 200, about(L, 370, 560, 1 + .03 * pull, 0));
    var c6 = L.p(370, 560); s += glow(c6[0], c6[1], 210 * k, "#cfe6ff", .25 + .25 * pull);
    return s;
  }
  if (n === 7) {   // the concrete flows down the chute and spreads in rings
    var stream = poly([[130, 150], [270, 150], [330, 330], [320, 520], [180, 520], [210, 330]]), sh = (t * 70) % 90, cc = clipOf(L, stream);
    s = pic(L) + cc.def + '<g clip-path="url(#' + cc.id + ')">' + G("translate(" + f(sh * .45 * k) + " " + f(sh * k) + ")", pic(L)) + G("translate(" + f((sh - 90) * .45 * k) + " " + f((sh - 90) * k) + ")", pic(L)) + '</g>';
    var c7 = L.p(270, 560);
    for (i = 0; i < 3; i++) { var ph7 = (t * .6 + i / 3) % 1; s += '<ellipse cx="' + f(c7[0]) + '" cy="' + f(c7[1]) + '" rx="' + f((20 + ph7 * 160) * k) + '" ry="' + f((10 + ph7 * 70) * k) + '" fill="none" stroke="#f2f2ee" stroke-width="2.4" opacity="' + f((1 - ph7) * .85) + '"/>'; }
    return s;
  }
  if (n === 8) {   // calcium sets the new bone: light creeps round the collar, white grains settle in
    var kc = o.cal == null ? .5 + .5 * Math.sin(t) : o.cal;
    s = pic(L) + partSoft(L, 360, 560, 290, 360, about(L, 360, 560, 1 + .015 * Math.sin(t * 1.2), .8 * Math.sin(t * .7)));
    var c8 = L.p(360, 560); s += glow(c8[0], c8[1], 300 * k, "#ffd98a", .15 + .45 * kc);
    for (i = 0; i < 16; i++) { var ph8 = (t * .5 + hash(i)) % 1, ang = hash(i + 4) * 6.28, r0 = 320 - ph8 * 200, p8 = L.p(360 + Math.cos(ang) * r0, 560 + Math.sin(ang) * r0 * 1.2); s += '<circle cx="' + f(p8[0]) + '" cy="' + f(p8[1]) + '" r="' + f(3.5 * k / .5) + '" fill="' + CAL + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(Math.sin(ph8 * Math.PI)) + '"/>'; }
    return s;
  }
  if (n === 9) {   // the eater crawls and gnaws (dust flies), the builders bob in a wave, the new bone glows
    var cr9 = Math.sin(t * 1.4);
    s = pic(L) + partSoft(L, 220, 215, 100, 90, about(L, 220, 215, 1 + .05 * Math.abs(cr9), 6 * cr9, 8 * cr9 * k, 2 * Math.cos(t * 2.8) * k));
    for (i = 0; i < 8; i++) { var ph9 = (t * 1.1 + hash(i)) % 1, p9 = L.p(150 + hash(i + 2) * 60, 180 + hash(i + 3) * 80); s += '<circle cx="' + f(p9[0] - ph9 * 30) + '" cy="' + f(p9[1] - ph9 * 40) + '" r="' + f(2.5 + hash(i) * 2) + '" fill="#efe3c8" stroke="' + INK + '" stroke-width=".6" opacity="' + f(1 - ph9) + '"/>'; }
    CUBES.forEach(function (c, j) { s += partSoft(L, c[0], c[1], 26, 26, "translate(0 " + f(-5 * Math.max(0, Math.sin(t * 3 - j * .7)) * k) + ")"); });
    var c9 = L.p(470, 260); s += glow(c9[0], c9[1], 150 * k, "#ffb35c", .2 + .25 * (.5 + .5 * Math.sin(t * 2)));
    return s;
  }
  if (n === 10) {  // the arm in its cast: a little movement, but the bone inside stays put; the break glows as it knits
    s = G(about(L, 300, 1150, 1, 1.2 * Math.sin(t * .9)), pic(L));
    var c10 = L.p(370, 620); s += glow(c10[0], c10[1], 90 * k, o.hot ? "#ff6a40" : "#ffe1a0", .3 + .25 * Math.sin(t * 2.4));
    return s;
  }
  if (n === 11) {  // remodelling: the bulge on the left bone shrinks back (o.shrink 0 → 1); both bones sway a little
    var sh11 = o.shrink || 0;
    s = G(about(L, 300, 1200, 1, .6 * Math.sin(t * .8)), pic(L) + partSoft(L, 130, 590, 120, 210, about(L, 130, 590, 1, 0)) + (sh11 > 0 ? partSoft(L, 130, 590, 115, 200, "translate(" + f(L.p(130, 590)[0]) + " " + f(L.p(130, 590)[1]) + ") scale(" + f(1 - .18 * sh11) + " 1) translate(" + f(-L.p(130, 590)[0]) + " " + f(-L.p(130, 590)[1]) + ")") : ""));
    if (sh11 > 0) { var cb = L.p(130, 590); for (i = 0; i < 10; i++) { var ph11 = (t * .7 + hash(i)) % 1; s += '<circle cx="' + f(cb[0] + (hash(i + 1) > .5 ? 1 : -1) * (50 + ph11 * 60) * k) + '" cy="' + f(cb[1] + (hash(i + 2) - .5) * 300 * k) + '" r="2.5" fill="#efe3c8" opacity="' + f((1 - ph11) * sh11) + '"/>'; } }
    return s;
  }
  if (n === 12) {  // the skeleton breathes and sways; arms swing; a band of light renews it from head to toe (o.renew)
    s = G(about(L, 400, 1300, 1, .9 * Math.sin(t * .8)), pic(L) + partSoft(L, 210, 470, 80, 230, about(L, 220, 290, 1, 3 * Math.sin(t * 1.3))) + partSoft(L, 560, 470, 80, 230, about(L, 545, 290, 1, -3 * Math.sin(t * 1.3 + .6))) + partSoft(L, 400, 110, 70, 80, about(L, 400, 180, 1, 2.5 * Math.sin(t * 1.1))));
    if (o.renew != null) { var y12 = L.p(0, 60 + 1250 * ((o.renew) % 1))[1]; s += '<rect x="' + f(L.x) + '" y="' + f(y12 - 40) + '" width="' + f(L.w) + '" height="80" fill="#ffc46b" opacity=".35" style="mix-blend-mode:screen"/>'; }
    return s;
  }
  return pic(L);
}

// layouts (world 640 × 786)
var WLD = PL(1, 320, 380, 640), LEG = PL(2, 320, 400, 330), BON = PL(3, 320, 400, 400), CLT = PL(4, 320, 400, 500), MAC = PL(5, 320, 400, 560),
    SOF = PL(6, 320, 400, 480), CON = PL(7, 320, 400, 450), HRD = PL(8, 320, 400, 480), RMD = PL(9, 320, 380, 640), CST = PL(10, 320, 400, 450),
    TWO = PL(11, 320, 400, 380), SKL = PL(12, 320, 395, 420);

// ════ shots ════
// 2 · and no nail in most breaks… the healed bone comes back as strong (the smooth bone; the bulgy one dimmed)
shot(2, push(320, 400, 1.0, 1.06), function (u, d, t) { return paper() + live(TWO, t) + check(500, 200, 1.3, at(u, 1.6, .5), OLIVE); });
// 4 · the rule card over the living bone
shot(4, push(320, 420, 1.0, 1.06), function (u, d, t) {
  return paper() + G("", live(BON, t), .55) + G("", '<rect x="150" y="190" width="340" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 265)"/>' +
    T("العضم", 320, 252, 40, OLIVE, 800) + T("عضو حي", 320, 304, 36, ORANGE, 800) + C(320, 198, 9, ORANGE, 2), at(u, .3, .4));
});
// 5 · bone is alive: blood and cells working all the time
shot(5, push(320, 420, 1.0, 1.1), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(BON, t)) + box(BON.p(130, 600), 110, 120, "دم", ORANGE, at(u, 1.2, .5), 26) + box(BON.p(270, 300), 520, 120, "خلايا", OLIVE, at(u, 2.2, .5), 24);
});
// 6 · it breaks: the vessels tear, blood gathers round the break
shot(6, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CLT, t, { bleed: at(u, .3, 1) })) + box(CLT.p(560, 470), 520, 120, "العروق", ORANGE, at(u, 1, .5), 24);
}, { tr: "in" });
// 7 · the blood clots into a plug between the two ends
shot(7, push(CLT.p(300, 480)[0], CLT.p(300, 480)[1], 1.25, 1.4), function (u, d, t) {
  return paper() + live(CLT, t, { bleed: .4 }) + box(CLT.p(300, 470), 470, 170, "جلطة", ORANGE, at(u, .6, .5), 22);
});
// 8 · a small army of cells cleans up the debris and dead bone
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(MAC, t)) + box(MAC.p(130, 220), 120, 90, "خلايا بتنضّف", OLIVE, at(u, .8, .5), 22) + box(MAC.p(310, 380), 520, 90, "عضم ميت", INK, at(u, 1.8, .5), 20);
}, { tr: "in" });
// 9 · who builds? special cells make a soft bridge between the ends
shot(9, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(SOF, t)) + box(SOF.p(370, 560), 520, 150, "جسر طري", BLUE, at(u, 1.6, .5), 26);
}, { tr: "out" });
// 10 · the bridge is cartilage, like in your nose (thumbnail)
shot(10, push(SOF.p(370, 560)[0], SOF.p(370, 560)[1], 1.25, 1.35), function (u, d, t) {
  return paper() + live(SOF, t) + box(SOF.p(370, 560), 470, 130, "غضروف", BLUE, at(u, .3, .5), 24) +
    iconBox(SOF.p(370, 560)[0] - 170, SOF.p(370, 560)[1] - 190, 120, '<path d="M-10 -55 C-12 -20 -30 10 -40 30 C-30 46 -6 48 0 40 C6 48 30 46 40 30 C30 10 12 -20 10 -55 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -30 L0 30" stroke="#a9c6dd" stroke-width="7" stroke-linecap="round"/>', at(u, 1.2, .3));
});
// 11 · like concrete: soft when poured, it needs time to set
shot(11, push(320, 400, 1.04, .97), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CON, t)) + tag("طرية", 520, 650, at(u, 1.6, .3), 30, BLUE);
}, { tr: "out" });
// 12 · when does it set? bone-building cells lay calcium on the bridge
shot(12, push(320, 400, 1.0, 1.08), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(HRD, t, { cal: at(u, .6, 2.5) })) + box(HRD.p(150, 420), 120, 110, "كالسيوم", ORANGE, at(u, 1.4, .5), 26);
}, { tr: "in" });
// 13 · the cartilage turns to new bone, a thick collar round the break, just like a weld (thumbnail: the weld)
shot(13, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var th = PL(1, 0, 0, 170);
  return paper() + live(HRD, t, { cal: 1 }) + box(HRD.p(600, 560), 520, 690, "عضم جديد", OLIVE, at(u, .6, .5), 24) +
    iconBox(110, 120, 170, '<clipPath id="ib13"><rect x="-85" y="-85" width="170" height="170"/></clipPath><g clip-path="url(#ib13)">' + welder(th, t, { room: 0 }) + '</g>', at(u, 2.6, .3));
});
// 14 · and the doctor says: it has knitted (the leg, the break glowing healed, ✓)
shot(14, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(LEG, t, { healed: true })) + check(500, 300, 1.4, at(u, 1.2, .5), OLIVE) + tag("لحمت", 500, 420, at(u, 1.5, .3), 30, OLIVE);
}, { tr: "out" });
// 15 · but the work isn't done: the bulge
shot(15, push(TWO.p(130, 590)[0] + 30, TWO.p(130, 590)[1], 1.35, 1.45), function (u, d, t) {
  return paper() + live(TWO, t) + box(TWO.p(60, 560), 110, 160, "زيادة", ORANGE, at(u, .4, .5), 24);
}, { tr: "in" });
// 16–17 · cells that eat the extra bone and cells that build it back to measure (like a finishing crew)
shot(16, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(RMD, t)) + box(RMD.p(220, 215), 140, 560, "بتاكل", ORANGE, at(u, .6, .5), 26) + box(RMD.p(470, 230), 500, 560, "بتبني", OLIVE, at(u, 1.6, .5), 26);
});
shot(17, push(RMD.p(330, 240)[0], RMD.p(330, 240)[1], 1.3, 1.4), function (u, d, t) {
  return paper() + live(RMD, t) + iconBox(320, 120, 150, '<path d="M-40 30 L-10 -30 M-18 -36 L2 -24" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><rect x="10" y="-10" width="40" height="22" fill="#cdb79a" stroke="' + INK + '" stroke-width="2" transform="rotate(' + f(-10 + 20 * Math.sin(t * 6)) + ' 30 0)"/>', at(u, .5, .3));
});
// 18 · months later the bone takes back its shape (the bulge shrinks)
shot(18, push(320, 400, 1.0, 1.06), function (u, d, t) {
  return paper() + live(TWO, t, { shrink: at(u, .4, d - 1) }) + tag("شهور", 320, 70, at(u, .3, .3), 28, ORANGE);
}, { tr: "out" });
// 19 · many think the cast heals the bone. No.
shot(19, push(320, 400, 1.04, .98), function (u, d, t) {
  return paper() + inkIn(at(u, 0, .75), live(CST, t)) + box(CST.p(600, 200), 520, 110, "الجبس", BLUE, at(u, .5, .5), 26) + cross(320, 400, 1.8, at(u, d - 1.1, .5));
});
// 20 · it only holds the two ends still so the soft bridge doesn't break
shot(20, push(CST.p(370, 620)[0], CST.p(370, 620)[1], 1.25, 1.35), function (u, d, t) {
  var c = CST.p(370, 620);
  return paper() + live(CST, t) + arrow(c[0] - 150, c[1], c[0] - 40, c[1], BLUE, 6, at(u, .3, .4)) + arrow(c[0] + 150, c[1], c[0] + 40, c[1], BLUE, 6, at(u, .3, .4)) + tag("بيثبّت", c[0], c[1] - 170, at(u, .8, .3), 28, BLUE);
});
// 21 · what really heals it is your body (the new bone glowing)
shot(21, push(320, 400, .98, 1.05), function (u, d, t) {
  return paper() + live(HRD, t, { cal: .6 + .4 * Math.sin(t * 2) }) + tag("جسمك", 320, 110, at(u, .4, .3), 34, ORANGE);
}, { tr: "out" });
// 22 · in short: clot → soft bridge → calcium → reshaped (four stages, each still moving)
shot(22, push(320, 400, .98, 1.02), function (u, d, t) {
  var cells = [[4, 170, 200], [6, 470, 200], [8, 170, 560], [11, 470, 560]], s = paper();
  cells.forEach(function (c, i) {
    var L = PL(c[0], c[1], c[2], c[0] === 11 ? 180 : 220), id = "rc" + i, k = at(u, i * .8, .4);
    s += G("", '<clipPath id="' + id + '"><rect x="' + (c[1] - 145) + '" y="' + (c[2] - 170) + '" width="290" height="340" rx="8"/></clipPath><rect x="' + (c[1] - 145) + '" y="' + (c[2] - 170) + '" width="290" height="340" rx="8" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><g clip-path="url(#' + id + ')">' + live(L, t, { cal: 1, shrink: .5 + .5 * Math.sin(t) }) + '</g>' + callout(String(i + 1), c[1] - 120, c[2] - 145, k, 18), k);
  });
  return s;
});
// 23 · the odd fact: your body breaks down and builds bone every day
shot(23, push(320, 380, 1.0, 1.06), function (u, d, t) {
  return paper() + live(RMD, t) + tag("كل يوم", 320, 610, at(u, 1.2, .3), 32, ORANGE);
}, { tr: "in" });
// 24 · so much that your whole skeleton renews about every ten years (a band of light runs over it; the years count)
shot(24, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, d - .8);
  return paper() + inkIn(at(u, 0, .75), live(SKL, t, { renew: k })) + G("", N(count(10, k), 520, 380, 80, ORANGE) + T("سنين", 520, 430, 30, INK, 800), at(u, .4, .4));
}, { tr: "out" });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
var IN_WLD = PL(1, 304, 330, 600), IN_LEG = PL(2, 304, 340, 300);
SCENE.intro = function (svg, t, li) {
  if (li === 0) return welder(IN_WLD, t);
  var s = live(IN_LEG, t, { healed: li >= 1 && t - LN[1].start > 1.2 });
  if (li >= 1) s += G("translate(500 90) scale(.6)", stopwatch(0, 0, 112, clamp((t - LN[1].start) / 2.5), t)) + tag("6 أسابيع", 500, 210, ease((t - LN[1].start - .6) / .3), 26, ORANGE);
  if (li >= 2) s += cross(110, 520, 1, ease((t - LN[2].start - .6) / .4));
  return s;
};
SCENE.bumper = function (u, t) { return live(PL(3, 90, 100, 110), t); };
SCENE.outro = function (svg, u, t) {
  var cells = [[4, 75], [6, 225], [8, 375], [11, 525]], s = "";
  cells.forEach(function (c, i) { var L = PL(c[0], c[1], 140, c[0] === 11 ? 90 : 120); s += live(L, t, { cal: 1, shrink: .5 + .5 * Math.sin(t) }) + callout(String(i + 1), c[1] - 50, 40, ease(u / .3 - i * .5)); });
  return s;
};
