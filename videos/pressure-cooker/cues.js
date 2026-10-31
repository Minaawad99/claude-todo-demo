// Sound cues from the line timings: node cues.js → cues.json
// Synthesized effects only (audio/sfx.py): steam, hiss and the whistle come from the steam/spray/notify generators.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const whistle = (t, g, n) => { for (let k = 0; k < n; k++) { a(t + k * 1.26, 'steam', g, 0.6); a(t + k * 1.26 + 0.05, 'ping', g * 0.4); } };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the whistle
a(L(0), 'sizzle', 0.2, D(0)); whistle(L(0) + 0.2, 0.55, 3); a(L(0) + 0.5, 'pop', 0.6);
// 1: two clocks
for (let k = 0; k < 8; k++) a(L(1) + 0.3 + k * 0.45, 'tick', 0.3); a(L(1) + 0.6, 'pop', 0.5); a(L(1) + 1.6, 'pop', 0.5);
// 2: shaking, could it explode?
a(L(2), 'slosh', 0.3, D(2)); whistle(L(2) + 0.2, 0.4, 2); a(L(2) + 0.5, 'beep', 0.4); a(L(2) + 1.2, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4–6: the plain pot boiling
a(L(4), 'sizzle', 0.3, D(4) + D(5) + D(6)); a(L(4) + 0.5, 'pop', 0.6); a(L(5), 'steam', 0.3, D(5)); a(L(5) + 0.8, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(6) + 0.2 + k * 0.45, 'tick', 0.3); a(L(6) + 0.6, 'pop', 0.6);
// 7: the lid locks
a(L(7) + 1.2, 'clank', 0.6); a(L(7) + 1.4, 'clink', 0.4); a(L(7) + 1.8, 'pop', 0.5);
// 8: pressure climbs
a(L(8), 'fill', 0.3, D(8)); a(L(8) + 0.8, 'pop', 0.5); a(L(8) + 0.3, 'creak', 0.3);
// 9: molecules pushed back
for (let k = 0; k < 6; k++) a(L(9) + 0.3 + k * 0.45, 'bump', 0.25); a(L(9) + 0.8, 'pop', 0.5);
// 10: the thermometer climbs to 120
a(L(10) + 0.3, 'spool', 0.35); a(L(10) + 2.3, 'ping', 0.5);
// 11: a third of the time
a(L(11) + 0.4, 'pop', 0.6); a(L(11) + 1.8, 'pop', 0.6); a(L(11) + 1.9, 'chime', 0.4);
// 12: Everest wind
a(L(12), 'wind', 0.45, D(12)); a(L(12) + 0.4, 'pop', 0.5); a(L(12) + 1.8, 'pop', 0.5);
// 13: the weight
a(L(13) + 1.6, 'clink', 0.5); a(L(13) + 1.7, 'pop', 0.5);
// 14: it lifts and whistles
whistle(L(14) + 0.3, 0.6, 3); a(L(14) + 0.8, 'pop', 0.5);
// 15: not "done"
a(L(15) + 0.4, 'pop', 0.5); a(L(15) + 1.8, 'beep', 0.4); a(L(15) + 1.9, 'pop', 0.6);
// 16: 400 kilos
a(L(16) + 0.4, 'pop', 0.5); a(L(16) + 2.2, 'thud', 0.8); a(L(16) + 2.25, 'clank', 0.4); a(L(16) + 2.6, 'pop', 0.6);
// 17: the hole clogs, the gauge rises
a(L(17), 'slosh', 0.3, D(17)); for (let k = 0; k < 8; k++) a(L(17) + 1 + k * 0.5, 'beep', 0.18 + k * 0.03); a(L(17) + 0.6, 'pop', 0.5);
// 18: the safety plug pops
a(L(18) + 0.8, 'pop', 0.8); a(L(18) + 0.85, 'spray', 0.5, 2); a(L(18) + 1.0, 'pop', 0.5);
// 19: the gasket pushed out
a(L(19) + 1.0, 'squeeze', 0.5); a(L(19) + 1.1, 'spray', 0.5, 2); a(L(19) + 1.4, 'pop', 0.5);
// 20: opened too early
a(L(20) + 0.6, 'boom', 0.5); a(L(20) + 0.65, 'splash', 0.5); a(L(20) + 2.2, 'pop', 0.6);
// 21: 1679
a(L(21) + 0.6, 'pop', 0.5); a(L(21) + 1.6, 'pop', 0.6); a(L(21), 'sizzle', 0.15, D(21));
// 22: the first pot bursts, then the valve
a(L(22) + 0.2, 'boom', 0.6); a(L(22) + 1.3, 'steam', 0.3, 1.5); a(L(22) + 1.4, 'pop', 0.6);
// 23: payoff
whistle(L(23) + 0.3, 0.45, 3); a(L(23) + 2.2, 'chime', 0.5); a(L(23) + 2.4, 'pop', 0.6);
// 24: outro
a(L(24) + 0.3, 'pop', 0.8); a(L(24) + 0.5, 'chime', 0.5);
c.sort((x, y) => x.t - y.t);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
