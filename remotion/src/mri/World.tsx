import React, { useMemo } from "react";
import * as THREE from "three";

// The 3D world of «ليه جهاز الرنين صوته عالي؟»: a hospital MRI room with the scanner (white housing, round bore, blue
// front ring, sliding table), the magnet coil seen through the housing, field lines, metal things pulled into the bore,
// a credit card, water molecules, the body's tiny magnets (arrows) lining up, the radio pulse, and the gradient coils
// shaking. Everything is driven by `t` (seconds) and the state, never by its own clock. Units are about metres.

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
type V3 = [number, number, number];

export type WorldState = {
  t: number;
  slide: number;      // 0 = table out, 1 = patient fully inside
  xray: number;       // 0..1 housing becomes see-through, coil shows
  field: number;      // 0..1 field lines
  night: number;      // 0..1 room lights down
  chair: number;      // 0..1 chair flying into the bore (1 = stuck)
  tank: number;       // 0..1 oxygen tank flying in
  card: number;       // 0..1 card flying in, wiped when > .8
  grad: number;       // 0..1 gradient coils knocking (shake + sound rings)
  mood: "n" | "happy" | "shock" | "worry";
  room: number;       // 1 = show the room and the scanner
  water: number;      // 0..1 water molecules
  spins: number;      // 0..1 tiny magnets visible
  align: number;      // 0..1 tiny magnets lined up
  pulse: number;      // 0..1 radio pulse (tips them over), signal rings when they relax
  plugs: number;      // 0..1 earplugs
  tray: number;       // 0..1 metal things leaving the patient into a tray
};
export const ZERO: Omit<WorldState, "t"> = { slide: 0, xray: 0, field: 0, night: 0, chair: 0, tank: 0, card: 0, grad: 0, mood: "n", room: 1, water: 0, spins: 0, align: 0, pulse: 0, plugs: 0, tray: 0 };

export const BORE_R = 0.36, OUT_W = 2.3, OUT_H = 2.3, DEPTH = 1.8, CEN_Y = 1.25;

// the scanner housing: a rounded block with the round bore through it, extruded from a 2D shape with a hole
const Housing: React.FC<{ xray: number; shake: V3 }> = ({ xray, shake }) => {
  const geo = useMemo(() => {
    const w = OUT_W / 2, h = OUT_H / 2, r = 0.55, s = new THREE.Shape();
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    const hole = new THREE.Path(); hole.absarc(0, 0, BORE_R, 0, Math.PI * 2, true); s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4, curveSegments: 40 });
    g.translate(0, 0, -DEPTH / 2);
    return g;
  }, []);
  const ring = useMemo(() => { const g = new THREE.RingGeometry(BORE_R + 0.06, BORE_R + 0.2, 64); return g; }, []);
  const op = 1 - 0.8 * xray;
  return (
    <group position={[shake[0], CEN_Y + shake[1], shake[2]]}>
      <mesh geometry={geo}><meshStandardMaterial color="#f3f5f7" roughness={0.35} metalness={0.05} transparent={xray > 0} opacity={op} depthWrite={xray < 0.5} /></mesh>
      <mesh geometry={ring} position={[0, 0, DEPTH / 2 + 0.085]}><meshStandardMaterial color="#2f7fd8" emissive="#2f7fd8" emissiveIntensity={0.35} roughness={0.4} transparent opacity={op} /></mesh>
      {/* the inside of the bore: a lit tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[BORE_R, BORE_R, DEPTH + 0.16, 48, 1, true]} /><meshStandardMaterial color="#e6ebef" side={THREE.BackSide} roughness={0.5} emissive="#cfe6ff" emissiveIntensity={0.25} /></mesh>
      {/* a small control panel on the front */}
      <mesh position={[0.62, 0.55, DEPTH / 2 + 0.09]}><boxGeometry args={[0.28, 0.16, 0.02]} /><meshStandardMaterial color="#1c2430" /></mesh>
      <mesh position={[0.62, 0.55, DEPTH / 2 + 0.101]}><planeGeometry args={[0.22, 0.1]} /><meshBasicMaterial color="#5fd0ff" toneMapped={false} /></mesh>
    </group>
  );
};

