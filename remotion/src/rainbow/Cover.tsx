import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import { Valley, Person, Bow, sunDir } from "./World";
import { Cam } from "../lightning/Lightning";

// TikTok cover for the rainbow video: the hook on top, the 3D valley with both bows over the viewer, the punch line under it.
const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800", "900"], subsets: ["arabic"] });
const YEL = "#f2c230";
const PANEL = { top: 540, h: 960 };

export const RainbowCover: React.FC = () => {
  const e = 14, sd = sunDir(e), sky = new THREE.Color("#8a99b0").lerp(new THREE.Color("#9fc0e0"), 0.45);
  const T: React.CSSProperties = { position: "absolute", width: "100%", textAlign: "center", direction: "rtl", fontFamily: NOTO, margin: 0 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <p style={{ ...T, top: 190, fontWeight: 600, fontSize: 30, color: "#d9d4c8" }}>إيه الحكاية؟</p>
      <p style={{ ...T, top: 236, fontWeight: 900, fontSize: 76, lineHeight: 1.25, color: "#fff" }}>إزاي قوس قزح<br />بيتكوّن؟!</p>
      <div style={{ position: "absolute", top: PANEL.top, left: 40, width: 1000, height: PANEL.h, borderRadius: 36, overflow: "hidden", border: "4px solid #1d2438" }}>
        <ThreeCanvas width={1000} height={PANEL.h} camera={{ position: [1.2, 2.2, 7.5], fov: 84, near: 0.1, far: 900 }}>
          <color attach="background" args={[sky.getHex()]} />
          <fog attach="fog" args={[sky.getHex(), 120, 420]} />
          <Cam p={[1.2, 2.2, 7.5]} l={[0, 17, -60]} fov={84} />
          <hemisphereLight args={["#e0d4d0", "#2a3a20", 0.75]} />
          <directionalLight position={[sd[0] * 50, sd[1] * 50 + 2, sd[2] * 50]} intensity={1.7} color="#ffd8b0" />
          <Valley t={2} rain={0.5} warm={0.15} gloom={0} />
          <Person x={0} shirt="#d8352a" />
          <Bow e={e} op={1.35} op2={0.5} />
        </ThreeCanvas>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.45))" }} />
      </div>
      <p style={{ ...T, top: 1545, fontWeight: 800, fontSize: 60, lineHeight: 1.3, color: "#fff" }}>قوس قزح أصلاً<br /><span style={{ color: YEL }}>دايرة كاملة!</span></p>
    </AbsoluteFill>
  );
};
