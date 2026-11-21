/* «تبني ميناء حاويات إزاي؟» in the «لو» look (videos/_reference/law), on the shared kit (videos/_templates/law/kit.js).
   One coast cut open: the sea on the left (the water, the seabed, the channel the dredger digs), the land on the right
   (sand, clay, the hard layer the piles reach), and the port that grows on it line by line: the box, the quay crane on
   rails, the piles and the deck, the dredged channel, the yard with its gantry, the box numbers, the reefer plugs, the
   stowage plan, the corner locks, the gate, the X-ray arch and the train. The man (a port worker, shared person kit)
   acts out and reacts to every line. World units: the 1080×1920 frame at zoom 1; about 60 units a metre for people and
   boxes, depths and the crane drawn at about half their real size (the pills carry the real numbers). */
(function () {
  var K = window.LAW, clamp = K.clamp, ease = K.ease, lerp = K.lerp, hash = K.hash, f = K.f, R = K.R, P = K.P, F = K.F, C = K.C, T = K.T, INK = K.INK;
  var GY = 900, WY = 1000, HARD = 2250, MS = 0.45, MH = 122;   // quay/land top, sea surface, the hard layer, man scale and height
  var Z = 1;                                                // the zoom of the shot being drawn: overlays keep one size on screen
  var WORK = { base: "worker" };
  var act = function (u, Ks, t) { Ks.forEach(function (k) { var o = k[1]; if (o.s == null) o.s = MS; if (o.vest == null && !o.shirt) { o.vest = 1; o.hat = 1; } }); return K.act(u, Ks, t); };
  function pill(text, x, y, u, u0, o) { o = Object.assign({}, o || {}); o.sz = (o.sz || 40) * 1.55 / Z; return K.pill(text, x, y, u, u0, o); }
  function xmark(x, y, u, u0, s) { return K.xmark(x, y, u, u0, (s || 0.8) * 1.55 / Z); }
  function vmark(x, y, u, u0, s) { return K.vmark(x, y, u, u0, (s || 0.8) * 1.55 / Z); }
  function ring(x, y, r, u, u0, t) { return K.ring(x, y, r, u, u0, t); }
  function S(line, c0, c1, fn) { var z = (c0[2] + c1[2]) / 2; K.shot(line, c0, c1, function (u, d, t) { Z = z; return fn(u, d, t); }); }
  function dim(x, y0, y1, text, k, col) { if (k <= 0) return ""; var y = lerp(y0, y1, ease(k)), w = 6 / Z * 1.4; col = col || "#ffd23a";
    return '<g opacity="' + f(clamp(k * 2)) + '">' + P("M" + f(x) + " " + f(y0) + " V" + f(y), INK, w + 5) + P("M" + f(x) + " " + f(y0) + " V" + f(y), col, w) + P("M" + f(x - 24 / Z) + " " + f(y0) + " h" + f(48 / Z) + " M" + f(x - 24 / Z) + " " + f(y) + " h" + f(48 / Z), col, w) + '</g>' + (k > 0.6 ? pill(text, x + 150 / Z * 1.3, (y0 + y1) / 2, k, 0.6, { col: col, down: false, sz: 34 }) : ""); }

  // ── the sky, the far shore town, the sea surface ──
  var CLOUDS = []; for (var ci = 0; ci < 14; ci++) CLOUDS.push([-3600 + ci * 560 + hash(ci) * 200, -1600 + hash(ci + 7) * 1500, 1.4 + hash(ci + 3) * 1.6]);
  function sky(t, h) {
    var night = h.night, storm = h.storm || 0;
    var s = '<rect x="-4600" y="-3200" width="9800" height="' + (GY + 3200 + 300) + '" fill="url(#' + (night ? "skyN" : "sky") + ')"/>';
    if (storm > 0) s += '<rect x="-4600" y="-3200" width="9800" height="' + (GY + 3500) + '" fill="#2a3442" opacity="' + f(0.75 * storm) + '"/>';
    if (!night) s += C(900, -500, 1000 + 25 * Math.sin(t * 0.7), "url(#sun)", { op: 1 - storm });
    else for (var i = 0; i < 70; i++) s += C(-4000 + hash(i + 40) * 8500, -3000 + hash(i + 60) * 3300, 3 + hash(i) * 4, "#fff", { op: 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i)) });
    CLOUDS.forEach(function (c, i) { var cx = ((c[0] + t * 22 + 4400) % 9200) - 4600;
      s += '<g transform="translate(' + f(cx) + ' ' + f(c[1]) + ') scale(' + f(c[2]) + ')" opacity="' + (night ? 0.25 : 0.95) + '"><path d="M-90 30 C-110 30 -110 0 -86 -2 C-84 -30 -40 -40 -24 -18 C-10 -44 40 -40 44 -10 C70 -14 84 6 74 24 C80 30 70 38 60 36 Z" fill="' + (storm > 0.3 ? "#6a7482" : "#fff") + '" stroke="' + (storm > 0.3 ? "#4a5260" : "#c9d6e2") + '" stroke-width="3"/></g>'; });
    // the far town on the land side (Port Said-like blocks and a minaret), faded
    for (var b = 0; b < 20; b++) { var bx = 700 + b * 210, bh = 160 + hash(b + 70) * 260; s += R(bx, GY - bh, 170, bh, night ? "#3a4560" : "#d9cfc0", { sw: 0, op: 0.75 });
      for (var w = 0; w < 6; w++) s += R(bx + 22 + (w % 2) * 76, GY - bh + 30 + Math.floor(w / 2) * 60, 44, 30, night ? (hash(b + w) > 0.5 ? "#ffd27a" : "#2a3348") : "#c4b8a6", { sw: 0, op: 0.7 }); }
    s += R(1960, GY - 620, 34, 620, night ? "#3a4560" : "#d2c6b4", { sw: 0, op: 0.8 }) + C(1977, GY - 630, 26, night ? "#3a4560" : "#d2c6b4", { op: 0.8 });
    // the far sea horizon line
    s += R(-4600, WY - 30, 4600, 30, "#8fc4e0", { sw: 0, op: 0.6 });
    return s;
  }
  // ── the ground cut open: seabed (natural slope, dredged channel, silt), the bank, the land, the layers ──
  function natural(x) { return WY + 30 + clamp(((-160 - x) * 0.6) / 730) * 730; }
  function seabed(x, h) { var nat = natural(x), dg = h.dgPos == null ? -9999 : h.dgPos, chan = WY + 700 - (h.silt || 0) * 170;
    if (x > -160 && !h.quay) return x > -20 ? GY : lerp(WY + 30, GY, (x + 160) / 140);
    if (h.quay && x > -60) { var b = Math.max(nat, h.dgPos == null ? nat : chan); return x > 700 ? GY : lerp(b, GY + 40, clamp((x + 60) / 760)); }
    var k = clamp((dg - x) / 160); return Math.max(nat, lerp(nat, chan, k)); }
  function ground(t, h) {
    var pts = [], x; for (x = -4600; x <= 5200; x += 40) pts.push([x, seabed(x, h)]);
    var top = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L");
    var s = '<path d="' + top + ' L5200 3600 L-4600 3600 Z" fill="url(#sand)" stroke="' + INK + '" stroke-width="4"/>';
    // stones and grains in the sand, then the clay band and the hard layer (always below every seabed)
    for (var i = 0; i < 140; i++) { var gx = -4400 + hash(i) * 9400, gy = 1900 - hash(i + 9) * 0 + hash(i + 5) * 300, sy = Math.max(seabed(gx, h) + 30, gy - 700 + hash(i + 2) * 600); if (sy > 1980) continue;
      s += '<ellipse cx="' + f(gx) + '" cy="' + f(sy) + '" rx="' + f(10 + hash(i + 3) * 26) + '" ry="' + f(6 + hash(i + 4) * 10) + '" fill="' + (hash(i + 7) > 0.5 ? "#b08a58" : "#e8d2a2") + '" opacity=".55"/>'; }
    s += R(-4600, 1990, 9800, HARD - 1990, "url(#clay)", { sw: 3 }) + R(-4600, HARD, 9800, 1400, "url(#rock)", { sw: 3 });
    for (var r = 0; r < 70; r++) { var rx = -4500 + hash(r + 300) * 9600, ry = HARD + 50 + hash(r + 400) * 1200, rr = 20 + hash(r + 500) * 40; s += '<ellipse cx="' + f(rx) + '" cy="' + f(ry) + '" rx="' + f(rr * 1.4) + '" ry="' + f(rr) + '" fill="#9a9694" stroke="#3e3b3a" stroke-width="3" opacity=".8"/>'; }
    for (var q = 0; q < 40; q++) { var qx = -4500 + hash(q + 600) * 9600, qy = 2030 + hash(q + 700) * 180; s += '<ellipse cx="' + f(qx) + '" cy="' + f(qy) + '" rx="' + f(24 + hash(q) * 30) + '" ry="8" fill="#5a4230" opacity=".45"/>'; }
    // the silt layer in the channel
    if ((h.silt || 0) > 0.02 && h.dgPos != null) { var sp = []; for (x = -4600; x <= -60; x += 40) { var b0 = seabed(x, h), b1 = Math.max(natural(x), WY + 700); sp.push([x, b0, b1]); }
      s += '<path d="M' + sp.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join(" L") + " L" + sp.slice().reverse().map(function (p) { return f(p[0]) + " " + f(p[2]); }).join(" L") + ' Z" fill="url(#silt)" opacity=".9"/>'; }
    // land surface: a strip of beach sand with a few tufts, the palms behind
    s += P("M-20 " + GY + " H5200", INK, 5);
    for (var g = 760; g < 5200; g += 120) s += P("M" + g + " " + (GY - 2) + " l6 -16 M" + (g + 9) + " " + (GY - 2) + " l-4 -12", "#7a9a3e", 4);
    return s;
  }
  function sea(t, h) { var sx1 = h.quay ? -40 : -20;
    var d = "M-4600 " + WY; for (var x = -4600; x <= sx1; x += 60) d += " L" + x + " " + f(WY + Math.sin(x * 0.012 + t * 2.2) * (6 + 30 * (h.storm || 0)));
    return '<path d="' + d + " L" + sx1 + " 3200 L-4600 3200 Z" + '" fill="url(#' + (h.night || h.storm > 0.5 ? "seaN" : "sea") + ')" opacity=".96"/>' + P(d, "#d6eefa", 6, ' opacity=".8"'); }
  function seaOver(t, h) { // the water drawn again, thin, over the hulls under the waterline (they read as under water)
    var d = "M-4600 " + WY; for (var x = -4600; x <= (h.quay ? -40 : -20); x += 60) d += " L" + x + " " + f(WY + Math.sin(x * 0.012 + t * 2.2) * (6 + 30 * (h.storm || 0)));
    return '<path d="' + d + " L" + (h.quay ? -40 : -20) + ' 3200 L-4600 3200 Z" fill="#1f6a9a" opacity=".32"/>' + P(d, "#eaf7ff", 5, ' opacity=".9"'); }

  // ── a container, side view: x left, yb its bottom, w (300 = 20 ft, 610 = 40 ft), colour, options ──
  var BW = 300, BH = 130, COLS = ["#c7432c", "#2f6fa8", "#3a8a5a", "#e0862c", "#7a5aa0", "#8a9098"];
  function box(x, yb, w, col, o) { o = o || {}; var h = BH, y = yb - h, s = '<g filter="url(#sh)">' + R(x, y, w, h, col, { sw: 3 }) + '</g>';
    if (o.cut) { s += R(x + 10, y + 10, w - 20, h - 20, "#3a2e26", { sw: 2 }) + (o.inside || ""); }
    else { var cor = ""; for (var c = x + 18; c < x + w - 14; c += 16) cor += "M" + c + " " + (y + 10) + " V" + (yb - 10) + " "; s += P(cor, "#000", 2.4, ' opacity=".22"'); }
    s += R(x, y, w, h, "url(#boxShade)", { sw: 0 });
    [[x, y], [x + w - 14, y], [x, yb - 14], [x + w - 14, yb - 14]].forEach(function (p) { s += R(p[0], p[1], 14, 14, "#3a3a3a", { sw: 1.5 }); });
    if (o.reefer) s += R(x + w - 70, y + 20, 52, h - 40, "#cfd6dc", { sw: 2 }) + P("M" + (x + w - 62) + " " + (y + 36) + " h36 M" + (x + w - 62) + " " + (y + 52) + " h36 M" + (x + w - 62) + " " + (y + 68) + " h36", "#7a848c", 3);
    if (o.num) s += R(x + 30, y + 22, 180, 30, "#fff", { sw: 0, op: 0.0 }) + '<text x="' + (x + 30) + '" y="' + (y + 48) + '" style="font:800 26px DejaVu Sans Mono,monospace;fill:#fff;stroke:#000;stroke-width:1">' + o.num + '</text>';
    if (o.tag) s += R(x + w / 2 - 50, y + h / 2 - 24, 100, 46, o.tagBg || "#1e2226", { rx: 10, sw: 2 }) + T(o.tag, x + w / 2, y + h / 2 + 12, 30, o.tagCol || "#fff", { w: 800 });
    if (o.glow) s += R(x - 6, y - 6, w + 12, h + 12, "none", { st: "#ffd23a", sw: 8, op: o.glow });
    return s; }

  // ── the small wooden boat with sacks (line 0–1) ──
  function boat(t, x, n) { var bob = Math.sin(t * 2) * 6, y = WY + bob, s = '<g filter="url(#sh)">' + F("M" + (x - 170) + " " + f(y - 60) + " L" + (x + 170) + " " + f(y - 60) + " Q" + (x + 150) + " " + f(y + 40) + " " + (x + 60) + " " + f(y + 50) + " L" + (x - 80) + " " + f(y + 50) + " Q" + (x - 160) + " " + f(y + 30) + " " + (x - 170) + " " + f(y - 60) + " Z", "url(#boat)") + '</g>';
    s += P("M" + (x - 150) + " " + f(y - 40) + " H" + (x + 150), "#5a3a1a", 4) + P("M" + (x - 20) + " " + f(y - 60) + " V" + f(y - 330), "#6a4a2a", 9) + F("M" + (x - 12) + " " + f(y - 320) + " L" + (x + 130) + " " + f(y - 120) + " L" + (x - 12) + " " + f(y - 120) + " Z", "#f3ead8", { sw: 3 });
    for (var i = 0; i < n; i++) s += sack(x - 130 + (i % 4) * 60, y - 60 - Math.floor(i / 4) * 34, i);
    return s; }
  function sack(x, yb, i) { return F("M" + (x - 26) + " " + f(yb) + " Q" + (x - 30) + " " + f(yb - 36) + " " + (x - 14) + " " + f(yb - 44) + " L" + (x + 14) + " " + f(yb - 44) + " Q" + (x + 30) + " " + f(yb - 36) + " " + (x + 26) + " " + f(yb) + " Z", i % 3 === 1 ? "#cdb68a" : "#dcc79a", { sw: 2.6 }) + P("M" + (x - 10) + " " + f(yb - 44) + " l10 -8 l10 8", "#8a6a3a", 3); }
  function barrel(x, yb) { return R(x - 24, yb - 64, 48, 64, "#3a6a9a", { rx: 8, sw: 2.6 }) + P("M" + (x - 24) + " " + (yb - 46) + " h48 M" + (x - 24) + " " + (yb - 18) + " h48", "#1e3a5a", 3); }
  function carton(x, yb, s) { s = s || 1; return R(x - 28 * s, yb - 46 * s, 56 * s, 46 * s, "#c99a5e", { sw: 2.4 }) + P("M" + f(x - 28 * s) + " " + f(yb - 34 * s) + " h" + f(56 * s), "#8a6a3a", 2); }
  function cargoPile(n, x0, yb) { var s = ""; for (var i = 0; i < n; i++) { var x = x0 + (i % 5) * 62, y = yb - Math.floor(i / 5) * 46; s += i % 3 === 0 ? sack(x, y, i) : i % 3 === 1 ? barrel(x, y) : carton(x, y); } return s; }

  // ── ships: the small feeder (lines 3–6) and the big full ship (7 on); x is the bow (right end), draft in units ──
  function ship(t, o) { var L = o.len || 1300, x1 = o.x, x0 = x1 - L, dr = o.draft, deckY = WY - 210, keel = WY + dr, bob = Math.sin(t * 1.3) * 5, s = "";
    var g = '<g transform="rotate(' + f(o.tilt || 0) + ' ' + f(x0 + L / 2) + ' ' + f(WY) + ') translate(0 ' + f(bob) + ')">';
    // the boxes on deck: bays of 20 ft boxes, tiers from the deck up
    var bays = o.bays || [], bx0 = x0 + 230;
    bays.forEach(function (bay, i) { bay.forEach(function (c, j) { if (!c) return; var bx = bx0 + i * 310 + (c.dx || 0), by = deckY - j * BH + (c.dy || 0); g += box(bx, by, BW, c.col || COLS[(i * 3 + j) % 6], c.o); }); });
    // lashing bars and corner locks (line 21 on)
    if (o.lash) bays.forEach(function (bay, i) { var bx = bx0 + i * 310; for (var j = 1; j < Math.min(3, bay.length) + 1; j++) { if (!bay[j - 1]) continue; var ly = deckY - j * BH; g += P("M" + (bx + 6) + " " + (deckY + 4) + " L" + (bx + 40) + " " + f(ly + 8) + " M" + (bx + BW - 6) + " " + (deckY + 4) + " L" + (bx + BW - 40) + " " + f(ly + 8), "#c9ced4", 5, ' opacity="' + f(clamp(o.lash) ) + '"'); }
      for (var j2 = 0; j2 < bay.length; j2++) if (bay[j2]) { var cy = deckY - j2 * BH; g += R(bx - 4, cy - 6, 22, 12, "#ffd23a", { sw: 2, op: clamp(o.lash) }) + R(bx + BW - 18, cy - 6, 22, 12, "#ffd23a", { sw: 2, op: clamp(o.lash) }); } });
    // the hull
    g += '<g filter="url(#sh)">' + F("M" + f(x0 + 40) + " " + f(deckY) + " L" + f(x1 - 60) + " " + f(deckY) + " L" + f(x1 + 30) + " " + f(deckY - 30) + " Q" + f(x1 - 10) + " " + f(keel - 40) + " " + f(x1 - 120) + " " + f(keel) + " L" + f(x0 + 70) + " " + f(keel) + " Q" + f(x0) + " " + f(keel - 20) + " " + f(x0) + " " + f(deckY + 30) + " Z", o.small ? "url(#hullS)" : "url(#hull)") + '</g>';
    g += P("M" + f(x0 + 30) + " " + f(deckY + 30) + " H" + f(x1 - 40), "#fff", 4, ' opacity=".5"');
    // draft marks near the bow
    for (var m = 0; m < 6; m++) g += R(x1 - 90, WY - 100 + m * 70, 26, 8, "#fff", { sw: 0, op: 0.7 });
    // the bridge at the stern
    var hx = x0 + 40; g += '<g filter="url(#sh)">' + R(hx, deckY - (o.small ? 230 : 400), 170, o.small ? 230 : 400, "#eef0f2") + '</g>';
    for (var w = 0; w < (o.small ? 3 : 6); w++) g += R(hx + 16, deckY - (o.small ? 210 : 380) + w * 64, 138, 24, "#2a3a4a", { sw: 2 });
    g += R(hx + 60, deckY - (o.small ? 300 : 470), 40, 70, o.small ? "#c7432c" : "#2f6fa8", { sw: 3 });
    return g + '</g>'; }
  function fullBays(seed, tiers, heavyTop) { var b = []; for (var i = 0; i < 3; i++) { var bay = []; for (var j = 0; j < tiers; j++) bay.push({ col: COLS[Math.floor(hash(seed + i * 7 + j) * 6)] }); b.push(bay); }
    if (heavyTop) b.forEach(function (bay) { bay.forEach(function (c, j) { c.col = j >= tiers - 1 ? "#3a3f46" : "#e8ecef"; c.o = { tag: j >= tiers - 1 ? "30t" : "5t", tagBg: j >= tiers - 1 ? "#c7321f" : "#3aa05a" }; }); });
    return b; }

  // ── the quay crane: legs on rails at x 40 and 560, the boom over the water, a trolley and a spreader ──
  var CL0 = 40, CL1 = 560, BOOMY = -420, BOOMX0 = -1560, BOOMX1 = 900;
  function crane(t, o) { var k = o.k == null ? 1 : clamp(o.k), sink = o.sink || 0, s = "";
    if (k <= 0) return "";
    var tilt = sink * 3, legH = lerp(0, GY - BOOMY, ease(clamp(k * 1.6))), boomK = ease(clamp((k - 0.5) * 2));
    var g = '<g transform="translate(0 ' + f(sink * 120) + ') rotate(' + f(-tilt) + ' 300 ' + GY + ')">';
    [CL0, CL1].forEach(function (lx) { g += '<g filter="url(#sh)">' + R(lx - 24, GY - legH, 48, legH, "url(#crane)") + '</g>' + R(lx - 60, GY - 46, 120, 46, "#5a5f66", { rx: 8 }) + C(lx - 34, GY - 10, 14, "#2a2e33") + C(lx + 34, GY - 10, 14, "#2a2e33"); });
    if (legH > 300) { var yb = GY - legH; g += R(CL0 - 24, GY - 360, CL1 - CL0 + 48, 40, "url(#craneH)") + P("M" + CL0 + " " + (GY - 320) + " L" + CL1 + " " + f(yb + 60) + " M" + CL1 + " " + (GY - 320) + " L" + CL0 + " " + f(yb + 60), "#c24a1c", 12); }
    if (boomK > 0) { var bx0 = lerp(CL0 - 40, BOOMX0, boomK), bx1 = lerp(CL1 + 40, BOOMX1, boomK);
      g += '<g filter="url(#sh)">' + R(bx0, BOOMY - 50, bx1 - bx0, 56, "url(#craneH)") + '</g>';
      var tr = ""; for (var x = bx0 + 20; x < bx1 - 40; x += 70) tr += "M" + f(x) + " " + (BOOMY - 46) + " L" + f(x + 35) + " " + (BOOMY + 2) + " L" + f(x + 70) + " " + (BOOMY - 46) + " ";
      g += P(tr, "#a33c14", 5);
      // the A-frame and the stays
      g += F("M" + (CL0 - 10) + " " + (BOOMY - 50) + " L" + (CL0 + 120) + " " + (BOOMY - 420) + " L" + (CL0 + 150) + " " + (BOOMY - 420) + " L" + (CL1 + 10) + " " + (BOOMY - 50) + " Z", "url(#crane)", { sw: 3 });
      g += P("M" + (CL0 + 135) + " " + (BOOMY - 410) + " L" + f(bx0 + 60) + " " + (BOOMY - 40) + " M" + (CL0 + 135) + " " + (BOOMY - 410) + " L" + f(bx0 + 520) + " " + (BOOMY - 40) + " M" + (CL0 + 135) + " " + (BOOMY - 410) + " L" + f(bx1 - 40) + " " + (BOOMY - 40), "#3a3a3a", 4);
      // the machinery house and the operator's cabin on the trolley
      g += R(CL1 - 40, BOOMY - 150, 260, 100, "#eef0f2") + T("إيه الحكاية؟", CL1 + 90, BOOMY - 88, 30, "#c7432c");
      var tx = o.tx == null ? -400 : o.tx, sy = o.sy == null ? GY - 400 : o.sy;
      g += R(tx - 60, BOOMY + 6, 120, 40, "#5a5f66", { sw: 3 }) + R(tx - 40, BOOMY + 46, 80, 70, "#eef0f2", { sw: 3 }) + R(tx - 30, BOOMY + 62, 60, 30, "#7fc0e0", { sw: 2 });
      g += P("M" + (tx - 30) + " " + (BOOMY + 46) + " V" + f(sy - 30) + " M" + (tx + 30) + " " + (BOOMY + 46) + " V" + f(sy - 30), "#2a2a2a", 3);
      // the spreader (the frame that locks on the box) and the box it carries
      if (o.load) g += box(tx - BW / 2, sy + 10 + BH, BW, o.load.col, o.load.o);
      g += R(tx - BW / 2 - 6, sy - 30, BW + 12, 30, "#f2c230", { sw: 3 }) + R(tx - 30, sy - 50, 60, 22, "#5a5f66", { sw: 2 });
    }
    return g + '</g>'; }
  function rails(quay) { return P("M-60 " + (GY - 4) + " H760", "#5a5f66", 10) + (quay ? "" : ""); }

  // ── the quay: piles down to the hard layer and the concrete deck on top ──
  var PILES = [-20, 140, 300, 460, 620];
  function quay(t, o) { var s = "", pk = o.piles == null ? 1 : o.piles, dk = o.deck == null ? 1 : o.deck;
    PILES.forEach(function (px, i) { var k = clamp(pk * PILES.length - i); if (k <= 0) return; var bot = lerp(GY - 200, HARD + 60, ease(k));
      s += R(px - 22, GY - 200 + (bot - (GY - 200)) - (HARD + 60 - GY), 44, HARD + 60 - GY, "url(#pile)", { sw: 3 }); });
    if (dk > 0) { var w = 780 * ease(dk); s += '<g filter="url(#sh)">' + R(-60, GY, w, 70, "url(#deck)", { sw: 4 }) + '</g>';
      if (dk >= 1) s += R(-70, GY + 10, 22, 90, "#2a2a2a", { rx: 6, sw: 2 }) + R(-70, GY + 120, 22, 90, "#2a2a2a", { rx: 6, sw: 2 }); }
    return s; }

  // ── the dredger: a hopper ship with a suction arm to the seabed and a jet of sand ──
  function dredger(t, x, h, jet) { var y = WY + Math.sin(t * 1.6) * 6, sb = seabed(x - 260, h), s = "";
    s += P("M" + f(x - 120) + " " + f(y + 40) + " L" + f(x - 260) + " " + f(sb - 30), "#5a5f66", 26) + P("M" + f(x - 120) + " " + f(y + 40) + " L" + f(x - 260) + " " + f(sb - 30), "#9aa2ac", 14);
    s += R(x - 300, sb - 40, 80, 44, "#f2c230", { rx: 8, sw: 3 });
    for (var k = 0; k < 6; k++) { var p = (t * 1.4 + k / 6) % 1; s += C(lerp(x - 270, x - 130, p), lerp(sb - 30, y + 40, p), 9, "#c9a36a", { st: INK, sw: 1.5, op: 1 - p * 0.4 }); }
    s += '<g filter="url(#sh)">' + F("M" + f(x - 460) + " " + f(y - 90) + " L" + f(x + 260) + " " + f(y - 90) + " L" + f(x + 220) + " " + f(y + 80) + " L" + f(x - 430) + " " + f(y + 80) + " Z", "url(#hullS)") + '</g>';
    s += R(x - 380, y - 210, 200, 120, "#eef0f2") + R(x - 360, y - 190, 160, 30, "#2a3a4a", { sw: 2 }) + R(x - 60, y - 150, 260, 60, "#c9a36a", { sw: 3 }) + T("كراكة", x + 70, y - 106, 40, "#3a2a1a");
    if (jet) { var d = "M" + f(x + 240) + " " + f(y - 150); for (var j = 1; j <= 16; j++) { var q = j / 16; d += " L" + f(x + 240 + q * 900) + " " + f(y - 150 - Math.sin(q * Math.PI) * 420 + q * 260); }
      s += P(d, "#c9a36a", 30, ' opacity=".55"') + P(d, "#e2c48e", 12, ' opacity=".8"'); }
    return s; }

  // ── the yard behind the quay: stacks under a rubber-tyred gantry, the reefer row and its plug rack ──
  var YX0 = 1040, RTGX0 = 980, RTGX1 = 1700, RFX = 1900;
  function stacks(t, o) { var s = "", n = o.n == null ? 1 : o.n, cnt = 0;
    for (var c = 0; c < 2; c++) for (var j = 0; j < 5; j++) { cnt++; var k = clamp(n * 10 - cnt + 1); if (k <= 0) continue;
      var x = YX0 + c * 320, yb = GY - j * BH - (1 - ease(k)) * 300, id = c * 5 + j, num = o.find && id === o.find ? o.num : null;
      s += box(x, yb, BW, o.same ? "#2f6fa8" : COLS[Math.floor(hash(id + 50) * 6)], { num: num || (o.nums ? "EGPU " + (100000 + Math.floor(hash(id + 3) * 899999)) : null), glow: o.find === id ? o.glow : 0 }); }
    return s; }
  function rtg(t, o) { var x0 = RTGX0, x1 = RTGX1, top = GY - 5 * BH - 160, s = "";
    [x0, x1].forEach(function (lx) { s += '<g filter="url(#sh)">' + R(lx - 20, top, 40, GY - top - 40, "url(#rtg)") + '</g>' + C(lx - 22, GY - 22, 22, "#2a2e33") + C(lx + 22, GY - 22, 22, "#2a2e33"); });
    s += R(x0 - 30, top - 40, x1 - x0 + 60, 54, "url(#rtg)") + R(x1 - 10, top + 10, 70, 70, "#eef0f2", { sw: 3 }) + R(x1, top + 22, 50, 28, "#7fc0e0", { sw: 2 });
    var tx = o.tx == null ? 1200 : o.tx, sy = o.sy == null ? top + 120 : o.sy;
    s += P("M" + (tx - 30) + " " + (top + 14) + " V" + f(sy) + " M" + (tx + 30) + " " + (top + 14) + " V" + f(sy), "#2a2a2a", 3);
    if (o.load) s += box(tx - BW / 2, sy + 30 + BH, BW, o.load.col, o.load.o);
    s += R(tx - BW / 2 - 6, sy, BW + 12, 28, "#3a3f46", { sw: 3 });
    return s; }
  function truck(x, load) { var s = "", y = GY; if (load) s += box(x - 150, y - 70, BW, load.col, load.o);
    s += R(x - 170, y - 74, 330, 24, "#3a3f46", { sw: 3 }) + '<g filter="url(#sh)">' + R(x + 170, y - 190, 120, 140, "#2f6fa8", { rx: 12 }) + '</g>' + R(x + 220, y - 170, 56, 50, "#9fd6ff", { sw: 2 });
    [x - 120, x + 60, x + 230].forEach(function (wx) { s += C(wx, y - 26, 26, "#2a2e33", { st: INK, sw: 3 }) + C(wx, y - 26, 10, "#9aa2ac"); });
    return s; }
  function reefers(t, o) { var s = "", k = o.k == null ? 1 : o.k, cold = o.cold || 0;
    s += '<g filter="url(#sh)">' + R(RFX + 640, GY - 3 * BH - 60, 60, 3 * BH + 60, "#6a727c") + '</g>';
    for (var j = 0; j < 3; j++) { var kk = clamp(k * 3 - j); if (kk <= 0) continue; var yb = GY - j * BH - (1 - ease(kk)) * 200;
      s += box(RFX, yb, 610, "#eef1f4", { reefer: 1 });
      var plug = clamp(o.plug == null ? 1 : o.plug * 3 - j); if (plug > 0) { var py = yb - BH / 2; s += P("M" + (RFX + 600) + " " + f(py) + " Q" + (RFX + 625) + " " + f(py + 30) + " " + f(lerp(RFX + 600, RFX + 646, plug)) + " " + f(py), "#1e2226", 6) + C(RFX + 650, py, 9, plug >= 1 ? "#5ad07a" : "#e8452e", { st: INK, sw: 2 }); } }
    if (cold > 0) { s += R(RFX - 20, GY - 3 * BH - 20, 650, 3 * BH + 20, "url(#cold)", { sw: 0, op: cold });
      for (var q = 0; q < 10; q++) { var p = (t * 0.35 + hash(q)) % 1, cx = RFX + 40 + hash(q + 3) * 520, cy = GY - 3 * BH - 30 - p * 160; s += T("❄", cx, cy, 34, "#bfe8ff", { w: 400 }); } }
    return s; }
  function orangeBox(t, x, yb, rot, heat) { var inside = "";
    for (var i = 0; i < 30; i++) { var ox = x + 30 + (i % 10) * 24, oy = yb - 26 - Math.floor(i / 10) * 26, bad = rot > hash(i + 11);
      inside += C(ox, oy, 12, bad ? "#7a6a2a" : "#f0902a", { st: INK, sw: 1.6 }) + (bad ? "" : C(ox - 4, oy - 4, 3, "#ffd08a")); }
    var s = box(x, yb, BW, "#c7432c", { cut: 1, inside: inside });
    if (heat > 0) for (var k = 0; k < 4; k++) { var p = (t * 0.8 + k / 4) % 1; s += P("M" + (x + 40 + k * 70) + " " + f(yb - BH - 10 - p * 60) + " q10 -12 0 -24 q-10 -12 0 -24", "#ff6a3a", 5, ' opacity="' + f((1 - p) * heat) + '"'); }
    return s; }
  function thermo(x, y, v, k, cold) { if (k <= 0) return ""; var h = 160 * clamp(v); return '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x - 16, y - 180, 32, 190, "#fff", { rx: 16, sw: 4 }) + R(x - 7, y - h, 14, h, cold ? "#3a8ad8" : "#e8452e", { sw: 0 }) + C(x, y + 14, 24, cold ? "#3a8ad8" : "#e8452e", { st: INK, sw: 4 }) + '</g>'; }
  // a screen on a pole: the yard map with the found slot, or the stowage plan
  function screen(x, y, w, h, kind, k, t) { if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k)) + '" filter="url(#sh)">' + R(x, y, w, h, "url(#screen)", { rx: 14, sw: 5 });
    var cw = (w - 40) / 6, ch = (h - 60) / 4;
    for (var i = 0; i < 6; i++) for (var j = 0; j < 4; j++) { var cx = x + 20 + i * cw, cy = y + 40 + j * ch, col = "#2a4a68";
      if (kind === "map") col = (i === 4 && j === 1) ? (Math.sin(t * 8) > 0 ? "#ffd23a" : "#f29a3a") : "#2f6fa8";
      if (kind === "plan") col = j >= 2 ? "#3a3f46" : "#e8ecef";
      s += R(cx + 3, cy + 3, cw - 6, ch - 6, col, { sw: 1.5, st: "#0b1a28" }); }
    if (kind === "plan") s += T("تقيل", x + w + 70, y + h - 40, 36, "#fff", { stroke: INK }) + T("خفيف", x + w + 70, y + 80, 36, "#fff", { stroke: INK });
    return s + '</g>'; }
  // the gate: a camera arch reading the number, an X-ray arch and the train
  var GX = 2800;
  function gate(t, o) { var s = "";
    s += '<g filter="url(#sh)">' + R(GX - 20, GY - 520, 40, 520, "#8a9098") + R(GX + 420, GY - 520, 40, 520, "#8a9098") + R(GX - 40, GY - 560, 520, 60, "#3a3f46") + '</g>';
    s += R(GX + 180, GY - 500, 80, 50, "#1e2226", { rx: 6, sw: 2 }) + C(GX + 220, GY - 475, 14, "#7fc0e0");
    if (o.scan) s += F("M" + (GX + 220) + " " + (GY - 450) + " L" + (GX + 60) + " " + (GY - 250) + " L" + (GX + 380) + " " + (GY - 250) + " Z", "#7cf2a0", { sw: 0, op: 0.25 + 0.15 * Math.sin(t * 10) });
    s += T("بوابة", GX + 220, GY - 520, 34, "#fff");
    var XX = GX + 700; s += '<g filter="url(#sh)">' + R(XX - 20, GY - 520, 50, 520, "#e8ecef") + R(XX + 420, GY - 520, 50, 520, "#e8ecef") + R(XX - 40, GY - 560, 530, 60, "#e8ecef") + '</g>' + T("☢", XX + 225, GY - 515, 40, "#e0862c", { w: 400 });
    if (o.xray) s += R(XX + 30, GY - 500, 390, 500, "url(#xray)", { sw: 0, op: 0.6 + 0.3 * Math.sin(t * 6) });
    // the rail line and the train
    s += P("M" + (GX + 1300) + " " + (GY - 6) + " H5200", "#5a5f66", 10) + P("M" + (GX + 1300) + " " + (GY + 6) + " H5200", "#3a3f46", 6);
    var trx = o.train == null ? GX + 1400 : o.train;
    for (var w = 0; w < 4; w++) { var wx = trx + w * 360; s += R(wx, GY - 70, 340, 40, "#3a3f46", { sw: 3 }) + C(wx + 50, GY - 22, 22, "#2a2e33") + C(wx + 290, GY - 22, 22, "#2a2e33") + box(wx + 20, GY - 70, BW, COLS[w % 6]); }
    s += '<g filter="url(#sh)">' + R(trx - 300, GY - 260, 280, 230, "#c7432c", { rx: 18 }) + '</g>' + R(trx - 260, GY - 230, 90, 70, "#9fd6ff", { sw: 2 }) + C(trx - 240, GY - 22, 24, "#2a2e33") + C(trx - 80, GY - 22, 24, "#2a2e33");
    return s; }
  function palms(t) { return K.palm(2300, t, 1.3) + K.palm(2540, t, 1.1) + K.palm(3420, t, 1.2) + K.palm(4200, t, 1.3); }

  // ── the whole scene: b = the parts on so far (+ this line's overrides o), h = this frame's state ──
  function scene(t, o, h) { o = o || {}; h = h || {}; var b = K.has(o), s = "";
    var hq = { quay: b.quay || h.quay, dgPos: (b.chan || h.dgPos != null) ? (h.dgPos == null ? 200 : h.dgPos) : null, silt: h.silt || 0, night: h.night, storm: h.storm };
    s += sky(t, h) + palms(t) + sea(t, hq) + ground(t, hq);
    if (b.quay || h.piles != null) s += quay(t, { piles: h.piles, deck: h.deck });
    if (b.yard || h.yard) s += stacks(t, { n: h.stackN, same: h.same, nums: h.nums, find: h.find, num: h.num, glow: h.glow }) + rtg(t, h.rtg || {});
    if (b.reefer || h.reefer) s += reefers(t, { k: h.reeferK, plug: h.plug, cold: h.cold });
    if (b.gate || h.gate) s += gate(t, h.gateO || {});
    if (h.dredger) s += dredger(t, h.dredger, hq, h.jet);
    if (h.boat) s += boat(t, -330, h.sacks == null ? 8 : h.sacks);
    if (h.ship) s += ship(t, h.ship);
    s += seaOver(t, hq);
    if (b.crane || h.crane) s += rails() + crane(t, h.crane || {});
    if (h.pile) s += cargoPile(h.pile, 120, GY);
    return s; }

  K.steps([[4, { crane: 1 }], [6, { quay: 1 }], [8, { chan: 1 }], [12, { yard: 1 }], [16, { reefer: 1 }], [22, { gate: 1 }]]);
  var FEED = function (n) { var b = []; for (var i = 0; i < 3; i++) { var bay = []; for (var j = 0; j < n; j++) bay.push({ col: COLS[(i * 2 + j * 3) % 6] }); b.push(bay); } return b; };
  var BIG = fullBays(3, 4), FEEDER = { x: -460, len: 1180, draft: 110, small: 1 };
  function bigAt(x, extra) { return Object.assign({ x: x, len: 1340, draft: 600, bays: BIG }, extra || {}); }
  var MAN = { carry: { lean: 4, head: -4, aN: [20, 160], aF: [14, 156], lN: [4, 2], lF: [-4, -2] },
              lift: { lean: 24, head: 6, aN: [70, 80], aF: [64, 76], lN: [24, -10], lF: [-20, -26] } };

  // 0 — a small boat, cargo carried ashore by hand: a port
  S(0, [-150, 800, 2.3], [-120, 820, 2.1], function (u, d, t) {
    var n = Math.floor(clamp(u / 3.6) * 5), s = scene(t, {}, { boat: 1, sacks: 8 - n, pile: n + 1 });
    s += act(u, [[0, { x: -10, y: GY, f: -1, p: "crouch", mood: "n" }], [1.0, { x: -10, y: GY, f: 1, mood: "n" }], [2.0, { x: 60, y: GY, f: 1, p: "crouch", mood: "n" }], [3.2, { x: 60, y: GY, f: 1, p: "thumbs", mood: "happy" }]], t);
    if (u > 1.0 && u < 2.3) s += sack(u < 2.0 ? -10 - 4 : 60 + 22, GY - MH - 4, 1);
    return s + pill("ميناء!", -420, 560, u, 3.0, { col: "#ffd23a" });
  });
  // 1 — but the cargo is sacks and barrels; the men take days carrying it piece by piece
  S(1, [160, 790, 2.0], [180, 800, 2.1], function (u, d, t) {
    var s = scene(t, {}, { boat: 1, sacks: 6, pile: 14 });
    var day = Math.floor(clamp(u / 4.6) * 4) + 1;
    s += act(u, [[0, { x: 300, y: GY, f: -1, mood: "n", shirt: "#7a5a3a", shirtD: "#4a3420", vest: 0, hat: 0, outfit: "casual" }], [2.4, { x: -10, y: GY, f: -1, p: "crouch", mood: "n", shirt: "#7a5a3a", shirtD: "#4a3420", vest: 0, hat: 0, outfit: "casual" }]], t);
    s += act(u, [[0, { x: 410, y: GY, f: -1, p: "stand", mood: "n" }], [1.6, { x: 410, y: GY, f: -1, p: "collar", mood: "dizzy" }], [3.6, { x: 410, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + pill("اليوم " + day, 200, 600, u, 1.2, { bg: "#c7321f" }) + xmark(150, GY - 330, u, 3.0);
  });
  // 2 — so everything goes in one steel box, the same size all over the world: the container
  S(2, [330, 770, 2.0], [340, 780, 1.8], function (u, d, t) {
    var bk = ease(clamp(u / 1.0)), s = scene(t, {}, { pile: Math.max(0, 14 - Math.floor(clamp((u - 1.2) / 2.4) * 14)) });
    s += '<g transform="translate(' + f((1 - bk) * 700) + ' 0)">' + box(160, GY, BW * 2 + 10, "#c7432c", { glow: u > 3.6 ? 0.5 + 0.4 * Math.sin(t * 6) : 0 }) + '</g>';
    s += act(u, [[0, { x: 60, y: GY, f: 1, p: "push", mood: "n" }], [3.4, { x: 60, y: GY, f: 1, p: "thumbs", mood: "happy" }], [4.6, { x: 60, y: GY, f: 1, p: "cheer", mood: "proud" }], [5.6, { x: 60, y: GY, f: 1, p: "point", mood: "happy" }]], t);
    return s + pill("مقاس واحد", 470, GY - 230, u, 1.6) + pill("الكونتينر", 470, GY - 380, u, 4.0, { col: "#ffd23a" });
  });
  // 3 — but a full container can weigh thirty tonnes; no man can lift it
  S(3, [320, 770, 1.9], [320, 780, 2.05], function (u, d, t) {
    var s = scene(t, {}, {}) + '<g transform="translate(' + f(u < 2.6 ? Math.sin(t * 40) * 2 : 0) + ' 0)">' + box(160, GY, BW * 2 + 10, "#c7432c", {}) + '</g>';
    s += act(u, [[0, { x: 110, y: GY, f: 1, p: "push", mood: "n" }], [0.7, { x: 110, y: GY, f: 1, p: MAN.lift, mood: "n" }], [1.4, { x: 110, y: GY, f: 1, p: MAN.lift, mood: "sick" }], [2.6, { x: 90, y: GY, f: 1, p: "shock", mood: "shock" }]], t);
    return s + pill("30 طن", 470, GY - 250, u, 0.8, { bg: "#c7321f" }) + xmark(470, GY - 430, u, 2.6);
  });
  // 4 — so you put up a giant crane on rails; its boom reaches over the ship; about thirty boxes an hour
  S(4, [-260, 380, 0.62], [-300, 300, 0.5], function (u, d, t) {
    var ck = clamp(u / 2.6), cyc = clamp((u - 3.0) / 4.0), tx, sy, load = null, s;
    var bays = FEED(2); if (cyc > 0.15) bays[2][1] = null;
    if (cyc <= 0) { tx = -560; sy = GY - 700; } else if (cyc < 0.15) { tx = lerp(-560, -460, cyc / 0.15); sy = lerp(GY - 700, WY - 210 - 2 * BH - 4, cyc / 0.15); }
    else if (cyc < 0.6) { var q = (cyc - 0.15) / 0.45; tx = lerp(-460, 360, ease(q)); sy = GY - 600 - Math.sin(q * Math.PI) * 150; load = { col: COLS[(2 * 2 + 3) % 6] }; }
    else { var q2 = (cyc - 0.6) / 0.4; tx = 360; sy = lerp(GY - 600, GY - BH - 4, ease(q2)); load = { col: COLS[(2 * 2 + 3) % 6] }; }
    s = scene(t, { crane: 1 }, { ship: Object.assign({}, FEEDER, { bays: bays }), crane: { k: ck, tx: tx, sy: sy, load: load } });
    s += act(u, [[0, { x: 640, y: GY, f: -1, p: "pointUp", mood: "n" }], [4.4, { x: 640, y: GY, f: -1, p: "cheer", mood: "happy" }]], t);
    return s + pill("ونش الرصيف", 300, -560, u, 2.4, { col: "#ffd23a" }) + pill("30 كونتينر/ساعة", -600, GY - 980, u, 4.2, { col: "#ffd23a", sz: 34 });
  });
  // 5 — but the crane can weigh more than a thousand tonnes; on beach sand it sinks
  S(5, [280, 520, 0.7], [300, 640, 0.8], function (u, d, t) {
    var sk = ease(clamp((u - 0.8) / 2.6)), s = scene(t, {}, { ship: Object.assign({}, FEEDER, { bays: FEED(2) }), crane: { sink: sk, tx: -300, sy: GY - 700 } });
    for (var k = 0; k < 12; k++) { var p = (t * 0.9 + hash(k)) % 1; s += C((k % 2 ? CL0 : CL1) + (hash(k + 4) - 0.5) * 240, GY - p * 120, 10 + p * 18, "#d8b880", { op: (1 - p) * sk }); }
    s += act(u, [[0, { x: 780, y: GY, f: -1, p: "stand", mood: "n" }], [1.4, { x: 780, y: GY, f: -1, p: "shock", mood: "shock" }], [3.2, { x: 780, y: GY, f: -1, p: "cover", mood: "shock" }]], t);
    return s + pill("+1000 طن", 300, -250, u, 0.6, { bg: "#c7321f" }) + xmark(560, GY + 120, u, 2.2);
  });
  // 6 — so you drive long concrete piles down to the hard layer and cast the quay deck on top
  S(6, [300, 1500, 0.52], [300, 1000, 0.6], function (u, d, t) {
    var pk = clamp((u - 0.3) / 2.6), dk = clamp((u - 3.0) / 1.4), up = clamp((u - 3.6) / 1.0);
    var s = scene(t, {}, { quay: dk > 0.95, piles: pk, deck: dk, ship: Object.assign({}, FEEDER, { bays: FEED(2) }), crane: { sink: 1 - ease(up), tx: -300, sy: GY - 700 } });
    s += act(u, [[0, { x: 820, y: GY, f: -1, p: "point", mood: "n" }], [3.8, { x: 820, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("خوازيق", 300, 1500, u, 0.8, { col: "#ffd23a" }) + pill("الطبقة الصلبة", 620, HARD + 110, u, 1.8) + pill("الرصيف", 400, GY - 150, u, 3.6, { col: "#9fe8b0" });
  });
  // 7 — but the full ship draws about sixteen metres and grounds before it reaches you
  S(7, [-900, 1050, 0.42], [-1000, 1120, 0.45], function (u, d, t) {
    var x = lerp(-2400, -1105, ease(clamp(u / 2.6))), stuck = u > 2.6, s = scene(t, {}, { ship: bigAt(x + (stuck ? Math.sin(t * 20) * 4 : 0)), crane: { tx: -300, sy: GY - 700 } });
    if (stuck) for (var k = 0; k < 10; k++) { var p = (t * 0.8 + hash(k)) % 1; s += C(x - 140 + hash(k + 2) * 120, WY + 600 - p * 140, 14 + p * 20, "#c9a36a", { op: 1 - p }); }
    s += act(u, [[0, { x: 300, y: GY, f: -1, p: "stand", mood: "n" }], [2.6, { x: 300, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + dim(x - 700, WY, WY + 600, "16 متر", clamp((u - 1.0) / 1.0)) + xmark(x - 160, WY + 640, u, 2.8, 1.0);
  });
  // 8 — so a dredger sucks the sand off the bottom and digs a channel about eighteen metres deep
  S(8, [-1100, 1200, 0.42], [-700, 1100, 0.48], function (u, d, t) {
    var dp = lerp(-3200, -60, clamp(u / 3.6)), sx = u < 3.8 ? -1105 : lerp(-1105, -120, ease(clamp((u - 3.8) / 1.4)));
    var s = scene(t, {}, { dgPos: dp, ship: bigAt(sx), dredger: u < 3.8 ? Math.min(dp + 260, 200) - 0 : null, jet: true, crane: { tx: -300, sy: GY - 700 } });
    s += act(u, [[0, { x: 300, y: GY, f: -1, p: "point", mood: "n" }], [4.2, { x: 300, y: GY, f: -1, p: "cheer", mood: "happy" }]], t);
    return s + dim(-2500, WY, WY + 700, "18 متر", clamp((u - 2.0) / 1.0), "#9fe8b0");
  });
  // 9 — but the sea fills the channel back with silt, little by little
  S(9, [-950, 1700, 0.7], [-950, 1760, 0.76], function (u, d, t) {
    var sl = clamp(u / 2.8) * 0.75, s = scene(t, { chan: 1 }, { silt: sl, ship: bigAt(-120), crane: { tx: -300, sy: GY - 700 } });
    for (var k = 0; k < 40; k++) { var p = (t * 0.25 + hash(k)) % 1; s += C(-1800 + hash(k + 1) * 1700, lerp(WY + 80, WY + 680 - sl * 170, p), 6, "#8f7a52", { op: 0.8 * (1 - p) }); }
    s += act(u, [[0, { x: 140, y: GY, f: -1, p: "stand", mood: "n" }], [2.2, { x: 140, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + pill("طمي", -900, WY + 380, u, 0.8, { bg: "#c7321f" }) + xmark(-500, WY + 560, u, 2.4);
  });
  // 10 — so the dredger comes back every so often and sucks again
  S(10, [-900, 1200, 0.6], [-800, 1150, 0.55], function (u, d, t) {
    var dp = lerp(-3000, -60, clamp(u / 2.6)), s = scene(t, {}, { dgPos: dp, silt: 0.75 * (1 - clamp((u - 0.2) / 2.4)), ship: bigAt(-120), dredger: -2150 + clamp(u / 2.6) * 300, crane: { tx: -300, sy: GY - 700 } });
    s += act(u, [[0, { x: 140, y: GY, f: -1, p: "point", mood: "n" }], [2.0, { x: 140, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كل فترة", -1250, WY - 420, u, 0.6, { col: "#9fe8b0" });
  });
  // 11 — but the boxes pile up on the quay and the crane stands waiting
  S(11, [380, 520, 0.95], [400, 600, 1.05], function (u, d, t) {
    var n = Math.floor(clamp(u / 2.0) * 5), bays = fullBays(3, 4); bays[2] = bays[2].slice(0, 2);
    var s = scene(t, {}, { ship: bigAt(-120, { bays: bays }), crane: { tx: 360, sy: GY - 5 * BH - 160, load: { col: "#2f6fa8" } } });
    for (var i = 0; i < n; i++) s += box(i < 3 ? 120 + i * 0 : 440, GY - (i < 3 ? i : i - 3) * BH, BW, COLS[(i + 2) % 6]);
    s += act(u, [[0, { x: 820, y: GY, f: -1, p: "stand", mood: "n" }], [2.2, { x: 820, y: GY, f: -1, p: "collar", mood: "worry" }]], t);
    return s + pill("زحمة!", 360, GY - 900, u, 2.0, { bg: "#c7321f" }) + xmark(-20, GY - 1000, u, 2.6);
  });
  // 12 — so you build a yard behind the quay, and a gantry on tyres stacks them five or six high
  S(12, [900, 560, 0.7], [1150, 520, 0.8], function (u, d, t) {
    var n = clamp((u - 0.4) / 3.4), cyc = (u * 0.45) % 1, rtx = lerp(1200, 1520, Math.abs(Math.sin(u * 0.8)));
    var s = scene(t, { yard: 1 }, { yard: 1, stackN: n, ship: bigAt(-120), crane: { tx: 360, sy: GY - 500 }, rtg: { tx: rtx, sy: GY - 5 * BH - 30 } });
    s += truck(lerp(300, 700, ease(cyc)), { col: "#3a8a5a" });
    s += act(u, [[0, { x: 820, y: GY, f: 1, p: "point", mood: "n" }], [3.6, { x: 820, y: GY, f: 1, p: "cheer", mood: "happy" }]], t);
    return s + pill("5–6 أدوار", 1340, GY - 5 * BH - 260, u, 2.4, { col: "#ffd23a" });
  });
  // 13 — but among thousands of boxes that look alike, how will you find yours?
  S(13, [1440, 620, 1.2], [1460, 640, 1.3], function (u, d, t) {
    var s = scene(t, {}, { same: 1, stackN: 1, rtg: { tx: 1360, sy: GY - 5 * BH - 30 } });
    s += act(u, [[0, { x: 1900, y: GY, f: -1, mood: "n" }], [1.2, { x: 1800, y: GY, f: -1, p: "shrug", mood: "worry" }], [3.0, { x: 1800, y: GY, f: -1, p: "worry", mood: "worry" }]], t);
    return s + pill("فين بتاعي؟", 1360, GY - 5 * BH - 120, u, 1.2, { bg: "#c7321f" });
  });
  // 14 — so every box carries a number: four letters and seven digits; the computer knows where each one is
  S(14, [1480, 640, 1.3], [1500, 600, 1.15], function (u, d, t) {
    var s = scene(t, {}, { stackN: 1, nums: 1, find: 6, num: "EGPU 482913 6", glow: u > 2.4 ? 0.6 + 0.4 * Math.sin(t * 8) : 0, rtg: { tx: 1360, sy: GY - 5 * BH - 30 } });
    s += R(1952, GY - 520, 16, 520, "#5a5f66") + screen(1830, GY - 700, 260, 190, "map", clamp((u - 2.0) / 0.5), t);
    s += act(u, [[0, { x: 1800, y: GY, f: -1, p: "point", mood: "n" }], [2.6, { x: 1800, y: GY, f: -1, p: "thumbs", mood: "happy", phone: 1 }]], t);
    return s + pill("4 حروف + 7 أرقام", 1300, GY - 5 * BH - 130, u, 0.6, { col: "#ffd23a", sz: 34 });
  });
  // 15 — but Egypt is the world's biggest orange exporter, and oranges spoil if they get hot on the way
  S(15, [2060, 700, 1.35], [2060, 720, 1.5], function (u, d, t) {
    var heat = clamp((u - 1.4) / 1.2), s = scene(t, {}, {}) + orangeBox(t, 1920, GY, clamp((u - 2.2) / 1.6) * 0.7, heat) + thermo(2330, GY - 200, lerp(0.3, 0.95, heat), heat);
    s += act(u, [[0, { x: 1800, y: GY, f: 1, p: "thumbs", mood: "happy" }], [2.4, { x: 1800, y: GY, f: 1, p: "worry", mood: "worry" }]], t);
    return s + pill("مصر الأولى في البرتقان", 2080, GY - 420, u, 0.4, { col: "#ffb04a", sz: 34 }) + xmark(2070, GY - 270, u, 3.4, 0.7);
  });
  // 16 — so the yard gets rows of power plugs for boxes with a fridge inside: reefer containers
  S(16, [2280, 640, 1.1], [2300, 660, 1.2], function (u, d, t) {
    var s = scene(t, { reefer: 1 }, { reefer: 1, reeferK: clamp(u / 1.2), plug: clamp((u - 1.4) / 1.4), cold: clamp((u - 2.6) / 1.0) }) + thermo(2700, GY - 480, lerp(0.8, 0.2, clamp((u - 2.6) / 1.4)), clamp(u - 2.4), true);
    s += act(u, [[0, { x: 2620, y: GY, f: -1, p: "reach", mood: "n" }], [3.0, { x: 2620, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("فيش كهربا", 2450, GY - 3 * BH - 120, u, 1.4) + pill("الحاويات المبردة", 2200, GY - 3 * BH - 260, u, 3.6, { col: "#9fd6ff", sz: 36 });
  });
  // 17 — but heavy boxes over light ones, and the ship can lean and capsize
  S(17, [-760, 560, 0.62], [-760, 600, 0.7], function (u, d, t) {
    var tl = clamp((u - 1.2) / 2.0), s = scene(t, {}, { ship: bigAt(-120, { bays: fullBays(5, 4, true), tilt: -tl * 7 * (1 + 0.2 * Math.sin(t * 3)) }), crane: { tx: -300, sy: GY - 800 } });
    s += act(u, [[0, { x: 160, y: GY, f: -1, p: "stand", mood: "n" }], [2.0, { x: 160, y: GY, f: -1, p: "shock", mood: "shock" }]], t);
    return s + pill("تقيل فوق!", -760, -150, u, 0.6, { bg: "#c7321f" }) + xmark(-200, -200, u, 2.6, 1.0);
  });
  // 18 — so the computer draws a loading plan: heavy at the bottom, light on top
  S(18, [-560, 560, 0.62], [-600, 520, 0.66], function (u, d, t) {
    var bays = fullBays(5, 4, true), k = clamp((u - 1.2) / 1.6);
    bays.forEach(function (bay) { bay.forEach(function (c, j) { var heavy = (k > 0.5) ? j === 0 : j === 3; c.col = heavy ? "#3a3f46" : "#e8ecef"; c.o = { tag: heavy ? "30t" : "5t", tagBg: heavy ? "#c7321f" : "#3aa05a" }; }); });
    var s = scene(t, {}, { ship: bigAt(-120, { bays: bays, tilt: -7 * (1 - k) }), crane: { tx: 300, sy: GY - 800 } }) + screen(-700, -330, 420, 300, "plan", clamp((u - 0.3) / 0.6), t);
    s += act(u, [[0, { x: 300, y: GY, f: -1, p: "point", mood: "n" }], [2.8, { x: 300, y: GY, f: -1, p: "thumbs", mood: "happy" }]], t);
    return s + vmark(-200, -200, u, 3.0, 1.0);
  });
  // 19 — the odd thing: many people think containers never fall off ships
  S(19, [-1300, 640, 0.55], [-1500, 640, 0.55], function (u, d, t) {
    var s = scene(t, {}, { ship: bigAt(lerp(-120, -900, ease(clamp(u / 3.4)))), crane: { tx: -300, sy: GY - 800 } });
    s += act(u, [[0, { x: 200, y: GY, f: -1, p: "wave", mood: "happy" }], [1.8, { x: 200, y: GY, f: -1, p: "shrug", mood: "happy" }]], t);
    return s + pill("مستحيل تقع؟", -900, -520, u, 1.0, { sz: 40 });
  });
  // 20 — really, on average more than a thousand containers fall into the sea every year
  S(20, [-1700, 760, 0.6], [-1700, 820, 0.66], function (u, d, t) {
    var st = clamp(u / 0.8), roll = Math.sin(t * 1.8) * 9 * st, fall = clamp((u - 1.2) / 1.6), bays = fullBays(3, 4), s;
    bays[1][3] = null; bays[2][3] = null;
    s = scene(t, {}, { storm: st, ship: bigAt(-1100, { bays: bays, tilt: roll }) });
    [0, 1].forEach(function (i) { var fx = -1100 - 1340 + 230 + (i + 1) * 310 + fall * 260 * (i + 1), fy = WY - 210 - 3 * BH - 10 + fall * fall * 700; s += '<g transform="rotate(' + f(fall * 70 * (i ? 1 : 0.8)) + ' ' + f(fx + 150) + ' ' + f(fy - 65) + ')">' + box(fx, fy, BW, COLS[i + 2]) + '</g>'; });
    if (fall > 0.6) for (var k = 0; k < 8; k++) s += C(-1400 + k * 90, WY - 20 - Math.abs(Math.sin(t * 3 + k)) * 80, 18, "#eaf7ff", { op: 0.8 });
    if (u > 0.4 && Math.sin(t * 2.7) > 0.96) s += P("M-1200 -1800 L-1300 -1300 L-1220 -1300 L-1340 -700", "#ffe46a", 12);
    return s + pill("+1000 كل سنة", -1700, -420, u, 2.0, { bg: "#c7321f", sz: 44 });
  });
  // 21 — so the quay workers lock each box to the one under it at the corners, and add steel bars
  S(21, [-930, 640, 1.9], [-900, 660, 1.75], function (u, d, t) {
    var s = scene(t, {}, { ship: bigAt(-120, { lash: clamp((u - 0.8) / 2.2) }), crane: { tx: 360, sy: GY - 800 } });
    var deckY = WY - 210, bx = -120 - 1340 + 230;
    s += act(u, [[0, { x: bx + 330, y: deckY, f: 1, p: "reach", mood: "n" }], [2.0, { x: bx + 330, y: deckY, f: 1, p: "push", mood: "n" }], [3.6, { x: bx + 330, y: deckY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + ring(bx + 310, deckY - BH, 40, u, 1.0, t) + pill("أقفال الأركان", bx + 310, deckY - 2 * BH - 120, u, 1.2, { col: "#ffd23a", sz: 34 }) + pill("أسياخ حديد", bx + 640, deckY - 3 * BH - 160, u, 3.0, { col: "#9fe8b0", sz: 34 });
  });
  // 22 — what's left: a gate with cameras reading the numbers, an X-ray for customs, a train inland
  S(22, [2700, 520, 0.6], [3600, 560, 0.6], function (u, d, t) {
    var s = scene(t, { gate: 1 }, { gate: 1, gateO: { scan: u > 0.4 && u < 2.4, xray: u > 2.0, train: lerp(4000, 4900, clamp((u - 3.0) / 2.6)) } });
    s += truck(lerp(2400, 3640, clamp(u / 4.0)), { col: "#3a8a5a", o: { num: "EGPU 482913 6" } });
    s += act(u, [[0, { x: 2700, y: GY, f: 1, mood: "n" }], [2.6, { x: 3300, y: GY, f: 1, p: "thumbs", mood: "happy" }]], t);
    return s + pill("كاميرات", GX + 220, GY - 700, u, 0.4, { sz: 34 }) + pill("أشعة", GX + 925, GY - 700, u, 2.0, { col: "#9fe8b0", sz: 34 }) + pill("قطر", GX + 1900, GY - 400, u, 3.4, { col: "#ffd23a", sz: 34 });
  });
  // 23 — congratulations, you built a container port yourself
  S(23, [400, 700, 0.42], [700, 520, 0.3], function (u, d, t) {
    var s = scene(t, {}, { yard: 1, reefer: 1, ship: bigAt(-120, { lash: 1 }), crane: { tx: -300, sy: GY - 600 }, gate: 1, gateO: { train: 4300 } }) + K.confetti(t, -600, 1600, -900, GY);
    s += act(u, [[0, { x: 820, y: GY, f: -1, p: "cheer", mood: "happy" }], [1.6, { x: 820, y: GY, f: -1, p: "thumbs", mood: "proud" }]], t);
    return s + pill("مبروك!", 700, -1300, u, 0.4, { col: "#9fe8b0", sz: 60 });
  });
  // 24 — outro
  S(24, [700, 560, 0.34], [700, 600, 0.38], function (u, d, t) {
    var s = scene(t, {}, { yard: 1, reefer: 1, ship: bigAt(-120, { lash: 1 }), crane: { tx: -300, sy: GY - 600 }, gate: 1, gateO: { train: 4300 } });
    s += act(u, [[0, { x: 820, y: GY, f: -1, p: "wave", mood: "happy" }]], t);
    return s + pill("قولولنا!", 700, -1200, u, 0.4, { col: "#ffd23a", sz: 60 });
  });
  window.__port = { scene: scene, ship: ship, bigAt: bigAt };
})();
