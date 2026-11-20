// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) from the sketch kit: a ding, a wind
// gust, a ticking clock and rushing water. Jet engines, sirens and impacts are synthesized in videos/audio/sfx.py.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 scrape the sand, a plane lands
for (let k = 0; k < 3; k++) a(L(0) + 0.2 + k * 0.5, 'wipe', 0.25); a(L(0) + 1.2, 'jet', 0.25, 2.0); a(L(0) + 3.2, 'thud', 0.35); a(L(0) + 3.4, 'pop', 0.5);
// 1 engine sucks stones, a blade breaks
a(L(1) + 0.2, 'spool', 0.3, 2.2); a(L(1) + 0.4, 'intake', 0.3, 2.6); for (let k = 0; k < 4; k++) a(L(1) + 1.0 + k * 0.3, 'tick', 0.3); a(L(1) + 2.6, 'clank', 0.5); a(L(1) + 2.65, 'spark', 0.4); a(L(1) + 3.0, 'pop', 0.6);
// 2 concrete runway poured
a(L(2) + 0.3, 'fill', 0.25, 1.9); a(L(2) + 0.8, 'pop', 0.5); rec(L(2) + 2.6, 'ding', 0.3, 0, 1.1, 1.0);
// 3 the slab cracks
a(L(3) + 0.4, 'pop', 0.6); a(L(3) + 1.8, 'creak', 0.4, 1.4); a(L(3) + 2.4, 'thud', 0.4); a(L(3) + 3.2, 'pop', 0.5);
// 4 layers: roller, gravel, concrete
a(L(4) + 0.5, 'motor', 0.25, 1.5); a(L(4) + 1.8, 'spray', 0.2, 1.1); a(L(4) + 3.1, 'fill', 0.25, 1.4); a(L(4) + 4.4, 'pop', 0.5); a(L(4) + 4.6, 'chime', 0.4);
// 5 metal strip, tyre burst
a(L(5) + 0.3, 'ping', 0.3); a(L(5) + 0.9, 'jet', 0.3, 2.4); a(L(5) + 2.2, 'boom', 0.45); a(L(5) + 2.25, 'spark', 0.35); a(L(5) + 3.1, 'pop', 0.6);
// 6 the sweeper truck
a(L(6) + 0.2, 'motor', 0.25, 2.6); a(L(6) + 0.3, 'spin', 0.2, 2.4); a(L(6) + 0.4, 'pop', 0.5); a(L(6) + 2.2, 'chime', 0.4);
// 7 take-off run, runway runs out
a(L(7) + 0.1, 'jet', 0.35, 3.0); for (let k = 0; k < 5; k++) a(L(7) + 0.4 + k * 0.4, 'tick', 0.2); a(L(7) + 2.4, 'beep', 0.3); a(L(7) + 2.6, 'pop', 0.5);
// 8 runway stretched, lift-off
a(L(8) + 0.1, 'servo', 0.25, 0.9); a(L(8) + 0.2, 'pop', 0.5); a(L(8) + 0.8, 'jet', 0.35, 2.4); a(L(8) + 2.4, 'chime', 0.4);
// 9 crosswind
rec(L(9) + 0.1, 'wind-gust', 0.35, 0, D(9) - 0.1, 1.2); a(L(9) + 2.9, 'pop', 0.5); a(L(9) + 2.9, 'thud', 0.3);
// 10 runway turned, windsock
a(L(10) + 0.4, 'servo', 0.25, 1.4); a(L(10) + 1.8, 'chime', 0.3); a(L(10) + 2.2, 'clank', 0.3); rec(L(10) + 2.6, 'wind-gust', 0.2, 0.5, 2.0, 1.0); a(L(10) + 3.4, 'pop', 0.6);
// 11 night: a plane somewhere up there
a(L(11) + 0.2, 'jet', 0.2, 2.6); a(L(11) + 1.0, 'pop', 0.5);
// 12 lights pop on one by one
for (let k = 0; k < 8; k++) a(L(12) + 0.3 + k * 0.27, 'tick', 0.22); a(L(12) + 1.4, 'pop', 0.5); a(L(12) + 2.6, 'chime', 0.4);
// 13 too high, too low
a(L(13) + 0.2, 'jet', 0.2, 2.6); a(L(13) + 0.6, 'pop', 0.5); a(L(13) + 1.8, 'beep', 0.25);
// 14 PAPI
for (let k = 0; k < 4; k++) a(L(14) + 0.3 + k * 0.3, 'clank', 0.25); a(L(14) + 0.9, 'pop', 0.5); a(L(14) + 2.0, 'beep', 0.25); a(L(14) + 3.4, 'beep', 0.25); a(L(14) + 4.8, 'chime', 0.45);
// 15 two planes on one runway
a(L(15) + 0.1, 'jet', 0.35, 3.5); a(L(15) + 2.2, 'beep', 0.35); a(L(15) + 2.5, 'beep', 0.35); a(L(15) + 2.4, 'pop', 0.5);
// 16 control tower rises, radio
a(L(16) + 0.2, 'servo', 0.25, 2.2); a(L(16) + 2.2, 'notify', 0.35); a(L(16) + 2.4, 'jet', 0.25, 3.0); a(L(16) + 2.6, 'pop', 0.5); a(L(16) + 4.0, 'chime', 0.35);
// 17 fire, the clock starts
a(L(17) + 0.1, 'sizzle', 0.35, 2.7); a(L(17) + 0.2, 'boom', 0.35); rec(L(17) + 0.8, 'clock-ticking', 0.3, 0, D(17) - 0.8, 1.2); a(L(17) + 0.5, 'pop', 0.5);
// 18 fire station, truck, water
a(L(18) + 0.2, 'creak', 0.25, 0.8); a(L(18) + 0.9, 'motor', 0.3, 1.8); a(L(18) + 0.9, 'bell', 0.25); rec(L(18) + 2.8, 'water-rush', 0.3, 1, 1.8, 1.2); a(L(18) + 3.4, 'chime', 0.4);
// 19 brakes fail, off the end
a(L(19) + 0.1, 'jet', 0.3, 2.0); a(L(19) + 0.8, 'pop', 0.5); a(L(19) + 2.8, 'thud', 0.45); a(L(19) + 3.0, 'pop', 0.5);
// 20 the wall: crash
a(L(20) + 0.5, 'clank', 0.3); a(L(20) + 0.8, 'pop', 0.5); a(L(20) + 3.2, 'boom', 0.5); a(L(20) + 3.4, 'pop', 0.5);
// 21 EMAS: blocks, the plane sinks in and stops, saved
for (let k = 0; k < 6; k++) a(L(21) + 0.4 + k * 0.3, 'clank', 0.2); a(L(21) + 1.0, 'pop', 0.5); a(L(21) + 2.4, 'jet', 0.25, 2.0); a(L(21) + 3.8, 'creak', 0.3, 1.8); a(L(21) + 6.0, 'chime', 0.45); a(L(21) + 6.6, 'pop', 0.6);
// 22 terminal, bridge, tanks
a(L(22) + 0.2, 'servo', 0.25, 1.0); a(L(22) + 1.0, 'motor', 0.2, 1.0); a(L(22) + 1.6, 'pop', 0.5); a(L(22) + 2.2, 'clank', 0.3);
// 23 payoff
a(L(23) + 0.2, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(23) + 0.3 + k * 0.25, 'pop', 0.35); a(L(23) + 0.6, 'jet', 0.3, 2.5);
a(L(24) + 0.4, 'pop', 0.6); a(L(24) + 0.5, 'chime', 0.4);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
