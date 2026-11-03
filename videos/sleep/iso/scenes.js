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

  // ════════ «ليه بنحتاج ننام؟» — shared isometric kit, used by both versions (diagram cards and the full isometric world) ════════
  // Projection: x runs right-down, y left-down, z up: P = [x0 + (x − y)·0.866·s, y0 + (x + y)·0.5·s − z·s].
  // Light from the upper left: the top face is lightest, the +y face (left on screen) mid, the +x face (right) darkest and hatched.
  // Needs the shared diagram helpers in scope (f, clamp, lerp, ease, pop, hash, INK, PAPER, ORANGE, BLUE, OLIVE, SKIN, T).
  function f2(n) { return (+n).toFixed(2); }
  var PAL = {
    putty: ["#e6e1d3", "#cdc9bb", "#b3ae9f"], wood: ["#e8d2ac", "#cfb48a", "#b0936b"], sheet: ["#f6f4ee", "#e2e0d8", "#c9c6bb"],
    blanket: ["#a9bdd0", "#7f9ab5", "#5f7d9a"], olive: ["#a3b06e", "#7d8f4a", "#5f6f35"], blue: ["#a7bfd4", "#7895b3", "#56769a"],
    orange: ["#e58a62", "#c4532c", "#9f4021"], wall: ["#f1eadb", "#e4dac5", "#d3c7ad"], floor: ["#e9dfc9", "#d8cbb0", "#c4b598"],
    white: ["#fbf8f0", "#ebe5d7", "#d6cebd"], dark: ["#4a4f58", "#353a42", "#262a30"], pink: ["#f0d3c4", "#deb3a2", "#c49483"],
    navy: ["#6a7e9b", "#4a5e7c", "#34445f"], green: ["#9db88a", "#7a9a66", "#5d7a4c"], grey: ["#d3d0c8", "#b9b5ab", "#9c988e"],
    nfloor: ["#4b5368", "#3a4256", "#2c3344"]
  };
  function isoKit(x0, y0, s) {
    var K = { s: s, x0: x0, y0: y0 };
    K.P = function (x, y, z) { return [x0 + (x - y) * 0.866 * s, y0 + (x + y) * 0.5 * s - (z || 0) * s]; };
    K.pt = function (x, y, z) { var p = K.P(x, y, z); return f(p[0]) + " " + f(p[1]); };
    K.path = function (pts, close) { return "M" + pts.map(function (q) { return K.pt(q[0], q[1], q[2]); }).join(" L") + (close ? " Z" : ""); };
    K.poly = function (pts, fill, sw, op) { return '<path d="' + K.path(pts, true) + '" fill="' + fill + '"' + (sw === 0 ? "" : ' stroke="' + INK + '" stroke-width="' + (sw == null ? 1.4 : sw) + '" stroke-linejoin="round"') + (op != null ? ' opacity="' + f2(op) + '"' : "") + '/>'; };
    K.hatch = function (pts, op) { return '<path d="' + K.path(pts, true) + '" fill="url(#hatch)"' + (op != null ? ' opacity="' + f2(op) + '"' : "") + '/>'; };
    K.line = function (pts, col, w, ex) { return '<path d="' + K.path(pts) + '" fill="none" stroke="' + (col || INK) + '" stroke-width="' + (w || 1.4) + '" stroke-linecap="round" stroke-linejoin="round"' + (ex || "") + '/>'; };
    // a solid box with its three visible faces; c = [top, left (+y), right (+x)]
    K.box = function (xa, xb, ya, yb, za, zb, c, o) {
      o = o || {}; var sw = o.sw == null ? 1.4 : o.sw, op = o.op, r = "";
      var fy = [[xa, yb, za], [xb, yb, za], [xb, yb, zb], [xa, yb, zb]], fx = [[xb, yb, za], [xb, ya, za], [xb, ya, zb], [xb, yb, zb]], ft = [[xa, ya, zb], [xb, ya, zb], [xb, yb, zb], [xa, yb, zb]];
      r += K.poly(fy, c[1], sw, op) + K.poly(fx, c[2], sw, op); if (o.hatch !== false) r += K.hatch(fx, op);
      return r + K.poly(ft, c[0], sw, op);
    };
    // a circle in a plane: "z" lies flat, "x" stands facing +x, "y" stands facing +y
    K.circ = function (cx, cy, cz, r, plane, n) { var pts = []; n = n || 32; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, c = Math.cos(a) * r, d = Math.sin(a) * r; pts.push(plane === "x" ? [cx, cy + c, cz + d] : plane === "y" ? [cx + c, cy, cz + d] : [cx + c, cy + d, cz]); } return pts; };
    K.disc = function (cx, cy, cz, r, plane, fill, sw, op) { return K.poly(K.circ(cx, cy, cz, r, plane), fill, sw, op); };
    // an upright cylinder: side band, shading, top ellipse
    K.cyl = function (cx, cy, r, za, zb, c, o) {
      o = o || {}; var b = K.P(cx, cy, za), q = K.P(cx, cy, zb), rx = 1.2247 * r * s, ry = 0.7071 * r * s, sw = o.sw == null ? 1.4 : o.sw;
      var side = "M" + f(b[0] - rx) + " " + f(b[1]) + " A" + f(rx) + " " + f(ry) + " 0 0 0 " + f(b[0] + rx) + " " + f(b[1]) + " L" + f(q[0] + rx) + " " + f(q[1]) + " A" + f(rx) + " " + f(ry) + " 0 0 1 " + f(q[0] - rx) + " " + f(q[1]) + " Z";
      return '<path d="' + side + '" fill="' + c[1] + '" stroke="' + INK + '" stroke-width="' + sw + '"/><path d="' + side + '" fill="url(#cylSh)"/>' +
             '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + c[0] + '" stroke="' + INK + '" stroke-width="' + sw + '"/>';
    };
    K.ball = function (cx, cy, cz, r, fill, sw) { var p = K.P(cx, cy, cz), R = r * s * 1.15; return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(R) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 1.4) + '"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(R) + '" fill="url(#ballSh)"/>'; };
    K.shadow = function (cx, cy, rx, ry, op) { return K.poly(K.circ(0, 0, 0, 1, "z", 24).map(function (q) { return [cx + q[0] * rx, cy + q[1] * ry, 0.01]; }), INK, 0, op == null ? 0.1 : op); };
    // a round pipe along a 3D polyline: ink outline, colour core, highlight
    K.tube = function (pts, r, col, o) {
      o = o || {}; var w = 2.45 * r * s, d = K.path(pts), cap = o.cap || "round";
      return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f(w + 3) + '" stroke-linecap="' + cap + '" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="' + cap + '" stroke-linejoin="round"/>' +
             '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + f(Math.max(1, w * 0.16)) + '" stroke-linecap="round" opacity=".35" transform="translate(0 ' + f(-w * 0.24) + ')"/>';
    };
    // text painted on a face ("y" = the left face, "x" = the right face), size in model units
    K.faceText = function (text, x, y, z, face, size, col, w) {
      var p = K.P(x, y, z), m = face === "x" ? [0.866 * s, -0.5 * s, 0, s] : [0.866 * s, 0.5 * s, 0, s];
      return '<g transform="matrix(' + m.map(f2).join(" ") + " " + f(p[0]) + " " + f(p[1]) + ')"><text x="0" y="' + f2(size * 0.36) + '" text-anchor="middle" style="font:' + (w || 800) + " " + f2(size) + "px Noto Sans Arabic;fill:" + (col || INK) + ';direction:ltr">' + text + "</text></g>";
    };
    return K;
  }

  // ── labels (leader line + text with a paper halo), sized for the current zoom z ──
  function lab(px, py, lx, ly, text, col, k, sz, z, halo) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; z = z || 1; col = col || INK; sz = (sz || 21) / z;
    var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tx = lx + (left ? -6 : 6) / z, ty = ly + sz * 0.35;
    var s = '<path d="M' + f(px) + " " + f(py) + " L" + f(ex) + " " + f(ey) + '" stroke="' + (halo === "#141414" ? "#d9d4c8" : INK) + '" stroke-width="' + f2(1.5 / z) + '"/><circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f2(4.2 / z) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + f2(1.2 / z) + '"/>';
    if (k > 0.55) s += '<text x="' + f(tx) + '" y="' + f(ty) + '" text-anchor="' + (left ? "start" : "end") + '" opacity="' + f2(clamp((k - 0.55) / 0.3)) + '" style="font:800 ' + f2(sz) + "px Noto Sans Arabic;fill:" + col + ";paint-order:stroke;stroke:" + (halo || PAPER) + ";stroke-width:" + f2(sz * 0.24) + 'px;stroke-linejoin:round">' + text + "</text>";
    return s;
  }
  function numTag(text, x, y, k, sz, col, z) {   // a dark number box, LTR text only (numbers, %, +)
    k = pop(k == null ? 1 : k); if (k <= 0) return ""; z = z || 1; sz = (sz || 24) / z; var w = text.length * sz * 0.62 + 22 / z;
    return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(k) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-sz * 0.95) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" rx="' + f2(5 / z) + '" fill="' + (col || INK) + '"/><text x="0" y="' + f(sz * 0.32) + '" text-anchor="middle" style="font:800 ' + f2(sz) + 'px Noto Sans Arabic;fill:#fff;direction:ltr">' + text + "</text></g>";
  }
  function ring(x, y, r, t, col, z) { z = z || 1; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r + 3 * Math.sin(t * 5) / z) + '" fill="none" stroke="' + (col || ORANGE) + '" stroke-width="' + f2(3.2 / z) + '"/>'; }

  // ── the bedroom, cut away (front and right walls removed): W × D floor, H high ──
  function room(K, t, o) {
    o = o || {}; var W = 12, D = 10, H = 7, s = "", nt = o.night, br = 0.05 * Math.sin(t * 1.6);
    var wallL = nt ? "#3a4256" : PAL.wall[1], wallR = nt ? "#454e64" : PAL.wall[0], cut = nt ? "#2c3344" : "#cdb98f", top = nt ? "#59627a" : PAL.wall[2];
    s += K.box(-0.4, W, -0.4, D, -0.5, 0, nt ? PAL.nfloor : PAL.floor);
    for (var b = 1.25; b < D; b += 1.25) s += K.line([[0, b, 0], [W, b, 0]], nt ? "#535c72" : "#c9bc9f", 1);
    s += K.poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], wallL) + K.poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], wallR);
    s += K.poly([[-0.4, -0.4, H], [W, -0.4, H], [W, 0, H], [0, 0, H], [0, D, H], [-0.4, D, H]], top);
    var cL = [[-0.4, D, 0], [0, D, 0], [0, D, H], [-0.4, D, H]], cR = [[W, -0.4, 0], [W, 0, 0], [W, 0, H], [W, -0.4, H]];
    s += K.poly(cL, cut) + K.hatch(cL) + K.poly(cR, cut) + K.hatch(cR);
    // the window on the right-hand wall: night sky, stars, the moon; moonlight on the floor
    var wx0 = 6.4, wx1 = 10, wz0 = 2.6, wz1 = 5.6, sky = "#1f2a40";
    s += K.poly([[wx0, 0, wz0], [wx1, 0, wz0], [wx1, 0, wz1], [wx0, 0, wz1]], o.day ? "#cfe1ec" : sky, 2);
    if (!o.day) { for (var i = 0; i < 10; i++) { var sx = wx0 + 0.3 + hash(i) * (wx1 - wx0 - 0.6), sz = wz0 + 0.3 + hash(i + 4) * (wz1 - wz0 - 0.6); s += K.disc(sx, -0.01, sz, 0.06, "y", "#fff", 0, 0.35 + 0.6 * Math.abs(Math.sin(t * 2 + i))); }
      s += K.disc(9.0, -0.02, 4.75, 0.5, "y", "#f4f1e4", 1.2) + K.disc(9.22, -0.03, 4.92, 0.44, "y", sky, 0); }
    s += K.line([[(wx0 + wx1) / 2, 0, wz0], [(wx0 + wx1) / 2, 0, wz1]], INK, 2) + K.line([[wx0, 0, (wz0 + wz1) / 2], [wx1, 0, (wz0 + wz1) / 2]], INK, 2);
    s += K.box(wx0 - 0.25, wx1 + 0.25, 0, 0.35, wz0 - 0.18, wz0, PAL.white, { hatch: false });
    if (!o.day) s += K.poly([[wx0 + 0.6, 2.4, 0.01], [wx1 + 0.6, 2.4, 0.01], [wx1 + 1.9, 5.8, 0.01], [wx0 + 1.9, 5.8, 0.01]], "#dfe9ff", 0, nt ? 0.16 : 0.3);
    // a round wall clock on the left wall; its hands run fast (time passing)
    var ha = o.clock == null ? t * 0.45 : o.clock, ma = ha * 12;
    s += K.disc(0.02, 7.2, 5.1, 0.78, "x", PAL.white[0], 1.6);
    for (var h = 0; h < 12; h++) { var aa = h / 12 * Math.PI * 2; s += K.line([[0.03, 7.2 - Math.sin(aa) * 0.62, 5.1 + Math.cos(aa) * 0.62], [0.03, 7.2 - Math.sin(aa) * 0.7, 5.1 + Math.cos(aa) * 0.7]], INK, 1); }
    s += K.line([[0.04, 7.2, 5.1], [0.04, 7.2 - Math.sin(ha) * 0.4, 5.1 + Math.cos(ha) * 0.4]], INK, 2.4) + K.line([[0.04, 7.2, 5.1], [0.04, 7.2 - Math.sin(ma) * 0.62, 5.1 + Math.cos(ma) * 0.62]], ORANGE, 1.6);
    // rug
    s += K.poly([[5.2, 4.2, 0.01], [10.6, 4.2, 0.01], [10.6, 8.9, 0.01], [5.2, 8.9, 0.01]], nt ? "#6a5868" : "#e2b49c", 1) + K.poly([[5.6, 4.6, 0.02], [10.2, 4.6, 0.02], [10.2, 8.5, 0.02], [5.6, 8.5, 0.02]], "none", 0.8);
    // the bed: headboard against the left wall, frame, mattress, pillow, the sleeper's head, the blanket and the body under it
    s += K.box(0, 0.35, 2.6, 6.9, 0, 2.6, PAL.wood) + K.box(0.35, 5.8, 2.8, 6.7, 0, 0.8, PAL.wood) + K.box(0.4, 5.7, 2.9, 6.6, 0.8, 1.45, PAL.sheet);
    s += K.box(0.55, 1.8, 3.3, 6.2, 1.45, 1.9, PAL.white, { hatch: false });
    s += K.ball(1.02, 4.75, 2.3, 0.46, "#3a3028") + K.ball(1.24, 4.75, 2.2, 0.41, SKIN);
    s += K.box(1.95, 5.8, 2.75, 6.75, 1.45, 1.85 + br, PAL.blanket) + K.box(2.3, 5.2, 3.7, 5.8, 1.85 + br, 2.05 + br * 1.6, PAL.blanket, { hatch: false });
    s += K.line([[1.95, 2.75, 1.85 + br], [1.95, 6.75, 1.85 + br]], "#f6f4ee", 3);
    // nightstand + lamp
    s += K.box(0.3, 1.8, 7.1, 8.5, 0, 1.5, PAL.wood) + K.line([[1.8, 7.3, 0.75], [1.8, 8.3, 0.75]], INK, 1) + K.disc(1.81, 7.8, 1.1, 0.08, "x", INK, 0);
    s += K.cyl(1.05, 7.8, 0.28, 1.5, 1.62, PAL.dark) + K.line([[1.05, 7.8, 1.62], [1.05, 7.8, 2.3]], INK, 2) + K.cyl(1.05, 7.8, 0.55, 2.3, 2.95, ["#f8ecbf", "#efd98f", "#d9bd6a"]);
    if (o.lamp) { var lp = K.P(1.05, 7.8, 2.6); s += '<circle cx="' + f(lp[0]) + '" cy="' + f(lp[1]) + '" r="' + f(K.s * (2.2 + 0.1 * Math.sin(t * 2))) + '" fill="url(#glowW)" opacity=".75"/>'; }
    if (o.zzz) for (var zq = 0; zq < 3; zq++) { var u = (t * 0.32 + zq / 3) % 1, zp = K.P(1.5, 4.2, 2.9 + u * 2.4); s += '<text x="' + f(zp[0] + u * K.s * 1.2) + '" y="' + f(zp[1]) + '" text-anchor="middle" opacity="' + f2(Math.sin(Math.PI * u)) + '" style="font:800 ' + f(K.s * (0.55 + u * 0.5)) + 'px Noto Sans Arabic;fill:' + BLUE + '">z</text>'; }
    return s;
  }
  var HEAD = [1.24, 4.75, 2.2];   // the sleeper's head in room coordinates

  // ── a city block by day: buildings with windows, two streets, cars; trash bags pile up at the kerbs ──
  var BLD = [[0.5, 3.2, 0.5, 3.4, 4.2, "putty"], [3.8, 5.6, 0.5, 2.6, 2.6, "wood"], [8, 10.5, 0.5, 3.2, 5.2, "blue"], [11, 13.5, 0.5, 2.6, 3.0, "putty"],
             [0.5, 2.8, 6.4, 9.5, 2.8, "wood"], [3.4, 5.6, 6.6, 9.4, 1.8, "olive"], [8, 9.8, 6.4, 9.2, 3.6, "putty"], [10.4, 13.5, 6.4, 9.5, 2.2, "wood"]];
  var BAGS = []; (function () { for (var i = 0; i < 18; i++) { var side = i % 2, xs = [0.8, 1.6, 2.6, 3.6, 4.6, 5.5, 8.3, 9.3, 10.4, 11.5, 12.5, 13.3]; BAGS.push([xs[Math.floor(hash(i + 30) * xs.length)] + (hash(i) - 0.5) * 0.4, side ? 6.05 : 3.75, i]); } })();
  function city(K, t, o) {
    o = o || {}; var s = "", items = [];
    s += K.box(0, 14, 0, 10, -0.4, 0, PAL.putty);
    s += K.poly([[0, 4, 0.01], [14, 4, 0.01], [14, 5.8, 0.01], [0, 5.8, 0.01]], "#8d877c", 1) + K.poly([[6.2, 0, 0.02], [7.6, 0, 0.02], [7.6, 10, 0.02], [6.2, 10, 0.02]], "#8d877c", 1);
    for (var d = 0.4; d < 14; d += 1.4) s += K.line([[d, 4.9, 0.03], [d + 0.7, 4.9, 0.03]], "#f4f1ea", 2);
    BLD.forEach(function (b, i) {
      var g = K.box(b[0], b[1], b[2], b[3], 0, b[4], PAL[b[5]]);
      for (var z = 0.6; z < b[4] - 0.4; z += 0.9) {
        for (var x = b[0] + 0.35; x < b[1] - 0.45; x += 0.7) { var on = hash(i * 31 + x * 7 + z * 3) > 0.45; g += K.poly([[x, b[3], z], [x + 0.36, b[3], z], [x + 0.36, b[3], z + 0.46], [x, b[3], z + 0.46]], on ? "#f4e6b0" : "#9fb3c4", 0.8); }
        for (var y = b[2] + 0.35; y < b[3] - 0.45; y += 0.7) { var on2 = hash(i * 17 + y * 5 + z * 11) > 0.5; g += K.poly([[b[1], y, z], [b[1], y + 0.36, z], [b[1], y + 0.36, z + 0.46], [b[1], y, z + 0.46]], on2 ? "#f4e6b0" : "#8aa0b3", 0.8); }
      }
      items.push({ k: (b[0] + b[1]) / 2 + (b[2] + b[3]) / 2, s: g });
    });
    var nb = Math.floor(clamp(o.trash == null ? 0 : o.trash) * BAGS.length);
    for (var j = 0; j < nb; j++) { var q = BAGS[j]; items.push({ k: q[0] + q[1], s: K.ball(q[0], q[1], 0.26, 0.27, "#5d6658") + K.line([[q[0], q[1], 0.55], [q[0] + 0.1, q[1], 0.72]], INK, 1.6) }); }
    for (var c = 0; c < 2; c++) { var cx = ((t * (1.6 + c * 0.5) + c * 7) % 17) - 1.5, cy = c ? 5.2 : 4.4; items.push({ k: cx + cy, s: K.box(cx, cx + 1.1, cy - 0.32, cy + 0.32, 0.05, 0.42, c ? PAL.orange : PAL.blue, { hatch: false }) + K.box(cx + 0.25, cx + 0.8, cy - 0.28, cy + 0.28, 0.42, 0.72, PAL.white, { hatch: false }) }); }
    items.sort(function (a, b) { return a.k - b.k; }).forEach(function (it) { s += it.s; });
    return s;
  }

  // ── brain tissue: a slab with neurons standing on it, the gaps between them (channels), waste, amyloid clumps, fluid ──
  var NR = [1.6, 4.0, 6.4], NC = [1.4, 3.8, 6.2, 8.6];
  function neuron(px, py, k, t, seed, col, act, hurt) {
    var sx = px, sy = py - 26 * k, g = "", c = hurt ? "#b9b4a6" : (col || OLIVE), ln = hurt ? 0.6 : 1;
    g += '<path d="M' + f(sx) + " " + f(sy) + " Q" + f(sx + 6 * k) + " " + f(sy + 14 * k) + " " + f(px) + " " + f(py) + '" stroke="' + INK + '" stroke-width="' + f2(4.6 * k) + '" fill="none" stroke-linecap="round"/><path d="M' + f(sx) + " " + f(sy) + " Q" + f(sx + 6 * k) + " " + f(sy + 14 * k) + " " + f(px) + " " + f(py) + '" stroke="' + c + '" stroke-width="' + f2(2.4 * k) + '" fill="none" stroke-linecap="round"/>';
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + (i - 2) * 0.62 + (hash(seed + i) - 0.5) * 0.3 + Math.sin(t * 1.3 + seed + i) * 0.05, L = (14 + hash(seed * 3 + i) * 8) * k * ln, ex = sx + Math.cos(a) * L, ey = sy + Math.sin(a) * L * 0.85;
      var b1 = a - 0.5, b2 = a + 0.5, d = "M" + f(sx) + " " + f(sy) + " L" + f(ex) + " " + f(ey) + " M" + f(ex) + " " + f(ey) + " L" + f(ex + Math.cos(b1) * 7 * k * ln) + " " + f(ey + Math.sin(b1) * 6 * k * ln) + " M" + f(ex) + " " + f(ey) + " L" + f(ex + Math.cos(b2) * 7 * k * ln) + " " + f(ey + Math.sin(b2) * 6 * k * ln);
      g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f2(3.4 * k) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + c + '" stroke-width="' + f2(1.7 * k) + '" fill="none" stroke-linecap="round"/>';
      if (act && !hurt) { var on = Math.sin(t * 6 + seed * 2.1 + i * 1.7) > 0.75; if (on) g += '<circle cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f2(3.4 * k) + '" fill="' + ORANGE + '" opacity=".9"/>'; }
    }
    g += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="' + f2(7.5 * k) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="' + f2(1.6 * k) + '"/><circle cx="' + f(sx - 2 * k) + '" cy="' + f(sy - 2.4 * k) + '" r="' + f2(2.4 * k) + '" fill="#fff" opacity=".35"/>';
    if (hurt) g += '<path d="M' + f(sx - 4 * k) + " " + f(sy - 5 * k) + " L" + f(sx + 1 * k) + " " + f(sy) + " L" + f(sx - 2 * k) + " " + f(sy + 3 * k) + " L" + f(sx + 4 * k) + " " + f(sy + 6 * k) + '" stroke="' + ORANGE + '" stroke-width="' + f2(1.6 * k) + '" fill="none"/>';
    return g;
  }
  function tissueGeo(sp) {   // neuron positions and channel lines for a spacing factor sp (1 = awake, 1.25 = deep sleep)
    var P = [], chY = [], chX = [], w = 0.32 + (sp - 1) * 2.4;
    NR.forEach(function (y, r) { NC.forEach(function (x, c) { P.push([5 + (x - 5) * sp, 4 + (y - 4) * sp, r * 4 + c]); }); });
    [2.8, 5.2].forEach(function (y) { chY.push(4 + (y - 4) * sp); }); [2.6, 5.0, 7.4].forEach(function (x) { chX.push(5 + (x - 5) * sp); });
    return { P: P, chY: chY, chX: chX, w: w };
  }
  var AMY = [[2.6, 2.8], [7.4, 5.2], [5.0, 4.0], [2.6, 5.2]];
  function tissue(K, t, o) {
    o = o || {}; var sp = o.sp || 1, s = "", W = 10, D = 8, G = tissueGeo(sp), k = K.s / 34, wash = clamp(o.wash || 0);
    s += K.box(0, W, 0, D, -1, 0, PAL.pink);
    for (var i = 0; i < 26; i++) { var cx = 0.3 + hash(i + 70) * (W - 0.6), cz = -0.15 - hash(i + 71) * 0.7; s += K.disc(cx, D + 0.01, cz, 0.08 + hash(i) * 0.08, "y", "#c49483", 0, 0.8); }
    // the channels between the cells (wider in deep sleep)
    G.chY.forEach(function (y) { s += K.poly([[0, y - G.w / 2, 0.01], [W, y - G.w / 2, 0.01], [W, y + G.w / 2, 0.01], [0, y + G.w / 2, 0.01]], "#cfe3ee", 0, 0.85); });
    G.chX.forEach(function (x) { s += K.poly([[x - G.w / 2, 0, 0.012], [x + G.w / 2, 0, 0.012], [x + G.w / 2, D, 0.012], [x - G.w / 2, D, 0.012]], "#cfe3ee", 0, 0.85); });
    // the drain on the right edge: a vein that carries the waste away
    if (o.drain) s += K.tube([[W + 0.5, -0.6, -0.5], [W + 0.5, D + 0.6, -0.5]], 0.32, "#8796b8");
    // fluid washing along the channels
    var csf = clamp(o.csf || 0);
    if (csf > 0) G.chY.forEach(function (y, ci) {
      var d = ""; for (var x = 0; x <= W; x += 0.25) { var off = Math.sin(x * 2.2 - t * 4 + ci) * G.w * 0.22; d += (x ? " L" : "M") + K.pt(x, y + off, 0.05); }
      s += '<path d="' + d + '" stroke="#5a9fd0" stroke-width="' + f2(2.2 * k) + '" fill="none" opacity="' + f2(csf) + '"/>';
      for (var j = 0; j < 9; j++) { var u = (t * 0.22 + j / 9 + ci * 0.37) % 1, p = K.P(u * W, y + Math.sin(u * 20 + t * 3) * G.w * 0.2, 0.06); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f2(2.6 * k) + '" fill="#4a90c8" opacity="' + f2(csf * Math.sin(Math.PI * u)) + '"/>'; }
    });
    // waste particles in the channels; washed towards the drain
    var nw = Math.floor(clamp(o.waste || 0) * 40);
    for (var q = 0; q < nw; q++) {
      var ch = q % 5, base = hash(q + 9), wx, wy;
      if (ch < 2) { wx = base * W; wy = G.chY[ch] + (hash(q + 3) - 0.5) * G.w * 0.6; } else { wx = G.chX[ch - 2] + (hash(q + 3) - 0.5) * G.w * 0.6; wy = base * D; }
      var mv = wash * (W + 1) * (0.55 + hash(q + 5) * 0.45) * 1.3, op = 1;
      if (mv > 0) { wx += mv; if (ch >= 2) wy = lerp(wy, G.chY[q % 2], clamp(mv / 3)); op = clamp((W + 0.5 - wx) / 1.2); }
      if (op <= 0) continue; var pw = K.P(Math.min(wx, W + 0.4), wy, 0.12);
      s += '<circle cx="' + f(pw[0]) + '" cy="' + f(pw[1]) + '" r="' + f2(3 * k) + '" fill="#8a5a2c" stroke="' + INK + '" stroke-width="' + f2(0.8 * k) + '" opacity="' + f2(op) + '"/>';
    }
    // amyloid clumps
    var am = clamp(o.amy || 0) * (1 - wash);
    if (am > 0) AMY.forEach(function (a, ai) { var ax = 5 + (a[0] - 5) * sp, ay = 4 + (a[1] - 4) * sp; for (var m = 0; m < 7; m++) { var p = K.P(ax + Math.cos(m * 2.4 + ai) * 0.22, ay + Math.sin(m * 2.4 + ai) * 0.22, 0.15 + (m % 3) * 0.08); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f2((3.6 + hash(m + ai * 7) * 2) * k * pop(am * 1.2 - m * 0.05)) + '" fill="#a2492a" stroke="' + INK + '" stroke-width="' + f2(0.9 * k) + '"/>'; } });
    // the neurons, back to front
    G.P.slice().sort(function (a, b) { return a[0] + a[1] - b[0] - b[1]; }).forEach(function (n) { var p = K.P(n[0], n[1], 0); s += neuron(p[0], p[1], k, t, n[2] * 3.7 + 1, OLIVE, o.act, o.hurt && n[2] === 5); });
    return s;
  }

  // ── a blood vessel in cut-away: the artery and the fluid sleeve around it (the glymphatic route), over a tissue slab ──
  function vessel(K, t, o) {
    o = o || {}; var s = "", Lx = 12, rS = 1.0, rA = 0.55 * (1 + 0.05 * Math.sin(t * 7)), wS = 2.45 * rS * K.s, wA = 2.45 * rA * K.s, k = K.s / 34;
    s += K.box(-1, Lx, -2.2, 2.2, -2.2, -1.0, PAL.pink);
    var a = K.P(-0.4, 0, 0), b = K.P(Lx, 0, 0), ln = "M" + f(a[0]) + " " + f(a[1]) + " L" + f(b[0]) + " " + f(b[1]);
    s += K.disc(-0.4, 0, 0, rS, "x", "#bcd9ea", 1.6);
    s += '<path d="' + ln + '" stroke="' + INK + '" stroke-width="' + f(wS + 3) + '" stroke-linecap="butt"/><path d="' + ln + '" stroke="#cfe6f2" stroke-width="' + f(wS) + '" stroke-linecap="butt"/>';
    s += '<path d="' + ln + '" stroke="' + INK + '" stroke-width="' + f(wA + 2.4) + '" stroke-linecap="butt"/><path d="' + ln + '" stroke="#c0503a" stroke-width="' + f(wA) + '" stroke-linecap="butt"/><path d="' + ln + '" stroke="#e98a72" stroke-width="' + f(wA * 0.22) + '" stroke-linecap="butt" transform="translate(0 ' + f(-wA * 0.22) + ')"/>';
    s += '<path d="' + ln + '" stroke="#9fc3dc" stroke-width="' + f(wS) + '" stroke-linecap="butt" opacity=".28"/>';
    // the fluid in the sleeve: moving dots, with waste carried along
    var fl = clamp(o.flow == null ? 1 : o.flow);
    for (var i = 0; i < 26; i++) {
      var u = (t * 0.16 + i / 26) % 1, ph = hash(i) * Math.PI * 2, rr = rA + (rS - rA) * (0.35 + hash(i + 2) * 0.5), p = K.P(-0.4 + u * (Lx + 0.4), Math.cos(ph) * rr, Math.sin(ph) * rr);
      var waste = o.waste && i % 3 === 0; s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f2((waste ? 3.4 : 2.6) * k) + '" fill="' + (waste ? "#8a5a2c" : "#4a90c8") + '" opacity="' + f2(fl * Math.sin(Math.PI * u)) + '"/>';
    }
    // the cut end: sleeve ring + artery core
    s += K.disc(Lx, 0, 0, rS, "x", "#bcd9ea", 1.8) + K.disc(Lx + 0.01, 0, 0, rA, "x", "#c0503a", 1.6) + K.disc(Lx + 0.02, 0, 0, rA * 0.55, "x", "#7a2a1c", 0);
    for (var w = 0; w < 3; w++) { var aw = t * 2 + w * 2.1; s += K.disc(Lx + 0.02, Math.cos(aw) * (rA + rS) / 2, Math.sin(aw) * (rA + rS) / 2, 0.08, "x", "#4a90c8", 0); }
    return s;
  }

  // ── the memory archive: the hippocampus desk, the big shelves of the cortex, the day's cards flying over ──
  var SLOTS = []; (function () { for (var lv = 0; lv < 4; lv++) for (var n = 0; n < 9; n++) SLOTS.push([3.4 + n * 0.72, 5.0, 0.18 + lv * 1.25]); })();
  var CARD_COL = [PAL.blue, PAL.olive, PAL.orange, PAL.putty, PAL.navy];
  function archive(K, t, o) {
    o = o || {}; var s = "", fill = o.filled == null ? 18 : o.filled;
    s += K.box(-0.5, 10.5, -0.5, 6.9, -0.3, 0, PAL.floor);
    // the hippocampus desk with a stack of today's cards
    s += K.box(0, 2.6, 0, 2.0, 0, 1.3, PAL.olive);
    for (var c = 0; c < 5; c++) s += K.box(0.6 + c * 0.05, 1.7 + c * 0.05, 0.5, 1.4, 1.3 + c * 0.07, 1.36 + c * 0.07, PAL.white, { hatch: false, sw: 0.8 });
    // the cortex shelves, open towards the viewer (the +y side)
    s += K.poly([[3, 5, 0], [10, 5, 0], [10, 5, 5], [3, 5, 5]], PAL.wood[2]);
    for (var lv = 0; lv < 4; lv++) {
      s += K.box(3, 10, 5, 6.4, lv * 1.25, lv * 1.25 + 0.18, PAL.wood, { hatch: false });
      for (var n = 0; n < 9; n++) { var idx = lv * 9 + n; if (idx >= fill) continue; var x = 3.4 + n * 0.72, cc = CARD_COL[idx % 5]; s += K.box(x, x + 0.5, 5.15, 6.2, lv * 1.25 + 0.18, lv * 1.25 + 0.18 + 0.75 + hash(idx) * 0.2, cc, { hatch: false, sw: 0.9 }); }
    }
    s += K.box(3, 10, 5, 6.4, 5, 5.2, PAL.wood) + K.box(2.8, 3, 5, 6.4, 0, 5.2, PAL.wood) + K.box(10, 10.2, 5, 6.4, 0, 5.2, PAL.wood);
    // flying cards: the important ones arc into the next free slots, the rest fade and drop
    if (o.fly) for (var i = 0; i < 6; i++) {
      var u = (t * 0.42 + i / 6) % 1, keep = i % 3 !== 2, sl = SLOTS[(fill + i) % SLOTS.length], x0 = 1.3, y0 = 1.0, z0 = 1.7;
      var x = keep ? lerp(x0, sl[0] + 0.25, u) : lerp(x0, 3.0, u), y = keep ? lerp(y0, sl[1] + 0.6, u) : lerp(y0, 3.4, u), z = keep ? lerp(z0, sl[2] + 0.5, u) + Math.sin(Math.PI * u) * 2.2 : z0 + Math.sin(Math.PI * Math.min(u, 0.5)) * 1.6 - Math.max(0, u - 0.5) * 3.2;
      var op = keep ? Math.min(1, u * 6, (1 - u) * 6) : clamp(1 - u * 1.6), cc = keep ? CARD_COL[i % 5] : PAL.grey;
      if (op <= 0.02) continue; s += K.box(x - 0.3, x + 0.3, y - 0.05, y + 0.05, Math.max(0, z), Math.max(0, z) + 0.45, cc, { hatch: false, sw: 0.9, op: op });
    }
    return s;
  }

  // ── the night as a staircase: one column per stretch of sleep, height = how light the sleep is ──
  var SEQ = "W" + "LLDDLR" + "LDDLRR" + "LLDLRR" + "LLLRRR", SH_H = { W: 3.2, L: 2.4, D: 1.0, R: 2.8 }, SH_C = { W: PAL.putty, L: PAL.blue, D: PAL.navy, R: PAL.orange }, CW = 0.5;
  function stairs(K, t, o) {
    o = o || {}; var s = "", g = o.grow == null ? 1 : o.grow, N = SEQ.length;
    s += K.box(-0.3, N * CW + 0.3, -0.3, 1.9, -0.3, 0, PAL.floor);
    for (var i = 0; i < N; i++) { var gg = clamp(g * N - i); if (gg <= 0) continue; var st = SEQ[i], hi = (o.hi && o.hi.indexOf(st) < 0) ? 0.35 : 1; s += K.box(i * CW, (i + 1) * CW, 0, 1.6, 0, SH_H[st] * ease(gg), SH_C[st], { hatch: false, sw: 1, op: hi < 1 ? 0.45 : null }); }
    if (o.mark != null) { var m = clamp(o.mark) * (N - 1), mi = Math.floor(m), fr = m - mi, h0 = SH_H[SEQ[mi]], h1 = SH_H[SEQ[Math.min(N - 1, mi + 1)]]; s += K.ball((m + 0.5) * CW, 0.8, lerp(h0, h1, ease(fr)) + 0.35, 0.28, "#f2d77a"); }
    return s;
  }
  function stairTop(K, i) { return K.P((i + 0.5) * CW, 0.8, SH_H[SEQ[i]]); }

  // ── two columns to compare ──
  function bars(K, t, o) {
    o = o || {}; var s = "", g = ease(clamp(o.grow == null ? 1 : o.grow));
    s += K.box(-0.4, 5, -0.4, 2.0, -0.3, 0, PAL.floor);
    s += K.box(0, 1.6, 0, 1.6, 0, Math.max(0.02, o.v[0] * g), o.c0 || PAL.blue) + K.box(3, 4.6, 0, 1.6, 0, Math.max(0.02, o.v[1] * g), o.c1 || PAL.blue);
    if (o.extra) s += K.box(3, 4.6, 0, 1.6, o.v[1] * g, (o.v[1] + o.extra * clamp(o.ex == null ? 1 : o.ex)) * g, PAL.orange);
    return s;
  }

  // ── 1964: a dark platform with a desk calendar counting the days and a clock racing ──
  function calendar(K, t, o) {
    o = o || {}; var s = "", day = o.day || 1;
    s += K.box(0, 6, 0, 5, -0.4, 0, PAL.dark);
    s += K.box(1, 3.4, 1, 2.6, 0, 2.8, PAL.white);
    for (var r = 0; r < 4; r++) s += K.line([[1.3 + r * 0.6, 1.5, 2.8], [1.3 + r * 0.6, 1.5, 3.05], [1.3 + r * 0.6, 2.1, 3.05], [1.3 + r * 0.6, 2.1, 2.8]], "#8a8f96", 2);
    s += K.poly([[1.08, 2.61, 2.1], [3.32, 2.61, 2.1], [3.32, 2.61, 2.6], [1.08, 2.61, 2.6]], ORANGE, 0.8);
    s += K.faceText(String(day), 2.2, 2.62, 1.05, "y", 1.35, INK, 900);
    var fp = o.flip == null ? 0 : clamp(o.flip); if (fp > 0 && fp < 1) { var ang = fp * Math.PI, py = 2.6 + Math.sin(ang) * 2.7, pz = 2.8 - Math.cos(ang) * 2.7; s += K.poly([[1.08, 2.6, 2.8], [3.32, 2.6, 2.8], [3.32, py, pz], [1.08, py, pz]], PAL.white[0], 1, 1 - fp * 0.7); }
    // the clock on a stand
    s += K.box(4.2, 5.0, 1.7, 2.3, 0, 0.45, PAL.dark) + K.disc(4.6, 2.0, 1.55, 1.05, "y", "#f4efe0", 2);
    for (var h = 0; h < 12; h++) { var aa = h / 12 * Math.PI * 2; s += K.line([[4.6 + Math.sin(aa) * 0.84, 2.01, 1.55 + Math.cos(aa) * 0.84], [4.6 + Math.sin(aa) * 0.95, 2.01, 1.55 + Math.cos(aa) * 0.95]], INK, 1.2); }
    var ha = t * (o.race ? 2.2 : 0.4), ma = ha * 12; s += K.line([[4.6, 2.02, 1.55], [4.6 + Math.sin(ha) * 0.5, 2.02, 1.55 + Math.cos(ha) * 0.5]], INK, 2.6) + K.line([[4.6, 2.02, 1.55], [4.6 + Math.sin(ma) * 0.8, 2.02, 1.55 + Math.cos(ma) * 0.8]], ORANGE, 1.8);
    return s;
  }

  // ── flat icons drawn in screen space ──
  function moonIcon(x, y, r, col) { return '<path transform="translate(' + f(x) + " " + f(y) + ')" d="M0 ' + f(-r) + " A" + f(r) + " " + f(r) + " 0 1 0 0 " + f(r) + " A" + f(r * 0.68) + " " + f(r) + " 0 1 1 0 " + f(-r) + ' Z" fill="' + (col || "#f2d77a") + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
  function sunIcon(x, y, r, t) { var s = '<g transform="translate(' + f(x) + " " + f(y) + ") rotate(" + f(t * 12) + ')">'; for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2; s += '<path d="M' + f(Math.cos(a) * r * 1.3) + " " + f(Math.sin(a) * r * 1.3) + " L" + f(Math.cos(a) * r * 1.65) + " " + f(Math.sin(a) * r * 1.65) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round"/>'; } return s + '<circle r="' + f(r) + '" fill="#f2b45a" stroke="' + INK + '" stroke-width="1.8"/></g>'; }
  function mouseIcon(x, y, sc, t) {
    var tl = Math.sin(t * 3) * 6; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')"><path d="M40 6 C70 4 ' + f(84 + tl) + ' -14 ' + f(96 + tl) + ' -26" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="6" cy="0" rx="40" ry="24" fill="' + PAL.grey[1] + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M-30 -2 C-44 -4 -54 4 -60 10 C-50 14 -38 12 -28 10 Z" fill="' + PAL.grey[1] + '" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<circle cx="-24" cy="-20" r="11" fill="' + PAL.pink[1] + '" stroke="' + INK + '" stroke-width="2"/><path d="M-14 22 v8 M14 22 v8" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/><path d="M-6 -6 C4 -14 20 -14 30 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/></g>';
  }
  function cloud(x, y, w, h, fill) {   // a dream bubble: circles merged, outline only on the outside
    var cs = [[-0.32, 0.1, 0.34], [0, -0.12, 0.42], [0.32, 0.08, 0.34], [-0.12, 0.22, 0.3], [0.16, 0.24, 0.3]], s = "";
    cs.forEach(function (c) { s += '<ellipse cx="' + f(x + c[0] * w) + '" cy="' + f(y + c[1] * h) + '" rx="' + f(c[2] * w) + '" ry="' + f(c[2] * h * 1.1) + '" fill="' + (fill || PAPER) + '" stroke="' + INK + '" stroke-width="2.4"/>'; });
    cs.forEach(function (c) { s += '<ellipse cx="' + f(x + c[0] * w) + '" cy="' + f(y + c[1] * h) + '" rx="' + f(c[2] * w - 1.6) + '" ry="' + f(c[2] * h * 1.1 - 1.6) + '" fill="' + (fill || PAPER) + '"/>'; });
    return s;
  }
  function runner(x, y, sc, t) {   // a running figure in thin lines (the dream)
    var a = Math.sin(t * 9), b = Math.sin(t * 9 + Math.PI), ln = function (x1, y1, x2, y2) { return '<path d="M' + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'; };
    return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')"><circle cx="4" cy="-46" r="8" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>' + ln(2, -36, -4, -6) + ln(-4, -6, -4 + a * 14, 16) + ln(-4, -6, -4 + b * 14, 16) + ln(0, -30, 0 + b * 14, -16) + ln(0, -30, 0 + a * 14, -18) + "</g>";
  }
  function lockIcon(x, y, sc, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc * k) + ')"><path d="M-8 -4 V-12 A8 8 0 0 1 8 -12 V-4" stroke="' + INK + '" stroke-width="3.6" fill="none"/><rect x="-12" y="-5" width="24" height="18" rx="3" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/><circle cy="3" r="2.6" fill="' + INK + '"/></g>'; }
  function bulb(x, y, sc, on) { return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')"><path d="M-22 -10 A26 26 0 1 1 22 -10 C16 0 12 8 12 18 H-12 C-12 8 -16 0 -22 -10 Z" fill="' + (on ? "#f6e08a" : "#d9d4c8") + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="-12" y="18" width="24" height="14" fill="' + PAL.grey[2] + '" stroke="' + INK + '" stroke-width="2"/><path d="M-12 25 H12" stroke="' + INK + '" stroke-width="1.4"/><path d="M-8 -14 L-3 -2 L3 -14 L8 -2" stroke="' + (on ? ORANGE : "#9c988e") + '" stroke-width="2" fill="none"/></g>'; }
  function ghostTree(x, y, sc, op) { if (op <= 0.02) return ""; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')" opacity="' + f2(op) + '"><path d="M0 -70 L26 -20 L12 -20 L32 14 L-32 14 L-12 -20 L-26 -20 Z M0 14 V36" stroke="#cfe3ee" stroke-width="2.6" fill="none" stroke-dasharray="6 5"/></g>'; }
  function eyeIcon(x, y, sc, t) { var px = Math.sin(t * 11) * 9 + Math.sin(t * 4.3) * 4; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')"><path d="M-34 0 Q0 -26 34 0 Q0 26 -34 0 Z" fill="#fbf8f0" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(px) + '" cy="0" r="10" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(px) + '" cy="0" r="4.2" fill="' + INK + '"/></g>'; }

  // ── the brain from the side (2D technical drawing): o.glow (activity), o.off, o.hippo, o.cortex, o.wash, o.q ──
  var BR_OUT = "M-150 8 C-158 -58 -100 -112 -14 -116 C70 -120 142 -86 154 -24 C162 22 138 56 100 64 C80 68 64 64 48 70 C20 84 -40 86 -86 72 C-124 60 -146 40 -150 8 Z",
      BR_CB = "M46 66 C54 96 104 108 130 90 C148 76 140 58 118 56 C98 54 70 58 46 66 Z", BR_ST = "M30 74 C34 100 40 126 36 150 L62 150 C62 126 58 100 58 76 Z",
      BR_G = ["M-120 -10 C-110 -40 -80 -30 -70 -55 C-60 -80 -30 -70 -20 -90", "M-100 30 C-80 10 -60 30 -40 10 C-20 -10 0 10 20 -10 C40 -30 60 -10 80 -30", "M-30 -40 C-10 -60 10 -40 30 -60 C50 -80 70 -60 90 -76",
              "M40 30 C60 10 80 30 100 10 C120 -10 130 10 140 -10", "M-130 20 C-120 40 -100 50 -80 44", "M0 50 C20 40 30 54 50 46", "M20 -100 C30 -80 10 -70 20 -50 C30 -30 10 -20 20 0", "M60 -96 C70 -76 56 -60 66 -40 C76 -20 60 -6 70 14", "M-70 -96 C-60 -76 -74 -60 -64 -40"],
      BR_SPK = [[-110, -20], [-60, -60], [-20, -80], [30, -60], [80, -50], [120, -10], [-80, 30], [-20, 10], [40, 20], [100, 30], [-40, 50], [60, -20]];
  function brain2d(x, y, sc, t, o) {
    o = o || {}; var fill = o.off ? "#d9d4c8" : "#ecc7b6", g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(sc) + ')">';
    g += '<path d="' + BR_ST + '" fill="' + (o.off ? "#cfcac0" : "#e0b5a2") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="' + BR_CB + '" fill="' + (o.off ? "#cfcac0" : "#e0b5a2") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<path d="M60 74 C80 84 110 86 128 76 M58 66 C80 74 108 76 126 66" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".6"/>';
    g += '<path d="' + BR_OUT + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.8"/><path d="' + BR_OUT + '" fill="url(#hatch)" opacity=".7"/>';
    BR_G.forEach(function (d) { g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="1.6" fill="none" opacity=".55"/>'; });
    if (o.cortex) g += '<path d="' + BR_OUT + '" fill="none" stroke="' + OLIVE + '" stroke-width="' + f(9 + 2 * Math.sin(t * 4)) + '" opacity=".55"/>';
    if (o.hippo) g += '<path d="M-30 30 C-34 14 -16 6 -6 16 C4 26 -6 40 4 50 C14 60 26 52 22 40" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-30 30 C-34 14 -16 6 -6 16 C4 26 -6 40 4 50 C14 60 26 52 22 40" stroke="' + OLIVE + '" stroke-width="6.5" fill="none" stroke-linecap="round"/>';
    if (o.glow) BR_SPK.forEach(function (p, i) { var on = Math.sin(t * 7 + i * 2.3) > 0.2; if (on) g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(5 + 2 * Math.sin(t * 9 + i)) + '" fill="' + ORANGE + '" opacity="' + f2(0.55 + 0.4 * Math.sin(t * 5 + i)) + '"/>'; });
    if (o.wash) for (var w = 0; w < 4; w++) { var d = ""; for (var xx = -140; xx <= 140; xx += 8) { var yy = -60 + w * 34 + Math.sin(xx / 22 - t * 5 + w) * 6; d += (xx > -140 ? " L" : "M") + xx + " " + f(yy); } g += '<path d="' + d + '" stroke="#4a90c8" stroke-width="3" fill="none" opacity="' + f2(0.75 * clamp(o.wash)) + '"/>'; }
    if (o.q) g += '<text x="0" y="22" text-anchor="middle" style="font:900 ' + f(92 + 6 * Math.sin(t * 3)) + 'px Noto Sans Arabic;fill:' + ORANGE + ';paint-order:stroke;stroke:' + PAPER + ';stroke-width:10px">؟</text>';
    return g + "</g>";
  }

  // ── «ليه بنحتاج ننام؟», version B: one isometric world on paper; the camera travels between its stations ──
  // Stations (world px): the bedroom in the middle, the city, the tissue inside the brain, the vessel, the measuring bars,
  // the memory archive, the sleep-cycle stairs and the 1964 corner. Each line of the voice has a camera target.
  var VW = 360, VH = 640, CX = 180, CY = 300;
  function ST(cx, cy, s, ox, oy, w, h, name) { return { c: [cx, cy], K: isoKit(cx - ox, cy - oy, s), w: w, h: h, name: name }; }
  var S = {
    room: ST(0, 0, 20, 17.4, 45, 390, 380, "الأوضة"), city: ST(-470, -330, 18, 31.1, 63, 380, 320, "المدينة"), tis: ST(430, -330, 22, 23.8, 92.4, 360, 280, "جوه المخ"),
    ves: ST(790, 30, 20, 95.2, 76, 310, 230, "الأوعية"), bars: ST(470, 330, 34, 44.2, -3.4, 240, 280, "القياس"), arch: ST(20, 440, 20, 30, 67, 330, 230, "الذكريات"),
    stairs: ST(-460, 330, 24, 112.8, 45.6, 330, 290, "دورات النوم"), cal: ST(-800, 20, 30, 12.9, 61.5, 290, 240, "1964")
  };
  var KR = S.room.K, KC = S.city.K, KT = S.tis.K, KV = S.ves.K, KB = S.bars.K, KA = S.arch.K, KS = S.stairs.K, KD = S.cal.K, G0 = isoKit(0, 0, 20);
  function seg(u, a, b) { return clamp((u - a) / (b - a)); }
  function lineAt(t) { var i = 0; while (i < LN.length - 1 && LN[i + 1].start - 0.05 <= t) i++; return i; }
  function tx(text, x, y, sz, col, z, w, op) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle"' + (op != null ? ' opacity="' + f2(op) + '"' : "") + ' style="font:' + (w || 800) + " " + f2(sz / z) + "px Noto Sans Arabic;fill:" + (col || INK) + ";paint-order:stroke;stroke:" + PAPER + ";stroke-width:" + f2(sz * 0.24 / z) + 'px;stroke-linejoin:round">' + text + "</text>"; }
  function L2(p, dx, dy, text, col, k, z, halo) { return lab(p[0], p[1], p[0] + dx / z, p[1] + dy / z, text, col, k, 13, z, halo); }
  function halo(K, x, y, r, t) { return K.poly(K.circ(x, y, 0.03, r * (1 + 0.08 * Math.sin(t * 4)), "z", 32), "none", 0).replace('fill="none"', 'fill="#e2a92c" fill-opacity=".18" stroke="#e2a92c" stroke-width="2.4"'); }
  function bigQ(x, y, k, t, sz) { k = pop(k); if (k <= 0) return ""; return '<text x="' + f(x) + '" y="' + f(y + 3 * Math.sin(t * 3)) + '" text-anchor="middle" style="font:900 ' + f(sz * k) + "px Noto Sans Arabic;fill:" + ORANGE + ";paint-order:stroke;stroke:" + PAPER + ';stroke-width:6px">؟</text>'; }

  // key points (world px)
  var HD = KR.P(HEAD[0], HEAD[1], HEAD[2]), BED = KR.P(3, 4.7, 1.5), CLK = KR.P(0.02, 7.2, 5.1), PLQ = KT.P(7.4, 5.2, 0.2), DESK = KA.P(1.3, 1.0, 1.3), CYC = KS.P(2, 0.8, 2);

  // camera targets per line: [x, y, zoom, panX, panY]
  var TG = [
    [S.room.c[0], S.room.c[1], 0.87], [0, 0, 0.92], [HD[0] + 30, HD[1] - 10, 1.9], [-10, 0, 0.3], [S.city.c[0], S.city.c[1], 0.88],
    [S.tis.c[0], S.tis.c[1], 0.94], [PLQ[0], PLQ[1], 1.6], [S.tis.c[0], S.tis.c[1], 0.94], [S.tis.c[0] - 10, S.tis.c[1], 0.96, 50, 25],
    [S.ves.c[0], S.ves.c[1], 1.05], [S.bars.c[0], S.bars.c[1] - 30, 1.1], [S.arch.c[0], S.arch.c[1], 1.0], [DESK[0], DESK[1], 1.3, 10, 70],
    [S.stairs.c[0] - 60, S.stairs.c[1] - 30, 1.0, 120, 60], [CYC[0], CYC[1], 1.7], [BED[0], BED[1] - 40, 1.45], [HD[0] + 20, HD[1] - 50, 1.6],
    [S.bars.c[0], S.bars.c[1] - 30, 1.1], [S.cal.c[0], S.cal.c[1], 1.1], [S.cal.c[0] + 10, S.cal.c[1], 1.22], [0, 0, 0.85], [-30, 40, 0.21]
  ];
  function camAt(t) {
    var i = lineAt(t), u = t - LN[i].start, d = (i + 1 < LN.length ? LN[i + 1].start : VIDEO_END + 1.5) - LN[i].start;
    var B = TG[i], A = i ? TG[i - 1] : [HD[0], HD[1], 2.2], tr = i === 0 ? 3.2 : Math.min(1.0, d * 0.45), k = ease(clamp(u / tr));
    if (A.length > 3) { A = [A[0] + A[3], A[1] + A[4], A[2]]; }
    var dist = Math.hypot(B[0] - A[0], B[1] - A[1]), x = lerp(A[0], B[0], k), y = lerp(A[1], B[1], k), z = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), k));
    z *= 1 - Math.sin(Math.PI * k) * clamp(dist / 700) * 0.55;
    var after = clamp((u - tr) / Math.max(0.5, d - tr)); if (B.length > 3) { x += B[3] * ease(after); y += B[4] * ease(after); }
    z *= 1 + 0.06 * after;
    return [x + 6 * Math.sin(t * 0.9) / z, y + 5 * Math.cos(t * 0.9) / z, z, i, u, d];
  }

  // the ground: an isometric grid across the whole world, and a dashed trail between the stations
  function ground() {
    var s = "";
    for (var g = -64; g <= 64; g += 4) s += G0.line([[-64, g, 0], [64, g, 0]], "#dccfb2", 1) + G0.line([[g, -64, 0], [g, 64, 0]], "#dccfb2", 1);
    var tr = [S.cal, S.room, S.city, S.tis, S.ves, S.bars, S.arch, S.stairs, S.room], d = "";
    tr.forEach(function (st, i) { d += (i ? " L" : "M") + f(st.c[0]) + " " + f(st.c[1] + st.h * 0.42); });
    return s + '<path d="' + d + '" fill="none" stroke="#c9bc9f" stroke-width="3" stroke-dasharray="10 9" stroke-linejoin="round"/>';
  }

  // each station draws itself according to the line being spoken (li) and the time into it (u)
  function drawRoom(t, li) { return room(KR, t, { zzz: li <= 3 || li >= 20, lamp: true }); }
  function drawCity(t, li, u, d) { return city(KC, t, { trash: li < 4 ? 0.15 : li === 4 ? seg(u, 0.4, d - 0.4) : 1 }); }
  function drawTis(t, li, u, d) {
    var o = { sp: 1, waste: 0.3, act: true };
    if (li === 5) o.waste = lerp(0.3, 1, seg(u, 0.3, d - 0.3));
    else if (li === 6) { o.waste = 1; o.amy = seg(u, 0.2, 1.4); o.hurt = u > 1.6; }
    else if (li === 7) { o = { sp: 1 + 0.25 * ease(seg(u, 0.6, 3.2)), waste: 1, amy: 1, hurt: true }; }
    else if (li === 8) { o = { sp: 1.25, waste: 1, amy: 1, csf: seg(u, 0.1, 0.6), wash: seg(u, 0.6, d - 0.2), drain: true }; }
    else if (li >= 9) { o = { sp: 1.25, waste: 0, csf: 0.6, drain: true, act: li >= 16 }; }
    return tissue(KT, t, o);
  }
  function drawVes(t, li) { return vessel(KV, t, { flow: 1, waste: li >= 8 && li <= 10 }); }
  function drawBars(t, li, u) {
    if (li < 16) return bars(KB, t, { v: [3.4, 3.4], extra: 0.17, grow: li === 10 ? seg(u, 0.1, 1.0) : li < 10 ? 0.12 : 1, ex: li === 10 ? seg(u, 1.4, 2.0) : li > 10 ? 1 : 0 });
    return bars(KB, t, { v: [3.0, 2.8], c0: PAL.blue, c1: PAL.orange, grow: li === 17 ? seg(u, 0.6, 1.6) : li > 17 ? 1 : 0.12 });
  }
  function drawArch(t, li) { return archive(KA, t, { fly: true, filled: 8 + Math.floor(clamp((t - LN[11].start) / 14) * 16) }); }
  function drawStairs(t, li, u, d) { return stairs(KS, t, { grow: li < 13 ? 0.25 : li === 13 ? seg(u, 0, 1.8) : 1, mark: li === 13 ? seg(u, 0, d) * 0.9 : li === 14 ? 0.05 + 0.2 * clamp(u / d) : 0.9 + 0.1 * Math.sin(t * 0.3) }); }
  function dayAt(li, u, d) { if (li < 18) return [1, 0]; if (li > 18) return [11, 0]; var dd = clamp((u - 0.3) / Math.max(0.5, d - 0.8)), dy = 1 + Math.min(10, Math.floor(dd * 10.999)); return [dy, dy < 11 ? (dd * 10.999) % 1 : 0]; }
  function drawCal(t, li, u, d) { var q = dayAt(li, u, d); return calendar(KD, t, { day: q[0], flip: q[1], race: li >= 18 && li <= 19 }); }
  var DRAW = [[S.city, drawCity], [S.tis, drawTis], [S.cal, drawCal], [S.room, drawRoom], [S.ves, drawVes], [S.stairs, drawStairs], [S.bars, drawBars], [S.arch, drawArch]];

  // the labels, icons and numbers that go with each line (drawn over the stations, sized for the zoom)
  function overlay(t, li, u, d, z) {
    var s = "", k;
    if (li === 0) s += ring(HD[0], HD[1], 16, t, ORANGE, z * 0.9);
    if (li === 1) s += bigQ(HD[0] + 50, HD[1] - 70, seg(u, 0.2, 0.9), t, 80) + L2(CLK, 70, -60, "تمن ساعات", BLUE, seg(u, 0.6, 1.4), z);
    if (li === 2) { k = seg(u, 0.4, 1.4); s += ring(HD[0], HD[1], 14, t, ORANGE, z) + halo(KR, HEAD[0], HEAD[1], 1.1, t);
      if (k > 0) s += '<path d="M' + f(HD[0]) + " " + f(HD[1]) + " L" + f(lerp(HD[0], S.tis.c[0], k * 0.25)) + " " + f(lerp(HD[1], S.tis.c[1], k * 0.25)) + '" stroke="' + ORANGE + '" stroke-width="' + f2(2 / z) + '" stroke-dasharray="' + f2(6 / z) + " " + f2(5 / z) + '"/>';
      s += L2(HD, -60, 70, "دماغك", OLIVE, seg(u, 1.0, 1.7), z); }
    if (li === 3) [[S.tis, "1", "غسيل", BLUE, 0.3], [S.arch, "2", "ترتيب", OLIVE, 0.8], [S.stairs, "3", "دورات", ORANGE, 1.3]].forEach(function (q) {
      var kk = seg(u, q[4], q[4] + 0.5); if (kk <= 0) return; s += '<g transform="translate(' + f(q[0].c[0]) + " " + f(q[0].c[1] - q[0].h * 0.55) + ") scale(" + f2(pop(kk) / z) + ')"><circle r="16" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + q[1] + "</text></g>" + tx(q[2], q[0].c[0], q[0].c[1] - q[0].h * 0.55 - 30 / z, 16, q[3], z, 800, kk); });
    if (li === 4) { var b = BAGS[1], bp = KC.P(b[0], b[1], 0.5), bl = KC.P(9.25, 1.85, 5.2); s += L2(bl, 60, -50, "مدينة", OLIVE, seg(u, 0.3, 1.0), z) + L2(bp, 50, 70, "زبالة", ORANGE, seg(u, 1.6, 2.3), z) + sunIcon(S.city.c[0] - 130, S.city.c[1] - 170, 26, t); }
    if (li === 5) { var n = KT.P(8.6, 4.0, 0), w = KT.P(3, 5.2, 0.12); s += halo(KT, 8.6, 4.0, 0.7, t) + L2([n[0], n[1] - 22], 50, -70, "خلية عصبية", OLIVE, seg(u, 0.3, 1.0), z) + L2(w, -50, 70, "فضلات", ORANGE, seg(u, 2.0, 2.7), z); }
    if (li === 6) { var hn = KT.P(3.8, 4.0, 0); s += L2(PLQ, 40, 60, "بيتا أميلويد", BLUE, seg(u, 0.9, 1.6), z) + L2([hn[0], hn[1] - 22], -40, -50, "خلية بتتأذي", ORANGE, seg(u, 2.2, 2.9), z); }
    if (li === 7) { var sp = 1 + 0.25 * ease(seg(u, 0.6, 3.2)), G = tissueGeo(sp), a = KT.P(0.8, G.chY[1] - G.w / 2, 0.05), bb = KT.P(0.8, G.chY[1] + G.w / 2, 0.05), dk = seg(u, 1.0, 1.5);
      s += moonIcon(S.tis.c[0] - 150, S.tis.c[1] - 120, 20) + tx("نوم عميق", S.tis.c[0] - 150, S.tis.c[1] - 82, 14, BLUE, z, 800, seg(u, 0.3, 0.9));
      if (dk > 0) s += arrow(a[0], a[1], bb[0], bb[1], ORANGE, 2.4, dk) + arrow(bb[0], bb[1], a[0], a[1], ORANGE, 2.4, dk);
      s += numTag("+60%", S.tis.c[0] + 120, S.tis.c[1] - 120, seg(u, 2.6, 3.2), 22, ORANGE, z);
      var mk = seg(u, 3.4, 4.0); if (mk > 0) s += '<g opacity="' + f2(mk) + '">' + mouseIcon(S.tis.c[0] - 120, S.tis.c[1] + 150, 0.55, t) + "</g>" + tx("في الفيران", S.tis.c[0] - 10, S.tis.c[1] + 160, 15, OLIVE, z, 800, mk); }
    if (li === 8) { var G8 = tissueGeo(1.25), c8 = KT.P(2.0, G8.chY[0], 0.05), dr = KT.P(10.5, 6.5, -0.5), a8 = KT.P(5.5, G8.chY[1], 0.4), b8 = KT.P(9.2, G8.chY[1], 0.4);
      s += arrow(a8[0], a8[1], b8[0], b8[1], BLUE, 3, seg(u, 1.2, 2.0)) + L2(c8, -50, -60, "سايل المخ", BLUE, seg(u, 0.4, 1.1), z) + L2(dr, 50, 50, "بره", ORANGE, seg(u, 2.4, 3.0), z); }
    if (li === 9) { var sl = KV.P(5, 0, 1.0), ar = KV.P(12, 0, 0); s += L2(sl, -50, -60, "الجليمفاتيك", BLUE, seg(u, 0.4, 1.1), z) + L2(ar, -30, 70, "شريان", OLIVE, seg(u, 1.2, 1.9), z) + numTag("2012", S.ves.c[0] + 60, S.ves.c[1] - 110, seg(u, 2.0, 2.6), 20, INK, z); }
    if (li === 10) { var b1 = KB.P(0.8, 1.6, 0), b2 = KB.P(3.8, 1.6, 0), fr = KB.P(3.8, 1.6, 1.7), t1 = KB.P(0.8, 0.8, 3.4), t2 = KB.P(3.8, 0.8, 3.6), gk = seg(u, 0.6, 1.2);
      s += tx("بعد ليلة نوم", b1[0], b1[1] + 34, 13, INK, z) + tx("بعد ليلة سهر", b2[0], b2[1] + 34, 13, INK, z);
      if (gk > 0) s += '<g opacity="' + f2(gk) + '">' + moonIcon(t1[0], t1[1] - 36, 15) + eyeIcon(t2[0], t2[1] - 36, 0.45, t) + "</g>";
      s += L2(fr, 60, -30, "بيتا أميلويد", BLUE, seg(u, 0.8, 1.4), z) + numTag("+5%", t2[0] + 70, t2[1] - 40, seg(u, 2.0, 2.6), 20, ORANGE, z); }
    if (li === 11) { var dk1 = KA.P(1.2, 1.0, 1.6); s += L2(dk1, 60, -70, "ذكريات اليوم", BLUE, seg(u, 0.5, 1.2), z); }
    if (li === 12) { var dk2 = KA.P(1.3, 2.0, 0.6), sh = KA.P(6.5, 6.4, 3.2); s += halo(KA, 1.3, 1.0, 1.9, t) + L2(dk2, -60, -40, "الهيبوكامبس", OLIVE, seg(u, 0.2, 0.9), z) + L2(sh, -60, 40, "القشرة", OLIVE, seg(u, 2.4, 3.1), z); }
    if (li === 13) { var a3 = KS.P(0.5, -0.5, 3.6), b3 = KS.P(3.5, -0.5, 3.6), k3 = seg(u, 1.6, 2.2);
      s += moonIcon(S.stairs.c[0] + 120, S.stairs.c[1] - 140, 18);
      if (k3 > 0) { var e3 = [lerp(a3[0], b3[0], k3), lerp(a3[1], b3[1], k3)]; s += '<path d="M' + f(a3[0]) + " " + f(a3[1]) + " L" + f(e3[0]) + " " + f(e3[1]) + '" stroke="' + ORANGE + '" stroke-width="' + f2(3 / z) + '"/>'; if (k3 >= 1) s += tx("90 دقيقة", (a3[0] + b3[0]) / 2 + 10, (a3[1] + b3[1]) / 2 - 16 / z, 15, ORANGE, z); } }
    if (li === 14) { var l = stairTop(KS, 1), dd = stairTop(KS, 3), r = stairTop(KS, 6);
      s += L2(l, -40, -50, "خفيف", BLUE, seg(u, 0.1, 0.7), z) + L2(dd, -40, 60, "عميق", "#4a5e7c", seg(u, 0.9, 1.5), z) + L2(r, 50, -60, "أحلام", ORANGE, seg(u, 1.9, 2.5), z);
      s += waveRay(l[0] - 70 / z, l[1] - 72 / z, l[0] - 20 / z, l[1] - 72 / z, t, BLUE, 2 / z, 7 / z, seg(u, 0.4, 0.9), 1.6 / z) + waveRay(dd[0] - 72 / z, dd[1] + 80 / z, dd[0] - 22 / z, dd[1] + 80 / z, t * 0.4, "#4a5e7c", 5 / z, 22 / z, seg(u, 1.2, 1.7), 1.8 / z) + waveRay(r[0] + 22 / z, r[1] - 82 / z, r[0] + 72 / z, r[1] - 82 / z, t, ORANGE, 2.4 / z, 7 / z, seg(u, 2.2, 2.7), 1.6 / z); }
    if (li === 15) { var c5 = seg(u, 0.2, 0.8), l1 = KR.P(3.2, 4.0, 2.1), l2 = KR.P(5.0, 4.4, 1.9);
      if (c5 > 0) s += '<g opacity="' + f2(c5) + '"><circle cx="' + f(HD[0] + 12) + '" cy="' + f(HD[1] - 22) + '" r="3" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/>' + cloud(HD[0] + 50, HD[1] - 78, 110, 64) + runner(HD[0] + 50, HD[1] - 62, 0.5, t) + "</g>";
      s += lockIcon(l1[0], l1[1] - 9, 0.6, seg(u, 1.2, 1.7)) + lockIcon(l2[0], l2[1] - 9, 0.6, seg(u, 1.5, 2.0)) + L2([l1[0], l1[1] - 9], 50, 60, "العضلات مقفولة", ORANGE, seg(u, 1.8, 2.5), z);
      var e5 = seg(u, 2.6, 3.1); if (e5 > 0) s += '<g opacity="' + f2(e5) + '">' + eyeIcon(BED[0] - 70, BED[1] + 60, 0.45, t) + "</g>" + tx("REM", BED[0] - 70, BED[1] + 88, 14, BLUE, z, 900, e5); }
    if (li === 16) { s += bulb(HD[0] + 6, HD[1] - 60, 0.5, false) + tx("بيطفي؟", HD[0] + 70, HD[1] - 60, 14, "#8a8070", z, 800, seg(u, 0.2, 0.8)) + crossMark(HD[0] + 6, HD[1] - 50, 0.85, seg(u, 1.2, 1.7)); }
    if (li === 17) { var p1 = KB.P(0.8, 1.6, 0), p2 = KB.P(3.8, 1.6, 0); s += tx("صاحي", p1[0], p1[1] + 34, 14, BLUE, z) + tx("نوم الأحلام", p2[0], p2[1] + 34, 14, ORANGE, z) + tx("نشاط المخ", S.bars.c[0], S.bars.c[1] - 140, 15, INK, z, 800, seg(u, 0.3, 0.9)); }
    if (li === 18) { var cc = KD.P(2.2, 2.6, 1.4); s += tx("1964", S.cal.c[0], S.cal.c[1] + 150, 26, ORANGE, z, 900) + L2(cc, -50, -60, "11 يوم", BLUE, seg(u, 2.5, 3.1), z); }
    if (li === 19) { var gk2 = seg(u, 1.6, 2.2), bk = pop(seg(u, 0.3, 0.9));
      for (var i = 0; i < 4; i++) s += ghostTree(S.cal.c[0] - 120 + i * 80, S.cal.c[1] - 40 + (i % 2) * 120, 0.7, gk2 * (0.45 + 0.45 * Math.sin(t * 3 + i * 1.7))).replace(/#cfe3ee/g, "#6f8fae");
      if (bk > 0) s += '<g transform="translate(' + f(S.cal.c[0] + 60) + " " + f(S.cal.c[1] - 120) + ") scale(" + f2(bk * 0.55) + ')"><path d="M-110 -44 H110 V40 H-20 L-46 70 L-40 40 H-110 Z" fill="#fbf8f0" stroke="' + INK + '" stroke-width="2.4"/>' + T("كـ..لا..ـم؟!", 0, 12, 36, INK, 800) + "</g>";
      s += L2([S.cal.c[0] - 40, S.cal.c[1] + 60], -40, 50, "هلاوس", ORANGE, seg(u, 2.0, 2.6), z); }
    if (li === 20) s += L2(CLK, 60, -50, "7 ساعات على الأقل", ORANGE, seg(u, 2.2, 2.9), z);
    if (li === 21) [[S.tis, "1"], [S.arch, "2"], [S.stairs, "3"], [S.room, "4"]].forEach(function (q, j) { var kk = seg(u, 0.2 + j * 0.2, 0.7 + j * 0.2); if (kk > 0) s += '<g transform="translate(' + f(q[0].c[0]) + " " + f(q[0].c[1] - q[0].h * 0.5) + ") scale(" + f2(pop(kk) / z) + ')"><circle r="15" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#fff">' + q[1] + "</text></g>"; });
    return s;
  }

  window.__world = function (svg, t) {
    var c = camAt(t), z = c[2], li = c[3], u = c[4], d = c[5], vx0 = c[0] - CX / z, vy0 = c[1] - CY / z, vx1 = vx0 + VW / z, vy1 = vy0 + VH / z, s = ground();
    DRAW.forEach(function (q) { var st = q[0]; if (st.c[0] + st.w / 2 + 40 < vx0 || st.c[0] - st.w / 2 - 40 > vx1 || st.c[1] + st.h / 2 + 60 < vy0 || st.c[1] - st.h / 2 - 60 > vy1) return; s += q[1](t, li, u, d); });
    if (z < 0.6) { var op = clamp((0.6 - z) / 0.2); DRAW.forEach(function (q) { var st = q[0]; s += tx(st.name, st.c[0], st.c[1] + st.h * 0.5 + 24 / z, 14, "#6a6458", z, 800, op); }); }
    s += overlay(t, li, u, d, z);
    svg.innerHTML = '<g transform="translate(' + CX + " " + CY + ") scale(" + z.toFixed(4) + ") translate(" + f(-c[0]) + " " + f(-c[1]) + ')">' + s + '</g><rect width="360" height="640" filter="url(#paperN)"/>';
    return li;
  };
})();
