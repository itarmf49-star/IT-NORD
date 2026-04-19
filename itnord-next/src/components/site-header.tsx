import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { defaultLocale, t } from "@/lib/i18n";

type SiteHeaderProps = {
  locale?: Locale;
};

export function SiteHeader({ locale = defaultLocale }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="container row-between">
        <Link href={`/${locale}`} className="brand" aria-label="IT NORD home page">
          IT NORD
        </Link>
        <nav aria-label="Main navigation" className="nav">
          <ul className="nav-list">
            <li>
              <Link href={`/${locale}`} className="nav-link">
                {t(locale, "navHome")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/projects`} className="nav-link">
                {t(locale, "navProjects")}
              </Link>
            </li>
          </ul>
          <LinkButton href="#contact" size="sm">
            {t(locale, "navQuote")}
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
