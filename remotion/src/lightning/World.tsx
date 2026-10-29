import React, { useMemo } from "react";
import * as THREE from "three";

// The 3D world of «إزاي الرعد والبرق بيحصلوا؟»: a city at night under a cumulonimbus with its anvil top, rain, ice and
// graupel inside the cloud with their charges, the stepped leader coming down in steps, the streamer rising from the
// tallest building's lightning rod, the return stroke, the shock wave (thunder). Everything is driven by `t` (seconds),
// never by its own clock.

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

type V3 = [number, number, number];
export const CLOUD: V3 = [0, 13, -3];
export const ROD: V3 = [3.2, 4.6, 1];          // top of the lightning rod on the tallest building

// a straight segment between two points (a thin cylinder), for bolts, rods and wires
export const Seg: React.FC<{ a: V3; b: V3; r: number; color: string; opacity?: number; emissive?: boolean }> = ({ a, b, r, color, opacity = 1 }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va), l = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat: q, len: l };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 14, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
};

// the stepped leader: a jagged main channel from the cloud base to the rod, with side branches; `steps` reveals it
export const LEADER: { a: V3; b: V3; main: boolean; step: number }[] = (() => {
  const out: { a: V3; b: V3; main: boolean; step: number }[] = [];
  const start: V3 = [CLOUD[0] + 0.6, CLOUD[1] - 3.2, CLOUD[2] + 2.5], N = 12;
  let p = start;
  for (let s = 1; s <= N; s++) {
    const k = s / N, q: V3 = [lerp(start[0], ROD[0], k) + (s < N ? (rnd(s) - 0.5) * 1.2 : 0), lerp(start[1], ROD[1] + 0.6, k), lerp(start[2], ROD[2], k) + (s < N ? (rnd(s + 9) - 0.5) * 0.8 : 0)];
    out.push({ a: p, b: q, main: true, step: s });
    if (s % 3 === 1 && s < N - 1) { let bp = q; for (let j = 1; j <= 3; j++) { const bq: V3 = [bp[0] + (rnd(s * 7 + j) - 0.3) * 1.2 * (s % 2 ? 1 : -1), bp[1] - 0.45, bp[2] + (rnd(s * 3 + j) - 0.5) * 0.6]; out.push({ a: bp, b: bq, main: false, step: s + j }); bp = bq; } }
    p = q;
  }
  return out;
})();

const Bolt: React.FC<{ steps: number; stroke: number; t: number }> = ({ steps, stroke, t }) => {
  // stroke 0..1: the return stroke, the whole main channel turns blinding white and thick
  return (
    <group>
      {LEADER.filter((s) => s.step <= steps).map((s, i) => {
        const bright = s.main ? stroke : stroke * 0.4;
        return (
          <group key={i}>
            <Seg a={s.a} b={s.b} r={(s.main ? 0.035 : 0.02) + bright * 0.06} color="#ffffff" />
            <Seg a={s.a} b={s.b} r={(s.main ? 0.12 : 0.07) + bright * 0.35} color="#9fd2ff" opacity={0.25 + 0.3 * bright * (0.7 + 0.3 * Math.sin(t * 60 + i))} />
          </group>
        );
      })}
    </group>
  );
};

const Streamer: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const top: V3 = [ROD[0], ROD[1] + 0.7 * k, ROD[2]];
  return (<group><Seg a={ROD} b={top} r={0.03} color="#ffffff" /><Seg a={ROD} b={top} r={0.1} color="#bfe4ff" opacity={0.4} /></group>);
};

// a cumulonimbus: a tower of lit puffs with a flat, spreading anvil top; `cut` makes it see-through for the inside views
const Cloud: React.FC<{ t: number; flash: number; cut: number }> = ({ t, flash, cut }) => {
  const puffs = useMemo(() => {
    const a: { p: V3; r: number }[] = [];
    for (let i = 0; i < 34; i++) { const h = rnd(i) * 1, y = CLOUD[1] - 3 + h * 6, w = 2.6 + h * 0.6; a.push({ p: [CLOUD[0] + (rnd(i + 3) - 0.5) * 2 * w, y, CLOUD[2] + (rnd(i + 7) - 0.5) * 2.2], r: 1.3 + rnd(i + 11) * 1.1 }); }
    for (let i = 0; i < 16; i++) { const ang = (i / 16) * Math.PI * 2; a.push({ p: [CLOUD[0] + Math.cos(ang) * (3 + rnd(i) * 3.5), CLOUD[1] + 3.8 + rnd(i + 5) * 0.4, CLOUD[2] + Math.sin(ang) * 1.6], r: 1.1 + rnd(i + 2) * 0.6 }); }
    return a;
  }, []);
  const op = 1 - 0.78 * cut;
  return (
    <group>
      {puffs.map((pf, i) => (
        <mesh key={i} position={[pf.p[0] + Math.sin(t * 0.3 + i) * 0.08, pf.p[1] + Math.sin(t * 0.4 + i * 1.3) * 0.06, pf.p[2]]} scale={[1, i >= 34 ? 0.45 : 1, 1]}>
          <sphereGeometry args={[pf.r, 24, 16]} />
          <meshStandardMaterial color={flash > 0.3 ? "#d6deee" : "#8f98ab"} emissive="#9fb8ff" emissiveIntensity={flash * 0.8} roughness={1} transparent={cut > 0} opacity={op} depthWrite={cut === 0} />
        </mesh>
      ))}
    </group>
  );
};

