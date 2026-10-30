import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadRuqaa } from "@remotion/google-fonts/ArefRuqaa";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import data from "./data.json";
import { Cam } from "../lightning/Lightning";
import { Valley, Sun, Person, Bow, Drop, RayPath, Prism, Plane, CloudDeck, Seg, COLORS, NIDX, HEAD, trace, bRainbow, sunDir, antiDir, clamp, lerp, rnd, DROP_R } from "./World";

// «إزاي قوس قزح بيتكوّن؟» — one 3D shot per script line, timed by data.json (from videos/rainbow/make-data.py).
// Same page as the lightning video: Ruqaa title, a 3D panel, word-by-word captions, the brand.

const { fontFamily: RUQAA } = loadRuqaa("normal", { weights: ["700"] });
const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800"], subsets: ["arabic"] });

type V3 = [number, number, number];
type Line = { start: number; end: number; words: { w: string; k: boolean }[] };
const LINES = (data as { duration: number; lines: Line[] }).lines;
export const DURATION = (data as { duration: number }).duration;
export const TAIL = 1.5;
const PANEL = { top: 372, h: 1140 };
const YEL = "#f2c230";
const lv = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

type Scene = "land" | "drop" | "prism" | "spectrum" | "plane";
type St = { scene: Scene; e: number; bow: number; bow2: number; rain: number; warm: number; gloom: number; sun: boolean; over: boolean;
  people: { x: number; shirt: string; walk?: number; bowX?: number }[]; ray: number; rays: "none" | "white" | "fan" | "full" | "double"; angle: boolean;
  sky: "none" | "many" | "two"; cone: number; side: number };
const BASE: St = { scene: "land", e: 22, bow: 1, bow2: 0, rain: 0.5, warm: 0, gloom: 0, sun: false, over: false, people: [{ x: 0, shirt: "#d8352a" }], ray: 0, rays: "none", angle: false, sky: "none", cone: 0, side: 0 };

const BEHIND = { p: [[1.4, 2.3, 7], [0.9, 2.1, 5.6]] as [V3, V3], l: [[0, 15, -60], [0, 15.5, -60]] as [V3, V3], fov: 80 };
const DROPCAM = (a: number, b: number): { p: [V3, V3]; l: [V3, V3]; fov: number } => ({ p: [[a, 0.6, 11.5], [b, 0.3, 10.5]], l: [[0.3, 0, 0], [0.3, 0, 0]], fov: 50 });

