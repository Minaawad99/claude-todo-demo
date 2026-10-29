// Sound cues from the line timings: node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(0.2, 'idle', 0.3, L(3) - 0.4); a(0.6, 'pop', 0.6); a(1.8, 'beep', 0.35); a(L(1) + 0.4, 'pop', 0.5); a(L(2) + 0.5, 'pop', 0.6);   // city traffic under the intro
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4), 'idle', 0.25, L(8) - L(4)); a(L(4) + 0.4, 'whoosh', 0.5); a(L(4) + 0.6, 'pop', 0.6);
for (let k = 0; k < 4; k++) a(L(5) + 0.3 + k * 0.5, 'ping', 0.4); a(L(5) + 1.0, 'pop', 0.5);
for (let k = 0; k < 4; k++) a(L(6) + 0.3 + k * 0.5, 'ping', 0.35); a(L(6) + 2.6, 'chime', 0.45); a(L(6) + 2.6, 'pop', 0.7);
a(L(7) + 0.3, 'drop', 0.6); a(L(7) + 0.5, 'pop', 0.7);
a(L(8), 'idle', 0.3, L(11) - L(8)); a(L(8) + 0.3, 'notify', 0.5); a(L(8) + 0.6, 'pop', 0.6);
for (let k = 0; k < 6; k++) a(L(9) + 0.4 + k * 0.7, 'beep', 0.25); a(L(9) + 2.2, 'pop', 0.6);
for (let k = 0; k < 8; k++) a(L(10) + 0.3 + k * 0.45, 'tick', 0.3); a(L(10) + 0.6, 'pop', 0.6);
a(L(11), 'idle', 0.35, L(16) - L(11)); a(L(11) + 0.6, 'beep', 0.45); a(L(11) + 1.0, 'beep', 0.45); a(L(11) + 1.6, 'pop', 0.7);
a(L(12) + 0.2, 'wipe', 0.5); a(L(12) + 0.3, 'pop', 0.7); a(L(12) + 0.4, 'beep', 0.5);
a(L(13) + 0.2, 'wipe', 0.4); a(L(13) + 0.3, 'pop', 0.6); a(L(13) + 0.5, 'chime', 0.35);
a(L(14) + 0.3, 'tick', 0.4); a(L(14) + 0.9, 'tick', 0.4); a(L(14) + 1.5, 'tick', 0.4); a(L(14) + 0.6, 'pop', 0.6);
a(L(15) + 0.2, 'notify', 0.5); a(L(15) + 0.3, 'pop', 0.7);
a(L(16) + 0.2, 'whoosh', 0.45); a(L(16) + 0.4, 'chime', 0.5); a(L(16) + 0.4, 'pop', 0.6);
a(L(17), 'idle', 0.3, L(18) - L(17)); a(L(17) + 0.4, 'pop', 0.7); a(L(17) + 0.5, 'thud', 0.4); a(L(17) + 0.8, 'notify', 0.45);
a(L(18) + 0.3, 'gear', 0.3); for (let k = 0; k < 8; k++) a(L(18) + 0.5 + k * 0.7, 'clank', 0.18); a(L(18) + 0.4, 'pop', 0.6);
a(L(19) + 0.8, 'wipe', 0.5); a(L(19) + 1.0, 'beep', 0.5); a(L(19) + 1.2, 'pop', 0.7); a(L(19) + 2.4, 'pop', 0.5);
a(L(20) + 0.4, 'fizz', 0.45); a(L(20) + 0.6, 'pop', 0.7);
a(L(21), 'idle', 0.3, L(24) - L(21)); a(L(21) + 0.4, 'whoosh', 0.4); for (let k = 0; k < 6; k++) a(L(22) + 0.2 + k * 0.4, 'ping', 0.3);
a(L(23) + 0.4, 'beep', 0.4); a(L(23) + 1.0, 'chime', 0.45); a(L(23) + 1.0, 'pop', 0.6);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
