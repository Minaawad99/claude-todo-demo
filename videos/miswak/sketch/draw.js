/* «المسواك» — the episode's own drawings (sketch style). Self-contained SVG builders, used by shots.js and review.html.
   Real shapes: the miswak stick after the Commons photo (refs/miswak-commons.jpg: tan bark with pale patches, frayed pale
   fibres at the chewed end); the Arak shrub (Salvadora persica: drooping branches, pale fleshy oval leaves in opposite pairs,
   small red drupes in clusters); the teeth after the standard dental anatomy (enamel cap, dentin, pulp, roots in bone, gum
   margin with the papilla between teeth, the gum line). Cut-open blocks in the way of the laser episode's skin block.
   Panel units: 640 × 786. */
var MW = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0", CREAM = "#fbf8f1";
var BARK = "#b3804f", BARKD = "#8d5d35", BARKL = "#d8b48a", WOOD = "#ecd7ac", WOODD = "#d9bd88", FIB = "#f2e6c8", FIBD = "#d8c497", FIBH = "#9c7a4c",
    LEAF = "#a7b77f", LEAFD = "#7f9160", BERRY = "#c2453a", BERRYD = "#8e2f27",
    GUM = "#dd8a80", GUMD = "#c46c63", GUML = "#eba79e", ENAMEL = "#f7f2e6", ENAMELD = "#e4dccb", DENTIN = "#eedcb3", PULP = "#d77b70", BONE = "#eadfc2", BONED = "#d3c49e",
    PALATE = "#e9a69a", SILICA = "#ffffff", BRUSH = "#9fc6c4";
