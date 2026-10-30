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

  // ── the container ship (side view, from photos of Evergreen / Maersk / MSC ships): a long dark hull with red
  // antifouling paint below the design waterline, a raked bow with a bulb, a square stern, container stacks in bays,
  // the deckhouse (bridge) and the funnel. Hull coordinates: deck at 0, keel at 70, the paint line at 38.
  var BOX = ["#b8432e", "#2f6f9f", "#3f7a52", "#d9d4c8", "#9aa0a8", "#e8742e", "#8a5a3a", "#c9c4b8", "#6f7680", "#a83a3a"];
  function hullPath(L) { return 'M' + (-L) + ' 0 L' + (L - 24) + ' 0 L' + (L + 12) + ' -8 C' + (L + 6) + ' 26 ' + (L + 2) + ' 44 ' + (L - 18) + ' 52 C' + (L - 4) + ' 58 ' + (L - 10) + ' 70 ' + (L - 40) + ' 70 L' + (-L + 26) + ' 70 C' + (-L + 8) + ' 70 ' + (-L) + ' 60 ' + (-L) + ' 46 Z'; }
  function stacks(x0, x1, tiers, seed, t, skip) {
    var s = "", w = 19;
    for (var x = x0, b = 0; x + w <= x1; x += w + 2, b++) {
      if (skip && x + w > skip[0] && x < skip[1]) continue;
      var n = Math.max(0, tiers - (hash(b + seed) > 0.8 ? 1 : 0) - (b < 2 || x + w > x1 - 30 ? 2 : 0));
      if (b % 2 === 0 && n > 0) s += '<path d="M' + f(x - 1) + ' 0 V-24 M' + f(x - 1) + ' -12 H' + f(x + 1) + ' M' + f(x - 1) + ' -24 H' + f(x + 1) + '" stroke="#c8452e" stroke-width="2.2"/>';
      for (var r = 0; r < n; r++) { var c = BOX[Math.floor(hash(b * 7 + r * 3 + seed) * BOX.length)];
        s += '<rect x="' + f(x) + '" y="' + f(-11 - r * 11) + '" width="' + w + '" height="11" fill="' + c + '" stroke="' + INK + '" stroke-width=".9"/><path d="M' + f(x + 4) + ' ' + f(-9 - r * 11) + ' v7 M' + f(x + 9.5) + ' ' + f(-9 - r * 11) + ' v7 M' + f(x + 15) + ' ' + f(-9 - r * 11) + ' v7" stroke="#000" stroke-width=".6" opacity=".25"/>'; }
    }
    return s;
  }
  // o: {s, dr: draft 0..70 (how deep the keel sits), tiers: container rows, green: Evergreen colours and layout,
  //     cut: 0..1 cut-away showing the hollow inside, flood: 0..1 water inside, ballast: 0..1 tanks filling, lines: load line,
  //     tilt, hole: water gushing in, noBob, mood: a face on the bridge window? no}
  function ship(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, L = 260, dr = o.dr == null ? 40 : o.dr, bob = o.noBob ? 0 : Math.sin(t * 1.1 + x * 0.01) * 1.6, id = "sh" + (CLIPN++);
    var hullC = o.green ? "#2f7a4a" : "#1f3a5a", s = '<g transform="translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f((o.tilt || 0) + Math.sin(t * 0.9 + x) * 0.4) + ') scale(' + sc + ') translate(0 ' + f(-dr) + ')">';
    s += '<defs><clipPath id="' + id + '"><path d="' + hullPath(L) + '"/></clipPath></defs>';
    var bx = o.aft ? [-L + 34, -L + 84] : [70, 110], tiers = o.tiers == null ? 6 : o.tiers;
    if (tiers > 0) s += stacks(-L + 30, L - 40, tiers, o.green ? 11 : 3, t, bx);
    // deckhouse (bridge) with windows, bridge wings; funnel aft
    var hx = bx[0], hw = bx[1] - bx[0];
    s += '<rect x="' + hx + '" y="-78" width="' + hw + '" height="78" fill="#f1f0ea" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (hx - 8) + '" y="-84" width="' + (hw + 16) + '" height="10" fill="#e4e2da" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 4; c++) s += '<rect x="' + (hx + 5 + c * (hw - 10) / 4) + '" y="' + (-72 + r * 12) + '" width="' + ((hw - 10) / 4 - 3) + '" height="5" fill="' + (r === 0 ? "#2b4a6a" : "#5d93ad") + '"/>';
    s += '<path d="M' + (hx + 10) + ' -84 V-96 M' + (hx + hw - 12) + ' -84 V-92" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (hx + 10) + '" cy="-97" r="2" fill="' + (Math.sin(t * 4) > 0 ? "#ff4030" : "#601010") + '"/>';
    var fx = o.aft ? -L + 92 : -L + 26; s += '<path d="M' + fx + ' 0 L' + (fx + 4) + ' -70 H' + (fx + 30) + ' L' + (fx + 34) + ' 0 Z" fill="' + (o.green ? "#2f7a4a" : "#2b3340") + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (fx + 4) + '" y="-70" width="26" height="10" fill="#1c1c1c"/>';
    for (var k = 0; k < 4; k++) { var u = (t * 0.45 + k / 4) % 1; s += '<circle cx="' + f(fx + 17 - u * 60) + '" cy="' + f(-76 - u * 40) + '" r="' + f(5 + u * 12) + '" fill="#9aa0a8" opacity="' + f(0.4 * (1 - u)) + '"/>'; }
    // the hull: red below the paint line, the hull colour above, a white name stripe
    s += '<path d="' + hullPath(L) + '" fill="#a8322a"/>';
    s += '<g clip-path="url(#' + id + ')"><rect x="' + (-L - 20) + '" y="-20" width="' + (2 * L + 40) + '" height="58" fill="' + hullC + '"/>';
    s += o.green ? '<text x="-40" y="24" text-anchor="middle" style="font:800 17px Noto Serif;fill:#fff;letter-spacing:6px">EVERGREEN</text>' : '<text x="-60" y="27" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#fff" opacity=".92">إيه الحكاية</text>';
    if (o.cut) {
      var ck = clamp(o.cut);
      s += '<rect x="' + (-L + 14) + '" y="6" width="' + (2 * L - 40) + '" height="58" fill="#dcefff" opacity="' + f(ck) + '"/>';
      for (var fr = -L + 40; fr < L - 30; fr += 34) s += '<path d="M' + fr + ' 6 V64" stroke="#8a8f96" stroke-width="2" opacity="' + f(ck) + '"/>';
      s += '<path d="M' + (-L + 14) + ' 56 H' + (L - 26) + '" stroke="#8a8f96" stroke-width="2.4" opacity="' + f(ck) + '"/>';
      if (o.ballast) s += '<rect x="' + (-L + 14) + '" y="' + f(70 - 14 * clamp(o.ballast)) + '" width="' + (2 * L - 40) + '" height="14" fill="#2f7fb8" opacity=".85"/>';
      if (o.flood) { var fh = 64 * clamp(o.flood), wy = 70 - fh; s += '<path d="M' + (-L) + ' ' + f(wy) + ' ' + wavePath(-L, L, wy, t, 2) + ' V80 H' + (-L) + ' Z" fill="#2f7fb8" opacity=".9"/>'; }
      if (!o.flood && !o.ballast) for (var a = 0; a < 5; a++) s += '<text x="' + (-L + 80 + a * 95) + '" y="' + f(38 + Math.sin(t * 2 + a) * 4) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#5d93ad" opacity="' + f(ck * (0.6 + 0.4 * Math.sin(t * 3 + a))) + '">هوا</text>';
    }
    s += '</g><path d="' + hullPath(L) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (-L) + ' 4 H' + (L - 20) + '" stroke="#fff" stroke-width="1.4" opacity=".5"/>';
    s += '<path d="M' + (L - 40) + ' 0 V-14 H' + (L + 6) + ' L' + (L + 12) + ' -8" fill="' + hullC + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (L - 14) + ' -14 V-46 M' + (L - 22) + ' -36 H' + (L - 6) + '" stroke="#e8e4da" stroke-width="2.4"/><circle cx="' + (L - 4) + '" cy="10" r="4" fill="#111" stroke="#666"/><path d="M' + (L + 4) + ' 6 L' + (L + 12) + ' -8" stroke="' + INK + '" stroke-width="1.4"/><text x="' + (L - 30) + '" y="58" style="font:700 7px Noto Serif;fill:#fff" opacity=".8">14 12 10</text>';
    if (o.lines) s += plimsoll(-20, 34, 0.5);
    if (o.hole) { s += '<circle cx="60" cy="50" r="7" fill="#111"/>'; for (var j = 0; j < 8; j++) { var uu = (t * 1.8 + j / 8) % 1; s += '<circle cx="' + f(60 - uu * 40) + '" cy="' + f(50 + Math.sin(j) * 4) + '" r="' + f(2 + uu * 3) + '" fill="#8fd0ee" opacity="' + f(1 - uu) + '"/>'; } }
    return s + '</g>';
  }
  function wavePath(x0, x1, y, t, a) { var d = ""; for (var x = x0; x <= x1; x += 20) d += " L" + x + " " + f(y + Math.sin(x * 0.05 + t * 3) * a); return d; }
  // the sea in front of a ship: a translucent layer so the hull below the waterline looks submerged
  function front(t, y, col, x0, x1) { x0 = x0 == null ? -400 : x0; x1 = x1 == null ? 1040 : x1; var d = "M" + x0 + " " + y + wavePath(x0, x1, y, t, 3); return '<path d="' + d + ' V700 H' + x0 + ' Z" fill="' + (col || "#2f7fb8") + '" opacity=".55"/><path d="' + d.replace("M" + x0 + " " + y + " L", "M") + '" stroke="#fff" stroke-width="2" fill="none" opacity=".75"/>'; }
  // the load line mark (Plimsoll): the ringed disc and the ladder of lines for fresh/tropical/summer/winter water
  function plimsoll(x, y, s) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke="#fff" fill="none" stroke-width="3">';
    g += '<circle r="22"/><path d="M-32 0 H32 M-40 -30 H40"/><path d="M52 -40 V40"/>';
    [["TF", -26], ["F", -16], ["T", -6], ["S", 0], ["W", 8]].forEach(function (l, i) { g += '<path d="M52 ' + l[1] + ' H' + (i < 2 ? 32 : 76) + '"/><text x="' + (i < 2 ? 22 : 80) + '" y="' + (l[1] + 4) + '" stroke="none" fill="#fff" style="font:700 10px Noto Serif"' + (i < 2 ? ' text-anchor="end"' : "") + '>' + l[0] + '</text>'; });
    return g + '<text x="-36" y="-6" stroke="none" fill="#fff" style="font:700 13px Noto Serif">L</text><text x="26" y="-6" stroke="none" fill="#fff" style="font:700 13px Noto Serif">R</text></g>';
  }
  function basin(x, y, w, t, o) {   // a metal basin (طشت) with water, front half cut low so we see inside
    o = o || {}; var s = '<g transform="translate(' + x + ' ' + y + ')">';
    s += '<path d="M' + (-w) + ' -60 L' + (-w * 0.82) + ' 30 H' + (w * 0.82) + ' L' + w + ' -60 Z" fill="#a7b1bc" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M' + (-w * 0.97) + ' -44' + wavePath(-w * 0.97, w * 0.97, -44, t, 1.5) + ' L' + (w * 0.83) + ' 26 H' + (-w * 0.83) + ' Z" fill="#5fb0e0" opacity=".8"/>';
    s += '<ellipse cx="0" cy="-60" rx="' + w + '" ry="10" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M' + (-w * 0.9) + ' -30 Q0 -20 ' + (w * 0.9) + ' -30" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>';
    return s + '</g>';
  }
  function nail(x, y, ang, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (s || 1) + ')"><rect x="-2.5" y="-20" width="5" height="34" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/><rect x="-7" y="-23" width="14" height="4" rx="1" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/><path d="M-2.5 14 L0 22 L2.5 14 Z" fill="#8a8f96" stroke="' + INK + '"/></g>'; }
  function tank(x, y, w, h, level, t) {   // a glass aquarium tank with water at `level` (px from the bottom)
    var wy = y + h - level, s = '<rect x="' + x + '" y="' + f(wy) + '" width="' + w + '" height="' + f(level) + '" fill="#5fb0e0" opacity=".55"/>';
    s += '<path d="M' + x + ' ' + f(wy) + wavePath(x, x + w, wy, t, 1.2) + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>';
    return s + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#bfe6f7" fill-opacity=".12" stroke="#cfe8f5" stroke-width="4"/><path d="M' + (x + 8) + ' ' + (y + 10) + ' v' + (h - 30) + '" stroke="#fff" stroke-width="3" opacity=".4"/>';
  }
  function scaleBal(x, y, tiltDeg, left, right) {   // a balance; left/right are SVG drawn at the pan origins
    var a = tiltDeg * Math.PI / 180, lx = x - 120 * Math.cos(a), ly = y - 120 * Math.sin(a), rx = x + 120 * Math.cos(a), ry = y + 120 * Math.sin(a);
    var s = '<path d="M' + x + ' ' + (y + 130) + ' V' + y + '" stroke="' + INK + '" stroke-width="8"/><path d="M' + (x - 50) + ' ' + (y + 134) + ' H' + (x + 50) + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + f(lx) + ' ' + f(ly) + ' L' + f(rx) + ' ' + f(ry) + '" stroke="#8a6a2a" stroke-width="7" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
    [[lx, ly, left], [rx, ry, right]].forEach(function (p) { s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' l-30 50 M' + f(p[0]) + ' ' + f(p[1]) + ' l30 50" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(p[0] - 44) + ' ' + f(p[1] + 50) + ' Q' + f(p[0]) + ' ' + f(p[1] + 66) + ' ' + f(p[0] + 44) + ' ' + f(p[1] + 50) + ' Z" fill="#c9a050" stroke="' + INK + '" stroke-width="2"/><g transform="translate(' + f(p[0]) + ' ' + f(p[1] + 50) + ')">' + p[2] + '</g>'; });
    return s;
  }
  function upArrows(t, x0, x1, y, n, len, col) { var s = ""; for (var i = 0; i < n; i++) { var x = lerp(x0, x1, (i + 0.5) / n), k = 0.75 + 0.25 * Math.sin(t * 5 + i); s += arrow(x, y + len * k, x, y, col || "#f2c230", 5, 1); } return s; }
  function archimedes(x, y, t, mood, o) {   // a ball-head Greek with a beard, a laurel wreath and a toga
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 2) + ') scale(' + (o.s || 1) + ')">';
    if (!o.noBody) s += '<path d="M-56 140 C-60 56 -38 32 0 32 C38 32 60 56 56 140 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-40 40 L46 136" stroke="#c9a050" stroke-width="8" opacity=".8"/>';
    s += head(0, -30, 40, mood, t, o.look) + '<path d="M-30 -12 C-28 30 28 30 30 -12 C20 6 -20 6 -30 -12 Z" fill="#e8e4da" stroke="' + INK + '" stroke-width="2"/>';
    for (var l = 0; l < 7; l++) { var a = Math.PI + l * Math.PI / 6; s += '<ellipse cx="' + f(Math.cos(a) * 38) + '" cy="' + f(-36 + Math.sin(a) * 30) + '" rx="8" ry="4" transform="rotate(' + f(l * 30 + 90) + ' ' + f(Math.cos(a) * 38) + ' ' + f(-36 + Math.sin(a) * 30) + ')" fill="#5a8a3a" stroke="' + INK + '" stroke-width="1.2"/>'; }
    return s + '</g>';
  }
  function columns(t, y) { var s = '<rect x="-400" y="' + (y + 100) + '" width="1440" height="300" fill="#d9c79a"/>'; for (var i = 0; i < 9; i++) { var x = -260 + i * 130; s += '<rect x="' + (x - 16) + '" y="' + (y - 120) + '" width="32" height="220" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/><path d="M' + (x - 10) + ' ' + (y - 110) + ' V' + (y + 90) + ' M' + x + ' ' + (y - 110) + ' V' + (y + 90) + ' M' + (x + 10) + ' ' + (y - 110) + ' V' + (y + 90) + '" stroke="#c9b98a" stroke-width="2"/><rect x="' + (x - 24) + '" y="' + (y - 132) + '" width="48" height="14" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/>'; } return s + '<path d="M-400 ' + (y - 132) + ' H1040 V' + (y - 170) + ' H-400 Z" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/>'; }
  function pool(x, y, w, h, t, k) { var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="#4fb3d9" stroke="#e8e4da" stroke-width="2.4"/>'; for (var l = 1; l < 4; l++) s += '<path d="M' + (x + 2) + ' ' + f(y + l * h / 4) + ' H' + (x + w - 2) + '" stroke="#fff" stroke-width=".8" stroke-dasharray="2 2" opacity=".8"/>'; return s + '<path d="M' + (x + 3) + ' ' + (y + 3) + ' l' + f(w * 0.4) + ' 0" stroke="#fff" stroke-width="1.4" opacity="' + f(0.3 + 0.3 * Math.sin(t * 4 + k)) + '"/>'; }
  function seaScene(t, y, o) { return sea(t, y, 0, o); }
  // top view of a container ship (for the Suez blockage): green hull, rows of containers, bridge block
  function shipTop(x, y, ang, t, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (s || 1) + ')"><path d="M-200 -28 H170 Q215 -26 222 0 Q215 26 170 28 H-200 Z" fill="#2f7a4a" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var b = 0; b < 15; b++) for (var r = 0; r < 4; r++) { var bx = -188 + b * 23; if (b === 11) continue; g += '<rect x="' + bx + '" y="' + (-24 + r * 12) + '" width="21" height="11" fill="' + BOX[Math.floor(hash(b * 5 + r) * BOX.length)] + '" stroke="' + INK + '" stroke-width=".7"/>'; }
    return g + '<rect x="65" y="-26" width="20" height="52" fill="#f1f0ea" stroke="' + INK + '" stroke-width="1.6"/><rect x="-196" y="-12" width="14" height="24" fill="#2f7a4a" stroke="' + INK + '" stroke-width="1.4"/></g>';
  }
  function canalFlow(t) { var g = ""; for (var i = 0; i < 26; i++) { var x = ((hash(i) * 1440 + t * (40 + hash(i + 1) * 30)) % 1440) - 400, y = 135 + hash(i + 2) * 110; g += '<path d="M' + f(x) + ' ' + f(y) + ' h' + f(20 + hash(i + 3) * 30) + '" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>'; } for (var j = 0; j < 14; j++) { var dx = ((hash(j + 40) * 1440 + t * 70) % 1440) - 400, dy = -150 + hash(j + 41) * 600; if (dy < 110 || dy > 270) g += '<ellipse cx="' + f(dx) + '" cy="' + f(dy) + '" rx="26" ry="4" fill="#f4e4b0" opacity=".6"/>'; }
    for (var c = 0; c < 3; c++) { var sx = ((t * 90 + c * 480) % 1440) - 400, sy = 40 + c * 120; g += '<ellipse cx="' + f(sx) + '" cy="' + sy + '" rx="150" ry="80" fill="#000" opacity=".2" filter="url(#soft)"/>'; }
    return g; }
  function tug(x, y, ang, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"><path d="M-16 -7 H10 Q20 0 10 7 H-16 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.4"/><rect x="-8" y="-4" width="9" height="8" fill="#f1f0ea" stroke="' + INK + '"/>' + '<path d="M-18 0 h' + f(-8 - 6 * Math.abs(Math.sin(t * 6))) + '" stroke="#fff" stroke-width="3" opacity=".7"/></g>'; }
  function digger(x, y, t) { var a = Math.sin(t * 2) * 12; return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-14" y="-10" width="28" height="16" fill="#e2b035" stroke="' + INK + '" stroke-width="1.4"/><path d="M8 -6 L30 ' + f(-16 + a * 0.3) + ' L40 ' + f(-2 + a * 0.4) + '" stroke="#e2b035" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M36 ' + f(-6 + a * 0.4) + ' l8 4 l-4 8 Z" fill="#1c1c1c"/></g>'; }
  function bar(x, y, w, h, k, col, label) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#1c1c1c" opacity=".55"/><rect x="' + x + '" y="' + f(y + h * (1 - clamp(k))) + '" width="' + w + '" height="' + f(h * clamp(k)) + '" rx="6" fill="' + col + '"/><text x="' + (x + w / 2) + '" y="' + (y + h + 20) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + label + '</text>'; }

  // 0 — a nail dropped into a basin of water sinks straight to the bottom
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(190, 205, k), lerp(1.25, 1.45, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 20, 4, 0.8) + grass(t, 250, "grass-day", "#5a7a3a") + '<rect x="-400" y="150" width="1440" height="100" fill="#e8dcc4"/><path d="M-400 150 H1040" stroke="#b9a988" stroke-width="3"/>';
    s += basin(330, 300, 110, t);
    var fall = clamp((u - 0.4) / 0.6), sink = clamp((u - 1.0) / 1.2), ny = u < 1.0 ? lerp(80, 240, fall * fall) : lerp(240, 318, sink), ang = u < 1.0 ? u * 200 : lerp(200, 270, sink);
    s += nail(330 + Math.sin(u * 3) * (u < 1 ? 6 : 2), ny, ang, 1.2);
    if (u > 1.0) s += bubbles(t, 330, 315, 8, 0.9, 20, 250);
    if (u > 1.0 && u < 1.5) for (var k = 0; k < 6; k++) { var a = -Math.PI * (0.2 + k * 0.12), r = (u - 1.0) * 120; s += '<circle cx="' + f(330 + Math.cos(a) * r) + '" cy="' + f(250 + Math.sin(a) * r * 0.6) + '" r="3.5" fill="#8fd0ee"/>'; }
    s += engineer(468, 215, t, u > 1.4 ? "shock" : "curious", { s: 0.45 });
    return s + tag("حديد = يغرق", 200, 190, u, 1.8, -3, 20);
  });
  // 1 — but a steel container ship of 200,000 tons floats
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 190, lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    var s = sea(t, 230, 0, { gulls: true }) + ship(330 + Math.sin(t * 0.2) * 20, 230, t, { s: 0.95, dr: 46 }) + front(t, 230);
    return s + tag("حديد!", 150, 70, u, 0.6, -4, 22) + tag("+200 ألف طن", 470, 64, u, 1.8, 3, 22) + qmark(560, 140, t, 40) + qmark(110, 140, t, 32);
  });
  // 2 — and one big hole can sink it
  shot(2, function (u, d) { var k = clamp(u / d); return [320, lerp(195, 210, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var k = clamp(u / d), s = sea(t, 230, 0, { sky: "dusk" }) + ship(320, 230 + k * 18, t, { s: 0.9, dr: 46, cut: 0.6, flood: 0.15 + k * 0.4, hole: true, tilt: k * 3 }) + front(t, 230);
    return s + tag("خرم واحد كبير", 450, 80, u, 0.8, 3, 21, "#f2a0a0");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = sea(t, 240, 0, { sky: "sunset" }) + sun(470, 170, 34, "#ffd27a") + ship(300 + t * 3 % 40, 240, t, { s: 0.75, dr: 44 }) + front(t, 240, "#3a4f74");
    return s + tag("إيه الحكاية؟", 320, 90, u, 0.1, -2, 34, "#f2c230");
  });
  // 4 — steel is about eight times heavier than sea water; a solid block of it sinks
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 190, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/><rect x="-400" y="300" width="1440" height="300" fill="#b39a72"/>';
    var tl = 18 * Math.min(1, u / 1.2);
    s += scaleBal(170, 140, tl, '<rect x="-24" y="-48" width="48" height="48" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-18" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:#fff">حديد</text>', '<rect x="-24" y="-48" width="48" height="48" fill="#5fb0e0" stroke="' + INK + '" stroke-width="2" opacity=".85"/><text x="0" y="-18" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:#fff">مية</text>');
    s += tank(380, 150, 170, 150, 120, t);
    var by = lerp(130, 254, clamp((u - 1.4) / 1.4) * clamp((u - 1.4) / 1.4));
    s += '<rect x="440" y="' + f(by) + '" width="44" height="44" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/>';
    if (u > 2.0) s += bubbles(t, 462, by, 6, 1.2, 18, 182);
    return s + tag("أتقل ×8", 170, 50, u, 0.9, -3, 22) + tag("مصمت = يغرق", 470, 110, u, 3.0, 3, 18);
  });
  // 5 — the ship is hollow inside: a shell of steel full of air
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, k), 175, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = sea(t, 240, 0, {}) + ship(320, 240, t, { s: 1, dr: 42, cut: clamp(u / 1.2), tiers: 3 }) + front(t, 240);
    return s + tag("فاضية من جوه", 200, 60, u, 1.0, -3, 21) + tag("قشرة حديد", 470, 70, u, 2.2, 3, 19, "#bfe0ff");
  });
  // 6 — lowered into water, it pushes the water aside and takes its place (a model in a glass tank: the level rises)
  shot(6, function (u, d) { return [320, 185, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / (d - 1.4)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/><rect x="-400" y="310" width="1440" height="200" fill="#5a4a3a"/>';
    var lvl = 100 + 34 * k, wy = 310 - lvl, sy = lerp(110, wy + 16, k);
    s += '<path d="M330 -40 V' + f(sy - 50) + '" stroke="#ddd" stroke-width="2"/>' + ship(330, sy, t, { s: 0.42, dr: 40, tiers: 3, noBob: true }) + tank(150, 120, 360, 190, lvl, t);
    s += '<path d="M520 ' + f(310 - 100) + ' h26 M520 ' + f(wy) + ' h26" stroke="#f2c230" stroke-width="2.4"/>' + arrow(536, 310 - 104, 536, wy + 4, "#f2c230", 3, k);
    return s + tag("المية بتعلى", 560, 150, u, 1.6, 4, 17) + tag("بتزق المية", 210, 70, u, 0.9, -3, 19);
  });
  // 7 — the water pushes the ship up: the buoyant force
  shot(7, function (u, d) { return [320, lerp(200, 185, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = sea(t, 200, 0, {}) + ship(320, 200, t, { s: 0.85, dr: 44 }) + front(t, 200) + upArrows(t, 120, 520, 236, 8, 70, "#f2c230");
    return s + tag("قوة الطفو", 320, 330, u, 0.9, -2, 24);
  });
  // 8 — that force equals the weight of the water pushed aside
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 175, 0.95]; }, function (u, d, t) {
    var k = clamp((u - 0.5) / 1.4), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/><rect x="-400" y="300" width="1440" height="300" fill="#b39a72"/>';
    var waterBlock = '<path d="M-36 -34 H30 Q40 -30 36 -18 Q30 0 18 0 H-30 Q-38 0 -38 -14 Z" fill="#5fb0e0" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-12" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#fff">المية المزقوقة</text>';
    var force = arrow(0, 0, 0, -50, "#f2c230", 6, 1) + '<text x="0" y="-56" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:#1c1c1c">الطفو</text>';
    s += scaleBal(320, 120, Math.sin(t * 2) * 1.2 * (1 - k), waterBlock, force);
    s += '<text x="320" y="88" text-anchor="middle" style="font:800 30px Noto Sans Arabic;fill:#1c1c1c">=</text>';
    return s + tag("بالظبط!", 320, 40, u, 1.6, -2, 24);
  });
  // 9 — the ship settles until the water it pushes aside weighs as much as the ship
  shot(9, function (u, d) { return [300, 185, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.75)), e = 1 - Math.pow(1 - k, 2), s = sea(t, 220, 0, {}) + ship(260, 220, t, { s: 0.7, dr: lerp(6, 44, e) }) + front(t, 220);
    s += bar(420, 60, 34, 150, 1, "#c23a26", "السفينة") + bar(470, 60, 34, 150, e, "#4fb3d9", "المية");
    return s + (k >= 1 ? tag("اتساووا!", 450, 40, u, d * 0.75, -3, 18) : "");
  });
  // 10 — 200,000 tons of ship, 200,000 tons of water
  shot(10, function (u, d) { var k = clamp(u / d); return [320, lerp(170, 185, k), lerp(0.9, 1.0, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>' + '<rect x="-400" y="300" width="1440" height="300" fill="#4a3f34"/>';
    var mini = '<g transform="scale(.26) translate(0 -10)">' + ship(0, 0, t, { dr: 70, noBob: true, tiers: 5 }) + '</g>', cube = '<rect x="-46" y="-80" width="92" height="80" fill="#4fb3d9" stroke="' + INK + '" stroke-width="2"/><path d="M-46 -80 l14 -12 h92 l-14 12 M46 0 l14 -12 v-80" fill="#8fd0ee" stroke="' + INK + '" stroke-width="2"/>';
    s += scaleBal(320, 140, Math.sin(t * 1.5) * 1.5, mini, cube);
    return s + tag("200 ألف طن", 170, 90, u, 0.5, -3, 18) + tag("200 ألف طن مية", 470, 90, u, 1.6, 3, 18, "#bfe0ff");
  });
  // 11 — that much water fills about 80 Olympic pools
  shot(11, function (u, d) { var k = clamp(u / d); return [320, 180, lerp(1.15, 0.9, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#7a9a5a"/>', n = Math.min(80, Math.floor(u * 40));
    for (var i = 0; i < n; i++) { var c = i % 10, r = Math.floor(i / 10); s += pool(92 + c * 46, 46 + r * 34, 40, 26, t, i); }
    return s + '<text x="320" y="340" text-anchor="middle" style="font:800 34px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:5;paint-order:stroke">' + n + ' حمام سباحة!</text>';
  });
  // 12 — so the hull is wide and flat underneath, to push aside a lot of water (seen from the front)
  shot(12, function (u, d) { return [320, lerp(190, 175, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sea(t, 170, 0, {}), b = Math.sin(t * 1.1) * 2;
    s += '<g transform="translate(320 ' + f(170 + b) + ')"><path d="M-170 -60 H170 L166 40 Q160 70 130 72 H-130 Q-160 70 -166 40 Z" fill="#a8322a" stroke="' + INK + '" stroke-width="3"/><path d="M-170 -60 H170 L168 -10 H-168 Z" fill="#1f3a5a"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 9; c++) s += '<rect x="' + (-158 + c * 35) + '" y="' + (-80 - r * 18) + '" width="33" height="17" fill="' + BOX[Math.floor(hash(c * 3 + r) * BOX.length)] + '" stroke="' + INK + '"/>';
    s += '</g>' + front(t, 170) + upArrows(t, 180, 460, 250, 7, 60, "#f2c230") + arrow(150, 300, 490, 300, "#fff", 3, clamp(u / 1.5)) + arrow(490, 300, 150, 300, "#fff", 3, clamp(u / 1.5));
    return s + tag("قاع عريض", 320, 330, u, 1.2, -2, 20);
  });
  // 13 — try it: a ball of foil sinks, the same foil shaped as a boat floats
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, k), 190, 1.25]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/><rect x="-400" y="270" width="1440" height="300" fill="#b39a72"/>';
    s += basin(200, 290, 90, t) + basin(460, 290, 90, t);
    var by = lerp(200, 305, clamp((u - 0.6) / 1.2));
    s += '<g transform="translate(200 ' + f(by) + ') rotate(' + f(u * 60) + ')"><circle r="14" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/><path d="M-8 -6 l6 4 l5 -7 M-4 6 l7 -2 l3 5" stroke="#fff" stroke-width="1.2" fill="none"/></g>';
    s += '<g transform="translate(460 ' + f(248 + Math.sin(t * 2) * 2) + ') rotate(' + f(Math.sin(t * 1.6) * 4) + ')"><path d="M-40 -14 L40 -14 L28 6 H-28 Z" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/><path d="M-30 -10 l10 6 l12 -4 l14 5" stroke="#fff" stroke-width="1" fill="none"/></g>';
    return s + tag("كورة: تغرق", 200, 150, u, 1.2, -3, 18, "#f2a0a0") + tag("مركب: تعوم", 460, 150, u, 2.6, 3, 18, "#bfe0ff");
  });
  // 14 — Archimedes found this out more than 2,000 years ago
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 180, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + columns(t, 220) + archimedes(320, 170, t, "curious", { s: 0.9 });
    return s + tag("أرشميدس", 160, 70, u, 0.6, -3, 22) + tag("+2000 سنة", 480, 70, u, 1.8, 3, 20, "#bfe0ff");
  });
  // 15 — he noticed it getting into the bath: the water spilled over
  shot(15, function (u, d) { return [320, 200, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/><path d="M-400 -300 H1040 V260 H-400 Z" fill="#cfdde6"/>';
    for (var x = -400; x < 1040; x += 40) s += '<path d="M' + x + ' -300 V260" stroke="#b9cbd6" stroke-width="1"/>';
    s += '<rect x="-400" y="260" width="1440" height="300" fill="#9ab0bc"/>' + archimedes(320, lerp(130, 175, k), t, u > 1.4 ? "shock" : "happy", { s: 0.8, noBody: true });
    s += '<path d="M180 200 H460 L440 290 H200 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M186 ' + f(214 - k * 10) + wavePath(186, 454, 214 - k * 10, t, 2) + ' L454 214 V230 H186 Z" fill="#5fb0e0" opacity=".85"/>';
    for (var j = 0; j < 10; j++) { var uu = (t * 1.4 + j / 10) % 1; if (k > 0.3) s += '<circle cx="' + f((j % 2 ? 460 : 180) + (j % 2 ? 1 : -1) * uu * 30) + '" cy="' + f(204 + uu * uu * 90) + '" r="3.5" fill="#5fb0e0"/>'; }
    return s + tag("المية فاضت!", 320, 70, u, 1.5, -3, 22);
  });
  // 16 — he ran out shouting «Eureka!»
  shot(16, function (u, d) { return [320 + u * 30, 190, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + '<g transform="translate(' + f(-((t * 60) % 130)) + ' 0)">' + columns(t, 230) + '</g>';
    var x = 300 + u * 30, leg = Math.sin(t * 14) * 20;
    s += '<path d="M' + (x - 10) + ' 300 l' + f(leg * 0.6) + ' 50 M' + (x + 10) + ' 300 l' + f(-leg * 0.6) + ' 50" stroke="#c68b5f" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + (x - 34) + ' 250 Q' + x + ' 236 ' + (x + 34) + ' 250 L' + (x + 30) + ' 306 H' + (x - 30) + ' Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/>';
    s += archimedes(x, 210, t, "happy", { s: 0.6, noBody: true });
    s += '<g transform="translate(' + (x + 120) + ' 110) scale(' + f(pop(u / 1.2)) + ')"><path d="M-80 -30 H80 V24 H-10 L-30 44 L-26 24 H-80 Z" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text x="0" y="8" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:#c23a26">يوريكا!</text></g>';
    return s + tag("يعني: لقيتها!", x + 120, 190, u, 1.8, 3, 18);
  });
  // 17 — the load line painted on the side of every ship
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), 180, lerp(1.3, 1.45, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f3a5a"/><rect x="-400" y="210" width="1440" height="300" fill="#a8322a"/>';
    for (var r = -260; r < 300; r += 46) s += '<path d="M-400 ' + r + ' H1040" stroke="#18304c" stroke-width="2"/>';
    s += plimsoll(320, 150, 1.4) + front(t, 250 + Math.sin(t * 1.2) * 6);
    return s + tag("خط الحمولة", 320, 40, u, 0.8, -2, 24);
  });
  // 18 — if the water covers that line, the ship is overloaded
  shot(18, function (u, d) { return [320, 170, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.6), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f3a5a"/><rect x="-400" y="210" width="1440" height="300" fill="#a8322a"/>';
    s += plimsoll(320, 150, 1.4) + front(t, lerp(250, 118, k) + Math.sin(t * 1.2) * 4);
    if (k > 0.9) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#ff2a1a" opacity="' + f(0.12 + 0.1 * Math.sin(t * 8)) + '"/>';
    return s + tag("حمولة زيادة!", 320, 40, u, 1.9, -2, 24, "#f2a0a0");
  });
  // 19 — the same ship sits deeper in Nile water than in the sea
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, k), 190, 1.1]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-day)"/>' + clouds(t, 12, 20, 4, 0.8);
    s += '<rect x="-400" y="200" width="720" height="300" fill="#7fc4e0"/><rect x="320" y="200" width="720" height="300" fill="#1c5f8f"/>';
    for (var p = 0; p < 4; p++) { var px = -60 + p * 90; s += '<path d="M' + px + ' 200 q4 -50 2 -80" stroke="#7a5a3a" stroke-width="5" fill="none"/><path d="M' + (px + 2) + ' 120 q-24 2 -34 16 M' + (px + 2) + ' 120 q24 2 34 16 M' + (px + 2) + ' 120 q-14 -12 -30 -10 M' + (px + 2) + ' 120 q14 -12 30 -10" stroke="#3f7a34" stroke-width="5" fill="none"/>'; }
    s += ship(170, 200, t, { s: 0.45, dr: 56, tiers: 4 }) + ship(470, 200, t, { s: 0.45, dr: 44, tiers: 4 }) + front(t, 200, "#7fc4e0", -400, 320) + front(t, 200, "#1c5f8f", 320, 1040);
    s += '<path d="M60 190 H280 M360 196 H580" stroke="#f2c230" stroke-width="2" stroke-dasharray="6 4"/>';
    return s + tag("النيل", 170, 60, u, 0.5, -3, 22, "#bfe0ff") + tag("البحر", 470, 60, u, 1.4, 3, 22) + tag("بتغطس أكتر", 170, 300, u, 2.2, -2, 16, "#f2a0a0");
  });
  // 20 — sea water has salt in it, so it is heavier and pushes up harder
  shot(20, function (u, d) { return [320, 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>' + tank(110, 80, 180, 220, 190, t) + tank(350, 80, 180, 220, 190, t);
    for (var i = 0; i < 40; i++) { var x = 360 + hash(i) * 160, y = 120 + ((hash(i + 3) * 170 + t * 8) % 170); s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="4" height="4" fill="#fff" transform="rotate(45 ' + f(x + 2) + ' ' + f(y + 2) + ')" opacity=".85"/>'; }
    s += upArrows(t, 140, 260, 200, 3, 40, "#bfe0ff") + upArrows(t, 380, 500, 200, 3, 80, "#f2c230");
    return s + tag("مية عذبة", 200, 50, u, 0.4, -3, 18, "#bfe0ff") + tag("مية مالحة: أتقل", 440, 50, u, 1.2, 3, 18) + tag("ملح", 440, 270, u, 2.0, -2, 16, "#fff");
  });
  // 21 — empty, the ship fills ballast tanks with sea water to stay upright
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 185, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.5) / (d - 1.2)), s = sea(t, 220, 0, {}) + ship(320, 220, t, { s: 0.95, dr: lerp(14, 34, k), tiers: 0, cut: 1, ballast: k, tilt: (1 - k) * 5 * Math.sin(t * 1.6) });
    for (var j = 0; j < 6; j++) { var uu = (t * 1.5 + j / 6) % 1; s += '<circle cx="' + f(lerp(120, 200, uu)) + '" cy="' + f(lerp(270, 244, uu)) + '" r="4" fill="#bfe6f7" opacity="' + f(k < 1 ? 1 - uu : 0) + '"/>'; }
    s += front(t, 220);
    return s + tag("خزانات مية", 320, 330, u, 0.9, -2, 22) + tag("علشان تتزن", 470, 70, u, 2.2, 3, 18, "#bfe0ff");
  });
  // 22 — Ever Given: 400 m long, 20,000 containers, stuck across the Suez Canal (seen from above)
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(200, 180, k), lerp(1.1, 0.9, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8d29a"/>';
    for (var i = 0; i < 30; i++) s += '<ellipse cx="' + f(-300 + hash(i) * 1200) + '" cy="' + f(-200 + hash(i + 2) * 700) + '" rx="' + f(20 + hash(i + 4) * 40) + '" ry="6" fill="#d9bf80" opacity=".7"/>';
    s += '<path d="M-400 120 C0 110 300 130 1040 120 V260 C300 270 0 250 -400 260 Z" fill="#2b86b5"/>' + canalFlow(t) + '<path d="M-400 120 C0 110 300 130 1040 120" stroke="#c9b07a" stroke-width="6" fill="none"/><path d="M-400 260 C0 250 300 270 1040 260" stroke="#c9b07a" stroke-width="6" fill="none"/>';
    s += shipTop(320, 190, -26 + Math.sin(t * 0.7) * 0.8, t, 0.95) + tug(140 + Math.sin(t * 0.9) * 14, 200, 10, t) + tug(500 - Math.sin(t * 0.8) * 12, 170, 190, t) + tug(480 + Math.sin(t * 1.1) * 12, 230, 160, t) + digger(512, 104, t) + digger(120, 282, t + 1);
    return s + tag("إيفر جيفن", 200, 60, u, 0.6, -3, 22) + tag("400 متر", 480, 330, u, 1.8, 3, 20, "#bfe0ff") + tag("20 ألف حاوية", 470, 60, u, 2.8, 3, 18);
  });
  // 23 — she never sank: she was stuck sideways for six days, ships queueing
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(430, 170, k), lerp(200, 180, k), lerp(1.05, 0.9, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8d29a"/><path d="M-400 120 C0 110 300 130 1040 120 V260 C300 270 0 250 -400 260 Z" fill="#2b86b5"/>' + canalFlow(t) + '';
    s += shipTop(320, 190, -26, t, 0.95);
    for (var q = 0; q < 6; q++) s += '<g opacity=".9">' + shipTop(-120 - q * 170 + Math.sin(t * 0.6 + q) * 10, 190 + (q % 2 ? 18 : -18), 0, t, 0.35) + '</g>';
    var day = Math.min(6, 1 + Math.floor(u / Math.max(0.5, d / 6)));
    s += '<g transform="translate(560 70)"><rect x="-46" y="-30" width="92" height="64" rx="8" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><rect x="-46" y="-30" width="92" height="18" rx="6" fill="#c23a26"/><text x="0" y="24" text-anchor="middle" style="font:800 28px Noto Sans Arabic;fill:#1c1c1c">' + day + '</text></g>';
    return s + tag("ماغرقتش", 300, 320, u, 0.6, -2, 22, "#bfe0ff") + tag("6 أيام محشورة", 160, 60, u, 1.6, -3, 20);
  });
  // 24 — if water gets inside, it drives the air out, the ship gets heavier and sinks
  shot(24, function (u, d) { return [320, lerp(190, 210, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.85)), s = sea(t, 200, 0, { sky: "dusk" }) + ship(320, 200 + k * 70, t, { s: 0.9, dr: 44, cut: 1, flood: 0.1 + k * 0.85, hole: true, tilt: k * 4, tiers: 3 });
    s += bubbles(t, 300, 200 + k * 60, 10, 1, 60, 150) + front(t, 200);
    return s + tag("المية مكان الهوا", 320, 60, u, 0.9, -2, 21, "#f2a0a0");
  });
  // 25 — payoff: it floats because it pushes aside water as heavy as itself
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(260, 360, k), 180, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = sea(t, 220, 0, {}) + ship(320, 220, t, { s: 0.9, dr: 44 }) + front(t, 220);
    s += '<path d="M90 222 H550 Q560 260 520 262 H120 Q86 262 90 222 Z" fill="#8fd0ee" opacity="' + f(0.35 + 0.15 * Math.sin(t * 3)) + '" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>' + upArrows(t, 140, 500, 270, 6, 50, "#f2c230");
    return s + tag("وزن السفينة", 180, 60, u, 0.5, -3, 18) + tag("=", 320, 60, u, 1.0, 0, 24) + tag("وزن المية", 460, 60, u, 1.4, 3, 18, "#bfe0ff");
  });
  // 26 — outro
  shot(26, function (u, d) { return [lerp(300, 360, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = sea(t, 230, 0, { sky: "sunset", gulls: true }) + sun(500, 175, 30, "#ffd27a") + ship(250 + u * 12, 230, t, { s: 0.7, dr: 44 }) + front(t, 230, "#3a4f74");
    return s + tag("قولولنا!", 470, 90, u, 0.4, 3, 26);
  });

  window.__parts = { ship: ship, front: front, sea: sea, plimsoll: plimsoll, shipTop: shipTop, tug: tug, tag: tag, hardHat: hardHat, upArrows: upArrows, archimedes: archimedes };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
