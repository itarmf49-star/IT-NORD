import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { defaultLocale, getDirection, isLocale, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/content";
import { FiberNetworkBackground } from "@/components/three/FiberNetworkBackground";
import { AppProviders } from "@/components/providers/app-providers";
import { ChatDock } from "@/components/chat/chat-dock";
import { AiAssistant } from "@/components/chat/ai-assistant";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
  },
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={inter.variable}>
      <body>
        <FiberNetworkBackground />
        <AppProviders>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <SiteHeader locale={locale} />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <ChatDock />
          <AiAssistant />
        </AppProviders>
      </body>
    </html>
  );
}

