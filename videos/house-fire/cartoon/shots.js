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

  // ── the Leaning Tower of Pisa (shapes from photos, see ../refs/SOURCES.md): a white marble cylinder; a tall ground floor
  // with blind arches and a door, six open galleries (loggias) of arches on columns with a cornice band between them,
  // and a narrower bell chamber on top. Drawn upright with its base centre at (0,0), then leaned.
  var MARBLE = "url(#gMarble)", ARCH = "url(#gArch)", TW = 72, BW = 50;
  var FLOORS = [46, 28, 28, 28, 28, 28, 28, 34];   // ground, six galleries, bell chamber
  var TH = FLOORS.reduce(function (a, b) { return a + b; }, 0) + 6;
  function arches(w, h, n, top, ring, t) {   // a ring of n arches seen from the side: openings foreshortened towards the edges
    var s = "";
    for (var i = 0; i < n; i++) {
      var a0 = -Math.PI / 2 + i * Math.PI / n, a1 = a0 + Math.PI / n, xl = Math.sin(a0) * w / 2, xr = Math.sin(a1) * w / 2, wd = xr - xl, g = wd * 0.16;
      xl += g; xr -= g; var r = (xr - xl) / 2; if (r < 0.6) continue;
      s += '<path d="M' + f(xl) + ' -3 V' + f(-h + top + r) + ' A' + f(r) + ' ' + f(Math.min(r, 6)) + ' 0 0 1 ' + f(xr) + ' ' + f(-h + top + r) + ' V-3 Z" fill="' + ARCH + '" stroke="#5a5446" stroke-width=".6"/>';
      if (ring) { var bx = (xl + xr) / 2 + Math.sin(t * 5 + i) * r * 0.25; s += '<path d="M' + f(bx - r * 0.5) + ' ' + f(-h + top + r + 9) + ' Q' + f(bx) + ' ' + f(-h + top + r - 2) + ' ' + f(bx + r * 0.5) + ' ' + f(-h + top + r + 9) + ' Z" fill="url(#gold)"/>'; }
    }
    return s;
  }
  function floorSvg(k, t, o) {
    var h = FLOORS[k], w = k === 7 ? BW : TW, s = "";
    if (k === 0) {   // ground floor: blind arcade + door
      s += '<rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="1.6"/>';
      for (var i = 0; i < 7; i++) { var a0 = -Math.PI / 2 + i * Math.PI / 7, a1 = a0 + Math.PI / 7, xl = Math.sin(a0) * w / 2 + 1.5, xr = Math.sin(a1) * w / 2 - 1.5, r = (xr - xl) / 2; if (r < 1) continue;
        s += '<path d="M' + f(xl) + ' -2 V' + f(-h + 8 + r) + ' A' + f(r) + ' ' + f(Math.min(r, 6)) + ' 0 0 1 ' + f(xr) + ' ' + f(-h + 8 + r) + ' V-2" fill="none" stroke="#9c9484" stroke-width="1.2"/>'; }
      s += '<path d="M-6 0 V-20 A6 5 0 0 1 6 -20 V0 Z" fill="#4a3a2a" stroke="' + INK + '" stroke-width="1"/>';
    } else {
      s += '<rect x="' + (-w / 2 + 3) + '" y="' + (-h) + '" width="' + (w - 6) + '" height="' + h + '" fill="#8f887a"/>';
      s += '<rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="1.4"/>';
      s += arches(w, h, k === 7 ? 6 : 8, 6, k === 7 && o.ring, t);
    }
    // the cornice band on top of the floor
    s += '<rect x="' + (-w / 2 - 3) + '" y="' + (-h - 3) + '" width="' + (w + 6) + '" height="5" rx="1.5" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="1.2"/>';
    if (k === 7) s += '<rect x="' + (-w / 2 + 2) + '" y="' + (-h - 8) + '" width="' + (w - 4) + '" height="5" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="1"/>';
    return s;
  }
  // o: { s, tilt (deg, + leans right), n (floors built, fractional), bend (deg per upper floor: the banana), sink, ring, cog, ghost, scaffold }
  function tower(x, y, t, o) {
    o = o || {}; var sc = o.s || 1, n = o.n == null ? 8 : o.n, s = '<g transform="translate(' + f(x) + ' ' + f(y + (o.sink || 0)) + ') rotate(' + f(o.tilt == null ? 5 : o.tilt) + ') scale(' + sc + ')"' + (o.op != null ? ' opacity="' + o.op + '"' : "") + '>';
    if (!o.noShadow) s += '<ellipse cx="' + f(-(o.tilt == null ? 5 : o.tilt) * 3) + '" cy="2" rx="60" ry="7" fill="#000" opacity=".2" filter="url(#soft2)"/>';
    var close = "";
    for (var k = 0; k < 8 && k < n; k++) {
      var fr = clamp(n - k);
      if (k >= 4 && o.bend) { s += '<g transform="rotate(' + f(-o.bend) + ')">'; close += '</g>'; }
      s += '<g transform="scale(1 ' + fr.toFixed(3) + ')">' + floorSvg(k, t, o) + '</g>';
      if (o.scaffold && k === Math.floor(n - 0.001)) s += '<path d="M-44 0 V' + f(-FLOORS[k] * fr - 10) + ' M44 0 V' + f(-FLOORS[k] * fr - 10) + ' M-44 ' + f(-FLOORS[k] * fr / 2) + ' H-36 M36 ' + f(-FLOORS[k] * fr / 2) + ' H44" stroke="#8a6a3a" stroke-width="2"/>';
      s += '<g transform="translate(0 ' + f(-FLOORS[k] * fr - (fr < 1 ? 0 : 0)) + ')">'; close += '</g>';
    }
    s += close;
    if (o.cog) s += '<circle cx="0" cy="' + f(-TH * 0.44) + '" r="' + f(7 + Math.sin(t * 6)) + '" fill="#e23b2f" stroke="#fff" stroke-width="2"/>';
    return s + '</g>';
  }
  // where a point at height h on the tower's axis ends up in the world
  function axisPt(x, y, h, tilt, sc) { var a = tilt * Math.PI / 180; return [x + Math.sin(a) * h * sc, y - Math.cos(a) * h * sc]; }

  // the cathedral (Duomo) beside it: white façade with stacked arcades, gable, dome behind
  function duomo(x, y, sc) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    s += '<ellipse cx="60" cy="-130" rx="34" ry="30" fill="#c9c2b2" stroke="' + INK + '" stroke-width="1.6"/><rect x="26" y="-130" width="68" height="34" fill="#ddd6c6" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-90 0 V-80 L-60 -80 L-60 -110 L0 -150 L60 -110 L60 -80 L90 -80 V0 Z" fill="' + MARBLE + '" stroke="' + INK + '" stroke-width="2"/>';
    for (var r = 0; r < 3; r++) { var yy = -40 - r * 26, w = r === 0 ? 90 : 60 - r * 6; for (var i = -5; i <= 5; i++) { var cx = i * w / 5.5; if (Math.abs(cx) < w) s += '<path d="M' + f(cx - 3.5) + ' ' + f(yy + 16) + ' V' + f(yy + 4) + ' A3.5 3.5 0 0 1 ' + f(cx + 3.5) + ' ' + f(yy + 4) + ' V' + f(yy + 16) + ' Z" fill="' + ARCH + '"/>'; } }
    s += '<path d="M-12 0 V-26 A12 10 0 0 1 12 -26 V0 Z" fill="#4a3a2a" stroke="' + INK + '"/>';
    return s + '</g>';
  }
  // the square: sky, clouds, pigeons, hills, the lawn of the Piazza dei Miracoli and its paths
  function piazza(t, gy, o) {
    o = o || {}; var s = (o.sky === "dusk" ? sky("dusk") : sky("day")) + (o.sky === "dusk" ? sun(140, gy - 120, 26, "#ffd27a") : sun(540, 40, 18, "#fff3c4")) + clouds(t, 12, 10, 5, 0.85);
    s += '<path d="M-400 ' + (gy - 20) + ' Q-100 ' + (gy - 70) + ' 200 ' + (gy - 30) + ' T800 ' + (gy - 40) + ' T1040 ' + (gy - 30) + ' V' + gy + ' H-400 Z" fill="#9fb48a" opacity=".7"/>';
    for (var i = 0; i < 18; i++) { var tx = -350 + i * 80 + hash(i) * 30; s += '<ellipse cx="' + f(tx) + '" cy="' + (gy - 14) + '" rx="16" ry="' + f(18 + hash(i + 3) * 10) + '" fill="#5f7f4a"/>'; }
    s += '<rect x="-400" y="' + (gy - 6) + '" width="1440" height="10" fill="#d9cdb0"/>';
    if (o.duomo !== false) s += duomo(o.dx == null ? 130 : o.dx, gy - 4, o.ds || 0.9);
    s += '<rect x="-400" y="' + gy + '" width="1440" height="400" fill="url(#grass-day)"/>';
    s += '<path d="M-400 ' + (gy + 30) + ' H1040" stroke="#e8dfc8" stroke-width="10"/>';
    s += birds(t, gy - 220, 36);
    return s;
  }
  // a tourist: ball head, t-shirt, legs; o: {push: arm stretched up (0..1), phone, col, s, look}
  function person(x, y, t, mood, o) {
    o = o || {}; var sc = o.s || 1, col = o.col || "#2f6fae", s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + sc + ')">';
    s += '<path d="M-12 0 L-8 -40 M12 0 L8 -40" stroke="#3a3d52" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M-24 -38 C-26 -78 -16 -90 0 -90 C16 -90 26 -78 24 -38 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.push != null) { var p = o.push, hx = lerp(26, 70, p), hy = lerp(-50, -120, p) + Math.sin(t * 2) * 2; s += '<path d="M14 -78 Q' + f(hx - 14) + ' ' + f(hy + 20) + ' ' + f(hx) + ' ' + f(hy) + '" stroke="' + col + '" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="8" fill="#fbfbf7" stroke="' + INK + '" stroke-width="2"/>'; }
    else s += '<path d="M16 -76 Q30 -60 26 -42" stroke="' + col + '" stroke-width="11" fill="none" stroke-linecap="round"/>';
    if (o.phone) s += '<path d="M-14 -76 Q-34 -80 -40 -96" stroke="' + col + '" stroke-width="11" fill="none" stroke-linecap="round"/><rect x="-52" y="-122" width="20" height="32" rx="4" fill="#1c1c1c"/><rect x="-49" y="-118" width="14" height="24" rx="2" fill="#8fc2da" opacity="' + f(0.7 + 0.3 * Math.sin(t * 4)) + '"/>';
    else s += '<path d="M-16 -76 Q-30 -60 -26 -42" stroke="' + col + '" stroke-width="11" fill="none" stroke-linecap="round"/>';
    s += head(0, -112, 24, mood, t, o.look);
    if (o.cap) s += '<path d="M-22 -122 C-20 -142 20 -142 22 -122 Z" fill="' + o.cap + '" stroke="' + INK + '" stroke-width="2"/><path d="M14 -124 H36" stroke="' + o.cap + '" stroke-width="5" stroke-linecap="round"/>';
    return s + '</g>';
  }
  // the ground in cut-away under the square: fill, soft clay with water, fine sand, more clay; o: {squeeze 0..1, quake}
  function soil(t, gy, o) {
    o = o || {}; var sq = o.squeeze || 0, s = '<rect x="-400" y="' + gy + '" width="1440" height="400" fill="#7a6650"/>';
    var L = [[0, 22, "#b39a72"], [22, 70, "#8b8676"], [92, 46, "#c9b07a"], [138, 260, "#77736a"]];
    L.forEach(function (l, k) { s += '<rect x="-400" y="' + (gy + l[0]) + '" width="1440" height="' + l[1] + '" fill="' + l[2] + '"/><path d="M-400 ' + (gy + l[0]) + ' H1040" stroke="#4a4030" stroke-width="1.4"/>';
      for (var g = 0; g < 40; g++) { var gx = -380 + hash(g * 7 + k) * 1400, gyy = gy + l[0] + 4 + hash(g + k * 13) * (Math.min(l[1], 90) - 8) * (k === 1 || k === 3 ? 1 - sq * 0.35 : 1); s += '<circle cx="' + f(gx) + '" cy="' + f(gyy) + '" r="' + f(1 + hash(g * 3) * 2) + '" fill="#000" opacity=".14"/>'; } });
    for (var w = 0; w < 26; w++) { var wx = -300 + hash(w + 40) * 1200, wy = gy + 26 + hash(w + 70) * 60 * (1 - sq * 0.4), sh = 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + w)); s += '<path d="M' + f(wx) + ' ' + f(wy - 4) + ' q3 5 0 7 q-3 -2 0 -7 Z" fill="#5fb0e0" opacity="' + f(sh * (1 - sq * 0.7)) + '"/>'; }
    s += '<rect x="-400" y="' + (gy - 4) + '" width="1440" height="6" fill="#6f9548"/>';
    return s;
  }
  function ruler(x, y0, y1, label, col) { var s = '<path d="M' + x + ' ' + y0 + ' V' + y1 + ' M' + (x - 7) + ' ' + y0 + ' H' + (x + 7) + ' M' + (x - 7) + ' ' + y1 + ' H' + (x + 7) + '" stroke="' + (col || "#fff") + '" stroke-width="2.6"/>'; return s; }
  function soldier(x, y, t, mood, flag, dir, swing) {
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + dir + ' 1)">';
    s += '<path d="M-10 0 L-6 -36 M10 0 L6 -36" stroke="#3a3530" stroke-width="9" stroke-linecap="round"/><path d="M-22 -34 C-24 -72 -14 -84 0 -84 C14 -84 24 -72 22 -34 Z" fill="' + flag[0] + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 -80 V-38 M-18 -60 H18" stroke="' + flag[1] + '" stroke-width="5"/>';
    var a = -40 + swing * 60; s += '<g transform="translate(16 -70) rotate(' + f(a) + ')"><path d="M0 0 H22" stroke="' + flag[0] + '" stroke-width="10" stroke-linecap="round"/><path d="M22 0 H70" stroke="#c9ced4" stroke-width="4" stroke-linecap="round"/><path d="M22 -7 V7" stroke="#8a6a3a" stroke-width="4"/></g>';
    s += head(0, -104, 22, mood, t, 1) + '<path d="M-22 -110 C-20 -136 20 -136 22 -110 Z" fill="#8a929c" stroke="' + INK + '" stroke-width="2"/>';
    return s + '</g>';
  }
  function banner(x, y, t, c1, c2) { var w = Math.sin(t * 4 + x) * 4; return '<path d="M' + x + ' ' + y + ' V' + (y - 90) + '" stroke="#5a4a30" stroke-width="3"/><path d="M' + x + ' ' + (y - 90) + ' Q' + (x + 25) + ' ' + f(y - 96 + w) + ' ' + (x + 50) + ' ' + f(y - 88 + w) + ' V' + f(y - 58 + w) + ' Q' + (x + 25) + ' ' + f(y - 66 - w) + ' ' + x + ' ' + (y - 60) + ' Z" fill="' + c1 + '" stroke="' + INK + '" stroke-width="1.4"/><path d="M' + (x + 25) + ' ' + f(y - 92) + ' V' + f(y - 62) + ' M' + (x + 6) + ' ' + f(y - 77) + ' H' + (x + 46) + '" stroke="' + c2 + '" stroke-width="5"/>'; }
  function banana(x, y, s, rot) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ') scale(' + s + ')"><path d="M-40 -30 C-10 20 30 20 46 -14 C30 4 0 6 -30 -36 Z" fill="#f2d03a" stroke="' + INK + '" stroke-width="2.4"/><path d="M-40 -30 l-6 -6" stroke="#5a4a20" stroke-width="5" stroke-linecap="round"/><path d="M-26 -18 C0 6 24 4 38 -8" stroke="#c9a020" stroke-width="2" fill="none"/></g>'; }
  function yearBoard(x, y, yr, sz) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><rect x="-' + (sz * 1.6) + '" y="-' + sz + '" width="' + (sz * 3.2) + '" height="' + (sz * 1.5) + '" rx="8" fill="#2b2016" stroke="#f2c230" stroke-width="3"/><text y="' + f(sz * 0.35) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:#f2c230">' + yr + '</text></g>'; }
  function cross(x, y, r, p) { if (p <= 0) return ""; var k = r * clamp(p); return '<path d="M' + f(x - k) + ' ' + f(y - k) + ' L' + f(x + k) + ' ' + f(y + k) + ' M' + f(x + k) + ' ' + f(y - k) + ' L' + f(x - k) + ' ' + f(y + k) + '" stroke="#e23b2f" stroke-width="10" stroke-linecap="round"/>'; }
  function check(x, y, r, p) { if (p <= 0) return ""; return '<path d="M' + f(x - r) + ' ' + f(y) + ' L' + f(x - r * 0.3) + ' ' + f(y + r * 0.7) + ' L' + f(x + r) + ' ' + f(y - r * 0.8) + '" stroke="#3cae6a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="200" stroke-dashoffset="' + f(200 * (1 - clamp(p))) + '"/>'; }
  function dust(t, x, y, u) { var s = ""; for (var i = 0; i < 10; i++) { var a = Math.PI * (1 + i / 9), r = 10 + u * 60 * (0.6 + hash(i) * 0.6); s += '<circle cx="' + f(x + Math.cos(a) * r * 1.6) + '" cy="' + f(y + Math.sin(a) * r * 0.5) + '" r="' + f(10 + u * 20) + '" fill="#d9cdb0" opacity="' + f(0.8 * (1 - clamp(u / 1.6))) + '" filter="url(#soft2)"/>'; } return s; }
  // the cog line: a dashed plumb line from the centre of gravity down to the ground, ending in a target dot
  function plumb(x, y, tilt, sc, t, p, bad) {
    var c = axisPt(x, y, TH * 0.44, tilt, sc), yy = lerp(c[1], y, clamp(p));
    return '<path d="M' + f(c[0]) + ' ' + f(c[1]) + ' V' + f(yy) + '" stroke="' + (bad ? "#e23b2f" : "#f2c230") + '" stroke-width="3.4" stroke-dasharray="8 6" stroke-dashoffset="' + f(-t * 30) + '"/>' + (p >= 1 ? '<circle cx="' + f(c[0]) + '" cy="' + f(y) + '" r="' + f(6 + 2 * Math.sin(t * 6)) + '" fill="' + (bad ? "#e23b2f" : "#f2c230") + '" stroke="' + INK + '" stroke-width="1.6"/>' : "");
  }
  function baseZone(x, y, sc, t, col) { return '<rect x="' + f(x - 36 * sc) + '" y="' + f(y - 3) + '" width="' + f(72 * sc) + '" height="8" rx="3" fill="' + (col || "#3cae6a") + '" opacity="' + f(0.7 + 0.25 * Math.sin(t * 5)) + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function ingots(x, y, n, t) { var s = ""; for (var i = 0; i < n; i++) { var r = Math.floor(i / 4), c = i % 4; s += '<rect x="' + f(x + c * 22 - 44 + r * 11) + '" y="' + f(y - 12 - r * 12) + '" width="20" height="11" rx="2" fill="url(#gMetal)" stroke="' + INK + '" stroke-width="1.2"/>'; } return s; }
  function barrier(x, y, t) { var s = ""; for (var i = 0; i < 4; i++) s += '<path d="M' + (x - 60 + i * 40) + ' ' + y + ' V' + (y - 34) + '" stroke="#5a5a5a" stroke-width="4"/>'; s += '<rect x="' + (x - 64) + '" y="' + (y - 34) + '" width="128" height="10" fill="#e23b2f" stroke="' + INK + '"/>'; for (var j = 0; j < 6; j++) s += '<rect x="' + (x - 56 + j * 22) + '" y="' + (y - 34) + '" width="10" height="10" fill="#fff"/>'; return s; }
  // inclined drill tubes reaching under the high (left) side, soil coming out along them
  function drills(t, x, gy, p) {
    var s = "";
    for (var k = 0; k < 3; k++) { var x0 = x - 150 + k * 10, y0 = gy - 4, x1 = x - 40 + k * 14, y1 = gy + 40 + k * 10, xe = lerp(x0, x1, p), ye = lerp(y0, y1, p);
      s += '<path d="M' + x0 + ' ' + y0 + ' L' + f(xe) + ' ' + f(ye) + '" stroke="#5a6068" stroke-width="7" stroke-linecap="round"/><path d="M' + x0 + ' ' + y0 + ' L' + f(xe) + ' ' + f(ye) + '" stroke="#c9ced4" stroke-width="3" stroke-dasharray="4 4" stroke-dashoffset="' + f(t * 30) + '"/>';
      if (p > 0.95) for (var q = 0; q < 5; q++) { var u = (t * 0.6 + q / 5 + k * 0.13) % 1; s += '<circle cx="' + f(lerp(x1, x0, u)) + '" cy="' + f(lerp(y1, y0, u) - 6) + '" r="3" fill="#8b8676" stroke="' + INK + '" stroke-width=".8"/>'; } }
    s += '<rect x="' + (x - 176) + '" y="' + (gy - 26) + '" width="40" height="22" rx="3" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + (x - 166) + '" cy="' + (gy - 2) + '" r="5" fill="' + INK + '"/><circle cx="' + (x - 146) + '" cy="' + (gy - 2) + '" r="5" fill="' + INK + '"/>';
    var pile = 4 + 10 * clamp(p); s += '<path d="M' + (x - 230) + ' ' + gy + ' Q' + (x - 210) + ' ' + f(gy - pile * 2) + ' ' + (x - 190) + ' ' + gy + ' Z" fill="#8b8676" stroke="' + INK + '" stroke-width="1.2"/>';
    return s;
  }
  function protractor(x, y, tilt, sc, t, label) {
    var c = axisPt(x, y, TH * 0.8, tilt, sc), r = 90, a = tilt * Math.PI / 180;
    return '<path d="M' + x + ' ' + y + ' V' + f(y - TH * 0.85 * sc) + '" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 5" opacity=".9"/><path d="M' + x + ' ' + f(y - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(x + Math.sin(a) * r) + ' ' + f(y - Math.cos(a) * r) + '" stroke="#f2c230" stroke-width="4" fill="none"/>';
  }
  function springs(t, x, gy, n, k) { var s = ""; for (var i = 0; i < n; i++) { var cx = x - 40 + i * 26, h = 30 + Math.sin(t * 18 + i) * 6 * k, d = "M" + cx + " " + gy; for (var j = 1; j <= 8; j++) d += " L" + (cx + (j % 2 ? -6 : 6)) + " " + f(gy + h * j / 8); s += '<path d="' + d + '" stroke="#f2c230" stroke-width="2.6" fill="none"/>'; } return s; }

  // ── shots ───────────────────────────────────────────────

  // ── the escape plan, built up in one cross-section of a first-floor flat at night: bedroom (left, bed under a window),
  // the hall with the living room where the fire starts and the kitchen corner, the front door, then the stairwell with
  // the stairs and the lift. Every «عشان كده» turns one more part on: hand on the door, crawling under the smoke, doors
  // closed behind you, the stairs, the wet towel, the window signal and 180, the smoke alarm, the extinguisher, the meeting point.
  var CEIL = 40, FLR = 300, WL = 30, PB = 250, PF = 470, SWR = 650;
  function R(x, y, w, h, fill, extra) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  function txt(s, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:#1c1c1c;stroke-width:3;paint-order:stroke">' + s + '</text>'; }
  function flame(x, y, s, t, k) {
    var fl = 1 + 0.18 * Math.sin(t * 11 + k) + 0.1 * Math.sin(t * 23 + k * 2), sw = Math.sin(t * 7 + k) * 4;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ' ' + f(s * fl) + ')"><path d="M-20 0 C-26 -20 -10 -34 ' + f(sw) + ' -60 C8 -40 26 -28 20 0 Z" fill="#ff6a1f"/><path d="M-12 0 C-15 -14 -4 -22 ' + f(sw * 0.6) + ' -40 C6 -26 16 -16 12 0 Z" fill="#ffb02e"/><path d="M-6 0 C-7 -7 -1 -12 ' + f(sw * 0.3) + ' -20 C3 -12 8 -8 6 0 Z" fill="#fff1a8"/></g>';
  }
  function fire(x, y, s, t) { var g = '<ellipse cx="' + f(x) + '" cy="' + f(y - 40 * s) + '" rx="' + f(150 * s) + '" ry="' + f(110 * s) + '" fill="url(#gFireGlow)" opacity="' + f(0.8 + 0.2 * Math.sin(t * 9)) + '"/>'; for (var i = 0; i < 5; i++) g += flame(x + (i - 2) * 22 * s, y, s * (0.8 + 0.5 * hash(i)), t, i); return g; }
  // a smoke layer hanging from the ceiling down to `depth`, its lower edge rolling
  function smoke(x0, x1, depth, t) {
    if (depth <= 1) return ""; var y = CEIL + depth, d = "M" + x0 + " " + CEIL + " V" + f(y);
    for (var x = x0; x <= x1; x += 10) d += " L" + x + " " + f(y + Math.sin(x * 0.05 + t * 2) * 5 + Math.sin(x * 0.13 - t * 3) * 3);
    var s = '<path d="' + d + ' V' + CEIL + ' Z" fill="url(#gSmoke)"/>';
    for (var i = 0; i < 8; i++) { var px = x0 + ((hash(i) * (x1 - x0) + t * 14 * (i % 2 ? 1 : -1)) % (x1 - x0) + (x1 - x0)) % (x1 - x0); s += '<circle cx="' + f(px) + '" cy="' + f(y - 4 + Math.sin(t * 2 + i) * 4) + '" r="' + f(12 + hash(i + 2) * 10) + '" fill="#5a5550" opacity=".7" filter="url(#soft2)"/>'; }
    return s;
  }
  // a door seen face-on in the partition at x; open 0..1 swings it on its left hinge; hot glows it red
  function door(x, t, o) {
    o = o || {}; var w = 56, h = 150, x0 = x - w / 2, y0 = FLR - h, op = clamp(o.open || 0), s = R(x0, y0, w, h, o.behind || "#1c1612");
    if (o.fireBehind && op > 0) s += '<g opacity="' + f(op) + '">' + flame(x - 6, FLR, 0.9, t, 1) + flame(x + 14, FLR, 0.7, t, 2) + '</g>';
    var ww = w * Math.cos(op * 1.3);
    s += '<g transform="translate(' + f(x0) + ' 0)"><path d="M0 ' + y0 + ' L' + f(ww) + ' ' + f(y0 + op * 8) + ' L' + f(ww) + ' ' + f(FLR - op * 8) + ' L0 ' + FLR + ' Z" fill="url(#gDoor)" stroke="' + INK + '" stroke-width="2"/>';
    if (op < 0.5) s += R(8, y0 + 14, w - 16, 50, "none", ' stroke="#6a4222" stroke-width="1.6" rx="2"') + R(8, y0 + 80, w - 16, 56, "none", ' stroke="#6a4222" stroke-width="1.6" rx="2"');
    s += '<circle cx="' + f(ww - 9) + '" cy="' + f(FLR - 72) + '" r="4.5" fill="url(#gold)" stroke="' + INK + '"/>';
    if (o.hot) s += '<path d="M0 ' + y0 + ' L' + f(ww) + ' ' + f(y0 + op * 8) + ' L' + f(ww) + ' ' + f(FLR - op * 8) + ' L0 ' + FLR + ' Z" fill="#ff3b1f" opacity="' + f(o.hot * (0.35 + 0.2 * Math.sin(t * 6))) + '"/>';
    s += '</g>';
    if (o.hot) for (var i = 0; i < 4; i++) { var u = (t * 0.8 + i / 4) % 1; s += '<path d="M' + f(x - 18 + i * 12) + ' ' + f(y0 - u * 30) + ' q4 -6 0 -12 q-4 -6 0 -12" stroke="#ff7a2f" stroke-width="2" fill="none" opacity="' + f((1 - u) * o.hot) + '"/>'; }
    if (o.seep) for (var j = 0; j < 5; j++) { var v = (t * 0.7 + j / 5) % 1; s += '<circle cx="' + f(x - (o.seepDir || 1) * (8 + v * 60)) + '" cy="' + f(FLR - 4 - v * 50) + '" r="' + f(4 + v * 12) + '" fill="#5a5550" opacity="' + f(0.7 * (1 - v)) + '" filter="url(#soft2)"/>'; }
    if (o.towel) s += '<path d="M' + f(x - 34) + ' ' + FLR + ' q4 -10 16 -9 h38 q10 0 14 9 Z" fill="#3f8fd0" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + f(x - 24) + ' ' + (FLR - 5) + ' h44" stroke="#bfe0ff" stroke-width="2" stroke-dasharray="4 3"/>' + '<circle cx="' + f(x - 10 + Math.sin(t * 3) * 6) + '" cy="' + f(FLR - 12 - ((t * 20) % 10)) + '" r="1.6" fill="#bfe6f7"/>';
    return s;
  }
  function bed(x, t) { return R(x, FLR - 34, 130, 22, "#7a4e2a", ' stroke="' + INK + '" stroke-width="2" rx="3"') + R(x - 6, FLR - 70, 12, 70, "#6a4222", ' stroke="' + INK + '" stroke-width="2" rx="3"') + R(x + 4, FLR - 46, 122, 14, "#f4f1e8", ' stroke="' + INK + '" stroke-width="1.6" rx="5"') + '<ellipse cx="' + (x + 22) + '" cy="' + (FLR - 50) + '" rx="18" ry="8" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>'; }
  function sleeper(x, t, mood) { return '<path d="M' + (x + 30) + ' ' + (FLR - 44) + ' C' + (x + 40) + ' ' + f(FLR - 62 - Math.sin(t * 2) * 2) + ' ' + (x + 110) + ' ' + (FLR - 60) + ' ' + (x + 124) + ' ' + (FLR - 44) + ' Z" fill="#5a8fc0" stroke="' + INK + '" stroke-width="1.6"/>' + head(x + 24, FLR - 62, 15, mood, t) + (mood === "happy" ? txt("z", x + 46, FLR - 86 - ((t * 10) % 12), 14, "#bfe0ff") + txt("Z", x + 58, FLR - 100 - ((t * 10 + 6) % 12), 18, "#bfe0ff") : ""); }
  function win(x, y, t, lit) { var s = R(x, y, 80, 70, lit ? "#ff9a4a" : "url(#sky-night)", ' stroke="#6a6258" stroke-width="5"') + '<path d="M' + (x + 40) + ' ' + y + ' V' + (y + 70) + ' M' + x + ' ' + (y + 35) + ' H' + (x + 80) + '" stroke="#6a6258" stroke-width="3"/>'; if (!lit) for (var i = 0; i < 6; i++) s += '<circle cx="' + f(x + 6 + hash(i) * 68) + '" cy="' + f(y + 6 + hash(i + 3) * 58) + '" r="1" fill="#fff" opacity="' + f(0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))) + '"/>'; return s; }
  function alarm(x, t, k, beeping) { if (k <= 0) return ""; var s = '<g transform="translate(' + x + ' ' + (CEIL + 2) + ') scale(' + f(pop(k)) + ')"><path d="M-18 0 H18 Q16 12 0 12 Q-16 12 -18 0 Z" fill="#f4f4f0" stroke="' + INK + '" stroke-width="1.8"/><circle cx="0" cy="7" r="2.6" fill="' + (beeping ? (Math.sin(t * 14) > 0 ? "#ff3b2f" : "#6a1a14") : (Math.sin(t * 2) > 0.9 ? "#3cae6a" : "#1f5a34")) + '"/></g>'; if (beeping) for (var i = 0; i < 3; i++) { var r = ((t * 70 + i * 22) % 66); s += '<path d="M' + f(x - r) + ' ' + f(CEIL + 14 + r * 0.4) + ' Q' + x + ' ' + f(CEIL + 14 + r * 1.2) + ' ' + f(x + r) + ' ' + f(CEIL + 14 + r * 0.4) + '" stroke="#ff3b2f" stroke-width="3" fill="none" opacity="' + f(1 - r / 66) + '"/>'; } return s; }
  function extinguisher(x, t, k) { if (k <= 0) return ""; return '<g transform="translate(' + x + ' ' + FLR + ') scale(' + f(pop(k)) + ')"><rect x="-10" y="-50" width="20" height="50" rx="8" fill="url(#gExt)" stroke="' + INK + '" stroke-width="1.8"/><rect x="-6" y="-60" width="12" height="10" fill="#2b2e33"/><path d="M6 -56 Q22 -56 20 -36" stroke="#1c1c1c" stroke-width="3" fill="none"/><rect x="-7" y="-36" width="14" height="14" fill="#f4f1e8"/></g>'; }
  function thermo(x, y, v, t, hot) { var h = 110, lv = h * clamp(v); return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-9" y="' + (-h) + '" width="18" height="' + h + '" rx="9" fill="#f4f1e8" stroke="' + INK + '" stroke-width="2"/><circle cy="10" r="15" fill="' + (hot ? "#e23b2f" : "#3f8fd0") + '" stroke="' + INK + '" stroke-width="2"/><rect x="-4" y="' + f(-lv + 4 + Math.sin(t * 5) * 1.5) + '" width="8" height="' + f(lv) + '" fill="' + (hot ? "#e23b2f" : "#3f8fd0") + '"/></g>'; }
  // someone crawling on hands and knees, heading right (dir 1) or left (-1)
  function crawler(x, t, mood, dir) { var c = Math.sin(t * 8), s = '<g transform="translate(' + f(x) + ' ' + FLR + ') scale(' + (dir || 1) * 0.62 + ' .62)">'; s += '<path d="M-40 0 L' + f(-46 + c * 8) + ' -30 M40 0 L' + f(34 - c * 8) + ' -34" stroke="#3a3d52" stroke-width="10" stroke-linecap="round"/><path d="M' + f(10 + c * 6) + ' 0 L20 -40 M' + f(30 - c * 6) + ' 0 L36 -40" stroke="#c23a26" stroke-width="10" stroke-linecap="round"/>'; s += '<ellipse cx="-4" cy="-48" rx="50" ry="22" fill="#c23a26" stroke="' + INK + '" stroke-width="2.4"/>'; return s + head(58, -58, 22, mood, t, 1) + '</g>'; }
  function phone(x, y, t, k, txtS) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k)) + ') rotate(' + f(Math.sin(t * 3) * 4) + ')"><rect x="-22" y="-40" width="44" height="80" rx="8" fill="#1c1c1c"/><rect x="-18" y="-32" width="36" height="62" rx="3" fill="#2f6fae"/>' + txt(txtS || "180", 0, 6, 17, "#fff") + '<circle cx="0" cy="22" r="6" fill="#3cae6a" opacity="' + f(0.6 + 0.4 * Math.sin(t * 8)) + '"/></g>'; }
  // the flat. o: { smokeB, smokeH (depth px), fire (0..1), doorB, doorF {open, hot, seep, towel}, alarm, beep, ext, lit, dark }
  function flat(t, o) {
    o = o || {}; var s = sky("night") + stars(t);
    s += R(-400, -300, 1440, CEIL + 300, "#4a4640") + R(-400, FLR, 1440, 400, "#4a4640") + R(WL - 14, CEIL, 14, FLR - CEIL, "#6a6258") + R(SWR, CEIL, 14, FLR - CEIL + 140, "#6a6258");
    s += R(WL, CEIL, PB - WL, FLR - CEIL, "#e6d6bb") + R(PB, CEIL, PF - PB, FLR - CEIL, "#d6dccb") + R(PF, CEIL, SWR - PF, FLR - CEIL + 140, "#c7c1b6");
    for (var i = 0; i < 14; i++) s += R(WL + i * 16, FLR - 8, 15, 8, i % 2 ? "#a77a5c" : "#b78a6a");
    s += win(60, 80, t, false) + bed(50, t);
    s += R(PB + 20, FLR - 46, 60, 46, "#c9c2b2", ' stroke="' + INK + '" stroke-width="1.6"') + R(PB + 20, FLR - 52, 60, 6, "#8a8070") + '<rect x="' + (PB + 30) + '" y="' + (FLR - 120) + '" width="40" height="40" fill="#bfc8b8" stroke="' + INK + '" stroke-width="1.4"/>';
    s += R(375, FLR - 40, 80, 30, "#7a5a8a", ' stroke="' + INK + '" stroke-width="1.6" rx="8"') + R(370, FLR - 60, 14, 50, "#6a4a7a", ' stroke="' + INK + '" stroke-width="1.6" rx="6"') + R(446, FLR - 60, 14, 50, "#6a4a7a", ' stroke="' + INK + '" stroke-width="1.6" rx="6"');
    // stairwell: a flight down to the right, a flight up from the floor below, the lift shaft at the far end
    s += '<path d="M' + (PF + 10) + ' ' + FLR + ' L' + (PF + 20) + ' ' + FLR; for (var k = 0; k < 7; k++) s += ' V' + (FLR + 12 + k * 18) + ' H' + (PF + 34 + k * 16); s += ' L' + (PF + 30) + ' ' + (FLR + 140) + ' Z" fill="#a8a196" stroke="' + INK + '" stroke-width="1.6"/>';
    s += R(PF + 20, FLR - 4, 70, 6, "#8a8378");
    s += R(570, CEIL + 20, 72, FLR - CEIL - 20, "#3a3d42", ' stroke="' + INK + '" stroke-width="2"') + '<path d="M606 ' + (CEIL + 20) + ' V' + FLR + '" stroke="#2b2e33" stroke-width="2"/>' + R(574, FLR - 130, 64, 130, o.lift === "x" ? "#5a3a30" : "#9aa2ac", ' stroke="' + INK + '" stroke-width="1.6"') + '<circle cx="606" cy="' + (CEIL + 34) + '" r="5" fill="' + (Math.sin(t * 3) > 0 ? "#f2c230" : "#6a5a20") + '"/>';
    if (o.fire) s += fire(415, FLR, 0.7 * o.fire, t);
    s += smoke(PB, SWR, o.smokeH || 0, t) + smoke(WL, PB, o.smokeB || 0, t);
    s += door(PB, t, o.doorB) + door(PF, t, Object.assign({ behind: "#2b2622" }, o.doorF || {}));
    s += alarm(140, t, o.alarm || 0, o.beep) + alarm(360, t, o.alarm || 0, o.beep) + extinguisher(PB + 100, t, o.ext || 0);
    if (o.dark) s += R(-400, -300, 1440, 960, "#06101e", ' opacity="' + o.dark + '"');
    return s;
  }
  // outside: the block of flats at night, the burning window, the street and the meeting point
  function outside(t, o) {
    o = o || {}; var s = sky(o.sky || "night") + (o.sky ? "" : stars(t)) + R(-400, 300, 1440, 300, "#3f3d3a") + '<path d="M-400 330 H1040" stroke="#e8dfc8" stroke-width="3" stroke-dasharray="20 14"/>';
    s += R(150, 20, 240, 280, "#c9a27c", ' stroke="' + INK + '" stroke-width="2.4"');
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) { var lit = o.burning && r === 1 && c === 1; s += R(176 + c * 70, 46 + r * 80, 48, 50, lit ? "#ff8a3a" : (hash(r * 3 + c + Math.floor(t * 0.3)) > 0.5 ? "#ffd98a" : "#2b3a52"), ' stroke="' + INK + '" stroke-width="1.6"'); }
    if (o.burning) s += flame(270, 176, 0.5, t, 1) + '<circle cx="270" cy="110" r="30" fill="#5a5550" opacity=".6" filter="url(#soft)"/>';
    s += R(244, 230, 52, 70, "#5a3a22", ' stroke="' + INK + '" stroke-width="2"');
    if (o.sign) s += '<g transform="translate(' + o.sign + ' 300)"><path d="M0 0 V-90" stroke="#5a5a5a" stroke-width="5"/><rect x="-46" y="-130" width="92" height="44" rx="6" fill="#3cae6a" stroke="' + INK + '" stroke-width="2"/>' + txt("نقطة التجمع", 0, -101, 14, "#fff") + '</g>';
    return s;
  }
  function item(kind, x, y, s, t) { var g = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 4) + ') scale(' + s + ') rotate(' + f(Math.sin(t * 2 + x) * 8) + ')">';
    if (kind === "phone") g += '<rect x="-12" y="-22" width="24" height="44" rx="5" fill="#1c1c1c"/><rect x="-9" y="-17" width="18" height="32" fill="#8fc2da"/>';
    if (kind === "cash") g += '<rect x="-24" y="-13" width="48" height="26" rx="3" fill="#7ab86a" stroke="' + INK + '" stroke-width="1.6"/><circle r="7" fill="none" stroke="#3a6a2a" stroke-width="2"/>';
    if (kind === "gold") g += '<circle r="16" fill="none" stroke="url(#gold)" stroke-width="7"/><circle r="16" fill="none" stroke="' + INK + '" stroke-width="1"/>';
    return g + '</g>'; }
  function clock(x, y, r, secs, t) { var a = -Math.PI / 2 + (1 - secs / 120) * Math.PI * 2, d = 'M0 0 L0 ' + (-r) + ' A' + r + ' ' + r + ' 0 ' + ((1 - secs / 120) > 0.5 ? 1 : 0) + ' 1 ' + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r) + ' Z'; var mm = Math.floor(secs / 60), ss = Math.floor(secs % 60); return '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + (r + 6) + '" fill="#f4f1e8" stroke="' + INK + '" stroke-width="3"/><path d="' + d + '" fill="#e23b2f" opacity=".75"/>' + txt(mm + ":" + (ss < 10 ? "0" : "") + ss, 0, 9, 24, "#fff") + '</g>'; }

  // ── shots ───────────────────────────────────────────────
  var SLEEP = 50;
  // 0 — you wake up and the flat is on fire: run and open the bedroom door?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(130, 190, k), lerp(200, 190, k), lerp(1.7, 1.4, k)]; }, function (u, d, t) {
    var wake = u > 0.8, s = flat(t, { fire: 1, smokeH: 90, smokeB: 30, doorB: { seep: true } });
    if (u < 2.0) s += sleeper(SLEEP, t, wake ? "shock" : "happy"); else s += bed(SLEEP, t) + human(lerp(120, 205, ease(clamp((u - 2) / 1))), FLR, t, "shock", { s: 0.62, col: "#c23a26", pose: u < 3 ? "walk" : "stand" });
    return s + qmark(200, 120, t, 44) + tag("تفتح؟", 110, 70, u, 2.4, -3, 22);
  });
  // 1 — no: you might be opening it onto the fire itself
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(230, 250, k), 200, lerp(1.5, 1.8, k)]; }, function (u, d, t) {
    var op = ease(clamp((u - 0.3) / 0.6)), s = flat(t, { fire: 1, smokeH: 110, smokeB: 40 + op * 60, doorB: { open: op, fireBehind: true } });
    s += human(200 - op * 20, FLR, t, op > 0.3 ? "shock" : "n", { s: 0.62, col: "#c23a26", push: 0.4 });
    if (op > 0.5) s += '<ellipse cx="250" cy="220" rx="' + f(60 + Math.sin(t * 9) * 6) + '" ry="70" fill="url(#gFireGlow)"/>';
    return s + cross(250, 120, 34, (u - 1.2) / 0.4) + tag("النار نفسها!", 330, 80, u, 1.4, 3, 20, "#f2a0a0");
  });
  // 2 — first: the back of your hand on the door and the knob before you open
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(230, 240, k), lerp(200, 225, k), lerp(1.8, 2.4, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 110, smokeB: 30, doorB: {} }), hy = u < 2 ? FLR - 120 : FLR - 72;
    s += human(196, FLR, t, "curious", { s: 0.62, col: "#c23a26", push: 0.55 + 0.05 * Math.sin(t * 2) });
    s += '<circle cx="' + f(236 + Math.sin(t * 3)) + '" cy="' + f(hy) + '" r="14" fill="none" stroke="#f2c230" stroke-width="3" opacity="' + f(0.6 + 0.4 * Math.sin(t * 6)) + '"/>';
    return s + tag("ضهر إيدك", 180, 120, u, 0.6, -3, 18) + tag("والأوكرة", 290, 160, u, 2.2, 3, 16, "#bfe0ff");
  });
  // 3 — if they're hot the fire is behind it: don't open, find another way out
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(240, 170, k), lerp(220, 180, k), lerp(2.2, 1.5, k)]; }, function (u, d, t) {
    var h = clamp(u / 0.8), s = flat(t, { fire: 1, smokeH: 110, smokeB: 30, doorB: { hot: h } });
    s += human(lerp(196, 150, ease(clamp((u - 1.2) / 1))), FLR, t, "shock", { s: 0.62, col: "#c23a26", pose: u > 1.2 && u < 2.2 ? "walk" : "stand" }) + cross(250, 140, 22, (u - 0.9) / 0.4);
    s += arrow(140, 150, 110, 120, "#3cae6a", 5, clamp((u - 1.8) / 0.6));
    return s + tag("سخن!", 300, 90, u, 0.5, 3, 20, "#f2a0a0") + tag("مخرج تاني", 110, 60, u, 2.0, -3, 17);
  });
  // 4 — but the room fills with smoke and it's hard to breathe
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(140, 150, k), lerp(180, 170, k), lerp(1.5, 1.7, k)]; }, function (u, d, t) {
    var sm = lerp(40, 150, clamp(u / d)), s = flat(t, { fire: 1, smokeH: 160, smokeB: sm, doorB: { seep: true } });
    s += human(150, FLR, t, "worry", { s: 0.62, col: "#c23a26", pose: "worry" }) + '<circle cx="' + f(165 + Math.sin(t * 10) * 3) + '" cy="' + (FLR - 70) + '" r="5" fill="#8a8580" opacity=".7"/>';
    return s + tag("دخان!", 120, 70, u, 0.6, -3, 22, "#f2a0a0");
  });
  // 5 — so you get down on the floor and crawl
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(120, 170, k), lerp(230, 240, k), lerp(1.6, 1.9, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 160, smokeB: 160, doorB: {} }) + human(lerp(175, 222, clamp(u / d)), FLR, t, "curious", { pose: "crawl", col: "#c23a26" });
    return s + tag("ازحف!", 140, 120, u, 0.5, -3, 22);
  });
  // 6 — hot smoke rises; the cleaner air stays near the floor
  shot(6, function (u, d) { var k = clamp(u / d); return [140, lerp(200, 220, k), lerp(1.4, 1.6, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 160, smokeB: 170, doorB: {} });
    s += '<rect x="' + WL + '" y="' + (FLR - 50) + '" width="' + (PB - WL) + '" height="46" fill="#bfe6f7" opacity="' + f(0.3 + 0.15 * Math.sin(t * 3)) + '"/>' + human(205, FLR, t, "n", { pose: "crawl", col: "#c23a26" });
    for (var i = 0; i < 4; i++) { var yy = 200 - ((t * 40 + i * 30) % 120); s += arrow(60 + i * 50, yy, 60 + i * 50, yy - 30, "#ff8a3a", 4, 1); }
    return s + tag("سخن لفوق", 140, 60, u, 0.6, -3, 18, "#f2a0a0") + tag("الهوا الأنضف", 150, 330, u, 1.8, 3, 18, "#bfe0ff");
  });
  // 7 — most people who die in fires die from the smoke, not the flames
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(380, 340, k), 170, lerp(1.6, 1.3, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 200, smokeB: 170, doorF: {} });
    s += '<g transform="translate(330 110) scale(' + f(1 + 0.05 * Math.sin(t * 4)) + ')"><circle r="40" fill="#5a5550" stroke="' + INK + '" stroke-width="2"/><circle cx="-26" cy="10" r="26" fill="#5a5550"/><circle cx="26" cy="12" r="24" fill="#5a5550"/>' + '<circle cx="-12" cy="0" r="6" fill="#fff"/><circle cx="12" cy="0" r="6" fill="#fff"/><circle cx="-12" cy="1" r="2.6" fill="' + INK + '"/><circle cx="12" cy="1" r="2.6" fill="' + INK + '"/><path d="M-10 18 Q0 10 10 18" stroke="#fff" stroke-width="2.4" fill="none"/></g>';
    return s + tag("الدخان أخطر", 330, 200, u, 0.8, -3, 20, "#f2a0a0") + tag("من النار", 440, 250, u, 1.8, 3, 17);
  });
  // 8 — say the door is cool and you get out into the hall
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(230, 300, k), 200, lerp(1.7, 1.4, k)]; }, function (u, d, t) {
    var op = ease(clamp((u - 0.6) / 0.6)), s = flat(t, { fire: 0.6, smokeH: 90, smokeB: 30, doorB: { open: op } });
    s += human(lerp(200, 300, ease(clamp((u - 1.2) / 1.2))), FLR, t, "n", { s: 0.62, col: "#c23a26", pose: u > 1.2 && u < 2.4 ? "walk" : "stand" }) + check(250, 120, 16, (u - 0.3) / 0.4);
    return s + tag("بارد", 190, 80, u, 0.3, -3, 20, "#bfe0ff");
  });
  // 9 — so you close every door behind you on the way out
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(280, 400, k), 190, lerp(1.5, 1.3, k)]; }, function (u, d, t) {
    var c1 = 1 - ease(clamp((u - 0.4) / 0.5)), s = flat(t, { fire: 0.6, smokeH: 90, smokeB: 30, doorB: { open: c1 }, doorF: { open: 1 - ease(clamp((u - 1.8) / 0.5)) } });
    s += human(lerp(290, 520, ease(clamp(u / d))), FLR, t, "n", { s: 0.62, col: "#c23a26", pose: "walk" });
    return s + tag("اقفل وراك", 380, 70, u, 0.8, 3, 21);
  });
  // 10 — the US test: closed-door room stayed under 40°C, open-door room passed 500
  shot(10, function (u, d) { return [320, 190, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.7)), s = graphPaper(t);
    s += R(60, 60, 220, 230, "#e6d6bb", ' stroke="' + INK + '" stroke-width="3"') + R(360, 60, 220, 230, "#e6d6bb", ' stroke="' + INK + '" stroke-width="3"');
    s += R(140, 140, 56, 150, "url(#gDoor)", ' stroke="' + INK + '" stroke-width="2"') + R(440, 140, 56, 150, "#1c1612") + flame(468, 290, 0.8, t, 1) + smoke(360, 580, 40 + 120 * k, t);
    s += thermo(240, 250, lerp(0.1, 0.25, k), t, false) + thermo(540, 250, lerp(0.1, 1, k), t, true);
    s += txt(Math.round(lerp(20, 38, k)) + " درجة", 170, 40, 24, "#3f8fd0") + txt(Math.round(lerp(20, 520, k)) + " درجة", 470, 40, 24, "#e23b2f");
    return s + tag("مقفول", 170, 330, u, 0.6, -3, 20, "#bfe0ff") + tag("مفتوح", 470, 330, u, 1.4, 3, 20, "#f2a0a0");
  });
  // 11 — the stairs are crowded and the lift is empty in front of you
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(540, 570, k), lerp(220, 210, k), lerp(1.6, 1.8, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 0.6, smokeH: 60, doorF: {} });
    for (var i = 0; i < 4; i++) s += human(PF + 40 + i * 18 + Math.sin(t * 3 + i) * 2, FLR + 30 + i * 18, t + i, "worry", { s: 0.42, pose: "walk", col: ["#2f6fae", "#3cae6a", "#e2b035", "#8a5cc2"][i] });
    s += human(545, FLR, t, "curious", { s: 0.6, col: "#c23a26", look: 1 }) + '<rect x="574" y="' + (FLR - 130) + '" width="64" height="130" fill="#fff8d0" opacity="' + f(0.25 + 0.15 * Math.sin(t * 4)) + '"/>';
    return s + qmark(606, 120, t, 40) + tag("الأسانسير؟", 560, 70, u, 0.8, 3, 19);
  });
  // 12 — so you take the stairs: the lift can stop with you inside and smoke coming in
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(570, 540, k), lerp(200, 240, k), lerp(1.8, 1.5, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 0.6, smokeH: 60, doorF: {}, lift: "x" }) + smoke(570, 642, 90 + 30 * Math.sin(t), t) + cross(606, 200, 28, (u - 0.4) / 0.4);
    s += human(lerp(500, 560, clamp((u - 1) / 2)), lerp(FLR, FLR + 100, clamp((u - 1) / 2)), t, "n", { s: 0.5, col: "#c23a26", pose: u > 1 && u < 3 ? "walk" : "stand" }) + arrow(510, FLR + 10, 580, FLR + 110, "#3cae6a", 5, clamp((u - 1.2) / 0.8));
    return s + tag("السلم", 470, 380, u, 1.6, -3, 21) + tag("ممكن يقف", 600, 70, u, 2.6, 3, 16, "#f2a0a0");
  });
  // 13 — but say the door is hot and you're trapped in the room
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(160, 170, k), lerp(180, 190, k), lerp(1.4, 1.6, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 160, smokeB: 40, doorB: { hot: 1, seep: true } }) + human(150, FLR, t, "worry", { s: 0.62, col: "#c23a26", pose: "worry" });
    return s + tag("محبوس!", 130, 70, u, 0.8, -3, 22, "#f2a0a0");
  });
  // 14 — so you keep the door shut and put a wet towel under it to block the smoke
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(230, 245, k), lerp(240, 260, k), lerp(2.0, 2.6, k)]; }, function (u, d, t) {
    var tw = u > 1.0, s = flat(t, { fire: 1, smokeH: 160, smokeB: 40, doorB: { hot: 0.6, seep: !tw, towel: tw } });
    s += human(200, FLR, t, "curious", { pose: "crawl", col: "#c23a26" }) + (tw ? check(260, 220, 14, (u - 1.4) / 0.5) : "");
    return s + tag("فوطة مبلولة", 230, 160, u, 1.0, -3, 17, "#bfe0ff");
  });
  // 15 — go to the window, wave something light-coloured, and call the fire brigade on 180
  shot(15, function (u, d) { var k = clamp(u / d); return [lerp(130, 120, k), lerp(160, 170, k), lerp(1.6, 1.8, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 160, smokeB: 40, doorB: { hot: 0.5, towel: true } }) + human(100, FLR - 30, t, "n", { s: 0.62, col: "#c23a26", pose: "wave", cloth: true });
    s += phone(200, 140, t, clamp((u - 1.6) / 0.6) * 1.2);
    return s + tag("شاور", 80, 60, u, 0.6, -3, 18) + tag("المطافي", 200, 230, u, 2.0, 3, 16, "#f2a0a0");
  });
  // 16 — but the fire started while you were asleep and nobody woke you
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(300, 200, k), lerp(180, 200, k), lerp(1.0, 1.5, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: clamp(u / 1.5), smokeH: lerp(10, 120, clamp(u / d)), smokeB: lerp(0, 40, clamp(u / d)), doorB: { seep: u > 1.5 }, dark: 0.25 }) + sleeper(SLEEP, t, "happy");
    return s + tag("نايم...", 120, 70, u, 0.8, -3, 20, "#bfe0ff");
  });
  // 17 — so you fit a smoke alarm on the ceiling from day one
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(160, 150, k), lerp(110, 90, k), lerp(1.6, 2.4, k)]; }, function (u, d, t) {
    var s = flat(t, { alarm: clamp((u - 0.4) / 1.2) }) + sleeper(SLEEP, t, "happy") + (u < 1.4 ? arrow(140, 140, 140, 70, "#f2c230", 5, clamp(u / 0.5)) : "");
    return s + tag("كاشف دخان", 200, 120, u, 1.0, 3, 17);
  });
  // 18 — the smell of smoke doesn't wake a sleeper, the alarm's sound does
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(120, 130, k), lerp(170, 180, k), lerp(1.6, 1.7, k)]; }, function (u, d, t) {
    var bp = u > 1.8, s = flat(t, { fire: 1, smokeH: 120, smokeB: 30, alarm: 1, beep: bp, doorB: { seep: true } }) + sleeper(SLEEP, t, bp ? "shock" : "happy");
    s += cross(60, 70, 14, (u - 0.8) / 0.4) + (bp ? check(200, 80, 14, (u - 2.2) / 0.4) : "");
    return s + tag("الريحة", 60, 120, u, 0.4, -3, 15, "#f2a0a0") + tag("الصوت", 210, 130, u, 2.0, 3, 15, "#bfe0ff");
  });
  // 19 — many think there's time to grab the phone, the money and the gold
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(150, 170, k), 180, lerp(1.5, 1.6, k)]; }, function (u, d, t) {
    var s = flat(t, { fire: 1, smokeH: 120, smokeB: 30, alarm: 1, beep: true }) + human(150, FLR, t, "curious", { s: 0.62, col: "#c23a26" });
    s += item("phone", 100, 110, clamp((u - 0.3) / 0.4), t) + item("cash", 160, 90, clamp((u - 1.1) / 0.4), t) + item("gold", 220, 110, clamp((u - 1.9) / 0.4), t);
    return s + qmark(160, 50, t, 30);
  });
  // 20 — the truth: you may have just two minutes before smoke fills the flat
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(320, 330, k), 180, lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var k = clamp(u / d), s = flat(t, { fire: 1, smokeH: lerp(80, 220, k), smokeB: lerp(40, 220, k), alarm: 1, beep: true });
    return s + clock(320, 140, 50, lerp(120, 90, k), t) + tag("دقيقتين بس!", 320, 240, u, 0.8, 3, 22, "#f2a0a0");
  });
  // 21 — once you're out, don't even think about going back in
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(300, 290, k), 200, lerp(1.2, 1.4, k)]; }, function (u, d, t) {
    var s = outside(t, { burning: true }) + human(390, 320, t, "worry", { s: 0.62, col: "#c23a26", dir: -1 }) + arrow(370, 270, 310, 270, "#e23b2f", 5, clamp(u / 0.6)) + cross(330, 250, 22, (u - 0.8) / 0.4);
    return s + tag("متدخلش تاني", 430, 80, u, 1.0, 3, 19, "#f2a0a0");
  });
  // 22 — add an extinguisher in the kitchen, a meeting point outside, and a plan agreed with your family
  shot(22, function (u, d) { var k = ease(clamp((u - 2) / 1)); return [lerp(300, 520, k), lerp(220, 220, k), lerp(1.6, 1.3, k)]; }, function (u, d, t) {
    var s = u < 2 ? flat(t, { ext: clamp((u - 0.3) / 0.6), alarm: 1 }) : outside(t, { sign: 520 });
    if (u >= 2) for (var i = 0; i < 4; i++) s += human(450 + i * 34, 320, t + i, "happy", { s: [0.6, 0.55, 0.42, 0.38][i], col: ["#c23a26", "#2f6fae", "#e2b035", "#3cae6a"][i], hair: ["#3a2a1e", "#1c1c1c", "#6a4a2a", "#3a2a1e"][i], dir: -1 });
    return s + (u < 2 ? tag("طفاية", 380, 200, u, 0.6, 3, 20) : tag("نقطة تجمع", 380, 120, u, 2.4, -3, 18) + tag("خطة مع أهلك", 560, 380, u, 3.2, 3, 17, "#bfe0ff"));
  });
  // 23 — congratulations: you've made an escape plan that can save your whole family
  shot(23, function (u, d) { var k = ease(clamp(u / (d * 0.7))); return [lerp(150, 340, k), lerp(200, 190, k), lerp(1.6, 0.95, k)]; }, function (u, d, t) {
    var s = flat(t, { alarm: 1, ext: 1, doorB: { towel: true }, doorF: {} }) + phone(110, 150, t, 1, "180") + check(90, 70, 16, (u - 1) / 0.4);
    return s + tag("خطة هروب!", 330, 120, u, 1.4, -3, 24) + tag("كاشف", 360, 90, u, 2.0, 3, 14, "#bfe0ff");
  });
  // 24 — outro
  shot(24, function (u, d) { return [lerp(320, 360, clamp(u / d)), 190, 1.0]; }, function (u, d, t) {
    var s = outside(t, { sign: 520, sky: "dawn" });
    for (var i = 0; i < 4; i++) s += human(450 + i * 34, 320, t + i, "happy", { s: [0.6, 0.55, 0.42, 0.38][i], col: ["#c23a26", "#2f6fae", "#e2b035", "#3cae6a"][i], hair: ["#3a2a1e", "#1c1c1c", "#6a4a2a", "#3a2a1e"][i], dir: -1 });
    return s + tag("قولولنا!", 470, 80, u, 0.4, 3, 26);
  });

  window.__parts = { flat: flat, outside: outside, fire: fire, flame: flame, smoke: smoke, door: door, person: human, crawler: crawler, alarm: alarm, extinguisher: extinguisher, phone: phone, tag: tag, hardHat: hardHat, sleeper: sleeper, bed: bed };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
