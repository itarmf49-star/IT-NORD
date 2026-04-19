"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyPoint = { day: string; views: number };

export function AnalyticsChart({ daily }: { daily: DailyPoint[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(212,175,55,0.12)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(11,15,20,0.95)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.92)",
            }}
          />
          <Bar dataKey="views" fill="rgba(51,184,255,0.85)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