// the magnet coil: copper windings around the bore, seen when the housing goes see-through; the gradient coils sit
// inside it as three thinner coil pairs that flash and shake when they switch
const Coils: React.FC<{ t: number; xray: number; grad: number; shake: V3 }> = ({ t, xray, grad, shake }) => {
  if (xray <= 0.02) return null;
  return (
    <group position={[shake[0] * 2, CEN_Y + shake[1] * 2, shake[2]]}>
      {[...Array(9)].map((_, i) => (
        <mesh key={i} position={[0, 0, -0.75 + i * 0.1875]}><torusGeometry args={[0.78, 0.07, 12, 64]} />
          <meshStandardMaterial color="#c87533" metalness={0.8} roughness={0.3} emissive="#ff8a3a" emissiveIntensity={0.15 + 0.15 * Math.sin(t * 3 + i)} transparent opacity={xray} /></mesh>
      ))}
      {grad > 0 && [0, 1, 2].map((k) => {
        const on = Math.sin(t * 26 + k * 2.1) > 0.2;
        return [-0.45, 0.45].map((z, j) => (
          <mesh key={k + "-" + j} position={[0, 0, z + (on ? Math.sin(t * 90 + k) * 0.015 * grad : 0)]} rotation={[0, 0, (k * Math.PI) / 3]} scale={[1, k === 1 ? 0.7 : 1, 1]}>
            <torusGeometry args={[0.5, 0.025, 8, 48]} /><meshBasicMaterial color={on ? "#ffe27a" : "#5fa8ff"} transparent opacity={grad * xray} toneMapped={false} />
          </mesh>));
      })}
    </group>
  );
};

// field lines: loops through the bore and around the outside, glowing and running
const Field: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  return (
    <group position={[0, CEN_Y, 0]}>
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2, sx = 1.2 + (i % 2) * 0.6, pulse = 0.5 + 0.5 * Math.sin(t * 3 - i);
        return (
          <group key={i} rotation={[0, 0, a]}>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.25 + sx * 0.45, 0]} scale={[sx * 1.6, sx * 0.8, 1]}>
              <torusGeometry args={[0.9, 0.012, 6, 80]} /><meshBasicMaterial color="#7fd8ff" transparent opacity={k * (0.25 + 0.45 * pulse)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {[...Array(14)].map((_, i) => { const ph = (t * 0.6 + i / 14) % 1; return (
        <mesh key={"d" + i} position={[Math.cos(i) * 0.15, Math.sin(i) * 0.15, lerp(2.2, -2.2, ph)]}><sphereGeometry args={[0.035, 8, 6]} /><meshBasicMaterial color="#bff0ff" transparent opacity={k * Math.sin(ph * Math.PI)} toneMapped={false} /></mesh>); })}
    </group>
  );
};

// the patient: a simple figure lying on the table; head is a ball with the channel's eyes
const Patient: React.FC<{ t: number; mood: WorldState["mood"]; plugs: number }> = ({ t, mood, plugs }) => {
  const blink = (t * 0.55 + 0.3) % 1 < 0.05 && mood !== "shock";
  const eye = (x: number) => mood === "happy" ? <mesh position={[x, 0.07, 0.115]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.022, 0.007, 6, 12, Math.PI]} /><meshBasicMaterial color="#1c1c1c" /></mesh>
    : mood === "shock" ? <mesh position={[x, 0.07, 0.12]}><sphereGeometry args={[0.02, 10, 8]} /><meshBasicMaterial color="#1c1c1c" /></mesh>
    : <mesh position={[x, 0.07, 0.12]} scale={[1, blink ? 0.15 : 1, 1]}><capsuleGeometry args={[0.009, 0.03, 4, 8]} /><meshBasicMaterial color="#1c1c1c" /></mesh>;
  return (
    <group>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.17, 1.1, 8, 16]} /><meshStandardMaterial color="#7fb3d8" roughness={0.8} /></mesh>
      <group position={[0, 0.2, 0.8]} rotation={[-0.55, 0, 0]}>
        <mesh><sphereGeometry args={[0.13, 24, 18]} /><meshStandardMaterial color="#fbfbf7" roughness={0.6} /></mesh>
        {eye(-0.045)}{eye(0.045)}
        {mood === "shock" && <mesh position={[0, -0.02, 0.122]} scale={[1, 1.3, 1]}><sphereGeometry args={[0.018, 10, 8]} /><meshBasicMaterial color="#1c1c1c" /></mesh>}
        {mood === "worry" && <mesh position={[0, -0.03, 0.12]} rotation={[0, 0, 0]}><torusGeometry args={[0.025, 0.006, 6, 12, Math.PI]} /><meshBasicMaterial color="#1c1c1c" /></mesh>}
        {plugs > 0 && [-1, 1].map((s) => <mesh key={s} position={[s * 0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={plugs}><cylinderGeometry args={[0.025, 0.03, 0.06, 12]} /><meshStandardMaterial color="#ffb020" roughness={0.9} /></mesh>)}
      </group>
    </group>
  );
};

