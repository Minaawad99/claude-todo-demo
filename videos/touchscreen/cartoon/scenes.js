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

  // ── new pieces for this episode: a phone in 3/4 view, the touch stack exploded in isometric (cover glass, the ITO sensor
  // with diamond row/column electrodes, the display), the controller chip on its flex, a finger, a glove, a sausage ──
  var INK = "#1c1c1c", RED = "#d8352a", YEL = "#f2c230", BLUE = "#2f7fd8", CY = "#7fd3ff", OR = "#f08a24";
  function graphPaper(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#f4efe4"/>', o = (t * 36) % 40, d = "";
    for (var x = -400; x < 1060; x += 40) d += "M" + f(x + o) + " -300 V660 "; for (var y = -300; y < 680; y += 40) d += "M-400 " + f(y + o * 0.6) + " H1040 ";
    return s + '<path d="' + d + '" stroke="#d9cdb3" stroke-width="2"/>'; }
  function dark(t) { var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#141a24"/>'; for (var i = 0; i < 30; i++) { var u = (t * 0.05 + hash(i)) % 1; s += '<circle cx="' + f(-200 + hash(i + 3) * 1040) + '" cy="' + f(lerp(400, -100, u)) + '" r="' + f(1 + hash(i) * 2) + '" fill="' + CY + '" opacity="' + f(0.3 * Math.sin(Math.PI * u)) + '"/>'; } return s; }
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || YEL) + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  // isometric projection: (x, y) on the layer plane, z up
  var IS = { cx: 320, cy: 210, k: 1 };
  function P(x, y, z) { return [IS.cx + (x - y) * 0.866 * IS.k, IS.cy + (x + y) * 0.5 * IS.k - z * IS.k]; }
  function pp(a) { return f(a[0]) + " " + f(a[1]); }
  function slab(W, H, z, th, top, side, o) {   // a flat layer W×H at height z with thickness th
    o = o || {}; var a = P(0, 0, z), b = P(W, 0, z), c = P(W, H, z), d = P(0, H, z), b2 = P(W, 0, z - th), c2 = P(W, H, z - th), d2 = P(0, H, z - th);
    return '<path d="M' + pp(b) + ' L' + pp(c) + ' L' + pp(c2) + ' L' + pp(b2) + ' Z" fill="' + side + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + pp(d) + ' L' + pp(c) + ' L' + pp(c2) + ' L' + pp(d2) + ' Z" fill="' + side + '" stroke="' + INK + '" stroke-width="1.4" opacity=".85"/>' +
      '<path d="M' + pp(a) + ' L' + pp(b) + ' L' + pp(c) + ' L' + pp(d) + ' Z" fill="' + top + '" stroke="' + INK + '" stroke-width="' + (o.sw || 1.8) + '" opacity="' + (o.op == null ? 1 : o.op) + '"/>';
  }
  // the ITO sensor: diamond pads joined in rows (TX) and columns (RX). o: {rows, cols, z, glow (fn i,j → 0..1), split (0 = merged, 1 = rows and cols apart)}
  function sensor(W, H, z, t, o) {
    o = o || {}; var n = o.n || 8, m = o.m || 12, dx = W / n, dy = H / m, s = slab(W, H, z, 3, "url(#gGlassL)", "#9fc8e0", { op: 0.8 }), sp = (o.split || 0) * 26;
    function dia(x, y, zz, col, op) { var r = Math.min(dx, dy) * 0.42; return '<path d="M' + pp(P(x, y - r, zz)) + ' L' + pp(P(x + r, y, zz)) + ' L' + pp(P(x, y + r, zz)) + ' L' + pp(P(x - r, y, zz)) + ' Z" fill="' + col + '" opacity="' + (op || 0.75) + '" stroke="' + INK + '" stroke-width=".5"/>'; }
    for (var j = 0; j < m; j++) { s += '<path d="M' + pp(P(0, (j + 0.5) * dy, z + sp)) + ' L' + pp(P(W, (j + 0.5) * dy, z + sp)) + '" stroke="' + BLUE + '" stroke-width="1.6" opacity=".7"/>'; for (var i = 0; i < n; i++) s += dia((i + 0.5) * dx, (j + 0.5) * dy, z + sp, BLUE, 0.55); }
    for (var i2 = 0; i2 < n; i2++) { s += '<path d="M' + pp(P((i2 + 0.5) * dx, 0, z)) + ' L' + pp(P((i2 + 0.5) * dx, H, z)) + '" stroke="' + OR + '" stroke-width="1.6" opacity=".75"/>'; for (var j2 = 0; j2 < m; j2++) s += dia(i2 * dx + dx, (j2 + 0.5) * dy, z, OR, 0.45); }
    if (o.glow) for (var a = 0; a < n; a++) for (var b = 0; b < m; b++) { var g = o.glow(a, b); if (g > 0.02) { var q = P((a + 0.5) * dx, (b + 0.5) * dy, z + sp / 2); s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="' + f((o.heat ? 26 : 10) * g + 2) + '" ry="' + f((o.heat ? 15 : 6) * g + 1) + '" fill="' + (o.heat ? "url(#gHeat)" : "url(#gNode)") + '" opacity="' + f(Math.min(1, g * 1.2)) + '"/>'; } }
    return s;
  }
  function display(W, H, z, t) { var s = slab(W, H, z, 8, "url(#gScr)", "#2b2e33"); for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) { var x = 30 + c * (W - 60) / 2, y = 40 + r * (H - 80) / 3, q = P(x, y, z); s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="10" ry="6" fill="#fff" opacity=".55"/>'; } return s; }
  function chip(x, y, t, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')"><path d="M-80 30 C-40 30 -40 0 0 0" stroke="#c9a04e" stroke-width="16" fill="none" opacity=".9"/><rect x="-30" y="-28" width="60" height="56" rx="4" fill="url(#gChip)" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) s += '<path d="M' + (-24 + k * 10) + ' -28 v-6 M' + (-24 + k * 10) + ' 28 v6" stroke="#c9ced4" stroke-width="2"/>';
    return s + '<text y="4" text-anchor="middle" style="font:800 9px Noto Serif;fill:#9aa2ac;direction:ltr">TOUCH IC</text><circle cx="18" cy="-16" r="3" fill="' + (Math.sin(t * 9) > 0 ? "#7cf29a" : "#245a30") + '"/></g>'; }
  // a phone in 3/4 view (front), with apps; o: {s, rot, ripple:[x,y,u], screen fn}
  function phone(x, y, t, o) {
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + (o.s || 1) + ')">';
    s += '<rect x="-72" y="-140" width="150" height="290" rx="26" fill="#0b0d10" opacity=".25" transform="translate(8 8)"/><rect x="-75" y="-145" width="150" height="290" rx="26" fill="url(#gPhone)" stroke="' + INK + '" stroke-width="2.6"/><rect x="-66" y="-134" width="132" height="268" rx="18" fill="url(#gScr)"/>';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) s += '<rect x="' + (-56 + c * 30) + '" y="' + (-110 + r * 40) + '" width="22" height="22" rx="6" fill="' + ["#fff", "#ffd23a", "#7cf29a", "#7fd3ff", "#ffb08a"][(r + c) % 5] + '" opacity=".85"/>';
    s += '<rect x="-20" y="-128" width="40" height="8" rx="4" fill="#0b0d10"/><path d="M-60 -130 L20 -130 L-60 30 Z" fill="#fff" opacity=".08"/>';
    if (o.ripple) { var ru = o.ripple[2]; if (ru > 0 && ru < 1) s += '<circle cx="' + o.ripple[0] + '" cy="' + o.ripple[1] + '" r="' + f(6 + ru * 40) + '" fill="none" stroke="#fff" stroke-width="3" opacity="' + f(1 - ru) + '"/>'; }
    if (o.x) s += '<path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + RED + '" stroke-width="10" stroke-linecap="round" opacity="' + f(o.x) + '"/>';
    return s + '</g>'; }
  function finger(x, y, ang, o) {   // an index finger pointing down at (x,y): skin, nail; o: {glove, sausage, s}
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ') scale(' + (o.s || 1) + ')">';
    if (o.sausage) return s + '<path d="M-14 -150 L-14 -10 C-14 4 14 4 14 -10 L14 -150" fill="url(#gSausage)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-6 -140 V-20" stroke="#f2a08a" stroke-width="3" opacity=".6"/><path d="M-26 -150 h52 v-70 h-52 Z" fill="url(#gGlove)" stroke="' + INK + '" stroke-width="2.4"/></g>';
    var fill = o.glove ? "url(#gGlove)" : "url(#gSkin)";
    s += '<path d="M-18 -170 L-16 -16 C-16 6 16 6 16 -16 L18 -170 Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (!o.glove) s += '<path d="M-9 -12 C-9 -30 9 -30 9 -12 Z" fill="#f4d4c0" stroke="#a8704a" stroke-width="1" transform="scale(1 -1) translate(0 34)" opacity="0"/><path d="M-8 -36 C-8 -50 8 -50 8 -36 L8 -26 C8 -22 -8 -22 -8 -26 Z" fill="#f6dccb" stroke="#a8704a" stroke-width="1.2" transform="rotate(180 0 -31)"/><path d="M-16 -90 q16 6 32 0 M-16 -126 q16 6 32 0" stroke="#a8704a" stroke-width="1.4" fill="none"/>';
    else { s += '<path d="M-16 -90 q16 6 32 0 M-16 -60 q16 6 32 0" stroke="#2b3a5a" stroke-width="1.4" fill="none"/>'; if (o.thread) s += '<path d="M-16 -16 C-16 6 16 6 16 -16 L16 -30 L-16 -30 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/><path d="M-12 -26 l24 0 M-12 -20 l24 0 M-10 -14 l20 0" stroke="#8a929c" stroke-width="1.2"/>'; }
    return s + '</g>'; }
  function fieldArcs(x, y, t, r, bend) {   // little field lines above a node; bend pulls them up toward a finger
    var s = ""; for (var k = 0; k < 5; k++) { var w = r * (0.4 + k * 0.15), h = (8 + k * 5) * (1 + (bend || 0) * 1.5), ph = (t * 2 + k * 0.2) % 1; s += '<path d="M' + f(x - w) + ' ' + f(y) + ' Q' + f(x) + ' ' + f(y - h * 2) + ' ' + f(x + w) + ' ' + f(y) + '" stroke="' + CY + '" stroke-width="1.6" fill="none" opacity="' + f(0.3 + 0.5 * (1 - ph)) + '" stroke-dasharray="4 4" stroke-dashoffset="' + f(-t * 20) + '"/>'; } return s; }

  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  function stack(t, o) {   // the exploded stack: display, sensor, glass, with an explode factor e (0 = assembled, 1 = apart)
    o = o || {}; var e = o.e == null ? 1 : o.e, W = 220, H = 380, s = display(W, H, 0, t) + sensor(W, H, 40 + 60 * e, t, o) + slab(W, H, 70 + 120 * e, 6, "url(#gGlassL)", "#cfeaf4", { op: o.glassOp == null ? 0.7 : o.glassOp });
    return s; }

  // 0 — you touch the screen hundreds of times a day and it knows where your finger is to the millimetre
  shot(0, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var tap = (u * 1.4) % 1, fy = 60 + 40 * Math.abs(Math.sin(tap * Math.PI)), s = graphPaper(t) + phone(320, 190, t, { s: 0.9, rot: -8, ripple: [10, -20, tap < 0.5 ? tap * 2 : 0] });
    s += finger(330, fy + 120, -8, { s: 0.9 });
    var n = Math.round(lerp(0, 2600, clamp(u / (d - 0.6)))); s += '<g transform="translate(520 80)"><rect x="-80" y="-20" width="160" height="38" rx="9" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + YEL + '">' + n.toLocaleString("en") + ' لمسة</text></g>';
    return s + tag("بالمللي!", 140, 300, u, 2.6, -3, 18);
  });
  // 1 — how does it feel you? and why not through a glove? (finger works, glove does nothing)
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var tap = (t * 1.6) % 1, s = graphPaper(t) + phone(190, 190, t, { s: 0.7, ripple: [0, 0, tap] }) + phone(450, 190, t, { s: 0.7, x: clamp((u - 0.4) / 0.4) });
    s += finger(190, 110 + 20 * Math.sin(t * 10), 0, { s: 0.7 }) + finger(450, 110 + 20 * Math.sin(t * 10), 0, { s: 0.7, glove: true });
    return s + qmark(320, 90, t, 50);
  });
  // 2 — and why did people in Korea touch their phones with sausages?
  shot(2, function (u, d) { return [320, 180, lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#c9d9e8"/>'; for (var i = 0; i < 40; i++) { var su = (t * 0.25 + hash(i)) % 1; s += '<circle cx="' + f(-100 + hash(i + 2) * 840 + Math.sin(t + i) * 10) + '" cy="' + f(lerp(-40, 400, su)) + '" r="' + f(2 + hash(i) * 2) + '" fill="#fff"/>'; }
    s += phone(320, 200, t, { s: 0.75, ripple: [0, -10, (t * 1.4) % 1] }) + finger(330, 110 + 16 * Math.sin(t * 8), 0, { sausage: true, s: 0.8 });
    return s + qmark(470, 110, t, 56) + tag("سجق؟!", 170, 120, u, 0.6, -3, 20);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + phone(320, 160, t, { s: 0.7, ripple: [0, 0, (t * 1.2) % 1] }) + finger(330, 90 + 14 * Math.sin(t * 8), 0, { s: 0.7 }) + tag("إيه الحكاية؟", 320, 300, u, 0.1, -3, 26);
  });
  // 4 — under the glass, a very fine grid of transparent wires you can't see (the glass lifts off in 3D)
  shot(4, function (u, d) { return [320, 170, lerp(0.75, 0.85, u / d)]; }, function (u, d, t) {
    IS.cx = 320; IS.cy = 120; var e = ease(clamp(u / 1.6)), s = dark(t) + stack(t, { e: e, glassOp: 0.6, glow: function (a, b) { return 0.2 + 0.2 * Math.sin(t * 3 + a + b); } });
    return s + tag("الإزاز", 520, 40, u, 0.6, 3, 16) + tag("شبكة شفافة!", 520, 200, u, 1.6, -3, 17);
  });
  // 5 — the wires conduct electricity and still let light through like glass (microscope: ITO diamonds, light passing)
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0f2a3a"/><circle cx="320" cy="180" r="150" fill="#d9eef7" stroke="#9aa2ac" stroke-width="12"/><clipPath id="mic"><circle cx="320" cy="180" r="144"/></clipPath><g clip-path="url(#mic)">';
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) { var x = 160 + c * 40 + (r % 2) * 20, y = 30 + r * 36; s += '<path d="M' + x + ' ' + (y - 16) + ' L' + (x + 18) + ' ' + y + ' L' + x + ' ' + (y + 16) + ' L' + (x - 18) + ' ' + y + ' Z" fill="' + (r % 2 ? OR : BLUE) + '" opacity=".28" stroke="' + (r % 2 ? OR : BLUE) + '" stroke-width="1.2"/>'; }
    for (var k = 0; k < 10; k++) { var ku = (t * 0.8 + k / 10) % 1; s += '<path d="M' + (200 + k * 24) + ' ' + f(lerp(-20, 380, ku)) + ' v26" stroke="#fff6c8" stroke-width="3" opacity="' + f(0.8 * Math.sin(Math.PI * ku)) + '"/>'; }
    var ep = [[160, 66], [480, 66]]; for (var e2 = 0; e2 < 8; e2++) { var eu = (t * 0.6 + e2 / 8) % 1; s += '<circle cx="' + f(lerp(160, 480, eu)) + '" cy="66" r="4" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1"/>'; }
    s += '</g>';
    return s + tag("بتوصّل كهربا", 140, 60, u, 0.5, -3, 16) + tag("وشفافة!", 500, 300, u, 1.6, 3, 17) + '<text x="320" y="352" text-anchor="middle" style="font:800 13px Noto Serif;fill:#9aa2ac;direction:ltr">ITO</text>';
  });
  // 6 — two layers: wires across, wires down, an insulating layer between (rows and columns come apart)
  shot(6, function (u, d) { return [320, 180, lerp(0.85, 0.95, u / d)]; }, function (u, d, t) {
    IS.cx = 320; IS.cy = 140; var sp = 0.5 + 0.5 * Math.sin(t * 1.4), s = dark(t) + sensor(220, 380, 30, t, { split: sp });
    var mid = P(110, 190, 30 + sp * 13); s += '<ellipse cx="' + f(mid[0]) + '" cy="' + f(mid[1]) + '" rx="120" ry="70" fill="#fff" opacity="' + f(0.08 * sp) + '"/>';
    return s + tag("بالعرض", 140, 60, u, 0.4, -3, 17, "#bfe0ff") + tag("بالطول", 520, 300, u, 1.2, 3, 17, "#ffcf9a") + tag("عازل", 520, 90, u, 2.0, -3, 15);
  });
  // 7 — at every crossing a tiny electric field (zoom on one crossing, field arcs)
  shot(7, function (u, d) { return [320, 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = dark(t) + '<path d="M60 200 H580" stroke="' + BLUE + '" stroke-width="18" opacity=".6"/><path d="M320 40 V340" stroke="' + OR + '" stroke-width="18" opacity=".6"/>';
    s += '<path d="M320 150 L370 200 L320 250 L270 200 Z" fill="' + BLUE + '" opacity=".5" stroke="' + CY + '" stroke-width="2"/>' + fieldArcs(320, 200, t, 70, 0) + '<circle cx="320" cy="200" r="' + f(18 + 4 * Math.sin(t * 6)) + '" fill="url(#gNode)"/>';
    return s + tag("مجال كهربا صغير", 320, 50, u, 0.6, -3, 17);
  });
  // 8 — thousands of points, each holding a waiting charge (zoom out across the whole grid, nodes twinkle)
  shot(8, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(1.6, 0.8, k)]; }, function (u, d, t) {
    IS.cx = 320; IS.cy = 90; var s = dark(t) + sensor(220, 380, 30, t, { n: 10, m: 16, glow: function (a, b) { return 0.5 + 0.4 * Math.sin(t * 4 + a * 0.7 + b * 0.5); } });
    var n = Math.round(lerp(1, 8000, clamp(u / (d - 0.4)))); s += '<g transform="translate(330 330)"><rect x="-80" y="-20" width="160" height="38" rx="9" fill="' + INK + '" stroke="' + CY + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:' + CY + '">' + n.toLocaleString("en") + ' نقطة</text></g>';
    return s;
  });
  // 9 — your body has water and salts: it conducts (inside the fingertip, ions moving)
  shot(9, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + finger(320, 300, 0, { s: 1.6 }) + '<clipPath id="fc"><rect x="292" y="40" width="56" height="256"/></clipPath><g clip-path="url(#fc)">';
    for (var k = 0; k < 24; k++) { var ku = (t * 0.6 + hash(k)) % 1, x = 296 + hash(k + 3) * 48, y = lerp(60, 300, ku); s += '<circle cx="' + f(x + Math.sin(t * 4 + k) * 3) + '" cy="' + f(y) + '" r="4" fill="' + (k % 3 ? CY : "#fff") + '" stroke="' + INK + '" stroke-width=".8"/>' + (k % 3 === 0 ? '<text x="' + f(x) + '" y="' + f(y + 3) + '" text-anchor="middle" style="font:800 7px Noto Serif;fill:' + INK + '">+</text>' : ''); }
    s += '</g>';
    return s + tag("مية + أملاح", 160, 80, u, 0.4, -3, 18) + tag("بيوصّل!", 480, 230, u, 1.4, 3, 18);
  });
  // 10 — as your finger comes near a point it pulls part of its charge toward itself (field lines bend up into the finger)
  shot(10, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.6)), fy = lerp(40, 150, k), s = dark(t) + '<path d="M60 260 H580" stroke="' + BLUE + '" stroke-width="16" opacity=".55"/><path d="M320 100 V360" stroke="' + OR + '" stroke-width="16" opacity=".5"/><rect x="40" y="226" width="560" height="10" fill="#cfeaf4" opacity=".35"/>';
    s += fieldArcs(320, 260, t, 60, k) + '<circle cx="320" cy="260" r="' + f(22 * (1 - 0.5 * k) + 3 * Math.sin(t * 6)) + '" fill="url(#gNode)"/>';
    for (var q = 0; q < 8; q++) { var qu = (t * 1.2 + q / 8) % 1; if (k > 0.5) s += '<circle cx="' + f(320 + Math.sin(q * 2) * 10) + '" cy="' + f(lerp(250, fy + 10, qu)) + '" r="3.4" fill="' + YEL + '" stroke="' + INK + '" stroke-width=".8" opacity="' + f(1 - qu * 0.4) + '"/>'; }
    s += finger(320, fy, 0, { s: 1.1 });
    return s + tag("بيشد الشحنة!", 500, 120, u, 1.6, 3, 17);
  });
  // 11 — the charge at that point drops a little; a small chip called the controller notices at once (signal dips)
  shot(11, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var dip = clamp((u - 0.6) / 0.4), s = graphPaper(t) + chip(150, 190, t, { s: 1.5 });
    s += '<rect x="290" y="80" width="300" height="200" rx="12" fill="#1c1c1c" stroke="#8a929c" stroke-width="3"/>';
    var path = "M300 140"; for (var x = 300; x <= 580; x += 4) { var tx = (x - 300) / 280, dd = Math.exp(-Math.pow((tx - 0.62) * 9, 2)) * dip; path += " L" + x + " " + f(140 + 3 * Math.sin(x * 0.3 + t * 9) + 70 * dd); } s += '<path d="' + path + '" stroke="#7cf29a" stroke-width="3" fill="none"/>';
    if (dip > 0.9) s += '<circle cx="474" cy="210" r="' + f(16 + 4 * Math.sin(t * 9)) + '" fill="none" stroke="' + YEL + '" stroke-width="3"/>';
    return s + tag("الكنترولر", 150, 300, u, 0.3, -3, 18) + tag("الشحنة قلّت!", 440, 60, u, 1.0, 3, 16, "#ffb08a");
  });
  // 12 — the controller sweeps all the points, one by one (scan highlight moving node to node)
  shot(12, function (u, d) { return [320, 180, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    IS.cx = 300; IS.cy = 100; var n = 8, m = 12, idx = Math.floor(t * 30) % (n * m), s = dark(t) + sensor(220, 380, 30, t, { n: n, m: m, glow: function (a, b) { var k = b * n + a; return k === idx ? 1 : (k === 52 ? 0.6 : 0.12); } });
    return s + chip(540, 290, t, { s: 0.9 }) + tag("واحدة واحدة", 520, 60, u, 0.5, 3, 17);
  });
  // 13 — it does that whole sweep up to 240 times a second (sweep too fast to see, a counter in Hz)
  shot(13, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    IS.cx = 260; IS.cy = 100; var n = 8, m = 12, s = dark(t) + sensor(220, 380, 30, t, { n: n, m: m, glow: function (a, b) { return 0.3 + 0.7 * ((Math.floor(t * 240) + a + b * n) % 6 === 0 ? 1 : 0); } });
    var hz = Math.round(lerp(60, 240, clamp(u / (d - 0.5)))); s += '<g transform="translate(500 180)"><rect x="-100" y="-30" width="200" height="56" rx="12" fill="' + INK + '" stroke="' + YEL + '" stroke-width="3"/><text y="10" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:' + YEL + '">' + hz + ' مرة/ثانية</text></g>';
    return s;
  });
  // 14 — from the changed points it works out exactly where your finger is (heat map → crosshair at the centre)
  shot(14, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    IS.cx = 320; IS.cy = 100; var fx = 3.6 + 0.6 * Math.sin(t * 1.4), fy = 5.4 + 0.6 * Math.cos(t * 1.1), s = dark(t) + sensor(220, 380, 30, t, { heat: true, glow: function (a, b) { return Math.exp(-((a - fx) * (a - fx) + (b - fy) * (b - fy)) / 1.6); } });
    var c = P((fx + 0.5) * 27.5, (fy + 0.5) * 31.7, 34); s += '<path d="M' + f(c[0] - 26) + ' ' + f(c[1]) + ' h52 M' + f(c[0]) + ' ' + f(c[1] - 18) + ' v36" stroke="#fff" stroke-width="2.4"/><circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="10" fill="none" stroke="#fff" stroke-width="2.4"/>';
    s += '<g transform="translate(520 60)"><rect x="-80" y="-18" width="160" height="34" rx="8" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 14px Noto Serif;fill:#7cf29a;direction:ltr">x ' + Math.round(fx * 27.5) + '  y ' + Math.round(fy * 31.7) + '</text></g>';
    return s + tag("بين نقطتين كمان", 160, 320, u, 1.8, -3, 15);
  });
  // 15 — each point is read on its own, so it feels two fingers at once: pinch to zoom
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var sp = 30 + 30 * (0.5 + 0.5 * Math.sin(t * 2)), s = graphPaper(t) + '<g transform="translate(320 190)"><rect x="-75" y="-145" width="150" height="290" rx="26" fill="url(#gPhone)" stroke="' + INK + '" stroke-width="2.6"/><clipPath id="pz"><rect x="-66" y="-134" width="132" height="268" rx="18"/></clipPath><g clip-path="url(#pz)"><g transform="scale(' + f(1 + sp / 60) + ')"><rect x="-90" y="-150" width="180" height="300" fill="#9dbb6e"/><circle cx="0" cy="-30" r="30" fill="#ffd27a"/><path d="M-90 60 L-30 0 L20 50 L60 10 L90 40 V150 H-90 Z" fill="#5a7a3a"/></g></g></g>';
    s += finger(320 - sp, 150, -18, { s: 0.6 }) + finger(320 + sp, 220, 162, { s: 0.6 });
    return s + tag("صباعين مع بعض", 520, 80, u, 0.5, 3, 17);
  });
  // 16 — and the glove? it insulates, pulls no charge, so the screen feels nothing (field lines don't bend)
  shot(16, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.2)), fy = lerp(40, 150, k), s = dark(t) + '<path d="M60 260 H580" stroke="' + BLUE + '" stroke-width="16" opacity=".55"/><path d="M320 100 V360" stroke="' + OR + '" stroke-width="16" opacity=".5"/><rect x="40" y="226" width="560" height="10" fill="#cfeaf4" opacity=".35"/>';
    s += fieldArcs(320, 260, t, 60, 0) + '<circle cx="320" cy="260" r="' + f(22 + 3 * Math.sin(t * 6)) + '" fill="url(#gNode)"/>' + finger(320, fy, 0, { s: 1.1, glove: true });
    if (u > 1.4) s += '<path d="M420 90 l40 40 M460 90 l-40 40" stroke="' + RED + '" stroke-width="8" stroke-linecap="round"/>';
    return s + tag("عازل!", 160, 110, u, 0.6, -3, 19, "#ffb08a");
  });
  // 17 — that's why touch gloves have conductive thread in their fingertips (silver tip, the charge is pulled again)
  shot(17, function (u, d) { return [320, 170, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 1.2)), fy = lerp(40, 150, k), s = dark(t) + '<path d="M60 260 H580" stroke="' + BLUE + '" stroke-width="16" opacity=".55"/><path d="M320 100 V360" stroke="' + OR + '" stroke-width="16" opacity=".5"/>';
    s += fieldArcs(320, 260, t, 60, k) + '<circle cx="320" cy="260" r="' + f(22 * (1 - 0.5 * k) + 3 * Math.sin(t * 6)) + '" fill="url(#gNode)"/>';
    for (var q = 0; q < 8; q++) { var qu = (t * 1.2 + q / 8) % 1; if (k > 0.5) s += '<circle cx="' + f(320 + Math.sin(q * 2) * 10) + '" cy="' + f(lerp(250, fy + 10, qu)) + '" r="3.4" fill="' + YEL + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += finger(320, fy, 0, { s: 1.1, glove: true, thread: true });
    return s + tag("خيوط بتوصّل", 500, 120, u, 0.8, 3, 17);
  });
  // 18 — the sausage secret: in 2010, in the Korean cold, people touched their phones with sausages (snow, street)
  shot(18, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("night") + city(t, 260, 120, "#2b3a5a", "#ffe7a8", 13, true) + '<rect x="-400" y="260" width="1440" height="300" fill="#e9eef4"/>';
    for (var i = 0; i < 60; i++) { var su = (t * 0.3 + hash(i)) % 1; s += '<circle cx="' + f(-200 + hash(i + 2) * 1040 + Math.sin(t + i) * 12) + '" cy="' + f(lerp(-60, 380, su)) + '" r="' + f(1.5 + hash(i) * 2.5) + '" fill="#fff"/>'; }
    s += '<g transform="translate(260 160)"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="#7a2a2a" stroke="' + INK + '" stroke-width="3"/>' + head(0, -20, 38, "happy", t, 1) + '<path d="M-40 -40 C-40 -76 40 -76 40 -40 Z" fill="#2f4a6a" stroke="' + INK + '" stroke-width="3"/><path d="M-50 20 H50" stroke="#e9c48e" stroke-width="12"/></g>';
    s += phone(420, 190, t, { s: 0.5, ripple: [0, 0, (t * 1.4) % 1] }) + finger(425, 140 + 10 * Math.sin(t * 8), -10, { sausage: true, s: 0.55 });
    var y = Math.round(lerp(2026, 2010, clamp(u / 1.4))); s += '<g transform="translate(120 50)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="' + CY + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:' + CY + '">' + y + '</text></g>';
    return s + tag("كوريا", 520, 60, u, 0.6, 3, 18);
  });
  // 19 — a sausage has water and salt, so it conducts like your finger; and sales went up about 40%
  shot(19, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<g transform="translate(180 180) rotate(-20)"><rect x="-120" y="-30" width="240" height="60" rx="30" fill="url(#gSausage)" stroke="' + INK + '" stroke-width="3"/><ellipse cx="120" cy="0" rx="22" ry="30" fill="#f2a08a" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 10; k++) s += '<circle cx="' + f(118 + Math.cos(k + t * 2) * 12) + '" cy="' + f(Math.sin(k * 1.7 + t * 2) * 18) + '" r="3" fill="' + (k % 2 ? CY : "#fff") + '" stroke="' + INK + '" stroke-width=".6"/>'; s += '</g>';
    var g = clamp((u - 1.4) / 1.4); s += '<rect x="420" y="' + f(280 - 100) + '" width="50" height="100" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/><rect x="490" y="' + f(280 - 100 - 40 * g) + '" width="50" height="' + f(100 + 40 * g) + '" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/><path d="M400 280 H560" stroke="' + INK + '" stroke-width="3"/>';
    if (g > 0.5) s += '<text x="515" y="' + f(170 - 40 * g) + '" text-anchor="middle" style="font:800 18px Noto Sans Arabic;fill:' + RED + '">+40%</text>';
    return s + tag("مية + ملح", 180, 300, u, 0.4, -3, 17) + tag("المبيعات", 480, 320, u, 1.6, 3, 15);
  });
  // 20 — the idea was invented by an English engineer, Johnson, in 1965 (sepia lab, a CRT with a touch overlay)
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e7d4ae"/><rect x="-400" y="250" width="1440" height="300" fill="#8a6a48"/><rect x="300" y="80" width="230" height="170" rx="16" fill="#5a5048" stroke="' + INK + '" stroke-width="4"/><ellipse cx="415" cy="165" rx="90" ry="66" fill="#1f3a2a" stroke="' + INK + '" stroke-width="3"/>';
    for (var w = 0; w < 6; w++) s += '<path d="M' + (335 + w * 32) + ' 105 V225" stroke="#c9a04e" stroke-width="1.4" opacity=".7"/>';
    var a = t * 1.6; s += '<path d="M415 165 L' + f(415 + Math.cos(a) * 80) + ' ' + f(165 + Math.sin(a) * 60) + '" stroke="#7cf29a" stroke-width="2.4" opacity=".8"/>';
    s += '<g transform="translate(180 150)"><path d="M-46 140 C-50 50 -30 28 0 28 C30 28 50 50 46 140 Z" fill="#3a3530" stroke="' + INK + '" stroke-width="3"/><path d="M-14 30 L0 60 L14 30" fill="#fbf6e6" stroke="' + INK + '" stroke-width="2"/>' + head(0, -20, 38, "curious", t, 1) + '<rect x="-30" y="-30" width="24" height="14" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="6" y="-30" width="24" height="14" rx="6" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>';
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#704214" opacity=".18"/>';
    var y = Math.round(lerp(2026, 1965, clamp(u / 1.4))); s += '<g transform="translate(415 40)"><rect x="-60" y="-20" width="120" height="38" rx="9" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 20px Noto Serif;fill:#ffd23a">' + y + '</text></g>';
    return s + tag("جونسون", 120, 80, u, 0.6, -3, 19);
  });
  // 21 — so air-traffic controllers could pick a plane on the radar with their finger
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1a12"/><circle cx="320" cy="180" r="150" fill="#0f2a1a" stroke="#3a5a40" stroke-width="6"/>';
    for (var r = 1; r <= 3; r++) s += '<circle cx="320" cy="180" r="' + (r * 48) + '" fill="none" stroke="#2f6a3a" stroke-width="1.4"/>';
    var a = t * 1.8; s += '<path d="M320 180 L' + f(320 + Math.cos(a) * 150) + ' ' + f(180 + Math.sin(a) * 150) + '" stroke="#7cf29a" stroke-width="3" opacity=".9"/>';
    var planes = [[250, 120], [400, 230], [360, 100], [230, 250]]; planes.forEach(function (p, k) { var px = p[0] + Math.sin(t * 0.4 + k) * 8, py = p[1] + Math.cos(t * 0.4 + k) * 6, sel = k === 1 && u > 1.6; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="5" fill="#7cf29a"/>' + (sel ? '<rect x="' + f(px - 14) + '" y="' + f(py - 14) + '" width="28" height="28" fill="none" stroke="' + YEL + '" stroke-width="3"/>' : ''); });
    var k2 = ease(clamp((u - 0.6) / 1.0)); s += finger(lerp(520, 404, k2), lerp(60, 226, k2), -20, { s: 0.8 });
    return s + tag("رادار", 120, 60, u, 0.4, -3, 17);
  });
  // 22 — that's also why a drop of water on the screen can make a touch by itself (ghost touch)
  shot(22, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = ease(clamp(u / 0.8)), s = graphPaper(t) + phone(320, 190, t, { s: 0.9, ripple: [-10, 20, u > 0.9 ? ((u - 0.9) * 1.2) % 1 : 0] });
    s += '<g transform="translate(312 ' + f(lerp(-60, 206, k)) + ') scale(' + f(1 + 0.12 * Math.sin(t * 7) * (u > 0.8 ? 1 : 0)) + ' ' + f(1 - 0.1 * Math.sin(t * 7) * (u > 0.8 ? 1 : 0)) + ')"><path d="M0 -34 C-10 -16 -22 -2 -22 10 C-22 24 -12 32 0 32 C12 32 22 24 22 10 C22 -2 10 -16 0 -34 Z" fill="url(#gWater)" stroke="' + INK + '" stroke-width="2"/><ellipse cx="-8" cy="8" rx="5" ry="8" fill="#fff" opacity=".7"/></g>';
    if (u > 1.0) s += '<g transform="translate(470 120)"><rect x="-70" y="-18" width="140" height="34" rx="8" fill="' + INK + '"/><text y="6" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + RED + '">لمسة وهمية!</text></g>';
    return s + tag("نقطة مية", 170, 120, u, 0.4, -3, 16);
  });
  // 23 — every touch, you draw a tiny bit of electricity, and the phone feels it (finger on glass, charge flows into it)
  shot(23, function (u, d) { return [320, 170, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = dark(t) + '<path d="M60 260 H580" stroke="' + BLUE + '" stroke-width="16" opacity=".55"/><path d="M320 100 V360" stroke="' + OR + '" stroke-width="16" opacity=".5"/><rect x="40" y="226" width="560" height="10" fill="#cfeaf4" opacity=".35"/>' + fieldArcs(320, 260, t, 60, 1);
    for (var q = 0; q < 10; q++) { var qu = (t * 1.2 + q / 10) % 1; s += '<circle cx="' + f(320 + Math.sin(q * 2) * 10) + '" cy="' + f(lerp(250, 160, qu)) + '" r="3.4" fill="' + YEL + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += finger(320, 150, 0, { s: 1.1 }) + phone(540, 180, t, { s: 0.35, ripple: [0, 0, (t * 1.4) % 1] });
    return s + tag("شوية كهربا صغيرة", 160, 110, u, 0.8, -3, 16);
  });
  // 24 — outro
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    return graphPaper(t) + phone(300, 160, t, { s: 0.6, ripple: [0, 0, (t * 1.2) % 1] }) + finger(305, 100 + 12 * Math.sin(t * 8), 0, { s: 0.6 }) + qmark(470, 80, t, 56) + qmark(520, 120, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 300, u, 0.2, -2, 19);
  });

  window.__parts = { phone: phone, finger: finger, sensor: sensor, display: display, slab: slab, stack: stack, chip: chip, fieldArcs: fieldArcs, tag: tag, IS: IS, P: P, dark: dark };
  window.__panel = function (svg, t) {
    var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
