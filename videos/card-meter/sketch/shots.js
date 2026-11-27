// ── «إزاي عداد الكارت بيشتغل؟» — shots. Drawings in draw.js (CM.*), people from the shared person kit.
// Camera: the «طب إزاي؟» move: the frame holds dead still on one drawing, then flies (eased, ~1.8 s) onto the part being
// talked about and later back out. The life between moves is in the drawing: current dots run, the red LED blinks, the
// LCD counts, the man breathes and blinks.
var MX = 320, MY = 360, MS = 1.15;                    // where the meter sits in the panel world
function mp(x, y) { return [MX + x * MS, MY + y * MS]; } // a point on the meter (meter units) → panel world
var WIDE = [320, 393, 1], LCDV = [320, 215, 2.1], LEDV = [mp(-60, -74)[0], mp(-60, -74)[1], 2.6], SLOT = [320, 400, 1.7];
var SHUNT = [mp(-34, 120)[0], mp(-34, 120)[1] - 20, 2.2], ICV = [mp(-82, -72)[0] + 30, mp(-82, -72)[1], 2.2], MCU = [mp(18, -72)[0], mp(18, -72)[1], 2.2], RELV = [mp(66, 110)[0], mp(66, 110)[1], 2.4], MEM = [mp(80, -84)[0], mp(80, -84)[1], 2.4];
function blink(t) { return Math.sin(t * 2.3) > .97 ? .05 : 1; }
function ledPulse(t, per) { per = per || .7; return ((t % per) / per) < .22 ? 1 : 0; }
function front(o) { return CM.meter(MX, MY, MS, o); }
function opened(o) { return CM.inside(MX, MY, MS, o); }
function chip(txt, x, y, col, k) { k = pop(k == null ? 1 : k); if (k <= 0) return ""; var w = txt.length * 13 + 30; return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + f(k) + ')', '<rect x="' + f(-w / 2) + '" y="-20" width="' + w + '" height="40" rx="8" fill="' + col + '"/>' + T(txt, 0, 8, 21, "#fbf8f1", 800)); }
function q(x, y, k, sz) { return G("", T("؟", x, y, sz || 140, ORANGE, 800), at(k, 0, .3)); }
// the man of the house (home clothes), front view, feet on floorY
function man(x, floorY, s, t, fc, arms, head) {
  var P1 = PERSON.front({ x: x, y: floorY - .52 * 400 * s, s: s, legs: "stand", outfit: "home", breath: (Math.sin(t * 1.7) + 1) / 2,
    head: Object.assign({ tilt: 2.5 * Math.sin(t * 1.1) }, head || {}), face: Object.assign({ eyes: blink(t) }, fc || {}), arms: arms });
  return P1.svg;
}
function shocked(x, floorY, s, t) { var sh = [x, floorY - .87 * 400 * s]; return man(x, floorY, s, t, { mouth: "o", eyes: 1.25, brows: "raised" }, [{ to: [sh[0] - 70 * s, sh[1] + 10 * s], hand: "open", bend: -1, palm: true }, { to: [sh[0] + 70 * s, sh[1] + 10 * s], hand: "open", bend: 1, palm: true }]); }
function roomMan(t, light, fc, arms, bal, warn) { return CM.room({ light: light, meterBal: bal, warn: warn }) + (fc === "shock" ? shocked(300, 700, 1.0, t) : man(300, 700, 1.0, t, fc, arms)) + CM.nightOver(1 - light); }
// a number that counts between two values across a shot
function between(a, b, k) { return a + (b - a) * ease(k); }

