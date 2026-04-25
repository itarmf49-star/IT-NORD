"use client";

import { useMemo, useState } from "react";
import type { PortalMessage } from "@/lib/portal-data";

type MessagesThreadProps = {
  initial: PortalMessage[];
  labels: {
    title: string;
    empty: string;
    placeholder: string;
    send: string;
  };
};

function nowId() {
  return `m_${Date.now().toString(36)}`;
}

export function MessagesThread({ initial, labels }: MessagesThreadProps) {
  const [messages, setMessages] = useState<PortalMessage[]>(initial);
  const [draft, setDraft] = useState("");

  const threadId = useMemo(() => initial[0]?.threadId ?? "thread_support", [initial]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <h2 className="portal-card-title">{labels.title}</h2>
      </div>

      <div className="portal-thread">
        {messages.length === 0 ? <p className="muted">{labels.empty}</p> : null}
        {messages.map((m) => (
          <div key={m.id} className={["portal-bubble", m.from === "CLIENT" ? "portal-bubble-client" : "portal-bubble-admin"].join(" ")}>
            <p className="portal-bubble-meta">
              {m.from} • {new Date(m.createdAt).toLocaleString()}
            </p>
            <p className="portal-bubble-body">{m.body}</p>
          </div>
        ))}
      </div>

      <form
        className="portal-compose"
        onSubmit={async (e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text) return;

          // optimistic UI
          const optimistic: PortalMessage = {
            id: nowId(),
            threadId,
            from: "CLIENT",
            body: text,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, optimistic]);
          setDraft("");

          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ content: text }),
          });
          if (!res.ok) {
            // rollback optimistic message on failure
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          }
        }}
      >
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={labels.placeholder} />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!draft.trim()}>
          {labels.send}
        </button>
      </form>
    </div>
  );
}

