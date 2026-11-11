/* «ابنيها بنفسك» — الطيارة: sound cues (JavaScript-synthesised effects, no music), from the same events as the picture.
   node cues.js <out-sfx.wav> */
const fs = require("fs"), vm = require("vm"), path = require("path");
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "timing.js"), "utf8"), ctx);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "build/scene.js"), "utf8"), ctx);
const TIMING = ctx.window.TIMING, ev = ctx.window.EV, SFX = require("../_templates/ebniha/sfx.js");
const L = i => TIMING.lines[i].start, C = [], q = (t, fx, gain, o) => C.push(Object.assign({ t, fx, gain }, o || {}));
for (let i = 1; i < TIMING.lines.length; i++) if (![18, 21].includes(i)) q(L(i) - 0.5, "whoosh", 0.16);
q(0.2, "wind", 0.35, { dur: 4 }); q(1.2, "rustle", 0.3, { dur: 1 }); q(ev.yay0, "party", 0.8); q(ev.fall + .4, "whoosh", .4); q(ev.fall + 1.6, "crumble", 0.7); q(ev.fall + 1.7, "buzz", 0.3);
q(ev.prop, "clank", 0.4, { f: 420 }); q(ev.prop + .2, "prop", 0.16, { dur: ev.jet - ev.prop }); q(ev.prop + .3, "pop", 0.4);
q(ev.wing, "whoosh", 0.3); q(ev.down, "wind", 0.3, { dur: 2 }); q(ev.up, "ding", 0.3); q(ev.lift - .1, "pop", 0.4);
q(ev.spin + .3, "buzz", 0.35); q(ev.fin, "clank", 0.45, { f: 560 }); q(ev.stab, "clank", 0.4, { f: 640 }); q(ev.fin + .2, "pop", 0.4);
for (let k = 0; k < 4; k++) q(ev.ctrl + k * 0.35, "tick", 0.3); q(ev.ctrlTag - .1, "pop", 0.4);
for (let k = 0; k < 12; k++) q(ev.heavy + k * 0.1, "tick", 0.3); q(ev.heavy + .3, "thud", 0.45); q(ev.heavy + .4, "pop", 0.4);
q(ev.jet, "clank", 0.4, { f: 380 }); q(ev.jet + .2, "jet", 0.16, { dur: ev.land - ev.jet + 2 }); q(ev.suck, "suck", 0.4); q(ev.squeeze, "pump", 0.25, { dur: .8 }); q(ev.burn, "zap", 0.35); q(ev.blow, "whoosh", 0.45, { dur: .9 });
q(ev.high, "wind", 0.3, { dur: 5 }); q(ev.cold, "tick", 0.3); q(ev.seal, "thud", 0.4); q(ev.pump, "pump", 0.22, { dur: 2.2 }); q(ev.pump + .3, "pop", 0.4); q(ev.mtn, "ding", 0.3);
q(ev.fuel, "pour", 0.45, { dur: 1.6 }); q(ev.fuel + .2, "pop", 0.4);
q(ev.fast, "buzz", 0.35); q(ev.flaps, "pump", 0.25, { dur: 1.2 }); q(ev.flapTag - .1, "pop", 0.4); q(ev.gear, "clank", 0.5, { f: 300 }); q(ev.gear + .3, "thud", 0.5); q(ev.gearUp + .2, "clank", 0.35, { f: 340 });
q(ev.card, "whoosh", 0.4, { dur: .6 }); q(ev.cardBend, "crack", 0.25); q(ev.cardBend + 1.6, "ding", 0.35);
q(ev.win, "pop", 0.4); q(ev.seats, "pop", 0.4); q(ev.nav, "ding", 0.3); q(ev.yay - .1, "jet", 0.3, { dur: 3 }); q(ev.yay, "party", 0.85);
q(ev.vote, "whoosh", 0.4); for (let k = 0; k < 4; k++) q(ev.vote + .25 + k * .18, "pop", 0.35); for (let k = 0; k < 18; k++) q(ev.vote + 1 + k * .17, "tick", 0.2);
const out = process.argv[2] || "sfx.wav"; SFX.render(C, TIMING.duration + 2, out); console.log(out, C.length, "cues");
