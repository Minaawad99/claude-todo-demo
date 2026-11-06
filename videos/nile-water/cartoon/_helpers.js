(function () {
  // «المية من النيل لحنفيتك» — the reference look: full-bleed flat illustrations with bold white outlines,
  // saturated blue water, sand grains as big yellow cells, orange clumps, a navy caption block and a progress track on top.
  // Every frame is redrawn; the camera never stops and something in every shot is always moving.
  var LN = window.TIMING.lines;
  var INK = "#ffffff", OUT = "#ffffff", BLUE = "#2a8fc0", DEEP = "#15607f", ORANGE = "#ff8c1a", YEL = "#ffd166", BROWN = "#7a4f2a", GREEN = "#7bd389", PINK = "#ff7aa2", NAVY = "#0d1a33";
  var W = 360, H = 436;
  function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function pop(u) { if (u <= 0) return 0; var k = clamp(u / 0.4); return k < 1 ? 1.12 * ease(k) : 1; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return Math.round(n * 10) / 10; }
  function pts(p) { return p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" "); }

  // a bold white outline, drawn on everything
  function sun(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2) + '" fill="#fff3c4" opacity=".35" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#ffd166" stroke="#fff" stroke-width="3"/>'; }
  function clouds(t, sp, y, n) {
    var s = ""; for (var i = 0; i < n; i++) { var x = ((t * sp + i * 130 + hash(i) * 80) % 520) - 90; s += '<g transform="translate(' + f(x) + ' ' + f(y + i * 9 % 30) + ')" opacity=".92"><ellipse cx="0" cy="0" rx="34" ry="13" fill="#fff"/><ellipse cx="-14" cy="-6" rx="16" ry="11" fill="#fff"/><ellipse cx="10" cy="-8" rx="18" ry="13" fill="#fff"/></g>'; }
    return s;
  }
  function sky(kind, t) {
    var g = kind === "dusk" ? "url(#skyDusk)" : kind === "night" ? "url(#skyNight)" : "url(#skyDay)";
    return '<rect x="-60" y="-60" width="480" height="560" fill="' + g + '"/>' + clouds(t, 10, 40, 3);
  }
  function bubbles(t, x, y, n, sp, spread, r0) {
    var s = ""; for (var i = 0; i < n; i++) { var u = (t * sp + i / n) % 1, bx = x + (hash(i) - 0.5) * spread + Math.sin(u * 6 + i) * 6, by = y - u * 220; s += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f((r0 || 3) + hash(i + 3) * 4) + '" fill="none" stroke="#fff" stroke-width="2" opacity="' + f(0.9 - u * 0.7) + '"/>'; }
    return s;
  }
  // water from y down, with moving light stripes and rising bubbles
  function water(t, y, o) {
    o = o || {}; var s = '<rect x="-60" y="' + f(y) + '" width="480" height="' + f(H + 80 - y) + '" fill="' + (o.muddy ? "url(#mudG)" : "url(#waterG)") + '"/>';
    if (!o.muddy) for (var i = 0; i < 5; i++) { var x = ((i * 90 - t * 14) % 480 + 480) % 480 - 60; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + 36) + ' ' + f(y) + ' L' + f(x + 110) + ' ' + f(H) + ' L' + f(x + 74) + ' ' + f(H) + ' Z" fill="#fff" opacity=".08"/>'; }
    var d = "M-60 " + f(y); for (var q = -60; q <= 420; q += 20) d += " L" + q + " " + f(y + Math.sin(q * 0.05 + t * 2.4) * 4 + Math.sin(q * 0.13 - t * 3) * 2);
    s += '<path d="' + d + ' V' + f(y + 10) + ' H-60 Z" fill="' + (o.muddy ? "#b98a5c" : "#7fd3f5") + '" opacity=".7"/><path d="' + d + '" stroke="#fff" stroke-width="2.5" fill="none"/>';
    return s;
  }
  function soil(t, y, o) {
    o = o || {}; var s = '<rect x="-60" y="' + f(y) + '" width="480" height="' + f(H + 80 - y) + '" fill="url(#soilG)"/>';
    for (var k = 1; k < 5; k++) s += '<path d="M-60 ' + f(y + k * 40 + Math.sin(k) * 6) + ' Q90 ' + f(y + k * 40 + 10) + ' 180 ' + f(y + k * 40 + 2) + ' T420 ' + f(y + k * 40 + 4) + '" stroke="#4e3420" stroke-width="3" fill="none" opacity=".6"/>';
    for (var i = 0; i < 14; i++) s += '<ellipse cx="' + f(hash(i) * 380 - 10) + '" cy="' + f(y + 20 + hash(i + 5) * (H - y - 30)) + '" rx="' + f(4 + hash(i + 8) * 9) + '" ry="' + f(3 + hash(i + 2) * 6) + '" fill="#5b3f25" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>';
    return s;
  }
  function grass(y) { var s = '<rect x="-60" y="' + f(y) + '" width="480" height="30" fill="url(#grassG)"/>'; for (var i = 0; i < 14; i++) s += '<ellipse cx="' + f(i * 30 - 10) + '" cy="' + f(y) + '" rx="22" ry="8" fill="#5fb866" stroke="#fff" stroke-width="2"/>'; return s; }
  // sand grains as big yellow cells (the reference's signature), gravel as grey circles
  function sand(x, y, w, h, n, seed) {
    var s = ""; for (var i = 0; i < n; i++) { var cx = x + hash(i + seed) * w, cy = y + hash(i + seed + 40) * h, r = 9 + hash(i + seed + 7) * 5, col = ["#ffb938", "#ffd166", "#f5a524"][i % 3], p = []; for (var k = 0; k < 7; k++) { var a = k / 7 * 6.283 + hash(i + k) * 0.3; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]); } s += '<polygon points="' + pts(p) + '" fill="' + col + '" stroke="#fff" stroke-width="2"/><ellipse cx="' + f(cx - r * 0.2) + '" cy="' + f(cy - r * 0.3) + '" rx="' + f(r * 0.45) + '" ry="' + f(r * 0.22) + '" fill="#fff" opacity=".45"/>'; }
    return s;
  }
  function gravel(x, y, w, h, n, seed) { var s = ""; for (var i = 0; i < n; i++) { var cx = x + hash(i + seed) * w, cy = y + hash(i + seed + 9) * h; s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(7 + hash(i + seed + 3) * 3) + '" fill="#b8c2cc" stroke="#fff" stroke-width="2"/>'; } return s; }
  // orange clumps (the flocs from the alum)
  function floc(x, y, r, n, seed, grow) {
    var s = ""; for (var i = 0; i < n; i++) { var a = hash(i + seed) * 6.283, rr = r * hash(i + seed + 4) * grow, cx = x + Math.cos(a) * rr, cy = y + Math.sin(a) * rr, p = []; for (var k = 0; k < 8; k++) { var b = k / 8 * 6.283; p.push([cx + Math.cos(b) * 7, cy + Math.sin(b) * 7]); } s += '<polygon points="' + pts(p) + '" fill="' + ORANGE + '" stroke="#fff" stroke-width="2"/>'; }
    return s;
  }
  function microbe(x, y, s, t, col, seed) {
    var wob = Math.sin(t * 3 + (seed || 0)) * 1.5; return '<g transform="translate(' + f(x) + ' ' + f(y + wob) + ') scale(' + f(s) + ')"><path d="M-14 0 Q-14 -13 0 -13 Q14 -13 14 0 Q14 13 0 13 Q-14 13 -14 0Z" fill="' + (col || PINK) + '" stroke="#fff" stroke-width="2.4"/><circle cx="-5" cy="-3" r="2.6" fill="#1b1b1b"/><circle cx="5" cy="-3" r="2.6" fill="#1b1b1b"/><path d="M-4 4 Q0 7 4 4" stroke="#1b1b1b" stroke-width="2" fill="none" stroke-linecap="round"/></g>';
  }
  function pipe(p, w) {
    var d = "M" + p.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L");
    return '<path d="' + d + '" stroke="#fff" stroke-width="' + (w + 6) + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" stroke="url(#steelG)" stroke-width="' + w + '" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function along(p, s) {
    var tot = 0, i; for (i = 1; i < p.length; i++) tot += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    var want = clamp(s) * tot, acc = 0;
    for (i = 1; i < p.length; i++) { var sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + sl >= want) { var k = sl ? (want - acc) / sl : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k]; } acc += sl; }
    return p[p.length - 1];
  }
  function flow(t, p, col, n, sp, r) {
    var s = ""; for (var i = 0; i < n; i++) { var q = along(p, (t * sp + i / n) % 1); s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + (r || 4) + '" fill="' + (col || "#fff") + '" stroke="#fff" stroke-width="1.2"/>'; }
    return s;
  }
  function tank(x, y, w, h, level, t, o) {
    o = o || {}; var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="url(#concG)" stroke="#fff" stroke-width="4"/>';
    var ly = y + h * (1 - level), inner = o.muddy ? "url(#mudG)" : "url(#waterG)";
    s += '<rect x="' + (x + 6) + '" y="' + f(ly) + '" width="' + (w - 12) + '" height="' + f(y + h - ly - 6) + '" fill="' + inner + '"/>';
    var d = "M" + (x + 6) + " " + f(ly); for (var q = 0; q <= (w - 12); q += 12) d += " L" + f(x + 6 + q) + " " + f(ly + Math.sin(q * 0.2 + t * 3) * 3);
    s += '<path d="' + d + '" stroke="#fff" stroke-width="2.5" fill="none"/>';
    return s;
  }
  function pump(x, y, r, t) {
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#steelG)" stroke="#fff" stroke-width="4"/><g transform="translate(' + x + ' ' + y + ') rotate(' + f(t * 260) + ')">';
    for (var k = 0; k < 6; k++) { var a = k * 60 * Math.PI / 180; s += '<path d="M0 0 L' + f(Math.cos(a) * (r - 6)) + ' ' + f(Math.sin(a) * (r - 6)) + '" stroke="#1d3c52" stroke-width="7" stroke-linecap="round"/>'; }
    return s + '</g><circle cx="' + x + '" cy="' + y + '" r="5" fill="#1d3c52"/>';
  }
  function gauge(x, y, r, v, label) {
    var a0 = -Math.PI * 0.75, a1 = a0 + Math.PI * 1.5 * clamp(v), R = r - 8;
    var arc = function (from, to) { return 'M' + f(x + Math.cos(from) * R) + ' ' + f(y + Math.sin(from) * R) + ' A' + R + ' ' + R + ' 0 ' + (to - from > Math.PI ? 1 : 0) + ' 1 ' + f(x + Math.cos(to) * R) + ' ' + f(y + Math.sin(to) * R); };
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#0d1a33" stroke="#fff" stroke-width="4"/>';
    s += '<path d="' + arc(a0, a0 + Math.PI * 1.5) + '" stroke="#24476b" stroke-width="10" fill="none" stroke-linecap="round"/>';
    if (v > 0) s += '<path d="' + arc(a0, a1) + '" stroke="' + ORANGE + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    if (label) s += '<text x="' + x + '" y="' + f(y + r * 0.45) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="' + f(r * 0.4) + '" fill="#fff">' + label + '</text>';
    return s;
  }
  // big outlined word
  function big(text, x, y, sz, col) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="' + sz + '" fill="' + (col || ORANGE) + '" stroke="#0d1a33" stroke-width="' + f(sz / 7) + '" paint-order="stroke" stroke-linejoin="round">' + text + '</text>'; }
  // a pill label that pops in, like the reference's tags
  function tag(text, x, y, u, u0, size, col) {
    var k = pop((u - u0) / 1.0); if (k <= 0) return ""; size = size || 20; var w = text.length * size * 0.56 + 26;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-size * 0.95) + '" width="' + f(w) + '" height="' + f(size * 1.5) + '" rx="' + f(size * 0.75) + '" fill="' + (col || "#0d1a33") + '" stroke="#fff" stroke-width="2.5"/><text x="0" y="' + f(size * 0.2) + '" text-anchor="middle" font-family="Noto Sans Arabic" font-weight="900" font-size="' + size + '" fill="#fff">' + text + '</text></g>';
  }
  function spark(x, y, t, col) { var k = 0.5 + 0.5 * Math.sin(t * 6 + x); return '<path d="M' + f(x) + ' ' + f(y - 8 * k) + ' L' + f(x + 2) + ' ' + f(y - 2) + ' L' + f(x + 8 * k) + ' ' + f(y) + ' L' + f(x + 2) + ' ' + f(y + 2) + ' L' + f(x) + ' ' + f(y + 8 * k) + ' L' + f(x - 2) + ' ' + f(y + 2) + ' L' + f(x - 8 * k) + ' ' + f(y) + ' L' + f(x - 2) + ' ' + f(y - 2) + ' Z" fill="' + (col || "#fff") + '" stroke="#fff" stroke-width="1"/>'; }

  window.__kit = { W: W, H: H, L: L, LN: LN, clamp: clamp, lerp: lerp, ease: ease, pop: pop, hash: hash, f: f, pts: pts, sun: sun, clouds: clouds, sky: sky, bubbles: bubbles, water: water, soil: soil, grass: grass, sand: sand, gravel: gravel, floc: floc, microbe: microbe, pipe: pipe, along: along, flow: flow, tank: tank, pump: pump, gauge: gauge, big: big, tag: tag, spark: spark, INK: INK, ORANGE: ORANGE, YEL: YEL, NAVY: NAVY, BLUE: BLUE, PINK: PINK, GREEN: GREEN, BROWN: BROWN };
