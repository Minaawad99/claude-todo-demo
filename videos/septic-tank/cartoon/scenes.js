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

  // ── «تعمل خزان صرف إزاي؟» — a household septic tank in the courtyard of an Egyptian village house, in cross-section ──
  // Real shapes (see ../refs/SOURCES.md): a red-brick house on a concrete frame with rebar on the roof and a water tank, a
  // watertight two-compartment concrete tank (first compartment two thirds), inlet and outlet tees, a manhole riser over
  // each compartment, a vent stack up the house wall, perforated pipes in gravel trenches, an Egyptian hand pump on a well.
  var INK = "#1c1c1c", GY = 130, TX0 = 240, TX1 = 450, TY0 = 165, TY1 = 300, IN0 = 248, IN1 = 442, IT = 173, IB = 292, DX = 377, WL = 190;
  var WASTE = "#8a7650", CLEAR = "#8fae9a", SLUDGE = "#4f3a24", SCUM = "#d2b25e", PVC = "#d9d4c8", PUMPX = 880;
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function line(d, w, col, extra) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + '/>'; }
  function engineer(x, y, t, mood, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') rotate(' + f(Math.sin(t * 1.7) * 1.5) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-60 140 C-64 56 -40 32 0 32 C40 32 64 56 60 140 Z" fill="' + (o.col || "#2f6f9f") + '" stroke="' + INK + '" stroke-width="3"/><path d="M-50 70 H50" stroke="#f4f1e8" stroke-width="6" opacity=".7"/>';
    s += head(0, -34, 40, mood, t, o.look);
    if (o.hat !== false) s += '<path d="M-44 -50 C-44 -92 44 -92 44 -50 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/><path d="M-52 -50 H52" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M-52 -50 H52" stroke="#f2c230" stroke-width="3" stroke-linecap="round"/>';
    if (o.nose) s += '<path d="M-40 70 Q-30 20 -6 -24" stroke="' + (o.col || "#2f6f9f") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="-4" cy="-26" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.point) s += '<path d="M44 60 Q80 ' + f(40 + Math.sin(t * 3) * 4) + ' 104 ' + f(20 + Math.sin(t * 3) * 4) + '" stroke="' + (o.col || "#2f6f9f") + '" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="106" cy="' + f(18 + Math.sin(t * 3) * 4) + '" r="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.shovel) { var a = Math.sin(t * 6) * 18; s += '<g transform="translate(50 60) rotate(' + f(a) + ')"><path d="M0 0 L40 70" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/><path d="M30 64 L56 60 L60 92 Q48 102 36 94 Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2.4"/></g><path d="M44 60 Q54 70 60 74" stroke="' + (o.col || "#2f6f9f") + '" stroke-width="16" fill="none" stroke-linecap="round"/>'; }
    return s + '</g>';
  }
  function hardHat(x, y, s, t, mood, o) { return engineer(x, y, t, mood, Object.assign({ s: s }, o || {})); }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  function family(t, mood, x0) { var s = "", cols = ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a", "#9a5fb0"], sc = [0.62, 0.6, 0.42, 0.4, 0.36]; x0 = x0 == null ? 170 : x0; for (var i = 0; i < 5; i++) s += mini(x0 + i * 15, GY - 2, sc[i], cols[i], t + i, mood); return s; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  function ck(u, u0) { return clamp((u - u0) / 1.2); }

  // ── the courtyard: sky, palms, the village house (red brick in a concrete frame, rebar on the roof, a black water tank),
  // the courtyard floor, the earth in section and the groundwater at the bottom ──
  function palm(x, y, s, t) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-4 0 Q-10 -50 2 -100 L8 -100 Q0 -50 6 0 Z" fill="#8a6a42" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 7; i++) { var a = -160 + i * 25 + Math.sin(t * 1.4 + i) * 4, c = Math.cos(a * Math.PI / 180), sn = Math.sin(a * Math.PI / 180); g += '<path d="M5 -100 Q' + f(5 + c * 30) + ' ' + f(-112 + sn * 30) + ' ' + f(5 + c * 56) + ' ' + f(-92 + sn * 46 + 18) + '" stroke="#4a8a3a" stroke-width="7" fill="none" stroke-linecap="round"/>'; }
    return g + '</g>';
  }
  function house(t) {
    var s = R(10, 40, 140, GY - 40, "url(#brick)", 2.4);
    for (var y = 48; y < GY; y += 8) { s += '<path d="M12 ' + y + ' H148" stroke="#8a3e22" stroke-width=".8" opacity=".6"/>'; for (var x = 14 + ((y / 8) % 2) * 8; x < 148; x += 16) s += '<path d="M' + x + ' ' + (y - 8) + ' v8" stroke="#8a3e22" stroke-width=".8" opacity=".5"/>'; }
    [10, 74, 140].forEach(function (cx) { s += R(cx, 40, 10, GY - 40, "#c9c4b8", 1.6); });
    s += R(10, 34, 140, 8, "#c9c4b8", 2) + R(10, 84, 140, 7, "#c9c4b8", 1.6);
    s += R(28, 54, 30, 22, "#3f7a5a", 1.8) + '<path d="M43 54 V76" stroke="' + INK + '" stroke-width="1.4"/>' + R(96, 54, 30, 22, "#3f7a5a", 1.8) + '<path d="M111 54 V76" stroke="' + INK + '" stroke-width="1.4"/>';
    s += R(30, 98, 26, 32, "#6a4630", 1.8) + '<circle cx="51" cy="115" r="1.8" fill="#e2b035"/>' + R(104, 100, 18, 12, "#cfe1ec", 1.6) + '<path d="M113 100 v12" stroke="' + INK + '" stroke-width="1"/>';
    for (var r = 16; r < 146; r += 18) s += '<path d="M' + r + ' 34 v-12" stroke="#5a3a2a" stroke-width="2"/>';
    s += R(96, 14, 22, 20, "#2b2e33", 1.8, 4) + '<path d="M96 20 H118" stroke="#5a6068" stroke-width="1.2"/>';
    s += '<path d="M24 26 H86" stroke="#5a5048" stroke-width="1"/>'; for (var c = 0; c < 4; c++) s += R(30 + c * 14, 26, 9, 10 + Math.sin(t * 3 + c) * 1.5, ["#c23a26", "#5aa0c0", "#e2b035", "#f4f1e8"][c], 1);
    return s;
  }
  function courtyard(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1800" height="960" fill="url(#sky-' + (o.sky || "day") + ')"/>' + (o.sky === "night" ? stars(t) : clouds(t, 10, -10, 5, 0.85) + birds(t, 0, 26));
    s += palm(560, GY, 0.85, t) + palm(760, GY, 0.95, t + 2) + palm(1010, GY, 0.8, t + 4);
    s += R(660, GY - 34, 10, 34, "#d9cbb0", 1.6) + R(670, GY - 30, 140, 30, "#e6d7b8", 1.6) + R(810, GY - 34, 10, 34, "#d9cbb0", 1.6);
    s += house(t);
    s += '<rect x="-300" y="' + GY + '" width="1500" height="500" fill="url(#gSoil)"/>';
    for (var k = 0; k < 70; k++) { var px = -280 + hash(k) * 1460, py = GY + 14 + hash(k + 4) * 190; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(1.5 + hash(k + 7) * 2.5) + '" fill="#5a3c20" opacity=".45"/>'; }
    var gw = 322, d = "M-300 " + gw; for (var x = -300; x <= 1200; x += 20) d += " L" + x + " " + f(gw + Math.sin(x * 0.05 + t * 1.6) * 2.5);
    s += '<path d="' + d + ' V600 H-300 Z" fill="#4f86a8" opacity=".85"/><path d="' + d + '" stroke="#bfe0f2" stroke-width="2" fill="none"/>';
    if (o.gwTag) s += T("مية جوفية", o.gwTag, 346, 15, "#dff1fb");
    s += '<rect x="-300" y="' + (GY - 3) + '" width="1500" height="8" fill="#d8c49a" stroke="' + INK + '" stroke-width="1.6"/>';
    return s;
  }

  // ── the build ──
  // pipe from the bathroom to the tank; o.flat: laid level (and clogging), o.flow: waste moving, o.clog 0..1
  function pipeIn(t, o) {
    o = o || {}; var y0 = o.flat ? 180 : 152, d = "M150 " + y0 + " L" + IN0 + " 180", s = (o.flat ? line("M146 " + (GY - 2) + " V180 H152", 9, PVC) : "") + line(d, 9, PVC);
    if (o.flow) for (var k = 0; k < 5; k++) { var p = (t * 0.5 + k / 5) % 1; s += '<circle cx="' + f(lerp(152, IN0, p)) + '" cy="' + f(lerp(y0, 180, p)) + '" r="3" fill="' + WASTE + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    if (o.clog) { var c = clamp(o.clog); for (var j = 0; j < 7; j++) s += '<circle cx="' + f(190 + j * 4 - c * 12) + '" cy="' + f(180 + Math.sin(j * 2) * 1.5) + '" r="' + f(2.4 + c * 1.8) + '" fill="' + SLUDGE + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(Math.min(1, c * 3 - j * 0.25)) + '"/>'; }
    return s;
  }
  // the tank. o: k (built 0..1), div (wall 0..1), lvl (liquid top y), sludge, scum, tee, lids, out (outlet pipe), settle, gas, bact, dead
  function tank(t, o) {
    o = o || {}; var k = o.k == null ? 1 : clamp(o.k), s = "";
    s += '<rect x="' + (TX0 - 6) + '" y="' + (TY0 - 4) + '" width="' + (TX1 - TX0 + 12) + '" height="' + (TY1 - TY0 + 10) + '" fill="#6a4a2e" opacity=".35"/>';
    var top = lerp(TY1, TY0, k);
    s += R(TX0, top, TX1 - TX0, TY1 - top, "url(#gConc)", 2.4);
    if (k < 1) return s + R(IN0, Math.max(top + 8, IT), IN1 - IN0, IB - Math.max(top + 8, IT), "#3a3026", 1.4);
    s += R(IN0, IT, IN1 - IN0, IB - IT, "#3a3026", 1.6);
    var lvl = o.lvl == null ? WL : o.lvl, two = o.div != null && o.div > 0;
    s += '<rect x="' + IN0 + '" y="' + f(lvl) + '" width="' + (IN1 - IN0) + '" height="' + f(IB - lvl) + '" fill="' + WASTE + '"/>';
    if (two) s += '<rect x="' + DX + '" y="' + f(lvl) + '" width="' + (IN1 - DX) + '" height="' + f(IB - lvl) + '" fill="' + CLEAR + '" opacity="' + f(clamp(o.div)) + '"/>';
    var wv = "M" + IN0 + " " + f(lvl); for (var x = IN0; x <= IN1; x += 8) wv += " L" + x + " " + f(lvl + Math.sin(x * 0.12 + t * 3) * 1.2); s += '<path d="' + wv + '" stroke="#c8b98a" stroke-width="1.6" fill="none"/>';
    if (o.sludge != null) { var sh = 6 + 34 * o.sludge, e = two ? DX : IN1, sd = "M" + IN0 + " " + IB; for (var x2 = IN0; x2 <= e; x2 += 6) sd += " L" + x2 + " " + f(IB - sh + Math.sin(x2 * 0.2 + 1) * 2); s += '<path d="' + sd + ' L' + e + ' ' + IB + ' Z" fill="' + SLUDGE + '"/>'; if (two) s += '<rect x="' + DX + '" y="' + f(IB - sh * 0.25) + '" width="' + (IN1 - DX) + '" height="' + f(sh * 0.25) + '" fill="' + SLUDGE + '" opacity=".8"/>'; }
    if (o.scum) { var e2 = two ? DX : IN1; s += '<rect x="' + IN0 + '" y="' + f(lvl - 1) + '" width="' + (e2 - IN0) + '" height="' + f(9 * o.scum) + '" fill="' + SCUM + '"/>'; for (var b = 0; b < 10; b++) s += '<circle cx="' + f(IN0 + 8 + b * (e2 - IN0 - 16) / 9) + '" cy="' + f(lvl + 3 + Math.sin(t * 2 + b) * 1) + '" r="' + f(2.5 * o.scum) + '" fill="#f0d488"/>'; }
    if (o.settle) for (var p = 0; p < 14; p++) { var q = (t * 0.35 + p / 14) % 1, px = IN0 + 14 + hash(p) * ((two ? DX : IN1) - IN0 - 28); if (hash(p + 3) > 0.35) s += '<circle cx="' + f(px + Math.sin(q * 6 + p) * 3) + '" cy="' + f(lerp(lvl + 10, IB - 14, q)) + '" r="2.6" fill="' + SLUDGE + '"/>'; else s += '<circle cx="' + f(px) + '" cy="' + f(lerp(IB - 20, lvl + 6, q)) + '" r="2.4" fill="#f0d488" stroke="' + INK + '" stroke-width=".6"/>'; }
    if (o.div) { var dh = (IB - IT) * clamp(o.div), dt = IB - dh; s += R(DX - 4, Math.max(dt, 238), 8, IB - Math.max(dt, 238), "url(#gConc)", 1.6); if (dt < 215) s += R(DX - 4, dt, 8, 215 - dt, "url(#gConc)", 1.6); }
    s += R(TX0, TY0, TX1 - TX0, 8, "url(#gConc)", 2);
    if (o.lids) { var L2 = clamp(o.lids); [[296, 0], [410, 0.3]].forEach(function (c) { var k2 = clamp(L2 * 1.6 - c[1]); if (k2 <= 0) return; var h = (TY0 - GY) * k2; s += R(c[0] - 14, TY0 - h, 28, h, "url(#gConc)", 1.8) + (k2 >= 1 ? R(c[0] - 19, GY - 5 + (o.open === c[0] ? -10 : 0), 38, 7, "#4b5056", 1.8, 2) + '<path d="M' + (c[0] - 6) + ' ' + (GY - 2 + (o.open === c[0] ? -10 : 0)) + ' h12" stroke="#9aa2ac" stroke-width="2"/>' : ""); }); }
    if (o.tee) { var tk = clamp(o.tee); s += '<g opacity="' + f(tk) + '">' + line("M" + IN0 + " 180 H257 M257 " + (IT + 4) + " V" + f(lerp(180, 214, tk)), 7, PVC) + line("M" + IN1 + " 186 H433 M433 " + (IT + 4) + " V" + f(lerp(186, 222, tk)), 7, PVC) + '</g>'; }
    if (o.bact) for (var bb = 0; bb < 6; bb++) { var bx = IN0 + 22 + bb * 20 + Math.sin(t * 1.5 + bb) * 4, by = IB - 22 - (bb % 2) * 14 + Math.cos(t * 2 + bb) * 3; s += bug(bx, by, 6.5, o.dead ? "dizzy" : "happy", t + bb, o.dead); }
    if (o.gas) for (var g = 0; g < 8; g++) { var gq = (t * 0.5 + g / 8) % 1, gx = IN0 + 20 + hash(g) * 120 + Math.sin(gq * 8 + g) * 4; s += '<circle cx="' + f(gx) + '" cy="' + f(lerp(IB - 26, IT + 4, gq)) + '" r="' + f(2 + gq * 3) + '" fill="#b6d36a" fill-opacity=".45" stroke="#6a8a2a" stroke-width="1" opacity="' + f(1 - gq * 0.4) + '"/>'; }
    return s;
  }
  function outPipe(t, o) { o = o || {}; var s = line("M" + IN1 + " 186 H" + f(lerp(IN1, 480, o.k == null ? 1 : o.k)), 7, PVC); if (o.flow) for (var k = 0; k < 3; k++) { var p = (t * 0.6 + k / 3) % 1; s += '<circle cx="' + f(lerp(450, 480, p)) + '" cy="186" r="2.2" fill="' + (o.dirty ? SLUDGE : "#bfe0f2") + '"/>'; } return s; }
  // the drain field: perforated pipe in a gravel trench, effluent dripping down into the soil. o: k (dug), drip, grass, filter
  function field(t, o) {
    o = o || {}; var k = o.k == null ? 1 : clamp(o.k), x1 = lerp(480, 660, k), s = "";
    if (k <= 0) return s;
    s += '<rect x="476" y="190" width="' + f(x1 - 476) + '" height="34" fill="#9a958c" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 40; i++) { var gx = 480 + hash(i) * 176, gy = 194 + hash(i + 2) * 28; if (gx < x1 - 4) s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(2 + hash(i + 5) * 2.4) + '" fill="#c9c4b8" stroke="#5a5650" stroke-width=".8"/>'; }
    s += line("M478 186 V204 H" + f(x1 - 4), 7, PVC);
    for (var h = 490; h < x1 - 8; h += 18) s += '<circle cx="' + h + '" cy="207" r="1.8" fill="' + INK + '"/>';
    if (o.drip) for (var d = 0; d < 12; d++) { var q = (t * 0.45 + d / 12) % 1, dx = 492 + (d % 9) * 18; if (dx < x1) s += '<path d="M' + dx + ' ' + f(lerp(210, 316, q)) + ' q-2.4 4 0 5.6 q2.4 -1.6 0 -5.6" fill="' + (o.dirty ? "#a08050" : lerp(0, 1, q) > 0.5 && o.filter ? "#cfeaf7" : "#c9b98a") + '" stroke="' + INK + '" stroke-width=".6" opacity="' + f(1 - q * 0.6) + '"/>'; }
    if (o.grass) { var gk = clamp(o.grass); for (var gg = 0; gg < 28; gg++) { var xx = 480 + gg * 6.5, hh = 10 * gk * (0.6 + hash(gg) * 0.6), sw = Math.sin(t * 2.4 + gg) * 2; s += '<path d="M' + f(xx) + ' ' + GY + ' q' + f(sw) + ' ' + f(-hh / 2) + ' ' + f(sw * 1.4) + ' ' + f(-hh) + '" stroke="#4f9a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; } }
    return s;
  }
  // the vent stack up the house wall, above the roof; k: how far it has grown, gas: smell puffs leaving the top
  function vent(t, k, gas) {
    k = clamp(k); if (k <= 0) return ""; var top = lerp(152, 6, k), s = line("M160 152 V" + f(top), 7, PVC);
    if (k >= 1) s += R(153, 0, 14, 7, "#9aa2ac", 1.6, 2);
    if (gas) for (var g = 0; g < 5; g++) { var q = (t * 0.5 + g / 5) % 1; s += '<path d="M' + f(160 + Math.sin(q * 7 + g) * 8) + ' ' + f(-4 - q * 50) + ' q5 -4 0 -8 q-5 -4 0 -8" stroke="#8ab04a" stroke-width="2.4" fill="none" opacity="' + f(0.9 * (1 - q)) + '"/>'; }
    return s;
  }
  function stink(x, y, t, n) { var s = ""; for (var g = 0; g < (n || 3); g++) { var q = (t * 0.6 + g / (n || 3)) % 1; s += '<path d="M' + f(x + g * 12 - 12 + Math.sin(q * 6) * 4) + ' ' + f(y - q * 34) + ' q6 -5 0 -10 q-6 -5 0 -10" stroke="#8ab04a" stroke-width="2.6" fill="none" opacity="' + f(1 - q) + '"/>'; } return s; }
  // a bacterium: a green capsule with a face; dead ones go grey and dizzy
  function bug(x, y, r, mood, t, dead) { var a = Math.sin(t * 3) * 12; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(dead ? 90 : a) + ')"><rect x="' + f(-r * 1.4) + '" y="' + f(-r) + '" width="' + f(r * 2.8) + '" height="' + f(r * 2) + '" rx="' + f(r) + '" fill="' + (dead ? "#9aa2ac" : "#7cc04a") + '" stroke="' + INK + '" stroke-width="1.2"/>' + (r > 5 ? '<g transform="scale(' + f(r / 13) + ')">' + eyes(mood, t, 13) + '</g>' : "") + '</g>'; }
  // the Egyptian hand pump (طلمبة حبشية) on a well: cast-iron column, long handle, spout, pipe down to the groundwater
  function pump(x, t, o) {
    o = o || {}; var a = Math.sin(t * 3) * 14 * (o.work ? 1 : 0.2), s = line("M" + x + " " + GY + " V330", 5, "#5a6068");
    s += R(x - 22, GY - 6, 44, 8, "#9a958c", 1.6) + R(x - 9, GY - 62, 18, 58, "#3f6f5a", 2, 3) + R(x - 12, GY - 70, 24, 10, "#2f5a48", 2, 3);
    s += '<path d="M' + (x + 9) + ' ' + (GY - 44) + ' h18 v8" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="M' + (x + 9) + ' ' + (GY - 44) + ' h18 v8" stroke="#3f6f5a" stroke-width="4" fill="none"/>';
    s += '<g transform="translate(' + x + ' ' + (GY - 66) + ') rotate(' + f(a) + ')"><path d="M0 0 L-48 -10" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M0 0 L-48 -10" stroke="#5a6068" stroke-width="4" stroke-linecap="round"/></g>';
    if (o.water) for (var k = 0; k < 4; k++) { var q = (t * 1.6 + k / 4) % 1; s += '<circle cx="' + (x + 27) + '" cy="' + f(GY - 34 + q * 26) + '" r="2.4" fill="' + (o.dirty ? "#a08050" : "#7fc2ea") + '"/>'; }
    s += R(x + 18, GY - 12, 18, 12, "#9aa2ac", 1.6, 2);
    return s;
  }
  // the vacuum truck (عربية الكسح): cab, big cylindrical tank, hose into the open manhole
  function truck(x, t, o) {
    o = o || {}; var w = Math.abs(Math.sin(t * 8)) * 0.8, s = '<g transform="translate(' + f(x) + ' ' + f(GY - 12 - w) + ')">';
    s += R(0, -40, 120, 34, "url(#gTruck)", 2.4, 16) + R(0, -40, 120, 34, "none", 0, 16) + '<path d="M10 -36 H110" stroke="#fff" stroke-width="2" opacity=".5"/>' + R(-4, -8, 162, 8, "#3a3d42", 1.8);
    s += '<path d="M120 -8 V-34 H140 L156 -18 V-8 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.2"/><path d="M126 -30 H138 L148 -20 H126 Z" fill="#8fc2da" stroke="' + INK + '" stroke-width="1.4"/>';
    s += T("كسح", 60, -16, 14, "#fff");
    [22, 56, 136].forEach(function (wx) { s += '<g transform="translate(' + wx + ' 2) rotate(' + f(t * 200 * (o.drive || 0)) + ')"><circle r="10" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-6 0 H6" stroke="#9aa2ac" stroke-width="2"/></g>'; });
    s += '</g>';
    if (o.hose) { var hx = o.hose, d = "M" + f(x + 4) + " " + (GY - 30) + " Q" + f((x + hx) / 2) + " " + (GY + 6) + " " + hx + " " + (GY + 10) + " V" + (IB - 14); s += line(d, 6, "#3a3d42"); for (var k = 0; k < 4; k++) { var q = (t * 0.8 + k / 4) % 1; s += '<circle cx="' + hx + '" cy="' + f(lerp(IB - 16, GY + 8, q)) + '" r="2.4" fill="' + SLUDGE + '" stroke="#f0d488" stroke-width=".6"/>'; } }
    return s;
  }
  function calendar(x, y, s, txt, t, flip) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + R(-34, -30, 68, 64, "#fbfbf7", 2.4, 6) + R(-34, -30, 68, 16, "#d8352a", 2.4, 6) + '<circle cx="-18" cy="-30" r="3" fill="' + INK + '"/><circle cx="18" cy="-30" r="3" fill="' + INK + '"/>' + T(txt, 0, 16, 20, "#1c1c1c").replace("fill:#1c1c1c;stroke:#1c1c1c", "fill:#1c1c1c;stroke:none"); if (flip != null) g += '<path d="M-34 -14 H34 V' + f(-14 + 48 * (1 - clamp(flip))) + ' H-34 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.4" opacity="' + f(1 - clamp(flip)) + '"/>'; return g + '</g>'; }
  function bottle(x, y, s, t, tilt) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(tilt || 0) + ') scale(' + s + ')">' + R(-14, -30, 28, 44, "#eef2f4", 2, 6) + R(-6, -42, 12, 12, "#2f6fb8", 2, 2) + R(-10, -16, 20, 16, "#2f6fb8", 1.2, 2) + T("كلور", 0, -4, 9, "#fff") + '</g>'; }
  function noSign(x, y, s, inner, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#fbfbf7" stroke="#d8352a" stroke-width="5"/>' + inner + '<path d="M-18 -18 L18 18" stroke="#d8352a" stroke-width="5"/></g>'; }
  var OIL = '<g transform="scale(.5)">' + '<rect x="-12" y="-26" width="24" height="40" rx="5" fill="#e2b035" stroke="#1c1c1c" stroke-width="2.4"/><rect x="-5" y="-34" width="10" height="9" fill="#c23a26" stroke="#1c1c1c" stroke-width="2"/></g>';
  var WIPES = '<g transform="scale(.5)"><rect x="-20" y="-14" width="40" height="28" rx="6" fill="#f4f1e8" stroke="#1c1c1c" stroke-width="2.4"/><path d="M-8 -14 q8 -12 16 0" fill="#fbfbf7" stroke="#1c1c1c" stroke-width="2"/></g>';

  // everything built so far: P = {pipe, tank, div, tee, vent, out, field, lids, grass, sludge, scum, bact, ...}
  function build(t, P) {
    var s = "";
    if (P.vent) s += vent(t, P.vent, P.ventGas);
    if (P.field) s += field(t, { k: P.field, drip: P.drip, grass: P.grass, filter: P.filter, dirty: P.dirtyField });
    if (P.out) s += outPipe(t, { k: P.out, flow: P.drip, dirty: P.dirtyField });
    s += tank(t, { k: P.tank, div: P.div, lvl: P.lvl, sludge: P.sludge == null ? 0.25 : P.sludge, scum: P.scum == null ? (P.div ? 1 : 0) : P.scum, tee: P.tee, lids: P.lids, settle: P.settle, gas: P.gas, bact: P.bact, dead: P.dead, open: P.open });
    s += pipeIn(t, { flat: P.flat, flow: P.flow !== false, clog: P.clog });
    return s;
  }
  var ALL = { tank: 1, div: 1, tee: 1, vent: 1, out: 1, field: 1, drip: true, filter: true, lids: 1, bact: true };
  function plus(a, b) { return Object.assign({}, a, b || {}); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function C(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  var HOLE = "M262 " + GY + " Q262 210 312 214 Q362 210 362 " + GY + " Z";

  // 0 — dig a hole in the courtyard, run the bathroom pipe into it: is that a septic tank?
  shot(0, C(200, 120, 1.5, 300, 150, 1.05), function (u, d, t) {
    var dig = clamp((u - 0.2) / 1.8), s = courtyard(t);
    s += '<path d="M262 ' + GY + ' Q262 ' + f(GY + 80 * dig) + ' 312 ' + f(GY + 84 * dig) + ' Q362 ' + f(GY + 80 * dig) + ' 362 ' + GY + ' Z" fill="#4a3220" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) { var p = (t * 1.2 + k / 6) % 1; s += '<circle cx="' + f(lerp(312, 400 + k * 8, p)) + '" cy="' + f(GY - 40 * Math.sin(p * Math.PI)) + '" r="4" fill="#7d5a38" opacity="' + f(1 - dig * 0.6) + '"/>'; }
    if (u > 2.0) s += line("M150 152 L" + f(lerp(150, 268, clamp((u - 2) / 0.8))) + " " + f(lerp(152, 176, clamp((u - 2) / 0.8))), 9, PVC);
    s += '<path d="M380 ' + (GY - 8) + ' q20 -16 40 0 Z" fill="#7d5a38" stroke="' + INK + '" stroke-width="1.6"/>';
    s += hardHat(395, GY - 30, 0.22, t, u > 2.6 ? "curious" : "happy", { shovel: u < 2.4 });
    return s + qmark(470, 40, t, 40) + tag("خزان صرف؟", 330, 34, u, 2.6, 3, 24);
  });
  // 1 — no: the mud walls cave in and the dirty water seeps down to the groundwater
  shot(1, C(310, 190, 1.2, 310, 230, 1.0), function (u, d, t) {
    var s = courtyard(t, { gwTag: 520 }), cv = clamp((u - 0.4) / 1.4), sp = clamp((u - 1.4) / 3);
    s += '<path d="' + HOLE + '" fill="#4a3220" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M268 ' + GY + ' Q268 200 312 206 Q356 200 356 ' + GY + ' Z" fill="' + WASTE + '" opacity=".9"/>';
    for (var k = 0; k < 10; k++) { var p = clamp(cv * 1.4 - k * 0.04); s += '<circle cx="' + f(lerp(k % 2 ? 266 : 358, 300 + k * 3, p)) + '" cy="' + f(lerp(GY + 8 + k * 7, 196, p)) + '" r="' + f(6 + hash(k) * 4) + '" fill="#7d5a38" stroke="' + INK + '" stroke-width="1"/>'; }
    for (var j = 0; j < 7; j++) { var x = 274 + j * 13, len = 110 * sp * (0.7 + hash(j) * 0.4); s += '<path d="M' + x + ' 206 C' + (x - 6) + ' ' + f(206 + len * 0.4) + ' ' + (x + 8) + ' ' + f(206 + len * 0.7) + ' ' + (x + Math.sin(t + j) * 3) + ' ' + f(206 + len) + '" stroke="' + WASTE + '" stroke-width="' + (5 - j % 3) + '" fill="none" opacity=".8" stroke-linecap="round"/>'; }
    if (sp > 0.9) s += '<ellipse cx="312" cy="326" rx="' + f(60 * (sp - 0.9) * 10) + '" ry="8" fill="' + WASTE + '" opacity=".7"/>';
    s += pipeIn(t, { flow: true }).replace(/L248 180/g, "L268 176");
    return s + cross(420, 190, 1, ck(u, 0.8)) + tag("هتنهار!", 180, 200, u, 0.8, -3, 22, "#f2a0a0") + tag("هتنشّع!", 430, 270, u, 2.4, 3, 22, "#f2a0a0");
  });
  // 2 — so you build a sealed concrete tank, about four cubic metres for a family of five
  shot(2, C(330, 190, 1.0, 300, 170, 1.05), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: ease(clamp((u - 0.2) / 2.2)), sludge: 0, scum: 0, flow: true });
    s += family(t, "happy");
    if (u > 2.5) s += arrow(TX1 + 14, TY0, TX1 + 14, TY1, "#f2c230", 3, clamp((u - 2.5) * 2)) + arrow(TX1 + 14, TY1, TX1 + 14, TY0, "#f2c230", 3, clamp((u - 2.5) * 2));
    return s + tag("خرسانة مقفولة", 340, 250, u, 1.0, -3, 22) + tag("≈ 4 م³", 520, 240, u, 2.6, 3, 24, "#f2c230") + tag("5 أفراد", 210, 40, u, 3.6, -3, 20);
  });
  // 3 — but if the pipe is laid level, the waste stops in it and blocks it
  shot(3, C(220, 175, 2.2, 205, 180, 2.6), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, sludge: 0, scum: 0, flat: true, flow: false, clog: clamp((u - 0.3) / 2) });
    s += '<path d="M150 180 H' + IN0 + '" stroke="#d8352a" stroke-width="1.4" stroke-dasharray="4 4" opacity=".0"/>';
    return s + cross(215, 155, 0.5, ck(u, 1.6)) + tag("مستوية = سدّة", 200, 210, u, 1.0, -3, 13, "#f2a0a0");
  });
  // 4 — so it slopes down, about two centimetres every metre
  shot(4, C(205, 175, 2.4, 210, 168, 2.0), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, sludge: 0, scum: 0 });
    var k = clamp((u - 0.6) / 0.8); s += '<path d="M160 156 L' + IN0 + ' 184 L160 184 Z" fill="#f2c230" opacity="' + f(0.3 * k) + '"/><path d="M160 184 H' + IN0 + ' M' + IN0 + ' 184 V' + 184 + '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="3 3" opacity="' + f(k) + '"/>';
    return s + tag("2 سم كل متر", 205, 210, u, 1.0, -3, 13, "#f2c230") + check(240, 150, 0.45, ck(u, 2.0));
  });
  // 5 — but with one chamber, the heavy solids leave with the water and block everything after it
  shot(5, C(380, 200, 1.3, 430, 200, 1.4), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, sludge: 0.2, scum: 0, out: 1, field: 1, dirtyField: true, drip: true });
    for (var k = 0; k < 8; k++) { var p = (t * 0.4 + k / 8) % 1; s += '<circle cx="' + f(lerp(270, 476, p)) + '" cy="' + f(lerp(240, 186, Math.min(1, p * 1.4)) + (p > 0.75 ? (p - 0.75) * 70 : 0)) + '" r="3.6" fill="' + SLUDGE + '" stroke="#f0d488" stroke-width=".6"/>'; }
    return s + cross(560, 160, 0.8, ck(u, 1.6)) + tag("أوضة واحدة", 345, 330, u, 0.6, -3, 20);
  });
  // 6 — so you split it with a wall into two chambers, the first twice the second
  shot(6, C(345, 225, 1.2, 345, 230, 1.35), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, div: ease(clamp((u - 0.3) / 1.4)), out: 1, scum: 0 });
    var k = clamp((u - 1.8) / 0.6);
    s += '<path d="M' + IN0 + ' 312 H' + (DX - 2) + ' M' + (DX + 2) + ' 312 H' + IN1 + '" stroke="#f2c230" stroke-width="3" opacity="' + f(k) + '"/>';
    return s + tag("2/3", (IN0 + DX) / 2, 330, u, 1.8, -3, 22, "#f2c230") + tag("1/3", (DX + IN1) / 2, 330, u, 2.2, 3, 22, "#e8c48e");
  });
  // 7 — in the first one the heavy stuff settles into sludge and the light grease floats up into a crust
  shot(7, C(312, 230, 1.9, 312, 236, 2.3), function (u, d, t) {
    var k = clamp(u / 4), s = courtyard(t) + build(t, { tank: 1, div: 1, out: 1, sludge: 0.15 + 0.35 * k, scum: k, settle: true });
    return s + tag("قشرة", 290, 202, u, 1.8, -3, 14, "#f2c230") + tag("حمأة", 300, 268, u, 1.0, 3, 14, "#e8c48e");
  });
  // 8 — but that crust can slip through to the second chamber
  shot(8, C(360, 205, 2.0, 380, 210, 2.3), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, div: 1, out: 1, scum: 1 });
    for (var k = 0; k < 4; k++) { var p = clamp(((u - 0.4) / 2.2) - k * 0.15); s += '<ellipse cx="' + f(lerp(340, 430, p)) + '" cy="' + f(lerp(WL + 3, WL + 6, p) + Math.sin(t * 3 + k) * 1) + '" rx="6" ry="3" fill="' + SCUM + '" stroke="' + INK + '" stroke-width="1"/>'; }
    return s + cross(415, 240, 0.5, ck(u, 1.8));
  });
  // 9 — so the pipes inside are T-shaped and take the water only from the middle
  shot(9, C(410, 210, 1.9, 380, 215, 1.6), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, div: 1, out: 1, scum: 1, tee: ease(clamp((u - 0.3) / 1)) });
    if (u > 1.4) for (var k = 0; k < 4; k++) { var p = (t * 0.6 + k / 4) % 1; s += '<circle cx="433" cy="' + f(lerp(226, 192, p)) + '" r="2.4" fill="#bfe0f2" stroke="' + INK + '" stroke-width=".6"/>'; }
    s += arrow(410, 222, 428, 222, "#7fd0f0", 3, clamp((u - 1.4) * 2));
    return s + tag("حرف T", 434, 160, u, 1.0, 3, 16, "#f2c230") + check(330, 240, 0.4, ck(u, 2.4));
  });
  // 10 — but bacteria inside eat the waste and give off gases that smell like rotten eggs
  shot(10, C(320, 220, 1.6, 300, 210, 1.4), function (u, d, t) {
    var s = courtyard(t) + build(t, plus({ tank: 1, div: 1, out: 1, tee: 1 }, { bact: true, gas: u > 1.6 }));
    if (u > 2.4) s += stink(300, GY - 10, t, 4);
    s += hardHat(380, GY - 30, 0.22, t, u > 2.4 ? "dizzy" : "curious", { nose: u > 2.4 });
    return s + tag("بكتيريا", 190, 250, u, 0.6, -3, 18, "#b6e08a") + tag("بيض بايظ!", 450, 112, u, 2.6, 3, 20, "#c9e08a");
  });
  // 11 — so you run a vent pipe up, higher than the roof of the house
  shot(11, C(220, 140, 1.1, 180, 80, 1.3), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, div: 1, out: 1, tee: 1, bact: true, gas: true, vent: ease(clamp((u - 0.3) / 1.6)), ventGas: u > 1.9 });
    return s + tag("ماسورة تهوية", 250, 40, u, 1.0, -3, 18) + tag("أعلى من السطح", 230, 0, u, 2.0, 3, 15, "#f2c230");
  });
  // 12 — but water comes in every day, and the tank would be full in less than a week
  shot(12, C(345, 200, 1.0, 345, 195, 1.1), function (u, d, t) {
    var k = clamp((u - 0.3) / 2.6), s = courtyard(t) + build(t, { tank: 1, div: 1, tee: 1, vent: 1, lvl: lerp(WL, IT + 3, k), bact: true });
    var day = Math.min(6, 1 + Math.floor(k * 6));
    s += calendar(540, 80, 0.9, "يوم " + day, t, (k * 6) % 1);
    return s + (k >= 0.9 ? tag("مليان!", 345, 140, u, 2.6, -3, 22, "#f2a0a0") : "");
  });
  // 13 — so the clear water leaves through perforated pipes buried in gravel trenches
  shot(13, C(500, 200, 1.2, 540, 205, 1.6), function (u, d, t) {
    var s = courtyard(t) + build(t, { tank: 1, div: 1, tee: 1, vent: 1, bact: true, out: clamp(u / 0.6), field: ease(clamp((u - 0.4) / 1.8)), drip: u > 2.0 });
    return s + tag("مواسير مخرّمة", 560, 160, u, 1.0, 3, 15) + tag("زلط", 600, 246, u, 1.8, -3, 15, "#e8c48e");
  });
  // 14 — and the soil works as a filter, with bacteria in it cleaning the water before it gets down
  shot(14, C(560, 250, 1.8, 560, 280, 2.0), function (u, d, t) {
    var s = courtyard(t, { gwTag: 600 }) + build(t, plus(ALL, {}));
    for (var b = 0; b < 6; b++) s += bug(500 + b * 22 + Math.sin(t + b) * 3, 250 + (b % 3) * 18, 5.5, "happy", t + b);
    return s + tag("التربة فلتر", 560, 300, u, 0.8, -3, 15) + check(640, 230, 0.4, ck(u, 2.2));
  });
  // 15 — but if a hand pump or a well is next to you, that water can pollute it
  shot(15, C(620, 220, 1.0, 760, 210, 1.15), function (u, d, t) {
    var s = courtyard(t, { gwTag: 760 }) + build(t, plus(ALL, {})), PX = 700;
    s += pump(PX, t, { work: true, water: true, dirty: u > 2.4 });
    var sp = clamp((u - 0.6) / 2); s += '<path d="M640 300 Q' + f(lerp(640, PX, sp)) + ' 330 ' + f(lerp(640, PX, sp)) + ' 322" stroke="' + WASTE + '" stroke-width="10" fill="none" opacity=".6" stroke-linecap="round"/>';
    s += hardHat(PX + 60, GY - 30, 0.22, t, u > 2.4 ? "shock" : "happy", {});
    return s + tag("طلمبة", PX - 70, 78, u, 0.4, -3, 18) + cross(PX - 40, 250, 0.6, ck(u, 2.4));
  });
  // 16 — so the tank must be at least thirty metres from any well
  shot(16, C(520, 190, 0.6, 640, 165, 0.72), function (u, d, t) {
    var s = courtyard(t, { gwTag: 1000 }) + build(t, plus(ALL, {})) + pump(PUMPX, t, { work: true, water: true });
    s += arrow(TX1 + 4, 70, PUMPX - 10, 70, "#f2c230", 4, clamp((u - 0.4) / 1.2)) + arrow(PUMPX - 10, 70, TX1 + 4, 70, "#f2c230", 4, clamp((u - 0.4) / 1.2));
    s += '<path d="M' + TX1 + ' 60 V' + GY + ' M' + PUMPX + ' 60 V' + (GY - 70) + '" stroke="#f2c230" stroke-width="3" stroke-dasharray="6 6" stroke-dashoffset="' + f(-t * 30) + '"/>';
    for (var m = 0; m < 6; m++) { var q = (t * 0.35 + m / 6) % 1; s += '<circle cx="' + f(lerp(TX1 + 20, PUMPX - 26, q)) + '" cy="' + f(70 + Math.sin(q * 20) * 5) + '" r="9" fill="#fff6c8" stroke="' + INK + '" stroke-width="2"/>'; }
    s += hardHat(PUMPX + 50, GY - 30, 0.3, t, "happy", {});
    return s + tag("30 متر على الأقل", 660, 20, u, 1.4, -3, 30, "#f2c230") + check(PUMPX + 120, 60, 1.1, ck(u, 2.4));
  });
  // 17 — but sludge piles up on the bottom year after year
  shot(17, C(330, 250, 1.6, 320, 255, 1.9), function (u, d, t) {
    var k = clamp(u / d), s = courtyard(t) + build(t, plus(ALL, { sludge: 0.2 + 0.85 * k, settle: true }));
    s += calendar(196, 250, 0.7, "سنة " + (1 + Math.floor(k * 3.99)), t, (k * 4) % 1);
    return s + tag("حمأة", 300, 330, u, 0.6, -3, 18, "#e8c48e");
  });
  // 18 — so there's a covered opening over each chamber, for the vacuum truck to suck it out
  shot(18, C(360, 150, 1.0, 420, 160, 0.95), function (u, d, t) {
    var tk = ease(clamp((u - 1.2) / 1.4)), sl = u > 2.6 ? lerp(1, 0.25, clamp((u - 2.6) / 1.4)) : 1;
    var s = courtyard(t) + build(t, plus(ALL, { lids: clamp(u / 1), open: u > 2.4 ? 296 : null, sludge: sl }));
    s += truck(lerp(700, 330, tk), t, { drive: tk < 1 ? 1 : 0, hose: u > 2.4 ? 296 : null });
    return s + tag("غطا", 230, 100, u, 0.6, -3, 16) + tag("عربية الكسح", 450, 40, u, 2.0, 3, 20);
  });
  // 19 — many people think the tank must be pumped every month, and that chlorine cleans it
  shot(19, C(330, 160, 1.1, 300, 150, 1.25), function (u, d, t) {
    var s = courtyard(t) + build(t, plus(ALL, { lids: 1 }));
    s += calendar(470, 70, 1.0, "كل شهر؟", t) + bottle(220, 90, 1.1, t, u > 2.0 ? -60 : -10);
    if (u > 2.2) for (var k = 0; k < 6; k++) { var p = (t * 1.2 + k / 6) % 1; s += '<circle cx="' + f(200 - p * 12) + '" cy="' + f(80 + p * 60) + '" r="2.4" fill="#7fc2ea"/>'; }
    s += hardHat(380, GY - 30, 0.22, t, "curious", {});
    return s + qmark(560, 30, t, 34) + qmark(160, 40, t + 1, 28);
  });
  // 20 — in truth chlorine kills the bacteria working for you, and a good tank is pumped every three to five years
  shot(20, C(300, 250, 1.8, 330, 190, 1.05), function (u, d, t) {
    var dead = u > 0.8 && u < 3.2, s = courtyard(t) + build(t, plus(ALL, { lids: 1, dead: dead }));
    if (u < 3.2) for (var k = 0; k < 8; k++) { var p = (t * 0.8 + k / 8) % 1; s += '<circle cx="' + f(300 + Math.sin(k * 2) * 30) + '" cy="' + f(lerp(IT, IB - 20, p)) + '" r="2.4" fill="#7fc2ea" opacity="' + f(1 - p) + '"/>'; }
    if (u < 3.2) s += cross(330, 200, 0.5, ck(u, 0.8)) + tag("الكلور بيموّتها", 300, 330, u, 0.6, -3, 15, "#f2a0a0");
    else s += calendar(520, 80, 1.0, "3 لـ 5", t) + check(520, 155, 0.9, ck(u, 3.6)) + tag("كسح كل 3 لـ 5 سنين", 330, 40, u, 3.4, 3, 22, "#f2c230");
    return s;
  });
  // 21 — finishing touches: a heavy cover for the kids, no oil or wipes, and only grass over the trenches
  shot(21, C(330, 150, 1.0, 420, 150, 1.05), function (u, d, t) {
    var s = courtyard(t) + build(t, plus(ALL, { lids: 1, grass: clamp((u - 2.6) / 1.4) }));
    s += tag("غطا تقيل", 300, 96, u, 0.3, -3, 16) + noSign(200, 60, 1, OIL, ck(u, 1.4)) + noSign(260, 60, 1, WIPES, ck(u, 1.9)) + tag("نجيلة بس", 570, 96, u, 2.8, 3, 16, "#b6e08a");
    for (var k = 0; k < 2; k++) s += mini(190 + k * 22, GY - 2, 0.38, ["#e2b035", "#3aa05a"][k], t + k, "happy");
    return s;
  });
  // 22 — and congratulations, you built a septic tank
  shot(22, C(340, 170, 1.15, 380, 180, 0.62), function (u, d, t) {
    var s = courtyard(t) + build(t, plus(ALL, { lids: 1, grass: 1 })) + pump(PUMPX, t, { work: true, water: true }) + family(t, "happy", 175);
    for (var k = 0; k < 10; k++) { var p = (t * 0.5 + k / 10) % 1; s += '<circle cx="' + f(150 + hash(k) * 600) + '" cy="' + f(-20 + p * 120) + '" r="3" fill="' + ["#f2c230", "#d8352a", "#3aa05a", "#2f6fb8"][k % 4] + '" transform="rotate(' + f(t * 90 + k * 30) + ' ' + f(150 + hash(k) * 600) + ' ' + f(-20 + p * 120) + ')"/>'; }
    return s + tag("مبروك!", 340, 20, u, 0.6, -3, 34, "#f2c230");
  });
  // 23 — tell us, what story next time?
  shot(23, C(300, 160, 0.75, 420, 150, 0.7), function (u, d, t) {
    return courtyard(t, { sky: "dusk" }) + build(t, plus(ALL, { lids: 1, grass: 1 })) + pump(PUMPX, t, { work: true, water: true }) + family(t, "happy", 175) + tag("قولولنا!", 380, 20, u, 0.4, 3, 34);
  });

  window.__parts = { courtyard: courtyard, build: build, ALL: ALL, pump: pump, truck: truck, family: family, tag: tag, hardHat: hardHat, T: T, bug: bug, check: check, cross: cross };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
