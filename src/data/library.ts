import type { FigureId, WorkoutDay, ZoneId } from "./program";

export interface LibExercise {
  name: string;
  figure: FigureId;
  work: number; // сек
  sets: number;
  cue: string;
  zones: ZoneId[];
}

export interface LibTemplate {
  id: string;
  cat: string;
  title: string;
  tagline: string;
  zones: ZoneId[];
  trend?: string;
  ex: LibExercise[];
}

const g: ZoneId[] = ["glutes"];
const gl: ZoneId[] = ["glutes", "legs"];
const bw: ZoneId[] = ["belly", "waist"];
const cw: ZoneId[] = ["chest", "waist"];

export const LIBRARY: LibTemplate[] = [
  {
    id: "dance-groove",
    cat: "Dance-кардио",
    title: "ТикТок-грув",
    trend: "в тренде недели",
    tagline: "Танцевальные связки из трендов — кардио и ягодицы горят в такт. Включи любимый плейлист.",
    zones: gl,
    ex: [
      { name: "Плие-пружинки", figure: "squat", work: 45, sets: 1, cue: "Пружинь в плие на носках, колени смотрят наружу.", zones: gl },
      { name: "Круги бёдрами", figure: "twist", work: 40, sets: 1, cue: "Рисуй бёдрами большие круги, плечи неподвижны.", zones: ["waist"] },
      { name: "Отведение в такт", figure: "sideleg", work: 30, sets: 2, cue: "Отводи ногу в ритм, носок на себя.", zones: gl },
      { name: "Махи назад", figure: "donkey", work: 30, sets: 2, cue: "Мах пяткой в потолок, поясница не прогибается.", zones: g },
      { name: "Скручивания в бит", figure: "crunch", work: 40, sets: 1, cue: "Поднимай лопатки на каждый «удар» музыки.", zones: ["belly"] },
      { name: "Планка-тап", figure: "planktap", work: 40, sets: 1, cue: "Касайся плеча без раскачки корпуса.", zones: bw },
    ],
  },
  {
    id: "morning-hiit",
    cat: "HIIT",
    title: "Утренний разгон",
    tagline: "10 минут интенсива вместо кофе: разгоняет метаболизм на весь день.",
    zones: bw,
    ex: [
      { name: "Присед с выпрыгом", figure: "squat", work: 40, sets: 1, cue: "Взрывайся вверх, приземляйся мягко на носки.", zones: gl },
      { name: "Бёрпи-лайт", figure: "pushup", work: 40, sets: 1, cue: "Упрощённое бёрпи: планка → отжимание → вверх.", zones: cw },
      { name: "Альпинист", figure: "planktap", work: 40, sets: 1, cue: "Быстрые шаги коленями в планке, корпус жёсткий.", zones: ["belly"] },
      { name: "Русские повороты", figure: "twist", work: 40, sets: 1, cue: "Поворачивай корпус, взгляд следует за руками.", zones: ["waist"] },
      { name: "Ягодичный мост", figure: "bridge", work: 40, sets: 1, cue: "Финишное добивание — squeez в верхней точке.", zones: g },
    ],
  },
  {
    id: "pilates-core",
    cat: "Пилатес",
    title: "Кор и тонкая талия",
    tagline: "Медленные контролируемые движения — глубокие мышцы живота и узкая талия.",
    zones: bw,
    ex: [
      { name: "Вакуум", figure: "vacuum", work: 40, sets: 1, cue: "Выдохни весь воздух и втяни живот под рёбра.", zones: ["waist"] },
      { name: "Скручивания", figure: "crunch", work: 45, sets: 1, cue: "Поясница прижата, работает только пресс.", zones: ["belly"] },
      { name: "Боковая планка", figure: "sideplank", work: 30, sets: 2, cue: "Таз не провисает — линия от плеча до стопы.", zones: ["waist"] },
      { name: "Повороты корпуса", figure: "twist", work: 40, sets: 1, cue: "Медленно и подконтрольно, без рывков.", zones: bw },
      { name: "Мост на лопатках", figure: "bridge", work: 45, sets: 1, cue: "Позвоночник скручивается позвонок за позвонком.", zones: g },
    ],
  },
  {
    id: "barre-legs",
    cat: "Барре",
    title: "Балетные ножки",
    tagline: "У балерин нет «отдыхающих» мышц. Плие, махи и жжение в ягодицах.",
    zones: gl,
    ex: [
      { name: "Глубокое плие", figure: "squat", work: 50, sets: 1, cue: "Широкая постановка, спина вертикально.", zones: gl },
      { name: "Махи на боку", figure: "sideleg", work: 35, sets: 2, cue: "Маленькая амплитуда, но жжение — большое.", zones: g },
      { name: "Отведение назад", figure: "donkey", work: 35, sets: 2, cue: "Колено согнуто 90°, пятка тянется вверх.", zones: g },
      { name: "Мост с паузой", figure: "bridge", work: 45, sets: 1, cue: "3 секунды пауза сверху в каждом повторе.", zones: g },
      { name: "Плие-пульс", figure: "squat", work: 45, sets: 1, cue: "Небольшая амплитуда внизу — добиваем мышцы.", zones: gl },
    ],
  },
  {
    id: "yoga-flow",
    cat: "Йога",
    title: "Вечерний флоу",
    tagline: "Мягкий поток: вытяжение, дыхание и спокойная нервная система перед сном.",
    zones: ["waist", "legs"],
    ex: [
      { name: "Дыхание-вакуум", figure: "vacuum", work: 40, sets: 1, cue: "Соедини дыхание с мягким втяжением живота.", zones: ["waist"] },
      { name: "Скрутка лёжа", figure: "twist", work: 45, sets: 1, cue: "Расслабь шею, дыши глубоко в рёбра.", zones: ["waist"] },
      { name: "Планка на боку", figure: "sideplank", work: 30, sets: 2, cue: "Медленная версия — держи и дыши.", zones: ["waist"] },
      { name: "Полумост", figure: "bridge", work: 50, sets: 1, cue: "Поднимай таз на вдохе, опускай на выдохе.", zones: g },
      { name: "Мягкие скручивания", figure: "crunch", work: 40, sets: 1, cue: "Без усилия — только лёгкое включение пресса.", zones: ["belly"] },
    ],
  },
  {
    id: "glute-fire",
    cat: "Сила",
    title: "Ягодицы в огне",
    trend: "выбор Ники",
    tagline: "Всё, что ты любишь: максимум фокуса на ягодицах за 12 минут.",
    zones: g,
    ex: [
      { name: "Приседания", figure: "squat", work: 50, sets: 1, cue: "Вес на пятках, колени не заваливаются внутрь.", zones: gl },
      { name: "Мост", figure: "bridge", work: 50, sets: 1, cue: "Сжимай ягодицы вверху на 2 секунды.", zones: g },
      { name: "Махи назад", figure: "donkey", work: 35, sets: 2, cue: "Не поднимай ногу выше — держи пресс.", zones: g },
      { name: "Махи на боку", figure: "sideleg", work: 35, sets: 2, cue: "Носок слегка вниз — так работает средняя ягодичная.", zones: g },
      { name: "Плие-добивка", figure: "squat", work: 40, sets: 1, cue: "Последний подход — самый важный. Давай!", zones: gl },
    ],
  },
  {
    id: "wall-challenge",
    cat: "Челлендж",
    title: "Стена-челлендж",
    tagline: "Статика жжёт сильнее динамики. Проверь, сколько выдержат твои ноги.",
    zones: gl,
    ex: [
      { name: "Стульчик у стены", figure: "squat", work: 60, sets: 1, cue: "Бёдра параллельно полу, спина к стене.", zones: gl },
      { name: "Мост", figure: "bridge", work: 50, sets: 1, cue: "Восстанавливаемся, не выключая ягодицы.", zones: g },
      { name: "Планка-тап", figure: "planktap", work: 40, sets: 1, cue: "Корпус работает, пока ноги отдыхают.", zones: ["belly"] },
      { name: "Скручивания", figure: "crunch", work: 45, sets: 1, cue: "Медленно, чувствуй каждое повторение.", zones: ["belly"] },
    ],
  },
  {
    id: "steel-abs",
    cat: "Пресс",
    title: "Стальной живот",
    tagline: "Плоский живот и рельеф: пять движений, ноль инвентаря.",
    zones: ["belly"],
    ex: [
      { name: "Скручивания", figure: "crunch", work: 45, sets: 1, cue: "Подбородок к груди не тянем — работают рёбра.", zones: ["belly"] },
      { name: "Русские повороты", figure: "twist", work: 45, sets: 1, cue: "Косые мышцы включаются на повороте.", zones: ["waist"] },
      { name: "Планка-тап", figure: "planktap", work: 45, sets: 1, cue: "Таз не гуляет из стороны в сторону.", zones: bw },
      { name: "Вакуум", figure: "vacuum", work: 40, sets: 1, cue: "Глубокая поперечная мышца — секрет плоскости.", zones: ["waist"] },
      { name: "Боковая планка", figure: "sideplank", work: 35, sets: 2, cue: "Талия «подтягивается» именно здесь.", zones: ["waist"] },
    ],
  },
  {
    id: "chest-posture",
    cat: "Осанка",
    title: "Королевская спина",
    tagline: "Грудь вверх, плечи назад: упражнения, которые визуально приподнимают грудь.",
    zones: cw,
    ex: [
      { name: "Отжимания с колен", figure: "pushup", work: 40, sets: 1, cue: "Локти 45°, грудь тянется к полу.", zones: ["chest"] },
      { name: "Разведение рук", figure: "fly", work: 45, sets: 1, cue: "Представь, что обнимаешь большое дерево.", zones: ["chest"] },
      { name: "Сжимание ладоней", figure: "press", work: 45, sets: 1, cue: "Дави изо всех сил 5 секунд, расслабь, повтори.", zones: ["chest"] },
      { name: "Боковая планка", figure: "sideplank", work: 35, sets: 2, cue: "Плечо строго над запястьем.", zones: ["waist"] },
      { name: "Планка-тап", figure: "planktap", work: 40, sets: 1, cue: "Лопатки сведены — держи осанку.", zones: ["chest"] },
    ],
  },
  {
    id: "ballet-grace",
    cat: "Барре",
    title: "Грация балерины",
    tagline: "Лёгкие махи и вытянутые носки — ноги становятся длиннее и стройнее.",
    zones: ["legs"],
    ex: [
      { name: "Махи на боку", figure: "sideleg", work: 35, sets: 2, cue: "Тяни носок, как балерина у станка.", zones: ["legs"] },
      { name: "Отведение назад", figure: "donkey", work: 35, sets: 2, cue: "Движение от ягодицы, не от поясницы.", zones: g },
      { name: "Плие", figure: "squat", work: 45, sets: 1, cue: "Пятки вместе, колени в стороны — первая позиция.", zones: gl },
      { name: "Мост", figure: "bridge", work: 45, sets: 1, cue: "Медленный подъём, как занавес в театре.", zones: g },
    ],
  },
  {
    id: "no-jump-cardio",
    cat: "Кардио",
    title: "Без прыжков",
    tagline: "Соседи снизу скажут спасибо: кардио-эффект без ударной нагрузки.",
    zones: gl,
    ex: [
      { name: "Присед-волна", figure: "squat", work: 50, sets: 1, cue: "Вставай медленно, как будто поднимаешь волну.", zones: gl },
      { name: "Махи на боку", figure: "sideleg", work: 40, sets: 2, cue: "Быстрый темп, маленькая амплитуда.", zones: g },
      { name: "Повороты", figure: "twist", work: 40, sets: 1, cue: "Добавь темп — пульс поднимется.", zones: ["waist"] },
      { name: "Мост в темпе", figure: "bridge", work: 45, sets: 1, cue: "Без пауз сверху — держим ритм.", zones: g },
      { name: "Планка-тап", figure: "planktap", work: 30, sets: 1, cue: "Финал — включи кор на максимум.", zones: ["belly"] },
    ],
  },
  {
    id: "night-stretch",
    cat: "Стретчинг",
    title: "Растяжка перед сном",
    tagline: "Снять зажимы, удлинить мышцы после тренировок и уснуть быстрее.",
    zones: ["waist", "legs"],
    ex: [
      { name: "Мягкие повороты", figure: "twist", work: 50, sets: 1, cue: "Дыши глубоко, с каждым выдохом чуть дальше.", zones: ["waist"] },
      { name: "Планка на боку", figure: "sideplank", work: 30, sets: 2, cue: "Держи мягко, без напряжения до дрожи.", zones: ["waist"] },
      { name: "Полумост", figure: "bridge", work: 50, sets: 1, cue: "Растягивай переднюю поверхность бедра.", zones: ["legs"] },
      { name: "Дыхание-вакуум", figure: "vacuum", work: 40, sets: 1, cue: "Массаж внутренних органов перед сном.", zones: ["belly"] },
    ],
  },
];

