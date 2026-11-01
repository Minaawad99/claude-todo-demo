import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import data from "./data.json";
import { World, WorldState, ZERO, MICRO, CEN_Y, clamp, lerp, ease } from "./World";

// «ليه جهاز الرنين صوته عالي؟» — one 3D shot per script line, timed by data.json (from videos/mri/make-data.py).
// The page is the channel's look at 1080×1920 with Noto everywhere (the user's rule): title, a 3D panel, word-by-word
// captions, the brand.

const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800", "900"], subsets: ["arabic"] });

type V3 = [number, number, number];
type Line = { start: number; end: number; words: { w: string; k: boolean }[] };
const LINES = (data as { duration: number; lines: Line[] }).lines;
export const DURATION = (data as { duration: number }).duration;
export const TAIL = 1.5;

const PANEL = { top: 372, h: 1140 };
const YEL = "#f2c230";
const lv = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const M = (x: number, y: number, z: number): V3 => [MICRO[0] + x, MICRO[1] + y, MICRO[2] + z];
const C: V3 = [0, CEN_Y, 0];

type St = Partial<Omit<WorldState, "t">>;
type Shot = { p: [V3, V3]; l: [V3, V3]; fov?: number; bg?: string; st: (u: number, d: number, t: number) => St };
const SH: Shot[] = [
  /* 0 hook: the patient slides in */ { p: [[5.2, 3.0, 7.6], [2.3, 1.75, 4.5]], l: [[0.4, 1.0, 1.2], [0, 1.2, 0.3]], st: (u, d) => ({ slide: 0.15 + 0.7 * clamp(u / d), mood: "happy" }) },
  /* 1 the knocking */ { p: [[0.35, 1.5, 2.9], [0.12, 1.42, 2.25]], l: [[0, 1.2, 1.0], [0, 1.2, 1.0]], st: () => ({ slide: 1, grad: 1, mood: "shock" }) },
  /* 2 metal off first */ { p: [[2.4, 2.1, 4.0], [1.9, 1.85, 3.5]], l: [[1.4, 1.05, 2.6], [1.4, 1.05, 2.6]], st: (u, d) => ({ tray: clamp((u - 0.3) / (d * 0.8)), mood: "n" }) },
  /* 3 brand */ { p: [[4.5, 2.6, 5.5], [-1.5, 2.2, 6.2]], l: [C, C], st: () => ({ slide: 0.3, mood: "curious" as never }) },
  /* 4 a giant magnet */ { p: [[3.8, 2.5, 4.8], [2.8, 1.8, 3.5]], l: [C, C], st: (u) => ({ xray: clamp(u / 0.8), field: clamp((u - 0.8) / 1.0) }) },
  /* 5 always on */ { p: [[-2.2, 2.4, 5.2], [-1.4, 2.0, 4.4]], l: [C, C], st: (u) => ({ night: clamp(u / 0.8), field: 0.7, xray: 0.35 }) },
  /* 6 metal gets pulled */ { p: [[2.0, 2.2, 6.5], [0.8, 1.9, 5.4]], l: [[-0.8, 0.9, 1.8], [-0.5, 1.1, 1.3]], st: (u, d) => ({ chair: ease(clamp((u - 0.3) / (d * 0.75))), field: 0.5 }) },
  /* 7 chairs and oxygen tanks stuck */ { p: [[2.4, 1.7, 3.8], [1.7, 1.5, 3.1]], l: [[0, 1.1, 1], [0, 1.15, 1]], st: (u, d) => ({ chair: 1, tank: ease(clamp((u - 0.2) / (d * 0.6))) }) },
  /* 8 the bank card wiped */ { p: [[1.3, 2.05, 3.0], [0.9, 1.95, 2.4]], l: [[0.25, 1.8, 1.15], [0.25, 1.8, 1.15]], st: (u, d) => ({ chair: 1, tank: 1, card: clamp((u - 0.2) / (d * 0.75)) }) },
  /* 9 the secret is water */ { p: [M(0, 0.5, 8), M(0, 0, 6)], l: [M(0, 0, 0), M(0, 0, 0)], bg: "#0d1a2a", st: (u) => ({ room: 0, water: clamp(u / 0.8) }) },
  /* 10 tiny magnets */ { p: [M(-1.5, 1, 7.5), M(0, 0.5, 6.5)], l: [M(0, 0, 0), M(0, 0, 0)], bg: "#0d1a2a", st: (u) => ({ room: 0, spins: clamp(u / 0.8) }) },
  /* 11 they line up */ { p: [M(1.5, 0.6, 7), M(0.5, 0.3, 6.2)], l: [M(0, 0, 0), M(0, 0, 0)], bg: "#0d1a2a", st: (u) => ({ room: 0, spins: 1, align: ease(clamp((u - 0.3) / 1.4)) }) },
  /* 12 the push and the signal */ { p: [M(0, 0.8, 7.2), M(0, 0.4, 6.4)], l: [M(0, 0, 0), M(0, 0, 0)], bg: "#0d1a2a", st: (u, d) => ({ room: 0, spins: 1, align: 1, pulse: clamp((u - 0.2) / (d - 0.3)) }) },
  /* 13 the computer draws a picture */ { p: [[-3.7, 1.75, 1.8], [-3.3, 1.65, 1.5]], l: [C, C], st: () => ({ slide: 1, mood: "n" }) },
  /* 14 and the noise? */ { p: [[0.3, 1.55, 3.0], [0.1, 1.42, 2.3]], l: [[0, 1.2, 0.9], [0, 1.2, 0.9]], st: () => ({ slide: 1, xray: 0.5, grad: 0.25, mood: "curious" as never }) },
  /* 15 the gradient coils switching */ { p: [[2.6, 1.95, 3.1], [1.9, 1.6, 2.4]], l: [C, C], st: (u) => ({ slide: 1, xray: 1, grad: clamp(u / 0.6) }) },
  /* 16 the coil shakes and knocks */ { p: [[0.9, 1.55, 2.8], [0.5, 1.45, 2.3]], l: [[0, 1.2, 0.9], [0, 1.2, 0.9]], st: () => ({ slide: 1, xray: 0.45, grad: 1, mood: "shock" }) },
  /* 17 rock concert, earplugs */ { p: [[0.15, 1.45, 1.95], [0.1, 1.38, 1.65]], l: [[0, 1.18, 1.0], [0, 1.18, 1.0]], fov: 55, st: (u) => ({ slide: 1, grad: 1, plugs: clamp((u - 1.4) / 0.5), mood: u > 1.9 ? "happy" : "worry" }) },
  /* 18 every knock draws a piece */ { p: [[3.0, 2.2, 4.4], [2.2, 1.8, 3.6]], l: [C, C], st: () => ({ slide: 1, grad: 1, xray: 0.25, mood: "happy" }) },
  /* 19 payoff */ { p: [[3.6, 2.0, 4.4], [-1.6, 2.5, 6.0]], l: [[0, 1.2, 1], [0, 1.2, 1]], st: (u, d) => ({ slide: 1 - clamp(u / d), mood: "happy" }) },
  /* 20 outro */ { p: [[-3.0, 2.6, 6.2], [3.2, 2.0, 5.2]], l: [C, C], st: () => ({ slide: 0, mood: "happy" }) },
];

