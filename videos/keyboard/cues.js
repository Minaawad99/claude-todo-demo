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
// typekey / jam are synthesized in audio/sfx.py (a typewriter slug on the platen; two typebars clashing)
const key = (t, g) => a(t, 'typekey', g || 0.32);
const pop = (t, g) => a(t, 'pop', g || 0.3);
const E = i => T[i].end - T[i].start;
// 0–2 · hook: someone typing, then Q W E R T Y one by one, then «A B C ?»
[0.35, 0.62, 0.95, 1.2].forEach(dt => key(L(0) + dt, 0.2));
[.24, .38, .52, .66, .79, .92].forEach(fr => key(T[1].start + E(1) * fr, 0.34));
pop(L(2) + 0.15, 0.35);
// 4 · the keys fly back into A B C
a(L(4) + 0.7, 'whoosh', 0.2, 1.4); pop(L(4) + 2.4);
// 5 · 1868, Sholes at the table typing
ding(L(5) + 0.3); [1.4, 1.75, 2.2, 2.5, 3.0].forEach(dt => key(L(5) + dt, 0.16)); lab(5, 2.6); lab(5, 3.6);
// 6 · the piano-like keys, A → Z
pop(L(6) + 0.4); lab(6, 1.0); for (let c = 0; c < 26; c += 2) key(L(6) + 2.0 + c * 0.1, 0.14); pop(L(6) + 3.6);
// 7 · question
pop(L(7) + 0.2, 0.35);
// 8 · the steel arm and the raised letter
lab(8, 0.3); lab(8, 0.9); pop(L(8) + 2.2); lab(8, 2.6);
// 9 · the ring
a(L(9) + 0.1, 'whoosh', 0.15); lab(9, 0.5); lab(9, 1.4);
// 10 · press, swing, strike: T H E
for (let n = 0; n < 3; n++) { a(L(10) + 0.45 + n * 1.3, 'tick', 0.12); key(L(10) + 0.75 + n * 1.3, 0.42); }
// 11 · the two neighbours
pop(L(11) + 1.0); key(L(11) + 1.95, 0.38); a(L(11) + 3.4, 'whoosh', 0.14, 0.6);
// 12 · the jam, then the hand
a(L(12) + 0.55, 'jam', 0.5); pop(L(12) + 0.8, 0.35); scribble(L(12) + 1.6); a(L(12) + 2.6, 'whoosh', 0.14, 0.8);
// 13 · S and T, the words
key(L(13) + 0.6, 0.3); key(L(13) + 0.85, 0.3); for (let i = 0; i < 4; i++) pop(L(13) + 1.6 + i * 0.45, 0.25); lab(13, 3.2);
// 14 · five years of layouts
pop(L(14) + D(14) / 3 - 0.2, 0.35); pop(L(14) + 2 * D(14) / 3 - 0.2, 0.35); lab(14, 0.4);
// 15 · S moves away round the ring
a(L(15) + 0.5, 'whoosh', 0.2, 1.6); scribble(L(15) + 2.4); pop(L(15) + 2.6);
// 16 · 1874: the Sholes & Glidden, its bell, then Q W E R T Y
ding(L(16) + 0.4); a(L(16) + 1.6, 'bell', 0.22, 0.9); a(L(16) + D(16) * 0.5, 'whoosh', 0.15, 1.2);
for (let j = 0; j < 6; j++) key(L(16) + D(16) * 0.7 + j * 0.32, 0.34);
// 17 · then and now
scribble(L(17) + 0.5); pop(L(17) + 1.6, 0.35);
// 18 · laptop and phone: no arms
pop(L(18) + 1.0); scribble(L(18) + 1.8);
// 19 · the timeline and 150+
for (let i = 0; i < 3; i++) pop(L(19) + 0.3 + i * 0.5, 0.28); ding(L(19) + 2.3);
// 20 · 1936 Dvorak, almost nobody
ding(L(20) + 0.2); lab(20, 1.0); a(L(20) + D(20) * 0.62, 'whoosh', 0.15); pop(L(20) + D(20) * 0.66, 0.3);
// 21 · the myth crossed out
pop(L(21) + 0.5, 0.35); scribble(L(21) + D(21) - 1.0);
// 22 · typing fast with no jam
for (let s = 0.3; s < D(22) - 0.3; s += 0.28) key(L(22) + s + 0.15, 0.22); scribble(L(22) + 2.6);
// 23 · recap cards
[0.2, 1.3, 2.6, 3.8].forEach(dt => paper(L(23) + dt));
// 24 · the middle row: D F G H J K L, and the old order under it
for (let i = 0; i < 9; i++) a(L(24) + 0.6 + i * 0.1, 'tick', 0.12);
for (let j = 0; j < 7; j++) key(L(24) + E(24) * 0.5 + j * 0.3, 0.32); ding(L(24) + E(24) * 0.5 + 2.2);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
