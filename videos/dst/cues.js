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
const tick = (t, dur, g) => rec(t, 'clock-ticking', g || 0.3, 0.1, Math.min(8.5, dur), 1.0, null);
const nile = (t, dur) => sea(t, dur, 0.14);
const chunk = (i, k) => L(i) + (T[i].end - T[i].start) * k;
// 0–2 · the bedroom at 5 a.m.: the wall clock ticking, the calendar laid down, the hands jump an hour
tick(L(0), L(3) - L(0)); paper(L(2) + 0.05); a(L(2) + 1.2, 'whoosh', 0.18, 1.0); a(L(2) + 1.7, 'pop', 0.4);
// 4–5 · the tilted Earth on its orbit
drone(L(4), D(4) + D(5)); lab(4, 1.0); ding(L(4) + 1.9); lab(4, 1.7);
a(L(5) + 0.35, 'pop', 0.35); a(L(5) + 0.95, 'tick', 0.2); a(chunk(5, 0.45) + 0.4, 'whoosh', 0.14); a(chunk(5, 0.45) + 0.5, 'pop', 0.35); a(chunk(5, 0.45) + 1.0, 'tick', 0.2);
// 6 · Cairo's day lengths: two bars draw, two numbers land
a(L(6) + 0.3, 'whoosh', 0.12); ding(L(6) + 1.7); a(L(6) + D(6) * 0.45, 'whoosh', 0.12); ding(L(6) + D(6) * 0.45 + 1.2);
// 7 · the rule card
paper(L(7) + 0.3); a(L(7) + 0.45, 'pop', 0.4);
// 8 · the clock spins, the Sun doesn't care: fast ticks, then the cross
for (let s = L(8) + 0.3; s < L(8) + 1.6; s += 0.12) a(s, 'tick', 0.12); scribble(L(8) + 1.6); lab(8, 0.6);
// 9–11 · Cairo by the Nile: the river laps; sunrise at 4:55, the wasted hour, the night
nile(L(9), L(12) - L(9) + 0.3); ding(L(9) + 0.6); a(L(9) + 0.3, 'pop', 0.3);
a(L(10) + 0.3, 'whoosh', 0.12); lab(10, 1.1); a(L(10) + D(10) * 0.55, 'pop', 0.35);
a(L(11) + 0.3, 'pop', 0.3); a(L(11) + D(11) * 0.45 + 0.8, 'chime', 0.2);
// 12 · the flats switch on (one click per room), then the plant hums and the meter climbs
for (let k = 0; k < 4; k++) a(L(12) + 0.25 + k * 0.55, 'pop', 0.32); lab(12, 0.6); lab(12, 1.1); lab(12, 1.6);
a(L(12) + D(12) * 0.5 - 0.3, 'hum', 0.16, D(12) * 0.5 + 0.3); a(L(12) + D(12) * 0.5 + 0.2, 'whoosh', 0.15, 1.2);
// 13 · the minute hand runs a full turn: ticking, then +1
tick(L(13) + 0.2, 1.6, 0.4); ding(L(13) + 1.4);
// 14 · the daylight block slides an hour later
a(L(14) + 1.2, 'whoosh', 0.15, 1.4); a(L(14) + 2.4, 'pop', 0.3); a(L(14) + 2.6, 'whoosh', 0.12);
// 15 · the plant calms down, the gas tanker
a(L(15), 'hum', 0.14, 2.2); lab(15, 1.2); a(L(15) + D(15) * 0.5, 'pop', 0.35);
// 16 · the clock goes back an hour
for (let s = L(16) + 0.2; s < L(16) + 1.2; s += 0.16) a(s, 'tick', 0.13); a(L(16) + 0.6, 'pop', 0.35);
// 17 · winter dawn at 7:45
rec(L(17), 'wind-gust', 0.2, 0.25, D(17), 1.0, 'wind', 0.12); ding(L(17) + 0.6); a(L(17) + 0.8, 'pop', 0.3);
// 18 · children walking to school in the dark: soft footsteps, the cross over the sun
for (let s = L(18) + 0.1; s < L(19) - 0.1; s += 0.6) a(s, 'bump', 0.1); scribble(L(18) + D(18) * 0.55);
// 19 · the myth: the bar grows, +1, crossed out
a(L(19) + 0.4, 'whoosh', 0.12, 1.2); a(L(19) + 1.2, 'pop', 0.35); scribble(L(19) + D(19) - 0.8);
// 20 · same length: two measures and a check
lab(20, 0.3); lab(20, 0.8); scribble(L(20) + 1.5);
// 21 · recap: one pop per step
a(L(21) + 0.2, 'pop', 0.3); a(chunk(21, 0.33), 'pop', 0.3); a(chunk(21, 0.66), 'pop', 0.3);
// 22 · the globe turns to New Zealand, 1895 lands
drone(L(22), D(22), 6); a(L(22) + 0.2, 'whoosh', 0.15, 1.8); lab(22, 1.8); ding(L(22) + D(22) * 0.55 + 1.2);
// 23 · the man with the net at dusk, moths fluttering
rec(L(23), 'wind-gust', 0.12, 0.25, D(23), 1.0, 'wind', 0.08); a(L(23) + 0.5, 'pop', 0.35); lab(23, 1.2);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
