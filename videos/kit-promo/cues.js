// Sound cues for the kit promo from the line timings: node cues.js → cues.json
// Recorded clips in sfx/px-*.mp3 are the Pixabay sounds from the sketch template's kit (videos/_templates/sketch/sfx/SOURCES.md).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}));
const count = (t, dur, g) => { for (let k = 0; k < dur / 0.11; k++) a(t + k * 0.11, 'tick', g * (0.5 + 0.5 * k / (dur / 0.11))); a(t + dur, 'chime', g * 1.6); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the tunnel video, the counter running up to 1.3M
a(L(0) + 0.05, 'pop', 0.7); count(L(0) + 0.25, 2.3, 0.3); a(L(0) + 1.5, 'pop', 0.6); a(L(0) + 2.6, 'pop', 0.5);
// 1: the phone slides aside, the stopwatch, "you can too"
rec(L(1), 'swipe', 0.5, 0, 0.8); a(L(1) + 0.3, 'pop', 0.6); for (let k = 0; k < 6; k++) a(L(1) + 0.6 + k * 0.25, 'tick', 0.25); a(L(1) + 2.0, 'pop', 0.7); a(L(1) + 2.05, 'ping', 0.5);
// 2: the brand line
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5); a(L(2) + 0.9, 'pop', 0.5);
// 3: dollars dropping into the jar
for (let k = 0; k < 7; k++) a(L(3) + 0.15 + k * 0.28, 'clink', 0.35 + (k % 2) * 0.1); a(L(3) + 0.5, 'pop', 0.6);
// 4: three more videos, each counter running up
[0, 2.8, 5.06].forEach(o => { a(L(4) + o, 'pop', 0.7); count(L(4) + o + 0.3, 1.6, 0.28); }); a(L(4) + 7.0, 'wipe', 0.4);
// 5: hours at the desk
rec(L(5) + 0.1, 'clock-ticking', 0.45, 0, D(5) - 0.3); rec(L(5) + 1.5, 'paper', 0.5, 0, 0.7); rec(L(5) + 2.4, 'paper', 0.5, 0.3, 0.7); for (let k = 0; k < 5; k++) a(L(5) + 1.2 + k * 0.7, 'thud', 0.18); a(L(5) + 3.4, 'pop', 0.7);
// 6: Claude writes them in minutes
for (let k = 0; k < 18; k++) a(L(6) + 0.1 + k * 0.09, 'tick', 0.22 + (k % 3) * 0.05); a(L(6) + 0.9, 'pop', 0.6); a(L(6) + 1.75, 'chime', 0.5);
// 7: the box opens, four things come out
a(L(7) + 0.1, 'creak', 0.4); a(L(7) + 0.5, 'pop', 0.6); a(L(7) + 1.5, 'thud', 0.3); [2.2, 3.0, 3.75, 4.5].forEach((o, k) => { a(L(7) + o, 'whoosh', 0.35); a(L(7) + o + 0.3, 'pop', 0.7); }); rec(L(7) + 5.0, 'ding', 0.5, 0, 1.0);
// 8: type the topic, send, three sheets
for (let k = 0; k < 13; k++) a(L(8) + 0.1 + k * 0.095, 'tick', 0.25); a(L(8) + 1.5, 'ping', 0.6); [1.9, 2.6, 3.2].forEach((o, k) => { a(L(8) + o, 'pop', 0.65); rec(L(8) + o + 0.1, 'paper', 0.4, k * 0.3, 0.6); });
// 9: drawing and editing
rec(L(9) + 0.1, 'pencil-scribble', 0.5, 0, 1.6); a(L(9) + 0.3, 'pop', 0.6);
// 10: the price and the link
a(L(10) + 0.05, 'pop', 0.9); rec(L(10) + 0.2, 'ding', 0.6, 0, 1.2); a(L(10) + 1.5, 'pop', 0.7); a(L(10) + 1.6, 'notify', 0.5); a(L(10) + 3.4, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1));
console.log(c.length + ' cues');
