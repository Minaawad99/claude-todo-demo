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

  var X0 = 0, X1 = 100, Y0 = -50, Y1 = 40, ZS = 108, ZT = 205;     // ATM body; ZS = top of the safe
  var CAS = [0, 1, 2].map(function (i) { return { z0: 10 + i * 24, z1: 30 + i * 24, lab: ["٢٠٠", "١٠٠", "٥٠"][i] }; }), REJ = { z0: 82, z1: 100 };
  var TX = 86, TY = -6;                                           // the note transport: a vertical belt at x = TX

  function state(t, full) {
    var S = { card: 0, pin: 0, net: 0, ok: 0, safe: 0, pick: 0, sensor: 0, reject: 0, bundle: 0, present: 0, retract: 0, cam: 0, glow: 1 };
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
  function note(g, I, x, y, z, k, cls) {   // a bank note lying flat, k = 1 normal size
    var w = 14 * k, h = 7 * k; I.face(g, [[x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z]], cls || "atm-note"); }
  function noteV(g, I, x, y, z, cls) { I.face(g, [[x, y - 8, z - 4], [x, y + 8, z - 4], [x, y + 8, z + 4], [x, y - 8, z + 4]], cls || "atm-note"); }
  function drawWorld(g, I, t, o) {
    o = o || {}; var S = state(t, o.full);
    // pavement, the bank wall behind, a bank sign
    I.box(g, -170, 260, -90, 140, -10, 0, { x: "atm-pave-x", y: "atm-pave-y", z: "atm-pave" });
    for (var px = -170; px <= 260; px += 30) I.line(g, [[px, -90, 0.2], [px, 140, 0.2]], "atm-paveline");
    for (var py = -90; py <= 140; py += 30) I.line(g, [[-170, py, 0.2], [260, py, 0.2]], "atm-paveline");
    I.face(g, [[-170, -90, 0], [260, -90, 0], [260, -90, 260], [-170, -90, 260]], "atm-wall");
    for (var bz = 20; bz < 260; bz += 20) I.line(g, [[-170, -90, bz], [260, -90, bz]], "atm-brick");
    I.face(g, [[-150, -90, 150], [-40, -90, 150], [-40, -90, 230], [-150, -90, 230]], "atm-window"); I.face(g, [[140, -90, 150], [240, -90, 150], [240, -90, 230], [140, -90, 230]], "atm-window");
    I.box(g, -10, 110, -90, -84, 225, 252, { x: "atm-sign-x", y: "atm-sign", z: "atm-sign-top" });
    var sp = q(I, 50, -84, 234), st = I.el("text", { x: f1(sp[0]), y: f1(sp[1]), "text-anchor": "middle", "class": "atm-signtx", style: "font-size:" + (12 * I.K / 0.6).toFixed(1) + "px" }, g); st.textContent = "البنك";
    // the machine: plinth, back, left side, the shelf between the two halves
    I.face(g, [[X0 - 4, Y0 - 2, 0.3], [X1 + 6, Y0 - 2, 0.3], [X1 + 6, Y1 + 30, 0.3], [X0 - 4, Y1 + 30, 0.3]], "atm-shadow");
    I.box(g, X0, X1, Y0, Y1, 0, 6, { x: "atm-steel-x", y: "atm-steel-y", z: "atm-floor" });
    I.face(g, [[X0, Y0, 6], [X1, Y0, 6], [X1, Y0, ZT], [X0, Y0, ZT]], "atm-back");
    I.face(g, [[X0, Y0, 6], [X0, Y1, 6], [X0, Y1, ZT], [X0, Y0, ZT]], "atm-left");
    // the safe: thick dark walls (back and left lining, top plate), a hatch on the top plate edge
    I.face(g, [[X0 + 3, Y0 + 3, 6], [X1 - 3, Y0 + 3, 6], [X1 - 3, Y0 + 3, ZS], [X0 + 3, Y0 + 3, ZS]], "atm-safe-back");
    I.face(g, [[X0 + 3, Y0 + 3, 6], [X0 + 3, Y1 - 3, 6], [X0 + 3, Y1 - 3, ZS], [X0 + 3, Y0 + 3, ZS]], "atm-safe-left");
    // cassettes (one denomination each) and the reject bin, each with its pick rollers at the right end
    CAS.concat([REJ]).forEach(function (cs, i) { var rej = i === 3;
      I.box(g, 10, 72, -40, 26, cs.z0, cs.z1, { x: rej ? "atm-rej-x" : "atm-cas-x", y: rej ? "atm-rej-y" : "atm-cas-y", z: rej ? "atm-rej-top" : "atm-cas-top" });
      var lp = q(I, 41, 26, (cs.z0 + cs.z1) / 2), lt = I.el("text", { x: f1(lp[0]), y: f1(lp[1] + 3), "text-anchor": "middle", "class": rej ? "atm-rejtx" : "atm-castx", style: "font-size:" + (8 * I.K / 0.6).toFixed(1) + "px" }, g); lt.textContent = rej ? "رفض" : cs.lab;
      if (!rej) { for (var r = 0; r < 2; r++) { var ang = t * (S.pick ? 14 : 0.6) + r; I.disc(g, 77, TY - 10 + r * 20, (cs.z0 + cs.z1) / 2, 5, "y", "atm-roller"); var a = q(I, 77 + Math.cos(ang) * 4, TY - 10 + r * 20, (cs.z0 + cs.z1) / 2 + Math.sin(ang) * 4); I.el("circle", { cx: f1(a[0]), cy: f1(a[1]), r: 1.2, "class": "atm-dot" }, g); } }
      if (!rej) for (var n = 0; n < 6; n++) noteV(g, I, 66 - n * 8, -8, (cs.z0 + cs.z1) / 2, "atm-note-in");
    });
    // the transport belt, the thickness sensor, the stacker wheel
    I.box(g, TX - 3, TX + 3, TY - 12, TY + 12, 8, 104, { x: "atm-belt-x", y: "atm-belt", z: "atm-belt-top" });
    I.box(g, TX - 7, TX + 7, TY - 16, TY + 16, 56, 66, { x: "atm-sens-x", y: "atm-sens", z: "atm-sens-top" });
    var led = q(I, TX + 7, TY + 10, 61); I.el("circle", { cx: f1(led[0]), cy: f1(led[1]), r: f1(2.2 * I.K / 0.6), "class": S.reject > 0 && S.reject < 1 ? "atm-led-red" : S.sensor ? "atm-led-on" : "atm-led" }, g);
    I.disc(g, TX, TY, 100, 10, "x", "atm-stacker"); var sa = t * (S.pick ? 6 : 0.4), s1 = q(I, TX, TY + Math.cos(sa) * 9, 100 + Math.sin(sa) * 9), s2 = q(I, TX, TY - Math.cos(sa) * 9, 100 - Math.sin(sa) * 9); I.el("path", { d: "M" + f1(s1[0]) + " " + f1(s1[1]) + " L" + f1(s2[0]) + " " + f1(s2[1]), "class": "atm-spoke" }, g);
    // notes on the move: out of a cassette, up the belt, past the sensor, into the stack
    if (S.pick) for (var k = 0; k < 5; k++) { var u = (t * 0.9 + k / 5) % 1, ci = k % 3, z0 = (CAS[ci].z0 + CAS[ci].z1) / 2, nz = u < 0.2 ? z0 : lerp(z0, 98, (u - 0.2) / 0.8), nx = u < 0.2 ? lerp(72, TX, u / 0.2) : TX + 5; noteV(g, I, nx, TY, nz, "atm-note"); }
    if (S.reject > 0) { var rz = lerp(62, (REJ.z0 + REJ.z1) / 2, S.reject), rx = lerp(TX, 60, S.reject); noteV(g, I, rx, TY - 2, rz, "atm-note-bad"); noteV(g, I, rx + 3, TY + 2, rz + 2, "atm-note-bad"); }
    var bx = lerp(TX - 8, TX - 8, 0), by = lerp(TY + 4, Y1 + 8, S.present * (1 - S.retract)), bz = lerp(101, 94, clamp(S.present * 2));
    if (S.bundle > 0) for (var b = 0; b < Math.round(2 + 8 * S.bundle); b++) note(g, I, bx, by, bz + b * 0.9, 0.9);
    // top half: PC core, card reader, receipt printer with its roll
    I.face(g, [[X0 + 2, Y0 + 2, ZS], [X1 - 2, Y0 + 2, ZS], [X1 - 2, Y1 - 2, ZS], [X0 + 2, Y1 - 2, ZS]], "atm-shelf");
    I.box(g, 8, 44, -44, -10, ZS + 2, ZS + 50, { x: "atm-pc-x", y: "atm-pc-y", z: "atm-pc-top" });
    for (var v = 0; v < 5; v++) I.line(g, [[44, -40 + v * 6, ZS + 12], [44, -40 + v * 6, ZS + 40]], "atm-vent");
    I.box(g, 54, 92, 6, 38, ZS + 32, ZS + 46, { x: "atm-cr-x", y: "atm-cr-y", z: "atm-cr-top" });
    I.box(g, 54, 92, -30, 0, ZS + 6, ZS + 26, { x: "atm-pr-x", y: "atm-pr-y", z: "atm-pr-top" }); I.disc(g, 73, -15, ZS + 30, 7, "x", "atm-roll");
    // the card going in
    if (S.card > 0) { var cy = lerp(Y1 + 22, 18, S.card); I.face(g, [[60, cy - 14, ZS + 40], [86, cy - 14, ZS + 40], [86, cy + 14, ZS + 40], [60, cy + 14, ZS + 40]], "atm-card"); var ch = q(I, 66, cy - 6, ZS + 40.4); I.el("rect", { x: f1(ch[0] - 3), y: f1(ch[1] - 2), width: 6, height: 4, rx: 1, "class": "atm-chip" }, g); }
    // the ghost fascia and its parts: screen, card slot, receipt slot, keypad shelf with hood, cash shutter, camera
    I.face(g, [[X0, Y1, 6], [X1, Y1, 6], [X1, Y1, ZT], [X0, Y1, ZT]], "atm-fascia");
    I.line(g, [[X0, Y1, 6], [X0, Y1, ZT], [X1, Y1, ZT]], "atm-edge"); I.line(g, [[X0, Y0, ZT], [X0, Y1, ZT], [X1, Y1, ZT], [X1, Y0, ZT], [X0, Y0, ZT]], "atm-edge-thin");
    I.face(g, [[18, Y1, ZS + 54], [82, Y1, ZS + 54], [82, Y1, ZS + 90], [18, Y1, ZS + 90]], "atm-screen");
    if (S.glow) { var sc = q(I, 50, Y1, ZS + 72), lbl = S.ok > 0 ? "تمت الموافقة ✓" : S.net ? "...جاري الاتصال" : S.pin ? "اكتب الرقم السري" : "أهلاً بيك"; var stx = I.el("text", { x: f1(sc[0]), y: f1(sc[1] + 3), "text-anchor": "middle", "class": "atm-scrtx", style: "font-size:" + (7.5 * I.K / 0.6).toFixed(1) + "px" }, g); stx.textContent = lbl; }
    I.face(g, [[62, Y1, ZS + 40], [86, Y1, ZS + 40], [86, Y1, ZS + 45], [62, Y1, ZS + 45]], "atm-slot-lit");
    I.face(g, [[18, Y1, ZS + 40], [40, Y1, ZS + 40], [40, Y1, ZS + 43], [18, Y1, ZS + 43]], "atm-slot");
    I.box(g, 24, 76, Y1, Y1 + 20, ZS - 4, ZS + 2, { x: "atm-kp-x", y: "atm-kp-y", z: "atm-kp" });
    for (var kk = 0; kk < 12; kk++) { var kx = 30 + (kk % 3) * 10, ky = Y1 + 3 + Math.floor(kk / 3) * 4.2, lit = S.pin > 0 && Math.floor(t * 5) % 12 === kk; I.face(g, [[kx, ky, ZS + 2.2], [kx + 7, ky, ZS + 2.2], [kx + 7, ky + 3, ZS + 2.2], [kx, ky + 3, ZS + 2.2]], lit ? "atm-key-on" : "atm-key"); }
    [["atm-key-red", 62], ["atm-key-yel", 66.5], ["atm-key-grn", 71]].forEach(function (fk) { I.face(g, [[fk[1], Y1 + 3, ZS + 2.2], [fk[1] + 3.5, Y1 + 3, ZS + 2.2], [fk[1] + 3.5, Y1 + 16, ZS + 2.2], [fk[1], Y1 + 16, ZS + 2.2]], fk[0]); });
    var sh = S.present * (1 - S.retract); I.face(g, [[28, Y1, 90], [72, Y1, 90], [72, Y1, 98], [28, Y1, 98]], "atm-shutter-hole"); I.face(g, [[28, Y1, 90 + 8 * sh], [72, Y1, 90 + 8 * sh], [72, Y1, 98], [28, Y1, 98]], "atm-shutter");
    var cm = q(I, 50, Y1, ZT - 8); I.el("circle", { cx: f1(cm[0]), cy: f1(cm[1]), r: f1(3 * I.K / 0.6), "class": S.cam && Math.sin(t * 6) > 0 ? "atm-cam-on" : "atm-cam" }, g);
    if (S.cam) { var cone = [[50, Y1, ZT - 8], [10, Y1 + 90, 120], [90, Y1 + 90, 120]]; I.face(g, cone, "atm-camcone"); }
    // the network: dots running from the machine up to the bank network and back
    if (S.net) { var path = [[50, Y0, ZT], [50, Y0 - 10, 250], [180, -86, 250], [200, -86, 200]];
      I.line(g, path, "atm-net"); for (var p = 0; p < 4; p++) { var uu = (t * 0.7 + p / 4) % 1, back = S.ok > 0, seg = (back ? 1 - uu : uu) * 3, ii = Math.min(2, Math.floor(seg)), fr = seg - ii, A = path[ii], B = path[ii + 1], pp = q(I, lerp(A[0], B[0], fr), lerp(A[1], B[1], fr), lerp(A[2], B[2], fr)); I.el("circle", { cx: f1(pp[0]), cy: f1(pp[1]), r: f1(2.6 * I.K / 0.6), "class": back ? "atm-netdot-ok" : "atm-netdot" }, g); } }
    return { st: S };
  }

  // ── camera: [from time, target, zoom] ──
  var SH = [[L(4) - 0.6, [50, 0, 110], 1.4], [L(4) + 2.2, [40, -10, ZS + 30], 2.4], [L(5), [45, 0, 55], 2.0], [L(6), [74, 25, ZS + 40], 4.2], [L(7), [50, Y1 + 10, ZS], 3.6], [L(8), [110, -50, 180], 1.1], [L(9), [140, -70, 220], 1.4],
            [L(10), [50, 0, 60], 2.0], [L(11), [42, -5, 50], 2.8], [L(12), [42, -5, 40], 3.0], [L(13), [76, -8, 40], 4.0], [L(14), [TX, TY, 62], 5.0], [L(15), [70, -6, 80], 4.0],
            [L(16), [TX - 6, TY, 100], 4.4], [L(17), [52, Y1, 95], 3.6], [L(18), [52, Y1, 95], 4.0], [L(19), [50, Y1, 170], 2.2], [L(20), [50, 0, 110], 1.3], [L(23), [50, 0, 110], 1.4]];
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = a[1], pb = b[1], hold = Math.max(0, t - b[0] - 1.0);
    var z = Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.03 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 5 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 5 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.42 + 0.08 * Math.sin(t * 0.21) + 0.04 * Math.sin(t * 0.63 + 1.0); }

  var LB = [[[26, -27, ZS + 62], "كمبيوتر", "c-part", 4, 0.6, 5, 0], [[73, 22, ZS + 58], "قارئ الكروت", "c-part", 4, 1.4, 5, 0], [[73, -15, ZS + 44], "طابعة", "c-part", 4, 2.2, 5, 0],
            [[40, 0, 4], "خزنة حديد", "c-heat", 5, 0.4, 6, 0], [[190, -86, 262], "شبكة البنوك", "c-water", 8, 0.8, 10, 0], [[41, -6, 118], "كاسيتات", "c-part", 11, 0.6, 13, 0],
            [[77, -6, 4], "بكرات", "c-part", 13, 0.6, 14, 0], [[TX, TY, 74], "حسّاس التُخن", "c-water", 14, 0.4, 15, 0.4], [[41, -6, 106], "درج الرفض", "c-heat", 15, 1.0, 16, 0],
            [[50, Y1 + 10, 104], "الباب بيتفتح", "c-part", 17, 1.2, 18, 0], [[50, Y1 + 10, 104], "بترجع جوه!", "c-heat", 18, 1.2, 19, 0], [[50, Y1, ZT + 6], "كاميرا", "c-heat", 19, 0.4, 20, 0]];
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
  window.__atm = { ZS: ZS, ZT: ZT, Y1: Y1, TX: TX, TY: TY };
})();