const City: React.FC<{ t: number; flash: number }> = ({ t, flash }) => {
  const bld = useMemo(() => {
    const a: { x: number; z: number; w: number; d: number; h: number }[] = [];
    for (let i = 0; i < 18; i++) { const x = -11 + (i % 9) * 2.6 + rnd(i) * 0.6, z = (i < 9 ? -1.5 : 2.6) + rnd(i + 4) * 1.2; if (Math.abs(x - ROD[0]) < 1.4 && Math.abs(z - ROD[2]) < 1.6) continue; a.push({ x, z, w: 1.1 + rnd(i + 2) * 0.8, d: 1 + rnd(i + 6) * 0.6, h: 0.8 + rnd(i + 8) * 2 }); }
    return a;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[60, 40]} /><meshStandardMaterial color="#1b2230" roughness={0.6} metalness={0.2} /></mesh>
      {bld.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh><boxGeometry args={[b.w, b.h, b.d]} /><meshStandardMaterial color="#2c3444" roughness={0.8} /></mesh>
          {[...Array(Math.max(1, Math.floor(b.h / 0.5)))].map((_, r) => [...Array(3)].map((__, c) => rnd(i * 31 + r * 7 + c) > 0.45 ? (
            <mesh key={r + "-" + c} position={[(c - 1) * b.w * 0.28, -b.h / 2 + 0.3 + r * 0.5, b.d / 2 + 0.005]}><planeGeometry args={[b.w * 0.16, 0.2]} /><meshBasicMaterial color={rnd(i + r + c) > 0.3 ? "#ffd98a" : "#9fc4ff"} toneMapped={false} /></mesh>
          ) : null))}
        </group>
      ))}
      {/* the tallest building, with its lightning rod and the down-conductor to the ground */}
      <group position={[ROD[0], 0, ROD[2]]}>
        <mesh position={[0, 1.95, 0]}><boxGeometry args={[1.3, 3.9, 1.3]} /><meshStandardMaterial color="#384152" roughness={0.7} /></mesh>
        {[...Array(7)].map((_, r) => <mesh key={r} position={[0, 0.4 + r * 0.5, 0.651]}><planeGeometry args={[1, 0.16]} /><meshBasicMaterial color="#ffd98a" toneMapped={false} /></mesh>)}
      </group>
      <Seg a={[ROD[0], 3.9, ROD[2]]} b={ROD} r={0.03} color="#c9ced4" />
      <Seg a={[ROD[0] + 0.66, 3.9, ROD[2] + 0.66]} b={[ROD[0] + 0.66, 0, ROD[2] + 0.66]} r={0.02} color="#b87333" />
      {[...Array(10)].map((_, i) => <mesh key={i} position={[-14 + i * 3.1, 0.6, 6]}><coneGeometry args={[0.45, 1.3, 8]} /><meshStandardMaterial color="#1f3a2a" roughness={1} /></mesh>)}
      {/* a house in the foreground (the listener) */}
      <group position={[-6, 0, 7]}><mesh position={[0, 0.5, 0]}><boxGeometry args={[1.4, 1, 1.2]} /><meshStandardMaterial color="#5a4a3a" /></mesh><mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.1, 0.6, 4]} /><meshStandardMaterial color="#7a2a20" /></mesh><mesh position={[0, 0.55, 0.605]}><planeGeometry args={[0.36, 0.3]} /><meshBasicMaterial color={flash > 0.3 ? "#ffffff" : "#ffd98a"} toneMapped={false} /></mesh></group>
    </group>
  );
};

const Rain: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  return (
    <group>
      {[...Array(140)].map((_, i) => { const x = (rnd(i) - 0.5) * 30, z = (rnd(i + 5) - 0.5) * 13 - 1.5, y = 15 - ((t * 9 + rnd(i + 9) * 15) % 15);
        return <mesh key={i} position={[x, y, z]} rotation={[0, 0, 0.15]}><boxGeometry args={[0.015, 0.45, 0.015]} /><meshBasicMaterial color="#9fc4e8" transparent opacity={0.45 * k} /></mesh>; })}
    </group>
  );
};

