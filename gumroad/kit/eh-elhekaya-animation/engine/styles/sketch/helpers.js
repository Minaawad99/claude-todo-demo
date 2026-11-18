/* ستايل السكتش («الرسم الهندسي»): ورق كريمي بمربعات، رسم مسطّح بخطوط رفيعة وتظليل مايل، وأسماء الأجزاء بخطوط إشارة.
   اللوحة (المشهد) عمودية: 640 عرض × 800 طول. كل دالة بترجع نص SVG. الشرح في API.md. */

// ── أدوات ────────────────────────────────────────────────
var LN = window.TIMING.lines;
function L(i) { return i >= LN.length ? window.TIMING.duration + 1.5 : LN[i].start; }
function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function ease(x) { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, k) { return a + (b - a) * k; }
function pop(u) { if (u <= 0) return 0; if (u < 0.22) return 1.12 * ease(u / 0.22); if (u < 0.36) return lerp(1.12, 1, (u - 0.22) / 0.14); return 1; }
function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function f(n) { return (+n).toFixed(1); }
// الألوان: حبر، ورق، برتقالي (فعل أو خطر)، أزهر (مصطلح علمي)، زيتوني (اسم جزء)، رمادي فاتح، جلد، عضم
var INK = "#2b2b2b", PAPER = "#eee5d0", ORANGE = "#c4532c", BLUE = "#46698a", OLIVE = "#6b7d3c", PUTTY = "#cdc9bb", SKIN = "#d9a184", BONE = "#f4efe0", GREY = "#8a8070";
var CLIPN = 0;

// ── خلفيات ───────────────────────────────────────────────
function paper() { return '<rect x="-600" y="-600" width="1840" height="2000" fill="' + PAPER + '"/><rect x="-600" y="-600" width="1840" height="2000" fill="url(#grid)"/>'; }
function dark(col) { return '<rect x="-600" y="-600" width="1840" height="2000" fill="' + (col || "#141414") + '"/>'; }   // لوحة "صورة" سودا

