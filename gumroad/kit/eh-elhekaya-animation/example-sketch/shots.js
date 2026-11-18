// «ليه السما لونها أزرق؟» بستايل السكتش — اللوحة 640×800
// السطر 0 = كارت البداية (intro)، السطر 24 = كارت الملخص (outro)، والمشاهد من 1 لـ23.
var VIOLET = "#6a5a9a", RED = "#b8432c";
var RAINBOW = [RED, ORANGE, "#d9a23a", OLIVE, BLUE, "#3d4f86", VIOLET];
function prismS(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shape("M0 -90 L80 50 L-80 50 Z", "url(#glass)", true) + '</g>'; }
function molecule(x, y, t, s) { s = s || 1; var j = Math.sin(t * 5 + x) * 2; return '<g transform="translate(' + f(x + j) + ' ' + f(y - j) + ') scale(' + s + ')">' + circle(-9, 0, 12, BONE) + circle(9, 0, 12, BONE) + '</g>'; }
function eyeS(x, y, t, s) { var lk = Math.sin(t) * 6; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shape("M-90 0 Q0 -66 90 0 Q0 66 -90 0 Z", BONE) + circle(lk, 0, 30, BLUE, true) + circle(lk, 0, 13, INK) + '</g>'; }
function horizon(y, col) { return '<rect x="-600" y="' + y + '" width="1840" height="1200" fill="' + (col || "#c9bf9f") + '"/><rect x="-600" y="' + y + '" width="1840" height="1200" fill="url(#hatch)"/><path d="M-600 ' + y + ' H1240" stroke="' + INK + '" stroke-width="2"/>'; }
function skyBand(col, op) { return '<rect x="-600" y="-600" width="1840" height="1100" fill="' + col + '" opacity="' + (op || 0.55) + '"/>'; }
function cloudS(x, y, s) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (s || 1) + ')">' + shape("M-150 40 C-190 40 -190 -20 -140 -24 C-140 -80 -60 -90 -40 -50 C-20 -110 80 -100 80 -40 C140 -60 180 0 140 40 Z", "#fbf8ef") + '</g>'; }
function mountainS(x, y) { return shape("M" + (x - 300) + " " + y + " L" + (x - 80) + " " + (y - 330) + " L" + x + " " + (y - 250) + " L" + (x + 110) + " " + (y - 380) + " L" + (x + 320) + " " + y + " Z", PUTTY, true); }

// ── كارت البداية: السما فوق خط الأفق، ودايرة حمرا حوالين الزرقة
intro(function (t) {
  return dark("#1b2a3a") + '<rect x="0" y="0" width="580" height="230" fill="' + BLUE + '" opacity=".85"/><rect x="0" y="0" width="580" height="230" fill="url(#hatchW)"/>' + sunS(470, 70, 28, t) + '<rect x="0" y="230" width="580" height="90" fill="#3a3a32"/>' + figure(160, 300, 0.75, t, PUTTY) + ring(300, 110, 70, t, ease(t / 1.4));
});

