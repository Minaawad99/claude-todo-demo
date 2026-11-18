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
// 0-2 · the station: the pump running, a beep per grade lighting up, a pop on «أقوى؟», the ✗
rec(L(0) + 0.2, 'fuel-pump', 0.4, 6, L(3) - L(0) - 0.3, 1.0, 'hum', 0.1);
for (let k = 0; k < 3; k++) a(L(0) + 0.8 + k * 0.85, 'beep', 0.16);
a(L(1) + 0.1, 'pop', 0.3); scribble(L(2) + 0.5);
// 4-5 · the rule card, then the bike pump strokes
paper(L(4) + 0.3); lab(4, 0.6);
rec(L(5) + 0.1, 'bike-pump', 1.4, 0.4, D(5) - 0.1, 1.0, 'squeeze', 0.25); lab(5, 0.6);
// 6 · the engine starts and idles; the piston squeezes the mix, 1/10 lands
rec(L(6), 'engine-start', 0.34, 0, 3.4, 1.0, 'rev', 0.15); idle(L(6) + 3.2, D(6) - 3.2); lab(6, 0.3); ding(L(6) + D(6) - 1.3);
// 7 · the spark plug fires
idle(L(7), D(7)); lab(7, 0.3); for (let k = 0; k < 3; k++) spark(L(7) + D(7) * 0.45 + k * 0.35, 0.3, 1 + k * 2);
// 8 · the flame spreads and pushes the piston down: a soft boom, then the ✓
idle(L(8), D(8)); a(L(8) + 0.2, 'boom', 0.18); scribble(L(8) + D(8) - 1);
// 9 · the far corner lights by itself
idle(L(9), D(9)); lab(9, 1.0); spark(L(9) + D(9) * 0.6, 0.4, 6); a(L(9) + D(9) * 0.65, 'pop', 0.25);
// 10 · two flames crash: the real knock
knock(L(10) + 0.2, D(10) - 0.2, 3, 0.2);
// 11 · uphill: the engine pulls under load, and it knocks
rec(L(11) - 0.1, 'engine-rev', 0.22, 1, D(11) + 0.2, 1.0, 'rev', 0.16); knock(L(11) + 0.3, D(11) - 0.3, 20, 0.14);
// 12-13 · the octane tag, the gauge (a pump stroke), the bars growing
paper(L(12) + 0.3); lab(12, 1.0); rec(L(12) + 1.0, 'bike-pump', 1.1, 2.4, 2.4, 1.0, 'squeeze', 0.2);
for (let k = 0; k < 3; k++) { a(L(13) + 0.2 + k * 0.7, 'whoosh', 0.1); lab(13, 0.9 + k * 0.7); }
// 14-15 · two engines idling; the tags, the ✓ and the numbers
idle(L(14), D(14) + D(15), 0.28); ding(L(14) + 0.6); lab(15, 0.4); scribble(L(15) + 0.8); ding(L(15) + D(15) * 0.45);
// 16 · the manual, the filler door opening
paper(L(16) + 0.1); a(L(16) + 0.7, 'creak', 0.18); lab(16, 1.4);
// 17 · the sensor hears the knock and the spark moves later: the knock fades out
idle(L(17), D(17), 0.25); knock(L(17) + 0.3, D(17) * 0.55, 8, 0.15); lab(17, 0.8); paper(L(17) + D(17) * 0.55);
// 18 · gauges swing; the piston breaks
a(L(18) + 0.3, 'whoosh', 0.12, 1.4); knock(L(18) + D(18) * 0.5, 1.0, 25, 0.2); a(L(18) + D(18) * 0.6, 'clank', 0.35);
// 19 · the 95 pump; no harm ✗, no benefit ✗
rec(L(19), 'fuel-pump', 0.3, 20, D(19), 1.0, 'hum', 0.1); paper(L(19) + D(19) * 0.3); scribble(L(19) + D(19) * 0.4); paper(L(19) + D(19) * 0.65); scribble(L(19) + D(19) * 0.75);
// 20 · the myth crossed out
a(L(20) + 0.2, 'pop', 0.3); scribble(L(20) + D(20) * 0.7);
// 21 · same energy; the coins fly off, one drop each
a(L(21) + 0.2, 'fill', 0.12, 1.2); for (let k = 0; k < 4; k++) rec(L(21) + D(21) * 0.55 + k * 0.2, 'coins', 0.35, 0, 0.5, 1.0, 'clink', 0.2);
// 22 · a sports car passes, 98 lands
rec(L(22) - 0.6, 'sports-car', 0.3, 1.0, 4.8, 1.0, 'rev', 0.14); ding(L(22) + 0.4); lab(22, D(22) * 0.55);
// 23 · recap: ✗ on «قوة», the tag, the manual
scribble(L(23) + 0.5); paper(L(23) + 1.0); lab(23, D(23) * 0.55);
// 24 · the Spitfire flies past; 100 lands
rec(L(24) - 0.3, 'propeller-plane', 0.24, 1.5, D(24) + 0.3, 1.0, 'motor', 0.12); ding(L(24) + 0.6);

// music plays only when sfx.py is run with --music, and that only when the user asked for music in this video
const MUSIC = has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: !MUSIC, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
