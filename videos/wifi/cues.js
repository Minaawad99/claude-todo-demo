// Sound cues from the line timings: node cues.js → cues.json (synthesized effects only; no recorded clips for this episode)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
// a whoosh at every line change (scene change), then effects matched to what is on screen
for (let i = 0; i < T.length; i++) a(L(i) - 0.05, 'whoosh', 0.35);
a(L(0) + 0.6, 'pop', 0.5); a(L(1) + 1.0, 'pop', 0.4);
a(L(3) + 0.2, 'chime', 0.7); a(L(3) + 1.0, 'bell', 0.5, 0.9);
a(L(4) + 0.5, 'tick', 0.6); a(L(4) + 1.2, 'tick', 0.5); a(L(4) + 2.0, 'tick', 0.5);
for (let k = 0; k < 6; k++) a(L(5) + 1.0 + k * 0.35, 'tick', 0.45);
a(L(6) + 0.2, 'ping', 0.5); a(L(7) + 0.4, 'tick', 0.4); a(L(7) + 1.8, 'tick', 0.4);
a(L(9) + 0.3, 'ping', 0.6, 0.6); a(L(9) + 2.4, 'ping', 0.4, 0.6);
a(L(10) + 0.8, 'pop', 0.6); a(L(10) + 2.4, 'chime', 0.5);
a(L(11) + 0.8, 'pop', 0.55); a(L(11) + 1.6, 'pop', 0.5); a(L(11) + 2.4, 'pop', 0.5);
a(L(12) + 1.2, 'beep', 0.4, 0.5); a(L(12) + 2.4, 'beep', 0.4, 0.5);
a(L(13) + 0.6, 'beep', 0.4, 0.4); a(L(13) + 2.0, 'tick', 0.5);
for (let k = 0; k < 4; k++) a(L(14) + 0.4 + k * 0.9, 'pop', 0.4);
a(L(15) + 0.8, 'pop', 0.5); a(L(15) + 1.6, 'pop', 0.45);
a(L(16) + 0.9, 'thud', 0.6, 0.4); a(L(16) + 2.2, 'wipe', 0.4);
a(L(17) + 0.5, 'thud', 0.7, 0.4); a(L(17) + 1.6, 'thud', 0.6, 0.4);
a(L(18) + 1.2, 'spark', 0.7, 0.4); a(L(18) + 3.0, 'zap', 0.6); a(L(18) + 4.2, 'spark', 0.5, 0.3);
a(L(19) + 1.2, 'pop', 0.6); a(L(19) + 2.0, 'clank', 0.5, 0.5);
a(L(20) + 0.6, 'ping', 0.5); a(L(20) + 2.0, 'bell', 0.5, 1.0);
for (let k = 0; k < 8; k++) a(L(21) + 0.3 + k * 0.7, 'tick', 0.4);
a(L(22) + 0.8, 'pop', 0.5); a(L(23) + 0.9, 'chime', 0.6);
a(L(24) + 0.5, 'chime', 0.6); a(L(24) + 1.5, 'pop', 0.6);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1));
console.log(c.length + ' cues');
