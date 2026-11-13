/* «هيروشيما: الساعة تمانية وربع» — full-bleed cinematic frames, cel-shaded (dark outlines, flat shade shapes, hard light,
   light rays, dust, film grain), redrawn every frame. World units: the frame is 360×640 (portrait).
   Every shot keeps something moving all the time: the camera creeps, dust drifts, light breathes, the subject moves. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return x < a ? a : x > b ? b : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eout(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  function fade(u, a, b) { return clamp((u - a) / (b - a)); }
  var INK = "#121419";
  function P(d, fill, o) { o = o || {}; return '<path d="' + d + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + (o.s || INK) + '" stroke-width="' + (o.w || 1.6) + '" stroke-linejoin="round"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + (o.x || '') + '/>'; }
  function f2(n) { return (+n).toFixed(3); }
  function R(x, y, w, h, fill, o) { return P('M' + f(x) + ' ' + f(y) + 'h' + f(w) + 'v' + f(h) + 'h' + f(-w) + 'Z', fill, o); }
  function G(tr, inner, op) { return '<g transform="' + tr + '"' + (op != null ? ' opacity="' + f2(op) + '"' : '') + '>' + inner + '</g>'; }
  function txt(s, x, y, size, col, o) { o = o || {}; return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (o.a || 'middle') + '" font-family="' + (o.font || 'Noto Sans Arabic') + '" font-weight="' + (o.wt || 800) + '" font-size="' + size + '" fill="' + col + '"' + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + (o.st ? ' stroke="' + o.st + '" stroke-width="' + (o.sw || 3) + '" paint-order="stroke"' : '') + '>' + s + '</text>'; }

  // ── atmosphere ─────────────────────────────────────────
  function sky(id) { return '<rect x="-400" y="-400" width="1160" height="1440" fill="url(#' + id + ')"/>'; }
  function dust(t, n, col, op, seed) { var s = ""; seed = seed || 0; for (var i = 0; i < n; i++) { var x = ((hash(i + seed) * 520 + t * (4 + hash(i * 3) * 8)) % 520) - 80, y = ((hash(i * 7 + seed) * 760 - t * (3 + hash(i) * 6)) % 760 + 760) % 760 - 60, r = 0.6 + hash(i + 9) * 1.6; s += '<circle cx="' + f(x + Math.sin(t + i) * 6) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + (col || "#fff6dc") + '" opacity="' + f2((op || .5) * (0.5 + 0.5 * Math.sin(t * 1.3 + i))) + '"/>'; } return s; }
  function rays(t, x, y, ang, n, len, op) { var s = ""; for (var i = 0; i < n; i++) { var a = ang + (i - n / 2) * 0.09 + Math.sin(t * 0.3 + i) * 0.015, w = 18 + hash(i) * 30; s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a * 57.3) + ')"><rect x="0" y="' + f(-w / 2) + '" width="' + len + '" height="' + f(w) + '" fill="url(#ray)" opacity="' + f2((op || .5) * (0.55 + 0.45 * Math.sin(t * 0.8 + i * 1.7))) + '"/></g>'; } return '<g style="mix-blend-mode:screen">' + s + '</g>'; }
  function cloudBank(t, y, sp, n, col, op, sc) { var s = ""; sc = sc || 1; for (var i = 0; i < n; i++) { var w = (70 + hash(i * 5 + y) * 90) * sc, x = ((hash(i + y) * 900 + t * sp) % 900) - 250, yy = y + hash(i * 3 + y) * 30; s += '<g opacity="' + f2(op) + '"><ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * .26) + '" fill="' + col + '"/><ellipse cx="' + f(x + w * .25) + '" cy="' + f(yy - w * .14) + '" rx="' + f(w * .5) + '" ry="' + f(w * .3) + '" fill="' + col + '"/><ellipse cx="' + f(x - w * .3) + '" cy="' + f(yy - w * .08) + '" rx="' + f(w * .38) + '" ry="' + f(w * .22) + '" fill="' + col + '"/></g>'; } return s; }
  function mountains(y, cols) { var s = ""; cols = cols || ["#6f8fa8", "#557a8c", "#3f6672"]; for (var k = 0; k < cols.length; k++) { var d = "M-300 " + (y + 60); for (var x = -300; x <= 700; x += 30) d += " L" + x + " " + f(y + k * 22 - 40 * Math.abs(Math.sin(x * 0.006 + k * 1.7)) - 26 * Math.abs(Math.sin(x * 0.017 + k))); s += P(d + " L700 " + (y + 200) + " L-300 " + (y + 200) + " Z", cols[k], { s: 0 }); } return s; }

  // ── Hiroshima 1945: wooden houses with dark kawara-tile roofs (rows seen from slightly above) ──
  function house(x, y, w, h, k, o) {
    o = o || {}; var roof = o.roof || ["#3d434b", "#4a5059", "#353a41"][k % 3], wall = o.wall || ["#b49a78", "#9c8466", "#c2ab88"][k % 3], rh = h * .55;
    var s = R(x, y - h * .45, w, h * .45, wall, { w: 1.2 });
    s += P('M' + f(x - 4) + ' ' + f(y - h * .45) + ' L' + f(x + w * .18) + ' ' + f(y - h * .45 - rh) + ' L' + f(x + w * .82) + ' ' + f(y - h * .45 - rh) + ' L' + f(x + w + 4) + ' ' + f(y - h * .45) + 'Z', roof, { w: 1.2 });
    for (var r = 1; r < 4; r++) s += '<path d="M' + f(x - 2 + r * 1.5) + ' ' + f(y - h * .45 - rh * r / 4) + ' H' + f(x + w + 2 - r * 1.5) + '" stroke="#22262b" stroke-width=".8" opacity=".7"/>';
    if (o.win !== false) s += R(x + w * .2, y - h * .38, w * .22, h * .2, o.lit ? "#f7d58a" : "#3a3026", { w: .8 }) + R(x + w * .58, y - h * .38, w * .22, h * .2, "#3a3026", { w: .8 });
    return s;
  }
  function houses(t, y0, rows, o) {
    o = o || {}; var s = "";
    for (var r = 0; r < rows; r++) { var y = y0 + r * 26 * (o.sc || 1), sc = (o.sc || 1) * (0.7 + r * 0.12); for (var i = 0; i < 16; i++) { var w = (30 + hash(i * 7 + r) * 20) * sc, x = -120 + i * 44 * sc + (r % 2) * 18 + hash(i + r * 13) * 8; if (o.skip && o.skip(x, y)) continue; var k = Math.floor(hash(i * 3 + r * 5) * 3), fl = o.flat ? clamp(o.flat(x, y)) : 0; s += fl > 0 ? G('translate(' + f(x + w / 2) + ' ' + f(y) + ') skewX(' + f(fl * 40) + ') scale(1 ' + f(1 - fl * .85) + ') translate(' + f(-x - w / 2) + ' ' + f(-y) + ')', house(x, y, w, 30 * sc, k, { roof: o.burn ? "#2a2018" : null, wall: o.burn ? "#4a3626" : null })) : house(x, y, w, 30 * sc, k, { roof: o.roof, wall: o.wall }); } }
    return s;
  }
  // the Industrial Promotion Hall (Jan Letzel, 1915): 3-storey wings with tall arched windows, a central 5-storey oval stair tower, an elliptical copper-green dome
  function dome(x, y, s, o) {
    o = o || {}; var g = "", wall = o.night ? "#6b6a74" : "#d8c9a6", sh = o.night ? "#4a4a55" : "#b5a37f", ruin = o.ruin;
    if (!ruin) {
      g += R(-150, -62, 300, 62, wall, {}) + R(-150, -66, 300, 6, sh, {});
      for (var row = 0; row < 3; row++) for (var i = 0; i < 12; i++) { var wx = -142 + i * 24 + (i > 5 ? 10 : 0); if (Math.abs(wx + 4) < 34) continue; g += P('M' + wx + ' ' + (-12 - row * 19) + ' v-9 a4 4 0 0 1 8 0 v9 Z', o.lit ? "#f2d590" : "#3c4450", { w: .9 }); }
      g += R(-34, -112, 68, 112, wall, {}) + R(-34, -112, 68, 8, sh, {});
      for (var r2 = 0; r2 < 5; r2++) for (var j = 0; j < 3; j++) g += P('M' + (-22 + j * 18) + ' ' + (-12 - r2 * 20) + ' v-10 a4 4 0 0 1 8 0 v10 Z', o.lit ? "#f2d590" : "#3c4450", { w: .9 });
      g += P('M-30 -112 C-30 -150 30 -150 30 -112 Z', o.night ? "#3f6a5e" : "#5f9a82", {}) + '<path d="M-14 -144 C-10 -130 -10 -118 -12 -112 M0 -147 V-112 M14 -144 C10 -130 10 -118 12 -112" stroke="#2f5a4a" stroke-width="1.2" fill="none"/>' + R(-4, -154, 8, 7, "#5f9a82", { w: 1 });
      g += R(-152, -2, 304, 4, "#7a6a50", { w: 1 });
    } else {
      // today's ruin: only the dome's steel ribs, the broken stair tower and jagged walls
      g += P('M-150 0 V-40 L-136 -52 L-120 -38 L-104 -58 L-88 -44 L-70 -60 L-48 -40 V0 Z', wall, {}) + P('M48 0 V-50 L66 -62 L80 -44 L100 -56 L118 -40 L134 -54 L150 -46 V0 Z', wall, {});
      for (var q = 0; q < 6; q++) g += P('M' + (-140 + q * 16) + ' -10 v-12 a4 4 0 0 1 8 0 v12 Z', "#2a2f38", { w: .8 }) + P('M' + (60 + q * 15) + ' -10 v-12 a4 4 0 0 1 8 0 v12 Z', "#2a2f38", { w: .8 });
      g += P('M-34 0 V-108 L-24 -112 L-10 -104 L4 -112 L20 -106 L34 -112 V0 Z', wall, {});
      for (var r3 = 0; r3 < 5; r3++) for (var j3 = 0; j3 < 3; j3++) g += P('M' + (-22 + j3 * 18) + ' ' + (-12 - r3 * 19) + ' v-10 a4 4 0 0 1 8 0 v10 Z', "#2a2f38", { w: .8 });
      g += '<path d="M-30 -112 C-30 -150 30 -150 30 -112" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
      for (var k = -3; k <= 3; k++) g += '<path d="M' + (k * 9) + ' -112 C' + (k * 7) + ' -132 ' + (k * 3) + ' -144 0 -146" stroke="' + INK + '" stroke-width="1.5" fill="none"/>';
      g += '<path d="M-28 -124 C-10 -128 10 -128 28 -124 M-22 -136 C-8 -139 8 -139 22 -136" stroke="' + INK + '" stroke-width="1.2" fill="none"/>';
    }
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }
  // the T-shaped Aioi Bridge over the two rivers (the aiming point), seen from above at an angle
  function riverPlan(t, o) {
    o = o || {}; var s = "", col = o.col || "url(#river)";
    s += P('M-200 330 C40 300 120 320 180 300 C240 280 300 250 560 230 L560 270 C320 290 260 320 200 340 C130 360 60 345 -200 370 Z', col, { w: 1.2 });
    s += P('M168 302 C176 360 150 430 160 700 L196 700 C188 430 214 360 200 300 Z', col, { w: 1.2 });
    for (var i = 0; i < 10; i++) { var x = ((t * 8 + i * 70) % 700) - 200; s += '<path d="M' + f(x) + ' ' + f(332 - x * .06) + ' h14" stroke="#cfe6f4" stroke-width="1" opacity=".5"/>'; }
    s += R(-40, 318, 420, 6, "#8a8170", { w: 1 }) + R(176, 320, 6, 40, "#8a8170", { w: 1 });
    return s;
  }

  // ── the tram: Hiroden 650 series (1942; cars 651 and 652 survived the bomb and still run). Boxy body, rounded roof,
  //    three-window flat front, one roof headlight, trolley pole, cream top over dark green ──
  function tramSide(x, y, s, t, o) {
    o = o || {}; var g = "", top = o.burnt ? "#7a6e5e" : "#e8dcc0", low = o.burnt ? "#3a3530" : "#2f6a4e", spd = o.speed || 0;
    g += P('M-130 -78 Q-130 -92 -116 -92 H116 Q130 -92 130 -78 V-6 H-130 Z', top, { w: 2 });
    g += R(-130, -40, 260, 34, low, { w: 2 }) + R(-130, -44, 260, 4, "#c8a24a", { s: 0 });
    g += P('M-126 -92 Q0 -100 126 -92', "none", { w: 1.4 });
    for (var i = 0; i < 9; i++) { var wx = -108 + i * 24; if (i === 0 || i === 8) { g += R(wx - 2, -80, 18, 62, "#2b3a36", { w: 1.4 }); continue; } g += R(wx, -80, 18, 30, o.win || "#9fc4d6", { w: 1.4 }) + P('M' + (wx + 3) + ' -78 l6 0 l-8 14 Z', "#ffffff", { s: 0, op: .35 }); if (o.people) g += '<circle cx="' + (wx + 9) + '" cy="-58" r="5" fill="#2a2420"/>' + P('M' + (wx + 2) + ' -50 Q' + (wx + 9) + ' -60 ' + (wx + 16) + ' -50 Z', "#3a4a5a", { s: 0 }); }
    g += R(-134, -8, 268, 6, "#2a2a2a", { w: 1.2 });
    [-82, 82].forEach(function (bx) { g += R(bx - 28, -4, 56, 10, "#2a2c30", { w: 1.2 }); [-14, 14].forEach(function (wx) { var a = t * spd * 4; g += '<circle cx="' + (bx + wx) + '" cy="8" r="9" fill="#3a3c40" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(bx + wx + Math.cos(a) * 8) + ' ' + f(8 + Math.sin(a) * 8) + ' L' + f(bx + wx - Math.cos(a) * 8) + ' ' + f(8 - Math.sin(a) * 8) + '" stroke="#777" stroke-width="1.4"/>'; }); });
    g += R(-20, -100, 40, 8, "#3a3c40", { w: 1.2 }) + '<path d="M0 -100 L' + (o.dir === 1 ? 70 : -70) + ' -150" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<circle cx="' + (o.dir === 1 ? -128 : 128) + '" cy="-95" r="4" fill="#ffe9a8" stroke="' + INK + '"/>';
    if (o.num) g += txt(o.num, o.dir === 1 ? 104 : -104, -20, 11, "#f2e6c8", { font: "Noto Serif", wt: 700 });
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }
  function tramFront(x, y, s, t, o) {
    o = o || {}; var g = "", top = "#e8dcc0", low = "#2f6a4e";
    g += P('M-46 -150 Q-48 -168 -30 -170 H30 Q48 -168 46 -150 V0 H-46 Z', top, { w: 2 }) + R(-46, -56, 92, 56, low, { w: 2 }) + R(-46, -60, 92, 4, "#c8a24a", { s: 0 });
    g += R(-40, -140, 22, 50, "#9fc4d6", { w: 1.4 }) + R(-14, -142, 28, 54, "#9fc4d6", { w: 1.4 }) + R(18, -140, 22, 50, "#9fc4d6", { w: 1.4 });
    if (o.driver) g += '<circle cx="0" cy="-104" r="8" fill="#e0b48c" stroke="' + INK + '" stroke-width="1.2"/>' + P('M-9 -106 Q-10 -118 0 -119 Q10 -118 9 -106 Q6 -112 0 -112 Q-6 -112 -9 -106Z', "#1c1a1a", { w: 1 }) + R(-10, -122, 20, 6, "#2a3446", { w: 1 }) + P('M-12 -88 Q0 -98 12 -88 Z', "#f2f0ea", { w: 1.2 });
    g += '<circle cx="0" cy="-160" r="6" fill="#fff4c8" stroke="' + INK + '" stroke-width="1.4"/>' + '<circle cx="0" cy="-160" r="16" fill="url(#warm)" opacity="' + f2(.5 + .2 * Math.sin(t * 3)) + '"/>';
    g += R(-30, -40, 60, 14, "#1f2a24", { w: 1.2 }) + (o.num ? txt(o.num, 0, -29, 11, "#f2e6c8", { font: "Noto Serif", wt: 700 }) : "");
    g += R(-48, -4, 96, 8, "#2a2a2a", { w: 1.2 }) + '<path d="M0 -170 L-30 -230" stroke="' + INK + '" stroke-width="2.4"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }

  // ── people (cel-shaded, simple faces; mostly backs and profiles) ──
  // ── people, drawn like the user's references: real proportions (~7 heads), cel shading (flat base + one hard shadow shape
  //    on the side away from the light), dark outlines, faces with brows, almond eyes, nose and mouth, hair with volume ──
  var CLN = 0;
  function darker(c, k) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; k = k || .72; return "#" + [r, g, b].map(function (v) { return ("0" + Math.round(v * k).toString(16)).slice(-2); }).join(""); }
  function cel(d, col, cid, o) { return P(d, col, o) + '<path d="' + d + '" fill="' + darker(col, .8) + '" clip-path="url(#' + cid + ')"/>'; }
  function face(view, o) {   // head centred at 0,0, ~22 wide × 26 tall; view: front | side | back | up
    o = o || {}; var skin = o.skin || "#c98f66", hair = o.hairCol || "#15110e", g = "", hs = o.hair || "short", side = view === "side";
    if (view === "back") { g += P('M-11 -2 Q-12 -15 0 -15 Q12 -15 11 -2 Q11 10 0 13 Q-11 10 -11 -2Z', skin, { w: 1.3 }); }
    else if (o.child) g += P('M-12 -3 Q-12 -16 0 -16 Q12 -16 12 -3 Q12 9 0 12 Q-12 9 -12 -3Z', skin, { w: 1.3 });
    else g += P(side ? 'M-9 -4 Q-10 -15 1 -15 Q11 -14 11 -4 L13 1 L11 3 Q11 10 4 13 Q-6 14 -9 6 Z' : 'M-11 -3 Q-11 -15 0 -15 Q11 -15 11 -3 Q11 7 6 11 Q0 15 -6 11 Q-11 7 -11 -3Z', skin, { w: 1.3 });
    if (view !== "back") g += P(side ? 'M-3 6 Q4 12 9 7 Q8 12 3 13 Q-3 12 -3 6Z' : 'M3 -3 Q11 -3 10 3 Q8 10 1 13 Q5 6 3 -3Z', darker(skin, .8), { s: 0 });
    if (o.child && view === "front") { g += '<circle cx="-5" cy="1" r="2" fill="' + INK + '"/><circle cx="5" cy="1" r="2" fill="' + INK + '"/><circle cx="-4.3" cy=".3" r=".7" fill="#fff"/><circle cx="5.7" cy=".3" r=".7" fill="#fff"/><path d="M-8 -4 q2.5 -1.4 5 0 M3 -4 q2.5 -1.4 5 0" stroke="' + INK + '" stroke-width="1" fill="none"/><path d="M-2.4 7 q2.4 1.8 4.8 0" stroke="#6a3a2a" stroke-width="1.1" fill="none"/><ellipse cx="-7" cy="5" rx="2.4" ry="1.4" fill="#e88a7a" opacity=".5"/><ellipse cx="7" cy="5" rx="2.4" ry="1.4" fill="#e88a7a" opacity=".5"/>'; }
    else if (view === "front" || view === "up") { var ey = view === "up" ? -5 : -2;
      g += '<path d="M-8 ' + (ey - 4.5) + ' q3 -1.6 6 -.4 M2 ' + (ey - 4.9) + ' q3 -1.2 6 .4" stroke="' + INK + '" stroke-width="1.1" fill="none"/>';
      g += '<path d="M-8 ' + ey + ' q3 -2.6 6 0 q-3 1.6 -6 0Z M2 ' + ey + ' q3 -2.6 6 0 q-3 1.6 -6 0Z" fill="' + INK + '"/><circle cx="-4.4" cy="' + (ey - .6) + '" r=".6" fill="#fff"/><circle cx="5.6" cy="' + (ey - .6) + '" r=".6" fill="#fff"/>';
      g += (o.child ? '' : '<path d="M1 ' + (ey + 2) + ' q1.2 2.4 -.6 3.6" stroke="' + darker(skin, .6) + '" stroke-width=".7" fill="none"/>') + '<path d="M-3 ' + (ey + 10) + ' q3 ' + (o.sad ? -1.2 : 1.2) + ' 6 0" stroke="#6a3a2a" stroke-width="1.2" fill="none"/>'; }
    if (side) g += '<path d="M6 -7 q3 -1.4 5 0" stroke="' + INK + '" stroke-width="1.2" fill="none"/><path d="M6 -3 q2.6 -1.6 4.4 0 q-2.2 1.2 -4.4 0Z" fill="' + INK + '"/><path d="M8 7 h3" stroke="#6a3a2a" stroke-width="1.1"/><path d="M-3 -4 q-3 2 0 5" stroke="' + darker(skin, .6) + '" stroke-width="1.1" fill="none"/>';
    // hair
    if (hs === "bob") g += P(view === "back" ? 'M-13 -2 Q-14 -18 0 -18 Q14 -18 13 -2 L13 9 Q0 12 -13 9 Z' : side ? 'M-11 -4 Q-12 -18 2 -18 Q12 -17 12 -8 Q4 -12 2 -6 L0 2 L-2 9 L-12 9 Z' : 'M-13 -3 Q-14 -18 0 -18 Q14 -18 13 -3 L13 9 L9 9 L9 -6 Q2 -9 -9 -6 L-9 9 L-13 9 Z', hair, { w: 1.2 }) + '<path d="M-6 -15 q4 -2 9 -1" stroke="#6a6a7a" stroke-width="1.2" fill="none" opacity=".7"/>';
    else if (hs === "bun") g += '<circle cx="' + (side ? -10 : 0) + '" cy="-16" r="6" fill="' + hair + '" stroke="' + INK + '" stroke-width="1.2"/>' + P(side ? 'M-10 -2 Q-11 -16 2 -16 Q11 -15 10 -8 Q2 -10 -2 -4 Z' : 'M-12 -2 Q-12 -17 0 -17 Q12 -17 12 -2 Q6 -10 0 -10 Q-6 -10 -12 -2Z', hair, { w: 1.2 });
    else if (hs === "cap") g += P(side ? 'M-11 -6 Q-11 -19 1 -19 Q11 -18 11 -9 L-11 -6Z' : 'M-12 -10 Q-12 -22 0 -22 Q12 -22 12 -10 Z', o.capCol || "#1c2230", { w: 1.2 }) + P(side ? 'M9 -10 L20 -7 L10 -6Z' : 'M-12 -10 Q0 -6 12 -10 L13 -7 Q0 -3 -13 -7Z', "#0e1016", { w: 1 }) + '<circle cx="' + (side ? 1 : 0) + '" cy="-16" r="1.6" fill="#c9a860"/>';
    else if (hs !== "none") g += P(view === "back" ? 'M-12 -1 Q-13 -18 0 -18 Q13 -18 12 -1 Q6 -4 0 -4 Q-6 -4 -12 -1Z' : side ? 'M-10 -3 Q-12 -18 2 -18 Q12 -17 11 -8 Q4 -12 -1 -8 L-4 0 Z' : 'M-12 -3 Q-13 -18 0 -18 Q13 -18 12 -3 Q9 -11 2 -10 Q-4 -12 -8 -8 Z', hair, { w: 1.2 }) + '<path d="M-5 -15 q5 -2 9 0" stroke="#5a5a6a" stroke-width="1.1" fill="none" opacity=".6"/>';
    if (o.capCol && hs !== "cap" && view !== "side") g += P('M-12 -10 Q-12 -22 0 -22 Q12 -22 12 -10 Z', o.capCol, { w: 1.2 }) + P('M-12 -10 Q0 -6 12 -10 L13 -7 Q0 -3 -13 -7Z', "#0e1016", { w: 1 }) + '<circle cx="0" cy="-16" r="1.6" fill="#c9a860"/>';
    if ((hs === "bob" || hs === "bun") && (view === "front" || view === "up") && !o.child) { var ly = view === "up" ? -5 : -2; g += '<path d="M-8 ' + ly + ' l-1.6 -1.4 M8 ' + ly + ' l1.6 -1.4" stroke="' + INK + '" stroke-width="1"/>'; }
    if (o.band) g += R(-12, -12, 24, 4, "#f0ede4", { w: .9 }) + '<circle cx="0" cy="-10" r="1.6" fill="#c2361a"/>';
    return g;
  }
  function person(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, view = o.view || (o.walk ? "side" : o.back ? "back" : o.look === "up" ? "up" : "front"), side = view === "side";
    var wk = o.walk ? Math.sin(t * 5 + (o.ph || 0)) : 0, top = o.top || "#f0ede4", pants = o.pants || "#3a4252", skin = o.skin || "#c98f66", br = Math.sin(t * 1.6 + (o.ph || 0)) * .8;
    var hair = o.hair === "bob" ? "bob" : o.hair || (o.cap ? "cap" : "short");
    var g = '<clipPath id="' + cid + '"><rect x="' + (side ? -40 : 3) + '" y="-200" width="' + (side ? 36 : 60) + '" height="220"/></clipPath>';
    // legs (monpe trousers are baggy, gathered at the ankle)
    var legs = side ? [[wk * 22], [-wk * 22]] : [[-6], [6]];
    legs.forEach(function (lg, k) { var a = side ? lg[0] : 0, hx = side ? 0 : lg[0]; g += G('rotate(' + f(a) + ' ' + hx + ' -84)', cel('M' + (hx - 8) + ' -86 L' + (hx - 7) + ' -8 Q' + hx + ' -4 ' + (hx + 6) + ' -8 L' + (hx + 8) + ' -86 Z', pants, cid, { w: 1.4 }) + P('M' + (hx - 6) + ' -8 L' + (hx - 6) + ' 0 H' + (hx + (side ? 12 : 7)) + ' Q' + (hx + (side ? 12 : 7)) + ' -5 ' + (hx + 5) + ' -8Z', "#2a2420", { w: 1.2 })); });
    // torso + arms
    var arm = function (sx, sw) { return G('rotate(' + f(sw) + ' ' + sx + ' -128)', cel('M' + (sx - 5) + ' -130 L' + (sx - 6) + ' -82 L' + (sx + 5) + ' -82 L' + (sx + 6) + ' -128 Z', top, cid, { w: 1.3 }) + '<ellipse cx="' + sx + '" cy="-78" rx="4.6" ry="5.6" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.1"/>'); };
    if (side) g += arm(0, -wk * 26);
    g += cel(side ? 'M-10 -134 Q0 -140 10 -134 L12 -86 H-10 Z' : 'M-20 -132 Q0 -140 20 -132 L16 -84 H-16 Z', top, cid, { w: 1.5 });
    if (!side) g += '<path d="M-6 -136 L0 -126 L6 -136" stroke="' + INK + '" stroke-width="1.1" fill="none"/><path d="M-8 -104 q8 4 16 0" stroke="' + darker(top, .6) + '" stroke-width="1" fill="none"/>';
    if (o.monpe) g += R(side ? -10 : -16, -92, side ? 22 : 32, 8, pants, { w: 1.2 });
    g += !side ? arm(-22, o.look === "up" ? 6 : 4 + br) + arm(22, o.wave ? -150 + Math.sin(t * 6) * 15 : -4 - br) : arm(0, wk * 26);
    if (o.bag) g += P('M' + (side ? -16 : 14) + ' -112 h14 v18 h-14 Z', "#7a5a3a", { w: 1.2 }) + '<path d="M' + (side ? -9 : 21) + ' -112 L' + (side ? 6 : -14) + ' -134" stroke="#5a3a20" stroke-width="2"/>';
    // neck + head
    g += R(-4, -144, 8, 10, skin, { w: 1.1 }) + G('translate(0 -157) rotate(' + f(view === "up" ? (side ? -18 : 0) : br) + ')', face(view, { skin: skin, hair: hair, hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad }));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * .42 * (o.flip ? -1 : 1)) + ' ' + f(s * .42) + ')', g, o.op);
  }
  // a big close-up portrait (the user's middle panel): head and shoulders, cel-shaded, light from the left
  function portrait(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, skin = o.skin || "#c98f66", top = o.top || "#f0ede4", bl = (t % 4.2) < .12;
    var g = '<clipPath id="' + cid + '"><rect x="4" y="-200" width="200" height="400"/></clipPath>';
    g += cel('M-70 120 Q-66 60 -30 48 L30 48 Q66 60 70 120 Z', top, cid, { w: 2 }) + '<path d="M-14 48 L0 70 L14 48" stroke="' + INK + '" stroke-width="1.6" fill="' + darker(top, .85) + '"/>';
    g += cel('M-11 20 L-12 52 Q0 58 12 52 L11 20 Z', skin, cid, { w: 1.6 });
    g += G('scale(2.6)', face("front", { skin: skin, hair: o.hair || "bob", hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, child: o.child }));
    if (bl) g += '<path d="M-22 -6 h16 M6 -6 h16" stroke="' + skin + '" stroke-width="6"/><path d="M-21 -5 q8 3 14 0 M7 -5 q8 3 14 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    if (o.rim) g += '<path d="M-29 -20 Q-31 10 -16 30" stroke="#fff6dc" stroke-width="2.4" fill="none" opacity=".75"/>';
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.4) * 1.2) + ') scale(' + s + ')', g, o.op);
  }
  function crowd(t, y, n, s, o) { o = o || {}; var g = ""; for (var i = 0; i < n; i++) { var dir = hash(i) > .5 ? 1 : -1, x = (((hash(i * 3) * 600 + dir * t * (10 + hash(i) * 10)) % 600) + 600) % 600 - 120; g += person(x, y + hash(i + 2) * 30, s * (0.85 + hash(i + 5) * .3), t, { walk: true, ph: i, flip: dir < 0, top: ["#f0ede4", "#c9c3b4", "#6a7a8a", "#e8d9b8"][i % 4], pants: ["#3a4252", "#4a4636", "#2f3542"][i % 3], cap: i % 3 === 0 ? "#1c2230" : null, hair: i % 4 === 1 ? "bob" : i % 4 === 3 ? "bun" : null, monpe: i % 4 === 1 || i % 4 === 3, skin: ["#c98f66", "#d9a07a", "#b98058"][i % 3], op: o.op }); } return g; }
  function silhouette(x, y, s, col, o) { o = o || {}; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', P('M-8 0 L-6 -30 Q-10 -52 0 -54 Q10 -52 6 -30 L8 0 Z', col, { s: 0 }) + '<circle cx="0" cy="-61" r="7.5" fill="' + col + '"/>', o.op); }

  // ── the B-29 «Enola Gay»: natural-metal silver, long round fuselage, fully glazed round nose, 4 engines with 4-blade props,
  //    tall rounded fin with the black circle-R tail marking used on the mission, the name under the cockpit ──
  function b29side(x, y, s, t, o) {
    o = o || {}; var g = "";
    g += P('M-150 -24 Q60 -30 150 -14 Q178 -8 178 6 Q178 18 150 20 L-150 24 Q-170 18 -172 0 Q-170 -20 -150 -24 Z', "url(#silver)", { w: 2 });
    g += P('M-110 -22 L-152 -96 Q-148 -104 -132 -102 L-84 -22 Z', "url(#silver)", { w: 2 }) + P('M-122 -82 Q-134 -90 -142 -88 L-136 -76 Q-128 -80 -122 -82Z', "#141414", { w: 1 }) + txt("R", -134, -79, 10, "#f4f6f8", { font: "Noto Serif", wt: 700 });
    g += P('M-150 6 L-176 -2 L-176 8 Z', "url(#silver)", { w: 1.4 }) + P('M-130 12 L-190 22 L-186 28 L-122 20Z', "url(#silver)", { w: 1.6 });
    g += P('M150 -14 Q178 -8 178 6 Q178 18 150 20 Q156 4 150 -14Z', "#9fc4d6", { w: 1.6 }); for (var i = 0; i < 4; i++) g += '<path d="M' + (154 + i * 5) + ' ' + (-12 + i) + ' Q' + (160 + i * 4) + ' 4 ' + (154 + i * 5) + ' ' + (18 - i) + '" stroke="' + INK + '" stroke-width=".8" fill="none"/>';
    g += P('M-20 2 L60 0 L80 12 L-20 14 Z', "#7f8b96", { w: 1.6 });
    [-6, 54].forEach(function (ex) { g += R(ex, 8, 34, 12, "#6a737c", { w: 1.4 }); var a = t * 40; g += '<ellipse cx="' + (ex + 36) + '" cy="14" rx="2.5" ry="' + f(16 * Math.abs(Math.cos(a))) + '" fill="#2a2a2a" opacity=".85"/><ellipse cx="' + (ex + 36) + '" cy="14" rx="2" ry="18" fill="#9aa2aa" opacity=".25"/>'; });
    for (var w = 0; w < 9; w++) g += '<circle cx="' + (30 + w * 9) + '" cy="-10" r="1.5" fill="#3c4450"/>';
    g += txt("ENOLA GAY", 112, 4, 8, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + txt("82", 70, 14, 7, "#1a1a1a", { font: "Noto Serif", wt: 700 });
    if (o.glint) g += '<circle cx="' + (60 + Math.sin(t) * 40) + '" cy="-20" r="4" fill="#fff" filter="url(#glow)"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g);
  }
  function b29below(x, y, s, t, o) {
    o = o || {}; var g = "", door = o.door || 0;
    g += P('M-250 -10 L-60 -24 L60 -24 L250 -10 L250 6 L60 12 L-60 12 L-250 6 Z', "url(#silver)", { w: 2 });
    [-170, -95, 95, 170].forEach(function (ex) { g += P('M' + (ex - 9) + ' -30 h18 v54 h-18 Z', "#6a737c", { w: 1.4 }); var a = t * 40 + ex; g += '<ellipse cx="' + ex + '" cy="-34" rx="' + f(26 * Math.abs(Math.cos(a))) + '" ry="2.6" fill="#2a2a2a" opacity=".8"/><ellipse cx="' + ex + '" cy="-34" rx="28" ry="2" fill="#9aa2aa" opacity=".3"/>'; });
    g += P('M-16 -130 Q-18 -150 0 -158 Q18 -150 16 -130 L18 140 Q0 150 -18 140 Z', "url(#silver)", { w: 2 }) + P('M-16 -132 Q-16 -148 0 -156 Q16 -148 16 -132 Q0 -126 -16 -132Z', "#9fc4d6", { w: 1.4 });
    g += P('M-70 132 L70 132 L66 142 L-66 142 Z', "url(#silver)", { w: 1.6 });
    g += R(-9, -20, 18, 50, "#1c2026", { w: 1.4 });
    g += P('M-9 -20 L' + f(-9 - door * 10) + ' -20 L' + f(-9 - door * 10) + ' 30 L-9 30 Z', "#8a949e", { w: 1.2 }) + P('M9 -20 L' + f(9 + door * 10) + ' -20 L' + f(9 + door * 10) + ' 30 L9 30 Z', "#8a949e", { w: 1.2 });
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ') rotate(' + (o.rot || 0) + ')', g);
  }
  // «Little Boy»: 3 m long, 71 cm wide, dark olive drab, round nose, square box-shaped tail fins
  function littleBoy(x, y, s, rot, o) {
    o = o || {}; var g = "";
    g += P('M-60 -18 H54 Q76 -18 78 0 Q76 18 54 18 H-60 Z', "url(#olive)", { w: 2 });
    g += P('M-60 -14 L-92 -22 L-92 22 L-60 14 Z', "#4a4b32", { w: 1.6 }) + R(-104, -24, 14, 48, "#5a5b3a", { w: 1.6 }) + '<path d="M-104 0 H-90 M-97 -24 V24" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<path d="M-20 -18 V18 M30 -18 V18" stroke="#2a2b1c" stroke-width="1.2"/>' + R(-6, -22, 10, 5, "#3a3b28", { w: 1 }) + '<path d="M-56 -10 H60" stroke="#c9c9a0" stroke-width="2" opacity=".25"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + s + ')', g);
  }

  // ── the blast ──
  function fireball(x, y, r, t) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.8) + '" fill="#ffcf7a" opacity=".35" filter="url(#soft)"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#fireball)"/>' + boil(x, y, r, t); }
  function boil(x, y, r, t) { var s = ""; for (var i = 0; i < 9; i++) { var a = i / 9 * 6.28 + t * .3, rr = r * (0.75 + 0.12 * Math.sin(t * 2 + i)); s += '<circle cx="' + f(x + Math.cos(a) * rr * .7) + '" cy="' + f(y + Math.sin(a) * rr * .7) + '" r="' + f(r * .35) + '" fill="#fff6c8" opacity=".25"/>'; } return s; }
  function mushroom(x, y, h, t, o) {
    o = o || {}; var s = "", w = h * .55, cap = h * .3, col = o.col || "url(#cloudG)";
    s += P('M' + f(x - w * .12) + ' ' + f(y) + ' C' + f(x - w * .1) + ' ' + f(y - h * .4) + ' ' + f(x - w * .18) + ' ' + f(y - h * .6) + ' ' + f(x - w * .08) + ' ' + f(y - h * .72) + ' L' + f(x + w * .08) + ' ' + f(y - h * .72) + ' C' + f(x + w * .18) + ' ' + f(y - h * .6) + ' ' + f(x + w * .1) + ' ' + f(y - h * .4) + ' ' + f(x + w * .12) + ' ' + f(y) + ' Z', o.stem || "#b89a80", { w: 1.6 });
    for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI, bx = x + Math.cos(a) * w * .5 * (1 + .05 * Math.sin(t + i)), by = y - h * .78 - Math.sin(a) * cap * .9 + Math.sin(t * .8 + i) * 2; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(cap * (.35 + hash(i) * .15)) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    s += '<ellipse cx="' + f(x) + '" cy="' + f(y - h * .78) + '" rx="' + f(w * .5) + '" ry="' + f(cap * .45) + '" fill="' + col + '"/>';
    for (var j = 0; j < 8; j++) { var a2 = j / 8 * 6.28 + t * .4; s += '<circle cx="' + f(x + Math.cos(a2) * w * .25) + '" cy="' + f(y - h * .8 + Math.sin(a2) * cap * .25) + '" r="' + f(cap * .22) + '" fill="#fff0d8" opacity=".35"/>'; }
    s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w * .6) + '" ry="' + f(h * .06) + '" fill="#8a6e58" opacity=".85"/>';
    return s;
  }
  function flames(t, x0, x1, y, h, n, op) { var s = ""; for (var i = 0; i < n; i++) { var x = x0 + (x1 - x0) * hash(i * 3), hh = h * (.5 + hash(i) * .8) * (0.8 + 0.25 * Math.sin(t * 7 + i * 2)), w = 10 + hash(i + 5) * 16; s += P('M' + f(x - w) + ' ' + f(y) + ' Q' + f(x - w * .6) + ' ' + f(y - hh * .5) + ' ' + f(x + Math.sin(t * 5 + i) * 5) + ' ' + f(y - hh) + ' Q' + f(x + w * .6) + ' ' + f(y - hh * .5) + ' ' + f(x + w) + ' ' + f(y) + ' Z', ["#ff8a2a", "#ffb43a", "#e2502a"][i % 3], { s: 0, op: op || .9 }); } return s; }
  function smoke(t, x0, x1, y, n, col, op) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * .08 + hash(i)) % 1), x = x0 + (x1 - x0) * hash(i * 7) + u * 30, yy = y - u * 300, r = 20 + u * 60; s += '<circle cx="' + f(x) + '" cy="' + f(yy) + '" r="' + f(r) + '" fill="' + (col || "#2a2220") + '" opacity="' + f2((op || .5) * (1 - u)) + '"/>'; } return s; }

  // ── objects ──
  function watch(x, y, r, t, o) {
    o = o || {}; var g = "", hh = o.h == null ? 8.25 : o.h, sec = o.sec == null ? t * 6 : o.sec;
    g += '<circle r="' + (r + 10) + '" fill="#a98a4a" stroke="' + INK + '" stroke-width="2"/><circle r="' + (r + 4) + '" fill="#d9bd78" stroke="' + INK + '" stroke-width="1.4"/>' + R(-8, -r - 26, 16, 14, "#c9a860", { w: 1.6 }) + '<circle cy="' + (-r - 32) + '" r="7" fill="none" stroke="#a98a4a" stroke-width="3"/>';
    g += '<circle r="' + r + '" fill="' + (o.burnt ? "#c9b48a" : "#f4ecd8") + '" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; g += '<path d="M' + f(Math.sin(a) * r * .82) + ' ' + f(-Math.cos(a) * r * .82) + ' L' + f(Math.sin(a) * r * .94) + ' ' + f(-Math.cos(a) * r * .94) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.2 : 2.4) + '"/>'; }
    var ha = (hh % 12) / 12 * 360, ma = (hh % 1) * 360;
    g += '<path d="M0 0 L0 ' + f(-r * .5) + '" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round" transform="rotate(' + f(ha) + ')"/><path d="M0 0 L0 ' + f(-r * .78) + '" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" transform="rotate(' + f(ma) + ')"/>';
    g += '<path d="M0 6 L0 ' + f(-r * .82) + '" stroke="#b8322a" stroke-width="1.1" transform="rotate(' + f(sec) + ')"/><circle r="2.6" fill="' + INK + '"/>';
    if (o.crack) g += '<path d="M' + f(-r * .7) + ' ' + f(-r * .3) + ' L-6 -4 L' + f(r * .4) + ' ' + f(-r * .7) + ' M-6 -4 L' + f(r * .3) + ' ' + f(r * .6) + ' M-6 -4 L' + f(-r * .5) + ' ' + f(r * .5) + '" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/>';
    g += '<path d="M' + f(-r * .78) + ' ' + f(-r * .2) + ' A' + f(r * .8) + ' ' + f(r * .8) + ' 0 0 1 ' + f(-r * .2) + ' ' + f(-r * .78) + '" stroke="#fff" stroke-width="' + f(r * .08) + '" fill="none" opacity=".45" stroke-linecap="round"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ')', g);
  }
  // origami crane (side view): body diamond, raised wings, long neck with bent head, tail
  function crane(x, y, s, col, t, o) {
    o = o || {}; var fl = Math.sin(t * 2 + (o.ph || 0)) * (o.flap == null ? 6 : o.flap), c = col || "#e8443a", d = shade(c);
    var g = P('M-30 0 L0 -6 L26 0 L0 10 Z', c, { w: 1.2 }) + P('M0 -6 L-6 ' + f(-34 - fl) + ' L14 -4 Z', c, { w: 1.2 }) + P('M0 -6 L14 ' + f(-30 - fl) + ' L18 -2 Z', d, { w: 1.2 });
    g += P('M20 -2 L34 -26 L42 -24 L34 -22 L24 2 Z', c, { w: 1.2 }) + P('M-24 0 L-40 -22 L-30 2 Z', d, { w: 1.2 }) + '<path d="M0 -6 L0 10" stroke="' + d + '" stroke-width="1"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + s + ')', g, o.op);
  }
  function shade(c) { var m = { "#e8443a": "#a82a22", "#f2c230": "#b88a10", "#f0ede4": "#c9c3b4", "#5fa3d9": "#2f6fa8", "#7ac27a": "#3f8a4a", "#e88ac0": "#a8508a" }; return m[c] || "#888"; }
  function siren(x, y, s, t, on) { var g = R(-4, 0, 8, 160, "#5a4a3a", { w: 1.4 }) + P('M-4 0 L-40 -18 L-40 18 Z', "#8a929c", { w: 1.6 }) + P('M4 0 L40 -18 L40 18 Z', "#8a929c", { w: 1.6 }) + R(-10, -10, 20, 20, "#5a6068", { w: 1.6 }); if (on) for (var k = 0; k < 3; k++) { var u = (t * 1.4 + k / 3) % 1; g += '<path d="M' + f(46 + u * 60) + ' ' + f(-24 - u * 24) + ' Q' + f(56 + u * 70) + ' 0 ' + f(46 + u * 60) + ' ' + f(24 + u * 24) + '" stroke="#f2c230" stroke-width="2.4" fill="none" opacity="' + f2(1 - u) + '"/><path d="M' + f(-46 - u * 60) + ' ' + f(-24 - u * 24) + ' Q' + f(-56 - u * 70) + ' 0 ' + f(-46 - u * 60) + ' ' + f(24 + u * 24) + '" stroke="#f2c230" stroke-width="2.4" fill="none" opacity="' + f2(1 - u) + '"/>'; } return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function lantern(x, y, s, t, i) { var fl = .75 + .25 * Math.sin(t * 6 + i * 2.3); return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2 + i) * 1.5) + ') scale(' + f(s) + ')', '<ellipse cx="0" cy="10" rx="22" ry="6" fill="#ffcf7a" opacity="' + f2(.35 * fl) + '" filter="url(#soft2)"/>' + R(-9, -18, 18, 22, "#f6e3b4", { w: 1.2 }) + R(-9, -18, 18, 22, "#ffb44a", { s: 0, op: .45 * fl }) + R(-12, 4, 24, 4, "#5a3a20", { w: 1 }) + '<circle cx="0" cy="-6" r="8" fill="#ffd98a" opacity="' + f2(.4 * fl) + '" filter="url(#glow)"/>'); }
  function label(s, x, y, u, at, size, col) { var k = clamp((u - at) / .5); if (k <= 0) return ""; return G('translate(0 ' + f((1 - eout(k)) * 8) + ')', txt(s, x, y, size || 22, col || "#fff", { op: k, st: "rgba(0,0,0,.7)", sw: 4, font: "Noto Sans Arabic", wt: 900 })); }
  function bigNum(s, x, y, u, at, size, col) { var k = clamp((u - at) / .6); if (k <= 0) return ""; return txt(s, x, y, size || 46, col || "#f2c230", { op: k, st: "rgba(0,0,0,.75)", sw: 5, font: "Noto Serif", wt: 700 }); }
  function vignette() { return '<rect x="0" y="0" width="360" height="640" fill="url(#vig)"/>'; }
  function panelBox(y, h, inner, cam, t) { return '<svg x="0" y="' + y + '" width="360" height="' + h + '" viewBox="0 0 360 ' + h + '" overflow="hidden"><g transform="' + cam + '">' + inner + '</g></svg>' + R(0, y, 360, h, "none", { w: 3, s: "#0b0c0e" }); }

  // ── shots: one per script line. cam(u, d) → [cx, cy, zoom] in the 360×640 world; draw(u, d, t) → svg ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  var still = function (u, d) { return [180, 320, 1 + 0.04 * u / d]; };
  function tri(t, u, d, A, B, C) {   // three stacked panels (like the user's train triptych), each with its own slow move
    var y = [74, 206, 338], h = 126, s = R(0, 0, 360, 640, "#0b0c0e", { s: 0 }), arr = [A, B, C];
    for (var k = 0; k < 3; k++) { var kk = clamp((u - k * 0.35) / 0.5), m = 1 + 0.06 * u / d; s += G('translate(' + f((1 - eout(kk)) * (k % 2 ? -40 : 40)) + ' 0)', panelBox(y[k], h, arr[k](t), 'translate(180 ' + (h / 2) + ') scale(' + f2(m) + ') translate(-180 ' + (-h / 2) + ')', t), kk); }
    return s;
  }
  // morning city seen from above the river delta: mountains, rivers, rows of tiled roofs, the Dome by the T-bridge
  function cityWide(t, o) {
    o = o || {}; var s = sky(o.sky || "skyMorning") + cloudBank(t, 120, 3, 5, "#ffffff", .5) + mountains(250, o.mtn);
    s += R(-300, 260, 960, 700, o.ground || "#8a8a6a", { s: 0 }) + riverPlan(t, { col: o.river });
    s += houses(t, 290, 2, { sc: .7, burn: o.burn, flat: o.flat }) + houses(t, 352, 4, { sc: 1, burn: o.burn, flat: o.flat, skip: function (x, y) { return x > 140 && x < 220; } });
    if (o.dome !== false) s += dome(200, 300, .32, { ruin: o.ruin });
    return s;
  }
  function tramInterior(t, o) {   // inside the tram behind the girl driver, looking ahead through the three-pane windscreen (the user's train-interior reference)
    o = o || {}; var s = "", vx = 180, vy = 190, sp = o.speed == null ? 1 : o.speed;
    // the street ahead in perspective: sky, two rows of houses rushing past, the rails converging
    s += sky(o.ash ? "skyAsh" : "skyMorning") + (o.ash ? smoke(t, 0, 360, 200, 8, "#3a302a", .5) : cloudBank(t, 80, 3, 4, "#fff", .6) + mountains(170, ["#9fbccc", "#86a8b8", "#6f94a4"]));
    s += P('M-40 300 L' + (vx - 6) + ' ' + vy + ' L' + (vx + 6) + ' ' + vy + ' L400 300 Z', o.ash ? "#4a4036" : "#9a8f78", { s: 0 });
    s += '<path d="M120 300 L' + (vx - 2) + ' ' + vy + ' M240 300 L' + (vx + 2) + ' ' + vy + ' M90 300 L' + (vx - 4) + ' ' + vy + ' M270 300 L' + (vx + 4) + ' ' + vy + '" stroke="#3a342a" stroke-width="1.6"/>';
    for (var i = 0; i < 7; i++) { var k = ((t * .35 * sp + i / 7) % 1), z = k * k, side = i % 2 ? 1 : -1, x = vx + side * (12 + z * 230), y = vy + z * 110, w = 8 + z * 120, h = 6 + z * 100;
      s += G('translate(' + f(x - (side < 0 ? w : 0)) + ' ' + f(y) + ')', o.ash ? P('M0 0 l' + f(w * .3) + ' ' + f(-h * .3) + ' l' + f(w * .4) + ' ' + f(h * .2) + ' l' + f(w * .3) + ' ' + f(-h * .1) + ' V0 Z', "#2a221c", { w: 1 }) : house(0, 0, w, h, i)); }
    for (var p = 0; p < 4; p++) { var kp = ((t * .35 * sp + p / 4 + .1) % 1), zp = kp * kp, xp = vx - (20 + zp * 260); s += R(xp, vy + zp * 110 - (10 + zp * 220), 1 + zp * 6, 10 + zp * 220, "#3a3026", { w: .8 }); }
    s += '<path d="M' + (vx - 30) + ' ' + (vy - 30) + ' L-60 30" stroke="' + INK + '" stroke-width="1"/>';
    // the cab: dark frame with three panes, ceiling, dashboard, brass controller
    var cab = o.dark ? "#1c1e22" : "#2a3442", trim = o.dark ? "#2a2c30" : "#3a4656";
    s += '<path fill-rule="evenodd" d="M-60 -60 H420 V700 H-60 Z M26 84 H118 V286 H26 Z M128 78 H232 V290 H128 Z M242 84 H334 V286 H242 Z" fill="' + cab + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M26 84 H118 V286 H26 Z M128 78 H232 V290 H128 Z M242 84 H334 V286 H242 Z" fill="#cfe6f4" opacity=".08" stroke="' + INK + '" stroke-width="3"/>';
    s += P('M-60 300 H420 V340 H-60 Z', trim, { w: 2 }) + P('M-60 -60 H420 V40 Q180 70 -60 40 Z', o.dark ? "#141518" : "#1e2630", { w: 2 });
    for (var h2 = 0; h2 < 5; h2++) { var hx = 30 + h2 * 75; s += '<path d="M' + hx + ' 44 v18" stroke="#8a7a5a" stroke-width="2"/>' + G('rotate(' + f(Math.sin(t * 2.2 + h2) * 9) + ' ' + hx + ' 44)', '<circle cx="' + hx + '" cy="70" r="7" fill="none" stroke="#c9a860" stroke-width="2.6"/>'); }
    if (!o.ash) s += rays(t, -10, 120, .35, 5, 420, .45);
    s += R(60, 318, 70, 46, "#9a7a3a", { w: 1.6 }) + '<circle cx="95" cy="320" r="18" fill="#7a5a2a" stroke="' + INK + '" stroke-width="1.4"/>' + G('rotate(' + f(-25 + Math.sin(t * .9) * 10) + ' 95 320)', R(92, 290, 6, 32, "#1c1c1c", { w: 1 }) + '<circle cx="95" cy="288" r="6" fill="#1c1c1c"/>');
    // the girl from behind: short black bob, navy cap, white short-sleeved blouse, her right hand on the controller
    var b = Math.sin(t * 3 * sp) * 1.4, top = o.dark ? "#a8a49a" : "#f0ede4";
    s += G('translate(0 ' + f(b) + ')', P('M110 520 L120 400 Q126 352 186 346 Q246 352 252 400 L262 520 Z', top, {}) + P('M150 400 Q186 418 222 400', "none", { w: 1.2 }) +
      P('M128 380 Q100 360 98 312 L110 306 Q118 350 142 366 Z', top, { w: 1.4 }) + '<circle cx="100" cy="304" r="9" fill="#d9aa82" stroke="' + INK + '" stroke-width="1.2"/>' +
      P('M158 352 Q154 290 186 286 Q218 290 214 352 L216 362 Q186 352 156 362 Z', "#16130f", {}) + P('M154 296 Q186 266 218 296 L220 306 H152 Z', "#26304a", {}) + R(148, 302, 76, 7, "#26304a", { w: 1.2 }) + R(176, 290, 20, 6, "#c9a860", { w: .8 }));
    return s + dust(t, 22, "#fff6dc", .45);
  }

  // 0 — 8:15 in the morning… and in one second a whole city was gone (the stopped watch, now in the Peace Memorial Museum)
  shot(0, push([180, 300], [180, 290], 1.0, 1.25), function (u, d, t) {
    var stop = u > d * .55, s = R(-200, -200, 760, 1040, "#1a1512", { s: 0 }) + '<circle cx="180" cy="290" r="260" fill="url(#warm)" opacity=".25"/>';
    s += watch(180, 290, 92, t, { h: 8 + 14.5 / 60 + (stop ? 0.25 / 60 : clamp(u / (d * .55)) * .25 / 60), sec: stop ? 0 : -60 + u / (d * .55) * 60, crack: stop, burnt: stop });
    if (stop) { var k = clamp((u - d * .55) / .35); s += R(-200, -200, 760, 1040, "#fff", { s: 0, op: (1 - k) * .9 }); }
    return s + dust(t, 18, "#ffd98a", .4) + bigNum("8:15", 180, 135, u, d * .2, 40, "#f2e6c8");
  });
  // 1 — how could one bomb wipe out a city of about 350,000 people?
  shot(1, push([180, 330], [200, 340], 1.15, 1.0), function (u, d, t) { return cityWide(t) + dust(t, 12) + bigNum("350,000", 180, 170, u, .6, 40, "#fff") + label("إنسان", 180, 205, u, 1.0, 20, "#f2c230"); });
  // 2 — and the people there… what were they doing at that very moment?
  shot(2, push([180, 330], [200, 320], 1.0, 1.08), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 80, 4, 4, "#fff", .6) + mountains(200) + R(-300, 300, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 9; i++) s += house(-60 + i * 56, 300, 52, 80, i);
    s += R(-300, 300, 960, 120, "#9a8f78", { s: 0 }) + '<path d="M-300 352 H700 M-300 362 H700" stroke="#5a5446" stroke-width="2"/>' + '<path d="M-300 140 H700" stroke="' + INK + '" stroke-width="1"/>';
    s += tramSide(((t * 40) % 760) - 200, 356, .7, t, { dir: 1, speed: 1, people: true });
    return s + crowd(t, 505, 7, 2.3) + rays(t, -20, 60, .7, 4, 600, .35) + dust(t, 14);
  });
  // 3 — what's the story? let me tell you from the beginning (title card: the Dome in the morning sun)
  shot(3, push([180, 300], [180, 310], 1.12, 1.0), function (u, d, t) {
    var s = sky("skyMorning") + '<circle cx="270" cy="150" r="90" fill="url(#warm)"/>' + cloudBank(t, 100, 3, 4, "#fff", .55) + mountains(330) + R(-300, 360, 960, 400, "url(#river)", { s: 0 });
    s += dome(180, 370, .9, {}) + R(-300, 368, 960, 6, "#6a6050", { s: 0 });
    for (var i = 0; i < 8; i++) s += '<path d="M' + f(((t * 10 + i * 60) % 420) - 30) + ' ' + (390 + i * 8) + ' h22" stroke="#e8f4fa" stroke-width="1.2" opacity=".5"/>';
    return s + rays(t, 300, 120, 2.3, 5, 500, .4) + label("هيروشيما", 180, 160, u, .3, 46, "#fff") + label("1945", 180, 200, u, .8, 22, "#f2c230") + dust(t, 14);
  });
  // 4 — Hiroshima, Japan, 6 August 1945 (a wall calendar in the morning light)
  shot(4, push([180, 300], [180, 300], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9b896", { s: 0 }) + rays(t, -40, 40, .6, 6, 600, .45);
    s += R(90, 150, 180, 230, "#f4eedd", { w: 2 }) + R(90, 150, 180, 44, "#b8322a", { w: 2 }) + '<circle cx="130" cy="146" r="5" fill="#3a3026"/><circle cx="230" cy="146" r="5" fill="#3a3026"/>';
    s += txt("أغسطس", 180, 182, 22, "#fff", { wt: 900 }) + txt("6", 180, 300, 110, "#2a2420", { font: "Noto Serif", wt: 700 }) + txt("1945", 180, 352, 22, "#5a4a3a", { font: "Noto Serif", wt: 700 });
    var k = clamp(u / d); s += P('M90 150 h180 v' + f(10 + k * 6) + ' Q180 ' + f(170 + Math.sin(t * 2) * 3) + ' 90 ' + f(160 + k * 4) + ' Z', "#f4eedd", { w: 1, op: .6 });
    return s + dust(t, 20, "#fff6dc", .6) + label("هيروشيما · اليابان", 180, 430, u, .6, 20, "#f2c230");
  });
  // 5 — an ordinary summer day, a clear sky, and the tram running through the streets
  shot(5, push([160, 330], [200, 330], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 90, 6, 5, "#fff", .7) + mountains(220) + R(-300, 300, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 10; i++) s += house(-120 + i * 58 - (t * 6 % 58), 300, 54, 86, i);
    s += R(-300, 300, 960, 200, "#8f8670", { s: 0 }) + '<path d="M-300 392 H700 M-300 402 H700" stroke="#4a4436" stroke-width="2"/>';
    for (var p = 0; p < 6; p++) { var px = -60 + p * 110 - (t * 6 % 110); s += R(px, 160, 5, 232, "#3a3026", { w: 1 }); } s += '<path d="M-300 176 H700" stroke="' + INK + '" stroke-width="1"/>';
    s += tramSide(lerp(-60, 300, clamp(u / d)), 396, .9, t, { dir: 1, speed: 1.5, people: true, num: "651" });
    return s + crowd(t, 500, 5, 2.0) + dust(t, 12);
  });
  // 6 — the odd thing: the tram drivers were young girls, 14 and 15 years old
  shot(6, push([180, 340], [180, 360], 1.0, 1.1), function (u, d, t) { return tramInterior(t) + label("14 · 15 سنة", 180, 165, u, 1.0, 28, "#f2c230"); });
  // 7 — the men were at war, so the tram company opened a school and taught the girls to drive (triptych)
  shot(7, still, function (u, d, t) {
    return tri(t, u, d,
      function (t) { var s = R(-100, -100, 560, 400, "#d9cfb6", { s: 0 }) + R(0, 0, 360, 60, "#b5a37f", { s: 0 }) + R(140, 10, 80, 44, "#2f3a34", { w: 1.4 }) + txt("家政女学校", 180, 40, 13, "#f2f0ea", { font: "Noto Serif", wt: 700 }); for (var i = 0; i < 6; i++) s += person(40 + i * 56, 150, 1.75, t, { hair: "bob", top: "#f0ede4", pants: "#2a3446", monpe: true, ph: i, skin: ["#c98f66", "#d9a07a", "#b98058"][i % 3] }); return s + rays(t, 0, 0, .6, 3, 400, .35); },
      function (t) { var s = R(-100, -100, 560, 400, "#2b2e33", { s: 0 }) + R(120, 30, 120, 100, "#c9a860", { w: 2 }) + '<circle cx="180" cy="70" r="30" fill="#8a7a5a" stroke="' + INK + '" stroke-width="1.6"/>'; s += G('rotate(' + f(-30 + Math.sin(t * 1.2) * 25) + ' 180 70)', R(176, 26, 8, 46, "#1c1c1c", { w: 1 }) + '<circle cx="180" cy="24" r="8" fill="#1c1c1c"/>'); return s + P('M200 140 Q190 60 180 30 Q196 22 206 36 Q214 70 230 140 Z', "#e0b48c", {}) + P('M180 140 L186 110 Q204 100 236 112 L240 140 Z', "#f0ede4", {}); },
      function (t) { return R(-100, -100, 560, 400, "#9fc4d6", { s: 0 }) + mountains(70, ["#8aa8b8", "#7090a0", "#5a7a88"]) + R(-100, 100, 560, 100, "#8f8670", { s: 0 }) + tramFront(180 + Math.sin(t * .6) * 6, 118, .62, t, { driver: true, num: "651" }); });
  });
  // 8 — a little after 7 the air-raid siren went off… an American plane over the city
  shot(8, push([180, 330], [180, 280], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 140, 4, 4, "#fff", .5) + mountains(320) + R(-300, 380, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 8; i++) s += house(-40 + i * 56, 380, 52, 80, i);
    s += siren(90, 230, .8, t, true) + b29side(lerp(420, -60, clamp(u / d)), 110, .18, t, { flip: true });
    for (var j = 0; j < 4; j++) s += person(130 + j * 62, 540 + (j % 2) * 14, 2.6, t, { look: "up", ph: j, hair: ["bob", "cap", "bun", null][j], cap: j === 1 ? "#1c2230" : null, monpe: j % 2 === 0, top: ["#f0ede4", "#6a7a8a", "#8a5a5a", "#e8d9b8"][j], skin: ["#c98f66", "#d9a07a", "#b98058"][j % 3] });
    return s + label("7:09", 280, 210, u, .4, 26, "#f2c230") + dust(t, 10);
  });
  // 9 — but the plane turned and left, the alarm was called off, and people said: thank God, it's over
  shot(9, push([180, 300], [180, 330], 1.1, 1.0), function (u, d, t) {
    var s = sky("skyMorning") + cloudBank(t, 140, 5, 5, "#fff", .6) + mountains(320) + R(-300, 380, 960, 400, "#a59a82", { s: 0 });
    for (var i = 0; i < 8; i++) s += house(-40 + i * 56, 380, 52, 80, i);
    s += siren(90, 230, .8, t, false) + b29side(lerp(80, -80, clamp(u / d)), 100, .1, t, { flip: true });
    s += crowd(t, 520, 6, 2.3);
    return s + rays(t, 320, 40, 2.2, 5, 600, .4) + label("7:31 · الأمان", 260, 210, u, .5, 22, "#bfe8b8") + dust(t, 12);
  });
  // 10 — everyone went back to work: schoolchildren in the streets, mothers in the kitchens, the tram packed (triptych)
  shot(10, still, function (u, d, t) {
    return tri(t, u, d,
      function (t) { var s = sky("skyMorning") + R(-100, 70, 560, 100, "#a59a82", { s: 0 }); for (var i = 0; i < 6; i++) s += house(-20 + i * 70, 80, 64, 70, i); for (var j = 0; j < 8; j++) s += person(((j * 60 + t * 14) % 480) - 60, 140, 1.5, t, { walk: true, ph: j, cap: "#1c2230", top: "#f0ede4", pants: "#3a4252", bag: true }); return s; },
      function (t) { var s = R(-100, -100, 560, 400, "#4a3a2a", { s: 0 }) + R(40, 70, 280, 60, "#6a5040", { w: 1.4 }) + '<ellipse cx="220" cy="66" rx="40" ry="12" fill="#2a2a2a" stroke="' + INK + '"/>' + flames(t, 196, 244, 76, 14, 5, .9) + R(196, 40, 48, 26, "#3a3a3a", { w: 1.4 }); for (var k = 0; k < 4; k++) { var uu = (t * .4 + k / 4) % 1; s += '<circle cx="' + f(220 + Math.sin(t + k) * 10) + '" cy="' + f(36 - uu * 50) + '" r="' + f(8 + uu * 14) + '" fill="#e8e4dc" opacity="' + f2(.5 * (1 - uu)) + '"/>'; } return s + person(120, 160, 1.9, t, { top: "#8a5a5a", pants: "#3a3030", hair: "bun", monpe: true }) + rays(t, 0, 0, .7, 3, 400, .4); },
      function (t) { var s = R(-100, -100, 560, 400, "#8f8670", { s: 0 }) + tramSide(180 + Math.sin(t) * 3, 124, .9, t, { dir: 1, people: true }); for (var p = 0; p < 4; p++) s += person(250 + p * 9, 104 + (p % 2) * 4, .8, t, { top: ["#f0ede4", "#6a7a8a"][p % 2] }); return s; });
  });
  // 11 — but above the clouds, at 9.5 km, there was another plane: «Enola Gay»
  shot(11, push([200, 300], [170, 300], 1.0, 1.15), function (u, d, t) {
    var s = sky("skyHigh") + '<circle cx="320" cy="90" r="40" fill="#fff6dc" filter="url(#soft)"/>' + cloudBank(t, 420, -30, 7, "#eef3f8", .95, 1.4) + cloudBank(t, 470, -60, 6, "#d9e4ee", 1, 1.6);
    s += b29side(190 + Math.sin(t * .5) * 6, 300 + Math.sin(t * .8) * 4, .95, t, { glint: true });
    for (var i = 0; i < 10; i++) { var x = ((-t * 260 + i * 60) % 500 + 500) % 500 - 80; s += '<path d="M' + f(x) + ' ' + (180 + i * 30) + ' h40" stroke="#fff" stroke-width="1" opacity=".35"/>'; }
    return s + label("9.5 كم", 90, 150, u, .5, 26, "#fff") + label("Enola Gay", 240, 210, u, 1.2, 22, "#f2c230");
  });
  // 12 — and in its belly a single bomb, named «Little Boy»
  shot(12, push([180, 320], [180, 320], 1.05, 1.2), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#1a1e24", { s: 0 }) + R(40, 180, 280, 260, "#2a3038", { w: 2 });
    for (var i = 0; i < 7; i++) s += '<path d="M' + (40 + i * 46) + ' 180 V440" stroke="#3a424c" stroke-width="3"/>' + '<circle cx="' + (40 + i * 46) + '" cy="190" r="2" fill="#6a737c"/>';
    s += '<path d="M180 180 V280" stroke="#8a929c" stroke-width="3"/>' + littleBoy(180, 300 + Math.sin(t * 1.5) * 2, 1.25, 0, {});
    s += '<circle cx="180" cy="300" r="140" fill="url(#warm)" opacity=".15"/>';
    return s + rays(t, 180, 160, 1.57, 3, 300, .25) + label("Little Boy", 180, 140, u, .3, 26, "#f2c230") + label("3 متر · 4 طن", 180, 410, u, 1.0, 18, "#fff");
  });
  // 13 — at exactly 8:15 the doors opened and the bomb fell
  shot(13, push([180, 300], [180, 360], 1.0, 1.1), function (u, d, t) {
    var door = clamp(u / .8), fall = clamp((u - 1.0) / (d - 1.0));
    var s = sky("skyHigh") + cloudBank(t, 560, -40, 6, "#eef3f8", .9, 1.3);
    s += b29below(180, 190 - fall * 30, .95, t, { door: door });
    if (u > 0.9) s += littleBoy(180, 240 + fall * fall * 400, .5, 90 + Math.sin(t * 3) * 3, {});
    return s + label("8:15", 300, 120, u, .1, 30, "#f2c230");
  });
  // 14 — 43 seconds as it fell… and the people below hadn't noticed (split: the bomb above, the tram below)
  shot(14, still, function (u, d, t) {
    var n = Math.max(0, 43 - Math.floor(u / d * 30)), s = R(0, 0, 360, 640, "#0b0c0e", { s: 0 });
    s += panelBox(70, 190, sky("skyHigh") + cloudBank(t, 140, -60, 6, "#eef3f8", .7, 1) + littleBoy(180, 95 + Math.sin(t * 4) * 1.5, .7, 90, {}) + (function () { var q = ""; for (var i = 0; i < 12; i++) { var y = ((t * 300 + i * 40) % 260) - 40; q += '<path d="M' + (60 + hash(i) * 240) + ' ' + f(y) + ' v-30" stroke="#fff" stroke-width="1" opacity=".5"/>'; } return q; })(), "", t);
    s += panelBox(266, 194, R(-100, -100, 560, 400, "#bfe0f0", { s: 0 }) + mountains(90, ["#9fbccc", "#86a8b8", "#6f94a4"]) + R(-100, 120, 560, 120, "#8f8670", { s: 0 }) + tramSide(((t * 30) % 600) - 120, 150, .55, t, { dir: 1, speed: 1, people: true }) + crowd(t, 186, 6, .8), "", t);
    return s + txt(String(n), 300, 130, 52, "#f2c230", { font: "Noto Serif", wt: 700, st: "rgba(0,0,0,.7)", sw: 5 }) + txt("ثانية", 300, 156, 14, "#fff", { st: "rgba(0,0,0,.7)", sw: 4 });
  });
  // 15 — and at about 600 m above the city… it exploded (a dot over the Dome, then white)
  shot(15, push([200, 330], [200, 320], 1.0, 1.08), function (u, d, t) {
    var k = clamp((u - d * .72) / .25), s = cityWide(t);
    if (u < d * .72) s += '<circle cx="200" cy="' + f(lerp(120, 205, u / (d * .72))) + '" r="2.4" fill="' + INK + '"/>' + '<path d="M200 300 V215" stroke="#fff" stroke-dasharray="3 4" stroke-width="1" opacity=".6"/>' + label("600 م", 240, 260, u, .6, 16, "#fff");
    else { var e = u - d * .72; s += '<circle cx="200" cy="205" r="' + f(4 + k * 60) + '" fill="#fff"/>' + R(-200, -200, 760, 1040, "#fff8e8", { s: 0, op: k * .88 }) + fireball(200, 205, 20 + e * 40, t);
      for (var q = 0; q < 3; q++) { var rr = ((e * 220 + q * 90) % 300); s += '<circle cx="200" cy="205" r="' + f(rr) + '" fill="none" stroke="#ffe2a0" stroke-width="' + f(6 - rr / 60) + '" opacity="' + f2(1 - rr / 300) + '"/>'; }
      s += rays(t * 3, 200, 205, t * .8, 12, 500, .7) + dust(t * 4, 40, "#ffcf7a", .9, 5); }
    return s;
  });
  // 16 — a white light stronger than the sun, and heat on the ground of thousands of degrees
  shot(16, push([180, 300], [180, 320], 1.25, 1.0), function (u, d, t) {
    var k = clamp(u / d), s = R(-200, -200, 760, 1040, "#fff8e0", { s: 0 }) + cityWide(t, { sky: "skyFire", flat: function () { return 0; } }).replace(/fill="#(3d434b|4a5059|353a41)"/g, 'fill="#e8d0a8"');
    s += R(-200, -200, 760, 1040, "#fff3cc", { s: 0, op: .55 * (1 - k) }) + fireball(200, 210, 50 + k * 50, t);
    for (var i = 0; i < 14; i++) { var y = 330 + i * 20; s += '<path d="M-20 ' + y + ' Q90 ' + f(y - 6 + Math.sin(t * 6 + i) * 4) + ' 180 ' + y + ' T380 ' + y + '" stroke="#fff3cc" stroke-width="1.4" fill="none" opacity=".35"/>'; }
    return s + bigNum("+3000°", 180, 130, u, .9, 42, "#fff") ;
  });
  // 17 — those who were close didn't have time to feel anything (the street figures dissolve into the light)
  shot(17, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) {
    var k = clamp(u / (d * .8)), s = R(-200, -200, 760, 1040, "#f6e6c4", { s: 0 }) + rays(t, 180, -60, 1.57, 9, 900, .8);
    for (var i = 0; i < 7; i++) { var x = 50 + i * 44, kk = clamp(k * 1.4 - i * .06); s += silhouette(x, 470, 1.6, "#2a201a", { op: 1 - kk }) + '<circle cx="' + x + '" cy="420" r="' + f(kk * 40) + '" fill="#fff" opacity="' + f2(kk * (1 - kk) * 2) + '" filter="url(#soft2)"/>'; }
    for (var j = 0; j < 4; j++) { var rr = ((u * 160 + j * 80) % 320); s += '<circle cx="180" cy="300" r="' + f(rr) + '" fill="none" stroke="#ffcf7a" stroke-width="3" opacity="' + f2(.6 * (1 - rr / 320)) + '"/>'; }
    return s + dust(t * 3, 50, "#c98a4a", .9, 2) + R(-200, -200, 760, 1040, "#fff", { s: 0, op: .12 + .1 * Math.sin(t * 5) });
  });
  // 18 — a man sitting on a bank's steps waiting for it to open: only his shadow, burnt into the stone, was left
  shot(18, push([180, 360], [180, 380], 1.0, 1.2), function (u, d, t) {
    var k = clamp((u - d * .35) / .4), s = R(-200, -200, 760, 1040, "#7a7366", { s: 0 });
    for (var i = 0; i < 6; i++) s += P('M-100 ' + (300 + i * 40) + ' H460 V' + (340 + i * 40) + ' H-100 Z', ["#a49c8c", "#958d7e"][i % 2], { w: 1.4 });
    s += R(60, 60, 60, 240, "#8a8272", { w: 1.6 }) + R(240, 60, 60, 240, "#8a8272", { w: 1.6 }) + R(120, 100, 120, 200, "#2a2620", { w: 1.6 });
    var man = P('M150 380 Q146 344 160 330 Q176 326 182 344 L190 380 L222 384 L224 420 L212 420 L210 398 L176 398 Q156 400 150 380 Z', "#2a2420", { s: 0 }) + '<circle cx="168" cy="314" r="13" fill="#2a2420"/>';
    s += u < d * .35 ? man : G('', man, 1 - k) + G('', man.replace(/#2a2420/g, "#2a2622"), .6 * k);
    if (u > d * .3) s += R(-200, -200, 760, 1040, "#fff", { s: 0, op: clamp(1 - (u - d * .3) / .5) });
    return s + dust(t, 14, "#d9cfb6", .5) + label("سلم بنك سوميتومو", 180, 150, u, d * .6, 18, "#fff");
  });
  // 19 — seconds later a pressure wave flattened the houses for kilometres
  shot(19, push([200, 330], [190, 340], 1.05, 1.0), function (u, d, t) {
    var r = u / d * 420, s = cityWide(t, { sky: "skyFire", burn: true, flat: function (x, y) { var dd = Math.hypot(x - 200, (y - 210) * 1.8); return clamp((r - dd + 30) / 60); } });
    s += '<ellipse cx="200" cy="330" rx="' + f(r) + '" ry="' + f(r * .4) + '" fill="none" stroke="#fff3cc" stroke-width="' + f(10 - u) + '" opacity=".7"/>' + '<ellipse cx="200" cy="330" rx="' + f(r * .9) + '" ry="' + f(r * .36) + '" fill="#d9b48a" opacity=".25"/>';
    for (var i = 0; i < 30; i++) { var a = hash(i) * 6.28, rr = r * (.6 + hash(i + 3) * .4); s += R(200 + Math.cos(a) * rr, 330 + Math.sin(a) * rr * .4 - hash(i) * 40, 4, 3, "#3a2a20", { s: 0 }); }
    return s + fireball(200, 210, 46, t) + label("موجة ضغط", 180, 130, u, .5, 26, "#fff");
  });
  // 20 — then the fire caught the wood… and the whole city burned
  shot(20, push([180, 330], [200, 320], 1.0, 1.1), function (u, d, t) {
    var s = cityWide(t, { sky: "skyFire", burn: true, flat: function () { return .9; }, ruin: true, ground: "#3a2a20", river: "#4a3020" });
    return s + smoke(t, -40, 400, 360, 18, "#1e1612", .6) + flames(t, -20, 380, 420, 70, 26, .85) + flames(t, -20, 380, 360, 40, 18, .7) + dust(t, 40, "#ffb44a", .8, 3);
  });
  // 21 — more than 70,000 people died that same day
  shot(21, push([180, 320], [180, 330], 1.1, 1.0), function (u, d, t) {
    var s = sky("skyAsh") + smoke(t, -40, 400, 380, 14, "#2a2220", .5) + R(-300, 380, 960, 400, "#3a3028", { s: 0 });
    for (var i = 0; i < 20; i++) s += P('M' + (-60 + i * 26) + ' 400 l' + f(6 + hash(i) * 12) + ' ' + f(-8 - hash(i + 1) * 20) + ' l' + f(8 + hash(i + 2) * 10) + ' ' + f(10 + hash(i) * 10) + ' Z', "#2a221c", { w: 1 });
    return s + dome(180, 392, .85, { ruin: true, night: true }) + dust(t, 30, "#9a8a7a", .5) + bigNum("70,000+", 180, 180, u, .8, 46, "#fff");
  });
  // 22 — and on the survivors a strange rain fell… black rain
  shot(22, push([180, 330], [180, 350], 1.0, 1.15), function (u, d, t) {
    var s = sky("skyAsh") + R(-300, 380, 960, 400, "#2f2822", { s: 0 }) + dome(250, 392, .5, { ruin: true, night: true });
    s += person(170, 560, 2.6, t, { back: true, hair: "bob", top: "#8a847a", pants: "#3a3530", monpe: true, wave: false });
    for (var i = 0; i < 90; i++) { var x = hash(i) * 460 - 50, y = ((t * 380 + hash(i + 7) * 700) % 700) - 60; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-3 16" stroke="#0e0c0a" stroke-width="1.6" opacity=".75"/>'; }
    for (var j = 0; j < 6; j++) { var uu = (t * 1.5 + j / 6) % 1; s += '<ellipse cx="' + f(60 + j * 50) + '" cy="' + f(470 + (j % 3) * 20) + '" rx="' + f(uu * 14) + '" ry="' + f(uu * 4) + '" fill="none" stroke="#5a5048" opacity="' + f2(1 - uu) + '"/>'; }
    return s + label("مطر إسود", 180, 170, u, .9, 30, "#fff");
  });
  // 23 — many fell ill months and years later, from something they didn't know: radiation
  shot(23, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9c0ad", { s: 0 }) + R(-200, 380, 760, 400, "#a59a86", { s: 0 }) + R(220, 100, 110, 160, "#e8eef0", { w: 2 }) + rays(t, 230, 110, 2.4, 5, 400, .5);
    for (var i = 0; i < 3; i++) { var x = 20 + i * 120; s += R(x, 380, 100, 26, "#f0ede4", { w: 1.6 }) + R(x, 406, 6, 50, "#6a6a6a", { w: 1 }) + R(x + 94, 406, 6, 50, "#6a6a6a", { w: 1 }) + '<circle cx="' + (x + 16) + '" cy="372" r="11" fill="#d9aa82" stroke="' + INK + '" stroke-width="1.2"/>' + P('M' + (x + 24) + ' 384 Q' + (x + 60) + ' ' + f(370 + Math.sin(t * 1.2 + i) * 2) + ' ' + (x + 98) + ' 384 Z', "#e2ddd0", { w: 1.2 }); }
    for (var j = 0; j < 40; j++) { var px = hash(j) * 360, py = ((hash(j + 4) * 640 - t * 14) % 640 + 640) % 640; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="1.6" fill="#7ad9a0" opacity="' + f2(.3 + .3 * Math.sin(t * 3 + j)) + '"/>'; }
    return s + label("الإشعاع", 180, 190, u, d * .55, 34, "#7ad9a0");
  });
  // 24 — by the end of the year the toll reached about 140,000 (candles lighting up one after another)
  shot(24, push([180, 330], [180, 300], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#0e0d10", { s: 0 }), n = Math.floor(clamp(u / (d * .8)) * 140);
    for (var i = 0; i < 140; i++) { var x = 14 + (i % 14) * 25, y = 230 + Math.floor(i / 14) * 24; if (i > n) { s += '<circle cx="' + x + '" cy="' + y + '" r="1.5" fill="#3a3430"/>'; continue; } var fl = .7 + .3 * Math.sin(t * 7 + i); s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#ffb44a" opacity="' + f2(.25 * fl) + '"/><ellipse cx="' + x + '" cy="' + f(y - 1) + '" rx="1.8" ry="' + f(3.5 * fl) + '" fill="#ffe2a0"/>'; }
    return s + txt(String(n * 1000).replace(/\B(?=(\d{3})+(?!\d))/g, ","), 180, 190, 46, "#f2c230", { font: "Noto Serif", wt: 700 }) + label("آخر 1945", 180, 140, u, .4, 18, "#d9d4c8");
  });
  // 25 — only three days later a second bomb fell on Nagasaki
  shot(25, push([180, 300], [180, 330], 1.0, 1.1), function (u, d, t) {
    var k = clamp(u / d), s = sky("skyHigh") + mountains(330, ["#5a7a6a", "#4a6a5a", "#3a5a4a"]) + R(-300, 400, 960, 400, "url(#river)", { s: 0 });
    s += mushroom(200, 380, 200 + k * 140, t, {}) + houses(t, 410, 2, { sc: .6 });
    return s + label("ناجازاكي", 180, 140, u, .4, 34, "#fff") + label("9 أغسطس", 180, 172, u, .9, 20, "#f2c230");
  });
  // 26 — one story never forgotten: Sadako, two years old on the day of the bomb
  shot(26, push([180, 340], [180, 320], 1.05, 1.15), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#2a2420", { s: 0 }) + '<circle cx="180" cy="320" r="200" fill="url(#warm)" opacity=".35"/>' + R(80, 170, 200, 250, "#e8dcc0", { w: 2 }) + R(92, 182, 176, 200, "#b8a888", { w: 1.2 });
    s += '<svg x="92" y="182" width="176" height="200" viewBox="92 182 176 200">' + R(92, 182, 176, 200, "#b8a888", { s: 0 }) + portrait(180, 310, 1.3, t, { hair: "bob", top: "#c9a8a0", skin: "#d9a07a", child: true }) + '</svg>';
    s += P('M80 170 h200 v250 h-200 Z', "#5a4a3a", { s: 0, op: .15 + .05 * Math.sin(t) });
    return s + crane(285, 410, .9, "#e8443a", t, { flap: 2 }) + dust(t, 16, "#ffd98a", .5) + label("ساداكو ساساكي", 180, 150, u, .5, 24, "#fff") + label("سنتين", 180, 450, u, 1.2, 20, "#f2c230");
  });
  // 27 — when she turned twelve she got leukaemia from the radiation
  shot(27, push([180, 330], [190, 340], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#d9d4c8", { s: 0 }) + R(200, 110, 130, 180, "#bfe0f0", { w: 2 }) + '<path d="M265 110 V290 M200 200 H330" stroke="#d9cfb6" stroke-width="5"/>' + rays(t, 210, 130, 2.5, 5, 400, .5);
    s += R(10, 400, 300, 50, "#f0ede4", { w: 2 }) + R(10, 450, 8, 60, "#6a6a6a", { w: 1 }) + R(302, 450, 8, 60, "#6a6a6a", { w: 1 }) + R(10, 330, 10, 120, "#8a8a8a", { w: 1 });
    s += portrait(150, 330, 1.35, t, { hair: "bob", top: "#dfe6ea", skin: "#d9a07a" });
    s += P('M30 420 Q160 ' + f(392 + Math.sin(t * 1.1) * 2) + ' 306 420 L306 452 H30 Z', "#c9d6e0", { w: 1.6 });
    return s + dust(t, 14, "#fff6dc", .5) + label("12 سنة", 180, 160, u, .4, 26, "#f2c230") + label("سرطان الدم", 180, 196, u, 1.0, 20, "#fff");
  });
  // 28 — she believed that if she folded a thousand paper cranes, her wish would come true and she'd get well
  shot(28, push([180, 320], [180, 300], 1.15, 1.0), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#3a3026", { s: 0 }) + '<circle cx="180" cy="300" r="220" fill="url(#warm)" opacity=".3"/>', n = Math.floor(clamp(u / d) * 60), cols = ["#e8443a", "#f2c230", "#5fa3d9", "#7ac27a", "#e88ac0", "#f0ede4"];
    for (var i = 0; i < 6; i++) { s += '<path d="M' + (40 + i * 56) + ' 40 V' + 200 + '" stroke="#d9cfb6" stroke-width="1"/>'; for (var j = 0; j < 10; j++) { var idx = i * 10 + j; if (idx > n) continue; s += crane(40 + i * 56 + Math.sin(t + idx) * 2, 56 + j * 15, .28, cols[(i + j) % 6], t, { ph: idx, flap: 1.5 }); } }
    s += portrait(180, 360, 1.5, t, { hair: "bob", top: "#dfe6ea", skin: "#d9a07a" }) + P('M120 470 Q150 440 172 446 L188 446 Q210 440 240 470 Z', "#d9a07a", { w: 1.4 }) + crane(180, 448, 1.0, "#e8443a", t, { flap: 3 });
    return s + bigNum(String(Math.round(n * 1000 / 60)), 180, 252, u, .1, 34, "#f2c230") + label("ألف كركي", 180, 222, u, 1.2, 18, "#fff");
  });
  // 29 — she kept folding paper on her hospital bed until the last day of her life (the empty bed, cranes in the breeze)
  shot(29, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#c9c0ad", { s: 0 }) + R(200, 110, 130, 180, "#f6e6c4", { w: 2 }) + '<path d="M265 110 V290 M200 200 H330" stroke="#d9cfb6" stroke-width="5"/>' + rays(t, 210, 130, 2.5, 6, 500, .6);
    s += R(30, 360, 260, 40, "#f0ede4", { w: 2 }) + R(30, 400, 8, 80, "#6a6a6a", { w: 1 }) + R(282, 400, 8, 80, "#6a6a6a", { w: 1 }) + '<ellipse cx="80" cy="356" rx="30" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>' + P('M100 362 Q190 352 286 362 Z', "#c9d6e0", { w: 1.4 });
    var cols = ["#e8443a", "#f2c230", "#5fa3d9", "#7ac27a", "#e88ac0"];
    for (var i = 0; i < 9; i++) { var x = 30 + i * 36, sw = Math.sin(t * 1.3 + i) * 6; s += '<path d="M' + x + ' 40 L' + f(x + sw) + ' ' + (110 + (i % 3) * 30) + '" stroke="#d9cfb6" stroke-width="1"/>' + crane(x + sw, 120 + (i % 3) * 30, .4, cols[i % 5], t, { ph: i, rot: sw * 2 }); }
    return s + dust(t, 20, "#fff6dc", .6) + label("1955", 180, 250, u, 1.0, 26, "#5a4a3a");
  });
  // 30 — remember the girl tram drivers? (a close portrait, motion-streaked window behind her, like the user's middle panel)
  shot(30, push([180, 320], [180, 310], 1.08, 1.0), function (u, d, t) {
    var s = R(-200, -200, 760, 1040, "#3a4a6a", { s: 0 }) + R(-200, 150, 760, 200, "#c9d6dc", { s: 0, op: .9 });
    for (var i = 0; i < 14; i++) { var y = 140 + i * 16, x = ((t * 500 + hash(i) * 700) % 900) - 300; s += '<rect x="' + f(x) + '" y="' + y + '" width="' + f(140 + hash(i + 2) * 200) + '" height="' + f(3 + hash(i) * 6) + '" fill="' + ["#e8f4fa", "#9ab0c0", "#6a8aa0"][i % 3] + '" opacity=".7" filter="url(#blurX)"/>'; }
    s += rays(t, 380, 60, 2.6, 6, 600, .55) + portrait(180, 330, 2.1, t, { rim: true, cap: "#26304a", hair: "bob", top: "#f0ede4" });
    for (var p = 0; p < 4; p++) { var k = (t * .12 + p / 4) % 1; s += G('translate(' + f(lerp(-40, 400, k)) + ' ' + f([120, 150, 430, 460][p] + Math.sin(t + p) * 14) + ') rotate(' + f(t * 40 + p * 90) + ')', R(-12, -8, 24, 16, "#f6f2e8", { w: 1, op: .9 })); }
    return s + R(-200, -200, 760, 1040, "#3a3026", { s: 0, op: .18 }) + dust(t, 16, "#fff6dc", .5);
  });
  // 31 — just three days after the bomb the tram ran again in Hiroshima, and some of the girls drove it
  shot(31, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) {
    var s = sky("skyAsh") + R(-300, 330, 960, 400, "#4a4036", { s: 0 }) + dome(300, 330, .5, { ruin: true, night: true });
    for (var i = 0; i < 16; i++) s += P('M' + (-40 + i * 28) + ' 340 l' + f(6 + hash(i) * 10) + ' ' + f(-6 - hash(i + 1) * 14) + ' l' + f(8 + hash(i + 2) * 10) + ' ' + f(8 + hash(i) * 8) + ' Z', "#2a221c", { w: 1 });
    s += '<path d="M-300 420 H700 M-300 430 H700" stroke="#2a2420" stroke-width="2"/>' + tramFront(lerp(140, 190, clamp(u / d)), 430, lerp(.8, 1.15, clamp(u / d)), t, { driver: true });
    for (var j = 0; j < 4; j++) s += person(30 + j * 40 + (j > 1 ? 200 : 0), 540, 2.2, t, { top: "#9a968c", pants: "#3a3530", hair: ["bob", null, "bun", "cap"][j], monpe: j % 2 === 0, wave: j === 1, ph: j });
    return s + smoke(t, -40, 400, 330, 8, "#5a5048", .3) + rays(t, 330, 40, 2.1, 4, 600, .35) + label("9 أغسطس", 180, 150, u, .5, 26, "#f2c230");
  });
  // 32 — to this day, trams that lived through the bomb still run in the city's streets (green-cream 651 passing the Dome today)
  shot(32, push([160, 330], [200, 330], 1.0, 1.05), function (u, d, t) {
    var s = sky("skyToday") + cloudBank(t, 90, 5, 5, "#fff", .8) + R(-300, 260, 960, 500, "#9fb0a0", { s: 0 });
    for (var b = 0; b < 7; b++) s += R(-80 + b * 70, 140 + hash(b) * 60, 56, 220, ["#c9ccd0", "#b0b8c0", "#d9d4c8"][b % 3], { w: 1.4 });
    s += dome(110, 340, .55, { ruin: true }) + R(-300, 340, 960, 200, "#8a8a86", { s: 0 }) + '<path d="M-300 410 H700 M-300 420 H700" stroke="#3a3a3a" stroke-width="2"/>';
    s += tramSide(lerp(420, 0, clamp(u / d)), 414, .9, t, { dir: -1, speed: 1.4, people: true, num: "651" });
    return s + crowd(t, 520, 5, 2.0) + label("لسه ماشية", 270, 160, u, 1.2, 24, "#fff");
  });
  // 33 — every year at 8:15 on 6 August, all Hiroshima falls silent for a minute (lanterns on the river by the Dome)
  shot(33, push([180, 320], [180, 340], 1.12, 1.0), function (u, d, t) {
    var s = sky("skyDusk") + dome(180, 340, .8, { ruin: true, night: true }) + R(-300, 340, 960, 400, "url(#riverDusk)", { s: 0 });
    for (var i = 0; i < 18; i++) { var x = ((hash(i) * 460 + t * (6 + hash(i) * 4)) % 460) - 50, y = 360 + hash(i + 3) * 120; s += lantern(x, y, .6 + (y - 360) / 200, t, i); }
    for (var j = 0; j < 5; j++) { var uu = ((t * .06 + j / 5) % 1); s += crane(lerp(-40, 400, uu), 140 + j * 18 + Math.sin(t + j) * 6, .3, "#f0ede4", t, { ph: j, op: .8 }); }
    return s + watch(300, 190, 26, t, { h: 8.25, sec: 0 }) + label("دقيقة صمت", 140, 200, u, .8, 24, "#fff");
  });
  // 34 — tell us: which story do you want next time? (a single paper crane in the dark)
  shot(34, push([180, 300], [180, 300], 1.0, 1.1), function (u, d, t) {
    return R(-200, -200, 760, 1040, "#0e0d10", { s: 0 }) + '<circle cx="180" cy="300" r="160" fill="url(#warm)" opacity=".3"/>' + crane(180, 300 + Math.sin(t) * 6, 2.2, "#e8443a", t, { flap: 4 }) + dust(t, 20, "#ffd98a", .5) + label("قولولنا!", 180, 170, u, .3, 30, "#fff");
  });

  window.__parts = { person: person, portrait: portrait, crowd: crowd, dome: dome, tramSide: tramSide, tramFront: tramFront, b29side: b29side, littleBoy: littleBoy, crane: crane, watch: watch, mushroom: mushroom, cityWide: cityWide, lantern: lantern };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 4 && i <= 10) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 5 * Math.sin(t * .9), cy = c[1] + 4 * Math.cos(t * .7), z = c[2] * (1 + .012 * Math.sin(t * .6)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
