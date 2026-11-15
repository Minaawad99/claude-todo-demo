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
    if (o.hat === "whitecap") g += P('M-12 -9 Q-13 -26 0 -27 Q13 -26 12 -9 Z', "#f4f2ec", { w: 1.2 }) + '<path d="M-12 -12 Q0 -9 12 -12" stroke="#c8c4bc" stroke-width="1" fill="none"/>';
    if (o.hat === "fire") g += P(side ? 'M-13 -6 Q-14 -24 2 -25 Q15 -24 15 -8 L20 -4 L-15 -3 Z' : 'M-15 -6 Q-15 -25 0 -26 Q15 -25 15 -6 L18 -3 L-18 -3 Z', "#2e3034", { w: 1.3 }) + '<path d="M0 -26 V-8" stroke="#8a8a8a" stroke-width="2.4"/>';
    if (o.mask && view !== "back") g += P(side ? 'M2 -2 Q14 -2 13 8 Q8 14 2 12Z' : 'M-9 -1 Q0 -4 9 -1 Q10 9 0 12 Q-10 9 -9 -1Z', "#e8e4dc", { w: 1 }) + '<path d="M-12 -2 L-9 0 M12 -2 L9 0" stroke="#c8c4bc" stroke-width="1"/>';
    if (o.hat === "officer") g += P('M-13 -9 Q-14 -22 0 -23 Q14 -22 13 -9 Z', o.hatCol || "#f4f2ec", { w: 1.2 }) + P('M-13 -9 Q0 -5 13 -9 L14 -6 Q0 -2 -14 -6Z', "#141418", { w: 1 }) + R(-13, -13, 26, 4, "#16182a", { s: 0 }) + '<circle cx="0" cy="-11" r="2" fill="#c9a860"/>';
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
    g += R(-4, -144, 8, 10, skin, { w: 1.1 }) + G('translate(0 -157) rotate(' + f(view === "up" ? (side ? -18 : 0) : br) + ')', face(view, { skin: skin, hair: o.helmet ? 'short' : hair, hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, helmet: o.helmet, mustache: o.mustache, beard: o.beard, hat: o.hat, hatCol: o.hatCol, mask: o.mask }));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * .42 * (o.flip ? -1 : 1)) + ' ' + f(s * .42) + ')', g, o.op);
  }
  // a big close-up portrait (the user's middle panel): head and shoulders, cel-shaded, light from the left
  function portrait(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, skin = o.skin || "#c98f66", top = o.top || "#f0ede4", bl = (t % 4.2) < .12;
    var g = '<clipPath id="' + cid + '"><rect x="4" y="-200" width="200" height="400"/></clipPath>';
    g += cel('M-70 120 Q-66 60 -30 48 L30 48 Q66 60 70 120 Z', top, cid, { w: 2 }) + '<path d="M-14 48 L0 70 L14 48" stroke="' + INK + '" stroke-width="1.6" fill="' + darker(top, .85) + '"/>';
    g += cel('M-11 20 L-12 52 Q0 58 12 52 L11 20 Z', skin, cid, { w: 1.6 });
    g += G('scale(2.6)', face("front", { skin: skin, hair: o.hair || "bob", hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, child: o.child, helmet: o.helmet, mustache: o.mustache, beard: o.beard, hat: o.hat, hatCol: o.hatCol, mask: o.mask }));
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

  // ── «تشيرنوبل» in the «القصة 2D» look. Shapes from real photographs (../refs/SOURCES.md): the unit 3 control room
  //    (curved wall of grey-green panels, light grids, the round core map, tiled white ceiling with strip lights, operators
  //    in white coats and caps), the plant with its tall red-and-white lattice vent stack, Pripyat's panel apartment
  //    blocks in the forest, the yellow-gondola Ferris wheel, and the RBMK cutaway (graphite core, vertical channels,
  //    control rods, steam drums, pumps). ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  var still = function (u, d) { return [180, 320, 1 + 0.04 * u / d]; };
  function tri(t, u, d, A, B, C) {
    var y = [74, 206, 338], h = 126, s = R(0, 0, 360, 640, "#0b0c0e", { s: 0 }), arr = [A, B, C];
    for (var k = 0; k < 3; k++) { var kk = clamp((u - k * 0.35) / 0.5), m = 1 + 0.06 * u / d; s += G('translate(' + f((1 - eout(kk)) * (k % 2 ? -40 : 40)) + ' 0)', panelBox(y[k], h, arr[k](t), 'translate(180 ' + (h / 2) + ') scale(' + f2(m) + ') translate(-180 ' + (-h / 2) + ')', t), kk); }
    return s;
  }
  var SK = ["#e0b48c", "#d9a57a", "#e8c0a0", "#c98f66"];
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.5 + hash(i + 1) * 1.1) + '" fill="#fff" opacity="' + f2(.3 + .5 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function nightSky(t, h) { return sky("skyStar") + stars(t, 90, h || 360); }
  // ── people of 1986 ──
  function op(x, y, s, t, k, o) { return person(x, y, s, t, Object.assign({ top: "#f4f2ec", pants: "#f4f2ec", coat: "#f0eee6", hat: "whitecap", skin: SK[k % 4], ph: k, mustache: k % 3 === 1 }, o || {})); }
  function fireman(x, y, s, t, k, o) { return person(x, y, s, t, Object.assign({ top: "#3a3c42", pants: "#3a3c42", coat: "#3a3c42", hat: "fire", skin: SK[k % 4], ph: k }, o || {})); }
  function citizen(x, y, s, t, k, o) { var kinds = [{ top: "#6a7a8a", pants: "#3a3a44" }, { top: "#c86a5a", dress: "#c86a5a", hair: "bob" }, { top: "#5a6a4a", pants: "#3a3428", hat: "flat", hatCol: "#4a4a4a" }, { top: "#d8c8a0", dress: "#8a6a8a", hair: "bun" }, { top: "#3a5a8a", pants: "#2a2a3a" }, { top: "#e8d8b8", dress: "#5a8a6a", hair: "bob" }];
    return person(x, y, s, t, Object.assign({ skin: SK[k % 4], ph: k }, kinds[k % 6], o || {})); }
  // ── the plant: turbine hall, reactor buildings, the lattice vent stack (red and white bands) ──
  function stack(x, y, h, o) { o = o || {}; var g = P('M' + (x - 9) + ' ' + y + ' L' + (x - 6) + ' ' + (y - h) + ' L' + (x + 6) + ' ' + (y - h) + ' L' + (x + 9) + ' ' + y + ' Z', o.night ? "#5a5a60" : "#e8e4dc", { w: 1.4 });
    for (var b = 0; b < 4; b++) g += P('M' + f(x - 8.6 + b * .6) + ' ' + f(y - h * (.18 + b * .22)) + ' h' + f(17.2 - b * 1.2) + ' v' + f(h * .06) + ' h' + f(-17.2 + b * 1.2) + ' Z', o.night ? "#7a3a34" : "#c23a2a", { s: 0 });
    g += P('M' + (x - 22) + ' ' + y + ' L' + (x - 9) + ' ' + (y - h * .8) + ' M' + (x + 22) + ' ' + y + ' L' + (x + 9) + ' ' + (y - h * .8), "none", { w: 1.6, s: o.night ? "#4a4a50" : "#8a8a8a" });
    for (var k = 0; k < 8; k++) g += '<path d="M' + f(x - 22 + k * 1.6) + ' ' + f(y - k * h * .1) + ' L' + f(x + 22 - k * 1.6) + ' ' + f(y - (k + 1) * h * .1) + ' M' + f(x + 22 - k * 1.6) + ' ' + f(y - k * h * .1) + ' L' + f(x - 22 + k * 1.6) + ' ' + f(y - (k + 1) * h * .1) + '" stroke="' + (o.night ? "#4a4a50" : "#8a8a8a") + '" stroke-width=".7"/>';
    if (o.blink) g += '<circle cx="' + x + '" cy="' + (y - h - 2) + '" r="2.4" fill="#ff3a2a" opacity="' + f2(.5 + .5 * Math.sin(o.t * 4)) + '"/>';
    return g; }
  function plant(x, y, s, t, o) {
    o = o || {}; var n = o.night, win = n ? "#ffd98a" : "#5a6a7a", g = "";
    g += R(-170, -40, 340, 40, n ? "url(#concreteN)" : "url(#concrete)", { w: 1.6 }) + R(-170, -44, 340, 4, n ? "#3a3c44" : "#a8a498", { w: 1 });
    for (var w = 0; w < 30; w++) g += R(-164 + w * 11, -30, 6, 8, (n && hash(w) > .4) ? win : (n ? "#2a2c34" : "#7a8a96"), { s: 0 });
    [[-130, 1], [-60, 2], [30, 3], [100, 4]].forEach(function (u) { var bx = u[0], br = o.blown && u[1] === 4;
      g += br ? P('M' + bx + ' -40 L' + bx + ' -80 L' + (bx + 10) + ' -92 L' + (bx + 22) + ' -78 L' + (bx + 34) + ' -96 L' + (bx + 46) + ' -82 L' + (bx + 60) + ' -88 L' + (bx + 60) + ' -40 Z', n ? "#2e3038" : "#8a8678", { w: 1.6 }) : R(bx, -100, 60, 60, n ? "url(#concreteN)" : "url(#concrete)", { w: 1.6 }) + R(bx + 4, -112, 52, 12, n ? "#3a3c44" : "#b8b4a8", { w: 1.2 });
      if (!br) for (var r = 0; r < 3; r++) g += R(bx + 6, -92 + r * 16, 48, 3, n ? (hash(u[1] + r) > .5 ? "#ffd98a" : "#2a2c34") : "#9aa4ac", { s: 0 });
      g += txt(String(u[1]), bx + 30, -48, 12, n ? "#8a8a90" : "#4a4a50", { font: "Noto Serif", wt: 700 }); });
    g += stack(100 + 76, -100, 120, { night: n, blink: n, t: t });
    if (o.blown) { var k = o.k == null ? 1 : o.k; g += '<rect x="96" y="-' + f(260 * k) + '' + '" width="40" height="' + f(260 * k) + '" fill="url(#beam)" opacity="' + f2(.85 * k * (.85 + .15 * Math.sin(t * 6))) + '"/><ellipse cx="128" cy="-84" rx="46" ry="22" fill="url(#blueGlow)" opacity="' + f2(.9 * k) + '"/>';
      for (var q = 0; q < 8; q++) { var ph = ((t * .3 + q / 8) % 1); g += '<circle cx="' + f(120 + q * 3 - ph * 70) + '" cy="' + f(-100 - ph * 160) + '" r="' + f(8 + ph * 26) + '" fill="#2a2a30" opacity="' + f2(.6 * (1 - ph)) + '"/>'; }
      if (o.fire) g += flames(t, 96, 160, -82, 24, 8, .9); }
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function forestBand(y, o) { o = o || {}; var s = R(-220, y, 800, 600, o.night ? "#141c18" : "url(#forest)", { s: 0 }); for (var i = 0; i < 70; i++) { var x = -220 + i * 12 + hash(i) * 6, h = 12 + hash(i + 2) * 16; s += P('M' + f(x - 7) + ' ' + y + ' L' + f(x) + ' ' + f(y - h) + ' L' + f(x + 7) + ' ' + y + ' Z', o.night ? "#1a2620" : ["#3a5a32", "#4a6a3a", "#2e4a2a"][i % 3], { s: 0 }); } return s; }
  // Pripyat: 9- and 16-storey panel blocks in the forest
  function block(x, y, w, h, t, o) { o = o || {}; var g = R(x, y - h, w, h, o.night ? "#3a3c46" : (o.col || "#d8d4c8"), { w: 1.4 }), fl = Math.floor(h / 9), cols = Math.floor(w / 8);
    for (var r = 0; r < fl; r++) for (var c = 0; c < cols; c++) { var lit = o.night ? hash(r * 31 + c + x) > (o.lit || .82) : false; g += R(x + 3 + c * 8, y - h + 4 + r * 9, 4, 5, lit ? "#ffd98a" : (o.night ? "#24262e" : (o.empty ? "#3a3a3a" : "#7a8a9a")), { s: 0 }); }
    if (!o.night) g += P('M' + x + ' ' + (y - h) + ' h' + w + ' v4 h' + (-w) + ' Z', "#a8a498", { s: 0 }); return g; }
  function pripyat(t, y, o) { o = o || {}; var s = ""; [[-120, 70, 150, "#d8d4c8"], [-40, 50, 90, "#e4dccc"], [20, 80, 160, "#d0ccc0"], [110, 60, 100, "#dcd8cc"], [180, 70, 150, "#e0dcd0"], [260, 90, 90, "#d4d0c4"], [350, 60, 140, "#dcd8cc"]].forEach(function (b, i) { s += block(b[0], y, b[1], b[2], t, { night: o.night, col: b[3], lit: o.lit, empty: o.empty }); });
    return s + forestBand(y, o); }
  function ferris(x, y, s, t, o) { o = o || {}; var g = "", r = 60, rot = o.rot || 0; g += P('M-40 70 L0 0 L40 70', "none", { w: 4, s: o.rust ? "#7a4a2a" : "#c23a2a" }); g += '<circle r="' + r + '" fill="none" stroke="' + (o.rust ? "#7a4a2a" : "#c23a2a") + '" stroke-width="3"/><circle r="12" fill="none" stroke="' + (o.rust ? "#7a4a2a" : "#c23a2a") + '" stroke-width="3"/>';
    for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283 + rot, cx = Math.cos(a) * r, cy = Math.sin(a) * r; g += '<path d="M0 0 L' + f(cx) + ' ' + f(cy) + '" stroke="' + (o.rust ? "#6a4a2a" : "#a83a2a") + '" stroke-width="1.2"/>' + P('M' + f(cx - 6) + ' ' + f(cy + 2) + ' q6 -12 12 0 v8 h-12 Z', o.rust ? "#b8962a" : "#f2c230", { w: 1 }); }
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  // ── the control room (curved wall of grey-green panels, light grids, the round core map, tiled ceiling, desks) ──
  function controlRoom(t, o) {
    o = o || {}; var s = R(-200, -200, 760, 1040, "#3a4440", { s: 0 }) + R(-200, -200, 760, 260, "#e8e6de", { s: 0 });
    for (var c = 0; c < 6; c++) s += R(-120 + c * 110, -150 + (c % 2) * 30, 70, 10, "#fffbe8", { w: .8 }) + '<rect x="' + (-120 + c * 110) + '" y="' + (-150 + (c % 2) * 30) + '" width="70" height="10" fill="url(#warm)" opacity=".4"/>';
    for (var gx = 0; gx < 14; gx++) s += '<path d="M' + (-200 + gx * 60) + ' -200 V60" stroke="#c8c6be" stroke-width="1"/>';
    s += P('M-200 60 Q180 20 560 60 L560 380 Q180 340 -200 380 Z', "url(#panel)", { w: 2 });
    for (var p = 0; p < 11; p++) { var px = -180 + p * 70; s += '<path d="M' + px + ' ' + f(56 - Math.sin((p / 10) * Math.PI) * 30) + ' V' + f(376 - Math.sin((p / 10) * Math.PI) * 30) + '" stroke="#3a4a42" stroke-width="1.4"/>';
      for (var r = 0; r < 9; r++) for (var q = 0; q < 6; q++) { var on = hash(p * 97 + r * 11 + q + Math.floor(t * (o.alarm ? 6 : 1.5) + hash(p + r) * 4)) > (o.alarm ? .5 : .78); s += R(px + 6 + q * 10, 70 + r * 14 - Math.sin((p / 10) * Math.PI) * 30, 6, 6, on ? (o.alarm && (q + r) % 3 === 0 ? "#ff4a3a" : ["#f2e6a0", "#9ad08a", "#f2a65a"][(p + q) % 3]) : "#4a5650", { s: 0 }); } }
    s += '<circle cx="180" cy="150" r="56" fill="#2a3430" stroke="' + INK + '" stroke-width="2"/>';
    for (var m = 0; m < 120; m++) { var a = hash(m) * 6.28, rr = Math.sqrt(hash(m + 7)) * 50; s += '<circle cx="' + f(180 + Math.cos(a) * rr) + '" cy="' + f(150 + Math.sin(a) * rr) + '" r="1.8" fill="' + (o.alarm && hash(m + Math.floor(t * 8)) > .6 ? "#ff5a3a" : "#e8f0c8") + '" opacity=".9"/>'; }
    s += P('M-200 380 L560 380 L560 640 L-200 640 Z', "#d8d4c8", { s: 0 }); for (var tl = 0; tl < 30; tl++) s += P('M' + f(-200 + hash(tl) * 760) + ' ' + f(400 + hash(tl + 3) * 240) + ' l' + f(10 + hash(tl) * 30) + ' ' + f(4 + hash(tl + 1) * 10) + ' l' + f(-6) + ' ' + f(8), "none", { w: .8, s: "#b8b4a8" });
    s += P('M-200 420 Q180 380 560 420 L560 470 Q180 430 -200 470 Z', "#5a6a62", { w: 2 }); for (var k = 0; k < 18; k++) s += R(-180 + k * 42, 418 - Math.sin(k / 17 * Math.PI) * 30, 26, 8, ["#e8e4dc", "#c23a2a", "#3a3a3a"][k % 3], { w: .6 });
    if (o.red) s += R(-200, -200, 760, 1040, "#ff2a1a", { s: 0, op: o.red * (.5 + .5 * Math.sin(t * 10)) });
    return s; }
  function az5(x, y, s, t, o) { o = o || {}; var press = o.press || 0, g = R(-70, -50, 140, 100, "#5a6a62", { w: 2 }) + R(-50, -36, 100, 22, "#e8e4dc", { w: 1.2 }) + txt("АЗ-5", 0, -18, 16, "#1a1a1a", { font: "Noto Serif", wt: 700 });
    g += '<circle cx="0" cy="18" r="22" fill="#3a3a3a" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="' + f(16 + press * 3) + '" r="16" fill="#d8322a" stroke="' + INK + '" stroke-width="2"/><ellipse cx="-5" cy="' + f(10 + press * 3) + '" rx="6" ry="3" fill="#ff9a8a" opacity=".7"/>';
    if (o.glow) g += '<circle cx="0" cy="18" r="40" fill="#ff3a2a" opacity="' + f2(.25 + .2 * Math.sin(t * 8)) + '"/>';
    if (o.finger != null) { var fy = lerp(-120, 2 + press * 3, o.finger); g += P('M-10 ' + f(fy - 200) + ' L-10 ' + f(fy) + ' Q0 ' + f(fy + 12) + ' 10 ' + f(fy) + ' L12 ' + f(fy - 200) + ' Z', "#e0b48c", { w: 1.6 }) + P('M-14 ' + f(fy - 240) + ' L-14 ' + f(fy - 120) + ' L16 ' + f(fy - 120) + ' L16 ' + f(fy - 240) + ' Z', "#f4f2ec", { w: 1.6 }); }
    if (o.crack) g += '<path d="M-14 6 L-2 18 L-10 30 M-2 18 L12 12" stroke="#1a1a1a" stroke-width="1.4" fill="none"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  // ── the reactor cutaway (RBMK: a graphite stack crossed by vertical fuel channels and control rods, water in, steam out) ──
  function core(t, o) { o = o || {}; var s = R(-200, -200, 760, 1040, "#14181e", { s: 0 }), heat = o.heat || 0, bub = o.bub || 0, rods = o.rods == null ? 1 : o.rods, tipDown = o.tipDown || 0;
    s += R(30, 210, 300, 230, "#2a2a2e", { w: 2.4 }); for (var c = 0; c < 14; c++) s += R(40 + c * 21, 214, 18, 222, ["#3a3a40", "#34343a"][c % 2], { s: 0 });
    s += R(30, 210, 300, 230, heat > .5 ? "#ff8a2a" : "#ff6a2a", { s: 0, op: .15 + heat * .75 }) + '<ellipse cx="180" cy="325" rx="' + f(120 + heat * 80) + '" ry="' + f(90 + heat * 60) + '" fill="url(#fireR)" opacity="' + f2(heat) + '"/>';
    for (var f2i = 0; f2i < 7; f2i++) { var fx = 58 + f2i * 42; s += R(fx, 214, 6, 222, "#7ab0d8", { s: 0, op: .55 }); for (var b = 0; b < Math.round(bub * 10); b++) { var ph = ((t * (1 + bub) + b / 10 + f2i * .13) % 1); s += '<circle cx="' + f(fx + 3) + '" cy="' + f(436 - ph * 222) + '" r="' + f(1.5 + ph * 2.4) + '" fill="#e8f4fc" opacity=".85"/>'; } }
    for (var r = 0; r < 6; r++) { var rx = 79 + r * 42, dep = lerp(0, 200, rods) + tipDown * 26; s += R(rx - 4, 120, 8, dep + 70, "#a8b0b8", { w: 1.2 }) + R(rx - 4, 120 + dep + 70 - 22, 8, 22, tipDown > 0 ? "#2a2a2a" : "#a8b0b8", { w: 1.2 }); }
    s += R(20, 180, 320, 30, "#5a5a60", { w: 2 }) + R(20, 440, 320, 26, "#5a5a60", { w: 2 }) + '<path d="M10 470 Q-30 470 -30 520 M350 180 Q390 180 390 140" stroke="#3a6aa8" stroke-width="8" fill="none"/>';
    if (o.gas) for (var g2 = 0; g2 < 14; g2++) { var gx = 50 + hash(g2) * 260, gy = 230 + hash(g2 + 3) * 190; s += '<circle cx="' + f(gx + Math.sin(t + g2) * 6) + '" cy="' + f(gy + Math.cos(t * .7 + g2) * 5) + '" r="' + f(10 + hash(g2 + 1) * 10) + '" fill="#8a5ab8" opacity="' + f2(.35 * o.gas) + '"/>'; }
    return s; }
  function gauge(x, y, r, v, t, o) { o = o || {}; var a = -2.4 + clamp(v, 0, 1.15) * 4.8, s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 6) + '" fill="#3a3a40" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f2eee0" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M' + f(x + Math.cos(-2.4 - 1.57 + 4.8 * .8) * r * .86) + ' ' + f(y + Math.sin(-2.4 - 1.57 + 4.8 * .8) * r * .86) + ' A' + (r * .86) + ' ' + (r * .86) + ' 0 0 1 ' + f(x + Math.cos(-1.57 + 2.4) * r * .86) + ' ' + f(y + Math.sin(-1.57 + 2.4) * r * .86) + '" stroke="#d8322a" stroke-width="' + f(r * .1) + '" fill="none"/>';
    for (var i = 0; i <= 10; i++) { var aa = -2.4 + i * .48 - 1.57; s += '<path d="M' + f(x + Math.cos(aa) * r * .72) + ' ' + f(y + Math.sin(aa) * r * .72) + ' L' + f(x + Math.cos(aa) * r * .9) + ' ' + f(y + Math.sin(aa) * r * .9) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    s += '<path d="M' + x + ' ' + y + ' L' + f(x + Math.cos(a - 1.57) * r * .8) + ' ' + f(y + Math.sin(a - 1.57) * r * .8) + '" stroke="#1a1a1a" stroke-width="' + f(r * .06) + '" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .08) + '" fill="#1a1a1a"/>';
    return s + (o.label ? txt(o.label, x, y + r * .5, r * .2, "#3a3a3a", { font: "Noto Serif", wt: 700 }) : ""); }
  function clockBig(x, y, r, h, m, sec) { var s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 6) + '" fill="#2a2a2e" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f6f2e2" stroke="' + INK + '"/>';
    for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; s += '<path d="M' + f(x + Math.sin(a) * r * .8) + ' ' + f(y - Math.cos(a) * r * .8) + ' L' + f(x + Math.sin(a) * r * .94) + ' ' + f(y - Math.cos(a) * r * .94) + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 1.6 : 3) + '"/>'; }
    var ha = ((h % 12) + m / 60) / 12 * 360, ma = (m + (sec || 0) / 60) / 60 * 360, sa = (sec || 0) / 60 * 360;
    return s + '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r * .5) + '" stroke="' + INK + '" stroke-width="' + f(r * .08) + '" stroke-linecap="round" transform="rotate(' + f(ha) + ' ' + x + ' ' + y + ')"/><path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r * .76) + '" stroke="' + INK + '" stroke-width="' + f(r * .05) + '" stroke-linecap="round" transform="rotate(' + f(ma) + ' ' + x + ' ' + y + ')"/><path d="M' + x + ' ' + (y + r * .15) + ' L' + x + ' ' + (y - r * .82) + '" stroke="#c22a2a" stroke-width="' + f(r * .02) + '" transform="rotate(' + f(sa) + ' ' + x + ' ' + y + ')"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .05) + '" fill="' + INK + '"/>'; }
  function bus(x, y, s, t, o) { o = o || {}; var g = P('M-60 -36 Q-60 -44 -52 -44 H56 Q62 -44 62 -36 V-6 H-60 Z', o.col || "#e8c84a", { w: 1.6 }) + R(-60, -20, 122, 14, o.low || "#d8a83a", { w: 1.2 }); for (var w = 0; w < 6; w++) g += R(-54 + w * 18, -40, 14, 14, "#8ab0c8", { w: 1 }) + (o.people ? '<circle cx="' + (-47 + w * 18) + '" cy="-32" r="4" fill="' + SK[w % 4] + '"/>' : '');
    [-38, 40].forEach(function (wx) { g += '<circle cx="' + wx + '" cy="-4" r="8" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + wx + '" cy="-4" r="3" fill="#8a8a8a"/>'; });
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function fireTruck(x, y, s, t, o) { var g = P('M-50 -30 L-50 -4 L60 -4 L60 -20 L44 -20 L38 -34 L14 -34 L14 -30 Z', "#c22a24", { w: 1.6 }) + R(18, -32, 18, 10, "#8ab0c8", { w: 1 }) + R(-48, -40, 60, 6, "#9a9a9a", { w: 1 }) + '<path d="M-48 -42 L10 -42" stroke="#c8c8c8" stroke-width="2"/>';
    [-34, 42].forEach(function (wx) { g += '<circle cx="' + wx + '" cy="-4" r="8" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.4"/>'; }); g += '<circle cx="26" cy="-38" r="4" fill="#3a8aff" opacity="' + f2(.5 + .5 * Math.sin(t * 12)) + '"/><circle cx="26" cy="-38" r="14" fill="#3a8aff" opacity="' + f2(.2 + .2 * Math.sin(t * 12)) + '"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function helicopter(x, y, s, t) { var g = P('M-30 0 Q-30 -14 -12 -16 L24 -16 Q40 -14 40 0 Q40 10 24 10 L-12 10 Q-30 10 -30 0 Z', "#5a6a4a", { w: 1.6 }) + R(-80, -4, 50, 6, "#5a6a4a", { w: 1.2 }) + P('M-80 -4 l-6 -14 l6 0 l6 14Z', "#5a6a4a", { w: 1 }) + P('M24 -14 Q36 -12 38 -2 L24 -2 Z', "#8ab0c8", { w: 1 }) + '<path d="M0 -16 V-22" stroke="#2a2a2a" stroke-width="3"/>';
    var a = Math.cos(t * 30); g += '<ellipse cx="0" cy="-22" rx="' + f(70 * Math.abs(a) + 10) + '" ry="2" fill="#2a2a2a" opacity=".7"/>' + '<path d="M-16 10 L-20 18 M20 10 L24 18 M-24 18 H30" stroke="#2a2a2a" stroke-width="2"/>'; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function trefoil(x, y, r) { var s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.15) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .18) + '" fill="#1a1a1a"/>'; for (var i = 0; i < 3; i++) { var a = -1.57 + i * 2.094; s += '<path d="M' + f(x + Math.cos(a - .5) * r * .28) + ' ' + f(y + Math.sin(a - .5) * r * .28) + ' L' + f(x + Math.cos(a - .5) * r) + ' ' + f(y + Math.sin(a - .5) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.cos(a + .5) * r) + ' ' + f(y + Math.sin(a + .5) * r) + ' L' + f(x + Math.cos(a + .5) * r * .28) + ' ' + f(y + Math.sin(a + .5) * r * .28) + ' Z" fill="#1a1a1a"/>'; } return s; }
  function wolf(x, y, s, t, o) { o = o || {}; var w = Math.sin(t * 6 + x); var g = P('M-30 -26 Q-10 -34 22 -28 L34 -40 L38 -30 L44 -26 L36 -20 Q30 -12 22 -16 L-26 -16 Q-40 -18 -46 -26 L-40 -24 Z', o.col || "#7a7468", { w: 1.4 }); [[-22, w], [-12, -w], [14, w], [22, -w]].forEach(function (l) { g += '<path d="M' + l[0] + ' -16 L' + f(l[0] + l[1] * 4) + ' 0" stroke="' + INK + '" stroke-width="3"/>'; }); g += '<circle cx="38" cy="-30" r="1.4" fill="' + INK + '"/>'; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function horse(x, y, s, t, o) { o = o || {}; var w = Math.sin(t * 2 + x); var g = P('M-34 -40 Q-10 -48 24 -42 L40 -64 L52 -60 L50 -50 L36 -38 Q34 -26 24 -26 L-28 -26 Q-40 -30 -40 -38 Z', "#c8a46a", { w: 1.4 }) + P('M36 -62 L44 -72 L46 -62 Z M24 -42 L40 -64 L34 -44 Z', "#3a2a1a", { s: 0 }) + P('M-40 -38 q-10 4 -12 20', "none", { w: 3, s: "#3a2a1a" }); [-28, -18, 16, 26].forEach(function (lx, i) { g += '<path d="M' + lx + ' -26 L' + f(lx + (i % 2 ? w : -w) * 2) + ' 0" stroke="#3a2a1a" stroke-width="4"/>'; }); return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function confinement(x, y, s, t) { var g = P('M-150 0 Q-150 -170 0 -180 Q150 -170 150 0 Z', "#c8ccd0", { w: 2 }); for (var i = 1; i < 10; i++) g += '<path d="M' + (-150 + i * 30) + ' 0 Q' + (-150 + i * 30) + ' -170 ' + (-150 + i * 30) + ' ' + f(-170 + Math.abs(i - 5) * 2) + '" stroke="#9aa0a6" stroke-width="1" fill="none"/>'; for (var j = 1; j < 5; j++) g += '<path d="M-150 ' + (-j * 34) + ' Q0 ' + (-j * 34 - 20) + ' 150 ' + (-j * 34) + '" stroke="#9aa0a6" stroke-width="1" fill="none" opacity=".7"/>'; g += P('M-150 0 Q-150 -170 0 -180 Q60 -176 100 -150 L100 0 Z', "#ffffff", { s: 0, op: .25 }); return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function tv(x, y, s, t, o) { var g = R(-80, -60, 160, 120, "#6a4a2a", { w: 2 }) + '<rect x="-64" y="-48" width="104" height="86" rx="12" fill="#2a3a3a" stroke="' + INK + '" stroke-width="2"/>' + '<circle cx="62" cy="-30" r="7" fill="#c9a040" stroke="' + INK + '"/><circle cx="62" cy="-6" r="7" fill="#c9a040" stroke="' + INK + '"/>';
    g += '<clipPath id="tvc"><rect x="-64" y="-48" width="104" height="86" rx="12"/></clipPath><g clip-path="url(#tvc)">' + R(-64, -48, 104, 86, "#5a6a6a", { s: 0 }) + person(-12, 50, 1.2, t, { top: "#2a2a34", coat: "#2a2a34", skin: "#d9b49a", hair: "short", mustache: false }) + R(-64, -48, 104, 86, "#cfe6e0", { s: 0, op: .12 + .06 * Math.sin(t * 40) }) + '</g>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function radio(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', R(-80, -44, 160, 88, "#7a5232", { w: 2 }) + R(-70, -34, 80, 68, "#c8b48a", { w: 1.4 }) + Array.apply(null, Array(7)).map(function (_, i) { return '<path d="M-66 ' + (-26 + i * 9) + ' h72" stroke="#8a6a44" stroke-width="2"/>'; }).join("") + R(20, -30, 50, 16, "#e8dca0", { w: 1 }) + '<path d="M' + f(30 + Math.sin(t) * 10) + ' -30 v16" stroke="#c22a2a" stroke-width="2"/><circle cx="34" cy="16" r="9" fill="#3a2a1a" stroke="' + INK + '"/><circle cx="58" cy="16" r="9" fill="#3a2a1a" stroke="' + INK + '"/>'); }

  // ═════════ the shots ═════════
  // 0 — the night of 26 April 1986, northern Ukraine
  shot(0, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { return nightSky(t, 420) + pripyat(t, 430, { night: true, lit: .9 }) + plant(250, 470, .45, t, { night: true }) + label("26 أبريل 1986", 180, 170, u, .3, 30, "#fff") + label("أوكرانيا", 180, 204, u, .8, 18, "#f2c230"); });
  // 1 — a city called Pripyat, about 50,000 people asleep
  shot(1, push([180, 360], [200, 370], 1.15, 1.25), function (u, d, t) { return nightSky(t, 420) + pripyat(t, 470, { night: true, lit: .93 }) + label("بريبيات", 180, 170, u, .4, 34, "#fff") + label("حوالي 50,000 إنسان", 180, 206, u, .9, 18, "#f2c230"); });
  // 2 — a few km away, four reactors working day and night
  shot(2, push([180, 340], [220, 340], 1.0, 1.15), function (u, d, t) { return nightSky(t, 400) + forestBand(470, { night: true }) + plant(180, 470, 1.0, t, { night: true }) + label("4 مفاعلات", 180, 170, u, .5, 32, "#f2c230"); });
  // 3 — at 1:23:40 someone pressed a button
  shot(3, push([180, 330], [180, 330], 1.1, 1.2), function (u, d, t) { return controlRoom(t) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .45 }) + clockBig(180, 330, 96, 1, 23, 34 + clamp(u / d) * 6) + label("01:23:40", 180, 170, u, .3, 40, "#f2c230"); });
  // 4 — the button meant to shut the reactor down… and what happened four seconds later changed the world
  shot(4, push([180, 340], [180, 320], 1.0, 1.35), function (u, d, t) { var k = clamp(u / (d * .6)); return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + az5(180, 340, 1.8, t, { finger: k, press: k > .95 ? 1 : 0, glow: k > .95 }) + label("4 ثواني", 180, 160, u, d * .7, 30, "#fff"); });
  // 5 — the button is called AZ-5… remember that name
  shot(5, push([180, 320], [180, 320], 1.3, 1.5), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + az5(180, 330, 1.6, t, { glow: true }) + label("إيه زد خمسة", 180, 170, u, .5, 30, "#f2c230") + label("افتكروا الاسم ده", 180, 470, u, 1.2, 18, "#fff"); });
  // 6 — how could the safety button cause the worst nuclear disaster in history?
  shot(6, push([180, 330], [180, 320], 1.1, 1.0), function (u, d, t) { return nightSky(t, 400) + forestBand(480, { night: true }) + plant(180, 480, 1.0, t, { night: true, blown: true, k: .5 + .3 * Math.sin(t), fire: true }) + label("زرار الأمان؟", 180, 170, u, .5, 32, "#fff"); });
  // 7 — and why did the city next to it carry on normally for a day and a half… people watching the fire?
  shot(7, push([180, 340], [180, 340], 1.0, 1.1), function (u, d, t) { return sky("skySpring") + cloudBank(t, 110, 4, 5, "#fff", .8) + plant(300, 400, .35, t, { blown: true, k: .15 }) + forestBand(410) + R(-200, 430, 760, 300, "#b8b0a0", { s: 0 }) + citizen(80, 570, 2.3, t, 0, { back: true }) + citizen(150, 580, 2.1, t, 1, { back: true }) + citizen(240, 575, 2.2, t, 4, { back: true }) + label("يوم ونص", 180, 170, u, .6, 32, "#f2c230"); });
  // 8 — the story of that night, moment by moment. we begin the afternoon before
  shot(8, push([180, 320], [180, 320], 1.1, 1.25), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a1c22", { s: 0 }) + clockBig(180, 320, 100, 1 - u * 3, 23 - u * 40, 0) + label("لحظة بلحظة", 180, 170, u, .4, 32, "#fff"); });
  // 9 — 25 April: the engineers at unit 4 were preparing a safety test
  shot(9, push([180, 340], [200, 340], 1.0, 1.1), function (u, d, t) { return sky("skySpring") + cloudBank(t, 120, 4, 6, "#fff", .85) + forestBand(470) + plant(180, 470, 1.0, t) + op(90, 600, 1.9, t, 1, { walk: true }) + op(150, 610, 1.9, t, 2, { walk: true }) + label("25 أبريل", 180, 170, u, .3, 32, "#f2c230") + label("تجربة أمان", 180, 206, u, .8, 18, "#fff"); });
  // 10 — the question: if the power is cut, for how many seconds can the turbine run the cooling pumps?
  shot(10, push([180, 340], [180, 340], 1.0, 1.08), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#1e2428", { s: 0 }) + R(30, 240, 90, 120, "#3a3a40", { w: 2 }) + txt("المفاعل", 75, 230, 14, "#fff", {}) + '<rect x="40" y="250" width="70" height="100" fill="#ff8a2a" opacity=".5"/>';
    s += '<path d="M120 270 H200" stroke="#e8f4fc" stroke-width="6"/>' + G('translate(240 290) rotate(' + f(t * 200 * (1 - clamp(u / d) * .6)) + ')', '<circle r="36" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M0 0 L' + f(Math.cos(i) * 34) + ' ' + f(Math.sin(i) * 34) + '" stroke="#3a3a40" stroke-width="5"/>'; }).join("")) + txt("التوربينة", 240, 238, 14, "#fff", {});
    s += '<path d="M240 330 V420 H75 V360" stroke="#3a8ad8" stroke-width="6" fill="none"/>' + G('translate(160 420) rotate(' + f(t * 300 * (1 - clamp(u / d) * .6)) + ')', '<circle r="18" fill="#3a6aa8" stroke="' + INK + '" stroke-width="2"/><path d="M-14 0 H14 M0 -14 V14" stroke="#fff" stroke-width="3"/>') + txt("طلمبات التبريد", 160, 462, 13, "#fff", {});
    return s + label("كام ثانية؟", 180, 170, u, .6, 32, "#f2c230"); });
  // 11 — the test was set for daytime, with a well-trained shift
  shot(11, push([180, 340], [180, 350], 1.0, 1.1), function (u, d, t) { return controlRoom(t) + op(70, 600, 2.2, t, 1) + op(170, 610, 2.3, t, 2, { mood: "smile" }) + op(280, 600, 2.2, t, 3) + label("وردية النهار", 180, 160, u, .5, 28, "#fff"); });
  // 12 — suddenly the power dispatcher in Kyiv called: wait… the city needs the power until night
  shot(12, still, function (u, d, t) { return tri(t, u, d,
    function (t) { return sky("skySunset") + block(-20, 120, 60, 90, t, { col: "#d8c8a8" }) + block(60, 120, 80, 110, t, { col: "#e0d0b0" }) + block(160, 120, 60, 80, t, { col: "#d0c0a0" }) + block(240, 120, 90, 100, t, { col: "#dcccac" }) + label("كييف", 180, 30, 9, 0, 22, "#fff"); },
    function (t) { var s = R(-200, -200, 760, 600, "#3a3a40", { s: 0 }) + P('M120 90 Q130 40 180 40 Q230 40 240 90 Z', "#1a1a1a", { w: 2 }) + R(150, 70, 60, 30, "#2a2a2a", { w: 1.6 }); s += (t % 1.2 < .6) ? '<path d="M110 50 q-10 -16 0 -30 M250 50 q10 -16 0 -30" stroke="#f2c230" stroke-width="3" fill="none"/>' : ''; return s; },
    function (t) { return controlRoom(t) + op(180, 200, 1.2, t, 2, { sad: true }) + label("استنوا!", 180, 30, 9, 0, 22, "#f2c230"); }); });
  // 13 — so the test was pushed back about ten hours… onto the night shift
  shot(13, push([180, 320], [180, 320], 1.1, 1.2), function (u, d, t) { var k = clamp(u / d); return R(-200, -200, 760, 1040, "#1a1c22", { s: 0 }) + clockBig(180, 320, 100, lerp(14, 24, k), (lerp(14, 24, k) % 1) * 60, 0) + label("حوالي 10 ساعات", 180, 170, u, .4, 28, "#f2c230") + label("وردية الليل", 180, 470, u, 1.6, 22, "#fff"); });
  // 14 — near midnight they started lowering the reactor's power for the test
  shot(14, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { return controlRoom(t) + R(-200, -200, 760, 1040, "#0a1020", { s: 0, op: .3 }) + gauge(180, 330, 80, lerp(.9, .3, clamp(u / d)), t, { label: "MW" }) + label("نص الليل", 180, 170, u, .4, 30, "#fff"); });
  // 15 — but the power fell too far, until the reactor nearly shut down altogether
  shot(15, push([180, 330], [180, 320], 1.1, 1.3), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + gauge(180, 330, 100, lerp(.3, .02, clamp(u / (d * .7))), t, { label: "MW" }) + label("القوة نزلت جامد", 180, 170, u, .6, 28, "#f2c230"); });
  // 16 — when the reactor slows like this, it fills with a gas that chokes it
  shot(16, push([180, 330], [180, 330], 1.0, 1.1), function (u, d, t) { return core(t, { gas: clamp(u / d) + .2, rods: .8, heat: .05 }) + label("غاز بيخنقه", 180, 150, u, .5, 30, "#c8a0ff"); });
  // 17 — to bring it back, they pulled most of the control rods out of the core
  shot(17, push([180, 330], [180, 300], 1.0, 1.1), function (u, d, t) { return core(t, { gas: .6, rods: lerp(.8, .05, ease(u / d)), heat: .1 }) + label("طلّعوا القضبان", 180, 150, u, .5, 28, "#fff"); });
  // 18 — those rods are the brakes… and they left the reactor almost without brakes
  shot(18, push([180, 320], [180, 330], 1.1, 1.0), function (u, d, t) { return core(t, { gas: .4, rods: .05, heat: .15 + .05 * Math.sin(t * 3) }) + label("من غير فرامل", 180, 150, u, .8, 30, "#f2c230"); });
  // 19 — at the head of the shift, Aleksandr Akimov, with a 25-year-old named Leonid Toptunov
  shot(19, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) { return controlRoom(t) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .35 }) + portrait(105, 400, 1.6, t, { hair: "short", hat: "whitecap", top: "#f0eee6", skin: SK[0], mustache: true, rim: true }) + portrait(255, 410, 1.5, t, { hair: "short", hat: "whitecap", top: "#f0eee6", skin: SK[2] }) + label("أكيموف", 105, 230, u, .6, 20, "#f2c230") + label("توبتونوف · 25 سنة", 255, 230, u, 1.4, 17, "#f2c230"); });
  // 20 — and their boss insisted: the test must happen tonight
  shot(20, push([180, 350], [180, 340], 1.0, 1.1), function (u, d, t) { return controlRoom(t) + op(90, 600, 2.1, t, 1, { sad: true }) + op(280, 600, 2.1, t, 2, { flip: true, sad: true }) + person(180, 630, 2.8, t, { top: "#3a3a44", pants: "#3a3a44", coat: "#3a3a44", back: true, hair: "short", hairCol: "#3a3a3a", wave: true }) + label("الليلة دي!", 180, 160, u, .6, 32, "#fff"); });
  // 21 — 1:23, the test began
  shot(21, push([180, 330], [180, 330], 1.1, 1.2), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a1c22", { s: 0 }) + clockBig(180, 330, 100, 1, 23, 4 + u * 2) + label("01:23", 180, 170, u, .3, 40, "#f2c230") + label("التجربة بدأت", 180, 480, u, .8, 22, "#fff"); });
  // 22 — they shut the steam off from the turbine… and the pumps began to slow
  shot(22, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var sp = lerp(1, .3, clamp(u / d)), s = R(-200, -200, 760, 1040, "#2a3036", { s: 0 }) + R(-200, 420, 760, 300, "#5a5a5a", { s: 0 }); s += P('M20 300 Q20 220 120 220 H260 Q340 220 340 300 V420 H20 Z', "#7a8a6a", { w: 2 }) + G('translate(180 320) rotate(' + f(t * 360 * sp) + ')', '<circle r="60" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<path d="M0 0 L' + f(Math.cos(i * .785) * 56) + ' ' + f(Math.sin(i * .785) * 56) + '" stroke="#3a3a40" stroke-width="7"/>'; }).join(""));
    return s + label("الطلمبات بتبطّأ", 180, 160, u, .6, 28, "#fff"); });
  // 23 — less water through the reactor, and the water began boiling into steam
  shot(23, push([180, 330], [180, 330], 1.0, 1.15), function (u, d, t) { return core(t, { rods: .05, bub: .3 + clamp(u / d) * .7, heat: .2 + clamp(u / d) * .15 }) + label("مية ← بخار", 180, 150, u, .5, 30, "#e8f4fc"); });
  // 24 — and in this reactor, steam meant the power goes up, not down
  shot(24, push([180, 330], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + gauge(110, 330, 70, .2 + k * .6, t, { label: "بخار" }) + gauge(250, 330, 70, .2 + k * k * .8, t, { label: "MW" }) + txt("↑", 110, 230, 36, "#e8f4fc", {}) + txt("↑", 250, 230, 36, "#ff8a5a", {}) + label("البخار = قوة أكتر", 180, 160, u, .6, 26, "#f2c230"); });
  // 25 — about 36 seconds later, Akimov pressed the button: AZ-5
  shot(25, push([180, 340], [180, 330], 1.0, 1.4), function (u, d, t) { var k = clamp((u - .6) / 1.2); return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + az5(180, 340, 1.8, t, { finger: k, press: k > .95 ? 1 : 0, glow: k > .95 }) + label("إيه زد خمسة", 180, 160, u, 1.4, 32, "#f2c230") + label("01:23:40", 180, 470, u, .3, 22, "#fff"); });
  // 26 — all the rods started going in at once to shut the reactor down
  shot(26, push([180, 330], [180, 340], 1.0, 1.05), function (u, d, t) { return core(t, { rods: lerp(.05, .4, clamp(u / d)), bub: .8, heat: .35 }) + label("القضبان نازلة", 180, 150, u, .4, 28, "#fff"); });
  // 27 — but those rods had a design flaw at their ends that nobody had told them about
  shot(27, push([180, 400], [180, 420], 1.6, 2.2), function (u, d, t) { return core(t, { rods: .3, tipDown: 1, bub: .8, heat: .4 }) + '<circle cx="79" cy="' + f(120 + 60 + 70 + 26 - 11) + '" r="18" fill="none" stroke="#f2c230" stroke-width="2.4" opacity="' + f2(.6 + .4 * Math.sin(t * 6)) + '"/>' + label("عيب في الطرف", 150, 230, u, .8, 14, "#f2c230"); });
  // 28 — as they went in, instead of stopping the reaction… they set it off
  shot(28, push([180, 330], [180, 330], 1.0, 1.2), function (u, d, t) { var k = clamp(u / d); return core(t, { rods: .35, tipDown: 1, bub: 1, heat: .5 + k * .5 }) + R(-200, -200, 760, 1040, "#ff8a2a", { s: 0, op: k * .25 }) + label("ولّعته", 180, 150, u, 1.2, 40, "#fff"); });
  // 29 — in three seconds the power rose to more than ten times normal
  shot(29, push([180, 330], [180, 330], 1.1, 1.3), function (u, d, t) { var k = clamp(u / (d * .6)); return controlRoom(t, { alarm: true, red: .25 }) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .4 }) + gauge(180, 330, 100, k * 1.15 + Math.sin(t * 30) * .02 * k, t, { label: "MW" }) + bigNum("×10", 180, 180, u, .8, 50, "#ff5a3a"); });
  // 30 — and then… an explosion
  shot(30, push([180, 340], [180, 330], 1.0, 1.15), function (u, d, t) { var k = clamp(u / .3); return nightSky(t, 420) + forestBand(480, { night: true }) + plant(180, 480, 1.0, t, { night: true, blown: k > .5, k: k, fire: true }) + R(-200, -200, 760, 1040, "#fff", { s: 0, op: (1 - clamp((u - .2) / .8)) * .9 * (u > .15 ? 1 : 0) }) + rays(t * 3, 290, 400, t, 10, 500, .6 * (1 - clamp(u / d))); });
  // 31 — seconds later, a second, bigger explosion
  shot(31, push([180, 340], [190, 330], 1.0, 1.1), function (u, d, t) { var s = nightSky(t, 420) + forestBand(480, { night: true }) + plant(180, 480, 1.0, t, { night: true, blown: true, k: 1, fire: true }); for (var i = 0; i < 24; i++) { var a = hash(i) * 3.14 + 3.14, sp = 60 + hash(i + 2) * 180, uu = clamp(u / d); s += R(310 + Math.cos(a) * sp * uu, 380 + Math.sin(a) * sp * uu + uu * uu * 120, 4 + hash(i) * 6, 3 + hash(i + 1) * 5, i % 3 ? "#ff8a2a" : "#3a3a40", { s: 0 }); } return s + fireball(310, 384, 30 + clamp(u / d) * 40, t) + R(-200, -200, 760, 1040, "#fff", { s: 0, op: .7 * (1 - clamp(u / .5)) }); });
  // 32 — the reactor lid, about 2,000 tonnes, was lifted and flipped in the air
  shot(32, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return R(-200, -200, 760, 1040, "#0e1018", { s: 0 }) + core(t, { rods: .3, tipDown: 1, bub: 1, heat: 1 }).replace(/<rect x="-200" y="-200" width="760" height="1040"[^>]*\/>/, "") + G('translate(180 ' + f(195 - k * 180) + ') rotate(' + f(k * 120) + ')', '<ellipse cx="0" cy="0" rx="150" ry="16" fill="#6a6a70" stroke="' + INK + '" stroke-width="2.4"/>' + [-120, -80, -40, 0, 40, 80, 120].map(function (x) { return '<path d="M' + x + ' -10 v20" stroke="#4a4a50" stroke-width="3"/>'; }).join("")) + '<rect x="30" y="0" width="300" height="210" fill="url(#beam)" opacity="' + f2(k) + '"/>' + label("حوالي 2000 طن", 180, 120, u, .8, 26, "#f2c230"); });
  // 33 — and the reactor's core lay open to the sky
  shot(33, push([180, 330], [180, 300], 1.1, 1.0), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#0e1018", { s: 0 }) + P('M20 480 L60 300 L300 300 L340 480 Z', "#3a3a40", { w: 2 }); for (var i = 0; i < 40; i++) s += '<circle cx="' + f(80 + (i % 10) * 22) + '" cy="' + f(320 + Math.floor(i / 10) * 36) + '" r="7" fill="#ff8a2a" opacity="' + f2(.5 + .5 * Math.sin(t * 4 + i)) + '"/>'; return s + '<ellipse cx="180" cy="380" rx="140" ry="80" fill="url(#fireR)" opacity=".7"/><rect x="60" y="0" width="240" height="320" fill="url(#beam)" opacity=".7"/>' + stars(t, 30, 200) + label("مفتوح على السما", 180, 150, u, .5, 28, "#fff"); });
  // 34 — the graphite inside caught fire, and a column of blue light rose up
  shot(34, push([180, 360], [180, 280], 1.0, 1.15), function (u, d, t) { return nightSky(t, 460) + forestBand(500, { night: true }) + plant(160, 500, .9, t, { night: true, blown: true, k: 1.4, fire: true }) + R(240, -200, 50, 700, "url(#beam)", { s: 0, op: .6 + .2 * Math.sin(t * 4) }) + label("النور الأزرق", 180, 140, u, .8, 30, "#9ac8ff"); });
  // 35 — at that moment Valery Khodemchuk, a pump operator, was standing close by
  shot(35, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a1e22", { s: 0 }) + '<circle cx="180" cy="330" r="220" fill="url(#warm)" opacity=".25"/>' + portrait(180, 390, 1.9, t, { hair: "short", hat: "whitecap", top: "#f0eee6", skin: SK[3], mustache: true, rim: true }) + label("فاليري خودمشوك", 180, 160, u, .5, 30, "#f2c230") + label("عامل طلمبات", 180, 196, u, 1.0, 18, "#fff"); });
  // 36 — they never found his body… to this day he lies buried beneath the reactor
  shot(36, push([180, 340], [180, 320], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#14161c", { s: 0 }) + P('M-200 640 L-200 380 L-40 300 L60 340 L160 260 L260 320 L360 280 L560 380 L560 640 Z', "#3a3a40", { w: 2 }); for (var i = 0; i < 16; i++) s += R(-160 + i * 40, 360 + hash(i) * 60, 20 + hash(i + 1) * 30, 10 + hash(i + 2) * 14, "#2a2a30", { w: 1 }); return s + '<circle cx="180" cy="430" r="5" fill="#ffd27a"/><circle cx="180" cy="430" r="40" fill="url(#warm)" opacity="' + f2(.6 + .2 * Math.sin(t * 6)) + '"/>' + R(176, 436, 8, 20, "#f2ead8", { w: 1 }) + label("لحد النهارده", 180, 170, u, .8, 28, "#fff"); });
  // 37 — 1:28, the fire brigade arrived
  shot(37, push([180, 340], [200, 340], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return nightSky(t, 380) + plant(260, 400, .7, t, { night: true, blown: true, k: 1, fire: true }) + R(-200, 400, 760, 300, "#2a2a2e", { s: 0 }) + fireTruck(lerp(-80, 120, k), 500, 1.4, t) + fireTruck(lerp(-200, -10, k), 540, 1.6, t) + label("01:28", 180, 170, u, .3, 40, "#f2c230") + label("المطافي", 180, 206, u, .8, 20, "#fff"); });
  // 38 — men nobody told it was a nuclear fire… they thought it was an ordinary roof fire
  shot(38, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var s = nightSky(t, 600) + R(-200, 420, 760, 300, "#3a3a40", { w: 2 }) + flames(t, -40, 400, 430, 70, 20, .9) + '<ellipse cx="180" cy="420" rx="300" ry="80" fill="url(#fireR)" opacity=".5"/>'; for (var i = 0; i < 4; i++) s += fireman(40 + i * 90, 520 + (i % 2) * 20, 2.2, t, i, { back: true }); return s + '<path d="M40 470 Q120 420 200 410" stroke="#c8b48a" stroke-width="4" fill="none"/>' + label("حريقة عادية؟", 180, 170, u, .8, 30, "#fff"); });
  // 39 — imagine you are one of them, up on the roof in the dark, a metallic taste in your mouth…
  shot(39, push([180, 340], [180, 330], 1.05, 1.2), function (u, d, t) { return R(-200, -200, 760, 1040, "#140c08", { s: 0 }) + '<circle cx="180" cy="300" r="260" fill="url(#fireR)" opacity="' + f2(.45 + .1 * Math.sin(t * 7)) + '"/>' + portrait(180, 400, 2.0, t, { hair: "short", hat: "fire", top: "#3a3c42", skin: SK[1], sad: true, rim: true }) + dust(t * 2, 30, "#ffb066", .8); });
  // 40 — not knowing that every minute here was worth years
  shot(40, push([180, 320], [180, 320], 1.2, 1.4), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a1a1e", { s: 0 }) + G('translate(180 330)', R(-90, -60, 180, 120, "#e8c84a", { w: 2.4 }) + R(-70, -44, 140, 70, "#f6f2e2", { w: 1.4 }) + '<path d="M-60 16 A70 70 0 0 1 60 16" stroke="#c22a2a" stroke-width="3" fill="none"/>' + '<path d="M0 22 L' + f(Math.cos(-.3 + Math.sin(t * 20) * .05) * 66) + ' ' + f(22 - 50) + '" stroke="#1a1a1a" stroke-width="3"/>' + trefoil(-56, 44, 10)) + label("كل دقيقة = سنين", 180, 170, u, .6, 28, "#f2c230"); });
  // 41 — they put out the roof fires before dawn… but many of them died weeks later
  shot(41, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyDawnT") + plant(220, 440, .9, t, { blown: true, k: .25 }) + forestBand(450); for (var i = 0; i < 5; i++) s += fireman(30 + i * 30, 560, 1.6, t, i, { back: true }); return s + R(-200, 470, 760, 300, "#4a4440", { s: 0, op: .6 }) + label("قبل الفجر", 180, 170, u, .4, 30, "#fff"); });
  // 42 — and in Pripyat, the morning came up perfectly normal
  shot(42, push([180, 360], [180, 340], 1.0, 1.1), function (u, d, t) { return sky("skySpring") + '<circle cx="290" cy="120" r="30" fill="#fff6d0"/>' + cloudBank(t, 110, 4, 5, "#fff", .85) + pripyat(t, 470) + R(-200, 470, 760, 300, "#a8a090", { s: 0 }) + rays(t, 290, 120, 2.2, 5, 600, .35) + label("صبح عادي", 180, 170, u, .4, 30, "#fff"); });
  // 43 — children went to school, people held a wedding, some went out to watch the fire from afar (triptych)
  shot(43, still, function (u, d, t) { return tri(t, u, d,
    function (t) { var s = sky("skySpring") + block(80, 120, 200, 80, t, { col: "#e4dccc" }) + R(-200, 120, 760, 100, "#a8a090", { s: 0 }); for (var i = 0; i < 5; i++) s += citizen(40 + i * 60, 124, 1.0, t, i, { walk: true, bag: true }); return s; },
    function (t) { return sky("skySpring") + R(-200, 100, 760, 100, "#8ab06a", { s: 0 }) + person(150, 122, 1.5, t, { top: "#2a2a34", pants: "#2a2a34", coat: "#2a2a34", hair: "short", skin: SK[0], mood: "smile" }) + person(210, 122, 1.5, t, { top: "#fbfaf4", dress: "#fbfaf4", hair: "bun", skin: SK[2], mood: "smile" }) + P('M196 54 Q210 40 224 54 L230 100 L190 100 Z', "#fbfaf4", { w: 1, op: .7 }); },
    function (t) { var s = sky("skySpring") + plant(260, 80, .3, t, { blown: true, k: .2 }) + forestBand(84) + R(-200, 90, 760, 60, "#6a6a6a", { w: 1.4 }); for (var i = 0; i < 6; i++) s += citizen(30 + i * 40, 120, .9, t, i, { back: true }); return s; }); });
  // 44 — nobody told them anything, and the city lived like that for a day and a half
  shot(44, push([180, 340], [190, 340], 1.0, 1.1), function (u, d, t) { return sky("skySpring") + cloudBank(t, 110, 4, 5, "#fff", .8) + plant(310, 380, .3, t, { blown: true, k: .15 }) + pripyat(t, 470) + R(-200, 470, 760, 300, "#a8a090", { s: 0 }) + citizen(80, 600, 2.0, t, 2, { walk: true }) + citizen(250, 610, 2.0, t, 5, { walk: true, flip: true }) + label("36 ساعة", 180, 170, u, .6, 34, "#f2c230"); });
  // 45 — the next afternoon the radio announced: temporary evacuation… take things for three days only
  shot(45, push([180, 340], [180, 330], 1.05, 1.2), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#5a4a3a", { s: 0 }) + R(-200, 420, 760, 300, "#6a5232", { s: 0 }) + radio(180, 380, 1.5, t); for (var k = 0; k < 3; k++) { var ph = ((t * .9 + k / 3) % 1); s += '<path d="M' + f(60 - ph * 40) + ' ' + f(340 - ph * 20) + ' q-14 40 0 80" stroke="#f2c230" stroke-width="2" fill="none" opacity="' + f2(1 - ph) + '"/>'; } return s + label("إخلاء مؤقت", 180, 170, u, .5, 32, "#fff") + label("3 أيام بس", 180, 206, u, 1.2, 20, "#f2c230"); });
  // 46 — more than a thousand buses emptied the whole city in about three hours
  shot(46, push([180, 340], [200, 340], 1.0, 1.1), function (u, d, t) { var s = sky("skyGrey") + pripyat(t, 400, { empty: true }) + R(-200, 400, 760, 300, "#8a8678", { s: 0 }) + '<path d="M-200 470 H560" stroke="#e8e4dc" stroke-width="2" stroke-dasharray="20 14"/>'; for (var i = 0; i < 7; i++) s += bus(((i * 110 + t * 40) % 800) - 200, 450 + (i % 2) * 50, .9 + (i % 2) * .2, t, { people: true, col: i % 3 ? "#e8c84a" : "#d8d4c8", low: i % 3 ? "#d8a83a" : "#c23a2a" }); return s + label("أكتر من 1000 أتوبيس", 180, 170, u, .5, 26, "#f2c230"); });
  // 47 — people left their homes, their food still on the table… and never came back
  shot(47, push([180, 360], [180, 350], 1.0, 1.12), function (u, d, t) { return R(-200, -200, 760, 1040, "#a89a80", { s: 0 }) + R(220, 120, 110, 140, "#a8c0d0", { w: 3, s: "#6a5a44" }) + rays(t, 230, 130, 2.4, 5, 400, .45) + R(-200, 420, 760, 300, "#7a5a3a", { s: 0 }) + R(50, 400, 260, 16, "#8a6a44", { w: 2 }) + R(60, 416, 10, 80, "#5a3a22", { w: 1 }) + R(290, 416, 10, 80, "#5a3a22", { w: 1 }) + '<ellipse cx="110" cy="396" rx="26" ry="6" fill="#f4f2ec" stroke="' + INK + '"/><ellipse cx="190" cy="396" rx="26" ry="6" fill="#f4f2ec" stroke="' + INK + '"/>' + R(240, 376, 14, 22, "#cfe6f4", { w: 1 }) + G('translate(280 470)', '<circle cx="0" cy="-20" r="10" fill="#f2d0b0" stroke="' + INK + '"/>' + P('M-10 -10 L10 -10 L14 14 L-14 14 Z', "#c84a5a", { w: 1.2 })) + dust(t, 22, "#fff6dc", .5) + label("وما رجعتش", 180, 170, u, 1.0, 30, "#fff"); });
  // 48 — and the world? it knew nothing
  shot(48, push([180, 330], [180, 330], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#0a0e18", { s: 0 }) + stars(t, 60, 640) + '<circle cx="180" cy="330" r="150" fill="#1a3a6a" stroke="#4a6a9a" stroke-width="2"/>' + P('M100 240 Q140 220 170 236 Q200 230 230 250 Q260 270 240 300 Q260 330 230 360 Q200 380 170 370 Q140 380 120 350 Q90 320 110 290 Q90 260 100 240 Z', "#3a6a4a", { s: 0, op: .8 }); return s + '<circle cx="210" cy="300" r="' + f(4 + 3 * Math.sin(t * 5)) + '" fill="#ff5a3a"/>' + label("والعالم؟", 180, 150, u, .4, 32, "#fff"); });
  // 49 — until in Sweden, more than 1,000 km away, the detectors at a nuclear plant went off
  shot(49, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var al = Math.sin(t * 10) > 0; return sky("skyGrey") + cloudBank(t, 130, 4, 5, "#e8ecf0", .8) + R(-200, 440, 760, 300, "#6a7a6a", { s: 0 }) + R(40, 300, 200, 140, "#e8ecf0", { w: 2 }) + R(80, 260, 80, 40, "#d8dce0", { w: 1.6 }) + R(260, 330, 60, 110, "#c8ccd0", { w: 1.6 }) + '<circle cx="290" cy="320" r="8" fill="' + (al ? "#ff3a2a" : "#6a2a2a") + '"/>' + (al ? '<circle cx="290" cy="320" r="30" fill="#ff3a2a" opacity=".3"/>' : '') + label("السويد", 180, 160, u, .4, 32, "#f2c230") + label("أكتر من 1000 كيلو", 180, 196, u, .9, 18, "#fff"); });
  // 50 — the Swedes thought the leak was theirs and kept searching… until they were sure it came from the east
  shot(50, push([180, 340], [180, 340], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 2) / 2); return R(-200, -200, 760, 1040, "#d8dce0", { s: 0 }) + R(-200, 440, 760, 300, "#9aa0a6", { s: 0 }) + person(140, 580, 2.4, t, { top: "#f2c230", pants: "#3a4a6a", coat: "#f2c230", hair: "short", hairCol: "#d8c080", skin: "#f0c8a8" }) + G('translate(230 520)', R(-20, -14, 40, 28, "#2a2a2a", { w: 1.4 }) + '<path d="M20 0 Q50 10 60 40" stroke="#1a1a1a" stroke-width="3" fill="none"/>' + R(56, 36, 30, 10, "#8a8a8a", { w: 1 })) + G('translate(180 230)', '<path d="M120 0 H-80 M-60 -16 L-80 0 L-60 16" stroke="#ff5a3a" stroke-width="5" fill="none"/>' + txt("الشرق", 70, -14, 18, "#ff5a3a", {}), k) + label("التسريب جاي منين؟", 180, 160, u, .5, 26, "#3a3a3a"); });
  // 51 — and only then did the Soviet Union admit it, in a tiny item on television
  shot(51, push([180, 340], [180, 330], 1.0, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#3a2e24", { s: 0 }) + '<circle cx="180" cy="330" r="200" fill="#9ac8e8" opacity=".12"/>' + tv(180, 350, 1.6, t) + label("خبر صغير", 180, 170, u, .6, 32, "#fff") + label("28 أبريل", 180, 206, u, 1.0, 18, "#f2c230"); });
  // 52 — the question is answered: the button made to save the reactor… is what blew it up
  shot(52, push([180, 330], [180, 330], 1.2, 1.5), function (u, d, t) { return R(-200, -200, 760, 1040, "#1a201e", { s: 0 }) + az5(180, 340, 1.8, t, { crack: u > 1.5, glow: true }) + label("الزرار هو اللي فجّره", 180, 160, u, 1.6, 26, "#f2c230"); });
  // 53 — afterwards more than half a million people worked for months to cover the reactor and bury what was around it
  shot(53, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyGrey") + plant(180, 470, .9, t, { blown: true, k: .25 }) + forestBand(470) + helicopter(lerp(-40, 300, clamp(u / d)), 210, 1.2, t); for (var q = 0; q < 10; q++) { var ph = ((t * .9 + q / 10) % 1); s += '<circle cx="' + f(lerp(-40, 300, clamp(u / d)) + (q % 3) * 3) + '" cy="' + f(230 + ph * 200) + '" r="2.4" fill="#c8b48a" opacity="' + f2(1 - ph * .5) + '"/>'; } for (var i = 0; i < 5; i++) s += person(30 + i * 70, 600, 1.9, t, { top: "#7a8a6a", pants: "#7a8a6a", coat: "#7a8a6a", mask: true, hair: "short", skin: SK[i % 4], ph: i, walk: i % 2 === 0 }); return s + label("أكتر من نص مليون", 180, 150, u, .5, 26, "#f2c230"); });
  // 54 — and an exclusion zone of thirty kilometres was set up, still there today
  shot(54, push([180, 340], [180, 330], 1.0, 1.12), function (u, d, t) { return sky("skyGrey") + forestBand(440) + R(-200, 440, 760, 300, "#7a7468", { s: 0 }) + '<path d="M-200 470 H560" stroke="#c22a2a" stroke-width="3"/>' + R(110, 280, 140, 120, "#f4f2ec", { w: 2 }) + trefoil(180, 320, 22) + txt("30 كم", 180, 380, 22, "#1a1a1a", { wt: 900 }) + R(170, 400, 6, 70, "#5a5a5a", { w: 1 }) + R(-200, 480, 760, 10, "#c22a2a", { w: 1 }) + R(-200, 480, 760, 10, "#fff", { s: 0, op: .5 }) + label("منطقة ممنوعة", 180, 170, u, .5, 30, "#fff"); });
  // 55 — but there is something nobody expected
  shot(55, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { return sky("skyGrey") + cloudBank(t, 120, 3, 4, "#e8ecf0", .7) + forestBand(470) + ferris(180, 340, 1.6, t, { rust: true, rot: Math.sin(t * .2) * .02 }) + label("بس…", 180, 150, u, .6, 34, "#fff"); });
  // 56 — Pripyat emptied of people… and nature came back (the city from the roof, trees through the squares)
  shot(56, push([180, 340], [200, 340], 1.0, 1.1), function (u, d, t) { var s = sky("skyGrey") + cloudBank(t, 110, 3, 6, "#eef0f2", .8) + pripyat(t, 420, { empty: true }) + R(-200, 420, 760, 300, "#8a8a80", { s: 0 }); for (var i = 0; i < 40; i++) { var x = -180 + hash(i) * 720, y = 440 + hash(i + 3) * 200, r = 14 + hash(i + 5) * 22, gr = clamp(u / d * 1.4 - hash(i) * .4); if (gr > 0) s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * gr) + '" fill="' + ["#4a7a3a", "#5a8a44", "#3a6a32"][i % 3] + '" stroke="' + INK + '" stroke-width="1"/>'; } return s + label("الطبيعة رجعت", 180, 170, u, .8, 30, "#9ad08a"); });
  // 57 — wolves, deer and wild horses came back to live in the streets people left
  shot(57, push([180, 360], [200, 360], 1.0, 1.1), function (u, d, t) { var s = sky("skySpring") + block(-40, 420, 90, 150, t, { col: "#c8c4b8", empty: true }) + block(220, 420, 110, 130, t, { col: "#d0ccc0", empty: true }) + R(-200, 420, 760, 300, "#7a8a6a", { s: 0 }) + forestBand(430); return s + R(-200, 450, 760, 300, "#8a9a6a", { s: 0 }) + horse(lerp(60, 120, clamp(u / d)), 560, 1.4, t) + horse(lerp(190, 240, clamp(u / d)), 590, 1.2, t, { flip: true }) + wolf(lerp(-40, 80, clamp(u / d)), 500, 1.0, t) + label("الديابة والخيول البرية", 180, 170, u, .5, 24, "#fff"); });
  // 58 — the reactor was covered by a giant steel arch, put in place in 2016
  shot(58, push([180, 340], [180, 320], 1.0, 1.12), function (u, d, t) { var k = ease(clamp(u / (d * .7))); return sky("skySpring") + cloudBank(t, 110, 4, 5, "#fff", .85) + forestBand(470) + plant(180, 470, 1.0, t, { blown: true, k: 0 }) + G('translate(' + f(lerp(-200, 0, k)) + ' 0)', confinement(310, 470, .9, t)) + label("2016", 180, 160, u, .5, 36, "#f2c230"); });
  // 59 — the city of 50,000 people… became a nature reserve, without anyone meaning it to
  shot(59, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { var s = sky("skySunset") + '<circle cx="90" cy="300" r="34" fill="#ffd890"/>' + cloudBank(t, 140, 3, 5, "#f6b070", .7) + pripyat(t, 440, { empty: true }); for (var i = 0; i < 30; i++) s += '<circle cx="' + f(-180 + hash(i) * 720) + '" cy="' + f(430 + hash(i + 3) * 60) + '" r="' + f(16 + hash(i + 5) * 20) + '" fill="' + ["#4a6a32", "#5a7a3a"][i % 2] + '"/>'; return s + R(-200, 480, 760, 300, "#4a5a32", { s: 0 }) + horse(240, 580, 1.0, t, { flip: true }) + rays(t, 90, 300, .2, 5, 500, .4) + label("محمية طبيعية", 180, 170, u, 1.2, 30, "#9ad08a"); });
  // 60 — tell us: which story next time?
  shot(60, push([180, 330], [180, 330], 1.0, 1.06), function (u, d, t) { return sky("skySunset") + forestBand(500) + ferris(180, 380, 1.7, t, { rust: true, rot: t * .02 }) + rays(t, 180, 380, 1.57, 8, 500, .4) + label("قولولنا!", 180, 170, u, .3, 34, "#fff"); });

  window.__parts = { person: person, portrait: portrait, plant: plant, controlRoom: controlRoom, az5: az5, core: core, pripyat: pripyat, ferris: ferris, confinement: confinement, op: op, fireman: fireman };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 9 && i <= 14) ? .9 : 0; };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * .9), z = c[2] * (1 + .02 * Math.sin(t * .8)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
