/* «ابنيها بنفسك» — sound effects synthesised in JavaScript (no music, no recorded clips).
   const SFX = require("../_templates/ebniha/sfx.js");
   SFX.render([{t: 1.2, fx: "dig", gain: 1, dur: 1.5}, ...], durationSeconds, "out.wav")   → 48 kHz mono 16-bit WAV
   Effects: prop, jet, wind, dig, pour, splash, party, crumble, crack, clank, spray, pump, suck, buzz, zap, pop, whoosh, ding, rustle,
            shower, eww, tick, thud, bubble. Each takes {dur} where it makes sense; all are deterministic (seeded). */
const fs = require("fs");
const SR = 48000;
let seed = 12345;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function noise(n) { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = rnd() * 2 - 1; return a; }
function N(sec) { return Math.max(1, Math.round(sec * SR)); }
// RBJ biquad
function biquad(x, type, f0, q) {
  const w = 2 * Math.PI * f0 / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * (q || 0.707));
  let b0, b1, b2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = al; b1 = 0; b2 = -al; }   // band-pass
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
// a band-pass whose centre moves over time (for sweeps, water, slurps): processed in short blocks
function sweepBP(x, fA, fB, q, curve) {
  const y = new Float32Array(x.length), B = 256; let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let s0 = 0; s0 < x.length; s0 += B) {
    const u = s0 / x.length, f0 = typeof curve === "function" ? curve(u) : fA * Math.pow(fB / fA, u);
    const w = 2 * Math.PI * Math.min(f0, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q), a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    for (let i = s0; i < Math.min(x.length, s0 + B); i++) { const v = (al * x[i] - al * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  }
  return y;
}
function env(n, att, dec, hold) { const a = new Float32Array(n), A = N(att), H = N(hold || 0); for (let i = 0; i < n; i++) a[i] = i < A ? i / A : i < A + H ? 1 : Math.exp(-(i - A - H) / (dec * SR)); return a; }
function mul(a, b) { for (let i = 0; i < a.length; i++) a[i] *= b[i]; return a; }
function gain(a, g) { for (let i = 0; i < a.length; i++) a[i] *= g; return a; }
function add(dst, src, at, g) { const o = Math.round(at * SR); for (let i = 0; i < src.length; i++) { const j = o + i; if (j >= 0 && j < dst.length) dst[j] += src[i] * (g == null ? 1 : g); } return dst; }
function fade(a, fin, fout) { const I = N(fin), O = N(fout); for (let i = 0; i < Math.min(I, a.length); i++) a[i] *= i / I; for (let i = 0; i < Math.min(O, a.length); i++) a[a.length - 1 - i] *= i / O; return a; }
function tone(n, f0, f1, shape) { const a = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const f = f0 * Math.pow(f1 / f0, i / n); ph += f / SR; const p = ph % 1; a[i] = shape === "saw" ? 2 * p - 1 : shape === "sq" ? (p < .5 ? 1 : -1) : Math.sin(2 * Math.PI * p); } return a; }
function norm(a, peak) { let m = 1e-9; for (const v of a) m = Math.max(m, Math.abs(v)); return gain(a, (peak || 0.9) / m); }

