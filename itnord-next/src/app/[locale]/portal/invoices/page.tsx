import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { getInvoices } from "@/lib/portal-data";
import { InvoicesTable } from "@/components/portal/invoices-table";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalInvoicesPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/portal/invoices`);
  }

  const invoices = await getInvoices();

  return (
    <section className="portal-page">
      <div className="portal-page-head">
        <h2 className="portal-page-title">{t(locale, "portal.invoices")}</h2>
        <p className="muted">{t(locale, "portalInvoiceHint")}</p>
      </div>
      <InvoicesTable
        invoices={invoices}
        labels={{
          filterAll: t(locale, "portalFilterAll"),
          filterPaid: t(locale, "portalFilterPaid"),
          filterPending: t(locale, "portalFilterPending"),
          filterOverdue: t(locale, "portalFilterOverdue"),
          id: t(locale, "portalInvoiceId"),
          date: t(locale, "portalInvoiceDate"),
          status: t(locale, "portal.status"),
          amount: t(locale, "portalInvoiceAmount"),
          download: t(locale, "portal.download"),
          empty: t(locale, "portal.noData"),
        }}
      />
    </section>
  );
}
