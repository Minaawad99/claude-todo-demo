// Sound cues from the line timings: node cues.js → cues.json
// Synthesized for now (audio/sfx.py fx_*); recorded Pixabay clips go in sfx/px-*.mp3 (kept out of git).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the oven runs, the timer counts down, ding
a(L(0), 'hum', 0.3, D(0) - 0.5); a(L(0) + D(0) - 0.55, 'chime', 0.6); for (let k = 0; k < 6; k++) a(L(0) + 0.2 + k * 0.5, 'tick', 0.18);
// 1: no fire, no heater
a(L(1) + 0.6, 'thud', 0.4); a(L(1) + 0.8, 'pop', 0.5); a(L(1) + 1.2, 'pop', 0.5);
// 2: the fork sparks
a(L(2) + 0.6, 'zap', 0.5); a(L(2) + 1.1, 'spark', 0.5); a(L(2) + 1.7, 'zap', 0.4);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the lens over the glass
a(L(4) + 0.3, 'wipe', 0.4); a(L(4) + 1.2, 'pop', 0.6);
// 5: slow side, fast side
for (let k = 0; k < 10; k++) a(L(5) + 1.2 + k * 0.18, 'tick', 0.2); a(L(5) + 0.3, 'pop', 0.5); a(L(5) + 1.4, 'pop', 0.6);
// 6: rice, vegetables, chicken
a(L(6) + 0.4, 'pop', 0.5); a(L(6) + 0.8, 'pop', 0.5); a(L(6) + 1.2, 'pop', 0.5); a(L(6) + 2.2, 'drip', 0.5);
// 7: + and −, a little magnet
a(L(7) + 0.4, 'pop', 0.5); a(L(7) + 1.0, 'pop', 0.5); a(L(7) + 1.8, 'clank', 0.3);
// 8: the compass needle turns
a(L(8) + 0.3, 'servo', 0.3, 1.2); a(L(8) + 1.4, 'pop', 0.6);
// 9: the wave and its counter
a(L(9), 'hum', 0.25, D(9)); for (let k = 0; k < 14; k++) a(L(9) + 0.2 + k * 0.2, 'tick', 0.2); a(L(9) + 1.6, 'ping', 0.5);
// 10: back and forth, bumping
for (let k = 0; k < 6; k++) a(L(10) + 0.3 + k * 0.5, 'bump', 0.25); a(L(10) + 0.6, 'pop', 0.5);
// 11: faster, hotter
a(L(11) + 0.2, 'sizzle', 0.35, 1.6); a(L(11) + 1.0, 'pop', 0.6);
// 12: the magnetron and the waveguide
a(L(12), 'hum', 0.35, D(12)); a(L(12) + 0.4, 'pop', 0.6); a(L(12) + 1.4, 'pop', 0.5);
// 13: bouncing off the walls
for (let k = 0; k < 4; k++) a(L(13) + 0.3 + k * 0.7, 'ping', 0.25); a(L(13) + 2.0, 'pop', 0.5);
// 14: hot and cold spots
a(L(14) + 0.8, 'pop', 0.5); a(L(14) + 1.4, 'pop', 0.5);
// 15: the turntable turns
a(L(15), 'motor', 0.3, D(15)); a(L(15) + 0.4, 'pop', 0.6);
// 16: the fork reflects and sparks
a(L(16) + 1.0, 'zap', 0.5); a(L(16) + 1.6, 'spark', 0.5); a(L(16) + 2.4, 'zap', 0.4); a(L(16) + 0.4, 'pop', 0.5);
// 17: one or two centimetres
a(L(17) + 0.6, 'pop', 0.6); a(L(17) + 1.4, 'sizzle', 0.25, 1.0);
// 18: the heat crawls in, the clock
for (let k = 0; k < 10; k++) a(L(18) + 0.3 + k * 0.5, 'tick', 0.2); a(L(18) + 1.6, 'pop', 0.6);
// 19: 1945, a radar
for (let k = 0; k < 8; k++) a(L(19) + 0.1 + k * 0.18, 'tick', 0.25); a(L(19) + 0.6, 'ping', 0.4); a(L(19) + 1.8, 'pop', 0.6);
// 20: the chocolate melts
a(L(20), 'hum', 0.2, D(20)); a(L(20) + 0.5, 'pop', 0.5); a(L(20) + 2.2, 'squeeze', 0.4);
// 21: popcorn
for (let k = 0; k < 9; k++) a(L(21) + 0.5 + k * 0.2 + (k % 3) * 0.05, 'pop', 0.4 + (k % 2) * 0.2); a(L(21) + 1.2, 'chime', 0.3);
// 22: the Radarange, 340 kilos
a(L(22) + 0.4, 'thud', 0.6); for (let k = 0; k < 12; k++) a(L(22) + 0.2 + k * 0.2, 'tick', 0.2); a(L(22) + 0.6, 'pop', 0.5);
// 23: numbered parts
a(L(23) + 0.4, 'pop', 0.6); a(L(23) + 1.8, 'pop', 0.6); a(L(23) + 3.2, 'pop', 0.6); a(L(23), 'hum', 0.2, D(23));
// 24: outro
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
