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
//   music-soft      «Mysterious Music Box – The Midnight Hour»      the series' music (the user's pick): make it with
//                   ffmpeg -i px-music-box.mp3 -af "highshelf=f=3000:g=-5,volume='if(lt(t,12),0.6+0.4*t/12,1)':eval=frame" px-music-soft.mp3
//                   and keep gain 0.42 (≈22 dB under the narrator while he speaks; the user approved this level)
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
const CH = (i, j) => { global.window.CHUNKS = global.window.CHUNKS || JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (.*);/)[1]); const c = window.CHUNKS[i][j] || 0; return L(i) + (T[i].end - T[i].start) * (typeof c === 'object' ? c.f : c); };
// 0–2 · hook: the scale counts down, the belly fat shrinks, arrows out, a question
for (let k = 0; k < 5; k++) a(L(0) + 0.2 + k * 0.25, 'tick', 0.14); ding(L(0) + 1.4);
a(L(1) + 0.3, 'whoosh', 0.18, 1.2); for (let k = 0; k < 3; k++) a(L(1) + 0.4 + k * 0.2, 'pop', 0.22);
a(L(2) + 0.1, 'pop', 0.35);
// 4 · fat tissue, then into one cell
lab(4, 0.5); a(CH(4, 1), 'whoosh', 0.15); lab(4, CH(4, 1) - L(4) + 0.5); lab(4, CH(4, 1) - L(4) + 1.1);
// 5 · the molecule: head and three chains
a(L(5) + 0.3, 'pop', 0.3); lab(5, CH(5, 1) - L(5) + 0.3); lab(5, CH(5, 2) - L(5) + 0.2);
// 6 · the balance tips toward spending
a(L(6) + 0.4, 'tick', 0.2); a(CH(6, 1) + 0.2, 'creak', 0.15, 1.0); a(CH(6, 1) + 1.0, 'thud', 0.25);
// 7 · the hormone gauges, the signal
a(L(7) + 0.3, 'whoosh', 0.12, 1.0); a(L(7) + 1.2, 'whoosh', 0.12, 1.0); a(CH(7, 2) + 0.2, 'zap', 0.18); paper(CH(7, 2) + 0.4);
// 8 · the enzymes cut, the chains go into the blood
for (let k = 0; k < 3; k++) a(L(8) + 0.6 + k * 0.35, 'snip', 0.3); lab(8, 0.4); rec(CH(8, 1), 'water-rush', 0.18, 3, 2.2, 1.0, 'slosh', 0.18);
// 9 · the note breaks into change
paper(L(9) + 0.2); for (let k = 0; k < 7; k++) a(L(9) + 0.9 + k * 0.12, 'clink', 0.14);
// 10 · blood to the muscles and the liver
rec(L(10), 'water-rush', 0.16, 5, D(10), 1.0, 'slosh', 0.15); lab(10, 0.3); lab(10, 0.8); lab(10, 1.4);
// 11 · into the muscle cell: the mitochondria
a(L(11) + 0.1, 'whoosh', 0.15); lab(11, CH(11, 1) - L(11) + 0.1); a(CH(11, 1) + 0.5, 'zap', 0.15);
// 12 · the chain is chopped, oxygen comes in, it burns
for (let k = 0; k < 6; k++) a(L(12) + 0.5 + k * 0.4, 'snip', 0.18); lab(12, CH(12, 1) - L(12)); a(CH(12, 1) + 0.2, 'whoosh', 0.12, 1.4);
// 13 · the stove: fire, warmth, smoke
rec(L(13), 'wind-gust', 0.12, 0.25, 3.0, 1.0, 'wind', 0.1); a(L(13) + 0.2, 'sizzle', 0.12, 2.6); lab(13, 0.4); paper(CH(13, 1)); lab(13, CH(13, 2) - L(13) + 0.2);
// 14 · energy, then CO2 and water
a(L(14) + 0.3, 'zap', 0.22); for (let k = 0; k < 3; k++) a(CH(14, 2) + k * 0.15, 'pop', 0.2); for (let k = 0; k < 3; k++) a(CH(14, 3) + k * 0.15, 'drip', 0.22);
// 15 · to the lungs, out with the breath
lab(15, CH(15, 1) - L(15)); rec(CH(15, 2), 'wind-gust', 0.22, 0.25, 1.6, 1.0, 'wind', 0.2);
// 16 · urine, sweat, breath
a(CH(16, 0) + 0.8, 'drip', 0.3); a(CH(16, 0) + 1.4, 'drip', 0.25); rec(CH(16, 0) + 2.0, 'wind-gust', 0.15, 0.25, 1.2, 1.0, 'wind', 0.15);
// 17–18 · 10 kg split: 8.5 breath, 1.5 water
rec(L(17) + 0.4, 'wind-gust', 0.15, 0.25, 2.2, 1.0, 'wind', 0.15); for (let k = 0; k < 6; k++) a(L(17) + 0.5 + k * 0.3, 'tick', 0.13); ding(L(17) + 2.7);
a(L(18) + 0.3, 'drip', 0.3); paper(L(18) + 0.4);
// 19 · the myth: two crosses
a(L(19) + 0.4, 'whoosh', 0.12); a(CH(19, 1), 'whoosh', 0.12); scribble(CH(19, 2)); scribble(CH(19, 2) + 0.3);
// 20 · muscle ≠ fat; sweat cools
lab(20, 0.3); lab(20, 0.5); for (let k = 0; k < 3; k++) a(CH(20, 1) + 0.2 + k * 0.4, 'drip', 0.2);
// 21 · the cell empties like a balloon
paper(L(21) + 0.5); a(CH(21, 1) + 0.1, 'steam', 0.14, 1.6); a(CH(21, 1) + 0.6, 'pop', 0.25);
// 22 · it fills back up
a(L(22) + 0.4, 'whoosh', 0.12); a(CH(22, 1) + 0.1, 'fill', 0.15, 1.4);
// 23 · the recap, one station per chunk
for (let j = 0; j < 4; j++) a(CH(23, j) + 0.12, 'pop', 0.32);
// 24 · breathing in 29 kg of oxygen
paper(L(24) + 0.3); rec(CH(24, 1), 'wind-gust', 0.16, 0.25, 2.0, 1.0, 'wind', 0.15); for (let k = 0; k < 5; k++) a(CH(24, 1) + 0.2 + k * 0.3, 'tick', 0.13); ding(CH(24, 1) + 1.8);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