type Shot = { p: [V3, V3]; l: [V3, V3]; fov: number; st: (u: number, d: number) => Partial<St> };
const SH: Shot[] = [
  /* 0 hook */ { p: [[2.6, 2.0, 9.5], [0.4, 2.7, 4.2]], l: [[-2, 13, -60], [1, 16, -60]], fov: 80, st: (u) => ({ bow: clamp((u - 0.3) / 1.6), rain: 1 }) },
  /* 1 a clear drop */ { ...DROPCAM(-2, 2), st: () => ({ scene: "drop" }) },
  /* 2 rain, no sun, no bow */ { p: [[-2, 2.4, 7], [1, 2.6, 6.5]], l: [[0, 12, -60], [4, 12, -60]], fov: 72, st: () => ({ bow: 0, rain: 1, gloom: 1 }) },
  /* 3 brand */ { p: [[-1.5, 2, 10], [1, 4.2, 6]], l: [[-3, 13, -60], [2, 17, -60]], fov: 80, st: () => ({ rain: 0.3 }) },
  /* 4 white = all colours */ { p: [[0, 0.5, 13], [0, 0.4, 12]], l: [[0, 0, 0], [0, 0, 0]], fov: 50, st: (u, d) => ({ scene: "spectrum", ray: clamp(u / (d * 0.7)) }) },
  /* 5 refraction */ { ...DROPCAM(-1.5, 0), st: (u, d) => ({ scene: "drop", rays: "white", ray: clamp(u / (d * 0.75)) }) },
  /* 6 each colour bends differently */ { ...DROPCAM(0, 1.4), st: (u, d) => ({ scene: "drop", rays: "fan", ray: clamp(u / (d * 0.6)) }) },
  /* 7 like a prism */ { p: [[-1, 1.2, 12], [1, 0.8, 11]], l: [[0, -0.4, 0], [0, -0.4, 0]], fov: 52, st: (u, d) => ({ scene: "prism", ray: clamp(u / (d * 0.7)) }) },
  /* 8 back of the drop, out again */ { ...DROPCAM(1.5, -0.5), st: (u, d) => ({ scene: "drop", rays: "full", ray: clamp(u / (d * 0.8)) }) },
  /* 9 back towards you at 42° */ { p: [[-1.5, -0.8, 12.5], [-2.5, -1.2, 12]], l: [[-1.5, -1, 0], [-1.8, -1.2, 0]], fov: 52, st: () => ({ scene: "drop", rays: "full", ray: 1, angle: true }) },
  /* 10 millions of drops, one colour each */ { p: [[22, 6, 14], [19, 7, 16]], l: [[0, 12, -30], [0, 12, -30]], fov: 60, st: () => ({ sky: "many", bow: 0.55, rain: 0.3 }) },
  /* 11 red from higher, violet from lower */ { p: [[16, 9, 10], [15, 10, 12]], l: [[0, 14, -32], [0, 14, -32]], fov: 55, st: () => ({ sky: "two", bow: 0.45, rain: 0.3 }) },
  /* 12 the cone around your head's shadow */ { p: [[9.5, 6, 10], [4.5, 9.5, 15]], l: [[0, 6, -25], [0, 7, -25]], fov: 66, st: (u, d) => ({ cone: clamp(u / (d * 0.6)), sun: true }) },
  /* 13 sun behind, rain ahead */ { p: [[82, 19, -22], [64, 27, 2]], l: [[0, 14, -40], [0, 14, -38]], fov: 62, st: () => ({ side: 1, sun: true }) },
  /* 14 a high sun sinks the bow */ { ...BEHIND, fov: 78, st: (u, d) => ({ e: lerp(20, 52, clamp((u - 0.4) / (d - 0.8))) }) },
  /* 15 morning / before sunset */ { p: [[-1.5, 2.2, 7.5], [-0.8, 2.4, 6.5]], l: [[0, 18, -60], [0, 19, -60]], fov: 80, st: () => ({ e: 7, warm: 1 }) },
  /* 16 a full circle */ { p: [[0, 3, 9], [0, 30, 55]], l: [[0, 10, -60], [0, -10, -55]], fov: 72, st: (u, d) => ({ over: true, bow: 1, rain: 0.2 }) },
  /* 17 from an airplane */ { p: [[13, 5, 13], [-5, 8.5, 18]], l: [[0, -14, -26], [0, -14, -26]], fov: 75, st: () => ({ scene: "plane", e: 28 }) },
  /* 18 a second, reversed bow */ { ...BEHIND, fov: 86, st: (u) => ({ bow2: clamp((u - 0.3) / 1.2) }) },
  /* 19 two reflections, 51° */ { ...DROPCAM(-1, 1), st: (u, d) => ({ scene: "drop", rays: "double", ray: clamp(u / (d * 0.8)) }) },
  /* 20 everyone has their own bow */ { p: [[-2.5, 2.3, 10.5], [2.5, 3.2, 6.5]], l: [[-4, 13, -60], [4, 15, -60]], fov: 80, st: () => ({ people: [{ x: -1.3, shirt: "#d8352a", bowX: -7 }, { x: 1.3, shirt: "#2f7fd8", bowX: 7 }] }) },
  /* 21 it moves with you */ { p: [[-3.5, 2.2, 8.5], [4, 2.9, 5.5]], l: [[-6, 13, -60], [7, 15, -60]], fov: 80, st: (u, d) => { const x = lerp(-3.5, 3.5, u / d); return { people: [{ x, shirt: "#d8352a", walk: u, bowX: x * 2.5 }] }; } },
  /* 22 Newton: seven colours, seven notes */ { p: [[0, 1.5, 12], [0, 1.2, 11]], l: [[0, -1, 0], [0, -1, 0]], fov: 52, st: () => ({ scene: "prism", ray: 1 }) },
  /* 23 payoff */ { p: [[1, 2, 8], [0.4, 2.3, 6]], l: [[0, 14, -60], [0, 15, -60]], fov: 80, st: () => ({ rain: 0.5, warm: 0.25 }) },
  /* 24 outro */ { p: [[0, 2.2, 6], [0, 3.5, 10]], l: [[0, 15, -60], [0, 16, -60]], fov: 82, st: () => ({ rain: 0.3, warm: 0.15 }) },
];

