// Sound cues for the kit promo (30 s cut) from the line timings: node cues.js → cues.json
// Recorded clips in sfx/px-*.mp3 are the Pixabay sounds from the sketch template's kit (videos/_templates/sketch/sfx/SOURCES.md).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}));
const count = (t, dur, g) => { for (let k = 0; k < dur / 0.11; k++) a(t + k * 0.11, 'tick', g * (0.5 + 0.5 * k / (dur / 0.11))); a(t + dur, 'chime', g * 1.6); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the tunnel video, the counter running up to 1.3M
a(L(0) + 0.05, 'pop', 0.7); count(L(0) + 0.2, 1.5, 0.3); a(L(0) + 1.0, 'pop', 0.6);
// 1: two more videos, each counter running up
[0, 1.2].forEach(o => { a(L(1) + o, 'pop', 0.7); count(L(1) + o + 0.2, 0.9, 0.28); });
// 2: the brand line
a(L(2) + 0.05, 'pop', 0.9); a(L(2) + 0.2, 'chime', 0.5); a(L(2) + 0.8, 'pop', 0.5);
// 3: the four platforms, then Facebook pays: coins into the jar
[0.1, 1.0, 1.5, 2.0].forEach((o, k) => a(L(3) + o, 'pop', 0.6 + k * 0.05)); rec(L(3) + 2.75, 'swipe', 0.45, 0, 0.7); for (let k = 0; k < 7; k++) a(L(3) + 3.0 + k * 0.26, 'clink', 0.35 + (k % 2) * 0.1); a(L(3) + 3.25, 'pop', 0.6);
// 4: the blank page and the clock, then Claude types it out
rec(L(4) + 0.1, 'clock-ticking', 0.4, 0, 2.0); a(L(4) + 0.45, 'pop', 0.6); a(L(4) + 1.15, 'pop', 0.6); for (let k = 0; k < 16; k++) a(L(4) + 2.25 + k * 0.09, 'tick', 0.22 + (k % 3) * 0.05); a(L(4) + 3.3, 'pop', 0.6); a(L(4) + 3.8, 'chime', 0.5);
// 5: the box opens, four things come out
a(L(5) + 0.1, 'creak', 0.4); a(L(5) + 0.3, 'pop', 0.6); [1.35, 2.2, 3.1, 3.9].forEach(o => { a(L(5) + o - 0.05, 'whoosh', 0.35); a(L(5) + o + 0.25, 'pop', 0.7); }); rec(L(5) + 4.2, 'ding', 0.45, 0, 0.9);
// 6: type the topic, send, three sheets, then the pencil
for (let k = 0; k < 6; k++) a(L(6) + 0.05 + k * 0.08, 'tick', 0.25); a(L(6) + 0.55, 'ping', 0.6); [0.7, 1.5, 2.0].forEach((o, k) => { a(L(6) + o, 'pop', 0.65); rec(L(6) + o + 0.1, 'paper', 0.4, 0, 0.6); }); rec(L(6) + 2.8, 'pencil-scribble', 0.5, 0, 1.0); a(L(6) + 2.9, 'pop', 0.6);
// 7: the price and the link
a(L(7) + 0.05, 'pop', 0.9); rec(L(7) + 0.2, 'ding', 0.6, 0, 1.2); a(L(7) + 2.3, 'pop', 0.7); a(L(7) + 2.4, 'notify', 0.5); a(L(7) + 3.3, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1));
console.log(c.length + ' cues');
