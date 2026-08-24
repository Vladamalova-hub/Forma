import React, { useEffect, useRef, useState } from "react";
import { MASSAGE_STEPS, MASSAGE_TOTAL } from "../data/program";
import BodyMap from "../components/BodyMap";
import { ZoneChips } from "../components/BodyMap";
import { IconPlay, IconPause, IconCheck, IconFlame, IconSkip, IconHands, IconClock } from "../components/icons";

export default function MassagePage({
  done,
  streak,
  onDone,
}: {
  done: boolean;
  streak: number;
  onDone: () => void;
}) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(MASSAGE_STEPS[0].sec);
  const [paused, setPaused] = useState(false);
  const tRef = useRef({ stepIdx: 0, remaining: MASSAGE_STEPS[0].sec });

  useEffect(() => {
    if (!active || paused) return;
    const t = setInterval(() => {
      const cur = tRef.current;
      if (cur.remaining > 1) {
        tRef.current = { ...cur, remaining: cur.remaining - 1 };
        setRemaining(cur.remaining - 1);
        return;
      }
      const ni = cur.stepIdx + 1;
      if (ni >= MASSAGE_STEPS.length) {
        setActive(false);
        setPaused(false);
        onDone();
        return;
      }
      tRef.current = { stepIdx: ni, remaining: MASSAGE_STEPS[ni].sec };
      setStepIdx(ni);
      setRemaining(MASSAGE_STEPS[ni].sec);
    }, 1000);
    return () => clearInterval(t);
  }, [active, paused, onDone]);

  const start = () => {
    tRef.current = { stepIdx: 0, remaining: MASSAGE_STEPS[0].sec };
    setStepIdx(0);
    setRemaining(MASSAGE_STEPS[0].sec);
    setPaused(false);
    setActive(true);
  };

  const skipStep = () => {
    const ni = tRef.current.stepIdx + 1;
    if (ni >= MASSAGE_STEPS.length) {
      setActive(false);
      onDone();
      return;
    }
    tRef.current = { stepIdx: ni, remaining: MASSAGE_STEPS[ni].sec };
    setStepIdx(ni);
    setRemaining(MASSAGE_STEPS[ni].sec);
  };

  const step = MASSAGE_STEPS[stepIdx];
  const doneSec = MASSAGE_STEPS.slice(0, stepIdx).reduce((s, x) => s + x.sec, 0) + (active ? step.sec - remaining : 0);
  const totalPct = Math.min(100, Math.round((doneSec / MASSAGE_TOTAL) * 100));

  return (
    <div className="space-y-5">
      <div className="reveal on flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Массаж живота</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
            Каждый день, ~6 минут, лучше утром натощак. Разгоняет лимфу, снимает вздутие, подтягивает кожу и помогает талии становиться уже.
          </p>
          <ZoneChips zones={["belly", "waist"]} className="mt-3" />
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-mint/25 bg-mint/10 px-4 py-3">
          <span className="flicker text-mint">
            <IconFlame className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <div className="font-display text-xl font-extrabold leading-none text-mint">{streak}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">серия дней</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        {/* body map */}
        <section className="reveal on relative flex flex-col items-center rounded-3xl border border-white/10 bg-night-800/80 p-6">
          <div className="h-80">
            <BodyMap
              view="front"
              zones={["belly"]}
              overlay={
                <g className="spin-slow">
                  <circle cx="60" cy="127" r="22" fill="none" stroke="#7FD8B0" strokeWidth="1.4" strokeDasharray="4 6" opacity="0.9" />
                  <path d="M54 103 L66 105 L57 112 Z" fill="#7FD8B0" />
                </g>
              }
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-fog">
            <IconHands className="h-4 w-4 text-mint" /> Все движения — строго по часовой стрелке
          </div>
        </section>

        {/* guide / steps */}
        <section className="reveal on flex flex-col rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.08s" }}>
          {active ? (
            <div className="rise-in flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-mint">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-2 w-2 rounded-full bg-mint breathe" />
                  </span>
                  Гид идёт · шаг {stepIdx + 1}/{MASSAGE_STEPS.length}
                </span>
                <span className="text-xs text-fog">{Math.round(MASSAGE_TOTAL / 60)} мин всего</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-mint transition-all duration-1000" style={{ width: `${totalPct}%` }} />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <div className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-mint">{step.dir}</div>
                <div key={step.name} className="rise-in mt-2 font-display text-2xl font-extrabold sm:text-3xl">{step.name}</div>
                <div key={remaining} className="count-pulse mt-4 font-display text-7xl font-extrabold tabular-nums text-mint">
                  {remaining}
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-fog">{step.text}</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActive(false);
                    setPaused(false);
                  }}
                  className="btn-press rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-fog hover:text-ink"
                >
                  Стоп
                </button>
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="btn-press flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-night-950"
                  style={{ boxShadow: "0 8px 28px rgba(127,216,176,0.35)" }}
                >
                  {paused ? <IconPlay className="h-4.5 w-4.5" /> : <IconPause className="h-4.5 w-4.5" />}
                  {paused ? "Дальше" : "Пауза"}
                </button>
                <button
                  onClick={skipStep}
                  className="btn-press rounded-full border border-white/12 bg-white/5 p-3.5 text-fog hover:text-ink"
                  aria-label="Следующий шаг"
                >
                  <IconSkip className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold">Гид по шагам</h2>
                <button
                  onClick={start}
                  className="btn-press flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950"
                  style={{ boxShadow: "0 6px 24px rgba(127,216,176,0.35)" }}
                >
                  <IconPlay className="h-4 w-4" /> {done ? "Ещё раз" : "Запустить"}
                </button>
              </div>

              {done && (
                <div className="pop-in mt-3 flex items-center gap-2.5 rounded-2xl border border-mint/25 bg-mint/10 px-4 py-3">
                  <IconCheck className="h-5 w-5 text-mint" strokeWidth={2.4} />
                  <span className="text-sm font-semibold text-mint">Сегодня выполнено — серия {streak} дн. Так держать!</span>
                </div>
              )}

              <ol className="mt-4 space-y-2.5">
                {MASSAGE_STEPS.map((s, i) => (
                  <li key={s.name} className="flex gap-3.5 rounded-2xl border border-white/8 bg-white/3 p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint/15 font-display text-xs font-extrabold text-mint">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{s.name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold text-fog">
                          <IconClock className="h-3 w-3" /> {s.sec} сек
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-mint/80">{s.dir}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-fog">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-2xl border border-coral/20 bg-coral/8 px-4 py-3">
                <p className="text-xs leading-relaxed text-fog">
                  <span className="font-bold text-coral">Противопоказания:</span> беременность, менструация, обострения ЖКТ, послеоперационный период. При сомнениях — сначала к врачу.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
