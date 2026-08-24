import React from "react";

type P = { className?: string; strokeWidth?: number };

const base = (p: P) => ({
  className: p.className ?? "w-5 h-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: p.strokeWidth ?? 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11.2 12 4l8 7.2" />
    <path d="M6 9.5V20h4.5v-5h3v5H18V9.5" />
  </svg>
);

export const IconDumbbell = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.5 8v8M4.5 9.5v5M16.5 8v8M19.5 9.5v5M7.5 12h9" />
    <path d="M2.5 11v2M21.5 11v2" />
  </svg>
);

export const IconHands = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21c-4.5-2.6-8-6-8-10.2C4 8 6 6 8.4 6c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18 6 20 8 20 10.8 20 15 16.5 18.4 12 21Z" />
    <path d="M9 12.5c1 .9 2 1.3 3 1.3s2-.4 3-1.3" />
  </svg>
);

export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 13.5v-7Z" />
    <path d="M8.5 9h7M8.5 12h4.5" />
  </svg>
);

export const IconDrop = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5c3.4 4.2 6 7.4 6 10.6A6 6 0 0 1 6 14.1C6 10.9 8.6 7.7 12 3.5Z" />
    <path d="M9.3 14.5a2.8 2.8 0 0 0 2 2.6" />
  </svg>
);

export const IconFlame = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21c-3.6 0-6-2.4-6-5.7 0-2.6 1.6-4.4 3-6 .9-1 1.9-2.2 2.3-3.8.1-.5.7-.7 1-.3 1.4 1.6 5.7 5.4 5.7 10.1 0 3.3-2.4 5.7-6 5.7Z" />
    <path d="M12 21c-1.6 0-2.6-1.3-2.6-2.8 0-1.6 1.3-2.6 2.6-4.2 1.3 1.6 2.6 2.6 2.6 4.2 0 1.5-1 2.8-2.6 2.8Z" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base(p)}>
    <path d="M8.5 5.5v13M15.5 5.5v13" strokeWidth={(p.strokeWidth ?? 1.8) + 1} />
  </svg>
);

export const IconSkip = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 5.5v13l8-6.5-8-6.5Z" fill="currentColor" stroke="none" />
    <path d="M17 5.5v13" strokeWidth={(p.strokeWidth ?? 1.8) + 0.6} />
  </svg>
);

export const IconRestart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 9a8 8 0 1 1-1 5" />
    <path d="M4 4v5h5" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12.5 10 17.5 19 7" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9 12 3.5Z" />
    <path d="M18.5 3.5v3M17 5h3" />
  </svg>
);

export const IconSend = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11.5 20 4l-4.5 16-4-6.5L4 11.5Z" />
    <path d="M11.5 13.5 20 4" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconArrowR = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 14A8 8 0 0 1 10 4.5 8 8 0 1 0 19.5 14Z" />
  </svg>
);

export const IconBody = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M12 7.5V14M12 9.5 8 12M12 9.5l4 2.5M12 14l-2.5 6M12 14l2.5 6" />
  </svg>
);

export const IconSound = (p: P & { muted?: boolean }) => (
  <svg {...base(p)}>
    <path d="M4 10v4h3l4.5 4V6L7 10H4Z" />
    {p.muted ? <path d="M15.5 9.5 20 14M20 9.5 15.5 14" /> : <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 7a8 8 0 0 1 0 10" />}
  </svg>
);

export const IconBroom = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 4.5 13.5 10" />
    <path d="M14.5 9 8 15.5c-1.5 1.5-3.5 2-4.5 4 2.5.5 4 .5 6-.5s3-2.5 4-4.5L14.5 9Z" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    <path d="M8 14h2.5M13.5 14H16M8 17h2.5" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3" />
  </svg>
);

export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4a5.5 5.5 0 0 1 5.5 5.5c0 4.2 1.2 5.6 2 6.5H4.5c.8-.9 2-2.3 2-6.5A5.5 5.5 0 0 1 12 4Z" />
    <path d="M10 19.5a2 2 0 0 0 4 0M12 2.5V4" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 12h13" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 7h14M9.5 7V5h5v2M7 7l.8 12.5h8.4L17 7M10.2 10.5v6M13.8 10.5v6" />
  </svg>
);

export const IconChevL = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);

export const IconChevR = (p: P) => (
  <svg {...base(p)}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5S9.4 5.9 12 3.5Z" />
  </svg>
);

export const IconInstall = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10M7.5 10 12 14.5 16.5 10" />
    <path d="M5 15.5v2A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-2" />
  </svg>
);

export const IconShuffle = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h3.2c4.6 0 5 9.5 9.6 9.5H20" />
    <path d="M4 16.5h3.2c1.7 0 2.9-1.2 3.9-2.7M20 7h-3.2c-1.7 0-2.9 1.2-3.9 2.7" />
    <path d="M17.5 4.5 20 7l-2.5 2.5M17.5 14 20 16.5 17.5 19" />
  </svg>
);

export const IconHeart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20c-4.8-3-8-6-8-9.5C4 8 5.8 6.5 8 6.5c1.6 0 3 .9 4 2.3 1-1.4 2.4-2.3 4-2.3 2.2 0 4 1.5 4 4 0 3.5-3.2 6.5-8 9.5Z" />
  </svg>
);
