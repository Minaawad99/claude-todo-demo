/* «الرسم الهندسي» — shared helpers for the technical-diagram panels (portrait world 640×800), redrawn every frame.
   The camera never parks (a slow circle on top of each shot's push / pan); the drawn parts carry their own motion. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.12 * ease(u / 0.22); if (u < 0.36) return lerp(1.12, 1, (u - 0.22) / 0.14); return 1; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  var INK = "#2b2b2b", PAPER = "#eee5d0", ORANGE = "#c4532c", BLUE = "#46698a", OLIVE = "#6b7d3c", PUTTY = "#cdc9bb", SKIN = "#d9a184", BONE = "#f4efe0";
  var CLIPN = 0;
  function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
  function paper() { return '<rect x="-600" y="-600" width="1840" height="2000" fill="' + PAPER + '"/><rect x="-600" y="-600" width="1840" height="2000" fill="url(#grid)"/>'; }
  function dark(col) { return '<rect x="-600" y="-600" width="1840" height="2000" fill="' + (col || "#141414") + '"/>'; }
  function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
  // a leader-line label: dot on the part (px,py), line to (lx,ly), text beyond it; k (0..1) draws it in
  function label(px, py, lx, ly, text, col, k, sz) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 21;
    var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tw = text.length * sz * 0.5, tx = lx + (left ? -8 : 8), ty = ly + sz * 0.35;
    if (!left && lx + tw > 630) { left = true; tx = lx; ty = ly - 10; } else if (left && lx - tw < 10) { left = false; tx = lx; ty = ly - 10; }
    var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="4" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, left ? "start" : "end")   /* the page is RTL: "start" is the right-hand end */ + '</g>';
    return s;
  }
  function callout(n, x, y, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + T(n, 0, 6, 16, INK, 700) + '</g>'; }
  function crossMark(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * s) + ')"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + ORANGE + '" stroke-width="13" stroke-linecap="round"/></g>'; }
  function numBox(text, x, y, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = text.length * sz * 0.62 + 24; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-sz * 0.95) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" rx="5" fill="' + INK + '"/><text x="0" y="' + f(sz * 0.32) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:#fff;direction:ltr">' + text + '</text></g>'; }
  // a wavy ray from (x1,y1) to (x2,y2): amplitude a, wavelength wl, phase moves with t; p = how far it has travelled
  function waveRay(x1, y1, x2, y2, t, col, a, wl, p, sw) {
    p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, d = "";
    for (var s = 0; s <= len * p; s += 4) { var o = Math.sin(s / (wl || 22) * Math.PI * 2 - t * 9) * (a || 7); d += (s ? " L" : "M") + f(x1 + ux * s - uy * o) + " " + f(y1 + uy * s + ux * o); }
    return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 3) + '" fill="none" stroke-linecap="round"/>';
  }
  function arrow(x1, y1, x2, y2, col, w, p) {
    p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = (w || 3) * 3.2;
    return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.6) + ' ' + f(ye - Math.sin(a) * h * 0.6) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe) + ' ' + f(ye) + ' L' + f(xe - Math.cos(a - 0.45) * h) + ' ' + f(ye - Math.sin(a - 0.45) * h) + ' L' + f(xe - Math.cos(a + 0.45) * h) + ' ' + f(ye - Math.sin(a + 0.45) * h) + ' Z" fill="' + (col || INK) + '"/>';
  }
  // a magnified inset: a circle at (cx,cy) radius r showing `inner` (drawn in its own coordinates, centred on 0,0)
  function inset(cx, cy, r, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var id = "in" + (++CLIPN); return '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(k) + ')"><clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="' + PAPER + '"/><g clip-path="url(#' + id + ')">' + inner + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 10 * Math.sin(t * 1.1), cy = c[1] + 8 * Math.cos(t * 1.1), z = c[2] * (1 + 0.02 * Math.sin(t * 0.9));
    svg.innerHTML = '<g transform="translate(320 400) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="800" filter="url(#paperN)"/>';
    return i;
  };
  // ── «الواي فاي بيبعت الداتا في الهوا إزاي؟»: isometric drawings (floor, router, phones, walls, oven, dish) on the
  // paper, hatched sections, leader-line labels, magnified insets and numbered callouts. Iso: x,y on the floor, z up.
  var IS = 1.0, GRN = "#5c8f3e", RED = "#c4532c";
  function P(x, y, z) { return [(x - y) * 0.866 * IS, (x + y) * 0.5 * IS - z * IS]; }
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16); return "rgb(" + Math.round(((n >> 16) & 255) * k) + "," + Math.round(((n >> 8) & 255) * k) + "," + Math.round((n & 255) * k) + ")"; }
  function poly(p3, fill, sw, extra) { return '<polygon points="' + p3.map(function (p) { var q = P(p[0], p[1], p[2]); return f(q[0]) + "," + f(q[1]); }).join(" ") + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 1.8) + '" stroke-linejoin="round"' + (extra || "") + '/>'; }
  function line3(a, b, col, w, dash) { var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>'; }
  // a box: x,y floor corner, z base, w d h sizes; faces: front-left (+y), front-right (+x), top; o.hatch hatches the right face
  function box(x, y, z, w, d, h, c, o) {
    o = o || {}; var s = poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], shade(c, 0.86));
    s += poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], shade(c, 0.7));
    s += poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c);
    if (o.hatch) s += poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], "url(#hatch)", 1);
    return s;
  }
  function floor() {
    var s = poly([[-240, -170, 0], [240, -170, 0], [240, 170, 0], [-240, 170, 0]], "#e3d8bf", 1.2);
    for (var k = -240; k <= 240; k += 40) s += line3([k, -170, 0], [k, 170, 0], "#cbbd9f", 1);
    for (var m = -160; m <= 170; m += 40) s += line3([-240, m, 0], [240, m, 0], "#cbbd9f", 1);
    return s;
  }
  function wall(x, y, w, d, h) { return box(x, y, 0, w, d, h, PUTTY, { hatch: true }); }
  // the router: a white box with two antennas; the LEDs blink
  function router(x, y, t, s) {
    s = s || 1; var g = box(x - 40 * s, y - 24 * s, 0, 80 * s, 48 * s, 24 * s, BONE);
    g += line3([x - 26 * s, y - 14 * s, 24 * s], [x - 26 * s, y - 14 * s, 74 * s], INK, 2.4) + line3([x + 26 * s, y - 14 * s, 24 * s], [x + 26 * s, y - 14 * s, 74 * s], INK, 2.4);
    for (var k = 0; k < 3; k++) { var p = P(x - 18 * s + k * 16 * s, y + 4 * s, 18 * s); g += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(3.5 * s) + '" fill="' + (k === 2 ? BLUE : OLIVE) + '" opacity="' + f(0.35 + 0.65 * Math.abs(Math.sin(t * 3 + k))) + '"/>'; }
    return g;
  }
  // a phone standing on the floor, screen on the front face; mode: 'video' shows a progress bar moving
  function phone(x, y, t, s, mode) {
    s = s || 1; var g = box(x - 22 * s, y - 4 * s, 0, 44 * s, 8 * s, 92 * s, "#3b4048");
    g += poly([[x - 17 * s, y + 4 * s, 9 * s], [x + 17 * s, y + 4 * s, 9 * s], [x + 17 * s, y + 4 * s, 80 * s], [x - 17 * s, y + 4 * s, 80 * s]], "#1f3a4d");
    if (mode === "video") g += poly([[x - 12 * s, y + 4 * s, 16 * s], [x + 12 * s, y + 4 * s, 16 * s], [x + 12 * s, y + 4 * s, 22 * s], [x - 12 * s, y + 4 * s, 22 * s]], "#c9d6df", 1, "");
    if (mode === "video") g += poly([[x - 12 * s, y + 4 * s, 16 * s], [x - 12 * s + 24 * s * (t * 0.3 % 1), y + 4 * s, 16 * s], [x - 12 * s + 24 * s * (t * 0.3 % 1), y + 4 * s, 22 * s], [x - 12 * s, y + 4 * s, 22 * s]], ORANGE, 0.8);
    return g;
  }
  // a wave running along x at height z (iso)
  function wave3(x0, x1, y, z, t, amp, col, w) {
    var d = ""; for (var x = x0; x <= x1; x += 6) { var p = P(x, y, z + Math.sin(x * 0.07 - t * 6) * amp); d += (d ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
    return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (w || 2.6) + '" fill="none" stroke-linecap="round"/>';
  }
  // a horizontal ring (radio wave leaving an antenna), arc from a0 to a1, opacity op
  function ring(cx, cy, z, r, a0, a1, col, op) {
    var d = ""; for (var i = 0; i <= 40; i++) { var a = lerp(a0, a1, i / 40), p = P(cx + r * Math.cos(a), cy + r * Math.sin(a), z); d += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
    return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="2.2" fill="none" opacity="' + f(op == null ? 1 : op) + '" stroke-linecap="round"/>';
  }
  function waves(cx, cy, z, t, n, col, a0, a1) { var s = ""; for (var k = 0; k < n; k++) { var r = 30 + ((t * 40 + k * 34) % (n * 34)); s += ring(cx, cy, z, r, a0, a1, col, clamp(1 - r / (n * 34 + 30))); } return s; }
  // a packet of data drawn flat on the page: 0 picture (blue), 1 message (orange), 2 sound (olive)
  function pk(x, y, kind, op) {
    var c = kind === 0 ? BLUE : kind === 1 ? ORANGE : OLIVE;
    return '<g opacity="' + f(op) + '"><rect x="' + f(x - 9) + '" y="' + f(y - 9) + '" width="18" height="18" rx="3" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="4.2" fill="' + c + '"/></g>';
  }
  function bit(x, y, v, col, op, sz) { return T(v, x, y, sz || 20, col || INK, 900) + (op == null ? "" : ""); }
  // a bundle of bits, travelling along a screen-space line from (x0,y0) to (x1,y1)
  function bitsOut(x0, y0, x1, y1, t, n, sp, col) {
    var s = ""; for (var i = 0; i < n; i++) { var c = t * sp + i / n, p = c % 1, v = hash(i * 13 + Math.floor(c)) > 0.5 ? "1" : "0"; s += '<g opacity="' + f(Math.min(1, p * 4, (1 - p) * 4)) + '">' + bit(lerp(x0, x1, p), lerp(y0, y1, p) + Math.sin(p * 9 + i) * 8, v, col || BLUE, 1, 20) + '</g>'; }
    return s;
  }
  function packets(x0, y0, x1, y1, bulge, t, n, sp) {
    var s = ""; for (var i = 0; i < n; i++) { var p = (t * sp + i / n) % 1, x = lerp(x0, x1, p), y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * bulge; s += pk(x, y, i % 3, Math.min(1, p * 4, (1 - p) * 4)); }
    return s;
  }
  // a 2-D wave with a bit under each cell (the data is the shape of the wave)
  function bitWaveScreen(x0, x1, y, t, amp, sp, w, seed) {
    var d = "", cell = 60; for (var x = x0; x <= x1; x += 3) { var b = Math.floor((x + t * sp) / cell), v = hash(b * 3 + seed) > 0.5, A = v ? amp * 1.5 : amp * 0.5, fr = v ? 0.3 : 0.12; d += (d ? " L" : "M") + f(x) + " " + f(y + Math.sin(x * fr - t * 7) * A); }
    var labels = ""; for (var bb = Math.floor((x0 + t * sp) / cell) - 1; bb * cell - t * sp < x1; bb++) { var xc = bb * cell - t * sp + cell / 2; if (xc > x0 + 20 && xc < x1 - 20) labels += T(hash(bb * 3 + seed) > 0.5 ? "1" : "0", xc, y + amp * 2.6, 22, OLIVE, 900); }
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w || 3) + '" fill="none" stroke-linejoin="round"/>' + labels;
  }
  // a magnified inset of a small chip
  function chipIcon(t) {
    var s = '<rect x="-34" y="-26" width="68" height="52" rx="5" fill="#2b2f35" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) s += '<rect x="' + (-36 + k * 12) + '" y="-34" width="5" height="8" fill="#b89a52"/><rect x="' + (-36 + k * 12) + '" y="26" width="5" height="8" fill="#b89a52"/>';
    s += T(hash(Math.floor(t * 4)) > 0.5 ? "1" : "0", 0, 8, 26, GRN, 900);
    return s;
  }
  // ── shots: one per script line (line 0 is the opening card, line 24 the summary card) ─────────────────────────
  var SH = [];
  function camL(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  shot(0, function () { return [0, 0, 1]; }, function () { return paper(); });
  // 1 — pictures and sound go through the air, you can't see them
  shot(1, camL(-10, 0, 1.0, 10, 0, 1.08), function (u, d, t) {
    var s = paper() + floor() + router(-130, 0, t, 1.1) + phone(130, 0, t, 1.2, "video");
    s += waves(-130, 0, 84, t, 3, BLUE, -0.9, 0.9) + packets(-100, -4, 104, -4, 96, t, 8, 0.22);
    s += label(-100, -104, -210, -205, "صور وصوت", BLUE, (u - 0.5) / 0.8, 20) + label(40, -120, 200, -235, "مش شايفهم", ORANGE, (u - 1.4) / 0.8, 20);
    return s;
  });
  // 2 — the puzzle: how does the data travel, and who decodes it?
  shot(2, camL(0, 0, 1.0, 0, -10, 1.1), function (u, d, t) {
    var s = paper() + floor() + router(-120, 10, t, 1.0) + phone(120, 10, t, 1.1, "video");
    s += packets(-90, -6, 96, -6, 70, t, 6, 0.2);
    s += T("؟", -20, -150 + Math.sin(t * 2) * 5, 60, ORANGE, 900) + T("؟", 60, -190 + Math.cos(t * 2) * 5, 36, BLUE, 900);
    s += label(0, -20, -200, -80, "الداتا؟", BLUE, (u - 0.4) / 0.8, 20) + label(120, -10, 230, -140, "بتفكّها إزاي؟", ORANGE, (u - 1.6) / 0.8, 20);
    return s;
  });
  // 3 — the title card
  shot(3, camL(0, 0, 0.98, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor() + router(0, 0, t, 1.6);
    s += '<rect x="-290" y="-360" width="580" height="90" fill="' + PAPER + '" opacity=".9"/>';
    s += label(0, 0, 0, 0, "", INK, 0) + T("إيه الحكاية؟", 0, -310, 44, ORANGE, 900) + T("هشرحهالك في دقيقة", 0, -262, 24, INK, 700);
    s += ring(0, 0, 90, 150 + (t * 20) % 60, 0, Math.PI * 2, BLUE, 0.5);
    return s;
  });
  // 4 — close on the router: what it really sends is 0s and 1s
  shot(4, camL(0, 0, 1.4, 0, 0, 1.55), function (u, d, t) {
    var s = paper() + floor() + '<g transform="scale(1.7)">' + router(0, 0, t, 1.2) + '</g>';
    s += bitsOut(-40, 120, 40, 260, t, 8, 0.5, BLUE);
    s += label(-30, -40, -220, -190, "الراوتر", BLUE, (u - 0.4) / 0.8, 20) + label(40, 240, 220, 300, "أصفار وواحدات", ORANGE, (u - 1.2) / 0.8, 20);
    return s;
  });
  // 5 — a photo turns into a long row of numbers
  shot(5, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var pr = clamp((u - 0.5) / 1.4), s = paper() + floor() + phone(-170, 0, t, 1.3, "video");
    s += arrow(-100, -10, -10, -10, OLIVE, 4, pr);
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) { var v = hash(r * 4 + c + Math.floor(t * 2) * 0.1) > 0.5 ? "1" : "0"; s += bit(40 + c * 40, -150 + r * 40, v, BLUE, 1, 26); }
    s += label(-170, -140, -260, -250, "صورة", BLUE, (u - 0.2) / 0.8, 20) + label(120, -160, 230, -250, "أرقام", OLIVE, (u - 1.0) / 0.8, 20);
    return s;
  });
  // 6 — the radio tower: waves go out in every direction
  shot(6, camL(0, 0, 1.0, 0, -20, 1.06), function (u, d, t) {
    var s = paper() + floor();
    for (var k = 0; k < 4; k++) s += line3([-18, -18, 0], [-6, -6, 150 - k * 0], INK, 1.5);
    s += box(-18, -18, 0, 36, 36, 4, OLIVE) + box(-5, -5, 4, 10, 10, 140, "#d7d1c2", { hatch: true });
    s += box(-22, -22, 130, 44, 44, 4, OLIVE);
    s += waves(0, 0, 150, t, 4, BLUE, -0.2, Math.PI * 2 - 0.2);
    s += label(10, -140, 170, -270, "موجة راديو", BLUE, (u - 0.4) / 0.8, 20);
    return s;
  });
  // 7 — the wave changes shape with every bit
  shot(7, camL(0, 0, 1.0, 0, 0, 1.04), function (u, d, t) {
    var s = paper() + bitWaveScreen(-300, 300, 0, t, 34, 60, 3.2, 0);
    s += line3([-300, 0, 0], [300, 0, 0], OLIVE, 1, "4 6");
    return s + label(0, -80, 0, -200, "كل تغيير = رقم", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 8 — zoom on the wave: the data IS the shape of the wave
  shot(8, camL(0, 0, 1.6, 0, 0, 1.9), function (u, d, t) {
    var s = paper() + bitWaveScreen(-300, 300, 0, t, 34, 60, 6, 0);
    return s + label(0, -70, 60, -190, "الداتا هي الشكل", BLUE, (u - 0.5) / 0.8, 18);
  });
  // 9 — it travels at the speed of light, which the eye can't see
  shot(9, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor() + router(-130, 0, t, 1.0) + phone(130, 0, t, 1.1, "video");
    var a = P(-130, 0, 90), b = P(130, 0, 90);
    s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 12" stroke-dashoffset="' + f(-t * 160) + '"/>';
    s += '<circle cx="230" cy="-270" r="22" fill="#f4c26b" stroke="' + INK + '" stroke-width="1.6"/>';
    s += label(0, -20, -200, -130, "بسرعة الضوء", ORANGE, (u - 0.5) / 0.8, 20);
    return s;
  });
  // 10 — the phone's antenna catches the wave; a chip reads it (magnified inset)
  shot(10, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor() + waves(-220, 0, 60, t, 3, BLUE, -0.9, 0.9) + phone(40, 0, t, 1.7, "video");
    s += inset(200, -190, 70, '<g transform="scale(1.8)">' + chipIcon(t) + '</g>', (u - 0.6) / 0.8);
    s += label(200, -120, 230, -300, "شريحة صغيرة", BLUE, (u - 1.2) / 0.8, 18);
    return s;
  });
  // 11 — the numbers come back together as a picture, a message or a sound
  shot(11, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + bitsOut(-300, -40, 90, -40, t, 14, 0.25, BLUE);
    s += pk(180, -150, 0, 1) + pk(180, -40, 1, 1) + pk(180, 70, 2, 1);
    s += '<g transform="translate(180 -150) scale(2)">' + pk(0, 0, 0, 1) + '</g>';
    s += label(200, -150, 260, -230, "صورة", BLUE, (u - 0.8) / 0.8, 20) + label(200, -40, 260, -110, "رسالة", ORANGE, (u - 1.2) / 0.8, 20) + label(200, 70, 260, 0, "صوت", OLIVE, (u - 1.6) / 0.8, 20);
    return s;
  });
  // 12 — one router, many devices on the same air
  shot(12, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor() + router(0, 0, t, 1.2);
    var devs = [[-190, -90], [-190, 70], [190, -90], [190, 70], [0, -150], [0, 140]];
    devs.forEach(function (p, i) { s += line3([0, 0, 40], [p[0], p[1], 30], BLUE, 1.2, "3 4"); s += phone(p[0], p[1], t, 0.8, "video"); s += packets(0, 0, p[0], p[1], 0, t, 1, 0.3 + i * 0.03); });
    s += numBox("20", 0, 150, u / 0.8 > 0 ? 1 : 0, 26);
    return s + label(-30, 0, -200, 0, "عشرين جهاز", ORANGE, (u - 0.8) / 0.8, 20);
  });
  // 13 — they listen first, and wait while someone else is sending
  shot(13, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor(), on = Math.floor(t * 0.7) % 5;
    for (var i = 0; i < 5; i++) {
      var x = -200 + i * 100, y = -40 + (i % 2) * 40;
      s += phone(x, y, t, 0.9, "video");
      s += i === on ? waves(x, y, 96, t, 2, ORANGE, -Math.PI, Math.PI) : '<circle cx="' + f(P(x, y, 110)[0]) + '" cy="' + f(P(x, y, 110)[1]) + '" r="10" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>';
    }
    return s + label(-100, -60, -220, -200, "بتستنى شوية", ORANGE, (u - 0.5) / 0.8, 20);
  });
  // 14 — the stream is cut into many lanes, one for each device
  shot(14, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + bitWaveScreen(-300, -120, 0, t, 30, 40, 5, 0), k2 = 0;
    for (var k = 0; k < 8; k++) {
      var y = -230 + k * 66, c = k % 2 ? BLUE : OLIVE;
      s += '<path d="M-120 0 C-40 0 -40 ' + f(y) + ' 40 ' + f(y) + ' L220 ' + f(y) + '" stroke="' + INK + '" stroke-width="5" fill="none" opacity=".4"/>';
      s += '<path d="M-120 0 C-40 0 -40 ' + f(y) + ' 40 ' + f(y) + ' L220 ' + f(y) + '" stroke="' + c + '" stroke-width="2.6" fill="none" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 90 * (k % 3 + 1)) + '"/>';
      s += callout(String(k + 1), 250, y, (u - 0.2 - k * 0.1) / 0.6);
    }
    return s + label(-200, 0, -240, 0 + 0, "مئات الخطوط", BLUE, (u - 0.6) / 0.8, 20);
  });
  // 15 — the teacher hands the papers to every desk at once
  shot(15, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor() + box(-190, -20, 0, 80, 50, 30, "#9b7b52", { hatch: true }) + box(-180, -20, 30, 40, 30, 6, PAPER);
    for (var i = 0; i < 5; i++) { var x = -40 + (i % 3) * 110, y = -60 + Math.floor(i / 3) * 120; s += box(x, y, 0, 60, 40, 22, "#c8b48f"); s += callout(String(i + 1), x + 30, y + 20 + 0, 1); }
    for (var k = 0; k < 6; k++) { var p = (t * 0.5 + k / 6) % 1, tx = lerp(-150, -40 + (k % 3) * 110 + 30, p), ty = lerp(-10, -60 + Math.floor(k / 3) * 120, p) - Math.sin(p * Math.PI) * 60; s += pk(tx, ty, 0, Math.min(1, p * 5)); }
    return s + label(-150, -90, -260, -200, "المدرس", BLUE, (u - 0.4) / 0.8, 20) + label(60, -10, 240, 40, "الكراسات", OLIVE, (u - 1.2) / 0.8, 20);
  });
  // 16 — distance and walls: the wave gets weaker
  shot(16, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor() + router(-200, 0, t, 1.0) + wall(-20, -60, 14, 120, 120) + phone(160, 0, t, 1.1, "video");
    for (var k = 0; k < 5; k++) { var r = 30 + ((t * 40 + k * 40) % 200); s += ring(-200, 0, 80, r, -0.9, 0.9, BLUE, clamp(1 - r / 200) * (r < 170 ? 1 : 0)); }
    s += crossMark(40, -150, 0.5, clamp((u - 1.0) / 0.6));
    return s + label(-20, -80, -220, -220, "الحيطة بتاكل", ORANGE, (u - 0.5) / 0.8, 20);
  });
  // 17 — two rooms, three walls: four bars in one room, one bar behind the walls
  shot(17, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor() + wall(-70, -150, 14, 300, 120) + wall(-20, -150, 14, 300, 120) + wall(30, -150, 14, 300, 120);
    s += router(-180, 0, t, 0.9) + phone(-110, 60, t, 0.9, "video");
    s += bars(-200, 150, 4) + phone(120, 60, t, 0.9, "video") + bars(-30, 150, 1);
    for (var i = 0; i < 2; i++) s += pk(-110 + 40 * i, 0, 1, 0.6);
    return s + label(-70, -150, -200, -270, "تلات حيطان", ORANGE, (u - 0.4) / 0.8, 20);
  });
  // bars of signal strength (flat): n of 4 lit
  function bars(x, y, n) { var s = ""; for (var i = 0; i < 4; i++) s += '<rect x="' + (x + i * 16) + '" y="' + f(y - (10 + i * 10)) + '" width="10" height="' + (10 + i * 10) + '" fill="' + (i < n ? GRN : "#cfc8b8") + '" stroke="' + INK + '" stroke-width="1"/>'; return s; }
  // 18 — the microwave runs at a frequency next to Wi-Fi's: they clash now and then
  shot(18, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var s = paper() + floor() + box(-220, -40, 0, 110, 70, 80, "#e9e6df") + box(-200, -20, 10, 70, 6, 52, "#2d3136");
    s += router(160, 20, t, 1.1) + waves(160, 20, 60, t, 3, BLUE, -0.9, 0.9);
    if (Math.sin(t * 9) > -0.2) s += '<path d="M-60 -40 L-46 -60 L-36 -30 L-22 -56 L-12 -28 L4 -60" stroke="' + RED + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
    s += numBox("2.45 GHz", -60, 110, clamp((u - 1.0) / 0.6), 22);
    return s + label(-160, -40, -260, -170, "الميكروويف", BLUE, (u - 0.4) / 0.8, 20) + label(-20, -60, 60, -200, "خناقة", ORANGE, (u - 1.6) / 0.8, 22);
  });
  // 19 — the name: not an acronym, a marketing choice
  shot(19, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper();
    s += '<ellipse cx="0" cy="-40" rx="200" ry="100" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M-60 52 L-90 130 L-20 66 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
    s += T("Wi-Fi", 0, -20, 54, BLUE, 900) + T("Wireless Fidelity", 0, 30, 18, "#6f6a62", 700);
    var sl = clamp((u - 1.2) / 0.8); s += '<path d="M-130 26 L' + f(-130 + 260 * sl) + ' 26" stroke="' + RED + '" stroke-width="4" stroke-linecap="round"/>';
    return s + label(90, 26, 230, 160, "مش اختصار", ORANGE, (u - 1.4) / 0.8, 22);
  });
  // 20 — a radio telescope on the ground, and a black hole in the sky (inset)
  shot(20, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor();
    var dp = P(-120, 0, 60); s += line3([-120, 0, 0], [-120, 0, 90], "#5a6068", 4) + '<path d="M' + f(dp[0] - 60) + ' ' + f(dp[1] - 10) + ' Q' + f(dp[0]) + ' ' + f(dp[1] + 40) + ' ' + f(dp[0] + 60) + ' ' + f(dp[1] - 10) + ' Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4"/>';
    s += inset(170, -120, 92, '<circle r="20" fill="#000"/><ellipse rx="60" ry="16" fill="none" stroke="#ffd98a" stroke-width="9" transform="rotate(' + f(t * 40) + ')"/><circle r="20" fill="#000"/>', (u - 0.5) / 0.8);
    s += label(-120, -60, -240, -220, "أستراليا", BLUE, (u - 0.4) / 0.8, 20) + label(170, -200, 240, -300, "ثقوب سوداء", ORANGE, (u - 1.2) / 0.8, 20);
    return s;
  });
  // 21 — the money from the patents: stacks that keep growing
  shot(21, camL(0, 0, 1.0, 0, 0, 1.05), function (u, d, t) {
    var k = clamp(u / d), n = 2 + Math.floor(k * 10), s = paper() + floor();
    for (var i = 0; i < n; i++) s += box(-120, -40, i * 9, 110, 60, 9, "#7fb07a");
    for (var j = 0; j < 1 + Math.floor(k * 12); j++) s += box(60, -20, j * 9, 90, 50, 9, "#8fc08a");
    return s + numBox("مئات الملايين", 0, -250, clamp((u - 0.3) / 0.6), 22) + label(-70, -40 - n * 9, -230, -170, "دولار", BLUE, (u - 1.0) / 0.8, 20);
  });
  // 22 — the film you watched: every bit delivered in order
  shot(22, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor() + phone(120, 0, t, 1.5, "video") + bitsOut(-300, -100, 60, -40, t, 12, 0.3, BLUE);
    return s + label(-120, -100, -230, -230, "موجة", ORANGE, (u - 0.5) / 0.8, 20);
  });
  // 23 — payoff: a precise order of millions of numbers and waves (inset of the order)
  shot(23, camL(0, 0, 1.0, 0, 0, 1.06), function (u, d, t) {
    var s = paper() + floor() + router(-190, 0, t, 0.9) + phone(170, 0, t, 1.2, "video") + packets(-150, -10, 150, -10, 60, t, 8, 0.25);
    var grid = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) grid += bit(-70 + c * 18, -20 + r * 18, (r + c) % 2 ? "1" : "0", BLUE, 1, 14);
    s += inset(60, -220, 80, grid, (u - 0.8) / 0.8);
    return s + label(60, -140, 220, -300, "ترتيب دقيق", ORANGE, (u - 1.2) / 0.8, 20);
  });
  // 24 — the summary card is an HTML overlay; this placeholder keeps the panel valid
  shot(24, function () { return [0, 0, 1]; }, function () { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__intro = function (svg, t) {
    var s = '<rect width="580" height="320" fill="#141414"/><g transform="translate(290 170)">' + floor().replace(/#e3d8bf/g, "#1d1d1d").replace(/#cbbd9f/g, "#333") + '</g>';
    s += '<g transform="translate(290 170) scale(1.6)">' + router(0, 0, t, 1.1) + phone(90, 40, t, 1.1, "video") + '</g>';
    var sx = ((t * 260) % 760) - 90; s += '<rect x="' + f(sx) + '" y="0" width="60" height="320" fill="#9fc3dc" opacity=".12"/>';
    svg.innerHTML = s;
  };
  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="300" fill="#e4d9bf"/><g transform="translate(290 160) scale(0.95)">' + floor() + router(-120, 0, t, 1.2) + phone(120, 0, t, 1.2, "video") + packets(-90, -4, 100, -4, 60, t, 6, 0.25) + '</g>';
    [["1", 150, 70], ["2", 290, 60], ["3", 200, 210], ["4", 390, 150], ["5", 440, 80], ["6", 330, 250]].forEach(function (c, i) { s += callout(c[0], c[1], c[2], (u - 0.2 - i * 0.15) / 0.6); });
    svg.innerHTML = s;
  };
  window.__parts = { router: router, phone: phone, box: box, P: P, label: label, inset: inset, callout: callout };
})();
