  // ── «القهوة بعد الأكل» (دايجرام): the running motif is a Turkish coffee cup on its saucer. Isometric table, plates and
  // bowls; stomach and large intestine in section (front elevation); polyphenol rings and Fe ions; the gut wall with villi;
  // isometric bars for the 1983 iron-absorption trial; timelines; the caffeine decay curve. Sources: ../refs/SOURCES.md.
  var DARK = "#41392f", SKY = "#b9bfbb", TABLE = "#d0806a", TABLED = "#b9614b", PB = "#4f7a9a", LANDD = "#8e9f6a", COF = "#4a3426",
      CREMA = "#a8784e", TEA = "#a8452a", GUT = "#d9a184", GUTD = "#b97f65", LINING = "#e8b9a0", FE = "#c4532c", LEMON = "#d9c25a", BLOOD = "#a8452a", PLATE = "#f4efe0";
  function mv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function K(u, a, b) { return clamp((u - a) / (b || 0.8)); }
  function G(x, y, s, rot, inner, op) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : '') + '"' + (op != null ? ' opacity="' + f(clamp(op)) + '"' : '') + '>' + inner + '</g>'; }
  function TS(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:700 ' + sz + 'px DejaVu Serif, Georgia, serif;fill:' + (col || ORANGE) + ';direction:ltr">' + text + '</text>'; }
  function circ(x, y, r, fill, sw, ex) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || '') + '/>'; }
  function qmark(x, y, k, sz) { k = pop(k); if (k <= 0) return ""; return G(x, y, k, 0, TS("؟", 0, 0, sz || 60, ORANGE)); }
  function tick(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return G(x, y, k * s, 0, '<path d="M-28 0 L-8 22 L30 -24" stroke="' + LANDD + '" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'); }
  function chapter(n, k) { k = pop(k); if (k <= 0) return ""; var s = circ(0, 0, 26, PAPER, 2.2) + TS(String(n), 0, 11, 30, ORANGE); for (var i = 0; i < 4; i++) s += circ(-27 + i * 18, 44, 5, i < n ? (i === n - 1 ? ORANGE : DARK) : PAPER, 1.4); return fixed(G(320, 70, k, 0, s)); }
  function steam(x, y, t, s, op) { var g = ""; for (var i = 0; i < 3; i++) { var ph = (t * 0.6 + i / 3) % 1, yy = -ph * 90, d = "M" + f((i - 1) * 12) + " " + f(yy); for (var k = 1; k <= 6; k++) d += " Q" + f((i - 1) * 12 + (k % 2 ? 7 : -7)) + " " + f(yy - k * 9 + 4) + " " + f((i - 1) * 12) + " " + f(yy - k * 9); g += '<path d="' + d + '" stroke="#8a8070" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(ph * Math.PI) * 0.8 * (op == null ? 1 : op)) + '"/>'; } return G(x, y, s, 0, g); }

  // ── the coffee cup on its saucer (isometric, centre at world x,y on table height z)
  function cup(x, y, z, t, o) {
    o = o || {}; var s = isoCyl(x, y, z, 9, 1.2, PLATE, PLATE), r = 5.2, h = 7;
    s += isoCyl(x, y, z + 1.2, r * 0.8, 0.8, "#e6dcc6", "#e6dcc6");
    var hb = iso(x + r * 0.7, y - r * 0.7, z + 5.4), hs = ISO.s; s += '<ellipse cx="' + f(hb[0] + 3.5 * hs) + '" cy="' + f(hb[1]) + '" rx="' + f(2.6 * hs) + '" ry="' + f(2.2 * hs) + '" fill="none" stroke="' + INK + '" stroke-width="' + f(1.3 * hs) + '"/><ellipse cx="' + f(hb[0] + 3.5 * hs) + '" cy="' + f(hb[1]) + '" rx="' + f(2.6 * hs) + '" ry="' + f(2.2 * hs) + '" fill="none" stroke="' + PLATE + '" stroke-width="' + f(0.7 * hs) + '"/>';
    s += isoCyl(x, y, z + 2, r, h, PLATE, o.empty ? "#e6dcc6" : COF);
    if (!o.empty) { var c = iso(x, y, z + 2 + h); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(r * 1.2247 * hs * 0.72) + '" ry="' + f(r * 0.7071 * hs * 0.72) + '" fill="' + CREMA + '" opacity=".55"/>'; }
    var band = iso(x, y, z + 2 + h * 0.75); s += '<path d="M' + f(band[0] - r * 1.2247 * hs) + ' ' + f(band[1]) + ' A' + f(r * 1.2247 * hs) + ' ' + f(r * 0.7071 * hs) + ' 0 0 0 ' + f(band[0] + r * 1.2247 * hs) + ' ' + f(band[1]) + '" stroke="' + PB + '" stroke-width="' + f(0.6 * hs) + '" fill="none"/>';
    if (o.steam !== false) { var tp = iso(x, y, z + 2 + h); s += steam(tp[0], tp[1] - 6, t, hs / 4); }
    return s;
  }
  // the Egyptian tea glass (tall, narrow, tea-red)
  function teaGlass(x, y, z, t) { var s = isoCyl(x, y, z, 6, 1, PLATE, PLATE) + isoCyl(x, y, z + 1, 3.6, 11, "#c96a4a", TEA); var c = iso(x + 1.2, y - 1.2, z + 7); return s + '<path d="M' + f(c[0]) + ' ' + f(c[1] - 20) + ' v30" stroke="#f4efe0" stroke-width="3" opacity=".6"/>' + steam(iso(x, y, z + 12)[0], iso(x, y, z + 12)[1] - 6, t, ISO.s / 4, 0.7); }
  function table(w, d) { var s = isoShadow(0, 0, w, d, 0.1); [[2, 2], [w - 5, 2], [2, d - 5], [w - 5, d - 5]].forEach(function (l) { s += isoBox(l[0], l[1], -40, 3, 3, 40, [TABLED, TABLED, "#8a3a24"], 1.2); }); return s + isoBox(0, 0, 0, w, d, 3, [TABLE, TABLED, TABLED]); }
  function plate(x, y, z, food) { var s = isoCyl(x, y, z, 14, 1.4, PLATE, PLATE) + isoCyl(x, y, z + 1.4, 10, 0.4, "#e6dcc6", "#e6dcc6"); if (food) s += food; return s; }
  function bowl(x, y, z, r, top, dots, dotCol) { var s = isoCyl(x, y, z, r, r * 0.7, PLATE, top); if (dots) for (var i = 0; i < dots; i++) { var a = hash(i + x) * Math.PI * 2, rr = Math.sqrt(hash(i * 3 + y)) * r * 0.8, p = iso(x + Math.cos(a) * rr, y + Math.sin(a) * rr, z + r * 0.7); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(1 * ISO.s) + '" ry="' + f(0.6 * ISO.s) + '" fill="' + dotCol + '" stroke="' + INK + '" stroke-width=".6"/>'; } return s; }
  function bread(x, y, z) { return isoCyl(x, y, z, 10, 1.6, "#c99a62", "#d9b07a") + isoCyl(x - 1, y - 1, z + 1.6, 5, 0.6, "#c99a62", "#c99a62"); }
  function spinach(x, y, z) { var s = isoCyl(x, y, z, 9, 1, PLATE, PLATE); for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2, p = iso(x + Math.cos(a) * 4, y + Math.sin(a) * 4, z + 1.2); s += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="' + f(3 * ISO.s) + '" ry="' + f(1.6 * ISO.s) + '" transform="rotate(' + f(a * 57) + ' ' + f(p[0]) + ' ' + f(p[1]) + ')" fill="' + LANDD + '" stroke="' + INK + '" stroke-width="1.2"/>'; } return s; }
  function steak(x, y, z) { var p = iso(x, y, z + 2), s = ISO.s; return plate(x, y, z) + '<path d="M' + f(p[0] - 8 * s) + ' ' + f(p[1]) + ' q' + f(2 * s) + ' ' + f(-5 * s) + ' ' + f(9 * s) + ' ' + f(-4 * s) + ' q' + f(8 * s) + ' ' + f(1 * s) + ' ' + f(7 * s) + ' ' + f(5 * s) + ' q' + f(-3 * s) + ' ' + f(4 * s) + ' ' + f(-10 * s) + ' ' + f(3 * s) + ' q' + f(-5 * s) + ' ' + f(-1 * s) + ' ' + f(-6 * s) + ' ' + f(-4 * s) + ' Z" fill="#8a3a2a" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(p[0] - 4 * s) + ' ' + f(p[1] - 1 * s) + ' q' + f(5 * s) + ' ' + f(-2 * s) + ' ' + f(9 * s) + ' ' + f(1 * s) + '" stroke="#e6dcc6" stroke-width="' + f(0.8 * s) + '" fill="none"/>'; }
  function drumstick(x, y, z) { var p = iso(x, y, z + 2), s = ISO.s; return plate(x, y, z) + G(p[0], p[1], s / 3, -20, '<path d="M-26 -6 q-10 -14 6 -18 q26 -6 36 8 l20 8 a6 6 0 1 1 -4 8 l-20 -4 q-20 14 -38 -2 Z" fill="#c98a4a" stroke="' + INK + '" stroke-width="3"/><circle cx="40" cy="4" r="5" fill="' + PLATE + '" stroke="' + INK + '" stroke-width="2.4"/>'); }
  function lemon(x, y, s, rot) { var g = '<path d="M-30 0 A30 30 0 0 1 30 0 Z" fill="' + LEMON + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 0 A24 24 0 0 1 24 0 Z" fill="#efe39a" stroke="#c9b24a" stroke-width="1.4"/>'; for (var i = 1; i < 6; i++) { var a = Math.PI * i / 6; g += '<path d="M0 0 L' + f(-Math.cos(a) * 24) + ' ' + f(-Math.sin(a) * 24) + '" stroke="#c9b24a" stroke-width="1.4"/>'; } return G(x, y, s, rot, g); }

  // ── the stomach and the large intestine in section (front elevation, local coordinates, centre 0,0)
  var STOM = "M-40 -120 C-210 -120 -210 170 0 172 C90 175 150 140 170 82 L232 70 L236 104 L174 118 C150 176 80 214 -10 212 C-230 208 -250 -150 -70 -150 Z";
  var LESS = "M-10 -120 C-20 -60 -50 20 -10 62 C40 112 120 90 168 50";
  function stomach(x, y, s, t, o) {
    o = o || {}; var g = R(-56, -300, 30, 170, GUT, 2.4, 10) + R(-48, -300, 14, 170, LINING, 0, 6);
    g += '<path d="' + STOM + '" fill="' + GUT + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
    g += '<path d="M-30 -116 C-170 -110 -176 150 0 152 C80 154 130 120 150 70 C110 100 40 104 0 70 C-40 30 -20 -50 -30 -116 Z" fill="' + LINING + '" stroke="' + GUTD + '" stroke-width="1.6"/>';
    for (var r = 0; r < 6; r++) g += '<path d="M' + f(-140 + r * 26) + ' ' + f(40 + r * 14) + ' q12 -26 26 -6" stroke="' + GUTD + '" stroke-width="1.4" fill="none" opacity=".7"/>';
    if (o.food) { g += '<path d="M-150 60 C-140 140 -40 160 30 140 C80 126 120 100 140 76 C100 86 40 90 0 72 C-40 52 -100 40 -150 60 Z" fill="#c9a26a" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(o.food) + '"/>'; for (var k = 0; k < 10; k++) g += circ(-120 + hash(k) * 220, 90 + hash(k + 4) * 40, 6 + hash(k + 8) * 6, k % 3 ? "#b98f5a" : "#8e9f6a", 1.2, ' opacity="' + f(o.food) + '"'); }
    if (o.coffee) { var cl = o.coffee; g += '<path d="M-150 80 C-140 150 -40 160 30 146 C80 136 120 110 140 86 C100 96 40 100 0 84 C-40 66 -100 60 -150 80 Z" fill="' + COF + '" opacity="' + f(0.75 * cl) + '"/>'; }
    if (o.pour) { var pk = o.pour, drops = ""; for (var i = 0; i < 8; i++) { var q = (t * 1.2 + i / 8) % 1; drops += circ(-41, -290 + q * 200, 5, COF, 1, ' opacity="' + f(pk) + '"'); } g += drops; }
    if (o.acid) for (var a = 0; a < Math.floor(16 * o.acid); a++) { var ax = -130 + hash(a) * 230, ay = -40 + hash(a + 20) * 150 + 6 * Math.sin(t * 3 + a); g += '<path d="M' + f(ax) + ' ' + f(ay - 9) + ' q7 9 0 14 q-7 -5 0 -14 Z" fill="' + FE + '" stroke="' + INK + '" stroke-width="1" opacity=".85"/>'; }
    return G(x, y, s, 0, g);
  }
  var COLON = [[-170, 230], [-180, 100], [-180, -110], [-150, -170], [-60, -175], [60, -175], [150, -170], [180, -110], [180, 90], [170, 170], [110, 220], [40, 240]];
  function colon(x, y, s, t, k) {
    var d = "M" + COLON.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), g = '<path d="' + d + '" stroke="' + INK + '" stroke-width="72" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + GUT + '" stroke-width="66" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + LINING + '" stroke-width="34" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    var L0 = plen(COLON); for (var i = 2; i < 30; i++) { var p = pat(COLON, i / 31), q = pat(COLON, i / 31 + 0.004), a = Math.atan2(q[1] - p[1], q[0] - p[0]); g += '<path d="M' + f(p[0] - Math.sin(a) * 33) + ' ' + f(p[1] + Math.cos(a) * 33) + ' L' + f(p[0] - Math.sin(a) * 18) + ' ' + f(p[1] + Math.cos(a) * 18) + ' M' + f(p[0] + Math.sin(a) * 33) + ' ' + f(p[1] - Math.cos(a) * 33) + ' L' + f(p[0] + Math.sin(a) * 18) + ' ' + f(p[1] - Math.cos(a) * 18) + '" stroke="' + GUTD + '" stroke-width="2"/>'; }
    if (k > 0) for (var w = 0; w < 3; w++) { var ph = (t * 0.32 * (0.6 + k) + w / 3) % 1, c = pat(COLON, ph); g += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(40 + 4 * Math.sin(t * 6)) + '" fill="none" stroke="' + ORANGE + '" stroke-width="5" opacity="' + f(0.7 * k) + '"/>'; }
    return G(x, y, s, 0, g);
  }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function pat(p, k) { k = clamp(k); var L0 = plen(p) * k, s = 0; for (var i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (s + l >= L0) { var r = l ? (L0 - s) / l : 0; return [lerp(p[i - 1][0], p[i][0], r), lerp(p[i - 1][1], p[i][1], r)]; } s += l; } return p[p.length - 1]; }
  // ── molecules: a polyphenol ring with its OH groups, an iron ion, a bound complex
  function hexR(x, y, r, col, rot) { var p = []; for (var i = 0; i < 6; i++) { var a = (i * 60 + (rot || 0)) * Math.PI / 180; p.push(f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r)); } return '<path d="M' + p.join(' L') + ' Z" fill="' + (col || "#efe6d2") + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.55) + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function poly(x, y, s, rot) { var g = hexR(0, 0, 22, "#d9c3a8", 30) + hexR(78, 10, 22, "#d9c3a8", 30) + '<path d="M19 6 L58 2" stroke="' + INK + '" stroke-width="2.4"/>';
    [[-30, -22], [-30, 22], [100, -12]].forEach(function (q) { g += '<path d="M' + f(q[0] * 0.66) + ' ' + f(q[1] * 0.66) + ' L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + INK + '" stroke-width="2"/>' + T("OH", q[0] + (q[0] < 0 ? -12 : 14), q[1] + 6, 15, INK, 700); });
    return G(x, y, s, rot, g); }
  function fe(x, y, s, op) { return G(x, y, s, 0, circ(0, 0, 18, FE, 2.2) + '<text x="0" y="6" text-anchor="middle" style="font:800 16px DejaVu Sans, sans-serif;fill:#fff;direction:ltr">Fe</text>', op); }
  function complex(x, y, s, rot) { return G(x, y, s, rot, poly(0, 0, 0.8, 0) + fe(30, 26, 1) + '<path d="M-14 12 L18 22 M52 4 L40 18" stroke="' + FE + '" stroke-width="3" stroke-dasharray="4 3"/>'); }
  // ── the gut wall with villi: lumen above y0, blood vessel below
  function wall(t, y0) { var g = R(-600, y0 + 110, 1840, 120, BLOOD, 2.4) + R(-600, y0 + 110, 1840, 120, "url(#hatchW)", 0) + R(-600, y0, 1840, 110, GUT, 2.4);
    for (var i = -6; i < 16; i++) { var x = i * 48; g += '<path d="M' + f(x - 16) + ' ' + f(y0 + 2) + ' L' + f(x - 14) + ' ' + f(y0 - 80) + ' Q' + f(x) + ' ' + f(y0 - 104) + ' ' + f(x + 14) + ' ' + f(y0 - 80) + ' L' + f(x + 16) + ' ' + f(y0 + 2) + '" fill="' + LINING + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x) + ' ' + f(y0 - 76) + ' V' + f(y0 + 100) + '" stroke="' + BLOOD + '" stroke-width="3" opacity=".6"/>'; }
    for (var c = 0; c < 8; c++) g += circ(((t * 50 + c * 90) % 900) - 120, y0 + 170, 10, "#c96a4a", 1.4);
    return g; }
  // ── isometric bars: values 0..100 (heights), cols, labels
  function bars(vals, k, t) { var s = "", sp = [-30, 0, 30]; vals.forEach(function (v, i) { if (v.h == null) return; var h = v.h * ease(clamp(k * 1.4 - i * 0.25)) * 1.6; s += isoShadow(sp[i] * 1 - 8, sp[i] * -1 - 8, 16, 16) + isoBox(sp[i] - 8, -sp[i] - 8, 0, 16, 16, Math.max(0.5, h), v.c); var top = iso(sp[i], -sp[i], h); s += T(Math.round(v.h * clamp(k * 1.4 - i * 0.25)) + "%", top[0], top[1] - 18, 26, INK, 900); }); return s; }
  // ── a clock face
  function clock(x, y, r, hh, mm, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var g = circ(0, 0, r, PLATE, 3); for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; g += '<path d="M' + f(Math.sin(a) * r * 0.82) + ' ' + f(-Math.cos(a) * r * 0.82) + ' L' + f(Math.sin(a) * r * 0.94) + ' ' + f(-Math.cos(a) * r * 0.94) + '" stroke="' + INK + '" stroke-width="2"/>'; }
    var ah = (hh % 12 + mm / 60) / 12 * Math.PI * 2, am = mm / 60 * Math.PI * 2; g += '<path d="M0 0 L' + f(Math.sin(ah) * r * 0.5) + ' ' + f(-Math.cos(ah) * r * 0.5) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(am) * r * 0.78) + ' ' + f(-Math.cos(am) * r * 0.78) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round"/>' + circ(0, 0, 4, INK, 0);
    return G(x, y, k, 0, g); }
  // a flat cup icon (front) for timelines
  function cupIcon(x, y, s) { return G(x, y, s, 0, '<path d="M-22 -18 L22 -18 L18 18 Q0 24 -18 18 Z" fill="' + PLATE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M22 -10 q14 2 10 14 q-3 8 -13 6" fill="none" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="0" cy="-18" rx="22" ry="5" fill="' + COF + '" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="22" rx="34" ry="6" fill="' + PLATE + '" stroke="' + INK + '" stroke-width="2"/>'); }
  function plateIcon(x, y, s) { return G(x, y, s, 0, '<ellipse cx="0" cy="8" rx="40" ry="12" fill="' + PLATE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-26 4 Q-20 -18 0 -16 Q24 -18 26 4 Z" fill="#c9a26a" stroke="' + INK + '" stroke-width="2"/><circle cx="-8" cy="-6" r="5" fill="' + LANDD + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="10" cy="-4" r="4" fill="#8a5a3c" stroke="' + INK + '" stroke-width="1.4"/>'); }
  function timeline(y, k, marks) { var s = '<path d="M60 ' + y + ' H' + f(lerp(60, 590, ease(k))) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>'; (marks || []).forEach(function (m) { s += '<path d="M' + m[0] + ' ' + (y - 10) + ' V' + (y + 10) + '" stroke="' + INK + '" stroke-width="3"/>' + T(m[1], m[0], y + 40, 20, INK, 700); }); return s; }
  // the table scene used for the motif
  function tableScene(t, o) { o = o || {}; isoAt(300, 430, 4.4); var s = paper() + table(70, 50) + plate(22, 26, 3, o.food === false ? "" : '<g>' + isoCyl(22, 26, 4.8, 6, 1, "#c9a26a", "#c9a26a") + '</g>'); if (o.cup !== false) s += cup(52, 18, 3, t); if (o.tea) s += teaGlass(56, 40, 3, t); return s; }

  // 0 — after the meal some people say: bring me a cup of coffee to digest it
  shot(0, mv(320, 380, 1.0, 330, 360, 1.15), function (u, d, t) {
    isoAt(300, 430, 4.4); var k = ease(K(u, 0.6, 1.0)), s = paper() + table(70, 50) + plate(22, 26, 3, isoCyl(22, 26, 4.8, 6, 1, "#c9a26a", "#c9a26a"));
    s += '<g transform="translate(' + f((1 - k) * 260) + ' ' + f((1 - k) * -150) + ')">' + cup(52, 18, 3, t) + '</g>';
    var c = iso(52, 18, 14); return s + label(c[0], c[1], 520, 160, "فنجان قهوة", OLIVE, K(u, 1.6), 22);
  });
  // 1 — does coffee really digest food?
  shot(1, mv(330, 360, 1.15, 330, 380, 1.05), function (u, d, t) { return tableScene(t) + qmark(470, 200, K(u, 0.3, 0.6), 80); });
  // 2 — or, like tea, does it take something from your food without you noticing?
  shot(2, mv(330, 380, 1.05, 360, 380, 1.15), function (u, d, t) { var s = tableScene(t, { tea: K(u, 0.3, 0.2) > 0 }), g = iso(56, 40, 14); return s + label(g[0], g[1], 560, 640, "زي الشاي؟", ORANGE, K(u, 0.9), 22) + qmark(150, 250, K(u, 2.0, 0.6), 60); });
  // 3 — what's the story? I'll explain it in a minute
  shot(3, mv(320, 400, 1.05, 320, 400, 0.98), function (u, d, t) {
    isoAt(320, 380, 9); var a = t * 3.2, s = paper() + '<circle cx="320" cy="400" r="210" fill="none" stroke="#cdbf9f" stroke-width="3"/>' + cup(0, 0, 0, t);
    return s + G(320, 150, pop(K(u, 0.1, 0.6)), 0, R(-8, -62, 16, 14, ORANGE, 1.6, 2) + circ(0, -12, 42, PAPER, 3) + '<path d="M0 -12 L' + f(Math.sin(a) * 28) + ' ' + f(-12 - Math.cos(a) * 28) + '" stroke="' + ORANGE + '" stroke-width="3.4" stroke-linecap="round"/>' + circ(0, -12, 3.5, INK, 0));
  });
  // 4 — as soon as you drink the coffee, the stomach raises its acid a little
  shot(4, mv(320, 420, 1.0, 330, 440, 1.1), function (u, d, t) {
    var s = paper() + stomach(320, 480, 1.0, t, { pour: K(u, 0.2, 0.4) * (1 - K(u, 2.2, 0.4)), coffee: K(u, 0.6, 1.0), acid: K(u, 1.0, 1.4) }) + chapter(1, K(u, 0, 0.6));
    return s + label(220, 420, 90, 230, "المعدة", OLIVE, K(u, 0.3), 22) + label(350, 540, 520, 690, "حامض", ORANGE, K(u, 1.4), 22);
  });
  // 5 — minutes later the large intestine moves more, and about a third of people feel they need the toilet
  shot(5, mv(320, 410, 0.95, 320, 400, 1.02), function (u, d, t) {
    var s = paper() + colon(320, 400, 1.0, t, K(u, 0.4, 1.0));
    return s + label(140, 300, 70, 160, "المصران الغليظ", OLIVE, K(u, 0.3), 20) + numBox("≈ 1 من 3", 320, 400, K(u, 3.0, 0.6), 30);
  });
  // 6 — so coffee really does get digestion moving
  shot(6, mv(320, 400, 1.0, 320, 400, 1.06), function (u, d, t) { return paper() + stomach(320, 420, 0.8, t, { coffee: 1, acid: 1 }) + tick(500, 170, 1.4, K(u, 0.4, 0.6)); });
  // 7 — but coffee has substances called polyphenols, the best known is chlorogenic acid
  shot(7, mv(320, 420, 1.0, 330, 380, 1.12), function (u, d, t) {
    isoAt(170, 560, 7); var s = paper() + cup(0, 0, 0, t) + chapter(2, K(u, 0, 0.6));
    for (var i = 0; i < 3; i++) { var k = ease(K(u, 0.4 + i * 0.4, 1.4)); s += poly(lerp(160, 300 + i * 70, k), lerp(480, 260 + i * 130 + 10 * Math.sin(t * 2 + i), k), lerp(0.2, 1.0 - i * 0.15, k), 10 * Math.sin(t + i)); }
    return s + label(330, 260, 470, 140, "حمض الكلوروجينيك", PB, K(u, 1.8), 18) + label(180, 470, 80, 680, "بوليفينولات", PB, K(u, 1.0), 20);
  });
  // 8 — and when these meet the iron in your food, they grab it
  shot(8, mv(320, 400, 1.0, 320, 400, 1.12), function (u, d, t) {
    var s = paper(), k = ease(K(u, 0.6, 1.4));
    for (var i = 0; i < 3; i++) { var y = 230 + i * 170, fx = lerp(560, 360, k), px = lerp(80, 230, k); s += fe(fx + 6 * Math.sin(t * 3 + i), y + 6 * Math.cos(t * 2 + i), 1.4) + poly(px, y - 10, 1.0, 6 * Math.sin(t + i)); if (k >= 1) s += '<path d="M' + (px + 70) + ' ' + y + ' L' + (fx - 24) + ' ' + y + '" stroke="' + FE + '" stroke-width="4" stroke-dasharray="6 4"/>'; }
    return s + label(560, 230, 560, 120, "الحديد", ORANGE, K(u, 0.2), 24);
  });
  // 9 — and makes a compound the body can't absorb, so it passes and leaves
  shot(9, mv(320, 420, 1.0, 340, 420, 1.06), function (u, d, t) {
    var s = paper() + wall(t, 520);
    for (var i = 0; i < 4; i++) { var x = ((t * 70 + i * 190) % 900) - 120; s += complex(x, 300 + 30 * (i % 2), 0.9, 6 * Math.sin(t + i)); }
    for (var j = 0; j < 3; j++) { var q = (t * 0.5 + j / 3) % 1; s += fe(140 + j * 170, lerp(330, 660, q), 0.9, Math.sin(q * Math.PI) * K(u, 0.2, 0.5) * 0.35); }
    return s + crossMark(320, 470, 0.9, K(u, 1.0, 0.5)) + label(560, 300, 560, 160, "مش بيتمتص", ORANGE, K(u, 1.6), 22) + label(80, 650, 80, 760, "الدم", OLIVE, K(u, 0.4), 20);
  });
  // 10 — in a trial, a cup of coffee with a meal cut iron absorption by about 40%
  shot(10, mv(320, 440, 1.0, 320, 420, 1.06), function (u, d, t) {
    isoAt(320, 600, 2.2); var s = paper() + bars([{ h: 100, c: [LANDD, "#9aab75", "#7d8d5c"] }, { h: 61, c: [CREMA, "#8a5a3c", COF] }], K(u, 0.3, 1.6), t);
    var a = iso(-30, 30, -6), b = iso(0, 0, -6); s += T("من غير", a[0], a[1] + 40, 22, INK, 700) + T("مع قهوة", b[0], b[1] + 40, 22, INK, 700);
    return s + fixed(G(500, 130, pop(K(u, 2.4, 0.6)), 0, TS("−40%", 0, 0, 52))) + T("امتصاص الحديد", 320, 150, 26, PB, 800);
  });
  // 11 — and tea in the same trial cut it by about 65%
  shot(11, mv(320, 420, 1.06, 330, 420, 1.0), function (u, d, t) {
    isoAt(320, 600, 2.2); var s = paper() + bars([{ h: 100, c: [LANDD, "#9aab75", "#7d8d5c"] }, { h: 61, c: [CREMA, "#8a5a3c", COF] }, { h: 36, c: ["#d97a5a", TEA, "#8a3a24"] }], 1.0 + K(u, 0.3, 1.6), t);
    var a = iso(-30, 30, -6), b = iso(0, 0, -6), c = iso(30, -30, -6); s += T("من غير", a[0], a[1] + 40, 22, INK, 700) + T("مع قهوة", b[0], b[1] + 40, 22, INK, 700) + T("مع شاي", c[0], c[1] + 40, 22, INK, 700);
    return s + fixed(G(500, 130, pop(K(u, 1.6, 0.6)), 0, TS("−65%", 0, 0, 52, TEA))) + T("امتصاص الحديد", 320, 150, 26, PB, 800);
  });
  // 12 — so coffee is milder than tea, but still takes a big chunk
  shot(12, mv(330, 420, 1.0, 320, 440, 1.1), function (u, d, t) {
    isoAt(320, 600, 2.2); var s = paper() + bars([{ h: 100, c: [LANDD, "#9aab75", "#7d8d5c"] }, { h: 61, c: [CREMA, "#8a5a3c", COF] }, { h: 36, c: ["#d97a5a", TEA, "#8a3a24"] }], 2, t);
    var b = iso(0, 0, 61 * 1.6), top = iso(0, 0, 100 * 1.6), kk = K(u, 0.6, 0.6);
    s += '<path d="M' + f(b[0] + 60) + ' ' + f(top[1]) + ' V' + f(b[1]) + '" stroke="' + ORANGE + '" stroke-width="5" stroke-dasharray="8 6" opacity="' + f(kk) + '"/>' + '<rect x="' + f(b[0] - 26) + '" y="' + f(top[1]) + '" width="52" height="' + f(b[1] - top[1]) + '" fill="' + ORANGE + '" opacity="' + f(0.25 * kk) + '" stroke="' + ORANGE + '" stroke-dasharray="6 5" stroke-width="2"/>';
    return s + label(b[0], (b[1] + top[1]) / 2, 120, 240, "حتة كبيرة", ORANGE, K(u, 1.0), 22);
  });
  // 13 — and the stronger the coffee, the bigger the effect
  shot(13, mv(320, 400, 1.0, 330, 400, 1.08), function (u, d, t) {
    isoAt(320, 470, 6); var s = paper(), cols = ["#8a5a3c", "#5a3a28", "#2e2018"];
    for (var i = 0; i < 3; i++) { var k = pop(K(u, 0.3 + i * 0.5, 0.5)); if (k <= 0) continue; s += '<g opacity="' + f(k) + '">' + cup(-24 + i * 24, 24 - i * 24, 0, t) + '</g>'; var p = iso(-24 + i * 24, 24 - i * 24, 9); s += circ(p[0], p[1], 12 * k, cols[i], 1.4); }
    return s + arrow(130, 640, 520, 640, ORANGE, 6, K(u, 1.6, 0.8)) + T("أتقل = تأثير أكتر", 330, 700, 26, ORANGE, 800);
  });
  // 14 — the iron hit hardest is the one in beans, lentils, bread and spinach
  shot(14, mv(320, 400, 1.08, 320, 400, 0.98), function (u, d, t) {
    isoAt(300, 360, 3.6); var s = paper() + table(90, 70), it = [function () { return bowl(18, 18, 3, 9, "#8a5a3c", 14, "#6a4a2a"); }, function () { return bowl(52, 14, 3, 9, "#c47a4a", 18, "#d9905a"); }, function () { return bread(24, 50, 3); }, function () { return spinach(62, 48, 3); }];
    it.forEach(function (fn, i) { if (K(u, 0.3 + i * 0.4, 0.1) > 0) s += fn(); });
    [["فول", 18, 18], ["عدس", 52, 14], ["عيش", 24, 50], ["سبانخ", 62, 48]].forEach(function (q, i) { var p = iso(q[1], q[2], 10); s += label(p[0], p[1], p[0] + (i % 2 ? 60 : -60), p[1] - 90 - (i > 1 ? 0 : 40), q[0], OLIVE, K(u, 0.5 + i * 0.4), 20); });
    return s + numBox("حديد نباتي", 320, 690, K(u, 2.2, 0.6), 24);
  });
  // 15 — the iron in meat and chicken is affected much less
  shot(15, mv(320, 400, 1.0, 320, 400, 1.08), function (u, d, t) {
    isoAt(300, 380, 4.2); var s = paper() + table(80, 50) + steak(22, 24, 3) + (K(u, 0.6, 0.1) > 0 ? drumstick(58, 24, 3) : "");
    var a = iso(22, 24, 6), b = iso(58, 24, 6); return s + label(a[0], a[1], 120, 180, "لحمة", OLIVE, K(u, 0.2), 22) + label(b[0], b[1], 520, 180, "فراخ", OLIVE, K(u, 0.8), 22) + numBox("بتتأثر أقل بكتير", 320, 680, K(u, 1.6, 0.6), 24);
  });
  // 16 — oddly, coffee drunk an hour BEFORE the meal didn't affect the iron at all
  shot(16, mv(320, 400, 1.0, 320, 400, 1.06), function (u, d, t) {
    var s = paper() + timeline(420, K(u, 0, 0.8), [[200, "−1 ساعة"], [380, "الأكل"]]) + chapter(3, K(u, 0, 0.6));
    s += G(200, 340, pop(K(u, 0.5, 0.5)), 0, cupIcon(0, 0, 1.6)) + G(380, 340, pop(K(u, 0.9, 0.5)), 0, plateIcon(0, 0, 1.4));
    return s + clock(200, 560, 60, 1, 0, K(u, 0.6, 0.5)) + clock(380, 560, 60, 2, 0, K(u, 1.0, 0.5)) + tick(320, 220, 1.6, K(u, 1.8, 0.6)) + T("ما أثّرتش", 320, 140, 28, LANDD, 800);
  });
  // 17 — but an hour AFTER the meal it cut it just as much, as if you drank it with the meal
  shot(17, mv(320, 400, 1.0, 320, 400, 1.06), function (u, d, t) {
    var s = paper() + timeline(420, 1, [[200, "الأكل"], [380, "+1 ساعة"]]);
    s += G(200, 340, 1, 0, plateIcon(0, 0, 1.4)) + G(380, 340, pop(K(u, 0.4, 0.5)), 0, cupIcon(0, 0, 1.6));
    return s + clock(200, 560, 60, 2, 0, 1) + clock(380, 560, 60, 3, 0, K(u, 0.4, 0.5)) + crossMark(320, 210, 1.2, K(u, 1.6, 0.5)) + T("نفس التأثير", 320, 130, 28, ORANGE, 800);
  });
  // 18 — because food stays in the stomach for hours, and the coffee catches it there
  shot(18, mv(320, 440, 1.0, 320, 460, 1.1), function (u, d, t) {
    var s = paper() + stomach(320, 480, 1.0, t, { food: 1, pour: K(u, 0.6, 0.4), coffee: K(u, 1.4, 1.0) });
    return s + clock(520, 190, 54, 2 + ease(K(u, 0, 2.6)) * 3, (ease(K(u, 0, 2.6)) * 180) % 60, 1) + label(260, 560, 90, 690, "الأكل لسه هنا", OLIVE, K(u, 0.4), 20) + T("ساعات", 520, 290, 24, INK, 800);
  });
  // 19 — and half the caffeine stays in your blood for about five hours
  function curve(k, x0, y0, w, h) { var d = "M" + x0 + " " + y0; for (var i = 1; i <= 60 * k; i++) { var x = i / 60; d += " L" + f(x0 + x * w) + " " + f(y0 + h * (1 - Math.pow(0.5, x * 2))); } return d; }
  shot(19, mv(320, 400, 1.0, 330, 400, 1.06), function (u, d, t) {
    var s = paper(), x0 = 100, y0 = 220, w = 460, h = 360, k = ease(K(u, 0.3, 1.6));
    s += '<path d="M' + x0 + ' ' + (y0 - 30) + ' V' + (y0 + h + 20) + ' H' + (x0 + w + 20) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>';
    s += '<path d="' + curve(k, x0, y0, w, h) + '" stroke="' + COF + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
    var hx = x0 + w / 2, hy = y0 + h / 2; if (k > 0.5) s += '<path d="M' + x0 + ' ' + hy + ' H' + hx + ' V' + (y0 + h + 20) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-dasharray="8 6" fill="none"/>' + circ(hx, hy, 9, ORANGE, 2);
    return s + T("الكافيين في دمك", 320, 150, 26, PB, 800) + T("100%", x0 - 40, y0 + 8, 18, INK, 700) + T("50%", x0 - 36, hy + 6, 18, ORANGE, 700) + numBox("≈ 5 ساعات", hx, y0 + h + 70, K(u, 1.6, 0.6), 24);
  });
  // 20 — so the 4 o'clock lunch coffee is still half in your blood at 9 at night
  shot(20, mv(320, 400, 1.0, 320, 400, 1.08), function (u, d, t) {
    var s = paper(), k = ease(K(u, 0.6, 1.8)), hh = 4 + 5 * k;
    s += clock(180, 330, 90, 4, 0, K(u, 0.1, 0.5)) + clock(460, 330, 90, hh, 0, K(u, 0.4, 0.5));
    s += T("4 العصر", 180, 460, 24, INK, 800) + T(hh >= 8.99 ? "9 بالليل" : "…", 460, 460, 24, INK, 800) + arrow(290, 330, 350, 330, INK, 4, K(u, 0.5, 0.5));
    s += '<rect x="130" y="540" width="380" height="40" rx="8" fill="' + PLATE + '" stroke="' + INK + '" stroke-width="2.4"/><rect x="130" y="540" width="' + f(380 * (1 - 0.5 * k)) + '" height="40" rx="8" fill="' + COF + '" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + T(Math.round(100 - 50 * k) + "% كافيين", 320, 630, 26, ORANGE, 900) + G(540, 150, pop(K(u, 2.0, 0.5)), 0, '<path d="M-20 -24 A28 28 0 1 0 14 22 A22 22 0 1 1 -20 -24 Z" fill="' + LEMON + '" stroke="' + INK + '" stroke-width="2.4"/>');
  });
  // 21 — the fix is simple: drink your coffee an hour before the meal, or between meals
  shot(21, mv(320, 400, 1.0, 320, 410, 1.06), function (u, d, t) {
    var s = paper() + chapter(4, K(u, 0, 0.6)), y = 420, meals = [[140, "فطار"], [330, "غدا"], [520, "عشا"]];
    s += timeline(y, K(u, 0.1, 0.8), []);
    meals.forEach(function (m, i) { s += G(m[0], y - 70, pop(K(u, 0.3 + i * 0.2, 0.5)), 0, plateIcon(0, 0, 1.1)) + T(m[1], m[0], y + 44, 22, INK, 700) + '<rect x="' + (m[0] - 40) + '" y="' + (y - 12) + '" width="80" height="24" fill="' + ORANGE + '" opacity=".35"/>'; });
    [[235, 0], [425, 1]].forEach(function (c, i) { var k = pop(K(u, 1.2 + i * 0.4, 0.5)); s += '<rect x="' + (c[0] - 50) + '" y="' + (y - 12) + '" width="100" height="24" fill="' + LANDD + '" opacity="' + f(0.6 * k) + '"/>' + G(c[0], y - 150, k, 0, cupIcon(0, 0, 1.3)) + tick(c[0], y - 230, 0.8, K(u, 1.6 + i * 0.4, 0.5)); });
    return s + T("بين الوجبات", 330, 600, 28, LANDD, 800);
  });
  // 22 — and put lemon on your food: vitamin C helps the iron get absorbed
  shot(22, mv(320, 420, 1.0, 330, 440, 1.1), function (u, d, t) {
    var s = paper() + wall(t, 560), sq = K(u, 0.3, 0.8);
    s += lemon(320, 170, 2.2, 180) ; for (var i = 0; i < 4; i++) { var q = (t * 0.9 + i / 4) % 1; s += '<path d="M' + (300 + i * 14) + ' ' + f(220 + q * 120) + ' q6 10 0 14 q-6 -4 0 -14 Z" fill="' + LEMON + '" stroke="' + INK + '" stroke-width="1" opacity="' + f(sq * Math.sin(q * Math.PI)) + '"/>'; }
    for (var j = 0; j < 4; j++) { var q2 = (t * 0.45 + j / 4) % 1; s += fe(140 + j * 120, lerp(380, 720, q2), 0.9, K(u, 1.2, 0.5) * Math.sin(q2 * Math.PI) + 0.1); }
    return s + label(360, 180, 520, 120, "فيتامين سي", LANDD, K(u, 0.8), 22) + label(140, 640, 70, 760, "بيتمتص", ORANGE, K(u, 1.8), 20);
  });
  // 23 — so: coffee gets digestion moving, yes, but it steals some iron; drink it away from meals and enjoy it
  shot(23, mv(320, 420, 1.1, 320, 400, 0.98), function (u, d, t) {
    var s = paper() + stomach(200, 470, 0.6, t, { coffee: 1, acid: 0.6 }) + tick(200, 200, 1.0, K(u, 0.2, 0.5));
    isoAt(470, 520, 7); s += cup(0, 0, 0, t) + fe(470, 250, 1.4) + crossMark(470, 250, 0.9, K(u, 1.6, 0.5));
    return s + T("بتحرّك الهضم", 200, 690, 24, LANDD, 800) + T("بتخطف حديد", 470, 690, 24, ORANGE, 800);
  });
  // 24 is the summary card; keep the panel valid behind it
  shot(24, mv(320, 400, 1, 320, 400, 1), function (u, d, t) { return tableScene(t); });
  SH.sort(function (a, b) { return a.a - b.a; });

  window.__outro = function (svg, u, t) {
    var s = '<rect width="580" height="300" fill="#e4d9bf"/>', y = 170;
    s += '<path d="M40 ' + y + ' H540" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
    [[130, "−1 ساعة", true], [290, "الأكل", null], [450, "+1 ساعة", false]].forEach(function (m, i) { var k = clamp((u - 0.2 - i * 0.25) / 0.5);
      s += '<path d="M' + m[0] + ' ' + (y - 10) + ' V' + (y + 10) + '" stroke="' + INK + '" stroke-width="3"/>' + T(m[1], m[0], y + 40, 20, INK, 700);
      s += m[2] == null ? G(m[0], y - 60, pop(k), 0, plateIcon(0, 0, 1.2)) : G(m[0], y - 60, pop(k), 0, cupIcon(0, 0, 1.3)) + (m[2] ? tick(m[0], y + 90, 0.7, k) : crossMark(m[0], y + 90, 0.6, k)); });
    s += callout("1", 130, 40, (u - 0.3) / 0.6) + callout("2", 290, 40, (u - 0.5) / 0.6) + callout("3", 450, 40, (u - 0.7) / 0.6);
    s += '<rect width="580" height="300" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    var nn = document.querySelector('#outro .n'); if (nn) nn.textContent = '−' + Math.round(40 * clamp(u / 2.0)) + '%';
    svg.style.transform = 'scale(' + f(1 + 0.04 * Math.sin(t * 1.4)) + ') translateY(' + f(4 * Math.sin(t * 1.1)) + 'px)';
    svg.innerHTML = s;
  };
  window.__parts = { cup: cup, teaGlass: teaGlass, table: table, plate: plate, stomach: stomach, colon: colon, poly: poly, fe: fe, complex: complex, wall: wall, lemon: lemon, clock: clock, cupIcon: cupIcon, plateIcon: plateIcon, label: label, T: T, TS: TS, numBox: numBox, isoAt: isoAt, iso: iso, steam: steam, tick: tick, crossMark: crossMark };
})();
