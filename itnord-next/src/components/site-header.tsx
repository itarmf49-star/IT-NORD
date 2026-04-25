"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultLocale, isLocale, localePath, locales, t, type Locale } from "@/lib/i18n";

type SiteHeaderProps = { locale?: Locale };

function stripLocaleFromPathname(pathname: string) {
  // pathname examples: "/en", "/en/projects", "/fr#hash" (hash not included), "/"
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0];
  if (isLocale(first)) {
    const rest = parts.slice(1).join("/");
    return rest.length ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function SiteHeader({ locale = defaultLocale }: SiteHeaderProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onHash() {
      setHash(window.location.hash || "");
    }
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    // close mobile menu on route change
    startTransition(() => setOpen(false));
  }, [pathname]);

  const isRtl = locale === "ar";
  const basePath = useMemo(() => stripLocaleFromPathname(pathname), [pathname]);

  const navLinks = useMemo(
    () => [
      { key: "navHome" as const, href: localePath(locale, "/") },
      { key: "navProjects" as const, href: localePath(locale, "/projects") },
      { key: "navServices" as const, href: localePath(locale, "/#services") },
      { key: "navContactLink" as const, href: localePath(locale, "/contact") },
    ],
    [locale],
  );

  function isActiveLink(href: string) {
    // Normalize locale-aware href into base path + optional hash
    const raw = href.replace(/^\/(en|fr|ar)(?=\/|$)/, "") || "/";
    const [pathPart, hashPart] = raw.split("#");
    const path = pathPart?.length ? pathPart : "/";

    if (path === "/") {
      if (hashPart) return basePath === "/" && hash === `#${hashPart}`;
      return basePath === "/";
    }
    if (hashPart) return basePath === path && hash === `#${hashPart}`;
    return basePath === path || basePath.startsWith(`${path}/`);
  }

  function onSwitchLocale(next: Locale) {
    const query = searchParams?.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const nextHref = `${localePath(next, basePath)}${query ? `?${query}` : ""}${hash}`;
    router.push(nextHref);
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-[#0B0F14]/80 backdrop-blur-md border-b border-white/10" : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={["flex h-16 items-center justify-between", isRtl ? "flex-row-reverse" : ""].join(" ")}>
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-baseline gap-0.5 font-extrabold tracking-tight"
            aria-label="MauriTech home"
          >
            <span className="text-white">Mauri</span>
            <span className="text-[#F5C542]">Tech</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <div className={["flex items-center gap-6", isRtl ? "flex-row-reverse" : ""].join(" ")}>
              {navLinks.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  className={[
                    "text-sm font-semibold transition-colors pb-1 border-b-2",
                    isActiveLink(l.href)
                      ? "text-[#F5C542] border-[#F5C542]/70"
                      : "text-white/80 border-transparent hover:text-white hover:border-white/20",
                  ].join(" ")}
                >
                  {t(locale, l.key)}
                </Link>
              ))}
            </div>

            {/* Language switcher */}
            <div className={["flex items-center gap-2", isRtl ? "flex-row-reverse" : ""].join(" ")}>
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onSwitchLocale(loc)}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-extrabold tracking-widest border transition-colors",
                    loc === locale
                      ? "border-[#F5C542]/70 text-[#F5C542] bg-white/5"
                      : "border-white/15 text-white/75 hover:text-white hover:border-white/30",
                  ].join(" ")}
                  aria-current={loc === locale}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={localePath(locale, "/contact")}
              className="inline-flex items-center justify-center rounded-xl bg-[#F5C542] px-4 py-2 text-sm font-bold text-black hover:bg-[#FFD25A] transition-colors"
            >
              {t(locale, "navQuote")}
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className={["md:hidden flex items-center gap-2", isRtl ? "flex-row-reverse" : ""].join(" ")}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="sr-only">Menu</span>
              <div className="grid gap-1">
                <span className={["h-0.5 w-5 bg-current transition", open ? "translate-y-1.5 rotate-45" : ""].join(" ")} />
                <span className={["h-0.5 w-5 bg-current transition", open ? "opacity-0" : ""].join(" ")} />
                <span className={["h-0.5 w-5 bg-current transition", open ? "-translate-y-1.5 -rotate-45" : ""].join(" ")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={[
          "md:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
          <div className="rounded-2xl border border-white/10 bg-[#0B0F14]/85 backdrop-blur-md p-4">
            <div className="grid gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition flex items-center justify-between",
                    isActiveLink(l.href) ? "text-[#F5C542] bg-white/5" : "text-white/85 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  {t(locale, l.key)}
                  {isActiveLink(l.href) ? <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden /> : null}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div className={["flex items-center gap-2", isRtl ? "flex-row-reverse" : ""].join(" ")}>
                {locales.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onSwitchLocale(loc)}
                    className={[
                      "px-3 py-1 rounded-full text-xs font-extrabold tracking-widest border transition-colors",
                      loc === locale
                        ? "border-[#F5C542]/70 text-[#F5C542] bg-white/5"
                        : "border-white/15 text-white/75 hover:text-white hover:border-white/30",
                    ].join(" ")}
                    aria-current={loc === locale}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link
                href={localePath(locale, "/contact")}
                className="inline-flex items-center justify-center rounded-xl bg-[#F5C542] px-4 py-2 text-sm font-bold text-black hover:bg-[#FFD25A] transition-colors"
              >
                {t(locale, "navQuote")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