// 4 · «طب الفلوس اللي بتشحنها بتروح فين؟» — the meter, the card beside it, a big question mark
shot(4, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(520, 600, .9, { rot: -14 + 3 * Math.sin(t * 1.3) }) + q(530, 230, u, 130); });
shot([4, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(520, 600 - 6 * Math.sin(t * 1.6), .9, { rot: -14 }) + T("؟", 530, 230, 130, ORANGE, 800) + arrow(500, 540, 420, 430, ORANGE, 4, at(u, .1, .5)); });
// 5 · the card holds a small chip, like a bank card's
shot(5, still(320, 393, 1), function (u, d, t) { return paper() + CM.card(320, 393, 2.6 + .02 * Math.sin(t), { glow: 0 }); });
shot([5, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.card(320, 393, 2.6, { glow: .5 + .5 * Math.sin(t * 3) }) + label(190, 440, 120, 600, "شريحة", OLIVE, at(u, .1, .5), 26); });
shot([5, 2], still(320, 393, 1), function (u, d, t) {
  var visa = R(-58, -38, 116, 76, "#2f4f6e", 2.2, 7) + CM.chipPad(-28, -2, .55, 0) + T("بنك", 30, 26, 14, "#e8e2d2", 800);
  return paper() + CM.card(320, 393, 2.6, { glow: .5 + .5 * Math.sin(t * 3) }) + label(190, 440, 120, 600, "شريحة", OLIVE, 1, 26) + iconBox(520, 150, 150, visa, at(u, .1, .3));
});
// 6 · when you charge, the clerk writes your balance onto the chip
shot(6, still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { amt: "" }); });
shot([6, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { amt: between(0, 100, at(u, .1, 1.4)).toFixed(2), cardGlow: .3 }); });
shot([6, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.chipBig(320, 360, 1.3, "رصيدك: 100.00 ج", at(u, .1, 1.4)) + G("", T("بيتكتب على الشريحة", 320, 160, 26, INK, 800), at(u, .3, .3)); });
// 7 · you put the card in: the meter reads the balance, keeps it in its memory and wipes the card
shot(7, still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: 25.4, card: at(u, .1, 1.2), pulse: ledPulse(t) }); }, { tr: "fade" });
shot([7, 1], fly([SLOT[0], SLOT[1] - 60, 1.3], LCDV, 1.6), function (u, d, t) { var v = between(25.4, 125.4, at(u, .6, 1.4)); return paper() + front({ bal: v, card: 1, pulse: ledPulse(t) }) + G("", T("+100", 470, 140, 24, ORANGE, 800), at(u, 1.6, .3)); });
shot([7, 2], still(MEM[0] - 60, MEM[1] + 20, 1.9), function (u, d, t) {
  var k = at(u, .2, .9); return paper() + opened({ bal: 125.4, hi: "mem", pulse: ledPulse(t) }) + arrow(mp(0, -20)[0], mp(0, -20)[1], mp(90, -66)[0], mp(90, -66)[1], ORANGE, 4, k) + label(mp(99, -84)[0], mp(99, -84)[1], 520, 160, "ذاكرة العداد", OLIVE, at(u, .8, .5), 18);
}, { tr: "fade" });
shot([7, 3], still(320, 393, 1), function (u, d, t) { var k = 1 - at(u, .3, 1.0); return paper() + CM.chipBig(320, 360, 1.3, k > .1 ? "100.00 ج" : "0.00 ج", k) + G("", T("الكارت اتصفّر", 320, 160, 28, ORANGE, 800), at(u, 1.1, .3)); });
// 8 · so the money is now inside the meter, not on the card
shot(8, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }); });
shot([8, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }) + check(470, 140, 1.1, at(u, .1, .5)) + chip("الفلوس هنا", 320, 70, OLIVE, at(u, .2, .3)); });
shot([8, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + CM.card(540, 640, .7, { rot: 10 }) + check(470, 140, 1.1, 1) + chip("الفلوس هنا", 320, 70, OLIVE, 1) + cross(540, 640, 1, at(u, .1, .5)); });
// 9 · how does the meter know how much you used? — the man at home, the light on, the question
shot(9, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "raised" }, null, 125.4) + q(520, 520, u, 120); });
shot([9, 1], fly([320, 400, 1], [130, 300, 2.2], 1.8), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "raised" }, null, 125.4) + T("؟", 520, 520, 120, ORANGE, 800); });
// 10 · the electricity comes into your home through a cable; inside the meter a small piece of metal measures the current
shot(10, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + CM.houseCut(t, at(u, .2, .6)); });
shot([10, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, pulse: ledPulse(t) }); });
shot([10, 3], fly(WIDE, SHUNT, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: u > 1 ? "shunt" : "", pulse: ledPulse(t) }); });
shot([10, 4], still(SHUNT[0], SHUNT[1], SHUNT[2]), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "shunt", pulse: ledPulse(t) }) + label(mp(-34, 112)[0], mp(-34, 112)[1], 210, 410, "حتة معدن", OLIVE, at(u, .1, .5), 13) + chip("التيار", mp(-30, 150)[0] + 50, mp(-30, 150)[1] + 8, BLUE, at(u, .6, .3)); });
// 11 · an electronic chip multiplies the current by the voltage, and knows how much you draw every moment
shot(11, fly(SHUNT, ICV, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }); });
function eq(u, n) {   // current × voltage = power, built chunk by chunk
  var s = numBox("5 A", 130, 650, n >= 1 ? 1 : 0, 26) + (n >= 1 ? T("×", 225, 662, 34, INK, 800) : "") + numBox("220 V", 320, 650, n >= 1 ? 1 : 0, 26);
  if (n >= 2) s += T("=", 420, 662, 34, INK, 800) + numBox("1100 W", 520, 650, at(u, .1, .3), 26, true);
  return '<rect x="20" y="595" width="600" height="100" fill="#f4ecdb" stroke="' + INK + '" stroke-width="2"/>' + s;
}
hud([11, 1], [12, 0], function (u, t) { var c = window.CHUNKS[11], l = LN[11], n = t >= l.start + (l.end - l.start) * c[2] ? 2 : 1; return eq(t - (l.start + (l.end - l.start) * c[2]), n); });
shot([11, 1], still(ICV[0], ICV[1] + 40, 1.7), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }) + label(mp(-82, -100)[0], mp(-82, -100)[1], 330, 170, "شريحة القياس", OLIVE, at(u, .1, .5), 13); });
shot([11, 2], still(ICV[0], ICV[1] + 40, 1.7), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "ic", pulse: ledPulse(t) }) + label(mp(-82, -100)[0], mp(-82, -100)[1], 330, 170, "شريحة القياس", OLIVE, 1, 13); });
// 12 · every bit of a kilowatt-hour that adds up, the red light blinks
shot(12, fly([ICV[0], ICV[1] + 40, 1.7], WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }); });
shot([12, 1], fly(WIDE, LEDV, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }); });
shot([12, 2], still(LEDV[0], LEDV[1], LEDV[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .55) }) + label(mp(-60, -64)[0], mp(-60, -64)[1], 330, 320, "بتغمز", ORANGE, at(u, .1, .5), 10); });
// 13 · like a taxi meter: the more you go, the more it adds
shot(13, fly(LEDV, WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .55) }) + iconBox(520, 160, 170, '<g transform="scale(1.25)">' + CM.taxi(12 + t * .6 % 30) + '</g>', at(u, 1.5, .3)); });
shot([13, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t, .4) }) + iconBox(520, 160, 170, '<g transform="scale(1.25)">' + CM.taxi(12 + t * .6 % 30) + '</g>', 1) + T("كيلووات +", 140, 700, 26, ORANGE, 800); });
// 14 · so how does it take the money?
shot(14, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + q(530, 220, u, 130); });
shot([14, 1], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + T("؟", 530, 220, 130, ORANGE, 800) + chip("ج", 540, 380, ORANGE, at(u, .1, .3)); });
// 15 · the meter keeps the price table inside it: how much a kilowatt-hour costs
shot(15, fly(WIDE, MCU, 1.6), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "mcu", pulse: ledPulse(t) }); });
function table(k, hl) {
  var s = '<g transform="translate(320 600)">' + R(-250, -110, 500, 210, "#fbf8f1", 2.4, 6) + T("جدول الأسعار", 0, -78, 24, OLIVE, 800) + CM.lineP([[-220, -62], [220, -62]], INK, 1.4);
  for (var i = 0; i < 3; i++) { var kk = clamp(k * 3 - i); s += G("", T("شريحة " + (i + 1), 150, -24 + i * 40, 19, INK, 800) + CM.lineP([[70, -30 + i * 40], [-90, -30 + i * 40]], "#b3a98f", 1.4, ' stroke-dasharray="4 5"') + T(["قرش", "قروش أكتر", "أغلى"][i], -160, -24 + i * 40, 19, i === hl ? ORANGE : INK, 800), kk); }
  return s + '</g>';
}
hud([15, 1], [16, 0], function (u, t) { return table(at(u, 0, 1.2), u > 1.6 ? 2 : -1); });
shot([15, 1], still(MCU[0], MCU[1] - 40, 1.5), function (u, d, t) { return paper() + opened({ bal: 125.4, flow: 1, hi: "mcu", pulse: ledPulse(t) }) + label(mp(18, -110)[0], mp(18, -110)[1], 470, 130, "المخ", OLIVE, at(u, .1, .5), 16); });
// 16 · it multiplies your use by the price and takes it off the balance, bit by bit
shot(16, fly([MCU[0], MCU[1] - 40, 1.5], WIDE, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4, pulse: ledPulse(t) }) + G("", tag("كيلووات × السعر", 320, 690, 1, 26, ORANGE), at(u, 1, .3)); });
shot([16, 2], fly(WIDE, LCDV, 1.6), function (u, d, t) { return paper() + front({ bal: 125.4 - 2.6 * at(u, .4, d + 3), pulse: ledPulse(t), lcdCol: ORANGE }); });
shot([16, 3], still(LCDV[0], LCDV[1], LCDV[2]), function (u, d, t) { return paper() + front({ bal: 122.8 - 1.4 * at(u, 0, d), pulse: ledPulse(t), lcdCol: ORANGE }) + G("", T("−", 205, 160, 40, ORANGE, 800), at(u, .1, .3)); });
// 17 · the more you use in a month, the dearer the kilowatt-hour: the tiers
shot(17, fly(LCDV, WIDE, 1.6), function (u, d, t) { return paper() + CM.stairs(65, 560, 5, at(u, .3, 2.2), -1) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, at(u, .3, 1.5)); });
shot([17, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { var cur = Math.min(4, Math.floor(at(u, 0, d) * 5)); return paper() + CM.stairs(65, 560, 5, 1, cur) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, 1) + G("", T("الكيلو يغلى", 200, 220, 34, ORANGE, 800), at(u, .1, .3)) + arrow(120, 300, 380, 140, ORANGE, 5, at(u, .3, .6)); });
shot([17, 3], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + CM.stairs(65, 560, 5, 1, 4) + T("استهلاكك في الشهر", 320, 650, 24, INK, 800) + arrow(70, 690, 570, 690, INK, 3, 1) + chip("الشرايح", 320, 160, OLIVE, at(u, .1, .3)); });
// 18 · so how does it cut you off?
shot(18, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 1, { look: [-.6, -.2], brows: "worried" }, null, 3.5) + q(520, 520, u, 120); });
// 19 · when the balance is nearly gone, the meter beeps and lights a warning lamp
shot(19, fly([320, 400, 1], WIDE, 1.2), function (u, d, t) { return paper() + front({ bal: 3.5, pulse: ledPulse(t) }); });
shot([19, 1], fly(WIDE, LCDV, 1.6), function (u, d, t) { return paper() + front({ bal: 3.5 - .3 * at(u, 0, d), pulse: ledPulse(t), lcdCol: ORANGE }); });
function beep(x, y, t) { var s = ""; for (var i = 0; i < 3; i++) { var a = (t * 1.6 + i / 3) % 1; s += '<path d="M' + f(x + 20 + 30 * a) + ' ' + f(y - 26 - 20 * a) + ' q' + f(18 + 10 * a) + ' ' + f(26 + 20 * a) + ' 0 ' + f(52 + 40 * a) + '" fill="none" stroke="' + ORANGE + '" stroke-width="4" stroke-linecap="round" opacity="' + f(1 - a) + '"/>'; } return s; }
shot([19, 2], fly(LCDV, [mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9], 1.4), function (u, d, t) { var w = ledPulse(t, .5); return paper() + front({ bal: 3.2, pulse: ledPulse(t), warn: w, lcdCol: ORANGE }) + beep(mp(60, -74)[0] + 20, mp(60, -74)[1], t); });
shot([19, 3], still(mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9), function (u, d, t) { var w = ledPulse(t, .5); return paper() + front({ bal: 3.1, pulse: ledPulse(t), warn: w, lcdCol: ORANGE }) + beep(mp(60, -74)[0] + 20, mp(60, -74)[1], t) + label(mp(60, -64)[0], mp(60, -64)[1], 360, 380, "تحذير", ORANGE, at(u, .1, .5), 14); });
// 20 · at zero it sends a pulse to a switch inside it, called the relay
shot(20, fly([mp(60, -74)[0] - 40, mp(60, -74)[1] - 20, 1.9], LCDV, 1.2), function (u, d, t) { var v = 3.1 * (1 - at(u, 0, .9)); return paper() + front({ bal: v, pulse: ledPulse(t), warn: ledPulse(t, .5), lcdCol: ORANGE }) + G("", numBox("0.00", 470, 120, 1, 22, true), at(u, 1, .3)); });
shot([20, 1], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "mcu", sig: clamp((u - .3) / 1.1) }); }, { tr: "fade" });
shot([20, 2], fly([320, 380, 1.25], RELV, 1.4), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "relay", sig: 1 }); });
shot([20, 3], still(RELV[0], RELV[1], RELV[2]), function (u, d, t) { return paper() + opened({ bal: 0, flow: 1, hi: "relay", sig: 1 }) + label(mp(66, 80)[0], mp(66, 80)[1], 480, 380, "الريليه", OLIVE, at(u, .1, .5), 12); });
// 21 · the relay has a magnet: it pulls the contact and opens it, the line is cut and the light goes out
shot(21, still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 0, coil: at(u, .3, .4), flow: 1 }) + label(-150 * 1.22 + 320, 393 - 60 * 1.22, 120, 130, "مغناطيس", BLUE, at(u, .5, .5), 20); }, { tr: "in" });
shot([21, 1], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: at(u, .1, .5), coil: 1, flow: 1 }) + label(-150 * 1.22 + 320, 393 - 60 * 1.22, 120, 130, "مغناطيس", BLUE, 1, 20) + label(320 + 150 * 1.22, 393 - 16 * 1.22, 520, 150, "الكونتاكت", INK, at(u, .4, .5), 20); });
shot([21, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1, coil: 1 - at(u, .4, .5), spark: 1 - at(u, 0, .4) }) + label(320 + 150 * 1.22, 393 - 16 * 1.22, 520, 150, "الكونتاكت", INK, 1, 20) + G("", T("مفتوح", 520, 520, 30, ORANGE, 800), at(u, .2, .3)); });
shot([21, 3], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1 }) + T("مفتوح", 520, 520, 30, ORANGE, 800) + cross(400, 600, .8, at(u, .1, .4)) + chip("مفيش تيار", 320, 690, ORANGE, at(u, .4, .3)); });
shot([21, 4], still(320, 400, 1), function (u, d, t) { var L = 1 - at(u, .1, .25); return paper() + roomMan(t, L, L > .5 ? { look: [0, -.4] } : "shock", null, 0); });
// 22 · just like a light switch, except the one pressing it is the meter
shot(22, still(320, 400, 1), function (u, d, t) { return paper() + roomMan(t, 0, "shock", null, 0) + iconBox(520, 150, 170, '<g transform="scale(1.1)">' + CM.wallSwitch(at(u, .5, .3)) + '</g>', at(u, .1, .3)); });
shot([22, 1], still(320, 393, 1), function (u, d, t) { var k = at(u, .4, .3); return paper() + G("translate(300 340) scale(2.6)", CM.wallSwitch(k)) + CM.meter(520, 600, .38, { bal: 0, lcdCol: ORANGE }) + arrow(470, 560, 380, 470, ORANGE, 5, at(u, .1, .4)); });
shot([22, 2], still(320, 393, 1), function (u, d, t) { return paper() + G("translate(300 340) scale(2.6)", CM.wallSwitch(1)) + CM.meter(520, 600, .38, { bal: 0, lcdCol: ORANGE, warn: ledPulse(t, .5) }) + arrow(470, 560, 380, 470, ORANGE, 5, 1) + chip("العداد", 520, 760 - 30, OLIVE, at(u, .1, .3)); });
// 23 · as soon as you charge and put the card in, a reverse pulse closes it and the light comes back
shot(23, still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: 0, card: at(u, .1, .9), lcdCol: ORANGE }); });
shot([23, 1], still(SLOT[0], SLOT[1] - 60, 1.3), function (u, d, t) { return paper() + front({ bal: between(0, 100, at(u, .1, 1)), card: 1 }); });
shot([23, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.relay(320, 393, 1.22, { open: 1 - at(u, .5, .5), coil: at(u, .1, .3) * (1 - at(u, 1.2, .4)), rev: true, flow: u > 1 ? 1 : 0 }) + chip("نبضة عكسية", 320, 130, BLUE, at(u, .1, .3)); });
shot([23, 3], still(320, 400, 1), function (u, d, t) { var L = at(u, .1, .25); return paper() + roomMan(t, L, L > .5 ? { mouth: "grin", brows: "raised" } : "shock", null, 100); });
// 24 · many think that if the card is lost, the money is lost. No.
shot(24, still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "frown", brows: "worried", look: [.7, .5] }, null, { turn: .4 * Math.sin(t * 1.2), tilt: -6 }); });
shot([24, 1], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "frown", brows: "worried", look: [.7, .5] }, null, { turn: .4 * Math.sin(t * 1.2), tilt: -6 }) + iconBox(520, 520, 170, '<g transform="rotate(-12)">' + CM.card(0, 0, .75, {}) + '</g>' + T("ضاع؟", 0, 70, 20, ORANGE, 800), at(u, .1, .3)); });
shot([24, 2], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "open", brows: "worried", look: [.7, .5] }) + iconBox(520, 520, 170, '<g transform="rotate(-12)">' + CM.card(0, 0, .75, {}) + '</g>' + T("ضاع؟", 0, 70, 20, ORANGE, 800), 1) + chip("الفلوس ضاعت؟", 320, 110, INK, at(u, .1, .3)); });
shot([24, 3], still(320, 400, 1), function (u, d, t) { return paper() + CM.room({ light: 1, meterBal: 100 }) + man(300, 700, 1, t, { mouth: "neutral", brows: "raised", look: [-.6, -.2] }) + chip("الفلوس ضاعت؟", 320, 110, INK, 1) + cross(320, 110, 1, at(u, .05, .4)); });
// 25 · as long as you put it in the meter, your balance is safe inside
shot(25, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t) }); });
shot([25, 2], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t) }) + check(470, 140, 1.1, at(u, .1, .5)) + chip("في أمان", 320, 70, OLIVE, at(u, .2, .3)); });
// 26 · bottom line: the card carries the money, the meter counts and takes it off, the relay cuts
shot(26, fly(WIDE, [320, 380, 1.25], 1.4), function (u, d, t) { return paper() + opened({ bal: 100, flow: 1, pulse: ledPulse(t) }); });
function recap(u, n) { return callout("1", mp(0, -5)[0], mp(0, -5)[1] + 40, n >= 1 ? 1 : 0, 18) + callout("2", mp(18, -72)[0], mp(18, -72)[1] - 70, n >= 2 ? 1 : 0, 18) + callout("3", mp(66, 110)[0] + 70, mp(66, 110)[1], n >= 3 ? 1 : 0, 18); }
shot([26, 1], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 100, flow: 1, hi: "contacts", pulse: ledPulse(t) }) + recap(u, 1); });
shot([26, 2], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 100 - .5 * at(u, 0, d), flow: 1, hi: "mcu", pulse: ledPulse(t) }) + recap(u, 2); });
shot([26, 3], still(320, 380, 1.25), function (u, d, t) { return paper() + opened({ bal: 99.5, flow: 1 - at(u, .4, .3), open: at(u, .3, .4), hi: "relay" }) + recap(u, 3); });
// 27 · the oddest: on its way back the card carries a report to the company: your use, and whether someone opened the meter's cover
shot(27, still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t), card: 1 - at(u, .3, 1) }); });
shot([27, 1], still(320, 393, 1), function (u, d, t) { var k = at(u, 0, d); return paper() + CM.office(t, {}) + G("", CM.card(lerp(620, 240, k), lerp(200, 520, k), .7, { rot: -6, glow: 1 }), 1 - at(u, d - .2, .2)); });
shot([27, 2], still(320, 393, 1), function (u, d, t) { return paper() + CM.office(t, { cardGlow: 1 }) + G("", R(40, 180, 300, 300, PAPER, 0), at(u, 0, .3)) + CM.report(190, 330, 1.1, 0, 0); });
shot([27, 3], still(320, 393, 1), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + R(60, 60, 520, 120, "#f1ead8", 2.4) + T("شركة الكهربا", 320, 135, 34, CM.colors.CARDD, 800) + CM.report(320, 470, 1.5, 0, 0); });
shot([27, 4], still(320, 470, 1.4), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + CM.report(320, 470, 1.5, at(u, .1, 1), 0); });
shot([27, 5], still(WIDE[0], WIDE[1], WIDE[2]), function (u, d, t) { return paper() + front({ bal: 100, pulse: ledPulse(t), coverOpen: at(u, .1, .6) }) + G("", T("حد فتح الغطا", 320, 70, 30, ORANGE, 800), at(u, .5, .3)); });
shot([27, 6], still(320, 470, 1.4), function (u, d, t) { return paper() + R(-40, -40, 720, 860, "#e4dcc6", 0) + CM.report(320, 470, 1.5, 1, at(u, .1, .3)); });