const shotAt = (t: number) => {
  let i = 0;
  for (let j = 0; j < LINES.length; j++) if (t >= LINES[j].start - 0.05) i = j;
  const s0 = i === 0 ? 0 : LINES[i].start - 0.05, s1 = i + 1 < LINES.length ? LINES[i + 1].start - 0.05 : DURATION + TAIL;
  return { i, u: t - s0, d: s1 - s0 };
};

export const Cam: React.FC<{ p: V3; l: V3; fov: number }> = ({ p, l, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(p[0], p[1], p[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(l[0], l[1], l[2]);
  return null;
};

const pop = (u: number, at: number) => { const x = clamp((u - at) / 0.35); return x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * 9); };
const Tag: React.FC<{ x: number; y: number; u: number; at?: number; color?: string; size?: number; children: React.ReactNode }> = ({ x, y, u, at = 0.2, color = YEL, size = 52, children }) => {
  if (u < at) return null;
  const k = pop(u, at);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) rotate(${-2 + Math.sin(u * 2) * 1.5}deg)`, background: color, color: color === YEL ? "#141414" : "#fff",
      fontFamily: NOTO, fontWeight: 800, fontSize: size, padding: "10px 30px 18px", borderRadius: 22, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,.45)", direction: "rtl" }}>{children}</div>
  );
};
const Box: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, background: "rgba(8,12,24,.8)", border: "3px solid rgba(255,255,255,.18)", borderRadius: 28, padding: 26, color: "#fff", fontFamily: NOTO, fontWeight: 800, direction: "rtl", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>{children}</div>
);
const Speaker: React.FC<{ s: number; t: number; c?: string }> = ({ s, t, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ verticalAlign: "middle" }}><path d="M3 9h4l5-4v14l-5-4H3z" fill={c} />
    {[0, 1, 2].map((k) => <path key={k} d={`M${14 + k * 3} ${8 - k} q${2 + k} ${4 + k} 0 ${8 + 2 * k}`} stroke={c} strokeWidth={1.6} fill="none" opacity={0.35 + 0.65 * ((Math.sin(t * 10 - k) + 1) / 2)} />)}</svg>
);
const NoRay: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="-12 -12 24 24" style={{ verticalAlign: "middle" }}><circle r="10" fill="none" stroke="#ff5a4a" strokeWidth="2.4" />
    {[0, 1, 2].map((k) => <path key={k} d="M0 0 L0 -7" stroke="#fff" strokeWidth="2" transform={`rotate(${k * 120})`} />)}<circle r="2" fill="#fff" /><path d="M-7 7 L7 -7" stroke="#ff5a4a" strokeWidth="2.6" /></svg>
);

// an MRI-style head slice that draws itself from the top down; k 0..1, `knock` brightens the newest rows
const Scan: React.FC<{ k: number; w: number; t: number }> = ({ k, w, t }) => {
  const h = w * 1.15, rows = Math.floor(k * 24);
  return (
    <svg width={w} height={h} viewBox="0 0 200 230" style={{ display: "block" }}>
      <defs><clipPath id="rev"><rect x="0" y="0" width="200" height={(rows / 24) * 230} /></clipPath>
        <radialGradient id="brain" cx=".5" cy=".45" r=".6"><stop offset="0" stopColor="#cfcfcf" /><stop offset=".7" stopColor="#8a8a8a" /><stop offset="1" stopColor="#4a4a4a" /></radialGradient></defs>
      <rect width="200" height="230" fill="#000" />
      <g clipPath="url(#rev)">
        <ellipse cx="100" cy="112" rx="82" ry="100" fill="#3a3a3a" />
        <ellipse cx="100" cy="110" rx="70" ry="88" fill="#111" />
        <ellipse cx="100" cy="108" rx="64" ry="80" fill="url(#brain)" />
        {[...Array(9)].map((_, i) => <path key={i} d={`M${40 + i * 15} ${50 + (i % 3) * 8} q8 ${20 + (i % 2) * 10} -2 ${40 + (i % 3) * 12} q10 12 4 ${30}`} stroke="#555" strokeWidth="3" fill="none" />)}
        <ellipse cx="85" cy="112" rx="10" ry="22" fill="#1a1a1a" /><ellipse cx="115" cy="112" rx="10" ry="22" fill="#1a1a1a" />
        <path d="M100 30 V190" stroke="#2a2a2a" strokeWidth="3" />
        <ellipse cx="100" cy="190" rx="22" ry="12" fill="#6a6a6a" />
      </g>
      {k < 1 && <rect x="0" y={(rows / 24) * 230 - 3} width="200" height="6" fill="#7cf29a" opacity={0.6 + 0.4 * Math.sin(t * 20)} />}
    </svg>
  );
};
const Monitor: React.FC<{ x: number; y: number; w: number; k: number; t: number }> = ({ x, y, w, k, t }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: 16, background: "#1c2430", borderRadius: 24, border: "4px solid #3a4658", boxShadow: "0 16px 50px rgba(0,0,0,.6)" }}>
    <Scan k={k} w={w} t={t} />
  </div>
);

const Overlay: React.FC<{ i: number; u: number; d: number; t: number }> = ({ i, u, d, t }) => {
  const W = 1080;
  switch (i) {
    case 0: return (<Tag x={W * 0.5} y={150} u={u} at={1.2} size={54}><NoRay s={56} /> من غير أشعة</Tag>);
    case 1: { const s = 1 + 0.12 * (Math.sin(t * 9.5 * Math.PI) > 0.6 ? 1 : 0); return (<div style={{ position: "absolute", left: W * 0.5, top: 170, transform: `translate(-50%,-50%) scale(${pop(u, 0.2) * s})` }}><Tag x={0} y={0} u={9} at={0} size={64} color="#d8352a">خبط! <Speaker s={60} t={t} /></Tag></div>); }
    case 2: return (<><Tag x={W * 0.32} y={160} u={u} at={0.4} color="#d8352a">ممنوع الحديد</Tag><Tag x={W * 0.7} y={300} u={u} at={1.6}>حتى الكارت</Tag></>);
    case 3: { const k = pop(u, 0.15);
      return (<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ transform: `scale(${k * (1 + u * 0.04)})`, fontFamily: NOTO, fontWeight: 900, fontSize: 150, color: "#fff", textShadow: "0 0 50px rgba(95,208,255,.8), 0 8px 0 #000", direction: "rtl" }}>إيه الحكاية؟</div></div>); }
    case 4: { const n = Math.round(30000 * ease(clamp((u - 1.0) / 1.6)));
      return (<><Tag x={W * 0.3} y={150} u={u} at={0.3}>مغناطيس عملاق</Tag>
        {u > 1.0 && <Box x={560} y={830} w={440}><div style={{ textAlign: "center", fontSize: 38, color: "#cfe6ff" }}>أقوى من مغناطيس الأرض</div><div style={{ textAlign: "center", fontSize: 92, color: YEL, lineHeight: 1.2 }}>×{n.toLocaleString("en-US")}</div></Box>}</>); }
    case 5: return (<><Tag x={W * 0.5} y={150} u={u} at={0.5} size={58} color="#2f7fd8">شغال 24 ساعة</Tag><Tag x={W * 0.5} y={1000} u={u} at={1.6}>حتى من غير حد</Tag></>);
    case 6: return (<Tag x={W * 0.6} y={160} u={u} at={0.8} size={60} color="#d8352a">بيتشد!</Tag>);
    case 7: return (<><Tag x={W * 0.27} y={170} u={u} at={0.3}>كراسي</Tag><Tag x={W * 0.7} y={320} u={u} at={1.1} color="#2a9d5a">أنابيب أكسجين</Tag></>);
    case 8: return (<Tag x={W * 0.5} y={1000} u={u} at={d * 0.75} size={60} color="#d8352a">اتمسح!</Tag>);
    case 9: return (<><Tag x={W * 0.5} y={150} u={u} at={0.4} size={60} color="#2f7fd8">المية</Tag><Tag x={W * 0.5} y={1000} u={u} at={1.4}>H₂O</Tag></>);
    case 10: return (<Tag x={W * 0.5} y={150} u={u} at={0.6}>كل واحدة = مغناطيس صغير</Tag>);
    case 11: return (<><Tag x={W * 0.5} y={150} u={u} at={0.3}>ملايين</Tag><Tag x={W * 0.5} y={1000} u={u} at={1.6} color="#2f7fd8">في اتجاه واحد</Tag></>);
    case 12: return (<><Tag x={W * 0.3} y={150} u={u} at={0.3} color="#d8a020">زقّة!</Tag><Tag x={W * 0.7} y={1000} u={u} at={d * 0.35} color="#2a9d5a">إشارة</Tag></>);
    case 13: return (<><Monitor x={560} y={120} w={420} k={clamp((u - 0.3) / (d - 0.6))} t={t} /><Tag x={W * 0.25} y={1000} u={u} at={1.0}>عضم، عضلة، مخ</Tag></>);
    case 14: return (<><Tag x={W * 0.5} y={150} u={u} at={0.3} size={60}>والدوشة؟</Tag><Tag x={W * 0.5} y={1000} u={u} at={1.5} color="#2f7fd8">الإشارة جاية منين؟</Tag></>);
    case 15: return (<><Tag x={W * 0.5} y={150} u={u} at={0.5}>ملفات بتشتغل وتقفل</Tag><Tag x={W * 0.5} y={1000} u={u} at={1.8} color="#d8352a">بسرعة جامدة</Tag></>);
    case 16: return (<Tag x={W * 0.5} y={160} u={u} at={0.8} size={58}><Speaker s={56} t={t} c="#141414" /> سماعة عملاقة</Tag>);
    case 17: { const k = clamp((u - 0.2) / 1.0);
      return (<><Box x={90} y={80} w={900}><div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}><div style={{ width: 250 }}>حفلة روك</div>
        <div style={{ flex: 1, height: 34, background: "rgba(255,255,255,.12)", borderRadius: 17, overflow: "hidden" }}><div style={{ width: `${k * (92 + 4 * Math.sin(t * 20))}%`, height: "100%", background: "linear-gradient(90deg,#2a9d5a,#f2c230,#d8352a)", borderRadius: 17 }} /></div></div></Box>
        <Tag x={W * 0.5} y={1010} u={u} at={1.5} color="#e8a020">سدادات ودن</Tag></>); }
    case 18: { const knocks = Math.floor(u * 4.75);
      return (<><Monitor x={560} y={120} w={420} k={clamp(knocks / Math.max(1, (d - 0.3) * 4.75))} t={t} /><Tag x={W * 0.27} y={1000} u={u} at={0.6}>كل خبطة = حتة</Tag></>); }
    case 19: return (<Box x={200} y={90} w={680}>{[["من غير أشعة", 0.4], ["من غير ما حد يفتحك", 1.4]].map(([s, at], j) => (
      <div key={j} style={{ fontSize: 50, margin: "8px 0", transform: `scale(${u > (at as number) ? pop(u, at as number) : 0})`, transformOrigin: "right center" }}><span style={{ color: "#7cf29a" }}>✓</span> {s as string}</div>))}</Box>);
    case 20: return (<Tag x={W * 0.5} y={160} u={u} at={0.4} size={64}>قولولنا!</Tag>);
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
  const chars = L.words.reduce((a, w) => a + w.w.length + 1, 0), size = chars > 62 ? 46 : n > 11 ? 52 : 60;
  return (
    <div style={{ position: "absolute", top: PANEL.top + PANEL.h + 40, left: 60, right: 60, textAlign: "center", direction: "rtl", fontFamily: NOTO, fontWeight: 800, fontSize: size, lineHeight: 1.5, color: "#fff" }}>
      {L.words.map((w, j) => { const at = L.start + ((L.end - L.start) * acc) / tot; acc += lens[j]; const k = clamp((t - at) / 0.12);
        return <span key={j} style={{ color: w.k ? YEL : "#fff", opacity: 0.15 + 0.85 * k, display: "inline-block", transform: `translateY(${(1 - k) * 10}px)`, margin: "0 8px" }}>{w.w}</span>; })}
    </div>
  );
};

export const MRI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { i, u, d } = shotAt(t);
  const S = SH[i], k = clamp(u / d);
  const st: WorldState = { t, ...ZERO, ...S.st(u, d, t) } as WorldState;
  // the camera always creeps along its path, plus a slow hand-held drift; knocking shots jolt with the coils
  const jolt = st.grad * (Math.sin(t * 9.5 * Math.PI) > 0.6 ? 1 : 0) * 0.012;
  const p = lv(S.p[0], S.p[1], k), l = lv(S.l[0], S.l[1], k);
  const sc = i >= 9 && i <= 12 ? 0.3 : 0.14;
  const pos: V3 = [p[0] + Math.sin(t * 1.1) * sc + Math.sin(t * 61) * jolt, p[1] + Math.cos(t * 0.9) * sc * 0.6 + Math.cos(t * 47) * jolt, p[2] + Math.sin(t * 0.8) * sc * 0.8];
  const bg = S.bg ?? (st.night > 0.5 ? "#0e1620" : "#dfe8ef");
  const fade = Math.min(1, (DURATION + TAIL - t) / 0.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", direction: "rtl" }}>
        <div style={{ fontFamily: NOTO, fontWeight: 900, fontSize: 84, color: "#fff", lineHeight: 1.2 }}>ليه جهاز الرنين صوته عالي؟</div>
        <div style={{ fontFamily: NOTO, fontWeight: 800, fontSize: 54, color: YEL, marginTop: 10 }}>وممنوع تدخله بأي حديد!</div>
      </div>
      <div style={{ position: "absolute", top: PANEL.top, left: 0, width: 1080, height: PANEL.h, overflow: "hidden", borderTop: "4px solid #1d2438", borderBottom: "4px solid #1d2438" }}>
        <ThreeCanvas width={1080} height={PANEL.h} camera={{ position: pos, fov: S.fov ?? 48, near: 0.05, far: 120 }}>
          <color attach="background" args={[bg]} />
          <Cam p={pos} l={l} fov={S.fov ?? 48} />
          <World s={st} />
        </ThreeCanvas>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.5))" }} />
        <Overlay i={i} u={u} d={d} t={t} />
      </div>
      <Captions t={t} />
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: NOTO, fontWeight: 900, fontSize: 60, color: YEL, opacity: 0.9 }}>إيه الحكاية؟</div>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
