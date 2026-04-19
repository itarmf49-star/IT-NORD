import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let rows: { id: string; name: string; email: string | null; subject: string | null; isRead: boolean; createdAt: Date }[] = [];

  try {
    rows = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, subject: true, isRead: true, createdAt: true },
    });
  } catch {
    rows = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Contact messages</h1>
      <p className="muted">Inbound website inquiries.</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Read</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.name}
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {m.email ?? "—"}
                  </div>
                </td>
                <td>{m.subject ?? "—"}</td>
                <td>{m.isRead ? "Yes" : "No"}</td>
                <td>{m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No messages yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
