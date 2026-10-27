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
      var rk = (o.capK || 3) + 1, lev = by(rk, cx) + th * 0.9 - (dome * 0.9) * clamp(o.oil), d = "";
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

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // 0 — the fuel in your car may come from under the seabed: from the car on the coast road, down through the sea to the trap
  shot(0, function (u, d) { var k = ease(clamp(u / d)); return [lerp(190, 360, k), lerp(170, 235, k), lerp(1.3, 0.95, k)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 20, 4, 0.8) + '<rect x="-400" y="200" width="1440" height="200" fill="url(#sea1)"/>' + waves(t, 200);
    s += strata(t, 300, { dome: 46, cx: 540, w: 130, oil: 1, capK: 2, cap: true, n: 6 });
    s += '<path d="M-400 194 H250 L340 300 H-400 Z" fill="#c9b07a" stroke="#8a7448" stroke-width="2"/><path d="M-400 194 H250" stroke="#6d6a66" stroke-width="12"/><path d="M-400 194 H250" stroke="#f4f1e8" stroke-width="1.6" stroke-dasharray="14 12"/>';
    s += '<path d="M-200 194 V120 L-180 110 V194 Z" fill="#9a958c"/>' + carSide(lerp(40, 170, clamp(u / d)), 178, t, 0.55);
    var p = clamp((u - 1.2) / 2), len = 520; s += '<path d="M540 380 C540 300 470 240 400 210 C330 180 250 170 180 170" stroke="#f2c230" stroke-width="4" fill="none" stroke-dasharray="10 8" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(p) + '"/>';
    s += drop(540, 360, 14 * pop((u - 0.8) / 1), "happy", t);
    return s + fuelGauge(110, 110, 0.15 + 0.85 * clamp((u - 2) / 1.5)) + tag("من تحت قاع المحيط!", 470, 120, u, 2.2, 3, 20);
  });
  // 1 — under a kilometre of water and kilometres of rock: the camera dives down the column
  shot(1, function (u, d) { return [320, lerp(110, 360, ease(clamp(u / d))), 0.8]; }, function (u, d, t) {
    var s = sea(t, 40, 0.3) + drillship(320, 40, t, { s: 0.45 });
    for (var g = 40; g < 260; g += 40) s += '<rect x="-400" y="' + g + '" width="1440" height="40" fill="#071a30" opacity="' + f((g - 40) / 260 * 0.6) + '"/>';
    s += seabed(t, 260) + strata(t, 272, { dome: 40, cx: 330, w: 150, oil: 1, capK: 4, cap: true, n: 8, th: 44 });
    s += arrow(540, 120, 540, 60, "#fff", 4, 1) + arrow(540, 180, 540, 254, "#fff", 4, 1) + '<text x="540" y="160" text-anchor="middle" style="font:800 26px Noto Sans Arabic;fill:#fff">1 كم</text>';
    s += arrow(110, 380, 110, 280, "#f2c230", 4, clamp((u - 1.4) * 2)) + arrow(110, 460, 110, 600, "#f2c230", 4, clamp((u - 1.4) * 2)) + (u > 1.6 ? '<text x="110" y="432" text-anchor="middle" style="font:800 24px Noto Sans Arabic;fill:#f2c230;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">كيلوهات!</text>' : "");
    return s + drop(330, 560, 16, "shock", t);
  });
  // 2 — so how did they find it, and how do they get it out?
  shot(2, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var s = sea(t, 250, 0, { sky: "sunset" }) + sun(560, 220, 26, "#fff1c8") + seisShip(560, 250, t, { s: 0.5 }) + drillship(470, 250, t, { s: 0.3 });
    s += '<rect x="-400" y="270" width="1440" height="200" fill="#5a6068"/><path d="M-400 270 H1040" stroke="#e2b035" stroke-width="6"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return '<path d="M' + (-100 + i * 80) + ' 270 V230 M' + (-100 + i * 80) + ' 236 H' + (-20 + i * 80) + '" stroke="#e2b035" stroke-width="4"/>'; }).join("");
    s += engineer(200, 186, t, "curious", { look: 1 }) + qmark(290, 90, t, 54) + qmark(330, 60, t + 1, 40) + qmark(260, 50, t + 2, 30);
    return s + tag("إزاي لقوه؟", 420, 90, u, 0.2, -3, 20) + tag("وإزاي يطلّعوه؟", 440, 150, u, 1.3, 2, 20);
  });
  // 3 — "إيه الحكاية؟": the oil-drop mascot pops in on graph paper
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var k = pop(u / 0.8), s = graphPaper(t);
    s += '<g transform="translate(320 200) scale(' + f(k) + ')">' + drop(0, 0, 60, "happy", t) + '</g>';
    for (var i = 0; i < 8; i++) { var a = i * 0.785 + t * 0.6; s += '<circle cx="' + f(320 + Math.cos(a) * 130) + '" cy="' + f(190 + Math.sin(a) * 90) + '" r="6" fill="#f2c230" stroke="' + INK + '" stroke-width="1.6" opacity="' + f(k) + '"/>'; }
    return s + tag("إيه الحكاية؟", 320, 70, u, 0.3, -3, 30);
  });
  // 4 — millions of years ago: tiny sea creatures die and sink to the bottom
  shot(4, function (u, d) { return [lerp(280, 360, u / d), lerp(160, 210, u / d), lerp(1.0, 1.2, u / d)]; }, function (u, d, t) {
    var s = sea(t, -400, 0.15), floor = 300 - 14 * clamp(u / d);
    for (var k = 0; k < 30; k++) { var x = -200 + hash(k) * 1040 + Math.sin(t + k) * 12, y = ((t * (14 + hash(k + 3) * 10) + hash(k + 7) * 400) % 420) - 100; if (y < floor - 4) s += plankton(x, y, 0.8 + hash(k + 1) * 0.8, t, k); }
    s += '<path d="M-400 ' + f(floor) + ' Q0 ' + f(floor - 10) + ' 300 ' + f(floor) + ' T1040 ' + f(floor) + ' V700 H-400 Z" fill="#6f9548" stroke="#2e6a3a" stroke-width="2"/><path d="M-400 300 Q0 290 300 300 T1040 300 V700 H-400 Z" fill="#c9b07a"/>';
    for (var m = 0; m < 24; m++) s += plankton(-300 + m * 55, floor + 6, 0.6, 0, m);
    var yrs = Math.round(lerp(0, 150, clamp(u / 2.4)));
    return s + '<g transform="translate(150 70)"><rect x="-96" y="-26" width="192" height="50" rx="10" fill="' + INK + '" stroke="#c9a650" stroke-width="3"/><text y="10" text-anchor="middle" style="font:800 22px Noto Sans Arabic;fill:#7cf29a">قبل ' + yrs + ' مليون سنة</text></g>' + tag("كائنات صغيرة", 470, 80, u, 1.0, 3, 19);
  });
  // 5 — buried under mud and rock, heat and pressure cook them into oil
  shot(5, function (u, d) { return [320, lerp(170, 200, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2f4a62"/>', nL = Math.floor(clamp(u / 2.6) * 4.99), base = 290, cook = clamp((u - 2.4) / 2);
    for (var k = 0; k < 5; k++) { var y0 = base - 40 - k * 34, drop0 = k < nL ? 0 : k === nL ? -200 * (1 - ((u / 2.6 * 4.99) % 1)) : null; if (drop0 === null) continue; s += '<path d="M-400 ' + f(y0 + drop0) + ' Q0 ' + f(y0 - 8 + drop0) + ' 300 ' + f(y0 + drop0) + ' T1040 ' + f(y0 + drop0) + ' V' + f(y0 + 34 + drop0) + ' H-400 Z" fill="' + LAYC[k] + '" stroke="#3a3024" stroke-width="1.6"/>'; }
    var gC = "rgb(" + Math.round(lerp(111, 30, cook)) + "," + Math.round(lerp(149, 24, cook)) + "," + Math.round(lerp(72, 18, cook)) + ")";
    s += '<path d="M-400 ' + (base - 6) + ' Q0 ' + (base - 14) + ' 300 ' + (base - 6) + ' T1040 ' + (base - 6) + ' V' + (base + 30) + ' H-400 Z" fill="' + gC + '" stroke="#1c1c1c" stroke-width="1.6"/>';
    for (var q = 0; q < 16; q++) { var qx = -100 + q * 52; s += cook < 0.6 ? plankton(qx, base + 10, 0.5, 0, q) : drop(qx, base + 14, 6, "happy", t); }
    s += '<rect x="-400" y="' + (base + 30) + '" width="1440" height="200" fill="#8a3a20"/><rect x="-400" y="' + (base + 24) + '" width="1440" height="40" fill="#ff7a2f" opacity="' + f((0.35 + 0.25 * Math.sin(t * 6)) * clamp(u - 1.5)) + '" filter="url(#soft)"/>';
    for (var a = 0; a < 4; a++) s += arrow(120 + a * 140, 40 + Math.sin(t * 4 + a) * 4, 120 + a * 140, 90 + Math.sin(t * 4 + a) * 4, "#e9e4d8", 7, clamp((u - 1.2) * 1.5));
    return s + tag("ضغط", 560, 40, u, 1.4, 3, 18) + tag("حرارة", 120, 330, u, 2.0, -3, 18, "#ffb08a") + tag("= نفط!", 470, 330, u, 3.2, 2, 22);
  });
  // 6 — not a lake: soaked into the tiny holes of the rock, like a sponge
  shot(6, function (u, d) { var k = ease(clamp((u - 1.4) / 1.2)); return [320, 180, lerp(1.0, 1.25, k)]; }, function (u, d, t) {
    var s = "";
    if (u < 1.6) { s += '<rect x="-400" y="-300" width="1440" height="960" fill="#8a7458"/>' + strata(t, 40, { n: 6 }) + '<ellipse cx="320" cy="200" rx="190" ry="70" fill="url(#oilG)" stroke="' + INK + '" stroke-width="3"/>';
      for (var rp = 0; rp < 4; rp++) { var ru = (t * 0.7 + rp / 4) % 1; s += '<ellipse cx="320" cy="200" rx="' + f(30 + ru * 150) + '" ry="' + f(10 + ru * 50) + '" fill="none" stroke="#8a7458" stroke-width="3" opacity="' + f(1 - ru) + '"/>'; }
      s += drop(250 + Math.sin(t * 3) * 40, 150, 14, "curious", t) + bubbles(t, 380, 230, 6, 0.8, 40, 140);
      var x = pop((u - 0.4) / 1); s += '<g transform="translate(320 200) scale(' + f(x) + ')"><path d="M-80 -60 L80 60 M80 -60 L-80 60" stroke="#c23a26" stroke-width="22" stroke-linecap="round"/></g>' + tag("مش بحيرة!", 320, 70, u, 0.4, -3, 24); return s; }
    s += '<rect x="-400" y="-300" width="1440" height="960" fill="#2a1d12"/>';
    for (var q = 0; q < 26; q++) { var ox = -300 + hash(q) * 1240, oy = -200 + ((hash(q + 4) * 800 + t * 18) % 800), sh = Math.sin(t * 2 + q); s += '<ellipse cx="' + f(ox) + '" cy="' + f(oy) + '" rx="10" ry="4" fill="#6a4a2a" opacity="' + f(0.3 + 0.2 * sh) + '"/>'; }
    for (var r = -4; r < 10; r++) for (var c = -6; c < 16; c++) { var gx = c * 56 + (r % 2 ? 28 : 0) + hash(r * 40 + c) * 10, gy = r * 48 + hash(r * 9 + c) * 10, rr = 22 + hash(r + c * 3) * 6; s += '<circle cx="' + f(gx) + '" cy="' + f(gy) + '" r="' + f(rr) + '" fill="#c9b07a" stroke="#6a5a3a" stroke-width="2"/><circle cx="' + f(gx - rr * 0.35) + '" cy="' + f(gy - rr * 0.35) + '" r="' + f(rr * 0.3) + '" fill="#e9d8a8" opacity=".6"/>'; }
    var sp = pop((u - 2.4) / 1); s += '<g transform="translate(520 270) scale(' + f(sp) + ') rotate(' + f(Math.sin(t * 2) * 4) + ')"><rect x="-70" y="-44" width="140" height="88" rx="14" fill="#f2c230" stroke="' + INK + '" stroke-width="3"/>' + [[-40, -20, 9], [-10, 10, 7], [30, -18, 10], [44, 18, 6], [-46, 20, 6], [10, -28, 5]].map(function (h) { return '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + h[2] + '" fill="#1e1812"/>'; }).join("") + '</g>';
    return s + tag("صخر مليان مسام", 200, 60, u, 1.8, -3, 20) + tag("زي الإسفنجة", 520, 190, u, 2.6, 3, 18);
  });
  // 7 — a tight layer of rock on top holds it in, like a lid
  shot(7, function (u, d) { return [lerp(290, 340, u / d), lerp(190, 160, u / d), lerp(1.0, 1.25, u / d)]; }, function (u, d, t) {
    var oil = clamp(u / (d - 0.8)), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#2f4a62"/>' + strata(t, 60, { dome: 80, cx: 320, w: 160, oil: 0.25 + 0.75 * oil, capK: 2, cap: true, n: 6, th: 44 });
    for (var i = 0; i < 12; i++) { var x = 160 + hash(i) * 320, uu = (t * 0.6 + hash(i + 2)) % 1, top = 150 + Math.pow((x - 320) / 160, 2) * 40, y = lerp(330, top, uu); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4" fill="' + OIL + '" stroke="#5a4a3a"/>'; }
    var lid = pop((u - 1.2) / 1); s += '<g transform="translate(320 70) scale(' + f(lid) + ')"><path d="M-60 10 C-60 -18 60 -18 60 10 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="3"/><rect x="-12" y="-26" width="24" height="12" rx="4" fill="#5a6068" stroke="' + INK + '" stroke-width="2"/></g>';
    return s + tag("صخر ناشف = غطا", 520, 70, u, 1.4, 3, 18) + drop(320, 196, 12, "worry", t);
  });
  // 8 — to find it, a ship tows cables kilometres long
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(200, 470, ease(k)), lerp(170, 150, k), lerp(1.3, 0.85, k)]; }, function (u, d, t) {
    var s = sea(t, 200, 0, { gulls: true }) + streamers(t, 250, 206, 760, 5, false) + seisShip(160, 200, t, { s: 0.9 });
    for (var k = 0; k < 5; k++) s += '<path d="M240 ' + (200 + k * 2) + ' L262 ' + (206 + k * 7) + '" stroke="#f2c230" stroke-width="2"/>';
    s += arrow(300, 260, 980, 260, "#fff", 4, clamp((u - 1) / 2)) + '<text x="640" y="290" text-anchor="middle" style="font:800 24px Noto Sans Arabic;fill:#fff;opacity:' + f(clamp(u - 2)) + '">كيلومترات!</text>';
    return s + tag("سفينة مسح", 160, 80, u, 0.4, -3, 19);
  });
  // 9 — air guns fire bubbles of compressed air: a loud bang that travels down
  shot(9, function (u, d) { return [320, lerp(150, 200, u / d), lerp(1.1, 1.0, u / d)]; }, function (u, d, t) {
    var s = sea(t, 60, 0.45) + seabed(t, 330) + seisShip(170, 60, t, { s: 0.6 }) + streamers(t, 240, 64, 600, 2, false);
    s += '<path d="M230 66 L300 110" stroke="' + INK + '" stroke-width="2.4"/><rect x="290" y="104" width="50" height="12" rx="5" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>';
    var per = 1.4, ph = (u % per) / per, n = Math.floor(u / per);
    s += '<circle cx="315" cy="122" r="' + f(8 + ph * 40) + '" fill="#bfe6f7" fill-opacity=".45" stroke="#fff" stroke-width="2" opacity="' + f(1 - ph) + '"/>' + bubbles(t, 315, 120, 10, 0.7, 40, 64);
    for (var w = 0; w < 3; w++) { var a = (u - w * per) % (per * 3); if (u - w * per < 0) continue; var R = a * 120; if (R > 260) continue; s += '<path d="M' + f(315 - R) + ' 122 A' + f(R) + ' ' + f(R * 0.8) + ' 0 0 0 ' + f(315 + R) + ' 122" stroke="#f2c230" stroke-width="' + f(5 - R / 70) + '" fill="none" opacity="' + f(1 - R / 260) + '"/>'; }
    if (ph < 0.25) s += '<text x="400" y="110" style="font:800 30px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:3;paint-order:stroke">بوم!</text>';
    return s + tag("هوا مضغوط", 470, 180, u, 0.6, 3, 19);
  });
  // 10 — the sound bounces off the rock layers and the echo comes back up to the cables
  shot(10, function (u, d) { return [lerp(300, 360, u / d), lerp(220, 200, u / d), 0.9]; }, function (u, d, t) {
    var s = sea(t, 30, 0.5) + strata(t, 180, { dome: 30, cx: 470, w: 140, n: 6, th: 40 }) + seisShip(130, 30, t, { s: 0.5 }) + streamers(t, 180, 34, 720, 2, u > 1.2);
    var R = clamp(u / 1.2) * 190; s += '<path d="M' + f(200 - R) + ' 50 A' + f(R) + ' ' + f(R * 0.9) + ' 0 0 0 ' + f(200 + R) + ' 50" stroke="#f2c230" stroke-width="4" fill="none" opacity="' + f(1 - R / 260) + '"/>';
    [180, 220, 260].forEach(function (ly, i) { var e = clamp((u - 0.8 - i * 0.25) / 1.6); if (e <= 0) return; var x0 = 200 + 120 + i * 50, yy = lerp(ly, 40, e); s += '<path d="M' + f(x0 - 80) + ' ' + f(yy + 18) + ' Q' + x0 + ' ' + f(yy - 14) + ' ' + f(x0 + 80) + ' ' + f(yy + 18) + '" stroke="#7cf29a" stroke-width="4" fill="none" opacity="' + f(1 - e * 0.5) + '"/>' + arrow(x0, yy + 10, x0, yy - 14, "#7cf29a", 3, 1); });
    return s + tag("صدى!", 500, 100, u, 1.0, 3, 22, "#bdf5c8");
  });
  // 11 — a computer turns the echoes into a 3D picture of the layers
  shot(11, function (u, d) { return [lerp(300, 340, u / d), 180, lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#26364a"/><rect x="-400" y="290" width="1440" height="200" fill="#3a2e24"/>';
    for (var r = 0; r < 4; r++) s += '<rect x="' + (-200 + r * 260) + '" y="20" width="120" height="70" rx="6" fill="#1a2634" stroke="#3a4a5e" stroke-width="3"/><path d="M' + (-190 + r * 260) + ' 70 L' + (-160 + r * 260) + ' ' + f(50 + Math.sin(t * 3 + r) * 10) + ' L' + (-120 + r * 260) + ' ' + f(60 + Math.cos(t * 2 + r) * 10) + ' L' + (-90 + r * 260) + ' 40" stroke="#7cf29a" stroke-width="2" fill="none"/>';
    var build = clamp(u / 2.4), inner = '<g transform="translate(0 30) scale(' + f(0.4 + 0.6 * build) + ')">' + block3d(t, 240, 0.6 + t * 0.25, 22 * build, 0) + '</g>';
    for (var sc = 0; sc < 6; sc++) { var yy = -80 + ((t * 60 + sc * 30) % 170); inner += '<path d="M-150 ' + f(yy) + ' H150" stroke="#7cf2ff" stroke-width="1" opacity=".15"/>'; }
    s += monitor(280, 170, 300, 180, inner) + engineer(530, 170, t, "happy", { s: 0.8 });
    return s + tag("صورة 3D", 280, 40, u, 1.6, -3, 20);
  });
  // 12 — a layer shaped like a dome: the oil is probably trapped under it
  shot(12, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.2, 1.55, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#26364a"/>', g = clamp((u - 1) / 1.5);
    var inner = '<g transform="translate(0 30)">' + block3d(t, 240, 0.9 + t * 0.15, 22 + 30 * clamp(u / 1.2), g) + '</g>';
    if (g > 0) inner += '<circle cx="0" cy="-10" r="' + f(70 + 6 * Math.sin(t * 5)) + '" fill="none" stroke="#ff7a2f" stroke-width="4" stroke-dasharray="10 8" opacity="' + f(g) + '"/>';
    s += monitor(320, 180, 300, 180, inner);
    return s + tag("قبة = نفط محبوس؟", 320, 64, u, 1.2, -2, 18);
  });
  // 13 — then the drilling, from a drillship or a floating platform (layouts from the photos)
  shot(13, function (u, d) { var k = ease(clamp((u - 0.6) / (d - 1))); return [lerp(260, 520, k), 170, lerp(1.1, 0.95, k)]; }, function (u, d, t) {
    var s = sea(t, 230, 0, { sky: "sunset" }) + '<circle cx="760" cy="200" r="60" fill="#ffe2a8" opacity=".5" filter="url(#soft)"/><circle cx="760" cy="206" r="26" fill="#fff1c8"/>';
    s += drillship(250, 232, t, { night: true, s: 0.9 }) + semisub(640, 206, t, { s: 0.85 });
    return s + tag("سفينة حفر", 250, 50, u, 0.3, -3, 20) + tag("أو منصة عايمة", 640, 60, u, 1.8, 3, 19);
  });
  // 14 — steel pipes lowered one after another, down to the seabed
  shot(14, function (u, d) { var k = clamp(u / d); return [320, lerp(120, 250, ease(k)), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var tip = lerp(70, 318, clamp(u / (d - 0.4))), s = sea(t, -400, 0.45) + '<path d="M60 -40 L580 -40 L560 20 L80 20 Z" fill="url(#hullB)" stroke="' + INK + '" stroke-width="2"/><rect x="300" y="14" width="40" height="10" fill="' + INK + '"/>';
    s += seabed(t, 330) + '<rect x="-400" y="350" width="1440" height="300" fill="url(#rock)"/>';
    s += '<rect x="312" y="20" width="16" height="' + f(tip - 20) + '" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.2"/>';
    var n = Math.floor((tip - 20) / 50); for (var j = 1; j <= n; j++) s += '<rect x="309" y="' + f(tip - j * 50) + '" width="22" height="7" fill="url(#steelD)" stroke="' + INK + '"/>';
    var fresh = ((tip - 20) % 50) / 50; s += '<rect x="304" y="18" width="32" height="10" fill="#f2c230" opacity="' + f(1 - fresh) + '" filter="url(#glow)"/>';
    s += '<g transform="translate(380 ' + f(tip - 100) + ')"><rect x="0" y="-18" width="110" height="36" rx="8" fill="' + INK + '" stroke="#c9a650" stroke-width="2"/><text x="55" y="8" text-anchor="middle" style="font:800 17px Noto Sans Arabic;fill:#7cf29a">ماسورة ' + (n + 1) + '</text></g>';
    return s + fish(t, 160, 40, 3, "#f2c230") + tag("ماسورة ورا التانية", 180, Math.min(tip - 60, 230), u, 0.8, -3, 17);
  });
  // 15 — the drill bit: rolling toothed cones (tricone) or synthetic diamond cutters (PDC), spinning and grinding the rock
  shot(15, function (u, d) { var k = ease(clamp((u - 1.6) / 1.6)); return [lerp(200, 440, k), 180, 1.05]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a3024"/>' + strata(t, 210, { n: 4, th: 50 });
    s += '<rect x="80" y="-300" width="240" height="510" fill="#2a2018"/><rect x="340" y="-300" width="240" height="510" fill="#2a2018"/>';
    s += '<rect x="190" y="-300" width="20" height="300" fill="url(#steel)" stroke="' + INK + '"/><rect x="450" y="-300" width="20" height="300" fill="url(#steel)" stroke="' + INK + '"/>';
    s += tricone(200, 120 + Math.sin(t * 20) * 1.5, t, 0.62, t * 1.2) + pdc(460, 120 + Math.sin(t * 22) * 1.5, t, 0.62, t * 3);
    for (var c = 0; c < 18; c++) { var side = c % 2, cx0 = side ? 460 : 200, uu = (t * 1.4 + hash(c)) % 1, a = -Math.PI / 2 + (hash(c + 3) - 0.5) * 2.4; s += '<path d="M' + f(cx0 + Math.cos(a) * 80 * uu) + ' ' + f(196 + Math.sin(a) * 50 * uu) + ' l6 -3 l2 6 l-7 2 Z" fill="#c9b07a" stroke="' + INK + '" stroke-width=".8" opacity="' + f(1 - uu) + '"/>'; }
    return s + tag("تروس مسننة", 200, 40, u, 0.6, -3, 19) + tag("ألماظ صناعي", 460, 40, u, 2.4, 3, 19) + tag("بتلف وتطحن!", 330, 300, u, 3.6, -2, 18);
  });
  // 16 — inside the pipes they pump a heavy special mud
  shot(16, function (u, d) { return [320, lerp(140, 220, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = sea(t, 30, 0.3) + '<path d="M120 20 L520 20 L500 60 L140 60 Z" fill="url(#hullB)" stroke="' + INK + '" stroke-width="2"/>';
    var pk = Math.sin(t * 6) * 10; s += '<rect x="150" y="-24" width="90" height="44" rx="6" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(240 + pk) + '" y="-10" width="30" height="14" fill="url(#steel)" stroke="' + INK + '"/><text x="195" y="4" text-anchor="middle" style="font:800 13px Noto Sans Arabic;fill:#fff">طلمبة</text>';
    s += '<path d="M240 -2 H320 V20" stroke="' + MUD + '" stroke-width="10" fill="none"/>';
    s += '<rect x="294" y="20" width="52" height="400" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><rect x="302" y="20" width="36" height="400" fill="url(#mudG)"/>';
    for (var c = 0; c < 9; c++) { var y = 30 + ((t * 70 + c * 44) % 390); s += '<path d="M308 ' + f(y) + ' L320 ' + f(y + 12) + ' L332 ' + f(y) + '" stroke="#f4e2c0" stroke-width="3" fill="none"/>'; }
    return s + tag("طين تقيل مخصوص", 470, 160, u, 0.8, 3, 18, "#d9b88a");
  });
  // 17 — the mud cools the bit, carries the cuttings up, and holds the well's pressure
  shot(17, function (u, d) { return [lerp(280, 340, u / d), lerp(200, 180, u / d), lerp(1.05, 1.2, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#3a3024"/>' + strata(t, -100, { n: 10, th: 50 });
    s += '<rect x="240" y="-300" width="160" height="590" fill="#7a5838"/><path d="M240 -300 V290 M400 -300 V290" stroke="#8a929c" stroke-width="5"/>';
    s += '<rect x="296" y="-300" width="48" height="520" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><rect x="304" y="-300" width="32" height="520" fill="url(#mudG)"/>';
    for (var c = 0; c < 8; c++) { var y = -280 + ((t * 80 + c * 64) % 500); s += '<path d="M312 ' + f(y) + ' L320 ' + f(y + 9) + ' L328 ' + f(y) + '" stroke="#f4e2c0" stroke-width="3" fill="none"/>'; }
    s += tricone(320, 296, t, 0.5, t);
    for (var k = 0; k < 16; k++) { var side = k % 2, uu = (t * 0.5 + hash(k)) % 1, x = side ? 370 + Math.sin(t * 3 + k) * 6 : 270 + Math.sin(t * 3 + k) * 6, y2 = lerp(280, -280, uu); s += '<path d="M' + f(x) + ' ' + f(y2) + ' l7 -3 l3 6 l-8 3 Z" fill="#c9b07a" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += arrow(270, 240, 270, 120, "#f4e2c0", 4, 1) + arrow(370, 240, 370, 120, "#f4e2c0", 4, 1);
    var ic = [[90, "يبرّد البريمة", "#bfe6f7"], [180, "يطلّع الفتافيت", "#e9e4d8"], [270, "يمسك الضغط", "#f2c230"]];
    ic.forEach(function (c2, i) { var p = pop((u - 0.4 - i * 1.1) / 1); if (p <= 0) return; s += '<g transform="translate(540 ' + c2[0] + ') scale(' + f(p) + ')"><circle r="24" fill="' + c2[2] + '" stroke="' + INK + '" stroke-width="3"/><text y="8" text-anchor="middle" style="font:800 22px Noto Serif;fill:' + INK + '">' + (i + 1) + '</text></g>' + tag(c2[1], 540, c2[0] + 46, u, 0.4 + i * 1.1, i % 2 ? 2 : -2, 15); });
    return s;
  });
  // 18 — on the seabed, the blowout preventer: it seals the well in seconds if the pressure surges
  shot(18, function (u, d) { var k = clamp((u - 2.4) / 0.4); return [lerp(300, 330, u / d) + Math.sin(u * 40) * 4 * k * (u < 3.4 ? 1 : 0), lerp(190, 180, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var surge = clamp((u - 2.2) / 0.4), shut = clamp((u - 2.8) / 0.5);
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#deep)"/>' + Array.from({ length: 40 }, function (_, i) { return '<circle cx="' + ((i * 97) % 640) + '" cy="' + ((i * 53 + t * 8) % 300) + '" r="1.4" fill="#fff" opacity=".35"/>'; }).join("");
    s += '<path d="M-400 300 Q160 288 320 300 T1040 296 V660 H-400 Z" fill="url(#rock)"/><rect x="310" y="310" width="20" height="350" fill="#3a3d42" stroke="' + INK + '"/>' + bop(320, 200, t, shut);
    if (surge > 0 && shut < 1) for (var g = 0; g < 8; g++) { var uu = (t * 1.6 + g / 8) % 1; s += '<circle cx="' + f(320 + Math.sin(g * 3 + t * 4) * 8) + '" cy="' + f(lerp(420, 200 + 100 * shut, uu)) + '" r="5" fill="#ffd98a" opacity=".8"/>'; }
    s += rov(540, 210, t, 0.8) + gauge(110, 120, 40, 0.3 + 0.65 * surge + 0.04 * Math.sin(t * 30) * surge, "الضغط");
    if (surge > 0 && shut < 1) s += '<circle cx="110" cy="54" r="12" fill="#ff3b2f" filter="url(#glow)" opacity="' + (Math.sin(t * 14) > 0 ? 1 : 0.2) + '"/>';
    return s + tag("مانع الانفجار", 500, 60, u, 0.4, 3, 20) + tag("قفل في ثواني!", 320, 336, u, 3.1, -2, 20, "#ffb08a");
  });
  // 19 — the bit reaches the oil; the pressure down there pushes it up all by itself
  shot(19, function (u, d) { return [320, lerp(240, 170, ease(clamp(u / d))), lerp(1.0, 0.95, u / d)]; }, function (u, d, t) {
    var s = sea(t, -40, 0.4) + seabed(t, 60) + strata(t, 72, { dome: 70, cx: 320, w: 170, oil: 1, capK: 3, cap: true, n: 7, th: 44 }) + bop(320, -60, t, 0, { riser: false });
    var up = clamp((u - 0.6) / 1.4), oilTop = lerp(250, -300, up);
    s += '<rect x="310" y="-140" width="20" height="400" fill="url(#steel)" stroke="' + INK + '"/>' + '<rect x="314" y="' + f(oilTop) + '" width="12" height="' + f(250 - oilTop) + '" fill="' + OIL + '"/>';
    for (var k = 0; k < 6; k++) { var uu = (t * 0.8 + k / 6) % 1, y = lerp(250, -140, uu); if (y > oilTop) s += drop(320, y, 9, "happy", t + k); }
    for (var a = 0; a < 3; a++) s += arrow(220 + a * 100, 330, 220 + a * 100 + (a - 1) * 30, 270, "#ff7a2f", 6, clamp((u - 0.3) * 2));
    return s + tag("بيطلع لوحده!", 470, 60, u, 1.4, 3, 20);
  });
  // 20 — when the pressure drops, they pump water into the well to push the oil
  shot(20, function (u, d) { return [lerp(300, 340, u / d), 200, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sea2)"/>' + seabed(t, 40) + strata(t, 52, { dome: 50, cx: 260, w: 220, oil: 1, capK: 2, cap: true, n: 7, th: 44 });
    var wv = clamp((u - 0.8) / (d - 1.2)); s += '<path d="M' + f(lerp(560, 260, wv)) + ' 280 Q' + f(lerp(600, 380, wv)) + ' 230 640 ' + f(lerp(250, 200, wv)) + ' V330 H' + f(lerp(560, 260, wv)) + ' Z" fill="' + WATER + '" opacity=".85"/>';
    for (var k = 0; k < 6; k++) { var x = lerp(600, 300, wv) + k * 30, y = 270 + Math.sin(t * 3 + k) * 6; s += arrow(x + 20, y, x - 10, y - 6, "#bfe6f7", 3, 1); }
    s += '<rect x="550" y="-300" width="16" height="560" fill="url(#steel)" stroke="' + INK + '"/>'; for (var c = 0; c < 7; c++) { var yy = -260 + ((t * 90 + c * 70) % 520); s += '<path d="M552 ' + f(yy) + ' L558 ' + f(yy + 8) + ' L564 ' + f(yy) + '" stroke="#bfe6f7" stroke-width="3" fill="none"/>'; }
    s += '<rect x="252" y="-300" width="16" height="500" fill="url(#steel)" stroke="' + INK + '"/><rect x="255" y="-300" width="10" height="500" fill="' + OIL + '"/>' + arrow(260, 120, 260, 20, "#ffd98a", 4, 1);
    return s + tag("مية تزق النفط", 470, 0, u, 0.8, 3, 19, "#bfe6f7") + drop(320, 170, 10, "happy", t);
  });
  // 21 — up to a production ship (FPSO) that separates it from water and gas, and stores it
  shot(21, function (u, d) { var k = ease(clamp((u - 1.4) / 1.4)); return [lerp(300, 380, k), lerp(150, 180, k), lerp(1.0, 1.1, k)]; }, function (u, d, t) {
    var s = sea(t, 200, 0.2, { gulls: true }) + fpso(280, 200, t, { s: 0.9 });
    s += '<path d="M150 230 C150 300 230 330 300 400" stroke="#3a3d42" stroke-width="6" fill="none"/>'; for (var q = 0; q < 5; q++) { var uu = (t * 0.6 + q / 5) % 1; s += '<circle cx="' + f(lerp(300, 150, uu)) + '" cy="' + f(lerp(400, 232, uu)) + '" r="3" fill="' + OIL + '"/>'; }
    var p = pop((u - 1.4) / 1); if (p > 0) { s += '<g transform="translate(520 150) scale(' + f(p) + ')"><circle r="104" fill="#f4efe4" stroke="' + INK + '" stroke-width="4"/><clipPath id="sepc"><rect x="-70" y="-50" width="140" height="100" rx="30"/></clipPath><g clip-path="url(#sepc)"><rect x="-70" y="-50" width="140" height="34" fill="#e9e4d8"/><rect x="-70" y="-16" width="140" height="36" fill="' + OIL + '"/><rect x="-70" y="20" width="140" height="30" fill="' + WATER + '"/>';
      for (var g = 0; g < 6; g++) s += '<circle cx="' + f(-60 + ((t * 30 + g * 24) % 120)) + '" cy="' + f(-34 + Math.sin(t * 3 + g) * 6) + '" r="4" fill="none" stroke="#9a958c" stroke-width="1.6"/>';
      s += '<path d="M-70 ' + f(20 + Math.sin(t * 4) * 2) + ' H70" stroke="#bfe6f7" stroke-width="2"/></g><rect x="-70" y="-50" width="140" height="100" rx="30" fill="none" stroke="' + INK + '" stroke-width="3"/>';
      s += '<text x="0" y="-60" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + INK + '">غاز</text><text x="0" y="8" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:#ffd98a">نفط</text><text x="0" y="76" text-anchor="middle" style="font:800 14px Noto Sans Arabic;fill:' + WATER + '">مية</text></g>'; }
    return s + tag("سفينة إنتاج", 200, 60, u, 0.3, -3, 20);
  });
  // 22 — giant tankers carry it to the refineries
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(220, 520, ease(k)), 170, lerp(1.0, 0.9, k)]; }, function (u, d, t) {
    var s = sea(t, 220, 0, { gulls: true }) + '<path d="M640 216 H1040 V260 H600 Z" fill="#c9b07a" stroke="#8a7448" stroke-width="2"/>' + refinery(820, 216, t) + fpso(-40, 222, t, { s: 0.5 });
    var x = lerp(120, 500, clamp(u / d)); s += tanker(x, 224, t, { s: 0.75 });
    for (var w = 0; w < 5; w++) s += '<path d="M' + f(x - 160 - w * 22) + ' ' + f(240 + w * 2) + ' q10 -4 20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity="' + f(0.8 - w * 0.15) + '"/>';
    return s + tag("ناقلة عملاقة", 260, 80, u, 0.4, -3, 19) + tag("معمل تكرير", 820, 50, u, 1.8, 3, 18);
  });
  // 23 — the drop in your car travelled for millions of years: the whole trip as a timeline behind the car
  shot(23, function (u, d) { return [lerp(280, 360, u / d), 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="url(#skyS)"/><circle cx="520" cy="190" r="40" fill="#fff1c8"/>' + city(t, 230, 70, "#5a4a5a", true, 3, false);
    s += '<rect x="-400" y="250" width="1440" height="200" fill="url(#road)"/><path d="M-400 290 H1040" stroke="#f4f1e8" stroke-width="3" stroke-dasharray="24 18" stroke-dashoffset="' + f(t * 160) + '"/>';
    var icons = [plankton(0, 0, 1.4, t, 0), '<rect x="-16" y="-12" width="32" height="24" fill="#8a7458" stroke="' + INK + '" stroke-width="2"/>', seisShip(0, 0, t, { s: 0.16 }), fpso(0, 0, t, { s: 0.1 })];
    icons.forEach(function (ic, i) { var p = pop((u - 0.3 - i * 0.45) / 0.9); if (p <= 0) return; s += '<g transform="translate(' + (80 + i * 110) + ' 90) scale(' + f(p) + ')"><circle r="30" fill="#f4efe4" stroke="' + INK + '" stroke-width="3"/>' + ic + '</g>' + (i < 3 ? '<path d="M' + (114 + i * 110) + ' 90 h40" stroke="#f4efe4" stroke-width="4" stroke-dasharray="6 6"/>' : ""); });
    s += carSide(320, 262, t, 0.9, "#26405e") + drop(310, 200 + Math.sin(t * 5) * 3, 14, "happy", t);
    return s + tag("رحلة ملايين السنين!", 400, 340, u, 1.6, -2, 20);
  });
  // 24 — outro: what story next?
  shot(24, function (u, d) { return [320, lerp(190, 170, u / d), lerp(1.0, 1.15, u / d)]; }, function (u, d, t) {
    var s = graphPaper(t) + engineer(230, 180, t, "happy", { point: true, s: 0.9 }) + drop(430, 230, 40, "happy", t, { look: -1 });
    return s + qmark(470, 110, t, 60) + qmark(530, 150, t + 1, 40) + tag("حكاية إيه المرة الجاية؟", 320, 330, u, 0.2, -2, 19);
  });

  window.__panel = function (svg, t) {
    OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
