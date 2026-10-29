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

  // ── new pieces for this episode ─────────────────────────
  var INK = "#1c1c1c", TG = "#2fae5a", TO = "#f29a2e", TR = "#d8352a", TD = "#8a1a14", NAV = "#2f7fe0", CLIPN = 0;
  function carSide(x, y, t, s, col) {   // a family car, side view, wheels turning
    var a = t * 400, c = '<g transform="translate(' + f(x) + ' ' + f(y + Math.abs(Math.sin(t * 9)) * 1.2) + ') scale(' + (s || 1) + ')">';
    c += '<path d="M-90 -8 C-90 -24 -80 -30 -60 -32 L-40 -56 C-34 -62 -26 -64 -14 -64 H34 C46 -64 52 -60 58 -52 L74 -32 C90 -30 96 -22 96 -8 V6 H-90 Z" fill="' + (col || "#c23a26") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    c += '<path d="M-34 -36 L-20 -56 H8 V-36 Z M16 -36 V-56 H36 C42 -56 46 -54 50 -48 L60 -36 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="2"/><rect x="86" y="-22" width="10" height="8" fill="#ffe9a0" stroke="' + INK + '"/>';
    [-54, 60].forEach(function (wx) { c += '<g transform="translate(' + wx + ' 6) rotate(' + f(a) + ')"><circle r="17" fill="#2a2a2a" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4"/><path d="M-8 0 H8 M0 -8 V8" stroke="#5a6068" stroke-width="2.4"/></g>'; });
    return c + '</g>';
  }
  // a map navigation app, drawn in screen coordinates 0..w × 0..h. o: { jam 0..1 (how much of the route is red), alt 0..1 (faster route), eta text, mins, pin, dots }
  function navApp(w, h, t, o) {
    o = o || {}; var s = '<rect width="' + w + '" height="' + h + '" fill="#f2efe9"/>';
    // blocks, a park, the river
    for (var b = 0; b < 14; b++) { var bx = (hash(b) * w * 1.1) - 10, by = hash(b + 3) * h; s += '<rect x="' + f(bx) + '" y="' + f(by) + '" width="' + f(w * 0.18) + '" height="' + f(h * 0.08) + '" rx="2" fill="#e4dfd4"/>'; }
    s += '<path d="M' + f(w * 0.62) + ' ' + f(h * 0.2) + ' h' + f(w * 0.3) + ' v' + f(h * 0.14) + ' h' + f(-w * 0.3) + ' Z" fill="#cfe6c4"/><path d="M0 ' + f(h * 0.78) + ' C' + f(w * 0.3) + ' ' + f(h * 0.72) + ' ' + f(w * 0.6) + ' ' + f(h * 0.86) + ' ' + w + ' ' + f(h * 0.8) + ' V' + f(h * 0.88) + ' C' + f(w * 0.6) + ' ' + f(h * 0.94) + ' ' + f(w * 0.3) + ' ' + f(h * 0.8) + ' 0 ' + f(h * 0.86) + ' Z" fill="#aad3f0"/>';
    // streets
    [0.18, 0.42, 0.66].forEach(function (yy) { s += '<path d="M0 ' + f(h * yy) + ' H' + w + '" stroke="#fff" stroke-width="' + f(w * 0.05) + '"/><path d="M0 ' + f(h * yy) + ' H' + w + '" stroke="#d9d4c8" stroke-width="' + f(w * 0.05 + 2) + '" opacity=".4"/>'; });
    [0.25, 0.55, 0.82].forEach(function (xx) { s += '<path d="M' + f(w * xx) + ' 0 V' + h + '" stroke="#fff" stroke-width="' + f(w * 0.045) + '"/>'; });
    // the route: from the car (bottom) up and right to the destination, coloured by traffic
    var R = [[0.25, 0.95], [0.25, 0.66], [0.25, 0.42], [0.55, 0.42], [0.55, 0.18], [0.82, 0.18], [0.82, 0.06]], jam = clamp(o.jam || 0), lw = w * 0.045;
    var cols = [TG, jam > 0.3 ? TO : TG, jam > 0.6 ? TR : jam > 0.3 ? TO : TG, jam > 0.6 ? TD : TO, TG, TG];
    s += '<path d="M' + R.map(function (p) { return f(p[0] * w) + ' ' + f(p[1] * h); }).join(' L') + '" stroke="#1a5ab0" stroke-width="' + f(lw + 3) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    for (var i = 0; i < R.length - 1; i++) s += '<path d="M' + f(R[i][0] * w) + ' ' + f(R[i][1] * h) + ' L' + f(R[i + 1][0] * w) + ' ' + f(R[i + 1][1] * h) + '" stroke="' + cols[i] + '" stroke-width="' + f(lw) + '" stroke-linecap="round"' + (cols[i] === TR || cols[i] === TD ? ' opacity="' + f(0.8 + 0.2 * Math.sin(t * 6)) + '"' : '') + '/>';
    if (o.alt) { var A = [[0.25, 0.66], [0.82, 0.66], [0.82, 0.06]]; s += '<path d="M' + A.map(function (p) { return f(p[0] * w) + ' ' + f(p[1] * h); }).join(' L') + '" stroke="' + NAV + '" stroke-width="' + f(lw * 0.8) + '" fill="none" stroke-dasharray="' + f(lw) + ' ' + f(lw * 0.6) + '" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(o.alt) + '" stroke-linecap="round"/>';
      s += '<g transform="translate(' + f(w * 0.82) + ' ' + f(h * 0.5) + ') scale(' + f(o.alt) + ')"><rect x="' + f(-w * 0.2) + '" y="' + f(-h * 0.035) + '" width="' + f(w * 0.4) + '" height="' + f(h * 0.07) + '" rx="' + f(h * 0.02) + '" fill="' + NAV + '"/><text y="' + f(h * 0.015) + '" text-anchor="middle" style="font:800 ' + f(w * 0.06) + 'px Noto Sans Arabic;fill:#fff">أسرع بـ 7 د</text></g>'; }
    // destination pin + the blue arrow (you), creeping along the first leg
    s += '<g transform="translate(' + f(0.82 * w) + ' ' + f(0.06 * h) + ')"><path d="M0 0 C' + f(-w * 0.05) + ' ' + f(-h * 0.03) + ' ' + f(-w * 0.04) + ' ' + f(-h * 0.07) + ' 0 ' + f(-h * 0.07) + ' C' + f(w * 0.04) + ' ' + f(-h * 0.07) + ' ' + f(w * 0.05) + ' ' + f(-h * 0.03) + ' 0 0 Z" fill="' + TR + '" stroke="#8a1a14" stroke-width="1"/><circle cy="' + f(-h * 0.045) + '" r="' + f(w * 0.015) + '" fill="#fff"/></g>';
    var ay = lerp(0.9, 0.7, (t * 0.04) % 1) * h, ax = 0.25 * w; s += '<circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="' + f(w * 0.06) + '" fill="' + NAV + '" opacity=".2"/><path d="M' + f(ax) + ' ' + f(ay - w * 0.04) + ' L' + f(ax + w * 0.03) + ' ' + f(ay + w * 0.03) + ' L' + f(ax) + ' ' + f(ay + w * 0.015) + ' L' + f(ax - w * 0.03) + ' ' + f(ay + w * 0.03) + ' Z" fill="' + NAV + '" stroke="#fff" stroke-width="1.6"/>';
    if (o.dots) for (var d = 0; d < 18; d++) { var u = (t * (0.05 + hash(d) * 0.05) + hash(d + 2)) % 1, dd = d % 3, px = dd === 0 ? u * w : dd === 1 ? w * [0.25, 0.55, 0.82][d % 3] : u * w, py = dd === 0 ? h * 0.42 : dd === 1 ? u * h : h * 0.66; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(w * 0.012) + '" fill="#5a6068" opacity=".7"/>'; }
    // top banner (next turn) and bottom card (time, distance)
    s += '<rect width="' + w + '" height="' + f(h * 0.11) + '" fill="#0f6a4a"/><path d="M' + f(w * 0.1) + ' ' + f(h * 0.08) + ' V' + f(h * 0.04) + ' H' + f(w * 0.17) + '" stroke="#fff" stroke-width="' + f(w * 0.02) + '" fill="none"/><path d="M' + f(w * 0.17) + ' ' + f(h * 0.025) + ' l' + f(w * 0.03) + ' ' + f(h * 0.015) + ' l' + f(-w * 0.03) + ' ' + f(h * 0.015) + ' Z" fill="#fff"/><text x="' + f(w * 0.6) + '" y="' + f(h * 0.07) + '" text-anchor="middle" style="font:800 ' + f(w * 0.065) + 'px Noto Sans Arabic;fill:#fff">يمين بعد ٢٠٠ م</text>';
    var mins = o.mins || 18, late = jam > 0.5;
    s += '<rect y="' + f(h * 0.86) + '" width="' + w + '" height="' + f(h * 0.14) + '" fill="#fff"/><rect x="' + f(w * 0.42) + '" y="' + f(h * 0.875) + '" width="' + f(w * 0.16) + '" height="' + f(h * 0.008) + '" rx="2" fill="#d9d4c8"/>';
    s += '<text x="' + f(w * 0.72) + '" y="' + f(h * 0.94) + '" text-anchor="middle" style="font:800 ' + f(w * 0.085) + 'px Noto Sans Arabic;fill:' + (late ? TR : TG) + '">' + mins + ' دقيقة</text><text x="' + f(w * 0.25) + '" y="' + f(h * 0.94) + '" text-anchor="middle" style="font:700 ' + f(w * 0.055) + 'px Noto Sans Arabic;fill:#5a6068">' + (o.eta || "7 كم") + '</text>';
    return s;
  }
  function phoneIn(x, y, s, t, inner, o) {   // a phone in a hand; inner(w, h) draws its screen
    o = o || {}; var w = 150, h = 300, id = "ph" + (++CLIPN), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ') rotate(' + f((o.rot || -6) + Math.sin(t * 1.3) * 1.2) + ')">';
    if (o.hand !== false) g += '<path d="M-110 210 C-100 140 -96 100 -80 60 L-60 70 C-70 110 -74 150 -60 200 Z" fill="#e0b48a" stroke="' + INK + '" stroke-width="3"/>';
    g += '<rect x="' + (-w / 2 - 10) + '" y="' + (-h / 2 - 14) + '" width="' + (w + 20) + '" height="' + (h + 28) + '" rx="24" fill="#1c1e22" stroke="' + INK + '" stroke-width="3"/><clipPath id="' + id + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14"/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + (-w / 2) + ' ' + (-h / 2) + ')">' + inner(w, h) + '</g></g>';
    g += '<rect x="-16" y="' + (-h / 2 - 8) + '" width="32" height="8" rx="4" fill="#000"/><path d="M' + (-w / 2 + 8) + ' ' + (-h / 2 + 10) + ' L' + (-w / 2 + 40) + ' ' + (-h / 2 + 10) + ' L' + (-w / 2 + 8) + ' ' + (-h / 2 + 90) + ' Z" fill="#fff" opacity=".08"/>';
    if (o.hand !== false) g += '<path d="M' + (w / 2 + 4) + ' 30 C' + (w / 2 + 30) + ' 40 ' + (w / 2 + 34) + ' 80 ' + (w / 2 + 6) + ' 96 M' + (w / 2 + 4) + ' 100 C' + (w / 2 + 30) + ' 110 ' + (w / 2 + 30) + ' 150 ' + (w / 2 + 4) + ' 160" stroke="' + INK + '" stroke-width="3" fill="#e0b48a"/><path d="M' + (-w / 2 - 6) + ' 40 C' + (-w / 2 - 30) + ' 50 ' + (-w / 2 - 30) + ' 90 ' + (-w / 2 - 4) + ' 100" stroke="' + INK + '" stroke-width="3" fill="#e0b48a"/>';
    return g + '</g>';
  }
  // the street seen from the side: buildings behind, pavement, the road; cars at speed v (px/s), bunched when jam
  function street(t, o) {
    o = o || {}; var s = sky(o.sky || "day") + clouds(t, 10, 30, 4, 0.8) + city(t, 210, 120, "#c79a7b", true, 4, false) + '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="#c9c4b8"/>';
    s += '<path d="M-400 286 H1040" stroke="#f4f1e8" stroke-width="4" stroke-dasharray="30 24" stroke-dashoffset="' + f(o.jam > 0.5 ? -t * 10 : -t * 120) + '"/>';
    for (var l = 0; l < 8; l++) { var lx = -300 + l * 180; s += '<path d="M' + lx + ' 210 V120 h20" stroke="#3a3d42" stroke-width="4" fill="none"/><circle cx="' + (lx + 22) + '" cy="124" r="5" fill="#ffe9a0"/>'; }
    var jam = clamp(o.jam || 0), cols = ["#c23a26", "#2f6f9f", "#f4f1e8", "#e2b035", "#4f8f5a", "#9aa2ac", "#3a3d42", "#7a5ab0"];
    for (var k = 0; k < 8; k++) { var free = ((t * (o.v || 160) + k * 220) % 1760) - 400, packed = 560 - k * 112 + Math.sin(t * 0.8 + k) * 3, x = lerp(free, packed, jam); s += carSide(x, 262, t * (1 - jam * 0.9), 0.62, cols[k]); if (jam > 0.5) s += '<circle cx="' + f(x - 56) + '" cy="' + f(256) + '" r="5" fill="#ff3b2f" filter="url(#glow)"/>'; }
    for (var j = 0; j < 4; j++) { var x2 = 1040 - (((t * 150 + j * 380) % 1600)); s += '<g transform="translate(' + f(x2) + ' 318) scale(-1 1)">' + carSide(0, 0, t, 0.62, cols[(j + 3) % 8]) + '</g>'; }
    return s;
  }
  // a GPS satellite (Block IIF / III look): gold-foil box, antenna array facing Earth, two long solar wings
  function gpsSat(x, y, s, t, k) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 0.8 + k) * 4) + ') rotate(' + f(Math.sin(t * 0.4 + k) * 5) + ') scale(' + s + ')"><path d="M-110 0 H110" stroke="#9aa2ac" stroke-width="4"/>';
    [-1, 1].forEach(function (e) { for (var p = 0; p < 2; p++) { var px = e * (42 + p * 36); g += '<rect x="' + (px - 16) + '" y="-20" width="32" height="40" fill="url(#gSatPanel)" stroke="' + INK + '" stroke-width="2"/><path d="M' + (px - 16) + ' -7 H' + (px + 16) + ' M' + (px - 16) + ' 7 H' + (px + 16) + ' M' + px + ' -20 V20" stroke="#8fb6e8" stroke-width="1"/>'; } });
    g += '<rect x="-24" y="-26" width="48" height="46" rx="3" fill="url(#gFoil)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-24 -8 H24 M-8 -26 V20 M10 -26 V20" stroke="#8a6a30" stroke-width="1"/>';
    g += '<rect x="-18" y="20" width="36" height="8" fill="#e9e4d8" stroke="' + INK + '" stroke-width="1.6"/>'; for (var a = 0; a < 5; a++) g += '<rect x="' + (-15 + a * 6.5) + '" y="28" width="4" height="9" rx="1.5" fill="#d9d4c8" stroke="' + INK + '" stroke-width="1"/>';
    return g + '</g>';
  }
  function space(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gSpace)"/>'; for (var o = 0; o < 3; o++) s += '<ellipse cx="320" cy="' + (440 + o * 20) + '" rx="' + (420 + o * 90) + '" ry="' + (330 + o * 40) + '" fill="none" stroke="#8fb6e8" stroke-width="2.5" stroke-dasharray="14 12" stroke-dashoffset="' + f(-t * (40 + o * 15)) + '" opacity=".35"/>'; for (var i = 0; i < 70; i++) { var x = -300 + hash(i) * 1240, y = -200 + hash(i + 5) * 560; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(0.6 + hash(i + 9) * 1.6) + '" fill="#fff" opacity="' + f(0.4 + 0.4 * Math.sin(t * 2 + i)) + '"/>'; } return s; }
  function earth(t, y) { var sh = (t * 30) % 300; return '<ellipse cx="320" cy="' + y + '" rx="620" ry="260" fill="url(#gEarth)" stroke="#8fd0ee" stroke-width="4"/><path transform="translate(' + f(sh - 150) + ' 0)" d="M-120 ' + (y - 190) + ' C40 ' + (y - 230) + ' 120 ' + (y - 170) + ' 240 ' + (y - 210) + ' C340 ' + (y - 240) + ' 420 ' + (y - 200) + ' 520 ' + (y - 230) + '" stroke="#6f9548" stroke-width="40" fill="none" opacity=".7" stroke-linecap="round"/>'; }
  function pin(x, y, s, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 0 C-22 -22 -18 -50 0 -50 C18 -50 22 -22 0 0 Z" fill="' + (col || TR) + '" stroke="' + INK + '" stroke-width="3"/><circle cy="-32" r="8" fill="#fff"/></g>'; }
  function cloudBox(x, y, s, t) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.2) * 3) + ') scale(' + s + ')"><path d="M-70 20 C-96 20 -96 -16 -66 -16 C-62 -50 -18 -54 -6 -30 C10 -54 60 -46 56 -14 C86 -14 86 20 60 20 Z" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><rect x="-28" y="-20" width="56" height="34" rx="4" fill="#f2efe9" stroke="' + INK + '" stroke-width="2"/><path d="M-22 6 L-8 -6 L6 4 L22 -12" stroke="' + TR + '" stroke-width="4" fill="none"/></g>'; }
  function speedo(x, y, v, s, lbl) { var a = -2.2 + 4.4 * clamp(v / 120); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><circle r="44" fill="#1c1c1c" stroke="#c9ced4" stroke-width="5"/><path d="M' + f(Math.sin(-2.2) * 34) + ' ' + f(-Math.cos(-2.2) * 34) + ' A34 34 0 1 1 ' + f(Math.sin(2.2) * 34) + ' ' + f(-Math.cos(2.2) * 34) + '" stroke="#3a3d42" stroke-width="6" fill="none"/><path d="M0 0 L' + f(Math.sin(a) * 32) + ' ' + f(-Math.cos(a) * 32) + '" stroke="' + TR + '" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#f4f1e8"/><text y="28" text-anchor="middle" style="font:800 16px Noto Serif;fill:#f4f1e8">' + Math.round(v) + '</text>' + (lbl ? '<text y="64" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:#f4f1e8">' + lbl + '</text>' : '') + '</g>'; }
  function topMap(t, o) {   // a top view of streets with moving phone dots; o: { dense, jam }
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#ece8df"/>';
    for (var b = 0; b < 40; b++) { var bx = -300 + (b % 10) * 140, by = -150 + Math.floor(b / 10) * 150; s += '<rect x="' + (bx + 14) + '" y="' + (by + 14) + '" width="112" height="122" rx="6" fill="#ddd7ca"/>'; }
    for (var r = 0; r < 5; r++) s += '<path d="M-400 ' + (-150 + r * 150) + ' H1040" stroke="#fff" stroke-width="24"/>'; for (var c = 0; c < 11; c++) s += '<path d="M' + (-300 + c * 140) + ' -300 V660" stroke="#fff" stroke-width="20"/>';
    if (o.jam) s += '<path d="M-400 150 H1040" stroke="' + TR + '" stroke-width="10" opacity="' + f(o.jam) + '"/><path d="M' + (-300 + 5 * 140) + ' -300 V660" stroke="' + TG + '" stroke-width="8" opacity="' + f(o.jam) + '"/>';
    var n = Math.round(30 + 90 * (o.dense || 0)); for (var d = 0; d < n; d++) { var lane = d % 3, sp = lane === 0 && o.jam ? 0.02 : 0.12, u = (t * sp + hash(d)) % 1, px = lane === 2 ? -300 + 5 * 140 : -400 + u * 1440, py = lane === 0 ? 150 : lane === 1 ? -150 + (d % 4 + 1) * 150 - 150 : -300 + u * 960; if (lane === 1) py = [0, 300, 450][d % 3];
      s += '<circle cx="' + f(px) + '" cy="' + f(py + (hash(d + 4) - 0.5) * 10) + '" r="6" fill="' + NAV + '" stroke="#fff" stroke-width="2"/>'; }
    return s;
  }
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function driver(x, y, t, mood, o) {   // a ball-head driver seen through the side window of a big car
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 9) * 0.8) + ')">' + carSide(0, 0, t * (o.still ? 0 : 1), 2.4, o.col || "#2f6f9f") + '</g>';
    return s + head(x + 10, y - 104, 30, mood, t, 1);
  }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the red line on the map app: who drew it? (a phone in a hand, the route green → orange → red)
  shot(0, function (u, d) { return [320, lerp(190, 175, u / d), lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3340"/>' + '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gGlowW)" opacity=".15"/>';
    s += '<path d="M-400 300 H1040 V660 H-400 Z" fill="#1f252e"/><circle cx="320" cy="180" r="230" fill="#fff6c8" opacity=".06"/>';
    s += phoneIn(320, 190, 1.0, t, function (w, h) { return navApp(w, h, t, { jam: clamp(u / 1.8), mins: Math.round(lerp(18, 34, clamp(u / 1.8))) }); });
    return s + tag("مين رسم الأحمر ده؟", 500, 70, u, 1.4, 3, 18);
  });
  // 1 — no camera over every street, nobody watching the road: pull back from the phone into the real street
  shot(1, function (u, d) { var k = ease(clamp(u / 1.4)); return [lerp(320, 320, k), lerp(240, 200, k), lerp(1.7, 1.0, k)]; }, function (u, d, t) {
    var s = street(t, { jam: 0.8 });
    var c = pop((u - 1.2) / 1); s += '<g transform="translate(160 90) scale(' + f(c) + ')"><rect x="-30" y="-14" width="60" height="28" rx="6" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/><circle cx="30" cy="0" r="10" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><path d="M-50 -40 L50 40 M50 -40 L-50 40" stroke="' + TR + '" stroke-width="9" stroke-linecap="round"/></g>';
    return s + tag("مفيش كاميرا!", 480, 80, u, 1.6, 3, 20);
  });
  // 2 — so how did the phone know there's a jam ahead? (the driver, phone on the dashboard)
  shot(2, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = street(t, { jam: 1 }) + '<rect x="-400" y="-300" width="1440" height="960" fill="#000" opacity=".25"/>';
    s += phoneIn(470, 160, 0.55, t, function (w, h) { return navApp(w, h, t, { jam: 1, mins: 34 }); }, { hand: false, rot: 4 });
    s += '<g transform="translate(200 210) scale(1)">' + head(0, 0, 54, "curious", t, 1) + '</g>' + qmark(280, 110, t, 50) + qmark(310, 160, t + 1, 34);
    return s + tag("عرف منين؟", 200, 320, u, 0.8, -2, 20);
  });
  // 3 — "إيه الحكاية؟"
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(320 200) scale(' + f(0.7 * pop(u / 0.6)) + ')">' + phoneIn(0, 0, 1, t, function (w, h) { return navApp(w, h, t, { jam: 0.5, mins: 22 }); }, { hand: false, rot: 0 }) + '</g>';
    for (var i = 0; i < 8; i++) { var a = i * 0.785 + t * 0.7; s += '<circle cx="' + f(320 + Math.cos(a) * 150) + '" cy="' + f(190 + Math.sin(a) * 110) + '" r="7" fill="' + [TG, TO, TR][i % 3] + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    return s + tag("إيه الحكاية؟", 320, 50, u, 0.2, -3, 28);
  });
  // 4 — GPS on its own knows nothing about traffic: satellites over the Earth
  shot(4, function (u, d) { return [lerp(300, 340, u / d), lerp(170, 190, u / d), lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var s = space(t) + earth(t, 560);
    [[110, 90, 0.5], [320, 50, 0.6], [530, 100, 0.5], [420, 170, 0.4]].forEach(function (p, i) { s += gpsSat(p[0] + Math.sin(t * 0.9 + i) * 30, p[1] + Math.cos(t * 0.7 + i) * 10, p[2] * pop((u - i * 0.25) / 0.9), t, i); });
    s += '<g transform="translate(320 330)"><rect x="-70" y="-24" width="140" height="48" rx="12" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:' + TR + '">زحمة؟ لأ!</text></g>';
    return s + tag("GPS", 320, 250, u, 0.4, -3, 24);
  });
  // 5 — it only knows where you are, from satellite signals overhead
  shot(5, function (u, d) { return [320, lerp(160, 200, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = space(t) + earth(t, 520), me = [330, 300];
    [[100, 70], [320, 30], [540, 80], [440, 150]].forEach(function (p, i) { s += gpsSat(p[0], p[1], 0.45, t, i); for (var w = 0; w < 3; w++) { var k = (t * 0.7 + w / 3 + i * 0.1) % 1; s += '<circle cx="' + f(lerp(p[0], me[0], k)) + '" cy="' + f(lerp(p[1] + 16, me[1], k)) + '" r="' + f(4 + 3 * (1 - k)) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/>'; } s += '<path d="M' + p[0] + ' ' + (p[1] + 16) + ' L' + me[0] + ' ' + me[1] + '" stroke="#f2c230" stroke-width="2" stroke-dasharray="6 6" opacity=".6"/>'; });
    s += pin(me[0], me[1] + 6, 0.8 * pop((u - 1.2) / 0.8));
    return s + tag("إنت فين؟ بس!", 330, 340, u, 1.4, 2, 19);
  });
  // 6 — the phone listens to at least four satellites and works out the distance to each (circles meet at you)
  shot(6, function (u, d) { return [320, 190, lerp(0.95, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), me = [330, 240], S4 = [[110, 70, TR], [540, 60, NAV], [200, 330, TG], [560, 300, TO]];
    s += '<rect x="80" y="150" width="480" height="200" rx="10" fill="#f2efe9" stroke="' + INK + '" stroke-width="3"/>'; for (var g = 0; g < 5; g++) s += '<path d="M80 ' + (170 + g * 40) + ' H560 M' + (120 + g * 100) + ' 150 V350" stroke="#fff" stroke-width="10"/>';
    S4.forEach(function (p, i) { var k = clamp((u - 0.3 - i * 0.6) * 1.6), r = Math.hypot(me[0] - p[0], me[1] - p[1]); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(r * k) + '" fill="none" stroke="' + p[2] + '" stroke-width="3.5" stroke-dasharray="10 6" opacity=".85"/>' + gpsSat(p[0], p[1], 0.32, t, i); if (k > 0.9) s += '<text x="' + f((p[0] + me[0]) / 2) + '" y="' + f((p[1] + me[1]) / 2) + '" text-anchor="middle" style="font:800 15px Noto Serif;fill:' + p[2] + ';stroke:#fff;stroke-width:3;paint-order:stroke;direction:ltr;unicode-bidi:bidi-override">' + [20180, 20250, 20210, 20300][i] + ' km</text>'; });
    if (u > 2.8) s += pin(me[0], me[1] + 4, 0.9 * pop((u - 2.8) / 0.8));
    return s + tag("4 أقمار على الأقل", 320, 34, u, 0.4, -2, 20);
  });
  // 7 — from those distances it knows exactly where you are on the map (zoom into the phone, the pin drops)
  shot(7, function (u, d) { var k = ease(clamp(u / d)); return [lerp(320, 292, k), lerp(200, 270, k), lerp(1.0, 1.7, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3340"/>' + phoneIn(320, 200, 1.0, t, function (w, h) { return navApp(w, h, t, { jam: 0 }); }, { rot: 0 });
    return s + pin(283, 278 - 14 * (1 - pop(u / 0.6)), 0.55 * pop(u / 0.6)) + tag("بالظبط هنا!", 380, 214, u, 0.8, 3, 16);
  });
  // 8 — the real secret: you're sending too (the phone in the car beams up)
  shot(8, function (u, d) { return [lerp(300, 330, u / d), lerp(200, 170, u / d), lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = street(t, { v: 160 }) + cloudBox(320, 40, 0.9, t);
    for (var k = 0; k < 8; k++) { var x = ((t * 160 + k * 220) % 1760) - 400; if (x < -50 || x > 700) continue; for (var w = 0; w < 2; w++) { var q = (t * 0.9 + w / 2 + k * 0.13) % 1; s += '<circle cx="' + f(lerp(x, 320, q)) + '" cy="' + f(lerp(230, 60, q)) + '" r="5" fill="' + NAV + '" stroke="#fff" stroke-width="2" opacity="' + f(1 - q * 0.6) + '"/>'; } }
    return s + tag("إنت كمان بتبعت!", 320, 330, u, 0.6, -2, 21);
  });
  // 9 — every phone with the map open sends its place and speed every few seconds, with no name
  shot(9, function (u, d) { return [lerp(280, 330, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + phoneIn(160, 200, 0.75, t, function (w, h) { return navApp(w, h, t, { jam: 0 }); }, { rot: -4 }) + cloudBox(540, 70, 0.8, t);
    var k = (t * 0.5) % 1, px = lerp(250, 520, k), py = lerp(180, 90, k) - Math.sin(k * Math.PI) * 40;
    s += '<g transform="translate(' + f(px) + ' ' + f(py) + ') rotate(' + f(-8 + 16 * k) + ')"><rect x="-70" y="-44" width="140" height="88" rx="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="3"/><text y="-16" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + INK + '">مكانك: هنا</text><text y="8" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + NAV + '">سرعتك: 60</text><text y="32" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + TR + ';text-decoration:line-through">اسمك</text></g>';
    var sec = Math.floor(t * 2) % 5; s += '<g transform="translate(420 300)"><rect x="-60" y="-20" width="120" height="40" rx="10" fill="' + INK + '"/><text y="8" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:#7cf29a">كل ' + (3 + sec % 3) + ' ثواني</text></g>';
    return s + tag("من غير اسمك", 160, 40, u, 2.4, -3, 19);
  });
  // 10 — thousands of phones on the same road: the map sees all their speeds
  shot(10, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(1.4, 0.8, k)]; }, function (u, d, t) {
    return topMap(t, { dense: clamp(u / 2.5) }) + cloudBox(320, -80, 1.2, t) + tag("آلاف الموبايلات", 320, 330, u, 1.0, -2, 21);
  });
  // 11 — usually 60 on this road, today 10
  shot(11, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var j = clamp((u - 1.2) / 1.2), s = street(t, { jam: j });
    s += speedo(150, 90, lerp(60, 10, j) + Math.sin(t * 3) * 2, 1, j < 0.5 ? "عادةً" : "النهارده");
    s += '<g transform="translate(500 80)"><circle r="34" fill="#fff" stroke="' + TR + '" stroke-width="8"/><text y="10" text-anchor="middle" style="font:800 28px Noto Serif;fill:' + INK + '">60</text></g>';
    return s + tag(j < 0.5 ? "ستين…" : "عشرة بس!", 320, 340, u, 0.3, -2, 21, j < 0.5 ? "#bdf5c8" : "#ffb08a");
  });
  // 12 — that means a jam: the line turns red (the app close up)
  shot(12, function (u, d) { return [320, 190, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3340"/>' + phoneIn(320, 200, 0.95, t, function (w, h) { return navApp(w, h, t, { jam: clamp(u / 1.0), mins: Math.round(lerp(18, 34, clamp(u / 1.0))) }); });
    return s + tag("زحمة = أحمر", 510, 90, u, 0.6, 3, 21, "#ffb08a");
  });
  // 13 — moving at their usual speed: it stays green
  shot(13, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = street(t, { v: 190, sky: "day" }) + speedo(150, 90, 58 + Math.sin(t * 3) * 3, 1, "عادي");
    s += '<path d="M380 60 H600" stroke="' + TG + '" stroke-width="16" stroke-linecap="round"/>';
    return s + tag("ماشي = أخضر", 490, 120, u, 0.5, 3, 21, "#bdf5c8");
  });
  // 14 — the map remembers every day: this street at five o'clock
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t), hr = lerp(7, 17, clamp(u / 2.4));
    s += '<g transform="translate(150 170)"><circle r="80" fill="#fbfaf6" stroke="' + INK + '" stroke-width="5"/>'; for (var h = 0; h < 12; h++) s += '<path d="M' + f(Math.sin(h * 0.5236) * 64) + ' ' + f(-Math.cos(h * 0.5236) * 64) + ' L' + f(Math.sin(h * 0.5236) * 74) + ' ' + f(-Math.cos(h * 0.5236) * 74) + '" stroke="' + INK + '" stroke-width="4"/>';
    s += '<path d="M0 0 L' + f(Math.sin(hr * 0.5236) * 42) + ' ' + f(-Math.cos(hr * 0.5236) * 42) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(hr * 6.283) * 60) + ' ' + f(-Math.cos(hr * 6.283) * 60) + '" stroke="' + TR + '" stroke-width="3"/><circle r="6" fill="' + INK + '"/></g>';
    var dd = "M300 300"; for (var x = 0; x <= 300; x += 10) { var hh = x / 300 * 24, v = 60 - 46 * Math.exp(-Math.pow(hh - 17, 2) / 2.2) - 32 * Math.exp(-Math.pow(hh - 8.5, 2) / 1.6); dd += " L" + (300 + x) + " " + f(320 - v * 3); }
    var k = clamp((u - 0.5) / 2.4); s += '<path d="M300 320 H610 M300 320 V110" stroke="' + INK + '" stroke-width="3"/><path d="' + dd + '" stroke="' + NAV + '" stroke-width="5" fill="none" stroke-dasharray="900" stroke-dashoffset="' + f(900 * (1 - k)) + '"/>';
    if (k > 0.75) s += '<circle cx="' + f(300 + 17 / 24 * 300) + '' + '" cy="' + f(320 - 14 * 3) + '" r="12" fill="none" stroke="' + TR + '" stroke-width="4"/>';
    return s + tag("الساعة 5 كل يوم", 460, 70, u, 1.6, 3, 20);
  });
  // 15 — so it can predict the jam before you reach it, and tell you when you'll arrive
  shot(15, function (u, d) { return [320, 190, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3340"/>' + phoneIn(320, 200, 0.95, t, function (w, h) { return navApp(w, h, t, { jam: 0.8, mins: 34, eta: "توصل 5:40" }); });
    return s + tag("هتوصل إمتى؟", 520, 90, u, 0.6, 3, 20);
  });
  // 16 — and if it finds a faster way, it suggests you change
  shot(16, function (u, d) { return [320, 190, lerp(1.1, 1.25, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b3340"/>' + phoneIn(320, 200, 0.95, t, function (w, h) { return navApp(w, h, t, { jam: 1, alt: clamp(u / 0.8), mins: Math.round(lerp(34, 27, clamp((u - 0.8) / 1))) }); });
    return s + tag("طريق أسرع!", 510, 90, u, 0.5, 3, 21, "#bfe0ff");
  });
  // 17 — in apps like Waze, people themselves report an accident or a pothole
  shot(17, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = street(t, { jam: 0.7 });
    s += '<g transform="translate(430 250)"><path d="M-40 10 l30 -24 l40 30" stroke="' + INK + '" stroke-width="0"/></g>';
    [[180, "حادثة", "!"], [460, "حفرة", "◒"]].forEach(function (r, i) { var p = pop((u - 0.6 - i * 0.9) / 0.9); if (p <= 0) return; s += '<g transform="translate(' + r[0] + ' 150) scale(' + f(p) + ')"><path d="M0 40 C-34 6 -30 -36 0 -36 C30 -36 34 6 0 40 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/><text y="0" text-anchor="middle" style="font:800 30px Noto Sans Arabic;fill:' + INK + '">' + r[2] + '</text></g>' + tag(r[1], r[0], 70, u, 0.8 + i * 0.9, i ? 3 : -3, 18); });
    s += '<g transform="translate(320 336)">' + head(-150, -20, 26, "happy", t, 1) + '<rect x="-128" y="-34" width="18" height="30" rx="4" fill="#2b2f34" stroke="' + INK + '" stroke-width="2"/></g>';
    return s + tag("الناس بتبلّغ", 330, 330, u, 2.6, -2, 19);
  });
  // 18 — 2020: a German artist pulls a hand cart with 99 phones down an empty street
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(160, 420, k), 190, lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 8, 30, 3, 0.8) + city(t, 210, 130, "#b08a6a", true, 9, false) + '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="#c9c4b8"/>';
    for (var c = 0; c < 30; c++) s += '<path d="M' + (-400 + c * 50) + ' 346 l-12 60" stroke="#a7a198" stroke-width="2"/>';
    var x = lerp(60, 560, clamp(u / d)), step = Math.sin(t * 6) * 8;
    s += '<path d="M' + f(x - 30) + ' 300 L' + f(x - 80) + ' 316" stroke="' + INK + '" stroke-width="5"/><rect x="' + f(x - 230) + '" y="296" width="150" height="40" rx="6" fill="#c23a26" stroke="' + INK + '" stroke-width="3"/>';
    for (var p = 0; p < 40; p++) s += '<rect x="' + f(x - 224 + (p % 14) * 10) + '" y="' + f(282 - Math.floor(p / 14) * 13 - (p % 2) * 2) + '" width="9" height="15" rx="2" fill="#1c1e22" stroke="#e9e4d8" stroke-width="1"/>';
    s += '<circle cx="' + f(x - 210) + '" cy="340" r="13" fill="' + INK + '"/><circle cx="' + f(x - 100) + '" cy="340" r="13" fill="' + INK + '"/>';
    s += '<path d="M' + f(x) + ' 280 L' + f(x - 10 + step) + ' 340 M' + f(x) + ' 280 L' + f(x + 10 - step) + ' 340" stroke="#26405e" stroke-width="12" stroke-linecap="round"/><path d="M' + f(x - 26) + ' 200 C' + f(x - 30) + ' 240 ' + f(x - 20) + ' 284 ' + f(x) + ' 284 C' + f(x + 22) + ' 284 ' + f(x + 26) + ' 240 ' + f(x + 22) + ' 200 Z" fill="#3a3d42" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(x - 14) + ' 220 L' + f(x - 34) + ' 300" stroke="#3a3d42" stroke-width="12" stroke-linecap="round"/>' + head(x, 172, 28, "happy", t, -1);
    var n = Math.round(99 * clamp(u / 2)); s += '<g transform="translate(' + f(x - 150) + ' 220)"><rect x="-52" y="-24" width="104" height="44" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 22px Noto Serif;fill:#7cf29a">' + n + ' موبايل</text></g>';
    return s + tag("برلين 2020", 200, 70, u, 0.4, -3, 20) + tag("شارع فاضي!", 480, 70, u, 2.6, 3, 20);
  });
  // 19 — the map thinks there are 99 cars crawling, and turns the street red
  shot(19, function (u, d) { return [320, 190, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sky("day") + city(t, 210, 130, "#b08a6a", true, 9, false) + '<rect x="-400" y="206" width="1440" height="20" fill="#c9c4b8"/><rect x="-400" y="226" width="1440" height="120" fill="url(#gAsphalt)"/><rect x="-400" y="346" width="1440" height="400" fill="#c9c4b8"/>';
    s += phoneIn(450, 190, 0.8, t, function (w, h) { var g = navApp(w, h, t, { jam: clamp((u - 0.6) / 1.2), mins: 40 }); return g; }, { rot: 5 });
    s += '<g transform="translate(130 200)">' + head(0, 0, 50, "happy", t, 1) + '</g>' + '<text x="130" y="300" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:' + INK + '">ههه!</text>';
    return s + tag("99 عربية؟!", 450, 30, u, 1.0, 3, 21, "#ffb08a");
  });
  // 20 — the map doesn't see cars, it sees phones (the cars fade, the blue dots stay)
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.6) / 1.4), s = '<g opacity="' + f(1 - 0.85 * k) + '">' + street(t, { jam: 0.6 }) + '</g><rect x="-400" y="-300" width="1440" height="960" fill="#1f252e" opacity="' + f(0.75 * k) + '"/>';
    for (var c = 0; c < 8; c++) { var free = ((t * 160 + c * 220) % 1760) - 400, x = lerp(free, 560 - c * 112, 0.6); s += '<circle cx="' + f(x) + '" cy="236" r="' + f(7 + 5 * k) + '" fill="' + NAV + '" stroke="#fff" stroke-width="3"/>'; }
    return s + tag("بتشوف الموبايلات!", 320, 100, u, 1.2, -2, 22, "#bfe0ff");
  });
  // 21 — the jam you see is everyone around you, at the same moment (top view, dots)
  shot(21, function (u, d) { return [320, 180, lerp(1.1, 0.9, u / d)]; }, function (u, d, t) {
    return topMap(t, { dense: 0.6, jam: clamp(u / 1.2) }) + tag("كلنا مع بعض", 320, 330, u, 1.0, -2, 21);
  });
  // 22 — the more people with the map open, the sharper the picture
  shot(22, function (u, d) { return [320, 180, lerp(0.9, 1.0, u / d)]; }, function (u, d, t) {
    return topMap(t, { dense: 0.6 + 0.4 * clamp(u / 2), jam: 1 }) + tag("ناس أكتر = صورة أدق", 320, 330, u, 0.8, -2, 20);
  });
  // 23 — so while you're stuck in the jam, you're helping someone else escape it
  shot(23, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = street(t, { jam: 1 }) + cloudBox(320, 40, 0.8, t);
    for (var w = 0; w < 3; w++) { var q = (t * 0.8 + w / 3) % 1; s += '<circle cx="' + f(lerp(340, 320, q)) + '" cy="' + f(lerp(230, 60, q)) + '" r="6" fill="' + NAV + '" stroke="#fff" stroke-width="2"/>'; }
    s += phoneIn(560, 150, 0.42, t, function (w2, h2) { return navApp(w2, h2, t, { jam: 1, alt: 1, mins: 27 }); }, { hand: false, rot: 6 });
    s += '<path d="M360 80 C420 40 480 60 520 100" stroke="' + NAV + '" stroke-width="4" fill="none" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 20) + '"/>';
    return s + tag("إنت بتساعد غيرك!", 280, 330, u, 1.0, -2, 21) + '<text x="440" y="70" style="font:800 30px Noto Sans Arabic;fill:' + TR + '">♥</text>';
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(220 200) scale(.62)">' + phoneIn(0, 0, 1, t, function (w, h) { return navApp(w, h, t, { jam: 0.3, mins: 20 }); }, { hand: false, rot: -4 }) + '</g>' + '<g transform="translate(430 200) scale(.9)">' + head(0, 0, 56, "happy", t, -1) + '</g>';
    return s + qmark(480, 100, t, 56) + qmark(530, 140, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { navApp: navApp, phoneIn: phoneIn, street: street, gpsSat: gpsSat, space: space, earth: earth, pin: pin, tag: tag, cloudBox: cloudBox, topMap: topMap };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
