/* مكتبة الرسم: كل دالة بترجع نص SVG. اللوحة (panel) مقاسها 640×360 وحدة.
   build.py بيحط الملف ده + shots.js بتاع الفيديو جوه دالة واحدة، فكل الدوال هنا متاحة في shots.js مباشرة.
   شرح كل دالة ومثال ليها في API.md. */

// ── أدوات حسابية ─────────────────────────────────────────
var LN = window.TIMING.lines;
function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }   // بداية السطر i بالثواني
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, k) { return a + (b - a) * k; }
function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.15 * ease(u / 0.22); if (u < 0.36) return lerp(1.15, 1, (u - 0.22) / 0.14); return 1; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function f(n) { return (+n).toFixed(1); }
var INK = "#1c1c1c";

// ── خلفيات ───────────────────────────────────────────────
function fill(col) { return '<rect x="-400" y="-300" width="1440" height="960" fill="' + col + '"/>'; }
function sky(kind) { return '<rect x="-400" y="-300" width="1440" height="960" fill="url(#sky-' + (kind || "day") + ')"/>'; }   // day | dusk | night | dawn
function sun(x, y, r, col) { col = col || "#f7d24a"; return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.8) + '" fill="' + col + '" opacity=".45" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>'; }
function moon(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="34" fill="#f2efe0" opacity=".22" filter="url(#soft)"/><circle cx="' + x + '" cy="' + y + '" r="20" fill="#f4f1e4"/><circle cx="' + (x + 8) + '" cy="' + (y - 6) + '" r="18" fill="#1a2c4c"/>'; }
function clouds(t, speed, y, n, op, sc) {
  var s = "", W = 1100; sc = sc || 1;
  for (var i = 0; i < n; i++) {
    var x = ((hash(i + y) * W + t * speed) % W) - 230, yy = y + hash(i * 3 + y) * 40, w = (60 + hash(i * 7) * 70) * sc;
    s += '<g filter="url(#soft)" fill="#fff" opacity="' + op + '"><ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="' + f(w) + '" ry="' + f(w * 0.22) + '"/><ellipse cx="' + f(x + w * 0.3) + '" cy="' + f(yy - w * 0.12) + '" rx="' + f(w * 0.5) + '" ry="' + f(w * 0.28) + '"/></g>';
  }
  return s;
}
function stars(t) { var s = ""; for (var i = 0; i < 60; i++) { var tw = 0.35 + 0.6 * Math.abs(Math.sin(t * (0.8 + hash(i) * 2) + i)); s += '<circle cx="' + f(-200 + hash(i) * 1040) + '" cy="' + f(-120 + hash(i + 9) * 300) + '" r="' + f(0.6 + hash(i + 4) * 1.2) + '" fill="#fff" opacity="' + tw.toFixed(2) + '"/>'; } return s; }
function birds(t, y0, sp) { var s = ""; for (var i = 0; i < 4; i++) { var x = ((t * (sp || 40) + i * 90 + hash(i) * 60) % 1000) - 200, y = y0 + i * 9 + Math.sin(t * 2 + i) * 4, w = Math.sin(t * 9 + i * 2) * 4; s += '<path d="M' + f(x - 7) + ' ' + f(y - w) + ' Q' + f(x - 3) + ' ' + f(y - 2) + ' ' + f(x) + ' ' + f(y) + ' Q' + f(x + 3) + ' ' + f(y - 2) + ' ' + f(x + 7) + ' ' + f(y - w) + '" stroke="#3a3530" stroke-width="1.4" fill="none"/>'; } return s; }
// صف مباني، والشبابيك بتنور وتطفي
function city(t, y, h, col, win, seed, night) {
  var s = '<path d="M-400 ' + (y + 400) + ' V' + y, x = -400, rects = ""; seed = seed || 1;
  while (x < 1040) { var w = 30 + hash(x + seed) * 50, hh = h * (0.4 + hash(x * 1.7 + seed) * 0.6); s += " V" + f(y - hh) + " H" + f(x + w) + " V" + y;
    if (win) for (var wy = y - hh + 8; wy < y - 6; wy += 13) for (var wx = x + 6; wx < x + w - 8; wx += 12) { var k = Math.floor(wx * 3 + wy * 7 + seed), on = hash(k + Math.floor(t * 0.7 + hash(k) * 5)) > (night ? 0.45 : 0.75); if (on) rects += '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="5" height="7" fill="' + win + '" opacity="' + (night ? 0.85 : 0.6) + '"/>'; }
    x += w; }
  return s + " H1040 V" + (y + 400) + ' Z" fill="' + (col || "#9a8f86") + '"/>' + rects;
}
function grass(t, y, kind) {   // kind: day | dusk | night | dawn
  kind = kind || "day"; var col2 = { day: "#5f8a3c", dusk: "#6f6a34", night: "#1e3826", dawn: "#4f5f30" }[kind];
  var s = '<rect x="-400" y="' + y + '" width="1440" height="400" fill="url(#grass-' + kind + ')"/>';
  for (var i = 0; i < 90; i++) { var x = -300 + i * 13 + hash(i) * 8, sw = Math.sin(t * 2.2 + i * 0.7) * 3, yy = y + 6 + hash(i + 2) * 60; s += '<path d="M' + f(x) + ' ' + f(yy) + ' q' + f(sw) + ' -6 ' + f(sw * 1.6) + ' -10" stroke="' + col2 + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }
  return s;
}
function road(t, y, sp) {   // شارع بخطوط بتتحرك وعربيات رايحة جاية
  var s = '<rect x="-400" y="' + y + '" width="1440" height="60" fill="url(#road)"/>', off = (t * (sp || 80)) % 60;
  for (var x = -400; x < 1060; x += 60) s += '<rect x="' + f(x - off) + '" y="' + (y + 28) + '" width="30" height="4" fill="#f2e6c8" opacity=".8"/>';
  return s + cars(t, y + 22, sp || 80);
}
function cars(t, y, sp) { var s = ""; for (var i = 0; i < 5; i++) { var x = ((t * sp * (i % 2 ? 1 : -0.8) + i * 230) % 1300 + 1300) % 1300 - 330; s += car(x, y, ["#2f6f9f", "#e2b035", "#8f2618", "#f4f1e8", "#4f8f5a"][i], 1); } return s; }
function car(x, y, col, sc) { return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (sc || 1) + ')"><rect x="-14" y="-8" width="28" height="9" rx="3" fill="' + col + '" stroke="' + INK + '"/><rect x="-8" y="-13" width="15" height="6" rx="2" fill="#cfe1ec" stroke="' + INK + '"/><circle cx="-8" cy="2" r="3" fill="' + INK + '"/><circle cx="8" cy="2" r="3" fill="' + INK + '"/></g>'; }
function room(t, wall, floor) {   // أوضة: حيطة وأرضية وشباك فيه سحاب بيتحرك
  var s = fill(wall || "#efe2c8") + '<rect x="-400" y="250" width="1440" height="400" fill="' + (floor || "#b98d62") + '"/><path d="M-400 250 H1040" stroke="' + INK + '" stroke-width="3"/>';
  s += '<g><rect x="430" y="40" width="150" height="110" rx="6" fill="url(#sky-day)" stroke="' + INK + '" stroke-width="4"/>' + '<g clip-path="url(#win)">' + clouds(t, 20, 60, 2, 0.9, 0.5) + '</g><path d="M505 40 V150 M430 95 H580" stroke="' + INK + '" stroke-width="3"/></g>';
  return s;
}
function sea(t, y0) {   // بحر بموج متحرك من سطح y0 لتحت
  var d = "M-400 " + y0; for (var x = -400; x <= 1040; x += 20) d += " L" + x + " " + f(y0 + Math.sin(x * 0.04 + t * 2.2) * 4 + Math.sin(x * 0.11 - t * 3) * 2);
  return '<rect x="-400" y="' + y0 + '" width="1440" height="700" fill="url(#sea)"/><path d="' + d + ' V' + (y0 + 20) + ' H-400 Z" fill="#8fd0ee" opacity=".7"/>';
}

// ── الشخصيات ─────────────────────────────────────────────
// mood: n | happy | shock | dizzy | curious | worry
function eyes(mood, t, r) {
  var blink = ((t * 0.55 + 0.3) % 1) < 0.05, k = r / 13, s = "";
  if (blink && mood !== "dizzy" && mood !== "shock") return '<path d="M' + f(-6 * k) + ' 0 h' + f(4 * k) + ' M' + f(2 * k) + ' 0 h' + f(4 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
  if (mood === "happy") return '<path d="M' + f(-7 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0 M' + f(1 * k) + ' ' + f(1 * k) + ' q' + f(3 * k) + ' ' + f(-5 * k) + ' ' + f(6 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.8 * k) + '" fill="none" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(6 * k) + ' q' + f(4 * k) + ' ' + f(4 * k) + ' ' + f(8 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.6 * k) + '" fill="none"/>';
  if (mood === "shock") return '<circle cx="' + f(-4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="' + INK + '" stroke-width="' + f(1.4 * k) + '"/><circle cx="' + f(4 * k) + '" cy="' + f(-1 * k) + '" r="' + f(2.6 * k) + '" fill="#fff" stroke="' + INK + '" stroke-width="' + f(1.4 * k) + '"/><ellipse cx="0" cy="' + f(7 * k) + '" rx="' + f(2.4 * k) + '" ry="' + f(3.2 * k) + '" fill="' + INK + '"/>';
  if (mood === "dizzy") { for (var e = -1; e <= 1; e += 2) { var p = "M" + f(e * 4 * k) + " " + f(-1 * k); for (var a = 0; a < 12; a++) { var ang = a * 0.9 + t * 8 * e, rr = a * 0.28 * k; p += " L" + f(e * 4 * k + Math.cos(ang) * rr) + " " + f(-1 * k + Math.sin(ang) * rr); } s += '<path d="' + p + '" stroke="' + INK + '" stroke-width="' + f(1.1 * k) + '" fill="none"/>'; } return s + '<path d="M' + f(-4 * k) + ' ' + f(7 * k) + ' q' + f(2 * k) + ' ' + f(-2 * k) + ' ' + f(4 * k) + ' 0 q' + f(2 * k) + ' ' + f(2 * k) + ' ' + f(4 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.4 * k) + '" fill="none"/>'; }
  if (mood === "curious") return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-4 * k) + ' v' + f(6 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(1 * k) + ' ' + f(-9 * k) + ' l' + f(6 * k) + ' ' + f(-2 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.4 * k) + '" stroke-linecap="round"/>';
  if (mood === "worry") return '<path d="M' + f(-4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + ' M' + f(4 * k) + ' ' + f(-2 * k) + ' v' + f(4 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/><path d="M' + f(-7 * k) + ' ' + f(-7 * k) + ' l' + f(5 * k) + ' ' + f(2 * k) + ' M' + f(7 * k) + ' ' + f(-7 * k) + ' l' + f(-5 * k) + ' ' + f(2 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.3 * k) + '" stroke-linecap="round"/><path d="M' + f(-4 * k) + ' ' + f(8 * k) + ' q' + f(4 * k) + ' ' + f(-3 * k) + ' ' + f(8 * k) + ' 0" stroke="' + INK + '" stroke-width="' + f(1.4 * k) + '" fill="none"/>';
  return '<path d="M' + f(-4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + ' M' + f(4 * k) + ' ' + f(-3 * k) + ' v' + f(5 * k) + '" stroke="' + INK + '" stroke-width="' + f(1.8 * k) + '" stroke-linecap="round"/>';
}
// راس كورة بيضا بتعبير: look من -1 (شمال) لـ1 (يمين)
function head(x, y, r, mood, t, look) { return '<g transform="translate(' + f(x + (look || 0) * r * 0.12) + ' ' + f(y) + ')"><circle r="' + r + '" fill="#fbfbf7" stroke="' + INK + '" stroke-width="' + f(r / 8) + '"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.4) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity=".8"/><g transform="translate(' + f((look || 0) * r * 0.2) + ' 0)">' + eyes(mood, t, r) + '</g></g>'; }
// شخص واقف (رجليه عند y): o = {mood, s: الحجم, shirt: لون, pose: "stand"|"point"|"wave"|"think"|"cheer", look, hat: "hard"|"cap"|null}
function person(x, y, t, o) {
  o = o || {}; var sc = o.s || 1, sh = o.shirt || "#3f6f8f", bob = Math.sin(t * 3.1 + x) * 1.5, s = '<g transform="translate(' + f(x) + ' ' + f(y + bob) + ') scale(' + sc + ')">';
  s += '<path d="M-10 0 L-8 -34 M10 0 L8 -34" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>';
  s += '<path d="M-22 -34 C-24 -70 -14 -80 0 -80 C14 -80 24 -70 22 -34 Z" fill="' + sh + '" stroke="' + INK + '" stroke-width="2.5"/>';
  var p = o.pose || "stand", w = Math.sin(t * 6) * 18, arm = function (sx, ex, ey) { return '<path d="M' + sx + ' -70 Q' + f((sx + ex) / 2) + ' ' + f((-70 + ey) / 2 + 6) + ' ' + f(ex) + ' ' + f(ey) + '" stroke="' + sh + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="' + f(ex) + '" cy="' + f(ey) + '" r="5" fill="#fbfbf7" stroke="' + INK + '" stroke-width="1.6"/>'; };
  if (p === "point") s += arm(-16, -30, -40) + arm(16, 52, -78 + Math.sin(t * 2) * 3);
  else if (p === "wave") s += arm(-16, -30, -40) + arm(16, 36 + w * 0.3, -104 + Math.abs(w) * 0.2);
  else if (p === "think") s += arm(-16, -30, -40) + arm(16, 6, -92);
  else if (p === "cheer") s += arm(-16, -34 - w * 0.2, -112) + arm(16, 34 + w * 0.2, -112);
  else s += arm(-16, -26, -38) + arm(16, 26, -38);
  s += head(0, -100, 22, o.mood || "n", t, o.look);
  if (o.hat === "hard") s += '<path d="M-24 -110 C-24 -136 24 -136 24 -110 Z" fill="#f2c230" stroke="' + INK + '" stroke-width="2.4"/><rect x="-28" y="-112" width="56" height="6" rx="3" fill="#e2b035" stroke="' + INK + '" stroke-width="2"/>';
  if (o.hat === "cap") s += '<path d="M-20 -112 C-20 -132 20 -132 20 -112 Z" fill="#c23a26" stroke="' + INK + '" stroke-width="2.4"/><path d="M12 -114 h22" stroke="#c23a26" stroke-width="6" stroke-linecap="round"/>';
  return s + '</g>';
}
function bubble(x, y, text, u, u0, size) {   // فقاعة كلام بتطلع عند u0
  var k = pop((u - u0) / 1.0); if (k <= 0) return ""; size = size || 18; var w = text.length * size * 0.55 + 30, h = size * 2;
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(3) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-h) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(h / 2) + '" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><path d="M-8 -1 L0 14 L8 -1" fill="#fff" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-9 -2 H9" stroke="#fff" stroke-width="4"/><text x="0" y="' + f(-h / 2 + size * 0.35) + '" text-anchor="middle" class="tag" style="font-size:' + size + 'px">' + text + '</text></g>';
}

// ── علامات الشرح ─────────────────────────────────────────
// عنوان بفرشاة بيظهر بنطّة عند الثانية u0 من المشهد
function tag(text, x, y, u, u0, rot, size, col) {
  var k = pop((u - u0) / 1.2); if (k <= 0) return ""; size = size || 23; var w = text.length * size * 0.52 + 40;
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + (rot == null ? -3 : rot) + ') scale(' + k.toFixed(3) + ')"><use href="#swash" fill="' + (col || "#e8c48e") + '" transform="translate(' + f(-w / 2) + ' ' + f(-size * 1.05) + ') scale(' + f(w / 220) + ' ' + f(size * 0.072) + ')"/><text x="0" y="' + f(size * 0.35) + '" text-anchor="middle" class="tag" style="font-size:' + size + 'px">' + text + '</text></g>';
}
// سهم بيترسم لحد p (0..1)
function arrow(x1, y1, x2, y2, col, w, p) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; w = w || 6; col = col || "#f2c230";
  var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = w * 2.6;
  var hd = 'M' + f(xe + Math.cos(a) * h * 0.4) + ' ' + f(ye + Math.sin(a) * h * 0.4) + ' L' + f(xe - Math.cos(a - 0.5) * h) + ' ' + f(ye - Math.sin(a - 0.5) * h) + ' L' + f(xe - Math.cos(a + 0.5) * h) + ' ' + f(ye - Math.sin(a + 0.5) * h) + ' Z';
  var ln = 'M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.5) + ' ' + f(ye - Math.sin(a) * h * 0.5);
  return '<path d="' + ln + '" stroke="' + INK + '" stroke-width="' + (w + 3) + '" stroke-linecap="round"/><path d="' + hd + '" fill="' + INK + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="' + ln + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/><path d="' + hd + '" fill="' + col + '"/>';
}
function pulse(x, y, t, col, r) {   // دواير بتنبض حوالين نقطة (للفت الانتباه)
  var s = ""; r = r || 30; col = col || "#f2c230";
  for (var i = 0; i < 3; i++) { var u = ((t * 0.8 + i / 3) % 1); s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * (0.4 + u)) + '" fill="none" stroke="' + col + '" stroke-width="3" opacity="' + f(1 - u) + '"/>'; }
  return s;
}
function sparkle(x, y, t, col, n) {   // نجوم صغيرة بتلمع
  var s = ""; col = col || "#fff3b0"; n = n || 6;
  for (var i = 0; i < n; i++) { var a = i / n * 6.283 + t * 0.6, rr = 34 + hash(i) * 26, k = Math.abs(Math.sin(t * 3 + i * 1.7)), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr, z = 3 + k * 5;
    s += '<path d="M' + f(px) + ' ' + f(py - z) + ' L' + f(px + z * 0.3) + ' ' + f(py) + ' L' + f(px) + ' ' + f(py + z) + ' L' + f(px - z * 0.3) + ' ' + f(py) + ' Z M' + f(px - z) + ' ' + f(py) + ' L' + f(px) + ' ' + f(py - z * 0.3) + ' L' + f(px + z) + ' ' + f(py) + ' L' + f(px) + ' ' + f(py + z * 0.3) + ' Z" fill="' + col + '" opacity="' + f(0.4 + k * 0.6) + '"/>'; }
  return s;
}
function qmark(x, y, t, size, col) {   // علامة استفهام كبيرة بتتمايل
  size = size || 90; return '<text x="' + f(x) + '" y="' + f(y + Math.sin(t * 2.4) * 6) + '" text-anchor="middle" transform="rotate(' + f(Math.sin(t * 1.7) * 6) + ' ' + f(x) + ' ' + f(y) + ')" style="font:900 ' + size + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:' + INK + ';stroke-width:3;paint-order:stroke">؟</text>';
}
function label(text, x, y, size, col, weight) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:' + (weight || 800) + ' ' + (size || 20) + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }
function counter(x, y, u, u0, dur, from, to, suffix, size, col) {   // رقم بيعد من from لـto في dur ثانية
  var k = ease((u - u0) / (dur || 1.5)); if (u < u0) return ""; var n = Math.round(lerp(from, to, k));
  return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" style="font:900 ' + (size || 54) + 'px Noto Sans Arabic;fill:' + (col || "#f2c230") + ';stroke:' + INK + ';stroke-width:4;paint-order:stroke">' + n.toLocaleString("en-US") + (suffix || "") + '</text>';
}
function bar(x, y, w, h, p, col, back) {   // شريط بيتملي لحد p
  p = clamp(p); return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" rx="' + f(h / 2) + '" fill="' + (back || "#2b2f34") + '" stroke="' + INK + '" stroke-width="2"/><rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(Math.max(h, w * p)) + '" height="' + f(h) + '" rx="' + f(h / 2) + '" fill="' + (col || "#f2c230") + '" opacity="' + (p > 0 ? 1 : 0) + '"/>';
}
function check(x, y, u, u0, s) { var k = pop((u - u0) / 0.8); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * (s || 1)) + ')"><circle r="22" fill="#4f9f5a" stroke="' + INK + '" stroke-width="3"/><path d="M-10 0 L-3 8 L11 -8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
function cross(x, y, u, u0, s) { var k = pop((u - u0) / 0.8); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * (s || 1)) + ')"><circle r="22" fill="#c23a26" stroke="' + INK + '" stroke-width="3"/><path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>'; }

// ── أشياء جاهزة ───────────────────────────────────────────
function tree(x, y, t, s) { s = s || 1; var sw = Math.sin(t * 1.4 + x) * 3; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-6" y="-50" width="12" height="50" fill="#7a5a3a" stroke="' + INK + '" stroke-width="2"/><g transform="rotate(' + f(sw) + ' 0 -50)"><circle cx="0" cy="-80" r="34" fill="#5f9a4a" stroke="' + INK + '" stroke-width="2.4"/><circle cx="-22" cy="-62" r="22" fill="#6fae56" stroke="' + INK + '" stroke-width="2.4"/><circle cx="22" cy="-62" r="22" fill="#6fae56" stroke="' + INK + '" stroke-width="2.4"/></g></g>'; }
function house(x, y, s, col) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><rect x="-50" y="-70" width="100" height="70" fill="' + (col || "#e9d6b0") + '" stroke="' + INK + '" stroke-width="2.6"/><path d="M-60 -68 L0 -112 L60 -68 Z" fill="#c25a3a" stroke="' + INK + '" stroke-width="2.6"/><rect x="-12" y="-36" width="24" height="36" fill="#7a5a3a" stroke="' + INK + '" stroke-width="2"/><rect x="-40" y="-56" width="20" height="18" fill="#cfe1ec" stroke="' + INK + '" stroke-width="2"/><rect x="20" y="-56" width="20" height="18" fill="#cfe1ec" stroke="' + INK + '" stroke-width="2"/></g>'; }
// موبايل في الإيد: screen = نص SVG جوه الشاشة (الشاشة 0..120 عرض × 0..220 طول)
function phone(x, y, t, s, screen) {
  s = s || 1; var tilt = Math.sin(t * 1.3) * 2;
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(tilt) + ') scale(' + s + ')"><rect x="-70" y="-130" width="140" height="260" rx="20" fill="#1c1c1c" stroke="' + INK + '" stroke-width="3"/><svg x="-60" y="-112" width="120" height="220" viewBox="0 0 120 220"><rect width="120" height="220" fill="url(#screen)"/>' + (screen || "") + '</svg><rect x="-18" y="-124" width="36" height="6" rx="3" fill="#333"/><path d="M-70 60 C-96 70 -100 120 -60 150 L40 150 C60 120 60 90 70 70" fill="#f1c9a0" stroke="' + INK + '" stroke-width="2.6"/></g>';
}
function gear(x, y, r, t, sp, col, teeth) {
  teeth = teeth || 10; var a = t * (sp || 1) * 57.3, d = "";
  for (var i = 0; i < teeth * 2; i++) { var ang = i / (teeth * 2) * 6.283, rr = i % 2 ? r : r * 1.18; d += (i ? " L" : "M") + f(Math.cos(ang) * rr) + " " + f(Math.sin(ang) * rr); }
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"><path d="' + d + ' Z" fill="' + (col || "url(#gMetal)") + '" stroke="' + INK + '" stroke-width="2.4"/><circle r="' + f(r * 0.32) + '" fill="#2b2e33" stroke="' + INK + '" stroke-width="2"/></g>';
}
function bulb(x, y, t, on) { var gl = on ? 0.6 + 0.3 * Math.sin(t * 6) : 0; return '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + (on ? '<circle r="46" fill="#ffe27a" opacity="' + f(gl) + '" filter="url(#soft)"/>' : '') + '<circle cy="-6" r="26" fill="' + (on ? "#ffe27a" : "#e8e4da") + '" stroke="' + INK + '" stroke-width="3"/><rect x="-11" y="16" width="22" height="18" rx="3" fill="#8a8f96" stroke="' + INK + '" stroke-width="2.4"/></g>'; }
function earth(x, y, r, t) {   // الكرة الأرضية بتلف
  var off = (t * 12) % (r * 2), land = "";
  for (var i = -1; i < 3; i++) { var cx = -r + i * r * 1.1 + off; land += '<path d="M' + f(cx) + ' ' + f(-r * 0.3) + ' c' + f(r * 0.2) + ' ' + f(-r * 0.3) + ' ' + f(r * 0.5) + ' ' + f(-r * 0.2) + ' ' + f(r * 0.45) + ' ' + f(r * 0.1) + ' c' + f(-r * 0.05) + ' ' + f(r * 0.4) + ' ' + f(-r * 0.4) + ' ' + f(r * 0.6) + ' ' + f(-r * 0.45) + ' ' + f(r * 0.2) + ' Z" fill="#5f9a4a"/>'; }
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><circle r="' + f(r * 1.15) + '" fill="#8fd0ee" opacity=".35" filter="url(#soft)"/><clipPath id="eclip' + Math.round(x + y) + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="#2f86c8"/><g clip-path="url(#eclip' + Math.round(x + y) + ')">' + land + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="3"/><circle cx="' + f(-r * 0.35) + '" cy="' + f(-r * 0.35) + '" r="' + f(r * 0.3) + '" fill="#fff" opacity=".18"/></g>';
}
function box(x, y, w, h, col, depth) {   // صندوق بعمق (شكل 3D بسيط)
  depth = depth || 16; col = col || "#c9a06e";
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><path d="M0 0 L' + depth + ' ' + (-depth) + ' L' + (w + depth) + ' ' + (-depth) + ' L' + w + ' 0 Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2"/><path d="M0 0 L' + depth + ' ' + (-depth) + ' L' + (w + depth) + ' ' + (-depth) + ' L' + w + ' 0 Z" fill="#fff" opacity=".18"/><path d="M' + w + ' 0 L' + (w + depth) + ' ' + (-depth) + ' L' + (w + depth) + ' ' + (h - depth) + ' L' + w + ' ' + h + ' Z" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2" opacity=".75"/><rect width="' + w + '" height="' + h + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2.2"/></g>';
}
