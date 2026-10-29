import React, { useMemo } from "react";
import * as THREE from "three";
import { Seg, rnd, clamp, lerp } from "../lightning/World";

// The 3D pieces of «إزاي قوس قزح بيتكوّن؟»: a green valley after the rain with the viewer seen from behind, the sun at
// their back and a rain curtain ahead; the rainbow as real cones of 40–42° (and 50–53° for the second bow) around the
// point opposite the sun (the shadow of the viewer's head); a big water drop with rays traced by Snell's law; a glass
// prism; an airplane over a cloud deck. Everything is driven by `t`, never by its own clock.

type V3 = [number, number, number];
export { clamp, lerp, rnd };
export const COLORS = ["#ff3b30", "#ff9500", "#ffd60a", "#34c759", "#0a84ff", "#4b4bd6", "#a050ff"];
const D2R = Math.PI / 180;
export const HEAD: V3 = [0, 1.7, 0];

// the direction from the viewer to the sun (behind them, +z) and the opposite one (where the bow is centred)
export const sunDir = (e: number): V3 => [0, Math.sin(e * D2R), Math.cos(e * D2R)];
export const antiDir = (e: number, head: V3 = HEAD) => { const s = sunDir(e); return { a: [-s[0], -s[1], -s[2]] as V3, head }; };

// one coloured band of a bow: a torus around the anti-solar axis at `deg` from it, seen from `head`
const Band: React.FC<{ head: V3; e: number; deg: number; w: number; color: string; op: number; R?: number; additive?: boolean; over?: boolean }> = ({ head, e, deg, w, color, op, R = 70, additive = true, over = false }) => {
  const { pos, quat, r, tube } = useMemo(() => {
    const a = new THREE.Vector3(...antiDir(e).a), d = R * Math.cos(41 * D2R);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), a);
    return { pos: new THREE.Vector3(...head).addScaledVector(a, d), quat: q, r: d * Math.tan(deg * D2R), tube: d * Math.tan(w * D2R) / 2 };
  }, [head[0], head[1], head[2], e, deg, w, R]);
  if (op <= 0) return null;
  return (
    <mesh position={pos} quaternion={quat}>
      <torusGeometry args={[r, tube, 8, 160]} />
      <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} toneMapped={false} fog={false} depthTest={!over} />
    </mesh>
  );
};

// the primary bow: red outside at 42°, violet inside at 40°; the secondary: red inside at 50.5°, violet outside at 53.5°,
// with the darker sky between them (Alexander's band)
export const Bow: React.FC<{ head?: V3; e: number; op: number; op2?: number; R?: number; over?: boolean }> = ({ head = HEAD, e, op, op2 = 0, R = 70, over = false }) => (
  <group>
    {COLORS.map((c, k) => <Band key={k} head={head} e={e} deg={42 - k * (2 / 6)} w={0.42} color={c} op={op * 0.92} R={R} over={over} />)}
    {COLORS.map((c, k) => <Band key={"s" + k} head={head} e={e} deg={50.5 + k * 0.5} w={0.55} color={c} op={op2 * 0.65} R={R} />)}
    {op2 > 0 && <Band head={head} e={e} deg={46.2} w={8} color="#1a2230" op={op2 * 0.35} R={R * 1.01} additive={false} />}
  </group>
);

