"use client";

import { signOut } from "next-auth/react";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

type PortalTopbarProps = {
  locale: Locale;
  email: string | null;
  title: string;
  logoutLabel: string;
};

export function PortalTopbar({ locale, email, title, logoutLabel }: PortalTopbarProps) {
  return (
    <header className="portal-topbar">
      <div className="portal-topbar-left">
        <h1 className="portal-topbar-title">{title}</h1>
      </div>
      <div className="portal-topbar-right">
        <div className="portal-user">
          <div className="portal-user-dot" aria-hidden />
          <span className="portal-user-email">{email ?? "-"}</span>
        </div>
        <LanguageSwitcher currentLocale={locale} />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            void signOut({ callbackUrl: `/${locale}/login` });
          }}
        >
          {logoutLabel}
        </button>
      </div>
    </header>
  );
}

