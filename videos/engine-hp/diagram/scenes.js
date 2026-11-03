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
  // ── «نفس الموتور، أحصنة مختلفة؟» — built like the engine reference (.claude/skills/diagram/reference/engine/), simpler:
  // two isometric engine blocks with serif horsepower numbers; ONE master cylinder in section (ports, valves, plug, piston,
  // rod, crank) reused all video, recoloured by stroke; gauges «عزم» / «حصان», a stopwatch, the 2 L bottle, the ①②③ stepper.
  var AIRF = "#c9d8e2", AIRD = SLATE, FUEL = OLV, BURN = "#e5cbb6", BURN2 = "#dcab99", EXH = "#9a958a", PUT = "#d8d0bd";

  // ── isometric engine block: block, head, 4 plug caps, intake runners on the +y face, pulley on the +x face ──
  function engine(o, t, op) {
    op = op || {}; var s = isoBox(o, 0, 0, 0, 130, 70, 64) + isoBox(o, 4, 6, 64, 122, 58, 22, ["#efe9dc", "#ddd5c3", "#c4bba6"]);
    for (var i = 0; i < 4; i++) {
      var x = 20 + i * 30, r1 = [iso(o, x, 70, 74), iso(o, x, 92, 70), iso(o, x, 96, 44), iso(o, x + 10, 92, 30)];
      s += '<path d="M' + r1.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + '" stroke="' + INK + '" stroke-width="' + f(13 * o[2]) + '" fill="none" stroke-linejoin="round"/><path d="M' + r1.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + '" stroke="#e8e1d0" stroke-width="' + f(9 * o[2]) + '" fill="none" stroke-linejoin="round"/>';
    }
    s += isoBox(o, 8, 88, 22, 116, 16, 16, ["#efe9dc", "#ddd5c3", "#c4bba6"], true);
    for (var j = 0; j < 4; j++) s += isoCyl(o, 22 + j * 28, 35, 86, 5, 9, "#2b2b2b", "#555");
    var pc = [130, 35, 30], a = t * 5; s += poly(isoRing(o, "x", pc, 18), "#c4bba6", 2) + poly(isoRing(o, "x", pc, 6, 12), INK, 1);
    var sp = iso(o, 130, 35 + Math.cos(a) * 14, 30 + Math.sin(a) * 14); s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(2.4 * o[2]) + '" fill="' + INK + '"/>';
    if (op.turbo) { var k = pop(op.turbo); if (k > 0) { var c = iso(o, 136, 58, 40); s += '<g transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') scale(' + f(k * o[2]) + ')">' + snail(0, 0, 0.42, t, OLV) + '<g transform="translate(26 18)">' + snail(0, 0, 0.36, t, "#c97a5a") + '</g></g>'; } }
    if (op.chip) { var kc = pop(op.chip); if (kc > 0) { var cc = iso(o, 132, 10, 10); s += '<g transform="translate(' + f(cc[0]) + ' ' + f(cc[1]) + ') scale(' + f(kc * o[2] * 0.5) + ')">' + chip(0, 0, 0.6, t) + '</g>'; } }
    return s;
  }
  function compare(t, a, b, ca, cb, op) {   // the signature shot: two engines, spec above, serif numbers below
    op = op || {}; var s = engine([150, 380, 1.05], t, { turbo: op.turboA, chip: op.chipA }) + engine([440, 380, 1.05], t, { chip: op.chipB });
    s += T("2000 cc", 175, 300, 30, INK, 800) + T("2000 cc", 465, 300, 30, INK, 800);
    s += serifNum(String(a), 190, 620, 92, ca) + serifNum(String(b), 480, 620, 92, cb) + T("حصان", 190, 660, 22, ca, 700) + T("حصان", 480, 660, 22, cb, 700);
    return s;
  }

  // ── the master cylinder in section; (x,y) = the head's centre line, s = scale ──
  // op.theta (crank angle; 0 = top) or op.w (rad/s); op.mode forces a look: "air" | "fuel" | "fire" | "squeeze";
  // op.dense multiplies the air dots (turbo); op.bigValve widens the intake; op.stream draws air flowing in the port
  function cyl(x, y, s, t, op) {
    op = op || {}; var th = op.theta != null ? op.theta : t * (op.w || 3), ph = ((th % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI), st = Math.floor(ph / Math.PI), fr = (ph % Math.PI) / Math.PI;
    var r = 55, L = 330, cy0 = 300, px = r * Math.sin(th), py = cy0 - r * Math.cos(th), pin = py - Math.sqrt(L * L - px * px), top = pin - 45;
    var mode = op.mode || ["air", "squeeze", "fire", "exh"][st], vw = op.bigValve ? 34 : 22;
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    // ports + head
    g += R(-330, -246, 270, 40, AIRF, 2.4) + R(60, -246, 270, 40, mode === "exh" ? "#d4d0c6" : "#e4ddcd", 2.4);
    if (op.bigValve) g += R(-330, -256, 270, 60, AIRF, 2.4);
    g += R(-140, -270, 280, 90, PUT, 2.4) + R(-140, -270, 280, 90, "url(#hatch)", 0);
    g += R(-75, -246, 50, 66, AIRF, 0) + R(25, -246, 50, 66, mode === "exh" ? "#d4d0c6" : "#e4ddcd", 0);
    // chamber
    var fill = mode === "air" ? "#dfe9ee" : mode === "squeeze" ? "#cfdde6" : mode === "fire" ? (fr < 0.5 ? BURN2 : BURN) : mode === "fuel" ? "#dfe9ee" : "#e2dfd8";
    g += R(-110, -180, 220, top + 180, fill, 0);
    // dots
    var N = Math.round(26 * (op.dense || 1)), n = mode === "air" && op.mode == null ? Math.round(N * fr) : N;
    for (var k = 0; k < n; k++) { var dx = -96 + hash(k) * 192 + Math.sin(t * 6 + k) * 3, dy = -172 + hash(k + 31) * (top + 166) + Math.cos(t * 5 + k) * 3;
      var col = mode === "fire" ? (k % 3 ? RED : "#e8a33a") : mode === "exh" ? EXH : (k % 4 === 0 && (op.fuel || mode !== "air" || op.mode === "fuel")) ? FUEL : AIRD;
      g += '<circle cx="' + f(dx) + '" cy="' + f(dy) + '" r="' + (mode === "fire" ? 6 : 5.4) + '" fill="' + col + '" stroke="' + INK + '" stroke-width=".7" opacity="' + (mode === "exh" ? f(1 - fr * 0.7) : 1) + '"/>'; }
    if (mode === "fire") { var k2 = clamp(1 - fr * 1.6); g += '<path d="M0 ' + f(top - 70) + ' l-20 -26 h40 Z" fill="' + RED + '" transform="translate(0 ' + f(fr * 30) + ')"/>';
      if (k2 > 0) { g += '<g transform="translate(0 -176) scale(' + f(0.6 + k2) + ')">'; for (var q = 0; q < 8; q++) g += '<path d="M0 0 L' + f(Math.cos(q * 0.785) * 28) + ' ' + f(Math.sin(q * 0.785) * 28) + '" stroke="#f2b33a" stroke-width="5" stroke-linecap="round"/>'; g += '<circle r="10" fill="#fff3c8"/></g>'; } }
    // valves (stem + head), lifted on intake / exhaust
    var li = mode === "air" && op.mode == null ? Math.sin(fr * Math.PI) * 24 : op.stream ? 20 : 0, le = mode === "exh" ? Math.sin(fr * Math.PI) * 24 : 0;
    g += R(-53, -320 + li, 6, 136, "#8d8676", 1.4) + R(-50 - vw, -186 + li, vw * 2 - 6, 9, "#8d8676", 1.6, 2);
    g += R(47, -320 + le, 6, 136, "#8d8676", 1.4) + R(50 - vw + 6, -186 + le, vw * 2 - 6, 9, "#8d8676", 1.6, 2);
    // spark plug
    g += R(-11, -330, 22, 26, "#2b2b2b", 0, 3) + R(-8, -304, 16, 40, "#f2efe6", 1.6, 3) + R(-4, -264, 8, 84, "#8d8676", 1.2);
    // walls
    g += R(-132, -180, 22, 330, PUT, 2.4) + R(-132, -180, 22, 330, "url(#hatch)", 0) + R(110, -180, 22, 330, PUT, 2.4) + R(110, -180, 22, 330, "url(#hatch)", 0);
    // air streaming in
    if (op.stream || (mode === "air" && op.mode == null && fr < 0.9)) g += dotStream([[-330, -226], [-60, -226], [-50, -170]], t, (op.stream || 1) * 160, 22, 4.6, AIRD);
    if (mode === "exh") g += dotStream([[50, -170], [60, -226], [330, -226]], t, 160, 24, 4.6, EXH);
    // piston, rings, rod, crank
    g += R(-106, top, 212, 82, "#cfc8b4", 2.4, 4) + '<path d="M-106 ' + f(top + 14) + ' H106 M-106 ' + f(top + 24) + ' H106" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<path d="M-180 150 L-200 260 A200 200 0 0 0 200 260 L180 150 Z" fill="#ece5d5" stroke="' + INK + '" stroke-width="2.4"/>';
    var ang = Math.atan2(px, py - cy0), cw = '<path d="M0 ' + cy0 + ' L' + f(-Math.sin(th - 1) * 96) + ' ' + f(cy0 + Math.cos(th - 1) * 96) + ' A96 96 0 0 1 ' + f(-Math.sin(th + 1) * 96) + ' ' + f(cy0 + Math.cos(th + 1) * 96) + ' Z" fill="#8f897a" stroke="' + INK + '" stroke-width="2.2"/>';
    g += cw + '<path d="M0 ' + f(pin) + ' L' + f(px) + ' ' + f(py) + '" stroke="' + INK + '" stroke-width="26" stroke-linecap="round"/><path d="M0 ' + f(pin) + ' L' + f(px) + ' ' + f(py) + '" stroke="#a39b85" stroke-width="20" stroke-linecap="round"/>';
    g += '<circle cx="0" cy="' + f(pin) + '" r="13" fill="#eee" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(px) + '" cy="' + f(py) + '" r="17" fill="#eee" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="' + cy0 + '" r="22" fill="#cfc8b4" stroke="' + INK + '" stroke-width="2"/>';
    return g + '</g>';
  }
  function row4(x, y, s, t, op) { var g = ""; for (var i = 0; i < 4; i++) g += cyl(x + (i - 1.5) * 300 * s, y, s, t, Object.assign({ theta: t * 3 + [0, Math.PI, 3 * Math.PI, 2 * Math.PI][i] }, op || {})); return g; }

  // ── small parts ──
  function bottle(x, y, s, k, lab, liq, dots) {   // a big soda bottle; k = how full; dots = air dots inside
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><clipPath id="bt' + f(x) + '"><path d="M-22 -200 V-170 Q-70 -140 -70 -90 V120 Q-70 140 -50 140 H50 Q70 140 70 120 V-90 Q70 -140 22 -170 V-200 Z"/></clipPath>';
    g += '<path d="M-22 -200 V-170 Q-70 -140 -70 -90 V120 Q-70 140 -50 140 H50 Q70 140 70 120 V-90 Q70 -140 22 -170 V-200 Z" fill="#eef3f4"/>';
    g += '<g clip-path="url(#bt' + f(x) + ')"><rect x="-80" y="' + f(140 - 340 * clamp(k)) + '" width="160" height="340" fill="' + (liq || AIRF) + '"/>';
    for (var i = 0; i < (dots || 0); i++) g += '<circle cx="' + f(-56 + hash(i) * 112) + '" cy="' + f(130 - hash(i + 9) * 320 * clamp(k)) + '" r="5" fill="' + AIRD + '" stroke="' + INK + '" stroke-width=".7"/>';
    g += '</g><path d="M-22 -200 V-170 Q-70 -140 -70 -90 V120 Q-70 140 -50 140 H50 Q70 140 70 120 V-90 Q70 -140 22 -170 V-200 Z" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    g += R(-26, -226, 52, 28, RED, 2.4, 4);
    if (lab) g += R(-62, -20, 124, 54, "#f7f3ea", 2, 3) + '<text x="0" y="18" text-anchor="middle" style="font:800 30px ' + SERIF + ';fill:' + INK + ';direction:ltr">' + lab + '</text>';
    return g + '</g>';
  }
  function hammer(x, y, ang, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + s + ')">' + R(-12, -10, 24, 230, "#d6a27a", 2.4, 6) + R(-12, -10, 24, 230, "url(#hatch)", 0, 6) + R(-70, -60, 140, 62, "#8d8676", 2.6, 5) + R(-70, -60, 140, 62, "url(#hatch)", 0, 5) + '</g>'; }
  function block(x, y, w, h, nail) { var g = R(x, y, w, h, "#d9a184", 2.4, 3); for (var k = 1; k < 4; k++) g += '<path d="M' + (x + 8) + ' ' + f(y + h * k / 4) + ' Q' + f(x + w / 2) + ' ' + f(y + h * k / 4 - 6) + ' ' + (x + w - 8) + ' ' + f(y + h * k / 4) + '" stroke="#a5694c" stroke-width="1.6" fill="none"/>'; return g + R(x + w / 2 - 4, y - 70 + nail, 8, 70 - nail, "#8d8676", 1.6) + R(x + w / 2 - 14, y - 76 + nail, 28, 8, "#8d8676", 1.6); }
  function snail(x, y, s, t, col) {   // a turbo wheel in its spiral housing
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 -110 A110 110 0 1 1 -110 0 L-150 0 L-150 -60 L-60 -60 A70 70 0 0 1 0 -110 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="5"/><circle r="66" fill="#e9e3d4" stroke="' + INK + '" stroke-width="4"/>';
    for (var b = 0; b < 9; b++) { var a = t * 14 + b * 0.698; g += '<path d="M' + f(Math.cos(a) * 14) + ' ' + f(Math.sin(a) * 14) + ' Q' + f(Math.cos(a + 0.5) * 40) + ' ' + f(Math.sin(a + 0.5) * 40) + ' ' + f(Math.cos(a + 0.2) * 60) + ' ' + f(Math.sin(a + 0.2) * 60) + '" stroke="' + INK + '" stroke-width="4" fill="none"/>'; }
    return g + '<circle r="12" fill="' + INK + '"/></g>';
  }
  function chip(x, y, s, t) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + R(-110, -70, 220, 140, "#3b3b38", 3, 8); for (var k = 0; k < 9; k++) g += R(-96 + k * 23, -84, 8, 14, "#8d8676", 1.2) + R(-96 + k * 23, 70, 8, 14, "#8d8676", 1.2);
    for (var l = 0; l < 4; l++) g += '<path d="M-70 ' + (-34 + l * 20) + ' H' + f(-70 + 60 + 50 * Math.abs(Math.sin(t * 2 + l))) + '" stroke="#cfc8b4" stroke-width="5" stroke-linecap="round"/>'; return g + '</g>'; }
  function wheel(x, y, r, t) { var g = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#2b2b2b"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.6) + '" fill="#cfc8b4" stroke="' + INK + '" stroke-width="2"/>'; for (var k = 0; k < 5; k++) { var a = t * 6 + k * 1.2566; g += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * r * 0.58) + ' ' + f(y + Math.sin(a) * r * 0.58) + '" stroke="' + INK + '" stroke-width="5"/>'; } return g; }
  function gear(x, y, r, t, n, dir) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(t * 120 * (dir || 1)) + ')">'; for (var k = 0; k < n; k++) g += '<rect x="-7" y="' + f(-r - 12) + '" width="14" height="18" fill="#a39b85" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + f(k * 360 / n) + ')"/>'; return g + '<circle r="' + r + '" fill="#cfc8b4" stroke="' + INK + '" stroke-width="2.4"/><circle r="' + f(r * 0.3) + '" fill="' + INK + '"/></g>'; }
  function qMark(x, y, sz, k, t) { k = pop(k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2.4) * 6) + ') scale(' + f(k) + ')">' + serifNum("?", 0, 0, sz, SLATE) + '</g>'; }
  function pan(a, b, z0, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(z0, z1, k)]; }; }
  var HUD = function (act) { return function (u) { return stepper(3, act, 590, 52, u / 0.4); }; };
  function counter(x, y, t, n, lab, col) { return stopwatch(x, y, 26, t) + serifNum(String(n), x, y + 74, 52, col || OLV) + T(lab, x, y + 102, 18, col || OLV, 700); }

  // ── the shots ──
  // 1 — one makes 150 hp, the other 400: the numbers count up, the winner turns red
  shot(1, pan([320, 470], [310, 450], 1.0, 1.08), function (u, d, t) { var k = clamp((u - 0.3) / (d - 0.5)); return paper() + compare(t, ticker(0, 150, k), ticker(0, 400, k), OLV, k > 0.98 ? RED : OLV); });
  // 2 — how? a big question mark between them
  shot(2, pan([320, 450], [320, 420], 1.08, 1.2), function (u, d, t) { return paper() + compare(t, 150, 400, OLV, RED) + qMark(320, 250, 150, u / 0.6, t); });
  // 3 — the story: we open the engine — the row of four cylinders fades in over the blocks
  shot(3, pan([320, 430], [320, 400], 1.0, 1.05), function (u, d, t) { var k = clamp((u - 0.2) / 1.0); return paper() + '<g opacity="' + f(1 - k) + '">' + compare(t, 150, 400, OLV, RED) + '</g><g opacity="' + f(k) + '">' + row4(320, 330, 0.36, t) + '</g>'; });
  // 4 — cylinders, a piston in each, going up and down
  shot(4, pan([320, 360], [320, 380], 1.0, 1.2), function (u, d, t) { return paper() + row4(320, 330, 0.36, t) + label(214, 300, 120, 160, "أسطوانة", OLV, (u - 0.4) / 0.6, 24) + label(428, 350, 520, 160, "مكبس", OLV, (u - 1.4) / 0.6, 24); });
  // 5 — the piston goes down, sucks air in, fuel is sprayed on it
  shot(5, pan([300, 380], [320, 400], 1.25, 1.12), function (u, d, t) { var th = Math.PI * clamp(u / (d * 0.8)); return paper() + cyl(320, 330, 0.78, t, { theta: th, fuel: u > d * 0.5 }) + label(110, 155, 90, 90, "هوا", SLATE, (u - 0.3) / 0.6, 26) + label(270, 380, 120, 470, "بنزين", OLV, (u - d * 0.5) / 0.6, 24); });
  // 6 — up it squeezes them, a spark lights them, the blast pushes the piston down
  shot(6, pan([320, 380], [320, 420], 1.15, 1.25), function (u, d, t) { var th = Math.PI + 2 * Math.PI * clamp(u / d); return paper() + cyl(320, 330, 0.78, t, { theta: th }) + label(326, 128, 470, 110, "شرارة", RED, (u - d * 0.45) / 0.5, 26); });
  // 7 — the push turns a shaft, the shaft turns the wheels
  shot(7, pan([320, 420], [360, 520], 1.0, 0.95), function (u, d, t) { var s = paper() + cyl(250, 260, 0.6, t, { w: 5 }); var k = clamp((u - 1.0) / 0.8);
    s += '<g opacity="' + f(k) + '">' + '<path d="M250 440 H470 V600" stroke="' + INK + '" stroke-width="14"/><path d="M250 440 H470 V600" stroke="#a39b85" stroke-width="9"/>' + gear(470, 620, 30, t, 10) + wheel(470, 680, 70, t) + '</g>';
    return s + label(250, 440, 120, 600, "العمود", OLV, (u - 0.4) / 0.6, 24) + label(520, 690, 590, 560, "العجل", OLV, (u - 1.6) / 0.6, 24); });
  // 8 — what's 2000 cc? the air all the cylinders draw in each time: the row fills with air
  shot(8, pan([320, 350], [320, 400], 1.05, 1.0), function (u, d, t) { var s = paper() + row4(320, 330, 0.36, t, { mode: "air", theta: Math.PI }); var k = clamp((u - 0.6) / 1.4);
    return s + numBox("2000 cc", 320, 140, (u - 0.2) / 0.6, 34) + T(ticker(0, 2000, k) + " cc", 320, 560, 40, SLATE, 800); });
  // 9 — like a big Pepsi bottle: 2 litres, filling with air dots
  shot(9, pan([320, 420], [320, 400], 1.1, 1.18), function (u, d, t) { var k = clamp((u - 0.2) / (d - 0.4)); return paper() + row4(320, 650, 0.2, t, { mode: "air", theta: Math.PI }) + bottle(320, 330, 1.1, 0.3 + 0.7 * k, "2 L", AIRF, Math.round(30 * k)); });
  // 10 — torque: how hard the push is — one heavy stroke, the «عزم» gauge fills high
  shot(10, pan([300, 400], [320, 390], 1.1, 1.2), function (u, d, t) { return paper() + cyl(280, 330, 0.66, t, { theta: 2 * Math.PI + Math.PI * clamp((u - 0.3) / 1.0) }) + gauge(560, 600, 300, 0.2 + 0.7 * clamp((u - 0.3) / 1.0), "عزم", RED, 36); });
  // 11 — horsepower: how fast the pushes come — the piston runs fast, the counter ticks, the «حصان» gauge fills
  shot(11, pan([300, 400], [320, 390], 1.15, 1.25), function (u, d, t) { var n = Math.floor(clamp(u / d) * 6); return paper() + cyl(300, 330, 0.66, t, { w: 9 }) + counter(80, 150, t, n, "دفعة", OLV) + gauge(565, 600, 300, 0.2 + 0.7 * clamp(u / d), "حصان", OLV, 36); });
  // 12 — like a hammer: torque is how heavy the blow, horsepower how many blows a second
  shot(12, pan([320, 420], [320, 400], 1.0, 1.1), function (u, d, t) {
    var a1 = -50 + 50 * Math.max(0, Math.sin(t * 2.2)), a2 = -40 + 40 * Math.max(0, Math.sin(t * 9)), s = paper();
    s += block(70, 520, 180, 90, 40 * clamp(u / d)) + hammer(180, 300, a1, 1.15) + block(390, 520, 180, 90, 50 * clamp(u / d)) + hammer(520, 340, a2, 0.75);
    return s + T("عزم", 160, 680, 30, RED, 800) + T("حصان", 480, 680, 30, OLV, 800) + counter(480, 120, t, Math.floor(u * 4), "خبطة", OLV); });
  // 13 — the surprise: the air sets the push, not the fuel
  shot(13, pan([320, 400], [320, 380], 1.0, 1.12), function (u, d, t) { return paper() + cyl(320, 340, 0.72, t, { mode: "air", theta: Math.PI, stream: 1 }) + label(150, 166, 90, 90, "الهوا", SLATE, (u - 0.3) / 0.6, 28) + crossMark(470, 640, 0.8, (u - 1.6) / 0.6) + bottle(470, 640, 0.42, 0.6, null, "#c7cf9a"); });
  // 14 — one litre of fuel needs about 9,000 litres of air: one small bottle vs a grid of air bottles
  shot(14, pan([320, 420], [320, 400], 1.05, 0.98), function (u, d, t) { var s = paper() + bottle(520, 520, 0.6, 0.75, "1 L", "#c7cf9a"); var k = clamp((u - 0.4) / (d - 0.6)), n = Math.round(30 * k);
    for (var i = 0; i < n; i++) s += bottle(70 + (i % 6) * 60, 250 + Math.floor(i / 6) * 100, 0.22, 0.9, null, AIRF, 3);
    return s + serifNum(ticker(0, 9000, k).toLocaleString("en-US") + " L", 230, 160, 62, SLATE); });
  // 15 — more air, more fuel, a stronger push: the equation shot
  shot(15, pan([320, 400], [320, 390], 1.0, 1.1), function (u, d, t) { var s = paper(), k = function (i) { return (u - 0.2 - i * 0.7) / 0.5; };
    s += '<g transform="translate(110 400) scale(' + f(pop(k(0))) + ')">' + R(-80, -80, 160, 160, "#dfe9ee", 2.4, 6); for (var i = 0; i < 16; i++) s += '<circle cx="' + f(-62 + hash(i) * 124) + '" cy="' + f(-62 + hash(i + 5) * 124) + '" r="7" fill="' + AIRD + '"/>'; s += '</g>';
    s += T("+", 220, 420, 70, INK, 800) + '<g transform="translate(320 400) scale(' + f(pop(k(1))) + ')">' + R(-60, -60, 120, 120, "#eef0dc", 2.4, 6); for (var j = 0; j < 7; j++) s += '<circle cx="' + f(-44 + hash(j + 20) * 88) + '" cy="' + f(-44 + hash(j + 40) * 88) + '" r="7" fill="' + FUEL + '"/>'; s += '</g>';
    s += T("=", 420, 420, 70, INK, 800) + '<g opacity="' + f(clamp(k(2))) + '">' + cyl(530, 330, 0.42, t, { theta: 2.3 * Math.PI, mode: "fire", dense: 1.4 }) + '</g>';
    return s + T("هوا", 110, 540, 26, SLATE, 800) + T("بنزين", 320, 520, 26, OLV, 800) + T("زقة أقوى", 530, 560, 26, RED, 800); });
  // 16 — but the bottle's size is fixed; so how? three ways
  shot(16, pan([320, 400], [320, 390], 1.0, 1.1), function (u, d, t) { return paper() + '<g transform="translate(0 ' + f(8 * Math.sin(t * 2.6)) + ') rotate(' + f(3 * Math.sin(t * 1.9)) + ' 320 420)">' + bottle(320, 420, 1.0, 0.92 + 0.08 * Math.sin(t * 3.1), "2 L", AIRF, 26) + '</g>' + qMark(520, 250, 120, (u - 0.6) / 0.6, t) + stepper(3, 0, 400, 690, (u - 1.6) / 0.5); });
  // 17 — way 1: the turbo, a fan spun by the exhaust, packing extra air in
  shot(17, pan([320, 420], [330, 400], 1.0, 1.12), function (u, d, t) { var s = paper() + cyl(250, 340, 0.6, t, { mode: "air", theta: Math.PI, stream: 2.2, dense: clamp(u / d) + 1 });
    s += snail(500, 250, 0.7, t, OLV) + snail(500, 520, 0.7, t, "#c97a5a") + '<path d="M500 300 V470" stroke="' + INK + '" stroke-width="10"/>';
    s += dotStream([[640, 250], [560, 250], [460, 250], [400, 200]], t, 160, 22, 5, AIRD) + dotStream([[300, 520], [440, 520], [500, 600], [500, 760]], t, 120, 26, 5, EXH);
    return s + label(530, 220, 560, 120, "هوا من برة", SLATE, (u - 1.0) / 0.6, 20) + label(470, 540, 560, 700, "من الشكمان", RED, (u - 0.4) / 0.6, 20); }, HUD(1));
  // 18 — way 2: wider air openings, the bottle fills faster
  shot(18, pan([320, 400], [300, 380], 1.05, 1.2), function (u, d, t) { return paper() + cyl(320, 330, 0.74, t, { mode: "air", theta: Math.PI, bigValve: true, stream: 2.4 }) + label(130, 120, 110, 60, "فتحة أوسع", RED, (u - 0.4) / 0.6, 24); }, HUD(2));
  // 19 — way 3: the engine spins faster — the rpm counter climbs
  shot(19, pan([300, 400], [320, 390], 1.1, 1.18), function (u, d, t) { var k = clamp(u / d); return paper() + cyl(330, 330, 0.66, t, { w: 6 + 10 * k }) + counter(85, 140, t, ticker(6000, 9000, k).toLocaleString("en-US"), "لفة في الدقيقة", OLV) + bottle(560, 600, 0.36, 0.5 + 0.5 * Math.sin(t * (6 + 10 * k)), null, AIRF, 6); }, HUD(3));
  // 20 — the engine computer sets it all: turbo pressure, fuel, spark timing
  shot(20, pan([320, 380], [320, 420], 1.1, 1.0), function (u, d, t) { var s = paper() + chip(320, 230, 1.0, t), ic = [[150, 560, "التيربو", SLATE], [320, 580, "البنزين", OLV], [490, 560, "الشرارة", RED]];
    ic.forEach(function (c, i) { var k = clamp((u - 0.8 - i * 0.6) / 0.6); s += '<path d="M320 314 Q' + f((320 + c[0]) / 2) + ' 420 ' + f(c[0]) + ' ' + f(c[1] - 60) + '" stroke="' + INK + '" stroke-width="3" fill="none" stroke-dasharray="400" stroke-dashoffset="' + f(400 * (1 - k)) + '"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + f(54 * pop(k)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
      if (k > 0.5) { s += i === 0 ? snail(c[0], c[1], 0.36, t, OLV) : i === 1 ? drop(c[0], c[1] + 10, 22, "#c7cf9a") : '<path d="M' + (c[0] - 10) + ' ' + (c[1] - 28) + ' L' + (c[0] + 6) + ' ' + (c[1] - 2) + ' L' + (c[0] - 6) + ' ' + (c[1] + 2) + ' L' + (c[0] + 10) + ' ' + (c[1] + 30) + '" stroke="#e8a33a" stroke-width="6" fill="none"/>'; s += T(c[2], c[0], c[1] + 90, 22, c[3], 800); } });
    return s; });
  function drop(x, y, r, col) { return '<path d="M' + f(x) + ' ' + f(y - r * 1.8) + ' Q' + f(x + r) + ' ' + f(y - r * 0.2) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r) + ' ' + f(y - r * 0.2) + ' ' + f(x) + ' ' + f(y - r * 1.8) + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>'; }
  // 21 — that's why the same engine can make more horsepower, just by programming: 150 → 180 as the chip snaps on
  shot(21, pan([320, 470], [320, 450], 1.0, 1.08), function (u, d, t) { var k = clamp((u - 0.8) / 1.2); return paper() + compare(t, ticker(150, 180, k), 150, k > 0.95 ? RED : OLV, OLV, { chipA: (u - 0.3) / 0.6 }); });
  // 22 — the 400 hp one stacks all three ways to the limit: the turbo docks, three icons pop in, 400 in red
  shot(22, pan([320, 470], [320, 440], 1.0, 1.1), function (u, d, t) { var s = paper() + compare(t, ticker(180, 400, clamp((u - 0.6) / 1.4)), 150, RED, OLV, { turboA: (u - 0.2) / 0.6 });
    for (var i = 0; i < 3; i++) s += '<g transform="translate(' + (110 + i * 60) + ' 210)">' + stepper(1, 1, 0, 0, clamp((u - 0.4 - i * 0.3) / 0.4)).replace('>1<', '>' + (i + 1) + '<') + '</g>';
    return s; });
  shot(0, function () { return [320, 400, 1]; }, function (u, d, t) { return paper(); });
  SH.sort(function (a, b) { return a.a - b.a; });

  // the opening card: the two blocks, «2000 cc» over each, the numbers counting up
  window.__intro = function (svg, t) {
    var k = clamp((t - 0.4) / 2.6), s = '<rect width="640" height="640" fill="' + PAPER + '"/>';
    s += engine([150, 230, 1.0], t) + engine([440, 230, 1.0], t) + T("2000 cc", 175, 150, 30, INK, 800) + T("2000 cc", 465, 150, 30, INK, 800);
    s += serifNum(String(ticker(0, 150, k)), 190, 500, 100, OLV) + serifNum(String(ticker(0, 400, k)), 480, 500, 100, k > 0.98 ? RED : OLV) + T("حصان", 190, 545, 22, OLV, 700) + T("حصان", 480, 545, 22, k > 0.98 ? RED : OLV, 700);
    svg.innerHTML = s; svg.style.transform = 'translate(' + f(7 * Math.sin(t * 1.3)) + 'px,' + f(4 * Math.cos(t * 1.1)) + 'px) scale(' + f(1.03 + 0.03 * Math.sin(t * 0.9)) + ')';
  };
  // the summary card: the cylinder in a putty panel with ①–④; the stat counts to 9000
  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="320" fill="#e4d9bf"/>' + cyl(290, 150, 0.36, t, { w: 3 });
    s += callout("1", 150, 72, (u - 0.2) / 0.5) + callout("2", 250, 150, (u - 0.4) / 0.5) + callout("3", 330, 70, (u - 0.6) / 0.5) + callout("4", 360, 270, (u - 0.8) / 0.5);
    svg.innerHTML = s; svg.style.transform = 'translate(' + f(6 * Math.sin(t * 1.2)) + 'px,' + f(4 * Math.cos(t * 1.5)) + 'px) scale(' + f(1.04 + 0.04 * Math.sin(t * 1.4)) + ')';
    var ov = document.getElementById('outro'); ov.style.transform = 'translate(' + f(3 * Math.sin(t * 1.7)) + 'px,' + f(2.5 * Math.cos(t * 1.3)) + 'px) scale(' + f(1.012 + 0.012 * Math.sin(t * 1.1)) + ')';
    var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = String(ticker(0, 9000, u / 2.0));
  };
  window.__parts = { engine: engine, cyl: cyl, compare: compare, bottle: bottle, paper: paper, serifNum: serifNum, T: T, label: label, snail: snail };
})();
