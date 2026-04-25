import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/content";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type ProjectsGridProps = {
  items: Project[];
  locale: Locale;
};

export function ProjectsGrid({ items, locale }: ProjectsGridProps) {
  return (
    <section className="container section" aria-labelledby="projects-title">
      <h2 id="projects-title">{t(locale, "projectsTitle")}</h2>
      <div className="card-grid">
        {items.map((project) => (
          <article key={project.id} className="card">
            <Image
              src={project.image}
              alt={project.title}
              width={640}
              height={420}
              loading="lazy"
              sizes="(max-width: 900px) 100vw, 33vw"
            />
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <Link href={`/${locale}/projects/${project.slug}`} className="inline-link">
              {t(locale, "projectViewDetails")}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
