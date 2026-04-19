import { AnnouncementTicker } from "@/components/sections/home/announcement-ticker";
import { AutoSlider } from "@/components/sections/home/auto-slider";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { HomeHero } from "@/components/sections/home/hero";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { ServicesGrid } from "@/components/sections/services-grid";
import { projects, services } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <AnnouncementTicker
        items={[
          "Premium telecom & digital services",
          "Enterprise networks and secure infrastructure",
          "Smart buildings, surveillance, and automation",
          "Fast deployments with modern standards",
        ]}
      />
      <HomeHero />
      <AutoSlider
        items={[
          {
            id: "slide-1",
            title: "Enterprise Networks",
            description: "Coverage planning, structured cabling, resilient Wi-Fi, and secure segmentation.",
            image: services[0].image,
          },
          {
            id: "slide-2",
            title: "Security & Surveillance",
            description: "HD camera deployments, secure remote access, and proactive monitoring setups.",
            image: services[1].image,
          },
          {
            id: "slide-3",
            title: "Smart Infrastructure",
            description: "Integrated IoT systems for access control, automation, and efficiency.",
            image: services[2].image,
          },
        ]}
      />
      <ServicesGrid items={services} />
      <ProjectsGrid items={projects} />
      <ContactCta />
    </>
  );
}