const Table: React.FC<{ t: number; slide: number; mood: WorldState["mood"]; plugs: number; shake: V3 }> = ({ t, slide, mood, plugs, shake }) => {
  const z = lerp(2.0, 0.15, ease(slide));
  return (
    <group>
      {/* the base on the floor in front of the scanner */}
      <mesh position={[0, 0.42, 1.9]}><boxGeometry args={[0.6, 0.84, 1.6]} /><meshStandardMaterial color="#e9edf0" roughness={0.4} /></mesh>
      <group position={[shake[0], CEN_Y - BORE_R + 0.06, z]}>
        <mesh><boxGeometry args={[0.56, 0.06, 2.0]} /><meshStandardMaterial color="#dfe4e8" roughness={0.5} /></mesh>
        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.5, 0.05, 1.95]} /><meshStandardMaterial color="#2f6f9f" roughness={0.9} /></mesh>
        <group position={[0, 0.07, 0.1]}><Patient t={t} mood={mood} plugs={plugs} /></group>
      </group>
    </group>
  );
};

const Room: React.FC<{ t: number; night: number }> = ({ t, night }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color={new THREE.Color("#cfd6dc").lerp(new THREE.Color("#2a3038"), night)} roughness={0.35} metalness={0.05} /></mesh>
    <mesh position={[0, 3, -3]}><planeGeometry args={[30, 6]} /><meshStandardMaterial color={new THREE.Color("#bcd7e8").lerp(new THREE.Color("#1c2a38"), night)} roughness={0.9} /></mesh>
    <mesh position={[-5, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[30, 6]} /><meshStandardMaterial color={new THREE.Color("#c9dfec").lerp(new THREE.Color("#1c2a38"), night)} roughness={0.9} /></mesh>
    {/* the control-room window on the left wall, a technician behind it */}
    <mesh position={[-4.98, 1.7, 0.6]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[2.2, 1.1]} /><meshStandardMaterial color="#8fc2da" emissive="#5fa8d0" emissiveIntensity={0.4 + night * 0.4} roughness={0.1} /></mesh>
    <mesh position={[-4.96, 1.55, 0.3]}><sphereGeometry args={[0.16, 16, 12]} /><meshStandardMaterial color="#fbfbf7" /></mesh>
    {/* ceiling light panels */}
    {[-1.5, 1.5].map((x) => <mesh key={x} position={[x, 3.4, 0.5]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.2, 1.2]} /><meshBasicMaterial color={night > 0.5 ? "#2a3240" : "#ffffff"} toneMapped={false} /></mesh>)}
    {/* a yellow-black safety line on the floor around the scanner */}
    {[...Array(20)].map((_, i) => <mesh key={i} position={[-2.4 + i * 0.25, 0.005, 3.0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.12, 0.08]} /><meshBasicMaterial color={i % 2 ? "#1c1c1c" : "#f2c230"} /></mesh>)}
    <mesh position={[3.2, 2.2, -2.98]}><circleGeometry args={[0.3, 32]} /><meshBasicMaterial color="#d8352a" /></mesh>
    <mesh position={[3.2, 2.2, -2.97]} rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[0.5, 0.07]} /><meshBasicMaterial color="#ffffff" /></mesh>
    {night > 0.3 && <mesh position={[0, CEN_Y, 1.05]}><circleGeometry args={[BORE_R, 40]} /><meshBasicMaterial color="#5fd0ff" transparent opacity={0.25 + 0.1 * Math.sin(t * 2)} toneMapped={false} /></mesh>}
  </group>
);

