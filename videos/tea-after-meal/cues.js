// Sound cues from the line timings: node cues.js → cues.json (synthesized effects from ../audio/sfx.py only).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
const tagPop = (i, ...us) => us.forEach(u => a(L(i) + u, 'pop', 0.55));
const stir = (t, n) => { for (let k = 0; k < n; k++) a(t + k * 0.28, 'clink', 0.18); };
// 0 lunch over, the glass slides in
a(L(0) + 2.0, 'whoosh', 0.35); a(L(0) + 2.8, 'clink', 0.3); tagPop(0, 0.3, 1.8);
// 1 does it digest? 2 does it take something?
stir(L(1) + 0.3, 5); tagPop(1, 0.8); a(L(2) + 1.4, 'snip', 0.3); tagPop(2, 1.2);
// 3 brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5); stir(L(3) + 0.6, 4);
// 4–5 stomach acid, iron appears
a(L(4) + 0.2, 'fizz', 0.35, 2.4); tagPop(4, 0.6, 1.6); a(L(5) + 0.4, 'ping', 0.45); tagPop(5, 0.8);
// 6 blood with oxygen, 7 absorption
a(L(6), 'hum', 0.15, D(6)); tagPop(6, 0.6, 2.2); for (let k = 0; k < 4; k++) a(L(7) + 0.5 + k * 0.6, 'drop', 0.3); tagPop(7, 0.4, 1.6);
// 8 tannins in the tea, 9 they grab the iron
a(L(8) + 0.2, 'slosh', 0.3); tagPop(8, 0.6, 1.8); a(L(9) + 1.4, 'clank', 0.35); a(L(9) + 1.7, 'thud', 0.4); tagPop(9, 1.8);
// 10 too big to pass, 11 out it goes
a(L(10) + 0.6, 'bump', 0.4); a(L(10) + 1.4, 'beep', 0.35); tagPop(10, 0.4, 1.8); a(L(11) + 0.4, 'whoosh', 0.4); a(L(11) + 1.0, 'pop', 0.5);
// 12 the 90% bar
a(L(12) + 0.2, 'fill', 0.3); a(L(12) + 1.4, 'wipe', 0.35); a(L(12) + 2.5, 'thud', 0.5); tagPop(12, 0.4, 0.9);
// 13 the plates pop in, 14 a struggle, 15 meat and chicken
for (let k = 0; k < 4; k++) a(L(13) + k * 0.5, 'pop', 0.45); tagPop(14, 0.4, 1.8); a(L(14) + 0.8, 'creak', 0.25);
tagPop(15, 0.4, 1.6); a(L(15) + 1.0, 'bump', 0.35);
// 16 tanning, 17 black ink, 18 manuscripts, 19 your stomach = inkwell
a(L(16), 'slosh', 0.3, 2); tagPop(16, 0.6, 1.8); for (let k = 0; k < 5; k++) a(L(17) + 0.4 + k * 0.4, 'drip', 0.35); a(L(17) + 2.2, 'boom', 0.25);
a(L(18) + 0.3, 'paper', 0.3); tagPop(18, 0.4, 1.6); tagPop(19, 0.4, 1.4); a(L(19) + 0.9, 'chime', 0.3);
// 20 a quarter of women, 21 who needs care
a(L(20) + 1.0, 'beep', 0.3); tagPop(20, 0.6, 1.4); tagPop(21, 0.3, 1.0, 1.8);
// 22 the clock: an hour, 23 lemon + vitamin C
for (let k = 0; k < Math.floor(D(22) / 0.5); k++) a(L(22) + k * 0.5, 'tick', 0.4); tagPop(22, 0.3, 2.6);
a(L(23) + 0.2, 'drip', 0.3); a(L(23) + 0.6, 'drip', 0.3); tagPop(23, 0.4, 1.4); a(L(23) + 1.6, 'ping', 0.3);
// 24 payoff, 25 outro
stir(L(24) + 0.4, 4); tagPop(24, 0.6); a(L(24) + 2.2, 'chime', 0.45); a(L(25) + 0.4, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c.sort((x, y) => x.t - y.t) }, null, 1));
console.log(c.length, 'cues');
