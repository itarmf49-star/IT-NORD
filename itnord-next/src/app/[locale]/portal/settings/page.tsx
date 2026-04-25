import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalSettingsPage({ params }: SettingsPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <section className="portal-page">
      <div className="portal-page-head">
        <h2 className="portal-page-title">{t(locale, "portal.settings")}</h2>
        <p className="muted">{t(locale, "portalSettingsHint")}</p>
      </div>
      <div className="portal-card">
        <p className="muted">{t(locale, "portalNoDataHint")}</p>
      </div>
    </section>
  );
}

