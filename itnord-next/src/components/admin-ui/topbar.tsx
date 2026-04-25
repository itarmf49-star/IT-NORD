"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, "") || "/";
}

export function AdminTopbar({
  locale,
  onOpenSidebar,
}: {
  locale: Locale;
  onOpenSidebar: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const base = stripLocale(pathname);

  const title = useMemo(() => {
    if (base === "/admin") return t(locale, "adminOverview");
    if (base.startsWith("/admin/projects")) return t(locale, "adminProjects");
    if (base.startsWith("/admin/messages")) return t(locale, "adminMessages");
    if (base.startsWith("/admin/invoices")) return t(locale, "adminInvoices");
    if (base.startsWith("/admin/customers")) return t(locale, "adminCustomers");
    if (base.startsWith("/admin/settings")) return t(locale, "adminSettings");
    return t(locale, "adminOverview");
  }, [base, locale]);

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F14]/75 backdrop-blur-md border-b border-white/10">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-white font-extrabold tracking-tight">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 grid place-items-center text-white font-extrabold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

