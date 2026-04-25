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

type CreatePortalMessageBody = {
  content?: unknown;
  userId?: unknown;
  isAdmin?: unknown;
};

async function getAuthedUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
}

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const where: Prisma.MessageWhereInput =
      user.role === "ADMIN" ? {} : { userId: user.id };

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(messages);
  } catch (e) {
    console.error("[api/messages GET]", e);
    return databaseUnavailableResponse();
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { content, userId: targetUserId, isAdmin } = (body ?? {}) as CreatePortalMessageBody;

    if (!isNonEmptyString(content)) {
      return new Response("content is required", { status: 400 });
    }

    const messageUserId =
      user.role === "ADMIN" && isNonEmptyString(targetUserId)
        ? targetUserId
        : user.id;

    const message = await prisma.message.create({
      data: {
        userId: messageUserId,
        content: content.trim(),
        isAdmin: user.role === "ADMIN" ? Boolean(isAdmin) : false,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return Response.json(message, { status: 201 });
  } catch (e) {
    console.error("[api/messages POST]", e);
    return databaseUnavailableResponse();
  }
}
