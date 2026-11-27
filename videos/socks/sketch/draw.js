/* «الشراب والنوم» — the episode's own drawings (sketch style). Self-contained SVG builders used by shots.js.
   The skin is cut open the way «طب إزاي؟» v20 cuts it (a block: epidermis, dermis, fat as circles, a red vessel), with the
   real thermoregulation anatomy of the hands and feet: a deep artery and vein, and an arteriovenous anastomosis (AVA)
   loop that rises under the skin and opens (vasodilation) or closes (vasoconstriction). Sources in ../refs/SOURCES.md.
   People come from the shared person kit (videos/_templates/people/person.js). Panel units: 640 × 786. */
var SK = (function () {
var INK = "#2a2016", ORANGE = "#bd552f", BLUE = "#4a6f8a", OLIVE = "#5e653a", PAPER = "#eee5d0";
var EPI = "#d9907d", DER = "#efc4b4", DERD = "#e2ad9c", FAT = "#ece2bd", FATL = "#d8cb9c", ART = "#b8463a", VEIN = "#5d5f86",
    WOOD = "#a9784d", WOODD = "#7c5434", SHEET = "#f3efe6", SHEETD = "#ddd6c6", BLANK = "#8fa6a0", BLANKD = "#6f8882", PILLOW = "#f6f2ea",
    SOCK = "#a8453a", SOCKD = "#86342b", SOCKL = "#c46552", SKIN = "#e0a98a", SKIND = "#c07f62", COLD = "#7fa3bd";
var PJ = { shirt: "#9db3c4", shirtD: "#7d95a8", pants: "#7d95a8", pantsD: "#647b8e", socks: SOCK };   // pyjamas
function f(n) { return (+n).toFixed(1); }
function P(pts, close) { var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]); for (var i = 1; i < pts.length; i++) { var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; d += " Q" + f(pts[i - 1][0]) + " " + f(pts[i - 1][1]) + " " + f(m[0]) + " " + f(m[1]); } var L = pts[pts.length - 1]; return d + (close ? " Q" + f(L[0]) + " " + f(L[1]) + " " + f(pts[0][0]) + " " + f(pts[0][1]) + " Z" : " L" + f(L[0]) + " " + f(L[1])); }
function line(pts, col, w, ex) { return '<path d="' + P(pts) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; }
function shape(pts, fill, sw, ex) { return '<path d="' + P(pts, true) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
function rect(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
function now() { return (typeof window !== "undefined" && window.__t) || 0; }
function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
var CN = 0;

// heat leaving a surface: orange squiggles that rise from (x, y) and fade, all the time. n squiggles over a width w; dir = angle (deg, 0 = up)
function heat(x, y, w, n, op, sz, dir) {
  if (!op || op <= 0) return ""; sz = sz || 1; var t = now(), s = "", a = (dir || 0) * Math.PI / 180;
  for (var i = 0; i < n; i++) {
    var u = (t * .55 + i / n * 1.7 + rnd(i) * .5) % 1, ox = (n > 1 ? -w / 2 + w * i / (n - 1) : 0) + (rnd(i + 9) - .5) * 10, d = u * 90 * sz;
    var bx = x + ox * Math.cos(a) + d * Math.sin(a), by = y + ox * Math.sin(a) - d * Math.cos(a);
    s += '<g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(dir || 0) + ') scale(' + f(sz) + ')" opacity="' + f(op * Math.sin(u * Math.PI)) + '"><path d="M0 0 q7 -9 0 -18 t0 -18" stroke="' + ORANGE + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
  }
  return s;
}
// cold: small blue "frost" ticks drifting round a point
function cold(x, y, r, op) {
  if (!op || op <= 0) return ""; var t = now(), s = "";
  for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + t * .3, rr = r * (1 + .08 * Math.sin(t * 1.7 + i)), cx = x + Math.cos(a) * rr, cy = y + Math.sin(a) * rr * .7;
    s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ')" opacity="' + f(op) + '">' + [0, 60, 120].map(function (q) { return '<path d="M0 -9 V9" transform="rotate(' + q + ')" stroke="' + BLUE + '" stroke-width="2.6" stroke-linecap="round"/>'; }).join("") + '</g>'; }
  return s;
}

