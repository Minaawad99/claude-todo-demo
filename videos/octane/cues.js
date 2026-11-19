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
// the user's Pixabay recordings for this episode (videos/octane/sfx, credited in refs/SOURCES.md); each falls back to a synth stand-in
const idle = (t, dur, g) => rec(t, 'engine-idle', g || 0.32, 2, dur, 1.0, 'idle', 0.12);
const knock = (t, dur, from, g) => rec(t, 'engine-knock', g || 0.16, from || 3, dur, 1.0, 'clank', 0.2);
const spark = (t, dur, from) => rec(t, 'ignition-spark', 1.5, from || 1, dur || 0.35, 1.0, 'spark', 0.3);
// 0-3 · the hook: two identical engines start and idle in step; the badges land; the gauges settle equal; coins fly; the 80 one knocks
rec(L(0) + 0.2, 'engine-start', 0.3, 0, 3.2, 1.0, 'rev', 0.15); idle(L(0) + 3.0, L(4) - L(0) - 3.0, 0.26);
paper(L(1) + 0.05); paper(L(1) + 0.95); a(L(1) + D(1) - 1.4, 'pop', 0.25);
ding(L(2) + 0.6); for (let k = 0; k < 4; k++) rec(L(2) + 1.8 + k * 0.2, 'coins', 0.3, 0, 0.5, 1.0, 'clink', 0.2);
paper(L(3) + 0.05); knock(L(3) + 0.8, D(3) - 0.6, 3, 0.2);
// 5 · tolerance, not strength
ding(L(5) + 0.2); scribble(L(5) + D(5) * 0.45); scribble(L(5) + D(5) * 0.75);
// 6 · the cycle: the intake valve opens and the mixture comes in, then the squeeze; 1/10 lands
idle(L(6), D(6)); lab(6, 0.4); ding(L(6) + D(6) - 1.1);
// 7 · the bike pump
rec(L(7) + 0.1, 'bike-pump', 1.4, 0.4, D(7) - 0.1, 1.0, 'squeeze', 0.25); lab(7, 0.6);
// 8 · the spark, the flame, the push
idle(L(8), D(8)); lab(8, 0.2); spark(L(8) + D(8) * 0.08, 0.35, 1); a(L(8) + D(8) * 0.2, 'boom', 0.16); scribble(L(8) + D(8) - 0.9);
// 9 · the far corner lights by itself
idle(L(9), D(9)); lab(9, 0.8); spark(L(9) + D(9) * 0.45, 0.4, 6); a(L(9) + D(9) * 0.62, 'pop', 0.25);
// 10 · the hammer blows: the real knock
knock(L(10) + 0.1, D(10) - 0.1, 3, 0.2);
// 11 · climbing a bridge: the engine pulls and it knocks
rec(L(11) - 0.1, 'engine-rev', 0.22, 1, D(11) + 0.2, 1.0, 'rev', 0.16); knock(L(11) + 0.3, D(11) - 0.3, 20, 0.14);
// 12 · the octane tag, the squeeze gauge
paper(L(12) + 0.3); lab(12, 1.0); rec(L(12) + 1.0, 'bike-pump', 1.1, 2.4, 2.4, 1.0, 'squeeze', 0.2);
// 13-14 · two engines (80 / 95, then old / modern): idling, badges and ratios land
idle(L(13), D(13) + D(14), 0.26); paper(L(13) + 0.2); paper(L(13) + 0.9); a(L(13) + 1.4, 'pop', 0.25); ding(L(14) + 0.6); ding(L(14) + D(14) * 0.5);
// 15 · the glasses: tea poured, ice clinks
a(L(15) + 0.2, 'fill', 0.14, 1.2); lab(15, 0.9); rec(L(15) + D(15) * 0.55, 'coins', 0.12, 0, 0.3, 1.0, 'clink', 0.2);
// 16 · the sensor hears the knock, the spark moves later: the knock fades out
idle(L(16), D(16), 0.25); knock(L(16) + 0.2, D(16) * 0.55, 8, 0.15); lab(16, 0.8); paper(L(16) + D(16) * 0.55);
// 17 · gauges swing; the piston holes
a(L(17) + 0.3, 'whoosh', 0.12, 1.4); knock(L(17) + D(17) * 0.48, 1.0, 25, 0.2); a(L(17) + D(17) * 0.56, 'clank', 0.35);
// 18 · 95 in a 92 engine: it runs the same, the coins fly
idle(L(18), D(18), 0.22); paper(L(18) + 0.2); paper(L(18) + D(18) * 0.3); for (let k = 0; k < 5; k++) rec(L(18) + D(18) * 0.6 + k * 0.18, 'coins', 0.32, 0, 0.5, 1.0, 'clink', 0.2);
// 19 · the myth crossed out; the two litres fill level
paper(L(19) + 0.2); scribble(L(19) + D(19) * 0.4); a(L(19) + D(19) * 0.5, 'fill', 0.12, 1.0);
// 20 · the manual, the filler door
paper(L(20) + 0.1); a(L(20) + 0.6, 'creak', 0.18); lab(20, 1.4);
// 21 · recap
scribble(L(21) + 0.5); paper(L(21) + 1.0); lab(21, D(21) * 0.55);
// 22 · the Spitfire flies past; 100 lands
rec(L(22) - 0.3, 'propeller-plane', 0.24, 1.5, D(22) + 0.3, 1.0, 'motor', 0.12); ding(L(22) + 0.6);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
