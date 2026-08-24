import React, { useState } from "react";
import {
  WEEK_PLAN,
  ZONE_META,
  DAY_SHORT,
  DAY_FULL,
  workoutForDay,
  type WorkoutDay,
  type Exercise,
  type DaySlot,
} from "../data/program";
import RealisticFigure from "../components/RealisticFigure";
import { ZoneChips } from "../components/BodyMap";
import { IconPlay, IconCheck, IconClock, IconArrowR, IconBell } from "../components/icons";

function DayCard({
  day,
  done,
  onStart,
  delay,
}: {
  day: WorkoutDay;
  done: boolean;
  onStart: () => void;
  delay: number;
}) {
  const [open, setOpen] = useState<string | null>(day.exercises[0]?.id ?? null);
  const accent = ZONE_META[day.zones[0]].color;

  return (
    <section
      className="reveal on overflow-hidden rounded-3xl border border-white/10 bg-night-800/80"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="grid lg:grid-cols-[230px_1fr]">
        <div
          className="relative flex flex-row items-center justify-between gap-3 border-b border-white/10 p-5 lg:flex-col lg:items-start lg:border-b-0 lg:border-r"
          style={{ background: `linear-gradient(135deg, ${accent}1f, transparent 65%)` }}
        >
          <div>
            <div className="font-display text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              {day.weekday}
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold leading-tight">{day.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-fog">{day.tagline}</p>
            {done && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1.5 text-[11px] font-bold text-mint">
                <IconCheck className="h-3.5 w-3.5" strokeWidth={2.4} /> сделано на этой неделе
              </span>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3 lg:items-start">
            <span className="flex items-center gap-1.5 text-xs text-fog">
              <IconClock className="h-4 w-4" /> ~15 мин
            </span>
            <button
              onClick={onStart}
              className="btn-press flex items-center gap-2 rounded-full px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950"
              style={{ background: accent, boxShadow: `0 6px 24px ${accent}4d` }}
            >
              <IconPlay className="h-4 w-4" /> Старт
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <ZoneChips zones={day.zones} className="px-2 pb-3 pt-1" />
          <ul>
            {day.exercises.map((ex, i) => (
              <li key={ex.id}>
                <button
                  onClick={() => setOpen(open === ex.id ? null : ex.id)}
                  className="btn-press flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/4"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-extrabold"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{ex.name}</span>
                    <span className="mt-0.5 block text-xs text-fog">{ex.reps}</span>
                  </span>
                  <span className="hidden gap-1.5 sm:flex">
                    {ex.zones.map((z) => (
                      <span key={z} className="h-2.5 w-2.5 rounded-full" style={{ background: ZONE_META[z].color }} title={ZONE_META[z].label} />
                    ))}
                  </span>
                  <IconArrowR
                    className={`h-4 w-4 shrink-0 text-fog transition-transform duration-300 ${open === ex.id ? "rotate-90" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: open === ex.id ? "1fr" : "0fr", opacity: open === ex.id ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <ExerciseDetail ex={ex} accent={accent} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ExerciseDetail({ ex, accent }: { ex: Exercise; accent: string }) {
  return (
    <div className="mx-3 mb-3 grid gap-4 rounded-2xl border border-white/8 bg-white/3 p-4 sm:grid-cols-[240px_1fr]">
      <RealisticFigure figure={ex.figure} glows={ex.zones} className="aspect-[4/3] w-full sm:aspect-auto sm:h-44" />
      <div>
        <div className="rounded-xl border border-peach/20 bg-peach/8 px-3.5 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-peach">Главное</span>
          <p className="mt-0.5 text-sm font-medium leading-snug">{ex.cue}</p>
        </div>
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {ex.tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink/85">
              <span className="mt-0.5 font-display text-[10px] font-bold" style={{ color: accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-2.5 text-[11px] text-fog/80">3D-модель можно вращать пальцем — посмотри на технику со всех сторон.</p>
      </div>
    </div>
  );
}

export default function ProgramPage({
  weekLog,
  onStart,
  schedule,
  onSchedule,
  morning,
  onMorning,
}: {
  weekLog: string[];
  onStart: (d: WorkoutDay) => void;
  schedule: DaySlot[];
  onSchedule: (s: DaySlot[]) => void;
  morning: { enabled: boolean; time: string };
  onMorning: (m: { enabled: boolean; time: string }) => void;
}) {
  const toggleDay = (i: number) => {
    const next = schedule.map((s, k) => (k === i ? { ...s, enabled: !s.enabled } : s));
    onSchedule(next);
  };
  const setTime = (i: number, time: string) => {
    onSchedule(schedule.map((s, k) => (k === i ? { ...s, time } : s)));
  };
  const pickedCount = schedule.filter((s) => s.enabled).length;

  return (
    <div className="space-y-5">
      <div className="reveal on flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Программа недели</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
            Выбери свои дни — программа распределит акценты (ягодицы → грудь → талия) и поставит на каждый будильник.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-night-800/80 px-4 py-3">
          <span className="font-display text-xl font-extrabold text-coral">{weekLog.length}</span>
          <span className="text-xs leading-tight text-fog">из {Math.max(pickedCount, 1)}<br />на этой неделе</span>
        </div>
      </div>

      {/* day picker + alarms */}
      <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <IconBell className="h-5 w-5 text-coral" /> Мои дни тренировок
          </h2>
          <span className="text-xs text-fog">выбрано: {pickedCount} · на каждый день — свой будильник</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {DAY_SHORT.map((d, i) => {
            const slot = schedule[i];
            const w = workoutForDay(schedule, i);
            const accent = w ? ZONE_META[w.zones[0]].color : "#B3A4BD";
            return (
              <div
                key={d}
                className={`rounded-2xl border p-3 transition-colors ${
                  slot.enabled ? "border-coral/40 bg-coral/8" : "border-white/8 bg-white/3"
                }`}
              >
                <button onClick={() => toggleDay(i)} className="btn-press flex w-full items-center justify-between">
                  <span className={`font-display text-sm font-extrabold ${slot.enabled ? "text-ink" : "text-fog"}`}>{d}</span>
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${slot.enabled ? "bg-coral" : "bg-white/12"}`}
                    aria-label={`${DAY_FULL[i]}: ${slot.enabled ? "включён" : "выключен"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-night-950 transition-all ${slot.enabled ? "left-[18px]" : "left-0.5"}`}
                    />
                  </span>
                </button>
                {slot.enabled && w && (
                  <div className="mt-2 space-y-2">
                    <div className="text-[10px] font-semibold leading-tight" style={{ color: accent }}>
                      {w.title}
                    </div>
                    <label className="flex items-center gap-1.5 rounded-lg bg-night-900/60 px-2 py-1.5">
                      <IconBell className="h-3.5 w-3.5 text-fog" />
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => setTime(i, e.target.value)}
                        className="w-full bg-transparent font-display text-xs font-bold outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-mint/20 bg-mint/8 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-mint">
            <IconBell className="h-4 w-4" /> Утренняя зарядка + вакуум
          </span>
          <button
            onClick={() => onMorning({ ...morning, enabled: !morning.enabled })}
            className={`btn-press relative h-5 w-9 rounded-full transition-colors ${morning.enabled ? "bg-mint" : "bg-white/12"}`}
            aria-label="Будильник зарядки"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-night-950 transition-all ${morning.enabled ? "left-[18px]" : "left-0.5"}`}
            />
          </button>
          <input
            type="time"
            value={morning.time}
            onChange={(e) => onMorning({ ...morning, time: e.target.value })}
            className="rounded-lg bg-night-900/60 px-2.5 py-1.5 font-display text-xs font-bold outline-none"
          />
          <span className="text-xs text-fog">5–7 минут: суставная разминка + вакуум натощак</span>
        </div>
      </section>

      <div className="space-y-5">
        {WEEK_PLAN.map((d, i) => (
          <DayCard key={d.id} day={d} done={weekLog.includes(d.id)} onStart={() => onStart(d)} delay={i * 0.08} />
        ))}
      </div>

      <div className="reveal on rounded-3xl border border-white/10 bg-night-800/60 p-5">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-fog">Дни восстановления</span>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">
          Без железа, но не без пользы: массаж живота по гиду, прогулка 30+ минут, растяжка 10 минут и вода. Именно в эти дни тело «дозревает» — ягодицы округляются, а талия уходит.
        </p>
      </div>
    </div>
  );
}
