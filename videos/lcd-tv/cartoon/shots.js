  // ── new pieces for this episode ─────────────────────────
  var INK = "#1c1c1c", RC = "#ff3b2f", GC = "#36d26a", BC = "#3b7bff", LIGHT = "#fff6c8";
  function rgb(r, g, b) { return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"; }
  // the living room: wall, floor, a lamp and a plant
  function room(t, dim) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gWall)"/><rect x="-400" y="282" width="1440" height="400" fill="url(#gFloor)"/><path d="M-400 282 H1040" stroke="#5a3c20" stroke-width="4"/>';
    for (var b = 0; b < 12; b++) s += '<path d="M' + (-380 + b * 130) + ' 282 L' + (-460 + b * 150) + ' 680" stroke="#6a4a2a" stroke-width="2" opacity=".5"/>';
    s += '<path d="M-120 282 V140 M-140 140 H-100 L-90 100 H-150 Z" stroke="#3a3d42" stroke-width="4" fill="#f2c230"/><circle cx="-120" cy="120" r="40" fill="#fff1c8" opacity="' + f(0.2 + 0.05 * Math.sin(t * 2)) + '" filter="url(#soft)"/>';
    s += '<path d="M760 282 h40 l-6 -40 h-28 Z" fill="#b9442a" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2, 3, 4].map(function (k) { var a = -1.2 + k * 0.6 + Math.sin(t * 1.4 + k) * 0.08; return '<path d="M780 242 Q' + f(780 + Math.sin(a) * 30) + ' ' + f(200 - k * 4) + ' ' + f(780 + Math.sin(a) * 50) + ' ' + f(176 + Math.abs(k - 2) * 10) + '" stroke="#4f8f5a" stroke-width="8" fill="none" stroke-linecap="round"/>'; }).join("");
    if (dim) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1730" opacity="' + dim + '"/>';
    return s;
  }
  // a flat TV on a stand; inner(w,h) returns the picture drawn in screen coordinates (0..w, 0..h)
  var CLIPN = 0;
  function tv(x, y, w, h, t, inner, o) {
    o = o || {}; var id = "tvc" + (++CLIPN), s = '<g transform="translate(' + f(x - w / 2) + ' ' + f(y - h / 2) + ')">';
    s += '<rect x="' + (w / 2 - 50) + '" y="' + (h + 10) + '" width="100" height="10" rx="4" fill="#2b2f34"/><path d="M' + (w / 2 - 10) + ' ' + h + ' h20 v12 h-20 Z" fill="#2b2f34"/>';
    s += '<rect x="-10" y="-10" width="' + (w + 20) + '" height="' + (h + 20) + '" rx="8" fill="url(#gBezel)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<clipPath id="' + id + '"><rect width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + id + ')"><rect width="' + w + '" height="' + h + '" fill="#06080a"/>' + (inner ? inner(w, h) : "") + '</g>';
    s += '<path d="M6 6 L' + f(w * 0.3) + ' 6 L6 ' + f(h * 0.5) + ' Z" fill="#fff" opacity=".07"/>';
    if (o.glow) s += '<rect x="-14" y="-14" width="' + (w + 28) + '" height="' + (h + 28) + '" rx="10" fill="none" stroke="#fff6c8" stroke-width="8" opacity="' + o.glow + '" filter="url(#soft)"/>';
    return s + '</g>';
  }
  // the picture on the TV: a sunset over hills with a sailing boat, moving
  function picture(t) { return function (w, h) {
    var s = '<rect width="' + w + '" height="' + h + '" fill="url(#gPic)"/><circle cx="' + f(w * 0.68) + '" cy="' + f(h * 0.58) + '" r="' + f(h * 0.16) + '" fill="#fff1c8"/>';
    s += '<path d="M0 ' + f(h * 0.72) + ' Q' + f(w * 0.25) + ' ' + f(h * 0.56) + ' ' + f(w * 0.5) + ' ' + f(h * 0.7) + ' T' + w + ' ' + f(h * 0.66) + ' V' + h + ' H0 Z" fill="#2f5a3a"/><rect y="' + f(h * 0.8) + '" width="' + w + '" height="' + f(h * 0.2) + '" fill="#1f3f6a"/>';
    var bx = ((t * 14) % (w + 60)) - 30; s += '<path d="M' + f(bx - 14) + ' ' + f(h * 0.84) + ' h28 l-5 6 h-18 Z M' + f(bx) + ' ' + f(h * 0.84) + ' V' + f(h * 0.7) + ' L' + f(bx + 12) + ' ' + f(h * 0.82) + ' Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1"/>';
    for (var k = 0; k < 3; k++) { var bxx = ((t * 20 + k * 90) % (w + 40)) - 20; s += '<path d="M' + f(bxx) + ' ' + f(h * 0.2 + k * 8) + ' q4 -4 8 0 q4 -4 8 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>'; }
    return s; }; }
  // a block of subpixels: each pixel = three vertical stripes R, G, B. lv(c, r, k) → 0..1 brightness of subpixel k
  function subgrid(x0, y0, cols, rows, sz, lv, o) {
    o = o || {}; var s = '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(cols * sz) + '" height="' + f(rows * sz) + '" fill="#08090b"/>', base = [[255, 59, 47], [54, 210, 106], [59, 123, 255]], gap = Math.max(0.6, sz * 0.06);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) for (var k = 0; k < 3; k++) { var v = clamp(lv(c, r, k)), b = base[k];
      s += '<rect x="' + f(x0 + c * sz + k * sz / 3 + gap) + '" y="' + f(y0 + r * sz + gap) + '" width="' + f(sz / 3 - gap * 2) + '" height="' + f(sz - gap * 2) + '" rx="' + f(sz * 0.05) + '" fill="' + rgb(20 + (b[0] - 20) * v, 20 + (b[1] - 20) * v, 22 + (b[2] - 22) * v) + '"/>'; }
    if (o.glow) s += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(cols * sz) + '" height="' + f(rows * sz) + '" fill="#fff" opacity=".06"/>';
    return s;
  }
  function lens(x, y, r, inner, t) {   // a magnifying glass: what's inside is drawn by inner() around (x, y)
    var id = "lc" + (++CLIPN); return '<clipPath id="' + id + '"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="none" stroke="#2b2f34" stroke-width="12"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="none" stroke="#c9a650" stroke-width="5"/><path d="M' + f(x + r * 0.7) + ' ' + f(y + r * 0.7) + ' L' + f(x + r * 1.35) + ' ' + f(y + r * 1.35) + '" stroke="#5a3c20" stroke-width="22" stroke-linecap="round"/><path d="M' + f(x - r * 0.6) + ' ' + f(y - r * 0.3) + ' Q' + f(x - r * 0.5) + ' ' + f(y - r * 0.65) + ' ' + f(x - r * 0.2) + ' ' + f(y - r * 0.72) + '" stroke="#fff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>'; }
  // the pixel mascot: one pixel (R G B stripes) with eyes
  function pixelGuy(x, y, s, mood, t) {
    var b = Math.abs(Math.sin(t * 3)) * 6 * s, g = '<g transform="translate(' + f(x) + ' ' + f(y - b) + ') scale(' + s + ') rotate(' + f(Math.sin(t * 2) * 3) + ')">';
    g += '<rect x="-46" y="-46" width="92" height="92" rx="12" fill="#08090b" stroke="' + INK + '" stroke-width="4"/>' + [RC, GC, BC].map(function (c, k) { return '<rect x="' + (-40 + k * 28) + '" y="-40" width="24" height="80" rx="5" fill="' + c + '"/>'; }).join("");
    g += '<circle cx="-14" cy="-8" r="9" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="14" cy="-8" r="9" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    var bl = ((t * 0.5) % 1) < 0.05; g += bl ? '<path d="M-20 -8 h12 M8 -8 h12" stroke="' + INK + '" stroke-width="3"/>' : '<circle cx="-12" cy="-7" r="4" fill="' + INK + '"/><circle cx="16" cy="-7" r="4" fill="' + INK + '"/>';
    g += mood === "happy" ? '<path d="M-14 16 q14 14 28 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>' : '<ellipse cx="0" cy="18" rx="6" ry="8" fill="#fff"/>';
    return g + '</g>';
  }
  function viewer(x, y, t, mood, o) {   // a ball-head person on the sofa, seen from the side, facing right
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-90" y="-10" width="180" height="60" rx="18" fill="url(#gSofa)" stroke="' + INK + '" stroke-width="3"/><rect x="-100" y="-70" width="40" height="120" rx="16" fill="url(#gSofa)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M-40 -10 C-44 -60 -20 -76 10 -76 C40 -76 52 -50 48 -10 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="3"/>' + head(4, -110, 34, mood, t, 1);
    if (o.remote) s += '<path d="M40 -44 L80 -54" stroke="#c23a26" stroke-width="14" stroke-linecap="round"/><rect x="74" y="-64" width="26" height="12" rx="4" fill="#2b2f34" stroke="' + INK + '" stroke-width="2" transform="rotate(-14 87 -58)"/>';
    return s + '</g>';
  }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // one bundle of light: a double arrow showing which way it shakes (ang 0 = up/down, 90 = side to side), drawn as a wave from the side
  function photon(x, y, ang, col, s, t) { s = s || 1; var a = ang * Math.PI / 180, dx = Math.sin(a) * 16 * s, dy = Math.cos(a) * 16 * s, sq = Math.abs(Math.cos(a));
    var w = "M" + f(x - 22 * s) + " " + f(y); for (var i = 1; i <= 12; i++) { var xx = x - 22 * s + i * 44 * s / 12; w += " L" + f(xx) + " " + f(y + Math.sin(i / 12 * Math.PI * 4 - t * 8) * 8 * s * sq); }
    return '<path d="' + w + '" stroke="' + (col || LIGHT) + '" stroke-width="' + f(3 * s) + '" fill="none" opacity=".75"/><path d="M' + f(x - dx) + ' ' + f(y - dy) + ' L' + f(x + dx) + ' ' + f(y + dy) + '" stroke="' + INK + '" stroke-width="' + f(6 * s) + '" stroke-linecap="round"/><path d="M' + f(x - dx) + ' ' + f(y - dy) + ' L' + f(x + dx) + ' ' + f(y + dy) + '" stroke="' + (col || "#ffd23a") + '" stroke-width="' + f(3 * s) + '" stroke-linecap="round"/>' +
      [-1, 1].map(function (e) { var px = x + e * dx, py = y + e * dy, ha = Math.atan2(e * dy, e * dx); return '<path d="M' + f(px + Math.cos(ha) * 6 * s) + ' ' + f(py + Math.sin(ha) * 6 * s) + ' L' + f(px + Math.cos(ha + 2.4) * 7 * s) + ' ' + f(py + Math.sin(ha + 2.4) * 7 * s) + ' L' + f(px + Math.cos(ha - 2.4) * 7 * s) + ' ' + f(py + Math.sin(ha - 2.4) * 7 * s) + ' Z" fill="' + (col || "#ffd23a") + '" stroke="' + INK + '" stroke-width="1.4"/>'; }).join(""); }
  // a polarizer seen face-on as a frame with bars: dir "v" (bars standing) or "h" (bars lying)
  function polarizer(x, y, w, h, dir, o) { o = o || {}; var s = '<rect x="' + f(x - w / 2) + '" y="' + f(y - h / 2) + '" width="' + w + '" height="' + h + '" rx="6" fill="#cfe6f2" fill-opacity=".35" stroke="' + INK + '" stroke-width="3"/>';
    if (dir === "v") for (var i = 1; i < 9; i++) s += '<path d="M' + f(x - w / 2 + i * w / 9) + ' ' + f(y - h / 2 + 4) + ' V' + f(y + h / 2 - 4) + '" stroke="#3a4a5a" stroke-width="' + (o.bw || 4) + '"/>';
    else for (var j = 1; j < 9; j++) s += '<path d="M' + f(x - w / 2 + 4) + ' ' + f(y - h / 2 + j * h / 9) + ' H' + f(x + w / 2 - 4) + '" stroke="#3a4a5a" stroke-width="' + (o.bw || 4) + '"/>';
    return s; }
  // liquid-crystal rods between the two filters; twist 0..1 (1 = full quarter turn from front to back), stand 0..1 (voltage: rods line up with the light)
  function rods(x0, x1, y, n, twist, stand, t) { var s = ""; for (var i = 0; i < n; i++) { var u = i / (n - 1), a = 90 * u * twist, x = lerp(x0, x1, u), wob = Math.sin(t * 3 + i) * 2;
      for (var r = -1; r <= 1; r++) { var yy = y + r * 46, len = lerp(34, 8, stand), wid = lerp(9, 9, stand), ra = lerp(a, 0, stand), sx = Math.abs(Math.cos(ra * Math.PI / 180)), lw = lerp(len * (0.35 + 0.65 * sx), len, 0);
        var hh = stand > 0.5 ? lerp(len, 10, (stand - 0.5) * 2) : lerp(34 * (0.25 + 0.75 * Math.cos(ra * Math.PI / 180)), len, stand * 2);
        s += '<ellipse cx="' + f(x + wob * 0.3) + '" cy="' + f(yy + wob) + '" rx="' + f(stand > 0.5 ? lerp(5, 16, (stand - 0.5) * 2) : lerp(5 + 11 * Math.sin(ra * Math.PI / 180), 5, stand * 2)) + '" ry="' + f(hh / 2) + '" fill="url(#gRod)" stroke="' + INK + '" stroke-width="1.6"/>'; } } return s; }
  function eye(x, y, s, open, t) { var o = clamp(open), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-30 0 Q0 -24 30 0 Q0 24 -30 0 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle r="' + f(10 + 2 * o) + '" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(5 - 2 * o) + '" fill="' + INK + '"/><circle cx="-4" cy="-4" r="2.4" fill="#fff"/></g>'; return g; }
  function bolt(x, y, s, col) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')" d="M4 -24 L-10 4 H0 L-4 24 L12 -6 H2 Z" fill="' + (col || "#f2c230") + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'; }
  function battery(x, y, on, t) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-30" y="-16" width="60" height="32" rx="5" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="30" y="-7" width="7" height="14" fill="#c9a650" stroke="' + INK + '" stroke-width="2"/><rect x="-26" y="-12" width="' + f(52 * (on ? 1 : 0.15)) + '" height="24" rx="3" fill="#4f8f5a"/>' + (on ? bolt(0, 0, 0.6) : "") + '</g>'; }
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function dark(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#151a24"/>'; for (var i = 0; i < 30; i++) { var x = -300 + hash(i) * 1240 + Math.sin(t * 0.5 + i) * 14, y = -200 + hash(i + 4) * 760 + Math.cos(t * 0.4 + i) * 10; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1 + hash(i + 2) * 2) + '" fill="#fff" opacity=".2"/>'; } return s; }
  // white backlight shining from the left
  function backlight(x, y, h, t) { var s = '<rect x="' + (x - 26) + '" y="' + (y - h / 2) + '" width="26" height="' + h + '" rx="6" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 5; k++) { var ly = y - h / 2 + (k + 0.5) * h / 5; s += '<circle cx="' + (x - 13) + '" cy="' + f(ly) + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x - 6) + '" cy="' + f(ly) + '" r="24" fill="url(#gGlowW)" opacity="' + f(0.7 + 0.2 * Math.sin(t * 5 + k)) + '"/>'; }
    return s + '<text x="' + (x - 13) + '" y="' + f(y + h / 2 + 26) + '" text-anchor="middle" style="font:800 16px Noto Serif;fill:' + INK + '">LED</text>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the screen you're watching has only three colours: living room, push in to the TV
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 380, k), lerp(180, 150, k), lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var s = room(t) + tv(380, 150, 260, 150, t, picture(t), { glow: 0.25 }) + viewer(80, 262, t, "happy", { remote: true, s: 0.8 });
    return s + tag("تلات ألوان بس!", 380, 260, u, 1.6, -3, 22);
  });
  // 1 — bring a magnifier close: tiny dots, red green blue
  shot(1, function (u, d) { return [lerp(330, 360, u / d), lerp(170, 160, u / d), lerp(1.3, 1.6, u / d)]; }, function (u, d, t) {
    var s = room(t) + tv(380, 150, 260, 150, t, picture(t)), lx = lerp(250, 400, ease(clamp(u / 2.4))) + Math.sin(t * 1.2) * 8, ly = 150 + Math.cos(t * 1.4) * 6;
    var inner = subgrid(lx - 120, ly - 120, 8, 8, 30, function (c, r, k) { var hue = ((c + r) / 14 + t * 0.05) % 1; return k === 0 ? 0.6 + 0.4 * Math.sin(hue * 6.28) : k === 1 ? 0.5 + 0.4 * Math.sin(hue * 6.28 + 2) : 0.4 + 0.4 * Math.sin(hue * 6.28 + 4); });
    s += lens(lx, ly, 78 * pop((u - 0.2) / 1), inner, t);
    return s + tag("أحمر، أخضر، أزرق", 380, 300, u, 2.0, 2, 20);
  });
  // 2 — so how do three colours make every picture? and how does a dot switch on and off?
  shot(2, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var on = Math.sin(t * 5) > 0, s = graphPaper(t) + subgrid(380, 90, 3, 3, 60, function (c, r, k) { return c === 1 && r === 1 ? (on ? 1 : 0) : ((c + r + k) % 3 === 0 ? 0.9 : 0.25); });
    s += '<g transform="translate(160 200) scale(.9)">' + head(0, 0, 60, "curious", t, 1) + '</g>' + qmark(250, 90, t, 54) + qmark(280, 140, t + 1, 36);
    return s + tag("إزاي بتنوّر وتطفي؟", 470, 320, u, 1.8, -2, 19);
  });
  // 3 — "إيه الحكاية؟"
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pixelGuy(320, 200, 1.2 * pop(u / 0.6), "happy", t);
    for (var i = 0; i < 8; i++) { var a = i * 0.785 + t * 0.7; s += '<circle cx="' + f(320 + Math.cos(a) * 120) + '" cy="' + f(190 + Math.sin(a) * 90) + '" r="6" fill="' + [RC, GC, BC][i % 3] + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    return s + tag("إيه الحكاية؟", 320, 60, u, 0.2, -3, 28);
  });
  // 4 — the "LED TV" is really an LCD with LED lamps behind it: the panel slides away and the lamps show
  shot(4, function (u, d) { return [lerp(320, 340, u / d), 175, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.8) / 1.6)), s = graphPaper(t);
    s += '<g transform="translate(' + f(170 - 40 * k) + ' 170)"><rect x="-110" y="-80" width="220" height="160" rx="6" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) { var lx = -90 + c * 36, ly = -60 + r * 40; s += '<circle cx="' + lx + '" cy="' + ly + '" r="22" fill="url(#gGlowW)" opacity="' + f(0.6 + 0.3 * Math.sin(t * 4 + r + c)) + '"/><rect x="' + (lx - 6) + '" y="' + (ly - 6) + '" width="12" height="12" rx="2" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>'; }
    s += '</g>' + tv(lerp(170, 470, k), 170, 230, 150, t, picture(t));
    return s + tag("LCD", lerp(170, 470, k), 290, u, 2.0, 2, 24) + tag("لمبات LED", 130, 300, u, 2.6, -2, 20) + '<path d="M240 300 h80" stroke="' + INK + '" stroke-width="3" stroke-dasharray="6 6" opacity="' + f(clamp(u - 2.6)) + '"/>';
  });
  // 5 — so the screen is lit from behind all the time, even in black scenes (x-ray view)
  shot(5, function (u, d) { return [320, 175, lerp(1.05, 1.25, u / d)]; }, function (u, d, t) {
    var s = room(t, 0.55) + tv(320, 160, 300, 170, t, function (w, h) { var g = '<rect width="' + w + '" height="' + h + '" fill="#0a0c10"/>'; for (var i = 0; i < 6; i++) g += '<circle cx="' + f(30 + i * 48) + '" cy="' + f(h / 2 + Math.sin(t * 2 + i) * 10) + '" r="40" fill="url(#gGlowW)" opacity="' + f(0.12 + 0.05 * Math.sin(t * 3 + i)) + '"/>'; return g + '<text x="' + (w / 2) + '" y="' + (h / 2 + 8) + '" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#fff;opacity:.5">مشهد أسود…</text>'; }, { glow: 0.5 });
    return s + tag("بس النور شغّال ورا!", 320, 300, u, 1.0, -2, 21);
  });
  // 6 — the trick: each dot opens and closes the light on its own (little shutters)
  shot(6, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = dark(t), n = 6;
    for (var r = 0; r < 4; r++) for (var c = 0; c < n; c++) { var x = 160 + c * 56, y = 90 + r * 56, op = clamp(0.5 + 0.8 * Math.sin(t * (1.5 + hash(r * 9 + c) * 2) + hash(c * 3 + r) * 6)); s += '<rect x="' + (x - 24) + '" y="' + (y - 24) + '" width="48" height="48" fill="' + LIGHT + '" opacity="' + f(0.25 + 0.75 * op) + '"/><rect x="' + (x - 24) + '" y="' + (y - 24) + '" width="' + f(24 * (1 - op)) + '" height="48" fill="#2b2f34" stroke="' + INK + '"/><rect x="' + f(x + 24 - 24 * (1 - op)) + '" y="' + (y - 24) + '" width="' + f(24 * (1 - op)) + '" height="48" fill="#2b2f34" stroke="' + INK + '"/><rect x="' + (x - 24) + '" y="' + (y - 24) + '" width="48" height="48" fill="none" stroke="' + INK + '" stroke-width="2"/>'; }
    return s + tag("كل نقطة لوحدها", 320, 330, u, 1.0, -2, 20);
  });
  // 7 — in front of the lamps: a polarizer, it lets light through shaking in one direction only
  shot(7, function (u, d) { return [lerp(280, 340, u / d), 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 220, t) + polarizer(330, 180, 70, 220, "v");
    for (var p = 0; p < 7; p++) { var uu = (t * 0.35 + p / 7) % 1, x = lerp(110, 620, uu), y = 90 + (p % 4) * 60, ang = [0, 90, 45, 135, 30, 70, 0][p]; if (x < 300) s += photon(x, y, ang, null, 1.3, t); else if (ang === 0) s += photon(x, y, 0, null, 1.3, t); else if (x < 340) s += photon(300, y, ang, null, 1.3 * (1 - (x - 300) / 40), t); }
    return s + tag("المستقطب", 330, 40, u, 0.6, -3, 21) + tag("اتجاه واحد بس", 500, 320, u, 2.0, 2, 18);
  });
  // 8 — like a fence with standing bars: a rope shaken up and down goes through, side to side doesn't
  shot(8, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + grass(t, 300, "#9dbb6e", "#6f9548") + '<rect x="300" y="60" width="40" height="250" fill="none"/>';
    for (var b = 0; b < 7; b++) s += '<rect x="' + (296 + (b % 2) * 26) + '" y="' + (60 + 0) + '" width="12" height="250" rx="4" fill="#8c6440" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M280 60 H360 M280 300 H360" stroke="#6b4a30" stroke-width="10"/>';
    var w1 = "M120 130", w2 = "M120 250"; for (var x = 120; x <= 600; x += 8) { var ph = x * 0.05 - t * 8, a1 = 22, a2 = x < 310 ? 14 : 14 * Math.max(0, 1 - (x - 310) / 30); w1 += " L" + x + " " + f(130 + Math.sin(ph) * a1); w2 += " L" + x + " " + f(250 + Math.sin(ph) * a2 * 0.35); }
    s += '<path d="' + w1 + '" stroke="#c23a26" stroke-width="7" fill="none" stroke-linecap="round"/><path d="' + w2 + '" stroke="#2f6f9f" stroke-width="7" fill="none" stroke-linecap="round"/>';
    for (var e = 0; e < 7; e++) { var ex = 130 + e * 24, sw = Math.sin(e * 0.05 * 24 - t * 8); s += '<ellipse cx="' + ex + '" cy="250" rx="3" ry="' + f(Math.abs(sw) * 12 + 2) + '" fill="none" stroke="#2f6f9f" stroke-width="1.6" opacity=".6" transform="rotate(80 ' + ex + ' 250)"/>'; }
    s += head(90, 130 + Math.sin(t * 8) * 10, 22, "happy", t, 1) + head(90, 250, 22, "worry", t, 1);
    return s + tag("لفوق وتحت: يعدّي", 480, 80, u, 0.8, 3, 17, "#bdf5c8") + tag("يمين وشمال: لأ", 480, 320, u, 2.0, -2, 17, "#ffb08a") + (u > 2.0 ? '<path d="M340 236 l24 24 M364 236 l-24 24" stroke="#c23a26" stroke-width="7" stroke-linecap="round"/>' : "");
  });
  // 9 — at the front of the screen, a second filter with lying bars
  shot(9, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 380, k), 180, lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + '<g transform="translate(' + f(lerp(200, 0, ease(clamp(u / 1.2)))) + ' 0)">' + polarizer(520, 180, 60, 220, "h") + '</g>';
    for (var p = 0; p < 4; p++) { var uu = (t * 0.35 + p / 4) % 1, x = lerp(270, 500, uu); s += photon(x, 100 + p * 50, 0, null, 1.15, t); }
    return s + tag("فلتر تاني… بالعرض", 520, 40, u, 0.9, 3, 19);
  });
  // 10 — so the light that passed the first can't pass the second: black
  shot(10, function (u, d) { return [lerp(360, 420, u / d), 180, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + polarizer(520, 180, 60, 220, "h");
    for (var p = 0; p < 4; p++) { var uu = (t * 0.4 + p / 4) % 1, x = lerp(270, 520, uu), sc = x > 490 ? 0.9 * (1 - (x - 490) / 30) : 0.9; if (sc > 0) s += photon(x, 100 + p * 50, 0, null, sc * 1.25, t); }
    s += '<path d="M500 160 l40 40 M540 160 l-40 40" stroke="#c23a26" stroke-width="8" stroke-linecap="round" opacity="' + f(clamp(u - 1)) + '"/>' + eye(610, 180, 1, 0, t) + '<rect x="575" y="150" width="70" height="60" fill="#000" opacity=".35"/>';
    return s + tag("سودا!", 420, 330, u, 2.0, -3, 24);
  });
  // 11 — enter the liquid crystal, the "LC" in LCD
  shot(11, function (u, d) { return [380, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + polarizer(520, 180, 60, 220, "h"), k = pop((u - 0.2) / 0.9);
    s += '<g opacity="' + f(clamp(k)) + '"><rect x="300" y="80" width="170" height="200" rx="10" fill="#c9b4f0" fill-opacity=".2" stroke="#7a5ab0" stroke-width="3" stroke-dasharray="8 6"/>' + rods(320, 450, 180, 6, 1, 0, t) + '</g>';
    return s + tag("كريستال سائل", 385, 62, u, 0.4, -2, 21, "#d9c8f7") + '<text x="385" y="330" text-anchor="middle" style="font:800 22px Noto Serif;fill:#f4f1e8;direction:ltr"><tspan fill="#f2c230">L</tspan>iquid <tspan fill="#f2c230">C</tspan>rystal <tspan fill="#f2c230">D</tspan>isplay</text>';
  });
  // 12 — its molecules are like little sticks, arranged in a spiral staircase
  shot(12, function (u, d) { return [lerp(300, 360, u / d), 180, lerp(1.2, 1.35, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), n = 9, tw = clamp(u / 1.6);
    s += '<path d="M150 180 H560" stroke="#b9b2a2" stroke-width="3" stroke-dasharray="8 6"/>';
    for (var i = 0; i < n; i++) { var x = 150 + i * 50, a = 90 * (i / (n - 1)) * tw + Math.sin(t * 2 + i) * 3, rx = 10 + 30 * Math.abs(Math.sin(a * Math.PI / 180)), ry = 10 + 30 * Math.abs(Math.cos(a * Math.PI / 180)) * 0.0 + 8;
      s += '<g transform="translate(' + x + ' 180) rotate(' + f(a) + ')"><rect x="-8" y="-46" width="16" height="92" rx="8" fill="url(#gRod)" stroke="' + INK + '" stroke-width="2" transform="scale(1 ' + f(0.4 + 0.6 * Math.cos(a * Math.PI / 360)) + ')"/></g>'; }
    return s + tag("عيدان صغيرة", 200, 60, u, 0.6, -3, 19) + tag("بتلف زي السلّم", 440, 280, u, 1.8, 2, 19);
  });
  // 13 — light going through turns with them a quarter turn, so it passes the second filter
  shot(13, function (u, d) { return [lerp(340, 400, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + rods(310, 460, 180, 6, 1, 0, t) + polarizer(520, 180, 60, 220, "h");
    for (var p = 0; p < 4; p++) { var uu = (t * 0.35 + p / 4) % 1, x = lerp(270, 640, uu), a = 90 * clamp((x - 300) / 170); s += photon(x, 100 + p * 50, a, null, 1.15, t); }
    s += eye(640, 180, 1, 1, t) + '<circle cx="640" cy="180" r="50" fill="url(#gGlowW)" opacity="' + f(0.4 + 0.2 * Math.sin(t * 4)) + '"/>';
    return s + tag("ربع لفة… وعدّى!", 400, 330, u, 1.4, -2, 21);
  });
  // 14 — apply voltage: the sticks stand straight, the light doesn't turn, it's blocked
  shot(14, function (u, d) { return [lerp(340, 380, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var on = clamp((u - 1.0) / 0.8), s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + rods(310, 460, 180, 6, 1, on, t) + polarizer(520, 180, 60, 220, "h");
    s += '<path d="M300 60 H470 M300 300 H470" stroke="#c9a650" stroke-width="6"/>' + battery(385, 40, on > 0.5, t) + (on > 0.5 ? bolt(330, 70, 0.5) + bolt(440, 290, 0.5) : "");
    for (var p = 0; p < 4; p++) { var uu = (t * 0.35 + p / 4) % 1, x = lerp(270, 560, uu), a = 90 * clamp((x - 300) / 170) * (1 - on), sc = x > 490 && a < 45 ? 0.9 * Math.max(0, 1 - (x - 490) / 30) : 0.9; if (sc > 0) s += photon(x, 100 + p * 50, a, null, sc * 1.25, t); }
    s += eye(640, 180, 1, 1 - on, t) + (on > 0.5 ? '<rect x="605" y="150" width="70" height="60" fill="#000" opacity=".3"/>' : "");
    return s + tag("كهربا = اتقفل", 420, 330, u, 1.6, -2, 21);
  });
  // 15 — a little voltage: only part of the light gets through, the colour is darker (a dimmer)
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var v = 0.5 + 0.45 * Math.sin(t * 1.6), s = dark(t) + backlight(90, 180, 220, t) + polarizer(250, 180, 60, 220, "v") + rods(310, 460, 180, 6, 1, v, t) + polarizer(520, 180, 60, 220, "h");
    s += '<rect x="580" y="110" width="80" height="140" rx="8" fill="' + LIGHT + '" opacity="' + f(1 - v) + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<g transform="translate(385 40)"><rect x="-80" y="-8" width="160" height="16" rx="8" fill="#2b2f34" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(-80 + 160 * v) + '" cy="0" r="14" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/></g>';
    return s + tag("شوية كهربا = نص نور", 400, 330, u, 0.8, -2, 19);
  });
  // 16 — each dot has a colour filter in front: red, green or blue
  shot(16, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = dark(t) + backlight(90, 180, 240, t);
    [RC, GC, BC].forEach(function (c, k) { var y = 100 + k * 80, p = pop((u - 0.3 - k * 0.5) / 0.9); s += '<rect x="280" y="' + (y - 30) + '" width="60" height="60" rx="6" fill="' + c + '" stroke="' + INK + '" stroke-width="3" transform="translate(310 ' + y + ') scale(' + f(p) + ') translate(-310 ' + (-y) + ')"/>';
      for (var q = 0; q < 3; q++) { var uu = (t * 0.5 + q / 3 + k * 0.1) % 1, x = lerp(120, 600, uu); s += '<circle cx="' + f(x) + '" cy="' + y + '" r="9" fill="' + (x < 310 ? "#fff" : c) + '" stroke="' + INK + '" stroke-width="1.6"/>'; } });
    return s + tag("فلتر لون", 310, 40, u, 0.4, -3, 21);
  });
  // 17 — three side by side make one pixel
  shot(17, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(1.6, 0.9, k)]; }, function (u, d, t) {
    var s = graphPaper(t) + subgrid(200, 60, 4, 4, 60, function (c, r, k) { return c === 1 && r === 1 ? 1 : 0.35 + 0.2 * Math.sin(t * 2 + c + r + k); });
    s += '<rect x="256" y="116" width="68" height="68" fill="none" stroke="#f2c230" stroke-width="5" rx="4"/>';
    return s + tag("بكسل واحد", 460, 150, u, 0.4, 3, 21);
  });
  // 18 — red and green on together: your eye sees yellow
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var m = clamp((u - 0.6) / 1.0), s = dark(t);
    s += '<circle cx="' + f(lerp(200, 290, m)) + '" cy="180" r="' + f(80 + 6 * Math.sin(t * 4)) + '" fill="' + RC + '" opacity=".85" style="mix-blend-mode:screen"/><circle cx="' + f(lerp(440, 350, m)) + '" cy="180" r="' + f(80 + 6 * Math.sin(t * 4 + 1.5)) + '" fill="' + GC + '" opacity=".85" style="mix-blend-mode:screen"/>';
    s += '<circle cx="320" cy="180" r="' + f(46 * m) + '" fill="#ffe23a"/>';
    for (var sp = 0; sp < 10; sp++) { var sa = sp * 0.628 + t * 1.2; s += '<circle cx="' + f(320 + Math.cos(sa) * 150) + '" cy="' + f(180 + Math.sin(sa) * 110) + '" r="3" fill="#fff" opacity=".5"/>'; }
    return s + eye(320, 310, 0.9, 1, t) + tag("= أصفر!", 520, 70, u, 1.4, 3, 24, "#fff1a0");
  });
  // 19 — all three full on: white
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var m = clamp((u - 0.3) / 0.9), s = dark(t);
    [[RC, -Math.PI / 2], [GC, Math.PI / 6], [BC, Math.PI * 5 / 6]].forEach(function (c) { var r = lerp(110, 40, m); s += '<circle cx="' + f(320 + Math.cos(c[1]) * r) + '" cy="' + f(175 + Math.sin(c[1]) * r) + '" r="' + f(74 + 6 * Math.sin(t * 4 + c[1])) + '" fill="' + c[0] + '" opacity=".85" style="mix-blend-mode:screen"/>'; });
    s += '<circle cx="320" cy="175" r="' + f(36 * m) + '" fill="#fff"/>';
    for (var sp = 0; sp < 10; sp++) { var sa = sp * 0.628 + t * 1.2; s += '<circle cx="' + f(320 + Math.cos(sa) * 150) + '" cy="' + f(180 + Math.sin(sa) * 110) + '" r="3" fill="#fff" opacity=".5"/>'; }
    return s + tag("= أبيض!", 520, 70, u, 1.0, 3, 24, "#f4f1e8");
  });
  // 20 — a 4K screen: about 8 million pixels, 25 million dots (zoom out from one pixel to the whole TV)
  shot(20, function (u, d) { var k = ease(clamp(u / (d - 0.6))); return [320, 180, Math.exp(lerp(Math.log(6), Math.log(0.95), k))]; }, function (u, d, t) {
    var s = room(t) + tv(320, 180, 300, 170, t, function (w, h) { var g = picture(t)(w, h); return g; });
    var k = ease(clamp(u / (d - 0.6))); if (k < 0.7) s += '<g opacity="' + f(1 - k / 0.7) + '">' + subgrid(170, 95, 30, 17, 10, function (c, r, kk) { var hue = (c / 30 + r / 34) % 1; return kk === 0 ? 0.5 + 0.5 * Math.sin(hue * 6.3) : kk === 1 ? 0.4 + 0.4 * Math.sin(hue * 6.3 + 2) : 0.5 + 0.4 * Math.cos(hue * 6.3); }) + '</g>';
    var px = Math.round(8294400 * clamp((u - 1.2) / 2)), sp = Math.round(24883200 * clamp((u - 2.6) / 1.6));
    s += '<g transform="translate(320 320)"><rect x="-170" y="-26" width="340" height="52" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3" opacity="' + f(clamp(u - 1)) + '"/><text y="9" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#7cf29a;opacity:' + f(clamp(u - 1)) + '">' + (u < 2.6 ? px.toLocaleString("en") + " بكسل" : sp.toLocaleString("en") + " نقطة!") + '</text></g>';
    return s + tag("4K", 470, 70, u, 0.6, 3, 26);
  });
  // 21 — every dot changes 60 times a second or more (frames flick by)
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var fr = Math.floor(t * 8), s = dark(t);
    for (var k = 3; k >= 0; k--) { var x = 230 + k * 26, y = 140 - k * 16; s += '<rect x="' + (x - 120) + '" y="' + (y - 70) + '" width="240" height="140" rx="6" fill="#08090b" stroke="#f4f1e8" stroke-width="2" opacity="' + f(1 - k * 0.2) + '"/>'; }
    s += subgrid(110, 70, 12, 7, 20, function (c, r, kk) { return 0.5 + 0.5 * Math.sin((c + r) * 0.8 + fr * 1.7 + kk * 2); });
    var c = Math.round(60 * clamp(u / 1.6)); s += '<g transform="translate(500 200)"><circle r="70" fill="#f4efe4" stroke="' + INK + '" stroke-width="4"/><path d="M0 0 L' + f(Math.sin(t * 6.28) * 56) + ' ' + f(-Math.cos(t * 6.28) * 56) + '" stroke="#c23a26" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/><text y="38" text-anchor="middle" style="font:800 22px Noto Serif;fill:' + INK + '">' + c + '</text></g>';
    return s + tag("60 مرة في الثانية!", 330, 320, u, 1.2, -2, 20);
  });
  // 22 — behind each dot, a tiny transistor decides how much voltage it gets (rows and columns of wires)
  shot(22, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2f5a3a"/>', rows = 4, cols = 6;
    for (var r = 0; r < rows; r++) s += '<path d="M60 ' + (80 + r * 66) + ' H600" stroke="#c9a650" stroke-width="4"/>';
    for (var c = 0; c < cols; c++) s += '<path d="M' + (110 + c * 84) + ' 40 V330" stroke="#c9a650" stroke-width="4"/>';
    var ar = Math.floor(t * 2.5) % rows; s += '<path d="M60 ' + (80 + ar * 66) + ' H600" stroke="#ffe23a" stroke-width="6" opacity=".9" filter="url(#glow)"/>';
    for (var r2 = 0; r2 < rows; r2++) for (var c2 = 0; c2 < cols; c2++) { var x = 110 + c2 * 84 + 18, y = 80 + r2 * 66 + 14, lit = r2 === ar;
      s += '<rect x="' + (x + 8) + '" y="' + (y + 4) + '" width="40" height="36" rx="3" fill="' + [RC, GC, BC][c2 % 3] + '" opacity="' + f(lit ? 0.95 : 0.35 + 0.2 * hash(r2 * 7 + c2)) + '"/><rect x="' + (x - 10) + '" y="' + (y - 8) + '" width="18" height="14" rx="2" fill="url(#gChip)" stroke="' + INK + '" stroke-width="1.4"/>'; }
    s += '<g transform="translate(520 70) scale(' + f(pop((u - 0.6) / 1)) + ')"><rect x="-44" y="-22" width="88" height="44" rx="6" fill="url(#gChip)" stroke="' + INK + '" stroke-width="3"/><path d="M-30 22 v12 M0 22 v12 M30 22 v12" stroke="#c9a650" stroke-width="4"/><text y="7" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#f4f1e8">ترانزستور</text></g>';
    return s + tag("بيقرر الكهربا", 250, 300, u, 1.6, -2, 19);
  });
  // 23 — so the picture in front of you is millions of gates opening and closing in front of white light
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [lerp(360, 300, k), lerp(150, 180, k), lerp(1.5, 1.0, k)]; }, function (u, d, t) {
    var s = room(t) + tv(380, 150, 260, 150, t, function (w, h) { var g = picture(t)(w, h); for (var r = 0; r < 6; r++) for (var c = 0; c < 10; c++) { var op = 0.5 + 0.5 * Math.sin(t * 3 + c * 0.9 + r * 1.3); g += '<rect x="' + (c * 26 + 2) + '" y="' + (r * 25 + 2) + '" width="' + f(11 * (1 - op)) + '" height="22" fill="#000" opacity=".35"/><rect x="' + f(c * 26 + 24 - 11 * (1 - op)) + '" y="' + (r * 25 + 2) + '" width="' + f(11 * (1 - op)) + '" height="22" fill="#000" opacity=".35"/>'; } return g; }, { glow: 0.3 });
    s += viewer(80, 262, t, "shock", { s: 0.8 });
    return s + tag("ملايين البوابات!", 380, 280, u, 1.0, -2, 21);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pixelGuy(240, 190, 1.0, "happy", t) + '<g transform="translate(420 200) scale(.9)">' + head(0, 0, 56, "happy", t, -1) + '</g>';
    return s + qmark(470, 100, t, 56) + qmark(520, 140, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { room: room, tv: tv, picture: picture, subgrid: subgrid, lens: lens, pixelGuy: pixelGuy, viewer: viewer, tag: tag };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
