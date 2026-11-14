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
// «الدهون بتروح فين لما بنخس؟»
// 0–2 · hook: the scale counts down, the ghost weight pops, sweat and muscle are crossed out
for (let k = 0; k < 4; k++) a(L(0) + 0.5 + k * 0.22, 'tick', 0.14);
a(L(1) + 0.15, 'pop', 0.4); scribble(L(2) + 0.5); scribble(L(2) + D(2) * 0.62);
// 4 · the breath out
rec(L(4) + 0.4, 'wind-gust', 0.16, 0.25, 2.2, 1.0, 'wind', 0.14); lab(4, 1.6); lab(4, 2.4);
// 5 · the rule card is pinned
paper(L(5) + 0.3); a(L(5) + 0.45, 'pop', 0.4);
// 6 · grams walk out through the exit, the scale counts down
for (let k = 0; k < 5; k++) a(L(6) + 0.6 + k * 0.35, 'tick', 0.14); a(L(6) + D(6) * 0.45, 'whoosh', 0.14); a(L(6) + D(6) * 0.55, 'pop', 0.35);
// 7 · the skin cut and its labels; one cell up close, the balloon thumbnail
lab(7, 0.6); lab(7, 1.2); lab(7, 1.8); rec(L(7) + D(7) * 0.52, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2); a(L(7) + D(7) * 0.6, 'pop', 0.4);
// 8 · the molecule builds atom by atom
for (let k = 0; k < 8; k++) a(L(8) + 0.3 + k * 0.2, 'tick', 0.12); a(L(8) + 0.9, 'pop', 0.3); a(L(8) + 1.45, 'pop', 0.3); a(L(8) + 2.0, 'pop', 0.3);
// 9 · the question
a(L(9) + 0.2, 'pop', 0.4);
// 10 · the two bars grow, the gap, the savings jar
a(L(10) + 0.3, 'whoosh', 0.14); a(L(10) + 1.2, 'pop', 0.35); lab(10, 1.7); ding(L(10) + D(10) * 0.5);
// 11 · the cell lets go into the blood
rec(L(11) + 0.4, 'water-rush', 0.14, 3, D(11) - 0.5, 1.0, 'slosh', 0.14); lab(11, 0.8); lab(11, 1.5);
// 12 · the muscle burns it
lab(12, 0.6); a(L(12) + D(12) * 0.5, 'whoosh', 0.2, 1.2); lab(12, D(12) * 0.6);
// 13 · energy, CO2 and water; the exhaust
a(L(13) + D(13) * 0.36, 'pop', 0.4); ding(L(13) + D(13) * 0.4); a(L(13) + D(13) * 0.55, 'pop', 0.3); a(L(13) + D(13) * 0.66, 'pop', 0.3); a(L(13) + D(13) * 0.83, 'pop', 0.4);
// 14 · out with the breath
rec(L(14) + D(14) * 0.55, 'wind-gust', 0.16, 0.25, 1.6, 1.0, 'wind', 0.14); lab(14, 0.8);
// 15 · water: urine and sweat
rec(L(15) + 0.2, 'water-rush', 0.12, 3, D(15) - 0.3, 1.0, 'slosh', 0.12); lab(15, 0.5); a(L(15) + 1.1, 'pop', 0.3);
// 16 · the 10 kilos split: 8.4 breath, 1.6 water
a(L(16) + 0.1, 'pop', 0.3); a(L(16) + D(16) * 0.42, 'whoosh', 0.14, 1.0); ding(L(16) + D(16) * 0.42 + 1.1); ding(L(16) + D(16) * 0.8 + 0.7);
// 17 · fast breathing, crossed out
rec(L(17) + 0.3, 'wind-gust', 0.14, 0.25, 2.0, 1.0, 'wind', 0.12); scribble(L(17) + D(17) * 0.72);
// 18 · sitting ×1, running ×7
a(L(18) + 0.2, 'pop', 0.3); a(L(18) + D(18) * 0.36, 'pop', 0.35); for (let k = 0; k < 6; k++) a(L(18) + D(18) * 0.4 + 0.3 + k * 0.2, 'tick', 0.16); ding(L(18) + D(18) * 0.4 + 1.6);
// 19 · the myth, crossed out
a(L(19) + 0.4, 'whoosh', 0.12); a(L(19) + 0.7, 'pop', 0.35); scribble(L(19) + D(19) * 0.62);
// 20 · the atoms stay and must leave
for (let k = 0; k < 6; k++) a(L(20) + 0.3 + k * 0.1, 'tick', 0.12); a(L(20) + D(20) * 0.75, 'whoosh', 0.14); a(L(20) + D(20) * 0.8, 'pop', 0.35);
// 21 · same count, smaller cells
a(L(21) + 0.5, 'pop', 0.3); a(L(21) + D(21) * 0.4, 'whoosh', 0.12, 1.4); a(L(21) + D(21) * 0.45, 'pop', 0.3);
// 22 · the four recap panels
for (let k = 0; k < 4; k++) paper(L(22) + D(22) * (0.16 + k * 0.21));
// 23 · asleep: 200 grams a day
for (let k = 0; k < 6; k++) a(L(23) + D(23) * 0.4 + k * 0.2, 'tick', 0.14); ding(L(23) + D(23) * 0.4 + 1.3); a(L(23) + D(23) * 0.82, 'pop', 0.35);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
