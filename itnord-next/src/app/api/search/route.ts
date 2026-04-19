import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimit(`search:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const [services, projects] = await Promise.all([
    prisma.serviceProduct.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    results: [
      ...services.map((s) => ({
        type: "service" as const,
        id: s.id,
        title: s.title,
        subtitle: `${s.basePrice} ${s.currency}`,
        href: `#service-${s.slug}`,
      })),
      ...projects.map((p) => ({
        type: "project" as const,
        id: p.id,
        title: p.title,
        subtitle: p.category,
        href: `#project-${p.slug}`,
      })),
    ],
  });
}
