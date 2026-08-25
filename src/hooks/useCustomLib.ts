import { useCallback, useEffect, useState } from "react";
import type { WorkoutDay, ZoneId } from "../data/program";

export interface CustomExercise {
  id: string;
  name: string;
  zones: ZoneId[];
  technique: string;
  duration: number; // сек
  videoId?: string;
  videoName?: string;
}

export interface CustomTraining {
  id: string;
  name: string;
  description: string;
  exerciseIds: string[];
}

const LS_EX = "forma-lib-ex-v1";
const LS_TR = "forma-lib-tr-v1";

/* ---------- IndexedDB: хранилище видео (переживает перезагрузку) ---------- */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("forma-media", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("videos")) req.result.createObjectStore("videos");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

async function idbDel(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

async function idbAll(): Promise<{ id: string; blob: Blob }[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const keys = store.getAllKeys();
    const vals = store.getAll();
    tx.oncomplete = () => res((keys.result as string[]).map((k, i) => ({ id: k, blob: (vals.result as Blob[])[i] })));
    tx.onerror = () => rej(tx.error);
  });
}

/* ---------- helpers ---------- */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

/* ---------- hook ---------- */

export function useCustomLib() {
  const [exercises, setExercises] = useState<CustomExercise[]>(() => load<CustomExercise[]>(LS_EX, []));
  const [trainings, setTrainings] = useState<CustomTraining[]>(() => load<CustomTraining[]>(LS_TR, []));
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});

  // при старте восстанавливаем видео из IndexedDB → object URLs
  useEffect(() => {
    let alive = true;
    idbAll()
      .then((items) => {
        if (!alive || !items.length) return;
        const urls: Record<string, string> = {};
        items.forEach((it) => {
          urls[it.id] = URL.createObjectURL(it.blob);
        });
        setVideoUrls(urls);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => save(LS_EX, exercises), [exercises]);
  useEffect(() => save(LS_TR, trainings), [trainings]);

  const addExercise = useCallback(async (data: Omit<CustomExercise, "id">, file?: File | null) => {
    const id = `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let videoId: string | undefined;
    let videoName: string | undefined;
    if (file) {
      videoId = `${id}-v`;
      await idbPut(videoId, file);
      videoName = file.name;
    }
    setExercises((xs) => [...xs, { ...data, id, videoId, videoName }]);
    // сразу добавим url для предпросмотра
    if (file && videoId) {
      setVideoUrls((u) => ({ ...u, [videoId]: URL.createObjectURL(file) }));
    }
  }, []);

  const removeExercise = useCallback(
    async (id: string) => {
      const ex = exercises.find((e) => e.id === id);
      setExercises((xs) => xs.filter((e) => e.id !== id));
      setTrainings((ts) => ts.map((t) => ({ ...t, exerciseIds: t.exerciseIds.filter((x) => x !== id) })));
      if (ex?.videoId) {
        const vid = ex.videoId;
        setVideoUrls((u) => {
          const url = u[vid];
          if (url) URL.revokeObjectURL(url);
          const n = { ...u };
          delete n[vid];
          return n;
        });
        idbDel(vid).catch(() => {});
      }
    },
    [exercises]
  );

  const addTraining = useCallback((name: string, description: string, exerciseIds: string[]) => {
    setTrainings((ts) => [...ts, { id: `tr-${Date.now()}`, name, description, exerciseIds }]);
  }, []);

  const removeTraining = useCallback((id: string) => {
    setTrainings((ts) => ts.filter((t) => t.id !== id));
  }, []);

  /** превращает личную тренировку в формат плеера */
  const trainingToDay = useCallback(
    (t: CustomTraining): WorkoutDay => {
      const exs = t.exerciseIds
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is CustomExercise => !!e);
      return {
        id: `my-${t.id}`,
        weekday: "Моя тренировка",
        dayNum: -1,
        title: t.name,
        tagline: t.description || "Тренировка из личной библиотеки",
        zones: Array.from(new Set(exs.flatMap((e) => e.zones))),
        exercises: exs.map((e) => ({
          id: e.id,
          name: e.name,
          figure: "crunch" as const,
          sets: 1,
          work: e.duration,
          rest: 12,
          reps: `${e.duration} сек`,
          zones: e.zones,
          cue: e.technique.split("\n")[0] || e.name,
          tips: e.technique.split("\n").filter(Boolean).slice(0, 4),
          videoUrl: e.videoId ? videoUrls[e.videoId] : undefined,
        })),
      };
    },
    [exercises, videoUrls]
  );

  return { exercises, trainings, videoUrls, addExercise, removeExercise, addTraining, removeTraining, trainingToDay };
}

export type CustomLib = ReturnType<typeof useCustomLib>;
