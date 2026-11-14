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


  // ── «حزمة فيديوهات الأنيميشن» promo: this episode's pieces ─────────────
  var INK = "#1c1c1c", YEL = "#f2c230", FONT = 'font-family="Noto Sans Arabic, sans-serif"';
  function txt(x, y, s, size, fill, o) {
    o = o || {};
    return '<text x="' + f(x) + '" y="' + f(y) + '" ' + FONT + ' font-weight="' + (o.w || 800) + '" font-size="' + size + '" fill="' + (fill || "#fff") + '" text-anchor="' + (o.a || "middle") + '"' + (o.ltr ? ' direction="ltr"' : '') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + '>' + s + '</text>';
  }
  function f2(n) { return (+n).toFixed(2); }
  // dark stage with a warm glow and slow dust that never stops
  function stage(t, gx, gy, col) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gStage)"/>';
    s += '<circle cx="' + f(gx + Math.sin(t * 0.9) * 10) + '" cy="' + f(gy) + '" r="' + f(150 + 12 * Math.sin(t * 1.7)) + '" fill="' + (col || YEL) + '" opacity=".22" filter="url(#soft)"/>';
    for (var i = 0; i < 34; i++) {
      var u = ((t * (0.05 + hash(i) * 0.07) + hash(i + 3)) % 1), x = -80 + hash(i + 11) * 800 + Math.sin(t * 0.8 + i) * 14, y = 400 - u * 460;
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1 + hash(i + 5) * 2.2) + '" fill="#ffe9a0" opacity="' + f2(0.15 + 0.35 * Math.sin(u * Math.PI)) + '"/>';
    }
    return s;
  }
  // a phone playing a few seconds of one of the channel's real videos (sprite sheets of 108×192 frames at 15 fps, made from the episodes' own builds)
  var CLIP = { spTbm: [12, 120], spGas: [10, 90], spBridge: [10, 90], spHeli: [10, 90] };
  function phone(x, y, sc, rot, id, t, k, c) {
    k = k == null ? 1 : k; if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.1 + x * 0.01) * 4) + ') rotate(' + f(rot + Math.sin(t * 1.3 + x) * 1.6) + ') scale(' + (sc * k).toFixed(3) + ')">';
    s += '<rect x="-62" y="-106" width="124" height="212" rx="16" fill="#000" opacity=".35" transform="translate(5 8)" filter="url(#soft2)"/>';
    s += '<rect x="-60" y="-104" width="120" height="208" rx="15" fill="#0b0b0d" stroke="#4a4d55" stroke-width="2"/>';
    var cl = CLIP[id], fr = Math.floor(Math.max(0, c == null ? t : c) * 15) % cl[1], col = fr % cl[0], row = Math.floor(fr / cl[0]);
    s += '<svg x="-54" y="-96" width="108" height="192" viewBox="' + (col * 108) + ' ' + (row * 192) + ' 108 192"><use href="#' + id + '"/></svg>';
    s += '<rect x="-56" y="-98" width="112" height="196" rx="10" fill="none" stroke="#0b0b0d" stroke-width="5"/>';
    // a moving sheen so the screen is never still
    var sh = ((t * 0.35 + x * 0.003) % 1) * 260 - 130;
    s += '<path d="M' + f(sh) + ' -96 l26 0 l-40 192 l-26 0 Z" fill="#fff" opacity=".09" clip-path="url(#scr)"/>';
    s += '<rect x="-16" y="-101" width="32" height="5" rx="2.5" fill="#000"/>';
    return s + '</g>';
  }
  function fmtViews(v, target) { return target >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1000).toFixed(v >= target ? (target % 1000 ? 1 : 0) : 0) + "K"; }
  // view counter pill that counts up to the real number
  function views(x, y, target, u, u0, dur, sc, t) {
    var k = pop((u - u0) / 1.0); if (k <= 0) return "";
    var p = ease(clamp((u - u0) / dur)), v = target * p, lab = fmtViews(v, target), done = p >= 1, pulse = done ? 1 + 0.05 * Math.sin(t * 7) : 1;
    var hw = 34 + lab.length * 7, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + ((sc || 1) * k * pulse).toFixed(3) + ')">';
    s += '<rect x="' + (-hw) + '" y="-19" width="' + (hw * 2) + '" height="38" rx="19" fill="' + (done ? YEL : "#fbfbf7") + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M' + (16 - hw) + ' -9 L' + (30 - hw) + ' 0 L' + (16 - hw) + ' 9 Z" fill="' + INK + '"/>';
    s += '<text x="12" y="8" ' + FONT + ' font-weight="900" font-size="22" fill="' + INK + '" text-anchor="middle" direction="ltr">' + lab + '</text>';
    return s + '</g>';
  }
  function hearts(t, x0, x1, n, seed) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var u = ((t * (0.22 + hash(i + seed) * 0.2) + hash(i * 3 + seed)) % 1), x = lerp(x0, x1, hash(i * 7 + seed)) + Math.sin(t * 2 + i) * 10, y = 350 - u * 330, r = 5 + hash(i + seed + 2) * 6;
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f2(r / 10) + ')" opacity="' + f2(Math.sin(u * Math.PI)) + '"><path d="M0 8 C-14 -2 -8 -12 0 -5 C8 -12 14 -2 0 8 Z" fill="' + (i % 3 ? "#ff5a6e" : YEL) + '" stroke="' + INK + '" stroke-width="1.4"/></g>';
    }
    return s;
  }
  // the viewer: a ball-head character in a hoodie; o: {s, look, arm: -1..1 raised arm, pen}
  function guy(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2.5) + ') rotate(' + f(Math.sin(t * 1.7) * 1.8) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="' + (o.col || "#3f8f7a") + '" stroke="' + INK + '" stroke-width="3"/><path d="M-16 34 L0 58 L16 34" fill="#2f6f5e" stroke="' + INK + '" stroke-width="2"/>';
    s += head(0, -34, 40, mood, t, o.look);
    if (o.arm != null) {
      var ay = 30 - 50 * o.arm + Math.sin(t * 4) * 5, ax = (o.side || 1) * 100;
      s += '<path d="M' + ((o.side || 1) * 44) + ' 64 Q' + f(ax * 0.8) + ' ' + f(ay + 30) + ' ' + f(ax) + ' ' + f(ay) + '" stroke="' + (o.col || "#3f8f7a") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
      if (o.pen) s += '<path d="M' + f(ax - 4) + ' ' + f(ay + 4) + ' l' + ((o.side || 1) * 26) + ' -34" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + f(ax - 4) + ' ' + f(ay + 4) + ' l' + ((o.side || 1) * 26) + ' -34" stroke="' + YEL + '" stroke-width="4" stroke-linecap="round"/>';
    }
    return s + '</g>';
  }
  function stopwatch(x, y, r, t, speed, label) {
    var a = t * speed, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 3) * 3) + ')">';
    s += '<rect x="-5" y="' + f(-r - 12) + '" width="10" height="10" rx="2" fill="' + INK + '"/><circle r="' + (r + 4) + '" fill="' + INK + '"/><circle r="' + r + '" fill="#fbfbf7"/>';
    for (var i = 0; i < 12; i++) { var q = i * Math.PI / 6; s += '<path d="M' + f(Math.sin(q) * (r - 5)) + ' ' + f(-Math.cos(q) * (r - 5)) + ' L' + f(Math.sin(q) * (r - 1)) + ' ' + f(-Math.cos(q) * (r - 1)) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
    s += '<path d="M0 0 L' + f(Math.sin(a) * (r - 8)) + ' ' + f(-Math.cos(a) * (r - 8)) + '" stroke="#d8452e" stroke-width="3.4" stroke-linecap="round"/><circle r="3.4" fill="' + INK + '"/>';
    if (label) s += txt(0, r * 0.62, label, r * 0.34, INK, { w: 900 });
    return s + '</g>';
  }
  function coin(x, y, r, rot) { var w = Math.abs(Math.cos(rot)) * r + r * 0.18; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><ellipse rx="' + f(w) + '" ry="' + r + '" fill="url(#gCoin)" stroke="' + INK + '" stroke-width="2"/>' + (w > r * 0.6 ? '<text x="0" y="' + f(r * 0.38) + '" ' + FONT + ' font-weight="900" font-size="' + f(r * 1.1) + '" fill="#7a5a10" text-anchor="middle">$</text>' : '') + '</g>'; }
  function sparkle(x, y, r, t, ph, col) { var k = 0.55 + 0.45 * Math.sin(t * 6 + ph), q = r * k; return '<path d="M' + f(x) + ' ' + f(y - q) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x + q) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y + q) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x - q) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - q) + ' Z" fill="' + (col || "#fff") + '" opacity="' + f2(0.5 + 0.5 * k) + '"/>'; }
  // a sheet of paper; kind: "lines" | "grid" | "titles" | "blank"; p = how much of it is written (0..1)
  function sheet(x, y, w, h, kind, p, t, title, k, rot) {
    k = k == null ? 1 : k; if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.2 + x * 0.02) * 3) + ') rotate(' + f((rot || 0) + Math.sin(t * 1.5 + x) * 1.5) + ') scale(' + k.toFixed(3) + ')">';
    s += '<rect x="' + f(-w / 2 + 4) + '" y="' + f(-h / 2 + 5) + '" width="' + w + '" height="' + h + '" rx="6" fill="#000" opacity=".3"/><rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="' + h + '" rx="6" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.6"/>';
    if (title) s += '<rect x="' + f(-w / 2) + '" y="' + f(-h / 2) + '" width="' + w + '" height="24" rx="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2.6"/>' + txt(0, -h / 2 + 18, title, 14, INK, { w: 900, ltr: /^[A-Za-z]/.test(title) });
    var top = -h / 2 + (title ? 36 : 14), i;
    if (kind === "lines") { var n = Math.floor((h / 2 - top - 6) / 11); for (i = 0; i < n; i++) { var lw = (w - 22) * (0.55 + 0.45 * hash(i + w)), q = clamp(p * n - i); if (q > 0) s += '<rect x="' + f(w / 2 - 11 - lw * q) + '" y="' + f(top + i * 11) + '" width="' + f(lw * q) + '" height="4.5" rx="2" fill="#6a6f7a"/>'; } }
    if (kind === "grid") { var cw = (w - 30) / 2, ch = (h / 2 - top - 16) / 2; for (i = 0; i < 4; i++) { var gx = -w / 2 + 10 + (i % 2) * (cw + 10), gy = top + Math.floor(i / 2) * (ch + 8), q2 = clamp(p * 4 - i); s += '<rect x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(cw) + '" height="' + f(ch) + '" rx="3" fill="' + (q2 > 0 ? ["#bfe0f0", "#f6d9a0", "#cfe8c0", "#f2c0b8"][i] : "#ece6d4") + '" stroke="' + INK + '" stroke-width="1.6"/>'; if (q2 > 0) s += '<circle cx="' + f(gx + cw / 2) + '" cy="' + f(gy + ch / 2) + '" r="' + f(Math.min(cw, ch) * 0.26 * q2) + '" fill="' + INK + '" opacity=".75"/>'; else s += txt(gx + cw / 2, gy + ch / 2 + 6, "؟", 16, "#a9a391", { w: 900 }); } }
    if (kind === "titles") { for (i = 0; i < 3; i++) { var q3 = clamp(p * 3 - i), bw = (w - 24) * q3; if (q3 > 0) s += '<rect x="' + f(w / 2 - 12 - bw) + '" y="' + f(top + i * 24) + '" width="' + f(bw) + '" height="15" rx="4" fill="' + (i === 0 ? "#d8452e" : "#3f6f8f") + '"/><rect x="' + f(w / 2 - 12 - bw * 0.6) + '" y="' + f(top + i * 24 + 5) + '" width="' + f(bw * 0.5) + '" height="4" rx="2" fill="#fff" opacity=".8"/>'; } }
    if (kind === "blank") s += '<rect x="' + f(w / 2 - 16) + '" y="' + f(top) + '" width="3" height="13" fill="' + INK + '" opacity="' + (Math.sin(t * 9) > 0 ? 1 : 0.15) + '"/>';
    return s + '</g>';
  }
  // one of the four things inside the kit
  function kitCard(x, y, badge, label, col, k, t, rot) {
    if (k <= 0) return "";
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.3 + x * 0.03) * 4) + ') rotate(' + f((rot || 0) + Math.sin(t * 1.6 + x) * 2) + ') scale(' + k.toFixed(3) + ')">';
    s += '<rect x="-52" y="-58" width="112" height="124" rx="12" fill="#000" opacity=".3"/><rect x="-56" y="-62" width="112" height="124" rx="12" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="-42" y="-48" width="84" height="46" rx="8" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.4"/>' + txt(0, -17, badge, badge.length > 5 ? 15 : 20, INK, { w: 900, ltr: true });
    s += txt(0, 26, label.split("|")[0], 17, "#fff", { w: 900 }) + (label.split("|")[1] ? txt(0, 47, label.split("|")[1], 17, "#fff", { w: 900 }) : "");
    return s + '</g>';
  }
  function hours(k) { return k < 0.25 ? "day" : k < 0.5 ? "dusk" : k < 0.75 ? "night" : "dawn"; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  // a round badge for a platform (a plain glyph and the name, not the real logo)
  function badge(x, y, sc, kind, name, t, k, op) {
    if (k <= 0) return "";
    var col = { fb: "#1f6fe0", tt: "#17181c", ig: "#d6336c", yt: "#e02f2f" }[kind], s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4 + x * 0.02) * 4) + ') rotate(' + f(Math.sin(t * 1.6 + x) * 3) + ') scale(' + (sc * k).toFixed(3) + ')" opacity="' + f2(op == null ? 1 : op) + '">';
    s += '<circle r="46" fill="#000" opacity=".3" cx="4" cy="6"/><circle r="44" fill="' + col + '" stroke="#fbfbf7" stroke-width="4"/>';
    if (kind === "fb") s += '<text x="4" y="24" font-family="Noto Serif, serif" font-weight="700" font-size="66" fill="#fff" text-anchor="middle" direction="ltr">f</text>';
    if (kind === "tt") s += '<path d="M6 -24 V12 a12 12 0 1 1 -10 -12 M6 -24 q4 14 18 14" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    if (kind === "ig") s += '<rect x="-22" y="-22" width="44" height="44" rx="12" fill="none" stroke="#fff" stroke-width="6"/><circle r="10" fill="none" stroke="#fff" stroke-width="6"/><circle cx="14" cy="-14" r="3.4" fill="#fff"/>';
    if (kind === "yt") s += '<path d="M-12 -18 L20 0 L-12 18 Z" fill="#fff"/>';
    return s + txt(0, 74, name, 19, "#fff", { w: 900 }) + '</g>';
  }

  // 0 — the tunnel video playing on a phone: 1.3M views
  shot(0, function (u, d) { return [320, lerp(170, 185, ease(u / d)), lerp(1.45, 1.0, ease(u / 1.6))]; }, function (u, d, t) {
    var s = stage(t, 320, 180) + hearts(t, 60, 230, 7, 1) + hearts(t, 410, 580, 7, 9);
    s += phone(320, 172, 1.42, -3, "spTbm", t, 1, t - L(0)) + views(320, 322, 1300000, u, 0.2, 1.5, 1.25, t);
    s += tag("1.3 مليون مشاهدة", 505, 92, u, 1.0, 4, 22, YEL);
    return s + sparkle(430, 60, 14, t, 0) + sparkle(205, 250, 11, t, 2) + sparkle(560, 240, 12, t, 4) + sparkle(120, 110, 12, t, 5);
  });
  // 1 — two more videos around half a million each (the times come from the voice)
  var T1 = [0, 1.2];
  shot(1, function (u, d) { return [lerp(250, 320, ease((u - 1.0) / 0.8)), lerp(176, 184, u / d), lerp(1.3, 1.0, ease((u - 1.0) / 0.8))]; }, function (u, d, t) {
    var s = stage(t, 320, 180) + hearts(t, 20, 620, 12, 21), ids = ["spGas", "spBridge"], n = [520000, 476300], xs = [205, 435];
    for (var i = 0; i < 2; i++) s += phone(xs[i], 158, 1.12, (i - 0.5) * 7, ids[i], t, pop((u - T1[i]) / 0.9), u - T1[i]) + views(xs[i], 300, n[i], u, T1[i] + 0.2, 0.9, 1.0, t);
    return s + sparkle(320, 60, 13, t, 0) + sparkle(560, 290, 11, t, 2) + sparkle(70, 80, 12, t, 4) + sparkle(60, 300, 10, t, 5);
  });
  // 2 — the brand line
  shot(2, function (u, d) { return [320, 180, lerp(1.12, 1.0, ease(u / d))]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f3e7d0"/>', i;
    for (i = 0; i < 12; i++) { var a = i * Math.PI / 6 + t * 0.35; s += '<path d="M320 180 L' + f(320 + Math.cos(a) * 900) + ' ' + f(180 + Math.sin(a) * 900) + ' L' + f(320 + Math.cos(a + 0.26) * 900) + ' ' + f(180 + Math.sin(a + 0.26) * 900) + ' Z" fill="#ecd9b4"/>'; }
    var k = pop(u / 0.9), b = 1 + 0.04 * Math.sin(t * 5);
    s += '<g transform="translate(250 165) rotate(' + f(-4 + Math.sin(t * 2) * 2) + ') scale(' + (k * b).toFixed(3) + ')"><path d="M-170 -70 Q-170 -96 -144 -96 H144 Q170 -96 170 -70 V40 Q170 66 144 66 H-60 L-104 106 L-98 66 H-144 Q-170 66 -170 40 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="5"/>' + txt(0, 6, "إيه الحكاية؟", 52, INK, { w: 900 }) + '</g>';
    s += stopwatch(505, 200, 52, t, 6.283 / 2, "30 ث");
    return s + tag("في نص دقيقة", 500, 300, u, 0.8, 3, 22, YEL);
  });
  // 3 — every platform, and Facebook pays for the views
  var T3 = [0.1, 1.0, 1.5, 2.0], PAY = 2.75;
  shot(3, function (u, d) { return [lerp(400, 320, clamp(u / PAY)), lerp(150, 185, ease((u - PAY) / 0.8)), lerp(1.25, 1.12, clamp(u / PAY)) * lerp(1, 0.893, ease((u - PAY) / 0.8))]; }, function (u, d, t) {
    var s = stage(t, 320, 200) + hearts(t, 20, 620, 10, 60), pk = ease((u - PAY) / 0.6), kinds = ["fb", "tt", "ig", "yt"], names = ["فيسبوك", "تيك توك", "انستجرام", "يوتيوب"], xs = [530, 390, 250, 110], i;
    for (i = 1; i < 4; i++) s += badge(lerp(xs[i], [0, 520, 120, 600][i], pk), lerp(130, [0, 110, 110, 250][i], pk), lerp(1, 0.62, pk), kinds[i], names[i], t, pop((u - T3[i]) / 0.8), lerp(1, 0.75, pk));
    if (pk > 0) {
      // the jar under Facebook filling up
      s += '<path d="M262 236 H378 V318 Q378 334 362 334 H278 Q262 334 262 318 Z" fill="#cfe6f2" opacity="' + f2(0.35 * pk) + '" stroke="#fbfbf7" stroke-width="3.5" stroke-opacity="' + f2(pk) + '"/>';
      var fill = clamp((u - PAY) / 1.6);
      for (i = 0; i < 9; i++) if (i / 9 < fill) s += coin(286 + (i % 3) * 34 + hash(i) * 6, 322 - Math.floor(i / 3) * 21 - hash(i + 4) * 5, 13, 0.3 + i);
      for (i = 0; i < 6; i++) { var q = ((t * 1.1 + i / 6) % 1); s += coin(320 + Math.sin(i * 2.4) * 30, lerp(150, 250, q * q), 13, t * 6 + i); }
    }
    s += badge(lerp(xs[0], 320, pk), lerp(130, 100, pk), lerp(1, 1.3, pk) * (1 + 0.04 * pk * Math.sin(t * 7)), "fb", pk > 0.5 ? "" : names[0], t, pop((u - T3[0]) / 0.8));
    return s + tag("دولارات على المشاهدات", 150, 240, u, PAY + 0.5, -4, 20, YEL) + sparkle(60, 300, 12, t, 0) + sparkle(585, 330, 11, t, 3) + sparkle(200, 40, 11, t, 5);
  });
  // 4 — the hard part is the script and the storyboard; Claude writes them in minutes
  var W4 = 2.2;
  shot(4, function (u, d) { return [lerp(272, 292, u / d), 180, lerp(1.12, 1.02, ease(u / d))]; }, function (u, d, t) {
    var s = stage(t, 300, 170, "#e8742e"), i, w = u - W4;
    s += '<path d="M118 292 H482 L512 322 H88 Z" fill="#8a9098" stroke="' + INK + '" stroke-width="3"/><rect x="128" y="52" width="344" height="240" rx="12" fill="#0b0b0d" stroke="#8a9098" stroke-width="5"/><rect x="140" y="64" width="320" height="216" rx="5" fill="#fbf7ea"/>';
    s += '<rect x="140" y="64" width="320" height="34" fill="#f1e6cf"/><circle cx="438" cy="81" r="9" fill="#e8742e" stroke="' + INK + '" stroke-width="2"/>' + txt(418, 88, "Claude", 19, INK, { w: 900, ltr: true, a: "end" });
    if (w < 0) s += '<rect x="442" y="109" width="3" height="14" fill="' + INK + '" opacity="' + (Math.sin(t * 9) > 0 ? 1 : 0.15) + '"/>' + txt(300, 200, "؟", 70, "#d9cfb4", { w: 900 });
    else {
      for (i = 0; i < 9; i++) { var lw = 280 * (0.5 + 0.5 * hash(i + 30)), q = clamp(w * 6 - i * 0.55); if (q > 0) s += '<rect x="' + f(448 - lw * q) + '" y="' + (112 + i * 18) + '" width="' + f(lw * q) + '" height="8" rx="3.5" fill="' + (i === 0 || i === 5 ? "#d8452e" : "#6a6f7a") + '"/>'; }
      var cur = Math.min(8, Math.floor(w * 11)); s += '<rect x="' + f(448 - 280 * (0.5 + 0.5 * hash(cur + 30)) * clamp(w * 6 - cur * 0.55) - 6) + '" y="' + (109 + cur * 18) + '" width="3" height="14" fill="#e8742e" opacity="' + (Math.sin(t * 14) > 0 ? 1 : 0.2) + '"/>';
    }
    s += guy(548, 250, t, w < 0 ? "worry" : "happy", { s: 0.62, look: -1, arm: w < 0 ? undefined : 1, side: -1 });
    s += tag("سكريبت", 70, 96, u, 0.45, -4, 22, "#f2a0a0") + tag("storyboard", 80, 160, u, 1.15, 3, 19, "#f2a0a0");
    return s + stopwatch(66, 232, 30, t, w < 0 ? 6.283 / 6 : 6.283 / 1.0, "") + tag("في دقايق", 80, 300, u, W4 + 1.1, -4, 23, YEL) + sparkle(110, 30, 12, t, 0) + sparkle(520, 90, 12, t, 2) + sparkle(540, 330, 10, t, 4);
  });
  // 5 — the kit: four things come out of the box
  var T5 = [1.35, 2.2, 3.1, 3.9];
  shot(5, function (u, d) { return [320, lerp(215, 172, ease(u / 1.5)), lerp(1.3, 1.0, ease(u / 1.6))]; }, function (u, d, t) {
    var s = stage(t, 320, 230), open = ease(u / 1.0), wig = Math.sin(t * 9) * (u < 1.0 ? 3 : 0.8);
    var items = [["SKILL", "مهارة|جاهزة", "#d8452e"], ["PDF", "دليل|عربي", "#3f6f8f"], ["MP4", "فيديو|شرح", "#3f8f7a"], ["PROMPTS", "برومبتات", "#8a5fb0"]], xs = [545, 395, 245, 95];
    s += '<path d="M250 262 L' + f(250 - 150 * open) + ' -40 H' + f(390 + 150 * open) + ' L390 262 Z" fill="#ffe9a0" opacity="' + f2(0.16 * open + 0.03 * Math.sin(t * 6)) + '"/>';
    for (var i = 0; i < 4; i++) { var q = ease((u - T5[i]) / 0.6); if (u > T5[i]) s += kitCard(lerp(320, xs[i], q), lerp(250, 112, q), items[i][0], items[i][1], items[i][2], lerp(0.3, 1, q), t, (i - 1.5) * -3); }
    s += '<g transform="translate(320 300) rotate(' + f(wig) + ')"><path d="M-78 -40 H78 V44 H-78 Z" fill="url(#gBox)" stroke="' + INK + '" stroke-width="3.4"/><path d="M-78 -40 L' + f(-78 - 46 * open) + ' ' + f(-40 - 30 * open) + ' L' + f(-8 - 40 * open) + ' ' + f(-40 - 30 * open) + ' L0 -40 Z" fill="#c4935a" stroke="' + INK + '" stroke-width="3"/><path d="M78 -40 L' + f(78 + 46 * open) + ' ' + f(-40 - 30 * open) + ' L' + f(8 + 40 * open) + ' ' + f(-40 - 30 * open) + ' L0 -40 Z" fill="#c4935a" stroke="' + INK + '" stroke-width="3"/><rect x="-40" y="-8" width="80" height="34" rx="6" fill="#fbf7ea" stroke="' + INK + '" stroke-width="2.4"/>' + txt(0, 17, "الحزمة", 19, INK, { w: 900 }) + '</g>';
    if (u < T5[0] + 0.2) s += tag("الطريقة كلها في حزمة", 320, 150, u, 0.3, -2, 23, YEL);
    return s + sparkle(190, 250, 13, t, 0) + sparkle(455, 240, 12, t, 2) + sparkle(320, 30, 12, t, 4);
  });
  // 6 — type the topic, get the script, the scenes and the titles; the drawing and editing are yours
  var T6 = [0.7, 1.5, 2.0], YOU = 2.7;
  shot(6, function (u, d) { return [lerp(320, 345, ease((u - YOU) / 0.7)), lerp(120, 180, ease((u - 0.35) / 0.7)), lerp(1.4, 1.0, ease((u - 0.35) / 0.7))]; }, function (u, d, t) {
    var s = stage(t, 320, 210), topic = "ليه السما زرقا؟", n = Math.min(topic.length, Math.floor(u * 30)), sent = u > 0.55, i;
    s += '<rect x="116" y="38" width="408" height="52" rx="26" fill="#fbf7ea" stroke="' + INK + '" stroke-width="3.4"/>' + txt(470, 72, topic.slice(0, n), 23, INK, { w: 800, a: "start" });
    s += '<g transform="translate(150 64) scale(' + (sent ? 1 + 0.12 * Math.sin(t * 8) : 1).toFixed(3) + ')"><circle r="19" fill="' + (sent ? "#e8742e" : "#c9c2ad") + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M0 9 V-8 M-7 -1 L0 -9 L7 -1" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
    var xs = [450, 300, 150], kinds = ["lines", "grid", "titles"], names = ["السكريبت", "المشاهد", "العناوين"];
    for (i = 0; i < 3; i++) {
      if (sent) for (var q = 0; q < 5; q++) { var w = ((t * 1.4 + q / 5) % 1); s += '<circle cx="' + f(lerp(320, xs[i], w)) + '" cy="' + f(lerp(92, 150, w)) + '" r="3.4" fill="' + YEL + '" opacity="' + f2(Math.sin(w * Math.PI)) + '"/>'; }
      s += sheet(xs[i], 232, 128, 150, kinds[i], clamp((u - T6[i] - 0.15) / 0.8), t, names[i], pop((u - T6[i]) / 0.8), (1 - i) * 3);
    }
    var gk = ease((u - YOU) / 0.6);
    if (gk > 0) s += guy(lerp(760, 590, gk), 250, t, "happy", { s: 0.6, look: -1, arm: 0.6, side: -1, pen: true }) + tag("وإنت ترسم وتركّب", 510, 322, u, YOU + 0.2, 3, 19, YEL);
    return s + sparkle(60, 120, 12, t, 0) + sparkle(585, 60, 12, t, 3);
  });
  // 7 — the price and the link in the bio
  shot(7, function (u, d) { return [lerp(300, 330, clamp(u / 5)), 180, lerp(1.1, 1.0, ease(u / 2))]; }, function (u, d, t) {
    var s = stage(t, 200, 170) + hearts(t, 30, 330, 6, 40), sw = Math.sin(t * 2.4) * 6, k = pop(u / 0.9), b = 1 + 0.05 * Math.sin(t * 6);
    s += '<g transform="translate(200 60) rotate(' + f(sw) + ') scale(' + k.toFixed(3) + ')"><path d="M0 0 V44" stroke="#d9d4c8" stroke-width="3"/><path d="M-124 60 L-96 34 H124 V150 H-96 L-124 124 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="4"/><circle cx="-98" cy="92" r="7" fill="#1c1d26" stroke="' + INK + '" stroke-width="2.4"/>' + '<text x="20" y="112" ' + FONT + ' font-weight="900" font-size="58" fill="' + INK + '" text-anchor="middle" direction="ltr" transform="scale(' + b.toFixed(3) + ')">$14.99</text></g>';
    var px = 480, hl = 0.5 + 0.5 * Math.sin(t * 7);
    s += '<g transform="translate(' + px + ' ' + f(180 + Math.sin(t * 2) * 4) + ') rotate(' + f(3 + Math.sin(t * 1.3) * 1.5) + ')"><rect x="-84" y="-146" width="176" height="300" rx="20" fill="#000" opacity=".35"/><rect x="-88" y="-150" width="176" height="300" rx="20" fill="#0b0b0d" stroke="#4a4d55" stroke-width="2.5"/><rect x="-78" y="-138" width="156" height="276" rx="11" fill="#fbf7ea"/>';
    s += '<circle cx="0" cy="-92" r="27" fill="#f3e7d0" stroke="' + INK + '" stroke-width="2.6"/>' + txt(0, -84, "؟", 30, "#d8452e", { w: 900 }) + txt(0, -46, "إيه الحكاية؟", 17, INK, { w: 900 });
    s += '<rect x="-56" y="-32" width="112" height="6" rx="3" fill="#b9b3a1"/><rect x="-40" y="-18" width="80" height="6" rx="3" fill="#b9b3a1"/>';
    s += '<rect x="-68" y="4" width="136" height="38" rx="10" fill="' + YEL + '" opacity="' + f2(0.55 + 0.45 * hl) + '" stroke="' + INK + '" stroke-width="2.8"/>' + txt(4, 30, "🔗 اللينك", 18, INK, { w: 900 });
    for (var i = 0; i < 6; i++) s += '<rect x="' + (-72 + (i % 3) * 50) + '" y="' + (58 + Math.floor(i / 3) * 40) + '" width="44" height="34" rx="4" fill="' + ["#5d93ad", "#d9a86a", "#3f8f7a", "#d8452e", "#8a5fb0", "#6a6f7a"][i] + '"/>';
    s += '</g>';
    var ay = Math.abs(Math.sin(t * 5)) * 14;
    if (u > 2.2) s += arrow(330 - ay, 252 + ay * 0.3, 392 - ay, 214 + ay * 0.3, "#d8452e", 9, 1);
    return s + tag("اللينك في البايو", 208, 300, u, 2.3, -3, 24) + sparkle(60, 60, 13, t, 0) + sparkle(360, 60, 12, t, 2) + sparkle(600, 330, 11, t, 4);
  });

  window.__parts = { stage: stage, phone: phone, views: views, guy: guy, kitCard: kitCard, sheet: sheet, tag: tag, coin: coin, sparkle: sparkle };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
