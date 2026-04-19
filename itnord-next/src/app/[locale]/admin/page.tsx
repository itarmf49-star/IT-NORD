import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    customers: 0,
    messages: 0,
    projects: 0,
    invoices: 0,
    pageViews24h: 0,
  };

  try {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const [customers, messages, projects, invoices, pageViews24h] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.message.count(),
      prisma.project.count(),
      prisma.invoice.count(),
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    ]);

    stats = { customers, messages, projects, invoices, pageViews24h };
  } catch {
    // Database may be unavailable in some environments; keep UI usable.
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Operations overview</h1>
      <p className="muted">Live metrics from PostgreSQL via Prisma.</p>

      <div className="admin-kpis">
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            Customers
          </p>
          <strong>{stats.customers}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            Contact messages
          </p>
          <strong>{stats.messages}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            CMS projects
          </p>
          <strong>{stats.projects}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            Invoices
          </p>
          <strong>{stats.invoices}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            Traffic (24h)
          </p>
          <strong>{stats.pageViews24h}</strong>
        </div>
      </div>
    </section>
  );
}
