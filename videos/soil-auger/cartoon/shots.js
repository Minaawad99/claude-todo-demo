  // ── «تعمل بريمة حفر إزاي؟»: shared pieces (labels, marks) ──
  var INK = "#1c1c1c";
  function qmark(x, y, t, sz, col) { return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 4 + x) * 4) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:#1c1c1c;stroke-width:2;paint-order:stroke">؟</text>'; }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"/>'; }
  function T(text, x, y, sz, col) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + sz + 'px Noto Sans Arabic;fill:' + (col || "#fff") + ';stroke:' + INK + ';stroke-width:' + f(sz / 9) + ';paint-order:stroke">' + text + '</text>'; }
  function check(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#3aa05a" stroke="' + INK + '" stroke-width="3"/><path d="M-12 0 L-3 10 L14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function cross(x, y, s, k) { if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(pop(k) * s) + ')"><circle r="26" fill="#d8352a" stroke="' + INK + '" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>'; }
  function star(x, y, r, t, col) { var d = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2 + t * 2, rr = i % 2 ? r * 0.45 : r * (1 + 0.15 * Math.sin(t * 18 + i)); d += (i ? " L" : "M") + f(x + Math.cos(a) * rr) + " " + f(y + Math.sin(a) * rr); } return '<path d="' + d + ' Z" fill="' + (col || "#ffe46a") + '" stroke="' + INK + '" stroke-width="2.4"/>'; }
  function tube(d, w, col) { if (!d) return ""; return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="' + (col || "#b9c0c8") + '" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function flowD(d, t, col, w, sp) { if (!d) return ""; return '<path d="' + d + '" stroke="' + (col || FUEL) + '" stroke-width="' + (w || 3) + '" fill="none" stroke-dasharray="6 8" stroke-dashoffset="' + f(-((t * (sp || 40)) % 14)) + '" stroke-linecap="round"/>'; }
  function confetti(t, x0, x1, y0, y1) { var s = ""; for (var c = 0; c < 26; c++) { var p = (t * 0.5 + hash(c)) % 1, x = x0 + hash(c + 2) * (x1 - x0), y = lerp(y0, y1, p); s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="6" height="9" fill="' + ["#c23a26", "#f2c230", "#3aa05a", "#2f6f9f"][c % 4] + '" transform="rotate(' + f(t * 200 + c * 40) + ' ' + f(x) + ' ' + f(y) + ')"/>'; } return s; }
  // ── people as in the Hiroshima video (story-2d): real proportions, cel shading, faces; kept in their own scope ──
  var HC = (function () {
    var INK = "#121419";
  function P(d, fill, o) { o = o || {}; return '<path d="' + d + '" fill="' + fill + '"' + (o.s === 0 ? '' : ' stroke="' + (o.s || INK) + '" stroke-width="' + (o.w || 1.6) + '" stroke-linejoin="round"') + (o.op != null ? ' opacity="' + f2(o.op) + '"' : '') + (o.x || '') + '/>'; }
  function f2(n) { return (+n).toFixed(3); }
  function R(x, y, w, h, fill, o) { return P('M' + f(x) + ' ' + f(y) + 'h' + f(w) + 'v' + f(h) + 'h' + f(-w) + 'Z', fill, o); }
  function G(tr, inner, op) { return '<g transform="' + tr + '"' + (op != null ? ' opacity="' + f2(op) + '"' : '') + '>' + inner + '</g>'; }
  var CLN = 0;
  function darker(c, k) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; k = k || .72; return "#" + [r, g, b].map(function (v) { return ("0" + Math.round(v * k).toString(16)).slice(-2); }).join(""); }
  function cel(d, col, cid, o) { return P(d, col, o) + '<path d="' + d + '" fill="' + darker(col, .8) + '" clip-path="url(#' + cid + ')"/>'; }
  function face(view, o) {   // head centred at 0,0, ~22 wide × 26 tall; view: front | side | back | up
    o = o || {}; var skin = o.skin || "#c98f66", hair = o.hairCol || "#15110e", g = "", hs = o.hair || "short", side = view === "side";
    if (view === "back") { g += P('M-11 -2 Q-12 -15 0 -15 Q12 -15 11 -2 Q11 10 0 13 Q-11 10 -11 -2Z', skin, { w: 1.3 }); }
    else if (o.child) g += P('M-12 -3 Q-12 -16 0 -16 Q12 -16 12 -3 Q12 9 0 12 Q-12 9 -12 -3Z', skin, { w: 1.3 });
    else g += P(side ? 'M-9 -4 Q-10 -15 1 -15 Q11 -14 11 -4 L13 1 L11 3 Q11 10 4 13 Q-6 14 -9 6 Z' : 'M-11 -3 Q-11 -15 0 -15 Q11 -15 11 -3 Q11 7 6 11 Q0 15 -6 11 Q-11 7 -11 -3Z', skin, { w: 1.3 });
    if (view !== "back") g += P(side ? 'M-3 6 Q4 12 9 7 Q8 12 3 13 Q-3 12 -3 6Z' : 'M3 -3 Q11 -3 10 3 Q8 10 1 13 Q5 6 3 -3Z', darker(skin, .8), { s: 0 });
    if (o.child && view === "front") { g += '<circle cx="-5" cy="1" r="2" fill="' + INK + '"/><circle cx="5" cy="1" r="2" fill="' + INK + '"/><circle cx="-4.3" cy=".3" r=".7" fill="#fff"/><circle cx="5.7" cy=".3" r=".7" fill="#fff"/><path d="M-8 -4 q2.5 -1.4 5 0 M3 -4 q2.5 -1.4 5 0" stroke="' + INK + '" stroke-width="1" fill="none"/><path d="M-2.4 7 q2.4 1.8 4.8 0" stroke="#6a3a2a" stroke-width="1.1" fill="none"/><ellipse cx="-7" cy="5" rx="2.4" ry="1.4" fill="#e88a7a" opacity=".5"/><ellipse cx="7" cy="5" rx="2.4" ry="1.4" fill="#e88a7a" opacity=".5"/>'; }
    else if (view === "front" || view === "up") { var ey = view === "up" ? -5 : -2;
      g += '<path d="M-8 ' + (ey - 4.5) + ' q3 -1.6 6 -.4 M2 ' + (ey - 4.9) + ' q3 -1.2 6 .4" stroke="' + INK + '" stroke-width="1.1" fill="none"/>';
      g += '<path d="M-8 ' + ey + ' q3 -2.6 6 0 q-3 1.6 -6 0Z M2 ' + ey + ' q3 -2.6 6 0 q-3 1.6 -6 0Z" fill="' + INK + '"/><circle cx="-4.4" cy="' + (ey - .6) + '" r=".6" fill="#fff"/><circle cx="5.6" cy="' + (ey - .6) + '" r=".6" fill="#fff"/>';
      g += (o.child ? '' : '<path d="M1 ' + (ey + 2) + ' q1.2 2.4 -.6 3.6" stroke="' + darker(skin, .6) + '" stroke-width=".7" fill="none"/>') + '<path d="M-3 ' + (ey + 10) + ' q3 ' + (o.sad ? -1.2 : 1.2) + ' 6 0" stroke="#6a3a2a" stroke-width="1.2" fill="none"/>'; }
    if (side) g += '<path d="M6 -7 q3 -1.4 5 0" stroke="' + INK + '" stroke-width="1.2" fill="none"/><path d="M6 -3 q2.6 -1.6 4.4 0 q-2.2 1.2 -4.4 0Z" fill="' + INK + '"/><path d="M8 7 h3" stroke="#6a3a2a" stroke-width="1.1"/><path d="M-3 -4 q-3 2 0 5" stroke="' + darker(skin, .6) + '" stroke-width="1.1" fill="none"/>';
    // hair
    if (hs === "bob") g += P(view === "back" ? 'M-13 -2 Q-14 -18 0 -18 Q14 -18 13 -2 L13 9 Q0 12 -13 9 Z' : side ? 'M-11 -4 Q-12 -18 2 -18 Q12 -17 12 -8 Q4 -12 2 -6 L0 2 L-2 9 L-12 9 Z' : 'M-13 -3 Q-14 -18 0 -18 Q14 -18 13 -3 L13 9 L9 9 L9 -6 Q2 -9 -9 -6 L-9 9 L-13 9 Z', hair, { w: 1.2 }) + '<path d="M-6 -15 q4 -2 9 -1" stroke="#6a6a7a" stroke-width="1.2" fill="none" opacity=".7"/>';
    else if (hs === "bun") g += '<circle cx="' + (side ? -10 : 0) + '" cy="-16" r="6" fill="' + hair + '" stroke="' + INK + '" stroke-width="1.2"/>' + P(side ? 'M-10 -2 Q-11 -16 2 -16 Q11 -15 10 -8 Q2 -10 -2 -4 Z' : 'M-12 -2 Q-12 -17 0 -17 Q12 -17 12 -2 Q6 -10 0 -10 Q-6 -10 -12 -2Z', hair, { w: 1.2 });
    else if (hs === "cap") g += P(side ? 'M-11 -6 Q-11 -19 1 -19 Q11 -18 11 -9 L-11 -6Z' : 'M-12 -10 Q-12 -22 0 -22 Q12 -22 12 -10 Z', o.capCol || "#1c2230", { w: 1.2 }) + P(side ? 'M9 -10 L20 -7 L10 -6Z' : 'M-12 -10 Q0 -6 12 -10 L13 -7 Q0 -3 -13 -7Z', "#0e1016", { w: 1 }) + '<circle cx="' + (side ? 1 : 0) + '" cy="-16" r="1.6" fill="#c9a860"/>';
    else if (hs !== "none") g += P(view === "back" ? 'M-12 -1 Q-13 -18 0 -18 Q13 -18 12 -1 Q6 -4 0 -4 Q-6 -4 -12 -1Z' : side ? 'M-10 -3 Q-12 -18 2 -18 Q12 -17 11 -8 Q4 -12 -1 -8 L-4 0 Z' : 'M-12 -3 Q-13 -18 0 -18 Q13 -18 12 -3 Q9 -11 2 -10 Q-4 -12 -8 -8 Z', hair, { w: 1.2 }) + '<path d="M-5 -15 q5 -2 9 0" stroke="#5a5a6a" stroke-width="1.1" fill="none" opacity=".6"/>';
    if (o.capCol && hs !== "cap" && view !== "side") g += P('M-12 -10 Q-12 -22 0 -22 Q12 -22 12 -10 Z', o.capCol, { w: 1.2 }) + P('M-12 -10 Q0 -6 12 -10 L13 -7 Q0 -3 -13 -7Z', "#0e1016", { w: 1 }) + '<circle cx="0" cy="-16" r="1.6" fill="#c9a860"/>';
    if ((hs === "bob" || hs === "bun") && (view === "front" || view === "up") && !o.child) { var ly = view === "up" ? -5 : -2; g += '<path d="M-8 ' + ly + ' l-1.6 -1.4 M8 ' + ly + ' l1.6 -1.4" stroke="' + INK + '" stroke-width="1"/>'; }
    if (o.band) g += R(-12, -12, 24, 4, "#f0ede4", { w: .9 }) + '<circle cx="0" cy="-10" r="1.6" fill="#c2361a"/>';
    return g;
  }
  function person(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, view = o.view || (o.walk ? "side" : o.back ? "back" : o.look === "up" ? "up" : "front"), side = view === "side";
    var wk = o.walk ? Math.sin(t * 5 + (o.ph || 0)) : 0, top = o.top || "#f0ede4", pants = o.pants || "#3a4252", skin = o.skin || "#c98f66", br = Math.sin(t * 1.6 + (o.ph || 0)) * .8;
    var hair = o.hair === "bob" ? "bob" : o.hair || (o.cap ? "cap" : "short");
    var g = '<clipPath id="' + cid + '"><rect x="' + (side ? -40 : 3) + '" y="-200" width="' + (side ? 36 : 60) + '" height="220"/></clipPath>';
    // legs (monpe trousers are baggy, gathered at the ankle)
    var legs = side ? [[wk * 22], [-wk * 22]] : [[-6], [6]];
    legs.forEach(function (lg, k) { var a = side ? lg[0] : 0, hx = side ? 0 : lg[0]; g += G('rotate(' + f(a) + ' ' + hx + ' -84)', cel('M' + (hx - 8) + ' -86 L' + (hx - 7) + ' -8 Q' + hx + ' -4 ' + (hx + 6) + ' -8 L' + (hx + 8) + ' -86 Z', pants, cid, { w: 1.4 }) + P('M' + (hx - 6) + ' -8 L' + (hx - 6) + ' 0 H' + (hx + (side ? 12 : 7)) + ' Q' + (hx + (side ? 12 : 7)) + ' -5 ' + (hx + 5) + ' -8Z', "#2a2420", { w: 1.2 })); });
    // torso + arms
    var arm = function (sx, sw) { return G('rotate(' + f(sw) + ' ' + sx + ' -128)', cel('M' + (sx - 5) + ' -130 L' + (sx - 6) + ' -82 L' + (sx + 5) + ' -82 L' + (sx + 6) + ' -128 Z', top, cid, { w: 1.3 }) + '<ellipse cx="' + sx + '" cy="-78" rx="4.6" ry="5.6" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.1"/>'); };
    if (side) g += arm(0, -wk * 26);
    g += cel(side ? 'M-10 -134 Q0 -140 10 -134 L12 -86 H-10 Z' : 'M-20 -132 Q0 -140 20 -132 L16 -84 H-16 Z', top, cid, { w: 1.5 });
    if (!side) g += '<path d="M-6 -136 L0 -126 L6 -136" stroke="' + INK + '" stroke-width="1.1" fill="none"/><path d="M-8 -104 q8 4 16 0" stroke="' + darker(top, .6) + '" stroke-width="1" fill="none"/>';
    if (o.monpe) g += R(side ? -10 : -16, -92, side ? 22 : 32, 8, pants, { w: 1.2 });
    g += !side ? arm(-22, o.look === "up" ? 6 : 4 + br) + arm(22, o.wave ? -150 + Math.sin(t * 6) * 15 : -4 - br) : arm(0, wk * 26);
    if (o.bag) g += P('M' + (side ? -16 : 14) + ' -112 h14 v18 h-14 Z', "#7a5a3a", { w: 1.2 }) + '<path d="M' + (side ? -9 : 21) + ' -112 L' + (side ? 6 : -14) + ' -134" stroke="#5a3a20" stroke-width="2"/>';
    // neck + head
    g += R(-4, -144, 8, 10, skin, { w: 1.1 }) + G('translate(0 -157) rotate(' + f(view === "up" ? (side ? -18 : 0) : br) + ')', face(view, { skin: skin, hair: hair, hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad }));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s * .42 * (o.flip ? -1 : 1)) + ' ' + f(s * .42) + ')', g, o.op);
  }
  // a big close-up portrait (the user's middle panel): head and shoulders, cel-shaded, light from the left
  function portrait(x, y, s, t, o) {
    o = o || {}; CLN++; var cid = "pc" + CLN, skin = o.skin || "#c98f66", top = o.top || "#f0ede4", bl = (t % 4.2) < .12;
    var g = '<clipPath id="' + cid + '"><rect x="4" y="-200" width="200" height="400"/></clipPath>';
    g += cel('M-70 120 Q-66 60 -30 48 L30 48 Q66 60 70 120 Z', top, cid, { w: 2 }) + '<path d="M-14 48 L0 70 L14 48" stroke="' + INK + '" stroke-width="1.6" fill="' + darker(top, .85) + '"/>';
    g += cel('M-11 20 L-12 52 Q0 58 12 52 L11 20 Z', skin, cid, { w: 1.6 });
    g += G('scale(2.6)', face("front", { skin: skin, hair: o.hair || "bob", hairCol: o.hairCol, capCol: o.cap, band: o.band, sad: o.sad, child: o.child }));
    if (bl) g += '<path d="M-22 -6 h16 M6 -6 h16" stroke="' + skin + '" stroke-width="6"/><path d="M-21 -5 q8 3 14 0 M7 -5 q8 3 14 0" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    if (o.rim) g += '<path d="M-29 -20 Q-31 10 -16 30" stroke="#fff6dc" stroke-width="2.4" fill="none" opacity=".75"/>';
    return G('translate(' + f(x) + ' ' + f(y + Math.sin(t * 1.4) * 1.2) + ') scale(' + s + ')', g, o.op);
  }
    return { person: person, portrait: portrait, face: face, darker: darker };
  })();

  // ── shots ───────────────────────────────────────────────
  var SH = [];
  function shot(line, cam, draw) { SH.push({ a: L(line), cam: cam, draw: draw }); }
  function at(t) { var i = 0; while (i < SH.length - 1 && SH[i + 1].a <= t) i++; return i; }

  // ── from a nail to an earth auger, in cross-section (parts after real augers, ../refs/SOURCES.md): helical flighting on a
  // shaft, hardened cutting teeth, a pilot point, a T-handle, extension rods, a petrol engine and gearbox, a spring shock
  // absorber, an excavator-mounted auger, and a hollow-stem (CFA) auger that pumps concrete as it is withdrawn.
  var GY = 150, AX = 320, SOILC = "#9a7048", SOILD = "#7a5636", HARD = GY + 78, CONC = "#b9b4a8";
  function worker(x, t, o) { var p = { cap: "#f2c230", top: "#e8742e", pants: "#3a4252" }; for (var k in (o || {})) p[k] = o[k]; return HC.person(x, p.y == null ? GY : p.y, p.s || 0.85, t, p); }
  function face(x, y, s, t, o) { var p = { cap: "#f2c230", top: "#e8742e", hair: "short" }; for (var k in (o || {})) p[k] = o[k]; return HC.portrait(x, y, s, t, p); }
  // the site: sky, far city, a site fence, the ground in section (soft soil, a hard dry layer, clay); o.sand = loose wet sand
  function scene(t, o) {
    o = o || {}; var k = o.sky || "day", dark = k !== "day", i, s = sky(k) + (k === "night" ? stars(t) : clouds(t, 14, -80, 5, 0.85));
    s += city(t, GY - 6, 90, dark ? "#2f3a52" : "#a9bccb", "#ffe9a0", 5, dark) + cars(t, GY - 12, 40);
    for (i = -8; i < 26; i++) s += R(i * 44, GY - 30, 40, 26, i % 2 ? "#e2b035" : "#f4f1e8", 1.2) ;
    s += '<rect x="-400" y="' + (GY - 4) + '" width="1440" height="5" fill="#8a7a5a"/>';
    if (o.sand) {
      s += '<rect x="-400" y="' + GY + '" width="1440" height="900" fill="#d9b46a"/><rect x="-400" y="' + (GY + 112) + '" width="1440" height="900" fill="#b89a5a"/>';
      for (i = 0; i < 110; i++) s += '<circle cx="' + f(-380 + hash(i) * 1400) + '" cy="' + f(GY + 8 + hash(i + 4) * 260) + '" r="' + f(0.8 + hash(i + 7) * 1.4) + '" fill="#8a6a30" opacity=".6"/>';
      var w = "M-400 " + (GY + 112); for (var x = -400; x <= 1040; x += 20) w += " L" + x + " " + f(GY + 112 + Math.sin(x * 0.04 + t * 1.6) * 1.6); s += '<path d="' + w + '" stroke="#5aa0c8" stroke-width="3" fill="none" stroke-dasharray="14 8" stroke-dashoffset="' + f(-t * 16) + '"/>';
    } else {
      s += '<rect x="-400" y="' + GY + '" width="1440" height="900" fill="' + SOILC + '"/><rect x="-400" y="' + HARD + '" width="1440" height="900" fill="#6a4a30"/><rect x="-400" y="' + (HARD + 90) + '" width="1440" height="900" fill="' + SOILD + '"/>';
      for (i = 0; i < 60; i++) s += '<circle cx="' + f(-380 + hash(i) * 1400) + '" cy="' + f(GY + 12 + hash(i + 4) * 62) + '" r="' + f(1.5 + hash(i + 7) * 2.2) + '" fill="#5a3c20" opacity=".5"/>';
      for (i = 0; i < 46; i++) { var px = -380 + hash(i + 50) * 1400, py = HARD + 8 + hash(i + 54) * 76; s += '<path d="M' + f(px) + ' ' + f(py) + ' l6 -4 l7 3 l-2 6 l-9 1 Z" fill="#8a8478" stroke="#3a2a1c" stroke-width="1"/>'; }
      for (i = 0; i < 70; i++) s += '<circle cx="' + f(-380 + hash(i + 90) * 1400) + '" cy="' + f(HARD + 100 + hash(i + 94) * 420) + '" r="' + f(1.5 + hash(i + 97) * 2.5) + '" fill="#4a3020" opacity=".5"/>';
    }
    s += '<rect x="-400" y="' + (GY - 2) + '" width="1440" height="6" fill="#6a5a3a" stroke="' + INK + '" stroke-width="1.4"/>';
    return s;
  }
  // the tool. x axis, top..tip, r flight radius; o: helix 0..1 (wrapped from the tip up), flTop, spin (flights move up),
  // dirt, dirtCol, head (nail head), point (nail point), teeth, pilot, hollow, conc (concrete flowing down the stem)
  var AN = 0;
  function auger(x, top, tip, r, t, o) {
    o = o || {}; AN++; var id = "au" + AN, p = o.pitch || r * 1.3, ph = (((t * (o.spin || 0)) % p) + p) % p, flTop = o.flTop == null ? top + 16 : o.flTop, k = o.helix == null ? 1 : clamp(o.helix);
    var cTop = lerp(tip - 1, flTop, k), sw = o.hollow ? r * 0.5 : Math.max(4, r * 0.26), th = r * 0.24, s = "", back = "", front = "", y;
    if (k > 0) for (y = flTop - 2 * p; y < tip; y += p) { var y0 = y - ph;
      back += '<path d="M' + f(x + r) + ' ' + f(y0 + p / 2) + ' Q' + f(x) + ' ' + f(y0 + p * 0.6) + ' ' + f(x - r) + ' ' + f(y0 + p) + ' v' + f(th) + ' Q' + f(x) + ' ' + f(y0 + p * 0.6 + th) + ' ' + f(x + r) + ' ' + f(y0 + p / 2 + th) + ' Z" fill="#6a727c" stroke="' + INK + '" stroke-width="1.3"/>';
      front += '<path d="M' + f(x - r) + ' ' + f(y0) + ' Q' + f(x) + ' ' + f(y0 + p * 0.4) + ' ' + f(x + r) + ' ' + f(y0 + p / 2) + ' v' + f(th) + ' Q' + f(x) + ' ' + f(y0 + p * 0.4 + th) + ' ' + f(x - r) + ' ' + f(y0 + th) + ' Z" fill="#cfd4da" stroke="' + INK + '" stroke-width="1.5"/><path d="M' + f(x - r * 0.8) + ' ' + f(y0 + th * 0.5 + p * 0.06) + ' Q' + f(x) + ' ' + f(y0 + p * 0.4 + th * 0.4) + ' ' + f(x + r * 0.6) + ' ' + f(y0 + p * 0.44 + th * 0.4) + '" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>';
      if (o.dirt) front += '<ellipse cx="' + f(x - r * 0.42) + '" cy="' + f(y0 + p * 0.1 - 1) + '" rx="' + f(r * 0.46) + '" ry="' + f(r * 0.2) + '" fill="' + (o.dirtCol || "#b08a5a") + '" stroke="' + INK + '" stroke-width=".8"/><ellipse cx="' + f(x + r * 0.45) + '" cy="' + f(y0 + p * 0.36 - 1) + '" rx="' + f(r * 0.4) + '" ry="' + f(r * 0.17) + '" fill="' + (o.dirtCol || "#b08a5a") + '" stroke="' + INK + '" stroke-width=".8"/>';
    }
    s += '<clipPath id="' + id + '"><rect x="' + f(x - r - 4) + '" y="' + f(cTop) + '" width="' + f(2 * r + 8) + '" height="' + f(Math.max(0, tip - cTop + th)) + '"/></clipPath>';
    s += '<g clip-path="url(#' + id + ')">' + back + '</g>' + R(x - sw / 2, top, sw, tip - top, "#9aa2ac", 1.6, 1);
    if (o.hollow) s += '<rect x="' + f(x - sw * 0.26) + '" y="' + f(top) + '" width="' + f(sw * 0.52) + '" height="' + f(tip - top) + '" fill="' + (o.conc ? CONC : "#23272c") + '"/>' + (o.conc ? flowD("M" + f(x) + " " + f(top) + " V" + f(tip), t, "#7a766c", sw * 0.3, 70) : "");
    else s += '<path d="M' + f(x - sw * 0.2) + ' ' + f(top + 2) + ' V' + f(tip - 2) + '" stroke="#e9eef2" stroke-width="' + f(sw * 0.2) + '" opacity=".7"/>';
    s += '<g clip-path="url(#' + id + ')">' + front + '</g>';
    if (o.head) s += R(x - r * 1.5 * o.head - 3, top - 5, (r * 1.5 * o.head + 3) * 2, 6, "#8a929c", 1.6, 2);
    if (o.point) s += '<path d="M' + f(x - sw / 2) + ' ' + f(tip) + ' L' + f(x) + ' ' + f(tip + 14) + ' L' + f(x + sw / 2) + ' ' + f(tip) + ' Z" fill="#9aa2ac" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    if (o.teeth > 0) { var tk = pop(o.teeth); [-1, 1].forEach(function (d) { s += '<path d="M' + f(x + d * r) + ' ' + f(tip - 2) + ' L' + f(x + d * r * 0.2) + ' ' + f(tip - 2) + ' L' + f(x + d * r * 0.78) + ' ' + f(tip - 2 + r * 0.5 * tk) + ' Z" fill="#e2b035" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>'; }); }
    if (o.pilot > 0) { var pk = pop(o.pilot); s += '<path d="M' + f(x - sw * 0.9) + ' ' + f(tip - 1) + ' L' + f(x) + ' ' + f(tip - 1 + r * 0.85 * pk) + ' L' + f(x + sw * 0.9) + ' ' + f(tip - 1) + ' Z" fill="#5a6068" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>'; }
    return s;
  }
  function hole(x, r, y1, col) { return '<rect x="' + f(x - r - 2) + '" y="' + GY + '" width="' + f(2 * r + 4) + '" height="' + f(Math.max(0, y1 - GY)) + '" fill="' + (col || "#3a2a1c") + '"/>'; }
  function spoil(x, r, k, t, col) { k = clamp(k); var h = 4 + 16 * k, s = ""; [-1, 1].forEach(function (d) { s += '<path d="M' + f(x + d * (r + 2)) + ' ' + GY + ' Q' + f(x + d * (r + 20)) + ' ' + f(GY - h * 1.6) + ' ' + f(x + d * (r + 44 + 20 * k)) + ' ' + GY + ' Z" fill="' + (col || "#6a4a2a") + '" stroke="' + INK + '" stroke-width="1.4"/>'; }); return s; }
  function grains(x, r, t, col) { var s = ""; for (var i = 0; i < 8; i++) { var p = (t * 1.1 + i / 8) % 1, d = i % 2 ? 1 : -1; s += '<circle cx="' + f(x + d * (r + p * 34)) + '" cy="' + f(GY - 6 - Math.sin(p * Math.PI) * 18) + '" r="2.4" fill="' + (col || "#6a4a2a") + '"/>'; } return s; }
  function handle(x, y, t, spin) { var w = 12 + 30 * Math.abs(Math.cos(t * (spin || 0))); return R(x - w, y - 4, 2 * w, 7, "#b07a4a", 1.6, 3) + R(x - w - 2, y - 5, 9, 9, "#2b2e33", 1.2, 3) + R(x + w - 7, y - 5, 9, 9, "#2b2e33", 1.2, 3) + R(x - 5, y - 6, 10, 11, "#8a929c", 1.4, 2); }
  function gear(x, y, r, a) { var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"><circle r="' + r + '" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/>'; for (var i = 0; i < 6; i++) s += '<rect x="-1.6" y="' + f(-r - 2.4) + '" width="3.2" height="4" fill="#f2c230" stroke="' + INK + '" stroke-width=".9" transform="rotate(' + (i * 60) + ')"/>'; return s + '<circle r="' + f(r * 0.3) + '" fill="#2b2e33"/></g>'; }
  // the engine and gearbox on top of the shaft at (x, y); o: eng, gear (pop-ins), run, spring (y gap), bar (handle spin)
  function motorHead(x, y, t, o) {
    o = o || {}; var j = o.run ? Math.sin(t * 40) * 0.6 : 0, s = "", gk = o.gear == null ? 1 : pop(o.gear), ek = o.eng == null ? 1 : pop(o.eng), i;
    if (gk > 0) s += '<g transform="translate(' + f(x) + ' ' + f(y - 9) + ') scale(' + f(gk) + ') translate(' + f(-x) + ' ' + f(-(y - 9)) + ')">' + R(x - 15, y - 18, 30, 18, "#5a6068", 1.8, 3) + gear(x - 5, y - 9, 6, o.run ? t * 300 : 0) + gear(x + 7, y - 9, 3.6, o.run ? -t * 500 : 0) + '</g>';
    if (ek > 0) { var w = o.bar != null ? 14 + 34 * Math.abs(Math.cos(t * o.bar)) : 46;
      s += '<g transform="translate(' + f(x + j) + ' ' + f(y - 32) + ') scale(' + f(ek) + ') translate(' + f(-x) + ' ' + f(-(y - 32)) + ')">' + '<path d="M' + f(x - w) + ' ' + (y - 24) + ' H' + f(x + w) + '" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M' + f(x - w) + ' ' + (y - 24) + ' H' + f(x + w) + '" stroke="#8a929c" stroke-width="3" stroke-linecap="round"/>' + R(x - w - 3, y - 29, 10, 10, "#2b2e33", 1.2, 3) + R(x + w - 7, y - 29, 10, 10, "#2b2e33", 1.2, 3);
      s += R(x - 17, y - 44, 34, 26, "#c23a26", 2, 4) + R(x - 11, y - 53, 22, 10, "#f4f1e8", 1.6, 3) + R(x - 3, y - 57, 6, 4, "#2b2e33", 1) + '<path d="M' + (x - 12) + ' ' + (y - 36) + ' h24 M' + (x - 12) + ' ' + (y - 31) + ' h24 M' + (x - 12) + ' ' + (y - 26) + ' h24" stroke="#8f2618" stroke-width="1.6"/>' + R(x + 17, y - 40, 9, 5, "#5a6068", 1.2, 1) + '</g>';
      if (o.run) for (i = 0; i < 4; i++) { var p = (t * 1.4 + i / 4) % 1; s += '<circle cx="' + f(x + 30 + p * 26) + '" cy="' + f(y - 40 - p * 22) + '" r="' + f(3 + p * 6) + '" fill="#e9eef2" opacity="' + f((1 - p) * 0.7) + '"/>'; } }
    return s;
  }
  function spring(x, y0, y1, k) { var n = 6, d = "M" + f(x) + " " + f(y0); for (var i = 0; i <= n * 2; i++) d += " L" + f(x + (i % 2 ? 9 : -9) * (i === 0 || i === n * 2 ? 0 : 1)) + " " + f(lerp(y0, y1, i / (n * 2))); return '<g opacity="' + f(clamp(k)) + '"><path d="' + d + '" stroke="' + INK + '" stroke-width="5.5" fill="none" stroke-linejoin="round"/><path d="' + d + '" stroke="#f2c230" stroke-width="2.6" fill="none" stroke-linejoin="round"/></g>'; }
  // a tracked excavator at x carrying the auger drive at (AX, hy)
  function excavator(x, t, hy) {
    var j = Math.sin(t * 30) * 0.5, s = "", bd = "M" + (x + 22) + " " + (GY - 50) + " L" + (x + 74) + " " + f(Math.min(GY - 110, hy - 46)) + " L" + AX + " " + f(hy - 18);
    s += '<path d="' + bd + '" stroke="' + INK + '" stroke-width="15" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + bd + '" stroke="#f2c230" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
    s += R(x - 58, GY - 16, 116, 16, "#2b2e33", 2, 8); for (var i = 0; i < 5; i++) s += '<circle cx="' + (x - 46 + i * 23) + '" cy="' + (GY - 8) + '" r="5" fill="#8a929c" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (x - 46 + i * 23) + ' ' + (GY - 8) + ' l' + f(Math.cos(t * 3 + i) * 4) + ' ' + f(Math.sin(t * 3 + i) * 4) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<g transform="translate(0 ' + f(j) + ')">' + R(x - 48, GY - 58, 86, 42, "#f2c230", 2.2, 5) + R(x - 2, GY - 54, 32, 24, "url(#gGlass)", 1.6, 3) + R(x - 44, GY - 50, 30, 20, "#b88a10", 1.4, 2) + '<path d="M' + (x - 40) + ' ' + (GY - 45) + ' h22 M' + (x - 40) + ' ' + (GY - 40) + ' h22 M' + (x - 40) + ' ' + (GY - 35) + ' h22" stroke="' + INK + '" stroke-width="1.2"/></g>';
    return s + R(AX - 12, hy - 22, 24, 22, "#c23a26", 2, 4) + '<circle cx="' + AX + '" cy="' + f(hy - 11) + '" r="5" fill="#f4f1e8" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + AX + ' ' + f(hy - 11) + ' l' + f(Math.cos(t * 8) * 5) + ' ' + f(Math.sin(t * 8) * 5) + '" stroke="' + INK + '" stroke-width="1.4"/>';
  }
  function hand(x, top, tip, t, o) { var p = { teeth: 1, pilot: 1, flTop: Math.max(top + 16, tip - 104) }; for (var k in (o || {})) p[k] = o[k]; return auger(x, top, tip, 13, t, p); }
  function big(top, tip, t, o) { var p = { teeth: 1, pilot: 1, pitch: 30 }; for (var k in (o || {})) p[k] = o[k]; return auger(AX, top, tip, 24, t, p); }
  function sparks(x, y, t, n, sp) { var s = ""; for (var i = 0; i < (n || 8); i++) { var p = (t * 3 + hash(i)) % 1, a = hash(i + 3) * 6.28; s += '<circle cx="' + f(x + Math.cos(a) * p * (sp || 22)) + '" cy="' + f(y + Math.sin(a) * p * (sp || 22) + p * p * 10) + '" r="' + f(2 * (1 - p) + 0.4) + '" fill="' + (i % 2 ? "#ffe46a" : "#fff") + '"/>'; } return s + '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(4 + 2 * Math.sin(t * 40)) + '" fill="#fff" filter="url(#glow)"/>'; }
  function phoneBio(x, y, t, k) { return '<g transform="translate(' + f(x) + ' ' + f(y + Math.sin(t * 3) * 4) + ') scale(' + f(k * 1.5) + ')">' + R(-20, -36, 40, 72, "#2b2e33", 2.4, 7) + R(-16, -30, 32, 56, "#fbfbf7", 1.2, 3) + '<circle cx="0" cy="-16" r="8" fill="#f2c230" stroke="' + INK + '" stroke-width="1.4"/><path d="M-10 0 H10 M-10 7 H6" stroke="#9aa2ac" stroke-width="2.4" stroke-linecap="round"/>' + R(-12, 13, 24, 9, "#2f6f9f", 1.2, 3) + '<circle cx="0" cy="17.5" r="' + f(9 + 5 * Math.abs(Math.sin(t * 5))) + '" fill="none" stroke="#f2c230" stroke-width="2"/></g>'; }
  function palm(x, y, s, t) { var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-4 0 Q2 -40 -2 -80 h7 Q8 -40 5 0 Z" fill="#8a6a3a" stroke="' + INK + '" stroke-width="1.6"/>'; for (var i = 0; i < 7; i++) { var a = -200 + i * 36 + Math.sin(t * 1.4 + i) * 4; g += '<path d="M0 -80 q24 -14 46 6 q-26 -6 -46 2 Z" fill="' + (i % 2 ? "#4a8a3a" : "#5aa04a") + '" stroke="' + INK + '" stroke-width="1.2" transform="rotate(' + f(a) + ' 0 -80)"/>'; } return g + '</g>'; }

  var TOP0 = 14, TIP0 = GY - 14;   // the tool lifted clear of the ground for the "add a part" shots
  // 0 — a big nail, hammered into the ground: is that an earth auger?
  shot(0, function (u, d) { var k = clamp(u / d); return [lerp(318, 328, k), lerp(100, 118, k), lerp(1.95, 1.6, k)]; }, function (u, d, t) {
    var n = Math.min(5, Math.floor(u / 0.7)), ph = (u / 0.7) % 1, dep = n * 7 + (n < 5 && ph < 0.12 ? 0 : 0), top = GY - 66 + dep, a = n >= 5 && ph > 0.5 ? 50 : 50 * (1 - ph * ph);
    var s = scene(t) + auger(AX, top, top + 96, 8, t, { helix: 0, head: 1, point: 1 }) + worker(AX + 58, t, { view: "side", flip: true });
    s += '<g transform="translate(' + (AX + 44) + ' ' + f(top - 6) + ') rotate(' + f(a) + ')"><path d="M0 0 H-40" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M0 0 H-40" stroke="#b07a4a" stroke-width="3.4" stroke-linecap="round"/>' + R(-54, -9, 16, 18, "#5a6068", 1.8, 2) + '</g>';
    if (u > 0.7 && ph < 0.16 && n <= 5) s += star(AX, top - 6, 13, t, "#fff");
    return s + qmark(262, 62, t, 36) + tag("بريمة حفر؟", 232, 112, u, 2.3, -3, 18);
  });
  // 1 — no: the nail only pushes the soil aside, brings none of it up, and jams after two hand-spans
  shot(1, function (u, d) { var k = clamp(u / d); return [lerp(325, 320, k), lerp(140, 180, k), lerp(1.35, 1.8, k)]; }, function (u, d, t) {
    var top = GY - 31 + Math.sin(t * 26) * (u > 3 ? 0.8 : 0), s = scene(t) + auger(AX, top, top + 96, 6, t, { helix: 0, head: 1, point: 1 });
    for (var i = 0; i < 4; i++) { var p = 0.5 + 0.5 * Math.sin(t * 5 + i), y = GY + 16 + i * 17; s += arrow(AX + 8, y, AX + 24 + p * 12, y, "#ff6a5a", 3, 1) + arrow(AX - 8, y, AX - 24 - p * 12, y, "#ff6a5a", 3, 1) + '<path d="M' + (AX + 44 + p * 6) + ' ' + (y - 7) + ' q6 7 0 14 M' + (AX - 44 - p * 6) + ' ' + (y - 7) + ' q-6 7 0 14" stroke="#5a3c20" stroke-width="2" fill="none"/>'; }
    s += worker(AX + 64, t, { sad: true });
    return s + tag("بيزق على الجنب", 205, 205, u, 0.9, -3, 17, "#f2a0a0") + tag("اتحشر!", 420, 245, u, 3.6, 3, 20, "#f2a0a0") + cross(250, 118, 0.42, (u - 4.4) / 1.2);
  });
  // 2 — so you wrap a steel strip around it in a spiral, like a screw thread
  shot(2, function (u, d) { var k = clamp(u / d); return [lerp(325, 320, k), lerp(95, 78, k), lerp(1.5, 1.75, k)]; }, function (u, d, t) {
    var hk = ease(clamp((u - 0.4) / 2.6)), wy = lerp(TIP0 - 2, TOP0 + 16, hk), s = scene(t) + auger(AX, TOP0, TIP0, 13, t, { helix: hk, head: 0.4, spin: 8 });
    if (hk > 0 && hk < 1) s += sparks(AX + 12, wy, t, 8, 18);
    return s + worker(430, t, {}) + tag("حلزونة", 235, 58, u, 1.2, -3, 22, "#ffe08a");
  });
  // 3 — as the auger turns, the soil rides up the spiral and comes out by itself
  shot(3, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(140, 172, k), lerp(1.3, 1.5, k)]; }, function (u, d, t) {
    var tip = lerp(GY + 14, GY + 70, clamp(u / d)), s = scene(t) + hole(AX, 13, tip) + spoil(AX, 13, u / d, t) + auger(AX, tip - 122, tip, 13, t, { head: 0.4, spin: 34, dirt: 1 }) + grains(AX, 13, t);
    s += arrow(AX - 34, GY + 56, AX - 34, GY + 8, "#f2c230", 4, clamp((u - 0.8) / 0.8)) + arrow(AX + 34, GY + 56, AX + 34, GY + 8, "#f2c230", 4, clamp((u - 0.8) / 0.8));
    return s + worker(440, t, {}) + tag("التراب بيطلع!", 190, 96, u, 1.0, -3, 20, "#bfe8c0");
  });
  // 4 — but the spiral only lifts loose soil: who loosens it in the first place?
  shot(4, function (u, d) { var k = clamp(u / d); return [lerp(320, 322, k), lerp(185, 212, k), lerp(1.6, 1.95, k)]; }, function (u, d, t) {
    var tip = HARD - 2 + Math.sin(t * 22) * 0.8, s = scene(t) + hole(AX, 13, tip) + spoil(AX, 13, 1, t) + auger(AX, tip - 122, tip, 13, t, { head: 0.4, spin: 46 });
    for (var i = 0; i < 3; i++) { var p = (t * 1.3 + i / 3) % 1; s += '<path d="M' + f(AX - 26 + i * 26) + ' ' + f(HARD + 4 + p * 4) + ' q5 4 10 0" stroke="#fff" stroke-width="1.6" fill="none" opacity="' + f(1 - p) + '"/>'; }
    return s + qmark(385, 205, t, 40) + tag("أرض ناشفة", 215, 262, u, 0.8, -3, 17, "#f2a0a0");
  });
  // 5 — so you weld hardened steel teeth on its end, cutting the ground like a knife
  shot(5, function (u, d) { var k = clamp(u / d); return [lerp(320, 322, k), lerp(112, 126, k), lerp(2.0, 2.7, k)]; }, function (u, d, t) {
    var s = scene(t) + auger(AX, TOP0, TIP0, 13, t, { head: 0.4, spin: u > 2.4 ? 14 : 0, teeth: (u - 0.6) / 1.2 });
    if (u > 0.5 && u < 2.0) s += sparks(AX + (Math.floor(u * 3) % 2 ? 9 : -9), TIP0, t, 9, 16);
    return s + tag("سنان متقسّية", 382, 112, u, 1.5, 3, 12, "#ffe08a");
  });
  // 6 — but as soon as it starts turning, the auger slips and wanders left and right
  shot(6, function (u, d) { var k = clamp(u / d); return [lerp(320, 320, k), lerp(105, 118, k), lerp(1.4, 1.6, k)]; }, function (u, d, t) {
    var dx = Math.sin(u * 4.2) * 30, s = scene(t);
    for (var i = 0; i < 6; i++) s += '<path d="M' + (AX - 34 + i * 12) + ' ' + (GY - 1) + ' q5 -5 10 0" stroke="#3a2a1c" stroke-width="1.6" fill="none"/>';
    s += '<g transform="translate(' + f(dx) + ' 0) rotate(' + f(Math.cos(u * 4.2) * 6) + ' ' + AX + ' ' + GY + ')">' + auger(AX, GY - 124, GY - 2, 13, t, { head: 0.4, spin: 40, teeth: 1 }) + '</g>';
    for (var j = 0; j < 4; j++) { var p = (t * 1.6 + j / 4) % 1; s += '<circle cx="' + f(AX + dx + (j % 2 ? 1 : -1) * p * 22) + '" cy="' + f(GY - 4 - p * 10) + '" r="' + f(3 + p * 4) + '" fill="#c9b08a" opacity="' + f((1 - p) * 0.8) + '"/>'; }
    return s + worker(450, t, { sad: true }) + tag("بتتزحلق!", 195, 58, u, 0.8, -4, 22, "#f2a0a0");
  });
  // 7 — so you fit a pointed tip in the centre: it bites into the ground first and holds the spot
  shot(7, function (u, d) { var k = clamp(u / d); return [lerp(322, 320, k), lerp(124, 138, k), lerp(2.5, 1.9, k)]; }, function (u, d, t) {
    var dn = ease(clamp((u - 2.3) / 0.9)), tip = lerp(TIP0, GY + 6, dn), s = scene(t) + hole(AX, 3, dn > 0.6 ? tip + 8 : GY) + auger(AX, tip - 122, tip, 13, t, { head: 0.4, spin: dn >= 1 ? 30 : 0, teeth: 1, pilot: (u - 0.5) / 1.2 });
    if (u > 0.5 && u < 1.4) s += sparks(AX, TIP0 + 4, t, 8, 14);
    if (dn >= 1) s += '<circle cx="' + AX + '" cy="' + GY + '" r="' + f(16 + 5 * Math.sin(t * 8)) + '" fill="none" stroke="#f2c230" stroke-width="2.4"/>';
    return s + tag("سن مدبب", 388, 112, u, 1.1, 3, 13, "#ffe08a") + check(250, 120, 0.36, (u - 3.3) / 1.2);
  });
  // 8 — but who is going to turn it?
  shot(8, function (u, d) { var k = clamp(u / d); return [lerp(315, 320, k), lerp(150, 148, k), lerp(1.0, 1.06, k)]; }, function (u, d, t) {
    return scene(t) + hole(AX + 110, 13, GY + 30) + hand(AX + 110, GY - 92, GY + 30, t, { head: 0.4 }) + face(190, 190, 1.25, t, {}) + qmark(330, 90, t, 70);
  });
  // 9 — so you weld a cross bar on top, hold it with both hands and turn
  shot(9, function (u, d) { var k = clamp(u / d); return [lerp(320, 332, k), lerp(64, 96, k), lerp(1.9, 1.4, k)]; }, function (u, d, t) {
    var go = u > 1.9, tip = GY + 30 + (go ? (u - 1.9) * 6 : 0), top = tip - 122, hk = pop((u - 0.5) / 1.2), s = scene(t) + hole(AX, 13, tip) + spoil(AX, 13, go ? 0.3 + (u - 1.9) * 0.1 : 0.3, t) + worker(AX + 30, t, { view: "side", flip: true, walk: go });
    s += hand(AX, top, tip, t, { spin: go ? 30 : 0, dirt: go });
    if (hk > 0) s += '<g transform="translate(' + AX + ' ' + f(top) + ') scale(' + f(hk) + ') translate(' + (-AX) + ' ' + f(-top) + ')">' + handle(AX, top, t, go ? 3 : 0) + '</g>';
    if (u > 0.5 && u < 1.4) s += sparks(AX, top + 4, t, 8, 16);
    return s + tag("دراع", 235, 30, u, 1.0, -3, 22, "#ffe08a");
  });
  // 10 — with this hand auger and extra rods you can reach ten metres down
  shot(10, function (u, d) { var k = ease(clamp(u / 4.2)), q = clamp(u / d); return [lerp(332, 370, k) + q * 14, lerp(110, 318, k) + q * 22, lerp(1.3, 0.62, k) * (1 + 0.1 * q)]; }, function (u, d, t) {
    var k = ease(clamp(u / 4.0)), tip = lerp(GY + 40, GY + 350, k), top = GY - 44, s = scene(t) + hole(AX, 13, tip) + spoil(AX, 13, 0.4 + 0.6 * k, t) + worker(AX + 6, t, { back: true, y: GY + 2 });
    s += hand(AX, top, tip, t, { spin: 34, dirt: 1 }) + handle(AX, top, t, 3);
    for (var y = tip - 110; y > GY - 20; y -= 62) s += R(AX - 5, y - 4, 10, 8, "#f2c230", 1.4, 2);
    for (var m = 0; m <= 10; m++) { var yy = GY + m * 35; s += '<path d="M430 ' + yy + ' h' + (m % 2 ? 10 : 18) + '" stroke="#fff" stroke-width="2.4"/>' + (m && m % 2 === 0 ? T(m + " م", 476, yy + 7, 18, "#fff") : ""); }
    s += '<path d="M430 ' + GY + ' V' + (GY + 350) + '" stroke="#fff" stroke-width="2.4"/>';
    for (var g = 0; g < 3; g++) { var gp = (t * 0.9 + g / 3) % 1; s += '<circle cx="' + AX + '" cy="' + f(tip) + '" r="' + f(20 + gp * 60) + '" fill="none" stroke="#f2c230" stroke-width="5" opacity="' + f(1 - gp) + '"/>'; }
    return s + tag("10 متر!", 200, 470, u, 3.3, -3, 44, "#ffe08a") + tag("وصلات", 215, 250, u, 1.2, 3, 30);
  });
  // 11 — and if you want to make videos like these, look at the bio
  shot(11, function (u, d) { var k = clamp(u / d); return [lerp(300, 292, k), lerp(125, 112, k), lerp(1.0, 1.06, k)]; }, function (u, d, t) {
    var s = scene(t) + hole(AX, 13, GY + 60) + spoil(AX, 13, 0.6, t) + hand(AX, GY - 62, GY + 60, t, { spin: 16, dirt: 1 }) + handle(AX, GY - 62, t, 1.5) + worker(430, t, { wave: true });
    return s + phoneBio(215, 36, t, pop((u - 0.3) / 1.2)) + arrow(150, 78, 182, 54, "#f2c230", 5, clamp((u - 1.0) * 2)) + tag("بص على البايو!", 118, 106, u, 0.8, -3, 21, "#ffe08a");
  });
  // 12 — but your arms get tired, and a wide hole needs far more force
  shot(12, function (u, d) { var k = clamp(u / d); return [lerp(318, 322, k), lerp(160, 168, k), lerp(1.0, 1.08, k)]; }, function (u, d, t) {
    var s = scene(t) + hole(AX + 120, 13, GY + 60) + hand(AX + 120, GY - 62, GY + 60, t, {}) + handle(AX + 120, GY - 62, t, 0);
    s += '<rect x="' + (AX + 120 - 46) + '" y="' + GY + '" width="92" height="150" fill="none" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" stroke-dashoffset="' + f(-t * 20) + '"/>' + arrow(AX + 120 + 16, GY + 100, AX + 120 + 44, GY + 100, "#f2c230", 3.4, 1) + arrow(AX + 120 - 16, GY + 100, AX + 120 - 44, GY + 100, "#f2c230", 3.4, 1);
    s += face(180, 200, 1.25, t, { sad: true });
    for (var i = 0; i < 4; i++) { var p = (t * 0.9 + i / 4) % 1; s += '<path d="M' + (112 + (i % 2) * 138) + ' ' + f(150 + i * 8 + p * 60) + ' q-5 8 0 12 q5 -4 0 -12 Z" fill="#8fd0f0" stroke="' + INK + '" stroke-width="1" opacity="' + f(1 - p) + '"/>'; }
    return s + tag("حفرة واسعة؟", 440, 96, u, 1.4, 3, 20, "#f2a0a0");
  });
  // 13 — so you mount an engine on top, with a gearbox that makes the turning slow but strong
  shot(13, function (u, d) { var k = clamp(u / d); return [lerp(320, 322, k), lerp(62, 84, k), lerp(2.0, 1.55, k)]; }, function (u, d, t) {
    var run = u > 3.2, tip = GY + 40 + (run ? (u - 3.2) * 8 : 0), top = tip - 110, s = scene(t) + hole(AX, 18, tip) + spoil(AX, 18, 0.4, t) + auger(AX, top, tip, 18, t, { teeth: 1, pilot: 1, spin: run ? 36 : 0, dirt: run });
    s += motorHead(AX, top, t, { eng: (u - 0.5) / 1.2, gear: (u - 2.2) / 1.2, run: run }) + (run ? grains(AX, 18, t) : "") + worker(AX - 96, t, {});
    return s + tag("موتور", 232, 28, u, 1.0, -3, 20, "#ffe08a") + tag("علبة تروس", 425, 70, u, 2.7, 3, 15);
  });
  // 14 — but if the auger hits a stone, it is the engine that spins you around
  shot(14, function (u, d) { var k = clamp(u / d); return [lerp(322, 318, k), lerp(120, 135, k), lerp(1.3, 1.5, k)]; }, function (u, d, t) {
    var tip = GY + 60, top = tip - 110, a = u * 7, wx = AX + Math.cos(a) * 52, front = Math.sin(a) > 0, w = worker(wx, t, { y: GY - 8 + Math.sin(a * 2) * 3, flip: Math.cos(a) < 0, view: "side", look: "up" });
    var s = scene(t) + hole(AX, 18, tip) + '<path d="M' + (AX - 30) + ' ' + (tip + 2) + ' q10 -18 34 -12 q26 2 30 20 q-8 18 -34 16 q-28 -2 -30 -24 Z" fill="#8a8478" stroke="' + INK + '" stroke-width="2"/>' + (front ? "" : w) + spoil(AX, 18, 0.5, t);
    s += auger(AX, top, tip, 18, t, { teeth: 1, pilot: 1 }) + motorHead(AX, top, t, { run: true, bar: 7 }) + (front ? w : "") + star(AX + 4, tip + 2, 11 + 4 * Math.sin(t * 20), t, "#fff");
    for (var i = 0; i < 3; i++) s += star(wx + Math.cos(t * 5 + i * 2.1) * 16, GY - 84 + Math.sin(t * 5 + i * 2.1) * 6, 4, t, "#ffe46a");
    return s + tag("هيلف بيك!", 455, 52, u, 0.7, 3, 22, "#f2a0a0") + cross(200, 100, 0.45, (u - 2.2) / 1.2);
  });
  // 15 — so a spring soaks up the jolt, and the big auger goes on an excavator, not in your hands
  shot(15, function (u, d) { if (u < 2.6) { var k = clamp(u / 2.6); return [lerp(320, 322, k), lerp(72, 78, k), lerp(2.3, 2.0, k)]; } var q = clamp((u - 2.6) / (d - 2.6)); return [lerp(290, 300, q), lerp(120, 135, q), lerp(1.05, 0.95, q)]; }, function (u, d, t) {
    var s = scene(t), tip, top;
    if (u < 2.6) { tip = GY + 60; var sq = 14 + 5 * Math.sin(t * 9) * (u > 1.2 ? 1 : 0); top = tip - 110;
      return s + hole(AX, 18, tip) + auger(AX, top, tip, 18, t, { teeth: 1, pilot: 1, spin: 30, dirt: 1 }) + spring(AX, top - sq, top + 2, (u - 0.4) / 0.5) + motorHead(AX, top - sq, t, { run: true }) + tag("ياي", 392, 78, u, 0.8, 3, 15, "#ffe08a"); }
    tip = GY + 40 + (u - 2.6) * 16; top = tip - 150;
    return s + hole(AX, 24, tip) + spoil(AX, 24, 0.5 + (u - 2.6) * 0.15, t) + excavator(170, t, top) + big(top, tip, t, { spin: 44, dirt: 1 }) + grains(AX, 24, t) + worker(470, t, {}) + tag("على حفّار", 460, 40, u, 3.2, 3, 24, "#ffe08a");
  });
  // 16 — but in sand and wet ground the hole caves in as soon as the auger comes out
  shot(16, function (u, d) { var k = clamp(u / d); return [lerp(315, 322, k), lerp(170, 200, k), lerp(1.15, 1.4, k)]; }, function (u, d, t) {
    var up = ease(clamp(u / 1.2)), tip = lerp(GY + 130, GY - 16, up), top = tip - 150, c = clamp((u - 1.0) / 2.6), s = scene(t, { sand: true }) + hole(AX, 24, GY + 134, "#4a3a22");
    s += '<rect x="' + (AX - 26) + '" y="' + (GY + 112) + '" width="52" height="22" fill="#5aa0c8" opacity=".8"/>';
    s += '<path d="M' + (AX - 26) + ' ' + GY + ' L' + f(AX - 26 + 30 * c) + ' ' + f(GY + 134 - 100 * c) + ' L' + f(AX + 26 - 30 * c) + ' ' + f(GY + 134 - 100 * c) + ' L' + (AX + 26) + ' ' + GY + ' L' + (AX + 26) + ' ' + (GY + 136) + ' H' + (AX - 26) + ' Z" fill="#d9b46a" stroke="#8a6a30" stroke-width="1.4"/>';
    for (var i = 0; i < 14; i++) { var p = (t * 1.1 + hash(i)) % 1, dd = i % 2 ? 1 : -1; s += '<circle cx="' + f(AX + dd * (24 - p * 14)) + '" cy="' + f(GY + 8 + hash(i + 2) * 40 + p * 60) + '" r="2.2" fill="#b89a5a" opacity="' + f(c > 0 ? 1 : 0) + '"/>'; }
    s += excavator(170, t, top) + big(top, tip, t, { spin: 10, dirt: 1, dirtCol: "#b89a5a" });
    return s + tag("رمل ومية", 190, 232, u, 0.6, -3, 20) + tag("الحفرة بتقع!", 470, 215, u, 1.8, 3, 21, "#f2a0a0") + cross(440, 290, 0.5, (u - 3.0) / 1.2);
  });
  // 17 — so the core of the auger is made as an open pipe
  shot(17, function (u, d) { var k = clamp(u / d); return [lerp(320, 322, k), lerp(56, 70, k), lerp(1.9, 2.25, k)]; }, function (u, d, t) {
    var s = scene(t, { sand: true }) + excavator(170, t, -20) + big(-20, GY - 16, t, { hollow: 1, spin: 8 });
    s += flowD("M" + AX + " -16 V" + (GY - 18), t, "#f2c230", 2.4, 50);
    return s + tag("ماسورة مفتوحة", 396, 44, u, 0.5, 3, 13, "#ffe08a");
  });
  // 18 — and as you pull it up, you pump concrete through it to fill the hole behind it
  shot(18, function (u, d) { var k = clamp(u / d); return [lerp(335, 345, k), lerp(150, 172, k), lerp(1.0, 1.15, k)]; }, function (u, d, t) {
    var tip = lerp(GY + 130, GY + 44, clamp(u / d)), top = tip - 150, s = scene(t, { sand: true }) + hole(AX, 24, GY + 134, "#4a3a22") + '<rect x="' + (AX - 26) + '" y="' + f(tip) + '" width="52" height="' + f(GY + 136 - tip) + '" fill="' + CONC + '" stroke="' + INK + '" stroke-width="1.6"/>';
    for (var i = 0; i < 12; i++) s += '<circle cx="' + f(AX - 20 + hash(i) * 40) + '" cy="' + f(tip + 8 + hash(i + 3) * Math.max(1, GY + 124 - tip)) + '" r="1.8" fill="#8a867c"/>';
    var hd = "M560 " + (GY - 34) + " Q470 " + f(top - 90) + " " + (AX + 12) + " " + f(top - 12);
    s += excavator(170, t, top) + big(top, tip, t, { hollow: 1, conc: 1, spin: 14 }) + tube(hd, 6, "#3a3f46") + flowD(hd, t, CONC, 3, 70);
    s += R(540, GY - 46, 70, 44, "#f4f1e8", 2.2, 5) + '<g transform="translate(575 ' + (GY - 62) + ') rotate(' + f(t * 60) + ')"><ellipse rx="26" ry="15" fill="#c23a26" stroke="' + INK + '" stroke-width="2"/><path d="M-26 0 H26 M0 -15 V15" stroke="#f4f1e8" stroke-width="3"/></g>' + '<circle cx="556" cy="' + (GY - 2) + '" r="8" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.6"/><circle cx="596" cy="' + (GY - 2) + '" r="8" fill="#2a2a2a" stroke="' + INK + '" stroke-width="1.6"/>';
    return s + arrow(AX + 50, GY + 60, AX + 50, GY + 20, "#f2c230", 4, clamp((u - 0.6) / 0.8)) + tag("خرسانة", 470, 250, u, 1.0, 3, 24, "#e9e4d8");
  });
  // 19 — this is how the piles under buildings and bridges are made, down to thirty metres
  shot(19, function (u, d) { var k = ease(clamp(u / d)); return [lerp(330, 335, k), lerp(140, 215, k), lerp(1.15, 0.78, k)]; }, function (u, d, t) {
    var s = scene(t), i;
    for (i = 0; i < 5; i++) { var pk = ease(clamp((u - 0.4 - i * 0.45) / 1.2)), x = 236 + i * 42; if (pk > 0) { s += '<rect x="' + (x - 8) + '" y="' + GY + '" width="16" height="' + f(210 * pk) + '" fill="' + CONC + '" stroke="' + INK + '" stroke-width="2"/>'; for (var q = 0; q < 6; q++) s += '<circle cx="' + f(x - 5 + hash(q + i) * 10) + '" cy="' + f(GY + 10 + q * 34 * pk) + '" r="1.6" fill="#8a867c"/>'; } }
    s += R(206, GY - 12, 228, 12, CONC, 2) + R(216, GY - 150, 208, 138, "#e9d8b8", 2.4) + R(210, GY - 158, 220, 10, "#b07a4a", 2);
    for (i = 0; i < 20; i++) { var on = hash(i + Math.floor(t * 0.6 + hash(i) * 4)) > 0.5; s += R(230 + (i % 5) * 38, GY - 140 + Math.floor(i / 5) * 32, 24, 20, on ? "#ffe9a0" : "#7fa9c8", 1.4); }
    var ak = clamp((u - 2.6) / 0.8); s += arrow(480, GY + 105, 480, GY + 6, "#f2c230", 5, ak) + arrow(480, GY + 105, 480, GY + 206, "#f2c230", 5, ak);
    return s + tag("خوازيق", 120, 250, u, 1.0, -3, 30) + tag("30 متر!", 580, 260, u, 3.0, 3, 36, "#ffe08a");
  });
  // 20 — many people think this spiral is a new invention
  shot(20, function (u, d) { var k = clamp(u / d); return [lerp(322, 318, k), lerp(92, 84, k), lerp(1.5, 1.7, k)]; }, function (u, d, t) {
    var s = scene(t) + hand(AX, TOP0, TIP0, t, { spin: 16, flTop: TOP0 + 16 }) + handle(AX, TOP0, t, 1.2) + worker(425, t, {});
    var k = pop((u - 0.6) / 1.2); if (k > 0) s += '<g transform="translate(232 62) scale(' + f(k) + ') rotate(' + f(-10 + Math.sin(t * 3) * 4) + ')">' + star(0, 0, 34, t * 0.2, "#ffe46a") + T("جديد؟", 0, 7, 17, "#c23a26") + '</g>';
    return s + qmark(385, 52, t, 40);
  });
  // 21 — the truth: it is the same idea as the tanbur that Egyptian farmers have used to lift Nile water for over two thousand years
  shot(21, function (u, d) { var k = clamp(u / d); return [lerp(300, 325, k), lerp(238, 222, k), lerp(1.2, 1.42, k)]; }, function (u, d, t) {
    var s = sky("dusk") + sun(150, 150, 26, "#ffd27a") + clouds(t, 10, 60, 4, 0.7), i, w = "M-400 292";
    for (i = 0; i < 6; i++) s += palm(-40 + i * 46 + hash(i) * 20, 262, 0.45, t);
    s += '<path d="M-400 262 H260 V300 H-400 Z" fill="#6f9548"/>';
    for (var x = -400; x <= 420; x += 20) w += " L" + x + " " + f(292 + Math.sin(x * 0.05 + t * 2) * 2.2); s += '<path d="' + w + ' V600 H-400 Z" fill="#3f8fc0"/>';
    for (i = 0; i < 9; i++) { var rx = ((hash(i) * 600 + t * 22) % 600) - 300; s += '<path d="M' + f(rx) + ' ' + f(306 + hash(i + 2) * 50) + ' h' + f(14 + hash(i + 3) * 18) + '" stroke="#bfe0f2" stroke-width="2" opacity=".7" stroke-linecap="round"/>'; }
    s += '<path d="M1040 196 H400 L250 312 V600 H1040 Z" fill="#b08a5a" stroke="' + INK + '" stroke-width="2"/><path d="M1040 196 H400" stroke="#6f9548" stroke-width="8"/>';
    for (i = 0; i < 9; i++) s += '<path d="M' + (470 + i * 26) + ' 192 q4 -12 8 0" stroke="#4a8a3a" stroke-width="3" fill="none"/>';
    s += '<path d="M412 196 h36 v10 h-36 Z" fill="#3f8fc0" stroke="' + INK + '" stroke-width="1.4"/>' + flowD("M448 201 H640", t, "#8fc3e6", 3, 40);
    s += '<g transform="translate(262 322) rotate(-38)">' + '<rect x="-6" y="-21" width="212" height="42" rx="6" fill="#8a5a2a" stroke="' + INK + '" stroke-width="2.4"/><rect x="0" y="-16" width="200" height="32" fill="#2f4f66"/>' + '<g transform="rotate(-90)">' + auger(0, 0, 200, 15, t, { flTop: 2, spin: 30, dirt: 1, dirtCol: "#8fd0f0", pitch: 22 }) + '</g>';
    for (i = 0; i < 5; i++) s += '<path d="M' + (i * 50) + ' -21 v42" stroke="#5a3a1a" stroke-width="3"/>';
    s += '<path d="M206 0 h16 v-14" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M206 0 h16 v' + f(-14 * Math.cos(t * 5)) + '" stroke="#b07a4a" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>';
    for (i = 0; i < 4; i++) { var p = (t * 1.5 + i / 4) % 1; s += '<circle cx="' + f(418 + p * 10) + '" cy="' + f(190 + p * 10) + '" r="2.6" fill="#8fd0f0"/>'; }
    s += HC.person(470, 196, 0.85, t, { top: "#e9e4d8", pants: "#e9e4d8", view: "side", flip: true, cap: "#f4f1e8" });
    return s + tag("الطنبور", 250, 150, u, 1.2, -3, 26, "#ffe08a") + tag("+2000 سنة", 470, 300, u, 3.6, 3, 22);
  });
  // 22 — add rods to make it longer, teeth you swap when they wear down, and grease on the gears
  shot(22, function (u, d) { var k = clamp(u / d); return [lerp(315, 325, k), lerp(105, 112, k), lerp(1.15, 1.25, k)]; }, function (u, d, t) {
    var s = scene(t) + R(150, GY - 46, 340, 10, "#b07a4a", 2, 3) + R(166, GY - 36, 10, 36, "#8a5a2a", 1.6) + R(464, GY - 36, 10, 36, "#8a5a2a", 1.6), k1 = pop((u - 0.3) / 1.2), k2 = pop((u - 1.6) / 1.2), k3 = pop((u - 2.9) / 1.2), b = Math.sin(t * 3) * 2;
    if (k1 > 0) s += '<g transform="translate(215 ' + f(GY - 48 + b) + ') scale(' + f(k1 * 1.2) + ')">' + R(-4, -70, 8, 70, "#9aa2ac", 1.6, 1) + R(-6, -74, 12, 9, "#f2c230", 1.4, 2) + R(-6, -8, 12, 9, "#f2c230", 1.4, 2) + R(10, -62, 8, 62, "#9aa2ac", 1.6, 1) + R(8, -66, 12, 9, "#f2c230", 1.4, 2) + '</g>';
    if (k2 > 0) s += '<g transform="translate(320 ' + f(GY - 48 - b) + ') scale(' + f(k2 * 1.5) + ')">' + [-22, 0, 22].map(function (x, i) { return '<path d="M' + (x - 9) + ' -22 H' + (x + 9) + ' L' + (x + 4) + ' -2 Z" fill="#e2b035" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round" transform="rotate(' + f(Math.sin(t * 2 + i) * 6) + ' ' + x + ' -12)"/>'; }).join("") + '</g>';
    if (k3 > 0) s += '<g transform="translate(425 ' + f(GY - 48 + b) + ') scale(' + f(k3 * 1.4) + ')">' + R(-14, -34, 28, 34, "#2f6f9f", 2, 4) + R(-10, -42, 20, 9, "#f2c230", 1.6, 2) + '<path d="M0 -42 q14 -18 26 -6" stroke="' + INK + '" stroke-width="3" fill="none"/>' + '<circle cx="' + f(27) + '" cy="' + f(-44 + ((t * 30) % 22)) + '" r="3" fill="#e2b035" stroke="' + INK + '" stroke-width="1"/></g>';
    return s + tag("وصلات", 200, -14, u, 0.5, -3, 20) + tag("سنان غيار", 322, 34, u, 1.8, 3, 18, "#ffe08a") + tag("شحم", 445, 8, u, 3.1, 3, 20);
  });
  // 23 — congratulations: you have built an earth auger
  function whole(t, sk) {
    var tip = GY + 96 + Math.sin(t * 0.8) * 10, top = tip - 150, s = scene(t, { sky: sk }) + hole(AX, 24, tip) + spoil(AX, 24, 1, t) + excavator(170, t, top) + big(top, tip, t, { spin: 44, dirt: 1 }) + grains(AX, 24, t);
    return s + hole(470, 13, GY + 60) + spoil(470, 13, 0.5, t) + hand(470, GY - 62, GY + 60, t, { spin: 20, dirt: 1 }) + handle(470, GY - 62, t, 2) + worker(545, t, { wave: true }) + worker(410, t, { cap: "#f4f1e8", top: "#2f6f9f", ph: 2 });
  }
  shot(23, function (u, d) { var k = ease(clamp(u / d)); return [lerp(340, 350, k), lerp(130, 150, k), lerp(1.25, 0.95, k)]; }, function (u, d, t) {
    return whole(t, "day") + confetti(t, 60, 640, -60, GY) + tag("مبروك!", 440, 14, u, 0.3, 3, 34, "#bfe8c0");
  });
  // 24 — outro
  shot(24, function (u, d) { var k = clamp(u / d); return [lerp(350, 330, k), lerp(150, 140, k), lerp(0.95, 1.05, k)]; }, function (u, d, t) {
    return whole(t, "dusk") + tag("قولولنا!", 440, 14, u, 0.4, 3, 32);
  });

  SH.sort(function (x, y) { return x.a - y.a; });
  window.__parts = { scene: scene, auger: auger, hand: hand, big: big, hole: hole, spoil: spoil, handle: handle, motorHead: motorHead, excavator: excavator, worker: worker, face: face, HC: HC, tag: tag, T: T, GY: GY, AX: AX };
  window.__panel = function (svg, t) {
    AN = 0; var i = at(t), sh = SH[i], next = i + 1 < SH.length ? SH[i + 1].a : L(LN.length), u = t - sh.a, d = Math.max(0.5, next - sh.a);
    var c = sh.cam(u, d), cx = c[0] + 16 * Math.sin(t * 1.2), cy = c[1] + 12 * Math.cos(t * 1.2), z = c[2] * (1 + 0.03 * Math.sin(t * 1.1));
    svg.innerHTML = '<g transform="translate(320 180) rotate(' + f(0.9 * Math.sin(t * 0.83)) + ') scale(' + z.toFixed(4) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')">' + sh.draw(u, d, t) + '</g><rect width="640" height="360" filter="url(#grain)"/>';
    return i;
  };
})();
