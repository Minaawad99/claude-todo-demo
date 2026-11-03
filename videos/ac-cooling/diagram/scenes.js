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
  function shot(line, cam, draw, hud) { SH.push({ a: L(line), cam: cam, draw: draw, hud: hud }); }   // hud(u,d,t): drawn in screen space (640×800), not moved by the camera
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 14 * Math.sin(t * 1.3), cy = c[1] + 11 * Math.cos(t * 1.3), z = c[2] * (1 + 0.02 * Math.sin(t * 0.9));
    svg.innerHTML = '<g transform="translate(320 400) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>' + (sh.hud ? sh.hud(u, d, t) : '') + '<rect width="640" height="800" filter="url(#paperN)"/>';
    return i;
  };

  // ── v2 (the engine reference): isometric objects, gauges, counters, the chapter stepper, dot streams ──
  var RED = "#bd522b", OLV = "#626b3b", SLATE = "#5e728d", C30 = Math.cos(Math.PI / 6), TOP = "#e4dccb", MID = "#cdc4ae", DRK = "#a99f88";
  var SERIF = "Noto Serif, serif";
  // o = [ox, oy, scale]: iso origin on screen; x runs down-right, y down-left, z up
  function iso(o, x, y, z) { return [o[0] + (x - y) * C30 * o[2], o[1] + (x + y) * 0.5 * o[2] - z * o[2]]; }
  function poly(pts, fill, sw, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || '') + '/>'; }
  function line3(o, a, b, col, w, ex) { var p = iso(o, a[0], a[1], a[2]), q = iso(o, b[0], b[1], b[2]); return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 1) + '"' + (ex || '') + '/>'; }
  // a box from (x,y,z) of size w (x) × d (y) × h (z); tones [top, left(+y) face, right(+x) face]; hatching on the right face
  function isoBox(o, x, y, z, w, d, h, tones, noHatch) {
    tones = tones || [TOP, MID, DRK];
    var top = [iso(o, x, y, z + h), iso(o, x + w, y, z + h), iso(o, x + w, y + d, z + h), iso(o, x, y + d, z + h)],
        lf = [iso(o, x, y + d, z), iso(o, x + w, y + d, z), iso(o, x + w, y + d, z + h), iso(o, x, y + d, z + h)],
        rt = [iso(o, x + w, y, z), iso(o, x + w, y + d, z), iso(o, x + w, y + d, z + h), iso(o, x + w, y, z + h)];
    return poly(lf, tones[1]) + poly(rt, tones[2]) + (noHatch ? '' : poly(rt, 'url(#hatchD)', 0)) + poly(top, tones[0]);
  }
  // points of a circle on one of the three planes: "z" (horizontal, centre c=[x,y,z]), "x" (the right face) or "y" (the left face)
  function isoRing(o, plane, c, r, n) {
    var pts = []; n = n || 36;
    for (var k = 0; k < n; k++) { var a = k / n * Math.PI * 2, u = Math.cos(a) * r, v = Math.sin(a) * r;
      pts.push(plane === "z" ? iso(o, c[0] + u, c[1] + v, c[2]) : plane === "x" ? iso(o, c[0], c[1] + u, c[2] + v) : iso(o, c[0] + u, c[1], c[2] + v)); }
    return pts;
  }
  // a fan on a vertical face: ring + spinning blades (ang in radians)
  function isoFan(o, plane, c, r, ang, col) {
    var s = poly(isoRing(o, plane, c, r), col || "#3a3a36", 2), bl = "";
    for (var b = 0; b < 4; b++) { var a0 = ang + b * Math.PI / 2, pts = [];
      [[0.12, 0], [0.9, -0.28], [0.95, 0.05], [0.2, 0.22]].forEach(function (q) { var a = a0 + q[1], u = Math.cos(a) * r * q[0], v = Math.sin(a) * r * q[0];
        pts.push(plane === "x" ? iso(o, c[0], c[1] + u, c[2] + v) : iso(o, c[0] + u, c[1], c[2] + v)); });
      bl += poly(pts, "#bdb6a2", 1.2); }
    s += bl; var hub = isoRing(o, plane, c, r * 0.14, 16); s += poly(hub, INK, 1);
    for (var g = 1; g <= 3; g++) s += poly(isoRing(o, plane, c, r * g / 3.2, 40), "none", 0.9);   // the grille rings
    return s;
  }
  // a vertical cylinder standing on (x,y,z), radius r, height h
  function isoCyl(o, x, y, z, r, h, fill, topFill) {
    var s = o[2], c0 = iso(o, x, y, z), c1 = iso(o, x, y, z + h), rx = r * C30 * Math.SQRT2 * s, ry = r * Math.SQRT1_2 * s;
    var body = '<path d="M' + f(c0[0] - rx) + ' ' + f(c0[1]) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 0 ' + f(c0[0] + rx) + ' ' + f(c0[1]) + ' L' + f(c1[0] + rx) + ' ' + f(c1[1]) + ' L' + f(c1[0] - rx) + ' ' + f(c1[1]) + ' Z" fill="' + (fill || MID) + '" stroke="' + INK + '" stroke-width="2"/>';
    body += '<path d="M' + f(c0[0] + rx * 0.35) + ' ' + f(c0[1] + ry * 0.93) + ' L' + f(c1[0] + rx * 0.35) + ' ' + f(c1[1] + ry * 0.93) + ' L' + f(c1[0] + rx) + ' ' + f(c1[1]) + ' L' + f(c0[0] + rx) + ' ' + f(c0[1]) + ' Z" fill="url(#hatchD)"/>';
    return body + '<ellipse cx="' + f(c1[0]) + '" cy="' + f(c1[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + (topFill || TOP) + '" stroke="' + INK + '" stroke-width="2"/>';
  }
  // a vertical gauge tube: (x,y) = bottom centre, height h, value 0..1, label under it
  function gauge(x, y, h, v, lab, col, w) {
    w = w || 26; v = clamp(v); var s = R(x - w / 2, y - h, w, h, PAPER, 1.8) + R(x - w / 2 + 3, y - 3 - (h - 6) * v, w - 6, (h - 6) * v, col || RED, 0);
    for (var k = 1; k < 5; k++) s += '<path d="M' + f(x - w / 2) + ' ' + f(y - h * k / 5) + ' h7" stroke="' + INK + '" stroke-width="1"/>';
    return s + (lab ? T(lab, x, y + 26, 19, col || RED, 800) : '');
  }
  // a thermometer: bulb at the bottom, v 0..1, text = the reading above it
  function thermo(x, y, h, v, col, text, sz) {
    v = clamp(v); var s = R(x - 9, y - h, 18, h, "#f7f2e6", 2, 9) + '<circle cx="' + f(x) + '" cy="' + f(y + 6) + '" r="17" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + R(x - 4, y - 4 - (h - 12) * v, 8, (h - 12) * v + 8, col, 0, 3);
    for (var k = 1; k < 6; k++) s += '<path d="M' + f(x + 9) + ' ' + f(y - h * k / 6) + ' h6" stroke="' + INK + '" stroke-width="1.2"/>';
    return s + (text ? serifNum(text, x, y - h - 18, sz || 34, col) : '');
  }
  function serifNum(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:800 ' + sz + 'px ' + SERIF + ';fill:' + (col || INK) + ';direction:ltr">' + text + '</text>'; }
  function ticker(a, b, k) { return Math.round(lerp(a, b, ease(clamp(k)))); }
  function stopwatch(x, y, r, t) { var a = t * 4; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>' + R(x - 4, y - r - 8, 8, 7, INK, 0) + '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.sin(a) * r * 0.8) + ' ' + f(y - Math.cos(a) * r * 0.8) + '" stroke="' + RED + '" stroke-width="2.4"/>'; }
  // the chapter stepper: n circles across the top, right to left; the active one red
  function stepper(n, act, x, y, k) {
    k = k == null ? 1 : clamp(k); if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">';
    for (var j = 0; j < n; j++) { var cx = x - j * 62, on = j + 1 === act; s += '<circle cx="' + f(cx) + '" cy="' + f(y) + '" r="' + (on ? 22 : 17) + '" fill="' + PAPER + '" stroke="' + (on ? RED : "#9a9282") + '" stroke-width="' + (on ? 3.2 : 1.6) + '"/>' + serifNum(String(j + 1), cx, y + (on ? 9 : 7), on ? 25 : 19, on ? RED : "#9a9282"); }
    return s + '</g>';
  }
  // dots streaming along a polyline pts at speed v (px/s), spacing gap, radius r; phase t
  function plen(pts) { var L = 0; for (var k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L; }
  function pAt(pts, s) { for (var k = 1; k < pts.length; k++) { var l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); if (s <= l) { var q = s / l; return [lerp(pts[k - 1][0], pts[k][0], q), lerp(pts[k - 1][1], pts[k][1], q)]; } s -= l; } return pts[pts.length - 1]; }
  function dotStream(pts, t, v, gap, r, col, upto) {
    var L = plen(pts), s = "", off = (t * v) % gap, lim = L * (upto == null ? 1 : clamp(upto));
    for (var d = off; d < lim; d += gap) { var p = pAt(pts, d); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    return s;
  }
  function pipe(pts, col, w, k) { var L = plen(pts), d = 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L'), da = k == null ? '' : ' stroke-dasharray="' + f(L) + '" stroke-dashoffset="' + f(L * (1 - clamp(k))) + '"';
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"' + da + '/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"' + da + '/>'; }
  function heatWaves(x, y, n, t, col, len, dir) { var s = ""; dir = dir || -1; for (var k = 0; k < n; k++) { var x0 = x + (k - (n - 1) / 2) * 26, d = ""; for (var q = 0; q <= len; q += 4) d += (q ? " L" : "M") + f(x0 + Math.sin(q / 14 - t * 6 + k) * 6) + " " + f(y + dir * q); s += '<path d="' + d + '" stroke="' + col + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>'; } return s; }
  // ── «التكييف بيبرّد إزاي؟» (isometric): the split unit's two halves drawn in true 30° isometric (the indoor unit, the
  // outdoor unit with its fan), a cologne bottle, a freon tank, a spray can, a printing press; and ONE master drawing
  // reused all video: the refrigerant loop in section (evaporator · compressor · condenser + fan · capillary) with the
  // freon as dots coloured by state. Shapes from split-AC service diagrams (../refs/SOURCES.md).
  var COLD = "#46698a", COLDL = "#9fc0dc", GAS = "#9fb3c6", HOT = RED, WARM = "#dcab99", COPPER = "#c98a5a", FIN = "#b9b3a2";
  var ICE = "#dfe9ee";

  // ── isometric objects ──
  // the indoor unit: long axis along x (0..220), depth y (0..46), height z (0..66). o.open lifts the cover off the coil.
  function indoor(o, t, op) {
    op = op || {}; var s = "", oc = clamp(op.open || 0);
    if (oc > 0) {   // the coil behind the cover: fins + copper bends
      s += isoBox(o, 6, 6, 4, 208, 34, 56, ["#cfc8b4", "#bdb6a2", "#a39b85"], true);
      for (var x = 12; x < 212; x += 6) s += line3(o, [x, 40, 6], [x, 40, 58], "#7d776a", 0.9);
      for (var z = 14; z < 58; z += 14) s += poly(isoRing(o, "x", [214, 22, z], 5, 12), COPPER, 1.2);
      if (op.frost) for (var k = 0; k < 14; k++) { var p = iso(o, 14 + hash(k) * 196, 40, 8 + hash(k + 9) * 46); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(2 + hash(k + 3) * 2) + '" fill="#fff" opacity="' + f(0.5 + 0.4 * Math.sin(t * 3 + k)) + '"/>'; }
    }
    var lift = oc * 90, s2 = isoBox(o, 0, 0, lift, 220, 46, 66, ["#f1ece0", "#e2dccd", "#c9c1ad"]);
    s2 += line3(o, [8, 46, lift + 10], [212, 46, lift + 10], INK, 1.6) + line3(o, [8, 46, lift + 16], [212, 46, lift + 16], INK, 1);   // the louver slit
    var led = iso(o, 190, 46, lift + 40); s2 += '<circle cx="' + f(led[0]) + '" cy="' + f(led[1]) + '" r="3.2" fill="#7fbf6a" stroke="' + INK + '" stroke-width=".8"/>';
    s += '<g opacity="' + f(1 - oc * 0.75) + '">' + s2 + '</g>';
    if (op.cold) { var c = clamp(op.cold); for (var j = 0; j < 4; j++) { var q = iso(o, 40 + j * 46, 46, 8); s += '<g opacity="' + f(c) + '">' + heatWaves(q[0], q[1] + 6, 1, t + j * 0.7, COLDL, 70 + 10 * j % 20, 1) + '</g>'; } }
    return s;
  }
  // the outdoor unit: depth x (0..64), width y (0..150), height z (0..124); the fan on the +x (right) face
  function outdoor(o, t, op) {
    op = op || {}; var s = isoBox(o, 0, 0, 0, 64, 150, 124, ["#ece6d8", "#d8d1bf", "#bdb5a0"]);
    for (var x = 6; x < 62; x += 5) s += line3(o, [x, 150, 8], [x, 150, 116], "#8d8676", 0.9);   // fins on the side
    s += isoFan(o, "x", [64, 75, 62], 48, t * (op.spin == null ? 9 : op.spin), "#4a4a44");
    s += isoBox(o, 10, 20, -10, 44, 10, 10, null, true) + isoBox(o, 10, 120, -10, 44, 10, 10, null, true);   // feet
    var v = iso(o, 30, 150, 20); s += '<circle cx="' + f(v[0]) + '" cy="' + f(v[1]) + '" r="5" fill="' + COPPER + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(v[0] + 14) + '" cy="' + f(v[1] - 8) + '" r="4" fill="' + COPPER + '" stroke="' + INK + '" stroke-width="1.2"/>';
    if (op.hot) { var h = clamp(op.hot), c = iso(o, 64, 75, 62); s += '<g opacity="' + f(h) + '">' + heatWaves(c[0] + 30, c[1] - 40, 3, t, HOT, 120, -1) + '</g>'; }
    return s;
  }
  function tank(o, t, x, y, z) {   // a refill cylinder of freon: body, collar, valve wheel
    var s = isoCyl(o, x, y, z, 46, 120, "#9db7bf", "#c9d9dc") + isoCyl(o, x, y, z + 120, 20, 16, "#7d8a8c") + isoCyl(o, x, y, z + 136, 6, 14, "#555");
    var w = iso(o, x, y, z + 152), a = t * 1.5; s += '<ellipse cx="' + f(w[0]) + '" cy="' + f(w[1]) + '" rx="22" ry="12" fill="none" stroke="' + RED + '" stroke-width="4"/><path d="M' + f(w[0] + Math.cos(a) * 20) + ' ' + f(w[1] + Math.sin(a) * 11) + ' L' + f(w[0] - Math.cos(a) * 20) + ' ' + f(w[1] - Math.sin(a) * 11) + '" stroke="' + RED + '" stroke-width="3"/>';
    var b = iso(o, x, y, z + 60); return s + R(b[0] - 34, b[1] - 12, 68, 24, "#f4efe2", 1.4, 3) + '<text x="' + f(b[0]) + '" y="' + f(b[1] + 6) + '" text-anchor="middle" style="font:800 15px ' + SERIF + ';fill:' + INK + '">R-410A</text>';
  }
  function bottle(o, t, x, y, z) {   // a cologne bottle
    return isoCyl(o, x, y, z, 26, 70, "#cfe0dc", "#e3eeeb") + isoCyl(o, x, y, z + 70, 9, 14, "#d9d3c0") + isoCyl(o, x, y, z + 84, 12, 18, RED, "#d9775a");
  }
  function sprayCan(o, t, x, y, z, frost) {
    var s = isoCyl(o, x, y, z, 30, 120, "#cfd6d9", "#e4e8ea") + isoCyl(o, x, y, z + 120, 22, 12, "#b6bdc0") + isoBox(o, x - 6, y - 6, z + 132, 12, 12, 12, [RED, "#9a401e", "#7a3418"], true);
    for (var k = 0; k < 26 * clamp(frost || 0); k++) { var p = iso(o, x + 24 * Math.cos(k * 2.4 + 1.2), y + 24 * Math.sin(k * 2.4 + 1.2), z + 10 + hash(k) * 70); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(1.8 + hash(k + 4) * 2.4) + '" fill="#fff" stroke="#b9cbd6" stroke-width=".8"/>'; }
    return s;
  }
  // a flat open palm, wrist at the bottom (top view)
  function palm(x, y, s, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">', sk = SKIN;
    [[-48, -110, 26, 92], [-18, -132, 27, 112], [13, -128, 27, 108], [42, -106, 24, 86]].forEach(function (q, i) { var w = Math.sin(t * 1.4 + i) * 1.5; g += '<rect x="' + f(q[0] - q[2] / 2) + '" y="' + f(q[1] + w) + '" width="' + q[2] + '" height="' + q[3] + '" rx="13" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.4"/>'; });
    g += '<rect x="-112" y="-40" width="30" height="96" rx="15" transform="rotate(-38 -97 8)" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<path d="M-66 -30 Q-70 60 -40 110 L40 110 Q70 60 62 -30 Z" fill="' + sk + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 0 Q0 30 40 -6 M-36 40 Q0 50 30 30" stroke="#b97f65" stroke-width="2" fill="none"/>';
    return g + R(-44, 108, 88, 70, sk, 2.4, 4) + '</g>';
  }
  function drop(x, y, r, col) { return '<path d="M' + f(x) + ' ' + f(y - r * 1.8) + ' Q' + f(x + r) + ' ' + f(y - r * 0.2) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r) + ' ' + f(y - r * 0.2) + ' ' + f(x) + ' ' + f(y - r * 1.8) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  function qMark(x, y, sz, k, t) { k = pop(k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2.4) * 6) + ') scale(' + f(k) + ')">' + serifNum("?", 0, 0, sz, SLATE) + '</g>'; }
  function sun(x, y, r, t) { var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#e9b04a" stroke="' + INK + '" stroke-width="2"/>'; for (var k = 0; k < 10; k++) { var a = k / 10 * Math.PI * 2 + t * 0.6; s += '<path d="M' + f(x + Math.cos(a) * (r + 8)) + ' ' + f(y + Math.sin(a) * (r + 8)) + ' L' + f(x + Math.cos(a) * (r + 22)) + ' ' + f(y + Math.sin(a) * (r + 22)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; } return s; }

  // ── the master drawing: the refrigerant loop in section ──
  var EV = [50, 170, 200, 130], CP = [420, 260, 104, 150], CD = [372, 470, 236, 170], CAP = [150, 240], WALLX = 300;
  function serp(x0, y0, w, h, rows, from) {   // a serpentine tube inside a coil box, starting bottom-left (from = 0) or top-right
    var pts = [], step = h / (rows - 1);
    for (var r = 0; r < rows; r++) { var y = y0 + h - r * step; if (r % 2 === 0) { pts.push([x0, y]); pts.push([x0 + w, y]); } else { pts.push([x0 + w, y]); pts.push([x0, y]); } }
    return from ? pts.reverse() : pts;
  }
  var P_EVAP = serp(EV[0] + 16, EV[1] + 18, EV[2] - 32, EV[3] - 36, 5, 0),
      P_SUC = [P_EVAP[P_EVAP.length - 1], [262, 188], [458, 188], [458, CP[1]]],
      P_DIS = [[CP[0] + 78, CP[1]], [CP[0] + 78, 228], [600, 228], [600, CD[1] + 22]],
      P_COND = serp(CD[0] + 18, CD[1] + 22, CD[2] - 40, CD[3] - 44, 6, 1),
      P_LIQ = [P_COND[P_COND.length - 1], [CD[0] - 4, 668], [CAP[1] + 40, 668]],
      P_CAPI = (function () { var p = [], n = 60; for (var k = 0; k <= n; k++) { var a = k / n * Math.PI * 6; p.push([CAP[1] + 40 - k / n * 120 - Math.sin(a) * 6, 668 + Math.cos(a) * 14 - 14]); } return p; })(),
      P_RET = [P_CAPI[P_CAPI.length - 1], [36, 654], [36, P_EVAP[0][1]], P_EVAP[0]];
  P_COND[0] = [600, CD[1] + 22];
  // o.hi: the station in focus (1 evaporator, 2 compressor, 3 condenser, 4 capillary; 0 = all); o.k reveal 0..1;
  // o.flow multiplies the dot speed; o.leak 0..1 opens a leak on the liquid line; o.lock shows the closed-loop badge
  function loop(t, o) {
    o = o || {}; var hi = o.hi || 0, k = o.k == null ? 1 : o.k, sp = o.flow == null ? 1 : o.flow, a = function (n) { return hi && hi !== n ? 0.32 : 1; }, s = "";
    if (!o.noTags) s += T("جوه", 150, 120, 30, SLATE, 800) + T("برة", 490, 120, 30, RED, 800);
    s += R(WALLX, 70, 36, 680, "#d6cdb6", 2) + R(WALLX, 70, 36, 680, "url(#hatch)", 0);
    // pipes (state colours) — each station group fades when another is in focus
    s += '<g opacity="' + f(Math.min(a(1), a(2))) + '">' + pipe(P_SUC, GAS, 14, k) + '</g>';
    s += '<g opacity="' + f(Math.min(a(2), a(3))) + '">' + pipe(P_DIS, "#d98a6c", 12, k) + '</g>';
    s += '<g opacity="' + f(Math.min(a(3), a(4))) + '">' + pipe(P_LIQ, WARM, 9, k) + '</g>';
    s += '<g opacity="' + f(Math.min(a(4), a(1))) + '">' + pipe(P_RET, COLDL, 9, k) + '</g>';
    // 1 evaporator: coil box, fins, serpentine, the cross-flow fan under it
    var g = R(EV[0], EV[1], EV[2], EV[3], "#e3dccb", 2.2, 6); for (var x = EV[0] + 8; x < EV[0] + EV[2]; x += 8) g += '<path d="M' + x + ' ' + (EV[1] + 4) + ' V' + (EV[1] + EV[3] - 4) + '" stroke="' + FIN + '" stroke-width="1.2"/>';
    g += pipe(P_EVAP, COLDL, 7, k);
    var fx = 150, fy = 345; g += '<path d="M' + (fx - 70) + ' ' + (fy - 30) + ' Q' + (fx - 80) + ' ' + (fy + 50) + ' ' + fx + ' ' + (fy + 46) + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    g += '<circle cx="' + fx + '" cy="' + fy + '" r="32" fill="#d8d0bd" stroke="' + INK + '" stroke-width="2"/>'; for (var b = 0; b < 12; b++) { var an = b / 12 * Math.PI * 2 + t * 6 * sp; g += '<path d="M' + f(fx + Math.cos(an) * 14) + ' ' + f(fy + Math.sin(an) * 14) + ' L' + f(fx + Math.cos(an + 0.4) * 30) + ' ' + f(fy + Math.sin(an + 0.4) * 30) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    s += '<g opacity="' + f(a(1)) + '">' + g + '</g>';
    // 2 compressor: a capsule in section with the motor turning inside
    var cx = CP[0] + CP[2] / 2, cy = CP[1] + CP[3] / 2; g = R(CP[0], CP[1], CP[2], CP[3], "#9a9a8a", 2.4, 46) + R(CP[0], CP[1], CP[2], CP[3], "url(#hatch)", 0, 46);
    g += '<circle cx="' + f(cx) + '" cy="' + f(cy + 20) + '" r="30" fill="#c9c2ae" stroke="' + INK + '" stroke-width="2"/>'; for (var m = 0; m < 3; m++) { var am = t * 8 * sp + m * 2.09; g += '<path d="M' + f(cx) + ' ' + f(cy + 20) + ' L' + f(cx + Math.cos(am) * 26) + ' ' + f(cy + 20 + Math.sin(am) * 26) + '" stroke="' + INK + '" stroke-width="3"/>'; }
    g += R(cx - 46, CP[1] + CP[3], 92, 10, INK, 0, 2);
    s += '<g opacity="' + f(a(2)) + '">' + g + '</g>';
    // 3 condenser + its big fan
    g = R(CD[0], CD[1], CD[2], CD[3], "#e6dfcf", 2.2, 6); for (var y = CD[1] + 8; y < CD[1] + CD[3]; y += 8) g += '<path d="M' + (CD[0] + 4) + ' ' + y + ' H' + (CD[0] + CD[2] - 4) + '" stroke="' + FIN + '" stroke-width="1.1"/>';
    g += pipe(P_COND, "#d98a6c", 7, k);
    var nx = CD[0] + CD[2] / 2, ny = CD[1] + CD[3] / 2; g += '<circle cx="' + f(nx) + '" cy="' + f(ny) + '" r="62" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-dasharray="4 5"/>';
    for (var bl = 0; bl < 3; bl++) { var ab = t * 7 * sp + bl * 2.094; g += '<path d="M' + f(nx) + ' ' + f(ny) + ' Q' + f(nx + Math.cos(ab - 0.5) * 70) + ' ' + f(ny + Math.sin(ab - 0.5) * 70) + ' ' + f(nx + Math.cos(ab) * 56) + ' ' + f(ny + Math.sin(ab) * 56) + ' Q' + f(nx + Math.cos(ab + 0.4) * 30) + ' ' + f(ny + Math.sin(ab + 0.4) * 30) + ' ' + f(nx) + ' ' + f(ny) + ' Z" fill="#8f897a" opacity=".55" stroke="' + INK + '" stroke-width="1.3"/>'; }
    g += '<circle cx="' + f(nx) + '" cy="' + f(ny) + '" r="9" fill="' + INK + '"/>';
    s += '<g opacity="' + f(a(3)) + '">' + g + '</g>';
    // 4 the capillary (thin coil)
    s += '<g opacity="' + f(a(4)) + '">' + pipe(P_CAPI, "#c9a090", 3.5, k) + '</g>';
    // the freon: dense dots for liquid, sparse for gas, coloured by temperature
    if (k >= 1) {
      s += '<g opacity="' + f(a(1)) + '">' + dotStream(P_EVAP, t, 34 * sp, 15, 3.6, COLD) + '</g>';
      s += '<g opacity="' + f(Math.min(a(1), a(2))) + '">' + dotStream(P_SUC, t, 70 * sp, 30, 5.2, GAS) + '</g>';
      s += '<g opacity="' + f(Math.min(a(2), a(3))) + '">' + dotStream(P_DIS, t, 70 * sp, 30, 5.2, HOT) + '</g>';
      s += '<g opacity="' + f(a(3)) + '">' + dotStream(P_COND, t, 40 * sp, 18, 3.8, "#d26a48") + '</g>';
      s += '<g opacity="' + f(Math.min(a(3), a(4))) + '">' + dotStream(P_LIQ, t, 40 * sp, 13, 3.6, WARM) + '</g>';
      s += '<g opacity="' + f(a(4)) + '">' + dotStream(P_CAPI, t, 90 * sp, 12, 2.4, "#b98a78") + '</g>';
      s += '<g opacity="' + f(Math.min(a(4), a(1))) + '">' + dotStream(P_RET, t, 40 * sp, 13, 3.6, COLD) + '</g>';
    }
    if (o.air) {   // room air: warm in over the coil, cold out under the fan; hot air out of the condenser
      var ak = clamp(o.air);
      s += '<g opacity="' + f(ak * a(1)) + '">'; for (var j = 0; j < 3; j++) s += arrow(EV[0] + 40 + j * 60, 96 + 8 * Math.sin(t * 4 + j), EV[0] + 40 + j * 60, EV[1] - 6, RED, 3.4);
      s += heatWaves(118, 392, 3, t, COLDL, 90, 1) + '</g>';
      s += '<g opacity="' + f(ak * a(3)) + '">'; for (var w = 0; w < 4; w++) s += waveRay(CD[0] + CD[2] + 6, CD[1] + 30 + w * 38, 720, CD[1] + 10 + w * 46, t + w * 0.3, HOT, 5, 22, 1, 3); s += '</g>';
    }
    if (o.lock) { var lk = pop(o.lock); if (lk > 0) s += '<g transform="translate(320 52) scale(' + f(lk) + ')"><path d="M-14 -4 V-16 A14 14 0 0 1 14 -16 V-4" stroke="' + INK + '" stroke-width="5" fill="none"/>' + R(-22, -6, 44, 34, OLV, 2, 5) + '</g>'; }
    if (o.leak) { var lx = 342, ly = 668, lkk = clamp(o.leak); s += '<circle cx="' + lx + '" cy="' + ly + '" r="' + f(16 + 4 * Math.sin(t * 6)) + '" fill="none" stroke="' + RED + '" stroke-width="3.4" opacity="' + f(lkk) + '"/>';
      for (var e = 0; e < 14 * lkk; e++) { var ph = (t * 1.2 + e / 14) % 1; s += '<circle cx="' + f(lx + 6 + ph * 90 * Math.cos(-0.9 + hash(e) * 0.6)) + '" cy="' + f(ly + ph * 90 * Math.sin(-0.9 + hash(e) * 0.6)) + '" r="' + f(3.6 * (1 - ph * 0.6)) + '" fill="' + WARM + '" stroke="' + INK + '" stroke-width=".7" opacity="' + f(1 - ph) + '"/>'; } }
    return s;
  }
  function loopCallouts(u0, u, sz) { return callout("1", EV[0] + EV[2] - 8, EV[1] - 14, (u - u0) / 0.5) + callout("2", CP[0] + CP[2] + 10, CP[1] + 10, (u - u0 - 0.2) / 0.5) + callout("3", CD[0] - 4, CD[1] - 4, (u - u0 - 0.4) / 0.5) + callout("4", CAP[0] - 6, 620, (u - u0 - 0.6) / 0.5); }
  var HUD = function (act) { return function (u) { return stepper(4, act, 590, 52, u / 0.4); }; };
  function pan(a, b, z0, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }

  // ── the shots ──
  var OI = function (s) { return [320, 420, s || 1.6]; };
  // 1 — where does the cold come from? the indoor unit, cold air pouring out
  shot(1, pan([330, 420], [320, 400], 1.0, 1.15), function (u, d, t) {
    return paper() + indoor([200, 330, 1.7], t, { cold: clamp((u - 0.2) / 0.6) }) + qMark(520, 250, 110, (u - 0.5) / 0.6, t) + thermo(575, 660, 150, lerp(0.7, 0.4, clamp(u / d)), SLATE, ticker(30, 24, u / d) + "°", 30);
  });
  // 2 — and why is the outdoor unit so hot? the fan, heat waves, the temperature climbing
  shot(2, pan([300, 420], [330, 400], 1.05, 1.2), function (u, d, t) {
    var o = [250, 330, 1.8];
    return paper() + outdoor(o, t, { hot: clamp((u - 0.1) / 0.6) }) + thermo(560, 640, 170, lerp(0.4, 0.92, clamp(u / d)), RED, ticker(35, 48, u / d) + "°", 34) + qMark(140, 270, 100, (u - 0.7) / 0.6, t);
  });
  // 3 — what's the story? both halves, a wall between them, the copper pipes drawing in
  shot(3, pan([320, 420], [320, 400], 1.15, 1.0), function (u, d, t) {
    var s = paper() + R(312, 150, 26, 520, "#d6cdb6", 2) + R(312, 150, 26, 520, "url(#hatch)", 0);              // the wall, in section
    s += indoor([40, 250, 0.95], t, { cold: 1 }) + outdoor([400, 470, 1.0], t, { hot: 1 });
    s += pipe([[250, 300], [470, 300], [470, 470]], COPPER, 7, (u - 0.3) / 1.0) + pipe([[250, 318], [450, 318], [450, 480]], COPPER, 5, (u - 0.5) / 1.0);
    return s + T("جوه", 150, 200, 30, SLATE, 800) + T("برة", 490, 200, 30, RED, 800) + qMark(320, 130, 110, (u - 1.2) / 0.6, t);
  });
  // 4 — it doesn't make cold: ✗ on the snowflake, then the heat is carried out through the wall
  shot(4, pan([320, 420], [330, 400], 1.0, 1.1), function (u, d, t) {
    var s = paper() + R(40, 180, 250, 380, "#f3eee2", 2.4) + R(WALLX - 10, 160, 40, 420, "#d6cdb6", 2) + R(WALLX - 10, 160, 40, 420, "url(#hatch)", 0);
    s += T("جوه", 160, 160, 26, SLATE, 800) + T("برة", 480, 160, 26, RED, 800) + sun(500, 260, 30, t);
    var sf = clamp(1 - (u - 1.6) / 0.5); if (sf > 0) { var g = '<g transform="translate(165 360) rotate(' + f(t * 20) + ')" opacity="' + f(sf) + '">'; for (var k = 0; k < 6; k++) g += '<path d="M0 0 L0 -70 M0 -44 L-14 -58 M0 -44 L14 -58" stroke="' + SLATE + '" stroke-width="6" stroke-linecap="round" transform="rotate(' + k * 60 + ')"/>'; s += g + '</g>' + crossMark(165, 360, 1.5, (u - 0.6) / 0.6); }
    var hk = clamp((u - 1.6) / 0.6), path = [[80, 520], [165, 300], [250, 250], [320, 250], [420, 330], [560, 420]];
    if (hk > 0) { s += pipe(path.slice(2, 5), COPPER, 8, hk); for (var j = 0; j < 16; j++) { var ph = (t * 0.35 + j / 16) % 1, p = pAt(path, ph * plen(path)); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(7 + 2 * Math.sin(t * 5 + j)) + '" fill="' + RED + '" opacity="' + f(hk * (ph < 0.85 ? 0.9 : (1 - ph) * 6)) + '" stroke="' + INK + '" stroke-width="1"/>'; } }
    return s + label(320, 250, 420, 560, "بيشيل الحر", RED, (u - 2.0) / 0.6, 24);
  });
  // 5 — put cologne on your hand: drops fall, the hand's thermometer drops
  shot(5, pan([320, 400], [310, 440], 1.0, 1.15), function (u, d, t) {
    var o = [380, 230, 1.6], s = paper() + palm(280, 560, 1.3, t) + bottle(o, t, 0, 0, Math.sin(t * 2) * 4);
    var tip = iso(o, 0, 0, 102);
    for (var k = 0; k < 5; k++) { var ph = (t * 0.9 + k / 5) % 1; s += drop(lerp(tip[0] - 20, 270 + (k - 2) * 26, ph), lerp(tip[1] + 30, 470, ph * ph), 9, "#bcd6d4"); }
    return s + thermo(560, 690, 150, lerp(0.7, 0.35, clamp((u - 0.8) / (d - 0.8))), SLATE, ticker(34, 27, (u - 0.8) / (d - 0.8)) + "°", 30) + label(270, 470, 110, 300, "سقعة", SLATE, (u - 1.4) / 0.6);
  });
  // 6 — as it evaporates it pulls heat out of your hand: vapour dots rise, each carrying a red heat dot
  shot(6, pan([300, 470], [300, 420], 1.3, 1.5), function (u, d, t) {
    var s = paper() + palm(300, 680, 1.8, t);
    for (var k = 0; k < 18; k++) { var x0 = 200 + hash(k) * 200, ph = (t * 0.5 + hash(k + 7)) % 1, y = lerp(470, 210, ph), x = x0 + Math.sin(t * 2 + k) * 10;
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="7" fill="#bcd6d4" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - ph) + '"/><circle cx="' + f(x + 9) + '" cy="' + f(y + 8) + '" r="4" fill="' + RED + '" opacity="' + f((1 - ph) * clamp((u - 0.4) / 0.6)) + '"/>'; }
    for (var j = 0; j < 4; j++) s += drop(230 + j * 44, 480, 11, "#bcd6d4");
    return s + label(300, 300, 400, 230, "بخار", SLATE, (u - 0.4) / 0.6) + label(330, 340, 230, 250, "سخونية", RED, (u - 1.2) / 0.6);
  });
  // 7 — the AC does the same, with a liquid called freon: the tank, with an inset of the liquid
  shot(7, pan([320, 430], [320, 400], 1.0, 1.15), function (u, d, t) {
    var o = [320, 470, 1.7], s = paper() + tank(o, t, 0, 0, 0), dots = "";
    for (var k = 0; k < 26; k++) dots += '<circle cx="' + f(-60 + hash(k) * 120 + Math.sin(t * 2 + k) * 4) + '" cy="' + f(-10 + hash(k + 3) * 70 + Math.cos(t * 2 + k) * 3) + '" r="6" fill="' + COLD + '" stroke="' + INK + '" stroke-width=".8"/>';
    s += inset(150, 220, 95, '<rect x="-100" y="-100" width="200" height="200" fill="#dfe9ee"/><rect x="-100" y="-14" width="200" height="120" fill="' + COLDL + '"/><path d="M-100 -14 Q-50 -22 0 -14 T100 -14" stroke="' + INK + '" stroke-width="2" fill="none"/>' + dots, (u - 0.6) / 0.6);
    return s + label(360, 380, 470, 250, "الفريون", OLV, (u - 1.0) / 0.6, 26);
  });
  // 8 — it boils at about fifty below zero: a beaker boiling, the thermometer falling to −50°
  function beaker(x, y, t, boil, col) {
    var s = '<path d="M' + (x - 80) + ' ' + (y - 210) + ' V' + y + ' Q' + (x - 80) + ' ' + (y + 20) + ' ' + (x - 60) + ' ' + (y + 20) + ' H' + (x + 60) + ' Q' + (x + 80) + ' ' + (y + 20) + ' ' + (x + 80) + ' ' + y + ' V' + (y - 210) + '" fill="#f3f1ea" stroke="' + INK + '" stroke-width="3"/>';
    s += R(x - 77, y - 110, 154, 128, col || COLDL, 0, 4) + '<path d="M' + (x - 77) + ' ' + (y - 110) + ' Q' + (x - 40) + ' ' + f(y - 116 + 4 * Math.sin(t * 8)) + ' ' + x + ' ' + (y - 110) + ' T' + (x + 77) + ' ' + (y - 110) + '" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    for (var k = 0; k < 16 * boil; k++) { var ph = (t * (0.8 + boil) + hash(k)) % 1; s += '<circle cx="' + f(x - 60 + hash(k + 5) * 120 + Math.sin(t * 6 + k) * 3) + '" cy="' + f(y + 10 - ph * 120) + '" r="' + f(3 + ph * 6) + '" fill="#fff" stroke="' + INK + '" stroke-width="1"/>'; }
    for (var j = 0; j < 8 * boil; j++) { var q = (t * 0.6 + j / 8) % 1; s += '<circle cx="' + f(x - 50 + (j * 37) % 100 + Math.sin(t * 2 + j) * 12) + '" cy="' + f(y - 130 - q * 150) + '" r="' + f(8 + q * 8) + '" fill="#e6eef1" opacity="' + f(1 - q) + '"/>'; }
    return s;
  }
  shot(8, pan([300, 430], [320, 400], 1.15, 1.0), function (u, d, t) {
    var k = clamp((u - 0.5) / (d - 0.8));
    return paper() + beaker(260, 560, t, 0.4 + 0.6 * k) + thermo(480, 600, 260, lerp(0.75, 0.08, k), SLATE, "−" + ticker(0, 50, k) + "°", 46) + label(230, 460, 110, 260, "بيغلي", RED, (u - 0.6) / 0.6);
  });
  // 9 — so room heat is like fire to it: two readings, room 30° red vs boiling point −50° slate
  shot(9, pan([320, 420], [320, 400], 1.0, 1.1), function (u, d, t) {
    var s = paper() + beaker(320, 600, t, 1.2) + heatWaves(320, 680, 4, t, RED, 40, 1);
    s += thermo(110, 520, 220, 0.12, SLATE, "−50°", 36) + thermo(530, 520, 220, clamp((u - 0.4) / 0.8) * 0.8, RED, ticker(-50, 30, (u - 0.4) / 0.8) + "°", 36);
    s += T("يغلي", 110, 600, 20, SLATE, 800) + T("الأوضة", 530, 600, 20, RED, 800);
    return s + numBox("نار", 320, 190, (u - 1.4) / 0.6, 40);
  });
  // 10 — the indoor unit: the cover lifts, copper pipes in aluminium fins: the evaporator (station 1)
  shot(10, pan([300, 420], [330, 380], 1.0, 1.25), function (u, d, t) {
    var o = [150, 380, 1.75], op = clamp((u - 0.3) / 0.9);
    var s = paper() + indoor(o, t, { open: op }), cu = iso(o, 214, 22, 28), fin = iso(o, 120, 40, 40), cl = iso(o, 60, 40, 30);
    return s + label(cu[0], cu[1], 500, 650, "نحاس", COPPER, (u - 1.1) / 0.5) + label(fin[0], fin[1], 420, 230, "ألومنيوم", OLV, (u - 1.6) / 0.5) + label(cl[0], cl[1], 250, 660, "المبخّر", OLV, (u - 2.3) / 0.5, 26);
  }, HUD(1));
  // 11 — the freon goes in as a cold liquid; the fan pushes room air over it
  shot(11, pan([180, 270], [170, 300], 2.0, 2.2), function (u, d, t) {
    return paper() + loop(t, { hi: 1, air: clamp((u - 0.8) / 0.6), noTags: 1 }) + label(40, 330, 110, 470, "سائل ساقع", COLD, (u - 0.3) / 0.5, 15) + label(182, 345, 270, 420, "المروحة", OLV, (u - 1.2) / 0.5, 15);
  }, HUD(1));
  // 12 — it soaks up the air's heat and boils; the air leaves cold (outlet thermometer falls)
  shot(12, pan([170, 300], [180, 320], 2.2, 2.0), function (u, d, t) {
    var s = paper() + loop(t, { hi: 1, air: 1, noTags: 1 });
    for (var k = 0; k < 10; k++) { var p = pAt(P_EVAP, ((t * 40 + k * 60) % plen(P_EVAP))); s += '<circle cx="' + f(p[0] + 4) + '" cy="' + f(p[1] - 8 - ((t * 30 + k * 9) % 18)) + '" r="3" fill="#fff" stroke="' + INK + '" stroke-width=".8"/>'; }
    return s + thermo(275, 470, 110, lerp(0.8, 0.3, clamp(u / d)), SLATE, ticker(30, 13, u / d) + "°", 22) + label(150, 410, 80, 470, "ساقع", SLATE, (u - 1.2) / 0.5, 16);
  }, HUD(1));
  // 13 — the gas goes outside to the heart of the AC: the compressor (station 2)
  shot(13, pan([200, 240], [470, 330], 1.9, 2.0), function (u, d, t) {
    return paper() + loop(t, { hi: 2, noTags: 1 }) + label(CP[0] + 52, CP[1] + 120, 468, 470, "الكمبروسر", OLV, (u - 1.6) / 0.6, 17) + T("غاز", 390, 172, 16, SLATE, 800);
  }, HUD(2));
  // 14 — the compressor squeezes the gas hard: a piston in section, dots packing tight and turning red, 70°+
  shot(14, pan([320, 420], [320, 400], 1.05, 1.15), function (u, d, t) {
    var k = clamp(u / d), py = 470 + 110 * Math.cos(t * 4.5), top = 200, s = paper();
    s += R(150, top - 20, 300, 520, "#9a9a8a", 3, 30) + R(150, top - 20, 300, 520, "url(#hatch)", 0, 30) + R(200, top, 200, 470, "#efe9da", 2.4);
    s += pipe([[60, 230], [200, 230]], GAS, 16) + pipe([[400, 230], [580, 230]], "#d98a6c", 16);
    var comp = clamp((580 - py) / 230), n = 22;
    for (var j = 0; j < n; j++) { var x = 214 + hash(j) * 172 + Math.sin(t * 7 + j) * 3, y = top + 12 + hash(j + 11) * (py - top - 28); var c = comp > 0.6 ? HOT : comp > 0.35 ? "#c98a7a" : GAS; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6.5" fill="' + c + '" stroke="' + INK + '" stroke-width=".9"/>'; }
    s += R(206, py, 188, 60, "#c9c2ae", 2.4, 4) + R(286, py + 60, 28, 200, "#a39b85", 2, 3);
    s += arrow(300, py + 280, 300, py + 230, INK, 4) ;
    return s + thermo(540, 640, 220, lerp(0.35, 0.95, k), RED, ticker(20, 70, k) + (k > 0.97 ? "°+" : "°"), 36) + label(300, top + 30, 130, 130, "بيكبس", RED, (u - 0.5) / 0.6);
  });
  // 15 — now the gas is hotter than the street, even in August: two thermometers and the sun
  shot(15, pan([320, 430], [320, 400], 1.0, 1.1), function (u, d, t) {
    var s = paper() + sun(140, 190, 46, t) + thermo(200, 620, 260, 0.62, OLV, "40°", 40) + thermo(450, 620, 260, clamp((u - 0.3) / 0.8) * 0.95, RED, ticker(40, 70, (u - 0.3) / 0.8) + "°", 40);
    s += T("الشارع", 200, 710, 24, OLV, 800) + T("الغاز", 450, 710, 24, RED, 800);
    return s + heatWaves(450, 320, 3, t, HOT, 80, -1) + numBox("أغسطس", 470, 170, (u - 1.2) / 0.6, 24);
  });
  // 16 — through the outdoor coil; the big fan throws its heat into the street (station 3)
  shot(16, pan([470, 560], [500, 540], 1.8, 1.95), function (u, d, t) {
    return paper() + loop(t, { hi: 3, air: clamp((u - 0.3) / 0.6), flow: 1.2, noTags: 1 }) + label(560, 520, 420, 700, "المروحة", OLV, (u - 0.8) / 0.5, 17);
  }, HUD(3));
  // 17 — as it cools it turns back into a liquid
  shot(17, pan([480, 600], [420, 640], 2.0, 2.3), function (u, d, t) {
    return paper() + loop(t, { hi: 3, air: 1, noTags: 1 }) + label(330, 668, 380, 740, "سائل", RED, (u - 0.4) / 0.5, 17) + label(600, 520, 540, 450, "غاز سخن", RED, (u - 1.0) / 0.5, 15);
  }, HUD(3));
  // 18 — last stop: a very thin pipe; the liquid squeezes through into a wide space (station 4)
  shot(18, pan([300, 420], [340, 410], 1.0, 1.1), function (u, d, t) {
    var s = paper(), y = 420;
    s += R(20, y - 50, 230, 100, "#f2ece0", 3) + R(250, y - 9, 120, 18, "#f2ece0", 3) + R(370, y - 80, 260, 160, "#eef3f4", 3);
    s += R(20, y - 50, 230, 100, WARM, 0) ;
    for (var k = 0; k < 40; k++) { var ph = (t * 0.25 + hash(k)) % 1; s += '<circle cx="' + f(30 + ph * 210) + '" cy="' + f(y - 40 + hash(k + 9) * 80) + '" r="6" fill="' + WARM + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    for (var j = 0; j < 8; j++) { var q = (t * 1.6 + j / 8) % 1; s += '<circle cx="' + f(256 + q * 108) + '" cy="' + y + '" r="5" fill="#b98a78" stroke="' + INK + '" stroke-width=".8"/>'; }
    for (var m = 0; m < 26; m++) { var r2 = (t * 0.6 + hash(m + 20)) % 1, a = (hash(m + 40) - 0.5) * 2.4; s += '<circle cx="' + f(372 + r2 * 250 * Math.cos(a * 0.5)) + '" cy="' + f(y + r2 * 130 * Math.sin(a) * 0.55) + '" r="' + f(4 + r2 * 3) + '" fill="' + (r2 > 0.25 ? COLD : "#b98a78") + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    return s + label(310, y - 9, 330, 260, "ماسورة رفيعة", OLV, (u - 0.4) / 0.6, 22) + label(520, y + 70, 500, 620, "مكان واسع", SLATE, (u - 1.6) / 0.6, 22);
  }, HUD(4));
  // 19 — the pressure drops, it gets cold at once — like a spray can going cold in your hand
  shot(19, pan([320, 430], [320, 400], 1.0, 1.1), function (u, d, t) {
    var o = [250, 560, 1.7], s = paper() + sprayCan(o, t, 0, 0, 0, clamp((u - 0.6) / 1.4)), nz = iso(o, 0, 0, 150);
    for (var k = 0; k < 30; k++) { var ph = (t * 1.4 + hash(k)) % 1, a = -0.5 + (hash(k + 3) - 0.5) * 0.7; s += '<circle cx="' + f(nz[0] + 12 + ph * 300 * Math.cos(a)) + '" cy="' + f(nz[1] + ph * 300 * Math.sin(a)) + '" r="' + f(2 + ph * 5) + '" fill="' + COLDL + '" opacity="' + f(1 - ph) + '"/>'; }
    var inn = '<rect x="-120" y="-120" width="240" height="240" fill="' + PAPER + '"/><rect x="-120" y="-24" width="90" height="48" fill="' + WARM + '" stroke="' + INK + '" stroke-width="2"/><rect x="-30" y="-6" width="60" height="12" fill="#f2ece0" stroke="' + INK + '" stroke-width="2"/><rect x="30" y="-50" width="100" height="100" fill="#eef3f4" stroke="' + INK + '" stroke-width="2"/>';
    for (var j = 0; j < 10; j++) { var q = (t * 0.8 + j / 10) % 1; inn += '<circle cx="' + f(34 + q * 70) + '" cy="' + f((hash(j) - 0.5) * 80 * q) + '" r="5" fill="' + COLD + '"/>'; }
    return s + inset(500, 640, 92, inn, (u - 1.2) / 0.6) + thermo(110, 690, 160, lerp(0.6, 0.15, clamp((u - 0.4) / 1.2)), SLATE, ticker(25, 5, (u - 0.4) / 1.2) + "°", 30);
  });
  // 20 — back to the evaporator inside, and the loop starts over: the whole loop, all four stations
  shot(20, pan([340, 440], [330, 410], 1.35, 0.95), function (u, d, t) {
    var s = paper() + loop(t, { air: 1, flow: 1.3 }) + loopCallouts(0.2, u);
    var a0 = t * 2, r = 70; s += '<g opacity="' + f(clamp((u - 1.0) / 0.5)) + '"><path d="M' + f(320 + Math.cos(a0) * r) + ' ' + f(440 + Math.sin(a0) * r) + ' A' + r + ' ' + r + ' 0 1 1 ' + f(320 + Math.cos(a0 + 4.6) * r) + ' ' + f(440 + Math.sin(a0 + 4.6) * r) + '" stroke="' + RED + '" stroke-width="7" fill="none"/>' + arrow(320 + Math.cos(a0 + 4.3) * r, 440 + Math.sin(a0 + 4.3) * r, 320 + Math.cos(a0 + 4.75) * r, 440 + Math.sin(a0 + 4.75) * r, RED, 7) + '</g>';
    return s;
  });
  // 21 — many think the AC uses up freon and needs a refill every year: tank + calendar, then ✗
  shot(21, pan([320, 420], [310, 400], 1.0, 1.1), function (u, d, t) {
    var o = [220, 520, 1.5], s = paper() + tank(o, t, 0, 0, 0);
    var cx = 470, cy = 380, pg = Math.floor(t * 1.6) % 12; s += R(cx - 90, cy - 90, 180, 190, "#f6f1e5", 2.6, 6) + R(cx - 90, cy - 90, 180, 46, RED, 2.6, 6);
    for (var k = 0; k < 4; k++) s += R(cx - 64 + k * 40, cy - 104, 8, 26, INK, 0, 3);
    s += serifNum(String(pg + 1), cx, cy + 60, 70, INK) + T("كل سنة", cx, cy - 56, 22, "#fff", 800);
    return s + crossMark(330, 420, 2.4, (u - 2.0) / 0.6);
  });
  // 22 — no: the freon goes round a closed loop; if it's low there's a leak
  shot(22, pan([330, 410], [330, 600], 0.95, 1.6), function (u, d, t) {
    return paper() + loop(t, { lock: (u - 0.2) / 0.6, leak: clamp((u - 1.8) / 0.6) }) + label(342, 668, 300, 770, "تسريب", RED, (u - 2.0) / 0.5, 20);
  });
  // 23 — the water that drips from the AC: room humidity condensing on the cold coil (inset: an iced glass)
  shot(23, pan([300, 430], [300, 470], 1.0, 1.12), function (u, d, t) {
    var o = [90, 420, 2.0], s = paper() + indoor(o, t, { open: 1, frost: 1 });
    for (var k = 0; k < 10; k++) { var ph = (t * 0.7 + hash(k)) % 1, x = 140 + hash(k + 2) * 300; s += drop(x + 40 * ph, 470 + ph * 210, 6 + 2 * hash(k), "#a9c6da"); }
    for (var j = 0; j < 20; j++) { var q = (t * 0.4 + hash(j + 30)) % 1; s += '<circle cx="' + f(120 + hash(j + 50) * 360) + '" cy="' + f(160 + (1 - q) * 160) + '" r="4" fill="' + COLDL + '" opacity="' + f(q) + '"/>'; }
    var gl = '<rect x="-110" y="-110" width="220" height="220" fill="' + PAPER + '"/><path d="M-46 -64 L-38 70 H38 L46 -64 Z" fill="#e8f0f2" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-30" width="26" height="26" fill="#fff" stroke="' + INK + '" stroke-width="1.6" transform="rotate(14)"/><rect x="2" y="-10" width="24" height="24" fill="#fff" stroke="' + INK + '" stroke-width="1.6" transform="rotate(-10)"/>';
    for (var m = 0; m < 9; m++) gl += drop(-40 + (m % 3) * 40 + Math.sin(m) * 6, -40 + Math.floor(m / 3) * 40 + ((t * 10 + m * 7) % 14), 4, "#a9c6da");
    return s + inset(510, 170, 90, gl, (u - 1.4) / 0.6) + label(300, 330, 170, 150, "رطوبة", SLATE, (u - 0.5) / 0.6);
  });
  // 24 — the first AC, 1902, for a printing plant whose paper the humidity was ruining
  shot(24, pan([320, 420], [330, 400], 1.0, 1.1), function (u, d, t) {
    var o = [200, 470, 1.25], s = paper() + isoBox(o, 0, 0, 0, 220, 120, 70, ["#d8d0bd", "#bdb6a2", "#9a927e"]);
    for (var r = 0; r < 3; r++) { var c = iso(o, 40 + r * 70, 60, 92); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="40" ry="22" fill="#6d6a60" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(c[0] + Math.cos(t * 4 + r) * 36) + ' ' + f(c[1] + Math.sin(t * 4 + r) * 18) + ' L' + f(c[0] - Math.cos(t * 4 + r) * 36) + ' ' + f(c[1] - Math.sin(t * 4 + r) * 18) + '" stroke="#c9c2ae" stroke-width="3"/>'; }
    var dry = clamp((u - 2.0) / 1.0);
    for (var p = 0; p < 3; p++) { var y0 = 230 + p * 40, d2 = ""; for (var x = 0; x <= 200; x += 10) d2 += (x ? " L" : "M") + f(70 + x) + " " + f(y0 + x * 0.3 + (1 - dry) * 10 * Math.sin(x / 18 + t * 3 + p)); s += '<path d="' + d2 + ' L270 ' + f(y0 + 110) + ' L70 ' + f(y0 + 50) + ' Z" fill="#fbf8f0" stroke="' + INK + '" stroke-width="1.6" opacity=".95"/>'; }
    for (var k = 0; k < 16 * (1 - dry); k++) { var q = (t * 0.5 + hash(k)) % 1; s += '<circle cx="' + f(60 + hash(k + 4) * 240) + '" cy="' + f(200 + q * 160) + '" r="4" fill="' + COLDL + '" stroke="' + INK + '" stroke-width=".7"/>'; }
    var ak = pop((u - 1.6) / 0.8); if (ak > 0) s += '<g transform="translate(480 520) scale(' + f(ak) + ') translate(-480 -520)">' + isoBox([420, 520, 1.1], 0, 0, 0, 70, 90, 170, ["#c9d6da", "#a9bcc2", "#8fa3aa"]) + heatWaves(380, 560, 3, t, COLDL, 70, 1) + '</g>';
    return s + serifNum("1902", 470, 210, 74, RED) + label(170, 260, 120, 140, "مطبعة", OLV, (u - 0.6) / 0.6);
  });
  shot(0, function () { return [320, 400, 1]; }, function (u, d, t) { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  // the opening card: the two halves, cold air in, hot air out, and the two readings counting
  window.__intro = function (svg, t) {
    var s = '<rect width="640" height="640" fill="' + PAPER + '"/><rect width="640" height="640" fill="url(#grid)"/>';
    s += indoor([60, 170, 1.05], t, { cold: 1 }) + outdoor([440, 230, 1.1], t, { hot: 1 });
    s += T("جوه", 160, 110, 30, SLATE, 800) + T("برة", 470, 70, 30, RED, 800);
    var k = clamp((t - 0.3) / 1.6);
    s += serifNum(ticker(30, 13, k) + "°", 170, 560, 92, SLATE) + serifNum(ticker(30, 48, k) + "°", 470, 560, 92, RED);
    svg.innerHTML = s; svg.style.transform = 'translate(' + f(8 * Math.sin(t * 1.3)) + 'px,' + f(5 * Math.cos(t * 1.1)) + 'px) scale(' + f(1.04 + 0.04 * Math.sin(t * 0.9)) + ')';
  };
  // the summary card: the master loop small, numbered callouts; the stat counts down to −50°
  window.__outro = function (svg, u, t) {
    var sc = 0.4, s = '<rect width="580" height="320" fill="#e4d9bf"/><g transform="translate(160 -14) scale(' + sc + ')">' + loop(t, { air: 1 });
    s += loopCallouts(0.2, u) + '</g>';
    svg.innerHTML = s; svg.style.transform = 'translate(' + f(7 * Math.sin(t * 1.2)) + 'px,' + f(4 * Math.cos(t * 1.5)) + 'px) scale(' + f(1.05 + 0.05 * Math.sin(t * 1.4)) + ')';
    var ov = document.getElementById('outro'); ov.style.transform = 'translate(' + f(3 * Math.sin(t * 1.7)) + 'px,' + f(2.5 * Math.cos(t * 1.3)) + 'px) scale(' + f(1.012 + 0.012 * Math.sin(t * 1.1)) + ')';
    var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = '−' + ticker(0, 50, u / 2.0) + '°';
  };
  window.__parts = { indoor: indoor, outdoor: outdoor, loop: loop, tank: tank, sprayCan: sprayCan, paper: paper, iso: iso, thermo: thermo, serifNum: serifNum, label: label, T: T };
})();
