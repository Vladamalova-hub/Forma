import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { WorkoutDay, Exercise } from "../data/program";
import { ZONE_META } from "../data/program";
import TechniqueVideo from "./TechniqueVideo";
import BodyMap, { ZoneChips } from "./BodyMap";
import { IconPause, IconPlay, IconSkip, IconSound, IconX, IconArrowR, IconClock, IconCheck } from "./icons";

type Phase =
  | { kind: "ready"; sec: number }
  | { kind: "work"; sec: number; ex: Exercise; set: number }
  | { kind: "rest"; sec: number; next: { ex: Exercise; set: number } | null };

function buildPhases(day: WorkoutDay): Phase[] {
  const phases: Phase[] = [{ kind: "ready", sec: 5 }];
  const queue: { ex: Exercise; set: number }[] = [];
  day.exercises.forEach((ex) => {
    for (let s = 1; s <= ex.sets; s++) queue.push({ ex, set: s });
  });
  queue.forEach((q, i) => {
    phases.push({ kind: "work", sec: q.ex.work, ex: q.ex, set: q.set });
    if (i < queue.length - 1) {
      phases.push({ kind: "rest", sec: q.ex.rest, next: queue[i + 1] });
    }
  });
  return phases;
}

function beep(freq: number, soundOn: boolean) {
  if (!soundOn) return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.26);
    setTimeout(() => ctx.close(), 400);
  } catch {
    /* no audio */
  }
}

const RING_R = 92;
const RING_C = 2 * Math.PI * RING_R;

