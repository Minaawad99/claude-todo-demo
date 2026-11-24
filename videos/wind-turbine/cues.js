// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier: a wind gust and a ding.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 fan on a pole, lamp lights
rec(L(0) + 0.3, 'wind-gust', 0.2, 0, 2.2, 1.0); a(L(0) + 0.4, 'pop', 0.6); a(L(0) + 0.9, 'spin', 0.25, 1.6); a(L(0) + 1.6, 'zap', 0.2); a(L(0) + 2.0, 'pop', 0.6); a(L(0) + 2.4, 'chime', 0.35);
// 1 wind broken by houses, lamp flickers
rec(L(1) + 0.2, 'wind-gust', 0.25, 1, 2.0, 1.0); a(L(1) + 0.8, 'pop', 0.5); for (let k = 0; k < 4; k++) a(L(1) + 1.4 + k * 0.35, 'tick', 0.2); a(L(1) + 2.8, 'thud', 0.3);
// 2 the tower rises
a(L(2) + 0.3, 'servo', 0.3, 1.0); a(L(2) + 1.2, 'creak', 0.25); a(L(2) + 1.8, 'servo', 0.3, 1.0); a(L(2) + 3.0, 'clank', 0.35); a(L(2) + 3.6, 'pop', 0.6); rec(L(2) + 4.2, 'wind-gust', 0.3, 0, 2.0, 1.0); a(L(2) + 4.6, 'pop', 0.6); a(L(2) + 4.8, 'chime', 0.35);
// 3 sway, it will fall
rec(L(3) + 0.1, 'wind-gust', 0.3, 0.5, 2.6, 1.0); a(L(3) + 0.8, 'creak', 0.4); a(L(3) + 1.0, 'pop', 0.6); a(L(3) + 1.4, 'thud', 0.35); a(L(3) + 2.2, 'creak', 0.4);
// 4 pit, rebar, concrete pour
for (let k = 0; k < 3; k++) a(L(4) + 0.1 + k * 0.4, 'thud', 0.25); a(L(4) + 0.8, 'pop', 0.6); a(L(4) + 1.0, 'motor', 0.25, 2.6); a(L(4) + 1.1, 'slosh', 0.3); a(L(4) + 1.6, 'fill', 0.3, 2.0); a(L(4) + 2.6, 'pop', 0.6); a(L(4) + 3.3, 'chime', 0.35);
// 5 small fan, little wind
a(L(5) + 0.3, 'spin', 0.2, 2.6); a(L(5) + 0.6, 'pop', 0.6); a(L(5) + 1.6, 'pop', 0.5); a(L(5) + 2.0, 'beep', 0.2);
// 6 the big blades
for (let k = 0; k < 3; k++) a(L(6) + 0.4 + k * 0.8, 'clank', 0.3); a(L(6) + 0.6, 'servo', 0.3, 2.4); a(L(6) + 2.4, 'pop', 0.6); a(L(6) + 3.0, 'whoosh', 0.35); a(L(6) + 3.4, 'pop', 0.6); a(L(6) + 3.6, 'chime', 0.35);
// 7 15 rpm vs 1500
a(L(7) + 0.2, 'hum', 0.15, D(7) - 0.4); a(L(7) + 0.6, 'pop', 0.6); a(L(7) + 2.6, 'pop', 0.6); a(L(7) + 3.4, 'beep', 0.25); a(L(7) + 3.7, 'beep', 0.25);
// 8 gearbox lowered in, generator spins up
a(L(8) + 0.2, 'servo', 0.3, 1.2); a(L(8) + 1.4, 'clank', 0.4); a(L(8) + 1.4, 'pop', 0.6); a(L(8) + 1.6, 'motor', 0.25, 2.0); a(L(8) + 2.0, 'pop', 0.6); rec(L(8) + 2.4, 'ding', 0.3, 0, 1.1, 1.0);
// 9 wind changes side
rec(L(9) + 0.1, 'wind-gust', 0.3, 0.8, 1.8, 1.0); a(L(9) + 0.8, 'pop', 0.6); a(L(9) + 1.6, 'pop', 0.5);
// 10 vane + yaw motor
a(L(10) + 0.3, 'pop', 0.5); a(L(10) + 0.6, 'pop', 0.6); a(L(10) + 1.6, 'servo', 0.35, 1.6); a(L(10) + 1.8, 'creak', 0.2); a(L(10) + 3.2, 'chime', 0.35);
// 11 storm
rec(L(11) + 0.0, 'wind-gust', 0.45, 0, D(11), 1.2); a(L(11) + 0.3, 'boom', 0.25); a(L(11) + 0.5, 'spin', 0.3, 2.6); a(L(11) + 1.2, 'pop', 0.6); a(L(11) + 1.6, 'creak', 0.45);
// 12 pitch, brake
rec(L(12) + 0.0, 'wind-gust', 0.3, 1.5, 3.0, 1.2); a(L(12) + 0.4, 'pop', 0.6); a(L(12) + 0.8, 'servo', 0.35, 1.6); a(L(12) + 3.6, 'sizzle', 0.3, 1.4); a(L(12) + 3.8, 'pop', 0.6); a(L(12) + 4.4, 'thud', 0.35); a(L(12) + 4.8, 'chime', 0.35);
// 13 690 V lost in the wire
a(L(13) + 0.4, 'hum', 0.15, D(13) - 0.6); a(L(13) + 0.6, 'pop', 0.6); a(L(13) + 1.4, 'sizzle', 0.3, 2.0); a(L(13) + 2.2, 'pop', 0.6);
// 14 transformer lowered in
a(L(14) + 0.2, 'servo', 0.25, 1.0); a(L(14) + 1.3, 'thud', 0.45); a(L(14) + 1.2, 'pop', 0.6); a(L(14) + 1.6, 'charge', 0.3, 1.2); a(L(14) + 2.6, 'pop', 0.6); rec(L(14) + 3.0, 'ding', 0.3, 0, 1.1, 1.0);
// 15 "they turn slowly"
a(L(15) + 0.3, 'whoosh', 0.2); a(L(15) + 0.5, 'pop', 0.6); a(L(15) + 1.4, 'whoosh', 0.2);
// 16 300 km/h
for (let k = 0; k < 5; k++) a(L(16) + 0.6 + k * 0.9, 'whoosh', 0.3); a(L(16) + 1.2, 'pop', 0.7); a(L(16) + 1.8, 'boom', 0.2); a(L(16) + 3.0, 'pop', 0.6);
// 17 coating the edge, rain like bullets
a(L(17) + 0.3, 'pop', 0.5); for (let k = 0; k < 8; k++) a(L(17) + 0.6 + k * 0.18, 'drip', 0.25); a(L(17) + 0.9, 'pop', 0.6); a(L(17) + 1.6, 'wipe', 0.3); a(L(17) + 2.2, 'pop', 0.6); a(L(17) + 2.8, 'wipe', 0.3); a(L(17) + 3.8, 'wipe', 0.3); a(L(17) + 4.8, 'chime', 0.35);
// 18 lightning
rec(L(18) + 0.0, 'wind-gust', 0.3, 0, D(18), 1.2); a(L(18) + 1.0, 'zap', 0.45); a(L(18) + 1.0, 'boom', 0.55); a(L(18) + 1.1, 'pop', 0.6); a(L(18) + 1.2, 'spark', 0.35);
// 19 receptor and down conductor
a(L(19) + 0.3, 'pop', 0.6); a(L(19) + 1.2, 'charge', 0.35, 2.2); a(L(19) + 1.4, 'zap', 0.25); a(L(19) + 3.6, 'pop', 0.6); a(L(19) + 3.7, 'thud', 0.3); a(L(19) + 4.4, 'chime', 0.35);
// 20 ladder, red light, plane
for (let k = 0; k < 10; k++) a(L(20) + 0.2 + k * 0.4, 'clank', 0.12); a(L(20) + 0.5, 'pop', 0.6); a(L(20) + 2.8, 'pop', 0.6); a(L(20) + 2.8, 'beep', 0.2); a(L(20) + 3.4, 'beep', 0.2); a(L(20) + 2.8, 'motor', 0.12, 1.6);
// 21 payoff
a(L(21) + 0.3, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(21) + 0.3 + k * 0.25, 'pop', 0.35);
// 22 outro
a(L(22) + 0.3, 'pop', 0.7); a(L(22) + 0.4, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
