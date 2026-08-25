import React, { useMemo, useState } from "react";
import {
  DAY_SHORT,
  DAY_FULL,
  ZONE_META,
  workoutForDay,
  toKey,
  type DaySlot,
  type Logs,
  type WorkoutDay,
} from "../data/program";
import BodyMap from "../components/BodyMap";
import { ZoneChips } from "../components/BodyMap";
import { IconChevL, IconChevR, IconPlay, IconCheck, IconHands, IconDumbbell, IconFlame } from "../components/icons";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export default function CalendarPage({
  schedule,
  logs,
  streak,
  onToggle,
  onStart,
}: {
  schedule: DaySlot[];
  logs: Logs;
  streak: number;
  onToggle: (dateKey: string, kind: "workout" | "massage") => void;
  onStart: (d: WorkoutDay) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(toKey(today));

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const arr: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= days; d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [month]);

  const monthStats = useMemo(() => {
    let w = 0;
    let m = 0;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const log = logs[toKey(new Date(month.getFullYear(), month.getMonth(), d))];
      if (log?.workoutId) w += 1;
      if (log?.massage) m += 1;
    }
    return { w, m };
  }, [logs, month]);

  const selDate = new Date(`${selected}T12:00:00`);
  const selDow = (selDate.getDay() + 6) % 7;
  const selWorkout = workoutForDay(schedule, selDow);
  const selLog = logs[selected];
  const isToday = selected === toKey(today);
  const isFuture = selected > toKey(today);

  return (
    <div className="space-y-5">
      <div className="reveal on flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-center">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Календарь</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
            Дни тренировок настраиваются в «Программе». Здесь отмечай выполненное — тренировки и массаж — и следи за дисциплиной.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-mint/25 bg-mint/10 px-4 py-3">
          <span className="flicker text-mint">
            <IconFlame className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <div className="font-display text-xl font-extrabold leading-none text-mint">{streak}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">серия массажа</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* month grid */}
        <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="btn-press rounded-full border border-white/12 bg-white/5 p-2.5 text-fog hover:text-ink"
              aria-label="Предыдущий месяц"
            >
              <IconChevL className="h-4 w-4" />
            </button>
            <div className="text-center">
              <div className="font-display text-lg font-extrabold">{MONTHS[month.getMonth()]}</div>
              <div className="text-xs text-fog">{month.getFullYear()}</div>
            </div>
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="btn-press rounded-full border border-white/12 bg-white/5 p-2.5 text-fog hover:text-ink"
              aria-label="Следующий месяц"
            >
              <IconChevR className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {DAY_SHORT.map((d) => (
              <div key={d} className="pb-1 text-[10px] font-bold uppercase tracking-wider text-fog">
                {d}
              </div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const key = toKey(d);
              const dow = (d.getDay() + 6) % 7;
              const w = workoutForDay(schedule, dow);
              const log = logs[key];
              const todayRing = key === toKey(today);
              const isSel = key === selected;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`btn-press relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm transition-colors ${
                    isSel
                      ? "border-coral/70 bg-coral/15"
                      : todayRing
                        ? "border-coral/40 bg-white/4"
                        : "border-white/8 bg-white/3 hover:bg-white/6"
                  }`}
                >
                  <span className={`font-display text-xs font-bold ${todayRing ? "text-coral" : "text-ink"}`}>
                    {d.getDate()}
                  </span>
                  <span className="mt-1 flex items-center gap-1">
                    {w && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: ZONE_META[w.zones[0]].color, boxShadow: `0 0 6px ${ZONE_META[w.zones[0]].color}` }}
                      />
                    )}
                    {log?.workoutId && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-coral text-night-950">
                        <IconCheck className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                    {log?.massage && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-4 text-[11px] text-fog">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-coral shadow-[0_0_6px_#FF6D5A]" /> тренировка по плану
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-coral text-night-950">
                <IconCheck className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              тренировка выполнена
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-mint" /> массаж сделан
            </span>
          </div>
        </section>

        {/* day panel */}
        <section className="reveal on flex flex-col gap-4" style={{ animationDelay: "0.08s" }}>
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-fog">
              {DAY_FULL[selDow]} · {selDate.getDate()} {MONTHS[selDate.getMonth()].toLowerCase()}
            </div>

            {selWorkout ? (
              <div className="mt-3 rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-display text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: ZONE_META[selWorkout.zones[0]].color }}
                  >
                    Тренировка дня
                  </span>
                  <ZoneChips zones={selWorkout.zones} />
                </div>
                <div className="mt-1.5 font-display text-lg font-extrabold">{selWorkout.title}</div>
                <p className="mt-1 text-xs text-fog">{selWorkout.exercises.length} упражнений · ~15 мин</p>
                {isToday && !selLog?.workoutId && (
                  <button
                    onClick={() => onStart(selWorkout)}
                    className="btn-press mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950"
                    style={{ boxShadow: "0 6px 22px rgba(255,109,90,0.35)" }}
                  >
                    <IconPlay className="h-4 w-4" /> Начать сейчас
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <IconDumbbell className="h-4 w-4 text-fog" /> День восстановления
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-fog">
                  Массаж живота, прогулка 30+ минут, растяжка и вода. Мышцы растут и подтягиваются именно в дни отдыха.
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => onToggle(selected, "workout")}
                disabled={isFuture}
                className={`btn-press flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors disabled:opacity-35 ${
                  selLog?.workoutId
                    ? "border-coral/50 bg-coral/15 text-coral"
                    : "border-white/10 bg-white/3 hover:bg-white/6"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <IconDumbbell className="h-4.5 w-4.5" /> Тренировка выполнена
                </span>
                {selLog?.workoutId && <IconCheck className="h-4.5 w-4.5" strokeWidth={2.4} />}
              </button>
              <button
                onClick={() => onToggle(selected, "massage")}
                disabled={isFuture}
                className={`btn-press flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors disabled:opacity-35 ${
                  selLog?.massage
                    ? "border-mint/50 bg-mint/15 text-mint"
                    : "border-white/10 bg-white/3 hover:bg-white/6"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <IconHands className="h-4.5 w-4.5" /> Массаж живота сделан
                </span>
                {selLog?.massage && <IconCheck className="h-4.5 w-4.5" strokeWidth={2.4} />}
              </button>
              {isFuture && <p className="text-center text-[11px] text-fog/70">Отмечать можно только прошедшие дни</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-fog">Итог месяца</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-coral/10 p-4">
                <div className="font-display text-3xl font-extrabold text-coral">{monthStats.w}</div>
                <div className="mt-1 text-xs text-fog">тренировок</div>
              </div>
              <div className="rounded-2xl bg-mint/10 p-4">
                <div className="font-display text-3xl font-extrabold text-mint">{monthStats.m}</div>
                <div className="mt-1 text-xs text-fog">массажей</div>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <BodyMap view="front" zones={["belly", "waist"]} className="h-24 opacity-70" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
