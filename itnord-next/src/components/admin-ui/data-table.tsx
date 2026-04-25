"use client";

import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  empty,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  empty: string;
}) {
  return (
    <div className="rounded-xl bg-[#111827] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-white/[0.02]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left font-extrabold tracking-wide text-white/70 px-5 py-3 border-b border-white/10">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3 border-b border-white/5 text-white/85 align-top">
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-white/55">
                  {empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

