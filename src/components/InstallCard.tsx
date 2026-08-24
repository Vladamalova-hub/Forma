import React, { useEffect, useState } from "react";
import { IconInstall, IconCheck } from "./icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  if (installed) {
    return (
      <section className="reveal on flex items-center gap-4 rounded-3xl border border-mint/25 bg-mint/8 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint/15 text-mint">
          <IconCheck className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <div className="font-display text-sm font-extrabold text-mint">ФОРМА уже на твоём экране</div>
          <p className="mt-0.5 text-xs leading-relaxed text-fog">Работает как обычное приложение — даже без интернета. Все замеры и серии на месте.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal on relative overflow-hidden rounded-3xl border border-coral/25 bg-night-800/80 p-5">
      <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-coral/12 blur-3xl" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-coral font-display text-2xl font-extrabold text-night-950" style={{ boxShadow: "0 8px 26px rgba(255,109,90,0.4)" }}>
          Ф
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-extrabold">Добавь ФОРМУ на домашний экран</h3>
          {isIOS ? (
            <p className="mt-1 text-xs leading-relaxed text-fog">
              В Safari нажми кнопку <span className="font-bold text-ink">«Поделиться»</span> (квадрат со стрелкой) → <span className="font-bold text-ink">«На экран „Домой"»</span>. Приложение откроется в полноэкранном режиме и будет работать офлайн.
            </p>
          ) : deferred ? (
            <p className="mt-1 text-xs leading-relaxed text-fog">Один тап — и приложение живёт на рабочем столе: полноэкранно, быстро и без интернета.</p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-fog">
              Открой меню браузера <span className="font-bold text-ink">(⋮)</span> → <span className="font-bold text-ink">«Установить приложение»</span>. ФОРМА откроется полноэкранно и будет работать офлайн.
            </p>
          )}
        </div>
        {deferred && (
          <button
            onClick={install}
            className="btn-press flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-night-950"
            style={{ boxShadow: "0 8px 26px rgba(255,109,90,0.4)" }}
          >
            <IconInstall className="h-4 w-4" strokeWidth={2.2} /> Установить
          </button>
        )}
      </div>
    </section>
  );
}
