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

  // ---- isometric (true 30°) — every object, room, street and machine is drawn on this grid ----
  // world units: x to the right-down, y to the left-down, z up; (ox,oy) is where world (0,0,0) lands on screen, s = px per unit
  var ISO = { ox: 320, oy: 300, s: 1 };
  function isoAt(ox, oy, s) { ISO = { ox: ox, oy: oy, s: s || 1 }; return ""; }
  function iso(x, y, z) { return [ISO.ox + (x - y) * 0.866 * ISO.s, ISO.oy + ((x + y) * 0.5 - (z || 0)) * ISO.s]; }
  function isoPath(pts) { return pts.map(function (p, i) { var q = iso(p[0], p[1], p[2]); return (i ? "L" : "M") + f(q[0]) + " " + f(q[1]); }).join(" ") + " Z"; }
  // one flat face; hatch: "" none, "hatch" dark lines (the face in shadow), "hatchW" light lines (on dark fills)
  function isoFace(pts, fill, hatch, sw) {
    var d = isoPath(pts), s = '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 1.8 : sw) + '" stroke-linejoin="round"/>';
    return hatch ? s + '<path d="' + d + '" fill="url(#' + hatch + ')" stroke="none"/>' : s;
  }
  // a box: corner (x,y,z), size w (x), d (y), h (z). col = [top, left (x-facing, lit), right (y-facing, hatched shade)]
  function isoBox(x, y, z, w, d, h, col, sw) {
    col = col || [BONE, PUTTY, PUTTY];
    return isoFace([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], col[1], "", sw) +
           isoFace([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], col[2], col[2] === INK || col[2] === "#41392f" ? "hatchW" : "hatch", sw) +
           isoFace([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], col[0], "", sw);
  }
  // a soft contact shadow under an object footprint (keeps things sitting on the floor, not floating)
  function isoShadow(x, y, w, d, o) { return '<path d="' + isoPath([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]]) + '" fill="' + INK + '" opacity="' + (o || 0.12) + '" transform="translate(4 3)"/>'; }
  // a floor slab / ground tile with the paper grid kept visible through it
  function isoFloor(x, y, w, d, fill) { return isoFace([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]], fill || "#d9c3a8", "", 1.4); }
  // an upright cylinder (tanks, columns, cable ends seen from above): centre (x,y,z), radius r, height h
  function isoCyl(x, y, z, r, h, fill, top) {
    var b = iso(x, y, z), tp = iso(x, y, z + h), rx = r * 1.2247 * ISO.s, ry = r * 0.7071 * ISO.s;
    return '<path d="M' + f(b[0] - rx) + ' ' + f(b[1]) + ' L' + f(tp[0] - rx) + ' ' + f(tp[1]) + ' L' + f(tp[0] + rx) + ' ' + f(tp[1]) + ' L' + f(b[0] + rx) + ' ' + f(b[1]) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 1 ' + f(b[0] - rx) + ' ' + f(b[1]) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M' + f(b[0] + rx * 0.35) + ' ' + f(tp[1]) + ' L' + f(b[0] + rx) + ' ' + f(tp[1]) + ' L' + f(b[0] + rx) + ' ' + f(b[1]) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 1 ' + f(b[0] + rx * 0.35) + ' ' + f(b[1] + ry * 0.94) + ' Z" fill="url(#hatch)"/>' +
      '<ellipse cx="' + f(tp[0]) + '" cy="' + f(tp[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + (top || BONE) + '" stroke="' + INK + '" stroke-width="1.8"/>';
  }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  // screen-fixed overlay (chapter markers, big numbers that must not move with the camera): call fixed(svg) inside draw
  var OVER = "";
  function fixed(s) { OVER += s; return ""; }
  window.__panel = function (svg, t) {
    CLIPN = 0; OVER = ""; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.35), cy = c[1] + 12 * Math.cos(t * 1.35), z = c[2] * (1 + 0.035 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 400) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g>' + OVER + '<rect width="640" height="800" filter="url(#paperN)"/>';
    return i;
  };
  // ── «تعمل بيت في الصحرا إزاي؟» (لو + دايجرام): one courtyard house drawn in true isometric (world units = metres),
  // built part by part: 50 cm mud-brick walls, a domed room, a wind catcher (malqaf) with water jars, an open courtyard,
  // small windows with a mashrabiya, a well with a solar pump, roof solar panels, a zeer pot-in-pot cooler, palms and a
  // sand wall. Shapes follow traditional Egyptian mud-brick houses and Hassan Fathy's New Gourna (../refs/SOURCES.md).
  var DARK = "#41392f", SKY = "#b9bfbb", PB = "#4f7a9a", LANDD = "#8e9f6a", MUD = "#c9a27a", MUDL = "#dcbb92", MUDD = "#a9845e",
      SANDC = "#e3cfa6", SANDD = "#cdb68a", BRICK = "#b9614b", BRICKD = "#9a4c3a", WOOD = "#8a5a3c", CLAY = "#c47a4a", NIGHT = "#1b2433", HEAT = "#c4532c", COOL = "#4f7a9a";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function TS(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:700 ' + sz + 'px DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + ';direction:ltr">' + text + '</text>'; }
  function circ(x, y, r, fill, sw, ex) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || '') + '/>'; }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("؟", 0, 0, sz || 60, ORANGE)); }
  function tick(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G(x, y, k * s, 0, '<path d="M-28 0 L-8 22 L30 -24" stroke="' + LANDD + '" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); }
  function P(x, y, z) { return iso(x, y, z); }
  function seg(a, b, col, w, ex) { return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round"' + (ex || '') + '/>'; }
  // a dashed flow arrow along screen points
  function flow(pts, col, k, t, w) { if (k <= 0) return ""; var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), n = pts.length, a = pts[n - 2], b = pts[n - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), h = 14;
    return '<g opacity="' + f(k) + '"><path d="' + d + '" stroke="' + col + '" stroke-width="' + (w || 5) + '" fill="none" stroke-dasharray="12 9" stroke-dashoffset="' + f(-t * 40) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="M' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(b[0] - Math.cos(an - 0.5) * h) + ' ' + f(b[1] - Math.sin(an - 0.5) * h) + ' L' + f(b[0] - Math.cos(an + 0.5) * h) + ' ' + f(b[1] - Math.sin(an + 0.5) * h) + ' Z" fill="' + col + '"/></g>'; }
  function sun(x, y, t, k) { k = k == null ? 1 : k; if (k <= 0) return ""; var g = '<circle r="54" fill="#ffd27a" opacity=".35" filter="url(#soft)"/>' + circ(0, 0, 30, "#e8b04a", 2.4); for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2 + t * 0.2; g += seg([Math.cos(a) * 40, Math.sin(a) * 40], [Math.cos(a) * 54, Math.sin(a) * 54], "#c98a2a", 4); } return fixed(G(x, y, pop(k), 0, g)); }
  function moon(x, y, k) { if (k <= 0) return ""; var g = '<path d="M-20 -26 A32 32 0 1 0 16 26 A26 26 0 1 1 -20 -26 Z" fill="#efe39a" stroke="' + INK + '" stroke-width="2.4"/>'; for (var i = 0; i < 9; i++) g += circ(-260 + hash(i) * 300, -10 + hash(i + 5) * 120, 2.2, "#efe6d2", 0); return fixed(G(x, y, 1, 0, g, k)); }
  function nightTint(k) { return k > 0 ? '<rect x="-600" y="-600" width="1840" height="2000" fill="' + NIGHT + '" opacity="' + f(0.5 * k) + '"/>' : ""; }
  function heatWaves(pts, t, k) { var s = ""; pts.forEach(function (p, i) { s += waveRay(p[0] + 60, p[1] - 150, p[0], p[1], t + i, HEAT, 5, 22, k, 3); }); return s; }
  function thermo(x, y, lvl, col, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return fixed(G(x, y, k, 0, R(-12, -90, 24, 110, PAPER, 2.4, 12) + circ(0, 26, 20, col, 2.4) + R(-5, -78 + 96 * (1 - lvl), 10, 96 * lvl + 10, col, 0, 5))); }
  // ── the house
  function ground(o) {
    o = o || {}; var s = isoFace([[-16, -16, 0], [24, -16, 0], [24, 22, 0], [-16, 22, 0]], SANDC, "", 1.4);
    [[18, -10, 6], [-12, 16, 5], [20, 16, 7]].forEach(function (d) { var c = P(d[0], d[1], 0), r = d[2] * ISO.s; s += '<path d="M' + f(c[0] - r) + ' ' + f(c[1]) + ' Q' + f(c[0]) + ' ' + f(c[1] - r * 0.55) + ' ' + f(c[0] + r) + ' ' + f(c[1]) + ' Z" fill="' + SANDD + '" stroke="' + INK + '" stroke-width="1.2" opacity=".8"/>'; });
    return s;
  }
  function mudBox(x, y, z, w, d, h, cut) { var s = isoBox(x, y, z, w, d, h, [MUDL, MUD, MUDD]); if (cut) s += isoFace([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], MUDD, "hatch", 1.2); return s; }
  function brickRoom(t) { var s = isoShadow(3, 3, 4, 4) + isoBox(3, 3, 0, 4, 4, 3, ["#c9806a", BRICK, BRICKD]); for (var z = 0.3; z < 3; z += 0.3) s += seg(P(3, 7, z), P(7, 7, z), BRICKD, 1) + seg(P(7, 7, z), P(7, 3, z), "#7a3a2a", 1); return s + isoFace([[4.6, 7, 0], [5.6, 7, 0], [5.6, 7, 2], [4.6, 7, 2]], WOOD, "", 1.6); }
  function dome(cx, cy, z, r, k) { if (k <= 0) return ""; var p = P(cx, cy, z), s = ISO.s, rx = r * 1.2247 * s, ry = r * 0.7071 * s, h = r * s * k; var id = "dm" + (++CLIPN), d = 'M' + f(p[0] - rx) + ' ' + f(p[1]) + ' A' + f(rx) + ' ' + f(h + ry) + ' 0 0 1 ' + f(p[0] + rx) + ' ' + f(p[1]) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 1 ' + f(p[0] - rx) + ' ' + f(p[1]) + ' Z';
    return '<path d="' + d + '" fill="' + MUDL + '" stroke="' + INK + '" stroke-width="2"/><clipPath id="' + id + '"><path d="' + d + '"/></clipPath><rect x="' + f(p[0] + rx * 0.1) + '" y="' + f(p[1] - h - ry - 4) + '" width="' + f(rx) + '" height="' + f(h + 2 * ry + 8) + '" fill="url(#hatch)" clip-path="url(#' + id + ')"/><rect x="' + f(p[0] + rx * 0.1) + '" y="' + f(p[1] - h - ry - 4) + '" width="' + f(rx) + '" height="' + f(h + 2 * ry + 8) + '" fill="' + MUDD + '" opacity=".25" clip-path="url(#' + id + ')"/>' + isoCyl(cx, cy, z + r * k + 0.55 * r * 0.2, 0.3, 0.35, MUDD, DARK); }
  var MQ = { x: 5.4, y: 0, w: 1.6 };
  function malqaf(H, jars, t) { if (H <= 0) return ""; var s = mudBox(MQ.x, MQ.y, 3.2, MQ.w, MQ.w, H - 3.2) + isoBox(MQ.x - 0.15, MQ.y - 0.15, H, MQ.w + 0.3, MQ.w + 0.3, 0.25, [MUDL, MUD, MUDD]);
    if (H > 4.6) { s += isoFace([[MQ.x + 0.3, MQ.y + MQ.w, H - 1.5], [MQ.x + 1.3, MQ.y + MQ.w, H - 1.5], [MQ.x + 1.3, MQ.y + MQ.w, H - 0.3], [MQ.x + 0.3, MQ.y + MQ.w, H - 0.3]], DARK, "", 1.6);
      for (var i = 0; i < 4; i++) s += seg(P(MQ.x + 0.3 + i * 0.33, MQ.y + MQ.w, H - 1.5), P(MQ.x + 0.3 + i * 0.33, MQ.y + MQ.w, H - 0.3), WOOD, 2);
      if (jars) [[0.55, 1.35], [1.05, 1.35]].forEach(function (j) { s += isoCyl(MQ.x + j[0], MQ.y + j[1], H - 1.5, 0.2, 0.45 * jars, CLAY, "#9fb3bd"); }); }
    return s; }
  function mashrabiya(k) { if (k <= 0) return ""; var s = isoFace([[2, 5, 1.1], [3.8, 5, 1.1], [3.8, 5, 2.5], [2, 5, 2.5]], WOOD, "", 1.6); for (var i = 1; i < 6; i++) s += seg(P(2 + i * 0.3, 5, 1.1), P(2 + i * 0.3, 5, 2.5), "#5a3a22", 1.4); for (var j = 1; j < 5; j++) s += seg(P(2, 5, 1.1 + j * 0.28), P(3.8, 5, 1.1 + j * 0.28), "#5a3a22", 1.4); return '<g opacity="' + f(k) + '">' + s + '</g>'; }
  function panels(k) { if (k <= 0) return ""; var s = ""; [[2.1, 3.0], [3.3, 4.4]].forEach(function (r) { var q = [[5.5, r[0], 3.3], [5.5, r[1], 3.3], [6.9, r[1], 3.3 + 0.9 * k], [6.9, r[0], 3.3 + 0.9 * k]]; s += isoFace(q, PB, "", 1.6); for (var i = 1; i < 4; i++) s += seg(P(5.5 + i * 0.35, r[0], 3.3 + 0.9 * k * i / 4), P(5.5 + i * 0.35, r[1], 3.3 + 0.9 * k * i / 4), "#2b3b48", 1); s += seg(P(5.5, (r[0] + r[1]) / 2, 3.3), P(6.9, (r[0] + r[1]) / 2, 3.3 + 0.9 * k), "#2b3b48", 1); }); return s; }
  function well(k, t) { if (k <= 0) return ""; var s = isoCyl(8.4, 7.6, 0, 0.9 * k, 0.7, "#bfae8a", "#2b3b48") + isoBox(9.4, 6.9, 0, 0.5, 0.5, 0.6, [PUTTY, "#9a958a", "#77726a"]); s += seg(P(9.6, 7.1, 0.6), P(8.6, 7.4, 0.6), DARK, 3); var pv = [[9.1, 8.6, 0.9], [9.1, 9.6, 0.9], [9.9, 9.6, 1.5], [9.9, 8.6, 1.5]]; s += seg(P(9.5, 9.1, 0), P(9.5, 9.1, 1.2), DARK, 3) + isoFace(pv, PB, "", 1.4); return '<g opacity="' + f(k) + '">' + s + '</g>'; }
  function zeer(x, y, z, k) { if (k <= 0) return ""; return '<g opacity="' + f(k) + '">' + isoCyl(x, y, z, 0.7, 0.75, CLAY, "#8a6a4a") + isoCyl(x, y, z + 0.3, 0.45, 0.47, "#d9905a", "#c47a4a") + circ(P(x, y, z + 0.8)[0] - 6, P(x, y, z + 0.8)[1], 5, "#c4532c", 1.2) + circ(P(x, y, z + 0.8)[0] + 6, P(x, y, z + 0.8)[1] + 2, 5, LANDD, 1.2) + '</g>'; }
  function palm(x, y, h, t, k) { if (k <= 0) return ""; var b = P(x, y, 0), tp = P(x, y, h * k), s = '<path d="M' + f(b[0]) + ' ' + f(b[1]) + ' Q' + f(b[0] + 8) + ' ' + f((b[1] + tp[1]) / 2) + ' ' + f(tp[0]) + ' ' + f(tp[1]) + '" stroke="' + INK + '" stroke-width="' + f(0.45 * ISO.s + 3) + '" fill="none"/><path d="M' + f(b[0]) + ' ' + f(b[1]) + ' Q' + f(b[0] + 8) + ' ' + f((b[1] + tp[1]) / 2) + ' ' + f(tp[0]) + ' ' + f(tp[1]) + '" stroke="' + WOOD + '" stroke-width="' + f(0.45 * ISO.s) + '" fill="none"/>';
    for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2 + 0.06 * Math.sin(t * 1.5 + i), L0 = 2.6 * ISO.s * k; s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' Q' + f(tp[0] + Math.cos(a) * L0 * 0.6) + ' ' + f(tp[1] + Math.sin(a) * L0 * 0.25 - L0 * 0.25) + ' ' + f(tp[0] + Math.cos(a) * L0) + ' ' + f(tp[1] + Math.sin(a) * L0 * 0.35 + L0 * 0.15) + '" stroke="' + LANDD + '" stroke-width="' + f(0.35 * ISO.s) + '" fill="none" stroke-linecap="round"/>'; }
    return s; }
  function house(t, o) {
    o = o || {}; var hk = o.wallK == null ? 1 : o.wallK, H = 3.2 * hk, s = ground(o);
    if (o.fence) s += mudBox(-3.2, -2, 0, 0.5, 13 * o.fence, 1.6);
    if (o.palms) { s += palm(-2, 12, 7, t, o.palms) + palm(12.5, -1.5, 8, t, o.palms); }
    s += isoShadow(-0.5, -0.5, 11, 11, 0.08);
    s += mudBox(-0.5, -0.5, 0, 11, 0.5, H) + mudBox(-0.5, 0, 0, 0.5, 10.5, H);
    if (hk > 0) { s += mudBox(0, 0, 0, 7, 5, H); if (hk >= 1) { s += isoFace([[7, 2.6, 0], [7, 3.6, 0], [7, 3.6, 2.2], [7, 2.6, 2.2]], WOOD, "", 1.6) + mashrabiya(o.win == null ? 0 : o.win);
      if (o.win) s += isoFace([[4.6, 5, 1.6], [5.3, 5, 1.6], [5.3, 5, 2.3], [4.6, 5, 2.3]], DARK, "", 1.4); } }
    if (o.lamp) { var lp = P(4.95, 5, 1.95); s += '<circle cx="' + f(lp[0]) + '" cy="' + f(lp[1]) + '" r="' + f(26 + 3 * Math.sin(t * 5)) + '" fill="url(#glowO)" opacity="' + f(o.lamp) + '"/>'; }
    if (o.dome) s += dome(2.9, 2.5, H, 2.2, o.dome);
    if (o.panels) s += panels(o.panels);
    if (o.malqaf) s += malqaf(3.2 + 4.3 * o.malqaf, o.jars || 0, t);
    if (o.zeer) s += zeer(2, 8.6, 0, o.zeer);
    if (o.well) s += well(o.well, t);
    s += mudBox(0, 10, 0, 10.5, 0.5, 1.0 * hk, true) + mudBox(10, -0.5, 0, 0.5, 10.5, 1.0 * hk, true);
    if (o.jarDoor) s += isoCyl(10.9, 6, 0, 0.35, 0.9, CLAY, "#9fb3bd");
    return s;
  }
  var FULL = function () { isoAt(330, 400, 26); };
  // the wall in section (front elevation): outside on the left, inside on the right; heat front at k (0..1)
  function wallSection(t, k, night) { var s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + (night ? "#2a3040" : PAPER) + '"/><rect x="-600" y="-600" width="1840" height="2000" fill="url(#grid)" opacity="' + (night ? .2 : 1) + '"/>';
    s += R(220, 120, 200, 560, MUD, 3) + R(220, 120, 200, 560, "url(#hatch)", 0); for (var r = 0; r < 14; r++) s += seg([220, 120 + r * 40], [420, 120 + r * 40], MUDD, 1.4) + seg([220 + (r % 2 ? 100 : 50), 120 + r * 40], [220 + (r % 2 ? 100 : 50), 160 + r * 40], MUDD, 1.4);
    var hx = 220 + 200 * k; s += '<rect x="220" y="120" width="' + f(200 * k) + '" height="560" fill="' + HEAT + '" opacity=".35"/>' + seg([hx, 120], [hx, 680], HEAT, 4, ' stroke-dasharray="10 8"');
    return s + T("بره", 110, 420, 28, INK, 800) + T("جوه", 530, 420, 28, INK, 800); }

  // 0 — if you build a red-brick room in the middle of the desert and live in it, did you build a liveable house?
  shot(0, mv(320, 420, 1.0, 330, 400, 1.1), function (u, d, t) { isoAt(320, 380, 30); return paper() + ground() + brickRoom(t) + qmark(470, 170, K(u, 2.0, 0.6), 80) + label(P(5, 7, 1.5)[0], P(5, 7, 1.5)[1], 150, 600, "طوب أحمر", ORANGE, K(u, 0.6), 22); });
  // 1 — sadly no: the sun heats the walls and the roof, and the room becomes an oven
  shot(1, mv(330, 400, 1.1, 320, 420, 1.0), function (u, d, t) { isoAt(320, 380, 30); var k = K(u, 0.2, 1.0); return paper() + ground() + brickRoom(t) + sun(540, 110, t, K(u, 0, 0.5)) + heatWaves([P(4, 4, 3), P(6, 5, 3), P(7, 6, 1.5)], t, k) + thermo(110, 230, 0.3 + 0.65 * ease(K(u, 0.4, 2.0)), HEAT, K(u, 0.3, 0.5)) + label(P(5, 5, 2)[0], P(5, 5, 2)[1], 470, 660, "زي الفرن", ORANGE, K(u, 1.6), 24); });
  // 2 — so you build the walls from mud bricks, about half a metre thick
  shot(2, mv(320, 420, 0.95, 330, 400, 1.05), function (u, d, t) {
    FULL(); var k = ease(K(u, 0.2, 2.0)), s = paper() + house(t, { wallK: k });
    var a = P(-0.5, 10.5, 1.0), b = P(0, 10.5, 1.0); if (k > 0.9) s += seg([a[0], a[1] + 30], [b[0], b[1] + 30], ORANGE, 3) + seg([a[0], a[1] + 20], [a[0], a[1] + 40], ORANGE, 3) + seg([b[0], b[1] + 20], [b[0], b[1] + 40], ORANGE, 3);
    return s + label(P(0, 0, 2.5)[0], P(0, 0, 2.5)[1], 120, 150, "طوب الطين", OLIVE, K(u, 0.6), 22) + numBox("≈ 50 سم", a[0] + 20, a[1] + 90, K(u, 2.4, 0.6), 22);
  });
  // 3 — mud soaks up heat slowly, so the midday heat only gets inside at night
  shot(3, mv(320, 400, 1.0, 320, 400, 1.06), function (u, d, t) {
    var k = ease(K(u, 0.3, 3.4)), s = wallSection(t, k, false) + waveRay(-40, 200, 210, 300, t, HEAT, 8, 30, K(u, 0.1, 0.6), 4) + waveRay(-40, 420, 210, 420, t + 1, HEAT, 8, 30, K(u, 0.2, 0.6), 4);
    var hh = 12 + 9 * k; s += fixed(G(540, 120, 1, 0, '<circle r="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>' + seg([0, 0], [Math.sin(hh / 12 * Math.PI * 2) * 22, -Math.cos(hh / 12 * Math.PI * 2) * 22], INK, 5) + seg([0, 0], [Math.sin(hh * Math.PI * 2) * 34, -Math.cos(hh * Math.PI * 2) * 34], ORANGE, 3)) + G(540, 190, 1, 0, T(k < 0.5 ? "الضهر" : "بالليل", 0, 0, 22, INK, 800)));
    return s + label(320, 160, 470, 80, "ببطء", ORANGE, K(u, 1.0), 22);
  });
  // 4 — but the desert gets very cold at night, maybe 20 degrees below midday
  shot(4, mv(320, 400, 1.0, 330, 380, 1.08), function (u, d, t) { FULL(); var n = K(u, 0.2, 1.0); return paper() + house(t, {}) + nightTint(n) + moon(520, 110, n) + thermo(110, 230, 0.75 - 0.5 * ease(K(u, 0.6, 1.6)), COOL, K(u, 0.4, 0.5)) + numBox("−20°", 320, 690, K(u, 1.6, 0.6), 30); });
  // 5 — the good news: that same wall gives the warmth it stored back into the house at night
  shot(5, mv(330, 400, 1.08, 320, 420, 1.15), function (u, d, t) {
    FULL(); var s = paper() + house(t, {}) + nightTint(1) + moon(520, 110, 1), k = K(u, 0.4, 0.6);
    [[P(0, 2.5, 1.6), P(2, 2.5, 1.6)], [P(3, 0, 1.8), P(3, 2, 1.8)], [P(0, 7, 0.6), P(2.5, 7, 0.6)]].forEach(function (q, i) { s += waveRay(q[0][0], q[0][1], q[1][0], q[1][1], t + i, "#e8803a", 5, 18, k, 4); });
    return s + label(P(1.5, 2.5, 1.6)[0], P(1.5, 2.5, 1.6)[1], 470, 650, "الدفا", "#e8803a", K(u, 1.0), 24);
  });
  // 6 — but a flat roof takes the full sun all day
  shot(6, mv(320, 360, 1.15, 320, 340, 1.25), function (u, d, t) { FULL(); var s = paper() + house(t, {}) + isoFace([[0, 0, 3.21], [7, 0, 3.21], [7, 5, 3.21], [0, 5, 3.21]], "#e8a07a", "", 1.4) + sun(540, 110, t, 1) + heatWaves([P(1, 1, 3.2), P(3, 2.5, 3.2), P(5, 4, 3.2), P(6, 1, 3.2)], t, K(u, 0.3, 0.8)); return s + label(P(3, 2.5, 3.2)[0], P(3, 2.5, 3.2)[1], 140, 140, "سقف مسطح", ORANGE, K(u, 0.6), 22) + crossMark(P(3, 2.5, 3.2)[0], P(3, 2.5, 3.2)[1] - 40, 0.8, K(u, 1.6, 0.5)); });
  // 7 — so the roof becomes a dome: part of it is always in shade, and hot air rises up, away from you
  shot(7, mv(320, 340, 1.25, 320, 360, 1.1), function (u, d, t) {
    FULL(); var dk = ease(K(u, 0.2, 1.0)), s = paper() + house(t, { dome: dk }) + sun(540, 110, t, 1), top = P(2.9, 2.5, 5.4);
    s += flow([P(2.9, 2.5, 1.0), P(2.9, 2.5, 3.0), [top[0], top[1] - 10]], HEAT, K(u, 1.6, 0.5), t, 5);
    return s + label(P(3.6, 2.0, 4.4)[0], P(3.6, 2.0, 4.4)[1], 520, 210, "ضل", OLIVE, K(u, 1.0), 22) + label(top[0], top[1], 130, 150, "قبة", OLIVE, K(u, 0.6), 24);
  });
  // 8 — but the air inside would stay still and stuffy
  shot(8, mv(320, 380, 1.1, 320, 380, 1.18), function (u, d, t) { FULL(); var s = paper() + house(t, { dome: 1 }), c = P(3.5, 2.5, 1.6); for (var i = 0; i < 12; i++) s += circ(c[0] - 70 + hash(i) * 140 + 3 * Math.sin(t + i), c[1] - 50 + hash(i + 3) * 80, 6, "#9a958a", 1, ' opacity=".7"'); return s + crossMark(c[0], c[1] - 20, 0.8, K(u, 0.8, 0.5)) + label(c[0], c[1], 140, 640, "هوا واقف", ORANGE, K(u, 0.3), 22); });
  // 9 — so you build a wind catcher: a tall tower with its opening facing the wind
  shot(9, mv(380, 360, 1.05, 400, 300, 1.15), function (u, d, t) { FULL(); var mk = ease(K(u, 0.2, 1.4)), s = paper() + house(t, { dome: 1, malqaf: mk }), op = P(MQ.x + 0.8, MQ.y + MQ.w, 6.6); s += flow([[op[0] - 260, op[1] - 120], [op[0] - 120, op[1] - 60], [op[0] - 20, op[1] - 10]], COOL, K(u, 1.4, 0.5), t, 6); return s + label(op[0] + 20, op[1] - 40, 560, 150, "ملقف", OLIVE, K(u, 0.6), 24); });
  // 10 — it catches the cleaner, cooler air up high and brings it down into the house
  shot(10, mv(400, 300, 1.15, 360, 360, 1.05), function (u, d, t) {
    FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1 }), op = P(MQ.x + 0.8, MQ.y + MQ.w, 6.6), k = K(u, 0.3, 0.5);
    s += flow([[op[0] - 260, op[1] - 120], [op[0] - 120, op[1] - 60], [op[0] - 10, op[1] - 6]], COOL, k, t, 6) + flow([op, P(MQ.x + 0.8, MQ.y + 0.8, 1.2), P(4, 2.5, 1.0), P(2, 2.5, 1.0)], COOL, K(u, 0.9, 0.5), t, 5);
    return s + label(op[0] - 120, op[1] - 60, 140, 150, "هوا أبرد", COOL, K(u, 1.4), 22);
  });
  // 11 — and with clay water jars at its opening, the air passing over them cools more
  shot(11, function (u, d) { var k = ease(K(u, 0, 1.6)); return [lerp(380, 470, k), lerp(320, 210, k), lerp(1.05, 2.4, k)]; }, function (u, d, t) {
    FULL(); var jk = ease(K(u, 0.8, 0.8)), s = paper() + house(t, { dome: 1, malqaf: 1, jars: jk }), op = P(MQ.x + 0.8, MQ.y + MQ.w, 6.0);
    for (var i = 0; i < 5; i++) { var q = (t * 0.7 + i / 5) % 1; s += '<path d="M' + f(op[0] - 60 + i * 20) + ' ' + f(op[1] - 30 - q * 30) + ' q4 -6 8 0" stroke="' + COOL + '" stroke-width="2" fill="none" opacity="' + f(jk * Math.sin(q * Math.PI)) + '"/>'; }
    return s + flow([[op[0] - 160, op[1] - 60], [op[0] - 70, op[1] - 20], [op[0] - 10, op[1]]], COOL, K(u, 1.2, 0.5), t, 4) + label(op[0], op[1] + 8, op[0] + 60, op[1] + 70, "قلل فخار", CLAY, K(u, 1.4), 14);
  });
  // 12 — in the middle you leave an open courtyard: hot air rises out of it, and cool air sinks to fill the rooms
  shot(12, mv(330, 420, 1.0, 330, 400, 1.06), function (u, d, t) {
    FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1 }), c = P(6.5, 7.5, 0.3), up = P(6.5, 7.5, 9);
    s += flow([c, [c[0] + 10, (c[1] + up[1]) / 2], up], HEAT, K(u, 0.3, 0.5), t, 6) + flow([P(9.5, 4, 6), P(8.5, 4.5, 3), P(7.4, 3.1, 1.2)], COOL, K(u, 1.0, 0.5), t, 5) + flow([P(3, 9.5, 6), P(3, 7.5, 3), P(3, 5.4, 1.2)], COOL, K(u, 1.3, 0.5), t, 5);
    return s + label(c[0], c[1], 520, 690, "حوش", OLIVE, K(u, 0.4), 24);
  });
  // 13 — but sandstorms would fill the house with sand
  shot(13, mv(330, 400, 1.06, 320, 410, 1.0), function (u, d, t) {
    FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1 }), k = K(u, 0.1, 0.5);
    for (var i = 0; i < 70; i++) { var x = ((t * 340 + i * 53) % 900) - 130, y = 120 + hash(i) * 560 + 20 * Math.sin(t * 2 + i); s += circ(x, y, 2 + hash(i + 7) * 3, SANDD, 0, ' opacity="' + f(0.8 * k) + '"'); }
    for (var w = 0; w < 5; w++) s += waveRay(-100, 200 + w * 110, 760, 230 + w * 110, t * 2 + w, SANDD, 10, 60, k, 5);
    return s + crossMark(P(3, 7, 1)[0], P(3, 7, 1)[1], 1.0, K(u, 0.8, 0.5)) + label(P(5, 8, 0)[0], P(5, 8, 0)[1], 130, 690, "رملة", ORANGE, K(u, 0.6), 22);
  });
  // 14 — so the windows are small, away from the wind, with a wooden mashrabiya
  shot(14, function (u, d) { var k = ease(K(u, 0, 1.4)); return [lerp(330, 270, k), lerp(400, 380, k), lerp(1.0, 2.1, k)]; }, function (u, d, t) { FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: ease(K(u, 0.4, 0.8)) }), m = P(2.9, 5, 1.8); return s + label(m[0], m[1], m[0] - 60, m[1] + 80, "مشربية", WOOD, K(u, 1.4), 14); });
  // 15 — but where will you drink from in the desert?
  shot(15, mv(330, 420, 1.0, 330, 420, 1.06), function (u, d, t) { FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1 }) + sun(540, 110, t, 1), c = P(8.4, 7.6, 0); for (var i = 0; i < 6; i++) s += seg([c[0] - 60 + i * 20, c[1] - 6 + (i % 2) * 8], [c[0] - 46 + i * 20, c[1] + 4 - (i % 2) * 8], DARK, 1.6); return s + qmark(c[0], c[1] - 50, K(u, 0.3, 0.6), 70); });
  // 16 — so you dig a well down to the water under the sand, and pump it up with a solar pump
  shot(16, mv(360, 440, 1.1, 380, 440, 1.2), function (u, d, t) {
    FULL(); var wk = ease(K(u, 0.2, 0.8)), s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: wk }) + sun(540, 110, t, 1);
    var inner = '<rect x="-120" y="-120" width="240" height="240" fill="' + SANDC + '"/><rect x="-120" y="-20" width="240" height="60" fill="' + SANDD + '"/><rect x="-120" y="40" width="240" height="80" fill="' + COOL + '" opacity=".75"/><rect x="-10" y="-120" width="20" height="200" fill="#5a5046" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 6; i++) { var q = (t * 0.6 + i / 6) % 1; inner += '<circle cx="0" cy="' + f(70 - q * 190) + '" r="4" fill="#9fc3dc"/>'; }
    var w = P(8.4, 7.6, 0); s += inset(150, 560, 95, inner, K(u, 1.0, 0.6));
    return s + label(w[0], w[1], 520, 690, "بير", OLIVE, K(u, 0.5), 22) + label(P(9.5, 9.1, 1.4)[0], P(9.5, 9.1, 1.4)[1], 560, 520, "طلمبة بالشمس", PB, K(u, 2.0), 18);
  });
  // 17 — and on the roof, solar panels charge a battery to light the night and run a fan and a phone
  shot(17, mv(380, 340, 1.2, 330, 400, 1.0), function (u, d, t) {
    FULL(); var pk = ease(K(u, 0.2, 0.8)), n = K(u, 2.4, 0.8), s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: 1, panels: pk, lamp: n }) + nightTint(n) + moon(520, 110, n) + sun(540, 110, t, 1 - n);
    var p = P(6.2, 3.3, 3.7); return s + label(p[0], p[1], 560, 180, "ألواح شمسية", PB, K(u, 0.6), 20) + label(P(4.95, 5, 1.95)[0], P(4.95, 5, 1.95)[1], 130, 650, "نور بالليل", "#e8803a", K(u, 2.8), 20);
  });
  // 18 — but without a fridge, food spoils in the heat
  shot(18, mv(320, 420, 1.0, 320, 420, 1.08), function (u, d, t) {
    var s = paper() + sun(540, 110, t, 1), rot = K(u, 0.6, 1.6);
    s += '<ellipse cx="320" cy="520" rx="200" ry="50" fill="#c9a26a" stroke="' + INK + '" stroke-width="3"/><path d="M120 520 Q130 600 320 610 Q510 600 520 520" fill="#b98f5a" stroke="' + INK + '" stroke-width="3"/>';
    [[250, 470, "#c4532c"], [320, 455, "#c4532c"], [390, 470, LANDD], [285, 500, "#e8b04a"], [360, 500, "#c4532c"]].forEach(function (v, i) { s += circ(v[0], v[1], 34, rot > 0.5 && i % 2 === 0 ? "#6a4a2a" : v[2], 2.4); });
    s += heatWaves([[250, 430], [360, 420]], t, K(u, 0.2, 0.6)) + thermo(110, 260, 0.85, HEAT, K(u, 0.2, 0.5));
    return s + crossMark(320, 330, 1.1, K(u, 1.6, 0.5));
  });
  // 19 — so you make a zeer cooler: a clay pot inside a bigger clay pot, with wet sand between them
  function zeerSection(t, k, evap) { var s = '<path d="M140 260 L500 260 L470 640 Q320 680 170 640 Z" fill="' + CLAY + '" stroke="' + INK + '" stroke-width="3"/><path d="M165 280 L475 280 L450 620 Q320 650 190 620 Z" fill="' + SANDD + '" stroke="' + INK + '" stroke-width="2"/><path d="M165 280 L475 280 L450 620 Q320 650 190 620 Z" fill="' + COOL + '" opacity="' + f(0.35 * k) + '"/>';
    s += '<path d="M215 300 L425 300 L405 580 Q320 600 235 580 Z" fill="#d9905a" stroke="' + INK + '" stroke-width="3"/>'; [[290, 480, "#c4532c"], [350, 470, LANDD], [320, 530, "#c4532c"], [270, 540, "#e8b04a"], [370, 535, LANDD]].forEach(function (v) { s += circ(v[0], v[1], 28, v[2], 2.4); });
    s += '<path d="M120 255 Q320 230 520 255 L520 270 Q320 250 120 270 Z" fill="#efe6d2" stroke="' + INK + '" stroke-width="2"/>';
    if (evap > 0) for (var i = 0; i < 10; i++) { var q = (t * 0.6 + i / 10) % 1, side = i % 2 ? 1 : -1, y = 320 + (i % 5) * 60; s += '<path d="M' + f(320 + side * (185 + q * 120)) + ' ' + f(y - q * 30) + ' q' + (side * 8) + ' -8 ' + (side * 16) + ' 0" stroke="' + COOL + '" stroke-width="3" fill="none" opacity="' + f(evap * Math.sin(q * Math.PI)) + '"/>'; }
    return s; }
  shot(19, mv(320, 440, 1.0, 320, 450, 1.08), function (u, d, t) { var s = paper() + zeerSection(t, ease(K(u, 1.4, 0.8)), 0); return s + label(195, 450, 80, 330, "رملة مبلولة", COOL, K(u, 1.6), 20) + label(320, 300, 470, 160, "قصرية جوه قصرية", CLAY, K(u, 0.4), 20); });
  // 20 — as the water evaporates it pulls the heat out, so vegetables last days longer
  shot(20, mv(320, 450, 1.08, 320, 440, 1.0), function (u, d, t) { var s = paper() + zeerSection(t, 1, K(u, 0.2, 0.6)); s += flow([[320, 470], [240, 400], [100, 330]], HEAT, K(u, 0.8, 0.5), t, 5) + flow([[330, 470], [410, 400], [540, 330]], HEAT, K(u, 0.8, 0.5), t, 5); return s + tick(320, 170, 1.2, K(u, 1.8, 0.5)) + label(520, 360, 540, 700, "بتسحب الحرارة", HEAT, K(u, 1.0), 18); });
  // 21 — many people think this is old talk that doesn't work today
  shot(21, mv(320, 400, 1.06, 330, 380, 1.12), function (u, d, t) { FULL(); var s = paper() + '<g opacity=".8">' + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1 }) + '</g><rect x="-600" y="-600" width="1840" height="2000" fill="#b98f5a" opacity=".18"/>'; return s + qmark(520, 180, K(u, 0.4, 0.6), 80) + label(P(2.9, 2.5, 5.4)[0], P(2.9, 2.5, 5.4)[1], 140, 160, "قديم؟", ORANGE, K(u, 0.8), 26); });
  // 22 — in fact the Egyptian architect Hassan Fathy built a whole village with it in Luxor: mud, domes and no wood
  shot(22, mv(300, 420, 1.0, 340, 400, 1.08), function (u, d, t) {
    isoAt(320, 300, 9); var s = paper() + isoFace([[-20, -20, 0], [40, -20, 0], [40, 36, 0], [-20, 36, 0]], SANDC, "", 1.4);
    var hs = [[0, 0], [10, -4], [20, -8], [-6, 10], [4, 6], [14, 2], [-12, 20], [-2, 16], [8, 12]];
    hs.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
    hs.forEach(function (h, i) { var k = pop(K(u, 0.2 + i * 0.12, 0.5)); if (k <= 0) return; s += isoShadow(h[0], h[1], 7, 6) + mudBox(h[0], h[1], 0, 7, 6, 3.2 * k) + (k >= 1 ? (i % 3 === 1 ? isoBox(h[0] + 0.5, h[1] + 1, 3.2, 6, 4, 0.2, [MUDL, MUD, MUDD]) + dome(h[0] + 3.5, h[1] + 3, 3.2, 2.2, 0.9) : dome(h[0] + 3.5, h[1] + 3, 3.2, 2.5, 1)) + isoFace([[h[0] + 7, h[1] + 2, 0], [h[0] + 7, h[1] + 3.2, 0], [h[0] + 7, h[1] + 3.2, 2], [h[0] + 7, h[1] + 2, 2]], WOOD, "", 1.2) : ""); });
    s += palm(30, -6, 8, t, 1) + palm(-16, 30, 7, t, 1);
    return s + numBox("حسن فتحي", 320, 620, K(u, 1.6, 0.6), 26) + T("القرنة الجديدة – الأقصر", 320, 690, 24, OLIVE, 800);
  });
  // 23 — add palms around the house for shade, a water jar at the door, and a wall that holds back the sand
  shot(23, mv(330, 420, 0.92, 330, 410, 0.85), function (u, d, t) { FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: 1, panels: 1, zeer: 1, palms: ease(K(u, 0.2, 1.0)), jarDoor: K(u, 1.4, 0.1) > 0, fence: ease(K(u, 2.4, 1.0)) }); return s + label(P(12.5, -1.5, 6)[0], P(12.5, -1.5, 6)[1], 560, 120, "نخل", LANDD, K(u, 0.6), 22) + label(P(10.9, 6, 0.9)[0], P(10.9, 6, 0.9)[1], 560, 640, "زير", CLAY, K(u, 1.6), 22) + label(P(-3, 4, 1.6)[0], P(-3, 4, 1.6)[1], 80, 260, "سور", OLIVE, K(u, 2.6), 22); });
  // 24 — and congratulations: you've built a house in the desert without a single power line from outside
  shot(24, mv(330, 380, 1.15, 330, 420, 0.85), function (u, d, t) { FULL(); var s = paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: 1, panels: 1, zeer: 1, palms: 1, jarDoor: true, fence: 1 }) + sun(540, 110, t, 1), op = P(MQ.x + 0.8, MQ.y + MQ.w, 6.6); return s + flow([[op[0] - 220, op[1] - 100], [op[0] - 100, op[1] - 50], [op[0] - 10, op[1] - 6]], COOL, 1, t, 5); });
  // 25 is the summary card; keep the panel valid behind it
  shot(25, mv(330, 420, 0.85, 330, 420, 0.85), function (u, d, t) { FULL(); return paper() + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: 1, panels: 1, zeer: 1, palms: 1, jarDoor: true, fence: 1 }); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__outro = function (svg, u, t) {
    isoAt(300, 150, 11); var s = '<rect width="580" height="300" fill="#e4d9bf"/>' + house(t, { dome: 1, malqaf: 1, jars: 1, win: 1, well: 1, panels: 1, zeer: 1, palms: 1, jarDoor: true, fence: 1 });
    var pts = [[P(0, 10.5, 1), "1"], [P(2.9, 2.5, 5.4), "2"], [P(MQ.x + 0.8, MQ.y + 0.8, 7.6), "3"], [P(6.5, 7.5, 0), "4"], [P(8.4, 7.6, 0.7), "5"], [P(2, 8.6, 0.8), "6"]];
    pts.forEach(function (c, i) { s += callout(c[1], c[0][0] + 16, c[0][1] - 12, (u - 0.3 - i * 0.15) / 0.6); });
    s += '<rect width="580" height="300" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    svg.style.transform = 'scale(' + f(1 + 0.04 * Math.sin(t * 1.4)) + ') translateY(' + f(4 * Math.sin(t * 1.1)) + 'px)';
    svg.innerHTML = s;
  };
  window.__parts = { house: house, ground: ground, dome: dome, malqaf: malqaf, palm: palm, zeer: zeer, well: well, panels: panels, mudBox: mudBox, label: label, T: T, TS: TS, numBox: numBox, isoAt: isoAt, iso: iso, MQ: MQ, flow: flow, sun: sun };
})();
