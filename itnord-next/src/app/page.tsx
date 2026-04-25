import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default async function RootPage() {
  // Beginner-friendly health check against local API route.
  await fetch("/api/health", { cache: "no-store" }).catch(() => null);
  redirect(`/${defaultLocale}`);
}
