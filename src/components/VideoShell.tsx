import React, { useEffect, useRef, useState } from "react";
import { IconPlay, IconPause } from "./icons";

export default function VideoShell({
  label,
  duration,
  playing,
  onToggle,
  accent = "#FF6D5A",
  children,
  className = "",
  right,
}: {
  label: string;
  duration: number;
  playing: boolean;
  onToggle: () => void;
  accent?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      if (playing) {
        tRef.current = (tRef.current + 0.1) % duration;
        setT(tRef.current);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [playing, duration]);

  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, "0")}`;

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/10 bg-night-900/80 ${className}`}
      data-vp-paused={!playing}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute h-2 w-2 rounded-full breathe"
              style={{ background: playing ? "#FF6D5A" : "rgba(255,255,255,0.3)" }}
            />
          </span>
          <span className="truncate font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fog">{label}</span>
        </span>
        {right ?? (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-fog">
            3D · цикл
          </span>
        )}
      </div>

      {/* stage */}
      <div className="relative aspect-[16/10] w-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]">
        {children}
        {!playing && (
          <button
            onClick={onToggle}
            className="pop-in absolute inset-0 flex items-center justify-center bg-night-950/45"
            aria-label="Воспроизвести"
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full text-night-950"
              style={{ background: accent, boxShadow: `0 10px 34px ${accent}66` }}
            >
              <IconPlay className="h-7 w-7" />
            </span>
          </button>
        )}
      </div>

      {/* controls */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          className="btn-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-night-950"
          style={{ background: accent, boxShadow: `0 5px 18px ${accent}4d` }}
          aria-label={playing ? "Пауза" : "Играть"}
        >
          {playing ? <IconPause className="h-4.5 w-4.5" /> : <IconPlay className="h-4.5 w-4.5" />}
        </button>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${(t / duration) * 100}%`, background: accent, transition: "width 0.12s linear" }}
          />
        </div>
        <span className="shrink-0 font-display text-[10px] font-bold tabular-nums text-fog">
          {fmt(t)} <span className="text-white/25">/ ∞</span>
        </span>
      </div>
    </div>
  );
}