function f(n) { return (+n).toFixed(1); }
function now() { return (typeof window !== 'undefined' && window.__t) || 0; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function P(pts) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + " L" + f(L[0]) + " " + f(L[1]); }
function PC(pts) { var n = pts.length, d = ""; for (var i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; d += (i ? " Q" + f(a[0]) + " " + f(a[1]) + " " : "M") + f(m[0]) + " " + f(m[1]); } var a0 = pts[0], m0 = [(a0[0] + pts[n - 1][0]) / 2, (a0[1] + pts[n - 1][1]) / 2]; return d + " Q" + f(a0[0]) + " " + f(a0[1]) + " " + f((a0[0] + pts[1][0]) / 2) + " " + f((a0[1] + pts[1][1]) / 2) + " Z"; }
function line(pts, col, w, ex) { return '<path d="' + P(pts) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function blob(pts, fill, sw, ex) { return '<path d="' + PC(pts) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function poly(pts, fill, sw, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function T(s, x, y, sz, col, w, ex) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px \'Noto Sans Arabic\';fill:' + (col || INK) + '"' + (ex || "") + '>' + s + '</text>'; }
function G(tr, inner, op) { return '<g' + (tr ? ' transform="' + tr + '"' : "") + (op != null && op < 1 ? ' opacity="' + op.toFixed(3) + '"' : "") + '>' + inner + '</g>'; }
function tag(x, y, txt, col, side, dy) {   // leader-line label: dot, line, word in a dark chip (the reference labels)
  col = col || INK; side = side || 1; var tx = x + side * 70, ty = y + (dy == null ? -34 : dy), w = txt.length * 13 + 24;
  return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.5" fill="' + col + '"/>' + line([[x, y], [tx, ty]], col, 1.6) +
    '<rect x="' + f(side > 0 ? tx : tx - w) + '" y="' + f(ty - 17) + '" width="' + w + '" height="32" rx="7" fill="' + col + '"/>' + T(txt, side > 0 ? tx + w / 2 : tx - w / 2, ty + 6, 19, CREAM);
}
function chip(x, y, txt, col) { var w = txt.length * 14 + 30; return '<rect x="' + f(x - w / 2) + '" y="' + f(y - 20) + '" width="' + w + '" height="40" rx="8" fill="' + (col || INK) + '"/>' + T(txt, x, y + 8, 21, CREAM); }
function box(x, y, s, inner) { return '<g transform="translate(' + f(x - s / 2) + ' ' + f(y - s / 2) + ')"><rect width="' + s + '" height="' + s + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4"/><g transform="translate(' + f(s / 2) + ' ' + f(s / 2) + ')">' + inner + '</g></g>'; }
function cross(x, y, s) { s = s || 26; return line([[x - s, y - s], [x + s, y + s]], ORANGE, 7) + line([[x + s, y - s], [x - s, y + s]], ORANGE, 7); }
function check(x, y, s) { s = s || 26; return line([[x - s, y], [x - s * .3, y + s * .7], [x + s, y - s * .8]], OLIVE, 7); }
function arrow(x1, y1, x2, y2, col, w) { var a = Math.atan2(y2 - y1, x2 - x1), h = 16; return line([[x1, y1], [x2, y2]], col, w || 4) + poly([[x2 + Math.cos(a) * 4, y2 + Math.sin(a) * 4], [x2 - Math.cos(a - .5) * h, y2 - Math.sin(a - .5) * h], [x2 - Math.cos(a + .5) * h, y2 - Math.sin(a + .5) * h]], col, 0); }

// ── the miswak stick: from the end (x1,y1) with frayed fibres to the cut end (x2,y2). w = thickness. o.fray 0..1 (length of
//    the brushy end), o.dry 0..1 (fibres stiff, dark and splayed straight), o.cut 0..1 (a dashed cut line and the scissors)
function stick(x1, y1, x2, y2, w, o) {
  o = o || {}; var a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), fr = (o.fray == null ? 1 : o.fray) * w * 2.4, dry = o.dry || 0, s = "";
  var g = '<g transform="translate(' + f(x1) + ' ' + f(y1) + ') rotate(' + f(a * 180 / Math.PI) + ')">';
  // the body: a slightly wavy band of bark
  var top = [], bot = [], n = 8; for (var i = 0; i <= n; i++) { var x = fr * .55 + (L - fr * .55) * i / n, wob = Math.sin(i * 1.7 + 1) * w * .06; top.push([x, -w / 2 + wob]); bot.unshift([x, w / 2 + wob]); }
  s += '<path d="' + P(top) + ' L' + f(L) + ' ' + f(w / 2) + ' ' + P(bot).slice(1) + ' Z" fill="' + BARK + '" stroke="' + INK + '" stroke-width="2"/>';
  s += line(top.map(function (p) { return [p[0], p[1] + w * .2]; }), BARKL, w * .14, ' opacity=".55"');
  for (var j = 0; j < 7; j++) { var px = fr + (L - fr) * (.08 + .13 * j), pw = w * (.4 + .5 * rnd(j)); s += '<path d="M' + f(px) + ' ' + f(-w * .3 + w * .5 * rnd(j + 9)) + ' q' + f(pw * .5) + ' -3 ' + f(pw) + ' 1" stroke="' + CREAM + '" stroke-width="' + f(w * .12) + '" stroke-linecap="round" opacity=".8"/>'; }   // pale bark patches
  for (var k = 0; k < 4; k++) { var kx = fr + (L - fr) * (.2 + .2 * k); s += line([[kx, -w / 2 + 2], [kx + 3, w / 2 - 2]], BARKD, 1.4, ' opacity=".6"'); }    // growth rings showing through
  s += '<ellipse cx="' + f(L) + '" cy="0" rx="' + f(w * .18) + '" ry="' + f(w / 2) + '" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(L) + '" cy="0" rx="' + f(w * .07) + '" ry="' + f(w * .2) + '" fill="' + WOODD + '"/>';
  // the frayed fibres
  var nf = 34, fib = ""; for (var q = 0; q < nf; q++) {
    var y0 = -w * .42 + w * .84 * q / (nf - 1), sp = (y0 / (w / 2)) * (1 - dry) * .9 + (rnd(q) - .5) * .5 * (1 - dry * .6), len = fr * (.75 + .35 * rnd(q + 3));
    var sway = dry ? 0 : Math.sin(now() * 1.6 + q) * 1.2, c = dry ? FIBH : (q % 3 ? FIB : FIBD);
    fib += line([[fr * .7, y0], [fr * .7 - len * .5, y0 + sp * len * .35 + sway * .5], [fr * .7 - len, y0 + sp * len * (dry ? .25 : .75) + sway]], c, dry ? 2.2 : 1.8);
  }
  s = fib + s;
  if (o.cut) s += line([[fr * 1.15, -w], [fr * 1.15, w]], ORANGE, 3, ' stroke-dasharray="7 6" opacity="' + f(o.cut) + '"');
  return g + s + '</g>';
}
// scissors, opened (k 0..1), centred at (x,y)
function scissors(x, y, s, k, rot) {
  var o = 14 * (k == null ? 1 : k);
  var blade = function (r) { return G('rotate(' + f(r) + ')', poly([[0, -5], [86, -2], [92, 2], [0, 5]], "#c9cdd1", 2) + line([[6, 0], [84, 0]], "#9aa1a8", 1.2)); };
  var ring = function (r) { return G('rotate(' + f(r) + ')', '<ellipse cx="-38" cy="0" rx="24" ry="15" fill="none" stroke="' + ORANGE + '" stroke-width="9"/>' + line([[-14, 0], [0, 0]], ORANGE, 9)); };
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + f(s) + ')', blade(-o) + blade(o) + ring(-o * 1.6 + 180 - 180) .replace('rotate(', 'rotate(') + ring(o * 1.6) + '<circle r="5" fill="' + INK + '"/>');
}

// ── the Arak shrub (Salvadora persica): a drooping branch with opposite oval leaves and red berry clusters
function leaf(x, y, L, a, k) {   // a fleshy oval leaf, pale green, with its midrib
  var W = L * .55; return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')', '<ellipse cx="' + f(L / 2) + '" cy="0" rx="' + f(L / 2) + '" ry="' + f(W / 2) + '" fill="' + (k ? LEAFD : LEAF) + '" stroke="' + INK + '" stroke-width="1.8"/>' + line([[L * .08, 0], [L * .92, 0]], LEAFD, 1.4));
}
function berries(x, y, n, r) { var s = ""; for (var i = 0; i < n; i++) { var a = i * 2.4, rr = r * 1.3 * Math.sqrt(i); s += line([[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr + r]], OLIVE, 1); } for (i = 0; i < n; i++) { a = i * 2.4; rr = r * 1.3 * Math.sqrt(i); s += '<circle cx="' + f(x + Math.cos(a) * rr) + '" cy="' + f(y + Math.sin(a) * rr + r) + '" r="' + f(r) + '" fill="' + (i % 3 ? BERRY : BERRYD) + '" stroke="' + INK + '" stroke-width="1.2"/>'; } return s; }
// a drooping branch from (x,y): pts along it get leaf pairs; o.sway adds calm life
function branch(pts, o) {
  o = o || {}; var s = line(pts, "#cfc1a3", o.w || 9) + line(pts, INK, 1.2, ' opacity=".0"'), out = '<path d="' + P(pts) + '" stroke="' + INK + '" stroke-width="' + ((o.w || 9) + 3.5) + '" fill="none" stroke-linecap="round"/>' + line(pts, "#d6cbb0", o.w || 9);
  var lv = "", sw = Math.sin(now() * 1.1 + (o.ph || 0)) * 3;
  for (var i = 1; i < pts.length; i++) {
    var p = pts[i], q = pts[i - 1], a = Math.atan2(p[1] - q[1], p[0] - q[0]) * 180 / Math.PI, L = (o.leaf || 46) * (1 - i * .04);
    lv += leaf(p[0], p[1], L, a - 55 + sw, i % 2) + leaf(p[0], p[1], L, a + 55 + sw, (i + 1) % 2);
    if (o.berries && i % 2 === 0) lv += berries(p[0], p[1] + 6, 7, 5);
  }
  return out + lv;
}
function shrub(cx, gy, s) {   // the whole bush: a short trunk, many drooping branches, on desert ground
  var g = "", B = [[[0, 0], [-30, -90], [-110, -150], [-190, -130], [-240, -80]], [[0, 0], [20, -110], [110, -170], [200, -150], [250, -90]], [[-10, -60], [-70, -190], [-160, -230], [-230, -200]], [[10, -60], [60, -200], [150, -240], [230, -210]], [[0, -40], [-10, -200], [-60, -260], [-120, -255]], [[0, -40], [10, -210], [70, -265], [130, -255]]];
  g += '<path d="M-14 0 Q-10 -40 -4 -70 L6 -70 Q12 -40 16 0 Z" fill="#cbbd9c" stroke="' + INK + '" stroke-width="2"/>';
  B.forEach(function (b, i) { g += branch(b, { w: 6, leaf: 30, berries: i % 2 === 0, ph: i }); });
  return G('translate(' + f(cx) + ' ' + f(gy) + ') scale(' + f(s) + ')', g);
}