// ── opening card, bumper and summary art ──
window.SCENE = window.SCENE || {};
SCENE.intro = function (svg, t, li) {
  // line 0: the man at home, the balance hits zero, the light goes out. line 1: in the dark, shocked; who did it? a hand on a button at the company. line 2: nobody did
  var l0 = LN[0], off = clamp((t - (l0.end - .5)) / .25), L = li === 0 ? 1 - off : 0;
  var s = '<g transform="translate(0 -60) scale(.95)">' + CM.room({ light: L, meterBal: li === 0 ? 1.2 * (1 - clamp((t - .3) / 1.2)) : 0, warn: li === 0 ? ledPulse(t, .5) : 0 }) +
    (L > .5 ? man(300, 700, 1, t, { look: [-.6, -.1], brows: "worried" }) : shocked(300, 700, 1, t)) + CM.nightOver(1 - L) + '</g>';
  if (li >= 1) {
    var bub = '<g transform="translate(450 150)">' + '<ellipse cx="0" cy="0" rx="130" ry="105" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<rect x="-80" y="-46" width="160" height="86" fill="#e6d6b2" stroke="' + INK + '" stroke-width="2.2"/><path d="M-92 -46 L0 -88 L92 -46 Z" fill="#b5543a" stroke="' + INK + '" stroke-width="2.2"/>' + T("شركة الكهربا", 0, -14, 16, INK, 800) +
      '<circle cx="0" cy="18" r="15" fill="' + ORANGE + '" stroke="' + INK + '" stroke-width="2"/>' + CM.lineP([[40, 60], [8, 24]], INK, 10) + CM.lineP([[40, 60], [8, 24]], "#e0a98a", 6) + T("؟", 100, -40, 50, ORANGE, 800) + '</g>' +
      '<circle cx="360" cy="270" r="12" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/><circle cx="340" cy="300" r="7" fill="#fbf8f1" stroke="' + INK + '" stroke-width="2"/>';
    s += G("", bub, ease((t - LN[1].start) / .3));
    if (li >= 2) s += cross(450, 160, 1.6, clamp((t - LN[2].start - .2) / .5));
  }
  return s;
};
SCENE.bumper = function (u, t) { return '<g transform="translate(90 104) scale(.36)">' + CM.meter(0, 0, 1, { bal: 125.4, pulse: ledPulse(t), wires: false }) + '</g>'; };
SCENE.outro = function (svg, u, t) {
  return CM.card(90, 150, .8, { glow: .5 + .5 * Math.sin(t * 3) }) + arrow(160, 150, 215, 150, INK, 3, 1) +
    '<g transform="translate(300 140) scale(.44)">' + CM.inside(0, 0, 1, { bal: 100, flow: 1, pulse: ledPulse(t), wires: false }) + '</g>' + arrow(390, 150, 440, 150, INK, 3, 1) +
    '<g transform="translate(520 150) scale(.3)">' + CM.relay(0, 0, 1, { open: 0, flow: 1 }) + '</g>' +
    callout("1", 90, 70, ease(u / .3)) + callout("2", 300, 60, ease(u / .3 - .5)) + callout("3", 270, 110, ease(u / .3 - 1)) + callout("4", 520, 70, ease(u / .3 - 1.5));
};
