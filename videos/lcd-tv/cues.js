// Sound cues from the line timings (shared by both versions): node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(0.2, 'hum', 0.22, 4.0); a(1.9, 'pop', 0.7); a(0.4, 'beep', 0.3);                                         // TV on in the living room
a(L(1) + 0.3, 'whoosh', 0.4); a(L(1) + 0.5, 'pop', 0.6); a(L(1) + 2.1, 'chime', 0.4); a(L(1) + 2.0, 'pop', 0.6);
a(L(2) + 0.3, 'tick', 0.4); a(L(2) + 1.1, 'tick', 0.4); a(L(2) + 1.8, 'pop', 0.6); a(L(2) + 0.6, 'pop', 0.5);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4) + 0.8, 'wipe', 0.5); a(L(4) + 1.4, 'hum', 0.25, 4.0); a(L(4) + 2.0, 'pop', 0.6); a(L(4) + 2.6, 'pop', 0.6);
a(L(5) + 0.2, 'hum', 0.3, 3.4); a(L(5) + 1.0, 'pop', 0.6);
for (let k = 0; k < 6; k++) a(L(6) + 0.3 + k * 0.5, 'clink', 0.3); a(L(6) + 1.0, 'pop', 0.6);
a(L(7) + 0.2, 'hum', 0.3, 4.2); a(L(7) + 0.6, 'pop', 0.6); a(L(7) + 2.0, 'pop', 0.6); a(L(7) + 1.2, 'zap', 0.3);
a(L(8) + 0.2, 'wind', 0.25, 3.8); a(L(8) + 0.8, 'pop', 0.6); a(L(8) + 2.0, 'thud', 0.5); a(L(8) + 2.0, 'pop', 0.6);
a(L(9) + 0.2, 'whoosh', 0.45); a(L(9) + 0.9, 'pop', 0.6); a(L(9) + 1.1, 'clank', 0.35);
a(L(10) + 1.0, 'thud', 0.6); a(L(10) + 2.0, 'pop', 0.7);
a(L(11) + 0.2, 'fizz', 0.4); a(L(11) + 0.4, 'pop', 0.7); a(L(11) + 0.6, 'chime', 0.35);
a(L(12) + 0.3, 'spin', 0.4); a(L(12) + 0.6, 'pop', 0.6); a(L(12) + 1.8, 'pop', 0.6);
a(L(13) + 0.3, 'hum', 0.3, 3.4); a(L(13) + 1.4, 'chime', 0.45); a(L(13) + 1.4, 'pop', 0.6);
a(L(14) + 1.0, 'zap', 0.6); a(L(14) + 1.1, 'spark', 0.5); a(L(14) + 1.6, 'pop', 0.7); a(L(14) + 1.8, 'thud', 0.4);
a(L(15) + 0.3, 'servo', 0.4); a(L(15) + 0.8, 'pop', 0.6); a(L(15) + 2.0, 'servo', 0.35);
for (let k = 0; k < 3; k++) { a(L(16) + 0.3 + k * 0.5, 'pop', 0.6); a(L(16) + 0.35 + k * 0.5, 'ping', 0.3); }
a(L(17) + 0.4, 'pop', 0.7); a(L(17) + 0.2, 'whoosh', 0.4);
a(L(18) + 0.6, 'whoosh', 0.35); a(L(18) + 1.4, 'chime', 0.5); a(L(18) + 1.4, 'pop', 0.7);
a(L(19) + 0.3, 'whoosh', 0.35); a(L(19) + 1.0, 'chime', 0.55); a(L(19) + 1.0, 'pop', 0.7);
a(L(20) + 0.2, 'whoosh', 0.5); a(L(20) + 0.6, 'pop', 0.7); for (let k = 0; k < 10; k++) a(L(20) + 1.2 + k * 0.3, 'tick', 0.3); a(L(20) + 2.6, 'notify', 0.5);
for (let k = 0; k < 8; k++) a(L(21) + 0.2 + k * 0.33, 'tick', 0.35); a(L(21) + 1.2, 'pop', 0.6);
a(L(22) + 0.2, 'hum', 0.3, 4.0); a(L(22) + 0.6, 'pop', 0.7); for (let k = 0; k < 4; k++) a(L(22) + 0.4 + k * 0.4, 'beep', 0.25); a(L(22) + 1.6, 'pop', 0.6);
a(L(23) + 0.2, 'hum', 0.25, 3.6); for (let k = 0; k < 6; k++) a(L(23) + 0.3 + k * 0.5, 'clink', 0.25); a(L(23) + 1.0, 'pop', 0.7);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
