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
const wind = (t, g, dur) => rec(t, 'wind-gust', g || 0.3, 0.25, dur || 4.4, 1.0, 'whoosh', 0.2);
const tickT = (t, dur) => rec(t, 'clock-ticking', 0.3, 0, dur, 1.0, 'tick', 0.15);
// hook: the catch, the burning capsule, the parachute, the tick of a ship ready again
a(L(0) + 0.3, 'exhaust', 0.32, 5.0); a(L(0) + 5.4, 'clank', 0.4);
a(L(1) + 0.2, 'sizzle', 0.2, 1.6); paper(L(1) + 1.9); paper(L(1) + 3.7); scribble(L(2) + 0.4);
// 4 launch card, the stack draws, its labels
a(L(4) + 0.1, 'boom', 0.25); a(L(4) + 0.3, 'jet', 0.16, 1.4); lab(4, 2.6); lab(4, 3.3); lab(4, 4.4);
// 5 orbits, numbers, satellites
drone(L(5), D(5) + 1.5); ding(L(5) + 1.9); ding(L(5) + 2.5); paper(L(5) + 3.6);
// 6-9 reentry
a(L(6) + 0.1, 'whoosh', 0.25); a(L(7) + 0.1, 'jet', 0.14, D(7)); ding(L(7) + 2.0);
a(L(8) + 0.2, 'steam', 0.22, 2.6); ding(L(8) + 1.7); lab(8, 0.7);
a(L(9) + 0.3, 'sizzle', 0.16, 2.0); lab(9, 0.9); paper(L(9) + 3.4); a(L(9) + 3.6, 'sizzle', 0.12, 1.0);
// 10-13 the belly flop
scribble(L(10) + 0.6); wind(L(11) + 0.1, 0.35); lab(11, 0.6); paper(L(12) + 0.1); lab(12, 0.7); wind(L(12) + 1.8, 0.25);
for (let k = 0; k < 4; k++) a(L(12) + 2.0 + k * 0.2, 'tick', 0.18); a(L(13) + 0.2, 'wind', 0.2, 2.2); ding(L(13) + 2.4);
// 14-17 flip, arms, myth, hover, the real ship on the arms
a(L(14) + 0.4, 'exhaust', 0.35, D(14) - 0.4); ding(L(14) + 0.5);
a(L(15) + 0.1, 'exhaust', 0.18, 1.6); a(L(15) + 0.9, 'gear', 0.25, 1.2); a(L(15) + 2.0, 'clank', 0.4); lab(15, 1.9); paper(L(15) + 4.5);
a(L(16) + 0.1, 'whoosh', 0.3); scribble(L(16) + 1.6); a(L(17) + 0.1, 'exhaust', 0.25, 2.0); scribble(L(17) + 0.8); paper(L(17) + 2.4);
// 18-21 legs, cost, price per kilo, Moon and Mars
scribble(L(18) + 0.8); a(L(18) + 1.7, 'thud', 0.35); scribble(L(19) + 1.3); scribble(L(19) + 3.4); a(L(20) + 0.2, 'whoosh', 0.2); ding(L(20) + 1.6);
drone(L(21), D(21)); a(L(21) + 1.7, 'fill', 0.2, 2.0);
// 22 recap, 23 the 18 seconds on the webcast clock
for (let k = 1; k < 5; k++) paper(L(22) + D(22) * [0, .18, .4, .6, .8][k]);
tickT(L(23) + 0.6, 4.2); a(L(23) + 0.6, 'exhaust', 0.2, 4.0); ding(L(23) + 4.9);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
