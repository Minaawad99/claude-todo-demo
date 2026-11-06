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
  // ── «الواي فاي بيبعت الداتا في الهوا إزاي؟» (v2): a real 3-D camera (yaw/pitch per shot), outlined plates with rounded
  // corners, lit faces, back faces culled, painter's order by depth. Objects are slabs (extruded outlines), tubes and rings.
  var IS = 1.0, GRN = "#5c8f3e", RED = "#c4532c", SCR = "#17324a", SKY = "#9fc3dc", BONE2 = "#faf7ee";
  var K3 = 1.2247, VW = {}, L3 = [];
  function setView(th, ph) {
    VW.V = [Math.cos(th) * Math.cos(ph), Math.sin(th) * Math.cos(ph), Math.sin(ph)];
    VW.R = [Math.sin(th), -Math.cos(th), 0];
    VW.U = [-Math.sin(ph) * Math.cos(th), -Math.sin(ph) * Math.sin(th), Math.cos(ph)];
  }
  setView(Math.PI / 4, 0.615);
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function un(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function add3(a, b, k) { k = k == null ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function lerp3(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  function P(p) { return [dot3(p, VW.R) * K3 * IS, -dot3(p, VW.U) * K3 * IS]; }
  var LIG = un([-0.5, 0.35, 0.8]);
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16); return "rgb(" + Math.round(((n >> 16) & 255) * k) + "," + Math.round(((n >> 8) & 255) * k) + "," + Math.round((n & 255) * k) + ")"; }
  function shadeN(hex, n) { var k = 0.5 + 0.5 * Math.max(0, dot3(n, LIG)); return shade(hex, k); }
  function orient(F, up) { up = up || [0, 0, 1]; var B = un(add3(up, F, -dot3(up, F))), A = cr(B, F); return { A: A, B: B }; }
  function rrectPts(w, h, r) {
    var pts = [], k = 5, cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
    cs.forEach(function (c) { for (var i = 0; i <= k; i++) { var a = (c[2] + 90 * i / k) * Math.PI / 180; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } });
    return pts;
  }
  function circPts(r, n) { var pts = []; for (var i = 0; i < (n || 28); i++) { var a = i / (n || 28) * Math.PI * 2; pts.push([r * Math.cos(a), r * Math.sin(a)]); } return pts; }
  function rectPts(w, h) { return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]; }
  function mapP(C, A, B, pts, e) { var N = un(cr(A, B)); return pts.map(function (p) { return [C[0] + A[0] * p[0] + B[0] * p[1] + N[0] * e, C[1] + A[1] * p[0] + B[1] * p[1] + N[1] * e, C[2] + A[2] * p[0] + B[2] * p[1] + N[2] * e]; }); }
  function poly3(p3, fill, sw, extra) { return '<polygon points="' + p3.map(function (p) { var q = P(p); return f(q[0]) + "," + f(q[1]); }).join(" ") + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.1 : sw) + '" stroke-linejoin="round"' + (extra || "") + '/>'; }
  // an extruded convex outline centred on C: visible faces only, lit by the light, optional hatch overlay
  function slab(C, A, B, pts, T, col, o) {
    o = o || {}; var N = un(cr(A, B)), n = pts.length, area = 0, out = "", i, j, hz = T / 2;
    for (i = 0; i < n; i++) { j = (i + 1) % n; area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
    var sg = area >= 0 ? 1 : -1;
    function W(p, e) { return [C[0] + A[0] * p[0] + B[0] * p[1] + N[0] * e, C[1] + A[1] * p[0] + B[1] * p[1] + N[1] * e, C[2] + A[2] * p[0] + B[2] * p[1] + N[2] * e]; }
    for (i = 0; i < n; i++) {
      j = (i + 1) % n; var p = pts[i], q = pts[j], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      var nw = un(add3(add3([0, 0, 0], A, sg * dy / L), B, -sg * dx / L));
      if (dot3(nw, VW.V) <= 0) continue;
      var quad = [W(p, -hz), W(q, -hz), W(q, hz), W(p, hz)];
      out += poly3(quad, shadeN(col, nw), 1.0);
      if (o.hatch) out += poly3(quad, "url(#hatch)", 0.6);
      if (o.hatchUp && nw[2] > 0.9) out += poly3(quad, "url(#hatch)", 0.6);
    }
    var front = dot3(N, VW.V) > 0, nf = front ? N : [-N[0], -N[1], -N[2]], fe = front ? hz : -hz;
    var face = pts.map(function (p) { return W(p, fe); });
    out += poly3(face, shadeN(o.face || col, nf), 1.2);
    if (o.hatch) out += poly3(face, "url(#hatch)", 0.6);
    if (o.hatchUp && nf[2] > 0.9) out += poly3(face, "url(#hatch)", 0.6);
    return out;
  }
  // a flat decal on a plate (screen, mosaic, label card): local pts mapped on the plane, e = offset along the plane normal
  function plane(C, A, B, pts, col, e) { return poly3(mapP(C, A, B, pts, e || 0), col, 0.8); }
  function tube(pts, r, col) {
    var d = pts.map(function (p, i) { var q = P(p); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ");
    return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(2 * r + 2.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(2 * r) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function dotAt(p, r, col) { var q = P(p); return '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(r) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="1"/>'; }
  // an arc of a ring in the plane spanned by A,B around C
  function ringArc(C, A, B, r, a0, a1, col, op, sw) {
    var d = ""; for (var i = 0; i <= 36; i++) { var a = lerp(a0, a1, i / 36), q = P(add3(add3(C, A, r * Math.cos(a)), B, r * Math.sin(a))); d += (i ? " L" : "M") + f(q[0]) + " " + f(q[1]); }
    return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 2.6) + '" fill="none" opacity="' + f(op == null ? 1 : op) + '" stroke-linecap="round"/>';
  }
  function put(c, s) { L3.push([dot3(c, VW.V), s]); }
  function flush() { L3.sort(function (a, b) { return a[0] - b[0]; }); var s = ""; for (var i = 0; i < L3.length; i++) s += L3[i][1]; L3 = []; return s; }
  function alongPoly(pts, p) { var n = pts.length - 1, s = clamp(p) * n, i = Math.min(n - 1, Math.floor(s)); return lerp3(pts[i], pts[i + 1], s - i); }
  function lab(c, lx, ly, text, col, k, sz) { var q = P(c); return label(q[0], q[1], lx, ly, text, col, k, sz); }
  function camV(th0, ph0, th1, ph1, z0, z1, pan) {
    return function (u, d) { var k = clamp(u / d), kk = 0.5 * k + 0.5 * k * k * (3 - 2 * k); setView(lerp(th0, th1, kk), lerp(ph0, ph1, kk)); var zz = lerp(z0, z1, kk), q = P(pan && pan.length === 3 ? pan : [0, 0, 40]); return [q[0] + (pan && pan.length === 2 ? pan[0] : 0), q[1] + (pan && pan.length === 2 ? pan[1] : 0), zz < 1.9 ? zz * 0.8 : zz]; };
  }
  function ln3(a, b, col, w, op) { var p = P(a), q = P(b); return '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + col + '" stroke-width="' + (w || 1) + '"' + (op != null ? ' opacity="' + op + '"' : '') + ' stroke-linecap="round"/>'; }
  function floorGrid(ext, step) {
    var s = slab([0, 0, -1.5], [1, 0, 0], [0, 1, 0], rectPts(ext * 2, ext * 2), 3, "#e9e0ca", { face: "#ece3cd" });
    for (var k = -ext + step; k < ext; k += step) s += ln3([k, -ext, 0], [k, ext, 0], "#cdbf9f", 1.1) + ln3([-ext, k, 0], [ext, k, 0], "#cdbf9f", 1.1);
    return s;
  }
  // ── objects, drawn from real devices (reference photos listed in ../refs/SOURCES.md) ─────────────────────
  var YEL = "#f2c230", BLUE = "#46698a", OLIVE = "#6b7d3c", ORANGE = "#c4532c", PAPER = "#eee5d0";
  function shift(pts, dx, dy) { return pts.map(function (p) { return [p[0] + dx, p[1] + dy]; }); }
  function rot2(pts, a) { var c = Math.cos(a), s = Math.sin(a); return pts.map(function (p) { return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }); }
  function onFace(C, A, B, pts, col, e, sw) { return poly3(mapP(C, A, B, pts, e || 0), col, sw == null ? 0.6 : sw); }
  function cyl(c, axis, r, len, col, o) { var ax = un(axis), ob = orient(ax, Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]); return slab(c, ob.A, ob.B, circPts(r, 22), len, col, o); }
  function shadowStr(c, A, B, rx, ry) { return poly3(circPts(1, 24).map(function (p) { return [c[0] + A[0] * p[0] * rx + B[0] * p[1] * ry, c[1] + A[1] * p[0] * rx + B[1] * p[1] * ry, c[2] + 0.3]; }), "rgba(60,40,15,.18)", 0); }
  function hexShade(hex, k) { var n = parseInt(hex.slice(1), 16), h2 = function (v) { v = Math.max(0, Math.min(255, Math.round(v * k))); return (v < 16 ? "0" : "") + v.toString(16); }; return "#" + h2((n >> 16) & 255) + h2((n >> 8) & 255) + h2(n & 255); }
  var CAMNOW = [0, 0, 1];
  // labels: a dot on the part, a leader line, the word; sized and kept inside the frame whatever the camera zoom
  function label(px, py, lx, ly, text, col, k, sz) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK;
    var z = CAMNOW[2] || 1, s2 = Math.max(20, Math.min(22, sz || 20)) / z, tw = text.length * s2 * 0.62, m = 16 / z, left = lx < px;
    var minX = CAMNOW[0] - 320 / z + m, maxX = CAMNOW[0] + 320 / z - m, minY = CAMNOW[1] - 400 / z + s2 + m, maxY = CAMNOW[1] + 400 / z - m;
    lx = left ? Math.max(lx, minX + tw + 8 / z) : Math.min(lx, maxX - tw - 8 / z); ly = Math.max(minY, Math.min(maxY, ly));
    var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6));
    var o = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(4 / z) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="' + f(1.2 / z) + '"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="' + f(1.4 / z) + '"/>';
    if (k > 0.55) o += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '"><rect x="' + f(left ? lx - 6 / z - tw - 4 / z : lx + 2 / z) + '" y="' + f(ly - s2 * 0.75) + '" width="' + f(tw + 8 / z) + '" height="' + f(s2 * 1.3) + '" rx="' + f(3 / z) + '" fill="' + PAPER + '" opacity=".82"/>' + T(text, left ? lx - 6 / z : lx + 6 / z, ly + s2 * 0.35, f(s2), col, 800, left ? "start" : "end") + '</g>';
    return o;
  }
  function cubeObj(c, w, d, h, col, o) { return slab([c[0], c[1], c[2] + h / 2], [1, 0, 0], [0, 1, 0], rrectPts(w, d, Math.min(w, d) * 0.08), h, col, o); }

  // the router (after the TP-Link WR845N / WR740N photos): white two-step body, LED bar at the front, three flat blade
  // antennas on hinges at the back, blue WAN + four yellow LAN ports on the back face
  function router3(c, t, s) {
    s = s || 1; var W = 124 * s, D = 80 * s, z0 = c[2], top = z0 + 22 * s, out = shadowStr([c[0] + 6 * s, c[1] + 6 * s, z0], [1, 0, 0], [0, 1, 0], W * 0.6, D * 0.66);
    var body = slab([c[0], c[1], z0 + 5 * s], [1, 0, 0], [0, 1, 0], rrectPts(W, D, 20 * s), 10 * s, "#d6d6d1", { face: "#e6e6e1" });
    body += slab([c[0], c[1], z0 + 16 * s], [1, 0, 0], [0, 1, 0], rrectPts(W - 10 * s, D - 10 * s, 16 * s), 12 * s, "#e9e9e5", { face: "#f6f6f2" });
    var fy = c[1] + D / 2 - 15 * s;
    body += onFace([c[0], fy, top + 0.2], [1, 0, 0], [0, 1, 0], rrectPts(46 * s, 3.6 * s, 1.8 * s), "#b9bec4", 0, 0.4);
    for (var k = 0; k < 3; k++) { var q = P([c[0] - 9 * s + k * 9 * s, fy, top + 0.5]), on = Math.sin(t * (4 + k * 1.3) + k) > -0.5; body += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(1.9 * s) + '" fill="' + (on ? "#4fe06e" : "#8a9a8e") + '"/>'; }
    var backVis = dot3([0, -1, 0], VW.V) > 0, ports = "", ants = "";
    if (backVis) for (var pp = 0; pp < 5; pp++) ports += onFace([c[0] - 34 * s + pp * 15 * s, c[1] - D / 2 - 0.4, z0 + 6 * s], [1, 0, 0], [0, 0, 1], rectPts(11 * s, 7 * s), pp === 0 ? "#2f74c0" : "#e3a92c", 0, 0.6);
    [[-44, -0.62], [0, 0], [44, 0.62]].forEach(function (a) {
      var hb = [c[0] + a[0] * s, c[1] - D / 2 + 7 * s, top - 3 * s], dir = un([Math.sin(a[1] * 0.85), -0.2, Math.cos(a[1] * 0.85)]), lat = un(cr(dir, [0, 1, 0]));
      ants += cyl(hb, [1, 0, 0], 4.6 * s, 10 * s, "#cfcfca");
      ants += slab(add3(hb, dir, 38 * s), lat, dir, rrectPts(9.5 * s, 72 * s, 4.7 * s), 3.2 * s, "#e3e3df", { face: "#efefeb" });
    });
    return out + (backVis ? body + ports + ants : ants + body);
  }

  // screens of the phone: a video player (a landscape film, progress bar, title, next videos) and a photo gallery
  function movieUI(scr, s, t) {
    var out = scr(shift(rectPts(41 * s, 22 * s), 0, 20 * s), "#8fc0e2", 0.02);
    out += scr([[-20.5 * s, 9 * s], [-13 * s, 18 * s], [-7 * s, 14 * s], [1 * s, 23 * s], [9 * s, 15 * s], [14 * s, 18 * s], [20.5 * s, 13 * s], [20.5 * s, 9 * s]], "#4c7a4a", 0.04);
    out += scr(shift(circPts(2.6 * s, 12), 11 * s, 26 * s), "#ffd36b", 0.05);
    var cx = -14 * s + ((t * 3) % 28) * s; out += scr(shift(rrectPts(8 * s, 2.4 * s, 1.2 * s), cx, 27.5 * s), "rgba(255,255,255,.9)", 0.06);
    var pw = 41 * s * ((t * 0.05) % 1);
    out += scr(shift(rectPts(41 * s, 1.1 * s), 0, 8.4 * s), "#4a5560", 0.05) + scr([[-20.5 * s, 7.9 * s], [-20.5 * s + pw, 7.9 * s], [-20.5 * s + pw, 9 * s], [-20.5 * s, 9 * s]], "#ff3b30", 0.06);
    out += scr(shift(rectPts(30 * s, 2.2 * s), -4 * s, 3.6 * s), "#d9e1e8", 0.05) + scr(shift(rectPts(18 * s, 1.5 * s), -10 * s, 0), "#7c8a97", 0.05);
    for (var r = 0; r < 3; r++) { var y = -9 * s - r * 11 * s; out += scr(shift(rectPts(14 * s, 8 * s), -12 * s, y), ["#c98a5a", "#5a8ac9", "#7aa45a"][r], 0.05) + scr(shift(rectPts(16 * s, 1.6 * s), 8 * s, y + 2 * s), "#c7d0d8", 0.05) + scr(shift(rectPts(10 * s, 1.2 * s), 5 * s, y - 1.5 * s), "#6f7d8a", 0.05); }
    return out;
  }
  var PAL = [["#8fc0e2", "#5f9a5a"], ["#f2b36b", "#8a5a3a"], ["#9fb8d8", "#3e6a8a"], ["#e7d39a", "#c98a5a"], ["#bcd0e0", "#7a8a9a"], ["#f0b0a0", "#a05a5a"]];
  function galleryUI(scr, s, t, o) {
    var out = scr(shift(rectPts(16 * s, 2.4 * s), -10 * s, 37 * s), "#e6ebf0", 0.03);
    for (var r = 0; r < 5; r++) for (var c2 = 0; c2 < 3; c2++) {
      var i = r * 3 + c2, x = (c2 - 1) * 13.6 * s, y = (30 - r * 13.6) * s;
      if (i === 0 && o.hide0) { out += scr(shift(rectPts(12.6 * s, 12.6 * s), x, y), "#1b2430", 0.03); continue; }
      var pc = i === 0 ? PAL[0] : PAL[(i * 7 + 3) % PAL.length];
      out += scr(shift(rectPts(12.6 * s, 12.6 * s), x, y), pc[0], 0.03) + scr([[x - 6.3 * s, y - 6.3 * s], [x + 6.3 * s, y - 6.3 * s], [x + 6.3 * s, y - 1 * s], [x + 1 * s, y + 2 * s], [x - 6.3 * s, y - 2 * s]], pc[1], 0.04);
      if (i === 0 && o.pick) out += scr(rectPts(13.6 * s, 13.6 * s).map(function (p) { return [p[0] + x, p[1] + y]; }), "none", 0.05, 1.6);
    }
    return out;
  }
  // a modern phone (after the OnePlus photos): black glass front, aluminium frame, punch-hole camera, status bar,
  // gesture bar, side buttons, and on the back a camera island with three lenses
  function phone3(c, F, t, s, o) {
    s = s || 1; o = o || {}; var ob = orient(F), A = ob.A, B = ob.B, T = 7.5 * s, front = dot3(F, VW.V) > 0;
    var out = o.shadowZ != null ? shadowStr([c[0], c[1], o.shadowZ], A, F, 30 * s, 11 * s) : "";
    out += slab(c, A, B, rrectPts(44 * s, 92 * s, 8 * s), T, "#9aa1aa", { face: front ? "#0c0e11" : (o.back || "#2f4256") });
    if (dot3(A, VW.V) > 0) { out += slab(add3(add3(c, A, 22.3 * s), B, 18 * s), A, B, rrectPts(1.6 * s, 13 * s, 0.7 * s), 2.4 * s, "#767d86") + slab(add3(add3(c, A, 22.3 * s), B, 2 * s), A, B, rrectPts(1.6 * s, 8 * s, 0.7 * s), 2.4 * s, "#767d86"); }
    if (front) {
      var sc = add3(c, F, T / 2), e = 0.25 * s, scr = function (pts, col, de, sw) { return onFace(sc, A, B, pts, col, e + (de || 0), sw == null ? 0 : sw); };
      out += scr(rrectPts(41 * s, 89 * s, 6.5 * s), o.screen === "off" ? "#111418" : "#050a10", 0, 0.5);
      if (o.screen === "movie") out += movieUI(scr, s, t);
      else if (o.screen === "photo") out += galleryUI(scr, s, t, o);
      if (o.screen !== "off") {
        out += scr(shift(rectPts(6 * s, 1.5 * s), -15 * s, 42 * s), "#e8eef3", 0.05);
        for (var b = 0; b < 3; b++) out += scr(shift(rectPts(1 * s, (0.8 + b * 0.5) * s), (10 + b * 1.4) * s, (41.6 + b * 0.25) * s), "#e8eef3", 0.05);
        out += scr(shift(rectPts(3.4 * s, 1.5 * s), 17 * s, 42 * s), "#e8eef3", 0.05);
        out += scr(shift(rrectPts(13 * s, 1.1 * s, 0.55 * s), 0, -42 * s), "rgba(255,255,255,.85)", 0.05);
      }
      out += scr(shift(circPts(1.7 * s, 12), 0, 41.8 * s), "#000", 0.1, 0.5);
      out += scr([[-20.5 * s, 4 * s], [-6 * s, 44.5 * s], [4 * s, 44.5 * s], [-20.5 * s, -6 * s]], "rgba(255,255,255,.07)", 0.12);
    } else {
      var bc = add3(c, F, -T / 2), bk = function (pts, col, sw) { return onFace(bc, A, B, pts, col, -0.3 * s, sw == null ? 0.6 : sw); };
      out += bk(shift(rrectPts(16 * s, 22 * s, 5 * s), 11 * s, 31 * s), "#1f262e");
      [[8, 37], [8, 26], [15, 31.5]].forEach(function (l) { out += bk(shift(circPts(3.4 * s, 14), l[0] * s, l[1] * s), "#0a0c0f") + bk(shift(circPts(1.5 * s, 10), l[0] * s, l[1] * s), "#3b5f80", 0); });
      out += bk(shift(circPts(1.2 * s, 8), 15 * s, 39 * s), "#f6e7b0", 0);
    }
    return out;
  }
  // a phone leaning back on a little stand on a surface at height zb, screen toward F (horizontal)
  function standPhone(x, y, zb, F, t, s, o) {
    s = s || 1; o = o || {}; var Ft = un([F[0], F[1], 0.24]), ob = orient(Ft), c = add3(add3([x, y, zb + 1.5 * s], ob.B, 46 * s), Ft, -3 * s);
    o.shadowZ = zb; var stand = cubeObj(add3([x, y, zb], Ft, -14 * s), 30 * s, 12 * s, 9 * s, "#3a3f46");
    return stand + phone3(c, Ft, t, s, o);
  }

  // a microwave oven (after the Panasonic / Bajaj photos): white body, door with a dark mesh window, control strip with
  // two dials on the right; when it runs the window glows and the plate turns
  function microwave3(c, t, s, on) {
    s = s || 1; var W = 150 * s, D = 100 * s, H = 86 * s, out = shadowStr([c[0] + 8 * s, c[1] + 8 * s, c[2]], [1, 0, 0], [0, 1, 0], W * 0.58, D * 0.6), fy = c[1] + D / 2;
    out += slab([c[0], c[1], c[2] + H / 2], [1, 0, 0], [0, 1, 0], rrectPts(W, D, 7 * s), H, "#e7e6e1", { face: "#f3f2ee" });
    if (dot3([0, 1, 0], VW.V) > 0) {
      var A = [1, 0, 0], B = [0, 0, 1], fp = function (x, z, pts, col, sw) { return onFace([c[0] + x, fy + 0.4, c[2] + z], A, B, pts, col, 0, sw == null ? 0.7 : sw); };
      out += fp(-W * 0.13, H / 2, rrectPts(W * 0.7, H * 0.86, 4 * s), "#f8f7f3", 0.9);
      out += fp(-W * 0.16, H / 2, rrectPts(W * 0.56, H * 0.62, 5 * s), on ? "#8a6a32" : "#2b3035", 0.9);
      if (on) { out += fp(-W * 0.16, H * 0.3, circPts(1, 24).map(function (p) { return [p[0] * W * 0.2, p[1] * 3.5 * s]; }), "#f0d79a", 0.5); out += fp(-W * 0.16 + Math.sin(t * 2) * 8 * s, H * 0.36, rrectPts(16 * s, 9 * s, 3 * s), "#d77a4a", 0.6); }
      out += fp(-W * 0.16, H / 2, rrectPts(W * 0.56, H * 0.62, 5 * s), "url(#mesh)", 0);
      out += fp(W * 0.36, H / 2, rectPts(W * 0.24, H * 0.86), "#efeee9", 0.7);
      [[H * 0.68, t * 0.9], [H * 0.32, -t * 0.4]].forEach(function (k) {
        out += fp(W * 0.36, k[0], circPts(10 * s, 22), "#fbfbf8", 0.9);
        var ang = on ? k[1] : 0.5; out += fp(W * 0.36, k[0], rot2([[-1.1 * s, 0], [1.1 * s, 0], [1.1 * s, 8.5 * s], [-1.1 * s, 8.5 * s]], ang), "#9aa0a6", 0.3);
        for (var m = 0; m < 10; m++) { var a = m / 10 * Math.PI * 2; out += fp(W * 0.36, k[0], rot2([[-0.4 * s, 12 * s], [0.4 * s, 12 * s], [0.4 * s, 14 * s], [-0.4 * s, 14 * s]], a), "#7c8288", 0); }
      });
    }
    return out;
  }
  // the Parkes radio telescope (after the CSIRO photos): a two-storey terracotta tower with white bands and windows,
  // the grey machinery on top, the white dish with its outer mesh ring, and the tripod that holds the focus cabin
  function parkes3(c, t, s) {
    s = s || 1; var out = shadowStr([c[0] + 20 * s, c[1] + 20 * s, c[2]], [1, 0, 0], [0, 1, 0], 70 * s, 60 * s);
    out += cyl([c[0], c[1], c[2] + 40 * s], [0, 0, 1], 30 * s, 80 * s, "#b5704f", { face: "#c27f5d" });
    var aV = Math.atan2(VW.V[1], VW.V[0]);
    [22, 44, 66].forEach(function (z) { out += ringArc([c[0], c[1], c[2] + z * s], [1, 0, 0], [0, 1, 0], 30.3 * s, aV - 1.5, aV + 1.5, "#f2ece2", 1, 2.2 * s); });
    [32, 56].forEach(function (z) { for (var w = -2; w <= 2; w++) { var a = aV + w * 0.45, q = P([c[0] + Math.cos(a) * 30.5 * s, c[1] + Math.sin(a) * 30.5 * s, c[2] + z * s]); out += '<rect x="' + f(q[0] - 2.2 * s) + '" y="' + f(q[1] - 4 * s) + '" width="' + f(4.4 * s * Math.cos(w * 0.45)) + '" height="' + f(7 * s) + '" fill="#3a2a22"/>'; } });
    out += cubeObj([c[0], c[1], c[2] + 80 * s], 54 * s, 44 * s, 24 * s, "#a7adb3");
    var az = 0.45 + t * 0.12, F = un([Math.cos(az) * 0.6, Math.sin(az) * 0.6, 1]), ob = orient(F, [1, 0, 0]), A = ob.A, B = ob.B, R = 112 * s, depth = 34 * s, vtx = [c[0], c[1], c[2] + 122 * s];
    function dp(r, a) { return add3(add3(add3(vtx, F, depth * (r / R) * (r / R)), A, r * Math.cos(a)), B, r * Math.sin(a)); }
    var into = dot3(F, VW.V) > 0, rim = [], inner = [], i, bowl = "";
    for (i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2; rim.push(dp(R, a)); inner.push(dp(R * 0.66, a)); }
    bowl += poly3(rim, into ? "#e6e5df" : "#b9b7b0", 1.4) + poly3(rim, "url(#hatch)", 0) + poly3(inner, into ? "#f5f4ef" : "#c9c7c0", 1);
    for (i = 0; i < 18; i++) { var aa = i / 18 * Math.PI * 2, d = ""; for (var r = 0; r <= 8; r++) { var q2 = P(dp(R * r / 8, aa)); d += (r ? " L" : "M") + f(q2[0]) + " " + f(q2[1]); } bowl += '<path d="' + d + '" stroke="#a9a79f" stroke-width="0.9" fill="none"/>'; }
    [0.33, 0.85].forEach(function (k) { var d2 = ""; for (var j = 0; j <= 48; j++) { var q3 = P(dp(R * k, j / 48 * Math.PI * 2)); d2 += (j ? " L" : "M") + f(q3[0]) + " " + f(q3[1]); } bowl += '<path d="' + d2 + '" stroke="#a9a79f" stroke-width="0.9" fill="none"/>'; });
    var focus = add3(vtx, F, depth + 74 * s), legs = "";
    [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6].forEach(function (a) { legs += tube([dp(R * 0.5, a), focus], 1.7 * s, "#ecebe6"); });
    legs += cyl(focus, F, 9 * s, 16 * s, "#efeee9");
    out += tube([[c[0], c[1], c[2] + 92 * s], vtx], 6 * s, "#8e959c");
    return out + (into ? bowl + legs : legs + bowl);
  }
  // an RJ45 plug (clear plastic body, gold contacts, latch, coloured boot) pointing along dir
  function rj45(c, dir, s, col) {
    s = s || 1; var lat = un(cr([0, 0, 1], dir)), out = "";
    out += slab(add3(c, dir, -17 * s), lat, [0, 0, 1], rrectPts(9 * s, 9 * s, 3 * s), 14 * s, col || "#3a7cc4");
    out += slab(c, lat, [0, 0, 1], rrectPts(13 * s, 10 * s, 1.5 * s), 20 * s, "#dfe7ec", { face: "#eef3f6" });
    for (var k = 0; k < 6; k++) out += ln3(add3(add3(add3(c, dir, 4 * s), lat, (k - 2.5) * 1.8 * s), [0, 0, 1], 5.1 * s), add3(add3(add3(c, dir, 9.5 * s), lat, (k - 2.5) * 1.8 * s), [0, 0, 1], 5.1 * s), "#c9a24e", 1.1);
    return out;
  }
  // a stack of banknotes held by a paper band
  function bundle3(c, s) {
    s = s || 1; var out = slab([c[0], c[1], c[2] + 5 * s], [1, 0, 0], [0, 1, 0], rectPts(100 * s, 46 * s), 10 * s, "#8fae86", { face: "#a9c59e" });
    out += onFace([c[0] + 22 * s, c[1], c[2] + 10.2 * s], [1, 0, 0], [0, 1, 0], circPts(1, 18).map(function (p) { return [p[0] * 11 * s, p[1] * 13 * s]; }), "#8fad85", 0, 0.6);
    out += onFace([c[0], c[1], c[2] + 10.2 * s], [1, 0, 0], [0, 1, 0], rectPts(92 * s, 38 * s), "none", 0, 0.6);
    out += slab([c[0] - 18 * s, c[1], c[2] + 5 * s], [1, 0, 0], [0, 1, 0], rectPts(16 * s, 47 * s), 10.8 * s, "#efe7c6");
    return out;
  }
  // ── places: a living room, a kitchen, a classroom, a desk top, a field ─────────────────────────────────
  // floor + two walls on the far sides (x = -ext and y = -ext), skirting, a window; o: {tiles, wall, window, board}
  function room3(ext, h, o) {
    o = o || {}; h = h || 150; var s = "", th = 10;
    s += slab([0, 0, -2], [1, 0, 0], [0, 1, 0], rectPts(ext * 2, ext * 2), 4, o.tiles ? "#d9d6cf" : "#c79f72", { face: o.tiles ? "#e4e1da" : "#d4ad80" });
    if (o.tiles) { for (var k = -ext + 30; k < ext; k += 30) s += ln3([k, -ext, 0.2], [k, ext, 0.2], "#c4c0b6", 1) + ln3([-ext, k, 0.2], [ext, k, 0.2], "#c4c0b6", 1); }
    else for (var k2 = -ext + 20; k2 < ext; k2 += 20) { s += ln3([k2, -ext, 0.2], [k2, ext, 0.2], "#b48a5e", 1); for (var j = 0; j < 3; j++) { var yy = -ext + (hash(k2 * 3 + j * 13) * 2 * ext); s += ln3([k2 - 20, yy, 0.2], [k2, yy, 0.2], "#b48a5e", 1); } }
    var wA = slab([0, -ext - th / 2, h / 2], [1, 0, 0], [0, 0, 1], rectPts(ext * 2, h), th, o.wall || "#efe6d3", { hatchUp: true });
    var wB = slab([-ext - th / 2, 0, h / 2], [0, 1, 0], [0, 0, 1], rectPts(ext * 2 + th * 2, h), th, o.wall2 || "#e4dac5", { hatchUp: true });
    s += (dot3([0, -ext, h / 2], VW.V) < dot3([-ext, 0, h / 2], VW.V) ? wA + wB : wB + wA);
    s += onFace([0, -ext + 0.3, 5], [1, 0, 0], [0, 0, 1], rectPts(ext * 2, 10), "#f7f4ec", 0, 0.5) + onFace([-ext + 0.3, 0, 5], [0, 1, 0], [0, 0, 1], rectPts(ext * 2, 10), "#f7f4ec", 0, 0.5);
    if (o.window !== false) { var wx = o.winX == null ? 70 : o.winX, wc = [wx, -ext + 0.4, h * 0.6]; s += onFace(wc, [1, 0, 0], [0, 0, 1], rectPts(94, 70), "#f7f4ec", 0, 1) + onFace(wc, [1, 0, 0], [0, 0, 1], rectPts(84, 60), "#bcdcf0", 0, 0.8) + onFace(wc, [1, 0, 0], [0, 0, 1], [[-42, -10], [-10, 30], [6, 30], [-42, -26]], "rgba(255,255,255,.35)", 0.1, 0) + ln3([wx, -ext + 0.6, h * 0.6 - 30], [wx, -ext + 0.6, h * 0.6 + 30], "#f7f4ec", 3) + ln3([wx - 42, -ext + 0.6, h * 0.6], [wx + 42, -ext + 0.6, h * 0.6], "#f7f4ec", 3); }
    if (o.board) { var bc = [-20, -ext + 0.4, h * 0.6]; s += onFace(bc, [1, 0, 0], [0, 0, 1], rectPts(150, 66), "#8a6a44", 0, 1) + onFace(bc, [1, 0, 0], [0, 0, 1], rectPts(142, 58), "#2f4a3c", 0, 0.6); for (var l = 0; l < 3; l++) s += ln3([-80, -ext + 0.6, h * 0.6 + 18 - l * 14], [-80 + 60 + hash(l) * 50, -ext + 0.6, h * 0.6 + 18 - l * 14], "#e9efe9", 1.6); }
    return s;
  }
  function deskTop(ext) {
    var s = slab([0, 0, -3], [1, 0, 0], [0, 1, 0], rrectPts(ext * 2, ext * 1.4, 10), 6, "#a87b52", { face: "#b98b60" });
    for (var k = 0; k < 14; k++) { var y = -ext * 0.7 + 8 + k * (ext * 1.4 - 16) / 13; s += ln3([-ext + 6, y, 0.2], [ext - 6, y + Math.sin(k) * 4, 0.2], "#a37a52", 0.8, 0.8); }
    return s;
  }
  function table3(c, w, d, h, col, onTop) {
    var s = shadowStr([c[0] + 8, c[1] + 8, c[2]], [1, 0, 0], [0, 1, 0], w * 0.55, d * 0.55), legs = [];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { var p = [c[0] + q[0] * (w / 2 - 6), c[1] + q[1] * (d / 2 - 6), c[2] + (h - 4) / 2]; legs.push([dot3(p, VW.V), cyl(p, [0, 0, 1], 2.6, h - 4, "#5a4330")]); });
    legs.sort(function (a, b) { return a[0] - b[0]; }); legs.forEach(function (l) { s += l[1]; });
    return s + slab([c[0], c[1], c[2] + h - 2], [1, 0, 0], [0, 1, 0], rrectPts(w, d, 3), 4, col || "#9b7350", { face: hexShade(col || "#9b7350", 1.12) }) + (onTop || "");
  }
  function sofa3(c) {
    var col = "#5f8190", x = c[0], y = c[1];
    put([x, y - 26, 40], cubeObj([x, y - 26, 0], 180, 18, 62, col, { face: "#6a8d9c" }));
    put([x, y + 2, 12], cubeObj([x, y + 2, 0], 180, 58, 24, "#557482", { face: "#5f8190" }) + cubeObj([x - 41, y + 6, 24], 80, 48, 12, "#6f93a3", { face: "#7a9fae" }) + cubeObj([x + 41, y + 6, 24], 80, 48, 12, "#6f93a3", { face: "#7a9fae" }));
    put([x - 84, y, 30], cubeObj([x - 84, y, 0], 16, 64, 40, col, { face: "#6a8d9c" }));
    put([x + 84, y, 30], cubeObj([x + 84, y, 0], 16, 64, 40, col, { face: "#6a8d9c" }));
  }
  // a TV on a low cabinet against the x = -ext wall, screen toward +x
  function tv3(c, t, on) {
    var s = cubeObj(c, 44, 150, 40, "#7a5a3e", { face: "#8a6a4c" }), A = [0, 1, 0], B = [0, 0, 1];
    s += slab([c[0] - 4, c[1], c[2] + 92], A, B, rrectPts(136, 78, 2), 5, "#1d2024", { face: "#15181b" });
    if (dot3([1, 0, 0], VW.V) > 0) { var sc = [c[0] - 1.2, c[1], c[2] + 92]; s += onFace(sc, A, B, rectPts(128, 70), on ? "#4f86b7" : "#0e1a26", 0, 0) ; if (on) s += onFace(sc, A, B, [[-64, -35], [-30, -5], [-6, -22], [24, 10], [64, -18], [64, -35]], "#4c7a4a", 0, 0) + onFace(sc, A, B, shift(circPts(8, 14), 38, 18), "#ffd36b", 0, 0); }
    return s;
  }
  function laptop3(c, t, s) {
    s = s || 1; var out = shadowStr(c, [1, 0, 0], [0, 1, 0], 36 * s, 26 * s) + slab([c[0], c[1], c[2] + 1.5 * s], [1, 0, 0], [0, 1, 0], rrectPts(64 * s, 44 * s, 3 * s), 3 * s, "#b9bec4", { face: "#c9ced4" });
    out += onFace([c[0], c[1] + 6 * s, c[2] + 3.2 * s], [1, 0, 0], [0, 1, 0], rectPts(52 * s, 18 * s), "#9aa0a7", 0, 0.4) + onFace([c[0], c[1] + 18 * s, c[2] + 3.2 * s], [1, 0, 0], [0, 1, 0], rectPts(18 * s, 7 * s), "#aeb3b9", 0, 0.4);
    var B = un([0, -0.28, 0.96]), hc = [c[0], c[1] - 22 * s, c[2] + 3 * s], lc = add3(hc, B, 21 * s);
    out += slab(lc, [1, 0, 0], B, rrectPts(64 * s, 42 * s, 3 * s), 2.4 * s, "#b9bec4", { face: dot3(cr([1, 0, 0], B), VW.V) > 0 ? "#151a20" : "#c9ced4" });
    if (dot3(cr([1, 0, 0], B), VW.V) > 0) out += onFace(add3(lc, cr([1, 0, 0], B), 1.4 * s), [1, 0, 0], B, rectPts(58 * s, 36 * s), "#dfe8f0", 0, 0) + onFace(add3(lc, cr([1, 0, 0], B), 1.5 * s), [1, 0, 0], B, shift(rectPts(58 * s, 5 * s), 0, 15.5 * s), "#4f86b7", 0, 0) + onFace(add3(lc, cr([1, 0, 0], B), 1.5 * s), [1, 0, 0], B, shift(rectPts(26 * s, 18 * s), -12 * s, -3 * s), "#8fc0e2", 0, 0);
    return out;
  }
  function counter3(c, len) {
    var s = cubeObj(c, len, 62, 86, "#e7e1d4", { face: "#efe9dc" });
    for (var k = 0; k < len / 60; k++) s += onFace([c[0] - len / 2 + 30 + k * 60, c[1] + 31.3, c[2] + 43], [1, 0, 0], [0, 0, 1], rectPts(54, 76), "none", 0, 0.8) + onFace([c[0] - len / 2 + 50 + k * 60, c[1] + 31.4, c[2] + 66], [1, 0, 0], [0, 0, 1], rectPts(12, 2.4), "#9aa0a6", 0, 0.3);
    return s + slab([c[0], c[1], c[2] + 88], [1, 0, 0], [0, 1, 0], rectPts(len + 6, 66), 4, "#55585c", { face: "#63676b" });
  }
  function tree3(c, s) { var q = P([c[0], c[1], c[2] + 70 * s]), r = 34 * s * K3 * IS; return tube([[c[0], c[1], c[2]], [c[0], c[1], c[2] + 50 * s]], 4 * s, "#6b4f36") + '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(r) + '" fill="#6f8f4f" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(q[0] - r * 0.3) + '" cy="' + f(q[1] - r * 0.3) + '" r="' + f(r * 0.55) + '" fill="#86a862"/>'; }
  // data tokens: a printed photo (0), a chat bubble (1), a music disc (2), facing F
  function token3(c, kind, F, s) {
    s = s || 1; var ob = orient(F), A = ob.A, B = ob.B, sd = dot3(F, VW.V) > 0 ? 1 : -1, fc = function (pts, col, sw) { return onFace(c, A, B, pts, col, sd * 0.9 * s, sw == null ? 0 : sw); };
    if (kind === 0) { var o = slab(c, A, B, rectPts(26 * s, 20 * s), 1.4 * s, "#f4f2ec", { face: "#fbfaf6" }); o += fc(rectPts(22 * s, 16 * s), PAL[0][0], 0.4) + fc([[-11 * s, -8 * s], [-4 * s, 1 * s], [0, -3 * s], [5 * s, 3 * s], [11 * s, -2 * s], [11 * s, -8 * s]], PAL[0][1]) + fc(shift(circPts(2 * s, 10), 6 * s, 5 * s), "#ffd36b"); return o; }
    if (kind === 1) { var m = slab(c, A, B, rrectPts(26 * s, 15 * s, 6 * s), 1.4 * s, BLUE, { face: "#5a84ab" }); return m + fc(shift(rectPts(16 * s, 1.6 * s), -1 * s, 2.5 * s), "#e9f0f6") + fc(shift(rectPts(10 * s, 1.6 * s), -4 * s, -2 * s), "#e9f0f6"); }
    if (kind === 3) { var sh = slab(c, A, B, rectPts(20 * s, 26 * s), 1.2 * s, "#f7f6f1", { face: "#fdfcf8" }); for (var l = 0; l < 5; l++) sh += fc(shift(rectPts((12 + (l % 2) * 3) * s, 1.2 * s), -1 * s, (8 - l * 4) * s), "#9aa3ad"); return sh; }
    var q = P(c); return slab(c, A, B, circPts(9 * s, 20), 1.4 * s, "#2b3138", { face: "#3a4250" }) + T("♪", q[0], q[1] + 6 * s, 16 * s, "#f2c230", 900);
  }
  function cable(pts, col) { return tube(pts, 2.6, col || "#3a7cc4"); }
  function bitsPath(pts, n, t, sp, col, sz) {
    var s = ""; for (var i = 0; i < n; i++) { var c = t * sp + i / n, p = c % 1, q = P(alongPoly(pts, p)), v = hash(i * 13 + Math.floor(c)) > 0.5 ? "1" : "0"; s += '<g opacity="' + f(Math.min(1, p * 5, (1 - p) * 5)) + '">' + T(v, q[0], q[1] + 6, sz || 20, col || INK, 900) + '</g>'; }
    return s;
  }
  function floorRings(C, t, n, col, r0, step, a0, a1) { var s = ""; for (var k = 0; k < n; k++) { var r = r0 + ((t * 40 + k * step) % (n * step)); s += ringArc(C, [1, 0, 0], [0, 1, 0], r, a0 || 0, a1 || Math.PI * 2, col, clamp(1 - r / (n * step + r0)), 2.4); } return s; }
  function bars(x, y, n) { var s = ""; for (var i = 0; i < 4; i++) s += '<rect x="' + (x + i * 14) + '" y="' + f(y - (10 + i * 9)) + '" width="9" height="' + (10 + i * 9) + '" fill="' + (i < n ? GRN : "#cfc8b8") + '" stroke="' + INK + '" stroke-width="1"/>'; return s; }
  var MESH = '<defs><pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="#000" opacity=".4"/></pattern></defs>';
  // the living room used by several shots: sofa against the back wall, TV on the side wall, a side table with the router,
  // a coffee table on a rug in the middle (things on it passed in onTable)
  function livingRoom(t, o) {
    o = o || {}; var s = room3(200, 150, { winX: 90 });
    s += onFace([30, 20, 0.3], [1, 0, 0], [0, 1, 0], rrectPts(200, 140, 10), "#a97b6a", 0, 0.8) + onFace([30, 20, 0.4], [1, 0, 0], [0, 1, 0], rrectPts(180, 120, 8), "none", 0, 0.6);
    sofa3([10, -150, 0]);
    if (o.tv !== false) put([-170, 40, 30], tv3([-178, 40, 0], t, o.tvOn));
    put([-150, -150, 30], table3([-150, -150, 0], 56, 56, 52, "#8b6646", o.side ? o.side : router3([-150, -150, 52], t, 0.62)));
    if (o.coffee !== false) put([30, 20, 20], table3([30, 20, 0], 120, 70, 38, "#9b7350", o.onTable || ""));
    return s;
  }
  // ── shots: one per script line (line 0 is the opening card, line 24 the summary card) ─────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: function (u, d) { var c = cam(u, d); CAMNOW = c; return c; }, draw: draw }); }
  var ROUT = [-150, -150, 52], RTOP = [-150, -150, 118], PHN = [50, 30, 38];
  shot(0, camV(0.8, 0.5, 0.8, 0.5, 1, 1), function () { return paper(); });
  // 1 — pictures, words and sound fly through the living room's air from the router to the phone; you can't see them
  shot(1, camV(0.55, 0.5, 0.95, 0.56, 1.2, 1.3, [-40, -40, 70]), function (u, d, t) {
    var s = paper() + livingRoom(t, { onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "movie" }) });
    s += flush() + floorRings(RTOP, t, 3, BLUE, 20, 34);
    for (var i = 0; i < 6; i++) { var p = (t * 0.2 + i / 6) % 1, q = lerp3(RTOP, [50, 30, 140], p); q[2] += Math.sin(p * Math.PI) * 60; s += token3(q, i % 3, un(add3(VW.V, [Math.sin(t + i) * 0.3, 0, 0])), 1.25); }
    var m = P([-50, -60, 175]);
    return s + label(m[0], m[1], -230, -250, "صور وصوت", BLUE, (u - 0.5) / 0.8, 20) + label(m[0] + 40, m[1] + 10, 150, -280, "مش شايفهم", ORANGE, (u - 1.4) / 0.8, 20);
  });
  // 2 — the puzzle: how does it travel, and who decodes it? (seen from above)
  shot(2, camV(0.95, 1.0, 0.65, 0.78, 1.15, 1.25, [-50, -60, 50]), function (u, d, t) {
    var s = paper() + livingRoom(t, { onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "movie" }) }) + flush();
    var pts = []; for (var k = 0; k <= 12; k++) { var q = lerp3(RTOP, [50, 30, 135], k / 12); q[2] += Math.sin(k / 12 * Math.PI) * 50; pts.push(q); }
    s += bitsPath(pts, 10, t, 0.22, BLUE, 22);
    var a = P([-50, -60, 190]);
    s += T("؟", a[0] - 60, a[1] - 40 + Math.sin(t * 2) * 6, 64, ORANGE, 900) + T("؟", a[0] + 70, a[1] - 70 + Math.cos(t * 2) * 6, 40, BLUE, 900);
    var b = P([50, 30, 110]);
    return s + label(a[0], a[1], -220, -230, "الداتا؟", BLUE, (u - 0.4) / 0.8, 20) + label(b[0], b[1], 200, -150, "بتفكّها إزاي؟", ORANGE, (u - 1.6) / 0.8, 20);
  });
  // 3 — the title card: the camera circles the router in its corner while its waves spread through the room
  shot(3, camV(0.25, 0.55, 1.2, 0.62, 1.3, 1.4, [-110, -110, 120]), function (u, d, t) {
    var s = paper() + livingRoom(t, { coffee: false, tv: false }) + flush() + floorRings([ROUT[0], ROUT[1], 1], t, 4, BLUE, 40, 50);
    var z = CAMNOW[2], cx = CAMNOW[0], cy = CAMNOW[1] - 300 / z;
    return s + '<rect x="' + f(cx - 200 / z) + '" y="' + f(cy - 60 / z) + '" width="' + f(400 / z) + '" height="' + f(100 / z) + '" rx="' + f(8 / z) + '" fill="' + PAPER + '" opacity=".92"/>' + T("إيه الحكاية؟", cx, cy, f(40 / z), ORANGE, 900) + T("هشرحهالك في دقيقة", cx, cy + 32 / z, f(20 / z), INK, 700);
  });
  // 4 — close on the router on a desk: what it sends is 0s and 1s
  shot(4, camV(0.9, 0.5, 1.25, 0.6, 2.0, 2.3, [0, 0, 40]), function (u, d, t) {
    var s = paper() + deskTop(200); put([0, 0, 20], router3([0, 0, 0], t, 1.6)); s += flush();
    s += bitsPath([[40, 50, 40], [110, 60, 80], [160, 60, 130]], 8, t, 0.5, BLUE, 26);
    var a = P([0, 30, 36]), b = P([110, 60, 80]);
    return s + label(a[0], a[1], -110, -110, "الراوتر", BLUE, (u - 0.3) / 0.8, 14) + label(b[0], b[1], -30, 110, "أصفار وواحدات", ORANGE, (u - 1.1) / 0.8, 14);
  });
  // 5 — the photo lifts out of the phone, bursts into 0s and 1s, the bits fly through the air (Wi-Fi) into the router,
  //     and from the router down the blue cable into the wall socket
  shot(5, function (u, d) {
    var k = clamp(u / d), kk = 0.5 * k + 0.5 * k * k * (3 - 2 * k); setView(lerp(0.75, 1.05, kk), lerp(0.42, 0.55, kk));
    var a = P([50, 30, 90]), b = P([-60, -80, 70]); return [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(1.9, 1.05, kk)];
  }, function (u, d, t) {
    var a = clamp(u / d), lift = a > 0.06;
    var s = paper() + livingRoom(t, { tv: false, onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "photo", pick: !lift, hide0: lift }) });
    var cab = [[-150, -176, 56], [-150, -186, 44], [-150, -194, 30], [-150, -197, 14]];
    s += flush() + cable(cab) + onFace([-150, -199.4, 14], [1, 0, 0], [0, 0, 1], rrectPts(16, 20, 2), "#f7f5ef", 0, 0.8);
    var c0 = [44, 36, 100], c1 = [70, 60, 165], c2 = [20, 0, 190], card = null, sc = 2.6;
    if (a < 0.3) { var k1 = clamp((a - 0.06) / 0.24), e1 = k1 * k1 * (3 - 2 * k1); card = lerp3(c0, c1, e1); sc = lerp(1.2, 2.8, e1); }
    else if (a < 0.48) { var k2 = (a - 0.3) / 0.18; card = lerp3(c1, c2, k2); sc = 2.8 * (1 - k2 * k2); }
    if (card && sc > 0.05 && lift) s += token3(card, 0, un(add3(VW.V, [Math.sin(t * 2) * 0.25, 0, Math.cos(t * 1.7) * 0.15])), sc);
    var path = [c2, [-40, -50, 200], [-110, -120, 160], [-150, -150, 120], [-150, -165, 70], [-150, -176, 56], [-150, -186, 44], [-150, -194, 30], [-150, -197, 14]], g = (a - 0.4) / 0.6;
    for (var i = 0; i < 18; i++) { var pi = clamp(g * 1.5 - i * 0.03); if (pi <= 0 || pi >= 1) continue; var q = P(alongPoly(path, pi)); s += '<g opacity="' + f(Math.min(1, (1 - pi) * 8)) + '">' + T(hash(i * 7) > 0.5 ? "1" : "0", q[0] + (hash(i) - 0.5) * 16 * (1 - pi), q[1] + 6, 20, BLUE, 900) + '</g>'; }
    if (a > 0.45) s += floorRings(RTOP, t, 3, BLUE, 16, 26);
    var lb = P(c1), la = P([-40, -50, 200]), lc = P([-150, -190, 40]);
    return s + (a < 0.46 ? label(P(card || c1)[0], P(card || c1)[1], 200, -250, "صورة", BLUE, (u - 0.2) / 0.7, 22) : "") + label(la[0], la[1], -40, -300, "في الهوا (واي فاي)", ORANGE, (a - 0.5) * d / 0.7, 18) + label(lc[0], lc[1], -250, 60, "وبعدين في السلك", OLIVE, (a - 0.75) * d / 0.6, 18);
  });
  // 6 — the router turns the bits into a radio wave
  shot(6, camV(0.7, 0.85, 1.1, 0.72, 2.2, 2.45, [-150, -150, 80]), function (u, d, t) {
    var s = paper() + livingRoom(t, { tv: false, coffee: false }) + flush();
    s += cable([[-150, -176, 56], [-150, -186, 44], [-150, -194, 30], [-150, -197, 14]]) + bitsPath([[-150, -197, 14], [-150, -186, 44], [-150, -170, 60]], 5, t, 0.5, BLUE, 12);
    s += floorRings(RTOP, t, 4, BLUE, 14, 22);
    var a = P(RTOP);
    return s + label(a[0], a[1], a[0] - 60, a[1] - 70, "موجة راديو", BLUE, (u - 0.5) / 0.8, 13);
  });
  // 7 — the wave changes shape with every bit
  shot(7, camV(0.4, 0.3, 1.0, 0.45, 1.2, 1.3), function (u, d, t) {
    var s = paper() + floorGrid(190, 34), pts = [];
    for (var x = -200; x <= 200; x += 6) { var b = Math.floor((x + t * 60) / 60), v = hash(b * 3) > 0.5, A = v ? 26 : 9, fr = v ? 0.3 : 0.12; pts.push([x, 0, 60 + Math.sin(x * fr - t * 7) * A]); }
    s += tube(pts, 2, BLUE);
    var lab1 = "", cell = 60; for (var bb = -6; bb < 6; bb++) { var xc = bb * cell - (t * 60) % cell + 30; if (xc > -200 && xc < 200) { var qq = P([xc, 0, 0]); lab1 += T(hash(bb * 3) > 0.5 ? "1" : "0", qq[0], qq[1], 20, OLIVE, 900); } }
    return s + lab1 + label(P([0, 0, 90])[0], P([0, 0, 90])[1], -200, -240, "كل تغيير = رقم", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 8 — zoom on the wave: the data IS the shape of the wave
  shot(8, camV(0.5, 0.4, 0.7, 0.5, 2.0, 2.4), function (u, d, t) {
    var s = paper() + floorGrid(190, 34), pts = [];
    for (var x = -200; x <= 200; x += 4) { var b = Math.floor((x + t * 60) / 60), v = hash(b * 3) > 0.5, A = v ? 26 : 9, fr = v ? 0.3 : 0.12; pts.push([x, 0, 60 + Math.sin(x * fr - t * 7) * A]); }
    s += tube(pts, 3.5, BLUE);
    return s + label(P([0, 0, 60])[0], P([0, 0, 60])[1], -90, 110, "الداتا هي الشكل", BLUE, (u - 0.5) / 0.8, 13);
  });
  // 9 — it travels at the speed of light (low camera across the living room)
  shot(9, camV(0.25, 0.22, 0.75, 0.32, 1.3, 1.45, [-50, -60, 80]), function (u, d, t) {
    var s = paper() + livingRoom(t, { onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "movie" }) }) + flush();
    var a = P(RTOP), b = P([50, 30, 125]);
    s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="16 12" stroke-dashoffset="' + f(-t * 160) + '"/>';
    s += bitsPath([add3(RTOP, [0, 0, 22]), [50, 30, 147]], 8, t, 0.7, ORANGE, 18);
    var m = P([-50, -60, 122]);
    return s + label(m[0], m[1], -220, -230, "بسرعة الضوء", ORANGE, (u - 0.4) / 0.8, 22);
  });
  // 10 — the phone's antenna catches the wave; a tiny chip reads it (magnified inset)
  shot(10, camV(0.3, 0.3, 1.1, 0.48, 2.0, 2.15, [0, 0, 60]), function (u, d, t) {
    var s = paper() + deskTop(160); put([0, 0, 50], standPhone(0, 0, 0, un([1, 0.5, 0]), t, 1.25, { screen: "movie" })); s += flush();
    s += ringArc([-160, -60, 120], un([1, 0.4, 0]), [0, 0, 1], 50 + (t * 40) % 50, -0.8, 0.8, BLUE, 0.8) + ringArc([-160, -60, 120], un([1, 0.4, 0]), [0, 0, 1], 100 + (t * 40) % 50, -0.8, 0.8, BLUE, 0.4);
    var chip = '<rect x="-34" y="-26" width="68" height="52" rx="5" fill="#2b2f35" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) chip += '<rect x="' + (-36 + k * 12) + '" y="-34" width="5" height="8" fill="#b89a52"/><rect x="' + (-36 + k * 12) + '" y="26" width="5" height="8" fill="#b89a52"/>';
    chip += T(hash(Math.floor(t * 4)) > 0.5 ? "1" : "0", 0, 8, 26, GRN, 900);
    var q = P([0, 0, 100]);
    s += inset(q[0] + 90, q[1] - 60, 42, '<g transform="scale(1.1)">' + chip + '</g>', (u - 0.5) / 0.8);
    return s + label(q[0], q[1] - 20, q[0] - 80, q[1] - 70, "الهوائي", BLUE, (u - 1.2) / 0.8, 12);
  });
  // 11 — the bits come back together as a picture, a message or a sound
  shot(11, camV(0.6, 0.5, 0.4, 0.45, 1.6, 1.75, [50, 0, 50]), function (u, d, t) {
    var s = paper() + floorGrid(190, 34), rows = [[120, 0, 135, 0], [120, 0, 80, 1], [120, 0, 25, 2]];
    rows.forEach(function (r) { put([r[0], r[1], r[2]], token3([r[0], r[1], r[2]], r[3], un([1, 0.6, 0.2]), 2.6)); }); s += flush();
    s += bitsPath([[-160, 0, 80], [60, 0, 80], [100, 0, 80]], 14, t, 0.3, BLUE, 18);
    var a = P([120, 0, 135]), b = P([120, 0, 80]), c = P([120, 0, 25]);
    return s + label(a[0], a[1], 110, -190, "صورة", BLUE, (u - 0.8) / 0.8, 20) + label(b[0], b[1], 150, -60, "رسالة", ORANGE, (u - 1.2) / 0.8, 20) + label(c[0], c[1], 150, 90, "صوت", OLIVE, (u - 1.6) / 0.8, 20);
  });
  // 12 — one router, many devices on the same air: TV, laptop, phones (top view of the living room)
  shot(12, camV(0.75, 1.0, 1.15, 0.92, 1.6, 1.7, [-40, -40, 60]), function (u, d, t) {
    var onT = laptop3([10, 20, 38], t, 1) + standPhone(70, 30, 38, un([1, 0.9, 0]), t, 0.8, { screen: "movie" });
    var s = paper() + livingRoom(t, { tvOn: true, onTable: onT });
    put([-30, -146, 40], standPhone(-30, -140, 36, [0, 1, 0], t, 0.8, { screen: "photo" })); put([60, -146, 40], standPhone(60, -140, 36, [0, 1, 0], t, 0.8, { screen: "movie" }));
    s += flush();
    var devs = [[-170, 40, 90], [10, 10, 60], [70, 30, 90], [-30, -140, 80], [60, -140, 80]];
    devs.forEach(function (p, i) { var mid = lerp3(RTOP, p, 0.5); mid[2] += 30; s += tube([RTOP, mid, p], 0.7, "#c9c0a4"); s += bitsPath([RTOP, mid, p], 2, t, 0.3 + i * 0.03, BLUE, 15); });
    var q = P([-150, -150, 170]);
    return s + numBox("20", q[0], q[1], clamp((u - 0.2) / 0.5), 26) + label(q[0] + 10, q[1] + 20, -200, -240, "عشرين جهاز", ORANGE, (u - 0.8) / 0.8, 20);
  });
  // 13 — five phones on the coffee table: one sends, the others wait their turn
  shot(13, camV(0.35, 0.45, 0.8, 0.52, 1.55, 1.65, [30, 20, 70]), function (u, d, t) {
    var on = Math.floor(t * 0.7) % 5, ph = "";
    for (var i = 0; i < 5; i++) ph += standPhone(-10 + i * 22, 22, 38, un([1, 0.9, 0]), t, 0.5, { screen: "movie" });
    var s = paper() + livingRoom(t, { onTable: ph }) + flush();
    for (var j = 0; j < 5; j++) { var x = -10 + j * 22, q = P([x, 22, 100]); s += j === on ? floorRings([x, 22, 70], t, 2, ORANGE, 6, 12) : '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(q[0]) + ' ' + f(q[1]) + ' L' + f(q[0] + Math.cos(t * 3) * 5.5) + ' ' + f(q[1] + Math.sin(t * 3) * 5.5) + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    var h = P([30, 22, 120]);
    return s + label(h[0], h[1], -150, -170, "بتستنى شوية", ORANGE, (u - 0.5) / 0.8, 16);
  });
  // 14 — the stream is cut into many lanes, one for each device
  shot(14, camV(0.8, 0.9, 1.1, 0.95, 1.2, 1.3), function (u, d, t) {
    var s = paper() + floorGrid(190, 34);
    put([-215, 0, 10], router3([-215, 0, 0], t, 0.6));
    s += tube([[-180, 0, 20], [-120, 0, 20]], 6, BLUE);
    for (var k = 0; k < 8; k++) {
      var y = -150 + k * 42, c = k % 2 ? BLUE : OLIVE, pts = [[-120, 0, 20], [-40, 0, 20], [0, y, 20], [60, y, 20], [160, y, 20]];
      s += tube(pts, 3, "#e6dcc4") + tube(pts, 1.6, c) + bitsPath(pts, 2, t, 0.3 + k * 0.03, INK, 13);
      put([185, y, 20], standPhone(185, y, 0, [-1, 0, 0], t, 0.4, { screen: "movie" }));
    }
    s += flush();
    return s + label(P([-160, 0, 20])[0], P([-160, 0, 20])[1], -240, -240, "مئات الخطوط", BLUE, (u - 0.5) / 0.8, 22);
  });
  // 15 — the classroom: the teacher's desk (with the router) hands sheets to every desk at once
  shot(15, camV(0.4, 0.75, 1.0, 0.78, 1.2, 1.3, [0, -30, 40]), function (u, d, t) {
    var s = paper() + room3(200, 150, { board: true, winX: 130 });
    put([-110, -130, 40], table3([-110, -130, 0], 100, 54, 70, "#7a5a3e", router3([-110, -130, 70], t, 0.55)));
    var desks = [];
    for (var i = 0; i < 6; i++) { var x = -40 + (i % 3) * 95, y = -20 + Math.floor(i / 3) * 110; desks.push([x, y]); put([x, y, 30], table3([x, y, 0], 64, 42, 50, "#b58d62", token3([x, y, 51.5], 3, [0, 0, 1], 1.1))); }
    s += flush();
    for (var k = 0; k < 6; k++) { var p = (t * 0.5 + k / 6) % 1, dk = desks[k], q = lerp3([-110, -130, 120], [dk[0], dk[1], 60], p); q[2] += Math.sin(p * Math.PI) * 70; s += token3(q, 3, un(add3(VW.V, [Math.sin(t * 3 + k) * 0.3, 0, 0])), 1.3); }
    var a = P([-110, -130, 110]), b = P(desks[1].concat([52]));
    return s + label(a[0], a[1], -240, -200, "المدرس", BLUE, (u - 0.4) / 0.8, 20) + label(b[0], b[1], 120, -230, "الكراسات", OLIVE, (u - 1.2) / 0.8, 20);
  });
  // 16 — two rooms and a concrete wall between: the wave gets weaker
  shot(16, camV(0.5, 0.65, 1.05, 0.75, 1.0, 1.08, [0, -20, 60]), function (u, d, t) {
    var s = paper() + room3(220, 150, { winX: -120 });
    put([-150, -110, 30], table3([-150, -110, 0], 56, 56, 52, "#8b6646", router3([-150, -110, 52], t, 0.62)));
    put([0, 0, 60], slab([0, 0, 75], [0, 1, 0], [0, 0, 1], rectPts(440, 150), 14, "#e9e1d0", { hatchUp: true }));
    put([140, 60, 30], table3([140, 60, 0], 80, 56, 40, "#9b7350", standPhone(140, 60, 40, un([0.3, 1, 0]), t, 0.9, { screen: "movie" })));
    s += flush();
    for (var k = 0; k < 5; k++) { var r = 30 + ((t * 40 + k * 36) % 180); s += ringArc([-150, -110, 110], un([1, 0.7, 0]), [0, 0, 1], r, -0.9, 0.9, BLUE, clamp(1 - r / 180) * (r < 150 ? 1 : 0.2), 2.4); }
    var q = P([0, 0, 150]);
    s += crossMark(q[0] + 30, q[1] - 10, 0.5, clamp((u - 0.9) / 0.6));
    return s + label(q[0], q[1], -40, -260, "الحيطة بتاكل", ORANGE, (u - 0.5) / 0.8, 22);
  });
  // 17 — the floor plan: four bars next to the router, one bar three walls away
  shot(17, camV(0.4, 1.12, 0.62, 1.22, 1.15, 1.15, [0, 0, 20]), function (u, d, t) {
    var s = paper() + room3(240, 110, { window: false });
    [-90, -20, 50].forEach(function (x) { put([x, 0, 0], slab([x, 0, 55], [0, 1, 0], [0, 0, 1], rectPts(480, 110), 14, "#e9e1d0", { hatchUp: true })); });
    put([-180, -80, 30], table3([-180, -80, 0], 56, 56, 52, "#8b6646", router3([-180, -80, 52], t, 0.62)));
    put([-150, 90, 30], table3([-150, 90, 0], 60, 50, 40, "#9b7350", standPhone(-150, 90, 40, [1, 0, 0], t, 0.8, { screen: "movie" })));
    put([160, 90, 30], table3([160, 90, 0], 60, 50, 40, "#9b7350", standPhone(160, 90, 40, [-1, 0, 0], t, 0.8, { screen: "movie" })));
    s += flush();
    var q1 = P([-150, 90, 130]), q2 = P([160, 90, 130]);
    s += bars(q1[0] - 20, q1[1], 4) + bars(q2[0] - 20, q2[1], 1);
    return s + label(P([-20, 0, 110])[0], P([-20, 0, 110])[1], -240, -260, "تلات حيطان", ORANGE, (u - 0.4) / 0.8, 22);
  });
  // 18 — the kitchen: the microwave on the counter runs at a frequency next to Wi-Fi's; they clash now and then
  shot(18, camV(0.7, 0.45, 1.05, 0.52, 1.4, 1.5, [0, -150, 110]), function (u, d, t) {
    var s = MESH + paper() + room3(200, 160, { tiles: true, winX: 120, wall: "#e9e6dc", wall2: "#ded9cc" });
    put([0, -168, 44], counter3([0, -168, 0], 320) + microwave3([-70, -170, 90], t, 0.8, true) + router3([95, -160, 90], t, 0.6));
    s += flush() + floorRings([95, -165, 158], t, 3, BLUE, 14, 24);
    var z = P([20, -150, 140]);
    if (Math.sin(t * 9) > -0.2) { var zz = [[0, 0], [10, -14], [18, 6], [28, -16], [36, 3], [46, -12]]; s += '<path d="' + zz.map(function (p, i) { return (i ? "L" : "M") + f(z[0] + p[0]) + " " + f(z[1] + p[1]); }).join(" ") + '" stroke="' + RED + '" stroke-width="3" fill="none" stroke-linejoin="round"/>'; }
    var q = P([-70, -170, 175]);
    return s + numBox("2.45 GHz", q[0], q[1] - 20, clamp((u - 0.9) / 0.6), 18) + label(P([-70, -130, 130])[0], P([-70, -130, 130])[1], -240, -170, "الميكروويف", BLUE, (u - 0.4) / 0.8, 20) + label(z[0] + 20, z[1], 120, -260, "خناقة", ORANGE, (u - 1.6) / 0.8, 22);
  });
  // 19 — the name: not an acronym, a marketing choice (a flat card on drifting bits; the card bobs, the letters bounce)
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(-40, 40, k), lerp(30, -30, k), lerp(0.95, 1.2, k)]; }, function (u, d, t) {
    var s = paper();
    for (var i = 0; i < 46; i++) { var x = -330 + hash(i) * 660, y = ((hash(i + 7) * 840 - t * (40 + hash(i + 3) * 40)) % 840 + 840) % 840 - 420; s += T(hash(i + 11) > 0.5 ? "1" : "0", x, y, 18 + hash(i) * 12, "#d6c9a9", 900); }
    var k = pop((u - 0.1) / 0.7), bob = Math.sin(t * 2.2) * 8, rot = Math.sin(t * 1.4) * 4;
    var g = '<ellipse cx="0" cy="-40" rx="200" ry="100" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M-60 52 L-90 130 L-20 66 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M-62 55 L-22 61" stroke="#fff" stroke-width="7"/>';
    ["W", "i", "-", "F", "i"].forEach(function (ch, j) { g += T(ch, [-56, -20, 2, 28, 58][j], -20 + Math.sin(t * 6 + j * 0.9) * 6, 56, BLUE, 900); });
    g += T("Wireless Fidelity", 0, 30, 18, "#6f6a62", 700);
    var sl = clamp((u - 1.2) / 0.8); g += '<path d="M-84 24 L' + f(-84 + 168 * sl) + ' 24" stroke="' + RED + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<g transform="translate(0 ' + f(bob) + ') rotate(' + f(rot) + ') scale(' + f(k) + ')">' + g + '</g>';
    var st = pop((u - 2.2) / 0.6); if (st > 0) s += '<g transform="translate(110 200) rotate(' + f(-10 + Math.sin(t * 3) * 3) + ') scale(' + f(st) + ')"><rect x="-130" y="-38" width="260" height="76" rx="8" fill="' + PAPER + '" stroke="' + ORANGE + '" stroke-width="5"/>' + T("مش اختصار!", 0, 14, 38, ORANGE, 900) + '</g>';
    var yr = pop((u - 3.2) / 0.6); if (yr > 0) s += '<g transform="translate(-170 260) scale(' + f(yr) + ')">' + T("1999", 0, 0, 34, OLIVE, 900) + T("شركة تسويق اختارته", 0, 34, 18, INK, 700) + '</g>';
    return s;
  });
  // 20 — the Parkes radio telescope in its field, and the black hole they were hunting (inset)
  shot(20, camV(0.15, 0.2, 1.15, 0.38, 1.0, 1.15, [0, 0, 110]), function (u, d, t) {
    var s = paper() + slab([0, 0, -2], [1, 0, 0], [0, 1, 0], rectPts(460, 460), 4, "#9fb06f", { face: "#adbe7c" });
    for (var g = 0; g < 70; g++) { var gx = -220 + hash(g) * 440, gy = -220 + hash(g + 50) * 440; s += ln3([gx, gy, 0], [gx + 2, gy, 5 + hash(g + 9) * 4], "#7d9150", 1.2); }
    put([-170, -150, 40], tree3([-170, -150, 0], 1.1)); put([170, -170, 40], tree3([170, -170, 0], 1.3)); put([-180, 140, 40], tree3([-180, 140, 0], 1));
    put([0, 0, 60], parkes3([0, 0, 0], t, 1.0));
    s += flush();
    for (var c = 0; c < 3; c++) { var cx = ((t * 18 + c * 220) % 760) - 380, cy = -330 + c * 26; s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="46" ry="12" fill="#fff" opacity=".8"/><ellipse cx="' + f(cx + 20) + '" cy="' + f(cy - 8) + '" rx="26" ry="10" fill="#fff" opacity=".8"/>'; }
    for (var w = 0; w < 4; w++) { var r = 60 + ((t * 50 + w * 45) % 180); s += ringArc([0, 0, 170], un([0.6, 0.3, 0.75]), un([-0.3, 0.6, 0]), r, -0.7, 0.7, ORANGE, clamp(1 - r / 240) * 0.8, 2.2); }
    s += inset(190, -150, 80, '<rect x="-90" y="-90" width="180" height="180" fill="#0d1018"/><circle r="18" fill="#000"/><ellipse rx="56" ry="14" fill="none" stroke="#ffd98a" stroke-width="8" transform="rotate(' + f(t * 40) + ')"/><circle r="18" fill="#000"/>', (u - 0.5) / 0.8);
    var a = P([0, 0, 140]);
    return s + label(a[0], a[1], -240, -250, "أستراليا", BLUE, (u - 0.4) / 0.8, 20) + label(190, -230, 120, -320, "ثقوب سوداء", ORANGE, (u - 1.2) / 0.8, 20);
  });
  // 21 — the money from the patents: bundles of notes piling up on a desk
  shot(21, camV(0.5, 0.6, 1.15, 0.7, 1.5, 1.6, [0, 0, 50]), function (u, d, t) {
    var k = clamp(u / d), n = 2 + Math.floor(k * 9), m = 1 + Math.floor(k * 11), s = paper() + deskTop(200);
    var a = "", b = ""; for (var i = 0; i < n; i++) a += bundle3([-60, -20, i * 10], 1); for (var j = 0; j < m; j++) b += bundle3([70, 30, j * 10], 1);
    put([-60, -20, n * 5], a); put([70, 30, m * 5], b); s += flush();
    var q = P([-60, -20, n * 10 + 10]);
    return s + numBox("مئات الملايين", 0, -270, clamp((u - 0.3) / 0.6), 22) + label(q[0], q[1], -230, -180, "دولار", BLUE, (u - 1.0) / 0.8, 20);
  });
  // 22 — the film you watched: every bit delivered into the phone on the coffee table
  shot(22, camV(0.5, 0.4, 1.0, 0.52, 1.95, 2.15, [50, 30, 85]), function (u, d, t) {
    var s = paper() + livingRoom(t, { onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "movie" }) }) + flush();
    s += bitsPath([[-150, -150, 118], [-60, -60, 150], [40, 20, 120]], 12, t, 0.35, BLUE, 12);
    var a = P([-30, -40, 140]);
    return s + label(a[0], a[1], a[0] - 50, a[1] - 60, "موجة ماشية", ORANGE, (u - 0.5) / 0.8, 12);
  });
  // 23 — payoff: a precise order of millions of numbers and waves (inset of the order)
  shot(23, camV(0.4, 0.6, 0.95, 0.55, 1.55, 1.65, [-50, -60, 80]), function (u, d, t) {
    var s = paper() + livingRoom(t, { onTable: standPhone(PHN[0], PHN[1], PHN[2], un([1, 0.9, 0]), t, 1, { screen: "movie" }) }) + flush();
    [-14, 0, 14].forEach(function (o, i) { var p0 = add3(RTOP, [o, -o, 0]), p1 = [50 + o, 30 - o, 120]; s += tube([p0, p1], 1.2, "#c9c0a4") + bitsPath([p0, p1], 6, t, 0.3 + i * 0.05, BLUE, 15); });
    var grid = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) grid += T((r + c) % 2 ? "1" : "0", -45 + c * 18, -24 + r * 18, 14, BLUE, 900);
    s += inset(170, -250, 70, grid, (u - 0.8) / 0.8);
    var q = P([-50, -60, 130]);
    return s + label(q[0], q[1], 120, -170, "ترتيب دقيق", ORANGE, (u - 1.2) / 0.8, 20);
  });
  // 24 — placeholder (the summary card is an HTML overlay)
  shot(24, camV(0.8, 0.5, 0.8, 0.5, 1, 1), function () { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__intro = function (svg, t) {
    setView(0.55 + t * 0.22, 0.42 + 0.08 * Math.sin(t * 1.3));
    var s = MESH + '<rect width="580" height="320" fill="#141414"/><g transform="translate(290 200) scale(1.15)">';
    put([110, 20, 50], standPhone(110, 20, 0, un([-0.6, 1, 0]), t, 1.2, { screen: "movie" }));
    put([-120, -20, 10], router3([-120, -20, 0], t, 0.9));
    s += flush() + floorRings([-120, -20, 85], t, 3, "#7fb2d8", 16, 30);
    s += bitsPath([[-120, -20, 100], [-10, 0, 150], [100, 20, 130]], 12, t, 0.55, YEL, 22) + '</g>';
    var sx = ((t * 300) % 760) - 90; s += '<rect x="' + f(sx) + '" y="0" width="70" height="320" fill="#9fc3dc" opacity=".16"/><path d="M' + f(sx + 35) + ' 0 V320" stroke="#bfe0ff" stroke-width="3" opacity=".7"/>';
    svg.innerHTML = s;
  };
  window.__outro = function (svg, u, t) {
    setView(0.5 + u * 0.4, 0.55 + 0.08 * Math.sin(t * 1.2));
    var s = '<rect width="580" height="300" fill="#e4d9bf"/><g transform="translate(290 180) scale(0.95)">', T0 = function (p) { var q = P(p); return [290 + 0.95 * q[0], 180 + 0.95 * q[1]]; };
    put([-140, 0, 10], router3([-140, 0, 0], t, 0.85)); put([140, 0, 50], standPhone(140, 0, 0, un([-1, 0.3, 0]), t, 1, { screen: "movie" }));
    put([10, 0, 0], slab([10, 0, 35], [0, 1, 0], [0, 0, 1], rectPts(110, 70), 10, "#e9e1d0", { hatchUp: true }));
    s += flush() + floorRings([-140, 0, 90], t, 3, BLUE, 26, 34) + bitsPath([[-110, 0, 110], [10, 0, 150], [130, 0, 115]], 10, t, 0.45, BLUE, 18) + '</g>';
    var sx = ((u * 260) % 700) - 60; s += '<rect x="' + f(sx) + '" y="0" width="50" height="300" fill="#fff" opacity=".28"/>';
    [["1", [-140, 0, 30]], ["2", [-60, 0, 150]], ["3", [140, 0, 120]], ["4", [140, 0, 65]], ["5", [140, 0, 15]], ["6", [10, 0, 80]]].forEach(function (c, i) { var q = T0(c[1]); s += callout(c[0], q[0], q[1], (u - 0.2 - i * 0.15) / 0.6); });
    if (typeof document !== "undefined") { var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = Math.round(300 * clamp(u / 1.6)) + ' ألف'; }
    svg.innerHTML = s;
  };
  window.__parts = { router3: router3, phone3: phone3, standPhone: standPhone, livingRoom: livingRoom, put: put, flush: flush, setView: setView };
})();
