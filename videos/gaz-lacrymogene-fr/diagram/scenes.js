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
  function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans;fill:' + (col || INK) + '">' + text + '</text>'; }
  // a leader-line label: dot on the part (px,py), line to (lx,ly), text beyond it; k (0..1) draws it in
  function label(px, py, lx, ly, text, col, k, sz) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 21;
    var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tw = text.length * sz * 0.5, tx = lx + (left ? -8 : 8), ty = ly + sz * 0.35;
    if (!left && lx + tw > 630) { left = true; tx = lx; ty = ly - 10; } else if (left && lx - tw < 10) { left = false; tx = lx; ty = ly - 10; }
    var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="4" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, left ? "end" : "start")   /* the page is RTL: "start" is the right-hand end */ + '</g>';
    return s;
  }
  function callout(n, x, y, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + T(n, 0, 6, 16, INK, 700) + '</g>'; }
  function crossMark(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * s) + ')"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + ORANGE + '" stroke-width="13" stroke-linecap="round"/></g>'; }
  function numBox(text, x, y, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = text.length * sz * 0.62 + 24; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-sz * 0.95) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" rx="5" fill="' + INK + '"/><text x="0" y="' + f(sz * 0.32) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans;fill:#fff;direction:ltr">' + text + '</text></g>'; }
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
  // ── «Gaz lacrymogène : comment ça marche ?» (دايجرام, French). A health and safety explainer. Objects follow real shapes
  // (../refs/SOURCES.md): a cylindrical smoke canister with vent holes, CS powder, the eye and its tear film, a saline
  // dosette, everyday kitchen items. Running motif: the eye, and the grey particle cloud.
  var DARK = "#41392f", SKY = "#b9bfbb", LAND = "#c5cb9e", LANDD = "#8e9f6a", PB = "#4f7a9a", SAND = "#d9b9a0",
      ASPH = "#b5b0a3", WALL = "#d9c3a8", WALLD = "#c4ad90", SMOKE = "#9a968c", SMOKEL = "#cfcabd", WATER = "#8fb0c4", LEMON = "#d9c26a", MILK = "#f4efe0", MAST = "#9a968c";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function TS(text, x, y, sz, col, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:700 ' + sz + 'px Noto Serif, DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + '">' + text + '</text>'; }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function circ(x, y, r, fill, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function poly(pts, fill, sw, hatch) { var d = 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z'; return '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"/>' + (hatch ? '<path d="' + d + '" fill="url(#' + hatch + ')"/>' : ''); }
  function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || "none") + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round" stroke-linecap="round"' + (ex || '') + '/>'; }
  function line(x1, y1, x2, y2, col, w, ex) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" stroke-linecap="round"' + (ex || '') + '/>'; }
  function chapter(n, k) { k = pop(k); if (k <= 0) return ""; var s = circ(0, 0, 26, PAPER, 2.2) + TS(String(n), 0, 11, 30, ORANGE); for (var i = 0; i < 4; i++) s += circ(-27 + i * 18, 44, 5, i < n ? (i === n - 1 ? ORANGE : DARK) : PAPER, 1.4); return fixed(G(70, 80, k, 0, s)); }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("?", 0, 0, sz || 60, ORANGE)); }
  function bigNum(n, unit, x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return fixed(G(x, y, k, 0, TS(n, 0, 0, sz || 64, ORANGE) + T(unit, 0, 30, 20, INK, 700))); }
  function check(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G(x, y, k * s, 0, '<path d="M-26 0 L-8 20 L28 -24" stroke="' + OLIVE + '" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); }

  // ── the particle cloud (CS powder in the air): drifting dots + soft grey puffs; k grows it
  function cloud(cx, cy, rx, ry, t, n, k, o) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; o = o || {}; var s = "";
    for (var j = 0; j < 5; j++) s += '<ellipse cx="' + f(cx + (hash(j + 40) - 0.5) * rx * 1.2 + 12 * Math.sin(t * 0.6 + j)) + '" cy="' + f(cy + (hash(j + 50) - 0.5) * ry + 6 * Math.cos(t * 0.5 + j)) + '" rx="' + f(rx * (0.4 + 0.25 * hash(j)) * k) + '" ry="' + f(ry * (0.45 + 0.2 * hash(j + 3)) * k) + '" fill="' + SMOKEL + '" opacity="' + f(0.55 * k) + '" filter="url(#soft)"/>';
    for (var i = 0; i < n; i++) {
      var fall = o.fall ? ((t * o.fall * (0.6 + 0.6 * hash(i + 9)) + hash(i + 2)) % 1) * ry * 1.4 : 0;
      var px = cx + (hash(i) - 0.5) * 2 * rx * (0.5 + 0.5 * k) + 14 * Math.sin(t * 0.8 + i * 1.7) + (o.drift ? (t * o.drift) % 60 - 30 : 0), py = cy + (hash(i + 7) - 0.5) * 2 * ry * (0.5 + 0.5 * k) + 10 * Math.cos(t * 0.7 + i) + fall;
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2 + 3.4 * hash(i + 11)) + '" fill="' + (o.col || SMOKE) + '" opacity="' + f(0.75 * k) + '"/>';
    }
    return s;
  }
  // smoke stream rising from (x,y): particles flow up and spread
  function plume(x, y, t, n, h, k) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = "";
    for (var i = 0; i < n; i++) { var q = (t * 0.45 + hash(i)) % 1, sp = 10 + q * 90; s += '<circle cx="' + f(x + (hash(i + 4) - 0.5) * sp + 18 * Math.sin(t * 1.3 + i)) + '" cy="' + f(y - q * h) + '" r="' + f((3 + 9 * q) * k) + '" fill="' + (q > 0.4 ? SMOKEL : SMOKE) + '" opacity="' + f(0.8 * (1 - q) * k) + '" stroke="' + INK + '" stroke-width="' + f(0.6 * (1 - q)) + '"/>'; }
    return s;
  }

  // ── the eye, front view (centre 0,0; about 260 wide). o: red (0..1), blink (0 open .. 1 shut), tears, look
  function eye(t, o) {
    o = o || {}; var bl = clamp(o.blink || 0), id = "ey" + (++CLIPN), red = clamp(o.red || 0), lx = (o.look || 0) * 20;
    var alm = "M-125 0 Q0 -96 125 0 Q0 92 -125 0 Z", s = '<ellipse cx="0" cy="10" rx="190" ry="150" fill="' + SKIN + '" stroke="none"/><ellipse cx="0" cy="10" rx="190" ry="150" fill="url(#hatch)" opacity=".5"/>';
    s += P("M-150 -96 Q-10 -150 150 -92", "none", 9) ;
    s += '<clipPath id="' + id + '"><path d="' + alm + '"/></clipPath><path d="' + alm + '" fill="' + (red > 0 ? "#efd6c8" : BONE) + '"/>';
    s += '<g clip-path="url(#' + id + ')">' + (red > 0 ? '<path d="' + alm + '" fill="#d98d78" opacity="' + f(red * 0.55) + '"/>' : '');
    for (var v = 0; v < 6 && red > 0.2; v++) { var a = v * 1.05 + 0.3; s += P("M" + f(Math.cos(a) * 120) + " " + f(Math.sin(a) * 60) + " Q" + f(Math.cos(a) * 80 + 10) + " " + f(Math.sin(a) * 40 + 8) + " " + f(Math.cos(a) * 52) + " " + f(Math.sin(a) * 30), "none", 1.4, ' stroke="' + ORANGE + '" opacity="' + f(red) + '"'); }
    s += circ(lx, 0, 46, PB, 2) + '<circle cx="' + f(lx) + '" cy="0" r="46" fill="url(#hatch)"/>' + circ(lx, 0, 19 + 3 * Math.sin(t * 2), DARK, 0) + circ(lx + 14, -14, 7, "#fff", 0);
    s += '<path d="M-130 ' + f(-110) + ' L130 -110 L130 ' + f(lerp(-120, 0, bl)) + ' Q0 ' + f(lerp(-96, 70, bl)) + ' -130 ' + f(lerp(-120, 0, bl)) + ' Z" fill="' + SKIN + '"/>';
    s += '</g><path d="' + alm + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
    s += P("M-125 0 Q0 " + f(lerp(-96, 70, bl)) + " 125 0", "none", 3.4);
    for (var l = 0; l < 7; l++) { var lxp = -90 + l * 30, ly = lerp(-72, 50, bl) * (1 - Math.pow(lxp / 125, 2)) ; s += line(lxp, ly, lxp + (lxp - 0) * 0.08, ly - 16, INK, 2); }
    if (o.tears) for (var j = 0; j < 3; j++) { var q = (t * 0.7 + j / 3) % 1, ty = 20 + q * 170, tx = -112 + 6 * Math.sin(q * 6); s += '<path d="M' + f(tx) + ' ' + f(ty - 14) + ' Q' + f(tx + 9) + ' ' + f(ty) + ' ' + f(tx) + ' ' + f(ty + 6) + ' Q' + f(tx - 9) + ' ' + f(ty) + ' ' + f(tx) + ' ' + f(ty - 14) + ' Z" fill="' + WATER + '" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(1 - q * 0.8) + '"/>'; }
    return s;
  }

  // ── a head in profile, facing right (about 300 tall, origin at the neck base centre). o: tears, drip, cough, tilt
  function head(t, o) {
    o = o || {}; var s = P("M-70 120 C-110 40 -120 -120 -40 -160 C40 -190 104 -130 100 -60 L104 -40 L126 -6 L106 2 L108 22 Q104 30 108 40 L98 50 Q102 72 80 76 L40 80 L34 120 Z", SKIN, 2.2);
    s += '<path d="M-70 120 C-110 40 -120 -120 -40 -160 C-80 -100 -84 20 -40 120 Z" fill="url(#hatch)"/>';
    s += P("M-60 -150 C0 -190 90 -160 100 -90 C60 -120 0 -130 -60 -100 Z", DARK, 1.6);
    s += P("M66 -52 Q80 -60 92 -50 Q80 -42 66 -52 Z", BONE, 1.6) + circ(82, -51, 4, DARK, 0) + P("M62 -66 Q80 -76 96 -66", "none", 2.4);
    s += P("M14 -40 Q-6 -30 0 -10 Q12 0 20 -14", "none", 1.6);
    if (o.tears) for (var j = 0; j < 3; j++) { var q = (t * 0.8 + j / 3) % 1; s += circ(88 + q * 6, -42 + q * 90, 5 * (1 - q * 0.4), WATER, 1.2); }
    if (o.drip) { var q2 = (t * 0.6) % 1; s += circ(118, 8 + q2 * 60, 4.5, WATER, 1.2); }
    if (o.cough) for (var c = 0; c < 3; c++) { var q3 = (t * 1.2 + c / 3) % 1; s += P("M" + f(114 + q3 * 60) + " " + f(30 - 14 - q3 * 10) + " Q" + f(124 + q3 * 60) + " 40 " + f(114 + q3 * 60) + " " + f(54 + q3 * 10), "none", 2.2, ' opacity="' + f(1 - q3) + '"'); }
    return s;
  }
  // a neutral standing person (side elevation, feet at 0,0, about 170 tall); o: col, walk phase, h (height scale), cane, inhaler
  function personSide(t, o) {
    o = o || {}; var h = o.h || 1, col = o.col || PUTTY, w = o.walk ? Math.sin(t * 7) * 14 : 0, s = "";
    s += line(-6, -70 * h, -6 - w, 0, DARK, 9) + line(6, -70 * h, 6 + w, 0, DARK, 9);
    s += P("M-22 " + f(-140 * h) + " Q0 " + f(-150 * h) + " 22 " + f(-140 * h) + " L18 " + f(-66 * h) + " L-18 " + f(-66 * h) + " Z", col, 2);
    s += circ(0, -160 * h - 4, 20 * Math.sqrt(h), SKIN, 2);
    if (o.cane) s += line(26, -100 * h, 40, 0, DARK, 4) + P("M14 " + f(-100 * h) + " Q26 " + f(-112 * h) + " 30 " + f(-100 * h), "none", 4);
    if (o.inhaler) s += G(30, -150 * h, 1, -20, R(-8, -14, 16, 26, PB, 1.6, 4) + R(-6, 12, 18, 8, PB, 1.6, 2));
    return s;
  }
  // iso: a small person standing at (x,y); walking moves the legs
  function isoPerson(x, y, col, t, walk) {
    var b = iso(x, y, 0), s = ISO.s, w = walk ? Math.sin(t * 7 + x) * 3 * s : 0;
    return '<ellipse cx="' + f(b[0] + 3) + '" cy="' + f(b[1] + 2) + '" rx="' + f(7 * s) + '" ry="' + f(3.5 * s) + '" fill="' + INK + '" opacity=".14"/>' +
      line(b[0] - 2 * s, b[1] - 10 * s, b[0] - 2 * s - w, b[1], DARK, 2.6 * s) + line(b[0] + 2 * s, b[1] - 10 * s, b[0] + 2 * s + w, b[1], DARK, 2.6 * s) +
      R(b[0] - 5 * s, b[1] - 24 * s, 10 * s, 15 * s, col || PUTTY, 1.4, 3 * s) + circ(b[0], b[1] - 29 * s, 4.6 * s, SKIN, 1.4);
  }
  // iso: a street with a pavement and building fronts along the back
  function isoStreet(t, o) {
    o = o || {}; var s = isoFloor(-60, -60, 420, 360, ASPH) + isoFace([[-60, -60, 0], [360, -60, 0], [360, -10, 0], [-60, -10, 0]], WALL, "", 1.4);
    for (var m = 0; m < 6; m++) s += isoFace([[-40 + m * 70, 120, 0.2], [-10 + m * 70, 120, 0.2], [-10 + m * 70, 126, 0.2], [-40 + m * 70, 126, 0.2]], PAPER, "", 0.8);
    for (var b = 0; b < 4; b++) { var bx = -60 + b * 105, hh = [190, 150, 210, 170][b]; s += isoBox(bx, -120, 0, 100, 60, hh, [BONE, WALL, WALLD], 1.6);
      for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) s += isoFace([[bx + 14 + c * 30, -60, 30 + r * 40], [bx + 30 + c * 30, -60, 30 + r * 40], [bx + 30 + c * 30, -60, 54 + r * 40], [bx + 14 + c * 30, -60, 54 + r * 40]], SKY, "", 1); }
    return s;
  }
  // the canister, iso, standing at (x,y): body, cap, vent holes, optional plume
  function isoCanister(x, y, t, o) {
    o = o || {}; var s = isoShadow(x - 14, y - 14, 28, 28, 0.15) + isoCyl(x, y, 0, 14, 48, LANDD, "#a8b47e") + isoCyl(x, y, 48, 10, 10, DARK, "#6a6458");
    for (var v = 0; v < 3; v++) { var p = iso(x + 10, y - 6 + v * 6, 52); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(2.2 * ISO.s) + '" ry="' + f(1.4 * ISO.s) + '" fill="' + INK + '"/>'; }
    var band = iso(x, y, 30); s += '<path d="M' + f(band[0] - 17 * ISO.s) + ' ' + f(band[1]) + ' A' + f(17 * ISO.s) + ' ' + f(9.9 * ISO.s) + ' 0 0 0 ' + f(band[0] + 17 * ISO.s) + ' ' + f(band[1]) + '" stroke="' + PAPER + '" stroke-width="' + f(3 * ISO.s) + '" fill="none"/>';
    if (o.plume) { var tp = iso(x, y, 60); s += plume(tp[0], tp[1], t, 26, o.plume, 1); }
    return s;
  }
  // the canister in section (side elevation), centre (0,0), about 150 x 300: walls hatched, charge, powder, vents
  function canisterSection(t, o) {
    o = o || {}; var s = R(-75, -130, 150, 260, PAPER, 2.4, 10) + '<rect x="-75" y="-130" width="12" height="260" fill="url(#hatch)"/><rect x="63" y="-130" width="12" height="260" fill="url(#hatch)"/>' + line(-63, -130, -63, 130, INK, 1.2) + line(63, -130, 63, 130, INK, 1.2);
    var glow = clamp(o.heat || 0); s += R(-63, 60, 126, 58, ORANGE, 1.4) + '<rect x="-63" y="60" width="126" height="58" fill="url(#hatchW)"/>';
    if (glow > 0) s += '<ellipse cx="0" cy="70" rx="110" ry="60" fill="url(#glowO)" opacity="' + f(glow * (0.7 + 0.3 * Math.sin(t * 9))) + '"/>';
    s += R(-63, -60, 126, 120, "#e6e2d6", 1.2); for (var i = 0; i < 70; i++) s += '<circle cx="' + f(-56 + hash(i) * 112) + '" cy="' + f(-54 + hash(i + 30) * 108 - (glow > 0 ? ((t * 40 + hash(i + 5) * 100) % 110) * glow * 0.4 : 0)) + '" r="2.4" fill="' + SMOKE + '"/>';
    s += R(-75, -160, 150, 30, DARK, 2, 6) + R(-30, -186, 60, 26, DARK, 2, 4);
    for (var v = 0; v < 4; v++) s += R(-58 + v * 34, -150, 14, 10, PAPER, 1);
    return s;
  }
  // iso items for the myths
  function isoLemon(x, y, t) { var p = iso(x, y, 14), b = Math.sin(t * 2.2) * 2; return isoShadow(x - 12, y - 8, 24, 16, 0.12) + G(p[0], p[1] + b, ISO.s, -12, '<ellipse rx="26" ry="18" fill="' + LEMON + '" stroke="' + INK + '" stroke-width="2"/><ellipse rx="26" ry="18" fill="url(#hatch)" opacity=".5"/><path d="M24 -2 l8 -2 l-2 6 Z" fill="' + LEMON + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M-12 -8 Q-4 -12 4 -10" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>'); }
  function isoBottle(x, y, fill, cap, txt) { var s = isoShadow(x - 10, y - 10, 20, 20, 0.14) + isoCyl(x, y, 0, 10, 52, fill, "#e7e2d2") + isoCyl(x, y, 52, 4, 14, fill, "#e7e2d2") + isoCyl(x, y, 66, 4.6, 6, cap, cap); var p = iso(x, y + 10, 26); return s + (txt ? G(p[0] - 6, p[1], 1, -30, T(txt, 0, 0, 10, INK, 800)) : ""); }
  function isoTube(x, y, t) { var p = iso(x, y, 6); return isoShadow(x - 26, y - 6, 52, 12, 0.12) + G(p[0], p[1], ISO.s, 28, P("M-46 -9 L30 -12 L46 -4 L46 4 L30 12 L-46 9 Z", BONE, 2) + R(46, -6, 10, 12, ORANGE, 1.4, 2) + '<path d="M-46 -9 L30 -12 L46 -4 L46 4 L30 12 L-46 9 Z" fill="url(#hatch)" opacity=".4"/>' + line(-40, -9, -40, 9, INK, 1.4) + line(-34, -10, -34, 10, INK, 1.4) + R(-20, -5, 36, 10, PB, 1)); }
  function isoGlass(x, y, t) { var s = isoShadow(x - 10, y - 10, 20, 20, 0.12) + isoCyl(x, y, 0, 11, 40, "#dfe7ea", "#c9dbe4"); var p = iso(x, y, 32); return s + '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1] + Math.sin(t * 3) * 1.2) + '" rx="' + f(11 * 1.2247 * ISO.s) + '" ry="' + f(11 * 0.7071 * ISO.s) + '" fill="' + WATER + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
  function isoCarton(x, y) {
    var s = isoShadow(x, y, 26, 26, 0.14) + isoBox(x, y, 0, 26, 26, 60, [MILK, MILK, "#dcd5c3"]);
    s += isoFace([[x, y, 60], [x + 26, y, 60], [x + 26, y + 13, 74], [x, y + 13, 74]], MILK, "", 1.6) + isoFace([[x, y + 26, 60], [x + 26, y + 26, 60], [x + 26, y + 13, 74], [x, y + 13, 74]], "#dcd5c3", "hatch", 1.6) + isoFace([[x, y + 13, 74], [x + 26, y + 13, 74], [x + 26, y + 13, 80], [x, y + 13, 80]], MILK, "", 1.4);
    return s + isoFace([[x, y + 26, 16], [x + 26, y + 26, 16], [x + 26, y + 26, 40], [x, y + 26, 40]], PB, "", 1.2);
  }
  function lungs(k, t) { var b = 1 + 0.06 * Math.sin(t * 3); return G(0, 0, b, 0, line(0, -70, 0, -26, DARK, 8) + P("M-6 -26 C-30 -40 -76 -20 -78 30 C-80 70 -40 80 -14 64 C-6 40 -6 0 -6 -26 Z", "#d98d78", 2, ' opacity="1"') + P("M6 -26 C30 -40 76 -20 78 30 C80 70 40 80 14 64 C6 40 6 0 6 -26 Z", "#d98d78", 2) + '<path d="M-6 -26 C-30 -40 -76 -20 -78 30 C-80 70 -40 80 -14 64 Z" fill="url(#hatch)"/>'); }
  function phone(t, num) {
    var s = R(-90, -170, 180, 340, DARK, 2.4, 22) + R(-78, -150, 156, 290, "#e9e4d6", 1.4, 8) + R(-24, -164, 48, 6, "#6a6458", 0, 3);
    for (var r = 0; r < 3; r++) { var q = (t * 0.9 + r / 3) % 1; s += '<circle cx="0" cy="-50" r="' + f(40 + q * 60) + '" fill="none" stroke="' + ORANGE + '" stroke-width="3" opacity="' + f(1 - q) + '"/>'; }
    s += TS(num, 0, -26, 74, ORANGE) + T("SAMU", 0, 22, 20, INK, 800);
    s += circ(0, 100, 26, OLIVE, 2) + G(0, 100, 1, 135 + 10 * Math.sin(t * 8), P("M-12 -6 Q0 -14 12 -6 L10 2 L4 0 L4 -4 Q0 -6 -4 -4 L-4 0 L-10 2 Z", PAPER, 1.4));
    return s;
  }
  function doc(t, k) {
    var s = R(-200, -250, 400, 500, BONE, 2.4, 4) + '<rect x="-200" y="-250" width="400" height="500" fill="url(#hatch)" opacity=".25"/>';
    s += T("CONVENTION", 0, -196, 26, INK, 900) + T("sur les armes chimiques", 0, -164, 18, INK, 700) + T("1993", 0, -128, 22, ORANGE, 800) + line(-160, -110, 160, -110, INK, 1.4);
    for (var i = 0; i < 6; i++) s += line(-160, -82 + i * 20, 160 - 60 * hash(i), -82 + i * 20, MAST, 4);
    return s;
  }
  function stamp(text, col, k, rot) { k = pop(k); if (k <= 0) return ""; var w = text.length * 13 + 40; return G(0, 0, k, rot || 0, '<rect x="' + f(-w / 2) + '" y="-30" width="' + f(w) + '" height="60" rx="6" fill="' + PAPER + '" fill-opacity=".85" stroke="' + col + '" stroke-width="5"/>' + T(text, 0, 9, 24, col, 900)); }
  function hand(t, o) { o = o || {}; return P("M-60 120 L-50 20 Q-50 -10 -30 -10 L-26 -90 Q-24 -110 -10 -110 Q4 -110 4 -90 L6 -40 L8 -100 Q10 -118 24 -118 Q38 -118 38 -100 L36 -40 L42 -88 Q44 -104 58 -104 Q70 -102 70 -86 L64 0 Q60 60 40 120 Z", SKIN, 2.2) + '<path d="M-60 120 L-50 20 Q-50 -10 -30 -10 L-20 120 Z" fill="url(#hatch)"/>'; }

  // ── 0 — hook: burning eye, tears, smoke drifting across
  shot(0, mv(320, 400, 1.18, 320, 380, 1.32), function (u, d, t) {
    var bl = Math.max(0, Math.sin(t * 2.6)) > 0.93 ? 0.85 : clamp(0.06 + 0.05 * Math.sin(t * 5));
    return paper() + G(320, 380, 1.15, 0, eye(t, { red: K(u, 0, 1.6), tears: u > 0.8, blink: bl })) + cloud(320, 170, 330, 120, t, 34, K(u, 0, 1.2), { drift: 50 }) + label(250, 420, 120, 600, "yeux", ORANGE, K(u, 1.8, 0.6));
  });
  // 1 — in the street these last weeks
  shot(1, mv(330, 420, 0.95, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + isoAt(250, 330, 1.25) + isoStreet(t);
    var ppl = [[40, 60], [70, 90], [100, 40], [140, 110], [180, 70], [210, 140], [250, 90], [60, 170], [130, 190]];
    ppl.forEach(function (p, i) { s += isoPerson(p[0] + 4 * Math.sin(t + i), p[1], [PUTTY, LANDD, PB, SAND][i % 4], t, true); });
    var c = iso(170, 120, 20); s += cloud(c[0], c[1] - 10, 200 * K(u, 0.4, 2) + 30, 90, t, 60, K(u, 0.3, 1.6), { drift: 30 }) + isoCanister(220, 170, t, { plume: 160 });
    return s + label(c[0] + 40, c[1] - 20, 520, 690, "dans la rue", OLIVE, K(u, 1.2, 0.6));
  });
  // 2 — what is it, and how do you protect your body?
  shot(2, mv(320, 400, 1.0, 320, 410, 1.1), function (u, d, t) {
    var s = paper() + isoAt(200, 520, 2.6) + isoCanister(0, 0, t, { plume: 230 }) + qmark(200, 170, K(u, 0.3, 0.5), 80);
    s += G(470, 640, 1.05, 0, personSide(t, { col: PB })) + qmark(470, 380, K(u, 1.2, 0.5), 80);
    return s + label(200, 470, 60, 700, "c'est quoi ?", ORANGE, K(u, 0.6, 0.6)) + label(470, 520, 600, 720, "ton corps", OLIVE, K(u, 1.4, 0.6));
  });
  // 3 — Comment ça marche ? (the motif in a circle)
  shot(3, mv(320, 400, 1.0, 320, 400, 1.08), function (u, d, t) {
    var id = "c3" + (++CLIPN);
    var s = paper() + '<clipPath id="' + id + '"><circle cx="320" cy="360" r="190"/></clipPath><circle cx="320" cy="360" r="190" fill="' + PAPER + '"/><g clip-path="url(#' + id + ')">' + G(320, 380, 0.85, 0, eye(t, { red: 0.4, tears: true, blink: 0.05 + 0.04 * Math.sin(t * 4) })) + cloud(320, 230, 220, 70, t, 24, 1, { drift: 40 }) + '</g><circle cx="320" cy="360" r="190" fill="none" stroke="' + INK + '" stroke-width="2.6"/>';
    return s + T("Comment ça marche ?", 320, 640, 34, INK, 900);
  });
  // 4 — chapter 1: it's not even a gas
  shot(4, mv(320, 400, 1.0, 320, 380, 1.12), function (u, d, t) {
    var s = paper() + chapter(1, K(u, 0, 0.4)) + cloud(320, 400, 260, 180, t, 90, 1, { drift: 20 });
    s += G(320, 400, 1, 0, TS("GAZ", 0, 40, 130, INK)) + crossMark(320, 360, 2.6, K(u, 1.1, 0.4));
    return s + inset(500, 640, 90, (function () { var z = ""; for (var i = 0; i < 20; i++) z += circ(-60 + hash(i) * 120 + 4 * Math.sin(t + i), -60 + hash(i + 5) * 120, 6 + 6 * hash(i + 9), "#e6e2d6", 1.6); return z; })(), K(u, 1.8, 0.5)) + label(440, 640, 120, 700, "poudre", ORANGE, K(u, 2.1, 0.5));
  });
  // 5 — a fine powder, CS, 1928, two chemists
  shot(5, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + isoAt(320, 560, 2.2) + isoCyl(0, 0, 0, 60, 6, PUTTY, BONE);
    var top = iso(0, 0, 6); s += P("M" + f(top[0] - 90) + " " + f(top[1]) + " Q" + f(top[0]) + " " + f(top[1] - 90) + " " + f(top[0] + 90) + " " + f(top[1]) + " Z", "#f2eee4", 2);
    for (var i = 0; i < 30; i++) s += circ(top[0] - 70 + hash(i) * 140, top[1] - 6 - hash(i + 3) * 50 * (1 - Math.abs(hash(i) - 0.5) * 1.6), 2, SMOKE, 0);
    s += plume(top[0], top[1] - 60, t, 10, 80, 0.6);
    s += TS("C", 220, 290, 120, ORANGE) + TS("S", 420, 290, 120, ORANGE);
    s += T("Corson", 220, 330, 22, BLUE, 800, "middle") + T("Stoughton", 420, 330, 22, BLUE, 800, "middle");
    return s + label(top[0] + 40, top[1] - 30, 560, 700, "CS", OLIVE, K(u, 0.5, 0.5)) + numBox("1928", 320, 150, K(u, 1.6, 0.4), 30);
  });
  // 6 — the canister: a small charge heats, the powder goes up in smoke
  shot(6, mv(320, 440, 0.95, 320, 400, 1.06), function (u, d, t) {
    var heat = K(u, 0.6, 1.0), s = paper() + G(300, 470, 1, 0, canisterSection(t, { heat: heat }));
    s += plume(300, 290, t, 40, 280, K(u, 1.4, 0.8));
    return s + label(300, 560, 500, 640, "charge", ORANGE, K(u, 0.6, 0.5)) + label(300, 470, 500, 470, "poudre CS", OLIVE, K(u, 1.4, 0.5)) + label(270, 260, 110, 150, "fumée", BLUE, K(u, 2.4, 0.5)) + fixed(T("des millions de particules", 320, 760, 22, INK, 800));
  });
  // 7 — heavier than air: the cloud stays low
  shot(7, mv(320, 420, 1.0, 330, 440, 1.1), function (u, d, t) {
    var s = paper() + R(-300, 600, 1240, 300, LAND, 2) + '<rect x="-300" y="600" width="1240" height="300" fill="url(#hatch)"/>';
    s += G(120, 600, 1.1, 0, personSide(t, { col: PB })) + cloud(400, 540, 260, 70, t, 70, 1, { drift: 20, fall: 0.15 });
    s += arrow(470, 260, 470, 420, ORANGE, 5, K(u, 0.4, 0.8)) + arrow(560, 300, 560, 440, ORANGE, 5, K(u, 0.7, 0.8));
    return s + label(400, 520, 420, 200, "plus lourd que l'air", ORANGE, K(u, 0.8, 0.6)) + label(300, 580, 200, 700, "près du sol", OLIVE, K(u, 1.8, 0.6));
  });
  // 8 — the eye's wet surface: particles land, pain sensors fire
  shot(8, mv(320, 420, 1.0, 320, 440, 1.12), function (u, d, t) {
    var s = paper() + R(-300, 470, 1240, 400, "#e3b9a5", 2) + R(-300, 440, 1240, 30, WATER, 2) + '<rect x="-300" y="470" width="1240" height="400" fill="url(#hatch)" opacity=".5"/>';
    for (var n = 0; n < 6; n++) { var x = 40 + n * 110, fire = Math.max(0, Math.sin(t * 4 + n * 1.3)); s += P("M" + x + " 760 L" + x + " 560 M" + x + " 600 L" + (x - 30) + " 500 M" + x + " 600 L" + (x + 30) + " 500 M" + x + " 560 L" + (x - 14) + " 490 M" + x + " 560 L" + (x + 14) + " 490", "none", 3, ' stroke="' + (fire > 0.6 ? ORANGE : OLIVE) + '"'); if (fire > 0.6) s += '<circle cx="' + x + '" cy="510" r="' + f(30 * fire) + '" fill="url(#glowO)"/>'; }
    for (var i = 0; i < 24; i++) { var q = (t * 0.5 + hash(i)) % 1, px = hash(i + 3) * 640; s += circ(px, lerp(120, 440, q), 5, SMOKE, 1); }
    return s + label(560, 455, 540, 360, "film de larmes", BLUE, K(u, 0.5, 0.5)) + label(150, 520, 120, 300, "capteurs de douleur", ORANGE, K(u, 1.3, 0.5));
  });
  // 9 — the same sensors as wasabi
  shot(9, mv(320, 400, 1.0, 320, 410, 1.08), function (u, d, t) {
    var s = paper() + isoAt(150, 300, 2.2) + isoCyl(0, 0, 0, 36, 4, BONE, BONE);
    var w = iso(0, 0, 4); s += P("M" + f(w[0] - 40) + " " + f(w[1]) + " Q" + f(w[0] - 20) + " " + f(w[1] - 50) + " " + f(w[0]) + " " + f(w[1] - 46) + " Q" + f(w[0] + 30) + " " + f(w[1] - 40) + " " + f(w[0] + 40) + " " + f(w[1]) + " Z", LANDD, 2);
    s += cloud(500, 230, 90, 60, t, 26, 1);
    s += R(160, 560, 320, 60, "#e3b9a5", 2) + R(290, 540, 60, 100, ORANGE, 2, 8) + '<rect x="290" y="540" width="60" height="100" fill="url(#hatchW)"/><ellipse cx="320" cy="590" rx="' + f(80 + 10 * Math.sin(t * 6)) + '" ry="60" fill="url(#glowO)" opacity=".6"/>';
    s += arrow(160, 360, 290, 540, OLIVE, 4, K(u, 0.3, 0.8)) + arrow(500, 300, 350, 540, SMOKE, 4, K(u, 0.6, 0.8));
    return s + label(130, 290, 60, 160, "wasabi", OLIVE, K(u, 0.2, 0.5)) + label(500, 210, 600, 120, "CS", SMOKE, K(u, 0.5, 0.5)) + label(320, 640, 470, 720, "même capteur", ORANGE, K(u, 1.2, 0.5));
  });
  // 10 — within seconds: tears, eyelids, cough, runny nose
  shot(10, mv(320, 400, 1.0, 330, 400, 1.06), function (u, d, t) {
    var s = paper() + G(280, 560, 1.4, 0, head(t, { tears: u > 0.8, drip: u > 2.4, cough: u > 1.8 }));
    var E = [[400, 490], [400, 470], [450, 610], [440, 570]];
    return s + callout(1, 470, 470, K(u, 0.6, 0.4)) + callout(2, 420, 380, K(u, 1.2, 0.4)) + callout(3, 560, 620, K(u, 1.8, 0.4)) + callout(4, 520, 520, K(u, 2.4, 0.4)) + bigNum("3 s", "quelques secondes", 120, 180, K(u, 0.1, 0.4), 56);
  });
  // 11 — it passes in about half an hour in fresh air
  shot(11, mv(320, 400, 1.0, 320, 390, 1.08), function (u, d, t) {
    var k = ease(K(u, 0.6, 2.2)), a = -Math.PI / 2 + k * Math.PI, s = paper();
    for (var w = 0; w < 4; w++) s += waveRay(-60, 160 + w * 140, 700, 160 + w * 140, t + w, "#9fb8cc", 8, 60, 1, 3);
    s += circ(320, 400, 170, BONE, 3) + '<path d="M320 400 L320 230 A170 170 0 ' + (k > 1 ? 1 : 0) + ' 1 ' + f(320 + Math.cos(a) * 170) + ' ' + f(400 + Math.sin(a) * 170) + ' Z" fill="' + LAND + '"/>';
    for (var i = 0; i < 12; i++) { var b = i * Math.PI / 6; s += line(320 + Math.cos(b) * 150, 400 + Math.sin(b) * 150, 320 + Math.cos(b) * 166, 400 + Math.sin(b) * 166, INK, 3); }
    s += line(320, 400, 320 + Math.cos(a) * 140, 400 + Math.sin(a) * 140, INK, 6) + circ(320, 400, 9, DARK, 0) + circ(320, 400, 170, "none", 3);
    return s + bigNum("≈ 30 min", "à l'air libre", 320, 680, K(u, 1.6, 0.4), 60) + label(240, 560, 80, 640, "air frais", BLUE, K(u, 0.4, 0.5));
  });
  // 12 — chapter 2: walk away from the cloud, don't push
  shot(12, mv(330, 420, 0.95, 320, 410, 1.06), function (u, d, t) {
    var s = paper() + chapter(2, K(u, 0, 0.4)) + isoAt(260, 300, 1.25) + isoStreet(t);
    var c = iso(250, 220, 20); s += cloud(c[0], c[1], 150, 80, t, 50, 1, { drift: 20 });
    var k = ease(K(u, 0.6, d - 0.8)), px = lerp(190, 30, k), py = lerp(190, 20, k);
    var a = iso(190, 190, 0), b = iso(30, 20, 0); s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + OLIVE + '" stroke-width="4" stroke-dasharray="10 10" stroke-dashoffset="' + f(-t * 30) + '"/>';
    s += isoPerson(px, py, ORANGE, t, true);
    [[120, 230], [80, 260], [150, 280]].forEach(function (p, i) { s += isoPerson(p[0] - k * 40, p[1] - k * 40, [PUTTY, PB, SAND][i], t, true); });
    var hp = iso(px, py, 30); return s + label(hp[0], hp[1], hp[0] - 100, hp[1] - 160, "en marchant", OLIVE, K(u, 1.0, 0.6));
  });
  // 13 — go upwind, and to higher ground
  shot(13, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + isoAt(330, 420, 1.6) + isoFloor(-80, -80, 260, 220, ASPH);
    for (var st = 0; st < 5; st++) s += isoBox(-80 + st * 0, -80 + 0, 0, 60, 120 - st * 20, 12 + st * 12, [BONE, WALL, WALLD], 1.4);
    var c = iso(150, 120, 20); s += cloud(c[0], c[1], 120, 60, t, 40, 1, { drift: 30 });
    for (var w = 0; w < 4; w++) { var q = (t * 0.6 + w / 4) % 1, p0 = iso(-80 + q * 0, 200 - q * 0, 40), y0 = 140 + w * 70; s += arrow(lerp(-60, 520, q), y0, lerp(-60, 520, q) + 90, y0 + 50, BLUE, 4, 1); }
    var k = ease(K(u, 0.5, d - 0.6)); s += isoPerson(lerp(40, -50, k), lerp(150, -50, k), ORANGE, t, true);
    var top = iso(-50, -50, 60);
    return s + label(560, 300, 600, 180, "vent", BLUE, K(u, 0.3, 0.5)) + label(top[0], top[1], top[0] - 60, top[1] - 160, "plus haut", OLIVE, K(u, 1.6, 0.5));
  });
  // 14 — don't rub your eyes
  shot(14, mv(320, 400, 1.05, 320, 400, 1.12), function (u, d, t) {
    var s = paper() + G(320, 330, 0.95, 0, eye(t, { red: 0.7, tears: true, blink: 0.3 }));
    var hy = lerp(760, 470, ease(K(u, 0, 0.8))) + 14 * Math.sin(t * 10); s += G(380, hy, 1.1, -14, hand(t));
    s += crossMark(320, 330, 2.6, K(u, 0.8, 0.4));
    return s + inset(520, 640, 100, R(-120, 0, 240, 120, "#e3b9a5", 2) + R(-120, -14, 240, 14, WATER, 1.6) + (function () { var z = ""; for (var i = 0; i < 8; i++) z += circ(-80 + i * 22, lerp(-40, 40, (t * 0.6 + hash(i)) % 1), 5, SMOKE, 1); return z; })(), K(u, 1.6, 0.5));
  });
  // 15 — rinse with plenty of clean water or saline, head tilted
  shot(15, mv(320, 410, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + G(300, 620, 1.3, 22, head(t, {}));
    var ex = 430, ey = 470; s += G(470, 220, 1, 150, R(-26, -60, 52, 90, "#e6eef2", 2, 10) + R(-10, 30, 20, 36, "#e6eef2", 2, 4) + '<rect x="-26" y="-20" width="52" height="30" fill="' + PB + '" opacity=".8"/>');
    var sx = 452, sy = 270; for (var i = 0; i < 18; i++) { var q = (t * 1.4 + i / 18) % 1; s += circ(lerp(sx, ex, q) + 6 * Math.sin(q * 9 + t), lerp(sy, ey, q), 5, WATER, 1); }
    for (var j = 0; j < 8; j++) { var q2 = (t * 1.1 + j / 8) % 1; s += circ(ex - 30 - q2 * 80, ey + 20 + q2 * 220, 5, WATER, 1); }
    return s + label(470, 200, 600, 120, "sérum physiologique", BLUE, K(u, 1.2, 0.5)) + label(440, 380, 130, 220, "eau propre", BLUE, K(u, 0.3, 0.5)) + label(330, 600, 130, 720, "tête penchée", OLIVE, K(u, 2.4, 0.5));
  });
  // 16 — contact lenses out, clean hands
  shot(16, mv(320, 420, 1.0, 320, 400, 1.1), function (u, d, t) {
    var s = paper() + G(420, 260, 0.7, 0, eye(t, { red: 0.4, blink: 0.04 }));
    var hy = lerp(780, 620, ease(K(u, 0, 1.0))); s += G(240, hy, 1.2, 10, hand(t));
    var tip = [262, hy - 140]; s += '<path d="M' + f(tip[0] - 26) + ' ' + f(tip[1]) + ' Q' + f(tip[0]) + ' ' + f(tip[1] - 34) + ' ' + f(tip[0] + 26) + ' ' + f(tip[1]) + ' Z" fill="#9fb8cc" fill-opacity=".7" stroke="' + INK + '" stroke-width="2"/>';
    for (var b = 0; b < 8; b++) { var q = (t * 0.4 + hash(b)) % 1; s += '<circle cx="' + f(120 + hash(b + 2) * 280 + 10 * Math.sin(t * 2 + b)) + '" cy="' + f(780 - q * 400) + '" r="' + f(8 + 10 * hash(b + 4)) + '" fill="none" stroke="' + BLUE + '" stroke-width="2" opacity="' + f(1 - q) + '"/>'; }
    return s + label(tip[0], tip[1] - 14, 80, 300, "lentilles", BLUE, K(u, 0.6, 0.5)) + label(200, hy - 40, 80, 720, "mains propres", OLIVE, K(u, 1.6, 0.5));
  });
  // 17 — chapter 3: lemon, vinegar, toothpaste?
  shot(17, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + chapter(3, K(u, 0, 0.4)) + isoAt(320, 380, 2.4) + isoBox(-70, -40, -14, 140, 90, 14, [WALL, WALLD, WALLD]);
    s += isoLemon(-40, 10, t) + isoBottle(10, -10, "#d8c9a0", ORANGE, "") + isoTube(30, 30, t);
    var p1 = iso(-40, 10, 30), p2 = iso(10, -10, 80), p3 = iso(30, 30, 20);
    return s + qmark(p1[0], p1[1] - 60, K(u, 0.4, 0.4), 50) + qmark(p2[0], p2[1] - 50, K(u, 0.9, 0.4), 50) + qmark(p3[0] + 40, p3[1] - 50, K(u, 1.5, 0.4), 50) +
      label(p1[0], p1[1], 80, 640, "citron", OLIVE, K(u, 0.4, 0.5)) + label(p2[0], p2[1] + 40, 330, 680, "vinaigre", OLIVE, K(u, 0.9, 0.5)) + label(p3[0] + 30, p3[1], 590, 620, "dentifrice", OLIVE, K(u, 1.5, 0.5));
  });
  // 18 — nope: they irritate more; water wins
  shot(18, mv(320, 420, 1.0, 320, 410, 1.06), function (u, d, t) {
    var s = paper() + isoAt(280, 420, 2.2) + isoBox(-70, -40, -14, 160, 90, 14, [WALL, WALLD, WALLD]);
    s += isoLemon(-40, 10, t) + isoBottle(10, -10, "#d8c9a0", ORANGE, "") + isoTube(30, 30, t) + isoGlass(70, -20, t);
    var p1 = iso(-40, 10, 30), p2 = iso(10, -10, 40), p3 = iso(30, 30, 10), p4 = iso(70, -20, 60);
    s += crossMark(p1[0], p1[1], 0.9, K(u, 0.5, 0.3)) + crossMark(p2[0], p2[1], 0.9, K(u, 0.8, 0.3)) + crossMark(p3[0] + 30, p3[1], 0.9, K(u, 1.1, 0.3)) + check(p4[0], p4[1] - 50, 1.4, K(u, 2.0, 0.4));
    return s + fixed(G(320, 150, pop(K(u, 0, 0.4)), 0, TS("Raté", 0, 0, 80, ORANGE))) + label(p4[0], p4[1], 560, 680, "eau", BLUE, K(u, 2.2, 0.5));
  });
  // 19 — milk: not sterile, can infect the eyes
  shot(19, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + isoAt(220, 480, 2.6) + isoCarton(-13, -13);
    s += inset(460, 360, 130, circ(0, 0, 110, "#efe9d8", 2) + (function () { var z = ""; for (var i = 0; i < 18; i++) { var a = hash(i) * 6.28, r = 20 + 70 * hash(i + 4), x = Math.cos(a) * r + 4 * Math.sin(t * 3 + i), y = Math.sin(a) * r; z += G(x, y, 1, hash(i + 8) * 180 + t * 20, R(-11, -4, 22, 8, OLIVE, 1.2, 4)); } return z; })(), K(u, 0.6, 0.5));
    s += crossMark(220, 330, 1.6, K(u, 1.4, 0.4));
    return s + label(220, 420, 80, 700, "lait", OLIVE, K(u, 0.2, 0.5)) + label(460, 480, 520, 680, "pas stérile", ORANGE, K(u, 1.0, 0.5));
  });
  // 20 — wash skin in cold water and soap, clothes separately
  shot(20, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + isoAt(280, 360, 2.0) + isoBox(-60, -40, 0, 120, 80, 60, [BONE, PUTTY, PUTTY]) + isoFace([[-50, -30, 60], [50, -30, 60], [50, 30, 60], [-50, 30, 60]], "#9fb8cc", "", 1.6);
    s += isoBox(-6, -40, 60, 12, 8, 40, [MAST, MAST, MAST]) + isoBox(-6, -40, 94, 12, 30, 6, [MAST, MAST, MAST]);
    var sp = iso(0, -14, 94); for (var i = 0; i < 10; i++) { var q = (t * 1.6 + i / 10) % 1; s += circ(sp[0] + Math.sin(i) * 2, sp[1] + q * 70, 4, WATER, 1); }
    var so = iso(30, 10, 60); s += G(so[0], so[1] - 6, 1, 0, R(-22, -10, 44, 20, LAND, 2, 8)); for (var b = 0; b < 5; b++) { var q2 = (t * 0.5 + b / 5) % 1; s += '<circle cx="' + f(so[0] - 20 + b * 10) + '" cy="' + f(so[1] - 20 - q2 * 70) + '" r="' + f(5 + 6 * q2) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.6" opacity="' + f(1 - q2) + '"/>'; }
    s += G(520, 620, 1, 4 * Math.sin(t * 1.5), P("M-60 70 L-50 -40 Q0 -70 50 -40 L60 70 Z", PB, 2) + '<path d="M-60 70 L-50 -40 Q0 -70 50 -40 L60 70 Z" fill="url(#hatchW)"/>' + P("M-20 -54 Q0 -90 20 -54", "none", 4));
    return s + label(sp[0], sp[1] + 40, 80, 160, "eau froide", BLUE, K(u, 0.4, 0.5)) + label(so[0], so[1], 120, 700, "savon", OLIVE, K(u, 1.0, 0.5)) + label(520, 560, 600, 420, "à part", ORANGE, K(u, 2.0, 0.5));
  });
  // 21 — chapter 4: trouble breathing, chest pain, eyes after an hour → call 15
  shot(21, mv(320, 410, 1.0, 320, 400, 1.06), function (u, d, t) {
    var s = paper() + chapter(4, K(u, 0, 0.4)) + G(450, 420, 1.05, 0, phone(t, "15"));
    s += G(140, 250, 0.8, 0, lungs(1, t)) + T("respiration", 140, 330, 20, BLUE, 800);
    s += G(140, 440, 1, 0, P("M0 30 C-50 -10 -40 -50 -14 -46 Q0 -44 0 -30 Q0 -44 14 -46 C40 -50 50 -10 0 30 Z", ORANGE, 2)) + T("poitrine", 140, 500, 20, ORANGE, 800);
    s += G(140, 590, 0.32, 0, eye(t, { red: 1, blink: 0.2 })) + T("> 1 h", 140, 660, 24, ORANGE, 900);
    return s;
  });
  // 22 — especially asthma, children, elderly
  shot(22, mv(320, 420, 1.0, 320, 410, 1.06), function (u, d, t) {
    var s = paper() + R(-300, 620, 1240, 200, LAND, 2) + '<rect x="-300" y="620" width="1240" height="200" fill="url(#hatch)"/>';
    [[130, { col: PB, inhaler: true }, 0.4], [320, { col: SAND, h: 0.62 }, 0.9], [500, { col: PUTTY, cane: true, h: 0.92 }, 1.4]].forEach(function (p, i) {
      var k = K(u, p[2], 0.4); if (k > 0) s += '<ellipse cx="' + p[0] + '" cy="470" rx="' + f(90 + 8 * Math.sin(t * 3 + i)) + '" ry="190" fill="url(#glowO)" opacity="' + f(0.35 * k) + '"/>';
      s += G(p[0], 620, 1, p[1].cane ? 4 : 0, personSide(t, p[1]));
    });
    return s + label(160, 400, 120, 200, "asthme", ORANGE, K(u, 0.4, 0.5)) + label(320, 520, 320, 300, "enfants", ORANGE, K(u, 0.9, 0.5)) + label(500, 440, 540, 220, "âgés", ORANGE, K(u, 1.4, 0.5));
  });
  // 23 — banned in war by the Chemical Weapons Convention
  shot(23, mv(320, 420, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper() + G(320, 420, 1, -2 + Math.sin(t) * 1, doc(t, 1));
    return s + G(320, 470, 1, 0, stamp("INTERDIT À LA GUERRE", ORANGE, K(u, 1.4, 0.4), -10)) + qmark(560, 140, K(u, 0, 0.4), 70);
  });
  // 24 — the same convention allows it for law enforcement
  shot(24, mv(320, 420, 1.06, 320, 410, 1.0), function (u, d, t) {
    var s = paper() + G(320, 420, 1, -2 + Math.sin(t) * 1, doc(t, 1)) + G(320, 410, 1, 0, stamp("INTERDIT À LA GUERRE", ORANGE, 1, -10));
    return s + G(320, 560, 1, 0, stamp("AUTORISÉ : MAINTIEN DE L'ORDRE", BLUE, K(u, 0.6, 0.4), 4)) + numBox("Art. II.9", 320, 700, K(u, 1.4, 0.4), 22);
  });
  // 25 — in short: walk away, don't rub, rinse with water, watch your breathing
  shot(25, mv(320, 400, 0.98, 320, 400, 1.04), function (u, d, t) {
    var s = paper(), C = [[180, 250], [460, 250], [180, 560], [460, 560]];
    s += G(C[0][0], C[0][1] + 80, 0.8, 0, personSide(t, { col: ORANGE, walk: true })) + arrow(C[0][0] + 30, C[0][1] - 40, C[0][0] - 90, C[0][1] - 40, OLIVE, 4, 1);
    s += G(C[1][0], C[1][1], 0.45, 0, eye(t, { red: 0.5, blink: 0.2 })) + crossMark(C[1][0], C[1][1], 1.1, 1);
    for (var i = 0; i < 6; i++) { var q = (t * 1.2 + i / 6) % 1; s += circ(C[2][0] + 6 * Math.sin(q * 8), C[2][1] - 80 + q * 140, 7, WATER, 1.2); }
    s += G(C[3][0], C[3][1], 0.8, 0, lungs(1, t));
    var out = ""; C.forEach(function (c, i) { var k = K(u, 0.3 + i * 0.8, 0.4); out += callout(i + 1, c[0] - 110, c[1] - 120, k); if (k <= 0) out += '<rect x="' + (c[0] - 140) + '" y="' + (c[1] - 150) + '" width="280" height="290" fill="' + PAPER + '" opacity=".8"/>'; });
    return s + out + line(320, 120, 320, 700, MAST, 1.4) + line(40, 410, 600, 410, MAST, 1.4);
  });

  window.__parts = { isoFace: isoFace, isoBox: isoBox, isoCyl: isoCyl, isoShadow: isoShadow, paper: paper, label: label, callout: callout, isoAt: isoAt, iso: iso, isoCanister: isoCanister, isoStreet: isoStreet, isoPerson: isoPerson, cloud: cloud, plume: plume, eye: eye, head: head, G: G, T: T, TS: TS, R: R, line: line, circ: circ };

  // ── summary card (the last line)
  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="300" fill="' + PAPER + '"/>' + G(170, 250, 0.62, 0, head(t, { tears: true })) + cloud(330, 140, 120, 70, t, 30, 1, { drift: 20 }) + '<g transform="translate(470 230) scale(0.9)">' + (isoAt(0, 0, 1.4), isoCanister(0, 0, t, {})) + '</g>';
    var Pp = [[250, 70, 1], [190, 150, 2], [130, 70, 3], [120, 230, 4]];
    Pp.forEach(function (p, i) { var k = clamp((u - 0.3 - i * 0.3) / 0.4); if (k > 0) s += '<g transform="translate(' + f(p[0]) + ' ' + f(p[1]) + ') scale(' + f(pop(k) * 0.8) + ')"><circle r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:800 17px Noto Sans;fill:' + ORANGE + '">' + p[2] + '</text></g>'; });
    svg.innerHTML = s;
  };
})();
