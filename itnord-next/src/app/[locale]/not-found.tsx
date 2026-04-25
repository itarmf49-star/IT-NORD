import Link from "next/link";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

type NotFoundProps = {
  params?: { locale?: string };
};

export default function LocaleNotFound({ params }: NotFoundProps) {
  const raw = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">{t(locale, "notFoundTitle")}</h1>
      <p className="text-sm opacity-80">{t(locale, "notFoundDescription")}</p>
      <Link className="rounded bg-black px-4 py-2 text-white" href={`/${locale}`}>
        {t(locale, "notFoundBackHome")}
      </Link>
    </main>
  );
}
