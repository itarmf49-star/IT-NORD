import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { getAccount, getInvoices, getMessages } from "@/lib/portal-data";

export const dynamic = "force-dynamic";

type PortalAccountAuditPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalAccountAuditPage({ params }: PortalAccountAuditPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const email = session?.user?.email ?? null;

  const [account, invoices, messages] = await Promise.all([getAccount(userId, email), getInvoices(), getMessages()]);
  const invoiceCount = invoices.length;
  const messageCount = messages.length;

  return (
    <section className="portal-page">
      <div className="portal-page-head">
        <h2 className="portal-page-title">{t(locale, "portal.account")}</h2>
        <p className="muted">{t(locale, "portalAccountDescription")}</p>
      </div>

      <div className="portal-grid-3">
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalAccountEmail")}</p>
          <strong className="portal-card-big">{email ?? t(locale, "portalNotAvailable")}</strong>
        </div>
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalAccountStatus")}</p>
          <strong className="portal-card-big">{account.status}</strong>
        </div>
        <div className="portal-card">
          <p className="portal-card-kicker">{t(locale, "portalTotalInvoices")}</p>
          <strong className="portal-card-big">{invoiceCount}</strong>
        </div>
      </div>

      <div className="portal-grid-2">
        <div className="portal-card">
          <h3 className="portal-card-title">{t(locale, "portalChangePassword")}</h3>
          <p className="muted">{t(locale, "portalChangePasswordHint")}</p>
          <div className="portal-actions" style={{ marginTop: "0.75rem" }}>
            <button type="button" className="btn btn-ghost btn-md" disabled>
              {t(locale, "portalChangePassword")}
            </button>
          </div>
        </div>
        <div className="portal-card">
          <h3 className="portal-card-title">{t(locale, "portal.messages")}</h3>
          <p className="muted">
            {t(locale, "portalMessagesToAdmin")}: {messageCount}
          </p>
        </div>
      </div>
    </section>
  );
}
