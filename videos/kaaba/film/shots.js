/* «الكعبة من جوة» — the timeline: camera, people, washing cues, captions, cards and chips, all from timing.js.
   Camera = the «طب إزاي؟» move in 3D: one eased fly of about 1.8 s onto what the line is about, then a slow steady dolly
   (no sway, no shake). A real clip or photo comes up in a framed card at the top, the 3D softly blurred behind it. */
(function () {
  var W = window.W3, T = W.T, cam = W.cam, R = W.R, LN = TIMING.lines;
  function L(i) { return LN[i].start; } function E(i) { return LN[i].end; }
  var BIO = TIMING.bio;   // «ولو عايز تعرف تعمل فيديوهات زي كده…» said after line 23, kept out of LN so the line numbers stay
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eio(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eout(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function win(t, a, b, f) { f = f || .3; return clamp((t - a) / f) * clamp((b - t) / f); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  var END = TIMING.lines[LN.length - 1].end + 1.6; window.VIDEO_END = END;
  var MX = 60;   // the museum room's x offset

  // ── camera views ──────────────────────────────────────────
  var V = {
    wide:    { p: [-5.7, 1.65, 3.8], l: [3.0, 3.6, -2.2], f: 72 },
    wideR:   { p: [5.4, 1.7, 3.9], l: [-2.6, 3.4, -2.4], f: 72 },
    pillar0: { p: [-2.0, 1.5, 2.4], l: [0, 2.0, 0], f: 58 },
    doorIn:  { p: [-3.0, 1.8, 2.4], l: [-3.0, 2.0, 5], f: 62 },
    doorKey: { p: [-2.2, 1.8, 1.6], l: [-3.0, 1.8, 4.6], f: 54 },
    enter:   { p: [-3.0, 1.75, 4.4], l: [0.5, 2.6, -3.0], f: 74 },
    center:  { p: [0.4, 1.7, 4.4], l: [0, 2.6, -3], f: 70 },
    floor:   { p: [2.0, 2.2, 3.2], l: [-1.0, 0, -1.2], f: 62 },
    up:      { p: [-1.6, 1.4, 3.0], l: [0.5, 8.0, -3.0], f: 74 },
    frieze:  { p: [-1.0, 6.2, 1.2], l: [-1.0, 8.2, -5], f: 52 },
    pillars: { p: [-5.4, 1.3, -.6], l: [4.0, 3.0, .4], f: 62 },
    lamps:   { p: [-1.6, 4.9, 1.9], l: [-.4, 4.7, 0], f: 48 },
    tawba:   { p: [3.0, 1.75, 2.0], l: [6, 1.6, 4.1], f: 62 },
    tawbaIn: { p: [2.8, 1.8, 2.4], l: [6, 1.9, 4.0], f: 62 },
    spot:    { p: [-.6, 2.5, -1.6], l: [-1.8, 0, -3.4], f: 52 },
    bucket:  { p: [2.9, .9, 3.6], l: [1.2, .3, 1.6], f: 52 },
    vessels: { p: [.6, 1.35, 3.9], l: [-1.7, .35, 2.2], f: 58 },
    wash:    { p: [1.8, 1.5, 3.6], l: [-1.2, .2, 1.0], f: 62 },
    wallW:   { p: [3.2, 1.6, -2.9], l: [-.5, 1.9, -4.8], f: 60 },
    pillarW: { p: [5.6, 1.5, 1.9], l: [3.6, 2.2, 0], f: 56 },
    censer:  { p: [.8, 1.7, 3.8], l: [-2.4, 2.0, -.4], f: 62 },
    museum:  { p: [MX + 2.6, 1.6, 3.4], l: [MX, 3.0, -1.6], f: 58 },
    museumU: { p: [MX + 1.0, .9, 1.6], l: [MX, 6.4, -1.6], f: 62 },
    high:    { p: [-5.0, 5.2, 4.0], l: [2.0, 2.2, -2.2], f: 74 }
  };
  // keys: [time, view, {fly: seconds (0 = cut through dark), push: metres of slow dolly per second}]
  var K = [
    [0, "pillar0", { fly: 0, push: .06 }],
    [L(1), "bucket", { fly: 0, push: .05 }],
    [L(2) - .1, "center", { fly: 0, push: .08 }],
    [L(3), "doorIn", { fly: 1.6, push: .02 }], [L(3) + 2.6, "enter", { fly: 2.0, push: .12 }],
    [L(4), "wide", { fly: 1.8, push: .06 }],
    [L(5), "doorIn", { fly: 1.8, push: .03 }],
    [L(7), "doorKey", { fly: 1.6, push: .04 }],
    [L(8), "enter", { fly: 1.8, push: .14 }],
    [L(9), "wide", { fly: 1.8, push: .05 }],
    [L(10), "floor", { fly: 1.8, push: .05 }], [L(10) + 2.0, "wideR", { fly: 1.8, push: .04 }],
    [L(11), "up", { fly: 1.8, push: .03 }],
    [L(12), "frieze", { fly: 1.8, push: .05 }],
    [L(13), "pillars", { fly: 1.8, push: .1 }],
    [L(14), "lamps", { fly: 1.8, push: .06 }],
    [L(15), "tawba", { fly: 1.8, push: .05 }],
    [L(16), "tawbaIn", { fly: 1.6, push: .06 }],
    [L(17), "spot", { fly: 1.8, push: .05 }],
    [L(18), "high", { fly: 1.8, push: .05 }],
    [L(20), "doorKey", { fly: 1.8, push: .03 }],
    [L(22), "center", { fly: 1.6, push: .06 }],
    [BIO.end - .1, "vessels", { fly: 1.4, push: .03 }],
    [L(25), "bucket", { fly: 1.4, push: .03 }],
    [L(26), "wash", { fly: 1.6, push: .06 }],
    [L(27), "wallW", { fly: 1.8, push: .05 }],
    [L(28), "pillarW", { fly: 1.6, push: .05 }],
    [L(29), "censer", { fly: 1.8, push: .05 }],
    [L(30), "center", { fly: 1.8, push: .05 }],
    [L(31), "high", { fly: 1.8, push: .0 }],
    [L(32) - .15, "museum", { fly: 0, push: .08 }],
    [L(33), "museumU", { fly: 1.8, push: .05 }],
    [L(34) - .15, "wide", { fly: 0, push: -.12 }]
  ];
  function viewAt(k, t) {   // a key's pose after `t` seconds of its slow dolly toward the look point
    var v = V[k[1]], o = k[2], d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], dl = Math.hypot(d[0], d[1], d[2]), m = (o.push || 0) * Math.max(0, t);
    return { p: [v.p[0] + d[0] / dl * m, v.p[1] + d[1] / dl * m, v.p[2] + d[2] / dl * m], l: v.l, f: v.f };
  }
  var dark = 0;
  function camera(t) {
    var i = 0; while (i + 1 < K.length && K[i + 1][0] <= t) i++;
    var k = K[i], o = k[2], dt = t - k[0], pose = viewAt(k, dt - (o.fly || 0)); dark = 0;
    if (i > 0 && o.fly && dt < o.fly) { var prev = viewAt(K[i - 1], k[0] - K[i - 1][0] - (K[i - 1][2].fly || 0)), u = eio(dt / o.fly);
      pose = { p: [0, 1, 2].map(function (j) { return lerp(prev.p[j], pose.p[j], u); }), l: [0, 1, 2].map(function (j) { return lerp(prev.l[j], pose.l[j], u); }), f: lerp(prev.f, pose.f, u) }; }
    if (!o.fly && i > 0) dark = Math.max(dark, 1 - clamp(dt / .35));
    if (i + 1 < K.length && !K[i + 1][2].fly) dark = Math.max(dark, clamp((t - (K[i + 1][0] - .3)) / .3));
    cam.fov = pose.f; cam.updateProjectionMatrix(); cam.position.set(pose.p[0], pose.p[1], pose.p[2]); cam.lookAt(pose.l[0], pose.l[1], pose.l[2]);
  }

  // ── people in the room ────────────────────────────────────
  var Pp = PROPS.person, C = PROPS.CUE;
  Pp("wipe-bisht", -.62, .25, 0, L(1) - .2, { rate: .9 });
  Pp("stand-saudi", 1.2, .9, 0, L(1) - .2, { rate: .3 });
  Pp("stand-bisht", -.9, 1.9, L(2) - .2, L(3), { rate: .3 }); Pp("stand-saudiShemagh", .9, 1.6, L(2) - .2, L(3), { rate: .3 }); Pp("wipe-saudi", -.6, .3, L(2) - .2, L(3), { rate: .9 });
  Pp("walk-bisht", 0, 0, L(22), E(22) + .5, { walk: [-3.0, 4.4, -1.2, 1.6, L(22), E(22) + .5], flip: true });
  Pp("walk-saudi", 0, 0, L(22) + .9, E(22) + .5, { walk: [-3.0, 4.6, -2.4, 2.2, L(22) + .9, E(22) + 1.5], flip: true });
  Pp("walk-saudiShemagh", 0, 0, L(22) + 1.8, E(22) + .5, { walk: [-3.0, 4.6, -3.2, 2.9, L(22) + 1.8, E(22) + 2.4], flip: true });
  Pp("floor-saudi", -1.1, 1.2, L(26) - .2, E(26) + .3, { rate: .8 }); Pp("floor-saudi", .6, .2, L(26) - .2, E(26) + .3, { rate: .7 });
  Pp("wipe-saudi", .1, -4.45, L(27) - .2, E(27) + .3, { rate: .7 }); Pp("wipe-bisht", 1.6, -4.45, L(27) - .2, E(27) + .3, { rate: .8 });
  Pp("wipe-bisht", 4.15, .25, L(28) - .2, E(28) + .3, { rate: .9, flip: true });
  var censer = Pp("censer", 0, 0, L(29) - .2, E(29) + .4, { walk: [-1.4, 1.4, -2.4, .2, L(29) - .2, E(29) + .4], rate: .6, flip: true });
  Pp("stand-bisht", -1.0, .9, L(30), L(31), { rate: .3 }); Pp("stand-saudi", 1.1, .6, L(30), L(31), { rate: .3 }); Pp("stand-saudiShemagh", 2.0, -1.4, L(30), L(31), { rate: .3 });
  Pp("stand-saudiShemagh", -1.2, 1.2, L(31), E(31) + .5, { rate: .3 }); Pp("wipe-saudi", -.6, .3, L(31), E(31) + .5, { rate: .8 }); Pp("floor-saudi", 1.3, 1.6, L(31), E(31) + .5, { rate: .7 });

  // ── washing cues ──────────────────────────────────────────
  C.bucket = [L(1) - .2, L(2) - .1]; C.bucket2 = [L(25) - .4, L(26) + .3]; C.soapOut = L(25) + 1.0;
  C.vessels = [BIO.end - .4, L(25) - .1]; C.pour = [L(24) + .4, L(24) + 3.0];
  C.wet = [L(26) + .2, E(28) + 1]; C.spray = [L(26) + .1, L(26) + 2.4];
  C.key = [L(20) - .2, E(21) + .3];
  C.smoke = [L(29) + .3, E(29) + .6];
  C.tawba = [L(16) - .1, E(16) + .6];
  C.spot = [L(17) + .2, E(17) + .2];
  var bucket2 = [L(25) - .2, L(26)];

  // ── 3D labels (anchored to points in the room) ────────────
  var LABS = [
    { t: [L(24) + .2, L(25) - .1], at: [-1.92, .74, 2.3], txt: "مية زمزم" }, { t: [L(24) + .9, L(25) - .1], at: [-1.6, .62, 2.3], txt: "مية ورد طايفي" }, { t: [L(24) + 1.6, L(25) - .1], at: [-1.32, .42, 2.3], txt: "دهن عود" },
    { t: [L(1) + .2, L(2) - .2], at: [1.4, .5, 2.0], txt: "مية؟" }, { t: [L(1) + 1.2, L(2) - .2], at: [1.85, .18, 2.1], txt: "صابون؟" },
    { t: [L(15) + .6, L(16) + 1], at: [6, 2.95, 4.1], txt: "باب التوبة" },
    { t: [L(17) + .6, E(17)], at: [-1.8, .1, -3.3], txt: "مكان صلاة النبي ﷺ" },
    { t: [L(13) + .5, L(14) - .1], at: [-3.6, 4.0, 0], txt: "1" }, { t: [L(13) + .9, L(14) - .1], at: [0, 4.0, 0], txt: "2" }, { t: [L(13) + 1.3, L(14) - .1], at: [3.6, 4.0, 0], txt: "3" },
    { t: [L(32) + .8, E(33)], at: [MX, 6.9, -1.6], txt: "عمود من خشب الساج" }
  ];
  var labsEl = document.getElementById("labs");
  LABS.forEach(function (b) { var d = document.createElement("div"); d.className = "lab"; d.textContent = b.txt; labsEl.appendChild(d); b.el = d; });
  var vtmp = new T.Vector3();

  // ── HUD chips and big numbers ─────────────────────────────
  var HUD = [
    { t: [L(5) + 1.2, E(5) + .3], y: 400, html: '<span class="chip gold">عالي عن الأرض <b>2.2 متر</b></span>' },
    { t: [L(7) + .8, E(7) + .4], y: 400, html: '<span class="chip gold">حوالي <b>280 كيلو</b> دهب</span>' },
    { t: [L(9) + .2, E(9) + .3], y: 404, html: '<span class="chip"><span class="x">✗</span>كرسي</span><span class="chip"><span class="x">✗</span>سجادة</span><span class="chip"><span class="x">✗</span>منبر</span><span class="chip"><span class="x">✗</span>نجفة</span>', stag: .5 },
    { t: [L(13) + .3, E(13) + .3], y: 404, html: '<span class="chip gold">3 عواميد خشب</span>' },
    { t: [BIO.start + 1.2, BIO.end + .2], y: 404, html: '<span class="chip gold">اللينك في البايو ↑</span>' },
    { t: [L(19) + .2, E(19) + .5], y: 404, html: '<span class="chip gold">مرة واحدة في السنة</span><span class="chip">15 محرّم</span>', stag: .6 },
    { t: [L(20) + 1.4, E(21) + .3], y: 404, html: '<span class="chip gold">عيلة بني شيبة</span>' },
    { t: [L(25) + .1, E(25) + .3], y: 404, html: '<span class="chip"><span class="x">✗</span>صابون</span><span class="chip"><span class="x">✗</span>منظفات</span>', stag: .5 },
    { t: [L(28) + .1, E(28) + .4], y: 404, html: '<span class="chip"><span class="x">✗</span>خرطوم</span><span class="chip"><span class="x">✗</span>مكنة</span><span class="chip"><span class="x">✗</span>مساحة</span><span class="chip gold"><span class="v">✓</span>بالإيد</span>', stag: .6 },
    { t: [L(30) + 2.6, E(30) + .4], y: 404, html: '<span class="chip gold">بدعوة رسمية بس</span>' },
    { t: [L(31) + 1.4, E(31) + .5], y: 150, html: '<span class="chip">مية زمزم</span><span class="chip">ورد طايفي</span><span class="chip">دهن عود</span><span class="chip gold">بالإيد</span>', stag: 1.1 },
    { t: [L(33) + 3.0, E(33) + .4], y: 150, big: '<div class="big">+1300<small>سنة · من سنة 65 هجري</small></div>' }
  ];
  var hudEl = document.getElementById("hud");
  HUD.forEach(function (h) { var d = document.createElement("div"); if (h.big) { d.innerHTML = h.big; d.style.position = "absolute"; d.style.left = d.style.right = "0"; d.style.top = h.y + "px"; h.items = [d.firstChild]; }
    else { d.className = "chips"; d.style.top = h.y + "px"; d.innerHTML = h.html; h.items = [].slice.call(d.children); } hudEl.appendChild(d); h.el = d; });

  // ── captions: short chunks, a key word on yellow ───────────
  var CAPTEXT = { 5: "باب الكعبة مش على الأرض… ده عالي عنها أكتر من 2 متر.", 7: "والباب نفسه دخل فيه حوالي 280 كيلو دهب خالص.",
    17: "وفي الأرض حتة رخام مميزة… بيقولوا إن النبي ﷺ صلّى عندها يوم فتح مكة.", 33: "بيقولوا إنه من أيام عبد الله بن الزبير… يعني عمره أكتر من 1300 سنة." };
  var KEY = { 0: ["بتتغسل"], 1: ["بمية؟", "بصابون؟"], 3: ["إيه", "الحكاية؟"], 5: ["عالي"], 6: ["سلّم", "خشب"], 7: ["280", "دهب"], 8: ["فاضية"], 10: ["رخام"], 11: ["خضرا."],
    12: ["لا", "إله", "إلا", "الله"], 13: ["تلات", "عواميد"], 14: ["قناديل"], 15: ["باب", "التوبة."], 16: ["السطح", "سطح"], 17: ["فتح", "مكة."], 19: ["مرة", "واحدة"], 20: ["بني", "شيبة."],
    21: ["قبل", "الإسلام…"], 24: ["زمزم…", "ورد", "طايفي", "عود."], 25: ["لا", "صابون"], 26: ["بالإيد"], 27: ["مية", "الورد…"], 28: ["بالإيد."], 29: ["بالعود…"], 30: ["لأ،", "بدعوة", "رسمية"],
    31: ["زمزم،", "طايفي،", "وإيدين،"], 32: ["متحف"], 33: ["1300"], 34: ["الكعبة"], bio: ["اللينك"] };
  var chunks = [], LNC = LN.slice(0, 24).concat([{ start: BIO.start, end: BIO.end, text: BIO.text, bio: 1 }], LN.slice(24));
  LNC.forEach(function (l, ci) { var i = l.bio ? "bio" : LN.indexOf(l);
    var text = CAPTEXT[i] || l.text, words = text.split(/\s+/), parts = [], cur = [];
    words.forEach(function (w, j) { cur.push(w); var brk = /[…،؟.!:]$/.test(w) || cur.length >= 4; if (brk && (j < words.length - 1 ? true : true)) { parts.push(cur); cur = []; } });
    if (cur.length) parts.push(cur);
    // merge a lone trailing word into the chunk before
    for (var q = parts.length - 1; q > 0; q--) if (parts[q].length === 1 && parts[q - 1].length < 4) { parts[q - 1] = parts[q - 1].concat(parts[q]); parts.splice(q, 1); }
    var total = parts.reduce(function (s, p) { return s + p.join(" ").length; }, 0), t0 = l.start, span = l.end - l.start;
    parts.forEach(function (p, k) { var len = p.join(" ").length, a = t0; t0 += span * len / total;
      var html = p.map(function (w) { var bare = w; return (KEY[i] || []).indexOf(bare) >= 0 ? "<b>" + w.replace(/[…،.]$/, "") + "</b>" + (w.match(/[…،.]$/) || [""])[0] : w; }).join(" ");
      chunks.push({ a: a - .08, b: k === parts.length - 1 ? (ci + 1 < LNC.length ? Math.min(l.end + .5, LNC[ci + 1].start - .05) : l.end + 1) : t0 - .02, html: html, line: i }); });
  });
  var capEl = document.getElementById("cap"), capBox = document.getElementById("capbox"), lastCap = -1;

  // ── cards ─────────────────────────────────────────────────
  var cardEl = document.getElementById("card"), img = document.getElementById("cimg"), tagEl = document.getElementById("ctag"), lastSrc = "";
  var fadeEl = document.getElementById("fade"), glEl = document.getElementById("gl"), askEl = document.getElementById("ask");

  window.renderAt = function (t) {
    camera(t);
    W.lamps.forEach(function (g, i) { g.rotation.z = Math.sin(t * 1.1 + i * .7) * .012; });
    W.flames.forEach(function (f, i) { f.material.emissiveIntensity = 1.2 + .15 * Math.sin(t * 5 + i * 1.7); });
    if (censer.g.visible) {   // the smoke rises from the censer the man carries
      var fr = PROPS.sprites.censer[0], lid = fr.j.wrist; var right = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0); right.y = 0; right.normalize();
      var lx = (lid[0] + 10) * .00415 * (censer.o.flip ? -1 : 1), ly = (lid[1] - 18) * -.00415 + (212 * .00415);
      C.smokeAt = [censer.g.position.x + right.x * lx, ly, censer.g.position.z + right.z * lx];
    }
    PROPS.update(t, cam);
    R.render(W.scene, cam);
    // card
    var card = null; for (var c = 0; c < CARDS.length; c++) if (t >= (CARDS[c].a < .5 ? 0 : CARDS[c].a - .05) && t <= CARDS[c].b + .3) { card = CARDS[c]; break; }
    var k = 0, p = Promise.resolve();
    if (card) { k = (card.a < .5 ? 1 : clamp((t - card.a) / .35)) * clamp((card.b + .3 - t) / .3);   // the first card is already up on frame one
      var fi = card.photo ? 1 : Math.min(card.n, Math.max(1, 1 + Math.floor((t - card.a) * 30))), src = "frames/" + card.id + "/" + String(fi).padStart(4, "0") + ".jpg";
      if (src !== lastSrc) { img.src = src; lastSrc = src; p = img.decode().catch(function () {}); }
      tagEl.textContent = card.tag;
      var zoom = card.photo ? 1 + .05 * clamp((t - card.a) / (card.b - card.a)) : 1; img.style.transform = "scale(" + zoom.toFixed(4) + ")";
    }
    cardEl.style.opacity = k.toFixed(3); cardEl.style.transform = "translateY(" + ((1 - eout(k)) * 18).toFixed(1) + "px) scale(" + (.94 + .06 * eout(k)).toFixed(4) + ")";
    glEl.style.filter = k > 0 ? "blur(" + (3.5 * k).toFixed(2) + "px) brightness(" + (1 - .18 * k).toFixed(3) + ")" : "none"; glEl.style.transform = k > 0 ? "scale(" + (1 + .05 * k).toFixed(4) + ")" : "none";
    // captions sit lower when a card is up
    if (chunks[0].a < .5) chunks[0].a = 0;   // the hook caption is up on frame one
    var ch = null; for (var q = 0; q < chunks.length; q++) if (t >= chunks[q].a && t < chunks[q].b) { ch = chunks[q]; break; }
    if (ch && ch !== lastCap) { capEl.innerHTML = ch.html; lastCap = ch; }
    var ca = ch ? (ch.a === 0 ? 1 : clamp((t - ch.a) / .12)) : 0; capEl.style.opacity = ca.toFixed(3); capEl.style.transform = "translateY(" + ((1 - eout(ca)) * 6).toFixed(1) + "px)";
    capBox.className = "cap" + (k > .01 ? " low" : "");
    // 3D labels
    LABS.forEach(function (b) { var a = win(t, b.t[0], b.t[1], .3); if (a <= 0) { b.el.style.opacity = 0; return; }
      vtmp.set(b.at[0], b.at[1], b.at[2]).project(cam); if (vtmp.z > 1) { b.el.style.opacity = 0; return; }
      b.el.style.left = ((vtmp.x + 1) / 2 * 360).toFixed(1) + "px"; b.el.style.top = ((1 - vtmp.y) / 2 * 640 - 6).toFixed(1) + "px"; b.el.style.opacity = (a * (1 - k)).toFixed(3); });
    HUD.forEach(function (h) { h.items.forEach(function (it, j) { var a = win(t, h.t[0] + j * (h.stag || 0), h.t[1], .3); it.style.opacity = a.toFixed(3); it.style.transform = "translateY(" + ((1 - eout(a)) * 10).toFixed(1) + "px) scale(" + (.9 + .1 * eout(a)).toFixed(3) + ")"; }); });
    var ak = clamp((t - L(35) + .1) / .4); askEl.style.opacity = ak.toFixed(3); askEl.style.transform = "scale(" + (.92 + .08 * eout(ak)).toFixed(3) + ")";
    fadeEl.style.opacity = Math.max(dark, clamp((t - END + .6) / .6)).toFixed(3);
    return p;
  };
})();
