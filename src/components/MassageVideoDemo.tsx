import React, { useState } from "react";
import VideoShell from "./VideoShell";

const HAND = (
  <>
    <ellipse cx="202" cy="100" rx="10.5" ry="13" fill="#f4cfae" stroke="#d69c74" strokeWidth="1.4" />
    <rect x="187" y="89" width="13" height="5.2" rx="2.6" fill="#f4cfae" stroke="#d69c74" strokeWidth="1" transform="rotate(-10 193 91)" />
    <rect x="185" y="96" width="15" height="5.2" rx="2.6" fill="#f4cfae" stroke="#d69c74" strokeWidth="1" transform="rotate(-2 192 98)" />
    <rect x="185" y="103" width="15" height="5.2" rx="2.6" fill="#f4cfae" stroke="#d69c74" strokeWidth="1" transform="rotate(4 192 105)" />
    <rect x="187" y="109" width="13" height="5" rx="2.5" fill="#f4cfae" stroke="#d69c74" strokeWidth="1" transform="rotate(10 193 111)" />
    <rect x="196" y="112" width="11" height="5" rx="2.5" fill="#f4cfae" stroke="#d69c74" strokeWidth="1" transform="rotate(35 201 114)" />
  </>
);

export default function MassageVideoDemo({ className = "" }: { className?: string }) {
  const [playing, setPlaying] = useState(true);
  return (
    <VideoShell
      label="Видео техники · Массаж живота"
      duration={5}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      accent="#7FD8B0"
      className={className}
      right={
        <span className="shrink-0 rounded-full border border-mint/30 bg-mint/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-mint">
          по часовой
        </span>
      }
    >
      <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mbSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4cfae" />
            <stop offset="1" stopColor="#e0a87e" />
          </linearGradient>
          <linearGradient id="mbCoral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff7c62" />
            <stop offset="1" stopColor="#e0503f" />
          </linearGradient>
          <linearGradient id="mbTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f617a" />
            <stop offset="1" stopColor="#1a3a4a" />
          </linearGradient>
        </defs>

        <rect x="0" y="176" width="320" height="24" fill="rgba(255,255,255,0.03)" />

        {/* belly */}
        <g className="vp-anim vp-belly">
          <path
            d="M 84,14 C 64,52 62,98 74,134 C 82,158 94,176 108,190 L 212,190 C 226,176 238,158 246,134 C 258,98 256,52 236,14 Z"
            fill="url(#mbSkin)"
          />
          <path
            d="M 84,14 C 64,52 62,98 74,134 C 78,146 83,158 90,168 C 80,150 76,120 78,88 C 80,58 84,34 92,16 Z"
            fill="#c98a63"
            opacity="0.32"
          />
          <path
            d="M 236,14 C 256,52 258,98 246,134 C 242,146 237,158 230,168 C 240,150 244,120 242,88 C 240,58 236,34 228,16 Z"
            fill="#c98a63"
            opacity="0.32"
          />
          <ellipse cx="140" cy="82" rx="44" ry="30" fill="#ffffff" opacity="0.13" />
          <rect x="158.5" y="96" width="3" height="12" rx="1.5" fill="#c98a63" opacity="0.8" />
          {/* crop-top hem */}
          <path d="M 84,14 C 120,30 200,30 236,14 L 241,30 C 200,47 120,47 79,30 Z" fill="url(#mbCoral)" />
          <path d="M 79,30 C 120,47 200,47 241,30" fill="none" stroke="#b23c2e" strokeWidth="2" opacity="0.5" />
          {/* waistband */}
          <path d="M 70,136 C 120,151 200,151 250,136 L 246,157 C 200,171 120,171 74,157 Z" fill="url(#mbTeal)" />
          <path d="M 70,136 C 120,151 200,151 250,136" fill="none" stroke="#4b8ba6" strokeWidth="1.6" opacity="0.7" />
          <path d="M 74,157 C 120,171 200,171 246,157 L 238,190 L 82,190 Z" fill="#16323f" />
        </g>

        {/* orbit guide */}
        <circle cx="160" cy="100" r="42" fill="none" stroke="#7FD8B0" strokeWidth="1.6" strokeDasharray="1 8" strokeLinecap="round" opacity="0.9" />
        <g className="vp-anim ef-arrow" stroke="#7FD8B0" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 154,52 L 162,58 L 154,64" />
          <path d="M 166,136 L 158,142 L 166,148" />
        </g>

        {/* hands orbiting clockwise */}
        <g className="vp-anim vp-orbit">
          <circle cx="202" cy="100" r="17" fill="#7FD8B0" opacity="0.14" />
          <circle cx="202" cy="100" r="9" fill="#7FD8B0" opacity="0.2" />
          <g className="vp-anim vp-counter">{HAND}</g>
          <circle cx="118" cy="100" r="17" fill="#7FD8B0" opacity="0.14" />
          <circle cx="118" cy="100" r="9" fill="#7FD8B0" opacity="0.2" />
          <g transform="translate(320,0) scale(-1,1)">
            <g className="vp-anim vp-forward">{HAND}</g>
          </g>
        </g>
      </svg>
    </VideoShell>
  );
}
