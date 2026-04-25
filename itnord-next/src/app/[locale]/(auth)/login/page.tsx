"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { defaultLocale, isLocale, t } from "@/lib/i18n";

export default function LoginPage() {
  const params = useParams();
  const search = useSearchParams();
  const rawLocale = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const next = search?.get("next") ?? `/${locale}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="section">
      <Container className="auth-wrap">
        <div className="auth-card">
          <h1 className="h1">{t(locale, "authSignInTitle")}</h1>
          <p className="muted">{t(locale, "authSignInDescription")}</p>

          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl: next,
              });
              setLoading(false);
              if (res?.error) setError(t(locale, "authInvalidCredentials"));
              if (res?.ok) window.location.href = res.url ?? next;
            }}
          >
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading ? t(locale, "authSigningIn") : t(locale, "authSignIn")}
            </Button>
          </form>

          <p className="muted" style={{ marginTop: "1rem" }}>
            {t(locale, "authNewHere")}{" "}
            <Link className="inline-link" href={`/${locale}/register`}>
              {t(locale, "authCreateAccount")}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

