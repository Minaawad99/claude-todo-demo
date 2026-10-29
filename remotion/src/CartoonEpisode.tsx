import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// The cartoon-panel look in Remotion: black 360×640 frame drawn at ×3, hand-lettered title, the episode's animated
// 640×360 panel (videos/<slug>/cartoon/scenes.js, copied by scripts/sync-cartoon.mjs), captions revealed with the voice.
// Fonts come from public/fonts (Google Fonts saved locally): the render browser can't reach fonts.gstatic.com.
const ruqaa = "'Aref Ruqaa', serif", sans = "'Noto Sans Arabic', sans-serif";
const fontsReady = (async () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = staticFile("fonts/fonts.css");
  await new Promise((resolve, reject) => { link.onload = resolve; link.onerror = reject; document.head.appendChild(link); });
  await Promise.all(["700 30px 'Aref Ruqaa'", "600 20px 'Noto Sans Arabic'", "800 20px 'Noto Sans Arabic'", "700 20px 'Noto Serif'"]
    .map((font) => document.fonts.load(font, "إيه الحكاية 120")));
})();

export type Line = { start: number; end: number };
export type EpisodeMeta = { title: string; sub: string; duration: number; lines: Line[] };
export type CartoonProps = { slug: string; meta?: EpisodeMeta };
type Caption = { w: string[]; k: boolean[] };

const TAIL = 1.5, FADE = 0.6;
const loaded: Record<string, Promise<void>> = {};

// scenes.js is plain browser JS that reads window.TIMING / window.CAPS and sets window.__panel(svg, t)
const loadEpisode = (slug: string) => loaded[slug] ??= (async () => {
  const holder = document.createElement("div");
  holder.innerHTML = await fetch(staticFile(`${slug}/defs.svg`)).then((r) => r.text());
  document.body.appendChild(holder);
  for (const file of ["timing.js", "caps.js", "scenes.js"]) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = staticFile(`${slug}/${file}`);
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`could not load ${slug}/${file}`));
      document.head.appendChild(s);
    });
  }
})();

const Captions: React.FC<{ t: number; lines: Line[]; caps: Caption[]; frame: number; fps: number }> = ({ t, lines, caps, frame, fps }) => {
  let i = 0;
  while (i < lines.length - 1 && lines[i + 1].start - 0.05 <= t) i++;
  const c = caps[i], l = lines[i], tot = c.w.join("").length;
  const enter = spring({ frame: frame - Math.round((l.start - 0.05) * fps), fps, config: { damping: 18, mass: 0.6 } });
  let acc = 0;
  return (
    <div style={{ position: "absolute", left: 16, right: 16, top: 426, textAlign: "center", fontFamily: sans, fontWeight: 800,
      fontSize: c.w.length > 13 ? 17 : 20, lineHeight: 1.65, color: "#fff", opacity: enter, transform: `translateY(${(1 - enter) * 8}px)` }}>
      {c.w.map((w, k) => {
        const at = l.start + (l.end - l.start) * (acc / tot) - 0.05;
        acc += w.length;
        const pop = spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 12, mass: 0.4 } });
        return (
          <React.Fragment key={k}>
            <span style={{ display: "inline-block", color: c.k[k] ? "#f2c230" : "#fff", opacity: t >= at ? interpolate(pop, [0, 1], [0.5, 1]) : 0.18,
              transform: `scale(${t >= at ? interpolate(pop, [0, 1], [c.k[k] ? 1.35 : 1.12, 1]) : 1})` }}>{w}</span>{" "}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const CartoonEpisode: React.FC<CartoonProps> = ({ slug, meta }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender(`loading ${slug}`));
  const [ready, setReady] = useState(false);
  const panel = useRef<SVGSVGElement>(null);
  const t = frame / fps;

  useEffect(() => {
    Promise.all([fontsReady, loadEpisode(slug)]).then(() => { setReady(true); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [slug, handle]);
  useLayoutEffect(() => {
    if (ready && panel.current) (window as any).__panel(panel.current, t);
  }, [ready, t]);

  if (!meta) return null;
  const caps: Caption[] | undefined = ready ? (window as any).CAPS : undefined;
  const fadeOut = interpolate(frame, [durationInFrames - FADE * fps, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{`.tag { font-family: ${sans}; font-weight: 800; fill: #2b2016; }`}</style>
      <Audio src={staticFile(`${slug}/mix.wav`)} />
      <div style={{ position: "absolute", width: 360, height: 640, transform: "scale(3)", transformOrigin: "0 0", direction: "rtl", opacity: fadeOut }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", fontFamily: ruqaa, fontWeight: 700, fontSize: 30, lineHeight: 1.2, color: "#fff" }}>{meta.title}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 136, textAlign: "center", fontFamily: ruqaa, fontWeight: 700, fontSize: 19, lineHeight: 1.2, color: "#f2c230" }}>{meta.sub}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 196, height: 203, overflow: "hidden" }}>
          <svg ref={panel} viewBox="0 0 640 360" style={{ display: "block", width: "100%", height: "100%" }} />
        </div>
        {caps && <Captions t={t} lines={meta.lines} caps={caps} frame={frame} fps={fps} />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 12, color: "#9a958c" }}>إيه الحكاية؟</div>
      </div>
    </AbsoluteFill>
  );
};

export const cartoonMetadata = async ({ props }: { props: CartoonProps }) => {
  const meta: EpisodeMeta = await fetch(staticFile(`${props.slug}/meta.json`)).then((r) => r.json());
  return { durationInFrames: Math.round((meta.duration + TAIL) * 60), props: { ...props, meta } };
};
