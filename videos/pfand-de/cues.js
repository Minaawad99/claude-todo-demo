// Sound cues from the line timings: node cues.js → cues.json (all synthesized in ../audio/sfx.py)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const roll = (i, g) => a(L(i), 'motor', g, D(i));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: bottle in, machine hums, 25 cents
a(L(0) + 0.6, 'slosh', 0.35); a(L(0) + 0.8, 'motor', 0.35, 1.6); a(L(0) + 2.6, 'beep', 0.45); a(L(0) + 2.7, 'chime', 0.5);
// 1–2: the question, the bottle spat out
a(L(1) + 0.6, 'pop', 0.6); a(L(1) + 1.0, 'notify', 0.35); a(L(2) + 0.4, 'servo', 0.35); a(L(2) + 1.0, 'beep', 0.5); a(L(2) + 1.2, 'clank', 0.4);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.25, 'chime', 0.5);
// 4–5: 2003, 25 cents (coins dropping)
a(L(4) + 0.4, 'pop', 0.6); a(L(4) + 0.8, 'pop', 0.5); [0.4, 0.7, 1.0].forEach(o => a(L(5) + o, 'clink', 0.5)); a(L(5) + 1.4, 'chime', 0.4);
// 6–7: rollers and cameras
roll(6, 0.35); a(L(6) + 0.6, 'pop', 0.5); roll(7, 0.3); for (let k = 0; k < 6; k++) a(L(7) + 0.3 + k * 0.35, 'tick', 0.25); a(L(7) + 0.5, 'pop', 0.5);
// 8–9: barcode scan beeps, the database answer
a(L(8) + 0.4, 'laser', 0.35); a(L(8) + 0.5, 'pop', 0.5); a(L(8) + 1.4, 'beep', 0.45); a(L(9) + 0.3, 'beep', 0.35); a(L(9) + 0.9, 'notify', 0.4);
// 10–12: the deposit mark, infrared, the fake
a(L(10) + 0.4, 'pop', 0.6); a(L(10) + 1.4, 'pop', 0.5); a(L(11) + 1.0, 'hum', 0.35, D(11) - 1.0); a(L(11) + 1.0, 'zap', 0.35); a(L(11) + 1.2, 'pop', 0.5);
a(L(12) + 0.4, 'beep', 0.4); a(L(12) + 0.8, 'thud', 0.5);
// 13–15: shape and weight, rejected bottle, the computer decides
roll(13, 0.3); a(L(13) + 0.3, 'pop', 0.5); a(L(13) + 1.4, 'thud', 0.35); a(L(13) + 1.5, 'pop', 0.5);
roll(14, 0.3); a(L(14) + 0.4, 'beep', 0.45); a(L(14) + 1.8, 'servo', 0.4); a(L(14) + 1.9, 'pop', 0.5);
for (let k = 0; k < 4; k++) a(L(15) + 0.3 + k * 0.35, 'ping', 0.35); a(L(15) + 1.8, 'wipe', 0.4); a(L(15) + 1.6, 'pop', 0.5);
// 16–17: the press, the shredder
a(L(16) + 0.3, 'motor', 0.45, D(16) - 0.3); a(L(16) + 1.0, 'squeeze', 0.5); a(L(16) + 1.2, 'clank', 0.5); a(L(16) + 1.3, 'pop', 0.6);
a(L(17) + 0.3, 'gear', 0.4, 1.4); a(L(17) + 0.4, 'pop', 0.5); a(L(17) + 1.4, 'chime', 0.4);
// 18–21: refillable bottles: crate, washing, filling, 50 times, 8 and 15 cents
a(L(18) + 0.6, 'clink', 0.5); a(L(18) + 1.2, 'clink', 0.4); a(L(18) + 0.8, 'pop', 0.5);
a(L(19), 'fill', 0.35, D(19)); a(L(19) + 0.3, 'splash', 0.35); a(L(19) + 0.4, 'pop', 0.5);
a(L(20) + 0.4, 'spin', 0.4, 1.6); a(L(20) + 2.0, 'chime', 0.45); a(L(21) + 0.3, 'pop', 0.5); a(L(21) + 0.8, 'clink', 0.4); a(L(21) + 1.4, 'clink', 0.4);
// 22: the receipt prints
a(L(22) + 0.4, 'toner', 0.35); a(L(22) + 0.4, 'paper', 0.45, 1.6); a(L(22) + 1.6, 'pop', 0.6);
// 23–25: Norway 1972, Tomra, 98 %
a(L(23) + 0.6, 'pop', 0.5); a(L(23) + 1.4, 'bell', 0.4); a(L(24) + 0.4, 'pop', 0.6); a(L(24) + 1.6, 'pop', 0.5);
a(L(25) + 0.3, 'fill', 0.35, 1.6); a(L(25) + 1.9, 'chime', 0.5); a(L(25) + 1.4, 'pop', 0.5);
// 26: turned, photographed, checked, sorted
roll(26, 0.3); [0.3, 0.8, 1.3, 1.8].forEach(o => a(L(26) + o, 'pop', 0.5)); a(L(26) + 0.8, 'tick', 0.3); a(L(26) + 1.8, 'clank', 0.35);
// 27: outro
a(L(27) + 0.4, 'pop', 0.8); a(L(27) + 0.6, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 0));
console.log(c.length, 'cues');
