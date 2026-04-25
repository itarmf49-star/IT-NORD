"use client";

import { useMemo, useState } from "react";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

type Customer = { id: string; email: string | null; name: string | null };
type Invoice = {
  id: string;
  amount: number;
  status: string;
  issuedAt: string | Date;
  account: { userId: string; company: string | null };
};

export function AdminPortalInvoices({
  locale,
  initialCustomers,
  initialInvoices,
}: {
  locale: Locale;
  initialCustomers: Customer[];
  initialInvoices: Invoice[];
}) {
  const safeLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  const [error, setError] = useState<string | null>(null);
  const [customers] = useState(initialCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const [userId, setUserId] = useState(customers[0]?.id ?? "");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("pending");
  const [amount, setAmount] = useState<number>(0);
  const [items, setItems] = useState<{ title: string; price: number }[]>([{ title: "Service", price: 0 }]);
  const [requestNote, setRequestNote] = useState("");
  const [saving, setSaving] = useState(false);

  const customerLookup = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  async function createInvoice() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId,
          company: company.trim() || undefined,
          status: status.trim() || undefined,
          amount: Number(amount),
          items: items
            .map((it) => ({ title: it.title.trim(), price: Number(it.price) }))
            .filter((it) => it.title.length > 0 && Number.isFinite(it.price) && it.price >= 0),
          requestNote: requestNote.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = (await res.json()) as Invoice;
      setInvoices((prev) => [created, ...prev]);
      setCompany("");
      setStatus("pending");
      setAmount(0);
      setItems([{ title: "Service", price: 0 }]);
      setRequestNote("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function patchInvoice(id: string, patch: { status?: string; amount?: number }) {
    setError(null);
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = (await res.json()) as { invoice?: Invoice };
    if (json.invoice) setInvoices((prev) => prev.map((i) => (i.id === id ? json.invoice! : i)));
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {error ? (
        <p className="muted" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}

      <div className="admin-card" style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="h2" style={{ fontSize: "1.1rem" }}>
          Create invoice
        </h2>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Customer</span>
            <select className="admin-input" value={userId} onChange={(e) => setUserId(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.name ?? "Customer") + " — " + (c.email ?? "-")}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-label">Company</span>
            <input className="admin-input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Status</span>
            <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="overdue">overdue</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-label">Amount</span>
            <input className="admin-input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </label>
        </div>

        <div className="admin-card" style={{ padding: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <strong>Items</strong>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems((prev) => [...prev, { title: "", price: 0 }])}>
              Add item
            </button>
          </div>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
            {items.map((it, idx) => (
              <div key={idx} className="admin-form-grid">
                <input
                  className="admin-input"
                  value={it.title}
                  onChange={(e) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))}
                  placeholder="Title"
                />
                <input
                  className="admin-input"
                  type="number"
                  value={it.price}
                  onChange={(e) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, price: Number(e.target.value) } : x)))}
                  placeholder="Price"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="admin-field">
          <span className="admin-label">Customer request update (optional)</span>
          <textarea
            className="admin-textarea"
            rows={4}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            placeholder="This note will be posted in the customer portal messages."
          />
        </label>

        <button type="button" className="btn btn-primary btn-md" onClick={() => void createInvoice()} disabled={saving || !userId || amount <= 0}>
          {saving ? "Creating..." : "Create invoice"}
        </button>
      </div>

      <div className="admin-card" style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="h2" style={{ fontSize: "1.1rem" }}>
          Existing invoices
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <PortalInvoiceRow
                  key={inv.id}
                  inv={inv}
                  customer={customerLookup.get(inv.account.userId) ?? null}
                  onSave={(patch) => void patchInvoice(inv.id, patch).catch((e) => setError((e as Error).message))}
                />
              ))}
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    {t(safeLocale, "portal.noData")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PortalInvoiceRow({
  inv,
  customer,
  onSave,
}: {
  inv: Invoice;
  customer: Customer | null;
  onSave: (patch: { status?: string; amount?: number }) => void;
}) {
  const [status, setStatus] = useState(inv.status);
  const [amount, setAmount] = useState(inv.amount);

  return (
    <tr>
      <td>
        {customer?.name ?? "Customer"}
        <div className="muted" style={{ fontSize: "0.85rem" }}>
          {customer?.email ?? inv.account.userId}
        </div>
      </td>
      <td>
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="overdue">overdue</option>
        </select>
      </td>
      <td>
        <input className="admin-input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </td>
      <td>{new Date(inv.issuedAt).toISOString().slice(0, 10)}</td>
      <td>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSave({ status, amount })}>
          Save
        </button>
      </td>
    </tr>
  );
}

