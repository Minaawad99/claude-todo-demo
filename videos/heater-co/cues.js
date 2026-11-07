// Sound cues from the line timings: node cues.js → cues.json
// A whoosh before every line, a pop on every tag, synthesized effects matched to the action (audio/sfx.py), and recorded
// clips in sfx/px-*.mp3 (Pixabay, kept out of git, credited in refs/SOURCES.md): the yawn, the heart monitor and the phone
// ring the channel sent for the pregnancy episode, plus any clip asked for this episode once it arrives (see HAVE).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const fs = require('fs'), HAVE = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3');
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const tagPop = (i, u0, g) => a(L(i) + u0 + 0.05, 'pop', g || 0.55);
// the heater burning: a recorded burner if there is one, else a low hum
const burner = (i, g, from) => HAVE('gas-burner') ? rec(L(i), 'gas-burner', g, from || 0, D(i), 1.2) : a(L(i) + 0.05, 'hum', g * 0.6, D(i) - 0.1);
const shower = (i, g, from) => HAVE('shower') ? rec(L(i), 'shower', g, from || 0, D(i), 1.2) : a(L(i) + 0.05, 'spray', g * 0.5, D(i) - 0.1);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the door shuts, warning
burner(0, 0.3); a(L(0) + 1.7, 'thud', 0.7); if (HAVE('door-close')) rec(L(0) + 1.5, 'door-close', 0.5, 0, 1.0, 0.6); a(L(0) + 2.05, 'beep', 0.4); tagPop(0, 0.7); tagPop(0, 2.2, 0.75);
// 1: shower + heater, curious
shower(1, 0.35, 2); tagPop(1, 0.8); tagPop(1, 1.8);
// 2: every winter: the siren and the news
if (HAVE('siren')) rec(L(2) + 0.1, 'siren', 0.35, 0, D(2) - 0.1, 1.0); else for (let k = 0; k < 5; k++) a(L(2) + 0.1 + k * 0.5, k % 2 ? 'beep' : 'notify', 0.25); tagPop(2, 0.6, 0.65); tagPop(2, 1.4);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: air drawn into the burner
burner(4, 0.35); a(L(4) + 0.2, 'wind', 0.25, D(4) - 0.4); tagPop(4, 0.5); tagPop(4, 1.5);
// 5: the cubes of air fill up
a(L(5) + 0.2, 'fill', 0.3, 3.4); for (let k = 0; k < 10; k++) a(L(5) + 0.2 + k * 0.36, 'tick', 0.25); tagPop(5, 1.0); a(L(5) + 3.65, 'chime', 0.4); tagPop(5, 3.6, 0.7);
// 6: the blue flame, molecules rising
burner(6, 0.45, 3); for (let k = 0; k < 4; k++) a(L(6) + 0.6 + k * 0.9, 'plunk', 0.25); tagPop(6, 0.3); tagPop(6, 1.6);
// 7: exhaust out through the flue
a(L(7) + 0.2, 'steam', 0.25, 2.0); tagPop(7, 0.4); tagPop(7, 1.4);
// 8: door and window shut, the oxygen dial drops, the clock speeds
a(L(8) + 0.5, 'thud', 0.6); a(L(8) + 0.7, 'clank', 0.3); for (let k = 0; k < 14; k++) a(L(8) + 0.9 + k * 0.24, 'tick', 0.22); tagPop(8, 1.2);
// 9: blocked flue, exhaust spills back
a(L(9) + 0.3, 'creak', 0.3); a(L(9) + 0.5, 'steam', 0.3, 2.4); tagPop(9, 0.4, 0.65); tagPop(9, 1.5);
// 10: the flame turns yellow
burner(10, 0.5, 6); a(L(10) + 0.5, 'sizzle', 0.3, 1.6); tagPop(10, 0.6); tagPop(10, 1.4, 0.75);
// 11: CO2 loses an oxygen → CO
a(L(11) + 1.3, 'zap', 0.35); tagPop(11, 1.4); a(L(11) + 2.4, 'notify', 0.4); tagPop(11, 2.4, 0.7);
// 12: the silent killer, shown by the x-ray sweep
shower(12, 0.3, 6); tagPop(12, 0.3, 0.7); tagPop(12, 1.2); a(L(12) + 2.2, 'wipe', 0.4); a(L(12) + 2.4, 'charge', 0.3);
// 13: red cells carrying oxygen
a(L(13) + 0.1, 'slosh', 0.3, D(13) - 0.2); tagPop(13, 0.3); tagPop(13, 1.4);
// 14: CO grabs the cell, oxygen is pushed off
for (let k = 0; k < 4; k++) a(L(14) + 0.6 + k * 0.4, 'clink', 0.4); tagPop(14, 1.0); a(L(14) + 2.2, 'pop', 0.85); a(L(14) + 2.3, 'thud', 0.5);
// 15: brain and heart start to choke
shower(15, 0.25, 10); if (HAVE('monitor-beep')) rec(L(15) + 0.4, 'monitor-beep', 0.35, 0, D(15) - 0.5, 0.8); tagPop(15, 0.6); tagPop(15, 1.2); tagPop(15, 2.2, 0.65);
// 16: headache and dizziness, "it's the steam"
a(L(16) + 0.2, 'spin', 0.3); a(L(16) + 0.3, 'steam', 0.25, 2.6); tagPop(16, 0.3); tagPop(16, 1.8);
// 17: drowsy, heavy legs, the door far away
if (HAVE('yawn')) rec(L(17) + 0.1, 'yawn', 0.5, 2.0, 0.85, 1.0); a(L(17) + 1.0, 'thud', 0.4); a(L(17) + 1.6, 'thud', 0.35); tagPop(17, 0.3); tagPop(17, 1.0); tagPop(17, 2.2, 0.65);
// 18: the grid of a thousand, two turn red, the clock
for (let k = 0; k < 8; k++) a(L(18) + 0.2 + k * 0.2, 'tick', 0.2); a(L(18) + 1.95, 'ping', 0.45); a(L(18) + 2.25, 'ping', 0.45); a(L(18) + 2.65, 'pop', 0.8); a(L(18) + 2.8, 'bell', 0.25);
// 19: the child breathes faster
for (let k = 0; k < 6; k++) a(L(19) + 0.3 + k * 0.42, 'whoosh', 0.12); tagPop(19, 0.5, 0.65); tagPop(19, 1.2);
// 20: the heater moves out of the bathroom
a(L(20) + 0.3, 'pop', 0.55); a(L(20) + 0.9, 'whoosh', 0.45); a(L(20) + 2.5, 'chime', 0.45); tagPop(20, 2.6, 0.65); tagPop(20, 2.8);
// 21: window open, the fan starts
a(L(21) + 0.4, 'creak', 0.35); tagPop(21, 0.6); a(L(21) + 1.0, 'motor', 0.25, D(21) - 1.2); tagPop(21, 1.2); tagPop(21, 2.4);
// 22: yellow flame and soot, the technician
burner(22, 0.35, 9); tagPop(22, 0.4); tagPop(22, 1.1); a(L(22) + 2.25, 'pop', 0.6); for (let k = 0; k < 4; k++) a(L(22) + 2.6 + k * 0.45, 'clank', 0.25); tagPop(22, 2.4, 0.7);
// 23: valve off, fresh air, call 123
a(L(23) + 0.7, 'servo', 0.35); a(L(23) + 1.3, 'clank', 0.4); tagPop(23, 0.8); a(L(23) + 2.0, 'pop', 0.6); a(L(23) + 2.1, 'wind', 0.25, 1.5); tagPop(23, 2.4);
if (HAVE('phone-ring')) rec(L(23) + 3.85, 'phone-ring', 0.4, 0, 1.85, 1.0); else { a(L(23) + 3.9, 'bell', 0.4); a(L(23) + 4.5, 'bell', 0.4); } tagPop(23, 4.2, 0.65);
// 24: payoff: window open, fan on, shower happy
shower(24, 0.3, 14); a(L(24) + 0.6, 'chime', 0.5); tagPop(24, 0.8);
// 25: outro
a(L(25) + 0.3, 'pop', 0.8); a(L(25) + 0.5, 'chime', 0.45);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c.sort((x, y) => x.t - y.t) }, null, 1));
console.log(c.length, 'cues');
