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
const CH = (i, j) => { global.window.CHUNKS = global.window.CHUNKS || JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').match(/window\.CHUNKS = (.*);/)[1]); const c = window.CHUNKS[i][j] || 0; return L(i) + (T[i].end - T[i].start) * (typeof c === 'object' ? c.f : c); };
// 0–2 · hook: the onion sits; the knife comes down (a chop), gas hisses up, a drip
a(L(0) + 1.3, 'tick', 0.2);
a(L(1) + 0.4, 'snip', 0.4); a(L(1) + 0.55, 'thud', 0.3); a(L(1) + 0.8, 'steam', 0.12, 1.6); a(L(1) + 1.6, 'drip', 0.3);
a(L(2) + 0.3, 'whoosh', 0.15);
// 4 · the onion cut, then into the cells
lab(4, 0.7); a(CH(4, 1), 'whoosh', 0.15); lab(4, CH(4, 1) - L(4) + 0.4);
// 5 · the two rooms: labels and two cards laid down
lab(5, 0.4); a(CH(5, 1) + 0.1, 'pop', 0.3); lab(5, CH(5, 1) - L(5) + 0.3); paper(CH(5, 2)); paper(CH(5, 2) + 0.3);
// 6 · the knife comes down, the wall breaks
a(L(6) + 0.5, 'whoosh', 0.2); a(L(6) + 1.3, 'snip', 0.4); a(L(6) + 1.4, 'thud', 0.3); paper(L(6) + 1.6);
// 7 · the glow stick bends and cracks, it lights up
lab(7, 0.3); a(L(7) + 1.1, 'snip', 0.35); rec(L(7) + 2.0, 'ding', 0.25, 0.1, 1.4, 1.0, 'chime', 0.25);
// 8 · the enzyme bites the molecule
a(L(8) + 0.5, 'whoosh', 0.12); a(L(8) + 1.6, 'pop', 0.4); a(L(8) + 1.7, 'snip', 0.3); lab(8, 2.2);
// 9 · the second enzyme slides in; 2002 counts up
a(L(9) + 0.3, 'whoosh', 0.15); lab(9, 1.0); paper(L(9) + 1.1); ding(CH(9, 1) + 0.9);
// 10 · gas floats off, the stopwatch
a(L(10) + 0.9, 'steam', 0.12, 1.6); lab(10, 1.7); for (let k = 0; k < 4; k++) a(CH(10, 1) + 0.2 + k * 0.25, 'tick', 0.14);
// 11–12 · the kitchen: gas rising toward your face
a(L(11) + 0.3, 'steam', 0.1, 1.5); a(L(11) + 0.6, 'pop', 0.3); lab(12, 0.6); a(CH(12, 2) + 0.1, 'whoosh', 0.18, 1.0);
// 13 · gas lands on the cornea
lab(13, 0.5); for (let k = 0; k < 3; k++) a(L(13) + 0.9 + k * 0.6, 'pop', 0.18); lab(13, CH(13, 1) - L(13) + 0.4);
// 14 · the gate opens, the signal runs
lab(14, 0.3); a(L(14) + 1.1, 'pop', 0.4); a(L(14) + 1.3, 'zap', 0.2); paper(CH(14, 0) + 0.2);
// 15 · brain → gland → tears
a(L(15) + 0.4, 'zap', 0.15); lab(15, 0.6); a(CH(15, 1) + 0.1, 'pop', 0.3); lab(15, CH(15, 1) - L(15) + 0.4); a(CH(15, 1) + 0.6, 'drip', 0.3); a(CH(15, 1) + 1.4, 'drip', 0.25);
// 16 · the smoke alarm beeps, the sprinkler sprays
for (let k = 0; k < 3; k++) a(L(16) + 1.0 + k * 0.5, 'beep', 0.18);
rec(L(16) + 1.3, 'water-rush', 0.22, 3, D(16) - 1.3, 1.0, 'slosh', 0.2); lab(16, 0.3); lab(16, 1.4);
// 17 · the onion in the ground
rec(L(17), 'wind-gust', 0.18, 0.25, 2.0, 1.0, 'wind', 0.15); paper(CH(17, 1));
// 18 · the beetle scuttles in, the spray, it runs off
for (let k = 0; k < 5; k++) a(L(18) + 0.1 + k * 0.18, 'tick', 0.1); a(L(18) + 1.2, 'steam', 0.18, 1.0); a(L(18) + 2.1, 'whoosh', 0.18);
// 19 · the myth crossed out
paper(L(19) + 0.3); scribble(CH(19, 1) + 0.1);
// 20 · the gate fires; the tears wash it away
scribble(L(20) + 0.4); rec(CH(20, 1), 'water-rush', 0.22, 3, 1.6, 1.0, 'slosh', 0.2); paper(CH(20, 1) + 0.4);
// 21 · the fridge: cold, the thermometer drops
a(L(21) + 0.3, 'thud', 0.2); lab(21, 1.0); a(L(21) + 1.2, 'whoosh', 0.1, 1.2); a(CH(21, 2), 'pop', 0.3);
// 22 · two knives: clean cut ✓, crushing ✗; then the root
a(L(22) + 0.3, 'whoosh', 0.18); scribble(L(22) + 1.4); a(CH(22, 1) + 0.2, 'pop', 0.3); paper(CH(22, 1) + 0.6);
// 23 · the recap, one station per chunk
for (let j = 0; j < 4; j++) a(CH(23, j) + 0.12, 'pop', 0.32);
// 24 · the tearless onion: LFS crossed out, a tick
paper(L(24) + 0.4); scribble(CH(24, 1) + 0.2); a(CH(24, 1) + 0.9, 'ping', 0.25);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
