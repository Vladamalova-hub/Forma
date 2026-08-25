import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  WEEK_PLAN,
  ZONE_META,
  DAY_SHORT,
  DEFAULT_SCHEDULE,
  workoutForDay,
  toKey,
  todayKey,
  SKIN_TIPS,
  WATER_GOAL,
  dayOfYear,
  type WorkoutDay,
  type DaySlot,
  type Logs,
  type Measure,
} from "./data/program";
import BodyMap, { ZoneChips } from "./components/BodyMap";
import CityClock from "./components/CityClock";
import InstallCard from "./components/InstallCard";
import WorkoutPlayer from "./components/WorkoutPlayer";
import AITrainer from "./components/AITrainer";
import ProgramPage from "./pages/ProgramPage";
import MassagePage from "./pages/MassagePage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import LibraryPage from "./pages/LibraryPage";
import { useCustomLib } from "./hooks/useCustomLib";
import {
  IconHome,
  IconDumbbell,
  IconHands,
  IconChat,
  IconCalendar,
  IconUser,
  IconLibrary,
  IconDrop,
  IconPlus,
  IconSparkle,
  IconFlame,
  IconBell,
  IconX,
} from "./components/icons";

type Tab = "home" | "program" | "massage" | "calendar" | "library" | "profile" | "ai";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

interface Ringing {
  id: string;
  title: string;
  subtitle: string;
}

interface Toast {
  id: number;
  text: string;
}

/* ---------------- alarm sound ---------------- */
let audioCtx: AudioContext | null = null;
let ringTimer: number | null = null;

function startRing() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    const ctx = audioCtx;
    void ctx.resume();
    const beep = () => {
      [880, 1174.7].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        const t0 = ctx.currentTime + i * 0.19;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.24, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.17);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0);
        o.stop(t0 + 0.2);
      });
    };
    beep();
    if (ringTimer === null) ringTimer = window.setInterval(beep, 1150);
  } catch {
    /* ignore */
  }
}

