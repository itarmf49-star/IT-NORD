"use client";

import type { ReactNode } from "react";

export function DashboardCard({
  title,
  value,
  icon,
  sub,
}: {
  title: string;
  value: string;
  icon?: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-[#111827] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-5 hover:border-white/15 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60 font-semibold">{title}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</div>
          {sub ? <div className="mt-1 text-sm text-white/55">{sub}</div> : null}
        </div>
        {icon ? (
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5C542]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

