import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { getStaffSession } from "@/lib/staff-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const { id: projectId } = await params;
  if (!isNonEmptyString(projectId)) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const url = (json as { url?: unknown } | null)?.url;
  if (!isNonEmptyString(url)) return NextResponse.json({ error: "url is required" }, { status: 400 });

  try {
    const image = await prisma.projectImage.create({
      data: { projectId, url: url.trim() },
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (e) {
    console.error("[api/admin/projects/[id]/images POST]", e);
    return databaseUnavailableResponse();
  }
}

