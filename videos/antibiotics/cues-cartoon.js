// Sound cues for the cartoon version (same voice and timing as the sketch version):
//   node cues-cartoon.js && python3 ../audio/sfx.py voice.wav cues-cartoon.json <scratchpad>/antibiotics-cartoon-mix.wav
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const KIT = '../_templates/sketch/sfx/', has = n => fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3');
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, n, gain, from, dur, duck, alt) => has(n) ? c.push({ t: +Math.max(0, t).toFixed(2), file: KIT + 'px-' + n + '.mp3', gain, from: from || 0, dur, duck: duck == null ? 1.0 : duck }) : alt && a(t, alt, gain);
for (let i = 1; i < T.length; i++) a(L(i) - 0.12, 'whoosh', 0.16);                           // a whoosh before every line
const pop = (t, g) => a(t, 'pop', g || 0.35), tag = (i, u) => pop(L(i) + u + 0.05, 0.25), ding = t => rec(t, 'ding', 0.3, 0.1, 1.4, 1.0, 'chime');
a(L(0) + 0.1, 'chime', 0.3); tag(0, 2.0); ding(L(1) + 2.2); a(L(2) + 0.45, 'thud', 0.4); tag(2, 1.8);
a(L(3) + 0.15, 'ping', 0.3); tag(4, 1.6); a(L(5) + 1.1, 'thud', 0.3); ding(L(5) + 1.2); a(L(5) + 2.9, 'beep', 0.25);
for (let k = 0; k < 7; k++) a(L(6) + 0.5 + k * (D(6) - 1) / 7, 'tick', 0.12);
for (let k = 0; k < 6; k++) a(L(8) + 1.3 + k * 0.15, 'clank', 0.12); a(L(8) + 3.95, 'pop', 0.6); a(L(8) + 4.0, 'thud', 0.4);
tag(9, .5); ding(L(11) + 1.2); tag(11, 2.4);
for (let k = 0; k < 7; k++) pop(L(12) + 0.9 + k * 0.28, 0.3); tag(12, 3.3);
for (let k = 0; k < 6; k++) a(L(13) + k * 0.6, 'pop', 0.18); rec(L(13) + 0.2, 'clock-ticking', 0.18, 0, D(13) - 0.4, 1.0, 'tick'); ding(L(13) + D(13) - 0.8);
rec(L(14) + 0.3, 'wind-gust', 0.2, 0.25, 1.6, 1.0, 'whoosh'); tag(14, 2.3);
a(L(16) + 1.9, 'beep', 0.25); tag(16, 3.6); a(L(17) + 0.7, 'paper', 0.3); tag(17, 2.6);
tag(18, 3.4); a(L(19) + 1.0, 'spark', 0.25); tag(19, 3.0); a(L(20) + D(20) - 0.85, 'thud', 0.4); tag(21, 0.4);
pop(L(22) + 0.35); pop(L(22) + 2.45); pop(L(22) + 4.65); tag(23, 3.1); ding(L(24) + 2.6);
a(L(25) + 0.1, 'chime', 0.35); pop(L(26) + 0.35, 0.4);
if (has('music-soft')) rec(0, 'music-soft', 0.42, 0, window.TIMING.duration + 1.5, 0.6);
fs.writeFileSync(__dirname + '/cues-cartoon.json', JSON.stringify({ bed: !has('music-soft'), cues: c }, null, 1));
console.log(c.length + ' cues');
