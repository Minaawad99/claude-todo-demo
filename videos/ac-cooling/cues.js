// Sound cues from the line timings: node cues.js → cues.json. The diagram style: soft whooshes on the cuts, ticks on
// labels, then one effect per beat (the fan, the compressor hum, boiling, the spray, drips). All synthesized (audio/sfx.py).
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const lab = (i, dt) => a(L(i) + dt, 'tick', 0.22);
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, i % 2 ? 'wipe' : 'whoosh', 0.2);
// 0 opening card: the two units, the readings counting
a(L(0) + 0.1, 'chime', 0.3); a(L(0) + 0.2, 'wind', 0.12, D(0) - 0.4); a(L(0) + 1.8, 'pop', 0.4);
a(L(1) + 0.3, 'wind', 0.16, D(1) - 0.3); a(L(1) + 0.9, 'pop', 0.4);                       // cold air pouring out
a(L(2) + 0.1, 'rotor', 0.18, D(2) - 0.1); a(L(2) + 1.1, 'pop', 0.4);                      // the outdoor fan
lab(3, 0.4); lab(3, 0.8); a(L(3) + 1.3, 'ping', 0.3);
a(L(4) + 0.7, 'snip', 0.35); a(L(4) + 1.9, 'whoosh', 0.18); lab(4, 2.1);
a(L(5) + 0.4, 'drip', 0.3); a(L(5) + 1.2, 'drip', 0.25); lab(5, 1.5);
a(L(6) + 0.3, 'steam', 0.14, D(6) - 0.4); lab(6, 0.5); lab(6, 1.3);
a(L(7) + 0.5, 'clink', 0.25); a(L(7) + 0.7, 'pop', 0.4); lab(7, 1.1);
a(L(8) + 0.4, 'fizz', 0.22, D(8) - 0.4); lab(8, 0.7);                                      // boiling
a(L(9) + 0.2, 'fizz', 0.26, D(9) - 0.3); a(L(9) + 1.5, 'thud', 0.3); a(L(9) + 1.55, 'pop', 0.5);
a(L(10) + 0.3, 'servo', 0.22); lab(10, 1.2); lab(10, 1.7); lab(10, 2.4);                   // the cover lifts
a(L(11) + 0.2, 'rotor', 0.14, D(11) - 0.2); lab(11, 0.4); lab(11, 1.3);
a(L(12) + 0.1, 'fizz', 0.18, D(12) - 0.2); lab(12, 1.3);
a(L(13) + 0.1, 'slosh', 0.2); a(L(13) + 1.4, 'hum', 0.18, D(13) - 1.4); lab(13, 1.7);
a(L(14) + 0.1, 'motor', 0.22, D(14) - 0.2); a(L(14) + 0.6, 'squeeze', 0.3); a(L(14) + D(14) - 0.4, 'pop', 0.4);   // the compressor
a(L(15) + 0.3, 'hum', 0.12, D(15) - 0.3); a(L(15) + 1.3, 'pop', 0.45);
a(L(16) + 0.2, 'rotor', 0.2, D(16) - 0.2); a(L(16) + 0.4, 'wind', 0.14, D(16) - 0.6); lab(16, 0.9);
a(L(17) + 0.4, 'drip', 0.3); lab(17, 0.5);
a(L(18) + 0.4, 'squeeze', 0.25); lab(18, 0.5); lab(18, 1.7);
a(L(19) + 0.2, 'spray', 0.3, 1.6); a(L(19) + 1.3, 'pop', 0.35);                           // the spray can
a(L(20) + 0.1, 'hum', 0.12, D(20) - 0.2); for (let k = 0; k < 4; k++) a(L(20) + 0.25 + k * 0.2, 'tick', 0.2); a(L(20) + 1.1, 'spin', 0.25, 1.4);
a(L(21) + 0.8, 'clank', 0.15); a(L(21) + 2.0, 'boom', 0.16); a(L(21) + 2.05, 'pop', 0.5); // ✗
a(L(22) + 0.3, 'clink', 0.3); a(L(22) + 1.9, 'fizz', 0.22, 1.2); lab(22, 2.1);              // lock, then a leak
a(L(23) + 1.5, 'clink', 0.2);
a(L(24) + 0.2, 'gear', 0.2, 1.6); a(L(24) + 0.6, 'paper', 0.25); a(L(24) + 1.7, 'thud', 0.3); a(L(24) + 1.75, 'pop', 0.45);
// 25 summary card, 26 the CTA box
for (let k = 0; k < 4; k++) a(L(25) + 0.25 + k * 0.15, 'tick', 0.18); a(L(25) + 0.1, 'chime', 0.35);
a(L(26) + 0.1, 'pop', 0.45); a(L(26) + 0.5, 'chime', 0.35);
// recorded sounds (Pixabay, sent by the channel for this episode; sfx/px-*.mp3, gitignored). Levels are relative to the
// narrator (audio/sfx.py); duck 1.2 tucks the beds under the voice.
const rec = (t, file, gain, from, dur, duck) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: 'sfx/px-' + file + '.mp3', gain, from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}));
rec(L(0) + 0.1, 'ac-remote', 0.5, 0.5, 1.4, 0.5); rec(L(0) + 0.8, 'ac-indoor', 0.22, 5, D(0) - 0.8, 1.2);
rec(L(1), 'ac-indoor', 0.32, 12, D(1), 1.2); rec(L(2), 'ac-unit', 0.38, 10, D(2), 1.2);
rec(L(5) + 0.35, 'perfume-spray', 0.6, 0.3, 0.9, 0.6);
rec(L(8) + 0.3, 'boiling', 0.35, 1, D(8) - 0.3, 1.2); rec(L(9), 'boiling', 0.45, 6, D(9), 1.2);
rec(L(11), 'ac-indoor', 0.25, 25, D(11), 1.2); rec(L(12), 'boiling', 0.2, 10, D(12), 1.2);
rec(L(13) + 1.4, 'compressor', 0.25, 0, D(13) - 1.4, 1.2); rec(L(14), 'compressor', 0.4, 2, D(14), 1.2);
rec(L(16), 'ac-unit', 0.4, 40, D(16), 1.2);
rec(L(19) + 0.2, 'spray-can', 0.6, 0, 2.9, 0.6);
rec(L(22) + 1.9, 'hiss', 0.5, 0.6, Math.min(1.8, D(22) - 1.9), 0.8);
rec(L(23), 'water-drip', 0.6, 2, D(23), 0.8); rec(L(24), 'printing-press', 0.35, 0, D(24), 1.2);
// the long synthesized beds (wind, rotor, hum, motor, fizz, steam, spray) sounded like hiss under the voice: left out; the recordings above
// play those parts instead
const LONG = new Set(['wind', 'rotor', 'hum', 'motor', 'fizz', 'steam', 'spray']);
const keep = c.filter(q => q.file || !LONG.has(q.fx));
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: keep }, null, 1));
console.log(keep.length + ' cues (' + (c.length - keep.length) + ' long beds left out)');
