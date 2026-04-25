import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const BodySchema = z.object({
  areaSqm: z.number().int().min(1).max(200_000),
  floors: z.number().int().min(1).max(80),
  wallLossDb: z.number().int().min(0).max(40),
  recommendedAps: z.number().int().min(1).max(256),
  recommendedSwitches: z.number().int().min(1).max(256),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = `coverage:get:${session.user.id}`;
  if (!rateLimit(key, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data: plans, error } = await supabase
    .from("coverage_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (plans ?? []).map((p) => ({
    id: p.id,
    areaSqm: p.area_sqm,
    floors: p.floors,
    wallLossDb: p.wall_loss_db,
    recommendedAps: p.recommended_aps,
    recommendedSwitches: p.recommended_switches,
    createdAt: p.created_at,
  }));

  return NextResponse.json({ plans: mapped });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ipKey = clientKeyFromRequest(req);
  if (!rateLimit(`coverage:post:${ipKey}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const row = {
    id: randomUUID(),
    user_id: session.user.id,
    area_sqm: parsed.data.areaSqm,
    floors: parsed.data.floors,
    wall_loss_db: parsed.data.wallLossDb,
    recommended_aps: parsed.data.recommendedAps,
    recommended_switches: parsed.data.recommendedSwitches,
  };

  const { data: plan, error } = await supabase.from("coverage_plans").insert(row).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan }, { status: 201 });
}