// ── the bed, seen from the side: footboard left, headboard right. top = the mattress top. Returns {svg, floor} ──
function bed(x0, top, w, s) {
  var fl = top + 96 * s, g = "";
  g += rect(x0 + 6 * s, top + 52 * s, w - 12 * s, 22 * s, WOOD, 2);                           // the frame
  g += rect(x0 + 16 * s, top + 74 * s, 14 * s, fl - top - 74 * s, WOODD, 1.8) + rect(x0 + w - 30 * s, top + 74 * s, 14 * s, fl - top - 74 * s, WOODD, 1.8);   // legs
  g += rect(x0 + w - 16 * s, top - 120 * s, 22 * s, fl - top + 120 * s, WOOD, 2.2, 6);      // headboard
  g += rect(x0 - 8 * s, top - 26 * s, 20 * s, fl - top + 26 * s, WOOD, 2.2, 6);              // footboard
  g += rect(x0 + 10 * s, top, w - 26 * s, 52 * s, SHEET, 2.2, 10 * s);                       // mattress
  g += line([[x0 + 22 * s, top + 26 * s], [x0 + w - 28 * s, top + 26 * s]], SHEETD, 1.4);
  return { svg: g, floor: fl };
}
// the sleeper on his back, head on the pillow at the right; o.socks: true (red wool socks) or false (bare feet);
// o.eyes, o.mouth, o.cover (draw the blanket, default true). Returns {svg, head, feet: [x, y] of the near foot's sole}
function sleeper(hx, top, s, o) {
  o = o || {}; var t = now(), br = (Math.sin(t * 1.5) + 1) / 2;
  var outfit = { base: "home", feet: o.socks === false ? "bare" : "socks", colors: Object.assign({}, PJ, o.sockCol ? { socks: o.sockCol } : {}) };
  var Pp = PERSON.side({ x: hx, y: top - 29 * s, s: s, dir: -1, rot: 90, outfit: outfit, breath: br, head: { tilt: 0 },
    legs: [{ hip: 0, knee: 4, ankle: -14 }, { hip: 2, knee: 6, ankle: -10 }], arms: [{ sh: 4, el: 10 }, { sh: -2, el: 8 }],
    face: { eyes: o.eyes == null ? 0 : o.eyes, brows: o.brows || "neutral", mouth: o.mouth || "neutral" } });
  var J = Pp.joints, hd = J.head;
  var g = '<ellipse cx="' + f(hd[0] + 6 * s) + '" cy="' + f(top - 10 * s) + '" rx="' + f(52 * s) + '" ry="' + f(17 * s) + '" fill="' + PILLOW + '" stroke="' + INK + '" stroke-width="2"/>' + Pp.svg;
  if (o.cover !== false) {   // the blanket: from the ankles to the chest, hanging over the near side of the mattress
    var xl = J.ankle[0] + 16 * s, xr = hd[0] - 46 * s, b = br * 3 * s;
    g += '<path d="' + P([[xl, top + 58 * s], [xl - 4 * s, top - 6 * s], [xl + 4 * s, top - 30 * s], [xl + 60 * s, top - 34 * s], [(xl + xr) / 2, top - 38 * s], [xr - 70 * s, top - 50 * s - b], [xr - 10 * s, top - 54 * s - b], [xr + 4 * s, top - 30 * s], [xr, top + 58 * s]], false) + ' Z" fill="' + BLANK + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      line([[xr - 14 * s, top - 46 * s - b], [xr - 4 * s, top + 50 * s]], BLANKD, 6) + line([[xl + 90 * s, top - 30 * s], [xl + 110 * s, top + 40 * s]], BLANKD, 1.6) + line([[(xl + xr) / 2 + 40 * s, top - 36 * s], [(xl + xr) / 2 + 30 * s, top + 40 * s]], BLANKD, 1.6);
  }
  return { svg: g, head: hd, foot: J.toe, heel: J.heel, ankle: J.ankle, J: J };
}

