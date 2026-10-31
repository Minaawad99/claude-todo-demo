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


  // ── new pieces for this episode: the vegetable market, the notes, the ships and the charts ──
  var INK = "#1c1c1c", CLIPN = 0, OILN = 0;
  function txt(x, y, s, size, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 900) + ' ' + size + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(size / 9) + ';paint-order:stroke">' + s + '</text>'; }
  // a ball-head person standing; y is the head centre, the body reaches y + 70·s. o: {shirt, hat, arm: "up"|"wave", hold (svg at the raised hand), look, ph}
  function person(x, y, s, t, mood, o) {
    o = o || {}; var ph = o.ph || 0, b = Math.sin(t * 3 + ph) * 2, sh = o.shirt || "#3f6f8f";
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')">';
    g += '<path d="M-26 72 C-28 32 -16 18 0 18 C16 18 28 32 26 72 Z" fill="' + sh + '" stroke="' + INK + '" stroke-width="2.4"/>';
    var sw = Math.sin(t * 2.4 + ph) * 6;
    if (o.arm === "up" || o.arm === "wave") {
      var wa = o.arm === "wave" ? Math.sin(t * 8 + ph) * 14 : Math.sin(t * 3 + ph) * 4, hx = 36 + wa * 0.4, hy = -14 + Math.abs(wa) * 0.2;
      g += '<path d="M16 30 Q30 18 ' + f(hx) + ' ' + f(hy) + '" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="6" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>';
      if (o.hold) g += '<g transform="translate(' + f(hx) + ' ' + f(hy - 6) + ')">' + o.hold + '</g>';
    } else g += '<path d="M18 30 Q' + f(28 + sw * 0.3) + ' 46 ' + f(24 + sw * 0.5) + ' 60" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-18 30 Q' + f(-28 - sw * 0.3) + ' 46 ' + f(-24 - sw * 0.5) + ' 60" stroke="' + sh + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    g += head(0, 0, 20, mood, t + ph, o.look);
    if (o.hat === "hard") g += '<path d="M-21 -6 C-21 -30 21 -30 21 -6 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><rect x="-25" y="-8" width="50" height="5" rx="2" fill="#e2b035" stroke="' + INK + '" stroke-width="1.4"/>';
    if (o.hat === "cap") g += '<path d="M-19 -8 C-19 -28 19 -28 19 -8 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><path d="M14 -10 h16 v4 h-18 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6"/>';
    if (o.hat === "scarf") g += '<path d="M-23 4 C-26 -30 26 -30 23 4 C18 -14 -18 -14 -23 4 Z" fill="#8f5aa0" stroke="' + INK + '" stroke-width="2"/>';
    return g + '</g>';
  }
  // a banknote. kind "usd": green with the $ medallion; "egp": warm brown with ج
  function bill(x, y, s, rot, kind) {
    var u = kind !== "egp", g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + f(s) + ')">';
    g += '<rect x="-40" y="-19" width="80" height="38" rx="4" fill="url(#' + (u ? "gUsd" : "gEgp") + ')" stroke="' + INK + '" stroke-width="2"/><rect x="-35" y="-14" width="70" height="28" rx="2" fill="none" stroke="' + (u ? "#2f5a34" : "#7a4a20") + '" stroke-width="1.2"/>';
    g += '<circle r="11" fill="' + (u ? "#d9ecd2" : "#f3dcb8") + '" stroke="' + (u ? "#2f5a34" : "#7a4a20") + '" stroke-width="1.4"/><text y="6" text-anchor="middle" style="font:900 16px Noto Sans Arabic;fill:' + (u ? "#1f4a26" : "#6a3a14") + '">' + (u ? "$" : "ج") + '</text>';
    return g + '</g>';
  }
  function tomato(x, y, r, t, ph) {
    var w = Math.sin((t || 0) * 4 + (ph || 0)) * 0.04;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(1 + w) + ' ' + f(1 - w) + ')"><circle r="' + r + '" fill="url(#gTom)" stroke="' + INK + '" stroke-width="' + f(r / 7) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.35) + '" r="' + f(r * 0.22) + '" fill="#fff" opacity=".55"/><path d="M0 ' + f(-r) + ' l' + f(-r * 0.5) + ' ' + f(-r * 0.25) + ' l' + f(r * 0.35) + ' ' + f(r * 0.05) + ' l' + f(0.15 * r) + ' ' + f(-r * 0.35) + ' l' + f(0.15 * r) + ' ' + f(r * 0.35) + ' l' + f(r * 0.35) + ' ' + f(-r * 0.05) + ' Z" fill="#4f8f3a" stroke="' + INK + '" stroke-width="1.2"/></g>';
  }
  // the vegetable stall: striped awning, wooden table, a crate with n tomatoes, a hanging price board
  function stall(x, y, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    g += '<path d="M-110 -140 V40 M110 -140 V40" stroke="#6a4a2a" stroke-width="6"/>';
    var aw = ""; for (var i = 0; i < 8; i++) aw += '<path d="M' + (-124 + i * 31) + ' -170 h31 v34 q-15.5 ' + f(14 + Math.sin(t * 3 + i) * 3) + ' -31 0 Z" fill="' + (i % 2 ? "#f4f1e8" : "#d8452e") + '" stroke="' + INK + '" stroke-width="1.6"/>';
    g += aw + '<rect x="-128" y="-176" width="256" height="10" rx="3" fill="#8f2618" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<rect x="-120" y="-10" width="240" height="50" fill="url(#gWood)" stroke="' + INK + '" stroke-width="2"/><path d="M-120 6 H120 M-120 22 H120" stroke="#6a4a2a" stroke-width="1.2" opacity=".6"/>';
    g += '<path d="M-90 -10 L-80 -44 H80 L90 -10 Z" fill="#c9a06a" stroke="' + INK + '" stroke-width="2"/>';
    var n = o.n == null ? 12 : o.n; for (var k = 0; k < n; k++) { var col = k % 6, row = Math.floor(k / 6); g += tomato(-62 + col * 25 + (row % 2) * 12, -46 - row * 18, 13, t, k); }
    if (o.price != null) { var sy = -128 + Math.sin(t * 2) * 2; g += '<path d="M-26 -166 L-30 ' + f(sy - 22) + ' M26 -166 L30 ' + f(sy - 22) + '" stroke="#3a3530" stroke-width="1.6"/><rect x="-46" y="' + f(sy - 24) + '" width="92" height="44" rx="4" fill="#2b3a2e" stroke="#6a4a2a" stroke-width="4"/>' + '<text x="0" y="' + f(sy + 9) + '" text-anchor="middle" style="font:900 26px Noto Sans Arabic;fill:' + (o.hot ? "#ffb08a" : "#f4f1e8") + '">' + o.price + '</text>'; }
    if (o.seller) g += person(0, -84, 0.8, t, o.seller, { shirt: "#4f8f5a", hat: "cap", arm: o.sellerArm, hold: o.sellerHold, ph: 1.3 });
    return g + '</g>';
  }
  function market(t) {
    return sky("day") + sun(560, 40, 22, "#ffe9a8") + clouds(t, 12, 10, 4, 0.8) + city(t, 250, 100, "#c9b08a", true, 5, false) +
      '<rect x="-400" y="250" width="1440" height="400" fill="url(#gStreet)"/>' + '<path d="M-400 252 H1040" stroke="#a88a5c" stroke-width="3"/>';
  }
  // a line of customers waiting, waving notes
  function queue(t, x0, y, n, dx, o) {
    o = o || {}; var s = "", moods = o.moods || ["worry", "curious", "n", "shock", "worry", "n", "curious"], shirts = ["#2f6f9f", "#c23a26", "#8f5aa0", "#e2b035", "#4f8f5a", "#d8452e", "#26405e"], hats = ["", "scarf", "", "cap", "", "scarf", ""];
    for (var i = n - 1; i >= 0; i--) s += person(x0 + i * dx + Math.sin(t * 1.5 + i) * 2, y + (i % 2) * 4, o.s || 0.85, t, moods[i % moods.length], { shirt: shirts[i % 7], hat: hats[i % 7], arm: o.arm ? "wave" : null, hold: o.arm ? bill(0, -8, 0.42, -12, o.note || "egp") : null, ph: i * 1.7 });
    return s;
  }
  // a hand holding a phone; scr = svg drawn in the screen's local box (-46..46, -86..86)
  function phone(x, y, s, t, scr) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.6) * 3) + ') rotate(' + f(-4 + Math.sin(t * 0.9) * 1.5) + ') scale(' + s + ')">';
    g += '<path d="M-60 150 C-70 90 -74 40 -56 20 L-40 40 L-40 150 Z" fill="#e9b88f" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<rect x="-56" y="-100" width="112" height="200" rx="16" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/><rect x="-48" y="-90" width="96" height="180" rx="8" fill="#f4f6f8"/><rect x="-14" y="-96" width="28" height="5" rx="2" fill="#3a3d42"/>';
    g += '<g>' + scr + '</g>';
    g += '<path d="M56 10 C74 14 76 34 58 40 M56 40 C76 44 76 64 58 70 M56 70 C74 74 72 92 56 96" fill="#e9b88f" stroke="' + INK + '" stroke-width="2.4"/>';
    return g + '</g>';
  }
  // a line chart drawn left to right (p 0..1); vals are y values in [lo, hi]; returns the svg plus a dot at the head
  function chart(x, y, w, h, vals, lo, hi, p, col, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-10" y="-10" width="' + (w + 20) + '" height="' + (h + 20) + '" rx="10" fill="#fbf7ec" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var k = 1; k < 4; k++) g += '<path d="M0 ' + f(h * k / 4) + ' H' + w + '" stroke="#d9d0bc" stroke-width="1.2" stroke-dasharray="4 4"/>';
    var n = vals.length - 1, pp = clamp(p) * n, d = "", hx = 0, hy = 0;
    for (var i = 0; i <= n; i++) { var vv = i <= pp ? vals[i] : null; if (vv == null) { if (i - 1 < pp && i > 0) { var fr = pp - (i - 1); vv = lerp(vals[i - 1], vals[i], fr); hx = (i - 1 + fr) / n * w; hy = h - (vv - lo) / (hi - lo) * h; d += " L" + f(hx) + " " + f(hy); } break; }
      hx = i / n * w; hy = h - (vv - lo) / (hi - lo) * h; d += (i ? " L" : "M") + f(hx) + " " + f(hy); }
    g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#d8452e") + '" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    g += '<circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="' + f(7 + 2 * Math.abs(Math.sin(p * 40))) + '" fill="' + (col || "#d8452e") + '" stroke="' + INK + '" stroke-width="2"/>';
    if (o.labels) o.labels.forEach(function (lb) { g += '<text x="' + f(lb[0] * w) + '" y="' + f(h + 30) + '" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#fbf7ec;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + lb[1] + '</text>'; });
    return { svg: g + '</g>', hx: x + hx, hy: y + hy };
  }
  // a cargo ship side view going right. o: {s, cargo: "wheat"|"box"}
  function ship(x, y, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.4 + x * 0.01) * 2) + ') rotate(' + f(Math.sin(t * 1.1) * 0.8) + ') scale(' + (o.s || 1) + ')">';
    g += '<path d="M-150 -6 L150 -6 L130 34 L-140 34 Z" fill="' + (o.hull || "#26405e") + '" stroke="' + INK + '" stroke-width="2"/><path d="M-148 -6 H148 V2 H-146 Z" fill="#c23a26"/>';
    g += '<rect x="-140" y="-46" width="36" height="40" fill="url(#hullW)" stroke="#5a5a5a"/><rect x="-136" y="-38" width="28" height="6" fill="#26405e"/><rect x="-128" y="-62" width="12" height="16" fill="#c23a26" stroke="' + INK + '"/>';
    if (o.cargo === "wheat") { for (var k = 0; k < 4; k++) g += '<path d="M' + (-90 + k * 56) + ' -6 v-24 q24 -18 48 0 v24 Z" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/>'; g += '<path d="M-20 -6 V-70 L40 -40" stroke="#f2c230" stroke-width="4" fill="none"/>'; }
    else { var C = ["#d8452e", "#2f6f9f", "#4f8f5a", "#e2b035", "#8f5aa0"]; for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) g += '<rect x="' + (-96 + c * 38) + '" y="' + (-30 - r * 22) + '" width="36" height="22" fill="' + C[(c + r * 2) % 5] + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
    g += '</g>';
    for (var w = 0; w < 4; w++) { var u = (t * 0.6 + w / 4) % 1; g += '<path d="M' + f(x - 150 * (o.s || 1) - u * 80) + ' ' + f(y + 30 * (o.s || 1)) + ' q10 -4 20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity="' + f(1 - u) + '"/>'; }
    return g;
  }
  function sea(t, y) { var d = "M-400 " + y; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y + Math.sin(x * 0.04 + t * 2.2) * 4); return '<rect x="-400" y="' + y + '" width="1440" height="500" fill="url(#gSea)"/><path d="' + d + ' V' + (y + 14) + ' H-400 Z" fill="#8fd0ee" opacity=".55"/><path d="' + d + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>'; }
  function bread(x, y, r, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 1.3) * 4) + ')"><ellipse rx="' + r + '" ry="' + f(r * 0.9) + '" fill="url(#gBread)" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 18; i++) g += '<circle cx="' + f((hash(i) - 0.5) * r * 1.4) + '" cy="' + f((hash(i + 4) - 0.5) * r * 1.2) + '" r="' + f(2 + hash(i + 2) * 2) + '" fill="#8a5a24" opacity=".45"/>';
    return g + '</g>';
  }
  function bank(x, y, s, t, label, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M-120 -120 L0 -170 L120 -120 Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-124" y="-122" width="248" height="14" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2"/>';
    for (var c = 0; c < 6; c++) g += '<rect x="' + (-104 + c * 40) + '" y="-108" width="18" height="100" fill="url(#gCol)" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<rect x="-130" y="-8" width="260" height="14" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2"/><rect x="-24" y="-70" width="48" height="62" fill="' + (o.closed ? "#5a4a3a" : "#8fb6cf") + '" stroke="' + INK + '" stroke-width="2"/>';
    if (label) g += '<text x="0" y="-130" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#2b2016">' + label + '</text>';
    return g + '</g>';
  }
  function plane(x, y, s, t) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2) * 3) + ') scale(' + s + ')"><path d="M-60 0 C-40 -10 40 -10 60 -2 C64 0 64 4 60 6 C40 10 -40 10 -60 4 Z" fill="url(#gPlane)" stroke="' + INK + '" stroke-width="2"/><path d="M-6 0 L-30 34 L-14 34 L18 2 Z M-50 -2 L-62 -26 L-52 -26 L-36 -4 Z" fill="#2f6f9f" stroke="' + INK + '" stroke-width="1.6"/><path d="M30 -4 h18" stroke="#26405e" stroke-width="4"/></g>'; }
  function pyramids(t, y, s) { s = s || 1; return '<g transform="translate(0 ' + y + ')"><path d="M60 0 L' + f(150) + ' ' + f(-110 * s) + ' L240 0 Z M200 0 L280 ' + f(-90 * s) + ' L360 0 Z" fill="url(#gPyr)" stroke="#8a6a3a" stroke-width="2"/><path d="M150 ' + f(-110 * s) + ' L170 0 M280 ' + f(-90 * s) + ' L296 0" stroke="#b0884a" stroke-width="2"/></g>'; }
  // a money arrow: notes flying along a straight path, n of them
  function flow(t, x1, y1, x2, y2, n, sp, kind, sc) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * sp + i / n) % 1; s += '<g opacity="' + f(Math.min(1, Math.sin(Math.PI * u) * 2)) + '">' + bill(lerp(x1, x2, u), lerp(y1, y2, u) - Math.sin(Math.PI * u) * 30, sc || 0.4, Math.sin(t * 5 + i) * 15, kind) + '</g>'; } return s; }
  function bar(x, y, w, h, col, k) { var hh = h * clamp(k); return '<rect x="' + f(x - w / 2) + '" y="' + f(y - hh) + '" width="' + w + '" height="' + f(hh) + '" rx="6" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function seesaw(x, y, ang, left, right, t) {
    var a = ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), L2 = 170;
    var g = '<path d="M' + f(x - 34) + ' ' + f(y + 60) + ' L' + x + ' ' + y + ' L' + f(x + 34) + ' ' + f(y + 60) + ' Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<g transform="translate(' + x + ' ' + y + ') rotate(' + f(ang) + ')"><rect x="-' + L2 + '" y="-8" width="' + (2 * L2) + '" height="14" rx="5" fill="url(#gWood)" stroke="' + INK + '" stroke-width="2.4"/></g>';
    return g + '<g transform="translate(' + f(x - c * 130) + ' ' + f(y - sn * 130 - 10) + ')">' + left + '</g><g transform="translate(' + f(x + c * 130) + ' ' + f(y + sn * 130 - 10) + ')">' + right + '</g>';
  }
  function icon(kind, x, y, s, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 3) + ') scale(' + s + ')">';
    if (kind === "fuel") g += '<rect x="-24" y="-34" width="48" height="68" rx="6" fill="#2f6f9f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 -12 H24 M-24 12 H24" stroke="#1c3f5f" stroke-width="3"/><path d="M0 -10 c-8 10 -8 16 0 18 c8 -2 8 -8 0 -18 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/>';
    if (kind === "oil") g += '<path d="M-16 -20 V-30 H16 V-20 L22 -8 V34 H-22 V-8 Z" fill="#f2c230" fill-opacity=".85" stroke="' + INK + '" stroke-width="2.4"/><rect x="-10" y="-40" width="20" height="10" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2"/><rect x="-18" y="2" width="36" height="16" fill="#fbf7ec" stroke="' + INK + '" stroke-width="1.4"/>';
    if (kind === "med") g += '<rect x="-30" y="-22" width="60" height="44" rx="5" fill="#fbf7ec" stroke="' + INK + '" stroke-width="2.4"/><path d="M-6 -12 h12 v6 h6 v12 h-6 v6 h-12 v-6 h-6 v-12 h6 Z" fill="#d8452e" stroke="' + INK + '" stroke-width="1.2"/>';
    if (kind === "gear") { g += '<g transform="rotate(' + f(t * 60) + ')">'; for (var k = 0; k < 8; k++) g += '<rect x="-6" y="-34" width="12" height="14" fill="#8a929c" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + (k * 45) + ')"/>'; g += '<circle r="24" fill="#a7b1bc" stroke="' + INK + '" stroke-width="2.4"/><circle r="9" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/></g>'; }
    if (kind === "mob") g += '<rect x="-18" y="-34" width="36" height="68" rx="7" fill="#1c1c1c"/><rect x="-14" y="-28" width="28" height="54" rx="3" fill="#5d93ad"/>';
    if (kind === "wheat") { for (var w = -1; w <= 1; w++) { g += '<path d="M' + (w * 10) + ' 34 Q' + (w * 6) + ' 0 ' + (w * 12) + ' -30" stroke="#b8901c" stroke-width="3" fill="none"/>'; for (var q = 0; q < 5; q++) g += '<ellipse cx="' + f(w * 12 - w * q * 1.2) + '" cy="' + (-26 + q * 9) + '" rx="4" ry="7" fill="#e2b035" stroke="' + INK + '" stroke-width="1"/>'; } }
    return g + '</g>';
  }
  function dollarTag(x, y, t, ph) { var k = 1 + 0.08 * Math.sin(t * 6 + (ph || 0)); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="14" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2"/><text y="6" text-anchor="middle" style="font:900 17px Noto Sans Arabic;fill:#fff">$</text></g>'; }
  function hardHat(x, y, s, t, mood, o) { return person(x, y, s, t, mood, Object.assign({ hat: "hard", shirt: "#e8742e" }, o || {})); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function room(t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gRoom)"/><rect x="-400" y="290" width="1440" height="400" fill="#b98a5c"/><path d="M-400 290 H1040" stroke="#8a5a34" stroke-width="3"/><rect x="420" y="40" width="150" height="110" fill="#bfe0ff" stroke="#6a4a2a" stroke-width="6"/>' + clouds(t, 10, 60, 2, 0.8, 0.5); }
  function news(t, u) {   // the news screen inside the phone
    var s = '<rect x="-48" y="-90" width="96" height="26" fill="#c23a26"/><text x="0" y="-72" text-anchor="middle" style="font:900 13px Noto Sans Arabic;fill:#fff">عاجل</text>';
    var c = chart(-38, -50, 76, 60, [30, 31, 33, 32, 38, 47, 50], 28, 52, clamp(u / 2.4), "#d8452e");
    s += c.svg + '<text x="0" y="42" text-anchor="middle" style="font:900 15px Noto Sans Arabic;fill:#1c1c1c">الدولار غِلي!</text>';
    return s + bill(0, 70, 0.5, Math.sin(t * 4) * 8, "usd");
  }

  // 0 — the phone in your hand: the same headline again
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(170, 180, k), lerp(1.25, 1.05, ease(k))]; }, function (u, d, t) {
    var s = room(t) + person(150, 170, 1.3, t, u > 2.2 ? "shock" : "curious", { shirt: "#2f6f9f" }) + phone(350, 180, 0.95, t, news(t, u));
    for (var i = 0; i < 3; i++) { var q = (t * 0.7 + i / 3) % 1; s += '<circle cx="350" cy="80" r="' + f(20 + q * 60) + '" fill="none" stroke="#d8452e" stroke-width="3" opacity="' + f(1 - q) + '"/>'; }
    return s + tag("تاني؟!", 520, 70, u, 1.6, 4, 24, "#f2a0a0");
  });
  // 1 — we earn and spend in pounds, so why care?
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(280, 340, k), 175, 1.05]; }, function (u, d, t) {
    var s = room(t) + person(250, 150, 1.4, t, "curious", { shirt: "#2f6f9f", arm: "up", hold: bill(0, -6, 0.7, -10, "egp") });
    s += '<g transform="translate(450 100)"><ellipse rx="90" ry="54" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><circle cx="-70" cy="60" r="10" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="-90" cy="80" r="6" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' + bill(-20, 0, 0.7, Math.sin(t * 3) * 6, "usd") + txt(45, 16, "؟", 44, "#d8452e") + '</g>';
    return s + tag("بنقبض بالجنيه", 200, 320, u, 0.8, -3, 19) + tag("وبنشتري بالجنيه", 460, 320, u, 1.8, 3, 19, "#bfe0ff");
  });
  // 2 — the seesaw: the dollar goes up, the pound goes down
  shot(2, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.3) / 1.6)), ang = lerp(0, -16, k) + Math.sin(t * 3) * 1.2;
    var s = sky("day") + clouds(t, 14, 10, 4, 0.8) + grass(t, 260, "grass-day", "#5a7a3a") + seesaw(320, 200, ang, bill(0, -14, 1.1, -6, "usd") + arrow(0, -40, 0, -90, "#4f8f5a", 6, k), bill(0, -14, 1.1, 6, "egp") + arrow(0, -46, 0, 0, "#d8452e", 6, k), t);
    return s + tag("الدولار بيغلى", 140, 50, u, 0.6, -3, 20) + tag("والجنيه بيرخص", 500, 60, u, 1.4, 3, 20, "#f2a0a0");
  });
  // 3 — «إيه الحكاية؟»
  shot(3, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gBurst)"/>';
    for (var r = 0; r < 16; r++) { var a = r / 16 * Math.PI * 2 + t * 0.3; s += '<path d="M320 180 L' + f(320 + Math.cos(a) * 700) + ' ' + f(180 + Math.sin(a) * 700) + ' L' + f(320 + Math.cos(a + 0.12) * 700) + ' ' + f(180 + Math.sin(a + 0.12) * 700) + ' Z" fill="#fff" opacity=".12"/>'; }
    for (var q = 0; q < 6; q++) s += txt(80 + q * 100, 60 + Math.sin(t * 3 + q) * 14 + (q % 2) * 230, "؟", 40 + (q % 3) * 8, q % 2 ? "#f2c230" : "#fff");
    s += '<g transform="translate(320 180) scale(' + f(pop(u / 1.0) * (1 + 0.04 * Math.sin(t * 5))) + ')">' + txt(0, 20, "إيه الحكاية؟", 64, "#f2c230") + '</g>';
    return s + person(560, 250, 0.9, t, "happy", { arm: "wave", shirt: "#2f6f9f" });
  });
  // 4 — a vegetable stall: few tomatoes, a long queue
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(240, 360, ease(k)), 190, lerp(1.15, 0.95, k)]; }, function (u, d, t) {
    var s = market(t) + stall(150, 230, t, { n: 3, price: "5 ج", seller: "n" }) + queue(t, 330, 200, 6, 62, { arm: u > 1.5 });
    return s + tag("طماطم قليلة", 150, 330, u, 0.7, -3, 20, "#f2a0a0") + tag("زباين كتير", 480, 80, u, 1.8, 3, 20);
  });
  // 5 — the seller raises the price, everyone pays more to get there first
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(200, 300, k), 180, lerp(1.2, 1.05, k)]; }, function (u, d, t) {
    var p = [5, 8, 12, 15][Math.min(3, Math.floor(u / 1.0))];
    var s = market(t) + stall(170, 230, t, { n: 3, price: p + " ج", hot: p > 5, seller: "happy", sellerArm: "up" }) + queue(t, 330, 200, 5, 50, { arm: true, moods: ["shock", "worry", "shock", "worry", "shock"] });
    for (var i = 0; i < 3; i++) { var q = (t * 0.9 + i / 3) % 1; s += '<g opacity="' + f(1 - q) + '">' + txt(250 + i * 20, 80 - q * 50, "+", 30, "#f2c230") + '</g>'; }
    return s + tag("السعر بيعلى!", 470, 60, u, 1.2, 3, 22, "#f2a0a0");
  });
  // 6 — the dollar is the tomato: supply against demand
  shot(6, function (u, d) { return [320, 175, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var m = ease(clamp((u - 0.4) / 1.2)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e6c8"/>';
    s += '<g opacity="' + f(1 - m) + '">' + tomato(320, 120, 50, t) + '</g><g opacity="' + f(m) + '">' + bill(320, 120, 1.8 * (0.6 + 0.4 * m), Math.sin(t * 2) * 4, "usd") + '</g>';
    var k = clamp((u - 2.0) / 1.0), ang = -8 * Math.sin(t * 1.6) * k;
    s += seesaw(320, 250, ang, '<rect x="-46" y="-30" width="92" height="30" rx="6" fill="#4f8f5a" stroke="' + INK + '" stroke-width="2"/>' + txt(0, -8, "معروض", 18), '<rect x="-46" y="-30" width="92" height="30" rx="6" fill="#d8452e" stroke="' + INK + '" stroke-width="2"/>' + txt(0, -8, "مطلوب", 18), t);
    return s + tag("سلعة زي أي سلعة", 320, 40, u, 1.2, -2, 20);
  });
  // 7 — who are the customers that want dollars?
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, k), 190, 1.0]; }, function (u, d, t) {
    var s = market(t) + queue(t, 40, 190, 9, 70, { arm: true, note: "usd", moods: ["curious", "n", "curious", "worry"] });
    return s + tag("مين الزباين؟", 320, 50, u, 0.3, -3, 24);
  });
  // 8 — Egypt imports about 13 million tonnes of wheat a year, paid in dollars
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 180, lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 12, 10, 4, 0.8) + sea(t, 240) + '<path d="M500 236 L1040 236 V400 H460 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>' + pyramids(t, 236, 0.6).replace('translate(0 ', 'translate(520 ');
    s += ship(lerp(80, 330, ease(clamp(u / 3))), 236, t, { cargo: "wheat", s: 0.9 }) + flow(t, 560, 210, 300, 160, 5, 0.5, "usd", 0.42);
    var n = Math.min(13, Math.floor(clamp((u - 1) / 2) * 13));
    s += txt(180, 90, n + " مليون طن", 40, "#f2c230");
    return s + tag("قمح", 130, 40, u, 0.6, -3, 22) + tag("بالدولار", 470, 70, u, 2.6, 3, 20, "#bfe0ff");
  });
  // 9 — fuel, cooking oil, medicine, car and phone parts
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), 180, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9eef2"/><rect x="-400" y="230" width="1440" height="40" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    for (var r = 0; r < 30; r++) s += '<circle cx="' + f(((r * 50 - t * 60) % 1500 + 1500) % 1500 - 400) + '" cy="250" r="8" fill="#3a3d42" stroke="' + INK + '"/>';
    ["fuel", "oil", "med", "gear", "mob"].forEach(function (k, i) { var x = 90 + i * 120, kk = clamp((u - 0.3 - i * 0.6) / 0.5); if (kk <= 0) return; s += '<g transform="translate(' + x + ' 180) scale(' + f(pop(kk)) + ') translate(' + (-x) + ' -180)">' + icon(k, x, 180, 1.1, t) + dollarTag(x + 30, 130, t, i) + '</g>'; });
    return s + tag("وقود", 90, 320, u, 0.5, -3, 16) + tag("زيت", 210, 320, u, 1.1, 2, 16) + tag("أدوية", 330, 320, u, 1.7, -2, 16) + tag("قطع غيار", 450, 320, u, 2.3, 3, 16) + tag("موبايلات", 570, 320, u, 2.9, -2, 16);
  });
  // 10 — the loaf in your hand has a dollar inside it
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.25, ease(u / d))]; }, function (u, d, t) {
    var s = room(t) + '<path d="M140 400 C150 300 200 260 260 250 L300 280 L240 400 Z" fill="#e9b88f" stroke="' + INK + '" stroke-width="2.4"/>' + bread(320, 180, 100, t);
    var k = clamp((u - 1.2) / 0.8); if (k > 0) s += '<circle cx="320" cy="180" r="' + f(56 * k) + '" fill="#fff8d8" opacity=".85" filter="url(#glow)"/>' + bill(320, 180, 1.1 * pop(k), Math.sin(t * 3) * 6, "usd");
    return s + tag("جواه دولار!", 500, 70, u, 1.6, 3, 22);
  });
  // 11 — and where do dollars come from?
  shot(11, function (u, d) { return [320, 170, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 4, 0.8) + '<rect x="-400" y="250" width="1440" height="400" fill="#d9c79a"/>' + bank(320, 250, 1.0, t, "خزنة مصر");
    for (var q = 0; q < 4; q++) s += txt(160 + q * 110, 70 + Math.sin(t * 4 + q) * 12, "؟", 46, "#f2c230");
    return s;
  });
  // 12 — Egyptians working abroad sent more than 40 billion dollars in 2025
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(200, 420, ease(k)), 180, 0.95]; }, function (u, d, t) {
    var s = sky("day") + sun(80, 40, 22, "#ffe9a8") + clouds(t, 12, 10, 3, 0.8) + sea(t, 250);
    s += '<path d="M-400 250 H160 L190 400 H-400 Z" fill="#e9d2a0" stroke="#a88a5c" stroke-width="2"/>' + '<clipPath id="clG"><rect x="-400" y="-300" width="560" height="560"/></clipPath><g clip-path="url(#clG)">' + city(t, 250, 150, "#9aa2ac", true, 21, false) + '</g>';
    s += '<path d="M480 250 L1040 250 V400 H450 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>' + pyramids(t, 250, 0.55).replace('translate(0 ', 'translate(460 ');
    s += hardHat(90, 170, 0.9, t, "happy", { arm: "up", hold: bill(0, -6, 0.6, -10, "usd") }) + flow(t, 120, 150, 560, 170, 7, 0.4, "usd", 0.45);
    var n = Math.min(40, Math.floor(clamp((u - 1.4) / 2.4) * 40));
    s += txt(330, 90, "+" + n + " مليار $", 42, "#4f8f5a");
    return s + tag("المصريين برة", 120, 320, u, 0.6, -3, 19) + tag("2025", 560, 80, u, 3.6, 3, 22, "#bfe0ff");
  });
  // 13 — then tourism, exports and the Suez Canal
  shot(13, function (u, d) { return [320, 180, lerp(1.05, 0.95, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 4, 0.8) + '<rect x="-400" y="250" width="1440" height="400" fill="#d9c79a"/>' + bank(320, 250, 0.7, t, "خزنة مصر");
    var srcs = [[90, 90, "السياحة"], [550, 90, "الصادرات"], [560, 260, "القناة"]];
    srcs.forEach(function (sr, i) { var k = clamp((u - 0.2 - i * 0.7) / 0.5); if (k <= 0) return;
      s += flow(t + i, sr[0], sr[1], 320, 190, 4, 0.5, "usd", 0.36) + (i === 0 ? plane(sr[0], sr[1], 0.7 * pop(k), t) : i === 1 ? ship(sr[0], sr[1] + 20, t, { s: 0.35 * pop(k) }) : ship(sr[0], sr[1] + 10, t, { s: 0.35 * pop(k), hull: "#7a2a20" })) + tag(sr[2], sr[0], sr[1] + 50, u, 0.3 + i * 0.7, i % 2 ? 3 : -3, 16); });
    return s;
  });
  // 14 — every month: about 9 billion dollars of imports against about half that of exports
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e6c8"/><path d="M80 300 H560" stroke="' + INK + '" stroke-width="3"/>';
    var k1 = ease(clamp((u - 0.4) / 1.6)), k2 = ease(clamp((u - 2.4) / 1.4));
    s += bar(220, 300, 110, 220, "#d8452e", k1) + bar(420, 300, 110, 110, "#4f8f5a", k2);
    s += txt(220, 290 - 220 * k1, f(9 * k1).replace(".0", "") + " مليار $", 22, "#fff") + txt(420, 290 - 110 * k2, "≈ " + f(4.5 * k2) + " مليار $", 20, "#fff");
    for (var i = 0; i < 3; i++) s += dollarTag(220 + (i - 1) * 30, 300 - 220 * k1 + 20 + Math.sin(t * 3 + i) * 4, t, i);
    return s + tag("بنستورد", 220, 340, u, 0.4, -3, 18, "#f2a0a0") + tag("بنصدّر", 420, 340, u, 2.4, 3, 18, "#bfe0ff") + tag("كل شهر", 320, 30, u, 0.2, -2, 18);
  });
  // 15 — so: many customers, few tomatoes
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(380, 260, k), 190, lerp(0.95, 1.1, k)]; }, function (u, d, t) {
    return market(t) + stall(150, 230, t, { n: 2, price: "؟", seller: "worry" }) + queue(t, 320, 200, 7, 52, { arm: true, note: "usd", moods: ["shock", "worry"] }) + tag("زباين كتير", 480, 70, u, 0.3, 3, 20) + tag("طماطم قليلة", 150, 330, u, 1.0, -3, 20, "#f2a0a0");
  });
  // 16 — the Red Sea attacks: canal income fell from about 10 billion dollars to about 4
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 3, 0.8) + sea(t, 160);
    s += '<path d="M-400 160 H140 L170 400 H-400 Z M1040 160 H470 L430 400 H1040 Z" fill="#d9c79a" stroke="#8a7448" stroke-width="2"/>';
    var k = ease(clamp((u - 0.6) / 2.0));
    s += ship(lerp(300, 300 + 40 * k, k), 230, t, { s: 0.45 }) + ship(lerp(320, 340, k), 300, t, { s: 0.4, hull: "#7a2a20" });
    s += '<g transform="translate(0 0)">' + bar(560, 140, 70, 120, "#2f6f9f", 1 - 0.6 * k) + txt(560, 130 - 120 * (1 - 0.6 * k), Math.round(10 - 6 * k) + " مليار $", 18, "#fff") + '</g>';
    for (var x = 0; x < 3; x++) { var q = (t * 0.8 + x / 3) % 1; s += '<circle cx="' + (240 + x * 60) + '" cy="' + f(200 - q * 40) + '" r="' + f(6 + q * 14) + '" fill="#6b6f78" opacity="' + f(0.6 * (1 - q)) + '" filter="url(#soft)"/>'; }
    return s + tag("البحر الأحمر", 200, 40, u, 0.4, -3, 20, "#f2a0a0") + tag("دخل القناة وقع", 470, 330, u, 1.6, 3, 18);
  });
  // 17 — dollars vanish from the banks and a black market appears
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, ease(k)), 185, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + city(t, 260, 110, "#8a7a6a", true, 13, false) + '<rect x="-400" y="260" width="1440" height="400" fill="url(#gStreet)"/>' + bank(170, 260, 0.75, t, "البنك", { closed: true });
    s += '<rect x="130" y="180" width="80" height="22" rx="4" fill="#d8452e" stroke="' + INK + '" stroke-width="2"/><text x="170" y="196" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:#fff">مفيش دولار</text>';
    s += '<rect x="360" y="60" width="300" height="260" fill="#2b2620"/><path d="M360 60 V320" stroke="' + INK + '" stroke-width="3"/>';
    s += person(470, 200, 0.95, t, "n", { shirt: "#1c1c1c", hat: "cap", arm: "up", hold: bill(0, -6, 0.7, Math.sin(t * 4) * 10, "usd") }) + person(300, 205, 0.9, t, "shock", { shirt: "#2f6f9f" });
    var p = Math.min(80, 50 + Math.floor(u * 8)); s += txt(560, 120, p + " ج", 34, "#ffb08a");
    return s + tag("سوق سودا", 520, 300, u, 1.0, 3, 20, "#f2a0a0");
  });
  // 18 — the Central Bank lets the market set the price: the float
  shot(18, function (u, d) { return [320, 180, lerp(1.08, 0.98, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 4, 0.8) + '<rect x="-400" y="250" width="1440" height="400" fill="#d9c79a"/>' + bank(200, 250, 0.9, t, "البنك المركزي");
    var k = clamp((u - 1.4) / 1.0), fl = Math.sin(t * 2) * 10 * k;
    s += '<g transform="translate(470 ' + f(170 - 40 * ease(k) + fl) + ')">' + bill(0, 0, 1.4, Math.sin(t * 2) * 6 * k, "usd") + '</g>';
    if (k < 1) s += '<path d="M470 280 V' + f(200 - 40 * k) + '" stroke="#5a6068" stroke-width="6" stroke-dasharray="10 6"/><rect x="452" y="270" width="36" height="30" rx="4" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/>';
    else for (var c = 0; c < 2; c++) s += '<path d="M' + (450 + c * 30) + ' ' + f(270 + (u - 2.4) * 30) + ' l10 -14" stroke="#5a6068" stroke-width="6"/>';
    for (var w = 0; w < 4; w++) { var q = (t * 0.6 + w / 4) % 1; s += '<path d="M' + f(400 + q * 140) + ' ' + f(110 + w * 20) + ' q14 -6 28 0" stroke="#fff" stroke-width="3" fill="none" opacity="' + f(Math.sin(Math.PI * q) * k) + '"/>'; }
    return s + tag("التعويم", 470, 320, u, 2.2, 3, 26) + tag("السوق يحدد السعر", 200, 40, u, 0.6, -3, 18, "#bfe0ff");
  });
  // 19 — 2016: from about 9 pounds to more than 18
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var c = chart(110, 70, 420, 200, [8.9, 8.9, 8.9, 8.9, 13, 16, 18.2, 18.4], 6, 20, clamp((u - 0.4) / 2.6), "#d8452e", { labels: [[0, "قبل"], [1, "بعد"]] });
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a4a"/>' + c.svg;
    s += txt(c.hx, c.hy - 18, (u < 1.6 ? "9" : u < 2.4 ? "13" : "18") + " ج", 26, "#fff");
    return s + tag("2016", 320, 36, u, 0.2, -3, 24);
  });
  // 20 — March 2024: from about 31 to nearly 50
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var c = chart(110, 70, 420, 200, [30.9, 30.9, 30.9, 30.9, 45, 49.5, 49.5, 48.5], 25, 55, clamp((u - 0.4) / 2.4), "#d8452e", { labels: [[0, "قبل"], [1, "بعد"]] });
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3a4a"/>' + c.svg;
    s += txt(c.hx, c.hy - 18, (u < 1.6 ? "31" : u < 2.2 ? "45" : "قرب 50") + " ج", 24, "#fff");
    return s + tag("مارس 2024", 320, 36, u, 0.2, -3, 22);
  });
  // 21 — two weeks before: the Ras El Hekma deal, 35 billion dollars
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, ease(k)), 180, lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var s = sky("day") + sun(540, 40, 24, "#ffe9a8") + clouds(t, 10, 10, 3, 0.8) + sea(t, 210) + '<path d="M-400 205 C-100 196 200 230 400 260 C560 290 800 300 1040 300 V500 H-400 Z" fill="#f3dfb0" stroke="#c9a96a" stroke-width="2"/>';
    for (var p = 0; p < 4; p++) s += '<path d="M' + (60 + p * 150) + ' 300 q' + f(Math.sin(t * 2 + p) * 4) + ' -30 ' + f(6 + Math.sin(t * 2 + p) * 6) + ' -60" stroke="#6a4a2a" stroke-width="5" fill="none"/><path d="M' + (66 + p * 150) + ' 240 q-24 -6 -34 10 M' + (66 + p * 150) + ' 240 q24 -6 34 10 M' + (66 + p * 150) + ' 240 q-6 -20 -24 -22 M' + (66 + p * 150) + ' 240 q8 -20 26 -20" stroke="#4f8f5a" stroke-width="5" fill="none" stroke-linecap="round"/>';
    var k = clamp((u - 1.4) / 2.4), n = Math.min(35, Math.floor(k * 35));
    s += flow(t, 680, 120, 380, 150, 6, 0.45, "usd", 0.45) + txt(330, 110, n + " مليار $", 44, "#4f8f5a");
    return s + tag("رأس الحكمة", 200, 40, u, 0.6, -3, 22) + tag("قبل التعويم بأسبوعين", 470, 330, u, 2.8, 3, 16, "#bfe0ff");
  });
  // 22 — the real fix: grow more tomatoes — export more, bring more tourists
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(220, 400, ease(k)), 185, 1.0]; }, function (u, d, t) {
    var s = sky("day") + sun(80, 40, 22, "#ffe9a8") + clouds(t, 12, 10, 4, 0.8) + grass(t, 250, "grass-day", "#5a7a3a");
    for (var r = 0; r < 6; r++) { var x = 40 + r * 70, g = clamp((u - 0.3 - r * 0.25) / 0.8); s += '<path d="M' + x + ' 300 v' + f(-60 * g) + '" stroke="#4f8f3a" stroke-width="4"/>'; if (g > 0.6) s += tomato(x - 8, 300 - 50 * g, 10, t, r) + tomato(x + 9, 300 - 30 * g, 9, t, r + 2); }
    s += hardHat(240, 180, 0.8, t, "happy", { hat: "cap", shirt: "#4f8f5a", arm: "wave" });
    s += ship(560, 220, t, { s: 0.45 }) + plane(lerp(700, 420, (t * 0.08) % 1), 70, 0.7, t);
    return s + tag("تصدّر أكتر", 560, 290, u, 2.0, 3, 19) + tag("سياح أكتر", 470, 30, u, 3.0, -3, 19, "#bfe0ff");
  });
  // 23 — payoff: next time remember the market
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(260, 360, k), 190, lerp(1.05, 0.95, k)]; }, function (u, d, t) {
    var s = market(t) + stall(150, 230, t, { n: 2, price: "$", seller: "happy" }) + queue(t, 330, 200, 6, 52, { arm: true, note: "usd", moods: ["happy", "curious"] });
    s += phone(560, 120, 0.45, t, news(t, 4));
    return s + tag("زباين كتير", 470, 330, u, 2.2, 3, 19) + tag("طماطم قليلة", 160, 330, u, 3.2, -3, 19, "#f2a0a0");
  });
  // 24 — outro
  shot(24, function (u, d) { return [lerp(300, 340, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = market(t) + stall(170, 230, t, { n: 12, price: "؟", seller: "happy", sellerArm: "wave" }) + person(420, 170, 1.1, t, "happy", { arm: "wave", shirt: "#2f6f9f" });
    return s + tag("قولولنا!", 480, 60, u, 0.4, 3, 26);
  });

  window.__parts = { market: market, stall: stall, tomato: tomato, bill: bill, person: person, hardHat: hardHat, queue: queue, chart: chart, txt: txt, tag: tag, sky: sky, clouds: clouds, city: city, seesaw: seesaw, bank: bank, phone: phone, news: news, ship: ship, sea: sea };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
