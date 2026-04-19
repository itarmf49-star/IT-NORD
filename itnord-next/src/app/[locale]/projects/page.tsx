import type { Metadata } from "next";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse IT NORD projects in networking, security, and smart infrastructure.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="container section">
        <h1 className="h1">Projects</h1>
        <p className="muted">Detailed case studies from our completed and ongoing technical deployments.</p>
      </section>
      <ProjectsGrid items={projects} />
    </>
  );
}

