import React, { useId } from "react";
import type { BodyScale } from "./Human3D";

const CX = 120;

interface Dims {
  sh: number; chW: number; waW: number; hiW: number; thW: number; knW: number; anW: number; arW: number;
}

function dims(b: BodyScale): Dims {
  return {
    sh: 37 * (0.72 + 0.28 * b.chest),
    chW: 31 * b.chest,
    waW: 21.5 * b.waist,
    hiW: 35 * b.hips,
    thW: 16 * b.thigh,
    knW: 9.5 * (0.75 + 0.25 * b.thigh),
    anW: 6.5,
    arW: 7.5 * b.arm,
  };
}

const shY = 116, chY = 160, ubY = 188, waY = 234, hiY = 294, crY = 332, knY = 414, anY = 494;

function torsoPath(d: Dims): string {
  const { sh, chW, waW, hiW } = d;
  const L = (x: number) => CX - x;
  const R = (x: number) => CX + x;
  return [
    `M ${L(sh)},${shY}`,
    `C ${L(sh)},${shY + 20} ${L(chW + 4)},${chY - 18} ${L(chW)},${chY}`,
    `C ${L(chW - 3)},${chY + 22} ${L(waW + 3)},${waY - 28} ${L(waW)},${waY}`,
    `C ${L(waW - 3)},${waY + 28} ${L(hiW + 3)},${hiY - 26} ${L(hiW)},${hiY}`,
    `C ${L(hiW - 2)},${hiY + 24} ${CX - 16},${crY - 6} ${CX},${crY}`,
    `C ${CX + 16},${crY - 6} ${R(hiW - 2)},${hiY + 24} ${R(hiW)},${hiY}`,
    `C ${R(hiW + 3)},${hiY - 26} ${R(waW - 3)},${waY + 28} ${R(waW)},${waY}`,
    `C ${R(waW + 3)},${waY - 28} ${R(chW - 3)},${chY + 22} ${R(chW)},${chY}`,
    `C ${R(chW + 4)},${chY - 18} ${R(sh)},${shY + 20} ${R(sh)},${shY}`,
    `C ${R(sh - 6)},${shY - 10} ${CX + 17},${100} ${CX + 9},${104}`,
    `L ${CX - 9},${104}`,
    `C ${CX - 17},${100} ${L(sh - 6)},${shY - 10} ${L(sh)},${shY}`,
    "Z",
  ].join(" ");
}

function legPath(d: Dims, side: -1 | 1): string {
  const hipX = CX + side * 17;
  const kneeX = CX + side * 13.5;
  const ankleX = CX + side * 11.5;
  const { thW, knW, anW } = d;
  const o = (x: number, w: number) => x - w; // outer
  const i = (x: number, w: number) => x + w; // inner (toward center)
  return [
    `M ${o(hipX, thW)},${hiY - 16}`,
    `C ${o(hipX, thW) - side * 2},${knY - 70} ${o(kneeX, knW) - side * 2},${knY - 26} ${o(kneeX, knW)},${knY}`,
    `C ${o(kneeX, knW) + side * 1},${knY + 28} ${o(ankleX, anW) - side * 1},${anY - 34} ${o(ankleX, anW)},${anY}`,
    `L ${i(ankleX, anW)},${anY}`,
    `C ${i(ankleX, anW) + side * 1},${anY - 34} ${i(kneeX, knW) + side * 1},${knY + 28} ${i(kneeX, knW)},${knY}`,
    `C ${i(kneeX, knW) + side * 2},${knY - 26} ${i(hipX, thW) + side * 2},${knY - 70} ${i(hipX, thW)},${hiY - 16}`,
    `C ${i(hipX, thW) - side * 1},${hiY - 26} ${o(hipX, thW) + side * 1},${hiY - 26} ${o(hipX, thW)},${hiY - 16}`,
    "Z",
  ].join(" ");
}

function pelvisPath(d: Dims): string {
  const { waW, hiW } = d;
  const L = (x: number) => CX - x;
  const R = (x: number) => CX + x;
  return [
    `M ${L(waW + 1)},${waY - 8}`,
    `C ${L(waW - 3)},${waY + 28} ${L(hiW + 3)},${hiY - 26} ${L(hiW)},${hiY}`,
    `C ${L(hiW - 2)},${hiY + 24} ${CX - 16},${crY - 6} ${CX},${crY}`,
    `C ${CX + 16},${crY - 6} ${R(hiW - 2)},${hiY + 24} ${R(hiW)},${hiY}`,
    `C ${R(hiW + 3)},${hiY - 26} ${R(waW - 3)},${waY + 28} ${R(waW + 1)},${waY - 8}`,
    `C ${CX + waW * 0.5},${waY - 14} ${CX - waW * 0.5},${waY - 14} ${L(waW + 1)},${waY - 8}`,
    "Z",
  ].join(" ");
}

