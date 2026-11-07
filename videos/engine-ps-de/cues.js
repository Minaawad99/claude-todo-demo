// Sound cues from the line timings: node cues.js → cues.json (all synthesized in ../audio/sfx.py)
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const bangs = (i, n, g, o) => { for (let k = 0; k < n; k++) a(L(i) + (o || 0.3) + k * (D(i) - 0.6) / n, 'thud', g); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the two cars on the street
a(L(0), 'idle', 0.35, D(0)); a(L(0) + 0.3, 'pop', 0.6); a(L(0) + 1.2, 'rev', 0.5); a(L(0) + 1.3, 'pop', 0.7);
// 1–2: the question, the bar grows
a(L(1) + 0.4, 'pop', 0.5); a(L(1) + 0.9, 'notify', 0.35); a(L(2) + 0.3, 'fill', 0.35, 1.6); a(L(2) + 1.6, 'chime', 0.5);
// 3: brand
a(L(3), 'idle', 0.25, D(3)); a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.25, 'chime', 0.5);
// 4: the horse lifts 75 kg one metre in one second
a(L(4) + 0.3, 'pop', 0.6); a(L(4) + 1.0, 'creak', 0.4); a(L(4) + 1.0, 'servo', 0.35); for (let k = 0; k < 4; k++) a(L(4) + 1.0 + k * 0.25, 'tick', 0.25); a(L(4) + 2.1, 'bell', 0.4);
// 5: a real horse at full gallop
for (let k = 0; k < Math.floor(D(5) / 0.2); k++) a(L(5) + 0.1 + k * 0.2, 'thud', k % 2 ? 0.18 : 0.26); a(L(5) + 1.8, 'pop', 0.6);
// 6–9: the four strokes in one cylinder
a(L(6), 'idle', 0.3, D(6)); [0.4, 1.4, 2.4, 3.4].forEach(o => a(L(6) + o, 'pop', 0.4));
a(L(7) + 0.2, 'intake', 0.45, 1.2); a(L(7) + 1.4, 'squeeze', 0.45); a(L(7) + 0.3, 'pop', 0.5);
a(L(8) + 0.3, 'spark', 0.5); a(L(8) + 0.45, 'boom', 0.6); a(L(8) + 0.6, 'pop', 0.6);
a(L(9), 'gear', 0.35, D(9)); a(L(9) + 0.4, 'pop', 0.5); a(L(9) + 1.4, 'pop', 0.5);
// 10–11: the two engines
a(L(10), 'idle', 0.45, D(10)); a(L(10) + 0.6, 'pop', 0.5); a(L(10) + 1.6, 'pop', 0.5);
a(L(11), 'rev', 0.5); a(L(11) + 0.8, 'idle', 0.5, D(11) - 0.8); a(L(11) + 0.5, 'pop', 0.6);
// 12–15: displacement, more cylinders, bangs per second
a(L(12) + 0.3, 'fill', 0.35, 1.2); a(L(12) + 0.3, 'pop', 0.5); a(L(12) + 1.6, 'pop', 0.5);
bangs(13, 10, 0.25); a(L(13) + 0.6, 'pop', 0.5);
a(L(14), 'rev', 0.55); a(L(14) + 0.8, 'idle', 0.5, D(14) - 0.8); for (let k = 0; k < 8; k++) a(L(14) + 0.5 + k * 0.2, 'tick', 0.2);
a(L(15), 'rev', 0.6); a(L(15) + 0.5, 'idle', 0.6, D(15) - 0.5); a(L(15) + 1.0, 'chime', 0.45);
// 16–19: the turbo
a(L(16), 'spool', 0.45, D(16)); a(L(16) + 0.3, 'pop', 0.7);
a(L(17), 'spool', 0.6, D(17)); a(L(17) + 0.2, 'exhaust', 0.35, D(17) - 0.4); a(L(17) + 0.4, 'pop', 0.5); a(L(17) + 1.2, 'pop', 0.5);
a(L(18), 'spool', 0.45, D(18)); a(L(18) + 0.2, 'intake', 0.4, D(18) - 0.4); a(L(18) + 0.4, 'pop', 0.5); a(L(18) + 1.4, 'pop', 0.5);
a(L(19) + 0.3, 'pop', 0.5); a(L(19) + 0.9, 'pop', 0.5); a(L(19) + 1.45, 'boom', 0.7); a(L(19) + 1.6, 'pop', 0.6);
// 20–21: twin turbos, the five-cylinder
a(L(20), 'spool', 0.5, D(20)); a(L(20) + 0.5, 'pop', 0.6); a(L(21), 'idle', 0.45, D(21)); a(L(21) + 0.3, 'spool', 0.35, D(21) - 0.3); a(L(21) + 0.4, 'pop', 0.5); a(L(21) + 2.2, 'pop', 0.5);
// 22–23: PS vs torque
a(L(22) + 0.3, 'beep', 0.35); a(L(22) + 0.4, 'pop', 0.6); a(L(23), 'servo', 0.35, 1.2); a(L(23) + 0.4, 'pop', 0.5); a(L(23) + 1.4, 'chime', 0.45);
// 24: 0–100 race
a(L(24), 'rev', 0.6); a(L(24) + 0.4, 'motor', 0.45, D(24) - 0.4); a(L(24) + 0.3, 'pop', 0.5); a(L(24) + D(24) * 0.5, 'chime', 0.4); a(L(24) + D(24) - 0.5, 'chime', 0.4);
// 25: fuel and heat
a(L(25) + 0.2, 'drip', 0.4); a(L(25) + 0.6, 'drip', 0.4); a(L(25) + 1.2, 'sizzle', 0.35, 1.4); a(L(25) + 0.4, 'pop', 0.5); a(L(25) + 1.4, 'pop', 0.5);
// 26: bigger, more often, more air
a(L(26) + 0.2, 'boom', 0.5); a(L(26) + 0.5, 'pop', 0.5); a(L(26) + 1.0, 'pop', 0.5); a(L(26) + 1.6, 'pop', 0.5); a(L(26) + 1.8, 'boom', 0.45);
// 27: outro
a(L(27), 'rev', 0.4); a(L(27) + 0.4, 'pop', 0.8); a(L(27) + 0.6, 'chime', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 0));
console.log(c.length, 'cues');
