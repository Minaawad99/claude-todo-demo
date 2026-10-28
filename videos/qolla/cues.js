// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) downloaded by the channel and kept out of
// git; short UI sounds (whoosh, pop, tick, chime) stay synthesized.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
let co = 0; const cicadas = (i, g) => { rec(L(i), 'cicadas', g, 2 + (co * 9.3) % 60, D(i) + 0.2, 1.5); co++; };   // summer bed, a different stretch each time
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: pouring from the qolla into a glass, a clink, a happy pop
cicadas(0, 0.35); rec(L(0) + 0.15, 'ceramic', 0.5, 0.5, 0.5); rec(L(0) + 0.6, 'pour', 0.8, 0.9, 2.2); a(L(0) + 2.7, 'clink', 0.5); a(L(0) + 3.0, 'pop', 0.6);
// 1: no plug, no motor
rec(L(1) + 0.3, 'ceramic', 0.6, 1.15, 0.45); a(L(1) + 0.8, 'thud', 0.4); a(L(1) + 1.0, 'pop', 0.5); a(L(1) + 1.6, 'pop', 0.5);
// 2: plain vs painted
rec(L(2) + 0.6 - 0.48, 'drop', 0.6, 0, 0.6); a(L(2) + 1.5, 'clink', 0.4); a(L(2) + 1.0, 'pop', 0.6);
// 3: brand
cicadas(3, 0.35); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the lens zooms into the wall
a(L(4) + 0.3, 'wipe', 0.4); a(L(4) + 1.4, 'pop', 0.6);
// 5: water seeping through the pores
a(L(5) + 0.2, 'slosh', 0.4, 2.4); a(L(5) + 1.7, 'drip', 0.5); a(L(5) + 2.4, 'drip', 0.4);
// 6: the qolla sweats
rec(L(6) + 0.4 - 0.48, 'drop', 0.6, 0, 0.55); rec(L(6) + 1.6 - 1.57, 'drop', 0.55, 1.4, 0.45); rec(L(6) + 2.3 - 2.08, 'drop', 0.5, 1.9, 0.5); a(L(6) + 0.9, 'pop', 0.6);
// 7: evaporation
cicadas(7, 0.35); a(L(7) + 0.1, 'steam', 0.3, D(7)); a(L(7) + 0.5, 'pop', 0.5);
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
rec(L(15), 'breeze', 0.8, 10, D(15) + 0.2, 1.2); a(L(15) + 0.5, 'creak', 0.3);
// 16: humid air
a(L(16) + 0.2, 'hum', 0.2, D(16) - 0.4); a(L(16) + 0.6, 'pop', 0.5); a(L(16) + 2.0, 'pop', 0.5);
// 17: paint seals the pores
a(L(17) + 0.4, 'thud', 0.5); a(L(17) + 1.0, 'clank', 0.3); a(L(17) + 1.4, 'pop', 0.5);
// 18: sweat
cicadas(18, 0.3); a(L(18) + 0.3, 'steam', 0.3, 2.0); a(L(18) + 1.6, 'chime', 0.4);
// 19: the potter's wheel in Qena
a(L(19), 'servo', 0.3, D(19) - 0.2); a(L(19) + 1.8, 'pop', 0.6);
// 20: the teacher, 1995
for (let k = 0; k < 8; k++) a(L(20) + 0.1 + k * 0.16, 'tick', 0.25); a(L(20) + 1.4, 'pop', 0.6);
// 21: pot in pot, sand poured, cloth on
rec(L(21) + 0.1, 'ceramic', 0.6, 3.1, 0.6); rec(L(21) + 0.8, 'sand', 0.8, 4.0, 1.9); a(L(21) + 2.3, 'paper', 0.4);
// 22: the calendar runs to 21 days
for (let k = 0; k < 14; k++) a(L(22) + 0.15 * k, 'tick', 0.22); a(L(22) + 2.2, 'chime', 0.5);
// 23: the cold sip
cicadas(23, 0.3); rec(L(23) + 0.2, 'pour', 0.6, 3, 1.0); rec(L(23) + 1.2, 'gulp', 0.8, 4.25, 2.6); a(L(23) + 0.8, 'pop', 0.5); a(L(23) + 1.6, 'clink', 0.4);
// 24: outro
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
