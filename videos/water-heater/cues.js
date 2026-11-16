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
eval(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0]);   // window.CHUNKS
const CH = (i, k) => L(i) + (T[i].end - T[i].start) * (window.CHUNKS[i][Math.min(k, window.CHUNKS[i].length - 1)] || 0), F = (i, x) => L(i) + (T[i].end - T[i].start) * x;
const tick = (t, g) => rec(t, 'clock-ticking', g || 0.25, 0.1, 0, 1.0, null);
const ticking = (t, dur, g) => { if (has('clock-ticking')) rec(t, 'clock-ticking', g || 0.22, 0.1, Math.min(8.6, dur), 1.0, null); else for (let s = t; s < t + dur; s += 0.5) a(s, 'tick', 0.14); };
const click = (t, g) => { a(t, 'tick', g || 0.4); a(t + 0.03, 'clink', (g || 0.4) * 0.5, 0.2); };   // the thermostat's snap
// hook: the heater humming on the wall, the clock racing; night: the lamp clicking on by itself
a(L(0) + 0.3, 'hum', 0.1, L(PROMISE) - L(0) - 0.3); ticking(L(0) + 0.3, D(0), 0.18); a(L(1) + 0.2, 'pop', 0.3); click(L(2) + 1.0, 0.3); scribble(L(2) + 0.9);
// 4 · tank, element, thermostat
lab(4, 0.5); a(L(4) + 1.4, 'pop', 0.3); lab(4, CH(4, 2) - L(4) + 0.3); lab(4, CH(4, 3) - L(4));
// 5 · heating, then the snap when it reaches 60°
a(L(5) + 0.1, 'hum', 0.14, D(5) * 0.7); a(L(5) + 0.2, 'fizz', 0.08, D(5) * 0.65); click(F(5, 0.7)); ding(F(5, 0.7) + 0.1);
// 6 · the lamp comes back on by itself
a(L(6) + 0.3, 'pop', 0.3); click(L(6) + D(6) * 0.55); a(L(6) + D(6) * 0.55 + 0.1, 'hum', 0.1, D(6) * 0.4);
// 7 · heat leaking out of the shell
a(L(7) + 0.3, 'steam', 0.1, D(7) - 0.5); lab(7, CH(7, 1) - L(7)); a(L(7) + 1.2, 'pop', 0.3);
// 8 · the saw-tooth all day: a snap at every reheat
ticking(L(8) + 0.2, D(8) - 0.3, 0.18); for (let c2 = 0; c2 < 7; c2++) click(L(8) + D(8) * 0.9 * (c2 + 0.82) / 7, 0.22);
// 9 · 1.5 counts up, the month fills in, 45
a(L(9) + 0.3, 'spark', 0.12); ding(L(9) + 1.5); for (let k = 0; k < 10; k++) a(CH(9, 1) + 0.3 + k * (D(9) - (CH(9, 1) - L(9)) - 0.9) / 10, 'tick', 0.12); ding(L(10) - 0.5);
// 10 · the teapot on the flame all day
a(L(10) + 0.1, 'steam', 0.14, D(10) - 0.3); a(L(10) + 0.1, 'hum', 0.06, D(10) - 0.3); ticking(L(10) + 0.5, D(10) - 0.6, 0.16); a(CH(10, 1), 'clink', 0.3, 0.3);
// 11 · up a tier
a(L(11) + 0.9, 'whoosh', 0.16, 0.8); ding(L(11) + 1.7);
// 12 · and the heater itself?
a(L(12) + 0.1, 'hum', 0.1, D(12)); a(L(12) + 0.3, 'pop', 0.35);
// 13 · lime settling on the element
a(L(13) + 0.2, 'fizz', 0.1, D(13) - 0.3); lab(13, 0.6); a(CH(13, 1), 'pop', 0.25);
// 14 · the kettle's white crust
a(L(14) + 0.3, 'clink', 0.3, 0.3); lab(14, CH(14, 1) - L(14));
// 15 · the crust traps the heat; the rod overheats, then burns out
a(L(15) + 0.3, 'sizzle', 0.1, D(15) - 0.6); lab(15, 0.4); lab(15, 0.6); a(CH(15, 3) + 0.3, 'spark', 0.35); scribble(CH(15, 3) + 0.4);
// 16 · the electricity itself
a(L(16) + 0.1, 'zap', 0.35); a(L(16) + 0.2, 'hum', 0.12, D(16) - 0.2);
// 17 · the crack, the current in the water, no earth, the shower
a(L(17) + 0.3, 'spark', 0.3); lab(17, 0.4); a(CH(17, 1), 'hum', 0.12, CH(17, 2) - CH(17, 1));
rec(CH(17, 2), 'water-rush', 0.18, 3, L(18) - CH(17, 2), 1.0, 'drip', 0.2); scribble(CH(17, 2) + 0.3); a(CH(17, 2) + 0.9, 'zap', 0.3); a(CH(17, 2) + 1.4, 'spark', 0.25);
// 18 · off at the wall before the shower
a(CH(18, 1) + 0.3, 'clank', 0.35, 0.3); scribble(CH(18, 1) + 0.7); paper(CH(18, 2)); paper(CH(18, 3));
// 19 · the myth: a bar for "more?", then ✗ and «لأ»
a(L(19) + 0.6, 'whoosh', 0.12); scribble(F(19, 0.92)); a(F(19, 0.92) + 0.1, 'pop', 0.4);
// 20 · the cooling tank loses less: the bar shrinks, ✓
a(L(20) + 0.2, 'steam', 0.08, D(20) * 0.6); scribble(CH(20, 1) + 0.4);
// 21 · recap rows
a(L(21) + 0.1, 'pop', 0.3); a(F(21, 0.55), 'pop', 0.3); a(F(21, 0.72), 'pop', 0.3); a(F(21, 0.75), 'zap', 0.2);
// 22 · overnight: the clock runs to morning, one degree an hour
ticking(L(22) + 0.3, D(22) - 0.5, 0.18); a(F(22, 0.2), 'pop', 0.3); ding(F(22, 0.85));

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
