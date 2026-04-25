import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function isAccelerateUrl(url: string): boolean {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

function isDirectPostgresUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.startsWith("postgres://") || u.startsWith("postgresql://");
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (isAccelerateUrl(url)) {
    return new PrismaClient({
      accelerateUrl: url,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  if (isDirectPostgresUrl(url)) {
    const adapter = new PrismaPg(url);
    return new PrismaClient({ adapter });
  }

  throw new Error(
    "DATABASE_URL must be a PostgreSQL URL (postgres://, postgresql://) or Prisma Accelerate (prisma://, prisma+postgres://).",
  );
}

export type PrismaClientSingleton = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  __mauritech_prisma?: PrismaClientSingleton;
};

/**
 * Returns a singleton Prisma client. Only call from request handlers / server
 * code paths that run at runtime—never at module top level.
 */
export function getPrisma(): PrismaClientSingleton {
  const existing = globalForPrisma.__mauritech_prisma;
  if (existing) return existing;
  const client = createPrismaClient();
  globalForPrisma.__mauritech_prisma = client;
  return client;
}

/**
 * Lazy Prisma proxy: importing this module does not touch the database or read
 * DATABASE_URL. First property access (e.g. prisma.user) creates the client.
 * Safe for Next.js/Vercel build static analysis that loads route modules.
 */
export const prisma = new Proxy({} as PrismaClientSingleton, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
