import Link from "next/link";
import { requireStaff } from "@/lib/admin-session";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  await requireStaff(locale);

  const links = [
    { href: `/${locale}/admin`, label: "Overview" },
    { href: `/${locale}/admin/customers`, label: "Customers" },
    { href: `/${locale}/admin/messages`, label: "Messages" },
    { href: `/${locale}/admin/projects`, label: "Projects (CMS)" },
    { href: `/${locale}/admin/services`, label: "Services" },
    { href: `/${locale}/admin/invoices`, label: "Invoices" },
    { href: `/${locale}/admin/analytics`, label: "Analytics" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">IT NORD Admin</div>
        <nav className="admin-nav" aria-label="Admin">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="admin-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
