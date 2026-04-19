import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminInvoicesPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let rows: {
    id: string;
    status: string;
    total: number;
    currency: string;
    createdAt: Date;
    user: { email: string | null; name: string | null };
  }[] = [];

  try {
    rows = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    });
  } catch {
    rows = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Invoices</h1>
      <p className="muted">Customer billing records.</p>

      <p className="muted" style={{ fontSize: "0.9rem" }}>
        Staff can create invoices via{" "}
        <code style={{ color: "rgba(212,175,55,0.95)" }}>POST /api/admin/invoices</code> (JSON body). Customer portal:{" "}
        <Link className="inline-link" href={`/${locale}/portal/invoices`}>
          /{locale}/portal/invoices
        </Link>
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => (
              <tr key={inv.id}>
                <td>
                  {inv.user.name ?? "—"}
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {inv.user.email ?? "—"}
                  </div>
                </td>
                <td>{inv.status}</td>
                <td>
                  {inv.total} {inv.currency}
                </td>
                <td>{inv.createdAt.toISOString().slice(0, 10)}</td>
                <td>
                  <Link className="inline-link" href={`/api/invoices/${inv.id}/pdf`}>
                    Download
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No invoices yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
