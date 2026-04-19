import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

  const { serviceSlug, quantity } = parsed.data;

  const service = await prisma.serviceProduct.findFirst({
    where: { slug: serviceSlug, isActive: true },
  });
  if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 404 });

  const rules = await prisma.pricingRule.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  let unitPrice = service.basePrice;
  let currency = service.currency;

  for (const rule of rules) {
    const match = rule.match as RuleMatch;
    if (!ruleApplies(match, quantity)) continue;

    if (match.kind === "qtyGte") {
      if (typeof match.price === "number") unitPrice = match.price;
      if (typeof match.discountPercent === "number") {
        unitPrice = Math.round(unitPrice * (1 - match.discountPercent / 100));
      }
      currency = rule.currency;
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
