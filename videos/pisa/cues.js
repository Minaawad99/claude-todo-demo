// Sound cues from the line timings: node cues.js → cues.json. All sounds are synthesized in ../audio/sfx.py
// (no recorded clips in this episode).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, extra) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}, extra || {}));
const bells = (t, g) => [523, 659, 784].forEach((f, k) => a(t + k * 0.35, 'bell', g, null, { f }));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the tourist "holds up" the tower, a phone takes the photo
a(L(0) + 0.3, 'wind', 0.12, D(0)); a(L(0) + 0.8, 'bump', 0.4); a(L(0) + 2.4, 'notify', 0.4); a(L(0) + 1.1, 'pop', 0.6);
// 1: 600 years
a(L(1) + 1.0, 'pop', 0.6); a(L(1) + 2.0, 'pop', 0.5); a(L(1) + 0.3, 'creak', 0.2);
// 2: people walking under it
a(L(2) + 0.4, 'creak', 0.3); a(L(2) + 1.0, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the bell tower
a(L(4) + 0.6, 'pop', 0.5); a(L(4) + 1.2, 'pop', 0.5); bells(L(4) + 2.0, 0.35); a(L(4) + 2.4, 'pop', 0.5);
// 5: 1173, built floor by floor, 56 m
for (let k = 0; k < 7; k++) a(L(5) + 0.3 + k * (D(5) * 0.8 / 7), 'thud', 0.25); a(L(5) + 1.6, 'pop', 0.6);
// 6: 14,500 tonnes pressing down
a(L(6) + 0.3, 'boom', 0.35); a(L(6) + 0.8, 'pop', 0.7); a(L(6) + 2.0, 'pop', 0.5);
// 7: clay, sand, water, a sponge
a(L(7) + 0.3, 'slosh', 0.3); a(L(7) + 0.6, 'pop', 0.5); a(L(7) + 1.4, 'pop', 0.5); a(L(7) + 2.2, 'drip', 0.5); a(L(7) + 3.0, 'squeeze', 0.3);
// 8: only 3 m deep
a(L(8) + 0.4, 'pop', 0.5); a(L(8) + 1.2, 'pop', 0.7); a(L(8) + 1.0, 'thud', 0.3);
// 9: the second floor; it starts to sink
a(L(9) + 0.3, 'thud', 0.3); a(L(9) + 0.4, 'pop', 0.5); a(L(9) + 1.4, 'creak', 0.5); a(L(9) + 2.0, 'pop', 0.6);
// 10: war
for (let k = 0; k < 6; k++) a(L(10) + 0.5 + k * 0.52, 'clink', 0.35); a(L(10) + 0.6, 'pop', 0.6); a(L(10) + 1.8, 'pop', 0.6);
// 11: years pass, the clay firms up
for (let k = 0; k < 14; k++) a(L(11) + 0.2 + k * (D(11) - 0.4) / 14, 'tick', 0.35); a(L(11) + 1.6, 'pop', 0.6);
// 12: what if they'd kept going: it falls
a(L(12) + 0.6, 'creak', 0.5); a(L(12) + 2.1, 'boom', 0.6); a(L(12) + 2.4, 'pop', 0.6); a(L(12) + 2.6, 'beep', 0.3);
// 13: taller floors on the low side
for (let k = 0; k < 5; k++) a(L(13) + 0.4 + k * 0.6, 'thud', 0.22); a(L(13) + 1.4, 'pop', 0.6);
// 14: bent like a banana
a(L(14) + 0.3, 'servo', 0.3); a(L(14) + 1.8, 'pop', 0.6); a(L(14) + 2.4, 'notify', 0.3);
// 15: finished, 1372, bells
a(L(15) + 0.3, 'pop', 0.5); a(L(15) + 1.2, 'pop', 0.5); bells(L(15) + 1.4, 0.35); a(L(15) + 2.2, 'pop', 0.5);
// 16: the centre of gravity
a(L(16) + 0.6, 'pop', 0.6); a(L(16) + 1.0, 'laser', 0.3); a(L(16) + 2.2, 'ping', 0.4);
// 17: inside = stands, outside = falls
a(L(17) + 0.3, 'laser', 0.3); a(L(17) + 1.2, 'chime', 0.4); a(L(17) + 2.0, 'creak', 0.4); a(L(17) + 3.0, 'beep', 0.4); a(L(17) + 2.6, 'pop', 0.5);
// 18: the lean grows to 5.5 degrees
a(L(18) + 0.3, 'pop', 0.5); a(L(18) + 0.5, 'creak', 0.45, 2.4); for (let k = 0; k < 10; k++) a(L(18) + 0.4 + k * 0.35, 'tick', 0.25);
// 19: closed; lead ingots stacked
a(L(19) + 0.4, 'pop', 0.6); for (let k = 0; k < 8; k++) a(L(19) + 1.5 + k * 0.25, 'clank', 0.22); a(L(19) + 1.8, 'pop', 0.6);
// 20: drilling clay out
a(L(20) + 0.2, 'motor', 0.3, D(20) - 0.5); a(L(20) + 1.4, 'pop', 0.6); a(L(20) + 2.4, 'pop', 0.5);
// 21: it settles back 45 cm; stable for 200 years
a(L(21) + 0.4, 'servo', 0.4); a(L(21) + 1.2, 'pop', 0.6); a(L(21) + 3.4, 'pop', 0.5); a(L(21) + 4.0, 'chime', 0.45);
// 22: four earthquakes
a(L(22) + 0.1, 'idle', 0.4, D(22) - 0.4, { rate: 9 }); a(L(22) + 0.8, 'pop', 0.6); a(L(22) + 2.0, 'pop', 0.5);
// 23: it stands by itself
a(L(23) + 1.0, 'whoosh', 0.3); a(L(23) + 2.0, 'chime', 0.5); a(L(23) + 2.1, 'pop', 0.5);
// 24: outro
a(L(24) + 0.4, 'pop', 0.8); bells(L(24) + 0.8, 0.3);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c.sort((x, y) => x.t - y.t) }, null, 0));
console.log(c.length, 'cues');
