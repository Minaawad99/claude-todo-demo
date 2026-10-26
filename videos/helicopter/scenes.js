/* «إزاي الهليكوبتر بتطير؟» — cartoon panels in the reference look, redrawn every frame.
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
  // the pilot up close in the cockpit, hand on a lever: lever = {kind:"collective"|"cyclic", v:-1..1}
  function pilotBig(x, y, t, mood, lever, look) {
    var s = '<g transform="translate(' + x + ' ' + f(y + Math.sin(t * 3.1) * 2.5) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ')">';
    s += '<path d="M-70 150 C-74 60 -46 34 0 34 C46 34 74 60 70 150 Z" fill="#3f6f8f" stroke="#1c1c1c" stroke-width="3"/><path d="M-18 36 L0 64 L18 36" fill="#2f5873" stroke="#1c1c1c" stroke-width="2"/>';
    s += '<path d="M-40 -60 C-40 -96 40 -96 40 -60" fill="none" stroke="#2b2b2b" stroke-width="9"/><rect x="-52" y="-64" width="16" height="28" rx="6" fill="#2b2b2b"/><rect x="36" y="-64" width="16" height="28" rx="6" fill="#2b2b2b"/>';
    s += head(0, -40, 44, mood, t, look);
    if (lever) {
      var v = lever.v, lx, ly, hx, hy;
      if (lever.kind === "collective") { lx = -100; ly = 140; hx = lx - 18 - 30 * v * 0; hy = ly - 70 - 26 * v; s += '<path d="M' + lx + ' ' + ly + ' L' + (lx - 18) + ' ' + f(hy) + '" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/><rect x="' + (lx - 30) + '" y="' + f(hy - 10) + '" width="26" height="16" rx="5" fill="#1c1c1c"/>'; hx = lx - 18; }
      else { lx = 0; ly = 150; hx = lx + 50 * v; hy = 70; s += '<path d="M' + lx + ' ' + ly + ' L' + f(hx) + ' ' + hy + '" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/><rect x="' + f(hx - 9) + '" y="' + (hy - 22) + '" width="18" height="26" rx="6" fill="#1c1c1c"/>'; }
      var sx = lever.kind === "collective" ? -54 : 40, sy = 56;
      s += '<path d="M' + sx + ' ' + sy + ' Q' + f((sx + hx) / 2 - 20) + ' ' + f((sy + hy) / 2 + 26) + ' ' + f(hx) + ' ' + f(hy) + '" stroke="#3f6f8f" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="11" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>';
    }
    return s + '</g>';
  }

  // ── the helicopter ──────────────────────────────────────
  // side view; ph = rotor phase, o: {tilt, mood, smoke, warn, s, noTail, pitchy}
  function heli(x, y, t, ph, o) {
    o = o || {}; var sc = o.s || 1, tilt = o.tilt || 0, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(tilt) + ') scale(' + sc + ')">';
    s += '<use href="#heliBody"/>';
    s += '<g transform="translate(-36 -14) scale(.62)">' + '<path d="M-14 34 C-16 18 -8 12 0 12 C8 12 16 18 14 34 Z" fill="#3f6f8f" stroke="#1c1c1c" stroke-width="1.4"/>' + head(0, 0, 13, o.mood || "n", t, o.look) + '</g>';
    s += '<use href="#heliGlass"/>';
    // tail rotor (seen face-on, spinning fast)
    if (!o.noTail) { var ta = ph * 4.3; s += '<circle cx="160" cy="-10" r="12" fill="#2a2a2a" opacity=".12"/><path d="M' + f(160 + Math.cos(ta) * 12) + ' ' + f(-10 + Math.sin(ta) * 12) + ' L' + f(160 - Math.cos(ta) * 12) + ' ' + f(-10 - Math.sin(ta) * 12) + '" stroke="#1c1c1c" stroke-width="2.6" stroke-linecap="round"/><circle cx="160" cy="-10" r="2.4" fill="#1c1c1c"/>'; }
    // main rotor seen from the side: blades sweep, their length foreshortens with the phase
    var R = 150, c1 = Math.cos(ph), s1 = Math.sin(ph);
    s += '<ellipse cx="0" cy="-66" rx="' + R + '" ry="9" fill="#2a2a2a" opacity=".13"/>';
    s += '<path d="M' + f(-R * c1) + ' ' + f(-66 - 7 * s1) + ' L' + f(R * c1) + ' ' + f(-66 + 7 * s1) + '" stroke="#1c1c1c" stroke-width="3.4" stroke-linecap="round"/>';
    s += '<path d="M' + f(-R * s1) + ' ' + f(-66 + 7 * c1) + ' L' + f(R * s1) + ' ' + f(-66 - 7 * c1) + '" stroke="#1c1c1c" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>';
    s += '<rect x="-5" y="-70" width="10" height="7" rx="2" fill="#1c1c1c"/>';
    if (o.warn) s += '<circle cx="-2" cy="-60" r="7" fill="#ff3b2f" filter="url(#glow)" opacity="' + (Math.sin(t * 10) > 0 ? 1 : 0.2) + '"/><circle cx="-2" cy="-60" r="2.6" fill="#ff8a7e"/>';
    s += '</g>';
    if (o.smoke) for (var k = 0; k < 6; k++) { var u = ((t * 0.5 + k / 6) % 1); s += '<circle cx="' + f(x + 20 * sc + u * 90 * sc) + '" cy="' + f(y - 50 * sc - u * 110 * sc) + '" r="' + f((10 + u * 26) * sc) + '" fill="#6b6f78" opacity="' + f(0.65 * (1 - u)) + '" filter="url(#soft)"/>'; }
    return s;
  }
  // top-down view: ang = body heading (deg), ph = rotor phase
  function heliTop(x, y, t, ang, ph, o) {
    o = o || {}; var sc = o.s || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + sc + ')">';
    s += '<ellipse cx="4" cy="8" rx="64" ry="34" fill="#1c1c1c" opacity=".15" filter="url(#soft2)"/>';
    s += '<path d="M40 -6 L160 -3 L160 3 L40 6 Z" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.6"/><path d="M150 -20 L170 -20 L170 20 L150 20 Z" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.4"/>';
    s += '<ellipse cx="0" cy="0" rx="62" ry="32" fill="url(#gHeliBody)" stroke="#1c1c1c" stroke-width="1.8"/><path d="M-60 0 C-60 -22 -40 -30 -22 -30 L-22 30 C-40 30 -60 22 -60 0 Z" fill="url(#gGlass)" stroke="#1c1c1c" stroke-width="1.4"/>';
    if (!o.noTail) { var ta = ph * 4.3; s += '<path d="M160 ' + f(-14 * Math.cos(ta)) + ' L160 ' + f(14 * Math.cos(ta)) + '" stroke="#1c1c1c" stroke-width="3" stroke-linecap="round"/><path d="M170 -3 L176 0 L170 3" fill="#1c1c1c"/>'; }
    s += '<circle r="140" fill="#2a2a2a" opacity=".1"/><circle r="140" fill="none" stroke="#1c1c1c" stroke-width=".8" opacity=".25" stroke-dasharray="4 6"/>';
    for (var b = 0; b < 2; b++) { var a = ph + b * Math.PI; s += '<path d="M0 0 L' + f(Math.cos(a) * 140) + ' ' + f(Math.sin(a) * 140) + '" stroke="#1c1c1c" stroke-width="6" stroke-linecap="round"/>'; for (var g = 1; g < 4; g++) { var ga = a - g * 0.09; s += '<path d="M0 0 L' + f(Math.cos(ga) * 140) + ' ' + f(Math.sin(ga) * 140) + '" stroke="#1c1c1c" stroke-width="5" opacity="' + (0.2 - g * 0.05) + '" stroke-linecap="round"/>'; } }
    s += '<circle r="9" fill="#3a3d42" stroke="#1c1c1c" stroke-width="1.4"/></g>';
    return s;
  }

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
  function airflow(t, x0, x1, y, n, col, sp, wav) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), x = lerp(x0, x1, u), yy = y + (i % 3 - 1) * 14 + Math.sin(u * 6 + i) * (wav || 0); s += '<path d="M' + f(x) + ' ' + f(yy) + ' h' + f(40) + '" stroke="' + (col || "#fff") + '" stroke-width="2.4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.9) + '"/>'; } return s; }
  function downwash(t, cx, y0, y1, n, col, sp, up) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1); if (up) u = 1 - u; var x = cx + (i / (n - 1) - 0.5) * 240 * (1 + u * 0.3), y = lerp(y0, y1, u); s += '<path d="M' + f(x) + ' ' + f(y) + ' v' + (up ? -18 : 18) + '" stroke="' + (col || "#5d93ad") + '" stroke-width="3" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.9) + '"/>'; } return s; }
  function airfoil(x, y, sc, ang, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-ang) + ') scale(' + sc + ')"><path d="M-60 0 C-60 -12 -40 -18 -10 -16 C20 -14 50 -6 64 0 C50 3 20 6 -10 7 C-40 8 -60 6 -60 0 Z" fill="' + (col || "#c23a26") + '" stroke="#1c1c1c" stroke-width="2"/><path d="M-50 -8 C-30 -14 0 -13 30 -8" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/></g>'; }
  function gauge(x, y, r, v, label) { var a = -2.4 + 4.8 * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#555" stroke-width="2"/><circle r="' + (r - 4) + '" fill="#2b2f34"/><path d="M0 0 L' + f(Math.sin(a) * (r - 8)) + ' ' + f(-Math.cos(a) * (r - 8)) + '" stroke="#f2c230" stroke-width="2.4" stroke-linecap="round"/><circle r="2.6" fill="#f2c230"/>' + (label ? '<text y="' + (r + 14) + '" text-anchor="middle" style="font:700 11px Noto Sans Arabic;fill:#e9e4d8">' + label + '</text>' : "") + '</g>'; }
  function cockpit(t) {   // the inside of the cockpit: dash, gauges, a windscreen with a moving sky
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a2f36"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40 L700 160 L-60 160 Z" fill="url(#sky-day)"/>' + clouds(t, 60, 10, 4, 0.9) + '<path d="M-60 160 V120 C140 90 500 90 700 120 V160 Z" fill="#8fb069"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40" stroke="#1c1c1c" stroke-width="14" fill="none"/><path d="M320 -100 V160" stroke="#1c1c1c" stroke-width="10"/>';
    s += '<path d="M-100 160 H740 V400 H-100 Z" fill="#3a3f46"/><path d="M-100 160 H740" stroke="#1c1c1c" stroke-width="4"/>';
    s += gauge(120, 210, 24, 0.5 + 0.08 * Math.sin(t * 1.3), "") + gauge(190, 214, 20, 0.62, "") + gauge(450, 214, 20, 0.3 + 0.2 * Math.sin(t * 0.8), "") + gauge(520, 210, 24, 0.72 + 0.03 * Math.sin(t * 5), "");
    for (var i = 0; i < 6; i++) s += '<circle cx="' + (260 + i * 22) + '" cy="196" r="4" fill="' + (hash(i + Math.floor(t * 2)) > 0.5 ? "#5bbf6a" : "#2b2f34") + '"/>';
    return s;
  }

  // ── shots: [first line, draw(u, dur, t)] — a shot runs until the next one starts ──
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var PH = function (t) { return t * 9; };      // main rotor phase (rad), always spinning

  // 0 — runway: an airliner has to roll a long way
  shot(0, function (u, d) { return [lerp(250, 420, ease(u / d)), 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var px = lerp(80, 620, ease(clamp(u / (d + 0.6)))), s = sky("day") + sun(560, 60, 22, "#fff3d6") + clouds(t, 14, 20, 5, 0.9);
    s += '<g transform="translate(' + f(-u * 6) + ' 0)">' + city(t, 200, 60, "#a9c4d6", null, 3) + '</g>';
    s += '<path d="M-400 196 H1040 V222 H-400 Z" fill="#c9b892"/><rect x="380" y="166" width="190" height="32" fill="#e9e4d8" stroke="#6b6458"/><rect x="300" y="128" width="14" height="70" fill="#ddd6c6" stroke="#6b6458"/><path d="M290 128 h34 l-6 -14 h-22 Z" fill="#8fb7d4" stroke="#6b6458"/>';
    s += grass(t, 210, "grass-day", "#5d8a3c") + '<path d="M-400 360 L200 222 L460 222 L1040 360 Z" fill="url(#road)"/>';
    for (var i = 0; i < 14; i++) { var yy = 226 + i * i * 1.2 + i * 6 - ((u * 40) % 6); s += '<rect x="' + f(326 - 2 - i * 0.6) + '" y="' + f(yy) + '" width="' + f(4 + i * 1.2) + '" height="' + f(2 + i * 0.8) + '" fill="#f4f1e8"/>'; }
    s += '<g transform="translate(' + f(px) + ' 270) rotate(' + f(-Math.max(0, (u - d + 0.6)) * 8) + ')"><use href="#plane"/></g>';
    s += '<g stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85">' + [0, 1, 2].map(function (k) { var o = (u * 300 + k * 40) % 120; return '<path d="M' + f(px - 190 - o) + ' ' + (252 + k * 16) + ' h' + (60 - k * 10) + '"/>'; }).join("") + '</g>';
    return s + tag("كيلو على الأرض!", 150, 80, u, 0.6, -4) + birds(t, 70, 40);
  });
  // 1 — rooftop: lifts straight up and hangs there; the pilot waves
  shot(1, function (u, d) { return [325, lerp(220, 170, ease(u / d)), lerp(1.0, 1.18, u / d)]; }, function (u, d, t) {
    var lift = ease(clamp(u / 1.8)), hy = lerp(208, 150, lift) + Math.sin(t * 2.6) * 3;
    var s = sky("dusk") + sun(520, 96, 24, "#fff6e2") + clouds(t, 10, 50, 4, 0.6);
    s += '<g transform="translate(' + f(-u * 3) + ' 0)">' + city(t, 250, 90, "#d9b394", "#f6dfa8", 7) + '</g><g transform="translate(' + f(-u * 8) + ' 0)">' + city(t, 300, 110, "#b48565", "#f6dfa8", 11) + '</g>';
    s += '<path d="M180 400 V262 H470 V400 Z" fill="url(#bld)" stroke="#5b4636" stroke-width="1.4"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) s += '<rect x="' + (196 + c * 34) + '" y="' + (276 + r * 26) + '" width="18" height="14" fill="' + (hash(r * 8 + c) > 0.4 ? "#f6dfa8" : "#7a5a44") + '" opacity=".9"/>';
    s += '<path d="M170 262 H480 L470 248 H180 Z" fill="url(#roof)" stroke="#3d3a35" stroke-width="1.4"/><ellipse cx="325" cy="255" rx="86" ry="9" fill="#e4dfd4" stroke="#3d3a35"/><ellipse cx="325" cy="255" rx="70" ry="6.5" fill="none" stroke="#f2c230" stroke-width="2"/>';
    s += '<ellipse cx="325" cy="252" rx="' + f(70 + 30 * lift) + '" ry="6" fill="#1c1c1c" opacity="' + f(0.25 - 0.12 * lift) + '" filter="url(#soft2)"/>';
    s += downwash(t, 325, hy - 50, 248, 8, "#fff", 1.4);
    s += heli(325, hy, t, PH(t), { mood: u > 2 ? "happy" : "n", look: -1 });
    var wave = Math.sin(t * 8) * 10; s += '<g transform="translate(296 ' + f(hy - 10) + ')"><path d="M-4 10 L' + f(-16 + wave * 0.3) + ' -6" stroke="#1c1c1c" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + f(-17 + wave * 0.3) + '" cy="-8" r="3" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="1.2"/></g>';
    return s + birds(t, 110, 55) + tag("واقفة في الهوا!", 500, 190, u, 1.4, 3);
  });
  // 2 — night: engine quits, then it still comes down safe
  shot(2, function (u, d) { return [lerp(330, 300, u / d), lerp(170, 210, ease(u / d)), lerp(1.15, 1.0, u / d)]; }, function (u, d, t) {
    var dn = ease(clamp((u - 1.2) / (d - 1.2))), hx = lerp(330, 300, dn), hy = lerp(140, 262, dn) + Math.sin(t * 2) * 2;
    var s = sky("night") + stars(t) + moon(110, 60) + '<g transform="translate(' + f(-u * 4) + ' 0)">' + city(t, 300, 120, "#162641", "#f2c96a", 5, true) + '</g>';
    s += grass(t, 300, "grass-night", "#25402a");
    s += heli(hx, hy, t, PH(t) * (u < 1.2 ? 1 : 0.8), { mood: u < 2.2 ? "shock" : "happy", smoke: u < 2.6, warn: u < 2.6, tilt: -4 + 6 * dn, s: lerp(1, 1.1, dn) });
    if (u > 2.4) s += '<g opacity="' + f(clamp((u - 2.4) * 2)) + '">' + [0, 1, 2, 3].map(function (k) { var o = ((t * 0.8 + k / 4) % 1); return '<ellipse cx="' + f(hx) + '" cy="' + f(hy + 56) + '" rx="' + f(40 + o * 90) + '" ry="' + f(4 + o * 6) + '" fill="none" stroke="#c9d4e6" stroke-width="1.6" opacity="' + f(1 - o) + '"/>'; }).join("") + '</g>';
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#0d1a33" opacity=".15"/>' + tag("الموتور وقف!", 470, 90, u, 0.4, -3) + tag("بالسلامة!", 160, 250, u, 2.6, 3, 22, "#bfe0b0");
  });
  // 3 — brand: the helicopter crosses the sky behind the question
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 30, 6, 0.9) + '<g transform="translate(' + f(-u * 20) + ' 0)">' + city(t, 330, 70, "#a9c4d6", null, 9) + '</g>';
    s += heli(lerp(760, -120, u / d), 150 + Math.sin(t * 2) * 5, t, PH(t), { s: 0.7, tilt: -8, mood: "happy" });
    return s + tag("إيه الحكاية؟", 320, 260, u, 0.1, -2, 34) + birds(t, 60, 70);
  });
  // 4 — those blades aren't a fan, they're wings: push into the rotor
  shot(4, function (u, d) { return [lerp(320, 330, u / d), lerp(200, 118, ease(u / d)), lerp(1.0, 1.9, ease(u / d))]; }, function (u, d, t) {
    var s = sky("day") + sun(540, 60, 20, "#fff3d6") + clouds(t, 18, 30, 5, 0.9) + '<g transform="translate(' + f(-u * 5) + ' 0)">' + city(t, 340, 70, "#a9c4d6", null, 4) + '</g>';
    s += heli(330, 190 + Math.sin(t * 2.4) * 3, t, PH(t) * 0.35, { mood: "curious", look: -1 });
    var hb = clamp((u - 0.9) * 2); s += '<path d="M330 124 L480 132" stroke="#f2c230" stroke-width="' + f(6 * hb) + '" stroke-linecap="round" opacity="' + f(0.8 * hb) + '"/>';
    return s + tag("مش مروحة…", 230, 90, u, 0.3, -4, 20) + tag("دي أجنحة!", 440, 100, u, 1.2, 3, 20);
  });
  // 5 — same shape as an airliner's wing: two cross-sections side by side, air flowing over both
  shot(5, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 20, 10, 5, 0.6);
    s += '<rect x="20" y="70" width="280" height="220" rx="14" fill="#f4efe4" stroke="#1c1c1c" stroke-width="2"/><rect x="340" y="70" width="280" height="220" rx="14" fill="#f4efe4" stroke="#1c1c1c" stroke-width="2"/>';
    s += '<g transform="translate(160 ' + f(120 + Math.sin(t * 2.4) * 4) + ') scale(.42)"><use href="#plane"/></g><g transform="translate(480 ' + f(128 + Math.sin(t * 2.4 + 1) * 4) + ') scale(.4)">' + heli(0, 0, t, PH(t), {}) + '</g>';
    s += airflow(t, 50, 270, 220, 6, "#5d93ad", 0.8, 3) + airflow(t, 370, 590, 220, 6, "#5d93ad", 0.8, 3);
    s += airfoil(160, 222, 1.3, 4 + Math.sin(t) * 1, "#c9d0d6") + airfoil(480, 222, 1.3, 4 + Math.sin(t) * 1, "#c23a26");
    var eq = pop((u - 1.0) / 1.2); s += '<text x="320" y="230" text-anchor="middle" style="font:900 ' + f(44 * eq) + 'px sans-serif;fill:#1c1c1c">=</text>';
    return s + tag("جناح الطيارة", 160, 300, u, 0.2, -2, 17) + tag("ريشة الهليكوبتر", 480, 300, u, 0.5, 2, 17);
  });
  // 6 — the plane runs so air passes the wing; here the wing itself spins (top view)
  shot(6, function (u, d) { return u < 2.3 ? [lerp(260, 380, u / 2.3), 180, 1.15] : [320, 180, lerp(1.0, 1.15, (u - 2.3) / (d - 2.3))]; }, function (u, d, t) {
    if (u < 2.3) {
      var s = sky("day") + clouds(t, 120, 20, 7, 0.9) + '<g transform="translate(' + f(-((u * 300) % 700)) + ' 0)">' + city(t, 340, 60, "#a9c4d6", null, 2) + '</g>';
      s += '<g transform="translate(320 180) scale(1.1)"><use href="#plane"/></g>' + airflow(t, 700, -100, 150, 9, "#fff", 1.6) + airflow(t, 700, -100, 230, 9, "#fff", 1.6);
      return s + tag("الطيارة بتجري", 320, 70, u, 0.2, -3);
    }
    var v = u - 2.3, s2 = '<rect x="-400" y="-300" width="1440" height="960" fill="#8fb069"/>' + grass(t, -300, "grass-day", "#6f9548") + '<circle cx="320" cy="180" r="160" fill="#7a9c58" opacity=".5"/>';
    s2 += heliTop(320, 180, t, -90, PH(t) * 0.5, {});
    for (var k = 0; k < 10; k++) { var a = PH(t) * 0.5 + 0.4 + k * 0.08; s2 += '<path d="M' + f(320 + Math.cos(a) * 150) + ' ' + f(180 + Math.sin(a) * 150) + ' L' + f(320 + Math.cos(a + 0.05) * 165) + ' ' + f(180 + Math.sin(a + 0.05) * 165) + '" stroke="#fff" stroke-width="2" opacity="' + f(0.8 - k * 0.07) + '"/>'; }
    return s2 + curl(320, 180, 175, -2.2, -0.6, "#f2c230", 5, v / 1.2) + tag("هنا الجناح هو اللي بيلف!", 320, 40, v, 0.4, -2, 20);
  });
  // 7 — blades push air down; air pushes them up
  shot(7, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var hy = 140 + Math.sin(t * 2.2) * 3, s = sky("day") + sun(80, 50, 18, "#fff3d6") + clouds(t, 16, 20, 5, 0.85) + '<g transform="translate(' + f(-u * 4) + ' 0)">' + city(t, 270, 50, "#b9cfdc", null, 8) + '</g>';
    s += grass(t, 270, "grass-day", "#4f7a32");
    for (var i = 0; i < 60; i++) { var x = 180 + i * 5, bend = Math.sin(t * 6 + i) * 5 + (x - 320) * 0.06; s += '<path d="M' + x + ' 300 q' + f(bend) + ' -8 ' + f(bend * 1.8) + ' -14" stroke="#3f6a26" stroke-width="2" fill="none"/>'; }
    s += downwash(t, 320, hy - 40, 290, 10, "#3f7fb0", 1.6);
    s += heli(320, hy, t, PH(t), { mood: "n" });
    s += arrow(320, hy - 80, 320, hy - 80 - 70 * clamp((u - 1.4) / 0.6), "#e2523a", 9);
    return s + tag("الهوا لتحت", 140, 220, u, 0.5, -3, 19, "#cfe3ef") + tag("الريشة لفوق", 500, 60, u, 1.6, 3, 19);
  });
  // 8 — when that push beats the weight, it rises
  shot(8, function (u, d) { return [320, lerp(200, 150, ease(u / d)), 1.05]; }, function (u, d, t) {
    var up = ease(clamp((u - 0.8) / (d - 0.8))), hy = lerp(200, 120, up) + Math.sin(t * 2.4) * 2, s = sky("day") + clouds(t, 18, 20, 5, 0.9);
    s += '<g transform="translate(0 ' + f(up * 30) + ')">' + city(t, 300, 60, "#b9cfdc", null, 12) + grass(t, 300, "grass-day", "#4f7a32") + '</g>';
    s += heli(320, hy, t, PH(t), { mood: up > 0.3 ? "happy" : "n" });
    var lift = lerp(60, 110, clamp(u / 1.2));
    s += arrow(320, hy - 80, 320, hy - 80 - lift, "#e2523a", 10) + arrow(320, hy + 60, 320, hy + 60 + 70, "#2b2620", 10);
    s += '<text x="' + 380 + '" y="' + f(hy - 120) + '" style="font:800 16px Noto Sans Arabic;fill:#a2321e;paint-order:stroke;stroke:#fff;stroke-width:4px">الزقة</text><text x="380" y="' + f(hy + 120) + '" style="font:800 16px Noto Sans Arabic;fill:#1c1c1c;paint-order:stroke;stroke:#fff;stroke-width:4px">الوزن</text>';
    return s + tag("أكبر من الوزن = تطلع!", 160, 60, u, 1.0, -3, 18);
  });
  // 9 — cockpit: so how does the pilot climb and descend?
  shot(9, function (u, d) { return [lerp(330, 310, u / d), 215, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    return cockpit(t) + pilotBig(320, 250, t, "curious", { kind: "collective", v: 0.2 * Math.sin(t * 2) }, Math.sin(t * 1.5)) + tag("يطلع وينزل إزاي؟", 470, 70, u, 0.2, 3, 20);
  });
  // 10 — same rpm, the pilot changes all the blades' angle at once
  shot(10, function (u, d) { return [lerp(290, 360, u / d), 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var pit = 4 + 10 * (0.5 + 0.5 * Math.sin((u - 1.5) * 1.6)) * clamp((u - 1.2) / 0.6) + 2 * Math.sin(u * 5.3), s = sky("day") + clouds(t, 20, 10, 5, 0.7);
    s += '<rect x="30" y="40" width="360" height="280" rx="16" fill="#f4efe4" stroke="#1c1c1c" stroke-width="2"/>';
    s += airflow(t, 60, 340, 180, 7, "#5d93ad", 1.2, 2) + airfoil(210, 180, 2.0, pit, "#c23a26");
    s += '<path d="M90 180 H330" stroke="#1c1c1c" stroke-dasharray="5 5" opacity=".5"/><path d="M130 180 A80 80 0 0 1 ' + f(210 - Math.cos(pit * Math.PI / 180) * 80) + ' ' + f(180 - Math.sin(pit * Math.PI / 180) * 80) + '" stroke="#e2523a" stroke-width="3" fill="none"/>';
    s += '<text x="92" y="' + f(170 - pit * 1.5) + '" style="font:800 20px Noto Serif;fill:#a2321e;direction:ltr">' + Math.round(pit) + '°</text>';
    s += '<g transform="translate(520 200) scale(.62)">' + cockpitMini(t) + pilotBig(0, 0, t, "n", { kind: "collective", v: (pit - 9) / 5 }, 0) + '</g>';
    s += gauge(520, 70, 26, 0.7 + 0.01 * Math.sin(t * 9), "") + '<text x="520" y="114" text-anchor="middle" style="font:700 13px Noto Sans Arabic;fill:#1c1c1c">نفس السرعة</text>';
    return s + tag("ميلة الريش", 210, 300, u, 0.6, -2, 18);
  });
  function cockpitMini(t) { return '<rect x="-190" y="-170" width="380" height="330" rx="20" fill="#2a2f36" stroke="#1c1c1c" stroke-width="3"/>'; }
  // 11 — bigger angle → more air → up; smaller → down
  shot(11, function (u, d) { return [320, 180, 1.0 + 0.06 * Math.sin(u * 0.8)]; }, function (u, d, t) {
    var half = d / 2, big = u < half, k = big ? u / half : (u - half) / half, alt = big ? lerp(230, 110, ease(k)) : lerp(110, 230, ease(k));
    var s = sky("day") + clouds(t, 26, 10, 6, 0.9) + '<g transform="translate(0 ' + f((alt - 170) * -0.4) + ')">' + city(t, 320, 60, "#b9cfdc", null, 6) + grass(t, 320, "grass-day", "#4f7a32") + '</g>';
    s += heli(250, alt + Math.sin(t * 2.3) * 2, t, PH(t), { mood: big ? "happy" : "n" });
    s += downwash(t, 250, alt - 40, alt + 140, big ? 10 : 4, "#3f7fb0", big ? 2 : 1);
    s += '<rect x="470" y="60" width="140" height="120" rx="12" fill="#f4efe4" stroke="#1c1c1c" stroke-width="2"/>' + airfoil(540, 120, 0.9, big ? 14 : 3, "#c23a26");
    s += arrow(250, alt - 90, 250, alt - 90 - (big ? 90 : 36), "#e2523a", 9) + (big ? arrow(560, 250, 560, 190, "#4f8f5a", 8, k * 3) : arrow(560, 190, 560, 250, "#2b2620", 8, k * 3));
    s += '<text x="560" y="290" text-anchor="middle" style="font:800 30px Noto Serif;fill:#fff;paint-order:stroke;stroke:#1c1c1c;stroke-width:5px;direction:ltr">' + Math.round(400 - alt) * 2 + ' m</text>';
    return s + (big ? tag("ميلة أكبر = تطلع", 540, 40, u, 0.2, 2, 17) : tag("ميلة أقل = تنزل", 540, 40, u - half, 0.1, -2, 17, "#cfe3ef"));
  });
  // 12 — push equals weight: it hangs in place
  shot(12, function (u, d) { return [lerp(300, 340, u / d), 170, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var hy = 160 + Math.sin(t * 2.2) * 3, s = sky("dusk") + sun(540, 80, 22, "#fff6e2") + clouds(t, 14, 40, 4, 0.6) + '<g transform="translate(' + f(-u * 6) + ' 0)">' + city(t, 300, 90, "#d9b394", "#f6dfa8", 13) + '</g>' + grass(t, 310, "grass-dusk", "#7a6a3c");
    s += heli(320, hy, t, PH(t), { mood: "happy" }) + arrow(320, hy - 80, 320, hy - 160, "#e2523a", 10) + arrow(320, hy + 60, 320, hy + 140, "#2b2620", 10);
    var b = pop((u - 1.0) / 1.2); s += '<g transform="translate(440 170) scale(' + f(b) + ')"><circle r="22" fill="#4f8f5a" stroke="#1c1c1c" stroke-width="2"/><text y="9" text-anchor="middle" style="font:900 26px sans-serif;fill:#fff">=</text></g>';
    return s + birds(t, 90, 45) + tag("واقفة مكانها", 160, 80, u, 0.5, -3);
  });
  // 13 — cockpit: and forward?
  shot(13, function (u, d) { return [lerp(300, 340, u / d), 215, lerp(1.1, 1.4, ease(u / d))]; }, function (u, d, t) {
    return cockpit(t * 2) + pilotBig(320, 250, t, "curious", { kind: "cyclic", v: 0.3 * Math.sin(t * 3) }, -Math.sin(t * 2)) + tag("ولقدام؟", 470, 70, u, 0.1, 3, 24);
  });
  // 14 — tilt the whole rotor disc
  shot(14, function (u, d) { return [lerp(300, 330, u / d), 170, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var tl = 14 * ease(clamp((u - 0.6) / 1.2)), s = sky("day") + clouds(t, 22, 10, 6, 0.9) + '<g transform="translate(' + f(u * 10) + ' 0)">' + city(t, 320, 60, "#b9cfdc", null, 14) + '</g>';
    s += heli(280, 180 + Math.sin(t * 2.4) * 2, t, PH(t), { tilt: -tl * 0.6 });
    s += '<g transform="translate(280 114) rotate(' + f(-tl) + ')"><ellipse rx="160" ry="20" fill="#f2c230" opacity=".22" stroke="#e2a92c" stroke-width="2" stroke-dasharray="6 5"/></g>';
    s += '<g transform="translate(520 220) scale(.5)">' + cockpitMini(t) + pilotBig(0, 0, t, "n", { kind: "cyclic", v: -tl / 14 }, 0) + '</g>';
    return s + tag("بيميّل دايرة الريش", 300, 40, u, 0.5, -2, 18);
  });
  // 15 — the push tilts: part lifts, part pulls forward — flying over the city
  shot(15, function (u, d) { return [320, 170, 1.05 + 0.05 * Math.sin(u)]; }, function (u, d, t) {
    var s = sky("day") + sun(100, 60, 18, "#fff3d6") + clouds(t, 90, 10, 7, 0.9) + birds(t, 70, 150);
    s += '<g transform="translate(' + f((u * 60) % 300 - 300) + ' 0)">' + city(t, 300, 80, "#b9cfdc", null, 15) + '</g><g transform="translate(' + f((u * 160) % 600 - 600) + ' 0)">' + city(t, 340, 110, "#8fa7b8", "#e9e4d8", 16) + cars(t, 352, 0) + '</g>';
    var hx = 300, hy = 160 + Math.sin(t * 2) * 3, a = -14 * Math.PI / 180;
    s += heli(hx, hy, t, PH(t), { tilt: -10, mood: "happy" });
    var bx = hx - 8, by = hy - 74, L1 = 62 * clamp(u / 0.8);
    s += arrow(bx, by, bx - 0.45 * L1, by - L1, "#e2523a", 9);
    s += arrow(bx + 4, by, bx + 4, by - 58, "#e2a092", 5, (u - 1.2) / 0.6) + arrow(bx, by + 4, bx - 70, by + 4, "#4f8f5a", 7, (u - 1.6) / 0.6);
    return s + tag("جزء بيشدها لقدام", 470, 250, u, 1.6, 3, 18);
  });
  // 16 — the tail: what's it for?
  shot(16, function (u, d) { return [lerp(380, 440, u / d), 170, lerp(1.4, 1.7, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 30, 5, 0.9) + '<g transform="translate(' + f(-u * 8) + ' 0)">' + city(t, 320, 60, "#b9cfdc", null, 17) + '</g>';
    s += heli(280, 180 + Math.sin(t * 2.3) * 2, t, PH(t), { mood: "curious", look: 1 });
    var r = 20 + 6 * Math.sin(t * 6); s += '<circle cx="440" cy="170" r="' + f(r) + '" fill="none" stroke="#f2c230" stroke-width="3"/>';
    return s + tag("الديل ده لازمته إيه؟", 400, 80, u, 0.1, -3, 18);
  });
  // 17 — the motor turns the rotor one way; the body wants the other way (top view)
  shot(17, function (u, d) { return [320, 180, lerp(0.95, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8fb069"/>' + grass(t, -300, "grass-day", "#6f9548") + '<path d="M-400 240 H1040 V300 H-400 Z" fill="#6d6a66"/>' + cars(t, 270, 80);
    var body = -90 - 10 * Math.sin(clamp((u - 1.5) / 2) * Math.PI) * clamp((u - 1.5) * 2);
    s += heliTop(320, 160, t, body, PH(t) * 0.6, { noTail: true, s: 0.9 });
    s += curl(320, 160, 150, -0.6, 1.2, "#e2523a", 6, u / 1.0) + curl(320, 160, 80, 2.6, 1.2, "#5d93ad", 6, (u - 1.5) / 1.0);
    return s + tag("الريش ↻", 520, 50, u, 0.4, 3, 18) + tag("الجسم ↺", 120, 300, u, 1.8, -3, 18, "#cfe3ef");
  });
  // 18 — without anything holding it, it spins like a top; the pilot gets dizzy
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8fb069"/>' + grass(t, -300, "grass-day", "#6f9548");
    var spin = -90 - 360 * u * u * 0.18 - 120 * u;
    s += heliTop(260, 180, t, spin, PH(t) * 0.6, { noTail: true, s: 0.85 });
    for (var k = 0; k < 3; k++) s += curl(260, 180, 150 + k * 14, -1 + k, -1 + k - 1.4, "#fff", 3, 1);
    s += '<circle cx="520" cy="170" r="74" fill="#f4efe4" stroke="#1c1c1c" stroke-width="3"/><g transform="translate(520 176) rotate(' + f(Math.sin(t * 6) * 12) + ')">' + head(0, 0, 46, "dizzy", t, 0) + '</g>';
    return s + tag("زي النحلة!", 520, 300, u, 0.6, 3, 22);
  });
  // 19 — a small rotor in the tail pushes sideways and holds it straight
  shot(19, function (u, d) { return [lerp(320, 360, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var settle = ease(clamp((u - 0.8) / 1.5)), ang = -90 + (1 - settle) * 30 * Math.sin(u * 5);
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8fb069"/>' + grass(t, -300, "grass-day", "#6f9548") + '<path d="M-400 290 H1040 V340 H-400 Z" fill="#6d6a66"/>' + cars(t, 318, 70);
    s += heliTop(300, 200, t, ang, PH(t) * 0.6, { s: 0.85 });
    var tx = 300, ty = 200 - 150 * 0.85; s += arrow(tx + 10, ty, tx + 90, ty, "#e2523a", 8, (u - 0.4) / 0.6);
    for (var k = 0; k < 5; k++) { var o = ((t * 1.5 + k / 5) % 1); s += '<path d="M' + f(tx + 16 + o * 70) + ' ' + f(ty - 10 + (k % 2) * 20) + ' h14" stroke="#fff" stroke-width="2.4" opacity="' + f(1 - o) + '"/>'; }
    s += curl(300, 200, 170, -0.4, 1.0, "#e2523a", 5, 1);
    return s + tag("مروحة الديل بتثبّتها", 470, 60, u, 0.9, 3, 17);
  });
  // 20 — pedals: more or less tail push → it turns right or left
  shot(20, function (u, d) { return [320, 180, 1.0 + 0.05 * Math.sin(u)]; }, function (u, d, t) {
    var turn = Math.sin(clamp((u - 0.8) / (d - 0.8)) * Math.PI * 2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8fb069"/>' + grass(t, -300, "grass-day", "#6f9548");
    s += '<circle cx="230" cy="180" r="150" fill="#7a9c58" opacity=".4"/>' + heliTop(230, 180, t, -90 + turn * 50, PH(t) * 0.6, { s: 0.75 });
    s += '<rect x="420" y="70" width="190" height="230" rx="16" fill="#2a2f36" stroke="#1c1c1c" stroke-width="3"/>';
    for (var p = 0; p < 2; p++) { var down = (p === 0 ? Math.max(0, turn) : Math.max(0, -turn)) * 14, px = 470 + p * 90; s += '<rect x="' + (px - 24) + '" y="' + f(220 + down) + '" width="48" height="16" rx="4" fill="#8a8f96" stroke="#1c1c1c" stroke-width="2"/><path d="M' + px + ' ' + f(130 + down) + ' L' + px + ' ' + f(218 + down) + '" stroke="#3f6f8f" stroke-width="22" stroke-linecap="round"/><ellipse cx="' + px + '" cy="' + f(226 + down) + '" rx="20" ry="9" fill="#1c1c1c"/>'; }
    s += '<text x="470" y="280" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#f4f1e8">شمال</text><text x="560" y="280" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#f4f1e8">يمين</text>';
    return s + tag(turn > 0 ? "يلف يمين" : "يلف شمال", 230, 40, u, 0.6, -3, 19);
  });
  // 21 — night: the engine stops
  shot(21, function (u, d) { return [lerp(320, 330, u / d), 170, lerp(1.1, 1.3, u / d)]; }, function (u, d, t) {
    var s = sky("night") + stars(t) + moon(520, 60) + '<g transform="translate(' + f(-u * 6) + ' 0)">' + city(t, 300, 120, "#162641", "#f2c96a", 21, true) + '</g>';
    s += heli(320, 170 + Math.sin(t * 9) * 1.5, t, PH(t) * 0.7, { mood: "shock", smoke: true, warn: true });
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#ff3b2f" opacity="' + f(0.08 * (Math.sin(t * 10) > 0 ? 1 : 0)) + '"/>' + tag("الموتور وقف!", 470, 80, u, 0.2, -3, 22, "#f2b0a0");
  });
  // 22 — lower the blade angle; it starts to come down
  shot(22, function (u, d) { return [320, lerp(150, 200, u / d), 1.0]; }, function (u, d, t) {
    var dn = u / d, hy = lerp(120, 190, dn), s = sky("night") + stars(t) + '<g transform="translate(0 ' + f(-dn * 60) + ')">' + city(t, 320, 120, "#162641", "#f2c96a", 22, true) + grass(t, 340, "grass-night", "#25402a") + '</g>';
    s += heli(260, hy, t, PH(t) * 0.8, { mood: "worry", tilt: -2 }) + arrow(260, hy + 70, 260, hy + 130, "#9fb3cf", 8, u / 0.8);
    s += '<rect x="450" y="60" width="150" height="110" rx="12" fill="#1e3458" stroke="#c9d4e6" stroke-width="2"/>' + airfoil(525, 115, 0.9, lerp(12, 1, clamp(u / 1.5)), "#c23a26");
    return s + tag("ميلة أقل", 525, 200, u, 0.6, 2, 18, "#cfe3ef");
  });
  // 23 — air rushing up keeps turning the blades, like a windmill
  shot(23, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var hy = 170 + u * 6, s = sky("night") + stars(t) + '<g transform="translate(0 ' + f(-u * 14) + ')">' + city(t, 330, 120, "#162641", "#f2c96a", 23, true) + '</g>';
    s += downwash(t, 280, hy + 120, hy - 90, 12, "#8fc2da", 1.8, true) + heli(280, hy, t, PH(t) * 0.8, { mood: "n" });
    var wa = t * 4; s += '<g transform="translate(540 190)"><path d="M0 0 L-10 110 L10 110 Z" fill="#c9d4e6" stroke="#1c1c1c" stroke-width="2"/>'; for (var b = 0; b < 4; b++) { var a = wa + b * Math.PI / 2; s += '<path d="M0 0 L' + f(Math.cos(a) * 60) + ' ' + f(Math.sin(a) * 60) + '" stroke="#f4f1e4" stroke-width="10" stroke-linecap="round"/><path d="M0 0 L' + f(Math.cos(a) * 60) + ' ' + f(Math.sin(a) * 60) + '" stroke="#1c1c1c" stroke-width="2" fill="none"/>'; } s += '<circle r="6" fill="#1c1c1c"/></g>';
    return s + tag("زي الطاحونة!", 540, 60, u, 0.9, 3, 20) + tag("الهوا طالع لفوق", 120, 300, u, 0.3, -3, 17, "#cfe3ef");
  });
  // 24 — just above the ground: more angle, the blades brake the fall, soft landing at dawn
  shot(24, function (u, d) { return [lerp(300, 320, u / d), lerp(170, 230, ease(u / d)), lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / (d - 1))), hy = lerp(120, 262, k), flare = clamp((u - 1.6) / 1.2) * (1 - clamp((u - 3.4) / 1));
    var s = sky("dawn") + sun(520, 250, 26, "#ffe3b0") + clouds(t, 12, 40, 4, 0.5) + '<g transform="translate(' + f(-u * 4) + ' 0)">' + city(t, 300, 70, "#9a8aa8", "#f6dfa8", 24) + '</g>' + grass(t, 310, "grass-dawn", "#6a7a3c");
    s += heli(300, hy, t, PH(t) * 0.8, { mood: u > d - 1.6 ? "happy" : "worry", tilt: 8 * flare });
    if (u > d - 1.8) s += [0, 1, 2, 3].map(function (j) { var o = ((t * 0.9 + j / 4) % 1); return '<ellipse cx="300" cy="316" rx="' + f(40 + o * 120) + '" ry="' + f(5 + o * 8) + '" fill="#c9b892" opacity="' + f(0.6 * (1 - o)) + '" filter="url(#soft2)"/>'; }).join("");
    s += arrow(300, hy - 80, 300, hy - 80 - 90 * flare, "#e2523a", 9, flare * 2);
    return s + tag("فرملة!", 470, 90, u, 1.7, -3, 22) + tag("بهدوء", 150, 120, u, d - 1.4, 3, 22, "#bfe0b0");
  });
  // 25 — summary: off into the sunset with the two big ideas
  shot(25, function (u, d) { return [lerp(300, 360, u / d), 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(470, 200, 34, "#fff1d0") + clouds(t, 30, 40, 5, 0.6) + '<g transform="translate(' + f(-u * 20) + ' 0)">' + city(t, 300, 100, "#c79a7b", "#f6dfa8", 25) + '</g>' + birds(t, 80, 60);
    s += heli(lerp(420, 240, u / d), 150 + Math.sin(t * 2) * 4, t, PH(t), { tilt: -8, mood: "happy", s: lerp(1, 0.8, u / d) });
    return s + tag("جناح بيلف", 150, 70, u, 1.0, -4, 21) + tag("وميلة مظبوطة", 470, 290, u, 2.4, 3, 21);
  });
  // 26 — outro: pilot waving at us
  shot(26, function (u, d) { return [lerp(290, 350, u / d), 215, lerp(1.0, 1.35, u / d)]; }, function (u, d, t) {
    var s = cockpit(t * 3) + pilotBig(320, 250, t, "happy", null, 0);
    var wv = Math.sin(t * 8) * 18; s += '<path d="M362 306 Q400 ' + f(260 + wv * 0.3) + ' ' + f(410 + wv) + ' 210" stroke="#3f6f8f" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(410 + wv) + '" cy="206" r="12" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2.4"/>';
    return s + tag("حكاية إيه المرة الجاية؟", 320, 60, u, 0.3, -2, 20);
  });

  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 6 * Math.sin(t * 0.7), cy = c[1] + 5 * Math.cos(t * 0.55), z = c[2];
    svg.innerHTML = '<g transform="translate(320 180) scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
  window.__shotStarts = SH.map(function (s) { return s.a; });
})();
