/* «ابنيها بنفسك» — المسبح: sound cues (JavaScript-synthesised effects, no music), from the same events as the picture.
   node cues.js <out-sfx.wav>   then mix with the voice (see the skill). */
const fs = require("fs"), vm = require("vm"), path = require("path");
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "timing.js"), "utf8"), ctx);
const TIMING = ctx.window.TIMING, ev = require("./build/events.js")(TIMING), SFX = require("../_templates/ebniha/sfx.js");
const C = [], q = (t, fx, gain, o) => C.push(Object.assign({ t, fx, gain }, o || {}));

// a soft whoosh on every camera move (each line start, minus the ease lead)
for (let i = 1; i < ev.n; i++) if (![20, 21, 24].includes(i)) q(ev.L(i) - 0.5, "whoosh", 0.18);
q(ev.dig, "dig", 0.9); q(ev.fill0, "pour", 0.7, { dur: 1.3 }); q(ev.yay0, "party", 0.8);
q(ev.soak + 0.6, "bubble", 0.4); q(ev.soak + 0.8, "buzz", 0.35); q(ev.mud, "crumble", 0.8);
q(ev.shell, "thud", 0.7); q(ev.shell + 0.05, "pop", 0.4);
q(ev.fill1, "pour", 0.6, { dur: 2 }); for (let k = 0; k < 12; k++) q(ev.ton + k * 0.1, "tick", 0.35); q(ev.crack, "crack", 0.9); q(ev.crack + 0.3, "buzz", 0.3);
q(ev.rebar, "clank", 0.6, { f: 520 }); q(ev.rebar + 0.28, "clank", 0.5, { f: 610 }); q(ev.rebar + 0.56, "clank", 0.45, { f: 470 });
q(ev.spray, "spray", 0.55, { dur: ev.sprayEnd - ev.spray }); q(ev.tagShot - 0.2, "pop", 0.4);
q(ev.fill2, "pour", 0.6, { dur: 1.5 }); q(ev.green + 0.4, "eww", 0.45);
q(ev.pump, "thud", 0.6); q(ev.pump + 0.1, "clank", 0.35, { f: 380 }); q(ev.flow, "pump", 0.12, { dur: ev.micro - ev.flow }); q(ev.sand, "rustle", 0.3, { dur: 0.8 }); q(ev.tagSand - 0.2, "pop", 0.4); q(ev.clear, "ding", 0.3);
q(ev.leaves, "rustle", 0.45, { dur: 2.4 }); q(ev.skimmer, "thud", 0.5); q(ev.suckLeaves, "suck", 0.55, { dur: 1 }); q(ev.tagSkim - 0.2, "pop", 0.4);
q(ev.drain, "thud", 0.5); q(ev.dirt, "suck", 0.5, { dur: 1.2 });
q(ev.dive + 0.3, "splash", 0.7); q(ev.grab, "suck", 0.5, { dur: 0.6 }); q(ev.grab + 0.15, "buzz", 0.45);
q(ev.twin, "clank", 0.45, { f: 440 }); q(ev.meter, "pop", 0.4); q(ev.dome, "thud", 0.5); q(ev.free, "bubble", 0.5); q(ev.free + 0.2, "ding", 0.25);
q(ev.micro, "whoosh", 0.35, { dur: 0.7 }); q(ev.micro + 0.6, "bubble", 0.3); q(ev.microEnd - 0.5, "whoosh", 0.3);
q(ev.salt, "rustle", 0.5, { dur: 1.4 }); q(ev.cell, "zap", 0.45); q(ev.kill, "ding", 0.3); q(ev.tagCell - 0.2, "pop", 0.4);
for (let k = 0; k < 12; k++) q(ev.salty + 0.3 + k * 0.1, "tick", 0.3);
q(ev.swim2, "splash", 0.55); q(ev.haze, "eww", 0.5); q(ev.eyes, "buzz", 0.3); q(ev.tagCa - 0.2, "pop", 0.4);
q(ev.gauge, "pop", 0.4); q(ev.gauge + 0.4, "buzz", 0.3);
q(ev.shower, "thud", 0.5); q(ev.shower + 0.05, "clank", 0.3, { f: 700 }); q(ev.wash - 0.3, "shower", 0.5, { dur: 2.2 });
q(ev.card, "whoosh", 0.4, { dur: 0.6 }); q(ev.cardBlue, "ding", 0.4); q(ev.cardRed, "whoosh", 0.25); q(ev.cardEnd - 0.35, "whoosh", 0.35);
q(ev.tiles, "rustle", 0.35, { dur: 0.6 }); q(ev.tiles, "pop", 0.4); q(ev.ladder, "clank", 0.4, { f: 900 }); q(ev.lights, "ding", 0.3); q(ev.fence, "clank", 0.35, { f: 600 }); q(ev.fence + 0.2, "pop", 0.35);
q(ev.yay, "party", 0.85);
q(ev.vote, "whoosh", 0.4); for (let k = 0; k < 4; k++) q(ev.vote + 0.25 + k * 0.18, "pop", 0.35); for (let k = 0; k < 20; k++) q(ev.vote + 1 + k * 0.17, "tick", 0.2);

const out = process.argv[2] || "sfx.wav";
SFX.render(C, TIMING.duration + 2, out);
console.log(out, C.length, "cues");