const shotAt = (t: number) => {
  let i = 0;
  for (let j = 0; j < LINES.length; j++) if (t >= LINES[j].start - 0.05) i = j;
  const s0 = i === 0 ? 0 : LINES[i].start - 0.05, s1 = i + 1 < LINES.length ? LINES[i + 1].start - 0.05 : DURATION + TAIL;
  return { i, u: t - s0, d: s1 - s0 };
};

// drops on the 40–42° cone, each sending one colour to the eye, and the parallel sunlight coming into them
const coneDir = (e: number, deg: number, phi: number): V3 => {
  const a = antiDir(e).a, c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180), ce = Math.cos(e * Math.PI / 180), se = Math.sin(e * Math.PI / 180);
  return [c * a[0] + s * Math.cos(phi), c * a[1] + s * Math.sin(phi) * ce, c * a[2] - s * Math.sin(phi) * se];
};
const SkyDrops: React.FC<{ t: number; e: number; mode: "many" | "two" }> = ({ t, e, mode }) => {
  const R = 45, sd = sunDir(e);
  const list: { k: number; phi: number }[] = mode === "two" ? [{ k: 0, phi: Math.PI / 2 }, { k: 6, phi: Math.PI / 2 }] : [...Array(7)].flatMap((_, k) => [0.75, 1.1, 1.45, 1.8, 2.15, 2.5].map((phi, j) => ({ k, phi: phi + (k % 2) * 0.12 + rnd(j) * 0.03 })));
  return (
    <group>
      {list.map(({ k, phi }, i) => {
        const deg = 42 - k * (2 / 6) * (mode === "two" ? 1 : 1), dir = coneDir(e, mode === "two" ? (k ? 39 : 43) : deg, phi);
        const p: V3 = [HEAD[0] + dir[0] * R, HEAD[1] + dir[1] * R, HEAD[2] + dir[2] * R];
        const ph = (t * 0.7 + rnd(i)) % 1, q: V3 = [lerp(p[0], HEAD[0], ph), lerp(p[1], HEAD[1], ph), lerp(p[2], HEAD[2], ph)];
        const big = mode === "two";
        return (
          <group key={i}>
            <mesh position={p}><sphereGeometry args={[big ? 0.9 : 0.45, 16, 12]} /><meshPhysicalMaterial color="#bfe6ff" transparent opacity={0.6} roughness={0.05} clearcoat={1} /></mesh>
            <Seg a={p} b={HEAD} r={big ? 0.09 : 0.04} color={COLORS[k]} opacity={big ? 0.95 : 0.55} />
            {big && <Seg a={[p[0] + sd[0] * 30, p[1] + sd[1] * 30, p[2] + sd[2] * 30]} b={p} r={0.08} color="#fff6d0" opacity={0.7} />}
            <mesh position={q}><sphereGeometry args={[big ? 0.25 : 0.14, 10, 8]} /><meshBasicMaterial color={COLORS[k]} toneMapped={false} /></mesh>
          </group>
        );
      })}
    </group>
  );
};

