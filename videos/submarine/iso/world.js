/* «إزاي الغواصة بتنزل وتطلع؟» — paper/isometric version: a slice of sea like an aquarium block, redrawn every frame.
   The submarine is cut in half along its length so the ballast tanks show: they fill with water to dive and are
   blown full of air to rise. The view turns slowly and the camera follows the boat.
   x: stern-to-bow axis runs along x (bow at −x), y: across, z: up (sea surface at z = 0). */
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
      if (k.hatch) face(g, [[fx, y0, z0], [fx, y1, z0], [fx, y1, z1], [fx, y0, z1]], "tz-pat-hatch", "opacity:.45");
      return face(g, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], k.z || "iso-top"); }
    function ring(cx, cy, cz, r, n, plane, a0, a1) { var out = []; n = n || 28; a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, co = Math.cos(a) * r, si = Math.sin(a) * r; out.push(plane === "x" ? [cx, cy + co, cz + si] : plane === "y" ? [cx + co, cy, cz + si] : [cx + co, cy + si, cz]); } return out; }
    function disc(g, cx, cy, cz, r, plane, cls, st) { return face(g, ring(cx, cy, cz, r, 30, plane), cls, st); }
    var A0 = -Math.PI / 4 - theta;
    function cyl(g, cx, cy, r, z0, z1, side, top) { var front = ring(cx, cy, z1, r, 18, "z", A0, A0 + Math.PI), back = front.slice().reverse().map(function (p) { return [p[0], p[1], z0]; }); face(g, front.concat(back), side || "iso-steel"); return face(g, ring(cx, cy, z1, r, 28, "z"), top || "iso-top"); }
    return { P: P, d: d, el: el, face: face, line: line, box: box, ring: ring, disc: disc, cyl: cyl, K: K };
  }
  function hull2(pts) {   // convex hull of 2D points (monotone chain)
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = []; pts.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (var i = pts.length - 1; i >= 0; i--) { var p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }

  // ── the boat's state over time ─────────────────────────
  var SURF = 0, MID = -120, DEEP = -170, R = 30, HL = 150;       // hull radius and half-length
  function state(t) {
    var x = 0, z = SURF - 6, pitch = 0, lv = 0, vents = 0, planes = 0, blow = 0;
    if (t < L(4)) { var u = ((t - 0.5) / (L(3) - 0.5)); var dv = Math.sin(Math.PI * clamp(u)); z = lerp(SURF - 6, MID + 20, dv); lv = dv; pitch = 6 * Math.sin(Math.PI * 2 * clamp(u)); vents = u < 0.45 ? 1 : 0; return { x: 0, z: z, pitch: pitch, lv: lv, vents: vents, planes: 0, blow: u > 0.5 && u < 0.9 ? 1 : 0 }; }
    if (t < L(9)) return { x: 0, z: SURF - 6 + Math.sin(t * 1.6) * 1.5, pitch: Math.sin(t * 1.2) * 1.2, lv: 0, vents: 0, planes: 0, blow: 0 };
    if (t < L(10)) return { x: 0, z: SURF - 6 + Math.sin(t * 1.6) * 1.5, pitch: 0, lv: 0.15 * clamp((t - L(9)) / (L(10) - L(9))), vents: 1, planes: 0, blow: 0 };
    if (t < L(11)) { var k = clamp((t - L(10)) / (L(11) - L(10))); return { x: 0, z: SURF - 6 - 10 * k, pitch: 0, lv: lerp(0.15, 0.95, k), vents: 1, planes: 0, blow: 0 }; }
    if (t < L(12)) { var k2 = easeIO((t - L(11)) / (L(12) - L(11))); return { x: 0, z: lerp(SURF - 16, -70, k2), pitch: 2, lv: 0.95, vents: 0, planes: 0, blow: 0 }; }
    if (t < L(13)) { var k3 = clamp((t - L(12)) / (L(13) - L(12))); return { x: lerp(0, -60, k3), z: lerp(-70, MID, easeIO(k3)), pitch: -10 * Math.sin(Math.PI * k3), lv: 0.95, vents: 0, planes: -22 * Math.sin(Math.PI * k3), blow: 0 }; }
    if (t < L(16)) { var bob = Math.sin(t * 1.3) * 2; return { x: -60 + Math.sin(t * 0.3) * 6, z: MID + bob + (t < L(15) ? 6 * Math.sin((t - L(14)) * 2) * clamp(t - L(14)) : 0), pitch: Math.sin(t * 0.9) * 1, lv: 0.6 + (t > L(14) && t < L(15) ? 0.08 * Math.sin((t - L(14)) * 2.4) : 0), vents: 0, planes: 0, blow: 0 }; }
    if (t < L(22)) { var k4 = clamp((t - L(16)) / (L(17) - L(16))); return { x: -60 + Math.sin(t * 0.3) * 6, z: lerp(MID, DEEP, easeIO(k4)) + Math.sin(t * 1.3) * 2, pitch: Math.sin(t * 0.9), lv: 0.6, vents: 0, planes: 0, blow: 0 }; }
    if (t < L(23)) { var k5 = clamp((t - L(22) - 0.3) / (L(23) - L(22) - 0.6)); return { x: -60, z: DEEP + 6 * k5 + Math.sin(t * 1.3) * 2, pitch: 0, lv: lerp(0.6, 0.05, k5), vents: 0, planes: 0, blow: 1 }; }
    if (t < L(24)) { var k6 = clamp((t - L(23)) / (L(24) - L(23) - 0.4)); return { x: lerp(-60, 0, k6), z: lerp(DEEP + 6, SURF - 6, easeIO(k6)), pitch: 8 * Math.sin(Math.PI * k6), lv: 0.05, vents: 0, planes: 18 * Math.sin(Math.PI * k6), blow: k6 < 0.5 ? 1 : 0 }; }
    return { x: 0, z: SURF - 6 + Math.sin(t * 1.6) * 1.5, pitch: Math.sin(t * 1.2) * 1.2, lv: 0, vents: 0, planes: 0, blow: 0 };
  }

  // ── drawing ─────────────────────────────────────────────
  var BOX = [-320, 320, -140, 140, -260];       // the sea block: x0, x1, y0, y1, floor z
  function drawSea(g, I, t, back) {
    if (back) {
      I.face(g, [[BOX[0], BOX[2], BOX[4]], [BOX[1], BOX[2], BOX[4]], [BOX[1], BOX[2], 0], [BOX[0], BOX[2], 0]], "sb-water-back");
      I.face(g, [[BOX[0], BOX[2], BOX[4]], [BOX[0], BOX[3], BOX[4]], [BOX[0], BOX[3], 0], [BOX[0], BOX[2], 0]], "sb-water-side");
      // depth bands on the back wall, darker as we go down
      for (var b = 1; b < 5; b++) I.face(g, [[BOX[0], BOX[2] + 0.5, -b * 52], [BOX[1], BOX[2] + 0.5, -b * 52], [BOX[1], BOX[2] + 0.5, -(b + 1) * 52], [BOX[0], BOX[2] + 0.5, -(b + 1) * 52]], "sb-depth", "opacity:" + (0.1 * b).toFixed(2));
      // seabed with rocks and swaying weed
      I.box(g, BOX[0], BOX[1], BOX[2], BOX[3], BOX[4] - 26, BOX[4], { z: "sb-sand", x: "iso-cut", y: "iso-cut", hatch: true });
      for (var r = 0; r < 9; r++) { var rx = BOX[0] + 40 + r * 64, ry = -80 + hash(r) * 160; I.cyl(g, rx, ry, 10 + hash(r + 2) * 8, BOX[4], BOX[4] + 8 + hash(r + 4) * 10, "sb-rock", "sb-rock-top"); }
      for (var w = 0; w < 14; w++) { var wx = BOX[0] + 20 + w * 44, wy = -110 + hash(w + 9) * 220, sw = Math.sin(t * 1.5 + w) * 8, h = 40 + hash(w) * 40; I.line(g, [[wx, wy, BOX[4]], [wx + sw * 0.5, wy, BOX[4] + h * 0.5], [wx + sw, wy, BOX[4] + h]], "sb-weed"); }
      // light rays from the surface
      for (var k = 0; k < 5; k++) { var lx = -260 + k * 130 + Math.sin(t * 0.4 + k) * 20; I.face(g, [[lx, BOX[2] + 2, 0], [lx + 40, BOX[2] + 2, 0], [lx + 110, BOX[2] + 2, -220], [lx + 30, BOX[2] + 2, -220]], "sb-ray", "opacity:" + (0.08 + 0.04 * Math.sin(t * 1.3 + k)).toFixed(2)); }
      return;
    }
    // the surface on top: a wavy sheet, plus drifting specks in the water
    var top = []; for (var x = BOX[0]; x <= BOX[1]; x += 20) top.push([x, BOX[3], Math.sin(x * 0.04 + t * 2.2) * 3]);
    for (var x2 = BOX[1]; x2 >= BOX[0]; x2 -= 20) top.push([x2, BOX[2], Math.sin(x2 * 0.04 + t * 2.2 + 1) * 3]);
    I.face(g, top, "sb-surface");
    var crest = []; for (var x3 = BOX[0]; x3 <= BOX[1]; x3 += 10) crest.push([x3, BOX[3], Math.sin(x3 * 0.04 + t * 2.2) * 3]); I.line(g, crest, "sb-crest");
    I.line(g, [[BOX[0], BOX[3], 0], [BOX[0], BOX[3], BOX[4]], [BOX[1], BOX[3], BOX[4]], [BOX[1], BOX[3], 0]], "sb-glass");
    for (var i = 0; i < 26; i++) { var px = BOX[0] + hash(i) * 640, py = BOX[2] + hash(i + 3) * 280, pz = ((hash(i + 6) * 260 + t * (4 + hash(i) * 6)) % 250) - 250, q = I.P(px, py, pz); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(1.2 * I.K / 0.6), "class": "sb-speck" }, g); }
  }
  function fishes(g, I, t, n, zc) { for (var i = 0; i < n; i++) { var x = ((t * (26 + i * 4) + i * 160) % 700) - 350, y = -60 + i * 26, z = zc + Math.sin(t * 1.4 + i) * 8 + (i % 3) * 14, q = I.P(x, y, z), w = 9 * I.K / 0.6, tl = Math.sin(t * 10 + i) * 2;
      I.el("path", { d: "M" + f1(q[0] + w) + " " + f1(q[1]) + " Q" + f1(q[0]) + " " + f1(q[1] - w * 0.6) + " " + f1(q[0] - w) + " " + f1(q[1]) + " Q" + f1(q[0]) + " " + f1(q[1] + w * 0.6) + " " + f1(q[0] + w) + " " + f1(q[1]) + " Z M" + f1(q[0] + w) + " " + f1(q[1]) + " L" + f1(q[0] + w * 1.6) + " " + f1(q[1] - w * 0.5 + tl) + " L" + f1(q[0] + w * 1.6) + " " + f1(q[1] + w * 0.5 + tl) + " Z", "class": "sb-fish" }, g); } }
  function bubblesUp(g, I, t, x, y, z0, n, sp) { for (var i = 0; i < n; i++) { var u = ((t * sp + i / n) % 1), z = lerp(z0, Math.min(0, z0 + 140), u), q = I.P(x + Math.sin(u * 8 + i) * 6, y, z); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1((1.6 + u * 2.6) * I.K / 0.6), "class": "sb-bubble", style: "opacity:" + (1 - u * 0.7).toFixed(2) }, g); } }

  // the submarine, cut in half lengthwise (the near half removed) so the tanks show
  function drawSub(g, I, st, t, o) {
    o = o || {}; var cx = st.x, cz = st.z, pc = Math.cos(st.pitch * Math.PI / 180), ps = Math.sin(st.pitch * Math.PI / 180);
    function W(x, y, z) { return [cx + x * pc - z * ps, y, cz + x * ps + z * pc]; }      // local → world (pitch about y)
    function PW(x, y, z) { var w = W(x, y, z); return I.P(w[0], w[1], w[2]); }
    // shadow on the seabed
    var sh = I.P(cx, 0, BOX[4] + 1); I.el("ellipse", { cx: f1(sh[0]), cy: f1(sh[1]), rx: f1(120 * I.K), ry: f1(30 * I.K), "class": "sb-shadow", style: "opacity:" + (0.25 * clamp(1 + (cz - BOX[4]) / -260 + 0.3)).toFixed(2) }, g);
    // capsule profile radius along x (rounded bow at −x, tapered stern at +x)
    function rad(x) { if (x < -HL + R) { var u = (x + HL) / R; return R * Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u))); } if (x > HL - 50) { var v = (x - (HL - 50)) / 50; return R * (1 - 0.82 * v * v); } return R; }
    var xs = []; for (var xx = -HL; xx <= HL; xx += 10) xs.push(xx);
    // back half shell (y ≤ 0): silhouette from sampled points
    var pts = []; xs.forEach(function (x) { var r = rad(x); for (var a = 0; a <= 12; a++) { var an = Math.PI + a * Math.PI / 12; pts.push(PW(x, Math.sin(an) * r, Math.cos(an) * r)); } });
    I.el("path", { d: "M" + hull2(pts).map(function (p) { return f1(p[0]) + " " + f1(p[1]); }).join(" L") + " Z", "class": "sb-shell" }, g);
    // inner surface shading lines
    for (var a2 = 1; a2 < 6; a2++) { var an2 = Math.PI + a2 * Math.PI / 6, ln = xs.map(function (x) { var r = rad(x) * 0.98; return W(x, Math.sin(an2) * r, Math.cos(an2) * r); }); I.line(g, ln, "sb-rib"); }
    // the cut face (y = 0): outer outline, tanks between the skins, the inner pressure hull
    var top = xs.map(function (x) { return W(x, 0, rad(x)); }), bot = xs.slice().reverse().map(function (x) { return W(x, 0, -rad(x)); });
    var outer = I.d(top.concat(bot));
    var cid = "sbc" + (o.id || 0); var cp = document.createElementNS(NS, "clipPath"); cp.setAttribute("id", cid); var cpp = document.createElementNS(NS, "path"); cpp.setAttribute("d", outer); cp.appendChild(cpp); g.appendChild(cp);
    var cg = I.el("g", { "clip-path": "url(#" + cid + ")" }, g);
    // tank contents: air above, water below the level (level in local z)
    var zl = lerp(-R, R, st.lv);
    I.face(cg, [W(-HL - 10, 0, -R - 4), W(HL + 10, 0, -R - 4), W(HL + 10, 0, R + 4), W(-HL - 10, 0, R + 4)], "sb-air");
    I.face(cg, [W(-HL - 10, 0, -R - 4), W(HL + 10, 0, -R - 4), W(HL + 10, 0, zl), W(-HL - 10, 0, zl)], "sb-tankwater");
    if (st.lv > 0.02 && st.lv < 0.98) { var wl = []; for (var x4 = -HL; x4 <= HL; x4 += 8) wl.push(W(x4, 0, zl + Math.sin(x4 * 0.2 + t * 6) * 1.2)); I.line(cg, wl, "sb-level"); }
    // inner pressure hull (dry, lit), with portholes
    var IH = [-HL + 46, HL - 56, R - 9];
    var ih = []; for (var x5 = IH[0]; x5 <= IH[1]; x5 += 10) ih.push(W(x5, 0, IH[2])); for (var a3 = 0; a3 <= 10; a3++) { var an3 = -Math.PI / 2 + a3 * Math.PI / 10; ih.push(W(IH[1] + Math.cos(an3) * IH[2] * 0.6, 0, -Math.sin(an3) * IH[2])); }
    for (var x6 = IH[1]; x6 >= IH[0]; x6 -= 10) ih.push(W(x6, 0, -IH[2])); for (var a4 = 0; a4 <= 10; a4++) { var an4 = Math.PI / 2 + a4 * Math.PI / 10; ih.push(W(IH[0] + Math.cos(an4) * IH[2] * 0.6, 0, -Math.sin(an4) * IH[2])); }
    I.face(g, ih, "sb-inner");
    for (var dk = 0; dk < 2; dk++) I.line(g, [W(IH[0] + 6, 0, -6 + dk * 14), W(IH[1] - 6, 0, -6 + dk * 14)], "sb-deck");
    for (var pw = 0; pw < 4; pw++) { var pp = PW(IH[0] + 24 + pw * 40, 0, 6); I.el("circle", { cx: f1(pp[0]), cy: f1(pp[1]), r: f1(3.4 * I.K), "class": "sb-port" }, g); }
    // trim tank (small, at the bottom of the inner hull)
    var tl0 = -18, tl1 = 18, tz0 = -IH[2] + 1, tz1 = -IH[2] + 9, tf = lerp(tz0, tz1, clamp(st.lv * 0.9 + (o.trim || 0)));
    I.face(g, [W(tl0, 0, tz0), W(tl1, 0, tz0), W(tl1, 0, tz1), W(tl0, 0, tz1)], "sb-air-small"); I.face(g, [W(tl0, 0, tz0), W(tl1, 0, tz0), W(tl1, 0, tf), W(tl0, 0, tf)], "sb-tankwater");
    // outer skin outline + vents (top) and flood holes (bottom) over each tank
    I.el("path", { d: outer, "class": "sb-skin" }, g);
    [-HL + 22, HL - 30].forEach(function (vx) { I.line(g, [W(vx, 0, rad(vx)), W(vx, 0, rad(vx) + 5 + 6 * st.vents)], "sb-vent"); I.line(g, [W(vx - 6, 0, -rad(vx)), W(vx + 6, 0, -rad(vx))], "sb-flood"); });
    // sail (cut too), periscope, planes, rudder, propeller
    I.face(g, [W(-50, 0, R - 2), W(10, 0, R - 2), W(4, 0, R + 34), W(-42, 0, R + 34)], "sb-sail");
    I.line(g, [W(-26, 0, R + 34), W(-26, 0, R + 54), W(-16, 0, R + 54)], "sb-scope");
    var pa = st.planes * Math.PI / 180; I.line(g, [W(-30 - 18 * Math.cos(pa), 0, R + 18 - 18 * Math.sin(pa)), W(-30 + 18 * Math.cos(pa), 0, R + 18 + 18 * Math.sin(pa))], "sb-plane");
    I.face(g, [W(HL - 14, 0, 4), W(HL + 8, 0, 22), W(HL + 10, 0, -22), W(HL - 14, 0, -4)], "sb-rudder");
    var spin = t * 14; for (var bl = 0; bl < 3; bl++) { var ba = spin + bl * 2.094; I.line(g, [W(HL + 12, 0, 0), W(HL + 12, Math.cos(ba) * 14, Math.sin(ba) * 14)], "sb-prop"); }
    // what goes in and out of the tanks
    if (st.vents) [-HL + 22, HL - 30].forEach(function (vx, i) { var w = W(vx, 0, rad(vx) + 8); bubblesUp(g, I, t + i, w[0], 0, w[2], 7, 1.4); });
    if (st.blow) [-HL + 22, HL - 30].forEach(function (vx) { for (var j = 0; j < 6; j++) { var u = ((t * 2 + j / 6) % 1), w = W(vx + Math.sin(j * 3) * 4, 0, -rad(vx) - u * 26), q = I.P(w[0], w[1], w[2]); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(2.6 * I.K / 0.6), "class": "sb-jet", style: "opacity:" + (1 - u).toFixed(2) }, g); } });
    if (o.inflow) [-HL + 22, HL - 30].forEach(function (vx) { for (var j = 0; j < 5; j++) { var u = ((t * 1.6 + j / 5) % 1), w = W(vx + (j - 2) * 3, 0, -rad(vx) - 24 + u * 26), q = I.P(w[0], w[1], w[2]); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(2.2 * I.K / 0.6), "class": "sb-jet", style: "opacity:" + (0.3 + 0.7 * u).toFixed(2) }, g); } });
    return { W: W, PW: PW };
  }
  function arrow3(g, I, a, b, cls, p) { p = clamp(p == null ? 1 : p); if (p <= 0) return; var e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)], pa = I.P(a[0], a[1], a[2]), pe = I.P(e[0], e[1], e[2]), an = Math.atan2(pe[1] - pa[1], pe[0] - pa[0]), h = 9 * I.K / 0.6;
    I.el("path", { d: "M" + f1(pa[0]) + " " + f1(pa[1]) + " L" + f1(pe[0]) + " " + f1(pe[1]), "class": cls }, g);
    I.el("path", { d: "M" + f1(pe[0] + Math.cos(an) * h * 0.4) + " " + f1(pe[1] + Math.sin(an) * h * 0.4) + " L" + f1(pe[0] - Math.cos(an - 0.5) * h) + " " + f1(pe[1] - Math.sin(an - 0.5) * h) + " L" + f1(pe[0] - Math.cos(an + 0.5) * h) + " " + f1(pe[1] - Math.sin(an + 0.5) * h) + " Z", "class": cls + "-head" }, g); }

  function drawWorld(g, I, t, o) {
    o = o || {}; var st = state(t);
    drawSea(g, I, t, true);
    fishes(g, I, t, 5, -90);
    var sub = drawSub(g, I, st, t, { id: o.id, inflow: t > L(10) - 0.2 && t < L(11) + 0.3, trim: t > L(14) && t < L(15) ? 0.1 * Math.sin((t - L(14)) * 2.4) : 0 });
    // forces: buoyancy (green, up) and weight (ink, down)
    var fo = Math.max(win(t, L(15), L(16), 0.3), win(t, L(8), L(9), 0.3) * 0.0);
    if (fo > 0) { arrow3(g, I, [st.x, 0, st.z + R + 6], [st.x, 0, st.z + R + 70], "sb-up", fo); arrow3(g, I, [st.x, 0, st.z - R - 6], [st.x, 0, st.z - R - 70], "sb-down", fo); }
    // water pressing on the hull from every side when deep
    var pr = win(t, L(16) + 0.4, L(17) + 0.2, 0.3); if (pr > 0) for (var a = 0; a < 10; a++) { var an = a * 0.628, r1 = R + 44 + 6 * Math.sin(t * 5 + a); arrow3(g, I, [st.x + Math.cos(an) * (r1 + 40), 0, st.z + Math.sin(an) * r1], [st.x + Math.cos(an) * (R + 46), 0, st.z + Math.sin(an) * (R + 6)], "sb-press", pr); }
    drawSea(g, I, t, false);
    // splash when breaking the surface
    var sp = win(t, L(24) - 0.6, L(24) + 1.0, 0.2); if (sp > 0) for (var j = 0; j < 14; j++) { var u = ((t * 1.2 + j / 14) % 1), ang = j * 0.45, q = I.P(st.x + Math.cos(ang) * (60 + u * 80), Math.sin(ang) * 40, u * 30 * (1 - u) * 4); I.el("circle", { cx: f1(q[0]), cy: f1(q[1]), r: f1(3 * I.K / 0.6), "class": "sb-splash", style: "opacity:" + (sp * (1 - u)).toFixed(2) }, g); }
    return { st: st, sub: sub };
  }

  // ── camera ──
  var SH = [[L(4), [0, 0, -100], 0.75], [L(7), "S", 1.6], [L(8), "S", 1.3], [L(9), "S", 2.2], [L(10), "S", 1.9], [L(11), "S", 1.25], [L(12), "S", 1.2], [L(13), "S", 1.5],
            [L(14), "S", 2.4], [L(15), "S", 1.3], [L(16), "S", 1.6], [L(20), "S", 1.6], [L(22), "S", 1.7], [L(23), "S", 1.1], [L(24), [0, 0, -100], 0.75]];
  function tgt(v, t) { if (v === "S") { var s = state(t); return [s.x, 0, s.z]; } return v; }
  function camAt(t) {
    var i = 0; while (i < SH.length - 1 && SH[i + 1][0] <= t) i++;
    var b = SH[i], a = SH[Math.max(0, i - 1)], k = easeIO((t - b[0]) / 1.0); if (i === 0) k = 1;
    var pa = tgt(a[1], t), pb = tgt(b[1], t), hold = Math.max(0, t - b[0] - 1.0), prev = i === 0 ? 0 : Math.max(0, Math.min(3, b[0] - a[0] - 1.0));
    var z = Math.exp(lerp(Math.log(a[2] * (1 + 0.035 * prev)), Math.log(b[2]), k)) * (1 + 0.04 * Math.sin(t * 0.43)) * (1 + 0.035 * Math.min(hold, 3));
    return { p: [lerp(pa[0], pb[0], k) + 12 * Math.sin(t * 0.9), lerp(pa[1], pb[1], k) + 12 * Math.cos(t * 0.9), lerp(pa[2], pb[2], k)], z: z };
  }
  function theta(t) { return -0.45 + 0.12 * Math.sin(t * 0.21) + 0.05 * Math.sin(t * 0.63 + 1.0); }   // the boat reads almost level, the block still shows its depth

  // labels: [point fn or fixed, text, colour, from line, off, to line, off]
  var LB = [[function (s) { return [s.x - HL + 22, 0, s.z + R + 26]; }, "خزان اتزان", "c-water", 7, 0.3, 9, 0], [function (s) { return [s.x + 10, 0, s.z + 2]; }, "الجسم الداخلي", "c-part", 7, 1.2, 8, 0.2],
            [function (s) { return [s.x - HL + 22, 0, s.z + R + 40]; }, "الهوا بيطلع", "c-water", 9, 0.4, 10, 0], [function (s) { return [s.x, 0, s.z - R - 40]; }, "المية بتدخل", "c-water", 10, 0.4, 11, 0.3],
            [function (s) { return [s.x - 30, 0, s.z + R + 44]; }, "الأجنحة", "c-part", 12, 0.3, 13, 0], [function (s) { return [s.x, 0, s.z - R - 20]; }, "خزان صغير", "c-part", 14, 0.3, 15, 0],
            [function (s) { return [s.x + 60, 0, s.z + R + 50]; }, "الزقة = الوزن", "c-water", 15, 0.6, 16, 0], [function (s) { return [s.x, 0, s.z + R + 70]; }, "هوا مضغوط!", "c-heat", 22, 0.3, 23, 0]];
  window.__sea = function (svg, t) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var c = camAt(t), I = makeIso(theta(t), 0.6, 0, 0), q = I.P(c.p[0], c.p[1], c.p[2]);
    var g = document.createElementNS(NS, "g"); g.setAttribute("transform", "translate(" + (180 - q[0] * c.z).toFixed(2) + " " + (230 - q[1] * c.z).toFixed(2) + ") scale(" + c.z.toFixed(4) + ")"); svg.appendChild(g);
    var r = drawWorld(g, I, t, { id: 1 });
    LB.forEach(function (b) { var o = win(t, L(b[3]) + b[4], L(b[5]) + b[6]); if (o <= 0) return; var pt = b[0](r.st), p = I.P(pt[0], pt[1], pt[2]), fs = 13 / c.z;
      var tx = I.el("text", { x: f1(p[0]), y: f1(p[1]), "text-anchor": "middle", "class": "iso-label " + b[2], style: "opacity:" + o.toFixed(2) + ";font-size:" + fs.toFixed(1) + "px;stroke-width:" + (fs / 3).toFixed(1) + "px" }, g); tx.textContent = b[1]; });
    return r.st;
  };
  window.__seaStatic = function (svg, t, K, ox, oy, extra) { while (svg.firstChild) svg.removeChild(svg.firstChild); var I = makeIso(theta(t) + (extra || 0), K, ox, oy), g = document.createElementNS(NS, "g"); svg.appendChild(g); drawWorld(g, I, t, { id: 2 }); return I; };
  window.__subState = state;
})();
