// Sound cues from the line timings: node cues.js → cues.json (re-run whenever timing.js changes)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => T[Math.min(i, T.length - 1)].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
a(0.2, 'vac', 0.35, L(3) - 0.6);
a(1.0, 'spin', 0.35, 1.6); a(L(1) + 1.5, 'tick', 0.9); a(L(2) + 0.4, 'beep', 0.7); a(L(2) + 3.4, 'chime', 0.6);
a(L(3) - 0.1, 'whoosh', 0.7); a(L(3) + 0.2, 'pop', 0.9); a(L(4) - 0.3, 'whoosh', 0.6);
a(L(4) + 0.2, 'vac', 0.3, L(30) - L(4) - 0.4);
a(L(4) + 0.4, 'spin', 0.4, 2.0); a(L(5) + 0.3, 'laser', 0.6); a(L(5) + 1.3, 'laser', 0.45); a(L(6) + 0.5, 'laser', 0.45); a(L(7) - 0.2, 'whoosh', 0.5); a(L(7) + 0.1, 'pop', 0.6);
a(L(8) - 0.1, 'whoosh', 0.5); for (let k = 0; k < 8; k++) a(L(8) + 0.4 + k * 0.42, 'tick', 0.45);
a(L(9) - 0.1, 'whoosh', 0.5); a(L(9) + 0.4, 'toner', 0.5, 2.5);
a(L(10) + 0.2, 'whoosh', 0.4); a(L(11) + 0.4, 'bump', 1.0); a(L(11) + 0.45, 'pop', 0.5); a(L(12) + 0.1, 'servo', 0.4);
a(L(13) + 0.1, 'whoosh', 0.4); a(L(15) + 0.8, 'tick', 1.0); a(L(15) + 1.4, 'servo', 0.4);
a(L(16) + 2.2, 'bump', 0.6); a(L(16) + 2.6, 'motor', 0.5, 3.4); a(L(17) + 2.0, 'notify', 0.9);
a(L(18) - 0.1, 'whoosh', 0.5); a(L(19) + 1.0, 'ping', 0.7); a(L(19) + 1.9, 'ping', 0.6); a(L(20) + 0.3, 'ping', 0.7); a(L(20) + 1.8, 'ping', 0.35);
a(L(22) + 1.4, 'pop', 0.6); a(L(23) + 0.3, 'whoosh', 0.4); a(L(23) + 0.5, 'pop', 0.6);
a(L(25) + 0.4, 'beep', 0.8); a(L(26) + 0.2, 'ping', 0.4); a(L(26) + 1.2, 'ping', 0.35); a(L(27) + 2.6, 'chime', 0.8); a(L(28) + 0.4, 'charge', 0.5);
a(L(29) - 0.1, 'whoosh', 0.5); a(L(30) - 0.2, 'whoosh', 0.6); a(L(30) + 0.2, 'pop', 0.8);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
