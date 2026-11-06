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

  // ── «ليه بنعطس؟»: a sagittal cut of the head (face to the right), the nose lining, the trigeminal nerve up to the
  // brainstem's sneeze centre, then the chest, the throat and the spray. Shapes are simplified from anatomy diagrams.
  var INK = "#1c1c1c", SKIN = "#f2c9a0", PINK = "#f08a9a", PINKD = "#c95b72", BRAIN = "#f6b3c0", BRAIND = "#d97d92",
      NERVE = "#ffd166", DUST = "#c9a24a", GERM = "#6fae4a", MUC = "#dbeeb0", ALERT = "#e2523a", AIR = "#7ec8e8";
  var HX = 320, HY = 170;
  var SKINP = "M0 -94 C42 -96 68 -70 70 -44 C71 -36 70 -30 73 -26 C77 -22 79 -14 82 -4 C85 4 88 9 86 12 C84 15 80 15 78 15 C76 17 77 20 75 22 C73 23 71 23 70 24 C72 26 73 29 72 31 C66 33 62 36 63 40 C64 43 70 45 70 48 C70 56 73 66 76 72 C72 80 66 84 60 90 C56 96 52 104 52 116 L-42 116 C-56 98 -72 80 -77 56 C-82 30 -82 -10 -76 -40 C-70 -70 -48 -92 0 -94 Z";
  var SKULLP = "M-78 -40 C-80 -80 -50 -92 -8 -90 C30 -88 50 -66 50 -40 C50 -26 46 -16 40 -8 C30 -2 14 -4 -4 -4 C-30 -4 -58 -6 -68 -20 C-76 -28 -78 -34 -78 -40 Z";
  var CEREBP = "M-46 4 C-34 -4 -14 -2 -10 8 C-8 18 -22 26 -38 24 C-52 22 -58 12 -46 4 Z";
  var BRAINP = "M44 -12 C58 -34 58 -62 44 -74 C30 -86 6 -86 -14 -82 C-40 -78 -62 -66 -66 -40 C-68 -22 -60 -6 -44 0 C-30 4 -16 0 -4 -2 C12 -4 30 -4 44 -12 Z";
  var NOSEP = "M78 7 C62 -2 42 -8 26 -6 C14 -4 6 6 -2 14 L-4 26 C6 22 20 18 36 16 C54 15 68 14 78 13 Z";
  var TURB = ["M72 4 C58 1 48 1 38 5", "M66 10 C54 8 44 9 34 13", "M60 15 C50 14 42 15 36 18"];
  var STEMP = "M-20 -2 C-8 -2 0 2 4 10 L2 36 C-2 44 -18 44 -22 34 C-24 22 -24 6 -20 -2 Z";
  var NERVEP = [[48, 8], [40, -6], [18, -26]], OPTP = [[40, -46], [26, -68], [0, -48]];
  var ZIGP = "M40 -6 L30 -16 L24 -8 L16 -24 L10 -16 L2 -34 L-6 -28 L-14 -46";
  var SHIELD = "M0 -40 L34 -26 L30 6 C26 26 12 36 0 42 C-12 36 -26 26 -30 6 L-34 -26 Z";
  function qb(p, u) { var k = 1 - u; return [k * k * p[0][0] + 2 * k * u * p[1][0] + u * u * p[2][0], k * k * p[0][1] + 2 * k * u * p[1][1] + u * u * p[2][1]]; }
  function qd(p) { return "M" + p[0][0] + " " + p[0][1] + " Q" + p[1][0] + " " + p[1][1] + " " + p[2][0] + " " + p[2][1]; }

  // the head: skin outline, brain, brainstem, nasal lining, trigeminal nerve (o.nerve: signal running), optic nerve, eye.
  // o: {s, x, y, brain (0..1 alarm glow), stem (highlight), center (sneeze centre pulses), cilia, nerve, optic, zig, mood, air}
  function profile(t, o) {
    o = o || {}; var s = o.s || 1, x = o.x == null ? HX : o.x, y = (o.y == null ? HY : o.y) + 3 * Math.sin(t * 2.2), pu = 0.5 + 0.5 * Math.sin(t * 5), g = "", i, q;
    g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="' + SKINP + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
    // skull, then the cerebrum (cortex outline, folds, white matter arch, ventricle, thalamus)
    g += '<path d="' + SKULLP + '" fill="none" stroke="#efe6d2" stroke-width="7"/><path d="' + SKULLP + '" fill="none" stroke="#b5a58a" stroke-width="1"/>';
    g += '<path d="' + BRAINP + '" fill="' + BRAIN + '" stroke="' + BRAIND + '" stroke-width="2"/>';
    g += '<path d="M-14 -62 C-4 -70 10 -68 16 -58 M-40 -60 C-30 -66 -20 -66 -14 -62 M-52 -40 C-44 -48 -36 -44 -30 -36 M-50 -18 C-42 -22 -34 -18 -28 -12 M-16 -18 C-8 -24 2 -20 6 -12 M22 -40 C30 -46 40 -44 42 -34 M26 -24 C32 -28 38 -26 40 -18" stroke="' + BRAIND + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-18 -36 C-6 -48 14 -48 26 -34" stroke="#fff3e6" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M-18 -36 C-6 -48 14 -48 26 -34" stroke="' + BRAIND + '" stroke-width="1" fill="none"/>';
    g += '<path d="M-8 -28 C0 -40 14 -38 18 -26 C12 -22 2 -20 -8 -28 Z" fill="#f7e6d8" stroke="' + BRAIND + '" stroke-width="1"/>';
    g += '<ellipse cx="2" cy="-16" rx="7" ry="5" fill="#f08fa3" stroke="' + BRAIND + '" stroke-width="1"/>';
    if (o.brain) g += '<path d="' + BRAINP + '" fill="' + ALERT + '" opacity="' + f((0.2 + 0.35 * pu) * o.brain) + '"/>';
    // cerebellum with its folia, then the brainstem (pons, medulla) and the spinal cord going down the neck
    g += '<path d="' + CEREBP + '" fill="#e58aa0" stroke="' + BRAIND + '" stroke-width="1.4"/><path d="M-46 8 q7 -4 14 0 M-40 13 q7 -4 14 0 M-32 17 q6 -3 12 0 M-24 10 q4 -3 8 0" stroke="' + BRAIND + '" stroke-width="1" fill="none"/>';
    g += '<path d="' + STEMP + '" fill="' + (o.stem ? NERVE : "#e9a3b4") + '" stroke="' + INK + '" stroke-width="' + (o.stem ? 2.6 : 1.2) + '"/>';
    g += '<rect x="-15" y="38" width="9" height="34" rx="4" fill="#e9a3b4" stroke="' + INK + '" stroke-width="1"/>';
    // the nose: cavity with turbinates and a clear nostril
    g += '<path d="' + NOSEP + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/>';
    for (q = 0; q < TURB.length; q++) g += '<path d="' + TURB[q] + '" fill="none" stroke="#f7c0c8" stroke-width="3" stroke-linecap="round"/><path d="' + TURB[q] + '" fill="none" stroke="' + PINKD + '" stroke-width="0.8" opacity=".6"/>';
    g += '<ellipse cx="79" cy="11" rx="4" ry="2.6" fill="#6d3340" stroke="' + INK + '" stroke-width="0.8"/>';
    // the open mouth from the side: palate, tongue, uvula
    g += '<path d="M72 31 C62 33 48 36 38 40 C30 44 32 50 40 51 C52 52 62 47 70 48 C66 42 64 40 63 40 C66 37 70 34 72 31 Z" fill="#7a2f3e" stroke="' + INK + '" stroke-width="1.2"/>';
    g += '<path d="M70 33 C58 32 46 34 38 38" stroke="#e8a0a8" stroke-width="2" fill="none" stroke-linecap="round"/>';
    g += '<path d="M66 46 C56 50 44 50 36 47 C44 54 60 55 68 49 Z" fill="#e0707f" stroke="#a94a5a" stroke-width="1"/>';
    g += '<ellipse cx="32" cy="42" rx="3" ry="4" fill="#e0707f"/>';
    if (o.center) g += '<circle cx="-6" cy="26" r="' + f(7 + 9 * pu) + '" fill="' + ALERT + '" opacity="' + f(0.3 + 0.4 * pu) + '"/>';
    g += '<circle cx="-6" cy="26" r="3.6" fill="' + ALERT + '" stroke="' + INK + '" stroke-width="1"/>';
    if (o.cilia) for (i = 0; i < 7; i++) { var cx = 14 + i * 9, wv = Math.sin(t * 7 + i * 1.7) * 4; g += '<path d="M' + cx + ' 14 q' + f(wv) + ' -4 ' + f(wv * 1.2) + ' -8" stroke="' + PINKD + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>'; }
    g += '<path d="' + qd(NERVEP) + '" stroke="' + (o.nerve ? NERVE : BRAIND) + '" stroke-width="' + (o.nerve ? 3 : 1.4) + '" fill="none" stroke-dasharray="3 3"/>';
    if (o.nerve) for (i = 0; i < 3; i++) { var p = qb(NERVEP, (t * 0.9 + i / 3) % 1); g += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="3" fill="' + NERVE + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    if (o.optic) { g += '<path d="' + qd(OPTP) + '" stroke="' + AIR + '" stroke-width="3" fill="none"/>'; for (i = 0; i < 3; i++) { var qq = qb(OPTP, (t * 0.8 + i / 3) % 1); g += '<circle cx="' + f(qq[0]) + '" cy="' + f(qq[1]) + '" r="2.6" fill="' + AIR + '"/>'; } }
    if (o.zig) g += '<path d="' + ZIGP + '" stroke="' + ALERT + '" stroke-width="3" fill="none" stroke-linejoin="round" stroke-dasharray="' + (2 + pu * 3).toFixed(1) + ' 2"/>';
    g += '<g transform="translate(40 -46)">' + eyes(o.mood || "n", t, 8) + '</g>';
    if (o.air) g += airflow(t, 90, 170, 2, 6, "#ffffff", 1.4, 4);
    return g + "</g>";
  }
  // the chest (side view): lungs grow with b (0..1), the diaphragm drops with them, abdominal muscles can glow
  function bob(t, g) { return '<g transform="translate(0 ' + f(2.5 * Math.sin(t * 2.2)) + ')">' + g + "</g>"; }
  function torso(t, o) {
    o = o || {}; var b = (o.b || 0) + 0.12 * Math.sin(t * 4), pu = 0.5 + 0.5 * Math.sin(t * 6), g = "";
    g += '<path d="M276 110 C300 98 340 98 364 110 C384 122 388 170 384 230 C380 268 360 286 320 288 C280 286 262 268 258 230 C254 170 258 122 276 110 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/>';
    var lr = 24 + 10 * b + 1.5 * Math.sin(t * 2);
    g += '<ellipse cx="296" cy="168" rx="' + f(lr * 0.62) + '" ry="' + f(lr) + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/><ellipse cx="344" cy="168" rx="' + f(lr * 0.62) + '" ry="' + f(lr) + '" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="1.6"/>';
    var dy = 220 + 14 * b;
    g += '<path d="M268 ' + f(dy) + ' Q320 ' + f(dy - 28) + ' 372 ' + f(dy) + '" stroke="' + ALERT + '" stroke-width="' + (o.dia ? 4 : 2.4) + '" fill="none"/>';
    for (var i = 0; i < 4; i++) { var ay = 238 + i * 9; g += '<path d="M296 ' + ay + ' H346" stroke="' + (o.abs ? ALERT : BRAIND) + '" stroke-width="2" opacity="' + f(o.abs ? 0.35 + 0.5 * pu : 0.6) + '"/>'; }
    if (o.air) g += airflow(t, 200, 258, 200, 5, AIR, 1.2, 2);
    return bob(t, g);
  }
  // the throat from the front: a tube with two vocal folds; c = how closed the folds are (0 open .. 1 shut)
  function throat(t, c) {
    var gap = 36 * (1 - c), g = '<rect x="280" y="30" width="80" height="300" fill="' + PINK + '" stroke="' + PINKD + '" stroke-width="3"/>';
    for (var i = 0; i < 9; i++) g += '<path d="M280 ' + (50 + i * 30) + ' H360" stroke="' + PINKD + '" stroke-width="2" opacity=".5"/>';
    for (var m = 0; m < 8; m++) g += '<circle cx="' + f(296 + hash(m) * 48) + '" cy="' + f(40 + ((t * 30 + m * 40) % 260)) + '" r="3.2" fill="' + MUC + '" stroke="' + PINKD + '" stroke-width="1"/>';
    g += '<path d="M280 170 L' + f(320 - gap) + ' 170" stroke="' + PINKD + '" stroke-width="9" stroke-linecap="round"/><path d="M360 170 L' + f(320 + gap) + ' 170" stroke="' + PINKD + '" stroke-width="9" stroke-linecap="round"/>';
    return g;
  }
  // bacteria: rods (bacilli) with a wavy flagellum, and cocci in short chains; mucus: a wobbling translucent gel blob
  function bacillus(x, y, a, t, sc) {
    var w = 4 * Math.sin(t * 8 + x), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + sc + ')">';
    g += '<path d="M-10 0 C-16 ' + f(w) + ' -22 ' + f(-w) + ' -30 0 S-40 ' + f(-w) + ' -46 0" stroke="#5b7f3a" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
    g += '<rect x="-10" y="-4.5" width="20" height="9" rx="4.5" fill="#8fc85a" stroke="#3d6b2a" stroke-width="1"/>';
    g += '<ellipse cx="-3" cy="-2" rx="4.5" ry="1.4" fill="#eaffc4" opacity=".75"/></g>';
    return g;
  }
  function coccus(x, y, a, t, sc) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + sc + ')">', i;
    for (i = -1; i <= 1; i++) g += '<circle cx="' + (i * 7.5) + '" cy="' + f(Math.sin(t * 5 + i) * 0.8) + '" r="4.2" fill="#9ed46a" stroke="#3d6b2a" stroke-width="1"/><circle cx="' + (i * 7.5 - 1.2) + '" cy="-1.6" r="1.1" fill="#eaffc4" opacity=".8"/>';
    return g + '</g>';
  }
  function mucus(x, y, r, t) {
    var d = "", i, a, k;
    for (i = 0; i < 9; i++) { a = i * 2 * Math.PI / 9; k = r * (1 + 0.12 * Math.sin(t * 3 + i * 1.7)); d += (i ? " L" : "M") + f(x + Math.cos(a) * k) + " " + f(y + Math.sin(a) * k); }
    return '<path d="' + d + ' Z" fill="' + MUC + '" fill-opacity=".85" stroke="#a9c96e" stroke-width="1.2"/><ellipse cx="' + f(x - r * 0.3) + '" cy="' + f(y - r * 0.35) + '" rx="' + f(r * 0.35) + '" ry="' + f(r * 0.18) + '" fill="#fff" opacity=".7"/>';
  }
  function bgIn(t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f6e7d6"/>';
    for (var i = 0; i < 26; i++) { var x = -300 + hash(i) * 1240 + Math.sin(t * 0.7 + i) * 8, y = ((hash(i + 5) * 700 - t * (30 + hash(i) * 40)) % 700 + 700) % 700 - 300; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1.2 + hash(i + 2) * 2.2) + '" fill="#d9b48f" opacity=".6"/>'; }
    return s;
  }
  function puffs(t, x, y0, n, col) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 1.6 + i / n) % 1, y = y0 - u * 260, px = x + Math.sin(u * 8 + i) * 16; s += '<circle cx="' + f(px) + '" cy="' + f(y) + '" r="' + f(4 + u * 14) + '" fill="' + (col || "#ffffff") + '" stroke="' + AIR + '" stroke-width="1.4" opacity="' + f(1 - u) + '"/>'; } return s; }
  function rays(t, cx, cy, n, len, col) { var s = "", i; for (i = 0; i < n; i++) { var a = t * 0.6 + i * 2 * Math.PI / n, L2 = len * (0.7 + 0.3 * Math.sin(t * 3 + i)); s += '<path d="M' + f(cx + Math.cos(a) * 60) + ' ' + f(cy + Math.sin(a) * 60) + ' L' + f(cx + Math.cos(a) * L2) + ' ' + f(cy + Math.sin(a) * L2) + '" stroke="' + (col || "#ffffff") + '" stroke-width="10" stroke-linecap="round" opacity=".35"/>'; } return s; }
  function sparks(t, cx, cy, rx, ry, n) { var s = ""; for (var i = 0; i < n; i++) { var a = t * 4 + i * 2 * Math.PI / n; s += '<circle cx="' + f(cx + Math.cos(a) * rx) + '" cy="' + f(cy + Math.sin(a) * ry) + '" r="2.6" fill="' + NERVE + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; }
  function paper(t, i) { var x = 300 + ((hash(i) * 260 + t * 150) % 340), y = 100 + hash(i + 3) * 160 + Math.sin(t * 3 + i) * 8; return '<rect x="' + f(x - 11) + '" y="' + f(y - 8) + '" width="22" height="16" fill="#fff" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + f(t * 200 + i * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>'; }
  function alarm(x, y, t, sc) { var k = (sc || 1) * (1 + 0.12 * Math.sin(t * 8)); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><path d="M0 -30 L30 22 L-30 22 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><text y="14" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:' + INK + '">!</text></g>'; }
  function qmk(x, y, t, sz) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:#f2c230;stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // label at the top of the visible area of a camera centred on (cx, cy) with zoom z (screen size scr px)
  function vt(cx, cy, z, text, u, u0, scr, col) { return tag(text, cx, cy - 130 / z, u, u0, -3, scr / z, col); }

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function sk(t) { return sky("day") + clouds(t, 30, 40, 4, 0.85); }
  function zoom(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }
  function still(x, y, z) { return function () { return [x, y, z]; }; }

  // 0 — hook: a sneeze blows the papers off the desk
  shot(0, zoom(320, 170, 1.0, 320, 170, 1.1), function (u, d, t) {
    var s = sk(t), i;
    for (i = 0; i < 6; i++) s += paper(t, i);
    return s + profile(t, { x: 300, mood: "shock", air: 1 }) + vt(320, 180, 1, "عطسة في ثانية!", u, 0.6, 24);
  });
  // 1 — the sneeze is fast and complicated
  shot(1, still(320, 170, 1.0), function (u, d, t) {
    return sk(t) + profile(t, { brain: 1 }) + sparks(t, 300, 130, 48, 40, 8) + vt(320, 180, 1, "أسرع وأعقد!", u, 0.6, 24);
  });
  // 2 — the question
  shot(2, still(320, 170, 1.05), function (u, d, t) {
    return sk(t) + profile(t, { mood: "curious", brain: 0.3 }) + qmk(232, 110, t, 46) + qmk(410, 110, t, 36) + vt(320, 180, 1, "ليه ده؟", u, 0.6, 24);
  });
  // 3 — the brand line
  shot(3, still(320, 170, 1.0), function (u, d, t) {
    return sk(t) + rays(t, 320, 170, 12, 230, "#fff3c4") + profile(t, { mood: "happy" }) + vt(320, 180, 1, "إيه الحكاية؟", u, 0.5, 26);
  });
  // 4 — zoom to the nose
  shot(4, zoom(320, 170, 1.0, 362, 176, 1.5), function (u, d, t) {
    return sk(t) + profile(t, {}) + arrow(440, 60, 404, 166, ALERT, 5, clamp(u / 1.2)) + vt(362, 176, 1.5, "الأنف!", u, 0.9, 22);
  });
  // 5 — inside the nose: hairs (cilia) filter the air
  shot(5, zoom(350, 174, 2.0, 350, 174, 2.4), function (u, d, t) {
    return bgIn(t) + profile(t, { cilia: 1 }) + airflow(t, 300, 420, 180, 6, AIR, 1.2, 2) + vt(350, 174, 2.4, "شعيرات بتصفّي الهوا", u, 0.6, 18);
  });
  // 6 — a dust particle touches the lining and the nerves fire
  shot(6, zoom(370, 172, 2.0, 370, 172, 2.1), function (u, d, t) {
    var k = clamp(u / (d * 0.55)), dx = lerp(450, 376, ease(k)), dy = lerp(130, 176, ease(k)), touch = u > d * 0.55;
    var s = bgIn(t) + profile(t, { cilia: 1, nerve: touch ? 1 : 0 });
    s += '<circle cx="' + f(dx) + '" cy="' + f(dy) + '" r="' + f(touch ? 7 + 1.5 * Math.sin(t * 9) : 6) + '" fill="' + DUST + '" stroke="' + INK + '" stroke-width="1.4"/>';
    return s + vt(370, 172, 2.1, "جزيء غريب!", u, 0.5, 18);
  });
  // 7 — the trigeminal nerve
  shot(7, zoom(350, 160, 1.9, 350, 160, 2.0), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1 }) + vt(350, 160, 2.0, "العصب ثلاثي التوائم", u, 0.6, 19);
  });
  // 8 — the signal reaches the brain
  shot(8, zoom(320, 150, 1.5, 320, 150, 1.6), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1, brain: 0.6 }) + alarm(250, 100, t, pop(u / 0.6)) + vt(320, 150, 1.6, "إنذار للمخ!", u, 0.5, 20);
  });
  // 9 — the brainstem
  shot(9, zoom(314, 196, 1.8, 314, 196, 1.9), function (u, d, t) {
    return sk(t) + profile(t, { stem: 1 }) + '<circle cx="314" cy="196" r="' + f(30 + 3 * Math.sin(t * 4)) + '" fill="none" stroke="' + NERVE + '" stroke-width="3" stroke-dasharray="6 6"/>' + vt(314, 196, 1.9, "جذع المخ", u, 0.6, 22);
  });
  // 10 — the sneeze centre
  shot(10, zoom(314, 196, 2.6, 314, 196, 2.8), function (u, d, t) {
    return sk(t) + profile(t, { stem: 1, center: 1 }) + vt(314, 196, 2.8, "مركز العطس", u, 0.6, 22);
  });
  // 11 — the irritant has to be pushed out
  shot(11, zoom(324, 164, 1.25, 324, 164, 1.3), function (u, d, t) {
    var s = sk(t) + profile(t, { center: 1, mood: "worry" }), i;
    for (i = 0; i < 6; i++) { var x = 400 + ((t * 120 + i * 60) % 170), y = 165 + Math.sin(t * 5 + i) * 20; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.4" fill="' + DUST + '" opacity="' + f(1 - (x - 400) / 170) + '"/>'; }
    return s + vt(324, 164, 1.3, "لازم نطردها!", u, 0.6, 22);
  });
  // 12 — the orders go down the spine to the chest and the belly
  shot(12, still(320, 190, 1.0), function (u, d, t) {
    var s = sk(t) + torso(t, { abs: 1 }), i;
    for (i = 0; i < 5; i++) s += '<circle cx="320" cy="' + f(60 + ((t * 60 + i * 12) % 40) + i * 6) + '" r="3" fill="' + ALERT + '"/>';
    return s + vt(320, 190, 1, "عضلات الصدر والبطن", u, 0.6, 22);
  });
  // 13 — the deep breath in
  shot(13, still(320, 190, 1.0), function (u, d, t) {
    return sk(t) + torso(t, { b: ease(clamp(u / d)), air: 1, dia: 1 }) + vt(320, 190, 1, "شهيق عميق", u, 0.6, 22);
  });
  // 14 — the voice box closes and the pressure builds
  shot(14, still(320, 170, 1.2), function (u, d, t) {
    var c = ease(clamp(u / (d * 0.8)));
    return bgIn(t) + throat(t, c) + gauge(420, 120, 26, c, "الضغط") + vt(320, 170, 1.2, "المزمار اتقفل!", u, 0.6, 22);
  });
  // 15 — the flaps burst open and the air comes out
  shot(15, still(320, 170, 1.2), function (u, d, t) {
    var c = 1 - ease(clamp((u - d * 0.45) / (d * 0.2)));
    return bgIn(t) + throat(t, c) + puffs(t, 320, 160, 16) + vt(320, 170, 1.2, "فجأة!", u, 0.4, 24);
  });
  // 16 — the speed
  shot(16, still(320, 180, 1.0), function (u, d, t) {
    var s = bgIn(t) + airflow(t, -60, 700, 90, 12, AIR, 2.2, 8) + airflow(t, -60, 700, 260, 10, AIR, 2.0, 6);
    return s + gauge(320, 190, 90, ease(clamp(u / (d * 0.8))), "كم/س") + vt(320, 180, 1, "160 كم في الساعة", u, 0.6, 22);
  });
  // 17 — as fast as a car on the highway
  shot(17, still(320, 180, 1.0), function (u, d, t) {
    return sk(t) + grass(t, 230, "#9dbb6e", "#6f9548") + '<rect x="-400" y="250" width="1440" height="60" fill="url(#road)"/>' + cars(t, 276, 260) + airflow(t, -40, 320, 218, 5, AIR, 2, 3) + vt(320, 180, 1, "أسرع من عربية!", u, 0.6, 22);
  });
  // 18 — mucus and germs fly out
  shot(18, still(330, 170, 1.0), function (u, d, t) {
    var s = bgIn(t), i, a, r, x, y;
    for (i = 0; i < 14; i++) {
      a = (hash(i) - 0.5) * 1.2; r = ((t * 90 + i * 30) % 300); x = 330 + Math.cos(a) * r; y = 170 + Math.sin(a) * r * 0.7;
      s += i % 3 === 0 ? mucus(x, y, 6, t) : i % 3 === 1 ? bacillus(x, y, a * 57 + t * 20, t, 1.1) : coccus(x, y, a * 57, t, 1);
    }
    return s + profile(t, { x: 250 }) + vt(330, 170, 1, "مخاط وجراثيم!", u, 0.6, 22);
  });
  // 19 — the eyes shut on their own
  shot(19, still(320, 170, 1.0), function (u, d, t) {
    var h = 22 * ease(clamp(u / (d * 0.5))), s = sk(t) + '<circle cx="320" cy="170" r="76" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/>', i, ex;
    for (i = 0; i < 2; i++) { ex = i ? 342 : 298; s += '<circle cx="' + ex + '" cy="160" r="9" fill="' + INK + '"/><rect x="' + (ex - 11) + '" y="148" width="22" height="' + f(h) + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="1.4"/>'; }
    return bob(t, s) + vt(320, 170, 1, "عينك بتقفل!", u, 0.8, 22);
  });
  // 20 — the bright light
  shot(20, still(320, 180, 1.0), function (u, d, t) {
    var s = sk(t) + '<circle cx="520" cy="70" r="28" fill="#ffd54a"/>', i, a;
    for (i = 0; i < 8; i++) { a = t * 0.3 + i * Math.PI / 4; s += '<path d="M' + f(520 + Math.cos(a) * 40) + ' ' + f(70 + Math.sin(a) * 40) + ' L' + f(520 + Math.cos(a) * 62) + ' ' + f(70 + Math.sin(a) * 62) + '" stroke="#ffd54a" stroke-width="3" stroke-linecap="round" opacity="' + f(0.5 + 0.5 * Math.sin(t * 6 + i)) + '"/>'; }
    return s + bob(t, head(320, 200, 60, "shock", t)) + vt(320, 180, 1, "الضوء القوي!", u, 0.7, 22);
  });
  // 21 — the light nerve and the nose nerve cross in the brain
  shot(21, zoom(330, 130, 1.7, 330, 130, 1.8), function (u, d, t) {
    return sk(t) + profile(t, { nerve: 1, optic: 1, brain: 0.6 }) + vt(330, 130, 1.8, "إشارات بتتخلط!", u, 0.6, 20);
  });
  // 22 — the signal is routed wrongly
  shot(22, zoom(320, 150, 1.5, 320, 150, 1.6), function (u, d, t) {
    return sk(t) + profile(t, { zig: 1, brain: 0.8 }) + vt(320, 150, 1.6, "المخ بيفهمها عطسة!", u, 0.6, 20);
  });
  // 23 — the spray reaches about 8 metres
  shot(23, still(320, 180, 0.95), function (u, d, t) {
    var s = sk(t) + grass(t, 262, "#9dbb6e", "#6f9548") + profile(t, { x: 210, y: 150, s: 0.7 }), i, x, y;
    for (i = 0; i < 40; i++) { x = 266 + ((hash(i) * 600 + t * 180) % 520); y = 150 + (hash(i + 7) - 0.5) * 40 + Math.sin(t * 4 + i) * 6; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="2" fill="#bfe6f7" stroke="#2f7fb8" stroke-width=".6"/>'; }
    return s + arrow(266, 300, 586, 300, INK, 2.4, clamp(u / (d * 0.7))) + vt(320, 180, 0.95, "حوالي تمانية متر!", u, 1.0, 22);
  });
  // 24 — the hand over the mouth, then washing
  shot(24, still(320, 180, 1.0), function (u, d, t) {
    var s = sk(t) + bob(t, head(300, 170, 70, "happy", t)), i, x, y;
    s += '<ellipse cx="' + f(346 + Math.sin(t * 8) * 2) + '" cy="206" rx="20" ry="15" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/>';
    for (i = 0; i < 10; i++) { y = 230 - ((t * 40 + i * 25) % 120); x = 346 + Math.sin(t * 6 + i) * 14 + (hash(i) - 0.5) * 30; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(3 + hash(i + 3) * 4) + '" fill="#fff" stroke="#8fb6cf" stroke-width="1.2"/>'; }
    return s + vt(320, 180, 1, "اغسل إيدك!", u, 0.8, 22);
  });
  // 25 — the body protects itself
  shot(25, still(320, 180, 1.0), function (u, d, t) {
    return sk(t) + bob(t, head(300, 170, 62, "happy", t)) + '<g transform="translate(430 170) scale(' + f(pop(u / 0.9)) + ')"><path d="' + SHIELD + '" fill="#4f8fd8" stroke="' + INK + '" stroke-width="2.6"/><path d="M-14 0 L-4 10 L16 -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>' + vt(320, 180, 1, "حماية تلقائية", u, 0.6, 22);
  });
  // 26 — outro
  shot(26, zoom(300, 180, 1.0, 340, 180, 1.0), function (u, d, t) {
    return sk(t) + rays(t, 320, 170, 12, 260, "#fff3c4") + profile(t, { x: 320, y: 170, s: 0.9, mood: "happy" }) + tag("قولولنا!", 460, 60, u, 0.4, 3, 26);
  });

  window.__parts = { profile: profile, torso: torso, throat: throat };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 18 * Math.sin(t * 1.7), cy = c[1] + 14 * Math.cos(t * 1.7), z = c[2] * (1 + 0.04 * Math.sin(t * 1.3));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
