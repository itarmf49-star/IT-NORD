import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProjectBySlug, projects } from "@/lib/content";
import { VideoEmbed } from "@/components/sections/video-embed";

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="container section">
      <h1 className="h1">{project.title}</h1>
      <p className="muted">{project.description}</p>
      <Image
        src={project.image}
        alt={project.title}
        width={1200}
        height={700}
        priority
        sizes="(max-width: 1200px) 100vw, 1200px"
      />
      <section aria-labelledby="project-video">
        <h2 id="project-video" className="h2">
          Project Video
        </h2>
        <VideoEmbed videoId={project.youtubeId} title={project.title} />
      </section>
    </article>
  );
}

