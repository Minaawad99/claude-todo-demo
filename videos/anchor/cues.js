// Sound cues for «سر المرساية الصغيرة» (one-minute version, 14 lines), from the line timings: node cues.js → cues.json
// All synthesized (audio/sfx.py) over the music bed; no Pixabay clips are in this container.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
const sea = i => a(L(i), 'waves', 0.3, D(i));
// 0–3: the giant ship, the balance, the puzzled sailor, the anchor drops in
sea(0); a(L(0) + 0.4, 'pop', 0.55); a(L(0) + 2.8, 'clank', 0.4); a(L(0) + 2.9, 'pop', 0.6);
a(L(1) + 0.3, 'creak', 0.4); a(L(1) + 1.0, 'thud', 0.5); a(L(1) + 1.6, 'ping', 0.5);
sea(2); a(L(2) + 0.5, 'pop', 0.4); a(L(2) + 1.3, 'pop', 0.35);
sea(3); for (let k = 0; k < 7; k++) a(L(3) + 0.05 + k * 0.14, 'clink', 0.3); a(L(3) + 1.0, 'splash', 0.6); a(L(3) + 0.4, 'chime', 0.4);
// 4: not lifting; wind and current
sea(4); a(L(4) + 0.8, 'beep', 0.4); a(L(4), 'wind', 0.3, D(4)); a(L(4) + 0.6, 'pop', 0.45); a(L(4) + 1.5, 'pop', 0.45); a(L(4) + 2.0, 'pop', 0.45);
// 5: plough, then the flukes dig in
a(L(5), 'gear', 0.22, D(5) * 0.38); a(L(5) + 0.4, 'pop', 0.55); a(L(5) + D(5) * 0.38, 'slosh', 0.3, D(5) * 0.6); a(L(5) + D(5) * 0.38 + 0.3, 'creak', 0.4); a(L(5) + D(5) * 0.38 + 0.6, 'squeeze', 0.35); a(L(5) + D(5) * 0.38 + 0.6, 'pop', 0.45); a(L(5) + D(5) * 0.38 + 1.4, 'pop', 0.45);
// 6: pull vs hold, then flat vs up
a(L(6) + 0.2, 'servo', 0.3, D(6) * 0.45); a(L(6) + 0.8, 'pop', 0.5); a(L(6) + D(6) * 0.5 + 0.2, 'ping', 0.45); a(L(6) + D(6) * 0.5 + 0.9, 'creak', 0.35); a(L(6) + D(6) * 0.5 + 1.5, 'drop', 0.4); a(L(6) + D(6) * 0.5 + 1.6, 'beep', 0.45);
// 7: the chain on the quay
for (let k = 0; k < 16; k++) a(L(7) + 0.2 + k * 0.12, 'clink', 0.22); a(L(7) + 0.2, 'chime', 0.45); a(L(7) + 2.4, 'thud', 0.5); a(L(7) + 2.5, 'pop', 0.5);
// 8: lying on the bottom, flat pull
sea(8); a(L(8) + 0.6, 'pop', 0.5); a(L(8) + 0.4, 'hum', 0.15, 1.4); a(L(8) + 2.0, 'servo', 0.25, 0.8); a(L(8) + 2.2, 'pop', 0.45); a(L(8) + 3.0, 'ping', 0.45);
// 9: heaving in, the anchor breaks out
sea(9); a(L(9), 'motor', 0.35, D(9) * 0.6); for (let k = 0; k < 14; k++) a(L(9) + 0.2 + k * 0.18, 'clink', 0.18); a(L(9) + D(9) * 0.5, 'pop', 0.5); a(L(9) + D(9) * 0.6, 'squeeze', 0.35); a(L(9) + D(9) * 0.62, 'slosh', 0.4, 1.2); a(L(9) + D(9) * 0.75, 'pop', 0.55); a(L(9) + D(9) * 0.78, 'chime', 0.4);
// 10–11: storm, dragging, the broken pipeline
a(L(10), 'wind', 0.5, D(10)); a(L(10), 'waves', 0.55, D(10)); a(L(10) + 0.3, 'creak', 0.4); a(L(10) + 1.2, 'pop', 0.5); a(L(10) + 1.0, 'boom', 0.35);
a(L(11), 'wind', 0.35, D(11)); a(L(11), 'waves', 0.4, D(11)); a(L(11) + 0.4, 'pop', 0.5); a(L(11) + D(11) * 0.68, 'clank', 0.6); a(L(11) + D(11) * 0.7, 'fizz', 0.45, 1.6); a(L(11) + 3.2, 'pop', 0.5);
// 12–13: payoff + outro
sea(12); a(L(12) + 0.8, 'pop', 0.5); a(L(12) + 1.8, 'pop', 0.5); a(L(12) + 1.6, 'chime', 0.5);
sea(13); a(L(13) + 0.4, 'pop', 0.65); a(L(13) + 0.5, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
