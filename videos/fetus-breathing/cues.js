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
// a soft heartbeat (two low thuds) over the womb shots
const beat = (t0, dur, g) => { for (let s = t0; s < t0 + dur - 0.3; s += 0.85) { a(s, 'thud', g || 0.1); a(s + 0.22, 'thud', (g || 0.1) * 0.7); } };
// 0 · hold your breath: the stopwatch runs
rec(L(0) + 0.2, 'clock-ticking', 0.25, 0.1, D(0) - 0.2, 1.0, null); if (!has('clock-ticking')) for (let s = L(0) + 0.2; s < L(1); s += 0.5) a(s, 'tick', 0.14);
// 1–2 · the baby in the womb: heartbeat, fluid; 9 months tag; no air (✗)
beat(L(1), D(1) + D(2), 0.12); a(L(1) + 0.3, 'slosh', 0.15); a(L(1) + 0.5, 'pop', 0.3);
a(L(2) + 0.1, 'whoosh', 0.12); scribble(L(2) + 0.45);
// 4 · the cell: oxygen in, CO2 out
a(L(4) + 0.3, 'pop', 0.3); lab(4, 0.6); a(L(4) + 1.0, 'whoosh', 0.1, 1.0); a(L(4) + 2.4, 'whoosh', 0.1, 1.0); a(L(4) + 3.3, 'pop', 0.3);
// 5–6 · the mother breathes; oxygen runs down to the uterus
a(L(5) + 1.5, 'whoosh', 0.14, 1.2); lab(5, 1.6);
rec(L(6) + 0.4, 'water-rush', 0.18, 3, 2.6, 1.0, 'fill', 0.15); lab(6, 1.6); a(L(6) + 3.1, 'pop', 0.3);
// 7–8 · the placenta, the plate; «رئة الطفل»
beat(L(7), D(7) + D(8), 0.1); a(L(7) + 0.5, 'pop', 0.3); lab(7, 1.3); paper(L(8) + 0.4); a(L(8) + 0.9, 'pop', 0.3);
// 9 · two bloods that never mix: the question, the cross
rec(L(9), 'water-rush', 0.15, 6, D(9), 1.0, 'slosh', 0.12); lab(9, 0.3); lab(9, 0.7); a(L(9) + 1.2, 'pop', 0.35); scribble(L(9) + 2.0);
// 10–11 · the villous trees; the lakes of mother's blood fill up
lab(10, 1.0); a(L(10) + 1.8, 'pop', 0.3);
rec(L(11) + 0.2, 'water-rush', 0.22, 3, 2.0, 1.0, 'fill', 0.2); lab(11, 1.4);
// 12–13 · the thin wall and the hair (÷20 lands); gas crossing
lab(12, 0.3); a(L(12) + 0.6, 'whoosh', 0.1); ding(L(12) + 1.2);
for (let k = 0; k < 6; k++) a(L(13) + 0.3 + k * 0.3, 'drip', 0.08); for (let k = 0; k < 5; k++) a(L(13) + 2.3 + k * 0.3, 'drip', 0.07);
// 14 · the tea bag in the glass
a(L(14) + 0.1, 'drop', 0.25); a(L(14) + 0.6, 'slosh', 0.12); lab(14, 1.0); lab(14, 2.2);
// 15 · 12 m², the tiles fill in, the number lands
for (let k = 0; k < 12; k++) a(L(15) + 0.4 + k * 0.21, 'tick', 0.14); ding(L(15) + 2.9);
// 16–17 · the cord: heartbeat, the vein and the two arteries
beat(L(16), D(16), 0.11); lab(16, 1.6);
rec(L(17), 'water-rush', 0.14, 8, D(17) - 0.3, 1.0, 'slosh', 0.12); a(L(17) + 0.2, 'pop', 0.3); lab(17, 0.6); a(L(17) + 1.0, 'whoosh', 0.1); lab(17, 2.6); lab(17, 3.0);
// 18 · two gauges, a question
a(L(18) + 0.1, 'pop', 0.3); a(L(18) + 0.5, 'pop', 0.3); a(L(18) + 1.6, 'pop', 0.35);
// 19 · oxygen hops from cell to cell; «أقوى»
for (let k = 0; k < 6; k++) a(L(19) + 0.7 + k * 0.33, 'pop', 0.14); lab(19, 0.3); lab(19, 1.0); paper(L(19) + 2.6);
// 20 · the nail snaps to the stronger magnet
lab(20, 0.3); a(L(20) + 0.6, 'whoosh', 0.14, 0.9); a(L(20) + 1.75, 'clink', 0.25);
// 21 · the fish thumbnail, bubbles, crossed out
a(L(21) + 0.2, 'pop', 0.3); a(L(21) + 0.5, 'drop', 0.12); scribble(L(21) + D(21) - 1.3);
// 22 · the chest moves fluid in and out; «تمرين»
beat(L(22), D(22), 0.1); for (let k = 0; k < 3; k++) a(L(22) + 0.5 + k * 1.9, 'slosh', 0.1); lab(22, 0.4); paper(L(22) + 2.2);
// 23 · recap callouts 1–4
for (const dt of [0.3, 1.3, 2.3, 3.4]) a(L(23) + dt, 'pop', 0.35);
// 24 · Everest: wind on the summit, the gauges, ≈
rec(L(24), 'wind-gust', 0.3, 0.25, Math.min(4.4, D(24)), 1.0, 'wind', 0.22); a(L(24) + 0.2, 'pop', 0.3); a(L(24) + 0.8, 'pop', 0.3); ding(L(24) + 1.6);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
