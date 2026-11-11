/* «ابنيها بنفسك» — المفاعل النووي (a pressurised-water reactor like those being built at El Dabaa). Flat side view in the
   hand of the reference video the user sent (hazy desert sky, brown soil band, thick rounded grey outlines, flat colours,
   flow as green dashes in light pipes, the camera travelling along the plant as it grows). Our own drawings and words.
   World: px, ground line GY; the plant runs left → right: reactor in its pit, steam generator, turbine, generator, pylon, sea. */
(function () {
  var LN = window.TIMING.lines;
  function L(i) { return i >= LN.length ? window.TIMING.duration : LN[i].start; }
  function E(i) { return i >= LN.length ? window.TIMING.duration : LN[i].end; }
  function W(i, w) { var ws = LN[i].text.split(" "), tot = ws.join("").length, acc = 0; for (var k = 0; k < ws.length; k++) { if (ws[k].indexOf(w) === 0) return L(i) + (E(i) - L(i)) * acc / tot; acc += ws[k].length; } throw new Error("word " + i + " " + w); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function pop(u) { if (u <= 0) return 0; if (u < 0.18) return 1.18 * ease(u / 0.18); if (u < 0.32) return lerp(1.18, 1, (u - 0.18) / 0.14); return 1; }
  function after(t, t0, d) { return clamp((t - t0) / (d || 0.6)); }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function f(n) { return (+n).toFixed(1); }
  var INK = "#1d1b19", CREAM = "#fbefd2", YEL = "#ffd23f", RED = "#ff5a4e", GRN = "#6ee07a";
  var CAM = [180, 340, 1];
  function proj(c, x, y) { return [180 + (x - c[0]) * c[2], 320 + (y - c[1]) * c[2]]; }
  function confetti(t, t0, n) {
    var u = t - t0; if (u < 0 || u > 3.2) return ""; var s = "", cols = ["#ff5a4e", "#ffd23f", "#4fc3f7", "#6ee07a", "#c77dff", "#ff9f1c"];
    for (var i = 0; i < (n || 70); i++) { var a = -1.57 + (hash(i) - .5) * 2.4, v = 260 + hash(i + 3) * 260, x = 180 + Math.cos(a) * v * u * .5 + Math.sin(u * 4 + i) * 10, y = 420 + Math.sin(a) * v * u + 260 * u * u;
      var r = u * 9 + i, w = 6 + hash(i + 7) * 5; s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(w * .45) + '" fill="' + cols[i % 6] + '" transform="rotate(' + f(r * 40) + ' ' + f(x) + ' ' + f(y) + ')" opacity="' + f(clamp(3.2 - u)) + '"/>'; }
    return s;
  }
  function tag(c, w2, text, t0, t, o) {
    o = o || {}; var u = t - t0, dur = o.dur || 2.4; if (u < 0 || u > dur) return "";
    var p = proj(c, w2[0], w2[1]), sc = pop(u) * clamp((dur - u) / .25), w = text.length * 8.6 + 26, col = o.red ? RED : (o.col || YEL);
    var x = Math.max(w / 2 + 8, Math.min(352 - w / 2, p[0])), y = Math.max(214, Math.min(600, p[1] - 22));
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><path d="M0 22 l-6 -10 h12 z" fill="#1b1a1f" transform="translate(' + f(Math.max(-w / 2 + 12, Math.min(w / 2 - 12, p[0] - x))) + ' -2)"/><rect x="' + f(-w / 2) + '" y="-16" width="' + f(w) + '" height="30" rx="15" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + col + '">' + text + '</text></g>';
  }
  function panelAt(y, k, inner, w, h) { return '<g transform="translate(180 ' + y + ') scale(' + f(pop(k)) + ')" opacity="' + f(clamp(k * 3)) + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14" fill="#14232f" stroke="' + INK + '" stroke-width="2"/>' + inner + '</g>'; }
  function voteCard(t, ev) {
    var k = after(t, ev.vote, .45); if (k <= 0) return "";
    var s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.6 * k) + '"/><g transform="translate(180 250) scale(' + f(pop(after(t, ev.vote, .9))) + ')">';
    s += '<rect x="-120" y="-122" width="240" height="64" rx="18" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3"/><path d="M-20 -60 l14 18 l8 -18 z" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M-22 -61 h26" stroke="#ff8c1a" stroke-width="5"/>';
    s += '<text x="0" y="-80" text-anchor="middle" class="hd" fill="#fff">اكتب فكرتك!</text><text x="0" y="-26" text-anchor="middle" class="sm" fill="#f1e6cf">الأكثر إعجابًا = الفيديو القادم</text>';
    var rows = [["مصعد", 214], ["فكرتك أنت!", 603], ["جسر معلّق", 361], ["قطار", 128]];
    for (var r = 0; r < 4; r++) { var y = 8 + r * 50, u = after(t, ev.vote + .25 + r * .18, .5), grow = after(t, ev.vote + 1, 3.5), n = Math.round(rows[r][1] * (1 + (r === 1 ? .65 : .12) * grow));
      s += '<g transform="translate(' + f((1 - ease(u)) * 260) + ' ' + y + ')"><rect x="-125" y="-19" width="250" height="40" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text x="102" y="7" text-anchor="end" class="tg" fill="' + INK + '">' + rows[r][0] + '</text>';
      s += '<rect x="-115" y="-11" width="62" height="24" rx="12" fill="#1b1a1f"/><text x="-70" y="6" text-anchor="end" class="sm" fill="#fff">' + n + '</text><path d="M-104 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '"/></g>'; }
    for (var h = 0; h < 6; h++) { var hu = ((t - ev.vote) * .5 + h / 6) % 1; s += '<path transform="translate(' + f(-90 + h * 34 + Math.sin(t * 2 + h) * 8) + ' ' + f(230 - hu * 140) + ') scale(1.4)" d="M-4 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '" opacity="' + f((1 - hu) * k) + '"/>'; }
    return s + '</g>';
  }

  var GY = 400, OUT = "#4a4f57";               // ground line; the outline colour of the reference's hand (dark grey, thick, rounded)
  function o(w) { return ' stroke="' + OUT + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function capsule(x, y, w, h, fill, sw) { var r = w / 2; return '<path d="M' + x + ' ' + (y + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + ' V' + (y + h - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) + ' Z" fill="' + fill + '"' + o(sw) + '/>'; }
  function pipe(d, flow, t, col, w) { w = w || 10; var s = '<path d="' + d + '" fill="none"' + o(w + 4) + '/><path d="' + d + '" fill="none" stroke="#e9ecef" stroke-width="' + w + '" stroke-linejoin="round"/>'; if (flow > 0) s += '<path d="' + d + '" fill="none" stroke="' + (col || "#5cbf3a") + '" stroke-width="' + (w * .45) + '" stroke-dasharray="8 7" stroke-dashoffset="' + f(-t * 30) + '" opacity="' + f(flow) + '"/>'; return s; }

  // ── events ───────────────────────────────────────
  var EV = window.EV = {
    yay0: W(0, "مبروك"), cold: L(1) + .5, purify: W(2, "بتنقّيه"), pellets: W(3, "حبيبات"), coal: W(3, "طن"), tubes: W(4, "أنابيب"), rodsTag: W(4, "قضبان"),
    split: W(5, "بتتكسر"), bullets: W(5, "رصاصات"), hot: W(5, "فالسخونة"), over: W(6, "تزيد"), ctrl: W(7, "تانية"), ctrlTag: W(7, "التحكم"),
    down: W(8, "تنزّلها"), up: W(8, "ترفعها"), boil: W(9, "تلتمية"), fly: W(9, "وتغلي"), vessel: W(10, "وعاء"), bar: W(10, "سبعين"), vesTag: W(11, "وعاء"),
    radio: W(12, "مشعة"), sg: W(13, "مواسير"), steam: W(13, "بخار"), turb: W(14, "توربينة"), gen: W(14, "مولد"), power: W(14, "الكهربا"), sea: W(15, "البحر"),
    quake: W(16, "زلزال"), hit: W(16, "خبطت"), dome: W(17, "بقبة"), meter: W(17, "متر"), card: L(18) - .1, glow: W(18, "بتنوّر"), cardEnd: E(18) + .25,
    pool: W(19, "حوض"), diesel: W(19, "ومولدات"), fence: W(19, "وأسوار"), yay: W(20, "ومبروك"), vote: L(21) + .3
  };

  // ── background in the reference's hand: hazy sky, sun glow, faint pylons, the soil band ─────
  function bg(t) {
    var s = '<rect x="-1200" y="-600" width="3600" height="1100" fill="url(#gSkyHaze)"/>';
    s += '<circle cx="' + f(300 + t * .5) + '" cy="40" r="80" fill="#fff4c4" opacity=".55" filter="url(#soft)"/><circle cx="' + f(300 + t * .5) + '" cy="40" r="26" fill="#fff6d0" opacity=".9"/>';
    for (var i = 0; i < 12; i++) { var x = ((hash(i) * 2600 + t * (4 + hash(i + 2) * 4)) % 2600) - 1000, y = -40 + hash(i + 7) * 140, w = 40 + hash(i * 3) * 50; s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w) + '" ry="' + f(w * .22) + '" fill="#fff" opacity=".7"/>'; }
    for (var p = 0; p < 9; p++) { var px = -900 + p * 280; s += '<path d="M' + px + ' ' + (GY - 4) + ' l10 -60 l10 60 M' + (px + 4) + ' ' + (GY - 40) + ' h12" stroke="#9aa0a3" stroke-width="1.4" fill="none" opacity=".45"/>'; }
    s += '<path d="M-1200 ' + (GY - 6) + ' Q-400 ' + (GY - 26) + ' 300 ' + (GY - 10) + ' T1800 ' + (GY - 12) + ' V' + GY + ' H-1200 Z" fill="#dcc79c" opacity=".7"/>';
    s += '<rect x="-1200" y="' + GY + '" width="3600" height="10" fill="#d9c08f"/><rect x="-1200" y="' + (GY + 10) + '" width="3600" height="700" fill="url(#gSoilR)"/>';
    for (var r = 0; r < 60; r++) s += '<ellipse cx="' + f(-1100 + hash(r) * 3200) + '" cy="' + f(GY + 30 + hash(r + 4) * 260) + '" rx="' + f(2 + hash(r + 1) * 4) + '" ry="2" fill="#5e3e24" opacity=".5"/>';
    return s;
  }

  // ── the reactor area ─────────────────────────────
  var RX = 180;
  function heatCol(h) { var a = [74, 80, 87], b = [255, 122, 40]; return "rgb(" + a.map(function (v, i) { return Math.round(lerp(v, b[i], clamp(h))); }).join(",") + ")"; }
  function core(t, heat, ctrlDepth, ctrlOn) {
    var s = '<rect x="' + (RX - 42) + '" y="318" width="84" height="122" rx="4" fill="#d9dee4"' + o(2.4) + '/>';
    for (var k = 0; k < 9; k++) { var x = RX - 36 + k * 9; s += '<rect x="' + x + '" y="324" width="6" height="110" rx="2" fill="' + heatCol(heat) + '" stroke="' + OUT + '" stroke-width="1"/>'; }
    if (heat > .2) s += '<rect x="' + (RX - 46) + '" y="314" width="92" height="130" rx="8" fill="#ff7a28" opacity="' + f((heat - .2) * .35 * (.85 + .15 * Math.sin(t * 6))) + '" filter="url(#soft)"/>';
    if (ctrlOn > 0) for (var c = 0; c < 4; c++) { var cx = RX - 31 + c * 18, top = 150, len = 70 + 160 * ctrlDepth; s += '<rect x="' + (cx - 2.5) + '" y="' + top + '" width="5" height="' + f(len * ctrlOn) + '" fill="#2b2e33"/>'; }
    return s;
  }
  function tank(t, water, boil, tint) {    // the open water tank that the bucket grows into (before the vessel)
    var s = '<path d="M' + (RX - 62) + ' 290 V' + GY + ' H' + (RX + 62) + ' V290" fill="#eef3f6" opacity=".35"' + o(3) + '/>';
    s += '<rect x="' + (RX - 59) + '" y="' + f(lerp(GY, 300, water)) + '" width="118" height="' + f((GY - 300) * water) + '" fill="' + (tint ? "#9fd28a" : "url(#gWaterR)") + '" opacity=".75"/>';
    if (boil > 0) for (var b = 0; b < 14; b++) { var u = (t * 1.6 + b / 14) % 1; s += '<circle cx="' + f(RX - 50 + hash(b) * 100) + '" cy="' + f(GY - 6 - u * 90) + '" r="' + f(2 + u * 3) + '" fill="#fff" opacity="' + f(boil * (1 - u)) + '"/>'; }
    if (boil > .4) for (var w = 0; w < 4; w++) { var su = (t * .7 + w / 4) % 1; s += '<ellipse cx="' + f(RX - 30 + w * 20 + Math.sin(t + w) * 6) + '" cy="' + f(290 - su * 80) + '" rx="' + f(10 + su * 14) + '" ry="' + f(6 + su * 6) + '" fill="#fff" opacity="' + f(.6 * (1 - su) * boil) + '"/>'; }
    return s;
  }
  function vessel(t, k, tint, radio) {      // the pressure vessel: a tall steel capsule in a concrete pit, nozzles on the side
    if (k <= 0) return "";
    var s = '<rect x="' + (RX - 85) + '" y="' + (GY - 60) + '" width="170" height="' + (190 * ease(k)) + '" fill="url(#gConcR)"' + o(2.4) + ' opacity="' + f(k) + '"/>';
    s += '<g opacity="' + f(clamp(k * 1.5)) + '">' + capsule(RX - 58, 170, 116, 300, "none", 7);
    s += '<path d="M' + (RX - 52) + ' 230 V440 A52 52 0 0 0 ' + (RX + 52) + ' 440 V230" fill="' + (tint ? "#9fd28a" : "#a9d3ea") + '" opacity=".55"/>';
    [[RX + 58, 300], [RX + 58, 360]].forEach(function (n) { s += '<rect x="' + n[0] + '" y="' + (n[1] - 9) + '" width="14" height="18" rx="2" fill="#6f7680"' + o(2) + '/>'; });
    s += '<rect x="' + (RX - 34) + '" y="140" width="68" height="28" rx="6" fill="#3a3f46"' + o(2) + '/>'; for (var c = 0; c < 5; c++) s += '<rect x="' + (RX - 28 + c * 13) + '" y="120" width="5" height="22" rx="2" fill="#5a6068"/>';
    if (radio > 0) { s += '<g transform="translate(' + (RX - 34) + ' 230) scale(' + f(pop(radio)) + ')"><circle r="14" fill="' + YEL + '"' + o(2) + '/>'; for (var a = 0; a < 3; a++) s += '<path d="M0 0 L' + f(12 * Math.cos(a * 2.094 - 1.57)) + ' ' + f(12 * Math.sin(a * 2.094 - 1.57)) + ' A12 12 0 0 1 ' + f(12 * Math.cos(a * 2.094 - .52)) + ' ' + f(12 * Math.sin(a * 2.094 - .52)) + ' Z" fill="#1d1b19"/>'; s += '<circle r="3.5" fill="' + YEL + '" stroke="#1d1b19" stroke-width="1.4"/></g>'; }
    return s + '</g>';
  }
  function pressurizer(t, k) { if (k <= 0) return ""; var s = '<g opacity="' + f(k) + '">' + capsule(286, 250, 28, 80, "#c9ced4", 3) + '<path d="M300 330 V372" stroke="' + OUT + '" stroke-width="4"/>';
    var na = -2.4 + 4.2 * clamp(k) + Math.sin(t * 7) * .05; s += '<circle cx="300" cy="234" r="12" fill="#fff"' + o(2) + '/><path d="M300 234 L' + f(300 + Math.cos(na) * 9) + ' ' + f(234 + Math.sin(na) * 9) + '" stroke="' + RED + '" stroke-width="2"/></g>'; return s; }
  function steamGen(t, k, steam) {          // a steam generator: tall capsule, U-tubes on top (hot water inside them), split bottom head
    if (k <= 0) return ""; var x = 390, y = 190, w = 74, h = 210, s = '<g opacity="' + f(clamp(k * 1.5)) + '" transform="translate(0 ' + f((1 - ease(k)) * -40) + ')">';
    s += capsule(x, y, w, h, "#e8eef2", 5) + '<rect x="' + (x + 4) + '" y="' + (y + 95) + '" width="' + (w - 8) + '" height="70" fill="#a9d3ea" opacity=".7"/>';
    for (var u = 0; u < 5; u++) { var r = 10 + u * 5; s += '<path d="M' + (x + w / 2 - r) + ' ' + (y + h - 40) + ' V' + (y + 70) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + w / 2 + r) + ' ' + (y + 70) + ' V' + (y + h - 40) + '" fill="none" stroke="#d9783a" stroke-width="2.2"/>'; }
    s += '<path d="M' + (x + 4) + ' ' + (y + h - 38) + ' H' + (x + w - 4) + '" stroke="' + OUT + '" stroke-width="2.4"/><path d="M' + (x + w / 2) + ' ' + (y + h - 38) + ' V' + (y + h - 8) + '" stroke="' + OUT + '" stroke-width="2"/>';
    s += '<path d="M' + (x + 6) + ' ' + (y + h - 36) + ' H' + (x + w / 2) + ' V' + (y + h - 10) + ' A30 30 0 0 1 ' + (x + 6) + ' ' + (y + h - 30) + ' Z" fill="#f2a06a" opacity=".85"/>';
    if (steam > 0) for (var p = 0; p < 7; p++) { var su = (t * .9 + p / 7) % 1; s += '<circle cx="' + f(x + w / 2 + (hash(p) - .5) * 30) + '" cy="' + f(y + 90 - su * 60) + '" r="' + f(3 + su * 4) + '" fill="#fff" opacity="' + f(steam * (1 - su) * .9) + '"/>'; }
    return s + '</g>';
  }
  function turbineHall(t, k, gk, pk) {
    var s = "";
    if (k > 0) { s += '<g opacity="' + f(clamp(k * 1.5)) + '"><rect x="540" y="292" width="150" height="84" rx="10" fill="#e8eef2"' + o(5) + '/>';
      for (var d = 0; d < 4; d++) { var cx = 568 + d * 30, r = 16 + d * 3; for (var b = 0; b < 8; b++) { var a = t * 8 * k + b * .785; s += '<path d="M' + cx + ' 334 L' + f(cx + Math.cos(a) * r * .3) + ' ' + f(334 + Math.sin(a) * r) + '" stroke="#4a4f57" stroke-width="2"/>'; } }
      s += '<path d="M548 334 H690" stroke="#4a4f57" stroke-width="3"/><rect x="532" y="376" width="166" height="12" fill="#cfcbc3"' + o(2) + '/></g>'; }
    if (gk > 0) s += '<g opacity="' + f(clamp(gk * 1.5)) + '"><path d="M690 334 H712" stroke="#4a4f57" stroke-width="5"/><rect x="712" y="304" width="78" height="60" rx="14" fill="#3f9a5a"' + o(4) + '/>' + [0, 1, 2, 3, 4].map(function (i) { return '<path d="M' + (724 + i * 13) + ' 308 V360" stroke="#2f7a46" stroke-width="2"/>'; }).join("") + '<rect x="708" y="364" width="86" height="14" fill="#3a3f46"/></g>';
    if (pk > 0) { s += '<g opacity="' + f(pk) + '"><path d="M860 ' + GY + ' L880 210 L900 ' + GY + ' M866 330 H894 M872 270 H888 M856 240 H904" stroke="#5a6068" stroke-width="3" fill="none"/>';
      s += '<path d="M790 320 Q830 300 856 240 M904 240 Q1000 260 1200 250" stroke="#4a4f57" stroke-width="1.6" fill="none"/>';
      for (var e = 0; e < 4; e++) { var u = (t * 1.2 + e / 4) % 1; s += '<circle cx="' + f(lerp(904, 1200, u)) + '" cy="' + f(lerp(240, 250, u) + Math.sin(u * 3.14) * 8) + '" r="3" fill="' + YEL + '" opacity="' + f(1 - u) + '"/>'; } s += '</g>'; }
    return s;
  }
  function seaSide(t, k) {                  // a condenser under the turbine, cooled by sea water drawn in from the right
    if (k <= 0) return ""; var s = '<g opacity="' + f(clamp(k * 1.5)) + '">';
    s += '<path d="M960 ' + (GY + 18) + ' Q1080 ' + (GY + 10) + ' 1400 ' + (GY + 14) + ' V700 H960 Z" fill="#3f86c0"/>';
    for (var w = 0; w < 8; w++) s += '<path d="M' + f(970 + w * 50 + Math.sin(t * 2 + w) * 6) + ' ' + (GY + 30 + (w % 3) * 18) + ' q10 -4 20 0" stroke="#bfe3f2" stroke-width="2" fill="none"/>';
    s += '<rect x="560" y="420" width="110" height="46" rx="8" fill="#d6dbe0"' + o(4) + '/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M570 ' + (428 + i * 6) + ' H660" stroke="#3a9be0" stroke-width="1.6"/>'; }).join("");
    s += pipe("M670 444 H990 V" + (GY + 40), 1, t, "#3a9be0", 8) + pipe("M660 456 V500 H1010 V" + (GY + 50), 1, -t, "#3a9be0", 8);
    return s + '</g>';
  }
  function dome(t, k) {
    if (k <= 0) return ""; var e = ease(k), R = 240, cx = 290, cy = GY, s = "";
    var a1 = Math.PI, a2 = Math.PI + Math.PI * e;
    function arc(r) { return 'M' + f(cx + Math.cos(a1) * r) + ' ' + f(cy + Math.sin(a1) * r) + ' A' + r + ' ' + r + ' 0 0 1 ' + f(cx + Math.cos(a2) * r) + ' ' + f(cy + Math.sin(a2) * r); }
    s += '<path d="' + arc(R) + '" fill="none"' + o(26) + '/><path d="' + arc(R) + '" fill="none" stroke="url(#gConcR)" stroke-width="20"/>';
    return s;
  }
  function extras(t, pk, dk, fk) {
    var s = "";
    if (pk > 0) { s += '<g opacity="' + f(pk) + '"><rect x="-150" y="' + (GY - 4) + '" width="110" height="60" fill="#eef3f6"' + o(3) + '/><rect x="-146" y="' + (GY + 4) + '" width="102" height="48" fill="#3fa9f5" opacity=".8"/><rect x="-150" y="' + (GY - 10) + '" width="110" height="60" fill="#5ac8fa" opacity="' + f(.35 + .15 * Math.sin(t * 3)) + '" filter="url(#soft)"/>';
      for (var r = 0; r < 6; r++) s += '<rect x="' + (-140 + r * 16) + '" y="' + (GY + 18) + '" width="8" height="32" fill="#4a4f57"/>'; s += '</g>'; }
    if (dk > 0) { s += '<g transform="translate(-300 ' + GY + ') scale(' + f(pop(dk)) + ')"><rect x="0" y="-46" width="110" height="46" rx="6" fill="#d9a43a"' + o(3) + '/><rect x="10" y="-38" width="40" height="22" fill="#3a3f46"/><circle cx="80" cy="-24" r="12" fill="#5a6068"/><path d="M95 -46 v-20" stroke="#4a4f57" stroke-width="5"/>';
      for (var p = 0; p < 3; p++) { var u = (t * .8 + p / 3) % 1; s += '<circle cx="95" cy="' + f(-70 - u * 30) + '" r="' + f(4 + u * 6) + '" fill="#9aa0a3" opacity="' + f(.6 * (1 - u)) + '"/>'; } s += '</g>'; }
    if (fk > 0) for (var x = -360; x < 1000; x += 40) { var fp = clamp(fk * 3 - (x + 360) / 800); if (fp <= 0) continue; s += '<path d="M' + x + ' ' + GY + ' v' + f(-30 * fp) + '" stroke="#6f7680" stroke-width="3"/><path d="M' + x + ' ' + f(GY - 30 * fp) + ' h40" stroke="#9aa0a3" stroke-width="1.4"/>'; }
    return s;
  }

  // ── camera: travels along the plant as it grows ─────────
  var SHOTS = [[0, [180, 362, 1.75]], [2, [175, 356, 1.6]], [3, [235, 352, 1.4]], [4, [180, 356, 1.45]], [7, [180, 318, 1.2]], [9, [180, 336, 1.3]], [10, [200, 336, 1.05]],
    [13, [300, 322, 1.0]], [14, [640, 330, 1.05]], [15, [800, 360, .85]], [16, [300, 270, .78]], [17, [290, 240, .8]], [19, [380, 280, .52]], [20, [420, 250, .42]]];
  function cam(t) {
    var i = 0; while (i < SHOTS.length - 1 && L(SHOTS[i + 1][0]) - .45 <= t) i++;
    var a = i ? SHOTS[i - 1][1] : [180, 362, 2.0], b = SHOTS[i][1], k = ease((t - (L(SHOTS[i][0]) - .45)) / 1.3);
    if (i === 0) k = ease(t / 2.4);
    var c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    c[0] += Math.sin(t * .37) * 2.5; c[1] += Math.cos(t * .29) * 2; c[2] *= 1 + .01 * Math.sin(t * .23);
    return c;
  }

  // ── cards ─────────────────────────────────────────
  function atomCard(t) {   // atoms breaking, tiny bullets hitting the next ones, heat rising (plain words, no physics terms)
    var k = after(t, EV.split - .2, .5) * (1 - after(t, EV.over - .3, .4)); if (k <= 0) return "";
    var s = '<g transform="translate(180 230) scale(' + f(pop(after(t, EV.split - .2, .9))) + ')"><circle r="104" fill="#fbf6ea"' + o(4) + '/>', u = (t - EV.split) % 2.4;
    var atoms = [[-50, -20], [30, -50], [50, 30], [-20, 55], [-70, 40]];
    atoms.forEach(function (q, i) { var hitT = .3 + i * .45, broken = u > hitT; if (!broken) s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="16" fill="#8fd16a"' + o(2) + '/>'; else { var d = Math.min(1, (u - hitT) * 2) * 12; s += '<circle cx="' + f(q[0] - d) + '" cy="' + f(q[1] - d * .4) + '" r="10" fill="#8fd16a"' + o(2) + '/><circle cx="' + f(q[0] + d) + '" cy="' + f(q[1] + d * .4) + '" r="10" fill="#8fd16a"' + o(2) + '/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f(20 * (1 - Math.min(1, (u - hitT) * 2))) + '" fill="#ffb347" opacity=".7"/>'; }
      if (i < atoms.length - 1) { var nx = atoms[i + 1], bu = clamp((u - hitT) / .45); if (bu > 0 && bu < 1) s += '<circle cx="' + f(lerp(q[0], nx[0], bu)) + '" cy="' + f(lerp(q[1], nx[1], bu)) + '" r="4" fill="#3a3f46"/>'; } });
    s += '<g transform="translate(0 124)"><rect x="-58" y="-15" width="116" height="28" rx="14" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + YEL + '">رصاصات صغيرة</text></g>';
    return '<g opacity="' + f(clamp(k * 3)) + '">' + s + '</g></g>';
  }
  function glowCard(t) {   // the blue glow of the water around used fuel (no lamp)
    var k = after(t, EV.card, .45) * (1 - after(t, EV.cardEnd - .35, .35)); if (k <= 0) return "";
    var g = after(t, EV.glow, 1.2), s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.6 * k) + '"/><g transform="translate(180 290) scale(' + f(pop(after(t, EV.card, .9))) + ')">';
    s += '<rect x="-150" y="-150" width="300" height="290" rx="22" fill="#0f1c2a"' + o(3) + '/><text x="0" y="-116" text-anchor="middle" class="hd" fill="#fff">وتعرف إيه الغريب؟</text>';
    s += '<rect x="-110" y="-80" width="220" height="170" rx="6" fill="#0a2a4a"' + o(3) + '/><rect x="-110" y="-80" width="220" height="170" rx="6" fill="#3fb7ff" opacity="' + f(.15 + .55 * g * (.85 + .15 * Math.sin(t * 4))) + '" filter="url(#soft)"/>';
    for (var r = 0; r < 7; r++) s += '<rect x="' + (-84 + r * 26) + '" y="0" width="12" height="80" rx="2" fill="#3a3f46"/><rect x="' + (-88 + r * 26) + '" y="-6" width="20" height="92" rx="4" fill="#5ac8fa" opacity="' + f(.6 * g) + '" filter="url(#soft)"/>';
    s += '<g transform="translate(96 -96)" opacity="' + f(g) + '"><circle r="16" fill="#3a3f46"/><path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="' + RED + '" stroke-width="3"/></g><text x="0" y="122" text-anchor="middle" class="tg" fill="#bfe3f2" opacity="' + f(g) + '">بينوّر أزرق من غير لمبة!</text>';
    return s + '</g>';
  }

  // ── the frame ─────────────────────────────────────
  window.__frame = function (t) {
    var c = window.__cam || cam(t), ev = EV;
    var shake = t >= ev.quake && t < ev.dome ? Math.sin(t * 40) * 3 * (1 - after(t, ev.dome - .4, .4)) : 0;
    var s = '<g transform="translate(' + f(shake) + ' 0)">' + bg(t);
    var vk = after(t, ev.vessel, 1);
    var heat = t < ev.split ? .05 : t < ev.ctrl ? lerp(.3, 1, after(t, ev.hot, 2.2)) : t < ev.down ? lerp(1, .5, after(t, ev.ctrl, 1.5)) : t < ev.up ? lerp(.5, .2, after(t, ev.down, .8)) : t < ev.boil ? lerp(.2, .6, after(t, ev.up, .8)) : .6;
    var ctrlDepth = t < ev.down ? .5 : t < ev.up ? 1 : .35;
    s += extras(t, after(t, ev.pool, .8), after(t, ev.diesel, .8), after(t, ev.fence, 1.2));
    // the bucket / tank / core / vessel stage by stage
    if (t < ev.tubes) {
      var bk = 1 - after(t, ev.tubes - .5, .5), rock = t < ev.purify ? 1 : 1 - after(t, ev.purify, 1.2);
      s += '<g opacity="' + f(bk) + '"><path d="M' + (RX - 48) + ' 330 L' + (RX - 40) + ' ' + GY + ' H' + (RX + 40) + ' L' + (RX + 48) + ' 330" fill="#eef3f6" opacity=".5"' + o(3) + '/><path d="M' + (RX - 46) + ' 346 L' + (RX - 40) + ' ' + (GY - 2) + ' H' + (RX + 40) + ' L' + (RX + 46) + ' 346 Z" fill="url(#gWaterR)" opacity=".8"/><path d="M' + (RX - 52) + ' 330 H' + (RX + 52) + '" stroke="' + OUT + '" stroke-width="4"/>';
      s += '<g transform="translate(' + RX + ' 380)"><path d="M-14 -8 L-4 -16 L12 -12 L16 2 L6 14 L-10 12 Z" fill="#4a4036" opacity="' + f(rock) + '"' + o(2) + '/><circle r="' + f(10 * (1 - rock)) + '" fill="#a6e36a" opacity="' + f(1 - rock) + '" stroke="#5a8a3a" stroke-width="1.6"/></g>';
      if (t < ev.purify) for (var w = 0; w < 2; w++) { var su = (t * .6 + w / 2) % 1; s += '<path d="M' + (RX - 10 + w * 18) + ' ' + f(326 - su * 30) + ' q-6 -8 0 -16" stroke="#fff" stroke-width="2.4" fill="none" opacity="' + f(.6 * (1 - su)) + '"/>'; }
      s += '</g>';
      if (t >= ev.pellets) { var pk = pop(after(t, ev.pellets, .9)); s += '<g transform="translate(' + (RX + 80) + ' 360) scale(' + f(pk) + ')"><rect x="-8" y="-10" width="16" height="20" rx="4" fill="#a6e36a"' + o(2) + '/></g>'; if (t >= ev.coal) s += '<g transform="translate(' + (RX + 150) + ' ' + GY + ') scale(' + f(pop(after(t, ev.coal, .9))) + ')"><path d="M-46 0 Q-30 -60 0 -64 Q32 -60 46 0 Z" fill="#26292d"' + o(2) + '/><text x="-35" y="-26" text-anchor="middle" style="font:900 24px Noto Sans Arabic" fill="' + INK + '">=</text></g>'; }
    } else {
      var wk = t < ev.vessel ? after(t, ev.tubes, .8) : 1, tint = t >= ev.radio;
      if (t < ev.vessel + .6) s += '<g opacity="' + f(1 - after(t, ev.vessel, .6)) + '">' + tank(t, wk, after(t, ev.boil, .8), false) + '</g>';
      s += vessel(t, vk, tint, after(t, ev.radio, .9));
      s += core(t, heat, ctrlDepth, after(t, ev.ctrl, 1.2));
      if (t < ev.vessel) s += '<rect x="' + (RX - 50) + '" y="' + f(lerp(GY - 2, 300, wk)) + '" width="100" height="' + f((GY - 300) * wk) + '" fill="url(#gWaterR)" opacity=".35"/>';
    }
    // primary loop, pressurizer, steam generator, turbine, sea
    var sgk = after(t, ev.sg, 1);
    if (sgk > 0) { s += pipe("M" + (RX + 70) + " 300 H300 V230 H390", sgk, t, "#5cbf3a") + pipe("M" + (RX + 70) + " 360 H310 V420 H430 V400", sgk, -t, "#5cbf3a"); s += '<g opacity="' + f(sgk) + '"><circle cx="330" cy="420" r="16" fill="#9aa4ad"' + o(3) + '/><circle cx="330" cy="420" r="6" fill="#4a4f57"/></g>'; }
    s += pressurizer(t, after(t, ev.vessel + .6, 1)) + steamGen(t, sgk, after(t, ev.steam, .6));
    var tk = after(t, ev.turb, .9);
    if (tk > 0) s += pipe("M427 196 V150 H610 V292", tk, t, "#ffffff", 9);
    s += turbineHall(t, tk, after(t, ev.gen, .9), after(t, ev.power, .9)) + seaSide(t, after(t, ev.sea, 1.2));
    s += dome(t, after(t, ev.dome, 1.6));
    // something hits: a falling rock and a red alarm during the quake line
    if (t >= ev.hit && t < ev.dome) { var hk = after(t, ev.hit, 1); s += '<g transform="translate(' + f(lerp(520, 300, hk)) + ' ' + f(lerp(-120, 120, hk)) + ') rotate(' + f(t * 200) + ')"><path d="M-14 -8 L-4 -16 L12 -12 L16 2 L6 14 L-10 12 Z" fill="#6a5a4a"' + o(2) + '/></g>'; }
    s += '</g>';
    var W2 = '<g transform="translate(180 320) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')">' + s + '</g>';
    if (t >= ev.quake && t < ev.dome) W2 += '<rect width="360" height="640" fill="' + RED + '" opacity="' + f(.12 + .1 * Math.sin(t * 10)) + '"/>';

    var T = "";
    T += tag(c, [RX, 320], "مفاعل بدائي!", ev.yay0 - .2, t, { dur: 2.2 });
    T += tag(c, [RX, 330], "بالكاد بتدفى", ev.cold, t, { red: true });
    T += tag(c, [RX, 360], "يورانيوم منقّى", ev.purify + .5, t, { col: GRN });
    T += tag(c, [RX + 80, 345], "حباية", ev.pellets + .1, t, { col: CREAM, dur: 1.6 });
    T += tag(c, [RX + 150, 330], "= طن فحم", ev.coal + .2, t);
    T += tag(c, [RX, 312], "قضبان الوقود", ev.rodsTag - .1, t);
    T += tag(c, [RX, 312], "سخونة!", ev.over, t, { red: true });
    T += tag(c, [RX, 150], "قضبان التحكم", ev.ctrlTag - .1, t);
    T += tag(c, [RX, 300], "320°", ev.boil, t, { red: true, dur: 2.2 });
    T += tag(c, [RX + 60, 170], "وعاء الضغط", ev.vesTag - .1, t);
    T += tag(c, [RX - 34, 215], "مية مشعة", ev.radio + .2, t, { red: true });
    T += tag(c, [427, 185], "خزان البخار", ev.sg + .4, t, { col: CREAM });
    T += tag(c, [615, 288], "توربينة", ev.turb + .1, t);
    T += tag(c, [750, 300], "مولد", ev.gen + .1, t, { col: CREAM, dur: 1.8 });
    T += tag(c, [1050, 380], "مية البحر", ev.sea + .3, t, { col: "#7fd0ff" });
    T += tag(c, [290, 160], "قبة خرسانة +1 م", ev.meter - .2, t, { dur: 2.6 });
    T += tag(c, [-95, 380], "حوض الوقود", ev.pool, t, { col: "#7fd0ff", dur: 1.6 });
    T += tag(c, [-245, 340], "مولدات احتياطي", ev.diesel, t, { col: CREAM, dur: 1.6 });
    if (t >= ev.cold - .2 && t < ev.purify) T += panelAt(560, after(t, ev.cold - .2, .5) * (1 - after(t, ev.purify - .3, .3)), '<text x="0" y="-10" text-anchor="middle" class="sm" fill="#9fc3d6">حرارة المية</text><text x="0" y="18" text-anchor="middle" class="big" fill="#7fd0ff">' + Math.round(26 + 3 * after(t, ev.cold, 2)) + '°</text>', 120, 62);
    if (t >= ev.bar && t < ev.vesTag + 1.8) { var bk2 = after(t, ev.bar, .5) * (1 - after(t, ev.vesTag + 1.5, .3)); T += panelAt(560, bk2, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">الضغط جوه</text><text x="0" y="18" text-anchor="middle" class="big" fill="' + YEL + '">' + Math.round(70 * after(t, ev.bar, 1.2)) + ' × كاوتش</text>', 190, 64); }
    if (t >= ev.over && t < ev.down + 1.5) { var gk = after(t, ev.over, .4) * (1 - after(t, ev.down + 1.2, .3)); T += panelAt(560, gk, '<text x="0" y="-12" text-anchor="middle" class="sm" fill="#9fc3d6">السخونة</text><rect x="-70" y="2" width="140" height="16" rx="8" fill="#2b3a46"/><rect x="-70" y="2" width="' + f(140 * heat) + '" height="16" rx="8" fill="' + (heat > .75 ? RED : heat > .4 ? "#ffb347" : GRN) + '"/>', 180, 64); }
    T += atomCard(t) + glowCard(t);
    T += confetti(t, ev.yay0, 60) + confetti(t, ev.yay, 90);
    T += voteCard(t, ev);
    return W2 + T;
  };
})();
