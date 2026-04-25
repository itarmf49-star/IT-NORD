import Link from "next/link";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminMessagesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMessagesPage({ params }: AdminMessagesPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let rows: {
    id: string;
    name: string;
    email: string | null;
    subject: string | null;
    isRead: boolean;
    createdAt: Date;
  }[] = [];

  try {
    rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, subject: true, isRead: true, createdAt: true },
    });
  } catch {
    rows = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminContactMessages")}</h1>
      <p className="muted">{t(locale, "adminInboundInquiries")}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t(locale, "adminFrom")}</th>
              <th>{t(locale, "adminSubject")}</th>
              <th>{t(locale, "adminRead")}</th>
              <th>{t(locale, "adminDate")}</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.name}
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {m.email ?? "-"}
                  </div>
                </td>
                <td>{m.subject ?? "-"}</td>
                <td>{m.isRead ? t(locale, "adminYes") : t(locale, "adminNo")}</td>
                <td>{m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td>
                  <Link className="inline-link" href={`/${locale}/admin/messages/${m.id}`}>
                    View / Reply
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {t(locale, "adminNoMessages")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
