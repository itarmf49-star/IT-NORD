import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

type CreateInvoiceItemInput = { title: unknown; price: unknown };
type CreatePortalInvoiceBody = {
  userId?: unknown;
  company?: unknown;
  amount?: unknown;
  status?: unknown;
  items?: unknown;
  requestNote?: unknown;
};

async function getAuthedUserEmail() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return email.toLowerCase();
}

export async function GET() {
  const email = await getAuthedUserEmail();
  if (!email) return new Response("Unauthorized", { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user) return new Response("Unauthorized", { status: 401 });

    const where: Prisma.InvoiceWhereInput =
      user.role === "ADMIN"
        ? {}
        : { account: { userId: user.id } };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
        account: true,
      },
      orderBy: { issuedAt: "desc" },
    });

    return Response.json(invoices);
  } catch (e) {
    console.error("[api/invoices GET]", e);
    return databaseUnavailableResponse();
  }
}

export async function POST(req: Request) {
  const email = await getAuthedUserEmail();
  if (!email) return new Response("Unauthorized", { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user) return new Response("Unauthorized", { status: 401 });
    if (user.role !== "ADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { userId, company, amount, status, items, requestNote } = (body ?? {}) as CreatePortalInvoiceBody;

    if (!isNonEmptyString(userId)) return new Response("userId is required", { status: 400 });
    if (!isFiniteNumber(amount) || amount <= 0) return new Response("amount must be > 0", { status: 400 });
    if (status != null && !isNonEmptyString(status)) return new Response("status must be a string", { status: 400 });
    if (items != null && !Array.isArray(items)) return new Response("items must be an array", { status: 400 });

    const clientAccount = await prisma.clientAccount.upsert({
      where: { userId },
      update: {
        company: isNonEmptyString(company) ? company.trim() : undefined,
      },
      create: {
        userId,
        company: isNonEmptyString(company) ? company.trim() : undefined,
      },
      select: { id: true },
    });

    const safeItems: { title: string; price: number }[] = Array.isArray(items)
      ? (items as CreateInvoiceItemInput[])
          .map((it) => ({
            title: typeof it.title === "string" ? it.title.trim() : "",
            price: typeof it.price === "number" ? it.price : Number.NaN,
          }))
          .filter((it) => it.title.length > 0 && Number.isFinite(it.price) && it.price >= 0)
      : [];

    const invoice = await prisma.invoice.create({
      data: {
        accountId: clientAccount.id,
        amount,
        status: isNonEmptyString(status) ? status.trim() : undefined,
        items: {
          create: safeItems,
        },
      },
      include: {
        items: true,
        account: true,
      },
    });

    if (isNonEmptyString(requestNote)) {
      await prisma.message.create({
        data: {
          userId,
          content: `Invoice created: ${invoice.id}\n\nRequest update:\n${requestNote.trim()}`,
          isAdmin: true,
        },
      });
    }

    return Response.json(invoice, { status: 201 });
  } catch (e) {
    console.error("[api/invoices POST]", e);
    return databaseUnavailableResponse();
  }
}
