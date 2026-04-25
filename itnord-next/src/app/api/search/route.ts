import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function uniqById<T extends { id: string }>(rows: T[]) {
  const m = new Map<string, T>();
  for (const r of rows) m.set(r.id, r);
  return [...m.values()];
}

export async function GET(req: Request) {
  const ip = clientKeyFromRequest(req);
  if (!rateLimit(`search:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const [titleServices, descServices, titleProjects, descProjects, catProjects] = await Promise.all([
    supabase
      .from("service_products")
      .select("id, slug, title, base_price, currency")
      .eq("is_active", true)
      .ilike("title", pattern)
      .limit(10),
    supabase
      .from("service_products")
      .select("id, slug, title, base_price, currency")
      .eq("is_active", true)
      .ilike("description", pattern)
      .limit(10),
    supabase.from("projects").select("id, slug, title, category").ilike("title", pattern).limit(10),
    supabase.from("projects").select("id, slug, title, category").ilike("description", pattern).limit(10),
    supabase.from("projects").select("id, slug, title, category").ilike("category", pattern).limit(10),
  ]);

  const services = uniqById([
    ...(titleServices.data ?? []),
    ...(descServices.data ?? []),
  ]).slice(0, 10);

  const projects = uniqById([
    ...(titleProjects.data ?? []),
    ...(descProjects.data ?? []),
    ...(catProjects.data ?? []),
  ]).slice(0, 10);

  return NextResponse.json({
    results: [
      ...services.map((s) => ({
        type: "service" as const,
        id: s.id,
        title: s.title,
        subtitle: `${s.base_price} ${s.currency}`,
        href: `#service-${s.slug}`,
      })),
      ...projects.map((p) => ({
        type: "project" as const,
        id: p.id,
        title: p.title,
        subtitle: p.category,
        href: `#project-${p.slug}`,
      })),
    ],
  });
}
