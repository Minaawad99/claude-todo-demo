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
//   ui-pop          «Soft UI Pop Light Minimal Click» (humordome 451232)  0–0.25 s       → replaces the synthesized pop
//   swish           «Soft Swishes» (79890)                          one swish 3.92–4.24 s       → replaces the synthesized whoosh
//   chime           «Celestial Chime Soft Short» (gigidelaromusic 450958)  0.1–2.3 s       → replaces the synthesized chime / ping
//   click           «Single Mouse Click Sound HD» (virtual_vibes 379373)  0.13–0.32 s     → replaces the synthesized tick; a light switch
//   notification    «New Notification 051» (universfield 494246)    0.08–1.22 s                 → a phone notification
//   alarm-beep      «Alarm Beep Electronic» (91914)                 beeps from 0.31 s, 1 s apart → an alarm clock
//   mouse-squeak    «Mouse Squeaks» (68287)                         20.6–21.6 s                 → a rat or mouse
//   music-soft      «Mysterious Music Box – The Midnight Hour»      the series' music (the user's pick): make it with
//                   ffmpeg -i px-music-box.mp3 -af "highshelf=f=3000:g=-5,volume='if(lt(t,12),0.6+0.4*t/12,1)':eval=frame" px-music-soft.mp3
//                   and keep gain 0.42 (≈22 dB under the narrator while he speaks; the user approved this level)
const fs = require('fs');
global.window = {}; eval(fs.readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
// a clip lives in the episode's sfx/ (gitignored, one-off sounds) or in the shared «اسكتش» kit (committed)
const KIT = '../_templates/sketch/sfx/', where = n => fs.existsSync(__dirname + '/sfx/px-' + n + '.mp3') ? 'sfx/px-' + n + '.mp3' : fs.existsSync(__dirname + '/' + KIT + 'px-' + n + '.mp3') ? KIT + 'px-' + n + '.mp3' : null;
const has = n => !!where(n);
// the user's rule: the sound comes from the clips they sent. A synthesized fx is used only when its clip is missing.
const REAL = { pop: ['ui-pop', 0, 0.25, 1.0], whoosh: ['swish', 3.92, 0.32, 1.2], chime: ['chime', 0.1, 2.2, 1.0], ping: ['chime', 0.1, 1.4, 1.0], tick: ['click', 0.13, 0.19, 0.8] };
const a = (t, fx, gain, dur) => REAL[fx] && has(REAL[fx][0])
  ? c.push({ t: +Math.max(0, t).toFixed(2), file: where(REAL[fx][0]), gain: +(gain * REAL[fx][3]).toFixed(2), from: REAL[fx][1], dur: REAL[fx][2], duck: 1.0 })
  : c.push(Object.assign({ t: +Math.max(0, t).toFixed(2), fx, gain }, dur ? { dur: +dur.toFixed(2) } : {}));
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
// e.g. lab(5, 0.4); ding(L(6) + 1.6); scribble(L(9) + 1.2); sea(L(0), L(PROMISE) - L(0) + 0.6, 0.45);
// 0–2 · night in bed: the clock ticks to 2:00, then the morning (a flat battery)
rec(L(1) + 0.2, 'clock-ticking', 0.25, 0.1, D(1) - 0.2, 1.0, null); rec(L(2) + 0.3, 'alarm-beep', 0.35, 0.31, 2.0, 1.0, 'ping', 0.3);   // the morning alarm
// 4 · the rule card is pinned
paper(L(4) + 0.3); a(L(4) + 0.45, 'pop', 0.35);
// 5 · the clock crossed out, the eye ticked
scribble(L(5) + 1.3); lab(5, 2.8); scribble(L(5) + 3.4);
// 6 · the retina inset, the picture crossed out
a(L(6) + 1.6, 'pop', 0.35); lab(6, 2.4); scribble(L(6) + 3.4);
// 7 · the sensitivity curve draws, the peak lands on blue
a(L(7) + 0.4, 'whoosh', 0.12, 1.2); ding(L(7) + 1.6);
// 8–10 · the signal runs to the brain's clock, then to the pineal gland, which lets out melatonin
lab(8, 0.4); a(L(8) + 0.6, 'whoosh', 0.12); lab(8, 1.6);
drone(L(9), D(9) + D(10), 0.3); a(L(9) + 2.4, 'whoosh', 0.12); lab(9, 3.4);
a(L(10) + 0.4, 'pop', 0.3); lab(10, 1.0);
// 11 · calm: breathing slows
rec(L(11), 'wind-gust', 0.12, 0.25, 2.0, 1.0, 'wind', 0.1);
// 12–13 · the phone lights up; melatonin is crossed out
a(L(12) + 0.3, 'pop', 0.35); lab(12, 1.2); lab(12, 2.4);
a(L(13) + 0.3, 'whoosh', 0.12); scribble(L(13) + 2.2);
// 14 · the light switch flicks on and off
for (let s2 = L(14) + 0.62; s2 < L(15) - 0.1; s2 += 0.625) rec(s2, 'click', 0.5, 0.13, 0.19, 1.0, 'tick', 0.3);   // the light switch
// 15–16 · the trial, the delayed curve, +1.5
a(L(15) + 0.2, 'pop', 0.3); a(L(15) + 0.8, 'pop', 0.3); ding(L(15) + 2.6); for (let k = 0; k < 5; k++) lab(15, 3.6 + k * 0.15);
a(L(16) + 0.3, 'whoosh', 0.1, 1.2); a(L(16) + 1.2, 'whoosh', 0.1, 1.4); ding(L(16) + 3.0);
// 17 · notifications pop in
for (let k = 0; k < 4; k++) rec(L(17) + 0.6 + k * 0.7, 'notification', 0.3, 0.08, 0.9, 1.0, 'pop', 0.35);
// 18 · the clock races
rec(L(18), 'clock-ticking', 0.3, 0.1, D(18), 1.0, null);
// 19 · night mode, crossed out
a(L(19) + 0.8, 'pop', 0.3); scribble(L(19) + D(19) - 1.4);
// 20 · the light still gets in
lab(20, 1.6);
// 21 · the phone goes to the nightstand, 30 minutes, ✓
a(L(21) + 0.4, 'whoosh', 0.15, 1.2); ding(L(21) + 1.8); scribble(L(21) + 3.4);
// 22 · recap labels
lab(22, 0.3); lab(22, 1.2); lab(22, 2.4);
// 23–24 · darkness hormone; the rat awake at night
drone(L(23), D(23) + D(24), 6); paper(L(23) + 1.4); rec(L(24) + 0.6, 'mouse-squeak', 0.35, 20.6, 1.0, 1.0, 'pop', 0.3); lab(24, 0.4);

// music: OFF unless the user says yes for this episode (their rule: ask every time). No synthesized bed in its place either.
const WITH_MUSIC = false;
const MUSIC = WITH_MUSIC && has('music-soft') ? 'music-soft' : null;
if (MUSIC) rec(0, MUSIC, 0.42, 0, window.TIMING.duration + 2.5, 0.6);
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1));
console.log(c.length + ' cues; kit clips here: ' + (['swipe', 'paper', 'pencil-scribble', 'ding', 'clock-ticking', 'space-drone', 'ocean-waves', 'water-rush', 'wind-gust', 'music-soft'].filter(has).join(', ') || 'none'));
