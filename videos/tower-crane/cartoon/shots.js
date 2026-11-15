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
  // ── a hammerhead tower crane, side view, built part by part: a concrete pad with anchor bolts, lattice mast sections, a
  // slewing ring with gear + motor, the tower head with pendant ties, a long lattice jib with a trolley and hook, a short
  // counter-jib with concrete counterweight slabs and the hoist winch, a climbing frame with a hydraulic jack, ties to the
  // building, the cab, the red aviation light and the anemometer. Shapes after the real thing (../refs/SOURCES.md).
  var GY = 300, SEC = 26, MW = 22, MX = 250, JL = 260, CL = 92, YEL = "#f2c230", YELD = "#b8901c";
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function cross(x, y, s, t) { var k = 1 + 0.08 * Math.sin(t * 8); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * k) + ')"><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#e8352a" stroke-width="7" stroke-linecap="round"/></g>'; }
  function check(x, y, s, t) { var k = 1 + 0.06 * Math.sin(t * 6); return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * k) + ')"><path d="M-14 0 L-4 11 L16 -12" stroke="' + INK + '" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-14 0 L-4 11 L16 -12" stroke="#3aa05a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function guy(x, s, t, mood, o) { return hardHat(x, GY - 140 * s, s, t, mood, o); }

  // a square lattice mast section standing on yb (k: 0..1 it drops into place from above)
  function mastSec(x, yb, k, col) {
    k = k == null ? 1 : clamp(k); if (k <= 0) return ""; var y = yb - SEC - (1 - ease(k)) * 120, h = SEC, w = MW, c = col || YEL;
    return '<g opacity="' + f(Math.min(1, k * 3)) + '"><path d="M' + f(x - w / 2) + ' ' + f(y) + ' V' + f(y + h) + ' M' + f(x + w / 2) + ' ' + f(y) + ' V' + f(y + h) + '" stroke="' + INK + '" stroke-width="5"/><path d="M' + f(x - w / 2) + ' ' + f(y) + ' V' + f(y + h) + ' M' + f(x + w / 2) + ' ' + f(y) + ' V' + f(y + h) + '" stroke="' + c + '" stroke-width="3"/>' +
      '<path d="M' + f(x - w / 2) + ' ' + f(y + h) + ' L' + f(x + w / 2) + ' ' + f(y + h / 2) + ' L' + f(x - w / 2) + ' ' + f(y) + ' M' + f(x - w / 2) + ' ' + f(y) + ' H' + f(x + w / 2) + '" stroke="' + YELD + '" stroke-width="1.8" fill="none"/></g>';
  }
  // a horizontal triangular truss from x0 to x1 (either direction), top at y-h, bottom at y
  function truss(x0, x1, y, h, n) {
    var s = '<path d="M' + f(x0) + ' ' + f(y) + ' H' + f(x1) + ' M' + f(x0) + ' ' + f(y - h) + ' L' + f(x1) + ' ' + f(y - h * 0.35) + '" stroke="' + INK + '" stroke-width="4.4"/><path d="M' + f(x0) + ' ' + f(y) + ' H' + f(x1) + ' M' + f(x0) + ' ' + f(y - h) + ' L' + f(x1) + ' ' + f(y - h * 0.35) + '" stroke="' + YEL + '" stroke-width="2.6"/>', d = "";
    for (var i = 0; i < n; i++) { var a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 0.5) / n, c = x0 + (x1 - x0) * (i + 1) / n, ht = function (xx) { return y - h * (1 - 0.65 * (xx - x0) / (x1 - x0 || 1)); }; d += 'M' + f(a) + ' ' + f(y) + ' L' + f(b) + ' ' + f(ht(b)) + ' L' + f(c) + ' ' + f(y) + ' '; }
    return s + '<path d="' + d + '" stroke="' + YELD + '" stroke-width="1.6" fill="none"/>';
  }
  function hookBlock(x, y, load) {
    var s = R(x - 6, y - 8, 12, 10, "#c23a26", 1.6, 2) + '<path d="M' + f(x) + ' ' + f(y + 2) + ' v5 a5 5 0 1 1 -6 4" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    if (load) { var w = load.w || 40, h = load.h || 16; s += '<path d="M' + f(x) + ' ' + f(y + 8) + ' L' + f(x - w / 2 + 4) + ' ' + f(y + 22) + ' M' + f(x) + ' ' + f(y + 8) + ' L' + f(x + w / 2 - 4) + ' ' + f(y + 22) + '" stroke="#3a3d42" stroke-width="1.4"/>';
      if (load.sec) { s += mastSec(x, y + 22 + SEC, 1); }
      else { s += R(x - w / 2, y + 22, w, h, load.col || "#8a6a4a", 1.8); for (var i = 1; i < 4; i++) s += '<path d="M' + f(x - w / 2) + ' ' + f(y + 22 + h * i / 4) + ' h' + w + '" stroke="#5a4030" stroke-width="1"/>'; if (load.txt) s += T(load.txt, x, y + 22 + h + 14, 13, "#ffd27a"); } }
    return s;
  }
  // the whole crane. o: {x, n, gap, tilt, top, jib, cj, cw, phi, tr, hook, load, cab, light, anemo, climb, jack, ties, sensor, mood, gear, brake}
  function crane(t, o) {
    o = o || {}; var x = o.x == null ? MX : o.x, n = o.n == null ? 6 : o.n, gap = o.gap || 0, s = "", yTop = GY - Math.floor(n) * SEC - gap;
    var tilt = o.tilt || 0; s += '<g transform="rotate(' + f(tilt) + ' ' + f(x + (tilt >= 0 ? MW / 2 : -MW / 2)) + ' ' + GY + ')">';
    for (var i = 0; i < Math.ceil(n); i++) s += mastSec(x, GY - i * SEC, i < Math.floor(n) ? 1 : n - Math.floor(n));
    if (o.climb) {   // the climbing frame round the top section, with the hydraulic jack
      var cy = yTop + 8; s += R(x - MW / 2 - 8, cy, MW + 16, SEC + 14, "none", 0) + '<path d="M' + f(x - MW / 2 - 7) + ' ' + f(cy) + ' V' + f(GY - (Math.floor(n) - 1) * SEC) + ' M' + f(x + MW / 2 + 7) + ' ' + f(cy) + ' V' + f(GY - (Math.floor(n) - 1) * SEC) + '" stroke="' + INK + '" stroke-width="6"/><path d="M' + f(x - MW / 2 - 7) + ' ' + f(cy) + ' V' + f(GY - (Math.floor(n) - 1) * SEC) + ' M' + f(x + MW / 2 + 7) + ' ' + f(cy) + ' V' + f(GY - (Math.floor(n) - 1) * SEC) + '" stroke="#e8742e" stroke-width="4"/>';
      var jb = GY - (Math.floor(n) - 1) * SEC, jt = yTop + 4; s += R(x - MW / 2 - 14, jb - 26, 7, 26, "#7a828c", 1.4) + R(x - MW / 2 - 13, jt, 5, jb - 26 - jt, "url(#steel)", 1.2);
    }
    if (o.ties) o.ties.forEach(function (ty) { var yy = GY - ty * SEC - SEC / 2; s += '<path d="M' + f(x + MW / 2) + ' ' + f(yy) + ' L' + f(x + 52) + ' ' + f(yy - 8) + ' M' + f(x + MW / 2) + ' ' + f(yy) + ' L' + f(x + 52) + ' ' + f(yy + 8) + '" stroke="' + INK + '" stroke-width="5"/><path d="M' + f(x + MW / 2) + ' ' + f(yy) + ' L' + f(x + 52) + ' ' + f(yy - 8) + ' M' + f(x + MW / 2) + ' ' + f(yy) + ' L' + f(x + 52) + ' ' + f(yy + 8) + '" stroke="#e8742e" stroke-width="3"/>' + R(x - MW / 2 - 3, yy - 4, MW + 6, 8, "#e8742e", 1.6); });
    if (o.top) {
      var c = o.phi == null ? 1 : Math.cos(o.phi), jl = JL * (o.jib == null ? 1 : o.jib), g = '<g transform="translate(' + f(x) + ' ' + f(yTop) + ')">';
      var flip = c < 0 ? -1 : 1, ac = Math.max(0.06, Math.abs(c));
      // counter-jib + counterweights + winch (drawn first: behind)
      if (o.cj) { var ce = -12 - CL * ac; g += '<g transform="scale(' + flip + ' 1)">' + truss(-12, ce, -14, 10, 4) + R(ce + 14, -26, 22 * ac + 4, 12, "#3f6f8f", 1.6, 2) + '<circle cx="' + f(ce + 25 * ac + 2) + '" cy="-20" r="4" fill="#c9ced4" stroke="' + INK + '"/>';
        var nw = o.cw || 0; for (var b = 0; b < Math.ceil(nw); b++) { var kb = b < Math.floor(nw) ? 1 : nw - Math.floor(nw), by = -12 + (1 - ease(kb)) * -90; g += '<g opacity="' + f(Math.min(1, kb * 3)) + '">' + R(ce + 2 + b * 7 * ac, by, 6 * ac + 2, 34, "url(#gConc)", 1.4) + '</g>'; }
        g += '<path d="M0 -58 L' + f(ce + 4) + ' -24" stroke="' + INK + '" stroke-width="1.8"/></g>'; }
      // slewing ring (gear + motor)
      var ga = (o.gear || 0) * 360; g += R(-16, -10, 32, 10, "#3a3d42", 2) + '<g transform="translate(0 -5)">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { var a = (k * 45 + ga) * Math.PI / 180, xx = Math.cos(a) * 14; return Math.sin(a) > 0 ? '<rect x="' + f(xx - 1.5) + '" y="-4" width="3" height="8" fill="' + YEL + '"/>' : ""; }).join("") + '</g>';
      if (o.motor) g += R(-30, -16, 12, 12, "#2f6f9f", 1.6, 2) + '<circle cx="-24" cy="-10" r="3" fill="' + (Math.sin(t * 12) > 0 ? "#7cf29a" : "#2b2f34") + '"/>';
      // tower head (A-frame)
      g += '<path d="M-10 -12 L0 -58 L10 -12" stroke="' + INK + '" stroke-width="5" fill="none"/><path d="M-10 -12 L0 -58 L10 -12" stroke="' + YEL + '" stroke-width="3" fill="none"/><path d="M-6 -30 H6 M-3 -44 H3" stroke="' + YELD + '" stroke-width="1.6"/>';
      if (o.cab) g += '<g transform="scale(' + flip + ' 1)">' + R(10, -30, 22 * ac + 2, 18, "#f4f1e8", 1.8, 3) + R(13, -27, 16 * ac + 1, 9, "#8fc2da", 1.2) + (ac > 0.4 ? '<g transform="translate(' + f(13 + 8 * ac) + ' -21) scale(.32)">' + head(0, 0, 14, o.mood || "happy", t) + '</g>' : "") + '</g>';
      // jib + pendant + trolley + hook
      if (o.jib == null || o.jib > 0) { g += '<g transform="scale(' + flip + ' 1)">' + truss(12, 12 + jl * ac, -14, 12, Math.max(3, Math.round(12 * (o.jib == null ? 1 : o.jib)))) + '<path d="M0 -58 L' + f(12 + jl * 0.55 * ac) + ' -26" stroke="' + INK + '" stroke-width="1.8"/></g>';
        if (o.tr != null) { var tx = flip * (12 + (18 + o.tr * (jl - 34)) * ac), hy = -14 + (o.hook == null ? 60 : o.hook); g += R(tx - 7, -18, 14, 7, "#3a3d42", 1.4, 2) + '<path d="M' + f(tx - 2) + ' -11 V' + f(hy - 8) + ' M' + f(tx + 2) + ' -11 V' + f(hy - 8) + '" stroke="#2a2a2a" stroke-width="1.2"/>' + hookBlock(tx, hy, o.load); } }
      if (o.sensor) { var red = o.sensor === "warn" && Math.sin(t * 14) > 0; g += R(-8, -42, 16, 11, "#2b2f34", 1.4, 2) + '<circle cx="0" cy="-36.5" r="3.4" fill="' + (o.sensor === "warn" ? (red ? "#ff3b2f" : "#5a1a14") : "#7cf29a") + '"' + (red ? ' filter="url(#glow)"' : "") + '/>'; }
      if (o.light) g += '<circle cx="0" cy="-61" r="7" fill="#ff3b2f" opacity="' + f(0.25 + 0.6 * (Math.sin(t * 5) > 0 ? 1 : 0)) + '" filter="url(#glow)"/><circle cx="0" cy="-61" r="3.4" fill="#ff5a4a" stroke="' + INK + '" stroke-width="1"/>';
      if (o.anemo) { var aa = t * 14; g += '<path d="M6 -58 V-72" stroke="' + INK + '" stroke-width="1.6"/>' + [0, 1, 2].map(function (k) { var a = aa + k * 2.09, xx = 6 + Math.cos(a) * 7; return '<path d="M6 -72 L' + f(xx) + ' -72" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + f(xx) + '" cy="-72" r="2.2" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1"/>'; }).join(""); }
      if (o.brake) g += '<g transform="translate(-24 -44)">' + (o.brake === "on" ? '<path d="M-5 -2 v-5 a5 5 0 0 1 10 0 v5" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' : '<path d="M-5 -2 v-5 a5 5 0 0 1 10 0" stroke="' + INK + '" stroke-width="2.4" fill="none" transform="rotate(-30 5 -7)"/>') + R(-8, -2, 16, 12, o.brake === "on" ? "#e8352a" : "#3aa05a", 1.6, 2) + '</g>';
      s += g + '</g>';
    }
    return s + '</g>';
  }
  // the site: sky, a far skyline, the ground with a section through it, the concrete pad (pad: 0..1 poured) and anchor bolts
  function site(t, o) {
    o = o || {}; var kind = o.sky || "day", s = sky(kind) + (kind === "night" ? stars(t) + moon(560, 40) : clouds(t, 10, -10, 5, 0.85)) + city(t, GY - 2, 70, kind === "night" ? "#22314a" : "#a9b6c2", kind === "night" ? "#ffd98a" : "#e9eef2", 7, kind === "night") + birds(t, 30, 24);
    if (kind !== "night") s += cars(t, GY - 3, 55);
    s += '<rect x="-400" y="' + GY + '" width="1440" height="400" fill="url(#gSoil)"/><path d="M-400 ' + GY + ' H1040" stroke="' + INK + '" stroke-width="3"/>';
    for (var i = 0; i < 40; i++) s += '<ellipse cx="' + f(-300 + hash(i) * 1240) + '" cy="' + f(GY + 14 + hash(i + 7) * 60) + '" rx="' + f(3 + hash(i + 2) * 5) + '" ry="1.6" fill="#000" opacity=".12"/>';
    var p = o.pad == null ? 1 : clamp(o.pad), PW = 120, PH = 32;
    if (o.pit !== false) { s += R(MX - PW / 2 - 4, GY, PW + 8, PH + 4, "#6a5440", 2); if (p > 0) s += '<rect x="' + f(MX - PW / 2) + '" y="' + f(GY + PH * (1 - p)) + '" width="' + PW + '" height="' + f(PH * p) + '" fill="url(#gConc)"/>' + (p < 1 ? '<path d="M' + f(MX - PW / 2) + ' ' + f(GY + PH * (1 - p)) + ' q15 ' + f(Math.sin(t * 6) * 3) + ' 30 0 t30 0 t30 0 t30 0" stroke="#8a857a" stroke-width="2" fill="none"/>' : ""); }
    if (o.bolts) { var bk = clamp(o.bolts); [-8, 8].forEach(function (bx) { s += '<rect x="' + f(MX + bx - 2) + '" y="' + f(GY + 2 - 10 * bk) + '" width="4" height="26" fill="url(#steel)" stroke="' + INK + '" stroke-width="1"/>'; }); }
    if (o.dirt !== false) for (var j = 0; j < 6; j++) s += '<ellipse cx="' + f(MX - 160 + j * 18 + (j > 2 ? 230 : 0)) + '" cy="' + GY + '" rx="14" ry="6" fill="#8a6a4a" stroke="' + INK + '" stroke-width="1.2"/>';
    return s;
  }
  // the building going up beside the crane (floors, k of the top one)
  function bldg(t, fl, x) {
    x = x == null ? MX + 52 : x; var s = "", H = 18, W = 170, n = Math.floor(fl), k = fl - n;
    for (var i = 0; i < Math.ceil(fl); i++) { var y = GY - (i + 1) * H, kk = i < n ? 1 : k; s += '<g opacity="' + f(Math.min(1, kk * 2)) + '">' + R(x, y + H * (1 - kk), W, H * kk, "#cfc8bb", 1.6); if (kk >= 1) for (var w = 0; w < 7; w++) s += '<rect x="' + f(x + 8 + w * 23) + '" y="' + f(y + 5) + '" width="13" height="8" fill="' + (hash(i * 7 + w + Math.floor(t * 0.5)) > 0.8 ? "#ffd98a" : "#6f8aa0") + '"/>'; s += '</g>'; }
    return s;
  }
  // a mobile (truck) crane on the left, boom angle a (deg up from horizontal), boom length bl; returns the hook point too
  function truckCrane(t, x, a, bl, hang, load) {
    var s = '<g transform="translate(' + f(x) + ' ' + GY + ')">' + R(-60, -26, 120, 18, "#e2b035", 2, 3) + R(30, -46, 30, 22, "#e2b035", 2, 3) + R(36, -42, 18, 10, "#8fc2da", 1.2);
    [-44, -20, 20, 44].forEach(function (wx) { s += '<g transform="translate(' + wx + ' -6) rotate(' + f(t * 90) + ')"><circle r="8" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.6"/><path d="M-5 0 H5 M0 -5 V5" stroke="#9aa2ac" stroke-width="1.6"/></g>'; });
    s += R(-70, -12, 10, 12, "#5a6068", 1.4) + R(60, -12, 10, 12, "#5a6068", 1.4);
    var r = a * Math.PI / 180, ex = -30 + Math.cos(r) * bl, ey = -34 - Math.sin(r) * bl;
    s += '<path d="M-30 -34 L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-30 -34 L' + f(ex) + ' ' + f(ey) + '" stroke="#e2b035" stroke-width="6" stroke-linecap="round"/><path d="M-30 -34 L' + f(-30 + Math.cos(r) * bl * 0.55) + ' ' + f(-34 - Math.sin(r) * bl * 0.55) + '" stroke="#c99a20" stroke-width="3"/>';
    s += R(-40, -40, 22, 14, "#e2b035", 1.6, 2) + '<path d="M' + f(ex) + ' ' + f(ey) + ' V' + f(ey + hang) + '" stroke="#2a2a2a" stroke-width="1.4"/>' + hookBlock(ex, ey + hang, load);
    return s + '</g>';
  }
  function wind(t, y0, y1, n, sp, col) { var s = ""; for (var i = 0; i < n; i++) { var u = ((t * sp + hash(i) ) % 1), x = -100 + u * 840, y = y0 + hash(i + 3) * (y1 - y0) + Math.sin(u * 8 + i) * 4; s += '<path d="M' + f(x) + ' ' + f(y) + ' q20 -6 40 0 t40 0" stroke="' + (col || "#fff") + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="' + f(Math.sin(Math.PI * u) * 0.85) + '"/>'; } return s; }
  function scale(x, y, s, tip, t) { var a = tip + Math.sin(t * 2) * 1.5; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 0 V-50 M-16 4 H16" stroke="' + INK + '" stroke-width="4"/><g transform="translate(0 -50) rotate(' + f(a) + ')"><path d="M-40 0 H40" stroke="' + INK + '" stroke-width="4"/><path d="M-40 0 l-12 22 h24 Z M40 0 l-12 22 h24 Z" fill="#e8c48e" stroke="' + INK + '" stroke-width="2"/></g></g>'; }
  function vane(x, y, s, t, ang) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 0 V-40" stroke="' + INK + '" stroke-width="3"/><g transform="translate(0 -40) scale(' + f(Math.cos(ang)) + ' 1)"><path d="M-26 0 H22 M22 0 l-8 -5 M22 0 l-8 5" stroke="' + INK + '" stroke-width="3" fill="none"/><path d="M-26 0 l-8 -10 h10 l6 10 l-6 10 h-10 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-4" cy="-12" r="5" fill="' + YEL + '" stroke="' + INK + '" stroke-width="1.4"/></g></g>'; }
  function dust(t, x, y, k) { var s = ""; for (var i = 0; i < 12; i++) { var q = (t * 1.3 + i / 12) % 1; s += '<circle cx="' + f(x + (hash(i) - 0.5) * 220 * (0.4 + q)) + '" cy="' + f(y - q * 70) + '" r="' + f(8 + q * 22) + '" fill="#b89a78" opacity="' + f(0.95 * (1 - q) * k) + '" filter="url(#soft2)"/>'; } return s; }
  function full(t, o) { return Object.assign({ n: 6, top: true, cj: true, cw: 4, tr: 0.5, hook: 70, cab: true, light: true, anemo: true, gear: t * 0.05 }, o || {}); }
  function cmv(x0, y0, z0, x1, y1, z1) { return function (u, d) { var k = 0.4 * ease(clamp(u / d)) + 0.6 * clamp(u / d); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }; }

  // 0 — a long steel arm on top of a tall pole: is that a tower crane?
  shot(0, cmv(330, 170, 1.25, 320, 190, 1.0), function (u, d, t) {
    return site(t, { pit: false, dirt: false }) + crane(t, { n: 6, top: true, tr: 0.75 + 0.05 * Math.sin(t), hook: 80 + 6 * Math.sin(t * 1.4), load: { w: 46, h: 16, col: "#8a6a4a" } }) + guy(150, 0.24, t, "curious") + qmark(150, GY - 74, t, 28) + tag("ونش برجي؟", 410, 70, u, 0.8, -3, 24);
  });
  // 1 — no: the first heavy load tips the whole pole over
  shot(1, cmv(330, 190, 1.0, 360, 210, 1.1), function (u, d, t) {
    var k = ease(clamp((u - 0.9) / 1.6)), tl = k * 58 + (k >= 1 ? Math.sin(t * 9) * 0.5 : 0);
    return site(t, { pit: false, dirt: false }) + crane(t, { n: 6, top: true, tr: 0.8, hook: 80, load: { w: 60, h: 22, col: "#6a5a4a", txt: "حمل تقيل" }, tilt: tl }) + guy(130, 0.24, t, k > 0.2 ? "shock" : "worry") + (k > 0.6 ? cross(420, 120, 1.5, t) + dust(t, 470, GY - 4, k) : "");
  });
  // 2 — so you start under the ground: a concrete pad 10 m by 10 m, about 180 tonnes
  shot(2, cmv(250, 280, 1.9, 250, 290, 2.1), function (u, d, t) {
    var p = ease(clamp((u - 0.4) / (d * 0.6))), s = site(t, { pad: p });
    for (var i = 0; i < 6; i++) { var q = (t * 1.6 + i / 6) % 1; if (p < 1) s += '<circle cx="' + f(MX - 30 + i * 12) + '" cy="' + f(GY - 40 + q * 50) + '" r="3" fill="#a7a198" stroke="' + INK + '" stroke-width=".8"/>'; }
    s += '<path d="M' + (MX - 40) + ' ' + (GY - 60) + ' L' + (MX - 10) + ' ' + (GY - 14) + '" stroke="#5a6068" stroke-width="8" stroke-linecap="round"/>' + '<path d="M' + (MX - 64) + ' ' + (GY + 44) + ' H' + (MX + 64) + '" stroke="' + INK + '" stroke-width="1.6"/><path d="M' + (MX - 64) + ' ' + (GY + 40) + ' v8 M' + (MX + 64) + ' ' + (GY + 40) + ' v8" stroke="' + INK + '" stroke-width="1.6"/>';
    return s + tag("10 × 10 متر", MX, GY + 54, u, 1.4, -2, 15) + tag("180 طن", MX + 70, GY - 40, u, d * 0.6, 3, 17, "#f2c230");
  });
  // 3 — you fix the first tower section to it with huge bolts buried in the concrete
  shot(3, cmv(250, 270, 2.2, 250, 255, 2.0), function (u, d, t) {
    var bk = ease(clamp(u / 1.0)), mk = clamp((u - 1.0) / 1.4), s = site(t, { bolts: 1 }) + crane(t, { n: mk, top: false });
    if (bk < 1) s += '<path d="M' + (MX - 6) + ' ' + f(GY - 30 + bk * 20) + ' v-10 M' + (MX + 10) + ' ' + f(GY - 30 + bk * 20) + ' v-10" stroke="#fff" stroke-width="2"/>';
    if (mk >= 1) for (var g = 0; g < 2; g++) s += '<circle cx="' + (MX - 8 + g * 16) + '" cy="' + (GY - 3) + '" r="' + f(2 + 2 * Math.abs(Math.sin(t * 5 + g))) + '" fill="#fff" opacity=".8"/>';
    return s + tag("مسامير ضخمة", MX - 80, GY - 40, u, 0.5, -3, 15);
  });
  // 4 — but this tower is tall: who lifts its pieces up there?
  shot(4, cmv(250, 250, 1.6, 270, 180, 1.0), function (u, d, t) {
    var s = site(t, {}) + crane(t, { n: 1, top: false });
    for (var i = 1; i < 6; i++) s += '<rect x="' + (MX - MW / 2) + '" y="' + (GY - (i + 1) * SEC) + '" width="' + MW + '" height="' + SEC + '" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" opacity="' + f(0.5 + 0.4 * Math.sin(t * 4 + i)) + '"/>';
    var up = (t * 0.8) % 1; s += arrow(MX + 40, GY - 20 - up * 150, MX + 40, GY - 70 - up * 150, "#f2c230", 8, 1) + arrow(MX - 40, GY - 20 - ((up + 0.5) % 1) * 150, MX - 40, GY - 70 - ((up + 0.5) % 1) * 150, "#f2c230", 8, 1).replace(/<path/g, '<path opacity="' + f(Math.sin(Math.PI * up)) + '"');
    return s + guy(170, 0.24, t, "curious", { look: 1 }) + qmark(MX, GY - 180, t, 34) + tag("مين يرفعه؟", 380, 120, u, 0.6, 3, 22);
  });
  // 5 — so you bring a truck crane that stacks the first few sections
  shot(5, cmv(180, 200, 1.0, 240, 225, 1.5), function (u, d, t) {
    var k = clamp(u / (d * 1.02)) * 3, i = Math.min(2, Math.floor(k)), q = k >= 3 ? 1 : k - i, placed = 1 + i, ey = -34 - Math.sin(34 * Math.PI / 180) * 230;
    function target(n) { return -n * SEC - SEC - 22 - ey; }
    var on = q < 0.72, n = on ? placed : placed + 1, hang = on ? lerp(6, target(placed), ease(clamp(q / 0.6))) : lerp(target(placed + 1) + SEC, 6, clamp((q - 0.72) / 0.28));
    if (k >= 3) { n = 4; hang = 6; on = false; }
    var top = GY - n * SEC, burst = ""; for (var b = 0; b < 10; b++) { var ang = b * 0.628 + t * 1.5, r0 = 18 + 6 * Math.sin(t * 6 + b); burst += '<path d="M' + f(MX + Math.cos(ang) * r0) + ' ' + f(top + Math.sin(ang) * r0) + ' l' + f(Math.cos(ang) * 10) + ' ' + f(Math.sin(ang) * 10) + '" stroke="#ffd84a" stroke-width="3.4" stroke-linecap="round"/>'; }
    return site(t, {}) + crane(t, { n: n, top: false }) + (on ? "" : burst) + truckCrane(t, 90, 34, 230, hang, on ? { sec: true } : null) + tag("ونش عربية", 90, GY - 60, u, 0.5, -3, 18) + guy(400, 0.22, t, "happy", { point: true });
  });
  // 6 — but the load on the jib keeps pulling the whole crane forward
  shot(6, cmv(330, 180, 0.95, 380, 170, 1.05), function (u, d, t) {
    var k = ease(clamp((u - 0.6) / 1.6)), tl = k * 9 + Math.sin(t * 7) * 0.6 * k;
    return site(t, {}) + crane(t, { n: 6, top: true, tr: 0.85, hook: 70, load: { w: 50, h: 18, col: "#6a5a4a" }, tilt: tl }) + arrow(470, 150, 470, 230, "#e8352a", 7, clamp((u - 0.3) / 0.8)) + (k > 0.5 ? cross(300, 60, 1.2, t) : "") + guy(130, 0.24, t, k > 0.3 ? "shock" : "n");
  });
  // 7 — so you build a short counter-jib at the back and stack heavy concrete blocks on it
  shot(7, cmv(200, 170, 1.7, 180, 175, 1.5), function (u, d, t) {
    var cj = u > 0.3, cw = clamp((u - 1.0) / (d - 1.4)) * 4;
    return site(t, {}) + crane(t, { n: 6, top: true, cj: cj, cw: cw, tr: 0.5, hook: 60 }) + tag("دراع ورا", 150, 100, u, 0.4, -3, 15) + tag("بلوكات خرسانة", 165, 222, u, 1.2, 3, 15);
  });
  // 8 — those blocks can reach 20 tonnes and balance the load like the two pans of a scale
  shot(8, cmv(320, 170, 1.0, 330, 175, 0.95), function (u, d, t) {
    var tr = 0.55 + 0.25 * Math.sin(t * 0.9);
    return site(t, {}) + crane(t, full(t, { cab: false, light: false, anemo: false, tr: tr, load: { w: 44, h: 16 } })) + arrow(176, 120, 176, 180, "#e8352a", 6, clamp((u - 0.4) / 0.6)) + arrow(MX + 12 + (18 + tr * (JL - 34)), 104, MX + 12 + (18 + tr * (JL - 34)), 144, "#e8352a", 6, clamp((u - 0.8) / 0.6)) + tag("20 طن", 176, 230, u, 0.5, -3, 18, "#f2c230") + scale(560, 290, 1, 0, t) + check(560, 210, 1.1, t);
  });
  // 9 — but the crane has to reach every spot on the site (seen from above, a fixed jib only covers one line)
  shot(9, cmv(320, 180, 1.0, 320, 180, 1.12), function (u, d, t) {
    var s = '<rect x="-400" y="-300" width="1440" height="960" fill="#a89a7a"/>';
    for (var i = 0; i < 5; i++) { var bx = [130, 470, 200, 450, 330][i], by = [90, 80, 270, 270, 300][i]; s += R(bx - 40, by - 25, 80, 50, "#cfc8bb", 2) + R(bx - 30, by - 15, 60, 30, "#bdb4a4", 1); }
    s += '<circle cx="320" cy="180" r="170" fill="#f2c230" opacity=".12" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>';
    s += '<path d="M320 180 H490" stroke="' + INK + '" stroke-width="10"/><path d="M320 180 H490" stroke="' + YEL + '" stroke-width="6"/>' + R(306, 166, 28, 28, "#3a3d42", 2) + '<path d="M320 180 H264" stroke="' + INK + '" stroke-width="8"/><path d="M320 180 H264" stroke="' + YEL + '" stroke-width="4"/>';
    [[130, 90], [200, 270], [450, 270]].forEach(function (p, j) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f(10 + 4 * Math.sin(t * 5 + j)) + '" fill="none" stroke="#e8352a" stroke-width="3"/>'; if (u > 0.8 + j * 0.4) s += cross(p[0] + 26, p[1] - 22, 0.6, t); });
    return s + tag("من فوق", 320, 30, u, 0.3, -2, 16);
  });
  // 10 — so you put a big gear and a motor on top of the tower: they turn both arms a full circle
  shot(10, cmv(250, 150, 2.6, 270, 160, 1.0), function (u, d, t) {
    var sp = clamp((u - 1.2) / 1.0), ph = (u > 1.2 ? (u - 1.2) * 1.4 : 0) * sp;
    return site(t, {}) + crane(t, { n: 6, top: true, cj: true, cw: 4, tr: 0.5, hook: 60, motor: true, gear: t * 0.6, phi: ph }) + curl(MX, GY - 6 * SEC - 6, 60, 0.3, 5.9, "#f2c230", 4, clamp((u - 1.2) / 1.6)) + tag("ترس + موتور", MX - 20, GY - 6 * SEC + 34, u, 0.4, -3, 13);
  });
  // 11 — but you still need to bring the load closer to the tower and push it out
  shot(11, cmv(380, 170, 1.15, 400, 175, 1.25), function (u, d, t) {
    var lx = MX + 12 + JL * 0.86;
    return site(t, {}) + crane(t, { n: 6, top: true, cj: true, cw: 4, phi: 0, gear: t * 0.05 }) + '<path d="M' + f(lx) + ' ' + (GY - 6 * SEC - 14) + ' V' + (GY - 60) + '" stroke="#2a2a2a" stroke-width="1.4"/>' + hookBlock(lx, GY - 60, { w: 40, h: 16 }) + arrow(lx - 30, GY - 40, lx - 110, GY - 40, "#f2c230", 6, clamp(Math.sin(t * 2) * 0.5 + 0.5)) + qmark(lx - 70, GY - 70, t, 26) + guy(160, 0.24, t, "curious");
  });
  // 12 — so you fit a small trolley that runs along the jib, with the hook hanging from it on the cable
  shot(12, cmv(420, 160, 1.7, 370, 175, 1.2), function (u, d, t) {
    var tr = 0.5 + 0.42 * Math.sin(t * 1.1);
    return site(t, {}) + crane(t, { n: 6, top: true, cj: true, cw: 4, tr: tr, hook: 62 + 10 * Math.sin(t * 0.7), load: { w: 40, h: 16 } }) + tag("عربية + خطاف", 420, 98, u, 0.5, -3, 16);
  });
  // 13 — but the farther out the load goes, the harder it pulls the crane over
  shot(13, cmv(340, 175, 1.0, 360, 180, 1.05), function (u, d, t) {
    var tr = clamp(u / (d * 0.85)), lx = MX + 12 + (18 + tr * (JL - 34));
    return site(t, {}) + crane(t, full(t, { cab: false, light: false, anemo: false, tr: tr, load: { w: 44, h: 16 }, tilt: tr * tr * 3 + Math.sin(t * 8) * 0.3 * tr })) + curl(lx, 220, 34 + tr * 30, -1.2, 2.2, "#e8352a", 3 + tr * 3, clamp(u / 0.8)) + tag("بيشد أقوى", 470, 70, u, 1.0, 3, 18, tr > 0.6 ? "#f2a0a0" : "#e8c48e");
  });
  // 14 — a load you lift easily next to the tower can bring the crane down at the end of the jib
  shot(14, cmv(340, 180, 1.0, 360, 190, 1.05), function (u, d, t) {
    var mv = ease(clamp((u - 1.0) / 1.2)), tr = lerp(0.08, 1, mv), k = ease(clamp((u - 2.0) / 1.2)), lx = MX + 12 + (18 + tr * (JL - 34));
    return site(t, {}) + crane(t, full(t, { cab: false, light: false, anemo: false, tr: tr, load: { w: 54, h: 20, col: "#6a5a4a" }, tilt: k * 16 })) + (u < 1.2 ? check(MX + 70, 110, 1.1, t) : "") + (k > 0.3 ? cross(lx, 100, 1.3, t) : "") + guy(120, 0.24, t, k > 0.2 ? "shock" : "happy");
  });
  // 15 — so sensors compute weight × distance and stop the crane on their own past the limit
  shot(15, cmv(300, 140, 2.0, 320, 160, 1.3), function (u, d, t) {
    var tr = Math.min(0.78, clamp(u / (d * 0.6))), warn = tr >= 0.78;
    var s = site(t, {}) + crane(t, full(t, { light: false, anemo: false, tr: tr, load: { w: 48, h: 18, col: "#6a5a4a" }, sensor: warn ? "warn" : "ok", mood: warn ? "shock" : "n" }));
    s += '<g transform="translate(390 205)">' + R(-70, -34, 140, 60, "#2b2f34", 2.4, 6) + T("وزن × مسافة", 0, -10, 14, "#fff") + R(-56, 2, 112, 12, "#1c1c1c", 1, 3) + '<rect x="-55" y="3" width="' + f(110 * tr / 0.78) + '" height="10" rx="3" fill="' + (warn ? "#e8352a" : "#3aa05a") + '"/></g>';
    return s + (warn ? T("STOP", 390, 254, 18, "#ff5a4a") : "") + tag("حساسات", MX - 50, GY - 6 * SEC - 70, u, 0.5, -3, 15);
  });
  // 16 — but the building climbs every few weeks, and the crane must stay above it
  shot(16, cmv(330, 180, 1.0, 340, 150, 0.9), function (u, d, t) {
    var fl = 4 + clamp(u / (d * 0.9)) * 4.5;
    return site(t, {}) + bldg(t, fl) + crane(t, full(t, { tr: 0.4, hook: 50 })) + guy(120, 0.24, t, fl > 7.5 ? "worry" : "curious") + (fl > 7.5 ? T("!", 400, GY - 6 * SEC - 20, 30, "#ff8a7e") : "");
  });
  // 17 — so the crane grows by itself: a hydraulic jack pushes the top part up six metres
  shot(17, cmv(250, 140, 1.8, 260, 140, 1.6), function (u, d, t) {
    var g = ease(clamp((u - 0.8) / (d - 1.4))) * SEC;
    return site(t, {}) + bldg(t, 8.5) + crane(t, full(t, { tr: 0.15, hook: 30, gap: g, climb: true })) + (g > 4 ? '<path d="M' + (MX + MW / 2 + 16) + ' ' + f(GY - 6 * SEC - g) + ' V' + (GY - 6 * SEC) + '" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>' : "") + tag("6 متر", MX + 60, GY - 6 * SEC - 14, u, 1.6, 3, 15, "#f2c230") + tag("جاك هيدروليك", MX - 70, GY - 4 * SEC, u, 0.5, -3, 14);
  });
  // 18 — then the crane lifts a new tower section itself and slides it into the gap below
  shot(18, cmv(290, 150, 1.4, 270, 140, 1.4), function (u, d, t) {
    var a = clamp(u / (d * 0.5)), b = ease(clamp((u - d * 0.5) / (d * 0.35))), tr = lerp(0.5, 0.02, ease(a)), done = b >= 1;
    var s = site(t, {}) + bldg(t, 8.5) + crane(t, full(t, { n: done ? 7 : 6, gap: done ? 0 : SEC, climb: !done, tr: tr, hook: done ? 40 : lerp(150, 64, ease(a)), load: done ? null : (b > 0 ? null : { sec: true }) }));
    if (b > 0 && !done) s += '<g transform="translate(' + f(lerp(36, 0, b)) + ' 0)">' + mastSec(MX, GY - 6 * SEC, 1, "#ffd84a") + '</g>';
    return s + (done ? check(MX + 40, GY - 6 * SEC + 6, 0.9, t) : "") + tag("قطعة جديدة", MX + 80, GY - 3 * SEC, u, 0.5, 3, 14);
  });
  // 19 — but when the tower gets very tall, the wind starts to shake it
  shot(19, cmv(320, 130, 0.8, 320, 120, 0.85), function (u, d, t) {
    var sw = Math.sin(t * 3.2) * 2.4 * clamp(u / 0.8);
    return site(t, { sky: "dusk" }) + bldg(t, 11) + crane(t, full(t, { n: 10, tilt: sw, tr: 0.3, hook: 40, mood: "shock" })) + wind(t, -60, 200, 14, 0.7) + guy(110, 0.26, t, "shock");
  });
  // 20 — so you tie it to the building itself with steel collars
  shot(20, cmv(290, 170, 1.5, 300, 130, 0.85), function (u, d, t) {
    var nt = Math.min(3, Math.floor(clamp((u - 0.3) / (d * 0.6)) * 3.999)), ties = [2, 5, 8].slice(0, nt), sw = Math.sin(t * 3.2) * 2.4 * (1 - nt / 3);
    return site(t, { sky: "dusk" }) + bldg(t, 11) + crane(t, full(t, { n: 10, tilt: sw, tr: 0.3, hook: 40, ties: ties })) + wind(t, -60, 200, 10, 0.7) + tag("كانات حديد", MX + 120, GY - 5 * SEC - 20, u, 0.6, 3, 16) + (nt >= 3 ? check(MX - 50, GY - 5 * SEC, 1, t) : "");
  });
  // 21 — many think the jib must be locked with the brake at night so the wind can't turn it
  shot(21, cmv(300, 120, 0.95, 290, 110, 1.15), function (u, d, t) {
    var strain = clamp(u / d), bend = Math.sin(t * 4) * 1.6 * strain;
    return site(t, { sky: "night" }) + bldg(t, 11) + crane(t, full(t, { n: 10, ties: [2, 5, 8], tr: 0.05, hook: 20, cab: true, mood: "worry", brake: "on", tilt: bend * 0.4 })) + wind(t, -80, 160, 16, 0.9) + arrow(560, -10, 470, -10, "#9fd0ff", 6, clamp((u - 0.3) / 0.6)) + tag("فرامل؟", MX - 70, GY - 10 * SEC - 70, u, 0.6, -3, 16, "#f2a0a0");
  });
  // 22 — really the operator releases the brake when leaving, so the jib swings with the wind like a weathervane
  shot(22, cmv(290, 110, 1.15, 300, 130, 0.95), function (u, d, t) {
    var ph = Math.max(0, u - 1.4) * 0.9 + Math.sin(t * 0.8) * 0.15 * clamp(u - 1.4);
    return site(t, { sky: "night" }) + bldg(t, 11) + crane(t, full(t, { n: 10, ties: [2, 5, 8], tr: 0.05, hook: 20, cab: true, mood: "happy", brake: "off", phi: ph })) + wind(t, -80, 160, 16, 0.9) + vane(520, 260, 1.2, t, ph) + tag("زي دوارة الهوا", 520, 300, u, 1.6, -3, 16);
  });
  // 23 — add a cab for the operator up top, a red light for planes and a little fan that measures the wind
  shot(23, cmv(240, 20, 2.6, 270, 30, 2.1), function (u, d, t) {
    return site(t, { sky: "dusk" }) + bldg(t, 11) + crane(t, full(t, { n: 10, ties: [2, 5, 8], tr: 0.2, hook: 30, cab: u > 0.3, light: u > 1.6, anemo: u > 3.0, mood: "happy" })) + tag("كابينة", MX + 40, GY - 10 * SEC + 12, u, 0.3, -3, 11) + tag("لمبة حمرا", MX - 46, GY - 10 * SEC - 70, u, 1.6, 3, 11) + tag("مقياس الريح", MX + 50, GY - 10 * SEC - 84, u, 3.0, -3, 11);
  });
  // 24 — and congratulations, you've built a tower crane
  shot(24, cmv(280, 80, 1.6, 320, 140, 0.8), function (u, d, t) {
    var s = site(t, {}) + bldg(t, 11) + crane(t, full(t, { n: 10, ties: [2, 5, 8], tr: 0.6 + 0.3 * Math.sin(t), hook: 60, load: { w: 40, h: 14 }, phi: Math.sin(t * 0.5) * 0.3 }));
    for (var c = 0; c < 18; c++) { var p = (t * 0.5 + hash(c)) % 1; s += '<rect x="' + f(80 + hash(c + 2) * 480) + '" y="' + f(-80 + p * 300) + '" width="6" height="9" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(80 + hash(c + 2) * 480) + ' ' + f(-80 + p * 300) + ')"/>'; }
    return s + guy(130, 0.3, t, "happy") + tag("مبروك!", 330, -30, u, 0.5, -3, 30, "#bfe8c0");
  });
  // 25 — outro
  shot(25, cmv(300, 140, 0.85, 340, 130, 0.8), function (u, d, t) {
    return site(t, { sky: "dusk" }) + bldg(t, 11) + crane(t, full(t, { n: 10, ties: [2, 5, 8], tr: 0.5, hook: 50, phi: t * 0.4 })) + tag("قولولنا!", 330, 0, u, 0.4, 3, 30);
  });

  window.__parts = { site: site, crane: crane, bldg: bldg, full: full, truckCrane: truckCrane, tag: tag, hardHat: hardHat, T: T, GY: GY, SEC: SEC, MX: MX };
  window.__panel = function (svg, t) {
    CLIPN = 0; OILN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
