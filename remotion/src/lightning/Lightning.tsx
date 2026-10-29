import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadRuqaa } from "@remotion/google-fonts/ArefRuqaa";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import data from "./data.json";
import { World, WorldState, Seg, LEADER, CLOUD, ROD, rnd, clamp, lerp } from "./World";

// «إزاي الرعد والبرق بيحصلوا؟» — one 3D shot per script line, timed by data.json (from videos/lightning/make-data.py).
// The page is the channel's look at 1080×1920: Ruqaa title, a 3D panel, word-by-word captions, the brand.

const { fontFamily: RUQAA } = loadRuqaa("normal", { weights: ["700"] });
const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800"], subsets: ["arabic"] });

type V3 = [number, number, number];
type Line = { start: number; end: number; words: { w: string; k: boolean }[] };
const LINES = (data as { duration: number; lines: Line[] }).lines;
export const DURATION = (data as { duration: number }).duration;
export const TAIL = 1.5;

const PANEL = { top: 372, h: 1140 };
const YEL = "#f2c230";
const MAXSTEP = Math.max(...LEADER.map((s) => s.step));
const lv = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// a strike starting at `at`: the leader grows for `grow` s, then the return stroke flickers out
const strike = (u: number, at: number, grow = 0.45) => {
  const g = (u - at) / grow;
  if (g < 0) return { steps: 0, stroke: 0, flash: 0 };
  const v = u - at - grow;
  if (v > 1.3) return { steps: 0, stroke: 0, flash: 0 };
  const steps = Math.min(MAXSTEP, Math.floor(g * MAXSTEP) + 1);
  const stroke = v < 0 ? 0 : Math.exp(-v * 3.2) * (0.7 + 0.3 * Math.cos(v * 50));
  return { steps, stroke, flash: stroke };
};
const maxS = (...ss: { steps: number; stroke: number; flash: number }[]) => ss.reduce((a, b) => (b.steps ? b : a), { steps: 0, stroke: 0, flash: 0 });

const WIDE_P: V3 = [0, 8.5, 25], WIDE_L: V3 = [0, 8.5, -2];
const IN_L: V3 = [CLOUD[0], CLOUD[1], CLOUD[2] + 2];