// 1 — نور الشمس أبيض، وفيه ألوان قوس قزح
shot(1, camPush(320, 400, 1, 1.08), function (u, d, t) {
  var s = paper() + sunS(110, 200, 55, t) + '<path d="M150 230 L300 380" stroke="#fff3c8" stroke-width="16"/><path d="M150 230 L300 380" stroke="' + INK + '" stroke-width="1.5" fill="none"/>' + prismS(330, 400, 1.1);
  for (var i = 0; i < RAINBOW.length; i++) s += arrow(350, 400, 600, 330 + i * 34, RAINBOW[i], 4, ease((u - 0.6) / 1.2));
  return s + label(200, 290, 120, 470, "نور أبيض", BLUE, ease((u - 0.3) / 0.8)) + label(560, 470, 470, 600, "ألوان قوس قزح", ORANGE, ease((u - 1.6) / 0.8));
});
// 2 — كل الألوان ماشية في نفس الشعاع
shot(2, camPan(260, 380, 400, 1.05), function (u, d, t) {
  var s = paper() + sunS(40, 400, 50, t);
  for (var i = 0; i < RAINBOW.length; i++) s += waveRay(100, 280 + i * 40, 640, 280 + i * 40, t + i * 0.3, RAINBOW[i], 8, 46 + i * 4, ease((u - i * 0.15) / 1.2));
  return s + numBox("7 ألوان", 360, 620, (u - 1.2) / 1);
});
// 3 — إيه الحكاية؟
shot(3, camPush(320, 400, 1, 1.12), function (u, d, t) {
  return paper() + ring(320, 380, 140, t, ease(u / 1)) + T("؟", 320, 450, 220, ORANGE, 900) + dots(t, 100, 600, 440, 60, 20, BLUE);
});
// 4 — النور بيدخل الجو ويقابل جزيئات الهوا
shot(4, camMove([300, 380, 1.0], [360, 430, 1.15]), function (u, d, t) {
  var s = paper() + '<rect x="-600" y="300" width="1840" height="1000" fill="#c8d6df" opacity=".6"/><path d="M-600 300 H1240" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="8 6"/>' + sunS(80, 120, 40, t) + arrow(110, 150, 330, 430, "#d9a23a", 6, ease(u / 1.2));
  for (var i = 0; i < 14; i++) s += molecule(200 + hash(i) * 400, 360 + hash(i + 5) * 330, t, 0.8);
  return s + label(380, 520, 520, 650, "جزيئات الهوا", OLIVE, ease((u - 1) / 0.8)) + T("الجو", 70, 340, 22, GREY, 700);
});
// 5 — الجزيئات بتشتّت النور لكل ناحية
shot(5, camPush(320, 400, 1.05, 1.18), function (u, d, t) {
  var s = paper() + arrow(-60, 250, 260, 380, "#d9a23a", 6, 1) + molecule(320, 400, t, 2);
  for (var i = 0; i < 10; i++) { var a = i / 10 * 6.283 + 0.3, k = ((t * 0.8 + i / 10) % 1); s += arrow(320 + Math.cos(a) * 50, 400 + Math.sin(a) * 50, 320 + Math.cos(a) * (90 + 170 * k), 400 + Math.sin(a) * (90 + 170 * k), BLUE, 3, 1); }
  return s + label(340, 380, 500, 160, "بيتشتت في كل حتة", ORANGE, ease((u - 0.8) / 0.8));
});
// 6 — الأزرق موجته قصيرة
shot(6, camPan(280, 360, 400, 1.05), function (u, d, t) {
  return paper() + waveRay(40, 360, 600, 360, t, BLUE, 26, 40, ease(u / 1.2), 5) + numBox("~450 nm", 320, 520, (u - 1) / 1) + label(200, 340, 140, 200, "موجة قصيرة", BLUE, ease((u - 0.6) / 0.8)) + dots(t, 480, 280, 140, 160, 14, BLUE, 30);
});
// 7 — الأحمر موجته طويلة
shot(7, camPan(360, 280, 400, 1.05), function (u, d, t) {
  return paper() + waveRay(40, 380, 600, 380, t, RED, 30, 170, ease(u / 1.2), 5) + arrow(560, 470, 630, 470, RED, 4, ease((u - 1) / 0.8)) + numBox("~700 nm", 320, 560, (u - 1) / 1) + label(260, 360, 160, 220, "موجة طويلة", RED, ease((u - 0.6) / 0.8));
});
// 8 — الأزرق المتشتت جاي لعينك من كل ناحية
shot(8, camPush(320, 420, 1, 1.1), function (u, d, t) {
  var s = paper() + skyBand(BLUE, 0.25) + horizon(620) + figure(320, 620, 1, t);
  for (var i = 0; i < 7; i++) { var a = -2.9 + i * 0.4, k = ((t * 0.6 + i / 7) % 1); s += arrow(320 + Math.cos(a) * 300, 460 + Math.sin(a) * 300, 320 + Math.cos(a) * (300 - 230 * k), 460 + Math.sin(a) * (300 - 230 * k), BLUE, 3, 1); }
  return s + label(330, 470, 470, 560, "عينك", OLIVE, ease((u - 0.8) / 0.8));
});
// 9 — وعشان كده السما زرقا
shot(9, camMove([320, 440, 1.1], [320, 380, 0.95]), function (u, d, t) {
  return paper() + skyBand(BLUE, 0.7) + '<rect x="-600" y="-600" width="1840" height="1100" fill="url(#hatchW)"/>' + sunS(500, 160, 36, t) + horizon(560) + callout("✓", 320, 300, (u - 0.6) / 0.8) + T("السما زرقا", 320, 380, 44, "#fff", 900);
});
// 10 — طب والبنفسجي؟
shot(10, camPan(280, 360, 400, 1.05), function (u, d, t) {
  return paper() + waveRay(40, 360, 600, 360, t, VIOLET, 22, 32, ease(u / 1.2), 5) + T("؟", 520, 560, 140, ORANGE, 900) + label(200, 345, 140, 200, "بنفسجي", VIOLET, ease((u - 0.6) / 0.8)) + dots(t, 420, 230, 180, 100, 16, VIOLET, 30);
});
// 11 — الشمس بتبعت بنفسجي أقل، والعين مش حساسة له
shot(11, camPush(320, 400, 1, 1.08), function (u, d, t) {
  var k = ease((u - 0.5) / 1.5);
  return paper() + eyeS(320, 250, t, 1.2) + T("الأزرق", 520, 450, 24, BLUE, 800) + R(120, 430, 320 * k, 34, BLUE, 2) + T("البنفسجي", 520, 530, 24, VIOLET, 800) + R(120, 510, 120 * k, 34, VIOLET, 2) + T("قد إيه العين حساسة", 320, 620, 22, GREY, 700);
});
// 12 — المخ بيكمّل الصورة بالأزرق
shot(12, camPush(320, 420, 1.05, 1.15), function (u, d, t) {
  return paper() + figure(250, 640, 1.2, t) + inset(440, 300, 120, '<rect x="-130" y="-130" width="260" height="260" fill="' + BLUE + '" opacity=".75"/><rect x="-130" y="-130" width="260" height="260" fill="url(#hatchW)"/>' + T("أزرق", 0, 12, 40, "#fff", 900), (u - 0.5) / 0.8) + label(250, 460, 120, 340, "المخ", OLIVE, ease((u - 1.2) / 0.8));
});
// 13 — ليه الشمس برتقالي وقت الغروب؟
shot(13, camMove([320, 360, 1.1], [320, 420, 0.95]), function (u, d, t) {
  return paper() + skyBand(ORANGE, 0.35) + sunS(320, 520 + u * 4, 60, t) + horizon(560, "#9a8a6a") + T("؟", 520, 300, 120, ORANGE, 900);
});
// 14 — النور بيقطع مسافة أطول في الجو
shot(14, camPan(260, 380, 420, 1.0), function (u, d, t) {
  return paper() + '<circle cx="320" cy="1100" r="640" fill="#c8d6df" opacity=".7" stroke="' + INK + '" stroke-dasharray="8 6"/>' + globe(320, 1100, 560, t * 0.2) + figure(320, 545, 0.45, t) +
    arrow(320, 120, 320, 470, "#d9a23a", 5, ease(u / 1)) + T("الضهر: مسافة قصيرة", 320, 100, 22, BLUE, 800) +
    arrow(-80, 470, 280, 520, ORANGE, 5, ease((u - 1) / 1.2)) + label(60, 490, 120, 650, "الغروب: مسافة أطول", ORANGE, ease((u - 1.8) / 0.8));
});
// 15 — الأحمر والبرتقالي بيوصلوا لعينك
shot(15, camPush(320, 420, 1, 1.1), function (u, d, t) {
  return paper() + skyBand(ORANGE, 0.3) + sunS(520, 520, 54, t) + horizon(570, "#9a8a6a") + figure(170, 570, 0.9, t) + arrows(t, 470, 500, 230, 450, 5, ORANGE, 70) + dots(t, 200, 150, 300, 200, 18, BLUE, 25) + label(300, 250, 420, 140, "الأزرق اتشتت بعيد", BLUE, ease((u - 1) / 0.8));
});
// 16 — ألوان الغروب
shot(16, camMove([300, 420, 1.1], [340, 400, 0.95]), function (u, d, t) {
  var s = paper();
  for (var i = 0; i < 4; i++) s += '<rect x="-600" y="' + (100 + i * 110) + '" width="1840" height="110" fill="' + [VIOLET, RED, ORANGE, "#d9a23a"][i] + '" opacity=".45"/>';
  return s + sunS(320, 520, 60, t) + horizon(560, "#7a6a50") + label(320, 470, 480, 300, "أحمر وبرتقالي", ORANGE, ease((u - 0.6) / 0.8));
});
// 17 — السحاب أبيض عشان قطراته كبيرة
shot(17, camPush(320, 380, 1, 1.12), function (u, d, t) {
  var drops = ""; for (var i = 0; i < 6; i++) drops += circle(-60 + (i % 3) * 60, -30 + Math.floor(i / 3) * 60 + Math.sin(t * 2 + i) * 4, 22, "#cfe0ea", true);
  return paper() + skyBand(BLUE, 0.3) + cloudS(260, 330, 1.2) + inset(470, 520, 120, drops, (u - 0.8) / 0.8) + label(470, 420, 560, 260, "قطرات كبيرة", OLIVE, ease((u - 1.4) / 0.8));
});
// 18 — القطرات بتشتت كل الألوان بنفس القدر
shot(18, camPush(320, 400, 1.05, 1.15), function (u, d, t) {
  var s = paper() + circle(320, 400, 70, "#cfe0ea", true);
  for (var i = 0; i < 14; i++) { var a = i / 14 * 6.283, k = ((t * 0.7 + i / 14) % 1); s += arrow(320 + Math.cos(a) * 80, 400 + Math.sin(a) * 80, 320 + Math.cos(a) * (110 + 150 * k), 400 + Math.sin(a) * (110 + 150 * k), RAINBOW[i % 7], 3, 1); }
  return s + numBox("كل الألوان = أبيض", 320, 700, (u - 1) / 0.8, 24);
});
// 19 — هوا نضيف = أزرق غامق
shot(19, camMove([320, 420, 1.1], [320, 380, 0.95]), function (u, d, t) {
  return paper() + skyBand("#2e4f78", 0.85) + '<rect x="-600" y="-600" width="1840" height="1100" fill="url(#hatchW)"/>' + horizon(560) + T("أزرق غامق", 320, 300, 46, "#fff", 900) + dots(t, 60, 120, 520, 120, 8, "#fff", 10);
});
// 20 — فوق الجبال الهوا أرق
shot(20, camMove([320, 500, 1.0], [320, 330, 1.05]), function (u, d, t) {
  return paper() + skyBand("#2e4f78", 0.75) + mountainS(320, 700) + figure(430, 322, 0.35, t) + dots(t, 0, 520, 640, 160, 30, BLUE, 15) + dots(t, 0, 80, 640, 160, 6, BLUE, 15) + label(560, 220, 470, 110, "هوا أرق", OLIVE, ease((u - 0.8) / 0.8));
});
// 21 — في الفضا: سما سودا وشمس بيضا
shot(21, camPush(320, 400, 1, 1.1), function (u, d, t) {
  return dark("#0d0d0d") + dots(t, 0, 0, 640, 800, 40, "#fff", 2) + circle(470, 230, 46, "#ffffff") + globe(220, 520, 150, t) + label(470, 270, 560, 380, "شمس بيضا", "#fff", ease((u - 0.8) / 0.8)) + T("سما سودا", 220, 160, 30, ORANGE, 900);
});
// 22 — اللون نتيجة تشتت الضوء في الهوا
shot(22, camPush(320, 420, 1, 1.08), function (u, d, t) {
  return dark("#0d0d0d") + '<circle cx="380" cy="480" r="215" fill="' + BLUE + '" opacity=".35"/>' + globe(380, 480, 180, t) + sunS(70, 140, 34, t) + arrow(100, 170, 260, 330, "#d9a23a", 5, ease(u / 1)) + dots(t, 230, 300, 120, 100, 14, "#9fc0dc", 20) + label(380, 270, 480, 120, "الهوا بيشتّت الضوء", ORANGE, ease((u - 1) / 0.8));
});
// 23 — المرة الجاية افتكر
shot(23, camMove([320, 440, 1.05], [320, 400, 0.92]), function (u, d, t) {
  return paper() + skyBand(BLUE, 0.45) + horizon(620) + figure(320, 620, 1.1, t) + dots(t, 60, 120, 520, 260, 26, BLUE, 25) + label(330, 440, 470, 330, "الهوا بيلوّن السما", BLUE, ease((u - 0.8) / 0.8));
});

// ── كارت الملخص: الشمس → جزيء الهوا → العين
outro(function (u, t) {
  return '<rect width="580" height="300" fill="' + PAPER + '"/>' + sunS(70, 150, 34, t) + arrow(110, 150, 230, 150, "#d9a23a", 4, ease(u / 0.8)) + molecule(280, 150, t, 1.6) + arrow(310, 140, 450, 100, BLUE, 4, ease((u - 0.6) / 0.8)) + eyeS(500, 100, t, 0.5) + callout("1", 70, 230, u / 0.6) + callout("2", 280, 230, (u - 0.4) / 0.6) + callout("3", 500, 180, (u - 0.8) / 0.6);
});
