// ── «إزاي جهاز السكر بيقيس من نقطة دم؟» — drawings. Real shapes (refs/SOURCES.md): a home meter (screen on top, two
// buttons, the strip port at the bottom edge), an electrochemical test strip (PET base, two printed carbon tracks with
// contact pads, an insulating layer with a window, the dry reagent — enzyme + mediator — over the electrodes, a spacer that
// leaves a capillary channel, a clear top cover with a vent), glucose as a pyranose ring. People: the shared person kit.

var BLOOD = "#a83a2e", BLOOD_L = "#d8796b", STRIP = "#f4f1e8", CARBON = "#3b3936", PLAST = "#d9dcd6", PLAST_D = "#b9bdb5",
    SCREEN = "#c9d3b2", SCREEN_D = "#8f9a78", ENZ = "#8c9455", MED = "#6f93ad", COVER = "#dfe9ee";

// the meter, front view. Centre (x, y), body 220 × 360 at s = 1. opt: {num: "126" | "" , unit, dots: k, cut: k (opens the lower half),
// strip: k (strip in the port, 0..1 pushed in), blood: k (blood in the channel), needle: 0..1, chip: k}
function meter(x, y, s, opt) {
  opt = opt || {}; var o = "", W = 220, H = 360, cut = clamp(opt.cut || 0);
  o += '<rect x="' + f(-W / 2 + 8) + '" y="' + f(-H / 2 + 10) + '" width="' + W + '" height="' + H + '" rx="54" fill="#cfcabc" stroke="none"/>';   // shadow
  o += R(-W / 2, -H / 2, W, H, PLAST, 2.6, 54);
  o += '<path d="M' + f(-W / 2 + 14) + ' ' + f(-H / 2 + 60) + ' Q' + f(-W / 2 + 14) + ' ' + f(-H / 2 + 16) + ' ' + f(-W / 2 + 60) + ' ' + f(-H / 2 + 14) + '" stroke="#f3f4f0" stroke-width="5" fill="none" stroke-linecap="round"/>';
  // screen
  o += R(-80, -150, 160, 112, "#4b5146", 2.2, 14) + R(-70, -140, 140, 92, SCREEN, 1.6, 6);
  if (opt.num != null && opt.num !== "") o += N(opt.num, 0, -80, 46, "#2c3324") + T(opt.unit || "mg/dL", 0, -56, 12, "#2c3324", 700);
  if (opt.dots) for (var i = 0; i < 3; i++) o += '<circle cx="' + (-20 + i * 20) + '" cy="-94" r="6" fill="#2c3324" opacity="' + f(.25 + .75 * clamp(Math.sin(opt.dots * 6 - i * 1.2) * .5 + .5)) + '"/>';
  if (opt.drop) o += '<path d="M0 -122 C10 -106 16 -98 16 -88 A16 16 0 0 1 -16 -88 C-16 -98 -10 -106 0 -122 Z" fill="#2c3324"/>';
  // the inside (the lower half opens as a cut-away)
  if (cut > 0) {
    o += G("", R(-92, -20, 184, 172, "#e9e4d4", 2, 18) + hatch("M-92 -20 h184 v172 h-184 Z"), cut);
    o += G("", chipSvg(40, 20, 1, opt.chip || 0) + gaugeSvg(-40, 80, 34, opt.needle || 0) +
      '<path d="M-40 114 V150 M-8 150 V150" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M-14 152 V130 M14 152 V130" stroke="' + CARBON + '" stroke-width="3"/>' +
      '<path d="M-14 130 V80 H-6 M14 130 V110 H40 V46" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' +
      '<path d="M40 -6 V-38" stroke="' + INK + '" stroke-width="1.8" stroke-dasharray="4 3"/>' +
      batt(-56, 10, 1), cut);
  } else {
    o += C(0, 20, 30, "#e4e6e0", 2.4) + C(0, 20, 20, "none", 1.2);
    o += R(-62, 74, 50, 18, "#e4e6e0", 2, 9) + R(12, 74, 50, 18, "#e4e6e0", 2, 9);
  }
  // strip port at the bottom edge, and the strip
  o += R(-26, H / 2 - 8, 52, 12, "#3c3a35", 1.6, 3);
  if (opt.strip != null) o += G("translate(0 " + f(H / 2 + 116 - 110 * clamp(opt.strip)) + ")", stripTop(0, 0, 1, opt.blood || 0));
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", o);
}
function batt(x, y, s) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", R(-14, -26, 28, 52, "#7c8a92", 1.8, 4) + R(-6, -32, 12, 6, "#7c8a92", 1.4, 1) + T("+", 0, -8, 16, "#fff", 800) + T("−", 0, 18, 18, "#fff", 800)); }
function chipSvg(x, y, s, k) {
  var o = R(-26, -26, 52, 52, "#2f3332", 2, 4), i;
  for (i = 0; i < 5; i++) { o += '<path d="M' + (-18 + i * 9) + ' -26 V-34 M' + (-18 + i * 9) + ' 26 V34 M-26 ' + (-18 + i * 9) + ' H-34 M26 ' + (-18 + i * 9) + ' H34" stroke="' + INK + '" stroke-width="2.4"/>'; }
  o += R(-16, -16, 32, 32, k > 0 ? ORANGE : "#4a4f4d", 1.2, 2) + (k > 0 ? '<rect x="-16" y="-16" width="32" height="32" fill="#fff" opacity="' + f(.35 * (.5 + .5 * Math.sin(window.__t * 9))) + '"/>' : "");
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + s + ")", o);
}
// a moving-coil current meter: needle 0..1 across the arc
function gaugeSvg(x, y, r, v) {
  var o = C(0, 0, r, "#f7f3e8", 2.2), i, a;
  for (i = 0; i <= 8; i++) { a = Math.PI * (1.15 + .7 * i / 8); o += '<path d="M' + f(Math.cos(a) * r * .72) + ' ' + f(Math.sin(a) * r * .72) + ' L' + f(Math.cos(a) * r * .9) + ' ' + f(Math.sin(a) * r * .9) + '" stroke="' + (i > 5 ? ORANGE : INK) + '" stroke-width="' + (i % 4 ? 1.4 : 2.4) + '"/>'; }
  a = Math.PI * (1.15 + .7 * clamp(v)); o += '<path d="M0 ' + f(r * .25) + ' L' + f(Math.cos(a) * r * .82) + ' ' + f(Math.sin(a) * r * .82) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round"/>' + C(0, r * .25, 4, INK, 0) + T("µA", 0, r * .62, r * .3, INK, 700);
  return G("translate(" + f(x) + " " + f(y) + ")", o);
}
// the strip, top view, vertical: contact end at the top (y 0), sample end at the bottom (y 230). Width 44 at s = 1.
// blood: 0..1 how far the channel has filled (from the tip upward)
function stripTop(x, y, s, blood) {
  var o = R(-22, 0, 44, 230, STRIP, 2, 4);
  o += '<path d="M-10 2 V150 M10 2 V150" stroke="' + CARBON + '" stroke-width="5"/>';   // printed carbon tracks
  o += R(-14, 4, 10, 26, "#c9b26a", 1, 1) + R(4, 4, 10, 26, "#c9b26a", 1, 1);          // contact pads
  o += R(-22, 150, 44, 66, COVER, 1.6, 2);                                            // the clear cover over the channel
  o += R(-12, 158, 24, 52, ENZ, 1.2, 2, ' opacity=".55"');                            // reagent pad
  if (blood > 0) { var h = 72 * clamp(blood); o += '<rect x="-12" y="' + f(230 - h) + '" width="24" height="' + f(h) + '" fill="' + BLOOD + '" opacity=".85"/>'; }
  o += '<path d="M-12 230 V158 M12 230 V158" stroke="' + INK + '" stroke-width="1.4"/>' + C(0, 154, 3, PAPER, 1.2);   // channel walls, vent
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s) + ")", o);
}
// glucose: a six-ring (five carbons and an oxygen) with OH sticks
function glu(x, y, r, k, col) {
  k = k == null ? 1 : k; if (k <= 0) return ""; var p = [], i, o = "";
  for (i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; p.push([Math.cos(a) * r, Math.sin(a) * r]); }
  for (i = 0; i < 6; i++) { var q = p[i]; o += '<path d="M' + f(q[0]) + ' ' + f(q[1]) + ' L' + f(q[0] * 1.55) + ' ' + f(q[1] * 1.55) + '" stroke="' + INK + '" stroke-width="' + f(r * .09) + '"/>' + (i === 4 ? "" : C(q[0] * 1.62, q[1] * 1.62, r * .16, "#f4ecdb", r * .06)); }
  o += '<path d="M' + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + (col || "#efc06a") + '" stroke="' + INK + '" stroke-width="' + f(r * .12) + '" stroke-linejoin="round"/>';
  o += C(p[4][0], p[4][1], r * .2, ORANGE, r * .06);
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(pop(k)) + ")", o);
}
// the enzyme: a folded protein blob with a glucose-shaped pocket on its right side
function enzyme(x, y, s, k) {
  k = k == null ? 1 : k; if (k <= 0) return "";
  var o = '<path d="M-70 -40 C-60 -78 -10 -86 22 -70 C46 -60 52 -46 46 -32 L30 -26 L30 26 L46 32 C54 52 40 74 6 78 C-36 84 -78 62 -82 22 C-86 -4 -78 -22 -70 -40 Z" fill="' + ENZ + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
  o += '<path d="M-56 -30 C-40 -50 -10 -54 8 -46 M-60 6 C-40 -6 -20 10 -4 0 M-50 40 C-30 54 -6 58 14 50" stroke="#6c7340" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * pop(k)) + ")", o);
}
function electron(x, y, r, k) { k = k == null ? 1 : k; if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(pop(k)) + ")", C(0, 0, r, ORANGE, 1.6) + T("e⁻", 0, r * .38, r * 1.05, "#fff", 800)); }
function mediator(x, y, r, loaded) { return C(x, y, r, MED, 1.8) + (loaded ? electron(x + r * .2, y - r * .9, r * .55) : ""); }
function bloodDrop(x, y, s, k) { k = k == null ? 1 : k; if (k <= 0) return ""; return G("translate(" + f(x) + " " + f(y) + ") scale(" + f(s * pop(k)) + ")", '<path d="M0 -30 C10 -14 18 -4 18 8 A18 18 0 0 1 -18 8 C-18 -4 -10 -14 0 -30 Z" fill="' + BLOOD + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 4 Q-8 -6 -2 -12" stroke="' + BLOOD_L + '" stroke-width="3" fill="none" stroke-linecap="round"/>'); }
// a fingertip seen from the side, pointing down-right (for the prick and the sample)
function finger(x, y, s, ang) {
  var o = '<path d="M-150 -34 L-10 -30 C20 -30 38 -12 38 6 C38 26 20 36 -4 34 L-150 34 Z" fill="' + PERSON.colors.skin + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  o += '<path d="M-6 -28 C10 -26 20 -18 24 -8 L2 -8 C-4 -14 -8 -20 -6 -28 Z" fill="#f1d3c3" stroke="' + INK + '" stroke-width="1.6"/>';   // nail
  o += '<path d="M-70 -30 Q-74 0 -70 32 M-110 -32 Q-106 0 -110 33" stroke="' + PERSON.colors.skinD + '" stroke-width="2" fill="none"/>';     // knuckle creases
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang || 0) + ") scale(" + f(s) + ")", o);
}

