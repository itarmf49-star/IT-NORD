import { NextResponse } from "next/server";

/** Standard JSON body when Prisma / DB is unavailable or misconfigured. */
export function databaseUnavailableResponse() {
  return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
}
