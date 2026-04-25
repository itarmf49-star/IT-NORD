import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getInvoices } from "@/lib/portal-data";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await getInvoices();
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 750;

  const write = (text: string, size = 12) => {
    page.drawText(text, { x: 48, y, size, font, color: rgb(0.1, 0.12, 0.16) });
    y -= size + 10;
  };

  write("MauriTech — Invoice (Portal)", 18);
  write(`Invoice ID: ${invoice.id}`);
  write(`Date: ${invoice.date}`);
  write(`Status: ${invoice.status}`);
  write(`Amount: ${invoice.amount} ${invoice.currency}`);
  y -= 8;
  write("This is a portal mock PDF.", 12);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=\"invoice-${invoice.id}.pdf\"`,
    },
  });
}

