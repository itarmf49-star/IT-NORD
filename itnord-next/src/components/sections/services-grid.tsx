import type { Service } from "@/types/content";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type ServicesGridProps = {
  items: Service[];
  locale: Locale;
};

export function ServicesGrid({ items, locale }: ServicesGridProps) {
  return (
    <section className="container mx-auto px-6 py-20" aria-labelledby="services-title">
      
      {/* Title */}
      <div className="text-center mb-16">
        <h2 id="services-title" className="text-4xl font-bold text-white">
          {t(locale, "servicesTitle")}
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Advanced infrastructure, smart systems, and enterprise-grade engineering.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div
            key={item.id ?? i}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="text-sm text-gray-400">#{i + 1}</div>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-gray-300">{item.description}</p>
          </div>
        ))}
      </div>

    </section>
  );
}