// ── the foot close-up, in profile: toes to the right, the shin going up out of frame. (cx, cy) = the ankle; s scale.
// o.sock 0..1 (the sock slides on from the toes), o.tight: a tight elastic cuff biting the ankle, o.tint: "cold" | "warm" | null,
// o.vessels 0..1 open (a cut-away window: the artery down the shin and AVA loops along the sole, wide when open) ──
var FOOT = [[-50, -330], [-46, -170], [-52, -60], [-70, -10], [-84, 40], [-74, 84], [-40, 100], [40, 100], [140, 104], [200, 104], [250, 104], [276, 94], [282, 72], [266, 54], [236, 48], [210, 40], [140, 16], [80, -14], [50, -50], [44, -170], [50, -330]];
function footPath(cx, cy, s) { return P(FOOT.map(function (p) { return [cx + p[0] * s, cy + p[1] * s]; }), true); }
function foot(cx, cy, s, o) {
  o = o || {}; var g = "", id = "ft" + (++CN), d = footPath(cx, cy, s), X = function (x) { return cx + x * s; }, Y = function (y) { return cy + y * s; };
  var fill = o.tint === "cold" ? "#d9b3a6" : o.tint === "warm" ? "#eca286" : SKIN;
  g += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + fill + '"/>';
  g += '<g clip-path="url(#' + id + ')">' + line([[X(-60), Y(70)], [X(60), Y(92)], [X(250), Y(90)]], SKIND, 10 * s, ' opacity=".5"') + '</g>';   // shade along the sole
  if (o.tint === "cold") g += '<path d="' + d + '" fill="' + COLD + '" opacity=".28"/>';
  if (o.tint === "warm") g += '<path d="' + d + '" fill="' + ORANGE + '" opacity=".12"/>';
  if (o.vessels != null) {   // the cut-away window into the foot
    var k = cl(o.vessels), t = now();
    g += '<g clip-path="url(#' + id + ')">';
    var art = [[X(10), Y(-330)], [X(12), Y(-120)], [X(30), Y(-10)], [X(120), Y(40)], [X(240), Y(66)]], vein = [[X(-20), Y(-330)], [X(-22), Y(-120)], [X(-6), Y(0)], [X(110), Y(62)], [X(230), Y(80)]];
    g += line(vein, INK, 15 * s) + line(vein, VEIN, 11 * s) + line(art, INK, 15 * s) + line(art, ART, 11 * s);
    [60, 130, 190].forEach(function (x, i) {   // AVA loops just under the sole: wide and lit when open
      var w = (3 + 9 * k) * s, y0 = Y(30 + x * .2), y1 = Y(90);
      g += line([[X(x), y0], [X(x), y1], [X(x + 26), y1], [X(x + 26), y0 + 14 * s]], INK, w + 4 * s) + line([[X(x), y0], [X(x), y1], [X(x + 26), y1], [X(x + 26), y0 + 14 * s]], k > .5 ? ART : "#9a6a62", w);
      if (k > .3) for (var q = 0; q < 3; q++) { var u = (t * .9 + q / 3 + i * .2) % 1; g += '<circle cx="' + f(X(x) + (u < .4 ? 0 : u < .7 ? (u - .4) / .3 * 26 * s : 26 * s)) + '" cy="' + f(u < .4 ? y0 + (y1 - y0) * u / .4 : u < .7 ? y1 : y1 - (y1 - y0 - 14 * s) * (u - .7) / .3) + '" r="' + f(2.6 * s * k) + '" fill="#f6d6c6"/>'; }
    });
    g += '</g>';
  }
  if (o.sock > 0) {   // the sock: same outline, from the toes back and up to a ribbed cuff
    var sk = cl(o.sock), cuff = o.tight ? -120 : -150, sid = "sk" + (++CN), leftX = X(290 - sk * 420), sock = "";
    sock += '<path d="' + d + '" fill="' + SOCK + '"/>';
    for (var r = -40; r < 60; r += 12) sock += line([[X(r), Y(cuff)], [X(r - 2), Y(-40)]], SOCKD, 2.2 * s);          // ribs up the leg
    sock += '<path d="' + P([[X(-84), Y(30)], [X(-60), Y(10)], [X(-20), Y(40)], [X(-24), Y(100)], [X(-84), Y(100)]], true) + '" fill="' + SOCKD + '"/>';   // heel patch
    sock += '<path d="' + P([[X(230), Y(30)], [X(200), Y(60)], [X(214), Y(108)], [X(290), Y(108)], [X(290), Y(30)]], true) + '" fill="' + SOCKD + '"/>';   // toe patch
    for (var q2 = 0; q2 < 7; q2++) sock += line([[X(70 + q2 * 22), Y(20 + q2 * 5)], [X(64 + q2 * 22), Y(98)]], SOCKL, 1.2 * s, ' opacity=".6"');   // knit
    sock += rect(X(-60), Y(cuff), 120 * s, (o.tight ? 18 : 30) * s, o.tight ? "#5a2620" : SOCKL, 0);
    g += '<clipPath id="' + sid + '"><rect x="' + f(leftX) + '" y="' + f(Y(cuff)) + '" width="' + f(X(300) - leftX) + '" height="' + f(500 * s) + '"/></clipPath><g clip-path="url(#' + id + ')"><g clip-path="url(#' + sid + ')">' + sock + '</g></g>';
    if (sk > .02 && sk < .98) g += line([[leftX, Y(cuff)], [leftX, Y(110)]], SOCKD, 4 * s);
    if (sk >= .98) g += line([[X(-56), Y(cuff)], [X(56), Y(cuff)]], INK, 2);
    if (o.tight && sk >= .98) {   // the elastic bites: the leg bulges above the cuff, the vessel under it is pinched
      g += '<path d="' + P([[X(-50), Y(cuff - 4)], [X(-58), Y(cuff - 20)], [X(-50), Y(cuff - 40)]], false) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + '<path d="' + P([[X(46), Y(cuff - 4)], [X(56), Y(cuff - 20)], [X(46), Y(cuff - 40)]], false) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var e = 0; e < 5; e++) g += line([[X(-50 + e * 25), Y(cuff + 3)], [X(-46 + e * 25), Y(cuff + 15)]], "#2a120e", 1.4);
    }
  }
  g += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(2.6) + '" stroke-linejoin="round"/>';
  if (!(o.sock > .2)) g += '<path d="' + P([[X(254), Y(62)], [X(268), Y(70)], [X(276), Y(82)], [X(258), Y(80)]], true) + '" fill="#f1d2c2" stroke="' + INK + '" stroke-width="1.4"/>' + line([[X(-60), Y(-30)], [X(-40), Y(-8)]], SKIND, 2) + line([[X(150), Y(24)], [X(160), Y(36)]], SKIND, 1.6) + [[236, 52], [214, 46], [194, 40]].map(function (q, i) { return '<path d="M' + f(X(q[0])) + ' ' + f(Y(q[1])) + ' q' + f(-14 * s) + ' ' + f(-4 * s) + ' ' + f(-18 * s) + ' ' + f(12 * s) + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>'; }).join("");   // toenail, toes, ankle bone, a toe crease
  return g;
}

// ── the skin, cut open as a block (v20): surface at y, width w. o.open 0..1 (AVA wide, blood runs up near the surface,
// heat leaves), o.trap 0..1 (the heat stays deep: an orange glow round the deep vessels that can't get out),
// o.flow (blood speed, default 1), o.squeeze: a band pressing the skin (tight sock) ──
function skin(x, y, w, o) {
  o = o || {}; var k = cl(o.open || 0), t = now(), g = "", h = 360, cx = x + w / 2, top = 52, id = "sb" + (++CN);
  var e1 = y + 24, d1 = y + 170, a1 = y + 210, v1 = y + 262;   // epidermis | dermis | fat; deep artery, deep vein
  // top face (the skin surface seen at an angle)
  g += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + 46) + ' ' + f(y - top) + ' L' + f(x + w + 46) + ' ' + f(y - top) + ' L' + f(x + w) + ' ' + f(y) + ' Z" fill="#e3a58f" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
  for (var i = 0; i < 9; i++) g += line([[x + 40 + i * w / 9, y - 14 - rnd(i) * 26], [x + 52 + i * w / 9, y - 18 - rnd(i) * 26]], "#c9806c", 1.4);
  // right side face
  g += '<path d="M' + f(x + w) + ' ' + f(y) + ' L' + f(x + w + 46) + ' ' + f(y - top) + ' L' + f(x + w + 46) + ' ' + f(y + h - top) + ' L' + f(x + w) + ' ' + f(y + h) + ' Z" fill="#d8b49a" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  // front face: layers
  g += '<clipPath id="' + id + '"><rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')">';
  g += rect(x, y, w, h, FAT, 0) + rect(x, y, w, d1 - y, DER, 0) + rect(x, y, w, e1 - y, EPI, 0);
  g += '<path d="' + P([[x, d1], [x + w * .25, d1 + 8], [x + w * .5, d1 - 4], [x + w * .75, d1 + 6], [x + w, d1]], false) + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' + line([[x, e1], [x + w, e1]], INK, 1.4);
  for (var c = 0; c < 26; c++) { var fx = x + 16 + (c * 47) % (w - 20), fy = d1 + 30 + ((c * 31) % 160); g += '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(13 + rnd(c) * 6) + '" fill="' + FATL + '" stroke="' + INK + '" stroke-width="1" opacity=".55"/>'; }
  for (var q = 0; q < 10; q++) g += line([[x + 20 + q * w / 10, y + 60 + rnd(q) * 60], [x + 34 + q * w / 10, y + 80 + rnd(q) * 60]], DERD, 2);   // dermis fibres
  // trapped heat: an orange glow hugging the deep vessels
  if (o.trap > 0) { var tr = cl(o.trap) * (.75 + .25 * Math.sin(t * 2.4)); g += '<rect x="' + f(x) + '" y="' + f(a1 - 34) + '" width="' + f(w) + '" height="' + f(v1 - a1 + 68) + '" fill="' + ORANGE + '" opacity="' + f(.22 * tr) + '"/>'; }
  // deep artery (red, flowing →) and vein (slate, flowing ←)
  g += rect(x - 4, a1 - 9, w + 8, 18, ART, 2) + rect(x - 4, v1 - 9, w + 8, 18, VEIN, 2);
  var fl = o.flow == null ? 1 : o.flow;
  for (var p = 0; p < 12; p++) { var u = (t * .16 * fl + p / 12) % 1; g += '<circle cx="' + f(x + u * w) + '" cy="' + f(a1) + '" r="3.2" fill="#f3c2b4"/><circle cx="' + f(x + w - u * w) + '" cy="' + f(v1) + '" r="3.2" fill="#b9bbd6"/>'; }
  // the AVA loop: up from the artery, along just under the surface, down to the vein
  var L = cx - 70, Rr = cx + 70, ny = e1 + 26 + (1 - k) * 0, wid = 4 + 14 * k, sq = o.squeeze ? cl(o.squeeze) : 0;
  var loop = [[L, a1], [L, ny + 8], [L + 8, ny], [Rr - 8, ny], [Rr, ny + 8], [Rr, v1]];
  var loopW = wid * (1 - .75 * sq);
  g += line(loop, INK, loopW + 4) + line(loop, k > .5 ? ART : "#a77a72", loopW);
  if (k < .5) { [L, Rr].forEach(function (lx) { g += line([[lx - 14, a1 - 30], [lx - 3, a1 - 30]], INK, 3) + line([[lx + 3, a1 - 30], [lx + 14, a1 - 30]], INK, 3); }); }   // the muscle ring squeezes it shut
  if (k > .15) for (var b = 0; b < 8; b++) {   // blood running round the loop
    var uu = (t * .32 * fl + b / 8) % 1, seg = [[L, a1], [L, ny], [Rr, ny], [Rr, v1]], lens = [a1 - ny, Rr - L, v1 - ny], tot = lens[0] + lens[1] + lens[2], dd = uu * tot, px, py;
    if (dd < lens[0]) { px = L; py = a1 - dd; } else if (dd < lens[0] + lens[1]) { px = L + (dd - lens[0]); py = ny; } else { px = Rr; py = ny + (dd - lens[0] - lens[1]); }
    g += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2 + 2.6 * k * (1 - .7 * sq)) + '" fill="#f6d6c6" opacity="' + f(cl(k * 1.4)) + '"/>';
  }
  if (k > .3) for (var hh = 0; hh < 5; hh++) { var u2 = (t * .7 + hh / 5) % 1, hx = L + 20 + hh * (Rr - L - 40) / 4; g += line([[hx, ny - 6 - u2 * (ny - y - 6)], [hx, ny - 14 - u2 * (ny - y - 6)]], ORANGE, 3, ' opacity="' + f(k * Math.sin(u2 * Math.PI)) + '"'); }   // heat crossing the skin
  g += '</g>';
  g += rect(x, y, w, h, "none", 2.2);
  if (sq > 0) g += rect(x - 10, y - 26 - 10 * (1 - sq), w + 66, 26, "#5a2620", 2, 4);
  g += heat(cx + 20, y - top / 2 - 6, 220, 7, k * (1 - sq), 1.2);   // heat leaving the surface
  return { svg: g, loop: [cx, ny], art: [x + 60, a1], vein: [x + 60, v1], surface: y, cx: cx, e1: e1, d1: d1 };
}

