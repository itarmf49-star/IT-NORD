"use client";

import { useMemo, useState } from "react";
import type { PortalInvoice, PortalInvoiceStatus } from "@/lib/portal-data";

type InvoicesTableProps = {
  invoices: PortalInvoice[];
  labels: {
    filterAll: string;
    filterPaid: string;
    filterPending: string;
    filterOverdue: string;
    id: string;
    date: string;
    status: string;
    amount: string;
    download: string;
    empty: string;
  };
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function InvoicesTable({ invoices, labels }: InvoicesTableProps) {
  const [filter, setFilter] = useState<PortalInvoiceStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return invoices;
    return invoices.filter((i) => i.status === filter);
  }, [filter, invoices]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div className="portal-filters" role="tablist" aria-label={labels.status}>
          <button type="button" className={["pill", filter === "ALL" ? "pill-active" : ""].join(" ")} onClick={() => setFilter("ALL")}>
            {labels.filterAll}
          </button>
          <button type="button" className={["pill", filter === "PAID" ? "pill-active" : ""].join(" ")} onClick={() => setFilter("PAID")}>
            {labels.filterPaid}
          </button>
          <button type="button" className={["pill", filter === "PENDING" ? "pill-active" : ""].join(" ")} onClick={() => setFilter("PENDING")}>
            {labels.filterPending}
          </button>
          <button type="button" className={["pill", filter === "OVERDUE" ? "pill-active" : ""].join(" ")} onClick={() => setFilter("OVERDUE")}>
            {labels.filterOverdue}
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table portal-table">
          <thead>
            <tr>
              <th>{labels.id}</th>
              <th>{labels.date}</th>
              <th>{labels.status}</th>
              <th>{labels.amount}</th>
              <th>{labels.download}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.date}</td>
                <td>
                  <span className={`status-badge status-${inv.status.toLowerCase()}`}>{inv.status}</span>
                </td>
                <td>{formatMoney(inv.amount, inv.currency)}</td>
                <td>
                  <a className="inline-link" href={`/api/portal/invoices/${inv.id}/pdf`}>
                    {labels.download}
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {labels.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

