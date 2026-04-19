import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  let products: { id: string; slug: string; title: string; basePrice: number; currency: string; isActive: boolean }[] = [];
  let rules: { id: string; name: string; priority: number; price: number; isActive: boolean }[] = [];

  try {
    const [p, r] = await Promise.all([
      prisma.serviceProduct.findMany({
        orderBy: { title: "asc" },
        take: 200,
        select: { id: true, slug: true, title: true, basePrice: true, currency: true, isActive: true },
      }),
      prisma.pricingRule.findMany({
        orderBy: [{ priority: "desc" }, { name: "asc" }],
        take: 200,
        select: { id: true, name: true, priority: true, price: true, isActive: true },
      }),
    ]);
    products = p;
    rules = r;
  } catch {
    products = [];
    rules = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Services & pricing</h1>
      <p className="muted">Catalog items and active pricing rules.</p>

      <h2 className="h2" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        Service catalog
      </h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Base price</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {products.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.slug}</td>
                <td>
                  {s.basePrice} {s.currency}
                </td>
                <td>{s.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No services yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <h2 className="h2" style={{ fontSize: "1.1rem", margin: "1.25rem 0 0.5rem" }}>
        Pricing rules
      </h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>Price hint</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.priority}</td>
                <td>{r.price}</td>
                <td>{r.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
            {rules.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No pricing rules yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
