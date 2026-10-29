import React from "react";
import { colors } from "../theme";

// Francis-style runner seen from above. Rotation is driven by the caller.
export const Turbine: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly rotation: number;
}> = ({ cx, cy, r, rotation }) => {
  const blades = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
      <circle r={r} fill={colors.deep} stroke={colors.concrete} strokeWidth={6} />
      {blades.map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d={`M 0 0 C ${r * 0.35} ${-r * 0.2}, ${r * 0.75} ${-r * 0.15}, ${r * 0.9} ${r * 0.12} L ${r * 0.55} ${r * 0.2} C ${r * 0.4} ${r * 0.05}, ${r * 0.2} ${r * 0.02}, 0 0 Z`}
          fill={colors.waterLight}
          opacity={0.9}
        />
      ))}
      <circle r={r * 0.18} fill={colors.energy} />
    </g>
  );
};
