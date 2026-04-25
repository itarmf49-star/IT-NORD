import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { getStaffSession } from "@/lib/staff-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        translations: true,
        images: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json({ projects });
  } catch (e) {
    console.error("[api/admin/projects GET]", e);
    return databaseUnavailableResponse();
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type TranslationInput = {
  locale: unknown;
  title: unknown;
  description: unknown;
};

type CreateProjectBody = {
  slug?: unknown;
  category?: unknown;
  isPublished?: unknown;
  translations?: unknown;
};

export async function POST(req: Request) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const json = await req.json().catch(() => null);
  if (!json) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const body = json as CreateProjectBody;
  if (!isNonEmptyString(body.slug)) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const translations = Array.isArray(body.translations) ? (body.translations as TranslationInput[]) : [];
  const normalized = translations
    .map((tr) => ({
      locale: typeof tr.locale === "string" ? tr.locale.trim() : "",
      title: typeof tr.title === "string" ? tr.title.trim() : "",
      description: typeof tr.description === "string" ? tr.description.trim() : "",
    }))
    .filter((tr) => tr.locale.length > 0 && tr.title.length > 0 && tr.description.length > 0);

  const locales = new Set(normalized.map((t) => t.locale));
  if (!locales.has("en") || !locales.has("fr") || !locales.has("ar")) {
    return NextResponse.json({ error: "translations must include en, fr, ar" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        slug: body.slug.trim(),
        category: isNonEmptyString(body.category) ? body.category.trim() : null,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
        // Legacy fields for compatibility: seed from EN translation.
        title: normalized.find((t) => t.locale === "en")?.title ?? null,
        description: normalized.find((t) => t.locale === "en")?.description ?? null,
        translations: {
          create: normalized.map((t) => ({
            locale: t.locale,
            title: t.title,
            description: t.description,
          })),
        },
      },
      include: { translations: true, images: true },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (e) {
    console.error("[api/admin/projects POST]", e);
    return databaseUnavailableResponse();
  }
}
