// Sound cues for the cartoon version of «السحابة وزنها كام؟»: node cues-cartoon.js → cues-cartoon.json, then
//   python3 ../audio/sfx.py voice.wav cues-cartoon.json <scratchpad>/clouds-cartoon-mix.wav
// Synthesized effects only (audio/sfx.py fx_*), a whoosh before every line. No background music and no bed: the user's rule.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the street, a breeze, the cloud overhead
a(L(0), 'wind', 0.25, D(0)); a(L(0) + 0.9, 'pop', 0.5);
// 1: the balance tips, the elephants go up
a(L(1) + 0.15, 'creak', 0.35); a(L(1) + 0.9, 'thud', 0.4); a(L(1) + 0.75, 'pop', 0.6); a(L(1) + 1.3, 'pop', 0.5);
// 2: floating; the «fall» is crossed out
a(L(2), 'wind', 0.2, D(2)); a(L(2) + 0.95, 'snip', 0.5); a(L(2) + 1.15, 'pop', 0.6);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the kilometre box: three edges
[0.36, 0.56, 0.78].forEach(k => { a(L(4) + D(4) * k, 'tick', 0.4); a(L(4) + D(4) * k + 0.1, 'pop', 0.5); });
// 5: a cubic metre, half a gram
a(L(5) + 0.45, 'pop', 0.5); a(L(5) + 1.7, 'drip', 0.5); a(L(5) + 1.8, 'pop', 0.6);
// 6: the sum, 500 tonnes, the herd walks in
a(L(6) + 0.35, 'pop', 0.5); a(L(6) + D(6) * 0.42, 'chime', 0.5); a(L(6) + D(6) * 0.42 + 0.1, 'pop', 0.7);
for (let k = 0; k < 6; k++) a(L(6) + D(6) * 0.77 + k * 0.16, 'thud', 0.3); a(L(6) + D(6) * 0.8, 'notify', 0.35);
// 7: the hanging weight
a(L(7) + 0.2, 'creak', 0.4); a(L(7) + 0.9, 'clank', 0.3); a(L(7) + 1.1, 'pop', 0.5);
// 8: the blackboard
a(L(8) + 0.3, 'tick', 0.4); a(L(8) + 0.5, 'tick', 0.35); a(L(8) + 1.2, 'tick', 0.4); a(L(8) + 1.45, 'tick', 0.35); a(L(8) + 1.7, 'tick', 0.35);
// 9: the boulder drops fast, the speck drifts
a(L(9) + 0.3, 'whoosh', 0.35); a(L(9) + 1.3, 'whoosh', 0.3); a(L(9) + 0.85, 'pop', 0.5); a(L(9) + 1.75, 'pop', 0.5);
// 10: inside the cloud: droplets
for (let k = 0; k < 6; k++) a(L(10) + 0.3 + k * 0.45, 'drip', 0.3); a(L(10) + D(10) * 0.3, 'pop', 0.5); a(L(10) + D(10) * 0.68, 'pop', 0.7);
// 11: droplet against a hair
a(L(11) + 0.55, 'pop', 0.6); a(L(11) + 0.7, 'ping', 0.35); a(L(11) + D(11) * 0.58, 'pop', 0.5);
// 12: one centimetre a second (slow ticks), then the dusty sunbeam
for (let k = 0; k < 3; k++) a(L(12) + 0.4 + k * 1.0, 'tick', 0.35); a(L(12) + D(12) * 0.2, 'pop', 0.6); a(L(12) + D(12) * 0.56, 'wipe', 0.35); a(L(12) + D(12) * 0.62, 'pop', 0.5);
// 13: the air goes up
a(L(13) + D(13) * 0.5, 'wind', 0.35, D(13) * 0.5); a(L(13) + D(13) * 0.55, 'pop', 0.6);
// 14: the Sun heats the ground, the warm air lifts the cloud
a(L(14) + 0.3, 'sizzle', 0.2, 1.2); a(L(14) + 0.55, 'pop', 0.5); a(L(14) + D(14) * 0.28, 'wind', 0.35, D(14) * 0.7); a(L(14) + D(14) * 0.32, 'pop', 0.6); a(L(14) + D(14) * 0.82, 'chime', 0.4);
// 15: a million tonnes of air
a(L(15) + 0.5, 'pop', 0.5); a(L(15) + D(15) * 0.55, 'thud', 0.5); a(L(15) + D(15) * 0.55 + 0.05, 'pop', 0.7);
// 16: the balance again
a(L(16) + 0.15, 'creak', 0.35); a(L(16) + 0.9, 'thud', 0.4); a(L(16) + 0.95, 'pop', 0.5); a(L(16) + D(16) * 0.5, 'pop', 0.6);
// 17: droplets bump and merge
a(L(17) + 0.9, 'plunk', 0.4); a(L(17) + 1.5, 'plunk', 0.4); a(L(17) + 2.1, 'plunk', 0.45); a(L(17) + 2.7, 'splash', 0.3); a(L(17) + D(17) * 0.45, 'pop', 0.5);
// 18: a million into one raindrop
for (let k = 0; k < 8; k++) a(L(18) + 0.3 + k * 0.2, 'drip', 0.25); a(L(18) + D(18) * 0.5, 'chime', 0.45); a(L(18) + D(18) * 0.5 + 0.1, 'pop', 0.7);
// 19: rain
a(L(19), 'spray', 0.3, D(19)); for (let k = 0; k < 6; k++) a(L(19) + 0.2 + k * 0.33, 'drip', 0.3); a(L(19) + 0.85, 'pop', 0.6);
// 20: the myth, crossed out
a(L(20) + 0.4, 'pop', 0.4); a(L(20) + D(20) * 0.6, 'snip', 0.55); a(L(20) + D(20) * 0.66, 'bump', 0.4);
// 21: the kettle
a(L(21), 'steam', 0.3, D(21) * 0.9); a(L(21) + 0.45, 'pop', 0.5); a(L(21) + D(21) * 0.28, 'pop', 0.6); a(L(21) + D(21) * 0.55, 'drip', 0.4); a(L(21) + D(21) * 0.78, 'ping', 0.35);
// 22: recap
a(L(22), 'wind', 0.25, D(22)); [0.25, 0.5, 0.72].forEach(k => a(L(22) + D(22) * k, 'pop', 0.6));
// 23: the thunderstorm cloud
a(L(23), 'spray', 0.22, D(23)); a(L(23) + 0.9, 'boom', 0.45); a(L(23) + D(23) * 0.42, 'pop', 0.7); a(L(23) + D(23) * 0.7, 'boom', 0.3); a(L(23) + D(23) * 0.8, 'pop', 0.5);
// 24–25: outro
a(L(24) + 0.3, 'chime', 0.45); a(L(24) + 0.35, 'pop', 0.6); a(L(25) + 0.4, 'pop', 0.7); a(L(25) + 0.6, 'notify', 0.35);
fs.writeFileSync(__dirname + '/cues-cartoon.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
