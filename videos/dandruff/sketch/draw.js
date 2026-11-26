/* «القشرة» — the episode's own drawings (sketch style, with volume: every round thing has a lit side, a shade side and a
   cast shadow in flat tones, no gradients). Real shapes after the sources in ../refs/SOURCES.md:
   - the scalp cut open as a block (v20's way): stratum corneum as flat stacked cells, the living epidermis as round
     nucleated cells, dermis with follicles and multi-lobed sebaceous glands, a vessel, fat as packed cells;
   - Malassezia: small oval yeast cells budding on a broad base (the «bowling pin» shape of the micrographs);
   - a hair seen close: a cylinder covered in overlapping cuticle scales pointing to the tip;
   - a dandruff flake: a sheet of many flat corneocytes stuck together, curling at the edges.
   Panel units: 640 × 786. Self-contained; used by shots.js and review.html. */
var DD = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0";
var SKIN = "#e8b49a", SKIND = "#cf9478", SKINL = "#f3cdb8",
    SC = "#f1dccb", SCD = "#d9bea8",                  // stratum corneum (dead flat cells)
    EPI = "#e3a08c", EPID = "#c9826f", EPIL = "#efbcaa", NUC = "#9a5446",
    DER = "#f0c9b8", DERD = "#dcab98", FIB = "#e4b5a2",
    FAT = "#f2e6c2", FATD = "#d9c896", FATL = "#fbf3dc",
    SHEATH = "#f6dccf", HAIR = "#2f2119", HAIRM = "#4a3326", HAIRL = "#8a6a55",
    GLAND = "#ecd38a", GLANDD = "#c9aa58", GLANDL = "#f8e8b8",
    VES = "#b8463a", VESL = "#e07d6e",
    RED = "#c9473c", REDL = "#e9897c",
    YE = "#a3ab62", YED = "#6f7a3a", YEL = "#d6dc9e",   // the yeast, olive (the named actor)
    OIL = "#e7b94a", OILD = "#b98a22", OILL = "#fbe6a6",
    FLK = "#fbf7ee", FLKD = "#d8cfbd";
