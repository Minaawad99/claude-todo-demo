// Sound cues from the line timings: node cues.js → cues.json. Sound effects only, no music.
// Recorded sounds (sfx/px-*.mp3) are Pixabay sound effects (Pixabay Content License) the channel sent earlier:
// a ding, a wind gust, a swipe (the sketch kit), a cough, an exhale and a heartbeat (secret-basement).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const flap = (t, n) => { for (let k = 0; k < n; k++) a(t + k * 0.09, 'wipe', 0.18); };
const hammer = (t, n, gap) => { for (let k = 0; k < n; k++) a(t + k * (gap || 0.42), 'clank', 0.28); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0 posts drop in, the wire wraps
for (let k = 0; k < 4; k++) a(L(0) + 0.5 + k * 0.25, 'thud', 0.35); a(L(0) + 1.4, 'paper', 0.3); a(L(0) + 1.2, 'pop', 0.6); a(L(0) + 2.6, 'pop', 0.6);
// 1 the hen flaps out over the wire
flap(L(1) + 0.8, 10); a(L(1) + 2.6, 'pop', 0.6); a(L(1) + 1.8, 'pop', 0.5); a(L(1) + 3.2, 'thud', 0.25);
// 2 the wire roof slides on
a(L(2) + 0.3, 'wipe', 0.35); a(L(2) + 1.0, 'clank', 0.3); a(L(2) + 1.1, 'pop', 0.6); rec(L(2) + 1.6, 'ding', 0.3, 0, 1.1, 1.0);
// 3 night, the cat creeps in and grabs
a(L(3) + 0.2, 'hum', 0.08, D(3) - 0.2); a(L(3) + 1.0, 'pop', 0.6); a(L(3) + 1.6, 'creak', 0.3); flap(L(3) + 2.6, 8); a(L(3) + 2.8, 'pop', 0.5);
// 4 the weasel slips in
rec(L(4) + 0.3, 'heartbeat', 0.35, 0, 3.4, 1.0); a(L(4) + 0.8, 'pop', 0.6); a(L(4) + 1.8, 'pop', 0.5); a(L(4) + 3.6, 'boom', 0.3); a(L(4) + 3.8, 'thud', 0.35);
// 5 in ✓ / out ✗
a(L(5) + 0.6, 'pop', 0.5); a(L(5) + 0.9, 'ping', 0.3); a(L(5) + 1.8, 'pop', 0.5); a(L(5) + 2.0, 'beep', 0.25);
// 6 stiff mesh hammered on
hammer(L(6) + 0.3, 5); a(L(6) + 1.2, 'pop', 0.6); a(L(6) + 2.6, 'pop', 0.6); a(L(6) + 2.7, 'chime', 0.4);
// 7 the roof gets hot, hens pant
a(L(7) + 0.3, 'sizzle', 0.25, 2.5); a(L(7) + 1.0, 'pop', 0.6); a(L(7) + 2.4, 'pop', 0.5); a(L(7) + 3.6, 'pop', 0.6); a(L(7) + 3.0, 'charge', 0.2, 1.0);
// 8 the house drops in, the ramp
hammer(L(8) + 0.2, 4, 0.3); a(L(8) + 1.6, 'thud', 0.4); a(L(8) + 1.4, 'pop', 0.6); a(L(8) + 2.4, 'pop', 0.5); a(L(8) + 3.4, 'pop', 0.5); rec(L(8) + 4.6, 'ding', 0.3, 0, 1.1, 1.0);
// 9 the door shuts, hot air trapped
a(L(9) + 0.3, 'thud', 0.4); a(L(9) + 0.8, 'steam', 0.15, 2.0); a(L(9) + 1.4, 'pop', 0.5); rec(L(9) + 2.6, 'cough', 0.3, 0.85, 1.4, 1.0); a(L(9) + 2.2, 'beep', 0.25);
// 10 slots cut, the air flows out
a(L(10) + 0.4, 'snip', 0.35); a(L(10) + 0.7, 'snip', 0.35); a(L(10) + 0.9, 'pop', 0.6); rec(L(10) + 1.2, 'wind-gust', 0.22, 0, 1.8, 1.0); rec(L(10) + 2.6, 'exhale', 0.3, 0, 1.2, 1.0);
// 11 night, where to sleep
a(L(11) + 0.8, 'pop', 0.5); a(L(11) + 1.0, 'tick', 0.25); a(L(11) + 1.2, 'tick', 0.25);
// 12 the perch, hens hop up
a(L(12) + 0.3, 'clank', 0.3); a(L(12) + 0.9, 'pop', 0.6); flap(L(12) + 1.4, 8); a(L(12) + 2.2, 'chime', 0.35);
// 13 looking for a dark corner
for (let k = 0; k < 6; k++) a(L(13) + 0.2 + k * 0.4, 'tick', 0.15); a(L(13) + 0.8, 'pop', 0.5);
// 14 nest boxes with straw
a(L(14) + 0.6, 'thud', 0.3); a(L(14) + 0.9, 'paper', 0.3); a(L(14) + 1.0, 'pop', 0.6); a(L(14) + 1.8, 'pop', 0.5); a(L(14) + 2.6, 'chime', 0.35);
// 15 the rooster question
a(L(15) + 0.6, 'pop', 0.6); a(L(15) + 1.2, 'pop', 0.5); a(L(15) + 1.3, 'bell', 0.15);
// 16 an egg appears, rooster ✗
a(L(16) + 1.0, 'plunk', 0.4); a(L(16) + 1.1, 'ping', 0.35); a(L(16) + 1.8, 'pop', 0.5); a(L(16) + 1.8, 'beep', 0.25);
// 17 the rooster walks off
a(L(17) + 0.2, 'pop', 0.5); a(L(17) + 1.0, 'pop', 0.5); for (let k = 0; k < 5; k++) a(L(17) + 1.5 + k * 0.35, 'tick', 0.15); a(L(17) + 2.0, 'pop', 0.6); a(L(17) + 3.0, 'chime', 0.35);
// 18 winter, eggs drop
a(L(18) + 0.6, 'pop', 0.5); rec(L(18) + 0.4, 'wind-gust', 0.25, 1, 2.0, 1.0); for (let k = 0; k < 3; k++) a(L(18) + 0.9 + k * 0.5, 'pop', 0.3); a(L(18) + 2.3, 'thud', 0.3);
// 19 the clock fills to 14 hours
for (let k = 0; k < 14; k++) a(L(19) + 0.4 + k * 0.17, 'tick', 0.18); a(L(19) + 1.2, 'pop', 0.5); a(L(19) + 2.9, 'ping', 0.3);
// 20 the lamp
a(L(20) + 0.4, 'clank', 0.25); a(L(20) + 0.8, 'pop', 0.6); a(L(20) + 1.6, 'tick', 0.4); a(L(20) + 1.6, 'hum', 0.1, 2.0); rec(L(20) + 1.8, 'ding', 0.3, 0, 1.1, 1.0);
// 21 waterer, feeder, sand
a(L(21) + 0.4, 'fill', 0.25, 1.0); a(L(21) + 0.6, 'pop', 0.5); a(L(21) + 1.6, 'pop', 0.5); a(L(21) + 1.7, 'slosh', 0.2); a(L(21) + 2.6, 'pop', 0.5); a(L(21) + 2.8, 'wipe', 0.2);
// 22 congratulations / 23 outro
a(L(22) + 0.3, 'chime', 0.5); for (let k = 0; k < 6; k++) a(L(22) + 0.3 + k * 0.25, 'pop', 0.35);
a(L(23) + 0.3, 'pop', 0.7); a(L(23) + 0.4, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
