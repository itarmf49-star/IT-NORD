"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type Ring = {
  label: string;
  value: number; // 0..100
  tone: "gold" | "blue" | "red";
};

function toneColor(tone: Ring["tone"]) {
  if (tone === "blue") return "rgba(51, 184, 255, 0.95)";
  if (tone === "red") return "rgba(255, 120, 120, 0.95)";
  return "rgba(212, 175, 55, 0.95)";
}

export function ActivityRings() {
  const rings = useMemo<Ring[]>(
    () => [
      { label: "Active installs", value: 84, tone: "gold" },
      { label: "Cameras online", value: 92, tone: "blue" },
      { label: "Alerts resolved", value: 76, tone: "red" },
    ],
    [],
  );

  return (
    <div className="activity-rings" aria-label="Activity information">
      {rings.map((r) => (
        <motion.div
          key={r.label}
          className="activity-ring"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div
            className="activity-ring-circle"
            style={{
              background: `conic-gradient(${toneColor(r.tone)} ${r.value * 3.6}deg, rgba(255,255,255,0.10) 0deg)`,
            }}
            aria-hidden
          >
            <motion.div
              className="activity-ring-pulse"
              animate={{ opacity: [0.35, 0.12, 0.35], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: `0 0 0 1px ${toneColor(r.tone)} inset` }}
            />
            <div className="activity-ring-center">
              <div className="activity-ring-value">{r.value}%</div>
              <div className="activity-ring-label">{r.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

