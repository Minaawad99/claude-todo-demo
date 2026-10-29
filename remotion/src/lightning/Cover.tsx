import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import { World, WorldState, LEADER } from "./World";
import { Cam } from "./Lightning";

// TikTok cover for the lightning video: the hook on top, the 3D strike over the city in the middle, the punch line under it.
const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800", "900"], subsets: ["arabic"] });
const YEL = "#f2c230";
const PANEL = { top: 540, h: 960 };

export const LightningCover: React.FC = () => {
  const s: WorldState = { t: 3.2, flash: 0.35, cut: 0, inside: 0, sep: 0, top: 0, ground: 0, steps: Math.max(...LEADER.map((l) => l.step)), stroke: 0.75, streamer: 1, shock: 0, rain: 1, globe: 0, empire: 0, current: 0 };
  const T: React.CSSProperties = { position: "absolute", width: "100%", textAlign: "center", direction: "rtl", fontFamily: NOTO, margin: 0 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <p style={{ ...T, top: 190, fontWeight: 600, fontSize: 30, color: "#d9d4c8" }}>إيه الحكاية؟</p>
      <p style={{ ...T, top: 236, fontWeight: 900, fontSize: 76, lineHeight: 1.25, color: "#fff" }}>إزاي البرق<br />والرعد بيحصلوا؟!</p>
      <div style={{ position: "absolute", top: PANEL.top, left: 40, width: 1000, height: PANEL.h, borderRadius: 36, overflow: "hidden", border: "4px solid #1d2438" }}>
        <ThreeCanvas width={1000} height={PANEL.h} camera={{ position: [-6, 3, 20], fov: 52, near: 0.1, far: 200 }}>
          <color attach="background" args={["#24305a"]} />
          <fog attach="fog" args={["#24305a", 28, 75]} />
          <Cam p={[-6, 3, 20]} l={[0.8, 8.2, -1]} fov={50} />
          <World s={s} />
        </ThreeCanvas>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 45%, rgba(200,225,255,.18), transparent 50%, rgba(0,0,0,.55))" }} />
      </div>
      <p style={{ ...T, top: 1545, fontWeight: 800, fontSize: 60, lineHeight: 1.3, color: "#fff" }}>البرق أسخن من الشمس<br /><span style={{ color: YEL }}>٥ مرات!</span></p>
    </AbsoluteFill>
  );
};
