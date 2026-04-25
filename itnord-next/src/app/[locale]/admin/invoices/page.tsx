import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { AdminPortalInvoices } from "@/components/admin/portal-invoices";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminInvoicesPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let customers: { id: string; email: string | null; name: string | null }[] = [];
  let invoices: {
    id: string;
    amount: number;
    status: string;
    issuedAt: Date;
    account: { userId: string; company: string | null };
  }[] = [];

  try {
    const [c, inv] = await Promise.all([
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { id: true, email: true, name: true },
      }),
      prisma.invoice.findMany({
        orderBy: { issuedAt: "desc" },
        take: 200,
        include: { account: true },
      }),
    ]);
    customers = c;
    invoices = inv;
  } catch {
    customers = [];
    invoices = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminInvoices")}</h1>
      <p className="muted">Create and update portal invoices that customers can see inside their interface.</p>

      <AdminPortalInvoices locale={locale} initialCustomers={customers} initialInvoices={invoices} />
    </section>
  );
}
