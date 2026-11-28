/* «السنان الصفرا» — the episode's own drawings (sketch style). Self-contained SVG builders, used by shots.js and review.html.
   Real anatomy of a lower molar cut lengthwise (enamel cap thickest over the cusps and thinning to nothing at the neck,
   dentin under it and down the two roots, the pulp chamber with its two horns and canals, gum hugging the neck, bone with
   its spongy core), cut open the way «طب إزاي؟» v20 cuts the skin (isometric block, layers). Panel units: 640 × 786.
   Sources in ../refs/SOURCES.md. */
var TH = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0";
var ENAM = "#f7f3ea", ENAMD = "#ddd6c6", DENT = "#e7c46f", DENTD = "#c9a04c", PULP = "#d9727a", PULPD = "#b85560",
    GUM = "#e59a9c", GUMD = "#cf7f84", GUMT = "#eeb2b2", BONE = "#efe2bf", BONED = "#d8c79a", BONEL = "#f6edd3", FLUO = "#3f9c94", ACID = "#e08a2e";
function f(n) { return (+n).toFixed(1); }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function mix(a, b, k) { var p = function (c, i) { return parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); }; return "#" + [0, 1, 2].map(function (i) { return ("0" + Math.round(lerp(p(a, i), p(b, i), clamp(k))).toString(16)).slice(-2); }).join(""); }
function P(pts, closed) { var n = pts.length, d = ""; if (!closed) { d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < n; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } return d + " L" + f(pts[n - 1][0]) + " " + f(pts[n - 1][1]); }
  var mid = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, s = mid(pts[n - 1], pts[0]); d = "M" + f(s[0]) + " " + f(s[1]);
  for (var j = 0; j < n; j++) { var q = mid(pts[j], pts[(j + 1) % n]); d += " Q" + f(pts[j][0]) + " " + f(pts[j][1]) + " " + f(q[0]) + " " + f(q[1]); } return d + " Z"; }
