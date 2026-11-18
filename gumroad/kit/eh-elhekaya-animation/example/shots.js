// «ليه السما لونها أزرق؟» — مشهد لكل سطر من script.txt
// ── أشكال خاصة بالفيديو ده ─────────────────────────────
var RAINBOW = ["#e8443a", "#f28c28", "#f2c230", "#5fae4a", "#3a8fd9", "#4b4fc4", "#8a4fc4"];
// شعاع نور من (x1,y1) لـ(x2,y2) بلمعة ماشية فيه
function beam(x1, y1, x2, y2, t, col, w) {
  col = col || "#fff8e0"; w = w || 18; var k = (t * 0.8) % 1;
  return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + (w * 2) + '" opacity=".35" filter="url(#soft)" stroke-linecap="round"/>' +
    '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>' +
    '<circle cx="' + f(lerp(x1, x2, k)) + '" cy="' + f(lerp(y1, y2, k)) + '" r="' + f(w * 0.7) + '" fill="#fff" opacity=".9" filter="url(#glow)"/>';
}
// موجة جيبية بطول موجة lam بتتحرك لقدام
function wave(x, y, len, lam, amp, col, t, w) {
  var d = "", ph = t * 6;
  for (var i = 0; i <= len; i += 4) d += (i ? " L" : "M") + f(x + i) + " " + f(y + Math.sin(i / lam * 6.283 - ph) * amp);
  return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + ((w || 5) + 3) + '" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + col + '" stroke-width="' + (w || 5) + '" fill="none" stroke-linecap="round"/>';
}
// جزيئات هوا صغيرة بتترعش
function molecules(t, x, y, w, h, n, col) {
  var s = ""; n = n || 30;
  for (var i = 0; i < n; i++) { var px = x + hash(i) * w + Math.sin(t * 3 + i) * 4, py = y + hash(i + 7) * h + Math.cos(t * 2.6 + i) * 4; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="5" fill="#dfe9f2" stroke="' + INK + '" stroke-width="1.6"/><circle cx="' + f(px + 5) + '" cy="' + f(py - 2) + '" r="4" fill="#dfe9f2" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return s;
}
// شعاع بيتشتت من نقطة: نقط زرقا طالعة لكل ناحية
function scatter(x, y, t, col, n, r) {
  var s = ""; n = n || 12; r = r || 120;
  for (var i = 0; i < n; i++) { var a = i / n * 6.283 + 0.2, u = ((t * 0.9 + hash(i)) % 1); s += '<circle cx="' + f(x + Math.cos(a) * r * u) + '" cy="' + f(y + Math.sin(a) * r * u) + '" r="' + f(6 * (1 - u * 0.5)) + '" fill="' + (col || "#3a8fd9") + '" opacity="' + f(1 - u) + '"/>'; }
  return s;
}
function prism(x, y, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M0 -60 L52 30 L-52 30 Z" fill="url(#gGlass)" stroke="' + INK + '" stroke-width="3" opacity=".9"/><path d="M-8 -40 L-30 18" stroke="#fff" stroke-width="3" opacity=".6"/></g>'; }
function rainbowFan(x, y, len, t) {   // الألوان طالعة من المنشور
  var s = "";
  for (var i = 0; i < RAINBOW.length; i++) { var a = -0.18 + i * 0.06, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + RAINBOW[i] + '" stroke-width="9" stroke-linecap="round" opacity="' + f(0.75 + 0.25 * Math.sin(t * 3 + i)) + '"/>'; }
  return s;
}
function bigEye(x, y, t, s) { s = s || 1; var look = Math.sin(t * 0.9) * 8; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-90 0 Q0 -70 90 0 Q0 70 -90 0 Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="' + f(look) + '" r="34" fill="#3a8fd9" stroke="' + INK + '" stroke-width="3"/><circle cx="' + f(look) + '" r="15" fill="' + INK + '"/><circle cx="' + f(look - 10) + '" cy="-10" r="7" fill="#fff"/></g>'; }
function mountain(x, y, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><path d="M-220 0 L-40 -210 L40 -150 L120 -240 L260 0 Z" fill="#7a6a5a" stroke="' + INK + '" stroke-width="3"/><path d="M-80 -164 L-40 -210 L-10 -186 L-30 -170 Z M90 -206 L120 -240 L150 -200 L120 -190 Z" fill="#f4f1ea"/></g>'; }
function atmosphere(x, y, r, t) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 1.25 + Math.sin(t * 2) * 2) + '" fill="#7fc4ff" opacity=".35"/>' + earth(x, y, r, t); }
function cityDay(t) { return sky("day") + sun(540, 60, 26) + clouds(t, 18, 20, 5, 0.9) + birds(t, 70, 35) + city(t, 270, 110, "#b9a89a", "#fff6d0", 3) + road(t, 270, 70); }

// ── المشاهد ─────────────────────────────────────────────
// 0 — السما فوق المدينة، وواحد باصص لفوق
shot(0, camMove([300, 200, 1.15], [320, 170, 0.95]), function (u, d, t) {
  return cityDay(t) + person(220, 330, t, { mood: "curious", pose: "think", look: 1 }) + tag("ليه أزرق؟", 400, 120, u, 1.2, -3, 24);
});
// 1 — الشمس بتبعت نور أبيض، وفيه ألوان قوس قزح
shot(1, camPush(320, 180, 1, 1.1), function (u, d, t) {
  return fill("#16223b") + stars(t) + sun(90, 90, 40, "#fff3c0") + beam(120, 110, 300, 190, t) + prism(320, 200) + rainbowFan(345, 196, Math.min(260, 60 + u * 140), t) + tag("نور أبيض", 150, 250, u, 0.4, -3, 20) + tag("ألوان قوس قزح", 500, 300, u, 1.6, 3, 20, "#bfe0ff");
});
// 2 — كل الألوان جوه شعاع واحد
shot(2, camPan(260, 380, 180, 1.05), function (u, d, t) {
  var s = fill("#16223b") + stars(t) + sun(40, 180, 46, "#fff3c0");
  for (var i = 0; i < RAINBOW.length; i++) s += wave(80, 120 + i * 20, 520, 70 + i * 4, 6, RAINBOW[i], t + i * 0.2, 4);
  return s + tag("كلهم في شعاع واحد", 330, 300, u, 0.6, -2, 20);
});
// 3 — إيه الحكاية؟
shot(3, camPush(320, 180, 1, 1.15), function (u, d, t) {
  return sky("day") + clouds(t, 30, 40, 5, 0.9) + qmark(320, 220, t, 150) + sparkle(320, 160, t) + tag("إيه الحكاية؟", 320, 300, u, 0.3, -2, 26);
});
// 4 — النور بيدخل الجو ويقابل جزيئات الهوا
shot(4, camMove([200, 180, 1.0], [340, 200, 1.2]), function (u, d, t) {
  return fill("#0e1a33") + stars(t) + '<rect x="-400" y="120" width="1440" height="600" fill="#7fb7e0" opacity=".35"/>' + sun(-40, 40, 40, "#fff3c0") + beam(0, 60, 260, 190, t) + molecules(t, 220, 150, 360, 170, 28) + tag("جزيئات الهوا", 420, 110, u, 0.8, 3, 20);
});
// 5 — الجزيئات بتشتّت النور لكل ناحية
shot(5, camPush(320, 190, 1.05, 1.2), function (u, d, t) {
  return fill("#7fb7e0") + beam(-100, 80, 300, 190, t) + molecules(t, 290, 170, 60, 40, 3) + scatter(320, 190, t, "#3a8fd9", 16, 200) + scatter(320, 190, t + 0.5, "#9ad0ff", 10, 160) + tag("بيتشتت في كل حتة", 320, 70, u, 0.8, -2, 20);
});
// 6 — الأزرق موجته قصيرة فبيتشتت أكتر
shot(6, camPan(280, 360, 180, 1.05), function (u, d, t) {
  return fill("#eef4f8") + wave(40, 150, 560, 34, 22, "#3a8fd9", t, 6) + scatter(560, 150, t, "#3a8fd9", 14, 110) + tag("الأزرق: موجة قصيرة", 300, 270, u, 0.5, -2, 21, "#bfe0ff");
});
// 7 — الأحمر موجته طويلة فبيعدّي
shot(7, camPan(360, 280, 180, 1.05), function (u, d, t) {
  return fill("#f8eeea") + wave(40, 160, 560, 150, 26, "#e8443a", t, 6) + arrow(520, 260, 620, 260, "#e8443a", 7, ease(u / 1.5)) + tag("الأحمر: موجة طويلة", 300, 290, u, 0.5, 2, 21);
});
// 8 — الأزرق المتشتت جاي لعينك من كل ناحية
shot(8, camPush(320, 200, 1, 1.12), function (u, d, t) {
  var s = sky("day") + clouds(t, 20, 20, 4, 0.8) + grass(t, 280);
  for (var i = 0; i < 6; i++) { var a = -2.6 + i * 0.42, k = ((t * 0.7 + i / 6) % 1); s += '<circle cx="' + f(300 + Math.cos(a) * 260 * (1 - k)) + '" cy="' + f(250 + Math.sin(a) * 260 * (1 - k)) + '" r="8" fill="#3a8fd9" stroke="' + INK + '" stroke-width="1.5" opacity="' + f(0.3 + k * 0.7) + '"/>'; }
  return s + person(300, 330, t, { mood: "happy", pose: "stand", look: 0 }) + pulse(300, 230, t, "#3a8fd9", 40);
});
// 9 — وعشان كده السما زرقا
shot(9, camMove([320, 210, 1.15], [320, 170, 0.9]), function (u, d, t) {
  return cityDay(t) + tree(80, 270, t, 0.9) + tree(570, 270, t, 1) + check(320, 120, u, 0.8, 1.6) + tag("السما زرقا!", 320, 60, u, 1.2, -3, 24);
});
// 10 — طب والبنفسجي؟ بيتشتت أكتر
shot(10, camPan(260, 380, 180, 1.05), function (u, d, t) {
  return fill("#f1ecf8") + wave(40, 140, 560, 26, 20, "#8a4fc4", t, 6) + scatter(560, 140, t, "#8a4fc4", 16, 120) + qmark(120, 300, t, 80, "#8a4fc4") + tag("بنفسجي؟", 360, 280, u, 0.6, -3, 24, "#e2d0f7");
});
// 11 — الشمس بتبعت بنفسجي أقل، والعين مش حساسة له
shot(11, camPush(320, 180, 1, 1.1), function (u, d, t) {
  var k = ease(u / 2);
  return fill("#f6f1e6") + bigEye(170, 170, t, 0.9) + label("الأزرق", 470, 120, 20) + bar(400, 132, 180, 22, 0.85 * k, "#3a8fd9") + label("البنفسجي", 470, 210, 20) + bar(400, 222, 180, 22, 0.35 * k, "#8a4fc4") + tag("العين بتحس بالأزرق أكتر", 330, 310, u, 1.4, -2, 19);
});
// 12 — المخ بيكمّل الصورة بالأزرق
shot(12, camPush(320, 190, 1.05, 1.15), function (u, d, t) {
  return sky("day") + clouds(t, 25, 30, 4, 0.9) + person(320, 330, t, { mood: "happy", pose: "point", s: 1.2 }) + sparkle(320, 180, t, "#fff", 8) + tag("المخ شايفها زرقا", 320, 70, u, 0.6, -3, 22);
});
// 13 — طب ليه الشمس برتقالي وقت الغروب؟
shot(13, camMove([320, 160, 1.1], [320, 190, 0.95]), function (u, d, t) {
  return sky("dusk") + sun(320, 230 + u * 3, 46, "#f28c28") + clouds(t, 14, 40, 4, 0.7) + birds(t, 80, 30) + city(t, 280, 90, "#5a4a44", "#ffd28a", 5) + qmark(520, 200, t, 90) + tag("الغروب؟", 160, 90, u, 0.6, -3, 24);
});
// 14 — النور بيقطع مسافة أطول في الجو
shot(14, camPan(260, 380, 200, 1.0), function (u, d, t) {
  return fill("#0e1a33") + stars(t) + '<circle cx="320" cy="760" r="520" fill="#7fc4ff" opacity=".35"/><circle cx="320" cy="760" r="470" fill="#2f86c8" stroke="' + INK + '" stroke-width="3"/>' + sun(-60, 230, 44, "#fff3c0") + beam(-20, 240, 600, 280, t, "#ffd28a", 12) + scatter(260, 262, t, "#3a8fd9", 10, 90) + person(600, 300, t, { s: 0.45, mood: "curious" }) + tag("مسافة أطول", 300, 120, u, 0.8, -2, 22);
});
// 15 — الأحمر والبرتقالي بيوصلوا لعينك
shot(15, camPush(320, 190, 1, 1.1), function (u, d, t) {
  return sky("dusk") + sun(470, 250, 50, "#e8443a") + clouds(t, 12, 60, 4, 0.6) + grass(t, 280, "dusk") + person(200, 330, t, { mood: "happy", look: 1 }) + arrow(430, 250, 250, 220, "#f28c28", 7, ease(u / 1.6)) + tag("الألوان الدافية", 330, 90, u, 1.0, -3, 22);
});
// 16 — ألوان الغروب
shot(16, camMove([300, 200, 1.1], [340, 180, 0.95]), function (u, d, t) {
  return sky("dusk") + sun(320, 260, 54, "#e8443a") + sea(t, 270) + birds(t, 90, 30) + sparkle(320, 250, t, "#ffd28a", 7) + tag("أحمر وبرتقالي", 320, 80, u, 0.6, -3, 22);
});
// 17 — السحاب أبيض عشان قطراته كبيرة
shot(17, camPush(320, 170, 1, 1.15), function (u, d, t) {
  var s = sky("day") + '<g filter="url(#soft2)"><ellipse cx="320" cy="170" rx="210" ry="80" fill="#fff"/><ellipse cx="240" cy="130" rx="100" ry="70" fill="#fff"/><ellipse cx="400" cy="130" rx="110" ry="80" fill="#fff"/></g>';
  for (var i = 0; i < 7; i++) s += '<circle cx="' + f(220 + i * 32) + '" cy="' + f(170 + Math.sin(t * 2 + i) * 6) + '" r="10" fill="#bfe0ff" stroke="' + INK + '" stroke-width="2"/>';
  return s + tag("قطرات ميّة كبيرة", 320, 300, u, 0.8, -2, 21);
});
// 18 — القطرات بتشتت كل الألوان بنفس القدر
shot(18, camPush(320, 180, 1.05, 1.15), function (u, d, t) {
  var s = fill("#eef4f8") + '<circle cx="320" cy="180" r="56" fill="#bfe0ff" stroke="' + INK + '" stroke-width="3"/>';
  for (var i = 0; i < RAINBOW.length; i++) s += scatter(320, 180, t + i * 0.13, RAINBOW[i], 6, 170);
  return s + tag("كل الألوان = أبيض", 320, 320, u, 0.8, -2, 21);
});
// 19 — هوا نضيف = أزرق غامق
shot(19, camMove([320, 200, 1.1], [320, 160, 0.95]), function (u, d, t) {
  return '<rect x="-400" y="-300" width="1440" height="960" fill="#2f6fb8"/>' + clouds(t, 10, 20, 2, 0.5) + birds(t, 90, 30) + grass(t, 280) + tree(140, 280, t) + tag("أزرق غامق", 420, 120, u, 0.6, -3, 24, "#bfe0ff");
});
// 20 — فوق الجبل الهوا أرق والسما أغمق
shot(20, camMove([320, 240, 1.0], [320, 140, 1.05]), function (u, d, t) {
  return '<rect x="-400" y="-300" width="1440" height="960" fill="#1f4f94"/>' + '<g opacity=".35">' + stars(t) + '</g>' + clouds(t, 12, 220, 4, 0.8) + mountain(320, 330) + person(440, 98, t, { s: 0.45, mood: "shock", hat: "cap" }) + tag("الهوا أرق", 140, 80, u, 0.8, -3, 22);
});
// 21 — في الفضا مفيش هوا: السما سودا والشمس بيضا
shot(21, camPush(320, 180, 1, 1.12), function (u, d, t) {
  return fill("#04060c") + stars(t) + sun(480, 120, 34, "#ffffff") + earth(200, 240, 90, t) + tag("سما سودا", 200, 90, u, 0.6, -3, 22) + tag("شمس بيضا", 480, 220, u, 1.6, 3, 20, "#fff");
});
// 22 — اللون نتيجة تشتت الضوء في الهوا
shot(22, camPush(320, 180, 1, 1.1), function (u, d, t) {
  return fill("#04060c") + stars(t) + sun(70, 80, 30, "#fff3c0") + atmosphere(380, 210, 110, t) + beam(90, 95, 300, 160, t) + scatter(300, 160, t, "#3a8fd9", 12, 90) + tag("الهوا بيشتّت الضوء", 380, 50, u, 0.8, -2, 20);
});
// 23 — المرة الجاية افتكر
shot(23, camMove([320, 190, 1.05], [320, 170, 0.92]), function (u, d, t) {
  return cityDay(t) + person(320, 330, t, { mood: "happy", pose: "point", look: 1 }) + scatter(450, 80, t, "#3a8fd9", 10, 90) + tag("الهوا بيلوّنها", 450, 170, u, 1.0, 3, 20);
});
// 24 — قولولنا
shot(24, camPush(320, 190, 1, 1.12), function (u, d, t) {
  return sky("day") + clouds(t, 25, 40, 5, 0.9) + grass(t, 280) + person(240, 330, t, { mood: "happy", pose: "wave" }) + bubble(420, 150, "حكاية إيه الجاية؟", u, 0.5, 20) + tag("قولولنا!", 420, 260, u, 1.2, 3, 26);
});
