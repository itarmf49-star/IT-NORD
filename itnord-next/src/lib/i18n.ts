export type Locale = "en" | "fr" | "ar";

export const locales: Locale[] = ["en", "fr", "ar"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import ar from "../../messages/ar.json";

type Messages = typeof en;
const dict: Record<Locale, Messages> = { en, fr, ar };

export function getMessages(locale: Locale): Messages {
  return dict[locale] ?? dict.en;
}

export function t(
  locale: Locale,
  key: keyof Messages,
  vars?: Record<string, string | number | null | undefined>,
) {
  const messages = getMessages(locale);
  const raw = (messages[key] ?? dict.en[key]) as unknown as string;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v == null ? "" : String(v);
  });
}

export function localePath(locale: Locale, path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

