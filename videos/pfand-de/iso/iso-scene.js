/* «Wie erkennt der Pfandautomat deine Flasche?», isometric version: cameras, flows, halos, labels and moving parts.
   Runs before engine.js reads the page. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function span(parent, from, fo, to, too) {
    var o = el("g", { "data-v": "out", "data-l": String(to), "data-o": String(too || 0), "data-d": "0.3" }, parent);
    return el("g", { "data-v": "fade", "data-l": String(from), "data-o": String(fo || 0), "data-d": "0.35" }, o);
  }
  function cam(id, I, shots) { $(id).setAttribute("data-cam", shots.map(function (s) { var q = I.P(s[2][0], s[2][1], s[2][2]); return [s[0], s[1], q[0].toFixed(1), q[1].toFixed(1), s[3]].join(":"); }).join("|")); }
  function halo(g, I, from, fo, to, c, r, plane, label, cls, px, dy) {
    var f = span(g, from, fo, to, -0.1), pl = el("g", { "data-loop": "pulse", "data-f": "5", "data-a": "0.03" }, f);
    I.face(pl, I.ring(c[0], c[1], c[2], r, 32, plane), "iso-halo").style.strokeWidth = (px / 4.5).toFixed(2);
    var q = I.P(c[0], c[1], c[2]), y = q[1] - (plane === "z" ? r * I.scale * 0.5 : r * I.scale) - px * 0.5 + (dy || 0);
    var t = el("text", { "class": "iso-label " + cls, x: q[0].toFixed(1), y: y.toFixed(1), "text-anchor": "middle", style: "font-size:" + px + "px;stroke-width:" + (px / 3).toFixed(1) + "px" }, f);
    t.textContent = label; return f;
  }
  function word(g, I, l, o, l2, o2, c, txt, cls, px, rot) {
    var q = I.P(c[0], c[1], c[2]);
    var w = el("g", { "data-v": "pop", "data-l": String(l), "data-o": String(o), "data-d": "0.35" }, el("g", { "data-v": "out", "data-l": String(l2), "data-o": String(o2), "data-d": "0.3" }, g));
    var t = el("text", { "class": "iso-label " + cls, x: q[0].toFixed(1), y: q[1].toFixed(1), "text-anchor": "middle", transform: "rotate(" + (rot || 0) + " " + q[0].toFixed(1) + " " + q[1].toFixed(1) + ")", style: "font-size:" + px + "px;font-weight:800;stroke-width:" + (px / 3).toFixed(1) + "px" }, w);
    t.textContent = txt; return w;
  }

  // ── intro: the machine front (after the T-710 photo), a bottle going in, a crushed one coming back ──
  var II = TebEzay.iso($("introcar"), { scale: 0.62, x: 160, y: 300 }), introG = II.group($("introcar")), IF = $("introfx");
  II.face(introG, [[-160, -100, 0], [160, -100, 0], [160, 120, 0], [-160, 120, 0]], "iso-floor");
  FrontModel(II, introG, 0, -40, {});
  var introB = II.group($("introcar"));
  word(IF, II, 0, 2.6, 1, 0, [40, 0, 270], "0,25 €", "c-heat", 22, 0);
  word(IF, II, 1, 0.4, 2, 0, [-90, 60, 200], "Pfand?", "c-fuel", 18, -6);
  word(IF, II, 2, 0.6, 3, 0, [-90, 60, 200], "zurück?!", "c-heat", 18, 6);
  function introUpdate(t) {
    clear(introB);
    if (t < L(1)) { var k = clamp((t - L(0) - 0.6) / 1.6); if (k < 1) isoLying(II, introB, -20 - 110 + 0 * k, -20, 60 + 30 * k * 0 + 40 * (1 - k), 165, 14, "iso-glass", "iso-glass"); }
    else if (t < L(2)) Bottle(II, introB, -80, 70, 0, { s: 1.1 });
    else { var k2 = clamp((t - L(2) - 0.3) / 1.0); Bottle(II, introB, -40 - 50 * k2, 50 + 30 * k2, 120 * (1 - k2), { s: 0.9, crushed: true }); }
  }

  // ── A: one-way bottle + can, 2003, 25 cents ───────────────
  var IA = TebEzay.iso($("mA"), { scale: 1.0, x: 180, y: 330 }), gA = IA.group($("mA"));
  IA.face(gA, [[-140, -100, 0], [140, -100, 0], [140, 100, 0], [-140, 100, 0]], "iso-floor");
  var gA2 = IA.group($("mA"));
  function aUpdate(t) { clear(gA2); Bottle(IA, gA2, -50, 20, 6 + 6 * Math.abs(Math.sin(t * 3)), { s: 1.3 }); Can(IA, gA2, 50, -20, 6 + 6 * Math.abs(Math.sin(t * 3 + 1.5)), { s: 1.3 }); }
  cam("camA", IA, [[4, 0, [0, 0, 60], 1.0], [5, 0, [0, 0, 60], 1.1]]);
  halo($("halosA"), IA, 4, 0.6, 6, [0, 0, 0], 110, "z", "Einweg", "c-part", 16);

  // ── M: inside the machine ─────────────────────────────────
  var mm = RVMModel($("mM"), { scale: 0.75, x: 190, y: 320 }), M = mm.iso;
  cam("camM", M, [[6, 0, [-100, 0, 120], 1.7], [7, 0, [-70, 0, 150], 2.0], [8, 0, [-70, 0, 150], 2.4], [9, 0, [-70, 0, 150], 2.2], [10, 0, [-70, 0, 150], 2.4],
                  [11, 0, [-70, 0, 150], 2.4], [12, 0, [-70, 0, 150], 2.0], [13, 0, [-80, 0, 110], 1.6], [14, 0, [-110, 0, 140], 1.5], [15, 0, [0, 0, 120], 1.05]]);
  var FM = $("fxM"), HM = $("halosM");
  halo(HM, M, 6, 0.5, 7, [-95, 0, 112], 66, "z", "Rollen", "c-part", 10);
  halo(HM, M, 7, 0.3, 8, [-70, 0, 150], 56, "x", "Kameras ringsum", "c-water", 9);
  word(FM, M, 8, 0.4, 9, 0, [-70, 40, 205], "Strichcode", "c-ink", 9, 0);
  word(FM, M, 9, 0.4, 10, 0, [-70, 40, 205], "Einweg oder Mehrweg?", "c-part", 8, 0);
  word(FM, M, 10, 0.4, 11, 0, [-70, 40, 205], "Pfandlogo", "c-heat", 9, 0);
  word(FM, M, 11, 0.6, 12, 0, [-70, 40, 205], "Infrarot!", "c-heat", 10, 0);
  word(FM, M, 12, 0.3, 13, 0, [-70, 40, 205], "Kopie? Nein!", "c-heat", 9, 0);
  halo(HM, M, 13, 0.6, 14, [-75, 0, 99], 70, "z", "Form + Gewicht", "c-fuel", 11);
  word(FM, M, 14, 0.6, 15, 0, [-150, 40, 200], "kein Etikett → zurück", "c-heat", 10, 0);
  word(FM, M, 15, 0.3, 16, 0, [20, 40, 260], "Computer: 0,1 s", "c-part", 14, 0);
  function mState(t) {
    var s = { route: "", scan: false, x: -60, kind: "pet", code: true };
    if (t < L(7)) { s.x = lerp(-180, -40, clamp((t - L(6)) / 1.6)); return s; }
    if (t < L(13)) { s.x = -40; s.scan = t > L(7) + 0.2; s.ir = t > L(11) + 0.8 && t < L(13); return s; }
    if (t < L(14)) { s.x = -40; s.scan = true; return s; }
    if (t < L(15)) { var k = clamp((t - L(14) - 0.6) / 1.4); s.x = lerp(-40, -200, easeIO(k)); s.crushed = true; s.label = false; s.scan = k < 0.2; return s; }
    s.x = -40; s.route = t > L(15) + 1.6 ? "press" : ""; return s;
  }
  function lerp(a, b, k) { return a + (b - a) * k; }

  // ── S: press and crate ────────────────────────────────────
  var ms = RVMModel($("mS"), { scale: 0.75, x: 190, y: 320 }), S = ms.iso;
  cam("camS", S, [[16, 0, [80, 0, 150], 1.5], [17, 0, [100, 0, 90], 1.6], [18, 0, [60, 0, 60], 1.3]]);
  halo($("halosS"), S, 16, 0.4, 17, [105, 40, 160], 46, "y", "Presse", "c-heat", 12);
  word($("fxS"), S, 17, 0.3, 18, 0, [100, 40, 40], "geschreddert → neue Flaschen", "c-water", 11, 0);
  halo($("halosS"), S, 18, 0.5, 19, [60, 0, 30], 70, "z", "Mehrweg → Kasten", "c-water", 12);
  function sState(t) {
    if (t < L(17)) return { x: lerp(-40, 120, clamp((t - L(16)) / 1.8)), route: "press", gone: t > L(16) + 1.9 };
    if (t < L(18)) return { x: null, shards: true };
    return { x: lerp(-40, 90, clamp((t - L(18)) / 1.4)), route: "crate", kind: "glass", crate: 12, gone: t > L(18) + 1.5 };
  }

  // ── W: the refill line, 50 times, 8 / 15 cents ────────────
  var lm = LineModel($("mW"), { scale: 0.85, x: 180, y: 320 }), W = lm.iso;
  cam("camW", W, [[19, 0, [-40, 0, 90], 1.15], [20, 0, [60, 0, 80], 1.4], [21, 0, [0, 0, 80], 1.0]]);
  halo($("halosW"), W, 19, 0.3, 20, [-105, 0, 140], 60, "z", "Waschen", "c-water", 11);
  halo($("halosW"), W, 19, 1.3, 20, [65, 0, 170], 34, "z", "Füllen", "c-fuel", 11);

  // ── H: Tomra, 1972, 98 % ──────────────────────────────────
  var IH = TebEzay.iso($("mH"), { scale: 0.62, x: 180, y: 340 }), gH = IH.group($("mH"));
  IH.face(gH, [[-260, -120, 0], [260, -120, 0], [260, 120, 0], [-260, 120, 0]], "iso-floor");
  [-170, 0, 170].forEach(function (x) { FrontModel(IH, gH, x, -60, {}); });
  var hb = IH.group($("mH"));
  cam("camH", IH, [[23, 0, [0, 0, 120], 1.0], [25, 0, [0, 0, 100], 1.1], [26, 0, [0, 0, 120], 1.0]]);
  word($("fxH"), IH, 23, 0.6, 24, 0, [0, 60, 330], "2 Brüder · Norwegen", "c-ink", 16, 0);
  word($("fxH"), IH, 24, 0.3, 25, 0, [0, 60, 330], "Tomra", "c-heat", 22, 0);
  ["gedreht", "fotografiert", "geprüft", "sortiert"].forEach(function (w, i) { word($("fxH"), IH, 26, 0.3 + i * 0.5, 27, 0, [-200 + i * 130, 120, 280 - (i % 2) * 30], w, ["c-part", "c-water", "c-fuel", "c-heat"][i], 16, i % 2 ? 4 : -4); });
  function hUpdate(t) { clear(hb); for (var b = 0; b < 5; b++) Bottle(IH, hb, -220 + b * 110 + Math.sin(t * 2 + b) * 4, 90, 0, { s: 0.7 }); }

  // ── outro ──
  var IO = TebEzay.iso($("outro"), { scale: 0.3, x: 145, y: 150 }), gO = IO.group($("outro"));
  FrontModel(IO, gO, 0, 0, {}); var ob = IO.group($("outro"));

  window.__extra = function (t) {
    Array.prototype.forEach.call(document.querySelectorAll(".drift-el"), function (e, i) {
      e.style.transform = "translate(" + (4 * Math.sin(t * 1.3 + i)).toFixed(2) + "px," + (3 * Math.cos(t * 1.1 + i)).toFixed(2) + "px) rotate(" + (0.6 * Math.sin(t * 0.9)).toFixed(3) + "deg) scale(" + (1 + 0.012 * Math.sin(t * 1.7)).toFixed(4) + ")";
    });
    Array.prototype.forEach.call(document.querySelectorAll(".drift"), function (g, i) {
      var c = g.getAttribute("data-c").split(" "), cx = +c[0], cy = +c[1];
      g.setAttribute("transform", "translate(" + cx + " " + cy + ") rotate(" + (1.0 * Math.sin(t * 0.83 + i)).toFixed(3) + ") scale(" + (1.03 + 0.035 * Math.sin(t * 1.1 + i)).toFixed(4) + ") translate(" + (-cx + 9 * Math.sin(t * 1.2 + i)).toFixed(2) + " " + (-cy + 7 * Math.cos(t * 1.2 + i)).toFixed(2) + ")");
    });
    if (t < L(3)) introUpdate(t);
    if (t > L(4) - 1 && t < L(6)) aUpdate(t);
    if (t > L(6) - 1 && t < L(16)) mm.update(t, mState(t));
    if (t > L(16) - 1 && t < L(19)) ms.update(t, sState(t));
    if (t > L(19) - 1 && t < L(23)) lm.update(t);
    if (t > L(23) - 1 && t < L(27)) hUpdate(t);
    if (t > L(27) - 1) { clear(ob); Bottle(IO, ob, -60, 60, 40 + 20 * Math.abs(Math.sin(t * 3)), { s: 0.9 }); }
  };
  introUpdate(0); aUpdate(0); mm.update(0, mState(L(6))); ms.update(0, sState(L(16))); lm.update(0); hUpdate(0);
})();
