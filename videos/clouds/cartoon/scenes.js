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

  // ── «السحابة وزنها كام؟ وإزاي مش بتقع؟» — cartoon pieces (real shapes: see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", CLIPN = 0, YEL = "#f2c230";
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="' + (o.shirt || "#e8742e") + '" stroke="' + INK + '" stroke-width="3"/>' + (o.hat === false ? "" : '<path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>');
    s += head(0, -34, 40, mood, t, o.look);
    if (o.hat !== false) s += '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/><path d="M0 -88 V-54" stroke="#d9d3c4" stroke-width="6"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="' + (o.shirt || "#e8742e") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.wave) { var wy = -30 + Math.sin(t * 7) * 10; s += '<path d="M44 60 Q86 20 92 ' + f(wy) + '" stroke="' + (o.shirt || "#e8742e") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="92" cy="' + f(wy - 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>'; }
    return s + '</g>';
  }
  function guy(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s, hat: false, shirt: "#3f8f7a" }, o || {})); }
  function hardHat(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s }, o || {})); }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function txt(s, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 800) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + '">' + s + '</text>'; }
  // a cloud droplet: a round blue ball, with a face when it is a character (mood) — real droplets are spheres, not teardrops
  function wdrop(x, y, r, mood, t, o) {
    o = o || {}; var b = Math.sin(t * 3 + x * .05) * r * 0.08, s = '<g transform="translate(' + f(x) + ' ' + f(y + b) + ')"><circle r="' + f(r) + '" fill="url(#dropG)" stroke="' + INK + '" stroke-width="' + f(Math.max(1, r / 9)) + '"/>';
    s += '<ellipse cx="' + f(-r * 0.4) + '" cy="' + f(-r * 0.45) + '" rx="' + f(r * 0.18) + '" ry="' + f(r * 0.28) + '" fill="#fff" opacity=".6" transform="rotate(-30 ' + f(-r * 0.4) + ' ' + f(-r * 0.45) + ')"/>';
    if (mood) {
      var blink = ((t * 0.5 + x * 0.013) % 1) < 0.05, pr = r * (mood === "shock" ? 0.08 : 0.12);
      s += '<circle cx="' + f(-r * 0.32) + '" cy="' + f(-r * .05) + '" r="' + f(r * 0.22) + '" fill="#fff"/><circle cx="' + f(r * 0.32) + '" cy="' + f(-r * .05) + '" r="' + f(r * 0.22) + '" fill="#fff"/>';
      if (!blink) s += '<circle cx="' + f(-r * 0.28) + '" cy="' + f(-r * .02) + '" r="' + f(pr) + '" fill="' + INK + '"/><circle cx="' + f(r * 0.36) + '" cy="' + f(-r * .02) + '" r="' + f(pr) + '" fill="' + INK + '"/>';
      s += mood === "happy" ? '<path d="M' + f(-r * 0.3) + ' ' + f(r * 0.38) + ' q' + f(r * 0.3) + ' ' + f(r * 0.3) + ' ' + f(r * 0.6) + ' 0" stroke="' + INK + '" stroke-width="' + f(r / 10) + '" fill="none" stroke-linecap="round"/>' : mood === "shock" ? '<ellipse cx="0" cy="' + f(r * 0.5) + '" rx="' + f(r * 0.12) + '" ry="' + f(r * 0.17) + '" fill="' + INK + '"/>' : '<path d="M' + f(-r * 0.18) + ' ' + f(r * 0.48) + ' h' + f(r * 0.36) + '" stroke="' + INK + '" stroke-width="' + f(r / 11) + '" stroke-linecap="round"/>';
    }
    return s + '</g>';
  }
  // a fair-weather cumulus: heaped round turrets, one ink outline, a flat shaded base at y. o: {dark, mood, list}
  var CUMULUS = [[-.80, -.10, .20], [-.55, -.26, .27], [-.22, -.50, .35], [.16, -.44, .37], [.50, -.24, .28], [.78, -.09, .19], [-.3, -.12, .3], [.1, -.12, .32], [.45, -.08, .25], [-.62, -.06, .22], [-.04, -.74, .25], [.36, -.62, .2]];
  var STORM = [[-.6, -.08, .24], [-.25, -.15, .32], [.2, -.15, .34], [.58, -.1, .26], [0, -.5, .42], [-.2, -.9, .37], [.2, -1.0, .39], [0, -1.4, .4], [-.15, -1.8, .38], [.2, -1.85, .36], [-.5, -.5, .3], [.5, -.6, .32], [-.45, -1.3, .3], [.48, -1.4, .3], [.15, -2.3, 1.25, .25], [.95, -2.32, .6, .19], [-.75, -2.3, .5, .19], [0, -2.1, .5, .3]];
  function cl(x, y, s, t, o) {
    o = o || {}; var list = o.list || CUMULUS, id = "cc" + (++CLIPN), a = "", b = "", x0 = 1e9, x1 = -1e9, top = 0, fill = o.dark ? "url(#stormG)" : "url(#cloudG)";
    list.forEach(function (p, i) {
      var k = 1 + .045 * Math.sin(t * 1.6 + i * 1.7), px = x + p[0] * s, py = y + p[1] * s, rx = p[2] * s * k, ry = (p[3] || p[2]) * s * k, e = '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"';
      a += e + ' fill="' + INK + '" stroke="' + INK + '" stroke-width="5"/>'; b += e + ' fill="' + fill + '"/>';
      var dy = (y - py) / ry; if (Math.abs(dy) < 1) { var w = rx * Math.sqrt(1 - dy * dy); x0 = Math.min(x0, px - w); x1 = Math.max(x1, px + w); } top = Math.min(top, p[1] - (p[3] || p[2]));
    });
    var H = -top * s + 30, g = '<clipPath id="' + id + '"><rect x="' + f(x - 3 * s) + '" y="' + f(y - H) + '" width="' + f(6 * s) + '" height="' + f(H) + '"/></clipPath><ellipse cx="' + f(x) + '" cy="' + f(y + 4) + '" rx="' + f(s * .8) + '" ry="' + f(s * .06) + '" fill="#1c1c1c" opacity=".12"/><g clip-path="url(#' + id + ')">' + a + b + '</g><path d="M' + f(x0 - 1) + ' ' + f(y) + ' L' + f(x1 + 1) + ' ' + f(y) + '" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
    if (o.mood) { var ey = y - s * .26, r = s * .075, blink = ((t * 0.45 + .2) % 1) < 0.05;
      g += blink ? '<path d="M' + f(x - s * .22) + ' ' + f(ey) + ' h' + f(s * .12) + ' M' + f(x + s * .1) + ' ' + f(ey) + ' h' + f(s * .12) + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' : '<circle cx="' + f(x - s * .16) + '" cy="' + f(ey) + '" r="' + f(r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(x + s * .16) + '" cy="' + f(ey) + '" r="' + f(r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(x - s * .15) + '" cy="' + f(ey + r * .2) + '" r="' + f(r * .45) + '" fill="' + INK + '"/><circle cx="' + f(x + s * .17) + '" cy="' + f(ey + r * .2) + '" r="' + f(r * .45) + '" fill="' + INK + '"/>';
      g += o.mood === "happy" ? '<path d="M' + f(x - s * .1) + ' ' + f(ey + s * .13) + ' q' + f(s * .1) + ' ' + f(s * .1) + ' ' + f(s * .2) + ' 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' : o.mood === "worry" ? '<path d="M' + f(x - s * .08) + ' ' + f(ey + s * .18) + ' q' + f(s * .08) + ' ' + f(-s * .07) + ' ' + f(s * .16) + ' 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M' + f(x + s * .36) + ' ' + f(ey - s * .12) + ' q' + f(s * .05) + ' ' + f(s * .08) + ' 0 ' + f(s * .12) + ' q' + f(-s * .05) + ' ' + f(-s * .04) + ' 0 ' + f(-s * .12) + ' Z" fill="#8fd0ee" stroke="' + INK + '" stroke-width="1.2"/>' : '<ellipse cx="' + f(x) + '" cy="' + f(ey + s * .16) + '" rx="' + f(s * .04) + '" ry="' + f(s * .05) + '" fill="' + INK + '"/>';
    }
    return g;
  }
  // African bush elephant in profile, facing left, feet on y, about 200×125 at s = 1
  var ELE_BODY = "M96 -92 C80 -112 30 -118 -8 -112 C-30 -124 -62 -126 -74 -108 C-84 -98 -90 -84 -90 -70 C-92 -48 -100 -30 -98 -14 C-97 -4 -86 -2 -84 -12 C-84 -26 -78 -44 -74 -58 C-68 -54 -60 -52 -54 -52 L-54 -4 C-54 0 -50 0 -48 0 L-30 0 C-26 0 -26 -2 -26 -6 L-24 -44 C0 -38 30 -38 46 -44 L46 -6 C46 0 48 0 52 0 L70 0 C74 0 74 -2 74 -6 L78 -50 C96 -62 102 -78 96 -92 Z";
  function elephant(x, y, t, s, mood) {
    var st = ' stroke="' + INK + '" stroke-width="' + f(2.4 / (s || 1)) + '" stroke-linejoin="round"', fl = Math.sin(t * 3 + x) * 4;
    var g = '<path d="M-22 -46 L-20 0 L-4 0 L-2 -44 Z M24 -46 L24 0 L40 0 L44 -46 Z" fill="#6c737c"' + st + '/><path d="' + ELE_BODY + '" fill="url(#eleG)"' + st + '/>';
    g += '<path d="M-50 -116 C-30 -124 ' + f(-6 + fl) + ' -112 ' + f(-6 + fl) + ' -92 C' + f(-6 + fl) + ' -72 -20 -52 -34 -50 C-44 -56 -52 -72 -54 -88 Z" fill="#8d949d"' + st + '/><path d="M-76 -62 C-86 -52 -98 -48 -110 -54 C-98 -42 -82 -46 -72 -56 Z" fill="#f7f1e1"' + st + '/>';
    g += '<circle cx="-69" cy="-97" r="' + (mood === "shock" ? 6 : 4.5) + '" fill="#fff"' + st + '/><circle cx="-70" cy="-96.500" r="2.2" fill="' + INK + '"/><path d="M97 -88 C106 -70 104 -52 100 -40" fill="none"' + st + '/>';
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + g + '</g>';
  }
  // a glass box in oblique view: front face x,y,w,h and a depth offset (dx,-dy); k = how far the edges have drawn, tint = air inside
  function box(x, y, w, h, dx, dy, tint) {
    var s = '<rect x="' + (x + dx) + '" y="' + (y - dy) + '" width="' + w + '" height="' + h + '" fill="' + (tint ? "#8fc2e8" : "#fff") + '" opacity="' + (tint ? .35 : .1) + '" stroke="none"/>';
    s += '<path d="M' + (x + dx) + ' ' + (y - dy) + ' h' + w + ' v' + h + ' h-' + w + ' Z M' + x + ' ' + (y + h) + ' l' + dx + ' -' + dy + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="5 5" opacity=".7"/>';
    return { back: s, front: '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (tint ? "#8fc2e8" : "#fff") + '" opacity="' + (tint ? .3 : .12) + '"/><path d="M' + x + ' ' + y + ' h' + w + ' v' + h + ' h-' + w + ' Z M' + x + ' ' + y + ' l' + dx + ' -' + dy + ' M' + (x + w) + ' ' + y + ' l' + dx + ' -' + dy + ' M' + (x + w) + ' ' + (y + h) + ' l' + dx + ' -' + dy + '" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' };
  }
  function hl(d, k) { k = clamp(k); return k <= 0 ? "" : '<path d="' + d + '" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="' + (1 - k).toFixed(3) + '" stroke="' + YEL + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
  // arrows of rising air in a column at x, flowing from y1 up to y0
  function rising(x, y0, y1, t, col, k, w) {
    k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var s = "", Lh = y1 - y0, n = Math.max(2, Math.round(Lh / 70));
    for (var i = 0; i < n; i++) { var p = ((i / n + t * .35) % 1 + 1) % 1, yy = y1 - p * Lh; s += '<g opacity="' + f(Math.sin(p * Math.PI) * k) + '">' + arrow(x + 5 * Math.sin(p * 6 + i), yy, x + 5 * Math.sin(p * 6 + i + .6), yy - 34, col, w || 6) + '</g>'; }
    return s;
  }
  function rain(x0, x1, y0, y1, t, n) { var s = ""; for (var i = 0; i < (n || 40); i++) { var x = x0 + hash(i + 2) * (x1 - x0), Lh = y1 - y0, y = y0 + ((hash(i + 60) * Lh + t * (260 + 120 * hash(i))) % Lh); s += '<path d="M' + f(x) + ' ' + f(y) + ' l-3 16" stroke="#bfe6ff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>'; } return s; }
  function land(t, o) { o = o || {}; return sky(o.sky || "day") + (o.noClouds ? "" : clouds(t, 12, 30, 3, 0.55)) + city(t, 300, o.h || 70, o.col || "#b9a98a", true, 3, false) + grass(t, 300, "grass-" + (o.grass || "day"), "#5f8a3c"); }
  // a balance: pivot at (320, 120); ang > 0 tips the right pan down. left / right = what sits on each pan (drawn around 0,0 = pan centre)
  function balance(ang, left, right) {
    var a = ang * Math.PI / 180, R = 190, s = '<path d="M300 310 L320 118 L340 310 Z" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2.6"/><rect x="250" y="304" width="140" height="14" rx="5" fill="#4b5056" stroke="' + INK + '" stroke-width="2.4"/>';
    [-1, 1].forEach(function (sd) { var px = 320 + sd * R * Math.cos(a), py = 120 + sd * R * Math.sin(a);
      s += '<path d="M' + f(px) + ' ' + f(py) + ' L' + f(px - 46) + ' ' + f(py + 78) + ' M' + f(px) + ' ' + f(py) + ' L' + f(px + 46) + ' ' + f(py + 78) + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(px - 58) + ' ' + f(py + 78) + ' h116 q-8 16 -58 16 q-50 0 -58 -16 Z" fill="#c9a24a" stroke="' + INK + '" stroke-width="2.4"/><g transform="translate(' + f(px) + ' ' + f(py + 78) + ')">' + (sd < 0 ? left : right) + '</g>'; });
    return s + '<g transform="rotate(' + f(ang) + ' 320 120)"><rect x="124" y="114" width="392" height="12" rx="6" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2.4"/></g><circle cx="320" cy="120" r="10" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2.4"/>';
  }
  function kettle(x, y, t) {
    var s = '<path d="M-70 0 C-78 -40 -62 -96 -40 -104 L40 -104 C62 -96 78 -40 70 0 Z" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2.8" stroke-linejoin="round"/><path d="M-40 -104 C-30 -118 30 -118 40 -104 Z" fill="#6a727c" stroke="' + INK + '" stroke-width="2.4"/><circle cx="0" cy="-121" r="8" fill="' + INK + '"/>';
    s += '<path d="M62 -52 L112 -96 L120 -84 L72 -24 Z" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-44 -102 C-70 -170 70 -170 44 -102" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-44 -102 C-70 -170 70 -170 44 -102" fill="none" stroke="#3a3d42" stroke-width="5" stroke-linecap="round"/><path d="M-52 -20 C-58 -50 -50 -80 -40 -92" stroke="#fff" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>';
    for (var i = 0; i < 7; i++) s += '<path d="M' + (-60 + i * 20) + ' 22 q7 -11 0 -22 q-7 11 0 22 Z" fill="#4aa3df" stroke="' + INK + '" stroke-width="1" transform="translate(0 ' + f(2 * Math.sin(t * 9 + i)) + ')"/>';
    return '<g transform="translate(' + x + ' ' + y + ')">' + s + '</g>';
  }
  function mist(x, y, s, t, k) { var g = ""; for (var i = 0; i < 9; i++) { var p = ((i / 9 + t * .22) % 1); g += '<circle cx="' + f(x + Math.sin(i * 2.4 + t) * 14 * p * s + p * 30 * s) + '" cy="' + f(y - p * 120 * s) + '" r="' + f((12 + p * 26) * s) + '" fill="#fff" opacity="' + f(.85 * Math.sin(p * Math.PI) * k) + '" filter="url(#soft2)"/>'; } return g; }
  function crystal(x, y, r, rot) { var s = ""; for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; s += '<path d="M0 0 L' + f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a)) + ' M' + f(.55 * r * Math.cos(a)) + ' ' + f(.55 * r * Math.sin(a)) + ' L' + f(.8 * r * Math.cos(a + .35)) + ' ' + f(.8 * r * Math.sin(a + .35)) + ' M' + f(.55 * r * Math.cos(a)) + ' ' + f(.55 * r * Math.sin(a)) + ' L' + f(.8 * r * Math.cos(a - .35)) + ' ' + f(.8 * r * Math.sin(a - .35)) + '" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>'; } return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><circle r="' + f(r * 1.15) + '" fill="#2f7fb8" stroke="' + INK + '" stroke-width="2"/>' + s + '</g>'; }
  function xmark(x, y, s, k) { k = clamp(k); if (k <= 0) return ""; return '<g transform="translate(' + x + ' ' + y + ') scale(' + f(s * pop(k)) + ')"><path d="M-26 -26 L26 26 M26 -26 L-26 26" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M-26 -26 L26 26 M26 -26 L-26 26" stroke="#e23b2e" stroke-width="10" stroke-linecap="round"/></g>'; }
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function push(x, y, z0, z1) { return function (u, d) { return [x, y, lerp(z0, z1, clamp(u / d))]; }; }

  // ── shots ───────────────────────────────────────────────
  // 0 — the cloud over your head: someone in the street looks up
  shot(0, function (u, d) { var k = ease(u / d); return [lerp(210, 330, k), lerp(240, 165, k), lerp(1.35, 1.0, k)]; }, function (u, d, t) {
    return land(t) + cl(370 + 10 * Math.sin(t * .7), 130 + 4 * Math.sin(t * 1.5), 135, t) + guy(140, 266, .5, t, "curious", { look: 1 }) + tag("فوقك بالظبط", 520, 215, u, .7, 3, 19);
  });
  // 1 — heavier than a hundred elephants: the cloud tips a balance against the herd
  shot(1, push(320, 185, 1.0, 1.08), function (u, d, t) {
    var ang = -13 * ease(u / 1.0) + 1.5 * Math.sin(t * 2.4);
    var herd = elephant(-24, 0, t, .3) + elephant(36, 0, t + 1, .3) + elephant(6, -38, t + 2, .3, "shock");
    return sky("day") + clouds(t, 12, 30, 3, 0.5) + grass(t, 316, "grass-day", "#5f8a3c") + balance(ang, cl(0, 0, 62, t, { mood: "happy" }), herd) + tag("100 فيل!", 520, 70, u, .6, 3, 24, YEL) + tag("أتقل", 110, 60, u, 1.1, -4, 22);
  });
  // 2 — and yet it floats and doesn't fall
  shot(2, push(320, 175, 1.08, 1.0), function (u, d, t) {
    var s = land(t) + cl(330 + 10 * Math.sin(t * .8), 120 + 6 * Math.sin(t * 1.6), 120, t, { mood: "happy" });
    for (var i = 0; i < 4; i++) s += '<path d="M330 ' + (150 + i * 30 + ((t * 30) % 30)) + ' v14" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>';
    return s + xmark(330, 215, .8, (u - .9) / .4) + hardHat(110, 266, .5, t, "shock", { look: 1 }) + qmark(205, 200, t, 40) + tag("مش بتقع!", 520, 240, u, 1.0, 3, 22);
  });
  // 3 — «إيه الحكاية؟»
  shot(3, push(320, 180, 1.0, 1.1), function (u, d, t) {
    return land(t, { sky: "dusk", col: "#7a6a5a" }) + cl(320 + 12 * Math.sin(t * .8), 170 + 5 * Math.sin(t * 1.6), 110, t, { mood: "happy" }) + rising(250, 190, 290, t, "#bfe0ff", 1, 5) + rising(390, 190, 290, t + .4, "#bfe0ff", 1, 5) + tag("إيه الحكاية؟", 320, 62, u, 0.1, -2, 34, YEL);
  });
  // 4 — an ordinary summer cloud, a kilometre each way: the cloud inside a kilometre glass box
  function kmBox(t, tint) { var b = box(200, 45, 220, 210, 56, 38, tint); return b.back + cl(340 + 6 * Math.sin(t * .8), 205, 96, t) + b.front; }
  shot(4, push(330, 175, 1.12, 0.98), function (u, d, t) {
    return land(t, { h: 34, noClouds: true }) + clouds(t, 40, 20, 3, 0.6) + birds(t, 60, 70) + kmBox(t) + hl("M200 255 H420", (u - d * .36) / .4) + hl("M420 255 L476 217", (u - d * .56) / .4) + hl("M200 255 V45", (u - d * .78) / .4) +
      tag("1 كم", 300, 286, u, d * .36, -2, 20, YEL) + tag("1 كم", 512, 250, u, d * .56, 3, 20, YEL) + tag("1 كم", 150, 150, u, d * .78, -3, 20, YEL);
  });
  // 5 — each cubic metre holds about half a gram of water
  shot(5, push(320, 180, 1.0, 1.1), function (u, d, t) {
    var b = box(190, 80, 200, 200, 50, 34), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#dfeaf3"/>' + clouds(t, 20, 40, 5, 0.9, 1.6) + clouds(t, -14, 220, 4, 0.8, 1.8) + b.back;
    for (var i = 0; i < 44; i++) s += '<circle cx="' + f(215 + hash(i) * 200 + 5 * Math.sin(t * 1.3 + i)) + '" cy="' + f(60 + ((hash(i + 50) * 210 + t * 9) % 210)) + '" r="' + f(1.6 + hash(i + 7) * 1.8) + '" fill="#2f7fb8"/>';
    return s + b.front + wdrop(520, 235, 30, "happy", t) + tag("متر مكعب واحد", 290, 304, u, .4, -2, 19) + tag("نص جرام مية بس!", 500, 150, u, 1.7, 3, 21, YEL);
  });
  // 6 — times a thousand million cubic metres = 500 tonnes = a hundred elephants
  shot(6, push(320, 180, 1.0, 1.06), function (u, d, t) {
    var s = land(t) + cl(120 + 6 * Math.sin(t), 120, 70, t), k = u - d * .76;
    s += tag("½ جرام × مليار متر مكعب", 400, 60, u, .3, -2, 19) + tag("= 500 طن", 400, 130, u, d * .42, 2, 34, YEL);
    for (var i = 0; i < 6; i++) { var x = 700 - Math.max(0, k) * 380 + i * 105; if (k > 0) s += elephant(Math.max(60 + i * 105, x), 318 + 2 * Math.abs(Math.sin(t * 6 + i)), t + i, .48); }
    return s + tag("= 100 فيل", 400, 215, u, d * .78, -3, 26);
  });
  // 7 — so how does all that weight not fall?
  shot(7, push(320, 190, 1.1, 1.0), function (u, d, t) {
    var sw = 5 * Math.sin(t * 2.2), cy = 110 + 5 * Math.sin(t * 1.6);
    var w = '<g transform="rotate(' + f(sw) + ' 320 ' + f(cy) + ')"><path d="M320 ' + f(cy) + ' V' + f(cy + 80) + '" stroke="' + INK + '" stroke-width="3"/><circle cx="320" cy="' + f(cy + 86) + '" r="9" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M270 ' + f(cy + 96) + ' H370 L392 ' + f(cy + 170) + ' H248 Z" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' + txt("500 طن", 320, cy + 146, 26) + '</g>';
    return land(t) + w + cl(320, cy, 125, t, { mood: "worry" }) + hardHat(95, 266, .5, t, "curious", { look: 1 }) + qmark(520, 190, t, 70);
  });
  // 8 — a small rule first: the blackboard
  shot(8, push(330, 170, 1.0, 1.1), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d8bb"/><rect x="-400" y="290" width="1440" height="300" fill="#b89a6c"/><rect x="178" y="38" width="384" height="214" rx="6" fill="#8a5a34" stroke="' + INK + '" stroke-width="3"/><rect x="190" y="50" width="360" height="190" fill="#2f5a46" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 12; i++) s += '<circle cx="' + f(200 + hash(i) * 340) + '" cy="' + f(60 + ((hash(i + 4) * 170 + t * 12) % 170)) + '" r="1.4" fill="#fff" opacity=".35"/>';
    s += '<g opacity="' + f(clamp((u - .3) / .4)) + '">' + txt("قاعدة صغيرة", 370, 98, 26, YEL) + '</g><g opacity="' + f(clamp((u - 1.2) / .4)) + '">' + txt("كل ما الحاجة تصغر", 370, 150, 24) + txt("الهوا يفرملها أكتر", 370, 196, 24) + '</g>';
    return s + hardHat(90, 250, .7, t, "happy", { point: true, look: 1 });
  });
  // 9 — the smaller a thing is, the more the air brakes it: a boulder, a pebble and a speck falling
  shot(9, push(320, 180, 1.06, 1.0), function (u, d, t) {
    var s = sky("day") + clouds(t, 10, 40, 4, 0.5), X = [130, 330, 510], Rr = [44, 17, 5], V = [420, 170, 22];
    X.forEach(function (x, i) { var y = -60 + ((t * V[i] + i * 150) % 480), r = Rr[i];
      for (var j = 0; j < 4 - i; j++) s += '<path d="M' + f(x - r * .6 + j * r * .4) + ' ' + f(y - r - 8) + ' v-' + f(V[i] * .14) + '" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>';
      s += '<circle cx="' + x + '" cy="' + f(y) + '" r="' + r + '" fill="url(#gDisc)" stroke="' + INK + '" stroke-width="' + (i == 2 ? 1.4 : 2.6) + '"/>';
      if (u > .6) s += arrow(x, y + r + 16 + [16, 26, 38][i], x, y + r + 8, "#bfe0ff", [5, 5, 4][i]); });
    return s + tag("سريع", 130, 306, u, .8, -3, 21) + tag("بطيء جدًا", 505, 306, u, 1.7, 3, 21, YEL);
  });
  // 10 — the water is in tiny droplets, thousands of millions of them: inside the cloud
  function inside(t, n, vy) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d6e4ef"/>' + clouds(t, 26, 30, 5, 0.95, 1.8) + clouds(t, -18, 230, 5, 0.9, 2);
    for (var i = 0; i < n; i++) { var x = -60 + hash(i + 3) * 760 + 8 * Math.sin(t * 1.2 + i), y = ((hash(i + 40) * 460 + t * vy * (.7 + .6 * hash(i))) % 460 + 460) % 460 - 50; s += wdrop(x, y, 5 + hash(i + 9) * 8, null, t); } return s; }
  shot(10, push(320, 180, 1.25, 1.0), function (u, d, t) {
    return inside(t, 46, 8) + wdrop(230, 200, 24, "happy", t) + wdrop(420, 150, 18, "n", t) + wdrop(360, 260, 15, "happy", t) + tag("نقط صغيرة جدًا", 470, 70, u, d * .3, 3, 21) + tag("مليارات!", 150, 80, u, d * .68, -4, 26, YEL);
  });
  // 11 — a droplet is about 20 microns across, thinner than a hair (about 70): both at the same scale
  shot(11, push(320, 180, 1.0, 1.1), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#24475a"/>', i;
    for (i = 0; i < 30; i++) s += '<circle cx="' + f(-100 + hash(i) * 840) + '" cy="' + f(((hash(i + 5) * 420 + t * 10) % 420) - 30) + '" r="' + f(1 + hash(i + 2) * 2) + '" fill="#fff" opacity=".25"/>';
    s += '<path d="M-80 330 L720 170" stroke="' + INK + '" stroke-width="146" stroke-linecap="round"/><path d="M-80 330 L720 170" stroke="#7a5a44" stroke-width="140" stroke-linecap="round"/><path d="M-80 300 L720 140" stroke="#a07c62" stroke-width="30" opacity=".5"/>';
    for (i = 0; i < 12; i++) { var x = -40 + i * 62, y = 322 - (x + 80) * .2; s += '<path d="M' + x + ' ' + f(y - 66) + ' q22 60 -4 132" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".45"/>'; }
    return s + wdrop(190, 95 + 6 * Math.sin(t * 2.4), 20, "happy", t) + tag("نقطة السحاب: 20 ميكرون", 400, 60, u, .5, -2, 19, YEL) + tag("شعرة راسك: 70 ميكرون", 400, 250, u, d * .58, 3, 19);
  });
  // 12 — it sinks about a centimetre a second, like the dust you see in a sunbeam
  shot(12, push(320, 180, 1.0, 1.08), function (u, d, t) {
    var k = clamp((u - d * .56) / .5), i, y = 20 + ((t * 26) % 300);
    var a = sky("day") + clouds(t, 45, 40, 4, 0.6) + birds(t, 80, 80); for (i = 0; i < 8; i++) a += wdrop(330 + hash(i + 2) * 300, ((hash(i + 30) * 400 + t * 30) % 400) - 20, 7 + hash(i) * 5, null, t); a += '<rect x="96" y="-20" width="46" height="400" fill="#f4efe3" stroke="' + INK + '" stroke-width="2.4"/>';
    for (i = 0; i < 40; i++) a += '<path d="M142 ' + (i * 10 - 10) + ' h-' + (i % 5 ? 12 : 24) + '" stroke="' + INK + '" stroke-width="' + (i % 5 ? 1.2 : 2.4) + '"/>';
    a += wdrop(230, y, 22, "n", t) + arrow(275, y - 6, 275, y + 26, "#fff", 5) + tag("1 سنتي في الثانية", 440, 120, u, d * .2, 3, 23, YEL);
    if (k <= 0) return a;
    var b = '<rect x="-400" y="-300" width="1440" height="960" fill="#cdb893"/><rect x="-400" y="286" width="1440" height="300" fill="#8a6a48"/><path d="M110 40 H250 L560 300 H330 Z" fill="#ffe9a0" opacity=".55"/><rect x="100" y="30" width="160" height="150" fill="url(#sky-day)" stroke="#f4efe3" stroke-width="10"/><rect x="100" y="30" width="160" height="150" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M180 30 v150 M100 105 h160" stroke="#f4efe3" stroke-width="6"/>';
    for (i = 0; i < 46; i++) { var px = 200 + hash(i + 3) * 300, py = 70 + ((hash(i + 31) * 220 + t * (6 + 8 * hash(i))) % 220), lo = (px - 250) * .84 + 40, hi = (px - 110) * 1.18 + 40; if (py > lo && py < Math.min(296, hi)) b += '<circle cx="' + f(px + 5 * Math.sin(t * 1.3 + i)) + '" cy="' + f(py) + '" r="' + f(1.6 + hash(i + 8) * 2.2) + '" fill="#fff8d8" stroke="#8a6a48" stroke-width=".6"/>'; }
    return a + '<g opacity="' + f(k) + '">' + b + guy(540, 262, .4, t, "curious", { look: -1 }) + '</g>' + tag("زي التراب في شعاع الشمس", 430, 50, u, d * .62, -2, 18);
  });
  // 13 — but it does sink? Yes, only the air under it is rising
  shot(13, push(320, 180, 1.08, 1.0), function (u, d, t) {
    var k = clamp((u - d * .5) / .5), s = sky("day") + clouds(t, 10, 60, 4, 0.5), sh = u < d * .5 ? u * 18 : d * .5 * 18 - (u - d * .5) * 40;
    [90, 230, 410, 550].forEach(function (x, i) { s += rising(x, 20, 350, t + i * .3, "#bfe0ff", k, 8); });
    for (var i = 0; i < 12; i++) s += wdrop(60 + hash(i + 2) * 520, ((hash(i + 30) * 400 + sh) % 400 + 400) % 400 - 20, 10 + hash(i) * 5, i % 4 ? null : "happy", t);
    return s + (k < 1 ? '<g opacity="' + f(1 - k) + '">' + qmark(500, 120, t, 70) + '</g>' : "") + tag("الهوا تحتها طالع!", 320, 304, u, d * .55, -2, 24, YEL);
  });
  // 14 — the Sun heats the ground; the warm air rises faster than the droplets sink and carries them
  function thermal(t, k1, k2, mood) {
    var s = sky("day") + sun(70, 60, 26, "#ffd34d") + city(t, 300, 50, "#b9a98a", true, 3, false) + grass(t, 300, "grass-day", "#5f8a3c") + '<rect x="-400" y="296" width="1440" height="14" fill="#f2a03a" opacity="' + f(.5 * k1 * (.7 + .3 * Math.sin(t * 5))) + '" filter="url(#soft2)"/>';
    for (var i = 0; i < 4; i++) s += '<path d="M' + (100 + i * 14) + ' ' + (92 + i * 26) + ' l22 34" stroke="#ffd34d" stroke-width="4" stroke-linecap="round" opacity="' + f(k1 * (.5 + .5 * Math.sin(t * 6 - i))) + '"/>';
    [240, 330, 420].forEach(function (x, j) { s += rising(x, 160, 292, t + j * .3, "#f2a03a", k2, 7); });
    return s + cl(330 + 6 * Math.sin(t * .8), 140 - 5 * Math.sin(t * 2), 115, t, { mood: mood });
  }
  shot(14, push(320, 180, 1.0, 1.08), function (u, d, t) {
    return thermal(t, clamp(u / .6), clamp((u - d * .28) / .5), u > d * .8 ? "happy" : "n") + tag("الشمس بتسخّن الأرض", 150, 312, u, .5, -2, 18) + tag("هوا دافي طالع", 540, 230, u, d * .32, 3, 20, YEL) + tag("شايلها!", 545, 80, u, d * .82, 3, 22);
  });
  // 15 — the air inside the cloud itself weighs about a million tonnes
  shot(15, push(330, 175, 0.98, 1.08), function (u, d, t) {
    return land(t, { h: 34, noClouds: true }) + clouds(t, 40, 20, 3, 0.6) + birds(t, 60, 70) + kmBox(t, clamp(u / .8)) + tag("الهوا اللي جوّه", 110, 130, u, .5, -3, 19) + tag("مليون طن!", 320, 40, u, d * .55, -2, 30, YEL);
  });
  // 16 — all the water is less than a thousandth of that: the balance again
  shot(16, push(320, 185, 1.0, 1.08), function (u, d, t) {
    var ang = -15 * ease(u / 1.0) + 1.2 * Math.sin(t * 2.4);
    var air = '<rect x="-52" y="-84" width="104" height="84" rx="8" fill="#8fc2e8" stroke="' + INK + '" stroke-width="2.6"/>' + txt("هوا", 0, -46, 24, INK) + txt("مليون طن", 0, -18, 15, INK);
    return sky("day") + clouds(t, 12, 30, 3, 0.5) + grass(t, 316, "grass-day", "#5f8a3c") + balance(ang, air, wdrop(0, -18, 16, "happy", t)) + tag("مية: 500 طن", 530, 70, u, .9, 3, 19) + tag("أقل من 1 على 1000", 240, 36, u, d * .5, -2, 22, YEL);
  });
  // 17 — when does it fall? when droplets bump into each other and grow
  shot(17, push(320, 180, 1.0, 1.1), function (u, d, t) {
    var s = inside(t, 14, 6), m = ease((u - .9) / 1.1), m2 = ease((u - 2.0) / .8), C3 = [[170, 130], [460, 110], [330, 270]], i;
    if (m < 1) for (i = 0; i < 12; i++) { var c = C3[i % 3], a = i * 2.1 + t * .5, r0 = (70 + 30 * hash(i)) * (1 - m); s += wdrop(c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0, 11, null, t); }
    if (m > .6 && m2 < 1) C3.forEach(function (c, j) { s += wdrop(lerp(c[0], 320, m2), lerp(c[1], 180, m2), 11 + 16 * clamp((m - .6) / .4), "n", t + j); });
    if (m2 >= 1) s += wdrop(320, 180 + Math.max(0, u - 2.8) * 26, 46, "happy", t);
    return s + (u < 1.2 ? qmark(540, 110, t, 70) : "") + tag("تخبط في بعض… وتكبر", 320, 308, u, d * .45, -2, 22, YEL);
  });
  // 18 — one raindrop needs about a million cloud droplets (2 mm against 0.02 mm)
  shot(18, push(330, 180, 1.1, 1.0), function (u, d, t) {
    var s = inside(t, 0, 0), cx = 400, cy = 195, i;
    for (i = 0; i < 46; i++) { var p = ((hash(i) + t * .45) % 1), a = hash(i + 5) * 6.28 + p * 1.5, r = lerp(280, 70, p); s += '<circle cx="' + f(cx + r * Math.cos(a)) + '" cy="' + f(cy + r * Math.sin(a) * .8) + '" r="2.2" fill="#2f7fb8" opacity="' + f(Math.sin(p * 3.1)) + '"/>'; }
    s += '<g transform="translate(' + cx + ' ' + cy + ') scale(1 .92)">' + wdrop(0, 0, 80, "happy", t) + '</g><circle cx="110" cy="200" r="2" fill="#1f6fb0" stroke="' + INK + '" stroke-width=".8"/>' + arrow(110, 160, 110, 190, "#fff", 4);
    return s + tag("نقطة سحاب", 110, 135, u, .4, -3, 17) + tag("نقطة مطر", 560, 300, u, .8, 3, 19) + tag("مليون نقطة!", 180, 50, u, d * .5, -3, 26, YEL);
  });
  // 19 — then the air can't carry it and it falls as rain
  shot(19, push(320, 190, 1.0, 1.08), function (u, d, t) {
    var s = sky("storm") + city(t, 300, 70, "#6f7680", true, 3, true) + grass(t, 300, "grass-dusk", "#5f8a3c") + rain(150, 500, 110, 330, t, 46) + cl(325 + 6 * Math.sin(t * .8), 110, 150, t, { dark: true });
    s += guy(150, 272, .45, t, "happy") + '<path d="M178 300 V190" stroke="' + INK + '" stroke-width="4"/><path d="M112 196 Q178 128 244 196 Z" fill="#e23b2e" stroke="' + INK + '" stroke-width="2.6"/>';
    return s + tag("مطر!", 540, 220, u, .8, 3, 26, YEL);
  });
  // 20 — the myth: «a cloud is water vapour» — no
  shot(20, push(320, 175, 1.05, 1.0), function (u, d, t) {
    var s = land(t) + guy(110, 262, .55, t, "curious", { look: 1 }) + '<circle cx="185" cy="205" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="212" cy="182" r="12" fill="#fff" stroke="' + INK + '" stroke-width="2"/><ellipse cx="390" cy="125" rx="175" ry="95" fill="#fff" stroke="' + INK + '" stroke-width="2.8"/>';
    s += cl(310 + 3 * Math.sin(t * 2), 150, 60, t) + txt("=", 392, 140, 40, INK) + '<g transform="translate(480 165) scale(.5)">' + kettle(0, 0, t) + '</g>' + mist(520, 110, .35, t, 1) + txt("بخار", 480, 196, 17, INK);
    return s + xmark(390, 125, 2.2, (u - d * .6) / .4) + tag("لأ!", 560, 300, u, d * .66, 4, 30, "#f2a0a0");
  });
  // 21 — vapour is invisible: the clear gap at the kettle's spout, then the white mist of liquid droplets; droplets and ice crystals
  shot(21, push(320, 180, 1.12, 1.0), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3d5568"/><rect x="-400" y="286" width="1440" height="300" fill="#2a2f36"/><rect x="60" y="280" width="250" height="14" rx="4" fill="#1c1c1c"/>' + kettle(180, 262 + 1.5 * Math.sin(t * 14), t);
    for (var q = 0; q < 26; q++) s += '<circle cx="' + f(-60 + hash(q) * 760 + 10 * Math.sin(t + q)) + '" cy="' + f(((hash(q + 5) * 300 - t * 40) % 300 + 300) % 300) + '" r="' + f(2 + hash(q + 2) * 3) + '" fill="#fff" opacity=".3"/>';
    s += '<path d="M296 172 L330 138 L346 152 L308 188 Z" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="5 5" opacity=".8"/>' + mist(350, 130, .95, t * 1.6, 1);
    var k = clamp((u - d * .5) / .4);
    s += '<g opacity="' + f(k) + '">' + wdrop(520, 150, 24, "happy", t) + crystal(560, 245 + 5 * Math.sin(t * 1.6), 22, t * 20) + '</g>';
    return s + tag("بخار: مابيتشافش", 400, 215, u, .4, 3, 18) + tag("ده نقط مية", 330, 45, u, d * .28, -3, 20, YEL) + tag("مية سايلة", 530, 100, u, d * .55, 3, 17) + tag("بلّورات تلج", 500, 300, u, d * .78, -2, 17);
  });
  // 22 — in short: heavy water, in tiny droplets, held up by rising air
  shot(22, push(320, 180, 1.08, 1.0), function (u, d, t) {
    return thermal(t, 1, 1, "happy") + tag("مية تقيلة: 500 طن", 130, 60, u, d * .25, -3, 19) + tag("نقط صغيرة", 545, 110, u, d * .5, 3, 20, YEL) + tag("هوا طالع شايلها", 540, 240, u, d * .72, 3, 19);
  });
  // 23 — the odd fact: a big thunderstorm cloud can hold a million tonnes of water, and still floats
  shot(23, function (u, d) { var k = ease(u / d); return [320, lerp(230, 165, k), lerp(1.25, 0.98, k)]; }, function (u, d, t) {
    var fl = u > .8 && ((t * 1.1) % 1) < .13, s = sky("storm") + city(t, 300, 60, "#59616b", true, 3, true) + grass(t, 300, "grass-dusk", "#5f8a3c") + rain(240, 400, 250, 330, t, 22);
    s += cl(320 + 4 * Math.sin(t * .7), 255, 78, t, { list: STORM, dark: true });
    if (fl) s += '<path d="M330 250 l-16 34 h14 l-20 44" stroke="#fff7c2" stroke-width="5" fill="none" stroke-linejoin="round" filter="url(#glow)"/><rect x="-400" y="-300" width="1440" height="960" fill="#fff" opacity=".12"/>';
    return s + cl(555, 262, 30, t) + tag("سحابة عادية", 555, 300, u, .6, 2, 15) + tag("مليون طن مية!", 130, 120, u, d * .42, -4, 24, YEL) + tag("وبرضه عايمة", 135, 200, u, d * .8, 3, 19);
  });
  // 24–25 — outro
  function bye(t) { return land(t, { sky: "dusk", col: "#7a6a5a" }) + cl(390 + 10 * Math.sin(t * .8), 130 + 5 * Math.sin(t * 1.6), 120, t, { mood: "happy" }) + rising(330, 150, 292, t, "#bfe0ff", 1, 5) + rising(450, 150, 292, t + .4, "#bfe0ff", 1, 5) + guy(130, 262, .5, t, "happy", { wave: true, look: 1 }); }
  shot(24, push(320, 180, 1.0, 1.08), function (u, d, t) { return bye(t) + tag("حكاية السحاب", 180, 70, u, .3, -3, 24, YEL); });
  shot(25, function (u, d) { return [lerp(300, 350, clamp(u / d)), 180, 1.0]; }, function (u, d, t) { return bye(t) + tag("قولولنا!", 190, 70, u, 0.4, -3, 26); });

  window.__parts = { cl: cl, wdrop: wdrop, elephant: elephant, hardHat: hardHat, guy: guy, tag: tag, land: land, rising: rising, rain: rain, balance: balance, kettle: kettle, STORM: STORM, thermal: thermal, sky: sky, city: city, grass: grass };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