export default function WorkoutPlayer({
  day,
  onClose,
  onComplete,
  onAskAI,
  onProfile,
}: {
  day: WorkoutDay;
  onClose: () => void;
  onComplete: () => void;
  onAskAI: () => void;
  onProfile?: () => void;
}) {
  const phases = useMemo(() => buildPhases(day), [day]);
  const totalSec = useMemo(() => phases.reduce((s, p) => s + p.sec, 0), [phases]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(phases[0].sec);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);
  const timersRef = useRef({ idx: 0, remaining: phases[0].sec });

  const phase = phases[Math.min(idx, phases.length - 1)];

  useEffect(() => {
    if (paused || finished) return;
    const t = setInterval(() => {
      const cur = timersRef.current;
      setElapsed((e) => e + 1);
      if (cur.remaining > 1) {
        timersRef.current = { idx: cur.idx, remaining: cur.remaining - 1 };
        setRemaining(cur.remaining - 1);
        return;
      }
      const ni = cur.idx + 1;
      if (ni >= phases.length) {
        setFinished(true);
        return;
      }
      const np = phases[ni];
      beep(np.kind === "work" ? 880 : 540, sound);
      timersRef.current = { idx: ni, remaining: np.sec };
      setIdx(ni);
      setRemaining(np.sec);
    }, 1000);
    return () => clearInterval(t);
  }, [paused, finished, phases, sound]);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      onComplete();
      beep(1040, sound);
      setTimeout(() => beep(1320, sound), 180);
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.55 }, colors: ["#FF6D5A", "#FFB084", "#7FD8B0", "#6FC6E8", "#C7A6F0"] });
    }
  }, [finished, onComplete, sound]);

  const skip = () => {
    const ni = timersRef.current.idx + 1;
    if (ni >= phases.length) {
      setFinished(true);
      return;
    }
    timersRef.current = { idx: ni, remaining: phases[ni].sec };
    setIdx(ni);
    setRemaining(phases[ni].sec);
  };

  const restart = () => {
    timersRef.current = { idx: 0, remaining: phases[0].sec };
    setIdx(0);
    setRemaining(phases[0].sec);
    setElapsed(0);
    setFinished(false);
    completedRef.current = false;
  };

  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const ringColor = phase.kind === "rest" ? "#7FD8B0" : phase.kind === "ready" ? "#6FC6E8" : "#FF6D5A";
  const progress = 1 - remaining / phase.sec;

  const currentEx: Exercise | null =
    phase.kind === "work" ? phase.ex : phase.kind === "rest" ? phase.next?.ex ?? null : day.exercises[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto nice-scroll bg-night-950">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-coral/10 blur-3xl bg-drift-1" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-mint/10 blur-3xl bg-drift-2" />
      </div>

      {!finished ? (
        <div className="relative mx-auto flex min-h-full max-w-5xl flex-col px-4 pb-10 pt-5 sm:px-6">
          {/* header */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-coral">{day.weekday}</div>
              <h2 className="truncate font-display text-lg font-bold sm:text-xl">{day.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-fog sm:inline-flex">
                <IconClock className="h-3.5 w-3.5" /> ~{mm(totalSec)}
              </span>
              <button
                onClick={() => setSound((s) => !s)}
                className="btn-press rounded-full border border-white/10 bg-white/5 p-2.5 text-fog hover:text-ink"
                aria-label="Звук"
              >
                <IconSound className="h-4.5 w-4.5" muted={!sound} />
              </button>
              <button
                onClick={onClose}
                className="btn-press rounded-full border border-white/10 bg-white/5 p-2.5 text-fog hover:text-ink"
                aria-label="Закрыть"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* phase segments */}
          <div className="mt-4 flex gap-1">
            {phases.slice(1).map((p, i) => {
              const real = i + 1;
              const stateCls =
                real < idx ? "bg-coral/70" : real === idx ? (p.kind === "rest" ? "bg-mint" : "bg-coral animate-pulse") : "bg-white/10";
              return <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${stateCls}`} />;
            })}
          </div>

          {/* main */}
          <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
            {/* demo panel */}
            <div className="rise-in flex flex-col gap-4">
              <div className="min-w-0">
                <ZoneChips zones={currentEx?.zones ?? []} className="mb-2.5" />
                <TechniqueVideo
                  figure={currentEx?.figure ?? "squat"}
                  glows={currentEx?.zones ?? ["glutes"]}
                  name={currentEx?.name}
                />
                {currentEx && (
                  <div className="mt-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-peach">Главное</div>
                    <p className="mt-1 text-sm font-medium leading-snug">{currentEx.cue}</p>
                  </div>
                )}
              </div>

              {/* body map */}
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-night-800/60 p-4 sm:flex-row sm:gap-5">
                <div className="h-40 shrink-0 sm:h-44">
                  <BodyMap view="both" zones={currentEx?.zones ?? []} />
                </div>
                <div className="min-w-0 sm:text-left">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-fog">Зоны в работе</div>
                  <div className="mt-3 space-y-2">
                    {Array.from(new Set(currentEx?.zones ?? [])).map((z) => (
                      <div key={z} className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: ZONE_META[z].color, boxShadow: `0 0 10px ${ZONE_META[z].color}` }} />
                        <span className="text-sm font-semibold">{ZONE_META[z].label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-fog">Пульсирующие зоны на силуэте показывают, какие мышцы прорабатывает это упражнение.</p>
                </div>
              </div>
            </div>

            {/* timer panel */}
            <div className="rise-in flex flex-col rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.08s" }}>
              <div className="flex items-baseline justify-between">
                <span
                  className="font-display text-[11px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: ringColor }}
                >
                  {phase.kind === "work" ? "Работа" : phase.kind === "rest" ? "Отдых" : "Приготовься"}
                </span>
                <span className="text-xs text-fog">
                  {currentEx
                    ? `упражнение ${day.exercises.indexOf(currentEx) + 1} из ${day.exercises.length}`
                    : "дыхание, вода"}
                </span>
              </div>

              <div className="relative mx-auto mt-5 h-60 w-60">
                <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
                  <circle cx="110" cy="110" r={RING_R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                  <circle
                    cx="110"
                    cy="110"
                    r={RING_R}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - progress)}
                    style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 10px ${ringColor}66)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div key={remaining} className="count-pulse font-display text-6xl font-extrabold tabular-nums">
                    {remaining}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-fog">секунд</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                {phase.kind === "rest" ? (
                  <>
                    <div className="font-display text-lg font-bold">
                      {phase.next ? phase.next.ex.name : "Финал"}
                    </div>
                    <div className="mt-1 text-sm text-fog">
                      {phase.next ? `подход ${phase.next.set} из ${phase.next.ex.sets}` : "вот-вот финиш"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-lg font-bold">
                      {phase.kind === "work" ? phase.ex.name : day.exercises[0].name}
                    </div>
                    <div className="mt-1 text-sm text-fog">
                      {phase.kind === "work" ? `подход ${phase.set} из ${phase.ex.sets}` : "встань удобно, через 5 секунд старт"}
                    </div>
                  </>
                )}
              </div>

              {/* controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={restart}
                  className="btn-press rounded-full border border-white/10 bg-white/5 p-3.5 text-fog hover:text-ink"
                  aria-label="Сначала"
                >
                  <IconSkip className="h-5 w-5 rotate-180" />
                </button>
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="btn-press flex items-center gap-2.5 rounded-full px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-night-950"
                  style={{ background: ringColor, boxShadow: `0 8px 30px ${ringColor}55` }}
                >
                  {paused ? <IconPlay className="h-5 w-5" /> : <IconPause className="h-5 w-5" />}
                  {paused ? "Дальше" : "Пауза"}
                </button>
                <button
                  onClick={skip}
                  className="btn-press rounded-full border border-white/10 bg-white/5 p-3.5 text-fog hover:text-ink"
                  aria-label="Пропустить"
                >
                  <IconSkip className="h-5 w-5" />
                </button>
              </div>

              {/* tips */}
              {currentEx && (
                <div className="mt-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-fog">Техника</div>
                  <ol className="mt-2.5 space-y-2">
                    {currentEx.tips.map((t, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-snug text-ink/90">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 font-display text-[10px] font-bold text-peach">
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ---------- finished ---------- */
        <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
          <div className="pop-in flex h-24 w-24 items-center justify-center rounded-full bg-mint/15 text-mint">
            <IconCheck className="h-12 w-12" strokeWidth={2.4} />
          </div>
          <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
            <span className="shimmer-text">Готово! Ты — сила</span>
          </h2>
          <p className="mt-3 max-w-md text-fog">
            «{day.title}» записана в твой план. Не забудь массаж живота сегодня — он закрепит результат.
          </p>
          <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">
            {[
              { v: mm(elapsed), l: "время" },
              { v: String(day.exercises.length), l: "упражнений" },
              { v: `~${Math.max(20, Math.round((elapsed / 60) * 5.2))}`, l: "ккал" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-night-800/80 px-3 py-4">
                <div className="font-display text-xl font-extrabold text-peach">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-fog">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="btn-press flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-night-950"
              style={{ boxShadow: "0 8px 30px rgba(255,109,90,0.35)" }}
            >
              На главную <IconArrowR className="h-4 w-4" />
            </button>
            {onProfile && (
              <button
                onClick={onProfile}
                className="btn-press rounded-full border border-lilac/40 bg-lilac/10 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-lilac hover:bg-lilac/20"
              >
                Записать замер
              </button>
            )}
            <button
              onClick={onAskAI}
              className="btn-press rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-ink hover:bg-white/10"
            >
              Спросить AI-тренера
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
