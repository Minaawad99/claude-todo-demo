// «اسكتش» starter sound cues: copy to videos/<episode>/cues.js, fill in the per-line section, then
//   node cues.js && python3 ../audio/sfx.py voice.wav cues.json <scratchpad>/<episode>-mix.wav
// The kit (Pixabay clips the channel sent for «المد والجزر») is committed in videos/_templates/sketch/sfx/ and found from there;
// a one-off clip for one episode goes in <episode>/sfx/ (gitignored) and wins over the kit. The slices below are
// the clean parts measured with silencedetect. A missing clip falls back to its synthesized stand-in from audio/sfx.py.
//   swipe           «Paper Flipping» (koiroylers 351981)            one page flip 0.60–1.02 s   → every shot change
//   paper           «Paper Slide Short» (oxidvideos 478835)         0–0.5 s                     → a card or note laid down
//   pencil-scribble «Pencil on Paper Scribble 2» (68772)            0.75–1.5 s                  → ✗ and ✓ being written
//   ding            «Minimal Ding SFX» (virtual_vibes 383725)       0.1–1.5 s                   → a key number lands
//   clock-ticking   «Clock Ticking Down» (Dragon Studio 376897)     up to 8.6 s                 → time, clocks
//   space-drone     «Industrial Pulse Drone» (27456)                0.3–29.9 s, very low        → globes, space
//   ocean-waves     «Ocean Waves» (Dragon Studio 376898)            0.2–22 s                    → sea, beach
//   water-rush      «Above Rushing Water» (61158)                   from 3 s                    → water moving
//   wind-gust       «Wind Gust» (Dragon Studio 386158)              0.25–4.76 s                 → wind
// NO MUSIC: the user removed the background music for good (after «لو حد شرق قدامك»). Sound effects only; ask the user
// for any real recording a moment needs (Pixabay search terms) and put it in <episode>/sfx/px-<name>.mp3.
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
// a clip lives in the episode's sfx/ (gitignored, one-off sounds) or in the shared «اسكتش» kit (committed)
const KIT = '../_templates/sketch/sfx/', where = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3') ? 'sfx/px-' + n + '.mp3' : fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3') ? KIT + 'px-' + n + '.mp3' : null;
const has = n => !!where(n);
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
const rec = (t, file, gain, from, dur, duck, alt, altGain) => has(file)
  ? c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), file: where(file), gain: +gain.toFixed(2), from: from || 0 }, dur ? { dur: +dur.toFixed(2) } : {}, duck != null ? { duck } : {}))
  : alt && a(t, alt, altGain == null ? gain : altGain, dur);
// the kit as one-liners
const lab = (i, dt) => a(L(i) + dt, 'tick', 0.2);                                                      // a label draws in
const swipe = i => rec(L(i) - 0.08, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2);                      // shot change
const paper = t => rec(t, 'paper', 0.4, 0, 0.5, 1.0, 'paper', 0.3);
const scribble = t => rec(t, 'pencil-scribble', 0.45, 0.75, 0.7, 1.0, 'snip', 0.35);                  // ✗ / ✓
const ding = t => rec(t, 'ding', 0.3, 0.1, 1.4, 1.0, 'chime', 0.3);                                     // a number lands
const sea = (t, dur, g) => rec(t, 'ocean-waves', g || 0.35, 0.2, dur, 1.0, 'waves', 0.25);
const drone = (t, dur, from) => rec(t, 'space-drone', 0.12, from || 0.3, Math.min(29, dur), 1.2, 'hum', 0.1);

// ── fixed parts of every «اسكتش» episode (phase lines as build.py prints them) ──
const PROMISE = T.findIndex(l => l.text.includes('إيه الحكاية') && l.text.includes('هشرح'));
const SUMMARY = T.findIndex(l => l.text.startsWith('ودي كانت')), ASK = T.length - 1;
a(L(0) + 0.1, 'chime', 0.3);                                                                            // the hook card opens
a(L(PROMISE) + 0.15, 'ping', 0.3); for (let k = 0; k < 5; k++) a(L(PROMISE) + 0.4 + k * 0.32, 'tick', 0.14);   // bumper: the stopwatch
for (let i = PROMISE + 1; i < SUMMARY; i++) swipe(i);                                                   // one flip per shot change
a(L(SUMMARY) + 0.1, 'chime', 0.35); for (let k = 0; k < 5; k++) a(L(SUMMARY) + 0.3 + k * 0.15, 'tick', 0.16);   // summary card builds
paper(L(ASK) + 0.1); a(L(ASK) + 0.3, 'pop', 0.4);                                                       // ask box