// things pulled in: an office chair, an oxygen tank, a bank card; each flies from its start to the bore's front face
const flyPos = (k: number, from: V3, to: V3): V3 => { const e = k * k * k; return [lerp(from[0], to[0], e), lerp(from[1], to[1], e) + Math.sin(k * Math.PI) * 0.3, lerp(from[2], to[2], e)]; };
const Chair: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0) return null;
  const p = flyPos(k, [-2.6, 0, 3.4], [-0.55, CEN_Y - 0.6, 1.05]), spin = k < 1 ? k * 7 : 0.4 + Math.sin(t * 30) * 0.02;
  return (
    <group position={p} rotation={[0.3 * k, spin, 0.5 * k]}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#2b2e33" roughness={0.7} /></mesh>
      <mesh position={[0, 0.85, -0.22]}><boxGeometry args={[0.46, 0.6, 0.06]} /><meshStandardMaterial color="#2b2e33" roughness={0.7} /></mesh>
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.03, 0.03, 0.45, 10]} /><meshStandardMaterial color="#9aa2ac" metalness={0.9} roughness={0.2} /></mesh>
      {[...Array(5)].map((_, i) => { const a = (i / 5) * Math.PI * 2; return (<group key={i}>
        <mesh position={[Math.cos(a) * 0.17, 0.05, Math.sin(a) * 0.17]} rotation={[0, -a, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.34, 8]} /><meshStandardMaterial color="#9aa2ac" metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[Math.cos(a) * 0.33, 0.03, Math.sin(a) * 0.33]}><sphereGeometry args={[0.035, 8, 6]} /><meshStandardMaterial color="#1c1c1c" /></mesh></group>); })}
    </group>
  );
};
const Tank: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0) return null;
  const p = flyPos(k, [2.8, 0.6, 3.2], [0.5, CEN_Y + 0.1, 1.08]);
  return (
    <group position={p} rotation={[Math.PI / 2 * k, 0, k < 1 ? k * 5 : 1.2 + Math.sin(t * 28) * 0.02]}>
      <mesh><cylinderGeometry args={[0.11, 0.11, 0.9, 20]} /><meshStandardMaterial color="#2f9a5a" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.11, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#fbfbf7" metalness={0.4} roughness={0.3} /></mesh>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.03, 0.04, 0.1, 10]} /><meshStandardMaterial color="#c9ced4" metalness={0.9} roughness={0.2} /></mesh>
    </group>
  );
};
const Card: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0) return null;
  const p = flyPos(Math.min(k, 0.85) / 0.85, [1.2, CEN_Y + 0.9, 2.6], [0.25, CEN_Y + 0.55, 1.15]), wiped = k > 0.85;
  return (
    <group position={p} rotation={[0.2, -0.3 + Math.sin(t * 2) * 0.1, 0.1]} scale={1.6}>
      <mesh><boxGeometry args={[0.34, 0.215, 0.006]} /><meshStandardMaterial color={wiped ? "#7a8796" : "#2f6fbf"} roughness={0.3} metalness={0.3} /></mesh>
      <mesh position={[-0.09, 0.02, 0.0035]}><planeGeometry args={[0.06, 0.045]} /><meshStandardMaterial color="#e2c47a" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, -0.06, 0.0035]}><planeGeometry args={[0.34, 0.035]} /><meshBasicMaterial color={wiped ? "#c9ced4" : "#1c1c1c"} /></mesh>
      {wiped && [...Array(8)].map((_, i) => <mesh key={i} position={[(rnd(i + Math.floor(t * 12)) - 0.5) * 0.4, (rnd(i + 9 + Math.floor(t * 12)) - 0.5) * 0.3, 0.01]}><planeGeometry args={[0.03, 0.006]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>)}
    </group>
  );
};

