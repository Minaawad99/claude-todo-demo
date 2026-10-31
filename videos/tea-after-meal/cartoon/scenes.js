/* «لو شربت شاي بعد الأكل على طول؟» — cartoon panels redrawn every frame; shared helpers (backgrounds, ball-head characters, arrows, brush tags) from the monorail episode.
   Every panel keeps three layers moving at once: the camera (slow push / pan, never parked), the subject
   (rotor always turning, the helicopter bobbing, the pilot blinking and reacting) and the background
   (clouds, birds, traffic, flickering windows, stars), with parallax between the layers.
   World units: the panel is 640×360. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.15 * ease(u / 0.22); if (u < 0.36) return lerp(1.15, 1, (u - 0.22) / 0.14); return 1; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }

  // ── backgrounds ─────────────────────────────────────────
  function sky(kind) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-' + kind + ')"/>'; }
  function sun(x, y, r, col) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.8) + '" fill="' + col + '" opacity=".45" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>'; }
  function moon(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="34" fill="#f2efe0" opacity=".22" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="20" fill="#f4f1e4"/><circle cx="' + (x + 8) + '" cy="' + (y - 6) + '" r="18" fill="#1a2c4c"/>'; }
  function clouds(t, speed, y, n, op, sc) {
    var s = "", W = 1100; sc = sc || 1;
    for (var i = 0; i < n; i++) {
      var x = ((hash(i + y) * W + t * speed) % W) - 230, yy = y + hash(i * 3 + y) * 40, w = (60 + hash(i * 7) * 70) * sc;
      s += '<g filter="url(#soft)" fill="#fff" opacity="' + op + '"><ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * 0.22) + '"/><ellipse cx="' + f(x + w * 0.3) + '" cy="' + f(yy - w * 0.12) + '" rx="' + f(w * 0.5) + '" ry="' + f(w * 0.28) + '"/></g>';
    }
    return s;
  }
  function stars(t) { var s = ""; for (var i = 0; i < 60; i++) { var tw = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.8 + hash(i) * 2) + i)); s += '<circle cx="' + f(-200 + hash(i) * 1040) + '" cy="' + f(-120 + hash(i + 9) * 300) + '" r="' + f(0.6 + hash(i + 4) * 1.2) + '" fill="#fff" opacity="' + tw.toFixed(2) + '"/>'; } return s; }
  function birds(t, y0, sp) { var s = ""; for (var i = 0; i < 4; i++) { var x = ((t * sp + i * 90 + hash(i) * 60) % 1000) - 200, y = y0 + i * 9 + Math.sin(t * 2 + i) * 4, w = Math.sin(t * 9 + i * 2) * 4; s += '<path d="M' + f(x - 7) + ' ' + f(y - w) + ' Q' + f(x - 3) + ' ' + f(y - 2) + ' ' + f(x) + ' ' + f(y) + ' Q' + f(x + 3) + ' ' + f(y - 2) + ' ' + f(x + 7) + ' ' + f(y - w) + '" stroke="#3a3530" stroke-width="1.4" fill="none"/>'; } return s; }
  // a skyline strip; windows blink on and off over time
  function city(t, y, h, col, win, seed, night) {
    var s = '<path d="M-400 ' + (y + 400) + ' V' + y, x = -400, rects = "";
    while (x < 1040) { var w = 30 + hash(x + seed) * 50, hh = h * (0.4 + hash(x * 1.7 + seed) * 0.6); s += " V" + f(y - hh) + " H" + f(x + w) + " V" + y;
      if (win) for (var wy = y - hh + 8; wy < y - 6; wy += 13) for (var wx = x + 6; wx < x + w - 8; wx += 12) { var k = Math.floor(wx * 3 + wy * 7 + seed), on = hash(k + Math.floor(t * 0.7 + hash(k) * 5)) > (night ? 0.45 : 0.75); if (on) rects += '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="5" height="7" fill="' + win + '" opacity="' + (night ? 0.85 : 0.6) + '"/>'; }
      x += w; }
    return s + " H1040 V" + (y + 400) + ' Z" fill="' + col + '"/>' + rects;
  }
  function grass(t, y, col1, col2) {
    var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#' + col1 + ')"/>';
    for (var i = 0; i < 90; i++) { var x = -300 + i * 13 + hash(i) * 8, sw = Math.sin(t * 2.2 + i * 0.7) * 3, yy = y + 6 + hash(i + 2) * 60; s += '<path d="M' + f(x) + ' ' + f(yy) + ' q' + f(sw) + ' -6 ' + f(sw * 1.6) + ' -10" stroke="' + col2 + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }
    return s;
  }
  function cars(t, y, sp) { var s = ""; for (var i = 0; i < 5; i++) { var x = ((t * sp * (i % 2 ? 1 : -0.8) + i * 230) % 1300 + 1300) % 1300 - 330; s += '<g transform="translate(' + f(x) + ' ' + y + ')"><rect x="-14" y="-8" width="28" height="9" rx="3" fill="' + ["#2f6f9f", "#e2b035", "#8f2618", "#f4f1e8", "#4f8f5a"][i] + '" stroke="#1c1c1c"/><rect x="-8" y="-13" width="15" height="6" rx="2" fill="#cfe1ec" stroke="#1c1c1c"/><circle cx="-8" cy="2" r="3" fill="#1c1c1c"/><circle cx="8" cy="2" r="3" fill="#1c1c1c"/></g>'; } return s; }

  // ── the pilot ───────────────────────────────────────────
  function eyes(mood, t, r) {
    var blink = ((t * 0.55 + 0.3) % 1) < 0.05, k = r / 13, s = "";
    if (blink && mood !== "dizzy" && mood !== "shock") return '<path d="M' + f(-6 * k) + ' 0 h' + f(4 * k) + ' M' + f(2 * k) + ' 0 h' + f(4 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
    if (mood === "happy") return '<path d="M' + f(-7 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" fill="none" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(6 * k) + ' q' + f(4 * k) + ' ' + f(4 * k) + ' ' + f(8 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.6 * k) + '" fill="none"/>';
    if (mood === "shock") return '<circle cx="' + f(-4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '"/><circle cx="' + f(4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '"/><ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(2.4 * k) + '" ry="' + f(3.2 * k) + '" fill="#1c1c1c"/>';
    if (mood === "dizzy") { for (var e = -1; e <= 1; e += 2) { var p = "M" + f(e * 4 * k) + " " + f(-1 * k); for (var a = 0; a < 12; a++) { var ang = a * 0.9 + t * 8 * e, rr = a * 0.28 * k; p += " L" + f(e * 4 * k + Math.cos(ang) * rr) + " " + f(-1 * k + Math.sin(ang) * rr); } s += '<path d="' + p + '" stroke="#1c1c1c" stroke-width="' + f(1.1 * k) + '" fill="none"/>'; } return s + '<path d="M' + f(-4 * k) + ' ' + f(7 * k) + ' q' + f(2 * k) + ' ' + f(-2 * k) + ' ' + f(4 * k) + ' 0 q' + f(2 * k) + ' ' + f(2 * k) + ' ' + f(4 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" fill="none"/>'; }
    if (mood === "curious") return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-4 * k) + ' v' + f(6 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(1 * k) + ' ' + f(-9 * k) + ' l' + f(6 * k) + ' ' + f(-2 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" stroke-linecap="round"/>';
    if (mood === "worry") return '<path d="M' + f(-4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + ' M' + f(4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(-7 * k) + ' ' + f(-7 * k) + ' l' + f(5 * k) + ' ' + f(2 * k) + ' M' + f(7 * k) + ' ' + f(-7 * k) + ' l' + f(-5 * k) + ' ' + f(2 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.3 * k) + '" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(8 * k) + ' q' + f(4 * k) + ' ' + f(-3 * k) + ' ' + f(8 * k) + ' 0" stroke="#1c1c1c" stroke-width="' + f(1.4 * k) + '" fill="none"/>';
    return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + '" stroke="#1c1c1c" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
  }
  function head(x, y, r, mood, t, look) { return '<g transform="translate(' + f(x + (look || 0) * r * 0.12) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/><g transform="translate(' + f((look || 0) * r * 0.2) + ' 0)">' + eyes(mood, t, r) + '</g></g>'; }
  // ── explainer marks ─────────────────────────────────────
  function arrow(x1, y1, x2, y2, col, w, p) {
    p = clamp(p == null ? 1 : p); if (p <= 0) return "";
    var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = w * 2.6;
    var hd = 'M' + f(xe + Math.cos(a) * h * 0.4) + ' ' + f(ye + Math.sin(a) * h * 0.4) + ' L' + f(xe - Math.cos(a - 0.5) * h) + ' ' + f(ye - Math.sin(a - 0.5) * h) + ' L' + f(xe - Math.cos(a + 0.5) * h) + ' ' + f(ye - Math.sin(a + 0.5) * h) + ' Z';
    return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.5) + ' ' + f(ye - Math.sin(a) * h * 0.5) + '" stroke="#1c1c1c" stroke-width="' + (w + 3) + '" stroke-linecap="round"/><path d="' + hd + '" fill="#1c1c1c" stroke="#1c1c1c" stroke-width="3" stroke-linejoin="round"/>' +
           '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.5) + ' ' + f(ye - Math.sin(a) * h * 0.5) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/><path d="' + hd + '" fill="' + col + '"/>';
  }
  function curl(cx, cy, r, a0, a1, col, w, p) {   // curved arrow along a circle
    p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var a = lerp(a0, a1, p), d = "M" + f(cx + Math.cos(a0) * r) + " " + f(cy + Math.sin(a0) * r * 0.45);
    for (var i = 1; i <= 24; i++) { var aa = lerp(a0, a, i / 24); d += " L" + f(cx + Math.cos(aa) * r) + " " + f(cy + Math.sin(aa) * r * 0.45); }
    var ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * 0.45, ta = Math.atan2(Math.cos(a) * r * 0.45 * Math.sign(a1 - a0), -Math.sin(a) * r * Math.sign(a1 - a0)), h = w * 2.4;
    var hd = 'M' + f(ex + Math.cos(ta) * h * 0.6) + ' ' + f(ey + Math.sin(ta) * h * 0.6) + ' L' + f(ex - Math.cos(ta - 0.55) * h) + ' ' + f(ey - Math.sin(ta - 0.55) * h) + ' L' + f(ex - Math.cos(ta + 0.55) * h) + ' ' + f(ey - Math.sin(ta + 0.55) * h) + ' Z';
    return '<path d="' + d + '" stroke="#1c1c1c" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/><path d="' + hd + '" fill="' + col + '" stroke="#1c1c1c" stroke-width="2"/>';
  }
  // brush-swash label that pops in at time u0 of the shot
  function tag(text, x, y, u, u0, rot, size, col) {
    var k = pop((u - u0) / 1.2); if (k <= 0) return ""; size = size || 23; var w = text.length * size * 0.52 + 40;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + (rot || -3) + ') scale(' + k.toFixed(3) + ')"><use href="#swash" fill="' + (col || "#e8c48e") + '" transform="translate(' + f(-w / 2) + ' ' + f(-size * 1.05) + ') scale(' + f(w / 220) + ' ' + f(size * 0.072) + ')"/><text x="0" y="' + f(size * 0.35) + '" text-anchor="middle" class="tag" style="font-size:' + size + 'px">' + text + '</text></g>';
  }

  // ── pieces for this episode ─────────────────────────────
  // The Egyptian tea glass (the tapered clear "كوباية" on a small saucer), the lunch plates (ful, lentils, baladi bread,
  // spinach, chicken, meat), a cut-away gut, and the mascots: Fe (an iron ball), the tannins (brown blobs with grabby arms)
  // and vitamin C (an orange ball).
  var INK = "#1c1c1c", TEA = "#b5541c";
  function G(x, y, s, inner, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + ' scale(' + (s || 1) + ')">' + inner + '</g>'; }
  function mix(a, b, k) { k = clamp(k); var p = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }, s = "#"; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(p(a, i), p(b, i), k)).toString(16); s += v.length < 2 ? "0" + v : v; } return s; }

  // the dining room: warm wall, a window with a moving sky, a hanging lamp, the table with a cloth
  function room(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + (o.night ? "#5a4636" : "#efd9b4") + '"/>';
    for (var i = 0; i < 20; i++) s += '<path d="M' + (-380 + i * 72) + ' -300 V260" stroke="#000" stroke-width="18" opacity=".025"/>';
    s += '<rect x="440" y="20" width="170" height="130" fill="url(#sky-' + (o.night ? "dusk" : "day") + ')" stroke="#7a5a3a" stroke-width="8"/>';
    s += '<g clip-path="url(#win)">' + clouds(t, 18, 40, 3, 0.9, 0.5) + birds(t, 70, 30) + '</g><path d="M525 20 V150 M440 85 H610" stroke="#7a5a3a" stroke-width="5"/>';
    var sw = Math.sin(t * 1.3) * 4; s += '<path d="M150 -300 L' + f(150 + sw) + ' 20" stroke="#3a3024" stroke-width="2"/><path d="M' + f(124 + sw) + ' 40 Q' + f(150 + sw) + ' 4 ' + f(176 + sw) + ' 40 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><ellipse cx="' + f(150 + sw) + '" cy="44" rx="10" ry="4" fill="#ffe8a0" filter="url(#glow)"/>';
    s += '<rect x="-400" y="250" width="1440" height="200" fill="url(#gWood)"/><rect x="-400" y="246" width="1440" height="10" fill="#f4f1e8"/>';
    for (var c = -400; c < 1040; c += 40) s += '<rect x="' + c + '" y="246" width="20" height="10" fill="#c23a26" opacity=".7"/>';
    return s;
  }
  // tea glass, origin at the saucer's centre. o: {s, level 0..1, col, steam, spin, tannins, noSaucer}
  function teaGlass(x, y, t, o) {
    o = o || {}; var lv = o.level == null ? 0.85 : o.level, h = 72, s = "";
    if (!o.noSaucer) s += '<ellipse cx="0" cy="2" rx="40" ry="9" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="0" rx="22" ry="4" fill="#d9d4c8"/>';
    var top = -h * lv, wt = lerp(17, 23, lv);
    if (lv > 0) s += '<path d="M-17 -2 L' + f(-wt) + ' ' + f(top) + ' Q0 ' + f(top + 3 + Math.sin(t * 3) * 1.5) + ' ' + f(wt) + ' ' + f(top) + ' L17 -2 Z" fill="' + (o.col || "url(#gTea)") + '"/>';
    if (o.tannins) for (var i = 0; i < 6; i++) { var px = Math.sin(t * 1.4 + i * 2.1) * 12, py = top + 10 + ((i * 9 + t * 8) % (Math.max(8, -top - 14))); s += G(px, py, 0.32, tanninBody(t + i, "curious", 0)); }
    s += '<path d="M-17 -2 L-23 ' + -h + ' L23 ' + -h + ' L17 -2 Z" fill="#dff1f7" fill-opacity=".22" stroke="' + INK + '" stroke-width="2.2"/><path d="M-14 -8 L-18 ' + (-h + 6) + '" stroke="#fff" stroke-width="3" opacity=".7"/>';
    var sp = (o.spin || 0) * t; s += '<path d="M' + f(6 + Math.sin(sp) * 6) + ' -10 L' + f(14 + Math.sin(sp) * 4) + ' ' + (-h - 22) + '" stroke="#9aa2ac" stroke-width="3" stroke-linecap="round"/>';
    if (o.steam !== false) for (var k = 0; k < 3; k++) { var u = (t * 0.5 + k / 3) % 1, sx = -10 + k * 10; s += '<path d="M' + sx + ' ' + f(-h - 6 - u * 50) + ' q8 -8 0 -16 q-8 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.75) + '"/>'; }
    return G(x, y, o.s, s);
  }
  // plates and food. kind: ful | lentil | bread | spinach | chicken | meat | empty
  function plate(x, y, t, kind, sc) {
    var s = '<ellipse cx="0" cy="4" rx="56" ry="15" fill="#000" opacity=".15"/><ellipse cx="0" cy="0" rx="54" ry="15" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-1" rx="38" ry="9" fill="#e9e4d8"/>';
    if (kind === "ful") { s += '<ellipse cx="0" cy="-6" rx="36" ry="10" fill="#7a4a24"/>'; for (var i = 0; i < 16; i++) s += '<ellipse cx="' + f(-28 + hash(i) * 56) + '" cy="' + f(-10 + hash(i + 3) * 8) + '" rx="5" ry="3.4" fill="#9a6232" stroke="#4a2a12" stroke-width=".8"/>'; s += '<path d="M-20 -8 q10 -4 20 0 t20 0" stroke="#e8c048" stroke-width="2.4" fill="none" opacity=".9"/>'; }
    if (kind === "lentil") s += '<path d="M-40 -6 Q-38 22 0 24 Q38 22 40 -6 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-6" rx="40" ry="10" fill="#e38a2e" stroke="' + INK + '" stroke-width="2"/><ellipse cx="-10" cy="-8" rx="8" ry="2" fill="#f7b45a"/>';
    if (kind === "bread") { s += '<ellipse cx="0" cy="-8" rx="40" ry="13" fill="#d9a35a" stroke="#8a5a20" stroke-width="2"/><ellipse cx="0" cy="-11" rx="34" ry="9" fill="#e8bc72"/>'; for (var b = 0; b < 8; b++) s += '<circle cx="' + f(-26 + hash(b + 7) * 52) + '" cy="' + f(-14 + hash(b) * 7) + '" r="1.6" fill="#8a5a20"/>'; }
    if (kind === "spinach") for (var l = 0; l < 7; l++) s += '<ellipse cx="' + f(-24 + l * 8) + '" cy="' + f(-8 - (l % 2) * 4) + '" rx="12" ry="6" fill="' + (l % 2 ? "#3f7a3a" : "#4f9a48") + '" stroke="#24502a" stroke-width="1.2" transform="rotate(' + (l * 25 - 70) + ' ' + f(-24 + l * 8) + ' ' + f(-8 - (l % 2) * 4) + ')"/>';
    if (kind === "chicken") s += '<path d="M-26 -8 C-26 -26 10 -28 18 -14 C24 -4 6 4 -14 2 C-22 2 -26 -2 -26 -8 Z" fill="#c9823a" stroke="#6a3a12" stroke-width="2"/><path d="M16 -12 L34 -20" stroke="#f4f1e8" stroke-width="6" stroke-linecap="round"/><circle cx="36" cy="-21" r="4" fill="#f4f1e8"/>';
    if (kind === "meat") s += '<path d="M-30 -6 C-32 -20 20 -24 30 -12 C36 -2 10 4 -20 2 Z" fill="#8a3a24" stroke="#4a1a10" stroke-width="2"/><path d="M-20 -10 q16 -6 34 -2" stroke="#f0c0a0" stroke-width="2" fill="none"/>';
    return G(x, y, sc, s);
  }
  // a seated person at the table: shirt + ball head; o: {col, arm: 0..1 raises a hand}
  function person(x, y, t, mood, o) {
    o = o || {}; var b = Math.sin(t * 2.2) * 1.5, s = '<path d="M-44 70 C-46 10 -26 -6 0 -6 C26 -6 46 10 44 70 Z" fill="' + (o.col || "#3f6f8f") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    if (o.hijab) s += '<circle cx="0" cy="-30" r="31" fill="' + o.hijab + '" stroke="' + INK + '" stroke-width="2.4"/>';
    s += head(0, -30, 26, mood, t, o.look);
    if (o.belly) s += '<ellipse cx="0" cy="40" rx="30" ry="26" fill="' + (o.col || "#3f6f8f") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.arm) { var ay = lerp(40, -10, o.arm); s += '<path d="M30 20 Q52 ' + f(ay + 20) + ' 50 ' + f(ay) + '" stroke="' + (o.col || "#3f6f8f") + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="50" cy="' + f(ay) + '" r="8" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>'; }
    return G(x, y + b, o.s, s);
  }
  // mascots
  function eyesAt(mood, t, r) { return '<g transform="translate(0 ' + f(r * 0.12) + ')">' + eyes(mood, t, r * 0.8) + '</g>'; }
  function iron(x, y, t, o) {
    o = o || {}; var r = o.r || 16, by = Math.sin(t * 3 + x * 0.05) * 2;
    return G(x, y + by, o.s, '<circle r="' + (r + 1.5) + '" fill="' + INK + '"/><circle r="' + r + '" fill="url(#gIron)"/><circle cx="' + f(-r * .35) + '" cy="' + f(-r * .45) + '" r="' + f(r * .22) + '" fill="#fff" opacity=".6"/>' +
      '<text y="' + f(-r * 0.3) + '" text-anchor="middle" style="font:900 ' + f(r * 0.62) + 'px Noto Sans Arabic;fill:#fff">Fe</text>' + G(0, r * 0.25, 0.75, eyesAt(o.mood || "happy", t, r)) + (o.glow ? '<circle r="' + (r + 8) + '" fill="none" stroke="#ffd36a" stroke-width="3" opacity="' + f(0.5 + 0.4 * Math.sin(t * 6)) + '"/>' : ""));
  }
  function tanninBody(t, mood, grab) {
    var d = ""; for (var a = 0; a <= 24; a++) { var ang = a / 24 * Math.PI * 2, rr = 15 + 3 * Math.sin(ang * 5 + t * 3); d += (a ? " L" : "M") + f(Math.cos(ang) * rr) + " " + f(Math.sin(ang) * rr); }
    var g = grab || 0, arm = '<path d="M-14 4 Q' + f(-26 - g * 6) + ' ' + f(-2 - g * 10) + ' ' + f(-24 - g * 10) + ' ' + f(-12 - g * 8) + ' M14 4 Q' + f(26 + g * 6) + ' ' + f(-2 - g * 10) + ' ' + f(24 + g * 10) + ' ' + f(-12 - g * 8) + '" stroke="' + INK + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
    return arm + '<path d="' + d + ' Z" fill="url(#gTannin)" stroke="' + INK + '" stroke-width="2.2"/>' + G(0, 0, 0.7, eyes(mood || "curious", t, 16));
  }
  function tannin(x, y, t, o) { o = o || {}; return G(x, y + Math.sin(t * 4 + x) * 2, o.s, tanninBody(t, o.mood, o.grab), Math.sin(t * 2 + y) * 8); }
  // iron caught by tannins: one big clump
  function clump(x, y, t, sc, mood) {
    var s = ""; [[-22, -14], [22, -16], [0, 22], [-24, 14], [24, 14]].forEach(function (p, i) { s += G(p[0] + Math.sin(t * 3 + i) * 1.5, p[1], 0.9, tanninBody(t + i, i % 2 ? "happy" : "curious", 1), i * 40); });
    return G(x, y, sc, s + iron(0, 0, t, { r: 14, mood: mood || "worry" }));
  }
  function vitC(x, y, t, sc) { return G(x, y + Math.sin(t * 3.4) * 3, sc, '<circle r="17.5" fill="' + INK + '"/><circle r="16" fill="url(#gVitC)"/><text y="-2" text-anchor="middle" style="font:900 12px Noto Sans Arabic;fill:#fff">C</text>' + G(0, 5, 0.7, eyes("happy", t, 14))); }
  // a red blood cell carrying oxygen
  function rbc(x, y, t, r, o2) { r = r || 13; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><ellipse rx="' + r + '" ry="' + f(r * 0.8) + '" fill="#d23a2a" stroke="#7a1a10" stroke-width="2"/><ellipse rx="' + f(r * 0.5) + '" ry="' + f(r * 0.38) + '" fill="#a82418"/>' + (o2 ? '<circle cx="' + f(r * 0.8) + '" cy="' + f(-r * 0.8) + '" r="6" fill="#bfe6f7" stroke="#2f7fb8" stroke-width="1.6"/><text x="' + f(r * 0.8) + '" y="' + f(-r * 0.8 + 3) + '" text-anchor="middle" style="font:800 7px Noto Sans Arabic;fill:#1c4a6a">O₂</text>' : "") + '</g>'; }
  // the gut seen from the side: lumen (light pink) with peristalsis, the wall with villi below it, a blood vessel under the wall.
  // o: {gates: show the absorption gates, flowT}
  function gut(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#5a1e22"/>';
    var top = "M-400 40", bot = "M-400 210"; for (var x = -400; x <= 1040; x += 20) { top += " L" + x + " " + f(70 + Math.sin(x * 0.02 - t * 1.6) * 8); }
    s += '<path d="' + top + ' V-300 H-400 Z" fill="url(#gWall)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="' + top + ' V230 H-400 Z" fill="#f7d6cf" opacity=".95"/>';
    // lower wall with villi
    var v = "M-400 230"; for (var vx = -400; vx <= 1040; vx += 28) { var w = Math.sin(vx * 0.05 + t * 2) * 3; v += " L" + vx + " 222 Q" + f(vx + 4 + w) + " 186 " + f(vx + 14 + w) + " 188 Q" + f(vx + 24 + w) + " 190 " + (vx + 28) + " 222"; }
    s += '<path d="' + v + ' L1040 280 H-400 Z" fill="url(#gWall)" stroke="' + INK + '" stroke-width="2"/>';
    if (o.gates) for (var g = 0; g < 6; g++) { var gx = -60 + g * 140; s += '<rect x="' + (gx - 7) + '" y="216" width="14" height="40" rx="5" fill="#f2c230" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + gx + ' 220 V252" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="3 3"/>'; }
    s += '<rect x="-400" y="282" width="1440" height="60" fill="#8f1e18" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var c = 0; c < 16; c++) { var cx = ((c * 90 + t * 60) % 1440) - 400; s += rbc(cx, 312 + Math.sin(c + t) * 6, t, 11, o.o2 && c % 2 === 0); }
    return s;
  }
  // the stomach in a torso, with an acid pool. o: {food: 0..1 pieces breaking down, tea: tea level poured in}
  function stomach(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e4d0"/>';
    s += '<path d="M190 -40 C120 -40 90 40 90 160 C90 330 550 330 550 160 C550 40 520 -40 450 -40 Z" fill="#fbe2cc" stroke="' + INK + '" stroke-width="2.4" opacity=".9"/>';
    s += '<path d="M260 -60 V40" stroke="#c96a6a" stroke-width="30" stroke-linecap="round"/><path d="M260 -60 V40" stroke="#e89a8a" stroke-width="20" stroke-linecap="round"/>';
    var sq = 1 + 0.03 * Math.sin(t * 2.4), body = 'M240 40 C150 40 150 200 230 250 C300 290 400 270 430 210 C450 170 420 140 400 150 C380 160 360 200 320 190 C290 180 290 60 280 40 Z';
    s += G(320, 160, sq, '<path d="' + body + '" transform="translate(-320 -160)" fill="url(#gStomach)" stroke="' + INK + '" stroke-width="3"/>');
    s += '<path d="M425 205 C460 210 470 250 450 280 C430 310 470 330 520 320" stroke="#e89a8a" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M425 205 C460 210 470 250 450 280 C430 310 470 330 520 320" stroke="' + INK + '" stroke-width="2" fill="none" stroke-dasharray="1 0" opacity=".25"/>';
    // acid pool + bubbles
    s += '<path d="M190 210 C220 260 330 280 400 230 C350 250 260 250 190 210 Z" fill="#c9e86a" opacity=".75"/>';
    for (var b = 0; b < 8; b++) { var u = (t * 0.6 + b / 8) % 1; s += '<circle cx="' + f(220 + b * 22 + Math.sin(u * 8 + b) * 4) + '" cy="' + f(240 - u * 70) + '" r="' + f(2 + u * 3) + '" fill="none" stroke="#9ac23a" stroke-width="1.6" opacity="' + f(1 - u) + '"/>'; }
    return s;
  }
  // tanning: a hide stretched on a frame over a vat of bark liquor
  function tanning(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8d2a8"/><rect x="-400" y="280" width="1440" height="200" fill="#9a7a50"/>';
    s += '<path d="M60 300 L80 200 H300 L320 300 Z" fill="#6a4a2a" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="190" cy="204" rx="110" ry="14" fill="#7a3b12" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 6; i++) s += '<rect x="' + f(110 + i * 28 + Math.sin(t * 2 + i) * 4) + '" y="' + f(198 + Math.sin(t * 3 + i) * 2) + '" width="14" height="5" rx="2" fill="#4a2a12" transform="rotate(' + (i * 30) + ' ' + (117 + i * 28) + ' 200)"/>';
    s += '<path d="M400 40 V300 M600 40 V300 M390 40 H610" stroke="#6a4a2a" stroke-width="8"/>';
    var sw = Math.sin(t * 1.4) * 4; s += '<path d="M430 70 C460 50 540 50 570 70 C590 120 ' + f(585 + sw) + ' 200 560 250 C520 270 480 270 440 250 C' + f(415 - sw) + ' 200 410 120 430 70 Z" fill="#a8703a" stroke="#4a2a12" stroke-width="2.4"/>';
    for (var k = 0; k < 6; k++) s += '<path d="M' + (430 + k * 28) + ' 64 L' + (420 + k * 32) + ' 42" stroke="#3a3024" stroke-width="1.4"/>';
    return s;
  }
  function beaker(x, y, t, k, sc) {
    var col = mix("#c0651e", "#141018", k), s = '<path d="M-36 -90 V-6 Q-36 6 -24 6 H24 Q36 6 36 -6 V-90" fill="#dff1f7" fill-opacity=".2" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M-34 -50 Q0 ' + f(-54 + Math.sin(t * 3) * 2) + ' 34 -50 V-6 Q34 4 24 4 H-24 Q-34 4 -34 -6 Z" fill="' + col + '"/>';
    for (var i = 1; i < 4; i++) s += '<path d="M-36 ' + (-90 + i * 20) + ' h12" stroke="' + INK + '" stroke-width="1.4"/>';
    return G(x, y, sc, s + '<path d="M-24 -84 V-12" stroke="#fff" stroke-width="3" opacity=".6"/>');
  }
  function inkwell(x, y, t, sc) {
    return G(x, y, sc, '<ellipse cx="0" cy="0" rx="30" ry="7" fill="#000" opacity=".2"/><path d="M-28 0 V-30 Q-28 -40 -14 -42 V-52 H14 V-42 Q28 -40 28 -30 V0 Z" fill="#20202a" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -32 V-6" stroke="#fff" stroke-width="3" opacity=".35"/>' +
      '<g transform="rotate(' + f(-20 + Math.sin(t * 2) * 6) + ' 0 -50)"><path d="M0 -50 L4 -150 C30 -140 36 -90 4 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.8"/><path d="M2 -52 L6 -146" stroke="' + INK + '" stroke-width="1.2"/></g>');
  }
  function manuscript(x, y, t, p, sc) {
    var s = '<path d="M-130 -90 H130 V90 H-130 Z" fill="#ead8a8" stroke="#8a6a3a" stroke-width="3"/><path d="M-130 -90 q-14 90 0 180 M130 -90 q14 90 0 180" stroke="#8a6a3a" stroke-width="3" fill="none"/>';
    for (var r = 0; r < 8; r++) { var w = 220 * clamp(p * 8 - r); if (w > 0) { var d = "M110 " + (-66 + r * 20); for (var x2 = 0; x2 < w; x2 += 8) d += " l-6 " + f(Math.sin(x2 * 0.7 + r) * 3) + " m-2 0"; s += '<path d="' + d + '" stroke="#2a1e18" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; } }
    return G(x, y, sc, s + '<circle cx="-96" cy="-60" r="12" fill="#a82418" opacity=".85"/>');
  }
  function clock(x, y, t, sp, sc) {
    var a = t * sp, s = '<circle r="44" fill="#fbfbf7" stroke="' + INK + '" stroke-width="4"/><circle r="38" fill="none" stroke="#c23a26" stroke-width="2"/>';
    for (var i = 0; i < 12; i++) s += '<path d="M' + f(Math.sin(i * Math.PI / 6) * 32) + ' ' + f(-Math.cos(i * Math.PI / 6) * 32) + ' L' + f(Math.sin(i * Math.PI / 6) * 37) + ' ' + f(-Math.cos(i * Math.PI / 6) * 37) + '" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M0 0 L' + f(Math.sin(a / 12) * 20) + ' ' + f(-Math.cos(a / 12) * 20) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(a) * 30) + ' ' + f(-Math.cos(a) * 30) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="#c23a26"/>';
    return G(x, y, sc, s);
  }
  function lemon(x, y, t, sq, sc) {
    var s = '<ellipse rx="34" ry="24" fill="#f7d838" stroke="#a88a10" stroke-width="2.4"/><ellipse rx="26" ry="17" fill="#fbeb8a"/>';
    for (var i = 0; i < 8; i++) s += '<path d="M0 0 L' + f(Math.cos(i * Math.PI / 4) * 25) + ' ' + f(Math.sin(i * Math.PI / 4) * 16) + '" stroke="#f2c230" stroke-width="2"/>';
    if (sq) for (var k = 0; k < 4; k++) { var u = (t * 1.2 + k / 4) % 1; s += '<path d="M' + f(-6 + k * 4) + ' ' + f(24 + u * 60) + ' q3 6 0 8 q-3 -2 0 -8 Z" fill="#f7e86a" stroke="#a88a10" stroke-width="1" opacity="' + f(1 - u) + '"/>'; }
    return G(x, y, sc, s, Math.sin(t * 2) * 6);
  }
  function droplet(x, y, t, sc) { return G(x, y + Math.sin(t * 3) * 3, sc, '<path d="M0 -22 C10 -8 16 2 16 8 A16 16 0 0 1 -16 8 C-16 2 -10 -8 0 -22 Z" fill="#d23a2a" stroke="' + INK + '" stroke-width="2"/><circle cx="-5" cy="4" r="4" fill="#fff" opacity=".6"/>'); }
  function qmarks(t, x, y) { var s = ""; for (var i = 0; i < 3; i++) { var u = (t * 0.6 + i / 3) % 1; s += '<text x="' + f(x + (i - 1) * 30) + '" y="' + f(y - u * 40) + '" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:#c23a26;stroke:#1c1c1c;stroke-width:2;paint-order:stroke" opacity="' + f(Math.sin(Math.PI * u)) + '">؟</text>'; } return s; }
  function bigX(x, y, k) { return k <= 0 ? "" : G(x, y, pop(k), '<path d="M-20 -20 L20 20 M20 -20 L-20 20" stroke="#1c1c1c" stroke-width="14" stroke-linecap="round"/><path d="M-20 -20 L20 20 M20 -20 L-20 20" stroke="#e23a2a" stroke-width="9" stroke-linecap="round"/>'); }
  function label(txt, x, y, size, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + size + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:#1c1c1c;stroke-width:5;paint-order:stroke">' + txt + '</text>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(z0, z1, x, y) { return function (u, d) { return [x == null ? 320 : x, y == null ? 180 : y, lerp(z0, z1, ease(u / d))]; }; }
  function pan(x0, x1, y, z) { return function (u, d) { return [lerp(x0, x1, ease(u / d)), y == null ? 180 : y, z || 1]; }; }

  // 0 — lunch is over: "where's the tea?" and the glass slides in
  shot(0, push(1.0, 1.15, 320, 170), function (u, d, t) {
    var s = room(t) + plate(220, 262, t, "empty") + plate(110, 268, t, "bread", 0.8) + person(250, 180, t, u < 1.6 ? "happy" : "curious", { arm: u > 1.6 ? clamp((u - 1.6) / 0.6) : 0 });
    var gx = lerp(760, 420, ease((u - 2.0) / 0.8)); s += teaGlass(gx, 262, t, { s: 1.0, spin: 0 });
    return s + tag("خلصت الغدا", 120, 60, u, 0.3, -3, 20) + tag("فين الشاي؟", 470, 200, u, 1.8, 3, 22);
  });
  // 1 — does tea really digest the food?
  shot(1, push(1.15, 1.3, 330, 190), function (u, d, t) {
    var s = room(t) + plate(220, 262, t, "empty") + person(250, 180, t, "curious", { arm: 1 }) + teaGlass(330, 262, t, { s: 1.1, spin: 3 });
    s += arrow(380, 150, 440, 110, "#f2c230", 4, clamp(u / 1.0)) + qmarks(t, 470, 110);
    return s + tag("بيهضم الأكل؟", 470, 70, u, 0.8, 3, 20);
  });
  // 2 — or does it take something from the food without you noticing?
  shot(2, push(1.25, 1.4, 260, 220), function (u, d, t) {
    var s = room(t) + plate(200, 262, t, "ful") + teaGlass(330, 262, t, { s: 1.05 });
    var k = clamp((u - 0.6) / 1.6); s += tannin(lerp(300, 225, k < 0.5 ? k * 2 : 2 - k * 2), lerp(230, 245, k), t, { s: 0.9, mood: "curious", grab: k });
    if (k > 0.5) s += iron(lerp(205, 300, (k - 0.5) * 2), lerp(240, 225, (k - 0.5) * 2), t, { r: 9, mood: "shock" });
    return s + tag("بياخد حاجة؟", 160, 120, u, 1.2, -3, 20);
  });
  // 3 — the brand question
  shot(3, push(1.0, 1.12, 320, 175), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2016"/>' + '<circle cx="320" cy="170" r="140" fill="#f2c230" opacity=".25" filter="url(#soft)"/>' + teaGlass(320, 270, t, { s: 2.1, spin: 4 });
    return s + tag("إيه الحكاية؟", 320, 60, u, 0.2, -2, 28, "#f2c230");
  });
  // 4 — in the stomach, acid breaks the food into small pieces
  shot(4, push(1.0, 1.12, 320, 160), function (u, d, t) {
    var s = stomach(t), k = clamp(u / (d * 0.8));
    for (var i = 0; i < 10; i++) { var big = i < 3, a = hash(i) * 6.28, r = big ? 0 : 20 + hash(i + 2) * 30 * k, px = 300 + Math.cos(a + t * 0.5) * r * 1.4, py = 190 + Math.sin(a + t * 0.5) * r * 0.6;
      if (big) s += '<ellipse cx="' + f(270 + i * 30) + '" cy="' + f(180 + Math.sin(t * 2 + i) * 4) + '" rx="' + f(18 * (1 - k * 0.7)) + '" ry="' + f(12 * (1 - k * 0.7)) + '" fill="' + ["#9a6232", "#d9a35a", "#4f9a48"][i] + '" stroke="' + INK + '" stroke-width="1.6"/>';
      else if (k > 0.2) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(4 + hash(i) * 3) + '" fill="' + ["#9a6232", "#d9a35a", "#4f9a48", "#e38a2e"][i % 4] + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
    return s + tag("حامض المعدة", 470, 60, u, 0.6, 3, 20, "#d8f08a") + tag("بيفكّك الأكل", 150, 320, u, 1.6, -3, 18);
  });
  // 5 — among the pieces: iron
  shot(5, push(1.25, 1.55, 320, 190), function (u, d, t) {
    var s = stomach(t); for (var i = 0; i < 10; i++) { var a = hash(i) * 6.28 + t * 0.5; s += '<circle cx="' + f(300 + Math.cos(a) * 60) + '" cy="' + f(190 + Math.sin(a) * 22) + '" r="' + f(4 + hash(i) * 3) + '" fill="' + ["#9a6232", "#d9a35a", "#4f9a48", "#e38a2e"][i % 4] + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
    s += iron(310, 185, t, { r: 10 + 8 * pop(u / 1.2), glow: true });
    return s + tag("الحديد", 400, 130, u, 0.8, 3, 22, "#f2a0a0");
  });
  // 6 — iron makes haemoglobin, which carries oxygen in the blood
  shot(6, pan(260, 380, 180, 1.0), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#5a1e22"/><path d="M-400 90 C0 60 300 120 1040 80 V280 C600 300 200 250 -400 290 Z" fill="#8f1e18" stroke="' + INK + '" stroke-width="3"/>';
    for (var c = 0; c < 14; c++) { var x = ((c * 110 + t * 90) % 1440) - 400, y = 185 + Math.sin(c * 2 + t) * 40; s += rbc(x, y, t, 20, true); }
    s += G(320, 180, 1, '<circle r="34" fill="#fff" opacity=".2" filter="url(#soft)"/>') + rbc(320, 180, t, 34, false) + iron(320, 180, t, { r: 11, mood: "happy" });
    return s + tag("هيموجلوبين", 200, 50, u, 0.6, -3, 20) + tag("أكسجين O₂", 470, 320, u, 2.2, 3, 19, "#bfe0ff");
  });
  // 7 — iron is absorbed in the first part of the gut, through the wall into the blood
  shot(7, pan(280, 380, 190, 1.0), function (u, d, t) {
    var s = gut(t, { gates: true });
    for (var i = 0; i < 4; i++) { var gx = 20 + i * 140, k = ((u * 0.5 + i * 0.25) % 1); s += iron(gx, k < 0.5 ? lerp(140, 200, k * 2) : lerp(200, 300, (k - 0.5) * 2), t, { r: 10, mood: "happy" }); }
    return s + tag("أول المصران", 320, 30, u, 0.4, -2, 21) + tag("للدم", 520, 330, u, 1.6, 3, 18, "#f2a0a0");
  });
  // 8 — tea has tannins: the bitter taste and the dark colour
  shot(8, push(1.6, 2.1, 320, 200), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efd9b4"/><circle cx="320" cy="170" r="120" fill="#fff" opacity=".4" filter="url(#soft)"/>' + teaGlass(320, 262, t, { s: 1.3, tannins: true, steam: true });
    return s + tag("تانينات", 220, 120, u, 0.6, -3, 16) + tag("طعم قابض", 420, 230, u, 1.8, 3, 14, "#f2c48e");
  });
  // 9 — tannins meet iron and grab it hard
  shot(9, push(1.05, 1.2, 320, 160), function (u, d, t) {
    var s = gut(t), k = ease(clamp((u - 0.3) / 1.4));
    s += iron(320, 140, t, { r: 18, mood: k > 0.8 ? "shock" : "happy" });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p, i) { s += tannin(320 + p[0] * lerp(220, 30, k), 140 + p[1] * lerp(60, 22, k), t + i, { s: 1.0, mood: "curious", grab: k }); });
    return s + tag("بتمسك فيه!", 470, 50, u, 1.8, 3, 21);
  });
  // 10 — a big complex that doesn't dissolve and can't pass the wall
  shot(10, push(1.0, 1.1, 320, 180), function (u, d, t) {
    var s = gut(t, { gates: true });
    s += clump(360, 150 + Math.sin(t * 3) * 25, t, 1.0, "worry") + bigX(360, 225, u - 1.4);
    return s + tag("مركّب كبير", 180, 60, u, 0.4, -3, 21) + tag("مش بيعدّي", 520, 120, u, 1.8, 3, 18, "#f2a0a0");
  });
  // 11 — the iron passes through and leaves, as if you never ate it
  shot(11, function (u, d) { return [lerp(260, 420, ease(u / d)), 170, 1.0]; }, function (u, d, t) {
    var s = gut(t, { gates: true }) + clump(lerp(140, 640, u / d), 140, t, 0.9, "worry");
    s += arrow(lerp(240, 740, u / d), 140, lerp(320, 820, u / d), 140, "#f2c230", 5, 1);
    return s + tag("يطلع برة!", lerp(330, 520, u / d), 50, u, 1.0, 3, 21);
  });
  // 12 — one study: a glass of tea cut iron absorption from a bread meal by up to 90%
  shot(12, push(1.0, 1.06, 320, 180), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e4d0"/><path d="M60 300 H600" stroke="' + INK + '" stroke-width="3"/>';
    var h1 = 200 * ease(clamp(u / 1.0)), h2 = 200 * lerp(1, 0.1, ease(clamp((u - 1.4) / 1.4)));
    s += '<rect x="170" y="' + f(300 - h1) + '" width="90" height="' + f(h1) + '" rx="6" fill="#d23a2a" stroke="' + INK + '" stroke-width="2.4"/>' + (u > 0.6 ? '<rect x="370" y="' + f(300 - h2) + '" width="90" height="' + f(h2) + '" rx="6" fill="#d23a2a" stroke="' + INK + '" stroke-width="2.4"/>' : "");
    s += '<g transform="translate(215 336)">' + '<rect x="-16" y="-14" width="32" height="20" rx="6" fill="#bfe6f7" stroke="' + INK + '" stroke-width="1.6"/></g>' + label("مية", 215, 350, 16, "#fff") + teaGlass(415, 352, t, { s: 0.45, steam: false, noSaucer: true });
    s += plate(560, 160, t, "bread", 0.9);
    if (u > 2.4) s += label("−90%", 500, 120, 44, "#f2c230");
    return s + tag("وجبة عيش", 560, 90, u, 0.4, 3, 17) + tag("امتصاص الحديد", 220, 40, u, 0.9, -2, 18, "#f2a0a0");
  });
  // 13 — the biggest problem is the iron in ful, lentils, bread and spinach
  shot(13, pan(240, 400, 190, 1.05), function (u, d, t) {
    var s = room(t), list = ["ful", "lentil", "bread", "spinach"];
    list.forEach(function (k, i) { s += plate(110 + i * 140, 262 - (i % 2) * 6, t, k, pop((u - i * 0.5) / 1.0) || 0.001); if (u > i * 0.5 + 0.5) s += iron(110 + i * 140, 200 + Math.sin(t * 3 + i) * 4, t, { r: 9, mood: "n" }); });
    return s + tag("فول وعدس", 180, 80, u, 0.4, -3, 19) + tag("عيش وسبانخ", 470, 120, u, 1.6, 3, 19);
  });
  // 14 — the body takes this kind in with difficulty; tea makes it harder
  shot(14, push(1.05, 1.2, 320, 190), function (u, d, t) {
    var s = gut(t, { gates: true }), cl = ((u * 0.4) % 1);
    s += iron(320, lerp(150, 175, Math.abs(Math.sin(t * 2))), t, { r: 14, mood: "worry" });
    s += '<path d="M320 160 Q380 120 ' + f(430 + Math.sin(t * 3) * 6) + ' 110" stroke="' + INK + '" stroke-width="3" fill="none"/>' + tannin(440 + Math.sin(t * 3) * 6, 100, t, { mood: "happy", grab: 1 });
    return s + tag("بالعافية", 170, 60, u, 0.4, -3, 22) + tag("والشاي يصعّبها", 480, 300, u, 1.8, 3, 17, "#f2c48e");
  });
  // 15 — iron from meat and chicken: tea affects it much less
  shot(15, push(1.0, 1.1, 320, 200), function (u, d, t) {
    var s = room(t) + plate(220, 262, t, "meat") + plate(420, 262, t, "chicken");
    s += iron(320, 160, t, { r: 18, mood: "happy", glow: true }) + '<circle cx="320" cy="160" r="32" fill="#7cc4f2" fill-opacity=".18" stroke="#2f7fb8" stroke-width="3" stroke-dasharray="6 5"/>';
    var bx = 450 + Math.sin(t * 5) * 6 + 40 * Math.max(0, Math.sin(t * 1.5)); s += tannin(bx, 150, t, { mood: "dizzy" });
    return s + tag("لحمة وفراخ", 180, 70, u, 0.4, -3, 19) + tag("تأثير أقل", 480, 70, u, 1.6, 3, 19, "#bfe0ff");
  });
  // 16 — tannins are what people used to tan leather with
  shot(16, pan(220, 420, 180, 1.0), function (u, d, t) { return tanning(t) + tag("تانين", 190, 150, u, 0.6, -3, 20) + tag("دبغ الجلد", 500, 330, u, 1.8, 3, 20); });
  // 17 — tannin + iron = deep black
  shot(17, push(1.1, 1.3, 320, 200), function (u, d, t) {
    var k = clamp((u - 0.8) / 1.4), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e4d0"/>' + beaker(320, 290, t, k, 1.4);
    for (var i = 0; i < 6; i++) { var q = (t * 1.2 + i / 6) % 1; if (u > 0.4 && u < 2.6) s += '<circle cx="' + f(310 + i * 4) + '" cy="' + f(lerp(60, 200, q)) + '" r="3" fill="#7a3b1a"/>'; }
    s += iron(300, 60, t, { r: 12, mood: "curious" });
    return s + tag("تانين + حديد", 160, 90, u, 0.4, -3, 19) + tag("أسود!", 500, 180, u, 2.2, 3, 26, "#c8c8d0");
  });
  // 18 — iron gall ink: books and manuscripts for over a thousand years
  shot(18, push(1.0, 1.12, 320, 170), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#5a4636"/>' + manuscript(280, 180, t, clamp(u / (d * 0.9)), 1.0) + inkwell(490, 290, t, 0.9);
    return s + tag("حبر الحديد", 470, 50, u, 0.4, 3, 20) + tag("+1000 سنة", 170, 320, u, 1.6, -3, 21, "#f2c230");
  });
  // 19 — your stomach works like an inkwell
  shot(19, push(1.0, 1.08, 320, 180), function (u, d, t) {
    var s = stomach(t) + '<rect x="320" y="-300" width="720" height="960" fill="#5a4636"/><path d="M320 -300 V660" stroke="#f2c230" stroke-width="5"/>';
    s += clump(220, 170, t, 0.7, "worry") + inkwell(480, 270, t, 1.0) + label("=", 320, 190, 54, "#f2c230");
    return s + tag("معدتك", 160, 50, u, 0.4, -3, 20) + tag("دواية حبر", 480, 50, u, 1.4, 3, 20);
  });
  // 20 — in Egypt more than a quarter of women have anaemia
  shot(20, push(1.0, 1.1, 320, 180), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e4d0"/>' + '<rect x="-400" y="280" width="1440" height="200" fill="#d9c49a"/>';
    var cols = ["#8f4a9a", "#2f7f6f", "#c23a26", "#2f5f9a"];
    for (var i = 0; i < 4; i++) { var bad = i === 2 && u > 1.0; s += person(110 + i * 140, 230, t + i, bad ? "worry" : "happy", { hijab: ["#d9a0c0", "#a0c0d9", "#e8d090", "#b0d9a0"][i], col: cols[i], s: 0.95 }); if (bad) s += droplet(390 + 40, 120, t, 1.0) + '<circle cx="390" cy="200" r="70" fill="none" stroke="#e23a2a" stroke-width="4" stroke-dasharray="8 6" opacity="' + f(0.6 + 0.4 * Math.sin(t * 5)) + '"/>'; }
    return s + tag("أكتر من الربع", 200, 50, u, 0.6, -3, 21) + tag("أنيميا", 510, 50, u, 1.4, 3, 22, "#f2a0a0");
  });
  // 21 — especially pregnant women, children, and people who eat little meat
  shot(21, pan(260, 380, 190, 1.0), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8f0e0"/>' + grass(t, 270, "grass-day", "#5a7a3a");
    s += person(140, 210, t, "happy", { hijab: "#d9a0c0", col: "#8f4a9a", belly: true }) + person(320, 240, t + 1, "happy", { col: "#e2b035", s: 0.7 }) + person(500, 210, t + 2, "n", { col: "#2f7f6f" }) + plate(560, 300, t, "spinach", 0.6);
    return s + tag("الحوامل", 140, 60, u, 0.3, -3, 19) + tag("الأطفال", 320, 110, u, 1.0, 3, 18) + tag("أكل نباتي", 500, 60, u, 1.8, -3, 18, "#c8e8b0");
  });
  // 22 — wait an hour after eating: that alone halves tea's effect
  shot(22, push(1.0, 1.1, 320, 180), function (u, d, t) {
    var s = room(t) + plate(140, 262, t, "ful") + clock(320, 150, t, 6, 1.1) + teaGlass(500, 262, t, { s: 1.0 });
    s += arrow(200, 230, 260, 180, "#f2c230", 4, clamp(u / 0.8)) + arrow(380, 180, 450, 230, "#f2c230", 4, clamp((u - 0.6) / 0.8));
    return s + tag("استنى ساعة", 320, 40, u, 0.3, -2, 22) + tag("التأثير للنص", 500, 120, u, 2.6, 3, 17, "#bfe0ff");
  });
  // 23 — squeeze lemon on your food: vitamin C helps iron get absorbed
  shot(23, push(1.0, 1.1, 320, 180), function (u, d, t) {
    var s = gut(t, { gates: true }), k = ((u * 0.45) % 1);
    s += lemon(140, 60, t, true, 0.9);
    for (var i = 0; i < 3; i++) { var gx = 220 + i * 140, kk = (k + i * 0.33) % 1, y = kk < 0.4 ? lerp(140, 200, kk / 0.4) : lerp(200, 310, (kk - 0.4) / 0.6); s += iron(gx, y, t, { r: 11, mood: "happy" }) + vitC(gx + 22, y - 14, t + i, 0.6); }
    return s + tag("ليمون", 140, 130, u, 0.4, -3, 19, "#f7e86a") + tag("فيتامين سي", 500, 40, u, 1.4, 3, 20, "#f2c48e");
  });
  // 24 — payoff: tea doesn't digest food, it snatches its iron: wait an hour and enjoy both
  shot(24, push(1.0, 1.12, 320, 180), function (u, d, t) {
    var s = room(t) + plate(150, 262, t, "lentil") + teaGlass(480, 262, t, { s: 1.0, spin: 2 }) + person(310, 180, t, "happy", { arm: 0.5 + 0.5 * Math.sin(t * 2) });
    s += clock(150, 120, t, 4, 0.55) + iron(410, 120, t, { r: 14, mood: "happy", glow: true });
    return s + tag("استنى ساعة", 160, 40, u, 0.6, -3, 19) + tag("واستمتع بالاتنين", 470, 50, u, 2.2, 3, 18, "#f2c230");
  });
  // 25 — outro
  shot(25, pan(300, 360, 180, 1.0), function (u, d, t) {
    var s = room(t, { night: true }) + teaGlass(320, 262, t, { s: 1.3, spin: 1 }) + iron(200, 210, t, { r: 16, mood: "happy" }) + vitC(440, 210, t, 1.0);
    return s + tag("قولولنا!", 470, 80, u, 0.4, 3, 26);
  });

  window.__parts = { room: room, teaGlass: teaGlass, plate: plate, person: person, iron: iron, tannin: tannin, clump: clump, gut: gut, stomach: stomach, tag: tag, clock: clock, lemon: lemon, vitC: vitC, inkwell: inkwell };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
