// Sound cues from the line timings: node cues.js → cues.json (re-run whenever timing.js changes)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
a(0.1, 'jet', 0.5, L(1) - 0.3); a(0.6, 'pop', 0.7);
a(L(1) - 0.1, 'whoosh', 0.5); a(L(1), 'rotor', 0.55, L(2) - L(1)); a(L(1) + 1.4, 'pop', 0.7);
a(L(2) - 0.1, 'whoosh', 0.5); a(L(2) + 0.3, 'beep', 0.6); a(L(2) + 0.5, 'windmill', 0.5, L(3) - L(2) - 0.6); a(L(2) + 2.6, 'chime', 0.5);
a(L(3) - 0.1, 'whoosh', 0.7); a(L(3) + 0.1, 'pop', 0.9);
a(L(4), 'rotor', 0.4, L(21) - L(4));            // the rotor never stops until the engine fails
for (const i of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) a(L(i) - 0.08, 'whoosh', 0.35);
a(L(4) + 0.3, 'pop', 0.6); a(L(4) + 1.2, 'pop', 0.6); a(L(5) + 1.0, 'pop', 0.7); a(L(6) + 0.2, 'wind', 0.5, 2.2); a(L(6) + 2.5, 'pop', 0.6);
a(L(7) + 0.5, 'wind', 0.5, 2.4); a(L(7) + 1.6, 'pop', 0.6); a(L(8) + 1.0, 'spool', 0.5, 2.0); a(L(9) + 0.2, 'pop', 0.7);
a(L(10) + 1.2, 'servo', 0.6); a(L(10) + 2.8, 'servo', 0.5); a(L(11) + 0.2, 'spool', 0.4, 1.8); a(L(11) + 2.3, 'servo', 0.5); a(L(12) + 1.0, 'pop', 0.7);
a(L(13) + 0.1, 'pop', 0.7); a(L(14) + 0.6, 'servo', 0.6); a(L(15) + 0.2, 'wind', 0.6, 3.0); a(L(16) + 0.1, 'pop', 0.7);
a(L(17) + 0.4, 'pop', 0.5); a(L(18) + 0.3, 'spin', 0.6, 3.0); a(L(18) + 0.6, 'pop', 0.7); a(L(19) + 0.9, 'pop', 0.6);
a(L(20) + 1.0, 'tick', 0.9); a(L(20) + 2.6, 'tick', 0.9); a(L(20) + 0.6, 'pop', 0.5);
a(L(21) - 0.1, 'whoosh', 0.5); a(L(21) + 0.1, 'boom', 0.35); for (let k = 0; k < 4; k++) a(L(21) + 0.3 + k * 0.5, 'beep', 0.5);
a(L(21) + 0.4, 'windmill', 0.5, L(25) - L(21) - 0.6); a(L(22) + 0.6, 'servo', 0.5); a(L(23) + 0.2, 'wind', 0.6, 3.5); a(L(23) + 0.9, 'pop', 0.6);
a(L(24) + 1.6, 'servo', 0.6); a(L(24) + 1.7, 'pop', 0.6); a(L(24) + 4.0, 'thud', 0.7); a(L(24) + 4.3, 'chime', 0.6);
a(L(25) - 0.1, 'whoosh', 0.5); a(L(25), 'rotor', 0.35, L(26) - L(25) + 2); a(L(25) + 1.0, 'pop', 0.6); a(L(25) + 2.4, 'pop', 0.6);
a(L(26) - 0.1, 'whoosh', 0.5); a(L(26) + 0.3, 'pop', 0.8);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