// a tray with the patient's metal things: keys, a hair pin, a card, a watch, popping into it one by one
const Tray: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (k <= 0) return null;
  const items = [0, 1, 2, 3].map((i) => clamp(k * 4 - i));
  return (
    <group position={[1.4, 1.0, 2.6]} scale={1.8}>
      <mesh><boxGeometry args={[0.7, 0.04, 0.45]} /><meshStandardMaterial color="#9aa2ac" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.03, 0.03, 1, 10]} /><meshStandardMaterial color="#9aa2ac" metalness={0.8} /></mesh>
      {items[0] > 0 && <group position={[-0.2, 0.06 + (1 - items[0]) * 0.6, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.05, 0.008, 8, 20]} /><meshStandardMaterial color="#c9ced4" metalness={0.9} roughness={0.2} /></mesh><mesh position={[0.08, 0, 0.02]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.1, 0.012, 0.03]} /><meshStandardMaterial color="#e2c47a" metalness={0.9} roughness={0.2} /></mesh></group>}
      {items[1] > 0 && <mesh position={[-0.02, 0.04 + (1 - items[1]) * 0.6, 0.08]} rotation={[0, 0.6, 0]}><boxGeometry args={[0.15, 0.008, 0.012]} /><meshStandardMaterial color="#3a3d42" metalness={0.9} /></mesh>}
      {items[2] > 0 && <mesh position={[0.14, 0.035 + (1 - items[2]) * 0.6, -0.04]} rotation={[-Math.PI / 2, 0, 0.3]}><boxGeometry args={[0.17, 0.107, 0.004]} /><meshStandardMaterial color="#2f6fbf" metalness={0.3} roughness={0.3} /></mesh>}
      {items[3] > 0 && <group position={[0.2, 0.05 + (1 - items[3]) * 0.6, 0.12]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 0.015, 20]} /><meshStandardMaterial color="#c9ced4" metalness={0.9} roughness={0.2} /></mesh><mesh position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, t]}><planeGeometry args={[0.005, 0.03]} /><meshBasicMaterial color="#1c1c1c" /></mesh></group>}
    </group>
  );
};

