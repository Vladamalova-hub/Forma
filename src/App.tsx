import React, { useCallback, useEffect, useRef, useState } from "react";
import HomePage from "./pages/HomePage";
import ProgramPage from "./pages/ProgramPage";
import MassagePage from "./pages/MassagePage";
import AITrainer from "./components/AITrainer";
import WorkoutPlayer from "./components/WorkoutPlayer";
import { WATER_GOAL, todayKey, weekKey } from "./data/program";
import type { WorkoutDay } from "./data/program";
import { IconHome, IconDumbbell, IconHands, IconChat, IconFlame, IconDrop, IconX } from "./components/icons";

type Tab = "home" | "program" | "massage" | "ai";

interface Persist {
  date: string;
  water: number;
  massageDates: string[];
  workoutLog: { date: string; dayId: string }[];
}

const LS_KEY = "forma-state-v2";

function loadState(): Persist {
  const fresh: Persist = { date: todayKey(), water: 0, massageDates: [], workoutLog: [] };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fresh;
    const p = JSON.parse(raw) as Persist;
    return {
      ...fresh,
      ...p,
      date: p.date === todayKey() ? p.date : todayKey(),
      water: p.date === todayKey() ? p.water : 0,
    };
  } catch {
    return fresh;
  }
}

function calcStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1); // серия может начинаться со вчера
  while (set.has(todayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

const NAV: { id: Tab; label: string; icon: (p: { className?: string }) => React.ReactElement }[] = [
  { id: "home", label: "Сегодня", icon: IconHome },
  { id: "program", label: "Программа", icon: IconDumbbell },
  { id: "massage", label: "Массаж", icon: IconHands },
  { id: "ai", label: "AI-тренер", icon: IconChat },
];

interface Toast {
  id: number;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function App() {
  const [state, setState] = useState<Persist>(loadState);
  const [tab, setTab] = useState<Tab>("home");
  const [player, setPlayer] = useState<WorkoutDay | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const lastReminder = useRef(Date.now());
  const waterRef = useRef(state.water);
  waterRef.current = state.water;

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  const pushToast = useCallback((text: string, actionLabel?: string, onAction?: () => void) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-1), { id, text, actionLabel, onAction }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  }, []);

  const setWater = useCallback((n: number) => {
    setState((s) => ({ ...s, water: n }));
    if (n >= WATER_GOAL) pushToast("Цель по воде достигнута — 2 литра! Кожа сияет.");
  }, [pushToast]);

  const addGlass = useCallback(() => {
    setState((s) => ({ ...s, water: Math.min(WATER_GOAL, s.water + 1) }));
  }, []);

  const onMassageDone = useCallback(() => {
    setState((s) => (s.massageDates.includes(todayKey()) ? s : { ...s, massageDates: [...s.massageDates, todayKey()] }));
    pushToast("Массаж живота засчитан. Серия продолжается!");
  }, [pushToast]);

  const onWorkoutComplete = useCallback(() => {
    setState((s) => {
      if (player && s.workoutLog.some((w) => w.date === todayKey() && w.dayId === player.id)) return s;
      return player ? { ...s, workoutLog: [...s.workoutLog, { date: todayKey(), dayId: player.id }] } : s;
    });
    pushToast("Тренировка записана в план. Горжусь тобой!");
  }, [player, pushToast]);

  // мягкие напоминания о воде
  useEffect(() => {
    const t = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        waterRef.current < WATER_GOAL &&
        Date.now() - lastReminder.current > 90_000
      ) {
        lastReminder.current = Date.now();
        pushToast(
          "Пауза на глоток воды — кожа и лимфа скажут спасибо",
          "+ стакан",
          addGlass
        );
      }
    }, 45_000);
    return () => clearInterval(t);
  }, [pushToast, addGlass]);

  const weekLog = state.workoutLog
    .filter((w) => weekKey(new Date(w.date + "T12:00:00")) === weekKey())
    .map((w) => w.dayId);
  const streak = calcStreak(state.massageDates);
  const massageDone = state.massageDates.includes(todayKey());

  return (
    <div className="relative min-h-dvh font-body text-ink">
      {/* ---------- ambient background ---------- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 12% -5%, rgba(255,109,90,0.11), transparent 60%)," +
              "radial-gradient(800px 600px at 95% 10%, rgba(127,216,176,0.08), transparent 55%)," +
              "radial-gradient(700px 500px at 70% 100%, rgba(111,198,232,0.07), transparent 55%)," +
              "linear-gradient(180deg, #171219 0%, #150f18 100%)",
          }}
        />
        <div className="bg-drift-1 absolute left-[8%] top-[22%] h-72 w-72 rounded-full bg-coral/8 blur-3xl" />
        <div className="bg-drift-2 absolute right-[6%] top-[45%] h-80 w-80 rounded-full bg-mint/7 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: NOISE }} />
      </div>

      {/* ---------- desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/8 bg-night-950/70 p-5 backdrop-blur-sm lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-coral" style={{ boxShadow: "0 6px 24px rgba(255,109,90,0.4)" }}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#171219" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15 L8 15 L10.5 7 L13.5 19 L16 11 L17.5 15 L20 15" />
            </svg>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-night-950 bg-mint breathe" />
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none tracking-tight">ФОРМА</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-fog">ягодицы · талия · грудь</div>
          </div>
        </div>

        <nav className="mt-9 space-y-1.5">
          {NAV.map((n) => {
            const Ico = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`btn-press flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-coral/30 bg-coral/12 text-coral"
                    : "border-transparent text-fog hover:bg-white/4 hover:text-ink"
                }`}
              >
                <Ico className="h-5 w-5" />
                {n.label}
                {n.id === "massage" && !massageDone && <span className="ml-auto h-2 w-2 rounded-full bg-mint breathe" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-fog">
                <IconDrop className="h-4 w-4 text-aqua" /> Вода сегодня
              </span>
              <span className="font-display text-sm font-extrabold text-aqua">{state.water}/{WATER_GOAL}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(state.water / WATER_GOAL) * 100}%`, background: "linear-gradient(90deg,#6FC6E8,#7FD8B0)" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-fog">
                <IconFlame className="h-4 w-4 text-coral" /> Серия массажа
              </span>
              <span className="font-display text-sm font-extrabold text-peach">{streak} дн</span>
            </div>
          </div>
          <p className="px-1 text-[10px] leading-relaxed text-fog/70">
            3 тренировки в неделю · массаж каждый день · 2 л воды
          </p>
        </div>
      </aside>

      {/* ---------- mobile top bar ---------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-night-950/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#171219" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15 L8 15 L10.5 7 L13.5 19 L16 11 L17.5 15 L20 15" />
            </svg>
          </div>
          <span className="font-display text-base font-extrabold tracking-tight">ФОРМА</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-aqua">
            <IconDrop className="h-3.5 w-3.5" /> {state.water}/{WATER_GOAL}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-coral/25 bg-coral/10 px-3 py-1.5 text-xs font-bold text-peach">
            <IconFlame className="h-3.5 w-3.5 text-coral" /> {streak}
          </span>
        </div>
      </header>

      {/* ---------- content ---------- */}
      <main className="relative z-10 lg:pl-60">
        <div className={`mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:pb-10 ${tab === "ai" ? "flex h-[calc(100dvh-120px)] flex-col lg:h-dvh lg:py-6" : ""}`}>
          {tab === "home" && (
            <HomePage
              water={state.water}
              setWater={setWater}
              massageDone={massageDone}
              massageStreak={streak}
              weekLog={weekLog}
              onStart={setPlayer}
              gotoMassage={() => setTab("massage")}
              gotoProgram={() => setTab("program")}
            />
          )}
          {tab === "program" && <ProgramPage weekLog={weekLog} onStart={setPlayer} />}
          {tab === "massage" && <MassagePage done={massageDone} streak={streak} onDone={onMassageDone} />}
          {tab === "ai" && <AITrainer />}
        </div>
      </main>

      {/* ---------- mobile bottom nav ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-night-950/90 backdrop-blur-md lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-4">
          {NAV.map((n) => {
            const Ico = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${active ? "text-coral" : "text-fog"}`}
              >
                <span className={`relative rounded-xl px-3 py-1 transition-colors ${active ? "bg-coral/12" : ""}`}>
                  <Ico className="h-5 w-5" />
                  {n.id === "massage" && !massageDone && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-mint breathe" />}
                </span>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="toast-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/12 bg-night-700/95 px-4 py-3 shadow-2xl backdrop-blur-md">
            <IconDrop className="h-5 w-5 shrink-0 text-aqua" strokeWidth={2} />
            <p className="flex-1 text-sm font-medium leading-snug">{t.text}</p>
            {t.actionLabel && (
              <button
                onClick={() => {
                  t.onAction?.();
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                }}
                className="btn-press shrink-0 rounded-full bg-aqua/15 px-3.5 py-2 text-xs font-bold text-aqua hover:bg-aqua/25"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              className="btn-press shrink-0 text-fog hover:text-ink"
              aria-label="Закрыть"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ---------- workout player overlay ---------- */}
      {player && (
        <WorkoutPlayer
          day={player}
          onClose={() => setPlayer(null)}
          onComplete={onWorkoutComplete}
          onAskAI={() => {
            setPlayer(null);
            setTab("ai");
          }}
        />
      )}
    </div>
  );
}
