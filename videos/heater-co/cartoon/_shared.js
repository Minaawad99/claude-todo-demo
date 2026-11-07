  // ── pieces shared with the pregnancy episode (videos/pregnancy/cartoon/shots.js) ──
  var INK = "#1c1c1c", CLIPN = 0;
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function bgc(c) { return '<rect x="-400" y="-300" width="1440" height="960" fill="' + c + '"/>'; }
  function limb(x1, y1, x2, y2, w, col) { var d = 'M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3.2) + '" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" stroke-linecap="round"/>'; }
  function limbQ(x1, y1, cx, cy, x2, y2, w, col) { var d = 'M' + f(x1) + ' ' + f(y1) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(x2) + ' ' + f(y2); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 3.2) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>'; }
  function bz(p, k) { var q = 1 - k; return [q * q * q * p[0] + 3 * q * q * k * p[2] + 3 * q * k * k * p[4] + k * k * k * p[6], q * q * q * p[1] + 3 * q * q * k * p[3] + 3 * q * k * k * p[5] + k * k * k * p[7]]; }
  function big(text, x, y, size, col, u, u0) { var k = u == null ? 1 : pop((u - u0) / 1.0); if (k <= 0) return ""; return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ') translate(' + f(-x) + ' ' + f(-y) + ')" style="font:900 ' + size + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:#1c1c1c;stroke-width:' + f(size / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function popIn(svg, x, y, u, u0) { var k = pop((u - u0) / 1.0); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ') translate(' + f(-x) + ' ' + f(-y) + ')">' + svg + '</g>'; }
  function badge(n, x, y, u, u0) {   // the stage badge: a numbered disc with «المرحلة»
    var k = pop((u - u0) / 1.0); if (k <= 0) return "";
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><rect x="-74" y="-22" width="148" height="44" rx="22" fill="#2b2016" stroke="#f2c230" stroke-width="3"/><circle cx="52" cy="0" r="17" fill="#f2c230"/><text x="52" y="8" text-anchor="middle" style="font:900 22px Noto Sans Arabic;fill:#2b2016">' + n + '</text><text x="-12" y="8" text-anchor="middle" style="font:800 19px Noto Sans Arabic;fill:#fff">المرحلة</text></g>';
  }

  function face(x, y, r, mood, t, look) {
    if (mood !== "sleep" && mood !== "cry") return head(x, y, r, mood, t, look);
    var k = r / 13, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/>';
    s += '<path d="M' + f(-7 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(-1 * k) + ' q' + f(3 * k) + ' ' + f(3 * k) + ' ' + f(6 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * k) + '" fill="none" stroke-linecap="round"/>';
    if (mood === "sleep") { var y2 = 1 + 0.35 * Math.sin(t * 2); s += '<ellipse cx="' + f(0.5 * k) + '" cy="' + f(7 * k) + '" rx="' + f(2.2 * k * y2) + '" ry="' + f(2.8 * k * y2) + '" fill="' + INK + '"/>'; }
    else { var o2 = 1 + 0.3 * Math.abs(Math.sin(t * 7)); s += '<ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(3.6 * k) + '" ry="' + f(2.8 * k * o2) + '" fill="' + INK + '"/>'; for (var e = -1; e <= 1; e += 2) { var tu = (t * 1.6 + (e + 1) * 0.3) % 1; s += '<circle cx="' + f(e * 6 * k) + '" cy="' + f(2 * k + tu * 9 * k) + '" r="' + f(1.4 * k) + '" fill="#7cc8f2" opacity="' + f(1 - tu) + '"/>'; } }
    return s + '</g>';
  }
  function sparkles(x, y, t, n, R) { var s = ""; for (var i = 0; i < (n || 5); i++) { var a = i * 1.26 + t * 0.6, r = (R || 50) * (0.7 + 0.3 * Math.sin(t * 2 + i)), k = 0.5 + 0.5 * Math.sin(t * 5 + i * 2), sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.8, z = 7 * k; s += '<path d="M' + f(sx) + ' ' + f(sy - z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx + z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy + z) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx - z) + ' ' + f(sy) + ' Q' + f(sx) + ' ' + f(sy) + ' ' + f(sx) + ' ' + f(sy - z) + ' Z" fill="#f2c230"/>'; } return s; }
  function zzz(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var u = (t * 0.5 + i / 3) % 1; s += '<text x="' + f(x + u * 40 + Math.sin(u * 6) * 6) + '" y="' + f(y - u * 70) + '" style="font:900 ' + f(14 + u * 14) + 'px Noto Serif;fill:#3a5a9a;stroke:#fff;stroke-width:3;paint-order:stroke" opacity="' + f(Math.sin(Math.PI * u)) + '">Z</text>'; } return s; }
  function waves(x, y, t, ang, n, col) { var s = ""; for (var i = 0; i < (n || 4); i++) { var u = (t * 0.9 + i / (n || 4)) % 1, r = 14 + u * 70; s += '<path d="M' + f(x + Math.cos(ang - 0.5) * r) + ' ' + f(y + Math.sin(ang - 0.5) * r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + Math.cos(ang + 0.5) * r) + ' ' + f(y + Math.sin(ang + 0.5) * r) + '" stroke="' + (col || "#f2c230") + '" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; } return s; }
  function brain(x, y, sc, t, fold) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')">';
    s += '<path d="M28 44 C30 70 34 90 44 104 H58 C52 88 50 66 52 46 Z" fill="#e8a2a8" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M40 40 C44 64 96 70 104 50 C110 34 90 22 70 24 Z" fill="#e392a0" stroke="' + INK + '" stroke-width="2"/>'; for (var c = 0; c < 5; c++) s += '<path d="M' + (52 + c * 3) + ' ' + (36 + c * 6) + ' Q' + (76) + ' ' + (30 + c * 7) + ' ' + (100 - c * 2) + ' ' + (42 + c * 4) + '" stroke="#b8606e" stroke-width="1.2" fill="none"/>';
    var d = "M-96 14 C-104 -48 -44 -92 18 -86 C82 -82 116 -40 104 14 C98 40 74 46 50 40 C30 50 -6 52 -30 46 C-62 52 -92 42 -96 14 Z";
    s += '<path d="' + d + '" fill="url(#gBrain)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-60 6 C-20 -6 20 -4 60 -26" stroke="#b8606e" stroke-width="' + f(1.6 + 1.6 * fold) + '" fill="none"/>';
    var n = Math.floor(fold * 22);
    for (var i = 0; i < n; i++) { var x0 = -84 + hash(i) * 168, y0 = -70 + hash(i + 11) * 100, L = 18 + hash(i + 3) * 24, a = hash(i + 7) * 3.14, dd = "M" + f(x0) + " " + f(y0); for (var j = 1; j <= 6; j++) dd += " L" + f(x0 + Math.cos(a) * L * j / 6 + Math.sin(j * 1.9 + i) * 4) + " " + f(y0 + Math.sin(a) * L * j / 6 + Math.cos(j * 1.7 + i) * 4); s += '<path d="' + dd + '" stroke="#b8606e" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="' + f(clamp(fold * 22 - i)) + '"/>'; }
    for (var p = 0; p < 6; p++) { var u = (t * 0.8 + p / 6) % 1, a2 = hash(p) * 6.28; s += '<circle cx="' + f(Math.cos(a2) * 70 * u) + '" cy="' + f(-20 + Math.sin(a2) * 44 * u) + '" r="2.6" fill="#fff6a0" opacity="' + f(1 - u) + '"/>'; }
    return s + '<ellipse cx="-40" cy="-50" rx="26" ry="12" fill="#fff" opacity=".3" transform="rotate(-20 -40 -50)"/></g>';
  }
