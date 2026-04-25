import { getServerSession } from "next-auth/next";
import type { Role } from "@/types/role";
import { authOptions } from "@/lib/auth";

export async function requireRole(roles: Role[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user?.id || !role || !roles.includes(role)) {
    return null;
  }
  return session;
}
