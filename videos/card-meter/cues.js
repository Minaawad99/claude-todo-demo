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
const CHK = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (\[.*?\]);/)[1]);
const C = (i, k) => T[i].start + (T[i].end - T[i].start) * (CHK[i][k] || 0);                          // a caption chunk's start
const flip = (i, k) => rec(C(i, k) - 0.06, 'swipe', 0.18, 0.6, 0.42, 1.0, 'whoosh', 0.12);              // a softer flip on chunk shots
const click = (t, g) => { a(t, 'clank', g || 0.35); a(t + 0.02, 'tick', 0.4); };                         // the relay snapping
// hook: the balance runs out, the light dies; who did it?
for (let k = 0; k < 3; k++) a(0.4 + k * 0.5, 'beep', 0.16);
click(T[0].end - 0.5, 0.4); a(T[0].end - 0.9, 'hum', 0.12, 1.0);
a(L(1) + 0.1, 'pop', 0.3); scribble(L(2) + 0.25);
// 4–8: the card, the clerk, the meter's memory
a(L(4) + 0.3, 'pop', 0.25); flip(4, 1);
flip(5, 1); a(C(5, 1) + 0.2, 'notify', 0.18); flip(5, 2); paper(C(5, 2) + 0.1);
flip(6, 1); for (let k = 0; k < 6; k++) a(C(6, 1) + 0.15 + k * 0.22, 'tick', 0.18); flip(6, 2); a(C(6, 2) + 0.3, 'charge', 0.18, 1.2);
a(L(7) + 0.2, 'paper', 0.3); a(L(7) + 1.0, 'clink', 0.3); flip(7, 1); ding(C(7, 1) + 1.9);
flip(7, 2); a(C(7, 2) + 0.3, 'whoosh', 0.18); lab(7, C(7, 2) - L(7) + 0.9); flip(7, 3); a(C(7, 3) + 0.4, 'wipe', 0.25);
flip(8, 1); scribble(C(8, 1) + 0.1); flip(8, 2); scribble(C(8, 2) + 0.1);
// 9–13: measuring
a(L(9) + 0.3, 'pop', 0.25);
a(L(10) + 0.2, 'hum', 0.10, C(10, 2) - L(10)); flip(10, 2); a(C(10, 2), 'hum', 0.08, L(12) - C(10, 2)); flip(10, 3); flip(10, 4); lab(10, C(10, 4) - L(10) + 0.2);
lab(11, 0.2); flip(11, 1); paper(C(11, 1) + 0.1); flip(11, 2); ding(C(11, 2) + 0.2);
for (let t = L(12) + 0.2; t < L(14) - 0.2; t += 0.7) a(t, 'tick', 0.1);                                 // the LED blinking
a(L(13) + 1.6, 'pop', 0.25); for (let k = 0; k < 4; k++) a(C(13, 1) + k * 0.4, 'clink', 0.12);
// 14–17: taking the money
a(L(14) + 0.3, 'pop', 0.25); flip(14, 1); a(C(14, 1) + 0.15, 'clink', 0.25);
paper(C(15, 1) + 0.05); lab(15, C(15, 1) - L(15) + 0.3);
paper(L(16) + 1.0); flip(16, 2); for (let k = 0; k < 8; k++) a(C(16, 2) + 0.5 + k * 0.35, 'tick', 0.12);
for (let k = 0; k < 5; k++) a(L(17) + 0.4 + k * 0.42, 'plunk', 0.16); flip(17, 2); a(C(17, 2) + 0.2, 'whoosh', 0.2); flip(17, 3); ding(C(17, 3) + 0.15);
// 18–23: the cut-off
a(L(18) + 0.3, 'pop', 0.25);
flip(19, 1); flip(19, 2); for (let k = 0; k < 4; k++) a(C(19, 2) + 0.2 + k * 0.5, 'beep', 0.18); flip(19, 3); a(C(19, 3) + 0.3, 'beep', 0.15);
ding(L(20) + 1.0); flip(20, 1); a(C(20, 1) + 0.3, 'zap', 0.2); flip(20, 2); flip(20, 3); lab(20, C(20, 3) - L(20) + 0.2);
a(L(21) + 0.3, 'charge', 0.15, 1.0); flip(21, 1); click(C(21, 1) + 0.2); flip(21, 2); a(C(21, 2) + 0.05, 'spark', 0.25); flip(21, 3); scribble(C(21, 3) + 0.1);
flip(21, 4); a(C(21, 4) + 0.15, 'thud', 0.3);
a(L(22) + 0.2, 'pop', 0.25); click(L(22) + 0.6, 0.25); flip(22, 1); click(C(22, 1) + 0.4, 0.3); flip(22, 2);
a(L(23) + 0.2, 'paper', 0.3); flip(23, 1); ding(C(23, 1) + 1.1); flip(23, 2); a(C(23, 2) + 0.15, 'charge', 0.15, 1.0); click(C(23, 2) + 0.55); flip(23, 3); a(C(23, 3) + 0.2, 'chime', 0.25);
// 24–27: the myth, the recap, the report
flip(24, 1); a(C(24, 1) + 0.15, 'pop', 0.25); flip(24, 2); paper(C(24, 2) + 0.1); flip(24, 3); scribble(C(24, 3) + 0.05);
flip(25, 2); scribble(C(25, 2) + 0.1);
for (let k = 1; k <= 3; k++) { flip(26, k); a(C(26, k) + 0.05, 'pop', 0.3); } click(C(26, 3) + 0.4, 0.25);
a(L(27) + 0.3, 'paper', 0.3); flip(27, 1); a(C(27, 1) + 0.1, 'whoosh', 0.2); flip(27, 2); paper(C(27, 2) + 0.05); flip(27, 3); flip(27, 4);
for (let k = 0; k < 6; k++) a(C(27, 4) + 0.15 + k * 0.17, 'tick', 0.15); flip(27, 5); a(C(27, 5) + 0.15, 'creak', 0.25); flip(27, 6); a(C(27, 6) + 0.15, 'beep', 0.2);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
