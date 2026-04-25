import { NextResponse } from "next/server";
import { addSimpleData, readSimpleData } from "@/lib/simple-db";

type Body = {
  name?: string;
};

export async function GET() {
  const data = await readSimpleData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const created = await addSimpleData(name);
  return NextResponse.json(created, { status: 201 });
}
