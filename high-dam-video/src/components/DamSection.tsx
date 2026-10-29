import React from "react";
import { colors } from "../theme";

export const GROUND_Y = 860;
export const CREST_Y = 300;

// Cross-section of the dam: reservoir on the left, powerhouse on the right.
// `waterY` is the reservoir surface, `flow` (0..1) shows water in the tunnel,
// `frame` animates the flowing dashes and the downstream river.
export const DamSection: React.FC<{
  readonly waterY: number;
  readonly flow: number;
  readonly frame: number;
  readonly children?: React.ReactNode;
}> = ({ waterY, flow, frame, children }) => {
  const tunnel = "M 560 780 L 880 790 L 1180 820 L 1380 820";
  return (
    <svg viewBox="0 70 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.waterLight} />
          <stop offset="1" stopColor="#0d47a1" />
        </linearGradient>
      </defs>

      {/* Reservoir */}
      <path
        d={`M 0 ${waterY} L ${620 + (waterY - CREST_Y) * 0.05} ${waterY} L 760 ${GROUND_Y} L 0 ${GROUND_Y} Z`}
        fill="url(#lake)"
        opacity={0.92}
      />
      <path
        d={`M 0 ${waterY} Q 160 ${waterY - 8 + Math.sin(frame / 8) * 5} 320 ${waterY} T 640 ${waterY}`}
        stroke="#e1f5fe"
        strokeWidth={5}
        fill="none"
        opacity={0.7}
      />

      {/* Downstream river */}
      <path
        d={`M 1380 ${818 + Math.sin(frame / 7) * 4} Q 1650 ${810 + Math.cos(frame / 9) * 6} 1920 818 L 1920 ${GROUND_Y} L 1380 ${GROUND_Y} Z`}
        fill={colors.water}
        opacity={0.35 + flow * 0.55}
      />

      {/* Ground */}
      <rect x={0} y={GROUND_Y} width={1920} height={300} fill="#3e2f1f" />
      <rect x={0} y={GROUND_Y} width={1920} height={14} fill={colors.sand} />

      {/* Dam body (rock-fill embankment with concrete crest) */}
      <path
        d={`M 600 ${GROUND_Y} L 900 ${CREST_Y} L 1000 ${CREST_Y} L 1360 ${GROUND_Y} Z`}
        fill={colors.concreteDark}
      />
      <path
        d={`M 880 ${CREST_Y + 30} L 900 ${CREST_Y} L 1000 ${CREST_Y} L 1020 ${CREST_Y + 30} Z`}
        fill={colors.concrete}
      />

      {/* Power tunnel */}
      <path d={tunnel} stroke="#1a2733" strokeWidth={44} fill="none" strokeLinecap="round" />
      <path
        d={tunnel}
        stroke={colors.waterLight}
        strokeWidth={26}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="60 40"
        strokeDashoffset={-frame * 14}
        opacity={flow}
      />

      {/* Powerhouse */}
      <rect x={1300} y={690} width={240} height={170} rx={10} fill={colors.concrete} />
      <rect x={1300} y={670} width={240} height={28} fill={colors.concreteDark} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={1322 + i * 56} y={720} width={34} height={34} fill={flow > 0.5 ? colors.energy : "#33414f"} />
      ))}

      {children}
    </svg>
  );
};
