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

  // ── the container ship (side view, from photos of Evergreen / Maersk / MSC ships): a long dark hull with red
  // antifouling paint below the design waterline, a raked bow with a bulb, a square stern, container stacks in bays,
  // the deckhouse (bridge) and the funnel. Hull coordinates: deck at 0, keel at 70, the paint line at 38.
  var BOX = ["#b8432e", "#2f6f9f", "#3f7a52", "#d9d4c8", "#9aa0a8", "#e8742e", "#8a5a3a", "#c9c4b8", "#6f7680", "#a83a3a"];
  function hullPath(L) { return 'M' + (-L) + ' 0 L' + (L - 24) + ' 0 L' + (L + 12) + ' -8 C' + (L + 6) + ' 26 ' + (L + 2) + ' 44 ' + (L - 18) + ' 52 C' + (L - 4) + ' 58 ' + (L - 10) + ' 70 ' + (L - 40) + ' 70 L' + (-L + 26) + ' 70 C' + (-L + 8) + ' 70 ' + (-L) + ' 60 ' + (-L) + ' 46 Z'; }
  function stacks(x0, x1, tiers, seed, t, skip) {
    var s = "", w = 19;
    for (var x = x0, b = 0; x + w <= x1; x += w + 2, b++) {
      if (skip && x + w > skip[0] && x < skip[1]) continue;
      var n = Math.max(0, tiers - (hash(b + seed) > 0.8 ? 1 : 0) - (b < 2 || x + w > x1 - 30 ? 2 : 0));
      if (b % 2 === 0 && n > 0) s += '<path d="M' + f(x - 1) + ' 0 V-24 M' + f(x - 1) + ' -12 H' + f(x + 1) + ' M' + f(x - 1) + ' -24 H' + f(x + 1) + '" stroke="#c8452e" stroke-width="2.2"/>';
      for (var r = 0; r < n; r++) { var c = BOX[Math.floor(hash(b * 7 + r * 3 + seed) * BOX.length)];
        s += '<rect x="' + f(x) + '" y="' + f(-11 - r * 11) + '" width="' + w + '" height="11" fill="' + c + '" stroke="' + INK + '" stroke-width=".9"/><path d="M' + f(x + 4) + ' ' + f(-9 - r * 11) + ' v7 M' + f(x + 9.5) + ' ' + f(-9 - r * 11) + ' v7 M' + f(x + 15) + ' ' + f(-9 - r * 11) + ' v7" stroke="#000" stroke-width=".6" opacity=".25"/>'; }
    }
    return s;
  }
  // o: {s, dr: draft 0..70 (how deep the keel sits), tiers: container rows, green: Evergreen colours and layout,
  //     cut: 0..1 cut-away showing the hollow inside, flood: 0..1 water inside, ballast: 0..1 tanks filling, lines: load line,
  //     tilt, hole: water gushing in, noBob, mood: a face on the bridge window? no}
  function ship(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, L = 260, dr = o.dr == null ? 40 : o.dr, bob = o.noBob ? 0 : Math.sin(t * 1.1 + x * 0.01) * 1.6, id = "sh" + (CLIPN++);
    var hullC = o.green ? "#2f7a4a" : "#1f3a5a", s = '<g transform="translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f((o.tilt || 0) + Math.sin(t * 0.9 + x) * 0.4) + ') scale(' + sc + ') translate(0 ' + f(-dr) + ')">';
    s += '<defs><clipPath id="' + id + '"><path d="' + hullPath(L) + '"/></clipPath></defs>';
    var bx = o.aft ? [-L + 34, -L + 84] : [70, 110], tiers = o.tiers == null ? 6 : o.tiers;
    if (tiers > 0) s += stacks(-L + 30, L - 40, tiers, o.green ? 11 : 3, t, bx);
    // deckhouse (bridge) with windows, bridge wings; funnel aft
    var hx = bx[0], hw = bx[1] - bx[0];
    s += '<rect x="' + hx + '" y="-78" width="' + hw + '" height="78" fill="#f1f0ea" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (hx - 8) + '" y="-84" width="' + (hw + 16) + '" height="10" fill="#e4e2da" stroke="' + INK + '" stroke-width="1.4"/>';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 4; c++) s += '<rect x="' + (hx + 5 + c * (hw - 10) / 4) + '" y="' + (-72 + r * 12) + '" width="' + ((hw - 10) / 4 - 3) + '" height="5" fill="' + (r === 0 ? "#2b4a6a" : "#5d93ad") + '"/>';
    s += '<path d="M' + (hx + 10) + ' -84 V-96 M' + (hx + hw - 12) + ' -84 V-92" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (hx + 10) + '" cy="-97" r="2" fill="' + (Math.sin(t * 4) > 0 ? "#ff4030" : "#601010") + '"/>';
    var fx = o.aft ? -L + 92 : -L + 26; s += '<path d="M' + fx + ' 0 L' + (fx + 4) + ' -70 H' + (fx + 30) + ' L' + (fx + 34) + ' 0 Z" fill="' + (o.green ? "#2f7a4a" : "#2b3340") + '" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + (fx + 4) + '" y="-70" width="26" height="10" fill="#1c1c1c"/>';
    for (var k = 0; k < 4; k++) { var u = (t * 0.45 + k / 4) % 1; s += '<circle cx="' + f(fx + 17 - u * 60) + '" cy="' + f(-76 - u * 40) + '" r="' + f(5 + u * 12) + '" fill="#9aa0a8" opacity="' + f(0.4 * (1 - u)) + '"/>'; }
    // the hull: red below the paint line, the hull colour above, a white name stripe
    s += '<path d="' + hullPath(L) + '" fill="#a8322a"/>';
    s += '<g clip-path="url(#' + id + ')"><rect x="' + (-L - 20) + '" y="-20" width="' + (2 * L + 40) + '" height="58" fill="' + hullC + '"/>';
    s += o.green ? '<text x="-40" y="24" text-anchor="middle" style="font:800 17px Noto Serif;fill:#fff;letter-spacing:6px">EVERGREEN</text>' : '<text x="-60" y="27" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#fff" opacity=".92">إيه الحكاية</text>';
    if (o.cut) {
      var ck = clamp(o.cut);
      s += '<rect x="' + (-L + 14) + '" y="6" width="' + (2 * L - 40) + '" height="58" fill="#dcefff" opacity="' + f(ck) + '"/>';
      for (var fr = -L + 40; fr < L - 30; fr += 34) s += '<path d="M' + fr + ' 6 V64" stroke="#8a8f96" stroke-width="2" opacity="' + f(ck) + '"/>';
      s += '<path d="M' + (-L + 14) + ' 56 H' + (L - 26) + '" stroke="#8a8f96" stroke-width="2.4" opacity="' + f(ck) + '"/>';
      if (o.ballast) s += '<rect x="' + (-L + 14) + '" y="' + f(70 - 14 * clamp(o.ballast)) + '" width="' + (2 * L - 40) + '" height="14" fill="#2f7fb8" opacity=".85"/>';
      if (o.flood) { var fh = 64 * clamp(o.flood), wy = 70 - fh; s += '<path d="M' + (-L) + ' ' + f(wy) + ' ' + wavePath(-L, L, wy, t, 2) + ' V80 H' + (-L) + ' Z" fill="#2f7fb8" opacity=".9"/>'; }
      if (!o.flood && !o.ballast) for (var a = 0; a < 5; a++) s += '<text x="' + (-L + 80 + a * 95) + '" y="' + f(38 + Math.sin(t * 2 + a) * 4) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#5d93ad" opacity="' + f(ck * (0.6 + 0.4 * Math.sin(t * 3 + a))) + '">هوا</text>';
    }
    s += '</g><path d="' + hullPath(L) + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (-L) + ' 4 H' + (L - 20) + '" stroke="#fff" stroke-width="1.4" opacity=".5"/>';
    s += '<path d="M' + (L - 40) + ' 0 V-14 H' + (L + 6) + ' L' + (L + 12) + ' -8" fill="' + hullC + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (L - 14) + ' -14 V-46 M' + (L - 22) + ' -36 H' + (L - 6) + '" stroke="#e8e4da" stroke-width="2.4"/><circle cx="' + (L - 4) + '" cy="10" r="4" fill="#111" stroke="#666"/><path d="M' + (L + 4) + ' 6 L' + (L + 12) + ' -8" stroke="' + INK + '" stroke-width="1.4"/><text x="' + (L - 30) + '" y="58" style="font:700 7px Noto Serif;fill:#fff" opacity=".8">14 12 10</text>';
    if (o.lines) s += plimsoll(-20, 34, 0.5);
    if (o.hole) { s += '<circle cx="60" cy="50" r="7" fill="#111"/>'; for (var j = 0; j < 8; j++) { var uu = (t * 1.8 + j / 8) % 1; s += '<circle cx="' + f(60 - uu * 40) + '" cy="' + f(50 + Math.sin(j) * 4) + '" r="' + f(2 + uu * 3) + '" fill="#8fd0ee" opacity="' + f(1 - uu) + '"/>'; } }
    return s + '</g>';
  }
  function wavePath(x0, x1, y, t, a) { var d = ""; for (var x = x0; x <= x1; x += 20) d += " L" + x + " " + f(y + Math.sin(x * 0.05 + t * 3) * a); return d; }
  // the sea in front of a ship: a translucent layer so the hull below the waterline looks submerged
  function front(t, y, col, x0, x1) { x0 = x0 == null ? -400 : x0; x1 = x1 == null ? 1040 : x1; var d = "M" + x0 + " " + y + wavePath(x0, x1, y, t, 3); return '<path d="' + d + ' V700 H' + x0 + ' Z" fill="' + (col || "#2f7fb8") + '" opacity=".55"/><path d="' + d.replace("M" + x0 + " " + y + " L", "M") + '" stroke="#fff" stroke-width="2" fill="none" opacity=".75"/>'; }
  // the load line mark (Plimsoll): the ringed disc and the ladder of lines for fresh/tropical/summer/winter water
  function plimsoll(x, y, s) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" stroke="#fff" fill="none" stroke-width="3">';
    g += '<circle r="22"/><path d="M-32 0 H32 M-40 -30 H40"/><path d="M52 -40 V40"/>';
    [["TF", -26], ["F", -16], ["T", -6], ["S", 0], ["W", 8]].forEach(function (l, i) { g += '<path d="M52 ' + l[1] + ' H' + (i < 2 ? 32 : 76) + '"/><text x="' + (i < 2 ? 22 : 80) + '" y="' + (l[1] + 4) + '" stroke="none" fill="#fff" style="font:700 10px Noto Serif"' + (i < 2 ? ' text-anchor="end"' : "") + '>' + l[0] + '</text>'; });
    return g + '<text x="-36" y="-6" stroke="none" fill="#fff" style="font:700 13px Noto Serif">L</text><text x="26" y="-6" stroke="none" fill="#fff" style="font:700 13px Noto Serif">R</text></g>';
  }
  function basin(x, y, w, t, o) {   // a metal basin (طشت) with water, front half cut low so we see inside
    o = o || {}; var s = '<g transform="translate(' + x + ' ' + y + ')">';
    s += '<path d="M' + (-w) + ' -60 L' + (-w * 0.82) + ' 30 H' + (w * 0.82) + ' L' + w + ' -60 Z" fill="#a7b1bc" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M' + (-w * 0.97) + ' -44' + wavePath(-w * 0.97, w * 0.97, -44, t, 1.5) + ' L' + (w * 0.83) + ' 26 H' + (-w * 0.83) + ' Z" fill="#5fb0e0" opacity=".8"/>';
    s += '<ellipse cx="0" cy="-60" rx="' + w + '" ry="10" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M' + (-w * 0.9) + ' -30 Q0 -20 ' + (w * 0.9) + ' -30" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>';
    return s + '</g>';
  }
  function nail(x, y, ang, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (s || 1) + ')"><rect x="-2.5" y="-20" width="5" height="34" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/><rect x="-7" y="-23" width="14" height="4" rx="1" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/><path d="M-2.5 14 L0 22 L2.5 14 Z" fill="#8a8f96" stroke="' + INK + '"/></g>'; }
  function tank(x, y, w, h, level, t) {   // a glass aquarium tank with water at `level` (px from the bottom)
    var wy = y + h - level, s = '<rect x="' + x + '" y="' + f(wy) + '" width="' + w + '" height="' + f(level) + '" fill="#5fb0e0" opacity=".55"/>';
    s += '<path d="M' + x + ' ' + f(wy) + wavePath(x, x + w, wy, t, 1.2) + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>';
    return s + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#bfe6f7" fill-opacity=".12" stroke="#cfe8f5" stroke-width="4"/><path d="M' + (x + 8) + ' ' + (y + 10) + ' v' + (h - 30) + '" stroke="#fff" stroke-width="3" opacity=".4"/>';
  }
  function scaleBal(x, y, tiltDeg, left, right) {   // a balance; left/right are SVG drawn at the pan origins
    var a = tiltDeg * Math.PI / 180, lx = x - 120 * Math.cos(a), ly = y - 120 * Math.sin(a), rx = x + 120 * Math.cos(a), ry = y + 120 * Math.sin(a);
    var s = '<path d="M' + x + ' ' + (y + 130) + ' V' + y + '" stroke="' + INK + '" stroke-width="8"/><path d="M' + (x - 50) + ' ' + (y + 134) + ' H' + (x + 50) + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + f(lx) + ' ' + f(ly) + ' L' + f(rx) + ' ' + f(ry) + '" stroke="#8a6a2a" stroke-width="7" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
    [[lx, ly, left], [rx, ry, right]].forEach(function (p) { s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + ' l-30 50 M' + f(p[0]) + ' ' + f(p[1]) + ' l30 50" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(p[0] - 44) + ' ' + f(p[1] + 50) + ' Q' + f(p[0]) + ' ' + f(p[1] + 66) + ' ' + f(p[0] + 44) + ' ' + f(p[1] + 50) + ' Z" fill="#c9a050" stroke="' + INK + '" stroke-width="2"/><g transform="translate(' + f(p[0]) + ' ' + f(p[1] + 50) + ')">' + p[2] + '</g>'; });
    return s;
  }
  function upArrows(t, x0, x1, y, n, len, col) { var s = ""; for (var i = 0; i < n; i++) { var x = lerp(x0, x1, (i + 0.5) / n), k = 0.75 + 0.25 * Math.sin(t * 5 + i); s += arrow(x, y + len * k, x, y, col || "#f2c230", 5, 1); } return s; }
  function archimedes(x, y, t, mood, o) {   // a ball-head Greek with a beard, a laurel wreath and a toga
    o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.4) * 2) + ') scale(' + (o.s || 1) + ')">';
    if (!o.noBody) s += '<path d="M-56 140 C-60 56 -38 32 0 32 C38 32 60 56 56 140 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-40 40 L46 136" stroke="#c9a050" stroke-width="8" opacity=".8"/>';
    s += head(0, -30, 40, mood, t, o.look) + '<path d="M-30 -12 C-28 30 28 30 30 -12 C20 6 -20 6 -30 -12 Z" fill="#e8e4da" stroke="' + INK + '" stroke-width="2"/>';
    for (var l = 0; l < 7; l++) { var a = Math.PI + l * Math.PI / 6; s += '<ellipse cx="' + f(Math.cos(a) * 38) + '" cy="' + f(-36 + Math.sin(a) * 30) + '" rx="8" ry="4" transform="rotate(' + f(l * 30 + 90) + ' ' + f(Math.cos(a) * 38) + ' ' + f(-36 + Math.sin(a) * 30) + ')" fill="#5a8a3a" stroke="' + INK + '" stroke-width="1.2"/>'; }
    return s + '</g>';
  }
  function columns(t, y) { var s = '<rect x="-400" y="' + (y + 100) + '" width="1440" height="300" fill="#d9c79a"/>'; for (var i = 0; i < 9; i++) { var x = -260 + i * 130; s += '<rect x="' + (x - 16) + '" y="' + (y - 120) + '" width="32" height="220" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/><path d="M' + (x - 10) + ' ' + (y - 110) + ' V' + (y + 90) + ' M' + x + ' ' + (y - 110) + ' V' + (y + 90) + ' M' + (x + 10) + ' ' + (y - 110) + ' V' + (y + 90) + '" stroke="#c9b98a" stroke-width="2"/><rect x="' + (x - 24) + '" y="' + (y - 132) + '" width="48" height="14" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/>'; } return s + '<path d="M-400 ' + (y - 132) + ' H1040 V' + (y - 170) + ' H-400 Z" fill="#ece4d0" stroke="#8a7448" stroke-width="2"/>'; }
  function pool(x, y, w, h, t, k) { var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="#4fb3d9" stroke="#e8e4da" stroke-width="2.4"/>'; for (var l = 1; l < 4; l++) s += '<path d="M' + (x + 2) + ' ' + f(y + l * h / 4) + ' H' + (x + w - 2) + '" stroke="#fff" stroke-width=".8" stroke-dasharray="2 2" opacity=".8"/>'; return s + '<path d="M' + (x + 3) + ' ' + (y + 3) + ' l' + f(w * 0.4) + ' 0" stroke="#fff" stroke-width="1.4" opacity="' + f(0.3 + 0.3 * Math.sin(t * 4 + k)) + '"/>'; }
  function seaScene(t, y, o) { return sea(t, y, 0, o); }
  // top view of a container ship (for the Suez blockage): green hull, rows of containers, bridge block
  function shipTop(x, y, ang, t, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (s || 1) + ')"><path d="M-200 -28 H170 Q215 -26 222 0 Q215 26 170 28 H-200 Z" fill="#2f7a4a" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var b = 0; b < 15; b++) for (var r = 0; r < 4; r++) { var bx = -188 + b * 23; if (b === 11) continue; g += '<rect x="' + bx + '" y="' + (-24 + r * 12) + '" width="21" height="11" fill="' + BOX[Math.floor(hash(b * 5 + r) * BOX.length)] + '" stroke="' + INK + '" stroke-width=".7"/>'; }
    return g + '<rect x="65" y="-26" width="20" height="52" fill="#f1f0ea" stroke="' + INK + '" stroke-width="1.6"/><rect x="-196" y="-12" width="14" height="24" fill="#2f7a4a" stroke="' + INK + '" stroke-width="1.4"/></g>';
  }
  function canalFlow(t) { var g = ""; for (var i = 0; i < 26; i++) { var x = ((hash(i) * 1440 + t * (40 + hash(i + 1) * 30)) % 1440) - 400, y = 135 + hash(i + 2) * 110; g += '<path d="M' + f(x) + ' ' + f(y) + ' h' + f(20 + hash(i + 3) * 30) + '" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>'; } for (var j = 0; j < 14; j++) { var dx = ((hash(j + 40) * 1440 + t * 70) % 1440) - 400, dy = -150 + hash(j + 41) * 600; if (dy < 110 || dy > 270) g += '<ellipse cx="' + f(dx) + '" cy="' + f(dy) + '" rx="26" ry="4" fill="#f4e4b0" opacity=".6"/>'; }
    for (var c = 0; c < 3; c++) { var sx = ((t * 90 + c * 480) % 1440) - 400, sy = 40 + c * 120; g += '<ellipse cx="' + f(sx) + '" cy="' + sy + '" rx="150" ry="80" fill="#000" opacity=".2" filter="url(#soft)"/>'; }
    return g; }
  function tug(x, y, ang, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"><path d="M-16 -7 H10 Q20 0 10 7 H-16 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.4"/><rect x="-8" y="-4" width="9" height="8" fill="#f1f0ea" stroke="' + INK + '"/>' + '<path d="M-18 0 h' + f(-8 - 6 * Math.abs(Math.sin(t * 6))) + '" stroke="#fff" stroke-width="3" opacity=".7"/></g>'; }
  function digger(x, y, t) { var a = Math.sin(t * 2) * 12; return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-14" y="-10" width="28" height="16" fill="#e2b035" stroke="' + INK + '" stroke-width="1.4"/><path d="M8 -6 L30 ' + f(-16 + a * 0.3) + ' L40 ' + f(-2 + a * 0.4) + '" stroke="#e2b035" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M36 ' + f(-6 + a * 0.4) + ' l8 4 l-4 8 Z" fill="#1c1c1c"/></g>'; }
  function bar(x, y, w, h, k, col, label) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#1c1c1c" opacity=".55"/><rect x="' + x + '" y="' + f(y + h * (1 - clamp(k))) + '" width="' + w + '" height="' + f(h * clamp(k)) + '" rx="6" fill="' + col + '"/><text x="' + (x + w / 2) + '" y="' + (y + h + 20) + '" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + label + '</text>'; }



  // ── the airbag episode: parts drawn from the user's photos (deployed bag in a red sedan, torn wheel cover with its
  //    H seam, the disc pyrotechnic inflator and its cut-away, the aluminium airbag control unit with the orange label
  //    on the floor tunnel, the exploded steering-wheel module). Shaded to read as 3D. See ../refs/SOURCES.md ──
  function shadow(x, y, rx, ry, op) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="url(#shadowG)" opacity="' + (op == null ? 1 : op) + '"/>'; }
  function badge(x, y, txt, col, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="24" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/><text y="10" text-anchor="middle" style="font:900 28px Noto Sans Arabic;fill:#fff">' + txt + '</text></g>'; }
  function lbl(x, y, txt, sz, col, anc) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anc || "middle") + '" style="font:800 ' + (sz || 15) + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + txt + '</text>'; }
  function vig() { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#vig)"/>'; }
  function dark(col) { return '<rect x="-400" y="-300" width="1440" height="960" fill="' + (col || "#1a2230") + '"/>'; }
  function stopwatch(x, y, r, v, txt) { var a = v * Math.PI * 2; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + shadow(0, r + 6, r, 6) + '<rect x="-7" y="' + f(-r - 14) + '" width="14" height="10" rx="2" fill="url(#aSteel)" stroke="' + INK + '"/><circle r="' + r + '" fill="url(#aSteel)" stroke="' + INK + '" stroke-width="2.4"/><circle r="' + (r - 6) + '" fill="#fbfaf6"/>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { var b = i / 12 * Math.PI * 2; return '<path d="M' + f(Math.sin(b) * (r - 8)) + ' ' + f(-Math.cos(b) * (r - 8)) + ' L' + f(Math.sin(b) * (r - 13)) + ' ' + f(-Math.cos(b) * (r - 13)) + '" stroke="#555" stroke-width="1.6"/>'; }).join("") +
    '<path d="M0 0 L' + f(Math.sin(a) * (r - 10)) + ' ' + f(-Math.cos(a) * (r - 10)) + '" stroke="#c23a26" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="' + INK + '"/>' + (txt ? lbl(0, r + 26, txt, 17, "#f2c230") : "") + '</g>'; }
  function eye(x, y, s, open) { var h = 14 * clamp(open); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-26 0 Q0 ' + f(-h * 1.6) + ' 26 0 Q0 ' + f(h * 1.6) + ' -26 0 Z" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>' + (h > 3 ? '<circle r="' + f(Math.min(9, h * 0.8)) + '" fill="#4a6a8a"/><circle r="' + f(Math.min(4, h * 0.35)) + '" fill="' + INK + '"/>' : "") + '<path d="M-26 0 Q0 ' + f(-h * 1.6 - 4) + ' 26 0" fill="none" stroke="' + INK + '" stroke-width="3"/></g>'; }

  // a red compact sedan, side view facing right (photo: red Mitsubishi with the bags out): shaded body, tinted glass,
  // alloy wheels turning, headlight; o: {s, crush 0..1 (front crumples), spin}
  function sedan(x, y, t, o) {
    o = o || {}; var c = clamp(o.crush || 0), nose = 150 - 26 * c, sp = o.spin == null ? t * 8 : o.spin, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (o.s || 1) + ')">' + shadow(0, 30, 170, 10);
    s += '<path d="M-160 10 L-160 -22 Q-158 -36 -140 -40 L-96 -44 Q-70 -86 -20 -88 L40 -88 Q78 -86 100 -50 L' + f(nose - 14) + ' -42 Q' + f(nose) + ' -38 ' + f(nose) + ' -18 L' + f(nose) + ' 10 Z" fill="url(#carRed)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-86 -46 Q-64 -80 -22 -82 L-6 -82 L-6 -46 Z" fill="url(#glassG)" stroke="' + INK + '" stroke-width="1.6"/><path d="M2 -82 L38 -82 Q70 -80 90 -48 L2 -46 Z" fill="url(#glassG)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-150 -26 H' + f(nose - 10) + '" stroke="#fff" stroke-width="2" opacity=".35"/><path d="M-4 -46 V8 M-90 -40 V8" stroke="#6a1a10" stroke-width="1.4"/><rect x="-34" y="-30" width="16" height="4" rx="2" fill="#2a2a2a"/><rect x="50" y="-30" width="16" height="4" rx="2" fill="#2a2a2a"/>';
    s += '<path d="M' + f(nose - 10) + ' -34 l10 2 v8 l-12 -2 Z" fill="#fff6c8" stroke="' + INK + '"/><path d="M-160 -30 l8 0 v8 l-8 0 Z" fill="#c23a26" stroke="' + INK + '"/><path d="M84 -50 l12 -4 v8 l-10 2 Z" fill="#2a2a2a"/>';
    if (c > 0) { s += '<path d="M' + f(nose) + ' -30 l-8 6 l8 6 l-8 6 l8 6" stroke="#5a0a05" stroke-width="2" fill="none"/>'; for (var k = 0; k < 4; k++) s += '<path d="M' + f(nose - 30 - k * 10) + ' -40 l4 30" stroke="#5a0a05" stroke-width="1.2" opacity="' + f(c) + '"/>'; }
    [-100, 100 - 10 * c].forEach(function (wx) { s += '<g transform="translate(' + f(wx) + ' 10)"><circle r="26" fill="#1c1c1c" stroke="' + INK + '" stroke-width="2"/><circle r="16" fill="url(#aSteel)" stroke="#333"/><g transform="rotate(' + f(sp * 57) + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<path d="M0 0 L0 -15" stroke="#3a3f46" stroke-width="4" transform="rotate(' + a + ')"/>'; }).join("") + '</g><circle r="4" fill="#ccc"/></g>'; });
    return s + '</g>';
  }
  // a concrete crash barrier with yellow-black chevrons
  function barrier(x, y, t, shake) { var j = (shake || 0) * Math.sin(t * 60) * 2, s = '<g transform="translate(' + f(x + j) + ' ' + f(y) + ')">' + shadow(20, 6, 60, 6) + '<rect x="0" y="-130" width="40" height="136" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 6; i++) s += '<path d="M0 ' + (-120 + i * 22) + ' l20 10 l-20 10 Z" fill="' + (i % 2 ? "#1c1c1c" : "#f2c230") + '"/>';
    return s + '<rect x="-4" y="-136" width="48" height="8" fill="#9a958c" stroke="' + INK + '"/></g>'; }
  function road(t, y, sp) { var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#road)"/>'; for (var i = 0; i < 16; i++) { var x = ((i * 120 - t * (sp || 300)) % 1920 + 1920) % 1920 - 400; s += '<rect x="' + f(x) + '" y="' + (y + 24) + '" width="60" height="5" fill="#f4f1e8" opacity=".8"/>'; } return s; }
  function speedLines(t, x0, x1, y0, y1, n, op) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * 2.4 + i / n) % 1, y = lerp(y0, y1, hash(i)); s += '<path d="M' + f(lerp(x1, x0, u)) + ' ' + f(y) + ' h' + f(-40 - hash(i + 3) * 40) + '" stroke="#fff" stroke-width="2" opacity="' + f((op || 0.5) * Math.sin(Math.PI * u)) + '"/>'; } return s; }

  // the cabin in side cut-away, driver facing right: seat, belt, wheel, dash, the windscreen with the road rushing in.
  // o: {fw: head/torso pitch forward 0..1, bag: inflation 0..1, vent: venting puffs 0..1, powder: haze 0..1, ruler, outside: speed}
  var HUB = [408, 178];
  function cabin(t, o) {
    o = o || {}; var fw = clamp(o.fw || 0), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a2f38"/>';
    s += '<path d="M330 20 L700 20 L700 172 L420 172 Z" fill="url(#sky-day)"/>' + '<path d="M420 172 L700 172 L700 150 L470 150 Z" fill="#8fa070"/>';
    for (var i = 0; i < 5; i++) { var u = ((t * (o.outside == null ? 1.2 : o.outside) + i / 5) % 1); s += '<rect x="' + f(lerp(700, 430, u)) + '" y="' + f(lerp(130, 60, hash(i))) + '" width="' + f(14 + 30 * u) + '" height="' + f(30 + 40 * u) + '" fill="#9a958c" opacity="' + f(0.6 * u) + '"/>'; }
    s += '<path d="M330 20 L420 172" stroke="#1c1f24" stroke-width="12"/><path d="M-400 0 H700 V20 H-400 Z" fill="#3a3f48"/><path d="M-400 300 H700 V700 H-400 Z" fill="#20242b"/>';
    s += '<path d="M400 172 L700 160 L700 270 L470 262 Q430 240 400 172 Z" fill="url(#dashG)" stroke="' + INK + '" stroke-width="2"/><path d="M405 176 L700 164" stroke="#5a606b" stroke-width="2"/>';
    s += '<path d="M470 228 L' + f(HUB[0] + 4) + ' ' + f(HUB[1] + 4) + '" stroke="#2b2f35" stroke-width="16" stroke-linecap="round"/>';
    // seat + driver (pitches forward with fw)
    s += '<path d="M150 300 L170 118 Q176 100 196 104 L212 110 L196 300 Z" fill="url(#seatG)" stroke="' + INK + '" stroke-width="2"/><rect x="164" y="74" width="40" height="34" rx="12" fill="url(#seatG)" stroke="' + INK + '" stroke-width="2"/><path d="M150 300 L330 300 L320 272 L168 268 Z" fill="url(#seatG)" stroke="' + INK + '" stroke-width="2"/>';
    var hx = 268 + 64 * fw, hy = 132 + 16 * fw, sx = 244 + 34 * fw, sy = 186 + 6 * fw;
    s += '<path d="M226 292 L' + f(sx - 20) + ' ' + f(sy - 6) + ' Q' + f(sx) + ' ' + f(sy - 20) + ' ' + f(sx + 22) + ' ' + f(sy - 4) + ' L262 292 Z" fill="#3f6f8f" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M240 286 Q330 280 360 276 L440 318" stroke="#2f3a4a" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M440 318 l22 0" stroke="#1c1c1c" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + f(sx + 10) + ' ' + f(sy) + ' Q' + f(sx + 70) + ' ' + f(sy + 10) + ' ' + f(HUB[0] - 16) + ' ' + f(HUB[1] - 18) + '" stroke="#3f6f8f" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="' + f(HUB[0] - 16) + '" cy="' + f(HUB[1] - 18) + '" r="8" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M200 118 L' + f(sx + 24) + ' ' + f(sy + 20) + ' L250 290" stroke="#6a6f78" stroke-width="7" fill="none"/><path d="M200 118 L' + f(sx + 24) + ' ' + f(sy + 20) + '" stroke="#9aa0a8" stroke-width="2" fill="none"/>';
    // the wheel (edge-on, tilted) and the bag
    s += '<g transform="translate(' + HUB[0] + ' ' + HUB[1] + ') rotate(-24)"><ellipse rx="10" ry="46" fill="none" stroke="#111" stroke-width="10"/><ellipse rx="10" ry="46" fill="none" stroke="#3a3f46" stroke-width="5"/><rect x="-8" y="-16" width="16" height="32" rx="6" fill="#2b2f35" stroke="' + INK + '" stroke-width="1.6"/></g>';
    if (o.bag) { var b = clamp(o.bag), cx = lerp(HUB[0] - 8, HUB[0] - 64, b), rx = 70 * b, ry = 74 * Math.min(1, b * 1.15), dfl = clamp(o.deflate || 0); rx *= 1 - 0.45 * dfl; ry *= 1 - 0.25 * dfl;
      if (b > 0.02) s += '<g transform="translate(' + f(cx) + ' ' + f(HUB[1] - 4) + ')"><ellipse rx="' + f(rx) + '" ry="' + f(ry) + '" fill="url(#bagG)" stroke="#9a968c" stroke-width="2"/><path d="M' + f(-rx * 0.6) + ' ' + f(-ry * 0.4) + ' Q0 ' + f(-ry * 0.1) + ' ' + f(rx * 0.5) + ' ' + f(-ry * 0.5) + ' M' + f(-rx * 0.5) + ' ' + f(ry * 0.4) + ' Q0 ' + f(ry * 0.2) + ' ' + f(rx * 0.6) + ' ' + f(ry * 0.45) + '" stroke="#c9c4b8" stroke-width="1.6" fill="none"/><ellipse cx="' + f(-rx * 0.3) + '" cy="' + f(-ry * 0.35) + '" rx="' + f(rx * 0.25) + '" ry="' + f(ry * 0.18) + '" fill="#fff" opacity=".7"/></g>';
      if (o.vent) for (var v = 0; v < 6; v++) { var vu = (t * 1.6 + v / 6) % 1; s += '<circle cx="' + f(cx + rx * 0.7 + vu * 40) + '" cy="' + f(HUB[1] - 30 + (v % 3) * 24 - vu * 20) + '" r="' + f(4 + vu * 12) + '" fill="#e8e4da" opacity="' + f(0.6 * (1 - vu) * o.vent) + '" filter="url(#soft2)"/>'; } }
    s += head(hx, hy, 34, o.mood || "n", t, 1);
    if (o.powder) for (var p = 0; p < 26; p++) { var pu = (t * 0.25 + p / 26) % 1; s += '<circle cx="' + f(240 + hash(p) * 260 + Math.sin(t + p) * 14) + '" cy="' + f(60 + hash(p + 7) * 220 - pu * 30) + '" r="' + f(10 + hash(p + 3) * 26) + '" fill="#f4f1e8" opacity="' + f(0.28 * o.powder * Math.sin(Math.PI * pu)) + '" filter="url(#soft)"/>'; }
    return s;
  }
  // the airbag control unit (photo: Audi ACU): aluminium box, orange warning label, barcode, connector, mounting ears
  function acu(x, y, s, t, glow) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shadow(0, 70, 120, 12);
    if (glow) g += '<circle r="120" fill="#f2c230" opacity="' + f(0.25 * glow * (0.7 + 0.3 * Math.sin(t * 5))) + '" filter="url(#soft)"/>';
    g += '<path d="M-100 -50 L80 -60 L110 -30 L110 50 L-90 60 L-110 30 Z" fill="url(#aluG)" stroke="' + INK + '" stroke-width="2.4"/><path d="M-100 -50 L80 -60 L110 -30 L-80 -20 Z" fill="#dfe4ea" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<path d="M-60 -8 L90 -18 L92 30 L-58 40 Z" fill="#e8742e" stroke="#9a4a1c" stroke-width="1.2"/>'; for (var i = 0; i < 4; i++) g += '<path d="M-50 ' + (2 + i * 8) + ' L80 ' + (-8 + i * 8) + '" stroke="#fff" stroke-width="1.6" opacity=".8"/>';
    g += '<path d="M-78 -40 L60 -48" stroke="#111" stroke-width="7" stroke-dasharray="1.5 1.5"/><rect x="-130" y="-6" width="26" height="30" rx="4" fill="#3a3f46" stroke="' + INK + '" stroke-width="1.6"/><path d="M-130 4 h26 M-130 14 h26" stroke="#1c1c1c"/>';
    [[-112, 34], [104, -40]].forEach(function (e) { g += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="9" fill="url(#aluG)" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + e[0] + '" cy="' + e[1] + '" r="3.4" fill="#2a2a2a"/>'; });
    return g + '</g>';
  }
  // the accelerometer inside: a tiny proof mass on springs between fixed combs; dx shifts the mass
  function mems(x, y, s, dx, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-160" y="-90" width="320" height="180" rx="10" fill="#2b3240" stroke="#7cf2ff" stroke-width="2"/>';
    for (var k = -1; k <= 1; k += 2) { var p = "M" + (k * 150) + " 0"; for (var i = 1; i <= 8; i++) p += " L" + f(k * 150 - k * (150 - 60 + dx * k) * i / 8) + " " + (i % 2 ? -10 : 10); g += '<path d="' + p + '" stroke="#bfe6f7" stroke-width="3" fill="none"/>'; }
    g += '<rect x="' + f(-60 + dx) + '" y="-46" width="120" height="92" rx="6" fill="url(#aSteel)" stroke="#7cf2ff" stroke-width="2"/>';
    for (var c = 0; c < 5; c++) g += '<rect x="' + f(-50 + c * 24 + dx) + '" y="-80" width="8" height="34" fill="#9aa3ad"/><rect x="' + f(-38 + c * 24) + '" y="-88" width="8" height="30" fill="#f2c230"/><rect x="' + f(-50 + c * 24 + dx) + '" y="46" width="8" height="34" fill="#9aa3ad"/><rect x="' + f(-38 + c * 24) + '" y="58" width="8" height="30" fill="#f2c230"/>';
    return g + '</g>';
  }
  // the steering wheel face-on (photo: Kia wheel before/after): leather rim, three spokes with switches, the hub cover
  // with the H seam. open 0..1: the seam tears and the flaps fold out; bag 0..1: the cushion bursts out
  function wheelFront(x, y, s, t, open, bag) {
    var o = clamp(open || 0), b = clamp(bag || 0), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shadow(0, 150, 150, 12);
    g += '<circle r="132" fill="none" stroke="#111" stroke-width="30"/><circle r="132" fill="none" stroke="url(#leatherG)" stroke-width="24"/><path d="M-110 -70 A132 132 0 0 1 60 -118" stroke="#6a707a" stroke-width="3" fill="none" opacity=".6"/>';
    g += '<path d="M-118 10 L-50 22 L-50 50 L-112 40 Z M118 10 L50 22 L50 50 L112 40 Z M-30 70 L30 70 L24 124 L-24 124 Z" fill="#2b2f35" stroke="' + INK + '" stroke-width="2"/>';
    [[-90, 28], [-74, 30], [90, 28], [74, 30]].forEach(function (q) { g += '<rect x="' + (q[0] - 6) + '" y="' + (q[1] - 6) + '" width="12" height="12" rx="2" fill="#3a3f46" stroke="#555"/>'; });
    if (o < 0.05) g += '<path d="M-64 -40 Q0 -62 64 -40 L70 40 Q0 76 -70 40 Z" fill="url(#dashG)" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="0" cy="-6" rx="26" ry="16" fill="url(#aSteel)" stroke="' + INK + '"/><text x="0" y="48" text-anchor="middle" style="font:700 9px Noto Serif;fill:#8a909a">AIRBAG</text><path d="M-40 -34 L40 -34 M0 -34 V40" stroke="#3a3f48" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>';
    else { g += '<path d="M-64 -40 Q0 -62 64 -40 L70 40 Q0 76 -70 40 Z" fill="#111"/>';
      g += '<g transform="translate(0 -36) scale(1 ' + f(1 - 1.7 * o) + ')"><path d="M-62 -4 Q0 -24 62 -4 L60 34 L-60 34 Z" fill="url(#dashG)" stroke="' + INK + '" stroke-width="2"/></g>';
      g += '<g transform="translate(0 44) scale(1 ' + f(1 - 1.7 * o) + ')"><path d="M-66 -40 L66 -40 L70 -4 Q0 30 -70 -4 Z" fill="url(#dashG)" stroke="' + INK + '" stroke-width="2"/></g>';
      if (b > 0) g += '<ellipse cx="0" cy="0" rx="' + f(40 + 130 * b) + '" ry="' + f(30 + 120 * b) + '" fill="url(#bagG)" stroke="#9a968c" stroke-width="2.4"/><path d="M' + f(-60 * b) + ' ' + f(-80 * b) + ' Q0 ' + f(-40 * b) + ' ' + f(70 * b) + ' ' + f(-70 * b) + ' M' + f(-90 * b) + ' ' + f(40 * b) + ' Q0 ' + f(70 * b) + ' ' + f(90 * b) + ' ' + f(30 * b) + '" stroke="#c9c4b8" stroke-width="2" fill="none"/><ellipse cx="' + f(-40 * b) + '" cy="' + f(-50 * b) + '" rx="' + f(40 * b) + '" ry="' + f(24 * b) + '" fill="#fff" opacity=".7"/>'; }
    return g + '</g>';
  }
  // the disc pyrotechnic inflator (photos: Daicel-style driver inflator): domed top with the blue initiator cap, a flange
  // with four ears, a ring of diffuser holes; cut: the cut-away (initiator, enhancer, blue gas-generant pellets, coolant
  // mesh, diffuser nozzles). fire 0..1 burns the pellets outward; jets 0..1 gas out of the holes
  function inflator(x, y, s, t, o) {
    o = o || {}; var cut = !!o.cut, fire = clamp(o.fire || 0), jets = clamp(o.jets || 0), g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shadow(0, 92, 150, 14);
    g += '<path d="M-150 16 L-120 0 L120 0 L150 16 L130 32 L-130 32 Z" fill="url(#aluG)" stroke="' + INK + '" stroke-width="2"/>'; [-136, 136].forEach(function (ex) { g += '<circle cx="' + ex + '" cy="16" r="7" fill="#2a2a2a"/>'; });
    g += '<path d="M-110 24 L-110 84 Q0 104 110 84 L110 24 Z" fill="url(#aSteel)" stroke="' + INK + '" stroke-width="2"/>';
    for (var h = 0; h < 9; h++) { var hx = -96 + h * 24; g += '<ellipse cx="' + hx + '" cy="' + f(66 + Math.abs(hx) * 0.05) + '" rx="4" ry="3" fill="#111"/>';
      if (jets > 0) for (var j = 0; j < 3; j++) { var ju = (t * 3 + j / 3 + h * 0.1) % 1; g += '<path d="M' + f(hx) + ' 66 L' + f(hx + Math.sign(hx || 1) * (20 + ju * 120) * jets) + ' ' + f(66 + 20 * ju) + '" stroke="#bfe6f7" stroke-width="' + f(6 - ju * 4) + '" stroke-linecap="round" opacity="' + f((1 - ju) * jets) + '"/>'; } }
    g += '<path d="M-110 24 Q-110 -40 0 -46 Q110 -40 110 24 Z" fill="url(#aluG)" stroke="' + INK + '" stroke-width="2"/><ellipse cx="0" cy="-26" rx="70" ry="18" fill="#c9ced4" opacity=".5"/>';
    g += '<ellipse cx="0" cy="-30" rx="34" ry="12" fill="#3a5ac8" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="-8" cy="-33" rx="12" ry="4" fill="#9ab0f0" opacity=".7"/>';
    if (cut) { // the front quarter removed: layers seen in section
      g += '<path d="M0 -46 L0 84 L110 84 L110 24 Q110 -40 0 -46 Z" fill="#1c2025" stroke="' + INK + '" stroke-width="2"/>';
      g += '<path d="M92 -4 L104 -4 L104 80 L92 80 Z" fill="url(#meshG)" stroke="#555"/><path d="M40 -10 L90 -10 L90 80 L40 80 Z" fill="#1e2a52" stroke="#555"/>';
      for (var p = 0; p < 30; p++) { var px = 44 + hash(p) * 42 + Math.sin(t * 7 + p) * 1.6, py = -4 + hash(p + 5) * 80 + Math.cos(t * 6 + p * 2) * 1.6, burnt = fire > 0 && (px - 40) / 50 < fire * 1.2; g += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="4" fill="' + (burnt ? "#ffb040" : "#4a8ae8") + '" stroke="#1c2a6a" stroke-width=".8"/>'; }
      g += '<path d="M10 -40 L38 -40 L38 80 L10 80 Z" fill="url(#steelD)" stroke="#555"/><path d="M14 30 L34 30 L34 76 L14 76 Z" fill="url(#meshG)"/><path d="M6 -46 L22 -46 L22 20 L6 20 Z" fill="#3a5ac8" stroke="' + INK + '"/><path d="M10 20 V40 M18 20 V40" stroke="#f2c230" stroke-width="2.4"/>';
      if (fire > 0) g += '<circle cx="16" cy="10" r="' + f(10 + 60 * fire) + '" fill="#ff9a2a" opacity="' + f(0.55 * (1 - fire * 0.5)) + '" filter="url(#soft)"/><circle cx="16" cy="6" r="8" fill="#fff6c8" filter="url(#glow)"/>';
      if (o.labels) g += lbl(166, -30, "الشرارة", 14, "#f2c230", "end") + lbl(166, 10, "الحبوب", 14, "#bfe0ff", "end") + lbl(166, 50, "شبكة تبرّد الغاز", 14, "#ddd", "end") + lbl(166, 90, "الخروم", 14, "#fff", "end"); }
    return g + '</g>';
  }
  function n2(x, y, s, a, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + (s || 1) + ')"><circle cx="-7" r="9" fill="' + (col || "url(#n2G)") + '" stroke="' + INK + '" stroke-width="1.2"/><circle cx="7" r="9" fill="' + (col || "url(#n2G)") + '" stroke="' + INK + '" stroke-width="1.2"/></g>'; }
  function wire(P, k, t) { var d = "M" + P.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"), s = '<path d="' + d + '" stroke="#1c1c1c" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="#f2c230" stroke-width="3.4" fill="none" stroke-linejoin="round"/>';
    if (k > 0 && k < 1) { var L = 0, seg = []; for (var i = 1; i < P.length; i++) { var l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); L += l; } var dd = k * L, j = 0; while (j < seg.length - 1 && dd > seg[j]) { dd -= seg[j]; j++; } var q = dd / seg[j], x = lerp(P[j][0], P[j + 1][0], q), y = lerp(P[j][1], P[j + 1][1], q);
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="16" fill="#fff6c8" opacity=".6" filter="url(#soft2)"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" fill="#fff"/>'; for (var z = 0; z < 5; z++) s += '<path d="M' + f(x) + ' ' + f(y) + ' l' + f(Math.cos(t * 20 + z) * 14) + ' ' + f(Math.sin(t * 23 + z * 2) * 14) + '" stroke="#ffe08a" stroke-width="2"/>'; }
    return s; }
  function graph(x, y, w, h) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-10" y="-10" width="' + (w + 30) + '" height="' + (h + 40) + '" rx="10" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><path d="M10 0 V' + h + ' H' + w + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + lbl(-2, -16, "السرعة", 13, "#fff", "start") + lbl(w, h + 24, "الوقت", 13, "#fff", "end") + '</g>'; }

  // ── shots (one per line, 21 lines ≈ 1:33) ─────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — crash: the bag fills in 1/30 of a second, faster than a blink
  shot(0, function (u, d) { var k = ease(u / d); return [lerp(380, 330, k), 175, lerp(1.25, 1.05, k)]; }, function (u, d, t) {
    var hit = 0.9, b = ease((u - hit) / 0.35), fw = ease((u - hit - 0.1) / 0.5) * 0.7, s = cabin(t, { fw: fw, bag: b, mood: u > hit ? "shock" : "n", outside: u < hit ? 1.4 : 0 });
    if (u > hit && u < hit + 0.25) s += '<rect x="-400" y="-300" width="1440" height="960" fill="#fff" opacity="' + f(0.5 * (1 - (u - hit) / 0.25)) + '"/>';
    s += stopwatch(110, 80, 40, clamp((u - hit) / 0.35) / 30, u > hit ? "1/30 ث" : "") + eye(110, 250, 1.1, 0.5 + 0.5 * Math.cos(t * 2.2));
    return s + vig() + tag("أسرع من رمشة عين!", 470, 330, u, 2.0, -2, 18);
  });
  // 1 — a folded cloth bag inside the wheel hub (x-ray)
  shot(1, function (u, d) { var k = ease(u / d); return [320, 180, lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var s = dark("#1c212a") + '<circle cx="320" cy="180" r="220" fill="#f2c230" opacity=".06" filter="url(#soft)"/>' + wheelFront(320, 180, 1.0, t, 0, 0);
    var x = clamp((u - 0.8) / 0.6); if (x > 0) { s += '<g opacity="' + f(x) + '"><path d="M256 140 Q320 118 384 140 L390 220 Q320 256 250 220 Z" fill="#0f2a3a" stroke="#7cf2ff" stroke-width="2"/>'; for (var i = 0; i < 6; i++) s += '<path d="M268 ' + (150 + i * 12) + ' h104" stroke="#e8e4da" stroke-width="5" opacity=".9"/>'; s += '</g>'; }
    return s + vig() + qmark(470, 90, t, 46) + tag("كيس قماش متطبّق", 320, 330, u, 1.4, -2, 18);
  });
  // 2 — the car drives toward a wall: who tells it that it crashed?
  shot(2, function (u, d) { var k = ease(u / d); return [lerp(260, 380, k), 220, 1.0]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 20, 30, 4, 0.8) + city(t * 0.3, 220, 80, "#c9c1b2", "#fff6c8", 3, false) + road(t, 250, 360);
    s += speedLines(t, -100, 420, 150, 270, 10, 0.5) + sedan(lerp(150, 330, ease(u / d)), 276, t, { s: 0.85 }) + barrier(560, 284, t, 0);
    return s + qmark(330 + u * 30, 150, t, 44) + tag("مين بيقوله إنها خبطت؟", 300, 105, u, 0.6, -2, 18);
  });
  // 3 — «إيه الحكاية؟»: the bag bursts out of the wheel
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var o = ease((u - 0.2) / 0.3), b = ease((u - 0.3) / 0.5) * (0.66 + 0.04 * Math.sin(t * 6)), s = dark("#151a22") + '<circle cx="320" cy="180" r="240" fill="#f2c230" opacity=".1" filter="url(#soft)"/>' + wheelFront(320, 190, 0.9, t, o, b);
    return s + vig() + tag("إيه الحكاية؟", 320, 50, u, 0.6, -3, 26);
  });
  // 4 — under the floor between the seats sits the airbag control unit with an accelerometer
  shot(4, function (u, d) { var k = 0.4 * clamp(u / d) + 0.6 * ease(u / d); return [lerp(320, 330, k), lerp(180, 190, k), lerp(0.95, 1.45, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2b2f36"/>';
    s += '<path d="M60 -40 L220 -40 L240 400 L40 400 Z" fill="#1c1f24" stroke="' + INK + '"/><path d="M420 -40 L580 -40 L600 400 L400 400 Z" fill="#1c1f24" stroke="' + INK + '"/><path d="M240 -40 L420 -40 L400 400 L240 400 Z" fill="#26292f"/>';
    for (var i = 0; i < 30; i++) s += '<circle cx="' + f(250 + hash(i) * 150) + '" cy="' + f(hash(i + 4) * 380) + '" r="1.4" fill="#4a4f58"/>';
    s += acu(325, 190, 0.85, t, 0.4 + 0.6 * clamp((u - 0.6) / 0.6)) + '<path d="M215 196 Q160 230 120 380" stroke="#1c1c1c" stroke-width="6" fill="none"/><path d="M215 196 Q160 230 120 380" stroke="#f2c230" stroke-width="2.4" fill="none"/>';
    return s + vig() + tag("حساس التسارع", 330, 105, u, 1.0, -2, 20);
  });
  // 5 — it measures, every instant, how fast the car is slowing down (a tiny mass on springs inside the chip)
  shot(5, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var dx = 18 * Math.sin(t * 2.4) + 6 * Math.sin(t * 7), s = dark("#0f1620") + mems(320, 170, 1.0, dx, t);
    s += '<g transform="translate(320 310)"><rect x="-120" y="-10" width="240" height="20" rx="10" fill="#1c2430" stroke="#555"/><rect x="0" y="-8" width="' + f(Math.abs(dx) * 5) + '" height="16" rx="8" fill="#f2c230" transform="scale(' + (dx < 0 ? -1 : 1) + ' 1)"/></g>';
    return s + vig() + tag("بيقيس التهدئة", 320, 40, u, 0.6, -2, 19) + lbl(320, 350, "كتلة صغيرة على سوست", 14, "#bfe0ff");
  });
  // 6 — braking slows it gently, a crash stops it in a split second
  shot(6, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var s = dark("#1a2130") + graph(110, 80, 420, 200), k1 = clamp((u - 0.3) / 1.4), k2 = clamp((u - 2.0) / 0.4), P1 = "M120 90", P2 = "M120 90";
    for (var i = 0; i <= 40; i++) { var q = i / 40; if (q <= k1) P1 += " L" + f(120 + q * 400) + " " + f(90 + 180 * q); if (q * 4 <= k2) P2 += " L" + f(120 + q * 100) + " " + f(90 + 180 * Math.min(1, q * 4)); }
    s += '<path d="' + P1 + '" stroke="#3a9a5a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="' + P2 + '" stroke="#c23a26" stroke-width="7" fill="none" stroke-linecap="round"/>';
    return s + tag("فرامل: بالراحة", 440, 150, u, 0.9, 3, 16, "#a6e3b0") + tag("خبطة: في لحظة!", 230, 250, u, 2.2, -3, 16, "#f2a0a0");
  });
  // 7 — like hitting a wall at about 20 km/h: the computer decides in about 20 ms: «افتح!»
  shot(7, function (u, d) { var k = ease(u / d); return [lerp(300, 400, k), 210, lerp(1.0, 1.2, k)]; }, function (u, d, t) {
    var hitAt = 1.0, x = lerp(150, 452, clamp(u / hitAt)), c = ease((u - hitAt) / 0.3), s = sky("day") + clouds(t, 20, 30, 4, 0.8) + road(u < hitAt ? t : hitAt, 250, 360);
    s += sedan(x - 10 * c, 276, t, { s: 0.85, crush: c, spin: u < hitAt ? t * 8 : hitAt * 8 }) + barrier(590, 284, t, u > hitAt && u < hitAt + 0.3 ? 1 : 0);
    if (u > hitAt) { var ms = Math.min(20, Math.round((u - hitAt) / 0.8 * 20)); s += '<g transform="translate(250 100)"><rect x="-80" y="-34" width="160" height="60" rx="10" fill="#0f2a3a" stroke="#7cf2ff" stroke-width="2"/>' + lbl(0, 6, ms + " ملي ثانية", 22, "#7cf2ff") + '</g>';
      if (u > hitAt + 0.9) s += '<g transform="translate(470 70) scale(' + f(pop((u - hitAt - 0.9) / 0.8)) + ')"><path d="M-70 -30 H70 V24 H10 L-6 44 L-10 24 H-70 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + '<text x="0" y="10" text-anchor="middle" style="font:900 28px Noto Sans Arabic;fill:#c23a26">افتح!</text></g>'; }
    return s + tag("زي حيطة على 20 كيلو", 220, 330, u, 0.4, -2, 17);
  });
  // 8 — it sends an electric spark down the wire to a small can behind the bag: the inflator
  shot(8, function (u, d) { var k = ease(u / d); return [lerp(300, 420, k), 190, lerp(0.95, 1.15, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.3) / 1.4), s = dark("#1a1f28") + acu(110, 270, 0.45, t, 0.5) + wheelFront(470, 170, 0.75, t, 0, 0);
    s += '<g opacity="' + f(clamp((u - 0.2) / 0.5)) + '"><circle cx="470" cy="170" r="60" fill="#0f2a3a" stroke="#7cf2ff" stroke-width="2"/></g>' + inflator(470, 165, 0.36, t, { fire: k >= 1 ? clamp((u - 1.7) / 0.4) * 0.4 : 0 }) + wire([[160, 270], [260, 270], [320, 210], [430, 190]], k, t);
    if (k >= 1) s += '<circle cx="470" cy="160" r="' + f(20 + 30 * Math.abs(Math.sin(t * 9))) + '" fill="#ffe08a" opacity=".45" filter="url(#soft2)"/>';
    return s + vig() + tag("شرارة كهربا", 260, 150, u, 0.8, -3, 17, "#f2c230") + tag("المنفاخ", 470, 300, u, 1.6, 3, 19);
  });
  // 9 — inside: chemical pellets; the spark sets them all off at once (the photo's cut-away)
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(300, 370, k), lerp(180, 200, k), lerp(0.98, 1.2, k)]; }, function (u, d, t) {
    var s = dark("#141a24") + '<circle cx="320" cy="200" r="200" fill="#4a8ae8" opacity=".08" filter="url(#soft)"/>' + [0,1,2,3,4,5,6,7,8,9,10,11].map(function (i) { var pu = (t * 0.3 + i / 12) % 1; return '<circle cx="' + f(40 + hash(i) * 560) + '" cy="' + f(340 - pu * 340) + '" r="2" fill="#7cf2ff" opacity="' + f(0.6 * Math.sin(Math.PI * pu)) + '"/>'; }).join("") + inflator(300, 190, 1.0, t, { cut: true, fire: ease((u - 1.6) / 1.2), labels: u > 0.6 });
    s += '<circle cx="316" cy="170" r="' + f(14 + 8 * Math.abs(Math.sin(t * 4))) + '" fill="none" stroke="#f2c230" stroke-width="2.4" opacity="' + f(0.4 + 0.4 * Math.sin(t * 4)) + '"/>';
    return s + vig() + tag("حبوب كيميائية", 220, 75, u, 0.5, -3, 18, "#bfe0ff") + tag("تولّع مرة واحدة!", 470, 330, u, 2.0, 3, 17, "#f2c230");
  });
  // 10 — a small explosion that puts out a lot of nitrogen in an instant
  shot(10, function (u, d) { return [320, 180, lerp(1.15, 1.0, ease(u / d))]; }, function (u, d, t) {
    var s = dark("#141a24") + inflator(320, 190, 0.8, t, { jets: clamp((u - 0.2) / 0.4) }), n = Math.floor(clamp(u / 2.5) * 40);
    for (var i = 0; i < n; i++) { var a = hash(i) * Math.PI * 2, r = 120 + ((t * 80 + hash(i + 3) * 300) % 260); s += n2(320 + Math.cos(a) * r * 1.4, 220 + Math.sin(a) * r * 0.6 - 60, 0.8, t * 90 + i * 40); }
    return s + vig() + tag("انفجار صغير", 320, 40, u, 0.3, -3, 20, "#f2c230") + tag("غاز نيتروجين N₂", 320, 330, u, 1.4, 2, 18, "#bfe0ff");
  });
  // 11 — the same gas that makes up more than three quarters of the air
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(290, 350, k), 180, lerp(0.98, 1.1, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 20, 30, 5, 0.8) + grass(t, 280, "grass-day", "#5a7a3a"), k = ease((u - 0.3) / 1.2), a = 0.78 * Math.PI * 2 * k;
    s += '<g transform="translate(420 170)">' + shadow(0, 104, 90, 8) + '<circle r="90" fill="#e8e4da" stroke="' + INK + '" stroke-width="3"/>';
    if (k > 0) s += '<path d="M0 0 L0 -90 A90 90 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(Math.sin(a) * 90) + ' ' + f(-Math.cos(a) * 90) + ' Z" fill="url(#n2G)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M0 0 L' + f(Math.sin(0.78 * Math.PI * 2) * 90) + ' ' + f(-Math.cos(0.78 * Math.PI * 2) * 90) + ' A90 90 0 0 1 ' + f(Math.sin(0.99 * Math.PI * 2) * 90) + ' ' + f(-Math.cos(0.99 * Math.PI * 2) * 90) + ' Z" fill="#e2523a" opacity="' + f(clamp((u - 1.6) / 0.4)) + '"/>' + (k > 0.95 ? lbl(10, 18, "78%", 30, "#fff") : "") + '</g>';
    for (var i = 0; i < 10; i++) s += n2(60 + ((t * 20 + i * 60) % 320), 60 + hash(i) * 200, 0.6, t * 50 + i * 30);
    return s + engineer(150, 170, t, "happy", { s: 0.55 }) + tag("نفس الهوا اللي بنتنفسه", 400, 305, u, 1.2, -2, 17);
  });
  // 12 — the old pellets were toxic sodium azide; today safer chemicals are used
  shot(12, function (u, d) { return [320, 180, 1.0]; }, function (u, d, t) {
    var s = dark("#1a1f28") + '<path d="M320 40 V330" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" opacity=".5"/>';
    [[170, "#c9a050"], [470, "#4a8ae8"]].forEach(function (q, k) { s += '<g transform="translate(' + q[0] + ' 190)">' + shadow(0, 70, 70, 8) + '<path d="M-50 -60 H50 V60 Q0 74 -50 60 Z" fill="#dfeef7" fill-opacity=".35" stroke="#cfe1ec" stroke-width="3"/>'; for (var p = 0; p < 26; p++) s += '<circle cx="' + f(-40 + hash(p + k * 40) * 80) + '" cy="' + f(-10 + hash(p + 3 + k * 40) * 64) + '" r="6" fill="' + q[1] + '" stroke="#222"/>'; s += '<rect x="-56" y="-72" width="112" height="16" rx="4" fill="#8a8f96" stroke="' + INK + '"/></g>'; });
    s += lbl(170, 290, "أزيد الصوديوم", 17, "#f2a0a0") + lbl(470, 290, "مواد أأمن", 17, "#a6e3b0") + '<text x="170" y="100" text-anchor="middle" style="font:900 34px Noto Sans Arabic;fill:#fff">☠</text>';
    return s + vig() + badge(240, 110, "✕", "#c23a26", pop((u - 1.2) / 0.8)) + badge(540, 110, "✓", "#3a9a5a", pop((u - 2.6) / 0.8)) + tag("زمان", 170, 40, u, 0.4, -3, 18) + tag("دلوقتي", 470, 40, u, 2.2, 3, 18);
  });
  // 13 — the gas pushes the bag out through the wheel cover at up to 300 km/h
  shot(13, function (u, d) { return [320, 180, lerp(1.25, 0.95, ease(u / d))]; }, function (u, d, t) {
    var o = ease((u - 0.5) / 0.25), b = ease((u - 0.6) / 0.5) * (0.66 + 0.04 * Math.sin(t * 5)), s = dark("#151a22") + '<circle cx="320" cy="190" r="230" fill="#f2c230" opacity="' + f(0.06 + 0.04 * Math.sin(t * 3)) + '" filter="url(#soft)"/>' + wheelFront(320, 190, 0.9, t, o, b);
    if (u > 0.6) for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2 + t * 0.4, rr = 150 + ((t * 120 + i * 13) % 60); s += '<path d="M' + f(320 + Math.cos(a) * rr) + ' ' + f(190 + Math.sin(a) * rr * 0.95) + ' l' + f(Math.cos(a) * 34) + ' ' + f(Math.sin(a) * 34) + '" stroke="#fff" stroke-width="3" opacity=".55"/>'; }
    return s + vig() + tag("الغطا بيتفتح", 140, 50, u, 0.5, -3, 17) + tag("300 كيلو في الساعة!", 470, 300, u, 1.6, 3, 18, "#f2c230");
  });
  // 14 — when your head hits the bag, the gas escapes through vent holes in its back
  shot(14, function (u, d) { return [lerp(320, 360, u / d), 170, lerp(1.2, 1.4, u / d)]; }, function (u, d, t) {
    var k = ease(u / (d * 0.6)), s = cabin(t, { fw: 0.35 + 0.35 * k, bag: 1, deflate: 0.15 * k, vent: k, mood: "shock", outside: 0 });
    return s + vig() + tag("خروم في ضهره", 470, 70, u, 1.0, 3, 18);
  });
  // 15 — so you sink in softly, and the bag is empty in under a second
  shot(15, function (u, d) { return [330, 175, lerp(1.2, 1.05, u / d)]; }, function (u, d, t) {
    var k = ease(u / (d * 0.8)), s = cabin(t, { fw: 0.7 - 0.2 * k, bag: 1, deflate: 0.15 + 0.85 * k, vent: 1 - k, mood: k > 0.6 ? "happy" : "worry", outside: 0 });
    return s + vig() + stopwatch(110, 80, 36, 0.9 * k, "أقل من ثانية") + tag("بالراحة", 470, 300, u, 0.8, -2, 19);
  });
  // 16 — the white smoke is mostly powder like cornstarch that stops the folded bag sticking
  shot(16, function (u, d) { return [lerp(300, 340, u / d), 175, 1.05]; }, function (u, d, t) {
    var s = cabin(t, { fw: 0.4, bag: 0.35, deflate: 1, powder: clamp(u / 0.8), mood: "curious", outside: 0 });
    s += '<g transform="translate(110 260)">' + shadow(0, 44, 40, 6) + '<path d="M-30 -40 H30 L36 40 H-36 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><rect x="-30" y="-50" width="60" height="12" rx="3" fill="#c9a050" stroke="' + INK + '"/>' + lbl(0, 6, "نشا", 16, "#c23a26") + '</g>';
    return s + vig() + tag("بودرة مش دخان", 450, 305, u, 1.0, 3, 18);
  });
  // 17 — sit at least 25 cm from the wheel, and children in the back
  shot(17, function (u, d) { return [lerp(300, 330, u / d), 180, 1.0]; }, function (u, d, t) {
    var s = cabin(t, { fw: 0, mood: "happy", outside: 0.6 }), k = ease((u - 0.4) / 0.8);
    s += '<path d="M302 132 H' + f(lerp(302, 400, k)) + '" stroke="#f2c230" stroke-width="4"/><path d="M302 122 v20 M' + f(lerp(302, 400, k)) + ' 122 v20" stroke="#f2c230" stroke-width="4"/>' + (k > 0.9 ? lbl(352, 70, "25 سم على الأقل", 15, "#f2c230") : "");
    s += '<g transform="translate(70 200)"><path d="M-40 100 L-30 -10 L30 -10 L40 100 Z" fill="url(#seatG)" stroke="' + INK + '" stroke-width="2"/>' + head(0, -40 + Math.sin(t * 3) * 3, 22, "happy", t) + '<path d="M-20 -14 Q0 20 20 -14" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/></g>';
    return s + vig() + badge(120, 120, "✓", "#3a9a5a", pop((u - 2.0) / 0.8) * 0.7) + tag("الأطفال ورا", 90, 300, u, 1.8, -3, 17);
  });
  // 18 — Takata: inflators that degraded with damp and burst too hard; about 100 million recalled
  shot(18, function (u, d) { var k = ease(u / d); return [lerp(300, 360, k), 185, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = dark("#1f1414") + '<circle cx="260" cy="170" r="180" fill="#c23a26" opacity=".12" filter="url(#soft)"/>', bu = clamp((u - 1.4) / 0.5);
    for (var w = 0; w < 14; w++) { var wu = (t * 0.6 + w / 14) % 1; s += '<path d="M' + f(160 + hash(w) * 200) + ' ' + f(30 + wu * 120) + ' q4 8 0 12 q-4 -4 0 -12" fill="#8fd0ee" opacity="' + f(0.7 * (1 - wu)) + '"/>'; }
    s += inflator(260, 200, 0.75, t, {});
    if (bu > 0) { s += '<circle cx="260" cy="200" r="' + f(40 + 90 * bu) + '" fill="#ff9a2a" opacity="' + f(0.5 * (1 - bu * 0.6)) + '" filter="url(#soft)"/>'; for (var sh = 0; sh < 10; sh++) { var a = sh / 10 * Math.PI * 2 + 0.3, r = 60 + bu * 150; s += '<path d="M' + f(260 + Math.cos(a) * r) + ' ' + f(200 + Math.sin(a) * r * 0.7) + ' l8 -4 l-2 10 Z" fill="#8a8f96" stroke="' + INK + '"/>'; } }
    var cnt = Math.round(100 * ease((u - 2.2) / 1.6)); for (var bx = 0; bx < Math.min(12, Math.ceil(cnt / 8)); bx++) s += '<rect x="' + (470 + (bx % 4) * 34) + '" y="' + (250 - Math.floor(bx / 4) * 30) + '" width="30" height="26" fill="#c9a050" stroke="' + INK + '"/>';
    if (u > 2.2) s += lbl(540, 120, cnt + " مليون", 30, "#f2c230");
    return s + vig() + tag("تاكاتا", 140, 50, u, 0.4, -3, 22) + tag("الرطوبة بوّظتها", 260, 330, u, 1.0, 2, 17, "#bfe0ff") + tag("أكبر استدعاء", 540, 60, u, 2.6, 3, 17, "#f2a0a0");
  });
  // 19 — all of it in about 50 ms, before your head reaches the wheel: a timeline
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), 185, lerp(1.06, 0.98, k)]; }, function (u, d, t) {
    var s = dark("#141a24") + [0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(function (i) { var pu = (t * 0.35 + i / 14) % 1; return '<circle cx="' + f(20 + hash(i + 50) * 600) + '" cy="' + f(360 - pu * 380) + '" r="2.4" fill="#f2c230" opacity="' + f(0.5 * Math.sin(Math.PI * pu)) + '"/>'; }).join(""), k = clamp(u / (d * 0.75)), X = function (ms) { return 80 + ms * 4.8; };
    s += '<path d="M80 200 H' + f(X(100)) + '" stroke="#555" stroke-width="10" stroke-linecap="round"/><path d="M80 200 H' + f(X(100 * k)) + '" stroke="#f2c230" stroke-width="10" stroke-linecap="round"/>';
    [[0, "خبطة"], [20, "الحساس"], [25, "الشرارة"], [50, "الكيس مليان"], [90, "راسك"]].forEach(function (m, i) { var on = 100 * k >= m[0]; s += '<circle cx="' + f(X(m[0])) + '" cy="200" r="' + (on ? 11 : 7) + '" fill="' + (on ? (i === 4 ? "#7cf29a" : "#f2c230") : "#555") + '" stroke="' + INK + '" stroke-width="2"/>' + (on ? lbl(X(m[0]), i % 2 ? 250 : 168, m[1], 15, i === 4 ? "#7cf29a" : "#fff") + lbl(X(m[0]), i % 2 ? 272 : 146, m[0] + " مللي", 12, "#bfe0ff") : ""); });
    s += '<g transform="translate(' + f(X(100 * k)) + ' ' + f(110 + (k >= 1 ? Math.abs(Math.sin(t * 5)) * -16 : 0)) + ')">' + head(0, 0, 18, k > 0.85 ? "happy" : "shock", t) + '</g>';
    if (k >= 1) s += '<path d="M80 200 H' + f(X(100)) + '" stroke="#fff6c8" stroke-width="' + f(14 + 6 * Math.sin(t * 6)) + '" stroke-linecap="round" opacity="' + f(0.25 + 0.2 * Math.sin(t * 6)) + '" filter="url(#soft2)"/>';
    return s + vig() + tag("حوالي 50 جزء من الألف", 320, 40, u, 0.6, -2, 18);
  });
  // 20 — outro
  shot(20, function (u, d) { return [lerp(300, 340, clamp(u / d)), 200, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#skyS)"/>' + sun(500, 170, 30, "#ffd27a") + city(t * 0.3, 230, 70, "#5a4a5a", "#ffd27a", 5, true) + road(t, 250, 260) + sedan(280, 276, t, { s: 0.85 });
    return s + tag("قولولنا!", 470, 70, u, 0.4, 3, 26);
  });

  window.__parts = { sedan: sedan, barrier: barrier, road: road, cabin: cabin, acu: acu, wheelFront: wheelFront, inflator: inflator, n2: n2, stopwatch: stopwatch, tag: tag, head: head, shadow: shadow, lbl: lbl, vig: vig, dark: dark };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 20 * Math.sin(t * 1.3), cy = c[1] + 15 * Math.cos(t * 1.3), z = c[2] * (1 + 0.035 * Math.sin(t * 1.2));
    if (i === 0) z *= 1 + 0.18 * (1 - ease(u / 1.2));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