// a person seen from behind
export const Person: React.FC<{ x?: number; z?: number; shirt?: string; walk?: number }> = ({ x = 0, z = 0, shirt = "#d8352a", walk = 0 }) => {
  const sw = Math.sin(walk * 8) * 0.35 * (walk ? 1 : 0);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[-0.13, 0.42, Math.sin(sw) * 0.15]} rotation={[sw, 0, 0]}><cylinderGeometry args={[0.09, 0.08, 0.85, 10]} /><meshStandardMaterial color="#2c3e66" /></mesh>
      <mesh position={[0.13, 0.42, -Math.sin(sw) * 0.15]} rotation={[-sw, 0, 0]}><cylinderGeometry args={[0.09, 0.08, 0.85, 10]} /><meshStandardMaterial color="#2c3e66" /></mesh>
      <mesh position={[0, 1.13, 0]}><cylinderGeometry args={[0.2, 0.24, 0.62, 14]} /><meshStandardMaterial color={shirt} roughness={0.8} /></mesh>
      <mesh position={[-0.3, 1.1, 0]} rotation={[0, 0, 0.12]}><cylinderGeometry args={[0.06, 0.06, 0.55, 8]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[0.3, 1.1, 0]} rotation={[0, 0, -0.12]}><cylinderGeometry args={[0.06, 0.06, 0.55, 8]} /><meshStandardMaterial color={shirt} /></mesh>
      <mesh position={[0, 1.6, 0]}><sphereGeometry args={[0.17, 20, 14]} /><meshStandardMaterial color="#c68b5f" roughness={0.7} /></mesh>
      <mesh position={[0, 1.66, 0.02]}><sphereGeometry args={[0.175, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#2a1a10" /></mesh>
    </group>
  );
};

// the valley: grass, hills, trees, a few houses, a dark rain curtain ahead and falling rain
export const Valley: React.FC<{ t: number; rain: number; warm: number; gloom: number }> = ({ t, rain, warm, gloom }) => {
  const hills = useMemo(() => [...Array(9)].map((_, i) => ({ x: -110 + i * 28 + rnd(i) * 10, z: -95 - rnd(i + 3) * 25, r: 30 + rnd(i + 5) * 18 })), []);
  const trees = useMemo(() => [...Array(40)].map((_, i) => ({ x: (rnd(i + 11) - 0.5) * 120, z: -12 - rnd(i + 13) * 70, s: 1 + rnd(i + 17) * 1.4 })), []);
  const grass = new THREE.Color("#4d8a3a").lerp(new THREE.Color("#7a7a3a"), warm * 0.5).multiplyScalar(1 - gloom * 0.35);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -60]}><planeGeometry args={[600, 400]} /><meshStandardMaterial color={grass} roughness={1} /></mesh>
      {hills.map((h, i) => <mesh key={i} position={[h.x, -h.r * 0.72, h.z]} scale={[1.4, 1, 1]}><sphereGeometry args={[h.r, 32, 16]} /><meshStandardMaterial color={i % 2 ? "#3f7434" : "#4a8040"} roughness={1} /></mesh>)}
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.s} rotation={[0, 0, Math.sin(t * 1.3 + i) * 0.02]}>
          <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.12, 0.16, 1.2, 6]} /><meshStandardMaterial color="#5a3a20" /></mesh>
          <mesh position={[0, 1.9, 0]}><coneGeometry args={[0.9, 2.2, 8]} /><meshStandardMaterial color="#2f6a2c" roughness={1} /></mesh>
        </group>
      ))}
      {[[-14, -26], [9, -34], [22, -22]].map(([x, z], i) => (
        <group key={"h" + i} position={[x, 0, z]}><mesh position={[0, 1.2, 0]}><boxGeometry args={[3, 2.4, 2.6]} /><meshStandardMaterial color="#e8dcc4" /></mesh>
          <mesh position={[0, 2.95, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.4, 1.3, 4]} /><meshStandardMaterial color="#b5452e" /></mesh></group>
      ))}
      {/* the rain curtain ahead: a dark cloud wall and the rain falling from it */}
      <group position={[0, 0, -150]}>
        {[...Array(14)].map((_, i) => <mesh key={i} position={[-160 + i * 25, 70 + rnd(i) * 12 + Math.sin(t * 0.2 + i) * 1.5, rnd(i + 2) * 10]} scale={[1.6, 0.7, 1]}><sphereGeometry args={[22 + rnd(i + 4) * 10, 20, 12]} /><meshStandardMaterial color={new THREE.Color("#5b6576").multiplyScalar(1 - gloom * 0.3)} roughness={1} /></mesh>)}
      </group>
      {rain > 0 && [...Array(160)].map((_, i) => { const x = (rnd(i) - 0.5) * 220, z = -60 - rnd(i + 5) * 80, y = 60 - ((t * 25 + rnd(i + 9) * 60) % 60);
        return <mesh key={"r" + i} position={[x, y, z]}><boxGeometry args={[0.08, 2.6, 0.08]} /><meshBasicMaterial color="#c8d4e4" transparent opacity={0.35 * rain} /></mesh>; })}
    </group>
  );
};