function topPath(d: Dims): string {
  const { sh, chW } = d;
  const L = (x: number) => CX - x;
  const R = (x: number) => CX + x;
  return [
    `M ${L(sh - 5)},${shY + 16}`,
    `C ${L(sh - 6)},${shY + 34} ${L(chW + 2)},${chY - 8} ${L(chW - 1)},${ubY - 6}`,
    `L ${L(chW - 1)},${ubY}`,
    `C ${L(chW * 0.45)},${ubY + 11} ${R(chW * 0.45)},${ubY + 11} ${R(chW - 1)},${ubY}`,
    `L ${R(chW - 1)},${ubY - 6}`,
    `C ${R(chW + 2)},${chY - 8} ${R(sh - 6)},${shY + 34} ${R(sh - 5)},${shY + 16}`,
    `C ${R(sh - 14)},${shY + 10} ${CX + 10},${shY + 20} ${CX},${shY + 22}`,
    `C ${CX - 10},${shY + 20} ${L(sh - 14)},${shY + 10} ${L(sh - 5)},${shY + 16}`,
    "Z",
  ].join(" ");
}

function Figure({ body, ids, ghost = false }: { body: BodyScale; ids: string; ghost?: boolean }) {
  const d = dims(body);
  if (ghost) {
    return (
      <g fill="none" stroke="#C7A6F0" strokeWidth="2" strokeDasharray="5 6" opacity="0.5">
        <path d={torsoPath(d)} />
        <path d={legPath(d, -1)} />
        <path d={legPath(d, 1)} />
      </g>
    );
  }
  const armL = `M ${CX - d.sh + 9},${shY + 7} C ${CX - d.sh - 4},${shY + 78} ${CX - d.waW - 13},${waY + 16} ${CX - d.hiW + 3},${hiY + 20}`;
  const armR = `M ${CX + d.sh - 9},${shY + 7} C ${CX + d.sh + 4},${shY + 78} ${CX + d.waW + 13},${waY + 16} ${CX + d.hiW - 3},${hiY + 20}`;
  return (
    <g>
      {/* arms behind */}
      <path d={armL} stroke={`url(#${ids}-skin)`} strokeWidth={d.arW * 2} strokeLinecap="round" fill="none" />
      <path d={armR} stroke={`url(#${ids}-skin)`} strokeWidth={d.arW * 2} strokeLinecap="round" fill="none" />
      <ellipse cx={CX - d.hiW + 2} cy={hiY + 27} rx={d.arW + 1.5} ry={d.arW + 3} fill={`url(#${ids}-skin)`} />
      <ellipse cx={CX + d.hiW - 2} cy={hiY + 27} rx={d.arW + 1.5} ry={d.arW + 3} fill={`url(#${ids}-skin)`} />

      {/* legs (leggings) */}
      <path d={legPath(d, -1)} fill={`url(#${ids}-leg)`} />
      <path d={legPath(d, 1)} fill={`url(#${ids}-leg)`} />
      {/* inner thigh shadow */}
      <path d={`M ${CX - 17 + d.thW - 1},${hiY - 10} C ${CX - 13},${knY - 40} ${CX - 12},${knY} ${CX - 11},${anY - 30}`} stroke="rgba(10,26,34,0.4)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={`M ${CX + 17 - d.thW + 1},${hiY - 10} C ${CX + 13},${knY - 40} ${CX + 12},${knY} ${CX + 11},${anY - 30}`} stroke="rgba(10,26,34,0.4)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* feet */}
      <ellipse cx={CX - 14.5} cy={anY + 8} rx={d.anW + 3.5} ry={7} fill={`url(#${ids}-skin)`} />
      <ellipse cx={CX + 14.5} cy={anY + 8} rx={d.anW + 3.5} ry={7} fill={`url(#${ids}-skin)`} />

      {/* neck + head */}
      <path d={`M ${CX - 9},78 L ${CX + 9},78 L ${CX + 11},106 L ${CX - 11},106 Z`} fill={`url(#${ids}-skin)`} />
      <ellipse cx={CX} cy={82} rx={11} ry={4} fill="rgba(160,96,60,0.35)" />
      <ellipse cx={CX} cy={54} rx={24} ry={27} fill={`url(#${ids}-skin)`} />
      {/* hair */}
      <path d="M 96,52 C 95,28 110,22 120,22 C 130,22 145,28 144,52 C 138,36 128,32 120,32 C 112,32 102,36 96,52 Z" fill={`url(#${ids}-hair)`} />
      <path d="M 114,24 C 110,6 134,2 136,16 C 137,26 128,26 124,24 Z" fill={`url(#${ids}-hair)`} />
      <path d="M 96,50 C 93,66 96,76 100,82 C 98,66 99,58 101,50 Z" fill={`url(#${ids}-hair)`} />
      <path d="M 144,50 C 147,66 144,76 140,82 C 142,66 141,58 139,50 Z" fill={`url(#${ids}-hair)`} />

      {/* torso */}
      <path d={torsoPath(d)} fill={`url(#${ids}-skin)`} />
      {/* side shading */}
      <path d={`M ${CX - d.waW + 1},${waY} C ${CX - d.waW - 2},${waY + 26} ${CX - d.hiW},${hiY - 20} ${CX - d.hiW + 2},${hiY - 4}`} stroke="rgba(160,96,60,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={`M ${CX + d.waW - 1},${waY} C ${CX + d.waW + 2},${waY + 26} ${CX + d.hiW},${hiY - 20} ${CX + d.hiW - 2},${hiY - 4}`} stroke="rgba(160,96,60,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* belly highlight + navel */}
      <ellipse cx={CX - 7} cy={212} rx={24} ry={16} fill="rgba(255,240,225,0.28)" />
      <rect x={CX - 1.4} y={208} width={2.8} height={11} rx={1.4} fill="rgba(160,96,60,0.65)" />

      {/* clothing */}
      <path d={topPath(d)} fill={`url(#${ids}-top)`} />
      <path d={`M ${CX - 14},${shY + 16} L ${CX - 11},${104}`} stroke={`url(#${ids}-top)`} strokeWidth="5" strokeLinecap="round" />
      <path d={`M ${CX + 14},${shY + 16} L ${CX + 11},${104}`} stroke={`url(#${ids}-top)`} strokeWidth="5" strokeLinecap="round" />
      <path d={pelvisPath(d)} fill={`url(#${ids}-leg)`} />
      <path d={`M ${CX - d.waW - 1},${waY - 9} C ${CX - d.waW * 0.5},${waY - 13} ${CX + d.waW * 0.5},${waY - 13} ${CX + d.waW + 1},${waY - 9} L ${CX + d.waW + 1},${waY + 3} C ${CX + d.waW * 0.5},${waY - 1} ${CX - d.waW * 0.5},${waY - 1} ${CX - d.waW - 1},${waY + 3} Z`} fill="#2e5a70" />
    </g>
  );
}

