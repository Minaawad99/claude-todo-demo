// «The Cairo Ring Road fire» (US twin of ../warraq-fire) — sound cues, sound effects only, no music. Same moments as the Arabic cues.
//   node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/warraq-fire-mix.wav
// Kit clips from videos/_templates/sketch/sfx/ (see its SOURCES.md); the rest is synthesized in audio/sfx.py
// (fire, siren and traffic were added there for this episode). The story part is kept quiet and low: road, crash, fire.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0]);   // window.CHUNKS: where each caption chunk starts in its line
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, c = [];
const CK = (i, k) => L(i) + (T[i].end - L(i)) * (window.CHUNKS[i][k] || 0);   // the start of caption chunk k of line i
const KIT = '../_templates/sketch/sfx/', where = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3') ? 'sfx/px-' + n + '.mp3' : fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3') ? KIT + 'px-' + n + '.mp3' : null;
const has = n => !!where(n);
const a = (t, fx, gain, dur, ex) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}, ex || {}));
const rec = (t, file, gain, from, dur, duck, alt, altGain) => has(file)
  ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: where(file), gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}))
  : alt && a(t, alt, altGain == null ? gain : altGain, dur);
const swipe = t => rec(t - 0.08, 'swipe', 0.22, 0.6, 0.42, 1.0, 'whoosh', 0.15);
const paper = t => rec(t, 'paper', 0.35, 0, 0.5, 1.0, 'paper', 0.3);
const scribble = t => rec(t, 'pencil-scribble', 0.4, 0.75, 0.7, 1.0, 'snip', 0.35);
const ding = t => rec(t, 'ding', 0.25, 0.1, 1.4, 1.0, 'chime', 0.25);
const tick = (t, dur) => rec(t, 'clock-ticking', 0.35, 0, dur, 1.0, 'tick', 0.2);

// ── part 1 · the night road, the crash, the fire ──
a(0, 'traffic', 0.5, L(3) + 0.4, { duck: 0.4 });                         // the Ring Road at night, from the first word to the crash
for (let i = 2; i < 24; i++) swipe(L(i));                                 // a soft flip on each new line
a(CK(2, 2), 'squeeze', 0.3, 1.2);                                         // the tanker sways: strain
a(CK(3, 0) + 1.05, 'clank', 0.7); a(CK(3, 0) + 1.1, 'thud', 0.8);       // into the barrier
a(CK(3, 1) + 0.55, 'thud', 0.9); a(CK(3, 1) + 0.6, 'clank', 0.5);       // it rolls over
a(CK(4, 0) + 0.1, 'slosh', 0.45, 1.6); a(CK(4, 0) + 0.3, 'drip', 0.3);   // the fuel spills
tick(CK(4, 1), CK(4, 2) - CK(4, 1));                                      // under half a minute
a(CK(4, 2) + 0.05, 'boom', 0.45);                                         // it catches: a whoomph, not an explosion
a(CK(4, 2) + 0.1, 'fire', 0.5, L(7) - CK(4, 2), { duck: 0.5 });          // the fire burns under lines 4–6
ding(CK(5, 2) + 0.9);                                                      // «أكتر من 20»
a(CK(7, 2), 'siren', 0.22, L(8) - CK(7, 2) + 0.3, { duck: 0.6 });         // an ambulance far off

// ── part 2 · why it spread ──
scribble(CK(9, 1) + 0.3); scribble(CK(9, 2) + 1.4);
a(CK(9, 2), 'steam', 0.2, 1.4);                                           // the vapour rising
a(CK(10, 1) + 0.1, 'creak', 0.25, 1.0);                                   // the balance tips
a(CK(10, 2), 'steam', 0.18, 2.6);                                          // the vapour creeping
a(CK(11, 0) + 0.7, 'spark', 0.5); a(CK(11, 1) + 0.1, 'spark', 0.4); a(CK(11, 2) + 0.1, 'spark', 0.45);
a(CK(11, 3) + 0.05, 'boom', 0.4); a(CK(11, 3) + 0.15, 'fire', 0.4, L(12) - CK(11, 3) + 0.3, { duck: 0.5 });

// ── part 3 · what to do ──
rec(CK(13, 1), 'wind-gust', 0.35, 0.25, 3.2, 1.0, 'wind', 0.2);         // the wind
a(CK(13, 3), 'fire', 0.35, L(14) - CK(13, 3), { duck: 0.5 });             // the tanker burning
a(CK(14, 0) + 0.3, 'beep', 0.18);                                         // dialling
ding(CK(14, 1) + 0.3); ding(CK(14, 2) + 0.3); a(CK(14, 3) + 0.1, 'pop', 0.35);
a(L(15), 'fire', 0.25, CK(15, 4) - L(15) + 1.2, { duck: 0.6 });           // the burning clothes
paper(CK(15, 2)); paper(CK(15, 3)); a(CK(15, 4) + 0.2, 'thud', 0.35); a(CK(15, 4) + 0.9, 'thud', 0.3);   // stand · lie · roll
paper(CK(16, 0) + 0.2); scribble(CK(16, 2) + 0.8);                         // the blanket; no oxygen ✗
rec(CK(17, 1), 'water-rush', 0.3, 3, L(18) - CK(17, 1), 1.0, 'fill', 0.25);   // the tap running
tick(CK(17, 2), L(18) - CK(17, 2));
scribble(CK(18, 3) + 0.1); scribble(CK(18, 3) + 0.4);                      // toothpaste ✗ ice ✗
scribble(L(19) + 0.8); paper(CK(19, 2)); scribble(CK(19, 2) + 0.9); a(CK(19, 3), 'siren', 0.25, L(20) - CK(19, 3), { duck: 0.6 });
a(L(20), 'wind', 0.15, L(21) - L(20));                                     // smoke filling the room
a(CK(21, 3) + 0.2, 'notify', 0.35); scribble(CK(21, 3) + 0.4);
scribble(L(22) + 0.5); a(CK(22, 2), 'siren', 0.28, L(23) - CK(22, 2), { duck: 0.6 }); scribble(CK(22, 3) + 1.4);
a(CK(23, 1), 'pop', 0.35); a(CK(23, 1) + 0.6, 'pop', 0.35); a(CK(23, 2), 'pop', 0.35); a(CK(23, 2) + 0.6, 'pop', 0.35);
// the end card: one soft bell, then quiet for the prayer
a(L(24) + 0.1, 'bell', 0.2, null, { f: 440 }); paper(L(24) + 0.2);

fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues');
