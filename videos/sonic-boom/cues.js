// Sound cues from the line timings: node cues.js → cues.json
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.35);
a(L(0) + 0.1, 'jet', 0.3, 5.0); a(L(0) + 2.8, 'boom', 0.8); a(L(0) + 4.2, 'pop', 0.6);
a(L(1), 'jet', 0.45, 1.5); a(L(1) + 0.3, 'pop', 0.6);
a(L(2) + 0.02, 'boom', 0.9); a(L(2) + 1.4, 'zap', 0.35); a(L(2) + 1.5, 'creak', 0.4); a(L(2) + 1.8, 'pop', 0.6);
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
a(L(4) + 0.1, 'wind', 0.25, 3.6); for (let k = 0; k < 6; k++) a(L(4) + 0.2 + k * 0.32, 'tick', 0.25); a(L(4) + 0.5, 'pop', 0.6); a(L(4) + 2.8, 'beep', 0.4);
a(L(5), 'jet', 0.3, 3.4); a(L(5) + 1.0, 'pop', 0.6);
a(L(6), 'jet', 0.35, 4.8); a(L(6) + 1.0, 'spool', 0.4); a(L(6) + 2.6, 'pop', 0.6);
a(L(7) + 0.15, 'thud', 0.6); a(L(7), 'jet', 0.35, 3.0); a(L(7) + 0.6, 'pop', 0.7);
a(L(8), 'rotor', 0.35, 5.8); a(L(8) + 0.4, 'pop', 0.6); a(L(8) + 0.8, 'creak', 0.45); a(L(8) + 2.0, 'creak', 0.4);
for (let k = 0; k < 9; k++) a(L(8) + 0.6 + k * 0.52, 'beep', 0.3); a(L(8) + 2.6, 'pop', 0.6);
for (let k = 0; k < 8; k++) a(L(9) + 0.1 + k * 0.17, 'tick', 0.3); a(L(9) + 1.5, 'chime', 0.45); a(L(9) + 1.6, 'pop', 0.6); a(L(9) + 3.4, 'pop', 0.6);
a(L(10) + 0.4, 'pop', 0.6); a(L(10) + 1.2, 'slosh', 0.25); a(L(10) + 1.6, 'pop', 0.6); a(L(10) + 1.9, 'creak', 0.5); a(L(10) + 3.0, 'clank', 0.6);
a(L(11), 'rotor', 0.35, 1.9); a(L(11) + 0.3, 'pop', 0.6); a(L(11) + 1.0, 'clank', 0.6); a(L(11) + 1.8, 'exhaust', 0.5); a(L(11) + 1.8, 'jet', 0.4, 2.7); a(L(11) + 1.9, 'pop', 0.6); a(L(11) + 3.1, 'boom', 0.7);
a(L(12), 'jet', 0.3, 4.6); a(L(12) + 0.7, 'pop', 0.6); a(L(12) + 2.3, 'pop', 0.6);
a(L(13), 'wind', 0.35, 3.5); a(L(13) + 0.4, 'pop', 0.6); a(L(13) + 1.8, 'pop', 0.6);
{ const q = (L(15) - L(14)) / 4; a(L(14) + 0.05, 'intake', 0.5); a(L(14) + q, 'spool', 0.45); a(L(14) + 2 * q, 'sizzle', 0.4); a(L(14) + 2 * q, 'spark', 0.35); a(L(14) + 3 * q, 'exhaust', 0.5); a(L(14), 'jet', 0.25, 5.9);
  for (let k = 0; k < 4; k++) a(L(14) + k * q + 0.1, 'pop', 0.6); }
a(L(15), 'jet', 0.35, 5.4); a(L(15) + 1.6, 'exhaust', 0.6); a(L(15) + 1.7, 'rev', 0.5); a(L(15) + 1.8, 'pop', 0.6);
a(L(16), 'jet', 0.25, 4.1); a(L(16) + 0.4, 'fill', 0.35); a(L(16) + 0.2, 'pop', 0.6); a(L(16) + 1.4, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(16) + 1.6 + k * 0.6, 'drip', 0.35);
a(L(17), 'jet', 0.35, 5.1); a(L(17) + 1.0, 'boom', 0.7); a(L(17) + 1.2, 'pop', 0.6); a(L(17) + 2.4, 'pop', 0.6);
a(L(18), 'waves', 0.35, 3.8); a(L(18) + 0.3, 'splash', 0.35); a(L(18) + 0.6, 'pop', 0.6); a(L(18), 'jet', 0.2, 3.7);
{ const d = L(20) - L(19), mu = Math.asin(1 / 1.6), th = (320 + 200 / Math.tan(mu) - 250) / (390 / d); a(L(19), 'jet', 0.3, d); a(L(19) + th, 'boom', 0.9); }
a(L(20), 'jet', 0.25, 3.7); a(L(20) + 0.4, 'pop', 0.6); a(L(20) + 1.0, 'pop', 0.6); a(L(20) + 1.08, 'boom', 0.75); a(L(20) + 2.12, 'boom', 0.75);
a(L(21), 'jet', 0.35, 3.8); for (let k = 0; k < 6; k++) a(L(21) + 0.5 + k * 0.5, 'bump', 0.35); a(L(21) + 0.8, 'pop', 0.6);
a(L(22), 'wind', 0.2, 3.8); for (let k = 0; k < 3; k++) { a(L(22) + 0.97 + k / 0.7, 'snip', 0.8); a(L(22) + 0.97 + k / 0.7, 'thud', 0.25); } a(L(22) + 1.4, 'pop', 0.6);
a(L(23), 'jet', 0.25, 3.0); for (let k = 0; k < 2; k++) a(L(23) + k * 1.5 + 0.02, 'boom', 0.45); a(L(23) + 0.6, 'pop', 0.6);
a(L(24) + 0.2, 'pop', 0.7); a(L(24) + 0.3, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