export default function MorphFigure({
  body,
  ghost,
  guides,
  className = "",
}: {
  body: BodyScale;
  ghost?: BodyScale | null;
  guides?: { chest?: number; waist?: number; hips?: number };
  className?: string;
}) {
  const ids = useId().replace(/[:]/g, "");
  const d = dims(body);
  const hs = Math.min(1.12, Math.max(0.88, body.height ?? 1));

  const guideRows: { y: number; w: number; color: string; label: string; val?: number }[] = [
    { y: chY, w: d.chW, color: "#FFB084", label: "Грудь", val: guides?.chest },
    { y: waY, w: d.waW, color: "#7FD8B0", label: "Талия", val: guides?.waist },
    { y: hiY, w: d.hiW, color: "#FF6D5A", label: "Бёдра", val: guides?.hips },
  ];

  return (
    <svg viewBox="0 0 240 540" className={className} role="img" aria-label="Фигура по вашим замерам">
      <defs>
        <linearGradient id={`${ids}-skin`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dca278" />
          <stop offset="0.5" stopColor="#f2c9a8" />
          <stop offset="1" stopColor="#d69c74" />
        </linearGradient>
        <linearGradient id={`${ids}-leg`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a3a4a" />
          <stop offset="0.5" stopColor="#2f617a" />
          <stop offset="1" stopColor="#16323f" />
        </linearGradient>
        <linearGradient id={`${ids}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e0503f" />
          <stop offset="0.5" stopColor="#ff7c62" />
          <stop offset="1" stopColor="#d94f3e" />
        </linearGradient>
        <linearGradient id={`${ids}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5636" />
          <stop offset="1" stopColor="#6b3f24" />
        </linearGradient>
      </defs>

      <ellipse cx={CX} cy={512} rx={48} ry={8} fill="rgba(0,0,0,0.28)" />
      {/* масштаб по росту с якорем на уровне стоп */}
      <g transform={`translate(0 ${520 * (1 - hs)}) scale(1 ${hs})`}>
        {ghost && <Figure body={ghost} ids={`${ids}g`} ghost />}
        <Figure body={body} ids={ids} />

        {guides &&
          guideRows.map((g) => (
            <g key={g.label}>
              <line x1={CX - g.w - 14} y1={g.y} x2={CX + g.w + 14} y2={g.y} stroke={g.color} strokeWidth="1.2" strokeDasharray="3 5" opacity="0.85" />
              <line x1={CX - g.w - 14} y1={g.y - 4} x2={CX - g.w - 14} y2={g.y + 4} stroke={g.color} strokeWidth="1.4" opacity="0.85" />
              <line x1={CX + g.w + 14} y1={g.y - 4} x2={CX + g.w + 14} y2={g.y + 4} stroke={g.color} strokeWidth="1.4" opacity="0.85" />
              {g.val !== undefined && (
                <text x={CX + g.w + 20} y={g.y + 3.5} fill={g.color} fontSize="10.5" fontWeight="700" fontFamily="Golos Text, sans-serif">
                  {g.val} см
                </text>
              )}
            </g>
          ))}
      </g>
    </svg>
  );
}
