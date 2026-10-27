// Sound cues from the line timings (shared by both versions): node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(0.2, 'idle', 0.25, 3.8); a(0.3, 'waves', 0.3, L(1) - 0.4); a(1.2, 'pop', 0.6); a(2.4, 'ping', 0.4); a(2.6, 'pop', 0.6);   // car on the coast, fuel gauge fills
a(L(1) + 0.2, 'plunk', 0.5); a(L(1) + 0.4, 'fill', 0.3, 3.2); a(L(1) + 1.6, 'pop', 0.6);                                  // dive down the column
a(L(2) + 0.3, 'waves', 0.3, 2.4); a(L(2) + 0.3, 'pop', 0.6); a(L(2) + 1.4, 'pop', 0.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4) + 0.3, 'fill', 0.25, 3.4); a(L(4) + 1.0, 'pop', 0.6); a(L(4) + 0.4, 'tick', 0.3);
for (let k = 0; k < 5; k++) a(L(5) + 0.5 * k + 0.2, 'thud', 0.5); a(L(5) + 1.5, 'pop', 0.6); a(L(5) + 2.0, 'sizzle', 0.4, 2.2); a(L(5) + 2.1, 'pop', 0.6); a(L(5) + 3.3, 'pop', 0.7);
a(L(6) + 0.4, 'pop', 0.6); a(L(6) + 0.5, 'beep', 0.4); a(L(6) + 1.5, 'whoosh', 0.4); a(L(6) + 1.8, 'pop', 0.6); a(L(6) + 2.5, 'squeeze', 0.5); a(L(6) + 2.6, 'pop', 0.6);
a(L(7) + 0.3, 'drip', 0.4); a(L(7) + 1.2, 'clank', 0.4); a(L(7) + 1.4, 'pop', 0.6);
a(L(8), 'waves', 0.4, L(9) - L(8)); a(L(8) + 0.2, 'idle', 0.3, 3.8); a(L(8) + 0.4, 'pop', 0.6); a(L(8) + 2.0, 'pop', 0.5);
for (let k = 0; k < 3; k++) { a(L(9) + k * 1.4, 'boom', 0.55); a(L(9) + k * 1.4 + 0.05, 'splash', 0.35); } a(L(9) + 0.6, 'pop', 0.6);
a(L(10) + 0.2, 'ping', 0.45); a(L(10) + 0.9, 'ping', 0.4); a(L(10) + 1.3, 'beep', 0.35); a(L(10) + 1.0, 'pop', 0.6);
a(L(11) + 0.2, 'hum', 0.3, 4.0); for (let k = 0; k < 6; k++) a(L(11) + 0.3 + k * 0.4, 'tick', 0.3); a(L(11) + 1.6, 'pop', 0.6);
a(L(12) + 0.5, 'beep', 0.4); a(L(12) + 1.2, 'notify', 0.5); a(L(12) + 1.2, 'pop', 0.6);
a(L(13), 'waves', 0.35, L(14) - L(13)); a(L(13) + 0.3, 'pop', 0.6); a(L(13) + 1.8, 'pop', 0.6); a(L(13) + 0.5, 'hum', 0.25, 2.6);
for (let k = 0; k < 4; k++) a(L(14) + 0.5 + k * 0.8, 'clank', 0.45); a(L(14) + 0.2, 'servo', 0.4); a(L(14) + 0.8, 'pop', 0.6);
a(L(15) + 0.1, 'motor', 0.45, 5.0); a(L(15) + 0.2, 'gear', 0.45); a(L(15) + 0.6, 'pop', 0.6); a(L(15) + 2.4, 'pop', 0.6); a(L(15) + 2.6, 'spin', 0.4); a(L(15) + 3.6, 'pop', 0.6);
a(L(16) + 0.1, 'idle', 0.35, 3.0); a(L(16) + 0.3, 'slosh', 0.5); a(L(16) + 0.8, 'pop', 0.6); a(L(16) + 1.6, 'fill', 0.35, 1.4);
a(L(17), 'slosh', 0.35); a(L(17) + 0.2, 'motor', 0.3, 4.2); for (let k = 0; k < 3; k++) a(L(17) + 0.4 + k * 1.1, 'pop', 0.7);
a(L(18) + 0.3, 'hum', 0.3, 2.0); a(L(18) + 0.4, 'pop', 0.6); a(L(18) + 2.2, 'beep', 0.6); a(L(18) + 2.5, 'beep', 0.6); a(L(18) + 2.8, 'clank', 0.8); a(L(18) + 3.0, 'thud', 0.7); a(L(18) + 3.1, 'pop', 0.7);
a(L(19) + 0.6, 'fill', 0.5, 2.6); a(L(19) + 1.4, 'pop', 0.6); a(L(19) + 1.6, 'chime', 0.4);
a(L(20) + 0.6, 'idle', 0.3, 3.4); a(L(20) + 0.8, 'pop', 0.6); a(L(20) + 1.0, 'slosh', 0.4); a(L(20) + 2.4, 'slosh', 0.35);
a(L(21), 'waves', 0.35, L(22) - L(21)); a(L(21) + 0.3, 'pop', 0.6); a(L(21) + 0.4, 'sizzle', 0.25, 3.0); a(L(21) + 1.4, 'pop', 0.7); a(L(21) + 1.8, 'fizz', 0.3);
a(L(22), 'waves', 0.4, L(23) - L(22)); a(L(22) + 0.4, 'pop', 0.6); a(L(22) + 1.8, 'pop', 0.6); a(L(22) + 0.2, 'idle', 0.3, 3.0);
a(L(23) + 0.1, 'idle', 0.3, 3.2); for (let k = 0; k < 4; k++) a(L(23) + 0.3 + k * 0.45, 'pop', 0.55); a(L(23) + 1.6, 'pop', 0.7); a(L(23) + 1.7, 'chime', 0.4);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
