import { databaseUnavailableResponse } from "@/lib/api-db-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

type RoleInput = "ADMIN" | "EDITOR" | "CUSTOMER";
function isRoleInput(value: unknown): value is RoleInput {
  return value === "ADMIN" || value === "EDITOR" || value === "CUSTOMER";
}

type CreateUserBody = {
  email?: unknown;
  name?: unknown;
  role?: unknown;
};

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(users);
  } catch (e) {
    console.error("[api/users GET]", e);
    return databaseUnavailableResponse();
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { email, name, role } = (body ?? {}) as CreateUserBody;

  if (!isNonEmptyString(email)) {
    return new Response("Email is required", { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: isNonEmptyString(name) ? name.trim() : undefined,
        ...(isRoleInput(role) ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(user, { status: 201 });
  } catch (e) {
    console.error("[api/users POST]", e);
    return databaseUnavailableResponse();
  }
}