// ── the car radiator (the analogy): a car's front cut open from the side. Engine block (hot) on the left, two hoses, the
// radiator at the nose with its fins, the fan; cool air comes in from the right through the fins and leaves warm ──
function car(x, y, s, o) {
  o = o || {}; var t = now(), g = "", X = function (v) { return x + v * s; }, Y = function (v) { return y + v * s; };
  // body outline (bonnet, wing, bumper, wheel) in light ink
  g += '<path d="' + P([[X(-260), Y(-120)], [X(-120), Y(-130)], [X(160), Y(-112)], [X(232), Y(-80)], [X(250), Y(10)], [X(240), Y(70)], [X(160), Y(78)]], false) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="10 7"/>';
  g += '<circle cx="' + f(X(30)) + '" cy="' + f(Y(150)) + '" r="' + f(50 * s) + '" fill="#3a3632" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(X(30)) + '" cy="' + f(Y(150)) + '" r="' + f(22 * s) + '" fill="#b9b2a4" stroke="' + INK + '" stroke-width="2"/>';
  // engine block
  var hot = o.hot == null ? 1 : o.hot;
  g += rect(X(-250), Y(-90), 190 * s, 150 * s, "#8f8576", 2.4, 6) + rect(X(-238), Y(-118), 166 * s, 34 * s, "#a39a8a", 2.2, 4);
  for (var c = 0; c < 4; c++) g += rect(X(-236 + c * 42), Y(-70), 30 * s, 64 * s, "#6f675c", 1.6, 3);
  g += '<rect x="' + f(X(-250)) + '" y="' + f(Y(-90)) + '" width="' + f(190 * s) + '" height="' + f(150 * s) + '" rx="6" fill="' + ORANGE + '" opacity="' + f(.35 * hot * (.8 + .2 * Math.sin(t * 3))) + '"/>';
  // hoses: hot one on top (orange), cooled one below (blue)
  var hot1 = [[X(-60), Y(-60)], [X(40), Y(-70)], [X(140), Y(-62)]], cool1 = [[X(140), Y(40)], [X(40), Y(48)], [X(-60), Y(30)]];
  g += line(hot1, INK, 18 * s) + line(hot1, "#d4774f", 13 * s) + line(cool1, INK, 18 * s) + line(cool1, "#7f9fb6", 13 * s);
  for (var p = 0; p < 5; p++) { var u = (t * .5 + p / 5) % 1; g += '<circle cx="' + f(X(-60 + u * 200)) + '" cy="' + f(Y(-60 - 10 * Math.sin(u * Math.PI))) + '" r="' + f(3.5 * s) + '" fill="#f6d6c6"/><circle cx="' + f(X(140 - u * 200)) + '" cy="' + f(Y(40 + 8 * Math.sin(u * Math.PI))) + '" r="' + f(3.5 * s) + '" fill="#e7eef2"/>'; }
  // the fan behind the radiator
  g += rect(X(132), Y(-90), 12 * s, 150 * s, "#6f675c", 1.6);
  // the radiator: a tall core of fins between two tanks
  g += rect(X(150), Y(-100), 60 * s, 170 * s, "#c9c4b6", 2.4, 3);
  for (var r = 0; r < 15; r++) g += line([[X(152), Y(-90 + r * 11)], [X(208), Y(-90 + r * 11)]], INK, 1.2);
  g += '<rect x="' + f(X(150)) + '" y="' + f(Y(-100)) + '" width="' + f(60 * s) + '" height="' + f(85 * s) + '" fill="' + ORANGE + '" opacity=".25"/>' + '<rect x="' + f(X(150)) + '" y="' + f(Y(-15)) + '" width="' + f(60 * s) + '" height="' + f(85 * s) + '" fill="' + BLUE + '" opacity=".22"/>';
  // air: blue arrows in from the right, out as heat to the left
  if (o.air !== false) {
    for (var a = 0; a < 4; a++) { var ua = (t * .6 + a / 4) % 1, ay = Y(-70 + a * 42), ax = X(330 - ua * 150); g += '<g opacity="' + f(Math.sin(ua * Math.PI)) + '">' + line([[ax, ay], [ax - 46 * s, ay]], BLUE, 4) + '<path d="M' + f(ax - 52 * s) + ' ' + f(ay) + ' l' + f(12 * s) + ' ' + f(-7 * s) + ' l0 ' + f(14 * s) + ' Z" fill="' + BLUE + '"/></g>'; }
    g += heat(X(110), Y(-30), 90 * s, 5, 1, .8, -90);
  }
  return g;
}

