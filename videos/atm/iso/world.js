/* «إزاي مكنة الـ ATM بتشتغل؟» — paper/isometric version: an ATM set against a bank wall on the pavement, cut open
   (front fascia drawn as a ghost with its screen, card slot, keypad and shutter; right side removed), redrawn every frame.
   Top half: PC, card reader, receipt printer. Bottom half: the steel safe with three note cassettes and a reject bin,
   the pick rollers, the transport with its thickness sensor, the stacker and the shutter. A line runs from the machine to
   the bank network and the bank. x: along the wall, y: depth (front = +y), z: up. */
(function () {
  var NS = "http://www.w3.org/2000/svg", LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeIO(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function win(t, a, b, f) { f = f || 0.3; return clamp((t - a) / f) * (1 - clamp((t - b) / f)); }
  function f1(n) { return (+n).toFixed(1); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function makeIso(theta, K, OX, OY) {
    var c = Math.cos(theta), s = Math.sin(theta);
    function P(x, y, z) { var xr = x * c - y * s, yr = x * s + y * c; return [OX + (xr - yr) * 0.866 * K, OY + (xr + yr) * 0.5 * K - z * K]; }
    function d(list, close) { return "M" + list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + (close === false ? "" : " Z"); }
    function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function face(g, list, cls, st) { var a = { d: d(list), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function line(g, list, cls, st) { var a = { d: d(list, false), "class": cls }; if (st) a.style = st; return el("path", a, g); }
    function box(g, x0, x1, y0, y1, z0, z1, k) { k = k || {}; var fy = (c - s) > 0 ? y1 : y0, fx = (c + s) > 0 ? x1 : x0;
      face(g, [[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]], k.y || "iso-y"); face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], k.x || "iso-x");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top"); }
    function ring(cx, cy, cz, r, n, plane, a0, a1) { var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); } return out; }
    function disc(g, cx, cy, cz, r, plane, cls, st) { return face(g, ring(cx, cy, cz, r, 30, plane), cls, st); }
    return { P: P, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, K: K };
  }

  // after the channel's photos of NBE lobby ATMs and of opened machines: a green cabinet, the grey fascia recessed above the
  // safe (lit header, screen deep in its bezel, a long cash slot under it, card reader and receipt slot on the right, a keypad
  // shelf with its hood), the safe below with its heavy door swung open; inside, a vertical stack of black cassettes with
  // green handles (the reject bin on top) and the dispenser beside them with belts running up to the cash slot.
  var X0 = 0, X1 = 90, Y0 = -70, YS = 30, YF = 12, ZS = 96, ZT = 176;   // YS: safe front, YF: fascia plane, ZS: top of the safe
  var CAS = [0, 1, 2].map(function (i) { return { z0: 8 + i * 19, z1: 24 + i * 19, lab: ["٢٠٠", "١٠٠", "٥٠"][i] }; }), REJ = { z0: 66, z1: 84 };
  var CX0 = 6, CX1 = 50, TX = 66, TY = -20;                       // cassette stack width, the dispenser's vertical transport
  var Y1 = YF;
  function state(t, full) {
    var S = { card: 0, pin: 0, net: 0, ok: 0, safe: 0, pick: 0, sensor: 0, reject: 0, bundle: 0, present: 0, retract: 0, cam: 0, glow: 1, door: 1 };
    if (full) { S.pick = 1; S.bundle = 1; S.present = 0.6; return S; }
    S.card = t >= L(6) ? clamp((t - L(6)) / 1.2) : 0; S.pin = t >= L(7) && t < L(8) ? clamp((t - L(7)) / 2.5) : 0;
    S.net = t >= L(8) && t < L(11) ? 1 : 0; S.ok = t >= L(9) + 1.2 && t < L(11) + 0.6 ? clamp((t - L(9) - 1.2) / 0.5) : 0;
    S.safe = t >= L(10) ? 1 : 0; S.pick = t >= L(13) && t < L(17) + 0.5 ? 1 : 0; S.sensor = t >= L(14) && t < L(16) ? 1 : 0;
    S.reject = t >= L(15) && t < L(16) ? clamp((t - L(15) - 0.6) / 1.5) : 0; S.bundle = t >= L(16) ? clamp((t - L(16)) / 1.5) : 0;
    S.present = t >= L(17) && t < L(18) + 2 ? clamp((t - L(17) - 0.4) / 1.6) : 0; S.retract = t >= L(18) && t < L(19) ? clamp((t - L(18) - 1.0) / 1.6) : 0;
    S.cam = t >= L(19) && t < L(20) ? 1 : 0;
    return S;
  }
  function q(I, x, y, z) { return I.P(x, y, z); }
  function noteX(g, I, x, y, z, cls) { I.face(g, [[x - 7, y, z - 4], [x + 7, y, z - 4], [x + 7, y, z + 4], [x - 7, y, z + 4]], cls || "atm-note"); }   // standing note, face along x
  function noteY(g, I, x, y, z, cls) { I.face(g, [[x, y - 7, z - 4], [x, y + 7, z - 4], [x, y + 7, z + 4], [x, y - 7, z + 4]], cls || "atm-note"); }
  function noteFlat(g, I, x, y, z, cls) { I.face(g, [[x - 12, y - 6, z], [x + 12, y - 6, z], [x + 12, y + 6, z], [x - 12, y + 6, z]], cls || "atm-note"); }
  function txtF(g, I, x, y, z, s, cls, size) {   // text lying on a front face (plane y = const): an affine map from the face's own axes
    var o = q(I, x, y, z), ax = q(I, x + 1, y, z), dz = q(I, x, y, z - 1), e = I.el("text", { transform: "matrix(" + [ax[0] - o[0], ax[1] - o[1], dz[0] - o[0], dz[1] - o[1], o[0], o[1]].map(f1).join(" ") + ")", "text-anchor": "middle", "class": cls, style: "font-size:" + size + "px" }, g); e.textContent = s; }
  function txt(g, I, x, y, z, s, cls, size) { var p = q(I, x, y, z), e = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": cls, style: "font-size:" + (size * I.K / 0.6).toFixed(1) + "px" }, g); e.textContent = s; }
  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full);
    // the bank hall: marble floor, a cream wall with a window, the NBE booth sign
    I.box(g, -170, 260, -100, 160, -10, 0, { x: "atm-pave-x", y: "atm-pave-y", z: "atm-pave" });
    for (var px = -170; px <= 260; px += 40) I.line(g, [[px, -100, 0.2], [px, 160, 0.2]], "atm-paveline");
    for (var py = -100; py <= 160; py += 40) I.line(g, [[-170, py, 0.2], [260, py, 0.2]], "atm-paveline");
    I.face(g, [[-170, -100, 0], [260, -100, 0], [260, -100, 250], [-170, -100, 250]], "atm-wall");
    I.face(g, [[150, -100, 90], [240, -100, 90], [240, -100, 220], [150, -100, 220]], "atm-window");
    I.box(g, -150, -60, -100, -94, 150, 215, { x: "atm-sign-x", y: "atm-sign", z: "atm-sign-top" }); txt(g, I, -105, -94, 190, "ATM", "atm-signtx", 16); txt(g, I, -105, -94, 168, "البنك", "atm-signtx", 11);
    I.face(g, [[X0 - 4, Y0 - 2, 0.3], [X1 + 6, Y0 - 2, 0.3], [X1 + 6, YS + 30, 0.3], [X0 - 4, YS + 30, 0.3]], "atm-shadow");
    // cabinet shell: base, back, left side (green with the logo), the safe walls inside, the shelf on top of the safe
    I.box(g, X0, X1, Y0, YS, 0, 4, { x: "atm-green-x", y: "atm-green-y", z: "atm-floor" });
    I.face(g, [[X0, Y0, 4], [X1, Y0, 4], [X1, Y0, ZT], [X0, Y0, ZT]], "atm-back");
    I.face(g, [[X0, Y0, 4], [X0, YS, 4], [X0, YS, ZS], [X0, YF, ZS], [X0, YF, ZT], [X0, Y0, ZT]], "atm-green-side");
    I.face(g, [[X0 + 4, Y0 + 4, 4], [X1 - 4, Y0 + 4, 4], [X1 - 4, Y0 + 4, ZS - 4], [X0 + 4, Y0 + 4, ZS - 4]], "atm-safe-back");
    I.face(g, [[X0 + 4, Y0 + 4, 4], [X0 + 4, YS - 2, 4], [X0 + 4, YS - 2, ZS - 4], [X0 + 4, Y0 + 4, ZS - 4]], "atm-safe-left");
    I.face(g, [[X1 - 4, Y0 + 4, 4], [X1 - 4, YS - 2, 4], [X1 - 4, YS - 2, ZS - 4], [X1 - 4, Y0 + 4, ZS - 4]], "atm-safe-right");
    // the cassette stack: long boxes going back into the safe, black with a green handle and the note value on the front
    CAS.concat([REJ]).forEach(function (cs, i) { var rej = i === 3;
      I.box(g, CX0, CX1, Y0 + 8, YS - 6, cs.z0, cs.z1, { x: rej ? "atm-rej-x" : "atm-cas-x", y: rej ? "atm-rej-y" : "atm-cas-y", z: rej ? "atm-rej-top" : "atm-cas-top" });
      var hz = (cs.z0 + cs.z1) / 2; I.line(g, [[CX0 + 12, YS - 6, hz - 3], [CX0 + 12, YS - 6, hz + 4], [CX1 - 12, YS - 6, hz + 4], [CX1 - 12, YS - 6, hz - 3]], rej ? "atm-handle-red" : "atm-handle");
      txtF(g, I, CX0 + 6, YS - 6, hz - 2, rej ? "رفض" : cs.lab, rej ? "atm-rejtx" : "atm-castx", 7);
      if (!rej) { var ang = t * (S.pick ? 14 : 0.6); I.disc(g, CX1 + 3, TY, hz, 4, "x", "atm-roller"); var a = q(I, CX1 + 3, TY + Math.cos(ang) * 3.4, hz + Math.sin(ang) * 3.4); I.el("circle", { cx: f1(a[0]), cy: f1(a[1]), r: 1.1, "class": "atm-dot" }, g); }
    });
    // the dispenser: a grey side plate with the vertical belts, the thickness sensor, gears
    I.box(g, CX1 + 6, X1 - 8, Y0 + 10, YS - 8, 6, ZS - 6, { x: "atm-disp-x", y: "atm-disp-y", z: "atm-disp-top" });
    for (var bl = 0; bl < 2; bl++) I.line(g, [[X1 - 8, TY - 6 + bl * 12, 8], [X1 - 8, TY - 6 + bl * 12, ZS - 4]], "atm-beltline", "stroke-dashoffset:" + f1(-t * (S.pick ? 40 : 2)));
    I.box(g, X1 - 10, X1 - 4, TY - 10, TY + 10, 46, 56, { x: "atm-sens-x", y: "atm-sens", z: "atm-sens-top" });
    var led = q(I, X1 - 4, TY + 6, 51); I.el("circle", { cx: f1(led[0]), cy: f1(led[1]), r: f1(2 * I.K / 0.6), "class": S.reject > 0 && S.reject < 1 ? "atm-led-red" : S.sensor ? "atm-led-on" : "atm-led" }, g);
    [[18, 0], [74, 1]].forEach(function (gz) { I.disc(g, X1 - 8, Y0 + 26, gz[0], 6, "x", "atm-gear"); var ga = t * (S.pick ? 3 : 0.2) * (gz[1] ? -1 : 1), gp = q(I, X1 - 8, Y0 + 26 + Math.cos(ga) * 5, gz[0] + Math.sin(ga) * 5); I.el("circle", { cx: f1(gp[0]), cy: f1(gp[1]), r: 1.4, "class": "atm-dot" }, g); });
    // notes on the move: picked out of a cassette, up the belts past the sensor, through the safe roof to the presenter
    if (S.pick) for (var k = 0; k < 5; k++) { var u = (t * 0.9 + k / 5) % 1, ci = k % 3, z0 = (CAS[ci].z0 + CAS[ci].z1) / 2, nz = u < 0.15 ? z0 : lerp(z0, ZS + 6, (u - 0.15) / 0.85), nx = u < 0.15 ? lerp(CX1, X1 - 6, u / 0.15) : X1 - 6; noteY(g, I, nx, TY, nz, "atm-note"); }
    if (S.reject > 0) { var rz = lerp(51, (REJ.z0 + REJ.z1) / 2, S.reject), rx = lerp(X1 - 6, CX1 - 4, S.reject); noteY(g, I, rx, TY - 2, rz, "atm-note-bad"); noteY(g, I, rx + 2, TY + 2, rz + 2, "atm-note-bad"); }
    // the safe door, swung open on its right-hand hinge: thick steel, a handle and a combination dial
    var ph = o.full ? 0.6 : 0.45 + 0.03 * Math.sin(t * 0.7), ux = Math.cos(ph), uy = Math.sin(ph), nx2 = -uy * 7, ny2 = ux * 7, DW = X1 - 4, hx = X1, hy = YS;
    var e0 = [hx, hy], e1 = [hx + ux * DW, hy + uy * DW];
    I.face(g, [[e0[0], e0[1], 4], [e1[0], e1[1], 4], [e1[0], e1[1], ZS - 2], [e0[0], e0[1], ZS - 2]], "atm-door-edge");
    I.face(g, [[e1[0], e1[1], 4], [e1[0] + nx2, e1[1] + ny2, 4], [e1[0] + nx2, e1[1] + ny2, ZS - 2], [e1[0], e1[1], ZS - 2]], "atm-door-edge");
    I.face(g, [[e0[0] + nx2, e0[1] + ny2, 4], [e1[0] + nx2, e1[1] + ny2, 4], [e1[0] + nx2, e1[1] + ny2, ZS - 2], [e0[0] + nx2, e0[1] + ny2, ZS - 2]], "atm-door");
    var dcx = hx + ux * DW * 0.55 + nx2, dcy = hy + uy * DW * 0.55 + ny2, dp = q(I, dcx, dcy, 56); I.el("circle", { cx: f1(dp[0]), cy: f1(dp[1]), r: f1(7 * I.K / 0.6), "class": "atm-dial" }, g);
    I.el("path", { d: "M" + f1(dp[0]) + " " + f1(dp[1]) + " L" + f1(dp[0] + Math.cos(t) * 5 * I.K / 0.6) + " " + f1(dp[1] + Math.sin(t) * 5 * I.K / 0.6), "class": "atm-spoke" }, g);
    var lh = [hx + ux * DW * 0.82 + nx2, hy + uy * DW * 0.82 + ny2]; I.line(g, [[lh[0], lh[1], 36], [lh[0], lh[1], 62]], "atm-lever");
    for (var bo = 0; bo < 3; bo++) { var bp = q(I, e1[0], e1[1], 20 + bo * 28); I.el("circle", { cx: f1(bp[0]), cy: f1(bp[1]), r: f1(2.2 * I.K / 0.6), "class": "atm-dial" }, g); }
    // the safe roof / upper cabinet floor, the presenter on it, the notes stacking into a bundle
    I.face(g, [[X0, Y0, ZS], [X1, Y0, ZS], [X1, YS, ZS], [X0, YS, ZS]], "atm-shelf");
    I.box(g, 40, X1 - 4, Y0 + 14, YF - 2, ZS, ZS + 10, { x: "atm-disp-x", y: "atm-disp-y", z: "atm-disp-top" });
    var by = lerp(TY + 6, YF + 10, S.present * (1 - S.retract)), bz = ZS + 11;
    if (S.bundle > 0) for (var b = 0; b < Math.round(2 + 8 * S.bundle); b++) noteFlat(g, I, 60, by, bz + b * 0.9, "atm-note");
    // upper cabinet: PC, card reader module, receipt printer with its paper roll
    I.box(g, 6, 34, Y0 + 6, -30, ZS + 4, ZS + 42, { x: "atm-pc-x", y: "atm-pc-y", z: "atm-pc-top" });
    for (var v = 0; v < 4; v++) I.line(g, [[34, Y0 + 10 + v * 7, ZS + 12], [34, Y0 + 10 + v * 7, ZS + 34]], "atm-vent");
    I.box(g, 66, 84, -26, YF - 2, ZS + 30, ZS + 42, { x: "atm-cr-x", y: "atm-cr-y", z: "atm-cr-top" });
    I.box(g, 62, 86, -60, -32, ZS + 16, ZS + 34, { x: "atm-pr-x", y: "atm-pr-y", z: "atm-pr-top" }); I.disc(g, 74, -46, ZS + 40, 7, "x", "atm-roll");
    if (S.card > 0) { var cy = lerp(YF + 24, -6, S.card); I.face(g, [[68, cy - 12, ZS + 40], [82, cy - 12, ZS + 40], [82, cy + 12, ZS + 40], [68, cy + 12, ZS + 40]], "atm-card"); var ch = q(I, 71, cy - 6, ZS + 40.4); I.el("rect", { x: f1(ch[0] - 2.5), y: f1(ch[1] - 2), width: 5, height: 4, rx: 1, "class": "atm-chip" }, g); }
    // the fascia (front of the upper cabinet, grey): bezel and screen, cash slot, card reader bezel, receipt slot, header
    I.face(g, [[X0, YF, ZS], [X1, YF, ZS], [X1, YF, ZT - 16], [X0, YF, ZT - 16]], "atm-fascia");
    I.face(g, [[10, YF, ZS + 34], [62, YF, ZS + 34], [62, YF, ZS + 66], [10, YF, ZS + 66]], "atm-bezel");
    I.face(g, [[14, YF + 0.2, ZS + 37], [58, YF + 0.2, ZS + 37], [58, YF + 0.2, ZS + 63], [14, YF + 0.2, ZS + 63]], "atm-screen");
    if (S.glow) { var lbl = S.ok > 0 ? "تمت الموافقة ✓" : S.net ? "...جاري الاتصال" : S.pin ? "اكتب الرقم السري" : "أهلاً بيك"; txtF(g, I, 36, YF + 0.4, ZS + 48, lbl, "atm-scrtx", 6); }
    for (var sk = 0; sk < 3; sk++) I.face(g, [[6, YF + 0.2, ZS + 40 + sk * 8], [9, YF + 0.2, ZS + 40 + sk * 8], [9, YF + 0.2, ZS + 44 + sk * 8], [6, YF + 0.2, ZS + 44 + sk * 8]], "atm-key");
    var sh = S.present * (1 - S.retract); I.face(g, [[14, YF + 0.2, ZS + 24], [58, YF + 0.2, ZS + 24], [58, YF + 0.2, ZS + 30], [14, YF + 0.2, ZS + 30]], "atm-shutter-hole");
    I.face(g, [[14, YF + 0.3, ZS + 24 + 6 * sh], [58, YF + 0.3, ZS + 24 + 6 * sh], [58, YF + 0.3, ZS + 30], [14, YF + 0.3, ZS + 30]], "atm-shutter");
    if (S.present > 0.5 && S.retract < 0.5) for (var nb = 0; nb < 6; nb++) noteFlat(g, I, 36, YF + 6, ZS + 25 + nb * 0.8, "atm-note");
    I.face(g, [[68, YF, ZS + 34], [84, YF, ZS + 34], [84, YF, ZS + 50], [68, YF, ZS + 50]], "atm-crbezel");
    I.face(g, [[70, YF + 0.2, ZS + 41], [82, YF + 0.2, ZS + 41], [82, YF + 0.2, ZS + 44], [70, YF + 0.2, ZS + 44]], "atm-slot-lit");
    I.face(g, [[70, YF + 0.2, ZS + 26], [82, YF + 0.2, ZS + 26], [82, YF + 0.2, ZS + 28], [70, YF + 0.2, ZS + 28]], "atm-slot");
    var cm = q(I, 36, YF, ZS + 72); I.el("circle", { cx: f1(cm[0]), cy: f1(cm[1]), r: f1(2.4 * I.K / 0.6), "class": S.cam && Math.sin(t * 6) > 0 ? "atm-cam-on" : "atm-cam" }, g);
    // the header hood overhanging the fascia, lit, with the two service names
    I.box(g, X0, X1, Y0, YF + 14, ZT - 16, ZT, { x: "atm-green-x", y: "atm-hood", z: "atm-green-top" });
    I.face(g, [[6, YF + 14.2, ZT - 13], [X1 - 6, YF + 14.2, ZT - 13], [X1 - 6, YF + 14.2, ZT - 3], [6, YF + 14.2, ZT - 3]], "atm-header");
    txtF(g, I, 20, YF + 14.4, ZT - 6, "سحب", "atm-headtx", 6); txtF(g, I, 44, YF + 14.4, ZT - 6, "مدفوعات", "atm-headtx", 6); txtF(g, I, 72, YF + 14.4, ZT - 6, "البنك", "atm-headtx2", 6);
    // the keypad shelf jutting out under the cash slot, with its privacy hood
    I.box(g, 10, X1 - 6, YF, YS + 6, ZS + 10, ZS + 16, { x: "atm-kp-x", y: "atm-kp-y", z: "atm-kp" });
    for (var kk = 0; kk < 12; kk++) { var kx = 26 + (kk % 3) * 8, ky = YF + 6 + Math.floor(kk / 3) * 4.6, lit = S.pin > 0 && Math.floor(t * 5) % 12 === kk; I.face(g, [[kx, ky, ZS + 16.2], [kx + 6, ky, ZS + 16.2], [kx + 6, ky + 3.4, ZS + 16.2], [kx, ky + 3.4, ZS + 16.2]], lit ? "atm-key-on" : "atm-key"); }
    [["atm-key-red", 52], ["atm-key-yel", 56], ["atm-key-grn", 60]].forEach(function (fk) { I.face(g, [[fk[1], YF + 6, ZS + 16.2], [fk[1] + 3, YF + 6, ZS + 16.2], [fk[1] + 3, YF + 20, ZS + 16.2], [fk[1], YF + 20, ZS + 16.2]], fk[0]); });
    I.face(g, [[22, YF + 2, ZS + 16], [22, YF + 2, ZS + 30], [22, YF + 18, ZS + 22], [22, YF + 22, ZS + 16]], "atm-hoodk"); I.face(g, [[66, YF + 2, ZS + 16], [66, YF + 2, ZS + 30], [66, YF + 18, ZS + 22], [66, YF + 22, ZS + 16]], "atm-hoodk");
    // the right side of the cabinet is drawn as an outline only, so the insides show
    I.line(g, [[X1, Y0, 4], [X1, Y0, ZT], [X1, YF + 14, ZT], [X1, YF + 14, ZT - 16], [X1, YF, ZT - 16], [X1, YF, ZS], [X1, YS, ZS], [X1, YS, 4]], "atm-edge-thin");
    if (S.cam) I.face(g, [[36, YF, ZS + 72], [0, YF + 90, 60], [80, YF + 90, 60]], "atm-camcone");
    // the network: dots from the machine up to the bank network and the bank, green on the way back
    if (S.net) { var path = [[45, Y0, ZT], [45, Y0 - 10, 240], [190, -96, 240], [195, -96, 200]];
      I.line(g, path, "atm-net"); for (var p = 0; p < 4; p++) { var uu = (t * 0.7 + p / 4) % 1, back = S.ok > 0, seg = (back ? 1 - uu : uu) * 3, ii = Math.min(2, Math.floor(seg)), fr = seg - ii, A = path[ii], B = path[ii + 1], pp = q(I, lerp(A[0], B[0], fr), lerp(A[1], B[1], fr), lerp(A[2], B[2], fr)); I.el("circle", { cx: f1(pp[0]), cy: f1(pp[1]), r: f1(2.6 * I.K / 0.6), "class": back ? "atm-netdot-ok" : "atm-netdot" }, g); } }
    return { st: S };
  }

  // ── camera: [from time, target, zoom] ──
  var SH = [[L(4) - 0.6, [45, 0, 95], 1.5], [L(4) + 2.2, [50, -20, ZS + 30], 2.4], [L(5), [40, 0, 50], 2.0], [L(6), [76, YF, ZS + 40], 4.2], [L(7), [44, YF + 14, ZS + 16], 3.8], [L(8), [110, -60, 170], 1.1], [L(9), [140, -80, 200], 1.4],
            [L(10), [45, 0, 50], 1.9], [L(11), [28, 10, 45], 2.8], [L(12), [28, 10, 40], 3.0], [L(13), [56, -10, 35], 3.6], [L(14), [X1 - 8, TY, 51], 4.6], [L(15), [50, -6, 65], 3.6],
            [L(16), [60, -20, ZS + 10], 3.8], [L(17), [36, YF, ZS + 26], 3.8], [L(18), [36, YF, ZS + 26], 4.0], [L(19), [36, YF, ZS + 60], 2.4], [L(20), [45, 0, 95], 1.3], [L(23), [45, 0, 95], 1.4]];
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = a[1], pb = b[1], hold = Math.max(0, t - b[0] - 1.0);
    var z = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.03 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 5 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 5 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.42 + 0.08 * Math.sin(t * 0.21) + 0.04 * Math.sin(t * 0.63 + 1.0); }

  var LB = [[[20, Y0 + 20, ZS + 52], "كمبيوتر", "c-part", 4, 0.6, 5, 0], [[75, -10, ZS + 52], "قارئ الكروت", "c-part", 4, 1.4, 5, 0], [[74, -46, ZS + 54], "طابعة", "c-part", 4, 2.2, 5, 0],
            [[45, YS, -6], "خزنة حديد", "c-heat", 5, 0.4, 6, 0], [[190, -96, 252], "شبكة البنوك", "c-water", 8, 0.8, 10, 0], [[28, YS, 94], "كاسيتات", "c-part", 11, 0.6, 13, 0],
            [[CX1 + 3, TY, 2], "بكرات", "c-part", 13, 0.6, 14, 0], [[X1 - 8, TY, 64], "حسّاس التُخن", "c-water", 14, 0.4, 15, 0.4], [[28, YS, 92], "درج الرفض", "c-heat", 15, 1.0, 16, 0],
            [[36, YF + 10, ZS + 36], "الباب بيتفتح", "c-part", 17, 1.2, 18, 0], [[36, YF + 10, ZS + 36], "بترجع جوه!", "c-heat", 18, 1.2, 19, 0], [[36, YF, ZS + 80], "كاميرا", "c-heat", 19, 0.4, 20, 0]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), th = theta(t), I = makeIso(th, 0.6, 0, 0), qq = I.P(c.p[0], c.p[1], c.p[2]); I.th = th;
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - qq[0] * c.z).toFixed(2) + " " + (244 - qq[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, {});
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var p = I.P(b[0][0], b[0][1], b[0][2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra, full) { while (svg.firstChild) svg.removeChild(svg.firstChild); var th = theta(t) + (extra || 0), I = makeIso(th, K, ox, oy), g = document.createElementNS(NS, "g"); I.th = th; svg.appendChild(g); drawWorld(g, I, t, { full: full }); return I; };
  window.__atm = { ZS: ZS, ZT: ZT, Y1: YF, TX: X1 - 8, TY: TY, YS: YS };
})();
