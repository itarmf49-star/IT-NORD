import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-extrabold tracking-tight text-white">{t(locale, "adminSettings")}</h1>
      <p className="text-white/60">Settings UI coming soon.</p>
    </section>
  );
}

