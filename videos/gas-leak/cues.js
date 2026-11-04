// Sound cues from the line timings: node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(0.2, 'hum', 0.16, L(1) - 0.4); a(0.3, 'spray', 0.16, L(1) - 0.6); a(0.9, 'wind', 0.2, 1.4); a(L(0) + 2.6, 'thud', 0.45); a(L(0) + 2.75, 'pop', 0.6);   // the dark flat, the gas, the hand… don't!
a(L(1) + 0.2, 'ping', 0.4); a(L(1) + 0.45, 'pop', 0.55);
a(L(2) + 0.3, 'pop', 0.55); a(L(2) + 0.5, 'ping', 0.35);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.1, 'spin', 0.5); a(L(3) + 0.3, 'chime', 0.45);
a(L(4) + 0.8, 'pop', 0.55); a(L(4) + 1.4, 'clank', 0.5); a(L(4) + 1.6, 'pop', 0.5); a(L(4) + 3.1, 'clink', 0.45);
for (let k = 0; k < 4; k++) a(L(5) + 0.2 + k * 0.7, 'spark', 0.5); a(L(5) + 0.5, 'pop', 0.6);
for (let k = 0; k < 9; k++) a(L(6) + 0.4 + k * 0.25, 'tick', 0.28); a(L(6) + 1.6, 'pop', 0.6); a(L(6) + 2.6, 'pop', 0.55); a(L(6), 'sizzle', 0.14, L(7) - L(6));
a(L(7), 'spray', 0.2, 1.4); a(L(7) + 1.4, 'spark', 0.6); a(L(7) + 1.9, 'boom', 0.85); a(L(7) + 2.4, 'pop', 0.55);
a(L(8) + 0.3, 'pop', 0.5); a(L(8) + 0.5, 'spark', 0.45); a(L(8) + 0.9, 'pop', 0.5); a(L(8) + 1.6, 'spark', 0.45); a(L(8) + 2.0, 'pop', 0.55);
a(L(9) + 0.4, 'spark', 0.45); a(L(9) + 0.9, 'thud', 0.35); a(L(9) + 1.0, 'pop', 0.45); a(L(9) + 1.6, 'thud', 0.35); a(L(9) + 2.3, 'thud', 0.35);
a(L(10) + 0.3, 'bump', 0.3); a(L(10) + 1.0, 'bell', 0.35); a(L(10) + 1.05, 'spark', 0.4); a(L(10) + 2.0, 'thud', 0.4); a(L(10) + 2.2, 'pop', 0.55);
a(L(11) + 0.5, 'servo', 0.45); a(L(11) + 0.6, 'pop', 0.55); a(L(11) + 1.4, 'clank', 0.5); a(L(11) + 2.0, 'servo', 0.4); a(L(11) + 2.1, 'pop', 0.5); a(L(11) + 2.8, 'clank', 0.45);
a(L(12) + 0.2, 'creak', 0.45); a(L(12) + 0.5, 'pop', 0.5); a(L(12) + 0.6, 'wind', 0.3, 2.0); a(L(12) + 1.6, 'thud', 0.35);
a(L(13), 'idle', 0.14, L(14) - L(13)); a(L(13) + 0.5, 'notify', 0.4); a(L(13) + 0.8, 'pop', 0.55); a(L(13) + 1.3, 'notify', 0.35); a(L(13) + 1.6, 'pop', 0.5);
a(L(14), 'wind', 0.18, L(15) - L(14)); a(L(14) + 0.6, 'pop', 0.55); a(L(14) + 2.4, 'pop', 0.5);
a(L(15), 'slosh', 0.2); a(L(15) + 0.6, 'pop', 0.55); a(L(15) + 1.4, 'drop', 0.3); a(L(15) + 2.4, 'pop', 0.5);
a(L(16) + 0.4, 'wind', 0.22, 1.4); a(L(16) + 1.6, 'thud', 0.35); a(L(16) + 2.2, 'pop', 0.55);
a(L(17), 'idle', 0.12, L(18) - L(17)); a(L(17) + 0.4, 'pop', 0.6); a(L(17) + 1.6, 'pop', 0.5); for (let k = 0; k < 8; k++) a(L(17) + 0.2 + k * 0.5, 'tick', 0.12);
a(L(18) + 0.3, 'spark', 0.5); a(L(18) + 0.5, 'boom', 0.9); a(L(18) + 2.4, 'pop', 0.55);
a(L(19) + 0.2, 'paper', 0.3, 0.8); a(L(19) + 0.5, 'thud', 0.4); a(L(19) + 0.6, 'pop', 0.5); a(L(19) + 1.5, 'drip', 0.4); a(L(19) + 2.4, 'drip', 0.35); a(L(19) + 2.45, 'pop', 0.5);
a(L(20) + 0.3, 'bell', 0.32); a(L(20) + 0.5, 'pop', 0.55); a(L(20) + 1.0, 'bell', 0.25); for (let k = 0; k < 4; k++) a(L(20) + 1.7 + k * 0.35, 'bump', 0.22); a(L(20) + 2.0, 'thud', 0.35); a(L(20) + 2.6, 'pop', 0.55);
a(L(21) + 0.2, 'pop', 0.7); a(L(21) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
