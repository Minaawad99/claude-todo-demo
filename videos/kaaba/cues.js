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

// ── «الكعبة من جوة»: 3D film, no hook card or bumper; a flip on each camera move, a paper slide when a real card comes up ──
const CARDS = JSON.parse(fs.readFileSync(__dirname + '/film/cards.js', 'utf8').replace(/^window.CARDS = /, '').replace(/;\s*$/, ''));
a(L(0) + 0.05, 'chime', 0.25);
[3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 20, 22, 23, 26, 27, 29, 31].forEach(swipe);
CARDS.forEach(k => paper(k.a + 0.02));
// the washing in the hook: cloth on the pillar
for (let k = 0; k < 3; k++) a(L(0) + 0.3 + k * 0.6, 'wipe', 0.18);
ding(L(5) + 1.2); ding(L(7) + 0.8); ding(L(13) + 0.3); ding(L(19) + 0.2); ding(L(33) + 3.0);
scribble(L(9) + 0.2); scribble(L(25) + 0.1); scribble(L(28) + 0.1);
a(L(16) - 0.05, 'creak', 0.28, 1.6);                                    // Bab al-Tawba swings open
a(L(20) + 0.2, 'clink', 0.35); a(L(20) + 1.4, 'clink', 0.25);           // the key
a(L(22) + 0.2, 'clank', 0.3); for (let k = 0; k < 8; k++) a(L(22) + 0.5 + k * 0.5, 'thud', 0.08);   // the door, footsteps
a(L(23) + 0.1, 'slosh', 0.3); a(L(24) + 0.4, 'fill', 0.32, 2.6);        // the vessels, rose water poured into Zamzam
a(L(26) + 0.1, 'spray', 0.22, 2.2); for (let k = 0; k < 6; k++) a(L(26) + 2.3 + k * 0.33, 'drip', 0.18);
rec(L(26), 'water-rush', 0.08, 3, D(26) + 0.4, 1.0, 'fill', 0.06);
for (let k = 0; k < 9; k++) a(L(27) + 0.2 + k * 0.75, 'wipe', 0.16);   // cloths on the walls
for (let k = 0; k < 3; k++) a(L(28) + 2.0 + k * 0.5, 'wipe', 0.16);
a(L(29) + 0.3, 'steam', 0.14, 3.2);                                     // incense
a(L(32) - 0.1, 'whoosh', 0.25); a(L(34) - 0.1, 'whoosh', 0.25);         // to the museum and back
paper(L(35) + 0.1); a(L(35) + 0.3, 'pop', 0.4);                         // ask box

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
