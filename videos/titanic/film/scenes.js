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

  // ── «تيتانيك» in the «القصة 2D» look. Shapes from the 1912 photograph of the ship leaving Southampton (black hull,
  //    white upperworks, four raked buff funnels with black tops, two tall masts, white lifeboats on the boat deck) and
  //    Willy Stöwer's 1912 painting of the sinking (stern high, boats and icebergs around). See ../refs/SOURCES.md. ──
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
  var NAVY = "#1c2440", SK = ["#e0b48c", "#d9a57a", "#e8c0a0", "#c98f66"];
  function stars(t, n, h) { var s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(hash(i + 3) * (h || 300) - 40) + '" r="' + f(.5 + hash(i + 1) * 1.1) + '" fill="#fff" opacity="' + f2(.35 + .5 * Math.abs(Math.sin(t * (1 + hash(i)) + i))) + '"/>'; return s; }
  function night(t, wy, o) { o = o || {}; var s = sky("skyStar") + stars(t, 90, wy) + R(-220, wy, 800, 700, "url(#seaNight)", { s: 0 }); for (var i = 0; i < 44; i++) { var x = ((hash(i) * 800 + t * (14 + hash(i + 7) * 22)) % 800) - 220; s += '<path d="M' + f(x) + ' ' + f(wy + 8 + hash(i + 2) * 230) + ' h' + f(14 + hash(i + 5) * 26) + '" stroke="#a8c0e6" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function iceberg(x, y, s, o) { o = o || {}; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', P('M-60 0 L-44 -30 L-30 -24 L-14 -70 L4 -52 L18 -84 L34 -40 L50 -46 L64 0 Z', o.dark ? "#3a4a66" : "url(#ice)", { w: 1.6 }) + P('M-14 -70 L-6 -20 L4 -52 Z M18 -84 L22 -30 L34 -40 Z', o.dark ? "#2a364e" : "#8ab0cc", { s: 0, op: .7 }) + '<ellipse cx="0" cy="2" rx="70" ry="5" fill="#cfe6f4" opacity=".25"/>'); }
  // the ship, side view, bow to the right, 300 long at s=1, origin on the waterline amidships
  function ship(x, y, s, t, o) {
    o = o || {}; var lit = o.lit !== false, win = lit ? "#ffd98a" : "#2a2e3a", g = "";
    if (o.smoke !== false) for (var k = 0; k < 3; k++) for (var q = 0; q < 6; q++) { var ph = ((t * .25 + q / 6) % 1), fx = 62 - k * 40; g += '<circle cx="' + f(fx - 8 - ph * 90) + '" cy="' + f(-92 - ph * 22) + '" r="' + f(5 + ph * 14) + '" fill="#2a2c34" opacity="' + f2(.55 * (1 - ph)) + '"/>'; }
    g += '<path d="M106 -26 V-118 M-112 -26 V-104 M106 -116 L62 -86 M106 -116 L150 -27 M-112 -102 L-62 -84 M-112 -102 L-148 -26 M106 -100 L-112 -96" stroke="#3a3a40" stroke-width=".9" fill="none"/><path d="M106 -26 V-118 M-112 -26 V-104" stroke="#8a6a44" stroke-width="2.2"/>';
    [-60, -20, 20, 60].forEach(function (fx) { g += P('M' + (fx - 9) + ' -44 L' + (fx - 15) + ' -88 L' + (fx + 3) + ' -88 L' + (fx + 9) + ' -44 Z', "url(#funnel)", { w: 1.4 }) + P('M' + (fx - 13.4) + ' -76 L' + (fx - 15) + ' -88 L' + (fx + 3) + ' -88 L' + (fx + 4.6) + ' -76 Z', "#16161a", { w: 1.2 }); });
    g += R(-104, -44, 184, 9, "#f2efe6", { w: 1.2 }) + R(-116, -35, 216, 10, "#f2efe6", { w: 1.2 });
    for (var b = 0; b < 8; b++) g += '<rect x="' + (-96 + b * 22) + '" y="-50" width="14" height="5" rx="2.5" fill="#fbfaf4" stroke="' + INK + '" stroke-width=".8"/>';
    for (var w = 0; w < 30; w++) g += R(-110 + w * 7, -32, 3.4, 4, win, { s: 0 }) + (w < 25 ? R(-98 + w * 7, -41, 3, 3.4, win, { s: 0 }) : "");
    g += P('M-150 -10 Q-153 -24 -140 -25 L148 -27 L152 -26 L146 0 L-146 0 Q-150 -4 -150 -10 Z', "#15161a", { w: 1.6 }) + '<path d="M-141 -22 L147 -24" stroke="#f2efe6" stroke-width="2.4"/><path d="M-148 -3 L147 -3" stroke="#8a2a22" stroke-width="2.5"/><path d="M-138 -19.5 L146 -21.5" stroke="#c9a040" stroke-width=".7"/>';
    for (var p = 0; p < 40; p++) g += '<circle cx="' + (-134 + p * 7) + '" cy="' + (-13 + (p % 2) * 5) + '" r=".9" fill="' + win + '"/>';
    if (lit) g += '<ellipse cx="0" cy="6" rx="150" ry="6" fill="#ffd98a" opacity=".18"/>';
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g, o.op);
  }
  // a small steamer for Californian (one funnel, four masts, stopped) and Carpathia (one tall red funnel with a black top)
  function steamer(x, y, s, t, o) { o = o || {}; var g = '<path d="M-50 -14 V-52 M-20 -14 V-56 M30 -14 V-56 M56 -14 V-50" stroke="#6a5a44" stroke-width="1.6"/>';
    g += P('M-6 -22 L-8 -50 L6 -50 L4 -22 Z', o.fun || "#c88a6a", { w: 1.2 }) + P('M-7.4 -42 L-8 -50 L6 -50 L5.4 -42 Z', "#16161a", { s: 0 });
    if (o.smoke) for (var q = 0; q < 5; q++) { var ph = ((t * .4 + q / 5) % 1); g += '<circle cx="' + f(-4 - ph * 50) + '" cy="' + f(-54 - ph * 14) + '" r="' + f(3 + ph * 9) + '" fill="#3a3c44" opacity="' + f2(.6 * (1 - ph)) + '"/>'; }
    g += R(-30, -24, 52, 10, "#e8e4d8", { w: 1.1 }) + P('M-70 -6 Q-72 -14 -64 -15 L68 -16 L72 -15 L66 0 L-66 0 Z', "#1a1a1e", { w: 1.4 });
    for (var w = 0; w < 7; w++) g += R(-26 + w * 7, -21, 3, 3.6, o.lit === false ? "#2a2e3a" : "#ffd98a", { s: 0 });
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (o.flip ? -1 : 1)) + ' ' + f(s) + ')', g); }
  function palm(x, y, s, t) { var sw = Math.sin(t * .9 + x) * 2, g = P('M-3 0 Q' + f(-2 + sw * .3) + ' -40 ' + f(sw) + ' -80 L' + f(4 + sw) + ' -80 Q' + f(3 + sw * .3) + ' -40 4 0 Z', "#8a6a44", { w: 1.2 }); for (var k = 0; k < 7; k++) { var a = -2.6 + k * .55; g += P('M' + f(sw + 1) + ' -80 Q' + f(sw + Math.cos(a) * 18) + ' ' + f(-86 + Math.sin(a) * 14) + ' ' + f(sw + Math.cos(a) * 32) + ' ' + f(-76 + Math.sin(a) * 6 + 12) + ' Q' + f(sw + Math.cos(a) * 16) + ' ' + f(-80 + Math.sin(a) * 8) + ' ' + f(sw + 1) + ' -80Z', k % 2 ? "#4f7a34" : "#6a9a44", { w: 1 }); } return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g); }
  function passenger(x, y, s, t, k, o) { o = o || {}; var kinds = [
      { top: "#2a2c34", pants: "#2a2c34", coat: "#2a2c34", hat: "bowler", mustache: true }, { top: "#5a4a5a", dress: "#5a3a4a", hat: "lady", hair: "bun" }, { top: "#6a5a44", pants: "#3a3428", hat: "flat" },
      { top: "#3a4a5a", dress: "#3a4a5a", hair: "bun", hat: "lady", hatCol: "#2a3a4a" }, { top: "#4a3a2a", pants: "#2a2420", coat: "#4a3a2a", hat: "flat", hatCol: "#3a3a3a" }, { top: "#7a6a5a", dress: "#6a5a4a", hair: "bun" }];
    return person(x, y, s, t, Object.assign({ skin: SK[k % 4], ph: k }, kinds[k % 6], o)); }
  function sailor(x, y, s, t, k, o) { return person(x, y, s, t, Object.assign({ top: NAVY, pants: NAVY, coat: NAVY, hat: "officer", hatCol: NAVY, skin: SK[k % 4], ph: k }, o || {})); }
  function captain(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: NAVY, pants: NAVY, coat: NAVY, hat: "officer", beard: "#f0ece4", skin: "#e0b48c" }, o || {})); }
  function hassab(x, y, s, t, o) { return person(x, y, s, t, Object.assign({ top: "#3a3a44", pants: "#3a3a44", coat: "#3a3a44", hat: "tarboush", mustache: true, skin: "#b98058" }, o || {})); }
  function lifeboat(x, y, s, t, o) { o = o || {}; var n = o.n == null ? 6 : o.n, g = ""; for (var i = 0; i < n; i++) g += passenger(-36 + i * (72 / Math.max(1, n - 1)), 2, .62, t, (o.k || 0) + i, { vest: true, view: i % 2 ? "front" : "side" });
    g += P('M-52 -14 Q-50 4 -36 6 H36 Q50 4 54 -16 L48 -12 H-46 Z', "#f2efe6", { w: 1.6 }) + '<path d="M-48 -6 H50 M-44 0 H44" stroke="#9a9484" stroke-width=".9"/>';
    if (o.oars !== false) { var w = Math.sin(t * 2.4 + x); g += '<path d="M-14 -8 L' + f(-34 + w * 10) + ' 16 M14 -8 L' + f(-6 + w * 10) + ' 16" stroke="#8a6a44" stroke-width="2.4"/>'; }
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.4 + x) * 1.2) + ') scale(' + f(s) + ')', g); }
  function deck(t, o) { o = o || {}; var tilt = o.tilt || 0, s = sky("skyStar") + stars(t, 60, 300); var g = R(-300, 380, 960, 400, "url(#wood)", { s: 0 }); for (var i = 0; i < 16; i++) g += '<path d="M-300 ' + (392 + i * 18) + ' H660" stroke="#3a2414" stroke-width="1" opacity=".6"/>';
    g += '<path d="M-300 330 H660 M-300 352 H660" stroke="#e8e4d8" stroke-width="3"/>'; for (var p = 0; p < 20; p++) g += R(-290 + p * 48, 330, 4, 52, "#e8e4d8", { w: .8 });
    if (o.davit) g += '<path d="M40 380 V250 Q40 220 70 220 M300 380 V250 Q300 220 270 220" stroke="#e8e4d8" stroke-width="6" fill="none"/><path d="M40 380 V250 Q40 220 70 220 M300 380 V250 Q300 220 270 220" stroke="' + INK + '" stroke-width="1" fill="none"/>';
    if (o.funnel) g += P('M230 380 L214 60 L300 60 L316 380 Z', "url(#funnel)", { w: 2 }) + P('M217 120 L214 60 L300 60 L303 120 Z', "#16161a", { w: 1.6 });
    return s + G('rotate(' + f(tilt) + ' 180 420)', g); }
  function rocket(t, x, y, ph) { var u = ((t * .35 + ph) % 1), s = ""; if (u < .5) s += '<path d="M' + x + ' ' + y + ' L' + f(x + 6) + ' ' + f(y - u * 2 * 240) + '" stroke="#fff6d0" stroke-width="2" opacity=".9"/>'; else { var k = (u - .5) * 2; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.28; s += '<circle cx="' + f(x + 6 + Math.cos(a) * k * 46) + '" cy="' + f(y - 240 + Math.sin(a) * k * 46 + k * k * 30) + '" r="' + f(2.4 * (1 - k)) + '" fill="#ffffff"/>'; } s += '<circle cx="' + (x + 6) + '" cy="' + (y - 240) + '" r="' + f(60 * (1 - k)) + '" fill="#fff" opacity="' + f2(.3 * (1 - k)) + '"/>'; } return s; }
  function wireless(t, o) { o = o || {}; var s = R(-200, -200, 760, 1040, "#3a2e22", { s: 0 }) + R(-200, 120, 760, 220, "#5a4632", { s: 0 }); for (var i = 0; i < 12; i++) s += '<path d="M' + (i * 34) + ' 120 V340" stroke="#3a2a1a" stroke-width="1"/>';
    s += R(30, 400, 300, 16, "#7a5a3a", { w: 2 }) + R(40, 416, 12, 120, "#5a3a22", { w: 1 }) + R(308, 416, 12, 120, "#5a3a22", { w: 1 });
    s += R(50, 330, 80, 70, "#2a2420", { w: 1.6 }) + '<circle cx="74" cy="356" r="9" fill="#c9a040" stroke="' + INK + '"/><circle cx="106" cy="356" r="9" fill="#c9a040" stroke="' + INK + '"/><path d="M60 384 h60" stroke="#c9a040" stroke-width="3"/>' + R(150, 386, 40, 14, "#8a6a44", { w: 1.2 }) + P('M156 386 l10 -12 l18 0 l-6 12Z', "#c9a040", { w: 1 });
    var n = o.pile == null ? 6 : o.pile; for (var p = 0; p < n; p++) s += G('translate(' + (250 + (p % 2) * 6) + ' ' + (396 - p * 5) + ') rotate(' + f((hash(p) - .5) * 14) + ')', R(-24, -3, 48, 6, "#f2ead8", { w: .8 }));
    if (o.lamp !== false) s += '<circle cx="290" cy="250" r="14" fill="#ffd890"/><circle cx="290" cy="250" r="90" fill="url(#warm)" opacity="' + f2(.5 + .05 * Math.sin(t * 8)) + '"/><path d="M290 120 V236" stroke="#2a2a2a" stroke-width="2"/>';
    return s; }
  function operator(x, y, s, t, o) { o = o || {}; return person(x, y, s, t, Object.assign({ top: NAVY, pants: NAVY, coat: NAVY, skin: SK[0], hair: "short" }, o)) + G('translate(' + f(x) + ' ' + f(y - 157 * .42 * s) + ') scale(' + f(s * .42) + ')', '<path d="M-13 -2 Q-14 -22 0 -22 Q14 -22 13 -2" stroke="#1a1a1a" stroke-width="3" fill="none"/><rect x="-17" y="-6" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="11" y="-6" width="6" height="12" rx="3" fill="#1a1a1a"/>'); }
  function hull(t, k) { var s = P('M30 250 L40 330 Q44 350 60 352 H300 Q322 350 330 320 L336 250 Z', "#2a2c34", { w: 2 }); for (var i = 0; i < 16; i++) { var x = 318 - i * 17.4, fl = i < 5 ? clamp(k * 1.3 - i * .12) : 0; if (fl > 0) s += R(x - 16, 350 - fl * 90, 16, fl * 90, "#3a8fc8", { s: 0, op: .9 }) + '<path d="M' + f(x - 16) + ' ' + f(350 - fl * 90) + ' q4 -3 8 0 t8 0" stroke="#cfe6f4" stroke-width="1.4" fill="none"/>'; s += '<path d="M' + f(x) + ' 256 V350" stroke="#8a929c" stroke-width="1.6"/>'; if (i < 6) s += txt(String(i + 1), x - 8, 246, 11, i < 5 ? "#7ad0f0" : "#8a929c", { font: "Noto Serif", wt: 700 }); }
    return s + '<path d="M336 300 l10 -4 l-2 10 l8 -2" stroke="#fff" stroke-width="1.6" fill="none"/>'; }

  // ═════════ the shots ═════════
  // 0 — the night of 14 April 1912, mid-Atlantic
  shot(0, push([180, 320], [200, 330], 1.0, 1.1), function (u, d, t) { return night(t, 380) + ship(lerp(120, 200, u / d), 380, .9, t) + label("14 أبريل 1912", 180, 170, u, .3, 30, "#fff") + label("المحيط الأطلنطي", 180, 204, u, .8, 18, "#f2c230"); });
  // 1 — bitterly cold, a sky full of stars, the sea still as a sheet of glass
  shot(1, push([180, 300], [180, 260], 1.0, 1.1), function (u, d, t) { var s = sky("skyStar") + stars(t, 160, 420) + R(-220, 420, 800, 400, "url(#seaNight)", { s: 0 }); for (var i = 0; i < 50; i++) s += '<circle cx="' + f(hash(i) * 460 - 50) + '" cy="' + f(430 + hash(i + 3) * 180) + '" r=".8" fill="#fff" opacity="' + f2(.2 + .2 * Math.sin(t + i)) + '"/>'; var mk = ((u * .5) % 1); s += '<path d="M' + f(60 + mk * 260) + ' ' + f(80 + mk * 120) + ' l-40 -18" stroke="#fff" stroke-width="2" opacity="' + f2(1 - mk) + '"/>'; for (var w2 = 0; w2 < 30; w2++) { var wx = ((hash(w2) * 500 + t * (20 + hash(w2 + 3) * 20)) % 500) - 70; s += '<path d="M' + f(wx) + ' ' + f(428 + hash(w2 + 5) * 190) + ' h' + f(16 + hash(w2) * 24) + '" stroke="#a8c0e6" stroke-width="1.4" opacity="' + f2(.3 + .3 * Math.sin(t * 2 + w2)) + '"/>'; } return s + ship(lerp(210, 290, u / d), 420, .34, t) + label("-2°", 80, 200, u, 1.0, 34, "#bcd8ea"); });
  // 2 — the biggest ship in the world at full speed, with more than 2,200 people aboard
  shot(2, push([150, 330], [210, 330], 1.25, 1.1), function (u, d, t) { var s = night(t, 400) + ship(180, 400, 1.15, t); for (var i = 0; i < 8; i++) { var ph = ((t * .9 + i / 8) % 1); s += '<path d="M' + f(352 + ph * 30) + ' ' + f(398 + i % 3) + ' q8 -6 14 0" stroke="#e6f2fc" stroke-width="1.6" fill="none" opacity="' + f2(1 - ph) + '"/>'; } return s + bigNum("2,200+", 180, 190, u, .8, 44, "#f2c230") + label("إنسان", 180, 224, u, 1.2, 20, "#fff"); });
  // 3 — they called her the ship that could not sink
  shot(3, push([200, 300], [200, 300], 1.5, 1.7), function (u, d, t) { return night(t, 420) + ship(140, 420, 1.6, t) + label("ما بتغرقش", 180, 150, u, .5, 36, "#fff"); });
  // 4 — so how did she sink in two hours and forty minutes?
  shot(4, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d); return night(t, 380) + ship(180, 380 + k * 30, .95, t, { rot: k * 14, smoke: false }) + R(-220, 380, 800, 500, "url(#seaNight)", { s: 0, op: .92 }) + bigNum("2:40", 180, 190, u, .4, 50, "#f2c230") + label("ساعتين وأربعين دقيقة", 180, 226, u, .8, 18, "#fff"); });
  // 5 — and why did the nearest ship see the distress rockets… and not move?
  shot(5, push([180, 320], [180, 310], 1.0, 1.08), function (u, d, t) { return night(t, 400) + rocket(t, 260, 392, 0) + ship(270, 400, .22, t) + iceberg(40, 404, .5, { dark: true }) + steamer(110, 470, 1.3, t, { lit: false }) + label("شافت… وما اتحركتش؟", 180, 170, u, .6, 24, "#fff"); });
  // 6 — the story of that night, hour by hour; we start in the morning
  shot(6, push([180, 320], [180, 320], 1.1, 1.0), function (u, d, t) { return sky("skyMorning") + cloudBank(t, 120, 4, 6, "#fff", .8) + R(-220, 400, 800, 400, "url(#canal)", { s: 0 }) + ship(180, 400, 1.0, t) + rays(t, 320, 60, 2.3, 5, 600, .35) + label("ساعة بساعة", 180, 180, u, .4, 34, "#fff"); });
  // 7 — Sunday morning: the lifeboat drill was meant to happen… and was cancelled
  shot(7, push([180, 330], [180, 340], 1.0, 1.1), function (u, d, t) { var s = sky("skyMorning") + cloudBank(t, 100, 4, 5, "#fff", .8); var g = R(-300, 380, 960, 400, "url(#wood)", { s: 0 }) + '<path d="M40 380 V250 Q40 220 70 220 M300 380 V250 Q300 220 270 220" stroke="#e8e4d8" stroke-width="6" fill="none"/>' + P('M70 300 Q72 340 100 344 H240 Q268 340 272 296 L262 304 H80 Z', "#f2efe6", { w: 2 }) + P('M68 296 Q170 270 274 294 L262 304 H80 Z', "#c9c0a8", { w: 1.6 }) + '<path d="M70 222 V296 M270 222 V296" stroke="#6a5a44" stroke-width="2"/>';
    return s + g + sailor(110, 520, 2.2, t, 1) + passenger(230, 530, 2.1, t, 1) + passenger(290, 520, 2.0, t, 0) + G('translate(180 250) rotate(-8)', R(-70, -18, 140, 36, "#b8322a", { w: 2 }) + txt("اتلغى", 0, 9, 24, "#fff", { wt: 900 }), clamp((u - 1.4) / .3)) + label("الحد الصبح", 180, 150, u, .3, 26, "#fff"); });
  // 8 — all day the wireless room took warning after warning: icebergs ahead
  shot(8, push([180, 340], [180, 350], 1.0, 1.1), function (u, d, t) { var s = wireless(t, { pile: 2 }) + operator(130, 560, 2.6, t, { back: true }); for (var i = 0; i < 5; i++) { var k = clamp((u - .5 - i * .7) / .4); if (k > 0) s += G('translate(' + (60 + i * 60) + ' ' + f(210 + (i % 2) * 40 - (1 - k) * 20) + ') rotate(' + ((i % 2) * 8 - 4) + ')', R(-34, -20, 68, 40, "#f2ead8", { w: 1.4 }) + P('M-10 8 L0 -12 L10 8 Z', "url(#ice)", { w: 1 }) + txt("!", 22, 8, 18, "#b8322a", { wt: 900 }), k); } return s + label("تحذير ورا تحذير", 180, 150, u, .4, 26, "#f2c230"); });
  // 9 — but the operator was buried in other work: the rich passengers' telegrams home
  shot(9, push([180, 350], [200, 350], 1.0, 1.12), function (u, d, t) { var n = Math.round(clamp(u / d) * 14) + 4; return wireless(t, { pile: n }) + operator(120, 560, 2.6, t, { mood: "flat" }) + '<path d="M168 396 l4 -8" stroke="#fff" stroke-width="2" opacity="' + f2(.5 + .5 * Math.sin(t * 30)) + '"/>' + passenger(300, 610, 2.0, t, 0, { flip: true }) + label("برقيات الركاب", 180, 150, u, .5, 26, "#fff"); });
  // 10 — and one of the most important warnings went under a paperweight… and never reached the captain
  shot(10, push([180, 400], [180, 400], 1.6, 2.0), function (u, d, t) { return wireless(t, { pile: 0 }) + G('translate(180 388) rotate(-4)', R(-50, -8, 100, 16, "#f2ead8", { w: 1.4 }) + P('M-34 4 L-28 -6 L-22 4 Z', "url(#ice)", { w: .8 }) + '<path d="M-14 -2 h50 M-14 3 h36" stroke="#5a4a3a" stroke-width="1.2"/>') + '<ellipse cx="190" cy="378" rx="22" ry="10" fill="#6a7078" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="190" cy="374" rx="10" ry="4" fill="#9aa2aa"/>' + label("ما وصلش للقبطان", 180, 300, u, 1.2, 14, "#f2c230"); });
  // 11 — 11 p.m.: a nearby ship, the Californian, sends: we are stopped and surrounded by ice
  shot(11, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = night(t, 400); for (var i = 0; i < 9; i++) s += iceberg(-20 + i * 50, 410 + (i % 3) * 40, .22 + (i % 3) * .08, { dark: true }); s += steamer(180, 440, 1.6, t, { lit: true }); for (var k = 0; k < 3; k++) { var ph = ((t * .8 + k / 3) % 1); s += '<circle cx="200" cy="345" r="' + f(10 + ph * 60) + '" fill="none" stroke="#f2c230" stroke-width="2" opacity="' + f2(1 - ph) + '"/>'; } return s + label("23:00", 180, 150, u, .3, 40, "#f2c230") + label("كاليفورنيان", 180, 186, u, .7, 20, "#fff"); });
  // 12 — the Titanic's operator answered: shut up! I'm busy
  shot(12, push([180, 340], [180, 330], 1.1, 1.25), function (u, d, t) { return wireless(t, { pile: 16 }) + R(-200, -200, 760, 1040, "#000", { s: 0, op: .25 }) + portrait(180, 380, 2.0, t, { hair: "short", top: NAVY, skin: SK[0], sad: true }) + G('translate(180 360) scale(5.2)', '<path d="M-13 -2 Q-14 -22 0 -22 Q14 -22 13 -2" stroke="#1a1a1a" stroke-width="3" fill="none"/><rect x="-17" y="-6" width="6" height="12" rx="3" fill="#1a1a1a"/><rect x="11" y="-6" width="6" height="12" rx="3" fill="#1a1a1a"/>') + label("اسكت! أنا مشغول", 180, 150, u, .6, 30, "#fff"); });
  // 13 — so the Californian's operator switched off his set… and went to sleep
  shot(13, push([180, 340], [180, 350], 1.0, 1.1), function (u, d, t) { var k = clamp((u - 1) / .6); return wireless(t, { pile: 1, lamp: false }) + '<circle cx="290" cy="250" r="14" fill="#ffd890" opacity="' + f2(1 - k) + '"/><circle cx="290" cy="250" r="90" fill="url(#warm)" opacity="' + f2(.5 * (1 - k)) + '"/>' + R(-200, -200, 760, 1040, "#05070f", { s: 0, op: k * .4 }) + rays(t * 2, 380, 60, 2.5 + Math.sin(t * .6) * .1, 4, 600, .35) + P('M40 540 L40 500 L250 500 L262 540 Z', "#e8e2d4", { w: 2 }) + P('M90 506 Q170 480 258 510 L258 530 L90 530 Z', "#3a4a6a", { w: 1.6 }) + '<circle cx="66" cy="494" r="16" fill="' + SK[1] + '" stroke="' + INK + '" stroke-width="1.4"/>' + label("z z z", 120, 440 - Math.sin(t * 2) * 6, u, 1.6, 24, "#bcd8ea"); });
  // 14 — remember that ship
  shot(14, push([180, 330], [180, 330], 1.2, 1.4), function (u, d, t) { var s = night(t, 400); for (var i = 0; i < 6; i++) s += iceberg(20 + i * 60, 410 + (i % 2) * 30, .25, { dark: true }); return s + steamer(180, 440, 1.6, t, { lit: false }) + label("افتكروا السفينة دي", 180, 170, u, .2, 26, "#f2c230"); });
  // 15 — up in the crow's nest, two lookouts stand in the cold with no binoculars
  shot(15, push([180, 340], [180, 320], 1.0, 1.12), function (u, d, t) { var s = sky("skyStar") + stars(t, 120, 640) + R(168, 60, 24, 600, "#8a6a44", { w: 2 }) + '<path d="M180 120 L20 640 M180 120 L340 640" stroke="#3a3a40" stroke-width="1.2"/>';
    s += sailor(140, 470, 2.4, t, 2, { hat: "flat", hatCol: NAVY }) + sailor(220, 474, 2.4, t, 3, { hat: "flat", hatCol: NAVY, flip: true }) + P('M96 400 L104 480 Q180 500 256 480 L264 400 Q180 418 96 400 Z', "#e8e4d8", { w: 2 }) + '<path d="M100 430 Q180 448 260 430" stroke="#9a9484" stroke-width="1.2" fill="none"/>' + '<path d="M250 380 l14 0 l4 18 l-22 0Z" fill="#c9a040" stroke="' + INK + '" stroke-width="1.2"/>';
    for (var i = 0; i < 6; i++) { var ph = ((t * .5 + i / 6) % 1); s += '<circle cx="' + f(150 + (i % 2) * 70 + ph * 20) + '" cy="' + f(378 - ph * 26) + '" r="' + f(3 + ph * 6) + '" fill="#fff" opacity="' + f2(.3 * (1 - ph)) + '"/>'; } return s + label("من غير نضارة", 180, 170, u, 1.0, 24, "#fff"); });
  // 16 — the binoculars were in a locked cupboard… the key was with an officer who left before the voyage
  shot(16, push([180, 330], [180, 330], 1.1, 1.3), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#2a2018", { s: 0 }) + '<circle cx="180" cy="320" r="220" fill="url(#warm)" opacity=".3"/>' + R(80, 200, 200, 240, "#6a4a2a", { w: 2.4 }) + R(92, 212, 176, 216, "#7a5a34", { w: 1.4 }) + '<circle cx="250" cy="320" r="10" fill="#c9a040" stroke="' + INK + '" stroke-width="1.4"/><path d="M250 318 v8" stroke="' + INK + '" stroke-width="3"/>';
    s += G('translate(180 300)', '<circle cx="-22" cy="0" r="22" fill="#1a1a1a" opacity=".35"/><circle cx="22" cy="0" r="22" fill="#1a1a1a" opacity=".35"/><rect x="-8" y="-8" width="16" height="16" fill="#1a1a1a" opacity=".35"/>'); var k = clamp((u - 1.5) / 1.5);
    return s + G('translate(' + f(lerp(250, 400, k)) + ' ' + f(lerp(380, 520, k)) + ') rotate(' + f(30 + k * 60) + ')', '<circle cx="0" cy="0" r="10" fill="none" stroke="#c9a040" stroke-width="4"/><path d="M10 0 H44 M36 0 v8 M44 0 v8" stroke="#c9a040" stroke-width="4"/>') + label("المفتاح", 180, 160, u, .6, 30, "#f2c230"); });
  // 17 — 11:40 p.m., one of them saw something dark ahead
  shot(17, push([180, 320], [180, 300], 1.0, 1.2), function (u, d, t) { var k = clamp(u / d); return sky("skyStar") + stars(t, 100, 340) + R(-220, 340, 800, 500, "url(#seaNight)", { s: 0 }) + iceberg(180, 346, lerp(.25, 1.1, k * k), { dark: true }) + P('M-200 640 L60 470 L300 470 L560 640 Z', "#15161a", { w: 2 }) + '<path d="M180 470 V250" stroke="#8a6a44" stroke-width="5"/>' + label("23:40", 180, 150, u, .3, 44, "#f2c230"); });
  // 18 — he rang the bell three times and shouted: iceberg right ahead!
  shot(18, push([180, 340], [180, 330], 1.1, 1.2), function (u, d, t) { var sw = Math.sin(t * 22) * 14 * (u < 1.6 ? 1 : 0); return sky("skyStar") + stars(t, 80, 640) + portrait(150, 400, 1.9, t, { hair: "short", hat: "flat", hatCol: NAVY, top: NAVY, skin: SK[2], sad: true, rim: true }) + G('translate(290 190) rotate(' + f(sw) + ')', '<path d="M0 -30 V0" stroke="#3a3a3a" stroke-width="3"/>' + P('M-24 40 Q-22 0 0 0 Q22 0 24 40 Z', "#c9a040", { w: 2 }) + '<circle cx="0" cy="44" r="6" fill="#8a6a20" stroke="' + INK + '"/>') + (u < 1.6 ? '<path d="M240 200 q-10 20 0 40 M340 200 q10 20 0 40" stroke="#f2c230" stroke-width="3" fill="none"/>' : '') + label("جبل جليد قدامنا!", 180, 130, u, 1.4, 30, "#fff"); });
  // 19 — the ship turned… too late. the berg scraped along her starboard side
  shot(19, push([180, 330], [200, 340], 1.05, 1.2), function (u, d, t) { var k = clamp(u / d), s = night(t, 400) + iceberg(lerp(330, 240, k), 404, 1.2) + ship(lerp(40, 110, k), 400, 1.0, t, { rot: -2 * Math.sin(k * 3) }); if (k > .5) for (var i = 0; i < 8; i++) { var ph = ((t * 3 + i / 8) % 1); s += '<circle cx="' + f(250 + ph * 14 + (i % 3) * 4) + '" cy="' + f(396 - ph * 20) + '" r="' + f(2 + ph * 3) + '" fill="#eef8fc" opacity="' + f2(1 - ph) + '"/>'; } return s + label("متأخر", 180, 170, u, 1.4, 34, "#fff"); });
  // 20 — most passengers felt only a faint tremor; some went on playing cards
  shot(20, push([180, 350], [180, 340], 1.0, 1.1), function (u, d, t) { var sh = u > .6 && u < 1.2 ? Math.sin(t * 50) * 2 : 0, s = R(-200, -200, 760, 1040, "#5a3a2a", { s: 0 }) + R(-200, 120, 760, 230, "#7a5234", { s: 0 }) + '<circle cx="180" cy="130" r="26" fill="#ffe9b0"/><circle cx="180" cy="130" r="180" fill="url(#warm)" opacity=".5"/>' + '<path d="M180 0 V104" stroke="#c9a040" stroke-width="3" transform="rotate(' + f(sh * 2) + ' 180 0)"/>';
    s += passenger(70, 520, 2.3, t, 0) + passenger(290, 520, 2.3, t, 4, { flip: true }) + '<ellipse cx="180" cy="' + f(480 + sh) + '" rx="110" ry="26" fill="#2f6a4e" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < 5; i++) s += G('translate(' + (130 + i * 24) + ' ' + f(474 + sh) + ') rotate(' + (i * 14 - 28) + ')', R(-7, -10, 14, 20, "#fbfaf4", { w: 1 }) + txt(i % 2 ? "♥" : "♠", 0, 5, 10, i % 2 ? "#b8322a" : "#1a1a1a", {}));
    return s + '<rect x="230" y="' + f(450 + sh) + '" width="12" height="20" fill="#cfe6f4" opacity=".8" stroke="' + INK + '"/>' + label("هزة خفيفة", 180, 220, u, .8, 24, "#fff"); });
  // 21 — but below, water was coming into five compartments… and the ship could survive only four
  shot(21, push([180, 300], [200, 300], 1.0, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#0c1424", { s: 0 }) + R(-200, 300, 760, 500, "#14264a", { s: 0, op: .8 }) + hull(t, clamp(u / d)) + bigNum("5", 250, 190, u, .8, 60, "#7ad0f0") + label("أقسام", 250, 222, u, 1.0, 18, "#fff") + label("تستحمل 4 بس", 110, 200, u, 2.0, 20, "#f2c230"); });
  // 22 — the ship's designer told the captain: an hour… two at most
  shot(22, push([180, 350], [180, 340], 1.0, 1.12), function (u, d, t) { return R(-200, -200, 760, 1040, "#2a2e3a", { s: 0 }) + R(-200, 100, 760, 200, "#14203e", { w: 3, s: "#8a6a44" }) + stars(t, 30, 280) + '<circle cx="180" cy="80" r="160" fill="url(#warm)" opacity=".3"/>' + R(60, 430, 240, 14, "#7a5a3a", { w: 2 }) + P('M80 380 L280 376 L286 430 L76 430 Z', "#dfe6ea", { w: 1.4 }) + '<path d="M100 410 h160 M100 400 h120" stroke="#3a6a9a" stroke-width="1.4"/>' + captain(100, 600, 2.6, t, { sad: true }) + passenger(260, 600, 2.5, t, 0, { hat: null, flip: true, sad: true }) + label("ساعة… ساعتين بالكتير", 180, 170, u, .6, 22, "#fff"); });
  // 23 — the bigger problem: the boats were enough for only half the people aboard
  shot(23, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { var s = R(-200, -200, 760, 1040, "#0c1424", { s: 0 }); for (var i = 0; i < 20; i++) { var k = clamp((u - i * .08) / .3); s += G('translate(' + (60 + (i % 4) * 80) + ' ' + (260 + Math.floor(i / 4) * 44) + ')', P('M-28 -8 Q-26 6 -18 8 H18 Q26 6 30 -10 L26 -6 H-24 Z', "#f2efe6", { w: 1.4 }), k); } return s + bigNum("20", 110, 190, u, .3, 50, "#fff") + label("قارب", 110, 222, u, .5, 18, "#fff") + bigNum("½", 260, 190, u, 1.6, 54, "#f2c230") + label("نص الركاب بس", 260, 222, u, 1.8, 16, "#f2c230"); });
  // 24 — 12:45 a.m., the first boat was lowered… half empty
  shot(24, push([180, 330], [180, 380], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d), y = lerp(250, 430, k), s = sky("skyStar") + stars(t, 50, 300) + R(-200, -100, 250, 900, "#15161a", { s: 0 }); for (var i = 0; i < 12; i++) s += '<circle cx="24" cy="' + (60 + i * 50) + '" r="6" fill="#ffd98a" stroke="#3a3a3a"/>';
    s += '<path d="M90 0 V' + f(y - 20) + ' M190 0 V' + f(y - 20) + '" stroke="#c8b48a" stroke-width="2"/>' + lifeboat(140, y, 1.5, t, { n: 3, oars: false, k: 2 }) + R(-220, 560, 800, 200, "url(#seaNight)", { s: 0 }); return s + label("00:45", 250, 160, u, .3, 36, "#f2c230") + label("نصه فاضي", 250, 196, u, 1.2, 20, "#fff"); });
  // 25 — people could not believe this ship might sink
  shot(25, push([180, 350], [190, 350], 1.0, 1.1), function (u, d, t) { var s = deck(t, { davit: true, funnel: true }); [[60, 540, 0], [120, 560, 1], [180, 545, 2], [240, 565, 3], [300, 548, 4]].forEach(function (p) { s += passenger(p[0], p[1], 2.3, t, p[2], { mood: p[2] % 2 ? "smile" : "flat" }); }); return s + label("مش مصدقين", 150, 190, u, .5, 28, "#fff"); });
  // 26 — and here the stories began
  shot(26, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { return night(t, 420) + ship(180, 424, .95, t, { rot: 3, smoke: false }) + R(-220, 420, 800, 400, "url(#seaNight)", { s: 0, op: .9 }) + rocket(t, 200, 330, .2) + label("الحكايات", 180, 170, u, .4, 40, "#f2c230"); });
  // 27 — Ida Straus was about to step into the boat, then turned back to her husband
  shot(27, push([180, 350], [170, 350], 1.0, 1.12), function (u, d, t) { var k = ease(clamp((u - 1) / 1.6)); return deck(t, { davit: true, tilt: 2 }) + P('M210 330 Q212 370 236 374 H400 V330 Z', "#f2efe6", { w: 2 }) + passenger(120, 590, 2.7, t, 0, { beard: "#e8e4dc", hat: null, hair: "short", hairCol: "#c8c4bc", skin: "#e0b48c" }) + G('translate(' + f(lerp(250, 185, k)) + ' 0)', passenger(0, 592, 2.5, t, 1, { hat: null, hairCol: "#a8a4a0", skin: "#e8c0a0", flip: k > .3, dress: "#3a2a3a", top: "#4a3a4a" })) + label("إيدا وإيزيدور شتراوس", 180, 170, u, .5, 22, "#f2c230"); });
  // 28 — she told him: we have lived together all our lives… where you go, I go
  shot(28, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) { return sky("skyStar") + stars(t, 60, 640) + R(-200, 480, 760, 300, "#3a2414", { s: 0 }) + portrait(105, 390, 1.75, t, { hair: "short", hairCol: "#c8c4bc", beard: "#e8e4dc", top: "#2a2c34", skin: "#e0b48c", rim: true }) + portrait(255, 400, 1.65, t, { hair: "bun", hairCol: "#a8a4a0", top: "#4a3a4a", skin: "#e8c0a0" }) + label("زي ما تروح أروح", 180, 170, u, 1.6, 28, "#fff"); });
  // 29 — the band came up on deck and kept playing to calm people… to the end
  shot(29, push([180, 350], [190, 345], 1.0, 1.1), function (u, d, t) { var s = deck(t, { tilt: 4, funnel: true }); for (var i = 0; i < 5; i++) { var x = 50 + i * 60, y = 560 + (i % 2) * 14; s += person(x, y, 2.2, t, { top: "#1e1e24", pants: "#1e1e24", coat: "#1e1e24", skin: SK[i % 4], hair: "short", ph: i, mustache: i % 2 === 0 }); var bw = Math.sin(t * 5 + i) * 10;
      s += i === 2 ? P('M' + (x + 6) + ' ' + (y - 96) + ' q16 4 12 50 q-4 30 -22 30 q-14 -4 -10 -40 q4 -34 20 -40Z', "#8a4a24", { w: 1.6 }) + '<path d="M' + (x - 20 + bw) + ' ' + (y - 50) + ' L' + (x + 30 + bw) + ' ' + (y - 66) + '" stroke="#e8e4d8" stroke-width="2"/>' : P('M' + (x + 4) + ' ' + (y - 110) + ' q10 2 8 18 q-4 10 -12 6 q-4 -14 4 -24Z', "#a85a2a", { w: 1.4 }) + '<path d="M' + (x - 10 + bw) + ' ' + (y - 96) + ' L' + (x + 26 + bw) + ' ' + (y - 112) + '" stroke="#e8e4d8" stroke-width="1.8"/>'; }
    for (var n = 0; n < 5; n++) { var ph = ((t * .4 + n / 5) % 1); s += txt(n % 2 ? "♪" : "♫", 60 + n * 60 + Math.sin(t + n) * 8, 400 - ph * 120, 22, "#f2e6c8", { op: 1 - ph }); } return s + label("لحد الآخر", 180, 170, u, 1.4, 30, "#fff"); });
  // 30 — and among all those passengers was a young Egyptian from Cairo named Hamad Hassab
  shot(30, push([180, 340], [180, 330], 1.05, 1.15), function (u, d, t) { return R(-200, -200, 760, 1040, "#2a2018", { s: 0 }) + '<circle cx="180" cy="330" r="230" fill="url(#warm)" opacity=".4"/>' + portrait(180, 390, 2.0, t, { hair: "short", hat: "tarboush", mustache: true, top: "#3a3a44", skin: "#b98058", rim: true }) + label("حمد حسب", 180, 150, u, .6, 36, "#f2c230") + label("من القاهرة", 180, 186, u, 1.0, 20, "#fff") + dust(t, 14, "#ffd98a", .5); });
  // 31 — a dragoman, 27, travelling with an American tourist… he got into lifeboat number 3 and lived
  shot(31, push([180, 330], [180, 350], 1.0, 1.1), function (u, d, t) { var k = ease(clamp((u - 2) / 2)); return deck(t, { davit: true, tilt: 3 }) + P('M70 ' + f(300 + k * 60) + ' Q72 ' + f(340 + k * 60) + ' 100 ' + f(344 + k * 60) + ' H240 Q268 ' + f(340 + k * 60) + ' 272 ' + f(296 + k * 60) + ' L262 ' + f(304 + k * 60) + ' H80 Z', "#f2efe6", { w: 2 }) + txt("3", 170, 332 + k * 60, 20, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + G('translate(0 ' + f(k * 60) + ')', hassab(140, 300, 1.5, t, { vest: true }) + passenger(200, 300, 1.4, t, 1, { vest: true }) + passenger(110, 600, 2.4, t, 0, { op: 1 - k })) + label("قارب رقم 3", 180, 160, u, 2.0, 30, "#f2c230") + label("ترجمان · 27 سنة", 180, 196, u, .5, 18, "#fff"); });
  // 32 — and the white distress rockets went up into the sky, one after another
  shot(32, push([180, 320], [180, 290], 1.0, 1.08), function (u, d, t) { return night(t, 440) + ship(180, 446, .9, t, { rot: 5, smoke: false }) + R(-220, 440, 800, 400, "url(#seaNight)", { s: 0, op: .9 }) + rocket(t, 170, 370, 0) + rocket(t, 220, 372, .45) + rocket(t, 130, 372, .75); });
  // 33 — remember the Californian? her officers saw the rockets from far away
  shot(33, push([180, 340], [180, 330], 1.0, 1.1), function (u, d, t) { return night(t, 330) + ship(260, 330, .12, t, { smoke: false }) + rocket(t, 262, 324, .1).replace(/240/g, "70").replace(/46/g, "14") + R(-200, 470, 760, 400, "#2a2420", { s: 0 }) + '<path d="M-200 440 H560 M-200 462 H560" stroke="#6a6458" stroke-width="3"/>' + sailor(120, 640, 2.8, t, 5, { back: true }) + sailor(230, 640, 2.7, t, 6, { back: true }) + label("شافوا الصواريخ", 180, 170, u, .8, 26, "#fff"); });
  // 34 — they woke the captain; he told them to signal with the lamp… and went back to sleep
  shot(34, push([180, 340], [180, 350], 1.0, 1.1), function (u, d, t) { var bl = Math.sin(t * 9) > 0; return R(-200, -200, 760, 1040, "#1a1c24", { s: 0 }) + R(40, 130, 100, 100, "#0c1630", { w: 3, s: "#6a5a44" }) + '<circle cx="90" cy="180" r="' + (bl ? 8 : 3) + '" fill="#fff6d0" opacity="' + (bl ? 1 : .4) + '"/>' + P('M120 520 L120 470 L330 470 L340 520 Z', "#e8e2d4", { w: 2 }) + P('M170 476 Q250 450 336 482 L336 506 L170 506 Z', "#4a3a2a", { w: 1.6 }) + '<circle cx="146" cy="462" r="17" fill="' + SK[0] + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M130 458 Q146 440 162 458" fill="#5a4a3a"/>' + sailor(60, 600, 2.4, t, 7) + label("ورجع نام", 220, 300, u, 1.8, 28, "#bcd8ea"); });
  // 35 — and the wireless operator was still asleep, his set switched off
  shot(35, push([180, 340], [180, 340], 1.1, 1.25), function (u, d, t) { return wireless(t, { pile: 1, lamp: false }) + R(-200, -200, 760, 1040, "#05070f", { s: 0, op: .55 }) + G('translate(90 365)', '<path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#b8322a" stroke-width="6"/>') + label("الجهاز مقفول", 180, 170, u, .5, 28, "#fff"); });
  // 36 — but about 58 miles away another ship heard the call: the Carpathia
  shot(36, push([180, 320], [180, 320], 1.0, 1.1), function (u, d, t) { var s = night(t, 400) + steamer(180, 420, 1.7, t, { fun: "#b8322a", smoke: true }); for (var k = 0; k < 3; k++) { var ph = ((t * .8 + k / 3) % 1); s += '<circle cx="180" cy="330" r="' + f(80 - ph * 66) + '" fill="none" stroke="#f2c230" stroke-width="2" opacity="' + f2(ph) + '"/>'; } return s + label("كارباثيا", 180, 150, u, .5, 36, "#f2c230") + label("58 ميل", 180, 186, u, 1.0, 20, "#fff"); });
  // 37 — her captain turned at once and cut the heating to the cabins so all the steam went to the engines
  shot(37, push([140, 330], [220, 330], 1.1, 1.1), function (u, d, t) { var s = night(t, 400); for (var i = 0; i < 4; i++) s += iceberg(((i * 140 - t * 60) % 560 + 560) % 560 - 100, 430 + (i % 2) * 60, .4, { dark: true }); s += steamer(180, 410, 1.9, t, { fun: "#b8322a", smoke: true }); for (var j = 0; j < 10; j++) { var ph = ((t * 1.6 + j / 10) % 1); s += '<path d="M' + f(310 + ph * 40) + ' ' + f(408 + (j % 3) * 2) + ' q8 -6 14 0" stroke="#e6f2fc" stroke-width="1.6" fill="none" opacity="' + f2(1 - ph) + '"/>'; } return s + label("بأقصى سرعة", 180, 170, u, .6, 28, "#fff"); });
  // 38 — imagine you are standing on the deck, and the floor is tilting under your feet…
  shot(38, push([180, 350], [180, 350], 1.0, 1.1), function (u, d, t) { var tl = lerp(4, 16, clamp(u / d)); return deck(t, { tilt: tl, funnel: true }) + G('rotate(' + f(tl * .5) + ' 180 420)', passenger(150, 640, 3.4, t, 4, { back: true })) + '<circle cx="' + f(260 - u * 30) + '" cy="' + f(520 + u * 16) + '" r="8" fill="#8a6a44" stroke="' + INK + '"/>'; });
  // 39 — the boats are all gone, the lights still on, the music still playing
  shot(39, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = night(t, 420) + ship(190, 440, 1.0, t, { rot: 12, smoke: false }) + R(-220, 420, 800, 400, "url(#seaNight)", { s: 0, op: .93 }); for (var i = 0; i < 4; i++) s += lifeboat(50 + i * 90, 440 + (i % 2) * 22, .62, t, { n: 4, k: i * 3 }); for (var n = 0; n < 3; n++) { var ph = ((t * .4 + n / 3) % 1); s += txt("♪", 150 + n * 30, 330 - ph * 60, 16, "#f2e6c8", { op: 1 - ph }); } return s; });
  // 40 — 2:20 a.m., the lights went out, the ship broke in two… and went down
  shot(40, push([180, 320], [180, 340], 1.0, 1.1), function (u, d, t) { var k = clamp(u / d), dark = k > .25, br = clamp((k - .4) / .2), dn = clamp((k - .6) / .4), s = night(t, 420);
    s += G('translate(170 ' + f(430 + dn * 260) + ') scale(1.25) rotate(' + f(-18 - br * 30 - dn * 30) + ')', '<svg x="-160" y="-130" width="170" height="160" viewBox="-160 -130 170 160" overflow="hidden">' + ship(0, 0, 1.0, t, { lit: !dark, smoke: false }) + '</svg>');
    s += G('translate(' + f(195 + br * 10) + ' ' + f(440 + br * 60 + dn * 200) + ') scale(1.25) rotate(' + f(20 + br * 20) + ')', '<svg x="10" y="-130" width="150" height="160" viewBox="10 -130 150 160" overflow="hidden">' + ship(0, 0, 1.0, t, { lit: !dark, smoke: false }) + '</svg>', 1 - dn);
    s += R(-220, 420, 800, 400, "url(#seaNight)", { s: 0, op: .95 }); for (var i = 0; i < 10; i++) { var ph = ((t * .8 + i / 10) % 1); s += '<circle cx="' + f(120 + i * 14) + '" cy="' + f(424 - ph * 14) + '" r="' + f(3 + ph * 6) + '" fill="#cfe6f4" opacity="' + f2(.5 * (1 - ph) * (1 - dn * .5)) + '"/>'; } for (var b2 = 0; b2 < 4; b2++) s += lifeboat(30 + b2 * 100 + Math.sin(t * .5 + b2) * 8, 500 + (b2 % 2) * 24, .6, t, { n: 4, k: b2 * 3 }); return s + label("02:20", 180, 150, u, .2, 44, "#f2c230"); });
  // 41 — and the water was below zero
  shot(41, push([180, 320], [180, 320], 1.0, 1.08), function (u, d, t) { var s = night(t, 300); for (var i = 0; i < 12; i++) s += G('translate(' + f(hash(i) * 360) + ' ' + f(340 + hash(i + 4) * 240 + Math.sin(t + i) * 3) + ') rotate(' + f(hash(i) * 60 - 30) + ')', R(-12, -3, 24, 6, ["#8a6a44", "#e8e4d8", "#6a4a2a"][i % 3], { w: 1 })); return s + iceberg(300 - u * 6, 306, .6, { dark: true }) + lifeboat(90 + u * 8, 360, .7, t, { n: 5, k: 2 }) + bigNum("-2°", 180, 200, u, .3, 60, "#bcd8ea"); });
  // 42 — about 1,500 people died that night
  shot(42, push([180, 320], [180, 300], 1.0, 1.1), function (u, d, t) { var s = sky("skyStar") + stars(t, 220, 640), n = Math.round(clamp(u / (d * .95)) * 1500); for (var q2 = 0; q2 < 30; q2++) { var ph2 = ((t * .12 + hash(q2)) % 1); s += '<circle cx="' + f(hash(q2 + 9) * 360) + '" cy="' + f(520 - ph2 * 500) + '" r="2.2" fill="#ffe9b0" opacity="' + f2(.8 * (1 - ph2)) + '"/>'; } return s + R(-220, 520, 800, 300, "url(#seaNight)", { s: 0 }) + bigNum(n.toLocaleString("en"), 180, 300, u, .1, 56, "#fff"); });
  // 43 — one man lived in a strange way: the chief baker stayed in the water about two hours… and came out fine
  shot(43, push([180, 340], [180, 340], 1.05, 1.15), function (u, d, t) { var bob = Math.sin(t * 2) * 4; return night(t, 380) + G('translate(0 ' + f(bob) + ')', portrait(180, 420, 1.7, t, { hair: "short", top: "#f2efe6", skin: SK[2], mustache: true })) + R(-220, 470, 800, 400, "url(#seaNight)", { s: 0, op: .96 }) + '<path d="M110 ' + f(470 + bob * .3) + ' q20 -8 40 0 t40 0 t40 0" stroke="#cfe6f4" stroke-width="2" fill="none"/>' + iceberg(60, 386, .5, { dark: true }) + label("رئيس الخبازين", 180, 160, u, .5, 28, "#f2c230") + label("ساعتين في المية", 180, 196, u, 1.4, 18, "#fff"); });
  // 44 — 4 a.m.: the Carpathia arrived and took about 700 survivors from the boats
  shot(44, push([180, 320], [180, 330], 1.0, 1.1), function (u, d, t) { var s = sky("skyDawnT") + cloudBank(t, 200, 3, 5, "#f6b0a0", .6) + R(-220, 380, 800, 400, "url(#seaDawn)", { s: 0 }) + iceberg(40, 386, .9) + iceberg(320, 390, .6) + steamer(190, 400, 1.6, t, { fun: "#b8322a", smoke: true }); for (var i = 0; i < 4; i++) s += lifeboat(lerp(-40 + i * 120, 60 + i * 80, clamp(u / d)), 440 + (i % 2) * 22, .68, t, { n: 5, k: i * 4 }); return s + label("04:00", 180, 150, u, .3, 40, "#f2c230") + label("حوالي 700 ناجي", 180, 186, u, 1.0, 20, "#fff"); });
  // 45 — and the Californian? she found out in the morning… when her operator woke and switched on the set
  shot(45, push([180, 340], [180, 350], 1.0, 1.1), function (u, d, t) { return wireless(t, { pile: 1 }).replace("#3a2e22", "#5a4a3a") + rays(t, 340, 100, 2.4, 5, 500, .5) + operator(130, 560, 2.6, t, { sad: true }) + G('translate(250 250)', R(-60, -30, 120, 60, "#f2ead8", { w: 1.6 }) + txt("TITANIC", 0, -6, 13, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + txt("SUNK", 0, 14, 16, "#b8322a", { font: "Noto Serif", wt: 700 }), clamp((u - 1.4) / .4)) + label("عرفت الصبح", 180, 150, u, .5, 28, "#fff"); });
  // 46 — after that night the law changed: boats for everyone aboard, and wireless manned 24 hours
  shot(46, still, function (u, d, t) { return tri(t, u, d,
    function (t) { return R(-200, -200, 760, 600, "#e8dcc0", { s: 0 }) + G('translate(180 60)', R(-80, -40, 160, 84, "#fbfaf4", { w: 2 }) + '<path d="M-60 -20 h120 M-60 -6 h120 M-60 8 h80" stroke="#5a4a3a" stroke-width="2"/><circle cx="50" cy="26" r="12" fill="#b8322a" stroke="' + INK + '"/>') + label("1914", 60, 110, 9, 0, 16, "#5a4a3a"); },
    function (t) { var s = sky("skyMorning") + R(-200, 80, 760, 200, "url(#wood)", { s: 0 }); for (var i = 0; i < 6; i++) s += G('translate(' + (40 + i * 56) + ' 70)', P('M-24 -8 Q-22 6 -16 8 H16 Q22 6 26 -10 L22 -6 H-20 Z', "#f2efe6", { w: 1.4 })); return s; },
    function (t) { return wireless(t, { pile: 2 }).replace(/translate\(0 0\)/, "") + G('translate(0 -290)', operator(130, 560, 2.2, t, {})) + label("24 ساعة", 260, 60, 9, 0, 20, "#f2c230"); }); });
  // 47 — and Hamad Hassab went back to Cairo, and kept writing on his card: survivor of the Titanic
  shot(47, push([180, 340], [180, 330], 1.0, 1.12), function (u, d, t) { var s = sky("skySunset") + cloudBank(t, 140, 3, 4, "#f6b070", .7) + P('M-40 420 L60 280 L160 420 Z M120 420 L230 250 L340 420 Z M300 420 L370 320 L440 420 Z', "#c8985c", { w: 1.6 }) + P('M60 280 L90 420 L160 420 Z M230 250 L262 420 L340 420 Z', "#a87a44", { s: 0 }) + R(-200, 420, 760, 400, "#b8905a", { s: 0 }) + palm(40, 440, 1.2, t) + hassab(110, 620, 2.6, t, { mood: "smile" });
    return s + G('translate(240 330) rotate(-5)', R(-80, -46, 160, 92, "#fbf6e6", { w: 2 }) + txt("Hammad Hassab", 0, -18, 13, "#1a1a1a", { font: "Noto Serif", wt: 700 }) + txt("Dragoman · Cairo", 0, 0, 10, "#5a4a3a", { font: "Noto Serif", wt: 700 }) + txt("Survivor of the Titanic", 0, 24, 11, "#b8322a", { font: "Noto Serif", wt: 700 }), clamp((u - 1.2) / .5)) + label("ناجي من تيتانيك", 180, 170, u, 2.0, 28, "#fff"); });
  // 48 — tell us: which story next time?
  shot(48, push([180, 320], [180, 320], 1.0, 1.06), function (u, d, t) { return night(t, 420) + '<circle cx="180" cy="300" r="160" fill="url(#warm)" opacity=".18"/>' + ship(180, 420, .7, t) + label("قولولنا!", 180, 180, u, .3, 34, "#fff"); });

  window.__parts = { person: person, portrait: portrait, ship: ship, steamer: steamer, iceberg: iceberg, lifeboat: lifeboat, passenger: passenger, sailor: sailor, captain: captain, hassab: hassab, night: night, rocket: rocket, deck: deck };
  window.__chip = function (t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - .05 <= t) i++; return (i >= 7 && i <= 13) ? .9 : 0; };
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
