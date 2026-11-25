/* «تعمل بيت للجراوي إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One room of a house cut open (r09), its tiled floor seen a little from above, the soil under the slab. A mother dog
   (an Egyptian «بلدي», sandy with a white chest) and six newborn puppies: a soggy cardboard box becomes a plywood whelping
   box that grows line by line (heat lamp, tight cloth, the rail, bowls outside, the kitchen scale, the pen, newspapers, the
   first mush). The man (the shared person kit) acts out and reacts to every line.
   Floor coordinates: x across, z into the room (0 = the cut front edge), h up; W(x, z, h) gives the screen point. */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var pill = K.pill, xmark = K.xmark, vmark = K.vmark, ring = K.ring, has = K.has;
  // framing: every shot a little wider than written so the man stays in the frame beside the box
  var shot = function (line, c0, c1, fn) { K.shot(line, [c0[0], c0[1], c0[2] * 0.88], [c1[0], c1[1], c1[2] * 0.88], fn); };
  var FY = K.GY, ZX = 0.55, ZY = 0.9, ZB = 240, CEIL = 560;
  function W(x, z, h) { return [x + z * ZX, FY - z * ZY - (h || 0)]; }
  function M(p) { return f(p[0]) + " " + f(p[1]); }
  function quad(a, b, c, d, fill, o) { return F("M" + M(a) + " L" + M(b) + " L" + M(c) + " L" + M(d) + " Z", fill, o); }
  // a wall standing on the floor from (xa, za) to (xb, zb), h high
  function wallQ(xa, za, xb, zb, h, fill, o) { return quad(W(xa, za, 0), W(xb, zb, 0), W(xb, zb, h), W(xa, za, h), fill, o); }
  function cube(x, z, w, d, h, front, top, side) {
    return quad(W(x + w, z, 0), W(x + w, z + d, 0), W(x + w, z + d, h), W(x + w, z, h), side) + quad(W(x, z, h), W(x + w, z, h), W(x + w, z + d, h), W(x, z + d, h), top) + quad(W(x, z, 0), W(x + w, z, 0), W(x + w, z, h), W(x, z, h), front);
  }
  var act = function (u, Ks, t) { return K.act(u, Ks, t); };

  // ── the house: sky, the roof, the back wall with a window, the left wall, the tiled floor, the slab cut ──
  function room(t, o) {
    var s = K.sky(t) + K.palm(-80, t, 1.1) + K.palm(1180, t, 1.0) + K.ground(t), bw0 = W(40, ZB, 0), bw1 = W(1060, ZB, 0);
    // roof over the cut house (r09): a slab and a parapet
    s += '<g filter="url(#sh)">' + R(10, bw0[1] - CEIL - 46, 1200, 46, "url(#conc)") + '</g>' + R(10, bw0[1] - CEIL - 76, 26, 30, "url(#conc)", { sw: 2 }) + R(1184, bw0[1] - CEIL - 76, 26, 30, "url(#conc)", { sw: 2 });
    // back wall: plaster above, a pale tiled band below
    s += R(bw0[0], bw0[1] - CEIL, bw1[0] - bw0[0], CEIL, "url(#wallIn)") + R(bw0[0], bw0[1] - 150, bw1[0] - bw0[0], 150, "#e6efef", { sw: 2 });
    for (var tx = bw0[0] + 60; tx < bw1[0]; tx += 60) s += P("M" + f(tx) + " " + f(bw0[1] - 150) + " V" + f(bw0[1]), "#c4d2d2", 2);
    s += P("M" + f(bw0[0]) + " " + f(bw0[1] - 75) + " H" + f(bw1[0]), "#c4d2d2", 2);
    // window with the sky and a palm behind
    var wx = 770, wy = bw0[1] - 420;
    s += R(wx - 10, wy - 10, 200, 200, "#f4efe4", { sw: 3 }) + R(wx, wy, 180, 180, "#a9cde6", { sw: 2 }) + C(wx + 140, wy + 40, 26, "#fff6d8", { op: 0.8 }) + P("M" + (wx + 90) + " " + wy + " V" + (wy + 180) + " M" + wx + " " + (wy + 90) + " H" + (wx + 180), "#f4efe4", 8) + R(wx - 18, wy + 186, 216, 14, "#e2dccd", { sw: 2 });
    // a framed photo
    s += R(420, bw0[1] - 400, 110, 80, "#8a5a30", { sw: 3 }) + R(430, bw0[1] - 390, 90, 60, "#bcd8a8", { sw: 1.5 }) + C(460, bw0[1] - 360, 12, "#d9a45a", { st: INK, sw: 1.5 });
    // left wall (inner face) and its cut edge
    s += quad(W(40, 0, 0), W(40, ZB, 0), W(40, ZB, CEIL), W(40, 0, CEIL), "#e2d6bf") + quad(W(40, 0, 0), W(40, ZB, 0), W(40, ZB, 150), W(40, 0, 150), "#dbe6e6", { sw: 2 });
    s += R(16, FY - CEIL, 26, CEIL + 4, "url(#wallCut)");
    // tiled floor
    s += quad(W(40, 0, 0), W(1060, 0, 0), W(1060, ZB, 0), W(40, ZB, 0), "url(#tile)");
    var g = ""; for (var x = 40; x <= 1060; x += 80) g += "M" + M(W(x, 0, 0)) + " L" + M(W(x, ZB, 0)) + " ";
    for (var z = 0; z <= ZB; z += 60) g += "M" + M(W(40, z, 0)) + " L" + M(W(1060, z, 0)) + " ";
    s += P(g, "#bdb6a6", 2);
    if (o.cold) s += '<ellipse cx="' + f(o.cold[0]) + '" cy="' + f(o.cold[1]) + '" rx="' + f(80 * o.coldK) + '" ry="' + f(34 * o.coldK) + '" fill="url(#cold)"/>';
    // slab cut under the floor
    s += R(16, FY, 1210, 40, "url(#conc)");
    return s;
  }
  // a washing machine at the back left (it shakes when on)
  function washer(t, on) {
    var j = on ? Math.sin(t * 40) * 2 : 0, s = '<g transform="translate(' + f(j) + ' 0)" filter="url(#sh)">' + cube(66, 150, 120, 80, 170, "url(#washer)", "#f6f7f8", "#c9ced3");
    var c = W(126, 150, 82); s += C(c[0], c[1], 40, "#d7dde3", { st: INK, sw: 3 }) + C(c[0], c[1], 28, on ? "#6aa8d8" : "#9ab6cc", { st: INK, sw: 2.4 });
    if (on) for (var k = 0; k < 3; k++) s += P("M" + f(c[0] - 18 + k * 12) + " " + f(c[1] + 8 - Math.sin(t * 8 + k) * 6) + " q6 -6 12 0", "#fff", 3);
    var p = W(70, 150, 150); s += R(p[0] + 4, p[1], 112, 16, "#cfd4d9", { sw: 2 }) + C(p[0] + 96, p[1] + 8, 5, on ? "#5ad07a" : "#8a9098");
    s += '</g>';
    if (on) for (var w = 0; w < 3; w++) { var q = (t * 1.2 + w / 3) % 1; s += P("M" + f(W(196, 190, 100)[0] + 10 + q * 40) + " " + f(W(196, 190, 120)[1] - 20) + " q10 20 0 40", "#7a8088", 3, ' opacity="' + f(1 - q) + '"'); }
    return s;
  }

  // ── the mother dog: an Egyptian «بلدي», sandy fur, white chest and muzzle, curled tail. Local units, facing left. ──
  function dog(x, y, o) {
    o = o || {}; var s = o.s || 0.95, fc = o.f || 1, t = o.t || 0, p = o.pose || "lie", g = "", br = Math.sin(t * 1.8) * 2;
    var tr = 'translate(' + f(x) + ' ' + f(y) + ') scale(' + f(-fc * s) + ' ' + f(s) + ')';
    if (p === "lie") {
      var hu = o.headUp || 0, hy = lerp(-30, -74, hu), hx = lerp(-126, -112, hu), roll = o.roll || 0;
      // far legs (tucked), tail, body, near legs stretched toward the viewer
      g += F("M86 -20 Q130 -60 150 -30 Q156 -14 140 -12 Q132 -40 96 -6 Z", "url(#furD)");
      g += F("M-96 -26 C-104 -70 -40 -" + f(78 + br) + " 30 -" + f(72 + br) + " C96 -68 116 -34 98 -4 C70 18 -60 20 -96 -6 Z", "url(#fur)");
      g += F("M-60 4 C-20 18 40 18 80 4 C40 12 -20 12 -60 4 Z", "#f6e6c8", { sw: 2 });
      for (var n = 0; n < 5; n++) g += C(-40 + n * 24, 10, 3.2, "#e8a0a0", { st: INK, sw: 1 });
      g += F("M60 -2 C78 10 96 22 118 26 L122 34 L96 34 C76 26 58 16 52 6 Z", "url(#fur)") + F("M38 2 C52 14 70 26 88 32 L90 40 L64 38 C50 30 36 18 32 8 Z", "url(#fur)");
      g += F("M-70 -4 C-84 10 -98 22 -112 28 L-114 36 L-92 36 C-80 28 -66 14 -60 4 Z", "url(#fur)") + F("M-50 0 C-62 14 -74 26 -84 34 L-84 42 L-62 40 C-54 30 -44 16 -40 6 Z", "url(#fur)");
      // neck and head
      g += F("M-88 -40 C-104 -50 " + f(hx + 10) + " " + f(hy - 18) + " " + f(hx + 18) + " " + f(hy - 10) + " C" + f(hx + 24) + " " + f(hy + 20) + " -96 -4 -86 -6 Z", "url(#fur)");
      g += head(hx, hy, o, t);
    } else {
      // standing / drinking / stepping: legs straight down to y = 0, the hind leg with a hock
      var dr = p === "drink" ? 1 : 0, st = o.step || 0, walk = o.walk ? Math.sin(t * 7) : 0;
      g += F("M88 -116 Q120 -170 100 -186 Q84 -194 82 -170 Q96 -160 80 -124 Z", "url(#furD)");
      g += F("M84 -110 L" + f(92 - walk * 10) + " -50 L" + f(80 - walk * 10) + " -24 L" + f(84 - walk * 12) + " 0 L" + f(70 - walk * 12) + " 0 L" + f(66 - walk * 10) + " -26 L70 -96 Z", "url(#furD)");
      g += F("M-70 -100 L" + f(-74 + walk * 10) + " " + f(-36 - st * 30) + " L" + f(-78 + walk * 10) + " " + f(0 - st * 40) + " L" + f(-64 + walk * 10) + " " + f(0 - st * 40) + " L-56 -98 Z", "url(#furD)");
      g += F("M-96 -110 C-104 -150 -40 -" + f(156 + br) + " 30 -" + f(150 + br) + " C94 -150 110 -126 100 -100 C90 -82 40 -78 -10 -80 C-60 -80 -92 -88 -96 -110 Z", "url(#fur)");
      g += F("M-60 -82 C-20 -76 30 -76 70 -86 C40 -80 -20 -80 -60 -82 Z", "#f6e6c8", { sw: 2 });
      g += F("M60 -104 L" + f(70 + walk * 10) + " -50 L" + f(58 + walk * 10) + " -24 L" + f(62 + walk * 12) + " 0 L" + f(46 + walk * 12) + " 0 L" + f(44 + walk * 10) + " -26 L46 -96 Z", "url(#fur)");
      g += F("M-84 -104 L" + f(-90 - walk * 10) + " -40 L" + f(-92 - walk * 10) + " 0 L" + f(-76 - walk * 10) + " 0 L-70 -100 Z", "url(#fur)");
      var hx2 = dr ? -132 : -118, hy2 = dr ? -34 : -172;
      g += F("M-86 -128 C-100 -136 " + f(hx2 + 6) + " " + f(hy2 - 10) + " " + f(hx2 + 18) + " " + f(hy2 - 6) + " C" + f(hx2 + 26) + " " + f(hy2 + 22) + " -100 -96 -86 -100 Z", "url(#fur)");
      g += F("M-96 -120 C-104 -104 -100 -94 -88 -96 C-92 -104 -92 -112 -96 -120 Z", "#f6e6c8", { sw: 1.6 });
      g += head(hx2, hy2, o, t);
    }
    return '<g transform="' + tr + '" filter="url(#sh)">' + g + '</g>';
  }
  function head(hx, hy, o, t) {
    var g = "", mood = o.mood || "n";
    g += '<ellipse cx="' + f(hx) + '" cy="' + f(hy) + '" rx="30" ry="25" fill="url(#fur)" stroke="' + INK + '" stroke-width="3"/>';
    g += F("M" + f(hx - 20) + " " + f(hy - 6) + " L" + f(hx - 50) + " " + f(hy + 2) + " Q" + f(hx - 56) + " " + f(hy + 12) + " " + f(hx - 46) + " " + f(hy + 16) + " L" + f(hx - 16) + " " + f(hy + 18) + " Z", "#f6e6c8");
    g += '<ellipse cx="' + f(hx - 52) + '" cy="' + f(hy + 4) + '" rx="7" ry="5.5" fill="#2a1a12"/>';
    g += P("M" + f(hx - 44) + " " + f(hy + 15) + " q8 4 16 0", INK, 2.2);
    // a tall Baladi ear, tipped forward
    g += F("M" + f(hx + 4) + " " + f(hy - 18) + " L" + f(hx + 2) + " " + f(hy - 54) + " Q" + f(hx - 4) + " " + f(hy - 50) + " " + f(hx - 12) + " " + f(hy - 40) + " L" + f(hx - 10) + " " + f(hy - 18) + " Z", "url(#furD)");
    var ey = hy - 6, ex = hx - 16;
    if (mood === "sleep") g += P("M" + f(ex - 6) + " " + f(ey) + " q6 5 12 0", INK, 2.6);
    else if (mood === "annoyed") g += P("M" + f(ex - 7) + " " + f(ey - 2) + " h14", INK, 3) + P("M" + f(ex - 8) + " " + f(ey - 12) + " l14 5", INK, 3);
    else g += C(ex, ey, 5.5, "#2a1a12") + C(ex - 1.5, ey - 2, 1.8, "#fff");
    if (mood === "growl") g += P("M" + f(hx - 46) + " " + f(hy + 12) + " l4 4 l4 -4 l4 4", "#fff", 2.4);
    return g;
  }
  // a newborn puppy seen from the side, facing +x before rotation; age 0…1 grows it and opens the eyes
  var PUPC = ["#e8c48a", "#3a2a22", "#c98a4a", "#f2e2c4", "#7a4a2a", "#d9a45a"];
  function pup(x, y, i, t, o) {
    o = o || {}; var age = o.age || 0, s = (o.s || 1) * lerp(1, 1.55, age), col = PUPC[i % 6], rot = o.rot || 0, w = o.wig == null ? 1 : o.wig, ph = t * 6 + i * 1.7;
    var wig = Math.sin(ph) * 6 * w, g = "";
    if (o.cold) g += C(0, 0, 40 * o.cold, "url(#cold)");
    if (o.warm) g += C(0, 0, 40 * o.warm, "url(#glow)");
    var lg = function (lx, a) { return P("M" + lx + " 6 l" + f(Math.sin(ph + a) * 5 * w) + " " + f(10 + age * 8), INK, 8) + P("M" + lx + " 6 l" + f(Math.sin(ph + a) * 5 * w) + " " + f(10 + age * 8), col, 5); };
    g += lg(-12, 0) + lg(10, 2);
    g += P("M-20 -2 q-8 -4 -10 -10", INK, 4) + '<ellipse cx="0" cy="0" rx="21" ry="' + f(12 + age * 2) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/>';
    g += lg(-6, 1) + lg(15, 3);
    g += '<g transform="rotate(' + f(wig * 0.6) + ' 16 -2)"><circle cx="22" cy="-3" r="' + f(11 + age * 1) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="32" cy="0" rx="6" ry="4.6" fill="' + (i % 6 === 1 ? "#5a4a40" : "#f6e6c8") + '" stroke="' + INK + '" stroke-width="1.8"/><circle cx="37" cy="-1" r="2.2" fill="#2a1a12"/>';
    g += F("M14 -10 Q10 4 18 6 Q22 -2 20 -10 Z", i % 6 === 1 ? "#2a1a12" : "#a8743a", { sw: 1.6 });
    g += age > 0.5 ? C(27, -6, 2.6, "#2a1a12") + C(26.3, -6.8, 0.9, "#fff") : P("M24 -6 q3 2 6 0", INK, 1.8);
    if (o.cry) g += F("M34 6 q4 3 0 6 q-3 -3 0 -6 Z", "#5a1a14", { sw: 1 });
    g += '</g>';
    if (o.cold) g += P("M-10 -24 l4 -6 M0 -26 v-8 M10 -24 l-4 -6", "#5fb0e6", 3, ' opacity="' + f(o.cold) + '"');
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + f(s) + ')">' + g + '</g>';
  }
  // the litter nursing at the mother's belly (mother lying at mx, my, facing left), n pups, k = how settled
  function nursing(mx, my, t, o) {
    o = o || {}; var s = "", n = o.n == null ? 6 : o.n;
    for (var i = 0; i < n; i++) { if (o.skip === i) continue; var px = mx - 54 + i * 22, py = my + 26 + (i % 2) * 6;
      s += pup(px, py, i, t, { rot: -64 + (i % 3) * 10, wig: 0.5, age: o.age, s: 1 }); }
    return s;
  }

  // ── the boxes: the cardboard one (soggy 0…1) and the plywood whelping box (k grows the walls), drawn back then front ──
  var BX0 = 330, BX1 = 650, BZ0 = 20, BZ1 = 215, BH = 82;
  var CX0 = 380, CX1 = 610, CZ0 = 46, CZ1 = 196, CH = 62;
  function cardBack(o) {
    var wet = o.wet || 0, s = quad(W(CX0, CZ0, 0), W(CX1, CZ0, 0), W(CX1, CZ1, 0), W(CX0, CZ1, 0), "url(#cardIn)");
    s += wallQ(CX0, CZ1, CX1, CZ1, CH, "url(#card)") + wallQ(CX0, CZ0, CX0, CZ1, CH, "#b8894e");
    // flaps open outward
    var a = W(CX0, CZ1, CH), b = W(CX1, CZ1, CH); s += F("M" + M(a) + " L" + M(b) + " L" + f(b[0] + 10) + " " + f(b[1] - 46) + " L" + f(a[0] + 10) + " " + f(a[1] - 46) + " Z", "#c9995c");
    if (wet) s += wetSpots(wet, CX0, CZ0, 0);
    return s;
  }
  function cardFront(o) {
    var wet = o.wet || 0, sag = wet * 18, s = "";
    s += quad(W(CX1, CZ0, 0), W(CX1, CZ1, 0), W(CX1, CZ1, CH), W(CX1, CZ0, CH - sag * 0.5), "url(#card)");
    s += F("M" + M(W(CX0, CZ0, 0)) + " L" + M(W(CX1, CZ0, 0)) + " L" + M(W(CX1, CZ0, CH - sag * 0.5)) + " Q" + M(W((CX0 + CX1) / 2, CZ0, CH - sag * 2)) + " " + M(W(CX0, CZ0, CH - sag)) + " Z", "url(#card)", { op: 0.92 });
    var a = W(CX0, CZ0, CH - sag), b = W(CX1, CZ0, CH - sag * 0.5);
    s += F("M" + M(a) + " L" + M(b) + " L" + f(b[0] - 6) + " " + f(b[1] + 40) + " L" + f(a[0] - 6) + " " + f(a[1] + 40) + " Z", "#c9995c", { op: 0.95 });
    s += P("M" + M(W(CX0 + 40, CZ0, 30)) + " h60 M" + M(W(CX0 + 50, CZ0, 22)) + " h40", "#8a5a30", 3, ' opacity=".6"');
    if (wet) s += wetSpots(wet, CX0, CZ0, 1);
    return s;
  }
  function wetSpots(k, x0, z0, front) { var s = ""; for (var i = 0; i < 5; i++) { var c = W(x0 + 30 + i * 45, front ? z0 : z0 + 60 + (i % 2) * 40, front ? 10 + (i % 3) * 14 : 0); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(22 * k) + '" ry="' + f(12 * k) + '" fill="#6a4320" opacity="' + f(0.55 * k) + '"/>'; } return s; }
  function plank(xa, za, xb, zb, h, fill) {
    var s = wallQ(xa, za, xb, zb, h, fill), g = "";
    for (var k = 1; k < 3; k++) g += "M" + M(W(xa, za, h * k / 3)) + " L" + M(W(xb, zb, h * k / 3)) + " ";
    return s + P(g, "#a8743a", 2, ' opacity=".55"') + P("M" + M(W(xa, za, h)) + " L" + M(W(xb, zb, h)), "#f4dcae", 5) + P("M" + M(W(xa, za, h)) + " L" + M(W(xb, zb, h)), INK, 1.5);
  }
  function boxBack(o) {
    var k = o.k == null ? 1 : ease(o.k), h = BH * k, s = "";
    s += quad(W(BX0, BZ0, 0), W(BX1, BZ0, 0), W(BX1, BZ1, 0), W(BX0, BZ1, 0), "url(#plyIn)");
    if (o.cloth) { var ck = clamp(o.cloth), xe = lerp(BX0 + 4, BX1 - 4, ck); s += quad(W(BX0 + 4, BZ0 + 4, 0), W(xe, BZ0 + 4, 0), W(xe, BZ1 - 4, 0), W(BX0 + 4, BZ1 - 4, 0), "url(#cloth)", { sw: 2 });
      for (var d = 0; d < 26; d++) { var dx = BX0 + 20 + (d % 13) * 24, dz = BZ0 + 30 + Math.floor(d / 13) * 90 + (d % 2) * 40; if (dx < xe - 6) { var c = W(dx, dz, 0); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="5" ry="3" fill="#fff" opacity=".8"/>'; } }
      if (ck < 1) s += P("M" + M(W(xe, BZ0 + 4, 0)) + " L" + M(W(xe, BZ1 - 4, 0)), "#5a9a66", 6); }
    if (h > 0.5) s += plank(BX0, BZ1, BX1, BZ1, h, "url(#plyIn)") + plank(BX0, BZ0, BX0, BZ1, h, "#d6ab70");
    if (o.rail) { var rk = clamp(o.rail), xr = lerp(BX0, BX1, ease(rk)), r0 = W(BX0, BZ1 - 16, 20), r1 = W(xr, BZ1 - 16, 20);
      s += quad(W(BX0, BZ1 - 16, 20), W(xr, BZ1 - 16, 20), W(xr, BZ1 - 16, 36), W(BX0, BZ1 - 16, 36), "url(#ply)", { sw: 2.4 });
      for (var bx = BX0 + 60; bx < xr; bx += 120) s += quad(W(bx, BZ1 - 16, 20), W(bx + 10, BZ1 - 16, 20), W(bx + 10, BZ1, 36), W(bx, BZ1, 36), "#b07e3e", { sw: 1.6 });
      s += P("M" + M(r0) + " L" + M(r1), "#f4dcae", 3); }
    return s;
  }
  function boxFront(o) {
    var k = o.k == null ? 1 : ease(o.k), h = BH * k, s = "";
    if (h < 0.5) return s;
    s += plank(BX1, BZ0, BX1, BZ1, h, "url(#ply)");
    // the front wall is cut open (r08/r14 style): a see-through panel with solid edges
    s += wallQ(BX0, BZ0, BX1, BZ0, h, "#ecc994", { op: 0.28, sw: 2 }) + P("M" + M(W(BX0, BZ0, h)) + " L" + M(W(BX1, BZ0, h)), "#f4dcae", 6) + P("M" + M(W(BX0, BZ0, h)) + " L" + M(W(BX1, BZ0, h)) + " M" + M(W(BX0, BZ0, 0)) + " L" + M(W(BX1, BZ0, 0)), INK, 2);
    s += P("M" + M(W(BX0, BZ0, 0)) + " L" + M(W(BX0, BZ0, h)) + " M" + M(W(BX1, BZ0, 0)) + " L" + M(W(BX1, BZ0, h)), INK, 3);
    return s;
  }
  // the heat lamp: a floor stand behind the back-left corner, its reflector hanging over that corner (drop 0…1 lowers it)
  function lamp(t, o) {
    var dk = o.drop == null ? 1 : ease(o.drop), base = W(300, 232, 0), top = W(300, 232, 330), hd = W(410, 168, lerp(400, 190, dk)), s = "";
    if (o.glow) { var gp = W(410, 168, 0); s += '<ellipse cx="' + f(gp[0]) + '" cy="' + f(gp[1]) + '" rx="' + f(120 * o.glow) + '" ry="' + f(60 * o.glow) + '" fill="url(#glow)"/>'; }
    s += '<ellipse cx="' + f(base[0]) + '" cy="' + f(base[1]) + '" rx="34" ry="12" fill="#4a5058" stroke="' + INK + '" stroke-width="2.4"/>';
    s += P("M" + M(base) + " L" + M(top), INK, 10) + P("M" + M(base) + " L" + M(top), "url(#steel)", 6);
    s += P("M" + M(top) + " Q" + f(hd[0]) + " " + f(top[1] - 30) + " " + f(hd[0]) + " " + f(hd[1] - 30), INK, 4);
    s += '<g filter="url(#sh)">' + F("M" + f(hd[0] - 34) + " " + f(hd[1]) + " Q" + f(hd[0]) + " " + f(hd[1] - 46) + " " + f(hd[0] + 34) + " " + f(hd[1]) + " Z", "url(#steel)") + '</g>';
    if (o.glow) s += '<ellipse cx="' + f(hd[0]) + '" cy="' + f(hd[1]) + '" rx="22" ry="8" fill="#ff7a2a"/>' + '<path d="M' + f(hd[0] - 30) + ' ' + f(hd[1]) + ' L' + f(hd[0] - 90) + ' ' + f(W(410, 168, 0)[1]) + ' L' + f(hd[0] + 90) + ' ' + f(W(410, 168, 0)[1]) + ' L' + f(hd[0] + 30) + ' ' + f(hd[1]) + ' Z" fill="#ffb04a" opacity="' + f(0.16 * o.glow) + '"/>';
    return s;
  }
  // bowls: water (and food) — inside the box near the front right, or outside to the right
  function bowl(x, z, kind, t, o) {
    o = o || {}; var c = W(x, z, 0), s = '<g filter="url(#sh)"><ellipse cx="' + f(c[0]) + '" cy="' + f(c[1] - 10) + '" rx="40" ry="18" fill="url(#steel)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1] - 18) + '" rx="32" ry="11" fill="' + (kind === "food" ? "#9a5a2a" : kind === "mush" ? "#b8875a" : "#5fb0e6") + '" stroke="' + INK + '" stroke-width="2"/>';
    if (kind === "food") for (var k = 0; k < 8; k++) s += C(c[0] - 22 + k * 6, c[1] - 20 + (k % 2) * 4, 3.4, "#6a3a1a");
    if (kind === "water") s += P("M" + f(c[0] - 18) + " " + f(c[1] - 20) + " q9 " + f(-3 + Math.sin(t * 3)) + " 18 0", "#fff", 2, ' opacity=".7"');
    if (o.splash) for (var d = 0; d < 6; d++) { var a = d / 6 * Math.PI * 2, r = 20 + 30 * o.splash; s += C(c[0] + Math.cos(a) * r, c[1] - 24 - Math.abs(Math.sin(a)) * r * 0.8, 5, "#5fb0e6", { op: 1 - o.splash }); }
    return s + '</g>';
  }
  // the kitchen scale on a low stool at the box's left front, showing grams
  function scale(t, o) {
    var s = '<g filter="url(#sh)">' + cube(110, 6, 92, 70, 110, "#b07e3e", "#d6ab70", "#8a5a30") + '</g>', p = W(118, 22, 110);
    s += '<g filter="url(#sh)">' + quad(W(120, 14, 110), W(192, 14, 110), W(192, 64, 110), W(120, 64, 110), "#f2f4f6") + R(p[0] + 4, p[1] - 6, 70, 22, "#e9ecef", { rx: 6 }) + '</g>';
    s += R(p[0] + 14, p[1] - 2, 48, 15, "#173a2a", { rx: 3, sw: 1.5 }) + T(o.txt || "0 g", p[0] + 38, p[1] + 10, 11, o.bad ? "#ff7a6a" : "#7cf2a0", { w: 800 });
    return s;
  }
  // the pen: wire panels around the box (k raises them), newspapers at its far end
  var GX0 = 270, GX1 = 900, GZ0 = 4, GZ1 = 236, GH = 116;
  function fenceSide(xa, za, xb, zb, h) {
    var s = "", n = Math.round(Math.hypot(xb - xa, zb - za) / 26);
    for (var i = 0; i <= n; i++) { var x = lerp(xa, xb, i / n), z = lerp(za, zb, i / n); s += P("M" + M(W(x, z, 0)) + " L" + M(W(x, z, h)), "#5a6068", 3.4); }
    s += P("M" + M(W(xa, za, h)) + " L" + M(W(xb, zb, h)) + " M" + M(W(xa, za, h * 0.08)) + " L" + M(W(xb, zb, h * 0.08)), "#3a4048", 5);
    return s;
  }
  function penBack(k) { if (k <= 0) return ""; var h = GH * ease(k); return fenceSide(GX0, GZ1, GX1, GZ1, h) + fenceSide(GX0, GZ0, GX0, GZ1, h); }
  function penFront(k) { if (k <= 0) return ""; var h = GH * ease(k); return fenceSide(GX1, GZ0, GX1, GZ1, h) + fenceSide(GX0, GZ0, GX1, GZ0, h); }
  function papers(k) { if (k <= 0) return ""; var s = "", xe = lerp(780, 670, ease(k));
    s += quad(W(xe, 14, 0), W(890, 14, 0), W(890, 226, 0), W(xe, 226, 0), "#e9e6dc", { sw: 2 });
    var g = ""; for (var z = 30; z < 220; z += 18) g += "M" + M(W(xe + 14, z, 0)) + " L" + M(W(xe + 14 + (z % 36 ? 140 : 90), z, 0)) + " ";
    return s + P(g, "#9a968c", 2.4) + P("M" + M(W(780, 14, 0)) + " L" + M(W(780, 226, 0)), "#c8c4b8", 3); }
  function toys(t) { var a = W(760, 120, 0), b = W(700, 60, 0); return '<g filter="url(#sh)">' + C(a[0], a[1] - 14, 15, "#e8452e", { st: INK, sw: 3 }) + P("M" + f(a[0] - 10) + " " + f(a[1] - 22) + " q10 8 20 0", "#fff", 3) + P("M" + f(b[0] - 30) + " " + f(b[1] - 8) + " q15 -12 30 0 q15 12 30 0", "#3a7fd0", 9) + C(b[0] - 32, b[1] - 8, 8, "#3a7fd0", { st: INK, sw: 2 }) + C(b[0] + 32, b[1] - 8, 8, "#3a7fd0", { st: INK, sw: 2 }) + '</g>'; }
  function puddle(x, z, k) { if (k <= 0) return ""; var c = W(x, z, 0); return '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(20 * k) + '" ry="' + f(8 * k) + '" fill="#e8d25a" stroke="#b8a23a" stroke-width="2" opacity=".85"/>'; }
  function syringe(x, y, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(-30) scale(' + f(K.pop(k)) + ')" filter="url(#sh)">' + R(-40, -10, 70, 20, "#eef6fb", { rx: 4 }) + R(-30, -6, 40, 12, "#7ac8ff", { sw: 0 }) + R(30, -3, 26, 6, "#b9c1c9", { sw: 1.5 }) + R(-56, -14, 16, 28, "#3a7fd0", { rx: 3 }) + '</g>'; }
  function blanket(t, k, lump) { if (k <= 0) return ""; var a = W(470, 30, 0), b = W(640, 120, 0), c2 = W(560, 205, 0), lx = W(lerp(520, 590, lump || 0), lerp(80, 120, lump || 0), 0), s = "";
    s += F("M" + M(W(450, 26, 0)) + " Q" + M(W(560, 10, 26)) + " " + M(W(646, 30, 4)) + " L" + M(W(646, 200, 4)) + " Q" + M(W(560, 214, 20)) + " " + M(W(470, 200, 6)) + " Z", "url(#blanket)", { op: clamp(k) });
    if (lump != null) s += '<ellipse cx="' + f(lx[0]) + '" cy="' + f(lx[1] - 14 - Math.abs(Math.sin(t * 6)) * 4) + '" rx="28" ry="16" fill="url(#blanket)" stroke="' + INK + '" stroke-width="2.4" opacity="' + f(clamp(k)) + '"/>';
    return s; }

  // mother positions (screen): lying in the box along the back wall, head to the left
  var MOM = W(500, 150, 0), MOMR = W(500, 178, 0);
  // ── the whole room for a line: b = the build so far, h = what this moment adds ──
  function scene(t, o, h) {
    o = o || {}; h = h || {}; var b = has(o), s = room(t, { cold: h.coldAt, coldK: h.coldK || 0 }) + washer(t, h.wash);
    var penK = h.pen != null ? h.pen : (b.pen ? 1 : 0);
    s += penBack(penK);
    if (b.lamp || h.lamp != null) s += lamp(t, { drop: h.lamp == null ? 1 : h.lamp, glow: h.glow == null ? 1 : h.glow });
    if (b.papers || h.papers != null) s += papers(h.papers == null ? 1 : h.papers);
    if (b.bowlsOut || h.bowlsOut != null) { var bo = h.bowlsOut == null ? 1 : ease(h.bowlsOut); s += bowl(lerp(590, 950, bo), lerp(60, 70, bo), "water", t) + (bo > 0.2 ? bowl(1000, 150, "food", t) : ""); }
    if (h.scale) s += scale(t, h.sc || {});
    var ca = h.card != null ? h.card : (b.box ? 0 : 1); if (ca > 0) s += '<g opacity="' + f(ca) + '">' + cardBack({ wet: h.wet }) + '</g>';
    if (b.box || h.box != null) s += boxBack({ k: h.box == null ? 1 : h.box, cloth: h.cloth != null ? h.cloth : b.cloth, rail: h.rail != null ? h.rail : b.rail });
    return s;
  }
  function front(t, o, h) {
    o = o || {}; h = h || {}; var b = has(o), s = "";
    if (b.box || h.box != null) s += boxFront({ k: h.box == null ? 1 : h.box });
    var ca = h.card != null ? h.card : (b.box ? 0 : 1); if (ca > 0) s += '<g opacity="' + f(ca) + '">' + cardFront({ wet: h.wet }) + '</g>';
    return s;
  }
  function frontPen(t, o, h) { o = o || {}; h = h || {}; var b = has(o); return penFront(h.pen != null ? h.pen : (b.pen ? 1 : 0)); }

  // ── the build per line: on from the line after the one that adds it ──
  K.steps([[2, { box: 1 }], [4, { lamp: 1 }], [6, { cloth: 1 }], [8, { rail: 1 }], [10, { bowlsOut: 1 }], [17, { pen: 1 }], [19, { papers: 1 }]]);
  var FLR = W(0, 30, 0)[1], MANX = 250, BOXCAM = [520, 1150, 2.05], CLOSE = [540, 1180, 2.6], WIDE = [560, 1060, 1.25];
  function hamC(u) { var k = Math.sin(u * 1.3 * Math.PI * 2); return { lean: 26, head: 14, aN: [62 + k * 26, 108 + k * 30], aF: [40, 90], lN: [84, 0], lF: [8, -86], hammer: 1 }; }
  // kneeling on one knee to work in the box: the near foot flat, the far knee on the floor
  var KNEEL = { lean: 26, head: 14, aN: [70, 96], aF: [56, 90], lN: [84, 0], lF: [8, -86] };
  var HOLD = { lean: 4, head: 12, aN: [40, 120], aF: [36, 116], lN: [4, 2], lF: [-4, -2] };
  function inHands(x, fc, i, t, o) { return pup(x + fc * 80, FLR - 250, i, t, Object.assign({ rot: fc > 0 ? 0 : 180, wig: 0.6 }, o || {})); }
  // the litter nursing, the mother lying (standard state)
  function litter(t, o) { o = o || {}; return dog(MOM[0], MOM[1], { t: t, mood: o.mood, headUp: o.headUp }) + nursing(MOM[0], MOM[1], t, o); }

  // 0 — your dog gave birth in a cardboard box in the corner: a home for the puppies
  shot(0, [520, 1120, 1.7], [520, 1160, 2.0], function (u, d, t) {
    var s = scene(t, {}, {}) + litter(t, { headUp: 0.6 }) + front(t, {}, {});
    s += act(u, [[0, { x: -40, y: FLR, f: 1 }], [1.6, { x: MANX, y: FLR, f: 1, p: "point", mood: "n" }], [2.8, { x: MANX, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كرتونة", 500, 1010, u, 0.8) + pill("بيت للجراوي", 520, 860, u, 2.4, { col: "#ffd23a" });
  });
  // 1 — but the cardboard goes soggy and a pup crawls over the edge onto the cold tiles
  shot(1, [480, 1160, 2.1], [500, 1190, 2.3], function (u, d, t) {
    var wet = clamp((u - 0.3) / 1.6), fk = clamp((u - 2.2) / 1.0), A = W(560, 60, 20), B = W(640, 10, 0), px = lerp(A[0], B[0], ease(fk)), py = lerp(A[1], B[1], ease(fk)) - Math.sin(fk * Math.PI) * 30;
    var s = scene(t, {}, { wet: wet, coldAt: B, coldK: clamp(u - 3.0) }) + litter(t, { skip: 5 }) + front(t, {}, { wet: wet }) + pup(px, py, 5, t, { rot: fk * 60, cold: clamp(u - 3.1), cry: u > 3.2 });
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: "stand", mood: "n" }], [2.6, { x: MANX, y: FLR, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("مبلولة!", 470, 1060, u, 1.0, { bg: "#c7321f" }) + pill("بلاط ساقع", 700, 1170, u, 3.1, { bg: "#c7321f", sz: 34 }) + xmark(560, 1150, u, 1.4, 0.6);
  });
  // 2 — so you build a plywood box, walls higher than the pups and lower than her legs: the whelping box
  shot(2, [500, 1160, 2.0], [520, 1140, 1.9], function (u, d, t) {
    var bk = clamp((u - 0.6) / 2.4), ck = clamp(1 - (u - 0.4) / 0.6), s = scene(t, {}, { box: bk, card: ck });
    var step = u > 3.6 && u < 4.6, dx = lerp(-160, 0, ease((u - 3.6) / 1.2));
    s += (u < 3.6 ? dog(780, W(700, 120, 0)[1], { t: t, pose: "stand", f: 1, mood: "n" }) : u < 4.8 ? dog(MOM[0] + 140 + dx * 0.8, MOM[1], { t: t, pose: "stand", step: step ? 1 : 0, walk: 1 }) : dog(MOM[0], MOM[1], { t: t, headUp: 0.5 }));
    s += nursing(MOM[0], MOM[1], t, { n: 6 }) + front(t, {}, { box: bk, card: ck });
    s += act(u, [[0, { x: 296, y: FLR, f: 1, p: hamC(u), mood: "n" }], [3.0, { x: 296, y: FLR, f: 1, p: hamC(u), mood: "n" }], [3.6, { x: MANX, y: FLR, f: 1, p: "point", mood: "n" }], [5.0, { x: MANX, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("أعلى من الجراوي", 560, 1000, u, 2.6, { sz: 32 }) + pill("صندوق الولادة", 520, 880, u, 4.6, { col: "#ffd23a" }) + ring(560, 1150, 120, u, 4.6, t);
  });
  // 3 — but a newborn can't shiver or warm itself until about two and a half weeks
  shot(3, [470, 1170, 2.2], [490, 1190, 2.35], function (u, d, t) {
    var mk = clamp((u - 0.3) / 1.6), A = [MOM[0] + 54, MOM[1] + 30], B = W(610, 50, 0), px = lerp(A[0], B[0], ease(mk)), py = lerp(A[1], B[1], ease(mk)), cold = clamp((u - 1.4) / 1.2);
    var s = scene(t, {}, {}) + litter(t, { skip: 5, mood: "sleep" }) + pup(px, py, 5, t, { rot: lerp(-80, 10, mk), cold: cold, wig: lerp(1, 0.15, cold) }) + front(t, {}, {});
    s += act(u, [[0, { x: 290, y: FLR, f: 1, p: "stand", mood: "n" }], [1.8, { x: 290, y: FLR, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("ما بيرتعش!", 590, 1060, u, 1.6, { bg: "#c7321f", sz: 34 }) + pill("لحد ٢.٥ أسبوع", 590, 990, u, 2.8, { sz: 30 });
  });
  // 4 — so you hang a heat lamp over one corner only: about 30° under it, each pup chooses closer or farther
  shot(4, [470, 1060, 2.0], [500, 1150, 2.2], function (u, d, t) {
    var lk = clamp((u - 0.2) / 1.4), gl = clamp((u - 1.6) / 0.6), s = scene(t, { lamp: 1 }, { lamp: lk, glow: gl });
    s += dog(MOM[0], MOM[1], { t: t, headUp: 0.4 });
    var spots = [[440, 150], [460, 165], [420, 175], [480, 140], [520, 120], [610, 60]];
    for (var i = 0; i < 6; i++) { var go = clamp((u - 2.2 - i * 0.25) / 1.6), A = i < 5 ? [MOM[0] - 54 + i * 22, MOM[1] + 30] : W(610, 50, 0), B = W(spots[i][0], spots[i][1] - 60, 0), q = [lerp(A[0], B[0], ease(go)), lerp(A[1], B[1], ease(go))];
      if (i === 4) q = [lerp(A[0], B[0], ease(go)) + Math.sin(t * 1.5) * 18 * go, q[1]];
      s += pup(q[0], q[1], i, t, { rot: -20 + i * 10, warm: i < 4 ? gl * go : 0, cold: i === 5 ? 1 - go : 0 }); }
    s += front(t, {}, {});
    s += act(u, [[0, { x: 250, y: FLR, f: 1, p: "reach", mood: "n" }], [2.0, { x: 250, y: FLR, f: 1, p: "reach", mood: "n" }], [3.4, { x: MANX, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("لمبة تدفية", 470, 900, u, 1.0, { col: "#ffd23a" }) + pill("٣٠ درجة", 380, 1090, u, 2.0, { col: "#ffb04a" }) + pill("أقرّب أو أبعد", 640, 1010, u, 4.0, { sz: 30 }) + ring(W(410, 168, 0)[0], W(410, 168, 0)[1], 70, u, 1.8, t);
  });
  // 5 — but a heavy blanket: the pup crawls under it, gets lost and can't breathe
  shot(5, [470, 1150, 2.2], [490, 1170, 2.35], function (u, d, t) {
    var bk = clamp((u - 0.2) / 0.5), lump = clamp((u - 1.0) / 2.4), s = scene(t, {}, {}) + litter(t, { skip: 5 }) + blanket(t, bk, lump) + front(t, {}, {});
    if (u > 3.0) s += ring(W(lerp(520, 590, lump), lerp(80, 120, lump), 0)[0], W(0, lerp(80, 120, lump), 0)[1] - 14, 36, u, 3.0, t).replace(/#ffd23a/g, "#e8452e");
    s += act(u, [[0, { x: 260, y: FLR, f: 1, p: "push", mood: "n" }], [1.2, { x: MANX, y: FLR, f: 1, p: "stand", mood: "n" }], [2.8, { x: MANX, y: FLR, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("بطانية تقيلة", 560, 1020, u, 0.5, { sz: 34 }) + pill("يتخنق!", 640, 1110, u, 3.0, { bg: "#c7321f" });
  });
  // 6 — so you lay a thick cloth pulled tight, no loose edges, washed every day
  shot(6, [520, 1170, 2.2], [520, 1150, 2.0], function (u, d, t) {
    var ck = clamp((u - 0.3) / 1.8), s = scene(t, {}, { cloth: ck }) + litter(t, {}) + front(t, {}, {});
    s += act(u, [[0, { x: 290, y: FLR, f: 1, p: KNEEL, mood: "n" }], [2.2, { x: 290, y: FLR, f: 1, p: KNEEL, mood: "n" }], [2.8, { x: MANX, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("قماشة مشدودة", 520, 1000, u, 1.0, { col: "#9fe8b0" }) + pill("تتغسل كل يوم", 560, 920, u, 2.8, { sz: 32 }) + vmark(700, 1100, u, 3.2, 0.6);
  });
  // 7 — but she's heavy: lying back against the wall she can pin a pup behind her
  shot(7, [470, 1130, 2.25], [480, 1120, 2.4], function (u, d, t) {
    var rk = clamp((u - 0.8) / 1.0), my = lerp(MOM[1], MOMR[1], ease(rk)), P0 = W(470, 205, 0), s = scene(t, {}, {});
    s += pup(P0[0] + 30, P0[1] + 6 + rk * 4, 2, t, { rot: 0, cry: rk > 0.5, s: lerp(1, 0.85, rk) });
    s += dog(MOM[0], my, { t: t, mood: "sleep" }) + nursing(MOM[0], my, t, { skip: 2 }) + front(t, {}, {});
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: "stand", mood: "n" }], [2.0, { x: MANX, y: FLR, f: 1, p: "cover", mood: "shock" }]], t);
    return s + xmark(P0[0] + 30, P0[1] - 50, u, 2.0, 0.6) + pill("اتزنق!", 600, 960, u, 2.2, { bg: "#c7321f" });
  });
  // 8 — so a rail goes inside the box, about 10 cm up: she leans on it, the pup hides under it: the safety rail
  shot(8, [540, 1130, 2.5], [520, 1140, 2.2], function (u, d, t) {
    var rk = clamp((u - 0.4) / 2.2), lean = clamp((u - 4.2) / 1.0), my = MOMR[1] - 6 * lean, P0 = W(470, 207, 0), s = scene(t, {}, { rail: rk });
    s += pup(P0[0] + 30, P0[1] + 2, 2, t, { rot: 0, wig: 0.4 }) + dog(MOM[0], my, { t: t, mood: "sleep" }) + nursing(MOM[0], my, t, { skip: 2 }) + front(t, {}, {});
    var rh = W(BX0 + 120, BZ1 - 16, 20), rf = W(BX0 + 120, BZ1 - 16, 0);
    s += act(u, [[0, { x: 300, y: FLR, f: 1, p: hamC(u), mood: "n" }], [2.8, { x: 300, y: FLR, f: 1, p: hamC(u), mood: "n" }], [3.4, { x: MANX, y: FLR, f: 1, p: "point", mood: "n" }], [6.2, { x: MANX, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    if (u > 2.6 && u < 5.0) { var mk = clamp((u - 2.6) / 0.4), mx = rh[0] - 30; s += P("M" + f(mx) + " " + f(rf[1]) + " V" + f(lerp(rf[1], rh[1], mk)) + " M" + f(mx - 8) + " " + f(rf[1]) + " h16 M" + f(mx - 8) + " " + f(lerp(rf[1], rh[1], mk)) + " h16", INK, 8) + P("M" + f(mx) + " " + f(rf[1]) + " V" + f(lerp(rf[1], rh[1], mk)) + " M" + f(mx - 8) + " " + f(rf[1]) + " h16 M" + f(mx - 8) + " " + f(lerp(rf[1], rh[1], mk)) + " h16", "#ffd23a", 4); }
    return s + pill("١٠ سم", rh[0] - 30, rh[1] - 50, u, 2.8, { sz: 32 }) + pill("خشبة الأمان", 560, 930, u, 6.0, { col: "#ffd23a" }) + ring(P0[0] + 30, P0[1] - 6, 40, u, 5.2, t) + vmark(P0[0] + 80, P0[1] - 80, u, 5.6, 0.5);
  });
  // 9 — but she drinks a lot; if her bowl is in the box a pup can fall in and drown
  shot(9, [480, 1160, 2.15], [500, 1180, 2.3], function (u, d, t) {
    var dr = u < 1.6, fk = clamp((u - 1.8) / 1.0), A = [MOM[0] + 54, MOM[1] + 30], B = W(590, 60, 30), s = scene(t, {}, {});
    s += bowl(590, 60, "water", t, { splash: u > 2.8 ? clamp((u - 2.8) / 0.6) : 0 });
    s += dr ? dog(W(560, 110, 0)[0] + 60, W(0, 110, 0)[1], { t: t, pose: "drink", f: 1 }) : dog(MOM[0], MOM[1], { t: t, headUp: 0.3 });
    s += nursing(MOM[0], MOM[1], t, { skip: 5 }) + (u < 2.8 ? pup(lerp(A[0], B[0], ease(fk)), lerp(A[1], B[1], ease(fk)), 5, t, { rot: -20 }) : pup(B[0], B[1] - 8, 5, t, { rot: -60, s: 0.8, cry: 1 }));
    s += front(t, {}, {});
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: "stand", mood: "n" }], [2.8, { x: MANX, y: FLR, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("يغرق!", 640, 1040, u, 2.9, { bg: "#c7321f" }) + xmark(700, 1120, u, 3.0, 0.5);
  });
  // 10 — so her food and water go outside the box, right next to it
  shot(10, [700, 1160, 1.9], [720, 1170, 1.8], function (u, d, t) {
    var bo = clamp((u - 0.3) / 1.4), s = scene(t, { bowlsOut: 1 }, { bowlsOut: bo }) + litter(t, {}) + front(t, {}, {});
    s += act(u, [[0, { x: 560, y: W(0, 0, 0)[1] - 6, f: 1, p: "push", mood: "n" }], [1.8, { x: 880, y: W(0, 0, 0)[1] - 6, f: 1, p: "push", mood: "n" }], [2.4, { x: 880, y: W(0, 0, 0)[1] - 6, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("برّه الصندوق", 900, 1010, u, 1.4, { col: "#9fe8b0", sz: 34 }) + vmark(560, 1080, u, 1.8, 0.5);
  });
  // 11 — but you have six pups, and the smallest gets pushed away from its mother
  shot(11, [470, 1160, 2.2], [490, 1170, 2.35], function (u, d, t) {
    var pk = clamp((u - 0.9) / 1.4), A = [MOM[0] + 54, MOM[1] + 30], B = W(600, 50, 0), s = scene(t, {}, {}) + litter(t, { skip: 5 });
    s += pup(lerp(A[0], B[0], ease(pk)), lerp(A[1], B[1], ease(pk)), 5, t, { rot: lerp(-80, 30, pk), s: 0.75, cry: pk > 0.8 }) + front(t, {}, {});
    for (var i = 0; i < 6; i++) if (u > 0.2 + i * 0.12 && u < 1.4) s += T(String(i + 1), MOM[0] - 54 + i * 22, MOM[1] + 2, 20, "#fff", { stroke: INK });
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: "point", mood: "n" }], [1.8, { x: MANX, y: FLR, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("٦ جراوي", 520, 1040, u, 0.2, { sz: 34 }) + pill("الأصغر", B[0] + 30, B[1] - 60, u, 2.0, { bg: "#c7321f" });
  });
  // 12 — so you weigh them daily on a kitchen scale; whoever didn't gain nurses first
  shot(12, [380, 1150, 2.1], [440, 1160, 2.1], function (u, d, t) {
    var bad = u > 2.0, put = u > 3.4, sc = W(156, 38, 112), s = scene(t, {}, { scale: 1, sc: { txt: u < 0.6 ? "0 g" : bad ? "٣٢٠ g" : "٣٨٠ g", bad: bad } });
    s += litter(t, { skip: put ? -1 : 5 }) + front(t, {}, {});
    if (u > 0.6 && !put) s += pup(sc[0], sc[1] - 6, bad ? 5 : 3, t, { rot: 0, wig: 0.4, s: bad ? 0.8 : 1 });
    s += act(u, [[0, { x: 270, y: FLR, f: -1, p: "point", mood: "n" }], [2.0, { x: 270, y: FLR, f: -1, p: "worry", mood: "worry" }], [3.4, { x: 290, y: FLR, f: 1, p: KNEEL, mood: "n" }], [4.4, { x: 280, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("ميزان المطبخ", 330, 960, u, 0.4, { col: "#ffd23a", sz: 34 }) + pill("ما زادش!", 300, 1050, u, 2.0, { bg: "#c7321f", sz: 32 }) + pill("يرضع الأول", 520, 1060, u, 3.8, { col: "#9fe8b0", sz: 32 }) + (put ? ring(MOM[0] + 54, MOM[1] + 28, 36, u, 3.6, t) : "");
  });
  // 13 — the odd thing: many people think a chilled puppy must eat first
  shot(13, [300, 1040, 2.4], [300, 1060, 2.6], function (u, d, t) {
    var s = scene(t, {}, { scale: 1,}) + litter(t, { skip: 5 }) + front(t, {}, {});
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: HOLD, mood: "worry" }], [1.6, { x: MANX, y: FLR, f: 1, p: HOLD, mood: "n" }]], t) + inHands(MANX, 1, 5, t, { cold: 1, wig: 0.15 });
    var bt = [MANX + 150, FLR - 300]; if (u > 1.2) s += '<g transform="translate(' + f(bt[0]) + ' ' + f(bt[1]) + ') rotate(30) scale(' + f(K.pop(clamp((u - 1.2) / 0.4))) + ')" filter="url(#sh)">' + R(-12, -40, 24, 60, "#f4f8fb", { rx: 8 }) + R(-12, -6, 24, 26, "#fff3d8", { rx: 6, sw: 0 }) + F("M-8 -40 Q0 -64 8 -40 Z", "#e8a07a") + '</g>';
    return s + pill("ياكل الأول؟", 330, 860, u, 0.8, { sz: 36 }) + pill("بردان", MANX + 80, FLR - 330, u, 0.3, { col: "#9fd6ff", sz: 30 });
  });
  // 14 — really: below 34° its stomach stops, and food can kill it
  shot(14, [300, 1040, 2.6], [310, 1030, 2.8], function (u, d, t) {
    var s = scene(t, {}, { scale: 1,}) + litter(t, { skip: 5 }) + front(t, {}, {});
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: HOLD, mood: "n" }], [1.6, { x: MANX, y: FLR, f: 1, p: HOLD, mood: "shock" }]], t) + inHands(MANX, 1, 5, t, { cold: 1, wig: 0.1 });
    var tx = 430, ty = 900, tk = clamp(u / 0.4), lv = lerp(0.7, 0.32, clamp((u - 0.4) / 1.4));
    if (tk > 0) s += '<g opacity="' + f(tk) + '" filter="url(#sh)">' + R(tx - 14, ty - 150, 28, 160, "#fff", { rx: 14, sw: 3 }) + R(tx - 6, ty - 140 * lv, 12, 140 * lv, "#5fb0e6", { sw: 0 }) + C(tx, ty + 12, 20, "#5fb0e6", { st: INK, sw: 3 }) + '</g>';
    // the stomach, stopped
    if (u > 2.6) { var sk = K.pop(clamp((u - 2.6) / 0.4)); s += '<g transform="translate(' + f(MANX + 80) + ' ' + f(FLR - 250) + ') scale(' + f(sk) + ')"><circle r="60" fill="#fff" stroke="' + INK + '" stroke-width="3" opacity=".95"/>' + F("M-26 -20 C-40 10 -10 40 20 30 C40 20 34 -6 20 -6 C6 -6 4 -30 -10 -34 Z", "#e8a0a0") + P("M-30 -30 L30 30 M30 -30 L-30 30", "#d8352a", 6) + '</g>'; }
    return s + pill("تحت ٣٤ درجة", tx, ty - 190, u, 1.2, { bg: "#c7321f", sz: 34 }) + pill("معدته بتقف", 330, 1100, u, 2.8, { bg: "#c7321f", sz: 32 });
  });
  // 15 — so you warm it slowly first, then it nurses
  shot(15, [330, 1060, 2.4], [440, 1140, 2.2], function (u, d, t) {
    var put = u > 1.8, wk = clamp(u / 1.6), s = scene(t, {}, { scale: 1, glow: 1 }) + litter(t, { skip: put ? -1 : 5 }) + front(t, {}, {});
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: HOLD, mood: "n" }], [1.6, { x: 280, y: FLR, f: 1, p: KNEEL, mood: "n" }], [2.4, { x: 280, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    if (!put) s += inHands(lerp(MANX, 240, clamp((u - 1.0) / 0.8)), 1, 5, t, { cold: 1 - wk, warm: wk, wig: lerp(0.1, 1, wk) });
    return s + pill("دفّيه على مهلك", 340, 880, u, 0.3, { col: "#ffb04a", sz: 34 }) + (put ? ring(MOM[0] + 54, MOM[1] + 28, 36, u, 1.9, t) + vmark(MOM[0] + 90, MOM[1] - 60, u, 2.2, 0.5) : "");
  });
  // pups of three weeks and more, wandering: i-th pup's spot (x, z) moving over the floor
  function roam(i, t, xs, zs, r) { return W(xs + Math.sin(t * 0.7 + i * 2.1) * r, zs + Math.cos(t * 0.6 + i * 1.3) * r * 0.6, 0); }
  // 16 — but at three weeks they open their eyes, walk, and jump over the wall
  shot(16, [520, 1140, 2.0], [600, 1160, 2.2], function (u, d, t) {
    var s = scene(t, {}, {}) + dog(MOM[0], MOM[1], { t: t, headUp: 0.6 }), ck = clamp((u - 1.8) / 1.6);
    for (var i = 0; i < 5; i++) { var q = roam(i, t, 380 + i * 50, 90 + (i % 2) * 30, 22); s += pup(q[0], q[1], i, t, { age: 1, rot: (i % 2 ? 180 : 0) }); }
    var A = W(600, 40, 0), Bt = W(640, 20, BH + 14), Cf = W(700, 0, 0), p = ck < 0.5 ? [lerp(A[0], Bt[0], ease(ck * 2)), lerp(A[1], Bt[1], ease(ck * 2))] : [lerp(Bt[0], Cf[0], ease(ck * 2 - 1)), lerp(Bt[1], Cf[1], (ck * 2 - 1) * (ck * 2 - 1))];
    s += front(t, {}, {}) + pup(p[0], p[1], 5, t, { age: 1, rot: ck < 0.5 ? -40 : 30 });
    s += act(u, [[0, { x: MANX, y: FLR, f: 1, p: "stand", mood: "happy" }], [3.0, { x: MANX, y: FLR, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("٣ أسابيع", 500, 950, u, 0.4, { sz: 34 }) + pill("عينيهم فتّحت", 520, 1030, u, 1.0, { sz: 30, col: "#9fe8b0" }) + pill("نط برّه!", 760, 1080, u, 3.2, { bg: "#c7321f", sz: 34 });
  });
  // 17 — so you put a low fence around the box for them to play inside: the pen
  shot(17, [600, 1100, 1.5], [600, 1120, 1.6], function (u, d, t) {
    var pk = clamp((u - 0.4) / 1.8), s = scene(t, {}, { pen: pk }) + dog(MOM[0], MOM[1], { t: t, headUp: 0.6 });
    for (var i = 0; i < 4; i++) { var q = roam(i, t, 380 + i * 60, 100, 20); s += pup(q[0], q[1], i, t, { age: 1, rot: i % 2 ? 180 : 0 }); }
    s += front(t, {}, {});
    for (var j = 4; j < 6; j++) { var r = roam(j, t, 720 + (j - 4) * 70, 80 + (j - 4) * 70, 30); s += pup(r[0], r[1], j, t, { age: 1, rot: j % 2 ? 180 : 0 }); }
    s += frontPen(t, {}, { pen: pk });
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "push", mood: "n" }], [2.2, { x: 180, y: FLR, f: 1, p: "push", mood: "n" }], [2.8, { x: 150, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("البارك", 700, 860, u, 2.4, { col: "#ffd23a" }) + ring(W(780, 120, 0)[0], W(780, 120, 0)[1], 120, u, 2.4, t);
  });
  // 18 — but now they pee everywhere, even where they sleep
  shot(18, [520, 1130, 2.2], [540, 1150, 2.4], function (u, d, t) {
    var s = scene(t, {}, {}) + dog(MOM[0], MOM[1], { t: t, headUp: 0.6, mood: "annoyed" });
    s += puddle(400, 80, clamp((u - 0.4) / 0.5)) + puddle(560, 60, clamp((u - 1.0) / 0.5)) + puddle(760, 140, clamp((u - 1.6) / 0.5)) + puddle(460, 150, clamp((u - 2.0) / 0.5));
    for (var i = 0; i < 4; i++) { var q = roam(i, t, 380 + i * 70, 100, 22); s += pup(q[0], q[1], i, t, { age: 1, rot: i % 2 ? 180 : 0 }); }
    s += front(t, {}, {}) + frontPen(t, {}, {});
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "stand", mood: "n" }], [1.6, { x: 180, y: FLR, f: 1, p: "collar", mood: "sick" }]], t);
    return s + pill("في كل حتة!", 560, 960, u, 1.2, { bg: "#c7321f" }) + xmark(W(460, 150, 0)[0], W(460, 150, 0)[1] - 50, u, 2.2, 0.5);
  });
  // 19 — so you spread newspapers at the far end of the pen, away from the bed, and they learn by themselves
  shot(19, [720, 1140, 2.0], [700, 1130, 1.9], function (u, d, t) {
    var pk = clamp((u - 0.2) / 1.4), s = scene(t, {}, { papers: pk }) + dog(MOM[0], MOM[1], { t: t, headUp: 0.6 });
    for (var i = 0; i < 4; i++) { var q = roam(i, t, 380 + i * 60, 100, 18); s += pup(q[0], q[1], i, t, { age: 1, rot: i % 2 ? 180 : 0 }); }
    s += front(t, {}, {});
    var gk = clamp((u - 2.0) / 1.2), A = W(690, 60, 0), B = W(820, 140, 0); s += pup(lerp(A[0], B[0], ease(gk)), lerp(A[1], B[1], ease(gk)), 4, t, { age: 1 }) + puddle(800, 130, clamp((u - 3.4) / 0.4));
    s += frontPen(t, {}, {});
    s += act(u, [[0, { x: 600, y: W(0, 0, 0)[1] - 8, f: 1, p: KNEEL, mood: "n" }], [1.6, { x: 600, y: W(0, 0, 0)[1] - 8, f: -1, p: "point", mood: "n" }], [3.6, { x: 600, y: W(0, 0, 0)[1] - 8, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("جرايد", 880, 1000, u, 0.8, { col: "#ffd23a" }) + pill("بعيد عن النوم", 700, 930, u, 1.8, { sz: 30 }) + vmark(W(820, 140, 0)[0] + 50, W(820, 140, 0)[1] - 70, u, 3.6, 0.5);
  });
  // 20 — but by week four milk isn't enough, and their teeth hurt their mother
  shot(20, [540, 1110, 2.4], [560, 1120, 2.6], function (u, d, t) {
    var up = u > 2.0, s = scene(t, {}, {});
    s += up ? dog(MOM[0] + 140 * clamp((u - 2.0) / 1.2), MOM[1] - 10, { t: t, pose: "stand", f: -1, mood: "annoyed", walk: u < 3.2 ? 1 : 0 }) : dog(MOM[0], MOM[1], { t: t, headUp: 0.8, mood: u > 1.0 ? "growl" : "n" });
    s += nursing(MOM[0], MOM[1], t, { age: 1 }) + front(t, {}, {}) + frontPen(t, {}, {});
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "stand", mood: "n" }], [1.4, { x: 180, y: FLR, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("الأسبوع الرابع", 540, 940, u, 0.3, { sz: 34 }) + pill("آه!", 420, 1020, u, 1.2, { bg: "#c7321f" });
  });
  // 21 — so you start them on puppy food soaked in warm water
  shot(21, [560, 1150, 2.2], [560, 1160, 2.3], function (u, d, t) {
    var bk = clamp((u - 0.2) / 0.6), c = W(560, 90, 0), s = scene(t, {}, {}) + dog(MOM[0] + 20, MOM[1] + 10, { t: t, headUp: 0.7, mood: "n" });
    if (bk > 0) s += bowl(560, 90, "mush", t);
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2, go = clamp((u - 0.8 - i * 0.12) / 0.8), q = [c[0] + Math.cos(a) * lerp(120, 52, ease(go)), c[1] - 12 + Math.sin(a) * lerp(60, 26, ease(go))]; s += pup(q[0], q[1], i, t, { age: 1, rot: Math.atan2(c[1] - q[1], c[0] - q[0]) * 180 / Math.PI }); }
    for (var k = 0; k < 3; k++) { var p = (t * 0.9 + k / 3) % 1; s += P("M" + f(c[0] - 14 + k * 14) + " " + f(c[1] - 34 - p * 40) + " q6 -8 0 -16", "#fff", 3, ' opacity="' + f(0.8 * (1 - p)) + '"'); }
    s += front(t, {}, {}) + frontPen(t, {}, {});
    s += act(u, [[0, { x: 300, y: FLR, f: 1, p: KNEEL, mood: "n" }], [1.4, { x: 200, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("أكل جراوي مبلول", 560, 960, u, 0.6, { col: "#ffd23a", sz: 34 }) + pill("مية دافية", 600, 1040, u, 1.6, { sz: 30, col: "#ffb04a" });
  });
  // 22 — what's left: toys, the sound of the washing machine and people, and vaccines at the vet
  shot(22, [440, 1090, 1.7], [520, 1120, 1.8], function (u, d, t) {
    var s = scene(t, {}, { wash: u > 0.8 && u < 3.4 }) + dog(MOM[0], MOM[1], { t: t, headUp: 0.6 }) + (u > 0.2 ? toys(t) : "");
    for (var i = 0; i < 6; i++) { var q = roam(i, t, 380 + i * 70, 110, 26); s += pup(q[0], q[1], i, t, { age: 1, rot: i % 2 ? 180 : 0 }); }
    s += front(t, {}, {}) + frontPen(t, {}, {});
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "point", mood: "happy" }], [1.6, { x: 180, y: FLR, f: 1, p: "wave", mood: "happy" }], [3.2, { x: 180, y: FLR, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("لعب", 720, 990, u, 0.3, { sz: 34 }) + pill("صوت الغسالة", 300, 880, u, 1.0, { sz: 32 }) + syringe(560, 900, clamp((u - 3.0) / 0.4)) + pill("تطعيمات", 560, 820, u, 3.2, { col: "#9fe8b0", sz: 34 });
  });
  // 23 — congratulations, you built the puppies' home yourself
  shot(23, [560, 1080, 1.5], [580, 1060, 1.1], function (u, d, t) {
    var s = scene(t, {}, {}) + litter(t, { age: 0.6, headUp: 0.8 }) + front(t, {}, {}) + frontPen(t, {}, {}) + K.confetti(t, 200, 950, 700, 1330);
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "cheer", mood: "happy" }], [1.4, { x: 180, y: FLR, f: 1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("مبروك!", 580, 760, u, 0.3, { col: "#9fe8b0", sz: 56 });
  });
  // 24 — outro
  shot(24, [580, 1060, 1.1], [580, 1050, 1.15], function (u, d, t) {
    var s = scene(t, {}, {}) + litter(t, { age: 0.6, headUp: 0.8 }) + front(t, {}, {}) + frontPen(t, {}, {});
    s += act(u, [[0, { x: 180, y: FLR, f: 1, p: "wave", mood: "happy" }]], t);
    return s + pill("قولولنا!", 580, 760, u, 0.3, { col: "#ffd23a", sz: 56 });
  });
  window.__pups = { scene: scene, front: front, frontPen: frontPen, litter: litter, act: act, W: W, FLR: FLR, pup: pup, HOLD: HOLD, MANX: MANX };
})();