function line(pts, col, w, ex) { return '<path d="' + P(pts) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function shape(pts, fill, sw, ex) { return '<path d="' + P(pts, true) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function poly(pts, fill, sw, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function now() { return (typeof window !== "undefined" && window.__t) || 0; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function T(t, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px \'Noto Sans Arabic\';fill:' + (col || INK) + '">' + t + '</text>'; }
function tag(x, y, txt, col, side, sz) {   // a leader-line label: dot, line, word in a dark chip (the reference labels)
  col = col || INK; side = side || 1; sz = sz || 19; var tx = x + side * 70, ty = y - 34, w = txt.length * sz * .68 + 22;
  return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.5" fill="' + col + '"/>' + line([[x, y], [tx, ty]], col, 1.6) +
    '<rect x="' + f(side > 0 ? tx : tx - w) + '" y="' + f(ty - sz * .9) + '" width="' + f(w) + '" height="' + f(sz * 1.7) + '" rx="7" fill="' + col + '"/>' +
    T(txt, side > 0 ? tx + w / 2 : tx - w / 2, ty + sz * .32, sz, "#fbf8f1");
}

// ── the molar, units at s = 1, origin = the middle of the neck at the gum line; y down ───────────────────────────────
// outer crown outline, left neck → cusps → right neck (clockwise on screen, so the inside is to the right of travel)
var CROWN = [[-92, -6], [-112, -50], [-121, -110], [-116, -168], [-100, -210], [-72, -234], [-40, -228], [-14, -202], [0, -198], [14, -202], [40, -230], [76, -238], [106, -212], [120, -166], [122, -108], [114, -48], [92, -6]];
var ROOT = [[92, -6], [88, 50], [84, 130], [74, 220], [60, 288], [46, 300], [32, 286], [26, 200], [22, 130], [10, 96], [0, 92], [-10, 96], [-22, 132], [-28, 204], [-36, 284], [-50, 302], [-66, 290], [-78, 214], [-86, 130], [-90, 50], [-92, -6]];
var PULPS = [[-60, -128], [-42, -96], [-16, -104], [0, -102], [16, -104], [42, -98], [62, -132], [70, -60], [60, 0], [62, 60], [58, 150], [50, 262], [44, 266], [44, 150], [40, 74], [22, 44], [0, 38], [-22, 44], [-42, 76], [-46, 150], [-46, 264], [-52, 262], [-60, 150], [-64, 60], [-62, 0], [-70, -60]];
// enamel thickness along the crown: thickest over the cusps (~36), thinning to 0 at the neck (the real cap)
function enamelIn(th, wear) {
  var n = CROWN.length, out = [];
  for (var i = 0; i < n; i++) {
    var p = CROWN[i], a = CROWN[Math.max(0, i - 1)], b = CROWN[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    var nx = -dy / L, ny = dx / L, w = clamp((-p[1] - 4) / 150), e = 36 * Math.pow(w, .7) * th;
    if (wear && p[0] < 0 && p[1] > -95) e *= 1 - wear;          // brushed thin at the left neck
    out.push([p[0] + nx * e, p[1] + ny * e]);
  }
  return out;
}
// tooth(cx, gy, s, o): the cut molar. o.en enamel thickness (1 normal, .3 thin) · o.soft 0..1 softened surface (acid)
// o.wear 0..1 a notch brushed into the left neck · o.fl 0..1 fluoride on the enamel · o.flOff 0..1 fluoride washed away
// o.ghost: the cut face only, no depth rim · o.uncut: the outside of the tooth (crown, not cut) · o.yellow 0..1 the crown tint seen from outside
function tooth(cx, gy, s, o) {
  o = o || {}; s = s || 1; var g = "", th = o.en == null ? 1 : o.en, wear = o.wear || 0;
  var X = function (pts) { return pts.map(function (p) { return [cx + p[0] * s, gy + p[1] * s]; }); };
  var crown = CROWN.map(function (p) { var q = [p[0], p[1]]; if (wear && p[0] < 0 && p[1] > -95 && p[1] < -10) q[0] += 16 * wear * Math.sin(Math.PI * (-p[1] - 10) / 85); return q; });
  var whole = crown.concat(ROOT.slice(1, -1));
  if (o.uncut) {   // outside view: an ivory crown, the yellow of the dentin showing through as the enamel thins
    var col = mix("#f8f4ea", "#e9cf8a", o.yellow || 0);
    g += shape(X(whole), mix(col, DENTD, .15), 2.4);
    g += shape(X(crown.concat([[60, 10], [-60, 10]])), col, 2.4);
    g += line(X([[-70, -200], [-58, -150], [-62, -70]]), "#fffdf7", 6, ' opacity=".8"') + line(X([[-30, -214], [-10, -196], [10, -198], [30, -216]]), mix(col, INK, .35), 1.6);
    return g;
  }
  if (!o.ghost) g += shape(X(whole.map(function (p) { return [p[0] + 14, p[1] - 12]; })), mix(ENAMD, DENTD, .4), 2);   // the uncut back half, behind
  g += shape(X(whole), DENT, 2.4);
  // dentin tubules: faint lines from the pulp out to the enamel
  for (var i = 0; i < 12; i++) { var a = -2.7 + i * .2, r0 = 70, r1 = 120; g += line(X([[Math.cos(a) * r0 * .9, -110 + Math.sin(a) * r0 * .55 + 20], [Math.cos(a) * r1 * .85, -110 + Math.sin(a) * r1 * .8]]), DENTD, 1.2, ' opacity=".55"'); }
  // enamel cap
  var inn = enamelIn(th, wear);
  var cap = X(crown.concat(inn.slice().reverse()));
  g += '<path d="' + P(X(crown)).replace(/^M/, "M") + ' L' + P(X(inn.slice().reverse())).slice(1) + ' Z" fill="' + ENAM + '" fill-opacity="' + f(.9) + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  g += line(X(inn), DENTD, 1.6);
  // enamel rods: short strokes across the cap
  for (var k = 2; k < crown.length - 2; k++) { var p = crown[k], q = inn[k]; g += line(X([[lerp(p[0], q[0], .2), lerp(p[1], q[1], .2)], [lerp(p[0], q[0], .7), lerp(p[1], q[1], .7)]]), ENAMD, 1.2); }
  // pulp
  g += shape(X(PULPS), PULP, 1.8) + line(X([[-50, -80], [-50, 0], [-52, 120], [-50, 250]]), PULPD, 1.4, ' opacity=".7"') + line(X([[50, -80], [52, 0], [52, 120], [47, 250]]), PULPD, 1.4, ' opacity=".7"');
  if (wear) {   // a wedge-shaped notch brushed into the neck, just at the gum line (where the enamel is thinnest)
    var wk = clamp(wear), wy = -18 + 70 * (o.rec || 0) * .45;
    g += '<path d="M' + f(cx - 96 * s) + ' ' + f(gy + (wy - 34) * s) + ' L' + f(cx + (-96 + 28 * wk) * s) + ' ' + f(gy + (wy + 4) * s) + ' L' + f(cx - 92 * s) + ' ' + f(gy + (wy + 34) * s) + ' L' + f(cx - 120 * s) + ' ' + f(gy + wy * s) + ' Z" fill="' + PAPER + '" stroke="none"/>' +
      line([[cx - 96 * s, gy + (wy - 34) * s], [cx + (-96 + 28 * wk) * s, gy + (wy + 4) * s], [cx - 92 * s, gy + (wy + 34) * s]], INK, 2.4);
  }
  if (o.soft) {   // acid: the outer skin of the enamel turns chalky and soft; acid bubbles on it
    var sk = clamp(o.soft), rim = enamelIn(.32, 0);
    g += '<path d="' + P(X(crown)) + ' L' + P(X(rim.slice().reverse())).slice(1) + ' Z" fill="' + ACID + '" fill-opacity="' + f(.45 * sk) + '" stroke="none"/>';
    for (var b = 0; b < 16; b++) { var ci = 2 + Math.floor(rnd(b) * (crown.length - 4)), cp = crown[ci], bu = (now() * .6 + rnd(b + 7)) % 1; g += '<circle cx="' + f(cx + (cp[0] + (rnd(b + 3) - .5) * 10) * s) + '" cy="' + f(gy + (cp[1] - 6 - bu * 22) * s) + '" r="' + f((2.4 + rnd(b + 1) * 3) * s) + '" fill="none" stroke="' + ACID + '" stroke-width="1.6" opacity="' + f(sk * (1 - bu)) + '"/>'; }
  }
  if (o.fl) {   // fluoride: teal dots settling on the enamel and soaking in a little
    var fk = clamp(o.fl), off = clamp(o.flOff || 0);
    for (var d = 0; d < 34; d++) { var ci2 = 1 + Math.floor(rnd(d + 40) * (crown.length - 2)), c2 = crown[ci2], c3 = inn[ci2], dep = rnd(d + 80) * .35 * fk;
      var px = lerp(c2[0], c3[0], dep) + (rnd(d + 11) - .5) * 8, py = lerp(c2[1], c3[1], dep) - 4 + (rnd(d + 21) - .5) * 6 + off * (120 + rnd(d) * 120) * (dep > .2 ? .2 : 1);
      g += '<circle cx="' + f(cx + (px + off * (rnd(d + 5) - .2) * 60) * s) + '" cy="' + f(gy + py * s) + '" r="' + f(3.4 * s) + '" fill="' + FLUO + '" opacity="' + f(fk * (1 - off * (dep > .2 ? .4 : 1))) + '"/>'; }
  }
  return g;
}
// jaw(cx, gy, s, o): the gum and bone block the tooth sits in, cut open on the same plane, drawn under the tooth.
// o.rec 0..1 the gum pulled down (recession) · o.w half width (units) · o.depth (units)
function jaw(cx, gy, s, o) {
  o = o || {}; s = s || 1; var g = "", w = o.w || 260, D = o.depth || 360, dx = 46, dy = -40, rec = o.rec || 0;
  var X = function (p) { return [cx + p[0] * s, gy + p[1] * s]; }, XS = function (pts) { return pts.map(X); };
  var mg = -18 + 74 * rec;     // gum margin on the tooth (y units)
  // top surface of the gum going back, and the right side face (straight-edged)
  g += poly(XS([[-w, 30], [-w + dx, 30 + dy], [w + dx, 30 + dy], [w, 30]]), GUMT, 2);
  g += poly(XS([[w, 30], [w + dx, 30 + dy], [w + dx, D + dy], [w, D]]), mix(BONED, GUMD, .3), 2) + poly(XS([[w, 30], [w + dx, 30 + dy], [w + dx, 96 + dy], [w, 96]]), GUMD, 2);
  // front cut face: bone with the spongy core
  g += poly(XS([[-w, 30], [w, 30], [w, D], [-w, D]]), BONE, 2.4);
  for (var i = 0; i < 26; i++) { var px = -w + 30 + rnd(i) * (2 * w - 60), py = 120 + rnd(i + 50) * (D - 150); if (Math.abs(px) < 110 && py < 320) continue; var r = 9 + rnd(i + 9) * 14; g += '<ellipse cx="' + f(X([px, py])[0]) + '" cy="' + f(X([px, py])[1]) + '" rx="' + f(r * s) + '" ry="' + f(r * .8 * s) + '" fill="' + BONEL + '" stroke="' + BONED + '" stroke-width="1.6"/>'; }
  g += line(XS([[-w, 100], [-120, 100], [-100, 80]]), BONED, 2) + line(XS([[w, 100], [120, 100], [100, 80]]), BONED, 2);   // the bone's hard rim
  g += gumOver(cx, gy, s, o, w);
  // the socket around the roots: a thin ligament line
  g += line(XS([[-98, 60], [-94, 140], [-84, 230], [-70, 300], [-50, 312], [-30, 296], [-20, 210], [-12, 110], [0, 102], [12, 110], [20, 210], [30, 296], [50, 312], [70, 300], [84, 230], [94, 140], [98, 60]]), "#b89d6a", 2, ' stroke-dasharray="5 4"');
  return g;
}
function gumOver(cx, gy, s, o, w) {   // the gum layer: a band on the bone that rises to a thin edge hugging the tooth's neck (o.rec pulls it down)
  o = o || {}; w = w || o.w || 260; var rec = o.rec || 0, mg = -16 + 70 * rec, X = function (p) { return [cx + p[0] * s, gy + p[1] * s]; };
  var gl = [[-w, 30], [-160, 28], [-122, 10 + 30 * rec], [-100, mg + 4], [-93, mg], [-92, mg + 10], [-96, 70], [-110, 90], [-130, 98], [-w, 98]];
  var sm = function (pts) { return '<path d="M' + f(pts[0][0]) + ' ' + f(pts[0][1]) + ' L' + f(pts[1][0]) + ' ' + f(pts[1][1]) + ' ' + P(pts.slice(1, -1)).replace(/^M[^QL]*/, "") + ' L' + f(pts[pts.length - 1][0]) + ' ' + f(pts[pts.length - 1][1]) + ' Z" fill="' + GUM + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>'; };
  return sm(gl.map(X)) + sm(gl.map(function (p) { return X([-p[0], p[1]]); }));
}
// the whole cut molar in its jaw
function molar(cx, gy, s, o) { o = o || {}; return jaw(cx, gy, s, o) + tooth(cx, gy, s, o) + gumOver(cx, gy, s, o); }

// a toothbrush: (x, y) = middle of the bristle tips, ang = handle direction in deg (0 = handle to the right), s scale
// o.paste: a blob of paste on the bristles · o.col handle colour · o.soft: long, thin, soft bristles; o.hard: short, stiff, splayed
function brush(x, y, ang, s, o) {
  o = o || {}; s = s || 1; var col = o.col || "#4a8fb0", g = "", hard = o.hard;
  g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + f(s) + ')">';
  if (o.handle) { g += shape([[30, -20], [40, -22], [70, -16], [120, -12], [250, -14], [262, -6], [250, 2], [120, 0], [70, -2], [40, -6], [30, -6]], col, 2.2) + line([[150, -8], [236, -8]], "#ffffff", 3, ' opacity=".5"'); return g + '</g>'; }
  g += shape([[-50, -20], [40, -22], [70, -16], [120, -12], [250, -14], [262, -6], [250, 2], [120, 0], [70, -2], [40, -6], [-50, -6]], col, 2.2);
  g += line([[150, -8], [236, -8]], "#ffffff", 3, ' opacity=".5"');
  for (var i = 0; i < 9; i++) { var bx = -42 + i * 10, h = hard ? 18 : 22, sp = hard ? (i - 4) * 1.6 : 0; g += '<path d="M' + f(bx) + ' -6 L' + f(bx + sp) + ' ' + f(h) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + f(bx) + ' -6 L' + f(bx + sp) + ' ' + f(h) + '" stroke="' + (i % 2 ? "#e9eef2" : "#bcd7e6") + '" stroke-width="4.4" stroke-linecap="round"/>'; }
  if (o.paste) g += shape([[-44, 18], [-30, 28], [-8, 30], [18, 30], [38, 26], [44, 18], [22, 14], [-20, 14]], "#f4f7f8", 1.8) + line([[-30, 22], [30, 22]], "#7fc0c8", 3);
  return g + '</g>';
}
// the brush head seen end-on (the handle runs into the page): (x, y) = the bristle tips, ang = where the bristles point (deg, 90 = down)
function brushEnd(x, y, ang, s, col) {
  s = s || 1; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f((ang == null ? 90 : ang) - 90) + ') scale(' + f(s) + ')">';
  for (var i = 0; i < 3; i++) { var bx = -18 + i * 18; g += '<path d="M' + bx + ' -40 L' + bx + ' -2" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M' + bx + ' -40 L' + bx + ' -2" stroke="' + (i % 2 ? "#e9eef2" : "#bcd7e6") + '" stroke-width="8.4" stroke-linecap="round"/>'; }
  return g + poly([[-30, -62], [30, -62], [30, -38], [-30, -38]], col || "#4a8fb0", 2.2) + '</g>';
}
function glassOJ(x, y, s, k) {   // a glass of orange juice; k 0..1 how full
  k = k == null ? 1 : k; var g = "", w = 70 * s, h = 150 * s, top = y - h, lvl = y - h * .9 * k;
  g += poly([[x - w * .5, lvl], [x + w * .5, lvl], [x + w * .42, y], [x - w * .42, y]], "#f0a33a", 0) + line([[x - w * .5, lvl], [x + w * .5, lvl]], "#d98320", 2);
  g += '<path d="M' + f(x - w * .55) + ' ' + f(top) + ' L' + f(x - w * .42) + ' ' + f(y) + ' L' + f(x + w * .42) + ' ' + f(y) + ' L' + f(x + w * .55) + ' ' + f(top) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
  g += line([[x - w * .38, top + 14 * s], [x - w * .3, y - 14 * s]], "#ffffff", 4, ' opacity=".55"');
  g += '<circle cx="' + f(x + w * .52) + '" cy="' + f(top + 6 * s) + '" r="' + f(22 * s) + '" fill="#f6c453" stroke="' + INK + '" stroke-width="2"/>' + '<circle cx="' + f(x + w * .52) + '" cy="' + f(top + 6 * s) + '" r="' + f(15 * s) + '" fill="#fbe19a" stroke="#e9a23b" stroke-width="1.5"/>';
  for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; g += line([[x + w * .52, top + 6 * s], [x + w * .52 + Math.cos(a) * 14 * s, top + 6 * s + Math.sin(a) * 14 * s]], "#e9a23b", 1.4); }
  return g;
}
function lemon(x, y, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')">' + shape([[-56, 0], [-40, -30], [0, -38], [40, -30], [58, -4], [44, 28], [0, 36], [-42, 28]], "#f2d24b", 2.4) + line([[-56, 0], [-68, -6]], INK, 3) + line([[58, -4], [70, -8]], INK, 3) + line([[-26, -18], [12, -24]], "#fff6c8", 5) + '</g>'; }
function charcoal(x, y, s) { s = s || 1; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')">' + poly([[-40, -60], [40, -60], [40, 40], [-40, 40]], "#dfe4e6", 2.4) + poly([[-44, -78], [44, -78], [44, -60], [-44, -60]], "#7a6a58", 2.4) + poly([[-40, -30], [40, -30], [40, 40], [-40, 40]], "#2d2b2b", 2);
  for (var i = 0; i < 8; i++) g += '<circle cx="' + f(-30 + rnd(i) * 60) + '" cy="' + f(-24 + rnd(i + 3) * 8) + '" r="3" fill="#2d2b2b"/>'; return g + T("فحم", 0, 4, 18, "#eee5d0") + '</g>'; }
function soda(x, y, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')">' + poly([[-44, -70], [44, -70], [44, 50], [-44, 50]], "#f2ede0", 2.4) + poly([[-44, -70], [-24, -88], [64, -88], [44, -70]], "#e4dccb", 2) + poly([[44, -70], [64, -88], [64, 32], [44, 50]], "#d6ccb6", 2) +
  poly([[-44, -34], [44, -34], [44, 10], [-44, 10]], "#d8543c", 0) + T("بيكنج", 0, -16, 15, "#fbf8f1") + T("صودا", 0, 4, 15, "#fbf8f1") + '</g>'; }
function tube(x, y, ang, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + f(s) + ')">' + shape([[-120, -30], [60, -26], [80, -14], [80, 14], [60, 26], [-120, 30]], "#f4f2ec", 2.4) + poly([[-130, -34], [-116, -34], [-116, 34], [-130, 34]], "#e8e3d6", 2) +
  poly([[80, -10], [100, -10], [100, 10], [80, 10]], "#4a8fb0", 2) + poly([[-90, -26], [40, -24], [40, 24], [-90, 26]], "#4a8fb0", 0) + T("فلورايد", -24, 8, 20, "#fbf8f1") + '</g>'; }
function cup(x, y, s, k) {   // a glass of water
  s = s || 1; k = k == null ? .7 : k; var w = 64 * s, h = 110 * s, lvl = y - h * k;
  return poly([[x - w * .5 + 3, lvl], [x + w * .5 - 3, lvl], [x + w * .42, y], [x - w * .42, y]], "#bcd7e6", 0) + line([[x - w * .5 + 3, lvl], [x + w * .5 - 3, lvl]], BLUE, 2) +
    '<path d="M' + f(x - w * .5) + ' ' + f(y - h) + ' L' + f(x - w * .42) + ' ' + f(y) + ' L' + f(x + w * .42) + ' ' + f(y) + ' L' + f(x + w * .5) + ' ' + f(y - h) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
}
// the front teeth as seen in a smile: lips, six upper teeth, the lower edge. yel 0..1 how yellow
function smile(cx, cy, s, yel) {
  s = s || 1; var g = "", col = mix("#f8f4ea", "#e2c37a", yel || 0), cd = mix(col, "#b9934a", .35);
  var X = function (p) { return [cx + p[0] * s, cy + p[1] * s]; };
  g += shape([[-190, 0], [-120, -70], [-40, -84], [0, -74], [40, -84], [120, -70], [190, 0], [120, 86], [0, 104], [-120, 86]].map(X), "#c9706c", 2.6);
  g += shape([[-160, 2], [-100, -40], [0, -46], [100, -40], [160, 2], [100, 46], [0, 56], [-100, 46]].map(X), "#5a2a2a", 2);
  var W = [[-132, 26], [-96, 34], [-62, 40], [-20, 44], [20, 44], [62, 40], [96, 34], [132, 26]];
  for (var i = 0; i < 7; i++) { var a = W[i], b = W[i + 1], top = -38 + Math.abs(i - 3) * 2.5, bot = (a[1] + b[1]) / 2 + (i === 3 ? 6 : 0);
    g += shape([[a[0] + 2, top], [b[0] - 2, top], [b[0] - 1, bot - 8], [(a[0] + b[0]) / 2 + 8, bot], [(a[0] + b[0]) / 2 - 8, bot], [a[0] + 1, bot - 8]].map(X), col, 1.8);
    g += line([[a[0] + 8, top + 8], [a[0] + 8, bot - 16]].map(X), "#fffdf7", 3, ' opacity=".7"'); }
  g += line([[-150, 8], [-70, 24], [0, 28], [70, 24], [150, 8]].map(X), cd, 1.6);
  g += shape([[-140, -36], [-60, -48], [0, -44], [60, -48], [140, -36], [100, -60], [0, -64], [-100, -60]].map(X), "#e39a9a", 1.8);   // the upper gum line
  return g;
}
// a wall with fresh paint and a sponge wiping it while wet (k 0..1 the swipe): the soft paint comes off
function wetWall(x, y, k, t) {
  var g = poly([[x, y], [x + 420, y], [x + 420, y + 460], [x, y + 460]], "#e9dcc0", 2.4);
  g += poly([[x, y], [x + 420, y], [x + 420, y + 300], [x, y + 300]], "#5f9aa8", 0);
  for (var i = 0; i < 7; i++) { var dx = x + 30 + i * 58, L = 24 + rnd(i) * 40 + 6 * Math.sin(t * 1.4 + i); g += '<path d="M' + f(dx - 6) + ' ' + f(y + 300) + ' L' + f(dx - 4) + ' ' + f(y + 300 + L) + ' Q' + f(dx) + ' ' + f(y + 308 + L) + ' ' + f(dx + 4) + ' ' + f(y + 300 + L) + ' L' + f(dx + 6) + ' ' + f(y + 300) + ' Z" fill="#5f9aa8"/>'; }
  g += T("دهان طري", x + 210, y + 50, 24, "#fbf8f1");
  var sx = x + 60 + 300 * k, sy = y + 170;
  g += '<path d="M' + f(x + 40) + ' ' + f(sy - 34) + ' L' + f(sx) + ' ' + f(sy - 38) + ' L' + f(sx) + ' ' + f(sy + 40) + ' L' + f(x + 40) + ' ' + f(sy + 36) + ' Z" fill="#e9dcc0"/>';
  for (var j = 0; j < 5; j++) g += line([[x + 50, sy - 26 + j * 14], [sx - 10, sy - 28 + j * 14 + rnd(j) * 4]], "#b9cfd3", 2);
  g += shape([[sx - 30, sy - 50], [sx + 40, sy - 54], [sx + 48, sy + 50], [sx - 26, sy + 54]], "#e8c64a", 2.4);
  for (var h = 0; h < 6; h++) g += '<circle cx="' + f(sx - 14 + rnd(h) * 50) + '" cy="' + f(sy - 30 + rnd(h + 4) * 70) + '" r="3.5" fill="#c9a52c"/>';
  return g + poly([[x, y], [x + 420, y], [x + 420, y + 460], [x, y + 460]], "none", 2.4);
}
// a painted door and a sanding block rubbing it (u: time for the rub, k: how much paint is gone)
function sandDoor(x, y, u, k) {
  var g = poly([[x, y], [x + 300, y], [x + 300, y + 560], [x, y + 560]], "#a9784d", 2.4);
  for (var i = 0; i < 6; i++) g += line([[x + 20 + i * 52, y + 10], [x + 26 + i * 52, y + 550]], "#8f6440", 2, ' opacity=".6"');
  g += poly([[x + 6, y + 6], [x + 294, y + 6], [x + 294, y + 554], [x + 6, y + 554]], "#c9566a", 0);
  var bx = x + 150 + 70 * Math.sin(u * 7), by = y + 280;
  g += '<ellipse cx="' + f(x + 150) + '" cy="' + f(by) + '" rx="' + f(40 + 70 * k) + '" ry="' + f(30 + 40 * k) + '" fill="#a9784d"/>';
  for (var j = 0; j < 4; j++) g += line([[x + 150 - 60 * k, by - 20 + j * 13], [x + 150 + 60 * k, by - 18 + j * 13]], "#8f6440", 2, ' opacity=".7"');
  g += poly([[bx - 60, by - 34], [bx + 60, by - 34], [bx + 60, by + 34], [bx - 60, by + 34]], "#d7b98a", 2.4) + poly([[bx - 60, by + 26], [bx + 60, by + 26], [bx + 60, by + 34], [bx - 60, by + 34]], "#8a7a5c", 1.6);
  for (var d = 0; d < 10; d++) { var du = (u * 1.3 + rnd(d)) % 1; g += '<circle cx="' + f(bx + (rnd(d + 2) - .5) * 140) + '" cy="' + f(by + 40 + du * 120) + '" r="3" fill="#c9566a" opacity="' + f(1 - du) + '"/>'; }
  return g;
}
// stopwatch with the hand sweeping; txt under it
function watch(x, y, r, t, txt, col) {
  var a = t * 2.2, g = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="3"/>' + poly([[x - 10, y - r - 16], [x + 10, y - r - 16], [x + 10, y - r - 2], [x - 10, y - r - 2]], INK, 0);
  g += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x) + ' ' + f(y - r + 6) + ' A' + f(r - 6) + ' ' + f(r - 6) + ' 0 ' + ((a % 6.283) > Math.PI ? 1 : 0) + ' 1 ' + f(x + Math.sin(a % 6.283) * (r - 6)) + ' ' + f(y - Math.cos(a % 6.283) * (r - 6)) + ' Z" fill="' + (col || ORANGE) + '" opacity=".3"/>';
  for (var i = 0; i < 12; i++) { var b = i * Math.PI / 6; g += line([[x + Math.sin(b) * (r - 4), y - Math.cos(b) * (r - 4)], [x + Math.sin(b) * (r - 12), y - Math.cos(b) * (r - 12)]], INK, 2); }
  g += line([[x, y], [x + Math.sin(a) * (r - 10), y - Math.cos(a) * (r - 10)]], col || ORANGE, 4) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="5" fill="' + INK + '"/>';
  return g + (txt ? T(txt, x, y + r + 40, 28, col || ORANGE) : "");
}
// a dentist's shade guide: tabs from white to yellow, all healthy
function shades(x, y, n, k) { var g = ""; for (var i = 0; i < n; i++) { var col = mix("#f8f4ea", "#e2c37a", i / (n - 1)), tx = x + i * 74, sh = clamp(k * n - i); if (sh <= 0) continue;
  g += '<g opacity="' + f(sh) + '">' + line([[tx, y - 40], [tx, y - 100]], "#9aa3a8", 6) + shape([[tx - 26, y - 40], [tx + 26, y - 40], [tx + 28, y + 20], [tx + 10, y + 58], [tx - 10, y + 58], [tx - 28, y + 20]], col, 2.2) + '</g>'; } return g; }
// enamel crystals (no cells) vs bone (living cells)
function crystals(cx, cy, r) { var g = ""; for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) { var x = cx + i * 30 + (j % 2 ? 15 : 0), y = cy + j * 26; if (Math.hypot(x - cx, y - cy) > r) continue; var p = []; for (var a = 0; a < 6; a++) p.push([x + 14 * Math.cos(a * Math.PI / 3 + .52), y + 14 * Math.sin(a * Math.PI / 3 + .52)]); g += poly(p, "#f7f3ea", 1.4); } return g; }
function boneCells(cx, cy, r, t) { var g = '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + BONE + '"/>'; for (var i = 0; i < 9; i++) { var a = i * 2.4, d = r * .62 * Math.sqrt(rnd(i)), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
  for (var b = 0; b < 5; b++) { var c = b * 1.26 + i; g += line([[x, y], [x + Math.cos(c) * 18, y + Math.sin(c) * 14]], "#b88a5a", 1.4); } g += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(10 + Math.sin(t * 2 + i)) + '" ry="7" fill="#c77d5a" stroke="' + INK + '" stroke-width="1.4"/>'; } return g; }
// a bathroom mirror frame and a sink, to stand the person in
function mirror(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], "#cfe0e4", 4) + line([[x + 30, y + 40], [x + 110, y + 10]], "#ffffff", 8, ' opacity=".55"') + line([[x + 30, y + 90], [x + 160, y + 20]], "#ffffff", 5, ' opacity=".4"'); }
function sink(x, y, w) { return shape([[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 20, y + 70], [x - w / 2 + 20, y + 70]], "#f4f2ec", 2.6) + line([[x - w / 2 + 30, y + 14], [x + w / 2 - 30, y + 14]], "#d6d2c6", 3) + poly([[x - w / 2 - 10, y - 10], [x + w / 2 + 10, y - 10], [x + w / 2 + 10, y], [x - w / 2 - 10, y]], "#e6e1d4", 2.2); }
return { brushEnd: brushEnd, tooth: tooth, jaw: jaw, gumOver: gumOver, molar: molar, brush: brush, glassOJ: glassOJ, lemon: lemon, charcoal: charcoal, soda: soda, tube: tube, cup: cup, smile: smile, wetWall: wetWall, sandDoor: sandDoor,
  watch: watch, shades: shades, crystals: crystals, boneCells: boneCells, mirror: mirror, sink: sink, tag: tag, line: line, shape: shape, poly: poly, mix: mix, P: P,
  C: { INK: INK, ORANGE: ORANGE, BLUE: BLUE, OLIVE: OLIVE, ENAM: ENAM, DENT: DENT, PULP: PULP, GUM: GUM, FLUO: FLUO } };
})();
