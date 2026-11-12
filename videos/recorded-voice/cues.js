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
// No recorded clips unless the user asks (CLAUDE.md): only sfx.py's synthesized effects and its generated music bed.
// RECORDED = true turns the Pixabay kit and the recorded music back on; ask the user first.
const RECORDED = false;
// The user asked for these few recorded sounds for this episode (sent by them, put in sfx/px-<name>.mp3 or .wav);
// everything else stays synthesized. A missing one falls back to its synthesized stand-in.
const ASKED = ['crunch', 'piano', 'rec-beep', 'muffled'];
const has = n => (RECORDED || ASKED.includes(n)) && !!where(n);
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
// buzz: a short low hum for the vocal cords; ripple: rising pops for sound reaching the ear
const buzz = (t, d, g) => a(t, 'hum', g || 0.12, d || 1.2);
// 0 · your own voice: a soft hum while the head speaks, rings opening
buzz(L(0) + 0.3, D(0) - 0.4, 0.1); a(L(0) + 0.6, 'whoosh', 0.1, 1.2);
// 1 · the voice note: the record beep, then «ده مش أنا!» lands
rec(L(1) + 0.15, 'rec-beep', 0.3, 0, 0.5, 1.0, 'ping', 0.25); a(L(1) + 1.3, 'pop', 0.4);
// 2 · your friends: air to the ear, the tick
a(L(2) + 0.3, 'whoosh', 0.1, 1.0); scribble(L(2) + 0.9);
// 4 · the vocal cords tremble, air rises
buzz(L(4) + 0.2, D(4) - 0.4, 0.14); lab(4, 0.6); lab(4, 2.4);
// 5 · the ear: the tremble goes in, the cochlea, the signal to the brain
for (let k = 0; k < 4; k++) a(L(5) + 0.3 + k * 0.25, 'tick', 0.12); lab(5, 0.5); a(L(5) + 2.1, 'chime', 0.2);
// 6–7 · one way: through the air
a(L(6) + 0.4, 'whoosh', 0.14, 1.2); paper(L(6) + 1.6); a(L(7) + 0.3, 'whoosh', 0.12, 1.4); lab(7, 0.4); lab(7, 1.0);
// 8–9 · two ways at once: air (whoosh) and bone (low thud)
a(L(8) + 0.3, 'whoosh', 0.12, 1.2); a(L(8) + 1.6, 'thud', 0.18); paper(L(8) + 1.0);
lab(9, 0.3); a(L(9) + 1.5, 'thud', 0.18); lab(9, 1.5);
// 10 · through the bone: the skull talks, low thuds travel
for (let k = 0; k < 3; k++) a(L(10) + 0.3 + k * 0.5, 'thud', 0.14); lab(10, 0.4); lab(10, 1.2);
// 11 · thick passes, thin fades
buzz(L(11) + 0.5, 2.2, 0.12); a(L(11) + 2.0, 'whoosh', 0.08, 1.0);
// 12 · deeper: a low hum swells
buzz(L(12) + 0.2, D(12) - 0.3, 0.16); paper(L(12) + 0.6);
// 13 · crisps: the crunch (recorded if the user sent it), loud inside
rec(L(13) + 0.25, 'crunch', 0.45, 0, 0.9, 1.0, 'snip', 0.35); rec(L(13) + 1.4, 'crunch', 0.3, 1.2, 0.7, 1.0, 'snip', 0.25); lab(13, 0.4);
// 14 · fingers in the ears: the world goes muffled, the voice inside stays
scribble(L(14) + 0.5); rec(L(14) + 0.9, 'muffled', 0.22, 1.09, Math.min(2.5, D(14) - 1), 1.0, 'hum', 0.12); lab(14, 1.4); paper(L(14) + 2.6);
// 15 · the tiny muscle pulls
a(L(15) + 0.4, 'creak', 0.12, 0.6); lab(15, 0.5);
// 16–17 · the phone's mic: air only; the thick part drops out
a(L(16) + 0.3, 'whoosh', 0.12, 1.0); lab(16, 0.5); paper(L(16) + 1.6);
a(L(17) + 0.6, 'whoosh', 0.1, 1.4); paper(L(17) + 2.2);
// 18 · the myth crossed out
scribble(L(18) + D(18) - 1.1);
// 19 · that's your voice ✓
a(L(19) + 0.6, 'chime', 0.22); scribble(L(19) + 0.6);
// 20–21 · used to it; the mirror and the photo
paper(L(20) + 0.4); lab(21, 0.3); lab(21, 1.0);
// 22 · recap
lab(22, 0.3); lab(22, 1.0); a(L(22) + 2.6, 'pop', 0.3);
// 23 · Beethoven: a piano note (recorded if sent), the rod hums into the bone
rec(L(23) + 0.2, 'piano', 0.35, 0.03, 2.4, 1.0, 'chime', 0.25); lab(23, 1.2); a(L(23) + 1.6, 'thud', 0.14); lab(23, 2.6);

const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log('asked clips here: ' + ASKED.filter(has).join(', ')); console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
