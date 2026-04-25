"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  currency: string;
  postsIncluded: number;
  color: string | null;
  location: string | null;
  isActive: boolean;
};

type PricingRule = {
  id: string;
  name: string;
  priority: number;
  price: number;
  currency: string;
  isActive: boolean;
};

export function AdminServicesEditor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);

  const [newProduct, setNewProduct] = useState({
    slug: "",
    title: "",
    description: "",
    basePrice: 0,
    currency: "MRU",
    postsIncluded: 0,
    color: "",
    location: "",
    isActive: true,
  });

  const [newRule, setNewRule] = useState({
    name: "",
    priority: 0,
    price: 0,
    currency: "MRU",
    isActive: true,
  });

  const productsSorted = useMemo(() => [...products].sort((a, b) => a.title.localeCompare(b.title)), [products]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/services", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return (await r.json()) as { products?: ServiceProduct[]; rules?: PricingRule[] };
      })
      .then((json) => {
        if (cancelled) return;
        setProducts(json.products ?? []);
        setRules(json.rules ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError((e as Error).message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function createProduct() {
    setError(null);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...newProduct,
        basePrice: Number(newProduct.basePrice),
        postsIncluded: Number(newProduct.postsIncluded),
        color: newProduct.color.trim() ? newProduct.color.trim() : null,
        location: newProduct.location.trim() ? newProduct.location.trim() : null,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = (await res.json()) as { product?: ServiceProduct };
    if (json.product) setProducts((prev) => [json.product!, ...prev]);
    setNewProduct({
      slug: "",
      title: "",
      description: "",
      basePrice: 0,
      currency: "MRU",
      postsIncluded: 0,
      color: "",
      location: "",
      isActive: true,
    });
  }

  async function patchProduct(id: string, patch: Partial<ServiceProduct>) {
    const res = await fetch(`/api/admin/services/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = (await res.json()) as { product?: ServiceProduct };
    if (json.product) setProducts((prev) => prev.map((p) => (p.id === id ? json.product! : p)));
  }

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/admin/services/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function createRule() {
    setError(null);
    const res = await fetch("/api/admin/services/rules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...newRule,
        priority: Number(newRule.priority),
        price: Number(newRule.price),
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = (await res.json()) as { rule?: PricingRule };
    if (json.rule) setRules((prev) => [json.rule!, ...prev]);
    setNewRule({ name: "", priority: 0, price: 0, currency: "MRU", isActive: true });
  }

  async function patchRule(id: string, patch: Partial<PricingRule>) {
    const res = await fetch(`/api/admin/services/rules/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = (await res.json()) as { rule?: PricingRule };
    if (json.rule) setRules((prev) => prev.map((r) => (r.id === id ? json.rule! : r)));
  }

  async function deleteRule(id: string) {
    const res = await fetch(`/api/admin/services/rules/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {error ? (
        <p className="muted" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}

      <div className="admin-card" style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="h2" style={{ fontSize: "1.1rem" }}>
          Service catalog
        </h2>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Title</span>
            <input className="admin-input" value={newProduct.title} onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Slug</span>
            <input className="admin-input" value={newProduct.slug} onChange={(e) => setNewProduct((p) => ({ ...p, slug: e.target.value }))} placeholder="wifi-installation" />
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-label">Description</span>
          <textarea className="admin-textarea" rows={4} value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} />
        </label>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Base price</span>
            <input className="admin-input" type="number" value={newProduct.basePrice} onChange={(e) => setNewProduct((p) => ({ ...p, basePrice: Number(e.target.value) }))} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Currency</span>
            <input className="admin-input" value={newProduct.currency} onChange={(e) => setNewProduct((p) => ({ ...p, currency: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Posts included</span>
            <input className="admin-input" type="number" value={newProduct.postsIncluded} onChange={(e) => setNewProduct((p) => ({ ...p, postsIncluded: Number(e.target.value) }))} />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Color</span>
            <input className="admin-input" value={newProduct.color} onChange={(e) => setNewProduct((p) => ({ ...p, color: e.target.value }))} placeholder="#F5C542" />
          </label>
          <label className="admin-field">
            <span className="admin-label">Location</span>
            <input className="admin-input" value={newProduct.location} onChange={(e) => setNewProduct((p) => ({ ...p, location: e.target.value }))} placeholder="Nouakchott" />
          </label>
          <label className="admin-field" style={{ alignSelf: "end" }}>
            <span className="admin-label">Active</span>
            <input type="checkbox" checked={newProduct.isActive} onChange={(e) => setNewProduct((p) => ({ ...p, isActive: e.target.checked }))} />
          </label>
        </div>

        <div>
          <button
            className="btn btn-primary btn-md"
            type="button"
            onClick={() => void createProduct().catch((e) => setError((e as Error).message))}
            disabled={!newProduct.title.trim() || !newProduct.slug.trim() || !newProduct.description.trim()}
          >
            Add service
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Price</th>
                <th>Posts</th>
                <th>Color</th>
                <th>Location</th>
                <th>Active</th>
                <th>Save</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {productsSorted.map((p) => (
                <ServiceRow
                  key={p.id}
                  product={p}
                  onSave={(patch) => void patchProduct(p.id, patch).catch((e) => setError((e as Error).message))}
                  onDelete={() => void deleteProduct(p.id).catch((e) => setError((e as Error).message))}
                />
              ))}
              {productsSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted">
                    No services yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card" style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="h2" style={{ fontSize: "1.1rem" }}>
          Pricing rules
        </h2>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Name</span>
            <input className="admin-input" value={newRule.name} onChange={(e) => setNewRule((r) => ({ ...r, name: e.target.value }))} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Priority</span>
            <input className="admin-input" type="number" value={newRule.priority} onChange={(e) => setNewRule((r) => ({ ...r, priority: Number(e.target.value) }))} />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Price</span>
            <input className="admin-input" type="number" value={newRule.price} onChange={(e) => setNewRule((r) => ({ ...r, price: Number(e.target.value) }))} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Currency</span>
            <input className="admin-input" value={newRule.currency} onChange={(e) => setNewRule((r) => ({ ...r, currency: e.target.value }))} />
          </label>
          <label className="admin-field" style={{ alignSelf: "end" }}>
            <span className="admin-label">Active</span>
            <input type="checkbox" checked={newRule.isActive} onChange={(e) => setNewRule((r) => ({ ...r, isActive: e.target.checked }))} />
          </label>
        </div>

        <div>
          <button className="btn btn-primary btn-md" type="button" onClick={() => void createRule().catch((e) => setError((e as Error).message))} disabled={!newRule.name.trim()}>
            Add rule
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Priority</th>
                <th>Price</th>
                <th>Currency</th>
                <th>Active</th>
                <th>Save</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <RuleRow
                  key={r.id}
                  rule={r}
                  onSave={(patch) => void patchRule(r.id, patch).catch((e) => setError((e as Error).message))}
                  onDelete={() => void deleteRule(r.id).catch((e) => setError((e as Error).message))}
                />
              ))}
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">
                    No rules yet.
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

function ServiceRow({
  product,
  onSave,
  onDelete,
}: {
  product: ServiceProduct;
  onSave: (patch: Partial<ServiceProduct>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(product);

  return (
    <tr>
      <td>
        <input className="admin-input" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
      </td>
      <td>
        <input className="admin-input" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} />
      </td>
      <td>
        <input className="admin-input" type="number" value={draft.basePrice} onChange={(e) => setDraft((d) => ({ ...d, basePrice: Number(e.target.value) }))} />
      </td>
      <td>
        <input className="admin-input" type="number" value={draft.postsIncluded} onChange={(e) => setDraft((d) => ({ ...d, postsIncluded: Number(e.target.value) }))} />
      </td>
      <td>
        <input className="admin-input" value={draft.color ?? ""} onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))} />
      </td>
      <td>
        <input className="admin-input" value={draft.location ?? ""} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} />
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() =>
            onSave({
              title: draft.title.trim(),
              slug: draft.slug.trim(),
              description: draft.description,
              basePrice: Number(draft.basePrice),
              postsIncluded: Number(draft.postsIncluded),
              color: draft.color && draft.color.trim() ? draft.color.trim() : null,
              location: draft.location && draft.location.trim() ? draft.location.trim() : null,
              isActive: draft.isActive,
            })
          }
        >
          Save
        </button>
      </td>
      <td>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
}

function RuleRow({
  rule,
  onSave,
  onDelete,
}: {
  rule: PricingRule;
  onSave: (patch: Partial<PricingRule>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(rule);

  return (
    <tr>
      <td>
        <input className="admin-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
      </td>
      <td>
        <input className="admin-input" type="number" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))} />
      </td>
      <td>
        <input className="admin-input" type="number" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))} />
      </td>
      <td>
        <input className="admin-input" value={draft.currency} onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value }))} />
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() =>
            onSave({
              name: draft.name.trim(),
              priority: Number(draft.priority),
              price: Number(draft.price),
              currency: draft.currency.trim(),
              isActive: draft.isActive,
            })
          }
        >
          Save
        </button>
      </td>
      <td>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
}