// inside the cloud: rising droplets freezing, small ice crystals (+) and heavier graupel (−) colliding and separating
const Inside: React.FC<{ t: number; mode: number; sep: number }> = ({ t, mode, sep }) => {
  return (
    <group position={CLOUD}>
      {[...Array(26)].map((_, i) => {
        const heavy = i % 2 === 0, ph = (t * (heavy ? 0.25 : 0.45) + rnd(i)) % 1, bx = (rnd(i + 2) - 0.5) * 4.4, bz = (rnd(i + 4) - 0.5) * 1.6;
        const yMix = -3 + ph * 6, ySep = heavy ? -2.4 + rnd(i + 6) * 1.6 : 1.6 + rnd(i + 8) * 2.2, y = lerp(yMix, ySep, sep) + Math.sin(t * 3 + i) * 0.15 * sep;
        const x = bx + Math.sin(t * 2.2 + i) * 0.25, frozen = clamp((ph - 0.25) * 3 + mode);
        return (
          <group key={i} position={[x, y, bz + 2]}>
            <mesh rotation={[t + i, t * 0.7, 0]}>{heavy ? <icosahedronGeometry args={[0.2, 0]} /> : <octahedronGeometry args={[0.11, 0]} />}<meshStandardMaterial color={frozen > 0.5 ? (heavy ? "#dfe8f2" : "#ffffff") : "#5fa8ff"} roughness={0.3} metalness={0.1} emissive={sep > 0.2 ? (heavy ? "#2f7fd8" : "#d8352a") : "#000000"} emissiveIntensity={0.9 * sep} /></mesh>
          </group>
        );
      })}
    </group>
  );
};

// charge markers drawn as small glowing beads: + red on the cloud top and on the ground, − blue on the cloud base
const Charges: React.FC<{ t: number; top: number; ground: number }> = ({ t, top, ground }) => (
  <group>
    {top > 0 && [...Array(16)].map((_, i) => <mesh key={"p" + i} position={[CLOUD[0] + (rnd(i) - 0.5) * 7, CLOUD[1] + 2.6 + rnd(i + 1) * 1.2, CLOUD[2] + 2.3]}><sphereGeometry args={[0.16, 12, 8]} /><meshBasicMaterial color="#ff5a4a" transparent opacity={top * (0.7 + 0.3 * Math.sin(t * 5 + i))} toneMapped={false} /></mesh>)}
    {top > 0 && [...Array(16)].map((_, i) => <mesh key={"n" + i} position={[CLOUD[0] + (rnd(i + 20) - 0.5) * 7, CLOUD[1] - 2.6 + rnd(i + 21) * 0.9, CLOUD[2] + 2.3]}><sphereGeometry args={[0.16, 12, 8]} /><meshBasicMaterial color="#4fa8ff" transparent opacity={top * (0.7 + 0.3 * Math.sin(t * 5 + i))} toneMapped={false} /></mesh>)}
    {ground > 0 && [...Array(24)].map((_, i) => <mesh key={"g" + i} position={[(rnd(i + 40) - 0.5) * 18, 0.06, (rnd(i + 41) - 0.5) * 8 + 1]}><sphereGeometry args={[0.12, 10, 6]} /><meshBasicMaterial color="#ff5a4a" transparent opacity={ground * (0.6 + 0.4 * Math.sin(t * 4 + i))} toneMapped={false} /></mesh>)}
  </group>
);

// the shock wave: thin glowing shells expanding from the channel
const Shock: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0) return null;
  return (
    <group position={[(ROD[0] + CLOUD[0]) / 2, (ROD[1] + CLOUD[1] - 3) / 2, (ROD[2] + CLOUD[2] + 2.5) / 2]}>
      {[0, 1, 2].map((j) => { const ph = (t * 0.6 + j / 3) % 1; return <mesh key={j} scale={[0.6 + ph * 7, 0.6 + ph * 5, 0.6 + ph * 7]}><sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color="#ffd27a" transparent opacity={k * 0.25 * (1 - ph)} wireframe /></mesh>; })}
    </group>
  );
};

