"use client";

import { motion } from "framer-motion";

type AnnouncementTickerProps = {
  items: string[];
};

export function AnnouncementTicker({ items }: AnnouncementTickerProps) {
  const text = items.join(" • ");

  return (
    <section className="ticker" aria-label="Announcements">
      <div className="ticker-inner">
        <motion.div
          className="ticker-track"
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <span className="ticker-text">{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span className="ticker-text" aria-hidden>
            {text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          </span>
        </motion.div>
      </div>
    </section>
  );
}

