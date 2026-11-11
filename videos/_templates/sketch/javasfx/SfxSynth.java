// «إيه الحكاية؟» — the «اسكتش» sound effects, synthesized from scratch in Java (no recorded clips).
// Every effect is built from oscillators, filtered noise and envelopes, then written as 48 kHz mono 16-bit WAV.
//   javac -d /tmp/sfxj SfxSynth.java && java -cp /tmp/sfxj SfxSynth <out dir>
// The episode's cues.js points at <out dir>/<name>.wav with "peak": true, so audio/sfx.py levels them by peak like its own fx.
import java.io.*;
import java.nio.*;
import java.util.*;
import java.util.function.*;

public class SfxSynth {
    static final int SR = 48000;
    static final Random RNG = new Random(7);

    // ── building blocks ──
    static double[] buf(double sec) { return new double[(int) (sec * SR)]; }
    static double noise() { return RNG.nextDouble() * 2 - 1; }
    static double exp(double t, double tau) { return Math.exp(-t / tau); }
    // attack-decay envelope: linear rise over a, exponential fall with time constant tau
    static double ad(double t, double a, double tau) { return t < a ? t / a : Math.exp(-(t - a) / tau); }
    // smooth fade in/out over the ends of a buffer
    static void fades(double[] x, double in, double out) {
        int a = (int) (in * SR), b = (int) (out * SR);
        for (int i = 0; i < a && i < x.length; i++) x[i] *= (double) i / a;
        for (int i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= (double) i / b;
    }
    // state-variable filter, centre frequency and Q can move per sample (bandpass / lowpass / highpass outputs)
    static class SVF {
        double lp, bp, hp;
        void step(double in, double fc, double q) {
            double f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6.0) / SR);
            hp = in - lp - bp / q; bp += f * hp; lp += f * bp;
        }
    }
    static double[] bandNoise(double sec, DoubleUnaryOperator fc, double q, DoubleUnaryOperator env) {
        double[] x = buf(sec); SVF f = new SVF();
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR; f.step(noise(), fc.applyAsDouble(t), q); x[i] = f.bp * env.applyAsDouble(t); }
        return x;
    }
    // a struck resonator: a sum of partials (ratio, relative amp, decay) at base frequency f0
    static void strike(double[] x, int at, double f0, double[][] modes, double amp) {
        for (double[] m : modes) {
            double w = 2 * Math.PI * f0 * m[0] / SR, ph = RNG.nextDouble() * 6.28;
            for (int i = at; i < x.length; i++) { double t = (double) (i - at) / SR, e = exp(t, m[2]); if (e < 1e-4) break; x[i] += amp * m[1] * e * Math.sin(w * (i - at) + ph) * Math.min(1, t / 0.0015); }
        }
    }
    static void add(double[] x, double[] y, int at, double g) { for (int i = 0; i < y.length && at + i < x.length; i++) if (at + i >= 0) x[at + i] += y[i] * g; }
    static double[] normalize(double[] x, double peak) {
        double m = 1e-9; for (double v : x) m = Math.max(m, Math.abs(v));
        for (int i = 0; i < x.length; i++) x[i] *= peak / m; return x;
    }

    // ── the effects ──
    // a label ticks in: a tiny wooden click
    static double[] tick() {
        double[] x = buf(0.06); strike(x, 0, 2400, new double[][]{{1, 1, .006}, {2.7, .5, .003}}, 1);
        for (int i = 0; i < 160; i++) x[i] += noise() * .5 * (1 - i / 160.0);
        return x;
    }
    // something pops into place: a short downward sine blip with a soft body
    static double[] pop() {
        double[] x = buf(0.16); double ph = 0;
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR, f = 900 * Math.exp(-t * 28) + 260; ph += 2 * Math.PI * f / SR; x[i] = Math.sin(ph) * ad(t, .002, .03); }
        return x;
    }
    // a page turned over: a rising-falling paper rustle with a flap at the end
    static double[] swipe() {
        double d = 0.42;
        double[] x = bandNoise(d, t -> 900 + 3200 * Math.sin(Math.PI * t / d), 1.4, t -> Math.pow(Math.sin(Math.PI * Math.min(1, t / d)), 1.6) * (1 + .5 * Math.sin(t * 2 * Math.PI * 38)));
        double[] flap = bandNoise(.05, t -> 1800, 2, t -> ad(t, .002, .012));
        add(x, flap, (int) (.33 * SR), 2.2);
        return x;
    }
    // a card slid onto the desk: soft low friction noise
    static double[] paper() {
        double d = 0.5;
        double[] x = bandNoise(d, t -> 1400 - 800 * t / d, .9, t -> ad(t, .04, .16) * (1 + .3 * Math.sin(t * 2 * Math.PI * 21)));
        return x;
    }
    // a pencil writes ✗ / ✓: fast scratchy strokes
    static double[] scribble() {
        double d = 0.7;
        return bandNoise(d, t -> 3600 + 900 * Math.sin(t * 2 * Math.PI * 9), 3, t -> Math.pow(Math.abs(Math.sin(t * Math.PI * 9)), .6) * Math.min(1, t / .02) * Math.min(1, (d - t) / .08) * (.7 + .3 * noise()));
    }
    // a key number lands: a clear glass-like ding
    static double[] ding() {
        double[] x = buf(1.6); strike(x, 0, 1318.5, new double[][]{{1, 1, .55}, {2.76, .35, .22}, {5.4, .12, .09}, {.5, .08, .4}}, 1); return x;
    }
    // a card opens: three rising bell notes
    static double[] chime() {
        double[] x = buf(1.4); double[] n = {1046.5, 1318.5, 1568};
        for (int k = 0; k < 3; k++) strike(x, (int) (k * .11 * SR), n[k], new double[][]{{1, 1, .45}, {2.76, .25, .15}, {4.07, .08, .06}}, .8);
        return x;
    }
    // the stopwatch bumper: a high ping with a soft echo
    static double[] ping() {
        double[] x = buf(0.7); strike(x, 0, 1760, new double[][]{{1, 1, .12}, {2.4, .2, .04}}, 1); strike(x, (int) (.16 * SR), 1760, new double[][]{{1, 1, .1}}, .3); return x;
    }
    // a soft thud (the ache pulsing): a low thump
    static double[] thud() {
        double[] x = buf(0.4); double ph = 0;
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR, f = 55 + 70 * Math.exp(-t * 30); ph += 2 * Math.PI * f / SR; x[i] = Math.sin(ph) * ad(t, .004, .09); }
        SVF s = new SVF(); for (int i = 0; i < 900; i++) { s.step(noise(), 500, .7); x[i] += s.lp * .6 * (1 - i / 900.0); }
        return x;
    }
    // air moving past: a band of noise sweeping up then down
    static double[] whoosh(double d) {
        return bandNoise(d, t -> 300 + 2200 * Math.sin(Math.PI * t / d), 1.1, t -> Math.pow(Math.sin(Math.PI * t / d), 2));
    }
    // a tablet fizzing in water: a hiss full of tiny bubble pops that thin out
    static double[] fizz(double d) {
        double[] x = bandNoise(d, t -> 6000, .8, t -> .12 * Math.min(1, t / .05) * Math.exp(-t / (d * .7)));
        int n = (int) (d * 260);
        for (int k = 0; k < n; k++) {
            double t0 = Math.pow(RNG.nextDouble(), 1.6) * d; double f0 = 2200 + RNG.nextDouble() * 5000; int at = (int) (t0 * SR);
            double[] b = new double[(int) (.012 * SR)]; double ph = 0;
            for (int i = 0; i < b.length; i++) { double t = (double) i / SR; ph += 2 * Math.PI * f0 * (1 + 3 * t) / SR; b[i] = Math.sin(ph) * exp(t, .0025); }
            add(x, b, at, (.2 + .5 * RNG.nextDouble()) * Math.exp(-t0 / d));
        }
        return x;
    }
    // liquid moving: slow lowpassed waves of noise with a few low bubbles
    static double[] slosh(double d) {
        double[] x = buf(d); SVF f = new SVF();
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR; f.step(noise(), 380 + 260 * Math.sin(t * 2 * Math.PI * 1.6), 1.2); x[i] = f.bp * Math.sin(Math.PI * t / d) * (.6 + .4 * Math.sin(t * 2 * Math.PI * 3.1)); }
        for (int k = 0; k < 8; k++) { double f0 = 300 + RNG.nextDouble() * 300; int at = (int) (RNG.nextDouble() * (d - .1) * SR); double[] b = new double[(int) (.06 * SR)]; double ph = 0;
            for (int i = 0; i < b.length; i++) { double t = (double) i / SR; ph += 2 * Math.PI * f0 * (1 + 4 * t) / SR; b[i] = Math.sin(ph) * exp(t, .015); } add(x, b, at, .5); }
        return x;
    }
    // blood / liquid rushing through: a steady filtered flow that swells in
    static double[] flow(double d) {
        double[] x = buf(d); SVF a = new SVF(), b = new SVF();
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR; a.step(noise(), 700 + 200 * Math.sin(t * 2 * Math.PI * .7), .9); b.step(noise(), 2400, 1.5);
            x[i] = (a.bp + .25 * b.bp) * Math.min(1, t / .5) * Math.min(1, (d - t) / .6) * (.8 + .2 * Math.sin(t * 2 * Math.PI * 1.2)); }
        return x;
    }
    // rain on roofs: a bed of noise and hundreds of single drops
    static double[] rain(double d) {
        double[] x = bandNoise(d, t -> 3000, .6, t -> .35 * Math.min(1, t / .4) * Math.min(1, (d - t) / .5));
        int n = (int) (d * 180);
        for (int k = 0; k < n; k++) { int at = (int) (RNG.nextDouble() * d * SR); double f0 = 1500 + RNG.nextDouble() * 3500; double[] b = new double[(int) (.01 * SR)];
            for (int i = 0; i < b.length; i++) b[i] = Math.sin(2 * Math.PI * f0 * i / SR) * exp((double) i / SR, .0018) + noise() * .3 * exp((double) i / SR, .001); add(x, b, at, .25 + .4 * RNG.nextDouble()); }
        fades(x, .3, .5); return x;
    }
    // fire going out under water: a hiss that fades
    static double[] steam(double d) { return bandNoise(d, t -> 5200 - 1500 * t / d, .7, t -> Math.min(1, t / .08) * Math.exp(-t / (d * .45))); }
    // a single water drop: "plip", the pitch jumping up
    static double[] drip() {
        double[] x = buf(0.2); double ph = 0;
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR, f = 700 + 1300 * Math.min(1, t / .03); ph += 2 * Math.PI * f / SR; x[i] = Math.sin(ph) * ad(t, .001, .035); }
        return x;
    }
    // an electric alarm bell: the striker hits the gong many times a second
    static double[] bell(double d) {
        double[] x = buf(d + .6);
        for (double t = 0; t < d; t += 1 / 22.0) strike(x, (int) (t * SR), 1180, new double[][]{{1, 1, .25}, {2.32, .45, .12}, {4.25, .2, .05}}, .35);
        return x;
    }
    // a clock: tick… tock… every half second
    static double[] clock(double d) {
        double[] x = buf(d); int k = 0;
        for (double t = .02; t < d - .1; t += .5, k++) strike(x, (int) (t * SR), k % 2 == 0 ? 2900 : 2300, new double[][]{{1, 1, .01}, {2.3, .6, .006}, {.5, .3, .02}}, 1);
        return x;
    }
    // a small mechanism working: a geared motor whine with a little ripple
    static double[] servo(double d) {
        double[] x = buf(d); double ph = 0; SVF f = new SVF();
        for (int i = 0; i < x.length; i++) { double t = (double) i / SR, fr = 160 + 90 * Math.sin(Math.PI * t / d); ph += 2 * Math.PI * fr / SR; double saw = 2 * ((ph / (2 * Math.PI)) % 1) - 1;
            f.step(saw + .2 * noise(), 900, .9); x[i] = f.lp * Math.sin(Math.PI * t / d) * (1 + .3 * Math.sin(t * 2 * Math.PI * 30)); }
        return x;
    }
    // a molecule slotting in: a small bright click-chime
    static double[] clink() { double[] x = buf(0.6); strike(x, 0, 2093, new double[][]{{1, 1, .12}, {2.9, .5, .05}, {5.1, .3, .02}}, 1); return x; }
    // a key snapping in a lock: a short metallic clank
    static double[] clank() {
        double[] x = buf(0.6); strike(x, 0, 420, new double[][]{{1, 1, .12}, {2.45, .7, .07}, {3.9, .5, .04}, {6.2, .3, .02}}, 1);
        for (int i = 0; i < 600; i++) x[i] += noise() * .8 * (1 - i / 600.0); return x;
    }

    static void write(File dir, String name, double[] x) throws IOException {
        normalize(x, 0.89); fades(x, 0, .004);
        ByteBuffer b = ByteBuffer.allocate(44 + x.length * 2).order(ByteOrder.LITTLE_ENDIAN);
        b.put("RIFF".getBytes()).putInt(36 + x.length * 2).put("WAVE".getBytes()).put("fmt ".getBytes()).putInt(16).putShort((short) 1).putShort((short) 1)
         .putInt(SR).putInt(SR * 2).putShort((short) 2).putShort((short) 16).put("data".getBytes()).putInt(x.length * 2);
        for (double v : x) b.putShort((short) Math.round(Math.max(-1, Math.min(1, v)) * 32767));
        try (FileOutputStream o = new FileOutputStream(new File(dir, name + ".wav"))) { o.write(b.array()); }
        System.out.printf("%-9s %.2f s%n", name, x.length / (double) SR);
    }

    public static void main(String[] a) throws IOException {
        File dir = new File(a.length > 0 ? a[0] : "sfx-java"); dir.mkdirs();
        write(dir, "tick", tick()); write(dir, "pop", pop()); write(dir, "swipe", swipe()); write(dir, "paper", paper());
        write(dir, "scribble", scribble()); write(dir, "ding", ding()); write(dir, "chime", chime()); write(dir, "ping", ping());
        write(dir, "thud", thud()); write(dir, "whoosh", whoosh(0.8)); write(dir, "fizz", fizz(2.2)); write(dir, "slosh", slosh(1.8));
        write(dir, "flow", flow(3.2)); write(dir, "rain", rain(4.5)); write(dir, "steam", steam(1.8)); write(dir, "drip", drip());
        write(dir, "bell", bell(0.5)); write(dir, "clock", clock(3.2)); write(dir, "servo", servo(0.7)); write(dir, "clink", clink()); write(dir, "clank", clank());
    }
}
