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

  // ── «Wie erkennt der Pfandautomat deine Flasche?» — pieces drawn from the photo of a Tomra T-710 in a German supermarket
  // (see ../refs/SOURCES.md) and from the well-known insides of reverse vending machines ──
  var GRN = "#5bbf6a", IR = "#c03aa8";
  function txt(x, y, s, size, col, anchor, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + size + 'px Noto Sans;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + (size > 20 ? 3 : 2) + ';paint-order:stroke">' + s + '</text>'; }
  function plain(x, y, s, size, col, anchor, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 800) + ' ' + size + 'px Noto Sans;fill:' + (col || INK) + '">' + s + '</text>'; }
  function pulse(t, sp) { return 0.5 + 0.5 * Math.sin(t * (sp || 5)); }
  function badge(x, y, s, w, col, tc) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="' + f(-w / 2) + '" y="-22" width="' + w + '" height="44" rx="12" fill="' + (col || INK) + '" stroke="' + INK + '" stroke-width="3"/><text y="9" text-anchor="middle" style="font:900 24px Noto Sans;fill:' + (tc || YEL) + '">' + s + '</text></g>'; }
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="#e8742e" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50 M-52 92 H52" stroke="#f4f1e8" stroke-width="6" opacity=".9"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f4f1e8" stroke-width="3" stroke-linecap="round"/>';
    if (o.wave) { var wa = Math.sin(t * 7) * 18; s += '<path d="M-44 60 Q-80 30 ' + f(-96 + wa * 0.3) + ' -10" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="' + f(-96 + wa * 0.3) + '" cy="-14" r="11" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>'; }
    if (o.hold) s += '<path d="M44 60 Q74 50 92 30" stroke="#e8742e" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="94" cy="28" r="11" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // a shopper (ball head, blue jacket); o.arm: 0..1 reaching forward
  function shopper(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 2) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-56 140 C-60 56 -38 32 0 32 C38 32 60 56 56 140 Z" fill="#3f6f9f" stroke="' + INK + '" stroke-width="3"/><path d="M0 34 V140" stroke="#2f5873" stroke-width="3"/>';
    s += head(0, -30, 38, mood, t, o.look) + '<path d="M-36 -52 C-30 -78 30 -78 36 -52 C24 -64 -24 -64 -36 -52 Z" fill="#5a3412" stroke="' + INK + '" stroke-width="2"/>';
    var a = o.arm || 0; s += '<path d="M40 60 Q' + f(70 + a * 40) + ' ' + f(56 - a * 10) + ' ' + f(90 + a * 60) + ' ' + f(46 - a * 16) + '" stroke="#3f6f9f" stroke-width="15" fill="none" stroke-linecap="round"/><circle cx="' + f(92 + a * 60) + '" cy="' + f(44 - a * 16) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    return s + '</g>';
  }
  // the supermarket "Leergut" corner: light tiled floor, wall, crates stacked, a price list on the wall
  function shop(t, y) {
    y = y || 300; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#gShop)"/>';
    for (var i = 0; i < 9; i++) s += '<rect x="' + (-380 + i * 170) + '" y="-260" width="120" height="40" rx="6" fill="#fffbe8" opacity="' + f(0.6 + 0.3 * pulse(t + i, 2)) + '"/>';
    s += '<rect x="-400" y="' + y + '" width="1440" height="400" fill="#d9d2c4"/>';
    for (var gx = -400; gx < 1040; gx += 60) s += '<path d="M' + gx + ' ' + y + ' L' + (gx - 40) + ' ' + (y + 120) + '" stroke="#c4bba9" stroke-width="2"/>';
    s += '<path d="M-400 ' + (y + 30) + ' H1040 M-400 ' + (y + 70) + ' H1040" stroke="#c4bba9" stroke-width="2"/>';
    s += '<rect x="560" y="' + (y - 150) + '" width="60" height="80" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>'; for (var l = 0; l < 6; l++) s += '<path d="M568 ' + (y - 136 + l * 11) + ' h44" stroke="#9a958c" stroke-width="2"/>';
    return s;
  }
  // a beer crate (Getränkekasten) in front view with bottle necks showing; n bottles in
  function crate(x, y, s, n, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">';
    for (var i = 0; i < 5; i++) if (i < (n == null ? 5 : n)) g += '<path d="M' + (-48 + i * 24) + ' -46 v-22 c0 -6 4 -8 4 -14 v-10 h6 v10 c0 6 4 8 4 14 v22 Z" fill="url(#gBrown)" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + (-45 + i * 24) + '" y="-96" width="8" height="4" fill="#c9a04e" stroke="' + INK + '" stroke-width="1"/>';
    g += '<path d="M-60 -50 H60 L56 20 H-56 Z" fill="url(#gCrate)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-36" y="-36" width="72" height="14" rx="7" fill="#123a6a" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var k = 0; k < 4; k++) g += '<path d="M' + (-50 + k * 33) + ' -10 v24" stroke="#123a6a" stroke-width="3"/>';
    return g + '</g>';
  }
  // bottles, all drawn upright, neck up, centred on (x, y); ang rotates; o: {s, label 0..1 visible, logo, ir, crushed, scan}
  function barcode(x, y, w, h, o) {
    o = o || {}; var s = '<rect x="' + f(x - 2) + '" y="' + f(y - 2) + '" width="' + f(w + 4) + '" height="' + f(h + 4) + '" fill="#fff"/>', bx = x;
    for (var i = 0; bx < x + w - 1; i++) { var bw = 1 + Math.floor(hash(i * 3.1) * 3) * 0.8; if (i % 2 === 0) s += '<rect x="' + f(bx) + '" y="' + f(y) + '" width="' + f(bw) + '" height="' + h + '" fill="#111"/>'; bx += bw; }
    if (o.scan != null) s += '<rect x="' + f(x - 4) + '" y="' + f(y + h * o.scan - 1) + '" width="' + f(w + 8) + '" height="2.4" fill="#ff2a2a" opacity=".9"/>';
    return s;
  }
  // a generic deposit mark (an arrow looping round a small bottle) — drawn as a simple icon, not the trademark itself
  function pfandMark(x, y, r, o) {
    o = o || {}; var col = o.ir ? IR : "#1c1c1c", s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    if (o.ir) s += '<circle r="' + f(r * 1.6) + '" fill="' + IR + '" opacity=".35" filter="url(#soft2)"/>';
    s += '<circle r="' + r + '" fill="#fff" stroke="' + col + '" stroke-width="' + f(r * 0.1) + '"/><path d="M' + f(-r * 0.62) + ' ' + f(r * 0.3) + ' A' + f(r * 0.66) + ' ' + f(r * 0.66) + ' 0 1 1 ' + f(r * 0.5) + ' ' + f(r * 0.46) + '" stroke="' + col + '" stroke-width="' + f(r * 0.14) + '" fill="none"/><path d="M' + f(r * 0.5) + ' ' + f(r * 0.14) + ' l' + f(r * 0.1) + ' ' + f(r * 0.4) + ' l' + f(-r * 0.38) + ' ' + f(-r * 0.04) + ' Z" fill="' + col + '"/>';
    s += '<path d="M' + f(-r * 0.12) + ' ' + f(r * 0.34) + ' v' + f(-r * 0.4) + ' l' + f(r * 0.05) + ' ' + f(-r * 0.12) + ' v' + f(-r * 0.14) + ' h' + f(r * 0.14) + ' v' + f(r * 0.14) + ' l' + f(r * 0.05) + ' ' + f(r * 0.12) + ' v' + f(r * 0.4) + ' Z" fill="' + col + '"/>';
    return s + '</g>';
  }
  function pet(x, y, ang, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.crushed) return s + '<path d="M-22 -60 L22 -56 L26 -30 L10 -24 L28 0 L18 30 L24 60 L-20 62 L-28 40 L-12 20 L-30 -4 L-14 -30 Z" fill="url(#gPet)" stroke="' + INK + '" stroke-width="2"/><rect x="-6" y="-74" width="12" height="12" rx="2" fill="#2f7fd8" stroke="' + INK + '" stroke-width="1.4"/></g>';
    s += '<path d="M-7 -96 h14 v10 h-14 Z" fill="#2f7fd8" stroke="' + INK + '" stroke-width="1.6"/><path d="M-8 -86 h16 v6 C8 -64 26 -58 26 -40 V60 C26 70 20 74 12 74 H-12 C-20 74 -26 70 -26 60 V-40 C-26 -58 -8 -64 -8 -80 Z" fill="url(#gPet)" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<path d="M-20 -30 V50" stroke="#fff" stroke-width="4" opacity=".7"/><path d="M-26 66 C-14 70 14 70 26 66" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".5"/>';
    if (o.label !== false) { s += '<rect x="-26" y="-6" width="52" height="40" fill="#e2523a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-26 4 H26" stroke="#fff" stroke-width="3"/>' + barcode(-12, 14, 22, 14, { scan: o.scan }); if (o.logo !== false) s += pfandMark(17, 6, 7, { ir: o.ir }); }
    return s + '</g>';
  }
  function glass(x, y, ang, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-7" y="-100" width="14" height="8" rx="2" fill="#c9a04e" stroke="' + INK + '" stroke-width="1.4"/><path d="M-6 -92 h12 v26 C6 -52 22 -44 22 -24 V64 C22 70 18 74 12 74 H-12 C-18 74 -22 70 -22 64 V-24 C-22 -44 -6 -52 -6 -66 Z" fill="url(#gBrown)" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<path d="M-16 -20 V56" stroke="#fff" stroke-width="3" opacity=".4"/><rect x="-22" y="0" width="44" height="40" fill="#f4ecd8" stroke="' + INK + '" stroke-width="1.4"/><path d="M-22 12 H22" stroke="#c23a26" stroke-width="3"/>' + barcode(-10, 22, 20, 12, {});
    return s + '</g>';
  }
  function can(x, y, ang, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.crushed) return s + '<path d="M-26 -14 L26 -14 L30 -4 L22 4 L30 10 L26 16 L-26 16 L-30 8 L-22 2 L-30 -6 Z" fill="url(#gCan)" stroke="' + INK + '" stroke-width="2"/></g>';
    s += '<path d="M-20 -56 h40 l4 6 v100 l-4 6 h-40 l-4 -6 v-100 Z" fill="url(#gCan)" stroke="' + INK + '" stroke-width="2.2"/><path d="M-24 -48 H24 M-24 48 H24" stroke="#d9dee3" stroke-width="3"/><path d="M-12 -30 V30" stroke="#fff" stroke-width="3" opacity=".5"/>';
    s += '<rect x="-14" y="10" width="20" height="16" fill="#fff"/>' + barcode(-12, 12, 16, 12, {}) + pfandMark(12, -10, 7, { ir: o.ir });
    return s + '</g>';
  }
  // the reverse vending machine from the front, after the Tomra T-710 photo: grey niche frame, upper unit with the dark
  // graphic panel (outline bottle + can icons), the curved swoosh round the round bottle opening, a small screen,
  // a green button + bon slot; the lower unit with the green "Kiste einstellen" strip and the crate opening with its belt.
  // o: {s, light 0..1 inside the opening, screen text, bon 0..1 paper out, crate}
  function rvm(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-128" y="-250" width="256" height="520" fill="#9aa0a6" stroke="' + INK + '" stroke-width="2.4"/><rect x="-116" y="-238" width="232" height="500" fill="#6f767c"/>';
    // upper unit
    s += '<rect x="-108" y="-232" width="216" height="232" rx="6" fill="url(#gRvm)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M-100 -226 H100 V-160 C40 -160 -40 -150 -100 -110 Z" fill="url(#gRvmDark)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-86 -176 v-22 l4 -6 v-8 h6 v8 l4 6 v22 Z M-60 -170 v-30 c0 -6 4 -8 4 -14 v-6 h6 v6 c0 6 4 8 4 14 v30 Z M-30 -178 v-24 h14 v24 Z" fill="none" stroke="#e9ecef" stroke-width="2"/>';
    s += '<path d="M-104 -60 C-104 -120 -40 -148 30 -130 C10 -110 4 -60 20 -24 H-104 Z" fill="#d9dee3" stroke="' + INK + '" stroke-width="1.6"/>';
    var lt = o.light == null ? 0.5 : o.light;
    s += '<circle cx="-50" cy="-80" r="40" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/><circle cx="-50" cy="-80" r="30" fill="#2b3a2e"/><circle cx="-50" cy="-80" r="28" fill="#8fe0a0" opacity="' + f(0.2 + 0.5 * lt) + '" filter="url(#soft2)"/><path d="M-72 -74 h44" stroke="#3a3f46" stroke-width="3"/>';
    if (o.inBottle) s += o.inBottle;
    s += '<rect x="34" y="-128" width="64" height="52" rx="4" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.6"/><rect x="40" y="-122" width="52" height="40" fill="#2f6fd8"/>' + (o.screen ? plain(66, -96, o.screen, o.screen.length > 6 ? 9 : 14, "#fff") : '<rect x="50" y="-114" width="12" height="22" fill="#9fd8ff" opacity=".8"/>');
    s += '<rect x="34" y="-68" width="64" height="26" rx="5" fill="#9aa0a6" stroke="' + INK + '" stroke-width="1.4"/><circle cx="48" cy="-55" r="6" fill="' + GRN + '" stroke="' + INK + '" stroke-width="1.2" opacity="' + f(0.6 + 0.4 * pulse(t, 4)) + '"/><rect x="60" y="-57" width="32" height="4" rx="2" fill="#1c1c1c"/>';
    if (o.bon) s += '<rect x="64" y="-55" width="24" height="' + f(60 * o.bon) + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="1.2"/>' + (o.bon > 0.6 ? plain(76, -38 + 50 * o.bon - 30, "€", 9) : "");
    s += '<rect x="40" y="-20" width="34" height="12" rx="6" fill="#4a4f55" stroke="' + INK + '" stroke-width="1"/>';
    // lower unit
    s += '<rect x="-100" y="4" width="200" height="256" rx="4" fill="url(#gRvm)" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<rect x="-70" y="40" width="140" height="20" rx="10" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.4"/>' + plain(-30, 54, "Kiste einstellen", 9, "#5bff7a");
    s += '<path d="M-78 86 H78 V230 H-78 Z" fill="#9aa0a6" stroke="' + INK + '" stroke-width="1.6"/><path d="M-66 96 H66 V214 H-66 Z" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var b = 0; b < 6; b++) s += '<path d="M' + f(-60 + ((b * 22 + t * 30) % 120)) + ' 200 v12" stroke="#4a4f55" stroke-width="3"/>';
    if (o.crate) s += crate(0, 196, 0.85, 5, t);
    return s + '</g>';
  }
  // inside the machine, side cut: the bottle lies on rollers that spin it, the camera ring scans it, then a flap sends it to
  // the press (one-way) or the crate belt (refillable). o: {pos 0..1 along the line, kind "pet"|"glass"|"can", spin, cams, flash,
  // route "press"|"crate"|"back", ir, scan, weigh}
  function inside(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">';
    s += '<rect x="-300" y="-150" width="600" height="300" rx="12" fill="#e9ecef" stroke="' + INK + '" stroke-width="2.6"/><rect x="-300" y="-150" width="600" height="300" rx="12" fill="url(#gRvm)" opacity=".25"/>';
    s += '<circle cx="-280" cy="-20" r="34" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/>';
    // rollers
    for (var r = 0; r < 7; r++) { var rx = -240 + r * 36; s += '<g transform="translate(' + rx + ' 30) rotate(' + f(t * 500) + ')"><circle r="12" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><path d="M-10 0 H10" stroke="#c9ced4" stroke-width="2.4"/></g>'; }
    if (o.weigh) s += '<rect x="-250" y="46" width="260" height="10" fill="#c9a04e" stroke="' + INK + '" stroke-width="1.4"/><path d="M-120 56 v20 M-140 76 h40" stroke="' + INK + '" stroke-width="3"/>';
    // camera ring (seen from the side as an arch over the bottle) with cameras top, back and below
    var cx = -120;
    s += '<path d="M' + (cx - 60) + ' 60 V-80 C' + (cx - 60) + ' -110 ' + (cx + 60) + ' -110 ' + (cx + 60) + ' -80 V60" stroke="#3a3f46" stroke-width="12" fill="none"/>';
    [[cx - 60, -40, 0], [cx, -102, 90], [cx + 60, -40, 180], [cx - 60, 30, 0], [cx + 60, 30, 180]].forEach(function (c, k) {
      s += '<g transform="translate(' + c[0] + ' ' + c[1] + ') rotate(' + c[2] + ')"><rect x="-10" y="-9" width="20" height="18" rx="3" fill="#2b2e33" stroke="' + INK + '" stroke-width="1.4"/><circle cx="10" cy="0" r="6" fill="#4a8fd8" stroke="' + INK + '" stroke-width="1.2"/>' + (o.flash && Math.sin(t * 30 + k * 1.3) > 0.2 ? '<path d="M14 -4 L80 -20 L80 20 L14 4 Z" fill="' + (o.ir ? IR : "#fffbd0") + '" opacity=".35"/>' : '') + '</g>';
    });
    // flap + press + crate belt
    s += '<path d="M60 40 L120 40" stroke="#5a6068" stroke-width="6"/>';
    var flap = o.route === "crate" ? 18 : o.route === "press" ? -24 : 0; s += '<path d="M120 40 l' + f(46 * Math.cos(flap * Math.PI / 180)) + ' ' + f(46 * Math.sin(flap * Math.PI / 180) + 8) + '" stroke="#e2b035" stroke-width="7" stroke-linecap="round"/>';
    s += '<g transform="translate(220 -40)"><rect x="-52" y="-60" width="104" height="130" rx="8" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.2"/>' + plain(0, -44, "Presse", 13);
    for (var p = 0; p < 2; p++) { var pr = '<g transform="translate(' + (p ? 18 : -18) + ' 6) rotate(' + f((p ? -1 : 1) * t * 400) + ')"><circle r="16" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>'; for (var k2 = 0; k2 < 8; k2++) pr += '<path d="M0 -16 l3 -6 l3 6" fill="#8a929c" stroke="' + INK + '" stroke-width=".8" transform="rotate(' + (k2 * 45) + ')"/>'; s += pr + '</g>'; }
    s += '<rect x="-46" y="40" width="92" height="26" rx="4" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.6"/></g>';
    s += '<g transform="translate(230 110)"><path d="M-70 0 H70" stroke="#5a6068" stroke-width="8"/>' + plain(0, 28, "Kasten", 13) + '</g>';
    // the bottle itself
    var pos = o.pos == null ? 0.3 : o.pos, bx = lerp(-250, 90, clamp(pos)), by = 0, rot = 90, drawn = "";
    if (o.route === "back") { bx = lerp(-120, -330, clamp((pos - 0.5) * 2)); if (pos < 0.5) bx = lerp(-250, -120, pos * 2); }
    var kind = o.kind || "pet", spin = o.spin == null ? t * 8 : o.spin;
    var bo = { s: 0.9, scan: o.scan, ir: o.ir, label: o.label, logo: o.logo, crushed: o.crushedIn };
    if (o.route === "press" && pos > 1) { var q = clamp((pos - 1) * 1.5); bx = lerp(90, 220, q); by = lerp(0, -40 + 40 * q, q); }
    if (o.route === "crate" && pos > 1) { var q2 = clamp((pos - 1) * 1.5); bx = lerp(90, 230, q2); by = lerp(0, 80, q2); rot = lerp(90, 0, q2); }
    var g = kind === "glass" ? glass(0, 0, 0, t, bo) : kind === "can" ? can(0, 0, 0, t, bo) : pet(0, 0, 0, t, bo);
    // spinning: the label slides round, drawn as the label offset wobble
    s += '<g transform="translate(' + f(bx) + ' ' + f(by + 4) + ') rotate(' + f(rot) + ') scale(' + f(1 - 0.12 * Math.abs(Math.sin(spin))) + ' 1)">' + g + '</g>';
    if (o.route === "press" && pos > 1.5) for (var c2 = 0; c2 < 4; c2++) s += '<path d="M' + (196 + c2 * 14) + ' ' + f(10 + ((t * 60 + c2 * 9) % 30)) + ' l8 -3 l-2 6 Z" fill="url(#gPet)" stroke="' + INK + '" stroke-width="1"/>';
    return s + '</g>';
  }
  // the camera ring seen from the end: six cameras round the bottle, which spins on its rollers
  function ring(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="130" fill="#e9ecef" stroke="' + INK + '" stroke-width="3"/><circle r="110" fill="#2b2f34" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3 - Math.PI / 2, cx = Math.cos(a) * 112, cy = Math.sin(a) * 112, on = Math.sin(t * 24 + k * 1.7) > 0;
      s += (on ? '<path d="M' + f(cx) + ' ' + f(cy) + ' L' + f(Math.cos(a + 0.25) * 30) + ' ' + f(Math.sin(a + 0.25) * 30) + ' L' + f(Math.cos(a - 0.25) * 30) + ' ' + f(Math.sin(a - 0.25) * 30) + ' Z" fill="' + (o.ir ? IR : "#fffbd0") + '" opacity=".35"/>' : '') + '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(a * 57.3 + 180) + ')"><rect x="-14" y="-12" width="22" height="24" rx="3" fill="#1c1c1c" stroke="#5a6068" stroke-width="1.4"/><circle cx="8" cy="0" r="7" fill="#4a8fd8" stroke="#1c1c1c"/></g>'; }
    s += '<g transform="rotate(' + f(t * 300) + ')"><circle r="40" fill="url(#gPet)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 0 A40 40 0 0 1 0 -40 L0 -28 A28 28 0 0 0 -28 0 Z" fill="#e2523a" stroke="' + INK + '" stroke-width="1.4"/><circle r="10" fill="#2f7fd8" stroke="' + INK + '" stroke-width="1.4"/></g>';
    [[-30, 60], [30, 60]].forEach(function (r) { s += '<g transform="translate(' + r[0] + ' ' + r[1] + ') rotate(' + f(-t * 500) + ')"><circle r="16" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/><path d="M-12 0 H12" stroke="#c9ced4" stroke-width="2.4"/></g>'; });
    return s + '</g>';
  }
  function bon(x, y, k, t) {   // the deposit receipt
    var h = 150 * clamp(k), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2) * 2) + ')"><rect x="-55" y="0" width="110" height="' + f(h) + '" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2"/>';
    if (h > 40) s += plain(0, 22, "PFANDBON", 13) + '<path d="M-44 30 H44" stroke="' + INK + '" stroke-dasharray="3 3"/>';
    if (h > 80) s += plain(-44, 52, "10 × 0,25", 11, INK, "start", 600) + plain(44, 52, "2,50 €", 11, INK, "end");
    if (h > 120) s += barcode(-40, 104, 80, 22, {});
    return s + '</g>';
  }
  function plant(x, y, t) {   // a bottling line: bottles move through the washer (bubbles), get filled and capped
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-320 60 H320" stroke="#5a6068" stroke-width="10"/>';
    s += '<rect x="-220" y="-90" width="150" height="150" rx="10" fill="#9fd2e8" stroke="' + INK + '" stroke-width="2.4" opacity=".85"/>' + plain(-145, -70, "Waschen", 14);
    for (var b = 0; b < 12; b++) { var u = (t * 0.6 + b / 12) % 1; s += '<circle cx="' + f(-200 + hash(b) * 110) + '" cy="' + f(50 - u * 120) + '" r="' + f(3 + hash(b + 2) * 4) + '" fill="#fff" opacity="' + f(1 - u) + '"/>'; }
    s += '<rect x="40" y="-100" width="90" height="60" rx="8" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.2"/><path d="M85 -40 v30" stroke="#c9a04e" stroke-width="6"/>' + plain(85, -76, "Füllen", 13);
    for (var i = 0; i < 7; i++) { var bx = ((i * 100 + t * 70) % 700) - 330, full = bx > 85 ? 1 : 0; s += glass(bx, 6, 0, t, { s: 0.6 }) + (full ? '<rect x="' + f(bx - 12) + '" y="-12" width="24" height="44" fill="#e2a12c" opacity=".5"/>' : ''); }
    return s + '</g>';
  }
  function norway(x, y, w) { var h = w * 0.73; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect width="' + w + '" height="' + f(h) + '" fill="#ba0c2f" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(w * 0.27) + '" width="' + f(w * 0.18) + '" height="' + f(h) + '" fill="#fff"/><rect y="' + f(h * 0.4) + '" width="' + w + '" height="' + f(h * 0.2) + '" fill="#fff"/><rect x="' + f(w * 0.31) + '" width="' + f(w * 0.1) + '" height="' + f(h) + '" fill="#00205b"/><rect y="' + f(h * 0.45) + '" width="' + w + '" height="' + f(h * 0.1) + '" fill="#00205b"/></g>'; }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function bottleIn(k, t) { return '<g transform="translate(' + f(-50 + 60 * (1 - k)) + ' -80) rotate(90) scale(' + f(0.5 - 0.15 * k) + ')" opacity="' + f(1 - k * 0.6) + '">' + pet(0, 0, 0, t, {}) + '</g>'; }

  // 0 — you push a bottle in, a second later it counts 25 cents
  shot(0, function (u, d) { var k = ease(u / d); return [lerp(300, 330, k), lerp(170, 150, k), lerp(0.95, 1.2, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.6) / 1.4), s = shop(t, 320) + rvm(330, 160, t, { s: 0.62, light: 0.4 + 0.6 * k, screen: u > 2.6 ? "0,25 €" : "", inBottle: k < 1 ? bottleIn(k, t) : "" });
    return s + shopper(150, 200, t, u > 2.6 ? "happy" : "n", { s: 0.65, arm: 1 - k }) + (u > 2.6 ? tag("25 Cent!", 470, 80, u, 2.6, 3, 24) : "");
  });
  // 1 — but how does it know it's a deposit bottle?
  shot(1, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = shop(t, 320) + rvm(420, 160, t, { s: 0.55, light: pulse(t, 3) }) + pet(200, 160, Math.sin(t * 2) * 10, t, { s: 1.1 });
    return s + qmark(280, 80, t, 54) + qmark(120, 100, t, 40) + tag("Pfand?", 200, 300, u, 0.6, -3, 24);
  });
  // 2 — and why does it spit some bottles back out?
  shot(2, function (u, d) { return [320, 170, lerp(1.05, 1.0, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.2), s = shop(t, 320) + rvm(420, 160, t, { s: 0.55, light: 0.3, screen: k > 0.5 ? "Nein!" : "" });
    s += pet(lerp(390, 220, ease(k)), lerp(110, 230, ease(k)), lerp(90, 200, k), t, { s: 0.7, crushed: true });
    return s + shopper(120, 200, t, k > 0.6 ? "shock" : "n", { s: 0.6 }) + tag("zurück?!", 250, 70, u, 1.2, -3, 22, "#f2a0a0");
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 170, lerp(1.0, 0.94, u / d)]; }, function (u, d, t) {
    var s = shop(t, 320) + rvm(470, 160, t, { s: 0.55, light: pulse(t, 4) }) + pet(170, 170, Math.sin(t * 3) * 14, t, { s: 0.9 }) + can(260, 190, Math.sin(t * 3 + 1) * 14, t, { s: 0.8 });
    return s + tag("Was steckt dahinter?", 300, 70, u, 0.2, -2, 28);
  });
  // 4 — since 2003 Germany has a deposit on one-way bottles and cans
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pet(200, 180, -8 + Math.sin(t * 2) * 4, t, { s: 1.0 }) + can(330, 200, 6 + Math.sin(t * 2 + 1) * 4, t, { s: 1.0 });
    s += '<g transform="translate(500 170)"><rect x="-62" y="-50" width="124" height="100" rx="10" fill="#fbfaf6" stroke="' + INK + '" stroke-width="2.6"/><rect x="-62" y="-50" width="124" height="26" rx="10" fill="#c23a26" stroke="' + INK + '" stroke-width="2.6"/>' + plain(0, 30, "2003", 34) + '</g>';
    return s + tag("Einweg", 260, 330, u, 0.8, -3, 22);
  });
  // 5 — for each of them you get 25 cents back
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pet(160, 190, Math.sin(t * 2) * 6, t, { s: 0.9 }) + can(260, 205, Math.sin(t * 2 + 1) * 6, t, { s: 0.9 });
    for (var c = 0; c < 3; c++) { var k = clamp((u - 0.3 - c * 0.3) / 0.5); s += '<g transform="translate(' + f(420 + c * 34) + ' ' + f(lerp(-40, 200 - c * 8, ease(k))) + ')"><ellipse rx="34" ry="34" fill="url(#gold)" stroke="' + INK + '" stroke-width="2.6"/>' + plain(0, 9, "25", 22) + '</g>'; }
    return s + badge(460, 70, "0,25 €", 140, INK, YEL);
  });
  // 6 — once it's inside, rollers turn it round and round
  shot(6, function (u, d) { return [lerp(220, 260, u / d), 180, lerp(1.25, 1.15, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + inside(320, 180, t, { pos: 0.3 * clamp(u / 1.2), spin: t * 9 }) + tag("Rollen drehen", 160, 300, u, 0.6, -3, 20) + curl(200, 190, 60, -0.4, 2.6, YEL, 5, 1);
  });
  // 7 — all round, cameras look at the bottle from every side
  shot(7, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + ring(320, 180, t, {}) + tag("Kameras ringsum", 320, 30, u, 0.5, -2, 22);
  });
  // 8 — first they look for the barcode on the label
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(320 170) scale(3.2)">' + barcode(-30, -18, 60, 36, { scan: (t * 0.8) % 1 }) + '</g>';
    return s + tag("Strichcode", 320, 330, u, 0.4, -2, 24);
  });
  // 9 — it tells which bottle it is, and whether it's one-way or refillable
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(150 170) scale(1.6)">' + barcode(-30, -18, 60, 36, { scan: (t * 0.8) % 1 }) + '</g>' + arrow(230, 170, 300, 170, INK, 5, clamp(u / 0.5));
    s += '<g transform="translate(450 170)"><rect x="-130" y="-100" width="260" height="200" rx="12" fill="#1f2328" stroke="' + INK + '" stroke-width="3"/>' + plain(-110, -66, "Cola 0,5 l PET", 17, "#9fd8ff", "start") + plain(-110, -30, "Pfand: 0,25 €", 17, YEL, "start");
    var k = clamp((u - 0.8) / 0.5); s += '<g opacity="' + f(k) + '"><rect x="-110" y="0" width="100" height="36" rx="8" fill="' + GRN + '" stroke="' + INK + '" stroke-width="2"/>' + plain(-60, 25, "Einweg", 16) + '<rect x="10" y="0" width="100" height="36" rx="8" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/>' + plain(60, 25, "Mehrweg", 16, "#c9ced4") + '</g></g>';
    return s;
  });
  // 10 — then they check the deposit mark with the arrow and the bottle
  shot(10, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pfandMark(320, 170, 90, {});
    return s + tag("Pfandlogo", 320, 330, u, 0.4, -2, 24) + tag("Pfeil + Flasche", 520, 70, u, 1.4, 3, 18);
  });
  // 11 — printed with a special ink the machine recognises in infrared
  shot(11, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var on = u > 1.0, s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + (on ? "#1a0f20" : "#e9e4d8") + '"/>' + pfandMark(320, 170, 90, { ir: on });
    if (on) for (var b = 0; b < 8; b++) { var y0 = 60 + b * 30 + ((t * 80) % 30); s += '<path d="M60 ' + f(y0) + ' H580" stroke="' + IR + '" stroke-width="2" opacity=".25"/>'; }
    return s + tag("Spezialfarbe", 140, 60, u, 0.3, -3, 20) + tag("Infrarot!", 500, 320, u, 1.2, 3, 22, "#e9a0d8");
  });
  // 12 — so nobody can just copy a logo onto any bottle
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1a0f20"/>' + pfandMark(200, 170, 70, { ir: true }) + '<g opacity=".9">' + pfandMark(450, 170, 70, {}) + '</g>';
    s += txt(200, 290, "echt", 22, GRN) + txt(450, 290, "Kopie", 22, "#ff7a7a");
    var k = clamp((u - 0.8) / 0.4); s += '<path d="M390 110 L510 230 M510 110 L390 230" stroke="#ff3b2f" stroke-width="' + f(12 * k) + '" stroke-linecap="round" opacity="' + f(k) + '"/>';
    return s;
  });
  // 13 — at the same time it measures the shape, and many machines weigh the bottle too
  shot(13, function (u, d) { return [300, 180, lerp(1.1, 1.18, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + inside(320, 180, t, { pos: 0.4, spin: t * 9, weigh: true, flash: true });
    s += '<path d="M150 150 C150 140 260 140 260 150 V210 C260 220 150 220 150 210 Z" fill="none" stroke="' + GRN + '" stroke-width="3" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 30) + '"/>';
    return s + tag("Form", 140, 80, u, 0.3, -3, 20) + tag("Gewicht", 220, 300, u, 1.4, 3, 20);
  });
  // 14 — crushed or no label: it finds nothing and the bottle comes back
  shot(14, function (u, d) { return [lerp(280, 220, u / d), 180, 1.15]; }, function (u, d, t) {
    var s = graphPaper(t) + inside(320, 180, t, { pos: clamp(u / (d - 0.4)), route: "back", spin: t * 9, label: false, crushedIn: true, flash: u < 1.6 });
    return s + tag("kein Etikett", 140, 60, u, 0.4, -3, 20, "#f2a0a0") + tag("zurück!", 120, 320, u, 1.8, 3, 22, "#f2a0a0");
  });
  // 15 — if everything fits, a computer decides in a split second where it goes
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(220 180)"><rect x="-100" y="-80" width="200" height="140" rx="10" fill="#1f2328" stroke="' + INK + '" stroke-width="3"/><rect x="-86" y="-66" width="172" height="100" fill="#0f2a3a"/>';
    var rows = ["Strichcode ✓", "Pfandlogo ✓", "Form ✓", "Gewicht ✓"]; for (var r = 0; r < 4; r++) if (u > 0.3 + r * 0.35) s += plain(-74, -40 + r * 22, rows[r], 14, GRN, "start");
    s += '<rect x="-30" y="60" width="60" height="30" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/></g>';
    s += arrow(340, 150, 520, 80, YEL, 6, clamp((u - 1.8) / 0.4)) + arrow(340, 210, 520, 280, "#9fd8ff", 6, clamp((u - 1.8) / 0.4));
    return s + plain(560, 70, "Presse", 18) + plain(560, 300, "Kasten", 18) + tag("0,1 s", 220, 320, u, 1.6, -3, 22);
  });
  // 16 — one-way bottles and cans land in a press and get squashed flat
  shot(16, function (u, d) { return [lerp(360, 420, u / d), 160, lerp(1.2, 1.4, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + inside(320, 180, t, { pos: 0.8 + 0.9 * clamp(u / (d - 0.4)), route: "press", spin: t * 9 }) + tag("platt!", 540, 40, u, 1.2, 3, 22);
  });
  // 17 — the plastic is shredded later and recycled into new bottles
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + pet(110, 180, 20, t, { s: 0.8, crushed: true }) + arrow(160, 180, 220, 180, INK, 4, 1);
    for (var f2 = 0; f2 < 26; f2++) { var fx = 260 + hash(f2) * 90, fy = 150 + hash(f2 + 3) * 70 + Math.sin(t * 4 + f2) * 3; s += '<path d="M' + f(fx) + ' ' + f(fy) + ' l7 -2 l-1 6 Z" fill="url(#gPet)" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += arrow(370, 180, 430, 180, INK, 4, clamp((u - 0.8) / 0.4)) + (u > 1.2 ? pet(500, 170, 0, t, { s: 0.9 }) : "");
    return s + tag("Schreddern", 300, 300, u, 0.4, -3, 18) + tag("neue Flasche", 500, 60, u, 1.4, 3, 18, "#bde8b0");
  });
  // 18 — refillable bottles go whole into a crate
  shot(18, function (u, d) { return [lerp(360, 420, u / d), 200, lerp(1.2, 1.35, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + inside(320, 180, t, { kind: "glass", pos: 0.8 + 0.9 * clamp(u / (d - 0.4)), route: "crate", spin: t * 9 }) + crate(560, 330, 0.7, 4, t) + tag("heil!", 470, 60, u, 0.8, 3, 22, "#bde8b0");
  });
  // 19 — they go back to the bottler, get washed and refilled
  shot(19, function (u, d) { return [lerp(280, 360, u / d), 180, 1.0]; }, function (u, d, t) {
    return '<rect x="-400" y="-300" width="1440" height="960" fill="#e9eef2"/>' + plant(320, 200, t) + tag("zurück zum Abfüller", 300, 40, u, 0.3, -2, 20);
  });
  // 20 — a refillable glass bottle can do that up to 50 times
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + glass(200, 180, Math.sin(t * 2) * 5, t, { s: 1.3 }) + curl(200, 180, 110, -0.6, 4.6, GRN, 6, 1);
    var n = Math.round(50 * clamp((u - 0.4) / 1.6)); return s + badge(470, 170, n + " ×", 150, INK, YEL);
  });
  // 21 — less deposit for those: 8 cents for glass, 15 for plastic
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + glass(180, 170, Math.sin(t * 2) * 4, t, { s: 1.0 }) + pet(440, 170, Math.sin(t * 2 + 1) * 4, t, { s: 1.0, logo: false });
    return s + badge(180, 320, "8 Cent", 130, INK, YEL) + badge(440, 320, "15 Cent", 130, INK, "#bfe0ff") + tag("Mehrweg", 320, 40, u, 0.3, -2, 22);
  });
  // 22 — at the end the machine prints your deposit receipt
  shot(22, function (u, d) { var k = ease(u / d); return [lerp(330, 360, k), lerp(150, 120, k), lerp(1.3, 1.6, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.6), s = shop(t, 320) + rvm(330, 200, t, { s: 0.62, light: 0.4, screen: "2,50 €", bon: k });
    return s + bon(470, 40, k, t) + tag("Pfandbon", 470, 30, u, 1.6, 3, 16);
  });
  // 23 — such machines were invented by two brothers in Norway, 1972
  shot(23, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efe2c4"/><rect x="-400" y="-300" width="1440" height="960" fill="#c9a04e" opacity=".12"/>' + norway(470, 50, 120);
    s += shopper(180, 200, t, "happy", { s: 0.7 }) + engineer(320, 200, t, "curious", { s: 0.7 });
    return s + badge(530, 250, "1972", 120, INK, YEL) + tag("2 Brüder", 250, 40, u, 0.6, -3, 22);
  });
  // 24 — their company is called Tomra and still builds most of these machines
  shot(24, function (u, d) { return [320, 170, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = shop(t, 320); for (var m = 0; m < 3; m++) s += rvm(180 + m * 140, 160 + m * 4, t + m, { s: 0.42, light: pulse(t + m, 3) });
    return s + tag("Tomra", 320, 40, u, 0.4, -2, 28) + tag("Marktführer", 320, 330, u, 1.6, 2, 20);
  });
  // 25 — and it works: almost 98 % of one-way bottles come back
  shot(25, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.6), p = 0.98 * k, s = graphPaper(t) + '<g transform="translate(220 180)"><circle r="100" fill="none" stroke="#d9d4c8" stroke-width="40"/>';
    s += '<circle r="100" fill="none" stroke="' + GRN + '" stroke-width="40" stroke-dasharray="' + f(628 * p) + ' 700" transform="rotate(-90)"/>' + plain(0, 14, Math.round(p * 100) + " %", 40) + '</g>';
    for (var b = 0; b < 4; b++) s += pet(440 + b * 40, 180 + Math.sin(t * 3 + b) * 8, Math.sin(t * 2 + b) * 10, t, { s: 0.55 });
    return s + tag("kommen zurück", 480, 320, u, 1.4, 3, 20, "#bde8b0");
  });
  // 26 — so in one second your bottle is turned, photographed, checked and sorted
  shot(26, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + inside(320, 180, t, { pos: (t * 0.5) % 1.6, route: "press", spin: t * 9, flash: true });
    var W = ["gedreht", "fotografiert", "geprüft", "sortiert"]; for (var w = 0; w < 4; w++) s += tag(W[w], 100 + w * 150, 318, u, 0.3 + w * 0.5, w % 2 ? 3 : -3, 16, ["#e8c48e", "#bfe0ff", "#bde8b0", "#f2a0a0"][w]);
    return s;
  });
  // 27 — outro
  shot(27, function (u, d) { return [lerp(300, 340, clamp(u / d)), 170, 1.0]; }, function (u, d, t) {
    var s = shop(t, 320) + rvm(440, 160, t, { s: 0.55, light: pulse(t, 4), screen: "Danke!" }) + pet(260, 120 + Math.sin(t * 3) * 8, Math.sin(t * 2) * 20, t, { s: 0.7 });
    return s + engineer(130, 200, t, "happy", { s: 0.6, wave: true }) + tag("Sagt uns!", 260, 300, u, 0.4, 3, 26);
  });

  window.__parts = { rvm: rvm, pet: pet, glass: glass, can: can, crate: crate, inside: inside, ring: ring, barcode: barcode, pfandMark: pfandMark, bon: bon, shop: shop, tag: tag, engineer: engineer, shopper: shopper, badge: badge };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
