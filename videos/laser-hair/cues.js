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
// chunk start times (the shots start on caption chunks), from the built page
const CH = JSON.parse(fs.readFileSync(__dirname + '/sketch/scenes.js', 'utf8').split('\n')[0].replace(/^window\.CHUNKS = /, '').replace(/;$/, ''));
const C = (i, j) => T[i].start + (T[i].end - T[i].start) * CH[i][j];
const zap = (t, g) => a(t, 'laser', g || 0.16);             // the handpiece fires (soft, under the voice)
const heat = (t, d, g) => a(t, 'sizzle', g || 0.1, d);       // heat in the hair
const fly = t => a(t, 'whoosh', 0.1, 1.6);                   // the camera flies in or out
const pop = (t, g) => a(t, 'pop', g || 0.3);
// 0–2 · hook card: the handpiece on her leg, her surprise, the calendar, hairs falling
zap(L(0) + 0.4); zap(L(0) + 1.1); pop(L(1) + 0.1, 0.35); paper(L(2) + 0.05); a(L(2) + 0.6, 'whoosh', 0.12, 1.2);
// 4 · the question
zap(L(4) + 0.3); pop(L(4) + 0.6, 0.3);
// 5 · the pulse into the skin; the blinking eye
zap(L(5) + 0.35); zap(C(5, 1) + 0.1); pop(C(5, 2) + 0.1, 0.3);
// 6 · the light goes down, the fly in, melanin lights up and is named
a(L(6) + 0.1, 'charge', 0.08, 0.8); fly(C(6, 2)); lab(6, C(6, 5) - L(6) + 0.2); ding(C(6, 5) + 0.3);
// 7 · it drinks the light, turns it to heat
heat(C(7, 1), 1.4); lab(7, C(7, 1) - L(7) + 0.4);
// 8 · the blouses in the sun, the thermometer climbs
pop(L(8) + 0.2, 0.25); a(L(8) + 0.6, 'fill', 0.08, 1.4); pop(C(8, 1) + 0.15, 0.3);
// 9 · heat runs down the hair, fly to the bulb
heat(L(9), D(9) * 0.7, 0.09); fly(C(9, 2));
// 10 · the factory tag, the depth, the hair growing
paper(L(10) + 0.3); fly(C(10, 1)); lab(10, C(10, 1) - L(10) + 0.6); a(C(10, 3) + 0.2, 'whoosh', 0.08, 0.8);
// 11 · the cells hurt, weakened, crossed
fly(L(11)); heat(L(11) + 0.4, 1.2, 0.1); pop(C(11, 2) + 0.1, 0.3); scribble(C(11, 2) + 0.8);
// 12–13 · why doesn't it fall: back out; the skin pushes it out; 1–3 weeks
fly(L(12)); pop(L(12) + 1.2, 0.3); lab(13, 0.2); paper(C(13, 2) + 0.1); a(C(13, 2) + 0.4, 'whoosh', 0.12, 1.4);
// 14 · how many sessions: six numbers pop
for (let k = 0; k < 6; k++) pop(L(14) + 0.2 + k * 0.12, 0.22);
// 15–16 · three phases, named in turn
a(L(15) + 0.1, 'whoosh', 0.1); for (let j = 0; j < 3; j++) pop(C(16, j) + 0.05, 0.3);
// 17 · the growing hair heats hardest; fly in to its bulb
zap(L(17) + 0.5); heat(L(17) + 0.6, 1.6, 0.09); fly(C(17, 3)); lab(17, C(17, 3) - L(17) + 1.6);
// 18 · weeks pass, the sleeping one wakes, session 2
fly(L(18)); paper(L(18) + 1.2); a(C(18, 2) + 0.1, 'whoosh', 0.1, 0.9); pop(C(18, 3) + 0.1, 0.3); zap(C(18, 3) + 0.3);
// 19 · dark hair, light skin ✓
zap(L(19) + 0.2); pop(L(19) + 1.0, 0.25); pop(L(19) + 1.6, 0.25); scribble(L(19) + 2.2);
// 20 · dark skin, a longer wave
pop(C(20, 1) + 0.1, 0.3); zap(C(20, 1) + 0.3, 0.14); heat(C(20, 1) + 0.6, 1.5, 0.08); lab(20, C(20, 4) - L(20) + 0.1);
// 21 · «for ever»? No.
pop(C(21, 2) + 0.05, 0.3); scribble(C(21, 2) + 0.5);
// 22 · fewer, finer: before / after
a(L(22) + 0.3, 'whoosh', 0.08, 1.2); pop(C(22, 1) + 0.2, 0.3); pop(L(22) + 1.4, 0.25);
// 23 · recap: numbered 1–4
fly(L(23)); pop(C(23, 1), 0.3); pop(C(23, 1) + 0.6, 0.3); pop(C(23, 2), 0.3); pop(C(23, 2) + 0.6, 0.3);
// 24 · white hair: the light goes straight through, ✗
fly(L(24)); zap(C(24, 3) + 0.2); lab(24, C(24, 3) - L(24) + 0.2); scribble(C(24, 3) + 0.9);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
