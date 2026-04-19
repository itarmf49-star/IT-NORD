import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultLocale, isLocale } from "@/lib/i18n";

const adminPaths = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Locale prefix extraction
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const locale = first && isLocale(first) ? first : defaultLocale;

  const isAdminRoute =
    pathname.startsWith(`/${locale}/admin`) ||
    adminPaths.some((p) => pathname.startsWith(p));

  const isPortalRoute = pathname.includes("/portal");

  if (isAdminRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = token?.role;
    if (!token || (role !== "ADMIN" && role !== "EDITOR")) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isPortalRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/:locale/admin/:path*", "/:locale/portal/:path*", "/:locale/portal"],
};

