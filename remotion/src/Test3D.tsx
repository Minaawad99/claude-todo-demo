import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// 3D smoke test: a lit cloud of spheres and a glowing bolt, the camera circling.
export const Test3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const a = frame / 60;
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [Math.sin(a) * 8, 2, Math.cos(a) * 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        {[...Array(14)].map((_, i) => (
          <mesh key={i} position={[Math.sin(i * 1.7) * 2.2, 2 + Math.cos(i * 2.3) * 0.6, Math.cos(i * 1.3) * 1.2]}>
            <sphereGeometry args={[0.9 + (i % 3) * 0.2, 32, 32]} />
            <meshStandardMaterial color="#9aa4b6" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshBasicMaterial color="#e8f4ff" />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
