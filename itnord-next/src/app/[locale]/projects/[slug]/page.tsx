import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { VideoEmbed } from "@/components/sections/video-embed";
import { defaultLocale, isLocale, localePath, locales, t, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { ProjectImage, ProjectTranslation } from "@prisma/client";

export const dynamic = "force-dynamic";

const projectMetaInclude = { translations: true } satisfies Prisma.ProjectInclude;
type ProjectMetaPayload = Prisma.ProjectGetPayload<{ include: typeof projectMetaInclude }>;

const projectDetailInclude = {
  translations: true,
  images: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.ProjectInclude;
type ProjectDetailPayload = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

type ProjectPageProps = {
  params: { locale: string; slug: string };
};

export async function generateStaticParams() {
  try {
    const slugs = await prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true },
      take: 500,
    });
    return locales.flatMap((locale) => slugs.map((p: { slug: string }) => ({ locale, slug: p.slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug, locale: raw } = params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  try {
    const project: ProjectMetaPayload | null = await prisma.project.findUnique({
      where: { slug },
      include: projectMetaInclude,
    });

    if (!project) {
      return { title: t(locale, "project.notFound") };
    }

    const tr =
      (project.translations as ProjectTranslation[]).find((x: ProjectTranslation) => x.locale === locale) ??
      (project.translations as ProjectTranslation[]).find((x: ProjectTranslation) => x.locale === "en") ??
      null;

    return {
      title: tr?.title ?? project.title ?? project.slug,
      description: tr?.description ?? project.description ?? "",
    };
  } catch {
    return { title: t(locale, "navProjects"), description: t(locale, "metaDescription") };
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug, locale: raw } = params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  let project: ProjectDetailPayload | null;
  try {
    project = await prisma.project.findUnique({
      where: { slug },
      include: projectDetailInclude,
    });
  } catch {
    project = null;
  }

  if (!project) {
    return (
      <article className="container section">
        <h1 className="h1">{t(locale, "project.notFound")}</h1>
        <p className="muted">{t(locale, "project.notFoundHint")}</p>
        <p>
          <Link className="inline-link" href={localePath(locale, "/")}>
            {t(locale, "common.backToHome")}
          </Link>
        </p>
      </article>
    );
  }

  const tr =
    (project.translations as ProjectTranslation[]).find((x: ProjectTranslation) => x.locale === locale) ??
    (project.translations as ProjectTranslation[]).find((x: ProjectTranslation) => x.locale === "en") ??
    null;

  const title = tr?.title ?? project.title ?? project.slug;
  const description = tr?.description ?? project.description ?? "";
  const galleryImages = (project.images as ProjectImage[]).map((img: ProjectImage) => img.url).filter(Boolean);

  const videoHash = "#project-video";
  const videoHref = `${localePath(locale, `/projects/${project.slug}`)}${videoHash}`;
  const youtubeId = project.videoUrl ?? "";
  const videoThumbnail = youtubeId ? `https://i.ytimg.com/vi_webp/${youtubeId}/maxresdefault.webp` : null;

  return (
    <article className="container section">
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="project-hero">
        <p className="eyebrow">{t(locale, "project.title")}</p>
        <h1 id="project-hero" className="h1">
          {title}
        </h1>
        <p className="muted">{description}</p>

        <div className="hero-actions" style={{ marginTop: "1rem" }}>
          {youtubeId ? (
            <Link className="btn btn-primary btn-md" href={videoHref}>
              {t(locale, "project.playVideo")}
            </Link>
          ) : null}
          <Link className="btn btn-ghost btn-md" href={localePath(locale, "/")}>
            {t(locale, "common.backToHome")}
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="project-gallery" style={{ paddingTop: 0 }}>
        <h2 id="project-gallery" className="h2">
          {t(locale, "project.gallery")}
        </h2>
        <div className="card-grid">
          {galleryImages.map((src) => (
            <div key={src} className="card">
              <Image
                src={src}
                alt={title}
                width={1200}
                height={700}
                priority={false}
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          ))}
          {videoThumbnail ? (
            <div className="card">
              <Image
                src={videoThumbnail}
                alt={`${t(locale, "project.videoAlt")}: ${title}`}
                width={1200}
                height={700}
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="project-content" style={{ paddingTop: 0 }}>
        <h2 id="project-content" className="h2">
          {t(locale, "project.description")}
        </h2>
        <p className="muted">{description}</p>
      </section>

      <section className="section" aria-labelledby="project-video" style={{ paddingTop: 0 }}>
        {youtubeId ? (
          <>
            <h2 id="project-video" className="h2">
              {t(locale, "projectVideo")}
            </h2>
            <VideoEmbed videoId={youtubeId} title={title} locale={locale} />
          </>
        ) : null}
      </section>
    </article>
  );
}

