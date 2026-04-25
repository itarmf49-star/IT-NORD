"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { CameraWave } from "@/components/sections/home/camera-wave";
import { ActivityRings } from "@/components/sections/home/activity-rings";
import { EcommerceProductsButton } from "@/components/sections/home/ecommerce-products";
import { BRAND_NAME } from "@/lib/config";

type HomeHeroProps = {
  locale: Locale;
};

export function HomeHero({ locale }: HomeHeroProps) {
  return (
    <section className="hero hero-premium">
      <Container className="hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="eyebrow">{t(locale, "heroEyebrow")}</p>
          <h1 className="h1">
            {BRAND_NAME}
            <span className="h1-accent">{t(locale, "heroTitleAccent")}</span> and secure digital platforms.
          </h1>
          <p className="lead">{t(locale, "heroLead")}</p>
          <div className="hero-actions">
            <LinkButton href={`/${locale}/projects`}>{t(locale, "heroViewShowcase")}</LinkButton>
            <LinkButton href="#contact" variant="ghost">
              {t(locale, "heroContactSales")}
            </LinkButton>
            <EcommerceProductsButton />
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <ActivityRings />
          </div>
        </motion.div>

        <motion.div
          className="hero-glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          aria-hidden
        >
          <div className="hero-image-wrap">
            <Image
              src={`/images/hero-${locale}.svg`}
              alt={t(locale, "heroImageAlt")}
              width={640}
              height={360}
              style={{ width: "100%", height: "auto", borderBottom: "1px solid rgba(212, 175, 55, 0.12)" }}
              priority
            />
            <div className="hero-logo" aria-hidden>
              <div className="hero-logo-badge">
                <span className="hero-logo-mark">Mauri</span>
                <span className="hero-logo-word">Tech</span>
              </div>
            </div>
          </div>
          <div className="hero-glass-inner">
            <div className="hero-metric">
              <p className="metric-label">{t(locale, "heroMetricUptime")}</p>
              <p className="metric-value">99.9%</p>
            </div>
            <div className="hero-metric">
              <p className="metric-label">{t(locale, "heroMetricSecurity")}</p>
              <p className="metric-value">CSP / HSTS</p>
            </div>
            <div className="hero-metric">
              <p className="metric-label">{t(locale, "heroMetricPerformance")}</p>
              <p className="metric-value">WebP / Lazy</p>
            </div>
          </div>
        </motion.div>
      </Container>

      <CameraWave />
    </section>
  );
}