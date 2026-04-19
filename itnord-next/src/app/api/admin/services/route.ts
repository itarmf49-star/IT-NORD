import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staff-api";

export const runtime = "nodejs";

export async function GET() {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const [products, rules] = await Promise.all([
    prisma.serviceProduct.findMany({ orderBy: { title: "asc" }, take: 500 }),
    prisma.pricingRule.findMany({ orderBy: [{ priority: "desc" }, { name: "asc" }], take: 500 }),
  ]);

  return NextResponse.json({ products, rules });
}
