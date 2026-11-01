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

  // ── new pieces for this episode (shapes taken from real photos: see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", WATER = "#2f7fb8", OIL = "#1e1812", MUD = "#9a7048";
  // the sea seen from the side: sky + waves at y0, water getting darker with depth, light rays, drifting specks
  function sea(t, y0, depth, o) {
    o = o || {}; var s = "", dk = clamp(depth || 0);
    if (y0 > -300) { s += (o.sky === "sunset" ? '<rect x="-400" y="-300" width="1440" height="960" fill="url(#skyS)"/>' : sky(o.sky || "day")) + clouds(t, 14, Math.min(y0 - 160, 40), 4, 0.8); if (o.gulls) s += birds(t, y0 - 120, 40); }
    var top = Math.max(-300, y0);
    s += '<rect x="-400" y="' + f(top) + '" width="1440" height="' + f(660 - top + 300) + '" fill="url(#sea' + (dk > 0.6 ? "3" : dk > 0.25 ? "2" : "1") + ')"/>';
    if (y0 > -300) s += waves(t, y0);
    if (dk < 0.7) for (var r = 0; r < 6; r++) { var rx = -100 + r * 150 + Math.sin(t * 0.4 + r) * 30; s += '<path d="M' + f(rx) + ' ' + top + ' L' + f(rx + 60) + ' ' + top + ' L' + f(rx + 160) + ' 400 L' + f(rx + 40) + ' 400 Z" fill="#fff" opacity="' + f((0.07 + 0.04 * Math.sin(t * 1.3 + r)) * (1 - dk)) + '"/>'; }
    for (var i = 0; i < 40; i++) { var px = -300 + hash(i) * 1240 + Math.sin(t * 0.6 + i) * 10, py = ((hash(i + 5) * 700 - t * (6 + hash(i) * 8)) % 700 + 700) % 700 - 300; if (py > top) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(0.8 + hash(i + 2) * 1.6) + '" fill="#fff" opacity=".35"/>'; }
    return s;
  }
  function waves(t, y0) { var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y0 + Math.sin(x * 0.04 + t * 2.2) * 4 + Math.sin(x * 0.11 - t * 3) * 2); return '<path d="' + d + ' V' + (y0 + 20) + ' H-400 Z" fill="#8fd0ee" opacity=".55"/><path d="' + d + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>'; }
  function bubbles(t, x, y, n, sp, spread, top) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), bx = x + Math.sin(u * 9 + i) * spread * u + (hash(i) - 0.5) * spread, by = y - u * (y - (top == null ? y - 200 : top)), r = 2 + hash(i + 3) * 5 * (0.5 + u); s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(r) + '" fill="#bfe6f7" fill-opacity=".35" stroke="#fff" stroke-width="1.4" opacity="' + f(1 - u * 0.6) + '"/>'; } return s; }
  function fish(t, y0, sp, n, col) { var s = ""; for (var i = 0; i < n; i++) { var x = ((t * sp * (i % 2 ? 1 : 0.8) + i * 170) % 1100) - 250, y = y0 + i * 18 + Math.sin(t * 2 + i) * 6, w = Math.sin(t * 10 + i) * 3; s += '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-14 0 Q0 -9 12 0 Q0 9 -14 0 Z" fill="' + (col || "#f2a93b") + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-13 0 L-22 ' + f(-6 + w) + ' L-22 ' + f(6 + w) + ' Z" fill="' + (col || "#f2a93b") + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="6" cy="-2" r="1.6" fill="' + INK + '"/></g>'; } return s; }

  // rock layers under the seabed. o: {dome: height of the anticline, cx, w, oil: 0..1 how full the trap is, cap: highlight the seal, n: layer count}
  var LAYC = ["#c9b07a", "#a98a5c", "#8a7458", "#b39a72", "#6f6a62", "#9a8060", "#7a6650", "#5f5244"];
  function strata(t, y, o) {
    o = o || {}; var s = "", n = o.n || 7, th = o.th || 46, cx = o.cx == null ? 320 : o.cx, w = o.w || 170, dome = o.dome || 0;
    function by(k, x) { var g = Math.exp(-Math.pow((x - cx) / w, 2)); return y + k * th - (k > 0 ? dome * g * (1 - k * 0.04) : 0); }
    function edge(k) { var d = ""; for (var x = -400; x <= 1040; x += 20) d += (x === -400 ? "M" : " L") + x + " " + f(by(k, x)); return d; }
    for (var k = 0; k < n; k++) {
      var top = edge(k), bot = ""; for (var x = 1040; x >= -400; x -= 20) bot += " L" + x + " " + f(by(k + 1, x));
      var col = o.cap && k === o.capK ? "#5a5f66" : LAYC[k % LAYC.length];
      s += '<path d="' + top + bot + ' Z" fill="' + col + '" stroke="#3a3024" stroke-width="1.6"/>';
      for (var g = 0; g < 14; g++) { var gx = -380 + hash(k * 31 + g) * 1400, gy = by(k, gx) + th * (0.3 + hash(g + k) * 0.5); s += '<ellipse cx="' + f(gx) + '" cy="' + f(gy) + '" rx="' + f(4 + hash(g * 3 + k) * 6) + '" ry="2" fill="#000" opacity=".12"/>'; }
    }
    if (o.oil && dome) {   // oil fills the top of the reservoir layer, right under the cap
      var rk = (o.capK || 3) + 1, lev = by(rk, cx) + dome * 0.75 * clamp(o.oil), d = "";
      for (var x2 = cx - w * 1.6; x2 <= cx + w * 1.6; x2 += 10) { var yt = by(rk, x2); if (yt < lev) d += (d ? " L" : "M") + x2 + " " + f(yt); }
      if (d) { s += '<path d="' + d + ' L' + f(cx + w * 1.6) + ' ' + f(lev) + ' L' + f(cx - w * 1.6) + ' ' + f(lev) + ' Z" fill="url(#oilG)" opacity=".92"/>';
        s += '<clipPath id="oc' + (++OILN) + '"><path d="' + d + ' Z"/></clipPath>'; for (var q = 0; q < 10; q++) { var qx = cx + (hash(q) - 0.5) * w * 1.8, qy = lev - 4 - hash(q + 9) * 26 + Math.sin(t * 2 + q) * 2; s += '<circle cx="' + f(qx) + '" cy="' + f(qy) + '" r="2" fill="#ffd98a" opacity="' + f(0.3 + 0.3 * Math.sin(t * 3 + q)) + '"/>'; } }
    }
    return s;
  }
  var OILN = 0;
  function seabed(t, y) { var s = '<path d="M-400 ' + y + ' Q0 ' + (y - 14) + ' 300 ' + y + ' T1040 ' + y + ' V' + (y + 30) + ' H-400 Z" fill="#c9b07a" stroke="#8a7448" stroke-width="2"/>'; for (var i = 0; i < 14; i++) { var x = -300 + i * 90 + hash(i) * 30, h = 20 + hash(i + 1) * 30, sw = Math.sin(t * 1.6 + i) * 8; s += '<path d="M' + f(x) + ' ' + y + ' Q' + f(x + sw) + ' ' + f(y - h / 2) + ' ' + f(x + sw * 1.4) + ' ' + f(y - h) + '" stroke="#4f8f5a" stroke-width="4" fill="none" stroke-linecap="round"/>'; } return s; }

  // the drillship (photo: Discoverer Luanda): long low hull, heavy dark lattice derrick amidships, accommodation + helideck at the bow (left), cranes, pipe rack
  function derrick(x, y, w0, w1, h, col) { col = col || "#2f343a"; var s = '<path d="M' + f(x - w0 / 2) + ' ' + y + ' L' + f(x - w1 / 2) + ' ' + f(y - h) + ' M' + f(x + w0 / 2) + ' ' + y + ' L' + f(x + w1 / 2) + ' ' + f(y - h) + '" stroke="' + col + '" stroke-width="4"/>'; for (var k = 0; k < 9; k++) { var a = y - h * k / 9, b = y - h * (k + 1) / 9, wa = w0 + (w1 - w0) * k / 9, wb = w0 + (w1 - w0) * (k + 1) / 9; s += '<path d="M' + f(x - wa / 2) + ' ' + f(a) + ' L' + f(x + wb / 2) + ' ' + f(b) + ' M' + f(x + wa / 2) + ' ' + f(a) + ' L' + f(x - wb / 2) + ' ' + f(b) + ' M' + f(x - wb / 2) + ' ' + f(b) + ' H' + f(x + wb / 2) + '" stroke="' + col + '" stroke-width="1.8" opacity=".9"/>'; } return s + '<rect x="' + f(x - w1 / 2 - 4) + '" y="' + f(y - h - 8) + '" width="' + f(w1 + 8) + '" height="8" fill="#c23a26" stroke="' + INK + '"/>'; }
  function drillship(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.3) * 2) + ') rotate(' + f(Math.sin(t * 0.9) * 0.8) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-230 0 L230 0 L210 36 L-202 36 Z" fill="url(#hullB)" stroke="' + INK + '" stroke-width="2"/><path d="M-226 0 H226 V8 H-224 Z" fill="#c23a26"/>';
    s += '<rect x="-200" y="-46" width="90" height="46" fill="url(#hullW)" stroke="#5a5a5a"/>'; for (var i = 0; i < 12; i++) s += '<rect x="' + (-194 + (i % 6) * 14) + '" y="' + (-38 + Math.floor(i / 6) * 16) + '" width="9" height="7" fill="' + (o.night ? "#ffd98a" : "#8fb6cf") + '"/>';
    s += '<path d="M-234 -52 H-144 L-154 -44 H-224 Z" fill="#e2b035" stroke="#5a4a20"/><circle cx="-189" cy="-49" r="6" fill="none" stroke="#fff" stroke-width="1.6"/>';
    s += '<rect x="-30" y="-24" width="100" height="24" fill="url(#hullW)" stroke="#5a5a5a"/>' + derrick(20, -24, 84, 30, 156);
    s += '<rect x="90" y="-16" width="90" height="16" fill="#8a929c" stroke="#3a3d42"/>'; for (var p = 0; p < 6; p++) s += '<path d="M94 ' + (-14 + p * 2.4) + ' H176" stroke="#5a6068" stroke-width="1.6"/>';
    s += '<path d="M-90 0 V-46 L-34 -72" stroke="#f2c230" stroke-width="5" fill="none"/><path d="M190 0 V-38 L240 -62" stroke="#f2c230" stroke-width="5" fill="none"/>';
    s += '<circle cx="20" cy="-184" r="5" fill="#ff3b2f" filter="url(#glow)" opacity="' + f(0.6 + 0.4 * Math.sin(t * 4)) + '"/>';
    if (o.pipe) s += '<rect x="16" y="0" width="8" height="' + o.pipe + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1"/>';
    return s + '</g>';
  }
  // semi-submersible platform: two pontoons, four columns, box deck, derrick
  function semisub(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.1 + 1) * 2) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-120" y="40" width="240" height="22" rx="10" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/>';
    [-100, -40, 40, 100].forEach(function (cx) { s += '<rect x="' + (cx - 12) + '" y="-20" width="24" height="62" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/>'; });
    s += '<rect x="-130" y="-46" width="260" height="28" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/><rect x="-124" y="-74" width="70" height="28" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-130 -80 H-50 L-58 -74 H-124 Z" fill="#4f8f5a" stroke="' + INK + '"/>';
    return s + derrick(30, -46, 60, 22, 110) + '</g>';
  }
  // seismic survey vessel (photo: Polar Princess): red hull, white superstructure forward (left), big working deck aft with the streamer reels
  function seisShip(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.5) * 2) + ') rotate(' + f(Math.sin(t * 1.1) * 1) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-130 0 L120 0 L112 26 L-110 26 Z" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><path d="M-128 -2 H122" stroke="#f4f1e8" stroke-width="3"/>';
    s += '<path d="M-110 0 V-40 H-30 V0 Z" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-104 -40 V-62 H-44 V-40 Z" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M-100 -58 H-48 V-50 H-100 Z" fill="#26405e"/>';
    s += '<path d="M-74 -62 V-96 M-80 -86 H-68" stroke="#e2b035" stroke-width="3"/>' + '<circle cx="-74" cy="-100" r="4" fill="#fff" stroke="' + INK + '"/>';
    for (var r = 0; r < 3; r++) s += '<circle cx="' + (10 + r * 34) + '" cy="-12" r="12" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (10 + r * 34) + '" cy="-12" r="4" fill="' + INK + '"/>';
    return s + '</g>';
  }
  // streamers: long cables trailing behind at the surface, buoys at the tail, hydrophones blink when the echo arrives
  function streamers(t, x0, y, len, n, blink) { var s = ""; for (var k = 0; k < n; k++) { var yy = y + k * 7, d = "M" + x0 + " " + yy; for (var x = 0; x <= len; x += 20) d += " L" + f(x0 + x) + " " + f(yy + Math.sin(x * 0.03 - t * 2 + k) * 2); s += '<path d="' + d + '" stroke="#f2c230" stroke-width="2.4" fill="none"/>'; for (var h = 1; h < 8; h++) { var hx = x0 + h * len / 8; s += '<circle cx="' + f(hx) + '" cy="' + f(yy + Math.sin(h * len / 8 * 0.03 - t * 2 + k) * 2) + '" r="2.4" fill="' + (blink && Math.sin(t * 12 + h) > 0 ? "#7cf29a" : "#3a3d42") + '"/>'; } s += '<path d="M' + f(x0 + len) + ' ' + f(yy - 6) + ' l8 0 l-4 -10 Z" fill="#ff7a2f" stroke="' + INK + '"/>'; } return s; }
  // FPSO (photo: Singapore FPSO): long tanker hull, process modules on deck, flare tower at one end, turret
  function fpso(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.0) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-220 0 L220 0 L206 34 L-206 34 Z" fill="#7a2a20" stroke="' + INK + '" stroke-width="2"/><path d="M-218 0 H218 V6 H-216 Z" fill="#c9ced4"/>';
    for (var m = 0; m < 6; m++) { var mx = -150 + m * 52; s += '<rect x="' + mx + '" y="-30" width="44" height="30" fill="#8a929c" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + mx + ' -20 H' + (mx + 44) + ' M' + mx + ' -10 H' + (mx + 44) + '" stroke="#5a6068"/><rect x="' + (mx + 8) + '" y="-44" width="10" height="14" fill="#e2b035" stroke="' + INK + '"/>'; }
    s += '<rect x="170" y="-40" width="40" height="40" fill="url(#hullW)" stroke="#5a5a5a"/><path d="M164 -46 H214 L208 -40 H170 Z" fill="#e2b035"/>';
    s += '<path d="M-190 0 L-196 -110 M-180 0 L-186 -110" stroke="#5a6068" stroke-width="3"/><path d="M-200 -110 H-176" stroke="#5a6068" stroke-width="4"/>';
    var fl = 1 + 0.25 * Math.sin(t * 9) + 0.15 * Math.sin(t * 23); s += '<g transform="translate(-188 -114) scale(' + f(fl) + ')"><path d="M0 0 C-12 -10 -8 -26 2 -36 C2 -24 14 -18 8 0 Z" fill="#ff8a2f"/><path d="M0 0 C-5 -6 -3 -14 2 -20 C3 -12 8 -8 4 0 Z" fill="#ffe08a"/></g>';
    return s + '</g>';
  }
  function tanker(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2 + 2) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-200 0 L190 0 L180 30 L-186 30 Z" fill="#26405e" stroke="' + INK + '" stroke-width="2"/><path d="M-198 0 H188 V8 H-196 Z" fill="#c23a26"/><path d="M-170 -6 H130 V0 H-170 Z" fill="#4f8f5a"/>';
    for (var p = 0; p < 7; p++) s += '<path d="M' + (-150 + p * 40) + ' -6 v-8" stroke="#c9ced4" stroke-width="3"/>';
    s += '<rect x="140" y="-44" width="40" height="44" fill="url(#hullW)" stroke="#5a5a5a"/><rect x="150" y="-60" width="16" height="16" fill="#c23a26" stroke="' + INK + '"/>';
    return s + '</g>';
  }
  function refinery(x, y, t) {
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    [[-120, 70, 16], [-90, 100, 20], [-50, 60, 14]].forEach(function (c) { s += '<rect x="' + (c[0] - c[2] / 2) + '" y="' + (-c[1]) + '" width="' + c[2] + '" height="' + c[1] + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.4"/>'; for (var r = 1; r < 5; r++) s += '<path d="M' + (c[0] - c[2] / 2 - 3) + ' ' + (-c[1] * r / 5) + ' h' + (c[2] + 6) + '" stroke="' + INK + '"/>'; });
    for (var k = 0; k < 3; k++) s += '<path d="M' + (-10 + k * 50) + ' 0 v-30 a24 10 0 0 1 48 0 v30 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-150 0 H160" stroke="' + INK + '" stroke-width="3"/><path d="M150 0 V-120" stroke="#5a6068" stroke-width="4"/>';
    var fl = 1 + 0.2 * Math.sin(t * 9); s += '<g transform="translate(150 -122) scale(' + f(fl) + ')"><path d="M0 0 C-10 -8 -7 -22 2 -30 C2 -20 12 -14 7 0 Z" fill="#ff8a2f"/></g>';
    for (var sm = 0; sm < 5; sm++) { var u = (t * 0.3 + sm / 5) % 1; s += '<circle cx="' + f(-90 + Math.sin(u * 4) * 10 + u * 40) + '" cy="' + f(-104 - u * 70) + '" r="' + f(6 + u * 14) + '" fill="#e9e4d8" opacity="' + f(0.5 * (1 - u)) + '"/>'; }
    return s + '</g>';
  }

  // drill bits (photos: Commons tricone + PDC): pin with threads up, cutting face down
  function cone(x, y, rot, flip, spin) {
    var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (flip ? -1 : 1) + ' 1)">';
    s += '<path d="M-46 -40 Q-58 0 -46 40 L30 13 Q42 0 30 -13 Z" fill="url(#cone)" stroke="' + INK + '" stroke-width="2"/>';
    [0.12, 0.42, 0.72].forEach(function (tt, r) { var cx = -46 + 76 * tt, hh = 40 * (1 - tt) + 13 * tt, n = 5 - r, ph = ((spin || 0) * (1.6 + r * 0.6)) % 1;
      s += '<path d="M' + f(cx) + ' ' + f(-hh) + ' Q' + f(cx - 6) + ' 0 ' + f(cx) + ' ' + f(hh) + '" stroke="#2b2e33" stroke-width="1.4" fill="none"/>';
      for (var k = 0; k < n; k++) { var yy = -hh + (2 * hh) * ((k + ph) % n + 0.5) / n; s += '<path d="M' + f(cx - 5) + ' ' + f(yy - 5) + ' L' + f(cx + 7) + ' ' + f(yy) + ' L' + f(cx - 5) + ' ' + f(yy + 5) + ' Z" fill="#dfe3e8" stroke="' + INK + '" stroke-width=".9"/>'; }
      s += '<path d="M' + f(cx - 3) + ' ' + f(-hh - 1) + ' l5 -9 l5 9 Z M' + f(cx - 3) + ' ' + f(hh + 1) + ' l5 9 l5 -9 Z" fill="#dfe3e8" stroke="' + INK + '" stroke-width=".9"/>'; });
    return s + '</g>';
  }
  function threads(y0, n) { var s = '<path d="M-26 ' + y0 + ' H26 L22 ' + (y0 + n * 7 + 4) + ' H-22 Z" fill="url(#bitBody)" stroke="' + INK + '" stroke-width="2"/>'; for (var i = 0; i < n; i++) s += '<path d="M-24 ' + (y0 + 4 + i * 7) + ' L24 ' + (y0 + 8 + i * 7) + '" stroke="#2b2e33" stroke-width="1.6"/>'; return s; }
  function tricone(x, y, t, sc, spin) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (sc || 1) + ')">' + threads(-150, 6) +
      '<path d="M-44 -104 H44 L60 -70 V-20 L36 10 H-36 L-60 -20 V-70 Z" fill="url(#leg)" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -100 L-24 6 M20 -100 L24 6" stroke="#1d4a44" stroke-width="3"/><circle cx="-40" cy="-44" r="6" fill="' + INK + '"/><circle cx="40" cy="-44" r="6" fill="' + INK + '"/>' +
      cone(-46, 40, 48, false, spin) + cone(46, 40, -48, true, spin) + cone(0, 62, 90, false, spin) + '</g>';
  }
  function pdc(x, y, t, sc, ang) {
    var R = 78, yG = -40, D = 86, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (sc || 1) + ')">' + threads(-150, 5);
    s += '<path d="M-40 -110 H40 L' + R + ' -70 V' + yG + ' H' + (-R) + ' V-70 Z" fill="url(#gold)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + (-R) + ' ' + yG + ' A' + R + ' ' + D + ' 0 0 0 ' + R + ' ' + yG + ' Z" fill="#6e5426" stroke="' + INK + '" stroke-width="2"/>';
    var blades = [];
    for (var j = 0; j < 7; j++) { var ph0 = j * 2 * Math.PI / 7 + (ang || 0), pts = [];
      for (var k = 0; k <= 12; k++) { var u = k / 12, ph = ph0 + 0.9 * u, r = R * Math.cos(u * 1.45); pts.push([r * Math.sin(ph), yG + D * Math.sin(u * 1.45) - 6 * Math.cos(ph) * (1 - u), Math.cos(ph), u]); }
      var front = pts.filter(function (p) { return p[2] > -0.05; }); if (front.length < 2) continue;
      blades.push([front.reduce(function (m, p) { return m + p[2]; }, 0) / front.length, front]); }
    blades.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (bl) { var p = bl[1], d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L");
      s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="23" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="url(#gold)" stroke-width="19" stroke-linecap="round" fill="none"/>';
      p.forEach(function (q, i) { if (i % 2 || q[3] > 0.85) return; var rr = 3 + 3.2 * Math.max(0.2, q[2]); s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1] - 3) + '" rx="' + f(rr * (0.45 + 0.55 * Math.max(0, q[2]))) + '" ry="' + f(rr) + '" fill="url(#pdc)" stroke="' + INK + '" stroke-width="1.1"/>'; }); });
    return s + '</g>';
  }
  // BOP stack (photo: yellow frame, annulars + ram blocks inside, red hydraulic hoses). close: 0 open .. 1 rams shut
  function bop(x, y, t, close, o) {
    o = o || {}; var c = clamp(close || 0), s = '<g transform="translate(' + f(x - 320) + ' ' + f(y - 200) + ')">';
    if (o.riser !== false) s += '<rect x="308" y="-300" width="24" height="410" fill="url(#steel)" stroke="' + INK + '"/>' + [-120, -60, 0, 46].map(function (yy) { return '<rect x="292" y="' + yy + '" width="56" height="34" rx="6" fill="#f2c230" stroke="' + INK + '"/><path d="M292 ' + (yy + 17) + ' H348" stroke="#b8901c" stroke-width="2"/>'; }).join("");
    s += '<path d="M332 100 C380 96 400 120 396 150" stroke="#c23a26" stroke-width="4" fill="none"/><path d="M308 100 C262 96 242 124 246 160" stroke="#c23a26" stroke-width="4" fill="none"/>';
    s += '<rect x="296" y="106" width="48" height="16" fill="url(#steel)" stroke="' + INK + '"/>';
    [124, 158].forEach(function (yy) { s += '<path d="M276 ' + (yy + 30) + ' V' + (yy + 12) + ' Q276 ' + yy + ' 296 ' + yy + ' H344 Q364 ' + yy + ' 364 ' + (yy + 12) + ' V' + (yy + 30) + ' Z" fill="url(#steelD)" stroke="' + INK + '" stroke-width="2"/>'; });
    [192, 216, 240, 264].forEach(function (yy, i) { var r = i % 2 ? "url(#steelD)" : "url(#bopRed)", sl = 30 * c * (i === 0 || i === 2 ? 1 : 0.6);
      s += '<rect x="266" y="' + yy + '" width="108" height="20" rx="3" fill="' + r + '" stroke="' + INK + '" stroke-width="2"/>';
      s += '<rect x="' + f(232 + sl) + '" y="' + (yy + 4) + '" width="34" height="12" rx="3" fill="url(#steel)" stroke="' + INK + '"/><rect x="' + f(374 - sl) + '" y="' + (yy + 4) + '" width="34" height="12" rx="3" fill="url(#steel)" stroke="' + INK + '"/>'; });
    s += '<g stroke="' + INK + '" stroke-width="1.5" fill="url(#bopYel)"><rect x="222" y="112" width="12" height="180"/><rect x="406" y="112" width="12" height="180"/><rect x="216" y="104" width="208" height="10"/><rect x="216" y="186" width="208" height="7"/><rect x="210" y="288" width="220" height="10"/></g>';
    s += '<path d="M234 120 L272 184 M406 120 L368 184" stroke="#e2b035" stroke-width="5"/><rect x="300" y="298" width="40" height="12" fill="url(#steel)" stroke="' + INK + '"/>';
    s += '<circle cx="428" cy="150" r="5" fill="' + (c > 0.5 ? "#ff3b2f" : "#5bbf6a") + '" filter="url(#glow)"/>';
    return s + '</g>';
  }
  function rov(x, y, t, s) { return '<g transform="translate(' + f(x + Math.sin(t * 0.9) * 8) + ' ' + f(y + Math.sin(t * 1.3) * 5) + ') scale(' + (s || 1) + ')"><rect x="-40" y="-24" width="80" height="48" rx="8" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><rect x="-36" y="-30" width="72" height="8" fill="#e9e4d8" stroke="' + INK + '"/><circle cx="-40" cy="0" r="7" fill="#fff6c8" filter="url(#glow)"/><path d="M-40 0 L-140 -30 L-140 30 Z" fill="#fff6c8" opacity=".12"/><path d="M-30 24 l-14 14 M-20 24 l-6 16" stroke="#3a3d42" stroke-width="3"/></g>'; }

  // the characters: an oil-drop mascot and an engineer with a hard hat
  function drop(x, y, r, mood, t, o) {
    o = o || {}; var b = Math.sin(t * 3 + x) * r * 0.06, s = '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') rotate(' + f(Math.sin(t * 2 + x) * 4) + ')">';
    s += '<path d="M0 ' + f(-r * 1.6) + ' C' + f(r * 0.5) + ' ' + f(-r * 0.9) + ' ' + f(r) + ' ' + f(-r * 0.4) + ' ' + f(r) + ' ' + f(r * 0.2) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(-r) + ' ' + f(r * 0.2) + ' C' + f(-r) + ' ' + f(-r * 0.4) + ' ' + f(-r * 0.5) + ' ' + f(-r * 0.9) + ' 0 ' + f(-r * 1.6) + ' Z" fill="url(#oilG)" stroke="' + INK + '" stroke-width="' + f(r / 9) + '"/>';
    s += '<ellipse cx="' + f(-r * 0.45) + '" cy="' + f(-r * 0.35) + '" rx="' + f(r * 0.16) + '" ry="' + f(r * 0.3) + '" fill="#fff" opacity=".45"/>';
    s += '<g transform="translate(0 ' + f(r * 0.1) + ')"><circle cx="' + f(-r * 0.34) + '" cy="0" r="' + f(r * 0.24) + '" fill="#fff"/><circle cx="' + f(r * 0.34) + '" cy="0" r="' + f(r * 0.24) + '" fill="#fff"/>';
    var blink = ((t * 0.5 + x * 0.01) % 1) < 0.05, pr = r * (mood === "shock" ? 0.08 : 0.12);
    if (!blink) s += '<circle cx="' + f(-r * 0.3 + (o.look || 0) * r * 0.06) + '" cy="' + f(r * 0.03) + '" r="' + f(pr) + '" fill="' + INK + '"/><circle cx="' + f(r * 0.38 + (o.look || 0) * r * 0.06) + '" cy="' + f(r * 0.03) + '" r="' + f(pr) + '" fill="' + INK + '"/>';
    else s += '<path d="M' + f(-r * 0.5) + ' 0 h' + f(r * 0.3) + ' M' + f(r * 0.2) + ' 0 h' + f(r * 0.3) + '" stroke="' + INK + '" stroke-width="' + f(r / 10) + '"/>';
    s += mood === "happy" ? '<path d="M' + f(-r * 0.3) + ' ' + f(r * 0.42) + ' q' + f(r * 0.3) + ' ' + f(r * 0.3) + ' ' + f(r * 0.6) + ' 0" stroke="#fff" stroke-width="' + f(r / 10) + '" fill="none" stroke-linecap="round"/>' : mood === "shock" ? '<ellipse cx="0" cy="' + f(r * 0.5) + '" rx="' + f(r * 0.12) + '" ry="' + f(r * 0.17) + '" fill="#fff"/>' : '<path d="M' + f(-r * 0.18) + ' ' + f(r * 0.5) + ' h' + f(r * 0.36) + '" stroke="#fff" stroke-width="' + f(r / 11) + '" stroke-linecap="round"/>';
    return s + '</g></g>';
  }
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/><path d="M0 -88 V-54" stroke="#d9d3c4" stroke-width="6"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function carSide(x, y, t, s, col) {   // a family car, side view, wheels turning
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return c + '</g>';
  }
  function fuelGauge(x, y, v) { var a = -1.2 + 2.4 * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-30 0 A30 30 0 0 1 30 0" stroke="#1c1c1c" stroke-width="10" fill="none"/><path d="M-30 0 A30 30 0 0 1 30 0" stroke="#f4f1e8" stroke-width="6" fill="none"/><path d="M0 0 L' + f(Math.sin(a) * 26) + ' ' + f(-Math.cos(a) * 26) + '" stroke="#c23a26" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/><text x="-30" y="14" text-anchor="middle" style="font:700 10px Noto Serif;fill:#f4f1e8">E</text><text x="30" y="14" text-anchor="middle" style="font:700 10px Noto Serif;fill:#f4f1e8">F</text></g>'; }
  function plankton(x, y, s, t, k) { var r = Math.sin(t * 2 + k) * 20; return k % 3 === 0 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><circle r="8" fill="#8fd08a" stroke="#2e6a3a" stroke-width="1.4"/><circle r="4" fill="none" stroke="#2e6a3a"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M0 0 L' + f(Math.cos(i) * 12) + ' ' + f(Math.sin(i) * 12) + '" stroke="#2e6a3a" stroke-width=".8"/>'; }).join("") + '</g>'
    : k % 3 === 1 ? '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><ellipse rx="12" ry="5" fill="#d9e8a0" stroke="#5a6a2a" stroke-width="1.4"/><path d="M-10 0 H10 M-6 -4 V4 M0 -5 V5 M6 -4 V4" stroke="#5a6a2a" stroke-width=".9"/></g>'
    : '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ') scale(' + s + ')"><path d="M0 -8 L7 6 L-7 6 Z" fill="#a8e0d8" stroke="#2a6a6a" stroke-width="1.4"/><circle r="2.4" fill="#2a6a6a"/></g>'; }
  function monitor(x, y, w, h, inner) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2 - 10) + '" y="' + (-h / 2 - 10) + '" width="' + (w + 20) + '" height="' + (h + 20) + '" rx="10" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" fill="url(#screen)"/>' + inner + '<path d="M-20 ' + (h / 2 + 10) + ' L-30 ' + (h / 2 + 40) + ' H30 L20 ' + (h / 2 + 10) + ' Z" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/></g>'; }
  // an isometric slab of rock layers for the computer's 3D image; dome bulges the top layers, glow marks the trap
  function block3d(t, w, rotA, dome, glow) {
    var s = "", n = 5, th = 16, cA = Math.cos(rotA), sA = Math.sin(rotA);
    function P(x, z, y) { var X = x * cA - z * sA, Z = x * sA + z * cA; return [X * 0.9, Z * 0.45 - y]; }
    function hgt(x, z, k) { return (n - k) * th + dome * Math.exp(-(x * x + z * z) / (w * w * 0.18)) * (k < 3 ? 1 : 0.5); }
    var cols = ["#c9b07a", "#5a5f66", "#a98a5c", "#8a7458", "#6f6a62"], N = 8;
    for (var k = n - 1; k >= 0; k--) {
      var front = "", ztop = w / 2;
      for (var i = 0; i <= N; i++) { var x = -w / 2 + w * i / N, p = P(x, ztop, hgt(x, ztop, k)); front += (i ? " L" : "M") + f(p[0]) + " " + f(p[1]); }
      for (var i2 = N; i2 >= 0; i2--) { var x2 = -w / 2 + w * i2 / N, p2 = P(x2, ztop, hgt(x2, ztop, k + 1) - (k === n - 1 ? 0 : 0)); front += " L" + f(p2[0]) + " " + f(p2[1]); }
      s += '<path d="' + front + ' Z" fill="' + cols[k] + '" stroke="#7cf2ff" stroke-width="1" opacity=".95"/>';
    }
    for (var a = 0; a < N; a++) for (var b = 0; b < N; b++) { var x0 = -w / 2 + w * a / N, z0 = -w / 2 + w * b / N, x1 = x0 + w / N, z1 = z0 + w / N, q = [P(x0, z0, hgt(x0, z0, 0)), P(x1, z0, hgt(x1, z0, 0)), P(x1, z1, hgt(x1, z1, 0)), P(x0, z1, hgt(x0, z1, 0))], hh = hgt((x0 + x1) / 2, (z0 + z1) / 2, 0) - n * th;
      s += '<path d="M' + q.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + ' Z" fill="' + (hh > dome * 0.5 ? "#e2c47a" : "#c9b07a") + '" stroke="#7cf2ff" stroke-width=".6" opacity=".9"/>'; }
    if (glow > 0) { var c = P(0, 0, hgt(0, 0, 0)); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1] + 30) + '" rx="' + f(40 * glow) + '" ry="' + f(16 * glow) + '" fill="#ff7a2f" opacity="' + f(0.35 + 0.25 * Math.sin(t * 5)) + '" filter="url(#glow)"/>'; }
    return s;
  }
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  // the well bore through the rock: casing walls, drill pipe inside, bit at the bottom
  function wellbore(t, x, y0, y1, o) {
    o = o || {}; var s = '<rect x="' + (x - 26) + '" y="' + y0 + '" width="52" height="' + (y1 - y0) + '" fill="#3a3024"/><path d="M' + (x - 26) + ' ' + y0 + ' V' + y1 + ' M' + (x + 26) + ' ' + y0 + ' V' + y1 + '" stroke="#8a929c" stroke-width="4"/>';
    s += '<rect x="' + (x - 10) + '" y="' + y0 + '" width="20" height="' + (y1 - y0 - 20) + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var j = y0 + 40; j < y1 - 20; j += 60) s += '<rect x="' + (x - 13) + '" y="' + j + '" width="26" height="8" fill="url(#steelD)" stroke="' + INK + '"/>';
    return s;
  }

  // ── the tunnel boring machine (Mixshield layout: yellow cutterhead, slurry chamber, steel shield, thrust rams, segment erector, backup) ──
  var CLIPN = 0, CONC = "url(#gConc)";
  // side cut-away, digging to the right. x = front of the cutterhead, y = tunnel axis. o: { s, spin, ext 0..1 (rams out), erA (erector angle), rings, backup, airlock, flow, slurry }
  function tbmSide(x, y, t, o) {
    o = o || {}; var R = 60, s = o.s || 1, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    // the tunnel behind: concrete rings, a thin grout band, the dark inside, backup gantries with pipes
    var nR = o.rings == null ? 8 : o.rings, W = 24, tail = -210;
    for (var r = 0; r < nR; r++) { var rx = tail - (r + 1) * W; g += '<rect x="' + rx + '" y="' + (-R - 2) + '" width="' + W + '" height="12" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + rx + '" y="' + (R - 10) + '" width="' + W + '" height="12" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    if (nR > 0) { g += '<rect x="' + (tail - nR * W) + '" y="' + (-R + 10) + '" width="' + (nR * W) + '" height="' + (2 * R - 20) + '" fill="#3a3530"/>';
      if (o.grout) g += '<rect x="' + (tail - nR * W) + '" y="' + (-R - 5) + '" width="' + (nR * W) + '" height="3" fill="#8a8578"/><rect x="' + (tail - nR * W) + '" y="' + (R + 2) + '" width="' + (nR * W) + '" height="3" fill="#8a8578"/>';
      for (var bg = 0; bg < (o.backup || 0); bg++) { var bx = tail - 20 - bg * 70; if (bx < tail - nR * W + 10) break; g += '<path d="M' + bx + ' ' + (R - 10) + ' V' + (-R + 16) + ' H' + (bx - 54) + ' V' + (R - 10) + '" stroke="#e2b035" stroke-width="4" fill="none"/><rect x="' + (bx - 50) + '" y="' + (-R + 22) + '" width="46" height="18" fill="#5a6068" stroke="' + INK + '"/><rect x="' + (bx - 44) + '" y="' + (R - 30) + '" width="34" height="14" fill="' + CONC + '" stroke="' + INK + '"/>'; }
      g += '<path d="M' + (tail - nR * W) + ' ' + (R - 22) + ' H-40" stroke="#9a7048" stroke-width="5"/><path d="M' + (tail - nR * W) + ' ' + (R - 30) + ' H-40" stroke="#5d93ad" stroke-width="5"/>';
      if (o.flow) for (var q = 0; q < 10; q++) { var u = (t * 0.5 + q / 10) % 1; g += '<circle cx="' + f(lerp(-40, tail - nR * W, u)) + '" cy="' + (R - 22) + '" r="2.4" fill="#e9d8a8"/><circle cx="' + f(lerp(tail - nR * W, -40, u)) + '" cy="' + (R - 30) + '" r="2" fill="#cfe6f2"/>'; } }
    // shield: steel skin top + bottom, dark inside
    g += '<rect x="' + tail + '" y="' + (-R + 8) + '" width="' + (-14 - tail) + '" height="' + (2 * R - 16) + '" fill="#2b2f34"/>';
    g += '<rect x="' + tail + '" y="' + (-R) + '" width="' + (-14 - tail) + '" height="10" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + tail + '" y="' + (R - 10) + '" width="' + (-14 - tail) + '" height="10" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.6"/>';
    // excavation chamber full of slurry under pressure, the bulkhead and the airlock door
    g += '<rect x="-44" y="' + (-R + 10) + '" width="30" height="' + (2 * R - 20) + '" fill="url(#gSlurry)"/>'; for (var bb = 0; bb < 6; bb++) { var bu = (t * 0.8 + bb / 6) % 1; g += '<circle cx="' + f(-34 + Math.sin(bb * 2 + t * 3) * 8) + '" cy="' + f(lerp(R - 16, -R + 16, bu)) + '" r="2" fill="#e9d8a8" opacity=".7"/>'; }
    g += '<rect x="-50" y="' + (-R + 10) + '" width="7" height="' + (2 * R - 20) + '" fill="url(#gShield)" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.airlock !== false) g += '<rect x="-74" y="' + (-R + 14) + '" width="24" height="26" rx="4" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-62" cy="' + (-R + 27) + '" r="6" fill="#8fb6cf" stroke="' + INK + '"/>';
    // main drive: motors around the centre
    g += '<rect x="-96" y="-18" width="44" height="36" rx="4" fill="#4f8f5a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-74" cy="0" r="10" fill="#3a6a44" stroke="' + INK + '"/><path d="M-74 0 L' + f(-74 + Math.cos(t * 4) * 9) + ' ' + f(Math.sin(t * 4) * 9) + '" stroke="#e9e4d8" stroke-width="2"/>';
    // thrust rams, top and bottom: cylinder + rod pushing on the last ring
    var ext = clamp(o.ext == null ? 0.5 : o.ext); [-R + 18, R - 26].forEach(function (yy) { g += '<rect x="-160" y="' + yy + '" width="34" height="8" rx="2" fill="url(#gRam)" stroke="' + INK + '"/><rect x="' + f(-160 - 46 * (0.3 + 0.7 * ext)) + '" y="' + (yy + 2) + '" width="' + f(46 * (0.3 + 0.7 * ext)) + '" height="4" fill="#d9dee4" stroke="' + INK + '" stroke-width=".8"/>'; });
    // erector: a rotating arm holding a segment
    var ea = (o.erA == null ? Math.sin(t * 1.2) * 60 : o.erA) * Math.PI / 180; g += '<circle cx="-186" cy="0" r="7" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/><path d="M-186 0 L' + f(-186 + Math.sin(ea) * 6) + ' ' + f(-Math.cos(ea) * 34) + '" stroke="#e2b035" stroke-width="6" stroke-linecap="round"/><rect x="' + f(-198 + Math.sin(ea) * 6) + '" y="' + f(-Math.cos(ea) * 34 - 5) + '" width="24" height="10" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.2"/>';
    // the cutterhead, seen edge-on: thick yellow wheel, disc cutters on the front edge rolling as it turns
    g += '<rect x="-14" y="' + (-R - 2) + '" width="18" height="' + (2 * R + 4) + '" rx="4" fill="url(#gHead)" stroke="' + INK + '" stroke-width="2"/>';
    var sp = (t * (o.spin == null ? 1.2 : o.spin)) % 1; for (var d = 0; d < 9; d++) { var dy = -R + 4 + ((d + sp) % 9) * (2 * R - 8) / 9; g += '<path d="M4 ' + f(dy) + ' a5 5 0 0 1 0 10" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="1.2"/>'; }
    g += '<path d="M4 -6 h8 v12 h-8" fill="#6a727c" stroke="' + INK + '" stroke-width="1.2"/>';
    return g + '</g>';
  }
  // the cutterhead seen from the front: spokes, slurry openings, disc cutters, scrapers on the rim, centre cutter
  function cutterFace(x, y, r, t, o) {
    o = o || {}; var rot = t * (o.rpm == null ? 30 : o.rpm), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r + 8) + '" fill="url(#gShield)" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(' + f(rot) + ')">';
    g += '<circle r="' + r + '" fill="url(#gFace)" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 6; k++) { var a0 = k * 60 + 8, a1 = a0 + 26, p = function (a, rr) { return f(Math.cos(a * Math.PI / 180) * rr) + ' ' + f(Math.sin(a * Math.PI / 180) * rr); }; g += '<path d="M' + p(a0, r * 0.22) + ' L' + p(a0, r * 0.88) + ' A' + f(r * 0.88) + ' ' + f(r * 0.88) + ' 0 0 1 ' + p(a1, r * 0.88) + ' L' + p(a1, r * 0.22) + ' Z" fill="#3a3024" stroke="' + INK + '" stroke-width="2"/>'; }
    for (var s2 = 0; s2 < 6; s2++) { var sa = s2 * 60 + 50; for (var j = 0; j < 5; j++) { var rr = r * (0.3 + j * 0.15), cx = Math.cos(sa * Math.PI / 180) * rr, cy = Math.sin(sa * Math.PI / 180) * rr; g += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 0.055) + '" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="1.4"/>'; } }
    for (var m = 0; m < 24; m++) { var ma = m * 15; g += '<rect x="' + f(r - 6) + '" y="-3" width="8" height="6" fill="#d9dee4" stroke="' + INK + '" stroke-width="1" transform="rotate(' + ma + ')"/>'; }
    g += '<circle r="' + f(r * 0.16) + '" fill="#9a6a10" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(-r * 0.12) + ' 0 H' + f(r * 0.12) + ' M0 ' + f(-r * 0.12) + ' V' + f(r * 0.12) + '" stroke="#d9dee4" stroke-width="3"/>';
    return g + '</g></g>';
  }
  // a ring of nine concrete segments seen along the tunnel; n = how many are in (can be fractional), bolts + gasket
  function ringFront(x, y, r, n, t, o) {
    o = o || {}; var w = r * 0.18, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r + w * 0.4) + '" fill="#8a7458"/><circle r="' + f(r - w) + '" fill="#2b2620"/>';
    for (var k = 0; k < 9; k++) { var p = clamp(n - k); if (p <= 0) continue; var a0 = -90 + k * 40 + 0.8, a1 = a0 + 38.4, fly = (1 - p) * 40;
      function P(a, rr) { return f(Math.cos(a * Math.PI / 180) * rr) + ' ' + f(Math.sin(a * Math.PI / 180) * rr); }
      var mid = (a0 + a1) / 2 * Math.PI / 180, dx = -Math.cos(mid) * fly, dy = -Math.sin(mid) * fly;
      g += '<g transform="translate(' + f(dx) + ' ' + f(dy) + ')"><path d="M' + P(a0, r) + ' A' + r + ' ' + r + ' 0 0 1 ' + P(a1, r) + ' L' + P(a1, r - w) + ' A' + f(r - w) + ' ' + f(r - w) + ' 0 0 0 ' + P(a0, r - w) + ' Z" fill="' + (k === 8 ? "#c9c4b8" : CONC) + '" stroke="' + INK + '" stroke-width="2"/>';
      if (p >= 1 && o.bolts !== false) [a0 + 6, a1 - 6].forEach(function (ba) { g += '<circle cx="' + f(Math.cos(ba * Math.PI / 180) * (r - w / 2)) + '" cy="' + f(Math.sin(ba * Math.PI / 180) * (r - w / 2)) + '" r="' + f(w * 0.12) + '" fill="#3a3d42"/>'; });
      g += '</g>'; }
    if (o.gasket) g += '<circle r="' + f(r - w * 0.5) + '" fill="none" stroke="#1c1c1c" stroke-width="1.6" stroke-dasharray="3 3" opacity=".6"/>';
    return g + '</g>';
  }
  function ground(t, y) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gSoil)"/>' + strata(t, y, { n: 7, th: 52 }); }
  function canal(t, yW, o) {   // the water of the canal with a ship going over, the banks, the sky
    o = o || {}; var s = sky("day") + clouds(t, 10, Math.min(yW - 160, 30), 4, 0.8) + '<rect x="-400" y="' + yW + '" width="1440" height="80" fill="url(#sea1)"/>' + waves(t, yW);
    s += '<path d="M-400 ' + (yW - 4) + ' H' + (o.bankL || 60) + ' L' + ((o.bankL || 60) + 40) + ' ' + (yW + 80) + ' H-400 Z M1040 ' + (yW - 4) + ' H' + (o.bankR || 580) + ' L' + ((o.bankR || 580) - 40) + ' ' + (yW + 80) + ' H1040 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>';
    var sx = ((t * 18) % 1100) - 300; s += tanker(sx, yW + 2, t, { s: 0.55 });
    return s;
  }
  function plant(x, y, t) {   // the separation plant on the surface: shaker screens, cyclones, sand pile, slurry tanks
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    s += '<rect x="-150" y="-60" width="90" height="60" fill="#5d93ad" stroke="' + INK + '" stroke-width="2"/><rect x="-140" y="-74" width="70" height="14" fill="#9a7048" stroke="' + INK + '"/>';
    for (var c = 0; c < 3; c++) s += '<path d="M' + (-40 + c * 26) + ' -110 h18 l-9 40 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="-46" y="-70" width="84" height="12" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6" transform="translate(0 ' + f(Math.sin(t * 20) * 1.2) + ')"/><path d="M-50 -58 V0 M34 -58 V0" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M60 0 Q100 -70 140 0 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>'; for (var g = 0; g < 6; g++) { var u = (t * 0.8 + g / 6) % 1; s += '<circle cx="' + f(lerp(38, 96, u)) + '" cy="' + f(-64 + u * 10 + u * u * 20) + '" r="3" fill="#d9c79a" stroke="#8a7448"/>'; }
    return s + '</g>';
  }
  function hardHat(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s }, o || {})); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  // ── the butane (LPG) cylinder at home: liquid at the bottom, vapour on top feeding the regulator; tilted, the liquid
  // reaches the valve, floods the regulator and hose, flares the flame, frosts the valve, and leaks gas that sinks to the
  // floor. Shapes from safety leaflets and photos of Egyptian 12.5 kg cylinders (../refs/SOURCES.md).
  var BLUE = "#3f6f9f", LIQ = "#e8a83a", GASC = "#9ac7a0", WALL = "#f1e3c6", TILE = "#e6d3ae", RED = "#d8352a";
  function R(x, y, w, h, fill, ex, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (ex || 2) + '"/>'; }
  function T(text, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 900) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function spark(x, y, r, t, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="' + (col || "#ffe46a") + '" opacity=".4" filter="url(#soft2)"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.8 + 0.2 * Math.sin(t * 20 + x))) + '" fill="#fff8d0" stroke="' + (col || "#ffe46a") + '" stroke-width="1.5"/>'; }
  function star(x, y, r, t, col) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2 + t * 2, rr = i % 2 ? r * 0.45 : r * (1 + 0.15 * Math.sin(t * 18 + i)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + ' Z" fill="' + (col || "#ffe46a") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function noSign(x, y, r, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ')"><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="' + f(r * 0.3) + '"/><circle r="' + r + '" fill="none" stroke="' + RED + '" stroke-width="' + f(r * 0.2) + '"/><path d="M' + f(-r * 0.7) + ' ' + f(r * 0.7) + ' L' + f(r * 0.7) + ' ' + f(-r * 0.7) + '" stroke="' + INK + '" stroke-width="' + f(r * 0.3) + '"/><path d="M' + f(-r * 0.7) + ' ' + f(r * 0.7) + ' L' + f(r * 0.7) + ' ' + f(-r * 0.7) + '" stroke="' + RED + '" stroke-width="' + f(r * 0.2) + '"/></g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  // the kitchen: tiled wall, counter, a window; o.night darkens
  function kitchen(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="' + WALL + '"/>';
    for (var y = 40; y < 250; y += 30) for (var x = -400 + ((y / 30) % 2) * 15; x < 1100; x += 30) s += '<rect x="' + x + '" y="' + y + '" width="28" height="28" fill="' + TILE + '" stroke="#d6c096" stroke-width="1"/>';
    if (o.win !== false) { var wx = o.winX == null ? 480 : o.winX; s += '<rect x="' + (wx - 70) + '" y="50" width="140" height="110" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 8, 70, 2, 0.9, 0.4) + '<path d="M' + wx + ' 50 V160 M' + (wx - 70) + ' 105 H' + (wx + 70) + '" stroke="' + INK + '" stroke-width="3"/>'; }
    s += '<rect x="-400" y="250" width="1500" height="20" fill="#b88a5a" stroke="' + INK + '" stroke-width="2.4"/><rect x="-400" y="270" width="1500" height="400" fill="#c9a06e"/>';
    for (var c = -400; c < 1100; c += 120) s += '<rect x="' + (c + 6) + '" y="282" width="108" height="120" rx="4" fill="#d9b483" stroke="#8a6a3a" stroke-width="2"/><circle cx="' + (c + 96) + '" cy="300" r="4" fill="#8a6a3a"/>';
    return s;
  }
  function flame(x, y, sz, t, big) {
    var s = "", n = big ? 5 : 6;
    for (var i = 0; i < n; i++) { var dx = (i - (n - 1) / 2) * sz * 0.45, h = sz * (big ? 2.8 + Math.sin(t * 17 + i * 2) * 0.7 : 1 + Math.sin(t * 13 + i) * 0.18), w = sz * (big ? 0.5 : 0.22);
      s += '<path d="M' + f(x + dx - w) + ' ' + f(y) + ' Q' + f(x + dx - w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + Math.sin(t * 9 + i) * w * 0.6) + ' ' + f(y - h) + ' Q' + f(x + dx + w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + w) + ' ' + f(y) + ' Z" fill="' + (big ? (i % 2 ? "#ffb020" : "#ff6a1a") : "#4a8cff") + '" opacity=".92"/>';
      if (!big) s += '<path d="M' + f(x + dx - w * 0.5) + ' ' + f(y) + ' Q' + f(x + dx) + ' ' + f(y - h * 0.7) + ' ' + f(x + dx + w * 0.5) + ' ' + f(y) + ' Z" fill="#bfe0ff"/>'; }
    return (big ? '<circle cx="' + f(x) + '" cy="' + f(y - sz * 1.6) + '" r="' + f(sz * 2.6) + '" fill="#ffb020" opacity=".35" filter="url(#soft)"/>' : "") + s;
  }
  // a two-burner tabletop stove; fl = flame size per burner (0 = off), big = flare
  function stove(x, y, t, fl, big) {
    var s = R(x - 90, y - 24, 180, 24, "#e9ebee", 2.4, 4) + '<rect x="' + (x - 90) + '" y="' + (y - 30) + '" width="180" height="8" fill="#2b2e33"/>';
    [-45, 45].forEach(function (dx, i) { s += '<ellipse cx="' + (x + dx) + '" cy="' + (y - 30) + '" rx="26" ry="5" fill="#3a3f46"/>' + R(x + dx - 8, y - 18, 16, 12, "#5a6068", 1.4, 3); if (fl) s += flame(x + dx, y - 31, fl, t + i, big); });
    return s;
  }
  // a pot on the stove
  function pot(x, y, t) { var s = '<path d="M' + (x - 34) + ' ' + (y - 46) + ' H' + (x + 34) + ' V' + (y - 8) + ' Q' + x + ' ' + y + ' ' + (x - 34) + ' ' + (y - 8) + ' Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 40) + ' ' + (y - 46) + ' H' + (x + 40) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>'; for (var k = 0; k < 3; k++) { var ph = (t * 0.7 + k / 3) % 1; s += '<path d="M' + (x - 14 + k * 14) + ' ' + f(y - 52 - ph * 50) + ' q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" opacity="' + f(0.8 * (1 - ph)) + '"/>'; } return s; }
  // the cylinder: base centre (x,y), tilt ang (deg, + = to the right), height h; o.xray shows the liquid inside (fill 0..1),
  // o.reg adds the regulator on the valve; o.frost (0..1) ices the valve. Returns svg; the valve tip is valveAt(...)
  function cylinder(x, y, ang, h, t, o) {
    o = o || {}; var w = h * 0.56, r = w * 0.3, top = -h, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">';
    var body = 'M' + f(-w / 2) + ' ' + f(-h * 0.08) + ' V' + f(top + h * 0.2 + r) + ' Q' + f(-w / 2) + ' ' + f(top + h * 0.2) + ' ' + f(-w / 2 + r) + ' ' + f(top + h * 0.14) + ' Q0 ' + f(top + h * 0.06) + ' ' + f(w / 2 - r) + ' ' + f(top + h * 0.14) + ' Q' + f(w / 2) + ' ' + f(top + h * 0.2) + ' ' + f(w / 2) + ' ' + f(top + h * 0.2 + r) + ' V' + f(-h * 0.08) + ' Q0 ' + f(-h * 0.02) + ' ' + f(-w / 2) + ' ' + f(-h * 0.08) + ' Z';
    s += '<path d="M' + f(-w * 0.42) + ' 0 L' + f(-w * 0.38) + ' ' + f(-h * 0.1) + ' H' + f(w * 0.38) + ' L' + f(w * 0.42) + ' 0 Z" fill="#2b3f5a" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.xray) {
      var id = "cy" + (++CLIPN), fill = o.fill == null ? 0.6 : o.fill, hi = -h * 0.08, lo = top + h * 0.1, mid = (hi + lo) / 2, span = hi - lo, sn = Math.abs(Math.sin(ang * Math.PI / 180));
      var off = lerp((0.5 - fill) * span, (0.5 - fill) * w * 1.1, sn), cy = mid;   // liquid surface: horizontal in the world, through the centre + off
      s += '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/>';
      s += '<g clip-path="url(#' + id + ')"><g transform="rotate(' + f(-ang) + ' 0 ' + f(cy) + ')">';
      var lv = cy + off * (Math.cos(ang * Math.PI / 180) >= 0 ? 1 : -1), wv = "M" + f(-h * 2) + " " + f(lv);
      for (var k = 0; k <= 30; k++) { var xx = -h * 2 + k * h * 4 / 30; wv += " L" + f(xx) + " " + f(lv + Math.sin(xx * 0.08 + t * 4) * (2 + (o.slosh || 0) * 6)); }
      s += '<path d="' + wv + ' V' + f(h * 2) + ' H' + f(-h * 2) + ' Z" fill="' + LIQ + '" opacity=".9"/>';
      for (var b = 0; b < (o.boil || 0); b++) { var ph = (t * 0.9 + hash(b)) % 1, bx = (hash(b + 3) - 0.5) * w * 0.7; s += '<circle cx="' + f(bx) + '" cy="' + f(lerp(lv + span * 0.4, lv, ph)) + '" r="' + f(2 + hash(b) * 3) + '" fill="#fff" opacity=".7"/>'; }
      for (var g = 0; g < 8; g++) { var gp = (t * 0.25 + hash(g + 7)) % 1, gx = (hash(g) - 0.5) * w * 0.8; s += '<circle cx="' + f(gx) + '" cy="' + f(lerp(lv - 4, lo - 20, gp)) + '" r="3" fill="' + GASC + '" opacity="' + f(0.8 * Math.sin(gp * Math.PI)) + '"/>'; }
      s += '</g></g><path d="' + body + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    } else {
      s += '<path d="' + body + '" fill="url(#gCyl)" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(-w * 0.3) + ' ' + f(top + h * 0.26) + ' V' + f(-h * 0.16) + '" stroke="#fff" stroke-width="' + f(w * 0.07) + '" opacity=".35" stroke-linecap="round"/>';
      s += '<path d="M' + f(-w / 2) + ' ' + f(-h * 0.45) + ' H' + f(w / 2) + '" stroke="#2b3f5a" stroke-width="3"/>';
    }
    // the collar (handle ring) and the valve
    s += '<path d="M' + f(-w * 0.3) + ' ' + f(top + h * 0.13) + ' V' + f(top + h * 0.02) + ' H' + f(w * 0.3) + ' V' + f(top + h * 0.13) + '" fill="none" stroke="#2b3f5a" stroke-width="' + f(h * 0.035) + '"/><path d="M' + f(-w * 0.18) + ' ' + f(top + h * 0.05) + ' H' + f(w * 0.18) + '" stroke="#2b3f5a" stroke-width="' + f(h * 0.02) + '"/>';
    s += R(-h * 0.045, top + h * 0.03, h * 0.09, h * 0.07, "#d9a53a", 2);
    if (o.reg) { s += '<path d="M' + f(-h * 0.07) + ' ' + f(top + h * 0.03) + ' h' + f(h * 0.14) + ' v' + f(-h * 0.05) + ' q' + f(-h * 0.07) + ' ' + f(-h * 0.06) + ' ' + f(-h * 0.14) + ' 0 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><circle cx="0" cy="' + f(top - h * 0.03) + '" r="' + f(h * 0.035) + '" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/>'; }
    if (o.frost) for (var fz = 0; fz < 10; fz++) { var fa = fz / 10 * Math.PI * 2, fr = h * 0.08 * clamp(o.frost * 1.4 - hash(fz) * 0.4); if (fr > 0) { var fx = Math.cos(fa) * h * 0.06, fy = top + h * 0.06 + Math.sin(fa) * h * 0.05; s += '<path d="M' + f(fx - fr) + ' ' + f(fy) + ' H' + f(fx + fr) + ' M' + f(fx) + ' ' + f(fy - fr) + ' V' + f(fy + fr) + ' M' + f(fx - fr * 0.7) + ' ' + f(fy - fr * 0.7) + ' L' + f(fx + fr * 0.7) + ' ' + f(fy + fr * 0.7) + ' M' + f(fx + fr * 0.7) + ' ' + f(fy - fr * 0.7) + ' L' + f(fx - fr * 0.7) + ' ' + f(fy + fr * 0.7) + '" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'; } }
    return s + '</g>';
  }
  function valveAt(x, y, ang, h, reg) { var a = ang * Math.PI / 180, d = reg ? h * 1.03 : h * 0.97; return [x + Math.sin(a) * d, y - Math.cos(a) * d]; }
  // a hose from a to b sagging; liquid (0..1) shows orange slugs moving along it
  function hose(a, b, t, liq, sag) {
    var c = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + (sag || 60)], d = 'M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(c[0]) + ' ' + f(c[1]) + ' ' + f(b[0]) + ' ' + f(b[1]), s = '<path d="' + d + '" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="#e07a2a" stroke-width="6" fill="none" stroke-linecap="round"/>';
    if (liq) s += '<path d="' + d + '" stroke="' + LIQ + '" stroke-width="5" fill="none" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 60) + '" opacity="' + f(liq) + '"/>';
    return s;
  }
  // a blobby cloud of escaping gas
  function gasCloud(x, y, r, t, op) { var s = '<g opacity="' + f(op == null ? 0.7 : op) + '" filter="url(#soft2)">'; for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2 + t * 0.4; s += '<circle cx="' + f(x + Math.cos(a) * r * 0.5) + '" cy="' + f(y + Math.sin(a) * r * 0.35) + '" r="' + f(r * (0.45 + 0.08 * Math.sin(t * 2 + i))) + '" fill="' + GASC + '"/>'; } return s + '</g>'; }
  // someone at home (round head, shirt, arms); arms: "up" | "tilt" | "point" | "down"
  function person(x, y, s, t, mood, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') scale(' + s + ')">', col = o.col || "#3f8f6f";
    var arm = o.arms === "up" ? "M-46 70 L-80 0 M46 70 L80 0" : o.arms === "tilt" ? "M40 70 L104 60 M-40 76 L60 90" : o.arms === "point" ? "M44 70 L110 40 M-44 80 L-60 140" : "M-46 76 L-60 140 M46 76 L60 140";
    g += '<path d="' + arm + '" stroke="' + INK + '" stroke-width="22" stroke-linecap="round" fill="none"/><path d="' + arm + '" stroke="' + col + '" stroke-width="15" stroke-linecap="round" fill="none"/>';
    g += '<path d="M-56 170 C-60 70 -36 40 0 40 C36 40 60 70 56 170 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -10, 46, mood, t, o.look);
    g += '<path d="M-44 -24 C-40 -70 40 -70 44 -24 C30 -44 -30 -44 -44 -24 Z" fill="#3a2a1e" stroke="' + INK + '" stroke-width="2.4"/>';
    return g + '</g>';
  }
  function lightSwitch(x, y, on, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + R(-22, -32, 44, 64, "#f4f1e8", 2.4, 6) + R(-9, on ? -22 : 0, 18, 22, "#d9d4c8", 1.8, 3) + '</g>'; }
  function matchStick(x, y, ang, t, lit) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"><rect x="-3" y="0" width="6" height="70" fill="#e8c48e" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="6" ry="8" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6"/>' + (lit ? flame(0, -4, 7, t, true) : "") + '</g>'; }
  function gauge(x, y, r, v, t) { var a = lerp(-120, 120, v) + Math.sin(t * 9) * 2, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(Math.cos((-210) * Math.PI / 180) * r * 0.8) + ' ' + f(Math.sin((-210) * Math.PI / 180) * r * 0.8) + ' A' + f(r * 0.8) + ' ' + f(r * 0.8) + ' 0 0 1 ' + f(Math.cos(-150 * Math.PI / 180) * r * 0.8) + ' ' + f(Math.sin(-150 * Math.PI / 180) * r * 0.8) + '" stroke="' + RED + '" stroke-width="5" fill="none"/>'; s += '<path d="M0 0 L' + f(Math.sin(a * Math.PI / 180) * r * 0.75) + ' ' + f(-Math.cos(a * Math.PI / 180) * r * 0.75) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="' + INK + '"/></g>'; return s; }
  function phone(x, y, t) { var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2) * 4) + ')">' + R(-60, -110, 120, 220, "#2b2e33", 3, 16) + '<rect x="-50" y="-96" width="100" height="186" rx="6" fill="#f4efe2"/>'; s += cylinder(0, 40, Math.sin(t * 2) * 25, 90, t, {}) + '<circle cx="0" cy="68" r="0" fill="none"/>'; return s + '</g>'; }
  function windowOpen(x, y, k, t) { var s = '<rect x="' + (x - 70) + '" y="' + (y - 55) + '" width="140" height="110" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 14, y - 40, 2, 0.9, 0.35); var a = lerp(0, 70, ease(k)); s += '<path d="M' + (x - 70) + ' ' + (y - 55) + ' L' + f(x - 70 + 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y - 55 - 14 * Math.sin(a * Math.PI / 180)) + ' L' + f(x - 70 + 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y + 55 + 14 * Math.sin(a * Math.PI / 180)) + ' L' + (x - 70) + ' ' + (y + 55) + ' Z M' + (x + 70) + ' ' + (y - 55) + ' L' + f(x + 70 - 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y - 55 - 14 * Math.sin(a * Math.PI / 180)) + ' L' + f(x + 70 - 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y + 55 + 14 * Math.sin(a * Math.PI / 180)) + ' L' + (x + 70) + ' ' + (y + 55) + ' Z" fill="#d9eef7" fill-opacity=".6" stroke="' + INK + '" stroke-width="3"/>'; for (var w = 0; w < 4; w++) { var ph = (t * 0.8 + w / 4) % 1; s += '<path d="M' + f(x - 60 + ph * 200) + ' ' + f(y - 30 + w * 18) + ' q14 -8 28 0" stroke="#7fb7e0" stroke-width="3" fill="none" opacity="' + f(k * Math.sin(ph * Math.PI)) + '"/>'; } return s; }

  // ── this episode: mixing household bleach (sodium hypochlorite) with acid cleaners or ammonia. Bottle shapes are the
  // common Egyptian supermarket ones: white bleach jug with a handle, angled-neck toilet cleaner, clear vinegar bottle,
  // blue glass-cleaner spray. Chlorine gas is drawn yellow-green and sinks; chloramine is drawn pale green.
  var CL = "#c9d84a", CLD = "#9fb52a", BWALL = "#dcecf2", BTILE = "#c6e0ea", FLOOR = "#9fb4bf";
  function fume(x, y, r, t, op, col) { var s = '<g opacity="' + f(clamp(op == null ? 0.7 : op)) + '" filter="url(#soft2)">'; for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2 + t * 0.4; s += '<circle cx="' + f(x + Math.cos(a) * r * 0.5) + '" cy="' + f(y + Math.sin(a) * r * 0.35) + '" r="' + f(Math.max(0.1, r * (0.45 + 0.08 * Math.sin(t * 2 + i)))) + '" fill="' + (col || CL) + '"/>'; } return s + '</g>'; }
  // the bathroom: tiled wall, floor, toilet, a small high window; o.win false hides the window, o.fan adds an exhaust fan
  function bathroom(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="' + BWALL + '"/>';
    for (var y = 20; y < 280; y += 30) for (var x = -400; x < 1100; x += 30) s += '<rect x="' + x + '" y="' + y + '" width="28" height="28" fill="' + BTILE + '" stroke="#b3d2de" stroke-width="1"/>';
    if (o.win !== false) { var wx = o.winX == null ? 520 : o.winX; s += '<rect x="' + (wx - 45) + '" y="40" width="90" height="60" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 8, 50, 2, 0.9, 0.3) + '<path d="M' + wx + ' 40 V100" stroke="' + INK + '" stroke-width="3"/>'; }
    if (o.fan) { var fx = o.fanX || 120; s += '<circle cx="' + fx + '" cy="70" r="34" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/>'; for (var b = 0; b < 4; b++) { var a = t * (o.fanOn ? 9 : 0.3) + b * Math.PI / 2; s += '<path d="M' + fx + ' 70 L' + f(fx + Math.cos(a) * 28) + ' ' + f(70 + Math.sin(a) * 28) + '" stroke="#8a929c" stroke-width="8" stroke-linecap="round"/>'; } s += '<circle cx="' + fx + '" cy="70" r="5" fill="' + INK + '"/>'; }
    s += '<rect x="-400" y="280" width="1500" height="400" fill="' + FLOOR + '"/>'; for (var g = -400; g < 1100; g += 50) s += '<path d="M' + g + ' 280 L' + (g - 30) + ' 400" stroke="#8aa0ab" stroke-width="1.5"/>';
    if (o.toilet !== false) s += toilet(o.toiletX == null ? 120 : o.toiletX, 280, t);
    return s;
  }
  function toilet(x, y, t) { return '<g transform="translate(' + x + ' ' + y + ')">' + R(-36, -150, 72, 60, "#fbfbf7", 2.4, 6) + '<path d="M-48 -90 H48 Q48 -40 20 -30 L18 0 H-18 L-20 -30 Q-48 -40 -48 -90 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="0" cy="-90" rx="48" ry="9" fill="#e9eef0" stroke="' + INK + '" stroke-width="2"/>' + R(14, -144, 14, 6, "#c9ced4", 1.4, 2) + '</g>'; }
  // bottles. kind: bleach | acid | vinegar | glass. tilt in degrees (pouring to the right), o.pour = 0..1 shows a stream
  function bottle(x, y, s, kind, t, o) {
    o = o || {}; var tilt = o.tilt || 0, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(tilt) + ') scale(' + s + ')">';
    if (kind === "bleach") { g += '<path d="M-34 0 V-90 Q-34 -110 -14 -114 L-10 -128 H12 L14 -114 Q34 -108 34 -90 V0 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.6"/><path d="M14 -100 Q40 -100 38 -70 Q36 -50 30 -50" stroke="' + INK + '" stroke-width="2.6" fill="none"/>' + R(-12, -140, 24, 14, "#2f6fbf", 2.2, 3) + R(-28, -78, 56, 50, "#2f6fbf", 2, 5) + T("كلور", 0, -46, 15, "#fff"); }
    else if (kind === "acid") { g += '<path d="M-28 0 V-92 Q-28 -104 -16 -108 L-4 -112 V-130 L18 -150 L24 -144 L8 -128 V-108 Q28 -104 28 -92 V0 Z" fill="#e2523a" stroke="' + INK + '" stroke-width="2.6"/>' + R(-22, -80, 44, 46, "#fbfbf7", 2, 5) + T("مزيل", 0, -50, 13, "#e2523a"); }
    else if (kind === "vinegar") { g += '<path d="M-20 0 V-86 Q-20 -100 -8 -106 V-130 H8 V-106 Q20 -100 20 -86 V0 Z" fill="#f2e7b8" fill-opacity=".85" stroke="' + INK + '" stroke-width="2.6"/>' + R(-10, -142, 20, 12, "#c23a26", 2, 3) + R(-18, -70, 36, 34, "#fbfbf7", 1.8, 4) + T("خل", 0, -46, 14, "#8a6a1a"); }
    else { g += '<path d="M-24 0 V-86 Q-24 -98 -12 -100 H12 Q24 -98 24 -86 V0 Z" fill="#6fb8e8" stroke="' + INK + '" stroke-width="2.6"/>' + R(-10, -112, 20, 12, "#fbfbf7", 2, 2) + '<path d="M-10 -112 H-14 L-18 -132 H22 L26 -124 H12 V-112" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.2"/><path d="M-4 -112 L-14 -96" stroke="' + INK + '" stroke-width="3"/>' + R(-18, -72, 36, 36, "#fbfbf7", 1.8, 4) + T("نشادر", 0, -48, 11, "#2f6fbf"); }
    g += '</g>';
    if (o.pour > 0) { var a = tilt * Math.PI / 180, mx = x + Math.sin(a) * 130 * s, my = y - Math.cos(a) * 130 * s, len = 120 * clamp(o.pour); var col = kind === "bleach" ? "#e9f4c0" : kind === "acid" ? "#ff8a6a" : kind === "vinegar" ? "#f7efc8" : "#8fd0f7"; g += '<path d="M' + f(mx) + ' ' + f(my) + ' Q' + f(mx + 20) + ' ' + f(my + 10) + ' ' + f(mx + 22 + Math.sin(t * 20) * 2) + ' ' + f(my + len) + '" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M' + f(mx) + ' ' + f(my) + ' Q' + f(mx + 20) + ' ' + f(my + 10) + ' ' + f(mx + 22 + Math.sin(t * 20) * 2) + ' ' + f(my + len) + '" stroke="' + col + '" stroke-width="5" fill="none" stroke-linecap="round"/>'; }
    return g;
  }
  function bucket(x, y, t, liq, bub) { var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-50 -70 L-40 0 H40 L50 -70 Z" fill="#3aa0c8" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="0" cy="-70" rx="50" ry="10" fill="' + (liq || "#e9f4c0") + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-48 -66 Q0 -130 48 -66" stroke="' + INK + '" stroke-width="2.4" fill="none"/>'; for (var i = 0; i < (bub || 0); i++) { var p = (t * 1.5 + i / bub) % 1; s += '<circle cx="' + f(-30 + hash(i) * 60) + '" cy="' + f(-70 - p * 6) + '" r="' + f(2 + p * 4) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - p) + '"/>'; } return s + '</g>'; }
  // atoms with their element letters (Latin, as on any chemistry chart)
  function atom(x, y, r, col, lab) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(x - r * 0.35) + '" cy="' + f(y - r * 0.35) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".6"/><text x="' + f(x) + '" y="' + f(y + r * 0.35) + '" text-anchor="middle" style="font:800 ' + f(r * 0.9) + 'px Noto Sans Arabic;fill:#1c1c1c">' + lab + '</text>'; }
  function bond(x1, y1, x2, y2, w) { return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + INK + '" stroke-width="' + (w || 6) + '" stroke-linecap="round"/>'; }
  function lungs(x, y, s, t, burn) { var b = clamp(burn || 0), col = b > 0 ? "rgb(" + Math.round(lerp(240, 220, b)) + "," + Math.round(lerp(150, 60, b)) + "," + Math.round(lerp(160, 50, b)) + ")" : "#f096a0", br = 1 + 0.05 * Math.sin(t * (2 + b * 6)); var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * br) + ')"><path d="M0 -90 V-30 M0 -30 L-20 -10 M0 -30 L20 -10" stroke="#c9b7a8" stroke-width="12" stroke-linecap="round" fill="none"/>'; g += '<path d="M-14 -50 C-40 -70 -80 -40 -84 10 C-88 60 -60 80 -30 70 C-12 64 -12 30 -14 -50 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/><path d="M14 -50 C40 -70 80 -40 84 10 C88 60 60 80 30 70 C12 64 12 30 14 -50 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>'; if (b > 0.3) for (var i = 0; i < 6; i++) g += '<circle cx="' + f((i % 2 ? 1 : -1) * (30 + hash(i) * 30)) + '" cy="' + f(-20 + hash(i + 3) * 70) + '" r="' + f(4 + 3 * Math.sin(t * 8 + i)) + '" fill="#ffd23a" opacity="' + f(0.5 + 0.4 * Math.sin(t * 10 + i)) + '"/>'; return g + '</g>'; }
  function eyeBig(x, y, s, t, red) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-70 0 Q0 -50 70 0 Q0 50 -70 0 Z" fill="' + (red ? "#ffd6d0" : "#fbfbf7") + '" stroke="' + INK + '" stroke-width="3"/><circle r="24" fill="#6a4a2a" stroke="' + INK + '" stroke-width="2"/><circle r="11" fill="' + INK + '"/><circle cx="-7" cy="-7" r="5" fill="#fff"/>'; if (red) for (var v = 0; v < 5; v++) g += '<path d="M' + (-66 + v * 6) + ' ' + (v - 2) * 4 + ' l18 ' + (v - 2) * 2 + '" stroke="#e2523a" stroke-width="1.6"/>'; for (var k = 0; k < 3; k++) { var p = (t * 0.8 + k / 3) % 1; g += '<path d="M' + (40 + k * 6) + ' ' + f(20 + p * 70) + ' q-6 10 0 14 q6 -4 0 -14 Z" fill="#7fc8f0" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(1 - p) + '"/>'; } return g + '</g>'; }
  function cat(x, y, s, t, mood) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-40 0 Q-46 -40 -10 -40 H30 Q46 -40 40 0 Z" fill="#e8a83a" stroke="' + INK + '" stroke-width="2.6"/><path d="M40 -20 Q70 ' + f(-40 + Math.sin(t * 4) * 12) + ' 60 -60" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M40 -20 Q70 ' + f(-40 + Math.sin(t * 4) * 12) + ' 60 -60" stroke="#e8a83a" stroke-width="5" fill="none" stroke-linecap="round"/>'; g += '<path d="M-56 -50 L-52 -78 L-36 -60 Z M-16 -60 L-6 -78 L-2 -50 Z" fill="#e8a83a" stroke="' + INK + '" stroke-width="2.4"/>' + '<g transform="translate(-30 -46)"><circle r="26" fill="#e8a83a" stroke="' + INK + '" stroke-width="2.6"/>' + eyes(mood || "n", t, 20) + '</g></g>'; return g; }
  function clock(x, y, r, t, sp) { var a = t * (sp || 6), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i < 12; i++) s += '<path d="M' + f(Math.sin(i * Math.PI / 6) * r * 0.75) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.75) + ' L' + f(Math.sin(i * Math.PI / 6) * r * 0.86) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.86) + '" stroke="' + INK + '" stroke-width="2"/>'; return s + '<path d="M0 0 L' + f(Math.sin(a / 12) * r * 0.45) + ' ' + f(-Math.cos(a / 12) * r * 0.45) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(a) * r * 0.7) + ' ' + f(-Math.cos(a) * r * 0.7) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/></g>'; }
  function germ(x, y, r, t, k, dead) { var s = '<g transform="translate(' + f(x + Math.sin(t * 2 + k) * 4) + ' ' + f(y + Math.cos(t * 1.7 + k) * 4) + ') rotate(' + f(t * 30 + k * 40) + ')">'; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<path d="M' + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r) + ' L' + f(Math.cos(a) * r * 1.4) + ' ' + f(Math.sin(a) * r * 1.4) + '" stroke="' + INK + '" stroke-width="2.4"/>'; } return s + '<circle r="' + r + '" fill="' + (dead ? "#b9bfc6" : "#7cc46a") + '" stroke="' + INK + '" stroke-width="2.4"/></g><g transform="translate(' + f(x + Math.sin(t * 2 + k) * 4) + ' ' + f(y + Math.cos(t * 1.7 + k) * 4) + ')">' + eyes(dead ? "dizzy" : "happy", t + k, r * 0.7) + '</g>'; }
  function soldier(x, y, s, t, mood) { var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4 + x) * 2) + ') scale(' + s + ')"><path d="M-40 120 C-44 50 -26 30 0 30 C26 30 44 50 40 120 Z" fill="#6f7a4a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -8, 36, mood, t) + '<path d="M-50 -24 Q0 -70 50 -24 Z" fill="#5a6440" stroke="' + INK + '" stroke-width="3"/></g>'; return g; }
  function ambulance(x, y, t, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + R(-90, -70, 130, 70, "#fbfbf7", 2.6, 6) + '<path d="M40 -50 H72 L94 -24 V0 H40 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.6"/><path d="M48 -44 H70 L84 -26 H48 Z" fill="#bfe3f5" stroke="' + INK + '" stroke-width="2"/>' + R(-90, -30, 184, 10, RED, 1.6, 0) + '<path d="M-36 -58 V-38 M-46 -48 H-26" stroke="' + RED + '" stroke-width="7"/>'; g += R(-20, -82, 30, 12, Math.sin(t * 14) > 0 ? "#ff3b2f" : "#2f6fbf", 2, 3); [-60, 60].forEach(function (wx) { g += '<g transform="translate(' + wx + ' 2) rotate(' + f(t * 300) + ')"><circle r="16" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><path d="M-10 0 H10 M0 -10 V10" stroke="#c9ced4" stroke-width="3"/></g>'; }); return g + '</g>'; }
  function door(x, y, k) { var w = lerp(90, 30, ease(clamp(k))); return '<rect x="' + (x - 50) + '" y="' + (y - 190) + '" width="100" height="190" fill="#3a2a1e" stroke="' + INK + '" stroke-width="3"/><rect x="' + (x - 46) + '" y="' + (y - 186) + '" width="92" height="186" fill="#fbe9b8" opacity=".7"/><path d="M' + (x - 46) + ' ' + (y - 186) + ' L' + f(x - 46 + w) + ' ' + f(y - 186 - (90 - w) * 0.2) + ' V' + f(y + (90 - w) * 0.2) + ' L' + (x - 46) + ' ' + y + ' Z" fill="#b88a5a" stroke="' + INK + '" stroke-width="3"/>'; }
  function scale2(x, y, t, tiltK) { var a = -14 * clamp(tiltK) + Math.sin(t * 3) * 1.5, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-14 120 H14 L6 0 H-6 Z" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2"/>' + R(-60, 116, 120, 14, "#8a929c", 2, 4) + '<g transform="rotate(' + f(-a) + ')"><path d="M-160 0 H160" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'; [-1, 1].forEach(function (sd) { var px = sd * 150, ca = a * Math.PI / 180; s += '<g transform="rotate(' + f(a) + ' ' + px + ' 0)"><path d="M' + px + ' 0 L' + (px - 40) + ' 70 M' + px + ' 0 L' + (px + 40) + ' 70" stroke="' + INK + '" stroke-width="2"/><path d="M' + (px - 54) + ' 70 H' + (px + 54) + ' Q' + px + ' 100 ' + (px - 54) + ' 70 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/></g>'; }); return s + '</g><circle r="9" fill="' + INK + '"/></g>'; }
  function kettle(x, y, t) { var s = '<g transform="translate(' + x + ' ' + y + ')"><path d="M-40 0 Q-50 -60 0 -64 Q50 -60 40 0 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.6"/><path d="M40 -30 L70 -56" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-20 -70 Q0 -96 20 -70" stroke="' + INK + '" stroke-width="5" fill="none"/></g>'; for (var k = 0; k < 4; k++) { var p = (t * 0.8 + k / 4) % 1; s += '<path d="M' + f(x + 72 + Math.sin(p * 6 + k) * 6) + ' ' + f(y - 60 - p * 70) + ' q8 -10 0 -20" stroke="#fff" stroke-width="5" fill="none" opacity="' + f(1 - p) + '"/>'; } return s; }
  function tap(x, y, t, on) { var s = R(x - 50, y - 12, 60, 18, "#c9ced4", 2.4, 6) + R(x - 60, y - 30, 20, 36, "#c9ced4", 2.4, 4); if (on) for (var k = 0; k < 6; k++) { var p = (t * 2 + k / 6) % 1; s += '<circle cx="' + f(x + 2 + Math.sin(k) * 3) + '" cy="' + f(y + 8 + p * 120) + '" r="5" fill="#7fc8f0" stroke="' + INK + '" stroke-width="1"/>'; } return s; }
  function bg(col) { return '<rect x="-400" y="-300" width="1500" height="1000" fill="' + col + '"/>'; }
  function sinkClouds(t, g, n) { var s = ""; for (var k = 0; k < n; k++) { var p = clamp(g * 1.4 - k * 0.06), x = -100 + k * 100 + Math.sin(t + k) * 20; s += fume(x, lerp(110, 270, ease(p)), 46, t + k, 0.6); } return s; }

  // 0 — stop! if you're cleaning the bathroom with bleach, never pour another cleaner on it
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(260, 340, k), lerp(180, 190, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var pr = clamp((u - 0.8) / 1.0), s = bathroom(t) + bucket(300, 290, t, "#e9f4c0", 3) + bottle(380, 230, 0.75, "acid", t, { tilt: 40 * ease(clamp((u - 0.4) / 0.8)) + Math.sin(t * 5) * 2, pour: pr * 0.6 });
    s += bottle(210, 290, 0.8, "bleach", t) + person(520, 170, 0.52, t, "curious", { arms: "point", look: -1 }) + noSign(330, 120, 56, (u - 1.6) / 1.2);
    return s + tag("أوعى!", 480, 60, u, 0.1, 3, 34, "#f2a0a0") + tag("منظف تاني", 300, 340, u, 2.0, -3, 22);
  });
  // 1 — many mix to clean stronger, and that mix can release a poison gas in seconds
  shot(1, function (u, d) { var k = ease(clamp(u / d)); return [lerp(360, 280, k), lerp(200, 170, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var g = clamp((u - 1.2) / 1.6), s = bathroom(t) + bucket(300, 290, t, "#d9e88a", 8) + fume(300, lerp(220, 150, g), lerp(10, 110, g), t, 0.75 * g);
    s += person(520, 170, 0.5, t, g > 0.3 ? "shock" : "happy", { arms: g > 0.3 ? "up" : "down", look: -1 });
    return s + tag("أقوى؟", 200, 70, u, 0.3, -3, 26) + tag("غاز سام!", 330, 60, u, 1.8, 3, 30, "#f2a0a0") + clock(560, 300, 26, t, 12);
  });
  // 2 — brand
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), lerp(200, 170, k), lerp(0.95, 1.15, k)]; }, function (u, d, t) {
    return bathroom(t) + bottle(260, 290, 0.9 + 0.03 * Math.sin(t * 4), "bleach", t) + bottle(400, 290, 0.85, "acid", t, { tilt: Math.sin(t * 3) * 6 }) + qmark(170, 140, t, 60) + qmark(490, 120, t + 1, 54) + tag("إيه الحكاية؟", 330, 60, u, 0.1, -3, 30);
  });
  // 3 — household bleach is sodium hypochlorite dissolved in water
  shot(3, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(160, 190, k), lerp(1.3, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#1f2a38") + bottle(200, 300, 1.4, "bleach", t), k = pop(clamp((u - 0.8) / 1.2));
    if (k > 0) s += '<g transform="translate(460 170) scale(' + f(k) + ')">' + bond(-70, 0, 0, 0) + bond(0, 0, 70, 0) + atom(-70, Math.sin(t * 3) * 4, 30, "#b48ae0", "Na") + atom(0, Math.sin(t * 3 + 1) * 4, 26, "#e2523a", "O") + atom(70, Math.sin(t * 3 + 2) * 4, 32, CL, "Cl") + '</g>';
    for (var w = 0; w < 10; w++) { var p = (t * 0.3 + w / 10) % 1; s += '<circle cx="' + f(360 + hash(w) * 220) + '" cy="' + f(320 - p * 260) + '" r="5" fill="#7fc8f0" opacity="' + f(Math.sin(p * Math.PI) * 0.7) + '"/>'; }
    return s + tag("هيبوكلوريت الصوديوم", 460, 70, u, 0.6, -3, 18) + tag("+ مية", 460, 290, u, 2.2, 3, 22, "#bfe0ff");
  });
  // 4 — that molecule holds the chlorine inside it; it bleaches and kills germs
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 180, lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#1f2a38") + '<g transform="translate(200 180)">' + bond(-60, 0, 0, 0) + bond(0, 0, 60, 0) + atom(-60, 0, 28, "#b48ae0", "Na") + atom(0, 0, 24, "#e2523a", "O") + atom(60, 0, 30, CL, "Cl") + '<circle cx="60" cy="0" r="' + f(44 + 3 * Math.sin(t * 5)) + '" fill="none" stroke="#f2c230" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="' + f(t * 20) + '"/></g>';
    for (var g = 0; g < 4; g++) s += germ(420 + (g % 2) * 90, 120 + Math.floor(g / 2) * 110, 20, t, g, u > 1.6 + g * 0.3);
    return s + tag("ماسكاه", 200, 90, u, 0.3, -3, 24) + tag("بتموّت الجراثيم", 470, 320, u, 1.6, 3, 20, "#bfe8c0");
  });
  // 5 — and if you put something acidic on it: descaler, toilet cleaner, even vinegar?
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), lerp(200, 180, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t, { win: false, toilet: false }) + bottle(110, 290, 0.9, "bleach", t);
    [["acid", 280, 0.6], ["acid", 400, 1.4], ["vinegar", 530, 2.2]].forEach(function (b, i) { var k2 = pop(clamp((u - b[2]) / 0.8)); if (k2 > 0) s += bottle(b[1], 290, 0.85 * k2, b[0], t, { tilt: Math.sin(t * 3 + i) * 4 }); });
    return s + T("+", 195, 210, 50, "#f2c230") + tag("حمضي", 400, 60, u, 0.4, 3, 26, "#f2a0a0") + tag("حتى الخل!", 530, 340, u, 2.4, -3, 20);
  });
  // 6 — the acid breaks that hold and the chlorine leaves free into the air as a gas
  shot(6, function (u, d) { var k = ease(clamp(u / d)); return [lerp(260, 360, k), lerp(200, 160, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var hk = clamp((u - 0.3) / 1.0), br = clamp((u - 1.3) / 1.4), s = bg("#1f2a38");
    s += '<g transform="translate(220 230)">' + bond(-60, 0, 0, 0) + (br < 0.1 ? bond(0, 0, 60, 0) : "") + atom(-60, 0, 26, "#b48ae0", "Na") + atom(0, 0, 22, "#e2523a", "O") + '</g>';
    s += atom(lerp(80, 205, hk), lerp(80, 205, hk), 16, "#fbfbf7", "H");
    var cx = 280 + br * 160, cy = 230 - br * 160; s += atom(cx + Math.sin(t * 8) * 3, cy, 28, CL, "Cl") + atom(cx + 52 + Math.sin(t * 8) * 3, cy - 6, 28, CL, "Cl") + bond(cx + 20, cy, cx + 32, cy - 4, 5) + fume(cx + 26, cy, 60 * br, t, 0.45 * br);
    if (br > 0.05) s += '<circle cx="250" cy="230" r="' + f(30 + 30 * br) + '" fill="none" stroke="#f2c230" stroke-width="3" opacity="' + f(1 - br) + '"/>';
    return s + tag("الحمض", 110, 60, u, 0.2, -3, 22, "#f2a0a0") + tag("كلور حر!", 470, 320, u, 1.8, 3, 26, CL);
  });
  // 7 — a yellow-green gas; its very name comes from the Greek for pale green
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), lerp(190, 170, k), lerp(1.15, 0.95, k)]; }, function (u, d, t) {
    var s = bg("#2a3442") + fume(320, 190, 150 + 10 * Math.sin(t * 2), t, 0.8) + fume(160, 230, 80, t + 2, 0.6) + fume(500, 220, 90, t + 4, 0.6);
    var k2 = pop(clamp((u - 1.6) / 1.0)); if (k2 > 0) s += '<g transform="translate(320 190) scale(' + f(k2) + ')">' + R(-120, -40, 240, 80, "#fbf6e4", 3, 10) + '<text x="0" y="12" text-anchor="middle" style="font:800 40px Georgia,serif;fill:#6f8a1a">χλωρός</text></g>';
    return s + tag("أصفر مخضر", 160, 60, u, 0.3, -3, 26, CL) + tag("أخضر فاتح", 470, 330, u, 2.4, 3, 22, "#bfe8c0");
  });
  // 8 — with an ammonia cleaner (some glass cleaners) another gas comes out: chloramine
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(200, 180, k), lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var g = clamp((u - 1.4) / 1.6), s = bathroom(t, { toilet: false }) + bucket(320, 290, t, "#cfe8d0", 6) + bottle(170, 290, 0.8, "bleach", t);
    s += bottle(440, 240, 0.8, "glass", t, { tilt: 35 * ease(clamp((u - 0.4) / 0.8)), pour: clamp((u - 0.9) / 0.8) * 0.5 }) + fume(320, lerp(220, 150, g), lerp(10, 100, g), t, 0.6 * g, "#bfe8c0");
    return s + tag("نشادر", 470, 70, u, 0.3, 3, 24, "#bfe0ff") + tag("كلورامين", 300, 60, u, 2.2, -3, 26, "#bfe8c0");
  });
  // 9 — that one also burns the eyes, the throat and the chest
  shot(9, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 340, k), lerp(170, 190, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#2a3442") + fume(320, 180, 220, t, 0.35, "#bfe8c0") + person(320, 150, 0.75, t, "worry", { arms: "up", col: "#3f6f9f" });
    [[290, 100], [350, 100]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + f(p[1] + 30) + '" r="' + f(8 + 3 * Math.sin(t * 9)) + '" fill="#ff6a4a" opacity=".5" filter="url(#soft2)"/>'; });
    return s + tag("العين", 140, 80, u, 0.3, -3, 22, "#f2a0a0") + tag("الزور", 500, 120, u, 1.2, 3, 22, "#f2a0a0") + tag("الصدر", 150, 290, u, 2.1, -3, 22, "#f2a0a0");
  });
  // 10 — when you breathe it, it meets the water in your lungs and eyes and makes acids
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 180, lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#1f2a38") + lungs(220, 200, 1.3, t, clamp((u - 1.4) / 2)) + eyeBig(500, 140, 0.9, t, u > 1.4);
    for (var k = 0; k < 6; k++) { var p = (t * 0.6 + k / 6) % 1; s += fume(lerp(-60, 200, p), lerp(40 + k * 10, 120, p), 18, t + k, 0.6 * Math.sin(p * Math.PI)); }
    return s + tag("كلور + مية", 220, 330, u, 0.4, -3, 20, CL) + tag("= أحماض", 500, 260, u, 1.8, 3, 24, "#f2a0a0");
  });
  // 11 — it burns the lung from inside; the cough and tears are your body calling for help
  shot(11, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 340, k), lerp(170, 190, k), lerp(1.3, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#2a3442") + lungs(170, 200, 1.1, t, 1) + person(470, 150, 0.6, t, "worry", { arms: "down", col: "#3f6f9f" });
    for (var c = 0; c < 3; c++) { var p = (t * 1.4 + c / 3) % 1; s += '<path d="M' + f(420 - p * 60) + ' ' + (140 + c * 14) + ' q-10 -6 -20 0" stroke="#fbfbf7" stroke-width="4" fill="none" opacity="' + f(1 - p) + '"/>'; }
    for (var q = 0; q < 2; q++) { var pq = (t * 0.9 + q / 2) % 1; s += '<path d="M' + (452 + q * 36) + ' ' + f(150 + pq * 50) + ' q-5 8 0 11 q5 -3 0 -11 Z" fill="#7fc8f0" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - pq) + '"/>'; }
    return s + tag("بيحرق من جوه", 170, 50, u, 0.3, -3, 22, "#f2a0a0") + tag("كحة ودموع", 470, 320, u, 1.6, 3, 22, "#bfe0ff");
  });
  // 12 — worse: you may feel fine, and hours later your breathing gets heavy
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), lerp(200, 180, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var late = u > d * 0.55, s = bg(late ? "#2a3442" : "#f4efe2") + person(late ? 450 : 190, 160, 0.6, t, late ? "worry" : "happy", { arms: "down", col: "#3f6f9f" }) + clock(320, 120, 50, t, 3 + u * 6);
    s += arrow(250, 220, 390, 220, "#f2c230", 5, clamp((u - 0.8) * 1.2));
    return s + tag("كويس!", 190, 330, u, 0.3, -3, 24, "#bfe8c0") + tag("بعد كام ساعة", 320, 40, u, 1.2, 3, 22) + (late ? tag("نفسك يتقل", 450, 330, u, d * 0.55, 3, 22, "#f2a0a0") : "");
  });
  // 13 — the gas is two and a half times heavier than air, so it sinks to the floor
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), lerp(170, 200, k), lerp(1.05, 1.0, k)]; }, function (u, d, t) {
    var tk = clamp((u - 0.5) / 1.4), s = bg("#f4efe2") + scale2(320, 150, t, tk);
    s += fume(170, lerp(140, 205, tk), 50, t, 0.85) + T("Cl₂", 170, lerp(146, 211, tk), 20, "#fff") + '<g opacity=".6">' + fume(470, lerp(140, 75, tk), 40, t + 2, 0.4, "#d9eef7") + '</g>' + T("هوا", 470, lerp(146, 81, tk), 18, "#2f6fbf");
    return s + tag("× ٢٫٥", 170, 330, u, 1.6, -3, 30, "#f2a0a0") + tag("أتقل من الهوا", 470, 330, u, 0.6, 3, 20);
  });
  // 14 — a bathroom is a small room, so the gas collects fast
  shot(14, function (u, d) { var k = ease(clamp(u / d)); return [lerp(260, 360, k), lerp(170, 200, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var g = clamp(u / (d - 0.3)), s = bathroom(t, { win: false }) + '<rect x="40" y="40" width="44" height="30" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + bucket(330, 290, t, "#d9e88a", 6) + sinkClouds(t, g, 9);
    return s + tag("أوضة صغيرة", 420, 60, u, 0.3, 3, 24) + tag("بيتجمع بسرعة", 300, 340, u, 1.6, -3, 20, CL);
  });
  // 15 — kids and cats are closest to the floor, so they're the first to get hurt
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(220, 200, k), lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t, { toilet: false }) + person(220, 220, 0.42, t, "worry", { arms: "down", col: "#e2b035" }) + cat(460, 300, 0.8, t, "worry");
    for (var k2 = 0; k2 < 7; k2++) s += fume(-60 + k2 * 120 + Math.sin(t + k2) * 20, 270 + Math.sin(t * 1.3 + k2) * 6, 60, t + k2, 0.55);
    return s + tag("الأطفال", 200, 70, u, 0.3, -3, 24, "#f2a0a0") + tag("والقطط", 460, 150, u, 1.0, 3, 24, "#f2a0a0") + tag("أقرب للأرض", 330, 340, u, 1.8, -3, 20);
  });
  // 16 — this very gas was used as a weapon in the First World War
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(200, 420, k), lerp(200, 180, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 10, 20, 3, 0.6) + '<rect x="-400" y="250" width="1500" height="400" fill="#6a5a40"/>';
    for (var w = 0; w < 12; w++) s += '<path d="M' + (-300 + w * 120) + ' 250 l20 -18 l20 18 l20 -18 l20 18" stroke="#3a3024" stroke-width="2" fill="none"/>';
    for (var k2 = 0; k2 < 6; k2++) { var x = -200 + k2 * 90 + u * 40; s += fume(x, 220 - Math.sin(k2) * 20, 90, t + k2, 0.7); }
    s += soldier(470, 190, 0.6, t, "shock") + soldier(560, 200, 0.55, t + 1, "worry");
    return s + tag("سلاح!", 450, 50, u, 0.6, 3, 30, "#f2a0a0") + tag("الحرب العالمية الأولى", 220, 330, u, 1.4, -3, 18);
  });
  // 17 — in 1915, over 150 tonnes of it were released on soldiers in Belgium
  shot(17, function (u, d) { var k = ease(clamp(u / d)); return [lerp(260, 380, k), lerp(170, 190, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#3a3530") + '<rect x="-400" y="260" width="1500" height="400" fill="#5a4a34"/>';
    for (var c = 0; c < 8; c++) { var cx = 40 + c * 60, rl = clamp((u - 0.4 - c * 0.12) * 2); s += R(cx - 14, 220, 28, 40, "#6a6f62", 2, 6) + R(cx - 4, 210, 8, 12, "#3a3d42", 1.6, 2); if (rl > 0) s += fume(cx + 30 * rl, 210 - 30 * rl, 20 + 30 * rl, t + c, 0.6 * rl); }
    var n = Math.floor(lerp(0, 150, ease(clamp((u - 0.4) / 2.2)))); s += T(n + "+ طن", 470, 140, 46, CL);
    return s + tag("١٩١٥", 140, 60, u, 0.2, -3, 30) + tag("بلجيكا", 470, 330, u, 1.6, 3, 24);
  });
  // 18 — and the mix doesn't even clean better: the chlorine is lost in the gas and its strength drops
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#f4efe2") + bucket(180, 300, t, "#d9e88a", 6) + fume(180, 170, 70, t, 0.55) + gauge(470, 170, 70, lerp(0.85, 0.15, clamp((u - 0.4) / (d - 0.6))), t);
    for (var g = 0; g < 3; g++) s += germ(80 + g * 70, 90 + (g % 2) * 30, 14, t, g + 4, false);
    return s + tag("مش بتنضف أحسن!", 200, 340, u, 0.3, -3, 20, "#f2a0a0") + tag("مفعوله يضعف", 470, 300, u, 1.6, 3, 22);
  });
  // 19 — the right way: use one cleaner and rinse well with water before the next
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), lerp(190, 180, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t, { toilet: false, win: false }) + bottle(130, 290, 0.85, "bleach", t) + check(130, 80, 1.0, (u - 0.3) / 1.0);
    s += tap(330, 120, t, u > 1.0) + bucket(320, 290, t, "#bfe3f5", 0) + arrow(200, 200, 260, 200, "#3aa05a", 4, clamp((u - 0.8) * 2)) + arrow(400, 200, 460, 200, "#3aa05a", 4, clamp((u - 2.0) * 2)) + bottle(530, 290, 0.8, "acid", t);
    return s + tag("منظف واحد", 130, 340, u, 0.3, -3, 22, "#bfe8c0") + tag("اشطف بمية", 330, 50, u, 1.2, 3, 22, "#bfe0ff") + tag("وبعدين التاني", 530, 340, u, 2.2, -3, 18);
  });
  // 20 — open the window or switch on the extractor fan while you clean, and never put bleach in hot water
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(200, 420, k), lerp(180, 190, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t, { win: false, fan: true, fanOn: u > 0.5, fanX: 120, toilet: false }) + windowOpen(330, 110, clamp((u - 0.8) / 1.0), t);
    s += kettle(520, 290, t) + bottle(450, 290, 0.6, "bleach", t) + cross(520, 160, 0.9, (u - 2.0) / 1.0);
    return s + tag("شغّل الشفاط", 120, 160, u, 0.4, -3, 18, "#bfe0ff") + tag("افتح الشباك", 330, 220, u, 1.0, 3, 18, "#bfe0ff") + tag("مش مية سخنة", 500, 340, u, 2.2, -3, 18, "#f2a0a0");
  });
  // 21 — if you smell strong bleach or your eyes water, get out at once and leave the door open
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(220, 400, k), lerp(190, 180, k), lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var go = clamp((u - 1.0) / (d - 1.2)), s = bathroom(t, { toilet: false, win: false }) + door(470, 280, clamp((u - 0.8) / 0.8)) + fume(200, 230, 120, t, 0.5);
    s += person(lerp(220, 560, ease(go)), 160 + Math.abs(Math.sin(t * 8)) * -6 * (go > 0 && go < 1 ? 1 : 0), 0.5, t, go > 0.9 ? "happy" : "worry", { arms: "down", col: "#3f6f9f", look: 1 });
    return s + tag("ريحة جامدة؟", 180, 60, u, 0.2, -3, 22, "#f2a0a0") + tag("اطلع برا!", 470, 50, u, 1.0, 3, 26, "#bfe8c0") + tag("سيب الباب مفتوح", 330, 340, u, 2.2, -3, 18);
  });
  // 22 — wash your eyes and skin with lots of water; if breathing gets heavy, call the ambulance on 123
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), lerp(180, 190, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#dcecf2") + tap(190, 80, t, true) + person(190, 200, 0.5, t, "worry", { arms: "up", col: "#3f6f9f" }) + phone(470, 170, t) + T("123", 470, 160, 40, "#fff");
    if (u > d * 0.5) s += ambulance(470 + lerp(300, 0, ease(clamp((u - d * 0.5) / 1.0))), 330, t, 0.7);
    return s + tag("مية كتير", 190, 330, u, 0.3, -3, 22, "#bfe0ff") + tag("الإسعاف", 470, 40, u, 1.4, 3, 24, "#f2a0a0");
  });
  // 23 — the bathroom can become the most dangerous room in the house, all from two bottles side by side
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [lerp(380, 320, k), lerp(150, 180, k), lerp(1.4, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t) + bottle(290, 290, 0.9, "bleach", t) + bottle(370, 290, 0.85, "acid", t, { tilt: Math.sin(t * 2) * 3 }) + '<circle cx="330" cy="210" r="' + f(110 + 6 * Math.sin(t * 4)) + '" fill="none" stroke="' + RED + '" stroke-width="5" stroke-dasharray="14 8" stroke-dashoffset="' + f(t * 30) + '"/>';
    return s + tag("أخطر أوضة؟", 330, 50, u, 0.4, -3, 28, "#f2a0a0") + tag("إزازتين جنب بعض", 330, 340, u, 1.6, 3, 20);
  });
  // 24 — share this with your family, it might save a home
  shot(24, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(200, 170, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var s = bg("#f4efe2") + phone(320, 180, t);
    [[120, 260, "#c23a26"], [520, 260, "#2f6f9f"], [90, 110, "#e2b035"], [550, 110, "#3aa05a"]].forEach(function (p, i) { var k2 = clamp((u - 0.4 - i * 0.3) * 2); if (k2 > 0) s += person(p[0], p[1] - 40, 0.32 * pop(k2), t + i, "happy", { col: p[2] }) + arrow(260, 180, lerp(260, p[0] + (p[0] < 320 ? 40 : -40), k2), lerp(180, p[1] - 40, k2), "#f2c230", 3, k2); });
    for (var h = 0; h < 5; h++) { var ph = (t * 0.5 + h / 5) % 1; s += '<path transform="translate(' + f(250 + h * 35) + ' ' + f(300 - ph * 120) + ') scale(.8)" d="M0 6 C-10 -4 -10 -12 0 -6 C10 -12 10 -4 0 6 Z" fill="#e2523a" opacity="' + f(1 - ph) + '"/>'; }
    return s + tag("شارك مع أهلك", 320, 40, u, 0.3, -3, 24);
  });
  // 25 — outro
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(190, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    return bathroom(t, { fan: true, fanOn: true, fanX: 120 }) + bottle(330, 290, 0.9, "bleach", t) + check(330, 110, 1.0, (u - 0.3) / 1.0) + tag("قولولنا!", 470, 70, u, 0.4, 3, 30);
  });

  window.__parts = { bathroom: bathroom, toilet: toilet, bottle: bottle, bucket: bucket, fume: fume, atom: atom, bond: bond, lungs: lungs, eyeBig: eyeBig, cat: cat, person: person, soldier: soldier, noSign: noSign, check: check, cross: cross, star: star, spark: spark, tag: tag, hardHat: hardHat, T: T, R: R };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