function stopRing() {
  if (ringTimer !== null) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [player, setPlayer] = useState<WorkoutDay | null>(null);
  const lib = useCustomLib();

  // persisted state
  const [logs, setLogs] = useState<Logs>(() => load("forma-logs-v1", {}));
  const [schedule, setSchedule] = useState<DaySlot[]>(() => load("forma-schedule-v1", DEFAULT_SCHEDULE));
  const [morning, setMorning] = useState<{ enabled: boolean; time: string }>(() =>
    load("forma-morning-v1", { enabled: true, time: "07:30" })
  );
  const [measures, setMeasures] = useState<Measure[]>(() => load("forma-measures-v1", []));
  const [name, setName] = useState<string>(() => load("forma-name-v1", ""));
  const [waterState, setWaterState] = useState<{ date: string; count: number }>(() =>
    load("forma-water-v1", { date: todayKey(), count: 0 })
  );

  useEffect(() => save("forma-logs-v1", logs), [logs]);
  useEffect(() => save("forma-schedule-v1", schedule), [schedule]);
  useEffect(() => save("forma-morning-v1", morning), [morning]);
  useEffect(() => save("forma-measures-v1", measures), [measures]);
  useEffect(() => save("forma-name-v1", name), [name]);
  useEffect(() => save("forma-water-v1", waterState), [waterState]);

  const water = waterState.date === todayKey() ? waterState.count : 0;

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);
  const pushToast = useCallback((text: string) => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // water reminders
  const lastRemind = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      if (now - lastRemind.current > 45 * 60 * 1000 && water < WATER_GOAL && now > lastRemind.current + 20000) {
        lastRemind.current = now;
        pushToast("Сделай глоток воды — коже и лимфе это нужно");
      }
    }, 25 * 1000);
    return () => clearInterval(t);
  }, [water, pushToast]);

  const addWater = () => {
    const next = water + 1;
    setWaterState({ date: todayKey(), count: next });
    if (next === WATER_GOAL) {
      pushToast("Цель по воде выполнена! Кожа скажет спасибо");
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors: ["#6FC6E8", "#7FD8B0", "#FFB084"] });
    } else {
      pushToast(`Стакан ${next} из ${WATER_GOAL} — отлично`);
    }
  };

  /* ---------------- alarms ---------------- */
  const [ringing, setRinging] = useState<Ringing | null>(null);
  const [snoozes, setSnoozes] = useState<(Ringing & { fireAt?: number })[]>([]);
  const firedRef = useRef<{ date: string; keys: string[] }>(load("forma-fired-v1", { date: todayKey(), keys: [] as string[] }));

  const fire = useCallback(
    (a: Ringing) => {
      setRinging(a);
      startRing();
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(a.title, { body: a.subtitle });
        }
      } catch {
        /* ignore */
      }
    },
    []
  );

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dateStr = todayKey(now);
      if (firedRef.current.date !== dateStr) {
        firedRef.current = { date: dateStr, keys: [] };
        save("forma-fired-v1", firedRef.current);
      }
      const hasFired = (k: string) => firedRef.current.keys.includes(k);
      const markFired = (k: string) => {
        firedRef.current = { date: dateStr, keys: [...firedRef.current.keys, k] };
        save("forma-fired-v1", firedRef.current);
      };

      const candidates: { key: string; alarm: Ringing }[] = [];
      if (morning.enabled && morning.time === hm) {
        candidates.push({
          key: "morning",
          alarm: { id: "morning", title: "Утренняя зарядка", subtitle: "5–7 минут: суставная разминка и вакуум натощак. Талия начинается здесь!" },
        });
      }
      const dow = (now.getDay() + 6) % 7;
      const slot = schedule[dow];
      if (slot?.enabled && slot.time === hm) {
        const w = workoutForDay(schedule, dow);
        candidates.push({
          key: `day-${dow}`,
          alarm: {
            id: `day-${dow}`,
            title: `Тренировка: ${w?.title ?? "по плану"}`,
            subtitle: "Пора! Надень форму, налей воды — и вперёд. Я уже включила таймер.",
          },
        });
      }

      for (const c of candidates) {
        if (!hasFired(c.key)) {
          markFired(c.key);
          fire(c.alarm);
          break;
        }
      }

      // snoozes
      const nowMs = Date.now();
      const due = snoozes.filter((s) => s.fireAt !== undefined && nowMs >= s.fireAt);
      if (due.length) {
        setSnoozes((s) => s.filter((x) => x.fireAt === undefined || x.fireAt > nowMs));
        fire({ id: due[0].id, title: due[0].title, subtitle: due[0].subtitle });
      }
    };
    const t = setInterval(check, 10000);
    check();
    return () => clearInterval(t);
  }, [morning, schedule, snoozes, fire]);

  const dismissAlarm = () => {
    stopRing();
    setRinging(null);
  };
  const snoozeAlarm = () => {
    stopRing();
    if (ringing) {
      setSnoozes((s) => [...s, { ...ringing, fireAt: Date.now() + 10 * 60 * 1000 }]);
      pushToast("Будильник отложен на 10 минут");
    }
    setRinging(null);
  };

  const requestNotifPermission = () => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
    } catch {
      /* ignore */
    }
  };

  const onSchedule = (s: DaySlot[]) => {
    setSchedule(s);
    if (s.some((x) => x.enabled)) requestNotifPermission();
  };
  const onMorning = (m: { enabled: boolean; time: string }) => {
    setMorning(m);
    if (m.enabled) requestNotifPermission();
  };

  /* ---------------- logs & stats ---------------- */
  const toggleLog = (key: string, kind: "workout" | "massage") => {
    setLogs((prev) => {
      const cur = prev[key] ?? {};
      const next = { ...cur };
      if (kind === "workout") {
        if (next.workoutId) delete next.workoutId;
        else {
          const d = new Date(`${key}T12:00:00`);
          const dow = (d.getDay() + 6) % 7;
          next.workoutId = workoutForDay(schedule, dow)?.id ?? "custom";
        }
      } else {
        next.massage = !next.massage;
      }
      return { ...prev, [key]: next };
    });
  };

  const massageStreak = useMemo(() => {
    let streak = 0;
    const d = new Date();
    if (!logs[toKey(d)]?.massage) d.setDate(d.getDate() - 1); // today not done yet — count from yesterday
    while (logs[toKey(d)]?.massage) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [logs]);

  const weekLog = useMemo(() => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const ids: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const w = logs[toKey(d)]?.workoutId;
      if (w) ids.push(w);
    }
    return ids;
  }, [logs]);

  const onWorkoutDone = useCallback(
    (d: WorkoutDay) => {
      setLogs((prev) => ({ ...prev, [todayKey()]: { ...(prev[todayKey()] ?? {}), workoutId: d.id } }));
      pushToast(`${d.title} — готово! Отдыхай и пей воду`);
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ["#FF6D5A", "#FFB084", "#7FD8B0"] });
    },
    [pushToast]
  );

  const onMassageDone = useCallback(() => {
    setLogs((prev) => ({ ...prev, [todayKey()]: { ...(prev[todayKey()] ?? {}), massage: true } }));
    pushToast("Массаж живота сделан — плюс день к серии!");
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 }, colors: ["#7FD8B0", "#6FC6E8"] });
  }, [pushToast]);

  const todayDow = (new Date().getDay() + 6) % 7;
  const todayWorkout = workoutForDay(schedule, todayDow);
  const todayLog = logs[todayKey()];
  const enabledAlarms = schedule.filter((s) => s.enabled).length + (morning.enabled ? 1 : 0);

  const startWorkout = (d: WorkoutDay) => setPlayer(d);

  const tip = SKIN_TIPS[dayOfYear() % SKIN_TIPS.length];

  /* ================= render ================= */
  return (
    <div className="relative min-h-screen font-body text-ink">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-drift-1 absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, #FF6D5A 0%, transparent 62%)", filter: "blur(70px)" }} />
        <div className="bg-drift-2 absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-18" style={{ background: "radial-gradient(circle, #7FD8B0 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="bg-drift-1 absolute -bottom-48 left-1/4 h-[460px] w-[460px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #C7A6F0 0%, transparent 60%)", filter: "blur(80px)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(246,239,232,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-night-900/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <button onClick={() => setTab("home")} className="btn-press flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral font-display text-sm font-extrabold text-night-950" style={{ boxShadow: "0 4px 18px rgba(255,109,90,0.4)" }}>
              Ф
            </span>
            <span className="text-left leading-none">
              <span className="font-display text-base font-extrabold tracking-wide">ФОРМА</span>
              <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.2em] text-fog sm:block">тело · ритм · сияние</span>
            </span>
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 text-xs font-bold text-mint">
              <IconFlame className="flicker h-4 w-4" strokeWidth={2} /> {massageStreak}
            </span>
            <button
              onClick={() => setTab("program")}
              className="btn-press relative flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-fog hover:text-ink"
              title="Будильники"
            >
              <IconBell className="h-4 w-4" />
              <span className="hidden sm:inline">{enabledAlarms} буд.</span>
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-coral" />
            </button>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-6 sm:pb-28">
        {tab === "home" && (
          <HomePage
            name={name}
            schedule={schedule}
            todayWorkout={todayWorkout}
            todayLog={todayLog}
            logs={logs}
            streak={massageStreak}
            weekLog={weekLog}
            water={water}
            addWater={addWater}
            tip={tip}
            onStart={startWorkout}
            onToggle={toggleLog}
            onGoto={setTab}
          />
        )}
        {tab === "program" && (
          <ProgramPage
            weekLog={weekLog}
            onStart={startWorkout}
            schedule={schedule}
            onSchedule={onSchedule}
            morning={morning}
            onMorning={onMorning}
          />
        )}
        {tab === "massage" && <MassagePage done={!!todayLog?.massage} streak={massageStreak} onDone={onMassageDone} />}
        {tab === "calendar" && (
          <CalendarPage schedule={schedule} logs={logs} streak={massageStreak} onToggle={toggleLog} onStart={startWorkout} />
        )}
        {tab === "library" && <LibraryPage lib={lib} onStart={startWorkout} />}
        {tab === "profile" && (
          <ProfilePage
            name={name}
            setName={setName}
            measures={measures}
            onAdd={(m) => setMeasures((ms) => [...ms, m])}
            onRemove={(i) => setMeasures((ms) => ms.filter((_, k) => k !== i))}
          />
        )}
        {tab === "ai" && (
          <div className="h-[calc(100dvh-180px)] min-h-[480px]">
            <AITrainer />
          </div>
        )}
      </main>

      {/* bottom nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-night-900/92 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-7 px-0.5 sm:px-2">
          {(
            [
              ["home", "Главная", IconHome],
              ["program", "План", IconDumbbell],
              ["massage", "Массаж", IconHands],
              ["calendar", "Календарь", IconCalendar],
              ["library", "База", IconLibrary],
              ["profile", "Профиль", IconUser],
              ["ai", "Тренер", IconChat],
            ] as [Tab, string, React.ComponentType<{ className?: string; strokeWidth?: number }>][]
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`btn-press relative flex min-w-0 flex-col items-center gap-1 py-2.5 text-[8.5px] font-semibold leading-none transition-colors sm:text-[10px] ${
                tab === id ? "text-coral" : "text-fog hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={tab === id ? 2.2 : 1.8} />
              <span className="w-full truncate text-center">{label}</span>
              {tab === id && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-coral" />}
            </button>
          ))}
        </div>
      </nav>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-[92%] max-w-sm -translate-x-1/2 flex-col items-center gap-2 sm:bottom-24">
        {toasts.map((t) => (
          <div key={t.id} className="toast-in pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-coral/30 bg-night-800/95 px-4 py-3 shadow-xl">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
              <IconDrop className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm">{t.text}</span>
            <button onClick={addWater} className="btn-press flex items-center gap-1 rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-night-950">
              <IconPlus className="h-3.5 w-3.5" strokeWidth={2.4} /> стакан
            </button>
          </div>
        ))}
      </div>

      {/* alarm overlay */}
      {ringing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/85 p-4 backdrop-blur-md">
          <div className="pop-in w-full max-w-sm rounded-3xl border border-coral/30 bg-night-800 p-8 text-center shadow-2xl">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <span className="alarm-ring absolute inset-0 rounded-full border-2 border-coral/50" />
              <span className="alarm-ring absolute inset-0 rounded-full border-2 border-coral/30" style={{ animationDelay: "0.5s" }} />
              <span className="bell-shake flex h-16 w-16 items-center justify-center rounded-full bg-coral text-night-950">
                <IconBell className="h-8 w-8" strokeWidth={2} />
              </span>
            </div>
            <div className="mt-5 font-display text-[11px] font-bold uppercase tracking-[0.24em] text-coral">Будильник</div>
            <h3 className="mt-2 font-display text-2xl font-extrabold">{ringing.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">{ringing.subtitle}</p>
            <div className="mt-6 space-y-2.5">
              <button
                onClick={dismissAlarm}
                className="btn-press w-full rounded-full bg-coral py-3.5 font-display text-sm font-bold uppercase tracking-wider text-night-950"
                style={{ boxShadow: "0 8px 26px rgba(255,109,90,0.4)" }}
              >
                Встаю и делаю!
              </button>
              <button
                onClick={snoozeAlarm}
                className="btn-press w-full rounded-full border border-white/12 bg-white/5 py-3.5 text-sm font-semibold text-fog hover:text-ink"
              >
                Отложить на 10 минут
              </button>
            </div>
          </div>
        </div>
      )}

      {/* workout player */}
      {player && (
        <WorkoutPlayer
          day={player}
          onClose={() => setPlayer(null)}
          onComplete={() => onWorkoutDone(player)}
          onProfile={() => {
            setPlayer(null);
            setTab("profile");
          }}
          onAskAI={() => {
            setPlayer(null);
            setTab("ai");
          }}
        />
      )}
    </div>
  );
}

/* ==================== home page ==================== */

function HomePage({
  name,
  schedule,
  todayWorkout,
  todayLog,
  logs,
  streak,
  weekLog,
  water,
  addWater,
  tip,
  onStart,
  onToggle,
  onGoto,
}: {
  name: string;
  schedule: DaySlot[];
  todayWorkout: WorkoutDay | null;
  todayLog: { workoutId?: string; massage?: boolean } | undefined;
  logs: Logs;
  streak: number;
  weekLog: string[];
  water: number;
  addWater: () => void;
  tip: string;
  onStart: (d: WorkoutDay) => void;
  onToggle: (key: string, kind: "workout" | "massage") => void;
  onGoto: (t: Tab) => void;
}) {
  const h = new Date().getHours();
  const hello = h < 5 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const accent = todayWorkout ? ZONE_META[todayWorkout.zones[0]].color : "#B3A4BD";

  // current week days
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const workoutDone = !!todayLog?.workoutId;
  const massageDone = !!todayLog?.massage;

  return (
    <div className="space-y-5">
      {/* greeting + clock */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="reveal on flex flex-col justify-between rounded-3xl border border-white/10 bg-night-800/80 p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-fog">{hello}{name ? `, ${name}` : ""}!</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Твоё тело <span className="text-coral">в ритме</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-fog">
              {todayWorkout
                ? workoutDone
                  ? "Тренировка закрыта — красавица! Остался массаж живота и вода."
                  : `Сегодня по плану — «${todayWorkout.title}». Ягодицы, грудь или талия — решают твои дни.`
                : "Сегодня день восстановления: массаж живота, вода, прогулка и сияющая кожа."}
            </p>
          </div>

          {/* week strip */}
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {week.map((d, i) => {
              const w = workoutForDay(schedule, i);
              const log = logs[toKey(d)];
              const isToday = i === todayDow;
              return (
                <button
                  key={i}
                  onClick={() => onGoto("calendar")}
                  className={`btn-press flex flex-col items-center gap-1 rounded-2xl border py-2.5 transition-colors ${
                    isToday ? "border-coral/60 bg-coral/12" : "border-white/8 bg-white/3 hover:bg-white/6"
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase ${isToday ? "text-coral" : "text-fog"}`}>{DAY_SHORT[i]}</span>
                  <span className="font-display text-sm font-extrabold">{d.getDate()}</span>
                  <span className="flex h-1.5 items-center gap-1">
                    {w && <span className="h-1.5 w-1.5 rounded-full" style={{ background: ZONE_META[w.zones[0]].color }} />}
                    {log?.massage && <span className="h-1.5 w-1.5 rounded-full bg-mint" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <CityClock />
      </div>

      {/* today focus */}
      <div className="grid gap-5 lg:grid-cols-[auto_1fr_1fr]">
        <section
          className="reveal on relative flex min-w-[260px] flex-col items-center rounded-3xl border border-white/10 bg-night-800/80 p-5"
          style={{ background: `linear-gradient(150deg, ${accent}14, transparent 55%), rgba(31,23,34,0.8)` }}
        >
          {todayWorkout ? (
            <>
              <div className="h-56">
                <BodyMap view="front" zones={todayWorkout.zones} />
              </div>
              <div className="mt-2 text-center">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
                  Сегодня · {todayWorkout.weekday}
                </div>
                <div className="mt-1 font-display text-lg font-extrabold">{todayWorkout.title}</div>
                <ZoneChips zones={todayWorkout.zones} className="mt-2 justify-center" />
                <button
                  onClick={() => onStart(todayWorkout)}
                  disabled={workoutDone}
                  className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950 disabled:opacity-50"
                  style={{ background: accent, boxShadow: `0 6px 22px ${accent}55` }}
                >
                  {workoutDone ? "Уже сделано" : "Начать · 15 мин"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="h-56">
                <BodyMap view="front" zones={["belly", "waist"]} />
              </div>
              <div className="mt-2 text-center">
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-mint">День восстановления</div>
                <div className="mt-1 font-display text-lg font-extrabold">Массаж + забота</div>
                <p className="mt-2 text-xs leading-relaxed text-fog">6 минут для живота, прогулка и вода — тело скажет спасибо.</p>
                <button
                  onClick={() => onGoto("massage")}
                  className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-mint py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950"
                  style={{ boxShadow: "0 6px 22px rgba(127,216,176,0.35)" }}
                >
                  <IconHands className="h-4 w-4" /> К массажу
                </button>
              </div>
            </>
          )}
        </section>

        {/* quick toggles */}
        <section className="reveal on flex flex-col gap-3.5 rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: "0.06s" }}>
          <h2 className="font-display text-lg font-extrabold">Отметки за сегодня</h2>
          <button
            onClick={() => onToggle(todayKey(), "workout")}
            className={`btn-press flex items-center justify-between rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
              workoutDone ? "border-coral/50 bg-coral/15 text-coral" : "border-white/10 bg-white/3 hover:bg-white/6"
            }`}
          >
            <span className="flex items-center gap-3">
              <IconDumbbell className="h-5 w-5" /> Тренировка
            </span>
            <span className={`flex h-7 w-12 items-center rounded-full px-1 transition-colors ${workoutDone ? "justify-end bg-coral" : "bg-white/12"}`}>
              <span className="h-5 w-5 rounded-full bg-night-950" />
            </span>
          </button>
          <button
            onClick={() => onToggle(todayKey(), "massage")}
            className={`btn-press flex items-center justify-between rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
              massageDone ? "border-mint/50 bg-mint/15 text-mint" : "border-white/10 bg-white/3 hover:bg-white/6"
            }`}
          >
            <span className="flex items-center gap-3">
              <IconHands className="h-5 w-5" /> Массаж живота
            </span>
            <span className={`flex h-7 w-12 items-center rounded-full px-1 transition-colors ${massageDone ? "justify-end bg-mint" : "bg-white/12"}`}>
              <span className="h-5 w-5 rounded-full bg-night-950" />
            </span>
          </button>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/3 p-3.5">
              <div className="font-display text-2xl font-extrabold text-coral">{weekLog.length}</div>
              <div className="text-[11px] text-fog">тренировок на неделе</div>
            </div>
            <div className="rounded-2xl bg-white/3 p-3.5">
              <div className="font-display text-2xl font-extrabold text-mint">{streak}</div>
              <div className="text-[11px] text-fog">дней массажа подряд</div>
            </div>
          </div>
        </section>

        {/* water */}
        <section className="reveal on flex flex-col rounded-3xl border border-aqua/20 bg-night-800/80 p-5" style={{ animationDelay: "0.12s" }}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
              <IconDrop className="h-5 w-5 text-aqua" /> Вода
            </h2>
            <span className="font-display text-sm font-extrabold tabular-nums text-aqua">
              {water} / {WATER_GOAL}
            </span>
          </div>
          <div className="mt-4 flex flex-1 items-end justify-between gap-1.5 px-1">
            {Array.from({ length: WATER_GOAL }, (_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-xl rounded-b-md transition-all duration-500 ${i < water ? "bg-aqua" : "bg-white/8"}`}
                style={{
                  height: `${28 + (i / (WATER_GOAL - 1)) * 52}px`,
                  boxShadow: i < water ? "0 0 14px rgba(111,198,232,0.4)" : "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={addWater}
            disabled={water >= WATER_GOAL}
            className="btn-press mt-4 flex items-center justify-center gap-2 rounded-full bg-aqua py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950 disabled:opacity-50"
            style={{ boxShadow: "0 6px 22px rgba(111,198,232,0.35)" }}
          >
            <IconPlus className="h-4 w-4" strokeWidth={2.4} /> Выпить стакан
          </button>
          <p className="mt-2.5 text-center text-[11px] text-fog">{WATER_GOAL} × 250 мл · упругость кожи изнутри</p>
        </section>
      </div>

      {/* skin tip */}
      <section className="reveal on flex items-center gap-4 rounded-3xl border border-lilac/20 bg-night-800/80 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lilac/15 text-lilac">
          <IconSparkle className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lilac">Сияние дня</div>
          <p className="mt-1 text-sm leading-relaxed text-ink/90">{tip}</p>
        </div>
      </section>

      <InstallCard />
    </div>
  );
}
