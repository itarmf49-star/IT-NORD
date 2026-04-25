import { requireStaff } from "@/lib/admin-session";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { AdminShell } from "@/components/admin-ui/admin-shell";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  await requireStaff(locale);

  return <AdminShell locale={locale}>{children}</AdminShell>;
}
