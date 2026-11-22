// ── «ليه لهب الشمعة بيطلع لفوق؟» — drawings. The hook and the flame drawings follow the reference the user sent (a candle
// tipped on its side, cut-open air boxes of molecules, a balance, stream lines, the round flame in orbit; refs/SOURCES.md),
// drawn in our own «اسكتش» hand on the cream card. People are the shared person kit (videos/_templates/people/person.js).

// ── materials ──
var WAX = "#efe4cc", WAX_D = "#d6c7a6", FL_Y = "#f0b53c", FL_O = "#e48a2e", FL_C = "#f8e6a8", FL_B = "#5f86c0", GLOW = "#f3cf73",
    HOT = ORANGE, COOL = BLUE, GLASS = "#dfe6e2", WATER = "#9fb7c3", WATER_D = "#6f8ea2", OIL = "#d9b04a";

// a candle standing on its base at (0,0), length len, width w, drawn upright (rotate it with G); a melted rim and one drip
function candleBody(len, w, lit) {
  var s = R(-w / 2, -len, w, len, WAX, 2.2, 3) + R(w / 2 - w * .28, -len + 2, w * .22, len - 4, WAX_D, 0);
  s += '<path d="M' + f(-w / 2) + ' ' + f(-len + 4) + ' Q' + f(-w / 2 + 4) + ' ' + f(-len + 10) + ' ' + f(-w / 2 + 6) + ' ' + f(-len + 26) + ' q3 6 6 0 Q' + f(-w / 2 + 12) + ' ' + f(-len + 8) + ' ' + f(-w / 2 + 14) + ' ' + f(-len + 3) + '" fill="#f6eedb" stroke="' + INK + '" stroke-width="1.6"/>';
  s += '<ellipse cx="0" cy="' + f(-len) + '" rx="' + f(w / 2) + '" ry="' + f(w * .16) + '" fill="#f6eedb" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M0 ' + f(-len) + ' q1 -7 -1 -13" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return s;
}
// the wick tip of a candle placed at (x,y) rotated a degrees, length len
function tipOf(x, y, a, len) { var r = a * Math.PI / 180; return [x + Math.sin(r) * (len + 12), y - Math.cos(r) * (len + 12)]; }
// the flame: root at (x,y), always points up. s scale, t time. o.round 0..1 → a ball, o.blue 0..1 → the blue orbit flame,
// o.glow (default 1), o.long (stretch), o.soot (0..1: glowing soot dots rising inside)
function flame(x, y, s, t, o) {
  o = o || {}; var rd = o.round || 0, bl = o.blue || 0, fl = 1 + .06 * Math.sin(t * 9.3) + .035 * Math.sin(t * 23.1) * (1 - rd);
  var w = 13 * s * lerp(1, 1.12, rd), H = lerp(60 * s * (o.long || 1) * fl, w * 2.05, rd), tx = (1 - rd) * 2.5 * s * Math.sin(t * 6.1), cy = -H * .4;
  var d = "M" + f(tx) + " " + f(-H) + " C" + f(w * .35 + tx * .5) + " " + f(-H * .62) + " " + f(w * 1.05) + " " + f(-H * .32) + " " + f(w) + " " + f(-H * .08) +
          " A" + f(w) + " " + f(w) + " 0 0 1 " + f(-w) + " " + f(-H * .08) + " C" + f(-w * 1.05) + " " + f(-H * .32) + " " + f(-w * .35 + tx * .5) + " " + f(-H * .62) + " " + f(tx) + " " + f(-H) + " Z";
  var g = o.glow == null ? 1 : o.glow, s2 = "";
  if (g > 0) s2 += '<circle cx="0" cy="' + f(cy) + '" r="' + f(w * 3.4 * fl) + '" fill="' + (bl > .5 ? "#b9cbe6" : GLOW) + '" opacity="' + f(.16 * g * (1 - .6 * bl)) + '"/><circle cx="0" cy="' + f(cy) + '" r="' + f(w * 2.2) + '" fill="' + (bl > .5 ? "#b9cbe6" : GLOW) + '" opacity="' + f(.24 * g * (1 - .5 * bl)) + '"/>';
  s2 += '<path d="' + d + '" fill="' + (bl > .5 ? "#7d9fd0" : FL_Y) + '" opacity="' + f(1 - .35 * bl) + '"/>';
  s2 += G("translate(0 " + f(w * .4) + ") scale(.62)", '<path d="' + d + '" fill="' + (bl > .5 ? "#c9d8ee" : FL_C) + '"/>');
  if (bl < 1) s2 += '<ellipse cx="0" cy="' + f(-H * .08 + w * .55) + '" rx="' + f(w * .78) + '" ry="' + f(w * .42) + '" fill="' + FL_B + '" opacity="' + f(.9 - .2 * rd) + '"/>';
  if (o.soot) for (var k = 0; k < 7; k++) { var ph = (t * .55 + k / 7) % 1, yy = lerp(w * .2, -H * .78, ph), xx = Math.sin(k * 2.1 + t * 3) * w * .35 * (1 - ph * .6);
    s2 += '<circle cx="' + f(xx) + '" cy="' + f(yy) + '" r="' + f(2.4 * s) + '" fill="' + (ph < .35 ? INK : ph < .6 ? FL_O : "#fff6c8") + '" opacity="' + f(o.soot) + '"/>'; }
  s2 += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(1.6 + .2 * s) + '" opacity=".85"/>';
  s2 += '<path d="M0 ' + f(w * .9) + ' q1.5 -7 -.5 -14" stroke="' + INK + '" stroke-width="' + f(2.4 * Math.min(1.4, s)) + '" fill="none" stroke-linecap="round"/>';
  return G("translate(" + f(x) + " " + f(y) + ")", s2);
}
// a candle at (x,y) (base), tilted a deg, with its flame; returns svg. len/w in px
function candle(x, y, a, len, w, t, fo) {
  var tp = tipOf(x, y, a, len), ra = a * Math.PI / 180;
  // the flame root sits a little out along the candle, then the flame turns up
  var root = [tp[0] + Math.sin(ra) * 4, tp[1] - Math.cos(ra) * 4 + 6];
  return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(a) + ")", candleBody(len, w)) + flame(root[0], root[1], (fo && fo.s) || w / 30, t, fo);
}
// air molecules jiggling in a box: n circles, colour, how spread (sp 1 = calm, 2.4 = hot and fast), seed
function mols(x, y, w, h, n, col, t, sp, seed, r) {
  var s = ""; seed = seed || 0; r = r || 7;
  for (var k = 0; k < n; k++) { var px = x + r + hash(k + seed) * (w - 2 * r), py = y + r + hash(k + seed + 77) * (h - 2 * r), a = (sp || 1) * 3;
    px += a * Math.sin(t * (4 + hash(k) * 5) * (sp || 1) + k); py += a * Math.cos(t * (3.5 + hash(k + 3) * 5) * (sp || 1) + k * 1.7);
    s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + r + '" fill="' + col + '" fill-opacity=".18" stroke="' + col + '" stroke-width="2.2"/>'; }
  return s;
}
// a dashed parcel of air with molecules: the reference's «same space» box
function parcel(x, y, sz, n, col, t, sp, seed) {
  return R(x, y, sz, sz, col === HOT ? "#f3ddd0" : "#dbe4ea", 1.8, 4, ' stroke-dasharray="6 5"') + mols(x + 6, y + 6, sz - 12, sz - 12, n, col, t, sp, seed, 6);
}
// a gravity arrow with its «g»
function gArrow(x, y, len, k) { return arrow(x, y, x, y + len, INK, 4, k) + G("", T("الجاذبية", x - 12, y + len * .5, 20, OLIVE, 800, "start"), clamp(k * 2 - 1)); }
// stream lines: cold air drawn in along the floor toward the flame root, then rising (dashes run with t)
function streams(cx, cy, k, t, opt) {
  opt = opt || {}; var s = "", spread = opt.spread || 1;
  for (var i = 0; i < 4; i++) {
    var y0 = cy + 18 + i * 14, xL = cx - 300, xR = cx + 300, off = (t * 46) % 22;
    var dL = "M" + xL + " " + y0 + " C" + (cx - 120) + " " + y0 + " " + (cx - 30 - i * 6) + " " + (cy + 10) + " " + (cx - 8 - i * 3) + " " + (cy - 10);
    var dR = "M" + xR + " " + y0 + " C" + (cx + 120) + " " + y0 + " " + (cx + 30 + i * 6) + " " + (cy + 10) + " " + (cx + 8 + i * 3) + " " + (cy - 10);
    [dL, dR].forEach(function (dd) { s += G("", '<path d="' + dd + '" fill="none" stroke="' + COOL + '" stroke-width="2.4" stroke-dasharray="10 12" stroke-dashoffset="' + f(-off) + '"/>', clamp(k)); });
  }
  if (opt.up) for (var j = 0; j < 5; j++) { var xo = (j - 2) * 16 * spread, d = "M" + f(cx + xo * .3) + " " + f(cy - 60) + " C" + f(cx + xo * .5) + " " + f(cy - 200) + " " + f(cx + xo * 1.6) + " " + f(cy - 330) + " " + f(cx + xo * 2.4) + " " + f(cy - 460);
    s += G("", '<path d="' + d + '" fill="none" stroke="' + HOT + '" stroke-width="2.2" stroke-dasharray="10 12" stroke-dashoffset="' + f(t * 50 % 22) + '"/>', clamp(opt.up)); }
  return s;
}
// a glass of water seen from the side; level y, with an optional oil layer on top (oil 0..1 thickness k)
function glass(x, y, w, h, t, oil) {
  var lv = y + h * .32, s = "";
  s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + 10) + ' ' + f(y + h) + ' L' + f(x + w - 10) + ' ' + f(y + h) + ' L' + f(x + w) + ' ' + f(y) + '" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="2.4"/>';
  var wl = lv + 4 * Math.sin(t * 2), ol = wl - 34 * (oil || 0);
  s += '<path d="M' + f(x + 3) + ' ' + f(wl) + ' L' + f(x + w - 3) + ' ' + f(wl) + ' L' + f(x + w - 10) + ' ' + f(y + h - 2) + ' L' + f(x + 10) + ' ' + f(y + h - 2) + ' Z" fill="' + WATER + '" stroke="' + INK + '" stroke-width="1.4"/>';
  if (oil) s += '<path d="M' + f(x + 2) + ' ' + f(ol) + ' L' + f(x + w - 2) + ' ' + f(ol) + ' L' + f(x + w - 3) + ' ' + f(wl) + ' L' + f(x + 3) + ' ' + f(wl) + ' Z" fill="' + OIL + '" stroke="' + INK + '" stroke-width="1.4"/>';
  return s + '<path d="M' + f(x + 12) + ' ' + f(y + 16) + ' L' + f(x + 18) + ' ' + f(y + h - 20) + '" stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round"/>';
}
// the man holding a candle: the shared person kit, front view, «home» clothes. a = candle tilt (deg), face = expression
var HOLD = { tip: [0, 0] };
function holder(x, y, s, a, t, face, look) {
  var o = { x: x, y: y, s: s, outfit: "home", legs: "stand", breath: (Math.sin(t * 1.7) + 1) / 2, head: { tilt: 3 * Math.sin(t * .9), turn: -.35 },
    face: Object.assign({ eyes: (t * 1000) % 3300 < 120 ? .05 : 1, look: look || [-.8, -.2], brows: "neutral", mouth: "neutral" }, face || {}) };
  var wr = [x - 150 * s / 1.7, y - 230 * s / 1.7];
  o.arms = [{ to: wr, hand: "fist", bend: -1, rot: 200 }, { hand: "relaxed" }];
  var P = PERSON.front(o), w = P.joints.wr[0], el = P.joints.el[0], dx = w[0] - el[0], dy = w[1] - el[1], L = Math.hypot(dx, dy), fc = [w[0] + dx / L * 30 * s / 1.7, w[1] + dy / L * 30 * s / 1.7];
  // the candle passes through the fist: 40 % of it below the grip
  var len = 150 * s / 1.7, r = a * Math.PI / 180, base = [fc[0] - Math.sin(r) * len * .35, fc[1] + Math.cos(r) * len * .35];
  var tp = tipOf(base[0], base[1], a, len); HOLD.tip = [tp[0], tp[1] - 40 * s / 1.7];
  return candle(base[0], base[1], a, len, 30 * s / 1.7, t) + P.svg;
}

