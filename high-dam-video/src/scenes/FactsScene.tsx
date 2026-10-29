import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, colors, fontFamily, pop, smooth } from "../theme";

const StatCard: React.FC<{
  readonly value: number;
  readonly decimals?: number;
  readonly unit: string;
  readonly label: string;
  readonly delay: number;
}> = ({ value, decimals = 0, unit, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = delay * fps;
  const shown = interpolate(frame, [start, start + 1.4 * fps], [0, value], {
    ...clamp,
    easing: smooth,
  });

  return (
    <div
      style={{
        width: 470,
        padding: "50px 30px",
        borderRadius: 36,
        background: "rgba(255,255,255,0.06)",
        border: `3px solid ${colors.waterLight}55`,
        textAlign: "center",
        opacity: interpolate(frame, [start, start + 0.4 * fps], [0, 1], clamp),
        scale: interpolate(frame, [start, start + fps], [0.6, 1], {
          ...clamp,
          easing: pop,
          output: "perceptual-scale",
        }),
      }}
    >
      <div style={{ fontSize: 130, fontWeight: 900, color: colors.energy, lineHeight: 1.1 }}>
        {shown.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </div>
      <div style={{ fontSize: 50, fontWeight: 700, color: colors.waterLight }}>{unit}</div>
      <div style={{ marginTop: 16, fontSize: 46, color: colors.text }}>{label}</div>
    </div>
  );
};

export const FactsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${colors.deep} 0%, ${colors.night} 75%)`,
        fontFamily,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 92,
          fontWeight: 900,
          color: colors.text,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
          translate: interpolate(frame, [0, 0.8 * fps], ["0px -40px", "0px 0px"], {
            ...clamp,
            easing: smooth,
          }),
        }}
      >
        عملاق على نهر النيل
      </div>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          top: 330,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <StatCard value={111} unit="مترًا" label="الارتفاع" delay={0.5} />
        <StatCard value={3.6} decimals={1} unit="كيلومتر" label="الطول" delay={0.9} />
        <StatCard value={2100} unit="ميجاوات" label="القدرة الكهربائية" delay={1.3} />
      </div>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 50,
          color: colors.muted,
          opacity: interpolate(frame, [2.6 * fps, 3.2 * fps], [0, 1], clamp),
        }}
      >
        يحجز خلفه بحيرة ناصر، من أكبر البحيرات الصناعية في العالم
      </div>
    </AbsoluteFill>
  );
};
