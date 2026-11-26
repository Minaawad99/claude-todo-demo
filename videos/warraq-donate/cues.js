// «اتبرع لمصابي حريق الوراق» — sound cues, sound effects only (no music), soft and few: this is an appeal, not an explainer.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0]);
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const CK = (i, k) => L(i) + (T[i].end - L(i)) * (window.CHUNKS[i][k] || 0);
const KIT = '../_templates/sketch/sfx/', where = n => fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3') ? KIT + 'px-' + n + '.mp3' : null;
const a = (t, fx, gain, dur, ex) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, ex || {}));
const rec = (t, file, gain, from, dur, alt, altGain) => where(file) ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: where(file), gain, from: from || 0 }, dur ? { dur } : {})) : a(t, alt, altGain == null ? gain : altGain, dur);
const swipe = t => rec(t - 0.08, 'swipe', 0.18, 0.6, 0.42, 'whoosh', 0.12);
const paper = t => rec(t, 'paper', 0.3, 0, 0.5, 'paper', 0.25);
const scribble = t => rec(t, 'pencil-scribble', 0.35, 0.75, 0.7, 'snip', 0.3);
const ding = t => rec(t, 'ding', 0.22, 0.1, 1.4, 'chime', 0.2);
a(0, 'fire', 0.18, L(1), { duck: 0.5 });                          // yesterday: the fire on the phone, low
a(L(1) + 0.2, 'bell', 0.22, null, { f: 523 });                     // «بس النهارده»: one warm note
for (let i = 2; i < 18; i++) swipe(L(i));
a(L(2), 'beep', 0.12); a(L(2) + 1.2, 'beep', 0.1);                  // the ICU monitor
for (let k = 0; k < 4; k++) paper(L(3) + 0.3 + k * 0.6);           // calendar pages
scribble(CK(5, 1) + 1.2);                                          // ✓ the skin protects
a(L(6), 'hum', 0.1, CK(6, 1) - L(6));                              // clean-room air
paper(CK(6, 1) + 0.2);                                             // the gauze
for (let k = 0; k < 6; k++) a(L(7) + 0.2 + k * 0.35, 'clink', 0.18, null, { f: 1500 + k * 80 });   // coins
a(L(9) + 0.2, 'siren', 0.15, 2.2, { duck: 0.6 });                  // the ambulance pulls up
scribble(CK(9, 2) + 0.5);
ding(L(10) + 0.2); ding(CK(10, 1) + 0.2); ding(CK(10, 2) + 0.2);   // the three ways
a(CK(11, 1) + 0.5, 'chime', 0.2);                                   // «ببلاش»
a(L(12) + 0.3, 'notify', 0.25); a(CK(12, 1) + 0.6, 'thud', 0.18); a(CK(12, 1) + 0.9, 'thud', 0.15);   // the call; a knock at the door
for (let k = 0; k < 5; k++) a(L(13) + 0.3 + k * 0.45, 'clink', 0.2, null, { f: 1700 });   // a coin into the jar
scribble(L(15) + 0.6); scribble(CK(15, 2) + 0.3);
scribble(L(16) + 0.6); scribble(L(16) + 1.4);
a(L(17) + 0.3, 'pop', 0.25); a(L(17) + 1.3, 'pop', 0.25);
a(L(18) + 0.1, 'bell', 0.2, null, { f: 440 }); paper(L(18) + 0.2);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
