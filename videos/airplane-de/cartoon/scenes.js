/* «إزاي الغواصة بتنزل وتطلع؟» — cartoon panels in the reference look, redrawn every frame (shared helpers from the helicopter episode).
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
  function gauge(x, y, r, v, label) { var a = -2.4 + 4.8 * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#555" stroke-width="2"/><circle r="' + (r - 4) + '" fill="#2b2f34"/><path d="M0 0 L' + f(Math.sin(a) * (r - 8)) + ' ' + f(-Math.cos(a) * (r - 8)) + '" stroke="#f2c230" stroke-width="2.4" stroke-linecap="round"/><circle r="2.6" fill="#f2c230"/>' + (label ? '<text y="' + (r + 14) + '" text-anchor="middle" style="font:700 11px Noto Sans;fill:#e9e4d8">' + label + '</text>' : "") + '</g>'; }
  function cockpit(t) {   // the inside of the cockpit: dash, gauges, a windscreen with a moving sky
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a2f36"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40 L700 160 L-60 160 Z" fill="url(#sky-day)"/>' + clouds(t, 60, 10, 4, 0.9) + '<path d="M-60 160 V120 C140 90 500 90 700 120 V160 Z" fill="#8fb069"/>';
    s += '<path d="M-60 -40 C120 -110 520 -110 700 -40" stroke="#1c1c1c" stroke-width="14" fill="none"/><path d="M320 -100 V160" stroke="#1c1c1c" stroke-width="10"/>';
    s += '<path d="M-100 160 H740 V400 H-100 Z" fill="#3a3f46"/><path d="M-100 160 H740" stroke="#1c1c1c" stroke-width="4"/>';
    s += gauge(120, 210, 24, 0.5 + 0.08 * Math.sin(t * 1.3), "") + gauge(190, 214, 20, 0.62, "") + gauge(450, 214, 20, 0.3 + 0.2 * Math.sin(t * 0.8), "") + gauge(520, 210, 24, 0.72 + 0.03 * Math.sin(t * 5), "");
    for (var i = 0; i < 6; i++) s += '<circle cx="' + (260 + i * 22) + '" cy="196" r="4" fill="' + (hash(i + Math.floor(t * 2)) > 0.5 ? "#5bbf6a" : "#2b2f34") + '"/>';
    return s;
  }

  // ── «Wie fliegt ein Flugzeug?» — new pieces for this episode (shapes from real photos: see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", LIFT = "#5bbf6a", WGT = "#e2523a", THR = "#f2c230", DRG = "#5d93ad", AIR = "#bfe6f7";
  function g(tr, inner) { return '<g transform="' + tr + '">' + inner + '</g>'; }
  function txt(x, y, s, size, col, anchor, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + size + 'px Noto Sans;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + (size > 20 ? 3 : 2) + ';paint-order:stroke">' + s + '</text>'; }
  function qmark(x, y, t, sz, col) { return txt(x, y + Math.sin(t * 4 + x) * 4, "?", sz, col || "#f2c230"); }
  function pulse(t, sp) { return 0.5 + 0.5 * Math.sin(t * (sp || 5)); }

  // the hard-hat character (from the monorail episode): orange vest, white helmet
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.wave) { var wa = Math.sin(t * 7) * 18; s += '<path d="M-44 60 Q-80 30 ' + f(-96 + wa * 0.3) + ' ' + f(-10) + '" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(-96 + wa * 0.3) + '" cy="-14" r="11" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4" transform="rotate(' + f(wa) + ' ' + f(-96 + wa * 0.3) + ' -14)"/>'; }
    return s + '</g>';
  }
  function carSide(x, y, t, s, col, arm) {   // a family car, side view, wheels turning; arm = hand tilt (deg) out of the window
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    if (arm != null) {   // the driver's arm out of the window; the hand rises the more it is tilted
      var hy = -62 - arm * 0.7;
      c += '<path d="M30 -42 Q52 -46 54 ' + f(hy + 6) + '" stroke="#f0c9a0" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30 -42 Q52 -46 54 ' + f(hy + 6) + '" stroke="' + INK + '" stroke-width="12" fill="none" stroke-linecap="round" opacity=".25"/>';
      c += '<g transform="translate(58 ' + f(hy) + ') rotate(' + f(-arm) + ')"><ellipse rx="17" ry="6" fill="#f6d2ad" stroke="' + INK + '" stroke-width="2"/><path d="M8 -4 L18 -3 M8 0 L19 0 M8 4 L17 3" stroke="' + INK + '" stroke-width="1" opacity=".5"/></g>';
    }
    return c + '</g>';
  }

  // ── the A380 (photos: Lufthansa D-AIMC landing, D-AIML on the runway): full-length double deck, rounded nose with the
  // cockpit between the decks, tall swept dark-blue fin, four big engines under a huge swept wing (two seen from the side),
  // a wingtip fence, many-wheeled main gear bogies. Generic livery: white body, blue fin, no airline logo. Nose to the right.
  function a380(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(-(o.pitch || 0)) + ') scale(' + sc + ')">';
    if (o.thrust) for (var k = 0; k < 2; k++) { var ex = [-46, 4][k], ey = [44, 36][k]; for (var j = 0; j < 4; j++) { var u = (t * 2.4 + j / 4) % 1; s += '<ellipse cx="' + f(ex - 40 - u * 90) + '" cy="' + f(ey + Math.sin(t * 20 + j) * 1.5) + '" rx="' + f(10 + u * 26) + '" ry="' + f(4 + u * 5) + '" fill="#fff" opacity="' + f(0.35 * (1 - u) * o.thrust) + '" filter="url(#soft2)"/>'; } }
    // far wing (behind the body)
    s += '<path d="M40 2 L-40 -26 L-70 -30 L-30 4 Z" fill="#9aa3ad" stroke="' + INK + '" stroke-width="1.6"/>';
    // fin + far stabiliser
    s += '<path d="M-130 -32 L-176 -118 L-206 -120 L-198 -30 Z" fill="url(#gTail)" stroke="' + INK + '" stroke-width="2"/><path d="M-150 -60 L-190 -112" stroke="#fff" stroke-width="3" opacity=".35"/>';
    if (o.rudder) s += '<path d="M-198 -30 L-206 -120 L-216 -118 L-212 -30 Z" fill="' + o.rudder + '" stroke="' + INK + '" stroke-width="1.6"/>';
    // fuselage
    s += '<path d="M-212 -18 C-196 -30 -164 -34 -130 -34 L160 -34 C186 -34 206 -18 208 0 C209 12 197 22 176 22 L-110 22 C-150 22 -188 8 -212 -10 Z" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M-150 14 L176 14" stroke="#2a5ea8" stroke-width="2.4" opacity=".7"/>';
    for (var w = -118; w < 156; w += 8) s += '<rect x="' + w + '" y="-26" width="4" height="5" rx="1.5" fill="#3a4a5c"/><rect x="' + w + '" y="-8" width="4" height="5" rx="1.5" fill="#3a4a5c"/>';
    s += '<path d="M182 -16 L198 -14 L201 -6 L184 -7 Z" fill="#1f2a36" stroke="' + INK + '" stroke-width="1"/>';
    s += '<rect x="130" y="-28" width="8" height="18" rx="2" fill="none" stroke="#7a828c" stroke-width="1"/><rect x="-100" y="-28" width="8" height="18" rx="2" fill="none" stroke="#7a828c" stroke-width="1"/>';
    // near stabiliser (+ elevator)
    s += '<path d="M-150 -12 L-214 -22 L-220 -12 L-152 -2 Z" fill="url(#gWing)" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.elev) s += '<path d="M-208 -20 L-226 -24 L-230 -14 L-214 -12 Z" fill="' + o.elev + '" stroke="' + INK + '" stroke-width="1.4"/>';
    // main gear
    if (o.gear !== false && o.gear !== 0) { var gk = o.gear == null ? 1 : o.gear, gl = 26 * gk;
      [-24, -2].forEach(function (gx) { s += '<path d="M' + gx + ' 18 V' + f(18 + gl) + '" stroke="#3a3d42" stroke-width="4"/><circle cx="' + (gx - 7) + '" cy="' + f(22 + gl) + '" r="7" fill="#2a2a2a" stroke="' + INK + '"/><circle cx="' + (gx + 7) + '" cy="' + f(22 + gl) + '" r="7" fill="#2a2a2a" stroke="' + INK + '"/>'; });
      s += '<path d="M168 18 V' + f(18 + gl) + '" stroke="#3a3d42" stroke-width="3.4"/><circle cx="168" cy="' + f(22 + gl) + '" r="6" fill="#2a2a2a" stroke="' + INK + '"/>'; }
    // near wing, flaps on the trailing edge, wingtip fence
    var fl = o.flaps || 0;
    s += '<path d="M60 4 L-60 46 L-110 54 L-120 50 L-40 8 Z" fill="url(#gWing)" stroke="' + INK + '" stroke-width="2"/>';
    if (fl > 0) s += '<path d="M-40 8 L-120 50 L' + f(-124 - 6 * fl) + ' ' + f(54 + 10 * fl) + ' L' + f(-44 - 8 * fl) + ' ' + f(14 + 9 * fl) + ' Z" fill="' + (o.hlFlaps ? "#f2c230" : "#b9c1c9") + '" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-110 54 L-104 42 L-98 56 Z" fill="url(#gTail)" stroke="' + INK + '"/>';
    if (o.hlWing) s += '<path d="M60 4 L-60 46 L-110 54 L-120 50 L-40 8 Z" fill="#f2c230" opacity="' + f(0.25 + 0.3 * pulse(t, 6)) + '"/>';
    if (o.ail) s += '<path d="M-84 46 L-112 52 L-116 58 L-88 52 Z" fill="' + o.ail + '" stroke="' + INK + '" stroke-width="1.4"/>';
    // engines (front = right); fan blur visible in the intake
    [[-46, 44, 0.9], [4, 36, 1]].forEach(function (e) { var ex = e[0], ey = e[1], k = e[2];
      s += '<path d="M' + (ex + 6) + ' ' + (ey - 12) + ' L' + (ex + 20) + ' ' + (ey - 26) + '" stroke="#8a929c" stroke-width="7"/>';
      s += '<g transform="translate(' + ex + ' ' + ey + ') scale(' + k + ')"><path d="M-30 -11 H22 C34 -11 38 -6 38 0 C38 6 34 11 22 11 H-30 C-38 11 -42 6 -42 0 C-42 -6 -38 -11 -30 -11 Z" fill="url(#gNac)" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="36" cy="0" rx="4" ry="10" fill="#2b2f34" stroke="' + INK + '"/>' +
        '<path d="M36 ' + f(-8 * Math.cos(t * 30)) + ' V' + f(8 * Math.cos(t * 30)) + '" stroke="#9aa3ad" stroke-width="1.4"/><path d="M-42 -4 L-54 -2 L-54 2 L-42 4 Z" fill="#6f7882" stroke="' + INK + '"/></g>'; });
    if (o.hlEng) s += '<circle cx="4" cy="36" r="' + f(26 + 6 * pulse(t, 6)) + '" fill="none" stroke="#f2c230" stroke-width="3.5"/>';
    return s + '</g>';
  }
  // the A380 from above: o.bank (deg, shown as one wing shorter), o.ail / o.elev / o.rud = highlight colours
  function a380Top(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.ang || 0) + ') scale(' + sc + ')">';
    s += '<ellipse cx="0" cy="10" rx="210" ry="40" fill="' + INK + '" opacity=".08" filter="url(#soft)"/>';
    var bl = 1 - 0.18 * (o.bank || 0), br = 1 + 0.18 * (o.bank || 0);   // a simple bank: one wing looks shorter
    function wing(side, k) { var sg = side; return '<path d="M30 ' + 10 * sg + ' L' + f(-40) + ' ' + f(170 * k * sg) + ' L' + f(-78) + ' ' + f(176 * k * sg) + ' L' + f(-70) + ' ' + f(26 * sg) + ' Z" fill="url(#gWing)" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + f(-52) + ' ' + f(120 * k * sg) + ' L' + f(-44) + ' ' + f(166 * k * sg) + ' L' + f(-74) + ' ' + f(172 * k * sg) + ' L' + f(-80) + ' ' + f(124 * k * sg) + ' Z" fill="' + (o.ail || "#b9c1c9") + '" stroke="' + INK + '" stroke-width="1.4"/>' +
      [56, 104].map(function (d) { return '<rect x="' + f(-14 - d * 0.42) + '" y="' + f(d * k * sg - 7) + '" width="34" height="14" rx="6" fill="url(#gNac)" stroke="' + INK + '" stroke-width="1.4"/>'; }).join(""); }
    s += wing(-1, bl) + wing(1, br);
    s += '<path d="M-150 0 L-196 -66 L-212 -64 L-196 0 L-212 64 L-196 66 Z" fill="url(#gWing)" stroke="' + INK + '" stroke-width="1.8"/>';
    if (o.elev) s += '<path d="M-196 -60 L-212 -62 L-206 -4 L-196 -4 Z M-196 60 L-212 62 L-206 4 L-196 4 Z" fill="' + o.elev + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-214 -12 C-190 -20 -160 -20 -130 -20 L170 -20 C196 -20 214 -10 216 0 C214 10 196 20 170 20 L-130 20 C-160 20 -190 20 -214 12 Z" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<path d="M-130 0 L-206 0" stroke="' + (o.rud || "#143a72") + '" stroke-width="' + (o.rud ? 7 : 5) + '" stroke-linecap="round"/><path d="M190 -8 L204 -6 L204 6 L190 8 Z" fill="#1f2a36"/>';
    return s + '</g>';
  }
  // the four forces on a plane: which = {w, l, th, d} → 0..1 grow-in
  function forces(cx, cy, t, k) {
    var s = "", b = 1 + 0.06 * Math.sin(t * 5);
    if (k.l) s += arrow(cx - 20, cy - 30, cx - 20, cy - 30 - 100 * b, LIFT, 9, k.l);
    if (k.w) s += arrow(cx - 20, cy + 40, cx - 20, cy + 40 + 90 * b, WGT, 9, k.w);
    if (k.th) s += arrow(cx + 200, cy + 10, cx + 200 + 90 * b, cy + 10, THR, 9, k.th);
    if (k.d) s += arrow(cx - 210, cy, cx - 210 - 80 * b, cy, DRG, 9, k.d);
    return s;
  }

  // ── backgrounds ──
  function airport(t, y, o) {   // grass, runway seen from the side, the terminal far away
    o = o || {}; var s = sky(o.sky || "day") + clouds(t, 14, 30, 5, 0.85) + city(t, y - 6, 50, "#9aa7b4", true, 5, false);
    s += '<rect x="-400" y="' + (y - 8) + '" width="1440" height="10" fill="#7a9a5a"/><rect x="-400" y="' + y + '" width="1440" height="40" fill="url(#gRunway)"/>';
    var sp = o.speed || 0; for (var i = 0; i < 16; i++) { var x = (((i * 110 - t * sp) % 1760) + 1760) % 1760 - 500; s += '<rect x="' + f(x) + '" y="' + (y + 18) + '" width="50" height="4" fill="#f4f1e8" opacity=".85"/>'; }
    s += '<rect x="-400" y="' + (y + 40) + '" width="1440" height="300" fill="url(#grass-day)"/>';
    for (var j = 0; j < 12; j++) { var lx = (((j * 140 - t * sp * 1.3) % 1680) + 1680) % 1680 - 500; s += '<circle cx="' + f(lx) + '" cy="' + (y + 2) + '" r="3" fill="' + (hash(j) > 0.5 ? "#ffd98a" : "#9fe0a8") + '" opacity="' + f(0.5 + 0.5 * pulse(t + j, 6)) + '"/>'; }
    return s;
  }
  function windBg(t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#7fb7e0"/>' + clouds(t, 90, -20, 5, 0.45, 1.2) + clouds(t, 140, 300, 5, 0.35, 1.4); }
  function highSky(t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + clouds(t, 30, 260, 6, 0.95, 1.4) + clouds(t, 18, 40, 3, 0.6); }
  // speed lines in the sky, running backwards past a flying plane
  function streaks(t, n, sp) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * sp + hash(i)) % 1, x = 900 - u * 1300, y = -40 + hash(i + 7) * 420; s += '<path d="M' + f(x) + ' ' + f(y) + ' h60" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="' + f(0.6 * Math.sin(Math.PI * u)) + '"/>'; } return s; }

  // ── the turbofan cutaway (photo: Rolls-Royce Trent 900 on its stand, Trent 970 intake): air enters at the left.
  // Big fan, bypass duct around a thin core: compressor → combustor → turbine → nozzle. o.hl: "fan" | "core" | "bypass"
  function turbofan(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', sp = o.sp == null ? 1 : o.sp;
    // nacelle shells (cut open)
    s += '<path d="M-170 -96 C-176 -112 -150 -118 -120 -116 L120 -100 L130 -88 L-150 -96 Z" fill="url(#gNac)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M-170 96 C-176 112 -150 118 -120 116 L120 100 L130 88 L-150 96 Z" fill="url(#gNac)" stroke="' + INK + '" stroke-width="2.4"/>';
    // bypass flow (blue dashes around the core)
    var by = o.hl === "bypass" ? 1 : 0.55;
    for (var r = 0; r < 2; r++) for (var i = 0; i < 9; i++) { var u = (t * 0.9 * sp + i / 9) % 1, xx = lerp(-110, 190, u); [-1, 1].forEach(function (sg) { s += '<path d="M' + f(xx) + ' ' + f(sg * (58 + r * 18)) + ' h' + (o.hl === "bypass" ? 34 : 22) + '" stroke="' + DRG + '" stroke-width="' + (o.hl === "bypass" ? 5 : 3.5) + '" stroke-linecap="round" opacity="' + f(by * Math.sin(Math.PI * u)) + '"/>'; }); }
    // core body
    s += '<path d="M-100 -40 L60 -40 L120 -26 L190 -14 L190 14 L120 26 L60 40 L-100 40 Z" fill="#7a828c" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<path d="M-96 -32 L60 -32 L110 -20 L110 20 L60 32 L-96 32 Z" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.4"/>';
    // compressor stages (blades get shorter)
    for (var c = 0; c < 10; c++) { var cx = -88 + c * 9, h = 28 - c * 0.9, jt = Math.sin(t * 40 * sp + c) * 1.2; s += '<path d="M' + f(cx + jt) + ' ' + f(-h) + ' L' + f(cx - jt) + ' ' + f(h) + '" stroke="' + (o.hl === "core" ? "#c9a04e" : "#9aa2ac") + '" stroke-width="3"/>'; }
    // combustor flame
    var fl = 0.8 + 0.2 * Math.sin(t * 23) + 0.1 * Math.sin(t * 37);
    s += '<ellipse cx="22" cy="-16" rx="' + f(20 * fl) + '" ry="10" fill="url(#gFlame)"/><ellipse cx="22" cy="16" rx="' + f(20 * fl) + '" ry="10" fill="url(#gFlame)"/>';
    for (var tb = 0; tb < 4; tb++) { var tx = 58 + tb * 10, th2 = 24 - tb * 2; s += '<path d="M' + tx + ' ' + (-th2) + ' L' + (tx + Math.sin(t * 40 * sp + tb) * 2) + ' ' + th2 + '" stroke="#c9a04e" stroke-width="3"/>'; }
    s += '<path d="M-100 0 H120" stroke="#c9ced4" stroke-width="5"/><path d="M110 -12 L190 -6 L190 6 L110 12 Z" fill="#4b5056" stroke="' + INK + '" stroke-width="1.4"/>';
    // core flow: blue in, orange out
    for (var q = 0; q < 8; q++) { var v = (t * 1.1 * sp + q / 8) % 1, qx = lerp(-150, 250, v), hot = qx > 30; s += '<circle cx="' + f(qx) + '" cy="' + f((q % 2 ? -1 : 1) * (hot ? 6 + v * 4 : 20 - v * 10)) + '" r="' + (hot ? 5 : 3.5) + '" fill="' + (hot ? "#f7a531" : AIR) + '" opacity="' + f(o.hl === "core" ? 0.95 : 0.6) + '"/>'; }
    if (o.hl === "core" || o.jet) for (var e = 0; e < 6; e++) { var w = (t * 1.6 + e / 6) % 1; s += '<ellipse cx="' + f(200 + w * 120) + '" cy="0" rx="' + f(14 + w * 20) + '" ry="' + f(8 + w * 10) + '" fill="url(#gFlame)" opacity="' + f(0.8 * (1 - w)) + '"/>'; }
    // fan: blades seen from the side, a blur that sweeps
    s += '<path d="M-150 -92 V92" stroke="#3a3f46" stroke-width="2" opacity=".4"/>';
    for (var b = 0; b < 7; b++) { var ph = t * 18 * sp + b * 0.9, yb = Math.sin(ph) * 90, wb = 4 + 6 * Math.abs(Math.cos(ph)); s += '<path d="M' + f(-146 - wb) + ' ' + f(yb) + ' L' + f(-146 + wb) + ' ' + f(yb) + '" stroke="' + (o.hl === "fan" ? "#f2c230" : "#c9ced4") + '" stroke-width="5" stroke-linecap="round"/>'; }
    s += '<path d="M-176 0 C-176 -14 -160 -22 -146 -22 L-146 22 C-160 22 -176 14 -176 0 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><path d="M-170 -6 Q-160 0 -152 -12" stroke="#1c1c1c" stroke-width="1.6" fill="none"/>';
    // incoming air (blue streaks into the intake)
    var inn = o.suck == null ? 0.6 : o.suck;
    for (var a = 0; a < 12; a++) { var ua = (t * 1.2 * sp + a / 12) % 1, ax = lerp(-330, -160, ua), ay = (hash(a) - 0.5) * lerp(260, 170, ua); s += '<path d="M' + f(ax) + ' ' + f(ay) + ' h26" stroke="' + AIR + '" stroke-width="3.4" stroke-linecap="round" opacity="' + f(inn * Math.sin(Math.PI * ua)) + '"/>'; }
    return s + '</g>';
  }
  // the fan seen from the front (photo: the Trent 970 intake with its curved blades and the swirl on the spinner)
  function fanFront(x, y, r, t, sp) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r * 1.18) + '" fill="url(#gNac)" stroke="' + INK + '" stroke-width="3"/><circle r="' + r + '" fill="#1f2328" stroke="' + INK + '" stroke-width="2"/>';
    s += '<g transform="rotate(' + f(t * (sp || 400)) + ')">';
    for (var b = 0; b < 20; b++) s += '<path d="M0 0 Q' + f(r * 0.5) + ' ' + f(-r * 0.12) + ' ' + f(r * 0.96) + ' ' + f(r * 0.1) + ' L' + f(r * 0.96) + ' ' + f(r * 0.24) + ' Q' + f(r * 0.5) + ' ' + f(r * 0.06) + ' 0 0 Z" fill="#8a929c" stroke="#3a3f46" stroke-width="1" transform="rotate(' + (b * 18) + ')"/>';
    s += '<circle r="' + f(r * 0.24) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><path d="M0 0 Q' + f(r * 0.12) + ' ' + f(-r * 0.12) + ' ' + f(r * 0.16) + ' 0" stroke="' + INK + '" stroke-width="2" fill="none"/></g>';
    return s + '</g>';
  }

  // ── the wing cross-section and the air around it. o: {aoa (deg), flap 0..1, sp (flow speed), down (downwash 0..1),
  // up (top flow faster 0..1), press (show + / −), hl ("top"|"curve"|"aoa")}
  function foilPath() { return "M-150 0 C-150 -30 -92 -44 -20 -42 C58 -38 118 -16 150 0 C112 6 42 12 -30 14 C-100 14 -150 10 -150 0 Z"; }
  function wingSec(x, y, sc, t, o) {
    o = o || {}; var a = o.aoa == null ? 6 : o.aoa, s = ""; y += Math.sin(t * 1.8) * 5; a += Math.sin(t * 1.3) * 0.8;
    // streamlines with dashes running along them
    var n = 7;
    for (var i = 0; i < n; i++) {
      var y0 = (i - 3) * 34, top = y0 < 0, d = "";
      for (var xx = -330; xx <= 340; xx += 12) {
        var bump = Math.exp(-Math.pow(xx / 130, 2)), k = Math.exp(-Math.abs(y0) / 90);
        var yy = y0 + (top || y0 === 0 ? -40 * bump * (y0 === 0 ? 0.6 : k) : 18 * bump * k);
        if (xx > -40) yy += (o.down == null ? 0.6 : o.down) * 70 * Math.pow(clamp((xx + 40) / 380), 1.3) * (0.4 + 0.6 * k);
        d += (xx === -330 ? "M" : " L") + f(xx) + " " + f(yy);
      }
      var fast = top ? 1 + (o.up || 0) * 0.9 : 1, sp = (o.sp || 60) * fast;
      s += '<path d="' + d + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/>';
      s += '<path d="' + d + '" stroke="' + (top && o.up ? "#fff7b0" : "#fff") + '" stroke-width="' + (top && o.up ? 5 : 4) + '" fill="none" stroke-dasharray="18 30" stroke-dashoffset="' + f(-t * sp) + '" stroke-linecap="round" opacity=".9"/>';
    }
    // the wing itself, tilted by the angle of attack
    var fl = o.flap || 0, foil = '<path d="M-150 0 C-150 -30 -92 -44 -20 -42 C40 -39 80 -27 96 -20 L96 9 C42 12 -30 14 -30 14 C-100 14 -150 10 -150 0 Z" fill="url(#gFoil)" stroke="' + INK + '" stroke-width="3"/>';
    foil += '<g transform="translate(' + f(fl * 18) + ' ' + f(fl * 6) + ') rotate(' + f(fl * 30) + ' 96 -6)"><path d="M98 -19 C116 -12 136 -6 150 0 C126 4 110 7 98 9 C92 3 92 -12 98 -19 Z" fill="' + (fl > 0 ? "#f2c230" : "url(#gFoil)") + '" stroke="' + INK + '" stroke-width="2.6"/></g>';
    foil += '<path d="M-120 -24 C-80 -38 -10 -40 60 -28" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>';
    if (o.hl === "curve") foil += '<path d="M-150 -4 C-150 -32 -92 -46 -20 -44 C58 -40 118 -18 150 -2" stroke="#f2c230" stroke-width="6" fill="none" opacity="' + f(0.5 + 0.5 * pulse(t, 6)) + '"/>';
    s += g('translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ') rotate(' + f(-a) + ')', foil);
    if (o.hl === "aoa") s += g('translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')', '<path d="M-190 0 H220" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/><path d="M-190 ' + f(Math.tan(a * Math.PI / 180) * 190) + ' L220 ' + f(-Math.tan(a * Math.PI / 180) * 220) + '" stroke="#f2c230" stroke-width="3"/>' + curl(140, 0, 90, 0, -a * Math.PI / 180 * 2.2, "#f2c230", 3, 1));
    if (o.press) { var pk = 0.75 + 0.25 * pulse(t, 5); for (var m = 0; m < 5; m++) { s += txt(x + (-120 + m * 60) * sc, y - 92 * sc + Math.sin(t * 3 + m) * 3, "−", 44 * pk, "#7fd0ff"); s += txt(x + (-110 + m * 55) * sc, y + 74 * sc + Math.sin(t * 3 + m) * 3, "+", 36 * pk, "#ff9a7e"); } }
    return s;
  }

  // ── more pieces ──
  function speedo(x, y, r, v, max, label) {   // a round speed gauge, v in km/h
    var a = -2.4 + 4.8 * clamp(v / max), s = '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#e9e4d8" stroke-width="3"/><circle r="' + (r - 5) + '" fill="#2b2f34"/>';
    for (var k = 0; k <= 6; k++) { var ka = -2.4 + 4.8 * k / 6; s += '<path d="M' + f(Math.sin(ka) * (r - 6)) + ' ' + f(-Math.cos(ka) * (r - 6)) + ' L' + f(Math.sin(ka) * (r - 14)) + ' ' + f(-Math.cos(ka) * (r - 14)) + '" stroke="#e9e4d8" stroke-width="2"/>'; }
    s += '<path d="M0 0 L' + f(Math.sin(a) * (r - 10)) + ' ' + f(-Math.cos(a) * (r - 10)) + '" stroke="#f2c230" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#f2c230"/>';
    s += '<text y="' + f(r * 0.55) + '" text-anchor="middle" style="font:900 ' + f(r * 0.36) + 'px Noto Sans;fill:#fff">' + Math.round(v) + '</text><text y="' + f(r * 0.85) + '" text-anchor="middle" style="font:700 ' + f(r * 0.2) + 'px Noto Sans;fill:#e9e4d8">' + (label || "km/h") + '</text>';
    return s + '</g>';
  }
  function tinyCar(x, y, col) { return '<rect x="' + f(x - 7) + '" y="' + f(y - 4) + '" width="14" height="6" rx="2" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/><rect x="' + f(x - 4) + '" y="' + f(y - 7) + '" width="7" height="3.4" rx="1" fill="' + col + '" stroke="' + INK + '" stroke-width=".8"/>'; }
  var CARC = ["#2f6f9f", "#e2b035", "#c23a26", "#f4f1e8", "#4f8f5a", "#8a5ab0"];
  function weight(x, y, w, label) { return '<path d="M' + f(x - w / 2) + ' ' + y + ' L' + f(x - w * 0.36) + ' ' + f(y - w * 0.7) + ' H' + f(x + w * 0.36) + ' L' + f(x + w / 2) + ' ' + y + ' Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x - w * 0.14) + ' ' + f(y - w * 0.7) + ' Q' + f(x) + ' ' + f(y - w * 0.98) + ' ' + f(x + w * 0.14) + ' ' + f(y - w * 0.7) + '" stroke="#3a3f46" stroke-width="' + f(w * 0.08) + '" fill="none"/>' + (label ? txt(x, y - w * 0.22, label, w * 0.26, "#fff") : ""); }
  function book(x, y, t, o) {   // an open school book
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2) * 2) + ') rotate(' + f(Math.sin(t * 1.3) * 2) + ')"><path d="M0 0 C-30 -10 -70 -10 -96 -2 V66 C-70 58 -30 58 0 68 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 0 C30 -10 70 -10 96 -2 V66 C70 58 30 58 0 68 Z" fill="#fbfaf5" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var l = 0; l < 5; l++) s += '<path d="M-84 ' + (10 + l * 10) + ' H-14 M14 ' + (10 + l * 10) + ' H84" stroke="#9a958c" stroke-width="2"/>';
    s += '<path d="M-80 12 C-60 2 -30 2 -20 14 C-40 20 -66 22 -80 12 Z" fill="#9aa3ad" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o && o.cross) s += '<path d="M-90 -14 L90 74 M90 -14 L-90 74" stroke="#e2523a" stroke-width="' + f(8 * o.cross) + '" stroke-linecap="round" opacity="' + f(o.cross) + '"/>';
    return s + '</g>';
  }
  // the wing seen from the front in the load test: it bends up by `b` (0..1 → about 7.6 m at the tip)
  function wingFront(x, y, t, b) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">', span = 290, d = "M0 -6", d2 = "M0 6";
    for (var i = 0; i <= 20; i++) { var u = i / 20, yy = -b * 110 * u * u - u * 10; d += " L" + f(span * u) + " " + f(yy - 6 * (1 - u)); d2 = " L" + f(span * u) + " " + f(yy + 6 * (1 - u) + 2) + d2.replace("M", " L"); }
    var right = "M0 -8"; var back = ""; for (var j = 0; j <= 20; j++) { var v = j / 20, yv = -b * 110 * v * v - v * 10; right += " L" + f(span * v) + " " + f(yv - 8 * (1 - v) - 1); back = " L" + f(span * v) + " " + f(yv + 8 * (1 - v) + 1) + back; }
    var shape = right + back + " Z";
    s += '<path d="' + shape + '" fill="url(#gWing)" stroke="' + INK + '" stroke-width="2.4"/><g transform="scale(-1 1)"><path d="' + shape + '" fill="url(#gWing)" stroke="' + INK + '" stroke-width="2.4"/></g>';
    s += '<ellipse cx="0" cy="-10" rx="44" ry="50" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="0" cy="-10" rx="30" ry="36" fill="none" stroke="#9aa3ad" stroke-width="1.4"/>';
    [-1, 1].forEach(function (sg) { [100, 170].forEach(function (px) { var u = px / span, yy = -b * 110 * u * u - u * 10; s += '<path d="M' + f(sg * px) + ' ' + f(yy + 8) + ' V120" stroke="#5a6068" stroke-width="5"/><rect x="' + f(sg * px - 9) + '" y="' + f(70 + Math.sin(t * 6) * 1) + '" width="18" height="30" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/>'; }); });
    // ruler at the tip
    var tipY = -b * 110 - 10;
    s += '<path d="M' + (span + 30) + ' -10 V' + f(tipY) + '" stroke="#f2c230" stroke-width="4"/><path d="M' + (span + 22) + ' -10 H' + (span + 38) + ' M' + (span + 22) + ' ' + f(tipY) + ' H' + (span + 38) + '" stroke="#f2c230" stroke-width="4"/>';
    return s + '</g>' + '<rect x="-400" y="' + f(y + 120) + '" width="1440" height="300" fill="#8a8f96"/>';
  }
  function hangar(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9ced4"/>'; for (var i = -6; i < 18; i++) s += '<path d="M' + (i * 70) + ' -300 V420" stroke="#9aa3ad" stroke-width="3"/>'; for (var l = 0; l < 5; l++) s += '<rect x="' + (-120 + l * 200) + '" y="-60" width="70" height="10" fill="#fffbe0" opacity="' + f(0.7 + 0.3 * pulse(t + l, 4)) + '"/>'; return s; }
  // air molecules in a box: n dots jiggling
  function airBox(x, y, w, h, n, t, col) { var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx="10" fill="#0b1730" opacity=".35" stroke="#fff" stroke-width="2"/>'; for (var i = 0; i < n; i++) s += '<circle cx="' + f(x + 8 + hash(i) * (w - 16) + Math.sin(t * 5 + i) * 4) + '" cy="' + f(y + 8 + hash(i + 3) * (h - 16) + Math.cos(t * 4 + i * 1.3) * 4) + '" r="4" fill="' + (col || AIR) + '"/>'; return s; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — an A380 takes off: up to 575 tonnes
  shot(0, function (u, d) { return [lerp(300, 360, clamp(u / d)), lerp(190, 160, clamp(u / d)), lerp(1.25, 1.0, ease(u / d))]; }, function (u, d, t) {
    var k = clamp((u - 0.6) / (d - 0.6)), px = lerp(180, 420, k), py = 262 - 70 * k * k, pitch = 9 * clamp(k * 3);
    var s = airport(t, 290, { speed: 260 }) + a380(px, py, t, { s: 0.75, pitch: pitch, thrust: 1, gear: 1 - clamp(k * 2 - 1), flaps: 0.5 });
    return s + tag("Airbus A380", 160, 70, u, 0.4, -3, 22) + tag("575 Tonnen", 430, 290, u, 2.0, 3, 24, "#f2a0a0");
  });
  // 1 — as much as about 400 cars
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + clouds(t, 12, 10, 4, 0.7) + '<rect x="-400" y="300" width="1440" height="200" fill="url(#grass-day)"/>';
    // a balance: the plane on the left, the cars piling up on the right
    var n = Math.floor(400 * clamp((u - 0.3) / (d * 0.7))), tilt = 6 - 6 * clamp(n / 400) + Math.sin(t * 3) * 0.6;
    s += '<path d="M320 300 L300 200 L340 200 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    var beamG = '<rect x="-260" y="-6" width="520" height="12" rx="4" fill="#8a5a2a" stroke="' + INK + '" stroke-width="2"/>' + a380(-150, -40, t, { s: 0.42, gear: 1 });
    for (var i = 0; i < n; i++) beamG += tinyCar(70 + (i % 20) * 9.2, -10 - Math.floor(i / 20) * 7.4, CARC[i % 6]);
    s += g('translate(320 200) rotate(' + f(-tilt) + ')', beamG);
    return s + txt(150, 90, n + " Autos", 30, "#f2c230") + tag("≈ 400 Autos", 170, 300, u, d - 1.2, -3, 22);
  });
  // 2 — and this colossus just stays in the air?
  shot(2, function (u, d) { return [320, 170, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = highSky(t) + streaks(t, 10, 0.8) + a380(330, 150 + Math.sin(t * 1.6) * 8, t, { s: 0.8, gear: 0, thrust: 0.6 });
    return s + engineer(90, 250, t, u > 1 ? "shock" : "curious", { s: 0.6 }) + qmark(150, 160, t, 46) + qmark(560, 90, t, 40) + tag("Wie?!", 520, 300, u, 0.8, 3, 26);
  });
  // 3 — brand line
  shot(3, function (u, d) { return [320, 180, lerp(1.05, 0.95, u / d)]; }, function (u, d, t) {
    var s = highSky(t) + streaks(t, 12, 1) + a380(lerp(250, 380, u / d), 130 + Math.sin(t * 1.6) * 6, t, { s: 0.6, gear: 0, thrust: 0.6 });
    return s + tag("Was steckt dahinter?", 320, 290, u, 0.2, -2, 28) + engineer(560, 250, t, "happy", { s: 0.5, point: true });
  });
  // 4 — four forces on every plane
  shot(4, function (u, d) { var k = ease(u / d); return [lerp(350, 300, k), 180, lerp(0.9, 1.04, k)]; }, function (u, d, t) {
    var s = highSky(t) + clouds(t, 120, 300, 4, 0.5, 1.3) + streaks(t, 18, 1.2) + a380(320, 180 + Math.sin(t * 1.9) * 7, t, { s: 0.75, gear: 0 });
    s += forces(320, 180, t, { l: clamp((u - 0.3) / 0.5), w: clamp((u - 0.7) / 0.5), th: clamp((u - 1.1) / 0.5), d: clamp((u - 1.5) / 0.5) });
    return s + tag("4 Kräfte", 320, 330, u, 1.9, -2, 26);
  });
  // 5 — weight down, lift up
  shot(5, function (u, d) { return [300, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = highSky(t) + streaks(t, 8, 0.6) + a380(320, 180 + Math.sin(t * 1.4) * 4, t, { s: 0.75, gear: 0 });
    s += forces(320, 180, t, { w: clamp(u / 0.5), l: clamp((u - 1.4) / 0.5) });
    return s + tag("Gewicht", 190, 300, u, 0.3, -3, 22, "#f2a0a0") + tag("Auftrieb", 190, 60, u, 1.5, 3, 22, "#bde8b0");
  });
  // 6 — thrust forward, drag back
  shot(6, function (u, d) { var k = ease(u / d); return [lerp(290, 350, k), 180, lerp(1.06, 0.94, k)]; }, function (u, d, t) {
    var s = highSky(t) + clouds(t, 120, 300, 4, 0.5, 1.3) + streaks(t, 22, 1.4) + a380(320, 180 + Math.sin(t * 1.9) * 7, t, { s: 0.75, gear: 0, thrust: 1 });
    s += forces(320, 180, t, { th: clamp(u / 0.5), d: clamp((u - 1.3) / 0.5) });
    return s + tag("Schub", 560, 120, u, 0.3, 3, 22) + tag("Widerstand", 90, 120, u, 1.4, -3, 20, "#bfe0ff");
  });
  // 7 — thrust comes from the engines: push in on the inner engine
  shot(7, function (u, d) { var k = ease(u / d); return [lerp(320, 325, k), lerp(180, 214, k), lerp(0.9, 2.4, k)]; }, function (u, d, t) {
    var s = highSky(t) + streaks(t, 10, 0.8) + a380(320, 180 + Math.sin(t * 1.4) * 2, t, { s: 0.8, gear: 0, thrust: 1, hlEng: u > 0.6 });
    return s + tag("Triebwerke", 360, 240, u, 0.9, -3, 12);
  });
  // 8 — the fan sucks in over a tonne of air per second
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + turbofan(360, 180, t, { s: 0.9, suck: 1, hl: "fan" }) + fanFront(90, 120, 54, t, 500);
    return s + tag("Fan", 90, 220, u, 0.5, -3, 22) + tag("> 1 Tonne Luft pro Sekunde", 360, 310, u, 1.4, 2, 20);
  });
  // 9 — part of it is compressed, burnt with kerosene and blasted out the back
  shot(9, function (u, d) { var k = ease(u / d); return [lerp(300, 400, k), 180, 1.25]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + turbofan(320, 180, t, { hl: "core", jet: true });
    return s + tag("verdichten", 250, 300, u, 0.3, -3, 16) + tag("verbrennen", 350, 60, u, 1.2, 3, 16, "#f7c98a") + tag("raus!", 520, 280, u, 2.1, -3, 18);
  });
  // 10 — most of the thrust comes from the fan itself, like a giant propeller
  shot(10, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + turbofan(300, 180, t, { s: 0.9, hl: "bypass" });
    s += arrow(470, 40, lerp(470, 600, pulse(t, 3)), 40, THR, 10, 1) + arrow(470, 320, lerp(470, 600, pulse(t, 3)), 320, THR, 10, 1);
    return s + tag("Großteil: der Fan", 220, 30, u, 0.6, -2, 20) + tag("Riesenpropeller", 330, 338, u, 2.0, 2, 18, "#bfe0ff");
  });
  // 11 — down the runway at almost 300 km/h
  shot(11, function (u, d) { return [320, 200, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var v = 280 * clamp(u / (d * 0.9)), s = airport(t, 290, { speed: 200 + v * 3 }) + a380(330, 262 + Math.sin(t * 25) * 0.8, t, { s: 0.75, thrust: 1, flaps: 0.5 });
    return s + speedo(90, 90, 52, v, 350) + tag("fast 300 km/h", 470, 335, u, 1.6, 3, 22);
  });
  // 12 — now the wing comes in
  shot(12, function (u, d) { var k = ease(u / d); return [lerp(330, 300, k), lerp(240, 270, k), lerp(1.0, 1.7, k)]; }, function (u, d, t) {
    var s = airport(t, 290, { speed: 800 }) + a380(330, 262 + Math.sin(t * 25) * 0.8, t, { s: 0.75, thrust: 1, flaps: 0.5, hlWing: true });
    return s + tag("Der Flügel", 260, 330, u, 0.5, -3, 15);
  });
  // 13 — from the side: curved on top, tilted up a little at the front
  shot(13, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = windBg(t) + clouds(t, 20, 30, 4, 0.5) + wingSec(320, 190, 1.1, t, { aoa: lerp(0, 7, clamp((u - 1.2) / 1)), down: 0.3, sp: 80, hl: u < 1.4 ? "curve" : "aoa" });
    return s + tag("oben gewölbt", 170, 60, u, 0.3, -3, 20) + tag("leicht angestellt", 470, 320, u, 1.5, 3, 20);
  });
  // 14 — so it turns the air downwards
  shot(14, function (u, d) { var k = ease(u / d); return [lerp(300, 360, k), 190, lerp(1.12, 0.92, k)]; }, function (u, d, t) {
    var s = windBg(t) + wingSec(280, 170, 0.95, t, { aoa: 7, down: clamp(u / 1.2), sp: 110 });
    return s + arrow(540, 210, 560, lerp(210, 320, clamp((u - 0.8) / 0.6)), DRG, 9, 1) + tag("Luft nach unten", 470, 50, u, 1.0, 3, 20, "#bfe0ff");
  });
  // 15 — push the air down and the air pushes the wing up
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var lift = clamp((u - 1.2) / 0.6), s = windBg(t) + wingSec(300, 190 - lift * 14 + Math.sin(t * 2) * 3, 0.95, t, { aoa: 7, down: 1, sp: 70 });
    s += arrow(470, 230, 480, lerp(230, 340, clamp(u / 0.6)), DRG, 10, 1) + arrow(290, 120, 290, lerp(120, 10, lift), LIFT, 12, lift ? 1 : 0);
    return s + tag("Luft runter", 520, 120, u, 0.4, 3, 20, "#bfe0ff") + tag("Flügel hoch!", 150, 40, u, 1.5, -3, 22, "#bde8b0");
  });
  // 16 — on top the air flows faster, the pressure drops
  shot(16, function (u, d) { return [320, 160, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = windBg(t) + wingSec(320, 190, 1.0, t, { aoa: 6, down: 0.8, sp: 60, up: clamp(u / 0.8), press: u > 1.6 });
    return s + tag("schneller", 180, 50, u, 0.4, -3, 20) + tag("Druck sinkt", 470, 50, u, 1.6, 3, 20, "#bfe0ff");
  });
  // 17 — high pressure below, low pressure above, the wing is sucked upward
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.05, u / d)]; }, function (u, d, t) {
    var up = clamp((u - 1.4) / 1), s = windBg(t) + wingSec(320, 200 - up * 20 + Math.sin(t * 2) * 3, 0.9, t, { aoa: 6, down: 0.8, sp: 60, up: 1, press: true });
    s += arrow(320, 150 - up * 20, 320, 150 - up * 20 - 90 * up, LIFT, 12, up);
    return s + tag("hoher Druck", 470, 300, u, 0.3, 3, 18, "#f2a0a0") + tag("niedriger Druck", 160, 40, u, 0.9, -3, 18, "#bfe0ff");
  });
  // 18 — the air on top even arrives earlier, not at the same time as many school books say
  shot(18, function (u, d) { return [320, 180, 1.0 + 0.04 * u / d]; }, function (u, d, t) {
    var s = windBg(t) + wingSec(320, 170, 0.85, t, { aoa: 5, down: 0.6, sp: 40, up: 1 });
    // two parcels start together at the nose; the top one reaches the trailing edge first
    var k = ((u * 0.45) % 1.3), kt = clamp(k * 1.5), kb = clamp(k);
    var tx = lerp(170, 460, kt), ty = 132 - 26 * Math.sin(Math.PI * kt), bx = lerp(170, 460, kb), by2 = 190 + 10 * Math.sin(Math.PI * kb);
    s += '<circle cx="' + f(tx) + '" cy="' + f(ty) + '" r="10" fill="#7fd0ff" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(bx) + '" cy="' + f(by2) + '" r="10" fill="#ff9a7e" stroke="' + INK + '" stroke-width="2.4"/>';
    s += book(110, 270, t, { cross: clamp((u - 1.8) / 0.4) }) + txt(110, 255, "gleichzeitig?", 15, "#1c1c1c", "middle", 800).replace(/stroke:[^;]+;stroke-width:[^;]+;/, "");
    return s + tag("oben früher!", 480, 50, u, 2.4, 3, 22, "#bfe0ff");
  });
  // 19 — every square metre of A380 wing carries about 680 kg
  shot(19, function (u, d) { return [300, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = highSky(t) + a380Top(260, 180 + Math.sin(t * 1.2) * 3, t, { s: 0.85 });
    var sq = clamp((u - 0.4) / 0.4), bx = 222, byy = 250;
    s += '<rect x="' + bx + '" y="' + byy + '" width="' + f(30 * sq) + '" height="' + f(30 * sq) + '" fill="#f2c230" opacity=".8" stroke="' + INK + '" stroke-width="2"/>';
    var nW = Math.floor(clamp((u - 0.9) / 1.4) * 4);
    for (var i = 0; i < nW; i++) s += weight(530, 330 - i * 34, 50, i === nW - 1 ? "kg" : "");
    s += '<path d="M252 262 C340 270 420 300 495 300" stroke="#f2c230" stroke-width="3" fill="none" stroke-dasharray="6 6" stroke-dashoffset="' + f(-t * 30) + '"/>';
    return s + tag("1 m²", 238, 215, u, 0.6, -3, 16) + tag("≈ 680 kg", 520, 70, u, 1.8, 3, 24);
  });
  // 20 — hold your hand tilted out of the car window: you feel exactly this force
  shot(20, function (u, d) { return [320, 200, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 20, 5, 0.8) + city(t, 250, 70, "#b9a98a", true, 3, false) + '<rect x="-400" y="250" width="1440" height="200" fill="url(#road)"/>';
    for (var i = 0; i < 10; i++) { var x = (((i * 160 - t * 420) % 1600) + 1600) % 1600 - 500; s += '<rect x="' + f(x) + '" y="292" width="70" height="6" fill="#f4f1e8"/>'; }
    var tilt = clamp((u - 0.5) / 0.8) * (14 + 6 * Math.sin(t * 2.4));
    s += airflow(t, -100, 700, 160, 9, "#fff", 1.4, 3) + carSide(300, 290, t, 1.2, "#2f6f9f", tilt);
    s += arrow(370, 150 - tilt * 1.1, 370, 150 - tilt * 1.1 - 60 * clamp((u - 0.9) / 0.5), LIFT, 7, 1);
    return s + tag("gleiches Prinzip!", 160, 60, u, 1.6, -3, 20);
  });
  // 21 — at take-off the flaps slide out: bigger and more curved
  shot(21, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var fl = clamp((u - 0.5) / 1.4), s = windBg(t) + clouds(t, 20, 20, 4, 0.5) + wingSec(300, 180, 1.05, t, { aoa: 5, flap: fl, down: 0.5 + 0.5 * fl, sp: 50 });
    return s + tag("Klappen", 500, 290, u, 0.8, 3, 24) + tag("mehr Auftrieb", 160, 50, u, 2.0, -3, 20, "#bde8b0");
  });
  // 22 — the pilot pulls the sidestick, the nose comes up, the giant lifts off
  shot(22, function (u, d) { return u < d * 0.42 ? [320, 150, lerp(1.0, 1.1, u / d)] : [lerp(300, 380, clamp(u / d)), lerp(210, 170, clamp(u / d)), 1.0]; }, function (u, d, t) {
    if (u < d * 0.42) { var v = -clamp(u / 0.8); return cockpit(t) + pilotBig(440, 190, t, "curious", { kind: "cyclic", v: v }, -0.3) + tag("Sidestick", 200, 250, u, 0.4, -3, 20); }
    var k = clamp((u - d * 0.42) / (d * 0.58)), px = lerp(200, 440, k), pitch = 12 * clamp(k * 2.5), py = 262 - 90 * Math.pow(clamp(k * 1.4 - 0.25), 1.6);
    return airport(t, 290, { speed: 900 }) + a380(px, py, t, { s: 0.75, pitch: pitch, thrust: 1, flaps: 0.6, gear: 1 }) + tag("Abheben!", 470, 60, u, d * 0.42 + 0.6, 3, 24);
  });
  // 23 — ailerons on the wings, elevator and rudder at the tail
  shot(23, function (u, d) { return [300, 180, lerp(1.05, 1.0, u / d)]; }, function (u, d, t) {
    var ph = u / d, bank = Math.sin(t * 1.6) * clamp(u / 0.6);
    var s = highSky(t) + a380Top(320, 180, t, { s: 0.85, ang: bank * 6, bank: bank, ail: ph < 0.45 ? "#f2c230" : null, elev: ph >= 0.45 ? "#f2a0a0" : null, rud: ph >= 0.7 ? "#5bbf6a" : null });
    return s + tag("Querruder", 470, 40, u, 0.3, 3, 20) + tag("Höhenruder", 140, 70, u, d * 0.45, -3, 18, "#f2a0a0") + tag("Seitenruder", 150, 310, u, d * 0.7, 3, 18, "#bde8b0");
  });
  // 24 — at 11 km the air is so thin it brakes much less
  shot(24, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gHigh)"/>' + stars(t) + clouds(t, 20, 330, 6, 0.9, 1.4) + streaks(t, 8, 1.2) + a380(380, 100 + Math.sin(t * 1.4) * 4, t, { s: 0.5, gear: 0, thrust: 0.4 });
    s += airBox(60, 170, 110, 110, 40, t) + txt(115, 300, "Boden", 18) + airBox(470, 170, 110, 110, 12, t) + txt(525, 300, "11 km", 18, "#f2c230");
    return s + tag("weniger als 1/3 Luft", 320, 250, u, 1.6, -2, 20, "#bfe0ff") + tag("11 km", 160, 60, u, 0.5, -3, 24);
  });
  // 25 — in the load test a Boeing 787 wing bent up by more than seven metres
  shot(25, function (u, d) { return [320, 170, lerp(0.95, 1.0, u / d)]; }, function (u, d, t) {
    var b = clamp((u - 0.5) / (d - 1.2)) * (1 + 0.02 * Math.sin(t * 6)), s = hangar(t) + wingFront(320, 210, t, b);
    return s + tag("Boeing 787", 140, 40, u, 0.3, -3, 20) + tag("> 7 m!", 560, lerp(170, 60, b), u, 1.8, 3, 24) + engineer(110, 250, t, b > 0.6 ? "shock" : "curious", { s: 0.45 });
  });
  // 26 — payoff: 575 tonnes stay up because the wings keep pushing air down
  shot(26, function (u, d) { var k = ease(u / d); return [lerp(290, 350, k), 190, lerp(1.08, 0.9, k)]; }, function (u, d, t) {
    var s = highSky(t) + clouds(t, 120, 300, 4, 0.5, 1.3) + streaks(t, 20, 1.4) + downwash(t, 300, 200, 360, 16, "#fff", 1.3) + a380(320, 150 + Math.sin(t * 1.4) * 4, t, { s: 0.85, gear: 0, thrust: 1 });
    return s + tag("575 Tonnen", 160, 50, u, 0.6, -3, 22, "#f2a0a0") + tag("Luft nach unten", 480, 330, u, 1.8, 3, 20, "#bfe0ff");
  });
  // 27 — outro
  shot(27, function (u, d) { return [lerp(300, 360, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + sun(470, 250, 40 + 4 * pulse(t, 3), "#f7c98a") + clouds(t, 60, 40, 6, 0.85) + streaks(t, 14, 1.2) + birds(t, 230, 70) + a380(lerp(120, 560, clamp(u / (d + 1.5))), 130 - u * 6 + Math.sin(t * 2) * 6, t, { s: 0.6, gear: 0, pitch: 3, thrust: 1 });
    return s + engineer(130, 270, t, "happy", { s: 0.55, wave: true }) + tag("Sagt uns!", 470, 80, u, 0.4, 3, 26);
  });

  window.__parts = { a380: a380, a380Top: a380Top, turbofan: turbofan, fanFront: fanFront, wingSec: wingSec, airport: airport, highSky: highSky, streaks: streaks, tag: tag, engineer: engineer, forces: forces };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
