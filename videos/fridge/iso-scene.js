/* Wires the 3D fridge into the video: camera, refrigerant flow, heat, halos, labels and the 3D close-up panels.
   Everything is placed from model coordinates and runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return LN[Math.min(i, LN.length - 1)].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function span(parent, from, fo, to, too) {
    var o = el("g", { "data-v": "out", "data-l": String(to), "data-o": String(too || 0), "data-d": "0.3" }, parent);
    return el("g", { "data-v": "fade", "data-l": String(from), "data-o": String(fo || 0), "data-d": "0.35" }, o);
  }
  function cam(id, I, shots) {
    $(id).setAttribute("data-cam", shots.map(function (s) { var q = I.P(s[2][0], s[2][1], s[2][2]); return [s[0], s[1], q[0].toFixed(1), q[1].toFixed(1), s[3]].join(":"); }).join("|"));
  }
  function flow(g, I, from, fo, to, too, pts, n, speed, dot, r) {
    var p = el("g", { "data-particles": "", "data-n": String(n), "data-speed": String(speed), "data-dot": dot, "data-r": String(r) }, span(g, from, fo, to, too));
    el("path", { "class": "stream", d: I.d(pts, false) }, p);
  }
  function halo(g, I, from, fo, to, c, r, plane, label, cls, px) {
    var f = span(g, from, fo, to, -0.1), pl = el("g", { "data-loop": "pulse", "data-f": "5", "data-a": "0.03" }, f);
    I.face(pl, I.ring(c[0], c[1], c[2], r, 32, plane), "iso-halo").style.strokeWidth = (px / 4.5).toFixed(2);
    var q = I.P(c[0], c[1], c[2]), y = q[1] - (plane === "z" ? r * I.scale * 0.5 : r * I.scale) - px * 0.6;
    var t = el("text", { "class": "iso-label " + cls, x: q[0].toFixed(1), y: y.toFixed(1), "text-anchor": "middle", style: "font-size:" + px + "px;stroke-width:" + (px / 3).toFixed(1) + "px" }, f);
    t.textContent = label;
  }
  function waves(g, I, from, fo, to, too, xs, z0, cls) {  // heat leaving into the kitchen: wavy red lines rising
    var w = el("g", { "data-loop": "bob", "data-a": "3", "data-f": "3.2" }, span(g, from, fo, to, too));
    xs.forEach(function (p) { var q = I.P(p[0], p[1], z0); el("path", { d: "M" + q[0].toFixed(1) + " " + q[1].toFixed(1) + " q-6 -10 0 -20 q6 -10 0 -20 q-6 -10 0 -20", "class": cls || "heatwave" }, w); });
  }

  // ── models ──────────────────────────────────────────────────
  KitchenModel($("kitchen"), { scale: 0.6, x: 164, y: 372 });
  var F = FridgeModel($("fridge"), { scale: 0.6, x: 164, y: 372 }), I = F.iso;
  KitchenModel($("introkit"), { scale: 0.36, x: 150, y: 250 });
  var FI = FridgeModel($("introfr"), { scale: 0.36, x: 150, y: 250 });
  KitchenModel($("outkit"), { scale: 0.22, x: 150, y: 140 });
  var FO = FridgeModel($("outfr"), { scale: 0.22, x: 150, y: 140 }); FO.update(0, { fan: 0.5, run: true, dial: 0 });
  [[124, 10, 50, "1"], [100, 30, 300, "2"], [97, -72, 452, "3"], [0, -78, 400, "4"]].forEach(function (c) {
    var q = FO.iso.P(c[0], c[1], c[2]), oc = $("outcall");
    el("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 7, "class": "calldot" }, oc);
    var tx = el("text", { x: q[0].toFixed(1), y: (q[1] + 4).toFixed(1), "text-anchor": "middle", "class": "callnum" }, oc); tx.textContent = c[3];
  });
  // big numbers drawn on the parts themselves
  function bigNum(g, I, l, o, l2, o2, c, from, to, unit, cls) {
    var q = I.P(c[0], c[1], c[2]), f = span(g, l, o, l2, o2);
    var t = el("text", { x: q[0].toFixed(1), y: q[1].toFixed(1), "text-anchor": "middle", "class": "bignum " + cls }, f);
    var n = el("tspan", { "data-v": "count", "data-l": String(l), "data-o": String(o), "data-d": "1.2", "data-from": String(from), "data-to": String(to) }, t); n.textContent = String(to);
    el("tspan", {}, t).textContent = unit;
  }
  var hot = [[120, 10, 30], [97, 64, 30], [97, 64, 70]].concat(F.cond), cap = [[97, -64, 411], [97, -72, 440], [90, -72, 446], [60, -77, 430]];
  var cold = F.evap.slice().reverse(), suct = [[78, -76, 340], [78, -76, 20], [104, -20, 20], [120, 10, 30]];

  // ── camera ──────────────────────────────────────────────────
  cam("cam", I, [[4, 0, [-20, 0, 250], 0.95], [5, 0, [0, -78, 380], 1.9], [7, 0.3, [0, -78, 380], 2.3], [9, 0, [-20, 0, 250], 0.95],
    [10, 0.2, [124, 10, 34], 2.6], [12, 0, [112, 30, 40], 2.3], [14, 0, [97, 0, 240], 1.35], [15, 0.3, [97, 0, 200], 1.6], [17, 0, [97, 20, 110], 2.0],
    [18, 0, [92, -68, 432], 2.6], [20, 0.6, [40, -76, 420], 2.0], [21, 0.4, [0, -78, 380], 2.0], [22, 0.6, [0, -40, 270], 1.5],
    [23, 0.2, [-10, -76, 388], 2.6], [24, 0, [-20, 0, 250], 0.95], [27, 0, [-59, -66, 287], 2.4], [29, 1.2, [0, -40, 200], 1.5],
    [30, 0, [0, -40, 380], 1.7], [31, 0, [124, 10, 34], 2.2], [32, 0, [-90, 0, 250], 1.5], [33, 0, [-20, 0, 250], 0.95], [34, 0, [97, 0, 230], 1.3], [35, 0.4, [-20, 0, 250], 0.95]]);

  // ── the refrigerant moving round the loop ───────────────────
  var FX = $("fx"), HZ = $("halos");
  flow(FX, I, 9, 0.4, 10, 0, hot, 14, 70, "pt-hot", 2.2); flow(FX, I, 9, 0.4, 10, 0, cold, 10, 70, "pt-cold", 2.2);
  flow(FX, I, 12, 0.3, 14, 1, [[120, 10, 30], [97, 64, 30], [97, 64, 70]], 6, 50, "pt-hot", 2.6);
  flow(FX, I, 14, 0.2, 18, 0, F.cond, 16, 80, "pt-hot", 2.4);
  flow(FX, I, 18, 0.3, 21, 0.4, cap, 6, 40, "pt-warm", 2.0);
  flow(FX, I, 20, 0.2, 24, 0, cold, 16, 80, "pt-cold", 2.4);
  // the whole loop, running (off while the thermostat has the compressor stopped)
  [[24, 0.2, 29, 1.4], [31, 0.3, 38, 0]].forEach(function (w) {
    flow(FX, I, w[0], w[1], w[2], w[3], hot, 16, 90, "pt-hot", 2.2); flow(FX, I, w[0], w[1], w[2], w[3], cap, 5, 40, "pt-warm", 1.8);
    flow(FX, I, w[0], w[1], w[2], w[3], cold, 14, 90, "pt-cold", 2.2); flow(FX, I, w[0], w[1], w[2], w[3], suct, 10, 90, "pt-cold2", 2.0);
  });
  // heat from the food to the evaporator; cold air from the fan over the shelves
  flow(FX, I, 22, 0.4, 24, 0.5, [[30, -30, 200], [10, -60, 300], [0, -76, 370]], 4, 40, "pt-heat", 2.4);
  flow(FX, I, 22, 0.4, 24, 0.5, [[-40, 0, 170], [-20, -50, 300], [-20, -76, 360]], 4, 40, "pt-heat", 2.4);
  flow(FX, I, 23, 0.4, 29, 1.4, [[-10, -70, 380], [-40, -40, 300], [-60, 10, 210], [-50, 40, 120], [-20, 60, 60]], 8, 50, "pt-air", 2.2);
  flow(FX, I, 23, 0.4, 29, 1.4, [[-10, -70, 380], [20, -30, 300], [50, 20, 200], [40, 50, 100]], 8, 50, "pt-air", 2.2);
  // heat thrown out the back
  var back = [[96, -50], [96, -10], [96, 30], [96, 60]];
  waves(FX, I, 15, 0.3, 18, 0, back, 300); waves(FX, I, 24, 0.5, 29, 1.4, back, 300); waves(FX, I, 33, 0.5, 38, 0, back, 300);
  waves(FX, I, 34, 0.6, 38, 0, [[150, 10], [150, -40]], 80);

  // ── halos + labels ──────────────────────────────────────────
  halo(HZ, I, 4, 0.6, 5, [0, -78, 386], 70, "y", "غاز التبريد بيلف في المواسير دي", "c-water", 10);
  halo(HZ, I, 10, 0.4, 12, [124, 10, 22], 34, "z", "الكباس", "c-part", 7.5);
  halo(HZ, I, 14, 0.4, 16, [97, 0, 240], 120, "x", "المكثف", "c-heat", 13);
  halo(HZ, I, 18, 0.4, 19, [95, -70, 436], 16, "z", "ماسورة رفيعة", "c-part", 7);
  halo(HZ, I, 21, 0.5, 22, [0, -78, 386], 70, "y", "المبخر", "c-water", 9);
  halo(HZ, I, 23, 0.3, 24, [-10, -76, 388], 26, "y", "المروحة", "c-part", 7);
  halo(HZ, I, 28, 0.2, 29, [-59, -66, 287], 34, "y", "الترموستات", "c-heat", 8);
  halo(HZ, I, 32, 0.6, 33, [-90, 0, 250], 120, "x", "كاوتش جواه مغناطيس", "c-part", 12);

  bigNum(HZ, I, 5, 0.5, 7, 0, [0, -40, 440], 20, -12, "°", "blue");
  bigNum(HZ, I, 29, 0.4, 30, 0, [-40, 20, 270], 10, 4, "°", "blue");
  bigNum(HZ, I, 30, 0.2, 31, 0.3, [0, 20, 430], 0, -18, "°", "blue");
  bigNum(HZ, I, 15, 0.6, 17, 0, [150, 60, 380], 25, 45, "°", "red");
  // ── intro: heat out the back of a small fridge ─────────────
  var IF = $("introfx"), II = FI.iso;
  bigNum(IF, II, 1, 0.6, 3, 0, [-60, -170, 440], 30, 32, "°", "red");
  waves(IF, II, 1, 0.8, 3, 0, [[96, -50], [96, 0], [96, 50]], 300);
  flow(IF, II, 2, 0.3, 3, 0, [[0, -40, 200], [60, -30, 260], [97, 0, 300]], 6, 40, "pt-heat", 2.2);

  // ── 3D close-up panels ─────────────────────────────────────
  // 6–7: a glass of refrigerant boiling while ice-cold
  var GI = TebEzay.iso($("pglass"), { scale: 1.6, x: 180, y: 330 }), gg = GI.group();
  GI.cyl(gg, 0, 0, 46, 0, 130, "iso-glass", "iso-glass-top"); GI.cyl(gg, 0, 0, 42, 4, 80, "iso-water-side", "iso-water");
  var bub = el("g", { "data-particles": "", "data-n": "5", "data-speed": "40", "data-dot": "pt-bub", "data-r": "3" }, gg);
  [-20, 0, 20].forEach(function (x) { el("path", { "class": "stream", d: GI.d([[x, 10, 10], [x * 0.8, 12, 80]], false) }, bub); });
  waves(gg, GI, 6, 0.6, 9, 0, [[-20, 0], [10, 10]], 132, "coldwave");
  var hz2 = el("g", { "data-particles": "", "data-n": "4", "data-speed": "30", "data-dot": "pt-heat", "data-r": "3.5" }, span(gg, 7, 0.2, 9, 0));
  [[-120, 40, 60], [120, -40, 60]].forEach(function (p) { el("path", { "class": "stream", d: GI.d([p, [p[0] * 0.3, p[1] * 0.3, 50]], false) }, hz2); });
  // 8: alcohol on a hand
  var HI = TebEzay.iso($("phand"), { scale: 1.5, x: 170, y: 290 }), hg = HI.group();
  HI.box(hg, -70, 40, -40, 40, 0, 20, { z: "iso-skin-top", x: "iso-skin-x", y: "iso-skin", hatch: false });
  for (var f = 0; f < 4; f++) HI.box(hg, 40, 100, -36 + f * 19, -22 + f * 19, 2, 16, { z: "iso-skin-top", x: "iso-skin-x", y: "iso-skin", hatch: false });
  HI.box(hg, -30, 20, 40, 64, 2, 16, { z: "iso-skin-top", x: "iso-skin-x", y: "iso-skin", hatch: false });
  [[-30, -10], [0, 15], [20, -20]].forEach(function (p, i) {
    var d = el("g", { "data-v": "out", "data-l": "8", "data-o": String(1.2 + i * 0.3), "data-d": "0.6" }, hg); HI.disc(d, p[0], p[1], 20.5, 9, "z", "iso-water");
  });
  waves(hg, HI, 8, 0.8, 9, 0, [[-30, -10], [0, 15], [20, -20]], 24, "coldwave");
  // 13: a bike pump getting hot
  var PI_ = TebEzay.iso($("ppump"), { scale: 1.5, x: 180, y: 360 }), pg = PI_.group();
  PI_.box(pg, -60, 60, -20, 20, 0, 8, {});
  PI_.cyl(pg, 0, 0, 22, 8, 150, "iso-steel", "iso-top");
  var hotb = el("g", { "data-v": "fade", "data-l": "13", "data-o": "1.0", "data-d": "0.8" }, pg); PI_.cyl(hotb, 0, 0, 23, 8, 60, "iso-hot", "iso-hot-top");
  var handle = el("g", { "data-loop": "bob", "data-a": "14", "data-f": "9" }, pg);
  PI_.cyl(handle, 0, 0, 5, 150, 200, "iso-steel", "iso-top"); PI_.box(handle, -50, 50, -8, 8, 200, 214, { z: "iso-part-top", x: "iso-part-x", y: "iso-part" });
  waves(pg, PI_, 13, 1.3, 14, 0, [[30, 10], [-30, 10]], 40);
  // 18–20: the narrow tube, pressure drops, it boils
  var CI = TebEzay.iso($("pcap"), { scale: 1.4, x: 180, y: 250 }), cg = CI.group();
  CI.pipe(cg, [[-120, 0, 0], [-20, 0, 0]], "iso-pipe-warm-big"); CI.pipe(cg, [[-20, 0, 0], [60, 0, 0]], "iso-pipe-thin"); CI.pipe(cg, [[60, 0, 0], [150, 0, 0]], "iso-pipe-cold-big");
  var c1 = el("g", { "data-particles": "", "data-n": "10", "data-speed": "40", "data-dot": "pt-warm", "data-r": "3.4" }, cg); el("path", { "class": "stream", d: CI.d([[-120, 0, 0], [-20, 0, 0]], false) }, c1);
  var c2 = el("g", { "data-particles": "", "data-n": "5", "data-speed": "120", "data-dot": "pt-warm", "data-r": "1.6" }, cg); el("path", { "class": "stream", d: CI.d([[-20, 0, 0], [60, 0, 0]], false) }, c2);
  var c3 = el("g", { "data-particles": "", "data-n": "8", "data-speed": "60", "data-dot": "pt-cold", "data-r": "4.2" }, span(cg, 19, 0.3, 21, 0)); el("path", { "class": "stream", d: CI.d([[60, 0, 0], [150, 0, 0]], false) }, c3);
  waves(cg, CI, 20, 0.2, 21, 0.4, [[100, 0], [130, 0]], 14, "coldwave");

  // ── moving parts ───────────────────────────────────────────
  function running(t) { return !(t > L(29) + 1.2 && t < L(31) + 0.2); }
  function state(t) { return { fan: t * 9, run: running(t) && t > L(10), dial: clamp((t - L(29) - 0.4) / 0.8) * (1 - clamp((t - L(31)) / 0.6)) }; }
  window.__extra = function (t) {
    if (t > L(4) - 1 && t < L(38)) F.update(t, state(t));
    if (t < L(3)) FI.update(t, { fan: t * 9, run: true, dial: 0 });
  };
  F.update(0, state(L(9))); FI.update(0, { fan: 0, run: true, dial: 0 });
})();
