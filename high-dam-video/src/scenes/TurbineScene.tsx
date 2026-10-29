import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CREST_Y, DamSection } from "../components/DamSection";
import { Caption, StepHeader } from "../components/SceneText";
import { Turbine } from "../components/Turbine";
import { clamp, colors, smooth } from "../theme";

export const TurbineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flow = interpolate(frame, [0.4 * fps, 1.2 * fps], [0, 1], clamp);
  // Spin speeds up as the water arrives: integrate a ramping angular velocity.
  const spinStart = 1 * fps;
  const t = Math.max(0, frame - spinStart);
  const rotation = t < fps ? 6 * (t * t) / (2 * fps) : 6 * (fps / 2) + 6 * (t - fps);
  const inset = interpolate(frame, [1 * fps, 1.8 * fps], [0, 1], { ...clamp, easing: smooth });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.night} 0%, ${colors.deep} 100%)` }}>
      <DamSection waterY={CREST_Y + 80} flow={flow} frame={frame}>
        {/* Zoom-in callout on the turbine */}
        <g opacity={inset}>
          <line x1={1420} y1={720} x2={1560} y2={650} stroke={colors.energy} strokeWidth={4} strokeDasharray="12 10" />
          <circle cx={1580} cy={480} r={190} fill={colors.night} stroke={colors.energy} strokeWidth={6} />
          <Turbine cx={1580} cy={480} r={160} rotation={rotation} />
        </g>
      </DamSection>

      <StepHeader step="٢" title="اندفاع المياه والتوربين" />
      <Caption text="تندفع المياه بقوة عبر أنفاق داخل السد، فتدير ريش التوربينات بسرعة كبيرة" />
    </AbsoluteFill>
  );
};
