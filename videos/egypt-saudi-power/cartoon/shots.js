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
  // ── the Egypt–Saudi HVDC link: converter stations at Badr (east of Cairo), Tabuk and East Madinah, ±500 kV overhead
  // lines on steel lattice towers across Sinai and NW Saudi Arabia, and a 22 km submarine cable on the bed of the Gulf of
  // Aqaba. Shapes from project photos and maps (../refs/SOURCES.md).
  var SAND = "#e3cf9e", GLOW = "#ffe46a", SEAC = "#3f9fd0";
  function R(x, y, w, h, fill, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (ex || 2) + '"/>'; }
  function spark(x, y, r, t, col) { var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="' + (col || GLOW) + '" opacity=".35" filter="url(#soft2)"/>'; return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.8 + 0.2 * Math.sin(t * 20 + x))) + '" fill="#fff8d0" stroke="' + (col || GLOW) + '" stroke-width="1.5"/>'; }
  function bolt(x, y, s, col) { return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')" d="M4 -22 L-10 2 H0 L-4 22 L10 -4 H0 Z" fill="' + (col || GLOW) + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'; }
  // a sine wave (AC) or a flat line (DC) from x0 over w px
  function wave(x0, y, w, amp, cyc, ph, col, sw) { var d = ""; for (var i = 0; i <= 80; i++) { var x = x0 + w * i / 80; d += (i ? " L" : "M") + f(x) + " " + f(y + amp * Math.sin(Math.PI * 2 * cyc * i / 80 + ph)); } return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + ((sw || 4) + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || GLOW) + '" stroke-width="' + (sw || 4) + '" fill="none" stroke-linecap="round"/>'; }
  // quadratic point
  function qp(a, c, b, p) { var m = 1 - p; return [m * m * a[0] + 2 * m * p * c[0] + p * p * b[0], m * m * a[1] + 2 * m * p * c[1] + p * p * b[1]]; }
  // a steel lattice tower (bipole line: one conductor each side), base at (x,y), height h; returns svg
  function tower(x, y, h, col) {
    var w0 = h * 0.2, w1 = h * 0.06, ya = y - h * 0.82, s = '<g stroke="' + (col || "#5a6068") + '" stroke-width="' + f(Math.max(1.2, h / 60)) + '" fill="none" stroke-linecap="round">';
    s += '<path d="M' + f(x - w0) + ' ' + y + ' L' + f(x - w1) + ' ' + f(y - h) + ' M' + f(x + w0) + ' ' + y + ' L' + f(x + w1) + ' ' + f(y - h) + '"/>';
    for (var k = 0; k < 6; k++) { var a = k / 6, b = (k + 1) / 6, xa = lerp(w0, w1, a), xb = lerp(w0, w1, b), y1 = y - h * a, y2 = y - h * b; s += '<path d="M' + f(x - xa) + ' ' + f(y1) + ' L' + f(x + xb) + ' ' + f(y2) + ' M' + f(x + xa) + ' ' + f(y1) + ' L' + f(x - xb) + ' ' + f(y2) + ' M' + f(x - xb) + ' ' + f(y2) + ' H' + f(x + xb) + '"/>'; }
    s += '<path d="M' + f(x - h * 0.36) + ' ' + f(ya) + ' H' + f(x + h * 0.36) + ' M' + f(x - h * 0.36) + ' ' + f(ya) + ' L' + f(x - w1) + ' ' + f(ya - h * 0.08) + ' M' + f(x + h * 0.36) + ' ' + f(ya) + ' L' + f(x + w1) + ' ' + f(ya - h * 0.08) + '"/>';
    s += '<path d="M' + f(x - h * 0.34) + ' ' + f(ya) + ' v' + f(h * 0.08) + ' M' + f(x + h * 0.34) + ' ' + f(ya) + ' v' + f(h * 0.08) + '" stroke="#c9ced4" stroke-width="' + f(Math.max(1.5, h / 40)) + '"/>';
    return s + '</g>';
  }
  // a line of towers at xs (bases on y, height h) with sagging wires and energy pulses running along them (dir ±1)
  function towerLine(t, xs, y, h, o) {
    o = o || {}; var s = "", p = "", sag = o.sag || h * 0.18, dir = o.dir == null ? 1 : o.dir, sp = o.sp || 0.8, hs = o.hs || xs.map(function () { return h; }), ys = o.ys || xs.map(function () { return y; });
    for (var i = 0; i < xs.length; i++) s += tower(xs[i], ys[i], hs[i], o.col);
    [-1, 1].forEach(function (side) {
      for (var i = 0; i < xs.length - 1; i++) {
        var a = [xs[i] + side * hs[i] * 0.34, ys[i] - hs[i] * 0.74], b = [xs[i + 1] + side * hs[i + 1] * 0.34, ys[i + 1] - hs[i + 1] * 0.74], c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2];
        s += '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(c[0]) + ' ' + f(c[1]) + ' ' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#2b2e33" stroke-width="1.6" fill="none"/>';
        if (o.flow !== false) for (var k = 0; k < 3; k++) { var q = ((t * sp * dir + k / 3 + i * 0.37) % 1 + 1) % 1, pt = qp(a, c, b, q); p += spark(pt[0], pt[1], Math.max(2, h / 40), t); }
      }
    });
    return s + p;
  }
  // a converter station: valve hall, transformers with bushings, a switchyard of gantries; mode 1 = AC→DC
  function converter(x, y, t, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">';
    g += '<rect x="-230" y="-4" width="460" height="10" fill="#bdb8ad"/>';
    g += R(-40, -110, 170, 110, "#e9ebee", 2.4) + '<path d="M-40 -110 L45 -132 L130 -110 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var r = 0; r < 7; r++) g += '<path d="M' + (-30 + r * 24) + ' -100 V-6" stroke="#c9ced4" stroke-width="2"/>';
    g += R(10, -40, 36, 40, "#5d93ad", 1.6) + R(70, -64, 40, 16, "#2f6f9f", 1.4);
    for (var k = 0; k < 3; k++) { var bx = -170 + k * 44; g += R(bx, -46, 34, 46, "#6f7f5a", 2) + '<path d="M' + (bx + 6) + ' -46 l3 -26 h4 l3 26 M' + (bx + 18) + ' -46 l3 -26 h4 l3 26" fill="#d9d4c8" stroke="' + INK + '" stroke-width="1.4"/>'; for (var fn = 0; fn < 3; fn++) g += '<path d="M' + (bx + 4 + fn * 10) + ' -36 v28" stroke="#4a5a3a" stroke-width="2"/>'; }
    g += '<path d="M-210 -90 V0 M-210 -90 H-180 V0 M150 -80 V0 M150 -80 H210 V0" stroke="#8a929c" stroke-width="3" fill="none"/><path d="M-210 -80 L-150 -72 M180 -70 L130 -60" stroke="#2b2e33" stroke-width="1.4"/>';
    var bl = Math.sin(t * 6) > 0; g += '<circle cx="118" cy="-122" r="4" fill="' + (bl ? "#ff5a4a" : "#7a2a20") + '"/>';
    return g + '</g>';
  }
  function flagEG(x, y, w, t) {
    var h = w * 0.66, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M0 0 V' + f(h * 2.4) + '" stroke="#5a5048" stroke-width="4"/>';
    for (var i = 0; i < 3; i++) { var col = ["#ce1126", "#ffffff", "#1c1c1c"][i], d = ""; for (var k = 0; k <= 10; k++) { var xx = w * k / 10; d += (k ? " L" : "M") + f(xx) + " " + f(i * h / 3 + Math.sin(t * 5 - k * 0.6) * k * 0.5); } for (var k2 = 10; k2 >= 0; k2--) { var x2 = w * k2 / 10; d += " L" + f(x2) + " " + f((i + 1) * h / 3 + Math.sin(t * 5 - k2 * 0.6) * k2 * 0.5); } s += '<path d="' + d + ' Z" fill="' + col + '"/>'; }
    s += '<circle cx="' + f(w / 2) + '" cy="' + f(h / 2 + Math.sin(t * 5 - 3) * 2.5) + '" r="' + f(h * 0.1) + '" fill="#c09300"/>';
    return s + '<rect width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + INK + '" stroke-width="2" opacity=".0"/></g>';
  }
  function flagSA(x, y, w, t) {
    var h = w * 0.66, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M0 0 V' + f(h * 2.4) + '" stroke="#5a5048" stroke-width="4"/>', d = "";
    for (var k = 0; k <= 10; k++) d += (k ? " L" : "M") + f(w * k / 10) + " " + f(Math.sin(t * 5 - k * 0.6) * k * 0.5);
    for (var k2 = 10; k2 >= 0; k2--) d += " L" + f(w * k2 / 10) + " " + f(h + Math.sin(t * 5 - k2 * 0.6) * k2 * 0.5);
    s += '<path d="' + d + ' Z" fill="#006c35"/>'; var wy = Math.sin(t * 5 - 3) * 2.5;
    s += '<path d="M' + f(w * 0.2) + ' ' + f(h * 0.38 + wy) + ' q' + f(w * 0.08) + ' -6 ' + f(w * 0.15) + ' 0 t' + f(w * 0.15) + ' 0 t' + f(w * 0.15) + ' 0 t' + f(w * 0.15) + ' 0" stroke="#fff" stroke-width="2.4" fill="none"/>';
    s += '<path d="M' + f(w * 0.22) + ' ' + f(h * 0.66 + wy) + ' H' + f(w * 0.76) + '" stroke="#fff" stroke-width="2.6"/><path d="M' + f(w * 0.72) + ' ' + f(h * 0.6 + wy) + ' v' + f(h * 0.12) + '" stroke="#fff" stroke-width="2"/>';
    return s + '</g>';
  }
  function clockF(x, y, r, t, sp, col) {
    var a = t * sp, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/><circle r="' + f(r * 0.86) + '" fill="none" stroke="' + (col || "#e2b035") + '" stroke-width="3"/>';
    for (var i = 0; i < 12; i++) s += '<path d="M' + f(Math.sin(i * Math.PI / 6) * r * 0.72) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.72) + ' L' + f(Math.sin(i * Math.PI / 6) * r * 0.8) + ' ' + f(-Math.cos(i * Math.PI / 6) * r * 0.8) + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M0 0 L' + f(Math.sin(a / 12) * r * 0.45) + ' ' + f(-Math.cos(a / 12) * r * 0.45) + '" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M0 0 L' + f(Math.sin(a) * r * 0.66) + ' ' + f(-Math.cos(a) * r * 0.66) + '" stroke="#c23a26" stroke-width="3" stroke-linecap="round"/>';
    return s + '<circle r="4" fill="' + INK + '"/></g>';
  }
  function acUnit(x, y, t, s) { var a = t * 900, g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + R(-18, -14, 36, 28, "#f4f1e8", 1.6) + '<circle r="10" fill="#c9ced4" stroke="' + INK + '" stroke-width="1.2"/>'; for (var b = 0; b < 3; b++) g += '<path d="M0 0 L9 -3 L9 3 Z" fill="#5a6068" transform="rotate(' + f(a + b * 120) + ')"/>'; return g + '</g>'; }
  // a building block with windows (lit = 0..1 share of windows on, by hash) and optional AC units
  function block(x, y, w, h, col, lit, t, ac) {
    var s = R(x, y - h, w, h, col, 2);
    for (var r = 0; r < Math.floor((h - 12) / 20); r++) for (var c = 0; c < Math.floor((w - 8) / 16); c++) { var on = hash(r * 13 + c * 7 + x) < lit; s += '<rect x="' + f(x + 7 + c * 16) + '" y="' + f(y - h + 10 + r * 20) + '" width="9" height="11" fill="' + (on ? "#ffe08a" : "#3a4a5a") + '"/>'; }
    if (ac) for (var k = 0; k < 2; k++) s += acUnit(x + w - 6, y - h + 26 + k * 40, t + k, 0.55);
    return s;
  }
  // the map: Egypt, Sinai, the Gulf of Aqaba, NW Saudi Arabia (lon/lat → world)
  function P(lon, lat) { return [(lon - 29) * 48 + 30, (31.8 - lat) * 52 + 20]; }
  function poly(pts, close) { return pts.map(function (q, i) { var p = P(q[0], q[1]); return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join(" ") + (close ? " Z" : ""); }
  var RED = [[32.55, 29.95], [32.6, 29.6], [33.1, 28.7], [33.6, 27.9], [33.95, 27.1], [34.6, 26.0], [35.5, 24.0], [36.9, 22.0], [37.5, 21.0], [39.8, 21.0], [39.1, 22.4], [38.1, 24.1], [37.3, 25.0], [36.5, 26.0], [35.6, 27.3], [34.62, 28.05], [34.8, 28.6], [34.95, 29.35], [35.0, 29.55], [34.88, 29.47], [34.7, 28.9], [34.45, 28.05], [34.25, 27.75], [33.7, 28.4], [33.2, 29.0], [32.7, 29.9]];
  var MED = [[25, 31.0], [29, 30.9], [30.3, 31.45], [31.0, 31.6], [31.9, 31.5], [32.3, 31.25], [33.2, 31.15], [34.2, 31.3], [34.6, 31.8], [35.0, 32.8], [35.0, 34], [25, 34]];
  var NILE = [[33.0, 23.5], [32.9, 24.1], [32.8, 25.7], [31.8, 26.4], [31.2, 27.2], [30.8, 28.0], [31.3, 29.0], [31.2, 30.1]];
  var ROUTE = [[31.73, 30.12], [32.35, 30.05], [33.2, 29.6], [34.1, 29.0], [34.6, 28.55], [34.86, 28.45], [35.6, 28.4], [36.57, 28.38], [37.6, 27.0], [38.6, 25.7], [39.65, 24.47]];
  var CITY = { badr: [31.73, 30.12], cairo: [31.24, 30.04], tabuk: [36.57, 28.38], madinah: [39.65, 24.47] };
  function routeLen() { var L0 = [0]; for (var i = 1; i < ROUTE.length; i++) { var a = P(ROUTE[i - 1][0], ROUTE[i - 1][1]), b = P(ROUTE[i][0], ROUTE[i][1]); L0.push(L0[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); } return L0; }
  var RL = routeLen();
  function routeAt(p) { var d = clamp(p) * RL[RL.length - 1], i = 1; while (i < RL.length - 1 && RL[i] < d) i++; var k = (d - RL[i - 1]) / (RL[i] - RL[i - 1] || 1), a = P(ROUTE[i - 1][0], ROUTE[i - 1][1]), b = P(ROUTE[i][0], ROUTE[i][1]); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), i]; }
  function dot(p, t, col, big) { var q = P(p[0], p[1]), r = big ? 9 : 6; return '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(r * 2 + 3 * Math.sin(t * 4)) + '" fill="' + (col || "#c23a26") + '" opacity=".3"/><circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + r + '" fill="' + (col || "#c23a26") + '" stroke="#fff" stroke-width="2.4"/>'; }
  function mapRS(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1500" height="1100" fill="' + SAND + '"/>';
    for (var i = 0; i < 70; i++) { var dx = -300 + hash(i) * 1200, dy = -200 + hash(i + 3) * 800; s += '<path d="M' + f(dx) + ' ' + f(dy) + ' q20 -14 40 0" stroke="#c9b07a" stroke-width="3" fill="none"/>'; }
    s += '<path d="' + poly(MED, true) + '" fill="' + SEAC + '" stroke="#2b6f9a" stroke-width="2.4"/><path d="' + poly(RED, true) + '" fill="' + SEAC + '" stroke="#2b6f9a" stroke-width="2.4"/>';
    for (var w = 0; w < 10; w++) { var wx = P(36 + hash(w) * 2.5, 26.5 - hash(w + 4) * 4), ph = (t * 0.6 + hash(w)) % 1; s += '<path d="M' + f(wx[0] - 8) + ' ' + f(wx[1]) + ' q4 -4 8 0 t8 0" stroke="#bfe6f7" stroke-width="2" fill="none" opacity="' + f(Math.sin(ph * Math.PI)) + '"/>'; }
    s += '<path d="' + poly(NILE) + '" stroke="#2b86b5" stroke-width="4" fill="none"/><path d="' + poly([[31.2, 30.1], [30.4, 31.4]]) + ' ' + poly([[31.2, 30.1], [31.8, 31.5]]) + '" stroke="#2b86b5" stroke-width="3" fill="none"/>';
    s += '<path d="' + poly([[32.3, 31.25], [32.55, 29.95]]) + '" stroke="#2b86b5" stroke-width="2.4" fill="none"/>';
    if (o.border) s += '<path d="' + poly([[25, 22], [36.9, 22]]) + ' ' + poly([[34.25, 31.3], [34.9, 29.5]]) + '" stroke="#8a7448" stroke-width="2" stroke-dasharray="6 5" fill="none"/>';
    var rp = o.route == null ? 0 : clamp(o.route);
    if (rp > 0) { var e = routeAt(rp), d = "M" + f(P(ROUTE[0][0], ROUTE[0][1])[0]) + " " + f(P(ROUTE[0][0], ROUTE[0][1])[1]); for (var j = 1; j < e[2]; j++) { var q = P(ROUTE[j][0], ROUTE[j][1]); d += " L" + f(q[0]) + " " + f(q[1]); } d += " L" + f(e[0]) + " " + f(e[1]);
      s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="#f2c230" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
      var cs = P(34.6, 28.55), ce = P(34.86, 28.45); if (rp > 0.33) s += '<path d="M' + f(cs[0]) + ' ' + f(cs[1]) + ' L' + f(ce[0]) + ' ' + f(ce[1]) + '" stroke="#ff7a3a" stroke-width="5" stroke-dasharray="3 3"/>';
      if (o.flow) for (var k = 0; k < 12; k++) { var pp = ((t * 0.12 * (o.dir || 1) + k / 12) % 1 + 1) % 1; if (pp < rp) { var z = routeAt(pp); s += spark(z[0], z[1], 4.5, t); } } }
    (o.cities || []).forEach(function (c) { s += dot(CITY[c], t, c === "cairo" ? "#5a6068" : "#c23a26", c !== "cairo"); });
    return s;
  }
  // the cable ship laying the cable from a big turntable at its stern
  function cableShip(x, y, t, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.6) * 2) + ') rotate(' + f(Math.sin(t * 1.1) * 1.2) + ') scale(' + (s || 1) + ')">';
    g += '<path d="M-150 -10 H150 L130 18 H-140 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2.6"/><path d="M-150 -10 H150 V-2 H-150 Z" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.6"/>';
    g += R(60, -64, 70, 54, "#f4f1e8", 2.2) + R(70, -86, 44, 22, "#f4f1e8", 2) + '<path d="M78 -76 h28" stroke="#5d93ad" stroke-width="6"/>';
    g += '<ellipse cx="-50" cy="-22" rx="64" ry="14" fill="#5a6068" stroke="' + INK + '" stroke-width="2.4"/><ellipse cx="-50" cy="-28" rx="64" ry="14" fill="#2b2e33" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var r = 0; r < 4; r++) g += '<ellipse cx="-50" cy="-28" rx="' + (56 - r * 12) + '" ry="' + (11 - r * 2.4) + '" fill="none" stroke="#e2b035" stroke-width="2" stroke-dasharray="10 6" stroke-dashoffset="' + f(t * 30 * (r % 2 ? 1 : -1)) + '"/>';
    g += '<path d="M-150 -14 A16 16 0 0 1 -150 14" stroke="#8a929c" stroke-width="6" fill="none"/>';
    return g + '</g>';
  }
  // the cable cut open: copper core, insulation, lead sheath, steel armour wires, outer serving (k reveals layers)
  function cableSection(x, y, r, t, k) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(t * 8) + ')">', L5 = [[1, "#2b2e33"], [0.88, "#8a929c"], [0.7, "#5a6068"], [0.6, "#f4f1e8"], [0.34, "#d0873a"]];
    L5.forEach(function (l, i) { var sc = pop((k * 5 - (4 - i)) * 0.9); if (sc > 0) s += '<circle r="' + f(r * l[0] * sc) + '" fill="' + l[1] + '" stroke="' + INK + '" stroke-width="2"/>'; });
    if (k > 0.3) for (var a = 0; a < 26; a++) { var an = a / 26 * Math.PI * 2; s += '<circle cx="' + f(Math.cos(an) * r * 0.79) + '" cy="' + f(Math.sin(an) * r * 0.79) + '" r="' + f(r * 0.085) + '" fill="#c9ced4" stroke="' + INK + '" stroke-width="1"/>'; }
    if (k > 0.85) for (var c = 0; c < 7; c++) { var cn = c / 7 * Math.PI * 2; s += '<circle cx="' + f(c ? Math.cos(cn) * r * 0.2 : 0) + '" cy="' + f(c ? Math.sin(cn) * r * 0.2 : 0) + '" r="' + f(r * 0.1) + '" fill="#e8a050" stroke="#8a4a1a"/>'; }
    return s + '</g>';
  }
  // a calendar page
  function cal(x, y, top, big, t, col) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(Math.sin(t * 2) * 3) + ')">' + R(-56, -60, 112, 120, "#fbfbf7", 3) + R(-56, -60, 112, 32, col || "#c23a26", 3) + '<text y="-37" text-anchor="middle" class="tag" style="font-size:18px;fill:#fff">' + top + '</text><text y="34" text-anchor="middle" class="tag" style="font-size:38px;fill:' + INK + '">' + big + '</text></g>'; }
  function coin(x, y, t, i) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(Math.cos(t * 3 + i)) + ' 1)"><circle r="16" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/><text y="7" text-anchor="middle" style="font:900 18px Noto Sans Arabic;fill:#a87a10">$</text></g>'; }
  function bar(x, y, w, h, k, col, label) { return R(x, y - h, w, h, "#2a3442", 2.4) + '<rect x="' + f(x + 4) + '" y="' + f(y - 4 - (h - 8) * k) + '" width="' + f(w - 8) + '" height="' + f((h - 8) * k) + '" fill="' + col + '"/>'; }
  function desert(t, y, night) { var s = sky(night ? "night" : "day") + (night ? stars(t) : clouds(t, 10, y - 170, 4, 0.8)); s += '<path d="M-400 ' + y + ' L-200 ' + (y - 70) + ' L-60 ' + (y - 20) + ' L120 ' + (y - 110) + ' L260 ' + (y - 30) + ' L420 ' + (y - 90) + ' L620 ' + (y - 25) + ' L800 ' + (y - 80) + ' L1100 ' + y + ' Z" fill="' + (night ? "#4a3a4a" : "#c98a5a") + '" stroke="#8a5a3a" stroke-width="2"/>'; return s + '<rect x="-400" y="' + y + '" width="1500" height="600" fill="' + (night ? "#5a4a4a" : SAND) + '"/>' + '<path d="M-400 ' + (y + 30) + ' Q0 ' + (y + 20) + ' 400 ' + (y + 34) + ' T1100 ' + (y + 30) + '" stroke="#c9b07a" stroke-width="3" fill="none"/>'; }

  // 0 — did you know Egypt will give Saudi Arabia electricity, and Saudi Arabia will give Egypt electricity?
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(200, 180, k), lerp(1.25, 1.0, k)]; }, function (u, d, t) {
    var dir = u < d / 2 ? 1 : -1, s = sky("day") + clouds(t, 16, 30, 4, 0.8) + '<rect x="-400" y="250" width="1500" height="400" fill="' + SAND + '"/>';
    s += flagEG(30, 70, 90, t) + flagSA(520, 70, 90, t) + towerLine(t, [140, 320, 500], 250, 140, { dir: dir, sp: 1.2 });
    s += hardHat(320, 290, 0.3, t, "shock", {}) + qmark(250, 90, t, 46) + qmark(400, 80, t + 1, 40);
    return s + tag("مصر", 75, 30, u, 0.4, -3, 24) + tag("السعودية", 565, 30, u, 1.6, 3, 22, "#bfe8c0");
  });
  // 1 — and it will cross the Red Sea in a cable under the water?
  shot(1, function (u, d) { var k = ease(clamp(u / d)); return [lerp(260, 380, k), lerp(150, 220, k), lerp(1.0, 1.12, k)]; }, function (u, d, t) {
    var s = sea(t, 90, 0.3, {}) + fish(t, 180, 30, 3) + seabed(t, 300);
    s += '<path d="M-400 296 Q100 290 300 298 T1100 294" stroke="' + INK + '" stroke-width="10" fill="none"/><path d="M-400 296 Q100 290 300 298 T1100 294" stroke="#3a3f46" stroke-width="6" fill="none"/>';
    for (var k = 0; k < 9; k++) { var x = ((t * 120 + k * 170) % 1500) - 400; s += spark(x, 295 + Math.sin(x * 0.01) * 2, 5, t); }
    s += bubbles(t, 200, 290, 6, 1, 20, 100) + bubbles(t, 480, 290, 6, 1.3, 20, 100);
    return s + tag("تحت البحر الأحمر", 320, 230, u, 0.5, -3, 22, "#bfe0ff");
  });
  // 2 — brand
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(240, 380, k), lerp(230, 170, k), lerp(0.85, 1.15, k)]; }, function (u, d, t) {
    return mapRS(t, { route: 1, flow: true, cities: ["badr", "tabuk", "madinah"] }) + qmark(250, 140, t, 60) + qmark(420, 260, t + 1, 54) + tag("إيه الحكاية؟", 330, 190, u, 0.1, -3, 30);
  });
  // 3 — the Egypt–Saudi electricity interconnection, 3,000 megawatts
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(200, 360, k), lerp(130, 230, k), lerp(1.2, 0.85, k)]; }, function (u, d, t) {
    return mapRS(t, { route: (u - 0.3) / 2.6, flow: true, cities: ["badr", "tabuk", "madinah"], border: true }) + tag("مصر", 120, 230, u, 0.2, -3, 22) + tag("السعودية", 470, 150, u, 0.6, 3, 22, "#bfe8c0") + tag("3000 ميجاوات", 360, 330, u, 2.0, -3, 26);
  });
  // 4 — when we need it we take from them, and when they need it they take from us
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(250, 390, k), 180, lerp(1.08, 0.98, k)]; }, function (u, d, t) {
    var half = d / 2, dir = u < half ? -1 : 1, s = sky("day") + clouds(t, 18, 20, 4, 0.8) + '<rect x="-400" y="270" width="1500" height="400" fill="' + SAND + '"/>';
    s += block(-60, 270, 80, 120, "#d9c79a", 0.4, t) + block(30, 270, 60, 90, "#c79a7b", 0.5, t) + block(560, 270, 70, 130, "#e9ebee", 0.4, t) + block(640, 270, 80, 100, "#d9d4c8", 0.5, t);
    s += towerLine(t, [130, 320, 510], 270, 150, { dir: dir, sp: 1.3 });
    s += arrow(dir < 0 ? 460 : 180, 320, dir < 0 ? 180 : 460, 320, "#f2c230", 6, clamp(((u % half) - 0.2) * 1.5));
    return s + flagEG(-30, 40, 56, t) + flagSA(620, 40, 56, t) + tag(dir < 0 ? "ناخد منهم" : "ياخدوا مننا", 320, 60, u, dir < 0 ? 0.3 : half + 0.1, -3, 24);
  });
  // 5 — why? because peak time here is not peak time there
  shot(5, function (u, d) { var k = clamp(u / d); return [320, lerp(170, 190, k), lerp(0.95, 1.15, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>' + clockF(170, 190, 90, t, 3.2, "#c23a26") + clockF(470, 190, 90, t + 2, 3.2, "#006c35");
    s += flagEG(130, 40, 40, t) + flagSA(430, 40, 40, t) + qmark(320, 200, t, 60);
    return s + tag("وقت الذروة", 320, 330, u, 0.8, -3, 26) + tag("≠", 320, 120, u, 1.8, 0, 34, "#f2a0a0");
  });
  // 6 — in Saudi Arabia the heat strikes at noon, and every air conditioner is on
  shot(6, function (u, d) { var k = ease(clamp(u / d)); return [lerp(380, 260, k), lerp(140, 200, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = sky("day") + '<rect x="-400" y="-300" width="1500" height="1000" fill="#ffd27a" opacity=".35"/>' + sun(320, 10, 46, "#ffd23a") + '<rect x="-400" y="290" width="1500" height="400" fill="' + SAND + '"/>';
    for (var r = 0; r < 12; r++) { var an = r / 12 * Math.PI * 2 + t * 0.5; s += '<path d="M' + f(320 + Math.cos(an) * 60) + ' ' + f(10 + Math.sin(an) * 60) + ' L' + f(320 + Math.cos(an) * 84) + ' ' + f(10 + Math.sin(an) * 84) + '" stroke="#f2a020" stroke-width="5" stroke-linecap="round"/>'; }
    [[0, 150], [90, 190], [190, 130], [300, 210], [410, 160], [510, 200], [600, 140]].forEach(function (b, i) { s += block(b[0], 290, 90, b[1], ["#e9ebee", "#d9c79a", "#f4f1e8", "#c79a7b"][i % 4], 0.3, t + i, true); });
    for (var h = 0; h < 8; h++) { var hx = 20 + h * 85, ph = (t * 0.8 + h * 0.3) % 1; s += '<path d="M' + hx + ' ' + f(280 - ph * 60) + ' q8 -10 0 -20 t0 -20" stroke="#f2a020" stroke-width="3" fill="none" opacity="' + f(1 - ph) + '"/>'; }
    return s + tag("الضهر", 150, 50, u, 0.4, -3, 26) + tag("التكييفات شغالة", 470, 60, u, 1.8, 3, 22, "#bfe0ff") + flagSA(560, -50, 40, t);
  });
  // 7 — in Egypt use climbs at night, when people come home and switch on the lights
  shot(7, function (u, d) { var k = ease(clamp(u / d)); return [lerp(240, 400, k), 190, lerp(1.12, 0.98, k)]; }, function (u, d, t) {
    var lit = clamp((u - 0.4) / (d - 1)), s = sky("night") + stars(t) + moon(520, 50) + '<rect x="-400" y="290" width="1500" height="400" fill="#2a2a34"/>';
    [[-60, 140], [30, 180], [130, 120], [220, 200], [330, 150], [430, 190], [530, 130], [620, 170]].forEach(function (b, i) { s += block(b[0], 290, 86, b[1], ["#5a5048", "#6a5a4a", "#4a4a5a", "#5a4a3a"][i % 4], lit, t); });
    s += '<rect x="-400" y="290" width="1500" height="12" fill="#3f3d3a"/>' + carSide(((t * 90) % 1000) - 200, 300, t, 0.2, "#e2b035");
    return s + flagEG(30, -60, 40, t) + tag("بالليل", 160, 30, u, 0.4, -3, 26) + tag("الناس بتنور", 470, 240, u, 1.8, 3, 20);
  });
  // 8 — a gap of three to six hours, so each country lends the other power when it is squeezed
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(290, 350, k), 175, lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#f4efe2"/>' + '<path d="M40 300 H600 M40 300 V60" stroke="' + INK + '" stroke-width="3"/>';
    function curve(pk, col) { var dd = ""; for (var i = 0; i <= 60; i++) { var x = 40 + i * 560 / 60, h = 60 + 150 * Math.exp(-Math.pow((i / 60 * 24 - pk) / 2.6, 2)); dd += (i ? " L" : "M") + f(x) + " " + f(300 - h); } return '<path d="' + dd + '" stroke="' + INK + '" stroke-width="7" fill="none"/><path d="' + dd + '" stroke="' + col + '" stroke-width="4" fill="none"/>'; }
    s += curve(14, "#006c35") + curve(20, "#c23a26");
    var mx = 40 + (t * 40 % 560); s += '<path d="M' + f(mx) + ' 60 V300" stroke="#2f6f9f" stroke-width="2" stroke-dasharray="6 5"/>';
    var x14 = 40 + 14 / 24 * 560, x20 = 40 + 20 / 24 * 560; s += arrow(x14, 70, x20, 70, "#f2c230", 5, clamp((u - 0.6) * 1.2)) + arrow(x20, 40, x14, 40, "#f2c230", 5, clamp((u - 2.4) * 1.2));
    for (var h = 0; h <= 24; h += 6) s += '<text x="' + f(40 + h / 24 * 560) + '" y="326" text-anchor="middle" style="font:800 16px Noto Sans Arabic;fill:' + INK + '">' + h + '</text>';
    return s + tag("3 – 6 ساعات", 420, 110, u, 0.4, 3, 24) + tag("تسلّف التانية", 200, 140, u, 2.6, -3, 20, "#bfe8c0");
  });
  // 9 — the problem: 50 Hz and 60 Hz can't be joined directly
  shot(9, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(0.95, 1.18, k)]; }, function (u, d, t) {
    var g = ease(clamp((u - 1.2) / 1.6)), s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#1f2a38"/>';
    s += wave(lerp(-60, 30, g), 140, 250, 34, 5, -t * 10, "#ff7a6a") + wave(lerp(420, 340, g), 230, 250, 34, 6, -t * 12, "#7cf29a");
    if (u > 2.8) { s += spark(305, 185, 10 + 4 * Math.sin(t * 30), t, "#ff5a4a"); for (var k = 0; k < 8; k++) { var an = k / 8 * 6.28 + t * 5, rr = 20 + ((t * 80 + k * 9) % 30); s += '<path d="M' + f(305 + Math.cos(an) * rr) + ' ' + f(185 + Math.sin(an) * rr) + ' l' + f(Math.cos(an) * 8) + ' ' + f(Math.sin(an) * 8) + '" stroke="#ffe46a" stroke-width="3"/>'; } s += '<path d="M260 140 L350 230 M350 140 L260 230" stroke="#ff3a2a" stroke-width="12" stroke-linecap="round" opacity="' + f(clamp((u - 3.2) * 2)) + '"/>'; }
    return s + flagEG(10, 30, 40, t) + flagSA(560, 260, 40, t) + tag("50 هيرتز", 130, 70, u, 0.3, -3, 24, "#f2a0a0") + tag("60 هيرتز", 500, 320, u, 1.0, 3, 24, "#bfe8c0");
  });
  // 10 — the fix: turn it into direct current, which has no frequency at all
  shot(10, function (u, d) { var k = clamp(u / d); return [lerp(230, 410, k), 180, lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#1f2a38"/>' + wave(-200, 180, 420, 40, 6, -t * 10, "#ff7a6a") + wave(380, 180, 460, 0, 1, 0, GLOW, 7);
    for (var k = 0; k < 6; k++) { var x = 380 + ((t * 140 + k * 80) % 460); s += spark(x, 180, 5, t); }
    s += '<g transform="translate(320 180) rotate(' + f(Math.sin(t * 3) * 2) + ')">' + R(-70, -70, 140, 140, "#5d93ad", 3) + '<text y="-12" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:#fff">AC</text><text y="34" text-anchor="middle" style="font:900 30px Noto Sans Arabic;fill:' + GLOW + '">DC</text><path d="M-40 0 H40" stroke="#fff" stroke-width="3"/></g>';
    return s + tag("متردد", 100, 90, u, 0.3, -3, 22, "#f2a0a0") + tag("تيار مستمر", 540, 90, u, 1.2, 3, 24) + tag("ملوش تردد", 540, 280, u, 2.6, -3, 20, "#bfe0ff");
  });
  // 11 — the technology is called HVDC, at 500 kilovolts
  shot(11, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(150, 200, k), lerp(1.25, 0.95, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#122033"/>' + towerLine(t, [-120, 120, 360, 600, 840], 330, 220, { sp: 1.6 });
    var k = pop((u - 0.3) / 1.0); if (k > 0) s += '<g transform="translate(320 150) scale(' + f(k) + ') rotate(-3)"><text text-anchor="middle" y="20" style="font:900 86px Noto Sans Arabic;fill:' + GLOW + ';stroke:' + INK + ';stroke-width:6;paint-order:stroke">HVDC</text></g>';
    s += bolt(120, 90 + Math.sin(t * 6) * 6, 1.6) + bolt(530, 90 + Math.cos(t * 6) * 6, 1.6);
    return s + tag("500 كيلوفولت", 320, 250, u, 1.6, 3, 26, "#f2a0a0");
  });
  // 12 — it starts at the Badr station, east of Cairo
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(300, 160, k), lerp(200, 110, k), lerp(0.9, 1.7, k)]; }, function (u, d, t) {
    var b = P(31.73, 30.12), c = P(31.24, 30.04);
    return mapRS(t, { cities: ["cairo", "badr"] }) + '<text x="' + f(c[0] - 14) + '" y="' + f(c[1] + 4) + '" text-anchor="end" style="font:800 12px Noto Sans Arabic;fill:' + INK + '">القاهرة</text>' + arrow(c[0] + 8, c[1] + 12, b[0] - 6, b[1] + 6, "#c23a26", 2, clamp((u - 1.0) * 1.5)) + tag("محطة بدر", b[0] + 40, b[1] - 40, u, 1.6, -3, 16) + tag("شرق القاهرة", 300, 300, u, 0.4, 3, 22);
  });
  // 13 — a huge converter station turns the alternating current into direct current
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(230, 400, k), lerp(200, 170, k), lerp(1.12, 1.0, k)]; }, function (u, d, t) {
    var s = desert(t, 260) + converter(320, 268, t, 1.1) + wave(-300, 200, 330, 16, 6, -t * 10, "#ff7a6a", 3) + wave(470, 200, 500, 0, 1, 0, GLOW, 5);
    for (var k = 0; k < 6; k++) s += spark(470 + ((t * 120 + k * 80) % 500), 200, 4, t);
    s += hardHat(560, 330, 0.18, t, "happy", { point: true });
    return s + tag("محطة تحويل", 320, 40, u, 0.4, -3, 24) + tag("من متردد لمستمر", 330, 300, u, 1.6, 3, 20, "#bfe0ff");
  });
  // 14 — from Badr the lines march on towers across Sinai to the Gulf of Aqaba
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(160, 520, k), lerp(190, 170, k), lerp(1.05, 0.95, k)]; }, function (u, d, t) {
    var s = desert(t, 230) + towerLine(t, [-200, 40, 280, 520, 760, 1000], 300, 130, { sp: 1.1 });
    s += '<path d="M900 300 Q960 296 1100 300 V420 H880 Z" fill="' + SEAC + '"/>';
    return s + tag("سينا", 160, 60, u, 0.4, -3, 26) + tag("خليج العقبة", 820, 80, u, 2.2, 3, 22, "#bfe0ff");
  });
  // 15 — and here comes the hardest part: the sea
  shot(15, function (u, d) { var k = ease(clamp(u / d)); return [lerp(220, 420, k), lerp(180, 210, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 18, 20, 4, 0.8) + '<path d="M300 240 L800 240 L800 600 L340 600 Z" fill="url(#sea1)"/>' + waves(t, 240).replace(/M-400/g, "M-400");
    s += '<path d="M-400 240 H300 L350 600 H-400 Z" fill="' + SAND + '" stroke="#8a7448" stroke-width="2"/>' + towerLine(t, [-60, 160], 240, 150, { sp: 1.2 }) + hardHat(260, 290, 0.18, t, "shock", { point: true, look: 1 });
    s += '<path d="M560 240 L620 200 L680 226 L740 190 L820 240 Z" fill="#c98a5a" opacity=".7"/>';
    return s + tag("البحر!", 520, 100, u, 0.6, 3, 34, "#bfe0ff") + tag("أصعب جزء", 150, 40, u, 0.2, -3, 22);
  });
  // 16 — a cable about 22 km long lies on the bed of the Gulf of Aqaba
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(200, 440, k), lerp(140, 230, k), lerp(1.0, 0.92, k)]; }, function (u, d, t) {
    var sx = lerp(120, 460, clamp(u / d)), s = sea(t, 80, 0.4, {}) + fish(t, 200, 26, 3) + seabed(t, 330) + cableShip(sx, 80, t, 0.7);
    var d1 = "M" + f(sx - 105) + " 90 Q" + f(sx - 140) + " 260 " + f(sx - 300) + " 326 L-400 326";
    s += '<path d="' + d1 + '" stroke="' + INK + '" stroke-width="9" fill="none"/><path d="' + d1 + '" stroke="#3a3f46" stroke-width="5" fill="none"/>';
    s += bubbles(t, sx - 120, 200, 6, 1, 14, 90);
    return s + tag("22 كم", 200, 260, u, 0.6, -3, 28) + tag("قاع خليج العقبة", 480, 290, u, 2.0, 3, 20, "#e8c48e");
  });
  // 17 — the cable is wrapped in insulating layers and steel armour to take the water pressure
  shot(17, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(0.95, 1.12, k)]; }, function (u, d, t) {
    var k = clamp((u - 0.2) / 2.6), s = sea(t, -400, 0.7, {}) + cableSection(320, 180, 110, t, k);
    for (var a = 0; a < 8; a++) { var an = a / 8 * Math.PI * 2, rr = 170 + Math.sin(t * 4 + a) * 8; s += arrow(320 + Math.cos(an) * (rr + 40), 180 + Math.sin(an) * (rr + 40), 320 + Math.cos(an) * rr, 180 + Math.sin(an) * rr, "#bfe0ff", 3, clamp((u - 2.6) * 1.5)); }
    return s + tag("طبقات عازلة", 120, 60, u, 1.0, -3, 20, "#f4f1e8") + tag("تسليح حديد", 520, 60, u, 1.8, 3, 20, "#c9ced4") + tag("ضغط المية", 320, 340, u, 2.8, -3, 22, "#bfe0ff");
  });
  // 18 — why DC? alternating current loses a large part of itself in a long cable under water
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, lerp(1.08, 0.98, k)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.5, {}) + '<path d="M-400 120 H1100 M-400 250 H1100" stroke="' + INK + '" stroke-width="20"/><path d="M-400 120 H1100 M-400 250 H1100" stroke="#3a3f46" stroke-width="14"/>';
    for (var k = 0; k < 10; k++) { var x = ((t * 110 + k * 120) % 1300) - 300, fade = clamp(1 - (x + 300) / 1200); s += '<g opacity="' + f(0.15 + 0.85 * fade) + '">' + spark(x, 120, 6, t, "#ff7a6a") + '</g>'; if (hash(k) < 0.7) s += '<circle cx="' + f(x - 20) + '" cy="' + f(100 - ((t * 40 + k * 13) % 60)) + '" r="4" fill="#ff7a6a" opacity="' + f(0.6 * fade) + '"/>'; }
    for (var j = 0; j < 10; j++) s += spark(((t * 110 + j * 120) % 1300) - 300, 250, 6, t);
    return s + tag("متردد: بيضيع", 150, 60, u, 0.6, -3, 22, "#f2a0a0") + tag("مستمر: يوصل", 470, 320, u, 2.0, 3, 22, "#bfe8c0");
  });
  // 19 — on the other shore the lines carry on to Tabuk, then to East Madinah
  shot(19, function (u, d) { var k = clamp(u / d); var p = P(lerp(35.2, 38.6, k), lerp(28.6, 25.6, k)); return [p[0], p[1], lerp(1.8, 1.25, k)]; }, function (u, d, t) {
    var tb = P(36.57, 28.38), md = P(39.65, 24.47);
    return mapRS(t, { route: lerp(0.32, 1, clamp((u - 0.2) / (d - 0.8))), flow: true, cities: ["tabuk", "madinah"] }) + tag("تبوك", tb[0], tb[1] - 26, u, 0.8, -3, 14) + tag("شرق المدينة المنورة", md[0] - 30, md[1] - 28, u, 2.6, 3, 13, "#bfe8c0");
  });
  // 20 — in those two stations the DC turns back into AC at 60 Hz
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(400, 240, k), lerp(170, 200, k), lerp(1.12, 1.0, k)]; }, function (u, d, t) {
    var s = desert(t, 260, false) + converter(320, 268, t + 3, 1.1) + wave(-300, 200, 330, 0, 1, 0, GLOW, 5) + wave(470, 200, 500, 16, 7, -t * 12, "#7cf29a", 3);
    for (var k = 0; k < 6; k++) s += spark(-300 + ((t * 120 + k * 60) % 330), 200, 4, t);
    s += flagSA(40, 20, 50, t);
    return s + tag("من مستمر لمتردد", 320, 40, u, 0.4, -3, 22) + tag("60 هيرتز", 470, 120, u, 1.6, 3, 24, "#bfe8c0");
  });
  // 21 — about 1,350 km of lines in all, longer than Egypt from north to south
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(150, 340, k), lerp(110, 240, k), lerp(1.2, 0.8, k)]; }, function (u, d, t) {
    var s = mapRS(t, { route: 1, flow: true, cities: ["badr", "tabuk", "madinah"], border: true }), g = ease(clamp((u - 1.6) / 1.6)), top = P(29.5, 31.6), bot = P(29.5, 22);
    s += '<path d="M' + f(top[0]) + ' ' + f(top[1]) + ' V' + f(lerp(top[1], bot[1], g)) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M' + f(top[0]) + ' ' + f(top[1]) + ' V' + f(lerp(top[1], bot[1], g)) + '" stroke="#c23a26" stroke-width="5" stroke-linecap="round"/>';
    return s + tag("1350 كم", 400, 120, u, 0.4, 3, 26) + tag("أطول من مصر", top[0] + 70, lerp(top[1], bot[1], 0.6), u, 2.4, -3, 18, "#f2a0a0");
  });
  // 22 — it costs about 1.8 billion dollars, and the deal goes back to 2012
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(190, 170, k), lerp(1.12, 0.98, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#f4efe2"/>', n = Math.floor(18 * clamp((u - 0.1) / (d - 0.4)));
    for (var c = 0; c < n; c++) s += coin(120 + (c % 3) * 60, 300 - Math.floor(c / 3) * 22, t, c);
    s += cal(480, 190, "الاتفاق", "2012", t, "#2f6f9f");
    return s + tag("1.8 مليار دولار", 180, 70, u, 0.6, -3, 24, "#bfe8c0");
  });
  // 23 — two phases, 1,500 MW each
  shot(23, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(210, 160, k), lerp(1.2, 0.95, k)]; }, function (u, d, t) {
    var a = ease(clamp(u / 1.6)), b = clamp((u - 1.6) / (d - 1.7)), s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#1f2a38"/>';
    s += bar(160, 320, 100, 220, a, "#f2c230") + bar(380, 320, 100, 220, b, "#7cf29a") + bolt(210, 60 + Math.sin(t * 7) * 14, 1.6) + bolt(430, 60 + Math.cos(t * 7) * 14, 1.6);
    return s + tag("1500", 210, 180, u, 1.0, -3, 26) + tag("1500", 430, 180, u, 2.3, 3, 26, "#bfe8c0") + tag("+", 320, 180, u, 2.0, 0, 30, "#f4f1e8") + tag("مرحلتين", 320, 340, u, 0.3, -3, 22);
  });
  // 24 — the tests are almost done, official start targeted for mid-November
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(230, 400, k), lerp(180, 200, k), lerp(1.1, 1.0, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#2a3442"/>', inner = "";
    for (var r = 0; r < 4; r++) { var ok = u > 0.5 + r * 0.5; inner += '<rect x="-110" y="' + (-70 + r * 34) + '" width="160" height="12" rx="6" fill="#3a5a6a"/><rect x="-110" y="' + (-70 + r * 34) + '" width="' + f(160 * clamp((u - r * 0.5) / 0.5)) + '" height="12" rx="6" fill="#7cf29a"/>' + (ok ? '<path d="M70 ' + (-64 + r * 34) + ' l8 8 l16 -18" stroke="#7cf29a" stroke-width="5" fill="none"/>' : ""); }
    s += monitor(230, 180, 260, 170, inner) + cal(500, 170, "نوفمبر", "15", t, "#c23a26") + hardHat(380, 320, 0.18, t, "happy", {});
    return s + tag("الاختبارات في آخرها", 230, 40, u, 0.4, -3, 20) + tag("نص نوفمبر", 500, 300, u, 2.0, 3, 24);
  });
  // 25 — if it goes to plan, it could be a first step toward a shared Arab power market
  shot(25, function (u, d) { var k = clamp(u / d); return [lerp(420, 260, k), lerp(280, 170, k), lerp(1.15, 0.7, k)]; }, function (u, d, t) {
    var s = mapRS(t, { route: 1, flow: true, cities: ["badr", "tabuk", "madinah"] }), hub = P(36.57, 28.38), g = clamp((u - 0.6) / (d - 0.8));
    [[-200, 60], [-150, 420], [760, 80], [820, 380], [300, -200], [620, 560]].forEach(function (q, i) { var p = clamp(g * 1.4 - i * 0.12); if (p > 0) { s += '<path d="M' + f(hub[0]) + ' ' + f(hub[1]) + ' L' + f(lerp(hub[0], q[0], p)) + ' ' + f(lerp(hub[1], q[1], p)) + '" stroke="#f2c230" stroke-width="4" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 40) + '"/>'; s += spark(lerp(hub[0], q[0], p), lerp(hub[1], q[1], p), 9, t); } });
    return s + tag("سوق كهربا عربية؟", 330, 60, u, 2.0, -3, 30);
  });
  // 26 — outro
  shot(26, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), lerp(190, 170, k), lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    return '<rect x="-400" y="-300" width="1500" height="1000" fill="url(#skyS)"/>' + sun(480, 220, 34, "#ffd27a") + '<rect x="-400" y="250" width="1500" height="400" fill="#c98a5a"/>' + towerLine(t, [-160, 80, 320, 560, 800], 250, 170, { sp: 1.2, col: "#2b2e33" }) + tag("قولولنا!", 320, 70, u, 0.4, 3, 30);
  });

  window.__parts = { tower: tower, towerLine: towerLine, converter: converter, mapRS: mapRS, P: P, cableShip: cableShip, cableSection: cableSection, flagEG: flagEG, flagSA: flagSA, clockF: clockF, wave: wave, spark: spark, bolt: bolt, block: block, desert: desert, sea: sea, sun: sun, tag: tag, hardHat: hardHat, cal: cal, coin: coin, bar: bar };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
