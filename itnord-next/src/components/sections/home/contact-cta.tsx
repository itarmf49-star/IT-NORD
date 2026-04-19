"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";

export function ContactCta() {
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
            <p className="eyebrow">Let’s build your platform</p>
            <h2 className="h2">Request a professional installation or consultation.</h2>
            <p className="muted">
              Share your needs and our team will respond with a clear scope, timeline, and recommendations.
            </p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-primary btn-md" href={`tel:${siteConfig.phone}`}>
              Call now
            </a>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard?.writeText(siteConfig.email).catch(() => undefined);
              }}
              aria-label="Copy email to clipboard"
            >
              Copy email
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