// ── the cut through the strip (side view, layers), 560 wide. open: 0..1 explodes the layers apart; blood 0..1 fills the channel
function stripCut(x, y, open, blood, t) {
  var g = 30 * open, o = "", L = 560, i;
  // bottom-up: [name, height, fill]; each layer lifts by g more than the one under it when exploded
  var st = [["base", 34, STRIP], ["electrodes", 10, CARBON], ["reagent", 16, ENZ], ["spacer", 40, "#efe7cf"], ["cover", 22, COVER]], yy = 0, Y = {};
  st.forEach(function (q, j) { yy -= q[1]; var top = yy - g * j; Y[q[0]] = [top, q[1]];
    if (q[0] === "spacer") { o += R(0, top, 200, q[1], q[2], 2) + R(360, top, 200, q[1], q[2], 2); return; }   // the gap in the spacer is the channel
    o += R(0, top, L, q[1], q[2], 2) + (q[0] === "base" ? hatch("M0 " + f(top) + " h" + L + " v" + q[1] + " h-" + L + " Z") : "");
  });
  o += C(500, Y.cover[0] + 11, 5, PAPER, 1.6);   // vent
  if (blood > 0) { var w = 160 * clamp(blood), sy = Y.spacer[0]; o += '<rect x="' + f(360 - w) + '" y="' + f(sy + 1) + '" width="' + f(w) + '" height="' + f(38) + '" fill="' + BLOOD + '" opacity=".8"/>';
    for (i = 0; i < 6; i++) { var cx = 360 - w + ((i * 37 + t * 30) % Math.max(20, w)); o += '<ellipse cx="' + f(cx) + '" cy="' + f(sy + 20 + 8 * Math.sin(i)) + '" rx="8" ry="4.5" fill="' + BLOOD_L + '"/>'; } }
  return G("translate(" + f(x) + " " + f(y) + ")", o);
}
// y of a layer's top in stripCut, for labels
function cutY(name, open) { var g = 30 * open, h = { base: 34, electrodes: 10, reagent: 16, spacer: 40, cover: 22 }, ord = ["base", "electrodes", "reagent", "spacer", "cover"], yy = 0; for (var j = 0; j < 5; j++) { yy -= h[ord[j]]; if (ord[j] === name) return yy - g * j + h[name] / 2; } }

