import Link from "next/link";
import { defaultLocale, t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">{t(defaultLocale, "notFoundTitle")}</h1>
      <p className="text-sm opacity-80">{t(defaultLocale, "notFoundDescription")}</p>
      <Link className="rounded bg-black px-4 py-2 text-white" href={`/${defaultLocale}`}>
        {t(defaultLocale, "notFoundBackHome")}
      </Link>
    </main>
  );
}
