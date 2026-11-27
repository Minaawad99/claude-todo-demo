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
const CH = (i, j) => { const c = [0, .25, .5, .75, .9]; return L(i) + D(i) * (CHK[i] ? CHK[i][j] : c[j]); };
const CHK = JSON.parse(require('fs').readFileSync(__dirname + '/chunks.json', 'utf8'));
lab(4, 0.5); ding(CH(5, 2) + 1.0); lab(5, 0.8);                              // the rule; the thermometer drops, «−1°»
lab(7, 0.3); lab(7, D(7) * .5);                                               // hands, feet
lab(8, 0.6); a(CH(8, 1) + 0.2, 'whoosh', 0.15); lab(8, D(8) * .6);           // the vessels open
lab(9, 0.5); a(CH(9, 3) + 0.2, 'whoosh', 0.18);                               // the radiator blows the heat out
rec(CH(11, 0) + 0.2, 'wind-gust', 0.18, 0.25, 1.6, 1.0, 'whoosh', 0.15);     // a cold foot
scribble(CH(11, 2) + 0.9); a(CH(11, 1) + 0.6, 'tick', 0.2);                  // closed, trapped ✗
rec(L(12) + 0.15, 'paper', 0.35, 0, 0.5, 1.0, 'paper', 0.3); scribble(CH(12, 2) + 0.5);   // the sock slides on, ✓
a(CH(13, 2) + 0.15, 'chime', 0.22);                                           // «يلا ننام»
drone(L(14), CH(14, 2) - L(14));                                               // the globe
ding(CH(15, 1) + 0.4); ding(CH(15, 3) + 0.4); ding(CH(15, 5) + 0.4);          // the three numbers land
rec(CH(17, 0), 'clock-ticking', 0.18, 0, 1.6, 1.0, 'tick', 0.15); lab(17, D(17) * .25); lab(17, D(17) * .5); ding(CH(17, 3) + 0.4); scribble(CH(17, 4) + 0.5);
scribble(CH(18, 3) + 0.05);                                                    // «لأ» ✗
a(CH(19, 2) + 0.15, 'whoosh', 0.18); lab(19, D(19) * .7);   // the door opens
scribble(CH(20, 1) + 0.5); scribble(CH(20, 3) + 0.5);                          // ✓ loose, ✗ tight
lab(21, D(21) * .25); lab(21, D(21) * .6); lab(21, D(21) * .85);              // recap callouts
rec(L(22) + 0.1, 'clock-ticking', 0.16, 0, 2.2, 1.0, 'tick', 0.12); lab(22, D(22) * .3); ding(CH(22, 3) + 1.0);   // the 24-hour line


// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