// ── teeth (side cut): a molar/premolar at gum line gy. o.k = width, h = crown height, r = root length, o.roots 1|2
function tooth(cx, gy, w, h, r, o) {
  o = o || {}; var two = (o.roots || 2) === 2;
  var crown = [[cx - w / 2, gy + 10], [cx - w / 2 - 5, gy - h * .45], [cx - w / 2 + 3, gy - h * .86], [cx - w * .24, gy - h], [cx - w * .04, gy - h * .86], [cx + w * .2, gy - h * 1.01], [cx + w / 2 - 3, gy - h * .86], [cx + w / 2 + 5, gy - h * .45], [cx + w / 2, gy + 10]];
  var root = two ? [[cx + w * .46, gy + r * .45], [cx + w * .32, gy + r], [cx + w * .2, gy + r * .98], [cx + w * .08, gy + r * .4], [cx - w * .08, gy + r * .4], [cx - w * .2, gy + r * .98], [cx - w * .32, gy + r], [cx - w * .46, gy + r * .45]]
                 : [[cx + w * .4, gy + r * .5], [cx + w * .1, gy + r], [cx - w * .1, gy + r], [cx - w * .4, gy + r * .5]];
  var all = crown.concat(root), s = blob(all, DENTIN, 2.2);
  // the enamel cap over the crown, thinner toward the neck
  var inner = [[cx + w / 2 - 4, gy + 6], [cx + w / 2 - 9, gy - h * .45], [cx + w / 2 - 12, gy - h * .72], [cx + w * .2, gy - h * .8], [cx - w * .04, gy - h * .68], [cx - w * .24, gy - h * .8], [cx - w / 2 + 12, gy - h * .72], [cx - w / 2 + 9, gy - h * .45], [cx - w / 2 + 4, gy + 6]];
  s += '<path d="' + P(crown) + ' ' + P(inner).replace("M", "L") + ' Z" fill="' + ENAMEL + '" stroke="' + INK + '" stroke-width="1.6"/>';
  // the pulp: chamber and canals
  var pulp = two ? [[cx - w * .22, gy - h * .45], [cx, gy - h * .52], [cx + w * .22, gy - h * .45], [cx + w * .25, gy + r * .3], [cx + w * .26, gy + r * .9], [cx + w * .21, gy + r * .3], [cx, gy - h * .1], [cx - w * .21, gy + r * .3], [cx - w * .26, gy + r * .9], [cx - w * .25, gy + r * .3]]
                 : [[cx - w * .16, gy - h * .45], [cx + w * .16, gy - h * .45], [cx + w * .05, gy + r * .9], [cx - w * .05, gy + r * .9]];
  s += blob(pulp, PULP, 1.4, ' opacity=".9"');
  s += line([[cx - w * .3, gy - h * .55], [cx - w * .1, gy - h * .62]], CREAM, 3, ' opacity=".8"');   // a highlight on the enamel
  if (o.stain) for (var i = 0; i < 9; i++) s += '<circle cx="' + f(cx - w * .4 + w * .8 * rnd(i + o.stain)) + '" cy="' + f(gy - h * (.15 + .7 * rnd(i + 5))) + '" r="' + f(2.4 + 2 * rnd(i)) + '" fill="#b79a5e" opacity="' + f(o.stainK == null ? .8 : o.stainK * .8) + '"/>';
  return s;
}
// a row of teeth in their gum and bone, cut from the side. xs: the tooth centres. returns {svg}
function jawCut(x0, x1, gy, xs, o) {
  o = o || {}; var w = o.w || 120, h = o.h || 90, r = o.r || 150, s = "";
  s += '<rect x="' + f(x0) + '" y="' + f(gy + 34) + '" width="' + f(x1 - x0) + '" height="' + f(r + 120) + '" fill="' + BONE + '" stroke="' + INK + '" stroke-width="2"/>';
  for (var i = 0; i < 46; i++) s += '<circle cx="' + f(x0 + (x1 - x0) * rnd(i)) + '" cy="' + f(gy + 60 + (r + 80) * rnd(i + 50)) + '" r="' + f(3 + 6 * rnd(i + 9)) + '" fill="none" stroke="' + BONED + '" stroke-width="1.6"/>';   // spongy bone
  // the gum: a band over the bone, with a papilla rising between each pair of teeth
  var gp = [[x0, gy + 60], [x0, gy - 4]];
  xs.forEach(function (x, j) { if (j > 0) { var m = (xs[j - 1] + x) / 2; gp.push([m - w * .22, gy - 8], [m, gy - 30], [m + w * .22, gy - 8]); } gp.push([x - w * .3, gy + 2], [x + w * .3, gy + 2]); });
  gp.push([x1, gy - 4], [x1, gy + 60]);
  s += '<path d="' + P(gp) + ' Z" fill="' + GUM + '" stroke="' + INK + '" stroke-width="2"/>';
  s += line(gp.slice(1, -1).map(function (p) { return [p[0], p[1] + 12]; }), GUML, 5, ' opacity=".7"');
  xs.forEach(function (x, j) { s += tooth(x, gy, w, h, r, { roots: 2, stain: o.stain ? j * 7 + 1 : 0, stainK: o.stainK }); });
  // the gum margin hugs each neck: a flap of gum over each side of the tooth, the sulcus a fine line inside it
  xs.forEach(function (x) { [-1, 1].forEach(function (sd) {
    var e = x + sd * w / 2, fl = [[e + sd * 26, gy + 46], [e + sd * 22, gy - 10], [e + sd * 6, gy - 12], [e - sd * 7, gy + 2], [e - sd * 9, gy + 46]];
    s += '<path d="' + P(fl) + ' Z" fill="' + GUM + '" stroke="none"/>' + line([[e + sd * 6, gy - 12], [e - sd * 7, gy + 2], [e - sd * 9, gy + 40]], INK, 2) + line([[e + sd * 1, gy - 6], [e - sd * 1, gy + 20]], GUMD, 1.6);
  }); });
  return s;
}
// the upper dental arch seen from below (occlusal view): 14 teeth on a U, the gum horseshoe and the palate
function arch(cx, ty, a, b, o) {
  o = o || {}; var s = "", T7 = [["i", 26, 18], ["i", 21, 16], ["c", 22, 22], ["p", 22, 26], ["p", 22, 26], ["m", 34, 36], ["m", 32, 34]], pts = [];
  var pos = function (u) { var ph = u * 1.5; return [Math.sin(ph) * a, ty + b * (1 - Math.cos(ph))]; };   // u 0..1: from the midline back
  // gum horseshoe and palate
  var outer = [], inn = []; for (var i = 0; i <= 24; i++) { var u = -1 + 2 * i / 24, p = pos(u), n = [Math.sin(u * 1.5) * Math.cos(0), 0], d = 34; var ang = Math.atan2(b * Math.sin(u * 1.5) * 1.5, a * Math.cos(u * 1.5) * 1.5); var nx = -Math.sin(ang), ny = Math.cos(ang); outer.push([cx + p[0] - nx * d, p[1] - ny * d]); inn.push([cx + p[0] + nx * d * .9, p[1] + ny * d * .9]); }
  s += '<path d="' + P(inn) + ' Z" fill="' + PALATE + '" stroke="' + INK + '" stroke-width="2"/>';
  for (i = 0; i < 4; i++) s += line([[cx - 50 + i * 4, ty + 70 + i * 26], [cx - 10, ty + 84 + i * 26], [cx + 10, ty + 84 + i * 26], [cx + 50 - i * 4, ty + 70 + i * 26]], "#d58d81", 3);   // the ridges of the palate
  s += line([[cx, ty + 60], [cx, ty + b * .95]], "#d58d81", 2.5);
  s += '<path d="' + P(outer) + ' ' + P(inn.slice().reverse()).replace("M", "L") + ' Z" fill="' + GUM + '" stroke="' + INK + '" stroke-width="2"/>';
  // teeth, from the midline out to the third molar on each side, placed by arc length along the arch
  var NS = 400, path = [], acc = [0]; for (i = 0; i <= NS; i++) { var pp = pos(i / NS); path.push([cx + pp[0], pp[1]]); if (i) acc.push(acc[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])); }
  var half = acc[NS], sum = T7.reduce(function (z, t) { return z + t[1]; }, 0), k = half * .94 / sum;
  var at = function (d) { for (var q = 1; q <= NS; q++) if (acc[q] >= d) return q; return NS; };
  [-1, 1].forEach(function (side) {
    var d = half * .01; T7.forEach(function (td, j) {
      var tw = td[1] * k, th = td[2] * k * .95; d += tw / 2; var q = at(d), x = path[q][0], y = path[q][1], qa = path[Math.max(0, q - 1)], qb = path[Math.min(NS, q + 1)];
      if (side < 0) x = 2 * cx - x;
      var ang = Math.atan2(qb[1] - qa[1], qb[0] - qa[0]) * 180 / Math.PI * side, hot = o.hot && j >= o.hot, fill = hot ? "#f4c8ad" : ENAMEL, inner;
      if (td[0] === "i") inner = '<rect x="' + f(-tw / 2) + '" y="' + f(-th / 2) + '" width="' + f(tw) + '" height="' + f(th) + '" rx="' + f(th * .4) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.8"/>' + line([[-tw * .35, th * .2], [tw * .35, th * .2]], ENAMELD, 1.4);
      else if (td[0] === "c") inner = blob([[-tw / 2, 0], [0, -th / 2], [tw / 2, 0], [0, th / 2]], fill, 1.8);
      else inner = '<rect x="' + f(-tw / 2) + '" y="' + f(-th / 2) + '" width="' + f(tw) + '" height="' + f(th) + '" rx="' + f(tw * .3) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.8"/>' + line([[-tw * .3, 0], [tw * .3, 0]], ENAMELD, 1.6) + (td[0] === "m" ? line([[0, -th * .3], [0, th * .3]], ENAMELD, 1.6) : "");
      s += G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')', inner);
      if (j === 6) pts[side] = [x, y];
      d += tw / 2;
    });
  });
  return { svg: s, back: pts };
}
// a toothbrush head seen from the side: handle from (x,y) going right, bristles up (o.down: bristles down). o.miswak: bristles in the
// miswak tan; o.taper: needle-fine tips; o.hard: stiff thick tufts; o.bend 0..1 tufts bend as they press
function brushSide(x, y, L, o) {
  o = o || {}; var s = "", col = o.col || "#9cc79a", dir = o.down ? 1 : -1, hw = 140, bend = o.bend || 0, hgt = o.h == null ? 62 : o.h;
  // the head (a rounded slab), the neck narrowing, then the handle widening; translucent plastic with a highlight
  var hd = [[x - 8, y], [x - 4, y - 11], [x + hw, y - 11], [x + hw + 40, y - 6], [x + hw + 80, y - 7], [x + L, y - 13], [x + L + 12, y + 1], [x + L, y + 15], [x + hw + 80, y + 9], [x + hw + 40, y + 6], [x + hw, y + 11], [x - 4, y + 11]];
  s += '<path d="' + PC(hd) + '" fill="' + col + '" fill-opacity=".85" stroke="' + INK + '" stroke-width="2"/>' + line([[x + 6, y - 5], [x + hw, y - 5], [x + hw + 40, y - 2], [x + L - 10, y - 6]], "#ffffff", 2.5, ' opacity=".55"');
  var bc = o.miswak ? FIB : "#f4f1ea", bd = o.miswak ? FIBD : "#d9d4ca", n = 8;
  if (hgt > 0) for (var i = 0; i < n; i++) {
    var bx = x + 8 + i * (hw - 16) / (n - 1), by = y + dir * 11, top = by + dir * hgt, b2 = bend * 20 * (i % 2 ? 1 : .8), m = o.hard ? 5 : 7;
    for (var q = 0; q < m; q++) { var dx = (q - (m - 1) / 2) * (o.hard ? 3.2 : 2.2), tipx = bx + dx * 1.25 + b2, tipy = top + (o.taper ? dir * 4 * Math.abs(q - (m - 1) / 2) * -.5 : 0);
      s += line([[bx + dx, by], [bx + dx + b2 * .35, by + dir * hgt * .6], [tipx, tipy]], q % 2 ? bc : bd, o.hard ? 3.2 : 2.1);
      if (o.taper) s += line([[bx + dx + b2 * .6, by + dir * hgt * .8], [tipx, tipy + dir * 7]], bd, .9); }
    s += line([[bx - 7, by + dir * 1.5], [bx + 7, by + dir * 1.5]], INK, 1.6);
  }
  return s;
}
// the brush head cut across (as tooth-brushing diagrams show it: the handle runs into the page), its tufts fanning toward
// (tx,ty). o.hard: few thick straight filaments; o.taper: fine tips; o.bend 0..1: they bow as they press; o.col: the plastic
function brushEnd(hx, hy, tx, ty, o) {
  o = o || {}; var a = Math.atan2(ty - hy, tx - hx), L = Math.hypot(tx - hx, ty - hy), s = "", n = o.hard ? 6 : 13, sp = o.hard ? 7 : 4.2, bc = o.miswak ? FIB : "#f4f1ea", bd = o.miswak ? FIBD : "#d9d4ca";
  for (var i = 0; i < n; i++) { var off = (i - (n - 1) / 2) * sp, bw = (o.bend || 0) * 22 * (1 - Math.abs(off) / (n * sp)), sx = off, ex = off * (o.hard ? 1 : 1.25);
    s += line([[sx, 0], [ex * .5 + bw, L * .55], [ex, L + (o.taper ? -Math.abs(off) * .15 : 0)]], i % 2 ? bc : bd, o.hard ? 4.6 : 2.2) + (o.taper ? line([[ex * .9, L * .82], [ex, L + 6]], bd, .9) : ""); }
  s += '<rect x="' + f(-n * sp / 2 - 12) + '" y="-46" width="' + f(n * sp + 24) + '" height="46" rx="12" fill="' + (o.col || "#9cc79a") + '" fill-opacity=".9" stroke="' + INK + '" stroke-width="2.2"/>' + line([[-n * sp / 2 - 2, -36], [n * sp / 2 - 4, -36]], "#ffffff", 3, ' opacity=".5"');
  return G('translate(' + f(hx) + ' ' + f(hy) + ') rotate(' + f(a * 180 / Math.PI - 90) + ')', s);
}
// two crowns from the front with the gum scallops and the dark gap between them (the embrasure), fine tips going into it
function frontTeeth(cx, gy, w, h, tips) {
  var s = '<path d="M' + f(cx - w * 1.2) + ' ' + f(gy + 90) + ' L' + f(cx - w * 1.2) + ' ' + f(gy) + ' Q' + f(cx - w * .5) + ' ' + f(gy + 30) + ' ' + f(cx) + ' ' + f(gy - 26) + ' Q' + f(cx + w * .5) + ' ' + f(gy + 30) + ' ' + f(cx + w * 1.2) + ' ' + f(gy) + ' L' + f(cx + w * 1.2) + ' ' + f(gy + 90) + ' Z" fill="' + GUM + '" stroke="' + INK + '" stroke-width="2"/>';
  s += '<path d="M' + f(cx - 10) + ' ' + f(gy - 40) + ' L' + f(cx + 10) + ' ' + f(gy - 40) + ' L' + f(cx) + ' ' + f(gy - 24) + ' Z" fill="#5a2e2a"/>';
  [-1, 1].forEach(function (sd) { var x0 = cx + sd * 4, x1 = cx + sd * (w + 4); s += '<path d="M' + f(x0) + ' ' + f(gy - 40) + ' Q' + f(x0 - sd * 2) + ' ' + f(gy - h * .7) + ' ' + f(x0 + sd * 10) + ' ' + f(gy - h) + ' L' + f(x1 - sd * 10) + ' ' + f(gy - h) + ' Q' + f(x1 + sd * 2) + ' ' + f(gy - h * .7) + ' ' + f(x1) + ' ' + f(gy - 10) + ' Q' + f((x0 + x1) / 2) + ' ' + f(gy + 26) + ' ' + f(x0 + sd * 2) + ' ' + f(gy - 26) + ' Z" fill="' + ENAMEL + '" stroke="' + INK + '" stroke-width="2"/>'; });
  for (var i = 0; tips && i < 7; i++) s += line([[cx - 30 + i * 10, gy - h * .55], [cx - 9 + i * 3, gy - 34]], i % 2 ? FIB : FIBD, 2);
  return s;
}
// one bristle tip, magnified: o.taper → a needle-fine tip; otherwise a rounded end
function bristle(x, y, h, w, taper) {
  if (taper) return poly([[x - w / 2, y], [x + w / 2, y], [x + w * .3, y - h * .55], [x + 1.2, y - h], [x - 1.2, y - h], [x - w * .3, y - h * .55]], FIB, 2) + line([[x - w * .15, y - 10], [x - 1, y - h * .9]], CREAM, 2);
  return '<path d="M' + f(x - w / 2) + ' ' + f(y) + ' L' + f(x - w / 2) + ' ' + f(y - h + w / 2) + ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + w / 2) + ' ' + f(y - h + w / 2) + ' L' + f(x + w / 2) + ' ' + f(y) + ' Z" fill="#f4f1ea" stroke="' + INK + '" stroke-width="2"/>';
}
function pencil(x, y, s, a) { return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a || 0) + ') scale(' + f(s) + ')', poly([[-60, -9], [30, -9], [30, 9], [-60, 9]], "#e9b949", 2) + poly([[30, -9], [58, 0], [30, 9]], "#ecd7ac", 2) + poly([[49, -3.3], [58, 0], [49, 3.3]], INK, 0) + poly([[-72, -9], [-60, -9], [-60, 9], [-72, 9]], "#d58d81", 2) + line([[-55, 0], [26, 0]], "#c9962a", 2)); }
function calendar(x, y, s, txt, k) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', '<rect x="-40" y="-34" width="80" height="70" rx="6" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-40" y="-34" width="80" height="18" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2.4"/>' + line([[-24, -42], [-24, -28]], INK, 4) + line([[24, -42], [24, -28]], INK, 4) + T(txt, 0, 20, txt.length > 4 ? 15 : 22, INK)); }
function bin(x, y, s) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')', poly([[-46, -80], [46, -80], [38, 0], [-38, 0]], "#8a8f96", 2.2) + line([[-20, -66], [-17, -12]], "#6d7279", 2.4) + line([[0, -66], [0, -12]], "#6d7279", 2.4) + line([[20, -66], [17, -12]], "#6d7279", 2.4) + '<rect x="-52" y="-92" width="104" height="14" rx="4" fill="#9aa0a7" stroke="' + INK + '" stroke-width="2.2"/>'); }
function img(href, x, y, w, h, ex) { return '<image href="' + href + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" preserveAspectRatio="xMidYMid slice"' + (ex || "") + '/>'; }
// a real photo in a taped paper frame (the sketch card stays the page; the clip sits on it)
var CLIPN = 0;
function photo(href, x, y, w, h, rot) {
  var id = "mwph" + (++CLIPN);
  return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')', '<rect x="' + f(-w / 2 - 10) + '" y="' + f(-h / 2 - 10) + '" width="' + f(w + 20) + '" height="' + f(h + 20) + '" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<clipPath id="' + id + '"><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')">' + img(href, -w / 2, -h / 2, w, h) + '</g>' +
    '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/>' +
    '<rect x="-34" y="' + f(-h / 2 - 22) + '" width="68" height="22" fill="#e9dcae" opacity=".85" transform="rotate(-4)"/>');
}
// the brand corner (right side, as the user asked): the company logo in a white rounded card. href = the logo file
function logo(href, x, y, w) { var h = w * .34; return '<rect x="' + f(x - w / 2) + '" y="' + f(y - h / 2) + '" width="' + w + '" height="' + f(h) + '" rx="10" fill="#ffffff" stroke="' + INK + '" stroke-width="2"/>' + (href ? '<image href="' + href + '" x="' + f(x - w / 2 + 10) + '" y="' + f(y - h / 2 + 7) + '" width="' + f(w - 20) + '" height="' + f(h - 14) + '" preserveAspectRatio="xMidYMid meet"/>' : T("لوجو الشركة", x, y + 7, 18, "#9a9184")); }
return { C: { INK: INK, ORANGE: ORANGE, BLUE: BLUE, OLIVE: OLIVE, PAPER: PAPER, CREAM: CREAM, GUM: GUM, ENAMEL: ENAMEL, FIB: FIB, BRUSH: BRUSH, SILICA: SILICA, LEAF: LEAF, BERRY: BERRY, BARK: BARK, WOOD: WOOD },
  f: f, P: P, line: line, blob: blob, poly: poly, T: T, G: G, tag: tag, chip: chip, box: box, cross: cross, check: check, arrow: arrow, rnd: rnd,
  stick: stick, scissors: scissors, leaf: leaf, berries: berries, branch: branch, shrub: shrub, tooth: tooth, jawCut: jawCut, arch: arch,
  brushSide: brushSide, brushEnd: brushEnd, frontTeeth: frontTeeth, bristle: bristle, pencil: pencil, calendar: calendar, bin: bin, img: img, photo: photo, logo: logo };
})();
