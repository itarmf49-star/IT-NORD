"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type SliderItem = {
  id: string;
  title: string;
  description: string;
  image: string;
};

type AutoSliderProps = {
  items: SliderItem[];
  intervalMs?: number;
  ariaLabel?: string;
  eyebrowLabel?: string;
  navAriaLabel?: string;
};

function wrapIndex(value: number, length: number) {
  const mod = value % length;
  return mod < 0 ? mod + length : mod;
}

export function AutoSlider({
  items,
  intervalMs = 4500,
  ariaLabel = "Showcase slider",
  eyebrowLabel = "Showcase",
  navAriaLabel = "Slider navigation",
}: AutoSliderProps) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [index, setIndex] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const id = setInterval(() => {
      if (!isPausedRef.current) setIndex((i) => wrapIndex(i + 1, safeItems.length));
    }, intervalMs);
    return () => clearInterval(id);
  }, [safeItems.length, intervalMs]);

  const active = safeItems[wrapIndex(index, safeItems.length)];

  if (!active) return null;

  return (
    <section className="container section" aria-label={ariaLabel}>
      <div
        className="slider"
        onPointerEnter={() => {
          isPausedRef.current = true;
        }}
        onPointerLeave={() => {
          isPausedRef.current = false;
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="slider-slide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            drag={safeItems.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              const threshold = 60;
              if (info.offset.x > threshold) setIndex((i) => wrapIndex(i - 1, safeItems.length));
              if (info.offset.x < -threshold) setIndex((i) => wrapIndex(i + 1, safeItems.length));
            }}
          >
            <div className="slider-media">
              <Image
                src={active.image}
                alt={active.title}
                fill
                sizes="(max-width: 900px) 100vw, 1120px"
                priority
              />
              <div className="slider-glow" aria-hidden />
            </div>
            <div className="slider-content">
              <p className="eyebrow">{eyebrowLabel}</p>
              <h2 className="h2">{active.title}</h2>
              <p className="muted">{active.description}</p>
              <div className="slider-dots" role="tablist" aria-label={navAriaLabel}>
                {safeItems.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={["dot", i === wrapIndex(index, safeItems.length) ? "dot-active" : ""].join(" ")}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}: ${item.title}`}
                    aria-current={i === wrapIndex(index, safeItems.length)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

