// Sound cues for «سر المرساية الصغيرة» (1:35 version, 21 lines), from the line timings: node cues.js → cues.json
// Synthesized effects (audio/sfx.py) plus the clips the user sent in sfx/px-*.mp3 (Pixabay / Freesound community, kept out of git):
// anchor-chain (chain running out), anchor-raising (windlass heaving in), splash, underwater (deep-sea ambience),
// storm-sea, chains-drag (heavy chain dragged).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const sea = i => a(L(i), 'waves', 0.3, D(i));
const uw = (i, from) => rec(L(i), 'underwater', 0.13, from, D(i) + 0.15, 1.2);   // under-water shots
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0–3: the giant ship, the balance, the puzzled sailor, the anchor drops in
uw(0, 10); a(L(0) + 0.4, 'pop', 0.55); a(L(0) + 2.8, 'clank', 0.4); a(L(0) + 2.9, 'pop', 0.6);
a(L(1) + 0.3, 'creak', 0.4); a(L(1) + 1.0, 'thud', 0.5); a(L(1) + 1.6, 'ping', 0.5); for (let k = 0; k < 8; k++) a(L(1) + 1.1 + k * 0.16, 'tick', 0.25);
sea(2); a(L(2) + 0.5, 'pop', 0.4); a(L(2) + 1.3, 'pop', 0.35);
sea(3); rec(L(3), 'anchor-chain', 0.7, 0, 1.9, 1.0); rec(L(3) + 0.85, 'splash', 0.8, 0, 2.4, 1.0); a(L(3) + 0.4, 'chime', 0.4);
// 4: not lifting; wind and current
uw(4, 40); a(L(4) + 0.8, 'beep', 0.4); a(L(4), 'wind', 0.25, D(4)); a(L(4) + 1.5, 'pop', 0.45); a(L(4) + 2.0, 'pop', 0.45);
// 5: plough, then the flukes dig in
a(L(5), 'gear', 0.22, D(5) * 0.38); a(L(5) + 0.4, 'pop', 0.55); rec(L(5) + D(5) * 0.38, 'underwater', 0.13, 70, D(5) * 0.62 + 0.15, 1.2);
a(L(5) + D(5) * 0.38 + 0.3, 'creak', 0.4); a(L(5) + D(5) * 0.38 + 0.6, 'squeeze', 0.35); a(L(5) + D(5) * 0.38 + 0.6, 'pop', 0.45); a(L(5) + D(5) * 0.38 + 1.4, 'pop', 0.45);
// 6: pull vs hold, then flat vs up
uw(6, 100); a(L(6) + 0.2, 'servo', 0.3, D(6) * 0.45); a(L(6) + 0.8, 'pop', 0.5); a(L(6) + D(6) * 0.5 + 0.2, 'ping', 0.45); a(L(6) + D(6) * 0.5 + 0.9, 'creak', 0.35); a(L(6) + D(6) * 0.5 + 1.6, 'beep', 0.45);
// 7: the chain on the quay
rec(L(7) + 0.1, 'anchor-chain', 0.5, 4, 2.4, 1.0); a(L(7) + 0.2, 'chime', 0.45); a(L(7) + 2.4, 'thud', 0.5); a(L(7) + 2.5, 'pop', 0.5);
// 8: the stud; a studless chain kinks
for (let k = 0; k < 6; k++) a(L(8) + 0.2 + k * 0.3, 'clink', 0.3); a(L(8) + 0.8, 'pop', 0.5); a(L(8) + 1.2, 'ping', 0.45); a(L(8) + 2.2, 'creak', 0.4); a(L(8) + 2.4, 'beep', 0.4);
// 9: link pulls link pulls link
uw(9, 130); rec(L(9) + 0.2, 'chains-drag', 0.35, 0, Math.min(4, D(9) - 0.3), 1.0); for (let k = 0; k < 3; k++) a(L(9) + 0.6 + k * 0.9, 'clank', 0.4); a(L(9) + D(9) * 0.8, 'pop', 0.5);
// 10–14: the heavy curve, the flat pull, friction, the spring, the scope
uw(10, 160); a(L(10) + 0.8, 'pop', 0.5); a(L(10) + 0.4, 'hum', 0.15, 1.4); a(L(10) + D(10) * 0.62, 'pop', 0.5);
uw(11, 190); a(L(11) + 0.3, 'servo', 0.25, 0.8); a(L(11) + 0.6, 'pop', 0.45); a(L(11) + 1.4, 'ping', 0.45);
uw(12, 220); a(L(12) + 0.2, 'squeeze', 0.3); a(L(12) + 1.0, 'squeeze', 0.3); a(L(12) + 0.6, 'pop', 0.45); a(L(12) + 1.6, 'pop', 0.45);
a(L(13), 'waves', 0.45, D(13)); for (let k = 0; k < 3; k++) { a(L(13) + 0.7 + k * 1.43, 'creak', 0.35); a(L(13) + 0.9 + k * 1.43, 'clank', 0.3); } a(L(13) + 1.6, 'pop', 0.45);
uw(14, 250); a(L(14) + 0.4, 'tick', 0.3); a(L(14) + 1.6, 'servo', 0.25, 1.0); a(L(14) + 2.6, 'pop', 0.5);
// 15–16: the windlass heaves in link by link, the anchor breaks out
rec(L(15), 'anchor-raising', 0.38, 0.7, D(15) + 0.1, 1.0); a(L(15) + 0.9, 'pop', 0.5); a(L(15) + 2.2, 'pop', 0.5);
uw(16, 280); rec(L(16), 'anchor-raising', 0.35, 8, D(16) * 0.6, 1.0); a(L(16) + D(16) * 0.5, 'pop', 0.5); a(L(16) + D(16) * 0.6, 'squeeze', 0.35); a(L(16) + D(16) * 0.75, 'pop', 0.55); a(L(16) + D(16) * 0.78, 'chime', 0.4);
// 17–18: storm, dragging, the broken pipeline
rec(L(17), 'storm-sea', 0.28, 20, D(17) + 0.15, 1.2); rec(L(17) + 0.8, 'chains-drag', 0.42, 0, 3.4, 1.0); a(L(17) + 1.2, 'pop', 0.5);
rec(L(18), 'storm-sea', 0.22, 40, D(18) + 0.15, 1.2); rec(L(18) + 0.4, 'chains-drag', 0.45, 0.5, Math.min(3.6, D(18) * 0.65), 1.0); a(L(18) + 0.4, 'pop', 0.5); a(L(18) + D(18) * 0.68, 'clank', 0.6); a(L(18) + D(18) * 0.7, 'fizz', 0.45, 1.6); a(L(18) + 3.2, 'pop', 0.5);
// 19–20: payoff + outro
uw(19, 320); a(L(19) + 0.8, 'pop', 0.5); a(L(19) + 1.8, 'pop', 0.5); a(L(19) + 1.6, 'chime', 0.5);
sea(20); a(L(20) + 0.4, 'pop', 0.65); a(L(20) + 0.5, 'notify', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: true, cues: c }, null, 1)); console.log(c.length, 'cues');
