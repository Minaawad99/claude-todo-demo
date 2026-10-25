/* Wires the 3D model (iso.js) into the video: camera shots, water paths, halos and labels,
   all placed from the model's own 3D coordinates. Runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", P = ISO.P, d = ISO.d, W = ISO.W, D = ISO.D;
  var L = window.TIMING.lines;
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function span(parent, from, fo, to, too) {  // visible from line `from` until line `to`
    var o = el("g", { "data-v": "out", "data-l": String(to), "data-o": String(too == null ? 0 : too), "data-d": "0.35" }, parent);
    return el("g", { "data-v": "fade", "data-l": String(from), "data-o": String(fo || 0), "data-d": "0.4" }, o);
  }
  function at(sel, attrs) { var e = document.querySelector(sel); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // ── camera: [line, offset, 3D point, zoom] ─────────────────────
  var S = [[4, 0, [0, 0, 120], 1], [4, 1.4, [0, 0, 120], 1],
           [5, 0, [-118, 110, -40], 2.3], [6, 0.2, [0, 0, -20], 2.1], [7, 0, [-111, 69, 20], 3.0],
           [8, 0, [0, 0, 0], 1.55], [10, 0, [104, 100, -56], 2.5], [11, 0.3, [50, -20, 70], 1.15],
           [12, 0, [0, 0, 40], 2.0], [15, 0, [0, 0, 120], 1.05], [16, 0, [-150, 68, 172], 3.0],
           [21, 0, [0, 0, 120], 1.05], [22, 0, [0, 0, 60], 1.6], [23, 0, [0, 0, 0], 3.0],
           [24, 0, [50, 0, 20], 1.3], [25, 0, [0, 0, 120], 1], [27, 0, [-60, 110, -66], 2.4],
           [28, 0, [-126, 118, -20], 1.9], [29, 0, [0, 0, 0], 1.55], [30, 0, [0, 0, 160], 1.5],
           [31, 0, [10, -70, 230], 1.8], [32, 0, [0, -D / 2, 160], 1.6], [33, 0, [0, 0, 120], 1]];
  at("#cam", { "data-cam": S.map(function (s) { var q = P(s[2][0], s[2][1], s[2][2]); return [s[0], s[1], q[0].toFixed(1), q[1].toFixed(1), s[3]].join(":"); }).join("|") });

  // ── things in the model that change over time ──────────────────
  at("#sumpwater", { "data-v": "grow", "data-l": "5", "data-o": "0.4", "data-d": "2.2", "data-from": "0.15" });
  at("#floatbob", { "data-v": "move", "data-l": "7", "data-o": "0.6", "data-d": "0.8", "data-dx": "0", "data-dy": "-6" });
  at("#tablet", { "data-v": "out", "data-l": "16", "data-o": "0.6", "data-d": "1.4" });
  var hg = document.getElementById("heaterglow"), glow = hg.firstChild;
  hg.removeChild(glow);
  span(hg, 8, 0.5, 11).appendChild(glow.cloneNode());
  span(hg, 29, 0.4, 32).appendChild(glow.cloneNode());
  window.__isoJetsFrom = L[12].start + 0.3; window.__isoJetsTo = L[36].start;

  // ── water and dirt moving along 3D paths ───────────────────────
  var fx = document.getElementById("isofx");
  function flow(from, fo, to, too, paths, n, speed, dot, r) {
    var g = el("g", { "data-particles": "", "data-n": String(n), "data-speed": String(speed), "data-dot": dot, "data-r": String(r) }, span(fx, from, fo, to, too));
    paths.forEach(function (p) { el("path", { "class": "stream", d: ISO.paths[p] }, g); });
  }
  var I = ISO.paths;
  flow(5, 0, 7, 0, ["inlet"], 8, 110, "pt-w", 2.2);
  flow(28, 0, 29, 0.3, ["inlet"], 8, 110, "pt-w", 2.2);
  flow(11, 0.4, 36, 0, ["up", "upLow"], 14, 120, "pt-w", 2);
  flow(15, 0.4, 36, 0, ["drip1", "drip2", "drip3"], 4, 70, "pt-w2", 1.8);
  flow(22, 0.4, 25, 0, ["dirtIn1", "dirtIn2"], 4, 40, "pt-dirt", 2.6);
  flow(27, 0.3, 28, 0.2, ["drainOut"], 9, 110, "pt-dirt", 2.4);
  flow(30, 0.4, 34, 0, ["steam1", "steam2"], 5, 40, "pt-steam", 3.2);
  flow(32, 0, 34, 0, ["wall1", "wall2"], 5, 30, "pt-w", 2.2);
  // heat shimmer over the plates (30)
  var sh = el("g", { "data-loop": "bob", "data-a": "2", "data-f": "3" }, span(fx, 30, 0.4, 34));
  [[-42, -72], [30, 66], [-66, -72], [54, 66]].forEach(function (c) {
    var q = P(c[0], c[1], 196);
    el("path", { "class": "steam", d: "M" + q[0].toFixed(1) + " " + q[1].toFixed(1) + " q-4 -8 0 -16 q4 -8 0 -16" }, sh);
  });

  // ── halos + labels: [from, to, 3D centre, radius, plane, label, colour, font px] ─
  function ring(c, r, plane) {
    var out = [];
    for (var i = 0; i <= 32; i++) {
      var a = i / 32 * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r;
      out.push(plane === "x" ? [c[0], c[1] + x, c[2] + y] : [c[0] + x, c[1] + y, c[2]]);
    }
    return d(out);
  }
  var H = [[4, 6, [-126, 117, -54], 36, "z", "المحبس", "c-part", 9.8],
           [6, 7, [0, 0, -30], 58, "z", "الحوض", "c-water", 9.8],
           [7, 8, [-111, 69, 14], 22, "z", "العوامة", "c-part", 8.4],
           [8, 10, null, 0, "", "السخان", "c-heat", 12.6],
           [10, 12, [110, 102, -60], 42, "z", "المضخة", "c-part", 9.1],
           [12, 16, [0, 0, 38], 130, "z", "الدراع", "c-part", 11.2],
           [16, 18, [-W / 2 + 14, 68, 172], 40, "x", "القرص", "c-heat", 8.4],
           [23, 24, [0, 0, 2], 38, "z", "الفلتر", "c-part", 8.4],
           [27, 28, [-41, 110, -68], 36, "z", "مضخة التصريف", "c-part", 9.1],
           [31, 33, null, 0, "", "الجدار الأبرد", "c-water", 12.6]];
  var hz = document.getElementById("halos");
  H.forEach(function (h) {
    var f = span(hz, h[0], 0.4, h[1], -0.1), pl = el("g", { "data-loop": "pulse", "data-f": "5", "data-a": "0.03" }, f), path, lx, ly;
    if (h[5] === "السخان") { path = d([[-118, -90, 5], [118, -90, 5], [118, 90, 5], [-118, 90, 5]]); var q = P(118, -20, 5); lx = q[0] - 10; ly = q[1] + 24; }
    else if (h[2] == null) { path = d([[-W / 2 + 6, -D / 2 + 2, 20], [W / 2 - 6, -D / 2 + 2, 20], [W / 2 - 6, -D / 2 + 2, 310], [-W / 2 + 6, -D / 2 + 2, 310]]); var w = P(40, -D / 2, 316); lx = w[0]; ly = w[1] - 6; }
    else { path = ring(h[2], h[3], h[4]); var c = P(h[2][0], h[2][1], h[2][2]); lx = c[0]; ly = c[1] - (h[4] === "x" ? h[3] * 0.6 : h[3] * 0.32) - 6; }
    el("path", { "class": "halo", d: path, style: "stroke-width:" + (h[7] / 4).toFixed(2) }, pl);
    var tx = el("text", { "class": "callout " + h[6], x: lx.toFixed(1), y: ly.toFixed(1), "text-anchor": "middle", style: "font-size:" + h[7] + "px;stroke-width:" + (h[7] / 3).toFixed(1) + "px" }, f);
    tx.textContent = h[5];
  });

  // the arms and jets move every frame
  var prev = window.__extra;
  window.__extra = function (t) { if (prev) prev(t); window.__iso(t); };
})();
