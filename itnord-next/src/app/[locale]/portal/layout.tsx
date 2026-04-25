import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { PortalTopbar } from "@/components/portal/portal-topbar";

type PortalLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/portal`);
  }

  const links = [
    { href: `/${locale}/portal`, label: t(locale, "portalOverview") },
    { href: `/${locale}/portal/invoices`, label: t(locale, "portalInvoices") },
    { href: `/${locale}/portal/messages`, label: t(locale, "portalMessages") },
    { href: `/${locale}/portal/account`, label: t(locale, "portalAccountAudit") },
    { href: `/${locale}/portal/settings`, label: t(locale, "portalSettings") },
  ];

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar" aria-label={t(locale, "portalBrand")}>
        <div className="portal-brand">
          <Link href={`/${locale}/portal`} className="portal-brand-link">
            {t(locale, "portalBrand")}
          </Link>
        </div>
        <nav className="portal-nav" aria-label={t(locale, "portalBrand")}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="portal-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="portal-main">
        <PortalTopbar
          locale={locale}
          email={session.user.email ?? null}
          title={t(locale, "portalDashboardTitle")}
          logoutLabel={t(locale, "portalLogout")}
        />
        <div className="portal-content">{children}</div>
      </div>
    </div>
  );
}
