import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/content";

type ProjectsGridProps = {
  items: Project[];
};

export function ProjectsGrid({ items }: ProjectsGridProps) {
  return (
    <section className="container section" aria-labelledby="projects-title">
      <h2 id="projects-title">Recent Projects</h2>
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
            <Link href={`/projects/${project.slug}`} className="inline-link">
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
