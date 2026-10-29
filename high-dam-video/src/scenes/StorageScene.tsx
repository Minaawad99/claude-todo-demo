import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CREST_Y, DamSection, GROUND_Y } from "../components/DamSection";
import { Caption, StepHeader } from "../components/SceneText";
import { clamp, colors, fontFamily, smooth } from "../theme";

export const StorageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const waterY = interpolate(frame, [0.3 * fps, 2.6 * fps], [780, CREST_Y + 80], {
    ...clamp,
    easing: smooth,
  });
  const arrow = interpolate(frame, [2.4 * fps, 3.2 * fps], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.night} 0%, ${colors.deep} 100%)` }}>
      <DamSection waterY={waterY} flow={0} frame={frame}>
        {/* Height arrow = potential energy */}
        <g opacity={arrow}>
          <line x1={240} y1={GROUND_Y - 10} x2={240} y2={waterY + 20} stroke={colors.energy} strokeWidth={8} />
          <path d={`M 216 ${waterY + 40} L 240 ${waterY + 4} L 264 ${waterY + 40} Z`} fill={colors.energy} />
          <path d={`M 216 ${GROUND_Y - 30} L 240 ${GROUND_Y + 6} L 264 ${GROUND_Y - 30} Z`} fill={colors.energy} />
        </g>
      </DamSection>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          left: 290,
          top: 400,
          fontFamily,
          fontSize: 54,
          fontWeight: 900,
          color: colors.energy,
          opacity: arrow,
        }}
      >
        طاقة وضع
      </div>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          left: 290,
          top: 570,
          fontFamily,
          fontSize: 46,
          fontWeight: 700,
          color: colors.text,
          opacity: interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 1], clamp),
        }}
      >
        بحيرة ناصر
      </div>

      <StepHeader step="١" title="تخزين المياه" />
      <Caption text="تتجمّع مياه النيل خلف السد على ارتفاع كبير، فتختزن طاقة وضع هائلة" />
    </AbsoluteFill>
  );
};
