// Sound cues for «سر المرساية الصغيرة», from the line timings: node cues.js → cues.json
// All synthesized (audio/sfx.py) over the music bed; no Pixabay clips are in this container.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
const sea = i => a(L(i), 'waves', 0.3, D(i));
// 0–3: the giant ship, the balance, the puzzled sailor, the anchor splashes in
sea(0); a(L(0) + 0.4, 'pop', 0.55); a(L(0) + 2.6, 'clank', 0.4); a(L(0) + 2.7, 'pop', 0.6);
a(L(1) + 0.3, 'creak', 0.4); a(L(1) + 1.0, 'thud', 0.5); a(L(1) + 1.8, 'ping', 0.5);
sea(2); a(L(2) + 0.3, 'pop', 0.45); a(L(2) + 1.2, 'pop', 0.4);
sea(3); for (let k = 0; k < 6; k++) a(L(3) + 0.05 + k * 0.16, 'clink', 0.3); a(L(3) + 1.15, 'splash', 0.6); a(L(3) + 0.4, 'chime', 0.4);
// 4–6: forces
sea(4); a(L(4) + 1.0, 'beep', 0.4); a(L(4) + 1.9, 'beep', 0.4);
sea(5); a(L(5), 'wind', 0.35, D(5)); a(L(5) + 0.5, 'pop', 0.45); a(L(5) + 1.3, 'pop', 0.45); a(L(5) + 2.0, 'pop', 0.45);
sea(6); a(L(6) + 0.1, 'thud', 0.5); a(L(6) + 1.6, 'pop', 0.5);
// 7–10: plough, flukes dig in, pull vs hold, flat vs up
a(L(7), 'wind', 0.2, D(7)); a(L(7) + 0.2, 'gear', 0.25, D(7) - 0.4); a(L(7) + 0.7, 'pop', 0.55);
a(L(8), 'slosh', 0.3, D(8)); a(L(8) + 0.4, 'creak', 0.4); a(L(8) + 1.0, 'squeeze', 0.35); a(L(8) + 0.8, 'pop', 0.45); a(L(8) + 1.8, 'pop', 0.45);
a(L(9), 'slosh', 0.25, D(9)); a(L(9) + 0.2, 'servo', 0.3, D(9) - 0.5); a(L(9) + 1.2, 'pop', 0.5);
a(L(10) + 0.5, 'ping', 0.45); a(L(10) + 1.2, 'creak', 0.35); a(L(10) + 1.9, 'drop', 0.4); a(L(10) + 2.2, 'beep', 0.45);
// 11–14: the chain
a(L(11), 'spin', 0.3, D(11)); for (let k = 0; k < 8; k++) a(L(11) + k * 0.1, 'clink', 0.28); a(L(11) + 0.3, 'chime', 0.5);
for (let k = 0; k < 14; k++) a(L(12) + 0.3 + k * 0.12, 'clink', 0.22); a(L(12) + 1.8, 'thud', 0.5); a(L(12) + 1.9, 'pop', 0.5);
sea(13); for (let k = 0; k < 16; k++) a(L(13) + 0.2 + k * 0.13, 'clink', 0.2); a(L(13) + 1.8, 'tick', 0.3);
sea(14); a(L(14) + 0.4, 'tick', 0.3); a(L(14) + 1.0, 'pop', 0.5); a(L(14) + 1.8, 'beep', 0.4); a(L(14) + 1.9, 'pop', 0.4);
// 15–18: the curve, flat pull, friction, spring
sea(15); a(L(15) + 0.6, 'pop', 0.5); a(L(15) + 2.0, 'pop', 0.5); a(L(15) + 0.6, 'hum', 0.15, 1.4);
sea(16); a(L(16) + 0.6, 'servo', 0.25, 0.8); a(L(16) + 1.8, 'ping', 0.45);
sea(17); a(L(17) + 0.2, 'squeeze', 0.3); a(L(17) + 1.0, 'squeeze', 0.3); a(L(17) + 0.6, 'pop', 0.45); a(L(17) + 1.6, 'pop', 0.45);
a(L(18), 'waves', 0.45, D(18)); for (let k = 0; k < 3; k++) { a(L(18) + 0.7 + k * 1.43, 'creak', 0.35); a(L(18) + 0.9 + k * 1.43, 'clank', 0.3); } a(L(18) + 1.6, 'pop', 0.45);
// 19–20: heaving up, the anchor breaks out
sea(19); a(L(19), 'motor', 0.35, D(19)); for (let k = 0; k < 20; k++) a(L(19) + 0.2 + k * 0.18, 'clink', 0.18); a(L(19) + 2.2, 'pop', 0.5);
sea(20); a(L(20) + 0.5, 'squeeze', 0.35); a(L(20) + 0.9, 'slosh', 0.4, 1.2); a(L(20) + 1.6, 'pop', 0.55); a(L(20) + 1.7, 'chime', 0.4);
// 21–22: storm, dragging, the broken pipeline
a(L(21), 'wind', 0.5, D(21)); a(L(21), 'waves', 0.55, D(21)); a(L(21) + 0.3, 'creak', 0.4); a(L(21) + 1.2, 'pop', 0.5); a(L(21) + 1.0, 'boom', 0.35);
a(L(22), 'wind', 0.35, D(22)); a(L(22), 'waves', 0.4, D(22)); a(L(22) + 0.4, 'pop', 0.5); a(L(22) + 3.8, 'clank', 0.6); a(L(22) + 3.9, 'fizz', 0.45, 1.6); a(L(22) + 2.6, 'pop', 0.5);
// 23–24: payoff + outro
sea(23); a(L(23) + 0.5, 'pop', 0.5); a(L(23) + 1.2, 'pop', 0.5); a(L(23) + 2.6, 'chime', 0.5);
sea(24); a(L(24) + 0.4, 'pop', 0.65); a(L(24) + 0.5, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