const Globe: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  return (
    <group position={[0, 7, 0]} rotation={[0.35, t * 0.4, 0]} scale={k}>
      <mesh><sphereGeometry args={[4, 48, 32]} /><meshStandardMaterial color="#1c5f8f" roughness={0.7} /></mesh>
      {[...Array(7)].map((_, i) => { const la = (rnd(i) - 0.5) * 2, lo = rnd(i + 3) * Math.PI * 2; return <mesh key={i} position={[3.5 * Math.cos(la) * Math.cos(lo), 3.5 * Math.sin(la), 3.5 * Math.cos(la) * Math.sin(lo)]} scale={[1.5, 1.1, 1.5]}><sphereGeometry args={[0.75 + rnd(i + 5) * 0.5, 16, 12]} /><meshStandardMaterial color="#4f8a4a" roughness={1} /></mesh>; })}
      {[...Array(44)].map((_, i) => { const on = Math.sin(t * 9 + i * 2.7) > 0.6, la = (rnd(i + 70) - 0.5) * 2.2, lo = rnd(i + 71) * Math.PI * 2; return on ? <mesh key={"f" + i} position={[4.15 * Math.cos(la) * Math.cos(lo), 4.15 * Math.sin(la), 4.15 * Math.cos(la) * Math.sin(lo)]}><sphereGeometry args={[0.16, 10, 6]} /><meshBasicMaterial color="#e8f4ff" toneMapped={false} /></mesh> : null; })}
    </group>
  );
};

// a stepped art-deco skyscraper with a mast (Empire State style), struck again and again
const Skyscraper: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  const hit = (t * 1.4) % 1 < 0.12;
  const tiers: [number, number, number][] = [[2.4, 3, 1.5], [1.8, 2.6, 4.3], [1.3, 1.6, 6.4], [0.8, 0.8, 7.6], [0.4, 0.8, 8.4]];
  return (
    <group position={[-4, 0, 0]} scale={k}>
      {tiers.map(([w, h, y], i) => <mesh key={i} position={[0, y, 0]}><boxGeometry args={[w, h, w]} /><meshStandardMaterial color="#9a9fa8" roughness={0.6} metalness={0.2} /></mesh>)}
      {tiers.slice(0, 3).map(([w, h, y], i) => [...Array(Math.floor(h / 0.4))].map((_, r) => <mesh key={i + "w" + r} position={[0, y - h / 2 + 0.25 + r * 0.4, w / 2 + 0.005]}><planeGeometry args={[w * 0.8, 0.12]} /><meshBasicMaterial color={rnd(i * 9 + r) > 0.4 ? "#ffd98a" : "#3a4050"} toneMapped={false} /></mesh>))}
      <mesh position={[0, 9.9, 0]}><cylinderGeometry args={[0.05, 0.12, 2.2, 8]} /><meshStandardMaterial color="#c9ced4" metalness={0.8} /></mesh>
      {hit && <group><Seg a={[0.6, 16, 0]} b={[0.2, 13.5, 0.1]} r={0.08} color="#ffffff" /><Seg a={[0.2, 13.5, 0.1]} b={[-0.3, 12.2, 0]} r={0.08} color="#ffffff" /><Seg a={[-0.3, 12.2, 0]} b={[0, 11, 0]} r={0.08} color="#ffffff" /><Seg a={[0.6, 16, 0]} b={[0, 11, 0]} r={0.35} color="#9fd2ff" opacity={0.35} /></group>}
    </group>
  );
};

export type WorldState = { t: number; flash: number; cut: number; inside: number; sep: number; top: number; ground: number; steps: number; stroke: number; streamer: number; shock: number; rain: number; globe: number; empire: number; current: number };

export const World: React.FC<{ s: WorldState }> = ({ s }) => {
  const { t } = s;
  return (
    <group>
      <ambientLight intensity={0.55 + s.flash * 1.2} color="#9fb0d0" />
      <hemisphereLight args={["#8fa6d8", "#1a2030", 0.9]} />
      <directionalLight position={[6, 14, 10]} intensity={0.7} color="#c9d4ff" />
      <pointLight position={[CLOUD[0], CLOUD[1] - 2, CLOUD[2] + 3]} intensity={s.flash * 260} distance={40} color="#d6e8ff" />
      {s.globe < 1 && s.empire < 1 && <City t={t} flash={s.flash} />}
      {s.globe < 1 && s.empire < 1 && <Cloud t={t} flash={s.flash} cut={s.cut} />}
      {s.inside > 0 && <Inside t={t} mode={0} sep={s.sep} />}
      <Charges t={t} top={s.top} ground={s.ground} />
      <Bolt steps={s.steps} stroke={s.stroke} t={t} />
      <Streamer k={s.streamer} />
      <Shock k={s.shock} t={t} />
      {s.current > 0 && [...Array(6)].map((_, i) => { const ph = (t * 1.2 + i / 6) % 1; return <mesh key={i} position={[ROD[0] + 0.66, lerp(3.9, 0, ph), ROD[2] + 0.66]}><sphereGeometry args={[0.09, 10, 6]} /><meshBasicMaterial color="#ffe27a" transparent opacity={s.current} toneMapped={false} /></mesh>; })}
      <Rain t={t} k={s.rain} />
      <Globe t={t} k={s.globe} />
      <Skyscraper t={t} k={s.empire} />
    </group>
  );
};
