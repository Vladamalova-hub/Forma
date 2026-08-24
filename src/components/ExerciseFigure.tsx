import React, { useId } from "react";
import type { FigureId } from "../data/program";

const FIG: React.CSSProperties = {
  stroke: "#F6EFE8",
  strokeWidth: 4,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ARROW: React.CSSProperties = {
  stroke: "#7FD8B0",
  strokeWidth: 2.6,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const origin = (x: number, y: number): React.CSSProperties => ({
  transformBox: "view-box" as const,
  transformOrigin: `${x}px ${y}px`,
});

function Ground() {
  return (
    <g>
      <line x1="18" y1="132" x2="212" y2="132" stroke="rgba(246,239,232,0.14)" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Blob({ x, y, r, color, id, delay = "0s" }: { x: number; y: number; r: number; color: string; id: string; delay?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} opacity={0.4} filter={`url(#${id})`} className="zone-blob" style={{ animationDelay: delay }} />
      <circle cx={x} cy={y} r={r * 0.55} fill={color} opacity={0.65} className="zone-blob" style={{ animationDelay: delay }} />
    </g>
  );
}

export default function ExerciseFigure({ figure, accent }: { figure: FigureId; accent: string }) {
  const blurId = useId().replace(/[:]/g, "");

  const scene = (() => {
    switch (figure) {
      case "squat":
        return (
          <g>
            <Ground />
            <path d="M86 132 L88 108 L104 86 M144 132 L142 108 L126 86" style={FIG} />
            <g className="ef-bob">
              <path d="M104 86 H126 M115 86 V52" style={FIG} />
              <circle cx="115" cy="42" r="9" style={FIG} />
              <path d="M115 60 L98 68 M115 60 L132 68" style={FIG} />
            </g>
            <Blob x={115} y={92} r={13} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M166 78 V108 M160 84 L166 78 L172 84 M160 102 L166 108 L172 102" style={ARROW} />
            </g>
          </g>
        );
      case "bridge":
        return (
          <g>
            <Ground />
            <circle cx="48" cy="123" r="9" style={FIG} />
            <path d="M57 128 H95" style={FIG} />
            <g className="ef-lift">
              <path d="M95 128 L118 102 L138 128" style={FIG} />
              <Blob x={103} y={118} r={11} color={accent} id={blurId} />
            </g>
            <path d="M138 128 H150" style={FIG} />
            <g className="ef-arrow">
              <path d="M118 92 V70 M112 76 L118 70 L124 76" style={ARROW} />
            </g>
          </g>
        );
      case "donkey":
        return (
          <g>
            <Ground />
            <circle cx="58" cy="87" r="8" style={FIG} />
            <path d="M66 91 L70 96 M70 132 V96 M92 132 V96 M70 96 H120" style={FIG} />
            <path d="M120 96 L118 118 L104 130" style={FIG} />
            <g className="ef-kick" style={origin(120, 96)}>
              <path d="M120 96 L148 102 L162 88 L168 84" style={FIG} />
            </g>
            <Blob x={126} y={100} r={10} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M150 118 A24 24 0 0 0 168 82 M161 84 L168 82 L167 90" style={ARROW} />
            </g>
          </g>
        );
      case "sideleg":
        return (
          <g>
            <Ground />
            <circle cx="50" cy="119" r="9" style={FIG} />
            <path d="M59 124 H128 M84 124 V112 M128 124 L166 130" style={FIG} />
            <g className="ef-sideleg" style={origin(128, 122)}>
              <path d="M128 122 L164 106" style={FIG} />
            </g>
            <Blob x={132} y={114} r={10} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M156 96 V72 M150 78 L156 72 L162 78" style={ARROW} />
            </g>
          </g>
        );
      case "pushup":
        return (
          <g>
            <Ground />
            <g className="ef-push" style={origin(150, 124)}>
              <circle cx="64" cy="77" r="9" style={FIG} />
              <path d="M74 84 L150 124 M80 86 V130" style={FIG} />
            </g>
            <path d="M150 124 L174 112" style={FIG} />
            <Blob x={88} y={94} r={11} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M96 66 V46 M90 52 L96 46 L102 52 M96 74 V86" style={ARROW} />
            </g>
          </g>
        );
      case "fly":
        return (
          <g>
            <Ground />
            <circle cx="52" cy="123" r="9" style={FIG} />
            <path d="M61 128 H120 M120 128 L142 104 L160 128" style={FIG} />
            <path d="M76 124 V96" style={{ ...FIG, opacity: 0.25, strokeDasharray: "3 5" }} transform="rotate(70 76 124)" />
            <g className="ef-fly" style={origin(76, 124)}>
              <path d="M76 124 V96" style={FIG} />
              <circle cx="76" cy="93" r="4" fill="#F6EFE8" stroke="none" />
            </g>
            <Blob x={80} y={116} r={10} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M58 92 A26 26 0 0 1 96 82 M90 76 L96 82 L88 86" style={ARROW} />
            </g>
          </g>
        );
      case "press":
        return (
          <g>
            <Ground />
            <circle cx="115" cy="44" r="9" style={FIG} />
            <path d="M115 96 V54 M115 96 L102 132 M115 96 L128 132" style={FIG} />
            <path d="M115 62 L97 72 M115 62 L133 72" style={FIG} />
            <g className="ef-press-l">
              <path d="M97 72 L108 66" style={FIG} />
              <circle cx="110" cy="65" r="4" fill="#F6EFE8" stroke="none" />
            </g>
            <g className="ef-press-r">
              <path d="M133 72 L122 66" style={FIG} />
              <circle cx="120" cy="65" r="4" fill="#F6EFE8" stroke="none" />
            </g>
            <g className="ef-spark">
              <path d="M108 54 L104 47 M122 54 L126 47 M115 51 V44" style={{ ...ARROW, stroke: "#FFB084" }} />
            </g>
            <Blob x={115} y={74} r={11} color={accent} id={blurId} delay="0.3s" />
          </g>
        );
      case "planktap":
        return (
          <g>
            <Ground />
            <circle cx="66" cy="81" r="9" style={FIG} />
            <path d="M78 90 L152 122 L174 130" style={FIG} />
            <path d="M82 92 V130" style={FIG} />
            <g className="ef-tap" style={origin(82, 92)}>
              <path d="M82 92 V128" style={FIG} />
              <circle cx="82" cy="128" r="4" fill="#F6EFE8" stroke="none" />
            </g>
            <Blob x={86} y={102} r={8} color="#C7A6F0" id={blurId} />
            <Blob x={118} y={108} r={10} color={accent} id={blurId} delay="0.4s" />
          </g>
        );
      case "vacuum":
        return (
          <g>
            <Ground />
            <circle cx="110" cy="38" r="9" style={FIG} />
            <path d="M112 47 V102 M112 62 C104 70 100 80 102 92" style={FIG} />
            <path d="M112 102 L104 132 M112 102 L122 132 M100 132 H108 M118 132 H126" style={FIG} />
            <ellipse cx="118" cy="86" rx="9" ry="13" fill={accent} opacity={0.55} className="ef-vac" style={{ ...origin(109, 86) }} />
            <g className="ef-arrow">
              <path d="M146 86 H132 M138 80 L132 86 L138 92" style={ARROW} />
              <path d="M86 86 H98 M92 80 L98 86 L92 92" style={ARROW} />
            </g>
          </g>
        );
      case "sideplank":
        return (
          <g>
            <Ground />
            <g className="ef-sph">
              <circle cx="78" cy="85" r="9" style={FIG} />
              <path d="M86 96 L170 122 M86 96 L78 64" style={FIG} />
            </g>
            <path d="M86 96 V130" style={FIG} />
            <path d="M170 122 L176 132" style={FIG} />
            <Blob x={122} y={106} r={11} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M122 92 V70 M116 76 L122 70 L128 76" style={ARROW} />
            </g>
          </g>
        );
      case "crunch":
        return (
          <g>
            <Ground />
            <path d="M120 126 L144 102 L164 126" style={FIG} />
            <g className="ef-curl" style={origin(120, 126)}>
              <circle cx="72" cy="112" r="9" style={FIG} />
              <path d="M120 126 L82 118 M84 118 L68 108 M84 118 L74 102" style={FIG} />
            </g>
            <Blob x={102} y={118} r={10} color={accent} id={blurId} />
            <g className="ef-arrow">
              <path d="M66 96 A28 28 0 0 1 92 82 M86 76 L92 82 L84 87" style={ARROW} />
            </g>
          </g>
        );
      case "twist":
        return (
          <g>
            <Ground />
            <path d="M115 118 L140 104 L158 112" style={FIG} />
            <g className="ef-twist" style={origin(115, 116)}>
              <circle cx="96" cy="66" r="9" style={FIG} />
              <path d="M115 116 L100 78 M100 82 L124 96" style={FIG} />
              <circle cx="127" cy="98" r="4.5" fill="#F6EFE8" stroke="none" />
            </g>
            <Blob x={106} y={102} r={8} color={accent} id={blurId} />
            <Blob x={122} y={100} r={8} color={accent} id={blurId} delay="0.35s" />
            <g className="ef-arrow">
              <path d="M140 74 H168 M146 68 L140 74 L146 80 M162 68 L168 74 L162 80" style={ARROW} />
            </g>
          </g>
        );
    }
  })();

  return (
    <svg viewBox="0 0 230 150" className="h-full w-full" role="img" aria-label="Демонстрация упражнения">
      <defs>
        <filter id={blurId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {scene}
    </svg>
  );
}
