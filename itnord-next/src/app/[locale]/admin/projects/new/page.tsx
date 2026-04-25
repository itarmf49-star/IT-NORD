import Link from "next/link";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { ProjectForm } from "@/components/admin/project-form";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminNewProjectPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <section className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
        <h1 className="h1">{t(locale, "adminProjects")}</h1>
        <Link className="btn btn-ghost btn-md" href={`/${locale}/admin/projects`}>
          {t(locale, "common.backToHome")}
        </Link>
      </div>

      <p className="muted">Create a multilingual project and upload images.</p>
      <ProjectForm locale={locale as "en" | "fr" | "ar"} />
    </section>
  );
}

