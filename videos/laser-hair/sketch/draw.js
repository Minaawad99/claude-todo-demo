/* «الليزر» — the episode's own drawings (sketch style). Self-contained SVG builders, used by shots.js and by review.html.
   Real anatomy (follicle, bulb, dermal papilla, sebaceous gland, the three growth phases) after the textbook diagrams
   listed in ../refs/SOURCES.md; the skin block is cut open the way «طب إزاي؟» v20 cuts the skin (isometric block, layers, fat
   as circles). Panel units: 640 × 786. */
var LZ = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0";
var EPI = "#d9907d", EPID = "#c27a68", DER = "#efc4b4", DERD = "#e2ad9c", FAT = "#ece2bd", FATL = "#d8cb9c", LINE = "#b8463a",
    SHEATH = "#f6d9cd", HAIR = "#3b2519", HAIRL = "#6e4a33", BULB = "#4a2c1c", PAP = "#c8705f", GLAND = "#e6cf86", WHITEH = "#f3efe6", SKIN = "#e8b49a", SKIND = "#cf9478";
function f(n) { return (+n).toFixed(1); }
function P(pts) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + " L" + f(L[0]) + " " + f(L[1]); }
function line(pts, col, w, ex) { return '<path d="' + P(pts) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function shape(pts, fill, sw, ex) { return '<path d="' + P(pts) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function tag(x, y, txt, col, side) {   // a leader-line label: dot, line, word in a dark chip (as the reference labels)
  col = col || INK; side = side || 1; var tx = x + side * 70, ty = y - 34, w = txt.length * 13 + 22;
  return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.5" fill="' + col + '"/>' + line([[x, y], [tx, ty]], col, 1.6) +
    '<rect x="' + f(side > 0 ? tx : tx - w) + '" y="' + f(ty - 17) + '" width="' + w + '" height="32" rx="7" fill="' + col + '"/>' +
    '<text x="' + f(side > 0 ? tx + w / 2 : tx - w / 2) + '" y="' + f(ty + 6) + '" text-anchor="middle" style="font:800 19px \'Noto Sans Arabic\';fill:#fbf8f1">' + txt + '</text>';
}
// one hair follicle on the cut face: x = where it meets the skin surface (y0), depth = to the bottom of the bulb.
// o.phase "grow" (anagen) | "stop" (catagen: shrinking, bulb risen) | "rest" (telogen: club hair, short, papilla left below)
// o.k: 0..1 heat in the shaft and bulb; o.white: no melanin (white / blonde hair); o.out: length of hair above the skin
function follicle(x, y0, depth, o) {
  o = o || {}; var ph = o.phase || "grow", tilt = o.tilt == null ? 0.18 : o.tilt, g = "";
  var d = ph === "grow" ? depth : ph === "stop" ? depth * .62 : depth * .42, bx = x - tilt * d, by = y0 + d;
  var hairC = o.white ? WHITEH : HAIR, bulbC = o.white ? "#e9dfcf" : BULB;
  var ax = function (t) { return [x - tilt * d * t, y0 + d * t]; };
  // outer root sheath, a tube from the surface down to the bulb
  var sw = ph === "rest" ? 9 : 12;
  var L = [], R = [];
  for (var t = 0; t <= 1.0001; t += .1) { var p = ax(t), w = sw + (t > .82 && ph === "grow" ? (t - .82) * 60 : 0); L.push([p[0] - w, p[1]]); R.push([p[0] + w, p[1]]); }
  g += '<path d="' + P(L) + ' L' + P(R.reverse()).slice(1) + ' Z" fill="' + SHEATH + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
  // sebaceous gland at the upper third
  var gp = ax(.24); g += shape([[gp[0] + 10, gp[1] - 6], [gp[0] + 26, gp[1] - 10], [gp[0] + 34, gp[1] + 2], [gp[0] + 28, gp[1] + 14], [gp[0] + 12, gp[1] + 10]], GLAND, 1.4);
  if (o.labels) g += tag(gp[0] + 30, gp[1] + 4, "غدة دهنية", OLIVE, 1);
  // dermal papilla (the bulb's blood supply): an inverted cup; in rest it stays deep, apart from the hair
  var pp = ph === "rest" ? [x - tilt * depth * .62, y0 + depth * .62] : [bx, by];
  if (ph !== "rest") {
    // the bulb: an onion around the papilla, packed with melanin
    var bw = ph === "grow" ? 24 : 15, bh = ph === "grow" ? 30 : 20;
    g += shape([[bx - bw, by - bh * .2], [bx - bw * .9, by - bh * .8], [bx - 6, by - bh * 1.25], [bx + 6, by - bh * 1.25], [bx + bw * .9, by - bh * .8], [bx + bw, by - bh * .2], [bx + bw * .7, by + 6], [bx + 8, by + 2], [bx, by - 6], [bx - 8, by + 2], [bx - bw * .7, by + 6]], bulbC, 1.8);
    if (!o.white) for (var i = 0; i < 14; i++) { var a = rnd(i + x) * Math.PI, r = 6 + rnd(i * 3 + x) * (bw - 8); g += '<circle cx="' + f(bx + Math.cos(a) * r * (rnd(i + 9) > .5 ? 1 : -1)) + '" cy="' + f(by - bh * .55 + Math.sin(a) * bh * .35) + '" r="1.6" fill="#1a0f08"/>'; }
    if (ph === "grow") g += shape([[bx - 9, by + 3], [bx - 7, by - 8], [bx, by - 13], [bx + 7, by - 8], [bx + 9, by + 3]], PAP, 1.4) + line([[bx, by + 3], [bx, by + 16]], LINE, 2.2);
    else g += shape([[bx - 6, by + 12], [bx - 4, by + 4], [bx, by + 1], [bx + 4, by + 4], [bx + 6, by + 12]], PAP, 1.4);
  } else {
    // club hair: a rounded, keratinised end, no bulb; the papilla rests lower, apart from it
    g += '<ellipse cx="' + f(bx) + '" cy="' + f(by - 4) + '" rx="8" ry="11" fill="' + (o.white ? WHITEH : "#8a6a52") + '" stroke="' + INK + '" stroke-width="1.6"/>';
    g += shape([[pp[0] - 7, pp[1] + 6], [pp[0] - 5, pp[1] - 4], [pp[0], pp[1] - 7], [pp[0] + 5, pp[1] - 4], [pp[0] + 7, pp[1] + 6]], PAP, 1.4) + line([[pp[0], pp[1] + 6], [pp[0], pp[1] + 18]], LINE, 2);
  }
  // the hair shaft: inside the sheath, out through the skin at an angle
  var top = ax(0), tipLen = o.out == null ? 60 : o.out, tip = [top[0] + tilt * tipLen * 1.2 + tipLen * .25, top[1] - tipLen];
  var shaftEnd = ph === "rest" ? [bx, by - 12] : [bx, by - (ph === "grow" ? 34 : 22)];
  g += line([shaftEnd, top, tip], INK, 8.5) + line([shaftEnd, top, tip], hairC, 5.5);
  if (!o.white) for (var j = 0; j < 9; j++) { var u = .12 + j * .09, q = [lerp(shaftEnd[0], top[0], u * 1.1), lerp(shaftEnd[1], top[1], u * 1.1)]; g += '<circle cx="' + f(q[0] + (rnd(j + x) - .5) * 2) + '" cy="' + f(q[1]) + '" r="1.1" fill="' + HAIRL + '"/>'; }
  // heat: an orange glow that runs down the shaft into the bulb (k 0..1)
  if (o.k > 0) {
    var kk = Math.min(1, o.k), hy = lerp(top[1], shaftEnd[1] + 30, kk), hx = lerp(top[0], shaftEnd[0], kk);
    g += line([top, [hx, hy]], ORANGE, 7, ' opacity=".85"');
    if (kk > .85) g += '<circle cx="' + f(bx) + '" cy="' + f(by - 14) + '" r="' + f(30 + 6 * (kk - .85) / .15) + '" fill="' + ORANGE + '" opacity="' + f(.35 * (kk - .85) / .15) + '"/>';
  }
  if (o.labels) g += tag(bx - 18, by - 10, "البُصيلة", ORANGE, -1);
  return g;
}
function lerp(a, b, k) { return a + (b - a) * k; }
// the skin block, cut open (v20's way): top surface going back, the cut face with epidermis, dermis, a vessel line, fat
// x0, y0 = top-left of the cut face; w; follicles: [{x (0..1 along w), phase, white, k}]
function skinBlock(x0, y0, w, fol, o) {
  o = o || {}; var dx = 46, dy = -58, E = 26, D = 250, F = 120, g = "";
  var wav = function (y, n, a) { var pts = []; for (var i = 0; i <= n; i++) pts.push([x0 + w * i / n, y + Math.sin(i * 1.7) * a]); return pts; };
  // top surface (parallelogram) with a slightly wavy front edge
  g += shape([[x0, y0], [x0 + dx, y0 + dy], [x0 + w + dx, y0 + dy], [x0 + w, y0]], "#e4a593", 2);
  // right side face
  g += shape([[x0 + w, y0], [x0 + w + dx, y0 + dy], [x0 + w + dx, y0 + dy + E + D + F], [x0 + w, y0 + E + D + F]], DERD, 2);
  // cut face layers
  g += '<rect x="' + x0 + '" y="' + f(y0 + E + D) + '" width="' + w + '" height="' + F + '" fill="' + FAT + '"/>';
  for (var i = 0; i < 16; i++) { var cx = x0 + 22 + (i % 8) * (w - 40) / 7 + (Math.floor(i / 8) % 2) * 20, cy = y0 + E + D + 30 + Math.floor(i / 8) * 54; if (cx < x0 + w - 18) g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(16 + rnd(i) * 6) + '" fill="#f4ecd0" stroke="' + FATL + '" stroke-width="2"/>'; }
  g += '<rect x="' + x0 + '" y="' + f(y0 + E) + '" width="' + w + '" height="' + D + '" fill="' + DER + '"/>';
  g += line(wav(y0 + E + D * .72, 12, 3), DERD, 2) + line(wav(y0 + E + D - 4, 10, 2), LINE, 4);
  g += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + E + '" fill="' + EPI + '"/>' + line(wav(y0 + E, 14, 2.5), EPID, 2);
  if (o.skinMel) for (var m = 0; m < 70; m++) g += '<circle cx="' + f(x0 + 6 + rnd(m) * (w - 12)) + '" cy="' + f(y0 + 6 + rnd(m + 50) * (E - 10)) + '" r="1.8" fill="#5a3422"/>';
  g += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + (E + D + F) + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  // hairs poking out of the top surface behind (a few, for depth)
  for (var h = 0; h < 6; h++) { var hx = x0 + 60 + h * (w - 80) / 5 + dx * .5, hy = y0 + dy * .5; g += line([[hx, hy], [hx + 16, hy - 40]], INK, 5.5) + line([[hx, hy], [hx + 16, hy - 40]], o.white ? WHITEH : HAIR, 3); }
  (fol || []).forEach(function (q) { g += follicle(x0 + q.x * w, y0, q.depth || (E + D - 8), q); });
  return { svg: g, top: y0, epi: y0 + E, derm: y0 + E + D, bottom: y0 + E + D + F };
}
// the laser handpiece seen from the side, its window (sapphire tip) at (x, y) facing down; pulse 0..1 lights the window
function handpiece(x, y, s, pulse) {
  s = s || 1; var g = "";
  g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
  g += line([[0, -150], [-30, -210], [-90, -250], [-160, -262]], INK, 9) + line([[0, -150], [-30, -210], [-90, -250], [-160, -262]], "#5b5f66", 5);   // cable
  g += shape([[-34, -150], [34, -150], [30, -40], [-30, -40]], "#f2f0ea", 2.2) + shape([[-30, -40], [30, -40], [36, -12], [-36, -12]], "#d5d2c8", 2) + line([[-24, -120], [-22, -60]], "#d5d2c8", 3);
  g += shape([[-36, -12], [36, -12], [32, 0], [-32, 0]], "#3a3d44", 2) + '<rect x="-26" y="-4" width="52" height="8" rx="2" fill="' + (pulse > 0 ? "#bfe3f2" : "#9fb8c4") + '" stroke="' + INK + '" stroke-width="1.6"/>';
  g += '<rect x="-14" y="-118" width="28" height="12" rx="4" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.4"/>';
  g += '</g>';
  return g;
}
// the light pulse under the window: a cone of pale blue-white light going down into the skin, length L
function beam(x, y, L, k, col) {
  if (k <= 0) return ""; col = col || "#dff1f7"; var w = 26;
  return '<path d="M' + f(x - w) + ' ' + f(y) + ' L' + f(x + w) + ' ' + f(y) + ' L' + f(x + w * 1.8) + ' ' + f(y + L * k) + ' L' + f(x - w * 1.8) + ' ' + f(y + L * k) + ' Z" fill="' + col + '" opacity=".6"/>' +
    line([[x - w, y], [x - w * 1.8, y + L * k]], "#9fd0e2", 1.6, ' stroke-dasharray="6 6"') + line([[x + w, y], [x + w * 1.8, y + L * k]], "#9fd0e2", 1.6, ' stroke-dasharray="6 6"');
}
// a bare lower leg in profile (knee at left, foot at right), skin hairs along the shin; bracket = treated patch [x1, x2]
function leg(x0, y0, s, o) {
  o = o || {}; var g = '<g transform="translate(' + f(x0) + ' ' + f(y0) + ') scale(' + s + ')">';
  var out = [[-40, -38], [80, -40], [200, -36], [320, -30], [372, -28], [410, -20], [470, -4], [530, 10], [566, 18], [576, 30], [562, 42], [470, 44], [400, 46], [362, 46], [344, 38], [338, 24], [318, 18], [262, 22], [182, 36], [112, 52], [50, 58], [0, 54], [-40, 46]];   // shin on top, the calf bulging below, ankle, heel and foot
  g += shape(out, SKIN, 2.4);
  g += line([[20, 44], [100, 40], [200, 26], [300, 14]], SKIND, 3, ' opacity=".55"') + line([[372, -24], [380, 0], [372, 20]], SKIND, 1.6) + '<ellipse cx="368" cy="10" rx="8" ry="6" fill="' + SKIND + '" opacity=".5"/>' + line([[540, 24], [566, 26]], SKIND, 1.4);
  for (var i = 0; i < 26; i++) { var hx = -20 + i * 15, hy = -40 + (hx > 330 ? 12 : hx / 330 * 14) * 0 + (hx < 300 ? -2 - hx * .045 + 0 : -26 + 26) ; hy = interpTop(hx); if (o.cleared && hx > o.cleared[0] && hx < o.cleared[1]) continue; g += line([[hx, hy + 2], [hx + 9, hy - 12 - rnd(i) * 5]], HAIR, 2); }
  if (o.bracket) { var b = o.bracket; [[b[0], -1], [b[1], 1]].forEach(function (q) { g += line([[q[0] + q[1] * -14, -80], [q[0], -80], [q[0], -64]], "#4f8a7a", 3) + line([[q[0] + q[1] * -14, 80], [q[0], 80], [q[0], 64]], "#4f8a7a", 3); }); }
  return g + '</g>';
  function interpTop(x) { for (var k = 1; k < out.length; k++) if (out[k][0] >= x) { var a = out[k - 1], b2 = out[k], t = (x - a[0]) / (b2[0] - a[0]); return a[1] + (b2[1] - a[1]) * t; } return -30; }
}
return { follicle: follicle, skinBlock: skinBlock, handpiece: handpiece, beam: beam, leg: leg, tag: tag, line: line, shape: shape,
  C: { INK: INK, ORANGE: ORANGE, BLUE: BLUE, OLIVE: OLIVE, PAPER: PAPER, SKIN: SKIN, HAIR: HAIR } };
})();
