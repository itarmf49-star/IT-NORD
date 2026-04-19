import { NextResponse } from "next/server";

type QuoteRequest = {
  name?: string;
  phone?: string;
  service?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as QuoteRequest;

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const service = body.service?.trim();

  if (!name || !phone || !service) {
    return NextResponse.json(
      { error: "name, phone, and service are required" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Quote request accepted",
    },
    { status: 201 },
  );
}