// ── shots (one per idea; line numbers from script.txt) ──
// 4 · «قاعدة صغيرة»: a pinned rule card over a bucket of water
shot(4, push(320, 420, 1.02, 1.1), function (u, d, t) {
  return paper() + appear(at(u, 0, .4), bucket(320, 560, t, 0, false)) + G("", '<rect x="140" y="150" width="360" height="150" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2.4" transform="rotate(-3 320 225)"/>' +
    T("الأخف", 320, 214, 42, ORANGE, 800) + T("بيتزق لفوق", 320, 266, 34, INK, 700) + C(320, 158, 9, ORANGE, 2), at(u, .5, .4));
});
// a bucket cut open from the side with water; a ball held under (held 1) or rising (k)
function bucket(cx, cy, t, k, held) {
  var s = '<path d="M' + (cx - 170) + ' ' + (cy - 160) + ' L' + (cx - 140) + ' ' + (cy + 150) + ' L' + (cx + 140) + ' ' + (cy + 150) + ' L' + (cx + 170) + ' ' + (cy - 160) + '" fill="#cfd6d2" stroke="' + INK + '" stroke-width="3"/>';
  var wl = cy - 110 + 3 * Math.sin(t * 2.2);
  s += '<path d="M' + (cx - 164) + ' ' + f(wl) + ' Q' + cx + ' ' + f(wl - 6 * Math.sin(t * 2.6)) + ' ' + (cx + 164) + ' ' + f(wl) + ' L' + (cx + 140) + ' ' + (cy + 147) + ' L' + (cx - 140) + ' ' + (cy + 147) + ' Z" fill="' + WATER + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + (cx - 176) + ' ' + (cy - 164) + ' h352" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M' + (cx - 168) + ' ' + (cy - 160) + ' Q' + cx + ' ' + (cy - 330) + ' ' + (cx + 168) + ' ' + (cy - 160) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>';
  return s;
}
function ball(x, y, r) { return C(x, y, r, "#d9603d", 2.4) + '<path d="M' + f(x - r) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y + r * .5) + ' ' + f(x + r) + ' ' + f(y) + '" stroke="#f4ecdb" stroke-width="4" fill="none"/><circle cx="' + f(x - r * .35) + '" cy="' + f(y - r * .4) + '" r="' + f(r * .22) + '" fill="#fff" opacity=".55"/>'; }
// 5 · lighter than what is around it → pushed up: the water presses harder from below (arrows) on a ball in the bucket
shot(5, push(320, 520, 1.15, 1.05), function (u, d, t) {
  var k = at(u, .6, 1.2), by = lerp(640, 470, k) + 3 * Math.sin(t * 3);
  return paper() + bucket(320, 560, t) + ball(320, by, 40) + arrow(320, by + 130, 320, by + 52, BLUE, 6, at(u, .3, .4)) + arrow(240, by + 110, 288, by + 40, BLUE, 4, at(u, .45, .4)) + arrow(400, by + 110, 352, by + 40, BLUE, 4, at(u, .45, .4)) +
    label(360, by - 10, 520, 300, "أخف", ORANGE, at(u, .4, .5), 26) + label(400, 640, 430, 730, "المية أتقل", BLUE, at(u, 1, .5), 24);
}, { tr: "in" });
// 6 · the analogy: a hand pushes a plastic ball under, lets go, it shoots up
shot(6, push(320, 470, 1.0, 1.06), function (u, d, t) {
  var rel = 1.1, k = at(u, rel, .7), by = u < rel ? 620 : lerp(620, 430, k) + 4 * Math.sin(t * 4) * k;
  var hand = PERSON.hand ? "" : "";
  var s = paper() + bucket(320, 560, t) + ball(320, by, 40);
  // the hand (shared kit arm) pressing from above, then lifting away
  var hy = u < rel ? by - 40 : lerp(by - 40, 120, at(u, rel, .5));
  s += PERSON.front({ x: 600, y: hy + 420, s: 1.4, outfit: "home", legs: "stand", arms: [{ to: [340, hy], hand: "flat", rot: 90, straight: true }, { hand: "relaxed" }], face: { look: [-1, .6] } }).svg;
  return s + iconBox(110, 120, 120, ball(0, -6, 30) + T("بلاستيك", 0, 48, 18, INK, 700), at(u, .2, .3)) + G("", arrow(470, 500, 470, 380, ORANGE, 6, k), k);
});
// 7 · the flame itself: hot gas, over 1000 degrees
shot(7, push(320, 430, 1.25, 1.05), function (u, d, t) {
  var k = at(u, 1.3, 1.2);
  return paper() + candle(320, 760, 0, 330, 70, t, { s: 3.6 }) + label(300, 300, 160, 400, "غاز سخن", ORANGE, at(u, .6, .5), 28) + numBox(count(1000, k) + "°", 480, 230, at(u, 1.2, .3), 40) + G("", T("أكتر من", 480, 170, 24, INK, 800), at(u, 1.2, .3));
}, { tr: "out" });
// 8 · heating a gas: the molecules run faster and spread out (cool box → hot box)
shot(8, push(320, 420, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .6, 2.2), sp = lerp(1, 2.6, k), s = paper();
  s += R(110, 170, 420, 420, "#f2e9d6", 2.4) + T("مش بالمقياس", 320, 160, 18, MUTE, 600);
  // the same molecules: colour turns from blue to orange and they spread to fill a taller box as k grows
  for (var i = 0; i < 26; i++) { var cx0 = 220 + hash(i) * 200, cy0 = 380 + hash(i + 9) * 150, cx1 = 130 + hash(i + 31) * 380, cy1 = 190 + hash(i + 51) * 380;
    var x = lerp(cx0, cx1, k) + 3 * sp * Math.sin(t * 5 * sp + i), y = lerp(cy0, cy1, k) + 3 * sp * Math.cos(t * 4.4 * sp + i * 2), col = k > .5 ? HOT : COOL;
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="9" fill="' + col + '" fill-opacity=".18" stroke="' + col + '" stroke-width="2.4"/>';
    if (k > .3) s += '<path d="M' + f(x - 12 * sp) + ' ' + f(y) + ' h' + f(-8 * sp) + '" stroke="' + HOT + '" stroke-width="2" opacity="' + f(clamp(k - .3)) + '"/>'; }
  return s + flame(320, 700, 1.6, t) + label(330, 640, 520, 680, "سخونية", ORANGE, at(u, .3, .5), 22);
});
// 9 · same space, fewer molecules → lighter: a balance, the hot box rises, «×4–5»
shot(9, push(320, 430, 1.04, .98), function (u, d, t) {
  var k = at(u, .8, 1.2), tilt = 9 * k + .8 * Math.sin(t * 2), r = tilt * Math.PI / 180, s = paper();
  s += R(300, 610, 40, 14, TAN, 2) + P("M320 610 L320 330", null, 5) + '<path d="M300 330 L320 300 L340 330 Z" fill="' + INK + '"/>';
  var ax = 200 * Math.cos(r), ay = 200 * Math.sin(r);
  s += '<path d="M' + f(320 - ax) + ' ' + f(320 - ay) + ' L' + f(320 + ax) + ' ' + f(320 + ay) + '" stroke="' + WOOD_D + '" stroke-width="8" stroke-linecap="round"/>';
  var L0 = [320 - ax, 320 - ay], R0 = [320 + ax, 320 + ay];
  s += P("M" + f(L0[0]) + " " + f(L0[1]) + " v70", null, 1.6) + P("M" + f(R0[0]) + " " + f(R0[1]) + " v70", null, 1.6);
  s += parcel(L0[0] - 60, L0[1] + 70, 120, 4, HOT, t, 2.4, 3) + parcel(R0[0] - 60, R0[1] + 70, 120, 16, COOL, t, 1, 8);
  s += T("سخن", L0[0], L0[1] + 222, 24, HOT, 800) + T("بارد", R0[0], R0[1] + 222, 24, COOL, 800);
  return s + G("", T("نفس الحجم · جزيئات أقل", 320, 690, 22, INK, 700), at(u, .4, .4)) + numBox("×4–5", 320, 200, at(u, 2, .3), 40) + G("", T("أخف", 320, 250, 26, ORANGE, 800), at(u, 2.2, .3));
});
// 10 · who pushes it? the cold, heavy air all round the flame (blue molecules, packed), a «؟»
shot(10, push(320, 470, 1.1, 1.0), function (u, d, t) {
  return paper() + mols(20, 120, 600, 620, 70, COOL, t, 1, 5) + G("", '<circle cx="320" cy="520" r="120" fill="' + PAPER + '"/>', 1) + candle(320, 760, 0, 160, 46, t, { s: 2.2 }) +
    tag("هوا بارد تقيل", 320, 190, at(u, .9, .3), 30, BLUE);
}, { tr: "out" });
// 11 · gravity pulls the cold air more: it sinks, slides under the flame and shoves the hot gas up
shot(11, push(320, 470, 1.0, 1.06), function (u, d, t) {
  var k = at(u, .3, 1.4), s = paper() + streams(320, 560, k, t, { up: at(u, 2.4, 1) }) + candle(320, 760, 0, 160, 46, t, { s: 2.2 });
  // two cold parcels slide down and in, one hot parcel rises
  var m = clamp((u - .5) / 3);
  s += parcel(lerp(60, 170, m), lerp(380, 560, m), 90, 14, COOL, t, 1, 2) + parcel(lerp(490, 380, m), lerp(380, 560, m), 90, 14, COOL, t, 1, 4);
  s += parcel(275, lerp(380, 200, m), 90, 4, HOT, t, 2.4, 6) + arrow(320, lerp(370, 190, m), 320, lerp(320, 140, m), HOT, 5, at(u, 1, .4));
  return s + gArrow(590, 150, 160, at(u, .2, .5));
});
// 12 · the analogy: oil poured on water floats on top
shot(12, push(320, 450, 1.04, .98), function (u, d, t) {
  var k = at(u, .4, 1.8), s = paper() + glass(200, 260, 240, 380, t, k);
  // the bottle pouring from the upper right, a thin yellow stream
  s += G("translate(470 150) rotate(-120)", R(-28, -60, 56, 120, "#e6cf8a", 2.2, 8) + R(-12, -86, 24, 28, "#c9a44a", 2));
  s += G("", '<path d="M420 210 Q370 230 330 ' + f(lerp(300, 340, k)) + '" stroke="' + OIL + '" stroke-width="7" fill="none" stroke-linecap="round"/>', clamp(1.2 - k));
  return s + label(430, lerp(380, 352, k), 560, 300, "زيت", ORANGE, at(u, 1.6, .5), 26) + label(420, 520, 560, 600, "مية", BLUE, at(u, 2, .5), 26);
}, { tr: "out" });
// 13 · however you tip the candle, «up» is against gravity, not the candle's end
shot(13, push(320, 430, 1.0, 1.05), function (u, d, t) {
  var a = -95 * at(u, .2, 1.4), s = paper();
  s += holder(470, 780, 1.6, a, t, { brows: "raised" });
  var tp = tipOf(0, 0, a, 1);
  s += gArrow(170, 130, 170, at(u, .8, .5)) + G("", arrow(150, 520, 150, 380, ORANGE, 6, 1) + T("فوق", 150, 360, 28, ORANGE, 800), at(u, 1.6, .4));
  return s + G("", '<path d="M150 400 L150 560" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6"/>', at(u, 1.8, .4));
});
// 14 · «why pointed like a drop?»: the big flame, a question mark
shot(14, push(320, 380, 1.1, 1.2), function (u, d, t) { return paper() + candle(320, 820, 0, 300, 70, t, { s: 3.6 }) + G("", T("؟", 520, 260, 140, ORANGE, 800), at(u, .3, .4)); }, { tr: "in" });
// 15 · the rising gas drags fresh air in from the sides: blue streams into the root, «O₂»
shot(15, push(320, 470, 1.0, 1.06), function (u, d, t) {
  var s = paper() + streams(320, 600, at(u, .2, 1.4), t, { up: 0 }) + candle(320, 820, 0, 190, 60, t, { s: 3 });
  for (var i = 0; i < 2; i++) { var sx = i ? 470 : 170, x = sx + (i ? -1 : 1) * ((t * 40) % 80); s += G("", '<circle cx="' + f(x - 8) + '" cy="625" r="9" fill="' + COOL + '" fill-opacity=".3" stroke="' + COOL + '" stroke-width="2.2"/><circle cx="' + f(x + 8) + '" cy="625" r="9" fill="' + COOL + '" fill-opacity=".3" stroke="' + COOL + '" stroke-width="2.2"/>', at(u, .8, .4)); }
  return s + label(120, 628, 80, 520, "أكسجين داخل", BLUE, at(u, 1.2, .5), 22) + label(520, 628, 560, 520, "أكسجين داخل", BLUE, at(u, 1.4, .5), 22);
});
// 16 · the stream stretches the flame up: thin and pointed
shot(16, push(320, 450, 1.06, 1.0), function (u, d, t) {
  var k = at(u, .4, 1.6);
  return paper() + streams(320, 600, 1, t, { up: k }) + candle(320, 820, 0, 190, 60, t, { s: 3, long: lerp(.8, 1.25, k) }) + label(360, 380, 520, 300, "بيتمط", ORANGE, at(u, 1.2, .5), 26);
});
// 17 · the yellow: tiny carbon grains ride up and glow
shot(17, push(320, 380, 1.15, 1.3), function (u, d, t) {
  return paper() + streams(320, 600, 1, t, { up: .6 }) + candle(320, 820, 0, 190, 60, t, { s: 3.2, soot: at(u, .6, .5) }) + label(340, 440, 420, 300, "حبيبات كربون", OLIVE, at(u, 1, .5), 24);
});
// 18 · no gravity: the station in orbit round the real Earth, «مفيش فوق»
shot(18, push(320, 520, .95, 1.03), function (u, d, t) {
  var a = -1.9 + u * .05, sx = 320 + 330 * Math.cos(a), sy = 900 + 330 * Math.sin(a), s = paper();
  s += globe(320, 900, 260, 25 + t * 1.6, 25) + '<circle cx="320" cy="900" r="330" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="8 8"/>';
  s += G("translate(" + f(sx) + " " + f(sy) + ") rotate(" + f(a * 180 / Math.PI + 90) + ")", R(-60, -6, 120, 12, GREY, 1.8) + R(-80, -30, 30, 60, "#4a6f8a", 1.6) + R(50, -30, 30, 60, "#4a6f8a", 1.6) + R(-14, -14, 28, 28, "#e9e4d6", 1.8));
  return s + tag("مفيش فوق ولا تحت", 320, 190, at(u, 1, .3), 30, ORANGE) + G("", parcel(110, 260, 90, 4, HOT, t, 2.4, 1) + parcel(440, 260, 90, 14, COOL, t, 1, 2), at(u, 1.6, .4));
});
// 19 · in orbit the flame turns into a blue ball round the wick (a test box like the Shuttle glovebox)
shot(19, push(320, 470, 1.0, 1.08), function (u, d, t) {
  var k = at(u, .5, 1.8), s = paper() + R(120, 180, 400, 520, "#dfe2dc", 2.6) + T("صندوق تجارب في الفضاء", 320, 214, 20, MUTE, 700);
  s += G("translate(320 660)", candleBody(170, 46)) + flame(320, 490, 2.4, t, { round: k, blue: k, glow: lerp(1, .4, k) });
  return s + label(350, 450, 500, 330, "كورة زرقا", BLUE, at(u, 2, .5), 24);
}, { tr: "in" });
// 20 · oxygen only drifts in slowly: a few blue molecules wander toward the ball; it stays small and dim
shot(20, push(320, 470, 1.08, 1.0), function (u, d, t) {
  var s = paper() + R(120, 180, 400, 520, "#dfe2dc", 2.6) + G("translate(320 660)", candleBody(170, 46)) + flame(320, 490, 2.2, t, { round: 1, blue: 1, glow: .35 });
  for (var i = 0; i < 9; i++) { var a = i / 9 * Math.PI * 2 + t * .1, rr = 170 - ((t * 9 + i * 13) % 110); s += '<circle cx="' + f(320 + Math.cos(a) * rr) + '" cy="' + f(470 + Math.sin(a) * rr) + '" r="8" fill="' + COOL + '" fill-opacity=".25" stroke="' + COOL + '" stroke-width="2"/>'; }
  return s + tag("بالراحة", 320, 290, at(u, .8, .3), 30, BLUE);
});
// 21 · the myth: «heat only goes up» — the man's hand over the flame, the claim crossed out
shot(21, push(320, 460, 1.0, 1.06), function (u, d, t) {
  var s = paper() + candle(250, 780, 0, 200, 60, t, { s: 3 });
  s += PERSON.front({ x: 560, y: 820, s: 1.5, outfit: "home", legs: "stand", breath: (Math.sin(t * 1.7) + 1) / 2, head: { turn: -.4 }, arms: [{ to: [300, 280], hand: "flat", rot: 180, bend: -1 }, { hand: "relaxed" }], face: { look: [-1, .3], brows: "neutral" } }).svg;
  s += arrow(250, 470, 250, 330, ORANGE, 6, at(u, .3, .4)) + tag("السخونية لفوق بس؟", 320, 230, at(u, .6, .3), 28, INK);
  return s + cross(320, 220, 1.3, at(u, d * .62, .5));
});
// 22 · heat leaves in every direction (a hand beside the flame feels it too); what rises is the light gas
shot(22, push(320, 470, 1.04, 1.0), function (u, d, t) {
  var s = paper() + streams(250, 560, 1, t, { up: at(u, 1.6, .8) }) + candle(250, 780, 0, 200, 60, t, { s: 3 });
  for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2, r0 = 100, r1 = 100 + 70 * at(u, .2, .8); s += wave(250 + Math.cos(a) * r0, 470 + Math.sin(a) * r0, 250 + Math.cos(a) * r1, 470 + Math.sin(a) * r1, t, ORANGE, 4, 14, 1, 2.6); }
  s += PERSON.front({ x: 600, y: 830, s: 1.5, outfit: "home", legs: "stand", breath: (Math.sin(t * 1.7) + 1) / 2, head: { turn: -.4 }, arms: [{ to: [420, 470], hand: "open", rot: 180, bend: -1 }, { hand: "relaxed" }], face: { look: [-1, 0], brows: "raised", mouth: "o" } }).svg;
  return s + check(470, 380, 1, at(u, .9, .4), OLIVE);
});
// 23 · «يعني من الآخر»: everything at once, labelled
shot(23, push(320, 450, .94, 1.02), function (u, d, t) {
  return paper() + streams(320, 600, 1, t, { up: 1 }) + candle(320, 820, 0, 190, 60, t, { s: 3 }) + gArrow(580, 520, 150, 1) +
    label(330, 420, 440, 250, "غاز خفيف", ORANGE, at(u, .3, .4), 24) + label(150, 616, 200, 720, "هوا تقيل", BLUE, at(u, 1.4, .4), 24) + label(240, 600, 160, 460, "أكسجين", BLUE, at(u, 2.6, .4), 24);
}, { tr: "out" });
// 24 · the odd fact: a jar with a lit candle dropped; while it falls the flame shrinks to a small ball
shot(24, function (u, d) { return [320, lerp(300, 560, ease(u / d)), 1]; }, function (u, d, t) {
  var k = at(u, 1, d - 1.2), y = lerp(260, 600, k * k), s = paper();
  for (var i = 0; i < 4; i++) s += '<path d="M' + (230 + i * 60) + ' ' + f(y - 160 - i * 20) + ' v' + f(-60 * k) + '" stroke="' + INK + '" stroke-width="2" opacity=".5" stroke-dasharray="8 8"/>';
  s += G("translate(320 " + f(y) + ") scale(1.5)", R(-90, -110, 180, 220, GLASS, 2.6, 14) + R(-80, -130, 160, 24, "#b8a77e", 2.2, 4) + G("translate(0 100)", candleBody(90, 34)) + flame(0, -6, 1.6, t, { round: k, blue: k * .8, glow: 1 - k * .6 }));
  return s + G("", tag("بيقع", 570, y, 1, 28, ORANGE), at(u, .6, .3));
});

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: he tips the candle until it lies flat. line 1: the flame bends and points up (an orange «up» arrow over it).
  // line 2: a dotted «pull» line above the flame with ✗ (nothing pulls it), then blue push arrows from under it (it is pushed)
  var l0 = LN[0], k0 = clamp((t - l0.start - .3) / 1.6), a = li === 0 ? -92 * ease(k0) : -92;
  var face = li === 0 ? { brows: "neutral" } : li === 1 ? { brows: "raised", mouth: "o", eyes: 1.2 } : { brows: "worried", mouth: "neutral" };
  var s = holder(500, 830, 2.3, a, t, face), fx = HOLD.tip[0], fy = HOLD.tip[1];
  if (li >= 1) { var u1 = t - LN[1].start; s += arrow(fx, fy - 130, fx, fy - 230, ORANGE, 7, ease(u1 / .5)); }
  if (li >= 2) { var u2 = t - LN[2].start;
    s += G("", '<path d="M' + f(fx) + ' 10 V' + f(fy - 140) + '" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="6 7"/>', ease(u2 / .3)) + cross(fx, fy - 200, .9, ease((u2 - .9) / .4));
    s += arrow(fx - 46, fy + 96, fx - 16, fy + 40, BLUE, 6, ease((u2 - 1.7) / .4)) + arrow(fx + 46, fy + 96, fx + 16, fy + 40, BLUE, 6, ease((u2 - 1.8) / .4)); }
  return s;
};
SCENE.bumper = function (u, t) { return candle(90, 190, 0, 70, 30, t, { s: 1.3 }); };
SCENE.outro = function (svg, u, t) {
  return streams(300, 200, 1, t, { up: 1 }).replace(/stroke-width="2.4"/g, 'stroke-width="2"') + G("translate(300 280)", candleBody(60, 26)) + flame(300, 208, 1.2, t) +
    callout("1", 330, 90, ease(u / .3)) + callout("2", 90, 230, ease(u / .3 - .5)) + callout("3", 210, 225, ease(u / .3 - 1)) + gArrow(540, 120, 110, 1) + callout("4", 560, 100, ease(u / .3 - 1.5));
};
