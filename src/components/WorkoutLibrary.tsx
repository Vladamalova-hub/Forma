import React, { useEffect, useState } from "react";
import { LIBRARY, CAT_COLORS, libDuration, toWorkoutDay } from "../data/library";
import type { LibTemplate } from "../data/library";
import type { WorkoutDay } from "../data/program";
import { ZoneChips } from "./BodyMap";
import { IconPlay, IconShuffle, IconSparkle, IconClock, IconArrowR } from "./icons";

const OFFSET_KEY = "forma-lib-offset-v1";

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + Math.floor((Date.now() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function pickTemplates(offset: number): LibTemplate[] {
  const n = LIBRARY.length;
  const seed = daySeed() + offset * 3;
  const out: LibTemplate[] = [];
  for (let i = 0; i < 3; i++) {
    out.push(LIBRARY[((seed * 7 + i * 5) % n + n) % n]);
  }
  return out;
}

function LibCard({ t, big, onStart, delay }: { t: LibTemplate; big?: boolean; onStart: (d: WorkoutDay) => void; delay: number }) {
  const color = CAT_COLORS[t.cat] ?? "#FF6D5A";
  return (
    <article
      className="reveal on group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-night-800/80 transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}s`, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 18px 44px ${color}26`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")}
    >
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
      <div className={`flex flex-1 flex-col p-5 ${big ? "sm:p-6" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: `${color}1f`, color }}>
            {t.cat}
          </span>
          {t.trend && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-bold text-peach">
              <IconSparkle className="h-3 w-3" /> {t.trend}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-fog">
            <IconClock className="h-3.5 w-3.5" /> {libDuration(t)} мин
          </span>
        </div>

        <h3 className={`mt-3 font-display font-extrabold leading-tight ${big ? "text-2xl" : "text-lg"}`}>{t.title}</h3>
        <p className={`mt-1.5 text-xs leading-relaxed text-fog ${big ? "sm:text-sm" : ""}`}>{t.tagline}</p>

        <ZoneChips zones={t.zones} className="mt-3" />

        <ul className={`mt-4 space-y-1.5 border-t border-white/6 pt-3 ${big ? "sm:grid sm:grid-cols-2 sm:gap-x-5 sm:space-y-0 sm:gap-y-1.5" : ""}`}>
          {(big ? t.ex : t.ex.slice(0, 3)).map((e, i) => (
            <li key={i} className="flex items-center gap-2.5 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-display text-[9px] font-bold" style={{ background: `${color}1c`, color }}>
                {i + 1}
              </span>
              <span className="truncate font-medium">{e.name}</span>
              <span className="ml-auto shrink-0 tabular-nums text-fog">{e.sets > 1 ? `${e.sets}×${e.work}с` : `${e.work}с`}</span>
            </li>
          ))}
          {!big && t.ex.length > 3 && <li className="pl-7 text-[11px] text-fog">+ ещё {t.ex.length - 3} движения…</li>}
        </ul>

        <button
          onClick={() => onStart(toWorkoutDay(t))}
          className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950 transition-transform group-hover:scale-[1.02]"
          style={{ background: color, boxShadow: `0 6px 22px ${color}4d` }}
        >
          <IconPlay className="h-3.5 w-3.5" /> Начать находку
        </button>
      </div>
    </article>
  );
}

export default function WorkoutLibrary({ onStart }: { onStart: (d: WorkoutDay) => void }) {
  const [offset, setOffset] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(OFFSET_KEY) ?? "0", 10) || 0;
    } catch {
      return 0;
    }
  });
  const [picks, setPicks] = useState<LibTemplate[]>(() => pickTemplates(offset));

  useEffect(() => {
    try {
      localStorage.setItem(OFFSET_KEY, String(offset));
    } catch { /* ignore */ }
    setPicks(pickTemplates(offset));
  }, [offset]);

  const [featured, ...rest] = picks;

  return (
    <section className="reveal on mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-peach/15 text-peach">
              <IconSparkle className="h-4 w-4" />
            </span>
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">Свежие находки</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">
            Подборка тренировок в духе Pinterest и TikTok — каждый день новые, без повторов. Публичный API Pinterest закрыт, поэтому
            Ника собрала библиотеку трендов внутри приложения и перемешивает её для тебя.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onStart(toWorkoutDay(LIBRARY[(daySeed() + offset * 13 + 11) % LIBRARY.length]))}
            className="btn-press hidden items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink hover:bg-white/10 sm:flex"
          >
            Сюрприз <IconArrowR className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="btn-press flex items-center gap-2 rounded-full bg-coral px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950"
            style={{ boxShadow: "0 6px 22px rgba(255,109,90,0.35)" }}
          >
            <IconShuffle className="h-4 w-4" strokeWidth={2} /> Перемешать
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {featured && (
          <div className="md:col-span-2">
            <LibCard t={featured} big onStart={onStart} delay={0.02} />
          </div>
        )}
        {rest.map((t, i) => (
          <LibCard key={t.id} t={t} onStart={onStart} delay={0.08 + i * 0.06} />
        ))}
      </div>
    </section>
  );
}
