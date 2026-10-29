import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, StepHeader } from "../components/SceneText";
import { clamp, colors, fontFamily } from "../theme";

const CX = 820;
const CY = 500;
const R = 225;

export const GeneratorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rotation = frame * 9;
  const reveal = interpolate(frame, [0, 0.6 * fps], [0, 1], clamp);
  const wave = interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], clamp);

  // Live sine trace of the induced voltage, scrolling with the rotor.
  const points = Array.from({ length: 80 }, (_, i) => {
    const x = 1220 + i * 7.5;
    const y = CY - Math.sin(((rotation - i * 9) * Math.PI) / 180) * 110;
    return `${x},${y}`;
  }).join(" ");

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 40% 50%, ${colors.deep} 0%, ${colors.night} 70%)` }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, opacity: reveal }}>
        {/* Shaft from the turbine below */}
        <rect x={CX - 18} y={CY + R - 10} width={36} height={120} fill={colors.concrete} />
        {/* Stator */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.concreteDark} strokeWidth={50} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = i * 30;
          // A coil glows when a magnet pole sweeps past it.
          const glow = Math.abs(Math.cos(((rotation - a) * Math.PI) / 180)) ** 6;
          return (
            <g key={a} transform={`rotate(${a} ${CX} ${CY})`}>
              <rect
                x={CX - 30}
                y={CY - R - 34}
                width={60}
                height={68}
                rx={10}
                fill={colors.copper}
                stroke={colors.energy}
                strokeWidth={4 + glow * 6}
                style={{ filter: `drop-shadow(0 0 ${glow * 26}px ${colors.energy})` }}
              />
            </g>
          );
        })}
        {/* Rotor magnet */}
        <g transform={`rotate(${rotation} ${CX} ${CY})`}>
          <rect x={CX - 50} y={CY - 170} width={100} height={170} rx={14} fill="#e53935" />
          <rect x={CX - 50} y={CY} width={100} height={170} rx={14} fill="#1e88e5" />
          <text x={CX} y={CY - 75} fill="white" fontSize={60} fontWeight={900} textAnchor="middle" dominantBaseline="middle" fontFamily={fontFamily}>
            N
          </text>
          <text x={CX} y={CY + 85} fill="white" fontSize={60} fontWeight={900} textAnchor="middle" dominantBaseline="middle" fontFamily={fontFamily}>
            S
          </text>
        </g>
        <circle cx={CX} cy={CY} r={22} fill={colors.concrete} />

        {/* Output wire + AC trace */}
        <g opacity={wave}>
          <line x1={CX + R + 25} y1={CY} x2={1210} y2={CY} stroke={colors.energy} strokeWidth={8} strokeDasharray="22 14" strokeDashoffset={-frame * 10} />
          <line x1={1220} y1={CY} x2={1820} y2={CY} stroke="#ffffff33" strokeWidth={3} />
          <polyline points={points} fill="none" stroke={colors.energy} strokeWidth={8} strokeLinejoin="round" />
        </g>
      </svg>

      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          left: 1220,
          width: 600,
          top: 290,
          textAlign: "center",
          fontFamily,
          fontSize: 46,
          fontWeight: 700,
          color: colors.energy,
          opacity: wave,
        }}
      >
        تيار كهربائي متردد
      </div>
      <div
        dir="rtl"
        lang="ar"
        style={{
          position: "absolute",
          left: 1220,
          width: 600,
          top: 680,
          textAlign: "center",
          fontFamily,
          fontSize: 44,
          color: colors.text,
          opacity: interpolate(frame, [2.4 * fps, 3 * fps], [0, 1], clamp),
        }}
      >
        ١٢ توربينًا × ١٧٥ ميجاوات
      </div>

      <StepHeader step="٣" title="المولّد الكهربائي" />
      <Caption text="يدير التوربين مغناطيسًا عملاقًا داخل ملفات نحاسية، فيتولّد تيار كهربائي" />
    </AbsoluteFill>
  );
};
