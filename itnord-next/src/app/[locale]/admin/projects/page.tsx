import Link from "next/link";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminProjectsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  let rows: {
    id: string;
    slug: string;
    category: string | null;
    isPublished: boolean;
    translations: { locale: string; title: string }[];
    images: { url: string }[];
  }[] = [];

  try {
    rows = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        slug: true,
        category: true,
        isPublished: true,
        translations: { select: { locale: true, title: true } },
        images: { select: { url: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    });
  } catch {
    rows = [];
  }

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminProjects")}</h1>
      <p className="muted">{t(locale, "adminPublishedEntries")}</p>

      <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 1rem" }}>
        <Link className="btn btn-primary btn-md" href={`/${locale}/admin/projects/new`}>
          New project
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t(locale, "adminTitle")}</th>
              <th>{t(locale, "adminCategory")}</th>
              <th>{t(locale, "adminPublished")}</th>
              <th>{t(locale, "adminPublic")}</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const title =
                p.translations.find((tr) => tr.locale === locale)?.title ??
                p.translations.find((tr) => tr.locale === "en")?.title ??
                p.slug;
              const thumb = p.images[0]?.url ?? null;

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" style={{ width: 44, height: 32, objectFit: "cover", borderRadius: 6 }} />
                      ) : null}
                      <div>
                        <div>{title}</div>
                        <div className="muted" style={{ fontSize: "0.85rem" }}>
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category ?? "-"}</td>
                  <td>{p.isPublished ? t(locale, "adminYes") : t(locale, "adminNo")}</td>
                  <td>
                    <Link className="inline-link" href={`/${locale}/projects#project-${p.slug}`}>
                      {t(locale, "adminView")}
                    </Link>
                  </td>
                  <td>
                    <Link className="inline-link" href={`/${locale}/admin/projects/${p.id}/edit`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {t(locale, "adminNoProjects")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ fontSize: "0.9rem" }}>
        {t(locale, "adminSeedTip")}
      </p>
    </section>
  );
}
