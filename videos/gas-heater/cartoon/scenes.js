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

  function clockF2(x, y, r, t) { var a = t * 6, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i < 12; i++) s += '<path d="M' + f(Math.sin(i * Math.PI / 6) * r * 0.75) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.75) + ' L' + f(Math.sin(i * Math.PI / 6) * r * 0.86) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.86) + '" stroke="' + INK + '" stroke-width="2"/>'; return s + '<path d="M0 0 L' + f(Math.sin(a) * r * 0.7) + ' ' + f(-Math.cos(a) * r * 0.7) + '" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/></g>'; }
  // ── the tankless gas water heater: white casing with a flame window, cold in / hot out / gas pipes underneath, a flue on
  // top; inside: the water valve with its rubber diaphragm, the gas valve it pushes open, the battery spark igniter, the
  // burner rows and the finned copper heat exchanger with the coil the water runs through (../refs/SOURCES.md).
  var COLD = "#3f8fd0", HOT = "#e0522a", COPPER = "#c8743a";
  function bathroom(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#e4eef0"/>';
    for (var y = -60; y < 300; y += 34) for (var x = -400; x < 1100; x += 34) s += '<rect x="' + x + '" y="' + y + '" width="32" height="32" fill="#d3e4e8" stroke="#bcd3d8" stroke-width="1"/>';
    s += '<rect x="-400" y="300" width="1500" height="400" fill="#b9c7cc"/><path d="M-400 300 H1100" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.win) { var wx = o.win; s += '<rect x="' + (wx - 60) + '" y="40" width="120" height="90" fill="' + (o.snow ? "#d6e4f0" : "#bfe3f5") + '" stroke="' + INK + '" stroke-width="3"/><path d="M' + wx + ' 40 V130" stroke="' + INK + '" stroke-width="3"/>'; if (o.snow) for (var k = 0; k < 14; k++) { var sy = 40 + ((t * 30 + k * 23) % 90), sx = wx - 55 + hash(k) * 110; s += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="3" fill="#fff"/>'; } }
    return s;
  }
  // a moving stream of water in a pipe path d, colour col, dash speed sp
  function flow(d, col, t, sp, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + ((w || 10) + 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="#e9ecef" stroke-width="' + (w || 10) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + (sp ? '<path d="' + d + '" stroke="' + col + '" stroke-width="' + ((w || 10) - 4) + '" fill="none" stroke-dasharray="12 10" stroke-dashoffset="' + f(-t * sp) + '" stroke-linecap="round"/>' : ""); }
  // the heater, centre-bottom (x,y), scale s. o: on (flame 0..1), flowing (water speed), cut (show inside 0..1), heat (exchanger glow), label
  function heater(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">', on = o.on || 0, sp = o.flowing || 0;
    g += '<rect x="-30" y="-330" width="60" height="50" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/><rect x="-36" y="-336" width="72" height="10" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>';
    // pipes underneath: cold (left), gas (middle), hot (right)
    g += flow("M-50 0 V60 H-120", COLD, t, sp * 60, 12) + flow("M50 0 V60 H120", HOT, t, -sp * 60, 12) + '<path d="M0 0 V70" stroke="' + INK + '" stroke-width="12"/><path d="M0 0 V70" stroke="#e2b035" stroke-width="7"/>';
    var cut = o.cut || 0;
    if (cut < 1) {
      g += '<g transform="translate(' + f(-cut * 200) + ' 0) rotate(' + f(-cut * 20) + ' -90 0)" opacity="' + f(1 - cut) + '">' + R(-90, -290, 180, 290, "#f6f6f2", 3, 14);
      g += R(-36, -200, 72, 54, "#2b2e33", 2.4, 6); if (on > 0) g += '<g opacity="' + f(on) + '">' + flame(0, -150, 9, t) + '</g>';
      g += '<circle cx="-40" cy="-60" r="16" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.4"/><circle cx="40" cy="-60" r="16" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 -72 V-60 M40 -72 V-60" stroke="' + INK + '" stroke-width="3"/>';
      g += '<rect x="-40" y="-262" width="80" height="34" rx="6" fill="' + (o.hl ? "#f2c230" : "#e9ebee") + '" stroke="' + INK + '" stroke-width="2"/><text x="0" y="-238" text-anchor="middle" style="font:900 24px Noto Sans Arabic;fill:' + INK + ';direction:ltr">10L</text></g>';
    }
    if (cut > 0) g += '<g opacity="' + f(cut) + '">' + inside(t, o) + '</g>';
    return g + '</g>';
  }
  // the inside of the heater in its own coordinates (same as heater(): -90..90 wide, -290..0 tall)
  function inside(t, o) {
    var on = o.on || 0, sp = o.flowing || 0, dia = o.dia == null ? (sp > 0 ? 1 : 0) : o.dia, g = R(-90, -290, 180, 290, "#3a3f46", 3, 14);
    // heat exchanger box with fins, coil on top
    g += R(-70, -250, 140, 80, COPPER, 2.4, 4); for (var fn = 0; fn < 16; fn++) g += '<path d="M' + (-64 + fn * 8.4) + ' -248 V-172" stroke="#8a4a1a" stroke-width="2"/>';
    if (o.heat) g += '<rect x="-70" y="-250" width="140" height="80" fill="#ff7a3a" opacity="' + f(0.35 * o.heat * (0.8 + 0.2 * Math.sin(t * 6))) + '"/>';
    var coil = "M-50 -110 V-160 H-78 V-262 H78 V-160 H50 V-110";
    g += flow(coil, sp ? (o.mix ? HOT : COLD) : COLD, t, sp * 60, 9);
    // burner rows with flames
    g += R(-66, -150, 132, 16, "#9aa2ac", 2); if (on > 0) for (var b = 0; b < 7; b++) g += '<g opacity="' + f(on) + '">' + flame(-54 + b * 18, -152, 5, t + b) + '</g>';
    // water valve with diaphragm (left), gas valve (centre), battery box (right)
    g += R(-82, -104, 64, 50, "#c9ced4", 2.2, 6); var bulge = lerp(0, 12, dia); g += '<path d="M-50 -100 Q' + f(-50 + bulge) + ' -79 -50 -58" stroke="#2b2e33" stroke-width="4" fill="none"/>';
    g += '<path d="M' + f(-48 + bulge) + ' -79 H' + f(-14 + bulge * 0.8) + '" stroke="#5a6068" stroke-width="5"/>' + R(-14, -96, 36, 36, "#e2b035", 2.2, 4) + '<path d="M2 -60 V0" stroke="#e2b035" stroke-width="6"/>';
    if (o.gas) for (var q = 0; q < 4; q++) { var gp = (t * 1.2 + q / 4) % 1; g += '<circle cx="' + f(4 + Math.sin(q) * 3) + '" cy="' + f(lerp(-96, -140, gp)) + '" r="4" fill="#9ac7a0" opacity="' + f(o.gas * Math.sin(gp * Math.PI)) + '"/>'; }
    g += R(30, -104, 52, 50, "#2b2e33", 2) + R(38, -98, 16, 38, "#c23a26", 1.4, 3) + R(58, -98, 16, 38, "#c23a26", 1.4, 3);
    if (o.spark) g += star(-60, -146, 9 + 3 * Math.sin(t * 40), t, "#bfe0ff") + '<path d="M56 -104 Q20 -140 -56 -146" stroke="#bfe0ff" stroke-width="2" fill="none" stroke-dasharray="4 4"/>';
    return g;
  }
  function tap(x, y, open, t, col) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + '<path d="M0 0 H40 Q60 0 60 20 V30" stroke="' + INK + '" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M0 0 H40 Q60 0 60 20 V30" stroke="#c9ced4" stroke-width="10" fill="none" stroke-linecap="round"/>';
    g += '<g transform="rotate(' + f(open * 90) + ' 16 -14)"><rect x="4" y="-22" width="24" height="10" rx="4" fill="' + HOT + '" stroke="' + INK + '" stroke-width="2"/></g>';
    if (open > 0) { var w = 4 + open * 8; g += '<path d="M60 32 V170" stroke="' + (col || "#9fd0f0") + '" stroke-width="' + f(w) + '" stroke-linecap="round" opacity=".85"/>'; for (var k = 0; k < 4; k++) { var p = (t * 2 + k / 4) % 1; g += '<circle cx="' + f(60 + Math.sin(k * 3) * 3) + '" cy="' + f(40 + p * 130) + '" r="' + f(w * 0.35) + '" fill="#fff" opacity=".7"/>'; } }
    return g + '</g>';
  }
  function jug(x, y, k, t, label) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-60 -160 L-50 0 H50 L60 -160 Z" fill="#fff" fill-opacity=".5" stroke="' + INK + '" stroke-width="3"/>';
    var lv = clamp(k), top = -150 * lv; g += '<path d="M' + f(-50 - 10 * lv) + ' ' + f(top + Math.sin(t * 5) * 2) + ' L-50 0 H50 L' + f(50 + 10 * lv) + ' ' + f(top - Math.sin(t * 5) * 2) + ' Z" fill="#7fb7e0" opacity=".85"/>';
    for (var m = 1; m <= 10; m++) g += '<path d="M40 ' + (-m * 15) + ' h' + (m % 5 ? 10 : 18) + '" stroke="' + INK + '" stroke-width="2"/>';
    return g + '<path d="M60 -150 q30 10 20 70 q-6 30 -24 30" stroke="' + INK + '" stroke-width="5" fill="none"/>' + (label ? T(label, 0, 30, 20, INK, 800) : "") + '</g>';
  }
  function thermo(x, y, v, t, col) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + R(-14, -170, 28, 170, "#fbfbf7", 2.4, 14) + '<rect x="-6" y="' + f(-160 * clamp(v) - 6) + '" width="12" height="' + f(160 * clamp(v)) + '" fill="' + (col || HOT) + '"/><circle cy="14" r="22" fill="' + (col || HOT) + '" stroke="' + INK + '" stroke-width="2.4"/>'; for (var k = 1; k < 8; k++) g += '<path d="M14 ' + (-k * 20) + ' h8" stroke="' + INK + '" stroke-width="2"/>'; return g + '</g>'; }
  function flue(t, x, y0, x1, k) { var s = '<path d="M' + x + ' ' + y0 + ' V60 H' + x1 + '" stroke="' + INK + '" stroke-width="46" fill="none"/><path d="M' + x + ' ' + y0 + ' V60 H' + x1 + '" stroke="#c9ced4" stroke-width="38" fill="none"/>'; for (var a = 0; a < 5; a++) { var p = (t * 0.7 + a / 5) % 1; s += gasCloud(lerp(x1, x1 + 160, p), 60 - p * 40, 14 + p * 20, t + a, 0.5 * (1 - p) * k); } return s; }

  // 0 — the heater says 10 litres: so where are they?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(260, 360, k), lerp(200, 160, k), lerp(1.0, 1.3, k)]; }, function (u, d, t) {
    return bathroom(t) + heater(330, 300, 0.9, t, { hl: u > 1.0 }) + person(130, 170, 0.5, t, "curious", { look: 1 }) + qmark(470, 90, t, 52) + tag("10 لتر؟", 470, 230, u, 1.2, 3, 26);
  });
  // 1 — open it: no tank, not even a cup of water
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(170, 190, k), lerp(1.3, 1.05, k)]; }, function (u, d, t) {
    var c = clamp((u - 0.4) / 1.2); return bathroom(t) + heater(330, 300, 0.9, t, { cut: c }) + cross(470, 120, 1.2, (u - 1.8) / 1.0) + tag("مفيش خزان!", 470, 200, u, 1.9, 3, 24, "#f2a0a0");
  });
  // 2 — brand
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(270, 380, k), lerp(200, 170, k), lerp(0.95, 1.15, k)]; }, function (u, d, t) {
    return bathroom(t) + heater(320, 300, 0.9, t, { on: 0.6 + 0.4 * Math.sin(t * 3) }) + qmark(180, 110, t, 56) + qmark(470, 90, t + 1, 50) + tag("إيه الحكاية؟", 320, 50, u, 0.1, -3, 30);
  });
  // 3 — the 10 litres is not a volume, it's a speed: ten litres of hot water a minute
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, k), lerp(200, 180, k), lerp(1.12, 0.96, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / (d - 0.6)); return bathroom(t) + tap(120, 60, 1, t, "#ffb8a0") + jug(180, 300, k, t, Math.round(k * 10) + " لتر") + clockF2(450, 150, 70, t * 3) + tag("في الدقيقة", 450, 280, u, 1.6, 3, 26) + tag("مش حجم!", 180, 40, u, 0.4, -3, 22, "#f2a0a0");
  });
  // 4 — it doesn't store water, it heats it as it passes
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(280, 380, k), lerp(190, 160, k), lerp(1.05, 1.2, k)]; }, function (u, d, t) {
    return bathroom(t) + heater(330, 300, 0.9, t, { cut: 1, on: 1, flowing: 1, heat: 1 }) + arrow(120, 360, 200, 360, COLD, 6, clamp(u * 2)) + arrow(460, 360, 560, 360, HOT, 6, clamp((u - 0.6) * 2)) + tag("ساقعة", 110, 300, u, 0.3, -3, 20, "#bfe0ff") + tag("سخنة", 560, 300, u, 0.9, 3, 20, "#f2a0a0") + tag("وهي معدية", 330, 30, u, 1.6, -3, 24);
  });
  // 5 — the moment you open the tap, water runs through the heater
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(440, 300, k), lerp(170, 200, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var op = clamp((u - 0.3) / 0.6); return bathroom(t) + heater(240, 300, 0.9, t, { flowing: op }) + tap(450, 120, op, t) + flow("M348 354 H450 V140", COLD, t, op * 60, 10) + tag("افتح الحنفية", 470, 60, u, 0.2, 3, 22);
  });
  // 6 — inside is a small rubber diaphragm that the water pressure pushes
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(270, 255, k), lerp(240, 230, k), lerp(1.6, 2.6, k)]; }, function (u, d, t) {
    var dia = clamp((u - 0.6) / 0.8); return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(330, 320, 0.9, t, { cut: 1, flowing: dia, dia: dia }) + tag("جلدة", 200, 170, u, 0.4, -3, 18) + tag("ضغط المية", 220, 300, u, 1.4, 3, 16, "#bfe0ff");
  });
  // 7 — and the diaphragm opens the gas valve: someone wants hot water
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(270, 330, k), lerp(240, 200, k), lerp(2.2, 1.6, k)]; }, function (u, d, t) {
    var g = clamp((u - 0.6) / 0.8); return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(330, 320, 0.9, t, { cut: 1, flowing: 1, dia: 1, gas: g }) + tag("بلف الغاز", 400, 210, u, 0.5, 3, 18) + tag("فيه حد عايز مية سخنة!", 330, 80, u, 1.8, -3, 18, "#bfe8c0");
  });
  // 8 — at that moment a small spark lights the gas, usually from the batteries inside
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(300, 350, k), lerp(200, 230, k), lerp(1.5, 1.9, k)]; }, function (u, d, t) {
    var on = clamp((u - 1.0) / 0.6); return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(330, 320, 0.9, t, { cut: 1, flowing: 1, dia: 1, gas: 1, spark: u > 0.4 && u < 1.6, on: on }) + tag("شرارة", 230, 150, u, 0.5, -3, 18, "#bfe0ff") + tag("البطاريات", 430, 260, u, 1.8, 3, 16);
  });
  // 9 — above the flame is a coiled copper pipe covered in fins
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(140, 120, k), lerp(1.6, 2.0, k)]; }, function (u, d, t) {
    return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(330, 320, 0.9, t, { cut: 1, flowing: 1, dia: 1, gas: 1, on: 1 }) + tag("ماسورة نحاس", 230, 60, u, 0.4, -3, 18) + tag("زعانف", 440, 140, u, 1.6, 3, 18, "#e8c48e");
  });
  // 10 — the water winds through the pipe, and the fire heats it from outside
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(160, 180, k), lerp(1.7, 1.4, k)]; }, function (u, d, t) {
    return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(330, 320, 0.9, t, { cut: 1, flowing: 1.4, dia: 1, gas: 1, on: 1, heat: clamp(u / 1.5), mix: 1 }) + tag("المية جوه", 210, 70, u, 0.4, -3, 18, "#bfe0ff") + tag("النار برة", 450, 240, u, 1.6, 3, 18, "#f2a0a0");
  });
  // 11 — copper moves heat very fast, so the water comes out hot within seconds
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(250, 380, k), lerp(190, 170, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    return bathroom(t) + heater(200, 300, 0.85, t, { on: 1, flowing: 1 }) + thermo(450, 260, lerp(0.2, 0.75, clamp((u - 0.3) / 1.4)), t) + clockF2(560, 110, 40, t * 4) + tag("في ثواني!", 470, 40, u, 1.4, 3, 26);
  });
  // 12 — close the tap: the diaphragm springs back, the gas shuts, the fire goes out at once
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(330, 290, k), lerp(220, 200, k), lerp(1.4, 1.1, k)]; }, function (u, d, t) {
    var c = clamp((u - 0.5) / 0.6); return '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + heater(300, 320, 0.9, t, { cut: 1, flowing: 1 - c, dia: 1 - c, gas: 1 - c, on: 1 - c }) + tap(470, 120, 1 - c, t) + tag("النار تطفي", 300, 50, u, 1.4, -3, 24, "#f2a0a0");
  });
  // 13 — so how hot are those 10 litres?
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 180, lerp(1.1, 1.3, k)]; }, function (u, d, t) {
    return bathroom(t) + jug(220, 300, 1, t, "10 لتر") + thermo(430, 260, 0.4 + 0.2 * Math.sin(t * 3), t) + qmark(430, 60, t, 50);
  });
  // 14 — the number assumes the heater lifts the water by 25 degrees
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(200, 170, k), lerp(1.05, 1.2, k)]; }, function (u, d, t) {
    var g = ease(clamp((u - 0.5) / 1.6)); return bathroom(t) + heater(320, 300, 0.85, t, { on: 1, flowing: 1 }) + thermo(120, 270, 0.3, t, COLD) + thermo(520, 270, lerp(0.3, 0.55, g), t) + arrow(160, 120, 480, 120, "#f2c230", 6, g) + tag("+25 درجة", 320, 60, u, 1.0, -3, 28);
  });
  // 15 — so if the water comes in at 20 degrees, it leaves at about 45
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(320, 330, k), lerp(200, 170, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var g = ease(clamp((u - 0.5) / 1.4)); return bathroom(t) + thermo(180, 280, 0.25, t, COLD) + thermo(460, 280, lerp(0.25, 0.56, g), t) + arrow(220, 160, 420, 160, "#f2c230", 6, g) + tag("20°", 180, 50, u, 0.3, -3, 30, "#bfe0ff") + tag("45°", 460, 50, u, 1.6, 3, 30, "#f2a0a0");
  });
  // 16 — want it hotter? the water has to go slower
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(380, 280, k), lerp(170, 200, k), lerp(1.2, 1.05, k)]; }, function (u, d, t) {
    var sl = clamp((u - 0.5) / 1.0); return bathroom(t) + heater(200, 300, 0.85, t, { on: 1, flowing: lerp(1, 0.35, sl) }) + tap(400, 100, lerp(1, 0.35, sl), t, "#ffb8a0") + thermo(560, 260, lerp(0.5, 0.85, sl), t) + tag("أبطأ = أسخن", 420, 40, u, 1.0, 3, 24);
  });
  // 17 — to lift it 50 degrees you get only about 5 litres a minute
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(190, 170, k), lerp(1.12, 0.98, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / (d - 0.6)); return bathroom(t) + jug(180, 300, k * 0.5, t, Math.round(k * 5) + " لتر") + clockF2(440, 150, 70, t * 3) + thermo(580, 260, 0.85, t) + tag("+50 درجة", 440, 270, u, 0.4, 3, 22, "#f2a0a0") + tag("5 لتر بس", 180, 40, u, 1.8, -3, 24);
  });
  // 18 — in winter the water comes in cold, so the heater works harder for the same heat
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(170, 200, k), lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    return bathroom(t, { win: 520, snow: true }) + heater(260, 300, 0.85, t, { on: 1, flowing: 1 }) + thermo(90, 280, 0.08, t, COLD) + star(130, 330, 10, t, "#e8f4ff") + tag("الشتا", 520, 170, u, 0.3, 3, 24, "#bfe0ff") + tag("مية ساقعة", 110, 60, u, 1.2, -3, 20, "#bfe0ff");
  });
  // 19 — that's why the heater feels weaker in winter, though it's the same heater
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(190, 170, k), lerp(1.05, 1.2, k)]; }, function (u, d, t) {
    var s = bathroom(t, { win: 120, snow: true }) + heater(200, 300, 0.75, t, { on: 1, flowing: 1 }) + tap(380, 40, 1, t) + '<g transform="translate(' + f(Math.sin(t * 30) * 3) + ' 0)">' + person(450, 160, 0.5, t, "dizzy", { arms: "up", col: "#2f6f9f" }) + '</g>';
    return s + tag("نفس السخان!", 450, 40, u, 1.4, 3, 24);
  });
  // 20 — with more than one tap open at once, the 10 litres are shared between them
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(200, 170, k), lerp(1.12, 0.92, k)]; }, function (u, d, t) {
    var s = bathroom(t) + heater(140, 300, 0.75, t, { on: 1, flowing: 1 }) + flow("M230 345 H330 V140 H420", HOT, t, 40, 10) + flow("M330 240 H560 V140", HOT, t, 40, 10) + tap(420, 120, 0.6, t, "#ffb8a0") + tap(560, 120, 0.6, t, "#ffb8a0");
    return s + tag("10", 230, 60, u, 0.3, -3, 26) + tag("5", 470, 60, u, 1.2, 3, 24, "#bfe8c0") + tag("5", 610, 60, u, 1.5, 3, 24, "#bfe8c0") + tag("بتتقسم", 330, 330, u, 2.0, -3, 22);
  });
  // 21 — a big family or two bathrooms may need a bigger heater
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(200, 170, k), lerp(1.12, 0.95, k)]; }, function (u, d, t) {
    var g = ease(clamp((u - 0.8) / 1.0)); var s = bathroom(t) + heater(160, 300, 0.7, t, { on: 1 }) + heater(440, 300, lerp(0.7, 0.95, g), t, { on: 1 });
    [0, 1, 2, 3].forEach(function (i) { s += person(20 + i * 50, 250, 0.22, t + i, "happy", { col: ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a"][i] }); });
    return s + tag("سخان أكبر", 440, 40, u, 1.2, 3, 24, "#bfe8c0") + arrow(260, 200, 340, 200, "#f2c230", 6, g);
  });
  // 22 — don't forget: it burns gas, so it needs a flue to take the exhaust outside
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(300, 380, k), lerp(200, 130, k), lerp(1.05, 1.0, k)]; }, function (u, d, t) {
    return bathroom(t, { win: 560 }) + flue(t, 300, 24, 560, clamp((u - 0.5) / 0.8)) + heater(300, 330, 0.85, t, { on: 1, flowing: 1 }) + tag("مدخنة", 200, 40, u, 0.4, -3, 24) + tag("العادم برة", 600, 170, u, 1.6, 3, 20, "#bfe8c0");
  });
  // 23 — and never fit it in a closed bathroom with no ventilation
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(260, 360, k), lerp(200, 170, k), lerp(1.15, 1.0, k)]; }, function (u, d, t) {
    var s = bathroom(t) + heater(260, 300, 0.85, t, { on: 1 }); for (var k2 = 0; k2 < 5; k2++) s += gasCloud(200 + k2 * 70, 120 + Math.sin(t + k2) * 20, 40, t + k2, 0.5 * clamp(u / 1.2));
    return s + noSign(500, 160, 60, (u - 0.8) / 1.0) + tag("تهوية!", 500, 280, u, 1.4, 3, 26, "#f2a0a0");
  });
  // 24 — bottom line: the 10 litres aren't a tank, they're 10 litres a minute
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(200, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var k = (u * 0.5) % 1; return bathroom(t) + heater(150, 300, 0.8, t, { on: 1, flowing: 1, hl: true }) + jug(360, 300, k, t, "") + clockF2(540, 150, 60, t * 3) + tag("مش خزان", 150, 40, u, 0.3, -3, 22, "#f2a0a0") + tag("10 لتر في الدقيقة", 450, 280, u, 1.4, 3, 22);
  });
  // 25 — outro
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(190, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    return bathroom(t) + heater(200, 300, 0.85, t, { on: 1, flowing: 1 }) + tap(380, 40, 1, t, "#ffb8a0") + person(500, 170, 0.5, t, "happy", { look: -1 }) + tag("قولولنا!", 330, 60, u, 0.4, 3, 30);
  });

  window.__parts = { heater: heater, inside: inside, bathroom: bathroom, tap: tap, jug: jug, thermo: thermo, flame: flame, person: person, tag: tag, hardHat: hardHat, clockF2: clockF2, flue: flue, T: T };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
