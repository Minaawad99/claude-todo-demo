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

  // ── new pieces for this episode: a car in side view, an in-line engine cut open, one cylinder through its four strokes,
  // crankshaft, gearbox, differential, and the 1886 Benz Patent-Motorwagen (after the Commons photos, see ../refs/SOURCES.md) ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">?</text>'; }
  function boom(x, y, r, k) { if (k <= 0) return ""; var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.5 + k)) + '" fill="url(#gBoom)" opacity="' + f(clamp(1.4 - k)) + '"/>'; for (var i = 0; i < 8; i++) { var a = i * 0.785; s += '<path d="M' + f(x + Math.cos(a) * r * 0.4) + ' ' + f(y + Math.sin(a) * r * 0.4) + ' L' + f(x + Math.cos(a) * r * (0.7 + k * 0.6)) + ' ' + f(y + Math.sin(a) * r * (0.7 + k * 0.6)) + '" stroke="' + YEL + '" stroke-width="2.4" opacity="' + f(clamp(1.2 - k)) + '"/>'; } return s; }
  function wheel(x, y, r, ang, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="url(#gTyre)" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(r * 0.6) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><g transform="rotate(' + f(ang) + ')">';
    for (var k = 0; k < 5; k++) s += '<path d="M0 0 L0 ' + f(-r * 0.56) + '" stroke="#7a828c" stroke-width="' + f(r * 0.14) + '" stroke-linecap="round" transform="rotate(' + (k * 72) + ')"/>';
    return s + '<circle r="' + f(r * 0.16) + '" fill="#5a6068" stroke="' + INK + '"/></g></g>'; }
  // a red hatchback seen from the side; o: {s, hood (cut-open glow under the bonnet), flash, spin (wheel angle), tilt}
  function car(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 400 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="40" rx="150" ry="9" fill="#000" opacity=".2"/>';
    s += '<path d="M-150 20 C-152 0 -146 -10 -130 -14 L-80 -18 L-40 -54 C-30 -62 50 -62 70 -50 L110 -20 L140 -14 C152 -10 156 4 154 20 Z" fill="' + (o.col || "url(#gCar)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
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
    // piston after the photo of a piston and con-rod: crown with three ring grooves, the gudgeon-pin boss, a shorter skirt
    s += '<path d="M' + (x - 44) + ' ' + f(top) + ' h88 v26 c0 8 -6 14 -10 14 h-68 c-4 0 -10 -6 -10 -14 Z" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2.4"/>' + [5, 10, 15].map(function (r) { return '<path d="M' + (x - 44) + ' ' + f(top + r) + ' h88" stroke="#3a3f46" stroke-width="' + (r === 15 ? 2.2 : 1.6) + '"/>'; }).join("") + '<circle cx="' + x + '" cy="' + f(top + 27) + '" r="7" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/>';
    var cx = x + R * Math.sin(a), cyc = cy0 - R * Math.cos(a), ra = Math.atan2(cyc - pinY, cx - x), pxn = -Math.sin(ra), pyn = Math.cos(ra), w1 = 5, w2 = 9;
    // I-beam con-rod: narrow at the small end, wider at the big end, with a bolted cap
    s += '<path d="M' + f(x + pxn * w1) + ' ' + f(pinY + pyn * w1) + ' L' + f(cx + pxn * w2) + ' ' + f(cyc + pyn * w2) + ' L' + f(cx - pxn * w2) + ' ' + f(cyc - pyn * w2) + ' L' + f(x - pxn * w1) + ' ' + f(pinY - pyn * w1) + ' Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="1.8"/><path d="M' + f(x) + ' ' + f(pinY) + ' L' + f(cx) + ' ' + f(cyc) + '" stroke="#5a6068" stroke-width="2.4"/>';
    var cwx = x - Math.sin(a) * 26, cwy = cy0 + Math.cos(a) * 26;   // counterweight opposite the crank pin
    s += '<circle cx="' + x + '" cy="' + cy0 + '" r="' + (R + 10) + '" fill="#4b5056" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="' + f(cwx) + '" cy="' + f(cwy) + '" rx="30" ry="18" transform="rotate(' + f(ang) + ' ' + f(cwx) + ' ' + f(cwy) + ')" fill="url(#gGear)" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(cx) + '" cy="' + f(cyc) + '" r="13" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(cx) + '" cy="' + f(cyc) + '" r="5" fill="#2b2e33"/><circle cx="' + f(cx + pxn * 10) + '" cy="' + f(cyc + pyn * 10) + '" r="2" fill="' + INK + '"/><circle cx="' + f(cx - pxn * 10) + '" cy="' + f(cyc - pyn * 10) + '" r="2" fill="' + INK + '"/><circle cx="' + x + '" cy="' + cy0 + '" r="6" fill="#2b2e33"/>';
    s += '<path d="M' + (x - 70) + ' ' + (y - 10) + ' H' + (x + 70) + ' V' + (y - 44) + ' H' + (x - 70) + ' Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    var iv = clamp(o.inV || 0) * 12, ev = clamp(o.exV || 0) * 12;
    if (o.springs !== false) [[x - 26, iv], [x + 26, ev]].forEach(function (v) { var sp = ""; for (var k = 0; k < 6; k++) sp += (k ? " L" : "M") + (v[0] + (k % 2 ? 7 : -7)) + " " + f(y - 78 + k * 5 + v[1] * 0.5); s += '<path d="' + sp + '" stroke="#3a3f46" stroke-width="2.4" fill="none"/>'; });   // valve springs, as in the photos with the rocker cover off
    s += '<path d="M' + (x - 26) + ' ' + f(y - 80 + iv) + ' V' + f(y - 6 + iv) + ' M' + (x - 36) + ' ' + f(y - 6 + iv) + ' h20" stroke="#c9ced4" stroke-width="5"/><path d="M' + (x + 26) + ' ' + f(y - 50 + ev) + ' V' + f(y - 6 + ev) + ' M' + (x + 16) + ' ' + f(y - 6 + ev) + ' h20" stroke="#c9ced4" stroke-width="5"/>';
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
    for (var k = 0; k <= 7; k++) { var ka = -2.3 + 4.6 * k / 7; s += '<path d="M' + f(Math.sin(ka) * (r - 4)) + ' ' + f(-Math.cos(ka) * (r - 4)) + ' L' + f(Math.sin(ka) * (r - 12)) + ' ' + f(-Math.cos(ka) * (r - 12)) + '" stroke="' + (k > 5 ? RED : "#e9e4d8") + '" stroke-width="2"/><text x="' + f(Math.sin(ka) * (r - 22)) + '" y="' + f(-Math.cos(ka) * (r - 22) + 4) + '" text-anchor="middle" style="font:700 10px Noto Sans;fill:#e9e4d8">' + k + '</text>'; }
    return s + '<path d="M0 0 L' + f(Math.sin(a) * (r - 10)) + ' ' + f(-Math.cos(a) * (r - 10)) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + RED + '"/>' + (label ? '<text y="' + (r * 0.5) + '" text-anchor="middle" style="font:700 9px Noto Sans;fill:#9a958c;direction:ltr">' + label + '</text>' : '') + '</g>'; }
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
  // Bertha as in the 1888 photos: a cream shawl over her head and shoulders, a long light dress
  function bertha(x, y, t, mood, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-50 150 C-56 50 -30 28 0 28 C30 28 56 50 50 150 Z" fill="#a9c2a0" stroke="' + INK + '" stroke-width="3"/><path d="M-30 80 h60 M-36 110 h72" stroke="#7a9a72" stroke-width="2"/>' + head(0, -20, 36, mood, t, o.look || 0) + '<path d="M-44 -10 C-50 -60 -24 -70 0 -70 C24 -70 50 -60 44 -10 C36 -40 24 -52 0 -52 C-24 -52 -36 -40 -44 -10 Z" fill="#f1e6c8" stroke="' + INK + '" stroke-width="3"/><path d="M-44 -10 C-40 20 -30 40 -46 60 M44 -10 C40 20 30 40 46 60" stroke="#f1e6c8" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M18 -60 L36 -80" stroke="#c9a04e" stroke-width="2"/></g>'; }
  function boy(x, y, t, o) { o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 6 + x) * 2) + ') scale(' + (o.s || 1) + ')"><path d="M-36 140 C-40 50 -24 28 0 28 C24 28 40 50 36 140 Z" fill="#6a6a6a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -14, 30, "happy", t, o.look || 0) + '<path d="M-30 -30 C-30 -54 30 -54 34 -30 L44 -26 L-30 -26 Z" fill="#5a5a5a" stroke="' + INK + '" stroke-width="2.4"/>' + (o.push ? '<path d="M' + (o.push * 30) + ' 50 l' + (o.push * 40) + ' -6" stroke="#6a6a6a" stroke-width="12" stroke-linecap="round"/>' : '') + '</g>'; }

  // ── «150 PS gegen 400 PS» — new pieces (shapes from real photos: see ../refs/SOURCES.md) ──
  var GRN = "#5bbf6a", ORG = "#e8742e";
  function txt(x, y, s, size, col, anchor, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + size + 'px Noto Sans;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + (size > 20 ? 3 : 2) + ';paint-order:stroke">' + s + '</text>'; }
  function pulse(t, sp) { return 0.5 + 0.5 * Math.sin(t * (sp || 5)); }
  function badge(x, y, s, w, col, tc) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="' + f(-w / 2) + '" y="-22" width="' + w + '" height="44" rx="12" fill="' + (col || INK) + '" stroke="' + INK + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:900 24px Noto Sans;fill:' + (tc || YEL) + '">' + s + '</text></g>'; }
  // the hard-hat character (orange vest, white helmet)
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/>';
    if (o.wave) { var wa = Math.sin(t * 7) * 18; s += '<path d="M-44 60 Q-80 30 ' + f(-96 + wa * 0.3) + ' -10" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(-96 + wa * 0.3) + '" cy="-14" r="11" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>'; }
    return s + '</g>';
  }
  // a low two-door sports coupé (generic, no badge), nose to the right; o: {s, spin, col}
  function sportsCar(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 500 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="40" rx="160" ry="9" fill="#000" opacity=".2"/>';
    s += '<path d="M-158 18 C-160 0 -150 -10 -134 -14 L-70 -22 C-40 -48 10 -50 40 -42 L120 -16 C150 -12 162 0 160 18 Z" fill="' + (o.col || "url(#gSport)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-56 -22 C-34 -42 6 -44 30 -38 L52 -20 Z" fill="#2b3a48" stroke="' + INK + '" stroke-width="2"/><path d="M-8 -40 V-20" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-150 -12 L-128 -18 L-126 -26 L-160 -24 Z" fill="#1c1c1c"/><path d="M120 -12 L156 -2" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/><rect x="-162" y="-4" width="10" height="6" rx="2" fill="' + RED + '"/>';
    s += '<path d="M-60 6 H60" stroke="' + INK + '" stroke-width="1.6" opacity=".4"/><path d="M-120 10 h20" stroke="#3a3f46" stroke-width="5"/>';
    s += wheel(-100, 18, 26, sp) + wheel(104, 18, 26, sp);
    return s + '</g>';
  }
  function hatch(x, y, t, o) { o = o || {}; return car(x, y, t, Object.assign({ col: "url(#gCarB)" }, o)); }
  // an engine block seen from the side: n cylinders in a row (o.v: two banks in a V, front view), pistons moving, flashes in firing order
  function engineRow(x, y, t, o) {
    o = o || {}; var n = o.n || 4, w = o.w || 40, h = o.h || 90, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', W = n * w + 20, rpm = o.rpm || 2;
    s += '<rect x="' + f(-W / 2 - 8) + '" y="-22" width="' + f(W + 16) + '" height="22" rx="6" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<rect x="' + f(-W / 2) + '" y="0" width="' + W + '" height="' + h + '" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/>';
    var ORD = n === 4 ? [0, 2, 3, 1] : n === 5 ? [0, 3, 1, 4, 2] : [0, 4, 2, 6, 1, 5, 3, 7];
    for (var i = 0; i < n; i++) {
      var cx = -W / 2 + 10 + w / 2 + i * w, ph = (t * rpm + ORD[i] / n) % 1, py = 8 + (h - 44) * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      s += '<rect x="' + f(cx - w / 2 + 3) + '" y="2" width="' + (w - 6) + '" height="' + (h - 4) + '" fill="#2b2e33"/>';
      if (ph < 0.12 && o.fire !== false) s += '<rect x="' + f(cx - w / 2 + 3) + '" y="2" width="' + (w - 6) + '" height="' + f(py) + '" fill="url(#gBoom)" opacity="' + f(1 - ph / 0.12) + '"/>';
      s += '<rect x="' + f(cx - w / 2 + 4) + '" y="' + f(py) + '" width="' + (w - 8) + '" height="24" rx="3" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(cx) + ' ' + f(py + 24) + ' L' + f(cx) + ' ' + (h + 12) + '" stroke="#5a6068" stroke-width="6"/>';
      s += '<rect x="' + f(cx - 3) + '" y="-34" width="6" height="14" fill="#fbf6e6" stroke="' + INK + '" stroke-width="1.2"/>';
    }
    s += '<path d="M' + f(-W / 2 - 14) + ' ' + (h + 12) + ' H' + f(W / 2 + 14) + '" stroke="#5a6068" stroke-width="10" stroke-linecap="round"/><rect x="' + f(-W / 2 - 8) + '" y="' + h + '" width="' + f(W + 16) + '" height="30" rx="10" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4" opacity=".85"/>';
    return s + '</g>';
  }
  // a V8 from the front: two banks of cylinders at 90°, crank in the middle, pistons pumping; flashes alternate
  function v8(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', rpm = o.rpm || 2;
    s += '<path d="M-130 -70 L-20 40 L20 40 L130 -70 L100 -100 L0 0 L-100 -100 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="3"/>';
    [-1, 1].forEach(function (sg, b) { var g = '<g transform="rotate(' + (sg * 45) + ')">';
      var ph = (t * rpm + b * 0.25) % 1, py = -150 + 40 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      g += '<rect x="-34" y="-190" width="68" height="150" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.4"/>';
      if (ph % 0.5 < 0.08) g += '<rect x="-32" y="-188" width="64" height="' + f(py + 188) + '" fill="url(#gBoom)"/>';
      g += '<rect x="-30" y="' + f(py) + '" width="60" height="28" rx="4" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/><path d="M0 ' + f(py + 28) + ' L0 -10" stroke="#5a6068" stroke-width="8"/>';
      g += '<rect x="-46" y="-218" width="92" height="30" rx="6" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-5" y="-232" width="10" height="16" fill="#fbf6e6" stroke="' + INK + '"/>';
      s += g + '</g>'; });
    s += '<circle cx="0" cy="10" r="34" fill="#8a929c" stroke="' + INK + '" stroke-width="2.6"/><g transform="rotate(' + f(t * rpm * 720) + ' 0 10)"><path d="M0 10 L0 -14" stroke="#2b2e33" stroke-width="10" stroke-linecap="round"/></g><circle cx="0" cy="10" r="6" fill="#2b2e33"/>';
    s += '<path d="M-60 60 C-60 100 60 100 60 60 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // the turbocharger cut open (photos: a cutaway turbo): hot snail housing with the turbine on the left, the compressor on the right,
  // one shaft between; spin = wheel speed (turns/s for drawing), o: {hot, cold air}
  function turbo(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, sp = (o.spin == null ? 6 : o.spin) * t * 360, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    function snail(cx, fill) { return '<path d="M' + (cx - 64) + ' 0 A64 64 0 1 1 ' + (cx + 20) + ' 60 L' + (cx + 70) + ' 60 L' + (cx + 70) + ' 84 L' + (cx + 10) + ' 84 A84 84 0 0 1 ' + (cx - 64) + ' 0 Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/><circle cx="' + cx + '" cy="0" r="62" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/>'; }
    function wheelBlades(cx, col) { var g = '<g transform="translate(' + cx + ' 0) rotate(' + f(sp) + ')"><circle r="44" fill="#2b2e33"/>'; for (var k = 0; k < 10; k++) g += '<path d="M0 0 Q18 -10 40 -6 L40 6 Q16 -2 0 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + (k * 36) + ')"/>'; return g + '<circle r="10" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/></g>'; }
    s += snail(-110, "url(#gHot)") + snail(110, "url(#gSnail)");
    s += '<rect x="-60" y="-14" width="120" height="28" rx="6" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-110 0 H110" stroke="#c9ced4" stroke-width="8"/>';
    s += wheelBlades(-110, "#e9a06e") + wheelBlades(110, "#d9dee3");
    if (o.hot !== false) for (var e = 0; e < 8; e++) { var u = (t * 1.3 + e / 8) % 1; s += '<circle cx="' + f(-220 + u * 90) + '" cy="' + f(70 - u * 60 + Math.sin(e) * 6) + '" r="' + f(6 + u * 3) + '" fill="#8a857a" opacity="' + f(0.8 * (1 - u * 0.6)) + '"/>'; }
    if (o.cold) for (var c = 0; c < 10; c++) { var v = (t * 1.6 + c / 10) % 1; s += '<circle cx="' + f(lerp(110, 260, v)) + '" cy="' + f(lerp(0, 72, v) + Math.sin(c) * 5) + '" r="4" fill="' + CY + '" opacity="' + f(1 - v * 0.4) + '"/>'; }
    return s + '</g>';
  }
  // a cartoon horse in side view (brown body, darker mane), walking legs; o: {s, pull}
  function horse(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 6)) * -2) + ') scale(' + (o.s || 1) + ')">', st = Math.sin(t * 6) * 14;
    [[-40, st], [-24, -st], [36, -st], [52, st]].forEach(function (l) { s += '<path d="M' + l[0] + ' 10 L' + f(l[0] + l[1] * 0.6) + ' 70" stroke="#6a4424" stroke-width="12" stroke-linecap="round"/><path d="M' + f(l[0] + l[1] * 0.6 - 6) + ' 72 h12" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>'; });
    s += '<ellipse cx="6" cy="0" rx="70" ry="34" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M56 -16 L90 -66 C96 -76 116 -76 122 -66 L132 -42 C134 -34 126 -30 118 -34 L104 -40 L80 6 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="3"/><circle cx="108" cy="-58" r="3.4" fill="' + INK + '"/><path d="M94 -76 L98 -90 L104 -74" fill="#7a4f2a" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M90 -70 C76 -50 66 -30 58 -14" stroke="#3a2412" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-62 -6 C-90 0 -96 30 -86 50" stroke="#3a2412" stroke-width="9" fill="none" stroke-linecap="round" transform="rotate(' + f(Math.sin(t * 4) * 8) + ' -62 -6)"/>';
    return s + '</g>';
  }
  // a stopwatch
  function stopwatch(x, y, r, v, max, label, col) { var a = (v / max) * Math.PI * 2, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-8" y="' + (-r - 16) + '" width="16" height="12" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/><circle r="' + r + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M0 0 L0 ' + (-r) + ' A' + r + ' ' + r + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(Math.sin(a) * r) + ' ' + f(-Math.cos(a) * r) + ' Z" fill="' + (col || YEL) + '" opacity=".55"/><path d="M0 0 L' + f(Math.sin(a) * (r - 6)) + ' ' + f(-Math.cos(a) * (r - 6)) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/>';
    return s + '</g>' + txt(x, y + r + 26, label, 20, "#fff"); }
  function workshop(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9d4c8"/>'; for (var i = -6; i < 18; i++) s += '<rect x="' + (i * 80 + ((t * 40) % 80)) + '" y="-300" width="40" height="960" fill="#cfc9bc" opacity=".6"/>'; return s + '<rect x="-400" y="300" width="1440" height="200" fill="#8a857a"/>'; }
  function dark(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f2328"/>'; for (var i = 0; i < 30; i++) s += '<circle cx="' + f(-300 + hash(i) * 1240) + '" cy="' + f(-200 + ((hash(i + 3) * 700 + t * 20) % 700)) + '" r="' + f(1 + hash(i + 7) * 2) + '" fill="#f2c230" opacity="' + f(0.15 + 0.2 * pulse(t + i, 3)) + '"/>'; return s; }
  function mixBox(x, y, w, h, n, t, k) { var s = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx="8" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.4"/>'; for (var i = 0; i < n; i++) s += '<circle cx="' + f(x + 8 + hash(i + k) * (w - 16) + Math.sin(t * 6 + i) * 3) + '" cy="' + f(y + 8 + hash(i + 5 + k) * (h - 16) + Math.cos(t * 5 + i) * 3) + '" r="3.4" fill="' + (i % 3 ? CY : YEL) + '"/>'; return s; }

  // ── more realistic redraws (after the reference photos, see ../refs/SOURCES.md); these replace the simpler versions above ──
  function alloy(x, y, r, ang, o) {   // a modern alloy wheel: dark tyre with sidewall, 10 split spokes, brake disc + caliper
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#1c1e21" stroke="' + INK + '" stroke-width="2"/><circle r="' + f(r * 0.94) + '" fill="none" stroke="#3a3d42" stroke-width="1.4"/><circle r="' + f(r * 0.7) + '" fill="#5a6068" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<circle r="' + f(r * 0.5) + '" fill="#8a929c" opacity=".6"/><path d="M' + f(r * 0.2) + ' ' + f(-r * 0.62) + ' a8 8 0 0 1 ' + f(r * 0.3) + ' ' + f(r * 0.1) + '" stroke="' + (o.caliper || "#c23a26") + '" stroke-width="' + f(r * 0.16) + '" fill="none"/>';
    s += '<g transform="rotate(' + f(ang) + ')">'; for (var k = 0; k < 5; k++) s += '<g transform="rotate(' + (k * 72) + ')"><path d="M-2 ' + f(-r * 0.16) + ' L' + f(-r * 0.12) + ' ' + f(-r * 0.68) + ' M2 ' + f(-r * 0.16) + ' L' + f(r * 0.12) + ' ' + f(-r * 0.68) + '" stroke="#d9dee3" stroke-width="' + f(r * 0.09) + '" stroke-linecap="round"/></g>';
    return s + '<circle r="' + f(r * 0.16) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/></g></g>'; }
  // a VW-Golf-like compact hatchback (no badge): short bonnet, steep windscreen, long flat roof, thick C-pillar, upright tailgate,
  // slim LED headlight, wide horizontal tail-light
  function hatch(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 400 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="34" rx="156" ry="8" fill="#000" opacity=".25"/>';
    s += '<path d="M-150 16 C-154 -6 -150 -24 -142 -32 L-128 -40 C-118 -56 -104 -62 -84 -63 L4 -63 C20 -62 30 -58 40 -50 L74 -26 L128 -20 C146 -17 154 -8 154 6 L152 16 Z" fill="' + (o.col || "url(#gCarB)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-124 -38 C-114 -52 -102 -57 -86 -58 L-60 -58 L-56 -30 L-122 -30 Z" fill="#1f2d3a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-50 -58 L-6 -58 L-4 -30 L-46 -30 Z M2 -58 C18 -58 28 -54 36 -48 L62 -30 L4 -30 Z" fill="#2b3e52" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-60 -60 L-54 -28" stroke="' + INK + '" stroke-width="7"/><path d="M-140 -14 C-60 -18 60 -18 150 -10" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="M-148 -4 H150" stroke="' + INK + '" stroke-width="1" opacity=".35"/>';
    s += '<path d="M-2 -28 V12 M-50 -28 V12" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><rect x="-36" y="-22" width="12" height="3" rx="1.5" fill="#1c1c1c"/><rect x="14" y="-22" width="12" height="3" rx="1.5" fill="#1c1c1c"/>';
    s += '<path d="M34 -36 l10 -2 l2 8 l-10 0 Z" fill="' + (o.col || "url(#gCarB)") + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M128 -18 L152 -12 L150 -6 L130 -10 Z" fill="#eaf6ff" stroke="' + INK + '" stroke-width="1.2"/><path d="M130 -12 h18" stroke="#9fe0ff" stroke-width="1.6"/><path d="M-152 -26 h20 v6 h-20 Z" fill="#d8352a" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M-150 10 h22 M128 10 h24" stroke="#1c1c1c" stroke-width="4" opacity=".6"/>';
    s += '<path d="M-124 16 a30 30 0 0 1 60 0 M68 16 a30 30 0 0 1 60 0" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    s += alloy(-94, 16, 26, sp) + alloy(98, 16, 26, sp);
    return s + '</g>';
  }
  // a Porsche-911-like coupé (no badge): low nose with the headlights as round bulges on the wings, raked windscreen,
  // the long fastback roofline, wide rear haunch, ducktail spoiler, tail-light bar
  function sportsCar(x, y, t, o) {
    o = o || {}; var sp = o.spin == null ? t * 500 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<ellipse cx="0" cy="36" rx="162" ry="8" fill="#000" opacity=".25"/>';
    s += '<path d="M-156 14 C-160 -2 -158 -14 -150 -20 L-140 -24 C-128 -34 -110 -46 -84 -54 C-56 -62 -30 -62 -12 -58 C6 -54 22 -44 40 -30 L104 -22 C126 -26 140 -22 150 -14 C158 -8 162 2 160 14 Z" fill="' + (o.col || "url(#gSport)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M-150 -22 L-158 -26 L-154 -30 L-138 -26 Z" fill="#1c1c1c"/>';
    s += '<path d="M-96 -46 C-74 -56 -46 -58 -24 -55 L-10 -30 L-104 -30 Z" fill="#1f2d3a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-4 -52 C10 -48 22 -40 32 -30 L-4 -30 Z" fill="#2b3e52" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-60 -54 L-58 -30" stroke="' + INK + '" stroke-width="2" opacity=".6"/><ellipse cx="112" cy="-24" rx="18" ry="7" fill="#eaf6ff" stroke="' + INK + '" stroke-width="1.4"/><path d="M-156 -12 H-132" stroke="#d8352a" stroke-width="4"/>';
    s += '<path d="M-130 -28 C-80 -30 40 -26 120 -16" stroke="#fff" stroke-width="1.6" opacity=".45"/><path d="M-10 -28 V12" stroke="' + INK + '" stroke-width="1.2" opacity=".6"/><rect x="-26" y="-20" width="10" height="3" rx="1.5" fill="#1c1c1c"/>';
    s += '<path d="M-140 -2 h30" stroke="#1c1c1c" stroke-width="3" opacity=".5"/><path d="M-80 4 C-60 6 -40 6 -20 4" stroke="' + INK + '" stroke-width="1" opacity=".4"/>';
    s += '<path d="M-128 14 a32 32 0 0 1 64 0 M70 14 a30 30 0 0 1 60 0" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    s += alloy(-96, 14, 28, sp, { caliper: "#f2c230" }) + alloy(100, 14, 26, sp, { caliper: "#f2c230" });
    return s + '</g>';
  }
  // an inline engine from the side, as in the cut-away photos: aluminium block with a cut window (bores + pistons),
  // head, ribbed valve cover with oil filler cap, intake runners above, exhaust manifold in front, timing cover + pulleys + belt
  function engineRow(x, y, t, o) {
    o = o || {}; var n = o.n || 4, w = o.w || 40, h = o.h || 90, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', W = n * w + 20, rpm = o.rpm || 2, X0 = -W / 2, X1 = W / 2;
    var ORD = n === 4 ? [0, 2, 3, 1] : n === 5 ? [0, 3, 1, 4, 2] : [0, 4, 2, 6, 1, 5, 3, 7];
    // intake runners behind (curving up to a plenum)
    for (var r = 0; r < n; r++) { var rx = X0 + 10 + w / 2 + r * w; s += '<path d="M' + f(rx) + ' -28 C' + f(rx) + ' -60 ' + f(rx + w * 0.3) + ' -62 ' + f(rx + w * 0.3) + ' -70" stroke="#3a3f46" stroke-width="' + f(w * 0.42) + '" fill="none"/><path d="M' + f(rx) + ' -28 C' + f(rx) + ' -60 ' + f(rx + w * 0.3) + ' -62 ' + f(rx + w * 0.3) + ' -70" stroke="#6a727c" stroke-width="' + f(w * 0.3) + '" fill="none"/>'; }
    s += '<rect x="' + f(X0 + 4) + '" y="-88" width="' + f(W - 8) + '" height="20" rx="10" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.2"/>';
    // valve cover (ribbed) + head
    s += '<path d="M' + f(X0 - 4) + ' -6 L' + f(X0 + 4) + ' -30 H' + f(X1 - 4) + ' L' + f(X1 + 4) + ' -6 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var rb = X0 + 14; rb < X1 - 8; rb += 12) s += '<path d="M' + f(rb) + ' -27 V-9" stroke="#8a929c" stroke-width="2"/>';
    s += '<rect x="' + f(X1 - 34) + '" y="-40" width="18" height="10" rx="3" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<rect x="' + f(X0 - 8) + '" y="-6" width="' + f(W + 16) + '" height="16" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.2"/>';
    // exhaust manifold behind the block: only the collector shows, coming out at the back end (left) and going down
    s += '<path d="M' + f(X0 + 10) + ' 2 C' + f(X0 - 20) + ' 4 ' + f(X0 - 34) + ' 30 ' + f(X0 - 36) + ' ' + (h + 30) + '" stroke="#7a4a2a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M' + f(X0 + 10) + ' 2 C' + f(X0 - 20) + ' 4 ' + f(X0 - 34) + ' 30 ' + f(X0 - 36) + ' ' + (h + 30) + '" stroke="#a8683a" stroke-width="5" fill="none" stroke-linecap="round"/>';
    // block with the cut window
    s += '<rect x="' + f(X0 - 4) + '" y="10" width="' + f(W + 8) + '" height="' + (h + 4) + '" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var i = 0; i < n; i++) {
      var cx = X0 + 10 + w / 2 + i * w, ph = (t * rpm + ORD[i] / n) % 1, py = 16 + (h - 50) * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      s += '<rect x="' + f(cx - w / 2 + 4) + '" y="12" width="' + (w - 8) + '" height="' + (h - 2) + '" fill="#2b2e33" stroke="#1c1c1c" stroke-width="1"/><rect x="' + f(cx - w / 2 + 4) + '" y="12" width="4" height="' + (h - 2) + '" fill="#5a6068" opacity=".6"/>';
      if (ph < 0.12 && o.fire !== false) s += '<rect x="' + f(cx - w / 2 + 4) + '" y="12" width="' + (w - 8) + '" height="' + f(py - 12) + '" fill="url(#gBoom)" opacity="' + f(1 - ph / 0.12) + '"/>';
      s += '<path d="M' + f(cx - w / 2 + 5) + ' ' + f(py) + ' h' + (w - 10) + ' v18 c0 4 -3 7 -6 7 h' + (-(w - 22)) + ' c-3 0 -6 -3 -6 -7 Z" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + f(cx - w / 2 + 5) + ' ' + f(py + 4) + ' h' + (w - 10) + ' M' + f(cx - w / 2 + 5) + ' ' + f(py + 8) + ' h' + (w - 10) + '" stroke="#3a3f46" stroke-width="1.2"/>';
      s += '<path d="M' + f(cx) + ' ' + f(py + 20) + ' L' + f(cx + 6 * Math.sin(ph * Math.PI * 4)) + ' ' + (h + 14) + '" stroke="#8a929c" stroke-width="7" stroke-linecap="round"/>';
    }
    s += '<path d="M' + f(X0 - 4) + ' ' + (h + 14) + ' H' + f(X1 + 4) + '" stroke="#5a6068" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + f(X0 - 4) + ' ' + (h + 14) + ' h' + f(W + 8) + ' v18 c0 10 -20 14 -' + f(W / 2) + ' 14 c-' + f(W / 2 - 20) + ' 0 -' + f(W / 2 - 4) + ' -4 -' + f(W / 2 + 8) + ' -14 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.2"/>';
    // timing cover with pulleys and the belt at the front end (right)
    var pa = t * rpm * 720;
    s += '<rect x="' + f(X1 + 4) + '" y="-24" width="16" height="' + (h + 46) + '" rx="6" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + f(X1 + 30) + ' -16 L' + f(X1 + 30) + ' ' + (h + 18) + '" stroke="#1c1c1c" stroke-width="5" stroke-dasharray="6 4" stroke-dashoffset="' + f(-pa * 0.2) + '"/>';
    [[-14, 12], [h + 14, 16], [h * 0.5, 10]].forEach(function (pp, k) { s += '<g transform="translate(' + f(X1 + 30 + (k === 2 ? 14 : 0)) + ' ' + f(pp[0]) + ') rotate(' + f(pa * (k ? 1 : 0.5)) + ')"><circle r="' + pp[1] + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/><path d="M0 ' + (-pp[1] + 3) + ' V' + (pp[1] - 3) + '" stroke="#3a3f46" stroke-width="2"/><circle r="3" fill="' + INK + '"/></g>'; });
    return s + '</g>';
  }
  // a V8 from the front, after the Holden V8 photo: two banks at 90° with ribbed valve covers, the intake manifold in the
  // valley, red plug leads, the front pulleys with the belt; a cut window in each bank shows the pistons
  function v8(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">', rpm = o.rpm || 2;
    s += '<path d="M-120 -60 L-30 30 L30 30 L120 -60 L100 -84 L0 10 L-100 -84 Z" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="3"/>';
    [-1, 1].forEach(function (sg, b) { var g = '<g transform="rotate(' + (sg * 45) + ')">';
      var ph = (t * rpm + b * 0.25) % 1, py = -150 + 40 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 4));
      g += '<rect x="-42" y="-196" width="84" height="170" rx="4" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-30" y="-188" width="60" height="150" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.6"/>';
      if (ph % 0.5 < 0.08) g += '<rect x="-30" y="-188" width="60" height="' + f(py + 188) + '" fill="url(#gBoom)"/>';
      g += '<path d="M-28 ' + f(py) + ' h56 v22 c0 5 -4 8 -8 8 h-40 c-4 0 -8 -3 -8 -8 Z" fill="url(#gPiston)" stroke="' + INK + '" stroke-width="2"/><path d="M-28 ' + f(py + 5) + ' h56 M-28 ' + f(py + 10) + ' h56" stroke="#3a3f46" stroke-width="1.4"/><path d="M0 ' + f(py + 30) + ' L0 -10" stroke="#8a929c" stroke-width="9" stroke-linecap="round"/>';
      g += '<rect x="-50" y="-222" width="100" height="28" rx="5" fill="url(#gBlock)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-46 -222 C-46 -250 46 -250 46 -222 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var rb = -36; rb <= 36; rb += 12) g += '<path d="M' + rb + ' -242 V-226" stroke="#8a929c" stroke-width="2"/>';
      g += '<path d="M' + (sg * 46) + ' -208 C' + (sg * 80) + ' -200 ' + (sg * 70) + ' -150 ' + (sg * 40) + ' -120" stroke="#c8261c" stroke-width="4" fill="none"/>';
      s += g + '</g>'; });
    // intake manifold in the valley, with the throttle body
    s += '<path d="M-60 -70 L-24 -150 H24 L60 -70 Z" fill="#6a727c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-30 -140 H30" stroke="#8a929c" stroke-width="3"/><circle cx="0" cy="-118" r="16" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/><path d="M-10 -118 H10" stroke="#c9ced4" stroke-width="3" transform="rotate(' + f(t * 40) + ' 0 -118)"/>';
    // front pulleys and belt
    var pa = t * rpm * 720;
    s += '<path d="M0 50 L-62 -10 L62 -10 Z" fill="none" stroke="#1c1c1c" stroke-width="6" stroke-linejoin="round" stroke-dasharray="8 4" stroke-dashoffset="' + f(-pa * 0.3) + '"/>';
    [[0, 50, 26], [-62, -10, 16], [62, -10, 18]].forEach(function (p) { s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + f(pa) + ')"><circle r="' + p[2] + '" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M0 ' + (-p[2] + 4) + ' V' + (p[2] - 4) + ' M' + (-p[2] + 4) + ' 0 H' + (p[2] - 4) + '" stroke="#3a3f46" stroke-width="2.4"/><circle r="4" fill="' + INK + '"/></g>'; });
    s += '<path d="M-60 60 C-60 100 60 100 60 60 Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // the turbocharger cut open (from cut-away turbos): cast-iron turbine snail glowing at the rim, aluminium compressor snail,
  // the centre bearing housing with its oil lines, and the round wastegate actuator
  function turbo(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, sp = (o.spin == null ? 6 : o.spin) * t * 360, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    function snail(cx, fill, flip) { var k = flip ? -1 : 1; return '<path d="M' + (cx - 66 * k) + ' 0 A66 66 0 1 ' + (flip ? 0 : 1) + ' ' + (cx + 22 * k) + ' 62 L' + (cx + 76 * k) + ' 62 L' + (cx + 76 * k) + ' 88 L' + (cx + 10 * k) + ' 88 A88 88 0 0 ' + (flip ? 1 : 0) + ' ' + (cx - 66 * k) + ' 0 Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/><rect x="' + (cx + (flip ? -84 : 70)) + '" y="56" width="14" height="38" rx="3" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + cx + '" cy="0" r="64" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.6"/>'; }
    function wheelBlades(cx, col) { var g = '<g transform="translate(' + cx + ' 0) rotate(' + f(sp) + ')"><circle r="46" fill="#1f2328"/>'; for (var k = 0; k < 11; k++) g += '<path d="M0 0 Q20 -12 44 -6 L44 6 Q18 -2 0 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + (k * 32.7) + ')"/>'; return g + '<circle r="11" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><circle r="3" fill="' + INK + '"/></g>'; }
    s += snail(-110, "#4b4f55", true) + '<circle cx="-110" cy="0" r="64" fill="none" stroke="#ff7a2a" stroke-width="4" opacity="' + f(0.35 + 0.25 * Math.sin(t * 3)) + '" filter="url(#glow)"/>' + snail(110, "url(#gSnail)", false);
    for (var b = 0; b < 8; b++) { var ba = b * Math.PI / 4; s += '<circle cx="' + f(-110 + Math.cos(ba) * 58) + '" cy="' + f(Math.sin(ba) * 58) + '" r="2.6" fill="#2b2e33"/><circle cx="' + f(110 + Math.cos(ba) * 58) + '" cy="' + f(Math.sin(ba) * 58) + '" r="2.6" fill="#5a6068"/>'; }
    s += '<path d="M-56 -22 H56 L48 22 H-48 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -22 V-46 H20 V-22 M-10 22 V40 H10 V22" stroke="#c9a04e" stroke-width="5" fill="none"/><path d="M-110 0 H110" stroke="#d9dee3" stroke-width="8"/>';
    s += '<circle cx="150" cy="-88" r="22" fill="#b9c0c8" stroke="' + INK + '" stroke-width="2.2"/><path d="M150 -66 L120 -40" stroke="#5a6068" stroke-width="4"/>';
    s += wheelBlades(-110, "#c98a5a") + wheelBlades(110, "#d9dee3");
    if (o.hot !== false) for (var e = 0; e < 8; e++) { var u = (t * 1.3 + e / 8) % 1; s += '<circle cx="' + f(-230 + u * 90) + '" cy="' + f(70 - u * 60 + Math.sin(e) * 6) + '" r="' + f(6 + u * 3) + '" fill="#8a857a" opacity="' + f(0.8 * (1 - u * 0.6)) + '"/>'; }
    if (o.cold) for (var c = 0; c < 10; c++) { var v = (t * 1.6 + c / 10) % 1; s += '<circle cx="' + f(lerp(110, 260, v)) + '" cy="' + f(lerp(0, 72, v) + Math.sin(c) * 5) + '" r="4" fill="' + CY + '" opacity="' + f(1 - v * 0.4) + '"/>'; }
    return s + '</g>';
  }
  // a horse in side view with real proportions: deep chest, arched neck, long tapering head, thin legs with knees, hocks
  // and dark hooves, mane and tail; it trots (diagonal leg pairs move together). Faces right.
  function horse(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y - Math.abs(Math.sin(t * 6)) * 3) + ') scale(' + (o.s || 1) + ')">', st = Math.sin(t * 6);
    function leg(hx, hy, sw, front, far) {   // hip/shoulder at (hx, hy), swing sw (-1..1)
      var kx = hx + sw * 10 + (front ? 4 : -4), ky = hy + 34, fx = kx + sw * 8, fy = hy + 72 - Math.max(0, sw) * 8, col = far ? "#5a3a1e" : "#7a4f2a";
      return '<path d="M' + hx + ' ' + hy + ' L' + f(kx) + ' ' + f(ky) + ' L' + f(fx) + ' ' + f(fy) + '" stroke="' + col + '" stroke-width="' + (far ? 8 : 9) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M' + f(fx - 5) + ' ' + f(fy + 4) + ' h11 l-2 -7 h-7 Z" fill="#1c1c1c"/>'; }
    s += leg(-46, 6, -st, false, true) + leg(44, 6, st, true, true);
    s += '<path d="M-62 -6 C-90 -4 -100 30 -92 60 C-86 40 -78 20 -64 8" fill="#3a2412" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + f(Math.sin(t * 4) * 6) + ' -62 -6)"/>';
    s += '<path d="M-64 -10 C-70 -30 -50 -40 -20 -38 C10 -36 40 -40 56 -34 C70 -28 70 0 62 14 C50 30 20 28 -10 26 C-40 28 -60 22 -64 -10 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M40 -36 C52 -60 70 -84 84 -92 C92 -96 100 -94 104 -88 L126 -60 C130 -54 128 -48 120 -48 C112 -48 106 -52 100 -58 L86 -66 C80 -50 72 -30 62 -14 Z" fill="url(#gHorse)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<circle cx="104" cy="-78" r="3" fill="' + INK + '"/><path d="M92 -94 L96 -110 L102 -92 Z" fill="#7a4f2a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="122" cy="-54" r="2" fill="' + INK + '"/>';
    s += '<path d="M88 -92 C74 -80 62 -60 52 -38" stroke="#3a2412" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M84 -86 C76 -76 70 -66 62 -52" stroke="#2a1a0c" stroke-width="3" fill="none"/>';
    s += '<path d="M-30 -30 C-10 -34 20 -34 40 -30" stroke="#c9905a" stroke-width="3" fill="none" opacity=".6"/>';
    s += leg(-50, 10, st, false, false) + leg(48, 10, -st, true, false);
    return s + '</g>';
  }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function street(t, sp) { return sky("day") + clouds(t, 20, 20, 5, 0.8) + city(t, 250, 90, "#b9a98a", true, 3, false) + road(t, 280, sp || 400); }

  // 0 — a Golf has 150 PS, a sports car 400
  shot(0, function (u, d) { return [lerp(280, 340, clamp(u / d)), 200, lerp(1.1, 1.0, ease(u / d))]; }, function (u, d, t) {
    var s = street(t, 420) + hatch(170, 268, t, { s: 0.85 }) + sportsCar(470 + Math.sin(t * 1.4) * 12, 270, t, { s: 0.85 });
    return s + badge(170, 120, "150 PS", 130, INK, "#bfe0ff") + (u > 1.2 ? badge(470, 120, "400 PS", 130, INK, YEL) : "");
  });
  // 1 — but what does that number actually mean?
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineer(160, 210, t, "curious", { s: 0.75 }) + badge(420, 160 + Math.sin(t * 3) * 6, "PS", 110, INK, YEL);
    return s + qmark(520, 110, t, 54) + qmark(330, 90, t, 44) + qmark(500, 250, t, 38);
  });
  // 2 — and how do you get almost three times as much out of an engine?
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 180, lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.6), s = workshop(t);
    s += '<rect x="150" y="' + f(280 - 60) + '" width="110" height="60" fill="#5d93ad" stroke="' + INK + '" stroke-width="3"/>' + txt(205, 205, "150", 22, "#bfe0ff");
    var h2 = lerp(60, 160, k) + 6 * Math.sin(t * 6); s += '<rect x="380" y="' + f(280 - h2) + '" width="110" height="' + f(h2) + '" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>' + txt(435, f(270 - h2), Math.round(lerp(150, 400, k)) + "", 22, YEL);
    return s + tag("fast ×3!", 320, 60, u, 1.6, -3, 26) + qmark(560, 120, t, 50);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 190, lerp(1.0, 0.95, u / d)]; }, function (u, d, t) {
    var s = street(t, 600) + hatch(lerp(120, 200, u / d), 268, t, { s: 0.7 }) + sportsCar(lerp(380, 470, u / d), 270, t, { s: 0.7 });
    return s + tag("Was steckt dahinter?", 320, 100, u, 0.2, -2, 28);
  });
  // 4 — 1 PS lifts 75 kg one metre in one second
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 1.0) / 1.0), s = workshop(t);
    s += '<rect x="400" y="20" width="20" height="290" fill="#8a5a2a" stroke="' + INK + '" stroke-width="2"/><circle cx="410" cy="24" r="18" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
    var wy = lerp(270, 150, ease(k)); s += '<path d="M410 24 V' + f(wy - 40) + ' M392 24 H250 L' + f(200 + 120 * ease(k) * 0.4) + ' 220" stroke="#5a4a34" stroke-width="3" fill="none"/>';
    s += weightBlock(410, wy + 40, "75 kg") + horse(lerp(140, 190, ease(k)), 230, t, { s: 0.7 });
    s += '<path d="M540 270 V150" stroke="' + YEL + '" stroke-width="4"/><path d="M530 270 H550 M530 150 H550" stroke="' + YEL + '" stroke-width="4"/>' + txt(578, 216, "1 m", 20, YEL);
    s += stopwatch(570, 70, 26, clamp(u - 1.0), 1, "1 s");
    return s + tag("1 PS", 200, 60, u, 0.3, -3, 26);
  });
  function weightBlock(x, y, label) { return '<path d="M' + (x - 40) + ' ' + f(y) + ' L' + (x - 30) + ' ' + f(y - 40) + ' H' + (x + 30) + ' L' + (x + 40) + ' ' + f(y) + ' Z" fill="#3a3f46" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 10) + ' ' + f(y - 40) + ' Q' + x + ' ' + f(y - 58) + ' ' + (x + 10) + ' ' + f(y - 40) + '" stroke="#3a3f46" stroke-width="5" fill="none"/>' + txt(x, y - 13, label, 15, "#fff"); }
  // 5 — a real horse can briefly manage almost 15 PS
  shot(5, function (u, d) { return [lerp(300, 340, u / d), 200, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 20, 5, 0.8) + grass(t, 260, "grass-day", "#5f8a3a") + horse(300, 220, t * 1.6, { s: 1.0 });
    for (var i = 0; i < 6; i++) { var du = (t * 1.5 + i / 6) % 1; s += '<circle cx="' + f(200 - du * 120) + '" cy="' + f(290 - du * 20) + '" r="' + f(4 + du * 8) + '" fill="#c9b07a" opacity="' + f(0.7 * (1 - du)) + '"/>'; }
    var n = Math.round(15 * clamp((u - 0.4) / 1.4)); s += badge(500, 90, "≈ " + n + " PS", 150, INK, YEL);
    return s + tag("kurzzeitig!", 500, 160, u, 1.8, 3, 20);
  });
  // 6 — both engines run the same cycle: intake, compression, ignition, exhaust
  shot(6, function (u, d) { return [320, 170, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var ang = (t * 360 * 0.7) % 720, st = Math.floor(ang / 180), s = graphPaper(t) + cylinder(200, 80, ang % 360, t, { inV: st === 0, exV: st === 3, mix: st <= 1, fire: st === 2 ? 1 - (ang % 180) / 180 : 0, spark: st === 2 && ang % 180 < 30, smoke: st === 3 });
    var L4 = ["Ansaugen", "Verdichten", "Zünden", "Ausstoßen"]; for (var k = 0; k < 4; k++) s += '<g transform="translate(460 ' + (70 + k * 56) + ')"><rect x="-90" y="-20" width="180" height="40" rx="10" fill="' + (k === st ? YEL : "#fbfaf6") + '" stroke="' + INK + '" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:800 17px Noto Sans;fill:' + INK + '">' + (k + 1) + '. ' + L4[k] + '</text></g>';
    return s;
  });
  // 7 — the piston sucks in air and fuel and squeezes them together
  shot(7, function (u, d) { return [220, 150, lerp(1.25, 1.35, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.3)), ang = 360 * k, s = graphPaper(t) + cylinder(220, 80, ang, t, { inV: k < 0.5 ? 1 : 0, mix: true, air: k < 0.5, spray: k < 0.5 });
    if (k > 0.5) s += arrow(330, 220, 330, 120, RED, 6, clamp((k - 0.5) * 4));
    return s + tag("Luft + Benzin", 120, 60, u, 0.3, -3, 16) + tag("zusammen!", 380, 90, u, d * 0.55, 3, 16);
  });
  // 8 — the spark plug fires and the explosion pushes the piston down
  shot(8, function (u, d) { var sh = u > 0.5 && u < 1.0 ? 6 * Math.sin(u * 80) : 0; return [220 + sh, 150, lerp(1.3, 1.2, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.4), ang = 180 * ease(k), s = graphPaper(t) + cylinder(220, 80, ang, t, { fire: u > 0.4 ? clamp(1.2 - k) : 0, spark: u > 0.25 && u < 0.6, mix: u < 0.4 });
    s += boom(220, 90, 60, clamp((u - 0.4) / 0.6)) + arrow(330, 120, 330, 230, YEL, 7, clamp((u - 0.5) / 0.5));
    return s + tag("Zündkerze", 110, 60, u, 0.2, -3, 15) + tag("Bumm!", 380, 70, u, 0.5, 3, 20, "#ffb08a");
  });
  // 9 — the crankshaft turns the up-and-down into turning
  shot(9, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var a = t * 4, s = graphPaper(t) + cylinder(180, 70, (a * 57.3) % 360, t, {});
    s += curl(180, 220, 70, -0.5, 2.6, YEL, 5, 1) + wheel(470, 190, 70, a * 57.3) + '<path d="M230 220 H400" stroke="#5a6068" stroke-width="10"/>';
    return s + tag("Kurbelwelle", 220, 330, u, 0.4, -3, 18) + tag("Drehung!", 480, 70, u, 1.4, 3, 20);
  });
  // 10 — the 150 PS engine often has only four cylinders and 1.5 litres
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineRow(320, 120, t, { n: 4, w: 56, h: 110, rpm: 1.5 });
    return s + badge(150, 60, "150 PS", 130, INK, "#bfe0ff") + tag("4 Zylinder", 200, 295, u, 0.6, -3, 20) + tag("1,5 Liter", 470, 295, u, 1.6, 3, 20);
  });
  // 11 — the 400 PS engine is for example a V8 with four litres
  shot(11, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + v8(320, 230, t, { s: 0.75, rpm: 1.5 });
    return s + badge(130, 60, "400 PS", 130, INK, YEL) + tag("V8", 520, 90, u, 0.5, 3, 28) + tag("4 Liter", 500, 300, u, 1.4, -3, 22);
  });
  // 12 — more displacement = more air and fuel per explosion
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var g = clamp((u - 0.3) / 1.2), s = graphPaper(t);
    s += mixBox(120, 100, 120, 130, 22, t, 0) + mixBox(lerp(380, 350, g), lerp(100, 50, g), lerp(120, 170, g), lerp(130, 180, g), Math.round(lerp(22, 44, g)), t, 50);
    s += txt(180, 258, "375 cm³", 20, "#bfe0ff") + txt(435, 258, "500 cm³", 20, YEL);
    return s + tag("Hubraum", 320, 40, u, 0.3, -2, 24) + tag("mehr pro Bumm", 300, 310, u, 1.6, 3, 18);
  });
  // 13 — more cylinders = more explosions per turn
  shot(13, function (u, d) { return [320, 180, lerp(1.06, 1.0, u / d)]; }, function (u, d, t) {
    var s = dark(t) + engineRow(180, 110, t, { n: 4, w: 34, h: 80, rpm: 1.2 }) + engineRow(460, 110, t, { n: 8, w: 30, h: 80, rpm: 1.2 });
    s += txt(180, 260, "2 pro Umdrehung", 18, "#bfe0ff") + txt(460, 260, "4 pro Umdrehung", 18, YEL);
    return s + tag("mehr Zylinder", 320, 320, u, 0.6, -2, 22);
  });
  // 14 — at 6000 rpm the four-cylinder bangs 200 times a second
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var rpm = clamp(u / 1.2), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + tacho(150, 170, 90, 6 * rpm / 7, "x1000 U/min");
    for (var k = 0; k < 4; k++) { var on = (Math.floor(t * 25) + [0, 2, 3, 1][k]) % 4 === 0; s += '<rect x="' + (330 + k * 60) + '" y="100" width="44" height="90" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (352 + k * 60) + '" cy="120" r="26" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(200 * clamp((u - 0.5) / 1.6)); s += badge(440, 260, n + " pro Sekunde", 240, INK, "#bfe0ff");
    return s;
  });
  // 15 — in the V8 it's 400 times
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1c1c1c"/>' + v8(200, 230, t * 1.6, { s: 0.6, rpm: 3 });
    for (var k = 0; k < 8; k++) { var on = (Math.floor(t * 30) + k) % 4 === 0; s += '<rect x="' + (370 + (k % 4) * 52) + '" y="' + (70 + Math.floor(k / 4) * 70) + '" width="38" height="56" rx="6" fill="#5a6068" stroke="#8a929c" stroke-width="2"/>' + (on ? '<circle cx="' + (389 + (k % 4) * 52) + '" cy="' + (88 + Math.floor(k / 4) * 70) + '" r="22" fill="url(#gBoom)"/>' : ''); }
    var n = Math.round(400 * clamp(u / 1.2)); return s + badge(470, 270, n + " pro Sekunde", 240, INK, YEL);
  });
  // 16 — the second trick is the turbo
  shot(16, function (u, d) { var k = ease(u / d); return [320, 180, lerp(0.8, 1.0, k)]; }, function (u, d, t) {
    var s = workshop(t) + turbo(320, 170, t, { s: 0.9, spin: 2 + u * 3, cold: false, hot: false });
    return s + tag("Turbo", 320, 50, u, 0.3, -3, 30);
  });
  // 17 — the hot exhaust spins a turbine at up to 200,000 rpm
  shot(17, function (u, d) { return [lerp(300, 240, u / d), 180, lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = dark(t) + turbo(320, 170, t, { s: 0.9, spin: 12, cold: false });
    var n = Math.round(200000 * clamp((u - 0.6) / 2)); s += badge(220, 320, n.toLocaleString("de-DE") + " U/min", 250, INK, "#ffb08a");
    return s + tag("Abgas", 130, 60, u, 0.4, -3, 20, "#f2a0a0") + tag("Turbine", 220, 40, u, 1.2, 3, 18);
  });
  // 18 — on the same shaft a compressor presses fresh air into the engine
  shot(18, function (u, d) { return [lerp(360, 400, u / d), 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = dark(t) + turbo(260, 170, t, { s: 0.9, spin: 12, cold: true });
    s += engineRow(540, 210, t, { n: 4, w: 30, h: 70, rpm: 1.5, s: 0.9 }) + '<path d="M420 236 C470 240 480 160 520 160" stroke="#5a6068" stroke-width="16" fill="none"/>';
    for (var c = 0; c < 6; c++) { var v = (t * 1.4 + c / 6) % 1; s += '<circle cx="' + f(lerp(420, 520, v)) + '" cy="' + f(lerp(236, 160, v)) + '" r="4" fill="' + CY + '"/>'; }
    return s + tag("Verdichter", 380, 60, u, 0.4, 3, 20, "#bfe0ff") + tag("frische Luft", 500, 330, u, 1.4, -3, 18);
  });
  // 19 — more air = more oxygen, so more fuel can burn
  shot(19, function (u, d) { var sh = u > 1.6 && u < 2.0 ? 5 * Math.sin(u * 80) : 0; return [320 + sh, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var g = clamp((u - 0.2) / 1.0), s = graphPaper(t) + mixBox(110, 90, 160, 160, Math.round(lerp(16, 44, g)), t, 7);
    s += boom(470, 170, lerp(40, 90, clamp((u - 1.4) / 0.8)), ((u - 1.4) * 1.2) % 1.2);
    return s + tag("O₂", 190, 60, u, 0.3, -3, 22, "#bfe0ff") + tag("mehr Benzin", 190, 300, u, 0.9, 3, 18) + tag("größerer Bumm!", 470, 320, u, 1.6, -3, 20, "#ffb08a");
  });
  // 20 — that's why the big engine often has two turbos instead of one
  shot(20, function (u, d) { return [320, 190, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + v8(320, 250, t, { s: 0.6, rpm: 2 }) + turbo(110, 120, t, { s: 0.42, spin: 10, cold: true }) + turbo(530, 120, t, { s: 0.42, spin: 10, cold: true });
    return s + tag("2 Turbos", 320, 50, u, 0.5, -3, 26);
  });
  // 21 — Audi even gets 400 PS from only five cylinders, with a lot of boost
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = workshop(t) + engineRow(250, 120, t, { n: 5, w: 46, h: 100, rpm: 1.8 }) + turbo(520, 150, t, { s: 0.42, spin: 14, cold: true });
    return s + tag("Audi: 5 Zylinder", 250, 40, u, 0.4, -3, 20) + badge(520, 280, "400 PS", 130, INK, YEL) + tag("viel Ladedruck", 250, 330, u, 2.2, 3, 18, "#bfe0ff");
  });
  // 22 — careful: PS is not the same as torque
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + badge(170, 170, "PS", 110, INK, YEL) + badge(470, 170, "Drehmoment", 200, INK, "#bfe0ff");
    s += txt(320, 186, "≠", 60 + 6 * pulse(t, 6), RED) + engineer(320, 300, t, "worry", { s: 0.35 });
    return s + tag("Achtung!", 320, 60, u, 0.3, -3, 24, "#f2a0a0");
  });
  // 23 — torque is how hard the engine turns, and PS = torque × rpm
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.05, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), a = t * 3;
    s += '<g transform="translate(150 150)"><circle r="50" fill="url(#gGear)" stroke="' + INK + '" stroke-width="2.4"/><g transform="rotate(' + f(a * 57.3) + ')"><path d="M0 0 L110 0" stroke="#5a6068" stroke-width="14" stroke-linecap="round"/><rect x="96" y="-16" width="30" height="32" rx="6" fill="#3a3f46" stroke="' + INK + '" stroke-width="2"/></g><polygon points="-14,-8 14,-8 14,8 -14,8" fill="#2b2e33"/></g>';
    s += curl(150, 150, 140, -0.6, 2.4, "#bfe0ff", 5, 1);
    var k = clamp((u - 1.4) / 0.6); s += '<g opacity="' + f(k) + '">' + '<rect x="320" y="200" width="300" height="60" rx="12" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/>' + txt(470, 239, "PS = Drehmoment × Drehzahl", 18, YEL) + '</g>';
    return s + tag("wie kräftig", 150, 320, u, 0.4, -3, 20, "#bfe0ff");
  });
  // 24 — the Golf needs about 8.5 s to 100, the sports car about 4
  shot(24, function (u, d) { return [lerp(300, 360, u / d), 200, 1.0]; }, function (u, d, t) {
    var tt = clamp(u / (d - 0.4)) * 8.5, s = street(t, 300 + tt * 120);
    var p1 = Math.min(1, Math.pow(tt / 8.5, 2)), p2 = Math.min(1, Math.pow(tt / 4, 2));
    s += sportsCar(lerp(80, 560, p2), 230, t, { s: 0.55 }) + hatch(lerp(80, 560, p1), 300, t, { s: 0.55 });
    s += txt(110, 42, "400 PS", 16, YEL) + stopwatch(110, 90, 28, Math.min(tt, 4), 10, Math.min(tt, 4).toFixed(1) + " s", YEL) + txt(260, 42, "150 PS", 16, "#bfe0ff") + stopwatch(260, 90, 28, tt, 10, tt.toFixed(1) + " s", "#bfe0ff");
    return s + tag("0–100", 470, 60, u, 0.3, 3, 22);
  });
  // 25 — in return the strong engine drinks a lot more fuel and gets much hotter
  shot(25, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = workshop(t), fl = 1 - clamp(u / (d - 0.4)) * 0.8;
    s += '<g transform="translate(170 180)"><circle r="90" fill="#1c1c1c" stroke="#8a929c" stroke-width="4"/><path d="M-70 0 A70 70 0 0 1 70 0" stroke="#3a3f46" stroke-width="14" fill="none"/><path d="M0 0 L' + f(-Math.cos(fl * Math.PI) * 64) + ' ' + f(-Math.sin(fl * Math.PI) * 64) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="' + RED + '"/>' + txt(-60, 30, "E", 18, "#fff") + txt(60, 30, "F", 18, "#fff") + '</g>';
    var th = clamp(u / 1.6); s += '<rect x="440" y="60" width="30" height="200" rx="15" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><rect x="446" y="' + f(250 - 180 * th) + '" width="18" height="' + f(180 * th + 4) + '" rx="9" fill="' + RED + '"/><circle cx="455" cy="270" r="26" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>';
    for (var h = 0; h < 4; h++) { var hu = (t * 0.8 + h / 4) % 1; s += '<path d="M' + (520 + h * 18) + ' ' + f(260 - hu * 120) + ' q8 -12 0 -24 q-8 -12 0 -24" stroke="#ff7a2a" stroke-width="3" fill="none" opacity="' + f(1 - hu) + '"/>'; }
    return s + tag("mehr Benzin", 170, 320, u, 0.4, -3, 20) + tag("heißer!", 500, 40, u, 1.4, 3, 22, "#f2a0a0");
  });
  // 26 — in the end it's the same explosion: bigger, more often, with more air
  shot(26, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = dark(t) + boom(320, 170, 80, (t * 1.4) % 1.2);
    return s + tag("größer", 130, 80, u, 0.5, -3, 22) + tag("öfter", 500, 80, u, 1.0, 3, 22, "#bfe0ff") + tag("mehr Luft", 320, 310, u, 1.6, -2, 22, "#bde8b0");
  });
  // 27 — outro
  shot(27, function (u, d) { return [lerp(300, 360, clamp(u / d)), 190, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + clouds(t, 40, 30, 6, 0.85) + city(t, 250, 100, "#7a6a5a", true, 9, false) + road(t, 280, 500) + sportsCar(420, 270, t, { s: 0.7 }) + hatch(200, 268, t, { s: 0.65 });
    return s + engineer(560, 150, t, "happy", { s: 0.4, wave: true }) + tag("Sagt uns!", 320, 80, u, 0.4, 3, 26);
  });

  window.__parts = { car: car, hatch: hatch, sportsCar: sportsCar, engineRow: engineRow, v8: v8, turbo: turbo, horse: horse, cylinder: cylinder, boom: boom, tag: tag, engineer: engineer, badge: badge, workshop: workshop, dark: dark, street: street, road: road };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
