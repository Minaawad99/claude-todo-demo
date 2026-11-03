  // ── «إزاي الإنترنت بيشتغل؟» (دايجرام): the running motif is a phone photo of a felucca on the Nile under a red sun.
  // Objects follow real shapes (../refs/SOURCES.md): phone, home router with 4 antennas, living room in isometric cut-away,
  // street with the buried cable, telephone exchange, core routers, communications satellite, submarine cable layers,
  // garden hose, glass fibre, rack servers. Maps are real land (Natural Earth) with SEA-ME-WE 4-like routes (geo.js).
  var DARK = "#41392f", SKY = "#b9bfbb", LAND = "#c5cb9e", LANDD = "#8e9f6a", PB = "#4f7a9a", SAND = "#d9b9a0", FLOOR = "#d9c3a8",
      TABLE = "#d0806a", WALL = "#e7dcc4", SAIL = "#efe6d2", WATER = "#9fb3bd", WOOD = "#8a5a3c", GRASS = "#b4c08e", ROAD = "#a19d93", LED = "#7fc0a0";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function TM(text, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 700) + ' ' + sz + 'px DejaVu Sans Mono, monospace;fill:' + (col || INK) + ';direction:ltr;unicode-bidi:embed">' + text + '</text>'; }
  function TS(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:700 ' + sz + 'px DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + ';direction:ltr">' + text + '</text>'; }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function circ(x, y, r, fill, sw, ex) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || '') + '/>'; }
  function poly(pts, fill, sw, ex) { return '<path d="M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '" stroke-linejoin="round"' + (ex || '') + '/>'; }
  // polylines: length, part, point at fraction
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function ppart(p, k) { k = clamp(k); var L0 = plen(p) * k, s = 0, o = [p[0]]; for (var i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (s + l >= L0) { var r = l ? (L0 - s) / l : 0; o.push([lerp(p[i - 1][0], p[i][0], r), lerp(p[i - 1][1], p[i][1], r)]); return o; } s += l; o.push(p[i]); } return o; }
  function pat(p, k) { var q = ppart(p, k); return q[q.length - 1]; }
  function pd(p) { return 'M' + p.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L'); }
  function cable(p, k, col, w) { if (k <= 0) return ""; var q = pd(ppart(p, k == null ? 1 : k)); w = w || 6; return '<path d="' + q + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + q + '" stroke="' + (col || LANDD) + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function pin(x, y, k, r) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; r = r || 11; return G(x, y, k, 0, circ(0, 0, r, DARK, 2) + circ(0, 0, r * 0.32, PAPER, 0)); }
  function beads(p, k, t, n, col) { var s = ""; n = n || 6; for (var i = 0; i < n; i++) { var q = ((t * 0.35 + i / n) % 1) * k; if (q <= 0.01) continue; var c = pat(p, q); s += circ(c[0], c[1], 6, col || PB, 1.4); } return s; }
  // chapter marker, fixed on screen: a circled number with progress dots
  function chapter(n, k) { k = pop(k); if (k <= 0) return ""; var s = circ(0, 0, 26, PAPER, 2.2) + TS(String(n), 0, 11, 30, ORANGE); for (var i = 0; i < 4; i++) s += circ(-27 + i * 18, 44, 5, i < n ? (i === n - 1 ? ORANGE : DARK) : PAPER, 1.4); return fixed(G(320, 70, k, 0, s)); }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("؟", 0, 0, sz || 60, ORANGE)); }

  // ── the motif photo: a felucca on the Nile, as a colour function (for pixels) and as vector shapes
  function inTri(x, y, a, b, c) { var d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]), d2 = (x - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (y - c[1]), d3 = (x - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (y - a[1]); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); }
  var SA = [0.62, 0.17], SB = [0.16, 0.64], SC = [0.5, 0.69];
  function photoCol(x, y, w, h) {
    var u = x / w, v = y / h;
    if (inTri(u, v, SA, SB, SC)) return SAIL;
    if (Math.abs(u - 0.47) < 0.014 && v > 0.36 && v < 0.74) return DARK;
    if (v > 0.72 && v < 0.79 && u > 0.22 + (v - 0.72) * 0.9 && u < 0.7 - (v - 0.72) * 1.1) return WOOD;
    if (Math.hypot((u - 0.76) * w, (v - 0.22) * h) < 0.11 * w) return ORANGE;
    if (v < 0.57) return SKY;
    if (v < 0.63) return LANDD;
    return v < 0.67 ? "#aebfc6" : WATER;
  }
  function photoVec(w, h, t) {
    var s = R(0, 0, w, h * 0.57, SKY, 0) + circ(w * 0.76, h * 0.22, w * 0.11, ORANGE, 1.6);
    s += R(0, h * 0.57, w, h * 0.06, LANDD, 0) + R(0, h * 0.63, w, h * 0.37, WATER, 0);
    for (var p = 0; p < 4; p++) { var px = w * (0.1 + p * 0.27 + (p % 2) * 0.05), py = h * 0.57; s += '<path d="M' + f(px) + ' ' + f(py) + ' l2 -' + f(h * 0.06) + '" stroke="' + DARK + '" stroke-width="2"/>' + '<path d="M' + f(px - 9) + ' ' + f(py - h * 0.055) + ' q11 -8 22 2" stroke="' + DARK + '" stroke-width="2" fill="none"/>'; }
    for (var r = 0; r < 3; r++) s += '<path d="M' + f(w * (0.1 + r * 0.3 + 0.03 * Math.sin(t + r))) + ' ' + f(h * (0.86 + r * 0.03)) + ' h' + f(w * 0.12) + '" stroke="#c9d6db" stroke-width="2" stroke-linecap="round"/>';
    var bob = 1.5 * Math.sin(t * 2);
    s += '<g transform="translate(0 ' + f(bob) + ')">' + poly([[w * 0.22, h * 0.72], [w * 0.7, h * 0.72], [w * 0.62, h * 0.79], [w * 0.28, h * 0.79]], WOOD, 1.6);
    s += '<path d="M' + f(w * 0.47) + ' ' + f(h * 0.36) + ' V' + f(h * 0.72) + '" stroke="' + DARK + '" stroke-width="2.4"/>';
    s += poly([[w * SA[0], h * SA[1]], [w * SB[0], h * SB[1]], [w * SC[0], h * SC[1]]], SAIL, 1.6) + '<path d="M' + f(w * SA[0]) + ' ' + f(h * SA[1]) + ' L' + f(w * SB[0]) + ' ' + f(h * SB[1]) + '" stroke="' + DARK + '" stroke-width="2.6"/></g>';
    return s;
  }
  function photoPix(w, h, cols, k) {
    var rows = Math.round(cols * h / w), cw = w / cols, ch = h / rows, s = "";
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) s += '<rect x="' + f(i * cw) + '" y="' + f(j * ch) + '" width="' + f(cw + 0.3) + '" height="' + f(ch + 0.3) + '" fill="' + photoCol((i + 0.5) * cw, (j + 0.5) * ch, w, h) + '" stroke="' + INK + '" stroke-opacity=".18" stroke-width="1"/>';
    return '<g opacity="' + f(k) + '">' + s + '</g>';
  }
  function photo(w, h, t, pix, cols) { pix = clamp(pix || 0); return (pix < 1 ? '<g opacity="' + f(1 - pix) + '">' + photoVec(w, h, t) + '</g>' : '') + (pix > 0 ? photoPix(w, h, cols || 12, pix) : ''); }
  // the phone, front-facing, centred at (x,y): body 200×400 at s=1. scr(w,h) draws the screen content
  function phone(x, y, s, rot, scr) {
    var id = "ph" + (++CLIPN), sw = 176, sh = 360, g = R(-100, -200, 200, 400, DARK, 2.6, 30) + R(-100, -200, 200, 400, "url(#hatchW)", 0, 30);
    g += '<clipPath id="' + id + '"><rect x="-88" y="-180" width="176" height="360" rx="6"/></clipPath><rect x="-88" y="-180" width="176" height="360" rx="6" fill="' + PAPER + '"/>';
    g += '<g clip-path="url(#' + id + ')"><g transform="translate(-88 -180)">' + (scr ? scr(sw, sh) : '') + '</g></g><rect x="-88" y="-180" width="176" height="360" rx="6" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    g += R(-22, -193, 44, 6, "#2b241d", 0, 3) + R(100, -110, 5, 44, DARK, 1.6, 2) + R(100, -50, 5, 30, DARK, 1.6, 2);
    return G(x, y, s, rot, g);
  }
  function photoScreen(t, pix, cols) { return function (w, h) { return photo(w, h, t, pix, cols); }; }
  // a packet: blue card with a white address strip and its number
  function pkt(x, y, s, n, rot, op) { var g = R(-26, -18, 52, 36, PB, 1.8, 3) + R(-20, -10, 40, 12, "#f4efe0", 1, 2) + (n != null ? TM(String(n), 0, 14, 11, "#f4efe0", 700) : ''); return G(x, y, s, rot, g, op); }
  // 0/1 tiles
  function bit(x, y, b, s, op) { return G(x, y, s, 0, R(-11, -14, 22, 28, b ? PB : "#f4efe0", 1.6, 3) + TM(b ? "1" : "0", 0, 6, 15, b ? "#f4efe0" : INK, 700), op); }

  // ── isometric objects (helpers' iso grid)
  function router(x, y, z, t) {
    var s = isoShadow(x, y, 34, 18) + isoBox(x, y, z, 34, 18, 7, ["#5a5046", DARK, DARK]);
    for (var i = 0; i < 4; i++) { var px = x + 4 + i * 8.5; s += isoBox(px, y + 1, z + 7, 2, 2, 24 + (i % 2) * 3, ["#5a5046", DARK, DARK], 1.2); }
    for (var l = 0; l < 5; l++) { var p = iso(x + 6 + l * 5.5, y + 18, z + 3.5), on = Math.sin(t * 7 + l * 1.9) > -0.2; s += circ(p[0], p[1], 1.3 * ISO.s, on ? LED : "#2b241d", 0); }
    return s;
  }
  function rack(x, y, z, w, d, h, t, seed) {
    var s = isoShadow(x, y, w, d) + isoBox(x, y, z, w, d, h, ["#5a5046", DARK, DARK]);
    var units = Math.floor(h / 7);
    for (var j = 0; j < units; j++) {
      var a = iso(x + 2, y + d, z + 4 + j * 7), b = iso(x + w - 2, y + d, z + 4 + j * 7);
      s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#2b241d" stroke-width="' + f(0.6 * ISO.s) + '"/>';
      var l = iso(x + w - 4, y + d, z + 6.5 + j * 7), on = hash(j * 7 + (seed || 0) + Math.floor(t * 3)) > 0.35;
      s += circ(l[0], l[1], 0.9 * ISO.s, on ? (j % 3 ? PB : LED) : "#2b241d", 0);
    }
    return s;
  }
  function building(x, y, w, d, h, col, win, t) {
    var s = isoShadow(x, y, w, d, 0.1) + isoBox(x, y, 0, w, d, h, col || [BONE, PUTTY, PUTTY]);
    win = win || 18;
    for (var zz = 14; zz < h - 10; zz += win) for (var xx = 8; xx < w - 8; xx += 16) s += isoFace([[x + xx, y + d, zz], [x + xx + 8, y + d, zz], [x + xx + 8, y + d, zz + 9], [x + xx, y + d, zz + 9]], SKY, "", 1);
    for (zz = 14; zz < h - 10; zz += win) for (var yy = 8; yy < d - 8; yy += 16) s += isoFace([[x + w, y + yy, zz], [x + w, y + yy + 8, zz], [x + w, y + yy + 8, zz + 9], [x + w, y + yy, zz + 9]], "#a3aaa6", "", 1);
    return s;
  }
  // the living room cut-away (floor 220×220, two walls), with the phone on the table and the router on a shelf
  function room(t, o) {
    o = o || {}; var W = 220, D = 220, H = 150, s = paper();
    s += isoFace([[-30, -30, -1], [W + 40, -30, -1], [W + 40, D + 40, -1], [-30, D + 40, -1]], GRASS, "", 1.4);
    s += isoBox(-6, -6, -14, W + 6, D + 6, 14, [FLOOR, SAND, SAND]);
    s += isoBox(-6, -6, 0, 6, D, H, [WALL, "#ddd2bb", "#ddd2bb"]) + isoFace([[0, 0, 0], [0, D - 6, 0], [0, D - 6, H], [0, 0, H]], "#e2d6bd", "hatch", 1.6);
    s += isoBox(0, -6, 0, W - 6, 6, H, [WALL, WALL, WALL]);
    s += isoFace([[120, 0, 62], [186, 0, 62], [186, 0, 122], [120, 0, 122]], SKY, "", 1.8) + isoFace([[152, 0, 62], [154, 0, 62], [154, 0, 122], [152, 0, 122]], WALL, "", 1);
    s += isoBox(40, 0, 70, 46, 16, 4, [TABLE, "#b9614b", "#b9614b"]) + router(46, 0, 74, t);
    s += isoBox(6, 70, 0, 12, 110, 52, [LANDD, "#9aab75", "#7d8d5c"]) + isoBox(12, 70, 0, 44, 12, 34, [LANDD, "#9aab75", "#7d8d5c"]);
    s += isoShadow(12, 82, 40, 86) + isoBox(18, 82, 0, 38, 86, 24, [LANDD, "#9aab75", "#7d8d5c"]) + isoBox(12, 168, 0, 44, 12, 34, [LANDD, "#9aab75", "#7d8d5c"]);
    s += isoShadow(100, 100, 60, 44);
    [[102, 102], [154, 102], [102, 138], [154, 138]].forEach(function (l) { s += isoBox(l[0], l[1], 0, 4, 4, 28, ["#a8452a", "#a8452a", "#8a3a24"], 1.2); });
    s += isoBox(98, 98, 28, 64, 50, 5, [TABLE, "#b9614b", "#b9614b"]);
    var pp = iso(130, 124, 33); s += phone(pp[0], pp[1] - 28 * ISO.s / 1.6, 0.14 * ISO.s / 1.6, -4, photoScreen(t, 0));
    return { s: s, phone: [pp[0], pp[1] - 30 * ISO.s / 1.6], router: iso(63, 9, 92) };
  }
  function wifi(a, b, t, k) {
    if (k <= 0) return ""; var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), dist = Math.hypot(b[0] - a[0], b[1] - a[1]), s = "";
    for (var i = 0; i < 4; i++) { var r = ((t * 70 + i * dist / 4) % dist) + 8, op = clamp(1 - r / dist) * k, a0 = ang - 0.42, a1 = ang + 0.42;
      s += '<path d="M' + f(a[0] + Math.cos(a0) * r) + ' ' + f(a[1] + Math.sin(a0) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(a[0] + Math.cos(a1) * r) + ' ' + f(a[1] + Math.sin(a1) * r) + '" stroke="' + LANDD + '" stroke-width="5" fill="none" stroke-linecap="round" opacity="' + f(op) + '"/>'; }
    return s;
  }
  // ── maps
  function globe(o, t) {
    o = o || {}; var g = GEO.globe, s = paper();
    s += '<path d="' + g.sphere + '" fill="' + SKY + '" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="' + g.grat + '" fill="none" stroke="#9aa39f" stroke-width=".8" opacity=".6"/>';
    s += '<path d="' + g.land + '" fill="' + LAND + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M320 90 A340 340 0 1 1 319.9 90 Z M300 70 A350 350 0 1 0 300.1 70 Z" fill="url(#hatch)" fill-rule="evenodd" opacity=".9" clip-path="url(#sph)"/>';
    s += '<clipPath id="sph"><path d="' + g.sphere + '"/></clipPath>';
    var ck = o.cables == null ? 1 : o.cables; if (ck > 0) g.other.forEach(function (p, i) { s += cable(p, clamp(ck * 1.4 - i * 0.12), LANDD, 4.5); });
    return s;
  }
  function route(M, k, t, landK) { var s = cable(M.sea, k, LANDD, 6) + cable(M.landr, landK || 0, LANDD, 6); if (k > 0) s += '<path d="' + pd(ppart(M.sea, k)) + '" stroke="' + PB + '" stroke-width="2.6" stroke-dasharray="2 9" stroke-linecap="round" fill="none"/>'; return s; }
  function medMap(o, t) {
    o = o || {}; var M = GEO.med, s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + SKY + '"/>' + '<path d="' + M.land + '" fill="' + LAND + '" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/>';
    M.other.forEach(function (p) { s += cable(p, 1, "#7d8d5c", 4); });
    return s;
  }
  function satellite(x, y, s, t) {
    var g = R(-150, -22, 104, 44, PB, 1.8) + R(46, -22, 104, 44, PB, 1.8);
    for (var i = 1; i < 4; i++) g += '<path d="M' + (-150 + i * 26) + ' -22 v44 M' + (46 + i * 26) + ' -22 v44" stroke="#2b3b48" stroke-width="1.2"/>';
    g += '<path d="M-150 0 h104 M46 0 h104" stroke="#2b3b48" stroke-width="1.2"/>' + R(-46, -3, 92, 6, PUTTY, 1.4);
    g += R(-34, -40, 68, 80, "#c9a24a", 2) + R(-34, -40, 68, 80, "url(#hatch)", 0) + '<ellipse cx="0" cy="54" rx="26" ry="9" fill="' + BONE + '" stroke="' + INK + '" stroke-width="1.8"/><path d="M0 40 V54" stroke="' + INK + '" stroke-width="2"/>';
    return G(x, y, s, 8 * Math.sin(t * 0.8), g);
  }
  function fish(x, y, s, dir, t) { var g = '<ellipse cx="0" cy="0" rx="30" ry="10" fill="#8a9aa3" stroke="' + INK + '" stroke-width="1.6"/>' + poly([[26, 0], [44, -11 + 2 * Math.sin(t * 6)], [44, 11 + 2 * Math.sin(t * 6)]], "#8a9aa3", 1.6) + circ(-19, -2, 2, INK, 0); return G(x, y, s, 0, '<g transform="scale(' + (dir || 1) + ' 1)">' + g + '</g>'); }
  // a horizontal tube seen at 3/4: body from x0 to x1 along the axis, radius r, front cap at x0 with section rings
  function tube(x0, x1, y, r, fill, rings) {
    var s = '<path d="M' + f(x0) + ' ' + f(y - r) + ' H' + f(x1) + ' A' + f(r * 0.45) + ' ' + f(r) + ' 0 0 1 ' + f(x1) + ' ' + f(y + r) + ' H' + f(x0) + ' Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + f(x0) + ' ' + f(y + r * 0.35) + ' H' + f(x1) + ' A' + f(r * 0.45) + ' ' + f(r) + ' 0 0 1 ' + f(x1) + ' ' + f(y + r) + ' H' + f(x0) + ' Z" fill="url(#hatch)"/>';
    (rings || [[r, fill]]).forEach(function (q) { s += '<ellipse cx="' + f(x0) + '" cy="' + f(y) + '" rx="' + f(q[0] * 0.45) + '" ry="' + f(q[0]) + '" fill="' + q[1] + '" stroke="' + INK + '" stroke-width="1.6"/>'; });
    return s;
  }

  var CAI = GEO.globe.pts.CAI, FRA = GEO.globe.pts.FRA, ROUTE = [CAI].concat(GEO.globe.sea).concat(GEO.globe.landr);

  // 0 — you just sent a photo to your friend in Germany, and it arrived before you locked the phone
  shot(0, mv(320, 410, 1.0, 320, 380, 1.12), function (u, d, t) {
    var up = ease(K(u, 0.6, 0.9)), tick = K(u, 1.8, 0.5);
    var scr = function (w, h) {
      var s = R(0, 0, w, h, "#e7dcc4", 0) + R(0, 0, w, 34, DARK, 0) + circ(22, 17, 9, SKY, 1.2) + R(38, 12, 60, 8, "#8a8070", 0, 3);
      var by = lerp(170, 66, up); s += G(w - 12, by, 1, 0, R(-130, 0, 130, 190, "#f4efe0", 1.4, 8) + G(-124, 6, 1, 0, '<clipPath id="pb"><rect width="118" height="160" rx="5"/></clipPath><g clip-path="url(#pb)">' + photo(118, 160, t, 0) + '</g><rect width="118" height="160" rx="5" fill="none" stroke="' + INK + '" stroke-width="1.2"/>') + '<path d="M-40 178 l5 5 l9 -10 M-30 178 l5 5 l9 -10" stroke="' + (tick > 0 ? PB : "#a19d93") + '" stroke-width="2.4" fill="none" opacity="' + f(0.3 + 0.7 * tick) + '"/>');
      s += R(8, h - 44, w - 56, 32, "#f4efe0", 1.2, 16) + circ(w - 26, h - 28, 17, PB, 1.4) + '<path d="M' + f(w - 33) + ' ' + f(h - 35) + ' l15 7 l-15 7 l3 -7 Z" fill="#f4efe0"/>';
      var pr = K(u, 0.4, 0.5); if (pr > 0 && pr < 1) s += '<circle cx="' + f(w - 26) + '" cy="' + f(h - 28) + '" r="' + f(17 + 20 * pr) + '" fill="none" stroke="' + PB + '" stroke-width="3" opacity="' + f(1 - pr) + '"/>';
      return s;
    };
    return paper() + phone(320, 420, 1.3, -3 + 2 * Math.sin(t * 0.7), scr) + label(400, 617, 540, 720, "إرسال", PB, K(u, 0.4, 0.7), 22);
  });
  // 1 — that photo travelled thousands of kilometres in under a second
  shot(1, mv(320, 360, 1.25, 300, 330, 1.45), function (u, d, t) {
    var k = ease(K(u, 0.3, 2.2));
    var s = globe({ cables: 0.6 }, t) + cable(ROUTE, k, PB, 5) + beads(ROUTE, k, t, 7, PB) + pin(CAI[0], CAI[1], K(u, 0.1, 0.5)) + pin(FRA[0], FRA[1], K(u, 2.2, 0.5));
    s += label(CAI[0], CAI[1], CAI[0] + 60, CAI[1] + 70, "مصر", OLIVE, K(u, 0.3), 22) + label(FRA[0], FRA[1], FRA[0] - 90, FRA[1] - 60, "ألمانيا", OLIVE, K(u, 2.3), 22);
    return s + fixed(G(500, 120, pop(K(u, 1.6, 0.6)), 0, TS("&lt;1", 0, 0, 64) + T("ثانية", 0, 34, 22, INK, 700)));
  });
  // 2 — so what did it travel through, and how so fast?
  shot(2, mv(320, 400, 1.0, 320, 400, 1.1), function (u, d, t) {
    return paper() + '<circle cx="320" cy="400" r="210" fill="none" stroke="#cdbf9f" stroke-width="3"/>' + phone(320, 400, 0.72, 3 * Math.sin(t), photoScreen(t, 0)) + qmark(470, 210, K(u, 0.4, 0.6), 80) + qmark(170, 250, K(u, 1.6, 0.6), 54);
  });
  // 3 — what's the story? I'll explain it in a minute
  shot(3, mv(320, 380, 1.1, 320, 400, 1.0), function (u, d, t) {
    var a = t * 3.2, s = paper() + '<circle cx="320" cy="400" r="210" fill="none" stroke="#cdbf9f" stroke-width="3"/>' + phone(320, 400, 0.72, 0, photoScreen(t, 0));
    s += G(320, 150, pop(K(u, 0.1, 0.6)), 0, R(-8, -62, 16, 14, ORANGE, 1.6, 2) + circ(0, -12, 42, PAPER, 3) + circ(0, -12, 34, "none", 1.2) + '<path d="M0 -12 L' + f(Math.sin(a) * 28) + ' ' + f(-12 - Math.cos(a) * 28) + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/>' + circ(0, -12, 3.5, INK, 0));
    return s;
  });
  // 4 — the phone doesn't understand pictures, only numbers
  shot(4, mv(320, 420, 1.0, 320, 410, 1.08), function (u, d, t) {
    var s = paper() + phone(250, 430, 0.95, -2, photoScreen(t, 0)) + chapter(1, K(u, 0, 0.6));
    s += crossMark(250, 360, 1.3, K(u, 0.9, 0.5));
    "7 3 0 9 1 5 2 8".split(" ").forEach(function (n, i) { var kk = K(u, 1.4 + i * 0.12, 0.5); s += G(470 + (i % 2) * 70, 230 + Math.floor(i / 2) * 110 + 6 * Math.sin(t * 2 + i), pop(kk), 0, R(-26, -32, 52, 64, "#f4efe0", 1.8, 5) + TM(n, 0, 14, 38, PB, 700)); });
    return s;
  });
  // 5 — it splits the photo into tiny dots, and every dot's colour is a number
  shot(5, function (u, d) { var k = ease(K(u, 1.4, 1.4)); return [lerp(320, 395, k), lerp(410, 275, k), lerp(1.0, 2.6, k)]; }, function (u, d, t) {
    var pix = ease(K(u, 0.2, 1.0)), s = paper() + phone(320, 420, 1.1, 0, photoScreen(t, pix, 12));
    var c = [320 - 96.8 + 176 * 1.1 * (9.5 / 12), 420 - 198 + 360 * 1.1 * (5.5 / 25)];
    s += '<rect x="' + f(c[0] - 8.1) + '" y="' + f(c[1] - 7.9) + '" width="16.2" height="15.8" fill="none" stroke="' + PB + '" stroke-width="2.6" opacity="' + f(K(u, 1.6, 0.4)) + '"/>';
    return s + label(c[0], c[1], c[0] - 70, c[1] - 50, "196 · 83 · 44", PB, K(u, 2.0, 0.8), 13);
  });
  // 6 — and those numbers turn into zeros and ones
  shot(6, mv(300, 400, 1.0, 340, 400, 1.05), function (u, d, t) {
    var s = paper() + phone(170, 420, 0.8, 0, photoScreen(t, 1, 12)), B = "11000100", run = K(u, 0.2, 0.6);
    for (var i = 0; i < 16; i++) { var x = 260 + ((i * 34 + t * 90) % 560), b = B.charAt(i % 8) === "1"; s += bit(x, 330 + 10 * Math.sin(x / 60), b, 1.1, run * clamp((620 - x) / 60)); }
    for (i = 0; i < 16; i++) { var x2 = 260 + ((i * 34 + t * 70 + 17) % 560); s += bit(x2, 520 + 10 * Math.cos(x2 / 60), hash(i) > 0.5, 1.1, run * clamp((620 - x2) / 60)); }
    return s + numBox("196 = 11000100", 420, 690, K(u, 1.0, 0.6), 22);
  });
  // 7 — the photo is big, so it's cut into more than a thousand small pieces called data packets
  shot(7, mv(320, 400, 1.15, 320, 400, 0.95), function (u, d, t) {
    var k = ease(K(u, 0.6, 1.8)), cols = 6, rows = 12, w = 176 * 1.1, h = 360 * 1.1, x0 = 320 - w / 2, y0 = 420 - h / 2, s = paper();
    s += '<g opacity="' + f(1 - k) + '">' + phone(320, 420, 1.1, 0, function () { return ""; }) + '</g>';
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var cx = x0 + (i + 0.5) * w / cols, cy = y0 + (j + 0.5) * h / rows, n = j * cols + i, tx = 60 + hash(n) * 520, ty = 110 + hash(n + 50) * 560;
      var x = lerp(cx, tx, k), y = lerp(cy, ty, k) + 4 * Math.sin(t * 2 + n) * k, col = photoCol((i + 0.5) * 176 / cols, (j + 0.5) * 360 / rows, 176, 360);
      s += k < 0.5 ? '<rect x="' + f(x - w / cols / 2) + '" y="' + f(y - h / rows / 2) + '" width="' + f(w / cols) + '" height="' + f(h / rows) + '" fill="' + col + '" stroke="' + INK + '" stroke-opacity=".3"/>' : pkt(x, y, 0.8, null, (hash(n + 9) - 0.5) * 30);
    }
    return s + label(320, 400, 470, 120, "حزم بيانات", PB, K(u, 2.2, 0.8), 24) + fixed(G(130, 110, pop(K(u, 2.6, 0.6)), 0, TS("+1000", 0, 0, 40)));
  });
  // 8 — every packet carries, like an envelope: from whom, to whom, and its number
  shot(8, mv(320, 400, 1.0, 320, 420, 1.12), function (u, d, t) {
    var s = paper() + G(320, 410, 1, -2 + Math.sin(t) * 1.2, poly([[-260, -170], [260, -170], [250, 170], [-250, 175]], PB, 2.6) + '<path d="M-260 -170 L0 -40 L260 -170" fill="none" stroke="#3a6280" stroke-width="2" opacity=".5"/>' + R(-190, -110, 380, 230, "#f4efe0", 2, 4));
    [["من:", "192.0.2.15", INK], ["إلى:", "198.51.100.24", PB], ["رقم:", "512", ORANGE]].forEach(function (r, i) { var kk = K(u, 0.5 + i * 0.7, 0.4); s += '<g opacity="' + f(kk) + '">' + T(r[0], 470, 360 + i * 66, 26, INK, 700, "start") + '<text x="165" y="' + (360 + i * 66) + '" style="font:700 30px DejaVu Sans Mono, monospace;fill:' + r[2] + ';direction:ltr" text-anchor="start">' + r[1] + '</text><path d="M160 ' + (372 + i * 66) + ' H480" stroke="#cdbf9f" stroke-width="1.4"/></g>'; });
    return s;
  });
  // 9 — that address is called an IP, and every device on the internet has one
  shot(9, mv(320, 420, 1.1, 320, 400, 1.0), function (u, d, t) {
    var s = paper() + isoAt(330, 330, 1.7);
    s += isoShadow(0, 0, 180, 60) + isoBox(0, 0, 0, 180, 60, 6, [TABLE, "#b9614b", "#b9614b"]);
    [[4, 4], [170, 4], [4, 50], [170, 50]].forEach(function (l) { s += isoBox(l[0], l[1], -60, 6, 6, 60, ["#a8452a", "#a8452a", "#8a3a24"], 1.2); });
    s += isoBox(10, 20, 6, 50, 34, 2, [PUTTY, "#b3ae9e", "#b3ae9e"]) + isoFace([[10, 20, 8], [60, 20, 8], [60, 20, 40], [10, 20, 40]], "#cfd3cf", "", 1.8);
    s += isoBox(84, 18, 6, 18, 14, 3, [DARK, DARK, DARK]) + isoBox(91, 24, 9, 4, 3, 16, [DARK, DARK, DARK]) + isoFace([[74, 22, 22], [114, 22, 22], [114, 22, 52], [74, 22, 52]], DARK, "", 1.8) + isoFace([[76, 24, 24], [112, 24, 24], [112, 24, 50], [76, 24, 50]], SKY, "", 1.2);
    s += router(132, 22, 6, t);
    var ph = iso(40, 52, 7); s += phone(ph[0] + 10, ph[1] - 18, 0.12, -6, photoScreen(t, 0));
    var tags = [[iso(35, 20, 44), "192.0.2.21"], [iso(94, 22, 58), "192.0.2.30"], [iso(150, 30, 40), "192.0.2.1"], [[ph[0] + 10, ph[1] - 48], "192.0.2.15"]];
    tags.forEach(function (q, i) { var kk = pop(K(u, 0.5 + i * 0.35, 0.5)); if (kk <= 0) return; var w = 132; s += G(q[0][0], q[0][1] - 40 - i % 2 * 26, kk, 0, R(-w / 2, -17, w, 30, "#f4efe0", 1.8, 6) + TM(q[1], 0, 4, 15, INK, 700)); });
    return s + label(ph[0] + 10, ph[1] - 40, 140, 160, "IP", PB, K(u, 2.2, 0.6), 30);
  });
  // 10 — when you press send, the packets leave the phone as Wi-Fi waves
  shot(10, mv(300, 420, 1.0, 320, 380, 1.18), function (u, d, t) {
    isoAt(250, 330, 1.6); var r = room(t), s = r.s + wifi(r.phone, r.router, t, K(u, 0.6, 0.6)) + chapter(2, K(u, 0, 0.6));
    return s + label(lerp(r.phone[0], r.router[0], 0.5), lerp(r.phone[1], r.router[1], 0.5), 520, 600, "واي فاي", OLIVE, K(u, 1.2, 0.8), 24);
  });
  // 11 — the router catches them and sends them down a cable inside the wall
  shot(11, mv(330, 330, 1.0, 330, 420, 1.1), function (u, d, t) {
    var s = paper() + isoAt(200, 520, 4.2);
    s += isoBox(-6, -10, -40, 110, 10, 130, [WALL, WALL, WALL]);
    var cut = [[60, 0, -40], [74, 0, -40], [74, 0, 60], [60, 0, 60]]; s += isoFace(cut, "#cbbfa5", "hatch", 1.6);
    var top = iso(67, 0, 58), bot = iso(67, 0, -40), back = iso(34, 6, 74);
    var path = [back, [top[0], back[1] + 10], top, bot]; s += cable(path, 1, DARK, 7);
    s += isoBox(10, 0, 70, 50, 18, 4, [TABLE, "#b9614b", "#b9614b"]) + router(16, 0, 74, t);
    var flow = K(u, 0.4, 0.5); for (var i = 0; i < 6; i++) { var q = ((t * 0.4 + i / 6) % 1); if (flow > 0) { var c = pat(path, q); s += pkt(c[0], c[1], 0.45, null, 0, flow); } }
    s += wifi([650, 760], iso(30, 9, 90), t, 1);
    return s + label(iso(30, 9, 81)[0], iso(30, 9, 81)[1], 470, 150, "الراوتر", ORANGE, K(u, 0.3), 24) + label(iso(67, 0, 20)[0], iso(67, 0, 20)[1], 470, 560, "الكابل", OLIVE, K(u, 1.4), 24);
  });
  // 12 — the cable goes down to the street and reaches the internet company's exchange
  shot(12, mv(250, 420, 1.15, 380, 400, 1.0), function (u, d, t) {
    var s = paper() + isoAt(250, 230, 0.95);
    s += isoBox(-80, -60, -40, 520, 280, 40, [GRASS, SAND, SAND]);
    s += isoFace([[120, -60, 0.5], [200, -60, 0.5], [200, 220, 0.5], [120, 220, 0.5]], ROAD, "", 1.4);
    for (var y = -50; y < 220; y += 40) s += isoFace([[158, y, 1], [162, y, 1], [162, y + 18, 1], [158, y + 18, 1]], "#efe6d2", "", 0);
    s += building(0, 110, 90, 100, 80, [BONE, "#e1d3b8", "#d5c6a8"]) + isoBox(0, 110, 80, 90, 100, 6, [TABLE, "#b9614b", "#b9614b"]);
    s += building(240, 80, 130, 130, 120, [BONE, PUTTY, PUTTY], 22) + isoBox(330, 100, 120, 6, 6, 50, [DARK, DARK, DARK]) + isoBox(310, 96, 156, 46, 4, 4, [DARK, DARK, DARK]);
    var p = [iso(45, 220, 0), iso(45, 220, -22), iso(305, 220, -22), iso(305, 220, 0)];
    s += cable(p, ease(K(u, 0.2, 1.6)), DARK, 6) + beads(p, ease(K(u, 0.2, 1.6)), t, 7, PB);
    return s + label(iso(305, 145, 120)[0], iso(305, 145, 120)[1], 470, 140, "سنترال", OLIVE, K(u, 1.8), 24) + label(iso(180, 220, -22)[0], iso(180, 220, -22)[1], 300, 700, "الكابل", OLIVE, K(u, 0.8), 22);
  });
  // 13 — there, much bigger routers read each packet's address and pick the fastest free road
  shot(13, function (u, d) { var k = ease(K(u, 0, 2.2)); return [lerp(330, 320, k), lerp(330, 400, k), lerp(1.6, 0.95, k)]; }, function (u, d, t) {
    var s = paper() + isoAt(320, 110, 0.85), N = 4, S = 150;
    s += isoFace([[-40, -40, 0], [S * 3 + 40, -40, 0], [S * 3 + 40, S * 3 + 40, 0], [-40, S * 3 + 40, 0]], "#e3d8bf", "", 1.4);
    for (var i = 0; i < N; i++) { s += isoFace([[i * S - 18, -40, 0.5], [i * S + 18, -40, 0.5], [i * S + 18, S * 3 + 40, 0.5], [i * S - 18, S * 3 + 40, 0.5]], ROAD, "", 1.2); s += isoFace([[-40, i * S - 18, 0.6], [S * 3 + 40, i * S - 18, 0.6], [S * 3 + 40, i * S + 18, 0.6], [-40, i * S + 18, 0.6]], ROAD, "", 1.2); }
    for (i = 0; i < N; i++) for (var j = 0; j < N; j++) if ((i + j) % 2 === 0) { s += isoBox(i * S + 24, j * S + 24, 0, 28, 28, 40, [TABLE, ORANGE, "#a8452a"]); for (var v = 0; v < 4; v++) s += isoFace([[i * S + 28, j * S + 52, 8 + v * 8], [i * S + 48, j * S + 52, 8 + v * 8], [i * S + 48, j * S + 52, 10 + v * 8], [i * S + 28, j * S + 52, 10 + v * 8]], "#8a3a24", "", 0); }
    var good = [iso(0, 0, 2), iso(S, 0, 2), iso(S, S * 2, 2), iso(S * 3, S * 2, 2)], bad = [iso(0, 0, 2), iso(0, S * 3, 2)];
    for (var c = 0; c < 9; c++) { var q = pat(bad, 0.2 + c * 0.07 + 0.01 * Math.sin(t * 2 + c)); s += pkt(q[0], q[1], 0.4, null, 0, 0.55); }
    var pk = ease(K(u, 1.2, 1.8)); s += '<path d="' + pd(ppart(good, pk)) + '" stroke="' + PB + '" stroke-width="6" stroke-dasharray="3 10" stroke-linecap="round" fill="none"/>';
    var pp = pat(good, pk); s += pkt(pp[0], pp[1] - 8, 0.7, null, 0);
    s += crossMark(pat(bad, 0.45)[0], pat(bad, 0.45)[1], 0.7, K(u, 2.0, 0.5));
    return s + label(iso(24, 24, 40)[0] + 6, iso(24, 24, 40)[1], 120, 120, "راوتر", ORANGE, K(u, 0.3), 22) + label(good[2][0], good[2][1], 520, 690, "أسرع طريق فاضي", PB, K(u, 2.2, 0.8), 20);
  });
  // 14 — many people think the packets then go up to a satellite
  shot(14, mv(330, 330, 1.05, 330, 300, 1.15), function (u, d, t) {
    var s = globe({ cables: 0 }, t), sp = [470, 0], up = K(u, 0.3, 1.0);
    s += '<path d="M' + f(CAI[0]) + ' ' + f(CAI[1]) + ' L' + f(lerp(CAI[0], sp[0], up)) + ' ' + f(lerp(CAI[1], sp[1] + 60, up)) + '" stroke="' + PB + '" stroke-width="3" stroke-dasharray="8 8" stroke-dashoffset="' + f(-t * 40) + '"/>';
    s += satellite(sp[0], sp[1], 0.9, t) + pin(CAI[0], CAI[1], 1) + label(sp[0] - 40, sp[1] - 30, 220, -40, "قمر صناعي", ORANGE, K(u, 0.6), 24);
    return s + crossMark(lerp(CAI[0], sp[0], 0.5), lerp(CAI[1], sp[1] + 60, 0.5), 1.4, K(u, 1.6, 0.5));
  });
  // 15 — no: most of them go down under the sea
  shot(15, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(260, 520, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var s = '<rect x="-600" y="-600" width="1840" height="2000" fill="' + PAPER + '"/><rect x="-600" y="-600" width="1840" height="2000" fill="url(#grid)"/>';
    var wv = "M-300 200"; for (var x = -300; x <= 940; x += 20) wv += " L" + x + " " + f(200 + 6 * Math.sin(x / 40 + t * 2)); s += '<path d="' + wv + ' L940 1200 L-300 1200 Z" fill="' + SKY + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-300 640 Q-100 600 100 630 T500 620 T940 640 L940 1200 L-300 1200 Z" fill="' + SAND + '" stroke="' + INK + '" stroke-width="2"/><path d="M-300 700 Q0 680 300 700 T940 700 L940 1200 L-300 1200 Z" fill="#c9a98f" stroke="' + INK + '" stroke-width="1.4"/><path d="M-300 700 Q0 680 300 700 T940 700 L940 1200 L-300 1200 Z" fill="url(#hatch)"/>';
    var cp = [[-300, 650], [0, 628], [200, 640], [400, 628], [700, 640], [940, 632]]; s += cable(cp, 1, LANDD, 9) + beads(cp, 1, t, 8, PB);
    s += fish((t * 30) % 900 - 100, 380, 1.1, 1, t) + fish(800 - (t * 22) % 900, 470, 0.8, -1, t) + fish((t * 18 + 400) % 900 - 100, 300, 0.7, 1, t);
    s += chapter(3, K(u, 0, 0.6));
    return s + label(200, 640, 120, 520, "الكابل", OLIVE, K(u, 0.6), 24);
  });
  // 16 — more than 99% of the data between continents runs through cables under water
  shot(16, mv(320, 420, 0.95, 320, 400, 1.05), function (u, d, t) {
    var k = ease(K(u, 0.1, 1.6)), s = globe({ cables: k }, t) + cable(GEO.globe.sea, k, LANDD, 4.5);
    return s + fixed(G(320, 120, pop(K(u, 0.6, 0.7)), 0, R(-120, -62, 240, 96, PAPER, 2, 8) + TS("99%", 0, 10, 64)));
  });
  // 17 — and the cable in the deep sea is only as thick as a garden hose
  shot(17, mv(320, 400, 1.0, 330, 400, 1.12), function (u, d, t) {
    var s = paper(), a = K(u, 0.2, 0.6), b = K(u, 1.0, 0.6);
    s += G(0, 0, 1, 0, '<g opacity="' + f(a) + '">' + tube(200, 560, 300, 30, DARK, [[30, DARK], [22, "#c47a4a"], [16, PUTTY], [8, BONE]]) + '</g>');
    s += '<g opacity="' + f(b) + '">' + tube(200, 560, 520, 33, LANDD, [[33, LANDD], [24, "#5d6b48"]]) + '</g>';
    s += label(200, 300, 110, 200, "الكابل", OLIVE, K(u, 0.5), 24) + label(200, 520, 120, 650, "خرطوم الجنينة", OLIVE, K(u, 1.3), 24);
    return s + numBox("≈ 17 مم", 470, 420, K(u, 1.8, 0.6), 24);
  });
  // 18 — and inside it are glass threads as thin as a hair
  shot(18, function (u, d) { var k = ease(K(u, 0.4, 1.8)); return [lerp(320, 450, k), lerp(400, 500, k), lerp(0.95, 1.9, k)]; }, function (u, d, t) {
    var s = paper(), L0 = [[60, 120, "#7a6e60"], [150, 102, ORANGE], [230, 86, "#c47a4a"], [300, 70, OLIVE]];
    s += '<g transform="rotate(22 320 400)">';
    L0.forEach(function (q, i) { s += tube(q[0] + 110, -200, 400, q[1], q[2], [[q[1], q[2]], [q[1] - 12, i ? "#e7dcc4" : "#5a5046"]]); });
    for (var n = 0; n < 8; n++) { var a = n / 8 * Math.PI * 2, yy = 400 + Math.sin(a) * 28, x0 = 560 + Math.cos(a) * 10; s += tube(x0, 400, yy, 7, "#f4efe0", [[7, "#f4efe0"], [3.5, n % 2 ? PB : "#9fc3dc"]]); }
    s += '</g>';
    var tp = [320 + (560 - 320) * Math.cos(0.384) - (428 - 400) * Math.sin(0.384), 400 + (560 - 320) * Math.sin(0.384) + (428 - 400) * Math.cos(0.384)];
    return s + label(tp[0], tp[1], tp[0] - 40, tp[1] + 120, "زي الشعرة", PB, K(u, 1.6, 0.8), 18);
  });
  // 19 — the zeros and ones run through them as flashes of light, at about two thirds the speed of light
  shot(19, mv(320, 400, 1.0, 340, 400, 1.08), function (u, d, t) {
    var s = paper(), y = 430, B = "1011001110100101";
    s += R(-200, y - 34, 1040, 68, "#dfe6e6", 2, 34) + R(-200, y - 14, 1040, 28, "#c5d6dc", 1.4, 14) + R(-200, y - 34, 1040, 22, "url(#hatch)", 0);
    for (var i = 0; i < 16; i++) { var x = -200 + ((i * 70 + t * 260) % 1120), on = B.charAt(i) === "1"; s += bit(x, y - 110, on, 1.2, 1); if (on) s += '<rect x="' + f(x - 26) + '" y="' + (y - 12) + '" width="52" height="24" rx="12" fill="#fff6d8" stroke="' + PB + '" stroke-width="1.4"/><circle cx="' + f(x) + '" cy="' + y + '" r="30" fill="url(#glowW)"/>'; }
    return s + label(320, y + 10, 420, y + 170, "ومضة نور = 1", PB, K(u, 0.4), 22) + numBox("≈ 200,000 كم/ث", 320, 690, K(u, 1.6, 0.6), 24);
  });
  // 20 — many of these cables leave from Alexandria and cross the Mediterranean to France
  var M = GEO.med, ALX = M.pts.ALX, MRS = M.pts.MRS, MFRA = M.pts.FRA;
  shot(20, function (u, d) { var k = ease(clamp(u / d)); return [lerp(560, 380, k), lerp(520, 420, k), lerp(1.5, 1.0, k)]; }, function (u, d, t) {
    var k = ease(K(u, 0.3, 3.2)), s = medMap({}, t) + route(M, k, t) + beads(M.sea, k, t, 6, PB) + pin(ALX[0], ALX[1], 1) + pin(MRS[0], MRS[1], K(u, 3.2, 0.5));
    return s + label(ALX[0], ALX[1], ALX[0] - 20, ALX[1] + 90, "إسكندرية", OLIVE, K(u, 0.2), 24) + label(MRS[0], MRS[1], MRS[0] + 60, MRS[1] + 110, "فرنسا", OLIVE, K(u, 3.3), 24);
  });
  // 21 — from there it carries on over land to the app's servers, then to your friend's phone
  shot(21, mv(260, 300, 1.05, 280, 260, 1.15), function (u, d, t) {
    var k = ease(K(u, 0.2, 1.6)), s = medMap({}, t) + route(M, 1, t, k) + beads(M.landr, k, t, 4, PB) + pin(ALX[0], ALX[1], 1) + pin(MRS[0], MRS[1], 1) + pin(MFRA[0], MFRA[1], K(u, 1.6, 0.5));
    isoAt(-40, -20, 1.5); var dc = ""; for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) dc += rack(c * 26, r * 30, 0, 18, 14, 50, t, r * 3 + c);
    s += inset(MFRA[0] + 170, MFRA[1] + 130, 110, '<rect x="-120" y="-120" width="240" height="240" fill="' + PAPER + '"/>' + dc, K(u, 1.8, 0.6));
    return s + label(MFRA[0], MFRA[1], MFRA[0] - 120, MFRA[1] - 40, "السيرفرات", PB, K(u, 2.2), 22);
  });
  // 22 — each packet may take a different road and arrive out of order
  var R2 = GEO.med.other[0].concat([MFRA]);
  shot(22, mv(320, 360, 1.0, 330, 320, 1.08), function (u, d, t) {
    var A = [ALX].concat(M.sea).concat(M.landr), s = medMap({}, t) + route(M, 1, t, 1) + cable(R2, 1, LANDD, 6) + pin(ALX[0], ALX[1], 1) + pin(MFRA[0], MFRA[1], 1) + chapter(4, K(u, 0, 0.6));
    [1, 2, 3, 4, 5, 6].forEach(function (n, i) { var path = i % 2 ? R2 : A, sp = i % 2 ? 0.42 : 0.3, q = Math.min(0.995, clamp((u - 0.2 - i * 0.18) * sp)); if (q <= 0) return; var c = pat(path, q); s += pkt(c[0], c[1] - 16, 0.7, n, 0); });
    return s + label(MFRA[0], MFRA[1], MFRA[0] + 90, MFRA[1] - 20, "مش بالترتيب", ORANGE, K(u, 2.0), 20);
  });
  // 23 — your friend's phone stacks them back in order of their numbers
  var ORD = [3, 1, 6, 2, 8, 4, 7, 5];
  function cards(u, t, k, missing, fly) {
    var s = ""; ORD.forEach(function (n, i) { var sx = 440 + (i % 2) * 90 + 30 * Math.sin(i * 2.1), sy = 200 + Math.floor(i / 2) * 110 + 30 * Math.cos(i * 1.7), gx = 425 + ((n - 1) % 2) * 100, gy = 210 + Math.floor((n - 1) / 2) * 100;
      if (n === missing) { s += R(gx - 32, gy - 22, 64, 44, "none", 2, 4, ' stroke-dasharray="6 5"'); if (fly != null && fly > 0) { var fy = lerp(-120, gy, ease(fly)); s += pkt(gx, fy, 1.15, n, 0); } return; }
      s += pkt(lerp(sx, gx, k), lerp(sy, gy, k), 1.15, n, (1 - k) * (hash(i) - 0.5) * 40); });
    return s;
  }
  shot(23, mv(320, 400, 1.0, 340, 390, 1.06), function (u, d, t) {
    return paper() + phone(170, 410, 0.85, 0, function (w, h) { return R(0, 0, w, h, "#e7dcc4", 0); }) + cards(u, t, ease(K(u, 0.4, 1.4)));
  });
  // 24 — and if a packet got lost on the way, it asks for it again
  shot(24, mv(340, 380, 1.05, 340, 380, 1.12), function (u, d, t) {
    var fly = K(u, 1.3, 0.9), s = paper() + phone(170, 410, 0.85, 0, function (w, h) { return R(0, 0, w, h, "#e7dcc4", 0); }) + cards(u, t, 1, 5, fly);
    if (fly <= 0) s += qmark(425, 438, K(u, 0.2, 0.5), 46);
    return s + label(210, 240, 360, 120, "ابعتها تاني", ORANGE, K(u, 0.6, 0.7), 20);
  });
  // 25 — numbers become dots again, and the dots become your photo
  shot(25, mv(320, 420, 1.1, 320, 410, 1.2), function (u, d, t) {
    var pix = 1 - ease(K(u, 1.0, 1.4)), cols = 12, fill = K(u, 0, 1.0), s = paper();
    s += phone(320, 420, 1.1, 0, function (w, h) { var rows = 25, cw = w / cols, ch = h / rows, g = "", n = Math.floor(fill * cols * rows); if (pix < 1) g += photo(w, h, t, pix, cols); else for (var q = 0; q < n; q++) { var i = q % cols, j = Math.floor(q / cols); g += '<rect x="' + f(i * cw) + '" y="' + f(j * ch) + '" width="' + f(cw + 0.3) + '" height="' + f(ch + 0.3) + '" fill="' + photoCol((i + 0.5) * cw, (j + 0.5) * ch, w, h) + '" stroke="' + INK + '" stroke-opacity=".18"/>'; } return g; });
    return s + label(420, 230, 540, 110, "صورتك", ORANGE, K(u, 2.4, 0.7), 24);
  });
  // 26 — so in short: your photo was cut into pieces, crossed under the sea as light, and became a photo again
  shot(26, mv(310, 340, 1.4, 320, 400, 1.0), function (u, d, t) {
    var s = globe({ cables: 1 }, t) + cable(ROUTE, 1, PB, 5) + beads(ROUTE, 1, t, 9, PB) + pin(CAI[0], CAI[1], 1) + pin(FRA[0], FRA[1], 1);
    var A = GEO.globe.sea[0], B = GEO.globe.sea[GEO.globe.sea.length - 1];
    [[CAI, "1"], [A, "2"], [B, "3"], [FRA, "4"]].forEach(function (c, i) { s += callout(c[1], c[0][0] + 24, c[0][1] - 24, K(u, 0.4 + i * 1.1, 0.5)); });
    return s;
  });
  // 27 is the summary card; this keeps the panel valid behind it
  shot(27, mv(320, 400, 1, 320, 400, 1), function (u, d, t) { return globe({ cables: 1 }, t); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__outro = function (svg, u, t) {
    var M2 = GEO.med, Z = 0.48, TX = 110, TY = -20, P = function (q) { return [TX + q[0] * Z, TY + q[1] * Z]; }, mapP = function (a) { return a.map(P); };
    var s = '<rect width="580" height="300" fill="' + SKY + '"/><g transform="translate(' + TX + ' ' + TY + ') scale(' + Z + ')"><path d="' + M2.land + '" fill="' + LAND + '" stroke="' + INK + '" stroke-width="2.4"/></g>';
    var k = ease(clamp(u / 2.0)), sea = mapP(M2.sea), lr = mapP(M2.landr);
    M2.other.forEach(function (p) { s += cable(mapP(p), 1, "#7d8d5c", 2.4); });
    s += cable(sea, k, LANDD, 4) + cable(lr, clamp(k * 2 - 1), LANDD, 4) + beads(sea.concat(lr), k, t, 6, PB) + pin(P(M2.pts.ALX)[0], P(M2.pts.ALX)[1], 1, 7) + pin(P(M2.pts.FRA)[0], P(M2.pts.FRA)[1], 1, 7);
    var mid = sea[Math.floor(sea.length / 2)];
    [[P(M2.pts.CAI), "1"], [mid, "2"], [P(M2.pts.MRS), "3"], [P(M2.pts.FRA), "4"]].forEach(function (c, i) { s += callout(c[1], c[0][0] + 20, c[0][1] - 20, (u - 0.3 - i * 0.2) / 0.6); });
    s += '<rect width="580" height="300" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = Math.round(99 * clamp(u / 2.0)) + '%';
    svg.style.transform = 'scale(' + f(1 + 0.03 * Math.sin(t * 1.4)) + ')';
    svg.innerHTML = s;
  };
  window.__parts = { GEO: GEO, ROUTE: ROUTE, tube: tube, beads: beads, inset: inset, pd: pd, phone: phone, photo: photo, globe: globe, medMap: medMap, router: router, rack: rack, room: room, satellite: satellite, pkt: pkt, cable: cable, pin: pin, label: label, T: T, TS: TS };
})();