export const Sun: React.FC<{ e: number; warm: number; dist?: number }> = ({ e, warm, dist = 160 }) => {
  const s = sunDir(e);
  return (
    <mesh position={[s[0] * dist, HEAD[1] + s[1] * dist, s[2] * dist]}>
      <sphereGeometry args={[7, 24, 16]} />
      <meshBasicMaterial color={new THREE.Color("#fff3c0").lerp(new THREE.Color("#ff9a40"), warm)} toneMapped={false} fog={false} />
    </mesh>
  );
};

// ------------------------------------------------------------------ the water drop and its rays (2D in the drop's plane)
type P2 = [number, number];
const dot = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];
const refract = (d: P2, n: P2, eta: number): P2 => { const c = -dot(d, n), k = 1 - eta * eta * (1 - c * c), s = Math.sqrt(Math.max(0, k)); return [eta * d[0] + (eta * c - s) * n[0], eta * d[1] + (eta * c - s) * n[1]]; };
export const DROP_R = 2.2;
// trace a ray that enters at height b, moving +x, through `refl` internal reflections; returns the polyline and exit direction
export const trace = (b: number, n: number, refl: number, lin = 6, lout = 7) => {
  const R = DROP_R, d0: P2 = [1, 0], p1: P2 = [-Math.sqrt(R * R - b * b), b];
  const pts: P2[] = [[p1[0] - lin, b], p1];
  let d = refract(d0, [p1[0] / R, p1[1] / R], 1 / n), p = p1;
  for (let k = 0; k <= refl; k++) {
    const tt = -2 * dot(p, d); p = [p[0] + d[0] * tt, p[1] + d[1] * tt]; pts.push(p);
    const m: P2 = [p[0] / R, p[1] / R];
    if (k < refl) { const dm = dot(d, m); d = [d[0] - 2 * dm * m[0], d[1] - 2 * dm * m[1]]; }
    else d = refract(d, [-m[0], -m[1]], n);
  }
  pts.push([p[0] + d[0] * lout, p[1] + d[1] * lout]);
  return { pts, out: d };
};
// the refractive index per colour, spread about 4× the real 1.331–1.344 so the fan can be seen
export const NIDX = COLORS.map((_, k) => 1.325 + k * 0.008);
export const bRainbow = (n: number, refl: number) => DROP_R * Math.sqrt(1 - (n * n - 1) / ((refl + 1) * (refl + 1) - 1));

// a polyline revealed from start to end by `p` (0..1), with a glowing core; `from` hides the first segments
export const RayPath: React.FC<{ pts: P2[]; p: number; color: string; r?: number; z?: number; from?: number; op?: number }> = ({ pts, p, color, r = 0.035, z = 0, from = 0, op = 1 }) => {
  const segs = useMemo(() => { const s: { a: P2; b: P2; l: number }[] = []; for (let i = 0; i + 1 < pts.length; i++) s.push({ a: pts[i], b: pts[i + 1], l: Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) }); return s; }, [pts]);
  const tot = segs.reduce((a, s) => a + s.l, 0);
  let left = p * tot;
  return (
    <group>
      {segs.map((s, i) => {
        if (left <= 0 || i < from) { left -= s.l; return null; }
        const k = Math.min(1, left / s.l); left -= s.l;
        const b: V3 = [lerp(s.a[0], s.b[0], k), lerp(s.a[1], s.b[1], k), z];
        return (<group key={i}><Seg a={[s.a[0], s.a[1], z]} b={b} r={r} color={color} opacity={op} /><Seg a={[s.a[0], s.a[1], z]} b={b} r={r * 3.2} color={color} opacity={0.22 * op} /></group>);
      })}
    </group>
  );
};

