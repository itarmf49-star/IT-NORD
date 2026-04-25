"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { defaultLocale, isLocale, t } from "@/lib/i18n";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const rawLocale = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="section">
      <Container className="auth-wrap">
        <div className="auth-card">
          <h1 className="h1">{t(locale, "authRegisterTitle")}</h1>
          <p className="muted">{t(locale, "authRegisterDescription")}</p>

          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name, email, password }),
              });
              setLoading(false);
              if (!res.ok) {
                const body = await res.json().catch(() => null);
                setError((body as { error?: string } | null)?.error ?? t(locale, "authRegistrationFailed"));
                return;
              }
              router.push(`/${locale}/login`);
            }}
          >
            <label className="field">
              <span className="field-label">{t(locale, "authName")}</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span className="field-label">{t(locale, "authEmail")}</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">{t(locale, "authPassword")}</span>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? t(locale, "authCreating") : t(locale, "authCreateAccount")}
            </Button>
          </form>

          <p className="muted" style={{ marginTop: "1rem" }}>
            {t(locale, "authAlreadyHaveAccount")}{" "}
            <Link className="inline-link" href={`/${locale}/login`}>
              {t(locale, "authSignIn")}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
