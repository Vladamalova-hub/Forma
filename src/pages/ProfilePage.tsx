import React, { useMemo, useState } from "react";
import { BASE_MEASURE, MEASURE_FIELDS, type Measure } from "../data/program";
import { ProfileScene } from "../components/Human3D";
import type { BodyScale } from "../components/Human3D";
import MorphFigure from "../components/MorphFigure";
import { IconPlus, IconMinus, IconTrash, IconCheck, IconSparkle, IconBody, IconGlobe } from "../components/icons";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function toBody(m: Omit<Measure, "date">): BodyScale {
  return {
    chest: clamp(m.chest / BASE_MEASURE.chest, 0.7, 1.4),
    waist: clamp(m.waist / BASE_MEASURE.waist, 0.62, 1.5),
    hips: clamp(m.hips / BASE_MEASURE.hips, 0.7, 1.4),
    thigh: clamp(m.thigh / BASE_MEASURE.thigh, 0.7, 1.4),
    arm: clamp(m.arm / BASE_MEASURE.arm, 0.7, 1.4),
    height: clamp((m.height || BASE_MEASURE.height) / BASE_MEASURE.height, 0.88, 1.12),
  };
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/12 text-xs text-fog">
        Добавь минимум два замера — появится график динамики
      </div>
    );
  }
  const W = 320;
  const H = 88;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((v, i) => [
    8 + (i / (points.length - 1)) * (W - 16),
    H - 12 - ((v - min) / span) * (H - 26),
  ]);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${H - 4} L${xy[0][0].toFixed(1)},${H - 4} Z`;
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full">
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6D5A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF6D5A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wgrad)" />
      <path d={line} fill="none" stroke="#FF6D5A" strokeWidth="2.4" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#171219" stroke="#FF6D5A" strokeWidth="2" />
      ))}
      <text x={8} y={14} fill="#B3A4BD" fontSize="10" fontFamily="Golos Text">
        {max.toFixed(1)}
      </text>
      <text x={8} y={H - 16} fill="#B3A4BD" fontSize="10" fontFamily="Golos Text">
        {min.toFixed(1)}
      </text>
      <circle cx={last[0]} cy={last[1]} r="5.5" fill="#FF6D5A" opacity="0.3">
        <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default function ProfilePage({
  name,
  setName,
  measures,
  onAdd,
  onRemove,
}: {
  name: string;
  setName: (v: string) => void;
  measures: Measure[];
  onAdd: (m: Measure) => void;
  onRemove: (idx: number) => void;
}) {
  const latest = measures[measures.length - 1];
  const first = measures[0];

  const [form, setForm] = useState<Omit<Measure, "date">>(() =>
    latest
      ? ({ ...BASE_MEASURE, ...latest, date: undefined as unknown as string } as Omit<Measure, "date">)
      : { ...BASE_MEASURE }
  );
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"photo" | "3d">("photo");

  const current: Omit<Measure, "date"> = latest ? { ...BASE_MEASURE, ...latest } : BASE_MEASURE;
  const body = useMemo(() => toBody(current), [latest]); // eslint-disable-line react-hooks/exhaustive-deps
  const ghost = useMemo(() => (first && measures.length > 1 ? toBody(first) : null), [first, measures.length]);

  const set = (k: keyof Omit<Measure, "date">, v: number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    onAdd({ ...form, date: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const delta = (k: keyof Omit<Measure, "date">) =>
    measures.length > 1 ? current[k] - measures[measures.length - 2][k] : null;

  const goodWhenDown: (keyof Omit<Measure, "date">)[] = ["weight", "waist", "hips", "thigh"];

  return (
    <div className="space-y-5">
      <div className="reveal on text-center">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Профиль и прогресс</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog">
          Замеры — самый честный индикатор: талия и бёдра скажут больше, чем весы. Смотри на себя в двух режимах: реалистичное фото с линиями замеров и 3D-модель, которая в точности повторяет твои пропорции (призрак — первый замер, фигура — текущий).
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,440px)_1fr]">
        {/* body: realistic photo + 3D */}
        <section className="reveal on overflow-hidden rounded-3xl border border-white/10 bg-night-800/80">
          <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3">
            <div className="flex rounded-full border border-white/10 bg-night-900/60 p-1">
              <button
                onClick={() => setView("photo")}
                className={`btn-press flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  view === "photo" ? "bg-coral text-night-950" : "text-fog hover:text-ink"
                }`}
              >
                <IconBody className="h-3.5 w-3.5" /> Фигура
              </button>
              <button
                onClick={() => setView("3d")}
                className={`btn-press flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  view === "3d" ? "bg-coral text-night-950" : "text-fog hover:text-ink"
                }`}
              >
                <IconGlobe className="h-3.5 w-3.5" /> 3D-модель
              </button>
            </div>
            <span className="hidden text-[10px] uppercase tracking-wider text-fog sm:block">
              {view === "photo" ? "меняется с каждым замером" : "повторяет твои пропорции"}
            </span>
          </div>

          <div className="relative h-[420px] sm:h-[480px]">
            {view === "photo" ? (
              <div className="rise-in relative flex h-full items-center justify-center overflow-hidden">
                <MorphFigure
                  key={`${current.chest}-${current.waist}-${current.hips}-${current.thigh}-${current.arm}`}
                  body={body}
                  ghost={ghost}
                  guides={{ chest: current.chest, waist: current.waist, hips: current.hips }}
                  className="h-full max-w-full"
                />
                {ghost && (
                  <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full border border-lilac/30 bg-night-900/70 px-3 py-1.5 text-[11px] text-lilac backdrop-blur-sm">
                    <span className="h-2.5 w-2.5 rounded-full border border-dashed border-lilac/70" /> пунктир — первый замер
                  </div>
                )}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-night-900/70 px-3.5 py-1.5 text-[10px] uppercase tracking-wider text-fog backdrop-blur-sm">
                  пропорции меняются по твоим замерам
                </div>
              </div>
            ) : (
              <>
                <ProfileScene body={body} ghost={ghost} className="h-full" />
                {ghost && (
                  <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full border border-lilac/30 bg-night-900/70 px-3 py-1.5 text-[11px] text-lilac backdrop-blur-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-lilac/50" /> призрак — первый замер
                  </div>
                )}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-night-900/70 px-3.5 py-1.5 text-[10px] uppercase tracking-wider text-fog backdrop-blur-sm">
                  вращай пальцем · колесо — зум
                </div>
              </>
            )}

            <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-night-900/70 px-3.5 py-2.5 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-fog">Твоё тело сейчас</div>
              <div className="mt-1 font-display text-lg font-extrabold">
                {current.weight} кг <span className="text-xs font-bold text-fog">· {current.height} см</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-white/8 p-4 sm:grid-cols-7">
            {MEASURE_FIELDS.map((f) => {
              const d = delta(f.k);
              const neutral = f.k === "height";
              const good = d !== null && d !== 0 && (goodWhenDown.includes(f.k) ? d < 0 : d > 0);
              return (
                <div key={f.k} className="rounded-xl bg-white/3 px-2 py-2 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-fog">{f.label}</div>
                  <div className="mt-0.5 font-display text-sm font-extrabold tabular-nums">
                    {current[f.k]}
                    <span className="text-[10px] text-fog"> {f.unit}</span>
                  </div>
                  {!neutral && d !== null && d !== 0 && (
                    <div className={`text-[10px] font-bold ${good ? "text-mint" : "text-coral"}`}>
                      {d > 0 ? "+" : ""}
                      {Math.round(d * 10) / 10}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* form + history */}
        <div className="flex flex-col gap-5">
          <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.06s" }}>
            <h2 className="font-display text-lg font-extrabold">Новый замер</h2>
            <div className="mt-4">
              <label className="text-xs font-semibold text-fog" htmlFor="pname">
                Имя (для приветствий)
              </label>
              <input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как тебя зовут?"
                className="mt-1.5 w-full rounded-2xl border border-white/12 bg-night-900/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog/50 focus:border-coral/50"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MEASURE_FIELDS.map((f) => (
                <div key={f.k} className="rounded-2xl border border-white/10 bg-white/3 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-fog">
                    {f.label}, {f.unit}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <button
                      onClick={() => set(f.k, Math.round((form[f.k] - f.step) * 10) / 10)}
                      className="btn-press rounded-lg bg-white/8 p-1.5 text-fog hover:text-ink"
                      aria-label={`Уменьшить ${f.label}`}
                    >
                      <IconMinus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      step={f.step}
                      value={form[f.k]}
                      onChange={(e) => set(f.k, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-display text-lg font-extrabold tabular-nums outline-none"
                    />
                    <button
                      onClick={() => set(f.k, Math.round((form[f.k] + f.step) * 10) / 10)}
                      className="btn-press rounded-lg bg-white/8 p-1.5 text-fog hover:text-ink"
                      aria-label={`Увеличить ${f.label}`}
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={save}
              className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950"
              style={{ boxShadow: "0 6px 22px rgba(255,109,90,0.35)" }}
            >
              {saved ? (
                <>
                  <IconCheck className="h-4 w-4" strokeWidth={2.4} /> Сохранено!
                </>
              ) : (
                <>
                  <IconSparkle className="h-4 w-4" /> Сохранить замер · сегодня
                </>
              )}
            </button>
          </section>

          <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.12s" }}>
            <h2 className="font-display text-lg font-extrabold">Динамика веса</h2>
            <div className="mt-3">
              <Sparkline points={measures.map((m) => m.weight)} />
            </div>
          </section>

          <section className="reveal on rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.18s" }}>
            <h2 className="font-display text-lg font-extrabold">История замеров</h2>
            {measures.length === 0 ? (
              <p className="mt-3 text-sm text-fog">Пока пусто — сохрани первый замер, и модель построится по твоим пропорциям.</p>
            ) : (
              <ul className="nice-scroll mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                {[...measures].reverse().map((m, ri) => {
                  const idx = measures.length - 1 - ri;
                  const prev = idx > 0 ? measures[idx - 1] : null;
                  return (
                    <li key={m.date} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold capitalize">
                          {new Date(m.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                        </div>
                        <div className="mt-0.5 text-[11px] tabular-nums text-fog">
                          {m.weight} кг · талия {m.waist} · бёдра {m.hips} · грудь {m.chest}
                        </div>
                      </div>
                      {prev && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                            m.weight - prev.weight <= 0 ? "bg-mint/15 text-mint" : "bg-coral/15 text-coral"
                          }`}
                        >
                          {m.weight - prev.weight > 0 ? "+" : ""}
                          {Math.round((m.weight - prev.weight) * 10) / 10} кг
                        </span>
                      )}
                      <button
                        onClick={() => onRemove(idx)}
                        className="btn-press shrink-0 rounded-full p-2 text-fog/60 hover:text-coral"
                        aria-label="Удалить замер"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
