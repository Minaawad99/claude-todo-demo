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

  // ── earthquakes: crust, plates and mantle in cross-section, a fault that locks and slips, the three kinds of waves, a
  // seismograph trace, the phone alert, the magnitude scale, a tall building swaying. Shapes from textbook diagrams.
  var CRUST = "#9a7a58", CRUST2 = "#b89a72", MANTLE = "#d8692a", MANTLE2 = "#f0a040";
  function shake(t, k) { return k ? 'transform="translate(' + f(Math.sin(t * 47) * 4 * k) + ' ' + f(Math.cos(t * 39) * 2.5 * k) + ')"' : ""; }
  function strataPlate(x0, x1, y, h, col, t, dx) {   // a slab of crust in section, with layers
    var s = '<rect x="' + f(x0 + dx) + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + h + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>';
    for (var l = 1; l < 4; l++) s += '<path d="M' + f(x0 + dx) + ' ' + (y + l * h / 4) + ' H' + f(x1 + dx) + '" stroke="#000" stroke-width="1" opacity=".18"/>';
    return s;
  }
  function mantle(t, y) {   // the hot slowly-churning rock under the plates, with convection arrows
    var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#mantleG)"/>';
    for (var c = 0; c < 4; c++) s += curl(80 + c * 170, y + 70, 60, 0, 5.2, "#ffd27a", 3, (t * 0.15 + c * 0.25) % 1);
    return s;
  }
  function quakeRings(t, x, y, n, sp, maxR, col) { var s = ""; for (var i = 0; i < n; i++) { var u = (t * sp + i / n) % 1; s += '<circle cx="' + x + '" cy="' + y + '" r="' + f(u * maxR) + '" fill="none" stroke="' + (col || "#ffd27a") + '" stroke-width="' + f(4 * (1 - u)) + '" opacity="' + f(1 - u) + '"/>'; } return s; }
  function house(x, y, s, t, k, col) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') rotate(' + f(Math.sin(t * 9) * 3 * k) + ' 0 0)"><rect x="-40" y="-60" width="80" height="60" fill="' + (col || "#e8dcc4") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<path d="M-50 -60 L0 -100 L50 -60 Z" fill="#b5452e" stroke="' + INK + '" stroke-width="2.4"/><rect x="-28" y="-46" width="18" height="18" fill="#5d93ad" stroke="' + INK + '"/><rect x="10" y="-46" width="18" height="18" fill="#5d93ad" stroke="' + INK + '"/><rect x="-9" y="-28" width="18" height="28" fill="#7a5a3a" stroke="' + INK + '"/>';
    return g + '</g>';
  }
  function tower(x, y, t, sway, floors) {   // a tall building; the top swings more than the bottom
    floors = floors || 12; var s = "", fh = 18;
    for (var i = 0; i < floors; i++) { var k = i / floors, dx = Math.sin(t * 4) * sway * k * k * 30; s += '<rect x="' + f(x - 34 + dx) + '" y="' + (y - (i + 1) * fh) + '" width="68" height="' + fh + '" fill="' + (i % 2 ? "#c9ced4" : "#b9bec4") + '" stroke="' + INK + '" stroke-width="1.4"/>'; for (var w = 0; w < 3; w++) s += '<rect x="' + f(x - 26 + w * 20 + dx) + '" y="' + (y - (i + 1) * fh + 4) + '" width="12" height="10" fill="#5d93ad"/>'; }
    return s;
  }
  function seismo(x, y, w, t, k, gap) {   // a seismograph drum trace: quiet, the P arrival, then the bigger S waves
    var d = "M" + x + " " + y, n = 140;
    for (var i = 0; i <= n * k; i++) { var u = i / n, px = x + u * w, a = 1.5; if (u > 0.25) a = 10 * Math.exp(-(u - 0.25) * 6) + 2; if (u > 0.25 + gap) a = 40 * Math.exp(-(u - 0.25 - gap) * 4) + 3; d += " L" + f(px) + " " + f(y + Math.sin(i * 2.7) * a * (0.6 + hash(i) * 0.6)); }
    return '<rect x="' + (x - 20) + '" y="' + (y - 80) + '" width="' + (w + 40) + '" height="160" rx="10" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + x + ' ' + y + ' H' + (x + w) + '" stroke="#ccc" stroke-width="1"/><path d="' + d + '" stroke="#c23a26" stroke-width="2.2" fill="none"/>';
  }
  function phone(x, y, s, t, alert) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') rotate(' + f(alert ? Math.sin(t * 30) * 3 : 0) + ')"><rect x="-60" y="-110" width="120" height="220" rx="18" fill="#1c1c1c"/><rect x="-52" y="-96" width="104" height="190" rx="8" fill="' + (alert ? "#c23a26" : "#2b4a6a") + '"/>';
    if (alert) g += '<text x="0" y="-30" text-anchor="middle" style="font:800 40px Noto Sans Arabic;fill:#fff">⚠</text><text x="0" y="14" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#fff">تنبيه زلزال</text><text x="0" y="44" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:#ffe9a0">اهدى وابعد عن الشبابيك</text>';
    return g + '</g>';
  }
  function dog(x, y, t, alert) {
    var g = '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="0" rx="34" ry="18" fill="#c9944a" stroke="' + INK + '" stroke-width="2"/><path d="M-30 0 q-14 ' + f(-10 - Math.sin(t * 12) * 8) + ' -20 -24" stroke="#c9944a" stroke-width="6" fill="none" stroke-linecap="round"/>';
    [-20, -8, 12, 24].forEach(function (lx) { g += '<path d="M' + lx + ' 14 v20" stroke="#a8743a" stroke-width="6" stroke-linecap="round"/>'; });
    g += '<circle cx="34" cy="-16" r="16" fill="#c9944a" stroke="' + INK + '" stroke-width="2"/><path d="M26 -28 L' + (alert ? "24 -50" : "18 -36") + ' L36 -30 Z M40 -30 L' + (alert ? "46 -52" : "50 -38") + ' L46 -28 Z" fill="#a8743a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="40" cy="-18" r="' + (alert ? 3.4 : 2.4) + '" fill="' + INK + '"/><ellipse cx="50" cy="-12" rx="4" ry="3" fill="' + INK + '"/>';
    return g + (alert ? '<text x="70" y="-40" style="font:800 22px Noto Sans Arabic;fill:#c23a26">!</text>' : "") + '</g>';
  }
  function globePlates(x, y, r, t) {   // the Earth with plate boundaries drawn on it, turning slowly
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2b86b5" stroke="' + INK + '" stroke-width="3"/>', o = (t * 12) % 120;
    [[-40, -20, 50, 40], [30, 10, 60, 30], [-10, 50, 40, 22], [60, -50, 30, 26]].forEach(function (c, i) { s += '<ellipse cx="' + f(x + c[0] + Math.sin(t * 0.3 + i) * 6) + '" cy="' + (y + c[1]) + '" rx="' + c[2] + '" ry="' + c[3] + '" fill="#6f9a4a" stroke="' + INK + '" stroke-width="1.4"/>'; });
    for (var l = 0; l < 7; l++) { var a = l * 0.9 + t * 0.12; s += '<path d="M' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + ' Q' + f(x + Math.cos(a + 1.3) * r * 0.3) + ' ' + f(y + Math.sin(a + 1.3) * r * 0.3) + ' ' + f(x + Math.cos(a + 2.4) * r) + ' ' + f(y + Math.sin(a + 2.4) * r) + '" stroke="#ff5a3a" stroke-width="3" fill="none" stroke-dasharray="8 5"/>'; }
    return s;
  }
  function room(t, k) {   // inside a living room: a hanging lamp, a picture, a shelf with things that rattle
    var sw = Math.sin(t * 6) * 18 * k, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efe2c8"/><rect x="-400" y="270" width="1440" height="200" fill="#a8835a"/>';
    s += '<g ' + shake(t, k) + '><rect x="80" y="70" width="110" height="80" fill="#5d93ad" stroke="#7a5a3a" stroke-width="8" transform="rotate(' + f(Math.sin(t * 7) * 6 * k) + ' 135 70)"/>';
    s += '<rect x="400" y="160" width="180" height="10" fill="#7a5a3a"/>' + [0, 1, 2].map(function (i) { return '<rect x="' + f(420 + i * 50 + Math.sin(t * 20 + i) * 4 * k) + '" y="120" width="26" height="40" fill="' + ["#c23a26", "#2f6f9f", "#e2b035"][i] + '" stroke="' + INK + '" transform="rotate(' + f(Math.sin(t * 15 + i) * 8 * k) + ' ' + (433 + i * 50) + ' 160)"/>'; }).join("");
    s += '<rect x="230" y="200" width="160" height="70" rx="10" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/></g>';
    s += '<path d="M320 -40 L' + f(320 + sw) + ' 60" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(300 + sw) + ' 60 h40 l-8 22 h-24 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
    return s;
  }
  function ruler(x, y, bend, broken, t) {
    if (broken) return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-160 0 L-6 ' + f(-30) + '" stroke="#e2b035" stroke-width="18" stroke-linecap="round"/><path d="M6 -24 L160 10" stroke="#e2b035" stroke-width="18" stroke-linecap="round"/><path d="M-20 -50 l14 18 l8 -22 l14 16" stroke="#fff" stroke-width="3" fill="none"/></g>';
    return '<path d="M' + (x - 160) + ' ' + y + ' Q' + x + ' ' + f(y - bend) + ' ' + (x + 160) + ' ' + y + '" stroke="#e2b035" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M' + (x - 160) + ' ' + y + ' Q' + x + ' ' + f(y - bend) + ' ' + (x + 160) + ' ' + y + '" stroke="' + INK + '" stroke-width="1" fill="none" stroke-dasharray="2 10"/>';
  }
  function hands(x, y, side, t) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + side + ' 1)"><path d="M-10 -14 C10 -24 34 -14 34 0 C34 14 10 24 -10 14 Z" fill="#c68b5f" stroke="' + INK + '" stroke-width="2"/><path d="M-10 -6 h-60 M-10 6 h-60" stroke="#d8352a" stroke-width="12"/></g>'; }
  function person(x, y, t, mood, o) {   // a ball-head person; o.flap: arms flapping, o.flex: tiny bicep
    o = o || {}; var a = o.flap ? Math.sin(t * 12) * 50 : 0, s = '<g transform="translate(' + x + ' ' + f(y + (o.flap ? Math.abs(Math.sin(t * 12)) * -4 : 0)) + ') scale(' + (o.s || 1) + ')">';
    s += '<path d="M-14 60 L-18 110 M14 60 L18 110" stroke="#2c3e66" stroke-width="12" stroke-linecap="round"/><path d="M-26 64 C-28 20 -16 8 0 8 C16 8 28 20 26 64 Z" fill="#d8352a" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<g transform="rotate(' + f(-60 - a) + ' -20 20)"><path d="M-20 20 L-74 20" stroke="#d8352a" stroke-width="11" stroke-linecap="round"/></g><g transform="rotate(' + f(60 + a) + ' 20 20)"><path d="M20 20 L74 20" stroke="#d8352a" stroke-width="11" stroke-linecap="round"/></g>';
    if (o.flex) s += '<circle cx="40" cy="10" r="' + f(5 + Math.sin(t * 5)) + '" fill="#c68b5f" stroke="' + INK + '"/>';
    return s + head(0, -14, 22, mood, t) + (o.sweat ? '<path d="M24 -26 q4 8 0 12 q-4 -4 0 -12" fill="#8fd0ee"/>' : "") + '</g>';
  }
  function dayCounter(x, y, n, t) { return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-56" y="-34" width="112" height="70" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><rect x="-56" y="-34" width="112" height="18" rx="8" fill="#c23a26"/><text x="0" y="28" text-anchor="middle" style="font:800 34px Noto Sans Arabic;fill:#1c1c1c">' + n + '</text><text x="0" y="-21" text-anchor="middle" style="font:800 11px Noto Sans Arabic;fill:#fff">يوم</text></g>'; }
  function crossSection(t, o) {   // ground cross-section: grass and houses on top, two plates meeting at a fault, the mantle
    o = o || {}; var y = 160, dxL = o.slip ? -Math.min(14, o.slip * 14) : 0, dxR = o.slip ? Math.min(14, o.slip * 14) : 0;
    var s = mantle(t, 300);
    s += strataPlate(-400, 320, y, 140, CRUST, t, dxL) + strataPlate(320, 1040, y, 140, CRUST2, t, dxR);
    s += '<rect x="-400" y="' + (y - 14) + '" width="1440" height="14" fill="#6f9a4a"/>';
    if (o.stress) for (var l = 0; l < 6; l++) s += '<path d="M' + (320 - 40 - l * 22) + ' ' + (y + 10) + ' Q' + (320 - l * 10) + ' ' + (y + 70) + ' ' + (320 - 40 - l * 22) + ' ' + (y + 130) + '" stroke="#ffd27a" stroke-width="' + f(1 + o.stress * 2) + '" fill="none" opacity="' + f(0.3 + 0.6 * o.stress) + '"/>';
    s += '<path d="M320 ' + (y - 14) + ' L330 ' + (y + 40) + ' L316 ' + (y + 90) + ' L326 ' + (y + 140) + '" stroke="' + INK + '" stroke-width="3" fill="none"/>';
    if (o.focus) s += quakeRings(t, 324, y + 90, 4, 0.9, 260, "#ffd27a") + '<circle cx="324" cy="' + (y + 90) + '" r="9" fill="#ff5a3a" stroke="#fff" stroke-width="2"/>';
    if (o.houses) { s += house(150, y - 14, 0.7, t, o.houses) + house(470, y - 14, 0.7, t + 1, o.houses, "#d9e4ea"); }
    if (o.arrows) s += arrow(120, y + 70, 250, y + 70, "#fff", 4, 1) + arrow(520, y + 70, 390, y + 70, "#fff", 4, 1);
    return s;
  }

  // 0 — the ground you stand on is moving right now
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(140, 200, k), lerp(1.3, 0.92, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 60, -20, 6, 0.85) + birds(t, 20, 90) + crossSection(t, {}) + person(320, 84 + Math.sin(t * 3) * 3, t, "curious", { s: 0.55 });
    s += arrow(100 - (t * 6) % 30, 230, 230 - (t * 6) % 30, 230, "#fff", 4, 1) + arrow(560 + (t * 6) % 30, 230, 430 + (t * 6) % 30, 230, "#fff", 4, 1);
    return s + tag("بتتحرك دلوقتي!", 480, 60, u, 2.0, 3, 22);
  });
  // 1 — so why does everything suddenly shake?
  shot(1, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { return room(t, clamp((u - 0.6) * 1.5)) + qmark(520, 60, t, 44) + tag("ليه فجأة؟", 160, 230, u, 1.0, -3, 22, "#f2a0a0"); });
  // 2 — how do people in Egypt feel a quake in Turkey?
  shot(2, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#4fa3d0"/><path d="M200 40 Q320 20 460 50 L470 110 Q360 120 210 100 Z" fill="#d9c79a" stroke="' + INK + '" stroke-width="2"/><path d="M120 250 L300 240 L330 380 L110 380 Z" fill="#e8d29a" stroke="' + INK + '" stroke-width="2"/>';
    s += quakeRings(t, 400, 80, 5, 0.35, 320, "#ff5a3a") + '<circle cx="400" cy="80" r="8" fill="#ff5a3a" stroke="#fff" stroke-width="2"/>';
    return s + tag("تركيا", 330, 60, u, 0.4, -3, 18, "#fff") + tag("مصر", 210, 300, u, 1.2, 3, 20) + qmark(470, 260, t, 40);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) { return sky("dusk") + city(t, 280, 120, "#7a6a5a", true, 4, false) + '<g ' + shake(t, 0.5) + '><rect x="-400" y="280" width="1440" height="200" fill="#5a4a3a"/><path d="M-100 300 L100 320 L180 290 L300 340 L420 300 L560 330 L760 300" stroke="#1c1c1c" stroke-width="4" fill="none"/></g>' + tag("إيه الحكاية؟", 320, 100, u, 0.1, -2, 34, "#f2c230"); });
  // 4 — the crust is very thin, like the skin of an apple
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>';
    s += '<circle cx="190" cy="180" r="120" fill="#f0a040"/><circle cx="190" cy="180" r="70" fill="#ffd27a"/><circle cx="190" cy="180" r="30" fill="#fff6c8"/><path d="M190 180 L190 60 A120 120 0 0 1 310 180 Z" fill="#2a3442"/><circle cx="190" cy="180" r="120" fill="none" stroke="#6f9a4a" stroke-width="6"/>';
    s += '<circle cx="460" cy="190" r="90" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M460 190 L460 100 A90 90 0 0 1 550 190 Z" fill="#f4ecd0"/><path d="M460 100 A90 90 0 0 1 550 190" stroke="#d8352a" stroke-width="4" fill="none"/><path d="M460 100 q6 -26 22 -30" stroke="#5a3a20" stroke-width="5" fill="none"/>';
    return s + tag("قشرة الأرض", 190, 330, u, 0.6, -3, 20) + tag("قشرة التفاحة", 460, 330, u, 1.6, 3, 20, "#f2a0a0");
  });
  // 5 — it isn't one piece: it's broken into about fifteen big plates
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 180, lerp(1.15, 0.95, k)]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#0b1730"/>' + stars(t) + '<circle cx="320" cy="180" r="' + f(160 + Math.sin(t * 3) * 8) + '" fill="#5fb0e0" opacity=".18" filter="url(#soft)"/>' + globePlates(320, 180, 140, t * 3) + tag("حوالي 15 لوح", 320, 330, u, 1.0, -2, 22); });
  // 6 — the plates float on hot, heavy rock that moves very slowly
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, k), lerp(160, 230, k), lerp(1.15, 0.95, k)]; }, function (u, d, t) { return sky("day") + clouds(t, 60, -20, 6, 0.85) + birds(t, 20, 90) + crossSection(t * 3, { arrows: true }) + tag("صخر سخن بيتحرك", 320, 300, u, 1.0, -2, 20); });
  // 7 — a few centimetres a year, as fast as your fingernails grow
  shot(7, function (u, d) { return [320, 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var grow = (t * 4) % 16, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/>';
    s += '<path d="M140 340 V140 Q140 90 190 90 Q240 90 240 140 V340 Z" fill="#c68b5f" stroke="' + INK + '" stroke-width="3"/><path d="M160 140 Q160 110 190 110 Q220 110 220 140 V' + f(160) + ' H160 Z" fill="#f4d4c0" stroke="' + INK + '" stroke-width="2"/><path d="M160 110 Q190 ' + f(98 - grow) + ' 220 110" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    s += strataPlate(330, 600, 150, 80, CRUST, t, Math.sin(t * 0.6) * 6) + arrow(360, 260, 470, 260, "#e2523a", 5, 1);
    return s + tag("قد ضافرك!", 190, 50, u, 0.8, -3, 22) + tag("كام سم في السنة", 470, 110, u, 1.6, 3, 18, "#bfe0ff");
  });
  // 8 — where two plates meet, they grind against each other
  shot(8, function (u, d) { return [320, lerp(200, 190, u / d), lerp(1.2, 1.3, u / d)]; }, function (u, d, t) {
    var s = '<g ' + shake(t, 0.25) + '>' + sky("day") + clouds(t, 60, -20, 5, 0.85) + crossSection(t, { slip: Math.sin(t * 5) * 0.6 }) + '</g>';
    for (var k = 0; k < 14; k++) { var q = (t * 2 + k / 14) % 1; s += '<circle cx="' + f(326 + Math.cos(k) * q * 30) + '" cy="' + f(200 + k * 14 - q * 20) + '" r="3" fill="#ffd27a" opacity="' + f(1 - q) + '"/>'; }
    return s + tag("احتكاك", 470, 110, u, 0.8, 3, 24);
  });
  // 9 — the rock gets stuck and the stress builds up for years
  shot(9, function (u, d) { return [320, 200, lerp(1.15, 1.25, u / d)]; }, function (u, d, t) { var k = clamp(u / d); return sky("day") + crossSection(t, { stress: k }) + gauge(520, 80, 40, k) + tag("الضغط بيتجمع سنين", 200, 60, u, 0.8, -3, 20); });
  // 10 — like bending a plastic ruler: it holds, and holds, and then snaps
  shot(10, function (u, d) { var k0 = clamp(u / d); return [lerp(260, 380, k0), lerp(210, 180, k0), lerp(1.25, 1.0, k0)]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.8)), broken = k >= 1, j = Math.sin(t * 25) * 4 * k, s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/>' + clouds(t, 40, 20, 4, 0.5);
    s += ruler(320, 220 + j, broken ? 0 : 20 + 90 * k + Math.sin(t * 20) * 6 * k, broken, t) + hands(140, 220 + j, 1, t) + hands(500, 220 - j, -1, t);
    return s + (broken ? '<circle cx="320" cy="200" r="' + f(40 + (u - d * 0.8) * 200) + '" fill="none" stroke="#e2523a" stroke-width="4" opacity="' + f(Math.max(0, 1 - (u - d * 0.8) * 2)) + '"/>' + tag("طق!", 320, 100, u, d * 0.8, -4, 30, "#f2a0a0") : tag("بتستحمل…", 320, 90, u, 0.6, -3, 20));
  });
  // 11 — in one second the rock slips and all that energy comes out at once
  shot(11, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) { var k = clamp(u / 0.8); return '<g ' + shake(t, k) + '>' + sky("day") + crossSection(t, { slip: k, focus: true, houses: k }) + '</g>' + tag("الطاقة طلعت مرة واحدة!", 320, 50, u, 0.6, -2, 20); });
  // 12 — the energy travels through the ground as waves, like a stone dropped in water
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, 1.0]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#4fa3d0"/>' + quakeRings(t, 170, 180, 5, 0.5, 160, "#fff") + '<circle cx="170" cy="180" r="10" fill="#6f6a62" stroke="' + INK + '"/>' + '<rect x="330" y="80" width="300" height="200" fill="' + CRUST + '" stroke="' + INK + '" stroke-width="2"/>' + quakeRings(t + 0.3, 480, 230, 5, 0.5, 180, "#ffd27a") + tag("موجات", 480, 50, u, 0.8, 3, 22) + tag("زي حجر في مية", 170, 330, u, 1.6, -3, 18, "#bfe0ff"); });
  // 13 — the first wave is very fast: it pushes the ground forward and back
  shot(13, function (u, d) { return [320, 180, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>', d2 = "M40 180";
    for (var x = 0; x <= 560; x += 8) { var comp = Math.sin(x * 0.05 - t * 10); d2 += " M" + f(40 + x + comp * 4) + " 140 V220"; }
    s += '<path d="' + d2 + '" stroke="#ffd27a" stroke-width="2.4"/>' + arrow(160, 270, 300, 270, "#fff", 4, 1) + arrow(480, 270, 340, 270, "#fff", 4, 1);
    return s + tag("الموجة الأولى: سريعة", 320, 60, u, 0.6, -2, 20);
  });
  // 14 — that's the small jolt you feel; sometimes dogs feel it before you
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 190, 1.1]; }, function (u, d, t) { var jolt = Math.max(0, Math.sin(t * 3)) > 0.95 ? 1 : 0; return '<g ' + shake(t, jolt * 0.6) + '>' + room(t, 0.1) + '</g>' + dog(440, 250, t, true) + person(200, 150, t, "n", { s: 0.6 }) + tag("خبطة صغيرة", 200, 60, u, 0.6, -3, 20) + tag("الكلب حس الأول!", 460, 150, u, 1.8, 3, 18, "#bfe0ff"); });
  // 15 — seconds later a slower wave shakes the ground side to side
  shot(15, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day"), d2 = "M-100 250";
    for (var x = -100; x <= 740; x += 10) d2 += " L" + x + " " + f(250 + Math.sin(x * 0.03 - t * 5) * 22);
    s += '<path d="' + d2 + ' V500 H-100 Z" fill="' + CRUST + '" stroke="' + INK + '" stroke-width="2"/>';
    s += house(180, 250 + Math.sin(180 * 0.03 - t * 5) * 22, 0.8, t, 0.8) + house(460, 250 + Math.sin(460 * 0.03 - t * 5) * 22, 0.8, t + 1, 0.8, "#d9e4ea");
    return s + tag("يمين وشمال", 320, 60, u, 0.6, -2, 22);
  });
  // 16 — last, the surface waves: they bring houses down
  shot(16, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<g ' + shake(t, 0.8) + '>' + sky("day"), d2 = "M-100 260";
    for (var x = -100; x <= 740; x += 10) d2 += " L" + x + " " + f(260 + Math.sin(x * 0.02 - t * 4) * 30 * Math.cos(x * 0.005));
    s += '<path d="' + d2 + ' V500 H-100 Z" fill="' + CRUST2 + '" stroke="' + INK + '" stroke-width="2"/>' + house(200, 250, 0.8, t, 2) + '<g transform="rotate(' + f(Math.min(40, u * 14)) + ' 470 250)">' + house(470, 250, 0.8, t, 1, "#d9e4ea") + '</g>';
    for (var r = 0; r < 6; r++) { var q = (t * 1.2 + r / 6) % 1; s += '<circle cx="' + f(470 + r * 10) + '" cy="' + f(240 - q * 60) + '" r="' + f(6 + q * 10) + '" fill="#b9a988" opacity="' + f(0.6 * (1 - q)) + '"/>'; }
    return s + '</g>' + tag("موجات السطح", 320, 60, u, 0.6, -2, 22, "#f2a0a0");
  });
  // 17 — the gap between the first and second wave tells you how far away it is
  shot(17, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) { var k = clamp(u / (d * 0.7)); return '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>' + seismo(70, 180, 500, t, k, 0.22) + (k > 0.5 ? '<path d="M195 120 V240 M305 120 V240" stroke="#2f7fb8" stroke-width="2" stroke-dasharray="6 4"/>' + arrow(200, 110, 300, 110, "#f2c230", 3, 1) + arrow(300, 110, 200, 110, "#f2c230", 3, 1) : "") + tag("الفرق = المسافة", 320, 320, u, 1.6, -2, 20); });
  // 18 — because the first wave is faster, a phone can warn you seconds early
  shot(18, function (u, d) { return [320, 190, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { var al = u > 0.6; return '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/>' + phone(320, 180, 1.0, t, al) + (al ? quakeRings(t, 320, 180, 3, 1.2, 160, "#c23a26") : "") + tag("قبل الهزة بثواني", 480, 80, u, 1.4, 3, 18); });
  // 19 — each step on the magnitude scale is about 32 times more energy
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, k), 190, lerp(1.15, 0.95, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>';
    for (var m = 0; m < 5; m++) { var on = u > 0.3 + m * 0.5, h = 12 * Math.pow(1.9, m) * (1 + 0.06 * Math.sin(t * 5 + m)); s += '<rect x="' + (110 + m * 90) + '' + '" y="' + f(300 - (on ? h : 0)) + '" width="60" height="' + f(on ? h : 0) + '" fill="' + ["#5bbf6a", "#9bcf5a", "#f2c230", "#e8742e", "#e2523a"][m] + '" stroke="' + INK + '" stroke-width="2"/><text x="' + (140 + m * 90) + '" y="330" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#fff">' + (5 + m) + '</text>'; }
    return s + tag("كل درجة ×32", 320, 50, u, 2.4, -2, 22);
  });
  // 20 — a magnitude 7 has the energy of 32 magnitude 6s
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/><rect x="120" y="150" width="40" height="40" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>', n = Math.min(32, Math.floor(u * 14));
    for (var i = 0; i < n; i++) s += '<rect x="' + (340 + (i % 8) * 32) + '" y="' + (90 + Math.floor(i / 8) * 32) + '" width="28" height="28" fill="#e2523a" stroke="' + INK + '" stroke-width="1.6"/>';
    return s + tag("6", 140, 240, u, 0.3, 0, 22) + tag("7 = " + n + " مرة!", 460, 300, u, 0.6, 3, 22, "#f2a0a0");
  });
  // 21 — the strongest ever recorded: Chile, 1960, magnitude 9.5
  shot(21, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#4fa3d0"/><path d="M300 -40 C330 60 290 180 320 280 C300 320 280 380 300 420 L260 420 C240 330 270 200 250 60 Z" fill="#d9c79a" stroke="' + INK + '" stroke-width="2"/>';
    s += quakeRings(t, 300, 200, 5, 0.5, 300, "#ff5a3a") + '<circle cx="300" cy="200" r="9" fill="#ff5a3a" stroke="#fff" stroke-width="2"/>' + gauge(500, 120, 50, 0.97);
    return s + tag("شيلي 1960", 160, 60, u, 0.5, -3, 22) + tag("9.5!", 500, 230, u, 1.6, 3, 30, "#f2a0a0");
  });
  // 22 — in Egypt, the 1992 quake was about magnitude 6, and many still remember it
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 180, 1.05]; }, function (u, d, t) { return sky("day") + '<g ' + shake(t, 0.4 * Math.max(0, Math.sin(t * 1.3))) + '>' + city(t, 270, 140, "#c9b98a", true, 6, false) + '<rect x="-400" y="270" width="1440" height="200" fill="#9a8a70"/></g>' + dayCounter(500, 100, 1992, t).replace(">يوم<", ">سنة<") + tag("مصر", 160, 70, u, 0.5, -3, 24) + tag("قوته ~6", 470, 300, u, 1.6, 3, 20); });
  // 23 — why does someone on the tenth floor feel it more than the people below?
  shot(23, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="300" width="1440" height="200" fill="#9a8a70"/>' + tower(320, 300, t, 0.5, 11);
    var top = Math.sin(t * 4) * 0.5 * 30 * 0.83;
    s += person(f(320 + top), 70, t, "shock", { s: 0.32 }) + person(320, 268, t, "happy", { s: 0.32 });
    return s + tag("الدور العاشر", 490, 70, u, 0.5, 3, 18, "#f2a0a0") + tag("الدور الأرضي", 150, 280, u, 1.3, -3, 18, "#bfe0ff") + qmark(520, 160, t, 40);
  });
  // 24 — the ground pulls the building from below and the top lags behind, like a stick shaken from its end
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 190, 1.05]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#e8dcc4"/>', bx = 200 + Math.sin(t * 6) * 18, tip = 200 + Math.sin(t * 6 - 1.2) * 70;
    s += '<path d="M' + f(bx) + ' 300 Q' + f((bx + tip) / 2) + ' 180 ' + f(tip) + ' 60" stroke="#8a5a2a" stroke-width="14" fill="none" stroke-linecap="round"/>' + hands(f(bx - 10), 310, 1, t);
    s += tower(470, 320, t, 1.0, 12) + '<path d="M' + f(470 + Math.sin(t * 4) * 30) + ' 90 L470 320" stroke="#e2523a" stroke-width="2" stroke-dasharray="6 5"/>';
    return s + tag("من تحت: الأرض بتشد", 200, 340, u, 0.6, -3, 16) + tag("فوق: بيتأخر ويتمرجح", 470, 50, u, 1.8, 3, 16, "#bfe0ff");
  });
  // 25 — the higher you go, the bigger the swing: the chandelier swings, you feel what downstairs doesn't
  shot(25, function (u, d) { return [320, 180, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>';
    [[180, 0.15, "الدور الأول"], [460, 1, "الدور العاشر"]].forEach(function (r, j) {
      var x = r[0], k = r[1], sw = Math.sin(t * 4) * 24 * k;
      s += '<rect x="' + (x - 110) + '" y="40" width="220" height="250" fill="#efe2c8" stroke="' + INK + '" stroke-width="3"/><rect x="' + (x - 110) + '" y="250" width="220" height="40" fill="#a8835a"/>';
      s += '<path d="M' + x + ' 40 L' + f(x + sw) + ' 130" stroke="' + INK + '" stroke-width="2"/><path d="M' + f(x + sw - 26) + ' 130 h52 l-10 22 h-32 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
      s += '<g transform="translate(' + f(x + Math.sin(t * 9) * 4 * k) + ' 230)"><rect x="-14" y="-24" width="28" height="24" rx="3" fill="#fff" stroke="' + INK + '"/><path d="M-10 -24 q10 ' + f(-6 - 8 * k * Math.abs(Math.sin(t * 9))) + ' 20 0" fill="#5fb0e0"/></g>';
      s += tag(r[2], x, 330, u, 0.5 + j * 1.0, j ? 3 : -3, 16, j ? "#f2a0a0" : "#bfe0ff");
    });
    return s;
  });
  // 26 — skyscrapers are built flexible; a tower in Taiwan has a 660-ton steel ball that swings against the sway
  shot(26, function (u, d) { var k = clamp(u / d); return [320, lerp(200, 150, k), lerp(0.95, 1.12, k)]; }, function (u, d, t) {
    var sw = Math.sin(t * 2.5), s = sky("day") + clouds(t, 30, 10, 4, 0.8) + '<rect x="-400" y="330" width="1440" height="200" fill="#9a8a70"/>', bx = 320 + sw * 10;
    for (var i = 0; i < 8; i++) { var w = 90 - i * 6, y = 330 - (i + 1) * 36, dx = sw * 10 * (i / 8); s += '<path d="M' + f(bx - w / 2 + dx - 6) + ' ' + (y + 36) + ' L' + f(bx - w / 2 + dx) + ' ' + y + ' H' + f(bx + w / 2 + dx) + ' L' + f(bx + w / 2 + dx + 6) + ' ' + (y + 36) + ' Z" fill="#5d93ad" stroke="' + INK + '" stroke-width="2"/>'; }
    s += '<rect x="' + f(bx - 10 + sw * 10) + '" y="10" width="20" height="30" fill="#5d93ad" stroke="' + INK + '" stroke-width="2"/>';
    var cx = bx + sw * 8, cy = 70, bxx = cx - sw * 26;
    s += '<circle cx="' + f(cx) + '" cy="' + cy + '" r="70" fill="#000" opacity=".35"/><path d="M' + f(cx - 20) + ' ' + (cy - 50) + ' L' + f(bxx) + ' ' + (cy + 10) + ' M' + f(cx + 20) + ' ' + (cy - 50) + ' L' + f(bxx) + ' ' + (cy + 10) + '" stroke="#ddd" stroke-width="2"/><circle cx="' + f(bxx) + '" cy="' + (cy + 24) + '" r="26" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/>';
    return s + tag("660 طن!", 520, 80, u, 1.6, 3, 24) + tag("بتتمرجح عكسه", 140, 120, u, 2.6, -3, 18, "#bfe0ff") + tag("مرنة", 160, 300, u, 0.6, -3, 20);
  });
  // 27 — payoff: an earthquake is the ground releasing years of stress in seconds
  shot(27, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) { var k = clamp((u - 0.6) / 0.5); return '<g ' + shake(t, k * (1 - clamp((u - 2.5) / 1))) + '>' + sky("day") + crossSection(t, { stress: 1 - k, slip: k, focus: k > 0, houses: k * 0.5 }) + '</g>' + tag("سنين ضغط", 170, 60, u, 0.3, -3, 20) + tag("في ثواني!", 470, 60, u, 1.2, 3, 22, "#f2a0a0"); });
  // 28 — outro
  shot(28, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(190, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) { return sky("dusk") + clouds(t, 50, 20, 5, 0.8) + sun(500, 230, 34, "#ffd27a") + birds(t, 60, 70) + city(t, 280, 120, "#7a6a5a", true, 4, false) + '<rect x="-400" y="280" width="1440" height="200" fill="#5a4a3a"/>' + cars(t, 310, 90) + tag("قولولنا!", 470, 80, u, 0.4, 3, 26); });

  window.__parts = { crossSection: crossSection, globePlates: globePlates, quakeRings: quakeRings, house: house, tower: tower, seismo: seismo, phone: phone, tag: tag, hardHat: hardHat, person: person };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
