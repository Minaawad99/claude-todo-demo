// Sound cues from the line timings: node cues.js → cues.json. Softer than the cartoon videos (the diagram style):
// paper swipes on the cuts, ticks for labels, a low hum for the tube. Recorded sounds in sfx/px-*.mp3 are Pixabay sound
// effects (Pixabay Content License) the channel sent for earlier episodes, kept out of git. No recorded sound plays in two
// shots in a row.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain: +(gain * 1.2).toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
const bed = (i, file, g, from) => rec(L(i), file, g, from, D(i) + 0.2, 1.2);
for (let i = 1; i < T.length; i++) (i % 2 ? rec(L(i) - 0.1, 'swipe', 0.22, 0, 0.6, 1.0) : a(L(i) - 0.08, 'whoosh', 0.22));
const lab = (i, dt) => a(L(i) + dt, 'tick', 0.22);
// 0: opening card
a(L(0) + 0.1, 'chime', 0.35); a(L(0) + 1.0, 'pop', 0.4);
lab(1, 0.7); a(L(1) + 0.6, 'ping', 0.25);
lab(2, 0.3); lab(2, 0.9); rec(L(2) + 0.4, 'electric-hum', 0.15, 3, D(2) - 0.4, 1.0); a(L(2) + 0.05, 'pop', 0.6);
rec(L(3) + 0.5, 'light-switch', 0.35, 0, 0.5, 1.0); lab(3, 0.4); lab(3, 2.1);
lab(4, 0.5); lab(4, 2.3); a(L(4) + 0.7, 'charge', 0.15);
bed(5, 'electric-hum', 0.15, 8); lab(5, 0.4); a(L(5) + 1.9, 'pop', 0.5);
a(L(6) + 0.4, 'sizzle', 0.2, 2.0); lab(6, 0.5); lab(6, 2.1);
lab(7, 0.5); a(L(7) + 0.4, 'clank', 0.2);
rec(L(8) + 0.4, 'power-buzz', 0.2, 2, D(8) - 0.4, 1.2); a(L(8) + 0.9, 'pop', 0.6);
a(L(9) + 0.2, 'zap', 0.3); a(L(9) + 0.3, 'laser', 0.2); lab(9, 1.7);
rec(L(10) + 0.3, 'electricity', 0.3, 0, 1.2, 1.0); a(L(10) + 0.3, 'thud', 0.3); lab(10, 0.6); lab(10, 2.1);
rec(L(11) + 0.3, 'sizzle', 0.25, 4, D(11) - 0.3, 1.2); a(L(11) + 1.1, 'pop', 0.4);
a(L(12) + 0.3, 'spin', 0.3, 2.2); a(L(12) + 2.4, 'motor', 0.2, 1.5); lab(12, 1.3);
bed(13, 'electric-hum', 0.15, 14); lab(13, 0.7);
lab(14, 0.4); lab(14, 1.3); a(L(14) + 1.2, 'drop', 0.3);
lab(15, 0.7); lab(15, 1.9); a(L(15) + 1.0, 'clink', 0.2);
lab(16, 0.4); lab(16, 1.7); rec(L(16) + 0.3, 'tap', 0.25, 0, 1.0, 1.0);
lab(17, 1.3); a(L(17) + 1.2, 'ping', 0.3);
lab(18, 1.5); a(L(18) + 1.0, 'snip', 0.35); a(L(18) + 1.1, 'pop', 0.4);
lab(19, 0.7); a(L(19) + 1.6, 'boom', 0.18); a(L(19) + 1.65, 'pop', 0.6);
lab(20, 0.9); rec(L(20) + 0.2, 'beep', 0.2, 0, 0.5, 1.0);
lab(21, 0.5); a(L(21) + 1.0, 'pop', 0.5); a(L(21) + 1.1, 'chime', 0.3);
rec(L(22), 'clock-ticking', 0.25, 0, D(22), 1.2); a(L(22) + 0.7, 'pop', 0.6); lab(22, 1.7);
lab(23, 1.1); rec(L(23) + 1.1, 'ding', 0.3, 0, 1.1, 1.0);
// 24: summary card
for (let k = 0; k < 6; k++) a(L(24) + 0.25 + k * 0.15, 'tick', 0.18); a(L(24) + 0.1, 'chime', 0.4); a(L(24) + 2.4, 'pop', 0.5);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
