import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansArabic";
import { World, WorldState, ZERO } from "./World";
import { Cam } from "./MRI";

// TikTok cover for the MRI video, full bleed at 1080×1920 in the realistic 3D look: the scanner in a dim room, a chair and an
// oxygen tank stuck to its face, the shocked patient inside, field lines and the knocking rings, one warm glow behind.
// Text in Noto (the user's rule), inside the 3:4 profile crop (y 240–1680) and clear of TikTok's right-hand buttons.
const { fontFamily: NOTO } = loadNoto("normal", { weights: ["600", "800", "900"], subsets: ["arabic"] });
const YEL = "#f2c230";

export const MRICover: React.FC = () => {
  const s: WorldState = { t: 6.37, ...ZERO, slide: 1, chair: 1, tank: 1, grad: 0.5, field: 0.25, night: 0.45, mood: "shock" };
  const T: React.CSSProperties = { position: "absolute", left: 48, right: 128, textAlign: "center", direction: "rtl", fontFamily: NOTO, margin: 0, textShadow: "0 6px 20px rgba(0,0,0,.7)" };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [-0.9, 2.0, 6.6], fov: 44, near: 0.05, far: 120 }}>
        <color attach="background" args={["#0e1620"]} />
        <Cam p={[-0.9, 2.0, 6.6]} l={[0.1, 1.0, 0.6]} fov={44} />
        <World s={s} />
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 30% at 48% 52%, rgba(255,205,110,.35), rgba(255,205,110,0) 70%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 600, background: "linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.55) 75%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.7) 30%, rgba(0,0,0,.95))" }} />
      <p style={{ ...T, top: 264, fontWeight: 600, fontSize: 30, color: "#d9d4c8" }}>إيه الحكاية؟</p>
      <p style={{ ...T, top: 308, fontWeight: 900, fontSize: 84, lineHeight: 1.2, color: "#fff" }}>ليه الرنين صوته عالي؟!</p>
      <p style={{ ...T, top: 428, fontWeight: 800, fontSize: 48, lineHeight: 1.3, color: YEL }}>وممنوع تدخله بأي حديد</p>
      <div style={{ position: "absolute", left: 90, top: 1130, transform: "rotate(-5deg)", background: "#d8352a", color: "#fff", fontFamily: NOTO, fontWeight: 800, fontSize: 46, padding: "8px 30px 16px", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>اتلزقت فيه!</div>
      <p style={{ ...T, top: 1444, fontWeight: 800, fontSize: 64, lineHeight: 1.35, color: "#fff" }}>أقوى من مغناطيس الأرض<br /><span style={{ color: YEL }}>30 ألف</span> مرة<br /><span style={{ fontSize: 46, color: "#d9d4c8" }}>وشغال 24 ساعة!</span></p>
    </AbsoluteFill>
  );
};