export const Drop: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <group scale={[s * (1 + Math.sin(t * 2.4) * 0.012), s * (1 - Math.sin(t * 2.4) * 0.012), s]}>
    <mesh><sphereGeometry args={[DROP_R, 64, 48]} /><meshPhysicalMaterial color="#a8dcff" roughness={0.05} metalness={0} transparent opacity={0.2} clearcoat={1} depthWrite={false} /></mesh>
    <mesh><sphereGeometry args={[DROP_R * 1.004, 64, 48]} /><meshBasicMaterial color="#d8f0ff" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} /></mesh>
    <mesh position={[-0.75, 0.9, 1.75]}><sphereGeometry args={[0.18, 16, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8} /></mesh>
  </group>
);

// a glass prism (triangular, axis along z) with a white ray in and the spectrum fanning out
export const Prism: React.FC<{ t: number; p: number }> = ({ t, p }) => {
  const inA: P2 = [-7, -1.2], inB: P2 = [-0.75, 0.15];
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}><cylinderGeometry args={[1.9, 1.9, 2.4, 3]} /><meshPhysicalMaterial color="#cfe8ff" roughness={0.05} transparent opacity={0.3} clearcoat={1} depthWrite={false} /></mesh>
      <RayPath pts={[inA, inB]} p={clamp(p * 2)} color="#ffffff" r={0.06} />
      {COLORS.map((c, k) => { const ex: P2 = [0.8, 0.05 - k * 0.07], fin: P2 = [7, -0.6 - k * 0.55 + Math.sin(t * 2) * 0.03]; return <RayPath key={k} pts={[inB, ex, fin]} p={clamp(p * 2 - 1)} color={c} r={0.05} />; })}
    </group>
  );
};

// an airliner, nose pointing -z
export const Plane: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0, 0, Math.sin(t * 0.8) * 0.04]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.55, 6, 8, 16]} /><meshStandardMaterial color="#f2f4f7" metalness={0.3} roughness={0.4} /></mesh>
    <mesh position={[0, -0.15, 0.3]}><boxGeometry args={[9, 0.12, 1.4]} /><meshStandardMaterial color="#dde2ea" /></mesh>
    <mesh position={[0, 0.9, 3.3]}><boxGeometry args={[0.12, 1.6, 1]} /><meshStandardMaterial color="#1f4fa8" /></mesh>
    <mesh position={[0, 0.2, 3.4]}><boxGeometry args={[3, 0.1, 0.7]} /><meshStandardMaterial color="#dde2ea" /></mesh>
    {[-2.4, 2.4].map((x) => <mesh key={x} position={[x, -0.55, -0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 1.2, 12]} /><meshStandardMaterial color="#9aa3b0" /></mesh>)}
    <mesh position={[4.4, -0.1, 0.5]}><sphereGeometry args={[0.08, 8, 6]} /><meshBasicMaterial color={Math.sin(t * 6) > 0 ? "#ff3030" : "#401010"} /></mesh>
  </group>
);

// a deck of clouds seen from above
export const CloudDeck: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -42, -60]}><planeGeometry args={[800, 600]} /><meshStandardMaterial color="#e6ecf4" roughness={1} /></mesh>
    {[...Array(40)].map((_, i) => <mesh key={i} position={[(rnd(i) - 0.5) * 300, -42, -20 - rnd(i + 3) * 200 + ((t * 6) % 40)]} scale={[1.8, 0.5, 1.4]}><sphereGeometry args={[8 + rnd(i + 5) * 8, 16, 10]} /><meshStandardMaterial color="#f4f7fb" roughness={1} /></mesh>)}
  </group>
);

export { Seg };
