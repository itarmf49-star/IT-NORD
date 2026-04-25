"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";
import { defaultLocale, t, type Locale } from "@/lib/i18n";

type ContactCtaProps = {
  locale?: Locale;
};

export function ContactCta({ locale = defaultLocale }: ContactCtaProps) {
  return (
    <section id="contact" className="section">
      <Container>
        <motion.div
          className="cta-glass"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div>
            <p className="eyebrow">{t(locale, "ctaEyebrow")}</p>
            <h2 className="h2">{t(locale, "ctaTitle")}</h2>
            <p className="muted">{t(locale, "ctaDescription")}</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-primary btn-md" href={`tel:${siteConfig.phone}`}>
              {t(locale, "ctaCallNow")}
            </a>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard?.writeText(siteConfig.email).catch(() => undefined);
              }}
              aria-label={t(locale, "ctaCopyEmail")}
            >
              {t(locale, "ctaCopyEmail")}
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

