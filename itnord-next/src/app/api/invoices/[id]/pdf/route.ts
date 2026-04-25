import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
    });

    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = invoice.userId === session.user.id;
    const isStaff = session.user.role === "ADMIN" || session.user.role === "EDITOR";
    if (!isOwner && !isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 750;
    const write = (text: string, size = 12) => {
      page.drawText(text, { x: 48, y, size, font, color: rgb(0.1, 0.12, 0.16) });
      y -= size + 8;
    };

    const customerEmail = invoice.user.email ?? invoice.userId;

    write("MauriTech — Invoice", 18);
    write(`Invoice ID: ${invoice.id}`);
    write(`Customer: ${customerEmail}`);
    write(`Status: ${invoice.status}`);
    write(`Total: ${invoice.total} ${invoice.currency}`);
    y -= 6;
    write("Line items:", 12);
    for (const item of invoice.items ?? []) {
      write(
        `- ${item.description} x${item.quantity} @ ${item.unitPrice} = ${item.total}`,
        11,
      );
    }

    const bytes = await pdf.save();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="invoice-${invoice.id}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[api/invoices/[id]/pdf GET]", e);
    return databaseUnavailableResponse();
  }
}
