
  // ── «ابنيها بنفسك» house style (as in the pool and the plane): 2.5D oblique, thin dark outlines, gradients, our pills.
  // The plant follows the real VVER-1200 (El Dabaa): hexagonal fuel assemblies, a forest of rod drives on the vessel head,
  // horizontal steam generators inside a cylindrical containment with a dome, the turbine hall outside, sea-water cooling.
  // O(x, h, z): x along the plant, h up, z depth (0 = the cut through the ground at the front).
  var GY = 400, INKL = "#1d1b19";
  function O(x, h, z) { return [x + z * .34, GY - h - z * .26]; }
  function pt(p) { return f(p[0]) + " " + f(p[1]); }
  function ln(w) { return ' stroke="' + INKL + '" stroke-width="' + (w || 1.6) + '" stroke-linejoin="round"'; }
  function face(pts, fill, w, op) { return '<path d="M' + pts.map(function (q) { return pt(O(q[0], q[1], q[2])); }).join(" L") + ' Z" fill="' + fill + '"' + ln(w) + (op != null ? ' opacity="' + f(op) + '"' : '') + '/>'; }
  function prism(x0, x1, h0, h1, z0, z1, cF, cT, cS, w) {   // a box: front (z0), top (h1), right side (x1)
    return face([[x1, h0, z0], [x1, h0, z1], [x1, h1, z1], [x1, h1, z0]], cS, w) + face([[x0, h1, z0], [x1, h1, z0], [x1, h1, z1], [x0, h1, z1]], cT, w) + face([[x0, h0, z0], [x1, h0, z0], [x1, h1, z0], [x0, h1, z0]], cF, w);
  }
  function ellH(cx, h, z, r, fill, w, op) { var c = O(cx, h, z); return '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f(r) + '" ry="' + f(r * .3) + '" fill="' + fill + '"' + ln(w) + (op != null ? ' opacity="' + f(op) + '"' : '') + '/>'; }
  function cylV(cx, z, r, h0, h1, fill, top, w) {          // a standing cylinder: body + top ellipse
    var a = O(cx - r, h1, z), b = O(cx + r, h0, z), bc = O(cx, h0, z);
    return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' V' + f(b[1]) + ' A' + f(r) + ' ' + f(r * .3) + ' 0 0 0 ' + f(b[0]) + ' ' + f(b[1]) + ' V' + f(a[1]) + ' Z" fill="' + fill + '"' + ln(w) + '/>' + ellH(cx, h1, z, r, top || fill, w);
  }
  function cylX(x0, x1, h, z, r, fill, end, w) {          // a lying cylinder along x: body + right end cap
    var a = O(x0, h + r, z), b = O(x1, h - r, z), e = O(x1, h, z);
    return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' H' + f(b[0]) + ' V' + f(b[1]) + ' H' + f(a[0]) + ' A' + f(r * .34) + ' ' + f(r) + ' 0 0 1 ' + f(a[0]) + ' ' + f(a[1]) + ' Z" fill="' + fill + '"' + ln(w) + '/><ellipse cx="' + f(e[0]) + '" cy="' + f(e[1]) + '" rx="' + f(r * .34) + '" ry="' + f(r) + '" fill="' + (end || fill) + '"' + ln(w) + '/>';
  }
  function pipe(pts, z, flow, t, col, w) {                // a pipe through points [x, h] at depth z; flow = moving dots
    w = w || 7; var d = "M" + pts.map(function (q) { return pt(O(q[0], q[1], z)); }).join(" L"), s = '<path d="' + d + '" fill="none" stroke="' + INKL + '" stroke-width="' + (w + 3) + '" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#f1f3f5" stroke-width="' + w + '" stroke-linejoin="round"/>';
    if (flow > 0) s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w * .6) + '" stroke-linecap="round" stroke-dasharray="0.1 11" stroke-dashoffset="' + f(-t * 34) + '" opacity="' + f(flow) + '"/>';
    return s;
  }

  // ── events ───────────────────────────────────────
  var EV = window.EV = {
    yay0: W(0, "مبروك"), cold: L(1) + .5, purify: W(2, "بتنقّيه"), pellets: W(3, "حبيبات"), coal: W(3, "طن"), tubes: W(4, "أنابيب"), rodsTag: W(4, "قضبان"),
    split: W(5, "بتتكسر"), bullets: W(5, "رصاصات"), hot: W(5, "فالسخونة"), over: W(6, "تزيد"), ctrl: W(7, "تانية"), ctrlTag: W(7, "التحكم"),
    down: W(8, "تنزّلها"), up: W(8, "ترفعها"), boil: W(9, "تلتمية"), fly: W(9, "وتغلي"), vessel: W(10, "وعاء"), bar: W(10, "سبعين"), vesTag: W(11, "وعاء"),
    radio: W(12, "مشعة"), sg: W(13, "مواسير"), steam: W(13, "بخار"), turb: W(14, "توربينة"), gen: W(14, "مولد"), power: W(14, "الكهربا"), sea: W(15, "البحر"),
    quake: W(16, "زلزال"), hit: W(16, "خبطت"), dome: W(17, "بقبة"), meter: W(17, "متر"), card: L(18) - .1, glow: W(18, "بتنوّر"), cardEnd: E(18) + .25,
    pool: W(19, "حوض"), diesel: W(19, "ومولدات"), fence: W(19, "وأسوار"), yay: W(20, "ومبروك"), vote: L(21) + .3
  };

  // ── the coast at El Dabaa: clear sky, white sand dunes, the turquoise Mediterranean on the right ─────
  function scenery(t) {
    var s = '<rect x="-1400" y="-800" width="4200" height="1400" fill="url(#gSkyClear)"/>';
    s += '<circle cx="620" cy="-120" r="70" fill="#fff6c8" opacity=".5" filter="url(#soft)"/><circle cx="620" cy="-120" r="24" fill="#fff3b0"/>';
    for (var i = 0; i < 12; i++) { var x = ((hash(i) * 2800 + t * (5 + hash(i + 2) * 5)) % 2800) - 1200, y = -260 + hash(i + 7) * 200, w = 40 + hash(i * 3) * 50; s += '<g fill="#fff" opacity=".95"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * .28) + '"/><ellipse cx="' + f(x - w * .3) + '" cy="' + f(y - w * .15) + '" rx="' + f(w * .45) + '" ry="' + f(w * .3) + '"/></g>'; }
    // the ground plane (sand) receding to z = 420, the sea from x 960
    var far = 420;
    s += face([[-1400, 0, 0], [960, 0, 0], [900, 0, far], [-1400, 0, far]], "#f1e3c2", 0);
    s += face([[960, 0, 0], [2600, 0, 0], [2600, 0, far], [900, 0, far]], "url(#gSea)", 0);
    for (var w2 = 0; w2 < 14; w2++) { var wx = 980 + (w2 % 7) * 120 + Math.sin(t * 1.4 + w2) * 8, wz = 40 + Math.floor(w2 / 7) * 160 + hash(w2) * 60, p = O(wx, 0, wz); s += '<path d="M' + pt(p) + ' q12 -4 24 0" stroke="#e9fbff" stroke-width="2" fill="none" opacity=".8"/>'; }
    var sh = O(960, 0, 0), sh2 = O(900, 0, far); s += '<path d="M' + pt(sh) + ' L' + pt(sh2) + '" stroke="#fff" stroke-width="5" opacity=".9"/>';
    for (var d = 0; d < 6; d++) { var dx = -1300 + d * 260, dp = O(dx, 0, 380); s += '<path d="M' + f(dp[0] - 80) + ' ' + f(dp[1]) + ' Q' + f(dp[0]) + ' ' + f(dp[1] - 40) + ' ' + f(dp[0] + 90) + ' ' + f(dp[1]) + ' Z" fill="#e8d3a6"/>'; }
    // the cut at the front: sand over limestone, the sea cut on the right
    s += '<rect x="-1400" y="' + GY + '" width="2360" height="600" fill="url(#gSandCut)"/><rect x="960" y="' + GY + '" width="1700" height="600" fill="#2b8fb8"/>';
    for (var r = 0; r < 70; r++) s += '<ellipse cx="' + f(-1300 + hash(r) * 2250) + '" cy="' + f(GY + 24 + hash(r + 4) * 260) + '" rx="' + f(3 + hash(r + 1) * 5) + '" ry="2.4" fill="#b79a6a" opacity=".6"/>';
    s += '<path d="M-1400 ' + (GY + 70) + ' Q-200 ' + (GY + 60) + ' 960 ' + (GY + 74) + '" stroke="#c9b083" stroke-width="2" fill="none"/>';
    return s;
  }

  // ── the reactor island (inside the containment footprint x 90…510 at depth 150) ─────
  var CZ = 150, VX = 200;
  function heatCol(h) { var a = [86, 92, 100], b = [255, 128, 40]; return "rgb(" + a.map(function (v, i) { return Math.round(lerp(v, b[i], clamp(h))); }).join(",") + ")"; }
  function hexCore(t, heat, base) {              // seven hexagonal fuel assemblies seen from the front: tall six-sided prisms
    var s = "";
    for (var k = 0; k < 7; k++) { var x = VX - 39 + k * 13, p0 = O(x, base, CZ), p1 = O(x, base + 92, CZ);
      s += '<path d="M' + f(p0[0] - 5) + ' ' + f(p0[1]) + ' V' + f(p1[1] + 3) + ' L' + f(p1[0]) + ' ' + f(p1[1] - 2) + ' L' + f(p1[0] + 5) + ' ' + f(p1[1] + 3) + ' V' + f(p0[1]) + ' Z" fill="' + heatCol(heat) + '"' + ln(1.1) + '/>';
      s += '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + ' V' + f(p1[1] - 2) + '" stroke="#000" stroke-width=".8" opacity=".25"/>'; }
    if (heat > .25) { var c = O(VX, base + 46, CZ); s += '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="62" ry="64" fill="#ff8a3c" opacity="' + f((heat - .25) * .5 * (.85 + .15 * Math.sin(t * 6))) + '" filter="url(#soft)"/>'; }
    return s;
  }
  function rodsIn(t, depth, on, base) {          // control rods hanging between the assemblies
    if (on <= 0) return ""; var s = "";
    for (var k = 0; k < 6; k++) { var x = VX - 32 + k * 13, top = O(x, 300, CZ), bot = O(x, lerp(base + 120, base + 10, depth), CZ); s += '<path d="M' + pt(top) + ' L' + f(top[0]) + ' ' + f(lerp(top[1], bot[1], on)) + '" stroke="#26292d" stroke-width="3.4"/>'; }
    return s;
  }
  function openTank(t, k, boil) {                // the open water tank the bucket grows into (becomes the vessel cavity)
    if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">' + prism(VX - 70, VX + 70, 0, 130, CZ - 20, CZ + 40, "#e7f2f8", "#d5e7f0", "#c3d9e4") ;
    var wl = O(VX - 66, 120, CZ - 20), wr = O(VX + 66, 6, CZ - 20); s += '<rect x="' + f(wl[0]) + '" y="' + f(wl[1]) + '" width="' + f(wr[0] - wl[0]) + '" height="' + f(wr[1] - wl[1]) + '" fill="url(#gWaterR)" opacity=".55"/>';
    if (boil > 0) for (var b = 0; b < 16; b++) { var u = (t * 1.6 + b / 16) % 1, p = O(VX - 60 + hash(b) * 120, 10 + u * 110, CZ - 20); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(2 + u * 3) + '" fill="#fff" opacity="' + f(boil * (1 - u)) + '"/>'; }
    if (boil > .4) for (var w = 0; w < 5; w++) { var su = (t * .7 + w / 5) % 1, p2 = O(VX - 40 + w * 20, 140 + su * 80, CZ); s += '<ellipse cx="' + f(p2[0] + Math.sin(t + w) * 6) + '" cy="' + f(p2[1]) + '" rx="' + f(10 + su * 16) + '" ry="' + f(6 + su * 7) + '" fill="#fff" opacity="' + f(.7 * (1 - su) * boil) + '"/>'; }
    return s + '</g>';
  }
  function vesselV(t, k, tint, radio) {           // the VVER pressure vessel: steel cylinder, hemispherical bottom, nozzle belt, cut window, rod-drive forest on the head
    if (k <= 0) return ""; var e = ease(k), s = '<g opacity="' + f(clamp(k * 1.6)) + '">';
    s += prism(VX - 78, VX + 78, 0, 112, CZ - 40, CZ + 40, "url(#gConcR)", "#d8d4cc", "#b9b4aa");             // concrete cavity
    s += cylV(VX, CZ, 48, 22, 22 + 200 * e, "url(#gSteel)", "#9aa2ac", 2);
    var win0 = O(VX - 40, 40, CZ), win1 = O(VX + 40, 140, CZ); s += '<rect x="' + f(win0[0]) + '" y="' + f(win1[1]) + '" width="' + f(win1[0] - win0[0]) + '" height="' + f(win0[1] - win1[1]) + '" rx="8" fill="' + (tint ? "#a8dc8a" : "#a9d3ea") + '" opacity=".8"' + ln(1.4) + '/>';
    [[VX - 48, 150], [VX - 48, 120], [VX + 48, 150], [VX + 48, 120]].forEach(function (n) { var p = O(n[0], n[1], CZ); s += '<rect x="' + f(p[0] - (n[0] < VX ? 12 : 0)) + '" y="' + f(p[1] - 7) + '" width="12" height="14" rx="2" fill="#7a828c"' + ln(1.2) + '/>'; });
    if (e > .9) { s += ellH(VX, 222, CZ, 50, "#8a929c", 2); for (var c = 0; c < 9; c++) { var cx = VX - 36 + c * 9; s += cylV(cx, CZ - 6 + (c % 2) * 10, 3.2, 222, 266 + (c % 3) * 6, "#5a6068", "#9aa2ac", 1); } }
    if (radio > 0) { var rp = O(VX - 22, 190, CZ); s += '<g transform="translate(' + f(rp[0]) + ' ' + f(rp[1]) + ') scale(' + f(pop(radio)) + ')"><circle r="12" fill="' + YEL + '"' + ln(1.6) + '/>'; for (var a = 0; a < 3; a++) s += '<path d="M0 0 L' + f(10 * Math.cos(a * 2.094 - 1.57)) + ' ' + f(10 * Math.sin(a * 2.094 - 1.57)) + ' A10 10 0 0 1 ' + f(10 * Math.cos(a * 2.094 - .52)) + ' ' + f(10 * Math.sin(a * 2.094 - .52)) + ' Z" fill="' + INKL + '"/>'; s += '<circle r="3" fill="' + YEL + '" stroke="' + INKL + '" stroke-width="1.2"/></g>'; }
    return s + '</g>';
  }
  function pressurizer(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">' + cylV(300, CZ + 60, 16, 60, 230, "url(#gSteel)", "#b9c0c8", 1.6); var g = O(300, 248, CZ + 60), na = -2.2 + 3.8 * k + Math.sin(t * 7) * .05; return s + '<circle cx="' + f(g[0]) + '" cy="' + f(g[1]) + '" r="10" fill="#fff"' + ln(1.4) + '/><path d="M' + f(g[0]) + ' ' + f(g[1]) + ' L' + f(g[0] + Math.cos(na) * 8) + ' ' + f(g[1] + Math.sin(na) * 8) + '" stroke="' + RED + '" stroke-width="2"/></g>'; }
  function steamGenH(t, k, steam) {               // VVER steam generator: a long horizontal drum with the tube bundle inside
    if (k <= 0) return ""; var e = ease(k), s = '<g opacity="' + f(clamp(k * 1.6)) + '" transform="translate(0 ' + f((1 - e) * -30) + ')">';
    [345, 445].forEach(function (x) { s += prism(x - 6, x + 6, 0, 82, CZ - 6, CZ + 6, "#9aa2ac", "#b9c0c8", "#7a828c", 1.2); });
    s += cylX(330, 470, 110, CZ, 32, "url(#gSteelH)", "#c9ced4", 2);
    var a = O(342, 132, CZ), b = O(458, 88, CZ); s += '<rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" rx="8" fill="#eaf4fb"' + ln(1.2) + '/>';
    for (var u = 0; u < 5; u++) { var y = a[1] + 6 + u * 7.5; s += '<path d="M' + f(a[0] + 8) + ' ' + f(y) + ' H' + f(b[0] - 14) + ' a4 4 0 0 1 0 6 H' + f(a[0] + 8) + '" fill="none" stroke="#e0783a" stroke-width="1.6"/>'; }
    if (steam > 0) for (var p = 0; p < 7; p++) { var su = (t * .9 + p / 7) % 1, sp = O(400 + (hash(p) - .5) * 40, 142 + su * 50, CZ); s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(3 + su * 5) + '" fill="#fff" opacity="' + f(steam * (1 - su) * .9) + '"/>'; }
    return s + '</g>';
  }
  function pump(t, k) { if (k <= 0) return ""; var p = O(290, 40, CZ - 10); return '<g opacity="' + f(k) + '">' + cylV(290, CZ - 10, 16, 0, 56, "#5a87b8", "#7fa8d4", 1.6) + '<circle cx="' + f(p[0]) + '" cy="' + f(p[1] - 30) + '" r="6" fill="#26292d" transform="rotate(' + f(t * 300) + ' ' + f(p[0]) + ' ' + f(p[1] - 30) + ')"/></g>'; }

  // ── the containment: a cylinder (r 210) with a dome, cut open at the front so the island shows inside ─────
  //    back half first (its inner face), the contents, then the cut edges. Everything inside stays below h 300; the dome top is h 380.
  var CX = 300, CR = 210, CWALL = 230, CTOP = 380, CT = 16;
  function containBack(k) {
    if (k <= 0) return ""; var e = ease(k), wallH = Math.min(CWALL, (CTOP + 40) * e), dome = clamp((e * (CTOP + 40) - CWALL) / (CTOP + 40 - CWALL));
    var p0 = O(CX - CR, 0, CZ + 40), p1 = O(CX + CR, wallH, CZ + 40), s = '<rect x="' + f(p0[0]) + '" y="' + f(p1[1]) + '" width="' + f(p1[0] - p0[0]) + '" height="' + f(p0[1] - p1[1]) + '" fill="#d9d4ca" opacity=".55"/>';
    if (dome > 0) { var c = O(CX, CWALL, CZ + 40); s += '<path d="M' + f(c[0] - CR) + ' ' + f(c[1]) + ' A' + CR + ' ' + f((CTOP - CWALL) * dome) + ' 0 0 1 ' + f(c[0] + CR) + ' ' + f(c[1]) + ' Z" fill="#d9d4ca" opacity=".55"/>'; }
    return s;
  }
  function containCut(k) {
    if (k <= 0) return ""; var e = ease(k), wallH = Math.min(CWALL, (CTOP + 40) * e), dome = clamp((e * (CTOP + 40) - CWALL) / (CTOP + 40 - CWALL)), s = "";
    [CX - CR, CX + CR - CT].forEach(function (x) { s += prism(x, x + CT, 0, wallH, CZ - 6, CZ + 6, "url(#gConcR)", "#e3dfd7", "#b9b4aa", 1.6); });
    if (dome > 0) { var c = O(CX, CWALL, CZ), ry = (CTOP - CWALL) * dome, a0 = Math.PI, a1 = Math.PI + Math.PI * Math.min(1, dome * 1.15);
      function arc(rx, rr) { return 'M' + f(c[0] + Math.cos(a0) * rx) + ' ' + f(c[1] + Math.sin(a0) * rr) + ' A' + f(rx) + ' ' + f(rr) + ' 0 0 1 ' + f(c[0] + Math.cos(a1) * rx) + ' ' + f(c[1] + Math.sin(a1) * rr); }
      s += '<path d="' + arc(CR - CT / 2, ry - CT / 2 + 4) + '" fill="none" stroke="' + INKL + '" stroke-width="' + (CT + 3) + '"/><path d="' + arc(CR - CT / 2, ry - CT / 2 + 4) + '" fill="none" stroke="#d6d1c7" stroke-width="' + CT + '"/>'; }
    return s;
  }
  function turbineHall(t, k, gk, pk) {           // a hall outside the containment, cut open: turbine casings stepping up, the generator, a pylon
    var s = "";
    if (k > 0) { s += '<g opacity="' + f(clamp(k * 1.6)) + '">' + prism(600, 880, 0, 170, 120, 260, "#f2efe8", "#dcd6ca", "#c9c2b4");
      var a = O(608, 160, 120), b = O(872, 6, 120); s += '<rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" fill="#3a4450" opacity=".9"/>';
      [[620, 660, 26], [662, 708, 32], [710, 760, 38]].forEach(function (q, i) { s += cylX(q[0], q[1], 64, 120, q[2], "url(#gSteelH)", "#c9ced4", 1.6); var m = O((q[0] + q[1]) / 2, 64, 120); for (var bl = 0; bl < 6; bl++) { var an = t * 9 * k + bl * 1.05 + i; s += '<path d="M' + f(m[0]) + ' ' + f(m[1]) + ' L' + f(m[0] + Math.cos(an) * 6) + ' ' + f(m[1] + Math.sin(an) * q[2] * .85) + '" stroke="#26292d" stroke-width="1.6"/>'; } });
      s += '</g>'; }
    if (gk > 0) s += '<g opacity="' + f(clamp(gk * 1.6)) + '">' + cylX(770, 850, 64, 120, 34, "#2f8f8a", "#5fb8b0", 1.8) + '</g>';
    if (pk > 0) { var py = O(930, 0, 230), pt2 = O(930, 210, 230); s += '<g opacity="' + f(pk) + '"><path d="M' + f(py[0] - 18) + ' ' + f(py[1]) + ' L' + f(pt2[0]) + ' ' + f(pt2[1]) + ' L' + f(py[0] + 18) + ' ' + f(py[1]) + ' M' + f(pt2[0] - 22) + ' ' + f(pt2[1] + 24) + ' H' + f(pt2[0] + 22) + ' M' + f(pt2[0] - 14) + ' ' + f(pt2[1] + 70) + ' H' + f(pt2[0] + 14) + '" stroke="#6f7680" stroke-width="3" fill="none"/>';
      var g = O(850, 70, 120); s += '<path d="M' + pt(g) + ' Q' + f((g[0] + pt2[0]) / 2) + ' ' + f(g[1] - 30) + ' ' + f(pt2[0] - 22) + ' ' + f(pt2[1] + 24) + ' M' + f(pt2[0] + 22) + ' ' + f(pt2[1] + 24) + ' Q' + f(pt2[0] + 200) + ' ' + f(pt2[1] + 30) + ' ' + f(pt2[0] + 420) + ' ' + f(pt2[1] + 10) + '" stroke="' + INKL + '" stroke-width="1.4" fill="none"/>';
      for (var el = 0; el < 4; el++) { var uu = (t * 1.2 + el / 4) % 1; s += '<circle cx="' + f(lerp(pt2[0] + 22, pt2[0] + 420, uu)) + '" cy="' + f(lerp(pt2[1] + 24, pt2[1] + 10, uu) + Math.sin(uu * 3.14) * 8) + '" r="3" fill="' + YEL + '" opacity="' + f(1 - uu) + '"/>'; } s += '</g>'; }
    return s;
  }
  function seaCooling(t, k) {                     // under the hall: a condenser in a basement, a channel from the sea and back
    if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k * 1.6)) + '">';
    s += '<rect x="640" y="' + (GY + 30) + '" width="130" height="56" rx="8" fill="#e4e9ee"' + ln(2) + '/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M650 ' + (GY + 40 + i * 7) + ' H760" stroke="#3a9be0" stroke-width="1.6"/>'; }).join("");
    s += '<path d="M770 ' + (GY + 50) + ' H1000 V' + (GY + 10) + '" fill="none" stroke="' + INKL + '" stroke-width="12"/><path d="M770 ' + (GY + 50) + ' H1000 V' + (GY + 10) + '" fill="none" stroke="#f1f3f5" stroke-width="9"/><path d="M770 ' + (GY + 50) + ' H1000 V' + (GY + 10) + '" fill="none" stroke="#3a9be0" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 11" stroke-dashoffset="' + f(t * 34) + '"/>';
    s += '<path d="M770 ' + (GY + 72) + ' H1060 V' + (GY + 10) + '" fill="none" stroke="' + INKL + '" stroke-width="12"/><path d="M770 ' + (GY + 72) + ' H1060 V' + (GY + 10) + '" fill="none" stroke="#f1f3f5" stroke-width="9"/><path d="M770 ' + (GY + 72) + ' H1060 V' + (GY + 10) + '" fill="none" stroke="#7fd0ff" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 11" stroke-dashoffset="' + f(-t * 34) + '"/>';
    return s + '</g>';
  }
  function extras(t, pk, dk, fk) {
    var s = "";
    if (pk > 0) { s += '<g opacity="' + f(pk) + '">' + prism(-160, -30, 0, 90, 150, 240, "#eef0f2", "#d9dde2", "#c3c9cf"); var a = O(-150, 70, 150), b = O(-40, 20, 150); s += '<rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" rx="4" fill="#1f6fb8"/><rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" rx="4" fill="#5ac8fa" opacity="' + f(.5 + .2 * Math.sin(t * 3)) + '" filter="url(#soft)"/></g>'; }
    if (dk > 0) [-330, -240].forEach(function (x, i) { var k = pop(clamp(dk * 2 - i * .5)); if (k <= 0) return; s += '<g opacity="' + f(clamp(k)) + '">' + prism(x, x + 70, 0, 50 * k, 160, 210, "#e9b44a", "#f2c96a", "#c9922e") + cylV(x + 56, 185, 5, 50, 90 * k, "#6f7680", "#9aa2ac", 1.2); for (var p = 0; p < 3; p++) { var u = (t * .8 + p / 3) % 1, sp = O(x + 56, 96 + u * 40, 185); s += '<circle cx="' + f(sp[0]) + '" cy="' + f(sp[1]) + '" r="' + f(4 + u * 6) + '" fill="#9aa0a3" opacity="' + f(.6 * (1 - u) * k) + '"/>'; } s += '</g>'; });
    if (fk > 0) for (var x2 = -420; x2 < 960; x2 += 44) { var fp = clamp(fk * 3 - (x2 + 420) / 700); if (fp <= 0) continue; var b0 = O(x2, 0, 30), b1 = O(x2, 34 * fp, 30), b2 = O(x2 + 44, 34 * fp, 30); s += '<path d="M' + pt(b0) + ' L' + pt(b1) + '" stroke="#6f7680" stroke-width="2.6"/><path d="M' + pt(b1) + ' L' + pt(b2) + '" stroke="#9aa0a3" stroke-width="1.2"/>'; }
    return s;
  }

  // ── camera: stays back; travels along the plant ─────────
  var SHOTS = [[0, [262, 300, 1.55]], [2, [262, 300, 1.5]], [3, [272, 300, 1.22]], [4, [262, 280, 1.3]], [7, [262, 226, 1.15]], [10, [262, 228, 1.1]],
    [13, [350, 212, 1.0]], [14, [800, 270, 1.0]], [15, [820, 352, .8]], [16, [380, 230, .78]], [17, [380, 200, .74]], [19, [380, 230, .5]], [20, [450, 220, .4]]];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : [262, 300, 1.8], b = SHOTS[i][1], k = ease((t - (L(SHOTS[i][0]) - .45)) / 1.3);
    if (i === 0) k = ease(t / 2.4);
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 2.5; c[1] += Math.cos(t * .29) * 2; c[2] *= 1 + .01 * Math.sin(t * .23);
    return c;
  }

  // ── cards in our style ───────────────────────────────
  function atomCard(t) {
    var k = after(t, EV.split - .2, .5) * (1 - after(t, EV.over - .3, .4)); if (k <= 0) return "";
    var s = '<g transform="translate(180 470) scale(' + f(pop(after(t, EV.split - .2, .9))) + ')"><rect x="-150" y="-80" width="300" height="160" rx="18" fill="#14232f"' + ln(2.4) + '/>', u = (t - EV.split) % 2.6;
    var atoms = [[-100, 10], [-40, -30], [20, 20], [80, -20], [120, 30]];
    atoms.forEach(function (q, i) { var hitT = .25 + i * .45, broken = u > hitT, d = broken ? Math.min(1, (u - hitT) * 2.4) : 0;
      if (!broken) s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="15" fill="url(#gAtom)"' + ln(1.4) + '/>';
      else s += '<circle cx="' + f(q[0] - 10 * d) + '" cy="' + f(q[1] - 6 * d) + '" r="10" fill="url(#gAtom)"' + ln(1.2) + '/><circle cx="' + f(q[0] + 10 * d) + '" cy="' + f(q[1] + 6 * d) + '" r="10" fill="url(#gAtom)"' + ln(1.2) + '/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f(24 * (1 - d) + 4) + '" fill="#ffb347" opacity="' + f(.8 * (1 - d)) + '" filter="url(#soft)"/>';
      if (i < atoms.length - 1) { var nx = atoms[i + 1], bu = clamp((u - hitT) / .45); if (bu > 0 && bu < 1) s += '<path d="M' + f(lerp(q[0], nx[0], bu) - 8) + ' ' + f(lerp(q[1], nx[1], bu)) + ' h12" stroke="' + YEL + '" stroke-width="3" stroke-linecap="round"/>'; } });
    s += '<g transform="translate(0 -58)"><rect x="-62" y="-14" width="124" height="26" rx="13" fill="#2b3a46"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + YEL + '">رصاصات صغيرة</text></g>';
    return '<g opacity="' + f(clamp(k * 3)) + '">' + s + '</g></g>';
  }
  function glowCard(t) {
    var k = after(t, EV.card, .45) * (1 - after(t, EV.cardEnd - .35, .35)); if (k <= 0) return "";
    var g = after(t, EV.glow, 1.2), s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.6 * k) + '"/><g transform="translate(180 360) scale(' + f(pop(after(t, EV.card, .9))) + ')">';
    s += '<rect x="-150" y="-150" width="300" height="290" rx="22" fill="' + CREAM + '"' + ln(3) + '/><text x="0" y="-116" text-anchor="middle" class="hd" fill="' + INKL + '">وتعرف إيه الغريب؟</text>';
    s += '<path d="M-110 -70 L-60 -96 H110 L60 -70 Z" fill="#d9dde2"' + ln(2) + '/><path d="M-110 -70 H60 V90 H-110 Z" fill="#0a2a4a"' + ln(2) + '/><path d="M60 -70 L110 -96 V64 L60 90 Z" fill="#c3c9cf"' + ln(2) + '/>';
    s += '<rect x="-110" y="-70" width="170" height="160" fill="#3fb7ff" opacity="' + f(.12 + .6 * g * (.85 + .15 * Math.sin(t * 4))) + '" filter="url(#soft)"/>';
    for (var r = 0; r < 6; r++) s += '<path d="M' + (-96 + r * 27) + ' 10 l6 -4 l6 4 v70 h-12 z" fill="#3a3f46"/>';
    s += '<g transform="translate(110 -126)" opacity="' + f(g) + '"><path d="M-8 -14 q8 -10 16 0 q2 8 -4 12 v6 h-8 v-6 q-6 -4 -4 -12 z" fill="#fff3b0"' + ln(1.4) + '/><path d="M-14 -20 L14 8" stroke="' + RED + '" stroke-width="3"/></g>';
    s += '<text x="0" y="122" text-anchor="middle" class="tg" fill="#1f6fb8" opacity="' + f(g) + '">بينوّر أزرق من غير لمبة!</text>';
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var c = window.__cam || cam(t), ev = EV;
    var shake = t >= ev.quake && t < ev.dome ? Math.sin(t * 40) * 3 * (1 - after(t, ev.dome - .4, .4)) : 0;
    var heat = t < ev.split ? .05 : t < ev.ctrl ? lerp(.3, 1, after(t, ev.hot, 2.2)) : t < ev.down ? lerp(1, .5, after(t, ev.ctrl, 1.5)) : t < ev.up ? lerp(.5, .2, after(t, ev.down, .8)) : t < ev.boil ? lerp(.2, .6, after(t, ev.up, .8)) : .6;
    var depth = t < ev.down ? .5 : t < ev.up ? 1 : .35, ck = after(t, ev.dome, 2.2), vk = after(t, ev.vessel, 1);
    var s = '<g transform="translate(' + f(shake) + ' 0)">' + scenery(t);
    s += extras(t, after(t, ev.pool, .8), after(t, ev.diesel, .9), after(t, ev.fence, 1.2));
    s += turbineHall(t, after(t, ev.turb, .9), after(t, ev.gen, .9), after(t, ev.power, .9));
    s += containBack(ck);
    // the stages of the island
    if (t < ev.tubes) {
      var bk = 1 - after(t, ev.tubes - .5, .5), rock = t < ev.purify ? 1 : 1 - after(t, ev.purify, 1.2);
      s += '<g opacity="' + f(bk) + '">' + cylV(VX, CZ - 30, 40, 0, 70, "#d9e2e8", "#eef3f6", 1.8) + ellH(VX, 64, CZ - 30, 36, "#7fc3e6", 1.2);
      var rp = O(VX, 66, CZ - 30); s += '<g transform="translate(' + f(rp[0]) + ' ' + f(rp[1]) + ')"><path d="M-12 -4 L-4 -12 L10 -9 L14 2 L5 10 L-9 8 Z" fill="#4a4036" opacity="' + f(rock) + '"' + ln(1.4) + '/><circle r="' + f(9 * (1 - rock)) + '" fill="url(#gAtom)" opacity="' + f(1 - rock) + '"/></g>';
      s += '<path d="M' + f(rp[0] - 46) + ' ' + f(rp[1] - 6) + ' q-6 -18 4 -26" stroke="#9aa2ac" stroke-width="3" fill="none"/>';
      if (t < ev.purify) for (var w = 0; w < 2; w++) { var su = (t * .6 + w / 2) % 1; s += '<path d="M' + f(rp[0] - 8 + w * 16) + ' ' + f(rp[1] - 16 - su * 26) + ' q-5 -7 0 -14" stroke="#fff" stroke-width="2.4" fill="none" opacity="' + f(.7 * (1 - su)) + '"/>'; }
      s += '</g>';
      if (t >= ev.pellets) { var pp = O(VX - 78, 0, CZ - 50), pk = pop(after(t, ev.pellets, .9)); s += '<g transform="translate(' + f(pp[0]) + ' ' + f(pp[1] - 14) + ') scale(' + f(pk * 1.6) + ')"><rect x="-6" y="-8" width="12" height="16" rx="3" fill="url(#gAtom)"' + ln(1.2) + '/><ellipse cx="0" cy="-8" rx="6" ry="2" fill="#c9f0a0"' + ln(1) + '/></g>'; }
      if (t >= ev.coal) { var tk = pop(after(t, ev.coal, .9)), tp = O(VX + 108, 0, CZ - 40); s += '<g transform="translate(' + f(tp[0]) + ' ' + f(tp[1]) + ') scale(' + f(tk) + ')"><path d="M-60 -10 h96 v-26 h-96 z" fill="#d9452e"' + ln(1.6) + '/><path d="M36 -10 h24 v-22 l-8 -10 h-16 z" fill="#e8742e"' + ln(1.6) + '/><path d="M-58 -36 Q-30 -66 -2 -58 Q20 -70 34 -36 Z" fill="#26292d"' + ln(1.4) + '/><circle cx="-40" cy="-6" r="8" fill="#26292d"/><circle cx="40" cy="-6" r="8" fill="#26292d"/><text x="-12" y="-17" text-anchor="middle" class="sm" fill="#fff">1 طن</text></g>'; }
    } else {
      var tankK = t < ev.vessel + .5 ? 1 - after(t, ev.vessel, .5) : 0;
      s += openTank(t, tankK * after(t, ev.tubes, .8), after(t, ev.boil, .8));
      s += vesselV(t, vk, t >= ev.radio, after(t, ev.radio, .9));
      var base = vk > 0 ? 44 : 14;
      s += hexCore(t, heat, base) + rodsIn(t, depth, after(t, ev.ctrl, 1.2), base);
      if (t < ev.vessel) { var w0 = O(VX - 66, 120, CZ - 20), w1 = O(VX + 66, 6, CZ - 20); s += '<rect x="' + f(w0[0]) + '" y="' + f(w0[1]) + '" width="' + f(w1[0] - w0[0]) + '" height="' + f(w1[1] - w0[1]) + '" fill="url(#gWaterR)" opacity="' + f(.3 * tankK) + '"/>'; }
    }
    var sgk = after(t, ev.sg, 1);
    if (sgk > 0) { s += pipe([[VX + 48, 150], [330, 116]], CZ, sgk, t, "#ff8a3c") + pipe([[350, 80], [350, 40], [290, 40]], CZ, sgk, t, "#3a9be0") + pipe([[290, 40], [270, 40], [270, 120], [VX + 48, 120]], CZ - 10, sgk, t, "#3a9be0"); }
    s += pump(t, sgk) + pressurizer(t, after(t, ev.vessel + .6, 1)) + steamGenH(t, sgk, after(t, ev.steam, .6));
    var tk2 = after(t, ev.turb, .9);
    if (tk2 > 0) s += pipe([[400, 142], [400, 190], [560, 190], [620, 90]], CZ, tk2, t, "#ffffff", 8);
    s += seaCooling(t, after(t, ev.sea, 1.2));
    s += containCut(ck);
    if (ck > .6) { var pen = O(CX + CR - CT / 2, 190, CZ); s += '<rect x="' + f(pen[0] - 12) + '" y="' + f(pen[1] - 10) + '" width="24" height="20" rx="4" fill="#9aa2ac"' + ln(1.4) + ' opacity="' + f(after(t, ev.dome + 1.2, .6)) + '"/>'; }
    if (t >= ev.hit && t < ev.dome) { var hk = after(t, ev.hit, 1), hp = O(lerp(560, 330, hk), lerp(520, 220, hk), CZ); s += '<g transform="translate(' + f(hp[0]) + ' ' + f(hp[1]) + ') rotate(' + f(t * 200) + ')"><path d="M-14 -8 L-4 -16 L12 -12 L16 2 L6 14 L-10 12 Z" fill="#6a5a4a"' + ln(1.4) + '/></g>'; }
    s += '</g>';
    var W2 = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';
    if (t >= ev.quake && t < ev.dome) W2 += '<rect width="360" height="640" fill="' + RED + '" opacity="' + f(.12 + .1 * Math.sin(t * 10)) + '"/>';

    var T = "", P2 = function (x, h, z) { return O(x, h, z); };
    T += tag(c, P2(VX, 80, CZ - 30), "مفاعل بدائي!", ev.yay0 - .2, t, { dur: 2.2 });
    T += tag(c, P2(VX, 90, CZ - 30), "بالكاد بتدفى", ev.cold, t, { red: true });
    T += tag(c, P2(VX, 90, CZ - 30), "يورانيوم منقّى", ev.purify + .5, t, { col: GRN });
    T += tag(c, P2(VX - 78, 30, CZ - 50), "حباية", ev.pellets + .1, t, { col: CREAM, dur: 1.6 });
    T += tag(c, P2(VX + 108, 70, CZ - 40), "قد طن فحم!", ev.coal + .2, t);
    T += tag(c, P2(VX, 140, CZ), "قضبان الوقود", ev.rodsTag - .1, t);
    T += tag(c, P2(VX, 150, CZ), "سخونة!", ev.over, t, { red: true });
    T += tag(c, P2(VX, 300, CZ), "قضبان التحكم", ev.ctrlTag - .1, t);
    T += tag(c, P2(VX, 160, CZ), "320°", ev.boil, t, { red: true, dur: 2.2 });
    T += tag(c, P2(VX + 50, 230, CZ), "وعاء الضغط", ev.vesTag - .1, t);
    T += tag(c, P2(VX - 22, 210, CZ), "مية مشعة", ev.radio + .2, t, { red: true });
    T += tag(c, P2(400, 150, CZ), "مولّد البخار", ev.sg + .4, t, { col: CREAM });
    T += tag(c, P2(690, 110, 120), "توربينة", ev.turb + .1, t);
    T += tag(c, P2(810, 110, 120), "مولد", ev.gen + .1, t, { col: CREAM, dur: 1.8 });
    T += tag(c, P2(1080, 0, 80), "مية البحر", ev.sea + .3, t, { col: "#7fd0ff" });
    T += tag(c, P2(CX, CTOP, CZ), "قبة خرسانة +1 م", ev.meter - .2, t, { dur: 2.6 });
    T += tag(c, P2(-95, 100, 150), "حوض الوقود", ev.pool, t, { col: "#7fd0ff", dur: 1.6 });
    T += tag(c, P2(-260, 100, 185), "مولدات احتياطي", ev.diesel, t, { col: CREAM, dur: 1.6 });
    if (t >= ev.cold - .2 && t < ev.purify) T += panelAt(560, after(t, ev.cold - .2, .5) * (1 - after(t, ev.purify - .3, .3)), '<text x="0" y="-10" text-anchor="middle" class="sm" fill="#9fc3d6">حرارة المية</text><text x="0" y="18" text-anchor="middle" class="big" fill="#7fd0ff">' + Math.round(26 + 3 * after(t, ev.cold, 2)) + '°</text>', 120, 62);
    if (t >= ev.bar && t < ev.vesTag + 1.8) { var bk2 = after(t, ev.bar, .5) * (1 - after(t, ev.vesTag + 1.5, .3)); T += panelAt(560, bk2, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">الضغط جوه</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + YEL + '">' + Math.round(70 * after(t, ev.bar, 1.2)) + ' × كاوتش</text>', 190, 64); }
    if (t >= ev.over && t < ev.down + 1.5) { var gk = after(t, ev.over, .4) * (1 - after(t, ev.down + 1.2, .3)); T += panelAt(560, gk, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">السخونة</text><rect x="-70" y="2" width="140" height="16" rx="8" fill="#2b3a46"/><rect x="-70" y="2" width="' + f(140 * heat) + '" height="16" rx="8" fill="' + (heat > .75 ? RED : heat > .4 ? "#ffb347" : GRN) + '"/>', 180, 64); }
    T += atomCard(t) + glowCard(t);
    T += confetti(t, ev.yay0, 60) + confetti(t, ev.yay, 90);
    T += voteCard(t, ev);
    return W2 + T;
  };
})();
