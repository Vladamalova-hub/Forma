import React, { useState } from "react";
import VideoShell from "./VideoShell";
import { ExerciseScene } from "./Human3D";
import type { FigureId, ZoneId } from "../data/program";

export default function TechniqueVideo({
  figure,
  glows,
  name,
  accent = "#FF6D5A",
  className = "",
}: {
  figure: FigureId;
  glows: ZoneId[];
  name?: string;
  accent?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(true);
  return (
    <VideoShell
      label={name ? `Техника · ${name}` : "Видео техники"}
      duration={2.4}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      accent={accent}
      className={className}
    >
      <ExerciseScene figure={figure} glows={glows} paused={!playing} className="h-full" />
      <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-night-950/60 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-fog backdrop-blur-sm">
        вращай пальцем · мышцы подсвечены
      </span>
    </VideoShell>
  );
}
