  // ── «تعمل طيارة إزاي؟»: a narrow-body twin-jet airliner built part by part (A320-family proportions, ../refs/SOURCES.md).
  // One build in three views that all take the same parts: planeSide (profile, cut open when needed), planeTop (from
  // above: wingspan, ailerons, fuel tanks, flaps) and planeFront (nose on: roll and wing bending). World scale ≈ 12.8 px/m.
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function G(x, y, rot, sc, inner) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + (sc || 1) + ')">' + inner + '</g>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  var COLS = ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a", "#9a5fb0", "#e8742e", "#5aa0c0", "#d06a8a", "#8aa040", "#c08a4a"];
  var BLUE = "#2f5f9f", BODY = "url(#gPlane)";
  // the parts built by the end of shot n
  function PT(n) { return { wing: n >= 2, eng: n >= 5, tail: n >= 7, ail: n >= 9, fuel: n >= 11, press: n >= 14, flap: n >= 16, brake: n >= 18, windows: n >= 22, seats: n >= 22, cockpit: n >= 22 }; }
  function fan(x, y, ry, t, spin) { var s = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(ry * 0.36) + '" ry="' + f(ry) + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/>'; for (var b = 0; b < 6; b++) { var a = t * (spin || 0) * 9 + b * Math.PI / 3; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * ry * 0.3) + ' ' + f(y + Math.sin(a) * ry * 0.85) + '" stroke="#9aa2ac" stroke-width="2"/>'; } return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(ry * 0.22) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function wheel(x, y, r, t, roll, brake) { var a = t * (roll || 0) * 4, s = (brake ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.7) + '" fill="#ff5a2a" opacity="' + f(0.35 + 0.25 * Math.sin(t * 20)) + '" filter="url(#glow)"/>' : "") + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.5) + '" fill="' + (brake ? "#ff6a3a" : "#9aa2ac") + '" stroke="' + INK + '" stroke-width="1.2"/>'; for (var k = 0; k < 3; k++) { var b = a + k * 2.09; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(b) * r * 0.5) + ' ' + f(y + Math.sin(b) * r * 0.5) + '" stroke="' + INK + '" stroke-width="1.4"/>'; } return s; }

  // side view, nose to the right; o: parts, cut (cabin open), n/mood (people inside), spin (fan), thrust, rev (reverser),
  // flap 0..1, gear (wheels down), roll (wheel turn speed), brake, stopped (engines dead)
  function planeSide(t, o) {
    o = o || {}; var p = o.parts || {}, s = "";
    if (p.tail) s += '<path d="M-150 -22 L-208 -116 L-236 -116 L-244 -20 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M-200 -100 L-232 -100" stroke="#fff" stroke-width="3" opacity=".5"/><path d="M-224 -114 L-233 -24" stroke="#1d3f6f" stroke-width="1.4"/><path d="M-190 -60 C-200 -50 -212 -50 -220 -58" stroke="#f2c230" stroke-width="5" fill="none" opacity=".9"/><circle cx="-238" cy="-110" r="2.4" fill="#fff" opacity="' + (Math.sin(t * 9) > 0.8 ? 1 : 0.2) + '"/><path d="M-178 -12 L-246 -16 L-250 -9 L-186 -6 Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/>';
    var body = "M-160 -25 H195 C228 -25 246 -8 249 6 C246 18 230 25 200 25 H-150 C-190 22 -225 6 -246 -14 L-246 -20 C-226 -25 -196 -25 -160 -25 Z";
    if (!o.nobody) {
      s += '<path d="' + body + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
      [-120, -70, -20, 30, 80, 130, 172].forEach(function (x) { s += '<path d="M' + x + ' -24 V24" stroke="#9aa2ac" stroke-width=".8" opacity=".7"/>'; });
      s += '<path d="M-200 -16 C-120 -22 120 -22 238 -12" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>';
      s += '<path d="M-70 23 Q0 36 80 23" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.8"/>';
      if (!o.cut) s += '<path d="M176 -18 h10 v26 h-10 Z M-140 -18 h10 v26 h-10 Z M-4 -14 h8 v14 h-8 Z M12 -14 h8 v14 h-8 Z" fill="none" stroke="#7a828c" stroke-width="1.2"/>';
      s += '<ellipse cx="-246" cy="-17" rx="2" ry="3" fill="#3a3d42"/><path d="M100 -25 l4 -7 l3 0 l-2 7" fill="#5a6068"/><path d="M150 25 v5" stroke="#5a6068" stroke-width="2"/>';
      var bl = Math.sin(t * 7) > 0.6 ? 1 : 0.25; s += '<circle cx="20" cy="-26" r="3" fill="#ff3a2a" opacity="' + bl + '"/><circle cx="40" cy="29" r="3" fill="#ff3a2a" opacity="' + bl + '"/>' + (bl > 0.5 ? '<circle cx="20" cy="-26" r="8" fill="#ff3a2a" opacity=".35" filter="url(#glow)"/>' : "");
    }
    if (p.windows) s += '<path d="M-200 3 H230" stroke="' + BLUE + '" stroke-width="5" opacity=".85"/>';
    if (o.cut) {
      s += '<path d="M-150 -19 H190 C212 -19 222 -8 222 0 V12 C222 16 214 19 200 19 H-150 C-165 19 -172 12 -172 0 C-172 -12 -165 -19 -150 -19 Z" fill="' + (p.press ? "#cfe8f7" : "#3a4660") + '" stroke="' + INK + '" stroke-width="2"/>' + R(-170, 12, 390, 5, "#8a7a6a", 1.4);
      if (p.seats) for (var sx = -150; sx < 190; sx += 22) s += '<path d="M' + sx + ' 12 V-2 q4 -2 5 0 V6 H' + (sx + 12) + ' V12" fill="' + (sx % 44 ? "#c23a26" : "#2f6f9f") + '" stroke="' + INK + '" stroke-width="1.2"/>';
      for (var i = 0; i < (o.n || 0); i++) { var px = -130 + i * (300 / Math.max(1, (o.n || 1) - 1)); s += mini(px, 12, 0.32, COLS[i % 10], t + i, o.mood || "happy"); }
    } else if (p.windows) for (var wx = -150; wx < 186; wx += 12) s += '<ellipse cx="' + wx + '" cy="-7" rx="2.8" ry="3.6" fill="#2b3a52" stroke="' + INK + '" stroke-width=".8"/>';
    if (p.cockpit) s += '<path d="M206 -13 L226 -13 L236 -4 L210 -4 Z" fill="#2b3a52" stroke="' + INK + '" stroke-width="1.6"/>' + (o.cut ? head(214, -6, 6, o.pmood || "happy", t) : "");
    if (p.wing) {
      var fk = clamp(o.flap || 0); if (p.flap && fk > 0) s += '<path d="M-14 26 L-80 32 L-84 ' + f(37 + 10 * fk) + ' L-16 ' + f(31 + 10 * fk) + ' Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2" transform="translate(' + f(-12 * fk) + ' 0)"/>';
      s += '<path d="M72 16 L-12 20 L-98 30 L-92 35 L-8 28 L74 23 Z" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.2"/><path d="M70 19 L-90 31" stroke="#9aa2ac" stroke-width="1"/>';
      s += '<path d="M-92 32 L-101 13 L-106 13 L-99 34 Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var ft = 0; ft < 3; ft++) { var fx = -20 - ft * 24; s += '<path d="M' + fx + ' ' + (28 + ft * 2) + ' q-10 6 -22 3" stroke="' + INK + '" stroke-width="1.2" fill="#c9ced4"/>'; }
    }
    if (p.eng) {
      s += '<path d="M84 22 L40 22 L46 32 L96 32 Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.6"/>';
      var rv = o.rev ? 10 : 0;
      s += '<path d="M100 31 C104 31 106 37 106 43 C106 49 104 55 100 55 H66 V31 Z" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.2"/>';
      s += '<path d="M' + (66 - rv) + ' 32 H' + (66 - rv) + ' L' + (42 - rv) + ' 36 V50 L' + (66 - rv) + ' 54 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2"/>' + '<path d="M' + (42 - rv) + ' 37 L' + (30 - rv) + ' 43 L' + (42 - rv) + ' 49 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>';
      if (rv) { s += '<path d="M56 32 h' + (10 - rv) + ' M56 54 h' + (10 - rv) + '" stroke="#3a3d42" stroke-width="3"/>'; for (var a = 0; a < 3; a++) { var q = (t * 2.5 + a / 3) % 1; s += arrow(58, 30 - a * 2, 58 + 34 * q + 6, 14 - 22 * q, "#bfe0ff", 3, 1) + arrow(58, 56 + a * 2, 58 + 34 * q + 6, 70 + 22 * q, "#bfe0ff", 3, 1); } }
      s += '<path d="M84 32 V54" stroke="#9aa2ac" stroke-width="1.2"/><path d="M70 36 H98" stroke="#fff" stroke-width="2.4" opacity=".7"/><path d="M103 31 C107 33 108 53 103 55" stroke="#9aa2ac" stroke-width="3" fill="none"/>';
      s += fan(104, 43, 11, t, o.stopped ? 0.02 : (o.spin == null ? 1 : o.spin));
      if (o.thrust) for (var k = 0; k < 6; k++) { var u = (t * 2.2 + k / 6) % 1; s += '<path d="M' + f(28 - rv - u * 120) + ' ' + f(43 + Math.sin(k * 2 + t * 9) * 5) + ' h-22" stroke="#ffd9a0" stroke-width="' + f(4 * (1 - u)) + '" stroke-linecap="round" opacity="' + f(0.9 * (1 - u)) + '"/>'; }
      if (o.stopped) for (var m = 0; m < 4; m++) { var v = (t * 0.7 + m / 4) % 1; s += '<circle cx="' + f(30 - v * 50) + '" cy="' + f(43 - v * 30) + '" r="' + f(4 + v * 10) + '" fill="#6a6a6a" opacity="' + f(0.5 * (1 - v)) + '"/>'; }
    }
    if (o.gear) s += '<path d="M-6 24 V58 M206 22 V58" stroke="' + INK + '" stroke-width="5"/><path d="M-6 24 V58 M206 22 V58" stroke="#c9ced4" stroke-width="2.4"/><path d="M-6 36 l8 6 l-8 6 M206 34 l-6 5 l6 5" stroke="' + INK + '" stroke-width="1.6" fill="none"/><path d="M212 40 h6" stroke="#5a6068" stroke-width="4"/><circle cx="220" cy="40" r="7" fill="#fff6c8" opacity=".55" filter="url(#glow)"/>' + wheel(-12, 62, 9, t, o.roll, o.brake) + wheel(4, 62, 9, t, o.roll, o.brake) + wheel(206, 63, 7, t, o.roll, 0);
    return s;
  }
  // top view, nose to the right; o: parts, ail (-1..1 roll command), fuel 0..1, flap 0..1, spin
  function planeTop(t, o) {
    o = o || {}; var p = o.parts || {}, s = "", fu = o.fuel == null ? (p.fuel ? 1 : 0) : o.fuel;
    function wpt(sg, k, te) { var le = [lerp(60, -47, k), lerp(25, 229, k) * sg], tr = [lerp(-25, -67, k), lerp(25, 229, k) * sg]; return te ? tr : le; }
    function poly(ps) { return "M" + ps.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L") + " Z"; }
    if (p.tail) [1, -1].forEach(function (sg) { s += '<path d="M-188 ' + 18 * sg + ' L-222 ' + 82 * sg + ' L-238 ' + 82 * sg + ' L-230 ' + 16 * sg + ' Z" fill="#d9dee4" stroke="' + INK + '" stroke-width="2"/>'; });
    if (p.wing) [1, -1].forEach(function (sg) {
      var fk = clamp(o.flap || 0);
      if (p.flap && fk > 0) s += '<path d="' + poly([wpt(sg, 0.05, 1), wpt(sg, 0.68, 1), [wpt(sg, 0.68, 1)[0] - 16 * fk, wpt(sg, 0.68, 1)[1]], [wpt(sg, 0.05, 1)[0] - 16 * fk, wpt(sg, 0.05, 1)[1]]]) + '" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
      [0.25, 0.45, 0.62].forEach(function (k) { var q = wpt(sg, k, 1); s += '<ellipse cx="' + f(q[0] - 8) + '" cy="' + f(q[1]) + '" rx="12" ry="3.4" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/>'; });
      s += '<path d="' + poly([wpt(sg, 0, 0), wpt(sg, 1, 0), wpt(sg, 1, 1), wpt(sg, 0, 1)]) + '" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.4"/>';
      var l0 = wpt(sg, 0.08, 0), l1 = wpt(sg, 0.98, 0); s += '<path d="M' + f(l0[0] - 6) + ' ' + f(l0[1]) + ' L' + f(l1[0] - 5) + ' ' + f(l1[1]) + '" stroke="#9aa2ac" stroke-width="1.2"/>';
      [0.3, 0.55, 0.8].forEach(function (k) { var a = wpt(sg, k, 0), b = wpt(sg, k, 1); s += '<path d="M' + f(a[0] - 6) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#c9ced4" stroke-width="1"/>'; });
      var tp = wpt(sg, 1, 0), tq = wpt(sg, 1, 1); s += '<path d="M' + f(tp[0]) + ' ' + f(tp[1]) + ' L' + f(tq[0]) + ' ' + f(tq[1]) + ' L' + f(tq[0] - 4) + ' ' + f(tq[1] + 4 * sg) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="2.4"/>';
      var nl = Math.sin(t * 8 + sg) > 0.7; s += '<circle cx="' + f(tp[0] - 4) + '" cy="' + f(tp[1] + 2 * sg) + '" r="3.4" fill="' + (sg > 0 ? "#3aa05a" : "#d8352a") + '"/>' + (nl ? '<circle cx="' + f(tp[0] - 4) + '" cy="' + f(tp[1] + 2 * sg) + '" r="9" fill="#fff" opacity=".6" filter="url(#glow)"/>' : "");
      if (fu > 0) { var kk = 0.92 * clamp(fu), wob = Math.sin(t * 5 + sg) * 0.015; s += '<path d="' + poly([wpt(sg, 0.02, 0), wpt(sg, kk + wob, 0), wpt(sg, kk - wob, 1), wpt(sg, 0.02, 1)]).replace(/^M/, "M") + '" fill="#f2a93b" opacity=".85" transform="translate(-4 0) scale(1 1)"/>'; }
      if (p.ail) { var aa = (o.ail || 0) * sg, A = wpt(sg, 0.72, 1), B = wpt(sg, 0.95, 1); s += '<path d="' + poly([A, B, [B[0] - 9, B[1]], [A[0] - 9, A[1]]]) + '" fill="' + (aa > 0.05 ? "#3aa05a" : aa < -0.05 ? "#d8352a" : "#f2c230") + '" stroke="' + INK + '" stroke-width="1.8"/>'; }
    });
    s += '<ellipse cx="10" cy="0" rx="78" ry="30" fill="#d9dee4" stroke="' + INK + '" stroke-width="1.6" opacity=".9"/><path d="M249 0 C247 -15 230 -25 200 -25 H-160 C-200 -24 -232 -12 -250 -3 V3 C-232 12 -200 24 -160 25 H200 C230 25 247 15 249 0 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
    [-120, -70, -20, 30, 80, 130, 175].forEach(function (x) { s += '<path d="M' + x + ' -24 V24" stroke="#9aa2ac" stroke-width=".8" opacity=".7"/>'; });
    s += '<path d="M-200 -6 H230" stroke="#fff" stroke-width="4" opacity=".55"/>';
    if (p.tail) [1, -1].forEach(function (sg) { s += '<path d="M-226 ' + 22 * sg + ' L-232 ' + 78 * sg + '" stroke="#9aa2ac" stroke-width="1.4"/>'; });
    if (p.tail) s += '<path d="M-176 0 H-248" stroke="' + BLUE + '" stroke-width="7" stroke-linecap="round"/>';
    if (p.cockpit) s += '<path d="M222 -10 Q236 0 222 10" stroke="#2b3a52" stroke-width="5" fill="none"/>';
    if (p.eng) [1, -1].forEach(function (sg) { s += R(10, 73 * sg - 5, 40, 10, "#d9dee4", 1.6) + R(30, 73 * sg - 13, 66, 26, "#e9ebee", 2.2, 9) + '<path d="M70 ' + (73 * sg - 12) + ' V' + (73 * sg + 12) + '" stroke="#9aa2ac" stroke-width="1.2"/><path d="M30 ' + (73 * sg - 7) + ' L18 ' + (73 * sg) + ' L30 ' + (73 * sg + 7) + ' Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.4"/>' + '<path d="M96 ' + (73 * sg - 11) + ' V' + (73 * sg + 11) + '" stroke="' + INK + '" stroke-width="4"/>'; });
    return s;
  }
  // nose-on view; o: parts, roll (deg), ail (-1..1), bend (0..1 extra tip bend), spin
  function planeFront(t, o) {
    o = o || {}; var p = o.parts || {}, s = "", b = (o.bend || 0) * 46;
    if (p.tail) s += R(-4, -118, 8, 96, BLUE, 2) + '<path d="M-84 -14 L84 -14" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M-84 -14 L84 -14" stroke="#d9dee4" stroke-width="3" stroke-linecap="round"/>';
    [1, -1].forEach(function (sg) {
      var tipY = -8 - b, d = "M" + 20 * sg + " 10 Q" + 130 * sg + " " + f(4 - b * 0.15) + " " + 229 * sg + " " + f(tipY) + " L" + 229 * sg + " " + f(tipY + 5) + " Q" + 130 * sg + " " + f(10 - b * 0.15) + " " + 20 * sg + " 18 Z";
      s += '<path d="' + d + '" fill="#e4e8ec" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<path d="M' + 227 * sg + ' ' + f(tipY + 4) + ' L' + 233 * sg + ' ' + f(tipY - 22) + ' L' + 236 * sg + ' ' + f(tipY - 22) + ' L' + 232 * sg + ' ' + f(tipY + 5) + ' Z" fill="' + BLUE + '" stroke="' + INK + '" stroke-width="1.6"/>' + '<circle cx="' + 226 * sg + '" cy="' + f(tipY + 3) + '" r="3" fill="' + (sg > 0 ? "#d8352a" : "#3aa05a") + '"/>';
      if (p.fuel && o.fuelArrows) for (var k = 0; k < 3; k++) { var x = (70 + k * 50) * sg, y = 10 - b * 0.15 * (k + 1) / 3; s += arrow(x, y + 6, x, y + 30, "#f2a93b", 3, clamp(o.fuelArrows)); }
      if (p.ail) { var aa = (o.ail || 0) * sg, x0 = 166 * sg, x1 = 218 * sg, yy = tipY + 10 - 10 * ((166 - 20) / 209); s += '<path d="M' + x0 + ' ' + f(yy) + ' L' + x1 + ' ' + f(tipY + 4) + '" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M' + x0 + ' ' + f(yy) + ' L' + x1 + ' ' + f(tipY + 4) + '" stroke="' + (aa > 0.05 ? "#3aa05a" : aa < -0.05 ? "#d8352a" : "#f2c230") + '" stroke-width="4" stroke-linecap="round" transform="translate(0 ' + f(-aa * 8) + ')"/>'; }
      if (p.eng) s += R(73 * sg - 3, 14, 6, 12, "#c9ced4", 1.4) + '<circle cx="' + 73 * sg + '" cy="34" r="14" fill="#e9ebee" stroke="' + INK + '" stroke-width="2.2"/>' + '<circle cx="' + 73 * sg + '" cy="34" r="10" fill="#2b2e33"/>' + '<circle cx="' + 73 * sg + '" cy="34" r="3" fill="#c9ced4"/>' + '<path d="M' + f(73 * sg + Math.cos(t * 9) * 9) + ' ' + f(34 + Math.sin(t * 9) * 9) + ' L' + f(73 * sg - Math.cos(t * 9) * 9) + ' ' + f(34 - Math.sin(t * 9) * 9) + '" stroke="#9aa2ac" stroke-width="2"/>';
    });
    s += '<circle r="25" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.6"/>';
    if (p.cockpit) s += '<path d="M-14 -8 H14 L10 -2 H-10 Z" fill="#2b3a52" stroke="' + INK + '" stroke-width="1.4"/>';
    return G(0, 0, o.roll || 0, 1, s);
  }
  // backgrounds
  // far fields far below, for shots in the air
  function fields(t, y, sp) { var s = '<rect x="-600" y="' + y + '" width="1900" height="500" fill="#8aa86a"/>', off = (t * sp) % 160;
    for (var i = 0; i < 26; i++) for (var r = 0; r < 3; r++) { var x = -600 + i * 80 - off * (1 + r * 0.4) + hash(i + r * 9) * 30, yy = y + 6 + r * 26; s += '<rect x="' + f(x) + '" y="' + f(yy) + '" width="' + f(50 + hash(i * 3 + r) * 40) + '" height="' + (12 + r * 6) + '" fill="' + ["#a7b874", "#c9b07a", "#6f9548", "#b8c48a"][(i + r) % 4] + '" opacity=".9"/>'; }
    for (var k = 0; k < 6; k++) { var x2 = ((-t * sp * 1.4 + k * 260) % 1560 + 1560) % 1560 - 600; s += '<path d="M' + f(x2) + ' ' + (y + 30) + ' q40 -10 80 4 t80 -2" stroke="#7fb7e0" stroke-width="3" fill="none" opacity=".8"/>'; }
    return s + '<rect x="-600" y="' + (y - 14) + '" width="1900" height="40" fill="#cfe1ec" opacity=".55" filter="url(#soft)"/>'; }
  function skyBG(t, kind, sp, o) { o = o || {}; var s = sky(kind) + (kind === "night" ? stars(t) : "") + clouds(t, sp * 0.4, -60, 4, 0.6, 1.6);
    if (kind === "day" && !o.noground) s += fields(t, 330, sp * 0.3);
    return s + clouds(t, sp, -10, 5, 0.85, 1.2) + clouds(t, sp * 1.8, 240, 4, 0.75, 1.4) + (o.birds ? birds(t, 40, 40) : ""); }
  // airport pieces: terminal with jet bridges, control tower, hangar, fuel truck, baggage tug, windsock, runway lights
  function terminal(x, y, t) { var s = R(x, y - 46, 300, 46, "#e9e4d8", 2.2) + '<path d="M' + (x - 8) + ' ' + (y - 46) + ' Q' + (x + 150) + ' ' + (y - 76) + ' ' + (x + 308) + ' ' + (y - 46) + ' Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="' + (x + 8) + '" y="' + (y - 40) + '" width="284" height="22" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="1.4"/>'; for (var k = 0; k < 18; k++) s += '<path d="M' + (x + 8 + k * 16) + ' ' + (y - 40) + ' v22" stroke="#5d93ad" stroke-width="1"/>';
    for (var b = 0; b < 3; b++) { var bx = x + 40 + b * 100; s += R(bx, y - 18, 10, 14, "#c9ced4", 1.4) + R(bx - 4, y - 8, 46, 8, "#d9d4c8", 1.4) + R(bx + 36, y - 12, 12, 16, "#9aa2ac", 1.4) + '<path d="M' + (bx + 40) + ' ' + (y + 4) + ' v8" stroke="' + INK + '" stroke-width="2"/>'; }
    for (var w = 0; w < 6; w++) s += '<circle cx="' + f(x + 20 + w * 50 + Math.sin(t + w) * 3) + '" cy="' + (y - 26) + '" r="2.4" fill="#2b2016" opacity=".6"/>';
    return s + T("مطار", x + 150, y - 52, 13, "#f2c230"); }
  function tower(x, y, t) { var s = '<path d="M' + (x - 8) + ' ' + y + ' L' + (x - 5) + ' ' + (y - 110) + ' H' + (x + 5) + ' L' + (x + 8) + ' ' + y + ' Z" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + (x - 22) + ' ' + (y - 110) + ' L' + (x - 16) + ' ' + (y - 132) + ' H' + (x + 16) + ' L' + (x + 22) + ' ' + (y - 110) + ' Z" fill="#3a8a8a" stroke="' + INK + '" stroke-width="2"/>' + R(x - 24, y - 136, 48, 6, "#5a6068", 1.6) + '<path d="M' + x + ' ' + (y - 136) + ' v-14" stroke="' + INK + '" stroke-width="2"/>';
    return s + '<circle cx="' + x + '" cy="' + (y - 151) + '" r="3" fill="#ff3a2a" opacity="' + (Math.sin(t * 5) > 0 ? 1 : 0.3) + '"/>'; }
  function hangar(x, y) { var s = '<path d="M' + x + ' ' + y + ' V' + (y - 40) + ' Q' + (x + 90) + ' ' + (y - 90) + ' ' + (x + 180) + ' ' + (y - 40) + ' V' + y + ' Z" fill="#b9c1c9" stroke="' + INK + '" stroke-width="2.2"/>'; for (var k = 1; k < 9; k++) s += '<path d="M' + (x + k * 20) + ' ' + y + ' V' + f(y - 40 - 46 * Math.sin(Math.PI * k / 9)) + '" stroke="#9aa2ac" stroke-width="1.2"/>'; return s + R(x + 30, y - 34, 120, 34, "#5a6068", 1.6) + '<path d="M' + (x + 90) + ' ' + (y - 34) + ' v34" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function fuelTruck(x, y, t) { return G(x, y, 0, 1, R(-30, -18, 44, 16, "#e9e4d8", 1.6, 6) + R(14, -20, 16, 18, "#d8352a", 1.6, 3) + R(18, -17, 9, 7, "#8fc2da", 1) + '<circle cx="-20" cy="0" r="5" fill="#2b2e33"/><circle cx="-4" cy="0" r="5" fill="#2b2e33"/><circle cx="22" cy="0" r="5" fill="#2b2e33"/>' + T("وقود", -8, -6, 8, "#d8352a")); }
  function tug(x, y, t) { var s = R(0, -12, 18, 10, "#f2c230", 1.4, 3) + '<circle cx="4" cy="0" r="3.4" fill="#2b2e33"/><circle cx="14" cy="0" r="3.4" fill="#2b2e33"/>'; for (var c = 0; c < 3; c++) s += R(-22 - c * 22, -14, 18, 12, ["#2f6f9f", "#c23a26", "#3aa05a"][c], 1.2, 2) + '<circle cx="' + (-18 - c * 22) + '" cy="0" r="3" fill="#2b2e33"/><circle cx="' + (-8 - c * 22) + '" cy="0" r="3" fill="#2b2e33"/>'; return G(x, y, 0, 1, s); }
  function windsock(x, y, t) { var w = Math.sin(t * 4) * 4; return '<path d="M' + x + ' ' + y + ' v-40" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + x + ' ' + (y - 40) + ' L' + (x - 30) + ' ' + f(y - 36 + w) + ' L' + (x - 30) + ' ' + f(y - 30 + w) + ' L' + x + ' ' + (y - 30) + ' Z" fill="#ff7a2f" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 10) + ' ' + f(y - 39 + w / 3) + ' v8 M' + (x - 20) + ' ' + f(y - 38 + w / 1.5) + ' v8" stroke="#fff" stroke-width="3"/>'; }
  function airport(t, sp, y, o) {
    o = o || {}; var s = sky(o.sky || "day") + '<path d="M-600 ' + (y - 70) + ' L-420 ' + (y - 150) + ' L-250 ' + (y - 90) + ' L-80 ' + (y - 170) + ' L120 ' + (y - 95) + ' L320 ' + (y - 160) + ' L520 ' + (y - 100) + ' L760 ' + (y - 175) + ' L1000 ' + (y - 90) + ' L1300 ' + (y - 150) + ' V' + y + ' H-600 Z" fill="#a9b8c8" opacity=".7"/>';
    s += clouds(t, 10 + sp * 0.05, -20, 4, 0.85) + city(t, y - 60, 60, "#9fb0bf", "#fff6c8", 3);
    s += '<rect x="-600" y="' + (y - 64) + '" width="1900" height="400" fill="url(#grass-day)"/>' + '<rect x="-600" y="' + (y - 62) + '" width="1900" height="40" fill="#b9b4aa"/>';
    var P = 1500, po = ((-t * sp * 0.35) % P + P) % P - 600;
    for (var r = 0; r < 2; r++) { var ox = po + r * P - P / 2; s += hangar(ox - 260, y - 22) + terminal(ox + 0, y - 22, t) + tower(ox + 380, y - 22, t) + hangar(ox + 470, y - 22) + fuelTruck(ox + 690, y - 26, t) + terminal(ox + 760, y - 22, t); }
    s += tug(((t * 30) % 1600) - 600, y - 26, t);
    s += R(-600, y, 1900, 46, "url(#gAsphalt)", 0);
    var off = (t * sp) % 80; for (var x = -600 - off; x < 1300; x += 80) s += '<rect x="' + f(x) + '" y="' + (y + 21) + '" width="40" height="4" fill="#f4f1e8"/>';
    s += '<path d="M-600 ' + (y + 2) + ' H1300 M-600 ' + (y + 44) + ' H1300" stroke="#f4f1e8" stroke-width="2"/>';
    var lo = (t * sp) % 60; for (var lx = -600 - lo; lx < 1300; lx += 60) { var on = Math.sin(t * 6 + lx * 0.05) > 0; s += '<circle cx="' + f(lx) + '" cy="' + (y - 2) + '" r="2.4" fill="' + (on ? "#fff6a0" : "#c9b06a") + '"/><circle cx="' + f(lx + 30) + '" cy="' + (y + 49) + '" r="2.4" fill="' + (on ? "#fff6a0" : "#c9b06a") + '"/>'; }
    var wo = ((-t * sp) % 1800 + 1800) % 1800 - 600; s += windsock(wo, y + 100, t) + windsock(wo + 900, y + 100, t);
    for (var g = 0; g < 50; g++) { var gx = ((hash(g) * 1900 - t * sp * 1.2) % 1900 + 1900) % 1900 - 600, gy = y + 56 + hash(g + 4) * 70; s += '<path d="M' + f(gx) + ' ' + f(gy) + ' q2 -6 4 -10" stroke="#5a7a38" stroke-width="1.6" fill="none"/>'; }
    return s;
  }
  function speedo(x, y, r, v, max, text) { var a = -2.4 + 4.8 * clamp(v / max), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#1c1c1c" stroke="#f4f1e8" stroke-width="3"/>'; for (var k = 0; k <= 8; k++) { var b = -2.4 + 4.8 * k / 8; s += '<path d="M' + f(Math.sin(b) * r * 0.78) + ' ' + f(-Math.cos(b) * r * 0.78) + ' L' + f(Math.sin(b) * r * 0.92) + ' ' + f(-Math.cos(b) * r * 0.92) + '" stroke="#f4f1e8" stroke-width="2"/>'; } return s + '<path d="M0 0 L' + f(Math.sin(a) * r * 0.8) + ' ' + f(-Math.cos(a) * r * 0.8) + '" stroke="#f2c230" stroke-width="4" stroke-linecap="round"/><circle r="4" fill="#f2c230"/>' + (text ? T(text, 0, r * 0.62, r * 0.36, "#f2c230") : "") + '</g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  // a guy with cardboard wings strapped to his arms
  function birdman(x, y, s, t, mood, flap) { var a = Math.sin(t * (flap || 6)) * 30, w = function (sg) { return '<g transform="rotate(' + f(sg * a) + ' 0 -26)"><path d="M0 -28 L' + 70 * sg + ' ' + f(-40) + ' L' + 64 * sg + ' -14 L0 -18 Z" fill="#c9a46a" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + 20 * sg + ' -30 L' + 24 * sg + ' -18 M' + 40 * sg + ' -34 L' + 42 * sg + ' -17" stroke="#8a6a3a" stroke-width="2"/></g>'; }; return G(x, y, Math.sin(t * 2) * 4, s, w(1) + w(-1) + '<rect x="-14" y="-38" width="28" height="38" rx="8" fill="#e8742e" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood, t)); }
  function arrowShaft(x, y, rot, feathers) { var s = '<path d="M-60 0 H50" stroke="#8a5a2a" stroke-width="5"/><path d="M50 -8 L68 0 L50 8 Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2"/>'; if (feathers) s += '<path d="M-60 0 L-74 -12 L-50 -12 L-40 0 Z M-60 0 L-74 12 L-50 12 L-40 0 Z" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/>'; return G(x, y, rot, 1, s); }
  function paperPlane(x, y, rot, s) { return G(x, y, rot, s, '<path d="M40 0 L-30 -16 L-18 0 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/><path d="M40 0 L-30 12 L-18 0 Z" fill="#d9d4c8" stroke="' + INK + '" stroke-width="2"/>'); }
  function mountain(x, y, s) { return G(x, y, 0, s, '<path d="M-90 0 L-20 -90 L10 -60 L40 -100 L100 0 Z" fill="#7a8a9a" stroke="' + INK + '" stroke-width="2.4"/><path d="M40 -100 L28 -78 L40 -82 L52 -76 Z M-20 -90 L-32 -72 L-20 -76 L-8 -70 Z" fill="#fbfbf7"/>'); }

  // a Cairo street of apartment blocks: balconies, AC units, laundry, dishes, a water tank on our roof, cars below
  function block(x, y, w, h, col, t, seed) { var s = R(x, y - h, w, h, col, 2.2), fl = Math.floor((h - 20) / 40);
    for (var r = 0; r < fl; r++) for (var c = 0; c < Math.floor(w / 46); c++) { var wx = x + 10 + c * 46, wy = y - h + 14 + r * 40, lit = hash(seed + r * 7 + c) > 0.5; s += R(wx, wy, 24, 20, lit ? "#9fc4dc" : "#6f8fa8", 1.2) + '<path d="M' + (wx + 12) + ' ' + wy + ' v20" stroke="#4a5a6a" stroke-width="1"/>';
      if (hash(seed + r + c * 3) > 0.55) s += R(wx - 4, wy + 20, 32, 4, "#d9d4c8", 1) + '<path d="M' + (wx - 4) + ' ' + (wy + 20) + ' v-8 h32 v8" stroke="' + INK + '" stroke-width="1" fill="none"/>';
      if (hash(seed * 3 + r + c) > 0.7) s += R(wx + 26, wy + 4, 12, 8, "#e9ebee", 1) + '<circle cx="' + (wx + 32) + '" cy="' + (wy + 8) + '" r="2.4" fill="none" stroke="#9aa2ac"/>'; }
    s += '<path d="M' + (x + 10) + ' ' + (y - h - 2) + ' q14 -16 22 0" fill="#e9ebee" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (x + 21) + ' ' + (y - h - 4) + ' v-6" stroke="' + INK + '" stroke-width="1.2"/>';
    return s; }
  function laundry(x1, x2, y, t) { var s = '<path d="M' + x1 + ' ' + y + ' Q' + ((x1 + x2) / 2) + ' ' + (y + 8) + ' ' + x2 + ' ' + y + '" stroke="#5a5048" stroke-width="1.2" fill="none"/>'; for (var k = 1; k < 6; k++) { var x = lerp(x1, x2, k / 6), sw = Math.sin(t * 3 + k) * 3; s += '<path d="M' + f(x - 5) + ' ' + f(y + 4) + ' h10 l' + f(sw) + ' 14 h-10 Z" fill="' + COLS[k % 10] + '" stroke="' + INK + '" stroke-width=".8"/>'; } return s; }
  function rooftop(t) {
    var s = sky("day") + clouds(t, 14, 10, 5, 0.85) + birds(t, 30, 30) + city(t, 250, 90, "#b8c6d2", "#fff6c8", 5);
    s += block(-160, 340, 150, 230, "#d9b48a", t, 3) + block(20, 340, 130, 170, "#c9a07a", t, 8) + block(430, 340, 140, 200, "#e0c09a", t, 13) + block(590, 340, 170, 250, "#b8906a", t, 21);
    s += laundry(30, 140, 176, t) + laundry(440, 560, 146, t);
    s += R(180, 200, 220, 300, "url(#bld)", 2.6);
    for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) { var wx = 196 + j * 50, wy = 222 + i * 42; s += R(wx, wy, 30, 24, "#7fa9c8", 1.6) + '<path d="M' + (wx + 15) + ' ' + wy + ' v24" stroke="#4a6a8a" stroke-width="1"/>'; if ((i + j) % 2) s += R(wx - 4, wy + 24, 38, 5, "#d9d4c8", 1.2) + '<path d="M' + (wx - 4) + ' ' + (wy + 24) + ' v-10 h38 v10" stroke="' + INK + '" stroke-width="1.2" fill="none"/>'; }
    s += R(170, 192, 240, 10, "#9a958c", 2) + R(186, 150, 34, 42, "#e9ebee", 2, 4) + '<path d="M186 160 h34 M186 180 h34" stroke="#9aa2ac" stroke-width="1.4"/>' + '<path d="M196 192 v-6 M210 192 v-6" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M370 186 q16 -20 30 0" fill="#e9ebee" stroke="' + INK + '" stroke-width="1.6"/><path d="M385 182 v10" stroke="' + INK + '" stroke-width="1.6"/>' + R(340, 180, 18, 12, "#f4f1e8", 1.4) + '<circle cx="349" cy="186" r="3" fill="none" stroke="#9aa2ac"/>';
    s += '<rect x="-400" y="336" width="1440" height="80" fill="url(#gAsphalt)"/>' + cars(t, 352, 50);
    return s; }
  // 0 — strap wings to your arms and jump off the roof: is that an airplane?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(160, 175, k), lerp(1.3, 1.05, k)]; }, function (u, d, t) {
    var s = rooftop(t);
    s += birdman(lerp(300, 380, ease(clamp((u - 2.4) / 1.2))), 192 - Math.abs(Math.sin(t * 6)) * 6, 0.9, t, u > 2.2 ? "happy" : "curious", 9);
    return s + qmark(470, 110, t, 44) + tag("طيارة؟", 470, 60, u, 1.2, 3, 26);
  });
  // 1 — no: a wing lifts nothing unless air rushes over it fast
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(380, 400, k), lerp(200, 250, k), lerp(1.1, 1.2, k)]; }, function (u, d, t) {
    var fall = ease(clamp((u - 0.2) / 1.4)), s = rooftop(t);
    s += R(380, 306, 120, 30, "#e8c48e", 2.4, 10) + '<path d="M392 312 h96 M392 324 h96" stroke="#c9a46a" stroke-width="2"/>';
    s += birdman(lerp(400, 440, fall), lerp(192, 306, fall), 0.9, t, fall >= 1 ? "dizzy" : "shock", fall >= 1 ? 1 : 22);
    for (var k = 0; k < 5; k++) { var p = (t * 0.6 + k / 5) % 1; s += '<path d="M' + f(lerp(560, 470, p)) + ' ' + (220 + k * 14) + ' h18" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="' + f(0.8 * Math.sin(Math.PI * p)) + '"/>'; }
    return s + cross(520, 170, 1, clamp((u - 1.8) / 1)) + tag("محتاج هوا سريع!", 400, 120, u, 2.2, -3, 22, "#f2a0a0");
  });
  // 2 — so you make a tube-shaped body and fix two wings 36 m tip to tip
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(300, 320, k), lerp(180, 180, k), lerp(0.95, 0.72, k)]; }, function (u, d, t) {
    var s = graphPaper(t), k1 = ease(clamp((u - 0.2) / 1.3)), k2 = ease(clamp((u - 1.5) / 1.4));
    s += G(lerp(-200, 320, k1), 180, 0, 1, planeTop(t, { parts: {} }));
    if (k2 > 0) s += G(320, 180, 0, 1, '<g opacity="' + f(k2) + '" transform="translate(0 0) scale(1 ' + f(k2) + ')">' + planeTop(t, { parts: { wing: true } }) + '</g>');
    var ka = clamp((u - 3.0) / 1.0); if (ka > 0) s += arrow(260, 180, 260, 180 - 229 * ka, "#f2c230", 4, 1) + arrow(260, 180, 260, 180 + 229 * ka, "#f2c230", 4, 1);
    return s + tag("جسم أنبوبة", 160, 240, u, 0.7, -3, 22) + tag("36 متر", 160, 40, u, 3.4, 3, 30, "#f2c230");
  });
  // 3 — the curved wing, tilted a little, pushes the air down and the air pushes it up
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(300, 330, k), lerp(185, 175, k), lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 30, 260, 4, 0.5), ang = 5;
    for (var i = 0; i < 9; i++) { var y = 90 + i * 22, dy = y < 180 ? -6 : 14, d2 = ""; for (var x = -100; x <= 760; x += 20) { var bend = x < 200 ? 0 : x < 440 ? (x - 200) / 240 : 1, yy = y + (y < 180 ? -14 * Math.exp(-Math.pow((x - 320) / 90, 2)) : 0) + bend * (y < 170 ? 18 : 28) * (x > 300 ? 1 : 0.2); d2 += (x === -100 ? "M" : " L") + x + " " + f(yy); } s += '<path d="' + d2 + '" stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-dasharray="14 10" stroke-dashoffset="' + f(-t * 90) + '"/>'; }
    s += airfoil(320, 180, 2.6, ang, "#e4e8ec");
    var ka = clamp((u - 1.4) / 0.8); s += arrow(470, 205, 500, 275, "#5d93ad", 6, ka) + arrow(410, 210, 430, 280, "#5d93ad", 6, ka);
    var kl = clamp((u - 2.6) / 0.8); s += arrow(320, 150, 320, 150 - 90 * kl * (1 + 0.05 * Math.sin(t * 6)), "#3aa05a", 9, kl);
    return s + tag("الهوا لتحت", 530, 310, u, 1.6, 3, 20) + tag("الجناح لفوق", 200, 60, u, 2.8, -3, 22, "#bfe8c0");
  });
  // 4 — but to carry 70 tonnes you have to run at about 270 km/h
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(320, 340, k), lerp(200, 190, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var s = airport(t, 120, 260) + G(320, 196, 0, 0.8, planeSide(t, { parts: PT(4), gear: true, roll: 0.6 }));
    for (var k = 0; k < 4; k++) { var p = (t * 1.2 + k / 4) % 1; s += '<path d="M' + f(lerp(140, 80, p)) + ' ' + (238 + k * 3) + ' h-10" stroke="#d9d4c8" stroke-width="2" opacity="' + f(1 - p) + '"/>'; }
    s += arrow(300, 190, 300, 190 + 60 * clamp((u - 0.4) / 0.6), "#d8352a", 8, 1) + tag("70 طن", 190, 110, u, 0.5, -3, 26, "#f2a0a0");
    var v = 270 * ease(clamp((u - 1.4) / 2.2)); s += speedo(530, 90, 52, v, 300, Math.round(v));
    return s + tag("270 كم/س", 520, 168, u, 3.2, 3, 22, "#f2c230");
  });
  // 5 — so you hang two jet engines under the wings, each pushing with 12 tonnes
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(380, 330, k), lerp(235, 200, k), lerp(2.0, 1.05, k)]; }, function (u, d, t) {
    var drop = ease(clamp((u - 0.2) / 1.2)), s = airport(t, 160 * clamp((u - 2) / 2), 260), P = PT(4);
    s += G(320, 196, 0, 0.8, planeSide(t, { parts: P, gear: true, roll: 1 }));
    s += G(320, 196 + lerp(-120, 0, drop), 0, 0.8, planeSide(t, { parts: { eng: true }, nobody: true, thrust: u > 1.6, spin: 1.5 }));
    for (var k = 0; k < 5; k++) { var p = (t * 1.6 + k / 5) % 1; s += '<path d="M' + f(lerp(520, 410, p)) + ' ' + (226 + (k % 3) * 6) + ' h20" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * p) * (u > 1.4 ? 1 : 0)) + '"/>'; }
    return s + tag("محرك نفاث", 420, 300, u, 1.0, -3, 20) + tag("12 طن زق", 220, 300, u, 2.6, 3, 22, "#f2c230");
  });
  // 6 — but it would keep tumbling, like an arrow without feathers
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(170, 180, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 60), r = Math.sin(t * 2.6) * 40 + u * 30;
    s += G(260, 190, r, 0.55, planeSide(t, { parts: PT(6), thrust: true }));
    s += arrowShaft(500, 90, t * 260, false);
    return s + cross(560, 230, 0.9, clamp((u - 0.8) / 1)) + tag("بتتقلب!", 260, 50, u, 0.5, -3, 26, "#f2a0a0") + tag("سهم من غير ريش", 470, 295, u, 1.6, 3, 18);
  });
  // 7 — so you add a tail: a small flat wing and a standing fin, so the nose keeps pointing forward
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(190, 300, k), lerp(160, 180, k), lerp(1.6, 1.05, k)]; }, function (u, d, t) {
    var k = ease(clamp((u - 0.3) / 1.0)), r = Math.sin(t * 2.6) * 30 * (1 - ease(clamp((u - 1.3) / 1.2))), s = skyBG(t, "day", 80);
    s += G(300, 190, r, 0.6, planeSide(t, { parts: PT(6), thrust: true }) + '<g transform="translate(0 ' + f(-140 * (1 - k)) + ')" opacity="' + f(k) + '">' + planeSide(t, { parts: { tail: true }, nobody: true }) + '</g>');
    s += arrowShaft(510, 300, Math.sin(t * 3) * 3, true) + check(580, 250, 0.8, clamp((u - 2.6) / 1));
    return s + tag("الديل", 130, 85, u, 1.0, -3, 26) + tag("بوزها لقدام", 330, 262, u, 2.4, 3, 20, "#bfe8c0");
  });
  // 8 — but how do you turn left and right in the air?
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 180, k), lerp(0.75, 0.85, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#6f9548"/>';
    for (var i = 0; i < 14; i++) { var x = ((hash(i) * 1100 - t * 60) % 1100 + 1100) % 1100 - 250; s += '<rect x="' + f(x) + '" y="' + f(-80 + hash(i + 2) * 500) + '" width="' + f(60 + hash(i + 5) * 80) + '" height="' + f(40 + hash(i + 7) * 60) + '" fill="' + ["#8aa040", "#c9b07a", "#5a8a3a"][i % 3] + '" opacity=".8"/>'; }
    s += G(320, 180, 0, 0.6, planeTop(t, { parts: PT(7) })) + curl(320, 180, 200, -2.4, -0.8, "#f2c230", 5, clamp((u - 0.4) / 0.8)) + curl(320, 180, 200, 2.4, 0.8, "#f2c230", 5, clamp((u - 0.4) / 0.8));
    return s + qmark(150, 60, t, 48) + qmark(500, 320, t, 48) + tag("يمين ولا شمال؟", 320, 30, u, 0.6, -3, 24);
  });
  // 9 — so a moving panel at each wing tip: one goes up, the other down, and the plane leans and turns
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(470, 320, k), lerp(170, 175, k), lerp(1.8, 0.8, k)]; }, function (u, d, t) {
    var ail = u < 2.4 ? Math.sin(t * 5) * clamp((u - 0.6) / 0.4) : 1, roll = u < 2.4 ? 0 : 25 * ease(clamp((u - 2.4) / 1.2)) + Math.sin(t * 2) * 2;
    var s = skyBG(t, "day", 40) + G(320, 190, 0, 1, planeFront(t, { parts: PT(9), ail: ail, roll: roll }));
    if (u > 2.4) s += arrow(320 + 229, 120, 320 + 229, 80, "#3aa05a", 5, clamp((u - 2.5) / 0.5)) + arrow(320 - 229, 190, 320 - 229, 240, "#d8352a", 5, clamp((u - 2.5) / 0.5));
    return s + tag("لوح بيتحرك", 500, 250, u, 0.8, -3, 20) + tag("تميل وتلف", 320, 80, u, 3.4, 3, 24, "#bfe8c0");
  });
  // 10 — but these engines drink a lot of fuel: where do you put it?
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(320, 360, k), lerp(180, 170, k), lerp(1.0, 1.25, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 90) + G(300, 190, 0, 0.65, planeSide(t, { parts: PT(9), thrust: true, spin: 2 }));
    s += '<g transform="translate(500 90) scale(1.4)">' + R(-40, -36, 80, 54, "#2b2f34", 2.4, 8) + fuelGauge(0, 4, 0.8 - 0.75 * clamp(u / 2.6)) + '</g>';
    return s + qmark(390, 300, t, 46) + tag("هتحطه فين؟", 200, 60, u, 1.4, -3, 24);
  });
  // 11 — so you fill the wings themselves with fuel, about 24 thousand litres
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(320, 300, k), lerp(180, 180, k), lerp(0.8, 0.72, k)]; }, function (u, d, t) {
    var fu = ease(clamp((u - 0.4) / 2.6)), s = graphPaper(t) + G(320, 180, 0, 1, planeTop(t, { parts: PT(10), fuel: fu }));
    for (var k = 0; k < 6; k++) { var p = (t * 1.5 + k / 6) % 1; s += '<circle cx="' + f(300 + (k % 2 ? 1 : -1) * lerp(40, 160, p)) + '" cy="' + f(180 + (k % 2 ? 1 : -1) * lerp(40, 180, p)) + '" r="4" fill="#f2a93b" opacity="' + f((1 - p) * (fu < 1 ? 1 : 0.3)) + '"/>'; }
    return s + tag("وقود جوه الجناح", 140, 30, u, 0.8, -3, 22) + tag("24 ألف لتر", 160, 340, u, 2.4, 3, 28, "#f2c230");
  });
  // 12 — the weight of that fuel stops the wing bending up too hard
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(170, 170, k), lerp(0.85, 0.95, k)]; }, function (u, d, t) {
    var fa = clamp((u - 1.0) / 0.8), bend = lerp(1, 0.35, ease(clamp((u - 1.2) / 1.4))) + 0.05 * Math.sin(t * 4), s = skyBG(t, "day", 40);
    s += G(320, 190, 0, 1, planeFront(t, { parts: PT(11), bend: bend, fuelArrows: fa }));
    for (var sg = -1; sg <= 1; sg += 2) s += arrow(320 + 200 * sg, 150, 320 + 200 * sg, 110 - 20 * bend, "#3aa05a", 5, 1);
    return s + tag("رفع لفوق", 320, 40, u, 0.3, -3, 20, "#bfe8c0") + tag("التقل بيشده لتحت", 320, 320, u, 1.4, 3, 20, "#f2c230");
  });
  // 13 — but at 11 km the air is so thin you'd pass out in under a minute
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(320, 330, k), lerp(170, 180, k), lerp(0.85, 1.5, k)]; }, function (u, d, t) {
    var s = sky("night") + stars(t) + '<rect x="-400" y="280" width="1440" height="300" fill="#2f4a72" opacity=".6"/>' + clouds(t, 30, 300, 5, 0.5);
    s += G(320, 180, 0, 0.9, planeSide(t, { parts: PT(13), cut: true, n: 8, mood: u > 1.8 ? "dizzy" : "worry", thrust: true }));
    s += '<g transform="translate(200 270)">' + R(-46, -26, 92, 52, "#1c1c1c", 2, 8) + T("11 كم", 0, 10, 24, "#f2c230") + '</g>';
    return s + tag("أقل من دقيقة!", 430, 100, u, 2.0, 3, 24, "#f2a0a0");
  });
  // 14 — so you seal the cabin and blow in compressed air from the engines: it feels like a 2.5 km mountain
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(380, 310, k), lerp(205, 180, k), lerp(1.6, 0.95, k)]; }, function (u, d, t) {
    var ok = u > 1.8, s = sky("night") + stars(t) + clouds(t, 30, 300, 5, 0.5), P = PT(13); P.press = ok;
    s += G(320, 180, 0, 0.9, planeSide(t, { parts: P, cut: true, n: 8, mood: ok ? "happy" : "dizzy", thrust: true }));
    for (var k = 0; k < 6; k++) { var p = (t * 0.8 + k / 6) % 1; s += '<circle cx="' + f(320 + lerp(70, -60, p) * 0.9) + '" cy="' + f(180 + lerp(30, 5, p) * 0.9) + '" r="4" fill="#bfe0ff" stroke="' + INK + '" stroke-width="1" opacity="' + f(clamp((u - 0.4) * 2) * Math.sin(Math.PI * p)) + '"/>'; }
    var km = clamp((u - 3.6) / 0.8); if (km > 0) s += '<g opacity="' + f(km) + '">' + mountain(560, 330, 0.9) + '</g>';
    return s + tag("هوا مضغوط", 430, 285, u, 0.6, -3, 22) + tag("كأنك على 2.5 كم", 470, 60, u, 3.8, 3, 20, "#bfe8c0");
  });
  // 15 — but to land you slow right down, and a slow wing won't hold you up
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(180, 210, k), lerp(0.95, 1.1, k)]; }, function (u, d, t) {
    var sink = ease(clamp((u - 1.4) / 2)), s = airport(t, 30, 330) + G(300, 140 + sink * 60, -6 * sink, 0.6, planeSide(t, { parts: PT(15), spin: 0.6, gear: true }));
    var v = lerp(270, 180, ease(clamp(u / 2))); s += speedo(530, 90, 46, v, 300, Math.round(v));
    return s + arrow(300, 210, 300, 210 + 50 * sink, "#d8352a", 6, sink) + cross(160, 120, 0.8, clamp((u - 2.2) / 1)) + tag("بطيء = بيقع", 330, 72, u, 1.8, -3, 22, "#f2a0a0");
  });
  // 16 — so wing parts slide back and down, the flaps: they make the wing bigger so it holds you while slow
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 175, k), lerp(0.75, 0.68, k)]; }, function (u, d, t) {
    var fk = ease(clamp((u - 0.6) / 1.6)), s = graphPaper(t) + G(320, 180, 0, 1, planeTop(t, { parts: PT(16), flap: fk }));
    if (u > 3) { var a = ease(clamp((u - 3) / 0.6)); s += '<g opacity="' + f(a) + '">' + R(470, 240, 200, 120, "#f4efe4", 2.4, 10) + airfoil(560, 300, 1.1, 4, "#e4e8ec") + G(560 - 60, 304, -18 * fk, 1, '<path d="M0 0 L-38 4 L-36 10 L0 6 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>') + '</g>'; }
    return s + tag("الفلابس", 150, 40, u, 1.0, -3, 28, "#f2c230") + tag("جناح أكبر", 150, 330, u, 2.2, 3, 22, "#bfe8c0");
  });
  // 17 — but when the wheels touch down you're still doing 250 km/h
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(210, 220, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var td = ease(clamp(u / 0.8)), s = airport(t, 220, 280) + G(300, lerp(200, 232, td), lerp(-4, 0, td), 0.75, planeSide(t, { parts: PT(17), gear: true, roll: 2, flap: 1 }));
    if (u > 0.7) for (var k = 0; k < 6; k++) { var p = (t * 1.5 + k / 6) % 1; s += '<circle cx="' + f(300 - 10 - p * 120) + '" cy="' + f(278 - p * 20) + '" r="' + f(6 + p * 16) + '" fill="#d9d4c8" opacity="' + f(0.7 * (1 - p)) + '"/>'; }
    s += R(610, 180, 12, 100, "#d8352a", 2) + speedo(480, 112, 42, 250, 300, "250");
    return s + tag("250 كم/س", 380, 120, u, 0.8, 3, 22, "#f2a0a0") + tag("الممر بيخلص!", 230, 82, u, 1.8, -3, 22, "#f2a0a0");
  });
  // 18 — so strong brakes in the wheels, and the engines throw the air forwards to brake too
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(330, 360, k), lerp(240, 225, k), lerp(1.6, 1.15, k)]; }, function (u, d, t) {
    var slow = 1 - ease(clamp((u - 0.4) / 3.6)), s = airport(t, 220 * slow + 4, 280) + R(610, 180, 12, 100, "#d8352a", 2);
    s += G(lerp(300, 380, ease(clamp(u / 4))), 232, 0, 0.75, planeSide(t, { parts: PT(18), gear: true, roll: 2 * slow, brake: u > 0.4, rev: u > 1.6, flap: 1 }));
    s += speedo(490, 150, 36, 250 * slow, 300, Math.round(250 * slow)) + check(560, 140, 0.8, clamp((u - 3.8) / 1));
    return s + tag("فرامل", 250, 332, u, 0.6, -3, 22, "#f2a0a0") + tag("الهوا لقدام", 470, 332, u, 1.8, 3, 22);
  });
  // 19 — many think if both engines stop, the plane drops like a stone
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(180, 180, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 50), P = PT(19), drop = (t * 0.9) % 1;
    s += G(280, 170, 0, 0.6, planeSide(t, { parts: P, cut: true, n: 6, mood: "shock", stopped: true }));
    s += G(540, lerp(40, 380, drop), drop * 200, 1, '<path d="M-20 -6 L-4 -18 L18 -12 L22 8 L4 18 L-18 12 Z" fill="#8a8580" stroke="' + INK + '" stroke-width="2.4"/>');
    return s + tag("زي الحجر؟", 450, 60, u, 1.2, 3, 26, "#f2a0a0") + tag("المحركين وقفوا", 240, 320, u, 0.4, -3, 20);
  });
  // 20 — really, it keeps flying like a paper plane
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(300, 340, k), lerp(160, 200, k), lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    var s = skyBG(t, "day", 40) + G(lerp(220, 380, u / d), lerp(140, 210, u / d), 6, 0.55, planeSide(t, { parts: PT(19), stopped: true }));
    s += paperPlane(lerp(200, 330, u / d), lerp(290, 330, u / d), 10, 0.9 + 0.05 * Math.sin(t * 3)) + '<path d="M80 100 L560 250" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" stroke-dashoffset="' + f(-t * 40) + '" opacity=".7"/>';
    return s + tag("زي الطيارة الورق", 450, 70, u, 0.5, 3, 22, "#bfe8c0");
  });
  // 21 — in 2001 a plane ran out of fuel over the ocean and glided about 120 km to land safely (Air Transat 236, the Azores)
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(170, 190, k), lerp(0.9, 1.05, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sea2)"/>';
    for (var i = 0; i < 20; i++) { var y = -40 + i * 24, x = ((hash(i) * 900 + t * 18) % 1000) - 200; s += '<path d="M' + f(x) + ' ' + y + ' q10 -4 20 0 t20 0" stroke="#8fd0ee" stroke-width="1.6" fill="none" opacity=".5"/>'; }
    s += '<path d="M500 190 C520 160 590 150 610 180 C630 210 580 240 540 230 C510 224 490 210 500 190 Z" fill="#9dbb6e" stroke="' + INK + '" stroke-width="2.4"/>' + R(520, 190, 60, 8, "#5a5752", 1.4);
    var g = ease(clamp((u - 0.4) / 4.6)), x = lerp(60, 540, g), y = lerp(120, 192, g);
    s += '<path d="M60 120 L540 192" stroke="#f2c230" stroke-width="3" stroke-dasharray="10 8" opacity=".8"/>' + G(x, y, 8, 0.28, planeSide(t, { parts: PT(19), stopped: true }));
    s += '<g transform="translate(110 290) scale(1.1)">' + R(-40, -36, 80, 54, "#2b2f34", 2.4, 8) + fuelGauge(0, 4, 0.02) + '</g>';
    var km = Math.round(120 * g); s += '<g transform="translate(320 300)">' + R(-70, -24, 140, 48, "#1c1c1c", 2, 8) + T(km + " كم", 0, 10, 26, "#f2c230") + '</g>';
    return s + tag("2001", 140, 40, u, 0.4, -3, 28) + check(560, 120, 0.9, clamp((u - 5.0) / 1)) + tag("نزلت سليمة!", 470, 290, u, 5.0, 3, 22, "#bfe8c0");
  });
  // 22 — add seats, round windows and a cockpit for the pilot
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(200, 480, k), lerp(185, 185, k), lerp(1.4, 1.5, k)]; }, function (u, d, t) {
    var P = PT(21); P.seats = u > 0.2; P.windows = u > 1.0; P.cockpit = u > 1.9; P.press = true;
    var s = graphPaper(t) + G(320, 180, 0, 1, planeSide(t, { parts: P, cut: u < 1.0 || u > 1.9, n: 0, thrust: false }));
    return s + tag("كراسي", 180, 120, u, 0.2, -3, 20) + tag("شبابيك مدوّرة", 360, 260, u, 1.0, 3, 20, "#e8c48e") + tag("كابينة الطيار", 515, 112, u, 1.9, -3, 18);
  });
  // 23 — and congratulations, you've built an airplane
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(330, 320, k), lerp(200, 170, k), lerp(1.1, 0.85, k)]; }, function (u, d, t) {
    var s = airport(t, 60, 300) + G(lerp(300, 340, u / d), lerp(240, 180, ease(u / d)), -10 * ease(u / d), 0.7, planeSide(t, { parts: PT(23), thrust: true, gear: u < 1, roll: 2 }));
    for (var c = 0; c < 18; c++) { var p = (t * 0.6 + hash(c)) % 1, cx = -20 + hash(c + 2) * 680, cy = -20 + p * 380; s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="6" height="10" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; }
    return s + engineer(90, 250, t, "happy", { s: 0.35 }) + tag("مبروك!", 330, 40, u, 0.3, -3, 32, "#bfe8c0");
  });
  // 24 — outro
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(300, 360, k), lerp(180, 170, k), lerp(1.0, 0.9, k)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(500, 260, 40, "#f7b04a") + clouds(t, 20, 30, 5, 0.6) + city(t, 330, 80, "#7a5a6a", "#ffd88a", 9);
    s += G(lerp(160, 460, u / d), lerp(220, 150, u / d), -6, 0.4, planeSide(t, { parts: PT(23), thrust: true }));
    return s + tag("قولولنا!", 320, 60, u, 0.4, 3, 30);
  });

  window.__parts = { planeSide: planeSide, planeTop: planeTop, planeFront: planeFront, airport: airport, skyBG: skyBG, PT: PT, tag: tag, hardHat: engineer, engineer: engineer, T: T, sky: sky, clouds: clouds, city: city };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), zc = c[2] > 1 ? 1 + (c[2] - 1) * 0.35 : c[2], cx = c[0] + 10 * Math.sin(t * 1.2), cy = c[1] + 8 * Math.cos(t * 1.2), z = zc * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
