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
    g += R(-4, -144, 8, 10, skin, { w: 1.1 }) + G('translate(0 -157) rotate(' + f(view === "up" ? (side ? -18 : 0) : br) + ')', face(view, { skin: skin, hair: o.helmet ? 'short' : hair, hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, helmet: o.helmet, mustache: o.mustache }));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * .42 * (o.flip ? -1 : 1)) + ' ' + f(s * .42) + ')', g, o.op);
  }
  // a big close-up portrait (the user's middle panel): head and shoulders, cel-shaded, light from the left
  function portrait(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, skin = o.skin || "#c98f66", top = o.top || "#f0ede4", bl = (t % 4.2) < .12;
    var g = '<clipPath id="' + cid + '"><rect x="4" y="-200" width="200" height="400"/></clipPath>';
    g += cel('M-70 120 Q-66 60 -30 48 L30 48 Q66 60 70 120 Z', top, cid, { w: 2 }) + '<path d="M-14 48 L0 70 L14 48" stroke="' + INK + '" stroke-width="1.6" fill="' + darker(top, .85) + '"/>';
    g += cel('M-11 20 L-12 52 Q0 58 12 52 L11 20 Z', skin, cid, { w: 1.6 });
    g += G('scale(2.6)', face("front", { skin: skin, hair: o.hair || "bob", hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, child: o.child, helmet: o.helmet, mustache: o.mustache }));
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

  // ── «العبور» in the «القصة 2D» look: shots, one per script line. cam(u, d) → [cx, cy, zoom]; draw(u, d, t) → svg ──
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
  var CAMO = "url(#camo)", OLIVE = "#5a5c3c", KHAKI = "#b3a272";
  function soldier(x, y, s, t, o) { o = o || {}; return person(x, y, s, t, Object.assign({ top: CAMO, pants: CAMO, helmet: OLIVE, skin: ["#c98f66", "#b98058", "#a87048", "#d9a57a"][(o.k || 0) % 4], ph: o.k }, o)); }
  function officer(x, y, s, t, o) { o = o || {}; return person(x, y, s, t, Object.assign({ top: KHAKI, pants: KHAKI, hair: "cap", cap: "#6a6a44", skin: "#c98f66", mustache: true }, o)); }

  // ── the canal seen across, from the Egyptian bank: the far bank's sand rampart with its strongpoints, the water,
  //    the near bank. Breaches are notches cut through the rampart with mud pouring down into the canal. ──
  function rampart(t, wy, H, br, o) {
    o = o || {}; var top = wy - H, s = "", d = "M-220 " + wy + " L-220 " + f(top + 6);
    for (var x = -220; x <= 580; x += 10) { var y = top + Math.sin(x * .05) * 3 + Math.sin(x * .17) * 1.5 + (hash(x) - .5) * 2; (br || []).forEach(function (b) { var dx = Math.abs(x - b.x), w = 16 + b.p * 22; if (dx < w) y = Math.max(y, lerp(y, wy - 4, b.p * (1 - dx / w * .7))); }); d += " L" + x + " " + f(y); }
    d += " L580 " + wy + " Z";
    s += P(d, o.night ? "#5a5240" : "url(#sandFace)", { w: 1.6 });
    for (var g = 0; g < 46; g++) { var gx = -210 + g * 17 + hash(g) * 8; s += '<path d="M' + f(gx) + ' ' + f(top + 8 + hash(g + 3) * 8) + ' q' + f((hash(g) - .5) * 6) + ' ' + f(H * .4) + ' ' + f((hash(g + 1) - .5) * 4) + ' ' + f(H - 12) + '" stroke="' + (o.night ? "#3a3428" : "#9a7444") + '" stroke-width="1" fill="none" opacity=".55"/>'; }
    s += '<path d="M-220 ' + f(top + 4) + ' ' + Array.apply(null, Array(40)).map(function (_, i) { var x = -220 + i * 20; return "L" + x + " " + f(top + Math.sin(x * .05) * 3 + 2); }).join(" ") + '" stroke="' + (o.night ? "#7a7058" : "#f2dca8") + '" stroke-width="3" fill="none" opacity=".7"/>';
    if (o.forts !== false) [40, 230, 420].forEach(function (fx) { s += R(fx, top - 9, 34, 10, o.night ? "#3a3a36" : "#8a8a80", { w: 1.2 }) + R(fx + 6, top - 6, 22, 2, "#15171c", { s: 0 }); });
    (br || []).forEach(function (b) { if (b.p > .05) { var w = 16 + b.p * 22, ny = wy - H * (1 - b.p * .9); s += P('M' + f(b.x - w) + ' ' + f(top + 2) + ' L' + f(b.x - w * .35) + ' ' + f(ny) + ' L' + f(b.x - w * .2) + ' ' + f(ny) + ' L' + f(b.x - w * .7) + ' ' + f(top + 4) + ' Z', "#8a6a40", { s: 0, op: .8 }) + P('M' + f(b.x + w) + ' ' + f(top + 2) + ' L' + f(b.x + w * .35) + ' ' + f(ny) + ' L' + f(b.x + w * .2) + ' ' + f(ny) + ' L' + f(b.x + w * .7) + ' ' + f(top + 4) + ' Z', "#a8844e", { s: 0, op: .8 }); s += mudFlow(t, b.x, wy, H, b.p); } });
    return s;
  }
  function mudFlow(t, x, wy, H, p) {
    var w = 10 + p * 20, ty = wy - H * (1 - p * .7), s = "";
    s += P('M' + f(x - w * .5) + ' ' + f(ty) + ' Q' + f(x - w) + ' ' + f((ty + wy) / 2) + ' ' + f(x - w * 1.4) + ' ' + f(wy + 4) + ' L' + f(x + w * 1.4) + ' ' + f(wy + 4) + ' Q' + f(x + w) + ' ' + f((ty + wy) / 2) + ' ' + f(x + w * .5) + ' ' + f(ty) + ' Z', "url(#mud)", { w: 1.2 });
    for (var i = 0; i < 7; i++) { var u = ((t * .9 + i / 7) % 1), yy = lerp(ty, wy, u), xx = x + (i - 3) * w * .3 * (.6 + u); s += '<path d="M' + f(xx) + ' ' + f(yy) + ' q' + f(Math.sin(i + t) * 2) + ' 6 0 12" stroke="#c9a070" stroke-width="1.6" fill="none" opacity="' + f2(.8 * (1 - u)) + '"/>'; }
    s += '<ellipse cx="' + f(x) + '" cy="' + f(wy + 8) + '" rx="' + f(w * 2.4 + Math.sin(t * 2) * 2) + '" ry="' + f(6 + p * 4) + '" fill="#7a5a3a" opacity=".6"/>';
    return s;
  }
  function water(t, wy, h, o) { o = o || {}; var s = R(-220, wy, 800, h, o.col || "url(#canal)", { s: 0 }); for (var i = 0; i < 26; i++) { var x = ((hash(i) * 800 + t * (8 + hash(i) * 10)) % 800) - 220, y = wy + 6 + hash(i + 2) * (h - 10); s += '<path d="M' + f(x) + ' ' + f(y) + ' h' + f(10 + hash(i + 5) * 20) + '" stroke="#d8f0f8" stroke-width="1.2" opacity=".5"/>'; } return s; }
  function nearBank(t, y, o) { o = o || {}; var s = P('M-220 ' + y + ' Q0 ' + (y - 10) + ' 180 ' + y + ' T580 ' + y + ' V900 H-220 Z', o.night ? "#3a3428" : "url(#sand)", { w: 1.4 }); for (var i = 0; i < 30; i++) s += '<ellipse cx="' + f(-200 + hash(i) * 760) + '" cy="' + f(y + 20 + hash(i + 1) * 160) + '" rx="' + f(4 + hash(i + 2) * 8) + '" ry="1.5" fill="#000" opacity=".1"/>'; return s; }
  function palm(x, y, s, t) { var sw = Math.sin(t * .9 + x) * 2, g = P('M-3 0 Q' + f(-2 + sw * .3) + ' -40 ' + f(sw) + ' -80 L' + f(4 + sw) + ' -80 Q' + f(3 + sw * .3) + ' -40 4 0 Z', "#8a6a44", { w: 1.2 }); for (var k = 0; k < 7; k++) { var a = -2.6 + k * .55; g += P('M' + f(sw + 1) + ' -80 Q' + f(sw + Math.cos(a) * 18) + ' ' + f(-86 + Math.sin(a) * 14) + ' ' + f(sw + Math.cos(a) * 32) + ' ' + f(-76 + Math.sin(a) * 6 + 12) + ' Q' + f(sw + Math.cos(a) * 16) + ' ' + f(-80 + Math.sin(a) * 8) + ' ' + f(sw + 1) + ' -80Z', k % 2 ? "#4f7a34" : "#6a9a44", { w: 1 }); } return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function canal(t, o) {
    o = o || {}; var wy = o.wy || 330, s = sky(o.sky || "skyNoon") + (o.sun ? '<circle cx="' + o.sun[0] + '" cy="' + o.sun[1] + '" r="26" fill="#fff6d0"/><circle cx="' + o.sun[0] + '" cy="' + o.sun[1] + '" r="60" fill="url(#warm)" opacity=".6"/>' : "") + cloudBank(t, o.cy || 110, 4, 6, o.cloud || "#ffffff", o.cop || .85, 1.1) + cloudBank(t * .6, (o.cy || 110) + 50, 3, 5, o.cloud || "#f2f4f6", (o.cop || .85) * .8, .8);
    s += P('M-220 ' + (wy - (o.H || 70) - 4) + ' H580 V' + wy + ' H-220 Z', o.night ? "#2a2a2a" : "#b89462", { s: 0 });
    s += rampart(t, wy, o.H || 70, o.br, o) + water(t, wy, o.ww || 110, { col: o.wcol });
    return s;
  }
  // ── boats ──
  function inflatable(x, y, s, t, o) {
    o = o || {}; var g = "", n = o.n == null ? 4 : o.n;
    g += P('M-62 -2 Q-66 -16 -52 -18 H38 Q62 -18 72 -30 Q78 -16 64 -2 Q52 6 30 6 H-52 Q-64 6 -62 -2Z', "#2b2f33", { w: 1.8 });
    for (var i = 0; i < n; i++) { var px = -40 + i * 26, w = Math.sin(t * 3 + i * .6); g += soldier(px, -10, .42, t, { k: (o.k || 0) + i, view: "side" }) ; if (o.paddle !== false) g += '<path d="M' + f(px + 6) + ' -40 L' + f(px + 14 + w * 10) + ' 14" stroke="#8a6a44" stroke-width="3"/>' + P('M' + f(px + 11 + w * 10) + ' 8 l6 0 l-1 12 l-5 0Z', "#8a6a44", { w: 1 }); }
    if (o.ladder) g += P('M-50 -26 L50 -36 L51 -32 L-49 -22 Z', "#9a7448", { w: 1 }) + '<path d="M-40 -25 l1 4 M-20 -27 l1 4 M0 -29 l1 4 M20 -31 l1 4 M40 -33 l1 4" stroke="#6a4a2a" stroke-width="2"/>';
    g += P('M-62 -2 Q-60 -10 -52 -10 H38 Q60 -10 70 -22 L72 -14 Q60 0 30 2 H-52 Q-60 2 -62 -2Z', "#3a3e44", { s: 0 }) + '<path d="M-50 -12 H38 Q58 -12 68 -24" stroke="#9a9480" stroke-width="1.2" fill="none"/>';
    g += '<path d="M-70 4 q10 4 20 0 M60 4 q10 4 20 0" stroke="#e6f6fc" stroke-width="2" fill="none" opacity=".7"/>';
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 2 + x) * 1.2) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g);
  }
  function pumpBoat(x, y, s, t, o) {
    o = o || {}; var g = "";
    g += P('M-60 -4 L-60 -24 L52 -24 Q66 -22 70 -10 L66 0 L-56 0 Z', "#6e7468", { w: 1.6 }) + R(-58, -28, 110, 4, "#5a5f58", { w: 1 });
    g += R(-46, -52, 30, 24, "#5f6040", { w: 1.4 }) + '<rect x="-44" y="-62" width="20" height="10" rx="4" fill="#b8322a" stroke="' + INK + '" stroke-width="1.2"/>';
    g += G('translate(-50 -40) rotate(' + f(t * 900 % 360) + ')', '<circle r="9" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.2"/><path d="M-8 0 H8 M0 -8 V8" stroke="#c9c9c0" stroke-width="1.5"/>');
    g += '<circle cx="-6" cy="-38" r="10" fill="#8a9098" stroke="' + INK + '" stroke-width="1.4"/>';
    g += '<path d="M-6 -30 Q-10 -10 -24 6 Q-30 20 -26 40" stroke="#141414" stroke-width="5" fill="none"/>';
    g += '<path d="M2 -40 Q20 -20 40 -30 Q52 -40 56 -50" stroke="#c8b48a" stroke-width="4.5" fill="none"/>';
    g += soldier(48, -24, .4, t, { k: (o.k || 0) + 3, view: "side" }) + soldier(20, -24, .36, t, { k: (o.k || 0) + 4, view: "side" });
    g += P('M54 -52 l14 -12 l3 3 l-13 13Z', "#c9a040", { w: 1 });
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.6 + x) * 1) + ') scale(' + f(s) + ')', g);
  }
  function jetArc(t, x0, y0, x1, y1, arc, k) { var s = ""; for (var i = 0; i < 40; i++) { var u = ((t * 1.4 + i / 40) % 1), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * arc, r = 1.2 + u * 2.4; s += '<circle cx="' + f(x + Math.sin(i * 7) * u * 3) + '" cy="' + f(y + Math.cos(i * 5) * u * 2) + '" r="' + f(r) + '" fill="#eef8fc" opacity="' + f2(.9 - u * .3) + '"/>'; }
    s += '<path d="M' + f(x0) + ' ' + f(y0) + ' Q' + f((x0 + x1) / 2) + ' ' + f((y0 + y1) / 2 - arc * 2) + ' ' + f(x1) + ' ' + f(y1) + '" stroke="#f4fbfe" stroke-width="3" fill="none" opacity=".75"/>';
    for (var j = 0; j < 8; j++) { var ph = ((t * 1.2 + j / 8) % 1); s += '<circle cx="' + f(x1 + (j - 4) * 3 * (1 + ph)) + '" cy="' + f(y1 - ph * 14) + '" r="' + f(3 + ph * 7) + '" fill="#f6fbfd" opacity="' + f2(.6 * (1 - ph)) + '"/>'; }
    return s; }
  // ── aircraft: MiG-21 (clipped delta, nose intake with cone, bubble canopy, swept fin, drop tank) side and top views ──
  function mig(x, y, s, t, o) { o = o || {}; var g = "";
    g += P('M-70 -6 L60 -8 Q72 -8 80 -4 L80 4 Q72 8 60 8 L-70 8 L-76 4 L-76 -2 Z', "url(#jetcamo)", { w: 1.6 });
    g += '<ellipse cx="80" cy="0" rx="3" ry="7" fill="#111" stroke="' + INK + '"/>' + P('M80 -3 L90 0 L80 3 Z', "#8a9098", { w: 1 });
    g += P('M38 -8 Q46 -18 58 -8 Z', "#6aa0c0", { w: 1.2 }) + P('M-60 -8 L-80 -40 L-90 -40 L-78 -6 Z', "url(#jetcamo)", { w: 1.4 });
    [["#c22a2a", -82], ["#ffffff", -78], ["#161616", -74]].forEach(function (c) { g += R(c[1], -34, 4, 10, c[0], { s: 0 }); });
    g += P('M20 4 L-40 14 L-50 14 L-30 4 Z', "#a8946a", { w: 1.2 }) + '<rect x="-20" y="10" width="40" height="7" rx="3.5" fill="#b8a070" stroke="' + INK + '"/>';
    g += P('M-76 -2 L-96 0 L-76 4 Z', "#ffb050", { s: 0, op: .8 + .2 * Math.sin(t * 20) });
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function migTop(x, y, s, t, o) { o = o || {}; var g = "";
    g += P('M0 -70 L10 -40 L40 20 L40 28 L10 30 L8 50 L24 64 L24 70 L-24 70 L-24 64 L-8 50 L-10 30 L-40 28 L-40 20 L-10 -40 Z', "url(#jetcamo)", { w: 1.6 });
    g += P('M-5 -64 Q0 -74 5 -64 L6 -30 L-6 -30 Z', "url(#jetcamo)", { w: 1 }) + '<ellipse cx="0" cy="-44" rx="4" ry="9" fill="#6aa0c0" stroke="' + INK + '"/>';
    [-24, 24].forEach(function (rx) { g += '<circle cx="' + rx + '" cy="16" r="6" fill="#c22a2a"/><circle cx="' + rx + '" cy="16" r="4" fill="#fff"/><circle cx="' + rx + '" cy="16" r="2" fill="#161616"/>'; });
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + (o.rot || 0) + ') scale(' + f(s) + ')', g); }
  function fieldGun(x, y, s, t, o) { o = o || {}; var fire = ((t * 1.3 + (o.ph || 0)) % 1) < .12, g = "";
    g += P('M-30 0 L-4 -10 L30 -40 L34 -36 L4 -6 L24 0 Z', "#5f6040", { w: 1.4 }) + '<circle cx="-4" cy="0" r="10" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.4"/>' + R(-14, -18, 18, 14, "#6a6a44", { w: 1.2 });
    if (fire) g += '<circle cx="40" cy="-46" r="12" fill="#ffd060"/><circle cx="40" cy="-46" r="22" fill="#ffb040" opacity=".5"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function tank2(x, y, s, t, o) { o = o || {}; var g = P('M-40 -10 L40 -10 L46 0 L40 8 L-40 8 L-46 0 Z', "#2a2a26", { w: 1.4 }); for (var i = 0; i < 6; i++) g += '<circle cx="' + (-32 + i * 13) + '" cy="0" r="5" fill="#4a4a40" stroke="' + INK + '"/>';
    g += P('M-36 -10 L-30 -22 L34 -22 L38 -10 Z', "#8a7a50", { w: 1.4 }) + P('M-16 -22 Q-14 -34 4 -34 Q18 -34 18 -22 Z', "#7a6a44", { w: 1.4 }) + R(16, -30, 40, 4, "#6a5a3a", { w: 1 }) + (o.lights ? '<circle cx="38" cy="-14" r="3" fill="#fff4c8"/><path d="M40 -14 L90 -24 L90 -4 Z" fill="#fff4c8" opacity=".25"/>' : "");
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function puff(x, y, r, t, i) { var ph = ((t * .7 + hash(i)) % 1); return '<circle cx="' + f(x) + '" cy="' + f(y - ph * 40) + '" r="' + f(r * (.6 + ph)) + '" fill="#5a524a" opacity="' + f2(.75 * (1 - ph)) + '"/>' + (ph < .2 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * .7) + '" fill="#ffb040"/>' : ""); }
  function wallClock(x, y, r, h, m) { var ha = ((h % 12) + m / 60) / 12 * 360, ma = m / 60 * 360, s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 4) + '" fill="#6a4a2a" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f6f0e0" stroke="' + INK + '"/>';
    for (var i = 1; i <= 12; i++) { var a = i / 12 * Math.PI * 2; s += txt(String(i), x + Math.sin(a) * r * .78, y - Math.cos(a) * r * .78 + r * .09, r * .24, "#1b1d22", { font: "Noto Serif", wt: 700 }); }
    return s + '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r * .5) + '" stroke="' + INK + '" stroke-width="' + f(r * .08) + '" stroke-linecap="round" transform="rotate(' + f(ha) + ' ' + x + ' ' + y + ')"/><path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - r * .75) + '" stroke="' + INK + '" stroke-width="' + f(r * .05) + '" stroke-linecap="round" transform="rotate(' + f(ma) + ' ' + x + ' ' + y + ')"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + INK + '"/>'; }
  function sandbags(x, y, n, s) { var g = ""; for (var r = 0; r < 3; r++) for (var i = 0; i < n; i++) g += '<rect x="' + (i * 22 + (r % 2) * 11) + '" y="' + (-r * 10) + '" width="22" height="11" rx="5" fill="' + ["#b89a68", "#a88a58"][(i + r) % 2] + '" stroke="' + INK + '" stroke-width="1.2"/>'; return G('translate(' + x + ' ' + y + ') scale(' + s + ')', g); }
  function tentIn(t) { var s = R(-200, -200, 760, 1040, "#6a5a3a", { s: 0 }) + P('M-200 -200 L180 60 L560 -200 Z', "#8a7a4c", { s: 0 }) + P('M-200 840 L-200 300 L180 60 L560 300 L560 840 Z', "#7a6a42", { s: 0 }) + R(-200, 420, 760, 400, "#b8945c", { s: 0 }) + rays(t, 180, 60, 1.57, 5, 400, .3); return s; }
  function mapTable(x, y, s) { return G('translate(' + x + ' ' + y + ') scale(' + s + ')', P('M-110 -20 L110 -20 L130 30 L-130 30 Z', "#e8dcb8", { w: 2 }) + P('M-14 -20 L14 -20 L20 30 L-20 30 Z', "#3a8ab8", { s: 0 }) + P('M14 -20 L22 -20 L30 30 L20 30 Z', "#c9a060", { s: 0 }) + [-6, 4, 14, 24].map(function (yy) { return '<path d="M-80 ' + yy + ' L4 ' + yy + '" stroke="#b8322a" stroke-width="3"/><path d="M4 ' + (yy - 5) + ' L14 ' + yy + ' L4 ' + (yy + 5) + 'Z" fill="#b8322a"/>'; }).join("") + R(-130, 30, 260, 10, "#6a4a2a", { w: 1.6 }) + R(-120, 40, 10, 60, "#5a3a22", { w: 1 }) + R(110, 40, 10, 60, "#5a3a22", { w: 1 })); }
  function damScene(t, k, o) { o = o || {}; var s = sky(o.sky || "skyNoon") + cloudBank(t, 120, 4, 5, "#fff", .8) + R(-200, 230, 760, 60, "url(#canal)", { s: 0 });
    s += P('M-200 300 L-60 230 L420 230 L560 300 Z', "#b8a070", { w: 1.6 }) + R(-60, 226, 480, 6, "#9a8458", { w: 1 }) + G('translate(300 230)', [0, 1, 2, 3, 4].map(function (i) { return P('M' + (-14 + i * 6) + ' 0 Q' + (-20 + i * 9) + ' -80 ' + (-6 + i * 3) + ' -150 L' + (-2 + i * 3) + ' -150 Q' + (-10 + i * 9) + ' -80 ' + (-6 + i * 6) + ' 0 Z', "#e8e2d4", { w: 1 }); }).join(""));
    s += R(-200, 300, 760, 400, "url(#sand)", { s: 0 }) + P('M140 470 Q200 ' + f(340 + k * 60) + ' 300 ' + f(360 + k * 50) + ' Q360 380 400 470 Z', "#d8b878", { w: 1.6 });
    [0, 1].forEach(function (i) { var bx = 30 + i * 50, by = 470 + i * 20; s += R(bx - 40, by - 6, 50, 8, "#6a7078", { w: 1.2 }) + P('M' + (bx + 10) + ' ' + (by - 6) + ' l14 -10 l3 4 l-13 10Z', "#c23a26", { w: 1 }) + jetArc(t + i * .4, bx + 24, by - 16, 230 + i * 30, 400 + k * 20, 30, k) + person(bx - 30, by + 26, 1.3, t, { top: "#3a5a8a", pants: "#2a3a5a", hair: "cap", cap: "#f2c230", k: i }); });
    return s; }
  function roomTA(t, h, m) { var s = R(-200, -200, 760, 1040, "#3a4658", { s: 0 }) + R(40, 120, 90, 120, "#14203e", { w: 3, s: "#d8d2c4" }) + '<circle cx="70" cy="150" r="2" fill="#fff"/><circle cx="100" cy="190" r="1.5" fill="#fff"/>' + wallClock(260, 170, 34, h, m);
    s += R(-200, 430, 760, 400, "#2a2e38", { s: 0 }) + P('M20 430 L20 380 L200 380 L210 430 Z', "#e8e2d4", { w: 2 }) + P('M60 386 Q130 360 206 390 L206 410 L60 410 Z', "#5a7aa8", { w: 1.6 }) + R(230, 370, 60, 60, "#7a5a3a", { w: 1.6 }) + P('M244 362 h32 v8 h-32 Z', "#1e1e1e", { w: 1.2 }) + '<circle cx="300" cy="350" r="12" fill="#ffd890" opacity=".9"/><circle cx="300" cy="350" r="60" fill="url(#warm)" opacity=".4"/>';
    return s; }

  // ═════════ the shots ═════════
  var BR = function (n, p) { var a = []; for (var i = 0; i < n; i++) a.push({ x: -100 + i * 70, p: clamp(p * (1 + hash(i) * .3) - hash(i + 5) * .2) }); return a; };
  // 0 — 6 October 1973, 10 Ramadan
  shot(0, push([180, 300], [180, 320], 1.15, 1.0), function (u, d, t) { return canal(t, { sun: [70, 120] }) + nearBank(t, 450) + palm(40, 470, 1.1, t) + palm(320, 480, .9, t) + soldier(140, 520, 1.6, t, { k: 1, back: true }) + soldier(220, 530, 1.5, t, { k: 2, back: true }) + rays(t, 70, 120, .9, 5, 500, .35) + label("6 أكتوبر 1973", 180, 190, u, .3, 30, "#fff") + label("10 رمضان", 180, 222, u, .8, 18, "#f2c230"); });
  // 1 — the sun is hot on the Suez Canal, the water still, the soldiers fasting
  shot(1, push([180, 330], [190, 340], 1.0, 1.1), function (u, d, t) { return canal(t, { sun: [300, 90] }) + nearBank(t, 430) + palm(30, 470, 1.4, t) + sandbags(-10, 470, 12, 1) + soldier(120, 560, 2.5, t, { k: 3, mood: "flat" }) + soldier(220, 575, 2.6, t, { k: 4, look: "up" }) + soldier(300, 560, 2.3, t, { k: 5, flip: true }) + rays(t, 300, 90, 2.2, 5, 600, .4) + dust(t, 20, "#fff6dc", .5) + label("صايمين", 180, 200, u, 1.2, 26, "#f2c230"); });
  // 2 — on the other bank, a sand mountain over 20 m high along the whole canal
  shot(2, push([180, 300], [180, 280], 1.0, 1.25), function (u, d, t) { return canal(t, { wy: 380, H: 150, ww: 90 }) + nearBank(t, 470) + soldier(70, 600, 2.4, t, { k: 6, back: true }) + '<path d="M330 380 V230" stroke="#f2c230" stroke-width="2" stroke-dasharray="5 4"/>' + label("أكتر من 20 متر", 220, 200, u, 1.0, 26, "#f2c230") + label("الساتر الترابي", 220, 160, u, 1.4, 18, "#fff"); });
  // 3 — it was said it needed an atomic bomb to open
  shot(3, push([180, 300], [180, 300], 1.1, 1.0), function (u, d, t) { return canal(t, { wy: 400, H: 190, ww: 80, sky: "skySmoke", cop: .5 }) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .25 }) + label("قنبلة ذرية؟", 180, 200, u, .5, 40, "#fff"); });
  // 4 — so how did it open in hours… with the canal's own water?
  shot(4, push([200, 330], [230, 320], 1.0, 1.15), function (u, d, t) { var k = clamp(u / d); return canal(t, { wy: 380, H: 120, br: [{ x: 250, p: .2 + k * .5 }] }) + pumpBoat(120, 400, 1.1, t, { k: 1 }) + jetArc(t, 182, 333, 250, 300 + k * 30, 30, k) + nearBank(t, 500) + label("بالمية؟", 180, 190, u, .8, 36, "#7ad0f0"); });
  // 5 — and why 2 in the afternoon, not dawn like any war?
  shot(5, push([180, 320], [180, 300], 1.0, 1.08), function (u, d, t) { return canal(t, { sun: [260, 150] }) + nearBank(t, 450) + wallClock(180, 330, 60, 2, 0) + rays(t, 260, 150, 2.4, 6, 600, .4) + label("14:00", 180, 200, u, .3, 40, "#f2c230") + label("مش مع الفجر؟", 180, 450, u, 1.0, 22, "#fff"); });
  // 6 — the story of that day, hour by hour; we begin before dawn
  shot(6, push([180, 320], [180, 310], 1.1, 1.0), function (u, d, t) { var s = canal(t, { sky: "skyNight", night: true, cloud: "#2a3048", cop: .6, wcol: "#0e1a30" }) + nearBank(t, 450, { night: true }); for (var i = 0; i < 40; i++) s += '<circle cx="' + f(hash(i) * 360) + '" cy="' + f(hash(i + 3) * 200) + '" r="' + f(.6 + hash(i + 1)) + '" fill="#fff" opacity="' + f2(.4 + .4 * Math.sin(t * 2 + i)) + '"/>'; return s + '<circle cx="290" cy="90" r="16" fill="#f4f1e4"/>' + label("قبل الفجر", 180, 200, u, .5, 34, "#fff"); });
  // 7 — 3 a.m., suhoor in the trenches; nobody knows that today is the day
  shot(7, push([180, 360], [180, 380], 1.0, 1.12), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#0a0f1e", { s: 0 }) + R(-200, 250, 760, 600, "#3a3024", { s: 0 }) + sandbags(-20, 300, 18, 1.2) + '<circle cx="180" cy="420" r="120" fill="url(#warm)" opacity="' + f2(.7 + .1 * Math.sin(t * 9)) + '"/>' + R(170, 400, 20, 26, "#c9a860", { w: 1.4 }) + '<ellipse cx="180" cy="402" rx="6" ry="9" fill="#ffd27a"/>';
    [[90, 540, 2.1, 1], [140, 560, 2.2, 2], [230, 555, 2.2, 3], [280, 540, 2.0, 4]].forEach(function (p) { s += soldier(p[0], p[1], p[2], t, { k: p[3], flip: p[0] > 180, mood: p[3] === 2 ? "smile" : "flat", helmet: p[3] % 2 ? OLIVE : null, hair: "short" }); });
    return s + R(140, 470, 80, 14, "#7a5a3a", { w: 1.2 }) + '<ellipse cx="160" cy="466" rx="10" ry="4" fill="#e8e2d4"/><ellipse cx="200" cy="466" rx="10" ry="4" fill="#e8e2d4"/>' + dust(t, 14, "#ffd27a", .4) + label("3:00", 180, 160, u, .3, 40, "#f2c230") + label("السحور", 180, 196, u, .7, 20, "#fff"); });
  // 8 — most learned only hours before, so the secret wouldn't leak
  shot(8, push([180, 330], [180, 320], 1.05, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#140f0a", { s: 0 }) + '<circle cx="180" cy="320" r="200" fill="url(#warm)" opacity=".35"/>' + portrait(110, 360, 1.8, t, { helmet: OLIVE, top: CAMO, skin: "#b98058", rim: true }) + portrait(260, 370, 1.7, t, { helmet: OLIVE, top: CAMO, skin: "#c98f66", sad: true }) + label("سرّ", 180, 170, u, .5, 40, "#f2c230"); });
  // 9 — after dawn, on the bank, the scene was strange
  shot(9, push([180, 320], [200, 330], 1.0, 1.08), function (u, d, t) { return canal(t, { sky: "skyMorning", sun: [300, 260] }) + nearBank(t, 450) + palm(50, 470, 1.2, t) + palm(330, 470, 1.0, t) + rays(t, 300, 260, 2.6, 6, 600, .5) + dust(t, 14); });
  // 10 — soldiers sucking sugarcane, swimming in the canal, washing clothes (triptych)
  shot(10, still, function (u, d, t) { return tri(t, u, d,
    function (t) { return canal(t, { wy: 70, H: 40, ww: 0 }) + R(-200, 70, 760, 200, "url(#sand)", { s: 0 }) + soldier(140, 124, 1.4, t, { k: 7, hair: "short", helmet: null, mood: "smile" }) + '<path d="M152 70 L160 30" stroke="#9a7a3a" stroke-width="4"/>' + soldier(240, 126, 1.4, t, { k: 8, mood: "smile", helmet: null, hair: "short", flip: true }); },
    function (t) { var s = R(-200, -200, 760, 600, "url(#canal)", { s: 0 }); [80, 160, 250].forEach(function (x, i) { var y = 70 + Math.sin(t * 2 + i) * 3; s += '<circle cx="' + x + '" cy="' + f(y) + '" r="12" fill="#c98f66" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (x - 10) + ' ' + f(y - 4) + ' Q' + x + ' ' + f(y - 16) + ' ' + (x + 10) + ' ' + f(y - 4) + '" fill="#1a1410"/><path d="M' + (x - 22) + ' ' + f(y + 8) + ' q22 8 44 0" stroke="#e6f6fc" stroke-width="2" fill="none"/>'; }); return s + water(t, 90, 40); },
    function (t) { var s = R(-200, -200, 760, 600, "url(#sand)", { s: 0 }) + '<path d="M40 30 L320 26" stroke="#2a2a2a" stroke-width="1.5"/>'; ["#b8a274", "#f0ece2", "#8a9a6a", CAMO].forEach(function (c, i) { s += P('M' + (60 + i * 60) + ' 28 l30 0 l2 ' + f(36 + Math.sin(t * 2 + i) * 3) + ' l-34 0 Z', c, { w: 1.2 }); }); return s + soldier(320, 120, 1.3, t, { k: 9, helmet: null, hair: "short", flip: true }); }); });
  // 11 — on purpose: the other bank had to see an ordinary day (seen through binoculars from a strongpoint)
  shot(11, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { var s = R(-200, -200, 760, 1040, "url(#sand)", { s: 0 }) + water(t, 200, 140) + R(-200, 340, 760, 400, "url(#sand)", { s: 0 }) + palm(70, 380, 1.4, t) + soldier(150, 420, 1.6, t, { k: 10, helmet: null, hair: "short", mood: "smile" }) + soldier(230, 430, 1.7, t, { k: 11, mood: "smile" });
    return s + '<path fill-rule="evenodd" d="M-200 -200 H560 V840 H-200 Z M180 320 m-150 0 a75 75 0 1 0 150 0 a75 75 0 1 0 150 0 a75 75 0 1 0 -150 0 a75 75 0 1 0 -150 0" fill="#000"/>' + label("يوم عادي", 180, 170, u, 1.0, 30, "#fff"); });
  // 12 — meanwhile in Tel Aviv, about 4 a.m., the prime minister is woken with news
  shot(12, push([180, 330], [200, 340], 1.0, 1.1), function (u, d, t) { var ring = (u % 1.2) < .6; return roomTA(t, 4, 2 + u * .3) + person(110, 430, 1.6, t, { top: "#34405a", pants: "#34405a", hair: "bun", hairCol: "#9a9a9a", skin: "#e0b48c", k: 2 }) + (ring ? '<path d="M240 350 q-6 -8 0 -16 M284 350 q6 -8 0 -16" stroke="#f2c230" stroke-width="2" fill="none"/>' : '') + label("4:00", 180, 100, u, .4, 34, "#f2c230"); });
  // 13 — war will break out today… at 6 in the evening
  shot(13, push([180, 330], [180, 320], 1.1, 1.0), function (u, d, t) { return roomTA(t, 4, 6) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .3 }) + portrait(180, 360, 2.0, t, { hair: "bun", hairCol: "#9a9a9a", top: "#34405a", skin: "#e0b48c", sad: true }) + P('M230 300 q30 10 26 50 l-10 0 q2 -30 -22 -40Z', "#1e1e1e", { w: 1.2 }) + label("18:00", 180, 150, u, .4, 40, "#f2c230") + label("الساعة ستة المغرب", 180, 186, u, .8, 18, "#fff"); });
  // 14 — six in the evening. remember that number.
  shot(14, push([180, 320], [180, 320], 1.3, 1.6), function (u, d, t) { return R(-200, -200, 760, 1040, "#3a4658", { s: 0 }) + wallClock(180, 320, 90, 6, 0) + label("6 المغرب", 180, 170, u, .2, 34, "#f2c230"); });
  // 15 — to understand the sand mountain we go back four years
  shot(15, push([180, 320], [180, 300], 1.0, 1.1), function (u, d, t) { var y = Math.round(lerp(1973, 1969, clamp(u / (d * .7)))); return canal(t, { sky: "skySmoke", cop: .5 }) + nearBank(t, 450) + R(-200, -200, 760, 1040, "#3a2a1a", { s: 0, op: .35 }) + bigNum(String(y), 180, 230, u, .1, 60, "#f2c230"); });
  // 16 — 1969: a division commander gathers his officers; one question: how do we open it?
  shot(16, push([180, 340], [180, 360], 1.0, 1.1), function (u, d, t) { return tentIn(t) + officer(60, 470, 1.9, t, { k: 1 }) + officer(300, 470, 1.9, t, { k: 2, flip: true }) + mapTable(180, 470, 1) + officer(120, 600, 2.4, t, { k: 3, back: true }) + officer(240, 610, 2.4, t, { k: 4, back: true }) + label("1969", 180, 160, u, .3, 40, "#f2c230") + label("نفتحه إزاي؟", 180, 196, u, .8, 20, "#fff"); });
  // 17 — bombs? the sand falls back. digging? a whole day under fire.
  shot(17, push([200, 320], [200, 320], 1.0, 1.08), function (u, d, t) { var half = u < d * .5, s = canal(t, { wy: 380, H: 130, sky: "skySmoke" }) + nearBank(t, 480); if (half) for (var i = 0; i < 4; i++) s += puff(120 + i * 60, 280, 30, t, i); else s += soldier(200, 560, 2.2, t, { k: 6 }) + '<path d="M230 520 L260 470" stroke="#6a4a2a" stroke-width="4"/>' + P('M252 466 l14 -6 l4 10 l-12 6Z', "#8a929c", { w: 1 }); return s + label(half ? "قنابل؟" : "حفر؟", 180, 170, u, .3, 36, "#fff") + label(half ? "الرملة بترجع مكانها" : "يوم كامل تحت النار", 180, 206, u, .6, 18, "#f2c230"); });
  // 18 — in the end a lieutenant-colonel engineer, Baqi Zaki Youssef, raised his hand
  shot(18, push([180, 360], [180, 340], 1.0, 1.15), function (u, d, t) { var up = clamp((u - .4) / .6); return tentIn(t) + mapTable(180, 520, 1.1) + officer(180, 470, 2.4, t, { k: 7, wave: up > .5, mood: "flat" }) + officer(50, 560, 2.2, t, { k: 8, back: true }) + officer(320, 560, 2.2, t, { k: 9, back: true }) + label("باقي زكي يوسف", 180, 160, u, 1.0, 30, "#f2c230") + label("مقدم مهندس", 180, 194, u, 1.4, 18, "#fff"); });
  // 19 — before that he worked at the High Dam, and there he saw something very simple
  shot(19, push([180, 300], [180, 320], 1.15, 1.0), function (u, d, t) { return damScene(t, 0) + label("السد العالي", 180, 170, u, .5, 34, "#fff"); });
  // 20 — they moved mountains of sand… with high-pressure water jets
  shot(20, push([220, 400], [240, 420], 1.1, 1.3), function (u, d, t) { return damScene(t, clamp(u / d)) + label("مية بضغط عالي", 180, 170, u, .6, 28, "#7ad0f0"); });
  // 21 — he said: the wall is sand, the canal is full of water. hit the sand with the water.
  shot(21, push([180, 340], [180, 330], 1.05, 1.0), function (u, d, t) { var k = clamp(u / d); return tri(t, u, d,
    function (t) { return tentIn(t) + portrait(180, 120, 1.0, t, { hair: "cap", cap: "#6a6a44", top: KHAKI, mustache: true, skin: "#c98f66" }); },
    function (t) { return canal(t, { wy: 70, H: 60, ww: 60 }) + label("رملة", 180, 40, u, .6, 22, "#f2c230"); },
    function (t) { return canal(t, { wy: 60, H: 50, ww: 70, br: [{ x: 230, p: .6 * k }] }) + pumpBoat(120, 90, .7, t) + jetArc(t, 160, 60, 228, 40, 18, k) + label("مية", 80, 30, u, 1.2, 22, "#7ad0f0"); }); });
  // 22 — the idea was so simple that many didn't believe it
  shot(22, push([180, 360], [180, 350], 1.05, 1.12), function (u, d, t) { return tentIn(t) + officer(80, 520, 2.3, t, { k: 10, mood: "sad" }) + officer(280, 520, 2.3, t, { k: 11, flip: true, mood: "flat" }) + officer(180, 470, 2.0, t, { k: 7, mood: "smile" }) + mapTable(180, 560, 1.1); });
  // 23 — tests on al-Ballah island: more than 300, on a sand wall built like the real one
  shot(23, push([200, 330], [210, 330], 1.0, 1.1), function (u, d, t) { var n = Math.round(lerp(1, 300, clamp(u / (d * .85)))), k = (u * .6) % 1; return canal(t, { wy: 380, H: 110, br: [{ x: 240, p: k }] }) + pumpBoat(110, 400, 1.0, t, { k: 2 }) + jetArc(t, 168, 336, 240, 300 + k * 40, 26, k) + nearBank(t, 480) + label("تجربة " + n, 180, 170, u, .1, 34, "#f2c230") + label("جزيرة البلاح", 180, 206, u, .4, 18, "#fff"); });
  // 24 — the army bought water pumps abroad, without anyone knowing where they were going
  shot(24, push([180, 360], [180, 340], 1.0, 1.1), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#4a4036", { s: 0 }) + R(-200, 440, 760, 400, "#6a5a44", { s: 0 }) + rays(t, 300, 0, 2.2, 5, 600, .4); for (var i = 0; i < 6; i++) s += R(20 + (i % 3) * 110, 330 + Math.floor(i / 3) * 90, 90, 70, "#8a6a44", { w: 1.6 }) + txt("?", 65 + (i % 3) * 110, 375 + Math.floor(i / 3) * 90, 28, "#3a2a1a", { font: "Noto Serif", wt: 700 }); return s + G('translate(180 300) scale(1.4)', pumpBoat(0, 0, 1, t, { k: 3 }).replace(/<g transform="translate\([^)]*\) scale\([^)]*\)">/, '<g>')) + label("مضخات", 180, 160, u, .5, 34, "#fff"); });
  // 25 — back to 6 October: 1:30 p.m., the jets take off
  shot(25, push([180, 330], [180, 300], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d), s = sky("skyNoon") + cloudBank(t, 120, 4, 5, "#fff", .8) + R(-200, 420, 760, 400, "url(#sand)", { s: 0 }) + P('M-200 470 L560 440 L560 470 L-200 520 Z', "#4a4844", { w: 1.4 });
    s += mig(lerp(-40, 420, k), lerp(460, 300, k * k), 1.2, t) + mig(lerp(-180, 280, k), lerp(480, 340, k * k), 1.0, t) + label("1:30", 180, 170, u, .3, 40, "#f2c230"); return s; });
  // 26 — exactly 2:00, more than 200 jets cross the canal at once
  shot(26, push([180, 320], [180, 310], 1.05, 1.0), function (u, d, t) { var k = clamp(u / d), s = canal(t, { wy: 470, H: 60, ww: 80 }) + nearBank(t, 550); for (var i = 0; i < 7; i++) s += migTop(lerp(-80, 440, k) - (i % 3) * 90 + Math.floor(i / 3) * 40, 150 + i * 42 + Math.sin(t + i) * 4, 1.0 - i * .04, t, { rot: 90 });
    return s + label("14:00", 180, 110, u, .2, 40, "#f2c230") + label("أكتر من 200 طيارة", 180, 146, u, .6, 18, "#fff"); });
  // 27 — five minutes later about 2,000 guns fire at once, for 53 minutes
  shot(27, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) { var s = canal(t, { wy: 330, H: 80, sky: "skySmoke", cop: .4 }); for (var i = 0; i < 9; i++) s += puff(-40 + i * 50, 240 + hash(i) * 20, 22, t, i); s += nearBank(t, 420); for (var g = 0; g < 4; g++) s += fieldGun(40 + g * 90, 520 + (g % 2) * 30, 1.2, t, { ph: g * .3 }); return s + label("2000 مدفع", 180, 160, u, .3, 34, "#f2c230") + label("53 دقيقة", 180, 196, u, .7, 20, "#fff"); });
  // 28 — the answer: at 2 the sun is behind the Egyptians… and in the eyes of those facing them
  shot(28, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { var s = sky("skyNoon") + '<circle cx="180" cy="220" r="40" fill="#fff6d0"/><circle cx="180" cy="220" r="160" fill="url(#warm)" opacity=".7"/>' + rays(t, 180, 220, 1.57, 12, 600, .6) + water(t, 330, 80) + nearBank(t, 400); for (var i = 0; i < 6; i++) s += soldier(30 + i * 60, 400, 1.2, t, { k: i, back: true });
    return s + R(-200, 460, 760, 400, "#c9a060", { s: 0 }) + R(110, 470, 140, 20, "#8a8a80", { w: 1.4 }) + R(130, 474, 100, 4, "#15171c", { s: 0 }) + label("الشمس في عينهم", 180, 140, u, .4, 26, "#ffd060"); });
  // 29 — Tel Aviv was waiting for 6 p.m.; the war began four hours early
  shot(29, push([180, 320], [180, 320], 1.4, 1.6), function (u, d, t) { return R(-200, -200, 760, 1040, "#3a4658", { s: 0 }) + wallClock(180, 320, 90, 14, Math.min(59, u * 4)) + label("قبل ميعادهم بـ4 ساعات", 180, 170, u, .4, 19, "#f2c230"); });
  // 30 — 2:20, the first rubber boats go into the water
  shot(30, push([180, 330], [190, 320], 1.0, 1.08), function (u, d, t) { var k = clamp(u / d), s = canal(t, { wy: 300, H: 80, ww: 160, sky: "skySmoke", cop: .5 }); for (var i = 0; i < 5; i++) s += inflatable(lerp(-60, 300, k * .6) + i * 40 - (i % 2) * 60, 340 + i * 22, .55 + i * .06, t, { k: i * 4, ladder: i % 2 === 0 }); return s + nearBank(t, 470) + label("14:20", 180, 160, u, .3, 40, "#f2c230"); });
  // 31 — imagine you're in that boat, fasting, holding your rifle and a wooden ladder…
  shot(31, push([180, 360], [180, 340], 1.0, 1.08), function (u, d, t) { var s = canal(t, { wy: 260, H: 90, ww: 400, sky: "skySmoke", cop: .5 }) + inflatable(80, 300, .5, t, { k: 3 }) + inflatable(300, 320, .6, t, { k: 8 }); s += P('M-200 640 L-200 470 Q180 430 560 470 L560 640 Z', "#2b2f33", { w: 2 }) + soldier(150, 640, 3.4, t, { k: 12, back: true }) + P('M200 470 L330 380 L340 390 L210 480 Z', "#9a7448", { w: 1.4 }) + '<path d="M230 456 l8 8 M260 434 l8 8 M290 414 l8 8 M318 394 l8 8" stroke="#6a4a2a" stroke-width="3"/>';
    return s + dust(t, 14, "#f6e6c4", .4); });
  // 32 — and ahead of you a mountain of sand taller than a seven-storey building
  shot(32, push([180, 340], [180, 260], 1.0, 1.2), function (u, d, t) { var s = canal(t, { wy: 470, H: 360, ww: 170, sky: "skySmoke", cop: .5, cy: 60 }) + inflatable(140, 520, .7, t, { k: 2 }); for (var i = 0; i < 7; i++) s += R(300, 460 - i * 50, 34, 46, "#f0ece2", { w: 1, op: .35 }); return s + label("7 أدوار", 300, 80, u, .8, 26, "#f2c230"); });
  // 33 — and you hear thousands around you say together: Allahu Akbar
  shot(33, push([180, 330], [180, 330], 1.1, 1.0), function (u, d, t) { var s = canal(t, { wy: 270, H: 110, ww: 400, sky: "skySmoke", cop: .5 }); for (var i = 0; i < 6; i++) s += inflatable(-20 + (i % 3) * 140 + (i > 2 ? 60 : 0), 330 + Math.floor(i / 3) * 110, .7 + Math.floor(i / 3) * .2, t, { k: i * 4 }); for (var j = 0; j < 4; j++) s += soldier(50 + j * 85, 640, 2.2, t, { k: 20 + j, back: true, wave: true }); return s + label("الله أكبر", 180, 160, u, 1.2, 46, "#fff"); });
  // 34 — they climb the wall on ladders; behind them the engineers lower the pumps into the water
  shot(34, push([180, 320], [190, 300], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d), wy = 420, H = 260, s = canal(t, { wy: wy, H: H, ww: 120, sky: "skySmoke", cop: .5, cy: 50 });
    [60, 230].forEach(function (lx, i) { s += P('M' + lx + ' ' + (wy + 4) + ' L' + (lx + 60) + ' ' + (wy - H + 10) + ' L' + (lx + 70) + ' ' + (wy - H + 12) + ' L' + (lx + 10) + ' ' + (wy + 6) + ' Z', "#9a7448", { w: 1.2 }); for (var r = 1; r < 10; r++) s += '<path d="M' + f(lx + 6 * r) + ' ' + f(wy - 26 * r) + ' l10 1" stroke="#6a4a2a" stroke-width="2.5"/>';
      for (var m = 0; m < 3; m++) { var kk = clamp(k * 1.3 - m * .3), py = lerp(wy, wy - H + 20, kk); s += soldier(lx + 5 + (wy - py) * .23, py + 2, .8, t, { k: i * 3 + m, back: true, wave: Math.sin(t * 4 + m) > 0 }); } });
    s += pumpBoat(lerp(-120, 150, ease(k)), wy + 60, .9, t, { k: 5 }) + inflatable(320, wy + 40, .7, t, { k: 9, n: 1 }); return s; });
  // 35 — the hoses turn on the sand… and the mountain starts to melt
  shot(35, push([200, 320], [210, 310], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d) * .35; return canal(t, { wy: 400, H: 200, ww: 120, sky: "skySmoke", cop: .5, br: [{ x: 260, p: k }] }) + pumpBoat(110, 430, 1.1, t, { k: 6 }) + jetArc(t, 175, 362, 258, 270 + k * 40, 40, k) + nearBank(t, 520); });
  // 36 — sand becomes mud, the mud slides into the canal, the gap widens minute by minute
  shot(36, push([220, 320], [240, 330], 1.05, 1.15), function (u, d, t) { var k = .35 + clamp(u / d) * .5; return canal(t, { wy: 400, H: 200, ww: 120, sky: "skySmoke", cop: .5, br: [{ x: 260, p: k }, { x: 60, p: k * .7 }] }) + pumpBoat(110, 430, 1.1, t, { k: 6 }) + jetArc(t, 175, 362, 258, 280 + k * 80, 40, k) + nearBank(t, 520) + label("رملة ← طين", 180, 160, u, .6, 30, "#d8b070"); });
  // 37 — in about four hours, more than sixty breaches were open
  shot(37, push([180, 300], [180, 320], 1.2, 1.0), function (u, d, t) { var k = ease(u / d); return canal(t, { wy: 300, H: 60, ww: 140, br: BR(10, .5 + .5 * k) }) + nearBank(t, 440) + label("أكتر من 60 ثغرة", 180, 160, u, .4, 30, "#f2c230") + label("في حوالي 4 ساعات", 180, 196, u, .8, 18, "#fff"); });
  // 38 — the mountain they said needed an atomic bomb… the canal's water opened it
  shot(38, push([180, 340], [180, 300], 1.0, 1.2), function (u, d, t) { var k = clamp(u / d); return canal(t, { wy: 400, H: 220, ww: 120, br: [{ x: 180, p: 1 }] }) + tank2(lerp(80, 300, k), 380, .9, t) + nearBank(t, 520) + label("مية القناة", 180, 160, u, 1.3, 34, "#7ad0f0"); });
  // 39 — at sunset many soldiers broke their fast on the other bank
  shot(39, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skySunset") + '<circle cx="80" cy="300" r="40" fill="#ffd890"/>' + cloudBank(t, 160, 3, 5, "#f6b070", .7) + R(-200, 330, 760, 400, "#c8985c", { s: 0 }); for (var i = 0; i < 6; i++) s += soldier(40 + i * 56, 470 + (i % 2) * 30, 1.8, t, { k: 30 + i, mood: "smile", wave: i === 2 }); return s + R(120, 520, 120, 10, "#7a5a3a", { w: 1.2 }) + '<circle cx="150" cy="516" r="5" fill="#5a2a1a"/><circle cx="170" cy="516" r="5" fill="#5a2a1a"/><rect x="200" y="502" width="10" height="16" fill="#cfe6f4" stroke="' + INK + '"/>' + rays(t, 80, 300, .3, 5, 500, .5) + label("الإفطار", 180, 170, u, .6, 34, "#f2c230") + label("على الضفة التانية", 180, 206, u, 1.0, 18, "#fff"); });
  // 40 — at night the bridges are laid and the tanks begin to cross
  shot(40, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { var k = clamp(u / d), s = canal(t, { sky: "skyNight", night: true, cloud: "#2a3048", cop: .6, wcol: "#0e1a30", wy: 300, H: 60, ww: 200, br: [{ x: 180, p: 1 }] }) + P('M120 520 L170 300 L190 300 L240 520 Z', "#4a4a3a", { w: 1.6 }); for (var i = 0; i < 9; i++) s += '<path d="M' + f(120 + i * 5.5) + ' ' + f(520 - i * 24) + ' H' + f(240 - i * 5.5) + '" stroke="#2a2a22" stroke-width="2"/>';
    for (var j = 0; j < 3; j++) { var kk = ((k * .6 + j / 3) % 1); s += tank2(180, lerp(500, 310, kk), lerp(1.0, .3, kk), t, { lights: true }); } return s + nearBank(t, 520, { night: true }); });
  // 41 — Baqi was there with his division, watching his idea happen before his eyes
  shot(41, push([180, 360], [180, 340], 1.05, 1.15), function (u, d, t) { return canal(t, { sky: "skyNight", night: true, cloud: "#2a3048", cop: .6, wcol: "#0e1a30", wy: 300, H: 60, ww: 200, br: [{ x: 180, p: 1 }] }) + tank2(lerp(150, 220, clamp(u / d)), 380, .5, t, { lights: true }) + R(-200, 480, 760, 400, "#2a2620", { s: 0 }) + officer(130, 640, 3.4, t, { k: 7, back: true }) + label("باقي زكي يوسف", 180, 160, u, .8, 30, "#f2c230"); });
  // 42 — an idea that came from an ordinary workday at the High Dam
  shot(42, push([200, 340], [220, 340], 1.1, 1.2), function (u, d, t) { return damScene(t, .6, { sky: "skySunset" }) + R(-200, -200, 760, 1040, "#3a2010", { s: 0, op: .2 }); });
  // 43 — two years after the war, the Suez Canal reopened to ships
  shot(43, push([180, 320], [190, 320], 1.0, 1.06), function (u, d, t) { var k = clamp(u / d), s = canal(t, { wy: 320, H: 40, ww: 140, sky: "skyToday" }); s += G('translate(' + f(lerp(-120, 300, k)) + ' 330)', P('M-90 0 L80 0 L100 -20 L-90 -20 Z', "#2f4a6a", { w: 1.6 }) + R(-70, -46, 40, 26, "#f0ece2", { w: 1.2 }) + R(-60, -62, 10, 16, "#2a2a2a", { w: 1 }) + R(-56, -80, 2, 18, "#2a2a2a", { s: 0 }) + R(-54, -80, 14, 8, "#c22a2a", { s: 0 }) + R(-54, -76, 14, 4, "#fff", { s: 0 }) + R(-54, -72, 14, 4, "#161616", { s: 0 }) + '<path d="M100 2 q20 4 40 0" stroke="#e6f6fc" stroke-width="2" fill="none"/>');
    return s + nearBank(t, 460) + palm(40, 480, 1.1, t) + label("1975", 180, 170, u, .4, 40, "#f2c230") + label("القناة اتفتحت من تاني", 180, 206, u, .8, 18, "#fff"); });
  // 44 — General Baqi kept telling the story until he died in 2018
  shot(44, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#2a2018", { s: 0 }) + '<circle cx="180" cy="320" r="220" fill="url(#warm)" opacity=".35"/>' + portrait(180, 380, 2.0, t, { hair: "cap", cap: "#6a6a44", top: KHAKI, mustache: true, skin: "#c98f66", rim: true }) + label("2018", 180, 170, u, 1.0, 40, "#f2c230") + dust(t, 16, "#ffd98a", .5); });
  // 45 — sometimes the solution is simple… it just needs someone to look at it differently
  shot(45, push([180, 320], [180, 300], 1.0, 1.1), function (u, d, t) { return canal(t, { sky: "skySunset", sun: [90, 260], cloud: "#f6b070", cop: .7, wy: 330, H: 70, br: BR(8, 1) }) + nearBank(t, 450) + officer(200, 600, 2.6, t, { k: 7, back: true }) + palm(40, 470, 1.2, t) + rays(t, 90, 260, .3, 6, 500, .5); });
  // 46 — tell us: which story next time?
  shot(46, push([180, 320], [180, 320], 1.0, 1.05), function (u, d, t) { return canal(t, { sky: "skySunset", sun: [180, 280], cloud: "#f6b070", cop: .7, wy: 340, H: 60 }) + nearBank(t, 460) + rays(t, 180, 280, 1.57, 8, 500, .5) + dust(t, 20, "#ffd98a", .5) + label("قولولنا!", 180, 170, u, .3, 34, "#fff"); });

  window.__parts = { person: person, portrait: portrait, soldier: soldier, officer: officer, inflatable: inflatable, pumpBoat: pumpBoat, mig: mig, migTop: migTop, canal: canal, rampart: rampart, jetArc: jetArc, fieldGun: fieldGun, tank2: tank2, wallClock: wallClock, palm: palm };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 6 && i <= 11) ? .9 : 0; };
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
