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
const PROMISE = T.findIndex(l => (l.text.includes('إيه الحكاية') && l.text.includes('هشرح')) || /here's the thing.*explain/i.test(l.text));
const SUMMARY = T.findIndex(l => l.text.startsWith('ودي كانت') || l.text.startsWith("And that's the thing")), ASK = T.length - 1;
a(L(0) + 0.1, 'chime', 0.3);                                                                            // the hook card opens
a(L(PROMISE) + 0.15, 'ping', 0.3); for (let k = 0; k < 5; k++) a(L(PROMISE) + 0.4 + k * 0.32, 'tick', 0.14);   // bumper: the stopwatch
for (let i = PROMISE + 1; i < SUMMARY; i++) swipe(i);                                                   // one flip per shot change
a(L(SUMMARY) + 0.1, 'chime', 0.35); for (let k = 0; k < 5; k++) a(L(SUMMARY) + 0.3 + k * 0.15, 'tick', 0.16);   // summary card builds
paper(L(ASK) + 0.1); a(L(ASK) + 0.3, 'pop', 0.4);                                                       // ask box

// ── this episode: one or two sounds per line, matched to what moves (see videos/tides/cues.js) ──
// «الفرامل بتوقف العربية إزاي؟»: all synthesized stand-ins plus the kit; no one-off clips.
a(L(0) + 0.2, 'idle', 0.1, L(3) - L(0) - 0.3);                               // the car driving on the hook card
ding(L(0) + 1.4); a(L(1) + 0.3, 'thud', 0.2); a(L(2) + 0.3, 'pop', 0.25);    // 1.5 t, the foot, the pad card
paper(L(4) + 0.2); a(L(4) + 1.0, 'slosh', 0.15);                             // the rule card
a(L(5) + 0.5, 'squeeze', 0.25, 1.2); for (let k = 0; k < 4; k++) a(L(5) + D(5) * 0.5 + k * 0.12, 'tick', 0.16); lab(5, D(5) * 0.62);
a(L(6) + 0.5, 'creak', 0.18); lab(6, D(6) * 0.22); lab(6, D(6) * 0.3); a(L(6) + D(6) * 0.5, 'creak', 0.18); ding(L(6) + D(6) * 0.72);
a(L(7) + 0.6, 'vac', 0.2, D(7) - 0.8); a(L(7) + 1.3, 'thud', 0.2);            // the servo's suction
a(L(8) + D(8) * 0.22, 'squeeze', 0.25, 1.0); lab(8, D(8) * 0.25); lab(8, D(8) * 0.36); rec(L(8) + D(8) * 0.55, 'water-rush', 0.12, 3, D(8) * 0.45, 1.0, 'fill', 0.12);
a(L(9) + 0.5, 'squeeze', 0.22, 1.4); a(L(9) + 1.2, 'whoosh', 0.16); lab(9, D(9) * 0.4);
for (let k = 0; k < 3; k++) a(L(10) + 0.3 + k * 0.52, 'creak', 0.2);         // pumping the jack
a(L(11) + 0.5, 'thud', 0.2); ding(L(11) + D(11) * 0.62);                     // 20 kg in, more than a ton out
a(L(12) + 0.2, 'spin', 0.14, D(12) * 0.5); a(L(12) + D(12) * 0.35, 'clank', 0.22); lab(12, D(12) * 0.4); lab(12, D(12) * 0.62);
a(L(13) + 0.7, 'clank', 0.2); a(L(13) + 0.9, 'sizzle', 0.2, 2.2); lab(13, 1.0); lab(13, 1.3); a(L(13) + D(13) * 0.62, 'pop', 0.22);
a(L(14) + 0.2, 'idle', 0.12, 1.2); a(L(14) + 0.9, 'sizzle', 0.22, D(14) - 1.2);   // the car slowing, heat building
a(L(15) + 0.4, 'steam', 0.2, 1.6); a(L(15) + 0.8, 'fizz', 0.18, D(15) - 1.0); ding(L(15) + D(15) * 0.55);
rec(L(16) + 0.5, 'wind-gust', 0.2, 0.25, D(16) - 0.6, 1.0, 'wind', 0.16); lab(16, 0.6);
a(L(17) + 0.2, 'idle', 0.1, D(17) - 0.4); scribble(L(17) + D(17) * 0.78);    // the myth crossed out
a(L(18) + 0.4, 'thud', 0.18); lab(18, 0.5); a(L(18) + D(18) * 0.4, 'whoosh', 0.18); lab(18, D(18) * 0.5);
a(L(19) + 0.3, 'spray', 0.28, 2.2); a(L(19) + D(19) * 0.45, 'creak', 0.18); scribble(L(19) + D(19) * 0.72);   // the skid
for (let k = 0; k < 8; k++) a(L(20) + D(20) * 0.3 + k * 0.2, 'tick', 0.16); lab(20, D(20) * 0.45); lab(20, D(20) * 0.6);
a(L(21) + 0.4, 'beep', 0.14); a(L(21) + D(21) * 0.3, 'squeeze', 0.2, 0.8); a(L(21) + D(21) * 0.7, 'squeeze', 0.2, 0.8);
for (let k = 0; k < 15; k++) a(L(22) + 0.4 + k / 15, 'tick', 0.2); a(L(22) + D(22) * 0.55, 'motor', 0.14, D(22) * 0.4);   // 15 pulses in one second
for (let k = 0; k < 4; k++) a(L(23) + [0.2, D(23) * 0.3, D(23) * 0.5, D(23) * 0.76][k], 'tick', 0.22);   // recap: 1 2 3 4
a(L(24) + 0.5, 'spray', 0.2, 2.2); ding(L(24) + D(24) * 0.6);

const USE_MUSIC = false;   // the user asked (Nov 2026): no music bed; the video's own sound effects carry it. Set true to bring the music back.
const MUSIC = USE_MUSIC && has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
