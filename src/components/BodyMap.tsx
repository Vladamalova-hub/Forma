import React, { useId } from "react";
import { ZONE_META, type ZoneId } from "../data/program";

type View = "front" | "back";

const SIL: React.CSSProperties = {
  stroke: "rgba(246,239,232,0.55)",
  strokeWidth: 1.6,
  fill: "none",
  strokeDasharray: "3 5",
  strokeLinecap: "round",
};

function FrontFigure() {
  return (
    <g>
      <circle cx="60" cy="22" r="13" style={SIL} />
      <path d="M55 36 V45 M65 36 V45" style={SIL} />
      <path
        d="M38 50 C46 44 74 44 82 50 C86 64 84 80 79 94 C77 101 77 105 79 111 C85 122 89 136 87 150 C86 158 83 165 77 168 L43 168 C37 165 34 158 33 150 C31 136 35 122 41 111 C43 105 43 101 41 94 C36 80 34 64 38 50 Z"
        style={{ ...SIL, fill: "rgba(255,255,255,0.025)" }}
      />
      <path d="M39 55 C31 70 27 90 26 112 C25 124 26 134 29 143" style={SIL} />
      <path d="M81 55 C89 70 93 90 94 112 C95 124 94 134 91 143" style={SIL} />
      <path d="M46 168 C43 190 42 210 44 232 M57 168 C56 190 55 210 56 232 M44 236 H57" style={SIL} />
      <path d="M74 168 C77 190 78 210 76 232 M63 168 C64 190 65 210 64 232 M63 236 H76" style={SIL} />
    </g>
  );
}

function BackFigure() {
  return (
    <g>
      <circle cx="60" cy="22" r="13" style={SIL} />
      <path d="M55 36 V45 M65 36 V45" style={SIL} />
      <path
        d="M38 50 C46 44 74 44 82 50 C86 64 84 80 80 94 C78 104 78 110 80 118 C84 130 86 140 85 150 L35 150 C34 140 36 130 40 118 C42 110 42 104 40 94 C36 80 34 64 38 50 Z"
        style={{ ...SIL, fill: "rgba(255,255,255,0.025)" }}
      />
      <path d="M39 55 C31 70 27 90 26 112 C25 124 26 134 29 143" style={SIL} />
      <path d="M81 55 C89 70 93 90 94 112 C95 124 94 134 91 143" style={SIL} />
      <path
        d="M35 150 C36 158 39 164 43 168 L77 168 C81 164 84 158 85 150"
        style={SIL}
      />
      <path d="M43 168 C44 157 51 151 60 155 C69 151 76 157 77 168 M60 155 V168" style={SIL} />
      <path d="M46 168 C43 190 42 210 44 232 M57 168 C56 190 55 210 56 232 M44 236 H57" style={SIL} />
      <path d="M74 168 C77 190 78 210 76 232 M63 168 C64 190 65 210 64 232 M63 236 H76" style={SIL} />
    </g>
  );
}

const FRONT_ZONES: Record<string, { cx: number; cy: number; rx: number; ry: number; rot?: number }[]> = {
  chest: [{ cx: 60, cy: 74, rx: 17, ry: 11 }],
  waist: [
    { cx: 41.5, cy: 104, rx: 7, ry: 12 },
    { cx: 78.5, cy: 104, rx: 7, ry: 12 },
  ],
  belly: [{ cx: 60, cy: 127, rx: 14, ry: 13 }],
  legs: [
    { cx: 50.5, cy: 194, rx: 8.5, ry: 17 },
    { cx: 69.5, cy: 194, rx: 8.5, ry: 17 },
  ],
  arms: [
    { cx: 27.5, cy: 104, rx: 6.5, ry: 18, rot: 6 },
    { cx: 92.5, cy: 104, rx: 6.5, ry: 18, rot: -6 },
  ],
};

const BACK_ZONES: Record<string, { cx: number; cy: number; rx: number; ry: number; rot?: number }[]> = {
  glutes: [
    { cx: 49, cy: 162, rx: 12, ry: 12 },
    { cx: 71, cy: 162, rx: 12, ry: 12 },
  ],
  back: [{ cx: 60, cy: 84, rx: 17, ry: 14 }],
  legs: [
    { cx: 50.5, cy: 194, rx: 8.5, ry: 17 },
    { cx: 69.5, cy: 194, rx: 8.5, ry: 17 },
  ],
  arms: [
    { cx: 27.5, cy: 104, rx: 6.5, ry: 18 },
    { cx: 92.5, cy: 104, rx: 6.5, ry: 18 },
  ],
};

function Figure({ view, zones, filterId, overlay }: { view: View; zones: ZoneId[]; filterId: string; overlay?: React.ReactNode }) {
  const map = view === "front" ? FRONT_ZONES : BACK_ZONES;
  let i = 0;
  return (
    <svg viewBox="0 0 120 250" className="h-full w-auto" role="img" aria-label={`Зоны: ${zones.map((z) => ZONE_META[z].label).join(", ") || "нет"}`}>
      {view === "front" ? <FrontFigure /> : <BackFigure />}
      {zones.map((z) =>
        (map[z] ?? []).map((e, k) => {
          const delay = `${(i++ % 5) * 0.3}s`;
          return (
            <g key={`${z}-${k}`}>
              <ellipse
                cx={e.cx}
                cy={e.cy}
                rx={e.rx}
                ry={e.ry}
                transform={e.rot ? `rotate(${e.rot} ${e.cx} ${e.cy})` : undefined}
                fill={ZONE_META[z].color}
                opacity={0.5}
                filter={`url(#${filterId})`}
                className="zone-blob"
                style={{ animationDelay: delay }}
              />
              <ellipse
                cx={e.cx}
                cy={e.cy}
                rx={e.rx * 0.62}
                ry={e.ry * 0.62}
                transform={e.rot ? `rotate(${e.rot} ${e.cx} ${e.cy})` : undefined}
                fill={ZONE_META[z].color}
                opacity={0.75}
                className="zone-blob"
                style={{ animationDelay: delay }}
              />
            </g>
          );
        })
      )}
      {overlay}
    </svg>
  );
}

export default function BodyMap({
  view = "front",
  zones,
  className = "",
  overlay,
}: {
  view?: View | "both";
  zones: ZoneId[];
  className?: string;
  overlay?: React.ReactNode;
}) {
  const id = useId().replace(/[:]/g, "");
  const filterId = `zblur-${id}`;
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
      </svg>
      {view !== "back" && (
        <Figure view="front" zones={view === "front" ? zones : zones} filterId={filterId} overlay={overlay} />
      )}
      {view === "back" && <Figure view="back" zones={zones} filterId={filterId} overlay={overlay} />}
      {view === "both" && <Figure view="back" zones={zones} filterId={filterId} />}
    </div>
  );
}

export function ZoneChips({ zones, className = "" }: { zones: ZoneId[]; className?: string }) {
  const uniq = Array.from(new Set(zones));
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {uniq.map((z) => (
        <span
          key={z}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: ZONE_META[z].color, boxShadow: `0 0 8px ${ZONE_META[z].color}` }} />
          {ZONE_META[z].label}
        </span>
      ))}
    </div>
  );
}
