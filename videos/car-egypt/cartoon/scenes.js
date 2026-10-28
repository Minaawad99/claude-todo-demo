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

  // ── new pieces for this episode: a car in side view, an in-line engine cut open, one cylinder through its four strokes,
  // crankshaft, gearbox, differential, and the 1886 Benz Patent-Motorwagen (after the Commons photos, see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function boom(x, y, r, k) { if (k <= 0) return ""; var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.5 + k)) + '" fill="url(#gBoom)" opacity="' + f(clamp(1.4 - k)) + '"/>'; for (var i = 0; i < 8; i++) { var a = i * 0.785; s += '<path d="M' + f(x + Math.cos(a) * r * 0.4) + ' ' + f(y + Math.sin(a) * r * 0.4) + ' L' + f(x + Math.cos(a) * r * (0.7 + k * 0.6)) + ' ' + f(y + Math.sin(a) * r * (0.7 + k * 0.6)) + '" stroke="' + YEL + '" stroke-width="2.4" opacity="' + f(clamp(1.2 - k)) + '"/>'; } return s; }
  function wheel(x, y, r, ang, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="url(#gTyre)" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(r * 0.6) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><g transform="rotate(' + f(ang) + ')">';
    for (var k = 0; k < 5; k++) s += '<path d="M0 0 L0 ' + f(-r * 0.56) + '" stroke="#7a828c" stroke-width="' + f(r * 0.14) + '" stroke-linecap="round" transform="rotate(' + (k * 72) + ')"/>';
    return s + '<circle r="' + f(r * 0.16) + '" fill="#5a6068" stroke="' + INK + '"/></g></g>'; }
  // a red hatchback seen from the side; o: {s, hood (cut-open glow under the bonnet), flash, spin (wheel angle), tilt}
  function car(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 400 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="40" rx="150" ry="9" fill="#000" opacity=".2"/>';
    s += '<path d="M-150 20 C-152 0 -146 -10 -130 -14 L-80 -18 L-40 -54 C-30 -62 50 -62 70 -50 L110 -20 L140 -14 C152 -10 156 4 154 20 Z" fill="url(#gCar)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-34 -50 L-60 -20 H6 V-52 Z M14 -52 V-20 H96 L64 -48 C50 -54 30 -54 14 -52 Z" fill="#9fd2e8" stroke="' + INK + '" stroke-width="2"/><path d="M10 -20 V16 M-60 -6 h14 M40 -6 h14" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="138" y="-8" width="14" height="8" rx="2" fill="#fff3c4" stroke="' + INK + '" stroke-width="1.4"/><rect x="-152" y="-6" width="10" height="8" rx="2" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.hood) { s += '<path d="M98 -22 L140 -14 C150 -10 152 0 152 12 L96 12 Z" fill="#2b2e33" opacity=".85"/>'; for (var c = 0; c < 4; c++) { var on = o.flash ? ((Math.floor(t * 18) + [0, 2, 3, 1][c]) % 4 === 0) : false; s += '<rect x="' + (102 + c * 11) + '" y="-12" width="8" height="18" fill="#8a929c" stroke="' + INK + '" stroke-width=".8"/>' + (on ? '<circle cx="' + (106 + c * 11) + '" cy="-12" r="9" fill="url(#gBoom)"/>' : ''); } }
    s += wheel(-92, 20, 24, sp) + wheel(98, 20, 24, sp);
    return s + '</g>'; }
  function road(t, y, sp) { var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#gAsphalt)"/>', o = (t * (sp || 300)) % 80; for (var x = -400; x < 1100; x += 80) s += '<rect x="' + f(x - o) + '" y="' + (y + 40) + '" width="40" height="5" fill="#e9e4d8"/>'; return s + '<rect x="-400" y="' + (y - 8) + '" width="1440" height="8" fill="#8a857a"/>'; }
  // one cylinder in section: head with intake (left) and exhaust (right) valves, spark plug, piston on a con-rod to the crank.
  // ang: crank angle (deg, 0 = top dead centre), o: {inV, exV 0..1 open, mix (dots), fire 0..1, smoke, air, s}
  function cylinder(x, y, ang, t, o) {
    o = o || {}; var a = ang * Math.PI / 180, R = 34, Lr = 96, cy0 = y + 150, pinY = cy0 - (R * Math.cos(a) + Math.sqrt(Lr * Lr - Math.pow(R * Math.sin(a), 2))), top = pinY - 34;
    var s = '<g>' + '<rect x="' + (x - 62) + '" y="' + (y - 10) + '" width="124" height="' + 150 + '" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.6"/><rect x="' + (x - 46) + '" y="' + y + '" width="92" height="140" fill="#3a3f46"/>';
    var vol = top - y; if (o.mix) for (var m = 0; m < 22; m++) { var mx = x - 40 + hash(m) * 80, my = y + 4 + hash(m + 9) * Math.max(4, vol - 8); s += '<circle cx="' + f(mx + Math.sin(t * 9 + m) * 2) + '" cy="' + f(my) + '" r="2.6" fill="' + (m % 3 ? CY : YEL) + '"/>'; }
    if (o.fire) s += '<rect x="' + (x - 46) + '" y="' + y + '" width="92" height="' + f(Math.max(0, vol)) + '" fill="url(#gBoom)" opacity="' + f(o.fire) + '"/>';
    if (o.smoke) for (var k = 0; k < 10; k++) s += '<circle cx="' + f(x - 30 + hash(k) * 60) + '" cy="' + f(y + 6 + hash(k + 4) * Math.max(4, vol - 10)) + '" r="4" fill="#7a7670" opacity=".8"/>';
    s += '<rect x="' + (x - 44) + '" y="' + f(top) + '" width="88" height="40" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 44) + ' ' + f(top + 8) + ' h88 M' + (x - 44) + ' ' + f(top + 14) + ' h88" stroke="#5a6068" stroke-width="1.4"/>';
    var cx = x + R * Math.sin(a), cyc = cy0 - R * Math.cos(a); s += '<path d="M' + x + ' ' + f(pinY) + ' L' + f(cx) + ' ' + f(cyc) + '" stroke="#5a6068" stroke-width="12" stroke-linecap="round"/><circle cx="' + x + '" cy="' + f(pinY) + '" r="5" fill="#2b2e33"/>';
    s += '<circle cx="' + x + '" cy="' + cy0 + '" r="' + (R + 10) + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><circle cx="' + f(cx) + '" cy="' + f(cyc) + '" r="8" fill="#2b2e33"/><circle cx="' + x + '" cy="' + cy0 + '" r="6" fill="#2b2e33"/>';
    s += '<path d="M' + (x - 70) + ' ' + (y - 10) + ' H' + (x + 70) + ' V' + (y - 44) + ' H' + (x - 70) + ' Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    var iv = clamp(o.inV || 0) * 12, ev = clamp(o.exV || 0) * 12;
    s += '<path d="M' + (x - 26) + ' ' + f(y - 50 + iv) + ' V' + f(y - 6 + iv) + ' M' + (x - 36) + ' ' + f(y - 6 + iv) + ' h20" stroke="#c9ced4" stroke-width="5"/><path d="M' + (x + 26) + ' ' + f(y - 50 + ev) + ' V' + f(y - 6 + ev) + ' M' + (x + 16) + ' ' + f(y - 6 + ev) + ' h20" stroke="#c9ced4" stroke-width="5"/>';
    s += '<path d="M' + (x - 70) + ' ' + (y - 30) + ' H' + (x - 110) + '" stroke="#5a6068" stroke-width="16"/><path d="M' + (x + 70) + ' ' + (y - 30) + ' H' + (x + 110) + '" stroke="#5a6068" stroke-width="16"/>';
    s += '<rect x="' + (x - 5) + '" y="' + (y - 64) + '" width="10" height="26" fill="#fbf6e6" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (x - 4) + '" y="' + (y - 44) + '" width="8" height="10" fill="#8a929c"/>';
    if (o.spark) s += '<path d="M' + x + ' ' + (y - 10) + ' l-6 10 l8 0 l-6 12" stroke="' + YEL + '" stroke-width="3" fill="none"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="10" fill="' + YEL + '" opacity=".6" filter="url(#glow)"/>';
    if (o.air) for (var q = 0; q < 6; q++) { var qu = (t * 1.4 + q / 6) % 1; s += '<circle cx="' + f(x - 110 + qu * 80) + '" cy="' + f(y - 30 + Math.sin(q) * 4) + '" r="3" fill="' + CY + '" opacity="' + f(1 - qu * 0.5) + '"/>'; }
    if (o.spray) for (var p = 0; p < 10; p++) { var pu = (t * 3 + p / 10) % 1; s += '<circle cx="' + f(x - 56 + pu * 30) + '" cy="' + f(y - 22 + pu * 30 + (hash(p) - 0.5) * 16 * pu) + '" r="2" fill="' + YEL + '" opacity="' + f(1 - pu) + '"/>'; }
    if (o.exhaust) for (var e = 0; e < 8; e++) { var eu = (t * 1.2 + e / 8) % 1; s += '<circle cx="' + f(x + 70 + eu * 90) + '" cy="' + f(y - 30 - eu * 10) + '" r="' + f(4 + eu * 6) + '" fill="#7a7670" opacity="' + f(0.8 * (1 - eu)) + '"/>'; }
    return s + '</g>'; }
  function gear(x, y, r, teeth, ang, col) { var d = ""; for (var i = 0; i < teeth * 2; i++) { var a = i / (teeth * 2) * Math.PI * 2 + ang, rr = i % 2 ? r : r + 8; d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
    return '<path d="' + d + ' Z" fill="' + (col || "url(#gGear)") + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.3) + '" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function tacho(x, y, r, v, label) { var a = -2.3 + 4.6 * clamp(v), s = '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#8a929c" stroke-width="3"/>';
    for (var k = 0; k <= 7; k++) { var ka = -2.3 + 4.6 * k / 7; s += '<path d="M' + f(Math.sin(ka) * (r - 4)) + ' ' + f(-Math.cos(ka) * (r - 4)) + ' L' + f(Math.sin(ka) * (r - 12)) + ' ' + f(-Math.cos(ka) * (r - 12)) + '" stroke="' + (k > 5 ? RED : "#e9e4d8") + '" stroke-width="2"/><text x="' + f(Math.sin(ka) * (r - 22)) + '" y="' + f(-Math.cos(ka) * (r - 22) + 4) + '" text-anchor="middle" style="font:700 10px Noto Serif;fill:#e9e4d8">' + k + '</text>'; }
    return s + '<path d="M0 0 L' + f(Math.sin(a) * (r - 10)) + ' ' + f(-Math.cos(a) * (r - 10)) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + RED + '"/>' + (label ? '<text y="' + (r * 0.5) + '" text-anchor="middle" style="font:700 9px Noto Serif;fill:#9a958c;direction:ltr">' + label + '</text>' : '') + '</g>'; }
  // the 1886 Benz Patent-Motorwagen: three spoked wheels (one small at the front), a tiller, a bench seat, the engine low at the back
  // with a big horizontal flywheel; o: {s, smoke}
  function motorwagen(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', sp = t * 200;
    function spoked(cx, cy, r) { var g = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="3"/>'; for (var k = 0; k < 12; k++) { var a = (k / 12) * Math.PI * 2 + sp * 0.0174; g += '<path d="M' + cx + ' ' + cy + ' L' + f(cx + Math.cos(a) * r) + ' ' + f(cy + Math.sin(a) * r) + '" stroke="' + INK + '" stroke-width="1"/>'; } return g + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + INK + '"/>'; }
    s += spoked(-50, 0, 46) + '<path d="M-50 0 L70 0 L90 -30 M-30 -50 H40 L50 -30 H-40 Z" stroke="' + INK + '" stroke-width="3" fill="#2b2620"/>';
    s += '<path d="M-36 -54 C-36 -76 20 -76 24 -54 Z" fill="#2b2620" stroke="' + INK + '" stroke-width="2"/><path d="M40 -50 L70 -96 M60 -96 H84" stroke="' + INK + '" stroke-width="3"/>';
    s += '<ellipse cx="-70" cy="-20" rx="26" ry="7" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2" transform="rotate(' + f(Math.sin(t * 20) * 2) + ' -70 -20)"/><rect x="-82" y="-40" width="30" height="20" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2"/>';
    s += spoked(90, 16, 30);
    if (o.smoke) for (var k = 0; k < 6; k++) { var u = (t * 0.7 + k / 6) % 1; s += '<circle cx="' + f(-100 - u * 70) + '" cy="' + f(-40 - u * 40) + '" r="' + f(5 + u * 12) + '" fill="#8a857a" opacity="' + f(0.6 * (1 - u)) + '"/>'; }
    return s + '</g>'; }
  function bertha(x, y, t, mood, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-44 140 C-50 50 -30 28 0 28 C30 28 50 50 44 140 Z" fill="#3a2a4a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 36, mood, t, o.look || 0) + '<path d="M-48 -40 C-46 -60 46 -60 48 -40 Z" fill="#5a3a2a" stroke="' + INK + '" stroke-width="3"/><path d="M-30 -56 C-20 -80 24 -80 30 -56" fill="#7a3a5a" stroke="' + INK + '" stroke-width="3"/><path d="M14 -70 L40 -96" stroke="' + YEL + '" stroke-width="2.4"/></g>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — driving, under the bonnet tiny explosions, up to a hundred a second (Cairo street, bonnet cut open)
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 400, k), 180, lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 60, 20, 6, 0.8) + city(t - 0, 230, 110, "#c9a58a", "#f7e7b0", 4, false) + road(t, 250, 420);
    s += car(320, 222, t, { hood: u > 1.2, flash: u > 1.2 });
    var n = Math.round(100 * clamp((u - 2.4) / 1.6)); if (u > 2.4) s += '<g transform="translate(450 90)"><rect x="-80" y="-20" width="160" height="38" rx="9" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + YEL + '">' + n + ' انفجار/ثانية</text></g>';
    return s + tag("تحت الكبوت!", 430, 150, u, 1.4, 3, 15);
  });
  // 1 — those explosions are what move the car (bang → arrow → the car shoots off)
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 160, 20, 6, 0.8) + road(t, 250, 900) + car(320 + Math.sin(t * 3) * 8, 222, t, { spin: t * 1200, tilt: -1.5 });
    s += boom(470, 120, 40, (t * 2) % 1) + arrow(500, 140, 560, 200, YEL, 6, 1);
    for (var k = 0; k < 8; k++) { var ku = (t * 2 + k / 8) % 1; s += '<path d="M' + f(160 - ku * 200) + ' ' + (190 + k * 6) + ' h-40" stroke="#fff" stroke-width="2.4" opacity="' + f(1 - ku) + '"/>'; }
    return s;
  });
  // 2 — how does a bang make the wheels spin?
  shot(2, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + boom(200, 170, 70, (t * 1.3) % 1) + '<circle cx="200" cy="170" r="30" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>' + arrow(280, 170, 360, 170, INK, 6, clamp(u / 0.6)) + wheel(450, 170, 64, t * 160);
    return s + qmark(330, 100, t, 56) + tag("إزاي؟", 330, 290, u, 0.8, -3, 20);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + car(300, 170, t, { hood: true, flash: true, s: 0.9 }) + tag("إيه الحكاية؟", 320, 290, u, 0.1, -3, 26);
  });
  // 4 — turn the key: a small electric motor, the starter, spins the big engine for its first turns (pinion meshes the flywheel ring)
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var turn = ease(clamp((u - 0.3) / 0.5)), crank = u > 0.9 ? (u - 0.9) : 0, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2e33"/>';
    s += '<g transform="translate(140 170)"><circle r="56" fill="#3a3f46" stroke="#8a929c" stroke-width="4"/><circle r="18" fill="#1c1c1c"/><g transform="rotate(' + f(-60 + 90 * turn) + ')"><rect x="-6" y="-60" width="12" height="44" rx="3" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><path d="M-22 -96 C-22 -112 22 -112 22 -96 V-64 H-22 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/></g>';
    ["OFF", "ON", "START"].forEach(function (l, k) { var a = (-60 + 45 * k) * Math.PI / 180; s += '<text x="' + f(Math.sin(a) * 74) + '" y="' + f(-Math.cos(a) * 74 + 4) + '" text-anchor="middle" style="font:700 10px Noto Serif;fill:#e9e4d8;direction:ltr">' + l + '</text>'; }); s += '</g>';
    s += gear(420, 170, 100, 40, crank * 2.2, "url(#gGear)") + '<circle cx="420" cy="170" r="60" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    var engaged = u > 0.8; s += '<rect x="' + (engaged ? 240 : 220) + '" y="236" width="80" height="44" rx="10" fill="#2f4a6a" stroke="' + INK + '" stroke-width="2.4"/>' + gear(engaged ? 320 : 300, 258, 16, 9, -crank * 14);
    if (u > 0.8 && u < 2.6) s += '<path d="M180 250 q20 -20 40 0" stroke="' + YEL + '" stroke-width="3" fill="none" opacity="' + f(0.5 + 0.5 * Math.sin(t * 20)) + '"/>';
    return s + tag("المارش", 260, 320, u, 1.0, -3, 18) + tag("أول لفة", 470, 40, u, 1.6, 3, 16);
  });
  // 5 — inside the engine: cylinders, each with a piston going up and down (in-line four, firing 1-3-4-2, crank turning)
  shot(5, function (u, d) { return [320, 180, lerp(0.75, 0.85, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9e4d8"/>', base = t * 360 * 0.8;
    [0, 180, 180, 0].forEach(function (ph, k) { var ang = base + ph + (k === 2 || k === 3 ? 360 * 0 : 0), cyc = ((base + [0, 540, 180, 360][k]) % 720) / 720; s += cylinder(140 + k * 120, 40, (base + [0, 540, 180, 360][k]) % 360, t, { fire: cyc < 0.25 ? 1 - cyc * 4 : 0, mix: cyc > 0.75 || cyc < 0.25 }); });
    s += '<path d="M60 190 H580" stroke="#5a6068" stroke-width="8"/>';
    return s + tag("أسطوانة", 140, 300, u, 0.5, -3, 16) + tag("مكبس", 500, 300, u, 1.4, 3, 18);
  });
  // 6 — every piston repeats four steps in a row, forever (one cylinder, the 4 steps lit in turn)
  shot(6, function (u, d) { return [320, 170, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var ang = (t * 360 * 0.6) % 720, st = Math.floor(ang / 180), s = graphPaper(t) + cylinder(200, 80, ang % 360, t, { inV: st === 0, exV: st === 3, mix: st === 1 || st === 0, fire: st === 2 ? 1 - (ang % 180) / 180 : 0, spark: st === 2 && ang % 180 < 30, smoke: st === 3 });
    var L4 = ["شفط", "ضغط", "انفجار", "طرد"]; for (var k = 0; k < 4; k++) s += '<g transform="translate(450 ' + (70 + k * 56) + ')"><rect x="-80" y="-20" width="160" height="40" rx="10" fill="' + (k === st ? YEL : "#fbfaf6") + '" stroke="' + INK + '" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + (k + 1) + '. ' + L4[k] + '</text></g>';
    return s + tag("على طول!", 450, 310, u, 1.6, -3, 17);
  });
  // 7 — 1: the piston goes down, sucks air in, and fuel is sprayed in with it like a spray bottle
  shot(7, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var ang = 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { inV: 1, mix: true, air: true, spray: true });
    return s + tag("شفط هوا", 110, 70, u, 0.4, -3, 16) + tag("بنزين!", 120, 120, u, 1.4, 3, 15);
  });
  // 8 — 2: the piston comes up and squeezes the mix into a tiny space
  shot(8, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var ang = 180 + 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { mix: true });
    s += arrow(330, 220, 330, 120, RED, 6, clamp(u / 0.6));
    return s + tag("ضغط!", 360, 80, u, 0.6, 3, 18);
  });
  // 9 — 3: the plug sparks, the mix explodes and slams the piston down
  shot(9, function (u, d) { var sh = u > 0.5 && u < 1.0 ? 6 * Math.sin(u * 80) : 0; return [220 + sh, 150, lerp(1.3, 1.2, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), ang = 180 * ease(k), s = graphPaper(t) + cylinder(220, 80, ang, t, { fire: u > 0.4 ? clamp(1.2 - k) : 0, spark: u > 0.25 && u < 0.6, mix: u < 0.4 });
    s += boom(220, 90, 60, clamp((u - 0.4) / 0.6)) + arrow(330, 120, 330, 230, YEL, 7, clamp((u - 0.5) / 0.5));
    return s + tag("البوجيه", 110, 60, u, 0.2, -3, 15) + tag("بوم!", 360, 70, u, 0.5, 3, 20, "#ffb08a");
  });
  // 10 — that's the only step that makes power; the rest just prepare it
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), L4 = ["شفط", "ضغط", "انفجار", "طرد"];
    for (var k = 0; k < 4; k++) { var hot = k === 2, x = 100 + k * 146, h = hot ? 160 + 10 * Math.sin(t * 8) : 60; s += '<rect x="' + (x - 50) + '" y="' + f(270 - h) + '" width="100" height="' + f(h) + '" rx="8" fill="' + (hot ? YEL : "#d9d4c8") + '" stroke="' + INK + '" stroke-width="2.6"/><text x="' + x + '" y="300" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + INK + '">' + L4[k] + '</text>'; if (hot) s += boom(x, 80, 40, (t * 1.5) % 1); }
    return s + tag("القوة كلها هنا!", 392, 40, u, 0.5, 3, 17) + tag("تجهيز", 130, 150, u, 1.6, -3, 15);
  });
  // 11 — 4: up again, pushing the burnt gas out the exhaust
  shot(11, function (u, d) { return [260, 150, lerp(1.2, 1.1, u / d)]; }, function (u, d, t) {
    var ang = 180 + 180 * clamp(u / (d - 0.4)), s = graphPaper(t) + cylinder(220, 80, ang, t, { exV: 1, smoke: true, exhaust: true });
    s += '<path d="M330 50 H420 V70 H460" stroke="#5a6068" stroke-width="14" fill="none"/>'; for (var e = 0; e < 6; e++) { var eu = (t + e / 6) % 1; s += '<circle cx="' + f(470 + eu * 60) + '" cy="' + f(70 - eu * 30) + '" r="' + f(6 + eu * 10) + '" fill="#8a857a" opacity="' + f(0.7 * (1 - eu)) + '"/>'; }
    return s + tag("الشكمان", 440, 120, u, 0.6, 3, 16);
  });
  // 12 — in a four-cylinder engine at 3,000 rpm this happens a hundred times a second (tach + 4 cylinders flashing)
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var rpm = clamp(u / 1.2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + tacho(150, 170, 90, 3 * rpm / 7, "x1000 rpm");
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * 25) + [0, 2, 3, 1][k]) % 4 === 0; s += '<rect x="' + (330 + k * 60) + '" y="110" width="44" height="90" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (352 + k * 60) + '" cy="130" r="26" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(100 * clamp((u - 0.6) / 1.4)); s += '<g transform="translate(440 260)"><rect x="-110" y="-24" width="220" height="44" rx="10" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 19px Noto Sans Arabic;fill:' + YEL + '">' + n + ' مرة في الثانية!</text></g>';
    return s;
  });
  // 13 — but the piston goes up and down, and the wheel goes round: how?
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), y = 170 + 50 * Math.sin(t * 6);
    s += '<rect x="140" y="60" width="80" height="220" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2.4"/><rect x="146" y="' + f(y - 30) + '" width="68" height="40" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/>' + arrow(250, 120, 250, 220, INK, 4, 1) + arrow(250, 220, 250, 120, INK, 4, 1) + wheel(470, 170, 70, t * 200) + curl(470, 170, 100, -0.6, 2.2, YEL, 5, 1);
    return s + qmark(340, 120, t, 60);
  });
  // 14 — the pistons are joined to the crankshaft, which turns up-and-down into round-and-round, like a bike's pedals
  shot(14, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var a = t * 4, s = graphPaper(t) + cylinder(180, 70, (a * 57.3) % 360, t, {});
    var px = 470 + 40 * Math.sin(a), py = 220 - 40 * Math.cos(a);
    s += '<circle cx="470" cy="220" r="48" fill="none" stroke="#9a958c" stroke-width="2" stroke-dasharray="6 5"/><path d="M470 220 L' + f(px) + ' ' + f(py) + '" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><rect x="' + f(px - 16) + '" y="' + f(py - 5) + '" width="32" height="10" rx="3" fill="' + INK + '"/>';
    s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(430 + 10 * Math.sin(a)) + ' 110 L460 30" stroke="#2f6f9f" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="470" cy="220" r="10" fill="#5a6068"/>';
    return s + tag("عمود الكرنك", 180, 330, u, 0.4, -3, 17) + tag("زي بدّال العجلة", 470, 330, u, 1.8, 3, 16);
  });
  // 15 — then the gearbox: gears of different sizes
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var a = t * 2, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a48"/><rect x="60" y="40" width="520" height="280" rx="20" fill="#5a6068" opacity=".35" stroke="#8a929c" stroke-width="3"/>';
    s += gear(160, 130, 40, 14, a) + gear(242, 130, 30, 10, -a * 1.4 + 0.2) + gear(320, 130, 22, 8, a * 1.9) + gear(400, 130, 30, 10, -a * 1.4) + gear(480, 130, 40, 14, a);
    s += gear(160, 240, 26, 9, -a * 1.6) + gear(232, 240, 36, 12, a * 1.15) + gear(320, 240, 46, 16, -a * 0.9) + gear(420, 240, 36, 12, a * 1.15);
    s += '<path d="M40 180 H600" stroke="#c9ced4" stroke-width="10"/>';
    return s + tag("الفتيس", 320, 30, u, 0.4, -3, 20);
  });
  // 16 — the small gear gives a lot of force to pull away; the big one gives speed on the road (two pairs, two speeds)
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), a = t * 3;
    s += gear(110, 130, 20, 7, a * 2.5) + gear(180, 130, 50, 17, -a * 1.0) + '<text x="150" y="220" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">قوة 💪</text>';
    s += gear(420, 130, 46, 16, a * 2.5) + gear(510, 130, 24, 8, -a * 4.8) + '<text x="470" y="220" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">سرعة</text>';
    s += '<g transform="translate(150 290) scale(.45)">' + car(0, 0, t, { spin: t * 80 }) + '</g><g transform="translate(470 290) scale(.45)">' + car(0, 0, t, { spin: t * 900 }) + '</g>';
    for (var k = 0; k < 5; k++) { var ku = (t * 2.4 + k / 5) % 1; s += '<path d="M' + f(420 - ku * 80) + ' ' + (280 + k * 4) + ' h-24" stroke="' + INK + '" stroke-width="2" opacity="' + f(1 - ku) + '"/>'; }
    return s.replace("قوة 💪", "قوة") + tag("من الوقفة", 150, 40, u, 0.4, -3, 15) + tag("على الطريق", 470, 40, u, 1.6, 3, 15);
  });
  // 17 — from the gearbox a shaft carries the turning to the wheels (car cut away, shaft spinning)
  shot(17, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 80, 20, 6, 0.8) + road(t, 250, 500) + car(320, 222, t, { spin: t * 700 });
    s += '<rect x="210" y="200" width="200" height="16" fill="#2b2e33" opacity=".85"/><rect x="380" y="194" width="50" height="28" rx="4" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 10; k++) s += '<path d="M' + f(214 + ((k * 20 + t * 300) % 196)) + ' 202 v12" stroke="' + YEL + '" stroke-width="3"/>';
    return s + tag("عمود الكردان", 300, 120, u, 0.5, -3, 16) + tag("للعجل", 220, 300, u, 1.4, 3, 15);
  });
  // 18 — a clever gear, the differential, lets the outer wheel turn faster than the inner one round corners (top view + inset)
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#9dbb6e"/>', a = t * 0.5;
    s += '<circle cx="320" cy="420" r="300" fill="none" stroke="#5a5752" stroke-width="80"/><circle cx="320" cy="420" r="300" fill="none" stroke="#e9e4d8" stroke-width="3" stroke-dasharray="20 16"/>';
    var ang = -Math.PI / 2 + 0.6 * Math.sin(a), cx = 320 + 300 * Math.cos(ang), cy = 420 + 300 * Math.sin(ang);
    s += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(ang * 57.3 + 90) + ')"><rect x="-50" y="-26" width="100" height="52" rx="12" fill="url(#gCar)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-14" y="-22" width="36" height="44" rx="6" fill="#9fd2e8" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<rect x="-42" y="-34" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="-42" y="24" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="22" y="-34" width="22" height="10" rx="3" fill="#1c1c1c"/><rect x="22" y="24" width="22" height="10" rx="3" fill="#1c1c1c"/></g>';
    s += '<path d="M' + f(320 + 340 * Math.cos(ang - 0.3)) + ' ' + f(420 + 340 * Math.sin(ang - 0.3)) + ' A340 340 0 0 1 ' + f(320 + 340 * Math.cos(ang)) + ' ' + f(420 + 340 * Math.sin(ang)) + '" stroke="' + RED + '" stroke-width="5" fill="none"/><path d="M' + f(320 + 262 * Math.cos(ang - 0.3)) + ' ' + f(420 + 262 * Math.sin(ang - 0.3)) + ' A262 262 0 0 1 ' + f(320 + 262 * Math.cos(ang)) + ' ' + f(420 + 262 * Math.sin(ang)) + '" stroke="' + BLUE + '" stroke-width="5" fill="none"/>';
    var p = pop((u - 1.0) / 0.8); if (p > 0) s += '<g transform="translate(520 260) scale(' + f(p) + ')"><circle r="66" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>' + gear(0, 0, 34, 14, t * 2, "url(#gBrass)") + gear(-40, 0, 14, 7, -t * 5) + gear(40, 0, 14, 7, -t * 3) + '</g>';
    return s + tag("الدفرنس", 520, 170, u, 1.2, 3, 17) + tag("برا أسرع", 130, 60, u, 2.0, -3, 15, "#ffb08a");
  });
  // 19 — the first long trip by car was made by a woman, Bertha Benz, in 1888 (sepia, the Patent-Motorwagen)
  shot(19, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/>' + clouds(t, 30, 10, 5, 0.5) + '<rect x="-400" y="250" width="1440" height="300" fill="#c9a87a"/>';
    for (var tr = 0; tr < 8; tr++) { var tx = ((tr * 120 - t * 40) % 960 + 960) % 960 - 160; s += '<path d="M' + f(tx) + ' 250 V190" stroke="#7a5a3a" stroke-width="6"/><circle cx="' + f(tx) + '" cy="180" r="22" fill="#8a9a5a" opacity=".7"/>'; }
    s += motorwagen(330, 240, t, { s: 1.1, smoke: true }) + bertha(330, 124, t, "happy", { s: 0.5 });
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".18"/>';
    var y = Math.round(lerp(2026, 1888, clamp(u / 1.6))); s += '<g transform="translate(130 50)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("بيرتا بنز", 500, 60, u, 1.0, 3, 19);
  });
  // 20 — she took her husband Karl's car without him knowing and drove about 100 km (map Mannheim → Pforzheim, Karl asleep)
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9dcc0"/>', k = clamp(u / (d - 0.6));
    s += '<path d="M100 100 C200 140 300 120 380 200 C430 250 500 260 560 280" stroke="#c9a87a" stroke-width="16" fill="none"/><path d="M100 100 C200 140 300 120 380 200 C430 250 500 260 560 280" stroke="' + RED + '" stroke-width="4" fill="none" stroke-dasharray="' + f(560 * k) + ' 900"/>';
    s += '<circle cx="100" cy="100" r="8" fill="' + INK + '"/><text x="100" y="80" text-anchor="middle" style="font:800 14px Noto Serif;fill:' + INK + ';direction:ltr">Mannheim</text><circle cx="560" cy="280" r="8" fill="' + INK + '"/><text x="560" y="310" text-anchor="middle" style="font:800 14px Noto Serif;fill:' + INK + ';direction:ltr">Pforzheim</text>';
    var bx = lerp(100, 560, k), by = k < 0.5 ? lerp(100, 200, k * 2) : lerp(200, 280, (k - 0.5) * 2); s += '<g transform="translate(' + f(bx) + ' ' + f(by - 14) + ') scale(.35)">' + motorwagen(0, 0, t, {}) + '</g>';
    s += '<g transform="translate(140 240)"><rect x="-60" y="10" width="120" height="30" fill="#7a5230" stroke="' + INK + '" stroke-width="2"/>' + head(0, 0, 26, "n", t * 0 + 1.5, 0) + '<text x="34" y="' + f(-20 - 6 * Math.sin(t * 2)) + '" style="font:800 16px Noto Serif;fill:' + INK + '">z z z</text></g>';
    var km = Math.round(100 * k); s += '<g transform="translate(420 90)"><rect x="-60" y="-18" width="120" height="34" rx="9" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + YEL + '">' + km + ' كم</text></g>';
    return s + tag("كارل نايم!", 140, 320, u, 0.8, -3, 15);
  });
  // 21 — she bought fuel at a pharmacy, and when the fuel pipe clogged she cleared it with her hat pin!
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="40" y="40" width="240" height="220" fill="#c9a87a" stroke="' + INK + '" stroke-width="3"/><rect x="60" y="56" width="200" height="34" fill="#2f6a3a" stroke="' + INK + '" stroke-width="2"/><text x="160" y="80" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#fbf6e6">صيدلية</text>';
    for (var b = 0; b < 6; b++) s += '<rect x="' + (70 + b * 32) + '" y="' + (120 + (b % 2) * 50) + '" width="18" height="34" rx="4" fill="' + ["#9fd2e8", "#c9a04e", "#9dbb6e"][b % 3] + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<g transform="translate(' + f(lerp(160, 340, clamp(u / 1.2))) + ' 200)"><rect x="-14" y="-40" width="28" height="44" rx="5" fill="#c9a04e" stroke="' + INK + '" stroke-width="2"/><text y="-12" text-anchor="middle" style="font:700 8px Noto Serif;fill:' + INK + ';direction:ltr">Ligroin</text></g>';
    var pk = clamp((u - 1.8) / 1.0), pinX = lerp(560, 470, ease(pk)); s += '<rect x="380" y="150" width="200" height="22" rx="10" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(pinX) + ' 161 H' + f(pinX + 110) + '" stroke="#5a6068" stroke-width="3"/><circle cx="' + f(pinX + 112) + '" cy="161" r="7" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.6"/>';
    if (pk >= 1) for (var q = 0; q < 6; q++) { var qu = (t * 1.6 + q / 6) % 1; s += '<circle cx="' + f(380 - qu * 60) + '" cy="161" r="3" fill="' + YEL + '" opacity="' + f(1 - qu) + '"/>'; }
    return s + tag("بنزين من الصيدلية!", 160, 300, u, 0.5, -3, 15) + tag("دبوس البرنيطة!", 480, 100, u, 1.9, 3, 16);
  });
  // 22 — since then the idea is the same: a small bang turns a shaft turns the wheels
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + boom(110, 170, 50, (t * 1.6) % 1) + '<circle cx="110" cy="170" r="20" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2"/>' + arrow(160, 170, 220, 170, INK, 5, clamp(u / 0.5));
    s += '<rect x="230" y="160" width="140" height="20" rx="8" fill="url(#gSteelT)" stroke="' + INK + '" stroke-width="2"/>'; for (var k = 0; k < 6; k++) s += '<path d="M' + f(236 + ((k * 24 + t * 200) % 130)) + ' 162 v16" stroke="' + YEL + '" stroke-width="3"/>';
    s += arrow(380, 170, 440, 170, INK, 5, clamp((u - 0.6) / 0.5)) + wheel(520, 170, 56, t * 300);
    return s + tag("انفجار", 110, 260, u, 0.3, -3, 15) + tag("عمود", 300, 260, u, 0.8, 3, 15) + tag("عجل", 520, 270, u, 1.3, -3, 15);
  });
  // 23 — so every time you press the accelerator you're asking for more explosions a second (foot down, tach up, faster flashes)
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var p = ease(clamp((u - 0.2) / 0.8)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2e33"/>' + tacho(470, 150, 80, lerp(0.12, 0.85, p) + 0.02 * Math.sin(t * 20), "x1000 rpm");
    s += '<g transform="translate(180 250) rotate(' + f(-20 + 18 * p) + ')"><rect x="-30" y="-70" width="60" height="110" rx="10" fill="#5a6068" stroke="' + INK + '" stroke-width="2.4"/></g><path d="M80 80 L' + f(170 + 10 * p) + ' ' + f(200 + 20 * p) + '" stroke="#2f2a26" stroke-width="40" stroke-linecap="round"/>';
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * lerp(6, 40, p)) + k) % 4 === 0; s += '<rect x="' + (300 + k * 40) + '" y="260" width="30" height="60" rx="4" fill="#5a6068" stroke="#8a929c"/>' + (on ? '<circle cx="' + (315 + k * 40) + '" cy="272" r="18" fill="url(#gBoom)"/>' : ''); }
    return s + tag("انفجارات أكتر!", 470, 260, u, 1.2, 3, 17);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + car(300, 160, t, { hood: true, flash: true, s: 0.8 });
    return s + qmark(500, 80, t, 56) + qmark(550, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { car: car, road: road, cylinder: cylinder, gear: gear, tacho: tacho, motorwagen: motorwagen, bertha: bertha, boom: boom, wheel: wheel, tag: tag };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