// ── a body temperature thermometer: k 0..1 fill, the bulb at (x, y+h) ──
function thermo(x, y, h, k, col) { return rect(x - 11, y, 22, h, "#fbf8f1", 2.2, 11) + '<circle cx="' + f(x) + '" cy="' + f(y + h + 14) + '" r="20" fill="' + (col || ORANGE) + '" stroke="' + INK + '" stroke-width="2.2"/>' + rect(x - 5, y + h - (h - 14) * cl(k), 10, (h - 14) * cl(k) + 16, col || ORANGE, 0) + [0, 1, 2, 3, 4].map(function (i) { return line([[x + 11, y + 20 + i * (h - 30) / 4], [x + 22, y + 20 + i * (h - 30) / 4]], INK, 1.6); }).join(""); }

// ── the core: a standing person in pyjamas with an orange core glow in the trunk. o.core 0..1, o.hands / o.feet heat 0..1, o.socks ──
function standing(x, y, s, o) {
  o = o || {}; var t = now(), br = (Math.sin(t * 1.6) + 1) / 2;
  var Pp = PERSON.front({ x: x, y: y, s: s, legs: "stand", outfit: { base: "home", feet: o.socks ? "socks" : "bare", colors: PJ }, breath: br,
    head: { tilt: 2 * Math.sin(t * .7) }, face: { eyes: (t % 3.7) < .12 ? .05 : (o.eyes == null ? 1 : o.eyes), brows: o.brows || "neutral", mouth: o.mouth || "neutral", tired: !!o.tired },
    arms: [{ rel: [-14, 130], bend: -1, hand: "relaxed" }, { rel: [14, 130], bend: 1, hand: "relaxed" }] });
  var J = Pp.joints, g = Pp.svg;
  if (o.core > 0) { var pk = cl(o.core) * (.7 + .3 * Math.sin(t * 2.6)); g += '<ellipse cx="' + f(x) + '" cy="' + f(y - 60 * s) + '" rx="' + f(44 * s) + '" ry="' + f(70 * s) + '" fill="' + ORANGE + '" opacity="' + f(.45 * pk) + '"/><ellipse cx="' + f(x) + '" cy="' + f(y - 60 * s) + '" rx="' + f(24 * s) + '" ry="' + f(42 * s) + '" fill="' + ORANGE + '" opacity="' + f(.4 * pk) + '"/>'; }
  if (o.hands > 0) J.wr.forEach(function (w, i) { g += heat(w[0] + (i ? 18 : -18) * s, w[1] + 30 * s, 30 * s, 3, o.hands, .8 * s, i ? 60 : -60); });
  if (o.feet > 0) J.ankle.forEach(function (a, i) { g += heat(a[0] + (i ? 26 : -26) * s, a[1] + 10 * s, 30 * s, 3, o.feet, .8 * s, i ? 75 : -75); });
  return { svg: g, J: J };
}

