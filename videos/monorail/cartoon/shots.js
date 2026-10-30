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

  // ── the monorail (straddle type, Innovia 300 family as in Cairo): a concrete guideway beam on piers, cars that sit on
  // the beam with skirts wrapping its sides; inside: rubber load tyres on top, guide tyres on the sides, stabilising tyres
  // lower down, power rails along the beam's side. Shapes from published drawings of straddle monorails (../refs/SOURCES.md).
  var CONCB = "#b9b4aa", CONCD = "#8f8a80", BODY = "#f4f4f0", STRIPE = "#1f5fa8", STRIPE2 = "#e8742e";
  function pier(x, y, h) { return '<path d="M' + (x - 9) + ' ' + (y + 26) + ' L' + (x - 12) + ' ' + (y + h) + ' H' + (x + 12) + ' L' + (x + 9) + ' ' + (y + 26) + ' Z" fill="url(#gConc)" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (x - 22) + ' ' + (y + 26) + ' H' + (x + 22) + ' L' + (x + 14) + ' ' + (y + 38) + ' H' + (x - 14) + ' Z" fill="' + CONCB + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function beam(x0, x1, y, groundY, gap) {
    var s = ""; gap = gap || 150;
    for (var x = x0 + 40; x < x1; x += gap) s += pier(x, y, groundY - y);
    return s + '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="26" fill="' + CONCB + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + x0 + ' ' + (y + 20) + ' H' + x1 + '" stroke="#6f6a62" stroke-width="2"/><path d="M' + x0 + ' ' + (y + 6) + ' H' + x1 + '" stroke="#fff" stroke-width="1.4" opacity=".4"/>';
  }
  // side view of a train of `n` cars sitting on a beam whose top is at y; front (nose) at the right
  function train(x, y, t, o) {
    o = o || {}; var n = o.n || 3, cl = 150, s = '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 7) * 0.6) + ') scale(' + (o.s || 1) + ')">';
    for (var c = 0; c < n; c++) {
      var x0 = -c * (cl + 6), nose = c === 0, tail = c === n - 1;
      var d = 'M' + (x0 - cl) + ' 16 V-48 Q' + (x0 - cl) + ' -60 ' + (x0 - cl + 12) + ' -60 H' + (x0 - (nose ? 40 : 0)) + (nose ? ' Q' + (x0 + 12) + ' -58 ' + (x0 + 16) + ' -20 L' + (x0 + 14) + ' 16 Z' : ' V16 Z');
      if (tail && !nose) d = 'M' + (x0 - cl + 30) + ' 16 L' + (x0 - cl - 12) + ' -20 Q' + (x0 - cl - 6) + ' -58 ' + (x0 - cl + 30) + ' -60 H' + x0 + ' V16 Z';
      s += '<path d="' + d + '" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2.2"/>';
      s += '<path d="M' + (x0 - cl + (tail && !nose ? 0 : 2)) + ' 2 H' + (x0 + (nose ? 14 : 0)) + '" stroke="' + STRIPE + '" stroke-width="6"/><path d="M' + (x0 - cl + (tail && !nose ? -4 : 2)) + ' -6 H' + (x0 + (nose ? 15 : 0)) + '" stroke="' + STRIPE2 + '" stroke-width="2.4"/>';
      for (var w = 0; w < 5; w++) { var wx = x0 - cl + 18 + w * 26; if (nose && wx > x0 - 44) continue; s += '<rect x="' + wx + '" y="-48" width="18" height="22" rx="3" fill="#2b4a6a" stroke="' + INK + '" stroke-width="1"/>' + (o.people ? '<circle cx="' + (wx + 9) + '" cy="' + f(-32 + Math.sin(t * 3 + w + c) * 1) + '" r="5" fill="#c68b5f" opacity=".8"/>' : ""); }
      s += '<rect x="' + (x0 - cl / 2 - 10) + '" y="-48" width="20" height="44" rx="2" fill="#dfe3e8" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (x0 - cl / 2) + ' -48 V-4" stroke="' + INK + '" stroke-width="1"/>';
      if (nose) s += '<path d="M' + (x0 - 38) + ' -54 Q' + (x0 + 6) + ' -54 ' + (x0 + 11) + ' -26 H' + (x0 - 38) + ' Z" fill="#1f3550" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + (x0 + 10) + '" cy="-4" r="3" fill="#fff6c8"/><circle cx="' + (x0 + 10) + '" cy="-4" r="8" fill="#fff6c8" opacity=".3"/>';
      if (c < n - 1) s += '<rect x="' + (x0 - cl - 7) + '" y="-44" width="8" height="40" fill="#6f7680"/>';
    }
    return s + '</g>';
  }
  // front cross-section of the car on the beam. o: {hl: "load"|"guide"|"stab"|"power"|"all", tilt, wind, cut, s, spin}
  function section(x, y, t, o) {
    o = o || {}; var hl = o.hl || "", sp = t * 6, s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(o.tilt || 0) + ') scale(' + (o.s || 1) + ')">';
    var glow = function (k) { return hl === k || hl === "all"; };
    // the car body: a shell over the beam, skirts down both sides
    s += '<path d="M-110 30 V-150 Q-110 -186 -70 -190 H70 Q110 -186 110 -150 V30 H62 V-20 H-62 V30 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="-92" y="-160" width="184" height="60" rx="8" fill="#2b4a6a" stroke="' + INK + '" stroke-width="2"/><path d="M-110 -60 H110" stroke="' + STRIPE + '" stroke-width="10"/><path d="M-110 -48 H110" stroke="' + STRIPE2 + '" stroke-width="3"/>';
    for (var p = 0; p < 3; p++) s += '<circle cx="' + (-50 + p * 50) + '" cy="' + f(-128 + Math.sin(t * 2 + p) * 2) + '" r="13" fill="#c68b5f"/><path d="M' + (-62 + p * 50) + ' -100 Q' + (-50 + p * 50) + ' -116 ' + (-38 + p * 50) + ' -100" fill="#3f6f8f"/>';
    // the beam
    s += '<rect x="-36" y="-36" width="72" height="190" fill="' + CONCB + '" stroke="' + INK + '" stroke-width="3"/><path d="M-36 -36 H36" stroke="#fff" stroke-width="2" opacity=".5"/>';
    // power rails on the beam's sides and the collector shoes
    var pw = glow("power");
    s += '<rect x="-44" y="70" width="8" height="18" fill="' + (pw ? "#f2c230" : "#6f7680") + '" stroke="' + INK + '" stroke-width="1.4"/><rect x="36" y="70" width="8" height="18" fill="' + (pw ? "#f2c230" : "#6f7680") + '" stroke="' + INK + '" stroke-width="1.4"/>';
    if (pw) for (var e = 0; e < 4; e++) { var ph = (t * 2 + e / 4) % 1; s += '<circle cx="' + f(lerp(-48, -60, ph)) + '" cy="' + f(lerp(80, -20, ph)) + '" r="3" fill="#ffe27a"/><circle cx="' + f(lerp(48, 60, ph)) + '" cy="' + f(lerp(80, -20, ph)) + '" r="3" fill="#ffe27a"/>'; }
    // the skirts below reach past the beam's top: draw them over the beam
    s += '<path d="M-110 30 V-20 H-62 V30 Z M110 30 V-20 H62 V30 Z" fill="' + BODY + '" stroke="' + INK + '" stroke-width="3"/>';
    if (o.cut) s += '<path d="M-62 -20 V30 H-44 V-20 Z M62 -20 V30 H44 V-20 Z" fill="#e8e4da" opacity=".95"/>';
    // tyres: load tyres on top of the beam, guide tyres on the upper sides, stabilising tyres lower down
    var tyre = function (cx, cy, rx, ry, on) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#1c1c1c" stroke="' + (on ? "#f2c230" : "#444") + '" stroke-width="' + (on ? 4 : 2) + '"/><path d="M' + f(cx - rx * 0.7 * Math.cos(sp)) + ' ' + f(cy - ry * 0.7 * Math.sin(sp)) + ' L' + f(cx + rx * 0.7 * Math.cos(sp)) + ' ' + f(cy + ry * 0.7 * Math.sin(sp)) + '" stroke="#666" stroke-width="2"/>' + (on ? '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx + 8) + '" ry="' + (ry + 8) + '" fill="none" stroke="#f2c230" stroke-width="2" opacity="' + f(0.4 + 0.4 * Math.sin(t * 6)) + '"/>' : ""); };
    s += tyre(-18, -50, 16, 14, glow("load")) + tyre(18, -50, 16, 14, glow("load"));
    s += tyre(-50, -2, 12, 16, glow("guide")) + tyre(50, -2, 12, 16, glow("guide"));
    s += tyre(-50, 22, 9, 10, glow("stab")) + tyre(50, 22, 9, 10, glow("stab"));
    if (glow("load")) s += arrow(0, -96, 0, -66, "#e2523a", 5, 1);
    if (glow("guide")) s += arrow(-90, -2, -64, -2, "#f2c230", 4, 1) + arrow(90, -2, 64, -2, "#f2c230", 4, 1);
    if (o.wind) for (var k = 0; k < 5; k++) { var u = (t * 1.2 + k / 5) % 1; s += '<path d="M' + f(-260 + u * 120) + ' ' + (-150 + k * 34) + ' h40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - u) + '"/>'; }
    return s + '</g>';
  }
  // a normal train seen from the front: two steel rails, steel wheels with flanges
  function railSection(x, y, t) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><rect x="-120" y="20" width="240" height="18" fill="#6a5a48" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-110 10 V-150 Q-110 -186 -70 -190 H70 Q110 -186 110 -150 V10 Z" fill="#d9d4c8" stroke="' + INK + '" stroke-width="3"/><rect x="-92" y="-160" width="184" height="60" rx="8" fill="#2b4a6a"/>';
    [-70, 70].forEach(function (rx) { s += '<rect x="' + (rx - 8) + '" y="4" width="16" height="16" fill="url(#steel)" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + rx + '" cy="-12" r="18" fill="url(#steel)" stroke="' + INK + '" stroke-width="2"/><path d="M' + (rx + (rx < 0 ? 10 : -10)) + ' -2 v10" stroke="' + INK + '" stroke-width="5"/>'; });
    return s + '</g>';
  }
  function street(t, y) { return '<rect x="-400" y="' + y + '" width="1440" height="300" fill="url(#gAsphalt)"/><path d="M-400 ' + (y + 30) + ' H1040" stroke="#f4f1e8" stroke-width="2" stroke-dasharray="18 14" stroke-dashoffset="' + f(-t * 80) + '"/>' + cars(t, y + 20, 70) + '<rect x="-400" y="' + (y - 6) + '" width="1440" height="8" fill="#c9b98a"/>'; }
  function horse(x, y, t) {   // a small cartoon horse with a ball-head rider straddling its back
    var b = Math.sin(t * 5) * 3, s = '<g transform="translate(' + x + ' ' + f(y + b) + ')"><ellipse cx="0" cy="0" rx="46" ry="22" fill="#a8743a" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M36 -8 L58 -40 L70 -34 L52 -2 Z" fill="#a8743a" stroke="' + INK + '" stroke-width="2.4"/><circle cx="64" cy="-34" r="3" fill="' + INK + '"/>';
    [-30, -14, 16, 32].forEach(function (lx, i) { s += '<path d="M' + lx + ' 16 l' + f(Math.sin(t * 8 + i) * 6) + ' 34" stroke="#7a5428" stroke-width="7" stroke-linecap="round"/>'; });
    s += '<path d="M-14 -14 L-22 22 M14 -14 L22 22" stroke="#3f6f8f" stroke-width="9" stroke-linecap="round"/><path d="M-14 -50 H14 V-14 H-14 Z" fill="#3f6f8f" stroke="' + INK + '" stroke-width="2"/>' + head(0, -66, 16, "happy", t);
    return s + '</g>';
  }
  function elephant(x, y, t, s, mood) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')"><ellipse cx="0" cy="0" rx="40" ry="30" fill="#9aa0a8" stroke="' + INK + '" stroke-width="2.4"/>';
    g += '<ellipse cx="-30" cy="-6" rx="16" ry="22" fill="#b0b6be" stroke="' + INK + '" stroke-width="2"/><path d="M34 6 Q52 20 46 ' + f(40 + Math.sin(t * 4) * 6) + '" stroke="#9aa0a8" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M34 6 Q52 20 46 ' + f(40 + Math.sin(t * 4) * 6) + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    g += mood === "shock" ? '<circle cx="16" cy="-8" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="16" cy="-8" r="2" fill="' + INK + '"/>' : '<circle cx="16" cy="-8" r="3" fill="' + INK + '"/>';
    return g + '</g>';
  }
  // a top view of a beam switch: the moving segment swings between the straight and the branch beam
  function switchTop(x, y, k) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><rect x="-300" y="-10" width="200" height="20" fill="' + CONCB + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="100" y="-10" width="220" height="20" fill="' + CONCB + '" stroke="' + INK + '" stroke-width="2"/><path d="M100 0 Q200 0 320 -110" stroke="' + INK + '" stroke-width="22" fill="none"/><path d="M100 0 Q200 0 320 -110" stroke="' + CONCB + '" stroke-width="18" fill="none"/>';
    var a = -k * 22;
    s += '<g transform="rotate(' + f(a) + ' -100 0)"><rect x="-100" y="-10" width="200" height="20" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/></g>';
    return s + '<circle cx="-100" cy="0" r="6" fill="' + INK + '"/></g>';
  }
  function trainTop(x, y, ang, t) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"><rect x="-150" y="-16" width="140" height="32" rx="10" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2"/><rect x="0" y="-16" width="130" height="32" rx="14" fill="' + BODY + '" stroke="' + INK + '" stroke-width="2"/><path d="M-150 0 H130" stroke="' + STRIPE + '" stroke-width="4"/></g>'; }
  function river(t, y) { return '<rect x="-400" y="' + y + '" width="1440" height="300" fill="url(#sea1)"/>' + waves(t, y); }
  function wupperFrame(x, y, h) { return '<path d="M' + (x - 50) + ' ' + (y + h) + ' L' + x + ' ' + y + ' L' + (x + 50) + ' ' + (y + h) + '" stroke="#2f6f4f" stroke-width="8" fill="none"/><path d="M' + (x - 34) + ' ' + (y + h * 0.6) + ' L' + (x + 34) + ' ' + (y + h * 0.6) + '" stroke="#2f6f4f" stroke-width="4"/>'; }
  function hangTrain(x, y, t, o) {   // Wuppertal: the car hangs under the rail from a bogie arm
    o = o || {}; var sw = Math.sin(t * 1.4) * 3, s = '<g transform="translate(' + f(x) + ' ' + y + ')">';
    s += '<g transform="rotate(' + f(sw) + ')"><path d="M-6 0 V40" stroke="' + INK + '" stroke-width="6"/><rect x="-120" y="40" width="240" height="70" rx="20" fill="#2f6fae" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var w = 0; w < 7; w++) s += '<rect x="' + (-108 + w * 32) + '" y="54" width="24" height="24" rx="3" fill="#d9eef7" stroke="' + INK + '"/>';
    if (o.elephant) s += elephant(-30, 70, t, 0.5, o.mood);
    return s + '</g></g>';
  }
  function station(x, y, t, open) { var s = '<rect x="' + (x - 220) + '" y="' + (y - 80) + '" width="440" height="80" fill="#e8e4da" stroke="' + INK + '" stroke-width="2"/><path d="M' + (x - 240) + ' ' + (y - 80) + ' H' + (x + 240) + ' L' + (x + 220) + ' ' + (y - 100) + ' H' + (x - 220) + ' Z" fill="' + STRIPE + '" stroke="' + INK + '" stroke-width="2"/>'; for (var p = 0; p < 5; p++) s += '<circle cx="' + (x - 160 + p * 80) + '" cy="' + f(y - 46 + Math.sin(t * 3 + p) * 2) + '" r="9" fill="#c68b5f"/><path d="M' + (x - 170 + p * 80) + ' ' + (y - 20) + ' Q' + (x - 160 + p * 80) + ' ' + (y - 40) + ' ' + (x - 150 + p * 80) + ' ' + (y - 20) + '" fill="' + BOX[p % BOX.length] + '"/>'; return s; }
  var BOX = ["#b8432e", "#2f6f9f", "#3f7a52", "#e8742e", "#5a3f8a"];
  function bg(t) { return sky("day") + clouds(t, 14, 20, 4, 0.8) + city(t, 250, 110, "#b9a98a", true, 3, false); }

  // 0 — New Cairo: a train running over the road on a single concrete beam
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(200, 185, k), lerp(1.15, 0.95, k)]; }, function (u, d, t) {
    var s = bg(t) + street(t, 290) + beam(-400, 1040, 150, 290) + train(((t * 60 + 360) % 1200) - 100, 150, t, { n: 3, s: 0.8 });
    return s + tag("قضيب واحد بس!", 330, 60, u, 2.4, -3, 21);
  });
  // 1 — a whole train on a beam less than a metre wide
  shot(1, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 20, 4, 0.8) + section(320, 170, t, { s: 0.75 });
    s += arrow(280, 330, 360, 330, "#f2c230", 3, clamp(u)) + arrow(360, 330, 280, 330, "#f2c230", 3, clamp(u));
    return s + tag("أقل من متر!", 320, 345, u, 1.2, -2, 18) + qmark(470, 120, t, 44) + qmark(170, 130, t, 34);
  });
  // 2 — why doesn't it fall, even on a curve?
  shot(2, function (u, d) { return [320, 190, lerp(1.05, 1.15, u / d)]; }, function (u, d, t) {
    var s = sky("day") + city(t, 260, 90, "#c9b98a", true, 7, false) + '<rect x="-400" y="260" width="1440" height="200" fill="#c9b98a"/>';
    s += '<path d="M-200 250 Q320 40 840 250" stroke="' + INK + '" stroke-width="30" fill="none"/><path d="M-200 250 Q320 40 840 250" stroke="' + CONCB + '" stroke-width="26" fill="none"/>';
    var k = 0.25 + ((t * 0.08) % 0.6), q = 1 - k, px = q * q * -200 + 2 * q * k * 320 + k * k * 840, py = q * q * 250 + 2 * q * k * 40 + k * k * 250;
    var ang = Math.atan2(2 * q * (40 - 250) + 2 * k * (250 - 40), 2 * q * 520 + 2 * k * 520) * 57.3;
    s += '<g transform="translate(' + f(px) + ' ' + f(py - 4) + ') rotate(' + f(ang) + ')">' + train(40, 0, t, { n: 2, s: 0.5 }) + '</g>';
    return s + tag("مبيقعش ليه؟", 320, 330, u, 1.0, -2, 22, "#f2a0a0") + qmark(320, 60, t, 40);
  });
  // 3 — brand
  shot(3, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("dusk") + city(t, 260, 120, "#7a6a5a", true, 9, false) + street(t, 290) + beam(-400, 1040, 160, 290) + train(((t * 50) % 1200) - 100, 160, t, { n: 3, s: 0.75 });
    return s + tag("إيه الحكاية؟", 320, 80, u, 0.1, -2, 34, "#f2c230");
  });
  // 4 — it's called a monorail
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(380, 260, k), 180, 1.1]; }, function (u, d, t) {
    var s = bg(t) + street(t, 290) + beam(-400, 1040, 170, 290) + train(330 + Math.sin(t * 0.5) * 10, 170, t, { n: 2, people: true });
    return s + tag("المونوريل", 200, 60, u, 0.5, -3, 26) + tag("مونو = واحد", 470, 70, u, 1.6, 3, 19, "#bfe0ff");
  });
  // 5 — a normal train: two steel rails, steel wheels
  shot(5, function (u, d) { return [320, 200, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/><rect x="-400" y="220" width="1440" height="300" fill="#9a8a70"/>' + railSection(320, 210, t);
    return s + tag("قضيبين حديد", 170, 290, u, 0.8, -3, 18) + tag("عجل حديد", 480, 290, u, 1.8, 3, 18, "#bfe0ff");
  });
  // 6 — the monorail sits on the beam like a rider on a horse
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), 190, 1.0]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(440, 170, t, { s: 0.62 }) + horse(170, 230, t);
    return s + tag("زي ركوب الحصان", 300, 50, u, 0.9, -3, 22);
  });
  // 7 — the body comes down both sides and wraps the beam
  shot(7, function (u, d) { return [320, 160, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(320, 180, t, { s: 0.8 });
    s += '<path d="M226 195 V230 M414 195 V230" stroke="#e2523a" stroke-width="5" stroke-dasharray="6 4" opacity="' + f(0.6 + 0.4 * Math.sin(t * 5)) + '"/>';
    return s + tag("حاضن الكمرة", 150, 250, u, 0.9, -3, 22);
  });
  // 8 — rubber load tyres on top carry the whole car
  shot(8, function (u, d) { return [320, lerp(150, 160, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(320, 190, t, { s: 0.8, hl: "load", cut: true }) + tag("عجل كاوتش شايل الوزن", 160, 250, u, 0.8, -3, 18); });
  // 9 — guide tyres on both sides hold the beam
  shot(9, function (u, d) { return [320, lerp(160, 170, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(320, 190, t, { s: 0.8, hl: "guide", cut: true }) + tag("ماسك يمين وشمال", 150, 260, u, 0.8, -3, 20); });
  // 10 — they stop it leaning, even in a strong wind
  shot(10, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 80, 30, 5, 0.8) + section(340, 170, t, { s: 0.7, hl: "guide", wind: true, tilt: Math.sin(t * 3) * 0.6 });
    return s + tag("ريح جامدة", 150, 60, u, 0.6, -3, 20, "#bfe0ff") + tag("ولا بيميل", 470, 60, u, 1.8, 3, 20);
  });
  // 11 — stabilising tyres lower down keep it from tipping over
  shot(11, function (u, d) { return [320, lerp(170, 180, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { var tl = Math.max(0, Math.sin(t * 2.4)) * 3; return '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(320, 190, t, { s: 0.8, hl: "stab", cut: true, tilt: tl }) + tag("عجل تالت تحت", 150, 270, u, 0.8, -3, 20); });
  // 12 — power comes from metal rails along the side of the beam
  shot(12, function (u, d) { return [320, lerp(180, 190, u / d), lerp(1.05, 1.15, u / d)]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#2a3442"/>' + section(320, 180, t, { s: 0.8, hl: "power", cut: true }) + tag("قضبان كهربا", 160, 280, u, 0.8, -3, 20); });
  // 13 — rubber is much quieter than steel wheels
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(220, 420, k), 190, 1.05]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + railSection(170, 210, t) + section(470, 190, t, { s: 0.62 });
    for (var r = 0; r < 4; r++) { var ph = (t * 1.5 + r / 4) % 1; s += '<path d="M' + f(170 - 60 - ph * 90) + ' ' + f(150 - ph * 50) + ' q' + f(-20 - ph * 30) + ' ' + f(40 + ph * 30) + ' 0 ' + f(80 + ph * 60) + '" stroke="#e2523a" stroke-width="4" fill="none" opacity="' + f(1 - ph) + '"/>'; }
    s += '<path d="M' + f(470 - 90) + ' 150 q-12 20 0 40" stroke="#5bbf6a" stroke-width="3" fill="none" opacity="' + f(0.5 + 0.3 * Math.sin(t * 4)) + '"/>';
    return s + tag("طراخ!", 170, 50, u, 0.5, -4, 22, "#f2a0a0") + tag("هادي", 470, 50, u, 1.6, 3, 22, "#bfe0ff");
  });
  // 14 — rubber grips the concrete: it climbs steeper slopes
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(260, 380, k), lerp(220, 170, k), 0.95]; }, function (u, d, t) {
    var s = bg(t) + '<rect x="-400" y="300" width="1440" height="200" fill="#c9b98a"/>';
    s += '<g transform="rotate(-9 320 250)">' + beam(-200, 900, 200, 330, 160) + train(((t * 40) % 800), 200, t, { n: 2, s: 0.7 }) + '</g>';
    return s + tag("طلعة أشد", 330, 70, u, 1.0, -3, 22);
  });
  // 15 — how does it change line on a single beam?
  shot(15, function (u, d) { return [320, 180, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#9ab07a"/>' + switchTop(320, 220, 0) + trainTop(lerp(-150, 60, clamp(u / d)), 220, 0, t);
    return s + qmark(500, 100, t, 48) + tag("يغيّر خط إزاي؟", 250, 80, u, 0.6, -3, 20);
  });
  // 16 — a whole piece of the beam moves sideways and joins the other beam
  shot(16, function (u, d) { return [320, 180, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.5) / 1.6), s = '<rect x="-400" y="-300" width="1440" height="960" fill="#9ab07a"/>' + switchTop(320, 220, ease(k));
    if (k >= 1) { var m = clamp((u - 2.2) / (d - 2.4)), a = -22 * m; s += trainTop(lerp(80, 400, m), 220 + Math.sin(a / 57.3) * lerp(0, 120, m), a, t); }
    else s += trainTop(60, 220, 0, t);
    return s + tag("الكمرة بتتحرك!", 320, 80, u, 0.8, -3, 22);
  });
  // 17 — no driver: a computer drives it and stops it at the stations
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(380, 300, k), 190, 1.0]; }, function (u, d, t) {
    var k = clamp(u / (d * 0.5)), s = bg(t) + beam(-400, 1040, 200, 340) + station(330, 200, t);
    s += train(lerp(900, 420, ease(k)), 200, t, { n: 2, s: 0.7 });
    s += monitor(140, 90, 100, 60, '<path d="M-40 10 L-20 -5 L0 5 L20 -15 L40 -5" stroke="#5bbf6a" stroke-width="3" fill="none"/><circle cx="' + f(-40 + ((t * 30) % 80)) + '" cy="15" r="4" fill="#f2c230"/>');
    return s + tag("من غير سواق", 470, 60, u, 1.0, 3, 20);
  });
  // 18 — up on piers: no streets dug up, little land taken
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 200, lerp(1.0, 0.92, k)]; }, function (u, d, t) {
    var s = bg(t) + street(t, 280) + '<rect x="-400" y="276" width="1440" height="4" fill="#5a8a3a"/>' + beam(-400, 1040, 140, 280) + train(((t * 70) % 1300) - 200, 140, t, { n: 3, s: 0.75 });
    return s + tag("فوق الشارع", 200, 50, u, 0.7, -3, 20) + tag("ولا أرض ولا تكسير", 460, 70, u, 1.8, 3, 18, "#bfe0ff");
  });
  // 19 — the Cairo lines: New Capital ⇄ Nasr City, and a line to 6th of October
  shot(19, function (u, d) { var k = clamp(u / d); return [lerp(440, 220, k), lerp(210, 175, k), lerp(1.2, 0.92, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#efe6cf"/>';
    for (var b = 0; b < 70; b++) { var bx = -300 + hash(b) * 1200, by = -200 + hash(b + 7) * 700; s += '<rect x="' + f(bx) + '" y="' + f(by) + '" width="' + f(20 + hash(b + 3) * 40) + '" height="' + f(14 + hash(b + 5) * 30) + '" fill="' + (b % 3 ? "#e2d6b8" : "#cfe0b8") + '" stroke="#d4c6a4"/>'; }
    for (var r = 0; r < 14; r++) s += '<path d="M' + f(-300 + hash(r + 20) * 1200) + ' -200 L' + f(-300 + hash(r + 30) * 1200) + ' 500" stroke="#fff" stroke-width="5" opacity=".8"/>';
    s += '<path d="M300 -100 C280 60 320 200 300 460" stroke="#4fb3d9" stroke-width="16" fill="none"/>';
    var east = [[330, 170], [400, 180], [470, 196], [560, 210]], west = [[290, 172], [210, 190], [120, 205]];
    var draw = function (pts, col, k) { var d2 = "M" + pts[0][0] + " " + pts[0][1]; for (var i = 1; i < pts.length; i++) d2 += " L" + pts[i][0] + " " + pts[i][1]; return '<path d="' + d2 + '" stroke="' + col + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="' + f(1000 * (1 - k)) + '"/>'; };
    s += draw(east, "#e2523a", clamp(u / 1.5)) + draw(west, "#1f5fa8", clamp((u - 1.6) / 1.5));
    s += '<circle cx="560" cy="210" r="10" fill="#e2523a" stroke="' + INK + '" stroke-width="2"/><circle cx="330" cy="170" r="8" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="120" cy="205" r="10" fill="#1f5fa8" stroke="' + INK + '" stroke-width="2"/>';
    for (var m = 0; m < 3; m++) { var q1 = (t * 0.25 + m / 3) % 1, q2 = (t * 0.22 + m / 3) % 1; s += '<rect x="' + f(lerp(330, 560, q1) - 9) + '" y="' + f(lerp(170, 210, q1) - 5) + '" width="18" height="10" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><rect x="' + f(lerp(290, 120, q2) - 9) + '" y="' + f(lerp(172, 205, q2) - 5) + '" width="18" height="10" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>'; }
    for (var w = 0; w < 10; w++) { var wy = ((t * 40 + w * 60) % 560) - 100; s += '<path d="M' + f(296 + Math.sin(wy * 0.02) * 4) + ' ' + f(wy) + ' v18" stroke="#fff" stroke-width="2.4" opacity=".6"/>'; }
    return s + tag("العاصمة الإدارية", 540, 260, u, 0.9, 3, 16) + tag("مدينة نصر", 360, 120, u, 1.3, -2, 16, "#fff") + tag("أكتوبر", 120, 260, u, 2.4, -3, 18, "#bfe0ff");
  });
  // 20 — about 100 km together, one of the longest in the world
  shot(20, function (u, d) { return [320, 180, lerp(1.0, 1.12, u / d)]; }, function (u, d, t) {
    var n = Math.min(100, Math.floor(u * 40)), s = bg(t) + beam(-400, 1040, 220, 340) + train(((t * 60) % 1200) - 100, 220, t, { n: 3, s: 0.7 });
    s += '<text x="320" y="140" text-anchor="middle" style="font:800 64px Noto Sans Arabic;fill:#fff;stroke:#1c1c1c;stroke-width:6;paint-order:stroke">حوالي ' + n + ' كم</text>';
    return s + tag("من أطول الخطوط في العالم", 320, 50, u, 2.6, -2, 18);
  });
  // 21 — the oldest monorail still running: Germany, 1901
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(240, 400, k), 180, 1.0]; }, function (u, d, t) {
    var s = sky("day") + clouds(t, 14, 20, 4, 0.8) + city(t, 250, 80, "#a89880", true, 11, false) + river(t, 260);
    for (var x = -300; x < 1040; x += 220) s += wupperFrame(x, 60, 200);
    s += '<rect x="-400" y="56" width="1440" height="10" fill="#2f6f4f" stroke="' + INK + '" stroke-width="1.6"/>' + hangTrain(((t * 50) % 1300) - 200, 66, t);
    return s + tag("ألمانيا", 180, 330, u, 0.6, -3, 22) + tag("1901", 460, 330, u, 1.6, 3, 24, "#bfe0ff");
  });
  // 22 — it hangs under the beam instead of sitting on it
  shot(22, function (u, d) { return [320, 160, lerp(1.2, 1.35, u / d)]; }, function (u, d, t) {
    var s = sky("day") + river(t, 270) + wupperFrame(120, 60, 220) + wupperFrame(560, 60, 220) + '<rect x="-400" y="56" width="1440" height="10" fill="#2f6f4f" stroke="' + INK + '" stroke-width="1.6"/>';
    s += hangTrain(330 + Math.sin(t * 0.6) * 20, 66, t) + arrow(470, 170, 410, 110, "#f2c230", 4, clamp(u / 1.2));
    return s + tag("متعلق تحت", 500, 200, u, 1.0, 3, 20);
  });
  // 23 — 1950: a young elephant called Tuffi rides it
  shot(23, function (u, d) { return [320, 160, lerp(1.25, 1.4, u / d)]; }, function (u, d, t) {
    var s = sky("day") + river(t, 270) + '<rect x="-400" y="56" width="1440" height="10" fill="#2f6f4f" stroke="' + INK + '" stroke-width="1.6"/>' + hangTrain(320, 66, t, { elephant: true, mood: u > 2 ? "shock" : "n" });
    return s + tag("توفي!", 470, 230, u, 0.8, 4, 24) + tag("1950", 170, 230, u, 1.6, -3, 22, "#bfe0ff");
  });
  // 24 — she panicked, jumped out of the window into the river, and got away with scratches
  shot(24, function (u, d) { return [320, 190, lerp(1.0, 1.1, u / d)]; }, function (u, d, t) {
    var k = clamp((u - 0.4) / 1.0), s = sky("day") + river(t, 270) + '<rect x="-400" y="56" width="1440" height="10" fill="#2f6f4f" stroke="' + INK + '" stroke-width="1.6"/>' + hangTrain(320, 66, t);
    var ex = lerp(300, 380, k), ey = lerp(150, 290, k * k);
    s += elephant(ex, u < 2.2 ? ey : 285 + Math.sin(t * 3) * 3, t, 0.6, "shock");
    if (u > 1.4 && u < 2.4) for (var j = 0; j < 8; j++) { var a = -Math.PI * (0.1 + j * 0.1), r = (u - 1.4) * 80; s += '<circle cx="' + f(380 + Math.cos(a) * r) + '" cy="' + f(275 + Math.sin(a) * r * 0.7) + '" r="5" fill="#bfe6f7"/>'; }
    return s + tag("نطت في النهر!", 200, 120, u, 1.0, -3, 22, "#f2a0a0") + tag("خدوش بسيطة بس", 470, 340, u, 2.4, 3, 18, "#bfe0ff");
  });
  // 25 — payoff: it doesn't fall because it wraps the beam with tyres on every side
  shot(25, function (u, d) { return [320, 160, lerp(1.0, 1.08, u / d)]; }, function (u, d, t) { return '<rect x="-400" y="-300" width="1440" height="960" fill="#d9e4ea"/>' + section(320, 180, t, { s: 0.8, hl: "all", cut: true }) + tag("عجل من كل ناحية", 150, 260, u, 0.8, -3, 21); });
  // 26 — outro
  shot(26, function (u, d) { return [lerp(300, 360, clamp(u / d)), 180, 1.0]; }, function (u, d, t) {
    var s = sky("dusk") + city(t, 260, 120, "#7a6a5a", true, 9, false) + street(t, 290) + beam(-400, 1040, 160, 290) + train(((t * 50) % 1200) - 100, 160, t, { n: 3, s: 0.75 });
    return s + tag("قولولنا!", 470, 80, u, 0.4, 3, 26);
  });

  window.__parts = { train: train, beam: beam, section: section, street: street, bg: bg, tag: tag, hardHat: hardHat, elephant: elephant, hangTrain: hangTrain };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));   // a slow circle: the drift never comes to rest
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