// the person (shared kit) sitting at a table: the viewer-left hand points a finger up, the other holds a small meter.
// x, y: between the hips; s: scale; opt.face; opt.num on the meter; opt.smear: juice on the fingertip
function patient(x, y, s, t, opt) {
  opt = opt || {}; var H = 400 * s, shY = y - .298 * H, ra = -90;
  var p = PERSON.front({ x: x, y: y, s: s, legs: "sit", breath: .5 + .5 * Math.sin(t * 2),
    arms: [{ to: [x - .19 * H, shY + .07 * H], bend: -1, hand: "point", rot: ra, front: true }, { to: [x + .14 * H, shY + .2 * H], bend: 1, hand: "fist", rot: -20 }],
    head: { tilt: -6 + 2 * Math.sin(t * 1.4), turn: -.25 }, face: Object.assign({ eyes: Math.sin(t * 2.3) > .97 ? .1 : 1, look: [-.7, -.2], brows: "raised", mouth: "o" }, opt.face || {}), outfit: "casual" });
  var w = p.joints.wr[0], w1 = p.joints.wr[1], tip = [w[0] + Math.cos(ra * Math.PI / 180) * .11 * H, w[1] + Math.sin(ra * Math.PI / 180) * .1 * H];
  var desk = R(x - .62 * H, y - .02 * H, 1.24 * H, .06 * H, "#b88a5c", 2.2) + R(x - .58 * H, y + .04 * H, 1.16 * H, .16 * H, WOOD, 2.2) + '<path d="M' + f(x - .58 * H) + ' ' + f(y + .12 * H) + ' h' + f(1.16 * H) + '" stroke="' + WOOD_D + '" stroke-width="2"/>';
  return { svg: meter(w1[0] + .01 * H, w1[1] - .05 * H, s * .2, { num: opt.num == null ? "" : opt.num, drop: opt.num == null, strip: 1, blood: opt.blood || 0 }) + p.svg + desk, tip: tip, meterAt: [w1[0] + .03 * H, w1[1] - .06 * H] };
}
// ── shots (panel world 640 × 786) ──
// 3 · (bumper) · 4 · the meter doesn't look at the blood: an eye looking at the screen, crossed out
shot(4, push(320, 390, 1.06, 0.98), function (u, d, t) {
  var s = paper() + meter(320, 400, 1.05, { strip: 1, blood: 1, num: "", drop: true });
  var ek = at(u, .2, .4), eye = '<path d="M-60 0 Q0 -46 60 0 Q0 46 -60 0 Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="3"/>' + C(6 * Math.sin(t * 2), 0, 20, BLUE, 2) + C(6 * Math.sin(t * 2), 0, 8, INK, 0);
  s += G("translate(150 160)", eye, ek) + draw("M210 170 L270 240", ek, INK, 2.4, ' stroke-dasharray="7 6"');
  return s + cross(150, 160, 1.6, at(u, d * .55, .5));
});
// 5 · the work is all in the strip: push into the port
shot(5, push(320, 560, 1.0, 1.5), function (u, d, t) {
  var k = at(u, .2, 1.2); return paper() + dim(k * .7, meter(320, 330, 1.0, { strip: 1, num: "" })) +
    G("", '<rect x="290" y="505" width="60" height="245" rx="6" fill="none" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="9 6"/>', k) + label(340, 650, 440, 700, "الشريط", OLIVE, at(u, .9, .5), 26);
}, { tr: "in" });
// 6 · a thin channel sucks the blood in by itself — the strip close-up, the finger's drop at the tip
shot(6, push(320, 420, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .8, d - 1.6), s = paper();
  s += G("translate(320 60) scale(2.4)", stripTop(0, 0, 1, k));
  s += bloodDrop(320, 640 + 26 * (1 - at(u, .2, .6)), 1.3 * (1 - .6 * k), 1);
  s += label(338, 560, 500, 480, "قناة رفيعة", OLIVE, at(u, .4, .5), 24) + arrow(360, 600 - 120 * k, 360, 540 - 120 * k, ORANGE, 4, at(u, .9, .3));
  s += iconBox(130, 140, 150, '<rect x="-40" y="-6" width="80" height="44" fill="' + SEA_TOP + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="-14" y="' + f(-46 + 0) + '" width="28" height="' + f(60) + '" fill="#f7f3e8" stroke="' + INK + '" stroke-width="1.6"/><rect x="-14" y="' + f(14 - 36 * clamp(u / 3)) + '" width="28" height="' + f(36 * clamp(u / 3)) + '" fill="' + SEA_TOP + '" opacity=".8"/>', at(u, 1.6, .4));
  return s;
});
// 7 · the layers: enzyme layer and two printed tracks (cut through the strip, exploded)
shot(7, push(320, 440, 1.0, 1.06), function (u, d, t) {
  var op = at(u, .2, 1), Y0 = 520, s = paper() + stripCut(40, Y0, op, 1, t);
  s += label(160, Y0 + cutY("reagent", op), 190, 230, "طبقة الإنزيم", OLIVE, at(u, 1.2, .5), 26);
  s += label(420, Y0 + cutY("electrodes", op), 470, 650, "سلكين مرسومين", BLUE, at(u, 2.2, .5), 26);
  s += label(160, Y0 + cutY("base", op), 150, 700, "بلاستيك", INK, at(u, 2.8, .5), 24);
  s += label(320, Y0 + cutY("spacer", op), 470, 200, "القناة", ORANGE, at(u, .8, .5), 26);
  return s;
}, { tr: "out" });
// 8 · the enzyme only takes glucose: a key-and-lock fit; other molecules bounce off
shot(8, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .4, 1.4), s = paper() + enzyme(250, 420, 2.2, 1);
  var gx = lerp(560, 340, k), gy = 420 + 12 * Math.sin(t * 3) * (1 - k);
  s += glu(gx, gy, 34, 1);
  var bx = 520 - 40 * Math.sin(Math.min(u, 2) * 1.6), other = G("translate(" + f(bx) + " 650)", R(-26, -18, 52, 36, "#c7b7d6", 2, 10) + C(-34, 0, 10, "#c7b7d6", 2) + C(34, 0, 10, "#c7b7d6", 2));
  s += other + cross(bx, 650, .6, at(u, 1.8, .4)) + check(gx + 10, gy - 80, .9, at(u, 1.6, .4), OLIVE);
  s += label(160, 340, 120, 210, "إنزيم", OLIVE, at(u, .2, .5), 26) + label(gx + 30, gy + 34, 540, 560, "جلوكوز", ORANGE, at(u, .6, .5), 24);
  return s + iconBox(520, 130, 140, '<circle cx="-14" cy="-6" r="16" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M2 -6 H36 M26 -6 V8 M34 -6 V6" stroke="' + INK + '" stroke-width="5" fill="none"/>' + T("مفتاح وقفل", 0, 48, 16, INK, 700), at(u, d * .5, .4));
});
// 9 · as soon as it grabs a glucose it pulls electrons out of it
shot(9, push(300, 420, 1.1, 1.0), function (u, d, t) {
  var s = paper() + enzyme(250, 420, 2.2, 1) + glu(342, 420, 34, 1);
  for (var i = 0; i < 2; i++) { var k = at(u, .5 + i * .5, 1.1), a = -1.1 + i * .7; s += electron(342 + Math.cos(a) * 150 * k + 6 * Math.sin(t * 4 + i), 420 + Math.sin(a) * 150 * k, 20, at(u, .4 + i * .5, .3)); }
  return s + label(470, 310, 420, 180, "إلكترونات", ORANGE, at(u, 1.6, .5), 26);
});
// 10 · a second chemical (the mediator) carries them to the electrode, like a delivery rider
shot(10, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var s = paper() + R(-20, 600, 680, 60, CARBON, 2) + T("السلك", 320, 640, 24, "#f3efe4", 800);
  s += enzyme(160, 300, 1.4, 1) + glu(218, 300, 22, 1);
  var cyc = ((u * .55) % 1), mx = lerp(280, 470, Math.min(1, cyc * 1.4)), my = lerp(330, 560, Math.min(1, cyc * 1.4));
  s += '<path d="M280 330 Q360 380 470 560" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="6 6" fill="none"/>';
  s += mediator(mx, my, 26, cyc < .7);
  if (cyc >= .7) s += electron(470, 600 - 30 * (cyc - .7) / .3, 14);
  for (var i = 0; i < 5; i++) { var ex = (40 + i * 130 + u * 90) % 680 - 20; s += electron(ex, 630, 10, at(u, 1, .3)); }
  s += label(mx - 18, my - 10, 120, 470, "مادة ناقلة", BLUE, at(u, .5, .5), 24);
  return s + iconBox(520, 150, 150, '<rect x="-24" y="-30" width="34" height="30" rx="3" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-40 14 H30 L40 -6 M-30 14 L-20 -6 H6" stroke="' + INK + '" stroke-width="3.4" fill="none" stroke-linejoin="round"/>' + C(-34, 20, 12, "#f4ecdb", 3) + C(34, 20, 12, "#f4ecdb", 3) + T("ديليفري", 0, 56, 16, INK, 700), at(u, 1.6, .4));
});
// 11 · the meter puts a small voltage across the strip and measures the current (cut-away)
shot(11, push(320, 470, 1.0, 1.12), function (u, d, t) {
  var s = paper() + meter(320, 360, 1.3, { strip: 1, blood: 1, dots: t, cut: at(u, .2, .8), needle: .15 + .05 * Math.sin(t * 3) });
  s += label(247, 373, 140, 230, "بطارية", INK, at(u, 1.2, .5), 22) + label(268, 464, 150, 600, "عداد تيار", ORANGE, at(u, 1.8, .5), 24);
  return s + G("", N("0.3 V", 520, 250, 30, BLUE), at(u, 2.6, .4)) + T("فرق جهد", 520, 285, 20, BLUE, 700).replace("<text", '<text opacity="' + f(at(u, 2.6, .4)) + '"');
}, { tr: "in" });
// 12 · more sugar → more electrons → more current (two strips side by side and a rising line)
shot(12, push(320, 400, 1.0, 1.04), function (u, d, t) {
  var s = paper(), k = at(u, .3, d - .8);
  [[170, 2, "سكر قليل"], [470, 6, "سكر كتير"]].forEach(function (q, j) {
    s += R(q[0] - 110, 220, 220, 260, "#f7f2e3", 2, 10);
    for (var i = 0; i < q[1]; i++) s += glu(q[0] - 70 + (i % 3) * 70, 270 + Math.floor(i / 3) * 70 + 4 * Math.sin(t * 3 + i), 16, at(u, .2 + i * .12 + j * .3, .3));
    for (var e = 0; e < q[1] * 2; e++) { var ey = 430 + ((e * 17 + t * 60 * (j ? 1.6 : 1)) % 40); s += electron(q[0] - 90 + e * 180 / (q[1] * 2), ey, 7); }
    s += gaugeSvg(q[0], 600, 60, j ? .2 + .65 * k : .2 + .15 * k) + T(q[2], q[0], 200, 24, j ? ORANGE : INK, 800);
  });
  return s;
});
// 13 · the meter is counting electrons, like a counter at a toll gate counting cars
shot(13, push(320, 420, 1.04, 0.98), function (u, d, t) {
  var s = paper() + R(-40, 440, 720, 70, CARBON, 2);
  s += '<path d="M330 320 V440" stroke="' + INK + '" stroke-width="4"/>' + R(290, 260, 80, 64, "#f7f3e8", 2.4, 6) + N(String(100 + Math.floor(u * 9)), 330, 304, 26, ORANGE);
  s += '<path d="M330 440 V520" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="6 5"/>';
  for (var i = 0; i < 8; i++) { var x = (i * 90 + u * 150) % 760 - 60; s += electron(x, 475, 18); }
  return s + iconBox(510, 140, 170, '<rect x="-60" y="10" width="120" height="8" fill="' + GREY + '"/><path d="M-10 10 V-40 L40 -40" stroke="' + INK + '" stroke-width="4" fill="none"/>' + R(-48 + ((u * 40) % 50), -8, 34, 18, ORANGE, 1.6, 4) + C(-40 + ((u * 40) % 50), 12, 4, INK, 0) + C(-22 + ((u * 40) % 50), 12, 4, INK, 0) + T("بوابة", 0, 50, 16, INK, 700), at(u, 1.6, .4));
});
// 14 · a chip turns the current into a number: 126 mg/dL
shot(14, push(320, 380, 1.12, 1.0), function (u, d, t) {
  var k = at(u, 1.6, 1.6), s = paper() + meter(320, 380, 1.3, { strip: 1, blood: 1, cut: 1, chip: at(u, .6, .3), needle: .62 + .02 * Math.sin(t * 4), num: k > 0 ? count(126, k) : "" });
  s += draw("M374 404 L374 230", at(u, .9, .6), ORANGE, 4, ' stroke-dasharray="8 6"');
  return s + label(372, 404, 520, 520, "شريحة", OLIVE, at(u, .3, .5), 24) + numBox("126", 540, 160, at(u, 3.4, .3), 34);
}, { tr: "out" });
// 15 · the strip is the real device; the box in your hand is just a calculator
shot(15, push(320, 400, 1.0, 1.06), function (u, d, t) {
  var s = paper() + G("translate(180 120) scale(2.2)", stripTop(0, 0, 1, 1)) + check(180, 690, 1.2, at(u, .6, .5), OLIVE);
  s += tag("الجهاز الحقيقي", 180, 80, at(u, .3, .4), 26, OLIVE);
  s += dim(at(u, 2, .6), meter(470, 360, .85, { num: "126" }));
  return s + iconBox(470, 640, 150, R(-34, -44, 68, 88, "#d9dcd6", 2, 8) + R(-24, -34, 48, 20, SCREEN, 1.4, 2) + [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (c) { return R(-24 + c * 18, -6 + r * 16, 12, 11, "#f4ecdb", 1.2, 2); }).join(""); }).join("") + T("آلة حاسبة", 0, 66, 16, INK, 700), at(u, 2.4, .4));
});
// 16 · whatever spoils the strip spoils the number
shot(16, push(320, 400, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .3, .5), s = paper() + G("translate(180 140) scale(2)", stripTop(0, 0, 1, 1));
  s += draw("M150 360 L200 400 L168 440 L214 480", k, ORANGE, 5) + arrow(260, 380, 360, 380, INK, 5, at(u, .7, .4));
  var g = Math.floor(t * 8) % 3, num = ["126", "198", "88"][g];
  return s + meter(480, 380, .9, { num: at(u, 1, .2) > .5 ? num : "126" }) + cross(480, 300, .9, at(u, 1.6, .4));
});
// 17 · heat, humidity and an expired strip weaken the enzyme
shot(17, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k = at(u, .3, d - .6);
  s += G("", enzyme(320, 440, 1.8, 1), 1 - .55 * k);
  s += sun(130, 170, 50, t) + T("الحر", 130, 270, 24, ORANGE, 800);
  for (var i = 0; i < 4; i++) s += G("translate(" + (300 + i * 28) + " " + f(150 + ((t * 40 + i * 20) % 50)) + ") scale(.45)", '<path d="M0 -30 C10 -14 18 -4 18 8 A18 18 0 0 1 -18 8 C-18 -4 -10 -14 0 -30 Z" fill="' + SEA_TOP + '" stroke="' + INK + '" stroke-width="3"/>', at(u, .6, .3));
  s += G("", T("الرطوبة", 340, 270, 24, BLUE, 800), at(u, .6, .3));
  s += G("translate(520 180)", R(-50, -50, 100, 96, "#f7f3e8", 2.2, 6) + R(-50, -50, 100, 24, ORANGE, 2.2, 6) + N("EXP", 0, 18, 22, INK) + T("منتهي", 0, 76, 22, INK, 800), at(u, 1.2, .3));
  return s + label(260, 500, 180, 660, "إنزيم ضعيف", OLIVE, at(u, 1.8, .5), 24);
});
// 18 · a trace of juice on the finger → a higher number; wash your hands first (the person kit, the same seated pose)
shot(18, push(320, 340, 1.12, 1.2), function (u, d, t) {
  var s = paper(), wash = at(u, d * .62, .5);
  var p = patient(300, 600, 1.4, t, { num: wash > .5 ? "126" : "180", blood: 1, face: wash > 0 ? { brows: "raised", mouth: "smile", look: [.3, .4] } : { brows: "worried", mouth: "o" } });
  s += p.svg + G("", C(p.tip[0], p.tip[1] + 6, 11, ORANGE, 0).replace("<circle", '<circle opacity=".7"'), 1 - wash);
  s += label(p.tip[0] - 6, p.tip[1] + 4, 130, 330, "أثر عصير", ORANGE, at(u, .6, .5) * (1 - wash), 22);
  s += numBox(wash > .5 ? "126" : "180", 500, 180, at(u, 1, .3), 44) + G("", cross(500, 180, 1, 1), (1 - wash) * at(u, 1.6, .3)) + G("", check(580, 140, .8, 1, OLIVE), wash);
  s += iconBox(110, 130, 130, '<path d="M-30 -40 h60 l-8 80 h-44 Z" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/><path d="M-26 -10 h52 l-5 46 h-42 Z" fill="' + ORANGE + '"/>' + T("عصير", 0, 56, 16, INK, 700), at(u, .3, .4) * (1 - wash));
  return s + iconBox(110, 130, 130, '<path d="M-36 -30 H10 Q30 -30 30 -10 V0" stroke="' + INK + '" stroke-width="8" fill="none"/>' + [0, 1, 2].map(function (i) { return '<path d="M30 ' + f(10 + ((t * 50 + i * 14) % 30)) + ' v8" stroke="' + BLUE + '" stroke-width="4" stroke-linecap="round"/>'; }).join("") + T("اغسل إيدك", 0, 56, 15, INK, 700), wash);
});
// 19 · many think the number is exact — no
shot(19, push(320, 400, 1.08, 1.0), function (u, d, t) {
  return paper() + meter(320, 400, 1.2, { num: "126" }) + tag("بالظبط؟", 320, 130, at(u, .2, .4), 34) + cross(320, 130, 1.4, at(u, d * .7, .4));
});
// 20 · the standard allows up to 15%: 126 can really be anything from about 107 to 145
shot(20, push(320, 420, 1.0, 1.04), function (u, d, t) {
  var k = at(u, .4, 1.2), s = paper(), x0 = 80, x1 = 560, X = function (v) { return lerp(x0, x1, (v - 90) / 70); };
  s += '<path d="M' + x0 + ' 470 H' + x1 + '" stroke="' + INK + '" stroke-width="3"/>';
  for (var v = 90; v <= 160; v += 10) s += '<path d="M' + f(X(v)) + ' 462 V478" stroke="' + INK + '" stroke-width="2"/>' + N(String(v), X(v), 504, 18, INK);
  s += '<rect x="' + f(X(126) - (X(145) - X(126)) * k) + '" y="440" width="' + f((X(145) - X(107)) * k) + '" height="60" fill="' + ORANGE + '" opacity=".25"/>';
  s += '<path d="M' + f(X(126)) + ' 420 V520" stroke="' + ORANGE + '" stroke-width="4"/>' + N("126", X(126), 404, 34, ORANGE);
  s += G("", N("107", X(107), 560, 24, INK) + N("145", X(145), 560, 24, INK), at(u, 1.4, .4));
  return s + numBox("±15%", 320, 250, at(u, .9, .3), 54) + G("", T("ISO 15197", 320, 640, 22, GREY, 700) + T("في 95 من كل 100 قراية", 320, 676, 20, INK, 700), at(u, 2, .4));
});
// 21 · in short: enzyme grabs the sugar → electrons run in the wire → the meter counts them → a number
shot(21, push(320, 400, 0.96, 1.02), function (u, d, t) {
  var s = paper(), xs = [120, 320, 520], y = 340;
  s += enzyme(xs[0] - 10, y, .9, at(u, .2, .4)) + glu(xs[0] + 34, y, 15, at(u, .2, .4));
  s += G("", R(xs[1] - 90, y - 16, 180, 32, CARBON, 2) + [0, 1, 2].map(function (i) { return electron(xs[1] - 80 + ((i * 60 + u * 70) % 160), y, 10); }).join(""), at(u, 1.4, .4));
  s += G("", meter(xs[2], y + 10, .5, { num: at(u, 3.4, .3) > .5 ? "126" : "", dots: at(u, 3.4, .3) > .5 ? 0 : t }), at(u, 2.6, .4));
  s += arrow(170, y, 220, y, INK, 4, at(u, 1.2, .3)) + arrow(420, y, 460, y, INK, 4, at(u, 2.4, .3));
  [["الإنزيم", OLIVE], ["السلك", BLUE], ["رقم", ORANGE]].forEach(function (q, i) { s += callout(String(i + 1), xs[i], y + 150, at(u, .4 + i * 1.2, .3)) + G("", T(q[0], xs[i], y + 210, 24, q[1], 800), at(u, .5 + i * 1.2, .3)); });
  return s;
}, { tr: "out" });
// 22 · the odd fact: the first portable meter (1970) weighed over a kilo and read the strip's colour
shot(22, push(320, 400, 1.0, 1.05), function (u, d, t) {
  var s = paper(), k = at(u, .2, .5);
  s += G("translate(250 430)", R(-170, -110, 340, 220, "#c7bfa9", 2.6, 14) + R(-150, -90, 160, 90, "#3e3d39", 2, 4) + '<path d="M-130 -10 A40 40 0 0 1 -30 -10" stroke="#f2efe4" stroke-width="2" fill="none"/><path d="M-80 -10 L' + f(-80 + 36 * Math.cos(-2.2 + .9 * clamp(u / 2))) + ' ' + f(-10 + 36 * Math.sin(-2.2 + .9 * clamp(u / 2))) + '" stroke="' + ORANGE + '" stroke-width="3"/>' +
       R(40, -80, 110, 40, "#a9a28d", 1.8, 4) + T("AMES", 95, -54, 18, INK, 800) + C(70, 40, 18, "#a9a28d", 2) + C(120, 40, 18, "#a9a28d", 2) + R(-40, 64, 60, 14, "#2f2e2a", 1.4, 2), k);
  s += G("", R(410, 520, 26, 120, STRIP, 2, 3) + R(410, 600, 26, 34, "#5d6aa0", 1.4, 2) + T("لون", 423, 680, 22, BLUE, 800), at(u, d * .6, .4));
  s += numBox("1970", 320, 180, at(u, .5, .3), 50) + G("", N(">1 kg", 520, 330, 34, ORANGE), at(u, 1.6, .4));
  return s + G("", meter(140, 650, .35, { num: "126" }) + T("دلوقتي", 140, 740, 18, INK, 700), at(u, 2.4, .4));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: a person looking at a fingertip with a drop. line 1: the drop next to a lentil. line 2: the meter counts to 126 in 5 seconds
  var s = "";
  if (li === 0) {
    var p = patient(320, 560, 1.75, t);
    return p.svg + bloodDrop(p.tip[0], p.tip[1] - 3 + 1.5 * Math.sin(t * 3), .4, ease((t - LN[0].start) / .5)) + G("", T("؟", 500, 110, 90, ORANGE, 800), ease((t - LN[0].start - .6) / .4));
  }
  if (li === 1) {
    var u = t - LN[1].start;
    var fy = 14 * Math.sin(t * 2.1); s += finger(330 + 10 * Math.sin(t * 1.3), 250 + fy, 1.6, 20 + 6 * Math.sin(t * 1.5)) + bloodDrop(368 + 10 * Math.sin(t * 1.3), 380 + fy + 10 * Math.sin(t * 3.1), 1.6 * (1 + .06 * Math.sin(t * 4)), ease(u / .5));
    s += G("translate(220 560)", '<ellipse rx="44" ry="30" fill="#c98a4a" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 -6 Q0 -22 30 -6" stroke="#e0a868" stroke-width="3" fill="none"/>' + T("عدسة", 0, 70, 26, INK, 800), ease((u - 1) / .4));
    return s + G("", bloodDrop(420, 566, .75, 1) + T("نقطة الدم", 420, 630, 26, ORANGE, 800), ease((u - 1.5) / .4));
  }
  var u2 = t - LN[2].start, k = clamp(u2 / 0.9);
  s += meter(220, 330, 1.05, { strip: 1, blood: 1, num: count(126, k) });
  var a = -Math.PI / 2 + k * Math.PI * 2 * .83;
  s += G("translate(480 200)", C(0, 0, 70, "#f4ecdb", 3) + '<path d="M0 0 L0 -70 A70 70 0 ' + (k > .6 ? 1 : 0) + ' 1 ' + f(70 * Math.cos(a)) + ' ' + f(70 * Math.sin(a)) + ' Z" fill="' + ORANGE + '" opacity=".3"/>' + '<path d="M0 0 L' + f(56 * Math.cos(a)) + ' ' + f(56 * Math.sin(a)) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + R(-12, -92, 24, 14, INK, 0, 2) + N("5s", 0, 120, 40, ORANGE));
  return s;
};
SCENE.bumper = function (u, t) {
  return meter(90, 104, .38, { num: "", drop: true, strip: 1, blood: .5 + .5 * Math.sin(t * 2) }) + bloodDrop(150, 60 + 6 * Math.sin(t * 2.5), .8, 1);
};
SCENE.outro = function (svg, u, t) {
  return G("translate(70 20) scale(1.0)", stripTop(0, 0, 1, 1)) + enzyme(200, 150, .7, 1) + glu(232, 150, 12, 1) +
    R(270, 190, 150, 22, CARBON, 1.6) + [0, 1, 2].map(function (i) { return electron(280 + ((i * 50 + t * 50) % 130), 201, 8); }).join("") +
    meter(510, 140, .62, { num: "126" }) + arrow(430, 200, 455, 180, INK, 3, 1) +
    callout("1", 110, 210, ease(u / .3)) + callout("2", 200, 90, ease(u / .3 - .5)) + callout("3", 345, 240, ease(u / .3 - 1)) + callout("4", 590, 40, ease(u / .3 - 1.5))
};
