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
eval(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0]);       // window.CHUNKS
const C = (i, k) => T[i].start + (T[i].end - T[i].start) * (window.CHUNKS[i][k] || 0);
const jerk = (t, g) => { a(t, 'thud', g || 0.55); a(t + 0.02, 'whoosh', (g || 0.55) * 0.5, 0.35); };   // the jolt: a thump in the mattress
const heartbeat = (t, dur) => { for (let x = 0; x < dur; x += 60 / 130) { a(t + x, 'thud', 0.32, 0.25); a(t + x + 0.1, 'thud', 0.2, 0.2); } };
// hook: the jolt, then the cut-open brain with its spark
jerk(L(0) + Math.max(1.2, (T[0].end - T[0].start) * 0.5));
a(L(0) + (T[0].end - T[0].start) * 0.45, 'pop', 0.25);
a(L(1) + 0.6, 'snip', 0.3); a(L(2) + 0.1, 'pop', 0.3); a(L(2) + 0.3, 'spark', 0.3);
// the rule: two switches, the panel flips, both on = ✗
lab(5, 0.1); a(C(5, 1) + 0.1, 'tick', 0.22); a(C(5, 2) + 0.1, 'tick', 0.22);
a(C(5, 3) + 0.4, 'bump', 0.35); a(C(5, 3) + 1.85, 'bump', 0.35); scribble(L(6) - 1.05);
a(L(6) + 0.2, 'pop', 0.25);
a(L(7) + 0.3, 'fill', 0.12, 1.2); lab(7, 0.8); a(C(7, 2) + 1.6, 'whoosh', 0.2);
a(L(8) + 0.2, 'pop', 0.25);                                                        // the shift change
a(L(9) + 0.3, 'servo', 0.12, 2.4);                                                  // the muscles let go
a(L(10) + 0.2, 'pop', 0.25); a(L(11) + 0.2, 'gear', 0.3); a(L(11) + 0.4, 'spark', 0.25);
// the glitch: a spark, the signal runs down the spine, everything lights
a(L(12) + 0.1, 'spark', 0.4); a(C(12, 1), 'charge', 0.3, 1.2); a(C(12, 3), 'zap', 0.35);
jerk(C(13, 0) + 0.15); jerk(C(13, 1) + 0.1, 0.45); heartbeat(C(13, 2) + 0.1, T[13].end - C(13, 2) + 0.3);
ding(L(14) + 0.2); a(C(14, 1) + 0.3, 'pop', 0.3); for (let x = 0.3; x < T[14].end - L(14); x += 2.4) a(L(14) + x, 'thud', 0.25);
a(L(15) + 0.1, 'pop', 0.3); a(L(15) + 0.7, 'whoosh', 0.3, 0.9);                  // the dream of missing a step
a(L(16) + 0.2, 'paper', 0.25); a(C(16, 1) + 0.2, 'pop', 0.3);
for (let k = 0; k < 7; k++) a(L(17) + 0.15 + k * 0.08, 'tick', 0.16);              // the week of nights
a(L(18) + 0.05, 'pop', 0.3); a(C(18, 1) + 0.05, 'pop', 0.3); a(C(18, 2) + 0.1, 'beep', 0.25);
a(L(19) + 0.2, 'hum', 0.12, 1.6); a(C(19, 1) + 0.05, 'gear', 0.3); a(C(19, 1) + 0.15, 'spark', 0.35);
paper(L(20) + 0.3); scribble(C(20, 3));
ding(L(21) + 1.8); scribble(C(21, 2) + 0.5);
a(C(22, 1) + 0.1, 'pop', 0.25); a(C(22, 2) + 0.1, 'gear', 0.3); jerk(C(22, 3) + 0.25, 0.45);
rec(L(23), 'wind-gust', 0.18, 0.25, 4.4, 1.0, 'wind', 0.08);                       // up in the tree
a(C(23, 3) + 0.2, 'whoosh', 0.2);
a(L(24) + 0.3, 'whoosh', 0.3, 1.2); a(C(24, 2) + 0.3, 'spark', 0.35); jerk(C(24, 4) + 0.2, 0.5); scribble(C(24, 4) + 0.8);
paper(L(25) + 0.1); a(C(25, 1) + 0.2, 'thud', 0.35);                              // the stamp

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
