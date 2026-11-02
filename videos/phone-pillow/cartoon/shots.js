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
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1.5) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  function therm(x, y, v, label, col) { var h = 90, fill = h * clamp(v); return '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + R(-34, -h - 30, 68, h + 66, "#fbfbf7", 2.4, 10) + R(-6, -h - 16, 12, h + 10, "#fff", 1.6, 6) + '<rect x="-3" y="' + f(-6 - fill) + '" width="6" height="' + f(fill + 6) + '" fill="' + col + '"/><circle cy="0" r="11" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + (label ? T(label, 0, 30, 15, col) : "") + '</g>'; }
  function heatW(t, x, y, n, sp, col, h) { var s = ""; for (var i = 0; i < n; i++) { var q = (t * (sp || 0.8) + i / n) % 1, xx = x + (i - (n - 1) / 2) * 16; s += '<path d="M' + f(xx) + ' ' + f(y - q * (h || 50)) + ' q6 -7 0 -14 q-6 -7 0 -14" stroke="' + (col || "#ff7a2f") + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * q)) + '"/>'; } return s; }
  function flames(t, x, y, s, k) { if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * k) + ')">'; for (var i = 0; i < 5; i++) { var fx = (i - 2) * 14, h = 40 + 18 * Math.sin(t * 9 + i * 2) + (i === 2 ? 20 : 0); g += '<path d="M' + (fx - 12) + ' 0 Q' + (fx - 14) + ' ' + f(-h * 0.5) + ' ' + f(fx + Math.sin(t * 7 + i) * 4) + ' ' + f(-h) + ' Q' + (fx + 14) + ' ' + f(-h * 0.5) + ' ' + (fx + 12) + ' 0 Z" fill="' + (i % 2 ? "#ff8a2a" : "#ffb52a") + '" stroke="#c23a1a" stroke-width="1.6"/>'; } g += '<path d="M-8 0 Q-6 -18 0 -26 Q6 -18 8 0 Z" fill="#fff2a0"/>'; return g + '</g>'; }
  function smoke(t, x, y, k) { var s = ""; for (var i = 0; i < 6; i++) { var q = (t * 0.4 + i / 6) % 1; s += '<circle cx="' + f(x + Math.sin(q * 6 + i) * 14 + q * 20) + '' + '" cy="' + f(y - q * 120) + '" r="' + f(8 + q * 22) + '" fill="#5a5a5a" opacity="' + f(0.5 * (1 - q) * k) + '"/>'; } return s; }
  function spark(t, x, y, s, k) { if (k <= 0) return ""; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * (0.8 + 0.3 * Math.sin(t * 30))) + ')">'; for (var a = 0; a < 8; a++) g += '<path d="M0 0 L' + f(Math.cos(a * 0.785 + t * 4) * 22) + ' ' + f(Math.sin(a * 0.785 + t * 4) * 22) + '" stroke="#ffe23a" stroke-width="3" stroke-linecap="round"/>'; return g + '<circle r="7" fill="#fff" stroke="#ffb52a" stroke-width="3"/></g>'; }
  // ── the bedroom at night: a window with the moon, a bed with a pillow, a nightstand with a lamp ──
  var FY = 300;
  function room(t, o) {
    o = o || {}; var s = '<rect x="-400" y="-300" width="1440" height="700" fill="' + (o.day ? "#e9dcc4" : "#2e3554") + '"/>';
    for (var k = 0; k < 18; k++) s += '<path d="M' + (-380 + k * 80) + ' -300 V' + FY + '" stroke="' + (o.day ? "#ddcfb4" : "#283050") + '" stroke-width="10"/>';
    s += '<clipPath id="wnd"><rect x="470" y="30" width="120" height="110"/></clipPath><g clip-path="url(#wnd)">' + sky(o.day ? "day" : "night") + (o.day ? clouds(t, 10, 40, 3, 0.9) : stars(t) + moon(550, 70)) + '</g>' + R(470, 30, 120, 110, "none", 5) + '<path d="M530 30 V140 M470 85 H590" stroke="' + INK + '" stroke-width="4"/>';
    s += '<path d="M455 20 Q470 90 460 150 L478 150 L478 20 Z" fill="#8a3a4a" stroke="' + INK + '" stroke-width="2"/><path d="M605 20 Q590 90 600 150 L582 150 L582 20 Z" fill="#8a3a4a" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="-400" y="' + FY + '" width="1440" height="200" fill="' + (o.day ? "#a8784a" : "#4a3a30") + '"/><path d="M-400 ' + FY + ' H1040" stroke="' + INK + '" stroke-width="2"/>';
    if (o.bed !== false) s += bed(t, o);
    if (o.stand !== false) s += stand(t, o);
    return s + (o.day ? "" : '<rect x="-400" y="-300" width="1440" height="800" fill="#0b1730" opacity=".18"/>');
  }
  function bed(t, o) {   // bed from x 60 to 400; mattress top at 230; the pillow at the left end
    var s = R(50, 150, 18, 150, "#6a4a2a", 2.4, 4) + R(60, 230, 350, 40, "#f4f1e8", 2.4, 8) + R(60, 262, 350, 22, "#8a5c34", 2.4, 4) + R(398, 210, 14, 90, "#6a4a2a", 2.4, 4);
    s += '<path d="M150 232 Q280 214 410 232 V262 H150 Z" fill="#5a7ab0" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.sleeper) s += '<path d="M160 232 Q240 196 330 226" fill="#5a7ab0" stroke="' + INK + '" stroke-width="2.4"/>' + head(126, 206, 18, o.mood || "n", t) + (o.mood ? "" : T("z", 150 + ((t * 10) % 20), 180 - ((t * 12) % 30), 16, "#bfe0ff"));
    var hot = clamp(o.hot || 0); s += '<path d="M72 230 Q70 200 110 200 Q150 198 150 230 Z" fill="' + (hot > 0 ? "#f4e0d0" : "#fbfbf7") + '" stroke="' + INK + '" stroke-width="2.4"/>';
    if (o.phoneUnder) { s += '<path d="M150 250 C200 300 300 300 420 290 L470 290" stroke="#f4f1e8" stroke-width="3" fill="none"/>'; s += '<rect x="96" y="222" width="34" height="8" rx="2" fill="#1c1c1c"/>'; if (hot > 0) s += '<ellipse cx="112" cy="222" rx="' + f(30 + 10 * Math.sin(t * 6)) + '" ry="16" fill="#ff5a2a" opacity="' + f(0.35 * hot + 0.1 * Math.sin(t * 6)) + '" filter="url(#soft)"/>' + heatW(t, 112, 205, 3, 1.2, "#ff7a2f", 30 * hot); }
    if (o.fire) s += smoke(t, 112, 190, clamp(o.fire)) + flames(t, 112, 228, 0.8, clamp(o.fire));
    return s;
  }
  function stand(t, o) {   // nightstand at x 440..520 with a lamp
    var s = R(430, 230, 90, 70, "#8a5c34", 2.4, 4) + R(438, 250, 74, 18, "#a87a4a", 1.6, 3) + '<circle cx="475" cy="259" r="3" fill="' + INK + '"/>';
    s += R(462, 196, 8, 34, "#5a6068", 1.6) + '<path d="M448 196 L484 196 L476 172 L456 172 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2"/>';
    if (!o.day) s += '<circle cx="466" cy="200" r="50" fill="#ffe08a" opacity=".15" filter="url(#soft)"/>';
    if (o.phoneStand) s += phone(500, 222, 0.5, t, { charge: true, flat: true }) + '<path d="M500 228 Q520 260 530 300" stroke="#f4f1e8" stroke-width="3" fill="none"/>';
    return s;
  }
  // the phone: o.charge (battery filling), o.heat 0..1 (red glow), o.swell 0..1 (back bulging), o.flat (lying down), o.case
  function phone(x, y, s, t, o) {
    o = o || {}; var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')' + (o.flat ? ' rotate(90)' : '') + '">', sw = clamp(o.swell || 0) * 18, h = clamp(o.heat || 0);
    if (h > 0) g += '<rect x="-46" y="-86" width="92" height="172" rx="22" fill="#ff4a1a" opacity="' + f(0.45 * h + 0.15 * Math.sin(t * 6)) + '" filter="url(#soft)"/>';
    if (sw > 0) g += '<path d="M-36 -70 Q' + f(-36 - sw) + ' 0 -36 70" stroke="#ffb52a" stroke-width="5" fill="#3a3f46"/>';
    if (o.case) g += R(-42, -82, 84, 164, "#2f6f9f", 2.4, 18);
    g += R(-36, -74, 72, 148, "#1c1c1c", 2.6, 14) + R(-31, -66, 62, 128, o.off ? "#111" : "url(#screen)", 1.2, 6) + '<rect x="-10" y="-71" width="20" height="4" rx="2" fill="#3a3f46"/>';
    if (o.lift) g += '<path d="M-31 -66 L31 ' + f(-66 - o.lift * 12) + '" stroke="#ff6a5a" stroke-width="3"/>';
    if (o.charge) { var lv = (t * 0.15) % 1; g += R(-14, -18, 28, 44, "none", 2.4, 4).replace(INK, "#7cf29a") + '<rect x="-10" y="' + f(22 - 36 * lv) + '" width="20" height="' + f(36 * lv) + '" fill="#7cf29a"/><path d="M2 -6 L-6 6 H2 L-2 18 L8 2 H0 Z" fill="#fff"/>'; }
    if (o.face) g += head(0, 0, 20, o.face, t);
    if (!o.flat) g += '<path d="M0 74 V' + (o.cable === false ? 74 : 110) + '" stroke="#f4f1e8" stroke-width="5"/>';
    if (h > 0) g += heatW(t, 0, -80, 3, 1.1, "#ff7a2f", 40 * h);
    return g + '</g>';
  }
  // the cell up close: stacked layers (cathode blue-grey, separator white, anode black), soaked in electrolyte
  // o: ions (moving), electro (liquid), melt 0..1 (separator gaps), short (sparks), chain 0..1, boil, labels
  function cell(t, o) {
    o = o || {}; var s = R(120, 60, 400, 240, "#c9ced4", 3, 16) + '<rect x="134" y="74" width="372" height="212" rx="8" fill="' + (o.electro ? "#8fd0ee" : "#dfe3e8") + '" opacity="' + (o.electro ? .55 : 1) + '"/>';
    var L = [{ y: 92, c: "#4a6a8a" }, { y: 132, c: "#2b2b2b" }, { y: 172, c: "#4a6a8a" }, { y: 212, c: "#2b2b2b" }, { y: 252, c: "#4a6a8a" }];
    for (var i = 0; i < L.length; i++) s += R(146, L[i].y, 348, 22, L[i].c, 1.6, 3);
    for (var j = 0; j < 4; j++) { var sy = L[j].y + 27, m = clamp(o.melt || 0) * (j === 1 || (o.chain && j < 1 + o.chain * 4) ? 1 : 0); s += '<rect x="146" y="' + sy + '" width="348" height="8" fill="#fbfbf7" stroke="#9aa2ac" stroke-width="1"/>'; if (m > 0) for (var g = 0; g < 4; g++) { var gx = 190 + g * 80 + hash(j * 7 + g) * 30; s += '<ellipse cx="' + f(gx) + '" cy="' + f(sy + 4) + '" rx="' + f(14 * m) + '" ry="5" fill="#ff7a2f" stroke="#c23a1a" stroke-width="1"/>'; } }
    if (o.electro) for (var b = 0; b < 12; b++) { var q = (t * 0.3 + b / 12) % 1; s += '<circle cx="' + f(150 + hash(b) * 340) + '" cy="' + f(280 - q * 200) + '" r="' + f(o.boil ? 4 + 4 * q : 2) + '" fill="#fff" opacity="' + f(o.boil ? 0.9 : 0.5) + '" stroke="#5aa0c0" stroke-width=".8"/>'; }
    if (o.ions) for (var k = 0; k < 18; k++) { var p = (t * 0.45 + hash(k)) % 1, lay = k % 2; s += '<circle cx="' + f(150 + hash(k + 9) * 340) + '" cy="' + f(lerp(L[lay * 2].y + 11, L[lay * 2 + 1].y + 11, p)) + '" r="4" fill="#f2c230" stroke="' + INK + '" stroke-width="1.2"/>'; }
    if (o.short) s += spark(t, 230, 164, 1, o.short);
    if (o.chain) for (var c = 0; c < 4; c++) s += spark(t + c, 230 + c * 70, 124 + c * 40, 0.8, clamp(o.chain * 4 - c));
    s += T("+", 104, 110, 30, "#ff8a5a") + T("−", 104, 160, 30, "#7fd8ff");
    return s;
  }
  function C(a, b) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }; }
  var HB = { day: false };

  // 0 — don't charge your phone under the pillow while you sleep
  shot(0, C([260, 200, 1.0], [140, 215, 1.7]), function (u, d, t) {
    return room(t, { sleeper: true, phoneUnder: true, hot: clamp((u - 1) / 2) }) + cross(200, 130, 0.9, (u - 1.4) / 0.8) + tag("اوعى!", 300, 60, u, 0.4, -4, 30);
  });
  // 1 — why? we charge it every day and nothing happens
  shot(1, C([300, 200, 1.1], [300, 190, 1.3]), function (u, d, t) {
    return room(t, { day: true, bed: true }) + phone(300, 170, 0.6, t, { charge: true }) + mini(200, FY, 1.0, "#2f6f9f", t, "curious") + qmark(250, 120, t, 40) + tag("كل يوم عادي!", 420, 90, u, 1.2, 3, 22);
  });
  // 2 — and what does the pillow have to do with it?
  shot(2, C([110, 220, 2.0], [115, 215, 2.6]), function (u, d, t) {
    return room(t, { phoneUnder: true }) + qmark(110, 170, t, 34) + tag("المخدة؟", 150, 160, u, 0.6, 3, 20);
  });
  // 3 — what's the story? I'll explain in a minute
  shot(3, C([320, 180, 1.2], [320, 175, 1.05]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + phone(320, 180, 0.9, t, { face: "curious" }) + tag("إيه الحكاية؟", 320, 50, u, 0.3, -3, 28);
  });
  // 4 — inside: a lithium battery, thin layers rolled together
  shot(4, C([320, 180, 1.0], [320, 180, 1.1]), function (u, d, t) {
    var k = clamp((u - 0.4) / 1.5), s = room(t, { bed: false, stand: false }) + '<g opacity="' + f(1 - k) + '">' + phone(320, 180, 1.6, t, {}) + '</g>';
    s += '<g opacity="' + f(k) + '">' + R(250, 70, 140, 220, "#2b2e33", 3, 12) + R(262, 90, 116, 180, "#e2b035", 2, 8) + T("Li-ion", 320, 190, 22, "#fff") + '</g>';
    for (var r = 0; r < 6; r++) s += '<path d="M' + (450 + r * 6) + ' 180 a' + (12 + r * 7) + ' ' + (12 + r * 7) + ' 0 1 1 0.1 0" stroke="' + (r % 2 ? "#4a6a8a" : "#2b2b2b") + '" stroke-width="4" fill="none" opacity="' + f(clamp((u - 2.5) / 1)) + '"/>';
    return s + tag("بطارية ليثيوم", 320, 40, u, 1.2, -3, 22) + tag("طبقات ملفوفة", 500, 300, u, 3.0, 3, 18);
  });
  // 5 — positive, negative, and a separator thinner than a hair
  shot(5, C([320, 180, 1.0], [260, 150, 1.5]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, {}) + tag("موجب", 560, 100, u, 0.3, 3, 18) + tag("سالب", 560, 145, u, 1.2, 3, 18) + tag("الفاصل", 300, 40, u, 2.6, -3, 22) + arrow(300, 60, 300, 120, "#f2c230", 4, clamp((u - 2.8) / 0.6));
  });
  // 6 — all soaked in a liquid that burns easily
  shot(6, C([320, 180, 1.0], [320, 180, 1.12]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, { electro: u > 0.4 }) + flames(t, 560, 300, 0.5, clamp((u - 1.6) / 0.6)) + tag("بيولّع!", 540, 200, u, 1.8, 3, 22);
  });
  // 7 — charging moves the lithium across, and that makes heat
  shot(7, C([320, 180, 1.05], [320, 170, 1.2]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, { electro: true, ions: true }) + heatW(t, 320, 60, 5, 1, "#ff7a2f", 50) + tag("حرارة", 320, 30, u, 2.6, -3, 22);
  });
  // 8 — normally the heat leaves the back of the phone into the air
  shot(8, C([380, 200, 1.4], [400, 210, 1.7]), function (u, d, t) {
    var s = room(t, { day: true, bed: false, phoneStand: true });
    for (var i = 0; i < 5; i++) { var q = (t * 0.7 + i / 5) % 1; s += arrow(500 + (i - 2) * 10, 214, 500 + (i - 2) * 30, 214 - 40 - q * 50, "#ff8a5a", 3, 1); }
    return s + check(560, 150, 0.7, (u - 1.2) / 0.8) + tag("للهوا", 420, 140, u, 1.0, -3, 20);
  });
  // 9 — but the pillow is like a blanket: it traps the heat
  shot(9, C([140, 220, 2.2], [120, 215, 2.6]), function (u, d, t) {
    var s = room(t, { phoneUnder: true, hot: clamp(u / 2) });
    for (var i = 0; i < 4; i++) { var q = (t * 1.2 + i / 4) % 1; s += '<path d="M' + (98 + i * 9) + ' ' + f(220 - 16 * Math.sin(Math.PI * q)) + ' v-6" stroke="#ff7a2f" stroke-width="3" stroke-linecap="round"/>'; }
    return s + tag("محبوسة!", 120, 165, u, 1.2, -3, 18);
  });
  // 10 — Apple says the iPhone is made to work in air up to 35° only
  shot(10, C([320, 170, 1.1], [320, 175, 1.2]), function (u, d, t) {
    var s = room(t, { bed: false, stand: false }) + '<rect x="-400" y="-300" width="1440" height="800" fill="#000" opacity=".3"/>';
    return s + therm(240, 230, 0.4, "35° بس", "#3aa05a") + therm(400, 230, lerp(0.4, 0.92, clamp((u - 1.4) / 2)), "تحت المخدة", "#e8452a") + tag("حدّ الأمان", 240, 60, u, 0.6, -3, 20) + qmark(470, 90, t, 34);
  });
  // 11 — it keeps heating, the battery wears out and swells with gas
  shot(11, C([320, 180, 1.2], [320, 185, 1.5]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + phone(320, 185, 1.0, t, { heat: 0.7, swell: clamp((u - 1.5) / 2) }) + tag("بتنتفخ!", 440, 100, u, 2.4, 3, 22);
  });
  // 12 — if it keeps rising, the plastic separator starts melting around 130°
  shot(12, C([320, 170, 1.0], [260, 150, 1.45]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, { electro: true, melt: clamp((u - 1) / 2.5) }) + heatW(t, 320, 60, 5, 1.4, "#ff5a2a", 60) + tag("130°", 560, 70, u, 2.4, 3, 24) + tag("بيسيح", 260, 40, u, 3.2, -3, 20);
  });
  // 13 — positive touches negative: a short inside the battery
  shot(13, C([240, 160, 1.6], [235, 160, 2.0]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, { electro: true, melt: 1, short: clamp((u - 0.8) / 0.4) }) + tag("ماس!", 300, 90, u, 1.0, -4, 26);
  });
  // 14 — more heat, another separator melts, another short
  shot(14, C([320, 180, 1.4], [320, 180, 1.0]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + cell(t, { electro: true, melt: 1, short: 1, chain: clamp(u / (d - 0.5)) }) + heatW(t, 320, 60, 6, 1.6, "#ff5a2a", 60);
  });
  // 15 — that's thermal runaway: a chain that doesn't stop by itself
  shot(15, C([320, 180, 1.0], [320, 170, 1.15]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + '<rect x="-400" y="-300" width="1440" height="800" fill="#ff3a1a" opacity="' + f(0.15 + 0.08 * Math.sin(t * 6)) + '"/>' + cell(t, { electro: true, boil: true, melt: 1, short: 1, chain: 1 }) + tag("الانفلات الحراري", 320, 40, u, 0.6, -3, 26);
  });
  // 16 — the liquid boils into burning gas; the battery makes its own oxygen
  shot(16, C([320, 200, 1.05], [320, 180, 1.2]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + phone(320, 200, 0.9, t, { heat: 1, swell: 1 }) + smoke(t, 320, 120, 1) + flames(t, 320, 130, 1.3, clamp((u - 0.8) / 0.6)) + tag("أكسجين من جواها", 330, 320, u, 2.8, 3, 20);
  });
  // 17 — in seconds, next to your head, on a cotton pillow
  shot(17, C([150, 210, 1.8], [180, 200, 1.4]), function (u, d, t) {
    return room(t, { sleeper: true, mood: u > 1 ? "shock" : null, phoneUnder: true, hot: 1, fire: clamp((u - 0.4) / 1) }) + tag("جنب راسك!", 260, 120, u, 1.4, -3, 22);
  });
  // 18 — 2016: Samsung recalled about 2.5 million Note 7s
  shot(18, C([320, 180, 1.0], [320, 175, 1.15]), function (u, d, t) {
    var s = room(t, { day: true, bed: false, stand: false }) + R(380, 200, 160, 100, "#c9935a", 3, 4) + T("RECALL", 460, 260, 22, "#c23a26");
    for (var i = 0; i < 6; i++) { var q = clamp((u - i * 0.4) / 1.2); s += phone(lerp(80 + i * 40, 460, ease(q)), lerp(150, 230, ease(q)), 0.35, t, { heat: 0.6, cable: false }); }
    return s + tag("2.5 مليون", 200, 60, u, 1.6, -3, 26) + tag("Note 7", 460, 170, u, 0.6, 3, 18);
  });
  // 19 — firefighters in many countries recorded fires from phones charging in bed
  shot(19, C([300, 200, 1.0], [260, 210, 1.2]), function (u, d, t) {
    var s = room(t, { phoneUnder: true, fire: 0.6, hot: 1, stand: false }) + hardHat(500, 190, 0.6, t, "worry", {});
    for (var k = 0; k < 10; k++) { var q = (t * 1.5 + k / 10) % 1; s += '<circle cx="' + f(lerp(470, 130, q)) + '" cy="' + f(150 + 60 * Math.sin(q * Math.PI) * -0.5 + q * 60) + '" r="4" fill="#7fd8ff" opacity=".8"/>'; }
    return s + tag("حرايق حقيقية", 320, 50, u, 1.0, -3, 22);
  });
  // 20 — a fake charger adds to the danger: none of the original's protections
  shot(20, C([320, 180, 1.1], [320, 180, 1.25]), function (u, d, t) {
    function chg(x, col, lab) { return '<g transform="translate(' + x + ' 190)">' + R(-36, -40, 72, 80, col, 3, 10) + '<path d="M-14 -40 V-62 M14 -40 V-62" stroke="#9aa2ac" stroke-width="6"/>' + T(lab, 0, 8, 16, INK) + '</g>'; }
    return room(t, { bed: false, stand: false }) + chg(220, "#fbfbf7", "أصلي") + chg(420, "#d9d0b8", "مضروب") + check(220, 110, 0.7, (u - 0.6) / 0.8) + cross(420, 110, 0.7, (u - 1.2) / 0.8) + spark(t, 440, 230, 0.6, u > 1.6 ? 1 : 0) + tag("من غير حماية", 420, 300, u, 2.2, 3, 18);
  });
  // 21 — so what's right?
  shot(21, C([320, 190, 1.1], [320, 185, 1.25]), function (u, d, t) {
    return room(t, { day: true, bed: false }) + mini(300, FY, 1.1, "#2f6f9f", t, "curious") + qmark(340, 140, t, 40) + tag("طب الصح إيه؟", 300, 60, u, 0.3, -3, 24);
  });
  // 22 — charge it on a table or nightstand, a dry, open surface
  shot(22, C([470, 220, 2.0], [440, 220, 1.5]), function (u, d, t) {
    var s = room(t, { phoneStand: true, sleeper: true, mood: "happy" });
    for (var i = 0; i < 3; i++) { var q = (t * 0.7 + i / 3) % 1; s += arrow(500 + (i - 1) * 14, 214, 500 + (i - 1) * 30, 180 - q * 40, "#ffb08a", 2.4, 1); }
    return s + check(560, 160, 0.6, (u - 0.8) / 0.8) + tag("سطح مكشوف", 470, 330, u, 1.4, 3, 18);
  });
  // 23 — if it gets very hot, take off the case and let it cool
  shot(23, C([320, 180, 1.2], [320, 180, 1.35]), function (u, d, t) {
    var k = clamp((u - 0.6) / 1); return room(t, { bed: false, stand: false }) + '<g transform="translate(' + f(lerp(0, -160, ease(k))) + ' 0)">' + R(278, 98, 84, 164, "#2f6f9f", 2.4, 18) + '</g>' + phone(320, 180, 1.0, t, { heat: lerp(0.7, 0, clamp((u - 1.4) / 1.5)), cable: false }) + (u > 2 ? heatW(t, 320, 100, 3, 0.8, "#7fd8ff", 30) : "") + tag("شيل الجراب", 450, 80, u, 0.8, 3, 20);
  });
  // 24 — swollen battery or a lifting screen: stop charging, replace it
  shot(24, C([320, 180, 1.3], [320, 180, 1.1]), function (u, d, t) {
    return room(t, { bed: false, stand: false }) + phone(320, 185, 1.0, t, { swell: 1, lift: 1, cable: false }) + cross(440, 120, 0.8, (u - 1.4) / 0.8) + tag("غيّرها!", 200, 80, u, 2.4, -3, 24);
  });
  // 25 — the pillow isn't a charging spot; it's for your head
  shot(25, C([280, 210, 1.2], [300, 200, 1.0]), function (u, d, t) {
    return room(t, { sleeper: true, mood: "happy", phoneStand: true }) + tag("المخدة لراسك بس", 260, 120, u, 0.8, -3, 22);
  });
  // 26 — tell us what story you want next time
  shot(26, C([320, 190, 1.0], [320, 180, 0.9]), function (u, d, t) {
    return room(t, { sleeper: true, mood: "happy", phoneStand: true }) + tag("قولولنا!", 320, 50, u, 0.4, 3, 30);
  });

  window.__parts = { room: room, phone: phone, cell: cell, flames: flames, smoke: smoke, spark: spark, therm: therm, tag: tag, T: T, R: R, hardHat: hardHat };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