// close-up worlds: water molecules (O red, two H white) and the tiny magnets (arrows) that line up and get tipped
export const MICRO: V3 = [0, 20, 0];
const Water: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  return (
    <group position={MICRO} scale={k}>
      {[...Array(14)].map((_, i) => { const p: V3 = [(rnd(i) - 0.5) * 6, (rnd(i + 3) - 0.5) * 3.4, (rnd(i + 6) - 0.5) * 3 - 1];
        return (
          <group key={i} position={[p[0] + Math.sin(t * 0.8 + i) * 0.15, p[1] + Math.cos(t * 0.7 + i) * 0.15, p[2]]} rotation={[t * 0.5 + i, t * 0.3 + i * 2, 0]}>
            <mesh><sphereGeometry args={[0.32, 24, 16]} /><meshStandardMaterial color="#e2523a" roughness={0.35} /></mesh>
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.3, 0.22, 0]}><sphereGeometry args={[0.2, 20, 14]} /><meshStandardMaterial color="#f4f6f8" roughness={0.35} emissive={"#5fd0ff"} emissiveIntensity={0.25 + 0.25 * Math.sin(t * 4 + i + s)} /></mesh>)}
          </group>
        );
      })}
    </group>
  );
};
const Arrow: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.05, 0.05, 0.6, 12]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
    <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.13, 0.25, 16]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
    <mesh><sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#f4f6f8" roughness={0.3} /></mesh>
  </group>
);
const Spins: React.FC<{ t: number; k: number; align: number; pulse: number }> = ({ t, k, align, pulse }) => {
  if (k <= 0) return null;
  // pulse 0..1: 0..0.3 the wave passes and tips them over; then they relax back up (signal rings while relaxing)
  const tip = pulse <= 0 ? 0 : pulse < 0.3 ? ease(pulse / 0.3) : 1 - ease((pulse - 0.3) / 0.7);
  return (
    <group position={MICRO}>
      {[...Array(25)].map((_, i) => {
        const gx = (i % 5) - 2, gy = Math.floor(i / 5) - 2, rx = Math.sin(t * (0.7 + rnd(i)) + i * 3) * Math.PI, rz = Math.cos(t * (0.6 + rnd(i + 2)) + i) * Math.PI;
        const a = align;
        const prec = t * 6 + i;
        const tilt = 0.18 + tip * 1.4;
        return (
          <group key={i} position={[gx * 1.15, gy * 0.75, (rnd(i + 8) - 0.5) * 0.8]} scale={k * 0.8}>
            <group rotation={[lerp(rx, Math.sin(prec) * tilt, a), 0, lerp(rz, Math.cos(prec) * tilt, a)]}><Arrow color={a > 0.5 ? "#2f7fd8" : "#e2b035"} /></group>
          </group>
        );
      })}
      {pulse > 0 && pulse < 0.3 && <mesh position={[lerp(-4, 4, pulse / 0.3), 0, 0.5]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[2.2, 0.05, 8, 48]} /><meshBasicMaterial color="#ffe27a" transparent opacity={0.8} toneMapped={false} /></mesh>}
      {pulse >= 0.3 && [0, 1, 2].map((j) => { const ph = (t * 0.9 + j / 3) % 1; return <mesh key={j} position={[0, 0, 0.3]} scale={0.5 + ph * 4}><torusGeometry args={[1, 0.02, 6, 48]} /><meshBasicMaterial color="#7cf29a" transparent opacity={(1 - ph) * 0.7 * (1 - clamp((pulse - 0.85) * 6))} toneMapped={false} /></mesh>; })}
    </group>
  );
};

// sound rings leaving the bore when the gradient coils knock
const Knocks: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  return (
    <group position={[0, CEN_Y, 1.1]}>
      {[0, 1, 2, 3].map((j) => { const ph = (t * 2.4 + j / 4) % 1; return <mesh key={j} scale={0.5 + ph * 3}><torusGeometry args={[0.5, 0.02, 6, 48]} /><meshBasicMaterial color="#ffd27a" transparent opacity={k * (1 - ph) * 0.8} toneMapped={false} /></mesh>; })}
    </group>
  );
};

export const World: React.FC<{ s: WorldState }> = ({ s }) => {
  const { t } = s;
  // knocks: a sharp jolt a few times a second when the gradient coils switch
  const jolt = s.grad * (Math.sin(t * 9.5 * Math.PI) > 0.6 ? 1 : 0);
  const shake: V3 = [Math.sin(t * 83) * 0.012 * jolt, Math.cos(t * 71) * 0.01 * jolt, 0];
  const lit = 1 - s.night * 0.75;
  return (
    <group>
      <ambientLight intensity={0.7 * lit + 0.2} color="#e8f0ff" />
      <hemisphereLight args={["#ffffff", "#8a96a3", 0.9 * lit + 0.15]} />
      <directionalLight position={[3, 6, 5]} intensity={1.4 * lit + 0.2} color="#ffffff" />
      <pointLight position={[0, CEN_Y, 0.4]} intensity={2 + s.grad * 6 * jolt} distance={4} color="#cfe6ff" />
      {s.room > 0 && (
        <group>
          <Room t={t} night={s.night} />
          <Housing xray={s.xray} shake={shake} />
          <Coils t={t} xray={s.xray} grad={s.grad} shake={shake} />
          <Table t={t} slide={s.slide} mood={s.mood} plugs={s.plugs} shake={shake} />
          <Field t={t} k={s.field} />
          <Chair k={s.chair} t={t} />
          <Tank k={s.tank} t={t} />
          <Card k={s.card} t={t} />
          <Tray k={s.tray} t={t} />
          <Knocks t={t} k={s.grad} />
        </group>
      )}
      <Water t={t} k={s.water} />
      <Spins t={t} k={s.spins} align={s.align} pulse={s.pulse} />
    </group>
  );
};
