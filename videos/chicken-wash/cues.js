// Sound cues from the line timings: node cues.js → cues.json (synthesized effects from ../audio/sfx.py only)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const tap = (i, from, g) => a(L(i) + (from || 0), 'fill', g || 0.22, Math.max(0.5, D(i) - (from || 0) - 0.2));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: stop!
tap(0, 0, 0.2); a(L(0) + 1.0, 'boom', 0.3); a(L(0) + 1.05, 'pop', 0.8); a(L(0) + 0.9, 'pop', 0.6); a(L(0) + 2.2, 'pop', 0.5);
// 1: washing, the family falls sick
tap(1, 0, 0.2); a(L(1) + 0.3, 'pop', 0.5); for (let k = 0; k < 3; k++) a(L(1) + 2.3 + k * 0.35, 'plunk', 0.4); a(L(1) + 2.4, 'pop', 0.7);
// 2: brand
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5);
// 3: magnifier reveals the germs
a(L(3) + 0.5, 'charge', 0.3); a(L(3) + 1.6, 'pop', 0.6); a(L(3) + 2.6, 'pop', 0.6); a(L(3) + 0.3, 'pop', 0.4);
// 4: hen gut → meat
a(L(4) + 0.5, 'pop', 0.5); for (let k = 0; k < 5; k++) a(L(4) + 0.6 + k * 0.15, 'tick', 0.15); a(L(4) + 1.8, 'wipe', 0.3); a(L(4) + 2.3, 'pop', 0.6);
// 5: UK, more than half
a(L(5) + 0.3, 'pop', 0.6); a(L(5) + 1.0, 'charge', 0.3); for (let k = 0; k < 6; k++) a(L(5) + 1.2 + k * 0.2, 'pop', 0.25); a(L(5) + 2.2, 'ping', 0.4);
// 6: water carries them
tap(6, 0, 0.18); for (let k = 0; k < 3; k++) a(L(6) + 0.8 + k * 1.0, 'drop', 0.4); a(L(6) + 1.8, 'pop', 0.6);
// 7: the splash
tap(7, 0, 0.3); a(L(7) + 0.3, 'splash', 0.4); a(L(7) + 1.2, 'spray', 0.3, D(7) - 1.4); a(L(7) + 0.8, 'pop', 0.6);
// 8: farther than you think
tap(8, 0, 0.2); a(L(8) + 0.4, 'spray', 0.3, 1.6); a(L(8) + 0.5, 'pop', 0.5); a(L(8) + 2.2, 'pop', 0.7); a(L(8) + 2.3, 'beep', 0.3);
// 9: counter, plates, vegetables, clothes
tap(9, 0, 0.15); [0.2, 1.0, 1.8, 2.8].forEach((s, k) => { a(L(9) + s, 'pop', 0.6); a(L(9) + s + 0.1, 'drip', 0.35); });
// 10: the US experiment
a(L(10) + 0.3, 'pop', 0.5); a(L(10) + 1.4, 'pop', 0.7); a(L(10) + 1.5, 'ping', 0.35); a(L(10) + 2.4, 'paper', 0.4);
// 11: 60% in the sink
a(L(11) + 0.3, 'charge', 0.3); for (let k = 0; k < 10; k++) a(L(11) + 0.8 + k * 0.12, 'pop', 0.2); a(L(11) + 1.9, 'beep', 0.35); a(L(11) + 1.2, 'pop', 0.6);
// 12: cleaning, still 14%
a(L(12) + 0.2, 'squeeze', 0.35); a(L(12) + 0.3, 'wipe', 0.35, 1.5); a(L(12) + 1.0, 'chime', 0.3); a(L(12) + 2.2, 'pop', 0.7); a(L(12) + 2.3, 'beep', 0.3);
// 13: a quarter, onto the salad
a(L(13) + 0.4, 'pop', 0.6); a(L(13) + 0.6, 'charge', 0.25); for (let k = 0; k < 7; k++) a(L(13) + 1.2 + k * 0.15, 'pop', 0.2); a(L(13) + 1.8, 'pop', 0.6);
// 14: straight into your stomach
a(L(14) + 0.3, 'pop', 0.6); a(L(14) + 0.4, 'beep', 0.3); a(L(14) + 1.2, 'plunk', 0.4); a(L(14) + 1.6, 'pop', 0.7); a(L(14) + 2.2, 'thud', 0.3);
// 15: a few hundred
a(L(15) + 0.3, 'drop', 0.4); a(L(15) + 0.6, 'charge', 0.3); for (let k = 0; k < 12; k++) a(L(15) + 1.2 + k * 0.1, 'pop', 0.15); a(L(15) + 1.8, 'pop', 0.7);
// 16: sick, and those most at risk
[0.2, 0.6, 1.0].forEach(s => a(L(16) + s, 'pop', 0.6)); a(L(16) + 0.4, 'creak', 0.25); [1.8, 2.2, 2.6].forEach(s => a(L(16) + s, 'pop', 0.5)); a(L(16) + 3.0, 'beep', 0.3);
// 17: vinegar, lemon, flour
a(L(17) + 0.2, 'pop', 0.6); a(L(17) + 0.6, 'slosh', 0.3); a(L(17) + 1.6, 'chime', 0.35); a(L(17) + 2.8, 'pop', 0.7); a(L(17) + 2.9, 'beep', 0.3);
// 18: the fire kills
a(L(18), 'sizzle', 0.35, D(18)); a(L(18) + 0.3, 'pop', 0.7); for (let k = 0; k < 6; k++) a(L(18) + 0.9 + k * 0.2, 'spark', 0.25);
// 19: 74 degrees
a(L(19), 'sizzle', 0.2, D(19)); for (let k = 0; k < 10; k++) a(L(19) + 0.4 + k * 0.2, 'tick', 0.15); a(L(19) + 2.4, 'ping', 0.45); a(L(19) + 2.4, 'pop', 0.7);
// 20: they die
a(L(20), 'steam', 0.2, D(20)); a(L(20) + 0.6, 'pop', 0.7); a(L(20) + 1.8, 'pop', 0.5); a(L(20) + 2.2, 'chime', 0.4);
// 21: knife, kitchen paper, bin
for (let k = 0; k < 4; k++) a(L(21) + 0.3 + k * 0.35, 'snip', 0.3); a(L(21) + 1.9, 'paper', 0.4); a(L(21) + 2.3, 'clank', 0.35); a(L(21) + 0.3, 'pop', 0.5);
// 22: two boards
a(L(22) + 0.3, 'pop', 0.6); a(L(22) + 0.9, 'wipe', 0.3); a(L(22) + 1.2, 'pop', 0.6); a(L(22) + 1.5, 'thud', 0.3);
// 23: 20 seconds of soap
tap(23, 0, 0.18); a(L(23) + 0.3, 'squeeze', 0.35); a(L(23) + 0.4, 'fizz', 0.25, D(23) - 0.6); for (let k = 0; k < 8; k++) a(L(23) + 0.6 + k * 0.4, 'tick', 0.15); a(L(23) + 1.4, 'pop', 0.6);
// 24: scrub the sink and counter
a(L(24) + 0.2, 'wipe', 0.35, D(24) - 0.4); a(L(24) + 0.3, 'pop', 0.6); a(L(24), 'steam', 0.15, D(24)); a(L(24) + 1.6, 'chime', 0.35);
// 25: your hands and your kitchen
tap(25, 0, 0.15); a(L(25) + 0.6, 'pop', 0.6); a(L(25) + 0.8, 'chime', 0.4); a(L(25) + 1.8, 'pop', 0.6);
// 26: share
a(L(26) + 0.3, 'notify', 0.4); for (let k = 0; k < 4; k++) a(L(26) + 0.4 + k * 0.3, 'pop', 0.5);
// 27: outro
a(L(27), 'sizzle', 0.15, D(27)); a(L(27) + 0.4, 'pop', 0.8); a(L(27) + 0.5, 'bell', 0.35);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length, 'cues');
