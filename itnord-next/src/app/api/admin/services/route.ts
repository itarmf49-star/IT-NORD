import { NextResponse } from "next/server";
import { z } from "zod";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { getStaffSession } from "@/lib/staff-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CreateProductSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(20_000),
  basePrice: z.number().int().nonnegative().max(100_000_000),
  currency: z.string().trim().min(1).max(8).optional(),
  postsIncluded: z.number().int().nonnegative().max(1_000_000).optional(),
  color: z.string().trim().max(60).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  try {
    const [products, rules] = await Promise.all([
      prisma.serviceProduct.findMany({ orderBy: { title: "asc" }, take: 500 }),
      prisma.pricingRule.findMany({ orderBy: [{ priority: "desc" }, { name: "asc" }], take: 500 }),
    ]);

    return NextResponse.json({ products, rules });
  } catch (e) {
    console.error("[api/admin/services GET]", e);
    return databaseUnavailableResponse();
  }
}

export async function POST(req: Request) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const json = await req.json().catch(() => null);
  const parsed = CreateProductSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const created = await prisma.serviceProduct.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        basePrice: parsed.data.basePrice,
        currency: parsed.data.currency ?? "MRU",
        postsIncluded: parsed.data.postsIncluded ?? 0,
        color: parsed.data.color ?? null,
        location: parsed.data.location ?? null,
        isActive: parsed.data.isActive ?? true,
      },
    });

    await prisma.auditLog.create({
      data: { actorId: staff.session.user.id, action: "serviceProduct.create", metadata: { id: created.id } },
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (e) {
    console.error("[api/admin/services POST]", e);
    return databaseUnavailableResponse();
  }
}
