"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { defaultLocale, t, type Locale } from "@/lib/i18n";

type AiAssistantProps = {
  locale?: Locale;
};

export function AiAssistant({ locale = defaultLocale }: AiAssistantProps) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="ai-dock">
      <button type="button" className="ai-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {t(locale, "aiToggle")}
      </button>

      {open ? (
        <div className="ai-panel" role="dialog" aria-label={t(locale, "aiDialogLabel")}>
          <div className="ai-header">
            <div>
              <p className="ai-title">{t(locale, "aiTitle")}</p>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {t(locale, "aiSubtitle")}
              </p>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label={t(locale, "aiDialogLabel")}>
              ×
            </button>
          </div>

          {status === "unauthenticated" ? (
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              {t(locale, "aiSignInHint")}
            </p>
          ) : null}

          <label className="field">
            <span className="field-label">{t(locale, "aiQuestionLabel")}</span>
            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={t(locale, "aiQuestionPlaceholder")}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}
          {answer ? (
            <div className="ai-answer">
              <p className="field-label">{t(locale, "aiAnswerLabel")}</p>
              <pre className="ai-answer-pre">{answer}</pre>
            </div>
          ) : null}

          <div className="ai-actions">
            <Button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={async () => {
                setLoading(true);
                setError(null);
                setAnswer("");
                try {
                  const res = await fetch("/api/ai/assist", {
                    method: "POST",
                    headers: { "content-type": "application/json", accept: "text/event-stream" },
                    body: JSON.stringify({ prompt }),
                  });
                  if (!res.ok || !res.body) {
                    setError(t(locale, "aiUnavailable"));
                    setLoading(false);
                    return;
                  }

                  const reader = res.body.getReader();
                  const decoder = new TextDecoder();
                  let buffer = "";
                  let text = "";

                  while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    const parts = buffer.split("\n\n");
                    buffer = parts.pop() ?? "";

                    for (const part of parts) {
                      const line = part
                        .split("\n")
                        .find((l) => l.startsWith("data:"))
                        ?.slice(5)
                        .trim();
                      if (!line) continue;
                      const evt = JSON.parse(line) as { type?: string; value?: string };
                      if (evt.type === "delta" && evt.value) text += evt.value;
                      if (evt.type === "error") throw new Error("stream error");
                    }
                  }

                  setAnswer(text.trim() || null);
                } catch {
                  setError(t(locale, "aiStreamError"));
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? t(locale, "aiThinking") : t(locale, "aiAsk")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
