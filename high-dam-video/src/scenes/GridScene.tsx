import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, StepHeader } from "../components/SceneText";
import { clamp, colors, fontFamily, pop } from "../theme";

const TOWERS = [560, 900, 1240];
const LINE_Y = 470;

const Tower: React.FC<{ readonly x: number }> = ({ x }) => (
  <g stroke={colors.concrete} strokeWidth={7} fill="none">
    <path d={`M ${x - 60} 860 L ${x} ${LINE_Y - 20} L ${x + 60} 860`} />
    <path d={`M ${x - 45} 740 L ${x + 45} 740 M ${x - 30} 620 L ${x + 30} 620`} />
    <path d={`M ${x - 80} ${LINE_Y} L ${x + 80} ${LINE_Y}`} />
  </g>
);

const BUILDINGS = [
  { x: 1430, w: 110, h: 260 },
  { x: 1550, w: 90, h: 380 },
  { x: 1650, w: 120, h: 300 },
  { x: 1780, w: 100, h: 220 },
];

export const GridScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = (frame * 22) % 1300;
  const lit = interpolate(frame, [1.2 * fps, 2.4 * fps], [0, 1], clamp);
  const finale = 2.6 * fps;

  const cable = `M 260 ${LINE_Y} Q 390 ${LINE_Y + 70} 480 ${LINE_Y} L 640 ${LINE_Y} Q 730 ${LINE_Y + 70} 820 ${LINE_Y} L 980 ${LINE_Y} Q 1070 ${LINE_Y + 70} 1160 ${LINE_Y} L 1320 ${LINE_Y} Q 1400 ${LINE_Y + 70} 1480 ${LINE_Y + 120}`;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #030b14 0%, ${colors.deep} 100%)` }}>
      <svg viewBox="0 70 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={860} width={1920} height={300} fill="#14202c" />
        {/* Step-up transformer */}
        <rect x={120} y={640} width={200} height={220} rx={14} fill={colors.concreteDark} />
        <path d="M 200 690 L 175 760 L 215 760 L 190 830" stroke={colors.energy} strokeWidth={10} fill="none" />
        {TOWERS.map((x) => (
          <Tower key={x} x={x} />
        ))}
        <path d={cable} stroke="#4a5a6a" strokeWidth={6} fill="none" />
        <path d={cable} stroke={colors.energy} strokeWidth={10} fill="none" strokeDasharray={`90 ${1300 - 90}`} strokeDashoffset={-pulse} style={{ filter: `drop-shadow(0 0 14px ${colors.energy})` }} />
        <path d={cable} stroke={colors.energy} strokeWidth={10} fill="none" strokeDasharray={`90 ${1300 - 90}`} strokeDashoffset={-pulse + 650} style={{ filter: `drop-shadow(0 0 14px ${colors.energy})` }} />
        {/* City lighting up */}
        {BUILDINGS.map((b, bi) => (
          <g key={b.x}>
            <rect x={b.x} y={860 - b.h} width={b.w} height={b.h} fill="#1f2d3a" />
            {Array.from({ length: Math.floor(b.h / 50) * 2 }, (_, i) => {
              const on = lit * (Math.floor(b.h / 50) * 2) > i - bi;
              return (
                <rect
                  key={i}
                  x={b.x + 18 + (i % 2) * (b.w / 2)}
                  y={860 - b.h + 24 + Math.floor(i / 2) * 50}
                  width={b.w / 2 - 34}
                  height={24}
                  fill={on ? colors.energy : "#2c3e50"}
                />
              );
            })}
          </g>
        ))}
      </svg>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 84,
          fontWeight: 900,
          color: colors.energy,
          textShadow: `0 0 40px ${colors.energyHot}aa`,
          opacity: interpolate(frame, [finale, finale + 0.4 * fps], [0, 1], clamp),
          scale: interpolate(frame, [finale, finale + fps], [0.6, 1], {
            ...clamp,
            easing: pop,
            output: "perceptual-scale",
          }),
        }}
      >
        طاقة نظيفة من نهر النيل
      </div>

      <StepHeader step="٤" title="إلى كل بيت" />
      <Caption text="ترفع المحولات الجهد، وتنقل الأبراج الكهرباء إلى المدن والمصانع في أنحاء مصر" />
    </AbsoluteFill>
  );
};
