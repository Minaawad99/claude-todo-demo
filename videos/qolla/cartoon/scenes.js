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

  // ── new pieces for this episode: an Egyptian qolla (Qena style: round body, ringed shoulder, tall neck, flared mouth),
  // a zeer on its iron stand, a glazed jar, a slice of the clay wall with its pores, water molecules, a thermometer,
  // the pot-in-pot cooler cut open ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function hotDay(t) {   // a hot summer afternoon: pale sky, a big sun, heat shimmer
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f7e3b0"/><circle cx="560" cy="40" r="' + f(70 + 6 * Math.sin(t * 2)) + '" fill="url(#gHot)"/><circle cx="560" cy="40" r="30" fill="#fff2b0"/>';
    for (var k = 0; k < 6; k++) { var y = 260 + k * 14, o = (t * 40 + k * 30) % 80; s += '<path d="M' + f(-40 + o) + ' ' + y + ' q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35"/>'; }
    return s; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // the qolla, foot at (x,y), 200 tall at s=1; o: {s, wet 0..1 (dark damp clay + beads of water), glaze, vapor, t, tilt}
  function qolla(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + (o.s || 1) + ')">';
    var body = 'M-22 -186 C-22 -166 -24 -152 -32 -142 C-72 -128 -70 -22 -40 -8 C-20 2 20 2 40 -8 C70 -22 72 -128 32 -142 C24 -152 22 -166 22 -186 L31 -200 L-31 -200 Z';
    s += '<ellipse cx="4" cy="2" rx="52" ry="8" fill="#000" opacity=".18"/>';
    s += '<path d="' + body + '" fill="' + (o.glaze ? "url(#gGlaze)" : "url(#gClay)") + '" stroke="' + INK + '" stroke-width="2.6"/>';
    if (!o.glaze && o.wet) s += '<path d="' + body + '" fill="url(#gClayW)" opacity="' + f(0.75 * o.wet) + '"/>';
    s += '<path d="M-58 -112 Q0 -100 58 -112 M-62 -84 Q0 -72 62 -84 M-26 -160 Q0 -156 26 -160" stroke="' + (o.glaze ? "#bfe0ff" : "#7a3a1a") + '" stroke-width="1.6" fill="none" opacity=".7"/>';
    if (o.glaze) s += '<path d="M-40 -60 q10 -10 20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/><path d="M-50 -120 C-56 -90 -52 -50 -40 -26" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".45"/>';
    else s += '<path d="M-48 -118 C-54 -90 -50 -52 -38 -30" stroke="#ffd8b8" stroke-width="5" stroke-linecap="round" opacity=".3"/>';
    s += '<ellipse cx="0" cy="-200" rx="31" ry="6" fill="#3a1a0a" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-199" rx="20" ry="3.4" fill="#2f7fd8" opacity=".6"/>';
    if (!o.glaze && o.wet && o.t != null) for (var k = 0; k < 14; k++) {   // beads of water sweating out and sliding down
      var u = (o.t * (0.12 + hash(k) * 0.1) + hash(k + 7)) % 1, ax = -48 + hash(k + 3) * 96, ay = -130 + u * 110, r = (2 + hash(k) * 2.4) * (0.4 + 0.6 * Math.sin(Math.PI * u));
      var wx = ax * (1 - Math.pow((ay + 70) / 80, 2) * 0.25);
      s += '<ellipse cx="' + f(wx) + '" cy="' + f(ay) + '" rx="' + f(r * o.wet) + '" ry="' + f(r * 1.3 * o.wet) + '" fill="#bfe8ff" stroke="#5a8aa8" stroke-width=".6" opacity=".9"/><circle cx="' + f(wx - r * 0.3) + '" cy="' + f(ay - r * 0.4) + '" r="' + f(r * 0.3 * o.wet) + '" fill="#fff"/>';
    }
    if (o.vapor && o.t != null) s += vapor(0, -110, o.t, 70, o.vapor);
    return s + '</g>'; }
  function vapor(x, y, t, w, k) {   // wisps of vapour rising off a surface
    var s = ""; for (var i = 0; i < 7; i++) { var u = (t * 0.35 + i / 7) % 1, xx = x - w + (i / 6) * 2 * w + Math.sin(t * 2 + i) * 8; s += '<path d="M' + f(xx) + ' ' + f(y - u * 90) + ' q8 -12 0 -24 t0 -24" stroke="#fff" stroke-width="' + f(4 * (1 - u)) + '" fill="none" stroke-linecap="round" opacity="' + f(0.7 * k * Math.sin(Math.PI * u)) + '"/>'; } return s; }
  // the zeer on its iron stand, with a wooden lid and a tin cup
  function zeer(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-58 0 L-40 -150 M58 0 L40 -150 M-46 -40 H46 M-42 -110 H42" stroke="url(#gIron)" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="-150" rx="58" ry="10" fill="none" stroke="#3a3f46" stroke-width="6"/>';
    var body = 'M-36 -276 C-40 -260 -70 -240 -72 -190 C-74 -130 -40 -80 0 -62 C40 -80 74 -130 72 -190 C70 -240 40 -260 36 -276 Z';
    s += '<path d="' + body + '" fill="url(#gClay)" stroke="' + INK + '" stroke-width="2.6"/>' + (o.wet ? '<path d="' + body + '" fill="url(#gClayW)" opacity="' + f(0.7 * o.wet) + '"/>' : '');
    s += '<path d="M-66 -220 Q0 -206 66 -220 M-70 -180 Q0 -166 70 -180" stroke="#7a3a1a" stroke-width="1.6" fill="none" opacity=".7"/><path d="M-50 -230 C-60 -190 -50 -140 -30 -110" stroke="#ffd8b8" stroke-width="6" stroke-linecap="round" opacity=".3"/>';
    s += '<ellipse cx="0" cy="-278" rx="44" ry="9" fill="#8a5a30" stroke="' + INK + '" stroke-width="2.4"/><rect x="-6" y="-292" width="12" height="12" rx="3" fill="#6a4020" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<g transform="translate(46 -270)"><path d="M0 0 h22 l-3 26 h-16 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><path d="M22 6 q10 2 0 14" stroke="' + INK + '" stroke-width="1.6" fill="none"/></g>';
    if (o.wet && o.t != null) for (var k = 0; k < 6; k++) { var u = (o.t * 0.4 + k / 6) % 1, dx = -20 + hash(k) * 40; s += '<ellipse cx="' + f(dx * (1 - u)) + '" cy="' + f(lerp(-80, -10, u)) + '" rx="2.6" ry="3.6" fill="#bfe8ff" stroke="#5a8aa8" stroke-width=".6" opacity="' + f(1 - u * 0.6) + '"/>'; }
    return s + '</g>'; }
  function thermo(x, y, v, label, t, col) {   // a thermometer, v 0..1
    var h = 120, lv = clamp(v) * (h - 20), c = col || (v > 0.6 ? RED : BLUE);
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-10" y="' + (-h) + '" width="20" height="' + h + '" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><circle cx="0" cy="8" r="15" fill="' + c + '" stroke="' + INK + '" stroke-width="2.2"/><rect x="-4" y="' + f(-lv) + '" width="8" height="' + f(lv + 6) + '" fill="' + c + '"/>' +
      [0.25, 0.5, 0.75].map(function (k) { return '<path d="M4 ' + f(-k * (h - 20)) + ' h6" stroke="' + INK + '" stroke-width="1.4"/>'; }).join("") + (label ? '<g transform="translate(0 ' + (-h - 22) + ')"><rect x="-36" y="-16" width="72" height="28" rx="7" fill="' + INK + '"/><text y="5" text-anchor="middle" style="font:800 15px Noto Sans Arabic;fill:' + (c === RED ? "#ffb08a" : CY) + '">' + label + '</text></g>' : '') + '</g>'; }
  function glass(x, y, t, fill, o) {   // a glass of water (fill 0..1), cold mist when o.cold
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-26 -80 L-20 0 H20 L26 -80 Z" fill="url(#gCup)" stroke="' + INK + '" stroke-width="2.2"/>';
    var h = 76 * clamp(fill); s += '<path d="M' + f(-20 - 6 * h / 80) + ' ' + f(-h) + ' L-20 -2 H20 L' + f(20 + 6 * h / 80) + ' ' + f(-h) + ' Z" fill="' + CY + '" opacity=".7"/><ellipse cx="0" cy="' + f(-h) + '" rx="' + f(20 + 6 * h / 80) + '" ry="3" fill="#fff" opacity=".6"/>';
    if (o.cold) for (var k = 0; k < 5; k++) { var u = (t * 0.5 + k / 5) % 1; s += '<path d="M' + f(-16 + k * 8) + ' ' + f(-84 - u * 40) + ' q6 -8 0 -16" stroke="#cfefff" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(0.8 * Math.sin(Math.PI * u)) + '"/>'; }
    return s + '</g>'; }
  function pourStream(x0, y0, x1, y1, t) { return '<path d="M' + f(x0) + ' ' + f(y0) + ' Q' + f(x1 + 10) + ' ' + f(y0) + ' ' + f(x1) + ' ' + f(y1) + '" stroke="' + CY + '" stroke-width="7" fill="none" opacity=".8" stroke-dasharray="10 6" stroke-dashoffset="' + f(-t * 60) + '"/>'; }
  // a slice through the clay wall: inside water on the left, air on the right, pores winding through
  function wallSlice(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#cfe9f7"/><rect x="-400" y="-300" width="580" height="960" fill="#3f8fd0"/>';
    s += '<rect x="180" y="-300" width="280" height="960" fill="url(#gClaySec)"/>';
    for (var g = 0; g < 70; g++) s += '<circle cx="' + f(190 + hash(g) * 260) + '" cy="' + f(-20 + hash(g + 9) * 400) + '" r="' + f(2 + hash(g + 4) * 5) + '" fill="#a8582a" opacity=".5"/>';
    var P = [];
    for (var p = 0; p < 6; p++) { var y0 = 10 + p * 62, d = "M180 " + y0; for (var k = 1; k <= 7; k++) d += " L" + (180 + k * 40) + " " + f(y0 + 18 * Math.sin(k * 1.3 + p * 2)); P.push(d); s += '<path d="' + d + '" stroke="#f4e2c8" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="#6a3418" stroke-width="1.4" fill="none" opacity=".4"/>'; }
    if (o.flow) P.forEach(function (d, p) { s += '<path d="' + d + '" stroke="' + BLUE + '" stroke-width="7" fill="none" stroke-linejoin="round" stroke-dasharray="10 14" stroke-dashoffset="' + f(-t * 50 - p * 9) + '" opacity="' + f(o.flow) + '"/>'; });
    if (o.out) for (var b = 0; b < 6; b++) { var y = 10 + b * 62 + 18 * Math.sin(7 * 1.3 + b * 2), r = 6 + 3 * Math.sin(t * 3 + b); s += '<ellipse cx="' + f(466 + r * 0.5) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * 1.2) + '" fill="#bfe8ff" stroke="#5a8aa8" stroke-width="1"/>'; }
    if (o.glaze) s += '<rect x="452" y="-300" width="22" height="960" fill="url(#gGlaze)" stroke="' + INK + '" stroke-width="2"/>';
    return s; }
  // water molecules in a box; speed from a fixed hash, fast ones red, slow ones blue; esc: fast ones leave the surface
  function molecules(x, y, w, h, t, o) {
    o = o || {}; var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#3f8fd0" opacity=".25" stroke="' + BLUE + '" stroke-width="2"/>';
    for (var i = 0; i < 36; i++) {
      var sp = hash(i * 3 + 1), fast = sp > 0.72, px = (hash(i) * w + t * (20 + sp * 120) * (i % 2 ? 1 : -1)) % (2 * w), py = (hash(i + 5) * h + t * (15 + sp * 90)) % (2 * h);
      px = px < 0 ? px + 2 * w : px; py = py < 0 ? py + 2 * h : py; px = px > w ? 2 * w - px : px; py = py > h ? 2 * h - py : py;
      var cx = x + px, cy = y + py, col = fast ? RED : sp > 0.4 ? "#b88ad8" : BLUE;
      if (o.esc && fast) { var e = clamp((o.esc - hash(i + 2) * 0.5) / 0.6); cy = lerp(cy, y - 30 - hash(i) * 80 - (t * 40 % 60), e); cx += Math.sin(t * 3 + i) * 10 * e; if (o.hide && e > 0.98) continue; }
      if (o.slow && fast) continue;
      s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="7" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(cx - 5) + '" cy="' + f(cy - 5) + '" r="3" fill="#fff"/><circle cx="' + f(cx + 5) + '" cy="' + f(cy - 5) + '" r="3" fill="#fff"/>';
      if (fast) s += '<path d="M' + f(cx - 10) + ' ' + f(cy) + ' h-10 M' + f(cx - 10) + ' ' + f(cy + 4) + ' h-6" stroke="' + RED + '" stroke-width="1.6" opacity=".6"/>';
    }
    return s; }
  function windowFrame(t, o) {   // an old wooden window, shutters open, the street outside
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9d6b4"/><rect x="120" y="20" width="400" height="250" fill="#bfe0f2"/>' + city(t, 200, 70, "#d9c3a2", "#fff6d8", 5, false).replace(/x="-?\d+/g, function (m) { return m; });
    s += '<rect x="110" y="10" width="420" height="270" fill="none" stroke="#6a4020" stroke-width="16"/><rect x="80" y="270" width="480" height="24" rx="4" fill="#8a5a30" stroke="' + INK + '" stroke-width="2"/>';
    s += '<g transform="translate(110 10) skewY(' + f(8 + 2 * Math.sin(t)) + ')"><rect x="-70" y="0" width="70" height="270" fill="#5a8a6a" stroke="' + INK + '" stroke-width="2"/></g><g transform="translate(530 10) skewY(' + f(-8 - 2 * Math.sin(t)) + ')"><rect x="0" y="0" width="70" height="270" fill="#5a8a6a" stroke="' + INK + '" stroke-width="2"/></g>';
    return s; }
  function breeze(t, y0, y1, n, op) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 0.5 + i / n) % 1, y = lerp(y0, y1, hash(i)); s += '<path d="M' + f(lerp(-60, 660, u)) + ' ' + f(y) + ' q20 -8 40 0 t40 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f((op || 0.8) * Math.sin(Math.PI * u)) + '"/>'; } return s; }
  function person(x, y, t, mood, o) {   // a ball-head person, shirt colour o.col
    o = o || {}; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="' + (o.col || "#3a7ab8") + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 38, mood, t, o.look || 0) + (o.extra || '') + '</g>'; }
  function tomato(x, y, r, rot) { return rot > 0.5 ? '<path d="M' + f(x - r) + ' ' + f(y) + ' q' + f(r) + ' ' + f(-r * 0.9) + ' ' + f(2 * r) + ' 0 q' + f(-r) + ' ' + f(r * 0.6) + ' ' + f(-2 * r) + ' 0 Z" fill="url(#gRot)" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y - r * 0.2) + '" r="' + f(r * 0.25) + '" fill="#6a8a3a" opacity=".7"/>' : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="url(#gTomato)" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x - 8) + ' ' + f(y - r + 2) + ' l8 4 l8 -4 l-4 8 Z" fill="#4a8a3a" stroke="' + INK + '" stroke-width="1.2"/>'; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — in the heat you drink from the qolla and the water's cold as if from the fridge
  shot(0, function (u, d) { return [320, 170, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 2.2), s = hotDay(t) + '<rect x="-400" y="250" width="1440" height="400" fill="#c9a074"/><rect x="-400" y="250" width="1440" height="10" fill="#8a5a30"/>';
    s += qolla(250, 256, t, { s: 1.05, wet: 1, t: t, tilt: lerp(0, -38, ease(clamp(u / 0.8))) * (1 - ease(clamp((u - 2.6) / 0.6))) });
    if (u > 0.6 && u < 2.8) s += pourStream(170, 66, 380, 160, t);
    s += glass(390, 250, t, k * 0.85, { cold: k > 0.5, s: 1.1 }) + thermo(540, 230, 0.85, "٤٠°", t) + thermo(470, 230, lerp(0.85, 0.3, clamp((u - 1.4) / 1.2)), "", t, lerp(0, 1, clamp((u - 1.4) / 1.2)) > 0.5 ? BLUE : RED);
    return s + tag("ساقعة!", 400, 70, u, 2.6, 3, 19);
  });
  // 1 — how, when the qolla has no electricity and no motor?
  shot(1, function (u, d) { return [320, 180, lerp(1.05, 1.0, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + qolla(320, 300, t, { s: 1.2, wet: 1, t: t });
    s += '<g transform="translate(150 150) rotate(' + f(8 * Math.sin(t * 2)) + ')"><rect x="-20" y="-14" width="40" height="30" rx="6" fill="#e9ecef" stroke="' + INK + '" stroke-width="2"/><path d="M-10 -14 v-14 M10 -14 v-14" stroke="' + INK + '" stroke-width="4"/><path d="M0 16 C0 50 -30 50 -40 80" stroke="' + INK + '" stroke-width="4" fill="none"/></g>';
    s += '<g transform="translate(500 160) rotate(' + f(t * 90) + ')"><circle r="30" fill="url(#gIron)" stroke="' + INK + '" stroke-width="2"/><path d="M0 -26 V26 M-26 0 H26" stroke="#c9ced4" stroke-width="5"/></g>';
    var x = clamp((u - 0.8) / 0.4); s += '<path d="M120 120 l60 60 M180 120 l-60 60 M470 130 l60 60 M530 130 l-60 60" stroke="' + RED + '" stroke-width="9" stroke-linecap="round" opacity="' + f(x) + '"/>';
    return s + qmark(320, 70, t, 54) + tag("كهربا؟", 150, 260, u, 0.3, -3, 16) + tag("موتور؟", 500, 260, u, 0.6, 3, 16);
  });
  // 2 — and why does a painted qolla not cool at all?
  shot(2, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + qolla(210, 300, t, { s: 1.05, wet: 1, t: t, vapor: 0.8 }) + qolla(430, 300, t, { s: 1.05, glaze: true, tilt: 2 * Math.sin(t * 3) });
    s += thermo(110, 240, lerp(0.7, 0.35, clamp(u / 2)), "", t) + thermo(540, 240, 0.75 + 0.03 * Math.sin(t * 4), "", t, RED);
    return s + qmark(430, 70, t, 54) + tag("مدهونة", 430, 330, u, 0.4, 3, 16) + tag("فخار", 210, 330, u, 0.2, -3, 16);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return hotDay(t) + '<rect x="-400" y="270" width="1440" height="400" fill="#c9a074"/>' + qolla(320, 276, t, { s: 1.1, wet: 1, t: t, vapor: 0.6 }) + tag("إيه الحكاية؟", 320, 320, u, 0.1, -3, 26);
  });
  // 4 — clay looks solid, but it's full of tiny pores (zoom into the wall under a lens)
  shot(4, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.4)), s = graphPaper(t) + qolla(170, 300, t, { s: 1.05, wet: 0.6, t: t });
    s += '<circle cx="' + f(lerp(180, 170, k)) + '" cy="200" r="22" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M190 200 L' + f(lerp(200, 330, k)) + ' ' + f(lerp(200, 180, k)) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 5"/>';
    s += '<clipPath id="lens"><circle cx="460" cy="180" r="' + f(140 * k) + '"/></clipPath><g clip-path="url(#lens)"><g transform="translate(160 -10) scale(.8)">' + wallSlice(t, {}) + '</g></g><circle cx="460" cy="180" r="' + f(140 * k) + '" fill="none" stroke="#9aa2ac" stroke-width="10"/>';
    return s + tag("مسام صغيرة!", 460, 340, u, 1.4, 3, 17);
  });
  // 5 — water seeps slowly through those pores until it reaches the outside
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = wallSlice(t, { flow: clamp(u / 0.8), out: u > 1.6 });
    return s + tag("جوة القلة", 90, 40, u, 0.3, -3, 16, "#bfe0ff") + tag("برة", 560, 40, u, 0.6, 3, 16) + tag("بالراحة", 320, 330, u, 1.2, -2, 16);
  });
  // 6 — so the qolla is always wet outside, as if it were sweating
  shot(6, function (u, d) { return [320, lerp(190, 160, u / d), lerp(1.1, 1.45, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + qolla(320, 300, t, { s: 1.3, wet: 1, t: t * 1.6 });
    return s + tag("عرقانة!", 470, 130, u, 0.9, 3, 18);
  });
  // 7 — the water on the surface evaporates into the air
  shot(7, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = hotDay(t) + '<rect x="-400" y="290" width="1440" height="400" fill="#c9a074"/>' + qolla(320, 296, t, { s: 1.2, wet: 1, t: t, vapor: 1 }) + vapor(320, 150, t + 1, 90, 0.8);
    return s + tag("بتتبخر", 480, 80, u, 0.5, 3, 18);
  });
  // 8 — to evaporate it has to take heat from what's around it (red heat arrows from the qolla into the vapour)
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + qolla(320, 310, t, { s: 1.2, wet: 1, t: t, vapor: 0.9 });
    for (var k = 0; k < 6; k++) { var a = -2.6 + k * 0.42, ph = (t * 0.8 + k / 6) % 1, r0 = 50, r1 = 50 + ph * 70; s += '<path d="M' + f(320 + Math.cos(a) * r0 * 1.2) + ' ' + f(200 + Math.sin(a) * r0) + ' L' + f(320 + Math.cos(a) * r1 * 1.2) + ' ' + f(200 + Math.sin(a) * r1) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round" opacity="' + f(1 - ph) + '"/>'; }
    s += thermo(540, 260, lerp(0.7, 0.4, clamp(u / d)), "", t);
    return s + tag("بتاخد حرارة", 140, 80, u, 0.5, -3, 17, "#ffb08a");
  });
  // 9 — inside water, molecules move at different speeds
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/>' + molecules(120, 60, 400, 260, t, {});
    return s + tag("سريعة", 560, 80, u, 0.6, 3, 15, "#ffb08a") + tag("بطيئة", 560, 300, u, 1.2, 3, 15, "#bfe0ff");
  });
  // 10 — the fastest molecules escape and fly off as vapour
  shot(10, function (u, d) { return [320, lerp(190, 150, u / d), lerp(1.0, 0.92, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/>' + molecules(120, 120, 400, 220, t, { esc: u / (d * 0.8) });
    return s + tag("بتفلت!", 520, 40, u, 0.8, 3, 18, "#ffb08a");
  });
  // 11 — leaving the slow ones behind, and slow means colder
  shot(11, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/>' + molecules(90, 90, 380, 240, t * 0.5, { slow: true }) + thermo(560, 280, lerp(0.7, 0.3, clamp(u / 2)), "أسقع", t);
    return s + tag("البطيئة", 280, 40, u, 0.4, -3, 17, "#bfe0ff");
  });
  // 12 — every gram that evaporates takes about 2,400 joules of heat
  shot(12, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / 2), s = graphPaper(t) + '<g transform="translate(200 200) scale(' + f(1 + 0.05 * Math.sin(t * 4)) + ')"><path d="M0 -60 C-20 -30 -40 -6 -40 16 C-40 40 -20 56 0 56 C20 56 40 40 40 16 C40 -6 20 -30 0 -60 Z" fill="url(#gWater)" stroke="' + INK + '" stroke-width="2.6"/><text y="24" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#fff">١ جرام</text></g>' + vapor(200, 130, t, 30, 1 - k * 0.5);
    var j = Math.round(lerp(0, 2400, k)); s += '<g transform="translate(450 180)"><rect x="-110" y="-34" width="220" height="64" rx="14" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="12" text-anchor="middle" style="font:800 28px Noto Sans Arabic;fill:' + YEL + '">' + j.toLocaleString("en") + ' جول</text></g>';
    for (var a = 0; a < 5; a++) { var ph = (t + a / 5) % 1; s += '<path d="M' + f(270 + ph * 60) + ' ' + f(170 + a * 6) + ' h20" stroke="' + RED + '" stroke-width="4" opacity="' + f(1 - ph) + '"/>'; }
    return s;
  });
  // 13 — that's enough to cool half a litre of water by a whole degree
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.6), s = graphPaper(t) + '<g transform="translate(240 300)"><path d="M-40 -170 h80 l6 20 v150 h-92 v-150 Z" fill="url(#gCup)" stroke="' + INK + '" stroke-width="2.4"/><rect x="-44" y="-120" width="88" height="118" fill="' + CY + '" opacity=".6"/><rect x="-16" y="-190" width="32" height="20" rx="4" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2"/><text y="-56" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:#16405e">نص لتر</text></g>';
    s += thermo(420, 280, lerp(0.62, 0.55, k), "", t) + '<g transform="translate(470 120)"><rect x="-70" y="-24" width="140" height="44" rx="10" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:' + CY + '">' + (k > 0.95 ? "- ١ درجة" : "...") + '</text></g>';
    return s + vapor(240, 120, t, 30, 0.6);
  });
  // 14 — over time the water ends up 5 to 10 degrees below the air (two curves on a graph)
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.05, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d - 0.5)), s = graphPaper(t) + '<path d="M90 50 V310 H580" stroke="' + INK + '" stroke-width="3" fill="none"/>', da = "M90 90", dw = "M90 90";
    for (var x = 0; x <= k * 480; x += 6) { da += " L" + f(90 + x) + " " + f(90 + 2 * Math.sin(x * 0.1 + t * 3)); dw += " L" + f(90 + x) + " " + f(90 + 110 * (1 - Math.exp(-x / 150))); }
    s += '<path d="' + da + '" stroke="' + RED + '" stroke-width="4" fill="none"/><path d="' + dw + '" stroke="' + BLUE + '" stroke-width="4" fill="none"/>';
    s += '<text x="560" y="80" text-anchor="end" style="font:800 15px Noto Sans Arabic;fill:' + RED + '">الجو</text><text x="560" y="230" text-anchor="end" style="font:800 15px Noto Sans Arabic;fill:' + BLUE + '">المية</text>';
    if (k > 0.6) s += '<path d="M500 96 V194" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 4"/>' + tag("٥ - ١٠ درجات", 420, 150, u, d * 0.6, -2, 16);
    return s + qolla(150, 300, t, { s: 0.45, wet: 1, t: t });
  });
  // 15 — that's why we put the qolla in the window: the breeze carries the vapour away fast
  shot(15, function (u, d) { return [320, 175, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = windowFrame(t) + qolla(320, 274, t, { s: 0.95, wet: 1, t: t }) + breeze(t, 60, 260, 10, 0.9);
    for (var i = 0; i < 6; i++) { var ph = (t * 0.7 + i / 6) % 1; s += '<path d="M' + f(330 + ph * 220) + ' ' + f(150 - ph * 40 + i * 8) + ' q8 -6 16 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(0.8 * (1 - ph)) + '"/>'; }
    return s + tag("في الشباك", 160, 320, u, 0.5, -3, 17);
  });
  // 16 — in high humidity the air is already full of water, evaporation slows and the cooling drops
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9d3d6"/>';
    for (var i = 0; i < 80; i++) s += '<circle cx="' + f(-100 + hash(i) * 840 + Math.sin(t + i) * 12) + '" cy="' + f(-40 + hash(i + 3) * 420 + Math.cos(t * 0.8 + i) * 10) + '" r="' + f(3 + hash(i + 1) * 4) + '" fill="#fff" opacity=".55"/>';
    s += qolla(320, 300, t, { s: 1.1, wet: 1, t: t * 0.4, vapor: 0.25 }) + thermo(520, 260, 0.62 + 0.02 * Math.sin(t * 3), "رطوبة", t, "#8a929c");
    return s + tag("الهوا شبعان مية", 160, 70, u, 0.6, -3, 16) + tag("التبريد بيقل", 160, 320, u, 2.0, 3, 15, "#ffb08a");
  });
  // 17 — the painted qolla? the paint seals the pores: no sweat, no evaporation
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = wallSlice(t, { flow: 0.9, glaze: true });
    for (var b = 0; b < 6; b++) { var y = 10 + b * 62 + 18 * Math.sin(7 * 1.3 + b * 2); s += '<circle cx="440" cy="' + f(y) + '" r="' + f(6 + 2 * Math.sin(t * 5 + b)) + '" fill="' + BLUE + '" opacity=".8"/>'; }
    if (u > 1.0) s += '<g transform="translate(560 180) scale(' + f(1 + 0.15 * Math.sin(t * 6)) + ')"><path d="M-22 -22 l44 44 M22 -22 l-44 44" stroke="' + RED + '" stroke-width="9" stroke-linecap="round"/></g>';
    return s + tag("الدهان", 470, 340, u, 0.4, 3, 16) + tag("مفيش بخر", 560, 60, u, 1.4, 3, 16, "#ffb08a");
  });
  // 18 — that's what your body does too: sweat evaporates off your skin and cools you
  shot(18, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var cool = clamp((u - 1.4) / 1.2), s = hotDay(t) + person(320, 170 + 5 * Math.sin(t * 3), t, cool > 0.5 ? "happy" : "worry", { col: "#e0584a", s: 1.1, look: Math.sin(t * 1.5) });
    s += '<g transform="translate(400 150) rotate(' + f(25 * Math.sin(t * 7)) + ')"><path d="M0 0 L46 -30 A56 56 0 0 1 56 22 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><path d="M0 0 L50 -6 M0 0 L52 10" stroke="' + INK + '" stroke-width="1.2"/></g>' + breeze(t, 90, 200, 5, 0.7);
    for (var k = 0; k < 6; k++) { var ph = (t * 0.6 + k / 6) % 1; s += '<ellipse cx="' + f(290 + k * 12) + '" cy="' + f(130 + ph * 30) + '" rx="3" ry="4.5" fill="#bfe8ff" stroke="#5a8aa8" stroke-width=".6" opacity="' + f(1 - ph) + '"/>'; }
    s += vapor(320, 110, t, 50, 0.8) + thermo(520, 280, lerp(0.75, 0.45, cool), "", t);
    return s + tag("العرق", 140, 100, u, 0.4, -3, 17);
  });
  // 19 — Egyptians have cooled water in clay for thousands of years; Qena still makes qolla today (a potter at the wheel)
  shot(19, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f2d9a8"/><path d="M-60 260 L60 120 L180 260 Z M120 260 L200 170 L280 260 Z" fill="#d9b070" stroke="#a8804a" stroke-width="2"/><rect x="-400" y="260" width="1440" height="300" fill="#c9a074"/>';
    s += '<g transform="translate(420 250)"><ellipse cx="0" cy="0" rx="70" ry="14" fill="#6a4020" stroke="' + INK + '" stroke-width="2"/><path d="M-60 0 l-8 40 M60 0 l8 40" stroke="#6a4020" stroke-width="6"/>';
    for (var k = 0; k < 6; k++) { var a = t * 6 + k; s += '<path d="M' + f(Math.cos(a) * 66) + ' ' + f(Math.sin(a) * 12) + ' l4 0" stroke="#3a2010" stroke-width="3"/>'; }
    s += '</g>' + qolla(420, 248, t, { s: 0.6 }) + person(300, 160, t, "happy", { col: "#e9dcc0", s: 0.9, look: 1 });
    for (var q = 0; q < 4; q++) s += qolla(560 + q * 40, 300, t, { s: 0.3 });
    s += '<g transform="translate(120 50)"><rect x="-70" y="-20" width="140" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#ffd23a">آلاف السنين</text></g>';
    return s + tag("قنا", 560, 60, u, 1.8, 3, 19);
  });
  // 20 — in the 1990s a Nigerian teacher, Mohammed Bah Abba, made a kind of fridge with no electricity
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e9dcc0"/><rect x="80" y="40" width="300" height="180" rx="6" fill="#2f4a3a" stroke="#6a4020" stroke-width="10"/>';
    s += '<g transform="translate(160 160)">' + '<path d="M-30 0 C-40 -40 -20 -70 0 -70 C20 -70 40 -40 30 0 Z" fill="none" stroke="#fff" stroke-width="3"/><path d="M-18 -10 C-24 -36 -12 -52 0 -52 C12 -52 24 -36 18 -10 Z" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M-26 -30 h52" stroke="#e9c48e" stroke-width="2" stroke-dasharray="3 3"/></g>';
    s += '<text x="300" y="120" text-anchor="middle" style="font:800 30px Noto Sans Arabic;fill:#fff;opacity:.85">+ رمل</text>';
    s += person(470, 160, t, "happy", { col: "#2f7a4a", s: 1.0, look: -1 * Math.sin(t), extra: '<rect x="-28" y="-30" width="22" height="13" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="6" y="-30" width="22" height="13" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' });
    var y = Math.round(lerp(2026, 1995, clamp(u / 1.4))); s += '<g transform="translate(520 40)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("نيجيريا", 230, 320, u, 0.6, -3, 17) + tag("محمد باه أبا", 470, 330, u, 1.4, 3, 16);
  });
  // 21 — a pot inside a bigger pot, wet sand between them, a cloth on top (cut open: water vapour leaving the sand)
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var sand = clamp((u - 0.8) / 1.0), cloth = clamp((u - 2.2) / 0.8), s = graphPaper(t);
    s += '<path d="M150 70 C140 200 180 320 320 330 C460 320 500 200 490 70 Z" fill="url(#gClay)" stroke="' + INK + '" stroke-width="3"/><path d="M170 80 C164 200 196 304 320 312 C444 304 476 200 470 80 Z" fill="url(#gWetSand)" opacity="' + f(sand) + '"/>';
    for (var g = 0; g < 40 * sand; g++) s += '<circle cx="' + f(190 + hash(g) * 260) + '" cy="' + f(100 + hash(g + 3) * 190) + '" r="2" fill="#5a4020" opacity=".5"/>';
    s += '<path d="M220 90 C214 190 240 270 320 276 C400 270 426 190 420 90 Z" fill="url(#gClay)" stroke="' + INK + '" stroke-width="3"/><path d="M236 110 C232 190 252 250 320 256 C388 250 408 190 404 110 Z" fill="#f6e7c8"/>';
    s += tomato(290, 220, 18, 0) + tomato(340, 225, 18, 0) + tomato(315, 190, 16, 0);
    if (cloth > 0) s += '<path d="M' + f(140) + ' ' + f(70 - 4 * Math.sin(t * 2)) + ' Q320 ' + f(40 + 6 * Math.sin(t * 2)) + ' 500 ' + f(70 - 4 * Math.sin(t * 2 + 1)) + ' L500 84 Q320 60 140 84 Z" fill="#e9e2d4" stroke="' + INK + '" stroke-width="2" opacity="' + f(cloth) + '"/>';
    s += vapor(190, 60, t, 20, sand) + vapor(450, 60, t + 0.5, 20, sand);
    return s + tag("رمل مبلول", 560, 200, u, 0.9, 3, 16) + tag("زير جوة زير", 90, 120, u, 0.2, -3, 15) + tag("قماشة", 560, 60, u, 2.3, 3, 15);
  });
  // 22 — tomatoes inside last about three weeks instead of two or three days
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var day = Math.min(21, Math.floor(u * 7)), s = graphPaper(t);
    s += '<g transform="translate(160 170)"><rect x="-90" y="-110" width="180" height="200" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><rect x="-90" y="-110" width="180" height="40" rx="10" fill="' + RED + '"/><text y="-82" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:#fff">يوم</text><text y="40" text-anchor="middle" style="font:900 80px Noto Serif;fill:' + INK + '">' + day + '</text></g>';
    s += tomato(390, 150, 30, day > 3 ? 1 : 0) + '<text x="390" y="210" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">برة</text>';
    s += zeer(530, 330, t, { s: 0.55, wet: 1 }) + tomato(530, 136, 24, 0) + '<text x="530" y="102" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">في الزير</text>';
    return s + tag("٣ أسابيع!", 530, 60, u, 2.2, 3, 18);
  });
  // 23 — every cold sip from the qolla is heat the evaporation stole from the water
  shot(23, function (u, d) { return [320, 175, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = hotDay(t) + '<rect x="-400" y="270" width="1440" height="400" fill="#c9a074"/>' + qolla(230, 276, t, { s: 1.0, wet: 1, t: t, vapor: 1 });
    for (var k = 0; k < 6; k++) { var ph = (t * 0.8 + k / 6) % 1; s += '<path d="M' + f(240 + Math.cos(k) * 20) + ' ' + f(160 - ph * 100) + ' l' + f(Math.sin(k) * 20) + ' -16" stroke="' + RED + '" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - ph) + '"/>'; }
    s += glass(420, 270, t, 0.8, { cold: true, s: 1.2 }) + '<circle cx="420" cy="220" r="' + f(60 + 6 * Math.sin(t * 3)) + '" fill="' + CY + '" opacity=".15"/>';
    return s + tag("حرارة مسروقة!", 230, 40, u, 0.8, -3, 17, "#ffb08a");
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + qolla(260, 290, t, { s: 0.9, wet: 1, t: t, vapor: 0.6 }) + zeer(420, 300, t, { s: 0.55, wet: 1, t: t }) + qmark(520, 80, t, 56) + qmark(560, 130, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { qolla: qolla, zeer: zeer, thermo: thermo, glass: glass, vapor: vapor, wallSlice: wallSlice, molecules: molecules, hotDay: hotDay, pourStream: pourStream, tag: tag, tomato: tomato };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