type Shot = { p: [V3, V3]; l: [V3, V3]; fov?: number; st: (u: number, d: number, t: number) => Partial<WorldState> };
const SH: Shot[] = [
  /* 0 hook */ { p: [[-6, 2.2, 16], [-3.5, 3, 14]], l: [[1, 7, 0], [1, 7.5, 0]], st: (u) => ({ ...strike(u, 1.0), rain: 1 }) },
  /* 1 questions */ { p: [[8, 4, 20], [5, 5, 21]], l: [[0, 8, -2], [0, 8, -2]], st: (u) => ({ ...maxS(strike(u, 0.3), strike(u, 1.9, 0.3)), rain: 1 }) },
  /* 2 light first */ { p: [[-7, 1.6, 17], [-5, 1.9, 16]], l: [[1, 7, 0], [1, 7, 0]], st: (u) => ({ ...strike(u, 0.2), shock: clamp((u - 1.2) * 2), rain: 1 }) },
  /* 3 brand */ { p: [[0, 6, 26], [0, 8, 20]], l: [[0, 9, -2], [0, 11, -2]], st: (u) => ({ ...strike(u, 1.1), rain: 0.8 }) },
  /* 4 cumulonimbus */ { p: [[2, 8, 21], [4, 9, 25]], l: [[1, 9, -3], [1, 9.5, -3]], fov: 52, st: () => ({ rain: 0.7 }) },
  /* 5 updraft, freezing */ { p: [[0, 10.5, 9], [0, 12.5, 7.5]], l: [IN_L, [0, 13.5, -1]], st: () => ({ cut: 1, inside: 1, rain: 0 }) },
  /* 6 collisions */ { p: [[-2, 13, 7], [1, 13, 6.5]], l: [IN_L, IN_L], st: () => ({ cut: 1, inside: 1, rain: 0 }) },
  /* 7 charges move */ { p: [[1.5, 13.5, 5.6], [-1, 13, 5.4]], l: [IN_L, IN_L], st: (u, d) => ({ cut: 1, inside: 1, sep: 0.25 * (u / d), rain: 0 }) },
  /* 8 separation */ { p: [[0, 13, 9], [0, 13, 10.5]], l: [IN_L, IN_L], st: (u, d) => ({ cut: 1, inside: 1, sep: clamp(0.25 + (u / d) * 1.2), top: clamp((u / d - 0.5) * 2), rain: 0 }) },
  /* 9 battery */ { p: [[3, 12, 13], [4, 11.5, 15]], l: [[0, 13, -1], [0, 12.5, -1]], st: () => ({ cut: 0.6, inside: 1, sep: 1, top: 1, rain: 0.3 }) },
  /* 10 ground charge */ { p: [[0, 5, 22], [-2, 6, 23]], l: [[0, 6.5, -1], [0, 6.5, -1]], st: (u, d) => ({ cut: 0.5, inside: 1, sep: 1, top: 1, ground: clamp((u / d) * 1.6), rain: 0.6 }) },
  /* 11 breakdown */ { p: [[-3, 5, 20], [-1, 5.5, 18]], l: [[1, 7, -1], [1, 7.3, -1]], st: () => ({ cut: 0.4, inside: 1, sep: 1, top: 1, ground: 1, rain: 0.6 }) },
  /* 12 stepped leader */ { p: [[7, 5, 17], [6, 6, 15.5]], l: [[1.5, 7.5, 0], [2.5, 6.5, 0]], st: (u, d) => ({ steps: 1 + Math.floor(clamp(u / (d * 0.92)) * 10.99), top: 1, ground: 1, rain: 0.6 }) },
  /* 13 streamer */ { p: [[8, 4.4, 9], [7, 5, 8]], l: [[3.2, 5.6, 1], [3.2, 5.4, 1]], st: (u, d) => ({ steps: 11, streamer: clamp(u / (d * 0.8)), ground: 1, rain: 0.6 }) },
  /* 14 return stroke */ { p: [[-2, 5, 21], [0, 5.5, 19]], l: [[1.5, 7, 0], [1.5, 7.2, 0]], st: (u) => { const v = u - 0.25; const s = v < 0 ? 0 : Math.exp(-v * 1.6) * (0.65 + 0.35 * Math.cos(v * 40)); return { steps: MAXSTEP, streamer: 1, stroke: s, flash: s, rain: 0.6 }; } },
  /* 15 under a second */ { p: [[4, 4, 20], [3, 4.5, 19]], l: [[1.5, 7, 0], [1.5, 7, 0]], st: (u) => ({ ...maxS(strike(u, 0.1, 0.6), strike(u, 1.4, 0.3)), rain: 0.6 }) },
  /* 16 30,000° */ { p: [[-1, 7.5, 11], [0, 7.8, 10]], l: [[1.8, 7.6, 0.5], [2, 7.4, 0.5]], st: (u) => { const s = 0.55 + 0.45 * Math.abs(Math.sin(u * 7)); return { steps: MAXSTEP, streamer: 1, stroke: s, flash: s * 0.6, rain: 0.4 }; } },
  /* 17 shock = thunder */ { p: [[-3, 6, 18], [-2, 6.5, 17]], l: [[1.5, 7, 0], [1.5, 7, 0]], st: (u) => ({ ...strike(u, 0.05, 0.25), shock: 1, rain: 0.6 }) },
  /* 18 light vs sound */ { p: [[-9, 1.8, 13], [-8, 2, 12]], l: [[1, 6.5, 0], [1, 6.5, 0]], st: (u) => ({ ...strike(u, 0.2), shock: clamp((u - 1.4) * 1.5), rain: 0.8 }) },
  /* 19 count ÷3 */ { p: [[-8, 2.5, 18], [-6, 3, 17]], l: [[0, 7, -1], [0, 7, -1]], st: (u, d) => ({ ...strike(u, 0.1), shock: clamp((u - (d - 1.6)) * 2), rain: 0.8 }) },
  /* 20 globe */ { p: [[0, 7, 15], [0, 7.6, 13.5]], l: [[0, 7, 0], [0, 7, 0]], st: () => ({ globe: 1, rain: 0 }) },
  /* 21 empire state */ { p: [[3, 4, 17], [4, 6, 16]], l: [[-4, 8, 0], [-4, 9, 0]], st: () => ({ empire: 1, rain: 0.6 }) },
  /* 22 lightning rod */ { p: [[7.5, 3, 9], [8, 4, 8.5]], l: [[3.2, 3.6, 1], [3.2, 3.2, 1]], st: (u) => { const s = maxS(strike(u, 0.3), strike(u, 3.3)); return { ...s, ground: 1, current: clamp((u - 0.7) * 2), rain: 0.7 }; } },
  /* 23 payoff */ { p: [[0, 7, 24], [0, 7.5, 21]], l: [[1, 8, -2], [1, 8, -2]], st: (u) => ({ ...strike(u, 0.3), shock: clamp((u - 1) * 2), rain: 0.9 }) },
  /* 24 outro */ { p: [[-6, 2.5, 17], [-4, 3.5, 19]], l: [[1, 8, -1], [1, 8.5, -1]], st: (u) => ({ ...strike(u, 1.2), rain: 1 }) },
];

