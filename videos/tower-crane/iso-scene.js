/* Wires the crane model (iso.js) into the video: camera shots, wind, halos and labels,
   all placed from the model's own 3D coordinates. Runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", P = ISO.P, d = ISO.d, ls = ISO.ls, sm = ISO.sm;
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function span(parent, from, fo, to, too) {
    var o = el("g", { "data-v": "out", "data-l": String(to), "data-o": String(too == null ? 0 : too), "data-d": "0.35" }, parent);
    return el("g", { "data-v": "fade", "data-l": String(from), "data-o": String(fo || 0), "data-d": "0.4" }, o);
  }

  // ── camera: [line, offset, 3D point, zoom] ─────────────────────
  var FULL = [50, -50, 190];
  var S = [[4, 0, FULL, 1], [4, 1.6, FULL, 1],
           [5, 0, [30, 30, -20], 2.2], [6, 0, [0, 0, 345], 2.2], [7, 0, [90, -90, 330], 1.3],
           [8, 0, [-60, 60, 330], 2.0], [9, 0, FULL, 1], [10, 0, [4, 18, 320], 2.4],
           [11, 0.2, [0, 0, 170], 1.05], [12, 0, [50, -50, 220], 1.05], [16, 0, [120, -120, 220], 1.5],
           [18, 0, [100, -70, 220], 1.3], [19, 0, FULL, 1], [25, 0, [50, -50, 215], 0.95],
           [29, 0, [50, -50, 225], 0.95], [30, 0, [10, 0, 320], 2.0], [33, 0.6, [50, -50, 220], 1]];
  document.getElementById("cam").setAttribute("data-cam", S.map(function (s) { var q = P(s[2][0], s[2][1], s[2][2]); return [s[0], s[1], q[0].toFixed(1), q[1].toFixed(1), s[3]].join(":"); }).join("|"));

  // ── wind blowing across the whole site (25–29) ─────────────────
  var fx = document.getElementById("isofx");
  var wind = el("g", { "data-particles": "", "data-n": "7", "data-speed": "190", "data-dot": "pt-air", "data-r": "3" }, span(fx, 25, 0.2, 29, 0.3));
  [250, 310, 360, 400, 440].forEach(function (z, i) { el("path", { "class": "stream", d: d([[-260, 200, z], [280, -300, z + (i % 2 ? 14 : -10)]], false) }, wind); });

  // ── halos + labels, drawn each frame around the moving parts ──
  function ring3(c, r) { var out = []; for (var i = 0; i <= 32; i++) { var a = i / 32 * Math.PI * 2; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]); } return d(out); }
  // [from, to, point(S), radius (0 = label only), label, colour, font px]
  var H = [[5, 6, function () { return [0, 0, 0]; }, 74, "قاعدة خرسانة", "c-part", 7],
           [6, 7, function (S) { return [0, 0, S.top + 6]; }, 26, "الترس", "c-part", 7],
           [7, 8, function (S) { return S.jibMid; }, 0, "الدراع الطويل", "c-part", 11],
           [8, 10, function (S) { return S.weights; }, 24, "بلوكات خرسانة", "c-ink", 7.5],
           [10, 11, function (S) { return S.cab; }, 22, "الكابينة", "c-part", 6.5],
           [11, 12, function () { return [0, 0, 120]; }, 0, "سلم جوه البرج", "c-part", 11],
           [14, 15, function (S) { return S.trolley; }, 16, "العربية", "c-part", 10],
           [15, 16, function (S) { return S.hook; }, 22, "الخطاف", "c-part", 10],
           [31, 32, function (S) { return S.ram || [19, 0, 308]; }, 14, "هيدروليك", "c-heat", 8],
           [32, 33, function (S) { return S.newsec || [0, 0, 350]; }, 24, "قطعة جديدة", "c-part", 8]];
  function vis(t, a, b) { return sm((t - ls(a) - 0.3) / 0.4) * (1 - sm((t - ls(b) + 0.1) / 0.3)); }
  window.__isoHalos = function (g, S) {
    var t = S.t;
    H.forEach(function (h) {
      var o = vis(t, h[0], h[1]); if (o <= 0) return;
      var c = h[2](S), q = P(c[0], c[1], c[2]), pulse = 0.65 + 0.35 * Math.sin(t * 5);
      var f = el("g", { style: "opacity:" + o.toFixed(3) }, g);
      if (h[3]) el("path", { "class": "halo", d: ring3(c, h[3]), style: "stroke-width:" + (h[6] / 4).toFixed(2) + ";opacity:" + pulse.toFixed(3) }, f);
      var tx = el("text", { "class": "callout " + h[5], x: q[0].toFixed(1), y: (q[1] - (h[3] ? h[3] * 0.55 * 0.55 + 6 : 12)).toFixed(1), "text-anchor": "middle",
                            style: "font-size:" + h[6] + "px;stroke-width:" + (h[6] / 3).toFixed(1) + "px" }, f);
      tx.textContent = h[4];
    });
    // the operator can't see the load: a sight line cut by a red ✕ (17–18)
    var o = vis(t, 17, 19);
    if (o > 0 && S.hook) {
      var a = P(S.cab[0], S.cab[1], S.cab[2]), b = P(S.hook[0], S.hook[1], S.hook[2]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      var f = el("g", { style: "opacity:" + o.toFixed(3) }, g);
      el("path", { "class": "sight", d: "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " L" + b[0].toFixed(1) + " " + b[1].toFixed(1), style: "stroke-dashoffset:" + (-t * 20).toFixed(1) }, f);
      el("path", { "class": "x", d: "M" + (m[0] - 6) + " " + (m[1] - 6) + " l12 12 m0 -12 l-12 12", style: "stroke-width:3" }, f);
    }
    // the signal man on the top floor, talking on the radio (18–19)
    o = vis(t, 18, 20);
    if (o > 0) {
      var p = P(150, -104, S.bh), f2 = el("g", { style: "opacity:" + o.toFixed(3) }, g);
      el("path", { "class": "body", d: "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " v-12 m-4 4 l4 -3 l5 -5", style: "stroke-width:2.4" }, f2);
      el("circle", { "class": "hat", cx: p[0].toFixed(1), cy: (p[1] - 16).toFixed(1), r: 4 }, f2);
      for (var k = 0; k < 3; k++) {
        var ph = ((t * 1.4 + k / 3) % 1), rr = 6 + ph * 18;
        el("path", { "class": "radio", d: "M" + (p[0] + 6 + rr * 0.5).toFixed(1) + " " + (p[1] - 22 - rr * 0.85).toFixed(1) + " a" + rr.toFixed(1) + " " + rr.toFixed(1) + " 0 0 1 " + (rr * 0.6).toFixed(1) + " " + (rr * 0.9).toFixed(1), style: "opacity:" + (1 - ph).toFixed(2) }, f2);
      }
      var tx = el("text", { "class": "callout c-water", x: (p[0] - 4).toFixed(1), y: (p[1] + 14).toFixed(1), "text-anchor": "middle", style: "font-size:9px;stroke-width:3px" }, f2);
      tx.textContent = "زميل تحت";
    }
  };

  var prev = window.__extra;
  window.__extra = function (t) { if (prev) prev(t); window.__iso(t); };
})();
