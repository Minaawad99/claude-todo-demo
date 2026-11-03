  // ── «تعمل ونش برجي إزاي؟» (لو + دايجرام): one tower crane drawn in true isometric (world units = metres), built part by part:
  // concrete foundation with anchor bolts, lattice mast (2.4 m square, 3 m sections), slewing ring, cat-head apex with
  // pendants, triangular lattice jib (50 m) with trolley and hook, counter-jib with concrete counterweight blocks, cab with
  // load-moment display, climbing frame, tie-ins to the building, ladder and aircraft light. Shapes from common top-slewing
  // hammerhead cranes (../refs/SOURCES.md).
  var DARK = "#41392f", SKY = "#b9bfbb", SAND = "#d9c3a8", SOIL = "#c9a98f", TABLE = "#d0806a", PB = "#4f7a9a", LANDD = "#8e9f6a",
      CR = "#d1a640", CRD = "#a8822e", CRL = "#e6c873", CONC = "#cdc9bb", CONCD = "#b3ae9e";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function TS(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:700 ' + sz + 'px DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + ';direction:ltr">' + text + '</text>'; }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("؟", 0, 0, sz || 60, ORANGE)); }
  function P3(p) { return iso(p[0], p[1], p[2]); }
  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + (b[2] || 0) * k]; }
  // a bundle of steel members drawn as one path: ink under-stroke, then the steel colour
  function members(segs, w, col, op) {
    if (!segs.length) return ""; var d = ""; segs.forEach(function (sg) { var p = P3(sg[0]), q = P3(sg[1]); d += "M" + f(p[0]) + " " + f(p[1]) + " L" + f(q[0]) + " " + f(q[1]) + " "; });
    return '<g opacity="' + f(op == null ? 1 : op) + '"><path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 2) + '" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="' + (col || CR) + '" stroke-width="' + f(w) + '" stroke-linecap="round" fill="none"/></g>';
  }
  // a box turned to any direction: centre (cx,cy), bottom z, a along d, b along n, height h
  function boxR(cx, cy, z, d, a, b, h, col) {
    col = col || [CONC, CONC, CONCD]; var n = [-d[1], d[0]], C = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(function (q) { return [cx + d[0] * a / 2 * q[0] + n[0] * b / 2 * q[1], cy + d[1] * a / 2 * q[0] + n[1] * b / 2 * q[1]]; });
    var faces = [];
    for (var i = 0; i < 4; i++) { var p = C[i], q = C[(i + 1) % 4], mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy; if (mx + my <= 0.001) continue;
      faces.push({ dp: p[0] + p[1] + q[0] + q[1], pts: [[p[0], p[1], z], [q[0], q[1], z], [q[0], q[1], z + h], [p[0], p[1], z + h]], right: mx > my }); }
    faces.sort(function (A, B) { return A.dp - B.dp; });
    var s = ""; faces.forEach(function (F) { s += isoFace(F.pts, F.right ? col[2] : col[1], F.right ? "hatch" : "", 1.6); });
    return s + isoFace(C.map(function (c) { return [c[0], c[1], z + h]; }), col[0], "", 1.6);
  }
  // ── the lattice mast from z0 to z1, half width w (corners A back, B right, C front, D left)
  function mast(z0, z1, w, col, front) {
    var A = [-w, -w], B = [w, -w], Cc = [w, w], D = [-w, w], back = [], fr = [], sec = 3;
    var face = function (P, Q, arr) { for (var z = z0; z < z1 - 0.01; z += sec) { var zt = Math.min(z1, z + sec); arr.push([[P[0], P[1], z], [Q[0], Q[1], z]]); arr.push([[P[0], P[1], z], [Q[0], Q[1], zt]]); arr.push([[Q[0], Q[1], z + (zt - z) * 0.5], [P[0], P[1], zt]]); } arr.push([[P[0], P[1], z1], [Q[0], Q[1], z1]]); };
    back.push([[A[0], A[1], z0], [A[0], A[1], z1]]); face(A, B, back); face(D, A, back);
    face(B, Cc, fr); face(Cc, D, fr); [B, Cc, D].forEach(function (P) { fr.push([[P[0], P[1], z0], [P[0], P[1], z1]]); });
    return members(back, 1.6, col || CRD, 0.85) + (front || "") + members(fr, 2.2, col || CR);
  }
  // ── the jib: two bottom chords (±0.9 m) at z, a top chord 1.8 m above (tapering at the tip), from s0 to L along d
  function jib(d, z, L, s0, col) {
    var n = [-d[1], d[0]], P = function (s, side, top) { var hz = top ? 1.8 * (1 - 0.75 * s / Math.max(L, 1)) : 0; return [d[0] * s + n[0] * side, d[1] * s + n[1] * side, z + hz]; };
    var a = [], b = [], tp = [], step = 2.5;
    for (var s = s0; s < L - 0.01; s += step) { var e = Math.min(L, s + step);
      a.push([P(s, 0.9), P(e, 0.9)]); b.push([P(s, -0.9), P(e, -0.9)]); tp.push([P(s, 0, 1), P(e, 0, 1)]);
      a.push([P(s, 0.9), P(e, 0, 1)]); b.push([P(s, -0.9), P(e, 0, 1)]); a.push([P(s, 0.9), P(s, -0.9)]); }
    var nearA = n[0] + n[1] > 0;
    return members(nearA ? b : a, 1.4, CRD, 0.9) + members(tp, 1.8, col || CR) + members(nearA ? a : b, 1.9, col || CR);
  }
  // ── the building next to the crane: floors of 3.2 m, windows on the two faces we see
  function building(h, t) {
    if (h <= 0) return ""; var x = 10, y = -26, w = 16, s = isoShadow(x, y, w, w, 0.1) + isoBox(x, y, 0, w, w, h, [BONE, "#e6dcc6", PUTTY]);
    for (var z = 3.2; z < h - 0.1; z += 3.2) { s += '<path d="' + isoPath([[x, y + w, z], [x + w, y + w, z], [x + w, y, z], [x + w, y, z]]).replace(" Z", "") + '" stroke="' + INK + '" stroke-width="1" fill="none" opacity=".5"/>'; }
    for (z = 0; z < h - 2.5; z += 3.2) for (var k = 1.2; k < w - 1; k += 3.2) { s += isoFace([[x + k, y + w, z + 1], [x + k + 1.6, y + w, z + 1], [x + k + 1.6, y + w, z + 2.4], [x + k, y + w, z + 2.4]], SKY, "", 0.9); s += isoFace([[x + w, y + k, z + 1], [x + w, y + k + 1.6, z + 1], [x + w, y + k + 1.6, z + 2.4], [x + w, y + k, z + 2.4]], "#a3aaa6", "", 0.9); }
    for (var c = 0; c < 4; c++) { var cx = x + 1 + (c % 2) * (w - 2), cy = y + 1 + Math.floor(c / 2) * (w - 2); s += isoBox(cx - 0.3, cy - 0.3, h, 0.6, 0.6, 1.6, [CONC, CONC, CONCD], 1); }
    return s;
  }
  function ground(o) {
    o = o || {}; var s = isoFace([[-34, -46, 0], [40, -46, 0], [40, 26, 0], [-34, 26, 0]], SAND, "", 1.4);
    if (o.pit) s += isoFace([[-4, -4, 0], [4, -4, 0], [4, -4, -3], [-4, -4, -3]], SOIL, "hatch", 1.2) + isoFace([[-4, -4, 0], [-4, 4, 0], [-4, 4, -3], [-4, -4, -3]], SOIL, "hatch", 1.2) + isoFace([[-4, -4, -3], [4, -4, -3], [4, 4, -3], [-4, 4, -3]], "#bf9f86", "", 1.2);
    return s;
  }
  // the concrete foundation (k: 0..1 poured) with the four anchor bolts
  function foundation(k) {
    if (k <= 0) return ""; var h = 3.2 * k, s = isoBox(-3.5, -3.5, -3, 7, 7, h, [CONC, CONC, CONCD]);
    if (k >= 1) [[-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2]].forEach(function (c) { s += isoBox(c[0] - 0.35, c[1] - 0.35, 0.2, 0.7, 0.7, 0.9, [DARK, DARK, DARK], 1.2); });
    return s;
  }
  // ── the crane, part by part. o: H mast height, g climbing gap, phi jib heading, jib length, cj counter-jib, cw blocks,
  // apex, ring, trolley (distance), load (0..1 size), drop (rope length), cab, ladder, light, climb (frame), newSec, ties
  function crane(t, o) {
    o = o || {}; var w = 1.2, H = o.H == null ? 36 : o.H, g = o.g || 0, phi = o.phi == null ? -Math.PI / 4 : o.phi, d = [Math.cos(phi), Math.sin(phi)], n = [-d[1], d[0]];
    var Hj = H + g + 1.4, L = o.jib == null ? 50 : o.jib, s = "", parts = [];
    var lad = ""; if (o.ladder) { for (var z = 1; z < H; z += 0.9) { var p1 = P3([w, w - 0.6, z]), p2 = P3([w - 0.6, w, z]); lad += '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(p2[0]) + ' ' + f(p2[1]) + '" stroke="' + DARK + '" stroke-width="1"/>'; } }
    if (o.solid) s += isoBox(-w, -w, 0, 2 * w, 2 * w, H, ["#9a958a", "#8a857a", "#77726a"]);
    else if (H > 0) s += mast(0, H, w, null, lad);
    if (o.climb) { s += members([[[-1.7, -1.7, H - 6], [-1.7, -1.7, H + g]], [[1.7, -1.7, H - 6], [1.7, -1.7, H + g]], [[1.7, 1.7, H - 6], [1.7, 1.7, H + g]], [[-1.7, 1.7, H - 6], [-1.7, 1.7, H + g]], [[1.7, 1.7, H - 6], [-1.7, 1.7, H - 6]], [[1.7, 1.7, H - 6], [1.7, -1.7, H - 6]], [[1.7, 1.7, H + g], [-1.7, 1.7, H + g]], [[1.7, 1.7, H + g], [1.7, -1.7, H + g]], [[1.7, 1.7, H - 6], [-1.7, 1.7, H + g]]], 1.8, PB);
      var c0 = P3([1.7, 0, H - 5]), c1 = P3([1.7, 0, H - 1 + g]); s += '<path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' L' + f(c1[0]) + ' ' + f(c1[1]) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + f(c0[0]) + ' ' + f(c0[1]) + ' L' + f(c1[0]) + ' ' + f(c1[1]) + '" stroke="#c9ccc8" stroke-width="4.5" stroke-linecap="round"/>'; }
    if (o.ties) [18, 30].forEach(function (zt) { if (zt < H - 2) s += members([[[w, -w, zt], [10, -10, zt]], [[w, w, zt], [10, -10, zt]], [[w, -w, zt], [10, -14, zt]]], 1.8, PB); });
    if (o.top === false || H <= 0) return s;
    // upper works above the gap
    if (g > 0) s += mast(H + g - 0.01, H + g, w);
    if (o.ring !== false) s += isoCyl(0, 0, H + g, 1.9, 1.4, DARK, "#6a6058");
    var cjL = o.cj ? 14 : 0;
    var cjS = "";
    if (cjL) { var md = [-d[0], -d[1]]; cjS += jib(md, Hj, cjL * o.cj, 0, CR).replace(/stroke-width="1.8"/, 'stroke-width="1.2"');
      for (var b = 0; b < (o.cw || 0); b++) cjS += boxR(-d[0] * (13 - b * 1.1), -d[1] * (13 - b * 1.1), Hj - 3.2, md, 1, 2.6, 3.6, [CONC, CONC, CONCD]); }
    var apS = "";
    if (o.apex) { var top = [0, 0, Hj + 8]; apS += members([[[-w, -w, Hj], top], [[w, -w, Hj], top], [[w, w, Hj], top], [[-w, w, Hj], top]], 1.8, CR);
      var j1 = [d[0] * L * 0.62, d[1] * L * 0.62, Hj + 1.8 * (1 - 0.75 * 0.62)]; apS += '<path d="M' + P3(top).map(f).join(' ') + ' L' + P3(j1).map(f).join(' ') + (cjL ? ' M' + P3(top).map(f).join(' ') + ' L' + P3([-d[0] * 13, -d[1] * 13, Hj + 0.3]).map(f).join(' ') : '') + '" stroke="' + DARK + '" stroke-width="1.6"/>'; }
    var jbS = L > 0 ? jib(d, Hj, L, 0) : "";
    var dd = d[0] + d[1];
    parts.push([-dd, cjS]); parts.push([0, apS]); parts.push([dd, jbS]);
    parts.sort(function (A, B) { return A[0] - B[0]; }); parts.forEach(function (q) { s += q[1]; });
    if (o.cab) { var cc = [n[0] * 2.1 + d[0] * 0.6, n[1] * 2.1 + d[1] * 0.6]; s += boxR(cc[0], cc[1], Hj - 2.6, d, 2, 1.8, 2.4, [BONE, "#e9e1cc", "#d5c6a8"]);
      if (dd > -0.2) s += isoFace([[cc[0] + d[0] + n[0] * 0.6, cc[1] + d[1] + n[1] * 0.6, Hj - 1.7], [cc[0] + d[0] - n[0] * 0.6, cc[1] + d[1] - n[1] * 0.6, Hj - 1.7], [cc[0] + d[0] - n[0] * 0.6, cc[1] + d[1] - n[1] * 0.6, Hj - 0.5], [cc[0] + d[0] + n[0] * 0.6, cc[1] + d[1] + n[1] * 0.6, Hj - 0.5]], SKY, "", 1.2); }
    if (o.light && o.apex) { var lp = P3([0, 0, Hj + 8.4]), on = Math.sin(t * 4) > 0; s += '<circle cx="' + f(lp[0]) + '" cy="' + f(lp[1]) + '" r="' + f(on ? 16 : 9) + '" fill="url(#glowO)"/>' + circ0(lp[0], lp[1], 4, on ? "#e0402a" : "#8a3a24"); }
    if (o.trolley != null && L > 0) {
      var r = o.trolley, tp = [d[0] * r, d[1] * r], drop = o.drop == null ? 14 : o.drop, zl = Hj - drop;
      s += boxR(tp[0], tp[1], Hj - 0.9, d, 1.6, 2.2, 0.9, [DARK, "#5a5046", DARK]);
      var r0 = P3([tp[0], tp[1], Hj - 0.9]), r1 = P3([tp[0], tp[1], zl + 1.6]); s += '<path d="M' + f(r0[0] - 2) + ' ' + f(r0[1]) + ' L' + f(r1[0] - 2) + ' ' + f(r1[1]) + ' M' + f(r0[0] + 2) + ' ' + f(r0[1]) + ' L' + f(r1[0] + 2) + ' ' + f(r1[1]) + '" stroke="' + INK + '" stroke-width="1.2"/>';
      s += isoBox(tp[0] - 0.5, tp[1] - 0.5, zl + 0.9, 1, 1, 0.8, [DARK, ORANGE, "#a8452a"], 1.2);
      if (o.load) { var ls = o.load; s += isoBox(tp[0] - 1.1 * ls, tp[1] - 1.1 * ls, zl - 1.5 * ls, 2.2 * ls, 2.2 * ls, 1.5 * ls, [TABLE, "#c4532c", "#a8452a"], 1.4) + isoBox(tp[0] - 1.25 * ls, tp[1] - 1.25 * ls, zl - 1.8 * ls, 2.5 * ls, 2.5 * ls, 0.3 * ls, ["#b98f64", "#a37a52", "#8a6642"], 1.2); }
      if (o.newSec) s += o.newSec;
    }
    return s;
  }
  function circ0(x, y, r, fill) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  // where things are on screen (after isoAt)
  function jibPt(o, r, dz) { var H = o.H == null ? 36 : o.H, g = o.g || 0, phi = o.phi == null ? -Math.PI / 4 : o.phi; return P3([Math.cos(phi) * r, Math.sin(phi) * r, H + g + 1.4 + (dz || 0)]); }
  function wind(t, k, y0) { var s = ""; for (var i = 0; i < 5; i++) s += waveRay(-60, y0 + i * 34, 520 + 40 * Math.sin(i), y0 + i * 34 - 20, t + i, "#8a9aa3", 5, 34, k * (0.6 + 0.4 * hash(i)), 3); return s; }
  function scene(t, o, bh) { return paper() + ground(o) + (o.base == null || o.base ? foundation(o.base == null ? 1 : o.base) : "") + building(bh || 0, t) + crane(t, o); }
  var FULL = function () { isoAt(230, 690, 6.2); };

  // 0 — if you put up a tall steel pole and hang a rope from the top, did you build a tower crane?
  function pole(t, tilt) {
    isoAt(300, 660, 7); var s = paper() + ground(), base = iso(0, 0, 0), sw = 4 * Math.sin(t * 1.6);
    var inner = isoBox(-0.4, -0.4, 0, 0.8, 0.8, 30, [CONC, "#9a958a", "#77726a"]) + isoBox(-0.4, -0.4, 30, 9, 0.8, 0.6, [CONC, "#9a958a", "#77726a"]);
    var hk = iso(8.5, 0, 30), lp = iso(8.5, 0, 14); inner += '<path d="M' + f(hk[0]) + ' ' + f(hk[1]) + ' L' + f(lp[0] + sw) + ' ' + f(lp[1]) + '" stroke="' + INK + '" stroke-width="2"/>' + G(lp[0] + sw, lp[1], 1, 0, R(-22, 0, 44, 30, TABLE, 2, 3) + R(-22, 0, 44, 30, "url(#hatch)", 0, 3));
    return s + '<g transform="rotate(' + f(tilt) + ' ' + f(base[0]) + ' ' + f(base[1]) + ')">' + inner + '</g>';
  }
  shot(0, mv(320, 420, 1.0, 330, 400, 1.08), function (u, d, t) { return pole(t, 0) + qmark(470, 180, K(u, 1.6, 0.6), 80); });
  // 1 — sadly no: as soon as you lift something heavy, the pole falls over on its side
  shot(1, mv(330, 420, 1.0, 360, 460, 0.95), function (u, d, t) { var k = ease(K(u, 0.6, 1.6)); return pole(t, 70 * k * k) + crossMark(260, 300, 1.3, K(u, 2.2, 0.5)); });
  // 2 — so first you pour a huge concrete base, over 100 tonnes, and fix the mast to it
  shot(2, mv(250, 600, 2.0, 240, 560, 1.7), function (u, d, t) {
    FULL(); var k = ease(K(u, 0.3, 2.0)), s = paper() + ground({ pit: true }) + foundation(k);
    if (k >= 1) s += mast(0, 3 * ease(K(u, 2.4, 1.2)) + 0.01, 1.2);
    var c = iso(3.5, 3.5, 0.2); return s + label(c[0], c[1], 380, 620, "قاعدة خرسانة", OLIVE, K(u, 0.6), 18) + fixed(G(470, 110, pop(K(u, 1.6, 0.6)), 0, TS("+100", 0, 0, 52) + T("طن", 0, 30, 22, INK, 700)));
  });
  // 3 — but the mast must be very strong without being heavy itself
  shot(3, mv(240, 520, 1.3, 240, 480, 1.2), function (u, d, t) {
    FULL(); var h = 18 * ease(K(u, 0.2, 1.2)), s = paper() + ground() + foundation(1) + crane(t, { H: h, solid: true, top: false });
    var p = iso(1.2, 1.2, h * 0.6); return s + label(p[0], p[1], 400, 330, "حديد مصمت = تقيل", ORANGE, K(u, 1.0), 17) + crossMark(p[0], p[1] - 30, 0.9, K(u, 2.2, 0.5));
  });
  // 4 — so it's made of latticed steel in triangles, and a triangle can't be squashed
  shot(4, function (u, d) { var k = ease(K(u, 0, d)); return [lerp(240, 250, k), lerp(560, 420, k), lerp(1.4, 1.05, k)]; }, function (u, d, t) {
    FULL(); var H = 3 + 33 * ease(K(u, 0.1, 2.6)), s = paper() + ground() + foundation(1) + crane(t, { H: H, top: false });
    var a = iso(1.2, -1.2, 9), b = iso(1.2, 1.2, 9), c = iso(1.2, 1.2, 12), tk = K(u, 2.6, 0.5);
    if (tk > 0) s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(c[0]) + ' ' + f(c[1]) + ' Z" fill="' + ORANGE + '" fill-opacity=".25" stroke="' + ORANGE + '" stroke-width="4" opacity="' + f(tk) + '"/>';
    return s + label(b[0], b[1] - 8, 420, 560, "مثلثات", ORANGE, K(u, 2.7), 22);
  });
  // 5 — on top you mount a long jib, up to 70 metres
  shot(5, mv(300, 470, 1.15, 380, 440, 1.0), function (u, d, t) {
    FULL(); var L = 50 * ease(K(u, 0.2, 2.2)), o = { jib: L, ring: true, cj: 0 }, s = scene(t, o);
    var tip = jibPt(o, Math.max(L, 1)); return s + numBox("حتى 70 متر", 470, 330, K(u, 2.2, 0.6), 22) + label(tip[0], tip[1], tip[0] - 40, tip[1] - 90, "الذراع", OLIVE, K(u, 1.2), 20);
  });
  // 6 — but as soon as a load hangs at the end of the jib, the whole crane leans forward
  shot(6, mv(380, 430, 1.0, 360, 450, 0.98), function (u, d, t) {
    FULL(); var o = { trolley: 48, load: 1.4, drop: 12 }, k = ease(K(u, 0.6, 1.8)), base = iso(0, 0, 0);
    var s = paper() + ground() + foundation(1) + '<g transform="rotate(' + f(14 * k * k) + ' ' + f(base[0]) + ' ' + f(base[1]) + ')">' + crane(t, o) + '</g>';
    var lp = jibPt(o, 48, -14); return s + arrow(lp[0] + 30, lp[1] - 60, lp[0] + 30, lp[1] + 30, ORANGE, 5, K(u, 0.3, 0.5)) + crossMark(base[0] + 40, base[1] - 120, 1.0, K(u, 2.2, 0.5));
  });
  // 7 — so you add a short jib at the back, loaded with concrete blocks of about 20 tonnes
  shot(7, mv(200, 420, 1.5, 230, 440, 1.25), function (u, d, t) {
    FULL(); var cj = ease(K(u, 0.2, 1.0)), cw = Math.floor(4 * K(u, 1.4, 1.6) + (K(u, 1.4, 1.6) > 0 ? 0.999 : 0)), o = { cj: cj, cw: Math.min(4, cw) }, s = scene(t, o);
    var p = P3([-Math.cos(-Math.PI / 4) * 12, -Math.sin(-Math.PI / 4) * 12, 36 + 1.4 - 1]); return s + label(p[0], p[1], 120, 260, "بلوكات خرسانة", OLIVE, K(u, 1.6), 18) + numBox("≈ 20 طن", 190, 600, K(u, 2.6, 0.6), 22);
  });
  // 8 — that's the counterweight: it pulls the crane back as hard as the load pulls it forward
  shot(8, mv(300, 440, 0.95, 300, 430, 1.0), function (u, d, t) {
    FULL(); var o = { cj: 1, cw: 4, apex: true, trolley: 30, load: 1.4, drop: 12 }, s = scene(t, o), cwp = P3([-9.2, 9.2, 33]), lp = jibPt(o, 30, -14);
    s += arrow(cwp[0], cwp[1] + 10, cwp[0], cwp[1] + 110, OLIVE, 6, K(u, 0.4, 0.6)) + arrow(lp[0], lp[1] + 30, lp[0], lp[1] + 120, ORANGE, 6, K(u, 0.4, 0.6));
    var top = iso(0, 0, 46); s += '<path d="M' + f(cwp[0]) + ' ' + f(top[1] - 10) + ' L' + f(lp[0]) + ' ' + f(top[1] - 10) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6" opacity="' + f(K(u, 1.2)) + '"/>';
    return s + label(cwp[0], cwp[1] - 20, 90, 230, "الثقل الموازن", OLIVE, K(u, 1.0), 20);
  });
  // 9 — but the load has to reach many places, not just one
  shot(9, mv(330, 470, 0.95, 330, 450, 1.0), function (u, d, t) {
    FULL(); var o = { cj: 1, cw: 4, apex: true, trolley: 30, load: 1.2, drop: 10 }, s = scene(t, o, 16);
    [[14, -14, 16.2], [22, -22, 16.2], [6, 4, 0], [30, -6, 0], [18, -30, 0]].forEach(function (p, i) { var q = iso(p[0], p[1], p[2]), k = pop(K(u, 0.4 + i * 0.25, 0.5)); if (k > 0) s += G(q[0], q[1], k, 0, '<ellipse rx="20" ry="11" fill="none" stroke="' + PB + '" stroke-width="3" stroke-dasharray="5 4"/><path d="M-7 -4 L7 4 M7 -4 L-7 4" stroke="' + PB + '" stroke-width="3"/>'); });
    return s + qmark(520, 230, K(u, 1.8, 0.6), 64);
  });
  // 10 — so a little trolley runs along the jib, bringing the load in or out
  shot(10, mv(400, 470, 1.25, 360, 470, 1.1), function (u, d, t) {
    FULL(); var r = 8 + 38 * (0.5 - 0.5 * Math.cos(Math.max(0, u - 0.3) * 1.6)), o = { cj: 1, cw: 4, apex: true, trolley: r, load: 1.2, drop: 12 }, s = scene(t, o, 16), tp = jibPt(o, r, -0.5);
    return s + label(tp[0], tp[1], tp[0] + 20, tp[1] - 100, "العربية", OLIVE, K(u, 0.5), 20);
  });
  // 11 — and a ring on top of the mast turns the whole jib, so it reaches anywhere in a full circle
  shot(11, mv(260, 560, 0.9, 240, 560, 0.82), function (u, d, t) {
    FULL(); var phi = -Math.PI / 4 + 1.4 * Math.sin(Math.max(0, u - 0.4) * 0.9), o = { cj: 1, cw: 4, apex: true, trolley: 30, load: 1.2, drop: 14, phi: phi }, s = paper() + ground() + foundation(1);
    var ring = ""; for (var a = 0; a <= 64; a++) { var q = iso(Math.cos(a / 64 * Math.PI * 2) * 50, Math.sin(a / 64 * Math.PI * 2) * 50, 0); ring += (a ? " L" : "M") + f(q[0]) + " " + f(q[1]); }
    s += '<path d="' + ring + '" fill="' + PB + '" fill-opacity=".08" stroke="' + PB + '" stroke-width="3" stroke-dasharray="10 8" opacity="' + f(K(u, 1.2)) + '"/>';
    s += building(16, t) + crane(t, o); var rp = iso(0, 0, 37.4);
    return s + label(rp[0] + 10, rp[1], rp[0] + 120, rp[1] - 110, "حلقة بتلف", OLIVE, K(u, 0.5), 20);
  });
  // 12 — but the further the load is from the mast, the less the crane can take
  shot(12, mv(380, 450, 1.0, 420, 450, 1.08), function (u, d, t) {
    FULL(); var r = 10 + 38 * ease(K(u, 0.3, 1.6)), o = { cj: 1, cw: 4, apex: true, trolley: r, load: 1.6, drop: 12 }, base = iso(0, 0, 0), k = ease(K(u, 1.4, 1.0));
    var s = paper() + ground() + foundation(1) + building(16, t) + '<g transform="rotate(' + f(4 * k + 0.6 * k * Math.sin(t * 9)) + ' ' + f(base[0]) + ' ' + f(base[1]) + ')">' + crane(t, o) + '</g>';
    var tp = jibPt(o, r, -14); return s + label(tp[0], tp[1], tp[0] - 30, tp[1] + 120, "يستحمل أقل", ORANGE, K(u, 1.8), 20);
  });
  // 13 — so a device weighs the load and the distance, and stops the crane if it's too much
  function lmi(load, rad, max, warn) { var over = load > max; return R(-110, -70, 220, 140, "#2b241d", 2.4, 10) + R(-98, -58, 196, 92, "#3a4a3e", 1.4, 4) +
      '<text x="-86" y="-28" style="font:700 20px DejaVu Sans Mono, monospace;fill:#bfe3c6;direction:ltr">LOAD ' + load.toFixed(1) + ' t</text><text x="-86" y="2" style="font:700 20px DejaVu Sans Mono, monospace;fill:#bfe3c6;direction:ltr">R    ' + rad.toFixed(0) + ' m</text>' +
      R(-86, 14, 172, 10, "#2b241d", 1, 3) + R(-86, 14, 172 * clamp(load / max), 10, over ? "#e0402a" : "#7fc0a0", 0, 3) + circ0(84, 50, 9, over && warn ? "#e0402a" : "#5a1a10") + circ0(-84, 50, 9, over ? "#2a4030" : "#7fc0a0"); }
  shot(13, mv(250, 380, 1.5, 260, 400, 1.4), function (u, d, t) {
    FULL(); var r = 14 + 24 * ease(K(u, 0.5, 2.0)), o = { cj: 1, cw: 4, apex: true, cab: true, trolley: r, load: 1.3, drop: 10 }, s = scene(t, o, 16), cab = P3([1.5, 1.5, 36]);
    var max = 10 * 14 / r, ld = 4.2, k = pop(K(u, 0.3, 0.6));
    s += label(cab[0], cab[1], 140, 180, "جهاز الحساب", PB, K(u, 0.4), 18);
    return s + fixed(G(150, 640, k, 0, lmi(ld, r, max, Math.sin(t * 8) > 0)));
  });
  // 14 — a crane that lifts 10 tonnes near the mast may only lift 2 at the end of the jib
  shot(14, mv(330, 460, 1.0, 340, 460, 1.0), function (u, d, t) {
    FULL(); var far = K(u, 1.6, 0.4) > 0, r = far ? 48 : 12, o = { cj: 1, cw: 4, apex: true, cab: true, trolley: r, load: far ? 0.75 : 1.9, drop: 14 }, s = scene(t, o, 16), tp = jibPt(o, r, -14);
    var a = jibPt({}, 12, -14), b = jibPt({}, 48, -14);
    return s + numBox("10 طن", a[0] - 70, a[1] + 50, K(u, 0.3, 0.5), 22) + numBox("2 طن", b[0] - 10, b[1] + 70, K(u, 1.8, 0.5), 22);
  });
  // 15 — but the wind up there is strong, and that long jib catches it like a sail
  shot(15, mv(330, 440, 1.0, 340, 420, 1.06), function (u, d, t) {
    FULL(); var o = { cj: 1, cw: 4, apex: true, cab: true, trolley: 10, load: 0, drop: 6, phi: -Math.PI / 4 + 0.05 * Math.sin(t * 3) }, s = scene(t, o, 16);
    s += wind(t, K(u, 0.2, 1.0), 300); var tp = jibPt(o, 40, 0);
    return s + label(tp[0], tp[1], tp[0] - 40, tp[1] - 120, "زي الشراع", ORANGE, K(u, 1.2), 20);
  });
  // 16 — so after work they release the brake and let the jib turn with the wind
  shot(16, mv(260, 560, 0.9, 250, 560, 0.85), function (u, d, t) {
    FULL(); var phi = -Math.PI / 4 - 1.6 * ease(K(u, 0.6, 2.4)) + 0.04 * Math.sin(t * 2), o = { cj: 1, cw: 4, apex: true, cab: true, trolley: 8, drop: 4, phi: phi }, s = scene(t, o, 16);
    s += wind(t, 1, 280); var rp = iso(0, 0, 37.4);
    s += G(rp[0] + 70, rp[1] + 30, pop(K(u, 0.3, 0.5)), 0, R(-48, -18, 96, 36, PAPER, 2, 6) + '<path d="M-34 8 a10 10 0 1 1 10 -12" stroke="' + OLIVE + '" stroke-width="3" fill="none"/>' + T("فرامل", 14, 7, 16, OLIVE, 800));
    return s + label(rp[0] + 20, rp[1] + 10, 470, 700, "بيلف مع الهوا", OLIVE, K(u, 1.6), 18);
  });
  // 17 — many people think the crane is put up full height from the start, as tall as the building
  shot(17, mv(250, 420, 0.85, 250, 430, 0.9), function (u, d, t) {
    isoAt(230, 700, 5.2); var o = { H: 60, cj: 1, cw: 4, apex: true, cab: true, trolley: 20, drop: 8 }, s = scene(t, o, 6.4);
    return s + crossMark(230, 300, 1.5, K(u, 1.6, 0.5)) + label(iso(1.2, 1.2, 50)[0], iso(1.2, 1.2, 50)[1], 450, 140, "من الأول؟", ORANGE, K(u, 0.4), 22);
  });
  // 18 — in fact it starts short, and as the building rises, it raises itself
  shot(18, mv(260, 480, 0.85, 260, 400, 0.78), function (u, d, t) {
    isoAt(230, 700, 5.2); var k = ease(K(u, 0.6, 3.2)), H = 21 + 3 * Math.floor(k * 10), o = { H: H, cj: 1, cw: 4, apex: true, cab: true, trolley: 18, load: 1, drop: 8 }, s = scene(t, o, 6.4 + k * 28.8);
    return s + label(iso(1.2, 1.2, H - 4)[0], iso(1.2, 1.2, H - 4)[1], 80, 300, "بيطوّل نفسه", OLIVE, K(u, 1.2), 20);
  });
  // 19 — a jack lifts the top part, and the crane picks up a new mast section and slides it in underneath
  shot(19, mv(240, 330, 1.7, 250, 360, 1.5), function (u, d, t) {
    isoAt(230, 700, 6.2); var gk = ease(K(u, 0.3, 1.6)), g = 3.05 * gk, ins = ease(K(u, 2.0, 1.6)), H = 30, phi = -Math.PI / 4, dd = [Math.cos(phi), Math.sin(phi)];
    var off = lerp(4.2, 0, ins), zz = H + 0.02, sec = "";
    var o = { H: H, g: g, climb: true, cj: 1, cw: 4, apex: true, cab: true, trolley: 4.2 - 4.2 * ins + 0.01, drop: 1.4 + g + 3.2, load: 0 };
    // the new 3 m section, hanging under the hook then slid into the gap
    var save = ISO; isoAt(ISO.ox + (dd[0] - dd[1]) * 0.866 * off * ISO.s, ISO.oy + ((dd[0] + dd[1]) * 0.5) * off * ISO.s, ISO.s); sec = mast(zz, zz + 3, 1.2, PB); ISO = save; isoAt(save.ox, save.oy, save.s);
    var s = paper() + ground() + foundation(1) + building(22, t) + crane(t, o) + sec;
    var jk = iso(1.7, 0, H - 3); return s + label(jk[0], jk[1], 470, 600, "المكبس", PB, K(u, 0.5), 20) + label(iso(off * dd[0], off * dd[1], H + 1.5)[0], iso(off * dd[0], off * dd[1], H + 1.5)[1], 460, 200, "حتة برج جديدة", PB, K(u, 2.0), 18);
  });
  // 20 — and when it gets really tall, they tie it to the building so it doesn't sway
  shot(20, mv(260, 380, 0.82, 280, 360, 0.86), function (u, d, t) {
    isoAt(230, 720, 5.2); var o = { H: 48, cj: 1, cw: 4, apex: true, cab: true, trolley: 22, load: 1, drop: 8, ties: K(u, 0.4, 0.2) > 0 }, s = scene(t, o, 44.8);
    var p = iso(6, -6, 30); return s + label(p[0], p[1], 520, 260, "رباط في العمارة", PB, K(u, 0.8), 18);
  });
  // 21 — add a cab for the driver, a ladder inside the mast, and a red light on top for planes
  shot(21, mv(250, 330, 1.4, 260, 330, 1.25), function (u, d, t) {
    FULL(); var o = { cj: 1, cw: 4, apex: true, cab: K(u, 0.2, 0.1) > 0, ladder: K(u, 1.0, 0.1) > 0, light: K(u, 1.8, 0.1) > 0, trolley: 24, load: 1, drop: 10 }, s = scene(t, o, 16);
    var cab = P3([1.5, 1.5, 36]), ld = iso(1.2, 1.2, 20), lt = iso(0, 0, 46);
    return s + label(cab[0], cab[1], 120, 240, "الكابينة", OLIVE, K(u, 0.3), 18) + label(ld[0], ld[1], 110, 520, "السلم", OLIVE, K(u, 1.1), 18) + label(lt[0], lt[1], 400, 150, "لمبة للطيارات", ORANGE, K(u, 1.9), 18);
  });
  // 22 — and congratulations: you've built a tower crane
  shot(22, mv(300, 400, 1.15, 330, 450, 0.88), function (u, d, t) {
    FULL(); var phi = -Math.PI / 4 + 0.5 * Math.sin(t * 0.5), r = 26 + 14 * Math.sin(t * 0.7), o = { cj: 1, cw: 4, apex: true, cab: true, ladder: true, light: true, ties: false, trolley: r, load: 1.2, drop: 12, phi: phi };
    return scene(t, o, 19.2);
  });
  // 23 is the summary card; keep the panel valid behind it
  shot(23, mv(330, 450, 0.88, 330, 450, 0.88), function (u, d, t) { FULL(); return scene(t, { cj: 1, cw: 4, apex: true, cab: true, trolley: 26, load: 1, drop: 12 }, 19.2); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__outro = function (svg, u, t) {
    isoAt(170, 288, 3.6); var o = { cj: 1, cw: 4, apex: true, cab: true, ladder: true, light: true, trolley: 26 + 8 * Math.sin(t * 0.8), load: 1.2, drop: 12, phi: -Math.PI / 4 + 0.15 * Math.sin(t * 0.6) };
    var s = '<rect width="580" height="300" fill="#e4d9bf"/>' + ground() + foundation(1) + building(16, t) + crane(t, o);
    var pts = [[iso(3.5, 3.5, 0), "1"], [iso(1.2, 1.2, 14), "2"], [jibPt(o, 36, 1), "3"], [P3([-9, 9, 34]), "4"], [iso(0, 0, 37.4), "5"], [P3([1.5, 1.5, 36]), "6"]];
    pts.forEach(function (c, i) { s += callout(c[1], c[0][0] + 18, c[0][1] - 14, (u - 0.3 - i * 0.15) / 0.6); });
    s += '<rect width="580" height="300" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    svg.style.transform = 'scale(' + f(1 + 0.03 * Math.sin(t * 1.4)) + ')';
    svg.innerHTML = s;
  };
  window.__parts = { crane: crane, scene: scene, building: building, ground: ground, foundation: foundation, mast: mast, jibPt: jibPt, label: label, T: T, TS: TS, numBox: numBox, callout: callout, isoAt: isoAt, iso: iso };
})();
