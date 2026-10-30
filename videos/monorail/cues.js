// Sound cues from the line timings: node cues.js → cues.json
// Recorded sounds in sfx/px-*.mp3 are Pixabay sound effects (Pixabay Content License) the channel sent for earlier episodes
// (city traffic, a car passing, electric hum, power buzz, wind, breeze, a ding, a door, a splash, a river, a warning beep,
// a clock, sparks), kept out of git. Clips asked for and not here yet fall back to synthesized sounds (see HAVE).
// No recorded sound plays in two shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs'), HAVE = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
// the monorail going past: the recorded pass-by (its loud part is around 82–95 s in the clip), else a soft whoosh over an electric hum
let po = 0; const pass = (t, g, dur) => HAVE('monorail-pass') ? rec(t, 'monorail-pass', g, 82 + (po++ % 4) * 1.5, dur, 1.0) : (a(t, 'whoosh', g * 0.8), a(t + 0.1, 'hum', g * 0.4, dur));
const clatter = (t, g, dur) => { if (HAVE('train-clatter')) rec(t, 'train-clatter', g, 6 + (t % 30), dur, 1.0); else for (let k = 0; k < dur / 0.25; k++) a(t + k * 0.25, k % 2 ? 'clank' : 'thud', g * 0.5); };
const trumpet = (t, g) => HAVE('elephant') ? rec(t, 'elephant', g, 0, 2.2, 0.8) : a(t, 'notify', g);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: New Cairo street, the train overhead
bed(0, 'traffic-bridge', 0.35, 5); pass(L(0) + 1.0, 0.6, 3); a(L(0) + 2.4, 'pop', 0.6);
// 1: less than a metre wide
bed(1, 'breeze', 0.3, 10); a(L(1) + 1.2, 'pop', 0.6); a(L(1) + 0.4, 'pop', 0.4);
// 2: on a curve, why doesn't it fall?
rec(L(2), 'electric-hum', 0.3, 2, D(2), 1.2); a(L(2) + 1.0, 'pop', 0.6);
// 3: brand
bed(3, 'traffic-bridge', 0.3, 30); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the monorail
pass(L(4) + 0.2, 0.5, 2.5); rec(L(4) + 1.6, 'ding', 0.5, 0, 1.1, 0.8); a(L(4) + 0.5, 'pop', 0.6);
// 5: a normal train: steel on steel
clatter(L(5) + 0.2, 0.45, D(5) - 0.4); a(L(5) + 0.8, 'pop', 0.5); a(L(5) + 1.8, 'pop', 0.5);
// 6: like riding a horse
for (let k = 0; k < 12; k++) a(L(6) + 0.2 + k * 0.24, 'thud', k % 2 ? 0.15 : 0.22); a(L(6) + 0.9, 'pop', 0.6);
// 7: the body wraps the beam
bed(7, 'breeze', 0.3, 30); a(L(7) + 0.9, 'pop', 0.6); a(L(7) + 0.4, 'servo', 0.3);
// 8: rubber load tyres carry the weight
a(L(8) + 0.3, 'thud', 0.5); a(L(8) + 0.8, 'pop', 0.6); rec(L(8) + 0.2, 'electric-hum', 0.25, 9, D(8) - 0.2, 1.2);
// 9: guide tyres left and right
a(L(9) + 0.4, 'clink', 0.3); a(L(9) + 0.6, 'clink', 0.3); a(L(9) + 0.8, 'pop', 0.6);
// 10: strong wind, no lean
rec(L(10), 'wind', 0.45, 3, D(10) + 0.2, 1.2); a(L(10) + 0.6, 'pop', 0.5); a(L(10) + 1.8, 'pop', 0.5);
// 11: the third set of tyres
a(L(11) + 0.4, 'servo', 0.3); a(L(11) + 0.8, 'pop', 0.6); a(L(11) + 1.6, 'thud', 0.3);
// 12: power rails on the beam
rec(L(12), 'power-buzz', 0.35, 1, D(12), 1.2); rec(L(12) + 0.6, 'sparks', 0.3, 2, 0.6); a(L(12) + 0.8, 'pop', 0.6);
// 13: rubber is quieter than steel
clatter(L(13) + 0.2, 0.4, 1.4); a(L(13) + 0.5, 'pop', 0.5); a(L(13) + 1.6, 'pop', 0.5); pass(L(13) + 1.8, 0.3, 1.4);
// 14: steeper slopes
bed(14, 'breeze', 0.3, 60); a(L(14) + 0.3, 'motor', 0.25, D(14) - 0.6); a(L(14) + 1.0, 'pop', 0.6);
// 15: changing line on one beam?
pass(L(15) + 0.2, 0.35, 2); a(L(15) + 0.6, 'pop', 0.5);
// 16: the beam moves
a(L(16) + 0.5, 'servo', 0.45); a(L(16) + 2.1, 'clank', 0.5); a(L(16) + 0.8, 'pop', 0.6);
// 17: no driver, the computer stops it at the station
rec(L(17) + 0.3, 'beep-warning', 0.35, 0, 1.6, 1.0); rec(L(17) + 2.2, 'door', 0.4, 0, 1.6, 1.0); a(L(17) + 1.0, 'pop', 0.5); a(L(17) + 0.5, 'notify', 0.3);
// 18: up on piers over the street
bed(18, 'traffic-bridge', 0.35, 50); rec(L(18) + 1.0, 'car-pass', 0.4, 0, 2.5, 1.0); a(L(18) + 0.7, 'pop', 0.5); a(L(18) + 1.8, 'pop', 0.5);
// 19: the Cairo lines on the map
for (let k = 0; k < 6; k++) a(L(19) + 0.3 + k * 0.25, 'tick', 0.2); a(L(19) + 0.9, 'pop', 0.5); a(L(19) + 1.3, 'pop', 0.5); a(L(19) + 2.4, 'pop', 0.5);
// 20: about 100 km
rec(L(20), 'clock', 0.3, 0, 2.6, 1.2); a(L(20) + 2.6, 'chime', 0.5);
// 21: Germany, 1901, over the river
bed(21, 'river', 0.35, 5); pass(L(21) + 0.6, 0.35, 2.4); a(L(21) + 0.6, 'pop', 0.5); a(L(21) + 1.6, 'pop', 0.5);
// 22: hanging under the beam
bed(22, 'breeze', 0.3, 80); a(L(22) + 0.4, 'creak', 0.4); a(L(22) + 1.0, 'pop', 0.6);
// 23: Tuffi the elephant rides it, 1950
trumpet(L(23) + 1.2, 0.55); a(L(23) + 0.8, 'pop', 0.6); a(L(23) + 1.6, 'pop', 0.5);
// 24: she jumps into the river
bed(24, 'river', 0.3, 30); rec(L(24) + 1.4, 'rock-splash', 0.6, 0, 1.8, 0.8); a(L(24) + 1.0, 'pop', 0.6); a(L(24) + 2.4, 'pop', 0.5);
// 25: the payoff: tyres on every side
rec(L(25), 'electric-hum', 0.25, 15, D(25), 1.2); a(L(25) + 0.8, 'pop', 0.6); a(L(25) + 1.4, 'chime', 0.5);
// 26: outro
rec(L(26), 'traffic-bridge', 0.3, 70, D(26) + 1.5, 1.0); pass(L(26) + 0.4, 0.4, 2.5); a(L(26) + 0.4, 'pop', 0.7);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
