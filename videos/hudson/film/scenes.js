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
  // ── «معجزة هدسون» (US Airways 1549, 15 January 2009) in the «القصة 2D» look. The plane is drawn from the reference frames in
  //    ../refs (an A320 in the 2009 US Airways livery: white body, grey belly, "US AIRWAYS" in navy, red and blue cheat lines,
  //    a navy tail with white and red flag stripes, two CFM engines under the wings). Staging borrowed from the two videos the
  //    user sent: the red flight track on the map, the chase camera behind the plane down the river, the side view against the
  //    Manhattan skyline from the New Jersey bank, and the plane floating with people on the wings and the ferries coming.
  //    People: the shared person kit (PERSON.front / PERSON.side). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  function D(i) { return LN[i].end - LN[i].start; }
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  var CLIPN = 0, NAVY = "#1d2a5c", RED = "#c8322a", WHITE = "#f4f5f2", BELLY = "#b9c0c8", GREY = "#8a929c", YEL = "#f2c230", ORANGE = "#e0662f", GREEN = "#5affa0";
  PERSON.setInk(INK);

  // ── the plane, side view: nose to the right in local units (length ≈ 320), centre line y = 0 ──
  function a320(o) {
    var g = "", id = "fz" + (++CLIPN), t = o.t || 0;
    var body = "M-162 -9 L-104 -15 L116 -15 Q150 -14 157 1 Q152 14 120 15 L-86 15 Q-128 11 -162 -3 Z";
    // far wing and far engine (behind the body)
    g += P("M-8 4 L-54 -6 L-40 -6 L26 2 Z", "#9aa3ad", { w: 1.4 }) + P("M14 -2 h30 q8 0 8 5 v3 h-38 Z", "#aab2ba", { w: 1.2 });
    // tail fin with the flag stripes
    var fin = "M-102 -14 L-146 -76 L-126 -77 L-74 -14 Z";
    g += P(fin, NAVY, { w: 1.8 }) + '<clipPath id="' + id + 'f"><path d="' + fin + '"/></clipPath><g clip-path="url(#' + id + 'f)">';
    for (var k = 0; k < 5; k++) g += '<path d="M' + (-150 + k * 9) + ' -40 L' + (-96 + k * 9) + ' -20" stroke="' + (k % 2 ? RED : WHITE) + '" stroke-width="3.2"/>';
    g += '</g>' + P(fin, "none", { w: 1.8 });
    g += P(body, WHITE, { w: 2.2 });
    g += '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(-170, 5, 340, 14, BELLY, { s: 0 }) +
      '<path d="M-70 4.5 L150 4.5" stroke="' + RED + '" stroke-width="2"/><path d="M-70 7.5 L150 7.5" stroke="' + NAVY + '" stroke-width="2"/>' +
      R(-170, 9, 340, 10, "#000", { s: 0, op: .14 }) + '</g>';
    for (var x = -96; x < 104; x += 7.4) if (Math.abs(x - 96) > 6 && Math.abs(x + 92) > 4) g += '<rect x="' + f(x) + '" y="-7.5" width="3.4" height="4.6" rx="1.6" fill="#2a3442"/>';
    g += '<path d="M126 -9 L139 -9 L146 -3 L128 -3 Z M114 -9 L123 -9 L124 -3 L114 -3 Z" fill="#1d2430" stroke="' + INK + '" stroke-width="1"/>';
    g += R(98, -10, 9, 21, "none", { w: 1 }) + R(-98, -10, 8, 19, "none", { w: 1 });
    g += G((o.dir || 1) < 0 ? "translate(44 0) scale(-1 1)" : "", txt("US AIRWAYS", 22, -.5, 10.5, NAVY, { font: "Noto Serif", wt: 700, ls: .6 })) + '<rect x="-26" y="-8" width="9" height="6" fill="' + NAVY + '"/><path d="M-26 -6 h9 M-26 -4 h9" stroke="#fff" stroke-width=".8"/>';
    g += P("M-160 -6 L-128 -10 L-120 -6 L-152 -3 Z", "#c2c9d0", { w: 1.2 });   // stabiliser
    // near wing and engine
    g += P("M-6 10 L-60 30 L-44 31 L34 12 Z", "#c9d0d7", { w: 1.6 }) + '<path d="M-58 30 l-4 -6" stroke="' + INK + '" stroke-width="1.4"/>';
    var eng = "M2 14 h40 q12 0 12 8 v4 q0 8 -12 8 h-36 q-8 -2 -8 -10 Z";
    g += P(eng, "#dde2e7", { w: 1.8 }) + R(4, 26, 46, 7, "#000", { s: 0, op: .12 }) + '<ellipse cx="53" cy="24" rx="3.6" ry="9.6" fill="#2c323b" stroke="' + INK + '" stroke-width="1.4"/><path d="M2 20 h-8 v8 h8" fill="#7f8790" stroke="' + INK + '" stroke-width="1.2"/>';
    if (o.thrust) for (var i = 0; i < 4; i++) { var p = (t * 3 + i / 4) % 1; g += '<path d="M' + f(-8 - p * 50) + ' ' + f(24 + Math.sin(t * 9 + i) * 2) + ' h' + f(-12) + '" stroke="#fff" stroke-width="2" opacity="' + f2(.35 * (1 - p)) + '"/>'; }
    if (o.smoke) for (var j = 0; j < 9; j++) { var q = (t * .9 + j / 9) % 1; g += '<circle cx="' + f(-6 - q * 160) + '" cy="' + f(26 - q * 6 + Math.sin(j * 3) * 5) + '" r="' + f(4 + q * 16) + '" fill="#5a5a5e" opacity="' + f2(o.smoke * .5 * (1 - q)) + '"/>'; }
    if (o.fire) g += '<ellipse cx="-4" cy="24" rx="' + f(9 + 3 * Math.sin(t * 20)) + '" ry="4" fill="#ffb03a" opacity="' + f2(o.fire) + '"/><ellipse cx="-2" cy="24" rx="4" ry="2.4" fill="#fff4c0" opacity="' + f2(o.fire) + '"/>';
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f2((o.s || 1) * (o.dir || 1)) + " " + f2(o.s || 1) + ")", g);
  }
  // the plane from behind (the chase camera of the reference animation): bank = degrees
  function a320rear(x, y, s, t, o) {
    o = o || {}; var g = "";
    g += P("M-8 4 L-150 -4 L-150 -10 L-148 -12 L-10 -4 Z", "#c9d0d7", { w: 1.6 }) + P("M8 4 L150 -4 L150 -10 L148 -12 L10 -4 Z", "#c9d0d7", { w: 1.6 });
    g += P("M-150 -10 l-2 -9 l4 0 Z M150 -10 l2 -9 l-4 0 Z", NAVY, { w: 1 });
    [-1, 1].forEach(function (sd) { g += Ci(sd * 50, 10, 10, "#dde2e7", { w: 1.6 }) + Ci(sd * 50, 10, 5.4, "#2c323b", { w: 1 }) + (o.thrust ? Ci(sd * 50, 10, 3, "#ffb878", { s: 0, op: .5 + .3 * Math.sin(t * 20) }) : "") + R(sd * 50 - 2, -2, 4, 4, "#9aa3ad", { w: .8 }); });
    g += P("M-44 -8 L-4 -10 L-4 -4 L-44 -4 Z M44 -8 L4 -10 L4 -4 L44 -4 Z", "#c2c9d0", { w: 1.2 });
    g += '<ellipse cx="0" cy="0" rx="17" ry="17" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="2"/><path d="M-16 5 A17 17 0 0 0 16 5 Z" fill="' + BELLY + '"/><path d="M-15 6 Q0 12 15 6" stroke="' + RED + '" stroke-width="1.4" fill="none"/>';
    g += P("M-4 -14 L-3 -64 L3 -64 L4 -14 Z", NAVY, { w: 1.6 }) + '<path d="M-2 -60 v40 M2 -60 v40" stroke="' + RED + '" stroke-width="1"/>';
    if (o.smoke) for (var j = 0; j < 6; j++) { var q = (t * .8 + j / 6) % 1; [-50, 50].forEach(function (ex) { g += '<circle cx="' + f(ex * (1 + q * .3)) + '" cy="' + f(12 + q * 30) + '" r="' + f(3 + q * 12) + '" fill="#6a6a70" opacity="' + f2(o.smoke * .5 * (1 - q)) + '"/>'; }); }
    return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(o.bank || 0) + ") scale(" + f2(s) + ")", g);
  }

  // ── New York: sky, sun, the Manhattan skyline seen from the New Jersey bank, the Hudson with ice ──
  function winter(t, o) { o = o || {}; return sky(o.gold ? "skyGold" : "skyWinter") + '<circle cx="' + (o.sx || 300) + '" cy="' + (o.sy || 110) + '" r="70" fill="url(#warm)" opacity=".7"/>' + Ci(o.sx || 300, o.sy || 110, 15, "#fff6d8", { s: 0 }) + cloudBank(t, 70, 3, 4, "#ffffff", .35, .8) + rays(t, o.sx || 300, o.sy || 110, 2.3, 4, 560, .12); }
  var SKY = (function () { var b = [], x = -330; while (x < 330) { var w = 11 + hash(x * .37) * 18, mid = Math.exp(-Math.pow((x + 20) / 150, 2)), h = 22 + hash(x * .91 + 3) * 46 + mid * 95; b.push([x, w, h, Math.floor(hash(x * 1.7) * 5), Math.floor(hash(x * 2.3) * 4)]); x += w - 2 + hash(x) * 4; } return b; })();
  var TONES = ["#dccfb6", "#c6b79c", "#b9c2c9", "#a99f8c", "#d2d6d8"];
  function tower(x, w, h, tone, top, sh) {
    var g = "", hb = h;
    if (top === 1) { g += R(x + w * .2, -h - 12, w * .6, 14, tone, { w: 1 }); }   // a setback
    if (top === 2) g += '<path d="M' + f(x + w / 2) + ' ' + f(-h) + ' v-' + f(10 + w * .6) + '" stroke="' + INK + '" stroke-width="1.2"/>';   // an antenna
    if (top === 3) g += P("M" + f(x) + " " + f(-h) + " L" + f(x + w / 2) + " " + f(-h - w * .5) + " L" + f(x + w) + " " + f(-h) + " Z", tone, { w: 1 });   // a pyramid roof
    g += R(x, -h, w, h, tone, { w: 1.1 }) + R(x + w * .62, -h, w * .38, h, sh, { s: 0, op: .5 });
    for (var yy = -h + 5; yy < -3; yy += 5) for (var xx = x + 2.5; xx < x + w - 2; xx += 3.4) if (hash(xx * 3 + yy) > .45) g += '<rect x="' + f(xx) + '" y="' + f(yy) + '" width="1.6" height="2.2" fill="#4a5262" opacity=".45"/>';
    return g;
  }
  function skyline(y, s, o) {
    o = o || {}; var g = "", sh = o.shade || "#6a7486";
    SKY.forEach(function (b, i) { if (i % 2) g += tower(b[0] + 4, b[1] * .9, b[2] * 1.25 + 8, "#aeb8c4", b[4], "#8a96a6"); });
    g += R(-340, -260, 680, 262, "#dfe6ee", { s: 0, op: .35 });
    SKY.forEach(function (b, i) { g += tower(b[0], b[1], b[2], o.lit && i % 3 === 0 ? o.lit : TONES[b[3]], b[4], sh); });
    // the Empire State Building and the Chrysler Building, from their real outlines
    g += P("M-34 0 V-150 H-28 V-168 H-22 V-180 H-17 V-196 H-14 V-212 L-12.5 -232 L-11 -212 V-196 H-8 V-180 H-3 V-168 H3 V-150 H9 V0 Z", "#d8ccb2", { w: 1.2 }) + R(-12.5, -196, 11, 196, sh, { s: 0, op: .45 });
    g += P("M40 0 V-150 H44 V-168 Q50 -186 56 -168 H60 V-150 H64 V0 Z", "#cfc6b6", { w: 1.2 }) + '<path d="M45 -166 L52 -194 L59 -166 M47 -170 Q52 -180 57 -170 M48 -175 Q52 -183 56 -175" stroke="' + INK + '" stroke-width=".9" fill="#e6e1d6"/>';
    g += R(-340, -14, 680, 14, "#5a5e64", { w: 1 });   // the piers and the West Side Highway at the waterline
    return G("translate(" + f(o.x || 180) + " " + f(y) + ") scale(" + f2(s) + ")", g + (o.haze ? R(-340, -270, 680, 272, "#dfe6ee", { s: 0, op: o.haze }) : ""));
  }
  function river(t, y, o) {
    o = o || {}; var g = R(-400, y, 1160, 900, o.gold ? "url(#hudsonG)" : "url(#hudsonW)", { s: 0 }) + '<path d="M-400 ' + y + ' H760" stroke="#2c3440" stroke-width="2.4"/>';
    g += glints(t, y, 40, o.gold ? "#f6d8b0" : "#e4eef6");
    for (var i = 0; i < (o.ice == null ? 14 : o.ice); i++) { var x = ((hash(i * 4) * 900 + t * (3 + hash(i) * 4)) % 900) - 250, yy = y + 14 + hash(i * 7) * 260, w = 8 + hash(i + 2) * 22 * (1 + (yy - y) / 160); g += '<ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * .18) + '" fill="#eef3f6" stroke="' + INK + '" stroke-width=".8" opacity=".85"/>'; }
    return g;
  }
  function glints(t, wy, n, col) { var s = ""; for (var i = 0; i < (n || 44); i++) { var x = ((hash(i) * 800 + t * (14 + hash(i + 7) * 22)) % 800) - 220; s += '<path d="M' + f(x) + ' ' + f(wy + 8 + hash(i + 2) * 230) + ' h' + f(14 + hash(i + 5) * 26) + '" stroke="' + (col || "#a8c0e6") + '" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function njBank(y) { var g = P("M-400 " + y + " L760 " + (y - 10) + " L760 900 L-400 900 Z", "#e9ecef", { w: 1.6 }); for (var i = 0; i < 16; i++) g += R(-380 + i * 70, y - 2 - i * .6, 46, 6, "#9aa3ad", { w: 1 }); return g + R(-400, y + 30, 1160, 800, "#c7ccd2", { s: 0, op: .6 }); }
  // the far shore seen from the river, running down the frame as two banks (for the chase camera)
  function corridor(t, k, o) {
    o = o || {}; var g = winter(t, { sx: 250, sy: 120 }), hz = 260;
    g += skyline(hz, .55, { x: 70, lit: "#cbbfa8", haze: .25 }) + G("translate(240 0)", skyline(hz + 2, .32, { x: 40, lit: "#b8c0c8", haze: .4 }));
    g += P("M-400 " + hz + " L760 " + hz + " L760 900 L-400 900 Z", "url(#hudsonW)", { s: 0 });
    g += P("M-400 " + (hz + 2) + " L150 " + hz + " L-60 640 L-400 640 Z", "#9a9a90", { w: 1.4 }) + P("M210 " + hz + " L760 " + (hz + 4) + " L760 640 L420 640 Z", "#a7a596", { w: 1.4 });
    for (var i = 0; i < 26; i++) { var p = (k * 3 + t * .25 + i / 26) % 1, yy = hz + p * p * 400; g += '<path d="M' + f(150 - p * p * 210 - 10) + ' ' + f(yy) + ' h' + f(-20 - 80 * p) + '" stroke="#5a5a56" stroke-width="' + f(1 + p * 3) + '" opacity=".6"/><path d="M' + f(210 + p * p * 210 + 10) + ' ' + f(yy) + ' h' + f(20 + 80 * p) + '" stroke="#5a5a56" stroke-width="' + f(1 + p * 3) + '" opacity=".6"/>'; }
    for (var j = 0; j < 30; j++) { var q = (t * .3 + j / 30) % 1, yy2 = hz + 6 + q * q * 380; g += '<path d="M' + f(180 + (hash(j) - .5) * 60 * (1 + q * 4)) + ' ' + f(yy2) + ' h' + f(8 + q * 30) + '" stroke="#e4eef6" stroke-width="1.2" opacity="' + f2(.5 * q) + '"/>'; }
    return g;
  }

  // ── geese (Canada geese, side view: brown back, pale breast, black neck and head, white chin strap) ──
  function goose(x, y, s, t, ph, dir) {
    var fl = Math.sin(t * 9 + ph), g = "";
    g += P("M-14 0 Q-4 -7 10 -3 Q16 0 10 4 Q-2 8 -14 3 Z", "#8a7660", { w: 1.2 }) + P("M-6 3 Q2 6 9 3", "none", { w: 0 }) + P("M-10 2 Q0 6 8 3 Q0 4 -10 2 Z", "#e6ddcc", { s: 0 });
    g += P("M9 -2 Q20 -6 26 -9 L27 -6 Q20 -3 11 2 Z", "#1a1a1c", { w: 1 }) + P("M25 -10 Q30 -12 32 -9 L36 -8 L31 -6 Q27 -5 25 -7 Z", "#1a1a1c", { w: 1 }) + '<path d="M26 -8.5 Q28 -6 30 -7" stroke="#fff" stroke-width="1.6" fill="none"/>';
    g += P("M-14 1 L-20 -1 L-18 3 Z", "#2a2a2c", { w: .8 });
    g += G("rotate(" + f(fl * 50) + " -2 -3)", P("M-4 -3 Q-10 -18 -26 -26 Q-16 -10 -10 -2 Z", "#6f5d4a", { w: 1.1 }));
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s * (dir || 1)) + " " + f2(s) + ")", g);
  }
  function flock(t, cx, cy, sc, n, dir, spread) { var g = ""; for (var i = 0; i < n; i++) { var row = Math.floor((i + 1) / 2), sd = i % 2 ? 1 : -1; g += goose(cx - row * 26 * sc * (dir || 1) + Math.sin(t + i) * 3, cy + sd * row * 14 * sc * (spread || 1) + Math.cos(t * 1.3 + i) * 2, sc, t, i * 1.7, dir); } return g; }

  // ── an engine seen from the front, under the wing (after the v03 engine close-up): spin = fan speed ──
  function engineFront(x, y, r, t, o) {
    o = o || {}; var g = P("M" + (-r * 3) + " " + f(-r * 1.25) + " L" + (r * 3) + " " + f(-r * 1.55) + " L" + (r * 3) + " " + f(-r * 1.05) + " L" + (-r * 3) + " " + f(-r * .8) + " Z", "#b9c1c9", { w: 2 }) + R(-r * .25, -r * 1.05, r * .5, r * .4, "#9aa3ad", { w: 1.4 });
    g += Ci(0, 0, r, "#e6eaee", { w: 2.4 }) + Ci(0, 0, r * .86, "#3a414a", { w: 1.6 });
    var a = o.ang || 0;
    for (var i = 0; i < 18; i++) { var aa = a + i / 18 * 6.283, bent = o.broken && i % 4 === 0 ? .5 : 0; g += '<path d="M' + f(Math.cos(aa) * r * .2) + ' ' + f(Math.sin(aa) * r * .2) + ' Q' + f(Math.cos(aa + .25 + bent) * r * .55) + ' ' + f(Math.sin(aa + .25 + bent) * r * .55) + ' ' + f(Math.cos(aa + .1 + bent * 1.6) * r * .84) + ' ' + f(Math.sin(aa + .1 + bent * 1.6) * r * .84) + '" stroke="#c9d0d7" stroke-width="' + f(r * .09) + '" stroke-linecap="round"/>'; }
    if (o.blur) g += Ci(0, 0, r * .84, "#9aa3ad", { s: 0, op: o.blur * .7 });
    g += Ci(0, 0, r * .2, "#e8ecef", { w: 1.6 }) + '<path d="M' + f(-r * .08) + ' ' + f(-r * .08) + ' l' + f(r * .12) + ' ' + f(r * .12) + '" stroke="' + INK + '" stroke-width="1.4" transform="rotate(' + f(a * 57.3) + ')"/>';
    g += '<path d="M' + f(-r * .7) + ' ' + f(-r * .55) + ' A' + f(r * .9) + ' ' + f(r * .9) + ' 0 0 1 ' + f(r * .3) + ' ' + f(-r * .85) + '" stroke="#fff" stroke-width="' + f(r * .05) + '" fill="none" opacity=".5"/>';
    if (o.smoke) for (var j = 0; j < 8; j++) { var q = (t * .7 + j / 8) % 1; g += Ci(Math.sin(j * 2.1) * r * .4, -q * r * 2.6, r * (.2 + q * .6), "#4a4a50", { s: 0, op: o.smoke * .55 * (1 - q) }); }
    return G("translate(" + f(x) + " " + f(y) + ")", g);
  }

  // ── the cockpit, seen from the instrument panel: Sully in the left seat (on the viewer's right), Jeff on the right ──
  var SULLY = { outfit: { base: "pilot", hat: null }, colors: { hair: "#e8e6df", hairL: "#ffffff", skin: "#e3ad90" }, headset: true };
  var JEFF = { outfit: { base: "pilot", hat: null }, colors: { hair: "#6a5848", hairL: "#8a7664", skin: "#dfa688" }, headset: true };
  function pil(base, o) { var p = Object.assign({}, base, o); p.colors = Object.assign({}, base.colors); p.face = Object.assign({}, o.face || {}); if (base === SULLY) p.face.mustache = "#efece6"; return PERSON.front(p).svg; }
  function blink(t, e, seed) { return ((t + (seed || 0)) * 1000) % 3900 < 130 ? .05 : e; }
  function cockpit(t, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#22272f", { s: 0 });
    // side windows with the sky and the city beyond, the window posts
    [[-70, 1], [430, -1]].forEach(function (w) { var x = w[0]; g += P("M" + x + " 150 L" + (x + w[1] * 110) + " 120 L" + (x + w[1] * 110) + " 330 L" + x + " 360 Z", "url(#skyWinter)", { w: 2 }) + G("translate(" + (x + w[1] * 55) + " " + (330 + (o.drop || 0) * 60) + ") scale(.35)", skyline(0, 1, { x: 0 })) + '<path d="M' + x + ' 150 L' + (x + w[1] * 110) + ' 120" stroke="#fff" stroke-width="3" opacity=".25"/>'; });
    g += P("M40 60 L320 60 L360 150 L0 150 Z", "#3a414c", { w: 2 });   // overhead panel
    for (var i = 0; i < 26; i++) { var bx = 30 + (i % 13) * 23, by = 80 + Math.floor(i / 13) * 30; g += R(bx, by, 12, 9, "#1b1f26", { w: .8 }) + R(bx + 2, by + 2, 8, 2.4, (o.apu && i === 9) ? "#7fd6ff" : (i * 7 % 5 === 0 ? "#f2b04a" : "#4a5260"), { s: 0, op: (o.apu && i === 9) ? .95 : .7 }); }
    g += R(150, 150, 60, 230, "#2c323b", { w: 1.6 }) + R(158, 170, 44, 6, "#1b1f26", { s: 0 });   // the cockpit door behind
    // seats
    [[105, "#3e4a5e"], [255, "#3e4a5e"]].forEach(function (s) { g += P("M" + (s[0] - 62) + " 520 L" + (s[0] - 56) + " 230 Q" + s[0] + " 200 " + (s[0] + 56) + " 230 L" + (s[0] + 62) + " 520 Z", s[1], { w: 2 }) + P("M" + (s[0] - 30) + " 236 Q" + s[0] + " 222 " + (s[0] + 30) + " 236 L" + (s[0] + 28) + " 268 L" + (s[0] - 28) + " 268 Z", "#526079", { w: 1.4 }); });
    var br = (Math.sin(t * 1.6) + 1) / 2, sf = o.sully || {}, jf = o.jeff || {};
    g += pil(JEFF, { x: 105, y: 468, s: 1.05, legs: "sit", breath: br, head: Object.assign({ tilt: 2 * Math.sin(t * .8), turn: .25 }, jf.head || {}), face: Object.assign({ eyes: blink(t, 1, .7), mouth: "neutral", brows: "neutral", look: [.3, 0] }, jf.face || {}), arms: jf.arms || [{ to: [70, 452], hand: "relaxed", bend: 1 }, { to: [140, 452], hand: "relaxed", bend: -1 }] });
    g += pil(SULLY, { x: 255, y: 468, s: 1.05, legs: "sit", breath: br, head: Object.assign({ tilt: 1.5 * Math.sin(t * .7 + 1), turn: -.2 }, sf.head || {}), face: Object.assign({ eyes: blink(t, 1), mouth: "neutral", brows: "neutral", look: [-.2, 0] }, sf.face || {}), arms: sf.arms || [{ to: [222, 452], hand: "relaxed", bend: 1 }, { to: [310, 430], hand: "fist", bend: -1 }] });
    if (sf.stick !== false) g += P("M306 470 L312 428 Q318 418 326 424 L320 470 Z", "#1b1f26", { w: 1.6 });
    if (o.book) g += G("translate(" + f(105) + " " + f(410) + ") rotate(-6)", R(-34, -22, 68, 44, "#f4ecdb", { w: 1.6 }) + '<path d="M0 -22 V22" stroke="' + INK + '" stroke-width="1.2"/>' + (function () { var s = ""; for (var k = 0; k < 6; k++) s += '<path d="M-28 ' + (-14 + k * 6) + ' h22 M6 ' + (-14 + k * 6) + ' h22" stroke="#8a8a90" stroke-width="1.2"/>'; return s; })() + G("rotate(0)", P("M0 -22 Q" + f(-30 * Math.cos(t * 4)) + " -26 " + f(-34 * Math.cos(t * 4)) + " -20 L" + f(-34 * Math.cos(t * 4)) + " 24 Q" + f(-30 * Math.cos(t * 4)) + " 18 0 22 Z", "#fbf6ea", { w: 1.2 })) + txt("ENG DUAL FAILURE", 0, -27, 7, "#c8322a", { font: "Noto Serif", wt: 700 }));
    // the glareshield and the screens in the foreground
    g += P("M-220 430 Q180 400 580 430 L580 900 L-220 900 Z", "#161a20", { w: 2 });
    [40, 110, 250, 320].forEach(function (sx, k) { g += R(sx - 28, 440, 56, 44, "#0b1622", { w: 1.4 }) + R(sx - 22, 446, 44, 32, k === 1 || k === 2 ? "#123a5a" : "#0f2a20", { s: 0 }) + '<path d="M' + (sx - 18) + ' ' + (466 - 6 * Math.sin(t + k)) + ' h36" stroke="' + (o.warn && k === 1 ? "#ff6a4a" : "#7fd6ff") + '" stroke-width="1.4" opacity=".8"/>'; });
    if (o.warn) [70, 290].forEach(function (wx) { var on = Math.sin(t * 10) > 0; g += R(wx - 14, 410, 28, 14, on ? "#ff3a2a" : "#5a1a14", { w: 1.2 }) + (on ? '<circle cx="' + wx + '" cy="417" r="26" fill="#ff3a2a" opacity=".25" filter="url(#glow)"/>' : ""); });
    return g;
  }
  // the overhead panel close up: the APU master switch (on the viewer's right column) and a finger pressing it
  function apuPanel(t, k, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#2d333c", { s: 0 }) + R(20, 90, 320, 360, "#3a414c", { w: 2.4 });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { var bx = 52 + c * 76, by = 120 + r * 82, isA = r === 1 && c === 2;
      g += R(bx - 4, by - 4, 52, 48, "#2a3038", { w: 1.2 }) + R(bx, by, 44, 40, "#1b1f26", { w: 1.6 }) + R(bx + 6, by + 6, 32, 11, isA && k > .5 ? "#7fd6ff" : "#2e3540", { w: .8 }) + R(bx + 6, by + 22, 32, 11, "#2e3540", { w: .8 });
      if (isA && k > .5) g += txt("ON", bx + 22, by + 15.5, 9, "#0b1622", { font: "Noto Serif", wt: 700 }) + '<rect x="' + (bx - 20) + '" y="' + (by - 20) + '" width="84" height="80" fill="#7fd6ff" opacity="' + f2(.18 + .08 * Math.sin(t * 4)) + '" filter="url(#soft)"/>';
      if (isA) g += txt("APU", bx + 22, by - 12, 11, "#e8ecef", { font: "Noto Serif", wt: 700 }) + txt("MASTER SW", bx + 22, by + 54, 7.5, "#c9d0d7", { font: "Noto Serif", wt: 700 });
      else g += '<path d="M' + (bx + 8) + ' ' + (by - 10) + ' h28" stroke="#c9d0d7" stroke-width="1.4" opacity=".6"/>'; }
    if (o.ring) for (var q = 0; q < 3; q++) { var p = (t * .8 + q / 3) % 1; g += Ci(228, 222, 30 + p * 70, "none", { w: 2, op: 1 - p }).replace('stroke="' + INK + '"', 'stroke="#7fd6ff"'); }
    if (o.hand !== false) { var press = k < .5 ? lerp(70, 0, ease(k / .5)) : lerp(0, 50, ease((k - .5) / .5)); g += G("translate(" + f(196 + press * .3) + " " + f(150 + press) + ")", PERSON.hand([40, 150], -Math.PI / 2 - .25, "point", 1, 1.25, { skin: "#e3ad90", skinD: "#c07f62", skinL: "#efc3a8", shirt: "#f4f2ec", shirtD: "#d6d2c6" }) + P("M18 150 L22 300 L80 300 L62 150 Z", "#f4f2ec", { w: 2 })); }
    return g;
  }
  // the approach-control room: a dark room, a radar scope with the blip, the controller with a headset
  var PAT = { outfit: { base: "office", tie: false }, colors: { hair: "#3a2a20", hairL: "#5a463a", skin: "#e0a98a", shirt: "#b9cde0", shirtD: "#8ea8c0" }, headset: true };
  function tracon(t, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#0c1014", { s: 0 }) + '<circle cx="180" cy="300" r="260" fill="#2a6a4a" opacity=".12" filter="url(#soft)"/>';
    for (var i = 0; i < 5; i++) g += R(-60 + i * 110, 140, 80, 60, "#0f1a14", { w: 1.2 }) + R(-54 + i * 110, 146, 68, 48, "#123020", { s: 0, op: .7 });
    var br = (Math.sin(t * 1.4) + 1) / 2, pf = o.pat || {};
    g += PERSON.front(Object.assign({}, PAT, { x: 180, y: 520, s: 1.15, legs: "sit", breath: br, colors: Object.assign({}, PAT.colors), head: Object.assign({ tilt: 2 * Math.sin(t * .7), nod: .15 }, pf.head || {}), face: Object.assign({ eyes: blink(t, 1, 1.3), mouth: "neutral", brows: "worried", look: [0, .6] }, pf.face || {}), arms: pf.arms || [{ to: [140, 486], hand: "relaxed", bend: 1 }, { to: [220, 486], hand: "relaxed", bend: -1 }] })).svg;
    // the scope in front of him, lighting him green
    g += R(-220, 470, 800, 500, "#14191e", { w: 2 }) + G("translate(180 560)", '<ellipse rx="120" ry="44" fill="url(#scope)" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M0 0 L' + f(Math.cos(t * 2) * 118) + ' ' + f(Math.sin(t * 2) * 42) + '" stroke="' + GREEN + '" stroke-width="1.6" opacity=".7"/>' + '<ellipse rx="80" ry="29" fill="none" stroke="' + GREEN + '" stroke-width=".8" opacity=".4"/><ellipse rx="40" ry="15" fill="none" stroke="' + GREEN + '" stroke-width=".8" opacity=".4"/>' + (o.lost ? "" : Ci(-30, -12, 3.4, GREEN, { s: 0, op: .6 + .4 * Math.sin(t * 6) }) + txt("1549", -30, -18, 10, GREEN, { font: "Noto Serif", wt: 700 })));
    g += R(-220, 0, 800, 640, "url(#glowGreen)", { s: 0 });
    return g;
  }

  // ── the cabin, seen from the front galley down the aisle: three rows of passengers facing us ──
  var PAX = [["#7a3a34", "#5a2a26", "#2f2620"], ["#3f5a7a", "#2f4560", "#a8743c"], ["#5a6a4a", "#44523a", "#1f1a16"], ["#9a8a6a", "#7a6a50", "#7a5a3a"], ["#4a4a58", "#36364a", "#c9a46a"], ["#8a4a6a", "#6a3450", "#3a2a20"]];
  var SKN = ["#e0a98a", "#c98f6a", "#efc3a8", "#a8724c", "#dba07e", "#f0c8b0"];
  function pax(i, x, y, s, t, mode, k) {
    var c = PAX[i % 6], br = (Math.sin(t * 1.5 + i) + 1) / 2, o = { x: x, y: y, s: s, legs: "sit", breath: br, outfit: { base: "casual" }, colors: { shirt: c[0], shirtD: c[1], hair: c[2], skin: SKN[i % 6] } };
    var hy = y - 166 * s;
    if (mode === "brace") { var kk = ease(k); o.head = { nod: kk, tilt: 0 }; o.slump = .4 * kk; o.face = { eyes: .1, brows: "worried", mouth: "frown" }; o.arms = [{ to: [x - 14 * s, lerp(y - 40 * s, hy - 10 * s, kk)], hand: "flat", bend: 1, rot: 20 }, { to: [x + 14 * s, lerp(y - 40 * s, hy - 10 * s, kk)], hand: "flat", bend: -1, rot: 160 }]; }
    else if (mode === "shock") { o.head = { tilt: 3 * Math.sin(t + i), turn: (hash(i) - .5) * .6 }; o.face = { eyes: 1.25, brows: "worried", mouth: i % 2 ? "o" : "open", look: [(hash(i * 3) - .5), -.3] }; o.arms = [{ to: [x - 44 * s, y - 20 * s], hand: "fist", bend: 1 }, { to: [x + 44 * s, y - 20 * s], hand: "fist", bend: -1 }]; }
    else { o.head = { tilt: 2 * Math.sin(t * .8 + i), turn: (hash(i) - .5) * .8 }; o.face = { eyes: blink(t, mode === "worried" ? 1.1 : 1, i), brows: mode === "worried" ? "worried" : "neutral", mouth: mode === "worried" ? "frown" : "neutral", look: [(hash(i * 3) - .5) * 1.6, 0] }; o.arms = [{ to: [x - 42 * s, y - 4 * s], hand: "relaxed", bend: 1 }, { to: [x + 42 * s, y - 4 * s], hand: "relaxed", bend: -1 }]; }
    var seat = P("M" + f(x - 58 * s) + " " + f(y + 30 * s) + " L" + f(x - 52 * s) + " " + f(hy - 44 * s) + " Q" + f(x) + " " + f(hy - 64 * s) + " " + f(x + 52 * s) + " " + f(hy - 44 * s) + " L" + f(x + 58 * s) + " " + f(y + 30 * s) + " Z", "#2f4a7a", { w: 1.6 }) + P("M" + f(x - 40 * s) + " " + f(hy - 50 * s) + " Q" + f(x) + " " + f(hy - 60 * s) + " " + f(x + 40 * s) + " " + f(hy - 50 * s) + " L" + f(x + 40 * s) + " " + f(hy - 30 * s) + " L" + f(x - 40 * s) + " " + f(hy - 30 * s) + " Z", "#e8e4d8", { w: 1 });
    return seat + PERSON.front(o).svg;
  }
  function cabin(t, mode, k, o) {
    o = o || {}; var g = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 });
    g += P("M-220 -100 L130 230 L230 230 L580 -100 Z", "#ece8de", { w: 1.6 }) + P("M-220 900 L130 330 L230 330 L580 900 Z", "#5a5f6a", { w: 1.6 }) + R(130, 230, 100, 100, "#c9c3b4", { w: 1.6 });
    for (var i = 0; i < 5; i++) { var p = i / 5, xl = lerp(-30, 120, p), xr = lerp(390, 240, p), y = lerp(150, 250, p), h = lerp(60, 20, p), w = lerp(34, 10, p), ty = (o.tilt || 0);
      [xl, xr - w].forEach(function (wx) { g += '<rect x="' + f(wx) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(w * .4) + '" fill="url(#skyWinter)" stroke="' + INK + '" stroke-width="1.4"/>' + (o.roofs ? '<rect x="' + f(wx) + '" y="' + f(y + h * lerp(.9, .3, o.roofs)) + '" width="' + f(w) + '" height="' + f(h * lerp(.1, .7, o.roofs)) + '" fill="#8a7e6e" opacity=".9"/>' : ""); }); }
    var rows = [[.55, 270, [125, 155, 205, 235]], [.8, 340, [70, 118, 242, 290]], [1.05, 450, [-10, 60, 300, 370]]];
    var n = 0; rows.forEach(function (r, ri) { r[2].forEach(function (x, j) { g += pax(n++, x, r[1], r[0], t, mode, clamp(k * 1.4 - (2 - ri) * .12 - j * .04)); }); });
    return g;
  }
  // a window seat close up: a passenger turned to the window, the rooftops coming up in it
  function windowSeat(t, k) {
    var g = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 });
    var wx = 60, wy = 140, ww = 150, wh = 200;
    g += '<clipPath id="win1"><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60"/></clipPath><g clip-path="url(#win1)">' + sky("skyWinter");
    var by = lerp(wy + wh + 40, wy + 40, k);
    for (var i = 0; i < 14; i++) { var bx = wx - 40 + i * 18 + ((t * 30) % 18), bh = 30 + hash(i) * 120; g += R(bx, by - bh * .3 + (hash(i * 3) * 30), 16, 400, i % 2 ? "#9a8a76" : "#b8a88e", { w: 1 }) + R(bx + 2, by - bh * .3 + hash(i * 3) * 30 + 4, 12, 6, "#6a6052", { s: 0, op: .5 }); }
    g += '</g><rect x="' + (wx - 14) + '" y="' + (wy - 14) + '" width="' + (ww + 28) + '" height="' + (wh + 28) + '" rx="72" fill="none" stroke="#ece8de" stroke-width="22"/><rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="60" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
    g += PERSON.front({ x: 260, y: 600, s: 1.7, legs: "sit", breath: (Math.sin(t * 2.4) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: "#3f5a7a", shirtD: "#2f4560", hair: "#a8743c", skin: "#efc3a8" }, head: { turn: -.8, tilt: -6 }, face: { eyes: 1.2, brows: "worried", mouth: "o", look: [-1, .3] }, arms: [{ to: [180, 470], hand: "fist", bend: 1 }, { to: [330, 560], hand: "relaxed", bend: -1 }] }).svg;
    return g;
  }

  // ── the George Washington Bridge, side view (two steel lattice towers, the main cable, the deck) ──
  function gwb(x, y, s) {
    var g = "";
    [-160, 160].forEach(function (tx) { g += R(tx - 12, -190, 24, 200, "#9aa6ae", { w: 1.6 }); for (var k = 0; k < 9; k++) g += '<path d="M' + (tx - 12) + ' ' + (-190 + k * 22) + ' L' + (tx + 12) + ' ' + (-168 + k * 22) + ' M' + (tx + 12) + ' ' + (-190 + k * 22) + ' L' + (tx - 12) + ' ' + (-168 + k * 22) + '" stroke="#5a666e" stroke-width="1.2"/>'; });
    g += '<path d="M-420 -40 Q-300 -160 -160 -186 Q0 -40 160 -186 Q300 -160 420 -40" stroke="' + INK + '" stroke-width="4" fill="none"/><path d="M-420 -40 Q-300 -160 -160 -186 Q0 -40 160 -186 Q300 -160 420 -40" stroke="#9aa6ae" stroke-width="2" fill="none"/>';
    for (var h = -150; h <= 150; h += 15) { var cy = -40 - 146 * Math.pow(Math.abs(h) / 160, 2); g += '<path d="M' + h + ' ' + f(cy) + ' V-8" stroke="#5a666e" stroke-width=".9"/>'; }
    g += R(-420, -10, 840, 12, "#7a868e", { w: 1.8 });
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g);
  }
  // ── a New York Waterway ferry (white, blue band, two decks of windows), bow to the left ──
  function ferry(x, y, s, t, dir) {
    var g = P("M-80 0 L-70 -18 L84 -18 L90 0 Q70 10 -70 8 Z", "#f4f5f2", { w: 1.8 }) + R(-74, -8, 160, 6, "#2f4a8a", { s: 0 }) + P("M-56 -18 L-50 -40 L66 -40 L70 -18 Z", "#f4f5f2", { w: 1.6 }) + P("M-30 -40 L-26 -52 L30 -52 L34 -40 Z", "#f4f5f2", { w: 1.4 });
    for (var i = 0; i < 12; i++) g += R(-48 + i * 9.6, -34, 6, 8, "#2a3442", { s: 0 });
    for (var j = 0; j < 5; j++) g += R(-22 + j * 10, -49, 6, 6, "#2a3442", { s: 0 });
    g += '<path d="M-82 4 q-10 -2 -20 2 M90 4 q14 -2 24 2" stroke="#fff" stroke-width="2" opacity="' + f2(.5 + .3 * Math.sin(t * 3)) + '" fill="none"/>';
    return G("translate(" + f(x) + " " + f(y + Math.sin(t * 1.4 + x) * 1.2) + ") scale(" + f2(s * (dir || 1)) + " " + f2(s) + ")", g);
  }
  // the plane floating, side view from the river, with people on both wings and on the slide rafts at the front doors
  function floating(t, x, y, s, o) {
    o = o || {}; var g = "", pl = a320({ x: x, y: y, s: s, rot: -1.5, t: t, dir: -1 });
    g += pl;
    var np = o.people == null ? 1 : o.people, ps = .06 * s;
    for (var i = 0; i < 16; i++) { if (i / 16 > np) break; var px = x + (i < 8 ? -18 + i * 7 : 30 + (i - 8) * 7) * s, fy = y + 14 * s, c = PAX[i % 6];
      g += PERSON.front({ x: px, y: fy - 208 * ps, s: ps, legs: "stand", breath: (Math.sin(t * 7 + i) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: c[0], shirtD: c[1], hair: c[2], skin: SKN[i % 6] }, head: { tilt: 4 * Math.sin(t * 5 + i) }, face: { eyes: 1, brows: "worried", mouth: "frown" }, arms: [{ rel: [16, 40], hand: "fist", bend: 1 }, { rel: [-16, 40], hand: "fist", bend: -1 }] }).svg; }
    g += R(-400, y + 6 * s, 1160, 600, "url(#hudsonW)", { s: 0, op: .9 }) + '<path d="M-400 ' + f(y + 6 * s) + ' H760" stroke="#e4eef6" stroke-width="1.6" opacity=".7"/>';
    [-104, 98].forEach(function (dx, k) { var rx = x - dx * s; g += P("M" + f(rx - 22 * s) + " " + f(y + 6 * s) + " Q" + f(rx) + " " + f(y + 12 * s) + " " + f(rx + 22 * s) + " " + f(y + 6 * s) + " L" + f(rx + 20 * s) + " " + f(y + 1 * s) + " L" + f(rx - 20 * s) + " " + f(y + 1 * s) + " Z", "#f2c230", { w: 1.4 }); });
    return g;
  }

  // ── the map: New York from above, north up (schematic, after the real geography: the Hudson, Manhattan, the East
  //    River, LaGuardia on the north shore of Queens, Teterboro in New Jersey, the George Washington Bridge) ──
  var LGA = [300, 262], TEB = [56, 96], GWB = [136, 84], HUD = [137, 380], STRIKE = [312, 168];
  var TRACK = [[300, 262], [322, 222], [312, 168], [276, 128], [222, 104], [170, 92], [140, 104], [138, 180], [137, 270], [137, 380]];
  function trackD(pts, k) { var n = (pts.length - 1) * clamp(k), i = Math.floor(n), fr = n - i, d = "M" + pts[0][0] + " " + pts[0][1]; for (var j = 1; j <= i; j++) d += " L" + pts[j][0] + " " + pts[j][1]; if (i < pts.length - 1) d += " L" + f(lerp(pts[i][0], pts[i + 1][0], fr)) + " " + f(lerp(pts[i][1], pts[i + 1][1], fr)); return { d: d, p: i < pts.length - 1 ? [lerp(pts[i][0], pts[i + 1][0], fr), lerp(pts[i][1], pts[i + 1][1], fr)] : pts[pts.length - 1] }; }
  function nycMap(t, o) {
    o = o || {}; var g = R(-300, -300, 960, 1300, "#6f9cc0", { s: 0 });
    for (var i = 0; i < 14; i++) g += '<path d="M' + f(-60 + ((i * 97 + t * 5) % 480)) + ' ' + (40 + i * 40) + ' q6 -4 12 0 t12 0" stroke="#9ec0dc" stroke-width="1.2" fill="none" opacity=".6"/>';
    var LAND = "#e2d8c0";
    g += P("M-300 -300 L118 -300 L120 40 L122 160 L126 300 L130 420 L138 560 L150 700 L-300 900 Z", LAND, { w: 1.8 });   // New Jersey
    g += P("M152 20 L200 10 L206 150 L212 300 L214 420 L202 560 L178 612 L170 560 L160 420 L152 300 L150 150 Z", "#d9cbb0", { w: 1.8 });   // Manhattan
    g += P("M160 -300 L700 -300 L700 196 L420 188 L330 200 L282 236 L250 300 L236 420 L232 600 L700 640 L700 900 L224 900 L218 420 L214 300 L208 150 L204 0 L160 -40 Z", LAND, { w: 1.8 });   // the Bronx, Queens
    g += P("M240 300 L262 246 L300 232 L340 238 L346 268 L300 290 Z", "#cfc4aa", { w: 1.4 }) + '<path d="M266 280 L330 240 M282 250 L318 286" stroke="#5a5a62" stroke-width="5" stroke-linecap="round"/><path d="M266 280 L330 240 M282 250 L318 286" stroke="#f4ecdb" stroke-width="1" stroke-dasharray="3 3"/>';
    g += '<path d="M44 86 L70 106 M50 106 L66 84" stroke="#5a5a62" stroke-width="4" stroke-linecap="round"/>';
    g += '<path d="M116 ' + GWB[1] + ' L156 ' + (GWB[1] - 2) + '" stroke="' + INK + '" stroke-width="4"/><path d="M116 ' + GWB[1] + ' L156 ' + (GWB[1] - 2) + '" stroke="#c9d0d7" stroke-width="2"/>';
    for (var b = 0; b < 40; b++) { var bx = 160 + hash(b) * 40, by = 30 + hash(b * 3) * 540; if (bx < 150 + (by / 600) * 30 || bx > 205) continue; g += R(bx, by, 4, 4, "#b8a88e", { s: 0, op: .8 }); }
    if (o.labels !== false) g += txt("نيو جيرسي", 60, 300, 15, "#5a4a32", { op: .9 }) + txt("مانهاتن", 182, 470, 13, "#5a4a32", { op: .9 }) + G("translate(132 250) rotate(-88)", txt("نهر هدسون", 0, 0, 12, "#123a5a", { op: .9 })) + txt("لاجوارديا", LGA[0] + 20, LGA[1] + 44, 14, "#121419");
    return g;
  }
  function trackLine(pts, k, col, t, o) { o = o || {}; var tr = trackD(pts, k); return '<path d="' + tr.d + '" stroke="' + INK + '" stroke-width="' + ((o.w || 4) + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/><path d="' + tr.d + '" stroke="' + col + '" stroke-width="' + (o.w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>' + (o.dot === false ? "" : Ci(tr.p[0], tr.p[1], 5 + Math.sin(t * 6), "#fff", { w: 1.6 })); }
  function pin(p, name, dx, dy, k, col) { k = clamp(k); return Ci(p[0], p[1], 5, col || YEL, { w: 1.6 }) + (k > 0 ? txt(name, p[0] + dx, p[1] + dy, 14, "#fff", { op: k, st: "rgba(0,0,0,.75)", sw: 4, wt: 900 }) : ""); }
  function xmark(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 -14 L' + f(-14 + 28 * clamp(k * 2)) + ' ' + f(-14 + 28 * clamp(k * 2)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' + (k > .5 ? '<path d="M14 -14 L' + f(14 - 28 * clamp(k * 2 - 1)) + ' ' + f(-14 + 28 * clamp(k * 2 - 1)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' : '')); }
  function check(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 0 L-4 10 L16 -12" stroke="#4ac06a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="' + f(50 * (1 - k)) + '"/>'); }
  // a city seen from straight above: blocks of rooftops in the Manhattan grid, the plane's shadow crossing them
  function rooftops(t, k) {
    var g = R(-300, -300, 960, 1300, "#6a6660", { s: 0 }), off = (t * 40) % 60;
    for (var r = -8; r < 16; r++) for (var c = -6; c < 12; c++) { var x = c * 50 - 40, y = r * 60 + off - 60; g += R(x, y, 44, 52, ["#b8a88e", "#a8987e", "#c9b9a0", "#9a8c78"][(r * 7 + c * 3 + 400) % 4], { w: 1.2 }) + R(x + 6, y + 6, 14, 10, "#8a7e6e", { s: 0, op: .6 }) + R(x + 26, y + 30, 10, 12, "#e8e2d4", { s: 0, op: .5 }); }
    g += G("translate(180 300) rotate(-90) scale(" + f2(.9 + k * .4) + ")", '<g opacity=".35">' + P("M-150 -6 L150 -6 L150 6 L-150 6 Z M-10 0 L-60 -150 L-40 -150 L30 0 L-40 150 L-60 150 Z M-150 0 L-140 -50 L-128 -50 L-128 50 L-140 50 Z", "#000", { s: 0 }) + '</g>');
    return g;
  }
  // a museum hangar: the plane on stands under spotlights
  function museum(t) {
    var g = R(-220, -220, 800, 1300, "#1a1c22", { s: 0 }) + P("M-220 120 Q180 20 580 120 L580 -220 L-220 -220 Z", "#24272e", { w: 2 });
    for (var i = 0; i < 9; i++) g += '<path d="M' + (-140 + i * 70) + ' ' + (140 - Math.sin(i / 8 * 3.14) * 90) + ' L' + (-140 + i * 70) + ' 460" stroke="#2e323a" stroke-width="5"/>';
    g += R(-220, 420, 800, 400, "#3a3c42", { w: 2 }) + '<ellipse cx="180" cy="430" rx="200" ry="22" fill="#000" opacity=".4"/>';
    g += rays(t, 90, 20, 1.2, 3, 520, .14) + rays(t, 280, 20, 1.95, 3, 520, .14);
    g += a320({ x: 180, y: 330, s: .95, t: t, rot: -1 }) + R(110, 345, 6, 80, "#5a5f6a", { w: 1.2 }) + R(240, 345, 6, 80, "#5a5f6a", { w: 1.2 });
    [40, 300, 330].forEach(function (vx, i) { g += PERSON.front({ x: vx, y: 470, s: .36, legs: "stand", breath: (Math.sin(t * 2 + i) + 1) / 2, outfit: { base: "casual" }, colors: { shirt: PAX[i + 2][0], shirtD: PAX[i + 2][1], hair: PAX[i + 2][2], skin: SKN[i] }, head: { turn: i ? -.6 : .6, tilt: -8 }, face: { eyes: 1, mouth: "neutral", look: [i ? -1 : 1, -.6] } }).svg; });
    return g;
  }
  function rec(t, y, src) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".8"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt("تسجيل حقيقي · " + (src || "برج المراقبة"), 288, y + 4, 13, "#fff", { a: "start" }) + b; }
  function screenFix(s) { return G("", s); }   // screen-space overlays drawn inside a shot are kept still by the shot's inverse camera (see drawShot)
  function alt(t, ft, x, y) { return '<rect x="' + (x - 70) + '" y="' + (y - 28) + '" width="140" height="44" rx="8" fill="#0b0f18" opacity=".75"/>' + txt(Math.round(ft).toLocaleString("en-US"), x + 10, y + 4, 24, "#ffd45a", { font: "Noto Serif", wt: 700 }) + txt("قدم", x - 48, y + 2, 13, "#fff"); }

  // ── the shots: one per line, the camera always creeping ──
  var WY = 400;
  // 0 · the real recording: the plane gliding down to the river in front of Manhattan, engines silent
  shot(0, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) { var k = clamp(u / 6); return winter(t) + skyline(WY, .85, { x: 170, haze: .1 }) + river(t, WY) + a320({ x: lerp(380, 120, k), y: lerp(250, 340, k), s: .62, rot: 4, t: t, dir: -1 }) + njBank(560) + rec(t, 112); });
  // 1 · it is real: the chase camera behind the plane, down the river
  shot(1, push([180, 330], [180, 320], 1.1, 1.2), function (u, d, t) { return corridor(t, u / d) + a320rear(180, lerp(300, 330, u / d), .9, t, { bank: 3 * Math.sin(t * .8) }) + rec(t, 112) + label("رحلة 1549", 180, 470 - 40, u, .6, 20, YEL); });
  // 2 · date and place
  shot(2, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) { return winter(t) + skyline(WY, .85, { x: 180, haze: .1 }) + river(t, WY) + njBank(570) + label("15 يناير 2009", 180, 170, u, .3, 32, "#fff") + label("نيويورك · 3 العصر", 180, 210, u, .8, 20, YEL); });
  // 3 · the cold: ice on the river, breath in the air
  shot(3, push([180, 360], [180, 340], 1.3, 1.15), function (u, d, t) { var s = winter(t, { sy: 90 }) + skyline(300, .6, { x: 180, haze: .25 }) + river(t, 300, { ice: 30 }); for (var i = 0; i < 6; i++) { var p = (t * .3 + i / 6) % 1; s += Ci(60 + i * 50 + Math.sin(t + i) * 10, 280 - p * 80, 8 + p * 18, "#fff", { s: 0, op: .18 * (1 - p) }); } return s + bigNum("-7°", 180, 190, u, .5, 64, "#fff") + label("تحت الصفر", 180, 228, u, 1, 20, "#bfe2ff"); });
  // 4 · 155 people
  shot(4, push([180, 320], [170, 320], 1.0, 1.1), function (u, d, t) { return winter(t) + cloudBank(t, 380, 6, 5, "#ffffff", .6, 1.2) + a320({ x: lerp(130, 230, u / d), y: 300, s: .95, t: t, thrust: 1 }) + bigNum("155", 180, 170, u, .3, 60) + label("إنسان", 180, 205, u, .7, 22, "#fff"); });
  // 5 · about 200 seconds: the stopwatch
  shot(5, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#1a2230", { s: 0 }) + '<circle cx="180" cy="270" r="200" fill="url(#warm)" opacity=".18"/>' + dust(t, 30, "#cfe4ff", .4, 2) + watch(180, 270, 80, t, { h: 3.5 + u / 600, sec: u * 6 * 10 }) + bigNum("200", 150, 420, u, .6, 46, YEL) + label("ثانية", 230, 416, u, .9, 22, "#fff"); });
  // 6 · how? the geese in front of the engine
  shot(6, push([180, 300], [180, 310], 1.2, 1.35), function (u, d, t) { return winter(t, { sx: 80, sy: 80 }) + flock(t, lerp(120, 200, u / d), 200, 1.6, 7, 1, 1.2) + engineFront(180, 380, 70, t, { ang: t * 14, blur: .6 }) + label("طيور؟", 180, 140, u, D(6) * .4, 30, YEL); });
  // 7 · why not back to the airport? the map, the track ending in the river
  shot(7, push([220, 250], [200, 260], 1.15, 1.05), function (u, d, t) { return nycMap(t) + trackLine(TRACK, .3 + .7 * clamp(u / d), RED, t) + pin(LGA, "", 0, 0, 0, YEL) + txt("؟", 180, 170, 70, "#fff", { st: "rgba(0,0,0,.7)", sw: 5, op: clamp((u - D(7) * .5) / .4) }); });
  // 8 · second by second: LaGuardia from the apron, Manhattan far off
  shot(8, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { var s = winter(t) + skyline(330, .35, { x: 120, haze: .4 }) + R(-220, 330, 800, 400, "#8f9690", { w: 1.6 }) + R(-220, 360, 800, 40, "#4a4e54", { w: 1.2 }) + '<path d="M-220 380 H580" stroke="#f4ecdb" stroke-width="2" stroke-dasharray="14 10"/>'; s += R(260, 230, 18, 100, "#c9c3b4", { w: 1.6 }) + P("M250 230 L288 230 L292 208 L246 208 Z", "#2a3442", { w: 1.6 }); return s + a320({ x: lerp(90, 120, u / d), y: 358, s: .62, t: t, thrust: 1 }) + label("نبدأ من المطار", 180, 180, u, .5, 24, "#fff"); });
  // 9 · LaGuardia, flight 1549 to Charlotte
  shot(9, push([180, 330], [200, 320], 1.0, 1.08), function (u, d, t) { var s = winter(t) + skyline(330, .35, { x: 120, haze: .4 }) + R(-220, 330, 800, 400, "#8f9690", { w: 1.6 }) + R(-220, 360, 800, 40, "#4a4e54", { w: 1.2 }) + '<path d="M-220 380 H580" stroke="#f4ecdb" stroke-width="2" stroke-dasharray="14 10"/>'; return s + a320({ x: lerp(120, 260, ease(u / d)), y: 358, s: .62, t: t, thrust: 1 }) + label("لاجوارديا", 180, 170, u, .3, 30, "#fff") + label("رحلة 1549 ← شارلوت", 180, 208, u, 1.2, 18, YEL); });
  // 10 · Sully
  shot(10, push([255, 300], [255, 290], 1.9, 2.1), function (u, d, t) { return cockpit(t, { sully: { face: { mouth: "smile", eyes: blink(t, .9) } } }) + G("", label("سولي · 57 سنة", 255, 190, u, D(10) * .35, 13, YEL)); });
  // 11 · Jeff, flying the takeoff
  shot(11, push([110, 300], [120, 300], 1.9, 2.0), function (u, d, t) { return cockpit(t, { jeff: { head: { turn: .1 }, face: { look: [0, 0] }, arms: [{ to: [56, 430], hand: "fist", bend: 1 }, { to: [140, 452], hand: "relaxed", bend: -1 }] } }) + P("M44 470 L50 428 Q56 418 64 424 L58 470 Z", "#1b1f26", { w: 1.6 }) + label("جيف سكايلز", 110, 190, u, .5, 13, YEL); });
  // 12 · 3:25, the takeoff
  shot(12, push([180, 320], [190, 300], 1.0, 1.1), function (u, d, t) { var k = ease(u / d); return winter(t) + skyline(420, .4, { x: 120, haze: .4 }) + R(-220, 420, 800, 400, "#8f9690", { w: 1.6 }) + R(-220, 440, 800, 30, "#4a4e54", { w: 1.2 }) + a320({ x: lerp(60, 300, k), y: lerp(445, 260, k * k), s: .6, rot: -lerp(0, 12, clamp(k * 3)), t: t, thrust: 1 }) + label("3:25", 180, 150, u, .3, 44, "#fff"); });
  // 13 · a clear sky, the river shining below
  shot(13, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { return corridor(t, u / d * 1.5) + a320rear(180, 300, .8, t, { bank: -4 + 2 * Math.sin(t), thrust: 1 }); });
  // 14 · the geese, through the windscreen
  shot(14, push([180, 300], [180, 300], 1.0, 1.15), function (u, d, t) { var k = clamp((u - .5) / (d - .5)), s = winter(t, { sx: 260, sy: 120 }) + cloudBank(t, 420, 8, 4, "#fff", .5, 1); s += flock(t, 200 + 20 * k, lerp(250, 290, k), lerp(.6, 3.2, k * k), 9, -1, 1.1); s += P("M-220 -220 L580 -220 L580 60 Q180 20 -220 60 Z M-220 420 Q180 460 580 420 L580 900 L-220 900 Z", "#1b1f26", { w: 2 }) + '<path d="M180 40 L180 440" stroke="#1b1f26" stroke-width="22"/>'; return s + label("وز كندي", 180, 120, u, .6, 24, "#fff") + label("~4 كيلو للواحدة", 180, 150, u, 1.2, 15, YEL); });
  // 15 · the strike: the birds into the fan, the flash, the fan winding down
  shot(15, push([180, 320], [180, 320], 1.25, 1.1), function (u, d, t) { var hit = 1.0, sp = u < hit ? 14 : 14 * Math.exp(-(u - hit) * .9), ang = u < hit ? t * 14 : hit * 14 + (1 - Math.exp(-(u - hit) * .9)) / .9 * 14, s = winter(t, { sx: 80, sy: 80 }); if (u < hit) s += flock(t, lerp(330, 190, u / hit), lerp(220, 330, u / hit), lerp(.8, 1.6, u / hit), 5, -1, 1.2); s += engineFront(180, 340, 90, t, { ang: ang, blur: clamp(sp / 14) * .6, broken: u > hit, smoke: u > hit ? 1 : 0 }); if (u > hit && u < hit + .6) s += Ci(180, 340, 60 + (u - hit) * 300, "#fff8e0", { s: 0, op: 1 - (u - hit) / .6 }) + Ci(180, 340, 50, "#ffb03a", { s: 0, op: .8 * (1 - (u - hit) / .6) }); for (var i = 0; i < 12 && u > hit; i++) { var p = clamp((u - hit) / 1.5); s += Ci(180 + Math.cos(i) * p * 160, 340 + Math.sin(i * 1.7) * p * 140, 3, "#6f5d4a", { s: 0, op: 1 - p }); } return s + label("المحركين سكتوا", 180, 150, u, D(15) * .7, 26, "#fff"); });
  // 16 · "my aircraft"
  shot(16, push([255, 300], [255, 296], 1.9, 2.1), function (u, d, t) { return cockpit(t, { warn: 1, sully: { head: { turn: -.05 }, face: { brows: "neutral", look: [0, -.2] } }, jeff: { face: { brows: "worried", eyes: 1.2, look: [1, 0] }, head: { turn: .6 } } }) + label("«الطيارة معايا»", 255, 190, u, .5, 15, "#fff"); });
  // 17 · the little button: the APU
  shot(17, push([228, 250], [228, 230], 1.3, 1.6), function (u, d, t) { return apuPanel(t, clamp((u - D(17) * .3) / 1.6)) + label("APU · مولّد كهربا احتياطي", 228, 112, u, D(17) * .5, 15, YEL); });
  // 18 · remember this button
  shot(18, push([228, 230], [228, 224], 1.7, 1.9), function (u, d, t) { return apuPanel(t, 1, { hand: false, ring: 1 }) + label("افتكروا الزرار ده", 228, 160, u, .2, 16, YEL); });
  // 19 · he called the tower
  shot(19, push([255, 300], [255, 292], 1.8, 2.0), function (u, d, t) { return cockpit(t, { warn: 1, sully: { face: { mouth: Math.sin(t * 9) > 0 ? "open" : "neutral" }, arms: [{ to: [282, 300], hand: "point", bend: 1 }, { to: [310, 430], hand: "fist", bend: -1 }] } }); });
  // 20 · the real recording: "hit birds, we've lost thrust in both engines"
  shot(20, push([180, 330], [180, 320], 1.0, 1.1), function (u, d, t) { return winter(t) + skyline(WY + 60, .6, { x: 170, haze: .25 }) + river(t, WY + 60) + a320({ x: lerp(250, 150, u / d), y: lerp(260, 290, u / d), s: .75, rot: 3, t: t, smoke: .6 }) + rec(t, 112); });
  // 21 · Patrick, the controller
  shot(21, push([180, 320], [180, 300], 1.0, 1.15), function (u, d, t) { return tracon(t) + label("باتريك هارتن", 180, 150, u, .4, 20, "#fff") + label("المراقب", 180, 176, u, .9, 15, YEL); });
  // 22 · but the plane is coming down fast
  shot(22, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = u / d; return winter(t) + skyline(WY + 40, .7, { x: 150, haze: .2 }) + river(t, WY + 40) + a320({ x: lerp(280, 170, k), y: lerp(210, 300, k), s: .7, rot: 5, t: t, smoke: .2 }) + G("", alt(t, lerp(3000, 1650, k), 180, 140)); });
  // 23 · a small airport in New Jersey: Teterboro on the map
  shot(23, push([170, 220], [150, 200], 1.1, 1.25), function (u, d, t) { return nycMap(t) + trackLine(TRACK.slice(0, 6), 1, RED, t, { dot: false }) + trackLine([[222, 104], [140, 96], TEB], clamp((u - .4) / 1.4), "#fff", t, { dash: "8 6", w: 3 }) + pin(TEB, "تيتربورو", 0, -14, (u - .8) / .5) + pin(LGA, "لاجوارديا", 0, 30, 1); });
  // 24 · "we can't do it"
  shot(24, push([255, 300], [255, 300], 2.1, 2.25), function (u, d, t) { return cockpit(t, { warn: 1, sully: { head: { turn: -.1, tilt: -2 }, face: { brows: "angry", mouth: u > .5 && u < 1.6 && Math.sin(t * 10) > 0 ? "open" : "frown" } } }) + label("«مش هنقدر»", 255, 196, u, .6, 15, "#fff"); });
  // 25 · Jeff with the engine-restart checklist, page after page
  shot(25, push([110, 330], [110, 320], 1.8, 2.0), function (u, d, t) { return cockpit(t, { warn: 1, book: 1, jeff: { head: { nod: .5, turn: .1 }, face: { look: [0, 1], brows: "worried" }, arms: [{ to: [78, 418], hand: "relaxed", bend: 1 }, { to: [132, 418], hand: "relaxed", bend: -1 }] } }); });
  // 26 · below them, a city with no open ground
  shot(26, push([180, 320], [180, 320], 1.0, 1.15), function (u, d, t) { return rooftops(t, u / d) + label("ملايين", 180, 150, u, D(26) * .45, 34, "#fff"); });
  // 27 · only one wide flat thing: the river (the chase camera turns down the Hudson)
  shot(27, push([180, 330], [180, 320], 1.15, 1.0), function (u, d, t) { return corridor(t, u / d) + a320rear(180, 320, .9, t, { bank: lerp(-22, -3, ease(u / d)), smoke: .3 }) + label("النهر", 180, 160, u, D(27) * .5, 40, YEL); });
  // 28 · imagine: the window seat, the rooftops coming up
  shot(28, push([180, 320], [170, 330], 1.0, 1.08), function (u, d, t) { return windowSeat(t, clamp(u / d)); });
  // 29 · and at that moment… the captain picked up the microphone (the cliffhanger frame)
  shot(29, push([255, 300], [255, 290], 1.9, 2.2), function (u, d, t) { return cockpit(t, { warn: 1, sully: { head: { turn: -.15 }, face: { look: [0, 0] }, arms: [{ to: [232, 330], hand: "fist", bend: 1 }, { to: [310, 430], hand: "fist", bend: -1 }] } }) + P("M226 300 L238 300 L242 340 L222 340 Z", "#1b1f26", { w: 1.4 }); });
  // 30 · the bio line: the same frame, still creeping, and the pill
  shot(30, push([255, 290], [255, 286], 2.2, 2.35), function (u, d, t) { return cockpit(t, { warn: 1, sully: { head: { turn: -.15 }, face: { look: [0, 0] }, arms: [{ to: [232, 330], hand: "fist", bend: 1 }, { to: [310, 430], hand: "fist", bend: -1 }] } }) + P("M226 300 L238 300 L242 340 L222 340 Z", "#1b1f26", { w: 1.4 }); }, { pill: 1 });
  // 31 · back to the plane: the cabin
  shot(31, push([180, 320], [180, 320], 1.0, 1.05), function (u, d, t) { return cabin(t, "worried", 0); });
  // 32 · "this is the captain, brace for impact"
  shot(32, push([180, 300], [180, 310], 1.05, 1.15), function (u, d, t) { return cabin(t, "shock", 0) + label("«استعدوا للاصطدام»", 180, 130, u, .5, 22, "#fff"); });
  // 33 · "heads down!"
  shot(33, push([180, 310], [180, 330], 1.1, 1.05), function (u, d, t) { return cabin(t, "brace", clamp(u / 1.4)) + label("«وطّي راسك!»", 180, 130, u, .3, 24, YEL) + label("«وطّي راسك!»", 180, 162, u, 1.4, 18, "#fff"); });
  // 34 · over the George Washington Bridge, under 900 feet
  shot(34, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var k = u / d; return winter(t) + river(t, 420) + gwb(lerp(200, 160, k), 420, .8) + a320({ x: lerp(400, -40, k), y: lerp(230, 260, k), s: .5, rot: 3, t: t, dir: -1, smoke: .15 }) + label("أقل من 300 متر", 180, 150, u, D(34) * .5, 22, YEL); });
  // 35 · nose up, gently, wings level
  shot(35, push([180, 330], [180, 340], 1.2, 1.35), function (u, d, t) { var k = u / d; return winter(t, { sx: 60, sy: 90 }) + skyline(360, .55, { x: 170, haze: .25 }) + river(t, 360) + a320({ x: 180, y: lerp(300, 336, k), s: 1.0, rot: -lerp(1, 9, ease(k)), t: t, dir: -1 }) + (function () { var s = ""; for (var i = 0; i < 20; i++) { var p = (t * 2 + i / 20) % 1; s += '<path d="M' + f(180 + 160 - p * 340) + ' ' + f(362 + hash(i) * 30) + ' h-30" stroke="#fff" stroke-width="1.4" opacity="' + f2(.4 * (1 - p)) + '"/>'; } return s; })(); });
  // 36 · …and touched the water
  shot(36, push([180, 340], [180, 330], 1.35, 1.2), function (u, d, t) { var k = clamp(u / .7), s = winter(t, { sx: 60, sy: 90 }) + skyline(360, .55, { x: 170, haze: .25 }) + river(t, 360) + a320({ x: 180 - 30 * k, y: 336 + 6 * k, s: 1.0, rot: -9 + 7 * k, t: t, dir: -1 }) + R(-220, 352, 800, 400, "url(#hudsonW)", { s: 0, op: .8 * k }); for (var i = 0; i < 22; i++) { var p = clamp((u - .4) / 2), a = -Math.PI * (.1 + .8 * hash(i)); s += Ci(220 + Math.cos(a) * p * 140 * (1 + hash(i * 2)), 350 + Math.sin(a) * p * 120 * hash(i + 4) + p * p * 80, 3 + hash(i) * 6, "#fff", { s: 0, op: .9 * (1 - p) }); } if (u > .4 && u < 1.2) s += '<ellipse cx="220" cy="350" rx="' + f(40 + (u - .4) * 220) + '" ry="' + f(14 + (u - .4) * 40) + '" fill="none" stroke="#fff" stroke-width="3" opacity="' + f2(1 - (u - .4) / .8) + '"/>'; return s; });
  // 37 · the real recording: "radar contact is lost"
  shot(37, push([180, 340], [180, 360], 1.0, 1.15), function (u, d, t) { return tracon(t, { lost: u > 1.2 }) + rec(t, 112); });
  // 38 · Patrick was sure no one would come out alive
  shot(38, push([180, 300], [180, 290], 1.3, 1.45), function (u, d, t) { return tracon(t, { lost: 1, pat: { head: { nod: .5, tilt: -4 }, face: { eyes: .3, brows: "worried", mouth: "frown" }, arms: [{ to: [150, 330], hand: "flat", bend: 1, rot: 60 }, { to: [210, 330], hand: "flat", bend: -1, rot: 120 }] } }); });
  // 39 · but the plane was floating, whole (with the real Coast Guard video)
  shot(39, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { return winter(t) + skyline(380, .75, { x: 170, haze: .15 }) + river(t, 380) + floating(t, 180, 430, .9, { people: 0 }); }, { foot: "float" });
  // 40 · the passengers out on the wings, in the icy water to their knees
  shot(40, push([180, 400], [180, 410], 1.5, 1.7), function (u, d, t) { return winter(t) + skyline(380, .75, { x: 170, haze: .15 }) + river(t, 380) + floating(t, 180, 430, .9, { people: clamp(u / 2) }); }, { foot: "wing" });
  // 41 · Sully walked the cabin twice; the last one off
  shot(41, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#d9d4c6", { s: 0 }) + R(-220, 150, 800, 40, "#ece8de", { w: 1.6 });
    for (var i = 0; i < 8; i++) s += '<rect x="' + (-40 + i * 60) + '" y="200" width="22" height="34" rx="9" fill="url(#hudsonW)" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var j = 0; j < 7; j++) s += P("M" + (-30 + j * 66) + " 470 L" + (-26 + j * 66) + " 330 Q" + (-20 + j * 66) + " 318 " + (-8 + j * 66) + " 330 L" + (-4 + j * 66) + " 420 L" + (36 + j * 66) + " 420 L" + (36 + j * 66) + " 470 Z", "#2f4a7a", { w: 1.6 });
    var ph = u * 5, wx = lerp(420, -60, (u / d) % 1), o = Object.assign({ x: wx, s: .72, dir: -1, lean: 4, breath: (Math.sin(t * 2) + 1) / 2, outfit: { base: "pilot", hat: null }, colors: { hair: "#e8e6df", hairL: "#fff", skin: "#e3ad90" }, head: { tilt: 2 * Math.sin(ph * 2), turn: -.5 }, face: { eyes: 1, brows: "worried", mouth: "neutral" } }, PERSON.walkPose(ph, 1)); o.y = PERSON.sideHipY(o, 520);
    s += R(-220, 470, 800, 60, "#5a5f6a", { w: 1.6 }) + PERSON.side(o).svg + R(-220, 500, 800, 300, "url(#hudsonW)", { s: 0, op: .55 }) + glints(t, 500, 10, "#e4eef6");
    return s + label("مرتين", 180, 110, u, D(41) * .3, 28, YEL); });
  // 42 · in about four minutes, the first ferry (with the real video)
  shot(42, push([180, 400], [190, 400], 1.3, 1.4), function (u, d, t) { return winter(t) + skyline(380, .75, { x: 170, haze: .15 }) + river(t, 380) + floating(t, 160, 430, .9) + ferry(lerp(460, 320, clamp(u / d)), 440, .9, t, -1) + ferry(lerp(-120, 0, clamp(u / d)), 400, .45, t) + label("~4 دقايق", 180, 300, u, .4, 24, YEL); }, { foot: "ferry" });
  // 43 · 155 people, all alive
  shot(43, push([180, 380], [180, 360], 1.2, 1.1), function (u, d, t) { return winter(t, { gold: 1 }) + skyline(380, .75, { x: 170, haze: .1 }) + river(t, 380, { gold: 1 }) + floating(t, 160, 430, .9) + ferry(300, 440, .9, t, -1) + ferry(20, 400, .45, t) + bigNum("155", 180, 200, u, .5, 70, "#fff") + label("كلهم عايشين", 180, 244, u, D(43) * .5, 26, YEL); });
  // 44 · remember the question?
  shot(44, push([210, 250], [200, 260], 1.1, 1.05), function (u, d, t) { return nycMap(t) + trackLine(TRACK, 1, RED, t, { dot: false }) + pin(LGA, "لاجوارديا", 0, 30, 1) + txt("ليه ماراجعش؟", 180, 160, 22, "#fff", { st: "rgba(0,0,0,.75)", sw: 5, op: clamp(u / .5) }); });
  // 45 · the simulator: a turn back the moment the birds hit makes it
  var BACK = [[300, 262], [322, 222], [312, 168], [296, 150], [276, 160], [262, 200], [270, 240], [292, 266]];
  shot(45, push([250, 230], [260, 220], 1.3, 1.45), function (u, d, t) { return nycMap(t) + trackLine(BACK, clamp(u / (d * .7)), "#4ac06a", t) + pin(LGA, "", 0, 0, 0) + check(320, 290, 1.2, (u - d * .72) / .4) + label("المحاكي", 280, 120, u, .3, 20, "#fff"); });
  // 46 · with 35 seconds to take it in: short of the runway, over the city
  var LATE = [[300, 262], [322, 222], [312, 168], [300, 140], [276, 132], [254, 150], [246, 190]];
  shot(46, push([250, 220], [250, 210], 1.3, 1.4), function (u, d, t) { var k = clamp((u - 1) / (d * .6)); return nycMap(t) + trackLine(LATE.slice(0, 4), clamp(u / 1), RED, t, { dot: u < 1 }) + (u > 1 ? trackLine(LATE.slice(3), k, RED, t) : "") + xmark(246, 194, 1.1, (u - 1 - d * .6) / .4) + G("translate(310 110) scale(.42)", watch(0, 0, 60, t, { h: 0, sec: clamp(u / 1.2) * 210 })) + label("35 ثانية", 310, 160, u, .4, 16, YEL); });
  // 47 · the little button again: it kept the flight computer alive
  shot(47, push([228, 230], [210, 250], 1.8, 1.3), function (u, d, t) { return apuPanel(t, 1, { hand: false, ring: 1 }) + label("كهربا ← كمبيوتر الطيارة", 180, 120, u, D(47) * .3, 17, YEL); });
  // 48 · the recording, published three weeks later
  shot(48, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#141a26", { s: 0 }) + '<circle cx="180" cy="300" r="240" fill="url(#warm)" opacity=".14"/>' + dust(t, 24, "#cfe4ff", .4, 4) + rec(t, 250, "FAA") + label("بعدها بتلات أسابيع", 180, 370, u, .8, 18, YEL); });
  // 49 · the plane today, in a museum in Charlotte
  shot(49, push([180, 320], [190, 320], 1.0, 1.1), function (u, d, t) { return museum(t) + label("شارلوت", 180, 150, u, D(49) * .5, 30, YEL); });
  // 50 · the call to comment: the river at golden light
  shot(50, push([180, 330], [180, 320], 1.0, 1.06), function (u, d, t) { return winter(t, { gold: 1, sx: 90, sy: 200 }) + skyline(380, .75, { x: 170, haze: .05, lit: "#e8c89a" }) + river(t, 380, { gold: 1 }) + floating(t, 180, 430, .8) + ferry(320, 440, .8, t, -1); });

  // the "link in bio" pill on the bio line, the chip on the opening lines, the real-footage cards
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 8) ? .9 : 0; };
  window.__foot = function (t) {
    var i = at(t), sh = SH[i]; if (!sh.o.foot) return null; var u = t - sh.a, n = FOOT[sh.o.foot], idx = Math.floor(u * 6) % n, k = clamp((u - .4) / .5);
    return { key: sh.o.foot + (idx + 1), x: 46, y: 104, w: 268, rot: -2, op: k };
  };
  function drawShot(sh, t, next) { var u = t - sh.a, d = Math.max(.6, next - sh.a), c = sh.cam(u, d), cx = c[0] + 9 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3), cy = c[1] + 7 * Math.cos(t * .9), z = c[2] * (1 + .02 * Math.sin(t * .8)); return '<g transform="translate(180 320) rotate(' + f(.5 * Math.sin(t * .5)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>'; }
  window.__panel = function (svg, t) {
    CLIPN = 0; SH.sort(function (p, q) { return p.a - q.a; });
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), s = "", u = t - sh.a;
    if (i > 0 && u < .35) s += drawShot(SH[i - 1], t, sh.a) + '<g opacity="' + f2(ease(u / .35)) + '">' + drawShot(sh, t, next) + '</g>';
    else s += drawShot(sh, t, next);
    if (sh.o.pill) { var pk = eout(clamp(u / .4)); s += G('translate(180 ' + f(118 - (1 - pk) * 12) + ')', '<rect x="-96" y="-20" width="192" height="40" rx="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + txt("اللينك في البايو ↑", 0, 7, 17, INK, { wt: 900 }), pk); }
    var endK = clamp((t - window.TIMING.duration) / 1.2);
    svg.innerHTML = s + vignette() + '<rect width="360" height="640" filter="url(#grain)"/>' + (endK > 0 ? R(0, 0, 360, 640, "#000", { s: 0, op: endK * .3 }) : "");
    return i;
  };
})();
