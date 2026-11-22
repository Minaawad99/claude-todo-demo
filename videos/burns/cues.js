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
const tap = (t, dur, g) => rec(t, 'water-rush', g || 0.3, 3, dur, 1.0, 'fill', 0.25);
// 0–2 · hook: the pot tips, boiling water hisses on the arm; the 20-minute clock starts, the skin lens; the three step chips
a(L(0) + 0.6, 'splash', 0.3); a(L(0) + 0.9, 'sizzle', 0.35, 1.8); a(L(0) + 1.2, 'steam', 0.2, 1.6);
a(L(1) + 0.1, 'pop', 0.3); rec(L(1) + 0.6, 'clock-ticking', 0.28, 0.1, D(1) - 0.6, 1.0, null); a(L(1) + 0.8, 'pop', 0.25); ding(L(1) + 3.0);
for (let k = 0; k < 3; k++) a(L(2) + 0.1 + k * 0.18, 'pop', 0.3);
// 4 · the rule card is pinned
paper(L(4) + 0.15); a(L(4) + 0.3, 'pop', 0.35);
// 5 · the pot goes, the patch keeps spreading
a(L(5) + 0.2, 'whoosh', 0.18); a(L(5) + 0.8, 'sizzle', 0.18, 1.6); lab(5, 1.2);
// 6 · the three layers named
lab(6, 1.6); lab(6, 3.2); lab(6, 5.0); lab(6, 3.9);
// 7 · heat going down, minutes on the clock
a(L(7) + 0.3, 'sizzle', 0.15, D(7) - 0.4); rec(L(7) + 0.5, 'clock-ticking', 0.25, 0.1, Math.min(8, D(7) - 0.6), 1.0, null);
// 8 · the steak keeps cooking
a(L(8) + 0.3, 'whoosh', 0.15); a(L(8) + 0.6, 'sizzle', 0.25, D(8) - 0.8); lab(8, 1.3);
// 9 · step one: he steps back, the tick
a(L(9) + 0.3, 'whoosh', 0.2); scribble(L(9) + 1.4);
// 10 · the wet sleeve comes off
lab(10, 0.4); a(L(10) + D(10) * 0.45, 'wipe', 0.35); a(L(10) + D(10) * 0.45 + 0.2, 'whoosh', 0.2);
// 11 · the stuck cloth stays
lab(11, 0.3); scribble(L(11) + 0.9); scribble(L(11) + 1.6);
// 12 · running feeds the fire
a(L(12) + 0.2, 'steam', 0.2, D(12) - 0.4); rec(L(12) + 0.3, 'wind-gust', 0.3, 0.25, Math.min(3, D(12) - 0.5), 1.0, 'wind', 0.25); scribble(L(13) - 1.2);
// 13 · down on the floor, the blanket drops
a(L(13) + 0.3, 'thud', 0.3); a(L(13) + D(13) * 0.55, 'whoosh', 0.25); a(L(13) + D(13) * 0.55 + 0.6, 'thud', 0.2);
// 14 · step two: the tap runs, the 20-minute timer
tap(L(14) + 0.3, D(14) - 0.3, 0.32); rec(L(14) + 1.5, 'clock-ticking', 0.22, 0.1, Math.min(8, D(14) - 1.6), 1.0, null); lab(14, 0.8);
// 15 · water on the skin cut, heat rising out
tap(L(15), D(15), 0.22); lab(15, 0.3); a(L(15) + 1.0, 'steam', 0.15, 2.0);
// 16 · the hot pot under the tap
tap(L(16), D(16), 0.25); a(L(16) + 0.2, 'steam', 0.2, D(16) - 0.4); a(L(16) + 1.2, 'pop', 0.3);
// 17 · step three: the film laid on, the "tight" inset crossed
paper(L(17) + 0.5); a(L(17) + 0.9, 'wipe', 0.2); lab(17, 1.2); scribble(L(17) + D(17) * 0.55 + 0.5);
// 18 · the blister rises, the needle crossed, new skin draws
a(L(18) + 0.4, 'pop', 0.3); lab(18, 0.6); scribble(L(18) + 1.3); lab(18, 2.2);
// 19 · hospital, palm, white/black skin, a child
paper(L(19) + 0.2); a(L(19) + D(19) * 0.3, 'pop', 0.3); a(L(19) + D(19) * 0.6, 'pop', 0.3); a(L(19) + D(19) * 0.85, 'pop', 0.3);
// 20 · ice or water — no
a(L(20) + 0.2, 'clink', 0.25); tap(L(20) + 0.3, D(20) - 0.3, 0.18); scribble(L(20) + D(20) - 1.2);
// 21 · the vessels clamp shut
a(L(21) + 0.3, 'clink', 0.22); lab(21, 0.8); a(L(21) + 2.0, 'pop', 0.25);
// 22 · the paste lid, the trapped heat, germs
a(L(22) + 0.3, 'wipe', 0.25); lab(22, 0.6); lab(22, 1.4); a(L(22) + D(22) * 0.6, 'fizz', 0.15, 1.2);
// 23 · the recap boxes pop in one by one, the last one crossed
for (const q of [0, .25, .5, .75]) a(L(23) + D(23) * q + 0.05, 'pop', 0.3); scribble(L(23) + D(23) * 0.75 + 0.4);
// 24 · 1% counts up, a ding
lab(24, 0.6); ding(L(24) + 1.9); lab(24, 2.2);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
