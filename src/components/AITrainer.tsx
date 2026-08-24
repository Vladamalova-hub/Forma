import React, { useEffect, useRef, useState } from "react";
import { AI_RULES, AI_EXTRA_RULES, AI_EXTRA_RULES2, AI_FALLBACKS, AI_CHIPS } from "../data/program";
import { IconSend, IconBroom, IconSparkle } from "./icons";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const LS_KEY = "forma-chat-v1";

function aiReply(text: string): string {
  const low = text.toLowerCase();
  for (const rule of [...AI_RULES, ...AI_EXTRA_RULES, ...AI_EXTRA_RULES2]) {
    if (rule.keywords.some((k) => low.includes(k.toLowerCase()))) return rule.reply;
  }
  return AI_FALLBACKS[Math.floor(Math.random() * AI_FALLBACKS.length)];
}

const WELCOME: Msg = {
  role: "bot",
  text: "Привет! Я Ника, твой AI-тренер. Веду тебя по плану: тренировки в выбранные тобой дни (будильники звонят прямо в приложении), ежедневный массаж живота, вода и сияющая кожа. Спрашивай о чём угодно — техника, питание, замеры и 3D-прогресс.",
};

export default function AITrainer() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch { /* ignore */ }
    return [WELCOME];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fallbackIdx = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages.slice(-40)));
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    const delay = 900 + Math.min(1400, text.length * 25);
    setTimeout(() => {
      let reply = aiReply(text);
      if (AI_FALLBACKS.includes(reply)) {
        reply = AI_FALLBACKS[fallbackIdx.current % AI_FALLBACKS.length];
        fallbackIdx.current += 1;
      }
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setTyping(false);
    }, delay);
  };

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-coral text-night-950" style={{ boxShadow: "0 6px 24px rgba(255,109,90,0.35)" }}>
            <IconSparkle className="h-6 w-6" strokeWidth={2} />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-night-900 bg-mint breathe" />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold leading-tight sm:text-xl">Ника · AI-тренер</h1>
            <p className="text-xs text-fog">онлайн · отвечает за секунды</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([WELCOME])}
          className="btn-press flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-fog hover:text-ink"
        >
          <IconBroom className="h-3.5 w-3.5" /> Очистить
        </button>
      </div>

      {/* messages */}
      <div ref={listRef} className="nice-scroll mt-5 flex-1 space-y-4 overflow-y-auto pr-1" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`rise-in flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                m.role === "user"
                  ? "rounded-br-md bg-coral font-medium text-night-950"
                  : "rounded-bl-md border border-white/10 bg-night-800 text-ink/95"
              }`}
            >
              <span className="whitespace-pre-line">{m.text}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-night-800 px-4 py-3.5">
              {[0, 1, 2].map((d) => (
                <span key={d} className="typing-dot h-2 w-2 rounded-full bg-fog" style={{ animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* chips */}
      <div className="nice-scroll -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {AI_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            disabled={typing}
            className="btn-press shrink-0 rounded-full border border-coral/30 bg-coral/10 px-3.5 py-2 text-xs font-medium text-peach hover:bg-coral/20 disabled:opacity-40"
          >
            {c}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-2 flex items-center gap-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси про талию, воду, кожу…"
          className="min-w-0 flex-1 rounded-full border border-white/12 bg-night-800 px-5 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-fog/60 focus:border-coral/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="btn-press flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral text-night-950 disabled:opacity-35"
          style={{ boxShadow: "0 6px 20px rgba(255,109,90,0.3)" }}
          aria-label="Отправить"
        >
          <IconSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
