import React, { useMemo, useRef, useState } from "react";
import { ZONE_META, type WorkoutDay, type ZoneId } from "../data/program";
import type { CustomLib, CustomExercise } from "../hooks/useCustomLib";
import { ZoneChips } from "../components/BodyMap";
import {
  IconPlus,
  IconTrash,
  IconPlay,
  IconX,
  IconCheck,
  IconClock,
  IconDumbbell,
  IconBody,
  IconHands,
} from "../components/icons";

const ZONE_IDS: ZoneId[] = ["glutes", "chest", "waist", "belly", "legs", "arms", "back"];

/* ---------------- формы ---------------- */

function ZonePicker({ value, onChange }: { value: ZoneId[]; onChange: (z: ZoneId[]) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ZONE_IDS.map((z) => {
        const on = value.includes(z);
        return (
          <button
            key={z}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== z) : [...value, z])}
            className={`btn-press inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              on ? "border-coral/60 bg-coral/15 text-ink" : "border-white/10 bg-white/3 text-fog hover:text-ink"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: ZONE_META[z].color, opacity: on ? 1 : 0.45 }} />
            {ZONE_META[z].label}
          </button>
        );
      })}
    </div>
  );
}

function ExerciseForm({ onAdd }: { onAdd: (data: { name: string; zones: ZoneId[]; technique: string; duration: number }, file: File | null) => Promise<void> }) {
  const [name, setName] = useState("");
  const [zones, setZones] = useState<ZoneId[]>(["glutes"]);
  const [duration, setDuration] = useState(40);
  const [technique, setTechnique] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const valid = name.trim().length > 1 && zones.length > 0 && technique.trim().length > 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onAdd({ name: name.trim(), zones, technique: technique.trim(), duration }, file);
      setName("");
      setTechnique("");
      setZones(["glutes"]);
      setDuration(40);
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="reveal on mx-auto w-full max-w-2xl space-y-4 rounded-3xl border border-coral/25 bg-night-800/80 p-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-coral">
          <IconPlus className="h-3.5 w-3.5" strokeWidth={2.4} /> Новое упражнение
        </span>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название — например, «Махи с резинкой»"
        className="w-full rounded-2xl border border-white/12 bg-night-900/70 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-fog/60 focus:border-coral/50"
      />

      <ZonePicker value={zones} onChange={setZones} />

      <div className="flex items-center justify-center gap-4">
        <span className="text-xs font-semibold text-fog">Длительность</span>
        <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-night-900/70 px-3 py-2">
          <button type="button" onClick={() => setDuration((d) => Math.max(10, d - 5))} className="btn-press rounded-lg bg-white/8 p-1.5 text-fog hover:text-ink" aria-label="Меньше">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5.5 12h13" /></svg>
          </button>
          <span className="w-16 text-center font-display text-sm font-extrabold tabular-nums">{duration} с</span>
          <button type="button" onClick={() => setDuration((d) => Math.min(300, d + 5))} className="btn-press rounded-lg bg-white/8 p-1.5 text-fog hover:text-ink" aria-label="Больше">
            <IconPlus className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <textarea
        value={technique}
        onChange={(e) => setTechnique(e.target.value)}
        placeholder={"Техника выполнения — каждая строка станет подсказкой в плеере.\nНапример:\nСпина прямая, пресс в тонусе\nДвижение медленное, без рывков"}
        rows={4}
        className="w-full resize-none rounded-2xl border border-white/12 bg-night-900/70 px-4 py-3.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-fog/60 focus:border-coral/50"
      />

      {/* видео */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith("video/")) setFile(f);
        }}
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${drag ? "border-coral/70 bg-coral/8" : "border-white/15 bg-night-900/40"}`}
      >
        {file && preview ? (
          <div className="space-y-3">
            <video src={preview} controls playsInline preload="metadata" className="mx-auto max-h-52 w-full rounded-xl bg-night-950 object-contain" />
            <div className="flex items-center justify-center gap-3">
              <span className="max-w-[60%] truncate text-xs text-fog">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} МБ</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="btn-press inline-flex items-center gap-1 rounded-full border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral"
              >
                <IconX className="h-3 w-3" /> убрать
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-press mx-auto flex flex-col items-center gap-2 py-2 text-fog hover:text-ink">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral/15 text-coral">
              <IconPlay className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">Загрузить видео техники</span>
            <span className="text-[11px] text-fog/80">перетащи файл сюда или нажми · видео хранится в приложении</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        type="submit"
        disabled={!valid || busy}
        className="btn-press mx-auto flex items-center gap-2 rounded-full bg-coral px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950 disabled:opacity-40"
        style={{ boxShadow: "0 6px 24px rgba(255,109,90,0.35)" }}
      >
        {busy ? "Сохраняю видео…" : "Сохранить упражнение"}
      </button>
    </form>
  );
}

function TrainingForm({ exercises, onAdd }: { exercises: CustomExercise[]; onAdd: (name: string, desc: string, ids: string[]) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const valid = name.trim().length > 1 && picked.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onAdd(name.trim(), desc.trim(), picked);
        setName("");
        setDesc("");
        setPicked([]);
      }}
      className="reveal on mx-auto w-full max-w-2xl space-y-4 rounded-3xl border border-mint/25 bg-night-800/80 p-5"
    >
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-mint">
          <IconDumbbell className="h-3.5 w-3.5" /> Новая тренировка
        </span>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название — «Мой вечерний комплекс»"
        className="w-full rounded-2xl border border-white/12 bg-night-900/70 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-fog/60 focus:border-mint/50"
      />
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Описание (необязательно)"
        className="w-full rounded-2xl border border-white/12 bg-night-900/70 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-fog/60 focus:border-mint/50"
      />

      {exercises.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-center text-xs leading-relaxed text-fog">
          Сначала добавь хотя бы одно упражнение во вкладке «Упражнения» — из них соберётся тренировка.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold text-fog">Выбери упражнения (в порядке списка):</p>
          <div className="nice-scroll max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {exercises.map((ex) => {
              const on = picked.includes(ex.id);
              const order = picked.indexOf(ex.id);
              return (
                <button
                  type="button"
                  key={ex.id}
                  onClick={() => toggle(ex.id)}
                  className={`btn-press flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    on ? "border-mint/50 bg-mint/10" : "border-white/8 bg-white/3 hover:bg-white/6"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-display text-[11px] font-extrabold ${
                      on ? "bg-mint text-night-950" : "bg-white/10 text-fog"
                    }`}
                  >
                    {on ? order + 1 : <IconPlus className="h-3 w-3" strokeWidth={2.6} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{ex.name}</span>
                  <span className="text-[11px] tabular-nums text-fog">{ex.duration} с</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!valid}
        className="btn-press mx-auto flex items-center gap-2 rounded-full bg-mint px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950 disabled:opacity-40"
        style={{ boxShadow: "0 6px 24px rgba(127,216,176,0.3)" }}
      >
        Создать тренировку
      </button>
    </form>
  );
}

/* ---------------- карточки ---------------- */

function ExerciseCard({ ex, url, onPlay, onRemove, delay }: { ex: CustomExercise; url?: string; onPlay: () => void; onRemove: () => void; delay: number }) {
  return (
    <article className="reveal on group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-night-800/80" style={{ animationDelay: `${delay}s` }}>
      <div className="relative aspect-[16/10] bg-night-950">
        {url ? (
          <button onClick={onPlay} className="btn-press block h-full w-full" aria-label={`Смотреть ${ex.name}`}>
            <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-night-950/25 transition-colors group-hover:bg-night-950/10">
              <span className="flex h-13 w-13 items-center justify-center rounded-full bg-coral p-3.5 text-night-950" style={{ boxShadow: "0 6px 22px rgba(255,109,90,0.45)" }}>
                <IconPlay className="h-6 w-6" />
              </span>
            </span>
          </button>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-fog">
              <IconBody className="h-7 w-7" />
            </span>
          </div>
        )}
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-night-950/70 px-2.5 py-1 text-[10px] font-bold tabular-nums text-ink backdrop-blur-sm">
          <IconClock className="h-3 w-3" /> {ex.duration} с
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-display text-sm font-extrabold leading-tight">{ex.name}</h3>
        <ZoneChips zones={ex.zones} />
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-fog">{ex.technique}</p>
        <div className="flex items-center gap-2">
          {url && (
            <button onClick={onPlay} className="btn-press flex flex-1 items-center justify-center gap-1.5 rounded-full bg-coral/15 py-2.5 text-xs font-bold text-coral transition-colors hover:bg-coral/25">
              <IconPlay className="h-3.5 w-3.5" /> Смотреть
            </button>
          )}
          <button onClick={onRemove} className="btn-press flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-xs font-semibold text-fog hover:border-coral/40 hover:text-coral" aria-label={`Удалить ${ex.name}`}>
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function TrainingCard({
  tr,
  exercises,
  onStart,
  onRemove,
  delay,
}: {
  tr: { id: string; name: string; description: string; exerciseIds: string[] };
  exercises: CustomExercise[];
  onStart: () => void;
  onRemove: () => void;
  delay: number;
}) {
  const exs = tr.exerciseIds.map((id) => exercises.find((e) => e.id === id)).filter((e): e is CustomExercise => !!e);
  const total = exs.reduce((s, e) => s + e.duration, 0) + Math.max(0, exs.length - 1) * 12;
  const mins = Math.max(1, Math.round(total / 60));

  return (
    <article className="reveal on flex min-w-0 flex-col rounded-3xl border border-white/10 bg-night-800/80 p-5" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-extrabold leading-tight">{tr.name}</h3>
          {tr.description && <p className="mt-1 text-xs leading-relaxed text-fog">{tr.description}</p>}
        </div>
        <button onClick={onRemove} className="btn-press shrink-0 rounded-full border border-white/10 bg-white/4 p-2.5 text-fog hover:border-coral/40 hover:text-coral" aria-label={`Удалить тренировку ${tr.name}`}>
          <IconTrash className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-fog">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1">
          <IconDumbbell className="h-3.5 w-3.5 text-coral" /> {exs.length} упр.
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1">
          <IconClock className="h-3.5 w-3.5 text-mint" /> ~{mins} мин
        </span>
        {exs.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1 text-ink/80">{exs.filter((e) => e.videoId).length} с видео</span>}
      </div>

      <ul className="mt-3 flex-1 space-y-1">
        {exs.slice(0, 4).map((e, i) => (
          <li key={e.id} className="flex items-center gap-2 text-xs text-ink/85">
            <span className="font-display text-[10px] font-bold text-coral">{String(i + 1).padStart(2, "0")}</span>
            <span className="truncate">{e.name}</span>
            <span className="ml-auto shrink-0 tabular-nums text-fog">{e.duration} с</span>
          </li>
        ))}
        {exs.length > 4 && <li className="text-[11px] text-fog">и ещё {exs.length - 4}…</li>}
      </ul>

      <button
        onClick={onStart}
        disabled={exs.length === 0}
        className="btn-press mt-4 flex items-center justify-center gap-2 rounded-full bg-coral py-3 font-display text-xs font-bold uppercase tracking-wider text-night-950 disabled:opacity-40"
        style={{ boxShadow: "0 6px 20px rgba(255,109,90,0.35)" }}
      >
        <IconPlay className="h-4 w-4" /> Начать
      </button>
    </article>
  );
}

/* ---------------- страница ---------------- */

export default function LibraryPage({ lib, onStart }: { lib: CustomLib; onStart: (d: WorkoutDay) => void }) {
  const [tab, setTab] = useState<"ex" | "tr">("ex");
  const [playing, setPlaying] = useState<CustomExercise | null>(null);

  const videoCount = lib.exercises.filter((e) => e.videoId).length;

  return (
    <div className="space-y-6">
      <div className="reveal on flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-lilac/30 bg-lilac/10 px-4 py-1.5">
          <IconHands className="h-3.5 w-3.5 text-lilac" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-lilac">Твоя личная коллекция</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Моя библиотека</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fog">
          Создавай свои упражнения: название, техника, видео — всё хранится прямо в приложении и работает офлайн. Собирай из них тренировки и запускай с таймером.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold text-fog">
            <span className="font-display font-extrabold text-coral">{lib.exercises.length}</span> упражнений
          </span>
          <span className="rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold text-fog">
            <span className="font-display font-extrabold text-mint">{lib.trainings.length}</span> тренировок
          </span>
          <span className="rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold text-fog">
            <span className="font-display font-extrabold text-lilac">{videoCount}</span> видео
          </span>
        </div>
      </div>

      {/* switch */}
      <div className="flex justify-center">
        <div className="flex rounded-full border border-white/10 bg-night-900/70 p-1">
          <button
            onClick={() => setTab("ex")}
            className={`btn-press rounded-full px-6 py-2.5 text-xs font-bold transition-colors ${tab === "ex" ? "bg-coral text-night-950" : "text-fog hover:text-ink"}`}
          >
            Упражнения
          </button>
          <button
            onClick={() => setTab("tr")}
            className={`btn-press rounded-full px-6 py-2.5 text-xs font-bold transition-colors ${tab === "tr" ? "bg-mint text-night-950" : "text-fog hover:text-ink"}`}
          >
            Тренировки
          </button>
        </div>
      </div>

      {tab === "ex" ? (
        <div className="space-y-6">
          <ExerciseForm onAdd={lib.addExercise} />
          {lib.exercises.length === 0 ? (
            <p className="reveal on mx-auto max-w-md rounded-3xl border border-dashed border-white/15 px-6 py-8 text-center text-sm leading-relaxed text-fog">
              Пока пусто. Добавь первое упражнение — оно появится здесь и будет доступно для тренировок.
            </p>
          ) : (
            <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-2">
              {lib.exercises.map((ex, i) => (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  url={ex.videoId ? lib.videoUrls[ex.videoId] : undefined}
                  onPlay={() => setPlaying(ex)}
                  onRemove={() => lib.removeExercise(ex.id)}
                  delay={(i % 4) * 0.06}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <TrainingForm exercises={lib.exercises} onAdd={lib.addTraining} />
          {lib.trainings.length === 0 ? (
            <p className="reveal on mx-auto max-w-md rounded-3xl border border-dashed border-white/15 px-6 py-8 text-center text-sm leading-relaxed text-fog">
              Тренировок пока нет. Собери первую из своих упражнений — плеер с таймером уже готов.
            </p>
          ) : (
            <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-2">
              {lib.trainings.map((tr, i) => (
                <TrainingCard
                  key={tr.id}
                  tr={tr}
                  exercises={lib.exercises}
                  onStart={() => onStart(lib.trainingToDay(tr))}
                  onRemove={() => lib.removeTraining(tr.id)}
                  delay={(i % 4) * 0.06}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* video modal */}
      {playing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/90 p-4 backdrop-blur-md" onClick={() => setPlaying(null)}>
          <div className="pop-in w-full max-w-2xl overflow-hidden rounded-3xl border border-white/12 bg-night-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-extrabold">{playing.name}</div>
                <ZoneChips zones={playing.zones} className="mt-1" />
              </div>
              <button onClick={() => setPlaying(null)} className="btn-press shrink-0 rounded-full border border-white/12 bg-white/5 p-2.5 text-fog hover:text-ink" aria-label="Закрыть">
                <IconX className="h-4 w-4" />
              </button>
            </div>
            {playing.videoId && lib.videoUrls[playing.videoId] ? (
              <video src={lib.videoUrls[playing.videoId]} controls autoPlay playsInline className="max-h-[55vh] w-full bg-night-950 object-contain" />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-fog">Видео не найдено</div>
            )}
            <div className="max-h-40 overflow-y-auto nice-scroll px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-peach">Техника</div>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/90">{playing.technique}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
