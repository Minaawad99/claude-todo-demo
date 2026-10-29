import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, colors, fontFamily, pop, smooth } from "../theme";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0d2b45 0%, #3b4a6b 45%, #c9785a 78%, ${colors.sand} 100%)`,
      }}
    >
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {/* Sun */}
        <circle
          cx={1500}
          cy={interpolate(frame, [0, 5 * fps], [700, 610], clamp)}
          r={90}
          fill="#ffd27a"
          opacity={0.9}
        />
        {/* Dam body rising */}
        <g
          style={{
            translate: interpolate(frame, [0, 1.4 * fps], ["0px 320px", "0px 0px"], {
              ...clamp,
              easing: smooth,
            }),
          }}
        >
          <path d="M 0 760 L 1920 760 L 1920 1080 L 0 1080 Z" fill={colors.concreteDark} />
          <path d="M 0 730 L 1920 730 L 1920 770 L 0 770 Z" fill={colors.concrete} />
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={i} x={i * 82 + 20} y={742} width={30} height={14} fill="#ffe8a3" opacity={0.85} />
          ))}
        </g>
        {/* Nile water */}
        <path
          d={`M 0 ${930 + Math.sin(frame / 10) * 6} Q 480 ${905 + Math.cos(frame / 12) * 8} 960 930 T 1920 ${925 + Math.sin(frame / 9) * 6} L 1920 1080 L 0 1080 Z`}
          fill={colors.water}
          opacity={interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 0.9], clamp)}
        />
      </svg>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          top: 170,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          color: colors.text,
        }}
      >
        <div
          style={{
            fontSize: 190,
            fontWeight: 900,
            lineHeight: 1.1,
            textShadow: "0 10px 40px rgba(0,0,0,0.45)",
            opacity: interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], clamp),
            scale: interpolate(frame, [0.6 * fps, 1.6 * fps], [0.7, 1], {
              ...clamp,
              easing: pop,
              output: "perceptual-scale",
            }),
          }}
        >
          السد العالي
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 62,
            fontWeight: 700,
            color: colors.energy,
            opacity: interpolate(frame, [1.6 * fps, 2.2 * fps], [0, 1], clamp),
            translate: interpolate(frame, [1.6 * fps, 2.4 * fps], ["0px 30px", "0px 0px"], {
              ...clamp,
              easing: smooth,
            }),
          }}
        >
          كيف تتحوّل مياه النيل إلى كهرباء؟
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 44,
            color: colors.text,
            opacity: interpolate(frame, [2.4 * fps, 3 * fps], [0, 0.85], clamp),
          }}
        >
          أسوان · مصر · 1970
        </div>
      </div>
    </AbsoluteFill>
  );
};
