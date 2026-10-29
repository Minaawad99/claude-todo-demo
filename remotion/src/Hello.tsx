import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// A test scene in the channel's look: black frame, title, a yellow keyword popping in, the brand at the bottom.
export const Hello: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 20, fps, config: { damping: 12 } });
  const drift = interpolate(frame, [0, 180], [1, 1.08]);
  return (
    <AbsoluteFill style={{ background: "#000", color: "#fff", fontFamily: "Noto Sans Arabic, sans-serif", direction: "rtl", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${drift})`, textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 900 }}>إيه الحكاية؟</div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#f2c230", transform: `scale(${pop})`, marginTop: 40 }}>Remotion شغال!</div>
      </div>
      <div style={{ position: "absolute", bottom: 120, fontSize: 36, opacity: 0.7 }}>إيه الحكاية؟</div>
    </AbsoluteFill>
  );
};