// ── this episode: one or two sounds per line, matched to what moves (see videos/tides/cues.js) ──
// e.g. lab(5, 0.4); ding(L(6) + 1.6); scribble(L(9) + 1.2); sea(L(0), L(PROMISE) - L(0) + 0.6, 0.45);
const F = (i, k) => L(i) + D(i) * k;   // a point k of the way through line i (caption chunks are by length)
const water = (t, dur, g) => rec(t, 'water-rush', g || 0.12, 3, dur, 1.0, 'fill', 0.08);       // blood flowing in the vessel
// 0–2 · hook: food → sugar in the blood (pops as sugars appear), the curve draws, 13,000,000 lands
water(L(0) + 0.3, D(0) - 0.2, 0.1); for (let k = 0; k < 4; k++) a(L(0) + 0.6 + k * 0.6, 'pop', 0.18);
a(L(1) + 0.2, 'whoosh', 0.14, 1.4); rec(L(1) + 0.2, 'clock-ticking', 0.18, 0.1, D(1) - 0.2, 1.0, null);
a(L(2) + 0.3, 'whoosh', 0.14, 1.2); ding(L(2) + 1.6);
// 4 · the rule card pinned
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.4);
// 5 · sugar knocks at the closed door; the key arrives
water(L(5), D(5), 0.1); for (let k = 0; k < 4; k++) a(L(5) + 0.5 + k * 0.28, 'thud', 0.12); scribble(L(5) + 1.4); a(F(5, .5) + 0.3, 'clink', 0.2); lab(5, 0.4);
// 6 · the belly opens, the stomach lifts away, the pancreas is named
a(L(6) + 0.3, 'pop', 0.25); a(F(6, .45) + 0.2, 'whoosh', 0.2, 1.0); lab(6, D(6) * .45 + 0.9); ding(F(6, .45) + 1.0);
// 7 · sugar rises, keys stream out, the door opens, sugar falls in and burns
water(L(7), D(7), 0.12); a(L(7) + 0.3, 'whoosh', 0.12); for (let k = 0; k < 3; k++) a(F(7, .3) + k * 0.25, 'clink', 0.14);
a(F(7, .62), 'servo', 0.18); for (let k = 0; k < 3; k++) a(F(7, .62) + 1.0 + k * 0.3, 'drop', 0.15); a(F(7, .62) + 1.6, 'sizzle', 0.12, 1.2);
// 8 · the doorman: footsteps in, then he's gone and the door is crossed out
for (let k = 0; k < 6; k++) a(L(8) + 0.2 + k * 0.33, 'thud', 0.1); a(F(8, .45), 'creak', 0.12, 0.8); scribble(F(8, .45) + 0.6);
// 9 · the question
water(L(9), D(9), 0.14); a(L(9) + 0.2, 'pop', 0.4);
// 10 · type 1: immune cells hit the islet
for (let k = 0; k < 5; k++) a(F(10, .25) + k * 0.33, 'thud', 0.2); a(F(10, .7) + 0.3, 'whoosh', 0.12); scribble(F(10, .7) + 0.4);
// 11 · not food's fault: the arrow crossed, the heart
a(L(11) + 0.4, 'whoosh', 0.12); scribble(L(11) + 1.0); rec(F(11, .45), 'heartbeat', 0.22, 0, 1.6, 1.0, 'bump', 0.18);
// 12 · type 2: 90% counts up, the key arrives, the lock rusts and the key rattles
a(F(12, .2), 'tick', 0.15); ding(F(12, .2) + 1.0); a(F(12, .5), 'clink', 0.2); a(F(12, .72), 'creak', 0.14, 1.2);
for (let k = 0; k < 5; k++) a(F(12, .72) + 0.7 + k * 0.12, 'clank', 0.08);
// 13 · keys pile up, the pancreas pumps, then it tires
for (let k = 0; k < 8; k++) a(F(13, .45) + k * 0.25, 'clink', 0.1); a(F(13, .8), 'creak', 0.12, 1.0);
// 14 · the sofa, the TV, the soda: labels
a(L(14) + 0.3, 'fizz', 0.12, 1.2); lab(14, D(14) * .4); lab(14, D(14) * .62); lab(14, D(14) * .82); a(L(14) + 0.8, 'creak', 0.1, 1.2);
// 15 · walking
for (let k = 0; k < 8; k++) a(L(15) + 0.2 + k * 0.6, 'thud', 0.12); a(F(15, .6), 'pop', 0.35); scribble(F(15, .6) + 0.4);
// 16 · the muscle opens its own doors and pulls sugar in
water(L(16), D(16), 0.12); a(L(16) + 0.8, 'servo', 0.15); for (let k = 0; k < 4; k++) a(L(16) + 1.2 + k * 0.4, 'drop', 0.13); scribble(F(16, .7) + 0.3);
// 17 · the dial runs to 30 minutes, five days tick on
rec(L(17) + 0.2, 'clock-ticking', 0.22, 0.1, D(17) - 0.2, 1.0, null); ding(L(17) + 1.9); for (let k = 0; k < 5; k++) a(F(17, .5) + k * 0.44, 'pop', 0.22);
// 18 · the scale counts down, −7% lands
a(L(18) + 0.3, 'thud', 0.18); for (let k = 0; k < 6; k++) a(F(18, .45) + 0.2 + k * 0.27, 'tick', 0.14); ding(F(18, .45) + 1.9);
// 19 · the bars rise, the gap is measured, −58%
a(L(19) + 0.5, 'whoosh', 0.14, 0.8); a(L(19) + 0.9, 'whoosh', 0.14, 0.8); lab(19, D(19) * .6 + 0.6); ding(F(19, .6) + 0.8);
// 20 · what to avoid: a fizz, a crunch, a lighter; each crossed out
a(F(20, .2), 'fizz', 0.18, 1.0); scribble(F(20, .2) + 0.6); a(F(20, .5), 'pop', 0.25); scribble(F(20, .5) + 0.5); a(F(20, .8), 'spark', 0.12); scribble(F(20, .8) + 0.4);
// 21 · the spoon of sugar: no
a(L(21) + 0.4, 'pop', 0.2); scribble(F(21, .8)); a(F(21, .8) + 0.2, 'pop', 0.35);
// 22 · rice, bread, pasta → sugar; the amount
for (let k = 0; k < 3; k++) a(L(22) + 0.2 + k * 0.4, 'pop', 0.22); a(F(22, .35), 'whoosh', 0.14); for (let k = 0; k < 3; k++) a(F(22, .35) + 0.3 + k * 0.2, 'drop', 0.12); paper(F(22, .7));
// 23 · 62%, the glass, the toilet, the test meter counting
ding(L(23) + 0.7); rec(F(23, .42), 'pour', 0.25, 0, 1.4, 1.0, 'slosh', 0.15); a(F(23, .62), 'whoosh', 0.12); a(F(23, .8), 'beep', 0.18); a(F(23, .8) + 1.0, 'beep', 0.18);
// 24 · recap: key, rusty lock, the door opening
a(L(24) + 0.3, 'clink', 0.2); a(F(24, .5), 'creak', 0.12, 1.0); a(F(24, .75), 'servo', 0.18); lab(24, D(24) * .75 + 0.5);
// 25 · the blood jar fills, one spoon, the can, nine spoons
water(L(25) + 0.3, 1.2, 0.14); a(F(25, .3), 'clink', 0.2); a(F(25, .55), 'fizz', 0.15, 1.0); for (let k = 0; k < 9; k++) a(F(25, .55) + 0.3 + k * 0.15, 'tick', 0.15); ding(F(25, .55) + 1.8);
// 26 · the prayer: a calm heartbeat and a soft chime
rec(L(26), 'heartbeat', 0.2, 0, D(26), 1.0, 'bump', 0.15); a(L(26) + 0.3, 'chime', 0.22); a(F(26, .5), 'chime', 0.18);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