// ── أشكال أساسية ─────────────────────────────────────────
// مستطيل بخط: (x, y, w, h, لون, سُمك الخط, تدوير الحواف)
function R(x, y, w, h, fill, sw, rx, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw == null ? 2 : sw) + '"' + (ex || "") + '/>'; }
// شكل (مسار SVG) بلون + تظليل مايل فوقه
function shape(d, fill, hatched, sw) { return '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 2) + '" stroke-linejoin="round"/>' + (hatched ? '<path d="' + d + '" fill="url(#hatch)"/>' : ""); }
function circle(x, y, r, fill, hatched, sw) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 2) + '"/>' + (hatched ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#hatch)"/>' : ""); }
function T(text, x, y, sz, col, w, anchor) { return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + (anchor || "middle") + '" style="font:' + (w || 700) + ' ' + sz + 'px Noto Sans Arabic;fill:' + (col || INK) + '">' + text + '</text>'; }

// ── علامات الشرح ─────────────────────────────────────────
// اسم جزء بخط إشارة: نقطة على الجزء (px,py)، خط لـ(lx,ly)، والكلام بعده. k من 0 لـ1 بيرسمه (مثلاً ease((u - 0.5) / 0.8))
function label(px, py, lx, ly, text, col, k, sz) {
  k = clamp(k == null ? 1 : k); if (k <= 0) return ""; col = col || INK; sz = sz || 21;
  var ex = lerp(px, lx, clamp(k * 1.6)), ey = lerp(py, ly, clamp(k * 1.6)), left = lx < px, tw = text.length * sz * 0.5, tx = lx + (left ? -8 : 8), ty = ly + sz * 0.35;
  if (!left && lx + tw > 630) { left = true; tx = lx; ty = ly - 10; } else if (left && lx - tw < 10) { left = false; tx = lx; ty = ly - 10; }
  var s = '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="4" fill="' + col + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + f(px) + ' ' + f(py) + ' L' + f(ex) + ' ' + f(ey) + '" stroke="' + INK + '" stroke-width="1.4"/>';
  if (k > 0.55) s += '<g opacity="' + f(clamp((k - 0.55) / 0.3)) + '">' + T(text, tx, ty, sz, col, 700, left ? "start" : "end") + '</g>';
  return s;
}
function callout(n, x, y, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><circle r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>' + T(n, 0, 6, 16, INK, 700) + '</g>'; }   // دايرة برقم ① ② ③
function crossMark(x, y, s, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k * (s || 1)) + ')"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="' + ORANGE + '" stroke-width="13" stroke-linecap="round"/></g>'; }   // ✗ كبيرة لفكرة غلط
function ring(x, y, r, t, k) { k = clamp(k == null ? 1 : k); if (k <= 0) return ""; var c = 2 * Math.PI * r; return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r + Math.sin(t * 4) * 2) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-dasharray="' + f(c * k) + ' ' + f(c) + '" transform="rotate(-90 ' + f(x) + ' ' + f(y) + ')"/>'; }   // دايرة حمرا بتترسم حوالين حاجة
function numBox(text, x, y, k, sz) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; sz = sz || 22; var w = text.length * sz * 0.62 + 24; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')"><rect x="' + f(-w / 2) + '" y="' + f(-sz * 0.95) + '" width="' + f(w) + '" height="' + f(sz * 1.6) + '" rx="5" fill="' + INK + '"/><text x="0" y="' + f(sz * 0.32) + '" text-anchor="middle" style="font:800 ' + sz + 'px Noto Sans Arabic;fill:#fff;direction:ltr">' + text + '</text></g>'; }   // رقم في بوكس غامق
// موجة/شعاع متموّج من (x1,y1) لـ(x2,y2). p لحد فين اترسمت
function waveRay(x1, y1, x2, y2, t, col, a, wl, p, sw) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, d = "";
  for (var s = 0; s <= len * p; s += 4) { var o = Math.sin(s / (wl || 22) * Math.PI * 2 - t * 9) * (a || 7); d += (s ? " L" : "M") + f(x1 + ux * s - uy * o) + " " + f(y1 + uy * s + ux * o); }
  return '<path d="' + d + '" stroke="' + (col || BLUE) + '" stroke-width="' + (sw || 3) + '" fill="none" stroke-linecap="round"/>';
}
function arrow(x1, y1, x2, y2, col, w, p) {
  p = clamp(p == null ? 1 : p); if (p <= 0) return ""; var xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), a = Math.atan2(ye - y1, xe - x1), h = (w || 3) * 3.2;
  return '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(xe - Math.cos(a) * h * 0.6) + ' ' + f(ye - Math.sin(a) * h * 0.6) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/><path d="M' + f(xe) + ' ' + f(ye) + ' L' + f(xe - Math.cos(a - 0.45) * h) + ' ' + f(ye - Math.sin(a - 0.45) * h) + ' L' + f(xe - Math.cos(a + 0.45) * h) + ' ' + f(ye - Math.sin(a + 0.45) * h) + ' Z" fill="' + (col || INK) + '"/>';
}
function arrows(t, x1, y1, x2, y2, n, col, spread) {   // حزمة أسهم رفيعة ماشية (طاقة، هوا، حرارة)
  var s = "", dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len; n = n || 5; spread = spread || 60;
  for (var i = 0; i < n; i++) { var o = (i / (n - 1) - 0.5) * spread, u = ((t * 0.7 + hash(i)) % 1); s += arrow(x1 + nx * o, y1 + ny * o, x1 + nx * o + dx * (0.3 + 0.7 * u), y1 + ny * o + dy * (0.3 + 0.7 * u), col || ORANGE, 2, 1); }
  return s;
}
function dots(t, x, y, w, h, n, col, sp) {   // جزيئات صغيرة بتتحرك
  var s = ""; n = n || 30;
  for (var i = 0; i < n; i++) { var px = x + ((hash(i) * w + t * (sp || 20) * (hash(i + 3) - 0.3)) % w + w) % w, py = y + hash(i + 7) * h + Math.sin(t * 2 + i) * 5; s += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2.5 + hash(i + 2) * 2) + '" fill="' + (col || BLUE) + '"/>'; }
  return s;
}
// دايرة تكبير لتفصيلة: inner مرسوم حوالين (0,0)
function inset(cx, cy, r, inner, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var id = "in" + (++CLIPN); return '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(k) + ')"><clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="' + PAPER + '"/><g clip-path="url(#' + id + ')">' + inner + '</g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>'; }

// ── أشكال جاهزة ───────────────────────────────────────────
function figure(x, y, s, t, col) {   // شخص بشكل بسيط (من غير وش كرتوني)
  s = s || 1; col = col || PUTTY; var b = Math.sin(t * 2.4) * 1.5;
  return '<g transform="translate(' + f(x) + ' ' + f(y + b) + ') scale(' + s + ')">' + circle(0, -150, 24, SKIN) + shape("M-34 -118 C-40 -60 -36 -20 -30 0 H30 C36 -20 40 -60 34 -118 C20 -126 -20 -126 -34 -118 Z", col, true) + '</g>';
}
function lamp(x, y, t, on, s) { s = s || 1; return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + (on ? '<circle cy="-10" r="' + f(60 + Math.sin(t * 5) * 4) + '" fill="url(#glowW)"/>' : "") + circle(0, -10, 26, on ? "#fff3c8" : BONE) + R(-12, 14, 24, 20, PUTTY, 2) + '</g>'; }
function gearS(x, y, r, t, sp, col, teeth) {
  teeth = teeth || 10; var a = t * (sp || 1) * 57.3, d = "";
  for (var i = 0; i < teeth * 2; i++) { var ang = i / (teeth * 2) * 6.283, rr = i % 2 ? r : r * 1.18; d += (i ? " L" : "M") + f(Math.cos(ang) * rr) + " " + f(Math.sin(ang) * rr); }
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')">' + shape(d + " Z", col || PUTTY, true) + circle(0, 0, r * 0.3, PAPER) + '</g>';
}
function sunS(x, y, r, t) { var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 2.2) + '" fill="url(#glowO)" opacity=".6"/>'; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283 + t * 0.3; s += '<path d="M' + f(x + Math.cos(a) * r * 1.25) + ' ' + f(y + Math.sin(a) * r * 1.25) + ' L' + f(x + Math.cos(a) * r * 1.6) + ' ' + f(y + Math.sin(a) * r * 1.6) + '" stroke="' + ORANGE + '" stroke-width="3" stroke-linecap="round"/>'; } return s + circle(x, y, r, "#f2c26a", true); }
function globe(x, y, r, t) { var off = (t * 10) % (r * 2), land = ""; for (var i = -1; i < 3; i++) { var cx = -r + i * r * 1.1 + off; land += '<path d="M' + f(cx) + ' ' + f(-r * 0.3) + ' c' + f(r * 0.2) + ' ' + f(-r * 0.3) + ' ' + f(r * 0.5) + ' ' + f(-r * 0.2) + ' ' + f(r * 0.45) + ' ' + f(r * 0.1) + ' c' + f(-r * 0.05) + ' ' + f(r * 0.4) + ' ' + f(-r * 0.4) + ' ' + f(r * 0.6) + ' ' + f(-r * 0.45) + ' ' + f(r * 0.2) + ' Z" fill="' + OLIVE + '"/>'; } var id = "gl" + (++CLIPN); return '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><clipPath id="' + id + '"><circle r="' + r + '"/></clipPath><circle r="' + r + '" fill="' + BLUE + '" opacity=".75"/><g clip-path="url(#' + id + ')">' + land + '<circle r="' + r + '" fill="url(#hatch)"/></g><circle r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="2.4"/></g>'; }
