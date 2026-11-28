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
const fly = t => a(t, 'whoosh', 0.1, 1.6);                   // the camera flies in or out
const pop = (t, g) => a(t, 'pop', g || 0.3);
const brush = (t, d, g, r) => a(t, 'brush', g || 0.12, d || 1.4);   // a toothbrush scrubbing, under the voice
const tick = (t, n, g) => { for (let k = 0; k < n; k++) a(t + k * 0.5, 'tick', g || 0.12); };
// 0–2 · hook card: brushing at the mirror, the smile yellowing, «2×» crossed, «إزاي؟»
brush(L(0) + 0.2, 1.4, 0.13); pop(L(1) + 0.15, 0.3); a(L(1) + 0.5, 'fill', 0.05, 1.8); paper(L(2) + 0.05); scribble(L(2) + 1.6); pop(L(2) + 2.4, 0.3);
// 4 · the cut tooth draws in; two numbered layers; «قاعدة»
a(L(4) + 0.1, 'whoosh', 0.1, 1.0); pop(C(4, 2) + 0.15, 0.25); pop(C(4, 2) + 0.55, 0.25); paper(C(4, 3) + 0.1);
// 5 · fly to the crown, the enamel named, «stronger than bone»
fly(L(5)); pop(C(5, 1) + 0.15, 0.25); lab(5, C(5, 2) - L(5) + 0.2); paper(C(5, 3) + 0.2);
// 6 · the dentin glows and is named
a(L(6) + 0.1, 'charge', 0.06, 0.8); lab(6, C(6, 2) - L(6) + 0.2); ding(C(6, 2) + 0.4);
// 7 · the enamel thins; fly out; the tooth outside turns yellow
a(L(7) + 0.2, 'wipe', 0.15); fly(C(7, 1)); pop(C(7, 1) + 0.15, 0.25); a(C(7, 1) + 0.6, 'fill', 0.05, 1.4);
// 8 · the question; mistake 1 at the mirror; the juice
pop(L(8) + 0.35, 0.3); paper(C(8, 2) + 0.1); brush(C(8, 2) + 0.3, 1.2, 0.1); pop(C(8, 4) + 0.05, 0.3);
// 9 · the juice poured on the tooth; it softens (acid bubbles)
fly(L(9)); a(L(9) + 0.3, 'pour', 0.18, 1.4); a(C(9, 1), 'fizz', 0.08, 1.4); lab(9, C(9, 1) - L(9) + 0.2); a(C(9, 2) + 0.1, 'tick', 0.12);
// 10 · scrubbing it while soft: bits come off
brush(L(10), D(10), 0.16); lab(10, C(10, 2) - L(10) + 0.1);
// 11 · the wet wall wiped
a(L(11) + 0.2, 'wipe', 0.2); a(L(11) + 0.6, 'wipe', 0.15);
// 12 · ✓ rinse with water; wait; 30–60
scribble(L(12) + 0.1); a(L(12) + 0.4, 'slosh', 0.12, 1.0); tick(C(12, 1), 4, 0.12); ding(C(12, 2) + 0.15);
// 13 · mistake 2: scrubbing hard; fly to the mouth
paper(L(13) + 0.1); brush(L(13) + 0.2, D(13) + 0.4, 0.2); fly(C(13, 1));
// 14 · sandpaper on the painted door; the press arrow
a(L(14) + 0.1, 'sand', 0.16, D(14) - 0.3); pop(C(14, 2) + 0.15, 0.25);
// 15 · fly to the neck; the notch; the gum pulls down
fly(L(15)); a(L(15) + 0.5, 'sand', 0.08, 1.4); paper(C(15, 1) + 0.15); a(C(15, 2) + 0.2, 'whoosh', 0.08, 0.8);
// 16 · ✓ soft brush at 45°; small strokes; two minutes
fly(L(16)); scribble(L(16) + 0.3); lab(16, C(16, 1) - L(16) + 0.2); ding(C(16, 1) + 0.5); brush(C(16, 3), 1.4, 0.1); fly(C(16, 4)); pop(C(16, 4) + 0.4, 0.25); tick(C(16, 4) + 0.6, 3, 0.1);
// 17 · mistake 3 teased; «كل يوم»; fly to his face
paper(L(17) + 0.1); pop(L(17) + 0.35, 0.3); pop(C(17, 2) + 0.15, 0.25); fly(C(17, 3));
// 18 · the bio pill
a(L(18) + 0.35, 'notify', 0.3);
// 19 · mistake 3: rinsing with a glass of water
paper(L(19) + 0.1); a(L(19) + 0.5, 'slosh', 0.16, 1.4); fly(C(19, 1)); a(C(19, 1) + 0.4, 'slosh', 0.12, 1.2);
// 20 · the question; fluoride settles on the enamel
pop(L(20) + 0.25, 0.3); a(C(20, 1) + 0.3, 'toner', 0.12, 1.2); fly(C(20, 2)); lab(20, C(20, 2) - L(20) + 0.6);
// 21 · the water washes it off; ✗ the glass; «spit» ✓
a(L(21) + 0.1, 'fill', 0.12, D(21) * 0.45); fly(C(21, 2)); scribble(C(21, 2) + 0.5); a(C(21, 3) + 0.05, 'spit', 0.35); scribble(C(21, 3) + 0.35);
// 22 · mistake 4: lemon, charcoal, soda; the lemon softens; charcoal sands
paper(L(22) + 0.1); pop(L(22) + 0.3, 0.25); pop(L(22) + 0.7, 0.25); pop(L(22) + 1.0, 0.25); a(C(22, 2) + 0.3, 'fizz', 0.09, 1.4); brush(C(22, 4), 1.6, 0.14);
// 23 · the yellowish smile; «مش نضيفة؟» ✗; the shade tabs ✓
pop(C(23, 2) + 0.1, 0.3); scribble(C(23, 3) + 0.1); for (let k = 0; k < 6; k++) a(C(23, 4) + k * 0.2, 'tick', 0.12); scribble(C(23, 4) + 1.0);
// 24 · recap: the head tag, then 1–4
paper(L(24) + 0.1); for (let j = 1; j <= 4; j++) pop(C(24, j) + 0.05, 0.3);
// 25 · enamel crystals vs living bone cells; ✗; the enamel thins; «مابترجعش»
pop(L(25) + 0.15, 0.25); pop(L(25) + 0.85, 0.25); scribble(C(25, 1) + 0.3); a(C(25, 2) + 0.2, 'wipe', 0.15); paper(C(25, 4) + 0.1);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
