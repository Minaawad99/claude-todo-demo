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
  function darker(c, k) { if (c.indexOf('url') === 0) return 'rgba(30,24,12,.28)'; var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; k = k || .72; return "#" + [r, g, b].map(function (v) { return ("0" + Math.round(v * k).toString(16)).slice(-2); }).join(""); }
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
    if (o.helmet) g += P(side ? 'M-13 -5 Q-14 -24 1 -24 Q15 -23 15 -7 L17 -5 L-15 -4 Z' : 'M-15 -6 Q-15 -25 0 -25 Q15 -25 15 -6 L17 -4 L-17 -4 Z', o.helmet, { w: 1.3 }) + '<path d="M-14 -9 Q0 -12 14 -9" stroke="#3a3a24" stroke-width="1" fill="none"/>' + (view === "front" || view === "up" ? '<path d="M-12 -4 Q-13 6 -8 10 M12 -4 Q13 6 8 10" stroke="#3a3020" stroke-width=".9" fill="none"/>' : '');
    if (o.mustache && view !== "back") g += P(side ? 'M4 6 q4 -1 7 0 q-3 2 -7 0Z' : 'M-6 6 Q0 3 6 6 Q0 8 -6 6Z', "#1a1410", { s: 0 });
    if (o.beard && view !== "back") g += P(side ? 'M2 4 Q12 4 11 10 Q8 18 0 16 Q-4 12 2 4Z' : 'M-9 3 Q0 8 9 3 Q10 14 0 18 Q-10 14 -9 3Z', o.beard, { w: 1 }) + (side ? '' : '<path d="M-3 9 q3 1.5 6 0" stroke="#6a3a2a" stroke-width="1" fill="none"/>');
    if (o.hat === "bowler") g += P('M-12 -9 Q-12 -24 0 -24 Q12 -24 12 -9 Z', "#1e1e22", { w: 1.2 }) + P('M-17 -9 Q0 -5 17 -9 L17 -7 Q0 -3 -17 -7Z', "#141418", { w: 1 });
    if (o.hat === "flat") g += P(side ? 'M-12 -8 Q-10 -19 4 -19 Q14 -18 18 -10 L-12 -8Z' : 'M-14 -9 Q-12 -20 0 -20 Q12 -20 14 -9 Q0 -5 -14 -9Z', o.hatCol || "#5a4a3a", { w: 1.2 });
    if (o.hat === "lady") g += P('M-22 -10 Q0 -18 22 -10 Q0 -4 -22 -10Z', o.hatCol || "#3a2a3a", { w: 1.2 }) + P('M-11 -11 Q-10 -24 0 -24 Q10 -24 11 -11Z', o.hatCol || "#3a2a3a", { w: 1.2 }) + '<path d="M-11 -13 Q0 -10 11 -13" stroke="#c9a0a0" stroke-width="2.4" fill="none"/>';
    if (o.hat === "tarboush") g += P(side ? 'M-9 -9 L-7 -27 L9 -27 L11 -9 Z' : 'M-10 -9 L-8 -27 L8 -27 L10 -9 Z', "#b8222a", { w: 1.2 }) + '<path d="M0 -27 Q8 -24 9 -14" stroke="#141414" stroke-width="1.4" fill="none"/><circle cx="9" cy="-13" r="1.6" fill="#141414"/>';
    if (o.hat === "officer") g += P('M-13 -9 Q-14 -22 0 -23 Q14 -22 13 -9 Z', o.hatCol || "#f4f2ec", { w: 1.2 }) + P('M-13 -9 Q0 -5 13 -9 L14 -6 Q0 -2 -14 -6Z', "#141418", { w: 1 }) + R(-13, -13, 26, 4, "#16182a", { s: 0 }) + '<circle cx="0" cy="-11" r="2" fill="#c9a860"/>';
    if (o.hat === "turban") g += P(side ? 'M-11 -6 Q-13 -22 1 -23 Q13 -22 12 -7 Q0 -11 -11 -6Z' : 'M-13 -6 Q-14 -23 0 -24 Q14 -23 13 -6 Q0 -10 -13 -6Z', o.hatCol || "#ece6d6", { w: 1.2 }) + '<path d="M-12 -12 Q0 -17 12 -12 M-11 -17 Q0 -21 11 -17" stroke="#b8b0a0" stroke-width="1" fill="none"/>';
    if (o.hat === "scarf") g += P(view === "back" ? 'M-14 2 Q-15 -20 0 -20 Q15 -20 14 2 L16 16 L-16 16Z' : side ? 'M-12 4 Q-14 -20 2 -20 Q13 -19 12 -8 Q8 -14 2 -13 Q-4 -12 -6 -2 L-4 14 L-14 14Z' : 'M-15 6 Q-16 -21 0 -21 Q16 -21 15 6 L17 16 L10 16 Q11 0 10 -6 Q0 -14 -10 -6 Q-11 0 -10 16 L-17 16Z', o.hatCol || "#16141a", { w: 1.2 });
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
    if (o.dress) g += cel(side ? 'M-10 -92 L-16 -2 L16 -2 L12 -92 Z' : 'M-16 -92 L-24 -2 L24 -2 L16 -92 Z', o.dress, cid, { w: 1.5 }) + '<path d="M-8 -80 L-12 -6 M6 -80 L10 -6" stroke="' + darker(o.dress, .6) + '" stroke-width="1" fill="none"/>';
    if (o.coat) g += cel(side ? 'M-11 -134 L-13 -40 L13 -40 L12 -134 Z' : 'M-20 -132 L-21 -40 L21 -40 L20 -132 Z', o.coat, cid, { w: 1.5 }) + (side ? '' : '<path d="M0 -130 V-40" stroke="' + INK + '" stroke-width="1"/><circle cx="4" cy="-110" r="1.6" fill="#c9a860"/><circle cx="4" cy="-90" r="1.6" fill="#c9a860"/>');
    if (o.vest) g += P(side ? 'M-12 -132 h24 v40 h-24 Z' : 'M-18 -132 h36 v42 h-36 Z', "#e6dcc0", { w: 1.4 }) + '<path d="M' + (side ? -12 : -18) + ' -118 h' + (side ? 24 : 36) + ' M' + (side ? -12 : -18) + ' -104 h' + (side ? 24 : 36) + ' M0 -132 v42" stroke="#9a8a6a" stroke-width="1.1"/>';
    g += !side ? arm(-22, o.look === "up" ? 6 : 4 + br) + arm(22, o.wave ? -150 + Math.sin(t * 6) * 15 : -4 - br) : arm(0, wk * 26);
    if (o.bag) g += P('M' + (side ? -16 : 14) + ' -112 h14 v18 h-14 Z', "#7a5a3a", { w: 1.2 }) + '<path d="M' + (side ? -9 : 21) + ' -112 L' + (side ? 6 : -14) + ' -134" stroke="#5a3a20" stroke-width="2"/>';
    // neck + head
    g += R(-4, -144, 8, 10, skin, { w: 1.1 }) + G('translate(0 -157) rotate(' + f(view === "up" ? (side ? -18 : 0) : br) + ')', face(view, { skin: skin, hair: o.helmet ? 'short' : hair, hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, helmet: o.helmet, mustache: o.mustache, beard: o.beard, hat: o.hat, hatCol: o.hatCol }));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * .42 * (o.flip ? -1 : 1)) + ' ' + f(s * .42) + ')', g, o.op);
  }
  // a big close-up portrait (the user's middle panel): head and shoulders, cel-shaded, light from the left
  function portrait(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, skin = o.skin || "#c98f66", top = o.top || "#f0ede4", bl = (t % 4.2) < .12;
    var g = '<clipPath id="' + cid + '"><rect x="4" y="-200" width="200" height="400"/></clipPath>';
    g += cel('M-70 120 Q-66 60 -30 48 L30 48 Q66 60 70 120 Z', top, cid, { w: 2 }) + '<path d="M-14 48 L0 70 L14 48" stroke="' + INK + '" stroke-width="1.6" fill="' + darker(top, .85) + '"/>';
    g += cel('M-11 20 L-12 52 Q0 58 12 52 L11 20 Z', skin, cid, { w: 1.6 });
    g += G('scale(2.6)', face("front", { skin: skin, hair: o.hair || "bob", hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, child: o.child, helmet: o.helmet, mustache: o.mustache, beard: o.beard, hat: o.hat, hatCol: o.hatCol }));
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
  // ── «جريمة بني مزار» in the «القصة 2D» look, played dark: a sleeping Upper-Egypt hamlet (whitewashed and pale-blue
  //    plastered houses, flat roofs stacked with palm fronds, wooden doors, a bulb on a wooden pole, as in the real 2005
  //    Al Arabiya footage), then the courts. Nothing of the victims is drawn: candles, doors and empty rooms stand for them.
  //    Horror transitions: "smash" (white crack → black → the new frame flickers on), "flick" (a failing bulb), "glitch"
  //    (the frame tears sideways), "dip" (a slow fall to black). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  function D(i) { return LN[i].end - LN[i].start; }
  var YEL = "#f2c230", RED = "#c8261e", WOOD = "#6b4a30", WOOD_D = "#4a3220", PAPER = "#efe6d0", BULB = "#ffe7a8";
  var WALLS = ["#9fb3c4", "#c9c2b0", "#b9a68a", "#8fa6b8", "#d2cbb8"];
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.4 + hash(i + 1) * .9) + '" fill="#fff" opacity="' + f2(.25 + .45 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function flick(t, seed) { var a = Math.sin(t * 23 + seed) + Math.sin(t * 37.3 + seed * 2) + Math.sin(t * 5.1); return a > 1.7 ? .15 : a > 1.2 ? .55 : 1; }
  function fog(t, y, op, col) { var s = ""; for (var i = 0; i < 7; i++) { var w = 160 + hash(i + 40) * 140, x = ((hash(i * 9) * 760 + t * (6 + hash(i) * 6)) % 760) - 200; s += '<ellipse cx="' + f(x) + '" cy="' + f(y + hash(i + 3) * 40) + '" rx="' + f(w) + '" ry="' + f(18 + hash(i + 5) * 14) + '" fill="' + (col || "#8a93a8") + '" opacity="' + f2((op || .18) * (.6 + .4 * Math.sin(t * .4 + i))) + '" filter="url(#soft)"/>'; } return s; }
  function moon(x, y, t) { return '<circle cx="' + x + '" cy="' + y + '" r="34" fill="url(#lamp)" opacity=".25"/>' + Ci(x, y, 13, "#d8d4c4", { s: 0 }) + Ci(x + 6, y - 4, 12, "#0a0f1e", { s: 0 }) + '<ellipse cx="' + f(x - 30 + 14 * Math.sin(t * .2)) + '" cy="' + (y + 6) + '" rx="46" ry="7" fill="#1a2236" opacity=".8"/>'; }
  // a date palm: a leaning trunk with ring marks and a crown of fronds that sway
  function palm(x, y, s, t, col) {
    col = col || "#0c1018"; var g = "", lean = 6 * s, sw = Math.sin(t * .9 + x) * 2;
    g += P('M' + f(x - 3 * s) + ' ' + y + ' Q' + f(x + lean * .4) + ' ' + f(y - 60 * s) + ' ' + f(x + lean) + ' ' + f(y - 120 * s) + ' L' + f(x + lean + 4 * s) + ' ' + f(y - 120 * s) + ' Q' + f(x + lean * .4 + 5 * s) + ' ' + f(y - 60 * s) + ' ' + f(x + 3 * s) + ' ' + y + 'Z', col, { w: 1 });
    for (var k = 0; k < 9; k++) { var a = (k / 9) * 6.28 + sw * .05, cx = x + lean + 2 * s, cy = y - 122 * s, ex = cx + Math.cos(a) * 44 * s, ey = cy + Math.sin(a) * 18 * s + 16 * s + Math.abs(Math.cos(a)) * 10 * s;
      g += P('M' + f(cx) + ' ' + f(cy) + ' Q' + f((cx + ex) / 2) + ' ' + f(cy - 18 * s) + ' ' + f(ex) + ' ' + f(ey + sw) + ' Q' + f((cx + ex) / 2) + ' ' + f(cy - 10 * s) + ' ' + f(cx) + ' ' + f(cy + 3 * s) + 'Z', col, { w: .8 }); }
    return g;
  }
  // an Upper-Egypt village house: plastered wall, a flat roof stacked with palm fronds, a wooden door, small barred windows
  function vHouse(x, y, w, h, o) {
    o = o || {}; var wall = o.wall || WALLS[0], dk = o.dark == null ? .55 : o.dark, g = "", id = "vh" + (++CLN);
    g += '<clipPath id="' + id + '"><rect x="' + f(x + w * .62) + '" y="' + f(y - h - 20) + '" width="' + f(w) + '" height="' + f(h + 40) + '"/></clipPath>';
    g += cel('M' + f(x) + ' ' + f(y) + ' V' + f(y - h) + ' H' + f(x + w) + ' V' + f(y) + ' Z', wall, id, { w: 1.6 });
    g += R(x - 2, y - h - 4, w + 4, 5, darker(wall, .8), { w: 1.2 });   // parapet
    for (var k = 0; k < Math.floor(w / 9); k++) g += P('M' + f(x + 2 + k * 9) + ' ' + f(y - h - 4) + ' l' + f(4 + hash(k + x) * 6) + ' ' + f(-6 - hash(k + y) * 9) + ' l' + f(5) + ' ' + f(7) + 'Z', "#5a4a30", { w: .7 });   // palm fronds on the roof
    var dw = w * .26, dh = h * .62, dx = x + (o.doorX == null ? .37 : o.doorX) * w, open = o.door || 0;
    g += R(dx - 3, y - dh - 3, dw + 6, dh + 3, darker(wall, .7), { w: 1 });
    g += R(dx, y - dh, dw, dh, "#050608", { s: 0 });
    if (o.inner) g += '<rect x="' + f(dx) + '" y="' + f(y - dh) + '" width="' + f(dw) + '" height="' + f(dh) + '" fill="' + o.inner + '" opacity="' + f2(o.innerOp || .8) + '"/>';
    g += G('translate(' + f(dx) + ' 0) scale(' + f2(1 - open * .8) + ' 1) translate(' + f(-dx) + ' 0)', R(dx, y - dh, dw, dh, WOOD, { w: 1.2 }) + '<path d="M' + f(dx + dw / 2) + ' ' + f(y - dh) + ' V' + y + ' M' + f(dx) + ' ' + f(y - dh * .5) + ' H' + f(dx + dw) + '" stroke="' + WOOD_D + '" stroke-width="1"/>' + Ci(dx + dw * .8, y - dh * .48, 1.4, "#c9a860", { s: 0 }));
    (o.wins || [[.14, .36], [.72, .36]]).forEach(function (p, k) { var wx = x + p[0] * w, wy = y - h * (1 - p[1]) - 6, ww = w * .14, wh = h * .2, lit = o.lit && o.lit[k];
      g += R(wx, wy, ww, wh, lit ? (o.litCol || BULB) : "#07090d", { w: 1 }) + (lit ? '<rect x="' + f(wx - ww) + '" y="' + f(wy - wh) + '" width="' + f(ww * 3) + '" height="' + f(wh * 3) + '" fill="url(#warm)" opacity="' + f2(.35 * lit) + '"/>' : '');
      for (var b = 1; b < 3; b++) g += '<path d="M' + f(wx + ww * b / 3) + ' ' + f(wy) + ' v' + f(wh) + '" stroke="' + INK + '" stroke-width=".8"/>'; });
    g += '<rect x="' + f(x) + '" y="' + f(y - h - 6) + '" width="' + f(w) + '" height="' + f(h + 6) + '" fill="#020308" opacity="' + f2(dk) + '"/>';   // night falls on the wall
    return g;
  }
  function lampPost(x, y, s, t, o) { o = o || {}; var fl = o.off ? 0 : flick(t, x) * (o.k == null ? 1 : o.k); return '<circle cx="' + x + '" cy="' + f(y - 120 * s) + '" r="' + f(70 * s) + '" fill="url(#lamp)" opacity="' + f2(.5 * fl) + '"/>' + P('M' + f(x - 2 * s) + ' ' + y + ' L' + f(x - 1.4 * s) + ' ' + f(y - 124 * s) + ' L' + f(x + 1.4 * s) + ' ' + f(y - 124 * s) + ' L' + f(x + 2 * s) + ' ' + y + 'Z', "#2a2018", { w: .8 }) + '<path d="M' + x + ' ' + f(y - 122 * s) + ' h' + f(12 * s) + '" stroke="#2a2018" stroke-width="' + f(1.4 * s) + '"/>' + Ci(x + 12 * s, y - 119 * s, 3 * s, fl > .5 ? "#f4f6ff" : "#5a6070", { w: .6 }); }
  function ground(t, y, col) { return P('M-220 ' + y + ' Q60 ' + (y - 6) + ' 180 ' + y + ' T580 ' + (y - 4) + ' V1200 H-220 Z', col || "#1a1712", { s: 0 }) + '<path d="M-220 ' + (y + 30) + ' Q120 ' + (y + 22) + ' 580 ' + (y + 34) + '" stroke="#2a251c" stroke-width="10" opacity=".5"/>'; }
  // the hamlet at night, wide
  function villageNight(t, o) {
    o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 90, 300) + moon(286, 110, t), gy = o.gy || 420;
    s += palm(-10, gy - 40, 1.2, t) + palm(70, gy - 30, .9, t) + palm(320, gy - 36, 1.1, t) + palm(250, gy - 40, .8, t);
    s += fog(t, gy - 70, .1);
    var hs = [[-70, 70, 70, 4], [8, 66, 82, 0], [82, 74, 66, 1], [164, 62, 86, 3], [234, 78, 70, 2], [318, 70, 74, 4]];
    hs.forEach(function (h, k) { var lit = o.lights ? o.lights(k, t) : 0; s += vHouse(h[0], gy, h[1], h[2], { wall: WALLS[h[3]], dark: o.dark == null ? .5 : o.dark, lit: [lit, lit * .7] }); });
    s += ground(t, gy, "#13110d") + lampPost(o.lampX || 150, gy + 6, 1, t, { k: o.lamp == null ? 1 : o.lamp }) + fog(t, gy + 10, o.fog || .22);
    return s;
  }
  // the three houses of the story, close
  function three(t, o) {
    o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 60, 260) + (o.noMoon ? "" : moon(300, 96, t)) + palm(30, 330, 1.1, t) + palm(330, 322, 1, t), gy = 400;
    [[22, 96, 108, 0], [134, 92, 120, 1], [244, 98, 104, 3]].forEach(function (h, k) { var l = o.lit ? o.lit(k) : 0; s += vHouse(h[0], gy, h[1], h[2], { wall: WALLS[h[3]], dark: o.dark == null ? .5 : o.dark, lit: [l, l], door: o.door ? o.door(k) : 0, inner: o.inner, innerOp: o.innerOp }); });
    s += ground(t, gy, "#12100c") + lampPost(124, 406, .95, t, { k: o.lamp == null ? 1 : o.lamp, off: o.lampOff }) + fog(t, gy + 6, o.fog || .2);
    if (o.people) s += o.people;
    return s;
  }
  // an old CRT television in a dark room, the screen glowing blue
  function tv(x, y, s, t, o) {
    o = o || {}; var g = '<circle cx="0" cy="-10" r="150" fill="url(#lamp)" opacity="' + f2(.22 * (o.glow || 1) * (.85 + .15 * Math.sin(t * 9))) + '"/>';
    g += R(-78, -70, 156, 120, "#3a3630", { w: 2 }) + R(-70, -62, 112, 92, "#0c1420", { w: 1.6 }) + R(52, -50, 18, 70, "#2a2622", { w: 1 }) + Ci(61, -36, 4, "#8a8070") + Ci(61, -20, 4, "#8a8070") + R(-60, 50, 12, 14, "#2a2622", { w: 1 }) + R(48, 50, 12, 14, "#2a2622", { w: 1 }) + '<path d="M-20 -70 L-44 -112 M20 -70 L44 -116" stroke="#8a8070" stroke-width="2"/>';
    g += '<svg x="-70" y="-62" width="112" height="92" viewBox="0 0 112 92" overflow="hidden">' + (o.screen ? o.screen(t) : "") + '<rect width="112" height="92" fill="#9fc4e6" opacity=".08"/>';
    for (var k = 0; k < 23; k++) g += '<path d="M0 ' + (k * 4 + (t * 20) % 4) + ' h112" stroke="#000" stroke-width="1" opacity=".25"/>';
    if (o.static) for (var n = 0; n < 160; n++) g += '<rect x="' + f(hash(n + Math.floor(t * 24) * 7) * 112) + '" y="' + f(hash(n * 3 + Math.floor(t * 24)) * 92) + '" width="2" height="1.4" fill="#fff" opacity="' + f2(hash(n + 2) * o.static) + '"/>';
    g += '</svg>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }
  function room(t, op) { return R(-220, -220, 800, 1300, "#07080c", { s: 0 }) + P('M-220 430 L580 430 V900 H-220Z', "#120f0c", { s: 0 }) + R(-30, 300, 420, 6, "#1e1914", { s: 0 }) + dust(t, 30, "#9fb4d8", .25 * (op || 1), 4); }
  function screenVillage(t) { var s = '<rect width="112" height="92" fill="#1a2236"/>' + stars(t, 14, 40); [[4, 22, 26, 0], [30, 24, 30, 1], [58, 22, 24, 3], [84, 24, 28, 4]].forEach(function (h) { s += vHouse(h[0], 70, h[1], h[2], { wall: WALLS[h[3]], dark: .3 }); }); return s + R(0, 70, 112, 22, "#2a251c", { s: 0 }) + R(0, 78, 112, 14, "#b8222a", { s: 0 }) + txt("عاجل", 100, 88, 8, "#fff", { a: "end", wt: 900 }); }
  function rec(t, y, src) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="#e0662f"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".8"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt(src || "تسجيل حقيقي · قناة العربية · 2005", 288, y + 4, 12.5, "#fff", { a: "start" }) + b; }
  // a candle: ten of them stand for the ten who died
  function candle(x, y, s, t, i, k) { if (k <= 0) return ""; var fl = 1 + .12 * Math.sin(t * 9 + i * 2.1) + .06 * Math.sin(t * 23 + i); return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle cx="0" cy="-34" r="26" fill="url(#warm)" opacity="' + f2(.5 * k) + '"/>' + R(-5, -26, 10, 26, "#efe4cc", { w: 1 }) + '<path d="M0 -26 v-4" stroke="' + INK + '" stroke-width="1"/>' + G('translate(0 -30) scale(' + f2(k * fl) + ')', P('M0 0 Q-4 -6 0 -14 Q4 -6 0 0Z', "#ffcf6a", { w: .6 }) + P('M0 -1 Q-2 -5 0 -9 Q2 -5 0 -1Z', "#fff6dc", { s: 0 }))); }
  function candles(t, n, y, s, k) { var g = ""; for (var i = 0; i < n; i++) { var x = 180 + (i - (n - 1) / 2) * 30 * s; g += candle(x, y + (i % 2) * 10 * s, s, t, i, clamp(k * n - i)); } return g; }
  function paper(x, y, w, h, rot, o) { o = o || {}; var g = R(-w / 2, -h / 2, w, h, PAPER, { w: 1.4 }); for (var k = 0; k < (o.lines || 9); k++) g += '<path d="M' + f(-w / 2 + 12) + ' ' + f(-h / 2 + 34 + k * 11) + ' h' + f((w - 24) * (.6 + hash(k + (o.seed || 0)) * .4)) + '" stroke="#8a8270" stroke-width="2" opacity=".55"/>'; if (o.title) g += txt(o.title, 0, -h / 2 + 20, o.ts || 11, INK, { wt: 900 }); if (o.stamp) g += G('rotate(-14)', '<rect x="-40" y="' + f(h / 2 - 50) + '" width="80" height="26" rx="4" fill="none" stroke="' + RED + '" stroke-width="2.4" opacity="' + f2(o.stamp) + '"/>' + txt(o.stampText || "", 0, h / 2 - 32, 12, RED, { op: o.stamp, wt: 900 })); return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')', g, o.op); }
  function magnifier(x, y, s, t) { return G('translate(' + f(x + 4 * Math.sin(t * .9)) + ' ' + f(y + 3 * Math.cos(t * 1.1)) + ') scale(' + s + ')', '<circle r="30" fill="#bcd8ea" opacity=".18"/><circle r="30" fill="none" stroke="' + INK + '" stroke-width="7"/><circle r="30" fill="none" stroke="#b8a070" stroke-width="4"/><path d="M21 21 L52 52" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M21 21 L52 52" stroke="' + WOOD + '" stroke-width="8" stroke-linecap="round"/><path d="M-16 -14 q8 -10 20 -8" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/>'); }
  function galabeya(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * .8) * 2) + ') rotate(' + f(Math.sin(t * .6) * 2) + ') scale(' + s + ')', '<path d="M0 -150 v-14 q0 -8 8 -8" stroke="#8a8070" stroke-width="3" fill="none"/><path d="M-60 -132 L0 -150 L60 -132" stroke="#5a4a30" stroke-width="5" fill="none"/>' + cel('M-24 -146 Q0 -138 24 -146 L64 -126 L74 -70 L54 -66 L48 -100 L52 110 L-52 110 L-48 -100 L-54 -66 L-74 -70 L-64 -126 Z', "#cfc6b2", "gcl", { w: 2 }) + '<clipPath id="gcl"><rect x="10" y="-200" width="100" height="400"/></clipPath><path d="M0 -140 V-80" stroke="' + INK + '" stroke-width="1.4"/><path d="M-10 -146 Q0 -130 10 -146" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'); }
  function shoes(x, y, s) { var one = function (dx, r) { return G('translate(' + dx + ' 0) rotate(' + r + ')', cel('M-30 0 Q-34 -16 -16 -20 L10 -22 Q22 -30 30 -22 L34 -4 Q34 4 26 4 L-26 4 Q-32 4 -30 0Z', "#3a2a20", "shc", { w: 1.8 }) + '<path d="M-28 2 H30" stroke="#1a120c" stroke-width="3"/>'); }; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<clipPath id="shc"><rect x="-60" y="-8" width="120" height="20"/></clipPath>' + one(-34, -4) + one(34, 6)); }
  function gavel(x, y, s, a) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', R(-60, 30, 120, 18, WOOD_D, { w: 1.6, }) + G('rotate(' + f(a) + ' 40 20)', '<path d="M40 20 L-40 -10" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M40 20 L-40 -10" stroke="' + WOOD + '" stroke-width="6" stroke-linecap="round"/>' + G('rotate(-20 -46 -12)', R(-66, -30, 40, 36, WOOD, { w: 1.8 }) + R(-70, -26, 6, 28, WOOD_D, { w: 1.2 }) + R(-28, -26, 6, 28, WOOD_D, { w: 1.2 })))); }
  // an Egyptian criminal court: the bench under «العدل أساس الملك», the scales, the iron cage of the accused
  function court(t, o) {
    o = o || {}; var s = R(-220, -220, 800, 1300, "#1c140e", { s: 0 }) + R(-220, 90, 800, 360, "#3a2a1c", { s: 0 });
    for (var k = 0; k < 14; k++) s += R(-220 + k * 60, 90, 56, 360, k % 2 ? "#3e2d1f" : "#36271a", { s: 0 });
    s += '<circle cx="180" cy="150" r="120" fill="url(#warm)" opacity=".18"/>' + txt("العدل أساس الملك", 180, 128, 19, "#c9a860", { wt: 900 });
    s += G('translate(180 176) scale(.8)', '<path d="M0 -26 V30 M-40 -16 H40" stroke="#c9a860" stroke-width="3"/><path d="M-40 -16 L-52 8 H-28 Z M40 -16 L28 8 H52 Z" fill="none" stroke="#c9a860" stroke-width="2"/><path d="M-14 30 h28" stroke="#c9a860" stroke-width="4"/>');
    s += R(-40, 240, 440, 80, "#4a3422", { w: 2 }) + R(-40, 232, 440, 12, "#5a4430", { w: 1.6 }); for (var c = 0; c < 3; c++) s += R(118 + c * 50 - 16, 196, 32, 44, "#5a2a22", { w: 1.4 });
    if (o.cage !== false) { var cx = o.cageX == null ? 300 : o.cageX; s += R(cx - 60, 300, 130, 140, "rgba(0,0,0,.35)", { s: 0 }); for (var b = 0; b <= 13; b++) s += '<path d="M' + (cx - 60 + b * 10) + ' 290 V440" stroke="#5a5e66" stroke-width="2.4"/>'; s += '<path d="M' + (cx - 62) + ' 290 H' + (cx + 72) + ' M' + (cx - 62) + ' 360 H' + (cx + 72) + '" stroke="#5a5e66" stroke-width="3"/>'; if (o.inCage) s += shadowMan(cx + 4, 440, .95, t, .9); }
    s += R(-220, 420, 800, 600, "#120d09", { s: 0 }) + dust(t, 40, "#ffe7a8", .35, 2);
    return s;
  }
  function courthouse(t, o) { o = o || {}; var s = sky(o.sky || "skyVillage") + stars(t, 40, 200), y = 400; s += R(30, y - 150, 300, 150, "#b8ad94", { w: 2 }) + P('M20 ' + (y - 150) + ' L180 ' + (y - 210) + ' L340 ' + (y - 150) + 'Z', "#a89d84", { w: 2 }); for (var c = 0; c < 6; c++) s += R(56 + c * 48, y - 140, 16, 140, "#d2c8ae", { w: 1.4 }); s += R(20, y - 6, 320, 10, "#8a8068", { w: 1.4 }) + txt(o.name || "محكمة جنايات المنيا", 180, y - 162, 13, INK, { wt: 900 }) + '<rect x="30" y="' + (y - 160) + '" width="300" height="170" fill="#020308" opacity="' + f2(o.dark == null ? .45 : o.dark) + '"/>' + P('M174 ' + (y - 210) + ' v-40', "none", { w: 2 }) + G('translate(176 ' + (y - 250) + ') skewY(' + f(Math.sin(t * 2) * 4) + ')', R(0, 0, 30, 6, "#c8261e", { s: 0 }) + R(0, 6, 30, 6, "#f4f2ec", { s: 0 }) + R(0, 12, 30, 6, "#141414", { s: 0 })); return s + ground(t, y + 4, "#16130e") + fog(t, y, .15); }
  function policeTruck(x, y, s, t) { var bl = Math.sin(t * 14) > 0; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle cx="-20" cy="-96" r="90" fill="' + (bl ? "#3a6aff" : "#ff3a3a") + '" opacity=".22" filter="url(#soft)"/>' + R(-90, -80, 130, 70, "#1e2a44", { w: 2 }) + R(40, -60, 50, 50, "#24314f", { w: 2 }) + R(48, -54, 28, 20, "#9fc4e6", { w: 1.2, }) + R(-84, -70, 118, 10, "#f4f2ec", { w: 1 }) + txt("الشرطة", -26, -38, 14, "#f4f2ec", { wt: 900 }) + Ci(-60, -6, 13, "#111") + Ci(60, -6, 13, "#111") + Ci(-60, -6, 5, "#5a5e66", { s: 0 }) + Ci(60, -6, 5, "#5a5e66", { s: 0 }) + R(-30, -90, 24, 10, bl ? "#5a8aff" : "#30364a", { w: 1 }) + R(-6, -90, 24, 10, bl ? "#30364a" : "#ff5a4a", { w: 1 })); }
  function smokeWord(w, x, y, t, k, x2) { if (k <= 0) return ""; var s = '<g opacity="' + f2(clamp(k)) + '">'; for (var i = 0; i < 6; i++) { var p = (t * .2 + hash(i + x)) % 1; s += '<circle cx="' + f(x + (hash(i) - .5) * 70) + '" cy="' + f(y - p * 60) + '" r="' + f(16 + 24 * p) + '" fill="#4a4a54" opacity="' + f2(.35 * (1 - p)) + '" filter="url(#soft)"/>'; } s += txt(w, x, y + Math.sin(t * 1.3 + x) * 3, 40, "#e9e2d2", { st: "rgba(0,0,0,.8)", sw: 5, wt: 900 }) + (x2 ? '<path d="M' + f(x - 44) + ' ' + f(y - 12) + ' L' + f(x - 44 + 88 * clamp(x2)) + ' ' + f(y - 12) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/>' : "") + '</g>'; return s; }
  function shadowMan(x, y, s, t, op) { return G('translate(' + f(x + Math.sin(t * .7) * 1.5) + ' ' + f(y) + ') scale(' + s + ')', P('M-16 0 L-14 -60 Q-26 -66 -24 -100 Q-20 -118 0 -120 Q-4 -134 0 -146 Q12 -152 16 -138 Q18 -126 10 -120 Q22 -116 24 -100 Q26 -66 14 -60 L16 0Z', "#010102", { s: 0 }), op); }
  function folder(x, y, s, t, k) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ') rotate(-4)', P('M-110 -70 h70 l12 12 h138 v140 h-220Z', "#c9a26a", { w: 2 }) + R(-110, -52, 220, 134, "#d8b47a", { w: 2 }) + txt("قضية رقم ٢٠٠٥", 0, -20, 13, "#5a4020", { wt: 800 }) + txt("بني مزار", 0, 4, 15, "#5a4020", { wt: 900 }) + (k > 0 ? G('translate(0 44) scale(' + f2(1 + 1.6 * (1 - eout(k))) + ') rotate(-10)', '<rect x="-74" y="-22" width="148" height="42" rx="5" fill="none" stroke="' + RED + '" stroke-width="4" opacity="' + f2(k) + '"/>' + txt("ضد مجهول", 0, 10, 26, RED, { wt: 900, op: k })) : "")); }
  function pill(u) { var k = eout(clamp((u - .3) / .4)); return G('translate(180 ' + f(150 - (1 - k) * 10) + ')', '<rect x="-92" y="-20" width="184" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + txt("اللينك في البايو ↑", 0, 7, 17, INK, { wt: 900 }), k); }
  function bulbRoom(t, k) { var sw = Math.sin(t * 1.4) * 14, fl = flick(t, 3) * k; return R(-220, -220, 800, 1300, "#050505", { s: 0 }) + G('translate(180 40) rotate(' + f(sw) + ')', '<path d="M0 0 V170" stroke="#2a2a2a" stroke-width="2"/>' + '<circle cx="0" cy="182" r="190" fill="url(#warm)" opacity="' + f2(.35 * fl) + '"/>' + Ci(0, 182, 10, fl > .5 ? BULB : "#3a3a3a", { w: 1.2 }) + R(-5, 166, 10, 8, "#5a5a5a", { w: 1 })) + P('M-220 470 L580 470 V900 H-220Z', "#0e0c0a", { s: 0 }) + '<ellipse cx="' + f(180 + sw * 6) + '" cy="474" rx="110" ry="14" fill="#ffe7a8" opacity="' + f2(.12 * fl) + '"/>'; }

  // ═════════ the shots (line numbers from script.txt; 0, 17 and 45 are the real Al Arabiya recording) ═════════
  // 0 — the recording: «a hideous crime, unlike anything Egypt has seen» — the hamlet asleep, the bulb flickering
  shot(0, push([180, 300], [180, 320], 1.0, 1.16), function (u, d, t) { return villageNight(t, { lights: function (k) { return k === 2 ? .8 : 0; } }) + rec(t, 112); });
  // 1 — that voice is real: a television in a dark room, December 2005
  shot(1, push([180, 330], [180, 320], 1.1, 1.24), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage }) + label("قناة العربية", 180, 170, u, .4, 24, "#fff") + label("ديسمبر 2005", 180, 202, u, 1.2, 18, YEL); }, { tr: "flick" });
  // 2 — the night of 28 December, a small hamlet in Minya called Ezbet Shams El-Din
  shot(2, push([150, 320], [200, 326], 1.0, 1.12), function (u, d, t) { return villageNight(t, { lights: function (k) { return [.8, 0, .7, 0, .6, 0][k]; } }) + label("28 ديسمبر 2005", 180, 168, u, .3, 30, "#fff") + label("عزبة شمس الدين · المنيا", 180, 202, u, 1.0, 18, YEL); }, { tr: "dip" });
  // 3 — a cold night; the hamlet goes to bed early: the windows go dark one by one
  shot(3, push([180, 330], [180, 340], 1.15, 1.25), function (u, d, t) { return villageNight(t, { fog: .35, lights: function (k) { return clamp(1 - (u - .6 - k * .5) * 3) * [.8, .6, .7, .5, .6, .4][k]; } }) + dust(t, 20, "#cfd8ea", .3, 8); });
  // 4 — three houses side by side, three families
  shot(4, push([180, 320], [180, 314], 1.0, 1.08), function (u, d, t) { var s = three(t, { lit: function (k) { return .7; } }); [70, 194, 296].forEach(function (x, k) { s += label(["١", "٢", "٣"][k], x, 228, u, .4 + k * .5, 26, YEL); }); return s; }, { tr: "dip" });
  // 5 — before sunrise, ten of them were no longer alive: the lights die, smash to the number
  shot(5, push([180, 310], [180, 300], 1.0, 1.04), function (u, d, t) { var off = u > D(5) * .55; return three(t, { lit: function (k) { return off ? 0 : .7 * flick(t, k); }, lamp: off ? .25 : 1, dark: off ? .75 : .5 }) + (off ? '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".4"/>' + bigNum("10", 180, 236, u - D(5) * .55, 0, 96, "#e9e2d2") : ""); }, { tr: "smash" });
  // 6 — four of them children, the eldest eleven: four small candles
  shot(6, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 400 L580 400 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 4, 396, 1.6, clamp(u / 1.2)) + bigNum("4", 180, 200, u, .3, 70, "#e9e2d2") + label("أكبرهم 11 سنة", 180, 252, u, 1.4, 20, YEL) + dust(t, 20, "#ffe7a8", .3, 6); }, { tr: "dip" });
  // 7 — who walks into three houses in one night and leaves, unknown to this day? a door left ajar, the dark inside
  shot(7, push([180, 320], [180, 300], 1.0, 1.5), function (u, d, t) { var s = sky("skyVillage") + stars(t, 30, 160) + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .55, door: .18 + .04 * Math.sin(t * .7), doorX: .37 }) + ground(t, 470, "#0e0c09") + fog(t, 460, .3); return s + '<path d="M150 470 L60 640 L120 640 Z" fill="#000" opacity=".5"/>' ; }, { ov: function (u) { return label("مين؟", 180, 200, u, D(7) * .55, 40, "#e9e2d2"); } });
  // 8 — and why did the court call the only accused innocent? the empty cage
  shot(8, push([240, 330], [270, 340], 1.1, 1.3), function (u, d, t) { return court(t) + label("بريء؟", 260, 216, u, D(8) * .45, 34, YEL); }, { tr: "glitch" });
  // 9 — the story of that night and the twenty years after; we start at dawn
  shot(9, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return villageNight(t, { sky: "skyVillage", dark: .5 }) + '<rect x="-220" y="-220" width="800" height="1300" fill="url(#skyDawnT)" opacity="' + f2(k * .4) + '"/>' + label("الليلة… و20 سنة بعدها", 180, 180, u, .4, 24, "#fff"); }, { tr: "dip" });
  // 10 — dawn: the people wake to what happened
  function dawnVillage(t, o) { o = o || {}; var s = sky("skyDawnGrey") + palm(-10, 380, 1.2, t, "#1a1c22") + palm(330, 384, 1.1, t, "#1a1c22") + fog(t, 330, .3, "#c9c2b6"); [[-60, 70, 70, 4], [14, 80, 82, 0], [96, 70, 66, 1], [170, 78, 86, 3], [250, 70, 70, 2], [322, 70, 74, 4]].forEach(function (h) { s += vHouse(h[0], 420, h[1], h[2], { wall: WALLS[h[3]], dark: .25 }); }); return s + ground(t, 420, "#4a4236") + fog(t, 426, .3, "#d8d0c4"); }
  shot(10, push([180, 330], [180, 340], 1.05, 1.15), function (u, d, t) { var s = dawnVillage(t); for (var i = 0; i < 5; i++) s += person(40 + i * 70 + Math.sin(t + i) * 4, 470 + (i % 2) * 14, 1.25, t, { walk: true, ph: i, flip: i % 2, top: i % 2 ? "#e6dfcc" : "#8a7a64", dress: i % 2 ? "#e6dfcc" : "#8a7a64", hat: i % 2 ? "turban" : "scarf", hatCol: i % 2 ? null : "#141218", skin: ["#b98058", "#a87048"][i % 2] }); return s; }, { tr: "flick" });
  // 11 — house after house; people standing at the doors, unable to believe it
  shot(11, push([180, 310], [180, 320], 1.0, 1.1), function (u, d, t) { var pp = ""; [[56, 0], [86, 1], [176, 2], [206, 3], [300, 4]].forEach(function (p, i) { pp += person(p[0], 478, 1.35, t, { view: "back", top: i % 2 ? "#141218" : "#d8d0bc", dress: i % 2 ? "#141218" : "#d8d0bc", hat: i % 2 ? "scarf" : "turban", hatCol: i % 2 ? "#141218" : null }); }); return three(t, { sky: "skyDawnGrey", noMoon: true, dark: .2, lampOff: true, fog: .35 }) + pp; });
  // 12 — the victims were found in a way nobody had seen: a bare bulb swinging over an empty room
  shot(12, push([180, 300], [180, 300], 1.0, 1.12), function (u, d, t) { return bulbRoom(t, 1); }, { tr: "glitch" });
  // 13 — we will not tell those details, out of respect: ten candles
  shot(13, push([180, 330], [180, 336], 1.15, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 400 L580 400 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 10, 392, 1.0, clamp(u / 2)) + label("احترامًا", 180, 220, u, 1.6, 28, "#e9e2d2") + dust(t, 24, "#ffe7a8", .3, 7); }, { tr: "dip" });
  // 14 — the forensic report: heavy blows to the head
  shot(14, push([180, 330], [180, 320], 1.1, 1.25), function (u, d, t) { return R(-220, -220, 800, 1300, "#1a1612", { s: 0 }) + '<circle cx="180" cy="300" r="200" fill="url(#warm)" opacity=".2"/>' + paper(180, 320, 200, 250, -3, { title: "تقرير الطب الشرعي", lines: 14, stamp: clamp((u - 1.2) / .3), stampText: "سري" }) + magnifier(230, 300, 1.1, t); }, { tr: "flick" });
  // 15 — the news left the hamlet for every home in Egypt: a city of windows lit blue by televisions
  shot(15, push([180, 320], [180, 300], 1.0, 1.1), function (u, d, t) { var s = sky("skyVillage") + stars(t, 50, 200); for (var r = 0; r < 4; r++) for (var i = 0; i < 9; i++) { var x = -60 + i * 52 + (r % 2) * 26, y = 230 + r * 64, w = 46, h = 60; s += R(x, y, w, h + 30, ["#1a1e2a", "#20242f", "#171a24"][(i + r) % 3], { w: 1 }); for (var w2 = 0; w2 < 2; w2++) { var on = clamp(u * 2.5 - hash(i * 5 + r * 3 + w2) * 1.5); s += R(x + 7 + w2 * 20, y + 12, 12, 14, on > .5 ? "#9fc4ff" : "#0a0c12", { w: .7, op: on > .5 ? .6 + .4 * Math.sin(t * 8 + i + w2) : 1 }); } } return s + label("كل بيت في مصر", 180, 180, u, .8, 26, "#fff"); });
  // 16 — and the television said:
  shot(16, push([180, 330], [180, 330], 1.2, 1.45), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage, static: .3 }); });
  // 17 — the recording: «ten people from three families… in neighbouring houses»
  shot(17, push([180, 326], [180, 320], 1.0, 1.1), function (u, d, t) { return three(t, { lit: function () { return 0; }, dark: .6, lamp: .6 }) + rec(t, 112); }, { tr: "flick" });
  // 18 — the hamlet turned over: police, prosecutors, journalists (camera flashes)
  shot(18, push([180, 330], [190, 330], 1.0, 1.1), function (u, d, t) { var s = three(t, { sky: "skyDawnGrey", noMoon: true, dark: .3, lampOff: true }) + policeTruck(240, 470, 1.0, t); for (var i = 0; i < 4; i++) s += person(30 + i * 40, 486, 1.3, t, { view: "back", top: i === 1 ? "#1c2230" : "#d8d0bc", dress: i === 1 ? null : "#d8d0bc", pants: "#1c2230", cap: i === 1 ? "#1c2230" : null, hat: i === 1 ? null : "turban" }); var fl = (t * 3) % 1 < .06 ? 1 : 0; return s + (fl ? '<rect x="-220" y="-220" width="800" height="1300" fill="#fff" opacity=".22"/>' : "") + dust(t, 20, "#fff", .3, 9); }, { tr: "smash" });
  // 19–22 — the rumours: feud, sorcery, buried treasure — none proven
  function rumours(t, u, ks, x2) { var s = R(-220, -220, 800, 1300, "#07070a", { s: 0 }) + fog(t, 300, .25, "#5a5a6a") + fog(t, 420, .2, "#4a4a5a") + dust(t, 30, "#c9c2d8", .3, 5); s += smokeWord("تار", 92, 230, t, ks[0], x2) + smokeWord("سحر", 268, 300, t, ks[1], x2) + smokeWord("كنز", 140, 380, t, ks[2], x2); return s; }
  shot(19, push([180, 320], [180, 310], 1.0, 1.08), function (u, d, t) { return rumours(t, u, [0, 0, 0]) + label("الحكايات", 180, 300, u, .1, 34, "#e9e2d2"); }, { tr: "dip" });
  shot(20, push([180, 310], [180, 320], 1.0, 1.1), function (u, d, t) { var dd = D(20); return rumours(t, u, [clamp(u / .5), clamp((u - dd * .38) / .5), clamp((u - dd * .7) / .5)]); });
  shot(21, push([180, 320], [180, 320], 1.1, 1.14), function (u, d, t) { return rumours(t, u, [1, 1, 1], clamp(u / .8)); });
  shot(22, push([180, 320], [180, 300], 1.14, 1.3), function (u, d, t) { return rumours(t, u, [1, 1, 1], 1) + label("افتكروا", 180, 160, u, .1, 30, YEL); });
  // 23–24 — not long after, the police announce an arrest: a young man led away (from behind; never his face)
  shot(23, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = sky("skyVillage") + stars(t, 40, 200) + palm(40, 380, 1, t) + ground(t, 400, "#12100c") + policeTruck(250, 440, 1.0, t); s += person(120, 470, 1.5, t, { view: "back", top: "#2a3048", pants: "#1c2230", cap: "#1c2230" }) + person(152, 470, 1.5, t, { view: "back", top: "#d8d0bc", dress: "#d8d0bc" }) + person(184, 470, 1.5, t, { view: "back", top: "#2a3048", pants: "#1c2230", cap: "#1c2230" }); return s + label("القبض على متهم", 180, 170, u, 1.2, 24, "#fff"); }, { tr: "smash" });
  shot(24, push([152, 380], [152, 370], 1.4, 1.6), function (u, d, t) { var s = sky("skyVillage") + ground(t, 400, "#12100c") + policeTruck(250, 440, 1.0, t) + person(152, 470, 1.5, t, { view: "back", top: "#d8d0bc", dress: "#d8d0bc" }); return s + bigNum("27", 152, 290, u, .2, 60, "#e9e2d2") + label("سنة", 152, 316, u, .5, 18, YEL); });
  // 25 — the investigation says he confessed to everything
  shot(25, push([180, 330], [180, 320], 1.1, 1.22), function (u, d, t) { var k = clamp(u / d); return R(-220, -220, 800, 1300, "#14110e", { s: 0 }) + '<circle cx="180" cy="200" r="160" fill="url(#lamp)" opacity=".2"/>' + paper(180, 330, 210, 270, 2, { title: "محضر اعتراف", lines: Math.floor(4 + k * 12), seed: 3 }) + G('translate(' + f(110 + k * 120) + ' ' + f(300 + k * 120) + ') rotate(35)', R(-4, -60, 8, 60, "#1e2a44", { w: 1 }) + P('M-4 0 L0 10 L4 0Z', "#c9a860", { w: .8 })); }, { tr: "flick" });
  // 26 — people calmed down; the case was over… so they thought
  shot(26, push([180, 320], [180, 330], 1.0, 1.08), function (u, d, t) { return dawnVillage(t) + label("خلصت؟", 180, 190, u, D(26) * .6, 32, "#e9e2d2"); }, { tr: "dip" });
  // 27 — to the Minya criminal court
  shot(27, push([180, 300], [180, 310], 1.0, 1.1), function (u, d, t) { return courthouse(t) + label("محكمة جنايات المنيا", 180, 150, u, .3, 24, YEL); }, { tr: "dip" });
  // 28–29 — the judge opens the papers, page by page… and the court found something nobody expected
  function papers(t, u, fl) { var s = R(-220, -220, 800, 1300, "#1a1410", { s: 0 }) + '<circle cx="180" cy="300" r="190" fill="url(#warm)" opacity=".22"/>'; for (var i = 0; i < 6; i++) s += paper(180 + i * 2, 360 - i * 3, 220, 140, -6 + i * 2, { lines: 7, seed: i }); var p = (u * .9) % 1; if (fl) s += G('translate(180 340) scale(' + f2(Math.cos(p * Math.PI)) + ' 1)', paper(0, 0, 220, 140, 0, { lines: 7, seed: 9 })); return s + dust(t, 24, "#ffe7a8", .3, 2); }
  shot(28, push([180, 340], [180, 340], 1.1, 1.25), function (u, d, t) { return court(t, { cage: false }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".3"/>' + G('translate(0 60)', papers(t, u, true)); }, { tr: "glitch" });
  shot(29, push([180, 340], [180, 330], 1.25, 1.7), function (u, d, t) { return papers(t, u, false) + magnifier(180, 320, 1.6, t) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity="' + f2(clamp(u / d) * .35) + '"/>'; });
  // 30 — the bio line: the frame holds, the camera still creeps
  shot(30, push([180, 330], [180, 326], 1.7, 1.76), function (u, d, t) { return papers(t, u + D(29), false) + magnifier(180, 320, 1.6, t) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".35"/>' ; }, { ov: function (u) { return pill(u); } });
  // 31 — back to the court
  shot(31, push([180, 300], [180, 320], 1.0, 1.06), function (u, d, t) { return court(t, { cage: false }); }, { tr: "smash" });
  // 32 — the galabeya he was said to wear that night: not one drop of blood
  shot(32, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="290" r="200" fill="url(#lamp)" opacity=".22"/>' + galabeya(180, 340, 1.1, t) + magnifier(220, 300, 1.2, t) + bigNum("0", 90, 200, u, D(32) * .6, 70, "#e9e2d2") + label("نقطة دم", 90, 236, u, D(32) * .7, 18, YEL); }, { tr: "flick" });
  // 33 — the shoes: no trace of human blood
  shot(33, push([180, 340], [180, 334], 1.15, 1.3), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="340" r="180" fill="url(#lamp)" opacity=".2"/>' + shoes(180, 380, 1.6, t) + magnifier(230, 340, 1.1, t) + label("مفيش دم", 180, 230, u, D(33) * .5, 28, YEL); });
  // 34 — imagine: ten, in three houses, and not one drop on his clothes
  shot(34, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 1.2) / 1.5); return three(t, { dark: .6, lamp: .5 }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity="' + f2(.35 * k) + '"/>' + G('translate(0 0)', galabeya(180, 330, .8 * k + .001, t), k) + bigNum("10", 70, 170, u, .4, 46, "#e9e2d2") + bigNum("3", 290, 170, u, 1.0, 46, "#e9e2d2"); }, { tr: "dip" });
  // 35 — one man, all of that, in that time? the court found it hard to believe: one shadow, ten candles, a clock
  shot(35, push([180, 330], [180, 320], 1.05, 1.15), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 420 L580 420 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 10, 416, .8, 1) + shadowMan(180, 360, 1.3, t, .95) + label("شخص واحد؟", 180, 150, u, .5, 30, "#e9e2d2"); }, { tr: "glitch" });
  // 36 — the medical reports do not match the witnesses: two papers that disagree
  shot(36, push([180, 320], [180, 320], 1.1, 1.18), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + paper(100, 320, 140, 190, -6, { title: "التقرير الطبي", lines: 10, seed: 2 }) + paper(262, 320, 140, 190, 5, { title: "أقوال الشهود", lines: 10, seed: 5 }) + G('translate(181 320)', xLine(clamp((u - .8) / .5))) + dust(t, 20, "#ffe7a8", .25, 3); });
  function xLine(k) { if (k <= 0) return ""; return '<path d="M-22 -22 L' + f(-22 + 44 * clamp(k * 2)) + ' ' + f(-22 + 44 * clamp(k * 2)) + '" stroke="' + RED + '" stroke-width="7" stroke-linecap="round"/>' + (k > .5 ? '<path d="M22 -22 L' + f(22 - 44 * clamp(k * 2 - 1)) + ' ' + f(-22 + 44 * clamp(k * 2 - 1)) + '" stroke="' + RED + '" stroke-width="7" stroke-linecap="round"/>' : ""); }
  // 37 — the confession itself, taken under pressure and coercion: the paper, a shadow hand over it
  shot(37, push([180, 330], [180, 320], 1.1, 1.25), function (u, d, t) { var k = clamp((u - D(37) * .5) / 1); return R(-220, -220, 800, 1300, "#0e0c0a", { s: 0 }) + paper(180, 330, 210, 270, 2, { title: "محضر اعتراف", lines: 16, seed: 3, stamp: k, stampText: "إكراه" }) + '<path d="M-60 120 Q60 200 130 260 Q160 250 190 290 Q150 300 120 280 L-60 200Z" fill="#000" opacity="' + f2(.55 + .1 * Math.sin(t * 1.4)) + '"/>'; }, { tr: "flick" });
  // 38 — September 2006, the verdict is read: the court, a heartbeat
  shot(38, push([180, 300], [180, 270], 1.0, 1.35), function (u, d, t) { return court(t, { inCage: true }) ; }, { tr: "dip", ov: function (u) { return bigNum("سبتمبر 2006", 180, 300, u, .3, 34, "#e9e2d2"); } });
  // 39 — «براءة»: smash cut, the gavel comes down
  shot(39, push([180, 320], [180, 320], 1.1, 1.0), function (u, d, t) { var a = u < .15 ? lerp(-40, 0, u / .15) : 0; return court(t, { cage: false }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".45"/>' + gavel(180, 380, 1.4, a) + txt("براءة", 180, 230, 64, YEL, { st: "rgba(0,0,0,.85)", sw: 6, wt: 900, op: clamp(u / .2) }); }, { tr: "smash" });
  // 40 — the prosecution appealed, the victims' families appealed
  shot(40, push([180, 320], [180, 320], 1.1, 1.16), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + paper(110, 320, 140, 190, -6, { title: "طعن النيابة", lines: 10, stamp: clamp(u / .4), stampText: "طعن" }) + paper(252, 320, 140, 190, 5, { title: "طعن الأهالي", lines: 10, seed: 4, stamp: clamp((u - D(40) * .5) / .4), stampText: "طعن" }); }, { tr: "flick" });
  // 41 — 22 December 2008: the Court of Cassation upholds the acquittal; the last word
  shot(41, push([180, 300], [180, 310], 1.0, 1.1), function (u, d, t) { return courthouse(t, { name: "محكمة النقض · القاهرة", dark: .35 }) + label("22 ديسمبر 2008", 180, 150, u, .4, 28, "#fff") + label("تأييد البراءة", 180, 182, u, D(41) * .5, 20, YEL); }, { tr: "dip" });
  // 42 — innocent, by a final ruling
  shot(42, push([180, 320], [180, 310], 1.1, 1.2), function (u, d, t) { return court(t, { cage: true }) + '<rect x="-220" y="-220" width="800" height="1300" fill="#000" opacity=".35"/>' + label("بريء", 180, 210, u, .4, 44, YEL) + label("حكم نهائي", 180, 246, u, 1.2, 20, "#fff"); });
  // 43 — so who did it? a shadow in a doorway
  shot(43, push([180, 330], [180, 320], 1.2, 1.4), function (u, d, t) { var s = sky("skyVillage") + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .6, door: .8, doorX: .37, inner: "#000" }) + ground(t, 470, "#0e0c09") + fog(t, 460, .3); return s + G('translate(0 0)', shadowMan(180, 470, 1.25, t, .95)) ; }, { tr: "glitch", ov: function (u) { return label("مين؟", 180, 200, u, .2, 40, "#e9e2d2"); } });
  // 44 — nobody knows: the doorway is empty
  shot(44, push([180, 320], [180, 316], 1.4, 1.44), function (u, d, t) { return sky("skyVillage") + vHouse(40, 470, 280, 360, { wall: WALLS[0], dark: .7, door: .8, doorX: .37, inner: "#000" }) + ground(t, 470, "#0e0c09") + fog(t, 460, .35); }, { tr: "smash" });
  // 45 — the recording: «everyone ends where they began… at point zero» — the TV, static creeping in
  shot(45, push([180, 330], [180, 330], 1.2, 1.36), function (u, d, t) { return room(t) + tv(180, 330, 1.3, t, { screen: screenVillage, static: clamp(u / d) * .9 }) + rec(t, 112); }, { tr: "flick" });
  // 46 — remember the rumours? none proven, to this day
  shot(46, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { var k = clamp(1 - (u - D(46) * .6) / 1.2); return rumours(t, u, [k, k, k], 1); }, { tr: "dip" });
  // 47 — the file is closed, two words written on it: «ضد مجهول»
  shot(47, push([180, 320], [180, 320], 1.05, 1.15), function (u, d, t) { return R(-220, -220, 800, 1300, "#15120f", { s: 0 }) + '<circle cx="180" cy="300" r="200" fill="url(#warm)" opacity=".18"/>' + folder(180, 320, 1.15, t, clamp((u - D(47) * .55) / .25)); }, { tr: "smash" });
  // 48 — in Ezbet Shams El-Din, three houses still remember the night of 28 December
  shot(48, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) { return three(t, { lit: function (k) { return .55 + .1 * Math.sin(t + k); }, dark: .55 }) + label("عزبة شمس الدين", 180, 176, u, .4, 26, "#fff"); }, { tr: "dip" });
  // 49 — their families still wait for an answer, twenty years on
  shot(49, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return R(-220, -220, 800, 1300, "#060505", { s: 0 }) + P('M-220 400 L580 400 V900 H-220Z', "#120e0a", { s: 0 }) + candles(t, 10, 392, 1.0, 1) + bigNum("20 سنة", 180, 220, u, .6, 46, "#e9e2d2") + dust(t, 20, "#ffe7a8", .3, 7); });
  // 50 — tell us: which story next time?
  shot(50, push([180, 320], [180, 316], 1.0, 1.06), function (u, d, t) { return villageNight(t, { lights: function (k) { return .5; } }) + label("قولولنا!", 180, 180, u, .3, 34, "#fff"); }, { tr: "dip" });

  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 9) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 7 * Math.sin(t * .9) + 3 * Math.sin(t * 2.1), cy = c[1] + 6 * Math.cos(t * .8), z = c[2] * (1 + .02 * Math.sin(t * .7)); return '<g transform="translate(180 320) rotate(' + f(.4 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  // the horror cuts
  function trans(kind, u, prev, cur) {
    if (kind === "smash") {   // a white crack (with moving rays), then black, then the new frame stutters on
      if (u < .06) return cur + '<rect x="-20" y="-20" width="400" height="680" fill="#f4f2ec" opacity=".85"/>' + rays(u * 40, 180, 300, 1.2, 7, 500, .6);
      if (u < .22) return '<rect width="360" height="640" fill="#000"/>' + dust(u * 30, 30, "#fff", .4, 1);
      if (u < .5) return '<g opacity="' + (Math.sin(u * 90) > -.2 ? 1 : .25) + '">' + cur + '</g>';
      return cur;
    }
    if (kind === "flick") { if (u < .45) return '<g opacity="' + f2(Math.sin(u * 70) > 0 ? clamp(u / .45) : .05) + '">' + cur + '</g>'; return cur; }
    if (kind === "glitch") {
      if (u < .3) { var s = '<rect width="360" height="640" fill="#000"/>'; for (var k = 0; k < 8; k++) { var y = k * 80, dx = (hash(k + Math.floor(u * 40)) - .5) * 60 * (1 - u / .3); s += '<svg x="0" y="' + y + '" width="360" height="80" viewBox="0 ' + y + ' 360 80" overflow="hidden"><g transform="translate(' + f(dx) + ' 0)">' + (u < .15 && k % 2 ? prev : cur) + '</g></svg>'; } return s + '<rect width="360" height="640" fill="#c8261e" opacity="' + f2(.12 * (1 - u / .3)) + '"/>'; }
      return cur;
    }
    if (kind === "dip") { if (u < .3) return prev + '<rect width="360" height="640" fill="#000" opacity="' + f2(u / .3) + '"/>'; if (u < .7) return cur + '<rect width="360" height="640" fill="#000" opacity="' + f2(1 - (u - .3) / .4) + '"/>'; return cur; }
    return u < .35 ? prev + '<g opacity="' + f2(ease(u / .35)) + '">' + cur + '</g>' : cur;
  }
  window.__panel = function (svg, t) {
    CLN = 0; SH.sort(function (p, q) { return p.a - q.a; });
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, cur = drawShot(sh, t, next) + (sh.o.ov ? sh.o.ov(u, next - sh.a, t) : ""), s;
    if (i > 0 && u < .75) { var pv = SH[i - 1]; s = trans(sh.o.tr, u, (sh.o.tr === "glitch" || sh.o.tr === "dip" || !sh.o.tr) ? drawShot(pv, t, sh.a) : "", cur); }
    else s = cur;
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" fill="url(#vig)" opacity=".5"/><rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
