// Sound cues from the line timings: node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(0.2, 'hum', 0.3, L(2) - 0.4); a(0.3, 'waves', 0.22, L(2) - 0.5); a(1.4, 'pop', 0.6); a(3.1, 'pop', 0.6);            // train under the river
a(L(1) + 1.1, 'tick', 0.4); a(L(1) + 1.8, 'pop', 0.6); a(L(1) + 3.1, 'pop', 0.6);
a(L(2) + 0.2, 'splash', 0.4); a(L(2) + 0.6, 'drip', 0.4); a(L(2) + 1.2, 'pop', 0.6); a(L(2) + 1.5, 'fill', 0.25, 1.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.1, 'spin', 0.5); a(L(3) + 0.3, 'chime', 0.45);
a(L(4) + 0.2, 'wipe', 0.4); a(L(4) + 0.6, 'ping', 0.45); a(L(4) + 1.0, 'ping', 0.45); a(L(4) + 1.4, 'ping', 0.45); a(L(4) + 0.5, 'pop', 0.6); a(L(4) + 1.7, 'pop', 0.6);
a(L(5), 'motor', 0.35, L(6) - L(5)); a(L(5) + 0.9, 'pop', 0.7); a(L(5) + 1.7, 'pop', 0.6);
a(L(6), 'waves', 0.2, L(7) - L(6)); a(L(6), 'hum', 0.25, L(7) - L(6)); a(L(6) + 1.1, 'pop', 0.6); a(L(6) + 1.9, 'pop', 0.5); a(L(6) + 2.7, 'pop', 0.5);
a(L(7), 'idle', 0.3, L(8) - L(7)); a(L(7) + 0.5, 'pop', 0.7); a(L(7) + 1.3, 'tick', 0.4); a(L(7) + 2.1, 'pop', 0.6);
a(L(8), 'motor', 0.4, L(9) - L(8)); a(L(8) + 0.2, 'gear', 0.4); a(L(8) + 0.7, 'pop', 0.6); a(L(8) + 1.7, 'pop', 0.6);
a(L(9) + 0.5, 'pop', 0.6); a(L(9) + 1.5, 'thud', 0.5); a(L(9) + 1.6, 'splash', 0.5); a(L(9) + 1.7, 'fill', 0.3, 1.6); a(L(9) + 2.5, 'pop', 0.6);
a(L(10), 'slosh', 0.4); a(L(10) + 0.3, 'fill', 0.3, 3.2); a(L(10) + 0.9, 'pop', 0.6); a(L(10) + 1.9, 'pop', 0.5);
a(L(11) + 0.2, 'squeeze', 0.4); a(L(11) + 0.7, 'pop', 0.6); a(L(11) + 1.5, 'pop', 0.6); a(L(11) + 2.7, 'chime', 0.45);
a(L(12), 'slosh', 0.35, L(13) - L(12)); a(L(12) + 0.7, 'pop', 0.6); a(L(12) + 2.1, 'pop', 0.5);
for (let k = 0; k < 9; k++) a(L(13) + 0.3 + k * 0.45, 'clank', 0.3); a(L(13) + 0.9, 'pop', 0.6); a(L(13) + 2.3, 'pop', 0.5);
a(L(14) + 0.4, 'drip', 0.35); a(L(14) + 1.5, 'pop', 0.6); a(L(14) + 2.9, 'pop', 0.7); a(L(14) + 3.0, 'chime', 0.4);
a(L(15), 'idle', 0.3, L(16) - L(15)); a(L(15) + 0.3, 'servo', 0.5); a(L(15) + 0.9, 'pop', 0.6); a(L(15) + 1.9, 'pop', 0.6); a(L(15) + 2.8, 'servo', 0.45);
a(L(16) + 0.7, 'pop', 0.5); a(L(16) + 1.3, 'tick', 0.4); a(L(16) + 1.9, 'pop', 0.6); a(L(16) + 2.9, 'pop', 0.5);
a(L(17) + 0.3, 'wipe', 0.4); a(L(17) + 0.5, 'ping', 0.45); a(L(17) + 1.3, 'ping', 0.45); a(L(17) + 2.3, 'ping', 0.45); a(L(17) + 2.7, 'pop', 0.7);
a(L(18), 'hum', 0.3, L(19) - L(18)); a(L(18) + 0.5, 'pop', 0.6); a(L(18) + 0.9, 'tick', 0.4); a(L(18) + 1.7, 'pop', 0.6);
a(L(19), 'hum', 0.3, L(20) - L(19)); a(L(19), 'waves', 0.22, L(20) - L(19)); a(L(19) + 1.5, 'pop', 0.6); a(L(19) + 3.3, 'pop', 0.6);
a(L(20) + 0.2, 'pop', 0.8); a(L(20) + 0.4, 'chime', 0.5); a(L(20) + 1.2, 'ping', 0.4);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1));
console.log(c.length, 'cues');
