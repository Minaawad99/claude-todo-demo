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
  // ── «عبّارة السلام 98» in the «القصة 2D» look (the Titanic recipe). The ferry is drawn from the 2001 Genoa photograph
  //    (white hull, blue boot stripe, side sponsons, four passenger decks, a row of lifeboats, a white funnel with a dark
  //    blue cap). Two views carry the story: the stern / hull cut (the car deck, the water, the list) and the profile, bow
  //    to the left (she sails west, Duba to Safaga). See ../refs/SOURCES.md. ──
  var SH = [];
  function shot(i, cam, draw, o) { SH.push({ i: i, a: L(i) - 0.25, cam: cam, draw: draw, o: o || {} }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(a, b, z0, z1) { return function (u, d) { var k = ease(u / d); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  // primitives for the ship drawings (stroke width as a number, rounded corners)
  var CLIPN = 0, ORANGE = "#e0662f", BLUE = "#5aa0d0", OLIVE = "#8a9a5a", STEEL = "#9aa2ac", SKIN = "#d9a186", HAIR = "#2a2018", PAPER = "#f4ecdb", GREY = "#8a8a90", WOOD = "#a9784d", WOOD_D = "#7c5434", YEL = "#f2c230";
  var HULL = "#f1ebdc", HULL_D = "#cfc6b0", BOOT = "#2f4a78", WATER = "#3f86b8", GLASS = "#ffd98a", FIRE1 = "#f08a2f", FIRE2 = "#ffd45a", NIGHT = "#141c2c", VEST = "#e8722a", WIN = "#ffd98a";
  function r_(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
  function c_(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function p_(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || "") + '/>'; }
  function t_(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
  function n_(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:700 ' + sz + 'px Noto Serif;fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
  var LANES = [-152, -104, -52, 0, 50, 100, 150], CARCOL = ["#b9ab8a", "#8f9aa3", "#c9b28a", "#a36a4c", "#9aa58a", "#d8ccae", "#7f8a96"];
  function waterPoly(A, list, W) {
    W = W || 366; var H = W / 2, tn = Math.tan(Math.abs(list) * Math.PI / 180), sg = list >= 0 ? 1 : -1; if (A <= 0) return null;
    if (tn < 1e-4) { var h = A / W; return [[-H, 0], [H, 0], [H, -h], [-H, -h]]; }
    var b = Math.sqrt(2 * A / tn);
    if (b < W) return [[sg * H, 0], [sg * H, -b * tn], [sg * (H - b), 0]];
    var m = A / W, e = W * tn / 2; return [[-H, 0], [H, 0], [H, -(m + sg * e)], [-H, -(m - sg * e)]];
  }
  function polyD(p) { return "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + " Z"; }
  function carRear(x, i, tall) {
    if (tall) return r_(x - 21, -64, 42, 54, "#c7bda6", 1.6, 2) + '<path d="M' + (x - 21) + ' -46 h42 M' + x + ' -64 v54" stroke="' + INK + '" stroke-width="1"/>' + r_(x - 19, -10, 9, 10, INK, 0, 2) + r_(x + 10, -10, 9, 10, INK, 0, 2);
    return r_(x - 14, -22, 28, 17, CARCOL[i % 7], 1.6, 4) + r_(x - 11, -32, 22, 12, GLASS, 1.4, 3) + r_(x - 13, -7, 7, 7, INK, 0, 2) + r_(x + 6, -7, 7, 7, INK, 0, 2) + r_(x - 11, -17, 5, 3, ORANGE, 0) + r_(x + 6, -17, 5, 3, ORANGE, 0);
  }
  function hullCut(o) {
    var t = o.t || 0, g = "", list = o.list || 0, id = "dk" + (++CLIPN);
    // superstructure: four passenger decks, the funnel
    var decks = [[-178, -122, 356], [-168, -164, 336], [-150, -206, 300], [-112, -244, 224]];
    g += r_(-26, -300, 52, 58, HULL, 2) + r_(-28, -304, 56, 18, BOOT, 2) + r_(-40, -288, 80, 6, BOOT, 1.4);
    if (o.fire && !o.skin) g += puff(0, -306, t, 5, 110, 3);
    decks.forEach(function (d, k) { g += r_(d[0], d[1], d[2], k === 3 ? 38 : 42, HULL, 2); for (var x = d[0] + 14; x < d[0] + d[2] - 16; x += 22) g += r_(x, d[1] + 12, 12, k === 3 ? 10 : 13, k === 3 ? "#56636e" : GLASS, 1); });
    g += '<path d="M-178 -122 h356" stroke="' + INK + '" stroke-width="2.4"/>' + r_(-204, -116, 30, 12, VEST, 1.4, 6) + r_(174, -116, 30, 12, VEST, 1.4, 6);   // lifeboats at the deck edge
    // hull shell
    var shell = "M-189 -80 L-189 62 Q-189 126 -122 126 L122 126 Q189 126 189 62 L189 -80 Z";
    g += p_("M-189 16 L-204 22 L-204 50 L-189 58 Z", HULL_D, 2) + p_("M189 16 L204 22 L204 50 L189 58 Z", HULL_D, 2);   // sponsons
    g += p_(shell, HULL, 2.8);
    g += '<clipPath id="' + id + 'h"><path d="' + shell + '"/></clipPath><g clip-path="url(#' + id + 'h)"><rect x="-200" y="36" width="400" height="100" fill="' + BOOT + '"/></g>';
    if (o.skin) {   // the stern from outside: the ramp door, the name, the rubbing strake
      g += r_(-70, -72, 140, 88, HULL_D, 2, 4) + '<path d="M-70 -28 h140 M-40 -72 v88 M40 -72 v88" stroke="' + INK + '" stroke-width="1"/>' + '<path d="M-189 -80 h378" stroke="' + INK + '" stroke-width="3"/>' + n_("AL SALAM 98", 0, -84, 9, INK) + p_(shell, "none", 2.8);
      return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(list) + ") translate(0 -32)", g);
    }
    // below the car deck: engine room and tanks (hatched)
    g += '<g clip-path="url(#' + id + 'h)"><rect x="-200" y="0" width="400" height="140" fill="#cfc4aa"/><rect x="-200" y="0" width="400" height="140" fill="url(#hatch)" opacity=".5"/><rect x="-200" y="36" width="400" height="100" fill="' + BOOT + '" opacity=".35"/>' + r_(-60, 40, 50, 60, STEEL, 1.6, 4) + r_(10, 40, 50, 60, STEEL, 1.6, 4) + '<path d="M-189 100 h378" stroke="' + INK + '" stroke-width="1.4"/></g>';
    // the car deck: one open hall across the whole beam
    g += r_(-183, -80, 366, 80, "#f6f0e1", 2) + '<clipPath id="' + id + '"><rect x="-183" y="-80" width="366" height="80"/></clipPath><g clip-path="url(#' + id + ')">';
    var ck = o.cars == null ? 1 : o.cars, sl = o.slide || 0, sg = list >= 0 ? 1 : -1;
    LANES.forEach(function (x, i) { var kk = clamp(ck * 7 - (6 - i)); if (kk <= 0) return; var xs = lerp(x, sg > 0 ? 166 - (6 - i) * 30 : -166 + i * 30, sl); g += G("", carRear(xs, i, i === 2), kk); });
    if (o.fire) { g += puff(-52, -66, t, 6, 30, 1) + flame(-52, -60, .9 * o.fire, t, 0) + flame(-66, -40, .6 * o.fire, t, 2) + flame(-36, -44, .5 * o.fire, t, 4) + (o.fire > .7 ? flame(-2, -30, .5 * o.fire, t, 6) : ""); }
    if (o.spr) { for (var x2 = -160; x2 <= 160; x2 += 40) { g += r_(x2 - 3, -78, 6, 5, STEEL, 1); for (var j = 0; j < 3; j++) { var p = (t * 1.6 + hash(x2 + j * 7)) % 1, dx = (j - 1) * 9; g += '<path d="M' + f(x2 + dx * p) + ' ' + f(-72 + p * 66) + ' l' + f(dx * .12) + ' 9" stroke="' + BLUE + '" stroke-width="2" stroke-linecap="round" opacity="' + f(o.spr * (1 - p * .4)) + '"/>'; } } }
    var wp = waterPoly((o.water || 0) * 366 * 30, list);
    if (wp) g += '<path d="M' + wp.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + ' Z" fill="' + (o.hlW ? BLUE : WATER) + '" opacity="' + (o.hlW ? .9 : .78) + '"/><path d="M' + f(wp[wp.length - 2][0]) + " " + f(wp[wp.length - 2][1]) + " L" + f(wp[wp.length - 1][0]) + " " + f(wp[wp.length - 1][1]) + (wp.length === 3 ? "" : "") + '" stroke="#e8eef0" stroke-width="2.2"/>';
    g += '</g><path d="M-183 -76 h366" stroke="' + STEEL + '" stroke-width="3"/>';
    // the scuppers: a drain at each edge of the deck, through the shell, out above the waterline
    [-1, 1].forEach(function (sd) { g += '<path d="M' + sd * 181 + ' 4 h' + sd * 8 + '" stroke="#f6f0e1" stroke-width="7"/><path d="M' + sd * 180 + ' 0 v8 h' + sd * 9 + '" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'; if (o.blocked) g += G("", c_(sd * 179, 2, 5.5, "#6b5a45", 1.2) + c_(sd * 174, -2, 3.5, "#8a7656", 1), o.blocked); });
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(list) + ") translate(0 -32)", g);
  }
  
  function flame(x, y, s, t, seed) {
    var out = ""; seed = seed || 0;
    for (var i = 0; i < 3; i++) { var w = (11 - i * 3) * s, h = (34 - i * 8) * s * (1 + .2 * Math.sin(t * (9 + i * 2) + seed + i)), sx = Math.sin(t * 7 + i + seed) * 4 * s;
      out += '<path d="M' + f(x - w) + ' ' + f(y) + ' Q' + f(x - w * 1.3) + ' ' + f(y - h * .5) + ' ' + f(x + sx) + ' ' + f(y - h) + ' Q' + f(x + w * 1.3) + ' ' + f(y - h * .5) + ' ' + f(x + w) + ' ' + f(y) + ' Z" fill="' + [ORANGE, FIRE1, FIRE2][i] + '"' + (i ? "" : ' stroke="' + INK + '" stroke-width="1.2"') + '/>'; }
    return out;
  }
  function puff(x, y, t, n, h, seed) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .35 + hash(i + (seed || 0))) % 1; s += '<circle cx="' + f(x + (hash(i + 5) - .5) * 30 + 14 * Math.sin(t * 1.3 + i) * p) + '" cy="' + f(y - p * h) + '" r="' + f(5 + 12 * p) + '" fill="#6f6a62" opacity="' + f(.5 * (1 - p)) + '"/>'; } return s; }
  
  function ferry(o) {
    var t = o.t || 0, g = "", s = o.s || 1;
    if (!o.smokeOff) for (var i = 0; i < 6; i++) { var p = (t * .22 + i / 6) % 1; g += '<circle cx="' + f(268 + p * 150) + '" cy="' + f(-134 - p * 30 + 5 * Math.sin(t + i)) + '" r="' + f(6 + 14 * p) + '" fill="#6f6a62" opacity="' + f(.42 * (1 - p)) + '"/>'; }
    g += '<path d="M138 -98 v-42 M128 -128 h20 M132 -118 h12" stroke="' + INK + '" stroke-width="2"/>';   // mast over the bridge
    g += p_("M250 -98 L254 -128 L288 -128 L284 -98 Z", HULL, 2) + p_("M253 -122 L254 -132 L290 -132 L287 -122 Z", BOOT, 1.6) + p_("M287 -128 L300 -126 L287 -124 Z", BOOT, 1.2);   // funnel with its wing
    var tiers = [[66, -56, 440, 14], [92, -70, 388, 14], [106, -84, 318, 14], [112, -98, 214, 14]];
    tiers.forEach(function (d, k) { g += r_(d[0], d[1], d[2], d[3], HULL, 1.8); for (var x = d[0] + 8; x < d[0] + d[2] - 8; x += 10) g += '<rect x="' + x + '" y="' + (d[1] + 4) + '" width="5" height="5" fill="' + (o.lit ? FIRE2 : k === 3 && x < 150 ? "#56636e" : GLASS) + '" stroke="' + INK + '" stroke-width=".6"/>'; });
    for (var b = 0; b < 5; b++) g += '<path d="M' + (212 + b * 34) + ' -60 q13 9 26 0 z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (216 + b * 34) + ' -70 v10 M' + (234 + b * 34) + ' -70 v10" stroke="' + INK + '" stroke-width="1"/>';   // lifeboats under their davits
    var hull = "M0 -50 L44 0 L506 0 L524 -10 L524 -42 L60 -42 Z";
    g += p_(hull, HULL, 2.6) + '<clipPath id="fh' + (++CLIPN) + '"><path d="' + hull + '"/></clipPath><g clip-path="url(#fh' + CLIPN + ')"><rect x="0" y="-5" width="530" height="8" fill="' + BOOT + '"/></g>' + p_("M150 -12 L470 -12 L470 -4 L150 -4 Z", HULL_D, 1.4);   // boot stripe and the sponson
    for (var x3 = 70; x3 < 500; x3 += 14) g += '<circle cx="' + x3 + '" cy="-33" r="1.6" fill="' + (o.lit ? FIRE2 : INK) + '"/>';
    g += '<rect x="486" y="-40" width="34" height="28" fill="' + HULL_D + '" stroke="' + INK + '" stroke-width="1.2"/>';   // the stern ramp
    if (o.cut) {   // the car deck seen through the side: one hall from end to end
      var c = "";
      c += '<rect x="64" y="-30" width="452" height="20" fill="#f6f0e1" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var k2 = 0; k2 < 19; k2++) { var cx = 76 + k2 * 23; c += k2 % 5 === 2 ? r_(cx, -27, 19, 16, "#c7bda6", 1) : '<path d="M' + cx + ' -12 v-5 l3 -1 l3 -5 h8 l3 5 l3 1 v5 z" fill="' + CARCOL[k2 % 7] + '" stroke="' + INK + '" stroke-width=".9"/>'; }
      if (o.water) c += '<rect x="65" y="' + f(-11 - 7 * o.water) + '" width="450" height="' + f(7 * o.water) + '" fill="' + WATER + '" opacity=".8"/>';
      g += G("", c, o.cut);
    }
    return G("translate(" + f(o.x) + " " + f(o.y) + ") scale(" + s + ")", g);
  }
  
  function tray(x, y, ang, A, t) {   // a serving tray seen from the side, 300 wide, held at both ends; the water stays level
    var wp = waterPoly(A, ang, 300), id = "tr" + (++CLIPN), g = '<clipPath id="' + id + '"><rect x="-150" y="-60" width="300" height="60"/></clipPath>';
    if (wp) g += '<g clip-path="url(#' + id + ')"><path d="' + polyD(wp) + '" fill="' + WATER + '" opacity=".85"/></g>';
    g += '<path d="M-156 -30 L-150 0 L150 0 L156 -30" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M-150 3 h300" stroke="' + STEEL + '" stroke-width="4"/>';
    [-1, 1].forEach(function (sd) { g += '<path d="M' + sd * 250 + ' 70 L' + sd * 176 + ' 8" stroke="' + INK + '" stroke-width="30" stroke-linecap="round"/><path d="M' + sd * 250 + ' 70 L' + sd * 176 + ' 8" stroke="' + SKIN + '" stroke-width="26" stroke-linecap="round"/>' + '<ellipse cx="' + sd * 160 + '" cy="-2" rx="22" ry="13" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>'; });
    return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(ang) + ")", g);
  }
  function swimmer(x, y, t, i, sc) {   // a head and a life jacket above the water (no face, like the figures)
    var b = 5 * Math.sin(t * 1.7 + i * 1.3), s = sc || 1;
    return G("translate(" + f(x) + " " + f(y + b) + ") scale(" + s + ")", '<path d="M-20 22 Q-22 -4 0 -6 Q22 -4 20 22 Z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="2"/><path d="M0 -6 v28" stroke="' + INK + '" stroke-width="1.4"/><ellipse cx="0" cy="-20" rx="12" ry="14" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 -24 Q0 -40 12 -24 Q0 -30 -12 -24 Z" fill="' + HAIR + '"/>' +
      '<path d="M-20 4 L-38 ' + f(-8 - 6 * Math.sin(t * 3 + i)) + '" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>');
  }
  function raft(x, y, t) { var b = 4 * Math.sin(t * 1.4); return G("translate(" + f(x) + " " + f(y + b) + ") rotate(" + f(3 * Math.sin(t * 1.1)) + ")", '<path d="M-70 0 Q-60 -64 0 -70 Q60 -64 70 0 Z" fill="' + VEST + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-22 0 Q-20 -36 0 -38 Q20 -36 22 0 Z" fill="' + NIGHT + '"/>' + r_(-80, -4, 160, 22, "#3a352e", 2, 10) + '<path d="M0 -70 v-14" stroke="' + INK + '" stroke-width="2"/>' + c_(0, -88, 4, FIRE2, 1)); }
  function epirb(x, y, t) {   // the emergency beacon: a yellow float with an aerial and a strobe
    var fl = Math.sin(t * 8) > .3 ? 1 : .25;
    return G("translate(" + f(x) + " " + f(y + 4 * Math.sin(t * 1.8)) + ") rotate(" + f(6 * Math.sin(t * 1.3)) + ")", '<path d="M0 -62 v-70" stroke="' + INK + '" stroke-width="3"/>' + r_(-22, -30, 44, 70, "#e3b93c", 2.4, 10) + r_(-26, -34, 52, 16, VEST, 2, 6) + r_(-12, -62, 24, 30, "#f4ecdb", 2, 6) + '<circle cx="0" cy="-70" r="9" fill="' + FIRE2 + '" opacity="' + fl + '" stroke="' + INK + '" stroke-width="1.6"/>' + n_("EPIRB", 0, 12, 10, INK));
  }
  function rings(x, y, t, n, col, R0) { var s = ""; for (var i = 0; i < n; i++) { var p = (t * .6 + i / n) % 1; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(14 + p * (R0 || 120)) + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="3" opacity="' + f(1 - p) + '"/>'; } return s; }
  function satellite(x, y, t) { return G("translate(" + f(x) + " " + f(y) + ") rotate(" + f(-18 + 4 * Math.sin(t)) + ")", r_(-58, -12, 40, 24, BLUE, 1.6) + r_(18, -12, 40, 24, BLUE, 1.6) + '<path d="M-48 -12 v24 M-38 -12 v24 M-28 -12 v24 M28 -12 v24 M38 -12 v24 M48 -12 v24" stroke="' + INK + '" stroke-width=".8"/>' + r_(-18, -16, 36, 32, "#d8ccae", 2, 3) + '<path d="M0 16 v12 M-10 34 q10 -12 20 0" stroke="' + INK + '" stroke-width="2" fill="none"/>'); }
  function radio(x, y) { return G("translate(" + f(x) + " " + f(y) + ")", r_(-110, -60, 220, 120, "#4a4740", 2.6, 8) + r_(-96, -46, 90, 44, "#9fb7a0", 2, 3) + n_("CH 16", -51, -16, 22, INK) + [0, 1, 2, 3, 4].map(function (i) { return '<path d="M20 ' + (-44 + i * 10) + ' h76" stroke="#2a2016" stroke-width="3"/>'; }).join("") + c_(-76, 28, 13, "#8f8576", 2) + c_(-40, 28, 13, "#8f8576", 2) + r_(10, 16, 86, 26, ORANGE, 2, 4) + t_("DISTRESS", 53, 34, 13, "#fff", 800) +
    '<path d="M110 0 q30 10 20 50 q-10 40 30 60" fill="none" stroke="' + INK + '" stroke-width="3"/>' + r_(140, 104, 40, 70, "#4a4740", 2.2, 10)); }
  function gavel(x, y, k) { var a = lerp(-50, 0, k); return G("translate(" + f(x) + " " + f(y) + ")", r_(-70, 40, 140, 18, WOOD_D, 2, 4) + r_(-56, 26, 112, 16, WOOD, 2, 4) + G("rotate(" + f(a) + " 110 0)", r_(-10, -6, 130, 12, WOOD, 2, 5) + r_(-46, -26, 60, 50, WOOD_D, 2.4, 6) + '<path d="M-34 -26 v50 M2 -26 v50" stroke="' + INK + '" stroke-width="1.4"/>')); }
  function bubblesW(x, y, t) { var s = ""; for (var i = 0; i < 12; i++) { var p = (t * .6 + hash(i)) % 1; s += '<circle cx="' + f(x + (hash(i + 7) - .5) * 240) + '" cy="' + f(y + 260 - p * 250) + '" r="' + f(3 + hash(i + 3) * 7) + '" fill="none" stroke="#e8eef0" stroke-width="2" opacity="' + f(1 - p) + '"/>'; } return s; }

  // ── film-specific pieces ──
  function Ci(x, y, r, fill, o) { o = o || {}; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + INK + '" stroke-width="' + (o.w || 1.4) + '"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '/>'; }
  function D(i) { return LN[i].end - LN[i].start; }
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.5 + hash(i + 1) * 1.1) + '" fill="#fff" opacity="' + f2(.35 + .5 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function glints(t, wy, n, col) { var s = ""; for (var i = 0; i < (n || 44); i++) { var x = ((hash(i) * 800 + t * (14 + hash(i + 7) * 22)) % 800) - 220; s += '<path d="M' + f(x) + ' ' + f(wy + 8 + hash(i + 2) * 230) + ' h' + f(14 + hash(i + 5) * 26) + '" stroke="' + (col || "#a8c0e6") + '" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function night(t, wy) { return sky("skyStar") + stars(t, 90, wy) + '<circle cx="292" cy="96" r="17" fill="#e9e4d2"/><circle cx="285" cy="92" r="15" fill="#18203a"/>' + R(-220, wy, 800, 900, "url(#seaNight)", { s: 0 }) + glints(t, wy); }
  function seaFront(t, wy, op, col) { var d = "M-220 " + f(wy); for (var x = -220; x <= 580; x += 10) d += " L" + x + " " + f(wy + 2.4 * Math.sin((x - t * 40) * .05)); return '<path d="' + d + ' L580 1400 L-220 1400 Z" fill="' + (col || "#16264a") + '" opacity="' + f2(op == null ? .7 : op) + '"/><path d="' + d + '" stroke="#cfe0f6" stroke-width="1.4" fill="none" opacity=".8"/>'; }
  function cutS(x, y, s, t, o) { return G('translate(' + f(x) + ' ' + f(y + 1.5 * Math.sin(t * 1.2)) + ') scale(' + s + ')', hullCut(Object.assign({ x: 0, y: 0, t: t }, o))); }
  function cutScene(t, s, o, wy) { wy = wy || 360; return night(t, wy) + cutS(180, wy, s, t, o) + seaFront(t, wy, .62); }
  function recOld(t, y) { var b = ""; y = y || 112; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".78"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt("تسجيل حقيقي · الصندوق الأسود", 288, y + 4, 13, "#fff", { a: "start" }) + b; }
  function photoCard(file, x, y, w, h, rot, k, cap) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y + (1 - eout(k)) * 14) + ') rotate(' + f(rot) + ')', '<rect x="' + (-w / 2 - 5) + '" y="' + (-h / 2 - 5) + '" width="' + (w + 10) + '" height="' + (h + 26) + '" fill="#f6f1e4" stroke="' + INK + '" stroke-width="1.4"/><image href="../photos/' + file + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/>' + '<text x="0" y="' + (h / 2 + 15) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="800" font-size="9.5" fill="#3a3428">' + (cap || "صورة حقيقية") + '</text>', k); }
  function xmark(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<path d="M-14 -14 L' + f(-14 + 28 * clamp(k * 2)) + ' ' + f(-14 + 28 * clamp(k * 2)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' + (k > .5 ? '<path d="M14 -14 L' + f(14 - 28 * clamp(k * 2 - 1)) + ' ' + f(-14 + 28 * clamp(k * 2 - 1)) + '" stroke="#e23a2a" stroke-width="6" stroke-linecap="round"/>' : "")); }
  function arrowL(x1, y1, x2, y2, col, k, w) { k = clamp(k); if (k <= 0) return ""; var xe = lerp(x1, x2, k), ye = lerp(y1, y2, k), a = Math.atan2(ye - y1, xe - x1), h = 9; return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe) + ' ' + f(ye) + '" stroke="' + col + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe + Math.cos(a) * 5) + ' ' + f(ye + Math.sin(a) * 5) + ' L' + f(xe - Math.cos(a - .5) * h) + ' ' + f(ye - Math.sin(a - .5) * h) + ' L' + f(xe - Math.cos(a + .5) * h) + ' ' + f(ye - Math.sin(a + .5) * h) + ' Z" fill="' + col + '"/>'; }
  function vdr(x, y, s, t) { return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', '<circle r="70" fill="url(#warm)" opacity="' + f2(.35 + .1 * Math.sin(t * 3)) + '"/>' + r_(-40, -22, 80, 48, "#e8632a", 2, 12) + r_(-52, 10, 104, 16, "#c9521e", 2, 4) + r_(-26, -40, 52, 20, "#f4ecdb", 2, 6) + '<path d="M-40 -6 h80 M-40 6 h80" stroke="#f4ecdb" stroke-width="5" opacity=".9"/>' + n_("VDR", 0, 4, 13, "#1a1a1a") + '<circle cx="0" cy="-30" r="4" fill="#ff5a3a" opacity="' + (Math.sin(t * 7) > 0 ? 1 : .2) + '"/>'); }
  function ferryN(x, y, s, t, o) { return ferry(Object.assign({ x: x - 262 * s, y: y + 1.2 * Math.sin(t * 1.3), s: s, t: t, lit: 1 }, o || {})); }
  // the Red Sea between Duba and Safaga, real coastlines (Natural Earth through lib/geo.min.js); 1° of latitude ≈ 108 units
  var DUBA = [35.69, 27.35], SAFAGA = [33.94, 26.73], WRECK = [34.883, 27.033], MAPG = null;
  function mapG() { return MAPG || (MAPG = GEO.globe(180, 300, 3600, 34.85, 27.05)); }
  function seaMap(t, k) { var g = mapG(), a = g.project(DUBA), b = g.project(SAFAGA), w = g.project(WRECK), s = R(-300, -300, 960, 1300, "#12284a", { s: 0 });
    for (var i = 0; i < 12; i++) s += '<path d="M' + f(-60 + ((i * 97 + t * 6) % 480)) + ' ' + (120 + i * 34) + ' q6 -4 12 0 t12 0" stroke="#5a86b8" stroke-width="1.2" fill="none" opacity=".6"/>';
    s += '<path d="' + g.land + '" fill="#b89a62" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    return { svg: s, a: a, b: b, w: w, ship: [lerp(a[0], w[0], k), lerp(a[1], w[1], k)] }; }
  function pin(p, name, dx, dy, k, col) { k = clamp(k); return Ci(p[0], p[1], 5, col || YEL, { w: 1.6 }) + (k > 0 ? txt(name, p[0] + dx, p[1] + dy, 17, "#fff", { op: k, st: "rgba(0,0,0,.7)", sw: 4, wt: 900 }) : ""); }
  function miniShip(p, t) { return ferryN(p[0], p[1] + 3, .07, t, { smokeOff: 1 }) + '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(12 + 3 * Math.sin(t * 3)) + '" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>'; }
  // a deck at night with the rail, tilted by `tilt` degrees; people stand on it
  function deckN(t, tilt, inner) {
    var g = R(-400, 400, 1160, 500, "url(#wood)", { s: 0 }); for (var i = 0; i < 14; i++) g += '<path d="M-400 ' + (412 + i * 18) + ' H760" stroke="#3a2414" stroke-width="1" opacity=".6"/>';
    g += '<path d="M-400 338 H760 M-400 362 H760" stroke="#e8e4d8" stroke-width="3"/>'; for (var p = 0; p < 24; p++) g += R(-390 + p * 48, 338, 4, 64, "#e8e4d8", { w: .8 });
    g += R(250, 150, 160, 252, "#e6dfcc", { w: 2 }); for (var w = 0; w < 3; w++) g += R(266 + w * 40, 190, 22, 26, WIN, { w: 1.2 }) + R(266 + w * 40, 270, 22, 26, WIN, { w: 1.2 });
    g += '<path d="M60 400 V262 Q60 236 90 236 M210 400 V262 Q210 236 180 236" stroke="#e8e4d8" stroke-width="6" fill="none"/>' + P('M70 250 Q135 282 200 250 L196 240 H74 Z', VEST, { w: 1.6 });
    return sky("skyStar") + stars(t, 60, 300) + G('rotate(' + f(-tilt * .5) + ' 180 420)', R(-400, 330, 1160, 600, "url(#seaNight)", { s: 0 }) + glints(t, 330, 30)) + G('rotate(' + f(tilt) + ' 180 420)', g + (inner || ""));
  }
  function bridge(t, tilt, inner) {   // the wheelhouse from inside: a row of windows on the night sea, the console, the wheel
    var s = R(-200, -200, 760, 1100, "#1a1e28", { s: 0 }), win = "";
    for (var i = 0; i < 4; i++) { var x = 14 + i * 86; win += '<svg x="' + x + '" y="150" width="74" height="120" viewBox="0 0 74 120" overflow="hidden"><rect width="74" height="120" fill="#0e1830"/><g transform="rotate(' + f(-tilt) + ' 37 60)"><rect x="-60" y="70" width="200" height="120" fill="#1c3460"/><path d="M-60 70 H140" stroke="#8fb0e0" stroke-width="1"/></g>' + [0, 1, 2, 3, 4].map(function (k) { return '<circle cx="' + f(hash(i * 5 + k) * 74) + '" cy="' + f(hash(i + k * 3) * 50) + '" r=".8" fill="#fff"/>'; }).join("") + '</svg>' + R(x, 150, 74, 120, "none", { w: 3, s: "#3a4252" }); }
    s += win + R(-20, 300, 400, 90, "#3a4252", { w: 2 }) + R(-20, 300, 400, 10, "#56607a", { s: 0 });
    for (var k = 0; k < 6; k++) s += R(20 + k * 56, 322, 40, 26, "#10141c", { w: 1.2 }) + '<circle cx="' + (30 + k * 56) + '" cy="335" r="3" fill="' + (k % 2 ? "#e23a2a" : "#7ad87a") + '" opacity="' + f2(.5 + .5 * Math.sin(t * 4 + k)) + '"/>';
    s += G('translate(180 380)', '<circle r="34" fill="none" stroke="#8a6a44" stroke-width="6"/><circle r="6" fill="#8a6a44"/>' + [0, 1, 2, 3, 4, 5].map(function (q) { return '<path d="M0 0 L' + f(Math.cos(q * 1.047 + tilt * .02) * 44) + ' ' + f(Math.sin(q * 1.047 + tilt * .02) * 44) + '" stroke="#8a6a44" stroke-width="4"/>'; }).join(""));
    s += R(-200, 430, 760, 400, "#12151c", { s: 0 }) + '<circle cx="180" cy="120" r="150" fill="url(#warm)" opacity=".12"/>';
    return s + (inner || "");
  }
  function head(x, y, s, t, k, vest) { var b = 3 * Math.sin(t * 1.7 + k * 1.3); return G('translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')', (vest === false ? '' : P('M-17 22 Q-19 2 0 0 Q19 2 17 22 Z', VEST, { w: 1.6 }) + '<path d="M0 0 v22" stroke="' + INK + '" stroke-width="1.2"/>') + G('translate(0 -12)', face(k % 2 ? "front" : "side", { skin: SK[k % 4], hair: k % 3 === 2 ? "bob" : "short", mustache: k % 3 === 0, sad: true })) + '<path d="M-17 8 L-30 ' + f(-4 - 5 * Math.sin(t * 3 + k)) + '" stroke="' + SK[k % 4] + '" stroke-width="5" stroke-linecap="round"/>'); }
  function seaPeople(t, wy, n) { var s = "", pos = [[90, 60], [250, 90], [160, 130], [300, 160], [60, 170], [210, 200], [120, 230]]; for (var i = 0; i < n; i++) s += head(pos[i][0], wy + pos[i][1], .9 + pos[i][1] / 400, t, i) + '<ellipse cx="' + pos[i][0] + '" cy="' + f(wy + pos[i][1] + 22) + '" rx="26" ry="4" fill="#cfe0f6" opacity=".25"/>'; return s; }
  function vests(t, wy, n) { var s = ""; for (var i = 0; i < n; i++) s += G('translate(' + f(40 + i * 62 + 8 * Math.sin(t * .7 + i)) + ' ' + f(wy + 3 + 3 * Math.sin(t * 1.6 + i * 2)) + ') rotate(' + f(18 * Math.sin(t * .8 + i)) + ')', r_(-10, -4, 20, 8, VEST, 1.2, 3)); return s; }
  function lights(t, wy, n) { var s = ""; for (var i = 0; i < n; i++) { var x = 20 + hash(i * 3) * 320, y = wy + 20 + hash(i + 11) * 200, fl = .6 + .4 * Math.sin(t * 2 + i * 1.7); s += '<circle cx="' + f(x + 3 * Math.sin(t * .6 + i)) + '" cy="' + f(y + 2 * Math.sin(t * 1.1 + i)) + '" r="9" fill="#ffcf7a" opacity="' + f2(.18 * fl) + '"/><circle cx="' + f(x + 3 * Math.sin(t * .6 + i)) + '" cy="' + f(y + 2 * Math.sin(t * 1.1 + i)) + '" r="1.8" fill="#ffe9a8" opacity="' + f2(fl) + '"/>'; } return s; }
  function village(t) { var s = sky("skyStar") + stars(t, 110, 330) + R(-220, 400, 800, 500, "#161a22", { s: 0 }); for (var i = 0; i < 13; i++) { var w = 44 + hash(i) * 30, h = 50 + hash(i + 4) * 70, x = -40 + i * 36 + hash(i + 9) * 10, y = 400 + (i % 3) * 14; s += R(x, y - h, w, h + 40, ["#2a2e3a", "#333847", "#262a34"][i % 3], { w: 1.2 }); for (var k = 0; k < 2; k++) { var on = hash(i * 7 + k) > .25; s += R(x + 8 + k * 18, y - h + 14, 9, 12, on ? WIN : "#12141a", { w: .8, op: on ? .7 + .3 * Math.sin(t * 1.5 + i + k) : 1 }); } } return s; }

  // ═════════ the shots (line numbers from script.txt; 0, 23 and 30 are the real recording) ═════════
  // ══ «سالم إكسبريس» (14 December 1991): the pieces this story adds on top of the Salam 98 kit above ══
  //    The ship is drawn from the real photograph of her as the Fred Scamaroni (Marseille, 1966, photos/scamaroni-1966.jpg):
  //    a long white hull with a dark boot-topping, a raked bow with the big bow visor that lifts up for the car deck, a
  //    three-deck superstructure forward with the bridge, long passenger decks aft with a row of lifeboats, twin black-topped
  //    funnels aft. The map uses the real coastlines (Natural Earth through lib/geo.min.js); the wreck position is the one
  //    printed in the January 1992 dive video (26°39′01″N 34°03′48″E). People: the shared person kit.
  function blink(t, e, seed) { return ((t + (seed || 0)) * 1000) % 3900 < 130 ? .05 : e; }
  var WY = 380, SHIPW = "#f2efe6", SHIPD = "#cfc9ba", BOOT2 = "#2a2e36", FUN = "#1c1e24", WIN2 = "#ffd98a";
  function salem(o) {
    var t = o.t || 0, g = "", lit = o.lit, id = "sx" + (++CLIPN);
    if (o.smoke) for (var i = 0; i < 6; i++) { var p = (t * .22 + i / 6) % 1; g += '<circle cx="' + f(372 + p * 140) + '" cy="' + f(-214 - p * 34 + 5 * Math.sin(t + i)) + '" r="' + f(6 + 14 * p) + '" fill="#5f5a54" opacity="' + f2(.4 * (1 - p)) + '"/>'; }
    g += '<path d="M150 -160 V-226 M138 -212 h24 M142 -198 h16" stroke="' + INK + '" stroke-width="2.2"/>';   // the mast over the bridge
    [[340, -206], [392, -204]].forEach(function (q) { g += P("M" + q[0] + " -96 L" + (q[0] + 4) + " " + q[1] + " L" + (q[0] + 30) + " " + q[1] + " L" + (q[0] + 34) + " -96 Z", SHIPW, { w: 2 }) + P("M" + (q[0] + 4) + " " + q[1] + " L" + (q[0] + 30) + " " + q[1] + " L" + (q[0] + 31) + " " + (q[1] + 30) + " L" + (q[0] + 3) + " " + (q[1] + 30) + " Z", FUN, { w: 1.6 }); });
    // superstructure forward: three decks and the bridge; aft: the long passenger deck with the lifeboats
    g += R(70, -100, 210, 38, SHIPW, { w: 2 }) + R(84, -134, 176, 34, SHIPW, { w: 2 }) + R(102, -160, 100, 26, SHIPW, { w: 2 });
    for (var x = 82; x < 272; x += 15) g += R(x, -90, 8, 10, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var x2 = 96; x2 < 252; x2 += 16) g += R(x2, -125, 8, 10, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var x3 = 110; x3 < 196; x3 += 13) g += R(x3, -154, 9, 10, lit ? "#ffe8b0" : "#2a3442", { w: .8 });
    g += R(280, -96, 222, 34, SHIPW, { w: 2 });
    for (var x4 = 292; x4 < 496; x4 += 15) g += R(x4, -86, 8, 9, lit ? WIN2 : "#3a4656", { w: .8 });
    for (var b = 0; b < 5; b++) g += P("M" + (292 + b * 42) + " -104 Q" + (310 + b * 42) + " -114 " + (328 + b * 42) + " -104 L" + (324 + b * 42) + " -98 L" + (296 + b * 42) + " -98 Z", "#f4f1ea", { w: 1.4 }) + R(306 + b * 42, -110, 6, 3, "#e0662f", { s: 0 });
    // the hull: white, a dark boot-topping at the waterline, a row of portholes, the name at the bow
    var hull = "M14 -62 L522 -62 L524 -20 Q520 2 500 4 L48 4 Q30 2 22 -10 Z";
    g += P(hull, SHIPW, { w: 2.4 }) + '<clipPath id="' + id + '"><path d="' + hull + '"/></clipPath><g clip-path="url(#' + id + ')">' + R(0, -10, 540, 20, BOOT2, { s: 0 }) + R(0, -36, 540, 26, "#000", { s: 0, op: .08 }) + '</g>';
    for (var x5 = 70; x5 < 510; x5 += 13) g += Ci(x5, -26, 2.2, lit ? WIN2 : "#2a3442", { w: .6 });
    g += '<path d="M14 -62 H522" stroke="' + INK + '" stroke-width="3"/>';
    if (!o.noname) g += G("", txt("SALEM EXPRESS", 120, -42, 11, "#1c2a4a", { font: "Noto Serif", wt: 700, ls: .5 }));
    if (o.hole) g += P("M34 -12 L46 -24 L58 -14 L52 -4 L40 -2 Z", "#0a0e14", { w: 1.4 });
    // the bow visor: hinged at its top aft corner (60, -62); o.visor = degrees it is lifted
    var vis = P("M14 -62 L62 -62 L62 -12 L24 -12 Q16 -30 14 -62 Z", SHIPW, { w: 2.2 }) + R(14, -14, 48, 6, BOOT2, { s: 0, op: .9 });
    g += G("rotate(" + f(-(o.visor || 0)) + " 62 -62)", vis);
    if (o.lights !== false && lit) g += Ci(150, -226, 2.6, "#ff5a4a", { s: 0, op: .6 + .4 * Math.sin(t * 3) }) + Ci(520, -64, 2.4, "#ffffff", { s: 0 });
    return G("translate(" + f(o.x) + " " + f(o.y) + ") rotate(" + f(o.rot || 0) + ") scale(" + f2((o.s || 1) * (o.dir || 1)) + " " + f2(o.s || 1) + ")", g);
  }
  function shipAt(x, y, s, t, o) { return salem(Object.assign({ x: x - 268 * s, y: y + 1.4 * Math.sin(t * 1.3), s: s, t: t, rot: 1.2 * Math.sin(t * .9) }, o || {})); }
  function rain(t, n, op) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 520 + t * 120) % 520) - 80, y = ((hash(i * 7) * 760 + t * 520) % 760) - 60; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-6 16" stroke="#b8c8dc" stroke-width="1" opacity="' + f2(op || .35) + '"/>'; } return s; }
  function waves(t, wy, h) { var s = ""; for (var k = 0; k < 4; k++) { var d = "M-220 " + f(wy + k * 30); for (var x = -220; x <= 580; x += 12) d += " L" + x + " " + f(wy + k * 30 + (h || 8) * Math.sin(x * .03 + t * (1.4 + k * .3) + k)); s += '<path d="' + d + ' L580 900 L-220 900 Z" fill="' + ["#16284a", "#11213e", "#0c1a32", "#081428"][k] + '" stroke="#5a86b8" stroke-width="1" opacity=".95"/>'; } return s; }
  function stormNight(t, wy) { return sky("skyStar") + cloudBank(t, 80, 10, 6, "#1a2236", .9, 1.4) + cloudBank(t, 150, -8, 5, "#232c44", .8, 1.2) + (Math.sin(t * 1.7) > .97 ? R(-220, -220, 800, 1300, "#cfe0ff", { s: 0, op: .25 }) : ""); }
  // a reef just under the surface: coral heads and the white break of the waves on them
  function reef(x, y, s, t) { var g = ""; for (var i = 0; i < 9; i++) { var rx = (hash(i * 3) - .5) * 160, ry = hash(i * 5) * 20; g += P("M" + f(rx - 20) + " " + f(ry + 20) + " Q" + f(rx - 14) + " " + f(ry - 8) + " " + f(rx) + " " + f(ry - 12) + " Q" + f(rx + 14) + " " + f(ry - 8) + " " + f(rx + 20) + " " + f(ry + 20) + " Z", ["#8a7a5a", "#a08a62", "#7a6a4e"][i % 3], { w: 1.2 }); }
    for (var j = 0; j < 7; j++) { var p = (t * .5 + j / 7) % 1; g += '<path d="M' + f(-80 + j * 26) + ' ' + f(-4 + p * 6) + ' q8 -6 16 0" stroke="#fff" stroke-width="2" fill="none" opacity="' + f2(.8 * (1 - p)) + '"/>'; }
    return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g); }
  // people: pilgrims in white galabeyas, women in black with headscarves, all from the person kit
  var PILG = [{ outfit: "galabeya", colors: { hair: "#2a2018", skin: "#c98f66" } }, { outfit: "galabeya", colors: { hair: "#d8d4cc", skin: "#b98058" } }, { outfit: { base: "galabeya", hat: "hijab", colors: { coat: "#2a2a34", coatD: "#1a1a22", shirt: "#2a2a34", shirtD: "#1a1a22", hat: "#3a3a4a", hatD: "#22222c" } }, colors: { skin: "#d9a57a" } }, { outfit: "galabeya", colors: { hair: "#3a2a20", skin: "#a8724c", shirt: "#d8d0bc", coat: "#d8d0bc" } }, { outfit: { base: "galabeya", hat: "hijab", colors: { coat: "#3a2e3a", coatD: "#241c24", shirt: "#3a2e3a", shirtD: "#241c24", hat: "#5a4a5a", hatD: "#3a2e3a" } }, colors: { skin: "#c98f66" } }];
  function pil(i, o) { var b = PILG[i % PILG.length], p = Object.assign({ legs: "stand" }, b, o); p.colors = Object.assign({}, b.colors, o.colors || {}); return PERSON.front(p).svg; }
  function pilWalk(i, x, floor, s, ph, dir, o) { var b = PILG[i % PILG.length], p = Object.assign({ x: x, s: s, dir: dir || 1, lean: 3, outfit: b.outfit, colors: Object.assign({}, b.colors), head: { tilt: 2 * Math.sin(ph * 2) }, face: { eyes: 1, mouth: "smile" } }, PERSON.walkPose(ph, 1), o || {}); p.y = PERSON.sideHipY(p, floor); return PERSON.side(p).svg; }
  function bag(x, y, s, col) { return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", R(-16, -20, 32, 20, col || "#7a4a2a", { w: 1.4 }) + P("M-8 -20 Q0 -30 8 -20", "none", { w: 1.6 })); }
  function swimmerN(x, y, s, t, i, o) {   // a person in the night sea up to the chest
    o = o || {}; var b = PILG[i % PILG.length], p = Object.assign({}, b, { x: x, y: y + 60 * s, s: s, legs: "stand", breath: (Math.sin(t * 6 + i) + 1) / 2, head: { tilt: 6 * Math.sin(t * 2.4 + i) }, face: { eyes: 1.1, brows: "worried", mouth: i % 2 ? "open" : "o" }, arms: (function () { var w = 8 * Math.sin(t * 2.2 + i), v = 6 * Math.cos(t * 1.8 + i * 2);   // straight arms out of the water: calling for help, reaching
      var P3 = [[[-40 + w, -118], [42 - w, -116]], [[-34 + w, -122], [96, -70 + v]], [[-96, -66 + v], [36 - w, -120]], [[-88 + w, -84], [88 - w, -84]]][i % 4];
      return [{ rel: P3[0], hand: "open", bend: 1, straight: true, palm: true }, { rel: P3[1], hand: "open", bend: -1, straight: true, palm: true }]; })() }); p.colors = Object.assign({}, b.colors);
    var wl = y + 60 * s - 136 * s, cid = "sn" + (++CLIPN);
    return '<clipPath id="' + cid + '"><rect x="' + f(x - 300 * s) + '" y="' + f(wl - 600 * s) + '" width="' + f(600 * s) + '" height="' + f(600 * s) + '"/></clipPath><g clip-path="url(#' + cid + ')">' + PERSON.front(p).svg + '</g><ellipse cx="' + f(x) + '" cy="' + f(wl) + '" rx="' + f(60 * s) + '" ry="' + f(9 * s) + '" fill="none" stroke="#8ab0d8" stroke-width="' + f(2.4 * s) + '" opacity=".7"/>';
  }
  // ── the map: the Red Sea between Jeddah and Safaga, real coastlines ──
  var JED = [39.17, 21.49], SAF = [33.94, 26.74], DUB = [35.69, 27.35], WRK = [34.0633, 26.6503];
  var ROUTE = [[39.10, 21.52], [38.6, 22.1], [37.7, 23.3], [36.7, 24.6], [35.6, 25.7], [34.6, 26.35], [34.2, 26.58], WRK];
  var MG = {};
  function mapAt(key, cx, cy, sc, lon, lat) { return MG[key] || (MG[key] = GEO.globe(cx, cy, sc, lon, lat)); }
  function wideMap() { return mapAt("w", 180, 270, 2600, 36.5, 24.2); }
  function zoomMap() { return mapAt("z", 180, 280, 52000, 34.08, 26.66); }
  function seaChart(t, g, o) {
    o = o || {}; var s = R(-300, -300, 960, 1300, "#12406a", { s: 0 });
    for (var i = 0; i < 16; i++) s += '<path d="M' + f(-60 + ((i * 97 + t * 6) % 480)) + ' ' + (40 + i * 36) + ' q6 -4 12 0 t12 0" stroke="#4a86b8" stroke-width="1.2" fill="none" opacity=".55"/>';
    s += '<path d="' + g.land + '" fill="#d8bf8a" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
    return s;
  }
  function routeD(g, pts, k) { var P2 = pts.map(function (p) { return g.project(p); }), n = (P2.length - 1) * clamp(k), i = Math.floor(n), fr = n - i, d = "M" + f(P2[0][0]) + " " + f(P2[0][1]); for (var j = 1; j <= i; j++) d += " L" + f(P2[j][0]) + " " + f(P2[j][1]); var end = i < P2.length - 1 ? [lerp(P2[i][0], P2[i + 1][0], fr), lerp(P2[i][1], P2[i + 1][1], fr)] : P2[P2.length - 1]; if (i < P2.length - 1) d += " L" + f(end[0]) + " " + f(end[1]); return { d: d, end: end }; }
  function routeLine(g, pts, k, col, o) { o = o || {}; var r = routeD(g, pts, k); return '<path d="' + r.d + '" stroke="' + INK + '" stroke-width="' + ((o.w || 4) + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/><path d="' + r.d + '" stroke="' + col + '" stroke-width="' + (o.w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>' + (o.ship ? miniShip2(r.end, o.t || 0) : ""); }
  function miniShip2(p, t) { return salem({ x: p[0] - 268 * .07, y: p[1] + 4, s: .07, t: t }) + '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(12 + 3 * Math.sin(t * 3)) + '" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>'; }
  function cityPin(g, ll, name, dx, dy, k) { var p = g.project(ll); return pin(p, name, dx, dy, k); }
  function countryLabel(g, ll, name, k) { var p = g.project(ll); return txt(name, p[0], p[1], 18, "#5a4422", { op: clamp(k), wt: 900 }); }
  function wide(t, o) { o = o || {}; var g = wideMap(), s = seaChart(t, g); s += countryLabel(g, [31.6, 25.4], "مصر", 1) + countryLabel(g, [40.6, 24.6], "السعودية", 1) + G("translate(0 0)", txt("البحر الأحمر", g.project([37.4, 22.6])[0], g.project([37.4, 22.6])[1], 13, "#bfe0ff", { op: .8 })); s += cityPin(g, JED, "جدة", 0, 22, 1) + cityPin(g, SAF, "سفاجا", -6, -14, 1) + (o.duba ? cityPin(g, DUB, "ضبا", 10, -12, 1) : ""); return { g: g, s: s }; }
  function zoomed(t) { var g = zoomMap(), s = seaChart(t, g); var w = g.project(WRK), sf = g.project(SAF); s += pin(sf, "سفاجا", -24, 6, 1); var reefs = [[34.075, 26.635], [34.09, 26.66], [34.05, 26.66], [34.11, 26.62], [34.04, 26.63]]; reefs.forEach(function (r, i) { var p = g.project(r); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(22 + hash(i) * 14) + '" ry="' + f(10 + hash(i + 2) * 6) + '" fill="#4ab0b0" stroke="#e8f4f0" stroke-width="1.6" stroke-dasharray="3 3" opacity=".85"/>'; }); return { g: g, s: s, w: w }; }
  var NORMAL = [[34.35, 26.35], [34.25, 26.52], [34.16, 26.62], [34.13, 26.70], [34.02, 26.75], SAF], SHORT = [[34.35, 26.35], [34.2, 26.5], [34.1, 26.6], WRK];
  function recS(t, y, src) { var b = ""; y = y || 70; for (var i = 0; i < 24; i++) { var h = 4 + 20 * Math.abs(Math.sin(t * (5 + hash(i) * 6) + i)); b += '<rect x="' + (72 + i * 9) + '" y="' + f(y + 30 - h / 2) + '" width="5" height="' + f(h) + '" fill="' + ORANGE + '"/>'; }
    return '<rect x="40" y="' + (y - 18) + '" width="280" height="66" rx="8" fill="#0b0f18" opacity=".82"/><circle cx="300" cy="' + (y - 1) + '" r="5" fill="#e23a2a" opacity="' + (Math.sin(t * 6) > 0 ? 1 : .3) + '"/>' + txt(src, 288, y + 4, 12, "#fff", { a: "start" }) + b; }
  var SURV = "شهادة حقيقية · محمود عبد العزيز، من الناجين";
  // under the sea: the blue water column, light from above, the wreck on its starboard side, fish, a diver
  function underSea(t) { return R(-220, -220, 800, 1300, "url(#deepSea)", { s: 0 }) + rays(t, 200, -60, 1.6, 6, 600, .14) + dust(t, 50, "#bfe2ff", .5, 7) + R(-220, 470, 800, 400, "#c8b48a", { w: 1.6 }) + P("M-220 470 Q0 450 180 468 T580 462 L580 480 L-220 480 Z", "#a8946a", { s: 0 }); }
  function wreckSide(x, y, s, t) { var g = salem({ x: -270, y: 0, s: 1, t: t, rot: -5, visor: 8, noname: 0 }); for (var i = 0; i < 26; i++) { var cx = -250 + hash(i * 3) * 500, cy = -hash(i * 7) * 150 - 10; g += Ci(cx, cy, 3 + hash(i) * 8, ["#c86a4a", "#e8a04a", "#8ac07a", "#b84a7a"][i % 4], { w: .8, op: .9 }); } g += R(-320, -260, 640, 280, "#0e4a72", { s: 0, op: .45 }) + P("M-320 0 Q0 -20 320 4 L320 60 L-320 60 Z", "#c8b48a", { w: 1.4 }); return G("translate(" + f(x) + " " + f(y) + ") scale(" + f2(s) + ")", g); }
  function fish(t, n, y0) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 600 + t * (14 + hash(i + 3) * 20)) % 600) - 120, y = y0 + hash(i * 5) * 200 + 6 * Math.sin(t * 2 + i); s += G("translate(" + f(x) + " " + f(y) + ")", P("M0 0 Q8 -5 16 0 Q8 5 0 0 Z M0 0 L-6 -4 L-6 4 Z", i % 2 ? "#f2c230" : "#e8eef2", { w: .8 })); } return s; }
  function diver(x, y, s, t) { var o = { x: x, y: y, s: s, rot: -80, dir: 1, outfit: { base: "casual", colors: { shirt: "#1a1c22", shirtD: "#0e1014", pants: "#1a1c22", pantsD: "#0e1014", shoes: "#2a6ab0" } }, colors: { hair: "#1a1c22", skin: "#d9a57a" }, legs: [{ hip: 10 + 14 * Math.sin(t * 3), knee: 10 }, { hip: -10 - 14 * Math.sin(t * 3), knee: 10 }], arms: [{ sh: 70, el: 10, hand: "open" }, { sh: 60, el: 20, hand: "open" }], face: { eyes: 1 } }; return PERSON.side(o).svg + G("translate(" + f(x) + " " + f(y) + ") rotate(-80) scale(" + f2(s) + ")", R(-60, -190, 26, 90, "#c8c8d0", { w: 1.6 })) + (function () { var b = ""; for (var i = 0; i < 6; i++) { var p = (t * .8 + i / 6) % 1; b += Ci(x + 50 * s + Math.sin(t + i) * 4, y - 40 * s - p * 140, 2 + p * 4, "none", { w: 1, op: 1 - p }).replace('stroke="' + INK + '"', 'stroke="#dff2ff"'); } return b; })(); }

  // ── the shots ──
  // 0 · the survivor's real voice; the ship in the storm, already listing
  shot(0, push([180, 330], [180, 336], 1.0, 1.08), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .55, t, { lit: 1, rot: 8 + 1.5 * Math.sin(t * 1.2) }) + waves(t, 400, 9) + rain(t, 80, .35) + recS(t, 66, SURV); }, { foot: "mdark", fw: 250, fy: 130, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 1 · it is real: the photograph of the survivors
  shot(1, push([180, 330], [180, 320], 1.05, 1.12), function (u, d, t) { return stormNight(t, 400) + waves(t, 420, 6) + rain(t, 40, .25); }, { foot: "photo", fw: 290, fy: 140, cap: "صورة حقيقية · ناجين من سالم إكسبريس" });
  // 2 · the night of 14 December 1991, the Red Sea
  shot(2, push([180, 320], [190, 330], 1.0, 1.1), function (u, d, t) { return night(t, 400) + shipAt(lerp(250, 170, u / d), 400, .5, t, { lit: 1, smoke: 1 }) + seaFront(t, 401, .55) + label("14 ديسمبر 1991", 180, 170, u, .3, 30, "#fff") + label("البحر الأحمر", 180, 208, u, .8, 20, YEL); });
  // 3 · Jeddah to Safaga, more than 600 people
  shot(3, push([180, 280], [180, 270], 1.0, 1.06), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE.concat([SAF]), clamp(u / d) * .5, YEL, { dash: "6 6", w: 3, ship: 1, t: t }) + bigNum("+600", 180, 120, u, D(3) * .45, 46, "#fff") + label("إنسان", 180, 150, u, D(3) * .6, 18, YEL); });
  // 4 · mostly Egyptian pilgrims going home
  shot(4, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { var s = night(t, 360) + seaFront(t, 361, .5) + R(-220, 380, 800, 400, "url(#wood)", { s: 0 }); for (var i = 0; i < 5; i++) s += pil(i, { x: 30 + i * 75, y: 470 - (i % 2) * 14, s: .55, breath: (Math.sin(t * 2 + i) + 1) / 2, head: { turn: (hash(i) - .5) * .8, tilt: 3 * Math.sin(t + i) }, face: { eyes: blink(t, 1, i), mouth: "smile" }, arms: [{ rel: [-20, 120], hand: "relaxed", bend: 1 }, { rel: [20, 120], hand: "relaxed", bend: -1 }] }) + bag(48 + i * 75, 490, .9, ["#7a4a2a", "#3a5a7a", "#8a3a34", "#5a6a4a", "#7a6a50"][i]); return s + label("حجاج راجعين بيوتهم", 180, 160, u, .5, 22, "#fff"); });
  // 5 · about 800 km… and it sank 15 km before the port
  shot(5, push([170, 270], [120, 190], 1.0, 1.5), function (u, d, t) { var w = wide(t), g = w.g, k = clamp(u / (D(5) * .55)); var s = w.s + routeLine(g, ROUTE, k, YEL, { w: 3, ship: k < 1, t: t }); if (k >= 1) { var p = g.project(WRK); s += xmark(p[0], p[1], .7, (u - D(5) * .55) / .4) + label("15 كم", p[0] + 20, p[1] + 26, u, D(5) * .7, 14, "#fff"); } return s + label("~800 كم", 210, 330, u, .6, 22, YEL); });
  // 6 · under 20 minutes, with the shore in sight
  shot(6, push([180, 320], [180, 310], 1.0, 1.1), function (u, d, t) { return R(-220, -220, 800, 1300, "#0c1426", { s: 0 }) + dust(t, 40, "#9fc4e6", .4, 3) + watch(180, 270, 80, t, { h: 11.22, sec: u * 6 * 20 }) + label("أقل من 20 دقيقة", 180, 420, u, .5, 26, YEL); });
  // 7 · why are the pilgrims' things still inside? (real 2020 dive)
  shot(7, push([180, 330], [180, 320], 1.0, 1.08), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 10, 200); }, { foot: "bags20", cap: "فيديو حقيقي · جوه العبّارة، 2020" });
  // 8 · from Jeddah: the port at dusk, the ship at the quay
  shot(8, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyDusk") + cloudBank(t, 140, 3, 4, "#f6b070", .5) + R(-220, 380, 800, 500, "url(#seaDawn)", { s: 0 }) + R(-220, 380, 800, 30, "#6a6a70", { w: 1.6 }); for (var c = 0; c < 3; c++) s += crane(-10 + c * 150, 380, .8, "#c86a2a", t); return s + shipAt(200, 420, .6, t, { lit: 1, smoke: 1 }) + label("جدة", 180, 150, u, .4, 34, "#fff"); });
  // 9 · built in France in the 1960s as the Fred Scamaroni (the real photograph)
  shot(9, push([180, 340], [190, 340], 1.0, 1.06), function (u, d, t) { return sky("skyMorning") + R(-220, 420, 800, 500, "url(#river)", { s: 0 }) + glints(t, 420, 30, "#e4eef6") + shipAt(180, 440, .62, t, { smoke: 1 }) + photoCard("scamaroni-1966.jpg", 180, 210, 270, 161, -2, (u - .3) / .5, "صورة حقيقية · «فريد سكاماروني»، مرسيليا 1966"); });
  // 10 · a big bow door that lifts up for the cars
  shot(10, push([110, 360], [100, 350], 1.9, 2.1), function (u, d, t) { var v = 40 * ease(clamp((u - .6) / 1.6)), s = sky("skyMorning") + R(-220, 400, 800, 500, "url(#river)", { s: 0 }) + salem({ x: 20, y: 400, s: .9, t: t, visor: v }); for (var c = 0; c < 3; c++) { var cx = lerp(-60, 30, clamp((u - 1.6 - c * .5) / 1.4)); s += G("translate(" + f(cx) + " 392) scale(.7)", R(-24, -16, 48, 16, ["#8a3a2e", "#3a5a7a", "#c9b48a"][c], { w: 1.4 }) + R(-14, -26, 28, 11, "#2a3442", { w: 1 }) + Ci(-14, 0, 5, "#1a1c20", {}) + Ci(14, 0, 5, "#1a1c20", {})); } return s + label("الباب الكبير", 110, 230, u, .8, 18, YEL); });
  // 11 · remember this door
  shot(11, push([90, 330], [90, 330], 2.3, 2.5), function (u, d, t) { var s = sky("skyMorning") + R(-220, 400, 800, 500, "url(#river)", { s: 0 }) + salem({ x: 20, y: 400, s: .9, t: t, visor: 40 }); for (var q = 0; q < 3; q++) { var p = (t * .8 + q / 3) % 1; s += '<circle cx="54" cy="370" r="' + f(16 + p * 50) + '" fill="none" stroke="' + YEL + '" stroke-width="2" opacity="' + f2(1 - p) + '"/>'; } return s + label("افتكروا الباب ده", 90, 270, u, .1, 14, YEL); });
  // 12 · the pilgrims boarding with their bags and gifts
  shot(12, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { var s = sky("skyDusk") + R(-220, 380, 800, 500, "url(#seaDawn)", { s: 0 }) + shipAt(240, 380, .55, t, { lit: 1 }) + R(-220, 440, 800, 200, "#8a8478", { w: 1.6 }); for (var i = 0; i < 4; i++) { var x = ((u * 40 + i * 110) % 460) - 60; s += pilWalk(i, x, 470, .45, u * 6 + i, 1) + bag(x + 22, 452, .7, ["#7a4a2a", "#3a5a7a", "#8a3a34", "#5a6a4a"][i]); } return s + label("مصاحف · سجاجيد · راديوهات · شرايط", 180, 150, u, .8, 15, YEL); });
  // 13 · the ship sails for Safaga
  shot(13, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { return sky("skyDusk") + cloudBank(t, 150, 4, 4, "#f6b070", .5) + R(-220, 420, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 420, 30, "#f6d8b0") + shipAt(lerp(260, 130, u / d), 440, .55, t, { lit: 1, smoke: 1 }); });
  // 14 · let's see the route from above
  shot(14, push([180, 270], [180, 270], 1.3, 1.0), function (u, d, t) { return wide(t).s; });
  // 15 · north from Jeddah, between Saudi Arabia and Egypt
  shot(15, push([200, 290], [190, 270], 1.0, 1.02), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE, clamp(u / d) * .5, YEL, { w: 3, ship: 1, t: t }); });
  // 16 · about 800 km: the Saudi shore falls away to the right, the Egyptian one comes closer on the left
  shot(16, push([180, 270], [150, 230], 1.02, 1.15), function (u, d, t) { var w = wide(t); return w.s + routeLine(w.g, ROUTE, .5 + clamp(u / d) * .42, YEL, { w: 3, ship: 1, t: t }) + label("~800 كم", 240, 300, u, .5, 22, YEL); });
  // 17 · near Safaga, reefs just under the surface (the map zooms in)
  shot(17, push([180, 280], [180, 280], 1.0, 1.1), function (u, d, t) { var z = zoomed(t); return z.s + label("شعاب مرجانية", 230, 360, u, D(17) * .5, 18, YEL); });
  // 18 · the weather turned that night: wind, high waves
  shot(18, push([180, 330], [180, 340], 1.1, 1.2), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .6, t, { lit: 1, rot: 4 * Math.sin(t * 1.1) }) + waves(t, 398, 12) + rain(t, 120, .45); });
  // 19 · the normal way goes round the reefs
  shot(19, push([180, 280], [180, 280], 1.1, 1.12), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, NORMAL, clamp(u / (d * .8)), "#4ac06a", { w: 3, dash: "7 5" }) + label("الطريق الطبيعي", 280, 200, u, .5, 15, "#4ac06a"); });
  // 20 · the captain took a shortcut close to the reefs
  shot(20, push([180, 280], [170, 290], 1.12, 1.3), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, NORMAL, 1, "#4ac06a", { w: 2, dash: "7 5" }) + routeLine(z.g, SHORT, clamp(u / (d * .85)), "#e23a2a", { w: 3.4, ship: 1, t: t }) + label("طريق مختصر", 120, 200, u, D(20) * .4, 18, "#ff6a4a") + label("القبطان حسن مورو", 180, 120, u, .3, 15, "#fff"); });
  // 21 · a route closed to big ships at night
  shot(21, push([170, 290], [170, 290], 1.3, 1.35), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, SHORT, 1, "#e23a2a", { w: 3.4 }) + label("ممنوع بالليل", 180, 150, u, .4, 22, "#ff6a4a") + G("translate(180 210)", Ci(0, 0, 24, "#e23a2a", { w: 2 }) + R(-14, -4, 28, 8, "#fff", { s: 0 })); });
  // 22 · 11:13 pm, 15 km from Safaga: the ship heading into the reef
  shot(22, push([180, 330], [200, 340], 1.0, 1.15), function (u, d, t) { return stormNight(t, 380) + shipAt(lerp(120, 220, u / d), 400, .55, t, { lit: 1 }) + waves(t, 398, 9) + reef(330, 410, 1, t) + rain(t, 90, .4) + label("11:13 بالليل", 180, 150, u, .3, 30, "#fff") + label("15 كم من سفاجا", 180, 186, u, D(22) * .5, 16, YEL); });
  // 23 · the survivor: "the moment it hit the coral…" (the impact, synced to his voice)
  shot(23, push([220, 350], [230, 360], 1.15, 1.25), function (u, d, t) { var j = u > .6 && u < 1.6 ? 4 * Math.sin(t * 60) * (1.6 - u) : 0; return stormNight(t, 380) + G("translate(" + f(j) + " 0)", shipAt(250, 400, .55, t, { lit: u < 2.4 || Math.sin(t * 20) > 0, rot: u > .6 ? 3 : 0, hole: u > .6 })) + waves(t, 398, 9) + reef(330, 410, 1, t) + rain(t, 90, .4) + recS(t, 66, SURV); }, { foot: "mreef", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 24 · that's Mahmoud Abdel Aziz, on the ferry that night
  shot(24, push([180, 330], [180, 330], 1.0, 1.06), function (u, d, t) { return stormNight(t, 400) + waves(t, 420, 8) + rain(t, 50, .3) + label("محمود عبد العزيز", 180, 420, u, .5, 22, YEL); }, { foot: "photo", fw: 290, fy: 130, cap: "صورة حقيقية · ناجين من سالم إكسبريس" });
  // 25 · the rock tore a hole in the bow, the blow forced the bow door open
  shot(25, push([80, 360], [70, 360], 2.2, 2.5), function (u, d, t) { var v = 26 * ease(clamp((u - D(25) * .45) / .8)), s = stormNight(t, 380) + salem({ x: 20, y: 400, s: .9, t: t, lit: 1, visor: v, hole: 1 }) + waves(t, 396, 8); for (var i = 0; i < 16; i++) { var p = (t * 1.6 + i / 16) % 1; s += Ci(60 - p * 40 + hash(i) * 10, 392 - (1 - p) * 20, 2 + hash(i) * 3, "#cfe6ff", { s: 0, op: .8 * (1 - p) }); } return s + label("خرم", 60, 300, u, .5, 16, "#ff6a4a") + label("والباب اتفتح", 90, 270, u, D(25) * .6, 16, YEL); });
  // 26 · the water into the car deck, and the lights went out
  shot(26, push([180, 336], [180, 340], 1.5, 1.35), function (u, d, t) { var k = clamp((u - D(26) * .55) / .3); return cutScene(t, .78, { water: lerp(.2, .6, clamp(u / d)), list: lerp(2, 8, clamp(u / d)), hlW: 1 }) + R(-220, -220, 800, 1300, "#02040a", { s: 0, op: .82 * k }) + label("النور قطع", 180, 160, u, D(26) * .6, 24, "#fff"); });
  // 27 · imagine: the dark, the floor tilting under your feet
  shot(27, push([180, 330], [180, 320], 1.05, 1.2), function (u, d, t) { var tl = lerp(6, 14, clamp(u / d)), inner = ""; for (var i = 0; i < 4; i++) inner += pil(i, { x: 40 + i * 90, y: 500, s: .6, breath: (Math.sin(t * 5 + i) + 1) / 2, lean: -tl * .6, head: { turn: (hash(i) - .5) * 1.2, tilt: -6 }, face: { eyes: 1.25, brows: "worried", mouth: i % 2 ? "open" : "o" }, arms: [{ rel: [-60, 40], hand: "open", bend: 1 }, { rel: [60, 30], hand: "open", bend: -1 }] }); return deckN(t, tl, inner) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .45 }) + rain(t, 60, .3); });
  // 28 · the survivor: the women, the men, a mother with two children (synced)
  shot(28, push([180, 330], [180, 330], 1.1, 1.15), function (u, d, t) { var tl = 14 + 3 * clamp(u / d), inner = ""; for (var i = 0; i < 3; i++) inner += pil(i + 2, { x: 60 + i * 120, y: 510, s: .6, lean: -tl * .6, head: { tilt: -8 }, face: { eyes: 1.25, brows: "worried", mouth: "open" }, arms: [{ rel: [-40, -40], hand: "open", bend: 1 }, { rel: [40, -50], hand: "open", bend: -1 }] }); return deckN(t, tl, inner) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .5 }) + recS(t, 66, SURV); }, { foot: "mwomen", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 29 · the ship leaning onto her starboard side, fast
  shot(29, push([180, 336], [180, 340], 1.3, 1.25), function (u, d, t) { return cutScene(t, .78, { water: .9, list: lerp(10, 24, clamp(u / d)), hlW: 1, slide: .3 }) + label("بتميل… بسرعة", 180, 160, u, .5, 22, "#ff6a4a"); });
  // 30 · and at that moment… (the cliffhanger frame)
  shot(30, push([180, 334], [180, 336], 1.3, 1.36), function (u, d, t) { return cutScene(t, .78, { water: 1, list: 26 + 1 * Math.sin(t * 1.3), hlW: 1, slide: .4 }); });
  // 31 · the bio line: the same frame, still creeping, and the pill
  shot(31, push([180, 336], [180, 338], 1.36, 1.42), function (u, d, t) { return cutScene(t, .78, { water: 1, list: 26 + 1 * Math.sin(t * 1.3), hlW: 1, slide: .4 }); }, { pill: 1 });
  // 32 · back to the ferry
  shot(32, push([180, 330], [180, 330], 1.0, 1.05), function (u, d, t) { return stormNight(t, 380) + shipAt(180, 400, .55, t, { lit: 0, rot: 18 + Math.sin(t) }) + waves(t, 400, 10) + rain(t, 90, .4); });
  // 33 · in under twenty minutes she rolled onto her side… and went down
  shot(33, push([180, 334], [180, 380], 1.2, 1.0), function (u, d, t) { var k = ease((u - D(33) * .25) / 2.0), k2 = clamp((u - D(33) * .25 - 1.4) / 2.4); return night(t, WY) + cutS(180 + 26 * k, WY + 20 * k + 250 * k2, .62, t, { water: 1, list: lerp(26, 90, k), hlW: 1, slide: .5 }) + seaFront(t, WY, .7) + rain(t, 60, .3); });
  // 34 · many were asleep in the cabins
  shot(34, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { var s = R(-220, -220, 800, 1300, "#141a26", { s: 0 }) + R(40, 200, 280, 260, "#2a3040", { w: 2 }) + R(60, 220, 240, 70, "#3a4256", { w: 1.6 }) + R(60, 330, 240, 70, "#3a4256", { w: 1.6 }); s += PERSON.side({ x: 180, y: 275, s: .45, rot: -90, outfit: "galabeya", colors: { hair: "#2a2018", skin: "#c98f66" }, face: { eyes: 0 } }).svg; s += R(60, 290, 240, 8, "#c9c3b4", { w: 1 }); return s + R(-220, lerp(560, 330, clamp(u / d)), 800, 400, "#1f4a7a", { s: 0, op: .75 }) + R(-220, -220, 800, 1300, "#000", { s: 0, op: .3 }); });
  // 35 · the survivor: "the waves… death among the people, one after another" (synced)
  shot(35, push([180, 330], [180, 330], 1.05, 1.1), function (u, d, t) { var s = stormNight(t, 330) + waves(t, 340, 10); for (var i = 0; i < 4; i++) s += swimmerN(60 + i * 80, 420 + (i % 2) * 30, .28, t, i); return s + rain(t, 70, .35) + recS(t, 66, SURV); }, { foot: "mwaves", fw: 230, fy: 128, rot: 0, sync: 1, cap: "فيديو حقيقي · محمود عبد العزيز بيحكي" });
  // 36 · people in the water, in the dark and the waves, swimming for the shore
  shot(36, push([180, 340], [180, 330], 1.0, 1.08), function (u, d, t) { var s = stormNight(t, 300) + R(-220, 290, 800, 20, "#1a1c22", { s: 0 }); for (var l = 0; l < 8; l++) s += Ci(30 + l * 44, 298, 1.8, "#ffd98a", { s: 0, op: .6 + .4 * Math.sin(t * 2 + l) }); s += waves(t, 310, 9); for (var i = 0; i < 5; i++) s += swimmerN(40 + i * 70, 380 + (i % 3) * 40, .3, t, i); return s + label("الشط", 180, 280, u, .6, 14, YEL); });
  // 37 · morning: fishermen and rescuers find survivors, and many dead
  shot(37, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return sky("skyDawnT") + R(-220, 400, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 400, 30, "#f6d8b0") + G("translate(150 420) scale(.5)", raft(0, 0, t)) + G("translate(" + f(lerp(380, 260, u / d)) + " 412)", P("M-40 0 L-34 -12 L36 -12 L44 0 Z", "#2a5a8a", { w: 1.6 }) + R(-10, -24, 18, 12, "#e8e4d8", { w: 1.2 })) + vests(t, 410, 4); });
  // 38 · the official number: 470
  shot(38, push([180, 320], [180, 330], 1.0, 1.12), function (u, d, t) { return night(t, 380) + seaFront(t, 381, .5) + bigNum("470", 180, 220, u, .5, 70, "#fff") + label("الرقم الرسمي", 180, 266, u, 1, 20, YEL); });
  // 39 · but many say the real number is far higher
  shot(39, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { var s = night(t, 380) + seaFront(t, 381, .5) + G("translate(180 250) rotate(-3)", R(-90, -110, 180, 220, "#f4ecdb", { w: 1.6 }) + txt("كشف الركاب", 0, -82, 15, INK, { wt: 900 })); for (var i = 0; i < 9; i++) s += G("translate(180 250) rotate(-3)", '<path d="M-70 ' + (-56 + i * 18) + ' h140" stroke="#8a8a90" stroke-width="1.4"/>'); return s + label("+470 ؟", 180, 420, u, D(39) * .5, 30, "#ff6a4a"); });
  // 40 · back to the map: she sank here
  shot(40, push([180, 270], [130, 200], 1.0, 1.5), function (u, d, t) { var w = wide(t, { duba: 1 }), g = w.g, p = g.project(WRK); return w.s + routeLine(g, ROUTE, 1, YEL, { w: 3 }) + xmark(p[0], p[1], .7, 1) + label("هنا", p[0] + 26, p[1] + 6, u, .6, 16, "#fff"); });
  // 41 · 15 km from Safaga… about 180 km from the nearest Saudi shore
  shot(41, push([140, 210], [150, 220], 1.5, 1.45), function (u, d, t) { var w = wide(t, { duba: 1 }), g = w.g, p = g.project(WRK), sa = g.project(SAF), db = g.project(DUB); return w.s + xmark(p[0], p[1], .7, 1) + '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(sa[0]) + ' ' + f(sa[1]) + '" stroke="#fff" stroke-width="3"/>' + label("15 كم", p[0] - 10, p[1] + 22, u, .4, 13, "#fff") + routeLine(g, [WRK, DUB], clamp((u - D(41) * .45) / 1), "#f2c230", { w: 2.4, dash: "6 5" }) + label("~180 كم", (p[0] + db[0]) / 2 + 20, (p[1] + db[1]) / 2 + 10, u, D(41) * .6, 15, YEL); });
  // 42 · a month later, a diver went down and filmed (the real January 1992 video)
  shot(42, push([180, 340], [180, 330], 1.0, 1.08), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + diver(lerp(320, 220, u / d), 380, .3, t) + fish(t, 8, 240); }, { foot: "name92", cap: "فيديو حقيقي · غطاس، يناير 1992" });
  // 43 · the name still on her side, the pilgrims' bags in place
  shot(43, push([180, 330], [180, 330], 1.05, 1.1), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 8, 240); }, { foot: "bags92", cap: "فيديو حقيقي · شنط الحجاج، يناير 1992" });
  // 44 · to this day she lies on her side, about 30 m down
  shot(44, push([180, 330], [180, 350], 1.0, 1.1), function (u, d, t) { return underSea(t) + G("translate(0 0)", cutS(170, 420, .5, t, { list: 90, water: 1, hlW: 1, slide: .6 })) + R(-220, 300, 800, 300, "#0e4a72", { s: 0, op: .35 }) + R(-220, 462, 800, 200, "#c8b48a", { w: 1.4 }) + fish(t, 12, 200) + G("translate(320 150)", R(-1, 0, 2, 300, "#fff", { s: 0, op: .5 }) + txt("0 م", -6, 4, 11, "#fff", { a: "end" }) + txt("30 م", -6, 300, 14, YEL, { a: "end" })) + label("~30 متر", 260, 300, u, .6, 18, YEL); }, { foot: "wreck20", cap: "فيديو حقيقي · العبّارة النهارده" });
  // 45 · one of the best-known dive sites; bags, clothes and radios inside
  shot(45, push([180, 330], [180, 330], 1.0, 1.06), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + diver(lerp(340, 240, u / d), 360, .3, t) + diver(lerp(400, 300, u / d), 300, .26, t + 1) + fish(t, 10, 220); }, { foot: "radio20", cap: "فيديو حقيقي · راديو جوه العبّارة، 2020" });
  // 46 · many say it should be left alone: it is a grave
  shot(46, push([180, 330], [180, 320], 1.0, 1.05), function (u, d, t) { return underSea(t) + wreckSide(180, 470, .6, t) + fish(t, 6, 220) + R(-220, -220, 800, 1300, "#020812", { s: 0, op: .3 }) + label("مقبرة", 180, 420, u, D(46) * .4, 26, "#fff"); }, { foot: "clothes20", cap: "فيديو حقيقي · هدوم جوه العبّارة، 2020" });
  // 47 · the shortcut, banned for all big ships afterwards
  shot(47, push([170, 280], [170, 280], 1.2, 1.25), function (u, d, t) { var z = zoomed(t); return z.s + routeLine(z.g, SHORT, 1, "#e23a2a", { w: 3.4 }) + xmark(z.w[0], z.w[1] - 40, 1.2, (u - .6) / .5) + routeLine(z.g, NORMAL, 1, "#4ac06a", { w: 2.4, dash: "7 5" }) + label("اتمنع", 180, 150, u, D(47) * .5, 26, "#ff6a4a"); });
  // 48 · the same bow door, three years later, sank the Estonia in the Baltic
  shot(48, push([100, 340], [110, 340], 1.9, 2.1), function (u, d, t) { var s = sky("skyStar") + cloudBank(t, 90, 10, 6, "#1a2236", .9, 1.4) + salem({ x: 20, y: 400, s: .9, t: t, lit: 1, noname: 1, visor: lerp(0, 70, ease(clamp((u - 1) / 1.2))) }) + waves(t, 396, 12) + rain(t, 100, .45); return s + label("إستونيا · بحر البلطيق · 1994", 110, 230, u, .4, 13, YEL); });
  // 49 · fifteen years later, Al-Salam 98, in the same sea, with pilgrims again
  shot(49, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, 400) + ferryN(lerp(250, 170, u / d), 400, .5, t) + seaFront(t, 401, .55) + label("عبّارة السلام 98 · 2006", 180, 180, u, .6, 20, YEL); });
  // 50 · the call to comment: dawn over the Red Sea, the Safaga shore
  shot(50, push([180, 330], [180, 320], 1.0, 1.06), function (u, d, t) { return sky("skyDawnT") + mountains(392, ["#8a6a5a", "#6a5048", "#4a3a3a"]) + R(-220, 400, 800, 500, "url(#seaDawn)", { s: 0 }) + glints(t, 400, 40, "#f6d8b0") + G("translate(200 430)", R(-3, -26, 6, 26, "#e23a2a", { w: 1.2 }) + Ci(0, 0, 8, "#f2c230", { w: 1.2 })); });
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 8) ? .9 : 0; };

  // the "link in bio" pill on the bio line, the chip on the opening lines, the real-footage cards
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 2 && i <= 8) ? .9 : 0; };
  window.__foot = function (t) {
    var i = at(t), sh = SH[i], o = sh.o; if (!o.foot) return null; var u = t - sh.a, n = FOOT[o.foot], idx = o.sync ? Math.min(n - 1, Math.max(0, Math.floor((u - .25) * 6))) : Math.floor(u * 6) % n, k = sh.i === 0 ? 1 : o.sync ? clamp(u / .25) : clamp((u - .4) / .5), w = o.fw || 268;
    return { key: o.foot + (idx + 1), x: (360 - w) / 2, y: o.fy || 104, w: w, rot: o.rot == null ? -2 : o.rot, op: k, cap: o.cap || "فيديو حقيقي · نشرة أخبار CBS" };
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
