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

// ── this episode (locked style: sparse, on-topic foley; see videos/sleeve/cues.js) ──
const CH = [[0.0], [0.0, 0.5179], [0.0, 0.6667], [0.0, 0.4194], [0.0, 0.3263, 0.5158, 0.7684], [0.0, 0.6962], [0.0, 0.2267, 0.8667], [0.0, 0.4286], [0.0, 0.4265], [0.0, 0.6667], [0.0, 0.2931, 0.6552], [0.0, 0.507, 0.7606], [0.0], [0.0, 0.2727, 0.6545], [0.0, 0.1818, 0.6667], [0.0, 0.1667, 0.5833], [0.0, 0.5636], [0.0], [0.0, 0.1429, 0.3377, 0.7143], [0.0, 0.7241], [0.0, 0.5172], [0.0, 0.4154, 0.8308], [0.0], [0.0, 0.4894], [0.0, 0.1829, 0.3049, 0.5854], [0.0, 0.3542, 0.6562], [0.0], [0.0]];
const cf = (i, k) => (T[i].end - T[i].start) * (CH[i][k] || 0), at = (i, k, dt) => L(i) + cf(i, k) + (dt || 0);
const bell = (t, fr, g) => c.push({ t: +t.toFixed(2), fx: 'bell', gain: g, f: fr });
rec(at(18, 3) - 0.08, 'swipe', 0.28, 0.6, 0.42, 1.0, 'whoosh', 0.2);
// 0–2 · hook: food going down, the route skipping the stomach (✗), the stomach still there
a(L(0) + 0.3, 'drip', 0.25); scribble(L(1) + 0.6); ding(L(1) + 1.8); a(L(2) + 0.4, 'tick', 0.2);
// 4 · the normal route, 6 m
lab(4, cf(4, 1)); lab(4, cf(4, 1) + 0.7); a(L(4) + 0.4, 'slosh', 0.12, 2.5); ding(at(4, 3, 0.3));
// 5 · bile and pancreatic juice running in
lab(5, 0.2); a(L(5) + 0.5, 'drip', 0.25); a(L(5) + 0.9, 'drip', 0.2); lab(5, 1.6); a(L(5) + 1.7, 'drip', 0.2);
// 6 · the stapler closes the pouch; the egg
for (let k = 0; k < 3; k++) a(L(6) + 1.0 + k * 0.65, 'staple', 0.32); lab(6, 2.6); a(at(6, 2), 'pop', 0.2);
// 7 · it fills: 30 ml; two spoons
a(L(7) + 0.3, 'fill', 0.16, 1.5); ding(L(7) + 0.45); a(at(7, 1), 'clink', 0.16, 0.6); a(at(7, 1, 0.25), 'clink', 0.13, 0.6);
// 8 · the cut, then the limb is pulled up and joined
a(L(8) + 0.55, 'snip', 0.4); a(at(8, 1), 'whoosh', 0.16, 1.6); lab(8, D(8) - 0.9);
// 9 · food takes the detour
a(L(9) + 0.2, 'slosh', 0.14, 2.0); a(at(9, 1), 'pop', 0.2);
// 10 · the rest of the stomach: closed, still making juice
lab(10, 0.3); a(at(10, 1, 0.5), 'thud', 0.18); a(at(10, 2), 'fill', 0.12, 1.2);
// 11 · the juice takes the old road to the second join
a(L(11) + 0.2, 'drip', 0.22); a(L(11) + 0.6, 'drip', 0.18); lab(11, 0.8); ding(at(11, 2));
// 12 · the Y draws
a(L(12) + 0.1, 'whoosh', 0.16, 1.0); a(L(12) + 0.7, 'pop', 0.22);
// 13–15 · three reasons: a climbing note for each chip
bell(at(13, 1), 1047, 0.16); for (let k = 0; k < 3; k++) a(at(13, 1, 0.3 + k * 0.5), 'drip', 0.2);
bell(L(14) + 0.05, 1175, 0.16); a(at(14, 2), 'whoosh', 0.12);
bell(L(15) + 0.05, 1319, 0.16); for (let k = 0; k < 4; k++) a(at(15, 2, k * 0.22), 'tick', 0.14); a(at(15, 2, 1.2), 'tick', 0.2);
// 16–17 · sugar drops in days; the weight number
a(L(16) + 0.3, 'whoosh', 0.1, 2.0); ding(L(16) + 1.2); ding(L(17) + 0.3);
// 18 · sugar rushes down; dizzy, sweating, heart pounding
a(at(18, 1), 'fill', 0.2, 1.2); for (let k = 0; k < 3; k++) a(at(18, 3, 0.3 + k * 0.55), 'heart', 0.42);
// 19 · pills; the three boxes
a(L(19) + 0.15, 'rattle', 0.25); for (let k = 0; k < 3; k++) a(L(19) + 0.4 + k * 0.45, 'tick', 0.18);
// 20 · the ulcer; smoking and painkillers crossed out
lab(20, 0.8); scribble(at(20, 1, 0.3)); scribble(at(20, 1, 1.0));
// 21 · the mini: one join
a(L(21) + 0.3, 'pop', 0.2); lab(21, cf(21, 1)); a(at(21, 1, 0.9), 'slosh', 0.12, 1.2);
// 22–23 · the myth crossed out; nothing removed
scribble(L(22) + 1.0); a(L(23) + 0.3, 'tick', 0.2); a(at(23, 1), 'slosh', 0.12, 1.4);
// 24 · recap: four soft notes
[1047, 1175, 1319, 1568].forEach((fr, k) => bell(at(24, k + 1), fr, 0.14));
// 25 · 1966; the ulcer cut; the scale
ding(L(25) + 0.6); a(at(25, 2, 0.2), 'snip', 0.3); a(at(25, 2, 1.4), 'pop', 0.2);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
