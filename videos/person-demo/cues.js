// Sound for the 30 s person demo (no voice, no music): node cues.js && python3 ../audio/sfx.py silence.wav cues.json <mix.wav>
const fs = require('fs'), KIT = '../_templates/sketch/sfx/', c = [];
const a = (t, fx, gain, dur, ex) => c.push(Object.assign({ t, fx, gain }, dur ? { dur } : {}, ex || {}));
const rec = (t, n, gain, from, dur) => c.push({ t, file: KIT + 'px-' + n + '.mp3', gain, from, dur });
rec(0, 'clock-ticking', 0.22, 0.1, 4.4);                                                   // asleep, flat on the sofa: the clock ticks
for (let s = 0; s < 1.5; s += 0.07) a(4.4 + s, 'bell', +(0.1 * (1 - s / 3)).toFixed(3), 0.25, { f: 2100 + (Math.round(s / .07) % 2) * 140 });   // the alarm
a(4.75, 'pop', 0.35);                                                                       // eyes open
rec(6.32, 'swipe', 0.3, 0.6, 0.42); a(6.8, 'spin', 0.12, 1.6);                              // to the front view, dizzy
a(8.5, 'whoosh', 0.14, 0.6); a(9.1, 'tick', 0.22);                                          // close-up, the fingers label
a(11.3, 'whoosh', 0.22, 1.0); a(12.9, 'whoosh', 0.15, 1.2); a(14.3, 'chime', 0.2);          // stands, stretches, yawns
rec(15.32, 'swipe', 0.3, 0.6, 0.42);                                                        // to the side view
for (let t = 15.4 + 0.25; t < 23.4; t += 1 / 1.8) a(+t.toFixed(2), 'thud', 0.07, 0.25);     // footsteps, two per walking cycle
rec(23.32, 'swipe', 0.3, 0.6, 0.42); a(24.0, 'tick', 0.22); a(24.3, 'tick', 0.22);          // the proportion lines
a(26.4, 'whoosh', 0.14, 0.6); for (let i = 0; i < 6; i++) a(26.6 + i * .6, 'pop', 0.25);    // expressions
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length + ' cues');
