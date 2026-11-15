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

// ── this episode ── px-buzz.mp3 is a synthesized mosquito whine (ffmpeg aevalsrc, see refs/SOURCES.md), kept in sfx/
const buzz = (t, dur, g, from) => rec(t, 'buzz', g || 0.16, from || 0, dur, 1.0, 'hum', 0.08);
// 0–2 · the lamp clicks off, the whine by the ear, the bites pop in
a(L(0) + 1.0, 'tick', 0.35); buzz(L(1) + 0.1, L(2) - L(1) + 0.4, 0.22); a(L(2) + 0.9, 'pop', 0.3); a(L(2) + 1.3, 'pop', 0.3); a(L(2) + 1.7, 'pop', 0.3);
// 4 · the female on the skin
lab(4, 0.5); a(L(4) + 0.3, 'pop', 0.35); lab(4, 2.3);
// 5 · the dark room: the whine hunting, then «بالشم»
buzz(L(5), D(5) * 0.6, 0.18, 3); a(L(5) + D(5) * 0.62, 'pop', 0.4);
// 6 · a breath out, CO₂
rec(L(6) + 0.2, 'wind-gust', 0.16, 0.25, 1.6, 1.0, 'wind', 0.15); lab(6, 1.1);
// 7 · she follows the plume; +10 m
buzz(L(7) + 1.0, D(7) - 1.2, 0.12, 5); ding(L(7) + 2.0);
// 8 · the eye wakes up
a(L(8) + 0.9, 'ping', 0.25); lab(8, 1.3); a(L(8) + D(8) * 0.5, 'pop', 0.35);
// 9 · heat
a(L(9) + 0.3, 'whoosh', 0.14, 1.2); lab(9, 1.1); a(L(9) + D(9) * 0.6, 'pop', 0.35);
// 10 · she lands
buzz(L(10) + 0.5, D(10) - 1.2, 0.12, 2); a(L(10) + 0.5, 'pop', 0.3); a(L(10) + D(10) - 0.75, 'tick', 0.3);
// 11 · they all go to one
buzz(L(11), D(11), 0.15, 6); a(L(11) + 0.6, 'pop', 0.35);
// 12–14 · smells, bacteria, the magnets
lab(12, 0.3); lab(12, 0.6); lab(12, 0.9); lab(12, 1.2); a(L(12) + D(12) * 0.6, 'pop', 0.35);
lab(13, 0.6); lab(13, 1.7); a(L(13) + D(13) * 0.55, 'whoosh', 0.12); lab(13, D(13) * 0.6 + 0.1);
buzz(L(14) + 0.6, D(14) - 1, 0.12, 4); a(L(14) + D(14) * 0.7, 'pop', 0.4);
// 15 · the experiment: ×100
buzz(L(15) + 0.8, D(15) - 1.5, 0.12, 1); ding(L(15) + D(15) * 0.5 + 1.3);
// 16 · the years tick by
for (let k = 0; k < 3; k++) { a(L(16) + 0.4 + k * 0.6, 'pop', 0.3); lab(16, 0.9 + k * 0.6); }
// 17–19
rec(L(17) + 0.4, 'wind-gust', 0.14, 0.25, 1.6, 1.0, 'wind', 0.12); a(L(17) + D(17) * 0.4, 'pop', 0.35);
buzz(L(18) + 0.4, D(18) - 0.8, 0.12, 7); ding(L(18) + D(18) * 0.5 + 0.1);
lab(19, 0.6); lab(19, 1.2); a(L(19) + 0.3, 'drip', 0.25);
// 20–21 · the myth crossed out; skin and breath ticked
a(L(20) + 0.3, 'pop', 0.35); scribble(L(20) + D(20) * 0.62);
scribble(L(21) + 0.6); scribble(L(21) + D(21) * 0.55); scribble(L(21) + D(21) * 0.75);
// 22 · recap tags
a(L(22) + 0.3, 'pop', 0.3); a(L(22) + D(22) * 0.4, 'pop', 0.3); a(L(22) + D(22) * 0.68, 'pop', 0.3);
// 23 · tasting with her feet
lab(23, 0.8); lab(23, 1.1);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft', 'buzz'].filter(has).join(', ') || 'none'));
