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
  function C(k0, k1) { return function (u, d) { var k = ease(clamp(u / d)); return [lerp(k0[0], k1[0], k), lerp(k0[1], k1[1], k), lerp(k0[2], k1[2], k)]; }; }
  // ── a secret basement under a house, in cross-section: shored pit, reinforced-concrete box, outside membrane, drain to a
  // sump pump, an air pipe hidden in a garden lamp post, a dehumidifier, a bookcase door over the ladder shaft, rock-wool
  // sound insulation, an emergency hatch to the garden, sealed floor cracks against radon. Layout after residential
  // basement sections (../refs/SOURCES.md).
  var GY = 150, X0 = 200, X1 = 460, Y0 = 200, Y1 = 310, TH = 12, WT = 272, SOILC = "#9a7048", SOILD = "#7a5636", CON = "#b9b6ae";
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function P(d, col, w, extra) { return '<path d="' + d + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" fill="none"' + (extra || "") + '/>'; }
  function tree(x, y, s, t) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') rotate(' + f(Math.sin(t * 1.3 + x) * 2) + ')"><rect x="-5" y="-40" width="10" height="40" fill="#6a4a2a" stroke="' + INK + '" stroke-width="1.6"/><circle cy="-62" r="30" fill="#5aa04a" stroke="' + INK + '" stroke-width="2"/><circle cx="-18" cy="-48" r="18" fill="#4a8a3a" stroke="' + INK + '" stroke-width="2"/></g>'; }
  function mini(x, y, s, col, t, mood) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3 + x) * 1) + ') scale(' + s + ')"><rect x="-14" y="-38" width="28" height="38" rx="8" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>' + head(0, -52, 15, mood || "happy", t + x * 0.1) + '</g>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(clamp(k)) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(clamp(k)) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  function star(x, y, r, t, col) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2 + t * 2, rr = i % 2 ? r * 0.45 : r * (1 + 0.15 * Math.sin(t * 18 + i)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + ' Z" fill="' + (col || "#ffe46a") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function lamp(x, t, on) { return R(x - 3, GY - 96, 6, 96, "#3a3f46", 1.6) + R(x - 12, GY - 112, 24, 18, "#2b2e33", 1.8, 4) + '<circle cx="' + x + '" cy="' + (GY - 100) + '" r="7" fill="#ffe08a"/>' + (on ? '<circle cx="' + x + '" cy="' + (GY - 100) + '" r="' + f(18 + 2 * Math.sin(t * 3)) + '" fill="#ffe08a" opacity=".3"/>' : ""); }

  // the world: sky, the house cut open on top (sofa, rug, bookcase), the garden on both sides, earth below.
  // o: rug (0 flat … 1 lifted), shelf (0 shut … 1 swung open), visitor (mood), ear, night, lampPost, water (0…1 groundwater up)
  function world(t, o) {
    o = o || {}; var s = sky(o.night ? "night" : "day") + (o.night ? stars(t) : clouds(t, 10, 0, 4, 0.85));
    s += tree(60, GY, 0.85, t) + tree(600, GY, 0.7, t);
    // earth
    s += '<rect x="-300" y="' + GY + '" width="1250" height="500" fill="' + SOILC + '"/><rect x="-300" y="' + (GY + 120) + '" width="1250" height="400" fill="' + SOILD + '"/>';
    for (var k = 0; k < 46; k++) { var px = -280 + hash(k) * 1200, py = GY + 14 + hash(k + 4) * 300; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(1.5 + hash(k + 7) * 2.5) + '" fill="#5a3c20" opacity=".5"/>'; }
    if (o.water) { var wy = lerp(380, WT, clamp(o.water)), d = "M-300 " + f(wy); for (var x = -300; x <= 950; x += 20) d += " L" + x + " " + f(wy + Math.sin(x * 0.05 + t * 2.4) * 3); s += '<path d="' + d + ' V700 H-300 Z" fill="#3f8fc8" opacity=".45"/>' + P(d, "#bfe0ff", 2.4, ' opacity=".9"'); }
    s += '<rect x="-300" y="' + (GY - 3) + '" width="1250" height="9" fill="#6fae4a" stroke="' + INK + '" stroke-width="1.6"/>';
    // house: footings, walls, roof, the room in section
    s += R(132, GY, 18, 14, CON, 1.6) + R(510, GY, 18, 14, CON, 1.6);
    s += R(140, 50, 380, GY - 50, "#efe6d2", 2.6) + '<path d="M118 52 L330 -40 L542 52 Z" fill="#b5523a" stroke="' + INK + '" stroke-width="2.6"/>';
    s += R(140, 50, 12, GY - 50, "#d8cfba", 2) + R(508, 50, 12, GY - 50, "#d8cfba", 2) + R(140, GY - 8, 380, 8, "#a87a4a", 2);
    s += R(178, 70, 50, 36, "#9fc6e0", 2) + P("M203 70 V106 M178 88 H228", INK, 1.6) + '<path d="M340 50 v16" stroke="' + INK + '" stroke-width="1.4"/><circle cx="340" cy="70" r="6" fill="#ffe08a" stroke="' + INK + '" stroke-width="1.4"/><circle cx="340" cy="70" r="' + f(15 + Math.sin(t * 2)) + '" fill="#ffe08a" opacity=".25"/>';
    // sofa
    s += R(190, GY - 34, 80, 26, "#4f7fa8", 2, 6) + R(186, GY - 44, 12, 36, "#3f6f98", 2, 4) + R(262, GY - 44, 12, 36, "#3f6f98", 2, 4) + R(196, GY - 52, 68, 20, "#5a8fb8", 2, 6);
    // rug (with the old naive hatch under it)
    var rg = clamp(o.rug || 0); s += '<g transform="translate(290 ' + (GY - 8) + ') rotate(' + f(-rg * 28) + ')">' + R(0, -4, 80, 5, "#c23a26", 1.6) + P("M6 -1.5 H74", "#f2c230", 1.4, ' stroke-dasharray="4 3"') + '</g>';
    // bookcase door over the ladder shaft (x 418–460), hinged on its right edge
    var sh = clamp(o.shelf || 0), w = 42 * Math.cos(sh * 1.25);
    if (o.secret) s += R(418, GY - 84, 42, 84, "#2a2420", 1.6);
    s += '<g transform="translate(460 ' + (GY - 84) + ')">' + R(-w, 0, w, 84, "#8a5a32", 2.2);
    if (w > 6) for (var r = 0; r < 4; r++) { s += P("M" + f(-w) + " " + (r * 21 + 20) + " H0", INK, 1.6); for (var b = 0; b < 5; b++) { var bw = w / 6; s += R(-w + 2 + b * (w - 4) / 5, r * 21 + 6, Math.max(1, bw * 0.8), 14, ["#c23a26", "#2f6f9f", "#e2b035", "#3aa05a", "#9a5fb0"][(b + r) % 5], 1, 1); } }
    s += '</g>';
    if (o.lampPost) s += lamp(90, t, true);
    if (o.visitor) s += mini(o.vx || 340, GY - 8, 0.62, "#e8742e", t + 3, o.visitor) + (o.ear ? '<path d="M' + f((o.vx || 340) + 12) + ' ' + (GY - 48) + ' q8 4 0 10" stroke="' + INK + '" stroke-width="2" fill="none"/>' : "");
    return s;
  }
  // the basement box. p: shore, concrete, membrane, drain, pump, vent, air, dehum, ladder, wool, escape, sealed, fan, led, sofa, cam, cracks
  function basement(t, p) {
    p = p || {}; var s = "", ox0 = X0 - TH, ox1 = X1 + TH, oy0 = Y0 - TH, oy1 = Y1 + TH;
    // the dug void
    s += R(ox0 - 6, oy0 - 6, ox1 - ox0 + 12, oy1 - oy0 + 12, "#3a2a1c", 0);
    if (p.shore) for (var i = 0; i < 9; i++) { var yy = oy0 - 4 + i * 14; s += R(ox0 - 8, yy, 8, 12, "#c99a5a", 1.2) + R(ox1, yy, 8, 12, "#c99a5a", 1.2); }
    if (p.membrane) s += '<rect x="' + (ox0 - 4) + '" y="' + (oy0 - 4) + '" width="' + (ox1 - ox0 + 8) + '" height="' + (oy1 - oy0 + 8) + '" fill="#1a1a1a" rx="3"/>';
    if (p.concrete) { var k = clamp(p.concrete), hh = (oy1 - oy0) * k; s += '<rect x="' + ox0 + '" y="' + f(oy1 - hh) + '" width="' + (ox1 - ox0) + '" height="' + f(hh) + '" fill="' + CON + '" stroke="' + INK + '" stroke-width="2.4"/>';
      for (var q = 0; q < 14; q++) { var cx = ox0 + hash(q + 20) * (ox1 - ox0), cy = oy0 + hash(q + 30) * (oy1 - oy0); if (cy > oy1 - hh) s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="1.6" fill="#8d8a82"/>'; }
      if (k >= 1) s += P("M" + (ox0 + 4) + " " + (oy0 + 5) + " H" + (ox1 - 4) + " M" + (ox0 + 4) + " " + (oy1 - 5) + " H" + (ox1 - 4) + " M" + (ox0 + 5) + " " + (oy0 + 5) + " V" + (oy1 - 5) + " M" + (ox1 - 5) + " " + (oy0 + 5) + " V" + (oy1 - 5), "#6a3a2a", 1.4, ' stroke-dasharray="6 4"'); }
    // the room
    if (p.concrete >= 1 || p.room) { s += R(X0, Y0, X1 - X0, Y1 - Y0, p.led ? "#f3ead8" : "#d9d2c2", 2); s += R(X0, Y1 - 6, X1 - X0, 6, "#9a958a", 1.4); }
    if (p.mold) for (var m = 0; m < 10; m++) { var mx = X0 + 8 + hash(m + 50) * (X1 - X0 - 16), my = Y0 + 10 + hash(m + 60) * 70, mr = (4 + hash(m + 70) * 8) * clamp(p.mold); s += '<circle cx="' + f(mx) + '" cy="' + f(my) + '" r="' + f(mr) + '" fill="#4f7a3a" opacity=".75"/><circle cx="' + f(mx + mr * 0.6) + '" cy="' + f(my + mr * 0.5) + '" r="' + f(mr * 0.5) + '" fill="#3a5a2a" opacity=".75"/>'; }
    if (p.wool) { var wk = clamp(p.wool), d1 = ""; s += '<rect x="' + X0 + '" y="' + Y0 + '" width="' + f((X1 - X0) * wk) + '" height="12" fill="#f2c94a" stroke="' + INK + '" stroke-width="1.4"/>' + '<rect x="' + X0 + '" y="' + Y0 + '" width="10" height="' + f((Y1 - Y0 - 6) * wk) + '" fill="#f2c94a" stroke="' + INK + '" stroke-width="1.4"/>';
      for (var x = X0 + 4; x < X0 + (X1 - X0) * wk - 4; x += 8) d1 += "M" + x + " " + (Y0 + 2) + " q4 4 0 8 "; s += P(d1, "#c99a2a", 1.2); }
    if (p.cracks) [[280, 0], [350, 1], [410, 2]].forEach(function (c) { var d = "M" + c[0] + " " + (Y1 - 6) + " l3 3 l-4 3 l3 3"; s += P(d, p.sealed ? "#7a7a7a" : "#1a1a1a", p.sealed ? 4 : 1.8); });
    // ladder shaft up to the bookcase door
    if (p.ladder) { s += R(422, GY, 34, oy0 - GY, "#2a2420", 1.6) + R(422, Y0, 34, 1, "#2a2420", 0); for (var y = GY + 8; y < Y1 - 6; y += 12) s += P("M426 " + y + " H452", "#c99a5a", 2.4); s += P("M426 " + GY + " V" + (Y1 - 6) + " M452 " + GY + " V" + (Y1 - 6), "#8a6a3a", 2.4); }
    // drain under the floor to a sump pit with a pump, discharge up the outside to the garden
    if (p.drain) { s += P("M" + (ox1 - 4) + " " + (oy1 + 8) + " H" + (X0 + 22), "#6a7078", 6) + P("M" + (ox1 - 4) + " " + (oy1 + 8) + " H" + (X0 + 22), "#c9ced4", 3);
      s += R(X0 + 6, Y1 - 6, 34, 30, "#5a5f66", 1.8) ; }
    if (p.pump) { s += R(X0 + 12, Y1 + 2, 22, 18, "#2f6f9f", 1.6, 3) + '<circle cx="' + (X0 + 23) + '" cy="' + (Y1 + 11) + '" r="5" fill="#e9ebee" stroke="' + INK + '"/>' + '<path d="M' + (X0 + 23) + ' ' + (Y1 + 11) + ' l' + f(Math.cos(t * 9) * 4) + ' ' + f(Math.sin(t * 9) * 4) + '" stroke="' + INK + '" stroke-width="1.6"/>';
      s += P("M" + (X0 + 23) + " " + (Y1 + 2) + " V" + (Y1 - 20) + " H" + (ox0 - 14) + " V170 H118 V" + (GY - 2), "#6a7078", 5) + P("M" + (X0 + 23) + " " + (Y1 + 2) + " V" + (Y1 - 20) + " H" + (ox0 - 14) + " V170 H118 V" + (GY - 2), "#c9ced4", 2.4); }
    if (p.flow) for (var w = 0; w < 6; w++) { var fp = (t * 0.5 + w / 6) % 1; s += '<circle cx="' + f(lerp(ox1 - 6, X0 + 22, fp)) + '" cy="' + (oy1 + 8) + '" r="2.6" fill="#3f8fc8"/>'; var up = (t * 0.7 + w / 6) % 1; s += '<circle cx="' + f(up < 0.4 ? lerp(X0 + 23, ox0 - 14, up / 0.4) : up < 0.8 ? ox0 - 14 : lerp(ox0 - 14, 118, (up - 0.8) / 0.2)) + '" cy="' + f(up < 0.4 ? Y1 - 20 : up < 0.8 ? lerp(Y1 - 20, 170, (up - 0.4) / 0.4) : 170) + '" r="2.4" fill="#3f8fc8"/>'; }
    // air pipe: from the ceiling up and across to a lamp post in the left garden
    if (p.vent) { var vk = clamp(p.vent), vd = "M240 " + Y0 + " V176 H90 V" + (GY - 90); s += '<path d="' + vd + '" stroke="' + INK + '" stroke-width="11" fill="none" stroke-dasharray="' + f(600 * vk) + ' 900"/><path d="' + vd + '" stroke="#9aa2ac" stroke-width="6" fill="none" stroke-dasharray="' + f(600 * vk) + ' 900"/>'; }
    if (p.fan) { var a = t * 10; s += R(226, Y0 + 2, 28, 20, "#5d93ad", 1.6, 3) + '<g transform="translate(240 ' + (Y0 + 12) + ')">'; for (var bl = 0; bl < 3; bl++) s += '<path d="M0 0 L8 -2.4 L8 2.4 Z" fill="#e9ebee" stroke="' + INK + '" stroke-width=".8" transform="rotate(' + f(a * 57 + bl * 120) + ')"/>'; s += '</g>'; }
    if (p.air) for (var ai = 0; ai < 8; ai++) { var ap = (t * 0.35 + ai / 8) % 1, L1 = Y0 - 176, L2 = 150, L3 = 176 - (GY - 90), tot = L1 + L2 + L3, dd = ap * tot, ax, ay;
      if (dd < L1) { ax = 240; ay = Y0 - dd; } else if (dd < L1 + L2) { ax = 240 - (dd - L1); ay = 176; } else { ax = 90; ay = 176 - (dd - L1 - L2); }
      s += '<circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="2.6" fill="' + (p.radonOut ? "#b07ad8" : "#bfe0ff") + '" stroke="' + INK + '" stroke-width=".8"/>'; }
    // emergency hatch: a crawl tunnel from the right wall out under the garden, then a ladder up to a lid
    if (p.escape) { var ek = clamp(p.escape), top = lerp(Y1 - 22, GY - 2, ek), ed = "M" + (ox1) + " " + (Y1 - 22) + " H580 V" + f(top);
      s += '<path d="' + ed + '" stroke="' + INK + '" stroke-width="26" fill="none"/><path d="' + ed + '" stroke="#c9ced4" stroke-width="20" fill="none"/>';
      for (var ey = Y1 - 34; ey > top; ey -= 11) s += P("M572 " + ey + " H588", "#e2b035", 2.2);
      if (ek >= 1) s += '<ellipse cx="580" cy="' + (GY - 4) + '" rx="18" ry="5" fill="#3a6a3a" stroke="' + INK + '" stroke-width="2"/>'; }
    // furniture
    if (p.sofa) s += R(270, Y1 - 30, 70, 22, "#9a5fb0", 2, 6) + R(266, Y1 - 38, 10, 30, "#80489a", 1.6, 4) + R(334, Y1 - 38, 10, 30, "#80489a", 1.6, 4) + R(276, Y1 - 46, 58, 18, "#a870c0", 1.6, 6);
    if (p.dehum) { s += R(372, Y1 - 46, 30, 40, "#e9ebee", 2, 4) + R(376, Y1 - 42, 22, 10, "#2b2e33", 1.2, 2) + T(p.dehumTxt || "45%", 387, Y1 - 34, 8, "#7cf2a0") + R(376, Y1 - 24, 22, 14, "#7fb7e0", 1.2, 2);
      for (var dv = 0; dv < 3; dv++) { var dp = (t * 0.8 + dv / 3) % 1; s += P("M" + (380 + dv * 7) + " " + f(Y1 - 50 - dp * 14) + " q3 -4 0 -8", "#bfe0ff", 1.6, ' opacity="' + f(1 - dp) + '"'); } }
    if (p.led) { s += '<rect x="' + (X0 + 4) + '" y="' + (Y0 + (p.wool ? 13 : 2)) + '" width="' + (X1 - X0 - 8) + '" height="3" fill="#fff6c0"/>'; for (var li = 0; li < 6; li++) s += '<ellipse cx="' + (X0 + 30 + li * 40) + '" cy="' + (Y0 + 18) + '" rx="22" ry="6" fill="#fff6c0" opacity="' + f(0.35 + 0.1 * Math.sin(t * 3 + li)) + '"/>'; }
    if (p.cam) { s += R(300, Y0 + 26, 56, 34, "#2b2e33", 1.8, 3) + R(304, Y0 + 30, 48, 26, "#3a6a8a", 1, 2) + '<path d="M312 ' + (Y0 + 52) + ' l16 -14 l16 14 Z" fill="#efe6d2"/>' + '<circle cx="346" cy="' + (Y0 + 34) + '" r="2" fill="' + (Math.sin(t * 6) > 0 ? "#ff4040" : "#601010") + '"/>'; s += R(462, GY - 46, 12, 8, "#2b2e33", 1.2, 2) + '<circle cx="462" cy="' + (GY - 42) + '" r="2.4" fill="#5ad0ff"/>'; }
    if (p.radon) { var rk = clamp(p.radon); for (var ri = 0; ri < 22; ri++) { var rp = (t * 0.25 + hash(ri + 80)) % 1, rx = X0 + 10 + hash(ri + 90) * (X1 - X0 - 20), ry = lerp(Y1 + 60, Y0 + 10, rp), inRoom = ry < Y1 - 6; if (p.sealed && inRoom) continue; s += '<circle cx="' + f(rx + Math.sin(t * 2 + ri) * 4) + '" cy="' + f(ry) + '" r="' + f(2.6 + hash(ri) * 1.6) + '" fill="#b07ad8" opacity="' + f(rk * (inRoom ? 0.85 : 0.5)) + '"/>'; } }
    if (p.n) s += mini(p.px || 310, Y1 - 6, 0.7, "#2f6f9f", t, p.mood);
    return s;
  }
  function soilPush(t, k) { var s = ""; for (var i = 0; i < 4; i++) { var y = Y0 - 4 + i * 34, len = (14 + i * 9) * k + Math.sin(t * 6 + i) * 2; s += arrow(X0 - TH - 10 - len, y, X0 - TH - 10, y, "#ffd23a", 3.2, 1) + arrow(X1 + TH + 10 + len, y, X1 + TH + 10, y, "#ffd23a", 3.2, 1); } return s; }
  function waterPush(t, k) { var s = ""; for (var i = 0; i < 5; i++) { var x = X0 - 6 + i * 66, y = Y1 + TH + 34 + Math.sin(t * 5 + i) * 3; s += arrow(x, y, x, Y1 + TH + 8, "#bfe0ff", 3.2, k); } s += arrow(X0 - TH - 40, 296, X0 - TH - 8, 296, "#bfe0ff", 3.2, k) + arrow(X1 + TH + 40, 296, X1 + TH + 8, 296, "#bfe0ff", 3.2, k); return s; }
  // the build so far: each step turns parts on from a given line onward (parts stay on in later shots)
  var STEPS = [[0, { concrete: 1 }]], CUR = 0;
  function add(line, props) { STEPS.push([line, props]); }
  function have(extra) { var o = {}; STEPS.forEach(function (st) { if (st[0] <= CUR) Object.assign(o, st[1]); }); return Object.assign(o, extra || {}); }

  // 0 — dig a room under the floor and hide the hole with a rug: is that a secret basement?
  shot(0, C([330, 150, 1.35], [330, 190, 1.05]), function (u, d, t) {
    var dig = clamp((u - 0.2) / 2.2), s = world(t, { rug: u < 2.6 ? 1 : 0 });
    s += '<path d="M300 ' + (GY) + ' Q285 ' + f(GY + 90 * dig) + ' 330 ' + f(GY + 100 * dig) + ' Q380 ' + f(GY + 90 * dig) + ' 360 ' + GY + ' Z" fill="#3a2a1c" stroke="' + INK + '" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) { var p = (t * 1.3 + k / 6) % 1; s += '<circle cx="' + f(lerp(330, 380 + k * 6, p)) + '" cy="' + f(GY + 60 * dig - 70 * Math.sin(p * Math.PI)) + '" r="3.4" fill="' + SOILD + '" opacity="' + f(dig) + '"/>'; }
    s += mini(330, GY + 96 * dig, 0.55, "#2f6f9f", t, "happy");
    return s + qmark(450, 40, t, 36) + tag("قبو سري؟", 250, 30, u, 2.6, -3, 24);
  });
  // 1 — no: the earth around you caves in before you finish digging
  shot(1, C([330, 220, 1.2], [330, 240, 1.7]), function (u, d, t) {
    var s = world(t), c = clamp((u - 0.5) / 1.2);
    s += '<path d="M300 ' + GY + ' Q285 ' + (GY + 90) + ' 330 ' + (GY + 100) + ' Q380 ' + (GY + 90) + ' 360 ' + GY + ' Z" fill="#3a2a1c" stroke="' + INK + '" stroke-width="2"/>' + mini(330, GY + 96, 0.55, "#2f6f9f", t, c > 0.3 ? "shock" : "happy");
    for (var k = 0; k < 16; k++) { var p = clamp(c * 1.4 - k * 0.03), sx = k % 2 ? 292 : 368; s += '<circle cx="' + f(lerp(sx, 330 + (hash(k) - 0.5) * 30, p)) + '" cy="' + f(lerp(GY + 20 + hash(k + 1) * 50, GY + 70 + hash(k + 2) * 30, p)) + '" r="' + f(6 + hash(k + 3) * 4) + '" fill="' + SOILD + '" stroke="' + INK + '" stroke-width="1"/>'; }
    return s + tag("هيقع عليك!", 330, GY + 150, u, 1.4, -3, 22, "#f2a0a0") + cross(420, GY + 50, 0.6, (u - 1.8) / 0.6);
  });
  // 2 — so you shore the pit with planks as you go: a cubic metre of earth weighs about 1.5 t, more than a car
  shot(2, C([330, 215, 1.0], [330, 200, 0.92]), function (u, d, t) {
    var s = world(t) + basement(t, { shore: u > 0.3 }) + mini(330, Y1 + 6, 0.7, "#2f6f9f", t, "happy");
    var k = ease(clamp((u - 1.6) / 1.2)), tilt = lerp(0, -12, k), bx = 330, by = 150;
    s += '<g transform="translate(' + bx + ' ' + by + ')"><g opacity="' + f(clamp((u - 1.4) * 2)) + '">' + R(-200, -110, 400, 140, "rgba(244,239,228,.94)", 2.4, 12) + '<path d="M-8 18 L0 0 L8 18 Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<g transform="rotate(' + f(tilt) + ')">' + R(-170, -4, 340, 6, "#8a6a3a", 1.8) + '<g transform="translate(110 -4)">' + R(-34, -60, 68, 60, SOILC, 2.4) + T("1 م³", 0, -24, 16) + '</g>' + carSide(-110, -16, 0, 0.42, "#2f6f9f") + '</g></g></g>';
    return s + tag("ألواح سند", 330, Y1 + 40, u, 0.6, 3, 18, "#e8c48e") + tag("طن ونص!", 520, 80, u, 2.8, 3, 24, "#f2c230");
  });
  // 3 — but the earth pushes on the walls, harder the deeper you go
  shot(3, C([330, 250, 1.2], [330, 260, 1.45]), function (u, d, t) {
    return world(t) + basement(t, { shore: true }) + soilPush(t, clamp((u - 0.3) / 1.4)) + mini(330, Y1 + 6, 0.7, "#2f6f9f", t, u > 1.5 ? "worry" : "curious") + tag("أعمق = أقوى", 330, Y1 + 46, u, 1.8, -3, 18, "#f2c230");
  });
  // 4 — so you pour walls and a ceiling of reinforced concrete, about 20 cm thick
  shot(4, C([330, 250, 1.4], [400, 250, 1.8]), function (u, d, t) {
    var s = world(t) + basement(t, { shore: true, concrete: clamp((u - 0.2) / 2.0), room: false });
    if (u > 2.4) s += arrow(X1 - 6, 250, X1 + TH + 18, 250, "#f2c230", 3, 1) + arrow(X1 + TH + 18, 250, X1 - 6, 250, "#f2c230", 3, 1);
    return s + tag("خرسانة مسلحة", 330, 262, u, 0.8, -3, 18) + tag("20 سم", X1 + 50, 228, u, 2.6, 3, 18, "#e8c48e");
  });
  // 5 — but groundwater presses on the concrete, looking for any crack to get in
  shot(5, C([330, 260, 1.1], [330, 270, 1.35]), function (u, d, t) {
    var s = world(t, { water: clamp(u / 1.2) }) + basement(t, have({ n: 1, mood: u > 2 ? "shock" : "curious" })) + waterPush(t, clamp((u - 0.8) * 2));
    for (var k = 0; k < 4; k++) { var p = (t * 1.1 + k / 4) % 1; s += '<path d="M' + (X0 + 2) + ' ' + f(268 + p * 30) + ' q-3 5 0 7 q3 -2 0 -7" fill="#3f8fc8" opacity="' + f(clamp(u - 1.6)) + '"/>'; }
    return s + tag("مية جوفية", 330, 345, u, 0.8, 3, 20, "#bfe0ff") + tag("شق!", X0 + 30, 250, u, 1.8, -3, 16, "#f2a0a0");
  });
  // 6 — so you wrap the outside in a waterproof layer, with a drain under the floor to a pump
  shot(6, C([330, 270, 1.15], [260, 290, 1.5]), function (u, d, t) {
    var s = world(t, { water: 1 }) + basement(t, have({ membrane: u > 0.3, drain: u > 1.6, pump: u > 2.6, n: 1 }));
    return s + tag("طبقة عازلة", X1 - 20, 186, u, 0.5, 3, 16) + tag("ماسورة صرف", 400, 352, u, 1.7, -3, 16, "#e8c48e") + tag("طلمبة", X0 + 22, 352, u, 2.7, 3, 16, "#bfe0ff");
  });
  add(7, { membrane: true, drain: true, pump: true });
  // 7 — the water is pumped out before it can push on the wall
  shot(7, C([240, 260, 1.5], [200, 220, 1.2]), function (u, d, t) {
    return world(t, { water: 1 }) + basement(t, have({ flow: true, n: 1 })) + check(330, 250, 0.7, (u - 1.2) / 0.6) + tag("لبرة", 118, 120, u, 0.6, -3, 18, "#bfe0ff");
  });
  // 8 — but you're underground in a closed room: your own breath makes the air heavy
  shot(8, C([330, 260, 1.4], [330, 265, 1.9]), function (u, d, t) {
    var s = world(t) + basement(t, have({ n: 1, mood: u > 1.2 ? "dizzy" : "n" }));
    for (var k = 0; k < 7; k++) { var p = (t * 0.4 + k / 7) % 1; s += '<g opacity="' + f(Math.sin(p * Math.PI)) + '">' + T("CO₂", 260 + k * 22, lerp(Y1 - 60, Y0 + 20, p), 11, "#d0d0d0") + '</g>'; }
    return s + tag("هوا تقيل", 405, 238, u, 1.0, -3, 20, "#f2a0a0");
  });
  // 9 — so you run an air pipe up, hidden inside a lamp post in the garden
  shot(9, C([200, 170, 1.15], [160, 140, 1.25]), function (u, d, t) {
    return world(t, { lampPost: u > 2.0 }) + basement(t, have({ vent: clamp((u - 0.2) / 1.8), fan: u > 2.0, air: u > 2.2, n: 1 })) + tag("ماسورة هوا", 170, 196, u, 0.8, -3, 16) + tag("عمود نور!", 90, 20, u, 2.2, 3, 20, "#f2c230");
  });
  add(10, { vent: 1, fan: true, air: true });
  // 10 — but underground humidity is high, and the walls will grow mould
  shot(10, C([330, 255, 1.3], [330, 255, 1.7]), function (u, d, t) {
    var s = world(t, { lampPost: true }) + basement(t, have({ mold: clamp((u - 0.3) / 1.6), n: 1, mood: u > 1.4 ? "worry" : "n" }));
    for (var k = 0; k < 10; k++) { var p = (t * 0.5 + k / 10) % 1; s += '<circle cx="' + f(X0 + 20 + hash(k + 3) * 230) + '" cy="' + f(lerp(Y1 - 10, Y0 + 10, p)) + '" r="2" fill="#bfe0ff" opacity="' + f(Math.sin(p * Math.PI)) + '"/>'; }
    return s + tag("عفن!", 405, 238, u, 1.4, -3, 22, "#bfe8c0");
  });
  // 11 — so you add a dehumidifier that keeps it between 30 and 50 %
  shot(11, C([380, 270, 1.8], [360, 260, 1.5]), function (u, d, t) {
    var h = Math.round(lerp(85, 45, clamp((u - 0.8) / 2))), s = world(t, { lampPost: true }) + basement(t, have({ mold: clamp(1 - (u - 1.0) / 1.6), dehum: u > 0.3, dehumTxt: h + "%", n: 1, px: 230 }));
    return s + tag("سحب رطوبة", 395, Y0 + 18, u, 0.6, 3, 16) + tag("من 30 لـ 50%", 305, 242, u, 2.2, -3, 22, "#bfe0ff");
  });
  add(12, { dehum: true });
  // 12 — but that rug is the first thing anyone will lift
  shot(12, C([330, 140, 1.5], [330, 160, 1.3]), function (u, d, t) {
    var lift = clamp((u - 0.6) / 0.8), s = world(t, { lampPost: true, rug: lift, visitor: lift > 0.6 ? "shock" : "curious", vx: 390 }) + basement(t, have({ n: 1, mood: lift > 0.6 ? "shock" : "n" }));
    if (lift > 0) s += R(296, GY - 3, 64, 3, "#2a2420", 1);
    return s + tag("أول حاجة!", 330, 58, u, 1.4, 3, 22, "#f2a0a0") + cross(250, 70, 0.55, (u - 1.6) / 0.6);
  });
  // 13 — so you hide the entrance behind a bookcase that swings on a hinge when you pull a certain book
  shot(13, C([430, 120, 2.0], [420, 170, 1.4]), function (u, d, t) {
    var pull = clamp((u - 0.6) / 0.4), op = clamp((u - 1.2) / 1.0), s = world(t, { lampPost: true, shelf: op, secret: true }) + basement(t, have({ ladder: true, n: 1 }));
    if (u > 0.4 && op < 0.1) s += '<g transform="translate(' + f(436 - pull * 8) + ' ' + (GY - 60) + ')">' + R(0, -8, 4, 14, "#f2c230", 1.4) + '</g>' + arrow(470, GY - 60, 440, GY - 60, "#fff", 2.6, clamp((u - 0.4) * 3));
    return s + tag("كتاب معين", 370, 78, u, 0.6, -3, 18, "#f2c230") + tag("مفصلة", 500, 60, u, 1.8, 3, 16);
  });
  add(14, { ladder: true });
  // 14 — but talking and banging in the basement carry upstairs and give you away
  shot(14, C([330, 200, 1.1], [330, 180, 1.3]), function (u, d, t) {
    var s = world(t, { lampPost: true, visitor: u > 1.4 ? "curious" : "n", vx: 330, ear: u > 1.4 }) + basement(t, have({ n: 1, mood: "happy" }));
    for (var k = 0; k < 4; k++) { var p = (t * 0.8 + k / 4) % 1, r = 10 + p * 60; s += '<path d="M' + f(310 - r) + ' ' + f(Y0 + 30 - p * 60) + ' Q310 ' + f(Y0 + 30 - p * 60 - r * 0.4) + ' ' + f(310 + r) + ' ' + f(Y0 + 30 - p * 60) + '" stroke="#fff" stroke-width="3" fill="none" opacity="' + f(1 - p) + '"/>'; }
    return s + tag("هيفضحك!", 230, 70, u, 1.6, 3, 22, "#f2a0a0") + qmark(380, 70, t, 26);
  });
  // 15 — so you pack the ceiling and walls with rock wool that soaks up the sound
  shot(15, C([330, 220, 1.4], [300, 230, 1.7]), function (u, d, t) {
    var wk = clamp((u - 0.3) / 1.6), s = world(t, { lampPost: true, visitor: "n", vx: 330 }) + basement(t, have({ wool: wk, n: 1 }));
    for (var k = 0; k < 4; k++) { var p = (t * 0.8 + k / 4) % 1, r = 10 + p * 40, yy = Y0 + 30 - p * 30; if (wk < 1 || yy > Y0 + 12) s += '<path d="M' + f(310 - r) + ' ' + f(yy) + ' Q310 ' + f(yy - r * 0.4) + ' ' + f(310 + r) + ' ' + f(yy) + '" stroke="#fff" stroke-width="3" fill="none" opacity="' + f((1 - p) * (1 - 0.7 * wk)) + '"/>'; }
    return s + tag("صوف صخري", 395, 230, u, 0.6, -3, 20, "#f2c94a") + check(420, 120, 0.5, (u - 2.2) / 0.6);
  });
  add(16, { wool: 1 });
  // 16 — but if someone shuts the bookcase on you from outside, you're trapped
  shot(16, C([400, 200, 1.4], [380, 230, 1.7]), function (u, d, t) {
    var sh = clamp(1 - (u - 0.3) / 0.6), s = world(t, { lampPost: true, shelf: sh, secret: true }) + basement(t, have({ n: 1, px: 400, mood: u > 1.2 ? "shock" : "n" }));
    if (u > 0.9 && u < 1.3) s += star(440, GY - 40, 14, t);
    return s + tag("محبوس!", 300, 250, u, 1.2, -3, 24, "#f2a0a0");
  });
  // 17 — so you make a small emergency hatch out to the garden
  shot(17, C([480, 240, 1.3], [520, 190, 1.2]), function (u, d, t) {
    return world(t, { lampPost: true }) + basement(t, have({ escape: clamp((u - 0.2) / 1.8), n: 1, px: 420 })) + tag("فتحة طوارئ", 560, 90, u, 2.0, 3, 20, "#bfe8c0");
  });
  add(18, { escape: 1 });
  // 18 — many think the most dangerous thing about a basement is someone finding it
  shot(18, C([330, 180, 0.95], [330, 210, 1.15]), function (u, d, t) {
    return world(t, { lampPost: true, visitor: "curious", vx: 300, ear: true }) + basement(t, have({ n: 1, mood: "worry" })) + qmark(300, 50, t, 32) + tag("حد يكتشفه؟", 450, 55, u, 0.8, 3, 20);
  });
  // 19 — really, a gas comes up from the ground itself, no smell, no colour: radon
  shot(19, C([330, 280, 1.2], [330, 260, 1.6]), function (u, d, t) {
    return world(t, { lampPost: true }) + basement(t, have({ cracks: true, radon: clamp((u - 0.4) / 1.4), n: 1, px: 240, mood: "n" })) + tag("الرادون", 345, Y0 + 32, u, 2.4, -3, 24, "#d9b0ff") + tag("ما بيتشمش", 230, 352, u, 1.2, 3, 14) + tag("ولا بيتشاف", 430, 352, u, 1.6, -3, 14);
  });
  // 20 — WHO: one of the biggest causes of lung cancer after smoking
  shot(20, function (u, d) { var k = clamp(u / d); return [320, lerp(170, 190, k), lerp(1.22, 1.0, k)]; }, function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1500" height="1000" fill="#f4efe2"/>', br = 1 + 0.07 * Math.sin(t * 3.2);
    for (var cl = 0; cl < 5; cl++) { var cp = (t * 0.12 + cl / 5) % 1; s += '<circle cx="' + f(lerp(-120, 760, cp)) + '" cy="' + f(60 + cl * 60 + Math.sin(t * 2 + cl) * 20) + '" r="' + f(50 + cl * 8) + '" fill="#c9a0e8" opacity=".28"/>'; }
    for (var g = 0; g < 8; g++) { var gp = (t * 0.3 + g / 8) % 1; s += '<circle cx="' + f(40 + g * 80 + Math.sin(t + g) * 10) + '" cy="' + f(lerp(360, 0, gp)) + '" r="' + f(3 + g % 3) + '" fill="#b07ad8" opacity="' + f(0.35 * Math.sin(gp * Math.PI)) + '"/>'; }
    s += '<g transform="translate(320 190) scale(' + f(br) + ')">' + P("M0 -110 V-50 M0 -50 Q-20 -40 -40 -30 M0 -50 Q20 -40 40 -30", INK, 6) + '<path d="M-14 -50 C-60 -60 -120 -20 -120 50 C-120 100 -60 110 -30 90 C-14 70 -14 10 -14 -50 Z" fill="#e88a8a" stroke="' + INK + '" stroke-width="3"/><path d="M14 -50 C60 -60 120 -20 120 50 C120 100 60 110 30 90 C14 70 14 10 14 -50 Z" fill="#e88a8a" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 0; k < 10; k++) { var a = hash(k + 5) * 6.28 + t * 0.8, rr = 20 + hash(k + 9) * 50; s += '<circle cx="' + f((k % 2 ? 1 : -1) * (60 + Math.cos(a) * rr * 0.6)) + '" cy="' + f(30 + Math.sin(a) * rr * 0.7) + '" r="3.4" fill="#b07ad8" opacity="' + f(0.3 + 0.7 * clamp(u - 0.6)) + '"/>'; }
    s += '</g>';
    s += '<g transform="translate(110 300)" opacity="' + f(clamp((u - 1.6) * 2)) + '">' + R(-44, -8, 88, 14, "#fbfbf7", 2, 3) + R(30, -8, 14, 14, "#e8a23a", 2) + P("M-50 -14 q-6 -10 2 -18 q8 -8 0 -16", "#aaa", 2) + '</g>' + T("1", 110, 270, 22, "#f2c230");
    s += '<g opacity="' + f(clamp((u - 2.4) * 2)) + '">' + '<circle cx="530" cy="296" r="16" fill="#b07ad8" stroke="' + INK + '" stroke-width="2"/>' + T("2", 530, 270, 22, "#f2c230") + '</g>';
    return s + tag("منظمة الصحة العالمية", 320, 40, u, 0.3, -2, 16) + tag("سرطان الرئة", 320, 322, u, 1.0, 3, 20, "#f2a0a0");
  });
  // 21 — so you seal the floor cracks and keep the fan running to push it out
  shot(21, C([260, 230, 1.15], [240, 200, 1.05]), function (u, d, t) {
    return world(t, { lampPost: true }) + basement(t, have({ cracks: true, sealed: u > 0.8, radon: 1, radonOut: true, n: 1 })) + tag("سد الشقوق", 350, 352, u, 0.8, -3, 18, "#e8c48e") + tag("المروحة شغالة", 160, 70, u, 2.0, 3, 16, "#d9b0ff");
  });
  add(22, { cracks: true, sealed: true });
  // 22 — most important: don't start without a structural engineer, your whole house is on top of you
  shot(22, C([330, 170, 0.95], [330, 150, 1.08]), function (u, d, t) {
    var s = world(t, { lampPost: true }) + basement(t, have({ n: 1, mood: "worry" }));
    for (var k = 0; k < 5; k++) s += arrow(170 + k * 75, 40, 170 + k * 75, GY + 30 + Math.sin(t * 4 + k) * 3, "#ffd23a", 4, clamp((u - 0.3) * 2 - k * 0.15));
    s += '<g transform="translate(560 ' + (GY - 4) + ')">' + engineer(0, 0, t, "happy", { s: 0.32 }) + '</g>' + R(590, GY - 60, 46, 34, "#3a6ab0", 1.8, 3) + P("M596 " + (GY - 50) + " h34 M596 " + (GY - 42) + " h24 M596 " + (GY - 34) + " h30", "#fff", 1.4);
    return s + tag("مهندس إنشائي", 560, 30, u, 0.8, 3, 18, "#f2c230") + tag("بيتك فوقك!", 245, 248, u, 2.0, -3, 18, "#f2a0a0");
  });
  // 23 — add LED lights, a sofa and a small camera to see who's upstairs
  shot(23, C([300, 255, 1.9], [380, 230, 1.6]), function (u, d, t) {
    return world(t, { lampPost: true, visitor: u > 2.4 ? "n" : null, vx: 360 }) + basement(t, have({ led: u > 0.2, sofa: u > 1.1, cam: u > 2.0, n: 1, px: 400 })) + tag("ليد", 245, Y0 + 26, u, 0.3, -3, 16, "#fff6c0") + tag("كنبة", 305, Y1 - 42, u, 1.2, 3, 16) + tag("كاميرا", 470, GY - 70, u, 2.1, 3, 16, "#bfe0ff");
  });
  add(24, { led: true, sofa: true, cam: true });
  // 24 — and congratulations, you've built a secret basement
  shot(24, C([330, 250, 1.6], [330, 170, 0.92]), function (u, d, t) {
    var s = world(t, { lampPost: true, visitor: "happy", vx: 320 }) + basement(t, have({ n: 1, px: 400, mood: "happy" }));
    for (var c = 0; c < 16; c++) { var p = (t * 0.6 + hash(c)) % 1, cx = X0 + hash(c + 2) * (X1 - X0), cy = Y0 + p * (Y1 - Y0); s += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="5" height="8" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; }
    return s + tag("مبروك!", 330, 20, u, 0.5, -3, 30, "#bfe8c0");
  });
  // 25 — outro
  shot(25, C([330, 180, 0.95], [330, 175, 1.05]), function (u, d, t) {
    return world(t, { lampPost: true, night: true }) + basement(t, have({ n: 1, px: 300, mood: "happy" })) + tag("قولولنا!", 330, 20, u, 0.4, 3, 30);
  });

  window.__parts = { world: world, basement: basement, have: have, setLine: function (n) { CUR = n; }, tag: tag, T: T, mini: mini, GY: GY, X0: X0, X1: X1, Y0: Y0, Y1: Y1 };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    CUR = i; var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
