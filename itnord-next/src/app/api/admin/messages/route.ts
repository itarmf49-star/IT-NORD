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
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[api/admin/messages GET]", e);
    return databaseUnavailableResponse();
  }
}
