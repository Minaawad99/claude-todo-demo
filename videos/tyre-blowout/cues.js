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
// recordings sent by the channel for this episode (sfx/):
//   px-highway  «Interior car on highway with high RPM engine and road noise» (jadeallencook, Pixabay 339224), steady from 0.2 s
//   px-squeal   «Chrysler LHS tire squeal» (freesound_community, Pixabay 7154), loud squeal 4.3–7.0 s
//   px-blowout  truck tyre blast (from a YouTube short the channel sent), the bang 22.12–22.97 s
//   px-flat     «Do not drive with a flat tire» (sent by the channel), flapping 0.2–3.3 s (narration after)
//   px-air-hiss «Tire leaking sound» (sent by the channel), 0.05–3.6 s
//   px-hazard   «2020 Toyota RAV4 Turn Signal Sound» (sent by the channel), clicks 1.9–5.05 s
const CH = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (.*);/)[1]);
const LE = i => T[i].end, CT = (i, k) => T[i].start + (T[i].end - T[i].start) * (CH[i][k] || 0);
const road = (t, dur, g, from) => rec(t, 'highway', g || 0.22, from || 0.3, dur, 1.0, 'wind', 0.12);
const squeal = (t, dur, g, from) => rec(t, 'squeal', g || 0.35, from || 4.3, dur || 2.7, 1.0, 'whoosh', 0.2);
const blowout = t => rec(t - 0.04, 'blowout', 0.75, 22.12, 0.85, 1.0, 'boom', 0.55);   // the bang only: horns before it and a voice after it are left out
const flap = (t, dur, g) => { if (!has('flat')) { for (let k = 0; k * 0.11 < dur; k++) a(t + k * 0.11, 'bump', (g || 0.1) * (1 - 0.5 * k * 0.11 / dur)); return; }
  for (let k = 0; k * 3.0 < dur; k++) rec(t + k * 3.0, 'flat', (g || 0.1) * 2.6, 0.2, Math.min(3.1, dur - k * 3.0)); };   // flapping rubber 0.2–3.3 s (narration after 3.4 s left out)
const hiss = (t, dur, g) => rec(t, 'air-hiss', g || 0.3, 0.05, Math.min(3.5, dur), 1.0, 'steam', g || 0.22);
const hazard = (t, dur) => has('hazard') ? rec(t, 'hazard', 0.45, 1.9, Math.min(3.15, dur)) : (() => { for (let k = 0; k * 0.385 < dur; k++) a(t + k * 0.385, 'tick', 0.22); })();   // clicks every 0.35 s, 1.9–5.05 s
// 0–2 · hook: the highway, the blowout at 45 % of line 0, the flapping tyre; the foot goes for the brake; the car spins
road(L(0), L(3) - L(0) + 0.3, 0.26);
const BT = L(0) + (LE(0) - L(0)) * 0.45; blowout(BT); flap(BT + 0.25, L(2) - BT - 0.3, 0.1);
a(L(1) + (LE(1) - L(1)) * 0.6 + 0.3, 'thud', 0.25, 0.3);
squeal(L(2) + 0.1, D(2) + 0.2, 0.4); scribble(L(2) + 1.6);
// 4–8 · the tyre: what's inside, the air rushing out, the squashed tyre, the pull, the trolley
flap(L(4) + 0.1, D(4) - 0.3, 0.07); a(L(4) + 0.3, 'pop', 0.3);
lab(5, 0.3); lab(5, 1.0); lab(5, CT(5, 1) - L(5)); a(CT(5, 2), 'intake', 0.22, 0.9);
hiss(L(6) + 0.15, 1.6, 0.32); a(CT(6, 1) + 0.2, 'thud', 0.3, 0.4); flap(CT(6, 1) + 0.3, CT(6, 2) - CT(6, 1) - 0.4, 0.08);
road(CT(6, 2), L(9) - CT(6, 2) - 0.2, 0.14); a(CT(6, 2) + 0.5, 'pop', 0.3);
a(L(7) + 0.4, 'whoosh', 0.25, 0.6); squeal(L(7) + 0.3, 1.4, 0.18, 4.6);
a(L(8) + 0.6, 'creak', 0.16, 1.2); lab(8, 0.4);
// 9–12 · why braking is wrong: the pedal, the nose dives, the pull grows, the back goes light and spins
a(L(9) + 0.3, 'pop', 0.3);
squeal(L(10) + 0.6, 0.9, 0.22, 5.0); a(L(10) + 0.7, 'thud', 0.3, 0.4); lab(10, 1.0);
road(L(11), D(11) + D(12) - 0.2, 0.14); a(L(11) + 0.6, 'whoosh', 0.25, 0.6); squeal(L(11) + 1.4, 1.6, 0.2, 4.4);
lab(12, 0.3); squeal(L(12) + 1.1, Math.min(2.7, D(12) - 1.3), 0.4); scribble(L(12) + D(12) - 1.0);
// 13–17 · the four steps
for (let k = 0; k < 4; k++) a(CT(13, 1) + k * 0.35, 'pop', 0.32);
a(L(14) + 0.3, 'thud', 0.25, 0.3); paper(L(14) + 0.6); paper(L(14) + 1.2);
road(L(15), D(15), 0.14); scribble(L(15) + 0.9); scribble(L(15) + 1.8);
rec(L(16), 'highway', 0.2, 20, D(16), 1.0, 'wind', 0.1); a(L(16) + 0.4, 'idle', 0.12, D(16) - 0.6);
ding(CT(17, 0) + 0.8); a(CT(17, 1) + 0.3, 'thud', 0.22, 0.3); hazard(CT(17, 2) + 0.3, L(18) - CT(17, 2) - 0.5);
// 18–20 · the myth, the hot tyre, check it cold
hiss(L(18) + 0.4, D(18) - 1.4, 0.2); scribble(L(18) + D(18) - 1.0);
scribble(L(19) + 0.3); a(L(19) + 1.6, 'sizzle', 0.18, 1.6); lab(19, 0.8);
a(L(20) + 0.6, 'clink', 0.25, 0.6); paper(CT(20, 2) + 0.2);
// 21–23 · recap, the date on the sidewall, six years
for (let k = 0; k < 4; k++) a(CT(21, Math.min(k + 1, CH[21].length - 1)) - 0.05, 'pop', 0.3);
a(CT(22, 1), 'pop', 0.3); ding(CT(22, 1) + 0.2); paper(CT(22, 2)); paper(CT(22, 3));
a(L(23) + 0.8, 'creak', 0.15, 1.4); ding(L(23) + 0.4);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
