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
// e.g. lab(5, 0.4); ding(L(6) + 1.6); scribble(L(9) + 1.2); sea(L(0), L(PROMISE) - L(0) + 0.6, 0.45);
// 0–2 · hook: the ache pulses, the tablet goes down and fizzes, the dashed «?» line draws
a(L(0) + 0.4, 'thud', 0.18); a(L(0) + 1.0, 'thud', 0.14);
a(L(1) + 0.2, 'whoosh', 0.14, 1.0); a(L(1) + 1.4, 'fizz', 0.22, 1.4); paper(L(1) + 0.05);
a(L(2) + 0.1, 'whoosh', 0.12); a(L(2) + 0.5, 'pop', 0.3);
// 4–5 · the rule card, then the signal running up the arm to the brain
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.35);
a(L(5) + 0.3, 'thud', 0.16); lab(5, 0.9); for (let k = 0; k < 5; k++) a(L(5) + 1.2 + k * 0.28, 'tick', 0.14); a(L(5) + 2.7, 'bell', 0.18); lab(5, 2.7);
// 6 · the tablet dissolves, the drug moves on; into the villi and the blood
a(L(6) + 0.4, 'fizz', 0.3, 1.6); lab(6, 0.6); a(L(6) + 1.9, 'slosh', 0.15); lab(6, 2.4);
// 7 · the blood carries it round the body: a flowing rush, the clock, labels at head and toe
a(L(7) + 0.2, 'fill', 0.16, 2.6); rec(L(7) + 0.4, 'clock-ticking', 0.22, 0.1, 2.6, 1.0, null); lab(7, 3.2); lab(7, 3.6);
// 8 · the question
a(L(8) + 0.4, 'thud', 0.14); a(L(8) + 0.9, 'pop', 0.3);
// 9–11 · inflamed cells, prostaglandin, the nerve endings firing, the alarm bell
lab(9, 0.8); for (let k = 0; k < 6; k++) a(L(9) + 1.3 + k * 0.3, 'drip', 0.08); lab(9, 2.0);
lab(10, 0.5); for (let k = 0; k < 8; k++) a(L(10) + 1.6 + k * 0.22, 'tick', 0.13);
a(L(11) + 0.15, 'pop', 0.3); for (let k = 0; k < 3; k++) a(L(11) + 0.4 + k * 0.45, 'bell', 0.16);
// 12–13 · COX at work, then ibuprofen slides in and jams it; the snapped key
lab(12, 0.3); lab(12, 0.8); a(L(12) + 0.5, 'servo', 0.1);
a(L(13) + 0.3, 'whoosh', 0.14, 1.4); a(L(13) + 1.8, 'clink', 0.18); lab(13, 0.6); scribble(L(13) + 2.6); a(L(13) + D(13) * 0.62, 'clank', 0.14);
// 14 · the endings calm down
for (let k = 0; k < 5; k++) a(L(14) + 0.4 + k * 0.6, 'tick', 0.12 - k * 0.018);
// 15 · rest of the body: silent marks, no alarm
for (let k = 0; k < 4; k++) a(L(15) + 0.3 + k * 0.2, 'pop', 0.18); a(L(15) + 0.9, 'pop', 0.3);
// 16 · rain on the town, the fire goes out
rec(L(16), 'water-rush', 0.3, 3, D(16), 1.0, 'spray', 0.2); a(L(16) + 1.6, 'steam', 0.14, 1.6);
// 17–19 · the stomach, its mucus thinning under the acid, food, the check
a(L(17) + 0.2, 'whoosh', 0.12); a(L(17) + 0.6, 'pop', 0.3);
lab(18, 0.3); lab(18, 0.9); a(L(18) + 1.6, 'slosh', 0.16, 1.6);
paper(L(19) + 0.2); scribble(L(19) + D(19) * 0.55);
// 20–21 · the myth crossed out, then the check
a(L(20) + 0.3, 'whoosh', 0.14, 1.4); scribble(L(20) + D(20) * 0.8);
scribble(L(21) + 0.6); lab(21, 1.6);
// 22 · recap callouts
a(L(22) + 0.3, 'pop', 0.3); a(L(22) + 1.4, 'pop', 0.3); a(L(22) + 2.8, 'pop', 0.3);
// 23 · aspirin, the timeline fills, 72 years
lab(23, 0.4); a(L(23) + 0.8, 'pop', 0.25); for (let k = 0; k < 8; k++) a(L(23) + 1.2 + k * 0.32, 'tick', 0.13); ding(L(23) + 3.7);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
