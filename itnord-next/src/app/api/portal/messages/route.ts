import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  subject?: string;
  body?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[api/portal/messages GET]", e);
    return databaseUnavailableResponse();
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = (await req.json().catch(() => ({}))) as Body;
  const subject = json.subject?.trim() || "Customer portal message";
  const body = json.body?.trim();

  if (!body) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }

  const content = `${subject}\n\n${body}`;

  try {
    const created = await prisma.message.create({
      data: {
        userId,
        content,
        isAdmin: false,
      },
    });

    return NextResponse.json({ message: created }, { status: 201 });
  } catch (e) {
    console.error("[api/portal/messages POST]", e);
    return databaseUnavailableResponse();
  }
}
