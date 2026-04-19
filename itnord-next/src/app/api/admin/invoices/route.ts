import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staff-api";

export const runtime = "nodejs";

const ItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive().max(10_000),
  unitPrice: z.number().int().nonnegative().max(100_000_000),
});

const CreateSchema = z.object({
  userId: z.string().min(1),
  currency: z.string().min(1).max(8).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(ItemSchema).min(1).max(50),
});

export async function GET() {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { id: true, email: true, name: true } }, items: true },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const staff = await getStaffSession();
  if (!staff.ok) return staff.response;

  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  const currency = parsed.data.currency ?? "MRU";
  const items = parsed.data.items.map((it) => {
    const total = it.quantity * it.unitPrice;
    return {
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total,
    };
  });
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const tax = 0;
  const total = subtotal + tax;

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      currency,
      subtotal,
      tax,
      total,
      status: "SENT",
      notes: parsed.data.notes,
      items: { create: items },
    },
    include: { items: true },
  });

  try {
    await prisma.auditLog.create({
      data: {
        actorId: staff.session.user.id,
        action: "invoice.create",
        metadata: { invoiceId: invoice.id, userId: user.id },
      },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ invoice }, { status: 201 });
}
