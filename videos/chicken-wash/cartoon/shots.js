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
  var BLUE = "#3f6f9f", LIQ = "#e8a83a", GASC = "#9ac7a0", WALL = "#f1e3c6", TILE = "#e6d3ae", RED = "#d8352a";
  function R(x, y, w, h, fill, ex, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (ex || 2) + '"/>'; }
  function T(text, x, y, sz, col, w) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (w || 900) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function spark(x, y, r, t, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="' + (col || "#ffe46a") + '" opacity=".4" filter="url(#soft2)"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.8 + 0.2 * Math.sin(t * 20 + x))) + '" fill="#fff8d0" stroke="' + (col || "#ffe46a") + '" stroke-width="1.5"/>'; }
  function star(x, y, r, t, col) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2 + t * 2, rr = i % 2 ? r * 0.45 : r * (1 + 0.15 * Math.sin(t * 18 + i)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + ' Z" fill="' + (col || "#ffe46a") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function noSign(x, y, r, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ')"><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="' + f(r * 0.3) + '"/><circle r="' + r + '" fill="none" stroke="' + RED + '" stroke-width="' + f(r * 0.2) + '"/><path d="M' + f(-r * 0.7) + ' ' + f(r * 0.7) + ' L' + f(r * 0.7) + ' ' + f(-r * 0.7) + '" stroke="' + INK + '" stroke-width="' + f(r * 0.3) + '"/><path d="M' + f(-r * 0.7) + ' ' + f(r * 0.7) + ' L' + f(r * 0.7) + ' ' + f(-r * 0.7) + '" stroke="' + RED + '" stroke-width="' + f(r * 0.2) + '"/></g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  // the kitchen: tiled wall, counter, a window; o.night darkens
  function kitchen(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="' + WALL + '"/>';
    for (var y = 40; y < 250; y += 30) for (var x = -400 + ((y / 30) % 2) * 15; x < 1100; x += 30) s += '<rect x="' + x + '" y="' + y + '" width="28" height="28" fill="' + TILE + '" stroke="#d6c096" stroke-width="1"/>';
    if (o.win !== false) { var wx = o.winX == null ? 480 : o.winX; s += '<rect x="' + (wx - 70) + '" y="50" width="140" height="110" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 8, 70, 2, 0.9, 0.4) + '<path d="M' + wx + ' 50 V160 M' + (wx - 70) + ' 105 H' + (wx + 70) + '" stroke="' + INK + '" stroke-width="3"/>'; }
    s += '<rect x="-400" y="250" width="1500" height="20" fill="#b88a5a" stroke="' + INK + '" stroke-width="2.4"/><rect x="-400" y="270" width="1500" height="400" fill="#c9a06e"/>';
    for (var c = -400; c < 1100; c += 120) s += '<rect x="' + (c + 6) + '" y="282" width="108" height="120" rx="4" fill="#d9b483" stroke="#8a6a3a" stroke-width="2"/><circle cx="' + (c + 96) + '" cy="300" r="4" fill="#8a6a3a"/>';
    return s;
  }
  function flame(x, y, sz, t, big) {
    var s = "", n = big ? 5 : 6;
    for (var i = 0; i < n; i++) { var dx = (i - (n - 1) / 2) * sz * 0.45, h = sz * (big ? 2.8 + Math.sin(t * 17 + i * 2) * 0.7 : 1 + Math.sin(t * 13 + i) * 0.18), w = sz * (big ? 0.5 : 0.22);
      s += '<path d="M' + f(x + dx - w) + ' ' + f(y) + ' Q' + f(x + dx - w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + Math.sin(t * 9 + i) * w * 0.6) + ' ' + f(y - h) + ' Q' + f(x + dx + w * 0.6) + ' ' + f(y - h * 0.6) + ' ' + f(x + dx + w) + ' ' + f(y) + ' Z" fill="' + (big ? (i % 2 ? "#ffb020" : "#ff6a1a") : "#4a8cff") + '" opacity=".92"/>';
      if (!big) s += '<path d="M' + f(x + dx - w * 0.5) + ' ' + f(y) + ' Q' + f(x + dx) + ' ' + f(y - h * 0.7) + ' ' + f(x + dx + w * 0.5) + ' ' + f(y) + ' Z" fill="#bfe0ff"/>'; }
    return (big ? '<circle cx="' + f(x) + '" cy="' + f(y - sz * 1.6) + '" r="' + f(sz * 2.6) + '" fill="#ffb020" opacity=".35" filter="url(#soft)"/>' : "") + s;
  }
  // a two-burner tabletop stove; fl = flame size per burner (0 = off), big = flare
  function stove(x, y, t, fl, big) {
    var s = R(x - 90, y - 24, 180, 24, "#e9ebee", 2.4, 4) + '<rect x="' + (x - 90) + '" y="' + (y - 30) + '" width="180" height="8" fill="#2b2e33"/>';
    [-45, 45].forEach(function (dx, i) { s += '<ellipse cx="' + (x + dx) + '" cy="' + (y - 30) + '" rx="26" ry="5" fill="#3a3f46"/>' + R(x + dx - 8, y - 18, 16, 12, "#5a6068", 1.4, 3); if (fl) s += flame(x + dx, y - 31, fl, t + i, big); });
    return s;
  }
  // a pot on the stove
  function pot(x, y, t) { var s = '<path d="M' + (x - 34) + ' ' + (y - 46) + ' H' + (x + 34) + ' V' + (y - 8) + ' Q' + x + ' ' + y + ' ' + (x - 34) + ' ' + (y - 8) + ' Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (x - 40) + ' ' + (y - 46) + ' H' + (x + 40) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>'; for (var k = 0; k < 3; k++) { var ph = (t * 0.7 + k / 3) % 1; s += '<path d="M' + (x - 14 + k * 14) + ' ' + f(y - 52 - ph * 50) + ' q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" opacity="' + f(0.8 * (1 - ph)) + '"/>'; } return s; }
  function person(x, y, s, t, mood, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 2.6) * 2) + ') scale(' + s + ')">', col = o.col || "#3f8f6f";
    var arm = o.arms === "up" ? "M-46 70 L-80 0 M46 70 L80 0" : o.arms === "tilt" ? "M40 70 L104 60 M-40 76 L60 90" : o.arms === "point" ? "M44 70 L110 40 M-44 80 L-60 140" : "M-46 76 L-60 140 M46 76 L60 140";
    g += '<path d="' + arm + '" stroke="' + INK + '" stroke-width="22" stroke-linecap="round" fill="none"/><path d="' + arm + '" stroke="' + col + '" stroke-width="15" stroke-linecap="round" fill="none"/>';
    g += '<path d="M-56 170 C-60 70 -36 40 0 40 C36 40 60 70 56 170 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="3"/>' + head(0, -10, 46, mood, t, o.look);
    g += '<path d="M-44 -24 C-40 -70 40 -70 44 -24 C30 -44 -30 -44 -44 -24 Z" fill="#3a2a1e" stroke="' + INK + '" stroke-width="2.4"/>';
    return g + '</g>';
  }
  function windowOpen(x, y, k, t) { var s = '<rect x="' + (x - 70) + '" y="' + (y - 55) + '" width="140" height="110" fill="#bfe3f5" stroke="' + INK + '" stroke-width="3"/>' + clouds(t, 14, y - 40, 2, 0.9, 0.35); var a = lerp(0, 70, ease(k)); s += '<path d="M' + (x - 70) + ' ' + (y - 55) + ' L' + f(x - 70 + 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y - 55 - 14 * Math.sin(a * Math.PI / 180)) + ' L' + f(x - 70 + 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y + 55 + 14 * Math.sin(a * Math.PI / 180)) + ' L' + (x - 70) + ' ' + (y + 55) + ' Z M' + (x + 70) + ' ' + (y - 55) + ' L' + f(x + 70 - 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y - 55 - 14 * Math.sin(a * Math.PI / 180)) + ' L' + f(x + 70 - 70 * Math.cos(a * Math.PI / 180)) + ' ' + f(y + 55 + 14 * Math.sin(a * Math.PI / 180)) + ' L' + (x + 70) + ' ' + (y + 55) + ' Z" fill="#d9eef7" fill-opacity=".6" stroke="' + INK + '" stroke-width="3"/>'; for (var w = 0; w < 4; w++) { var ph = (t * 0.8 + w / 4) % 1; s += '<path d="M' + f(x - 60 + ph * 200) + ' ' + f(y - 30 + w * 18) + ' q14 -8 28 0" stroke="#7fb7e0" stroke-width="3" fill="none" opacity="' + f(k * Math.sin(ph * Math.PI)) + '"/>'; } return s; }

  // ── «أوعى تغسل الفرخة!»: raw chicken carries salmonella and campylobacter; tap water doesn't kill them, it splashes them
  // onto the counter, the plates, the salad and your clothes (USDA 2019 kitchen study: 60% sink, 14% after cleaning, 26% salad).
  // Cooking to 74 °C kills them; then wash hands, boards and the sink. Shapes: a steel kitchen sink with a gooseneck tap,
  // a whole raw chicken breast-up with the legs raised, rod-shaped salmonella with flagella and spiral campylobacter.
  var GREEN = "#3aa05a", GERMS = "#7bc043", GERMC = "#a85cc8", DROP = "#9fd4f2";
  // a steel sink on the counter (counter top at y), gooseneck tap behind; o.on turns the water on, o.w = half width
  function sink(x, y, t, o) {
    o = o || {}; var w = o.w || 110, s = "";
    s += '<path d="M' + (x + w * 0.55) + ' ' + (y - 34) + ' V' + (y - 120) + ' Q' + (x + w * 0.55) + ' ' + (y - 150) + ' ' + (x + w * 0.25) + ' ' + (y - 150) + ' Q' + (x - w * 0.02) + ' ' + (y - 150) + ' ' + (x - w * 0.02) + ' ' + (y - 118) + '" stroke="' + INK + '" stroke-width="14" fill="none" stroke-linecap="round"/>';
    s += '<path d="M' + (x + w * 0.55) + ' ' + (y - 34) + ' V' + (y - 120) + ' Q' + (x + w * 0.55) + ' ' + (y - 150) + ' ' + (x + w * 0.25) + ' ' + (y - 150) + ' Q' + (x - w * 0.02) + ' ' + (y - 150) + ' ' + (x - w * 0.02) + ' ' + (y - 118) + '" stroke="url(#steel)" stroke-width="9" fill="none" stroke-linecap="round"/>';
    s += R(x + w * 0.55 - 14, y - 52, 28, 18, "url(#steel)", 2, 4) + '<path d="M' + (x + w * 0.55 + 8) + ' ' + (y - 50) + ' l18 -10" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
    if (o.on) { var x0 = x - w * 0.02, yb = y - 26; s += '<path d="M' + f(x0 - 5) + ' ' + (y - 114) + ' Q' + f(x0 - 7 + Math.sin(t * 20) * 1.5) + ' ' + f((y - 114 + yb) / 2) + ' ' + f(x0 - 6) + ' ' + yb + ' H' + f(x0 + 6) + ' Q' + f(x0 + 7 + Math.sin(t * 23) * 1.5) + ' ' + f((y - 114 + yb) / 2) + ' ' + f(x0 + 5) + ' ' + (y - 114) + ' Z" fill="' + DROP + '" fill-opacity=".85" stroke="#4f9fd0" stroke-width="1.4"/>';
      for (var k = 0; k < 4; k++) { var ph = (t * 2.4 + k / 4) % 1; s += '<path d="M' + f(x0 - 2) + ' ' + f(lerp(y - 110, yb, ph)) + ' v8" stroke="#fff" stroke-width="2" opacity=".8"/>'; } }
    s += '<path d="M' + (x - w) + ' ' + (y - 36) + ' H' + (x + w) + ' L' + (x + w - 12) + ' ' + y + ' H' + (x - w + 12) + ' Z" fill="url(#steel)" stroke="' + INK + '" stroke-width="2.6"/>';
    s += '<path d="M' + (x - w + 8) + ' ' + (y - 36) + ' H' + (x + w - 8) + ' L' + (x + w - 18) + ' ' + (y - 28) + ' H' + (x - w + 18) + ' Z" fill="#5a6068"/>';
    return s;
  }
  // a whole raw chicken, breast up, legs raised; o.cooked browns it, o.rot tilts it, o.steam adds steam
  function chicken(x, y, sc, t, o) {
    o = o || {}; var c = o.cooked ? "url(#gCooked)" : "url(#gRaw)", ed = o.cooked ? "#7a4a1a" : "#c98a76", g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.rot || 0) + ') scale(' + sc + ')">';
    [-1, 1].forEach(function (e) {
      g += '<path d="M' + (e * 20) + ' -30 C' + (e * 34) + ' -60 ' + (e * 44) + ' -74 ' + (e * 52) + ' -84 C' + (e * 60) + ' -90 ' + (e * 70) + ' -84 ' + (e * 64) + ' -74 C' + (e * 58) + ' -62 ' + (e * 52) + ' -46 ' + (e * 48) + ' -24 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="2.6"/>';
      g += '<circle cx="' + (e * 62) + '" cy="-86" r="7" fill="' + (o.cooked ? "#f4e2c0" : "#f7e3d4") + '" stroke="' + INK + '" stroke-width="2"/>';
    });
    g += '<path d="M-74 4 C-76 -34 -40 -50 0 -50 C40 -50 76 -34 74 4 C72 34 40 44 0 44 C-40 44 -72 34 -74 4 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    g += '<path d="M-66 10 C-54 26 -34 30 -16 24 M66 10 C54 26 34 30 16 24" stroke="' + ed + '" stroke-width="2.4" fill="none"/><path d="M0 -46 C-5 -10 -5 18 0 40" stroke="' + ed + '" stroke-width="2" fill="none"/>';
    if (!o.cooked) for (var i = 0; i < 26; i++) g += '<circle cx="' + f(-56 + hash(i) * 112) + '" cy="' + f(-36 + hash(i + 4) * 66) + '" r="1.5" fill="' + ed + '" opacity=".7"/>';
    g += '<ellipse cx="-30" cy="-26" rx="22" ry="9" fill="#fff" opacity=".35" transform="rotate(-14 -30 -26)"/>';
    if (o.steam) for (var k = 0; k < 4; k++) { var ph = (t * 0.6 + k / 4) % 1; g += '<path d="M' + (-36 + k * 24) + ' ' + f(-56 - ph * 70) + ' q10 -12 0 -24 q-10 -12 0 -24" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="' + f(0.8 * Math.sin(ph * Math.PI)) + '"/>'; }
    return g + '</g>';
  }
  // a germ with a face: kind "s" = salmonella (rod with flagella, red), "c" = campylobacter (spiral, purple); o.dead = X eyes
  function germ(x, y, r, t, kind, o) {
    o = o || {}; var wob = Math.sin(t * 4 + x * 0.1), g = '<g transform="translate(' + f(x) + ' ' + f(y + wob * r * 0.15) + ') rotate(' + f(wob * 8 + (o.rot || 0)) + ') scale(' + f(r / 20) + ')"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : "") + '>';
    if (kind === "c") {
      var d = "M-30 0"; for (var a = 0; a <= 24; a++) { var xx = -30 + a * 2.5, yy = Math.sin(a * 0.52 + t * 6) * 9; d += " L" + f(xx) + " " + f(yy); }
      g += '<path d="' + d + '" stroke="' + INK + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + GERMC + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
      g += '<path d="M30 ' + f(Math.sin(12.5 + t * 6) * 9) + ' q10 -6 16 4" stroke="' + INK + '" stroke-width="1.6" fill="none"/>';
    } else {
      for (var k = 0; k < 6; k++) { var a0 = k / 6 * Math.PI * 2, bx = Math.cos(a0) * 26, by = Math.sin(a0) * 14; g += '<path d="M' + f(bx) + ' ' + f(by) + ' q' + f(Math.cos(a0) * 10 + Math.sin(t * 8 + k) * 5) + ' ' + f(Math.sin(a0) * 10 + 6) + ' ' + f(Math.cos(a0) * 18) + ' ' + f(Math.sin(a0) * 18) + '" stroke="' + INK + '" stroke-width="1.8" fill="none"/>'; }
      g += '<rect x="-28" y="-14" width="56" height="28" rx="14" fill="#e2604a" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="-12" cy="-7" rx="8" ry="3" fill="#fff" opacity=".4"/>';
    }
    if (o.dead) g += '<path d="M-10 -6 l6 6 m0 -6 l-6 6 M4 -6 l6 6 m0 -6 l-6 6" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
    else g += '<circle cx="-7" cy="-3" r="4.4" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><circle cx="7" cy="-3" r="4.4" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/><circle cx="-6" cy="-2" r="2" fill="' + INK + '"/><circle cx="8" cy="-2" r="2" fill="' + INK + '"/><path d="M-12 -10 l8 3 M12 -10 l-8 3" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M-5 6 q5 4 10 0" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
    return g + '</g>';
  }
  // a swarm of germs around (x,y) within radius rr; k (0..1) grows them in
  function swarm(x, y, rr, n, t, k, sz) { var s = ""; for (var i = 0; i < n; i++) { var kk = clamp(k * n - i); if (kk <= 0) continue; var a = hash(i * 3) * 6.28 + t * 0.3 * (i % 2 ? 1 : -1), d = rr * (0.3 + 0.7 * hash(i + 11)); s += germ(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, (sz || 10) * pop(kk), t + i, i % 2 ? "c" : "s"); } return s; }
  // green speckles of contamination on a surface strip (x0..x1 at y)
  function spots(x0, x1, y, n, t, k) { var s = ""; for (var i = 0; i < n; i++) { var kk = clamp(k * n - i); if (kk <= 0) continue; var x = lerp(x0, x1, hash(i * 7)), yy = y + (hash(i + 3) - 0.5) * 10; s += '<circle cx="' + f(x) + '" cy="' + f(yy) + '" r="' + f((3 + hash(i) * 3) * pop(kk) * (1 + 0.15 * Math.sin(t * 5 + i))) + '" fill="' + GERMS + '" stroke="#2e6a3a" stroke-width="1" opacity=".9"/>'; } return s; }
  // splash droplets flying out of (x,y) in arcs; reach = how far, k = strength 0..1, dirty = germs ride in them
  function splash(t, x, y, n, reach, k, dirty) {
    var s = ""; if (k <= 0) return s;
    for (var i = 0; i < n; i++) { var ph = (t * (0.8 + hash(i) * 0.5) + hash(i + 9)) % 1, side = i % 2 ? 1 : -1, vx = side * reach * (0.3 + 0.7 * hash(i + 2)), vy = -reach * (0.35 + 0.5 * hash(i + 5)), px = x + vx * ph, py = y + vy * ph + reach * 1.1 * ph * ph, r = 2.4 + hash(i + 1) * 3;
      s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r) + '" fill="' + DROP + '" stroke="#2f7fb8" stroke-width="1" opacity="' + f(k * (1 - ph * 0.7)) + '"/>';
      if (dirty && i % 2 === 0) s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(r * 0.45) + '" fill="' + GERMS + '" opacity="' + f(k * (1 - ph * 0.7)) + '"/>'; }
    return s;
  }
  function plate(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><ellipse cx="0" cy="0" rx="40" ry="11" fill="#f4f6f8" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="0" cy="-1" rx="26" ry="6" fill="none" stroke="#c9ced4" stroke-width="2"/></g>'; }
  function plates(x, y) { return plate(x, y) + plate(x, y - 7) + plate(x, y - 14); }
  // a salad bowl: lettuce, tomato slices, cucumber
  function salad(x, y, s, t) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">';
    for (var i = 0; i < 7; i++) { var lx = -40 + i * 13, ly = -14 - Math.abs(Math.sin(i * 1.3)) * 10 + Math.sin(t * 2 + i) * 1.2; g += '<path d="M' + lx + ' -2 C' + (lx - 10) + ' ' + ly + ' ' + (lx + 4) + ' ' + (ly - 14) + ' ' + (lx + 12) + ' ' + (ly - 4) + ' C' + (lx + 18) + ' ' + ly + ' ' + (lx + 14) + ' -4 ' + (lx + 8) + ' -2 Z" fill="' + (i % 2 ? "#6fb84a" : "#8fd060") + '" stroke="#2e6a3a" stroke-width="1.6"/>'; }
    g += '<circle cx="-16" cy="-12" r="8" fill="#e2453a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="14" cy="-16" r="7" fill="#e2453a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="0" cy="-8" r="6" fill="#d9f0b0" stroke="#2e6a3a" stroke-width="1.6"/>';
    g += '<path d="M-52 -4 H52 C50 26 30 36 0 36 C-30 36 -50 26 -52 -4 Z" fill="#f2a93b" stroke="' + INK + '" stroke-width="2.6"/><path d="M-44 6 C-30 12 30 12 44 6" stroke="#fff" stroke-width="2.4" opacity=".5" fill="none"/>';
    return g + '</g>';
  }
  function board(x, y, w, col, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="' + (-w / 2) + '" y="-12" width="' + w + '" height="24" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2.6"/><circle cx="' + (w / 2 - 14) + '" cy="0" r="4" fill="' + WALL + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (-w / 2 + 10) + ' -6 H' + (w / 2 - 30) + '" stroke="#fff" stroke-width="2" opacity=".4"/></g>'; }
  function knife(x, y, ang, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ') scale(' + (s || 1) + ')"><path d="M0 -5 H70 Q86 -5 92 4 H0 Z" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><rect x="-46" y="-7" width="46" height="14" rx="5" fill="#3a2a1e" stroke="' + INK + '" stroke-width="2"/><circle cx="-34" cy="0" r="2" fill="#c9ced4"/><circle cx="-14" cy="0" r="2" fill="#c9ced4"/></g>'; }
  // a probe thermometer: tip at (x,y), reading v in °C
  function thermo(x, y, v, ang) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang || 0) + ')"><rect x="-3" y="-90" width="6" height="90" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/><rect x="-34" y="-142" width="68" height="54" rx="12" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/><rect x="-26" y="-134" width="52" height="30" rx="5" fill="#d9f0c8" stroke="' + INK + '" stroke-width="1.6"/><text x="0" y="-111" text-anchor="middle" style="font:800 20px Noto Sans;fill:#1c1c1c">' + Math.round(v) + '°</text></g>'; }
  function soap(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-18" y="-50" width="36" height="50" rx="8" fill="#5bbfd8" stroke="' + INK + '" stroke-width="2.4"/><rect x="-4" y="-64" width="8" height="14" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.8"/><path d="M-4 -64 h22 v6 h-6" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.8"/><rect x="-12" y="-36" width="24" height="16" rx="3" fill="#fff" opacity=".7"/></g>'; }
  function foam(x, y, rr, n, t) { var s = ""; for (var i = 0; i < n; i++) { var ph = (t * 0.5 + hash(i)) % 1, a = hash(i + 2) * 6.28, d = rr * hash(i + 5), bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * 0.6 - ph * 30, r = 3 + hash(i + 8) * 7; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(r) + '" fill="#fff" fill-opacity=".75" stroke="#7fb7e0" stroke-width="1.2" opacity="' + f(1 - ph * 0.8) + '"/>'; } return s; }
  // two hands rubbing together under soap: sp = rubbing speed
  function hands(x, y, t, s) { var r = Math.sin(t * 9) * 8, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">'; g += '<rect x="-90" y="20" width="60" height="34" rx="14" fill="#3f8f6f" stroke="' + INK + '" stroke-width="2.6" transform="rotate(-20 -60 37)"/><rect x="30" y="20" width="60" height="34" rx="14" fill="#3f8f6f" stroke="' + INK + '" stroke-width="2.6" transform="rotate(20 60 37)"/>'; g += '<path d="M' + f(-50 + r) + ' 30 C' + f(-40 + r) + ' -30 ' + f(10 + r) + ' -40 ' + f(14 + r) + ' 0 C' + f(16 + r) + ' 30 ' + f(-20 + r) + ' 44 ' + f(-50 + r) + ' 30 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M' + f(50 - r) + ' 30 C' + f(40 - r) + ' -30 ' + f(-10 - r) + ' -40 ' + f(-14 - r) + ' 0 C' + f(-16 - r) + ' 30 ' + f(20 - r) + ' 44 ' + f(50 - r) + ' 30 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>'; return g + '</g>'; }
  var SKIN = "#f3c9a8";
  // a timer dial that sweeps to v (0..1) with a number in the middle
  function timer(x, y, r, v, label) { var a = clamp(v) * Math.PI * 2, ex = x + Math.sin(a) * r * 0.82, ey = y - Math.cos(a) * r * 0.82; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>' + (v > 0 ? '<path d="M' + x + ' ' + y + ' L' + x + ' ' + f(y - r * 0.82) + ' A' + f(r * 0.82) + ' ' + f(r * 0.82) + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(ex) + ' ' + f(ey) + ' Z" fill="#7fd08a" opacity=".8"/>' : "") + '<rect x="' + (x - 8) + '" y="' + (y - r - 12) + '" width="16" height="10" rx="2" fill="' + INK + '"/>' + T(label, x, y + 9, r * 0.6, "#fff"); }
  // a percent ring (donut chart) that fills to p (0..1)
  function ring(x, y, r, p, label, col) { var a = clamp(p) * Math.PI * 2 - 0.0001, ex = x + Math.sin(a) * r, ey = y - Math.cos(a) * r; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="' + f(r * 0.42) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#e9e4d8" stroke-width="' + f(r * 0.32) + '"/>' + (p > 0 ? '<path d="M' + x + ' ' + (y - r) + ' A' + r + ' ' + r + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + f(ex) + ' ' + f(ey) + '" fill="none" stroke="' + (col || RED) + '" stroke-width="' + f(r * 0.32) + '"/>' : "") + T(label, x, y + r * 0.24, r * 0.62, "#fff"); }
  function sponge(x, y, t, s) { var dx = Math.sin(t * 10) * 16; return '<g transform="translate(' + f(x + dx) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-26" y="-18" width="52" height="12" rx="4" fill="#3aa05a" stroke="' + INK + '" stroke-width="2"/><rect x="-26" y="-8" width="52" height="16" rx="4" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/><circle cx="-12" cy="0" r="2" fill="#c9a020"/><circle cx="6" cy="2" r="2" fill="#c9a020"/></g>'; }
  function sparkle(x, y, r, t) { var k = 0.6 + 0.4 * Math.sin(t * 6 + x), d = "M" + x + " " + f(y - r * k) + " Q" + x + " " + y + " " + f(x + r * k) + " " + y + " Q" + x + " " + y + " " + x + " " + f(y + r * k) + " Q" + x + " " + y + " " + f(x - r * k) + " " + y + " Q" + x + " " + y + " " + x + " " + f(y - r * k) + " Z"; return '<path d="' + d + '" fill="#fff" stroke="#7fb7e0" stroke-width="1.4"/>'; }
  function flagUK(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-45" y="-27" width="90" height="54" fill="#1f3f8f" stroke="' + INK + '" stroke-width="2.4"/><path d="M-45 -27 L45 27 M45 -27 L-45 27" stroke="#fff" stroke-width="10"/><path d="M-45 -27 L45 27 M45 -27 L-45 27" stroke="#c8202e" stroke-width="4"/><path d="M0 -27 V27 M-45 0 H45" stroke="#fff" stroke-width="16"/><path d="M0 -27 V27 M-45 0 H45" stroke="#c8202e" stroke-width="9"/></g>'; }
  function flagUS(x, y, s) { var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-45" y="-27" width="90" height="54" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>'; for (var i = 0; i < 7; i++) g += '<rect x="-45" y="' + f(-27 + i * 7.7) + '" width="90" height="3.9" fill="#c8202e"/>'; g += '<rect x="-45" y="-27" width="38" height="27" fill="#1f3f8f"/>'; for (var j = 0; j < 12; j++) g += '<circle cx="' + (-40 + (j % 4) * 9.5) + '" cy="' + (-21 + Math.floor(j / 4) * 8) + '" r="1.6" fill="#fff"/>'; return g + '<rect x="-45" y="-27" width="90" height="54" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>'; }
  // a live hen, side view, with the gut drawn on her (germs live there)
  function hen(x, y, s, t) {
    var b = Math.sin(t * 3) * 3, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M-20 60 V96 M20 60 V96 M-20 96 l-12 4 M-20 96 l10 4 M20 96 l-12 4 M20 96 l10 4" stroke="#e2a020" stroke-width="5" stroke-linecap="round"/>';
    g += '<path d="M-90 -10 C-110 -40 -100 -70 -84 -60 C-80 -40 -70 -30 -60 -26 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.6"/>';
    g += '<path d="M-80 10 C-80 -40 -20 -50 30 -40 C50 -60 60 -90 76 ' + f(-90 + b) + ' C96 ' + f(-90 + b) + ' 100 -66 92 -50 C84 -20 90 30 40 60 C0 76 -80 60 -80 10 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/>';
    g += '<path d="M72 ' + f(-96 + b) + ' q4 -14 12 -6 q6 -12 12 0 q8 -6 6 8" fill="#d8352a" stroke="' + INK + '" stroke-width="2"/><path d="M96 ' + f(-76 + b) + ' l16 6 l-14 6 Z" fill="#f2a020" stroke="' + INK + '" stroke-width="2"/><path d="M92 ' + f(-66 + b) + ' q4 12 -4 14" fill="#d8352a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="84" cy="' + f(-78 + b) + '" r="3.4" fill="' + INK + '"/>';
    g += '<path d="M-40 0 C-20 -24 10 -24 20 -6 C30 12 0 20 -14 10 C-30 0 -10 -10 4 -4" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-40 0 C-20 -24 10 -24 20 -6 C30 12 0 20 -14 10 C-30 0 -10 -10 4 -4" stroke="#f2a0a0" stroke-width="5" fill="none" stroke-linecap="round"/>';
    return g + '</g>';
  }
  // a tray of packed chickens at the shop
  function tray(x, y, t, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><rect x="-60" y="-10" width="120" height="30" rx="6" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2.4"/>' + chicken(0, 0, 0.62, t) + '<rect x="-60" y="-50" width="120" height="70" rx="8" fill="#d9eef7" fill-opacity=".25" stroke="#7fb7e0" stroke-width="2"/></g>'; }
  function bottle(x, y, col, label, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-18 0 V-60 Q-18 -76 -8 -82 V-100 H8 V-82 Q18 -76 18 -60 V0 Z" fill="' + col + '" fill-opacity=".85" stroke="' + INK + '" stroke-width="2.6"/><rect x="-10" y="-110" width="20" height="12" rx="3" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><rect x="-16" y="-50" width="32" height="26" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.6"/>' + T(label, 0, -32, 11, INK, 800).replace('stroke-width:1.2', 'stroke-width:0') + '</g>'; }
  function lemon(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><circle r="24" fill="#f7e04a" stroke="' + INK + '" stroke-width="2.6"/><circle r="17" fill="#fdf6b0"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { var a = i / 6 * Math.PI * 2; return '<path d="M0 0 L' + f(Math.cos(a) * 17) + ' ' + f(Math.sin(a) * 17) + '" stroke="#e8c830" stroke-width="2"/>'; }).join("") + '</g>'; }
  function flour(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-30 0 L-34 -70 L-24 -80 H24 L34 -70 L30 0 Z" fill="#f4efe2" stroke="' + INK + '" stroke-width="2.6"/><path d="M-24 -80 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8" stroke="' + INK + '" stroke-width="2" fill="none"/>' + T("دقيق", 0, -32, 14, "#c23a26", 900) + '</g>'; }
  // a frying pan on the stove with the chicken in it
  function pan(x, y, t, cooked) { return '<path d="M' + (x + 70) + ' ' + (y - 40) + ' L' + (x + 150) + ' ' + (y - 52) + '" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M' + (x + 70) + ' ' + (y - 40) + ' L' + (x + 150) + ' ' + (y - 52) + '" stroke="#3a3d42" stroke-width="7" stroke-linecap="round"/><path d="M' + (x - 80) + ' ' + (y - 46) + ' H' + (x + 80) + ' L' + (x + 68) + ' ' + (y - 28) + ' H' + (x - 68) + ' Z" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.6"/>' + chicken(x, y - 70, 0.6, t, { cooked: cooked, steam: true }); }
  function shirt(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><path d="M-40 -40 L-14 -50 Q0 -40 14 -50 L40 -40 L56 -14 L36 -6 V40 H-36 V-6 L-56 -14 Z" fill="#5b8fd8" stroke="' + INK + '" stroke-width="2.6"/></g>'; }
  function towel(x, y, t, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 6) * 6) + ') scale(' + (s || 1) + ')"><path d="M-30 -24 H30 L26 24 H-26 Z" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2.4"/><path d="M-20 -10 H20 M-18 4 H18" stroke="#d9d4c8" stroke-width="2"/></g>'; }
  function bin(x, y, open) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M-30 -60 H30 L24 0 H-24 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="2.6"/><path d="M-14 -50 V-10 M0 -50 V-10 M14 -50 V-10" stroke="#3a3d42" stroke-width="2"/><g transform="rotate(' + f(-50 * (open || 0)) + ' -32 -60)"><rect x="-34" y="-68" width="68" height="10" rx="3" fill="#3a3d42" stroke="' + INK + '" stroke-width="2"/></g></g>'; }
  function eyeX(x, y, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ')"><path d="M-36 0 Q0 -26 36 0 Q0 26 -36 0 Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle r="11" fill="#5a3a20"/><circle r="5" fill="' + INK + '"/></g>' + cross(x + 34, y - 18, 0.6, k); }
  function hl(x, y, r, t, col) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r + 3 * Math.sin(t * 5)) + '" fill="none" stroke="' + (col || "#f2c230") + '" stroke-width="4" stroke-dasharray="9 6" stroke-dashoffset="' + f(t * 24) + '"/>'; }
  function dark(c) { return '<rect x="-400" y="-300" width="1500" height="1000" fill="' + (c || "#1f2a38") + '"/>'; }
  function lens(x, y, r, inner, t) { var id = "ln" + (++CLIPN); return '<clipPath id="' + id + '"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/></clipPath><g clip-path="url(#' + id + ')"><rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + (2 * r) + '" height="' + (2 * r) + '" fill="url(#gRaw)"/>' + inner + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="9"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#c9ced4" stroke-width="5"/><path d="M' + f(x + r * 0.72) + ' ' + f(y + r * 0.72) + ' L' + f(x + r * 1.25) + ' ' + f(y + r * 1.25) + '" stroke="' + INK + '" stroke-width="18" stroke-linecap="round"/><path d="M' + f(x + r * 0.72) + ' ' + f(y + r * 0.72) + ' L' + f(x + r * 1.25) + ' ' + f(y + r * 1.25) + '" stroke="#3a2a1e" stroke-width="12" stroke-linecap="round"/>'; }
  var CAM = function (x0, y0, z0, x1, y1, z1, e) { return function (u, d) { var k = e ? ease(clamp(u / d)) : clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; };

  // 0 — stop! before you put the chicken under the tap and wash it, listen
  shot(0, CAM(300, 180, 1.25, 330, 180, 1.0), function (u, d, t) {
    var mv = 40 * ease(clamp(u / 1.0)), stopK = clamp((u - 1.0) * 3), s = kitchen(t, { winX: 120 }) + sink(330, 250, t, { on: true });
    s += person(500, 150, 0.55, t, stopK > 0 ? "shock" : "happy", { arms: "tilt", look: -1 }) + chicken(lerp(400, 360, ease(clamp(u / 1.0))) + (stopK > 0 ? Math.sin(t * 30) * 2 : 0), 196, 0.55, t, { rot: -10 });
    return s + noSign(330, 160, 56, (u - 1.0) / 1.2) + tag("استنى!", 330, 60, u, 0.9, -3, 36, "#f2a0a0") + tag("اسمع الأول", 140, 320, u, 2.2, 3, 20);
  });
  // 1 — we all grew up washing chicken well, but that washing can make the whole house sick
  shot(1, CAM(240, 180, 1.1, 360, 175, 1.0, true), function (u, d, t) {
    var sick = clamp((u - 2.2) * 1.5), s = kitchen(t, { winX: 520 }) + sink(200, 250, t, { on: true }) + chicken(200, 200, 0.5, t, { rot: Math.sin(t * 5) * 10 }) + splash(t, 200, 205, 12, 70, 1, sick > 0);
    s += person(330, 150, 0.52, t, sick > 0 ? "worry" : "happy", { arms: "tilt", col: "#c23a26", look: -1 });
    [[470, 175, "#2f6f9f"], [540, 190, "#e2b035"], [600, 175, "#3aa05a"]].forEach(function (p, i) { var k = clamp(sick * 3 - i); if (k > 0) s += person(p[0], p[1], 0.36 * pop(k), t + i, "dizzy", { col: p[2] }); });
    return s + tag("اتربينا عليها", 200, 60, u, 0.3, -3, 22) + tag("البيت كله!", 540, 80, u, 2.4, 3, 24, "#f2a0a0");
  });
  // 2 — brand
  shot(2, CAM(300, 190, 1.0, 340, 170, 1.15), function (u, d, t) {
    return kitchen(t) + sink(320, 250, t, { on: false }) + chicken(320, 200, 0.6, t, { rot: Math.sin(t * 2) * 4 }) + qmark(190, 140, t, 60) + qmark(460, 120, t + 1, 54) + tag("إيه الحكاية؟", 320, 66, u, 0.1, -3, 30);
  });
  // 3 — raw chicken carries invisible bacteria, the best known are salmonella and campylobacter
  shot(3, CAM(320, 180, 1.0, 320, 180, 1.12, true), function (u, d, t) {
    var lz = clamp((u - 0.5) / 0.8), s = dark("#24303e") + chicken(200, 220, 1.4, t);
    if (lz > 0) s += lens(lerp(260, 400, ease(lz)), 170, 110 * ease(lz), germ(lerp(260, 400, lz) - 40, 150, 26, t, "s") + germ(lerp(260, 400, lz) + 40, 200, 26, t + 1, "c") + germ(lerp(260, 400, lz) + 30, 120, 16, t + 2, "s") + germ(lerp(260, 400, lz) - 50, 210, 16, t + 3, "c"), t);
    return s + tag("مش باينة", 160, 60, u, 0.3, -3, 22) + tag("السالمونيلا", 540, 70, u, 1.6, 3, 20, "#f2a0a0") + tag("الكامبيلوباكتر", 520, 320, u, 2.6, -3, 18, "#d9b0f0");
  });
  // 4 — they live in the chicken's gut and reach the meat during slaughter and cleaning
  shot(4, CAM(260, 190, 1.1, 360, 180, 1.0, true), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="url(#sky-day)"/>' + clouds(t, 10, 20, 3, 0.8) + grass(t, 300, "grass-day", "#4f7f3a") + hen(170, 200, 1.0, t) + swarm(160, 200, 40, 6, t, clamp((u - 0.4) * 1.5), 8);
    s += arrow(290, 200, 400, 200, "#f2c230", 5, clamp((u - 1.8) * 1.2)) + (u > 2.2 ? '<rect x="400" y="200" width="200" height="110" rx="10" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/>' + chicken(500, 270, 0.7, t) + swarm(500, 250, 50, 5, t, clamp((u - 2.4) * 1.5), 8) : "");
    return s + tag("في الأمعاء", 170, 50, u, 0.5, -3, 22) + tag("وقت الدبح", 500, 140, u, 2.2, 3, 22);
  });
  // 5 — in Britain they found campylobacter on more than half the chicken in the shops
  shot(5, CAM(320, 170, 1.12, 320, 185, 1.0), function (u, d, t) {
    var s = dark("#2a3442"), p = 0.73 * ease(clamp((u - 1.0) / 1.6));
    s += flagUK(120, 80, 1.1);
    for (var i = 0; i < 6; i++) { var x = 70 + (i % 3) * 120, y = 220 + Math.floor(i / 3) * 90; s += tray(x, y, t + i, 0.85); if (hash(i + 2) < 0.75 || i < 4) s += germ(x + 30, y - 40, 11 * pop(clamp((u - 1.2 - i * 0.2) * 2)), t + i, "c"); }
    s += ring(520, 190, 70, p, Math.round(p * 100) + "%", GERMC);
    return s + tag("بريطانيا", 120, 140, u, 0.3, -3, 20) + tag("أكتر من النص", 520, 320, u, 2.2, 3, 22, "#d9b0f0");
  });
  // 6 — plain water doesn't kill them, it just moves them from place to place
  shot(6, CAM(320, 190, 1.0, 330, 175, 1.1), function (u, d, t) {
    var s = kitchen(t, { win: false }) + sink(170, 250, t, { on: true }) + chicken(170, 200, 0.5, t) + plates(480, 240);
    for (var k = 0; k < 3; k++) { var ph = clamp(((u - 0.6) * 0.5 + k / 3) % 1), x = lerp(200, 470, ph), y = 190 - Math.sin(ph * Math.PI) * 120; if (u > 0.6) s += '<path d="M' + f(x) + ' ' + f(y - 20) + ' C' + f(x + 14) + ' ' + f(y) + ' ' + f(x + 14) + ' ' + f(y + 14) + ' ' + f(x) + ' ' + f(y + 14) + ' C' + f(x - 14) + ' ' + f(y + 14) + ' ' + f(x - 14) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - 20) + ' Z" fill="' + DROP + '" stroke="#2f7fb8" stroke-width="2"/>' + germ(x, y + 2, 7, t + k, k % 2 ? "c" : "s"); }
    s += spots(450, 510, 226, 6, t, clamp((u - 1.6) * 0.8));
    return s + tag("المية مش بتموّتها", 200, 60, u, 0.3, -3, 20, "#f2a0a0") + tag("بتنقلها!", 480, 120, u, 1.8, 3, 26);
  });
  // 7 — when the tap water hits the chicken, tiny droplets spray around you
  shot(7, CAM(320, 160, 1.5, 320, 175, 1.25, true), function (u, d, t) {
    var s = kitchen(t, { win: false }) + sink(320, 250, t, { on: true }) + chicken(320, 202, 0.6, t, { rot: Math.sin(t * 4) * 6 }) + splash(t, 320, 196, 26, 110, clamp(u * 2), true);
    return s + tag("نقط صغيرة جدًا", 320, 60, u, 0.8, -3, 22, "#bfe0ff");
  });
  // 8 — the droplets fly farther than you think, and you won't see them
  shot(8, CAM(320, 180, 1.2, 320, 180, 0.9), function (u, d, t) {
    var s = kitchen(t) + sink(320, 250, t, { on: true }) + chicken(320, 202, 0.55, t) + splash(t, 320, 196, 34, 230, 1, true);
    s += '<path d="M90 250 Q320 30 550 250" stroke="#f2c230" stroke-width="3" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '" fill="none" opacity="' + f(clamp((u - 0.5) * 2)) + '"/>';
    return s + tag("أبعد ما تتخيل", 320, 46, u, 0.4, -3, 22) + eyeX(540, 110, (u - 2.2) / 1.2);
  });
  // 9 — onto the counter, the plates, the vegetables next to you, and your clothes
  shot(9, CAM(330, 190, 0.95, 330, 180, 1.05), function (u, d, t) {
    var s = kitchen(t, { winX: 330 }) + sink(330, 250, t, { on: true }) + chicken(330, 202, 0.5, t) + splash(t, 330, 196, 20, 150, 1, true);
    s += plates(140, 244) + salad(520, 240, 0.8, t) + shirt(40, 160, 0.7) + spots(200, 270, 248, 6, t, clamp((u - 0.2) * 1.5)) + spots(400, 460, 248, 6, t, clamp((u - 0.2) * 1.5));
    s += spots(110, 170, 226, 5, t, clamp((u - 1.0) * 1.5)) + spots(490, 550, 214, 5, t, clamp((u - 1.8) * 1.5)) + spots(20, 60, 160, 5, t, clamp((u - 2.8) * 1.5));
    return s + tag("الرخامة", 240, 300, u, 0.2, -3, 18) + tag("الأطباق", 140, 180, u, 1.0, 3, 18) + tag("الخضار", 520, 170, u, 1.8, -3, 18) + tag("هدومك", 40, 90, u, 2.8, 3, 18);
  });
  // 10 — in the US in 2019 they tested people cooking in an ordinary kitchen
  shot(10, CAM(300, 180, 1.1, 340, 180, 1.0, true), function (u, d, t) {
    var s = kitchen(t, { win: false }) + flagUS(110, 90, 1.1) + sink(380, 250, t, { on: true }) + chicken(380, 202, 0.45, t);
    for (var i = 0; i < 3; i++) s += person(250 + i * 140 - (i === 1 ? 0 : 0), 150, 0.4, t + i, "n", { col: ["#c23a26", "#2f6f9f", "#e2b035"][i], arms: i === 1 ? "tilt" : "down" });
    s += '<g transform="translate(560 120) rotate(' + f(Math.sin(t * 2) * 4) + ')">' + R(-34, -44, 68, 88, "#f4f1e8", 2.6, 6) + R(-14, -50, 28, 12, "#8a6a3a", 2, 3) + '<path d="M-22 -20 H22 M-22 -4 H22 M-22 12 H10" stroke="#9a958c" stroke-width="3"/></g>';
    return s + tag("أمريكا", 110, 150, u, 0.3, -3, 20) + tag("2019", 330, 50, u, 1.4, 3, 26) + tag("تجربة", 560, 200, u, 2.4, -3, 20);
  });
  // 11 — 60% of those who washed the chicken had bacteria in the sink afterwards
  shot(11, CAM(320, 190, 1.0, 320, 175, 1.1), function (u, d, t) {
    var p = 0.6 * ease(clamp((u - 0.3) / 1.6)), s = kitchen(t, { win: false }) + sink(200, 250, t, { w: 130 }) + swarm(200, 228, 80, 10, t, clamp((u - 0.8) * 0.8), 10);
    s += ring(500, 160, 76, p, Math.round(p * 100) + "%");
    return s + tag("في الحوض", 200, 70, u, 1.2, -3, 24);
  });
  // 12 — even after they cleaned the sink, 14% still had bacteria
  shot(12, CAM(240, 190, 1.1, 320, 180, 1.0, true), function (u, d, t) {
    var cl = clamp((u - 0.2) / 1.6), p = 0.14 * ease(clamp((u - 1.8) / 1.0)), s = kitchen(t, { win: false }) + sink(200, 250, t, { w: 130 });
    s += swarm(200, 228, 80, 10, t, 1 - cl * 0.8, 10) + (cl < 1 ? sponge(200, 226, t, 1.2) : "") + (cl > 0.5 ? sparkle(120, 200, 10, t) + sparkle(280, 196, 8, t + 1) : "");
    s += ring(500, 160, 70, p, Math.round(p * 100) + "%");
    return s + tag("نضفوا", 200, 70, u, 0.2, -3, 22, "#bfe0ff") + tag("ولسه!", 500, 300, u, 2.2, 3, 26, "#f2a0a0");
  });
  // 13 — about a quarter of them moved the bacteria onto the salad they made next
  shot(13, CAM(320, 180, 1.1, 320, 185, 1.0), function (u, d, t) {
    var p = 0.26 * ease(clamp((u - 0.4) / 1.4)), s = kitchen(t, { win: false }) + board(220, 246, 180, "#8fd060") + salad(220, 230, 1.3, t) + swarm(220, 180, 50, 7, t, clamp((u - 1.2) * 0.8), 9);
    s += ring(500, 160, 70, p, Math.round(p * 100) + "%", GERMS);
    return s + tag("السلطة", 220, 60, u, 0.4, -3, 24) + tag("حوالي ربعهم", 500, 300, u, 1.8, 3, 22);
  });
  // 14 — salad never goes on the fire, so the bacteria go into your stomach as they are
  shot(14, CAM(320, 170, 1.0, 320, 175, 1.1), function (u, d, t) {
    var s = kitchen(t, { win: false }) + salad(170, 240, 1.1, t) + cross(170, 120, 0.9, (u - 0.3) / 1.0) + flame(170, 150, 10, t, true).replace(/opacity=".92"/g, 'opacity=".35"');
    s += person(450, 120, 0.7, t, u > 2.2 ? "dizzy" : "happy", { col: "#2f6f9f" }) + '<ellipse cx="450" cy="230" rx="38" ry="30" fill="#f2c1a6" stroke="' + INK + '" stroke-width="2.6" opacity="' + f(clamp((u - 1.2) * 2)) + '"/>' + swarm(450, 230, 26, 6, t, clamp((u - 1.4) * 1.2), 7);
    for (var k = 0; k < 3; k++) { var ph = (t * 0.6 + k / 3) % 1; s += germ(lerp(220, 430, ph), 200 - Math.sin(ph * Math.PI) * 60, 7, t + k, k % 2 ? "c" : "s", { op: u > 0.8 ? 1 : 0 }); }
    return s + tag("مش بتدخل النار", 170, 60, u, 0.3, -3, 20, "#f2a0a0") + tag("لبطنك!", 450, 340, u, 1.6, 3, 24);
  });
  // 15 — campylobacter can make you sick with just a few hundred bacteria
  shot(15, CAM(320, 180, 1.0, 320, 180, 1.2, true), function (u, d, t) {
    var s = dark("#24303e") + '<circle cx="160" cy="200" r="' + f(6 + Math.sin(t * 4)) + '" fill="' + DROP + '" stroke="#fff" stroke-width="1.6"/>' + hl(160, 200, 20, t);
    s += arrow(190, 190, 300, 160, "#f2c230", 4, clamp((u - 0.5) * 2)) + '<circle cx="440" cy="170" r="' + f(130 * ease(clamp((u - 0.6) / 0.8))) + '" fill="' + DROP + '" fill-opacity=".25" stroke="#fff" stroke-width="3"/>';
    for (var i = 0; i < 18; i++) { var a = hash(i) * 6.28 + t * 0.2, r = 100 * Math.sqrt(hash(i + 3)); s += germ(440 + Math.cos(a) * r, 170 + Math.sin(a) * r * 0.85, 9 * pop(clamp((u - 1.2) * 2 - i * 0.08)), t + i, "c"); }
    return s + tag("نقطة صغيرة", 160, 290, u, 0.3, -3, 20) + tag("كام مية بس!", 440, 40, u, 1.8, 3, 26, "#d9b0f0");
  });
  // 16 — diarrhoea, vomiting and fever, worse for children, pregnant women and the elderly
  shot(16, CAM(250, 180, 1.12, 330, 180, 1.0, true), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#f4efe2"/>' + R(60, 220, 260, 40, "#8fb6cf", 2.6, 10) + R(50, 200, 40, 80, "#c9a06e", 2.4, 6);
    s += person(170, 150, 0.5, t, "dizzy", { col: "#9ac7a0" }) + '<g transform="translate(200 146) rotate(20)"><rect x="0" y="-3" width="40" height="6" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="40" cy="0" r="4" fill="' + RED + '"/></g>';
    s += tag("إسهال", 90, 60, u, 0.2, -3, 18) + tag("ترجيع", 190, 40, u, 0.6, 3, 18) + tag("سخونية", 290, 70, u, 1.0, -3, 18, "#f2a0a0");
    [[430, "طفل", 0.3, "#e2b035"], [510, "حامل", 0.42, "#c86a9a"], [590, "كبير في السن", 0.42, "#8a7a6a"]].forEach(function (p, i) { var k = clamp((u - 1.8 - i * 0.4) * 2); if (k <= 0) return; s += person(p[0], 200 - p[2] * 60, p[2] * pop(k), t + i, "worry", { col: p[3] }); if (i === 1) s += '<ellipse cx="' + (p[0] + 14) + '" cy="' + f(250) + '" rx="14" ry="18" fill="' + p[3] + '" stroke="' + INK + '" stroke-width="2"/>'; if (i === 2) s += '<path d="M' + (p[0] + 30) + ' 200 V300 M' + (p[0] + 30) + ' 200 q0 -10 -10 -10" stroke="#5a3a20" stroke-width="5" fill="none" stroke-linecap="round"/>'; s += T(p[1], p[0], 330, 14, "#f2c230", 800); });
    return s;
  });
  // 17 — and the vinegar, lemon and flour we wash with? they remove the smell, but don't kill all the bacteria
  shot(17, CAM(320, 180, 1.0, 320, 175, 1.08), function (u, d, t) {
    var s = kitchen(t, { win: false }) + bottle(110, 250, "#f4e6b0", "خل") + lemon(200, 236, 1.0) + flour(290, 250, 1.0);
    s += chicken(480, 220, 0.75, t) + germ(450, 190, 14, t, "s") + germ(510, 200, 14, t + 1, "c") + germ(480, 236, 12, t + 2, "s");
    for (var k = 0; k < 3; k++) { var ph = (t * 0.7 + k / 3) % 1; s += '<path d="M' + (450 + k * 30) + ' ' + f(160 - ph * 50) + ' q8 -10 0 -20" stroke="#9a958c" stroke-width="3" fill="none" opacity="' + f(clamp((1.8 - u) * 2) * (1 - ph)) + '"/>'; }
    return s + check(380, 80, 0.8, (u - 1.6) / 1.0) + T("الريحة", 380, 130, 14, "#3aa05a", 800).replace("fill:#3aa05a", "fill:#3aa05a") + cross(560, 80, 0.8, (u - 2.8) / 1.0) + (u > 2.8 ? T("البكتيريا", 560, 130, 14, "#f2a0a0", 800) : "") + tag("خل وليمون ودقيق؟", 200, 60, u, 0.2, -3, 18);
  });
  // 18 — what really kills the bacteria is the heat
  shot(18, CAM(320, 170, 1.15, 320, 180, 1.0, true), function (u, d, t) {
    var s = kitchen(t, { win: false }) + stove(320, 260, t, 14, true) + pan(320, 236, t, u > 1.6);
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + t * 0.5, k = clamp((u - 0.6 - i * 0.2) * 1.5); if (k >= 1) s += star(320 + Math.cos(a) * 110, 140 + Math.sin(a) * 50, 10, t, "#ffe46a"); else s += germ(320 + Math.cos(a) * 110, 140 + Math.sin(a) * 50, 10, t + i, i % 2 ? "c" : "s", { dead: k > 0.5 }); }
    return s + tag("النار!", 320, 40, u, 0.3, -3, 30, "#ffb020");
  });
  // 19 — the chicken must cook until the inside reaches 74 degrees
  shot(19, CAM(320, 170, 1.0, 320, 160, 1.15), function (u, d, t) {
    var v = lerp(20, 74, ease(clamp((u - 0.4) / 2.0))), s = dark("#2a3442") + plate(300, 300, 3.2) + chicken(300, 250, 1.1, t, { cooked: true, steam: true }) + thermo(330, 236, v, 18);
    return s + (v >= 73.5 ? check(480, 100, 1.0, (u - 2.4) / 1.0) : "") + tag("من جوّه", 140, 120, u, 0.4, -3, 22) + tag("74 درجة", 480, 300, u, 2.0, 3, 26);
  });
  // 20 — then salmonella and campylobacter die, without washing a drop
  shot(20, CAM(320, 180, 1.0, 320, 175, 1.1), function (u, d, t) {
    var s = kitchen(t, { win: false }) + plate(320, 260, 2.6) + chicken(320, 222, 0.9, t, { cooked: true, steam: true });
    for (var i = 0; i < 4; i++) { var ph = clamp((u - 0.3 - i * 0.3) / 2.4); s += germ(200 + i * 80, 150 - ph * 140, 12, t + i, i % 2 ? "c" : "s", { dead: true, op: 1 - ph }); }
    return s + tag("ماتوا!", 160, 60, u, 0.6, -3, 26) + tag("من غير غسيل", 480, 330, u, 1.8, 3, 22, "#bfe0ff") + check(520, 120, 0.9, (u - 2.2) / 1.0);
  });
  // 21 — if there is blood or feathers, cut them off with a knife, or wipe with kitchen paper and throw it away
  shot(21, CAM(260, 190, 1.1, 360, 180, 1.0, true), function (u, d, t) {
    var cut = clamp(u / 1.6), s = kitchen(t, { win: false }) + board(220, 254, 240, "#d8352a") + chicken(220, 222, 0.7, t);
    s += cut < 1 ? knife(lerp(140, 300, cut), 160 + Math.sin(t * 10) * 4, 20) : towel(lerp(280, 500, clamp((u - 1.8) / 1.0)), lerp(200, 180, clamp((u - 1.8) / 1.0)), t, 1);
    s += bin(530, 300, clamp((u - 2.2) * 2));
    return s + tag("بالسكينة", 220, 60, u, 0.3, -3, 22) + tag("منديل وارميه", 520, 120, u, 1.8, 3, 20);
  });
  // 22 — keep a chopping board for chicken alone, away from vegetables and salad
  shot(22, CAM(320, 180, 1.1, 320, 180, 1.0), function (u, d, t) {
    var g = 60 * ease(clamp((u - 0.8) / 1.0)), s = kitchen(t, { win: false }) + board(200 - g, 250, 200, "#d8352a") + chicken(200 - g, 218, 0.6, t) + board(440 + g, 250, 200, "#3aa05a") + salad(440 + g, 236, 0.9, t);
    s += '<path d="M320 140 V300" stroke="#f2c230" stroke-width="5" stroke-dasharray="12 8" stroke-dashoffset="' + f(t * 30) + '" opacity="' + f(clamp((u - 1.4) * 2)) + '"/>';
    return s + tag("لوح للفراخ", 150, 60, u, 0.3, -3, 20, "#f2a0a0") + tag("ولوح للخضار", 500, 60, u, 1.2, 3, 20, "#bfe8c0");
  });
  // 23 — wash your hands with soap and water for twenty seconds after touching it
  shot(23, CAM(320, 180, 1.12, 320, 180, 1.0, true), function (u, d, t) {
    var s = kitchen(t, { win: false }) + sink(260, 250, t, { on: true, w: 130 }) + hands(240, 170, t, 0.9) + foam(240, 170, 60, 14, t) + soap(110, 248, 1.0);
    return s + timer(520, 150, 58, clamp((u - 0.4) / Math.max(1, d - 0.8)), "20") + tag("مية وصابون", 240, 50, u, 0.3, -3, 22, "#bfe0ff") + tag("20 ثانية", 520, 300, u, 1.4, 3, 24);
  });
  // 24 — and clean the sink and counter with hot water and soap when you finish
  shot(24, CAM(320, 180, 1.0, 320, 175, 1.08), function (u, d, t) {
    var cl = clamp(u / 2.4), s = kitchen(t, { win: false }) + sink(220, 250, t, { w: 130 }) + spots(380, 600, 246, 10, t, 1 - cl) + spots(120, 320, 226, 8, t, 1 - cl);
    s += sponge(lerp(160, 520, (Math.sin(t * 1.2) + 1) / 2), 240, t, 1.1) + foam(lerp(160, 520, (Math.sin(t * 1.2) + 1) / 2), 230, 40, 8, t);
    for (var k = 0; k < 4; k++) { var ph = (t * 0.6 + k / 4) % 1; s += '<path d="M' + (180 + k * 26) + ' ' + f(200 - ph * 60) + ' q8 -10 0 -20 q-8 -10 0 -20" stroke="#fff" stroke-width="3" fill="none" opacity="' + f(0.8 * Math.sin(ph * Math.PI)) + '"/>'; }
    if (cl > 0.6) s += sparkle(140, 200, 12, t) + sparkle(300, 190, 10, t + 1) + sparkle(480, 210, 12, t + 2);
    return s + tag("مية سخنة وصابون", 320, 60, u, 0.3, -3, 22, "#bfe0ff");
  });
  // 25 — so what really needs washing is your hands and your kitchen
  shot(25, CAM(300, 180, 1.1, 330, 175, 1.0, true), function (u, d, t) {
    var s = kitchen(t, { win: false }) + sink(200, 250, t, { on: true, w: 120 }) + hands(200, 160, t, 0.7) + foam(200, 160, 40, 10, t) + sparkle(110, 200, 12, t) + sparkle(300, 196, 10, t + 1);
    s += plate(480, 270, 1.8) + chicken(480, 246, 0.6, t, { cooked: true, steam: true }) + check(200, 70, 0.9, (u - 0.6) / 1.0);
    return s + tag("إيدك ومطبخك", 200, 330, u, 0.8, -3, 24) + tag("مش الفرخة", 480, 120, u, 1.8, 3, 22, "#f2a0a0");
  });
  // 26 — share this with your family, it might protect your home from food poisoning
  shot(26, CAM(320, 200, 1.2, 320, 170, 1.0, true), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#f4efe2"/><g transform="translate(320 180) rotate(' + f(Math.sin(t * 2) * 4) + ')">' + R(-60, -110, 120, 220, "#2b2e33", 3, 16) + '<rect x="-50" y="-96" width="100" height="186" rx="6" fill="#f1e3c6"/>' + chicken(0, 10, 0.5, t) + noSign(0, 0, 40, 1) + '</g>';
    [[120, 260, "#c23a26"], [520, 260, "#2f6f9f"], [90, 110, "#e2b035"], [550, 110, "#3aa05a"]].forEach(function (p, i) { var k2 = clamp((u - 0.4 - i * 0.3) * 2); if (k2 > 0) s += person(p[0], p[1] - 40, 0.32 * pop(k2), t + i, "happy", { col: p[2] }) + arrow(260, 180, lerp(260, p[0] + (p[0] < 320 ? 40 : -40), k2), lerp(180, p[1] - 40, k2), "#f2c230", 3, k2); });
    for (var h = 0; h < 5; h++) { var ph = (t * 0.5 + h / 5) % 1; s += '<path transform="translate(' + f(250 + h * 35) + ' ' + f(300 - ph * 120) + ') scale(.8)" d="M0 6 C-10 -4 -10 -12 0 -6 C10 -12 10 -4 0 6 Z" fill="#e2523a" opacity="' + f(1 - ph) + '"/>'; }
    return s + tag("شارك مع أهلك", 320, 40, u, 0.3, -3, 24);
  });
  // 27 — outro
  shot(27, CAM(260, 190, 1.1, 380, 170, 0.95), function (u, d, t) {
    var s = kitchen(t) + stove(470, 260, t, 9) + pan(470, 236, t, true) + sink(170, 250, t, {}) + sparkle(100, 200, 10, t) + person(300, 150, 0.5, t, "happy", { col: "#c23a26" });
    return s + tag("قولولنا!", 320, 60, u, 0.4, 3, 30);
  });

  window.__parts = { chicken: chicken, germ: germ, swarm: swarm, splash: splash, sink: sink, kitchen: kitchen, person: person, noSign: noSign, check: check, cross: cross, ring: ring, salad: salad, plates: plates, spots: spots, star: star, spark: spark, tag: tag, T: T, hardHat: hardHat };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
