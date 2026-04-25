import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { ProjectTranslation } from "@prisma/client";

export const dynamic = "force-dynamic";

const projectsListInclude = {
  translations: true,
  images: { orderBy: { createdAt: "desc" as const }, take: 1 },
} satisfies Prisma.ProjectInclude;

type ProjectListRow = Prisma.ProjectGetPayload<{ include: typeof projectsListInclude }>;

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  return {
    title: t(locale, "navProjects"),
    description: t(locale, "metaDescription"),
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let rows: ProjectListRow[] = [];
  try {
    rows = await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      include: projectsListInclude,
      take: 200,
    });
  } catch {
    rows = [];
  }

  const items = rows.map(
    (p: ProjectListRow) => {
    const tr =
      p.translations.find((x: ProjectTranslation) => x.locale === locale) ??
      p.translations.find((x: ProjectTranslation) => x.locale === "en") ??
      null;
    return {
      id: p.id,
      slug: p.slug,
      title: tr?.title ?? p.title ?? p.slug,
      description: tr?.description ?? p.description ?? "",
      image: p.images[0]?.url ?? p.imageUrl ?? "/images/hero-en.svg",
      youtubeId: p.videoUrl ?? "",
      category: p.category ?? "project",
    };
  });

  return (
    <>
      <section className="container section">
        <h1 className="h1">{t(locale, "navProjects")}</h1>
        <p className="muted">{t(locale, "metaDescription")}</p>
      </section>
      <ProjectsGrid items={items} locale={locale} />
    </>
  );
}

