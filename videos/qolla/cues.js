// Sound cues from the line timings: node cues.js → cues.json
// For now every effect is synthesized (audio/sfx.py fx_*); recorded Pixabay clips go in sfx/px-*.mp3 (kept out of git).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: pouring from the qolla into a glass, a clink, a happy pop
a(L(0) + 0.6, 'fill', 0.5, 2.0); a(L(0) + 2.7, 'clink', 0.5); a(L(0) + 3.0, 'pop', 0.6);
// 1: no plug, no motor
a(L(1) + 0.8, 'thud', 0.4); a(L(1) + 1.0, 'pop', 0.5); a(L(1) + 1.6, 'pop', 0.5);
// 2: plain vs painted
a(L(2) + 0.3, 'clink', 0.4); a(L(2) + 1.0, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the lens zooms into the wall
a(L(4) + 0.3, 'wipe', 0.4); a(L(4) + 1.4, 'pop', 0.6);
// 5: water seeping through the pores
a(L(5) + 0.2, 'slosh', 0.4, 2.4); a(L(5) + 1.7, 'drip', 0.5); a(L(5) + 2.4, 'drip', 0.4);
// 6: the qolla sweats
for (let k = 0; k < 4; k++) a(L(6) + 0.4 + k * 0.6, 'drop', 0.35); a(L(6) + 0.9, 'pop', 0.6);
// 7: evaporation
a(L(7) + 0.1, 'steam', 0.35, D(7)); a(L(7) + 0.5, 'pop', 0.5);
// 8: heat taken from the jar
a(L(8) + 0.3, 'sizzle', 0.3, 1.2); a(L(8) + 0.5, 'pop', 0.6);
// 9: molecules jostling
for (let k = 0; k < 10; k++) a(L(9) + 0.2 + k * 0.22, 'tick', 0.2); a(L(9) + 0.6, 'pop', 0.5);
// 10: the fast ones fly off
a(L(10) + 0.6, 'spin', 0.4); a(L(10) + 0.8, 'pop', 0.6); a(L(10) + 1.4, 'whoosh', 0.3);
// 11: the slow ones stay, colder
a(L(11) + 0.4, 'pop', 0.5); a(L(11) + 1.6, 'chime', 0.4);
// 12: one gram → 2,400 joules
for (let k = 0; k < 12; k++) a(L(12) + 0.1 + k * 0.17, 'tick', 0.22); a(L(12) + 2.2, 'ping', 0.5);
// 13: half a litre, one degree
a(L(13) + 0.3, 'plunk', 0.5); a(L(13) + 2.0, 'beep', 0.4);
// 14: the two curves
a(L(14) + 0.2, 'wipe', 0.35); a(L(14) + D(14) * 0.6, 'pop', 0.6);
// 15: the breeze in the window
a(L(15), 'wind', 0.45, D(15)); a(L(15) + 0.5, 'creak', 0.3);
// 16: humid air
a(L(16) + 0.2, 'hum', 0.2, D(16) - 0.4); a(L(16) + 0.6, 'pop', 0.5); a(L(16) + 2.0, 'pop', 0.5);
// 17: paint seals the pores
a(L(17) + 0.4, 'thud', 0.5); a(L(17) + 1.0, 'clank', 0.3); a(L(17) + 1.4, 'pop', 0.5);
// 18: sweat
a(L(18) + 0.3, 'steam', 0.3, 2.0); a(L(18) + 1.6, 'chime', 0.4);
// 19: the potter's wheel in Qena
a(L(19), 'servo', 0.3, D(19) - 0.2); a(L(19) + 1.8, 'pop', 0.6);
// 20: the teacher, 1995
for (let k = 0; k < 8; k++) a(L(20) + 0.1 + k * 0.16, 'tick', 0.25); a(L(20) + 1.4, 'pop', 0.6);
// 21: pot in pot, sand poured, cloth on
a(L(21) + 0.2, 'clank', 0.3); a(L(21) + 0.8, 'spray', 0.4, 1.2); a(L(21) + 2.3, 'paper', 0.4);
// 22: the calendar runs to 21 days
for (let k = 0; k < 14; k++) a(L(22) + 0.15 * k, 'tick', 0.22); a(L(22) + 2.2, 'chime', 0.5);
// 23: the cold sip
a(L(23) + 0.3, 'fill', 0.35, 1.0); a(L(23) + 0.8, 'pop', 0.5); a(L(23) + 1.6, 'clink', 0.4);
// 24: outro
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
