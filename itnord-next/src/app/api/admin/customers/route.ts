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
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, email: true, name: true, phone: true, info: true, createdAt: true },
    });

    return NextResponse.json({ customers });
  } catch (e) {
    console.error("[api/admin/customers GET]", e);
    return databaseUnavailableResponse();
  }
}
