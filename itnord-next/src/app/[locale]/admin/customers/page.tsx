import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let customers: { id: string; email: string | null; name: string | null; createdAt: Date }[] = [];

  try {
    customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, email: true, name: true, createdAt: true },
    });
  } catch {
    customers = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Customers</h1>
      <p className="muted">Registered customer accounts.</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name ?? "—"}</td>
                <td>{c.email ?? "—"}</td>
                <td>{c.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="muted">
                  No customers found (database may be empty).
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
