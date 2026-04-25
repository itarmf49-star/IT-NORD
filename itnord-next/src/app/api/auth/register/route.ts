import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimit(`auth:register:${ip}`, 8, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many registration attempts" }, { status: 429 });
  }

  const data = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) return NextResponse.json({ error: "Email already used" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const id = randomUUID();
  const now = new Date().toISOString();

  const { error } = await supabase.from("users").insert({
    id,
    name: parsed.data.name.trim(),
    email,
    password_hash: passwordHash,
    role: "CUSTOMER",
    created_at: now,
    updated_at: now,
  });

  if (error) {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
