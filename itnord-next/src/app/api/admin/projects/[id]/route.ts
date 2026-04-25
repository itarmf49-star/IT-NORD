import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { getStaffSession } from "@/lib/staff-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type TranslationInput = {
  locale: unknown;
  title: unknown;
  description: unknown;
};

type UpdateProjectBody = {
  slug?: unknown;
  category?: unknown;
  isPublished?: unknown;
  translations?: unknown;
};

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const { id } = await params;
  if (!isNonEmptyString(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const json = await req.json().catch(() => null);
  if (!json) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const body = json as UpdateProjectBody;

  const translations = Array.isArray(body.translations) ? (body.translations as TranslationInput[]) : [];
  const normalized = translations
    .map((tr) => ({
      locale: typeof tr.locale === "string" ? tr.locale.trim() : "",
      title: typeof tr.title === "string" ? tr.title.trim() : "",
      description: typeof tr.description === "string" ? tr.description.trim() : "",
    }))
    .filter((tr) => tr.locale.length > 0 && tr.title.length > 0 && tr.description.length > 0);

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        slug: isNonEmptyString(body.slug) ? body.slug.trim() : undefined,
        category: isNonEmptyString(body.category) ? body.category.trim() : undefined,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : undefined,
        // Legacy fields: keep synced with EN translation if provided.
        ...(normalized.some((t) => t.locale === "en")
          ? {
              title: normalized.find((t) => t.locale === "en")!.title,
              description: normalized.find((t) => t.locale === "en")!.description,
            }
          : {}),
        translations: normalized.length
          ? {
              upsert: normalized.map((t) => ({
                where: { projectId_locale: { projectId: id, locale: t.locale } },
                create: { locale: t.locale, title: t.title, description: t.description },
                update: { title: t.title, description: t.description },
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
        images: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ project });
  } catch (e) {
    console.error("[api/admin/projects/[id] PUT]", e);
    return databaseUnavailableResponse();
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const { id } = await params;
  if (!isNonEmptyString(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/projects/[id] DELETE]", e);
    return databaseUnavailableResponse();
  }
}

