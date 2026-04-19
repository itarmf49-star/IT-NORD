"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="hero hero-premium">
      <Container className="hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="eyebrow">Telecom • Digital Services • Infrastructure</p>
          <h1 className="h1">
            IT NORD
            <span className="h1-accent"> builds premium connectivity</span> and secure digital platforms.
          </h1>
          <p className="lead">
            Modern network engineering, surveillance, smart buildings, and enterprise deployments — delivered with
            corporate-grade execution.
          </p>
          <div className="hero-actions">
            <LinkButton href="/projects">View showcase</LinkButton>
            <LinkButton href="#contact" variant="ghost">
              Contact sales
            </LinkButton>
          </div>
        </motion.div>

        <motion.div
          className="hero-glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          aria-hidden
        >
          <div className="hero-glass-inner">
            <div className="hero-metric">
              <p className="metric-label">Uptime-first design</p>
              <p className="metric-value">99.9%</p>
            </div>
            <div className="hero-metric">
              <p className="metric-label">Security hardening</p>
              <p className="metric-value">CSP / HSTS</p>
            </div>
            <div className="hero-metric">
              <p className="metric-label">Performance</p>
              <p className="metric-value">WebP / Lazy</p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

