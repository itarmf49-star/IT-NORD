import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ data, count: data.length }, { status: 200 });
  } catch (e) {
    console.error("[api/projects GET]", e);
    return databaseUnavailableResponse();
  }
}
