import { siteConfig } from "@/lib/content";
import { defaultLocale, t, type Locale } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/config";

type SiteFooterProps = {
  locale?: Locale;
};

export function SiteFooter({ locale = defaultLocale }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h2 className="footer-title">{BRAND_NAME}</h2>
          <p>{t(locale, "footerTagline")}</p>
        </div>
        <div>
          <h3 className="footer-heading">{t(locale, "footerContact")}</h3>
          <ul className="footer-list">
            <li>
              <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
