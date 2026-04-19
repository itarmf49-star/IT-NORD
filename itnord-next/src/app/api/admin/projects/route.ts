import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staff-api";

export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ projects });
}