export const CAT_COLORS: Record<string, string> = {
  "Dance-кардио": "#FF6D5A",
  HIIT: "#FFB084",
  "Пилатес": "#7FD8B0",
  "Барре": "#C7A6F0",
  "Йога": "#6FC6E8",
  "Сила": "#FF6D5A",
  "Челлендж": "#FFB084",
  "Пресс": "#7FD8B0",
  "Осанка": "#C7A6F0",
  "Кардио": "#FF6D5A",
  "Стретчинг": "#6FC6E8",
};

export function libDuration(t: LibTemplate): number {
  const work = t.ex.reduce((s, e) => s + e.work * e.sets, 0);
  const rest = t.ex.length * 12 + 10;
  return Math.max(5, Math.round((work + rest) / 60));
}

export function toWorkoutDay(t: LibTemplate): WorkoutDay {
  return {
    id: `lib-${t.id}`,
    weekday: "Находка",
    dayNum: -1,
    title: t.title,
    tagline: t.tagline,
    zones: t.zones,
    exercises: t.ex.map((e, i) => ({
      id: `${t.id}-ex${i}`,
      name: e.name,
      figure: e.figure,
      sets: e.sets,
      work: e.work,
      rest: 12,
      reps: e.sets > 1 ? `${e.sets} × ${e.work} сек` : `${e.work} сек`,
      zones: e.zones,
      cue: e.cue,
      tips: [e.cue, "Дыши ровно, не задерживай дыхание.", "Следи за зоной подсветки — там сейчас вся работа."],
    })),
  };
}
