import React from "react";
import { WEEK_PLAN, SKIN_TIPS, WATER_GOAL, dayOfYear, ZONE_META } from "../data/program";
import type { WorkoutDay } from "../data/program";
import BodyMap from "../components/BodyMap";
import { ZoneChips } from "../components/BodyMap";
import {
  IconDrop,
  IconFlame,
  IconPlay,
  IconSparkle,
  IconHands,
  IconCheck,
  IconClock,
  IconArrowR,
  IconMoon,
} from "../components/icons";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

const WEEK_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const TRAINING_BY_IDX: Record<number, WorkoutDay> = { 0: WEEK_PLAN[0], 2: WEEK_PLAN[1], 4: WEEK_PLAN[2] };

export default function HomePage({
  water,
  setWater,
  massageDone,
  massageStreak,
  weekLog,
  onStart,
  gotoMassage,
  gotoProgram,
}: {
  water: number;
  setWater: (n: number) => void;
  massageDone: boolean;
  massageStreak: number;
  weekLog: string[];
  onStart: (d: WorkoutDay) => void;
  gotoMassage: () => void;
  gotoProgram: () => void;
}) {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const todayWorkout = TRAINING_BY_IDX[todayIdx] ?? null;
  const dateStr = today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  const tip = SKIN_TIPS[dayOfYear(today) % SKIN_TIPS.length];
  const waterPct = Math.round((water / WATER_GOAL) * 100);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="reveal on flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-fog first-letter:uppercase">{dateStr}</div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold leading-tight sm:text-4xl">
            {greeting()}, <span className="text-coral">красотка</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-fog">
            Твой план: 3 тренировки в неделю, массаж живота каждый день, 8 стаканов воды. Всё по полочкам — просто следуй.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-coral/25 bg-coral/10 px-4 py-3">
          <span className="flicker text-coral">
            <IconFlame className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <div className="font-display text-xl font-extrabold leading-none text-peach">{massageStreak}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">дней массажа подряд</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* today plan */}
        <section className="reveal on relative overflow-hidden rounded-3xl border border-white/10 bg-night-800/80 p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-coral/10 blur-3xl" />
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-coral">
              Сегодня в плане
            </span>
            <span className="hidden items-center gap-1.5 text-xs text-fog sm:flex">
              <IconClock className="h-4 w-4" /> ~15 мин
            </span>
          </div>

          {todayWorkout ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{todayWorkout.title}</h2>
                <p className="mt-1.5 text-sm text-fog">{todayWorkout.tagline}</p>
                <ZoneChips zones={todayWorkout.zones} className="mt-4" />
                <ul className="mt-5 space-y-2">
                  {todayWorkout.exercises.map((ex, i) => (
                    <li key={ex.id} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/8 font-display text-[10px] font-bold text-peach">
                        {i + 1}
                      </span>
                      <span className="font-medium">{ex.name}</span>
                      <span className="ml-auto hidden text-xs text-fog md:inline">{ex.reps}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => onStart(todayWorkout)}
                    className="btn-press flex items-center gap-2.5 rounded-full bg-coral px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-night-950"
                    style={{ boxShadow: "0 8px 30px rgba(255,109,90,0.4)" }}
                  >
                    <IconPlay className="h-4.5 w-4.5" /> Начать
                  </button>
                  <button
                    onClick={gotoProgram}
                    className="btn-press flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-ink hover:bg-white/10"
                  >
                    Вся неделя <IconArrowR className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="hidden h-64 self-center sm:block">
                <BodyMap view="both" zones={todayWorkout.zones} />
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">День восстановления</h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-fog">
                  Мышцы растут в покое. Сегодня — лёгкая прогулка 30 минут, растяжка, массаж живота и вода. А если очень хочется подвигаться — любая тренировка из плана всегда под рукой.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  <li className="flex items-center gap-3">
                    <IconMoon className="h-4.5 w-4.5 text-lilac" /> Сон 7–8 часов — главный жиросжигатель
                  </li>
                  <li className="flex items-center gap-3">
                    <IconHands className="h-4.5 w-4.5 text-mint" /> Массаж живота — 6 минут, гид во вкладке
                  </li>
                  <li className="flex items-center gap-3">
                    <IconDrop className="h-4.5 w-4.5 text-aqua" /> 8 стаканов воды в течение дня
                  </li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={gotoMassage}
                    className="btn-press flex items-center gap-2.5 rounded-full bg-mint px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-night-950"
                    style={{ boxShadow: "0 8px 30px rgba(127,216,176,0.35)" }}
                  >
                    <IconHands className="h-4.5 w-4.5" /> Массаж
                  </button>
                  <button
                    onClick={gotoProgram}
                    className="btn-press flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-ink hover:bg-white/10"
                  >
                    Открыть план <IconArrowR className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="hidden h-64 self-center sm:block">
                <BodyMap view="both" zones={["belly"]} />
              </div>
            </div>
          )}
        </section>

        {/* right column */}
        <div className="space-y-5">
          {/* water */}
          <section
            className="reveal on rounded-3xl border p-5"
            style={{
              borderColor: water >= WATER_GOAL ? "rgba(111,198,232,0.4)" : "rgba(255,255,255,0.1)",
              background: water >= WATER_GOAL ? "rgba(111,198,232,0.08)" : "rgba(31,23,34,0.8)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
                <IconDrop className="h-5 w-5 text-aqua" strokeWidth={2} /> Вода
              </span>
              <span className="font-display text-sm font-extrabold text-aqua">{water}/{WATER_GOAL}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%`, background: "linear-gradient(90deg,#6FC6E8,#7FD8B0)" }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWater(i < water ? i : i + 1)}
                  className="btn-press"
                  aria-label={`Стакан ${i + 1}`}
                >
                  <IconDrop
                    className={`h-7 w-7 transition-all duration-300 ${i < water ? "text-aqua drop-shadow-[0_0_8px_rgba(111,198,232,0.7)]" : "text-white/15 hover:text-white/35"}`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs leading-relaxed text-fog">
                {water >= WATER_GOAL ? "Цель достигнута — кожа скажет спасибо!" : "Стакан = 250 мл. Кожа и лимфа любят воду."}
              </p>
              <button
                onClick={() => setWater(Math.min(WATER_GOAL, water + 1))}
                className="btn-press shrink-0 rounded-full bg-aqua/15 px-4 py-2 text-xs font-bold text-aqua hover:bg-aqua/25"
              >
                + стакан
              </button>
            </div>
          </section>

          {/* massage */}
          <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em]">
                <IconHands className="h-5 w-5 text-mint" strokeWidth={2} /> Массаж живота
              </span>
              {massageDone && (
                <span className="pop-in flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-bold text-mint">
                  <IconCheck className="h-3.5 w-3.5" strokeWidth={2.4} /> сегодня готово
                </span>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-fog">
              6 минут по часовой стрелке: лимфодренаж, тонус кожи и спокойный живот. Лучше утром натощак.
            </p>
            <button
              onClick={gotoMassage}
              className={`btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 font-display text-xs font-bold uppercase tracking-wider ${
                massageDone ? "border border-white/15 bg-white/5 text-ink hover:bg-white/10" : "bg-mint text-night-950"
              }`}
              style={massageDone ? {} : { boxShadow: "0 6px 24px rgba(127,216,176,0.3)" }}
            >
              {massageDone ? "Повторить гид" : "Запустить гид"} <IconArrowR className="h-4 w-4" />
            </button>
          </section>

          {/* skin tip */}
          <section className="reveal on relative overflow-hidden rounded-3xl border border-peach/20 bg-peach/8 p-5">
            <IconSparkle className="absolute -right-3 -top-3 h-20 w-20 text-peach/15" strokeWidth={1.2} />
            <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-peach">
              <IconSparkle className="h-5 w-5" strokeWidth={2} /> Сияние дня
            </span>
            <p className="mt-3 text-sm font-medium leading-relaxed">{tip}</p>
          </section>
        </div>
      </div>

      {/* week strip */}
      <section className="reveal on rounded-3xl border border-white/10 bg-night-800/60 p-4">
        <div className="flex items-center justify-between px-1">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-fog">Ритм недели</span>
          <span className="text-xs text-fog">
            {weekLog.length}/3 тренировок
          </span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {WEEK_LABELS.map((d, i) => {
            const tr = TRAINING_BY_IDX[i];
            const done = tr ? weekLog.includes(tr.id) : false;
            const isToday = i === todayIdx;
            return (
              <div
                key={d}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 transition-colors ${
                  isToday ? "border-coral/50 bg-coral/10" : "border-transparent bg-white/4"
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-coral" : "text-fog"}`}>{d}</span>
                {tr ? (
                  done ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint/20 text-mint">
                      <IconCheck className="h-3 w-3" strokeWidth={2.6} />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2" style={{ borderColor: ZONE_META[tr.zones[0]].color, opacity: 0.8 }} />
                  )
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-white/30">
                    <IconMoon className="h-3 w-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
