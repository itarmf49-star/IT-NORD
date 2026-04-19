import { siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h2 className="footer-title">IT NORD</h2>
          <p>Secure and modern technology deployments for businesses and institutions.</p>
        </div>
        <div>
          <h3 className="footer-heading">Contact</h3>
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