// the axis from the sun through the head to its shadow, and lines along the cone to the bow
const Cone: React.FC<{ t: number; e: number; k: number }> = ({ t, e, k }) => {
  const a = antiDir(e).a, sd = sunDir(e), shadowZ = -HEAD[1] / Math.tan(e * Math.PI / 180);
  const R = 52, end: V3 = [HEAD[0] + a[0] * R * 0.85 * k, HEAD[1] + a[1] * R * 0.85 * k, HEAD[2] + a[2] * R * 0.85 * k];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, shadowZ / 2]} scale={[0.5, Math.abs(shadowZ) / 2, 1]}><circleGeometry args={[1, 24]} /><meshBasicMaterial color="#000" transparent opacity={0.35} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, shadowZ]}><circleGeometry args={[0.35 + Math.sin(t * 4) * 0.04, 24]} /><meshBasicMaterial color={YEL} toneMapped={false} /></mesh>
      <Seg a={[sd[0] * 30, HEAD[1] + sd[1] * 30, sd[2] * 30]} b={end} r={0.05} color={YEL} opacity={0.85} />
      {[0.6, 1.0, 1.4, 1.8, 2.2, 2.6].map((phi, j) => { const dir = coneDir(e, 42, phi); const L = R * k; return <Seg key={j} a={HEAD} b={[HEAD[0] + dir[0] * L, HEAD[1] + dir[1] * L, HEAD[2] + dir[2] * L]} r={0.05} color="#ffffff" opacity={0.6} />; })}
    </group>
  );
};

// the side view: parallel sunlight from behind, the viewer, the rain ahead
const SideRays: React.FC<{ t: number; e: number }> = ({ t, e }) => {
  const sd = sunDir(e);
  return (<group>{[...Array(6)].map((_, j) => { const y0 = 2 + j * 5, ph = (t * 0.5 + j / 6) % 1, a: V3 = [0, y0 + sd[1] * 60, sd[2] * 60], b: V3 = [0, y0 - sd[1] * 40, -sd[2] * 40];
    return <group key={j}><Seg a={a} b={b} r={0.12} color="#ffe9a0" opacity={0.45} /><mesh position={lv(a, b, ph)}><sphereGeometry args={[0.5, 10, 8]} /><meshBasicMaterial color="#fff3c0" toneMapped={false} /></mesh></group>; })}</group>);
};

