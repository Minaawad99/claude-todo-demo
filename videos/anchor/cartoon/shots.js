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


  // ── the anchor episode: objects drawn close to the real thing and shaded to read as 3D (stockless Hall anchor, stud-link
  //    chain, a VLCC tanker with black topsides and red antifouling, a muddy seabed in cut-away). See ../refs/SOURCES.md ──
  var MUDC = "#5a4028";
  function shadow(x, y, rx, ry, op) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="url(#shadowG)" opacity="' + (op == null ? 1 : op) + '"/>'; }
  // the seabed in cut-away: a lit sandy-mud top, darker deeper layers, shaded pebbles, swaying weed, light caustics on top
  function mudBed(t, y) {
    var d = "M-400 " + y; for (var x = -400; x <= 1040; x += 40) d += " L" + x + " " + f(y + Math.sin(x * 0.02) * 3);
    var s = '<path d="' + d + ' V700 H-400 Z" fill="url(#bedG)"/><path d="' + d + '" stroke="#c9b083" stroke-width="3" fill="none" opacity=".8"/>';
    for (var l = 1; l < 5; l++) s += '<path d="M-400 ' + (y + l * 24) + ' Q100 ' + (y + l * 24 - 6) + ' 400 ' + (y + l * 24) + ' T1040 ' + (y + l * 24) + '" stroke="#2a1c10" stroke-width="1.4" fill="none" opacity=".35"/>';
    for (var i = 0; i < 46; i++) { var px = -380 + hash(i) * 1400, py = y + 6 + hash(i + 3) * 100, r = 2 + hash(i + 1) * 5; s += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(r) + '" ry="' + f(r * 0.6) + '" fill="#4a3826"/><ellipse cx="' + f(px - r * 0.3) + '" cy="' + f(py - r * 0.25) + '" rx="' + f(r * 0.45) + '" ry="' + f(r * 0.22) + '" fill="#b9a07a" opacity=".5"/>'; }
    for (var c = 0; c < 10; c++) { var cx = ((c * 130 + t * 18) % 1440) - 400; s += '<path d="M' + f(cx) + ' ' + f(y + 3) + ' q20 -3 40 0 t40 0" stroke="#fff4c8" stroke-width="2" fill="none" opacity="' + f(0.18 + 0.12 * Math.sin(t * 2 + c)) + '"/>'; }
    for (var k = 0; k < 12; k++) { var wx = -300 + k * 110 + hash(k + 7) * 40, h = 16 + hash(k + 8) * 22, sw = Math.sin(t * 1.6 + k) * 7; s += '<path d="M' + f(wx) + ' ' + y + ' Q' + f(wx + sw) + ' ' + f(y - h / 2) + ' ' + f(wx + sw * 1.4) + ' ' + f(y - h) + '" stroke="#2f6a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M' + f(wx + 1) + ' ' + y + ' Q' + f(wx + sw + 1) + ' ' + f(y - h / 2) + ' ' + f(wx + sw * 1.4 + 1) + ' ' + f(y - h) + '" stroke="#7fbf6a" stroke-width="1.4" fill="none" opacity=".7"/>'; }
    return s;
  }
  // the under-water cut-away: sky + surface at ys, deep-blue water with light shafts, seabed at yb
  function cutaway(t, ys, yb, o) {
    o = o || {}; var s = (o.sky === "sunset" ? '<rect x="-400" y="-300" width="1440" height="960" fill="url(#skyS)"/>' : o.sky === "storm" ? '<rect x="-400" y="-300" width="1440" height="960" fill="#3a4658"/>' : sky("day")) + clouds(t, 14, Math.min(ys - 150, 30), 4, o.sky === "storm" ? 0.5 : 0.8, o.sky === "storm" ? 1.6 : 1);
    s += '<rect x="-400" y="' + ys + '" width="1440" height="' + (700 - ys) + '" fill="url(#uwSea)"/>';
    for (var r = 0; r < 7; r++) { var rx = -150 + r * 140 + Math.sin(t * 0.4 + r) * 30; s += '<path d="M' + f(rx) + ' ' + ys + ' L' + f(rx + 50) + ' ' + ys + ' L' + f(rx + 170) + ' ' + yb + ' L' + f(rx + 60) + ' ' + yb + ' Z" fill="#fff" opacity="' + f(o.sky === "storm" ? 0.02 : 0.05 + 0.03 * Math.sin(t * 1.3 + r)) + '"/>'; }
    for (var i = 0; i < 40; i++) { var px = -300 + hash(i) * 1240 + Math.sin(t * 0.6 + i) * 10, py = ys + ((hash(i + 5) * (yb - ys) - t * (6 + hash(i) * 8)) % (yb - ys) + (yb - ys)) % (yb - ys); s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(0.8 + hash(i + 2) * 1.4) + '" fill="#fff" opacity=".3"/>'; }
    if (o.sky !== "storm") s += fish(t, ys + 50, 22, 3, "#f2a93b");
    return s + mudBed(t, yb);
  }
  function surface(t, ys, storm) { return storm ? bigWaves(t, ys - 4, 9) : '<path d="M-400 ' + ys + wavePath(-400, 1040, ys, t, 3) + ' V' + (ys + 10) + ' H-400 Z" fill="#9fd6ee" opacity=".55"/><path d="M-400 ' + ys + wavePath(-400, 1040, ys, t, 3).replace(" L", " M") + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>'; }
  // a stockless (Hall) anchor, shaded steel. Local: crown at 0,0, shank to -x with the shackle at -64,0, flukes swing down by fa degrees
  function anchor(x, y, ang, o) {
    o = o || {}; var fa = (o.fa == null ? 38 : o.fa) * Math.PI / 180, c = Math.cos(fa), sn = Math.sin(fa), s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (o.s || 1) + ')">';
    if (o.glow) s += '<circle cx="-24" cy="6" r="56" fill="#f2c230" opacity="' + f(0.25 * o.glow) + '" filter="url(#soft)"/>';
    function fluke(off, fill, hi) { var tx = -44 * c, ty = 44 * sn + off, bx = -14 * c + 10 * sn, by = 14 * sn - 10 * c + off, ex = -16 * c - 3 * sn, ey = 16 * sn + 7 + off;
      return '<path d="M5 ' + f(off - 7) + ' L' + f(bx) + ' ' + f(by) + ' L' + f(tx) + ' ' + f(ty) + ' L' + f(ex) + ' ' + f(ey) + ' L5 ' + f(off + 7) + ' Z" fill="' + fill + '" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>' + (hi ? '<path d="M3 ' + f(off - 5) + ' L' + f(bx) + ' ' + f(by) + ' L' + f(tx) + ' ' + f(ty) + '" stroke="#dfe5ea" stroke-width="1.3" fill="none" opacity=".75"/><path d="M' + f(bx * 0.6) + ' ' + f(by * 0.6 + off * 0.4 + 3) + ' L' + f(tx * 0.8) + ' ' + f(ty * 0.85) + '" stroke="#1c2025" stroke-width="1.2" opacity=".6"/>' : ""); }
    s += fluke(-4, "url(#aFlukeB)", false);
    s += '<path d="M-58 -4.6 L-6 -6.5 L-6 6.5 L-58 4.6 Z" fill="url(#aSteel)" stroke="#111" stroke-width="1.6"/><path d="M-56 -2.6 L-8 -3.8" stroke="#eef2f5" stroke-width="1.1" opacity=".7"/>';
    s += '<g transform="translate(-65 0)"><path d="M-9 -7 A10 10 0 1 0 -9 7" fill="none" stroke="#111" stroke-width="6.5"/><path d="M-9 -7 A10 10 0 1 0 -9 7" fill="none" stroke="url(#aSteel)" stroke-width="4"/><rect x="-3" y="-9" width="6" height="18" rx="2" fill="url(#aSteel)" stroke="#111" stroke-width="1.2"/></g>';
    s += '<rect x="-7" y="-12" width="17" height="24" rx="5" fill="url(#aSteel)" stroke="#111" stroke-width="1.6"/><rect x="-4" y="-9" width="5" height="18" rx="2" fill="#e6ebef" opacity=".45"/>';
    s += fluke(4, "url(#aFluke)", true);
    for (var r = 0; r < 4; r++) s += '<circle cx="' + f(-50 + r * 13) + '" cy="' + f(r % 2 ? 2 : -1) + '" r="1.4" fill="#8a4a2a" opacity=".55"/>';
    if (o.face) s += '<g transform="translate(-32 0) rotate(' + f(-ang) + ')">' + eyes(o.face, o.t || 0, 7) + '</g>';
    return s + '</g>';
  }
  // the same anchor seen from the front (photos: anchors hanging from the hawse, on quays): two broad flukes with chisel tips
  // rising either side of the shank, a heavy chamfered crown at the bottom, tripping palms, a D-shackle on top.
  // Local: shackle top at 0,0, crown at y≈100. o: {s, rust, swing}
  function anchorFront(x, y, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.swing || 0) + ') scale(' + (o.s || 1) + ')">';
    var fl = o.rust ? "url(#aRust)" : "url(#aFluke)", sh = o.rust ? "url(#aRustS)" : "url(#aSteel)";
    function fluke(sx) { var p = [[18, 98], [20, 50], [30, 30], [44, 40], [48, 98]].map(function (q) { return f(q[0] * sx) + " " + q[1]; });
      return '<path d="M' + p.join(" L") + ' Z" fill="' + fl + '" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><path d="M' + f(21 * sx) + ' 52 L' + f(30 * sx) + ' 34 L' + f(42 * sx) + ' 42" stroke="#e6ebef" stroke-width="1.3" fill="none" opacity=".6"/><path d="M' + f(46 * sx) + ' 60 L' + f(54 * sx) + ' 84 L' + f(47 * sx) + ' 90" fill="' + fl + '" stroke="#111" stroke-width="1.4"/>'; }
    g += '<path d="M-6 0 Q-12 0 -12 8 V14 H12 V8 Q12 0 6 0 Z" fill="none" stroke="#111" stroke-width="6"/><path d="M-6 0 Q-12 0 -12 8 V14 H12 V8 Q12 0 6 0 Z" fill="none" stroke="' + sh + '" stroke-width="3.6"/>';
    g += '<rect x="-7" y="14" width="14" height="86" fill="' + sh + '" stroke="#111" stroke-width="1.8"/><path d="M-3 18 V96" stroke="#eef2f5" stroke-width="1.4" opacity=".55"/>';
    g += fluke(-1) + fluke(1);
    g += '<path d="M-56 90 L56 90 L50 108 L-50 108 Z" fill="' + fl + '" stroke="#111" stroke-width="1.8"/><path d="M-54 92 H54" stroke="#e6ebef" stroke-width="1.2" opacity=".5"/>';
    if (o.rust) for (var r = 0; r < 8; r++) g += '<circle cx="' + f((hash(r) - 0.5) * 80) + '" cy="' + f(30 + hash(r + 4) * 70) + '" r="' + f(1.5 + hash(r + 8) * 2.5) + '" fill="#6a2a10" opacity=".5"/>';
    return g + '</g>';
  }
  function ring(x, y, ang, s) { var a = ang * Math.PI / 180; s = s || 1; return [x - 74 * s * Math.cos(a), y - 74 * s * Math.sin(a)]; }
  // shaded stud-link chain along points P; links alternate face-on (with a stud and a highlight) and edge-on
  function chainAlong(P, w, off) {
    w = w || 1; var s = "", step = 9.5 * w, acc = ((off || 0) % (2 * step) + 2 * step) % (2 * step), n = acc >= step ? 1 : 0; acc = acc % step;
    for (var j = 1; j < P.length; j++) {
      var dx = P[j][0] - P[j - 1][0], dy = P[j][1] - P[j - 1][1], L = Math.sqrt(dx * dx + dy * dy) || 0.001, a = Math.atan2(dy, dx) * 180 / Math.PI;
      while (acc <= L) { var k = acc / L, x = P[j - 1][0] + dx * k, y = P[j - 1][1] + dy * k;
        s += n % 2 ? '<rect x="' + f(-6 * w) + '" y="' + f(-1.6 * w) + '" width="' + f(12 * w) + '" height="' + f(3.2 * w) + '" rx="' + f(1.5 * w) + '" fill="url(#lnk)" stroke="#111" stroke-width="' + f(0.8 * w) + '" transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"/>'
                   : '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"><ellipse rx="' + f(6.4 * w) + '" ry="' + f(4 * w) + '" fill="none" stroke="#111" stroke-width="' + f(3.2 * w) + '"/><ellipse rx="' + f(6.4 * w) + '" ry="' + f(4 * w) + '" fill="none" stroke="#69717b" stroke-width="' + f(2 * w) + '"/><path d="M' + f(-5 * w) + ' ' + f(-2.6 * w) + ' Q0 ' + f(-4.6 * w) + ' ' + f(5 * w) + ' ' + f(-2.6 * w) + '" stroke="#e6ebef" stroke-width="' + f(0.9 * w) + '" fill="none"/><path d="M0 ' + f(-3.4 * w) + ' V' + f(3.4 * w) + '" stroke="#3a3f46" stroke-width="' + f(1.6 * w) + '"/></g>';
        acc += step; n++; }
      acc -= L;
    }
    return s;
  }
  function catenaryPts(H, A, yb, lay, taut) {
    var tx = lerp(H[0], A[0], 1 - lay), P = [], n = 40;
    for (var i = 0; i <= n; i++) { var k = i / n, x, y;
      if (k < 0.75) { var q = k / 0.75, c1 = [H[0] + (tx - H[0]) * 0.12, H[1] + (yb - H[1]) * 0.75], c2 = [tx - (tx - H[0]) * 0.5, yb], m = 1 - q;
        x = m * m * m * H[0] + 3 * m * m * q * c1[0] + 3 * m * q * q * c2[0] + q * q * q * tx; y = m * m * m * H[1] + 3 * m * m * q * c1[1] + 3 * m * q * q * c2[1] + q * q * q * yb; }
      else { var r = (k - 0.75) / 0.25; x = lerp(tx, A[0], r); y = lerp(yb, A[1], r); }
      P.push([lerp(x, lerp(H[0], A[0], k), taut || 0), lerp(y, lerp(H[1], A[1], k), taut || 0)]); }
    return P;
  }
  // a VLCC crude tanker, side view, bow to the right (photos of VLCCs at anchor): black topsides, red antifouling under the
  // waterline with a white boot-top, a raised forecastle with the hawse pipe, pipes along the long flat deck, the white
  // accommodation block and funnel aft. Local: deck 0, keel 72, waterline at dr. Returns {svg, H: hawse point}
  function tanker(x, y, t, o) {
    o = o || {}; var sc = o.s || 0.4, L = 280, dr = 46, id = "tk" + (CLIPN++), bob = o.noBob ? 0 : Math.sin(t * 1.1 + x * 0.01) * 1.2;
    var hull = 'M' + (-L) + ' -4 L' + (L - 70) + ' -4 L' + (L - 62) + ' -16 L' + (L + 8) + ' -16 C' + (L + 3) + ' 18 ' + (L - 2) + ' 36 ' + (L - 6) + ' 50 C' + (L + 16) + ' 54 ' + (L + 16) + ' 70 ' + (L - 14) + ' 72 L' + (-L + 22) + ' 72 C' + (-L + 6) + ' 72 ' + (-L) + ' 60 ' + (-L) + ' 44 Z';
    var s = '<g transform="translate(' + f(x) + ' ' + f(y + bob) + ') rotate(' + f((o.tilt || 0) + Math.sin(t * 0.9 + x) * 0.3) + ') scale(' + sc + ') translate(0 ' + (-dr) + ')"><defs><clipPath id="' + id + '"><path d="' + hull + '"/></clipPath></defs>';
    // accommodation block + funnel (aft, left)
    s += '<path d="M' + (-L + 14) + ' -4 V-82 H' + (-L + 92) + ' V-4 Z" fill="url(#house)" stroke="#333" stroke-width="1.6"/><path d="M' + (-L + 8) + ' -86 H' + (-L + 100) + ' V-80 H' + (-L + 8) + ' Z" fill="#e8e6de" stroke="#333" stroke-width="1.4"/>';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) s += '<rect x="' + (-L + 20 + c * 12) + '" y="' + (-76 + r * 12) + '" width="8" height="5" fill="' + (r === 0 ? "#1f3a52" : "#4f7f9a") + '"/>';
    s += '<path d="M' + (-L + 30) + ' -86 L' + (-L + 34) + ' -122 H' + (-L + 62) + ' L' + (-L + 66) + ' -86 Z" fill="#c8432f" stroke="#333" stroke-width="1.4"/><rect x="' + (-L + 33) + '" y="-110" width="31" height="8" fill="#f2c230"/><rect x="' + (-L + 34) + '" y="-124" width="28" height="5" fill="#1c1c1c"/>';
    for (var k = 0; k < 4; k++) { var u = (t * 0.4 + k / 4) % 1; s += '<circle cx="' + f(-L + 48 - u * 70) + '" cy="' + f(-130 - u * 40) + '" r="' + f(5 + u * 14) + '" fill="#8a9098" opacity="' + f(0.35 * (1 - u)) + '"/>'; }
    s += '<path d="M' + (-L + 92) + ' -64 V-120 M' + (-L + 86) + ' -110 H' + (-L + 98) + '" stroke="#ddd" stroke-width="2.4"/><circle cx="' + (-L + 92) + '" cy="-122" r="2.4" fill="' + (Math.sin(t * 4) > 0 ? "#ff4030" : "#601010") + '"/>';
    // deck: pipe rack, manifold crane, catwalk, forecastle mast
    s += '<path d="M' + (-L + 96) + ' -10 H' + (L - 70) + ' M' + (-L + 96) + ' -15 H' + (L - 70) + '" stroke="#7a8590" stroke-width="2.6"/>';
    for (var p = -L + 110; p < L - 70; p += 24) s += '<path d="M' + p + ' -4 V-17" stroke="#55606b" stroke-width="1.6"/>';
    s += '<path d="M-6 -4 V-40 L40 -52" stroke="#f2c230" stroke-width="3" fill="none"/><rect x="-14" y="-12" width="18" height="8" fill="#c8432f"/><path d="M' + (L - 36) + ' -16 V-60 M' + (L - 44) + ' -50 H' + (L - 28) + '" stroke="#ddd" stroke-width="2.4"/>';
    // the hull: black topsides, red bottom, white boot-top, sheen
    s += '<g clip-path="url(#' + id + ')"><rect x="' + (-L - 20) + '" y="-30" width="' + (2 * L + 60) + '" height="140" fill="url(#hullR)"/><rect x="' + (-L - 20) + '" y="-30" width="' + (2 * L + 60) + '" height="' + (dr - 4 + 30) + '" fill="url(#hullK)"/><rect x="' + (-L - 20) + '" y="' + (dr - 4) + '" width="' + (2 * L + 60) + '" height="3" fill="#f4f1e8"/>';
    s += '<rect x="' + (-L - 20) + '" y="-2" width="' + (2 * L + 60) + '" height="5" fill="#fff" opacity=".18"/>';
    for (var fr = -L + 30; fr < L; fr += 46) s += '<path d="M' + fr + ' 2 V' + (dr - 6) + '" stroke="#000" stroke-width="1" opacity=".25"/>';
    s += '<text x="' + (L - 120) + '" y="20" text-anchor="middle" style="font:800 13px Noto Serif;fill:#fff;letter-spacing:3px" opacity=".85">EH ELHEKAYA</text></g>';
    s += '<path d="' + hull + '" fill="none" stroke="#111" stroke-width="2.2"/>';
    // the hawse pipe at the bow with the anchor stowed (when it is not down)
    s += '<ellipse cx="' + (L - 14) + '" cy="8" rx="13" ry="11" fill="url(#hullK)" stroke="#111" stroke-width="1.4"/><ellipse cx="' + (L - 16) + '" cy="6" rx="12" ry="9" fill="none" stroke="#6a7480" stroke-width="1.2" opacity=".6"/><ellipse cx="' + (L - 14) + '" cy="8" rx="7" ry="5.5" fill="#0b0d10" stroke="#555" stroke-width="1.2"/>';
    if (o.stowed) s += anchorFront(L - 14, 4, { s: 0.3, rust: true });
    for (var dm = 0; dm < 5; dm++) s += '<path d="M' + (L - 30) + ' ' + (dr + 4 + dm * 5) + ' h8" stroke="#fff" stroke-width="1.4"/>';
    return { svg: s + '</g>', H: [x + sc * (L - 14), y + sc * (8 - dr)] };
  }
  // the full anchored ship: o {xs, ys, yb, ax, lay, taut, fa, dig, s, tilt, glowChain, glowLay, face, as}
  function moored(t, o) {
    var v = tanker(o.xs, o.ys, t, { s: o.s, tilt: o.tilt }), ang = o.ang == null ? -4 : o.ang, as = o.as || 0.55, ay = o.yb + 4 + (o.dig || 0) * 14, R = ring(o.ax, ay, ang, as);
    var lay = o.lay == null ? 0.4 : o.lay, P = catenaryPts(v.H, R, o.yb + 1, lay, o.taut), s = v.svg;
    if (o.glowLay) { var tx = lerp(v.H[0], R[0], 1 - lay); s += '<rect x="' + f(tx) + '" y="' + f(o.yb - 10) + '" width="' + f(R[0] - tx) + '" height="20" rx="10" fill="#f2c230" opacity="' + f(0.4 * o.glowLay) + '" filter="url(#soft2)"/>'; }
    if (o.glowChain) s += '<path d="M' + P.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + '" stroke="#f2c230" stroke-width="14" fill="none" opacity="' + f(0.4 * o.glowChain) + '" filter="url(#soft2)"/>';
    s += shadow(o.ax - 20, o.yb + 6, 40 * as / 0.55, 6) + chainAlong(P, o.cw || 0.6) + anchor(o.ax, ay, ang, { s: as, fa: o.fa, face: o.face, t: t });
    s += '<path d="M-400 ' + f(o.yb + 3) + ' H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>';
    return { svg: s, H: v.H, R: R, P: P };
  }
  function plough(x, y, t, dig) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + shadow(10, 6, 60, 8);
    s += '<path d="M-150 -40 L0 -6" stroke="#5a3c20" stroke-width="7" stroke-linecap="round"/><path d="M-150 -42 L0 -8" stroke="#a87a4a" stroke-width="2" stroke-linecap="round"/><path d="M0 -6 L30 -60 M30 -60 l18 -6" stroke="#5a3c20" stroke-width="6" stroke-linecap="round"/>';
    s += '<path d="M-8 -10 L26 -10 L40 ' + f(14 * dig) + ' L-4 ' + f(10 * dig) + ' Z" fill="url(#aFluke)" stroke="#111" stroke-width="2"/>';
    for (var i = 0; i < 6; i++) { var u = (t * 1.2 + i / 6) % 1; s += '<path d="M' + f(30 + u * 70) + ' ' + f(-4 - Math.sin(u * Math.PI) * 18) + ' q8 -8 16 0" stroke="#5a3c20" stroke-width="6" fill="none" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; }
    return s + '</g>';
  }
  function ox(x, y, t) { var b = Math.sin(t * 6) * 3, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + shadow(0, 4, 70, 9); s += '<ellipse cx="0" cy="-40" rx="56" ry="28" fill="#8a5a3a" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="-8" cy="-52" rx="36" ry="10" fill="#b07a52" opacity=".6"/>';
    [[-36, 1], [-20, -1], [26, 1], [40, -1]].forEach(function (l) { s += '<path d="M' + l[0] + ' -20 l' + f(l[1] * b) + ' 26" stroke="#6a4028" stroke-width="9" stroke-linecap="round"/>'; });
    s += '<ellipse cx="-62" cy="-50" rx="20" ry="16" fill="#8a5a3a" stroke="' + INK + '" stroke-width="2.4"/><path d="M-70 -64 q-10 -10 -4 -16 M-56 -64 q4 -12 12 -12" stroke="#e8e4da" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-68" cy="-52" r="2.4" fill="' + INK + '"/>';
    return s + '<path d="M54 -46 q14 10 8 26" stroke="#6a4028" stroke-width="4" fill="none"/></g>'; }
  function windlass(x, y, t, spin, s) {   // red bow windlass (photo): bedplate, gypsy wheel with the chain over it, warping drum, brake
    var a = spin * 360, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shadow(0, 44, 90, 8);
    g += '<path d="M-80 40 L-70 10 H70 L80 40 Z" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><rect x="40" y="-30" width="34" height="44" rx="6" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><circle cx="57" cy="-8" r="12" fill="#8f2618" stroke="' + INK + '"/>';
    g += '<g transform="translate(-40 -6) rotate(' + f(a) + ')"><circle r="30" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2.4"/><circle r="22" fill="none" stroke="#5a1a10" stroke-width="3"/>'; for (var i = 0; i < 8; i++) g += '<path d="M0 -22 V-8" stroke="#5a1a10" stroke-width="3" transform="rotate(' + (i * 45) + ')"/>'; g += '<circle r="7" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/></g>';
    g += chainAlong([[-100, -40], [-70, -36], [-40, -36], [-12, -30], [10, 30], [16, 60]], 0.9);
    g += '<g transform="translate(10 -6) rotate(' + f(a * 0.7) + ')"><circle r="22" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><circle r="16" fill="#c9a87a" stroke="#6a4a2a" stroke-dasharray="3 2"/><path d="M-16 0 H16" stroke="#6a4a2a" stroke-width="1.4"/></g>';
    return g + '</g>';
  }
  function mudPuff(t, x, y, k, n) { var s = ""; n = n || 7; for (var i = 0; i < n; i++) { var u = (t * 0.9 + i / n) % 1, r = 6 + u * 22; s += '<circle cx="' + f(x + (hash(i) - 0.5) * 50 * u) + '" cy="' + f(y - u * 40) + '" r="' + f(r) + '" fill="#8a6a48" opacity="' + f(0.55 * (1 - u) * k) + '" filter="url(#soft2)"/>'; } return s; }
  function rain(t, op) { var s = ""; for (var i = 0; i < 70; i++) { var x = ((hash(i) * 1200 - t * 120) % 1200 + 1200) % 1200 - 300, y = ((hash(i + 9) * 600 + t * 700) % 600) - 260; s += '<path d="M' + f(x) + ' ' + f(y) + ' l-8 22" stroke="#cfe1ec" stroke-width="1.6" opacity="' + (op || 0.6) + '"/>'; } return s; }
  function bigWaves(t, y0, a) { var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 16) d += " L" + x + " " + f(y0 + Math.sin(x * 0.03 + t * 3) * a + Math.sin(x * 0.08 - t * 4) * a * 0.3); return '<path d="' + d + ' V' + (y0 + 30) + ' H-400 Z" fill="#5a7a90" opacity=".7"/><path d="' + d + '" stroke="#e8f0f4" stroke-width="3" fill="none"/>'; }
  function pipeline(x0, x1, y, t, br) { var s = shadow((x0 + x1) / 2, y + 4, (x1 - x0) / 2, 6) + '<rect x="' + x0 + '" y="' + (y - 16) + '" width="' + (x1 - x0) + '" height="18" rx="9" fill="url(#gConc)" stroke="' + INK + '" stroke-width="2"/><path d="M' + x0 + ' ' + (y - 12) + ' H' + x1 + '" stroke="#fff" stroke-width="2.4" opacity=".5"/>';
    for (var x = x0 + 40; x < x1; x += 80) s += '<rect x="' + (x - 3) + '" y="' + (y - 17) + '" width="6" height="20" fill="#8a8478"/>';
    if (br) for (var i = 0; i < 14; i++) { var u = (t * 0.8 + i / 14) % 1; s += '<circle cx="' + f(br + Math.sin(u * 9 + i) * 20 * u) + '" cy="' + f(y - 16 - u * 220) + '" r="' + f(3 + u * 7) + '" fill="#d8eef7" fill-opacity=".35" stroke="#fff" stroke-width="1.4" opacity="' + f(1 - u * 0.7) + '"/>'; }
    return s; }
  function sailor(x, y, t, mood, o) { o = o || {}; var s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-56 140 C-60 56 -38 32 0 32 C38 32 60 56 56 140 Z" fill="#1f3a5a" stroke="' + INK + '" stroke-width="3"/><path d="M-26 34 L0 70 L26 34" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><path d="M-8 56 h16" stroke="#c23a26" stroke-width="5"/>';
    s += head(0, -34, 40, mood, t, o.look) + '<path d="M-40 -58 C-40 -84 40 -84 40 -58 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="M-46 -58 H46" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M-46 -58 H46" stroke="#1f3a5a" stroke-width="4" stroke-linecap="round"/><path d="M-8 -72 h16 l-8 -8 Z" fill="#f2c230" stroke="' + INK + '"/>';
    return s + '</g>'; }
  function badge(x, y, txt, col, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="24" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/><text y="10" text-anchor="middle" style="font:900 28px Noto Sans Arabic;fill:#fff">' + txt + '</text></g>'; }
  function lbl(x, y, txt, anchorEnd) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchorEnd ? "end" : "middle") + '" style="font:800 15px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + txt + '</text>'; }
  function ruler(x0, x1, y, label, k) { var xe = lerp(x0, x1, clamp(k)); return '<path d="M' + x0 + ' ' + y + ' H' + f(xe) + '" stroke="#f2c230" stroke-width="3"/><path d="M' + x0 + ' ' + (y - 8) + ' v16 M' + f(xe) + ' ' + (y - 8) + ' v16" stroke="#f2c230" stroke-width="3"/>' + (k > 0.9 ? lbl((x0 + x1) / 2, y - 12, label) : ""); }
  function uwVig() { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#vig)"/>'; }

  // ── shots (one per line, 21 lines ≈ 1:35) ─────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }
  var YS = 120, YB = 300;

  // 0 — a giant tanker at anchor; the camera runs down the chain to the small anchor on the seabed
  shot(0, function (u, d) { var k = 0.35 * clamp(u / d) + 0.65 * ease(u / d); return [lerp(230, 440, k), lerp(130, 255, k), lerp(1.0, 1.6, k)]; }, function (u, d, t) {
    var m = moored(t, { xs: 220, ys: YS, yb: YB, ax: 480, lay: 0.35, dig: 0.6, s: 0.4 }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    return s + tag("أكتر من 300 ألف طن", 200, 30, u, 0.4, -3, 19) + tag("20 طن بس!", 470, 250, u, 2.8, 3, 18, "#f2c230");
  });
  // 1 — a balance: the ship on one side, the anchor on the other: 15,000 times lighter
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(280, 360, k), lerp(170, 200, k), lerp(0.95, 1.2, k)]; }, function (u, d, t) {
    var k = ease(u / 1.4), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#14223a"/>' + stars(t) + '<circle cx="320" cy="170" r="180" fill="#f2c230" opacity=".08" filter="url(#soft)"/>';
    for (var ry = 0; ry < 12; ry++) { var ra = ry * 0.52 + t * 0.5; s += '<path d="M320 170 L' + f(320 + Math.cos(ra) * 500) + ' ' + f(170 + Math.sin(ra) * 500) + ' L' + f(320 + Math.cos(ra + 0.18) * 500) + ' ' + f(170 + Math.sin(ra + 0.18) * 500) + ' Z" fill="#f2c230" opacity=".07"/>'; }
    s += scaleBal(320, 120, lerp(0, 24, k) + Math.sin(t * 2.4) * 6 * k, tanker(0, 2, t, { s: 0.13, noBob: true }).svg, anchorFront(0, -38, { s: 0.3, rust: true, swing: Math.sin(t * 3) * 6 }));
    for (var sp = 0; sp < 8; sp++) { var su = (t * 0.7 + sp / 8) % 1; s += '<circle cx="' + f(200 + hash(sp) * 260) + '" cy="' + f(300 - su * 260) + '" r="' + f(1.5 + su * 2) + '" fill="#f2c230" opacity="' + f(0.8 * (1 - su)) + '"/>'; }
    var cnt = Math.round(15000 * ease((u - 1.0) / 1.4)); if (u > 1.0) s += '<text x="320" y="345" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:#f2c230;stroke:#1c1c1c;stroke-width:4;paint-order:stroke">× ' + cnt.toLocaleString("en-US") + '</text>';
    return s + tag("أخف 15 ألف مرة!", 320, 40, u, 1.6, -2, 22);
  });
  // 2 — a sailor at the bow, puzzled: how does that hold this mountain?
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(300, 350, k), 175, lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var v = tanker(250, 240, t, { s: 1.0, stowed: true }), s = sea(t, 240, 0, { gulls: true }) + v.svg + front(t, 240);
    return s + sailor(470, 70, t, "curious", { s: 0.5 }) + qmark(530, 30, t, 40) + qmark(560, 62, t, 28);
  });
  // 3 — «إيه الحكاية؟»: sunset, the anchor drops into the sea
  shot(3, function (u, d) { return [320, lerp(170, 190, u / d), lerp(1.05, 1.12, u / d)]; }, function (u, d, t) {
    var k = ease(u / 1.1), v = tanker(170, 215, t, { s: 0.7 }), s = sea(t, 215, 0, { sky: "sunset" }) + sun(500, 170, 28, "#ffd27a") + v.svg;
    var ay = lerp(v.H[1] + 10, 260, k); s += chainAlong([v.H, [v.H[0], ay]], 0.7) + anchorFront(v.H[0], ay, { s: 0.45, rust: true, swing: Math.sin(t * 2.5) * 4 }) + front(t, 215, "#3a4f74");
    if (k > 0.75) for (var i = 0; i < 9; i++) { var uu = (t * 1.5 + i / 9) % 1; s += '<circle cx="' + f(v.H[0] + (hash(i) - 0.5) * 70 * uu) + '" cy="' + f(210 - Math.sin(uu * Math.PI) * 34) + '" r="4" fill="#fff" opacity="' + f(1 - uu) + '"/>'; }
    return s + tag("إيه الحكاية؟", 330, 60, u, 0.4, -3, 26);
  });
  // 4 — it does not hold the ship up; it only stops wind and current pushing it away
  shot(4, function (u, d) { return [lerp(300, 340, u / d), 180, 1.04]; }, function (u, d, t) {
    var dx = -14 * ease((u - 1.4) / 1.5) + Math.sin(t * 1.5) * 3, m = moored(t, { xs: 240 + dx, ys: YS, yb: YB, ax: 490, lay: 0.3, s: 0.4 }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    s += arrow(200, 40, 200, 0, "#f2a0a0", 6, ease((u - 0.3) / 0.5)) + badge(232, 22, "✕", "#c23a26", pop((u - 0.8) / 0.8) * 0.8);
    s += airflow(t, 640, 380, 40, 9, "#fff", 0.6, 4) + airflow(t, 600, 360, 190, 7, "#bfe6f7", 0.4, 2) + arrow(620, 70, 500, 70, "#fff", 5, ease((u - 1.4) / 0.5)) + arrow(620, 200, 500, 200, "#8fd0ee", 5, ease((u - 1.9) / 0.5));
    return s + uwVig() + tag("مش بتشيل", 110, 40, u, 0.6, -3, 18) + tag("الهوا", 580, 100, u, 1.5, 3, 17) + tag("التيار", 580, 230, u, 2.0, 3, 17, "#bfe0ff");
  });
  // 5 — like a plough: two flukes bite into the mud when pulled along the bottom
  shot(5, function (u, d) { return u < d * 0.38 ? [lerp(280, 330, u / d), 190, 1.05] : [lerp(320, 300, u / d), 225, 1.7]; }, function (u, d, t) {
    if (u < d * 0.38) { var s0 = sky("day") + clouds(t, 16, 20, 4, 0.8) + sun(520, 60, 22, "#ffe08a") + '<rect x="-400" y="230" width="1440" height="400" fill="url(#gSoil)"/>';
      for (var r = 0; r < 8; r++) s0 += '<path d="M-400 ' + (240 + r * 16) + ' H' + f(170 + u * 20) + '" stroke="#6a4a2a" stroke-width="3" opacity=".6"/>';
      for (var cl = 0; cl < 10; cl++) { var cu = (t * 0.9 + cl / 10) % 1; s0 += '<circle cx="' + f(300 + u * 60 + cu * 140) + '" cy="' + f(232 - Math.sin(cu * Math.PI) * 40) + '" r="' + f(3 + hash(cl) * 4) + '" fill="#6a4a2a" opacity="' + f(1 - cu) + '"/>'; }
      return s0 + ox(110 + u * 60, 230, t) + plough(260 + u * 60, 236, t, 1) + engineer(340 + u * 60, 100, t, "happy", { s: 0.5 }) + tag("زي المحراث", 470, 110, u, 0.4, 3, 22); }
    var v = u - d * 0.38, k = ease(v / (d * 0.62)), ang = lerp(0, -8, k), fa = lerp(8, 42, ease(v / 1.2)), x = lerp(380, 300, k), y = YB + 4 + 18 * k;
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#uwSea)"/>' + mudBed(t, YB), R = ring(x, y, ang, 1);
    s += chainAlong([[R[0] - 300, YB - 4], R], 1) + anchor(x, y, ang, { s: 1, fa: fa }) + mudPuff(t, x + 10, YB, k, 6);
    s += '<path d="M-400 ' + (YB + 3) + ' H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>' + arrow(220, YB - 34, 130, YB - 34, "#f2c230", 5, ease(v / 0.6));
    return s + uwVig() + tag("مخلبين", x + 30, YB + 72, u, d * 0.38 + 0.6, 3, 18) + tag("بيغرزوا", x - 20, YB - 92, u, d * 0.38 + 1.4, -3, 18);
  });
  // 6 — the harder the pull, the deeper it digs; but the pull has to come in flat, not upward
  shot(6, function (u, d) { return u < d * 0.5 ? [320, 230, 1.5] : [320, 200, 1.0]; }, function (u, d, t) {
    if (u < d * 0.5) { var k = ease(u / (d * 0.5)), y = YB + 18 + 24 * k, x = lerp(330, 300, k), s0 = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#uwSea)"/>' + mudBed(t, YB), R0 = ring(x, y, -8, 1);
      s0 += chainAlong([[R0[0] - 300, YB - 4], [R0[0] - 60, YB], R0], 1) + anchor(x, y, -8, { s: 1, fa: 42 }) + '<path d="M-400 ' + (YB + 3) + ' H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>' + arrow(220, YB - 30, lerp(200, 100, k), YB - 30, "#f2c230", lerp(4, 10, k), 1);
      return s0 + bar(470, 150, 26, 110, k, "#f2c230", "الشد") + bar(520, 150, 26, 110, k * 0.95, "#7cf29a", "المسكة") + uwVig() + tag("تغرز أكتر", 250, 140, u, 0.8, -3, 18); }
    var v = u - d * 0.5, s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#uwSea)"/>' + mudBed(t, YB - 40) + '<path d="M320 60 V360" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" opacity=".6"/>';
    var R1 = ring(200, YB - 18, -8, 0.8); s += chainAlong([[0, YB - 44], R1], 0.8) + anchor(200, YB - 18, -8, { s: 0.8, fa: 42 });
    var k2 = ease((v - 0.8) / 1.0), ay = lerp(YB - 26, YB - 140, k2) + Math.sin(t * 3) * 6 * k2, ang = lerp(-8, 70, k2) + Math.sin(t * 2.6) * 8 * k2, R2 = ring(500, ay, ang, 0.8);
    s += chainAlong([[R2[0] - 20, 40], R2], 0.8) + anchor(500, ay, ang, { s: 0.8, fa: lerp(42, 10, k2) }) + mudPuff(t, 500, YB - 40, k2, 6) + '<path d="M-400 ' + (YB - 37) + ' H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>';
    s += bubbles(t, 500, YB - 60, 8 * (k2 > 0 ? 1 : 0), 0.9, 30, 40);
    return s + uwVig() + badge(200, 130, "✓", "#3a9a5a", pop((v - 0.2) / 0.8)) + badge(560, 130, "✕", "#c23a26", pop((v - 1.6) / 0.8)) + tag("الشد نايم", 160, 60, u, d * 0.5 + 0.1, -3, 18) + tag("الشد لفوق", 480, 60, u, d * 0.5 + 0.9, 3, 18, "#f2a0a0");
  });
  // 7 — the chain: longer than 300 m, over 100 tons (laid out on a quay with tiny workers)
  shot(7, function (u, d) { var k = ease(u / d); return [lerp(150, 470, k), 200, 1.1]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 16, 10, 4, 0.8) + '<rect x="-400" y="200" width="1440" height="400" fill="url(#gConc)"/><path d="M-400 200 H1040" stroke="#8a8478" stroke-width="3"/>', P = [];
    for (var j = 0; j < 22; j++) s += '<path d="M' + (-400 + j * 70) + ' 200 l-40 200" stroke="#8a8478" stroke-width="1.4" opacity=".5"/>';
    for (var x = -100; x <= 760; x += 20) P.push([x, 224 + Math.sin(x * 0.05) * 4]);
    s += shadow(330, 236, 460, 8, 0.8) + chainAlong(P, 1.4);
    for (var i = 0; i < 5; i++) s += engineer(-40 + i * 180, 172, t + i, i % 2 ? "shock" : "n", { s: 0.22 });
    return s + ruler(-80, 740, 274, "أكتر من 300 متر", ease((u - 0.6) / 1.4)) + tag("السلسلة", 160, 70, u, 0.2, -3, 24) + tag("أكتر من 100 طن", 470, 70, u, 2.4, 3, 20);
  });
  // 8 — the links: each has a stud across the middle so it cannot twist or knot (a studless one beside it kinks)
  shot(8, function (u, d) { var k = ease(u / d); return [lerp(290, 350, k), 180, lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#1f2a38"/><circle cx="220" cy="170" r="200" fill="#f2c230" opacity=".07" filter="url(#soft)"/>', P = [];
    for (var x = -120; x <= 420; x += 20) P.push([x, 160 + Math.sin(x * 0.02 + t) * 6]);
    s += shadow(160, 215, 260, 10) + chainAlong(P, 4.2, t * 18);
    var g = 0.5 + 0.5 * Math.sin(t * 5); s += '<circle cx="' + f(160) + '" cy="160" r="30" fill="none" stroke="#f2c230" stroke-width="3" opacity="' + f(clamp((u - 0.8) / 0.4) * (0.5 + 0.5 * g)) + '"/>';
    var k = ease((u - 1.6) / 1.0), tw = Math.sin(t * 4) * 10 * k, Q = [];
    for (var y = 40; y <= 300; y += 16) Q.push([520 + Math.sin(y * 0.06 + t * 2) * 18 * k, y]);
    s += '<g transform="rotate(' + f(tw) + ' 520 170)">' + chainAlong(Q, 1.6, 0) + '</g>' + badge(590, 90, "✕", "#c23a26", pop((u - 2.4) / 0.8) * 0.8) + badge(230, 90, "✓", "#3a9a5a", pop((u - 1.2) / 0.8) * 0.8);
    return s + tag("العارضة", 160, 250, u, 0.8, -3, 20) + tag("من غيرها تتعقد", 520, 330, u, 2.2, 3, 16, "#f2a0a0");
  });
  // 9 — link pulls link pulls link: the pull runs down the chain from the ship to the anchor
  shot(9, function (u, d) { var k = ease(u / d); return [lerp(470, 170, k), 180, 1.15]; }, function (u, d, t) {
    var s = cutaway(t, 60, 300), wave = lerp(620, -120, clamp(u / (d * 0.85))), P = [];
    var v = tanker(820, 60, t, { s: 0.5 }); s += v.svg;
    for (var x = v.H[0]; x >= 30; x -= 6) { var pull = x > wave ? 1 : 0; P.push([x - pull * 6, x > 600 ? lerp(v.H[1], 200, (v.H[0] - x) / (v.H[0] - 600)) : 200 + (600 - x) * 0.14]); }
    s += chainAlong(P, 1.4, 0) + anchor(18, 284, -6, { s: 0.9, fa: 40 }) + '<path d="M-400 303 H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>';
    var wy = wave > 600 ? 200 : 200 + (600 - wave) * 0.14; s += '<circle cx="' + f(wave) + '" cy="' + f(wy) + '" r="26" fill="#f2c230" opacity=".35" filter="url(#soft2)"/>' + arrow(wave + 50, wy - 30, wave - 10, wy - 30 + (wave > 600 ? 0 : 8), "#f2c230", 5, 1);
    for (var n = 0; n < 3; n++) { var tx = lerp(560, 160, n / 2); s += tag("حلقة", tx, 150 + (600 - tx) * 0.14 - 30, u, 0.6 + n * 0.9, n % 2 ? 3 : -3, 15, "#f2c230"); }
    return s + surface(t, 60) + uwVig() + tag("تشد", 360, 330, u, 1.6, -2, 16) + tag("لحد المرساية", 110, 220, u, d * 0.8, -3, 17);
  });
  // 10 — the links are heavy, so the chain sags into a curve and a long stretch lies on the seabed
  shot(10, function (u, d) { var k = ease(u / d); return [lerp(300, 380, k), lerp(205, 230, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var m = moored(t, { xs: 150, ys: YS, yb: YB, ax: 560, lay: lerp(0.05, 0.45, ease(u / (d * 0.6))), s: 0.4, dig: 1, glowChain: clamp((u - 0.4) / 0.6) * (1 - clamp((u - d * 0.6) / 0.6)), glowLay: clamp((u - d * 0.6) / 0.6) }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    return s + uwVig() + tag("قوس تقيل", 280, 190, u, 0.8, -3, 18) + tag("نايمة على القاع", 430, 250, u, d * 0.62, 3, 18);
  });
  // 11 — so the pull reaches the anchor flat and it stays dug in
  shot(11, function (u, d) { var k = ease(u / d); return [lerp(430, 520, k), lerp(250, 275, k), lerp(1.5, 1.9, k)]; }, function (u, d, t) {
    var m = moored(t, { xs: 150, ys: YS, yb: YB, ax: 560, lay: 0.45, s: 0.4, dig: 1 }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    s += arrow(m.R[0] + 4, YB - 16, m.R[0] - 70, YB - 16, "#f2c230", 5, ease((u - 0.3) / 0.8)) + badge(m.R[0] + 46, YB - 50, "✓", "#3a9a5a", pop((u - 1.4) / 0.8) * 0.7);
    return s + uwVig() + tag("الشد نايم", 520, 220, u, 0.6, -3, 16) + tag("غارزة", 600, 330, u, 1.8, 3, 16, "#f2c230");
  });
  // 12 — the part on the seabed rubs against the mud and holds too
  shot(12, function (u, d) { return [lerp(360, 400, u / d), 262, 1.6]; }, function (u, d, t) {
    var jig = Math.sin(t * 3) * 5, m = moored(t, { xs: 150 + jig, ys: YS, yb: YB, ax: 560, lay: 0.45, s: 0.4, dig: 1 }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    for (var i = 0; i < 6; i++) { var x = 360 + i * 30; s += mudPuff(t + i * 0.3, x, YB, 0.7, 3) + '<path d="M' + (x - 8) + ' ' + (YB + 8) + ' h16" stroke="#f2c230" stroke-width="2.4" opacity="' + f(0.5 + 0.5 * Math.sin(t * 8 + i)) + '"/>'; }
    return s + uwVig() + tag("احتكاك", 400, 220, u, 0.6, -3, 18) + tag("بتمسك هي كمان", 470, 330, u, 1.6, 3, 16);
  });
  // 13 — a wave yanks the ship: the curve straightens a little then sags back, like a spring
  shot(13, function (u, d) { return [lerp(300, 340, u / d), 200, 1.0]; }, function (u, d, t) {
    var j = Math.max(0, Math.sin(t * 2.2)), m = moored(t, { xs: 160 - j * 30, ys: YS, yb: YB, ax: 560, lay: 0.45 - j * 0.25, taut: j * 0.3, s: 0.4, dig: 1 });
    var s = cutaway(t, YS, YB) + m.svg + bigWaves(t, YS - 6, 6), sp = 20 + j * 30, coil = "M560 40";
    for (var i = 0; i <= 10; i++) coil += " L" + f(560 + (i % 2 ? 10 : -10)) + " " + f(40 + i * sp / 10);
    return s + uwVig() + '<path d="' + coil + '" stroke="#f2c230" stroke-width="4" fill="none"/>' + arrow(200, 50, 120, 50, "#fff", 5, j) + tag("زي السوستة", 440, 40, u, 1.6, 3, 18);
  });
  // 14 — sailors pay out a chain 4 to 6 times the water depth
  shot(14, function (u, d) { return [lerp(300, 330, u / d), 200, 0.98]; }, function (u, d, t) {
    var k = ease(u / 2.2), m = moored(t, { xs: 120, ys: YS, yb: YB, ax: lerp(240, 560, k), lay: lerp(0, 0.45, k), s: 0.4 }), s = cutaway(t, YS, YB) + m.svg + surface(t, YS);
    var kd = ease((u - 0.2) / 0.6), ye = lerp(YS + 6, YB - 4, kd); s += '<path d="M80 ' + (YS + 6) + ' V' + f(ye) + '" stroke="#bfe0ff" stroke-width="3" stroke-dasharray="6 4"/><path d="M72 ' + (YS + 6) + ' h16 M72 ' + f(ye) + ' h16" stroke="#bfe0ff" stroke-width="3"/>' + (kd > 0.9 ? lbl(70, (YS + YB) / 2, "العمق", true) : "");
    return s + uwVig() + ruler(m.H[0], m.R[0], YB + 40, "4 لـ 6 أضعاف العمق", ease((u - 1.6) / 1.0));
  });
  // 15 — the windlass: a wheel with pockets the size of the links pulls them in one by one
  shot(15, function (u, d) { var k = ease(u / d); return [lerp(300, 340, k), 180, lerp(1.25, 1.45, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 10, 4, 0.8) + '<rect x="-400" y="230" width="1440" height="400" fill="url(#tankR)"/><path d="M-400 230 H1040" stroke="#5a1a10" stroke-width="3"/>' + '<rect x="-400" y="190" width="1440" height="8" fill="#f4f1e8"/><path d="M-400 194 H1040" stroke="#c9c4b8"/>';
    for (var p = -400; p < 1040; p += 40) s += '<path d="M' + p + ' 198 V230" stroke="#c9c4b8" stroke-width="2"/>';
    var ph = t * 0.35, C = [], cx = 320, cy = 170, R = 62;
    for (var a = 200; a >= 0; a -= 10) { var r = a * Math.PI / 180; C.push([cx + Math.cos(r) * R, cy - Math.sin(r) * R]); }
    var P = [[-200, 120]].concat([[180, 150]]).concat(C).concat([[cx + R + 10, 260], [cx + R + 14, 420]]);
    s += shadow(320, 236, 150, 12) + '<path d="M150 236 L170 190 H470 L490 236 Z" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + f(-ph * 360) + ')"><circle r="' + (R - 4) + '" fill="url(#tankR)" stroke="' + INK + '" stroke-width="3"/>';
    for (var q = 0; q < 10; q++) s += '<g transform="rotate(' + (q * 36) + ')"><rect x="-9" y="' + (-R + 2) + '" width="18" height="14" rx="4" fill="#4a140e" stroke="' + INK + '" stroke-width="1.4"/></g>';
    s += '<circle r="22" fill="#8f2618" stroke="' + INK + '" stroke-width="2"/><circle r="8" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.6"/></g>' + chainAlong(P, 1.6, -t * 30);
    s += '<rect x="440" y="80" width="70" height="110" rx="8" fill="url(#tankR)" stroke="' + INK + '" stroke-width="2"/><circle cx="475" cy="135" r="22" fill="#8f2618" stroke="' + INK + '" stroke-width="2"/>' + sailor(560, 110, t, "happy", { s: 0.4 });
    return s + tag("جيوب على مقاس الحلقات", 300, 40, u, 0.9, -3, 17) + tag("حلقة حلقة", 150, 300, u, 2.2, 3, 18, "#f2c230");
  });
  // 16 — to lift it, the ship heaves in until it is right above it; the pull goes up and it slips out easily
  shot(16, function (u, d) { var k = ease(u / d); return [lerp(300, 470, k), lerp(200, 215, k), lerp(1.0, 1.2, k)]; }, function (u, d, t) {
    var k = ease(u / (d * 0.55)), xs = lerp(150, 396, k), up = ease((u - d * 0.55) / (d * 0.4)), v = tanker(xs, YS, t, { s: 0.4 }), s = cutaway(t, YS, YB) + v.svg;
    var ang = lerp(-4, 90, up), ay = lerp(YB + 18, YB - 110, up), R = ring(560, ay, ang, 0.55), P = up > 0 ? [v.H, R] : catenaryPts(v.H, R, YB + 1, lerp(0.45, 0, k), k * 0.85);
    s += shadow(540, YB + 6, 40, 6) + chainAlong(P, 0.6) + anchor(560, ay, ang, { s: 0.55, fa: lerp(40, 5, up), face: up > 0.3 ? "happy" : null, t: t }) + mudPuff(t, 560, YB, up > 0 ? 1 - up * 0.5 : 0, 7);
    s += '<path d="M-400 ' + (YB + 3) + ' H1040 V700 H-400 Z" fill="' + MUDC + '" opacity=".4"/>' + surface(t, YS) + '<g transform="translate(' + f(v.H[0] - 60) + ' ' + f(v.H[1] - 40) + ')">' + windlass(0, 0, t, t * 0.8, 0.3) + '</g>';
    s += arrow(610, YB - 20, 610, YB - 110, "#7cf29a", 5, up);
    return s + uwVig() + tag("فوقها بالظبط", 470, 40, u, d * 0.5, 3, 18) + tag("بسهولة!", 470, 200, u, d * 0.75, -3, 20);
  });
  // 17 — in a storm the chain is pulled straight and the anchor drags along the bottom
  shot(17, function (u, d) { var k = ease(u / d); return [lerp(300, 380, k), 200, 1.0]; }, function (u, d, t) {
    var k = ease(u / d), shake = Math.sin(t * 5) * 3, ax = lerp(560, 470, k), m = moored(t, { xs: lerp(160, 70, k) + shake, ys: YS, yb: YB, ax: ax, lay: 0.02, taut: 0.85, s: 0.4, dig: 0.2, tilt: Math.sin(t * 2) * 3 });
    var s = cutaway(t, YS, YB, { sky: "storm" }) + '<path d="M' + f(ax) + ' ' + (YB + 6) + ' H660" stroke="#2a1c10" stroke-width="10" opacity=".6"/>' + m.svg + surface(t, YS, true) + rain(t, 0.6) + mudPuff(t, ax + 20, YB, 1, 7);
    if (Math.sin(t * 7) > 0.92) s += '<path d="M520 -60 L500 0 L520 0 L494 70" stroke="#fff6c8" stroke-width="4" fill="none"/>';
    return s + uwVig() + arrow(540, 40, 420, 40, "#fff", 6, 1) + tag("بتتجر!", 520, 250, u, 1.2, 3, 22, "#f2a0a0");
  });
  // 18 — Oct 2023: a ship dragged its anchor and broke the gas pipeline between Finland and Estonia
  shot(18, function (u, d) { var k = ease(u / d); return [lerp(260, 380, k), 220, lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var k = ease(u / (d * 0.7)), ax = lerp(120, 400, k), m = moored(t, { xs: ax - 360, ys: YS, yb: YB, ax: ax, lay: 0.02, taut: 0.85, s: 0.4, dig: 0.2 });
    var s = cutaway(t, YS, YB, { sky: "storm" }) + '<path d="M-200 ' + (YB + 6) + ' H' + f(ax) + '" stroke="#2a1c10" stroke-width="10" opacity=".6"/>' + pipeline(400, 1000, YB, t, k > 0.97 ? 430 : 0) + m.svg + surface(t, YS, true) + mudPuff(t, ax, YB, 1, 6);
    s += '<g transform="translate(520 40)">' + shadow(4, 76, 90, 8) + '<rect x="-90" y="-26" width="180" height="96" rx="10" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/><path d="M-80 -10 Q-40 -20 0 -8 T80 -12 V8 H-80 Z" fill="#9dbb6e"/><path d="M-80 46 Q-30 36 20 48 T80 44 V62 H-80 Z" fill="#9dbb6e"/><path d="M-80 8 V46 H80 V8 Z" fill="#9fd0e8" opacity=".6"/><path d="M-60 26 H60" stroke="#c9a050" stroke-width="4"/><text x="0" y="2" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:#1c1c1c">فنلندا</text><text x="0" y="60" text-anchor="middle" style="font:800 12px Noto Sans Arabic;fill:#1c1c1c">إستونيا</text></g>';
    return s + uwVig() + tag("2023", 150, 40, u, 0.4, -3, 22) + tag("خط غاز اتقطع", 520, 230, u, 3.2, 3, 18, "#f2a0a0");
  });
  // 19 — payoff: a dug-in anchor and a heavy chain lying on the bottom
  shot(19, function (u, d) { var k = ease(u / d); return [lerp(400, 320, k), 200, lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    var m = moored(t, { xs: 150, ys: YS, yb: YB, ax: 560, lay: 0.45, s: 0.4, dig: 1, glowLay: clamp((u - 1.6) / 0.6), face: "happy" }), s = cutaway(t, YS, YB, { sky: "sunset" }) + sun(520, 50, 24, "#ffd27a") + m.svg + surface(t, YS);
    return s + uwVig() + tag("مرساية غارزة", 560, 250, u, 0.8, 3, 17, "#f2c230") + tag("سلسلة نايمة", 380, 340, u, 1.8, -2, 17);
  });
  // 20 — outro
  shot(20, function (u, d) { return [lerp(300, 340, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var v = tanker(240 + u * 14, 230, t, { s: 0.75, stowed: true }), s = sea(t, 230, 0, { sky: "sunset", gulls: true }) + sun(500, 175, 30, "#ffd27a") + v.svg + front(t, 230, "#3a4f74");
    return s + tag("قولولنا!", 470, 60, u, 0.4, 3, 26);
  });

  window.__parts = { tanker: tanker, moored: moored, anchor: anchor, chainAlong: chainAlong, catenaryPts: catenaryPts, cutaway: cutaway, mudBed: mudBed, surface: surface, sea: sea, front: front, tag: tag, sailor: sailor, hardHat: hardHat, ring: ring, shadow: shadow };
  window.__panel = function (svg, t) {
    CLIPN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    if (i === 0) z *= 1 + 0.18 * (1 - ease(u / 1.2));   // a quick push-in on the very first frames
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
