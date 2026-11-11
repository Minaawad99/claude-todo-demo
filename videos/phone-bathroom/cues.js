// Sound cues from the line timings: node cues.js → cues.json. Synthesised effects only, no music bed (the user doesn't
// want music under the voice).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.25);
// 0 walks in: steps, a door creak; 1 sits, phone taps
for (let k = 0; k < 5; k++) a(L(0) + 0.1 + k * 0.42, 'bump', 0.3); a(L(0) + 0.05, 'creak', 0.35); a(L(0) + 1.5, 'pop', 0.55);
for (let k = 0; k < 4; k++) a(L(1) + 0.3 + k * 0.6, 'tick', 0.25); a(L(1) + 0.7, 'pop', 0.5);
// 2 germs appear on the phone
for (let k = 0; k < 6; k++) a(L(2) + 0.35 + k * 0.33, 'plunk', 0.25); a(L(2) + 1.0, 'pop', 0.5);
a(L(3) + 0.05, 'pop', 0.8); a(L(3) + 0.25, 'chime', 0.45);
// 4–5 the clock races
for (let k = 0; k < D(4) / 0.12; k++) a(L(4) + k * 0.12, 'tick', 0.18); a(L(4) + 0.5, 'pop', 0.5);
for (let k = 0; k < D(5) / 0.09; k++) a(L(5) + k * 0.09, 'tick', 0.16); a(L(5) + 0.2, 'pop', 0.5); a(L(5) + D(5) * 0.6, 'bell', 0.35);
// 6–7 the bars grow
a(L(6) + 0.2, 'fill', 0.3, 1.4); a(L(6) + 1.6, 'ping', 0.4); a(L(7) + 0.2, 'fill', 0.25, 1.0); a(L(7) + 0.8, 'pop', 0.5);
a(L(8) + 0.3, 'pop', 0.5);
// 9 nothing holds you up: a heavy drop; 10 blood pools; 11 the swelling
a(L(9) + 0.4, 'drop', 0.4); a(L(9) + 0.6, 'pop', 0.5);
a(L(10) + 0.3, 'slosh', 0.35, 2.5); a(L(10) + 0.8, 'pop', 0.5);
a(L(11) + 0.1, 'boom', 0.35); a(L(11) + 0.15, 'pop', 0.7);
a(L(12) + 0.2, 'fill', 0.3, 1.6); a(L(12) + 1.8, 'beep', 0.4);
// 13 pins and needles
a(L(13) + 0.3, 'fizz', 0.35, 2.4); a(L(13) + 0.8, 'pop', 0.5);
a(L(14) + 0.2, 'hum', 0.25, D(14)); a(L(14) + 0.4, 'pop', 0.5);
// 15 the flush; 16 the laser, the plume shoots up; 17 the ruler and timer
a(L(15) + 0.9, 'clink', 0.4); a(L(15) + 1.1, 'fill', 0.55, 2.2); a(L(15) + 1.2, 'splash', 0.4); a(L(15) + 1.4, 'pop', 0.5);
a(L(16) + 0.1, 'laser', 0.35, 0.6); a(L(16) + 0.4, 'jet', 0.35, 1.6); a(L(16) + 1.2, 'pop', 0.5);
for (let k = 0; k < 8; k++) a(L(17) + 0.3 + k * 0.42, 'tick', 0.3); a(L(17) + 0.2, 'spray', 0.3, 2.5);
// 18 droplets land on the phone
for (let k = 0; k < 8; k++) a(L(18) + 0.2 + k * 0.28, 'drip', 0.3);
// 19 one in six phones
for (let k = 0; k < 6; k++) a(L(19) + k * 0.18, 'pop', 0.35); a(L(19) + 1.2, 'beep', 0.4); a(L(19) + 1.8, 'pop', 0.5);
// 20 at the table, eating with the same hand
a(L(20) + 1.2, 'clink', 0.35); a(L(20) + 1.8, 'pop', 0.5);
// 21 toilet → phone → hand → mouth
for (let k = 0; k < 4; k++) a(L(21) + k * 0.35, 'pop', 0.4); for (let k = 0; k < 3; k++) a(L(21) + 0.6 + k * 0.5, 'wipe', 0.3); a(L(21) + 2.2, 'pop', 0.5);
// 22 three fixes, each with a tick mark
a(L(22) + 0.05, 'pop', 0.5); a(L(22) + 0.3, 'creak', 0.3); a(L(22) + 1.2, 'pop', 0.5); a(L(22) + 1.4, 'thud', 0.3); a(L(22) + 2.8, 'pop', 0.5); a(L(22) + 3.0, 'squeeze', 0.3);
// 23 five minutes, out of the door; 24 sign-off
for (let k = 0; k < 4; k++) a(L(23) + 0.3 + k * 0.42, 'bump', 0.28); a(L(23) + 0.4, 'chime', 0.4);
a(L(24) + 0.3, 'pop', 0.6); a(L(24) + 0.5, 'notify', 0.4);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }));
console.log(c.length, 'cues');
