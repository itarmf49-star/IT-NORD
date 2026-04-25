import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const account = await prisma.clientAccount.findFirst({
      where: { userId },
      select: { id: true, company: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const accountWhere = account ? { accountId: account.id } : { account: { userId } };

    const [totalInvoices, paidInvoices, pendingInvoices, recentInvoices, lastMessage] = await Promise.all([
      prisma.invoice.count({ where: accountWhere }),
      prisma.invoice.count({ where: { ...accountWhere, status: "paid" } }),
      prisma.invoice.count({ where: { ...accountWhere, NOT: { status: "paid" } } }),
      prisma.invoice.findMany({
        where: accountWhere,
        take: 5,
        orderBy: { issuedAt: "desc" },
        include: {
          items: true,
          account: true,
        },
      }),
      prisma.message.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      recentInvoices,
      lastMessage,
    });
  } catch (e) {
    console.error("[api/portal/dashboard GET]", e);
    return databaseUnavailableResponse();
  }
}
