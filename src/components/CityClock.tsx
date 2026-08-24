import React, { useEffect, useMemo, useState } from "react";
import { IconGlobe } from "./icons";

const TZ_CITIES: Record<string, string> = {
  "Europe/Moscow": "Москва",
  "Europe/Saint_Petersburg": "Санкт-Петербург",
  "Europe/Kaliningrad": "Калининград",
  "Europe/Samara": "Самара",
  "Asia/Yekaterinburg": "Екатеринбург",
  "Asia/Novosibirsk": "Новосибирск",
  "Asia/Krasnoyarsk": "Красноярск",
  "Asia/Irkutsk": "Иркутск",
  "Asia/Vladivostok": "Владивосток",
  "Asia/Magadan": "Магадан",
  "Asia/Kamchatka": "Камчатка",
  "Asia/Almaty": "Алматы",
  "Asia/Aqtobe": "Актобе",
  "Asia/Tashkent": "Ташкент",
  "Asia/Bishkek": "Бишкек",
  "Asia/Dushanbe": "Душанбе",
  "Asia/Baku": "Баку",
  "Asia/Yerevan": "Ереван",
  "Asia/Tbilisi": "Тбилиси",
  "Europe/Minsk": "Минск",
  "Europe/Kyiv": "Киев",
  "Europe/Chisinau": "Кишинёв",
  "Asia/Dubai": "Дубай",
  "Europe/Berlin": "Берлин",
  "Europe/Paris": "Париж",
  "Europe/London": "Лондон",
  "Europe/Warsaw": "Варшава",
  "Europe/Riga": "Рига",
  "Europe/Tallinn": "Таллин",
  "Europe/Vilnius": "Вильнюс",
  "America/New_York": "Нью-Йорк",
  "America/Los_Angeles": "Лос-Анджелес",
};

function fmt(date: Date, timeZone?: string, withSeconds = false) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" as const } : {}),
      timeZone,
    }).format(date);
  } catch {
    return date.toLocaleTimeString("ru-RU");
  }
}

const WORLD: { tz: string; label: string }[] = [
  { tz: "Asia/Kamchatka", label: "Петропавловск-Камчатский" },
  { tz: "Europe/Moscow", label: "Москва" },
  { tz: "Asia/Almaty", label: "Шымкент" },
  { tz: "Asia/Shanghai", label: "Чжоушань" },
];

export default function CityClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "local";
    } catch {
      return "local";
    }
  }, []);

  const city = useMemo(() => {
    if (TZ_CITIES[tz]) return TZ_CITIES[tz];
    const last = tz.split("/").pop() ?? "ваш город";
    return last.replace(/_/g, " ");
  }, [tz]);

  const [h, m, s] = fmt(now, tz === "local" ? undefined : tz, true).split(":");

  return (
    <div className={`rounded-3xl border border-white/10 bg-night-800/80 ${compact ? "px-4 py-3" : "p-5"}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fog">
        <IconGlobe className="h-3.5 w-3.5 text-aqua" />
        <span className="truncate">{city} · ваш часовой пояс</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1 font-display font-extrabold tabular-nums">
        <span className={compact ? "text-2xl" : "text-4xl sm:text-5xl"}>{h}:{m}</span>
        <span className="text-lg text-coral">{s}</span>
      </div>
      <div className="mt-1 text-xs capitalize text-fog">
        {new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(now)}
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WORLD.map((w) => (
            <div key={w.tz} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
              <div className="truncate text-[10px] uppercase tracking-wider text-fog">{w.label}</div>
              <div className="font-display text-sm font-bold tabular-nums">{fmt(now, w.tz)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
