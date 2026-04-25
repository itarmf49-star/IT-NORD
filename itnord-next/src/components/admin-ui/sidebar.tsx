"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Receipt,
  Users,
  Settings,
  X,
} from "lucide-react";
import { localePath, t, type Locale } from "@/lib/i18n";

type Item = {
  key: string;
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, "") || "/";
}

export function AdminSidebar({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const base = stripLocale(pathname);

  const items: Item[] = [
    { key: "dashboard", href: localePath(locale, "/admin"), label: t(locale, "adminOverview"), Icon: LayoutDashboard },
    { key: "projects", href: localePath(locale, "/admin/projects"), label: t(locale, "adminProjects"), Icon: FolderKanban },
    { key: "messages", href: localePath(locale, "/admin/messages"), label: t(locale, "adminMessages"), Icon: MessageSquare },
    { key: "invoices", href: localePath(locale, "/admin/invoices"), label: t(locale, "adminInvoices"), Icon: Receipt },
    { key: "customers", href: localePath(locale, "/admin/customers"), label: t(locale, "adminCustomers"), Icon: Users },
    { key: "settings", href: localePath(locale, "/admin/settings"), label: t(locale, "adminSettings"), Icon: Settings },
  ];

  function isActive(href: string) {
    const h = stripLocale(href);
    if (h === "/admin") return base === "/admin";
    return base === h || base.startsWith(`${h}/`);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={[
          "fixed md:sticky top-0 left-0 z-50 md:z-auto h-dvh md:h-screen w-[280px] shrink-0",
          "bg-[#0B0F14] border-r border-white/10",
          "transform transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <div className="font-extrabold tracking-tight">
            <span className="text-white">Mauri</span>
            <span className="text-[#F5C542]">Tech</span>
            <span className="text-white/60 font-semibold"> Admin</span>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 grid gap-1">
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.key}
                href={it.href}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition",
                  active
                    ? "bg-white/5 border border-[#F5C542]/25 text-[#F5C542]"
                    : "border border-transparent text-white/75 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                <it.Icon className={["h-5 w-5", active ? "text-[#F5C542]" : "text-white/60 group-hover:text-white"].join(" ")} />
                <span className="text-sm">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