const shotAt = (t: number) => {
  let i = 0;
  for (let j = 0; j < LINES.length; j++) if (t >= LINES[j].start - 0.05) i = j;
  const s0 = i === 0 ? 0 : LINES[i].start - 0.05, s1 = i + 1 < LINES.length ? LINES[i + 1].start - 0.05 : DURATION + TAIL;
  return { i, u: t - s0, d: s1 - s0 };
};

const Cam: React.FC<{ p: V3; l: V3; fov: number }> = ({ p, l, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(p[0], p[1], p[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(l[0], l[1], l[2]);
  return null;
};

// pieces only some shots need: the 10 km ruler, updraft arrows, collision sparks, the strained air between cloud and ground
const Extras: React.FC<{ i: number; t: number; u: number }> = ({ i, t, u }) => (
  <group>
    {i === 4 && (
      <group position={[10.5, 0, -3]}>
        <Seg a={[0, 0, 0]} b={[0, Math.min(16.5, u * 9), 0]} r={0.06} color="#f2c230" />
        {[...Array(11)].map((_, k) => (k * 1.65 < u * 9 ? <Seg key={k} a={[-0.4, k * 1.65, 0]} b={[0.4, k * 1.65, 0]} r={0.04} color="#f2c230" /> : null))}
      </group>
    )}
    {i === 5 && [...Array(9)].map((_, k) => { const x = CLOUD[0] - 4 + k, ph = (t * 0.8 + rnd(k)) % 1, y = CLOUD[1] - 3.5 + ph * 6;
      return (<group key={k}><Seg a={[x, y, -0.6]} b={[x, y + 1.2, -0.6]} r={0.05} color="#ff8a3a" opacity={Math.sin(ph * Math.PI)} />
        <mesh position={[x, y + 1.35, -0.6]}><coneGeometry args={[0.16, 0.35, 8]} /><meshBasicMaterial color="#ff8a3a" transparent opacity={Math.sin(ph * Math.PI)} /></mesh></group>); })}
    {(i === 6 || i === 7) && [...Array(10)].map((_, k) => { const ph = (t * 1.7 + rnd(k + 30)) % 1; if (ph > 0.25) return null;
      return <mesh key={k} position={[CLOUD[0] + (rnd(k + Math.floor(t * 1.7)) - 0.5) * 4, CLOUD[1] + (rnd(k + 50 + Math.floor(t * 1.7)) - 0.5) * 4, CLOUD[2] + 2.3]} scale={0.15 + ph * 1.2}><sphereGeometry args={[0.3, 10, 8]} /><meshBasicMaterial color="#fff6c8" transparent opacity={1 - ph * 4} toneMapped={false} /></mesh>; })}
    {i === 11 && [...Array(14)].map((_, k) => { const x = -7 + k * 1.1, on = (Math.sin(t * 11 + k * 2.1) + 1) / 2;
      return <group key={k}>{[...Array(6)].map((__, m) => { const y0 = 0.6 + ((m + t * 2.5) % 6) * 1.5; return <Seg key={m} a={[x, y0, 0.5]} b={[x, y0 + 0.6, 0.5]} r={0.025} color="#bfe0ff" opacity={0.25 + 0.5 * on} />; })}</group>; })}
  </group>
);

const pop = (u: number, at: number) => { const x = clamp((u - at) / 0.35); return x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * 9) ; };
const Tag: React.FC<{ x: number; y: number; u: number; at?: number; color?: string; size?: number; children: React.ReactNode }> = ({ x, y, u, at = 0.2, color = YEL, size = 52, children }) => {
  const k = pop(u, at);
  if (u < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) rotate(${-2 + Math.sin(u * 2) * 1.5}deg)`, background: color, color: color === YEL ? "#141414" : "#fff",
      fontFamily: NOTO, fontWeight: 800, fontSize: size, padding: "10px 30px 18px", borderRadius: 22, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,.45)", direction: "rtl" }}>{children}</div>
  );
};
const BoltIcon: React.FC<{ s: number; c?: string }> = ({ s, c = YEL }) => (<svg width={s} height={s} viewBox="0 0 24 24" style={{ verticalAlign: "middle" }}><path d="M13 2 4 14h6l-2 8 10-13h-6l1-7z" fill={c} /></svg>);
const SpeakerIcon: React.FC<{ s: number; c?: string; t: number }> = ({ s, c = "#fff", t }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ verticalAlign: "middle" }}><path d="M3 9h4l5-4v14l-5-4H3z" fill={c} />
    {[0, 1, 2].map((k) => <path key={k} d={`M${14 + k * 3} ${8 - k} q${2 + k} ${4 + k} 0 ${8 + 2 * k}`} stroke={c} strokeWidth={1.6} fill="none" opacity={0.35 + 0.65 * ((Math.sin(t * 8 - k) + 1) / 2)} />)}</svg>
);
const Box: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, background: "rgba(8,12,24,.78)", border: "3px solid rgba(255,255,255,.18)", borderRadius: 28, padding: 26, color: "#fff", fontFamily: NOTO, fontWeight: 800, direction: "rtl", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>{children}</div>
);

const Overlay: React.FC<{ i: number; u: number; d: number; t: number }> = ({ i, u, d, t }) => {
  const W = 1080;
  switch (i) {
    case 1: return (<><Tag x={W * 0.3} y={200} u={u} at={0.3}><BoltIcon s={56} c="#141414" /> البرق منين؟</Tag><Tag x={W * 0.68} y={340} u={u} at={1.5} color="#2f7fd8">الرعد إزاي؟</Tag></>);
    case 2: { const k = clamp((u - 0.2) / (d - 0.6));
      return (<Box x={90} y={830} w={900}><div style={{ position: "relative", height: 150 }}>
        <div style={{ position: "absolute", top: 70, left: 30, right: 30, height: 10, background: "rgba(255,255,255,.25)", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 70, right: 30, width: `${k * 92}%`, height: 10, background: YEL, borderRadius: 5 }} />
        <div style={{ position: "absolute", right: 0, top: 0, textAlign: "center", fontSize: 40 }}><BoltIcon s={60} /><div>نشوف</div></div>
        <div style={{ position: "absolute", left: 0, top: 0, textAlign: "center", fontSize: 40, opacity: k > 0.9 ? 1 : 0.35 }}><SpeakerIcon s={60} t={t} /><div>نسمع</div></div>
      </div></Box>); }
    case 3: { const k = pop(u, 0.15);
      return (<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ transform: `scale(${k * (1 + u * 0.04)})`, fontFamily: RUQAA, fontSize: 190, color: "#fff", textShadow: `0 0 60px rgba(150,200,255,.8), 0 8px 0 #000`, direction: "rtl" }}>إيه الحكاية؟</div></div>); }
    case 4: return (<><Tag x={W * 0.78} y={200} u={u} at={0.8}>الركامية</Tag><Tag x={W * 0.86} y={540} u={u} at={2.2} size={58}>10 كيلو</Tag></>);
    case 5: return (<><Tag x={W * 0.25} y={940} u={u} at={0.4} color="#d86a2a">هوا سخن طالع</Tag><Tag x={W * 0.72} y={180} u={u} at={1.9} color="#2f7fd8">المية بتتجمد</Tag></>);
    case 6: return (<><Tag x={W * 0.5} y={170} u={u} at={0.6}>تلج بيخبط في تلج</Tag><Tag x={W * 0.5} y={960} u={u} at={1.8} color="#2f7fd8">ملايين المرات</Tag></>);
    case 7: return (<Tag x={W * 0.5} y={180} u={u} at={0.5}>شحنات بتتنقل</Tag>);
    case 8: return (<><Tag x={W * 0.75} y={160} u={u} at={0.6} color="#d8352a">+ خفيف فوق</Tag><Tag x={W * 0.27} y={980} u={u} at={2.0} color="#2f7fd8">− تقيل تحت</Tag></>);
    case 9: { const k = pop(u, 0.3);
      return (<div style={{ position: "absolute", left: 70, top: 300, transform: `scale(${k})`, transformOrigin: "left top" }}>
        <div style={{ width: 64, height: 26, margin: "0 auto", background: "#bbb", borderRadius: "8px 8px 0 0" }} />
        <div style={{ width: 200, height: 420, border: "8px solid #e8e8e8", borderRadius: 30, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: NOTO, fontWeight: 800, fontSize: 110, color: "#fff", textAlign: "center" }}>
          <div style={{ flex: 1, background: "#d8352a", lineHeight: "190px" }}>+</div><div style={{ flex: 1, background: "#2f7fd8", lineHeight: "190px", opacity: 0.75 + 0.25 * Math.sin(t * 6) }}>−</div></div></div>); }
    case 10: return (<Tag x={W * 0.5} y={1000} u={u} at={1.0} color="#d8352a">الأرض + بتشد −</Tag>);
    case 11: { const k = clamp(u / (d * 0.9));
      return (<Box x={140} y={110} w={800}><div style={{ fontSize: 42, marginBottom: 16 }}>الهوا عازل… لحد إمتى؟</div>
        <div style={{ height: 40, background: "rgba(255,255,255,.15)", borderRadius: 20, overflow: "hidden" }}><div style={{ width: `${k * 100}%`, height: "100%", background: k > 0.85 ? "#ff4d3a" : YEL, borderRadius: 20 }} /></div></Box>); }
    case 12: return (<><Tag x={W * 0.3} y={170} u={u} at={0.5}>خطوة.. خطوة</Tag><Tag x={W * 0.72} y={330} u={u} at={1.8} color="#2f7fd8">كل خطوة ≈ 50 متر</Tag></>);
    case 13: return (<Tag x={W * 0.5} y={180} u={u} at={0.7}>خيط صغير طالع يقابله</Tag>);
    case 14: return (<Tag x={W * 0.5} y={170} u={u} at={0.6} size={60}>الوميض!</Tag>);
    case 15: { const a = clamp(u / d) * 330;
      return (<div style={{ position: "absolute", right: 90, top: 120, width: 260, textAlign: "center", fontFamily: NOTO, fontWeight: 800, color: "#fff", fontSize: 44 }}>
        <svg width={240} height={240} viewBox="-50 -50 100 100"><circle r={44} fill="rgba(8,12,24,.8)" stroke="#fff" strokeWidth={5} /><path d={`M0 0 L0 -38 A38 38 0 ${a > 180 ? 1 : 0} 1 ${38 * Math.sin((a * Math.PI) / 180)} ${-38 * Math.cos((a * Math.PI) / 180)} Z`} fill={YEL} opacity={0.85} /><circle r={5} fill="#fff" /></svg>
        <div>أقل من ثانية</div></div>); }
    case 16: { const k = clamp((u - 0.3) / 2.4), temp = Math.round(k * 30000);
      return (<Box x={60} y={110} w={330}><div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
        <div style={{ position: "relative", width: 56, height: 560, background: "rgba(255,255,255,.15)", borderRadius: 28 }}>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${k * 100}%`, background: "linear-gradient(#fff, #ff4d3a)", borderRadius: 28 }} />
          <div style={{ position: "absolute", bottom: "20%", right: -14, width: 84, height: 5, background: "#ffb030" }} /></div>
        <div style={{ fontSize: 34, lineHeight: 1.35 }}><div style={{ color: YEL, fontSize: 52 }}>{temp.toLocaleString("en-US")}°</div><div style={{ marginTop: 300, color: "#ffb030" }}>الشمس<br />6,000°</div>
          {u > 3.1 && <div style={{ color: "#fff", fontSize: 60, transform: `scale(${pop(u, 3.1)})` }}>×5</div>}</div></div></Box>); }
    case 17: return (<Tag x={W * 0.5} y={180} u={u} at={0.5} size={60}>بووم = الرعد</Tag>);
    case 18: { const lk = clamp((u - 0.4) / 0.15), sk = clamp((u - 0.4) / (d - 0.6));
      return (<Box x={90} y={80} w={900}>
        {[["النور", lk, YEL], ["الصوت", sk, "#5fb0ff"]].map(([n, k, c], j) => (
          <div key={j} style={{ display: "flex", alignItems: "center", gap: 20, margin: "12px 0", fontSize: 40 }}>
            <div style={{ width: 130 }}>{n as string}</div>
            <div style={{ flex: 1, height: 26, background: "rgba(255,255,255,.12)", borderRadius: 13, position: "relative" }}>
              <div style={{ position: "absolute", right: 0, width: `${(k as number) * 100}%`, height: "100%", background: c as string, borderRadius: 13 }} /></div></div>))}
        {u > 1 && <div style={{ textAlign: "center", fontSize: 46, color: YEL, transform: `scale(${pop(u, 1)})` }}>أسرع مليون مرة</div>}</Box>); }
    case 19: { const n = Math.min(3, Math.floor(u / 1.0) + 1), done = u > 3.4;
      return (<Box x={240} y={90} w={600}><div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 150, color: YEL, lineHeight: 1.1, transform: `scale(${1 + 0.15 * Math.max(0, 1 - ((u % 1) * 4))})` }}>{done ? "3 ÷ 3" : n}</div>
        <div style={{ fontSize: 44 }}>{done ? "= 1 كيلو بعيد" : "ثانية…"}</div></div></Box>); }
    case 20: { const n = Math.min(44, Math.floor(u * 18));
      return (<Tag x={W * 0.5} y={150} u={u} at={0.2} size={60}>{n} برق كل ثانية</Tag>); }
    case 21: { const n = Math.min(20, Math.floor(u * 1.4 * 1.4));
      return (<><Tag x={W * 0.7} y={170} u={u} at={0.5} color="#2f7fd8">الإمباير ستيت</Tag><Tag x={W * 0.72} y={330} u={u} at={1.3} size={60}>{n} مرة في السنة</Tag></>); }
    case 22: return (<><Tag x={W * 0.6} y={150} u={u} at={0.9}>مانعة الصواعق</Tag><Tag x={W * 0.5} y={1000} u={u} at={3.5} color="#2a9d5a">للأرض بأمان</Tag></>);
    case 23: return (<Box x={110} y={90} w={860}><div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", fontSize: 44 }}>
      {[["سخونية", 0.2], ["←", 0.9], ["تمدد", 1.2], ["←", 1.9], ["رعد", 2.2]].map(([s, at], j) => <div key={j} style={{ transform: `scale(${u > (at as number) ? pop(u, at as number) : 0})`, color: j === 4 ? YEL : "#fff" }}>{s as string}</div>)}</div></Box>);
    default: return null;
  }
};

// captions: words appear one by one across the line's spoken time, keywords in yellow
const Captions: React.FC<{ t: number }> = ({ t }) => {
  let li = -1;
  for (let j = 0; j < LINES.length; j++) if (t >= LINES[j].start - 0.05) li = j;
  if (li < 0) return null;
  const L = LINES[li], n = L.words.length, lens = L.words.map((w) => w.w.length + 2), tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const size = n > 13 ? 50 : 60;
  return (
    <div style={{ position: "absolute", top: PANEL.top + PANEL.h + 40, left: 60, right: 60, textAlign: "center", direction: "rtl", fontFamily: NOTO, fontWeight: 800, fontSize: size, lineHeight: 1.5, color: "#fff" }}>
      {L.words.map((w, j) => { const at = L.start + ((L.end - L.start) * acc) / tot; acc += lens[j]; const k = clamp((t - at) / 0.12);
        return <span key={j} style={{ color: w.k ? YEL : "#fff", opacity: 0.15 + 0.85 * k, display: "inline-block", transform: `translateY(${(1 - k) * 10}px)`, margin: "0 8px" }}>{w.w}</span>; })}
    </div>
  );
};

export const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { i, u, d } = shotAt(t);
  const S = SH[i], k = clamp(u / d);
  const st: WorldState = { t, flash: 0, cut: 0, inside: 0, sep: 0, top: 0, ground: 0, steps: 0, stroke: 0, streamer: 0, shock: 0, rain: 1, globe: 0, empire: 0, current: 0, ...S.st(u, d, t) };
  // the camera always creeps along its path, plus a slow hand-held drift; shot 17 shakes with the thunder
  const shake = i === 17 ? Math.exp(-u * 1.5) * 0.25 : 0;
  const p = lv(S.p[0], S.p[1], k), l = lv(S.l[0], S.l[1], k);
  const pos: V3 = [p[0] + Math.sin(t * 0.7) * 0.25 + Math.sin(t * 37) * shake, p[1] + Math.cos(t * 0.53) * 0.15 + Math.cos(t * 41) * shake, p[2]];
  const sky = new THREE.Color("#070c1a").lerp(new THREE.Color("#3a4a78"), clamp(st.flash) * 0.7);
  const fade = Math.min(1, t / 0.4, (DURATION + TAIL - t) / 0.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", direction: "rtl" }}>
        <div style={{ fontFamily: RUQAA, fontSize: 92, color: "#fff", lineHeight: 1.2 }}>إزاي الرعد والبرق بيحصلوا؟</div>
        <div style={{ fontFamily: NOTO, fontWeight: 800, fontSize: 54, color: YEL, marginTop: 6 }}>من السحابة لحد صوت البووم</div>
      </div>
      <div style={{ position: "absolute", top: PANEL.top, left: 0, width: 1080, height: PANEL.h, overflow: "hidden", borderTop: "4px solid #1d2438", borderBottom: "4px solid #1d2438" }}>
        <ThreeCanvas width={1080} height={PANEL.h} camera={{ position: pos, fov: S.fov ?? 48, near: 0.1, far: 200 }}>
          <color attach="background" args={[sky.getHex()]} />
          <fog attach="fog" args={[sky.getHex(), 28, 75]} />
          <Cam p={pos} l={l} fov={S.fov ?? 48} />
          <World s={st} />
          <Extras i={i} t={t} u={u} />
        </ThreeCanvas>
        <div style={{ position: "absolute", inset: 0, background: "#dfe9ff", opacity: clamp(st.flash) * 0.35, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55))" }} />
        <Overlay i={i} u={u} d={d} t={t} />
      </div>
      <Captions t={t} />
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: RUQAA, fontSize: 64, color: YEL, opacity: 0.9 }}>إيه الحكاية؟</div>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { ROD };
