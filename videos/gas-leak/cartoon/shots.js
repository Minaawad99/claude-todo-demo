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

  // ── «لو شميت ريحة غاز… أوعى تولّع النور!»: the flat at night, the light switch in cut-away, sparks, the gas haze,
  // the valves, the doorbell, light vs heavy gas, the 1937 school (sepia) ──
  var WALLN = "#4f5672", WALLD = "#e9dcc4", GASC = "#b9d36a";
  function f2(n) { return (+n).toFixed(2); }
  function seg(u, a, b) { return clamp((u - a) / (b - a)); }
  function spark(x, y, s, t) {   // a bright jagged spark, flickering
    var k = 0.75 + 0.35 * Math.abs(Math.sin(t * 37)), r = 14 * s * k, d = "";
    for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2 + t * 6, rr = i % 2 ? r * 0.4 : r; d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); }
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2) + '" fill="#ffe36a" opacity=".5" filter="url(#glow)"/><path d="' + d + ' Z" fill="#fff6c0" stroke="#f2a72a" stroke-width="' + f(2 * s) + '"/>';
  }
  function haze(t, x0, y0, x1, y1, op, rise) {   // drifting translucent gas; rise +1 drifts up, -1 sinks, 0 hangs
    var s = "";
    for (var i = 0; i < 14; i++) { var u = (t * 0.07 + hash(i)) % 1, x = x0 + hash(i + 3) * (x1 - x0) + Math.sin(t * 0.7 + i) * 18, y = rise > 0 ? lerp(y1, y0, u) : rise < 0 ? lerp(y0, y1, u) : y0 + hash(i + 5) * (y1 - y0) + Math.sin(t + i) * 6, r = 26 + hash(i + 8) * 40;
      s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 1.4) + '" ry="' + f(r * 0.7) + '" fill="' + GASC + '" opacity="' + f2(op * (rise ? 0.12 + 0.2 * Math.sin(Math.PI * u) : 0.24)) + '" filter="url(#soft)"/>'; }
    return s;
  }
  function smell(x, y, s, t, col) { var g = ""; for (var i = 0; i < 3; i++) { var d = "M" + f(x + (i - 1) * 16 * s) + " " + f(y); for (var k = 1; k <= 6; k++) d += " L" + f(x + (i - 1) * 16 * s + Math.sin(k * 1.4 + t * 6 + i) * 6 * s) + " " + f(y - k * 9 * s); g += '<path d="' + d + '" stroke="' + (col || "#7da23a") + '" stroke-width="' + f(3.4 * s) + '" fill="none" stroke-linecap="round" opacity="' + f2(0.6 + 0.3 * Math.sin(t * 4 + i)) + '"/>'; } return g; }
  function xmark(x, y, s, k) { k = pop(k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s * k) + ')"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + INK + '" stroke-width="20" stroke-linecap="round"/><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#e0402a" stroke-width="13" stroke-linecap="round"/></g>'; }
  // a realistic-proportioned person (about six heads tall) in striped pyjamas, three-quarter view facing right
  // (o.flip faces left). Local units: head centre (2, -58), shoulders y -26, hips y 50, feet y 140.
  // o.arm = right-hand target (local) reached with a two-bone arm; o.phone = hand to the ear; o.walk = stepping legs;
  // o.sniff = nose up with smell lines; mood: n, worry, curious, happy, shock.
  var SKIN = "#c98d6e", SKIN_D = "#a8705a", HAIR = "#2b2420", PJ = "#6f8fb8", PJ_D = "#57749c", PJ_L = "#a9bdd8";
  function limb(pts, w, col) { var d = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L"); return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + f(w + 4.4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function ik(sx, sy, tx, ty, a, b, bendDown) {   // elbow position for a two-bone limb from (sx,sy) to (tx,ty)
    var dx = tx - sx, dy = ty - sy, d = Math.min(Math.hypot(dx, dy), a + b - 0.01), ang = Math.atan2(dy, dx), c = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d))), e = ang + (bendDown ? c : -c);
    var ex = sx + Math.cos(e) * a, ey = sy + Math.sin(e) * a, hx = sx + Math.cos(ang) * d, hy = sy + Math.sin(ang) * d; return [ex, ey, hx, hy];
  }
  function hand(x, y, r) { return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r * 0.9) + '" ry="' + f(r) + '" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + f(x - r * 0.5) + " " + f(y - r * 0.2) + " q" + f(-r * 0.6) + " " + f(-r * 0.5) + " " + f(-r * 0.2) + " " + f(-r * 1.0) + '" stroke="' + INK + '" stroke-width="2" fill="' + SKIN + '"/>'; }
  function face(t, mood, sniff) {
    var blink = ((t * 0.27 + 0.3) % 1) < 0.035 && mood !== "shock", g = "";
    var by = mood === "worry" || mood === "shock" ? -5 : mood === "curious" ? -3 : 0;
    // brows
    g += '<path d="M-1 ' + f(-67 + by) + " q5 " + (mood === "worry" ? -4 : -2) + " 10 " + (mood === "worry" ? 2 : 0) + " M12 " + f(-66 + (mood === "curious" ? -5 : by * 0.6)) + ' q4 -2 7 0" stroke="' + HAIR + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    // eyes (near eye bigger, far eye near the profile)
    if (blink) g += '<path d="M1 -60 q4 1.5 8 0 M13 -60 q3 1.2 6 0" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    else { var er = mood === "shock" ? 1.25 : 1; g += '<ellipse cx="5" cy="-60" rx="' + f(4 * er) + '" ry="' + f(2.6 * er) + '" fill="#fbf8f0" stroke="' + INK + '" stroke-width="1.4"/><circle cx="6" cy="-60" r="' + f(1.9 * er) + '" fill="#3a2a20"/><ellipse cx="15.5" cy="-60" rx="' + f(2.8 * er) + '" ry="' + f(2.4 * er) + '" fill="#fbf8f0" stroke="' + INK + '" stroke-width="1.2"/><circle cx="16.2" cy="-60" r="' + f(1.5 * er) + '" fill="#3a2a20"/>'; }
    // nose on the profile, mouth by mood
    g += '<path d="M14 -58 L20 -51 L15 -49" stroke="' + SKIN_D + '" stroke-width="2.2" fill="none" stroke-linejoin="round"/>';
    if (mood === "happy") g += '<path d="M5 -44 q6 5 12 -1" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    else if (mood === "shock" || mood === "worry") g += '<ellipse cx="11" cy="-43" rx="' + (mood === "shock" ? 3.4 : 2.6) + '" ry="' + (mood === "shock" ? 4.4 : 2.2) + '" fill="#5a2a22" stroke="' + INK + '" stroke-width="1.6"/>';
    else if (mood === "curious") g += '<path d="M6 -43 q5 -2 10 1" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    else g += '<path d="M6 -43 h9" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
    if (sniff) g += '<path d="M19 -49 q3 1 2 3" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    return g;
  }
  function person(x, y, s, t, mood, o) {
    o = o || {}; s = s || 1; var g = '<g transform="translate(' + f(x) + " " + f(y + Math.sin(t * 2.4) * 1.2) + ") scale(" + f2(o.flip ? -s : s) + " " + f2(s) + ')">', wk = o.walk ? Math.sin(t * 7) : 0;
    // legs (pyjama trousers) with slippers; stepping when walking
    var hipL = [-11, 50], hipR = [11, 50], fL = [-12 + wk * 16, 136 - Math.max(0, wk) * 6], fR = [12 - wk * 16, 136 - Math.max(0, -wk) * 6];
    var kL = [lerp(hipL[0], fL[0], 0.5) + 3, 94], kR = [lerp(hipR[0], fR[0], 0.5) + 3, 94];
    g += limb([hipL, kL, fL], 18, PJ_D) + '<ellipse cx="' + f(fL[0] + 6) + '" cy="' + f(fL[1] + 5) + '" rx="13" ry="5.5" fill="#7a3a2a" stroke="' + INK + '" stroke-width="2.2"/>';
    g += limb([hipR, kR, fR], 18, PJ) + '<ellipse cx="' + f(fR[0] + 6) + '" cy="' + f(fR[1] + 5) + '" rx="13" ry="5.5" fill="#8a4a32" stroke="' + INK + '" stroke-width="2.2"/>';
    // back (left) arm, hanging, swinging when walking
    var lh = [-34 - wk * 10, 42], le = [-36 - wk * 5, 10];
    if (!o.phone) g += limb([[-25, -20], le, [lh[0], lh[1] - 6]], 13, PJ_D) + hand(lh[0], lh[1], 6);
    // torso: pyjama shirt with stripes, collar and buttons
    var torso = "M-27 -27 C-30 -6 -27 24 -25 54 L25 54 C27 24 30 -6 27 -27 C17 -32 -17 -32 -27 -27 Z";
    g += '<path d="' + torso + '" fill="' + PJ + '"/>';
    for (var k = -2; k <= 2; k++) g += '<path d="M' + (k * 9) + ' -27 V53" stroke="' + PJ_L + '" stroke-width="3.4" opacity=".8"/>';
    g += '<path d="' + torso + '" fill="none" stroke="' + INK + '" stroke-width="2.8"/><path d="M-10 -29 L2 -12 L14 -29" fill="#f2efe6" stroke="' + INK + '" stroke-width="2.2"/>';
    for (var bt = 0; bt < 4; bt++) g += '<circle cx="2" cy="' + (-4 + bt * 14) + '" r="1.8" fill="#f2efe6" stroke="' + INK + '" stroke-width="1"/>';
    // neck and head (three-quarter view to the right): skull, ear, hair, face
    var tilt = o.sniff ? -8 : 0; g += '<rect x="-5" y="-42" width="13" height="16" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.2"/>';
    g += '<g transform="rotate(' + tilt + ' 2 -40)"><path d="M-13 -62 C-14 -80 -2 -86 6 -85 C17 -84 22 -74 21 -62 C21 -52 20 -46 15 -41 C11 -37 4 -36 -2 -38 C-9 -41 -13 -50 -13 -62 Z" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.6"/>';
    g += '<ellipse cx="-9" cy="-57" rx="4" ry="6.5" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2"/><path d="M-9.5 -60 q-2 3 0 6" stroke="' + SKIN_D + '" stroke-width="1.4" fill="none"/>';
    g += '<path d="M-14 -60 C-17 -76 -8 -89 6 -88 C18 -88 24 -80 22 -69 C17 -74 12 -77 6 -76 C2 -71 -4 -68 -8 -68 C-10 -65 -11 -62 -14 -60 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M0 -88 q-3 -5 -6 -5 M8 -89 q2 -5 6 -5" stroke="' + HAIR + '" stroke-width="3" fill="none" stroke-linecap="round"/>' + face(t, mood, o.sniff) + "</g>";
    // front (right) arm: hanging, reaching for o.arm, or holding a phone to the ear
    var sh = [24, -20];
    if (o.phone) { g += limb([[-25, -20], [-40, -4], [-15, -44]], 13, PJ_D) + '<rect x="-21" y="-69" width="11" height="22" rx="3" fill="#2b2f34" stroke="' + INK + '" stroke-width="1.8"/>' + hand(-15, -45, 6.5) + limb([sh, [34, 10], [30, 36]], 13, PJ) + hand(30, 42, 6.5); }
    else if (o.arm) { var q = ik(sh[0], sh[1], o.arm[0], o.arm[1], 36, 34, true); g += limb([sh, [q[0], q[1]], [q[2], q[3]]], 13, PJ) + hand(q[2], q[3], 6.5); }
    else { var rh = [30 + wk * 10, 42]; g += limb([sh, [34 + wk * 5, 10], [rh[0], rh[1] - 6]], 13, PJ) + hand(rh[0], rh[1], 6.5); }
    if (o.sniff) g += smell(26, -58, 0.55, t);
    return g + "</g>";
  }
  function switchPlate(x, y, s, on) { return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-22" y="-32" width="44" height="64" rx="8" fill="#f6f2e8" stroke="' + INK + '" stroke-width="3"/><rect x="-10" y="-20" width="20" height="40" rx="4" fill="#e2dccd" stroke="' + INK + '" stroke-width="2"/><rect x="-8" y="' + (on ? -18 : 0) + '" width="16" height="18" rx="3" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/></g>'; }
  // the switch opened up: wires, a fixed contact, the moving arm on a pivot, the toggle; k = 0 off … 1 on
  function switchCut(x, y, s, t, k, spk) {
    var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')">', ang = lerp(-38, -13.3, clamp(k)), ar = ang * Math.PI / 180, tip = [-90 + Math.cos(ar) * 152, 40 + Math.sin(ar) * 152];
    g += '<rect x="-150" y="-120" width="300" height="240" rx="18" fill="#efe8d8" stroke="' + INK + '" stroke-width="4"/><rect x="-136" y="-106" width="272" height="212" rx="12" fill="#3a3f46"/>';
    g += '<path d="M-150 80 H-90 V52" stroke="' + INK + '" stroke-width="14" fill="none"/><path d="M-150 80 H-90 V52" stroke="#c23a26" stroke-width="9" fill="none"/><path d="M150 80 H78 V44" stroke="' + INK + '" stroke-width="14" fill="none"/><path d="M150 80 H78 V44" stroke="#2f6f9f" stroke-width="9" fill="none"/>';
    g += '<rect x="58" y="4" width="40" height="40" fill="#c98a3a" stroke="' + INK + '" stroke-width="3"/><circle cx="62" cy="4" r="10" fill="#e8b45a" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<g transform="translate(-90 40) rotate(' + f(ang) + ')"><rect x="0" y="-8" width="152" height="16" rx="6" fill="#d39a48" stroke="' + INK + '" stroke-width="3"/><circle cx="150" cy="0" r="10" fill="#e8b45a" stroke="' + INK + '" stroke-width="2.4"/></g><circle cx="-90" cy="40" r="12" fill="#8a8f96" stroke="' + INK + '" stroke-width="3"/>';
    g += '<g transform="rotate(' + f(lerp(16, -16, clamp(k))) + ' 0 -112)"><rect x="-30" y="-158" width="60" height="50" rx="12" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/></g>';
    if (spk) g += spark((tip[0] + 62) / 2, (tip[1] + 4) / 2, 1.5, t);
    return g + "</g>";
  }
  function rangeBar(x, y, w, t, val) {   // the gas share of the air, 0–20 %; the 5–15 % band burns
    var px = function (p) { return -w / 2 + w * p / 20; }, g = '<g transform="translate(' + f(x) + " " + f(y) + ')">';
    g += '<rect x="' + f(-w / 2) + '" y="-20" width="' + f(w) + '" height="40" rx="20" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/>';
    g += '<rect x="' + f(px(5)) + '" y="-20" width="' + f(px(15) - px(5)) + '" height="40" fill="#f2733a" opacity="' + f2(0.7 + 0.3 * Math.sin(t * 6)) + '"/><rect x="' + f(-w / 2) + '" y="-20" width="' + f(w) + '" height="40" rx="20" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    [0, 5, 15, 20].forEach(function (p) { g += '<path d="M' + f(px(p)) + ' 20 v12" stroke="' + INK + '" stroke-width="3"/><text x="' + f(px(p)) + '" y="56" text-anchor="middle" style="font:800 20px Noto Sans Arabic;fill:#f4f1e8;direction:ltr;paint-order:stroke;stroke:' + INK + ';stroke-width:4px">' + p + "%</text>"; });
    var pv = px(clamp(val / 20) * 20); g += '<path d="M' + f(pv) + " -24 l-12 -22 h24 Z" + '" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/><path d="M' + f(pv) + ' -22 V22" stroke="' + INK + '" stroke-width="3"/>';
    return g + "</g>";
  }
  function boom(x, y, s, t, k) {   // a cartoon fireball; k 0..1 grows it
    if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s * (0.2 + 0.8 * ease(k))) + ')">';
    for (var i = 0; i < 3; i++) { var d = "", n = 14, R = [150, 110, 70][i]; for (var j = 0; j < n * 2; j++) { var a = j / (n * 2) * Math.PI * 2, rr = j % 2 ? R * (0.62 + 0.1 * Math.sin(t * 9 + j)) : R * (1 + 0.08 * Math.sin(t * 7 + j * 1.3)); d += (j ? " L" : "M") + f(Math.cos(a) * rr) + " " + f(Math.sin(a) * rr); } g += '<path d="' + d + ' Z" fill="' + ["#e8462a", "#f29a2e", "#ffe36a"][i] + '"' + (i ? "" : ' stroke="' + INK + '" stroke-width="4"') + "/>"; }
    for (var p = 0; p < 10; p++) { var a2 = p * 0.63 + t, r2 = 160 + ((t * 120 + p * 40) % 120); g += '<rect x="' + f(Math.cos(a2) * r2) + '" y="' + f(Math.sin(a2) * r2) + '" width="12" height="8" fill="#5a4636" transform="rotate(' + f(t * 300 + p * 40) + " " + f(Math.cos(a2) * r2) + " " + f(Math.sin(a2) * r2) + ')"/>'; }
    return g + "</g>";
  }
  function roomBg(t, o) {   // a bedroom wall at night: wall, floor, a window with the moon, the door, the light switch
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + WALLN + '"/><rect x="-400" y="292" width="1440" height="400" fill="#4a3a30"/><path d="M-400 292 H1040" stroke="' + INK + '" stroke-width="4"/>';
    for (var b = -400; b < 1040; b += 70) s += '<path d="M' + b + " 292 L" + (b - 40) + ' 400" stroke="' + INK + '" stroke-width="1.4" opacity=".35"/>';
    var wx = o.wx == null ? 250 : o.wx, op = o.open || 0;
    s += '<rect x="' + wx + '" y="60" width="130" height="110" fill="#1b2744" stroke="' + INK + '" stroke-width="5"/>';
    for (var i = 0; i < 7; i++) s += '<circle cx="' + f(wx + 10 + hash(i) * 110) + '" cy="' + f(70 + hash(i + 3) * 90) + '" r="1.6" fill="#fff" opacity="' + f2(0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))) + '"/>';
    s += '<circle cx="' + (wx + 98) + '" cy="88" r="15" fill="#f4f1e4"/><circle cx="' + (wx + 106) + '" cy="82" r="13" fill="#1b2744"/>';
    if (op > 0) { s += '<path d="M' + wx + " 60 L" + f(wx - 50 * op) + " " + f(60 - 14 * op) + " L" + f(wx - 50 * op) + " " + f(170 + 14 * op) + " L" + wx + ' 170 Z" fill="#7f9ab5" stroke="' + INK + '" stroke-width="4" opacity=".9"/><path d="M' + (wx + 130) + " 60 L" + f(wx + 130 + 50 * op) + " " + f(60 - 14 * op) + " L" + f(wx + 130 + 50 * op) + " " + f(170 + 14 * op) + " L" + (wx + 130) + ' 170 Z" fill="#7f9ab5" stroke="' + INK + '" stroke-width="4" opacity=".9"/>'; }
    else s += '<path d="M' + (wx + 65) + " 60 V170 M" + wx + " 115 H" + (wx + 130) + '" stroke="' + INK + '" stroke-width="4"/>';
    s += '<rect x="540" y="96" width="92" height="196" rx="4" fill="#8a5a3a" stroke="' + INK + '" stroke-width="4"/><circle cx="556" cy="200" r="6" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/>';
    return s + switchPlate(500, 170, 0.8, o.on);
  }
  function bed(x, y, s) { return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><rect x="-10" y="-70" width="24" height="110" rx="6" fill="#8a5a3a" stroke="' + INK + '" stroke-width="3"/><rect x="0" y="0" width="260" height="34" rx="8" fill="#e9e4d8" stroke="' + INK + '" stroke-width="3"/><rect x="0" y="34" width="260" height="20" fill="#8a5a3a" stroke="' + INK + '" stroke-width="3"/><rect x="14" y="-18" width="60" height="22" rx="10" fill="#fbfbf7" stroke="' + INK + '" stroke-width="3"/><path d="M90 0 Q170 -26 258 2 V20 H90 Z" fill="#7f9ab5" stroke="' + INK + '" stroke-width="3"/></g>'; }
  function socket(x, y, s, t, out) { var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-40" y="-40" width="80" height="80" rx="12" fill="#f6f2e8" stroke="' + INK + '" stroke-width="3"/><circle cx="-12" cy="0" r="6" fill="' + INK + '"/><circle cx="12" cy="0" r="6" fill="' + INK + '"/>'; var dx = out * 60; g += '<g transform="translate(' + f(dx) + ' 0)"><rect x="18" y="-22" width="44" height="44" rx="8" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><path d="M62 0 H130" stroke="#2b2f34" stroke-width="10" stroke-linecap="round"/><path d="M18 -12 H4 M18 12 H4" stroke="#c9ced4" stroke-width="5"/></g>'; if (out > 0.05 && out < 0.6) g += spark(10, 0, 1.0, t); return g + "</g>"; }
  function phoneIcon(x, y, s) { return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-30" y="-56" width="60" height="112" rx="12" fill="#2b2f34" stroke="' + INK + '" stroke-width="3"/><rect x="-24" y="-44" width="48" height="80" rx="4" fill="#8fc2da"/><circle cy="46" r="5" fill="#8a8f96"/></g>'; }
  function remoteIcon(x, y, s) { var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-22" y="-62" width="44" height="124" rx="14" fill="#3a3f46" stroke="' + INK + '" stroke-width="3"/><circle cy="-42" r="7" fill="#e0402a"/>'; for (var i = 0; i < 6; i++) g += '<rect x="' + (-14 + (i % 2) * 16) + '" y="' + (-24 + Math.floor(i / 2) * 18) + '" width="12" height="10" rx="3" fill="#c9ced4"/>'; return g + "</g>"; }
  function doorBell(x, y, s, t, press, spk) { var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-26" y="-40" width="52" height="80" rx="10" fill="#f6f2e8" stroke="' + INK + '" stroke-width="3"/><circle cy="0" r="' + f(16 - press * 3) + '" fill="#e2b035" stroke="' + INK + '" stroke-width="3"/>'; if (spk) g += spark(0, 0, 1.2, t); return g + "</g>"; }
  function gasMeter(x, y, s, t, closed) {   // the meter box, the pipe, the lever valve (along the pipe = open, across = shut)
    var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><path d="M-200 60 H200" stroke="' + INK + '" stroke-width="22"/><path d="M-200 60 H200" stroke="#e2b035" stroke-width="14"/>';
    g += '<rect x="-150" y="-70" width="120" height="110" rx="10" fill="#c9ced4" stroke="' + INK + '" stroke-width="3"/><rect x="-136" y="-54" width="92" height="40" rx="4" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/>';
    for (var d = 0; d < 4; d++) g += '<text x="' + (-124 + d * 22) + '" y="-26" style="font:800 20px Noto Sans Arabic;fill:' + INK + ';direction:ltr">' + ((Math.floor(t * 3) + d * 3) % 10) + "</text>";
    var a = lerp(0, 90, ease(clamp(closed))); g += '<circle cx="70" cy="60" r="16" fill="#8a8f96" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(' + f(-a) + ' 70 60)"><rect x="70" y="52" width="90" height="16" rx="8" fill="#e0402a" stroke="' + INK + '" stroke-width="3"/></g>';
    return g + "</g>";
  }
  function cylinder(x, y, s, t, closed) {   // a butane cylinder with its regulator knob
    var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ')"><rect x="-56" y="-120" width="112" height="210" rx="40" fill="#7aa2c8" stroke="' + INK + '" stroke-width="4"/><path d="M-56 -40 H56 M-56 20 H56" stroke="' + INK + '" stroke-width="2.4" opacity=".5"/><rect x="-36" y="-150" width="72" height="34" rx="10" fill="#5f84a8" stroke="' + INK + '" stroke-width="3"/>';
    g += '<rect x="-14" y="-182" width="28" height="34" rx="5" fill="#8a8f96" stroke="' + INK + '" stroke-width="3"/><g transform="rotate(' + f(lerp(0, 120, ease(clamp(closed)))) + ' 0 -196)"><circle cx="0" cy="-196" r="20" fill="#e0402a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 -196 H12" stroke="#fbfbf7" stroke-width="4"/></g>';
    return g + "</g>";
  }
  function building(t, lit) {   // the block of flats at night from the street
    var s = sky("night") + stars(t) + '<rect x="120" y="-40" width="400" height="340" fill="#6a6a78" stroke="' + INK + '" stroke-width="4"/>';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) { var on = hash(r * 7 + c + Math.floor(t * 0.5)) > 0.55, me = r === 2 && c === 2; s += '<rect x="' + (140 + c * 62) + '" y="' + (-20 + r * 62) + '" width="40" height="40" fill="' + (me ? "#2b3550" : on ? "#f4e6b0" : "#3a4256") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
    s += haze(t, 264, 90, 300, 140, 1.4, 1) + '<rect x="-400" y="300" width="1440" height="400" fill="#3f3d3a"/><path d="M-400 300 H1040" stroke="' + INK + '" stroke-width="4"/>';
    return s;
  }
  function school(t, k) {   // a two-storey brick school with a centre tower; k > 0 blows it apart (sepia)
    var g = '<g filter="url(#sepia)">' + sky("day") + '<rect x="-400" y="270" width="1440" height="400" fill="#8a7a5a"/>';
    var lift = k > 0 ? ease(k) * 70 : 0;
    g += '<rect x="80" y="130" width="480" height="140" fill="#a8553a" stroke="' + INK + '" stroke-width="4"/>';
    for (var r = 0; r < 2; r++) for (var c = 0; c < 10; c++) g += '<rect x="' + (96 + c * 46) + '" y="' + (146 + r * 60) + '" width="26" height="40" fill="#e9e4d8" stroke="' + INK + '" stroke-width="2"/>';
    g += '<g transform="translate(0 ' + f(-lift) + ") rotate(" + f(-lift * 0.08) + ' 320 130)"><path d="M70 130 L320 76 L570 130 Z" fill="#6a4a3a" stroke="' + INK + '" stroke-width="4"/><rect x="290" y="40" width="60" height="70" fill="#a8553a" stroke="' + INK + '" stroke-width="4"/><path d="M284 40 L320 10 L356 40 Z" fill="#6a4a3a" stroke="' + INK + '" stroke-width="4"/></g>';
    g += '<rect x="296" y="210" width="48" height="60" fill="#5a3a2a" stroke="' + INK + '" stroke-width="3"/>';
    if (!k) g += haze(t, 100, 240, 540, 275, 1.6, 0);
    return g + "</g>";
  }
  function scroll(x, y, s, k) { k = pop(k); if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s * k) + ')"><rect x="-90" y="-110" width="180" height="220" rx="8" fill="#f4efe0" stroke="' + INK + '" stroke-width="3"/>'; for (var i = 0; i < 7; i++) g += '<path d="M-66 ' + (-80 + i * 24) + ' H' + (i % 3 === 2 ? 30 : 66) + '" stroke="#8a8070" stroke-width="5" stroke-linecap="round"/>'; return g + '<circle cx="46" cy="76" r="26" fill="none" stroke="#c23a26" stroke-width="5"/><text x="46" y="84" text-anchor="middle" style="font:900 20px Noto Sans Arabic;fill:#c23a26;direction:ltr">1937</text></g>'; }
  function bell(x, y, s, t) { var a = Math.sin(t * 14) * 18; return '<g transform="translate(' + f(x) + " " + f(y) + ") scale(" + f2(s) + ") rotate(" + f(a) + ')"><path d="M-40 30 C-40 -30 -26 -52 0 -52 C26 -52 40 -30 40 30 L52 44 H-52 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="4"/><circle cy="54" r="10" fill="#e2b035" stroke="' + INK + '" stroke-width="3"/><circle cy="-58" r="7" fill="' + INK + '"/></g><path d="M' + f(x - 70 * s) + " " + f(y - 30 * s) + " q-14 30 0 60 M" + f(x + 70 * s) + " " + f(y - 30 * s) + ' q14 30 0 60" stroke="' + INK + '" stroke-width="4" fill="none" opacity="' + f2(0.5 + 0.5 * Math.abs(Math.sin(t * 7))) + '"/>'; }

  // 0 — hook: you wake up, the flat smells of gas, your hand goes to the light switch… don't!
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(330, 455, k), lerp(195, 172, k), lerp(1.0, 1.55, k)]; }, function (u, d, t) {
    var s = roomBg(t) + bed(20, 250, 0.9) + haze(t, -40, 40, 640, 280, 1.2, 0) + person(452, 196, 0.62, t, "worry", { sniff: u < 2.2, arm: [lerp(30, 76, seg(u, 0.6, 2.2)), lerp(36, -42, seg(u, 0.6, 2.2))] });
    return s + xmark(500, 170, 0.9, seg(u, 2.5, 3.0)) + tag("أوعى!", 560, 110, u, 2.7, 4, 22);
  });
  // 1 — why? what can a light switch do?
  shot(1, function (u, d) { return [320, 175, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + WALLN + '"/>' + haze(t, -40, 0, 680, 360, 1.0, 0) + switchPlate(320, 175, 3.2, false);
    return s + qmark(470, 120, t, 70) + qmark(180, 150, t + 1, 52) + tag("زرار النور؟", 320, 330, u, 0.4, -2, 20);
  });
  // 2 — and what's the right thing to do?
  shot(2, function (u, d) { return [lerp(300, 330, u / d), 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = roomBg(t) + haze(t, -40, 40, 640, 280, 1.2, 0) + person(320, 190, 0.7, t, "curious", {});
    return s + qmark(390, 90, t, 56) + qmark(250, 110, t + 1, 40) + tag("الصح إيه؟", 200, 320, u, 0.3, -3, 20);
  });
  // 3 — «إيه الحكاية؟»
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + switchCut(210, 190, 0.6, t, 0.5 + 0.5 * Math.sin(t * 3), Math.sin(t * 3) > 0.7) + person(470, 170, 0.62, t, "curious", { flip: true });
    return s + qmark(540, 80, t, 50) + tag("إيه الحكاية؟", 320, 330, u, 0.2, -2, 24);
  });
  // 4 — inside the switch: two metal parts touch when you switch on and part when you switch off
  shot(4, function (u, d) { return [320, lerp(170, 180, u / d), lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = 0.5 + 0.5 * Math.sin(u * 1.9 - 1.2), s = graphPaper(t) + switchCut(320, 190, 0.95, t, k, false);
    return s + tag("حتتين معدن", 470, 60, u, 0.8, 3, 19) + tag(k > 0.5 ? "بيلمسوا" : "بيبعدوا", 150, 330, u, 1.6, -3, 18);
  });
  // 5 — at that instant a tiny spark jumps the gap
  shot(5, function (u, d) { return [lerp(330, 355, u / d), lerp(170, 175, u / d), lerp(1.3, 1.8, u / d)]; }, function (u, d, t) {
    var k = 0.88 + 0.1 * Math.sin(t * 9), s = graphPaper(t) + switchCut(320, 190, 0.95, t, k, true);
    return s + tag("شرارة!", 430, 80, u, 0.5, 4, 22);
  });
  // 6 — natural gas burns when it makes up 5 to 15 % of the air
  shot(6, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + WALLN + '"/>' + haze(t, -40, 0, 680, 360, 0.8 + seg(u, 0, d), 0) + rangeBar(320, 190, 500, t, lerp(0, 10, ease(seg(u, 0.4, 2.6))));
    return s + tag("من 5% لـ 15%", 320, 80, u, 1.6, -2, 22) + tag("بيولّع", 320, 300, u, 2.6, 3, 18);
  });
  // 7 — a room full of gas: that one spark is enough to set it all off
  shot(7, function (u, d) { var k = ease(clamp(u / d)); return [lerp(470, 330, k), lerp(170, 185, k), lerp(1.4, 0.95, k)]; }, function (u, d, t) {
    var s = roomBg(t) + bed(20, 250, 0.9) + haze(t, -40, 20, 640, 290, 2.2, 0), sp = u > 1.4 && u < 2.0;
    if (sp) s += spark(500, 170, 1.6, t);
    s += boom(500, 170, 1.7, t, seg(u, 1.9, 3.0));
    return s + tag("كفاية!", 200, 70, u, 2.4, -4, 24);
  });
  // 8 — switching off is as bad as switching on: both make a spark
  shot(8, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var a = 0.86 + 0.12 * Math.sin(t * 5), b = 0.9 - 0.12 * Math.sin(t * 5 + 1), s = graphPaper(t) + switchCut(170, 190, 0.6, t, a, Math.sin(t * 5) < 0) + switchCut(470, 190, 0.6, t, b, Math.sin(t * 5 + 1) > 0);
    return s + tag("تولعة", 170, 330, u, 0.3, -3, 19) + tag("تطفية", 470, 330, u, 0.9, 3, 19) + tag("الاتنين شرارة!", 320, 50, u, 2.0, -2, 19);
  });
  // 9 — don't pull a plug, don't use the phone or the remote inside
  shot(9, function (u, d) { return [320, 180, lerp(1.0, 1.06, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="' + WALLN + '"/>' + haze(t, -40, 0, 680, 360, 0.9, 0);
    s += socket(130, 180, 1.0, t, seg(u, 0.2, 1.2)) + phoneIcon(340, 180, 1.1) + remoteIcon(510, 180, 1.0);
    return s + xmark(150, 180, 1.1, seg(u, 0.9, 1.4)) + xmark(340, 180, 1.1, seg(u, 1.6, 2.1)) + xmark(510, 180, 1.1, seg(u, 2.3, 2.8)) + tag("ولا فيشة", 140, 320, u, 1.0, -3, 17);
  });
  // 10 — even the doorbell has a spark inside: nobody rings it
  shot(10, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 360, k), 180, lerp(1.0, 1.3, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#8a7a6a"/><rect x="180" y="20" width="160" height="300" rx="6" fill="#6a4a3a" stroke="' + INK + '" stroke-width="5"/><circle cx="314" cy="180" r="8" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/>';
    var pr = seg(u, 0.8, 1.2), fx = lerp(560, 432, ease(seg(u, 0.2, 1.0)));
    s += doorBell(410, 160, 1.3, t, pr, pr > 0.6 && u < 2.0) + '<path d="M' + f(fx + 20) + " 166 H700" + '" stroke="' + INK + '" stroke-width="27" stroke-linecap="round"/><path d="M' + f(fx + 20) + ' 166 H700" stroke="#e8c4a0" stroke-width="21" stroke-linecap="round"/><circle cx="' + f(fx + 12) + '" cy="166" r="13" fill="#e8c4a0" stroke="' + INK + '" stroke-width="3"/>';
    return s + xmark(410, 160, 1.2, seg(u, 2.0, 2.5)) + tag("محدش يرن!", 420, 320, u, 2.2, -3, 20);
  });
  // 11 — the right move: shut the gas valve, or the cylinder's valve
  shot(11, function (u, d) { return [lerp(300, 340, u / d), 185, lerp(0.95, 1.05, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + gasMeter(220, 170, 0.95, t, seg(u, 0.5, 1.4)) + cylinder(520, 220, 0.75, t, seg(u, 2.0, 2.8));
    return s + tag("محبس الغاز", 200, 320, u, 0.6, -3, 19) + tag("محبس الأنبوبة", 520, 50, u, 2.0, 3, 17);
  });
  // 12 — open the windows and the door without touching any switch
  shot(12, function (u, d) { return [lerp(300, 320, u / d), 160, lerp(1.1, 1.2, u / d)]; }, function (u, d, t) {
    var o = ease(seg(u, 0.2, 1.0)), s = roomBg(t, { open: o, wx: 250 }) + haze(t, -40, 40, 640, 280, 1.4 * (1 - 0.6 * o), 0);
    for (var i = 0; i < 6; i++) { var q = (t * 0.6 + i / 6) % 1; s += '<ellipse cx="' + f(lerp(315, 260 + (i % 3) * 30, q)) + '" cy="' + f(lerp(130, 20, q)) + '" rx="' + f(20 + q * 30) + '" ry="' + f(10 + q * 14) + '" fill="' + GASC + '" opacity="' + f2(0.4 * (1 - q) * o) + '" filter="url(#soft)"/>'; }
    s += arrow(315, 140, 315, 40, "#9fd36a", 6, seg(u, 0.8, 1.4));
    return s + xmark(500, 170, 0.7, seg(u, 1.6, 2.1)) + tag("افتح الشبابيك", 190, 320, u, 0.5, -3, 19);
  });
  // 13 — get out of the flat and call the gas emergency line from outside
  shot(13, function (u, d) { return [lerp(320, 360, u / d), 190, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = building(t) + person(560, 220, 0.5, t, "happy", { phone: true, flip: true });
    for (var w = 0; w < 3; w++) { var q = (t * 1.2 + w / 3) % 1; s += '<path d="M' + f(600 + q * 30) + " " + f(170 - q * 10) + ' q8 10 0 20" stroke="#f2c230" stroke-width="3" fill="none" opacity="' + f2(1 - q) + '"/>'; }
    return s + tag("طوارئ الغاز", 420, 330, u, 0.8, -3, 20) + tag("من بره!", 200, 60, u, 1.6, 3, 19);
  });
  // 14 — natural gas is lighter than air: it gathers up by the ceiling
  shot(14, function (u, d) { return [320, lerp(170, 150, u / d), lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = roomBg(t) + haze(t, -40, 10, 640, 110, 2.0, 0) + haze(t, -40, 80, 640, 280, 0.5, 1);
    for (var i = 0; i < 5; i++) { var x = 80 + i * 110, q = (t * 0.5 + i / 5) % 1; s += arrow(x, 250 - q * 60, x, 190 - q * 60, "#9fd36a", 5, 1); }
    return s + tag("أخف من الهوا", 320, 330, u, 0.6, -2, 20) + tag("فوق جنب السقف", 470, 40, u, 2.4, 3, 17);
  });
  // 15 — cylinder gas is heavier than air: it sinks and spreads on the floor
  shot(15, function (u, d) { return [320, lerp(190, 210, u / d), lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = roomBg(t) + cylinder(120, 220, 0.62, t, 0) + haze(t, -40, 250, 680, 310, 2.0, 0) + haze(t, 60, 120, 640, 260, 0.5, -1);
    for (var i = 0; i < 5; i++) { var x = 200 + i * 90, q = (t * 0.5 + i / 5) % 1; s += arrow(x, 120 + q * 60, x, 180 + q * 60, "#9fd36a", 5, 1); }
    return s + tag("أتقل من الهوا", 360, 60, u, 0.6, -2, 20) + tag("على الأرض", 470, 330, u, 2.4, 3, 18);
  });
  // 16 — where does the smell come from? natural gas has no smell at all
  shot(16, function (u, d) { return [lerp(300, 330, u / d), 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + '<path d="M-100 250 H360" stroke="' + INK + '" stroke-width="30"/><path d="M-100 250 H360" stroke="#e2b035" stroke-width="22"/>' + haze(t, 300, 150, 420, 260, 1.4, 1) + person(500, 160, 0.65, t, "curious", { sniff: true, flip: true });
    return s + xmark(420, 120, 0.8, seg(u, 1.6, 2.2)) + qmark(560, 60, t, 50) + tag("ملوش ريحة!", 220, 70, u, 2.2, -3, 21);
  });
  // 17 — 1937: a school in Texas fills with gas and nobody notices
  shot(17, function (u, d) { var k = ease(clamp(u / d)); return [320, lerp(170, 190, k), lerp(1.2, 1.0, k)]; }, function (u, d, t) {
    return school(t, 0) + tag("1937", 120, 60, u, 0.4, -4, 26) + tag("تكساس", 520, 320, u, 1.6, 3, 20);
  });
  // 18 — a spark from an electric machine blows it up: about 300 students and teachers die
  shot(18, function (u, d) { var k = ease(clamp(u / d)); return [320, 180, lerp(1.25, 0.95, k)]; }, function (u, d, t) {
    var s = school(t, seg(u, 0.5, 1.8)) + '<g filter="url(#sepia)">' + boom(320, 160, 1.6, t, seg(u, 0.4, 1.6)) + "</g>";
    return s + tag("حوالي 300", 470, 320, u, 2.4, 3, 22);
  });
  // 19 — weeks later the law: gas must carry a bad smell
  shot(19, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + scroll(170, 180, 0.95, seg(u, 0.2, 0.8)) + '<path d="M330 250 H760" stroke="' + INK + '" stroke-width="30"/><path d="M330 250 H760" stroke="#e2b035" stroke-width="22"/>';
    var dp = seg(u, 1.4, 2.0); if (dp > 0) { var dy = lerp(60, 226, (t * 0.9) % 1); s += '<path d="M440 40 h40 l-8 40 h-24 Z" fill="#c9ced4" stroke="' + INK + '" stroke-width="3"/><path d="M460 ' + f(dy) + ' q-10 14 0 22 q10 -8 0 -22 Z" fill="#7da23a" stroke="' + INK + '" stroke-width="2" opacity="' + f2(dp) + '"/>'; }
    if (u > 2.2) s += smell(560, 230, 1.2, t) + smell(660, 230, 1.0, t + 1);
    return s + tag("قانون", 170, 330, u, 0.6, -3, 20) + tag("ريحة وحشة", 560, 80, u, 2.4, 3, 20);
  });
  // 20 — the payoff: the smell is your alarm bell; get out before you touch any switch
  shot(20, function (u, d) { var k = ease(clamp(u / d)); return [lerp(300, 420, k), lerp(180, 190, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = roomBg(t) + haze(t, -40, 40, 640, 280, 1.0, 0) + bell(180, 110, 0.9, t) + person(lerp(300, 600, ease(seg(u, 1.6, d))), 196, 0.62, t, "happy", { walk: u > 1.6 });
    return s + xmark(500, 170, 0.6, seg(u, 2.0, 2.5)) + tag("جرس الإنذار", 180, 320, u, 0.5, -3, 20) + tag("اطلع بره!", 470, 60, u, 2.6, 3, 20);
  });
  // 21 — outro
  shot(21, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + switchCut(220, 190, 0.55, t, 0.5 + 0.5 * Math.sin(t * 2), false) + person(440, 170, 0.62, t, "happy", { flip: true });
    return s + qmark(520, 80, t, 56) + qmark(570, 130, t + 1, 36) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__parts = { person: person, switchCut: switchCut, switchPlate: switchPlate, spark: spark, haze: haze, boom: boom, roomBg: roomBg, bed: bed, xmark: xmark, tag: tag, smell: smell, gasMeter: gasMeter, cylinder: cylinder, qmark: qmark };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();

