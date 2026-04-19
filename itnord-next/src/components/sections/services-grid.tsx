import Image from "next/image";
import type { Service } from "@/types/content";

type ServicesGridProps = {
  items: Service[];
};

export function ServicesGrid({ items }: ServicesGridProps) {
  return (
    <section className="container section" aria-labelledby="services-title">
      <h2 id="services-title">Core Services</h2>
      <div className="card-grid">
        {items.map((service) => (
          <article key={service.id} className="card">
            <Image
              src={service.image}
              alt={service.title}
              width={640}
              height={420}
              loading="lazy"
              sizes="(max-width: 900px) 100vw, 33vw"
            />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
