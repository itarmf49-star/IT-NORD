import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

export async function requireStaff(locale: Locale) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "EDITOR")) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  return session;
}
