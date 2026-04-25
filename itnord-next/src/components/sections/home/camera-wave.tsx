"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type CameraCard = {
  title: string;
  subtitle: string;
};

export function CameraWave() {
  const cards = useMemo<CameraCard[]>(
    () => [
      { title: "PTZ Camera", subtitle: "Wide area tracking" },
      { title: "Dome Camera", subtitle: "Indoor discreet" },
      { title: "Bullet Camera", subtitle: "Outdoor long-range" },
      { title: "Thermal Camera", subtitle: "Heat detection" },
      { title: "NVR Setup", subtitle: "Central recording" },
      { title: "Access Control", subtitle: "Door + badge system" },
    ],
    [],
  );

  const strip = [...cards, ...cards];

  return (
    <div className="camera-wave" aria-label="Camera setups wave">
      <motion.div
        className="camera-wave-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {strip.map((c, idx) => (
          <div key={`${c.title}-${idx}`} className="camera-wave-card">
            <div className="camera-wave-dot" aria-hidden />
            <div>
              <div className="camera-wave-title">{c.title}</div>
              <div className="camera-wave-sub">{c.subtitle}</div>
            </div>
          </div>
        ))}
      </motion.div>
      <div className="camera-wave-fade camera-wave-fade-left" aria-hidden />
      <div className="camera-wave-fade camera-wave-fade-right" aria-hidden />
    </div>
  );
}