function f(n) { return (+n).toFixed(1); }
function lerp(a, b, k) { return a + (b - a) * k; }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function now() { return (typeof window !== "undefined" && window.__t) || 0; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function mix(a, b, k) { var p = function (c, i) { return parseInt(c.slice(1 + i * 2, 3 + i * 2), 16); }; return "#" + [0, 1, 2].map(function (i) { return ("0" + Math.round(lerp(p(a, i), p(b, i), clamp(k))).toString(16)).slice(-2); }).join(""); }
function P(pts) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + " L" + f(L[0]) + " " + f(L[1]); }
function line(pts, col, w, ex) { return '<path d="' + P(pts) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function shape(pts, fill, sw, ex) { return '<path d="' + P(pts) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function poly(pts, fill, sw, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + fill + '"' + (sw === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"') + (ex || "") + '/>'; }
function circ(x, y, r, fill, sw, ex) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (sw === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"') + (ex || "") + '/>'; }
function ell(x, y, rx, ry, fill, sw, ex) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + fill + '"' + (sw === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"') + (ex || "") + '/>'; }
var CL = 0;
// a ball with volume: cast shadow, body, shade crescent (lower right), highlight (upper left)
function ball(x, y, r, col, colD, colL, sw, shadow) {
  var id = "bl" + (++CL), g = "";
  if (shadow !== false) g += ell(x + r * .25, y + r * .92, r * .9, r * .28, "#2a2016", 0, ' opacity=".13"');
  g += '<clipPath id="' + id + '"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '"/></clipPath>' + circ(x, y, r, col, 0);
  g += '<g clip-path="url(#' + id + ')">' + circ(x + r * .38, y + r * .42, r * 1.02, colD, 0, ' opacity=".55"') + circ(x - r * .05, y - r * .05, r * .82, col, 0) + '</g>';
  g += ell(x - r * .38, y - r * .4, r * .26, r * .16, colL, 0, ' transform="rotate(-35 ' + f(x - r * .38) + ' ' + f(y - r * .4) + ')"');
  return g + circ(x, y, r, "none", sw == null ? 2 : sw);
}
// a hair as a shaded cylinder along a smooth path: ink edge, body, shade side, highlight line
function hairPath(pts, w, col, k) {
  col = col || HAIR; var g = line(pts, INK, w + 2.6) + line(pts, col, w);
  var off = pts.map(function (p, i) { var q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1; return [p[0] - dy / d * w * .25, p[1] + dx / d * w * .25]; });
  g += line(off, col === HAIR ? HAIRL : mix(col, "#ffffff", .5), Math.max(1, w * .22), ' opacity=".9"');
  return g;
}
function tag(x, y, txt, col, side, sz) {   // leader-line label: dot, line, word in a coloured chip
  col = col || INK; side = side || 1; sz = sz || 19; var tx = x + side * 70, ty = y - 34, w = txt.length * sz * .68 + 22;
  return circ(x, y, 3.5, col, 0) + line([[x, y], [tx, ty]], col, 1.6) +
    '<rect x="' + f(side > 0 ? tx : tx - w) + '" y="' + f(ty - sz * .9) + '" width="' + f(w) + '" height="' + f(sz * 1.7) + '" rx="7" fill="' + col + '"/>' +
    '<text x="' + f(side > 0 ? tx + w / 2 : tx - w / 2) + '" y="' + f(ty + sz * .32) + '" text-anchor="middle" style="font:800 ' + sz + 'px \'Noto Sans Arabic\';fill:#fbf8f1">' + txt + '</text>';
}

// ── the yeast: Malassezia, an oval mother cell with a bud on a broad base. (x, y) centre, r = mother radius, a = angle of the bud
// o.eat 0..1: a droplet of oil going into it; o.bud 0..1: how far the bud has grown
function yeast(x, y, r, a, o) {
  o = o || {}; a = a == null ? -30 : a; var ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180), g = "";
  var bud = o.bud == null ? .75 : o.bud, br = r * (.45 + .25 * bud), bx = x + ca * (r * .78 + br * .55), by = y + sa * (r * .78 + br * .55);
  var breathe = 1 + .03 * Math.sin(now() * 2.2 + x * .1);
  r *= breathe;
  g += ell(x + r * .3, y + r * 1.05, r * 1.25, r * .3, INK, 0, ' opacity=".13"');
  // the broad neck joining mother and bud (one outline: drawn as the two balls plus a waist patch)
  if (bud > 0) g += ball(bx, by, br, YE, YED, YEL, 2, false);
  g += '<g transform="rotate(' + f(a) + ' ' + f(x) + ' ' + f(y) + ')">' + ell(x, y, r * 1.12, r * .92, YE, 0) + '</g>';
  var id = "ye" + (++CL);
  g += '<clipPath id="' + id + '"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 1.12) + '" ry="' + f(r * .92) + '" transform="rotate(' + f(a) + ' ' + f(x) + ' ' + f(y) + ')"/></clipPath>';
  g += '<g clip-path="url(#' + id + ')">' + circ(x + r * .45, y + r * .5, r * 1.05, YED, 0, ' opacity=".5"') + circ(x - r * .08, y - r * .08, r * .85, YE, 0) + '</g>';
  g += '<g transform="rotate(' + f(a) + ' ' + f(x) + ' ' + f(y) + ')">' + ell(x, y, r * 1.12, r * .92, "none", 2.2) + '</g>';
  // inner cell wall line and a few granules (real yeast: a thick wall, a vacuole)
  g += '<g transform="rotate(' + f(a) + ' ' + f(x) + ' ' + f(y) + ')">' + ell(x, y, r * .95, r * .76, "none", 0, ' stroke="' + YED + '" stroke-width="1.4" opacity=".7"') + ell(x - r * .15, y + r * .1, r * .32, r * .26, mix(YE, "#ffffff", .25), 0, ' stroke="' + YED + '" stroke-width="1.2"') + '</g>';
  g += ell(x - r * .45, y - r * .42, r * .3, r * .17, YEL, 0, ' transform="rotate(-30 ' + f(x - r * .45) + ' ' + f(y - r * .42) + ')"');
  if (o.eat) { var e = clamp(o.eat), ox = lerp(x - r * 2.2, x - r * .4, e), oy = lerp(y + r * .2, y + r * .1, e); g += ball(ox, oy, r * .32 * (1 - e * .7), OIL, OILD, OILL, 1.6, false); }
  return g;
}
// a sebum droplet (oil) and the leftovers (the fatty acids the yeast leaves: small orange specks)
function oil(x, y, r) { var w = 1 + .04 * Math.sin(now() * 3 + x); return '<path d="M' + f(x) + ' ' + f(y - r * 1.5 * w) + ' C' + f(x + r * .9) + ' ' + f(y - r * .4) + ' ' + f(x + r) + ' ' + f(y + r * .9) + ' ' + f(x) + ' ' + f(y + r) + ' C' + f(x - r) + ' ' + f(y + r * .9) + ' ' + f(x - r * .9) + ' ' + f(y - r * .4) + ' ' + f(x) + ' ' + f(y - r * 1.5 * w) + ' Z" fill="' + OIL + '" stroke="' + INK + '" stroke-width="2"/>' + ell(x + r * .3, y + r * .45, r * .55, r * .38, OILD, 0, ' opacity=".45"') + ell(x - r * .35, y - r * .25, r * .22, r * .34, OILL, 0); }
function bits(x, y, n, sp, seed, k) { var g = ""; k = k == null ? 1 : k; for (var i = 0; i < n; i++) { var a = rnd(i + seed) * 6.28, d = sp * Math.sqrt(rnd(i * 3 + seed)), s = 3 + rnd(i + seed * 2) * 3; g += '<path d="M' + f(x + Math.cos(a) * d - s) + ' ' + f(y + Math.sin(a) * d) + ' l' + f(s) + ' ' + f(-s * .8) + ' l' + f(s) + ' ' + f(s * .9) + ' l' + f(-s * 1.2) + ' ' + f(s * .7) + ' Z" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="1.1" opacity="' + f(k) + '"/>'; } return g; }

// ── a flake: a sheet of flat corneocytes stuck together. (x, y) centre, s scale, rot, o.cells shown, o.curl
function flake(x, y, s, rot, o) {
  o = o || {}; s = s || 1; var g = "", seed = o.seed || 3;
  var out = [], n = 11; for (var i = 0; i < n; i++) { var a = i / n * 6.283, rr = (52 + rnd(i + seed) * 26) * s; out.push([Math.cos(a) * rr * 1.2, Math.sin(a) * rr * .8]); }
  var tr = 'translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')';
  g += '<g transform="' + tr + '">';
  g += '<g transform="translate(' + f(6 * s) + ' ' + f(9 * s) + ')">' + poly(out, "#2a2016", 0, ' opacity=".14"') + '</g>';   // cast shadow
  g += '<g transform="translate(0 ' + f(5 * s) + ')">' + poly(out, FLKD, 2) + '</g>';                                         // the sheet's thickness
  g += poly(out, FLK, 2);
  var id = "fk" + (++CL); g += '<clipPath id="' + id + '"><path d="M' + out.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z"/></clipPath><g clip-path="url(#' + id + ')">';
  if (o.cells !== false) {   // the cells inside: flat polygons, staggered like bricks, each with a faint shade edge
    var cw = 34 * s, chh = 20 * s;
    for (var r = -5; r <= 5; r++) for (var c = -6; c <= 6; c++) {
      var cx = c * cw + (r % 2 ? cw / 2 : 0) + (rnd(r * 13 + c) - .5) * 6 * s, cy = r * chh;
      var hex = [[cx - cw * .5, cy], [cx - cw * .32, cy - chh * .5], [cx + cw * .32, cy - chh * .5], [cx + cw * .5, cy], [cx + cw * .32, cy + chh * .5], [cx - cw * .32, cy + chh * .5]];
      g += '<path d="M' + hex.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + (rnd(r * 7 + c * 3) > .7 ? "#f2eadb" : FLK) + '" stroke="#bfb29a" stroke-width="' + f(1.8) + '"/>';
    }
  }
  g += ell(-20 * s, -18 * s, 34 * s, 10 * s, "#ffffff", 0, ' opacity=".55"') + '</g>';
  if (o.curl) g += shape([[out[2][0], out[2][1]], [out[3][0] * .9, out[3][1] * 1.05 - 8 * s], [out[4][0] * .8, out[4][1] - 4 * s], [out[3][0] * .7, out[3][1] * .8]], FLKD, 1.6);
  if (o.yeast) g += yeast(18 * s, 8 * s, 9 * s, 20, { bud: .6 });
  return g + '</g>';
}
// a tiny white speck of dandruff (on hair, shoulders): an irregular chip with a shade edge
function speck(x, y, s, i) { var p = []; for (var k = 0; k < 6; k++) { var a = k / 6 * 6.28 + rnd(i + k) * .6, rr = s * (.7 + rnd(i * 3 + k) * .5); p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .75]); } return poly(p.map(function (q) { return [q[0] + s * .25, q[1] + s * .35]; }), FLKD, 0) + poly(p, FLK, 1.1); }

// ── one hair seen close: a cylinder covered in overlapping cuticle scales pointing to the tip.
// from (x1, y1) (root end) to (x2, y2) (tip end), width w. o.flake: a flake stuck on it at u (0..1)
function strand(x1, y1, x2, y2, w, o) {
  o = o || {}; var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI, g = "", id = "st" + (++CL);
  g += '<g transform="translate(' + f(x1) + ' ' + f(y1) + ') rotate(' + f(a) + ')">';
  g += '<rect x="0" y="' + f(w * .62) + '" width="' + f(L) + '" height="' + f(w * .25) + '" fill="' + INK + '" opacity=".12"/>';   // shadow on the paper
  g += '<clipPath id="' + id + '"><rect x="0" y="' + f(-w / 2) + '" width="' + f(L) + '" height="' + f(w) + '"/></clipPath>';
  g += '<rect x="0" y="' + f(-w / 2) + '" width="' + f(L) + '" height="' + f(w) + '" fill="' + HAIRM + '"/>';
  g += '<g clip-path="url(#' + id + ')">';
  g += '<rect x="0" y="' + f(w * .12) + '" width="' + f(L) + '" height="' + f(w * .4) + '" fill="' + HAIR + '"/>';                 // shade side
  var step = w * .55, sh = (now() * 0) % step;
  for (var s = -step; s < L + step; s += step) {   // scales: each an arc open toward the tip, lit on its upper rim
    var j = (rnd(Math.round(s)) - .5) * w * .12;
    g += '<path d="M' + f(s + j) + ' ' + f(-w * .6) + ' Q' + f(s + j + step * 1.05) + ' 0 ' + f(s + j) + ' ' + f(w * .6) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" opacity=".75"/>';
    g += '<path d="M' + f(s + j + 2) + ' ' + f(-w * .45) + ' Q' + f(s + j + step * .75) + ' ' + f(-w * .1) + ' ' + f(s + j + step * .55) + ' ' + f(w * .05) + '" fill="none" stroke="' + HAIRL + '" stroke-width="1.6" opacity=".8"/>';
  }
  g += '<rect x="0" y="' + f(-w * .34) + '" width="' + f(L) + '" height="' + f(w * .08) + '" fill="#b89a84" opacity=".55"/>';          // the long highlight
  g += '</g><rect x="0" y="' + f(-w / 2) + '" width="' + f(L) + '" height="' + f(w) + '" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  g += '</g>';
  if (o.flake) { var u = o.flake; g += flake(x1 + dx * u, y1 + dy * u - w * .2, w / 95, a + 8, { seed: 9, curl: true }); }
  return g;
}

// ── the scalp cut open as a block (v20's way, with volume). x0, y0 = top-left of the cut face; w = width.
// o: {hairs: 0..1 density, irritated: 0..1, flakes: 0..1 lifting from the top, yeast: 0..1 (dots on the surface), oil: 0..1,
//     labels: bool, back: number of hair rows behind, cut: show the follicles in the cut face}
// returns {svg, sc (y of the stratum corneum), epi (y of the epidermis bottom), derm, bottom, fol: [follicle surface x's]}
function scalpBlock(x0, y0, w, o) {
  o = o || {}; var dx = 70, dy = -84, Hs = 12 + 10 * (o.irritated || 0), He = 46, Hd = 250, Hf = 96, g = "", irr = o.irritated || 0;
  var skinTop = mix(SKIN, "#e48d7c", irr * .8), epi = mix(EPI, "#d9705e", irr * .7), der = mix(DER, "#eeb0a2", irr * .6);
  var yS = y0 + Hs, yE = yS + He, yD = yE + Hd, yB = yD + Hf, H = yB - y0;
  var wav = function (y, a, n, ph) { var p = []; for (var i = 0; i <= n; i++) p.push([x0 + w * i / n, y + Math.sin(i * 1.3 + (ph || 0)) * a]); return p; };
  // right side face: the layers carried round the corner, darker (the block's turned side)
  var side = function (ya, yb, col) { return poly([[x0 + w, ya], [x0 + w + dx, ya + dy], [x0 + w + dx, yb + dy], [x0 + w, yb]], col, 0); };
  g += side(y0, yS, mix(SC, INK, .12)) + side(yS, yE, mix(epi, INK, .14)) + side(yE, yD, mix(der, INK, .14)) + side(yD, yB, mix(FAT, INK, .14));
  [yS, yE, yD].forEach(function (y) { g += line([[x0 + w, y], [x0 + w + dx, y + dy]], INK, 1.2, ' opacity=".5"'); });
  g += poly([[x0 + w, y0], [x0 + w + dx, y0 + dy], [x0 + w + dx, yB + dy], [x0 + w, yB]], "none", 2.2);
  // top surface: skin with its fine criss-cross creases (real scalp micro-relief), pores at each hair
  var top = [[x0, y0], [x0 + dx, y0 + dy], [x0 + w + dx, y0 + dy], [x0 + w, y0]];
  g += poly(top, skinTop, 2.2);
  var idT = "tp" + (++CL); g += '<clipPath id="' + idT + '"><path d="M' + top.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z"/></clipPath><g clip-path="url(#' + idT + ')">';
  for (var c = -6; c < 16; c++) { g += line([[x0 + c * 46, y0], [x0 + c * 46 + dx + 40, y0 + dy]], mix(skinTop, INK, .14), 1.1, ' opacity=".7"') + line([[x0 + c * 46, y0], [x0 + c * 46 + dx - 60, y0 + dy]], mix(skinTop, INK, .1), 1, ' opacity=".6"'); }
  if (irr) for (var rr = 0; rr < 9; rr++) g += ell(x0 + 40 + rnd(rr + 3) * (w - 40) + dx * rnd(rr), y0 + dy * rnd(rr + 8), 30 + rnd(rr) * 30, 12, RED, 0, ' opacity="' + f(.22 * irr) + '"');
  g += '</g>';
  // the hairs out of the top, back rows first (each a shaded cylinder from its pore, leaning the same way, swaying a little)
  var rows = o.back == null ? 3 : o.back, cols = 7, fol = [];
  var hairAt = function (u, v, i, len) {
    var px = x0 + u * w + v * dx, py = y0 + v * dy, sw = 4 * Math.sin(now() * 1.6 + i * .9), L = len || (150 + rnd(i) * 60);
    var pts = [[px, py], [px + 14 + sw * .3, py - L * .35], [px + 36 + sw, py - L * .7], [px + 66 + sw * 1.6, py - L]];
    return ell(px, py + 1, 7, 3, mix(skinTop, INK, .45), 0) + hairPath(pts, 6.5, o.white ? "#e9e2d4" : HAIR);
  };
  for (var v = rows; v >= 1; v--) for (var i = 0; i < cols; i++) { var u = (i + .5 + (v % 2) * .35) / cols; if (u > .97) continue; g += hairAt(u, (v - .35) / (rows + .2), i * 7 + v); }
  // oil on the surface (sebum): a sheen of small droplets near the pores
  if (o.oil) for (var q = 0; q < 10; q++) { var uq = rnd(q + 40), vq = .15 + rnd(q + 60) * .7; g += G2(oil(x0 + uq * w + vq * dx, y0 + vq * dy - 4, 4.5), o.oil); }
  // yeast on the surface: tiny olive dots (shown big only in the magnified circle)
  if (o.yeast) for (var yq = 0; yq < 26; yq++) { var uy = rnd(yq + 90), vy = .08 + rnd(yq + 120) * .85; g += G2(ball(x0 + uy * w + vy * dx, y0 + vy * dy - 2, 3.2, YE, YED, YEL, 1, false), o.yeast); }
  // the cut face ──
  g += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(H) + '" fill="' + der + '"/>';
  // fat: packed rounded cells, each shaded (the adipose layer under the scalp)
  var idF = "ft" + (++CL); g += '<clipPath id="' + idF + '"><rect x="' + f(x0) + '" y="' + f(yD) + '" width="' + f(w) + '" height="' + f(Hf) + '"/></clipPath><g clip-path="url(#' + idF + ')"><rect x="' + f(x0) + '" y="' + f(yD) + '" width="' + f(w) + '" height="' + f(Hf) + '" fill="' + FATD + '"/>';
  for (var fr = 0; fr < 3; fr++) for (var fc = 0; fc < 13; fc++) { var fx = x0 + fc * 46 + (fr % 2) * 23 + (rnd(fr * 9 + fc) - .5) * 8, fy = yD + 18 + fr * 36, fr2 = 22 + rnd(fc + fr * 5) * 4; g += ell(fx, fy, fr2, fr2 * .82, FAT, 1.4, ' stroke="' + FATD + '"') + ell(fx - 6, fy - 6, 7, 4, FATL, 0); }
  g += '</g>';
  // dermis: faint wavy collagen fibres, a blood vessel with capillary loops up to the epidermis
  for (var fl = 0; fl < 8; fl++) g += line(wav(yE + 30 + fl * 28, 4, 9, fl), FIB, 1.6, ' opacity=".9"');
  var vy0 = yD - 26, vessel = wav(vy0, 5, 10, 1);
  g += line(vessel, INK, 12) + line(vessel, mix(VES, RED, irr), 9.5) + line(vessel.map(function (p) { return [p[0], p[1] - 2]; }), VESL, 2.4, ' stroke-dasharray="14 18" stroke-dashoffset="' + f(-now() * 40) + '"');
  for (var cp = 0; cp < 6; cp++) { var cx = x0 + 50 + cp * (w - 80) / 5, cw = 1 + irr * 1.6; g += line([[cx - 10, yE + 46], [cx - 6, yE + 10], [cx + 6, yE + 10], [cx + 10, yE + 46]], mix(VES, RED, irr), 2 * cw, ' opacity=".75"'); }
  // follicles on the cut face (the front row of hairs, cut lengthwise)
  if (o.cut !== false) [.2, .52, .84].forEach(function (u, k) { var fx = x0 + u * w; fol.push(fx); g += follicle(fx, y0, yD - 8 - y0, { i: k, white: o.white, skinTop: skinTop }); });
  // living epidermis: rows of round cells with nuclei (basal cells tall at the bottom, flatter going up)
  var idE = "ep" + (++CL); g += '<clipPath id="' + idE + '"><rect x="' + f(x0) + '" y="' + f(yS) + '" width="' + f(w) + '" height="' + f(He) + '"/></clipPath><g clip-path="url(#' + idE + ')">';
  g += '<rect x="' + f(x0) + '" y="' + f(yS) + '" width="' + f(w) + '" height="' + f(He) + '" fill="' + mix(epi, INK, .12) + '"/>';
  for (var er = 0; er < 3; er++) { var ch = [16, 14, 11][er], cy = yE - 9 - er * 15, cww = [15, 19, 24][er]; for (var ec = -1; ec < w / cww + 1; ec++) { var ex = x0 + ec * cww + (er % 2) * cww / 2; if (fol.some(function (fx) { return Math.abs(fx - ex) < 16; })) continue; g += ell(ex, cy, cww * .47, ch * .5, epi, 1.1, ' stroke="' + mix(epi, INK, .35) + '"') + ell(ex - 1, cy - ch * .18, cww * .2, ch * .14, mix(epi, "#ffffff", .3), 0) + circ(ex + 1, cy + 1, 2.6, NUC, 0); } }
  g += '</g>';
  // stratum corneum: thin flat dead cells stacked like bricks (thicker and lifting when irritated)
  var idS = "sc" + (++CL); g += '<clipPath id="' + idS + '"><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(Hs + 1) + '"/></clipPath><g clip-path="url(#' + idS + ')"><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(Hs) + '" fill="' + SCD + '"/>';
  for (var sr = 0; sr * 5 < Hs; sr++) for (var scc = -1; scc < w / 30 + 1; scc++) { var sx = x0 + scc * 30 + (sr % 2) * 15; g += '<rect x="' + f(sx + 1) + '" y="' + f(y0 + sr * 5 + .6) + '" width="28" height="4" rx="2" fill="' + SC + '"/>'; }
  g += '</g>';
  [yS, yE, yD].forEach(function (y, k) { g += line(wav(y, k === 1 ? 2.5 : 1.5, 16, k), INK, 1.3, ' opacity=".55"'); });
  g += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(H) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  // the front-row hairs out of the cut edge's top (they belong to the follicles)
  fol.forEach(function (fx, k) { var sw = 4 * Math.sin(now() * 1.6 + k * 2.1), L = 170 + k * 18; g += hairPath([[fx, y0 + 2], [fx + 14 + sw * .3, y0 - L * .35], [fx + 36 + sw, y0 - L * .7], [fx + 66 + sw * 1.6, y0 - L]], 7, o.white ? "#e9e2d4" : HAIR); });
  // flakes lifting off the top (dandruff): k 0..1
  if (o.flakes) for (var fk = 0; fk < 7; fk++) { var uf = .08 + fk * .13, vf = .2 + rnd(fk + 5) * .6, lift = o.flakes * (14 + rnd(fk) * 22) + 3 * Math.sin(now() * 1.4 + fk); g += flake(x0 + uf * w + vf * dx, y0 + vf * dy - lift, .2 + rnd(fk + 2) * .1, rnd(fk) * 60 - 30, { seed: fk, cells: true }); }
  if (o.labels) {
    g += tag(x0 + w * .7, y0 + Hs * .5, "طبقة الجلد الميت", INK, 1, 16);
    g += tag(x0 + w * .52 + 26, yE + 70, "غدة دهنية", OLIVE, 1, 16);
    g += tag(x0 + w * .84 - 2, yD - 30, "البُصيلة", ORANGE, -1, 16);
  }
  return { svg: g, sc: yS, epi: yE, derm: yD, bottom: yB, fol: fol, dx: dx, dy: dy };
}
function G2(s, k) { return k >= 1 ? s : '<g opacity="' + f(clamp(k)) + '">' + s + '</g>'; }
// one follicle on the cut face: the root sheath going down at a slant, the shaft inside, a multi-lobed sebaceous gland with its
// duct into the follicle (grape-like lobules, after the histology), the bulb with melanin and its papilla
function follicle(x, y0, depth, o) {
  o = o || {}; var tilt = -.16, g = "", ax = function (t) { return [x + tilt * depth * t * -1 * -1 - tilt * depth * t * 2, y0 + depth * t]; };
  ax = function (t) { return [x + .16 * depth * t * -1, y0 + depth * t]; };
  var Lp = [], Rp = []; for (var t = 0; t <= 1.0001; t += .1) { var p = ax(t), ww = 13 + (t > .82 ? (t - .82) * 70 : 0); Lp.push([p[0] - ww, p[1]]); Rp.push([p[0] + ww, p[1]]); }
  g += '<path d="' + P(Lp) + ' L' + P(Rp.reverse()).slice(1) + ' Z" fill="' + SHEATH + '" stroke="' + INK + '" stroke-width="1.7" stroke-linejoin="round"/>';
  // the sheath's shade side
  g += line(Lp.slice(0, 9).map(function (p) { return [p[0] + 4, p[1]]; }), mix(SHEATH, INK, .18), 4, ' opacity=".7"');
  // the gland: 4 lobules on the side, each shaded, joined by a duct
  var gp = ax(.2), lob = [[24, -6, 12], [40, 6, 13], [30, 22, 12], [50, 24, 10]], gl = "";
  lob.forEach(function (l) { gl += ball(gp[0] + l[0], gp[1] + l[1], l[2], GLAND, GLANDD, GLANDL, 1.5, false); });
  g += line([[gp[0] + 10, gp[1] + 2], [gp[0] + 22, gp[1] + 4]], GLANDD, 6) + gl;
  // oil running up the duct into the follicle and out (small droplets)
  for (var d = 0; d < 3; d++) { var uu = (now() * .35 + d / 3 + (o.i || 0) * .17) % 1, q = ax(.2 * (1 - uu)); g += circ(q[0] + 8 * (1 - uu) + 2, q[1], 3, OIL, 1); }
  // the bulb and papilla
  var b = ax(1), bw = 24, bh = 30;
  g += shape([[b[0] - bw, b[1] - bh * .2], [b[0] - bw * .9, b[1] - bh * .8], [b[0] - 6, b[1] - bh * 1.25], [b[0] + 6, b[1] - bh * 1.25], [b[0] + bw * .9, b[1] - bh * .8], [b[0] + bw, b[1] - bh * .2], [b[0] + bw * .7, b[1] + 6], [b[0] + 8, b[1] + 2], [b[0], b[1] - 6], [b[0] - 8, b[1] + 2], [b[0] - bw * .7, b[1] + 6]], o.white ? "#e9dfcf" : "#4a2c1c", 1.8);
  g += ell(b[0] + 8, b[1] - bh * .4, 8, 12, "#2a170e", 0, ' opacity=".5"') + ell(b[0] - 9, b[1] - bh * .75, 5, 3, "#7a5238", 0);
  g += shape([[b[0] - 9, b[1] + 3], [b[0] - 7, b[1] - 8], [b[0], b[1] - 13], [b[0] + 7, b[1] - 8], [b[0] + 9, b[1] + 3]], "#c8705f", 1.4) + line([[b[0], b[1] + 3], [b[0], b[1] + 18]], VES, 2.2);
  // the shaft inside the sheath
  var top = ax(0), end = [b[0], b[1] - 30];
  g += hairPath([end, ax(.5), top], 7, o.white ? "#e9e2d4" : HAIR);
  return g;
}

// ── the epidermis up close: rows of cells rising from the basal layer to the top. x0, y0, w, h: the window.
// o.phase: how far the rows have moved (in rows; the page drives it with time × speed). o.fast: irritated (clumps, ×2)
// o.n: rows visible. Cells change shape going up: tall round with nucleus → polygonal → flat with granules → flat dead brick.
function epiStack(x0, y0, w, h, o) {
  o = o || {}; var g = "", n = o.n || 9, rowH = h / n, ph = o.phase || 0, frac = ph - Math.floor(ph), base = Math.floor(ph), id = "es" + (++CL), irr = o.fast ? 1 : 0;
  g += '<clipPath id="' + id + '"><rect x="' + f(x0) + '" y="' + f(y0 - 260) + '" width="' + f(w) + '" height="' + f(h + 260) + '"/></clipPath>';
  g += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + mix("#e9b7a3", "#e0907e", irr * .5) + '"/>';
  g += '<g clip-path="url(#' + id + ')">';
  // dermis strip below with a vessel
  for (var r = -1; r <= n + 1; r++) {
    var rowId = base + r, y = y0 + h - (r + frac + .5) * rowH, hk = clamp((y0 + h - y) / h);   // 0 at the bottom, 1 at the top
    if (y > y0 + h + rowH) continue;
    var cw = lerp(40, 66, hk), chh = lerp(rowH * .95, rowH * .55, hk), off = (rowId % 2) * cw * .5, top = y < y0 + rowH * 1.2;
    var col = hk < .25 ? "#e7a593" : hk < .55 ? "#eab09c" : hk < .78 ? "#efc0aa" : SC;
    col = mix(col, "#e48d7c", irr * .35 * (1 - hk));
    for (var c = -1; c < w / cw + 1; c++) {
      var cx = x0 + c * cw + off + (rnd(rowId * 31 + c) - .5) * 4, cy = y, sx = 0, sy = 0, rot = 0, op = 1;
      // at the top: shedding. normal: each cell flakes off alone, tiny. fast: the top rows go together, a clump
      if (y < y0 + rowH * .9) {
        var lift = (y0 + rowH * .9 - y) / rowH;   // 0.. as it passes the top
        if (!o.fast) { var ci = rnd(rowId * 17 + c); sx = (ci - .5) * 30 * lift + 10 * lift; sy = -lift * (30 + ci * 40); rot = (ci - .5) * 80 * lift; op = clamp(1 - lift * .55); }
        else { var yy = y0 - 26 - (y0 + rowH * .9 - y) * .3 - 5 * Math.sin(now() * 1.3); sy = yy - y; sx = 16 + (y0 - y) * .04; }   // the top rows rise as one stuck sheet (a flake)
      }
      var rx = cw * .47, ry = chh * .47;
      var t = 'translate(' + f(cx + sx) + ' ' + f(cy + sy) + ') rotate(' + f(rot) + ')';
      var cell = hk < .8 ? ell(0, 0, rx, ry, col, 1.3) : '<rect x="' + f(-rx) + '" y="' + f(-ry * .6) + '" width="' + f(rx * 2) + '" height="' + f(ry * 1.2) + '" rx="' + f(ry * .5) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.3"/>';
      var shade = hk < .8 ? ell(rx * .12, ry * .25, rx * .9, ry * .7, mix(col, INK, .16), 0) : '<rect x="' + f(-rx + 2) + '" y="' + f(ry * .1) + '" width="' + f(rx * 2 - 4) + '" height="' + f(ry * .45) + '" rx="2" fill="' + mix(col, INK, .12) + '"/>';
      var light = hk < .8 ? ell(-rx * .3, -ry * .35, rx * .35, ry * .2, mix(col, "#ffffff", .45), 0) : '<rect x="' + f(-rx * .7) + '" y="' + f(-ry * .45) + '" width="' + f(rx * .9) + '" height="' + f(ry * .2) + '" rx="1" fill="#ffffff" opacity=".5"/>';
      var nuc = hk < .55 ? ell(0, 0, rx * .3 * (1 - hk), ry * .32 * (1 - hk), NUC, 1, ' stroke="' + mix(NUC, INK, .4) + '"') : hk < .78 ? circ(-rx * .3, 0, 1.6, "#5a3a2a", 0) + circ(rx * .2, ry * .1, 1.6, "#5a3a2a", 0) + circ(0, -ry * .2, 1.4, "#5a3a2a", 0) : "";
      g += G2('<g transform="' + t + '">' + cell + shade + light + nuc + '</g>', op);
    }
  }
  g += '</g>';
  // the dermis below and the frame
  g += '<rect x="' + f(x0) + '" y="' + f(y0 + h) + '" width="' + f(w) + '" height="40" fill="' + DER + '" stroke="' + INK + '" stroke-width="2"/>' + line([[x0 + 4, y0 + h + 22], [x0 + w - 4, y0 + h + 20]], VES, 7) + line([[x0 + 4, y0 + h + 21], [x0 + w - 4, y0 + h + 19]], VESL, 2, ' stroke-dasharray="12 16" stroke-dashoffset="' + f(-now() * 40) + '"');
  g += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h + 40) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  return g;
}

// ── a shampoo bottle, three-quarter, cylinder shading; label text lines; flip-top cap. (x, y) bottom centre, s scale
function bottle(x, y, s, col, lbl) {
  s = s || 1; col = col || "#4f8a7a"; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')">';
  g += ell(8, 2, 70, 12, INK, 0, ' opacity=".14"');
  var body = [[-52, 0], [-56, -60], [-56, -200], [-48, -236], [-26, -252], [26, -252], [48, -236], [56, -200], [56, -60], [52, 0]];
  g += shape(body, col, 2.4);
  g += '<path d="M24 -248 Q50 -232 54 -200 L54 -60 Q52 -10 48 -2 L22 -2 Z" fill="' + mix(col, INK, .25) + '"/>' + '<rect x="-40" y="-226" width="11" height="200" rx="5" fill="#ffffff" opacity=".35"/>';
  g += shape([[-26, -252], [-24, -282], [24, -282], [26, -252]], "#f2efe6", 2.2) + '<rect x="6" y="-280" width="16" height="26" fill="#d8d2c2"/>' + shape([[-24, -282], [-20, -296], [20, -296], [24, -282]], "#e4dfd2", 2);
  g += '<rect x="-44" y="-176" width="88" height="96" rx="6" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/>';
  g += '<text x="0" y="-146" text-anchor="middle" style="font:800 15px \'Noto Sans Arabic\';fill:' + INK + '">' + (lbl || "ضد القشرة") + '</text>';
  g += '<rect x="-32" y="-128" width="64" height="5" rx="2" fill="#cfc6b2"/><rect x="-32" y="-116" width="50" height="5" rx="2" fill="#cfc6b2"/><rect x="-32" y="-104" width="58" height="5" rx="2" fill="#cfc6b2"/>';
  return g + '</g>';
}
// a timer dial: k 0..1 of the arc from 3 to 5 minutes highlighted, the hand at m minutes (0..5)
function timer(x, y, r, m, hi) {
  var g = ball(x, y, r + 10, "#e4dfd2", "#b9b2a0", "#ffffff", 2.4) + circ(x, y, r, "#fbf8f1", 2);
  if (hi) { var a0 = -90 + 3 / 6 * 360, a1 = -90 + 5 / 6 * 360, R0 = r * .78; g += '<path d="M' + f(x + Math.cos(a0 * Math.PI / 180) * R0) + ' ' + f(y + Math.sin(a0 * Math.PI / 180) * R0) + ' A' + f(R0) + ' ' + f(R0) + ' 0 0 1 ' + f(x + Math.cos(a1 * Math.PI / 180) * R0) + ' ' + f(y + Math.sin(a1 * Math.PI / 180) * R0) + '" stroke="' + ORANGE + '" stroke-width="' + f(r * .2) + '" fill="none" opacity="' + f(hi) + '"/>'; }
  for (var i = 0; i < 6; i++) { var a = (-90 + i * 60) * Math.PI / 180; g += line([[x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9], [x + Math.cos(a) * r * .98, y + Math.sin(a) * r * .98]], INK, 3) + '<text x="' + f(x + Math.cos(a) * r * .62) + '" y="' + f(y + Math.sin(a) * r * .62 + 7) + '" text-anchor="middle" style="font:800 ' + f(r * .22) + 'px \'Noto Sans Arabic\';fill:' + INK + '">' + i + '</text>'; }
  var ha = (-90 + (m || 0) / 6 * 360) * Math.PI / 180; g += line([[x, y], [x + Math.cos(ha) * r * .8, y + Math.sin(ha) * r * .8]], ORANGE, 5) + circ(x, y, 6, INK, 0);
  return g + shape([[x - 12, y - r - 10], [x - 10, y - r - 26], [x + 10, y - r - 26], [x + 12, y - r - 10]], "#d8d2c2", 2);
}
// an oil bottle (the hair oil people rub in): glass, golden oil inside, cork
function oilBottle(x, y, s) {
  var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s || 1) + ')">' + ell(6, 2, 50, 9, INK, 0, ' opacity=".14"');
  g += shape([[-40, 0], [-44, -110], [-34, -140], [-14, -156], [-14, -196], [14, -196], [14, -156], [34, -140], [44, -110], [40, 0]], "#f4efe2", 2.4);
  g += shape([[-38, -4], [-41, -96], [41, -96], [38, -4]], OIL, 1.6) + '<path d="M16 -94 L39 -94 L36 -6 L14 -6 Z" fill="' + OILD + '" opacity=".5"/>' + '<rect x="-30" y="-150" width="8" height="140" rx="4" fill="#ffffff" opacity=".6"/>';
  g += '<rect x="-16" y="-216" width="32" height="22" rx="4" fill="#b98a5a" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-48" text-anchor="middle" style="font:800 18px \'Noto Sans Arabic\';fill:' + INK + '">زيت</text>';
  return g + '</g>';
}
// a magnifier circle: ring with a handle (the reference's «up close» lens) around a clipped drawing
function lens(cx, cy, r, inner, handleA) {
  var id = "ln" + (++CL), a = (handleA == null ? 45 : handleA) * Math.PI / 180, hx = cx + Math.cos(a) * r, hy = cy + Math.sin(a) * r;
  return line([[hx + Math.cos(a) * 8, hy + Math.sin(a) * 8], [hx + Math.cos(a) * 90, hy + Math.sin(a) * 90]], INK, 22) + line([[hx + Math.cos(a) * 8, hy + Math.sin(a) * 8], [hx + Math.cos(a) * 90, hy + Math.sin(a) * 90]], "#6b4a33", 16) +
    '<clipPath id="' + id + '"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"/></clipPath>' + circ(cx, cy, r, "#f6eadf", 0) + '<g clip-path="url(#' + id + ')">' + inner + '</g>' +
    circ(cx, cy, r, "none", 0, ' stroke="#3a3d44" stroke-width="14"') + circ(cx, cy, r + 7, "none", 2.2) + circ(cx, cy, r - 7, "none", 1.6) + '<path d="M' + f(cx - r * .7) + ' ' + f(cy - r * .35) + ' A' + f(r * .8) + ' ' + f(r * .8) + ' 0 0 1 ' + f(cx - r * .2) + ' ' + f(cy - r * .78) + '" stroke="#ffffff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>';
}
// the magnified scalp surface (what the lens shows): skin with creases, hair shafts coming out of pores, oil, yeast
function surface(cx, cy, r, o) {
  o = o || {}; var g = '<rect x="' + f(cx - r) + '" y="' + f(cy - r) + '" width="' + f(2 * r) + '" height="' + f(2 * r) + '" fill="' + mix(SKIN, "#e48d7c", (o.irritated || 0) * .8) + '"/>';
  for (var c = -6; c < 7; c++) g += line([[cx + c * 44 - r, cy + r], [cx + c * 44 + r * .4, cy - r]], SKIND, 1.4, ' opacity=".6"') + line([[cx + c * 52 - r * .4, cy - r], [cx + c * 52 + r * .6, cy + r]], SKIND, 1.2, ' opacity=".45"');
  if (o.irritated) for (var rr = 0; rr < 6; rr++) g += ell(cx + (rnd(rr) - .5) * r * 1.6, cy + (rnd(rr + 4) - .5) * r * 1.6, 40, 26, RED, 0, ' opacity="' + f(.25 * o.irritated) + '"');
  var pores = [[-.55, -.35], [.1, -.6], [.6, -.2], [-.2, .2], [.45, .45], [-.6, .55], [.05, .75]];
  pores.forEach(function (p, i) { var px = cx + p[0] * r, py = cy + p[1] * r, sw = 3 * Math.sin(now() * 1.5 + i); g += ell(px, py + 2, 12, 6, mix(SKIN, INK, .5), 0) + hairPath([[px, py], [px + 30 + sw, py - 70], [px + 80 + sw * 2, py - 150]], 13, HAIR); });
  if (o.oil) pores.forEach(function (p, i) { g += G2(oil(cx + p[0] * r - 26, cy + p[1] * r + 14, 9 + rnd(i) * 4), o.oil); });
  if (o.yeast) { var ys = [[-.3, -.05], [.3, .1], [-.05, .45], [.65, .2], [-.7, .15], [.2, -.3], [-.35, .75]]; ys.forEach(function (p, i) { g += G2(yeast(cx + p[0] * r, cy + p[1] * r, 15 + rnd(i) * 5, rnd(i + 3) * 300, { bud: .4 + rnd(i) * .6 }), o.yeast); }); }
  if (o.bits) for (var b = 0; b < 7; b++) g += bits(cx + (rnd(b + 20) - .5) * r * 1.5, cy + (rnd(b + 30) - .5) * r * 1.5, 4, 16, b * 5, o.bits);
  if (o.flakes) for (var fk = 0; fk < 4; fk++) g += flake(cx + (rnd(fk + 50) - .5) * r * 1.3, cy + (rnd(fk + 60) - .5) * r * 1.3, .35, rnd(fk) * 90, { seed: fk + 2 });
  return g;
}
return { yeast: yeast, oil: oil, bits: bits, flake: flake, speck: speck, strand: strand, scalpBlock: scalpBlock, follicle: follicle, epiStack: epiStack,
  bottle: bottle, timer: timer, oilBottle: oilBottle, lens: lens, surface: surface, ball: ball, hairPath: hairPath, tag: tag, line: line, shape: shape, poly: poly, circ: circ, ell: ell, mix: mix, rnd: rnd,
  C: { INK: INK, ORANGE: ORANGE, BLUE: BLUE, OLIVE: OLIVE, PAPER: PAPER, SKIN: SKIN, HAIR: HAIR, RED: RED, YE: YE, OIL: OIL, FLK: FLK, FLKD: FLKD } };
})();
