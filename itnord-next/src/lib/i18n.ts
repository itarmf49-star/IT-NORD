export type Locale = "en" | "fr" | "ar";

export const locales: Locale[] = ["en", "fr", "ar"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

type Dictionary = Record<string, string>;

const dict: Record<Locale, Dictionary> = {
  en: {
    navHome: "Home",
    navProjects: "Projects",
    navQuote: "Get a quote",
  },
  fr: {
    navHome: "Accueil",
    navProjects: "Projets",
    navQuote: "Demander un devis",
  },
  ar: {
    navHome: "الرئيسية",
    navProjects: "المشاريع",
    navQuote: "اطلب عرض سعر",
  },
};

export function t(locale: Locale, key: keyof (typeof dict)["en"]) {
  return dict[locale][key] ?? dict.en[key];
}

