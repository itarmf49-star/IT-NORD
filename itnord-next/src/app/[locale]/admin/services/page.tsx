import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { AdminServicesEditor } from "@/components/admin/services-editor";

export const dynamic = "force-dynamic";

type AdminServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminServicesPage({ params }: AdminServicesPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminServicesPricing")}</h1>
      <p className="muted">{t(locale, "adminCatalogActiveRules")}</p>
      <AdminServicesEditor />
    </section>
  );
}
