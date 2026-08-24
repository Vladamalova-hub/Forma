import React from "react";
import type { FigureId, ZoneId } from "../data/program";
import { ZONE_META } from "../data/program";
import { FIGURE_PHOTO, FIGURE_HOTSPOT } from "../data/figures";
import { ExerciseScene } from "./Human3D";

export default function RealisticFigure({
  figure,
  glows,
  className = "",
}: {
  figure: FigureId;
  glows?: ZoneId[];
  className?: string;
}) {
  const src = FIGURE_PHOTO[figure];

  if (!src) {
    // no photorealistic image for this one -> volumetric 3D rig
    return <ExerciseScene figure={figure} glows={glows ?? ["waist"]} className={className} />;
  }

  const spot = FIGURE_HOTSPOT[figure];
  const color = spot ? ZONE_META[spot.zone].color : "#FF6D5A";

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-night-900/70 ${className}`}>
      <img
        src={src}
        alt="Демонстрация упражнения"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        loading="lazy"
        draggable={false}
      />
      {/* soft working-muscle glow */}
      {spot && (
        <div
          aria-hidden
          className="zone-blob pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            background: `radial-gradient(circle, ${color}b3 0%, ${color}40 45%, transparent 70%)`,
          }}
        />
      )}
      {/* bottom vignette for caption legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
  );
}
