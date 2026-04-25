import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const BodySchema = z.object({
  serviceSlug: z.string().min(1),
  quantity: z.number().int().positive().max(10_000),
});

type RuleMatch =
  | { kind: "always" }
  | { kind: "qtyGte"; min: number; price?: number; discountPercent?: number };

function ruleApplies(match: RuleMatch, quantity: number) {
  if (match.kind === "always") return true;
  if (match.kind === "qtyGte") return quantity >= match.min;
  return false;
}

export async function POST(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimit(`pricing:quote:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { serviceSlug, quantity } = parsed.data;

  const { data: service, error: sErr } = await supabase
    .from("service_products")
    .select("*")
    .eq("slug", serviceSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (sErr || !service) return NextResponse.json({ error: "Unknown service" }, { status: 404 });

  const { data: rulesRaw } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const rules = rulesRaw ?? [];

  let unitPrice = service.base_price as number;
  let currency = service.currency as string;

  for (const rule of rules) {
    const match = rule.match as RuleMatch;
    if (!ruleApplies(match, quantity)) continue;

    if (match.kind === "qtyGte") {
      if (typeof match.price === "number") unitPrice = match.price;
      if (typeof match.discountPercent === "number") {
        unitPrice = Math.round(unitPrice * (1 - match.discountPercent / 100));
      }
      currency = rule.currency as string;
    }

    break;
  }

  const subtotal = unitPrice * quantity;

  return NextResponse.json({
    serviceSlug,
    quantity,
    currency,
    unitPrice,
    subtotal,
  });
}
