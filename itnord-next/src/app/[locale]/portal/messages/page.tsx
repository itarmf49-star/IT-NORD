"use client";

import { useParams } from "next/navigation";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { MessagesThread } from "@/components/portal/messages-thread";
import { getMessages } from "@/lib/portal-data";
import { useEffect, useState } from "react";

type PortalMessage = {
  id: string;
  body: string;
  createdAt: string;
  threadId: string;
  from: "CLIENT" | "ADMIN";
};

export default function PortalMessagesPage() {
  const params = useParams();
  const rawLocale = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const [messages, setMessages] = useState<PortalMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getMessages().then((msgs) => {
      if (cancelled) return;
      setMessages(msgs as unknown as PortalMessage[]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="portal-page">
      <div className="portal-page-head">
        <h2 className="portal-page-title">{t(locale, "portal.messages")}</h2>
        <p className="muted">{t(locale, "portalMessagesDescription")}</p>
      </div>

      <MessagesThread
        initial={messages}
        labels={{
          title: t(locale, "portalThreadTitle"),
          empty: t(locale, "portal.noData"),
          placeholder: t(locale, "portalMessagePlaceholder"),
          send: t(locale, "portalSend"),
        }}
      />
    </section>
  );
}