// ── icons for «ينقذ حياتك»: a heart, a blood-pressure dial, a sugar cube stack; and a clock ──
function heart(x, y, s, beat) { var b = 1 + .06 * (beat || 0); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * b) + ')"><path d="M0 34 C-50 4 -46 -40 -16 -40 C-6 -40 0 -32 0 -24 C0 -32 6 -40 16 -40 C46 -40 50 4 0 34 Z" fill="#c45a4a" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M-6 -36 C-4 -52 4 -56 10 -60 M8 -38 C10 -50 18 -54 24 -54" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-26 -22 C-30 -10 -24 2 -12 10" stroke="#e08b78" stroke-width="5" fill="none" stroke-linecap="round"/></g>'; }
function dial(x, y, s, k) { var a = (-200 + 220 * cl(k)) * Math.PI / 180, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')"><circle r="42" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.6"/>'; for (var i = 0; i <= 10; i++) { var b = (-200 + 22 * i) * Math.PI / 180; g += line([[Math.cos(b) * 32, Math.sin(b) * 32], [Math.cos(b) * 38, Math.sin(b) * 38]], i > 7 ? ORANGE : INK, 2.4); } return g + line([[0, 0], [Math.cos(a) * 30, Math.sin(a) * 30]], ORANGE, 4) + '<circle r="5" fill="' + INK + '"/></g>'; }
function sugar(x, y, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')">'; [[-24, 8], [8, 8], [-8, -24]].forEach(function (p) { g += '<path d="M' + p[0] + ' ' + p[1] + ' l26 0 l10 -10 l-26 0 Z" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><path d="M' + (p[0] + 26) + ' ' + p[1] + ' l10 -10 l0 26 l-10 10 Z" fill="#d8d2c4" stroke="' + INK + '" stroke-width="2"/>' + rect(p[0], p[1], 26, 26, "#f3efe6", 2); }); return g + '</g>'; }
function clock(x, y, r, hrs) { var t = now(), a1 = (hrs || 0) / 12 * Math.PI * 2 - Math.PI / 2, a2 = t * .8 - Math.PI / 2, g = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.6"/>'; for (var i = 0; i < 12; i++) { var b = i / 12 * Math.PI * 2; g += line([[x + Math.cos(b) * r * .8, y + Math.sin(b) * r * .8], [x + Math.cos(b) * r * .92, y + Math.sin(b) * r * .92]], INK, 2); } return g + line([[x, y], [x + Math.cos(a1) * r * .5, y + Math.sin(a1) * r * .5]], INK, 4) + line([[x, y], [x + Math.cos(a2) * r * .75, y + Math.sin(a2) * r * .75]], ORANGE, 2.6) + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + INK + '"/>'; }
function moonIcon(x, y, r) { return '<path d="M' + f(x + r * .3) + ' ' + f(y - r) + ' A' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(x + r) + ' ' + f(y + r * .3) + ' A' + f(r * .78) + ' ' + f(r * .78) + ' 0 0 1 ' + f(x + r * .3) + ' ' + f(y - r) + ' Z" fill="#e8d9a8" stroke="' + INK + '" stroke-width="2.2"/>'; }
// a door in a frame, opening (k 0..1): «الباب اللي الحرارة بتخرج منه»
function door(x, y, h, k) { var w = h * .5, op = cl(k), dw = w * (1 - .75 * op); return rect(x - w / 2 - 8, y - h - 8, w + 16, h + 8, WOODD, 2.2) + rect(x - w / 2, y - h, w, h, "#3a2e24", 0) + '<path d="M' + f(x - w / 2) + ' ' + f(y - h) + ' L' + f(x - w / 2 + dw) + ' ' + f(y - h + 10 * op) + ' L' + f(x - w / 2 + dw) + ' ' + f(y - 10 * op) + ' L' + f(x - w / 2) + ' ' + f(y) + ' Z" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2.2"/>' + '<circle cx="' + f(x - w / 2 + dw * .82) + '" cy="' + f(y - h / 2) + '" r="3.5" fill="' + INK + '"/>'; }

return { heat: heat, cold: cold, bed: bed, sleeper: sleeper, foot: foot, skin: skin, car: car, thermo: thermo, standing: standing,
  heart: heart, dial: dial, sugar: sugar, clock: clock, moonIcon: moonIcon, door: door, line: line, shape: shape, P: P,
  C: { SOCK: SOCK, ART: ART, VEIN: VEIN, COLD: COLD, PJ: PJ } };
})();
