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
  // ── a back-garden fallout shelter in cross-section: a buried corrugated steel pipe under ~90 cm of earth, an entrance with
  // ── «تعمل طيارة إزاي؟»: a narrow-body twin-jet airliner built part by part (A320-family proportions, ../refs/SOURCES.md).
  // One build in three views that all take the same parts: planeSide (profile, cut open when needed), planeTop (from
  // above: wingspan, ailerons, fuel tanks, flaps) and planeFront (nose on: roll and wing bending). World scale ≈ 12.8 px/m.
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function G(x, y, rot, sc, inner) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + (sc || 1) + ')">' + inner + '</g>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  var COLS = ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a", "#9a5fb0", "#e8742e", "#5aa0c0", "#d06a8a", "#8aa040", "#c08a4a"];
  var BLUE = "#2f5f9f", BODY = "url(#gPlane)";
  // the parts built by the end of shot n
  function PT(n) { return { wing: n >= 2, eng: n >= 5, tail: n >= 7, ail: n >= 9, fuel: n >= 11, press: n >= 14, flap: n >= 16, brake: n >= 18, windows: n >= 22, seats: n >= 22, cockpit: n >= 22 }; }
  function fan(x, y, ry, t, spin) { var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(ry * 0.36) + '" ry="' + f(ry) + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/>'; for (var b = 0; b < 6; b++) { var a = t * (spin || 0) * 9 + b * Math.PI / 3; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * ry * 0.3) + ' ' + f(y + Math.sin(a) * ry * 0.85) + '" stroke="#9aa2ac" stroke-width="2"/>'; } return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(ry * 0.22) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function wheel(x, y, r, t, roll, brake) { var a = t * (roll || 0) * 4, s = (brake ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.7) + '" fill="#ff5a2a" opacity="' + f(0.35 + 0.25 * Math.sin(t * 20)) + '" filter="url(#glow)"/>' : "") + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.5) + '" fill="' + (brake ? "#ff6a3a" : "#9aa2ac") + '" stroke="' + INK + '" stroke-width="1.2"/>'; for (var k = 0; k < 3; k++) { var b = a + k * 2.09; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(b) * r * 0.5) + ' ' + f(y + Math.sin(b) * r * 0.5) + '" stroke="' + INK + '" stroke-width="1.4"/>'; } return s; }

  // side view, nose to the right; o: parts, cut (cabin open), n/mood (people inside), spin (fan), thrust, rev (reverser),
  // flap 0..1, gear (wheels down), roll (wheel turn speed), brake, stopped (engines dead)
  function planeSide(t, o) {
    o = o || {}; var p = o.parts || {}, s = "";
    if (p.tail) s += '<path d="M-150 -22 L-208 -116 L-236 -116 L-244 -20 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-200 -100 L-232 -100" stroke="#fff" stroke-width="3" opacity=".5"/><path d="M-224 -114 L-233 -24" stroke="#1d3f6f" stroke-width="1.4"/><path d="M-190 -60 C-200 -50 -212 -50 -220 -58" stroke="#f2c230" stroke-width="5" fill="none" opacity=".9"/><circle cx="-238" cy="-110" r="2.4" fill="#fff" opacity="' + (Math.sin(t * 9) > 0.8 ? 1 : 0.2) + '"/><path d="M-178 -12 L-246 -16 L-250 -9 L-186 -6 Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/>';
    var body = "M-160 -25 H195 C228 -25 246 -8 249 6 C246 18 230 25 200 25 H-150 C-190 22 -225 6 -246 -14 L-246 -20 C-226 -25 -196 -25 -160 -25 Z";
    if (!o.nobody) {
      s += '<path d="' + body + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
      [-120, -70, -20, 30, 80, 130, 172].forEach(function (x) { s += '<path d="M' + x + ' -24 V24" stroke="#9aa2ac" stroke-width=".8" opacity=".7"/>'; });
      s += '<path d="M-200 -16 C-120 -22 120 -22 238 -12" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>';
      s += '<path d="M-70 23 Q0 36 80 23" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.8"/>';
      if (!o.cut) s += '<path d="M176 -18 h10 v26 h-10 Z M-140 -18 h10 v26 h-10 Z M-4 -14 h8 v14 h-8 Z M12 -14 h8 v14 h-8 Z" fill="none" stroke="#7a828c" stroke-width="1.2"/>';
      s += '<ellipse cx="-246" cy="-17" rx="2" ry="3" fill="#3a3d42"/><path d="M100 -25 l4 -7 l3 0 l-2 7" fill="#5a6068"/><path d="M150 25 v5" stroke="#5a6068" stroke-width="2"/>';
      var bl = Math.sin(t * 7) > 0.6 ? 1 : 0.25; s += '<circle cx="20" cy="-26" r="3" fill="#ff3a2a" opacity="' + bl + '"/><circle cx="40" cy="29" r="3" fill="#ff3a2a" opacity="' + bl + '"/>' + (bl > 0.5 ? '<circle cx="20" cy="-26" r="8" fill="#ff3a2a" opacity=".35" filter="url(#glow)"/>' : "");
    }
    if (p.windows) s += '<path d="M-200 3 H230" stroke="' + BLUE + '" stroke-width="5" opacity=".85"/>';
    if (o.cut) {
      s += '<path d="M-150 -19 H190 C212 -19 222 -8 222 0 V12 C222 16 214 19 200 19 H-150 C-165 19 -172 12 -172 0 C-172 -12 -165 -19 -150 -19 Z" fill="' + (p.press ? "#cfe8f7" : "#3a4660") + '" stroke="' + INK + '" stroke-width="2"/>' + R(-170, 12, 390, 5, "#8a7a6a", 1.4);
      if (p.seats) for (var sx = -150; sx < 190; sx += 22) s += '<path d="M' + sx + ' 12 V-2 q4 -2 5 0 V6 H' + (sx + 12) + ' V12" fill="' + (sx % 44 ? "#c23a26" : "#2f6f9f") + '" stroke="' + INK + '" stroke-width="1.2"/>';
      for (var i = 0; i < (o.n || 0); i++) { var px = -130 + i * (300 / Math.max(1, (o.n || 1) - 1)); s += mini(px, 12, 0.32, COLS[i % 10], t + i, o.mood || "happy"); }
    } else if (p.windows) for (var wx = -150; wx < 186; wx += 12) s += '<ellipse cx="' + wx + '" cy="-7" rx="2.8" ry="3.6" fill="#2b3a52" stroke="' + INK + '" stroke-width=".8"/>';
    if (p.cockpit) s += '<path d="M206 -13 L226 -13 L236 -4 L210 -4 Z" fill="#2b3a52" stroke="' + INK + '" stroke-width="1.6"/>' + (o.cut ? head(214, -6, 6, o.pmood || "happy", t) : "");
    if (p.wing) {
      var fk = clamp(o.flap || 0); if (p.flap && fk > 0) s += '<path d="M-14 26 L-80 32 L-84 ' + f(37 + 10 * fk) + ' L-16 ' + f(31 + 10 * fk) + ' Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2" transform="translate(' + f(-12 * fk) + ' 0)"/>';
      s += '<path d="M72 16 L-12 20 L-98 30 L-92 35 L-8 28 L74 23 Z" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.2"/><path d="M70 19 L-90 31" stroke="#9aa2ac" stroke-width="1"/>';
      s += '<path d="M-92 32 L-101 13 L-106 13 L-99 34 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var ft = 0; ft < 3; ft++) { var fx = -20 - ft * 24; s += '<path d="M' + fx + ' ' + (28 + ft * 2) + ' q-10 6 -22 3" stroke="' + INK + '" stroke-width="1.2" fill="#c9ced4"/>'; }
    }
    if (p.eng) {
      s += '<path d="M84 22 L40 22 L46 32 L96 32 Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.6"/>';
      var rv = o.rev ? 10 : 0;
      s += '<path d="M100 31 C104 31 106 37 106 43 C106 49 104 55 100 55 H66 V31 Z" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.2"/>';
      s += '<path d="M' + (66 - rv) + ' 32 H' + (66 - rv) + ' L' + (42 - rv) + ' 36 V50 L' + (66 - rv) + ' 54 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M' + (42 - rv) + ' 37 L' + (30 - rv) + ' 43 L' + (42 - rv) + ' 49 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>';
      if (rv) { s += '<path d="M56 32 h' + (10 - rv) + ' M56 54 h' + (10 - rv) + '" stroke="#3a3d42" stroke-width="3"/>'; for (var a = 0; a < 3; a++) { var q = (t * 2.5 + a / 3) % 1; s += arrow(58, 30 - a * 2, 58 + 34 * q + 6, 14 - 22 * q, "#bfe0ff", 3, 1) + arrow(58, 56 + a * 2, 58 + 34 * q + 6, 70 + 22 * q, "#bfe0ff", 3, 1); } }
      s += '<path d="M84 32 V54" stroke="#9aa2ac" stroke-width="1.2"/><path d="M70 36 H98" stroke="#fff" stroke-width="2.4" opacity=".7"/><path d="M103 31 C107 33 108 53 103 55" stroke="#9aa2ac" stroke-width="3" fill="none"/>';
      s += fan(104, 43, 11, t, o.stopped ? 0.02 : (o.spin == null ? 1 : o.spin));
      if (o.thrust) for (var k = 0; k < 6; k++) { var u = (t * 2.2 + k / 6) % 1; s += '<path d="M' + f(28 - rv - u * 120) + ' ' + f(43 + Math.sin(k * 2 + t * 9) * 5) + ' h-22" stroke="#ffd9a0" stroke-width="' + f(4 * (1 - u)) + '" stroke-linecap="round" opacity="' + f(0.9 * (1 - u)) + '"/>'; }
      if (o.stopped) for (var m = 0; m < 4; m++) { var v = (t * 0.7 + m / 4) % 1; s += '<circle cx="' + f(30 - v * 50) + '" cy="' + f(43 - v * 30) + '" r="' + f(4 + v * 10) + '" fill="#6a6a6a" opacity="' + f(0.5 * (1 - v)) + '"/>'; }
    }
    if (o.gear) s += '<path d="M-6 24 V58 M206 22 V58" stroke="' + INK + '" stroke-width="5"/><path d="M-6 24 V58 M206 22 V58" stroke="#c9ced4" stroke-width="2.4"/><path d="M-6 36 l8 6 l-8 6 M206 34 l-6 5 l6 5" stroke="' + INK + '" stroke-width="1.6" fill="none"/><path d="M212 40 h6" stroke="#5a6068" stroke-width="4"/><circle cx="220" cy="40" r="7" fill="#fff6c8" opacity=".55" filter="url(#glow)"/>' + wheel(-12, 62, 9, t, o.roll, o.brake) + wheel(4, 62, 9, t, o.roll, o.brake) + wheel(206, 63, 7, t, o.roll, 0);
    return s;
  }
  // top view, nose to the right; o: parts, ail (-1..1 roll command), fuel 0..1, flap 0..1, spin
  function planeTop(t, o) {
    o = o || {}; var p = o.parts || {}, s = "", fu = o.fuel == null ? (p.fuel ? 1 : 0) : o.fuel;
    function wpt(sg, k, te) { var le = [lerp(60, -47, k), lerp(25, 229, k) * sg], tr = [lerp(-25, -67, k), lerp(25, 229, k) * sg]; return te ? tr : le; }
    function poly(ps) { return "M" + ps.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + " Z"; }
    if (p.tail) [1, -1].forEach(function (sg) { s += '<path d="M-188 ' + 18 * sg + ' L-222 ' + 82 * sg + ' L-238 ' + 82 * sg + ' L-230 ' + 16 * sg + ' Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/>'; });
    if (p.wing) [1, -1].forEach(function (sg) {
      var fk = clamp(o.flap || 0);
      if (p.flap && fk > 0) s += '<path d="' + poly([wpt(sg, 0.05, 1), wpt(sg, 0.68, 1), [wpt(sg, 0.68, 1)[0] - 16 * fk, wpt(sg, 0.68, 1)[1]], [wpt(sg, 0.05, 1)[0] - 16 * fk, wpt(sg, 0.05, 1)[1]]]) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
      [0.25, 0.45, 0.62].forEach(function (k) { var q = wpt(sg, k, 1); s += '<ellipse cx="' + f(q[0] - 8) + '" cy="' + f(q[1]) + '" rx="12" ry="3.4" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/>'; });
      s += '<path d="' + poly([wpt(sg, 0, 0), wpt(sg, 1, 0), wpt(sg, 1, 1), wpt(sg, 0, 1)]) + '" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.4"/>';
      var l0 = wpt(sg, 0.08, 0), l1 = wpt(sg, 0.98, 0); s += '<path d="M' + f(l0[0] - 6) + ' ' + f(l0[1]) + ' L' + f(l1[0] - 5) + ' ' + f(l1[1]) + '" stroke="#9aa2ac" stroke-width="1.2"/>';
      [0.3, 0.55, 0.8].forEach(function (k) { var a = wpt(sg, k, 0), b = wpt(sg, k, 1); s += '<path d="M' + f(a[0] - 6) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#c9ced4" stroke-width="1"/>'; });
      var tp = wpt(sg, 1, 0), tq = wpt(sg, 1, 1); s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' L' + f(tq[0]) + ' ' + f(tq[1]) + ' L' + f(tq[0] - 4) + ' ' + f(tq[1] + 4 * sg) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/>';
      var nl = Math.sin(t * 8 + sg) > 0.7; s += '<circle cx="' + f(tp[0] - 4) + '" cy="' + f(tp[1] + 2 * sg) + '" r="3.4" fill="' + (sg > 0 ? "#3aa05a" : "#d8352a") + '"/>' + (nl ? '<circle cx="' + f(tp[0] - 4) + '" cy="' + f(tp[1] + 2 * sg) + '" r="9" fill="#fff" opacity=".6" filter="url(#glow)"/>' : "");
      if (fu > 0) { var kk = 0.92 * clamp(fu), wob = Math.sin(t * 5 + sg) * 0.015; s += '<path d="' + poly([wpt(sg, 0.02, 0), wpt(sg, kk + wob, 0), wpt(sg, kk - wob, 1), wpt(sg, 0.02, 1)]).replace(/^M/, "M") + '" fill="#f2a93b" opacity=".85" transform="translate(-4 0) scale(1 1)"/>'; }
      if (p.ail) { var aa = (o.ail || 0) * sg, A = wpt(sg, 0.72, 1), B = wpt(sg, 0.95, 1); s += '<path d="' + poly([A, B, [B[0] - 9, B[1]], [A[0] - 9, A[1]]]) + '" fill="' + (aa > 0.05 ? "#3aa05a" : aa < -0.05 ? "#d8352a" : "#f2c230") + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
    });
    s += '<ellipse cx="10" cy="0" rx="78" ry="30" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.6" opacity=".9"/><path d="M249 0 C247 -15 230 -25 200 -25 H-160 C-200 -24 -232 -12 -250 -3 V3 C-232 12 -200 24 -160 25 H200 C230 25 247 15 249 0 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
    [-120, -70, -20, 30, 80, 130, 175].forEach(function (x) { s += '<path d="M' + x + ' -24 V24" stroke="#9aa2ac" stroke-width=".8" opacity=".7"/>'; });
    s += '<path d="M-200 -6 H230" stroke="#fff" stroke-width="4" opacity=".55"/>';
    if (p.tail) [1, -1].forEach(function (sg) { s += '<path d="M-226 ' + 22 * sg + ' L-232 ' + 78 * sg + '" stroke="#9aa2ac" stroke-width="1.4"/>'; });
    if (p.tail) s += '<path d="M-176 0 H-248" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round"/>';
    if (p.cockpit) s += '<path d="M222 -10 Q236 0 222 10" stroke="#2b3a52" stroke-width="5" fill="none"/>';
    if (p.eng) [1, -1].forEach(function (sg) { s += R(10, 73 * sg - 5, 40, 10, "#d9dee4", 1.6) + R(30, 73 * sg - 13, 66, 26, "#e9ebee", 2.2, 9) + '<path d="M70 ' + (73 * sg - 12) + ' V' + (73 * sg + 12) + '" stroke="#9aa2ac" stroke-width="1.2"/><path d="M30 ' + (73 * sg - 7) + ' L18 ' + (73 * sg) + ' L30 ' + (73 * sg + 7) + ' Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.4"/>' + '<path d="M96 ' + (73 * sg - 11) + ' V' + (73 * sg + 11) + '" stroke="' + INK + '" stroke-width="4"/>'; });
    return s;
  }
  // nose-on view; o: parts, roll (deg), ail (-1..1), bend (0..1 extra tip bend), spin
  function planeFront(t, o) {
    o = o || {}; var p = o.parts || {}, s = "", b = (o.bend || 0) * 46;
    if (p.tail) s += R(-4, -118, 8, 96, BLUE, 2) + '<path d="M-84 -14 L84 -14" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M-84 -14 L84 -14" stroke="#d9dee4" stroke-width="3" stroke-linecap="round"/>';
    [1, -1].forEach(function (sg) {
      var tipY = -8 - b, d = "M" + 20 * sg + " 10 Q" + 130 * sg + " " + f(4 - b * 0.15) + " " + 229 * sg + " " + f(tipY) + " L" + 229 * sg + " " + f(tipY + 5) + " Q" + 130 * sg + " " + f(10 - b * 0.15) + " " + 20 * sg + " 18 Z";
      s += '<path d="' + d + '" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<path d="M' + 227 * sg + ' ' + f(tipY + 4) + ' L' + 233 * sg + ' ' + f(tipY - 22) + ' L' + 236 * sg + ' ' + f(tipY - 22) + ' L' + 232 * sg + ' ' + f(tipY + 5) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>' + '<circle cx="' + 226 * sg + '" cy="' + f(tipY + 3) + '" r="3" fill="' + (sg > 0 ? "#d8352a" : "#3aa05a") + '"/>';
      if (p.fuel && o.fuelArrows) for (var k = 0; k < 3; k++) { var x = (70 + k * 50) * sg, y = 10 - b * 0.15 * (k + 1) / 3; s += arrow(x, y + 6, x, y + 30, "#f2a93b", 3, clamp(o.fuelArrows)); }
      if (p.ail) { var aa = (o.ail || 0) * sg, x0 = 166 * sg, x1 = 218 * sg, yy = tipY + 10 - 10 * ((166 - 20) / 209); s += '<path d="M' + x0 + ' ' + f(yy) + ' L' + x1 + ' ' + f(tipY + 4) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + x0 + ' ' + f(yy) + ' L' + x1 + ' ' + f(tipY + 4) + '" stroke="' + (aa > 0.05 ? "#3aa05a" : aa < -0.05 ? "#d8352a" : "#f2c230") + '" stroke-width="4" stroke-linecap="round" transform="translate(0 ' + f(-aa * 8) + ')"/>'; }
      if (p.eng) s += R(73 * sg - 3, 14, 6, 12, "#c9ced4", 1.4) + '<circle cx="' + 73 * sg + '" cy="34" r="14" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.2"/>' + '<circle cx="' + 73 * sg + '" cy="34" r="10" fill="#2b2e33"/>' + '<circle cx="' + 73 * sg + '" cy="34" r="3" fill="#c9ced4"/>' + '<path d="M' + f(73 * sg + Math.cos(t * 9) * 9) + ' ' + f(34 + Math.sin(t * 9) * 9) + ' L' + f(73 * sg - Math.cos(t * 9) * 9) + ' ' + f(34 - Math.sin(t * 9) * 9) + '" stroke="#9aa2ac" stroke-width="2"/>';
    });
    s += '<circle r="25" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
    if (p.cockpit) s += '<path d="M-14 -8 H14 L10 -2 H-10 Z" fill="#2b3a52" stroke="' + INK + '" stroke-width="1.4"/>';
    return G(0, 0, o.roll || 0, 1, s);
  }
  // backgrounds
  // far fields far below, for shots in the air
  function fields(t, y, sp) { var s = '<rect x="-600" y="' + y + '" width="1900" height="500" fill="#8aa86a"/>', off = (t * sp) % 160;
    for (var i = 0; i < 26; i++) for (var r = 0; r < 3; r++) { var x = -600 + i * 80 - off * (1 + r * 0.4) + hash(i + r * 9) * 30, yy = y + 6 + r * 26; s += '<rect x="' + f(x) + '" y="' + f(yy) + '" width="' + f(50 + hash(i * 3 + r) * 40) + '" height="' + (12 + r * 6) + '" fill="' + ["#a7b874", "#c9b07a", "#6f9548", "#b8c48a"][(i + r) % 4] + '" opacity=".9"/>'; }
    for (var k = 0; k < 6; k++) { var x2 = ((-t * sp * 1.4 + k * 260) % 1560 + 1560) % 1560 - 600; s += '<path d="M' + f(x2) + ' ' + (y + 30) + ' q40 -10 80 4 t80 -2" stroke="#7fb7e0" stroke-width="3" fill="none" opacity=".8"/>'; }
    return s + '<rect x="-600" y="' + (y - 14) + '" width="1900" height="40" fill="#cfe1ec" opacity=".55" filter="url(#soft)"/>'; }
  function skyBG(t, kind, sp, o) { o = o || {}; var s = sky(kind) + (kind === "night" ? stars(t) : "") + clouds(t, sp * 0.4, -60, 4, 0.6, 1.6);
    if (kind === "day" && !o.noground) s += fields(t, 330, sp * 0.3);
    return s + clouds(t, sp, -10, 5, 0.85, 1.2) + clouds(t, sp * 1.8, 240, 4, 0.75, 1.4) + (o.birds ? birds(t, 40, 40) : ""); }
  // airport pieces: terminal with jet bridges, control tower, hangar, fuel truck, baggage tug, windsock, runway lights
  function terminal(x, y, t) { var s = R(x, y - 46, 300, 46, "#e9e4d8", 2.2) + '<path d="M' + (x - 8) + ' ' + (y - 46) + ' Q' + (x + 150) + ' ' + (y - 76) + ' ' + (x + 308) + ' ' + (y - 46) + ' Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x + 8) + '" y="' + (y - 40) + '" width="284" height="22" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="1.4"/>'; for (var k = 0; k < 18; k++) s += '<path d="M' + (x + 8 + k * 16) + ' ' + (y - 40) + ' v22" stroke="#5d93ad" stroke-width="1"/>';
    for (var b = 0; b < 3; b++) { var bx = x + 40 + b * 100; s += R(bx, y - 18, 10, 14, "#c9ced4", 1.4) + R(bx - 4, y - 8, 46, 8, "#d9d4c8", 1.4) + R(bx + 36, y - 12, 12, 16, "#9aa2ac", 1.4) + '<path d="M' + (bx + 40) + ' ' + (y + 4) + ' v8" stroke="' + INK + '" stroke-width="2"/>'; }
    for (var w = 0; w < 6; w++) s += '<circle cx="' + f(x + 20 + w * 50 + Math.sin(t + w) * 3) + '" cy="' + (y - 26) + '" r="2.4" fill="#2b2016" opacity=".6"/>';
    return s + T("مطار", x + 150, y - 52, 13, "#f2c230"); }
  function tower(x, y, t) { var s = '<path d="M' + (x - 8) + ' ' + y + ' L' + (x - 5) + ' ' + (y - 110) + ' H' + (x + 5) + ' L' + (x + 8) + ' ' + y + ' Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + (x - 22) + ' ' + (y - 110) + ' L' + (x - 16) + ' ' + (y - 132) + ' H' + (x + 16) + ' L' + (x + 22) + ' ' + (y - 110) + ' Z" fill="#3a8a8a" stroke="' + INK + '" stroke-width="2"/>' + R(x - 24, y - 136, 48, 6, "#5a6068", 1.6) + '<path d="M' + x + ' ' + (y - 136) + ' v-14" stroke="' + INK + '" stroke-width="2"/>';
    return s + '<circle cx="' + x + '" cy="' + (y - 151) + '" r="3" fill="#ff3a2a" opacity="' + (Math.sin(t * 5) > 0 ? 1 : 0.3) + '"/>'; }
  function hangar(x, y) { var s = '<path d="M' + x + ' ' + y + ' V' + (y - 40) + ' Q' + (x + 90) + ' ' + (y - 90) + ' ' + (x + 180) + ' ' + (y - 40) + ' V' + y + ' Z" fill="#b9c1c9" stroke="' + INK + '" stroke-width="2.2"/>'; for (var k = 1; k < 9; k++) s += '<path d="M' + (x + k * 20) + ' ' + y + ' V' + f(y - 40 - 46 * Math.sin(Math.PI * k / 9)) + '" stroke="#9aa2ac" stroke-width="1.2"/>'; return s + R(x + 30, y - 34, 120, 34, "#5a6068", 1.6) + '<path d="M' + (x + 90) + ' ' + (y - 34) + ' v34" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function fuelTruck(x, y, t) { return G(x, y, 0, 1, R(-30, -18, 44, 16, "#e9e4d8", 1.6, 6) + R(14, -20, 16, 18, "#d8352a", 1.6, 3) + R(18, -17, 9, 7, "#8fc2da", 1) + '<circle cx="-20" cy="0" r="5" fill="#2b2e33"/><circle cx="-4" cy="0" r="5" fill="#2b2e33"/><circle cx="22" cy="0" r="5" fill="#2b2e33"/>' + T("وقود", -8, -6, 8, "#d8352a")); }
  function tug(x, y, t) { var s = R(0, -12, 18, 10, "#f2c230", 1.4, 3) + '<circle cx="4" cy="0" r="3.4" fill="#2b2e33"/><circle cx="14" cy="0" r="3.4" fill="#2b2e33"/>'; for (var c = 0; c < 3; c++) s += R(-22 - c * 22, -14, 18, 12, ["#2f6f9f", "#c23a26", "#3aa05a"][c], 1.2, 2) + '<circle cx="' + (-18 - c * 22) + '" cy="0" r="3" fill="#2b2e33"/><circle cx="' + (-8 - c * 22) + '" cy="0" r="3" fill="#2b2e33"/>'; return G(x, y, 0, 1, s); }
  function windsock(x, y, t) { var w = Math.sin(t * 4) * 4; return '<path d="M' + x + ' ' + y + ' v-40" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + x + ' ' + (y - 40) + ' L' + (x - 30) + ' ' + f(y - 36 + w) + ' L' + (x - 30) + ' ' + f(y - 30 + w) + ' L' + x + ' ' + (y - 30) + ' Z" fill="#ff7a2f" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 10) + ' ' + f(y - 39 + w / 3) + ' v8 M' + (x - 20) + ' ' + f(y - 38 + w / 1.5) + ' v8" stroke="#fff" stroke-width="3"/>'; }
  function airport(t, sp, y, o) {
    o = o || {}; var s = sky(o.sky || "day") + '<path d="M-600 ' + (y - 70) + ' L-420 ' + (y - 150) + ' L-250 ' + (y - 90) + ' L-80 ' + (y - 170) + ' L120 ' + (y - 95) + ' L320 ' + (y - 160) + ' L520 ' + (y - 100) + ' L760 ' + (y - 175) + ' L1000 ' + (y - 90) + ' L1300 ' + (y - 150) + ' V' + y + ' H-600 Z" fill="#a9b8c8" opacity=".7"/>';
    s += clouds(t, 10 + sp * 0.05, -20, 4, 0.85) + city(t, y - 60, 60, "#9fb0bf", "#fff6c8", 3);
    s += '<rect x="-600" y="' + (y - 64) + '" width="1900" height="400" fill="url(#grass-day)"/>' + '<rect x="-600" y="' + (y - 62) + '" width="1900" height="40" fill="#b9b4aa"/>';
    var P = 1500, po = ((-t * sp * 0.35) % P + P) % P - 600;
    for (var r = 0; r < 2; r++) { var ox = po + r * P - P / 2; s += hangar(ox - 260, y - 22) + terminal(ox + 0, y - 22, t) + tower(ox + 380, y - 22, t) + hangar(ox + 470, y - 22) + fuelTruck(ox + 690, y - 26, t) + terminal(ox + 760, y - 22, t); }
    s += tug(((t * 30) % 1600) - 600, y - 26, t);
    s += R(-600, y, 1900, 46, "url(#gAsphalt)", 0);
    var off = (t * sp) % 80; for (var x = -600 - off; x < 1300; x += 80) s += '<rect x="' + f(x) + '" y="' + (y + 21) + '" width="40" height="4" fill="#f4f1e8"/>';
    s += '<path d="M-600 ' + (y + 2) + ' H1300 M-600 ' + (y + 44) + ' H1300" stroke="#f4f1e8" stroke-width="2"/>';
    var lo = (t * sp) % 60; for (var lx = -600 - lo; lx < 1300; lx += 60) { var on = Math.sin(t * 6 + lx * 0.05) > 0; s += '<circle cx="' + f(lx) + '" cy="' + (y - 2) + '" r="2.4" fill="' + (on ? "#fff6a0" : "#c9b06a") + '"/><circle cx="' + f(lx + 30) + '" cy="' + (y + 49) + '" r="2.4" fill="' + (on ? "#fff6a0" : "#c9b06a") + '"/>'; }
    var wo = ((-t * sp) % 1800 + 1800) % 1800 - 600; s += windsock(wo, y + 100, t) + windsock(wo + 900, y + 100, t);
    for (var g = 0; g < 50; g++) { var gx = ((hash(g) * 1900 - t * sp * 1.2) % 1900 + 1900) % 1900 - 600, gy = y + 56 + hash(g + 4) * 70; s += '<path d="M' + f(gx) + ' ' + f(gy) + ' q2 -6 4 -10" stroke="#5a7a38" stroke-width="1.6" fill="none"/>'; }
    return s;
  }
  function speedo(x, y, r, v, max, text) { var a = -2.4 + 4.8 * clamp(v / max), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#f4f1e8" stroke-width="3"/>'; for (var k = 0; k <= 8; k++) { var b = -2.4 + 4.8 * k / 8; s += '<path d="M' + f(Math.sin(b) * r * 0.78) + ' ' + f(-Math.cos(b) * r * 0.78) + ' L' + f(Math.sin(b) * r * 0.92) + ' ' + f(-Math.cos(b) * r * 0.92) + '" stroke="#f4f1e8" stroke-width="2"/>'; } return s + '<path d="M0 0 L' + f(Math.sin(a) * r * 0.8) + ' ' + f(-Math.cos(a) * r * 0.8) + '" stroke="#f2c230" stroke-width="4" stroke-linecap="round"/><circle r="4" fill="#f2c230"/>' + (text ? T(text, 0, r * 0.62, r * 0.36, "#f2c230") : "") + '</g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  // a guy with cardboard wings strapped to his arms
  function birdman(x, y, s, t, mood, flap) { var a = Math.sin(t * (flap || 6)) * 30, w = function (sg) { return '<g transform="rotate(' + f(sg * a) + ' 0 -26)"><path d="M0 -28 L' + 70 * sg + ' ' + f(-40) + ' L' + 64 * sg + ' -14 L0 -18 Z" fill="#c9a46a" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + 20 * sg + ' -30 L' + 24 * sg + ' -18 M' + 40 * sg + ' -34 L' + 42 * sg + ' -17" stroke="#8a6a3a" stroke-width="2"/></g>'; }; return G(x, y, Math.sin(t * 2) * 4, s, w(1) + w(-1) + '<rect x="-14" y="-38" width="28" height="38" rx="8" fill="#e8742e" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood, t)); }
  function arrowShaft(x, y, rot, feathers) { var s = '<path d="M-60 0 H50" stroke="#8a5a2a" stroke-width="5"/><path d="M50 -8 L68 0 L50 8 Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>'; if (feathers) s += '<path d="M-60 0 L-74 -12 L-50 -12 L-40 0 Z M-60 0 L-74 12 L-50 12 L-40 0 Z" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/>'; return G(x, y, rot, 1, s); }
  function paperPlane(x, y, rot, s) { return G(x, y, rot, s, '<path d="M40 0 L-30 -16 L-18 0 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/><path d="M40 0 L-30 12 L-18 0 Z" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2"/>'); }
  function mountain(x, y, s) { return G(x, y, 0, s, '<path d="M-90 0 L-20 -90 L10 -60 L40 -100 L100 0 Z" fill="#7a8a9a" stroke="' + INK + '" stroke-width="2.4"/><path d="M40 -100 L28 -78 L40 -82 L52 -76 Z M-20 -90 L-32 -72 L-20 -76 L-8 -70 Z" fill="#fbfbf7"/>'); }

  // a Cairo street of apartment blocks: balconies, AC units, laundry, dishes, a water tank on our roof, cars below
  function block(x, y, w, h, col, t, seed) { var s = R(x, y - h, w, h, col, 2.2), fl = Math.floor((h - 20) / 40);
    for (var r = 0; r < fl; r++) for (var c = 0; c < Math.floor(w / 46); c++) { var wx = x + 10 + c * 46, wy = y - h + 14 + r * 40, lit = hash(seed + r * 7 + c) > 0.5; s += R(wx, wy, 24, 20, lit ? "#9fc4dc" : "#6f8fa8", 1.2) + '<path d="M' + (wx + 12) + ' ' + wy + ' v20" stroke="#4a5a6a" stroke-width="1"/>';
      if (hash(seed + r + c * 3) > 0.55) s += R(wx - 4, wy + 20, 32, 4, "#d9d4c8", 1) + '<path d="M' + (wx - 4) + ' ' + (wy + 20) + ' v-8 h32 v8" stroke="' + INK + '" stroke-width="1" fill="none"/>';
      if (hash(seed * 3 + r + c) > 0.7) s += R(wx + 26, wy + 4, 12, 8, "#e9ebee", 1) + '<circle cx="' + (wx + 32) + '" cy="' + (wy + 8) + '" r="2.4" fill="none" stroke="#9aa2ac"/>'; }
    s += '<path d="M' + (x + 10) + ' ' + (y - h - 2) + ' q14 -16 22 0" fill="#e9ebee" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (x + 21) + ' ' + (y - h - 4) + ' v-6" stroke="' + INK + '" stroke-width="1.2"/>';
    return s; }
  function laundry(x1, x2, y, t) { var s = '<path d="M' + x1 + ' ' + y + ' Q' + ((x1 + x2) / 2) + ' ' + (y + 8) + ' ' + x2 + ' ' + y + '" stroke="#5a5048" stroke-width="1.2" fill="none"/>'; for (var k = 1; k < 6; k++) { var x = lerp(x1, x2, k / 6), sw = Math.sin(t * 3 + k) * 3; s += '<path d="M' + f(x - 5) + ' ' + f(y + 4) + ' h10 l' + f(sw) + ' 14 h-10 Z" fill="' + COLS[k % 10] + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; }
  function rooftop(t) {
    var s = sky("day") + clouds(t, 14, 10, 5, 0.85) + birds(t, 30, 30) + city(t, 250, 90, "#b8c6d2", "#fff6c8", 5);
    s += block(-160, 340, 150, 230, "#d9b48a", t, 3) + block(20, 340, 130, 170, "#c9a07a", t, 8) + block(430, 340, 140, 200, "#e0c09a", t, 13) + block(590, 340, 170, 250, "#b8906a", t, 21);
    s += laundry(30, 140, 176, t) + laundry(440, 560, 146, t);
    s += R(180, 200, 220, 300, "url(#bld)", 2.6);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) { var wx = 196 + j * 50, wy = 222 + i * 42; s += R(wx, wy, 30, 24, "#7fa9c8", 1.6) + '<path d="M' + (wx + 15) + ' ' + wy + ' v24" stroke="#4a6a8a" stroke-width="1"/>'; if ((i + j) % 2) s += R(wx - 4, wy + 24, 38, 5, "#d9d4c8", 1.2) + '<path d="M' + (wx - 4) + ' ' + (wy + 24) + ' v-10 h38 v10" stroke="' + INK + '" stroke-width="1.2" fill="none"/>'; }
    s += R(170, 192, 240, 10, "#9a958c", 2) + R(186, 150, 34, 42, "#e9ebee", 2, 4) + '<path d="M186 160 h34 M186 180 h34" stroke="#9aa2ac" stroke-width="1.4"/>' + '<path d="M196 192 v-6 M210 192 v-6" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M370 186 q16 -20 30 0" fill="#e9ebee" stroke="' + INK + '" stroke-width="1.6"/><path d="M385 182 v10" stroke="' + INK + '" stroke-width="1.6"/>' + R(340, 180, 18, 12, "#f4f1e8", 1.4) + '<circle cx="349" cy="186" r="3" fill="none" stroke="#9aa2ac"/>';
    s += '<rect x="-400" y="336" width="1440" height="80" fill="url(#gAsphalt)"/>' + cars(t, 352, 50);
    return s; }
  // 0 — strap wings to your arms and jump off the roof: is that an airplane?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(160, 175, k), lerp(1.3, 1.05, k)]; }, function (u, d, t) {
    var s = rooftop(t);
    s += birdman(lerp(300, 380, ease(clamp((u - 2.4) / 1.2))), 192 - Math.abs(Math.sin(t * 6)) * 6, 0.9, t, u > 2.2 ? "happy" : "curious", 9);
    return s + qmark(470, 110, t, 44) + tag("طيارة؟", 470, 60, u, 1.2, 3, 26);
  });
  // 1 — no: a wing lifts nothing unless air rushes over it fast
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(380, 400, k), lerp(200, 250, k), lerp(1.1, 1.2, k)]; }, function (u, d, t) {
    var fall = ease(clamp((u - 0.2) / 1.4)), s = rooftop(t);
    s += R(380, 306, 120, 30, "#e8c48e", 2.4, 10) + '<path d="M392 312 h96 M392 324 h96" stroke="#c9a46a" stroke-width="2"/>';
    s += birdman(lerp(400, 440, fall), lerp(192, 306, fall), 0.9, t, fall >= 1 ? "dizzy" : "shock", fall >= 1 ? 1 : 22);
    for (var k = 0; k < 5; k++) { var p = (t * 0.6 + k / 5) % 1; s += '<path d="M' + f(lerp(560, 470, p)) + ' ' + (220 + k * 14) + ' h18" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="' + f(0.8 * Math.sin(Math.PI * p)) + '"/>'; }
    return s + cross(520, 170, 1, clamp((u - 1.8) / 1)) + tag("محتاج هوا سريع!", 400, 120, u, 2.2, -3, 22, "#f2a0a0");
  });
  // 2 — so you make a tube-shaped body and fix two wings 36 m tip to tip
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(300, 320, k), lerp(180, 180, k), lerp(0.95, 0.72, k)]; }, function (u, d, t) {
    var s = graphPaper(t), k1 = ease(clamp((u - 0.2) / 1.3)), k2 = ease(clamp((u - 1.5) / 1.4));
    s += G(lerp(-200, 320, k1), 180, 0, 1, planeTop(t, { parts: {} }));
    if (k2 > 0) s += G(320, 180, 0, 1, '<g opacity="' + f(k2) + '" transform="translate(0 0) scale(1 ' + f(k2) + ')">' + planeTop(t, { parts: { wing: true } }) + '</g>');
    var ka = clamp((u - 3.0) / 1.0); if (ka > 0) s += arrow(260, 180, 260, 180 - 229 * ka, "#f2c230", 4, 1) + arrow(260, 180, 260, 180 + 229 * ka, "#f2c230", 4, 1);
    return s + tag("جسم أنبوبة", 160, 240, u, 0.7, -3, 22) + tag("36 متر", 160, 40, u, 3.4, 3, 30, "#f2c230");
  });
  // 3 — the curved wing, tilted a little, pushes the air down and the air pushes it up
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(185, 175, k), lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 260, 4, 0.5), ang = 5;
    for (var i = 0; i < 9; i++) { var y = 90 + i * 22, dy = y < 180 ? -6 : 14, d2 = ""; for (var x = -100; x <= 760; x += 20) { var bend = x < 200 ? 0 : x < 440 ? (x - 200) / 240 : 1, yy = y + (y < 180 ? -14 * Math.exp(-Math.pow((x - 320) / 90, 2)) : 0) + bend * (y < 170 ? 18 : 28) * (x > 300 ? 1 : 0.2); d2 += (x === -100 ? "M" : " L") + x + " " + f(yy); } s += '<path d="' + d2 + '" stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 90) + '"/>'; }
    s += airfoil(320, 180, 2.6, ang, "#e4e8ec");
    var ka = clamp((u - 1.4) / 0.8); s += arrow(470, 205, 500, 275, "#5d93ad", 6, ka) + arrow(410, 210, 430, 280, "#5d93ad", 6, ka);
    var kl = clamp((u - 2.6) / 0.8); s += arrow(320, 150, 320, 150 - 90 * kl * (1 + 0.05 * Math.sin(t * 6)), "#3aa05a", 9, kl);
    return s + tag("الهوا لتحت", 530, 310, u, 1.6, 3, 20) + tag("الجناح لفوق", 200, 60, u, 2.8, -3, 22, "#bfe8c0");
  });
  // 4 — but to carry 70 tonnes you have to run at about 270 km/h
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(320, 340, k), lerp(200, 190, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var s = airport(t, 120, 260) + G(320, 196, 0, 0.8, planeSide(t, { parts: PT(4), gear: true, roll: 0.6 }));
    for (var k = 0; k < 4; k++) { var p = (t * 1.2 + k / 4) % 1; s += '<path d="M' + f(lerp(140, 80, p)) + ' ' + (238 + k * 3) + ' h-10" stroke="#d9d4c8" stroke-width="2" opacity="' + f(1 - p) + '"/>'; }
    s += arrow(300, 190, 300, 190 + 60 * clamp((u - 0.4) / 0.6), "#d8352a", 8, 1) + tag("70 طن", 190, 110, u, 0.5, -3, 26, "#f2a0a0");
    var v = 270 * ease(clamp((u - 1.4) / 2.2)); s += speedo(530, 90, 52, v, 300, Math.round(v));
    return s + tag("270 كم/س", 520, 168, u, 3.2, 3, 22, "#f2c230");
  });
  // 5 — so you hang two jet engines under the wings, each pushing with 12 tonnes
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(380, 330, k), lerp(235, 200, k), lerp(2.0, 1.05, k)]; }, function (u, d, t) {
    var drop = ease(clamp((u - 0.2) / 1.2)), s = airport(t, 160 * clamp((u - 2) / 2), 260), P = PT(4);
    s += G(320, 196, 0, 0.8, planeSide(t, { parts: P, gear: true, roll: 1 }));
    s += G(320, 196 + lerp(-120, 0, drop), 0, 0.8, planeSide(t, { parts: { eng: true }, nobody: true, thrust: u > 1.6, spin: 1.5 }));
    for (var k = 0; k < 5; k++) { var p = (t * 1.6 + k / 5) % 1; s += '<path d="M' + f(lerp(520, 410, p)) + ' ' + (226 + (k % 3) * 6) + ' h20" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * p) * (u > 1.4 ? 1 : 0)) + '"/>'; }
    return s + tag("محرك نفاث", 420, 300, u, 1.0, -3, 20) + tag("12 طن زق", 220, 300, u, 2.6, 3, 22, "#f2c230");
  });
  // 6 — but it would keep tumbling, like an arrow without feathers
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(170, 180, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 60), r = Math.sin(t * 2.6) * 40 + u * 30;
    s += G(260, 190, r, 0.55, planeSide(t, { parts: PT(6), thrust: true }));
    s += arrowShaft(500, 90, t * 260, false);
    return s + cross(560, 230, 0.9, clamp((u - 0.8) / 1)) + tag("بتتقلب!", 260, 50, u, 0.5, -3, 26, "#f2a0a0") + tag("سهم من غير ريش", 470, 295, u, 1.6, 3, 18);
  });
  // 7 — so you add a tail: a small flat wing and a standing fin, so the nose keeps pointing forward
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(190, 300, k), lerp(160, 180, k), lerp(1.6, 1.05, k)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.3) / 1.0)), r = Math.sin(t * 2.6) * 30 * (1 - ease(clamp((u - 1.3) / 1.2))), s = skyBG(t, "day", 80);
    s += G(300, 190, r, 0.6, planeSide(t, { parts: PT(6), thrust: true }) + '<g transform="translate(0 ' + f(-140 * (1 - k)) + ')" opacity="' + f(k) + '">' + planeSide(t, { parts: { tail: true }, nobody: true }) + '</g>');
    s += arrowShaft(510, 300, Math.sin(t * 3) * 3, true) + check(580, 250, 0.8, clamp((u - 2.6) / 1));
    return s + tag("الديل", 130, 85, u, 1.0, -3, 26) + tag("بوزها لقدام", 330, 262, u, 2.4, 3, 20, "#bfe8c0");
  });
  // 8 — but how do you turn left and right in the air?
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 180, k), lerp(0.75, 0.85, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#6f9548"/>';
    for (var i = 0; i < 14; i++) { var x = ((hash(i) * 1100 - t * 60) % 1100 + 1100) % 1100 - 250; s += '<rect x="' + f(x) + '" y="' + f(-80 + hash(i + 2) * 500) + '" width="' + f(60 + hash(i + 5) * 80) + '" height="' + f(40 + hash(i + 7) * 60) + '" fill="' + ["#8aa040", "#c9b07a", "#5a8a3a"][i % 3] + '" opacity=".8"/>'; }
    s += G(320, 180, 0, 0.6, planeTop(t, { parts: PT(7) })) + curl(320, 180, 200, -2.4, -0.8, "#f2c230", 5, clamp((u - 0.4) / 0.8)) + curl(320, 180, 200, 2.4, 0.8, "#f2c230", 5, clamp((u - 0.4) / 0.8));
    return s + qmark(150, 60, t, 48) + qmark(500, 320, t, 48) + tag("يمين ولا شمال؟", 320, 30, u, 0.6, -3, 24);
  });
  // 9 — so a moving panel at each wing tip: one goes up, the other down, and the plane leans and turns
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(470, 320, k), lerp(170, 175, k), lerp(1.8, 0.8, k)]; }, function (u, d, t) {
    var ail = u < 2.4 ? Math.sin(t * 5) * clamp((u - 0.6) / 0.4) : 1, roll = u < 2.4 ? 0 : 25 * ease(clamp((u - 2.4) / 1.2)) + Math.sin(t * 2) * 2;
    var s = skyBG(t, "day", 40) + G(320, 190, 0, 1, planeFront(t, { parts: PT(9), ail: ail, roll: roll }));
    if (u > 2.4) s += arrow(320 + 229, 120, 320 + 229, 80, "#3aa05a", 5, clamp((u - 2.5) / 0.5)) + arrow(320 - 229, 190, 320 - 229, 240, "#d8352a", 5, clamp((u - 2.5) / 0.5));
    return s + tag("لوح بيتحرك", 500, 250, u, 0.8, -3, 20) + tag("تميل وتلف", 320, 80, u, 3.4, 3, 24, "#bfe8c0");
  });
  // 10 — but these engines drink a lot of fuel: where do you put it?
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(320, 360, k), lerp(180, 170, k), lerp(1.0, 1.25, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 90) + G(300, 190, 0, 0.65, planeSide(t, { parts: PT(9), thrust: true, spin: 2 }));
    s += '<g transform="translate(500 90) scale(1.4)">' + R(-40, -36, 80, 54, "#2b2f34", 2.4, 8) + fuelGauge(0, 4, 0.8 - 0.75 * clamp(u / 2.6)) + '</g>';
    return s + qmark(390, 300, t, 46) + tag("هتحطه فين؟", 200, 60, u, 1.4, -3, 24);
  });
  // 11 — so you fill the wings themselves with fuel, about 24 thousand litres
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(320, 300, k), lerp(180, 180, k), lerp(0.8, 0.72, k)]; }, function (u, d, t) {
    var fu = ease(clamp((u - 0.4) / 2.6)), s = graphPaper(t) + G(320, 180, 0, 1, planeTop(t, { parts: PT(10), fuel: fu }));
    for (var k = 0; k < 6; k++) { var p = (t * 1.5 + k / 6) % 1; s += '<circle cx="' + f(300 + (k % 2 ? 1 : -1) * lerp(40, 160, p)) + '" cy="' + f(180 + (k % 2 ? 1 : -1) * lerp(40, 180, p)) + '" r="4" fill="#f2a93b" opacity="' + f((1 - p) * (fu < 1 ? 1 : 0.3)) + '"/>'; }
    return s + tag("وقود جوه الجناح", 140, 30, u, 0.8, -3, 22) + tag("24 ألف لتر", 160, 340, u, 2.4, 3, 28, "#f2c230");
  });
  // 12 — the weight of that fuel stops the wing bending up too hard
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(170, 170, k), lerp(0.85, 0.95, k)]; }, function (u, d, t) {
    var fa = clamp((u - 1.0) / 0.8), bend = lerp(1, 0.35, ease(clamp((u - 1.2) / 1.4))) + 0.05 * Math.sin(t * 4), s = skyBG(t, "day", 40);
    s += G(320, 190, 0, 1, planeFront(t, { parts: PT(11), bend: bend, fuelArrows: fa }));
    for (var sg = -1; sg <= 1; sg += 2) s += arrow(320 + 200 * sg, 150, 320 + 200 * sg, 110 - 20 * bend, "#3aa05a", 5, 1);
    return s + tag("رفع لفوق", 320, 40, u, 0.3, -3, 20, "#bfe8c0") + tag("التقل بيشده لتحت", 320, 320, u, 1.4, 3, 20, "#f2c230");
  });
  // 13 — but at 11 km the air is so thin you'd pass out in under a minute
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(320, 330, k), lerp(170, 180, k), lerp(0.85, 1.5, k)]; }, function (u, d, t) {
    var s = sky("night") + stars(t) + '<rect x="-400" y="280" width="1440" height="300" fill="#2f4a72" opacity=".6"/>' + clouds(t, 30, 300, 5, 0.5);
    s += G(320, 180, 0, 0.9, planeSide(t, { parts: PT(13), cut: true, n: 8, mood: u > 1.8 ? "dizzy" : "worry", thrust: true }));
    s += '<g transform="translate(200 270)">' + R(-46, -26, 92, 52, "#1c1c1c", 2, 8) + T("11 كم", 0, 10, 24, "#f2c230") + '</g>';
    return s + tag("أقل من دقيقة!", 430, 100, u, 2.0, 3, 24, "#f2a0a0");
  });
  // 14 — so you seal the cabin and blow in compressed air from the engines: it feels like a 2.5 km mountain
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(380, 310, k), lerp(205, 180, k), lerp(1.6, 0.95, k)]; }, function (u, d, t) {
    var ok = u > 1.8, s = sky("night") + stars(t) + clouds(t, 30, 300, 5, 0.5), P = PT(13); P.press = ok;
    s += G(320, 180, 0, 0.9, planeSide(t, { parts: P, cut: true, n: 8, mood: ok ? "happy" : "dizzy", thrust: true }));
    for (var k = 0; k < 6; k++) { var p = (t * 0.8 + k / 6) % 1; s += '<circle cx="' + f(320 + lerp(70, -60, p) * 0.9) + '" cy="' + f(180 + lerp(30, 5, p) * 0.9) + '" r="4" fill="#bfe0ff" stroke="' + INK + '" stroke-width="1" opacity="' + f(clamp((u - 0.4) * 2) * Math.sin(Math.PI * p)) + '"/>'; }
    var km = clamp((u - 3.6) / 0.8); if (km > 0) s += '<g opacity="' + f(km) + '">' + mountain(560, 330, 0.9) + '</g>';
    return s + tag("هوا مضغوط", 430, 285, u, 0.6, -3, 22) + tag("كأنك على 2.5 كم", 470, 60, u, 3.8, 3, 20, "#bfe8c0");
  });
  // 15 — but to land you slow right down, and a slow wing won't hold you up
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(180, 210, k), lerp(0.95, 1.1, k)]; }, function (u, d, t) {
    var sink = ease(clamp((u - 1.4) / 2)), s = airport(t, 30, 330) + G(300, 140 + sink * 60, -6 * sink, 0.6, planeSide(t, { parts: PT(15), spin: 0.6, gear: true }));
    var v = lerp(270, 180, ease(clamp(u / 2))); s += speedo(530, 90, 46, v, 300, Math.round(v));
    return s + arrow(300, 210, 300, 210 + 50 * sink, "#d8352a", 6, sink) + cross(160, 120, 0.8, clamp((u - 2.2) / 1)) + tag("بطيء = بيقع", 330, 72, u, 1.8, -3, 22, "#f2a0a0");
  });
  // 16 — so wing parts slide back and down, the flaps: they make the wing bigger so it holds you while slow
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 175, k), lerp(0.75, 0.68, k)]; }, function (u, d, t) {
    var fk = ease(clamp((u - 0.6) / 1.6)), s = graphPaper(t) + G(320, 180, 0, 1, planeTop(t, { parts: PT(16), flap: fk }));
    if (u > 3) { var a = ease(clamp((u - 3) / 0.6)); s += '<g opacity="' + f(a) + '">' + R(470, 240, 200, 120, "#f4efe4", 2.4, 10) + airfoil(560, 300, 1.1, 4, "#e4e8ec") + G(560 - 60, 304, -18 * fk, 1, '<path d="M0 0 L-38 4 L-36 10 L0 6 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>') + '</g>'; }
    return s + tag("الفلابس", 150, 40, u, 1.0, -3, 28, "#f2c230") + tag("جناح أكبر", 150, 330, u, 2.2, 3, 22, "#bfe8c0");
  });
  // 17 — but when the wheels touch down you're still doing 250 km/h
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(210, 220, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var td = ease(clamp(u / 0.8)), s = airport(t, 220, 280) + G(300, lerp(200, 232, td), lerp(-4, 0, td), 0.75, planeSide(t, { parts: PT(17), gear: true, roll: 2, flap: 1 }));
    if (u > 0.7) for (var k = 0; k < 6; k++) { var p = (t * 1.5 + k / 6) % 1; s += '<circle cx="' + f(300 - 10 - p * 120) + '" cy="' + f(278 - p * 20) + '" r="' + f(6 + p * 16) + '" fill="#d9d4c8" opacity="' + f(0.7 * (1 - p)) + '"/>'; }
    s += R(610, 180, 12, 100, "#d8352a", 2) + speedo(480, 112, 42, 250, 300, "250");
    return s + tag("250 كم/س", 380, 120, u, 0.8, 3, 22, "#f2a0a0") + tag("الممر بيخلص!", 230, 82, u, 1.8, -3, 22, "#f2a0a0");
  });
  // 18 — so strong brakes in the wheels, and the engines throw the air forwards to brake too
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(330, 360, k), lerp(240, 225, k), lerp(1.6, 1.15, k)]; }, function (u, d, t) {
    var slow = 1 - ease(clamp((u - 0.4) / 3.6)), s = airport(t, 220 * slow + 4, 280) + R(610, 180, 12, 100, "#d8352a", 2);
    s += G(lerp(300, 380, ease(clamp(u / 4))), 232, 0, 0.75, planeSide(t, { parts: PT(18), gear: true, roll: 2 * slow, brake: u > 0.4, rev: u > 1.6, flap: 1 }));
    s += speedo(490, 150, 36, 250 * slow, 300, Math.round(250 * slow)) + check(560, 140, 0.8, clamp((u - 3.8) / 1));
    return s + tag("فرامل", 250, 332, u, 0.6, -3, 22, "#f2a0a0") + tag("الهوا لقدام", 470, 332, u, 1.8, 3, 22);
  });
  // 19 — many think if both engines stop, the plane drops like a stone
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 180, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 50), P = PT(19), drop = (t * 0.9) % 1;
    s += G(280, 170, 0, 0.6, planeSide(t, { parts: P, cut: true, n: 6, mood: "shock", stopped: true }));
    s += G(540, lerp(40, 380, drop), drop * 200, 1, '<path d="M-20 -6 L-4 -18 L18 -12 L22 8 L4 18 L-18 12 Z" fill="#8a8580" stroke="' + INK + '" stroke-width="2.4"/>');
    return s + tag("زي الحجر؟", 450, 60, u, 1.2, 3, 26, "#f2a0a0") + tag("المحركين وقفوا", 240, 320, u, 0.4, -3, 20);
  });
  // 20 — really, it keeps flying like a paper plane
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(160, 200, k), lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 40) + G(lerp(220, 380, u / d), lerp(140, 210, u / d), 6, 0.55, planeSide(t, { parts: PT(19), stopped: true }));
    s += paperPlane(lerp(200, 330, u / d), lerp(290, 330, u / d), 10, 0.9 + 0.05 * Math.sin(t * 3)) + '<path d="M80 100 L560 250" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" stroke-dashoffset="' + f(-t * 40) + '" opacity=".7"/>';
    return s + tag("زي الطيارة الورق", 450, 70, u, 0.5, 3, 22, "#bfe8c0");
  });
  // 21 — in 2001 a plane ran out of fuel over the ocean and glided about 120 km to land safely (Air Transat 236, the Azores)
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(170, 190, k), lerp(0.9, 1.05, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sea2)"/>';
    for (var i = 0; i < 20; i++) { var y = -40 + i * 24, x = ((hash(i) * 900 + t * 18) % 1000) - 200; s += '<path d="M' + f(x) + ' ' + y + ' q10 -4 20 0 t20 0" stroke="#8fd0ee" stroke-width="1.6" fill="none" opacity=".5"/>'; }
    s += '<path d="M500 190 C520 160 590 150 610 180 C630 210 580 240 540 230 C510 224 490 210 500 190 Z" fill="#9dbb6e" stroke="' + INK + '" stroke-width="2.4"/>' + R(520, 190, 60, 8, "#5a5752", 1.4);
    var g = ease(clamp((u - 0.4) / 4.6)), x = lerp(60, 540, g), y = lerp(120, 192, g);
    s += '<path d="M60 120 L540 192" stroke="#f2c230" stroke-width="3" stroke-dasharray="10 8" opacity=".8"/>' + G(x, y, 8, 0.28, planeSide(t, { parts: PT(19), stopped: true }));
    s += '<g transform="translate(110 290) scale(1.1)">' + R(-40, -36, 80, 54, "#2b2f34", 2.4, 8) + fuelGauge(0, 4, 0.02) + '</g>';
    var km = Math.round(120 * g); s += '<g transform="translate(320 300)">' + R(-70, -24, 140, 48, "#1c1c1c", 2, 8) + T(km + " كم", 0, 10, 26, "#f2c230") + '</g>';
    return s + tag("2001", 140, 40, u, 0.4, -3, 28) + check(560, 120, 0.9, clamp((u - 5.0) / 1)) + tag("نزلت سليمة!", 470, 290, u, 5.0, 3, 22, "#bfe8c0");
  });
  // 22 — add seats, round windows and a cockpit for the pilot
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(200, 480, k), lerp(185, 185, k), lerp(1.4, 1.5, k)]; }, function (u, d, t) {
    var P = PT(21); P.seats = u > 0.2; P.windows = u > 1.0; P.cockpit = u > 1.9; P.press = true;
    var s = graphPaper(t) + G(320, 180, 0, 1, planeSide(t, { parts: P, cut: u < 1.0 || u > 1.9, n: 0, thrust: false }));
    return s + tag("كراسي", 180, 120, u, 0.2, -3, 20) + tag("شبابيك مدوّرة", 360, 260, u, 1.0, 3, 20, "#e8c48e") + tag("كابينة الطيار", 515, 112, u, 1.9, -3, 18);
  });
  // 23 — and congratulations, you've built an airplane
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(330, 320, k), lerp(200, 170, k), lerp(1.1, 0.85, k)]; }, function (u, d, t) {
    var s = airport(t, 60, 300) + G(lerp(300, 340, u / d), lerp(240, 180, ease(u / d)), -10 * ease(u / d), 0.7, planeSide(t, { parts: PT(23), thrust: true, gear: u < 1, roll: 2 }));
    for (var c = 0; c < 18; c++) { var p = (t * 0.6 + hash(c)) % 1, cx = -20 + hash(c + 2) * 680, cy = -20 + p * 380; s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="6" height="10" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; }
    return s + engineer(90, 250, t, "happy", { s: 0.35 }) + tag("مبروك!", 330, 40, u, 0.3, -3, 32, "#bfe8c0");
  });
  // 24 — outro
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(180, 170, k), lerp(1.0, 0.9, k)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(500, 260, 40, "#f7b04a") + clouds(t, 20, 30, 5, 0.6) + city(t, 330, 80, "#7a5a6a", "#ffd88a", 9);
    s += G(lerp(160, 460, u / d), lerp(220, 150, u / d), -6, 0.4, planeSide(t, { parts: PT(23), thrust: true }));
    return s + tag("قولولنا!", 320, 60, u, 0.4, 3, 30);
  });

  window.__parts = { planeSide: planeSide, planeTop: planeTop, planeFront: planeFront, airport: airport, skyBG: skyBG, PT: PT, tag: tag, hardHat: engineer, engineer: engineer, T: T, sky: sky, clouds: clouds, city: city };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), zc = c[2] > 1 ? 1 + (c[2] - 1) * 0.35 : c[2], cx = c[0] + 10 * Math.sin(t * 1.2), cy = c[1] + 8 * Math.cos(t * 1.2), z = zc * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
