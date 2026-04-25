import type { Project, Service, Testimonial } from "@/types/content";

export const siteConfig = {
  name: "MauriTech",
  siteUrl: "https://mauritech.example.com",
  title: "MauriTech | Smart Infrastructure and Security Solutions",
  description:
    "Professional technology services in Mauritania: networks, surveillance, smart building automation, and secure server infrastructure.",
  phone: "+22247774141",
  email: "itnord@outlook.fr",
};

export const services: Service[] = [
  {
    id: "networks",
    title: "Network Engineering",
    description: "Enterprise-grade Wi-Fi and structured cabling with full coverage planning.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
  },
  {
    id: "security",
    title: "Surveillance & Security",
    description: "High-definition cameras, secure remote access, and proactive monitoring.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200",
  },
  {
    id: "automation",
    title: "Smart Building Automation",
    description: "Integrated IoT controls for lighting, access, and energy optimization.",
    image: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200",
  },
];

export const projects: Project[] = [
  {
    id: "1",
    slug: "secure-campus-network",
    title: "Secure Campus Network Upgrade",
    category: "Networks",
    description: "End-to-end redesign with VLAN segmentation, managed switches, and resilient Wi-Fi mesh.",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1400",
    youtubeId: "n2v0Jv7pRp8",
  },
  {
    id: "2",
    slug: "industrial-surveillance-rollout",
    title: "Industrial Surveillance Rollout",
    category: "Security",
    description: "A 24/7 multi-zone CCTV deployment with encrypted remote access and alerts.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400",
    youtubeId: "D6Ac5JpCHmI",
  },
  {
    id: "3",
    slug: "smart-office-automation",
    title: "Smart Office Automation",
    category: "Smart Buildings",
    description: "Unified control for entry points, lighting scenes, and occupancy-driven HVAC.",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1400",
    youtubeId: "8pDqJVdNa44",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ahmed Mohamed",
    role: "Operations Manager",
    quote: "MauriTech delivered a stable infrastructure with excellent execution quality.",
  },
  {
    id: "2",
    name: "Sara Aldakhil",
    role: "Facility Director",
    quote: "The team modernized our security stack without downtime and with clear documentation.",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
