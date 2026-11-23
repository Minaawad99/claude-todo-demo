// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier:
// a ding, rushing water and a wind gust (the sketch kit).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 hill piles up, cars drive over it
for (let k = 0; k < 3; k++) a(L(0) + 0.2 + k * 0.35, 'thud', 0.3); a(L(0) + 1.2, 'rev', 0.18, 2.0); a(L(0) + 1.5, 'pop', 0.5); a(L(0) + 3.2, 'chime', 0.35);
// 1 street closed: brakes, horn-ish beeps
a(L(1) + 0.3, 'squeeze', 0.25, 0.6); a(L(1) + 0.9, 'pop', 0.6); a(L(1) + 1.3, 'beep', 0.3); a(L(1) + 1.5, 'beep', 0.3); a(L(1) + 1.6, 'thud', 0.3);
// 2 digging out the middle, columns rise
for (let k = 0; k < 5; k++) a(L(2) + 0.5 + k * 0.5, 'thud', 0.22); a(L(2) + 2.7, 'motor', 0.25, 1.8); a(L(2) + 3.4, 'pop', 0.6); a(L(2) + 4.7, 'chime', 0.4);
// 3 columns sink and lean
a(L(3) + 0.8, 'creak', 0.4, 2.4); a(L(3) + 2.4, 'pop', 0.6); a(L(3) + 2.6, 'thud', 0.4);
// 4 drilling and pouring piles
a(L(4) + 0.5, 'motor', 0.3, 4.0); a(L(4) + 0.6, 'gear', 0.18, 3.8); a(L(4) + 1.2, 'pop', 0.5); a(L(4) + 3.6, 'pop', 0.5); rec(L(4) + 4.8, 'ding', 0.3, 0, 1.1, 1.0);
// 5 scaffolding, months
for (let k = 0; k < 5; k++) a(L(5) + 0.2 + k * 0.28, 'clank', 0.25); a(L(5) + 1.6, 'pop', 0.6); a(L(5) + 2.0, 'pop', 0.5); rec(L(5) + 2.2, 'clock-ticking', 0.25, 0, 1.4, 1.0);
// 6 night crane sets the girders
a(L(6) + 0.2, 'idle', 0.2, D(6) - 0.4); for (let k = 0; k < 3; k++) { a(L(6) + 0.4 + k * 1.2, 'servo', 0.25); a(L(6) + 1.4 + k * 1.2, 'clank', 0.35); } a(L(6) + 3.9, 'chime', 0.35);
// 7 truck on the girder, the belly cracks
a(L(7) + 0.1, 'rev', 0.2, 1.5); a(L(7) + 1.4, 'creak', 0.4, 1.4); a(L(7) + 2.6, 'spark', 0.25); a(L(7) + 2.8, 'pop', 0.6); a(L(7) + 3.2, 'thud', 0.35);
// 8 strands stretched then released
a(L(8) + 0.6, 'wipe', 0.25); a(L(8) + 1.0, 'pop', 0.5); a(L(8) + 2.1, 'servo', 0.3); a(L(8) + 2.6, 'servo', 0.3); a(L(8) + 3.6, 'clank', 0.45); a(L(8) + 4.0, 'pop', 0.5); rec(L(8) + 5.2, 'ding', 0.3, 0, 1.1, 1.0);
// 9 flat as a ruler?
a(L(9) + 0.4, 'paper', 0.3); a(L(9) + 0.9, 'pop', 0.6); a(L(9) + 1.6, 'tick', 0.3);
// 10 it bows up
a(L(10) + 0.5, 'creak', 0.35, 1.3); a(L(10) + 1.4, 'pop', 0.6); a(L(10) + 1.5, 'boom', 0.25); a(L(10) + 2.2, 'pop', 0.5);
// 11 pour the topping slab
a(L(11) + 0.6, 'slosh', 0.3, 3.2); a(L(11) + 0.6, 'motor', 0.18, 3.2); a(L(11) + 2.4, 'pop', 0.6); a(L(11) + 4.0, 'chime', 0.35);
// 12 summer heat, the ends chip
rec(L(12) + 0.2, 'wind-gust', 0.2, 0, 1.6, 1.0); a(L(12) + 0.4, 'pop', 0.5); a(L(12) + 0.8, 'creak', 0.3, 1.0); for (let k = 0; k < 4; k++) a(L(12) + 1.9 + k * 0.18, 'clink', 0.3); a(L(12) + 2.4, 'pop', 0.6);
// 13 bearings slide in
a(L(13) + 0.6, 'wipe', 0.3); a(L(13) + 1.4, 'thud', 0.3); a(L(13) + 1.6, 'pop', 0.5); a(L(13) + 2.4, 'ping', 0.3); a(L(13) + 3.2, 'squeeze', 0.15, 1.2); rec(L(13) + 4.6, 'ding', 0.3, 0, 1.1, 1.0);
// 14 the tall truck hits
a(L(14) + 0.1, 'rev', 0.22, 0.9); a(L(14) + 0.7, 'pop', 0.5); a(L(14) + 1.0, 'boom', 0.45); a(L(14) + 1.0, 'clank', 0.5);
// 15 raise the bridge
a(L(15) + 0.3, 'servo', 0.3); a(L(15) + 0.6, 'motor', 0.25, 1.2); a(L(15) + 1.6, 'rev', 0.18, 1.5); a(L(15) + 2.4, 'chime', 0.4);
// 16 rain, puddle, skid
rec(L(16), 'water-rush', 0.2, 1, D(16) + D(17) - 0.2, 1.2); a(L(16) + 1.4, 'pop', 0.6); a(L(16) + 2.0, 'squeeze', 0.3, 0.8); a(L(16) + 2.0, 'splash', 0.3);
// 17 slope and drains
a(L(17) + 0.2, 'pop', 0.5); a(L(17) + 0.8, 'pop', 0.5); for (let k = 0; k < 4; k++) a(L(17) + 2.6 + k * 0.4, 'drip', 0.3); a(L(17) + 3.6, 'chime', 0.35);
// 18 the car slides off
a(L(18) + 0.3, 'squeeze', 0.3, 1.2); a(L(18) + 1.6, 'pop', 0.6); a(L(18) + 1.8, 'thud', 0.35);
// 19 barrier rises, the car bounces back
a(L(19) + 0.5, 'thud', 0.3); a(L(19) + 0.9, 'thud', 0.3); a(L(19) + 2.3, 'rev', 0.2, 1.0); a(L(19) + 3.3, 'bump', 0.45); a(L(19) + 3.4, 'clank', 0.3); rec(L(19) + 5.0, 'ding', 0.3, 0, 1.1, 1.0);
// 20 asphalt, lamps, lines
a(L(20) + 0.3, 'sizzle', 0.2, 0.9); a(L(20) + 0.5, 'pop', 0.5); for (let k = 0; k < 6; k++) a(L(20) + 1.0 + k * 0.2, 'tick', 0.25); a(L(20) + 1.3, 'pop', 0.5); a(L(20) + 2.0, 'spray', 0.2, 1.0); a(L(20) + 2.3, 'pop', 0.5);
// 21 congratulations
a(L(21) + 0.3, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(21) + 0.3 + k * 0.25, 'pop', 0.35); a(L(21) + 0.5, 'rev', 0.12, 1.6);
// 22 outro
a(L(22) + 0.3, 'pop', 0.7); a(L(22) + 0.4, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
