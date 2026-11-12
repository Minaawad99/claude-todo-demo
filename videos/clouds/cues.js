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
const wind = (t, dur, g, from) => rec(t, 'wind-gust', g || 0.25, from || 0.25, Math.min(4.4, dur), 1.0, 'wind', 0.2);
// the elephants land on the [6, 2] shot (a shot change inside line 6)
const E6 = L(6) + (T[6].end - T[6].start) * 0.7719; rec(E6 - 0.08, 'swipe', 0.3, 0.6, 0.42, 1.0, 'whoosh', 0.2);
// 0–2 · hook card: a soft wind under the floating cloud, a thud for the elephants, the «falling» arrow crossed out
wind(L(0) + 0.2, 4, 0.22); a(L(1) + 0.9, 'pop', 0.4); a(L(1) + 1.2, 'pop', 0.35); scribble(L(2) + 0.7);
// 4 · the kilometre cube: three edges, three ticks
lab(4, 0.6); lab(4, D(4) * 0.4); lab(4, D(4) * 0.6); lab(4, D(4) * 0.8);
// 5 · half a gram
lab(5, 0.4); ding(L(5) + 1.7); a(L(5) + 2.1, 'pop', 0.3);
// 6 · 500 tonnes, then the herd
ding(L(6) + D(6) * 0.45); for (let k = 0; k < 6; k++) a(E6 + 0.12 + k * 0.11, 'pop', 0.22);
// 7 · the weight arrow and the question
a(L(7) + 0.25, 'whoosh', 0.18); a(L(7) + 0.95, 'pop', 0.4);
// 8 · the rule card is pinned
paper(L(8) + 0.3); a(L(8) + 0.45, 'pop', 0.4);
// 9 · falling balls: air brakes
a(L(9) + 0.2, 'whoosh', 0.14); lab(9, 0.9); lab(9, 1.7);
// 10 · the magnifier opens on the droplets
a(L(10) + D(10) * 0.3, 'pop', 0.4); lab(10, D(10) * 0.45); ding(L(10) + D(10) * 0.72);
// 11 · droplet against a hair
lab(11, 0.4); ding(L(11) + 0.9); lab(11, D(11) * 0.62); lab(11, D(11) * 0.75);
// 12 · one centimetre a second: a clock, then the window with dust
rec(L(12) + 0.2, 'clock-ticking', 0.25, 0.1, Math.min(3.2, D(12) * 0.55), 1.0, null); ding(L(12) + D(12) * 0.3); a(L(12) + D(12) * 0.58, 'pop', 0.4);
// 13–14 · the rising air
a(L(13) + 0.35, 'pop', 0.35); wind(L(13) + D(13) * 0.45, 2.6, 0.3); lab(13, D(13) * 0.62);
wind(L(14) + D(14) * 0.3, 3.6, 0.28, 1.0); lab(14, 0.8); lab(14, D(14) * 0.4); scribble(L(14) + D(14) * 0.86);
// 15–16 · a million tonnes of air, the sliver of water
lab(15, 0.5); ding(L(15) + 1.9); a(L(16) + 0.3, 'whoosh', 0.14); a(L(16) + 1.15, 'pop', 0.4); lab(16, 1.5); ding(L(16) + 1.9);
// 17–18 · droplets merge, a million into one raindrop
a(L(17) + 0.3, 'pop', 0.35); a(L(17) + 1.5, 'pop', 0.3); a(L(17) + 1.9, 'pop', 0.3); a(L(17) + 2.6, 'pop', 0.4);
lab(18, 0.4); lab(18, 0.7); ding(L(18) + 2.0);
// 19 · rain
rec(L(19) + 0.2, 'water-rush', 0.22, 3, D(19) + 0.2, 1.0, 'slosh', 0.2); lab(19, 1.1);
// 20 · the myth is crossed out
a(L(20) + 0.5, 'pop', 0.35); scribble(L(20) + D(20) * 0.62);
// 21 · the kettle: a hiss, then the labels
a(L(21) + 0.2, 'steam', 0.14, 1.6); lab(21, 0.6); a(L(21) + D(21) * 0.42, 'pop', 0.4); lab(21, D(21) * 0.6); lab(21, D(21) * 0.8);
// 22 · recap labels
wind(L(22) + 0.2, 4, 0.2, 0.6); lab(22, 1.0); lab(22, 2.1); lab(22, 3.3);
// 23 · the thunderstorm cloud: rain under it, the million lands
rec(L(23) + 0.2, 'water-rush', 0.16, 5, D(23) - 0.3, 1.0, 'slosh', 0.15); lab(23, 0.7); ding(L(23) + D(23) * 0.6);


const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
