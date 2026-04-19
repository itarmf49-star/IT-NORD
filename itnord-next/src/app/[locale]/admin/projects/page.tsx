import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminProjectsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let rows: { id: string; title: string; slug: string; category: string; isPublished: boolean }[] = [];

  try {
    rows = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: { id: true, title: true, slug: true, category: true, isPublished: true },
    });
  } catch {
    rows = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">Projects (CMS)</h1>
      <p className="muted">Published portfolio entries.</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Published</th>
              <th>Public</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{p.isPublished ? "Yes" : "No"}</td>
                <td>
                  <Link className="inline-link" href={`/${locale}/projects#project-${p.slug}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No projects in database.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ fontSize: "0.9rem" }}>
        Tip: seed projects via Prisma Studio or a migration seed script.
      </p>
    </section>
  );
}
