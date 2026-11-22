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
// a flame's soft breath: a recorded candle / match clip if the user sends one (sfx/px-flame.mp3), else a low steady airflow
const flameBed = (t, dur, g) => rec(t, 'flame', g || 0.3, 0.2, dur, 1.0, 'wind', (g || 0.3) * 0.35);
// 0–2 · hook: a match strikes, the stand creaks as the candle tips, the flame flutters; ✗ on the pull line, a whoosh for the push
rec(L(0), 'match', 0.45, 0, 1.2, 1.0, 'spark', 0.3); flameBed(L(0) + 0.3, L(3) - L(0), 0.3);
a(L(0) + 0.4, 'servo', 0.25, 1.6); a(L(1) + 0.2, 'whoosh', 0.15);
scribble(L(2) + 0.95); a(L(2) + 1.75, 'whoosh', 0.2);
// 4–6 · the rule card, the ball in the water, the string cut and the ball shooting up
paper(L(4) + 0.5); a(L(4) + 0.6, 'pop', 0.35);
rec(L(5), 'water-rush', 0.18, 3, D(5), 1.0, 'slosh', 0.2); lab(5, 0.4); lab(5, 1.0);
a(L(6) + 1.2, 'snip', 0.4); a(L(6) + 1.3, 'splash', 0.3); a(L(6) + 0.2, 'pop', 0.3);
// 7–9 · the hot gas: a flame flutter, the number counting up; molecules speeding up; the balance tips
flameBed(L(7), D(7), 0.3); lab(7, 0.6); ding(L(7) + 2.4);
a(L(8) + 0.6, 'fizz', 0.2, 2.0);
a(L(9) + 0.8, 'creak', 0.18, 1.2); ding(L(9) + 2.0); lab(9, 0.4);
// 10–13 · cold air all round, it sinks and shoves, oil on water, the stand swinging both ways
a(L(10) + 0.3, 'wind', 0.12, D(10)); a(L(10) + 0.9, 'pop', 0.3);
a(L(11) + 0.3, 'wind', 0.14, 3); a(L(11) + 1.0, 'whoosh', 0.18); lab(11, 0.2);
a(L(12) + 0.4, 'fill', 0.2, 1.6); lab(12, 1.6); lab(12, 2.0);
a(L(13) + 0.2, 'servo', 0.25, 1.4); a(L(13) + 2.6, 'servo', 0.25, 1.8); lab(13, 0.8); a(L(13) + 1.6, 'pop', 0.3);
// 14–17 · the drop shape: question pops, oxygen drawn in, the flame stretches, soot glows
a(L(14) + 0.3, 'pop', 0.4); flameBed(L(14), D(14) + D(15) + D(16) + D(17), 0.28);
a(L(15) + 0.2, 'intake', 0.2, 1.4); lab(15, 1.2); lab(15, 1.4);
a(L(16) + 0.4, 'whoosh', 0.14, 1.4); lab(16, 1.2);
a(L(17) + 0.6, 'sizzle', 0.12, 1.4); lab(17, 1.0);
// 18–20 · space: the drone under the orbit, the flame rounding into a ball, oxygen drifting
drone(L(18), D(18) + D(19) + D(20) + 0.3); a(L(18) + 1.0, 'pop', 0.35);
a(L(19) + 0.5, 'whoosh', 0.12, 1.6); lab(19, 2.0);
a(L(20) + 0.8, 'pop', 0.3);
// 21–23 · the myth crossed out, thermometers climbing all round, the recap labels
a(L(21) + 0.6, 'pop', 0.3); scribble(L(21) + D(21) * 0.62);
for (const dt of [0.4, 0.6]) a(L(22) + dt, 'tick', 0.18); scribble(L(22) + 1.2); a(L(22) + 1.6, 'whoosh', 0.14);
lab(23, 0.3); lab(23, 1.4); lab(23, 2.6);
// 24 · the jar drops: a falling whoosh, the flame shrinking
a(L(24) + 1.0, 'whoosh', 0.25, Math.max(1, D(24) - 1.2)); a(L(24) + 0.6, 'pop', 0.3);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
