// Sound cues for «العبور» from the line timings: node cues.js → cues.json
// Calm music box under the morning and the flashback, a drone and clock as two o'clock nears, the jets, the barrage,
// paddles and water jets during the crossing, the music back for the evening and the ending. Synthesized here:
// the phone ring, the crowd roar and the ship horn (sfx/); the rest are sfx.py voices and the series kit.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, END = window.TIMING.duration, L = i => i >= T.length ? END : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, o) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, o || {}));
const r = (t, file, gain, from, dur) => c.push({ t: +t.toFixed(2), file, gain, from: from || 0, dur: +dur.toFixed(2) });
const K = '../_templates/sketch/sfx/';
for (let i = 1; i < T.length; i++) a(L(i) - 0.1, 'whoosh', 0.1);
// music
r(0, K + 'px-music-soft.mp3', 0.5, 0, L(25) + 0.4);
r(L(37) - 0.3, K + 'px-music-soft.mp3', 0.5, 30, END - L(37) + 2.5);
// the canal at noon
a(0.1, 'waves', 0.18, L(6)); a(0.1, 'wind', 0.12, L(6));
a(L(4) + 0.3, 'spray', 0.3, D(4) - 0.4); a(L(4) + 0.2, 'motor', 0.15, D(4) - 0.3);
for (let k = 0; k < 4; k++) a(L(5) + 0.3 + k * 0.5, 'tick', 0.3);
// night, suhoor, the secret
a(L(6), 'wind', 0.1, D(6) + D(7) + D(8)); a(L(7) + 0.6, 'clink', 0.3); a(L(7) + 1.8, 'clink', 0.25, null, { f: 2100 }); a(L(7) + 3.2, 'clink', 0.25);
// morning on the bank
a(L(9), 'waves', 0.2, D(9) + D(10) + D(11)); a(L(10) + 1.0, 'splash', 0.3); a(L(10) + 2.4, 'splash', 0.25); a(L(10) + 3.6, 'drip', 0.3);
// Tel Aviv: the phone
r(L(12) + 0.3, 'sfx/phone.wav', 0.45, 0, 4); r(L(14), K + 'px-clock-ticking.mp3', 0.5, 0, D(14));
// back four years, the meeting, bombs and digging
for (let k = 0; k < 3; k++) a(L(15) + 0.3 + k * 0.7, 'whoosh', 0.35);
a(L(17) + 0.4, 'boom', 0.45); a(L(17) + 1.5, 'boom', 0.35); a(L(17) + 2.6, 'thud', 0.4);
a(L(18) + 0.8, 'pop', 0.4);
// the High Dam, the idea, the tests, the pumps
a(L(19), 'wind', 0.15, D(19)); a(L(20), 'spray', 0.45, D(20)); a(L(20), 'motor', 0.2, D(20));
a(L(21) + 0.4, 'spray', 0.35, D(21) - 0.5); a(L(21) + 0.4, 'fill', 0.2, D(21) - 0.5);
a(L(23), 'spray', 0.3, D(23)); for (let k = 0; k < 6; k++) a(L(23) + 0.4 + k * 1.0, 'tick', 0.25);
a(L(24) + 0.4, 'clank', 0.4); a(L(24) + 1.4, 'gear', 0.35);
// 13:30 → 14:00: jets, drone, the barrage
r(L(25), K + 'px-space-drone.mp3', 0.5, 0, L(30) - L(25));
a(L(25) + 0.3, 'spool', 0.4); a(L(25) + 1.6, 'jet', 0.4, D(25) - 1.6);
a(L(26), 'jet', 0.7, D(26)); a(L(26) + 1.2, 'jet', 0.6, D(26) - 1.2); a(L(26) + 2.4, 'boom', 0.35);
for (let k = 0; k * 0.42 < D(27) - 0.2; k++) a(L(27) + 0.1 + k * 0.42, 'boom', 0.35 + 0.15 * ((k * 7) % 3) / 2);
a(L(27), 'wind', 0.25, D(27)); for (let k = 0; k < 6; k++) a(L(28) + k * 0.9, 'boom', 0.18);
r(L(29), K + 'px-clock-ticking.mp3', 0.5, 0, D(29));
// the crossing
a(L(30), 'waves', 0.3, D(30) + D(31) + D(32) + D(33)); for (let k = 0; k * 0.9 < D(30) + D(31); k++) a(L(30) + 0.3 + k * 0.9, 'splash', 0.12);
for (let k = 0; k * 1.3 < D(30) + D(31) + D(32); k++) a(L(30) + 0.5 + k * 1.3, 'boom', 0.12);
a(L(32), 'wind', 0.2, D(32));
r(L(33) + 0.3, 'sfx/roar.wav', 0.6, 0, Math.min(5, D(33) + 0.8));
for (let k = 0; k < 5; k++) a(L(34) + 0.3 + k * 0.6, 'clank', 0.22); a(L(34) + 0.5, 'motor', 0.3, D(34));
a(L(35), 'motor', 0.35, D(35) + D(36) + D(37)); a(L(35) + 0.2, 'spray', 0.6, D(35) + D(36)); a(L(36), 'fill', 0.3, D(36)); a(L(36) + 0.8, 'slosh', 0.35); a(L(36) + 2.6, 'slosh', 0.3);
a(L(37), 'spray', 0.35, D(37)); a(L(38) + 0.6, 'chime', 0.35);
// evening, night, the bridges
a(L(39), 'waves', 0.15, D(39)); a(L(39) + 0.6, 'bell', 0.25, null, { f: 660 });
a(L(40), 'idle', 0.4, D(40) + D(41)); for (let k = 0; k < 6; k++) a(L(40) + 0.4 + k * 0.6, 'clank', 0.18);
a(L(42), 'spray', 0.25, D(42));
r(L(43) + 0.4, 'sfx/horn.wav', 0.45, 0, 3.4); a(L(43), 'waves', 0.2, D(43));
c.push({ t: +(L(44) + 0.4).toFixed(2), fx: 'bell', gain: 0.35, dur: 2.5, f: 330 });
a(L(46) + 0.3, 'chime', 0.3);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
