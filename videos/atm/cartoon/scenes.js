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

  // ── new pieces for this episode (an NCR / Diebold-style lobby ATM: fascia on top, steel safe below) ──
  var INK = "#1c1c1c", CLIPN = 0, GREEN = "#2fae5a", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function lock(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-7 -2 V-8 a7 7 0 0 1 14 0 V-2" stroke="' + INK + '" stroke-width="3" fill="none"/><rect x="-10" y="-3" width="20" height="16" rx="3" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/></g>'; }
  // a banknote: green, a border, a portrait circle, a big number
  function note(x, y, s, rot, val) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + (s || 1) + ')"><rect x="-34" y="-16" width="68" height="32" rx="2" fill="url(#gNote)" stroke="#2e6a3a" stroke-width="1.4"/><rect x="-30" y="-12" width="60" height="24" fill="none" stroke="#2e6a3a" stroke-width=".8"/><circle cx="12" cy="0" r="8" fill="#9fcf94" stroke="#2e6a3a" stroke-width=".8"/><text x="-14" y="5" text-anchor="middle" style="font:800 12px Noto Serif;fill:#1f4a2a">' + (val || 200) + '</text></g>'; }
  function card(x, y, s, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + (s || 1) + ')"><rect x="-43" y="-27" width="86" height="54" rx="6" fill="url(#gCard)" stroke="' + INK + '" stroke-width="2"/><rect x="-32" y="-10" width="16" height="12" rx="2" fill="url(#gChip)" stroke="#8a6a30" stroke-width="1"/><path d="M-32 -4 h16 M-24 -10 v12" stroke="#8a6a30" stroke-width=".8"/><text x="-32" y="18" style="font:700 8px Noto Serif;fill:#cfe6f2;direction:ltr">•••• 4821</text><circle cx="30" cy="-14" r="6" fill="#d8352a" opacity=".9"/><circle cx="36" cy="-14" r="6" fill="#f2a93b" opacity=".9"/></g>'; }
  // the ATM seen from the front, set into a bank wall. o: { s, shutter 0..1, cash 0..1, screen (fn w,h), cardIn 0..1, keyAt (index pressed), glow }
  function atmFront(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-110" y="-170" width="220" height="330" rx="10" fill="url(#gBody)" stroke="' + INK + '" stroke-width="3"/><rect x="-110" y="-170" width="220" height="34" rx="10" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="3"/><text x="0" y="-146" text-anchor="middle" style="font:800 18px Noto Serif;fill:#fff;direction:ltr">ATM</text>';
    s += '<circle cx="80" cy="-153" r="5" fill="#111" stroke="#5a6068" stroke-width="2"/><circle cx="80" cy="-153" r="2" fill="' + RED + '" opacity="' + f(0.5 + 0.5 * Math.sin(t * 5)) + '"/>';
    // screen with side keys
    var id = "sc" + (++CLIPN); s += '<rect x="-80" y="-126" width="160" height="104" rx="4" fill="#111" stroke="' + INK + '" stroke-width="2"/><clipPath id="' + id + '"><rect x="-74" y="-120" width="148" height="92"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(-74 -120)">' + (o.screen ? o.screen(148, 92) : screenMenu(148, 92, t)) + '</g></g>';
    for (var k = 0; k < 4; k++) s += '<rect x="-98" y="' + (-118 + k * 23) + '" width="14" height="10" rx="2" fill="url(#gKey)" stroke="' + INK + '"/><rect x="84" y="' + (-118 + k * 23) + '" width="14" height="10" rx="2" fill="url(#gKey)" stroke="' + INK + '"/>';
    // card slot with blinking green throat, receipt slot
    s += '<rect x="44" y="-12" width="54" height="22" rx="6" fill="url(#gBezel)" stroke="' + INK + '" stroke-width="2"/><rect x="50" y="-3" width="42" height="5" rx="2" fill="#111"/><rect x="50" y="-3" width="42" height="5" rx="2" fill="' + GREEN + '" opacity="' + f(0.35 + 0.65 * Math.abs(Math.sin(t * 4))) + '"/>';
    if (o.cardIn != null) { var ci = clamp(o.cardIn); s += '<g clip-path="none">' + card(71, lerp(-40, 2, ci), 0.5, 90 * 0) + '</g>'; }
    s += '<rect x="-98" y="-8" width="40" height="12" rx="3" fill="url(#gBezel)" stroke="' + INK + '"/><rect x="-92" y="-4" width="28" height="3" fill="#111"/>';
    // keypad (EPP) with privacy hood: digits, cancel red, clear yellow, enter green
    s += '<path d="M-60 22 H60 L70 34 H-70 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><rect x="-60" y="34" width="120" height="70" rx="4" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>';
    var labels = ["1", "2", "3", "", "4", "5", "6", "", "7", "8", "9", "", "", "0", "", ""], cols = { 3: RED, 7: YEL, 11: GREEN };
    for (var kk = 0; kk < 16; kk++) { var cx = -54 + (kk % 4) * 28, cy = 38 + Math.floor(kk / 4) * 16, pr = o.keyAt === kk ? 1.5 : 0; s += '<rect x="' + cx + '" y="' + f(cy + pr) + '" width="24" height="13" rx="2" fill="' + (cols[kk] || "url(#gKey)") + '" stroke="' + INK + '" stroke-width="1.2"/>' + (labels[kk] ? '<text x="' + (cx + 12) + '" y="' + f(cy + 10 + pr) + '" text-anchor="middle" style="font:700 9px Noto Serif;fill:' + INK + '">' + labels[kk] + '</text>' : ''); }
    // the cash slot with its shutter and the bundle sticking out
    var sh = clamp(o.shutter || 0); s += '<rect x="-60" y="118" width="120" height="26" rx="5" fill="url(#gBezel)" stroke="' + INK + '" stroke-width="2"/><rect x="-50" y="124" width="100" height="12" fill="#111"/>';
    if (o.cash) for (var n = 0; n < 4; n++) s += note(0, 130 + 14 * clamp(o.cash) - n * 2, 0.9, 0);
    s += '<rect x="-50" y="124" width="100" height="' + f(12 * (1 - sh)) + '" fill="#3a3f46"/>';
    if (o.glow) s += '<rect x="-64" y="114" width="128" height="34" rx="7" fill="none" stroke="' + GREEN + '" stroke-width="3" opacity="' + f(0.5 + 0.5 * Math.sin(t * 6)) + '"/>';
    return s + '</g>';
  }
  function screenMenu(w, h, t) { return '<rect width="' + w + '" height="' + h + '" fill="url(#gScreen)"/><text x="' + (w / 2) + '" y="18" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#fff">أهلًا بيك</text>' + ["سحب نقدي", "استعلام رصيد", "تحويل", "إلغاء"].map(function (l, i) { return '<rect x="' + (i % 2 ? w - 66 : 4) + '" y="' + (28 + Math.floor(i / 2) * 30) + '" width="62" height="22" rx="4" fill="#fff" opacity=".9"/><text x="' + (i % 2 ? w - 35 : 35) + '" y="' + (43 + Math.floor(i / 2) * 30) + '" text-anchor="middle" style="font:700 8.5px Noto Sans Arabic;fill:#16408a">' + l + '</text>'; }).join(""); }
  function screenText(txt, sub, col) { return function (w, h) { return '<rect width="' + w + '" height="' + h + '" fill="url(#gScreen)"/><text x="' + (w / 2) + '" y="' + (h / 2 - 4) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + (col || "#fff") + '">' + txt + '</text>' + (sub ? '<text x="' + (w / 2) + '" y="' + (h / 2 + 18) + '" text-anchor="middle" style="font:700 10px Noto Sans Arabic;fill:#cfe6f2">' + sub + '</text>' : ''); }; }
  function bankWall(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gWallB)"/>'; for (var r = 0; r < 26; r++) for (var c = 0; c < 22; c++) s += '<rect x="' + (-400 + c * 70 + (r % 2) * 35) + '" y="' + (-300 + r * 34) + '" width="70" height="34" fill="none" stroke="#a88a64" stroke-width="1.4"/>'; return s + '<rect x="-400" y="330" width="1440" height="300" fill="#8a857d"/>'; }
  function person(x, y, t, mood, o) {   // a ball-head person from behind-ish, hand raised
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 1.5) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#c23a26") + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 38, mood, t, o.look || 0);
    if (o.hand) s += '<path d="M34 50 Q70 30 ' + f(o.hand[0]) + ' ' + f(o.hand[1]) + '" stroke="' + (o.col || "#c23a26") + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="' + f(o.hand[0]) + '" cy="' + f(o.hand[1]) + '" r="9" fill="#e0b48a" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>'; }
  // the inside, cut open: top cabinet (PC, card reader, receipt printer) and the steel safe with the cash dispenser
  // o: { s, flow (notes travelling), reject (a double note diverted), doorOpen, highlight: "top" | "safe" | "pick" | "sensor" | "reject" | "stack" | "present", cardIn }
  function atmCut(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', hl = o.highlight;
    s += '<rect x="-160" y="-190" width="320" height="380" rx="8" fill="#2b2f34" stroke="' + INK + '" stroke-width="4"/>';
    // top cabinet
    s += '<rect x="-150" y="-180" width="300" height="120" rx="4" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="-140" y="-170" width="90" height="60" rx="3" fill="#3f6b4a" stroke="' + INK + '" stroke-width="2"/>'; for (var c = 0; c < 4; c++) s += '<rect x="' + (-132 + c * 20) + '" y="-160" width="14" height="10" fill="#2b2620"/>'; s += '<path d="M-140 -126 H-50" stroke="#c9a650" stroke-width="2" stroke-dasharray="4 3"/><text x="-95" y="-96" text-anchor="middle" style="font:700 10px Noto Sans Arabic;fill:#e9e4d8">كمبيوتر</text>';
    s += '<rect x="-30" y="-170" width="80" height="34" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><rect x="-26" y="-158" width="72" height="8" fill="#111"/>' + (o.cardIn != null ? card(lerp(70, 10, clamp(o.cardIn)), -154, 0.32, 0) : '') + '<text x="10" y="-124" text-anchor="middle" style="font:700 10px Noto Sans Arabic;fill:#e9e4d8">قارئ الكارت</text>';
    s += '<rect x="70" y="-170" width="70" height="50" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><circle cx="96" cy="-145" r="16" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><circle cx="96" cy="-145" r="5" fill="#9aa2ac"/><path d="M110 -150 h24 v' + f(14 + 6 * Math.sin(t * 3)) + '" stroke="#f4f1e8" stroke-width="6" fill="none"/><text x="105" y="-102" text-anchor="middle" style="font:700 10px Noto Sans Arabic;fill:#e9e4d8">طابعة</text>';
    if (hl === "top") s += '<rect x="-154" y="-184" width="308" height="128" rx="6" fill="none" stroke="' + YEL + '" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 20) + '"/>';
    // the safe: thick steel walls, the door hinge and dial
    s += '<rect x="-150" y="-50" width="300" height="230" rx="4" fill="url(#gSafe)" stroke="' + INK + '" stroke-width="3"/><rect x="-136" y="-36" width="272" height="202" rx="3" fill="#22262b" stroke="' + INK + '" stroke-width="2"/>';
    if (hl === "safe") s += '<rect x="-154" y="-54" width="308" height="238" rx="6" fill="none" stroke="' + YEL + '" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 20) + '"/>';
    // four cassettes (one denomination each), front edge with notes, pick rollers
    for (var k = 0; k < 4; k++) { var cy = 40 + k * 32; s += '<rect x="-128" y="' + cy + '" width="150" height="26" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>'; for (var n = 0; n < 12; n++) s += '<rect x="' + (-120 + n * 11) + '" y="' + (cy + 4) + '" width="3" height="18" fill="' + ["#6fae6a", "#c9a04e", "#b47ad8", "#5d93ad"][k] + '"/>';
      s += '<text x="-52" y="' + (cy - 3) + '" text-anchor="middle" style="font:700 8px Noto Serif;fill:#c9ced4">' + [200, 100, 50, 20][k] + '</text>';
      var ra = t * 400 + k * 40; s += '<g transform="translate(34 ' + (cy + 13) + ') rotate(' + f(ra) + ')"><circle r="9" fill="#2b2620" stroke="#9aa2ac" stroke-width="2"/><path d="M-9 0 H9" stroke="#9aa2ac" stroke-width="2"/></g>';
      if (hl === "pick") s += '<circle cx="34" cy="' + (cy + 13) + '" r="14" fill="none" stroke="' + YEL + '" stroke-width="3" opacity="' + f(0.5 + 0.5 * Math.sin(t * 6)) + '"/>'; }
    // the note path: up the right side past the thickness sensor, the divert gate to the reject bin, the stacker, the presenter belts to the slot
    s += '<path d="M48 160 V-20" stroke="#9aa2ac" stroke-width="3" stroke-dasharray="6 5" stroke-dashoffset="' + f(t * 40) + '"/><path d="M66 160 V-20" stroke="#9aa2ac" stroke-width="3" stroke-dasharray="6 5" stroke-dashoffset="' + f(t * 40) + '"/>';
    s += '<rect x="40" y="0" width="34" height="18" rx="3" fill="#2b2f34" stroke="' + (hl === "sensor" ? YEL : "#9aa2ac") + '" stroke-width="2"/><path d="M40 9 H74" stroke="' + RED + '" stroke-width="2" opacity="' + f(0.6 + 0.4 * Math.sin(t * 12)) + '"/><text x="57" y="-6" text-anchor="middle" style="font:700 8px Noto Sans Arabic;fill:#e9e4d8">حسّاس</text>';
    s += '<rect x="86" y="80" width="44" height="80" rx="3" fill="#3a3f46" stroke="' + (hl === "reject" ? YEL : INK) + '" stroke-width="' + (hl === "reject" ? 3 : 2) + '"/><text x="108" y="176" text-anchor="middle" style="font:700 8px Noto Sans Arabic;fill:#e9e4d8">درج الرفض</text>';
    s += '<g transform="translate(57 -30) rotate(' + f(t * 200) + ')"><circle r="12" fill="#5a6068" stroke="' + (hl === "stack" ? YEL : INK) + '" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M0 0 L' + f(Math.cos(i) * 12) + ' ' + f(Math.sin(i) * 12) + '" stroke="#c9ced4" stroke-width="2"/>'; }).join("") + '</g>';
    s += '<path d="M57 -42 V-50 H-60" stroke="' + (hl === "present" ? YEL : "#9aa2ac") + '" stroke-width="' + (hl === "present" ? 4 : 3) + '" stroke-dasharray="6 5" stroke-dashoffset="' + f(t * 40) + '"/><rect x="-80" y="-58" width="24" height="16" rx="3" fill="#111" stroke="#9aa2ac" stroke-width="2"/>';
    // notes travelling: picked from the cassettes, up past the sensor, stacked, out to the slot
    if (o.flow) for (var q = 0; q < 5; q++) { var u = (t * 0.55 + q / 5) % 1, px, py, rr = 90;
      if (u < 0.2) { px = lerp(20, 57, u / 0.2); py = 40 + (q % 4) * 32 + 13; rr = 0; } else if (u < 0.7) { px = 57; py = lerp(40 + (q % 4) * 32 + 13, -30, (u - 0.2) / 0.5); } else { px = lerp(57, -68, (u - 0.7) / 0.3); py = -50; rr = 0; }
      s += note(px, py, 0.32, rr); }
    if (o.reject) { var ru = (t * 0.5) % 1; s += '<g opacity="' + f(1 - ru * 0.3) + '">' + note(lerp(57, 108, ru), lerp(10, 120, ru), 0.32, 90) + note(lerp(60, 111, ru), lerp(12, 122, ru), 0.32, 92) + '</g>'; }
    // the safe door, swung open (drawn in front)
    if (o.doorOpen) { var dw = 300 * (1 - clamp(o.doorOpen) * 0.85); s += '<rect x="-150" y="-50" width="' + f(dw) + '" height="230" rx="4" fill="url(#gSafe)" stroke="' + INK + '" stroke-width="3" opacity=".95"/><circle cx="' + f(-150 + dw * 0.5) + '" cy="65" r="' + f(22 * dw / 300) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="3"/>'; }
    return s + '</g>';
  }
  function bankBuilding(x, y, s, t) { var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-80 -60 L0 -100 L80 -60 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/><rect x="-80" y="-60" width="160" height="12" fill="#c9c4b8" stroke="' + INK + '" stroke-width="2"/>';
    for (var c = 0; c < 5; c++) g += '<rect x="' + (-70 + c * 32) + '" y="-46" width="14" height="70" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/>'; return g + '<rect x="-86" y="24" width="172" height="12" fill="#c9c4b8" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-70" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">بنكك</text></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the machine hands you cash in seconds, nobody counting it (the ATM in the bank wall, the cash slides out)
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 330, k), lerp(190, 230, k), lerp(0.95, 1.4, k)]; }, function (u, d, t) {
    var c = clamp((u - 1.0) / 1.4), s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, shutter: c > 0 ? 1 : 0, cash: c, glow: c > 0, screen: screenText("خد فلوسك", "شكرًا") });
    s += person(130, 230, t, "happy", { s: 0.9, hand: [210, 290] });
    return s + tag("في ثواني!", 520, 80, u, 1.8, 3, 21);
  });
  // 1 — how did it know you have money? how does it count without mistakes?
  shot(1, function (u, d) { return [lerp(300, 330, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = bankWall(t) + atmFront(420, 180, t, { s: 0.85 }) + person(170, 220, t, "curious", { s: 0.95, look: 1 }) + qmark(250, 90, t, 50) + qmark(280, 140, t + 1, 34);
    for (var n = 0; n < 5; n++) s += note(130 + n * 26, 60 + Math.sin(t * 3 + n) * 8, 0.55, -10 + n * 5);
    return s + tag("رصيد؟ عدّ؟", 170, 320, u, 1.0, -2, 19);
  });
  // 2 — and who's sitting inside? (a little man peeks out of the cash slot)
  shot(2, function (u, d) { return [330, 290, lerp(1.6, 1.8, u / d)]; }, function (u, d, t) {
    var s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, shutter: 1 });
    s += '<g transform="translate(330 ' + f(300 - 16 * pop(u / 0.5)) + ')">' + head(0, 0, 13, "happy", t) + '</g>';
    return s + tag("مين جوه؟!", 420, 250, u, 0.2, 4, 16);
  });
  // 3 — "إيه الحكاية؟"
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(320 200) scale(' + f(0.62 * pop(u / 0.6)) + ')">' + atmFront(0, 0, t, { s: 1, shutter: 1, cash: 1, glow: true }) + '</g>';
    for (var i = 0; i < 8; i++) { var a = i * 0.785 + t * 0.7; s += note(320 + Math.cos(a) * 170, 190 + Math.sin(a) * 120, 0.5, a * 57); }
    return s + tag("إيه الحكاية؟", 320, 46, u, 0.2, -3, 28);
  });
  // 4 — inside, two halves: on top a computer, a screen, a card reader and a receipt printer
  shot(4, function (u, d) { var k = ease(clamp((u - 0.6) / 1.6)); return [320, lerp(190, 120, k), lerp(0.95, 1.45, k)]; }, function (u, d, t) {
    return graphPaper(t) + atmCut(320, 190, t, { s: 0.92, highlight: u > 1.4 ? "top" : null }) + tag("فوق", 520, 70, u, 1.6, 3, 20);
  });
  // 5 — and below, a heavy steel safe with the money
  shot(5, function (u, d) { return [320, lerp(230, 260, u / d), lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + atmCut(320, 190, t, { s: 0.92, highlight: "safe" }) + tag("خزنة حديد", 500, 300, u, 0.4, 3, 18);
  });
  // 6 — insert the card: it reads the chip or the stripe
  shot(6, function (u, d) { return [lerp(390, 410, u / d), 180, lerp(1.6, 1.8, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.2), s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, cardIn: k, screen: screenText(k < 1 ? "دخّل الكارت" : "بنقرا الكارت…") });
    s += '<g transform="translate(420 110) scale(' + f(pop((u - 1.6) / 0.8)) + ')"><rect x="-50" y="-30" width="100" height="56" rx="8" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>' + '<rect x="-36" y="-14" width="22" height="16" rx="3" fill="url(#gChip)" stroke="#8a6a30"/><text x="16" y="0" text-anchor="middle" style="font:700 9px Noto Sans Arabic;fill:' + INK + '">شريحة</text><rect x="-44" y="12" width="88" height="8" fill="#2b2620"/></g>';
    return s;
  });
  // 7 — as you type the PIN, the keypad itself encrypts it before it leaves
  shot(7, function (u, d) { return [330, lerp(240, 250, u / d), lerp(1.8, 1.95, u / d)]; }, function (u, d, t) {
    var key = [4, 9, 2, 5][Math.floor(u * 1.4) % 4], s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, keyAt: key, screen: screenText("الرقم السري", "• • • •") });
    for (var q = 0; q < 4; q++) { var uu = (t * 0.8 + q / 4) % 1; s += '<text x="' + f(lerp(300, 440, uu)) + '' + '" y="' + f(230 - 20 * uu) + '" style="font:800 10px Noto Serif;fill:#7cf29a;opacity:' + f(1 - uu) + ';direction:ltr">' + ["#9f", "x7k", "Q2@", "&3z"][q] + '</text>'; }
    return s + lock(360, 205, 1.1 * pop((u - 0.8) / 0.8)) + tag("بيتشفّر!", 420, 196, u, 1.2, 3, 16);
  });
  // 8 — the machine sends your request, encrypted, through the bank network to your bank
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(100 190) scale(.42)">' + atmFront(0, 0, t, {}) + '</g>' + bankBuilding(540, 210, 1, t);
    s += '<g transform="translate(320 110)"><circle r="50" fill="#e6f1f4" stroke="' + INK + '" stroke-width="3"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<circle cx="' + f(Math.cos(i * 1.05 + t * 0.4) * 34) + '" cy="' + f(Math.sin(i * 1.05 + t * 0.4) * 34) + '" r="7" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>'; }).join("") + '<text y="6" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:' + INK + '">شبكة البنوك</text></g>';
    s += '<path d="M150 150 Q240 60 300 100 M340 120 Q440 70 500 140" stroke="' + BLUE + '" stroke-width="3" fill="none" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 30) + '"/>';
    var k = (t * 0.45) % 1, px = k < 0.5 ? lerp(150, 300, k * 2) : lerp(340, 500, (k - 0.5) * 2), py = k < 0.5 ? lerp(150, 100, k * 2) - Math.sin(k * 2 * Math.PI) * 30 : lerp(120, 140, (k - 0.5) * 2) - Math.sin((k - 0.5) * 2 * Math.PI) * 30;
    return s + lock(px, py, 1.2) + tag("مشفّر", 320, 300, u, 1.0, -2, 19);
  });
  // 9 — the bank checks your balance and answers yes or no, in a second or two
  shot(9, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var ok = u > 1.6, s = graphPaper(t) + bankBuilding(200, 230, 1.2, t);
    s += '<g transform="translate(430 150)"><rect x="-90" y="-70" width="180" height="140" rx="12" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><text y="-34" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + INK + '">رصيدك</text><text y="0" text-anchor="middle" style="font:800 24px Noto Serif;fill:' + BLUE + '">' + Math.round(lerp(0, 3450, clamp(u / 1.4))).toLocaleString("en") + '</text>' + (ok ? '<circle cy="42" r="18" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-8 42 l6 6 l11 -12" stroke="#fff" stroke-width="4" fill="none"/>' : '') + '</g>';
    var ms = Math.min(1.5, u * 0.8).toFixed(1); s += '<g transform="translate(430 290)"><rect x="-60" y="-18" width="120" height="36" rx="10" fill="' + INK + '"/><text y="7" text-anchor="middle" style="font:800 16px Noto Serif;fill:#7cf29a">' + ms + ' ث</text></g>';
    return s + tag(ok ? "موافقة!" : "بيشوف…", 200, 70, u, 0.4, -3, 20, ok ? "#bdf5c8" : null);
  });
  // 10 — if yes, the safe springs into action (door opens, gears turn)
  shot(10, function (u, d) { return [320, lerp(220, 240, u / d), lerp(1.2, 1.3, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + atmCut(320, 190, t, { s: 0.92, doorOpen: clamp(u / 1.2), highlight: "safe" }) + tag("الخزنة اشتغلت", 330, 330, u, 0.8, -2, 18);
  });
  // 11 — inside the safe, drawers called cassettes, one note value each
  shot(11, function (u, d) { return [lerp(250, 270, u / d), 270, lerp(1.6, 1.7, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + atmCut(320, 190, t, { s: 0.92 });
    for (var k = 0; k < 4; k++) { var p = pop((u - 0.4 - k * 0.4) / 0.6); if (p > 0) s += '<g transform="translate(150 ' + (190 + (40 + k * 32 + 13) * 0.92) + ') scale(' + f(p) + ')"><rect x="-26" y="-11" width="52" height="22" rx="6" fill="' + ["#6fae6a", "#c9a04e", "#b47ad8", "#5d93ad"][k] + '" stroke="' + INK + '" stroke-width="2"/><text y="5" text-anchor="middle" style="font:800 12px Noto Serif;fill:' + INK + '">' + [200, 100, 50, 20][k] + '</text></g>'; }
    return s + tag("كاسيتات", 260, 210, u, 0.3, -3, 17);
  });
  // 12 — one cassette holds thousands of notes (a fat brick of notes, counter)
  shot(12, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<rect x="140" y="140" width="360" height="110" rx="10" fill="#5a6068" stroke="' + INK + '" stroke-width="4"/>';
    var n = Math.round(lerp(0, 2500, clamp(u / 1.6))); for (var i = 0; i < 60; i++) s += '<rect x="' + (152 + i * 5.8) + '" y="150" width="3.6" height="90" fill="' + (i % 2 ? "#6fae6a" : "#5f9a5a") + '"/>';
    s += '<g transform="translate(320 90)"><rect x="-90" y="-26" width="180" height="48" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="9" text-anchor="middle" style="font:800 22px Noto Serif;fill:#7cf29a">' + n.toLocaleString("en") + '+</text></g>';
    return s + tag("آلاف الورقات", 320, 300, u, 0.8, -2, 20);
  });
  // 13 — rubber rollers with suction pull exactly one note at a time (close-up)
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#22262b"/><rect x="60" y="210" width="300" height="80" rx="6" fill="#5a6068" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 26; i++) s += '<rect x="' + (70 + i * 10) + '" y="220" width="5" height="62" fill="' + (i % 2 ? "#6fae6a" : "#5f9a5a") + '"/>';
    [[400, 220], [400, 280]].forEach(function (r, k) { s += '<g transform="translate(' + r[0] + ' ' + r[1] + ') rotate(' + f((k ? -1 : 1) * t * 300) + ')"><circle r="28" fill="#2b2620" stroke="#9aa2ac" stroke-width="4"/><path d="M-28 0 H28 M0 -28 V28" stroke="#5a6068" stroke-width="3"/></g>'; });
    for (var a = 0; a < 6; a++) { var uu = (t * 1.5 + a / 6) % 1; s += '<path d="M' + f(340 - uu * 40) + ' 250 h-10" stroke="#cfe6f2" stroke-width="3" opacity="' + f(1 - uu) + '"/>'; }
    var k2 = (t * 0.7) % 1; s += note(lerp(360, 600, k2), 250, 1.3, 90 * 0);
    return s + tag("ورقة واحدة بس!", 470, 110, u, 1.2, 3, 21) + tag("شفط + بكرات", 200, 120, u, 0.5, -3, 18);
  });
  // 14 — each note passes a sensor that measures its thickness
  shot(14, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#22262b"/><path d="M-400 210 H1040" stroke="#5a6068" stroke-width="6"/>';
    s += '<rect x="270" y="120" width="100" height="60" rx="8" fill="#3a3f46" stroke="' + YEL + '" stroke-width="3"/><rect x="270" y="236" width="100" height="40" rx="8" fill="#3a3f46" stroke="' + YEL + '" stroke-width="3"/><path d="M320 180 V236" stroke="' + RED + '" stroke-width="4" opacity="' + f(0.6 + 0.4 * Math.sin(t * 14)) + '"/>';
    var k = (t * 0.6) % 1; s += note(lerp(0, 640, k), 205, 1.2, 0);
    s += '<g transform="translate(500 90)"><rect x="-80" y="-24" width="160" height="48" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 18px Noto Serif;fill:#7cf29a;direction:ltr">0.1 mm</text></g>';
    return s + tag("حسّاس التُخن", 160, 90, u, 0.4, -3, 19);
  });
  // 15 — two notes stuck together, or a torn one: thrown into another drawer, the reject bin
  shot(15, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#22262b"/><path d="M-400 150 H330 L600 150" stroke="#5a6068" stroke-width="6"/>';
    s += '<rect x="200" y="80" width="80" height="50" rx="8" fill="#3a3f46" stroke="' + YEL + '" stroke-width="3"/><path d="M240 130 V150" stroke="' + RED + '" stroke-width="4"/>';
    s += '<path d="M-400 150 H1040" stroke="#9aa2ac" stroke-width="2" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 80) + '"/>';
    for (var gn = 0; gn < 3; gn++) { var gu = (t * 0.45 + gn / 3) % 1; if (u > 0.8 && u < 2.6 && gn === 0) continue; s += note(lerp(-60, 700, gu), 142, 0.9, 0); }
    var k = clamp((u - 0.4) / 1.6), dn = k < 0.5 ? [lerp(-20, 300, k * 2), 145] : [lerp(300, 420, (k - 0.5) * 2), lerp(145, 290, (k - 0.5) * 2)];
    s += '<rect x="370" y="250" width="150" height="90" rx="8" fill="#3a3f46" stroke="' + RED + '" stroke-width="4"/><text x="445" y="330" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#ffb08a">درج الرفض</text>';
    s += note(dn[0], dn[1], 1.1, k > 0.5 ? 40 * (k - 0.5) : 0) + note(dn[0] + 6, dn[1] + 4, 1.1, k > 0.5 ? 40 * (k - 0.5) + 6 : 4);
    if (u > 1.0) s += '<g transform="translate(240 50)"><rect x="-70" y="-18" width="140" height="34" rx="8" fill="' + RED + '"/><text y="6" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#fff">ورقتين لازقين!</text></g>';
    var k3 = clamp((u - 2.8) / 1.6); if (k3 > 0) s += '<g opacity="' + f(Math.min(1, k3 * 3)) + '">' + '<path transform="translate(' + f(lerp(-20, 420, k3)) + ' ' + f(lerp(145, 300, Math.max(0, (k3 - 0.7) / 0.3))) + ')" d="M-34 -16 H34 V4 L20 16 L6 6 L-8 16 L-34 16 Z" fill="url(#gNote)" stroke="#2e6a3a" stroke-width="1.4"/></g>';
    return s + tag("مقطوعة؟ برّه!", 120, 290, u, 3.2, -2, 18, "#ffb08a");
  });
  // 16 — the good notes gather into one bundle (stacker wheel)
  shot(16, function (u, d) { return [320, 190, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var n = Math.min(8, Math.floor(u * 4)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#22262b"/>' + '<g transform="translate(240 160) rotate(' + f(t * 200) + ')"><circle r="50" fill="#5a6068" stroke="' + INK + '" stroke-width="3"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M0 0 Q' + f(Math.cos(i) * 40) + ' ' + f(Math.sin(i) * 20) + ' ' + f(Math.cos(i + 0.4) * 50) + ' ' + f(Math.sin(i + 0.4) * 50) + '" stroke="#c9ced4" stroke-width="4" fill="none"/>'; }).join("") + '</g>';
    for (var i = 0; i < n; i++) s += note(400, 250 - i * 6, 1.3, 0);
    return s + tag("رزمة واحدة", 400, 110, u, 0.6, 3, 20);
  });
  // 17 — a belt carries the bundle to the slot and the shutter opens (back to the front of the machine)
  shot(17, function (u, d) { var k = ease(clamp(u / d)); return [330, lerp(300, 270, k), lerp(2.0, 1.6, k)]; }, function (u, d, t) {
    var c = clamp((u - 1.4) / 1.2), s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, shutter: clamp((u - 0.8) / 0.6), cash: c, glow: c > 0 });
    return s + tag("اتفضل!", 430, 230, u, 2.0, 4, 18);
  });
  // 18 — forget the cash and the machine can pull it back in
  shot(18, function (u, d) { return [330, lerp(280, 290, u / d), lerp(1.7, 1.8, u / d)]; }, function (u, d, t) {
    var r = clamp((u - 1.4) / 1.0), s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, shutter: 1 - clamp((u - 2.4) / 0.5), cash: 1 - r, screen: screenText(u < 1.4 ? "خد فلوسك" : "اتسحبت جوه", "", u < 1.4 ? "#fff" : "#ffd23a") });
    var sec = Math.max(0, Math.ceil(30 - u * 9)); s += '<g transform="translate(450 230)"><circle r="26" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="7" text-anchor="middle" style="font:800 18px Noto Serif;fill:#7cf29a">' + sec + '</text></g>';
    return s + tag("نسيتها؟", 220, 250, u, 0.5, -3, 16);
  });
  // 19 — a camera always filming, and sensors that catch anything strange stuck on the machine
  shot(19, function (u, d) { return [lerp(320, 340, u / d), lerp(150, 170, u / d), lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, screen: screenText(u > 2.6 ? "تنبيه!" : "أهلًا بيك", "", u > 2.6 ? "#ffd23a" : "#fff") });
    s += '<path d="M403 39 L560 -20 L560 120 Z" fill="#fff6c8" opacity="' + f(0.12 + 0.05 * Math.sin(t * 4)) + '"/>';
    var k = clamp((u - 1.6) / 0.8); s += '<g transform="translate(' + f(lerp(560, 395, k)) + ' 180)"><rect x="-26" y="-14" width="52" height="28" rx="5" fill="#8a929c" stroke="' + RED + '" stroke-width="3" stroke-dasharray="5 3"/></g>';
    if (u > 2.6) s += '<circle cx="395" cy="180" r="' + f(36 + 6 * Math.sin(t * 10)) + '" fill="none" stroke="' + RED + '" stroke-width="4"/>';
    return s + tag("كاميرا", 470, 40, u, 0.4, 3, 18) + tag("حسّاسات", 520, 290, u, 2.6, -2, 18, "#ffb08a");
  });
  // 20 — the first machine like this: London, 1967 (sepia street, old brick bank)
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9a98a"/>'; for (var r = 0; r < 26; r++) for (var c = 0; c < 22; c++) s += '<rect x="' + (-400 + c * 60 + (r % 2) * 30) + '" y="' + (-300 + r * 28) + '" width="60" height="28" fill="#a8694a" stroke="#7a4a30" stroke-width="2"/>';
    s += '<rect x="230" y="70" width="180" height="200" rx="6" fill="#6b4a30" stroke="' + INK + '" stroke-width="4"/><rect x="250" y="90" width="140" height="40" fill="#e9d8a8" stroke="' + INK + '" stroke-width="2"/><text x="320" y="117" text-anchor="middle" style="font:800 16px Noto Serif;fill:' + INK + ';direction:ltr">CASH</text>';
    s += '<rect x="262" y="150" width="116" height="34" rx="4" fill="#3a3530" stroke="' + INK + '" stroke-width="2"/><rect x="262" y="' + f(196 + 6 * Math.sin(t * 2)) + '" width="116" height="26" rx="3" fill="#c9a650" stroke="' + INK + '" stroke-width="2"/>';
    var y = Math.round(lerp(2026, 1967, clamp(u / 1.6))); s += '<g transform="translate(320 320)"><rect x="-80" y="-24" width="160" height="44" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="9" text-anchor="middle" style="font:800 24px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".18"/>' + tag("لندن", 140, 70, u, 0.6, -3, 22);
  });
  // 21 — no cards: it worked with paper cheques that had a slightly radioactive substance in them
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9d8a8"/>' + card(140 + Math.sin(t * 2) * 8, 110 + Math.cos(t * 2.4) * 6, 1.1 + 0.05 * Math.sin(t * 3), -10 + Math.sin(t * 2) * 8) + '<path d="M80 60 L200 160 M200 60 L80 160" stroke="' + RED + '" stroke-width="10" stroke-linecap="round" opacity="' + f(clamp(u - 0.4)) + '" transform="rotate(' + f(Math.sin(t * 5) * 4) + ' 140 110)"/>';
    for (var dd = 0; dd < 12; dd++) { var du = (t * 0.3 + dd / 12) % 1; s += '<circle cx="' + f(-100 + hash(dd) * 840) + '" cy="' + f(380 - du * 460) + '" r="3" fill="#c9a650" opacity="' + f(0.5 * (1 - du)) + '"/>'; }
    var p = pop((u - 1.2) / 0.9); s += '<g transform="translate(420 190) scale(' + f(p) + ') rotate(-6)"><rect x="-120" y="-60" width="240" height="120" rx="4" fill="#fbf6e6" stroke="' + INK + '" stroke-width="3"/><path d="M-100 -30 H60 M-100 -10 H40 M-100 10 H70" stroke="#b9b2a2" stroke-width="3"/><text x="-100" y="44" style="font:700 12px Noto Serif;fill:#7a6650;direction:ltr">CHEQUE</text>';
    s += '<g transform="translate(80 18) rotate(' + f(t * 40) + ')"><circle r="24" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + [0, 1, 2].map(function (i) { var a = i * 2.094; return '<path d="M0 0 L' + f(Math.cos(a - 0.5) * 22) + ' ' + f(Math.sin(a - 0.5) * 22) + ' A22 22 0 0 1 ' + f(Math.cos(a + 0.5) * 22) + ' ' + f(Math.sin(a + 0.5) * 22) + ' Z" fill="' + INK + '"/>'; }).join("") + '<circle r="6" fill="' + YEL + '" stroke="' + INK + '"/></g></g>';
    for (var g = 0; g < 8; g++) { var uu = (t * 0.8 + g / 8) % 1; s += '<circle cx="' + f(500 + Math.cos(g) * 60 * uu) + '" cy="' + f(208 + Math.sin(g) * 50 * uu) + '" r="2.4" fill="#7cf29a" opacity="' + f(1 - uu) + '"/>'; }
    return s + tag("مادة مشعة خفيفة", 420, 320, u, 2.2, -2, 18);
  });
  // 22 — the inventor wanted a six-digit PIN, but his wife said she'd only remember four (kitchen table)
  shot(22, function (u, d) { return [lerp(300, 340, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efe3c6"/><rect x="-400" y="250" width="1440" height="300" fill="#a7774e"/><rect x="120" y="230" width="400" height="20" fill="#8c6440" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M480 120 h40 l-6 40 h-28 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><path d="M500 112 q-8 -14 0 -24 q8 -10 0 -22" stroke="#d9d4c8" stroke-width="3" fill="none" opacity="' + f(0.5 + 0.3 * Math.sin(t * 3)) + '"/>';
    s += '<path d="M120 250 C116 170 150 150 190 150 C230 150 262 170 258 250 Z" fill="#26405e" stroke="' + INK + '" stroke-width="3"/>' + head(190, 112, 38, u < 2.6 ? "happy" : "shock", t, 1);
    s += '<path d="M380 250 C376 170 410 150 450 150 C490 150 522 170 518 250 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="3"/>' + head(450, 112, 38, "happy", t, -1) + '<path d="M420 82 C430 50 470 50 480 82" stroke="#5a3c20" stroke-width="10" fill="none"/>';
    var b1 = pop((u - 0.3) / 0.8); if (b1 > 0) s += '<g transform="translate(200 40) scale(' + f(b1) + ')"><rect x="-70" y="-26" width="140" height="48" rx="16" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:' + INK + ';direction:ltr">● ● ● ● ● ●</text></g>';
    var b2 = pop((u - 2.4) / 0.8); if (b2 > 0) s += '<g transform="translate(460 30) scale(' + f(b2) + ')"><rect x="-90" y="-26" width="180" height="48" rx="16" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + RED + '">أربعة بس!</text></g>';
    return s;
  });
  // 23 — ever since, PINs have four digits in most of the world's banks, because of his wife!
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [330, lerp(240, 200, k), lerp(1.7, 1.05, k)]; }, function (u, d, t) {
    var key = [1, 4, 6, 9][Math.floor(u * 1.6) % 4], s = bankWall(t) + atmFront(330, 180, t, { s: 0.92, keyAt: key, screen: screenText("الرقم السري", ["•", "• •", "• • •", "• • • •"][Math.floor(u * 1.6) % 4]) });
    s += '<g transform="translate(170 130)">' + head(0, 0, 34, "happy", t, 1) + '<path d="M-30 -28 C-20 -56 20 -56 30 -28" stroke="#5a3c20" stroke-width="10" fill="none"/></g>';
    return s + tag("شكرًا يا مدام!", 190, 214, u, 1.6, -3, 17) + tag("4 أرقام", 520, 70, u, 0.6, 3, 22);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(220 200) scale(.62)">' + atmFront(0, 0, t, { shutter: 1, cash: 1, glow: true }) + '</g>' + person(440, 160, t, "happy", { s: 0.8, look: -1 });
    return s + qmark(500, 80, t, 56) + qmark(550, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { atmFront: atmFront, atmCut: atmCut, bankWall: bankWall, note: note, card: card, person: person, tag: tag, screenText: screenText, lock: lock };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
