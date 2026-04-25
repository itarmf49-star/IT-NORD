"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { defaultLocale, t, type Locale } from "@/lib/i18n";

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
};

type ChatDockProps = {
  locale?: Locale;
};

export function ChatDock({ locale = defaultLocale }: ChatDockProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const endpoint = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      await fetch("/api/socket", { method: "GET" }).catch(() => undefined);
      if (cancelled) return;

      const socket = io(endpoint, { path: "/api/socket", transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("chat:history", (msgs: ChatMessage[]) => {
        setMessages(msgs.slice(-200));
      });

      socket.on("chat:message", (msg: ChatMessage) => {
        setMessages((prev) => [...prev.slice(-200), msg]);
      });
    }

    void boot();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [endpoint]);

  return (
    <div className="chat-dock" aria-live="polite">
      <button type="button" className="chat-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {t(locale, "chatLive")}
      </button>

      {open ? (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <p className="chat-title">{t(locale, "chatTitle")}</p>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {t(locale, "chatSubtitle")}
              </p>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label={t(locale, "chatClose")}>
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m.id} className="chat-bubble">
                <p className="chat-bubble-meta">{new Date(m.createdAt).toLocaleTimeString()}</p>
                <p className="chat-bubble-text">{m.body}</p>
              </div>
            ))}
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              const body = draft.trim();
              if (!body) return;
              socketRef.current?.emit("chat:message", { body });
              setDraft("");
            }}
          >
            <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t(locale, "chatPlaceholder")} />
            <button className="btn btn-primary btn-sm" type="submit">
              {t(locale, "chatSend")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
