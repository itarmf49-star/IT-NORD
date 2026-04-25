import { AnnouncementTicker } from "@/components/sections/home/announcement-ticker";
import { AutoSlider } from "@/components/sections/home/auto-slider";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { HomeHero } from "@/components/sections/home/hero";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { ServicesGrid } from "@/components/sections/services-grid";
import { projects, services } from "@/lib/content";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  const tickerItemsByLocale: Record<Locale, string[]> = {
    en: [
      "Premium telecom & digital services",
      "Enterprise networks and secure infrastructure",
      "Smart buildings, surveillance, and automation",
      "Fast deployments with modern standards",
    ],
    fr: [
      "Services telecom et numeriques premium",
      "Reseaux entreprise et infrastructure securisee",
      "Batiments intelligents, surveillance et automatisation",
      "Deploiements rapides avec des standards modernes",
    ],
    ar: [
      "خدمات اتصالات ورقمية متميزة",
      "شبكات مؤسسية وبنية تحتية امنة",
      "مبان ذكية ومراقبة واتمتة",
      "تنفيذ سريع بمعايير حديثة",
    ],
  };

  return (
    <>
      <AnnouncementTicker items={tickerItemsByLocale[locale]} ariaLabel={t(locale, "announcementsAriaLabel")} />
      <HomeHero locale={locale} />
      <AutoSlider
        ariaLabel={t(locale, "sliderAriaLabel")}
        eyebrowLabel={t(locale, "sliderEyebrow")}
        navAriaLabel={t(locale, "sliderNavAria")}
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
      <ServicesGrid items={services} locale={locale} />
      <ProjectsGrid items={projects} locale={locale} />
      <ContactCta locale={locale} />
    </>
  );
}

