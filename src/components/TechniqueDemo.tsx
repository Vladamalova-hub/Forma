import React from "react";
import type { ZoneId } from "../data/program";
import BodyMap, { ZoneChips } from "./BodyMap";

export default function TechniqueDemo({
  name,
  zones,
  videoUrl,
  className = "",
}: {
  name?: string;
  zones: ZoneId[];
  videoUrl?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-white/10 bg-night-800 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute h-2 w-2 rounded-full bg-coral breathe" />
          </span>
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-fog">
            {name ? `Техника · ${name}` : "Техника"}
          </span>
        </div>
        <ZoneChips zones={zones} />
      </div>

      {videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="aspect-[4/3] w-full bg-night-950 object-contain"
        />
      ) : (
        <div className="relative">
          <div className="mx-auto h-48 sm:h-56">
            <BodyMap view="both" zones={zones} />
          </div>
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-night-950/60 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-fog backdrop-blur-sm">
            Пульсирующие зоны — работающие мышцы
          </span>
        </div>
      )}
    </div>
  );
}
