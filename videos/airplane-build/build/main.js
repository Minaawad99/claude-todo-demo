
  // ── projection (as in the pool): x across, h up, z into the picture; vanishing point above the frame ─────
  // a gentle oblique view from the side and a little above: depth lifts a point by 0.3 and shifts it right by 0.15,
  // with a slight size falloff (the first try with a full vanishing point stood the wings up on end)
  function P(x, h, z) { var dz = z - 60, s = 1 / (1 + dz / 1500); return [180 + (x - 180) * s + dz * .15, 504 - (h - 144) * s - 144 - dz * .3]; }
  function pt(p) { return f(p[0]) + " " + f(p[1]); }
  var M = 8, ZC = 60, H0 = 144;                 // 8 px per metre; the fuselage axis sits at depth ZC and height H0
  var G = { lf: 12, r: .3, x0: 0 };             // the plane's current length (m), fuselage radius (m), nose x (px)
  function Pm(xm, hm, zm) { return P(G.x0 + xm * M, H0 + hm * M, ZC + zm * M); }
  function path(pts) { return "M" + pts.map(function (q) { return pt(Pm(q[0], q[1], q[2] || 0)); }).join(" L") + " Z"; }
  function poly(pts, fill, o) { o = o || {}; return '<path d="' + path(pts) + '" fill="' + fill + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 1.4 : o.w) + '" stroke-linejoin="round"' + (o.op != null ? ' opacity="' + f(o.op) + '"' : '') + '/>'; }

  // ── the plane, as a function of the parts built so far ─────────────────
  function fuselagePath() {
    var L = G.lf, R = G.r, Ln = Math.max(1.2, 1.6 * R), c = [];
    function q(x, h) { return pt(Pm(x, h, 0)); }
    var d = "M" + q(0, -.1 * R) + " C" + q(0, .7 * R) + " " + q(.5 * Ln, R) + " " + q(1.3 * Ln, R) + " L" + q(.8 * L, R) + " C" + q(.9 * L, R) + " " + q(.97 * L, .75 * R) + " " + q(L, .6 * R) +
      " L" + q(L, .3 * R) + " C" + q(.9 * L, -.3 * R) + " " + q(.8 * L, -R) + " " + q(.72 * L, -R) + " L" + q(Ln, -R) + " C" + q(.3 * Ln, -R) + " " + q(0, -.7 * R) + " " + q(0, -.1 * R) + " Z";
    return d;
  }
  function wingPts(side, st, frac0, frac1, back) {   // a strip of the wing between span fractions (0 root … 1 tip); back: trailing part only
    var L = G.lf, R = G.r, span = st.span, sweep = st.sweep, le0 = .36 * L, ch0 = .17 * L, ch1 = .25 * ch0, hr = -.6 * R, dih = .09;
    function at(u, c) { var le = le0 + span * u * sweep, ch = lerp(ch0, ch1, u), x = le + ch * c; return [x, hr + span * u * dih, side * (R + span * u)]; }
    var a = back ? 1 - back : 0;
    return [at(frac0, a), at(frac1, a), at(frac1, 1), at(frac0, 1)];
  }
  function plane(t, st) {
    var L = G.lf, R = G.r, s = "", far = [], near = [];
    var wingCol = st.metal > .5 ? "#e8ecf0" : "#c9a06a", wingEdge = st.metal > .5 ? INK : "#7a5a30";
    function wing(side) {
      var w = poly(wingPts(side, st, 0, 1), wingCol, { stroke: wingEdge });
      if (st.fuel > 0 && side < 0) { var fp = wingPts(side, st, .05, .85); w += '<clipPath id="cpFuel"><path d="' + path(fp) + '"/></clipPath><g clip-path="url(#cpFuel)"><rect x="-200" y="' + f(Pm(0, -.6 * R - 2 + 4 * st.fuel, -R)[1] - 40 * st.fuel) + '" width="800" height="400" fill="#e8a23a" opacity=".75"/></g>'; for (var b = 0; b < 4; b++) { var bu = (t * .6 + b / 4) % 1, bp = Pm(.45 * L + bu * 4, -.6 * R, -(R + st.span * (.2 + b * .15))); w += '<circle cx="' + f(bp[0]) + '" cy="' + f(bp[1]) + '" r="1.6" fill="#fff3c0" opacity="' + f(st.fuel * (1 - bu)) + '"/>'; } }
      if (st.ctrl > 0) { var ail = poly(wingPts(side, st, .62, .92, .28), "#ffb347", { w: 1.1 }), flap = poly(wingPts(side, st, .08, .58, .25 + .2 * st.flaps), st.flaps > 0 ? "#ffd27a" : wingCol, { w: 1 }); var mv = Math.sin(t * 3) * 1.5 * st.ctrlMove; w += '<g transform="translate(0 ' + f(mv * side) + ')">' + ail + '</g>' + (st.flaps > 0 ? '<g transform="translate(' + f(4 * st.flaps) + ' ' + f(5 * st.flaps) + ')">' + flap + '</g>' : ''); }
      if (st.metal > .5 && st.sharklet > 0) { var tip = wingPts(side, st, 1, 1); var a = tip[1], c = tip[2]; w += poly([a, [a[0] + .6, a[1] + 2.4 * st.sharklet, a[2]], [c[0] + .3, a[1] + 2.4 * st.sharklet, c[2]], c], "#ff8a3c", { w: 1.1 }); }
      if (st.nav > 0) { var tp = wingPts(side, st, 1, 1)[1], np = Pm(tp[0] + .3, tp[1], tp[2]), on = .55 + .45 * Math.abs(Math.sin(t * 3)); w += '<circle cx="' + f(np[0]) + '" cy="' + f(np[1]) + '" r="' + f(9 * st.nav) + '" fill="' + (side < 0 ? "#ff3b30" : "#34c759") + '" opacity="' + f(.35 * on * st.nav) + '" filter="url(#soft)"/><circle cx="' + f(np[0]) + '" cy="' + f(np[1]) + '" r="2.6" fill="' + (side < 0 ? "#ff3b30" : "#34c759") + '"/>'; }
      return w;
    }
    function engine(side) {
      if (st.jet <= 0) return "";
      var e = st.jet, sp = 5.75 * (L / 37.6), le = .36 * L + (sp - R) * st.sweep - 2.2 * (L / 37.6), len = 4.5 * (L / 37.6), r = 1.0 * (L / 37.6), h = -.6 * R - 1.4 * (L / 37.6), z = side * sp, g = "";
      var a = Pm(le, h + r, z), b = Pm(le + len, h + r * .8, z), c = Pm(le + len, h - r * .8, z), d = Pm(le, h - r, z), mid = Pm(le, h, z), ry = (d[1] - a[1]) / 2;
      g += '<g opacity="' + f(clamp(e * 2)) + '">' + poly([[le + len * .4, -.6 * R, z], [le + len * .8, -.6 * R, z], [le + len * .8, h + r * .7, z], [le + len * .4, h + r * .9, z]], "#c9ced4", { w: 1 });
      g += '<path d="M' + pt(a) + ' L' + pt(b) + ' Q' + f(b[0] + 6) + ' ' + f((b[1] + c[1]) / 2) + ' ' + pt(c) + ' L' + pt(d) + ' Z" fill="url(#gNac)" stroke="' + INK + '" stroke-width="1.4"/>';
      g += '<ellipse cx="' + f(mid[0]) + '" cy="' + f(mid[1]) + '" rx="' + f(ry * .38) + '" ry="' + f(ry) + '" fill="#2b3036" stroke="' + INK + '" stroke-width="1.4"/>';
      for (var k = 0; k < 8; k++) { var ang = t * 30 + k * .785; g += '<path d="M' + f(mid[0]) + ' ' + f(mid[1]) + ' L' + f(mid[0] + Math.cos(ang) * ry * .3) + ' ' + f(mid[1] + Math.sin(ang) * ry * .9) + '" stroke="#8a929c" stroke-width="1.2"/>'; }
      g += '<circle cx="' + f(mid[0]) + '" cy="' + f(mid[1]) + '" r="' + f(ry * .2) + '" fill="#d6dbe0"/>';
      if (st.thrust > 0) for (var j = 0; j < 6; j++) { var ju = (t * 2.2 + j / 6) % 1, jp = Pm(le + len + ju * 6, h + (hash(j) - .5) * r, z); g += '<path d="M' + pt(jp) + ' h' + f(10 + ju * 14) + '" stroke="#bfe3f2" stroke-width="2" stroke-linecap="round" opacity="' + f(st.thrust * (1 - ju) * .8) + '"/>'; }
      return g + '</g>';
    }
    function hstab(side) {
      if (st.stab <= 0) return "";
      var k = ease(st.stab), sc = L / 37.6, x0 = .83 * L, ch = .11 * L, span = 6.2 * sc * k, sw = .58, h = .35 * R;
      var pts = [[x0, h, side * R * .6], [x0 + span * sw, h + span * .1, side * (R * .6 + span)], [x0 + span * sw + ch * .4, h + span * .1, side * (R * .6 + span)], [x0 + ch, h, side * R * .6]];
      var g = poly(pts, st.metal > .5 ? "#e8ecf0" : "#c9a06a");
      if (st.ctrl > 0) g += '<g transform="translate(0 ' + f(Math.sin(t * 2.6) * 1.2 * st.ctrlMove) + ')">' + poly([[pts[0][0] + ch * .7, h, pts[0][2]], [pts[1][0] + ch * .28, pts[1][1], pts[1][2]], pts[2], pts[3]], "#ffb347", { w: 1 }) + '</g>';
      return g;
    }
    function fin() {
      if (st.fin <= 0) return "";
      var k = ease(st.fin), sc = L / 37.6, hb = .9 * R, top = R + 6.3 * sc * k, g = "";
      var pts = [[.77 * L, hb, 0], [.905 * L, top, 0], [.975 * L, top, 0], [.985 * L, hb, 0]];
      g += poly(pts, st.metal > .5 ? "url(#gFin)" : "#c9a06a");
      if (st.ctrl > 0) { var sw = Math.sin(t * 2.2) * 2 * st.ctrlMove; g += '<g transform="skewX(' + f(sw * .2) + ')">' + poly([[.945 * L, hb + .3, 0], [.955 * L, top - .2, 0], [.975 * L, top, 0], [.985 * L, hb, 0]], "#ffb347", { w: 1 }) + '</g>'; }
      return g;
    }
    function gear() {
      if (st.gear <= 0) return ""; var k = ease(st.gear), g = "", sc = L / 37.6;
      [[.13 * L, 0, .7], [.5 * L, -3.8 * sc, 1], [.5 * L, 3.8 * sc, 1]].forEach(function (q, i) {
        var top = Pm(q[0], -.9 * G.r, q[1]), bot = Pm(q[0], -.9 * G.r - 2.4 * sc * k, q[1]), wr = 4.2 * q[2] * (1 + (q[1] < 0 ? .05 : -.05));
        g += '<path d="M' + pt(top) + ' L' + pt(bot) + '" stroke="#5a6068" stroke-width="' + f(2.6 * q[2]) + '"/><circle cx="' + f(bot[0] - wr * .55) + '" cy="' + f(bot[1]) + '" r="' + f(wr) + '" fill="#26292d" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(bot[0] - wr * .55) + '" cy="' + f(bot[1]) + '" r="' + f(wr * .45) + '" fill="#9aa4ad"/>';
        if (q[1] === 0 || i === 1) g += '<circle cx="' + f(bot[0] + wr * .55) + '" cy="' + f(bot[1]) + '" r="' + f(wr) + '" fill="#26292d" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + f(bot[0] + wr * .55) + '" cy="' + f(bot[1]) + '" r="' + f(wr * .45) + '" fill="#9aa4ad"/>'; });
      return g;
    }
    function body() {
      var g = '<path d="' + fuselagePath() + '" fill="' + (st.metal > .5 ? "url(#gBody)" : "url(#gPipe)") + '" stroke="' + INK + '" stroke-width="1.6"/>';
      if (st.metal > .5 && R > 1) {
        var Ln = 1.6 * R;
        g += '<path d="M' + pt(Pm(Ln * .9, -.25 * R, 0)) + ' L' + pt(Pm(.8 * L, -.25 * R, 0)) + '" stroke="#1f6f8b" stroke-width="' + f(R * 2.2) + '" opacity=".9"/><path d="M' + pt(Pm(Ln * .9, -.42 * R, 0)) + ' L' + pt(Pm(.8 * L, -.42 * R, 0)) + '" stroke="#e0a83a" stroke-width="' + f(R * .8) + '"/>';
        g += '<path d="M' + pt(Pm(.35 * Ln, .25 * R, 0)) + ' L' + pt(Pm(.75 * Ln, .45 * R, 0)) + ' L' + pt(Pm(.95 * Ln, .45 * R, 0)) + ' L' + pt(Pm(.95 * Ln, .2 * R, 0)) + ' Z" fill="#1d2b36" stroke="' + INK + '" stroke-width="1"/>';
        if (st.win > 0) { for (var x = Ln * 1.6; x < .78 * L; x += .9) { if (Math.abs(x - .13 * L) < 1.2 || Math.abs(x - .38 * L) < .8) continue; var w = Pm(x, .35 * R, 0); g += '<rect x="' + f(w[0] - 1.6) + '" y="' + f(w[1] - 2.4) + '" width="3.2" height="4.4" rx="1.4" fill="#2a3a48" opacity="' + f(st.win) + '"/>'; }
          [.13 * L, .85 * L].forEach(function (dx) { var a = Pm(dx - .4, .7 * R, 0), b = Pm(dx + .4, -.5 * R, 0); g += '<rect x="' + f(a[0]) + '" y="' + f(a[1]) + '" width="' + f(b[0] - a[0]) + '" height="' + f(b[1] - a[1]) + '" rx="2" fill="none" stroke="#7a828c" stroke-width="1" opacity="' + f(st.win) + '"/>'; }); }
      }
      if (st.press > 0 && R > 1) {   // the cabin cut open: air pumped in, people breathing
        var a2 = Pm(.22 * L, .8 * R, 0), b2 = Pm(.7 * L, -.75 * R, 0), dens = st.press;
        g += '<rect x="' + f(a2[0]) + '" y="' + f(a2[1]) + '" width="' + f(b2[0] - a2[0]) + '" height="' + f(b2[1] - a2[1]) + '" rx="6" fill="#dfeef6" stroke="' + INK + '" stroke-width="1.2"/>';
        for (var row = 0; row < 9; row++) { var sp2 = Pm(.25 * L + row * (.42 * L / 9), -.2 * R, 0); g += '<path d="M' + f(sp2[0]) + ' ' + f(sp2[1] + 8) + ' v-14 q0 -3 3 -3 h3 v17 z" fill="#3a5f8a" stroke="' + INK + '" stroke-width=".8"/>' + (row % 2 ? '<circle cx="' + f(sp2[0] + 8) + '" cy="' + f(sp2[1] - 9) + '" r="3" fill="#d29a6e" stroke="' + INK + '" stroke-width=".8"/>' : ''); }
        for (var d2 = 0; d2 < 46 * dens; d2++) { var dx2 = a2[0] + hash(d2) * (b2[0] - a2[0]), dy2 = a2[1] + 2 + ((hash(d2 + 9) * (b2[1] - a2[1] - 4) + t * 8 * (hash(d2) - .5)) % (b2[1] - a2[1] - 4) + (b2[1] - a2[1])) % (b2[1] - a2[1] - 4); g += '<circle cx="' + f(dx2) + '" cy="' + f(dy2) + '" r="1.2" fill="#3a9be0" opacity=".7"/>'; }
      }
      if (st.seats > 0 && R > 1 && st.press <= 0) {   // finishing: a cut window into the cabin with rows of seats
        var a3 = Pm(.3 * L, .7 * R, 0), b3 = Pm(.55 * L, -.6 * R, 0); g += '<g opacity="' + f(st.seats) + '"><rect x="' + f(a3[0]) + '" y="' + f(a3[1]) + '" width="' + f(b3[0] - a3[0]) + '" height="' + f(b3[1] - a3[1]) + '" rx="5" fill="#e6edf2" stroke="' + INK + '" stroke-width="1"/>';
        for (var r3 = 0; r3 < 6; r3++) { var p3 = Pm(.32 * L + r3 * (.22 * L / 6), -.2 * R, 0); g += '<path d="M' + f(p3[0]) + ' ' + f(p3[1] + 7) + ' v-12 q0 -3 3 -3 h3 v15 z" fill="#5a6f86" stroke="' + INK + '" stroke-width=".8"/>'; } g += '</g>'; }
      if (st.prop > 0) {   // a propeller on the nose: spinner + a spinning blur
        var n = Pm(-.2, -.1 * R, 0), rr = Math.max(14, 1.4 * M), k2 = pop(st.prop);
        g += '<g transform="translate(' + f(n[0]) + ' ' + f(n[1]) + ') scale(' + f(k2) + ')"><ellipse rx="' + f(rr * .22) + '" ry="' + f(rr) + '" fill="#9aa4ad" opacity=".35"/><path d="M0 0 L' + f(Math.cos(t * 40) * 2) + ' ' + f(-rr * Math.cos(t * 40)) + ' M0 0 L' + f(-Math.cos(t * 40) * 2) + ' ' + f(rr * Math.cos(t * 40)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-6 -5 Q-12 0 -6 5 Z" fill="#d9452e" stroke="' + INK + '" stroke-width="1.2"/></g>';
        if (st.thrust > 0) for (var j2 = 0; j2 < 6; j2++) { var u2 = (t * 2 + j2 / 6) % 1, ap = Pm(-1 + u2 * (L + 3), (hash(j2) - .5) * 3, 0); g += '<path d="M' + pt(ap) + ' h12" stroke="#bfe3f2" stroke-width="2" stroke-linecap="round" opacity="' + f(st.thrust * Math.sin(u2 * 3.14) * .8) + '"/>'; }
      }
      return g;
    }
    s += engine(1) + wing(1) + hstab(1) + body() + fin() + hstab(-1) + engine(-1) + wing(-1) + gear();
    return s;
  }

  // ── backgrounds (drawn in the same world, behind the plane) ─────────────
  function clouds(t, y0, n, sp, op, sc) { var s = ""; for (var i = 0; i < n; i++) { var x = ((hash(i) * 560 + t * sp * (1 + hash(i + 2))) % 560) - 100, y = y0 + hash(i + 7) * 60, w = (26 + hash(i * 3) * 30) * (sc || 1);
    s += '<g fill="#fff" opacity="' + f(op) + '"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * .3) + '"/><ellipse cx="' + f(x - w * .35) + '" cy="' + f(y - w * .18) + '" rx="' + f(w * .45) + '" ry="' + f(w * .32) + '"/><ellipse cx="' + f(x + w * .25) + '" cy="' + f(y - w * .22) + '" rx="' + f(w * .4) + '" ry="' + f(w * .35) + '"/></g>'; } return s; }
  function bgHill(t, k) {
    var s = '<rect x="-300" y="-300" width="960" height="1300" fill="url(#gSkyDay)"/>' + clouds(t, 40, 5, 3, .9);
    s += '<path d="M-300 560 Q120 548 400 556 L700 556 V1000 H-300 Z" fill="#e3c48a"/><path d="M150 560 Q260 430 330 420 Q420 410 700 440 V1000 H150 Z" fill="#d6b06e" stroke="#a8844a" stroke-width="2"/>';
    for (var i = 0; i < 20; i++) s += '<circle cx="' + f(-200 + hash(i) * 800) + '" cy="' + f(570 + hash(i + 3) * 60) + '" r="' + f(1 + hash(i + 5) * 2) + '" fill="#b8955a"/>';
    return s;
  }
  function bgLow(t) {   // flying low over the desert near Cairo: the pyramids and the city on the horizon, clouds sliding past
    var s = '<rect x="-300" y="-300" width="960" height="1300" fill="url(#gSkyDay)"/>' + clouds(t, 30, 6, 30, .95) + clouds(t + 7, 230, 4, 50, .8, 1.3);
    s += '<path d="M-300 600 H700 V1000 H-300 Z" fill="#e3c48a"/>';
    for (var i = 0; i < 3; i++) { var px = 40 + i * 46, h = 30 - i * 6; s += '<path d="M' + px + ' 600 l' + h + ' -' + h + ' l' + h + ' ' + h + ' Z" fill="#c9a46a" stroke="#a8844a" stroke-width="1.2"/>'; }
    for (var b = 0; b < 16; b++) { var bx = 200 + b * 12, bh = 8 + hash(b) * 22; s += '<rect x="' + bx + '" y="' + f(600 - bh) + '" width="10" height="' + f(bh) + '" fill="#b9a68a" opacity=".8"/>'; }
    return s;
  }
  function bgHigh(t, k) {
    var s = '<rect x="-300" y="-300" width="960" height="1300" fill="url(#gSkyHigh)"/>';
    s += '<circle cx="290" cy="80" r="40" fill="#fff6c8" opacity=".35" filter="url(#soft)"/><circle cx="290" cy="80" r="16" fill="#fff6c8"/>';
    s += clouds(t, 520, 8, 14, .95, 1.6) + '<rect x="-300" y="560" width="960" height="500" fill="#e9f1f7"/>';
    for (var i = 0; i < 26; i++) { var u = (t * .4 + i / 26) % 1; s += '<circle cx="' + f(-20 + hash(i) * 400 - u * 60) + '" cy="' + f(60 + hash(i + 5) * 420) + '" r="1.2" fill="#fff" opacity=".35"/>'; }
    return s;
  }
  function bgApproach(t, k) {   // the runway in perspective rising toward the plane, approach lights blinking
    var s = '<rect x="-300" y="-300" width="960" height="1300" fill="url(#gSkyEve)"/>' + clouds(t, 50, 5, 20, .8);
    var gy = lerp(640, 470, ease(k));
    s += '<rect x="-300" y="' + f(gy) + '" width="960" height="800" fill="#c9b48a"/><path d="M60 ' + f(gy + 400) + ' L160 ' + f(gy) + ' H200 L300 ' + f(gy + 400) + ' Z" fill="#4a4d52"/>';
    for (var d = 0; d < 8; d++) { var u = ((d / 8) + t * .9) % 1, yy = gy + u * u * 380, w = 2 + u * 6; s += '<rect x="' + f(180 - w / 2) + '" y="' + f(yy) + '" width="' + f(w) + '" height="' + f(4 + u * 24) + '" fill="#f4f4f2"/>'; }
    for (var l = 0; l < 6; l++) { var on = (Math.floor(t * 6) % 6) === l; s += '<circle cx="' + (150 - l * 8) + '" cy="' + f(gy - 2 - l * 3) + '" r="2" fill="' + (on ? "#fff7a8" : "#9a8a4a") + '"/><circle cx="' + (210 + l * 8) + '" cy="' + f(gy - 2 - l * 3) + '" r="2" fill="' + (on ? "#fff7a8" : "#9a8a4a") + '"/>'; }
    var tw = [300, gy]; s += '<rect x="' + f(tw[0]) + '" y="' + f(tw[1] - 70) + '" width="10" height="70" fill="#d9d4c8" stroke="' + INK + '" stroke-width="1"/><rect x="' + f(tw[0] - 8) + '" y="' + f(tw[1] - 86) + '" width="26" height="16" rx="3" fill="#7fb2cf" stroke="' + INK + '" stroke-width="1"/>';
    return s;
  }

  // ── events ───────────────────────────────────────
  var EV = window.EV = {
    yay0: W(0, "مبروك"), fall: L(1) + .3, prop: W(2, "محرك"), thrust: W(2, "تشفط"), wing: W(3, "الجناح"), down: W(3, "فيزق"), up: W(3, "والهوا"),
    lift: W(4, "قوة"), spin: L(5) + .4, fin: W(6, "جناح"), stab: W(6, "وجناح"), ctrl: W(7, "ألواح"), ctrlTag: W(8, "الجنيحات"),
    heavy: W(9, "مية"), jet: W(10, "محرك"), suck: W(10, "بيشفط"), squeeze: W(10, "ويضغطه"), burn: W(10, "ويولّع"), blow: W(10, "ويطلّعه"),
    high: L(11), cold: W(11, "سالب"), seal: W(12, "بتقفل"), pump: W(12, "وتضخ"), mtn: W(13, "جبل"), fuel: W(14, "بتخزّنه"),
    land: L(15), fast: W(15, "سريعة"), flaps: W(16, "ألواح"), flapTag: W(16, "الفلابس"), gear: W(17, "وعجل"), gearUp: W(17, "ويستخبى"),
    card: L(18) - .1, cardBend: W(18, "اتثنى"), cardEnd: E(18) + .25, win: W(19, "الشبابيك"), seats: W(19, "والكراسي"), nav: W(19, "ونور"),
    yay: W(20, "ومبروك"), vote: L(21) + .3, end: window.TIMING.duration
  };

  // ── camera: stays back; the plane grows, the camera pulls out with it ─────
  var SHOTS = [[0, [225, 385, 1.55]], [1, [205, 420, 1.4]], [2, [190, 360, 1.7]], [3, [185, 370, 1.6]], [5, [185, 360, 1.5]], [6, [190, 355, 1.45]],
    [9, [180, 360, 1.3]], [10, [176, 350, 1.14]], [11, [180, 345, 1.12]], [15, [180, 355, 1.12]], [18, [180, 355, 1.12]], [20, [180, 330, 1.02]], [21, [180, 330, 1.02]]];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : SHOTS[0][1], b = SHOTS[i][1], k = ease((t - (L(SHOTS[i][0]) - .45)) / 1.2);
    if (i === 0) { a = [240, 380, 1.75]; k = ease(t / 2.4); }
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 2.5; c[1] += Math.cos(t * .29) * 2; c[2] *= 1 + .01 * Math.sin(t * .23);
    return c;
  }

  // ── cards ─────────────────────────────────────────
  function engineCard(t) {        // the turbofan cut open (from the two cutaways the user sent): fan, compressor, burner, turbine, nozzle
    var k = after(t, EV.suck - .3, .5) * (1 - after(t, E(10), .4)); if (k <= 0) return "";
    var hi = t < EV.squeeze ? 0 : t < EV.burn ? 1 : t < EV.blow ? 2 : 3, s = '<g transform="translate(180 470) scale(' + f(pop(after(t, EV.suck - .3, .9))) + ')">';
    s += '<rect x="-160" y="-92" width="320" height="184" rx="18" fill="#14232f" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M-140 -60 Q-120 -70 -60 -64 L120 -30 L140 -26 L140 26 L120 30 L-60 64 Q-120 70 -140 60 Z" fill="#3a4450" stroke="#9aa4ad" stroke-width="1.4"/>';
    s += '<ellipse cx="-118" cy="0" rx="9" ry="58" fill="#4f6a86" stroke="#bfe3f2" stroke-width="1.2" opacity="' + (hi === 0 ? 1 : .6) + '"/>';
    for (var b = 0; b < 9; b++) { var yy = -52 + b * 13 + Math.sin(t * 20 + b) * 2; s += '<path d="M-124 ' + f(yy) + ' l12 5" stroke="#bfe3f2" stroke-width="2" opacity="' + (hi === 0 ? 1 : .5) + '"/>'; }
    s += '<path d="M-118 -6 L-132 0 L-118 6 Z" fill="#d6dbe0"/>';
    for (var c = 0; c < 7; c++) { var x = -90 + c * 12, hh = 40 - c * 4; s += '<path d="M' + x + ' -' + hh + ' V' + hh + '" stroke="' + (hi === 1 ? "#6ee07a" : "#8a929c") + '" stroke-width="5" stroke-dasharray="3 2"/>'; }
    s += '<rect x="0" y="-22" width="44" height="44" rx="8" fill="' + (hi === 2 ? "#ff8a3c" : "#6a4a3a") + '"/>';
    if (hi >= 2) for (var fl = 0; fl < 6; fl++) { var fu = (t * 3 + fl / 6) % 1; s += '<ellipse cx="' + f(8 + fu * 34) + '" cy="' + f((hash(fl) - .5) * 26) + '" rx="' + f(6 - fu * 3) + '" ry="' + f(4 - fu * 2) + '" fill="#ffd27a" opacity="' + f(1 - fu) + '"/>'; }
    for (var tb = 0; tb < 3; tb++) s += '<path d="M' + (54 + tb * 12) + ' -24 V24" stroke="' + (hi === 3 ? "#ffb347" : "#8a929c") + '" stroke-width="5" stroke-dasharray="3 2"/>';
    s += '<path d="M-118 0 H100" stroke="#c9ced4" stroke-width="3"/>';
    for (var a = 0; a < 10; a++) { var au = (t * (hi >= 3 ? 1.6 : .8) + a / 10) % 1, ax = lerp(-150, 150, au), ay = (hash(a) - .5) * lerp(110, 40, au); s += '<path d="M' + f(ax) + ' ' + f(ay) + ' h' + f(8 + au * 14) + '" stroke="' + (au > .55 ? "#ff8a3c" : "#bfe3f2") + '" stroke-width="2.2" stroke-linecap="round" opacity="' + f(Math.sin(au * 3.14)) + '"/>'; }
    var names = ["يشفط", "يضغط", "يولّع", "يطلّع"], xs = [-118, -60, 22, 120];
    for (var n = 0; n <= hi; n++) s += '<g transform="translate(' + xs[n] + ' -76)"><rect x="-30" y="-13" width="60" height="24" rx="12" fill="' + (n === hi ? YEL : "#2b3a46") + '"/><text x="0" y="5" text-anchor="middle" class="sm" fill="' + (n === hi ? INK : "#fff") + '">' + names[n] + '</text></g>';
    return '<g opacity="' + f(clamp(k * 3)) + '">' + s + '</g></g>';
  }
  function airfoilCard(t) {       // the wing cut across: curved on top, tilted; the air turned down, the wing pushed up
    var k = after(t, EV.wing, .5) * (1 - after(t, EV.lift + 1.6, .4)); if (k <= 0) return "";
    var s = '<g transform="translate(180 500) scale(' + f(pop(after(t, EV.wing, .9))) + ')"><rect x="-150" y="-70" width="300" height="140" rx="18" fill="#eaf4fb" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<g transform="rotate(-6)"><path d="M-80 4 C-80 -22 -10 -30 90 -2 C20 8 -40 14 -80 4 Z" fill="#e8ecf0" stroke="' + INK + '" stroke-width="2"/></g>';
    var dn = after(t, EV.down, .8), up = after(t, EV.up, .8);
    for (var i = 0; i < 6; i++) { var u = (t * .9 + i / 6) % 1, x = lerp(-140, 140, u), y0 = -50 + i * 18, bend = x > 0 ? (x / 140) * 30 * dn : 0; s += '<path d="M' + f(x - 14) + ' ' + f(y0 + bend * .8) + ' L' + f(x) + ' ' + f(y0 + bend) + '" stroke="#3a9be0" stroke-width="2.2" stroke-linecap="round" opacity="' + f(Math.sin(u * 3.14)) + '"/>'; }
    if (up > 0) s += '<path d="M0 -10 V' + f(-10 - 50 * up) + '" stroke="' + GRN + '" stroke-width="6"/><path d="M-10 ' + f(-6 - 50 * up) + ' L0 ' + f(-20 - 50 * up) + ' L10 ' + f(-6 - 50 * up) + '" fill="' + GRN + '"/>';
    return '<g opacity="' + f(clamp(k * 3)) + '">' + s + '</g></g>';
  }
  function bendCard(t) {          // the 787 wing test: the wing bent up 7.6 m (25 ft) and did not break
    var k = after(t, EV.card, .45) * (1 - after(t, EV.cardEnd - .35, .35)); if (k <= 0) return "";
    var b = ease(after(t, EV.cardBend, 1.6)) * (1 + .03 * Math.sin(t * 6)), s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.55 * k) + '"/><g transform="translate(180 400) scale(' + f(pop(after(t, EV.card, .9))) + ')">';
    s += '<rect x="-150" y="-150" width="300" height="290" rx="22" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="3"/><text x="0" y="-116" text-anchor="middle" class="hd" fill="' + INK + '">وتعرف إيه الغريب؟</text>';
    s += '<circle cx="0" cy="40" r="20" fill="#e8ecf0" stroke="' + INK + '" stroke-width="2"/>';
    [-1, 1].forEach(function (sd) { s += '<path d="M' + (sd * 18) + ' 46 Q' + (sd * 70) + ' ' + f(46 - 20 * b) + ' ' + (sd * 128) + ' ' + f(46 - 88 * b) + '" stroke="' + INK + '" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M' + (sd * 18) + ' 46 Q' + (sd * 70) + ' ' + f(46 - 20 * b) + ' ' + (sd * 128) + ' ' + f(46 - 88 * b) + '" stroke="#e8ecf0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M' + (sd * 18) + ' 46 L' + (sd * 128) + ' 46" stroke="#9aa4ad" stroke-width="2" stroke-dasharray="5 4"/>'; });
    s += '<path d="M128 46 V' + f(46 - 88 * b) + '" stroke="' + RED + '" stroke-width="2.4"/><text x="104" y="' + f(30 - 40 * b) + '" text-anchor="end" class="big" fill="' + RED + '" opacity="' + f(b) + '">7.6 م</text>';
    s += '<text x="0" y="112" text-anchor="middle" class="tg" fill="' + INK + '">بوينج 787 • ومتكسرش!</text>';
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var c = window.__cam || cam(t); CAM = c;
    // size: the crude glider (12 m tube) grows into the airliner (37.6 m) when it has to carry 150 people
    var grow = ease(after(t, EV.heavy + .3, 2.6)), jet = after(t, EV.jet, .8);
    G.lf = lerp(12, 37.6, grow); G.r = lerp(.3, 1.98, grow); G.x0 = 180 - G.lf * M / 2;
    var st = {
      span: lerp(7, 16, grow), sweep: lerp(.05, .47, grow), metal: t >= EV.wing ? 1 : 0, prop: t >= EV.prop && t < EV.jet + .4 ? after(t, EV.prop, .9) : 0,
      thrust: t >= EV.thrust ? 1 : 0, fin: after(t, EV.fin, .7), stab: after(t, EV.stab, .7), ctrl: after(t, EV.ctrl, .6), ctrlMove: t < EV.heavy ? 1 : .35,
      jet: jet, fuel: after(t, EV.fuel, 1.4) * (1 - after(t, EV.land + .5, .8)), flaps: after(t, EV.flaps, 1.2) * (1 - after(t, EV.yay + .5, 1.2)),
      gear: after(t, EV.gear, 1.1) * (1 - after(t, EV.gearUp + .2, 1)) + after(t, EV.win - .2, .8) * (t < EV.yay + .4 ? 1 : 1 - after(t, EV.yay + .4, 1)),
      press: after(t, EV.pump, .8) * (1 - after(t, EV.fuel, .5)), win: after(t, EV.win, .6), seats: after(t, EV.seats, .6) * (1 - after(t, EV.yay, .8)),
      nav: after(t, EV.nav, .6), sharklet: after(t, EV.win - .5, .8)
    };
    st.gear = clamp(st.gear);
    // background phases
    var s = "", ph = t < EV.prop - .2 ? 0 : t < EV.high - .2 ? 1 : t < EV.land - .2 ? 2 : 3;
    if (ph === 0) s += bgHill(t); else if (ph === 1) s += bgLow(t); else if (ph === 2) s += bgHigh(t); else s += bgApproach(t, after(t, EV.land, 3));
    if (ph === 3 && t >= EV.yay - .2) s += '<rect x="-300" y="-300" width="960" height="1300" fill="url(#gSkyDay)" opacity="' + f(after(t, EV.yay - .2, 1.4) * .85) + '"/>' + clouds(t, 80, 5, 40, after(t, EV.yay, 1));
    // the crude glider: pushed off the hill, then it noses down and falls
    var pose = "";
    if (t < EV.prop) {
      var push = ease(after(t, .2, 2.4)), fall = ease(after(t, EV.fall, 1.8));
      var gx = lerp(70, -10, push) - fall * 60, gy = lerp(-30, 6, push) + fall * fall * 150;
      pose = 'translate(' + f(gx) + ' ' + f(gy) + ') rotate(' + f(-fall * 34) + ' 180 360)';
      // the man who pushed it, on the hilltop
      var mx = 320 - push * 30; s += '<g transform="translate(' + f(mx) + ' 420)"><path d="M0 0 v-30" stroke="#3a78b8" stroke-width="10" stroke-linecap="round"/><path d="M0 0 l-6 22 M0 0 l6 22" stroke="#4a4f5a" stroke-width="6" stroke-linecap="round"/><path d="M0 -24 l' + f(-14 - push * 6) + ' 6" stroke="#d29a6e" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-40" r="8" fill="#d29a6e" stroke="' + INK + '" stroke-width="1.4"/><path d="M-8 -43 q8 -9 16 0" fill="#2a1d14"/></g>';
    } else {
      var wob = t >= EV.spin && t < EV.stab ? Math.sin(t * 7) * 14 * after(t, EV.spin, .5) : 0, sag = t >= EV.heavy && t < EV.jet ? 18 * after(t, EV.heavy, .8) : 0;
      var pitch = t >= EV.land ? -4 * after(t, EV.land, 1) + 3 * after(t, EV.flaps, 1) : 0;
      if (t >= EV.yay) pitch = -10 * ease(after(t, EV.yay, 1.6));
      var bob = Math.sin(t * 1.3) * 3;
      pose = 'translate(0 ' + f(bob + sag - (t >= EV.yay ? 40 * ease(after(t, EV.yay, 2)) : 0)) + ') rotate(' + f(wob + pitch) + ' 180 360)';
    }
    s += '<g transform="' + pose + '">' + plane(t, st) + '</g>';
    // speed streaks while it lands too fast; the "too short" mark on the runway
    if (t >= EV.fast && t < EV.flaps + 1) for (var i = 0; i < 10; i++) { var u = (t * 2.4 + i / 10) % 1; s += '<path d="M' + f(lerp(-20, 380, u)) + ' ' + f(250 + hash(i) * 220) + ' h30" stroke="#fff" stroke-width="2" opacity="' + f(.6 * Math.sin(u * 3.14)) + '"/>'; }
    var W2 = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';

    // screen layer: tags on the parts, gauges, cards
    var T = "", Lf = G.lf;
    function at(xm, hm, zm) { var p = Pm(xm, hm, zm || 0); return [p[0], p[1]]; }
    T += tag(c, [200, 400], "طيارة بدائية!", EV.yay0 - .2, t, { dur: 2.2 });
    T += tag(c, [150, 470], "وقعت!", EV.fall + .9, t, { red: true, dur: 1.8 });
    T += tag(c, at(-.5, 1.5), "مروحة", EV.prop + .2, t);
    T += tag(c, at(.45 * Lf, -1, -6), "قوة الرفع", EV.lift - .1, t, { col: GRN });
    T += tag(c, at(.5 * Lf, 2), "بتلف!", EV.spin + .5, t, { red: true, dur: 2 });
    T += tag(c, at(.92 * Lf, 6), "الديل", EV.fin + .2, t);
    T += tag(c, at(.6 * Lf, -1, -10), "الجنيحات والدفة", EV.ctrlTag - .1, t, { dur: 2.6 });
    T += tag(c, at(.5 * Lf, 3), "150 راكب!", EV.heavy, t, { red: true });
    T += tag(c, at(.42 * Lf, -4, -6), "محرك نفاث", EV.jet + .3, t, { dur: 1.8 });
    T += tag(c, at(.45 * Lf, 3), "هوا مضغوط", EV.pump + .3, t);
    T += tag(c, at(.55 * Lf, -1, -12), "الوقود في الجناح", EV.fuel + .2, t, { col: "#ffb347" });
    T += tag(c, at(.5 * Lf, 3), "سريعة جدًا!", EV.fast, t, { red: true, dur: 2 });
    T += tag(c, at(.48 * Lf, -2, -9), "الفلابس", EV.flapTag - .1, t);
    T += tag(c, at(.5 * Lf, -5, -4), "العجل", EV.gear + .4, t, { col: CREAM, dur: 2 });
    T += tag(c, at(.4 * Lf, 2.5), "شبابيك", EV.win, t, { col: CREAM, dur: 1.4 });
    T += tag(c, at(.42 * Lf, -1), "كراسي", EV.seats, t, { col: CREAM, dur: 1.4 });
    T += tag(c, at(.62 * Lf, 0, -17), "نور أحمر وأخضر", EV.nav, t, { col: CREAM, dur: 1.8 });
    if (t >= EV.heavy && t < EV.jet + .3) { var hk = after(t, EV.heavy, .5) * (1 - after(t, EV.jet, .3)); T += panelAt(560, hk, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">الركاب</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + RED + '">' + Math.round(150 * after(t, EV.heavy, 1.4)) + '</text>', 120, 62); }
    if (t >= EV.high && t < EV.mtn + 2.4) { var ak = after(t, EV.high, .5) * (1 - after(t, EV.mtn + 2, .4)), alt = Math.round(10 + 1 * after(t, EV.high, 2)), tmp = Math.round(-55 * after(t, EV.cold, 1.2));
      var inner = '<text x="-70" y="-14" text-anchor="middle" class="sm" fill="#9fc3d6">الارتفاع</text><text x="-70" y="16" text-anchor="middle" class="big" fill="#fff">' + alt + ' كم</text><text x="60" y="-14" text-anchor="middle" class="sm" fill="#9fc3d6">برّه</text><text x="60" y="16" text-anchor="middle" class="big" fill="#7fd0ff">' + tmp + '°</text>';
      if (t >= EV.mtn - .2) inner = '<text x="0" y="-14" text-anchor="middle" class="sm" fill="#9fc3d6">جوه الكابينة كأنك على ارتفاع</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + GRN + '">' + Math.round(2400 * after(t, EV.mtn, 1.2)) + ' م</text>';
      T += panelAt(560, ak, inner, 260, 70); }
    T += airfoilCard(t) + engineCard(t) + bendCard(t);
    T += confetti(t, EV.yay0, 60) + confetti(t, EV.yay, 90);
    T += voteCard(t, EV);
    return W2 + T;
  };
})();
