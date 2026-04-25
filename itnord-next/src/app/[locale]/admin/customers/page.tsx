import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AdminCustomersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCustomersPage({ params }: AdminCustomersPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  let customers: {
    id: string;
    email: string | null;
    name: string | null;
    phone: string | null;
    info: string | null;
    createdAt: Date;
  }[] = [];

  try {
    customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, email: true, name: true, phone: true, info: true, createdAt: true },
    });
  } catch {
    customers = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminCustomers")}</h1>
      <p className="muted">{t(locale, "adminRegisteredCustomers")}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t(locale, "authName")}</th>
              <th>{t(locale, "authEmail")}</th>
              <th>Phone</th>
              <th>Info</th>
              <th>{t(locale, "adminCreated")}</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name ?? "-"}</td>
                <td>{c.email ?? "-"}</td>
                <td>{c.phone ?? "-"}</td>
                <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.info ?? "-"}
                </td>
                <td>{c.createdAt.toISOString().slice(0, 10)}</td>
                <td>
                  <Link className="inline-link" href={`/${locale}/admin/customers/${c.id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  {t(locale, "adminNoCustomers")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
