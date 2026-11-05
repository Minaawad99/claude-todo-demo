// Sound cues from the line timings: node cues.js → cues.json. All sounds are synthesized in ../audio/sfx.py.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur, extra) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}, extra || {}));
const crackle = (i, g, from, to) => { for (let t = L(i) + (from || 0.1); t < (to != null ? L(i) + to : L(i + 1) - 0.1); t += 0.9) a(t, 'sizzle', g, 1.0); };
const beeps = (t0, t1, g) => { for (let t = t0; t < t1; t += 0.5) a(t, 'beep', g, 0.35); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: waking up to a fire
crackle(0, 0.18); a(L(0) + 0.8, 'pop', 0.5); a(L(0) + 2.2, 'bump', 0.4); a(L(0) + 2.4, 'pop', 0.6);
// 1: opening onto the fire
crackle(1, 0.2); a(L(1) + 0.4, 'creak', 0.4); a(L(1) + 0.8, 'boom', 0.4); a(L(1) + 1.2, 'pop', 0.6); a(L(1) + 1.4, 'pop', 0.5);
// 2: back of the hand on the door
crackle(2, 0.12); a(L(2) + 0.6, 'pop', 0.6); a(L(2) + 1.0, 'tick', 0.4); a(L(2) + 2.2, 'pop', 0.5); a(L(2) + 2.4, 'tick', 0.4);
// 3: hot! another way out
a(L(3) + 0.3, 'sizzle', 0.4, 1.2); a(L(3) + 0.5, 'pop', 0.6); a(L(3) + 0.9, 'beep', 0.25); a(L(3) + 2.0, 'pop', 0.5);
// 4: smoke fills the room
a(L(4) + 0.2, 'steam', 0.3, D(4) - 0.4); a(L(4) + 0.6, 'pop', 0.6);
// 5: crawl
for (let k = 0; k < 8; k++) a(L(5) + 0.2 + k * 0.25, 'bump', 0.18); a(L(5) + 0.5, 'pop', 0.6);
// 6: hot smoke rises, clean air low
a(L(6) + 0.2, 'wind', 0.15, D(6) - 0.4); a(L(6) + 0.6, 'pop', 0.5); a(L(6) + 1.8, 'pop', 0.5);
// 7: smoke is the killer
a(L(7) + 0.2, 'steam', 0.3, 2); a(L(7) + 0.8, 'pop', 0.6); a(L(7) + 1.8, 'pop', 0.5);
// 8: cool door, out into the hall
a(L(8) + 0.3, 'chime', 0.35); a(L(8) + 0.6, 'creak', 0.3); a(L(8) + 0.3, 'pop', 0.5);
// 9: close every door behind you
a(L(9) + 0.8, 'thud', 0.5); a(L(9) + 0.8, 'pop', 0.6); a(L(9) + 2.2, 'thud', 0.5);
// 10: the closed-door test
crackle(10, 0.12); for (let k = 0; k < 10; k++) a(L(10) + 0.4 + k * 0.4, 'tick', 0.25); a(L(10) + 0.6, 'pop', 0.6); a(L(10) + 1.4, 'pop', 0.6);
// 11: crowded stairs, empty lift
a(L(11) + 0.5, 'ping', 0.35); a(L(11) + 0.8, 'pop', 0.6);
// 12: take the stairs
a(L(12) + 0.4, 'beep', 0.35); for (let k = 0; k < 6; k++) a(L(12) + 1.2 + k * 0.3, 'thud', 0.18); a(L(12) + 1.6, 'pop', 0.6); a(L(12) + 2.6, 'pop', 0.5);
// 13: trapped
crackle(13, 0.2); a(L(13) + 0.8, 'pop', 0.6);
// 14: wet towel
a(L(14) + 1.0, 'slosh', 0.35); a(L(14) + 1.0, 'pop', 0.6); a(L(14) + 1.4, 'chime', 0.3);
// 15: wave at the window, call 180
a(L(15) + 0.6, 'pop', 0.5); for (let k = 0; k < 3; k++) a(L(15) + 1.8 + k * 0.25, 'tick', 0.4); a(L(15) + 2.4, 'notify', 0.5); a(L(15) + 2.0, 'pop', 0.5);
// 16: asleep, the fire starts
crackle(16, 0.15, 1.0); a(L(16) + 0.8, 'pop', 0.4);
// 17: the smoke alarm goes up
a(L(17) + 0.4, 'servo', 0.3); a(L(17) + 1.0, 'pop', 0.6); a(L(17) + 1.6, 'ping', 0.3);
// 18: the smell doesn't wake you, the sound does
a(L(18) + 0.8, 'pop', 0.5); beeps(L(18) + 1.8, L(19) - 0.1, 0.35); a(L(18) + 2.2, 'pop', 0.5);
// 19: phone, money, gold?
beeps(L(19) + 0.1, L(19) + 1.2, 0.2); a(L(19) + 0.3, 'pop', 0.5); a(L(19) + 1.1, 'pop', 0.5); a(L(19) + 1.9, 'pop', 0.5);
// 20: two minutes
for (let k = 0; k < D(20) / 0.5; k++) a(L(20) + k * 0.5, 'tick', 0.35); a(L(20) + 0.8, 'pop', 0.7);
// 21: don't go back in
a(L(21) + 0.3, 'beep', 0.3); a(L(21) + 1.0, 'pop', 0.6);
// 22: extinguisher, meeting point, plan
a(L(22) + 0.4, 'clank', 0.3); a(L(22) + 0.6, 'pop', 0.6); a(L(22) + 2.4, 'pop', 0.6); a(L(22) + 3.2, 'pop', 0.5);
// 23: the plan is done
a(L(23) + 1.0, 'chime', 0.5); a(L(23) + 1.4, 'pop', 0.7);
// 24: outro
a(L(24) + 0.4, 'pop', 0.8); a(L(24) + 0.6, 'chime', 0.4);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c.sort((x, y) => x.t - y.t) }));
console.log(c.length, 'cues');
