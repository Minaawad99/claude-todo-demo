// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier:
// a ding, rushing water and a wind gust (from the sketch kit). The rest are synthesized by videos/audio/sfx.py.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 dig a hole, the tornado shows up
for (let k = 0; k < 3; k++) a(L(0) + 0.4 + k * 0.75, 'thud', 0.3); a(L(0) + 2.4, 'wind', 0.25, D(0) - 2.4); a(L(0) + 3.0, 'pop', 0.6);
// 1 the house flies off
rec(L(1), 'wind-gust', 0.4, 0, 2.0, 1.0); a(L(1) + 0.4, 'creak', 0.35); a(L(1) + 0.8, 'boom', 0.3); a(L(1) + 2.0, 'pop', 0.6); a(L(1) + 2.4, 'thud', 0.3);
// 2 digging the big pit
for (let k = 0; k < 5; k++) a(L(2) + 0.3 + k * 0.7, 'thud', 0.22); a(L(2) + 1.0, 'pop', 0.6); a(L(2) + 2.2, 'chime', 0.3);
// 3 100 t, it falls
a(L(3) + 0.3, 'pop', 0.6); a(L(3) + 1.0, 'creak', 0.4); a(L(3) + 1.8, 'boom', 0.45); a(L(3) + 2.0, 'pop', 0.6); a(L(3) + 2.3, 'thud', 0.35);
// 4 jacks rise
a(L(4) + 0.4, 'motor', 0.25, 2.6); a(L(4) + 0.6, 'servo', 0.25); a(L(4) + 1.1, 'pop', 0.6); a(L(4) + 2.2, 'pop', 0.5); a(L(4) + 3.2, 'chime', 0.35);
// 5 out of step, cracks
a(L(5) + 0.4, 'motor', 0.2, 1.6); a(L(5) + 1.4, 'creak', 0.45); a(L(5) + 1.6, 'clank', 0.3); a(L(5) + 2.0, 'pop', 0.6);
// 6 sync controller
a(L(6) + 0.4, 'clank', 0.3); a(L(6) + 0.6, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(6) + 1.0 + k * 0.2, 'beep', 0.18); a(L(6) + 2.6, 'servo', 0.25, 2.0); rec(L(6) + 3.4, 'ding', 0.3, 0, 1.1, 1.0);
// 7 rain, walls collapse
rec(L(7), 'water-rush', 0.18, 2, D(7), 1.2); for (let k = 0; k < 5; k++) a(L(7) + 0.9 + k * 0.3, 'thud', 0.25); a(L(7) + 1.4, 'pop', 0.6); a(L(7) + 1.8, 'pop', 0.5);
// 8 pour concrete
a(L(8) + 0.3, 'fill', 0.3, 2.2); a(L(8) + 1.2, 'pop', 0.6); a(L(8) + 2.0, 'pop', 0.5); a(L(8) + 2.8, 'chime', 0.35);
// 9 wind pushes, bang
rec(L(9), 'wind-gust', 0.35, 0, D(9), 1.0); a(L(9) + 2.0, 'clank', 0.5); a(L(9) + 2.0, 'thud', 0.45); a(L(9) + 2.1, 'pop', 0.6);
// 10 rails
for (let k = 0; k < 3; k++) a(L(10) + 0.3 + k * 0.25, 'clank', 0.25); a(L(10) + 0.7, 'pop', 0.6); a(L(10) + 1.3, 'servo', 0.2, 2.0); a(L(10) + 2.2, 'pop', 0.5); a(L(10) + 3.0, 'chime', 0.35);
// 11 hose bursts
a(L(11) + 0.9, 'spray', 0.4, 1.4); a(L(11) + 1.0, 'pop', 0.6); a(L(11) + 1.4, 'thud', 0.45); a(L(11) + 1.6, 'pop', 0.5);
// 12 valve
a(L(12) + 0.5, 'clink', 0.35); a(L(12) + 0.8, 'pop', 0.6); a(L(12) + 2.0, 'spray', 0.2, 0.8); a(L(12) + 2.4, 'clank', 0.3); rec(L(12) + 3.0, 'ding', 0.3, 0, 1.1, 1.0);
// 13 storm, power out, warning
rec(L(13), 'water-rush', 0.18, 2, D(13), 1.2); a(L(13) + 0.7, 'boom', 0.5); a(L(13) + 0.75, 'zap', 0.3); a(L(13) + 1.0, 'thud', 0.2); a(L(13) + 1.1, 'pop', 0.6); a(L(13) + 2.6, 'notify', 0.4); a(L(13) + 2.7, 'pop', 0.5);
// 14 open the valve, the house goes down by its weight
a(L(14) + 0.7, 'clank', 0.35); a(L(14) + 1.2, 'creak', 0.3); a(L(14) + 1.3, 'slosh', 0.25, D(14) - 1.6); a(L(14) + 1.4, 'pop', 0.6); a(L(14) + 2.4, 'pop', 0.5);
// 15 debris falls in
rec(L(15), 'wind-gust', 0.3, 0, D(15), 1.0); for (let k = 0; k < 4; k++) a(L(15) + 0.7 + k * 0.5, 'clank', 0.22); a(L(15) + 1.0, 'pop', 0.6); a(L(15) + 1.8, 'pop', 0.5);
// 16 the lid slides shut
a(L(16) + 0.6, 'gear', 0.3, 2.0); a(L(16) + 0.8, 'pop', 0.6); a(L(16) + 2.6, 'thud', 0.5); a(L(16) + 2.7, 'clank', 0.4); a(L(16) + 3.0, 'chime', 0.3);
// 17 the pressure myth
a(L(17) + 0.6, 'pop', 0.6); a(L(17) + 1.6, 'pop', 0.6); a(L(17) + 2.2, 'creak', 0.2);
// 18 the tornado over the lid
a(L(18), 'wind', 0.45, D(18)); rec(L(18) + 0.3, 'wind-gust', 0.4, 0, D(18) - 0.3, 1.2); a(L(18) + 0.4, 'pop', 0.6); a(L(18) + 0.8, 'pop', 0.5); a(L(18) + 1.4, 'pop', 0.6); for (let k = 0; k < 3; k++) a(L(18) + 1.8 + k * 0.6, 'clank', 0.2);
// 19 a board hits the lid at 160 km/h
a(L(19) + 0.3, 'pop', 0.6); a(L(19) + 0.6, 'whoosh', 0.4); a(L(19) + 1.4, 'clank', 0.6); a(L(19) + 1.4, 'thud', 0.5); a(L(19) + 1.8, 'pop', 0.6); rec(L(19) + 2.2, 'ding', 0.3, 0, 1.1, 1.0);
// 20 water seeps in
for (let k = 0; k < 6; k++) a(L(20) + 0.3 + k * 0.45, 'drip', 0.3); a(L(20) + 1.0, 'pop', 0.6); a(L(20) + 1.2, 'fill', 0.15, 1.6);
// 21 sump pump
a(L(21) + 0.5, 'clank', 0.3); a(L(21) + 1.0, 'pop', 0.6); a(L(21) + 1.4, 'motor', 0.25, D(21) - 1.6); rec(L(21) + 1.6, 'water-rush', 0.18, 1, 2.2, 1.0); a(L(21) + 3.6, 'chime', 0.35);
// 22 vent, lamp, ladder
a(L(22) + 0.5, 'pop', 0.6); a(L(22) + 0.5, 'clank', 0.25); a(L(22) + 1.5, 'pop', 0.6); a(L(22) + 1.5, 'zap', 0.15); a(L(22) + 2.5, 'pop', 0.6); a(L(22) + 2.5, 'clank', 0.25);
// 23 the lid opens, the house rises
a(L(23) + 0.1, 'gear', 0.3, 0.8); a(L(23) + 0.8, 'motor', 0.25, 1.8); a(L(23) + 2.4, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(23) + 2.4 + k * 0.2, 'pop', 0.3);
// 24 outro
a(L(24) + 0.4, 'pop', 0.7); a(L(24) + 0.5, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