// the big drop with its traced rays
const DropRays: React.FC<{ t: number; mode: St["rays"]; p: number; angle: boolean }> = ({ t, mode, p, angle }) => {
  if (mode === "none") return null;
  const refl = mode === "double" ? 2 : 1, b = bRainbow(NIDX[0], refl) * (mode === "double" ? -1 : 1);
  const white = trace(b, 1.333, refl);
  return (
    <group>
      {mode === "white" && <RayPath pts={white.pts.slice(0, 3)} p={p} color="#ffffff" r={0.05} />}
      {mode !== "white" && <RayPath pts={white.pts.slice(0, 2)} p={clamp(p * 4)} color="#ffffff" r={0.06} />}
      {mode !== "white" && COLORS.map((c, k) => { const tr = trace(b, NIDX[k], refl); const pts = mode === "fan" ? tr.pts.slice(1, 3) : tr.pts.slice(1); return <RayPath key={k} pts={pts} p={clamp(p * 1.33 - 0.33)} color={c} r={0.03} z={0.001 * k} />; })}
      {angle && (() => { const tr = trace(b, NIDX[0], 1), q = tr.pts[tr.pts.length - 2]; return <Seg a={[q[0], q[1], 0]} b={[q[0] - 7, q[1], 0]} r={0.025} color="#ffffff" opacity={0.5 + 0.3 * Math.sin(t * 5)} />; })()}
      {/* a pulse of light running along the white ray */}
      <mesh position={[lerp(white.pts[0][0], white.pts[1][0], (t * 0.8) % 1), white.pts[0][1], 0]}><sphereGeometry args={[0.1, 10, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
    </group>
  );
};

// white sunlight that splits into its seven colours
const Spectrum: React.FC<{ t: number; p: number }> = ({ t, p }) => (
  <group>
    <mesh position={[-6, 0, 0]}><sphereGeometry args={[1.3, 32, 20]} /><meshBasicMaterial color="#fff3c0" toneMapped={false} /></mesh>
    {[...Array(12)].map((_, j) => { const a = (j / 12) * Math.PI * 2 + t * 0.3; return <Seg key={j} a={[-6 + Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0]} b={[-6 + Math.cos(a) * 2.1, Math.sin(a) * 2.1, 0]} r={0.06} color="#ffe27a" />; })}
    <RayPath pts={[[-4.5, 0], [-0.5, 0]]} p={clamp(p * 3)} color="#ffffff" r={0.14} />
    {COLORS.map((c, k) => { const y = (3 - k) * 0.38; return <RayPath key={k} pts={[[-0.5, 0], [1, y], [6, y + Math.sin(t * 2 + k) * 0.05]]} p={clamp(p * 1.5 - 0.5)} color={c} r={0.08} />; })}
  </group>
);

// falling drops behind the close-ups, lit from the side, so the dark background is never still
const Falling: React.FC<{ t: number }> = ({ t }) => (
  <group>{[...Array(110)].map((_, i) => { const z = -3 - rnd(i + 4) * 14, sp = 2.2 + rnd(i + 7) * 2;
    return <mesh key={i} position={[(rnd(i) - 0.5) * 34, 13 - ((t * sp + rnd(i + 2) * 26) % 26), z]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.09 + rnd(i + 9) * 0.1, 8, 6]} /><meshBasicMaterial color={COLORS[i % 7]} transparent opacity={0.35 + 0.35 * rnd(i + 11)} toneMapped={false} /></mesh>; })}</group>
);

const Scene3D: React.FC<{ s: St; t: number }> = ({ s, t }) => {
  if (s.scene === "drop") return (<group><ambientLight intensity={0.6} /><directionalLight position={[-6, 6, 8]} intensity={1.2} /><Drop t={t} /><DropRays t={t} mode={s.rays} p={s.ray} angle={s.angle} />
    <Falling t={t} /></group>);
  if (s.scene === "prism") return (<group><ambientLight intensity={0.6} /><directionalLight position={[-6, 6, 8]} intensity={1.2} /><Prism t={t} p={s.ray} /><Falling t={t} /></group>);
  if (s.scene === "spectrum") return (<group><ambientLight intensity={0.6} /><Spectrum t={t} p={s.ray} /><Falling t={t} /></group>);
  if (s.scene === "plane") {
    const head: V3 = [0, 0, 0];
    return (<group><ambientLight intensity={0.8} /><directionalLight position={[0, 10, 20]} intensity={1.4} /><CloudDeck t={t} /><Plane t={t} /><Bow head={head} e={s.e} op={1} R={36} over /></group>);
  }
  const sd = sunDir(s.e);
  const sunCol = new THREE.Color("#fff1d6").lerp(new THREE.Color("#ffb070"), s.warm);
  return (
    <group>
      <hemisphereLight args={[new THREE.Color("#c8d8f0").lerp(new THREE.Color("#ffc8a0"), s.warm), "#2a3a20", 0.7 - s.gloom * 0.35]} />
      <directionalLight position={[sd[0] * 50, sd[1] * 50 + 2, sd[2] * 50]} intensity={(1.6 - s.gloom * 1.2) * (0.7 + 0.3 * Math.sin(s.e * Math.PI / 180 + 0.5))} color={sunCol} />
      <Valley t={t} rain={s.rain} warm={s.warm} gloom={s.gloom} />
      {s.sun && <Sun e={s.e} warm={s.warm} dist={s.side ? 60 : 160} />}
      {s.people.map((p, i) => <Person key={i} x={p.x} shirt={p.shirt} walk={p.walk} />)}
      {s.people.map((p, i) => <Bow key={"b" + i} head={[p.bowX ?? p.x, HEAD[1], 0]} e={s.e} op={s.bow * (s.people.length > 1 ? 0.8 : 1) * (1 - s.gloom)} op2={s.bow2} over={s.over} />)}
      {s.sky !== "none" && <SkyDrops t={t} e={s.e} mode={s.sky} />}
      {s.cone > 0 && <Cone t={t} e={s.e} k={s.cone} />}
      {s.side > 0 && <SideRays t={t} e={s.e} />}
    </group>
  );
};

// ------------------------------------------------------------------ 2D overlays
const pop = (u: number, at: number) => { const x = clamp((u - at) / 0.35); return x >= 1 ? 1 : 1 - Math.pow(1 - x, 3) * Math.cos(x * 9); };
const Tag: React.FC<{ x: number; y: number; u: number; at?: number; color?: string; size?: number; children: React.ReactNode }> = ({ x, y, u, at = 0.2, color = YEL, size = 52, children }) => {
  if (u < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(u, at)}) rotate(${-2 + Math.sin(u * 2) * 1.5}deg)`, background: color, color: color === YEL ? "#141414" : "#fff",
      fontFamily: NOTO, fontWeight: 800, fontSize: size, padding: "10px 30px 18px", borderRadius: 22, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,.45)", direction: "rtl" }}>{children}</div>
  );
};
const Box: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, background: "rgba(8,12,24,.78)", border: "3px solid rgba(255,255,255,.18)", borderRadius: 28, padding: 26, color: "#fff", fontFamily: NOTO, fontWeight: 800, direction: "rtl", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>{children}</div>
);
const NOTES = ["دو", "ري", "مي", "فا", "صول", "لا", "سي"];

const Overlay: React.FC<{ i: number; u: number; d: number; t: number; e: number }> = ({ i, u, d, t, e }) => {
  const W = 1080;
  switch (i) {
    case 1: return (<><Tag x={W * 0.3} y={170} u={u} at={0.3}>الألوان منين؟</Tag><Tag x={W * 0.68} y={980} u={u} at={1.4} color="#2f7fd8">المية مالهاش لون!</Tag></>);
    case 2: return (<Tag x={W * 0.5} y={180} u={u} at={0.8} color="#56606e">مطر.. ومفيش ولا لون؟</Tag>);
    case 3: return (<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ transform: `scale(${pop(u, 0.15) * (1 + u * 0.04)})`, fontFamily: RUQAA, fontSize: 190, color: "#fff", textShadow: "0 0 50px rgba(0,0,0,.6), 0 8px 0 #000", direction: "rtl" }}>إيه الحكاية؟</div></div>);
    case 4: return (<><Tag x={W * 0.25} y={200} u={u} at={0.3}>أبيض</Tag><Tag x={W * 0.72} y={200} u={u} at={1.8} color="#7a3cc8">= كل الألوان</Tag></>);
    case 5: return (<><Tag x={W * 0.28} y={170} u={u} at={0.8} color="#2f7fd8">بيبطّأ</Tag><Tag x={W * 0.7} y={300} u={u} at={1.8}>ويتكسر</Tag></>);
    case 6: return (<><Tag x={W * 0.7} y={170} u={u} at={1.0} color="#d8352a">الأحمر: أقل</Tag><Tag x={W * 0.3} y={980} u={u} at={2.4} color="#7a3cc8">البنفسجي: أكتر</Tag></>);
    case 7: return (<Tag x={W * 0.5} y={170} u={u} at={0.6}>زي المنشور بالظبط</Tag>);
    case 8: return (<><Tag x={W * 0.72} y={170} u={u} at={1.4} color="#2f7fd8">يرتد زي المراية</Tag><Tag x={W * 0.3} y={980} u={u} at={2.8}>ويخرج من قدام</Tag></>);
    case 9: return (<Tag x={W * 0.62} y={560} u={u} at={0.6} size={80}>42°</Tag>);
    case 10: return (<Tag x={W * 0.5} y={170} u={u} at={0.8}>كل نقطة = لون واحد</Tag>);
    case 11: return (<><Tag x={W * 0.3} y={200} u={u} at={0.5} color="#d8352a">اللي فوق: أحمر</Tag><Tag x={W * 0.68} y={980} u={u} at={2.0} color="#7a3cc8">اللي تحت: بنفسجي</Tag></>);
    case 12: return (<><Tag x={W * 0.3} y={960} u={u} at={0.8}>ضل راسك</Tag><Tag x={W * 0.7} y={170} u={u} at={2.4} color="#2f7fd8">42° حواليه</Tag></>);
    case 13: return (<><Tag x={W * 0.78} y={200} u={u} at={0.4}>الشمس ورا ضهرك</Tag><Tag x={W * 0.24} y={420} u={u} at={1.6} color="#56606e">المطر قدامك</Tag></>);
    case 14: return (<Box x={330} y={110} w={420}><div style={{ textAlign: "center", fontSize: 40 }}>الشمس على<div style={{ fontSize: 96, color: e > 42 ? "#ff6a4a" : YEL, lineHeight: 1.2 }}>{Math.round(e)}°</div></div></Box>);
    case 15: return (<><Tag x={W * 0.3} y={180} u={u} at={0.4}>الصبح بدري</Tag><Tag x={W * 0.7} y={300} u={u} at={1.6} color="#d86a2a">قبل المغرب</Tag></>);
    case 16: return (<Tag x={W * 0.5} y={170} u={u} at={1.2}>دايرة كاملة!</Tag>);
    case 17: return (<Tag x={W * 0.5} y={170} u={u} at={0.6} color="#2f7fd8">من الطيارة</Tag>);
    case 18: return (<Tag x={W * 0.5} y={160} u={u} at={1.0}>قوس تاني.. بالمقلوب</Tag>);
    case 19: return (<><Tag x={W * 0.7} y={170} u={u} at={1.0} color="#2f7fd8">انعكاسين</Tag><Tag x={W * 0.3} y={980} u={u} at={2.6} size={70}>51°</Tag></>);
    case 20: return (<><Tag x={W * 0.27} y={250} u={u} at={0.6} color="#d8352a">قوسك</Tag><Tag x={W * 0.73} y={250} u={u} at={1.4} color="#2f7fd8">قوسه</Tag></>);
    case 21: return (<Tag x={W * 0.5} y={170} u={u} at={0.8}>بيمشي معاك</Tag>);
    case 22: return (<Box x={70} y={70} w={940}><div style={{ fontSize: 38, textAlign: "center", marginBottom: 14 }}>نيوتن: 7 ألوان = 7 نغمات</div>
      <div style={{ display: "flex", gap: 10, direction: "ltr" }}>{COLORS.map((c, k) => { const on = u > 0.6 + k * 0.35; return (
        <div key={k} style={{ flex: 1, height: 120, background: c, borderRadius: 14, opacity: on ? 1 : 0.15, transform: `translateY(${on ? Math.sin(t * 5 + k) * 4 : 0}px)`, display: "flex", alignItems: "flex-end", justifyContent: "center", fontSize: 34, color: "#111", paddingBottom: 8 }}>{NOTES[k]}</div>); })}</div></Box>);
    case 23: return (<Box x={110} y={90} w={860}><div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", fontSize: 44 }}>
      {[["نور الشمس", 0.2], ["←", 0.9], ["نقط المطر", 1.2], ["←", 1.9], ["قوس قزح", 2.2]].map(([s2, at], j) => <div key={j} style={{ transform: `scale(${u > (at as number) ? pop(u, at as number) : 0})`, color: j === 4 ? YEL : "#fff" }}>{s2 as string}</div>)}</div></Box>);
    default: return null;
  }
};

// captions: words appear one by one across the line's spoken time, keywords in yellow; long lines get a smaller size so
// they stay on two lines above the brand
const Captions: React.FC<{ t: number; top?: number }> = ({ t, top = PANEL.top + PANEL.h + 40 }) => {
  let li = -1;
  for (let j = 0; j < LINES.length; j++) if (t >= LINES[j].start - 0.05) li = j;
  if (li < 0) return null;
  const L = LINES[li], chars = L.words.reduce((a, w) => a + w.w.length + 1, 0), lens = L.words.map((w) => w.w.length + 2), tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", direction: "rtl", fontFamily: NOTO, fontWeight: 800, fontSize: chars > 68 ? 42 : chars > 52 ? 50 : 60, lineHeight: 1.5, color: "#fff" }}>
      {L.words.map((w, j) => { const at = L.start + ((L.end - L.start) * acc) / tot; acc += lens[j]; const k = clamp((t - at) / 0.12);
        return <span key={j} style={{ color: w.k ? YEL : "#fff", opacity: 0.15 + 0.85 * k, display: "inline-block", transform: `translateY(${(1 - k) * 10}px)`, margin: "0 6px" }}>{w.w}</span>; })}
    </div>
  );
};

const skyOf = (s: St) => {
  if (s.scene === "drop" || s.scene === "prism" || s.scene === "spectrum") return new THREE.Color("#0d1628");
  if (s.scene === "plane") return new THREE.Color("#7fb2e8");
  return new THREE.Color("#8a99b0").lerp(new THREE.Color("#c99072"), s.warm).lerp(new THREE.Color("#4e5868"), s.gloom * 0.8);
};

export const Rainbow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { i, u, d } = shotAt(t);
  const S = SH[i], k = clamp(u / d);
  const st: St = { ...BASE, ...S.st(u, d) };
  const p = lv(S.p[0], S.p[1], k), l = lv(S.l[0], S.l[1], k);
  // the camera creeps along its path with a slow hand-held sway, scaled to how far it looks
  const far = Math.min(3, Math.hypot(l[0] - p[0], l[1] - p[1], l[2] - p[2]) / 20);
  const pos: V3 = [p[0] + Math.sin(t * 0.9) * 0.3, p[1] + Math.cos(t * 0.7) * 0.18, p[2] + Math.sin(t * 0.5) * 0.3];
  l[0] += Math.sin(t * 0.8) * 0.9 * far; l[1] += Math.cos(t * 0.6) * 0.5 * far;
  const sky = skyOf(st);
  const fade = Math.min(1, (DURATION + TAIL - t) / 0.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", direction: "rtl" }}>
        <div style={{ fontFamily: RUQAA, fontSize: 92, color: "#fff", lineHeight: 1.2 }}>إزاي قوس قزح بيتكوّن؟</div>
        <div style={{ fontFamily: NOTO, fontWeight: 800, fontSize: 54, color: YEL, marginTop: 6 }}>نور الشمس جوه نقطة مطر</div>
      </div>
      <div style={{ position: "absolute", top: PANEL.top, left: 0, width: 1080, height: PANEL.h, overflow: "hidden", borderTop: "4px solid #1d2438", borderBottom: "4px solid #1d2438" }}>
        <ThreeCanvas width={1080} height={PANEL.h} camera={{ position: pos, fov: S.fov, near: 0.1, far: 900 }}>
          <color attach="background" args={[sky.getHex()]} />
          <fog attach="fog" args={[sky.getHex(), 120, 420]} />
          <Cam p={pos} l={l} fov={S.fov} />
          <Scene3D s={st} t={t} />
        </ThreeCanvas>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.45))" }} />
        <Overlay i={i} u={u} d={d} t={t} e={st.e} />
      </div>
      <Captions t={t} />
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: RUQAA, fontSize: 64, color: YEL, opacity: 0.9 }}>إيه الحكاية؟</div>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export { DROP_R };

// the bottom strip alone (captions and brand on black), for re-laying the captions over a rendered video at y = STRIP_Y
export const STRIP_Y = PANEL.top + PANEL.h + 4;
export const RainbowStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Captions t={t} top={40 - 4} />
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: RUQAA, fontSize: 64, color: YEL, opacity: 0.9 }}>إيه الحكاية؟</div>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - Math.min(1, (DURATION + TAIL - t) / 0.6) }} />
    </AbsoluteFill>
  );
};
