import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { headers } from "next/headers";

type PortalPageProps = {
  params: Promise<{ locale: string }>;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "";
  return `${proto}://${host}`;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  await getServerSession(authOptions);

  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/portal/dashboard`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  const data = (await res.json()) as {
    totalInvoices: number;
    pendingInvoices: number;
    paidInvoices: number;
    recentInvoices: { id: string; amount: number; status: string; issuedAt: string }[];
    lastMessage: { content: string; createdAt: string; isAdmin: boolean } | null;
  };

  return (
    <section className="portal-dashboard">
      <div className="portal-grid-3">
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalAccountStatus")}</p>
          <strong className="portal-card-big">{t(locale, "portalOverview")}</strong>
          <p className="muted">{t(locale, "portalWelcome")}</p>
        </div>
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalInvoices")}</p>
          <strong className="portal-card-big">{data.totalInvoices}</strong>
          <p className="muted">
            {t(locale, "portalInvoices")}: {data.totalInvoices} · {t(locale, "portalFilterPaid")}: {data.paidInvoices} ·{" "}
            {t(locale, "portalFilterPending")}: {data.pendingInvoices}
          </p>
        </div>
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalQuickActions")}</p>
          <div className="portal-actions">
            <Link className="btn btn-primary btn-md" href={`/${locale}/portal/invoices`}>
              {t(locale, "portalViewInvoices")}
            </Link>
            <Link className="btn btn-ghost btn-md" href={`/${locale}/portal/messages`}>
              {t(locale, "portalSendMessage")}
            </Link>
            <Link className="btn btn-ghost btn-md" href={`/${locale}/portal/invoices`}>
              {t(locale, "portalDownloadFiles")}
            </Link>
          </div>
        </div>
      </div>

      <div className="portal-grid-2">
        <div className="portal-card">
          <h2 className="portal-card-title">{t(locale, "portalRecentActivity")}</h2>
          {data.recentInvoices.length === 0 ? (
            <p className="muted">{t(locale, "portalNoInvoices")}</p>
          ) : (
            <ul className="portal-list">
              {data.recentInvoices.map((inv) => (
                <li key={inv.id} className="portal-list-item">
                  <span className="portal-list-main">{inv.id}</span>
                  <span className="muted">
                    {inv.status} · {inv.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="portal-card">
          <h2 className="portal-card-title">{t(locale, "portalMessages")}</h2>
          {data.lastMessage ? (
            <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
              {data.lastMessage.content}
            </p>
          ) : (
            <p className="muted">{t(locale, "portalNoMessagesSent")}</p>
          )}
          <Link className="inline-link" href={`/${locale}/portal/account`}>
            {t(locale, "portalManageAccount")}
          </Link>
        </div>
      </div>
    </section>
  );
}
