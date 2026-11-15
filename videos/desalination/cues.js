// Sound cues from the line timings: node cues.js → cues.json
// Synthesized effects only (audio/sfx.py): no background music, no recorded clips.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);

a(L(0), 'waves', 0.25, D(0)); a(L(0) + 0.2, 'steam', 0.3); a(L(0) + 1.2, 'pop', 0.6); a(L(0) + 1.8, 'sizzle', 0.25); a(L(0) + 2.6, 'drip', 0.4); a(L(0) + D(0) * 0.55, 'pop', 0.7);
a(L(1) + 0.2, 'hum', 0.3, 2.6); a(L(1) + 1.0, 'spark', 0.3); a(L(1) + 2.0, 'zap', 0.3); a(L(1) + D(1) * 0.5, 'pop', 0.8); a(L(1) + D(1) * 0.7, 'pop', 0.6); for (let k = 0; k < 5; k++) a(L(1) + D(1) * 0.5 + 0.3 + k * 0.3, 'clink', 0.15);
a(L(2) + 0.5, 'pop', 0.7); a(L(2) + 0.6, 'beep', 0.25); a(L(2) + 1.3, 'clank', 0.4); a(L(2) + 1.8, 'pop', 0.6); a(L(2) + D(2) * 0.5, 'chime', 0.35);
a(L(3) + 0.3, 'pop', 0.6); a(L(3) + 1.0, 'pop', 0.6); a(L(3) + 1.6, 'drip', 0.4);
a(L(4) + 0.3, 'slosh', 0.3); a(L(4) + 1.2, 'pop', 0.7); a(L(4) + 2.2, 'drip', 0.4);
a(L(5) + 0.4, 'clank', 0.4); a(L(5) + 0.9, 'pop', 0.6); a(L(5) + 1.3, 'motor', 0.3, 2.4); a(L(5) + 1.4, 'squeeze', 0.3); a(L(5) + D(5) * 0.55, 'pop', 0.7);
a(L(6), 'plunk', 0.3); a(L(6) + 0.8, 'creak', 0.25); a(L(6) + 1.6, 'ping', 0.3); a(L(6) + D(6) * 0.42, 'pop', 0.7); a(L(6) + D(6) * 0.66, 'chime', 0.4);
a(L(7), 'waves', 0.25, D(7) * 0.55); a(L(7) + 0.5, 'pop', 0.6); a(L(7) + 1.2, 'drop', 0.3); a(L(7) + D(7) * 0.6, 'thud', 0.4); a(L(7) + D(7) * 0.7, 'beep', 0.3);
a(L(8) + 0.4, 'plunk', 0.3); a(L(8) + 0.9, 'pop', 0.6); a(L(8) + 1.4, 'intake', 0.25); a(L(8) + D(8) * 0.6, 'pop', 0.6); a(L(8) + D(8) * 0.6 + 0.2, 'bump', 0.3);
a(L(9) + 0.4, 'clank', 0.35); a(L(9) + 0.9, 'pop', 0.6); a(L(9) + 1.2, 'toner', 0.3); a(L(9) + D(9) * 0.5, 'pop', 0.6);
a(L(10) + 0.2, 'hum', 0.3, 2.4); a(L(10) + 0.7, 'pop', 0.6); a(L(10) + 1.2, 'spark', 0.3); a(L(10) + 2.0, 'zap', 0.3); a(L(10) + D(10) * 0.5, 'pop', 0.7); for (let k = 0; k < 5; k++) a(L(10) + 2.6 + k * 0.3, 'clink', 0.15);
a(L(11) + 0.4, 'pop', 0.6); a(L(11) + D(11) * 0.4, 'pop', 0.7); a(L(11) + D(11) * 0.45 + 0.2, 'drip', 0.4);
a(L(12) + 0.3, 'spray', 0.25, 1.8); a(L(12) + 0.8, 'pop', 0.6); a(L(12) + D(12) * 0.5, 'pop', 0.7);
a(L(13) + 0.4, 'clank', 0.35); a(L(13) + 0.9, 'pop', 0.6); a(L(13) + 1.6, 'spin', 0.25); a(L(13) + 2.8, 'chime', 0.35);
a(L(14) + 0.6, 'pop', 0.8); a(L(14) + 0.7, 'charge', 0.25); a(L(14) + D(14) * 0.45, 'pop', 0.5);
a(L(15), 'waves', 0.25, D(15)); a(L(15) + 0.5, 'coolant', 0.25); a(L(15) + 0.8, 'pop', 0.7); a(L(15) + D(15) * 0.55, 'beep', 0.3);
a(L(16) + 0.4, 'plunk', 0.3); a(L(16) + 0.9, 'pop', 0.6); a(L(16) + D(16) * 0.5, 'pop', 0.6); a(L(16) + D(16) * 0.5, 'spray', 0.25, 2.2); a(L(16) + D(16) * 0.8, 'chime', 0.3);
a(L(17) + 0.7, 'pop', 0.6); a(L(17) + D(17) * 0.5, 'pop', 0.7); a(L(17) + D(17) * 0.5 + 0.2, 'fizz', 0.25); for (let k = 0; k < 4; k++) a(L(17) + D(17) * 0.6 + k * 0.4, 'drip', 0.3);
a(L(18) + 0.4, 'clank', 0.35); a(L(18) + 0.9, 'pop', 0.6); a(L(18) + 1.4, 'toner', 0.25); a(L(18) + D(18) * 0.55 + 0.1, 'thud', 0.3); a(L(18) + D(18) * 0.55 + 0.4, 'pop', 0.6); a(L(18) + D(18) * 0.55 + 0.8, 'drip', 0.4);
a(L(19) + 0.3, 'hum', 0.25, 1.6); a(L(19) + 0.8, 'pop', 0.7); a(L(19) + 1.4, 'zap', 0.25);
a(L(20) + 0.2, 'pop', 0.6); a(L(20) + 0.4, 'fill', 0.25, 1.2); a(L(20) + D(20) * 0.3, 'pop', 0.7); a(L(20) + D(20) * 0.3 + 0.1, 'zap', 0.25); a(L(20) + D(20) * 0.62, 'pop', 0.7); a(L(20) + D(20) * 0.62 + 0.2, 'wind', 0.2, 1.6);
a(L(21) + 0.5, 'pop', 0.7); a(L(21) + 0.9, 'pop', 0.7); a(L(21) + 1.2, 'chime', 0.4); a(L(21) + D(21) * 0.5, 'pop', 0.6);
a(L(22) + 0.2, 'thud', 0.4); a(L(22) + 0.6, 'pop', 0.6); a(L(22) + D(22) * 0.38, 'motor', 0.25, 1.4); a(L(22) + D(22) * 0.38 + 0.4, 'pop', 0.6); a(L(22) + D(22) * 0.68 + 0.4, 'pop', 0.6); a(L(22) + D(22) * 0.68 + 0.5, 'clink', 0.3);
a(L(23) + 0.4, 'chime', 0.5); for (let k = 0; k < 5; k++) a(L(23) + 0.5 + k * 0.2, 'pop', 0.35);
a(L(24), 'waves', 0.25, D(24) + 1.5); a(L(24) + 0.4, 'pop', 0.7); a(L(24) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');