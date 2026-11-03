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
