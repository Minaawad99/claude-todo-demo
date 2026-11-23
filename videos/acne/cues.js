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
// chunk shots (their own page flip): line 3 → skin cut, 13 → back to the face, 20 → irritated skin, then the plate
const CH = (i, k) => L(i) + (T[i].end - L(i)) * k;
[[3, .4394], [13, .5968], [20, .2842], [20, .6421]].forEach(([i, k]) => rec(CH(i, k) - 0.08, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2));
// 0–1 · hook: spots pop on his face, the plates, then the soap and the plate crossed out
for (let k = 0; k < 10; k++) a(L(0) + 1.2 + k * 0.16, 'pop', 0.18);
paper(L(0) + 2.2); scribble(L(1) + 0.7); scribble(L(1) + 1.8);
// 3 · magnify into the skin, the labels
a(L(3) + 0.9, 'whoosh', 0.15); lab(3, CH(3, .4394) - L(3) + 0.3); lab(3, CH(3, .4394) - L(3) + 0.7); lab(3, CH(3, .4394) - L(3) + 1.2);
// 4 · oil drops flowing out
for (let k = 0; k < 4; k++) a(L(4) + 0.4 + k * 0.6, 'drip', 0.16);
// 5 · the question
a(L(5) + 0.15, 'pop', 0.35);
// 6 · hormones arrive, the gland swells
paper(L(6) + 0.2); a(L(6) + 0.9, 'fill', 0.18, 1.6); lab(6, 1.7);
// 7 · ten faces, the 8/10
for (let k = 0; k < 10; k++) a(L(7) + 0.3 + k * 0.12, 'tick', 0.15); ding(L(7) + 0.3); scribble(L(7) + 2.6);
// 8 · dead cells pile up, the plug drops in
for (let k = 0; k < 5; k++) a(L(8) + 0.4 + k * 0.3, 'tick', 0.12); a(L(8) + 2.3, 'thud', 0.3); lab(8, 2.6);
// 9 · the kitchen sink filling, the trap blocked
rec(L(9) + 0.3, 'water-rush', 0.25, 3, Math.min(3.5, D(9) - 0.3), 1.0, 'fill', 0.2); lab(9, 1.4);
// 10 · bacteria appear on the skin
for (let k = 0; k < 8; k++) a(L(10) + 0.3 + k * 0.14, 'pop', 0.12); lab(10, 0.6); paper(L(10) + 1.3);
// 11 · no air (✗), the count climbs to 320
scribble(L(11) + 0.9); for (let k = 0; k < 10; k++) a(L(11) + 0.9 + k * 0.26, 'tick', 0.13); ding(L(11) + 3.4);
// 12 · the army of white cells leaves the vessel
paper(L(12) + 0.2); a(L(12) + 0.6, 'whoosh', 0.18, 1.4); for (let k = 0; k < 6; k++) a(L(12) + 0.9 + k * 0.3, 'pop', 0.14);
// 13 · red and swollen, pus, then his face
a(L(13) + 0.3, 'fill', 0.2, 1.4); lab(13, 0.8); lab(13, 1.6); a(CH(13, .5968) + 0.5, 'pop', 0.3);
// 14–15 · the friend; the same bacteria on both
a(L(14) + 0.2, 'pop', 0.35); a(L(15) + 0.3, 'whoosh', 0.12); a(L(15) + 0.8, 'whoosh', 0.12); scribble(L(15) + 1.0); scribble(L(15) + 1.5); paper(L(15) + 1.6);
// 16 · genes, the gauges swing
paper(L(16) + 0.3); a(L(16) + 0.8, 'creak', 0.15, 1.2); a(L(16) + 2.4, 'thud', 0.25);
// 17 · dad's photo, down to you
paper(L(17) + 0.1); a(L(17) + 0.9, 'whoosh', 0.15); paper(L(17) + 1.6); ding(L(17) + 2.0);
// 18 · stress, sleep, the period: one pop each
a(L(18) + 0.9, 'pop', 0.35); a(L(18) + 1.9, 'pop', 0.35); a(L(18) + 3.0, 'pop', 0.35);
// 19 · soap and chocolate crossed out, «لأ»
scribble(L(19) + 2.2); scribble(L(19) + 2.6); a(L(19) + 2.9, 'thud', 0.3);
// 20 · foam on the skin, irritation, the plate
a(L(20) + 0.2, 'fizz', 0.2, 1.4); lab(20, 0.8); a(CH(20, .2842) + 0.5, 'sizzle', 0.1, 1.0); paper(CH(20, .6421) + 0.3);
// 21 · ✗ on the fingers, the squeeze, pus pushed deeper, a mark
scribble(L(21) + 0.7); a(L(21) + 0.4, 'creak', 0.2, 0.8); a(L(21) + 1.4, 'slosh', 0.2, 1.2); lab(21, 3.6);
// 22 · the recap: four panels
for (let k = 0; k < 4; k++) { a(L(22) + 0.2 + k * 1.3, 'pop', 0.3); lab(22, 0.4 + k * 1.3); }
// 23 · twins, 80% counts up
paper(L(23) + 0.3); for (let k = 0; k < 8; k++) a(L(23) + 1.2 + k * 0.2, 'tick', 0.13); ding(L(23) + 2.8);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