const FX = {
  thud(o) { const n = N(0.35); const a = mul(tone(n, 120, 45), env(n, 0.002, 0.08)); add(a, mul(biquad(noise(N(.05)), "lp", 900), env(N(.05), .001, .012)), 0, .6); return norm(a, .9); },
  pop() { const n = N(0.09); const a = mul(tone(n, 520, 1250), env(n, 0.002, 0.03)); return norm(a, .7); },
  tick() { const n = N(0.03); return norm(mul(biquad(noise(n), "bp", 3500, 4), env(n, 0.0005, 0.006)), .6); },
  ding() { const n = N(1.4); const a = mul(tone(n, 1318, 1318), env(n, .002, .45)); add(a, mul(tone(n, 2637, 2637), env(n, .002, .22)), 0, .35); add(a, mul(tone(n, 1976, 1976), env(n, .002, .3)), 0, .25); return norm(a, .6); },
  whoosh(o) { const d = (o && o.dur) || .55, n = N(d); const a = sweepBP(noise(n), 0, 0, 1.2, u => 300 + 2200 * Math.sin(Math.PI * Math.min(1, u * 1.1))); const e = new Float32Array(n); for (let i = 0; i < n; i++) e[i] = Math.pow(Math.sin(Math.PI * i / n), 2); return norm(mul(a, e), .55); },
  dig(o) { const out = new Float32Array(N(1.7)); for (let k = 0; k < 3; k++) { const n = N(.32); const s = mul(sweepBP(noise(n), 900, 2400, 2.2), env(n, .01, .09)); add(out, s, k * .5, .8); add(out, FX.thud(), k * .5 + .18, .5); add(out, mul(biquad(noise(N(.4)), "bp", 500, 1.5), env(N(.4), .02, .12)), k * .5 + .25, .5); } return norm(out, .8); },
  pour(o) { const d = (o && o.dur) || 1.6, n = N(d); const a = sweepBP(noise(n), 0, 0, 2.5, u => 700 + 500 * Math.sin(u * 37) * Math.sin(u * 11)); fade(a, .12, .3);
    for (let k = 0; k < d * 14; k++) add(a, mul(tone(N(.05), 380 + rnd() * 500, 900 + rnd() * 700), env(N(.05), .002, .015)), rnd() * (d - .1), .5); return norm(a, .6); },
  splash() { const n = N(.9); const a = mul(biquad(noise(n), "lp", 2600), env(n, .004, .22)); add(a, mul(tone(N(.25), 160, 70), env(N(.25), .002, .07)), 0, .6); for (let k = 0; k < 10; k++) add(a, mul(tone(N(.05), 500 + rnd() * 600, 1100 + rnd() * 600), env(N(.05), .002, .012)), .15 + rnd() * .6, .35); return norm(a, .8); },
  bubble() { const out = new Float32Array(N(.8)); for (let k = 0; k < 6; k++) add(out, mul(tone(N(.07), 300 + rnd() * 300, 800 + rnd() * 500), env(N(.07), .003, .02)), k * .11 + rnd() * .05, .6); return norm(out, .5); },
  party() { const out = new Float32Array(N(1.8)); add(out, mul(biquad(noise(N(.03)), "hp", 900), env(N(.03), .0005, .008)), 0, 1); add(out, mul(tone(N(.18), 220, 80), env(N(.18), .001, .05)), 0, .7);
    for (let k = 0; k < 70; k++) { const n = N(.02); add(out, mul(biquad(noise(n), "hp", 4000 + rnd() * 3000), env(n, .0005, .005)), .05 + Math.pow(rnd(), 1.6) * 1.5, .35 * (1 - k / 90)); }
    const bell = FX.ding(); add(out, bell, .05, .25); return norm(out, .85); },
  crumble() { const n = N(1.4); const a = mul(biquad(noise(n), "lp", 260), env(n, .05, .5, .2)); for (let k = 0; k < 12; k++) add(a, mul(biquad(noise(N(.06)), "bp", 300 + rnd() * 500, 2), env(N(.06), .002, .02)), rnd() * 1.1, .6); return norm(a, .75); },
  crack() { const out = new Float32Array(N(.8)); let t = 0; for (let k = 0; k < 9; k++) { const n = N(.02); add(out, mul(biquad(noise(n), "bp", 2500 + rnd() * 2500, 3), env(n, .0003, .004)), t, 1 - k * .07); t += .03 + rnd() * .06; }
    add(out, mul(tone(N(.5), 140, 90, "saw"), env(N(.5), .02, .15)), 0, .15); return norm(out, .85); },
  clank(o) { const n = N(.9), f = (o && o.f) || 520; const a = new Float32Array(n); [[1, 1], [2.76, .6], [5.4, .35], [8.93, .2]].forEach(([r, g], j) => add(a, mul(tone(n, f * r, f * r), env(n, .001, .35 / (1 + j * .7))), 0, g));
    add(a, mul(biquad(noise(N(.02)), "hp", 2000), env(N(.02), .0003, .004)), 0, .6); return norm(a, .75); },
  spray(o) { const d = (o && o.dur) || 2, n = N(d); const a = biquad(biquad(noise(n), "hp", 1800), "lp", 7000); for (let i = 0; i < n; i++) a[i] *= .75 + .25 * Math.sin(i / SR * 2 * Math.PI * 9); fade(a, .15, .25);
    for (let k = 0; k < d * 6; k++) add(a, mul(biquad(noise(N(.03)), "bp", 600, 2), env(N(.03), .001, .01)), rnd() * d, .5); return norm(a, .5); },
  pump(o) { const d = (o && o.dur) || 3, n = N(d); const a = biquad(tone(n, 50, 50, "saw"), "lp", 420); add(a, tone(n, 100, 100), 0, .35); add(a, biquad(noise(n), "bp", 1200, 1.2), 0, .08);
    for (let i = 0; i < n; i++) { const u = i / SR; a[i] *= Math.min(1, u / .8) * (1 + .08 * Math.sin(u * 2 * Math.PI * 5)); } fade(a, .01, .6); return norm(a, .5); },
  suck(o) { const d = (o && o.dur) || .8, n = N(d); const a = sweepBP(noise(n), 1600, 250, 3); const e = new Float32Array(n); for (let i = 0; i < n; i++) e[i] = Math.sin(Math.PI * i / n); mul(a, e); add(a, mul(tone(N(.12), 300, 140), env(N(.12), .002, .04)), d - .12, .5); return norm(a, .7); },
  buzz() { const out = new Float32Array(N(.55)); for (let k = 0; k < 2; k++) { const n = N(.2); add(out, mul(biquad(tone(n, 150, 150, "sq"), "lp", 1800), env(n, .005, .2, .12)), k * .26, .7); } return norm(out, .6); },
  zap() { const n = N(.7); const a = mul(tone(n, 120, 120, "sq"), env(n, .01, .3, .2)); gain(a, .3); for (let k = 0; k < 30; k++) add(a, mul(biquad(noise(N(.008)), "hp", 3000), env(N(.008), .0003, .002)), rnd() * .6, .8); return norm(biquad(a, "lp", 6000), .6); },
  rustle(o) { const d = (o && o.dur) || 1.2, out = new Float32Array(N(d)); for (let k = 0; k < d * 40; k++) { const n = N(.04); add(out, mul(biquad(noise(n), "bp", 2500 + rnd() * 3500, 1.5), env(n, .004, .012)), rnd() * (d - .05), .4 + rnd() * .6); } return norm(out, .45); },
  shower(o) { const d = (o && o.dur) || 1.8, n = N(d); const a = biquad(biquad(noise(n), "hp", 2500), "lp", 9000); fade(a, .1, .3); for (let k = 0; k < d * 30; k++) add(a, mul(tone(N(.02), 900 + rnd() * 900, 1600), env(N(.02), .001, .005)), rnd() * d, .3); return norm(a, .45); },
  prop(o) { const d = (o && o.dur) || 3, n = N(d); const a = biquad(tone(n, 95, 95, "saw"), "lp", 900); for (let i = 0; i < n; i++) a[i] *= .55 + .45 * Math.abs(Math.sin(i / SR * Math.PI * 38)); add(a, biquad(noise(n), "bp", 700, 1), 0, .15); fade(a, .3, .5); return norm(a, .5); },
  jet(o) { const d = (o && o.dur) || 3, n = N(d); const a = biquad(noise(n), "lp", 900); add(a, biquad(noise(n), "bp", 2600, 2), 0, .25); add(a, tone(n, 55, 70, "saw"), 0, .12); for (let i = 0; i < n; i++) a[i] *= Math.min(1, i / SR / .8); fade(a, .05, .7); return norm(a, .55); },
  wind(o) { const d = (o && o.dur) || 3, n = N(d); const a = sweepBP(noise(n), 0, 0, 1.5, u => 400 + 300 * Math.sin(u * 9) + 200 * Math.sin(u * 23)); fade(a, .5, .8); return norm(a, .4); },
  eww() { const n = N(.7); const a = mul(biquad(tone(n, 330, 170, "saw"), "lp", 1400), env(n, .02, .3, .25)); for (let i = 0; i < n; i++) a[i] *= 1 + .3 * Math.sin(i / SR * 2 * Math.PI * 14); return norm(a, .5); },
};

function render(cues, dur, out) {
  const mix = new Float32Array(N(dur));
  for (const c of cues) { seed = 1000 + Math.round(c.t * 100); const s = FX[c.fx](c); add(mix, s, c.t, c.gain == null ? 1 : c.gain); }
  let m = 1e-9; for (const v of mix) m = Math.max(m, Math.abs(v)); if (m > .98) gain(mix, .98 / m);
  const buf = Buffer.alloc(44 + mix.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + mix.length * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(mix.length * 2, 40);
  for (let i = 0; i < mix.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i])) * 32767), 44 + i * 2);
  fs.writeFileSync(out, buf); return out;
}
module.exports = { render, FX, SR };
