// Sound for the 30 s person demo (no voice, no music): node cues.js && python3 ../audio/sfx.py silence.wav cues.json <mix.wav>
const fs = require('fs'), KIT = '../_templates/sketch/sfx/', c = [];
const a = (t, fx, gain, dur, ex) => c.push(Object.assign({ t, fx, gain }, dur ? { dur } : {}, ex || {}));
const rec = (t, n, gain, from, dur) => c.push({ t, file: KIT + 'px-' + n + '.mp3', gain, from, dur });
rec(0, 'clock-ticking', 0.22, 0.1, 5.0);                                                   // asleep: the clock ticks
for (let s = 0; s < 1.5; s += 0.07) a(5.0 + s, 'bell', +(0.1 * (1 - s / 3)).toFixed(3), 0.25, { f: 2100 + (Math.round(s / .07) % 2) * 140 });   // the alarm
a(5.1, 'pop', 0.35); a(7.2, 'whoosh', 0.18, 0.8); a(7.6, 'spin', 0.12, 1.6);              // wakes, hand to the forehead, dizzy
rec(9.2, 'swipe', 0.3, 0.6, 0.42); a(9.9, 'tick', 0.22); a(10.7, 'tick', 0.22);           // close-up, labels
a(12.5, 'whoosh', 0.22, 1.0); a(13.9, 'tick', 0.2); a(14.3, 'tick', 0.2);                 // stands, joint dots
a(14.4, 'whoosh', 0.15, 1.4); a(15.8, 'chime', 0.2);                                       // stretch, yawn
a(16.8, 'whoosh', 0.14, 0.6); rec(17.6, 'pencil-scribble', 0.45, 0.75, 0.7); rec(18.0, 'ding', 0.3, 0.1, 1.4);   // points, ✓ 20
a(21.0, 'whoosh', 0.14, 0.6); a(21.6, 'pop', 0.4);                                         // thumbs up
rec(25.0, 'swipe', 0.3, 0.6, 0.42); for (let i = 0; i < 6; i++) a(25.6 + i * .8, 'pop', 0.25);   // expressions
fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length + ' cues');
