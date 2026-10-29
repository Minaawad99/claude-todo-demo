import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, colors, fontFamily, smooth } from "../theme";

// Step badge + heading at the top of each explainer scene.
export const StepHeader: React.FC<{
  readonly step: string;
  readonly title: string;
}> = ({ step, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        top: 70,
        right: 110,
        left: 110,
        display: "flex",
        alignItems: "center",
        gap: 28,
        fontFamily,
        opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
        translate: interpolate(frame, [0, 0.8 * fps], ["0px -40px", "0px 0px"], {
          ...clamp,
          easing: smooth,
        }),
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          background: colors.energy,
          color: colors.night,
          fontSize: 64,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 40px ${colors.energy}88`,
        }}
      >
        {step}
      </div>
      <div style={{ fontSize: 88, fontWeight: 900, color: colors.text }}>
        {title}
      </div>
    </div>
  );
};

// Bottom caption revealed word by word (keeps Arabic letters joined).
export const Caption: React.FC<{
  readonly text: string;
  readonly delay?: number;
}> = ({ text, delay = 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        bottom: 50,
        right: 80,
        left: 80,
        textAlign: "center",
        fontFamily,
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.45,
        color: colors.text,
        background: "rgba(6, 18, 31, 0.72)",
        borderRadius: 28,
        padding: "18px 36px",
      }}
    >
      {words.map((word, i) => {
        const start = (delay + i * 0.08) * fps;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginInlineEnd: "0.28em",
              opacity: interpolate(frame, [start, start + 0.35 * fps], [0, 1], clamp),
              translate: interpolate(
                frame,
                [start, start + 0.5 * fps],
                ["0px 24px", "0px 0px"],
                { ...clamp, easing: smooth },
              ),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
